// The three launch designs. Each one is a pure function: same inputs → same SVG,
// in the browser preview and in the print file. To add a design, copy one of these,
// give it a new id, and reference it from a product in lib/catalog.ts.
import { capHeight, fitSize, measure, svgText } from './text';
import { circle, heart, hline, star, triangle } from './shapes';
import type { DesignTemplate, FieldValues } from './types';
import type { Locale } from '../i18n';

const CX = 600; // horizontal centre of the 1200-wide design space
const MAX_W = 1040; // widest any line may run

const str = (v: FieldValues, k: string) => String(v[k] ?? '').trim();
const list = (v: FieldValues, k: string) => (Array.isArray(v[k]) ? (v[k] as string[]) : []).map((s) => s.trim()).filter(Boolean);
const upper = (s: string) => s.toLocaleUpperCase('de-DE');

/** Thin rule with a centred ornament, e.g. ───── ♥ ───── */
function ornamentRule(y: number, width: number, gap: number, stroke: string, ornament: string) {
  return hline(CX - width / 2, CX - gap, y, stroke, 6) + ornament + hline(CX + gap, CX + width / 2, y, stroke, 6);
}

/** Text with short rules either side: ──  TEXT  ── */
function ruledLabel(y: number, label: string, size: number, tracking: number, fill: string, maxRule = 110) {
  const w = measure(label, 'sans', size, tracking);
  // keep the rules inside the print area (x 40 … 1160)
  const ruleLen = Math.max(0, Math.min(maxRule, (1120 - w) / 2 - 34));
  const capMid = y - capHeight('sans', size) / 2;
  return (
    svgText({ x: CX, y, font: 'sans', size, fill, content: label, tracking }) +
    hline(CX - w / 2 - 34 - ruleLen, CX - w / 2 - 34, capMid, fill, 5) +
    hline(CX + w / 2 + 34, CX + w / 2 + 34 + ruleLen, capMid, fill, 5)
  );
}

// ── 1. Familienbande: "OPA – von Mia ♥ Leon ♥ Emma" ────────────────────────────

/** Splits items into `lines` rows as evenly as possible, longer rows first (7 → 3, 2, 2). */
function chunk<T>(items: T[], lines: number): T[][] {
  const out: T[][] = [];
  const n = Math.max(1, Math.min(lines, items.length));
  let start = 0;
  for (let i = 0; i < n; i++) {
    const size = Math.floor(items.length / n) + (i < items.length % n ? 1 : 0);
    out.push(items.slice(start, start + size));
    start += size;
  }
  return out;
}

const familienbande: DesignTemplate = {
  id: 'familienbande',
  name: 'Familienbande',
  fields: [
    {
      key: 'titel',
      type: 'select',
      label: { de: 'Für wen ist das Shirt?', en: 'Who is the shirt for?' },
      default: 'OPA',
      // The printed word stays German; English shoppers see a translation in brackets.
      options: (
        [
          ['OPA', 'Grandpa'], ['OMA', 'Grandma'], ['OPI', 'Grandpa'], ['OMI', 'Grandma'], ['PAPA', 'Dad'], ['MAMA', 'Mum'],
          ['UROPA', 'Great-grandpa'], ['UROMA', 'Great-grandma'], ['ONKEL', 'Uncle'], ['TANTE', 'Aunt'], ['PATENONKEL', 'Godfather'], ['PATENTANTE', 'Godmother'],
        ] as const
      ).map(([v, en]) => {
        const word = v.charAt(0) + v.slice(1).toLowerCase();
        return { value: v, label: { de: word, en: `${word} (${en})` } };
      }),
    },
    {
      key: 'namen',
      type: 'names',
      label: { de: 'Namen der Enkel oder Kinder', en: 'Names of the grandchildren or children' },
      help: { de: 'Bis zu 8 Namen. Wir drucken sie genau so, wie du sie eingibst.', en: 'Up to 8 names. We print them exactly as you type them.' },
      min: 1,
      max: 8,
      maxLength: 14,
      default: ['Mia', 'Leon', 'Emma'],
      placeholder: { de: 'Name', en: 'Name' },
    },
    {
      key: 'seit',
      type: 'year',
      label: { de: 'Seit (Jahr, optional)', en: 'Since (year, optional)' },
      help: { de: 'z. B. das Geburtsjahr des ersten Enkels', en: 'e.g. the year the first grandchild was born – printed as “SEIT 2016”' },
      min: 1950,
      max: 2035,
      required: false,
      default: '',
    },
  ],
  summarize(v, l: Locale = 'de') {
    const seit = str(v, 'seit');
    return `${str(v, 'titel')} · ${list(v, 'namen').join(', ')}${seit ? ` · ${l === 'en' ? 'since' : 'seit'} ${seit}` : ''}`;
  },
  render(v, p) {
    const title = upper(str(v, 'titel') || 'OPA');
    const names = list(v, 'namen').map(upper);
    const seit = str(v, 'seit');
    let svg = '';

    svg += ornamentRule(130, 440, 44, p.ink, heart(CX, 132, 46, p.accent));

    const tTrack = 0.03;
    const tSize = fitSize(title, 'display', 980, 560, 60, tTrack);
    const tBase = 190 + capHeight('display', tSize);
    svg += svgText({ x: CX, y: tBase, font: 'display', size: tSize, fill: p.ink, content: title, tracking: tTrack });

    const vonBase = tBase + 150;
    svg += svgText({ x: CX, y: vonBase, font: 'script', size: 124, fill: p.accent, content: 'von' });

    // Names: as few lines as possible while keeping the text big enough to read.
    const track = 0.06;
    const gapEm = 0.8; // space between names (in em) – a heart sits in the middle
    const maxSize = names.length <= 2 ? 200 : names.length <= 3 ? 175 : 150;
    const lineW1 = (ln: string[]) => ln.reduce((w, n) => w + measure(n, 'display', 1, track), 0) + gapEm * (ln.length - 1);
    const baseLines = names.length <= 3 ? 1 : names.length <= 6 ? 2 : 3;
    let lines = chunk(names, baseLines);
    let size = maxSize;
    for (let k = baseLines; k <= Math.max(baseLines, names.length); k++) {
      lines = chunk(names, k);
      size = Math.min(maxSize, ...lines.map((ln) => MAX_W / lineW1(ln)));
      if (size >= 105) break;
    }
    const cap = capHeight('display', size);
    const lh = size * 1.2;
    let base = vonBase + 50 + cap;
    lines.forEach((ln, i) => {
      if (i > 0) base += lh;
      const widths = ln.map((n) => measure(n, 'display', size, track));
      const gap = gapEm * size;
      const total = widths.reduce((a, b) => a + b, 0) + gap * (ln.length - 1);
      let x = CX - total / 2;
      ln.forEach((n, j) => {
        svg += svgText({ x: x + widths[j] / 2, y: base, font: 'display', size, fill: p.ink, content: n, tracking: track });
        x += widths[j];
        if (j < ln.length - 1) {
          svg += heart(x + gap / 2, base - cap / 2, size * 0.34, p.accent);
          x += gap;
        }
      });
    });

    if (seit) svg += ruledLabel(base + 130, `SEIT ${seit}`, 58, 0.32, p.ink, 120);
    return svg;
  },
};

// ── 2. Familien-Weihnachten: tree, "FAMILIE Müller", "Weihnachten 2026", first name ──

const weihnachten: DesignTemplate = {
  id: 'weihnachten',
  name: 'Familien-Weihnachten',
  fields: [
    {
      key: 'nachname',
      type: 'text',
      label: { de: 'Familienname', en: 'Family name' },
      placeholder: { de: 'z. B. Müller', en: 'e.g. Müller' },
      maxLength: 18,
      required: true,
      default: 'Müller',
    },
    {
      key: 'vorname',
      type: 'text',
      label: { de: 'Vorname auf diesem Shirt (optional)', en: 'First name on this shirt (optional)' },
      help: {
        de: 'Für den Partnerlook: Jedes Familienmitglied bekommt sein eigenes Shirt mit Namen.',
        en: 'For matching outfits: every family member gets their own shirt with their name.',
      },
      placeholder: { de: 'z. B. Papa oder Lena', en: 'e.g. Papa or Lena' },
      maxLength: 14,
      required: false,
      default: '',
    },
    { key: 'jahr', type: 'year', label: { de: 'Jahr', en: 'Year' }, min: 2024, max: 2040, required: true, default: '2026' },
  ],
  summarize(v) {
    // Describes the printed text, which is German in both languages
    const vn = str(v, 'vorname');
    return `Familie ${str(v, 'nachname')} · Weihnachten ${str(v, 'jahr')}${vn ? ` · ${vn}` : ''}`;
  },
  render(v, p) {
    const nachname = str(v, 'nachname') || 'Müller';
    const vorname = str(v, 'vorname');
    const jahr = str(v, 'jahr') || '2026';
    let svg = '';

    // Tree: three tiers, trunk, star and baubles
    svg += `<rect x="574" y="572" width="52" height="64" rx="6" fill="${p.ink}"/>`;
    svg += triangle(CX, 352, 590, 238, p.ink);
    svg += triangle(CX, 262, 452, 178, p.ink);
    svg += triangle(CX, 178, 332, 120, p.ink);
    svg += star(CX, 150, 58, 24, p.accent);
    const baubles: [number, number][] = [
      [566, 296], [640, 312], [528, 414], [604, 392], [684, 430], [470, 556], [548, 520], [636, 560], [724, 540],
    ];
    baubles.forEach(([x, y], i) => (svg += circle(x, y, i % 3 === 0 ? 15 : 12, p.accent)));

    svg += svgText({ x: CX, y: 760, font: 'sans', size: 62, fill: p.ink, content: 'FAMILIE', tracking: 0.42 });

    const nSize = fitSize(nachname, 'serif', 1000, 250, 60);
    const nBase = 800 + capHeight('serif', nSize);
    svg += svgText({ x: CX, y: nBase, font: 'serif', size: nSize, fill: p.ink, content: nachname });

    const wText = `Weihnachten ${jahr}`;
    const wSize = fitSize(wText, 'script', 860, 150, 60);
    const wBase = nBase + 60 + capHeight('script', wSize);
    svg += svgText({ x: CX, y: wBase, font: 'script', size: wSize, fill: p.accent, content: wText });

    if (vorname) {
      const label = upper(vorname);
      const vTrack = 0.12;
      const vSize = fitSize(label, 'display', 760, 130, 50, vTrack);
      const vBase = wBase + 90 + capHeight('display', vSize);
      const w = measure(label, 'display', vSize, vTrack);
      const mid = vBase - capHeight('display', vSize) / 2;
      svg += svgText({ x: CX, y: vBase, font: 'display', size: vSize, fill: p.ink, content: label, tracking: vTrack });
      svg += star(CX - w / 2 - 60, mid, 26, 11, p.accent) + star(CX + w / 2 + 60, mid, 26, 11, p.accent);
    }
    return svg;
  },
};

// ── 3. Jahrgang: milestone birthdays ──────────────────────────────────────────

const jahrgang: DesignTemplate = {
  id: 'jahrgang',
  name: 'Jahrgang',
  fields: [
    {
      key: 'jahr',
      type: 'year',
      label: { de: 'Geburtsjahr', en: 'Birth year' },
      help: { de: 'Zum 40., 50., 60. oder 70. – oder einfach so.', en: 'For a 40th, 50th, 60th or 70th – or just because.' },
      min: 1925,
      max: 2010,
      required: true,
      default: '1966',
    },
    {
      key: 'name',
      type: 'text',
      label: { de: 'Name (optional)', en: 'Name (optional)' },
      placeholder: { de: 'z. B. Klaus', en: 'e.g. Klaus' },
      maxLength: 16,
      required: false,
      default: '',
    },
  ],
  summarize(v) {
    const name = str(v, 'name');
    return `Jahrgang ${str(v, 'jahr')}${name ? ` · ${name}` : ''}`;
  },
  render(v, p) {
    const jahr = str(v, 'jahr') || '1966';
    const name = str(v, 'name');
    let svg = '';

    svg += ruledLabel(200, 'LIMITIERTE AUFLAGE', 54, 0.34, p.ink, 120);
    svg += svgText({ x: CX, y: 395, font: 'display', size: 150, fill: p.accent, content: 'JAHRGANG', tracking: 0.3 });

    const ySize = fitSize(jahr, 'display', 1000, 610, 100, 0.02);
    const yBase = 440 + capHeight('display', ySize);
    svg += svgText({ x: CX, y: yBase, font: 'display', size: ySize, fill: p.ink, content: jahr, tracking: 0.02 });

    const ruleY = yBase + 62;
    svg += hline(330, 870, ruleY, p.ink, 6) + star(290, ruleY, 22, 9, p.accent) + star(910, ruleY, 22, 9, p.accent);
    svg += svgText({ x: CX, y: ruleY + 112, font: 'sans', size: 56, fill: p.ink, content: 'ALLE TEILE ORIGINAL', tracking: 0.3 });

    if (name) {
      const nSize = fitSize(name, 'script', 900, 180, 60);
      svg += svgText({ x: CX, y: ruleY + 150 + capHeight('script', nSize) + 40, font: 'script', size: nSize, fill: p.accent, content: name });
    }
    return svg;
  },
};

export const TEMPLATES: Record<string, DesignTemplate> = {
  [familienbande.id]: familienbande,
  [weihnachten.id]: weihnachten,
  [jahrgang.id]: jahrgang,
};

export function getTemplate(id: string): DesignTemplate {
  const t = TEMPLATES[id];
  if (!t) throw new Error(`Unknown design template: ${id}`);
  return t;
}

export function defaultValues(t: DesignTemplate): FieldValues {
  const v: FieldValues = {};
  for (const f of t.fields) v[f.key] = Array.isArray(f.default) ? [...f.default] : f.default;
  return v;
}
