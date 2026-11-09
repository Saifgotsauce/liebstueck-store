// Text-led shirt layouts. Every design in lib/designs.ts is one of these layouts plus its
// own words. Pure functions: the same input gives the same SVG in the browser preview and in
// the print file, so what customers see is exactly what gets printed.
import { LOOSE_FONTS, capHeight, fitSize, measure, svgText, vertical, type FontKey } from './text';
import { heart, hline, star } from './shapes';
import type { FieldValues, Palette } from './types';

export type Tone = 'ink' | 'accent';

/** One line of text. `t` may contain {fieldKey} placeholders for personalised values. */
export type Line = {
  t: string;
  font: FontKey;
  /** Largest size in design units (1200 = 11 in printed); the line shrinks to fit the width. */
  size: number;
  track?: number;
  tone?: Tone;
  upper?: boolean;
  /** Extra space above this line (negative pulls it closer). */
  gap?: number;
  /** Only print the line when this field has a value. */
  ifField?: string;
  width?: number;
};

export type LayoutSpec =
  | { layout: 'stack'; lines: Line[]; stars?: boolean }
  | { layout: 'badge'; top: string; lines: Line[]; bottom: string }
  | { layout: 'label'; header: string; lines: Line[] }
  | { layout: 'checklist'; title: Line[]; items: string[]; itemFont?: FontKey }
  | { layout: 'quote'; lines: Line[]; by: string }
  | { layout: 'vintage'; top: string; big: string; bottom: string }
  | { layout: 'names'; title: string; est?: string; estLabel?: string; lovedBy: string; namesKey: string };

const CX = 600;
const TOP = 150; // ~1.5 in below the top of the print area, where chest prints usually start
const r = (n: number) => Math.round(n * 10) / 10;

const hasValue = (v: FieldValues, key: string) => {
  const x = v[key];
  return Array.isArray(x) ? x.some((s) => s.trim()) : Boolean(String(x ?? '').trim());
};

/** Replaces {key} placeholders with the customer's values. */
export function fillText(t: string, v: FieldValues, upper = false) {
  const out = t.replace(/\{(\w+)\}/g, (_, k: string) => {
    const x = v[k];
    return Array.isArray(x) ? x.filter(Boolean).join(', ') : String(x ?? '').trim();
  });
  return upper ? out.toLocaleUpperCase('en-US') : out;
}

const tone = (p: Palette, t: Tone = 'ink') => (t === 'accent' ? p.accent : p.ink);

/** Stacks lines top-down, centred. Returns the markup and the y where the stack ends. */
function stackLines(lines: Line[], v: FieldValues, p: Palette, top: number, width: number) {
  let y = top;
  let svg = '';
  let first = true;
  for (const l of lines) {
    if (l.ifField && !hasValue(v, l.ifField)) continue;
    const text = fillText(l.t, v, l.upper);
    if (!text.trim()) continue;
    const track = l.track ?? 0;
    // always fit the width – customer text is length-limited by validation, so this never gets tiny
    const size = fitSize(text, l.font, l.width ?? width, l.size, 1, track);
    const loose = LOOSE_FONTS.includes(l.font);
    const lower = text !== text.toLocaleUpperCase('en-US');
    const cap = capHeight(l.font, size);
    const above = lower && loose ? Math.max(cap * 1.12, vertical(l.font, size).asc * 0.72) : cap;
    const below = lower ? size * (loose ? 0.24 : 0.2) : size * 0.06;
    const gap = first ? 0 : size * 0.12 + 26 + (l.gap ?? 0);
    const baseline = y + gap + above;
    svg += svgText({ x: CX, y: baseline, font: l.font, size, fill: tone(p, l.tone), content: text, tracking: track });
    y = baseline + below;
    first = false;
  }
  return { svg, bottom: y };
}

function starRow(y: number, fill: string, count = 3, size = 34, spacing = 96) {
  let s = '';
  for (let i = 0; i < count; i++) s += star(CX + (i - (count - 1) / 2) * spacing, y, size, size * 0.45, fill);
  return s;
}

/** Small tracked label with short rules either side:  ── TEXT ── */
function ruled(y: number, text: string, font: FontKey, size: number, track: number, fill: string, ruleFill: string, maxWidth = 1080) {
  const s = fitSize(text, font, maxWidth - 260, size, size * 0.5, track);
  const w = measure(text, font, s, track);
  const mid = y - capHeight(font, s) / 2;
  const len = Math.max(0, Math.min(110, (maxWidth - w) / 2 - 40));
  return (
    svgText({ x: CX, y, font, size: s, fill, content: text, tracking: track }) +
    (len > 10 ? hline(CX - w / 2 - 30 - len, CX - w / 2 - 30, mid, ruleFill, 7) + hline(CX + w / 2 + 30, CX + w / 2 + 30 + len, mid, ruleFill, 7) : '')
  );
}

function stack(spec: Extract<LayoutSpec, { layout: 'stack' }>, v: FieldValues, p: Palette) {
  const s = stackLines(spec.lines, v, p, TOP, 1080);
  return s.svg + (spec.stars ? starRow(s.bottom + 70, p.accent) : '');
}

function badge(spec: Extract<LayoutSpec, { layout: 'badge' }>, v: FieldValues, p: Palette) {
  const x1 = 110;
  const x2 = 1090;
  const topText = fillText(spec.top, v, true);
  const bottomText = fillText(spec.bottom, v, true);
  const ts = fitSize(topText, 'heavy', 640, 62, 34, 0.14);
  const topBase = TOP + 70 + capHeight('heavy', ts);
  const tw = measure(topText, 'heavy', ts, 0.14);
  let svg = svgText({ x: CX, y: topBase, font: 'heavy', size: ts, fill: p.accent, content: topText, tracking: 0.14 });
  svg += star(CX - tw / 2 - 56, topBase - capHeight('heavy', ts) / 2, 24, 11, p.accent) + star(CX + tw / 2 + 56, topBase - capHeight('heavy', ts) / 2, 24, 11, p.accent);
  svg += hline(x1 + 70, x2 - 70, topBase + 46, p.ink, 6);
  const body = stackLines(spec.lines, v, p, topBase + 100, 820);
  svg += body.svg;
  svg += hline(x1 + 70, x2 - 70, body.bottom + 54, p.ink, 6);
  const bs = fitSize(bottomText, 'heavy', 760, 52, 28, 0.12);
  const bottomBase = body.bottom + 64 + 40 + capHeight('heavy', bs);
  svg += svgText({ x: CX, y: bottomBase, font: 'heavy', size: bs, fill: p.ink, content: bottomText, tracking: 0.12 });
  const y2 = bottomBase + 74;
  const frame =
    `<rect x="${x1}" y="${TOP}" width="${x2 - x1}" height="${r(y2 - TOP)}" rx="56" fill="none" stroke="${p.ink}" stroke-width="16"/>` +
    `<rect x="${x1 + 26}" y="${TOP + 26}" width="${x2 - x1 - 52}" height="${r(y2 - TOP - 52)}" rx="36" fill="none" stroke="${p.ink}" stroke-width="5"/>`;
  return frame + svg;
}

function label(spec: Extract<LayoutSpec, { layout: 'label' }>, v: FieldValues, p: Palette) {
  const x1 = 100;
  const x2 = 1100;
  const headH = 180;
  const head = fillText(spec.header, v, true);
  const hs = fitSize(head, 'heavy', 640, 104, 50, 0.06);
  const hBase = TOP + headH / 2 + capHeight('heavy', hs) / 2;
  const tri = (cx: number) => {
    const h = 96;
    const top = TOP + (headH - h) / 2;
    return (
      `<polygon points="${cx},${top} ${cx + h * 0.58},${top + h} ${cx - h * 0.58},${top + h}" fill="${p.accent}" stroke="${p.accent}" stroke-width="12" stroke-linejoin="round"/>` +
      svgText({ x: cx, y: top + h - 12, font: 'heavy', size: 70, fill: p.knock, content: '!' })
    );
  };
  const hw = measure(head, 'heavy', hs, 0.06);
  const triX = Math.min(hw / 2 + 110, 420);
  const body = stackLines(spec.lines, v, p, TOP + headH + 70, 860);
  const y2 = body.bottom + 80;
  return (
    `<rect x="${x1}" y="${TOP}" width="${x2 - x1}" height="${headH}" rx="28" fill="${p.ink}"/>` +
    `<rect x="${x1}" y="${TOP + headH - 30}" width="${x2 - x1}" height="30" fill="${p.ink}"/>` +
    tri(CX - triX) +
    tri(CX + triX) +
    svgText({ x: CX, y: hBase, font: 'heavy', size: hs, fill: p.knock, content: head, tracking: 0.06 }) +
    body.svg +
    `<rect x="${x1}" y="${TOP}" width="${x2 - x1}" height="${r(y2 - TOP)}" rx="28" fill="none" stroke="${p.ink}" stroke-width="16"/>`
  );
}

function checklist(spec: Extract<LayoutSpec, { layout: 'checklist' }>, v: FieldValues, p: Palette) {
  const title = stackLines(spec.title, v, p, TOP, 1060);
  const font = spec.itemFont ?? 'marker';
  const items = spec.items.map((i) => fillText(i, v));
  const maxSize = 100;
  // one size for all rows so the list looks even
  let size = maxSize;
  for (const it of items) size = Math.min(size, fitSize(it, font, 980 - maxSize * 1.2, maxSize, 46));
  const box = size * 0.8;
  const gap = size * 0.38;
  const widest = Math.max(...items.map((it) => measure(it, font, size)));
  const blockW = box + gap + widest;
  const x0 = CX - blockW / 2;
  let y = title.bottom + 40;
  let svg = title.svg;
  for (const it of items) {
    const base = y + size * 0.1 + capHeight(font, size) + 24;
    const by = base - box * 0.92;
    svg += `<rect x="${r(x0)}" y="${r(by)}" width="${r(box)}" height="${r(box)}" rx="${r(box * 0.12)}" fill="none" stroke="${p.ink}" stroke-width="${r(size * 0.075)}"/>`;
    svg += `<path d="M${r(x0 + box * 0.16)} ${r(by + box * 0.5)} L${r(x0 + box * 0.44)} ${r(by + box * 0.82)} L${r(x0 + box * 1.08)} ${r(by - box * 0.2)}" fill="none" stroke="${p.accent}" stroke-width="${r(size * 0.13)}" stroke-linecap="round" stroke-linejoin="round"/>`;
    svg += svgText({ x: x0 + box + gap, y: base, font, size, fill: p.ink, content: it, anchor: 'start' });
    y = base + size * 0.2;
  }
  return svg;
}

function quote(spec: Extract<LayoutSpec, { layout: 'quote' }>, v: FieldValues, p: Palette) {
  const markSize = 380;
  // the opening quote mark sits high in the em box: put its top near TOP
  const markBase = TOP + markSize * 0.62;
  let svg = svgText({ x: CX, y: markBase, font: 'retro', size: markSize, fill: p.accent, content: '“' });
  const body = stackLines(spec.lines, v, p, TOP + markSize * 0.42, 1040);
  svg += body.svg;
  const by = fillText(spec.by, v);
  const bs = fitSize(by, 'marker', 900, 76, 40);
  svg += svgText({ x: CX, y: body.bottom + 54 + capHeight('marker', bs), font: 'marker', size: bs, fill: p.accent, content: by });
  return svg;
}

function vintage(spec: Extract<LayoutSpec, { layout: 'vintage' }>, v: FieldValues, p: Palette) {
  const top = fillText(spec.top, v, true);
  const big = fillText(spec.big, v, true);
  const bottom = fillText(spec.bottom, v, true);
  const topBase = TOP + capHeight('heavy', 84);
  let svg = ruled(topBase, top, 'heavy', 84, 0.3, p.accent, p.accent);
  const bs = fitSize(big, 'retro', 1080, 600, 200, -0.01);
  const bigBase = topBase + 46 + capHeight('retro', bs);
  svg += svgText({ x: CX, y: bigBase, font: 'retro', size: bs, fill: p.ink, content: big, tracking: -0.01 });
  const ls = fitSize(bottom, 'heavy', 1040, 66, 34, 0.12);
  const lowBase = bigBase + 70 + capHeight('heavy', ls);
  svg += svgText({ x: CX, y: lowBase, font: 'heavy', size: ls, fill: p.ink, content: bottom, tracking: 0.12 });
  svg += starRow(lowBase + 84, p.accent, 5, 26, 70);
  return svg;
}

/** Splits names into rows as evenly as possible, longer rows first (7 → 3, 2, 2). */
function chunk<T>(items: T[], perRow: number): T[][] {
  const rows = Math.max(1, Math.ceil(items.length / perRow));
  const out: T[][] = [];
  let start = 0;
  for (let i = 0; i < rows; i++) {
    const size = Math.floor(items.length / rows) + (i < items.length % rows ? 1 : 0);
    out.push(items.slice(start, start + size));
    start += size;
  }
  return out;
}

function names(spec: Extract<LayoutSpec, { layout: 'names' }>, v: FieldValues, p: Palette) {
  const title = fillText(spec.title, v, true);
  const ts = fitSize(title, 'retro', 1080, 320, 120, -0.01);
  const titleBase = TOP + capHeight('retro', ts);
  let svg = svgText({ x: CX, y: titleBase, font: 'retro', size: ts, fill: p.ink, content: title, tracking: -0.01 });
  let y = titleBase;
  if (spec.est && hasValue(v, spec.est)) {
    y += 40 + capHeight('heavy', 60);
    svg += ruled(y, `${spec.estLabel ?? 'EST.'} ${fillText(`{${spec.est}}`, v)}`, 'heavy', 60, 0.3, p.ink, p.accent);
  }
  const loved = fillText(spec.lovedBy, v);
  const ls = 130;
  y += 70 + capHeight('script', ls) * 1.1;
  svg += svgText({ x: CX, y, font: 'script', size: ls, fill: p.accent, content: loved });
  const list = (Array.isArray(v[spec.namesKey]) ? (v[spec.namesKey] as string[]) : []).filter(Boolean);
  const rows = chunk(list, 3);
  const heartW = 46;
  const gap = 34;
  // one size for every row, as large as the widest row allows
  let size = 120;
  for (const row of rows) {
    const w1 = row.reduce((s, n) => s + measure(n, 'retro', 1), 0);
    const fixed = (row.length - 1) * (heartW + gap * 2);
    size = Math.min(size, (1080 - fixed) / Math.max(w1, 0.01));
  }
  size = Math.max(52, size);
  y += 30;
  for (const row of rows) {
    const widths = row.map((n) => measure(n, 'retro', size));
    const total = widths.reduce((a, b) => a + b, 0) + (row.length - 1) * (heartW + gap * 2);
    let x = CX - total / 2;
    const base = y + capHeight('retro', size) + 26;
    row.forEach((n, i) => {
      svg += svgText({ x, y: base, font: 'retro', size, fill: p.ink, content: n, anchor: 'start' });
      x += widths[i];
      if (i < row.length - 1) {
        svg += heart(x + gap + heartW / 2, base - capHeight('retro', size) / 2, heartW, p.accent);
        x += heartW + gap * 2;
      }
    });
    y = base + size * 0.12;
  }
  return svg;
}

export function renderLayout(spec: LayoutSpec, v: FieldValues, p: Palette): string {
  switch (spec.layout) {
    case 'stack':
      return stack(spec, v, p);
    case 'badge':
      return badge(spec, v, p);
    case 'label':
      return label(spec, v, p);
    case 'checklist':
      return checklist(spec, v, p);
    case 'quote':
      return quote(spec, v, p);
    case 'vintage':
      return vintage(spec, v, p);
    case 'names':
      return names(spec, v, p);
  }
}

/** Every font a layout prints – used to check that customer text can be rendered. */
export function layoutFonts(spec: LayoutSpec): FontKey[] {
  const set = new Set<FontKey>();
  const add = (ls: Line[]) => ls.forEach((l) => set.add(l.font));
  switch (spec.layout) {
    case 'stack':
    case 'quote':
      add(spec.lines);
      if (spec.layout === 'quote') set.add('marker');
      break;
    case 'badge':
    case 'label':
      add(spec.lines);
      set.add('heavy');
      break;
    case 'checklist':
      add(spec.title);
      set.add(spec.itemFont ?? 'marker');
      break;
    case 'vintage':
      set.add('heavy').add('retro');
      break;
    case 'names':
      set.add('retro').add('heavy').add('script');
      break;
  }
  return [...set];
}
