// Builds lib/design/font-metrics.json: advance widths per character for each print font.
// The design templates use this table to measure and auto-fit text, so the live preview in
// the browser and the print file rendered on the server always lay out identically.
// Re-run after adding or changing a font:  npm run fonts:metrics
import fs from 'node:fs';
import path from 'node:path';
import opentype from 'opentype.js';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const fonts = {
  display: 'BebasNeue_400Regular.ttf',
  script: 'DancingScript_700Bold.ttf',
  serif: 'PlayfairDisplay_700Bold.ttf',
  sans: 'NunitoSans_700Bold.ttf',
  retro: 'Fraunces_900Black.ttf',
  retroItalic: 'Fraunces_900Black_Italic.ttf',
  heavy: 'ArchivoBlack_400Regular.ttf',
  marker: 'PermanentMarker_400Regular.ttf',
  type: 'CourierPrime_700Bold.ttf',
};

// Latin, Latin-1 Supplement and Latin Extended-A, plus curly quotes, dashes, bullet and ellipsis.
const ranges = [[0x20, 0x7e], [0xa0, 0xff], [0x100, 0x17f], [0x1e9e, 0x1e9e], [0x2018, 0x201d], [0x2013, 0x2014], [0x2022, 0x2022], [0x2026, 0x2026], [0xb7, 0xb7], [0x2605, 0x2605]];

const out = {};
for (const [key, file] of Object.entries(fonts)) {
  const buf = fs.readFileSync(path.join(root, 'assets/fonts', file));
  const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  const widths = {};
  for (const [a, b] of ranges) {
    for (let cp = a; cp <= b; cp++) {
      const ch = String.fromCodePoint(cp);
      const glyph = font.charToGlyph(ch);
      if (glyph && glyph.index !== 0) widths[ch] = glyph.advanceWidth;
    }
  }
  out[key] = {
    family: font.getEnglishName('fontFamily'),
    unitsPerEm: font.unitsPerEm,
    ascender: font.ascender,
    descender: font.descender,
    capHeight: font.tables.os2?.sCapHeight ?? Math.round(font.ascender * 0.7),
    fallback: widths['n'] ?? font.unitsPerEm * 0.5,
    widths,
  };
  console.log(`${key}: ${out[key].family}, ${Object.keys(widths).length} glyphs`);
}
fs.writeFileSync(path.join(root, 'lib/design/font-metrics.json'), JSON.stringify(out));
console.log('wrote lib/design/font-metrics.json');
