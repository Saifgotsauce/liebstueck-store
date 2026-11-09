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

export function palette(ink: InkTheme, accent: AccentKey = 'red'): Palette {
  return ink === 'dark'
    ? { ink: DARK_INK, accent: ACCENTS.dark[accent], knock: '#FFFFFF' }
    : { ink: LIGHT_INK, accent: ACCENTS.light[accent], knock: '#141414' };
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
