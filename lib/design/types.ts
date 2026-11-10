import type { FontKey } from './text';

export type Palette = {
  ink: string; // main print colour
  accent: string; // second colour: highlights, ticks, stars
  knock: string; // text that sits on a solid ink/accent block (roughly the garment colour)
};

/** Which print palette suits a garment colour: dark ink on light shirts, light ink on dark shirts. */
export type InkTheme = 'dark' | 'light';
export type AccentKey = 'red' | 'gold' | 'pink' | 'teal';

const DARK_INK = '#1F1C1A';
const LIGHT_INK = '#F7F1E6';

export const ACCENTS: Record<InkTheme, Record<AccentKey, string>> = {
  // printed on white, heather, mauve, light pink
  dark: { red: '#C8402D', gold: '#B87A12', pink: '#B8476E', teal: '#1E7169' },
  // printed on black, navy, maroon
  light: { red: '#FF7A59', gold: '#F2B84B', pink: '#F6A5BD', teal: '#7FD1C1' },
};

// ── Contrast (WCAG formula) ─────────────────────────────────────────────────
// Every colour printed on a shirt must reach MIN_PRINT_CONTRAST against the shirt, so the joke can be read
// from across a room (docs/design-rules.md §6). The same palette feeds the preview and the print file.
export const MIN_PRINT_CONTRAST = 4.5;

const rgb = (hex: string) => {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};
function luminance(hex: string) {
  const [r, g, b] = rgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a: string, b: string) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}
function mix(a: string, b: string, t: number) {
  const [ca, cb] = [rgb(a), rgb(b)];
  return `#${ca.map((v, i) => Math.round(v + (cb[i] - v) * t).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

/**
 * The accent, deepened (on light shirts) or brightened (on dark shirts) just enough to stay readable on this
 * shirt colour. If it would need more than half-way towards the ink to pass, it would turn muddy, so the
 * design prints in the ink colour only (this is what happens on mid-tone shirts like Heather Mauve).
 */
export function readableAccent(accent: string, shirtHex: string, ink: string) {
  for (let t = 0; t <= 0.5001; t += 0.05) {
    const c = t === 0 ? accent : mix(accent, ink, t);
    if (contrast(c, shirtHex) >= MIN_PRINT_CONTRAST) return c;
  }
  return ink;
}

/** Print palette. Pass the shirt colour so accents are checked against it (always do, except in tests). */
export function palette(ink: InkTheme, accent: AccentKey = 'red', shirtHex?: string): Palette {
  const base =
    ink === 'dark'
      ? { ink: DARK_INK, accent: ACCENTS.dark[accent], knock: '#FFFFFF' }
      : { ink: LIGHT_INK, accent: ACCENTS.light[accent], knock: '#141414' };
  return shirtHex ? { ...base, accent: readableAccent(base.accent, shirtHex, base.ink) } : base;
}

type BaseField = { key: string; label: string; help?: string };

export type FieldDef =
  | (BaseField & { type: 'text'; placeholder?: string; maxLength: number; required: boolean; default: string; upper?: boolean })
  | (BaseField & { type: 'select'; options: { value: string; label: string }[]; default: string })
  | (BaseField & { type: 'names'; min: number; max: number; maxLength: number; default: string[]; placeholder?: string })
  | (BaseField & { type: 'year'; min: number; max: number; required: boolean; default: string })
  | (BaseField & { type: 'number'; min: number; max: number; required: boolean; default: string });

export type FieldValues = Record<string, string | string[]>;

export interface DesignTemplate {
  id: string;
  name: string;
  fields: FieldDef[];
  /** Fonts the personalised text is printed in – customer input is checked against these. */
  fonts: FontKey[];
  /** SVG elements in a 1200 × 1600 coordinate space (= 12 × 16 in print area, 3:4). */
  render(values: FieldValues, palette: Palette): string;
  /** One-line summary of the personalisation for the cart and emails ('' when there is none). */
  summarize(values: FieldValues): string;
}

export const DESIGN_W = 1200;
export const DESIGN_H = 1600;
