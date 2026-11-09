// Text measurement shared by the browser preview and the server print renderer.
// Widths come from the real font files (see scripts/font-metrics.mjs), so both sides
// compute exactly the same font sizes and positions.
import metrics from './font-metrics.json';

export type FontKey = 'display' | 'script' | 'serif' | 'sans' | 'retro' | 'retroItalic' | 'heavy' | 'marker' | 'type';

// Family names as the font files declare them, so resvg (print) and the browser (@font-face
// in globals.css) resolve exactly the same file.
export const FONT_FAMILY: Record<FontKey, string> = {
  display: 'Bebas Neue',
  script: 'Dancing Script',
  serif: 'Playfair Display',
  sans: 'Nunito Sans',
  retro: 'Fraunces',
  retroItalic: 'Fraunces',
  heavy: 'Archivo Black',
  marker: 'Permanent Marker',
  type: 'Courier Prime',
};

export const FONT_WEIGHT: Record<FontKey, number> = {
  display: 400,
  script: 700,
  serif: 700,
  sans: 700,
  retro: 900,
  retroItalic: 900,
  heavy: 400,
  marker: 400,
  type: 700,
};

export const FONT_STYLE: Partial<Record<FontKey, 'italic'>> = { retroItalic: 'italic' };

/** True for fonts whose lowercase letters dip below the baseline noticeably (script, marker). */
export const LOOSE_FONTS: FontKey[] = ['script', 'marker', 'retroItalic'];

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

/** Ascender / descender of the font at this size (positive numbers, design units). */
export function vertical(font: FontKey, size: number) {
  const m = M[font];
  return { asc: (m.ascender * size) / m.unitsPerEm, desc: (Math.abs(m.descender) * size) / m.unitsPerEm };
}

/** Characters the given print fonts (default: all) can't render. Used to validate customer input. */
export function unsupportedChars(text: string, fonts: FontKey[] = Object.keys(M) as FontKey[]): string[] {
  const bad = new Set<string>();
  for (const ch of Array.from(text)) {
    for (const key of fonts) {
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
  const style = FONT_STYLE[font] ? ` font-style="${FONT_STYLE[font]}"` : '';
  return `<text x="${r(x + dx)}" y="${r(y)}" font-family="${FONT_FAMILY[font]}" font-weight="${FONT_WEIGHT[font]}"${style} font-size="${r(size)}"${
    ls ? ` letter-spacing="${r(ls)}"` : ''
  } text-anchor="${anchor}" fill="${fill}"${opacity !== undefined ? ` fill-opacity="${opacity}"` : ''}>${esc(content)}</text>`;
}
