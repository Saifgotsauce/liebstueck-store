// Text measurement shared by the browser preview and the server print renderer.
// Widths come from the real font files (see scripts/font-metrics.mjs), so both sides
// compute exactly the same font sizes and positions.
import metrics from './font-metrics.json';

export type FontKey = 'display' | 'script' | 'serif' | 'sans';

export const FONT_FAMILY: Record<FontKey, string> = {
  display: 'Bebas Neue',
  script: 'Dancing Script',
  serif: 'Playfair Display',
  sans: 'Nunito Sans',
};

export const FONT_WEIGHT: Record<FontKey, number> = {
  display: 400,
  script: 700,
  serif: 700,
  sans: 700,
};

type FontMetrics = {
  family: string;
  unitsPerEm: number;
  capHeight: number;
  ascender: number;
  descender: number;
  fallback: number;
  widths: Record<string, number>;
};

const M = metrics as unknown as Record<FontKey, FontMetrics>;

/** Width of a string in design units. `tracking` is letter spacing in em. */
export function measure(text: string, font: FontKey, size: number, tracking = 0): number {
  const m = M[font];
  const chars = Array.from(text);
  let units = 0;
  for (const ch of chars) units += m.widths[ch] ?? m.fallback;
  return (units * size) / m.unitsPerEm + tracking * size * Math.max(0, chars.length - 1);
}

/** Largest font size (between min and max) at which `text` fits into `maxWidth`. */
export function fitSize(text: string, font: FontKey, maxWidth: number, maxSize: number, minSize = 10, tracking = 0) {
  const w1 = measure(text, font, 1, tracking);
  if (w1 <= 0) return maxSize;
  return Math.max(minSize, Math.min(maxSize, maxWidth / w1));
}

export function capHeight(font: FontKey, size: number) {
  return (M[font].capHeight * size) / M[font].unitsPerEm;
}

/** Characters every print font can render. Used to validate customer input. */
export function unsupportedChars(text: string): string[] {
  const bad = new Set<string>();
  for (const ch of Array.from(text)) {
    for (const key of Object.keys(M) as FontKey[]) {
      if (M[key].widths[ch] === undefined) {
        bad.add(ch);
        break;
      }
    }
  }
  return [...bad];
}

export function esc(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const r = (n: number) => Math.round(n * 10) / 10;

export function svgText(opts: {
  x: number;
  y: number;
  font: FontKey;
  size: number;
  fill: string;
  content: string;
  tracking?: number;
  anchor?: 'start' | 'middle' | 'end';
  opacity?: number;
}) {
  const { x, y, font, size, fill, content, tracking = 0, anchor = 'middle', opacity } = opts;
  const ls = tracking * size;
  // SVG renderers add letter spacing after the last glyph too; shift by half of it so
  // tracked text stays optically centred.
  const dx = anchor === 'middle' ? ls / 2 : anchor === 'end' ? ls : 0;
  return `<text x="${r(x + dx)}" y="${r(y)}" font-family="${FONT_FAMILY[font]}" font-weight="${FONT_WEIGHT[font]}" font-size="${r(size)}"${
    ls ? ` letter-spacing="${r(ls)}"` : ''
  } text-anchor="${anchor}" fill="${fill}"${opacity !== undefined ? ` fill-opacity="${opacity}"` : ''}>${esc(content)}</text>`;
}
