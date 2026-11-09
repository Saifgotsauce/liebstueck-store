// End-to-end test against local mock Stripe + Printful APIs. No real accounts needed.
//   npm run test:e2e
// Flow: printful:sync → build → checkout → signed Stripe webhook → Printful order →
// print file download → duplicate webhook (idempotency) → withdrawal → order summary.
import { spawn, execSync, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import Stripe from 'stripe';
import { Resvg } from '@resvg/resvg-js';

const ROOT = process.cwd();
const MOCK_PORT = 4010;
const APP_PORT = 3100;
const WEBHOOK_SECRET = 'whsec_test_secret';
const VARIANTS = path.join(ROOT, 'data', 'printful-variants.json');
const MOCKUPS = path.join(ROOT, 'data', 'printful-mockups.json');
const MOCKUP_DIR = path.join(ROOT, 'public', 'mockups');

let failures = 0;
const ok = (cond: unknown, msg: string) => {
  console.log(`${cond ? '  ✓' : '  ✗'} ${msg}`);
  if (!cond) failures++;
};

// ── Mock APIs ─────────────────────────────────────────────────────────────────
const state = {
  sessions: [] as URLSearchParams[], // one per created Checkout Session (cs_test_s1, cs_test_s2, …)
  printfulOrders: [] as Record<string, unknown>[],
  createOrderCalls: 0,
  emails: [] as { to: string[]; subject: string; html: string }[],
  mockupTasks: [] as { body: Record<string, unknown>; printFileStatus: number }[],
};

// Fake "photos" for the mock Printful: a garment on grey (background) and a soft shadow layer (overlay).
const COLOR_HEX: Record<string, string> = { Navy: '#1F2A44', White: '#FFFFFF', Black: '#1B1B1D', Maroon: '#5A1E2A', Forest: '#253B2F', 'Forest Green': '#253B2F', 'Athletic Heather': '#BDBCB8', 'Sport Grey': '#B7B7B3' };
function png(svg: string) {
  return new Resvg(svg).render().asPng();
}
const TEE_PATH = 'M380 120 C420 175 580 175 620 120 L790 160 L950 340 L860 430 L770 370 L775 960 L225 960 L230 370 L140 430 L50 340 L210 160 Z';
const fakeBg = (hex: string) => png(`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000"><rect width="1000" height="1000" fill="#EDEDED"/><path d="${TEE_PATH}" fill="${hex}"/></svg>`);
const fakeOverlay = png(`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000"><path d="M300 200 Q330 600 290 950" stroke="#000" stroke-opacity="0.12" stroke-width="40" fill="none"/><path d="M700 200 Q670 600 710 950" stroke="#000" stroke-opacity="0.12" stroke-width="40" fill="none"/></svg>`);
const fakePhoto = png(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200"><rect width="1200" height="1200" fill="#D8CFC4"/><circle cx="600" cy="600" r="300" fill="#1F2A44"/></svg>`);
const sessionParams = (id: string) => state.sessions[Number(id.replace('cs_test_s', '')) - 1];

const pfColors: Record<number, string[]> = {
  71: ['Navy', 'White', 'Black', 'Maroon', 'Forest', 'Athletic Heather'],
  146: ['Navy', 'Black', 'Maroon', 'Forest Green', 'Sport Grey', 'White'],
};
const SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL'];
function pfProduct(id: number) {
  let vid = id * 1000;
  const variants = pfColors[id].flatMap((color) =>
    SIZES.map((size) => ({
      id: ++vid,
      size,
      color,
      price: id === 71 ? '12.95' : '24.50',
      // Like the real catalogue: maroon tee in 3XL can't be printed in the EU
      availability_status: [{ region: 'EU_LV', status: id === 71 && color === 'Maroon' && size === '3XL' ? 'not_available' : 'in_stock' }],
    })),
  );
  return { product: { id, title: id === 71 ? 'Bella + Canvas 3001' : 'Gildan 18500' }, variants };
}

function send(res: http.ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}


const mock = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${MOCK_PORT}`);
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  const raw = Buffer.concat(chunks).toString('utf8');

  // Stripe
  if (url.pathname === '/emails' && req.method === 'POST') {
    state.emails.push(JSON.parse(raw));
    return send(res, 200, { id: 'email_' + state.emails.length });
  }
  if (url.pathname === '/v1/checkout/sessions' && req.method === 'POST') {
    state.sessions.push(new URLSearchParams(raw));
    const id = `cs_test_s${state.sessions.length}`;
    return send(res, 200, { id, object: 'checkout.session', url: 'https://checkout.stripe.test/pay/' + id });
  }
  const liMatch = url.pathname.match(/^\/v1\/checkout\/sessions\/(cs_test_s\d+)\/line_items$/);
  if (liMatch) {
    const p = sessionParams(liMatch[1]);
    const data = [];
    for (let i = 0; p.has(`line_items[${i}][quantity]`); i++) {
      const qty = Number(p.get(`line_items[${i}][quantity]`));
      const unit = Number(p.get(`line_items[${i}][price_data][unit_amount]`));
      data.push({
        id: `li_${i}`,
        object: 'item',
        quantity: qty,
        amount_total: unit * qty,
        description: p.get(`line_items[${i}][price_data][product_data][name]`),
        price: { id: `price_${i}`, object: 'price', product: { id: `prod_${i}`, object: 'product', metadata: { item: p.get(`line_items[${i}][price_data][product_data][metadata][item]`) } } },
      });
    }
    return send(res, 200, { object: 'list', data, has_more: false, url: url.pathname });
  }
  const sMatch = url.pathname.match(/^\/v1\/checkout\/sessions\/(cs_test_s\d+)$/);
  if (sMatch) {
    const p = sessionParams(sMatch[1]);
    let amount = 0;
    for (let i = 0; p.has(`line_items[${i}][quantity]`); i++) amount += Number(p.get(`line_items[${i}][price_data][unit_amount]`)) * Number(p.get(`line_items[${i}][quantity]`));
    return send(res, 200, {
      id: sMatch[1],
      object: 'checkout.session',
      status: 'complete',
      payment_status: 'paid',
      amount_total: amount,
      customer_details: { email: 'kunde@example.de', name: 'Erika Mustermann', phone: null },
      collected_information: { shipping_details: { name: 'Erika Mustermann', address: { line1: 'Musterstraße 1', line2: null, city: 'Köln', postal_code: '50667', country: 'DE', state: null } } },
      shipping_cost: { amount_total: 0 },
      metadata: { marketing: p.get('metadata[marketing]'), lang: p.get('metadata[lang]') },
    });
  }

  // Printful
  const auth = req.headers.authorization;
  if (url.pathname.startsWith('/products/') || url.pathname.startsWith('/orders') || url.pathname.startsWith('/mockup-generator')) {
    if (auth !== 'Bearer pf_test_token') return send(res, 401, { error: { message: 'bad token' } });
  }
  const prod = url.pathname.match(/^\/products\/(\d+)$/);
  if (prod) return send(res, 200, { result: pfProduct(Number(prod[1])) });
  const pfile = url.pathname.match(/^\/mockup-generator\/printfiles\/(\d+)$/);
  if (pfile) {
    // Tee uses the newer 15″ × 18″ "front_large" placement, hoodie the classic "front"
    const id = Number(pfile[1]);
    const placement = id === 71 ? 'front_large' : 'front';
    const dims = id === 71 ? { width: 2250, height: 2700 } : { width: 1800, height: 1500 };
    return send(res, 200, {
      result: {
        available_placements: { [placement]: 'Front print', back: 'Back print' },
        printfiles: [{ printfile_id: id, ...dims, dpi: 150 }],
        variant_printfiles: [{ variant_id: id * 1000 + 1, placements: { [placement]: id, back: id + 1 } }],
      },
    });
  }
  const tpls = url.pathname.match(/^\/mockup-generator\/templates\/(\d+)$/);
  if (tpls) {
    const id = Number(tpls[1]);
    const placement = id === 71 ? 'front_large' : 'front';
    const prod = pfProduct(id);
    const colors = pfColors[id];
    const templates = colors.map((c, i) => ({
      template_id: id * 100 + i,
      image_url: `http://localhost:${MOCK_PORT}/img/overlay.png`,
      background_url: `http://localhost:${MOCK_PORT}/img/bg-${encodeURIComponent(c)}.png`,
      background_color: null,
      printfile_id: id,
      template_width: 1000,
      template_height: 1000,
      print_area_width: 400,
      print_area_height: id === 71 ? 480 : 333,
      print_area_top: 230,
      print_area_left: 300,
      is_template_on_front: true,
    }));
    const variant_mapping = prod.variants.map((v) => ({ variant_id: v.id, templates: [{ placement, template_id: id * 100 + colors.indexOf(v.color) }] }));
    return send(res, 200, { result: { version: 1, min_dpi: 150, variant_mapping, templates } });
  }
  if (url.pathname.startsWith('/mockup-generator/create-task/') && req.method === 'POST') {
    const body = JSON.parse(raw);
    // Like Printful, download the print file from the shop
    const f = await fetch(body.files[0].image_url).catch(() => null);
    state.mockupTasks.push({ body, printFileStatus: f?.status ?? 0 });
    return send(res, 200, { result: { task_key: `tk_${state.mockupTasks.length}`, status: 'pending' } });
  }
  if (url.pathname === '/mockup-generator/task') {
    const n = url.searchParams.get('task_key')!.replace('tk_', '');
    return send(res, 200, {
      result: {
        task_key: `tk_${n}`,
        status: 'completed',
        mockups: [
          {
            placement: 'front',
            variant_ids: [1],
            mockup_url: `http://localhost:${MOCK_PORT}/img/photo-${n}-main.png`,
            extra: [{ title: 'Lifestyle', option: 'Lifestyle', url: `http://localhost:${MOCK_PORT}/img/photo-${n}-life.png` }],
          },
        ],
      },
    });
  }
  const img = url.pathname.match(/^\/img\/(.+)\.png$/);
  if (img) {
    const name = decodeURIComponent(img[1]);
    const buf = name === 'overlay' ? fakeOverlay : name.startsWith('bg-') ? fakeBg(COLOR_HEX[name.slice(3)] ?? '#888') : fakePhoto;
    res.writeHead(200, { 'Content-Type': 'image/png' });
    return res.end(buf);
  }
  const find = url.pathname.match(/^\/orders\/@(.+)$/);
  if (find && req.method === 'GET') {
    const o = state.printfulOrders.find((x) => x.external_id === decodeURIComponent(find[1]));
    return o ? send(res, 200, { result: { id: 1, external_id: o.external_id, status: 'draft' } }) : send(res, 404, { error: { message: 'Not found' } });
  }
  if (url.pathname === '/orders' && req.method === 'POST') {
    state.createOrderCalls++;
    const body = JSON.parse(raw);
    state.printfulOrders.push(body);
    return send(res, 200, { result: { id: 1, external_id: body.external_id, status: 'draft' } });
  }
  send(res, 404, { error: { message: `mock: ${req.method} ${url.pathname}` } });
});

function listFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? listFiles(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}

function run(cmd: string, args: string[], env: Record<string, string>) {
  return new Promise<void>((resolve, reject) => {
    const p = spawn(cmd, args, { cwd: ROOT, env: { ...process.env, ...env }, stdio: 'inherit' });
    p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(' ')} exited ${code}`))));
  });
}

async function waitFor(url: string, ms = 30000) {
  const t = Date.now();
  while (Date.now() - t < ms) {
    try {
      await fetch(url);
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 300));
    }
  }
  throw new Error('server did not start');
}

async function main() {
  const backup = fs.readFileSync(VARIANTS, 'utf8');
  const backupMockups = fs.readFileSync(MOCKUPS, 'utf8');
  const mockupFilesBefore = new Set(listFiles(MOCKUP_DIR));
  const env = {
    NEXT_TELEMETRY_DISABLED: '1',
    NEXT_PUBLIC_SITE_URL: `http://localhost:${APP_PORT}`,
    PRINTFUL_API_BASE: `http://localhost:${MOCK_PORT}`,
    PRINTFUL_API_TOKEN: 'pf_test_token',
    PRINTFUL_WEBHOOK_SECRET: 'pfhook_secret_123',
    STRIPE_API_BASE: `http://localhost:${MOCK_PORT}`,
    RESEND_API_BASE: `http://localhost:${MOCK_PORT}`,
    RESEND_API_KEY: 're_test',
    EMAIL_FROM: 'Shop <shop@example.com>',
    OWNER_EMAIL: 'owner@example.com',
    STRIPE_SECRET_KEY: 'sk_test_mock',
    STRIPE_WEBHOOK_SECRET: WEBHOOK_SECRET,
    PRINT_FILE_SECRET: 'print_secret_for_tests_only',
  };
  let app: ChildProcess | null = null;
  await new Promise<void>((r) => mock.listen(MOCK_PORT, r));

  try {
    console.log('\n1) Printful sync');
    await run('npx', ['tsx', 'scripts/printful-sync.ts'], env);
    const synced = JSON.parse(fs.readFileSync(VARIANTS, 'utf8'));
    ok(synced.garments.tee.variants.navy.L.id === 71003, 'tee navy L → variant 71003');
    ok(synced.garments.hoodie.variants.waldgruen.XL.id > 146000, 'hoodie colour mapping (Forest Green)');
    ok(synced.garments.hoodie.printfile.height === 1500, 'hoodie print-file size from Printful');
    ok(synced.garments.tee.placement === 'front_large' && synced.garments.hoodie.placement === 'front', 'detects front_large vs front placement');
    const mockData = JSON.parse(fs.readFileSync(MOCKUPS, 'utf8'));
    const teeNavy = mockData.garments.tee?.colors?.navy;
    ok(teeNavy && teeNavy.bg && fs.existsSync(path.join(ROOT, 'public', teeNavy.bg)), `garment photo saved (${teeNavy?.bg})`);
    ok(Object.keys(mockData.garments.hoodie?.colors ?? {}).length === 6, 'photos for all 6 hoodie colours');

    console.log('\n2) Build');
    execSync('npx next build', { cwd: ROOT, env: { ...process.env, ...env }, stdio: 'ignore' });
    app = spawn(path.join(ROOT, 'node_modules/.bin/next'), ['start', '-p', String(APP_PORT)], { cwd: ROOT, env: { ...process.env, ...env }, stdio: 'ignore' });
    await waitFor(`http://localhost:${APP_PORT}/`);
    const A = `http://localhost:${APP_PORT}`;

    console.log('\n2b) Product photos (mockup generator)');
    await run('npx', ['tsx', 'scripts/printful-sync.ts', '--photos'], env);
    ok(state.mockupTasks.length === 3, 'one mockup task per product');
    ok(state.mockupTasks.every((t) => t.printFileStatus === 200), 'Printful could download every example print file');
    ok((state.mockupTasks[0].body as { files: { placement: string }[] }).files[0].placement === 'front_large', 'mockup task uses front_large');
    const photos = JSON.parse(fs.readFileSync(MOCKUPS, 'utf8')).products;
    ok(photos['opa-oma-namen']?.length === 2 && fs.existsSync(path.join(ROOT, 'public', photos['opa-oma-namen'][0].src)), 'product photos saved');

    console.log('\n3) Checkout');
    const bad = await fetch(`${A}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ productSlug: 'opa-oma-namen', garment: 'tee', color: 'navy', size: 'L', values: { titel: 'OPA', namen: ['<script>'] }, qty: 1 }] }),
    });
    ok(bad.status === 400, `rejects invalid personalisation (${bad.status}: ${(await bad.json()).error})`);
    const notEu = await fetch(`${A}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: 'en', items: [{ productSlug: 'opa-oma-namen', garment: 'tee', color: 'bordeaux', size: '3XL', values: { titel: 'OPA', namen: ['Mia'] }, qty: 1 }] }),
    });
    ok(notEu.status === 400 && /unavailable/.test((await notEu.json()).error), 'refuses a size Printful can’t print in the EU');
    const badEn = await fetch(`${A}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: 'en', items: [{ productSlug: 'opa-oma-namen', garment: 'tee', color: 'navy', size: 'L', values: { titel: 'OPA', namen: [] }, qty: 1 }] }),
    });
    const badEnJson = await badEn.json();
    ok(badEn.status === 400 && /enter at least one name/.test(badEnJson.error), `English error message (${badEnJson.error})`);

    const cart = [
      { productSlug: 'opa-oma-namen', garment: 'tee', color: 'navy', size: 'L', values: { titel: 'OMA', namen: ['Jörg', 'Änne', 'Zoë'], seit: '2011' }, qty: 1 },
      { productSlug: 'familie-weihnachten', garment: 'hoodie', color: 'waldgruen', size: 'XL', values: { nachname: 'Schößler', vorname: 'Lena', jahr: '2026' }, qty: 1 },
    ];
    const co = await fetch(`${A}/api/checkout`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: cart, marketingConsent: false, locale: 'de' }) });
    const coJson = await co.json();
    const SESSION_ID = 'cs_test_s1';
    ok(co.status === 200 && String(coJson.url).includes(SESSION_ID), 'checkout returns Stripe URL');
    const p = state.sessions[0];
    ok(p.get('line_items[0][price_data][unit_amount]') === '3495', 'tee price from catalog (34,95 €)');
    ok(p.get('line_items[1][price_data][unit_amount]') === '5495', 'hoodie price from catalog (54,95 €)');
    ok(p.get('shipping_options[0][shipping_rate_data][fixed_amount][amount]') === '0', 'free shipping above 60 €');
    ok(p.get('shipping_address_collection[allowed_countries][0]') === 'DE', 'EU shipping countries');
    ok(p.get('locale') === 'de' && p.get('metadata[lang]') === 'de', 'German checkout');
    ok((p.get('custom_text[submit][message]') ?? '').includes('312g'), 'withdrawal exclusion shown in checkout');

    console.log('\n4) Stripe webhook → Printful order');
    const payload = JSON.stringify({ id: 'evt_1', object: 'event', type: 'checkout.session.completed', data: { object: { id: SESSION_ID, object: 'checkout.session', payment_status: 'paid' } } });
    const header = new Stripe('sk_test_mock').webhooks.generateTestHeaderString({ payload, secret: WEBHOOK_SECRET });
    const forged = await fetch(`${A}/api/webhooks/stripe`, { method: 'POST', headers: { 'stripe-signature': 't=1,v1=deadbeef' }, body: payload });
    ok(forged.status === 400, 'rejects unsigned webhook');
    const wh = await fetch(`${A}/api/webhooks/stripe`, { method: 'POST', headers: { 'stripe-signature': header, 'Content-Type': 'application/json' }, body: payload });
    ok(wh.status === 200, `webhook accepted (${wh.status})`);
    const order = state.printfulOrders[0] as {
      external_id: string;
      recipient: { name: string; city: string; country_code: string; zip: string };
      items: { variant_id: number; quantity: number; retail_price: string; files: { type: string; url: string }[] }[];
    };
    ok(order && order.external_id.length === 32, 'Printful order created with 32-char external ID');
    ok(order?.recipient.city === 'Köln' && order.recipient.country_code === 'DE' && order.recipient.zip === '50667', 'recipient address passed through');
    ok(order?.items[0].variant_id === 71003 && order.items[0].retail_price === '34.95', 'tee: right variant + retail price');
    const hoodieVariant = synced.garments.hoodie.variants.waldgruen.XL.id;
    ok(order?.items[1].variant_id === hoodieVariant, 'hoodie: right variant');

    console.log('\n5) Print files');
    ok(order.items[0].files[0].type === 'front_large' && order.items[1].files[0].type === 'front', 'order uses each garment\'s placement');
    for (const [i, expected] of [[0, [2250, 2700]], [1, [1800, 1500]]] as const) {
      const fileUrl = order.items[i].files[0].url;
      const r = await fetch(fileUrl);
      const buf = Buffer.from(await r.arrayBuffer());
      const w = buf.readUInt32BE(16);
      const h = buf.readUInt32BE(20);
      ok(r.status === 200 && r.headers.get('content-type') === 'image/png', `item ${i + 1}: PNG served`);
      ok(w === expected[0] && h === expected[1], `item ${i + 1}: ${w} × ${h} px matches Printful area`);
      fs.mkdirSync(path.join(ROOT, 'test-output'), { recursive: true });
      fs.writeFileSync(path.join(ROOT, 'test-output', `e2e-printfile-${i + 1}.png`), buf);
    }
    // Design must stay ≤ 12″ wide on the 15″ area: check the outermost opaque pixels of the tee print
    const { data: px, info } = await (await import('sharp')).default(path.join(ROOT, 'test-output', 'e2e-printfile-1.png')).raw().toBuffer({ resolveWithObject: true });
    let minX = info.width, maxX = 0;
    for (let y = 0; y < info.height; y += 4) for (let x = 0; x < info.width; x += 2) if (px[(y * info.width + x) * info.channels + 3] > 0) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); }
    ok(maxX - minX <= 1800, `print stays within 12″ on front_large (${((maxX - minX) / 150).toFixed(1)}″ wide)`);
    const tampered = order.items[0].files[0].url.replace(/s=[^&]+/, 's=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
    ok((await fetch(tampered)).status === 403, 'tampered print-file URL is refused');

    console.log('\n6) Idempotency');
    const header2 = new Stripe('sk_test_mock').webhooks.generateTestHeaderString({ payload, secret: WEBHOOK_SECRET });
    await fetch(`${A}/api/webhooks/stripe`, { method: 'POST', headers: { 'stripe-signature': header2 }, body: payload });
    ok(state.createOrderCalls === 1, 'redelivered webhook does not create a second order');

    console.log('\n7) Emails + English order');
    const custDe = state.emails.find((e) => e.to[0] === 'kunde@example.de');
    const ownerMail = state.emails.find((e) => e.to[0] === 'owner@example.com');
    ok(custDe && custDe.subject.startsWith('Deine Bestellung') && custDe.html.includes('Widerrufsbelehrung'), 'German customer email with withdrawal policy');
    ok(ownerMail && ownerMail.subject.startsWith('New order') && ownerMail.html.includes('customer language: DE'), 'owner email in English');
    const coEn = await fetch(`${A}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: 'en', items: [cart[0]], marketingConsent: false }),
    });
    ok(coEn.status === 200, 'English checkout created');
    const pEn = state.sessions[1];
    ok(pEn.get('locale') === 'en' && pEn.get('metadata[lang]') === 'en', 'Stripe page in English');
    ok((pEn.get('line_items[0][price_data][product_data][name]') ?? '').startsWith('Grandpa & Grandma shirt'), `English product name on Stripe (${pEn.get('line_items[0][price_data][product_data][name]')})`);
    ok(pEn.get('shipping_options[0][shipping_rate_data][fixed_amount][amount]') === '495', 'shipping charged below 60 €');
    const payloadEn = JSON.stringify({ id: 'evt_2', object: 'event', type: 'checkout.session.completed', data: { object: { id: 'cs_test_s2', object: 'checkout.session', payment_status: 'paid' } } });
    const whEn = await fetch(`${A}/api/webhooks/stripe`, { method: 'POST', headers: { 'stripe-signature': new Stripe('sk_test_mock').webhooks.generateTestHeaderString({ payload: payloadEn, secret: WEBHOOK_SECRET }) }, body: payloadEn });
    ok(whEn.status === 200 && state.createOrderCalls === 2, 'English order sent to Printful');
    const custEn = state.emails.filter((e) => e.to[0] === 'kunde@example.de').at(-1)!;
    ok(custEn.subject.startsWith('Your order') && custEn.html.includes('Model withdrawal form') && custEn.html.includes('Grandpa'), 'English customer email');

    console.log('\n8) Other endpoints');
    const sum = await fetch(`${A}/api/order-summary?session_id=${SESSION_ID}`);
    const sumJson = await sum.json();
    ok(sum.status === 200 && sumJson.email === 'kunde@example.de' && /^LS-/.test(sumJson.orderRef), `order summary (${sumJson.orderRef})`);
    const wd = await fetch(`${A}/api/withdrawal`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Erika', email: 'kunde@example.de', order: sumJson.orderRef, locale: 'en' }) });
    ok(wd.status === 200 && (await wd.json()).stamp, 'withdrawal accepted with timestamp');
    const wdMail = state.emails.filter((e) => e.to[0] === 'kunde@example.de').at(-1)!;
    ok(wdMail.subject.startsWith('Confirmation of receipt'), 'withdrawal receipt in English');
    const pfBad = await fetch(`${A}/api/webhooks/printful?token=wrong-token-xxxx`, { method: 'POST', body: '{}' });
    ok(pfBad.status === 403, 'Printful webhook needs token');
    const pfGood = await fetch(`${A}/api/webhooks/printful?token=pfhook_secret_123`, {
      method: 'POST',
      body: JSON.stringify({ type: 'package_shipped', data: { shipment: { carrier: 'DHL', tracking_url: 'https://dhl.example/1' }, order: { recipient: { name: 'Erika', email: 'kunde@example.de', country_code: 'DE' } } } }),
    });
    ok(pfGood.status === 200 && state.emails.at(-1)!.subject === 'Dein Shirt ist unterwegs', 'shipping email (German for DE address)');
    await fetch(`${A}/api/webhooks/printful?token=pfhook_secret_123`, {
      method: 'POST',
      body: JSON.stringify({ type: 'package_shipped', data: { shipment: { carrier: 'PostNL', tracking_url: 'https://x.example/1' }, order: { recipient: { name: 'Jan', email: 'jan@example.nl', country_code: 'NL' } } } }),
    });
    ok(state.emails.at(-1)!.subject === 'Your shirt is on its way', 'shipping email (English for NL address)');
    for (const page of ['/', '/produkt/opa-oma-namen/', '/warenkorb/', '/widerruf/', '/impressum/', '/agb/', '/datenschutz/', '/widerrufsbelehrung/', '/versand-zahlung/']) {
      const r = await fetch(`${A}${page}`);
      ok(r.status === 200, `page ${page}`);
    }
  } finally {
    app?.kill();
    mock.close();
    if (!process.env.KEEP_TEST_DATA) {
      fs.writeFileSync(VARIANTS, backup);
      fs.writeFileSync(MOCKUPS, backupMockups);
      for (const f of listFiles(MOCKUP_DIR)) if (!mockupFilesBefore.has(f)) fs.rmSync(f);
    }
  }
  console.log(failures ? `\n${failures} test(s) failed` : '\nAll tests passed');
  process.exit(failures ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  fs.existsSync(VARIANTS);
  process.exit(1);
});
