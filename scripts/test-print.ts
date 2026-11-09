// Renders sample print files (and a dark-background proof) for every design into test-output/.
// Run: npm run test:print
import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import { TEMPLATES, defaultValues } from '../lib/design/templates';
import { PALETTES } from '../lib/design/types';
import { renderPrintPng } from '../lib/print/render';
import { validateValues } from '../lib/design/validate';

const out = path.join(process.cwd(), 'test-output');
fs.mkdirSync(out, { recursive: true });

const cases: { t: string; v: Record<string, string | string[]>; name: string }[] = [
  { t: 'familienbande', v: defaultValues(TEMPLATES.familienbande), name: 'opa-default' },
  { t: 'familienbande', v: { titel: 'OMA', namen: ['Jörg', 'Änne', 'Lukas', 'Sophie-Marie', 'Ben', 'Zoë', 'Mats'], seit: '2011' }, name: 'oma-7names-umlauts' },
  { t: 'familienbande', v: { titel: 'PATENTANTE', namen: ['Maximilian-Alexander'], seit: '' }, name: 'patentante-1long' },
  { t: 'weihnachten', v: { nachname: 'Schößler', vorname: 'Lena', jahr: '2026' }, name: 'xmas-full' },
  { t: 'weihnachten', v: { nachname: 'von Hohenstein-Grüßing', vorname: '', jahr: '2026' }, name: 'xmas-longname' },
  { t: 'jahrgang', v: { jahr: '1966', name: 'Klaus' }, name: 'jahrgang-klaus' },
];

for (const c of cases) {
  const t = TEMPLATES[c.t];
  const res = validateValues(t, c.v);
  if (!res.ok) console.log(c.name, 'VALIDATION', res.errors);
  for (const theme of ['dark', 'light'] as const) {
    const png = renderPrintPng(t, c.v, PALETTES[theme], 1800, 2400);
    const file = path.join(out, `${c.name}-${theme}.png`);
    fs.writeFileSync(file, png);
    // proof on a garment-like background for eyeballing
    const b64 = png.toString('base64');
    const bg = theme === 'dark' ? '#ffffff' : '#1F2A44';
    const proof = new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="600" height="800"><rect width="600" height="800" fill="${bg}"/><image width="600" height="800" xlink:href="data:image/png;base64,${b64}"/></svg>`).render().asPng();
    fs.writeFileSync(path.join(out, `proof-${c.name}-${theme}.png`), proof);
  }
  console.log('rendered', c.name, t.summarize(c.v));
}
