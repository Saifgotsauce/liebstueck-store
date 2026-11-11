// Seasoned icon + wordmark: npx tsx scripts/make-icons.ts
// → app/icon.png, app/apple-icon.png, app/favicon.ico (site, both stores)
// → out/brand/seasoned-icon-512.png, seasoned-logo.png (for Stripe branding)
import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';

const ROOT = process.cwd();
const VIOLET = '#5B2A86';
const RED = '#E2342B';
const LILAC = '#F2ECF8';
const variant = process.argv[2] ?? 'violet';
const font = { fontFiles: [path.join(ROOT, 'public/fonts/Fraunces_900Black.ttf')], loadSystemFonts: false, defaultFontFamily: 'Fraunces' };
const png = (svg: string, w: number) => Buffer.from(new Resvg(svg, { font, fitTo: { mode: 'width', value: w } }).render().asPng());

// "S." – the wordmark's first letter and its red full stop
const [bg, ink] = variant === 'lilac' ? [LILAC, VIOLET] : [VIOLET, '#FFFFFF'];
const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
<rect width="512" height="512" rx="112" fill="${bg}"/>
<text x="212" y="392" font-family="Fraunces" font-weight="900" font-size="400" fill="${ink}" text-anchor="middle">S</text>
<circle cx="372" cy="362" r="40" fill="${RED}"${variant === 'lilac' ? '' : ' stroke="#FFFFFF" stroke-width="8"'}/>
</svg>`;
const logo = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="320" viewBox="0 0 1200 320">
<text x="600" y="228" font-family="Fraunces" font-weight="900" font-size="210" fill="${VIOLET}" text-anchor="middle">Seasoned<tspan fill="${RED}">.</tspan></text>
</svg>`;

async function main() {
  const out = path.join(ROOT, 'out', 'brand');
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'seasoned-icon-512.png'), png(icon, 512));
  // Stripe rounds the icon itself, so it gets a full square
  fs.writeFileSync(path.join(out, 'seasoned-icon-stripe.png'), png(icon.replace('rx="112"', 'rx="0"'), 512));
  fs.writeFileSync(path.join(out, 'seasoned-logo.png'), await sharp(png(logo, 1200)).trim({ threshold: 1 }).extend({ top: 24, bottom: 24, left: 24, right: 24, background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer());
  if (process.argv.includes('--site')) {
    fs.writeFileSync(path.join(ROOT, 'app', 'icon.png'), png(icon, 512));
    fs.writeFileSync(path.join(ROOT, 'app', 'apple-icon.png'), await sharp(png(icon.replace('rx="112"', 'rx="0"'), 180)).png().toBuffer());
    // favicon.ico with 16, 32 and 48 px PNGs inside
    const sizes = [16, 32, 48];
    const imgs = await Promise.all(sizes.map((s) => sharp(png(icon, 512)).resize(s, s).png().toBuffer()));
    const head = Buffer.alloc(6 + 16 * sizes.length);
    head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(sizes.length, 4);
    let off = head.length;
    sizes.forEach((s, i) => {
      const e = 6 + 16 * i;
      head.writeUInt8(s, e); head.writeUInt8(s, e + 1); head.writeUInt8(0, e + 2); head.writeUInt8(0, e + 3);
      head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6); head.writeUInt32LE(imgs[i].length, e + 8); head.writeUInt32LE(off, e + 12);
      off += imgs[i].length;
    });
    fs.writeFileSync(path.join(ROOT, 'app', 'favicon.ico'), Buffer.concat([head, ...imgs]));
  }
}
main();
