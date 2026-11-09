// Renders images for every design from the same files the shop uses:
//   public/og/<slug>.jpg                → link previews (Facebook, iMessage, Google)
//   out/creatives/<slug>-feed.jpg       → 4:5 ad image (Facebook / Instagram feed)
//   out/creatives/<slug>-story.jpg      → 9:16 ad image (Stories / Reels)
//   npm run render:mockups              (all designs)
//   npm run render:mockups -- grandma   (only slugs containing "grandma")
import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { defaultColor, GARMENTS, getColor, unitPriceCents, type GarmentKey } from '../lib/catalog';
import { brand, formatPrice, shop } from '../lib/config';
import { DESIGNS, isPersonalized, type Design } from '../lib/designs';
import { defaultValues, designPalette, getTemplate } from '../lib/design/templates';
import { esc } from '../lib/design/text';
import { garmentPhoto, mockupGeometry, type MockupView } from '../lib/mockups';
import { FONT_FILES } from '../lib/print/render';

const ROOT = process.cwd();
const OG_DIR = path.join(ROOT, 'public', 'og');
const AD_DIR = path.join(ROOT, 'out', 'creatives');
const SITE_FONTS = ['DMSans_700Bold.ttf', 'DMSans_500Medium.ttf'].map((f) => path.join(ROOT, 'public', 'fonts', f));
const fonts = { fontFiles: [...FONT_FILES, ...SITE_FONTS], loadSystemFonts: false, defaultFontFamily: 'DM Sans' };

const VIOLET = '#5B2A86';
const LILAC = '#F2ECF8';
const RED = '#E2342B';

const dataUris = new Map<string, string>();
async function asDataUri(publicPath: string) {
  if (!dataUris.has(publicPath)) {
    const png = await sharp(path.join(ROOT, 'public', publicPath)).png().toBuffer();
    dataUris.set(publicPath, `data:image/png;base64,${png.toString('base64')}`);
  }
  return dataUris.get(publicPath)!;
}

/** The design on the garment photo as a square PNG of `px` pixels. */
async function shirt(d: Design, garment: GarmentKey, view: MockupView, px: number) {
  const colorKey = defaultColor(d, garment);
  const color = getColor(GARMENTS[garment], colorKey)!;
  const photo = garmentPhoto(garment, colorKey);
  if (!photo) throw new Error(`No garment photo for ${garment}/${colorKey} – run the Printful sync first.`);
  const t = getTemplate(d.slug);
  const design = t.render(defaultValues(t), designPalette(d.slug, color.ink));
  const { d: r, viewBox } = mockupGeometry(photo, garment, view);
  const { w, h } = photo;
  const overlay = photo.overlay ? `<image href="${await asDataUri(photo.overlay)}" x="0" y="0" width="${w}" height="${h}"/>` : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${px}" height="${px}">
<rect x="0" y="0" width="${w}" height="${h}" fill="#fff"/>
${photo.bgColor ? `<rect x="0" y="0" width="${w}" height="${h}" fill="${photo.bgColor}"/>` : ''}
${photo.bg ? `<image href="${await asDataUri(photo.bg)}" x="0" y="0" width="${w}" height="${h}"/>` : ''}
${photo.overlayOnTop ? '' : overlay}
<svg x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" viewBox="0 0 1200 1600">${design}</svg>
${photo.overlayOnTop ? overlay : ''}</svg>`;
  return new Resvg(svg, { font: fonts, fitTo: { mode: 'width', value: px } }).render().asPng();
}

function text(svgW: number, svgH: number, body: string) {
  return new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}">${body}</svg>`, { font: fonts }).render().asPng();
}

const wordmark = (x: number, y: number, size: number, fill: string, anchor = 'start') =>
  `<text x="${x}" y="${y}" font-family="Fraunces" font-weight="900" font-size="${size}" fill="${fill}" text-anchor="${anchor}">${esc(brand.name)}<tspan fill="${RED}">.</tspan></text>`;

async function og(d: Design) {
  const img = await shirt(d, 'tee', 'main', 630);
  const personal = isPersonalized(d);
  const panel = text(
    570,
    630,
    `<rect width="570" height="630" fill="${VIOLET}"/>${wordmark(56, 120, 64, '#fff')}
<text x="56" y="470" font-family="DM Sans" font-weight="700" font-size="34" fill="#fff">${personal ? 'Personalize it' : 'Funny shirts, printed to order'}</text>
<text x="56" y="520" font-family="DM Sans" font-weight="500" font-size="30" fill="#E6DAF2">T-shirts from ${formatPrice(unitPriceCents('tee'))}</text>
<text x="56" y="565" font-family="DM Sans" font-weight="500" font-size="30" fill="#E6DAF2">Free US shipping over ${formatPrice(shop.freeShippingFromCents)}</text>`,
  );
  await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#fff' } })
    .composite([{ input: panel, left: 0, top: 0 }, { input: img, left: 570, top: 0 }])
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(path.join(OG_DIR, `${d.slug}.jpg`));
}

async function ad(d: Design, kind: 'feed' | 'story') {
  const W = 1080;
  const H = kind === 'feed' ? 1350 : 1920;
  const size = kind === 'feed' ? 1000 : 1000;
  const top = kind === 'feed' ? 60 : 300;
  const img = await shirt(d, 'tee', 'main', size);
  const rounded = await sharp(img)
    .composite([{ input: Buffer.from(`<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="44" fill="#fff"/></svg>`), blend: 'dest-in' }])
    .png()
    .toBuffer();
  const band = H - (top + size) - 40;
  const bottom = text(
    W,
    H,
    `<rect width="${W}" height="${H}" fill="${LILAC}"/>
${wordmark(W / 2, top + size + band * 0.45, 76, VIOLET, 'middle')}
<text x="${W / 2}" y="${top + size + band * 0.45 + 62}" font-family="DM Sans" font-weight="700" font-size="34" fill="#1E1626" text-anchor="middle">${isPersonalized(d) ? 'Personalize it' : 'Buy 2, save 10%'} | Free US shipping over ${formatPrice(shop.freeShippingFromCents)}</text>`,
  );
  await sharp(bottom)
    .composite([{ input: rounded, left: (W - size) / 2, top }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(path.join(AD_DIR, `${d.slug}-${kind}.jpg`));
}

async function main() {
  const filter = process.argv[2];
  const list = DESIGNS.filter((d) => !filter || d.slug.includes(filter));
  fs.mkdirSync(OG_DIR, { recursive: true });
  fs.mkdirSync(AD_DIR, { recursive: true });
  for (const d of list) {
    await og(d);
    await ad(d, 'feed');
    await ad(d, 'story');
    console.log(`✓ ${d.slug}`);
  }
  console.log(`\n${list.length} designs → public/og/ (link previews) and out/creatives/ (ad images)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
