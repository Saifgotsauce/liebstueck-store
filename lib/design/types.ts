export type Palette = {
  ink: string; // main print colour
  accent: string; // hearts, stars, script lines
};

export type InkTheme = 'dark' | 'light';

export const PALETTES: Record<InkTheme, Palette> = {
  // for white / light grey garments
  dark: { ink: '#1E2B3A', accent: '#C0392B' },
  // for black, navy, bordeaux, green garments
  light: { ink: '#F6F0E4', accent: '#F0B54A' },
};

import type { L, Locale } from '../i18n';

type BaseField = { key: string; label: L; help?: L };

export type FieldDef =
  | (BaseField & { type: 'text'; placeholder?: L; maxLength: number; required: boolean; default: string })
  | (BaseField & { type: 'select'; options: { value: string; label: L }[]; default: string })
  | (BaseField & { type: 'names'; min: number; max: number; maxLength: number; default: string[]; placeholder?: L })
  | (BaseField & { type: 'year'; min: number; max: number; required: boolean; default: string });

export type FieldValues = Record<string, string | string[]>;

export interface DesignTemplate {
  id: string;
  name: string;
  fields: FieldDef[];
  /** SVG elements in a 1200 × 1600 coordinate space (= 12 × 16 in print area, 3:4). */
  render(values: FieldValues, palette: Palette): string;
  /** One-line summary of the personalisation, e.g. for the cart and order emails. */
  summarize(values: FieldValues, locale?: Locale): string;
}

export const DESIGN_W = 1200;
export const DESIGN_H = 1600;
