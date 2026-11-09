// Pulls everything the shop needs from Printful and saves it in the repo:
//   • variant IDs, costs, in-stock regions, print placement + print-file size → data/printful-variants.json
//   • real garment photos per colour (for the live preview)                   → public/mockups/<garment>/
//   • product photos of the featured designs (with --photos)                  → public/mockups/products/
//   data/printful-mockups.json lists the photos.
//
//   npm run printful:sync                        → variants + garment photos
//   npm run printful:sync -- --photos            → also product photos (needs the live site, see below)
//   npm run printful:sync -- --webhook           → also register the shipping-email webhook
//
// Needs PRINTFUL_API_TOKEN (+ PRINTFUL_STORE_ID for account-level tokens).
// --photos and --webhook also need NEXT_PUBLIC_SITE_URL (live domain); --photos needs PRINT_FILE_SECRET
// (same value as in Vercel) because Printful downloads the example print files from the live site.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { GARMENTS, getColor } from '../lib/catalog';
import { shop } from '../lib/config';
import { DESIGNS } from '../lib/designs';
import { defaultValues, getTemplate } from '../lib/design/templates';
import { buildPrintFileUrl } from '../lib/print-sign';

const root = process.cwd();
for (const f of ['.env.local', '.env']) {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const TOKEN = process.env.PRINTFUL_API_TOKEN;
const STORE = process.env.PRINTFUL_STORE_ID;
const BASE = process.env.PRINTFUL_API_BASE || 'https://api.printful.com';
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
const WANT_PHOTOS = process.argv.includes('--photos');
const WANT_WEBHOOK = process.argv.includes('--webhook');
if (!TOKEN) {
  console.error('PRINTFUL_API_TOKEN is missing. Add it to .env.local or as a GitHub secret (Printful → Settings → API).');
  process.exit(1);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function pf<T>(method: string, p: string, body?: unknown, retry = true): Promise<T> {
  const headers: Record<string, string> = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };
  if (STORE) headers['X-PF-Store-Id'] = STORE;
  const res = await fetch(`${BASE}${p}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (res.status === 429 && retry) {
    const wait = Number(res.headers.get('retry-after') || 60);
    console.log(`  (Printful rate limit – waiting ${wait}s)`);
    await sleep(wait * 1000);
    return pf(method, p, body, false);
  }
  const json = (await res.json().catch(() => null)) as { result?: T; error?: { message?: string } } | null;
  if (!res.ok) throw new Error(`${method} ${p}: ${json?.error?.message ?? res.status}`);
  return json!.result as T;
}

type PfVariant = { id: number; size: string; color: string; price: string; availability_status?: { region: string; status: string }[] };
type PfProduct = { product: { id: number; title: string; currency?: string }; variants: PfVariant[] };
type PfPrintfiles = {
  available_placements?: Record<string, string>;
  printfiles: { printfile_id: number; width: number; height: number; dpi: number }[];
  variant_printfiles: { variant_id: number; placements: Record<string, number> }[];
};
type PfTemplate = {
  template_id: number;
  image_url: string | null;
  background_url: string | null;
  background_color: string | null;
  printfile_id: number;
  template_width: number;
  template_height: number;
  print_area_width: number;
  print_area_height: number;
  print_area_top: number;
  print_area_left: number;
  is_template_on_front: boolean;
};
type PfTemplates = { variant_mapping: { variant_id: number; templates: { placement: string; template_id: number }[] }[]; templates: PfTemplate[] };
type PfTask = { task_key: string; status: string; error?: string; mockups?: { placement: string; variant_ids: number[]; mockup_url: string; extra?: { title?: string; option?: string; url: string }[] }[] };

export type MockupColor = {
  w: number;
  h: number;
  area: { left: number; top: number; width: number; height: number };
  bg: string | null;
  bgColor: string | null;
  overlay: string | null;
  overlayOnTop: boolean;
};

const REGION = shop.fulfilmentRegion;
const inRegion = (r: string) => r === REGION || r.startsWith(`${REGION}_`);
const MOCKUP_DIR = path.join(root, 'public', 'mockups');

/** Downloads an image once and stores it as WebP (keeps transparency), max 1200 px. */
const saved = new Map<string, string>();
async function saveImage(url: string, rel: string, maxSize = 1200, quality = 82) {
  if (saved.has(url)) return saved.get(url)!;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${url}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const out = path.join(MOCKUP_DIR, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await sharp(buf).resize({ width: maxSize, height: maxSize, fit: 'inside', withoutEnlargement: true }).webp({ quality }).toFile(out);
  const pub = `/mockups/${rel}`;
  saved.set(url, pub);
  return pub;
}

async function main() {
  const variantsOut: Record<string, unknown> = {};
  const mockupsFile = path.join(root, 'data', 'printful-mockups.json');
  const previous = fs.existsSync(mockupsFile) ? JSON.parse(fs.readFileSync(mockupsFile, 'utf8')) : {};
  const garmentPhotos: Record<string, { placement: string; colors: Record<string, MockupColor> }> = {};
  let problems = 0;
  fs.mkdirSync(MOCKUP_DIR, { recursive: true });

  for (const g of Object.values(GARMENTS)) {
    const data = await pf<PfProduct>('GET', `/products/${g.printfulProductId}`);
    const cur = data.product.currency ?? '(currency not stated by Printful)';
    console.log(`\n${g.label}: Printful #${data.product.id} – ${data.product.title} – costs in ${cur}${cur !== 'USD' ? ' (set your Printful billing currency to USD so costs and prices compare 1:1)' : ''}`);
    const colorsAvailable = [...new Set(data.variants.map((v) => v.color))];

    const variants: Record<string, Record<string, { id: number; cost: number; regions?: string[] }>> = {};
    for (const c of g.colors) {
      const matches = data.variants.filter((v) => v.color.toLowerCase() === c.printfulColor.toLowerCase());
      if (!matches.length) {
        problems++;
        console.log(`  ✗ Colour “${c.printfulColor}” not found at Printful. Available: ${colorsAvailable.join(', ')}`);
        continue;
      }
      variants[c.key] = {};
      const row: string[] = [];
      for (const size of g.sizes) {
        const v = matches.find((m) => m.size.toUpperCase() === size.toUpperCase());
        if (!v) {
          row.push(`${size}: –`);
          continue;
        }
        const regions = v.availability_status ? v.availability_status.filter((a) => a.status === 'in_stock').map((a) => a.region) : undefined;
        const cost = Number(v.price);
        variants[c.key][size] = { id: v.id, cost, ...(regions ? { regions } : {}) };
        const out = regions && !regions.some(inRegion);
        row.push(`${size}: ${cost.toFixed(2)}${out ? ` (not in stock in ${REGION} → hidden)` : ''}`);
      }
      const sample = variants[c.key]['L'] ?? Object.values(variants[c.key])[0];
      const margin = sample ? g.priceCents / 100 - sample.cost : 0;
      const allOut = Object.values(variants[c.key]).every((v) => v.regions && !v.regions.some(inRegion));
      console.log(`  ${allOut ? '✗' : '✓'} ${c.label.padEnd(14)} ${row.join('  ')}   → size L: price minus Printful cost (before shipping, fees, ads): ${margin.toFixed(2)}${allOut ? `   COLOR HIDDEN: not in stock in ${REGION}` : ''}`);
    }

    // Print placement + print-file size. Printful moved many DTG tees to "front_large" (15″ × 18″) in 2025.
    let placement = 'front';
    let printfile = { width: 1800, height: 2400, dpi: 150 };
    try {
      const pfiles = await pf<PfPrintfiles>('GET', `/mockup-generator/printfiles/${g.printfulProductId}`);
      const placements = Object.keys(pfiles.available_placements ?? pfiles.variant_printfiles[0]?.placements ?? {});
      placement = placements.includes('front_large') ? 'front_large' : placements.includes('front') ? 'front' : placements[0] ?? 'front';
      const id = pfiles.variant_printfiles[0]?.placements?.[placement];
      const file = pfiles.printfiles.find((f) => f.printfile_id === id);
      if (file) printfile = { width: file.width, height: file.height, dpi: file.dpi };
      console.log(`  Print placement “${placement}”: ${printfile.width} × ${printfile.height} px @ ${printfile.dpi} dpi`);
    } catch (e) {
      console.log(`  ! Could not fetch print-file info (${(e as Error).message}) – using “front”, ${printfile.width} × ${printfile.height}`);
    }
    variantsOut[g.key] = { productId: data.product.id, productName: data.product.title, currency: data.product.currency ?? null, placement, printfile, variants };

    // Real garment photos for the live preview (Printful layout templates)
    try {
      const tpl = await pf<PfTemplates>('GET', `/mockup-generator/templates/${g.printfulProductId}`);
      const byId = new Map(tpl.templates.map((t) => [t.template_id, t]));
      const colors: Record<string, MockupColor> = {};
      for (const c of g.colors) {
        const v = variants[c.key]?.['L'] ?? Object.values(variants[c.key] ?? {})[0];
        if (!v) continue;
        const map = tpl.variant_mapping.find((m) => m.variant_id === v.id);
        const ref = map?.templates.find((t) => t.placement === placement) ?? map?.templates.find((t) => t.placement.startsWith('front'));
        const t = ref && byId.get(ref.template_id);
        if (!t) {
          console.log(`  ! No photo template for ${c.label}`);
          continue;
        }
        colors[c.key] = {
          w: t.template_width,
          h: t.template_height,
          area: { left: t.print_area_left, top: t.print_area_top, width: t.print_area_width, height: t.print_area_height },
          bg: t.background_url ? await saveImage(t.background_url, `${g.key}/${t.template_id}-bg.webp`) : null,
          bgColor: t.background_color,
          overlay: t.image_url ? await saveImage(t.image_url, `${g.key}/${t.template_id}-overlay.webp`) : null,
          overlayOnTop: t.is_template_on_front !== false,
        };
      }
      garmentPhotos[g.key] = { placement, colors };
      console.log(`  Garment photos: ${Object.keys(colors).length}/${g.colors.length} colours`);
    } catch (e) {
      console.log(`  ! Could not fetch garment photos (${(e as Error).message})`);
    }
  }

  fs.writeFileSync(path.join(root, 'data', 'printful-variants.json'), JSON.stringify({ generatedAt: new Date().toISOString(), garments: variantsOut }, null, 2));

  // Product photos from Printful's mockup generator (model / flat-lay shots of each example design)
  let productPhotos: Record<string, { src: string; title: string }[]> = previous.products ?? {};
  const secret = process.env.PRINT_FILE_SECRET;
  const photosReady = Boolean(SITE && secret && (!SITE.includes('localhost') || process.env.PRINTFUL_API_BASE));
  if (WANT_PHOTOS && !photosReady) {
    console.log('\n! Skipped product photos: they need the GitHub variable SITE_URL (your live site address) and the secret PRINT_FILE_SECRET (same value as in Vercel). Everything else was saved.');
  }
  if (WANT_PHOTOS && photosReady && secret) {
    productPhotos = {};
    // Model/flat-lay photos for the featured designs (one mockup task each – Printful rate-limits these)
    for (const p of DESIGNS.filter((d) => d.featured)) {
      const g = GARMENTS.tee;
      const color = getColor(g, p.color) ?? g.colors[0];
      const info = variantsOut[g.key] as { placement: string; printfile: { width: number; height: number }; variants: Record<string, Record<string, { id: number }>> };
      const variant = info.variants[color.key]?.['L'];
      if (!variant) continue;
      const imageUrl = buildPrintFileUrl(SITE, secret, { p: p.slug, g: g.key, c: color.key, v: defaultValues(getTemplate(p.slug)) });
      const { width, height } = info.printfile;
      console.log(`\nPhotos for ${p.slug} (${g.label}, ${color.label}) …`);
      const task = await pf<{ task_key: string }>('POST', `/mockup-generator/create-task/${g.printfulProductId}`, {
        variant_ids: [variant.id],
        format: 'jpg',
        files: [{ placement: info.placement, image_url: imageUrl, position: { area_width: width, area_height: height, width, height, top: 0, left: 0 } }],
      });
      let result: PfTask | null = null;
      for (let i = 0; i < 40; i++) {
        await sleep(i === 0 ? 5000 : 4000);
        result = await pf<PfTask>('GET', `/mockup-generator/task?task_key=${encodeURIComponent(task.task_key)}`);
        if (result.status !== 'pending') break;
      }
      if (!result || result.status !== 'completed') {
        console.log(`  ! Mockup task ${result?.status ?? 'timed out'} ${result?.error ?? ''}`);
        continue;
      }
      const urls: { url: string; title: string }[] = [];
      for (const m of result.mockups ?? []) {
        urls.push({ url: m.mockup_url, title: m.placement });
        for (const x of m.extra ?? []) urls.push({ url: x.url, title: x.title || x.option || '' });
      }
      productPhotos[p.slug] = [];
      for (const [i, u] of urls.slice(0, 6).entries()) {
        productPhotos[p.slug].push({ src: await saveImage(u.url, `products/${p.slug}-${i + 1}.webp`, 1400, 85), title: u.title });
      }
      console.log(`  ✓ ${productPhotos[p.slug].length} photos saved`);
    }
  }

  fs.writeFileSync(mockupsFile, JSON.stringify({ generatedAt: new Date().toISOString(), garments: garmentPhotos, products: productPhotos }, null, 2));
  console.log(`\nSaved: data/printful-variants.json, data/printful-mockups.json${problems ? ` – fix ${problems} colour name(s) in lib/catalog.ts and run again.` : ''}`);
  console.log('Note: costs are Printful production prices without shipping. Shipping costs are in the Printful dashboard.');

  if (WANT_WEBHOOK) {
    const secret = process.env.PRINTFUL_WEBHOOK_SECRET;
    if (!SITE || SITE.includes('localhost') || !secret) {
      console.error('\nThe webhook needs NEXT_PUBLIC_SITE_URL (your real domain) and PRINTFUL_WEBHOOK_SECRET.');
      process.exit(1);
    }
    await pf('POST', '/webhooks', {
      url: `${SITE}/api/webhooks/printful?token=${encodeURIComponent(secret)}`,
      types: ['package_shipped', 'order_failed', 'order_put_hold'],
    });
    console.log('\nWebhook registered: shipping emails with tracking are active.');
  }
}

main().catch((e) => {
  console.error('\nError:', e.message);
  process.exit(1);
});
