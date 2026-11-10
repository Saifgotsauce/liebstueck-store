// Reference sheets for making on-model product shots in ChatGPT.
//   npx tsx scripts/chatgpt-sheets.ts
// → out/chatgpt/seasoned-batch-1.jpg … -5.jpg (10 numbered US designs each)
// → out/chatgpt/batches.json (number, slug, title, colour, print wording) for the prompt guide
import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { defaultColor, GARMENTS, getColor } from '../lib/catalog';
import { designsFor, type Design } from '../lib/designs';
import { defaultValues, designPalette, getTemplate } from '../lib/design/templates';
import { esc } from '../lib/design/text';
import { garmentPhoto, mockupGeometry } from '../lib/mockups';
import { FONT_FILES } from '../lib/print/render';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'out', 'chatgpt');
const SITE_FONTS = ['DMSans_700Bold.ttf', 'DMSans_500Medium.ttf'].map((f) => path.join(ROOT, 'public', 'fonts', f));
const fonts = { fontFiles: [...FONT_FILES, ...SITE_FONTS], loadSystemFonts: false, defaultFontFamily: 'DM Sans' };
const VIOLET = '#5B2A86';
const RED = '#E2342B';

const uris = new Map<string, string>();
async function uri(publicPath: string) {
  if (!uris.has(publicPath)) {
    const png = await sharp(path.join(ROOT, 'public', publicPath)).png().toBuffer();
    uris.set(publicPath, `data:image/png;base64,${png.toString('base64')}`);
  }
  return uris.get(publicPath)!;
}

/** Tee in the design's default colour with the print, as a square PNG. */
async function tee(d: Design, px: number) {
  const colorKey = defaultColor(d, 'tee');
  const color = getColor(GARMENTS.tee, colorKey)!;
  const photo = garmentPhoto('tee', colorKey);
  if (!photo) throw new Error(`No tee photo for ${colorKey}`);
  const t = getTemplate(d.slug);
  const design = t.render(defaultValues(t), designPalette(d.slug, color));
  const { d: r, viewBox } = mockupGeometry(photo, 'tee', 'main');
  const { w, h } = photo;
  const overlay = photo.overlay ? `<image href="${await uri(photo.overlay)}" x="0" y="0" width="${w}" height="${h}"/>` : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${px}" height="${px}">
<rect x="0" y="0" width="${w}" height="${h}" fill="#fff"/>
${photo.bgColor ? `<rect x="0" y="0" width="${w}" height="${h}" fill="${photo.bgColor}"/>` : ''}
${photo.bg ? `<image href="${await uri(photo.bg)}" x="0" y="0" width="${w}" height="${h}"/>` : ''}
${photo.overlayOnTop ? '' : overlay}
<svg x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" viewBox="0 0 1200 1600">${design}</svg>
${photo.overlayOnTop ? overlay : ''}</svg>`;
  return { png: new Resvg(svg, { font: fonts, fitTo: { mode: 'width', value: px } }).render().asPng(), colorLabel: color.label };
}

/** The words printed on the shirt, top to bottom, with the default personalisation filled in. */
function printWords(d: Design): string[] {
  const t = getTemplate(d.slug);
  const vals = defaultValues(t) as Record<string, unknown>;
  const fill = (s: string) =>
    s.replace(/\{(\w+)\}/g, (_, k) => {
      const v = vals[k];
      return Array.isArray(v) ? v.join(', ') : String(v ?? '');
    });
  const spec = d.spec as Record<string, any>;
  const out: string[] = [];
  const line = (l: any) => {
    const s = fill(typeof l === 'string' ? l : l.t);
    out.push(l.upper ? s.toUpperCase() : s);
  };
  if (spec.layout === 'names') {
    out.push(fill(spec.title).toUpperCase());
    if (spec.est) out.push(`EST. ${vals[spec.est]}`);
    out.push(spec.lovedBy);
    const names = vals[spec.namesKey];
    out.push(Array.isArray(names) ? names.join(' · ') : String(names));
    return out;
  }
  if (spec.header) out.push(fill(spec.header).toUpperCase());
  if (spec.top) out.push(fill(spec.top));
  if (Array.isArray(spec.title)) spec.title.forEach(line);
  if (spec.big) out.push(fill(spec.big));
  if (Array.isArray(spec.lines)) spec.lines.forEach(line);
  if (Array.isArray(spec.items)) spec.items.forEach((i: string) => out.push(`☐ ${fill(i)}`));
  if (spec.bottom) out.push(fill(spec.bottom));
  if (spec.by) out.push(fill(spec.by));
  return out;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const designs = designsFor('en');
  const COLS = 4, CELL = 600, CAP = 64, HEAD = 96, PAD = 24;
  const W = COLS * CELL + (COLS + 1) * PAD;
  const H = HEAD + 3 * (CELL + CAP) + 4 * PAD;
  const meta: any[] = [];
  for (let b = 0; b < Math.ceil(designs.length / 10); b++) {
    const batch = designs.slice(b * 10, b * 10 + 10);
    let cells = '';
    for (let i = 0; i < batch.length; i++) {
      const d = batch[i];
      const { png, colorLabel } = await tee(d, CELL);
      const x = PAD + (i % COLS) * (CELL + PAD);
      const y = HEAD + PAD + Math.floor(i / COLS) * (CELL + CAP + PAD);
      const n = i + 1;
      cells += `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL + CAP}" rx="18" fill="#fff"/>
<image href="data:image/png;base64,${png.toString('base64')}" x="${x}" y="${y}" width="${CELL}" height="${CELL}"/>
<circle cx="${x + 52}" cy="${y + 52}" r="38" fill="${RED}"/>
<text x="${x + 52}" y="${y + 67}" font-family="DM Sans" font-weight="700" font-size="44" fill="#fff" text-anchor="middle">${n}</text>
<text x="${x + 20}" y="${y + CELL + 42}" font-family="DM Sans" font-weight="700" font-size="25" fill="${VIOLET}">#${n} · ${esc(colorLabel)} tee</text>`;
      meta.push({ batch: b + 1, n, slug: d.slug, title: d.title, vibe: d.vibe, color: colorLabel, words: printWords(d) });
    }
    // Last row: instruction panel in the two empty slots.
    const px = PAD + 2 * (CELL + PAD), py = HEAD + PAD + 2 * (CELL + CAP + PAD), pw = 2 * CELL + PAD;
    const panel = `<rect x="${px}" y="${py}" width="${pw}" height="${CELL + CAP}" rx="18" fill="${VIOLET}"/>
<text font-family="DM Sans" font-weight="700" fill="#fff">
<tspan x="${px + 48}" y="${py + 120}" font-size="64">Batch ${b + 1} of 5</tspan>
<tspan x="${px + 48}" y="${py + 210}" font-size="34" font-weight="500">One separate product photo per numbered shirt.</tspan>
<tspan x="${px + 48}" y="${py + 262}" font-size="34" font-weight="500">Copy the print exactly: words, fonts, colours,</tspan>
<tspan x="${px + 48}" y="${py + 314}" font-size="34" font-weight="500">line breaks, size and position on the chest.</tspan>
<tspan x="${px + 48}" y="${py + 366}" font-size="34" font-weight="500">Keep the shirt colour exactly as shown.</tspan>
<tspan x="${px + 48}" y="${py + 560}" font-size="40">Seasoned.</tspan></text>`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="#F2ECF8"/>
<text x="${PAD}" y="66" font-family="DM Sans" font-weight="700" font-size="44" fill="${VIOLET}">Seasoned – product shot references · Batch ${b + 1} (#1–#${batch.length})</text>
${cells}${panel}</svg>`;
    const png = new Resvg(svg, { font: fonts }).render().asPng();
    const file = path.join(OUT, `seasoned-batch-${b + 1}.jpg`);
    await sharp(png).jpeg({ quality: 90 }).toFile(file);
    console.log(`✓ ${file} (${W}×${H})`);
  }
  fs.writeFileSync(path.join(OUT, 'batches.json'), JSON.stringify(meta, null, 1));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
