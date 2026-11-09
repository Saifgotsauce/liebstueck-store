import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
// Contact sheets of every design on its default shirt color, for reviewing the phrase bank.
//   npm run design:sheet            (all)   →  out/designs/sheet-1.png …
//   npm run design:sheet -- grandma (only slugs containing "grandma"; comma-separate several)
import { ALL_DESIGNS as DESIGNS } from '../lib/designs';
import { getTemplate, defaultValues, designPalette } from '../lib/design/templates';
import { FONT_FILES } from '../lib/print/render';
import { GARMENTS } from '../lib/catalog';

const OUT = path.join(process.cwd(), 'out', 'designs');
fs.mkdirSync(OUT, { recursive: true });

const COLORS = Object.fromEntries(GARMENTS.tee.colors.map((c) => [c.key, { hex: c.hex, ink: c.ink }]));
const only = process.argv[2];
(async () => {
  const tiles: Buffer[] = [];
  const list = DESIGNS.filter((d) => !only || only.split(',').some((o) => d.slug.includes(o)));
  for (const d of list) {
    const t = getTemplate(d.slug);
    const c = COLORS[d.color];
    const p = designPalette(d.slug, c.ink);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 1200 1600"><rect width="1200" height="1600" fill="${c.hex}"/>${t.render(defaultValues(t), p)}<rect x="0" y="0" width="1200" height="1600" fill="none" stroke="#888" stroke-width="4"/></svg>`;
    const png = new Resvg(svg, { font: { fontFiles: FONT_FILES, loadSystemFonts: false, defaultFontFamily: 'Nunito Sans' } }).render().asPng();
    const label = Buffer.from(`<svg width="600" height="40"><rect width="600" height="40" fill="#fff"/><text x="10" y="28" font-size="22" font-family="sans-serif">${d.slug}</text></svg>`);
    tiles.push(await sharp({ create: { width: 600, height: 840, channels: 3, background: '#fff' } }).composite([{ input: png, top: 40, left: 0 }, { input: label, top: 0, left: 0 }]).png().toBuffer());
  }
  const cols = 5;
  const rows = Math.ceil(tiles.length / cols);
  const sheets = Math.ceil(rows / 2);
  for (let s = 0; s < sheets; s++) {
    const part = tiles.slice(s * cols * 2, (s + 1) * cols * 2);
    const out = await sharp({ create: { width: cols * 600, height: 2 * 840, channels: 3, background: '#ddd' } })
      .composite(part.map((b, i) => ({ input: b, left: (i % cols) * 600, top: Math.floor(i / cols) * 840 })))
      .png().toBuffer();
    await sharp(out).resize(1500).png().toFile(path.join(OUT, `sheet-${s + 1}.png`));
  }
  console.log(`${tiles.length} designs → out/designs/sheet-1…${sheets}.png`);
})();
