// Stress-tests personalization: renders the extreme inputs (longest names, most names, accents)
// as real print files and a contact sheet for eyeballing.  npm run test:print → out/print-test/
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { getTemplate } from '../lib/design/templates';
import { designPalette } from '../lib/design/templates';
import { validateValues } from '../lib/design/validate';
import { renderPrintPng } from '../lib/print/render';

const out = path.join(process.cwd(), 'out', 'print-test');
fs.mkdirSync(out, { recursive: true });

const cases: { d: string; v: Record<string, string | string[]>; name: string }[] = [
  { d: 'loved-by-grandkids', v: { nickname: 'Grandmother', year: '1998', names: ['Alexandrina', 'Bartholomew', 'Zoë', 'Renée', 'José', 'Mia', 'Christopher', 'Ava', 'Maximiliana'] }, name: 'names-9-long' },
  { d: 'loved-by-grandkids', v: { nickname: 'Mimi', year: '', names: ['Jo'] }, name: 'names-1-short-no-year' },
  { d: 'grandma-era', v: { nickname: 'Grandmommy!' }, name: 'era-long' },
  { d: 'grandmas-house-rules', v: { nickname: 'Grandmother' }, name: 'rules-long' },
  { d: 'family-christmas', v: { surname: 'Van Der Berghers', year: '2026' }, name: 'xmas-long-surname' },
  { d: 'most-likely-to-christmas', v: { line: 'start the group chat drama!!', year: '2026' }, name: 'likely-30' },
  { d: 'vintage-birth-year', v: { year: '2008' }, name: 'vintage-2008' },
  { d: 'still-not-a-grown-up', v: { age: '100' }, name: 'age-100' },
  { d: 'grandpa-job-description', v: { nickname: 'Grandaddyyyy' }, name: 'grandpa-long' },
  { d: 'grandmas-cookie-crew', v: { nickname: 'Grandmother', year: '2026' }, name: 'cookie-long' },
];

(async () => {
  const tiles: Buffer[] = [];
  let failed = 0;
  for (const c of cases) {
    const t = getTemplate(c.d);
    const res = validateValues(t, c.v);
    if (!res.ok) {
      failed++;
      console.log(`✗ ${c.name}: ${JSON.stringify(res.errors)}`);
      continue;
    }
    for (const [ink, bg] of [['dark', '#ffffff'], ['light', '#212642']] as const) {
      const png = renderPrintPng(t, res.values, designPalette(c.d, { ink, hex: bg }), 2250, 2700);
      fs.writeFileSync(path.join(out, `${c.name}-${ink}.png`), png);
      if (ink === 'light') {
        const full = await sharp({ create: { width: 2250, height: 2700, channels: 3, background: bg } }).composite([{ input: png }]).png().toBuffer();
        tiles.push(await sharp(full).resize(450).png().toBuffer());
      }
    }
    console.log(`✓ ${c.name}: ${t.summarize(res.values)}`);
  }
  const cols = 5;
  const h = 540;
  const sheet = await sharp({ create: { width: cols * 450, height: Math.ceil(tiles.length / cols) * h, channels: 3, background: '#999' } })
    .composite(tiles.map((b, i) => ({ input: b, left: (i % cols) * 450, top: Math.floor(i / cols) * h })))
    .png()
    .toFile(path.join(out, 'sheet.png'));
  console.log(`\n${sheet.width}×${sheet.height} contact sheet → out/print-test/sheet.png${failed ? `; ${failed} case(s) failed validation` : ''}`);
  process.exit(failed ? 1 : 0);
})();
