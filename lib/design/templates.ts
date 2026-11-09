// Turns every design in the phrase bank (lib/designs.ts) into a print template. The same
// template renders the live preview in the browser and the print file on the server.
import { ALL_DESIGNS, type Design } from '../designs';
import { fillText, layoutFonts, renderLayout } from './layouts';
import { palette, type DesignTemplate, type FieldValues, type InkTheme } from './types';

function makeTemplate(d: Design): DesignTemplate {
  const fields = d.fields ?? [];
  return {
    id: d.slug,
    name: d.title,
    fields,
    fonts: layoutFonts(d.spec),
    render: (values, p) => renderLayout(d.spec, values, p),
    summarize: (values) =>
      fields
        .map((f) => {
          const v = values[f.key];
          const s = Array.isArray(v) ? v.filter(Boolean).join(', ') : String(v ?? '').trim();
          return s ? `${f.label.replace(/ \(optional\)$/, '')}: ${s}` : '';
        })
        .filter(Boolean)
        .join(' · '),
  };
}

export const TEMPLATES: Record<string, DesignTemplate> = Object.fromEntries(ALL_DESIGNS.map((d) => [d.slug, makeTemplate(d)]));

export function getTemplate(id: string): DesignTemplate {
  const t = TEMPLATES[id];
  if (!t) throw new Error(`Unknown design ${id}`);
  return t;
}

export function defaultValues(t: DesignTemplate): FieldValues {
  return Object.fromEntries(t.fields.map((f) => [f.key, Array.isArray(f.default) ? [...f.default] : f.default]));
}

/** The print palette for a design on a garment colour. */
export function designPalette(slug: string, ink: InkTheme) {
  const d = ALL_DESIGNS.find((x) => x.slug === slug);
  return palette(ink, d?.accent ?? 'red');
}

export { fillText };
