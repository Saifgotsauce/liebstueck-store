// Pulls variant IDs, costs, EU availability and print-file sizes from Printful and
// writes data/printful-variants.json. Run after creating your Printful account:
//
//   npm run printful:sync              → sync variants
//   npm run printful:sync -- --webhook → also register the shipping-email webhook
//
// Needs PRINTFUL_API_TOKEN (and PRINTFUL_STORE_ID for account-level tokens) in .env.local.
import fs from 'node:fs';
import path from 'node:path';
import { GARMENTS } from '../lib/catalog';

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
if (!TOKEN) {
  console.error('PRINTFUL_API_TOKEN is missing. Add it to .env.local (Printful → Settings → API).');
  process.exit(1);
}

async function pf<T>(method: string, p: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };
  if (STORE) headers['X-PF-Store-Id'] = STORE;
  const res = await fetch(`${BASE}${p}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const json = (await res.json().catch(() => null)) as { result?: T; error?: { message?: string } } | null;
  if (!res.ok) throw new Error(`${method} ${p}: ${json?.error?.message ?? res.status}`);
  return json!.result as T;
}

type PfVariant = { id: number; size: string; color: string; price: string; availability_status?: { region: string; status: string }[] };
type PfProduct = { product: { id: number; title: string; model?: string }; variants: PfVariant[] };
type PfPrintfiles = {
  printfiles: { printfile_id: number; width: number; height: number; dpi: number }[];
  variant_printfiles: { variant_id: number; placements: Record<string, number> }[];
};

const VAT = 1.19; // German VAT, for the margin overview only

async function main() {
  const out: Record<string, unknown> = {};
  let problems = 0;

  for (const g of Object.values(GARMENTS)) {
    const data = await pf<PfProduct>('GET', `/products/${g.printfulProductId}`);
    console.log(`\n${g.label.en}: Printful #${data.product.id} – ${data.product.title}`);
    const colorsAvailable = [...new Set(data.variants.map((v) => v.color))];

    const variants: Record<string, Record<string, { id: number; cost: number; eu: boolean | null }>> = {};
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
        const eu = v.availability_status ? v.availability_status.some((a) => a.region.startsWith('EU') && a.status === 'in_stock') : null;
        const cost = Number(v.price);
        variants[c.key][size] = { id: v.id, cost, eu };
        row.push(`${size}: €${cost.toFixed(2)}${eu === false ? ' (NOT in EU!)' : ''}`);
      }
      const sample = variants[c.key]['L'] ?? Object.values(variants[c.key])[0];
      const margin = sample ? g.priceCents / 100 / VAT - sample.cost : 0;
      console.log(`  ✓ ${c.label.en.padEnd(13)} ${row.join('  ')}   → margin (size L, after VAT, before shipping/ads): € ${margin.toFixed(2)}`);
    }

    // Print-file size for the front placement
    let printfile = { width: 1800, height: 2400, dpi: 150 };
    try {
      const pfiles = await pf<PfPrintfiles>('GET', `/mockup-generator/printfiles/${g.printfulProductId}`);
      const id = pfiles.variant_printfiles[0]?.placements?.front;
      const file = pfiles.printfiles.find((f) => f.printfile_id === id);
      if (file) printfile = { width: file.width, height: file.height, dpi: file.dpi };
      console.log(`  Front print file: ${printfile.width} × ${printfile.height} px @ ${printfile.dpi} dpi`);
    } catch (e) {
      console.log(`  ! Could not fetch print-file size (${(e as Error).message}) – using ${printfile.width} × ${printfile.height}`);
    }

    out[g.key] = { productId: data.product.id, productName: data.product.title, printfile, variants };
  }

  const file = path.join(root, 'data', 'printful-variants.json');
  fs.writeFileSync(file, JSON.stringify({ generatedAt: new Date().toISOString(), garments: out }, null, 2));
  console.log(`\nSaved: data/printful-variants.json${problems ? ` – fix ${problems} colour name(s) in lib/catalog.ts and run again.` : ''}`);
  console.log('Note: costs are Printful production prices without shipping. Shipping costs are in the Printful dashboard.');

  if (process.argv.includes('--webhook')) {
    const site = process.env.NEXT_PUBLIC_SITE_URL;
    const secret = process.env.PRINTFUL_WEBHOOK_SECRET;
    if (!site || site.includes('localhost') || !secret) {
      console.error('\nThe webhook needs NEXT_PUBLIC_SITE_URL (your real domain) and PRINTFUL_WEBHOOK_SECRET in .env.local.');
      process.exit(1);
    }
    await pf('POST', '/webhooks', {
      url: `${site.replace(/\/$/, '')}/api/webhooks/printful?token=${encodeURIComponent(secret)}`,
      types: ['package_shipped', 'order_failed', 'order_put_hold'],
    });
    console.log('\nWebhook registered: shipping emails with tracking are active.');
  }
}

main().catch((e) => {
  console.error('\nError:', e.message);
  process.exit(1);
});
