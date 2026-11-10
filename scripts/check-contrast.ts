// Checks every design on every shirt colour: both print colours (ink and accent) must reach
// MIN_PRINT_CONTRAST against the shirt (docs/design-rules.md §6). Run: npm run check:contrast
import { GARMENTS } from '../lib/catalog';
import { ALL_DESIGNS } from '../lib/designs';
import { designPalette } from '../lib/design/templates';
import { MIN_PRINT_CONTRAST, contrast } from '../lib/design/types';

let bad = 0;
let oneInk = 0;
for (const g of Object.values(GARMENTS)) {
  for (const c of g.colors) {
    for (const d of ALL_DESIGNS) {
      const p = designPalette(d.slug, c);
      const ink = contrast(p.ink, c.hex);
      const acc = contrast(p.accent, c.hex);
      if (p.accent === p.ink) oneInk++;
      if (ink < MIN_PRINT_CONTRAST || acc < MIN_PRINT_CONTRAST) {
        bad++;
        console.log(`✗ ${d.slug} on ${g.label} ${c.label}: ink ${ink.toFixed(1)}, accent ${acc.toFixed(1)}`);
      }
    }
    const sample = designPalette(ALL_DESIGNS[0].slug, c);
    console.log(`${g.label.padEnd(8)} ${c.label.padEnd(14)} ink ${contrast(sample.ink, c.hex).toFixed(1).padStart(4)}  accent ${sample.accent} ${contrast(sample.accent, c.hex).toFixed(1)}`);
  }
}
console.log(`\n${bad ? `✗ ${bad} unreadable combinations` : '✓ every design is readable on every shirt colour'} (${oneInk} print in one ink colour)`);
process.exit(bad ? 1 : 0);
