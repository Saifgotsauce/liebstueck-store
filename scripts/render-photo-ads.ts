// Ad images from the on-model photos (lib/model-photos.ts).
//   npx tsx scripts/render-photo-ads.ts
// → out/ads/<nn>-<slug>-feed.jpg  (1080×1350, Facebook/Instagram feed)
// → out/ads/<nn>-<slug>-story.jpg (1080×1920, Stories/Reels; text kept inside the safe zone)
import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { brand, formatPrice, stores } from '../lib/config';
import { getDesign, getVibe } from '../lib/designs';
import { esc } from '../lib/design/text';
import { MODEL_PHOTOS } from '../lib/model-photos';
import { FONT_FILES } from '../lib/print/render';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'out', 'ads');
const SITE_FONTS = ['DMSans_700Bold.ttf', 'DMSans_500Medium.ttf'].map((f) => path.join(ROOT, 'public', 'fonts', f));
const fonts = { fontFiles: [...FONT_FILES, ...SITE_FONTS], loadSystemFonts: false, defaultFontFamily: 'DM Sans' };
const VIOLET = '#5B2A86';
const LILAC = '#F2ECF8';
const RED = '#E2342B';
const W = 1080;

const svgPng = (h: number, body: string) =>
  new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${h}">${body}</svg>`, { font: fonts }).render().asPng();
const wordmark = (y: number, size: number, fill: string) =>
  `<text x="${W / 2}" y="${y}" font-family="Fraunces" font-weight="900" font-size="${size}" fill="${fill}" text-anchor="middle">${esc(brand.name)}<tspan fill="${RED}">.</tspan></text>`;
const offer = `Buy 2, save 10% · Free US shipping over ${formatPrice(stores.en.freeShippingFromCents)}`;

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  let n = 0;
  for (const [slug, count] of Object.entries(MODEL_PHOTOS)) {
    n++;
    const d = getDesign(slug)!;
    const hook = getVibe(d.vibe)!.hook;
    for (let i = 1; i <= count; i++) {
      const photo = await sharp(path.join(ROOT, 'public', 'photos', `${slug}-${i}.jpg`)).resize(W, W).toBuffer();
      const name = `${String(n).padStart(2, '0')}${i > 1 ? String.fromCharCode(96 + i) : ''}-${slug}`;

      // Feed 4:5: full-bleed photo, violet band with brand + offer.
      const feed = svgPng(1350, `<rect width="${W}" height="1350" fill="${VIOLET}"/>${wordmark(1080 + 132, 84, '#fff')}
<text x="${W / 2}" y="${1080 + 202}" font-family="DM Sans" font-weight="700" font-size="34" fill="${LILAC}" text-anchor="middle">${esc(offer)}</text>`);
      await sharp(feed).composite([{ input: photo, left: 0, top: 0 }]).jpeg({ quality: 88, mozjpeg: true }).toFile(path.join(OUT, `${name}-feed.jpg`));

      // Story 9:16: hook on top, photo, brand + offer – all between y 270 and 1650.
      const [l1, l2] = hook.includes('?') ? [hook.slice(0, hook.indexOf('?') + 1), hook.slice(hook.indexOf('?') + 1).trim()] : [hook, ''];
      const story = svgPng(1920, `<rect width="${W}" height="1920" fill="${LILAC}"/>
<text x="${W / 2}" y="318" font-family="Fraunces" font-weight="900" font-size="72" fill="${VIOLET}" text-anchor="middle">${esc(l1)}</text>
<text x="${W / 2}" y="398" font-family="Fraunces" font-weight="900" font-size="72" fill="${RED}" text-anchor="middle">${esc(l2)}</text>
${wordmark(1612, 76, VIOLET)}
<text x="${W / 2}" y="1668" font-family="DM Sans" font-weight="700" font-size="34" fill="#1E1626" text-anchor="middle">${esc(offer)}</text>`);
      await sharp(story).composite([{ input: photo, left: 0, top: 436 }]).jpeg({ quality: 88, mozjpeg: true }).toFile(path.join(OUT, `${name}-story.jpg`));
      console.log(`✓ ${name}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
