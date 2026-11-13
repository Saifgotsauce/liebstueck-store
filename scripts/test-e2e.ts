// End-to-end test against local mock Stripe + Printful + Resend APIs. No real accounts needed.
//   npm run test:e2e
// Flow: printful:sync → build → checkout (bundles, shipping, US-only stock) → signed Stripe
// webhook → Printful order → print file download → duplicate webhook (idempotency) → emails.
import { spawn, execSync, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import Stripe from 'stripe';
import { Resvg } from '@resvg/resvg-js';

const ROOT = process.cwd();
const MOCK_PORT = 4010;
const APP_PORT = 3200;
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
  coupons: {} as Record<string, number>,
  amountCoupons: {} as Record<string, number>,
  couponCurrency: {} as Record<string, string>,
  promos: [] as { id: string; code: string; active: boolean; expires_at: number | null; max_redemptions: number | null; metadata: Record<string, string>; coupon: string }[],
  idem: {} as Record<string, unknown>,
  customers: [] as { id: string; email: string; name: string; metadata: Record<string, string> }[],
  printfulOrders: [] as Record<string, unknown>[],
  createOrderCalls: 0,
  emails: [] as { to: string[]; subject: string; html: string; scheduled_at?: string }[],
  mockupTasks: [] as { body: Record<string, unknown>; printFileStatus: number }[],
};

// Fake "photos" for the mock Printful: a garment on grey (background) and a soft shadow layer (overlay).
const COLOR_HEX: Record<string, string> = { Navy: '#1F2A44', White: '#FFFFFF', Black: '#1B1B1D', Maroon: '#5A1E2A', Forest: '#253B2F', 'Forest Green': '#253B2F', 'Athletic Heather': '#BDBCB8', 'Sport Grey': '#B7B7B3', 'Heather Mauve': '#BF9AA0', 'Light Pink': '#F2CBD3' };
function png(svg: string) {
  return new Resvg(svg).render().asPng();
}
const TEE_PATH = 'M380 120 C420 175 580 175 620 120 L790 160 L950 340 L860 430 L770 370 L775 960 L225 960 L230 370 L140 430 L50 340 L210 160 Z';
const fakeBg = (hex: string) => png(`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000"><rect width="1000" height="1000" fill="#EDEDED"/><path d="${TEE_PATH}" fill="${hex}"/></svg>`);
const fakeOverlay = png(`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000"><path d="M300 200 Q330 600 290 950" stroke="#000" stroke-opacity="0.12" stroke-width="40" fill="none"/><path d="M700 200 Q670 600 710 950" stroke="#000" stroke-opacity="0.12" stroke-width="40" fill="none"/></svg>`);
const fakePhoto = png(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200"><rect width="1200" height="1200" fill="#D8CFC4"/><circle cx="600" cy="600" r="300" fill="#1F2A44"/></svg>`);
const sessionParams = (id: string) => state.sessions[Number(id.replace('cs_test_s', '')) - 1];

const pfColors: Record<number, string[]> = {
  71: ['Black', 'White', 'Athletic Heather', 'Heather Mauve', 'Navy', 'Maroon', 'Forest'],
  146: ['Black', 'Sport Grey', 'Navy', 'Maroon', 'Forest Green', 'Light Pink', 'White'],
};
const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];
function pfProduct(id: number) {
  let vid = id * 1000;
  const variants = pfColors[id].flatMap((color) =>
    SIZES.map((size) => ({
      id: ++vid,
      size,
      color,
      price: id === 71 ? '12.95' : '26.95',
      // Like the real catalogue, some variants are only stocked in some regions: maroon tee 4XL isn't in the US
      availability_status: [
        { region: 'US', status: id === 71 && color === 'Maroon' && size === '4XL' ? 'not_available' : 'in_stock' },
        { region: 'EU_LV', status: 'in_stock' },
      ],
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
  const coupon = url.pathname.match(/^\/v1\/coupons\/([\w-]+)$/);
  if (coupon && req.method === 'GET') {
    const pct = state.coupons[coupon[1]];
    const amt = state.amountCoupons[coupon[1]];
    if (pct) return send(res, 200, { id: coupon[1], object: 'coupon', percent_off: pct, valid: true });
    if (amt) return send(res, 200, { id: coupon[1], object: 'coupon', amount_off: amt, currency: state.couponCurrency[coupon[1]] ?? 'eur', valid: true });
    return send(res, 404, { error: { type: 'invalid_request_error', code: 'resource_missing', message: `No such coupon: '${coupon[1]}'` } });
  }
  if (url.pathname === '/v1/coupons' && req.method === 'POST') {
    const p = new URLSearchParams(raw);
    if (p.has('amount_off')) {
      state.amountCoupons[p.get('id')!] = Number(p.get('amount_off'));
      state.couponCurrency[p.get('id')!] = p.get('currency') ?? 'eur';
      return send(res, 200, { id: p.get('id'), object: 'coupon', amount_off: Number(p.get('amount_off')), currency: p.get('currency'), valid: true });
    }
    state.coupons[p.get('id')!] = Number(p.get('percent_off'));
    return send(res, 200, { id: p.get('id'), object: 'coupon', percent_off: Number(p.get('percent_off')), valid: true });
  }
  // Stripe promotion codes + customers (referral program)
  const md = (p: URLSearchParams) => Object.fromEntries([...p.entries()].filter(([k]) => k.startsWith('metadata[')).map(([k, v]) => [k.slice(9, -1), v]));
  const promoJson = (x: (typeof state.promos)[number]) => ({ object: 'promotion_code', id: x.id, code: x.code, active: x.active, expires_at: x.expires_at, max_redemptions: x.max_redemptions, times_redeemed: 0, metadata: x.metadata, promotion: { type: 'coupon', coupon: x.coupon } });
  if (url.pathname === '/v1/promotion_codes' && req.method === 'GET') {
    const code = (url.searchParams.get('code') ?? '').toUpperCase();
    return send(res, 200, { object: 'list', data: state.promos.filter((x) => x.code.toUpperCase() === code).map(promoJson), has_more: false, url: url.pathname });
  }
  if (url.pathname === '/v1/promotion_codes' && req.method === 'POST') {
    const key = String(req.headers['idempotency-key'] ?? '');
    if (key && state.idem[key]) return send(res, 200, state.idem[key]);
    const p = new URLSearchParams(raw);
    if (state.promos.some((x) => x.code === p.get('code'))) return send(res, 400, { error: { type: 'invalid_request_error', message: 'An active promotion code with `code` already exists.' } });
    const x = { id: `promo_${state.promos.length + 1}`, code: p.get('code')!, active: true, expires_at: p.has('expires_at') ? Number(p.get('expires_at')) : null, max_redemptions: p.has('max_redemptions') ? Number(p.get('max_redemptions')) : null, metadata: md(p), coupon: p.get('promotion[coupon]') ?? '' };
    state.promos.push(x);
    const out = promoJson(x);
    if (key) state.idem[key] = out;
    return send(res, 200, out);
  }
  const promoUpd = url.pathname.match(/^\/v1\/promotion_codes\/(promo_\d+)$/);
  if (promoUpd && req.method === 'POST') {
    const x = state.promos.find((y) => y.id === promoUpd[1])!;
    const p = new URLSearchParams(raw);
    if (p.has('active')) x.active = p.get('active') === 'true';
    Object.assign(x.metadata, md(p));
    return send(res, 200, promoJson(x));
  }
  if (url.pathname === '/v1/customers' && req.method === 'GET') {
    const email = url.searchParams.get('email');
    return send(res, 200, { object: 'list', data: state.customers.filter((c) => c.email === email).map((c) => ({ object: 'customer', ...c })), has_more: false, url: url.pathname });
  }
  if (url.pathname === '/v1/customers' && req.method === 'POST') {
    const p = new URLSearchParams(raw);
    const c = { id: `cus_${state.customers.length + 1}`, email: p.get('email') ?? '', name: p.get('name') ?? '', metadata: md(p) };
    state.customers.push(c);
    return send(res, 200, { object: 'customer', ...c });
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
    const pct = state.coupons[p.get('discounts[0][coupon]') ?? ''] ?? 0;
    const amt = state.amountCoupons[p.get('discounts[0][coupon]') ?? ''] ?? 0;
    let all = 0;
    for (let i = 0; p.has(`line_items[${i}][quantity]`); i++) all += Number(p.get(`line_items[${i}][price_data][unit_amount]`)) * Number(p.get(`line_items[${i}][quantity]`));
    for (let i = 0; p.has(`line_items[${i}][quantity]`); i++) {
      const qty = Number(p.get(`line_items[${i}][quantity]`));
      const unit = Number(p.get(`line_items[${i}][price_data][unit_amount]`));
      // like Stripe: a fixed-amount coupon is spread over the lines by value
      const discount = amt ? Math.round((amt * unit * qty) / all) : Math.round((unit * qty * pct) / 100);
      data.push({
        id: `li_${i}`,
        object: 'item',
        quantity: qty,
        amount_subtotal: unit * qty,
        amount_discount: discount,
        amount_total: unit * qty - discount,
        description: p.get(`line_items[${i}][price_data][product_data][name]`),
        price: {
          id: `price_${i}`,
          object: 'price',
          product: {
            id: `prod_${i}`,
            object: 'product',
            metadata: Object.fromEntries(
              ['item', 'kind'].flatMap((k) => (p.has(`line_items[${i}][price_data][product_data][metadata][${k}]`) ? [[k, p.get(`line_items[${i}][price_data][product_data][metadata][${k}]`)]] : [])),
            ),
          },
        },
      });
    }
    return send(res, 200, { object: 'list', data, has_more: false, url: url.pathname });
  }
  const sMatch = url.pathname.match(/^\/v1\/checkout\/sessions\/(cs_test_s\d+)$/);
  if (sMatch) {
    const p = sessionParams(sMatch[1]);
    let subtotal = 0;
    for (let i = 0; p.has(`line_items[${i}][quantity]`); i++) subtotal += Number(p.get(`line_items[${i}][price_data][unit_amount]`)) * Number(p.get(`line_items[${i}][quantity]`));
    const pct = state.coupons[p.get('discounts[0][coupon]') ?? ''] ?? 0;
    const discount = state.amountCoupons[p.get('discounts[0][coupon]') ?? ''] ?? Math.round((subtotal * pct) / 100);
    const shippingAmount = Number(p.get('shipping_options[0][shipping_rate_data][fixed_amount][amount]') ?? 0);
    const metadata = Object.fromEntries([...p.entries()].filter(([k]) => k.startsWith('metadata[')).map(([k, v]) => [k.slice(9, -1), v]));
    const collectsAddress = p.has('shipping_address_collection[allowed_countries][0]');
    return send(res, 200, {
      id: sMatch[1],
      object: 'checkout.session',
      status: 'complete',
      payment_status: 'paid',
      amount_subtotal: subtotal,
      amount_total: subtotal - discount + shippingAmount,
      total_details: { amount_discount: discount, amount_shipping: shippingAmount, amount_tax: 0 },
      customer_email: p.get('customer_email'),
      customer_details: { email: p.get('customer_email') ?? 'linda@example.com', name: collectsAddress ? 'Linda Carter' : 'Gisela Schmidt', phone: null },
      collected_information: collectsAddress
        ? { shipping_details: { name: 'Linda Carter', address: { line1: '12 Maple Ave', line2: null, city: 'Columbus', postal_code: '43004', country: 'US', state: 'OH' } } }
        : null,
      shipping_cost: collectsAddress ? { amount_total: shippingAmount } : null,
      metadata,
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
  const post = (A: string, items: unknown[], extra: Record<string, unknown> = {}) =>
    fetch(`${A}/api/checkout`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items, marketingConsent: false, ...extra }) });
  const deliver = async (A: string, sessionId: string, evt: string) => {
    const payload = JSON.stringify({ id: evt, object: 'event', type: 'checkout.session.completed', data: { object: { id: sessionId, object: 'checkout.session', payment_status: 'paid' } } });
    const header = new Stripe('sk_test_mock').webhooks.generateTestHeaderString({ payload, secret: WEBHOOK_SECRET });
    return fetch(`${A}/api/webhooks/stripe`, { method: 'POST', headers: { 'stripe-signature': header, 'Content-Type': 'application/json' }, body: payload });
  };

  try {
    console.log('\n1) Printful sync');
    await run('npx', ['tsx', 'scripts/printful-sync.ts'], env);
    const synced = JSON.parse(fs.readFileSync(VARIANTS, 'utf8'));
    const navyL = synced.garments.tee.variants.navy.L;
    ok(navyL.id > 71000 && navyL.regions?.includes('US'), `tee navy L → variant ${navyL.id}, in stock in US`);
    ok(synced.garments.tee.variants.mauve?.M?.id > 71000, 'tee Heather Mauve mapped');
    ok(synced.garments.hoodie.variants.forest.XL.id > 146000 && synced.garments.hoodie.variants.pink.L.id > 146000, 'hoodie colors mapped (Forest Green, Light Pink)');
    ok(synced.garments.tee.placement === 'front_large' && synced.garments.hoodie.placement === 'front', 'detects front_large vs front placement');
    const mockData = JSON.parse(fs.readFileSync(MOCKUPS, 'utf8'));
    const teeNavy = mockData.garments.tee?.colors?.navy;
    ok(teeNavy && teeNavy.bg && fs.existsSync(path.join(ROOT, 'public', teeNavy.bg)), `garment photo saved (${teeNavy?.bg})`);
    ok(Object.keys(mockData.garments.hoodie?.colors ?? {}).length === 7, 'photos for all 7 hoodie colors');

    console.log('\n2) Build');
    execSync('npx next build', { cwd: ROOT, env: { ...process.env, ...env }, stdio: 'ignore' });
    app = spawn(path.join(ROOT, 'node_modules/.bin/next'), ['start', '-p', String(APP_PORT)], { cwd: ROOT, env: { ...process.env, ...env }, stdio: 'ignore' });
    await waitFor(`http://localhost:${APP_PORT}/`);
    const A = `http://localhost:${APP_PORT}`;

    console.log('\n2b) Product photos (mockup generator)');
    await run('npx', ['tsx', 'scripts/printful-sync.ts', '--photos'], env);
    ok(state.mockupTasks.length === 9, `one mockup task per featured design (${state.mockupTasks.length})`);
    ok(state.mockupTasks.every((t) => t.printFileStatus === 200), 'Printful could download every example print file');
    const photos = JSON.parse(fs.readFileSync(MOCKUPS, 'utf8')).products;
    ok(photos['not-old-seasoned']?.length === 2 && fs.existsSync(path.join(ROOT, 'public', photos['not-old-seasoned'][0].src)), 'product photos saved');

    console.log('\n3) Checkout');
    const bad = await post(A, [{ design: 'loved-by-grandkids', garment: 'tee', color: 'navy', size: 'L', values: { nickname: 'Nana', year: '', names: ['<script>'] }, qty: 1 }]);
    ok(bad.status === 400, `rejects invalid personalization (${bad.status}: ${(await bad.json()).error})`);
    const empty = await post(A, [{ design: 'loved-by-grandkids', garment: 'tee', color: 'navy', size: 'L', values: { nickname: 'Nana', names: [] }, qty: 1 }]);
    ok(empty.status === 400 && /at least one name/.test((await empty.json()).error), 'asks for at least one name');
    const notUs = await post(A, [{ design: 'not-old-seasoned', garment: 'tee', color: 'maroon', size: '4XL', values: {}, qty: 1 }]);
    ok(notUs.status === 400 && /out of stock/.test((await notUs.json()).error), 'refuses a size Printful has no US stock for');
    const ghost = await post(A, [{ design: 'nope', garment: 'tee', color: 'navy', size: 'L', values: {}, qty: 1 }]);
    ok(ghost.status === 400, 'refuses unknown designs');

    // Two items → 10% bundle, free shipping
    const cart = [
      { design: 'loved-by-grandkids', garment: 'tee', color: 'navy', size: 'L', values: { nickname: 'Gigi', year: '2011', names: ['Zoë', 'Mateo', 'Ava'] }, qty: 1 },
      { design: 'family-christmas', garment: 'hoodie', color: 'forest', size: 'XL', values: { surname: 'Johnsons', year: '2026' }, qty: 1 },
    ];
    const co = await post(A, cart);
    const coJson = await co.json();
    ok(co.status === 200 && String(coJson.url).includes('cs_test_s1'), 'checkout returns Stripe URL');
    const p = state.sessions[0];
    ok(p.get('line_items[0][price_data][unit_amount]') === '3495' && p.get('line_items[0][price_data][currency]') === 'usd', 'tee $34.95 from catalog');
    ok(p.get('line_items[1][price_data][unit_amount]') === '4995', 'hoodie $49.95 from catalog');
    ok(p.get('discounts[0][coupon]') === 'BUNDLE10' && state.coupons.BUNDLE10 === 10, '2 items → 10% bundle coupon (created on first use)');
    ok(p.get('shipping_options[0][shipping_rate_data][fixed_amount][amount]') === '0', 'free shipping over $50 after savings');
    ok(p.get('shipping_address_collection[allowed_countries][0]') === 'US' && !p.has('shipping_address_collection[allowed_countries][1]'), 'ships to the US only');
    ok((p.get('line_items[0][price_data][product_data][description]') ?? '').includes('Gigi'), 'personalization shown on Stripe');

    // One tee in 2XL → size extra, shipping charged, no coupon
    const one = await post(A, [{ design: 'not-old-seasoned', garment: 'tee', color: 'black', size: '2XL', values: {}, qty: 1 }]);
    ok(one.status === 200, 'single-item checkout');
    const p2 = state.sessions[1];
    ok(p2.get('line_items[0][price_data][unit_amount]') === '3195', '$29.95 shirt, 2XL costs $2 more');
    ok(p2.get('shipping_options[0][shipping_rate_data][fixed_amount][amount]') === '495' && !p2.has('discounts[0][coupon]'), '$4.95 shipping, no bundle under 2 items');

    // Three items → 15%
    const three = await post(A, [{ design: 'grill-nap-repeat', garment: 'tee', color: 'black', size: 'L', values: {}, qty: 3 }]);
    ok(three.status === 200 && state.sessions[2].get('discounts[0][coupon]') === 'BUNDLE15', '3 items → 15% bundle coupon');

    // One hoodie on its own: under $50, but hoodies always ship free (US)
    const hood = await post(A, [{ design: 'grill-nap-repeat', garment: 'hoodie', color: 'black', size: 'L', values: {}, qty: 1 }]);
    ok(hood.status === 200 && state.sessions.at(-1)!.get('shipping_options[0][shipping_rate_data][fixed_amount][amount]') === '0', 'single hoodie ships free');
    const mid = await post(A, [{ design: 'my-weekend-lasts-all-week', garment: 'tee', color: 'black', size: 'M', values: {}, qty: 1 }]);
    ok(mid.status === 200 && state.sessions.at(-1)!.get('line_items[0][price_data][unit_amount]') === '3195', 'per-design tee price ($31.95)');

    console.log('\n4) Stripe webhook → Printful order');
    const payload = JSON.stringify({ id: 'evt_1', object: 'event', type: 'checkout.session.completed', data: { object: { id: 'cs_test_s1', object: 'checkout.session', payment_status: 'paid' } } });
    const forged = await fetch(`${A}/api/webhooks/stripe`, { method: 'POST', headers: { 'stripe-signature': 't=1,v1=deadbeef' }, body: payload });
    ok(forged.status === 400, 'rejects unsigned webhook');
    const wh = await deliver(A, 'cs_test_s1', 'evt_1');
    ok(wh.status === 200, `webhook accepted (${wh.status})`);
    const order = state.printfulOrders[0] as {
      external_id: string;
      recipient: { name: string; city: string; country_code: string; zip: string; state_code: string };
      items: { variant_id: number; quantity: number; retail_price: string; files: { type: string; url: string }[] }[];
      retail_costs: { currency: string; discount: string; total: string };
    };
    ok(order && order.external_id.length === 32, 'Printful order created with 32-char external ID');
    ok(order?.recipient.city === 'Columbus' && order.recipient.country_code === 'US' && order.recipient.state_code === 'OH', 'US recipient address passed through');
    ok(order?.items[0].variant_id === navyL.id && order.items[0].retail_price === '31.45', `tee: right variant + price paid after 10% (${order?.items[0].retail_price})`);
    ok(order?.items[1].variant_id === synced.garments.hoodie.variants.forest.XL.id, 'hoodie: right variant');
    ok(order?.retail_costs.currency === 'USD' && order.retail_costs.discount === '8.49' && order.retail_costs.total === '76.41', `retail costs in USD with discount (${JSON.stringify(order?.retail_costs)})`);

    console.log('\n5) Print files');
    ok(order.items[0].files[0].type === 'front_large' && order.items[1].files[0].type === 'front', "order uses each garment's placement");
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
    // Design must stay ≤ 11″ wide on the 15″ area: check the outermost opaque pixels of the tee print
    const { data: px, info } = await (await import('sharp')).default(path.join(ROOT, 'test-output', 'e2e-printfile-1.png')).raw().toBuffer({ resolveWithObject: true });
    let minX = info.width, maxX = 0;
    for (let y = 0; y < info.height; y += 4) for (let x = 0; x < info.width; x += 2) if (px[(y * info.width + x) * info.channels + 3] > 0) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); }
    ok(maxX > minX && maxX - minX <= 1650, `print stays within 11″ on front_large (${((maxX - minX) / 150).toFixed(1)}″ wide)`);
    const tampered = order.items[0].files[0].url.replace(/s=[^&]+/, 's=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
    ok((await fetch(tampered)).status === 403, 'tampered print-file URL is refused');

    console.log('\n6) Idempotency');
    await deliver(A, 'cs_test_s1', 'evt_1');
    ok(state.createOrderCalls === 1, 'redelivered webhook does not create a second order');

    console.log('\n7) Emails');
    const cust = state.emails.find((e) => e.to[0] === 'linda@example.com');
    const ownerMail = state.emails.find((e) => e.to[0] === 'owner@example.com');
    ok(cust && /^Your Seasoned order SN-/.test(cust.subject) && cust.html.includes('Bundle savings') && cust.html.includes('Gigi'), `customer email (${cust?.subject})`);
    ok(ownerMail && ownerMail.subject.startsWith('New order') && ownerMail.html.includes('(savings '), 'owner email');
    const wh2 = await deliver(A, 'cs_test_s2', 'evt_2');
    const order2 = state.printfulOrders[1] as { items: { retail_price: string }[]; retail_costs: { shipping: string } } | undefined;
    ok(wh2.status === 200 && order2?.items[0].retail_price === '31.95' && order2.retail_costs.shipping === '4.95', 'single-item order: full price + shipping');

    console.log('\n8) Other endpoints');
    const sum = await fetch(`${A}/api/order-summary?session_id=cs_test_s1`);
    const sumJson = await sum.json();
    ok(sum.status === 200 && sumJson.email === 'linda@example.com' && /^SN-/.test(sumJson.orderRef), `order summary (${sumJson.orderRef})`);
    const pfBad = await fetch(`${A}/api/webhooks/printful?token=wrong-token-xxxx`, { method: 'POST', body: '{}' });
    ok(pfBad.status === 403, 'Printful webhook needs token');
    const pfGood = await fetch(`${A}/api/webhooks/printful?token=pfhook_secret_123`, {
      method: 'POST',
      body: JSON.stringify({ type: 'package_shipped', data: { shipment: { carrier: 'USPS', tracking_url: 'https://usps.example/1' }, order: { recipient: { name: 'Linda Carter', email: 'linda@example.com', country_code: 'US' } } } }),
    });
    const shipMail = state.emails.find((e) => e.subject === 'Your order is on its way');
    ok(pfGood.status === 200 && !!shipMail && shipMail.html.includes('Linda') && shipMail.html.includes('the right one for $9.95'), 'shipping email with tracking + size swap note');
    const checkIn = state.emails.find((e) => e.subject === 'Did it fit?');
    const days = checkIn?.scheduled_at ? (Date.parse(checkIn.scheduled_at) - Date.now()) / 86_400_000 : 0;
    ok(!!checkIn && days > 6 && days < 8 && checkIn.html.includes('Linda'), 'check-in email scheduled a week after shipping');
    console.log('\n9) Give $5, get $5');
    const signup = (body: Record<string, unknown>) => fetch(`${A}/api/referral`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    ok((await signup({ name: 'Carol', email: 'nope' })).status === 400, 'sign-up checks the email address');
    ok((await signup({ name: 'Carol', email: 'carol@example.com', website: 'spam' })).status === 400, 'sign-up ignores bots (hidden field)');
    const su = await (await signup({ name: 'Carol', email: 'Carol@Example.com' })).json();
    ok(/^CAROL[A-Z2-9]{3}$/.test(su.code ?? '') && su.isNew === true, `sign-up returns a friend code (${su.code})`);
    const friendPromo = state.promos.find((x) => x.code === su.code);
    ok(friendPromo?.metadata.kind === 'referral' && friendPromo.metadata.email === 'carol@example.com' && friendPromo.coupon === 'FRIEND-USD-500', 'friend code stored in Stripe with owner email');
    ok(state.emails.some((e) => e.to[0] === 'carol@example.com' && e.subject.includes(su.code) && e.html.includes(`?ref=${su.code}`)), 'friend code emailed with share link');
    const again = await (await signup({ name: 'Carol', email: 'carol@example.com' })).json();
    ok(again.code === su.code && again.isNew === false, 'same email → same code');
    const look = await (await fetch(`${A}/api/referral?code=${su.code.toLowerCase()}`)).json();
    ok(look.valid === true && look.kind === 'referral' && look.name === 'Carol' && look.cents === 500, 'code check: valid, first name, $5');
    ok((await (await fetch(`${A}/api/referral?code=NOPE1234`)).json()).valid === false, 'unknown code → not valid');

    const before = state.sessions.length;
    const badCo = await post(A, [{ design: 'not-old-seasoned', garment: 'tee', color: 'black', size: 'L', values: {}, qty: 1 }], { code: 'NOPE1234' });
    ok(badCo.status === 400 && (await badCo.json()).badCode === true && state.sessions.length === before, 'checkout refuses an invalid code');
    const two = [{ design: 'grill-nap-repeat', garment: 'tee', color: 'black', size: 'L', values: {}, qty: 2 }];
    const refCo = await post(A, two, { code: su.code });
    ok(refCo.status === 200, 'checkout with friend code');
    const rp = state.sessions.at(-1)!;
    const unit = Number(rp.get('line_items[0][price_data][unit_amount]'));
    const expectOff = Math.round((unit * 2 * 10) / 100) + 500;
    ok(rp.get('discounts[0][coupon]') === `SAVINGS-USD-${expectOff}` && state.amountCoupons[`SAVINGS-USD-${expectOff}`] === expectOff, `bundle 10% + $5 folded into one coupon (${rp.get('discounts[0][coupon]')})`);
    ok(rp.get('metadata[code]') === su.code && rp.get('metadata[code_kind]') === 'referral', 'code travels in session metadata');
    const refSession = `cs_test_s${state.sessions.length}`;
    const emailsBefore = state.emails.length;
    ok((await deliver(A, refSession, 'evt_ref1')).status === 200, 'webhook for friend-code order');
    const reward = state.promos.find((x) => x.metadata.kind === 'reward');
    ok(reward && /^THANKS[A-Z2-9]{6}$/.test(reward.code) && reward.metadata.email === 'carol@example.com' && reward.max_redemptions === 1 && !!reward.expires_at, `referrer gets a single-use $5 reward code (${reward?.code})`);
    const rewardMail = state.emails.slice(emailsBefore).find((e) => e.to[0] === 'carol@example.com');
    ok(!!rewardMail && rewardMail.html.includes(reward?.code ?? '?') && rewardMail.subject.includes('Linda'), 'reward emailed to the referrer');
    ok(state.emails.slice(emailsBefore).some((e) => e.to[0] === 'linda@example.com' && e.html.includes(`code ${su.code}`) && e.html.includes('/refer')), 'buyer confirmation shows the code + invites her to refer');

    // Referrer uses her reward → retired after the order
    const rwCo = await post(A, [{ design: 'not-old-seasoned', garment: 'tee', color: 'black', size: 'L', values: {}, qty: 1 }], { code: reward!.code });
    ok(rwCo.status === 200 && state.sessions.at(-1)!.get('discounts[0][coupon]') === 'SAVINGS-USD-500' && state.sessions.at(-1)!.get('metadata[code_kind]') === 'reward', 'reward code: $5 off a single shirt');
    await deliver(A, `cs_test_s${state.sessions.length}`, 'evt_rw1');
    ok(reward!.active === false && reward!.metadata.used_session === `cs_test_s${state.sessions.length}`, 'reward code retired after use');
    ok((await (await fetch(`${A}/api/referral?code=${reward!.code}`)).json()).valid === false, 'used reward code no longer valid');
    ok(state.promos.filter((x) => x.metadata.kind === 'reward').length === 1, 'using a reward earns nothing extra');

    // Self-referral: Linda signs up, then orders with her own code → discount, but no reward
    const self = await (await signup({ name: 'Linda', email: 'linda@example.com' })).json();
    await post(A, [{ design: 'not-old-seasoned', garment: 'tee', color: 'black', size: 'L', values: {}, qty: 1 }], { code: self.code });
    await deliver(A, `cs_test_s${state.sessions.length}`, 'evt_self');
    ok(state.promos.filter((x) => x.metadata.kind === 'reward').length === 1, 'own code: no reward for yourself');
    ok((await fetch(`${A}/refer`)).status === 200 && (await (await fetch(`${A}/refer`)).text()).includes('The rules, in plain English'), '/refer page');
    ok((await (await fetch(`${A}/`)).text()).includes('Get my code'), 'homepage has the friend-code form');

    console.log('\n6) German store (/de/)');
    const addr = { firstName: 'Gisela', lastName: 'Schmidt', street: 'Lindenstraße 12', extra: '', zip: '10115', city: 'Berlin', email: 'gisela@example.de' };
    const deCart = [
      { design: 'geliebt-von-enkeln', garment: 'tee', color: 'navy', size: 'L', values: { nickname: 'Omi', year: '2015', names: ['Jörg', 'Lea', 'Max'] }, qty: 1 },
      { design: 'familie-weihnachten', garment: 'hoodie', color: 'forest', size: 'XL', values: { surname: 'Müller', year: '2026' }, qty: 1 },
    ];
    const noAddr = await post(A, deCart, { locale: 'de' });
    ok(noAddr.status === 400 && /Vorname/.test((await noAddr.json()).error), 'German checkout needs the address (German error)');
    const badZip = await post(A, deCart, { locale: 'de', address: { ...addr, zip: '1011' } });
    ok(badZip.status === 400 && /Postleitzahl/.test((await badZip.json()).error), 'German checkout checks the postcode');
    const usInDe = await post(A, [{ design: 'not-old-seasoned', garment: 'tee', color: 'black', size: 'L', values: {}, qty: 1 }], { locale: 'de', address: addr });
    ok(usInDe.status === 400, 'US design can’t be ordered in the German store');
    const deInUs = await post(A, [deCart[0]]);
    ok(deInUs.status === 400, 'German design can’t be ordered in the US store');
    const deBadName = await post(A, [{ ...deCart[0], values: { nickname: '', names: ['Lea'] } }], { locale: 'de', address: addr });
    ok(deBadName.status === 400 && /Bitte ausfüllen/.test((await deBadName.json()).error), 'German validation messages');
    const deCo = await post(A, deCart, { locale: 'de', address: addr });
    ok(deCo.status === 200, 'German checkout returns Stripe URL');
    const dp = state.sessions.at(-1)!;
    const deSessionId = `cs_test_s${state.sessions.length}`;
    ok(dp.get('line_items[0][price_data][currency]') === 'eur' && dp.get('line_items[0][price_data][unit_amount]') === '2995', 'tee 29,95 € in euros');
    ok(dp.get('line_items[1][price_data][unit_amount]') === '4995', 'hoodie 49,95 €');
    ok(dp.get('discounts[0][coupon]') === 'MENGENRABATT-EUR-799' && state.amountCoupons['MENGENRABATT-EUR-799'] === 799, '2 items → exact 7,99 € bundle saving');
    ok(!dp.has('line_items[2][quantity]'), 'free shipping over 50 € (no shipping line)');
    ok(dp.get('locale') === 'de' && dp.get('metadata[store]') === 'de' && dp.get('customer_email') === addr.email, 'German Stripe page with the customer’s email');
    ok(!dp.has('shipping_address_collection[allowed_countries][0]') && dp.get('payment_intent_data[shipping][address][postal_code]') === '10115', 'address from our order page, not asked again');
    ok((dp.get('line_items[0][price_data][product_data][description]') ?? '').includes('Größe L') && (dp.get('line_items[0][price_data][product_data][description]') ?? '').includes('Jörg'), 'German item description with umlauts');
    const deOne = await post(A, [{ design: 'nicht-alt-vintage', garment: 'tee', color: 'black', size: '2XL', values: {}, qty: 1 }], { locale: 'de', address: addr });
    const dp2 = state.sessions.at(-1)!;
    ok(deOne.status === 200 && dp2.get('line_items[0][price_data][unit_amount]') === '3195' && dp2.get('line_items[1][price_data][unit_amount]') === '495' && !dp2.has('discounts[0][coupon]'), 'one tee 2XL: 31,95 € + 4,95 € shipping');
    const deWh = await deliver(A, deSessionId, 'evt_de1');
    ok(deWh.status === 200, `German webhook accepted (${deWh.status})`);
    const deOrder = state.printfulOrders.at(-1) as { recipient: { name: string; city: string; zip: string; country_code: string; address1: string }; retail_costs: { currency: string; discount: string; total: string }; items: { retail_price: string }[] };
    ok(deOrder.recipient.city === 'Berlin' && deOrder.recipient.zip === '10115' && deOrder.recipient.country_code === 'DE' && deOrder.recipient.address1 === 'Lindenstraße 12', 'Printful gets the German address');
    ok(deOrder.retail_costs.currency === 'EUR' && deOrder.retail_costs.discount === '7.99' && deOrder.retail_costs.total === '71.91', `retail costs in EUR (${JSON.stringify(deOrder.retail_costs)})`);
    const deMail = state.emails.find((e) => e.to[0] === addr.email);
    ok(deMail && /^Deine Bestellung SN-/.test(deMail.subject) && deMail.html.includes('Widerrufsbelehrung') && deMail.html.includes('Allgemeine Geschäftsbedingungen') && deMail.html.includes('Mengenrabatt') && deMail.html.includes('Jörg'), `German confirmation with terms + withdrawal notice (${deMail?.subject})`);
    const deWh2 = await deliver(A, `cs_test_s${state.sessions.length}`, 'evt_de2');
    const deOrder2 = state.printfulOrders.at(-1) as { retail_costs: { shipping: string; total: string } };
    ok(deWh2.status === 200 && deOrder2.retail_costs.shipping === '4.95' && deOrder2.retail_costs.total === '36.90', `German single item: shipping line handled (${JSON.stringify(deOrder2.retail_costs)})`);
    const wd = await fetch(`${A}/api/withdrawal`, { method: 'POST', body: JSON.stringify({ name: 'Gisela Schmidt', email: addr.email, order: 'SN-TEST123', items: '' }) });
    const wdJson = await wd.json();
    ok(wd.status === 200 && /Uhr$/.test(wdJson.stamp) && state.emails.some((e) => /^Eingangsbestätigung deines Widerrufs/.test(e.subject)), `withdrawal button: instant receipt (${wdJson.stamp})`);
    const wdBad = await fetch(`${A}/api/withdrawal`, { method: 'POST', body: JSON.stringify({ name: 'X' }) });
    ok(wdBad.status === 400, 'withdrawal needs name, email and order number');
    for (const page of ['/de/', '/de/shop/', '/de/shop/oma/', '/de/shop/mit-namen/', '/de/p/nicht-alt-vintage/', '/de/p/geliebt-von-enkeln/', '/de/warenkorb/', '/de/kasse/', '/de/danke/', '/de/faq/', '/de/impressum/', '/de/agb/', '/de/datenschutz/', '/de/widerrufsbelehrung/', '/de/versand-zahlung/', '/de/widerruf/', '/de/cookie-einstellungen/']) {
      const r = await fetch(`${A}${page}`);
      ok(r.status === 200, `page ${page}`);
    }
    ok((await fetch(`${A}/de/p/not-old-seasoned/`)).status === 404 && (await fetch(`${A}/p/nicht-alt-vintage/`)).status === 404, 'each store only shows its own designs');
    const deHome = await (await fetch(`${A}/de/`)).text();
    ok(deHome.includes('Nicht alt. Erfahren.') && deHome.includes('Vertrag widerrufen') && deHome.includes('Impressum'), 'German home page with withdrawal button + Impressum link');
    const deProd = await (await fetch(`${A}/de/p/nicht-alt-vintage/`)).text();
    ok(deProd.includes('Produktsicherheit') && deProd.includes('SINDEN VENTURES') && deProd.includes('inkl. MwSt.') && deProd.includes('"priceCurrency":"EUR"'), 'German product page: VAT note, product safety, euro price data');
    ok((await (await fetch(`${A}/api/geo`)).json()).country !== undefined, 'geo endpoint answers');

    for (const page of ['/', '/shop/', '/shop/grandma/', '/shop/personalized/', '/p/not-old-seasoned/', '/p/loved-by-grandkids/', '/pair/say-what-they-think/', '/cart/', '/thanks/', '/faq/', '/shipping/', '/returns/', '/privacy/', '/terms/', '/privacy-choices/']) {
      const r = await fetch(`${A}${page}`);
      ok(r.status === 200, `page ${page}`);
    }
    ok((await fetch(`${A}/p/no-such-shirt/`)).status === 404, 'unknown product → 404');
    const home = await (await fetch(`${A}/`)).text();
    ok(home.includes('Not old. Seasoned.') && home.includes('Shop by vibe'), 'home page content');
    const prod = await (await fetch(`${A}/p/not-old-seasoned/`)).text();
    ok(prod.includes('/og/not-old-seasoned.jpg') && prod.includes('application/ld+json'), 'product page has link preview image + product data');
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
  process.exit(1);
});
