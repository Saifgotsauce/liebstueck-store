import 'server-only';
import { GARMENTS, colorLabel, garmentText, getColor, isAvailable, printfulVariant, unitPriceCents, type Garment, type GarmentColor, type GarmentKey } from '../catalog';
import { stores } from '../config';
import { designLocale, getDesign, type Design } from '../designs';
import type { Locale } from '../locale';
import { getTemplate } from '../design/templates';
import { validateValues } from '../design/validate';
import type { DesignTemplate, FieldValues } from '../design/types';

export type CleanItem = {
  design: Design;
  template: DesignTemplate;
  garment: Garment;
  color: GarmentColor;
  size: string;
  values: FieldValues;
  qty: number;
  variantId: number;
  unitCents: number;
};

export type ItemError = { index: number; message: string };

const MSG = {
  en: {
    gone: 'This design is no longer available.',
    style: 'Unknown style.',
    color: 'Unknown color.',
    size: 'Unknown size.',
    stock: (g: string, c: string, s: string) => `The ${g.toLowerCase()} in ${c}, size ${s} is out of stock right now.`,
  },
  de: {
    gone: 'Dieses Motiv gibt es nicht mehr.',
    style: 'Unbekanntes Modell.',
    color: 'Unbekannte Farbe.',
    size: 'Unbekannte Größe.',
    stock: (g: string, c: string, s: string) => `${g} in ${c}, Größe ${s} ist gerade nicht lieferbar.`,
  },
};

/**
 * Re-validates everything the browser sent. Prices always come from the catalog,
 * never from the client.
 */
export function parseItems(raw: unknown, locale: Locale = 'en'): { items: CleanItem[]; errors: ItemError[] } {
  const shop = stores[locale];
  const m = MSG[locale];
  const arr = Array.isArray(raw) ? raw.slice(0, shop.maxItemsPerOrder) : [];
  const items: CleanItem[] = [];
  const errors: ItemError[] = [];

  arr.forEach((r, index) => {
    const o = (r ?? {}) as Record<string, unknown>;
    const design = getDesign(String(o.design ?? ''));
    // a design is only sold in its own store
    if (!design || design.hidden || designLocale(design) !== locale) return errors.push({ index, message: m.gone });
    const gKey = String(o.garment ?? '') as GarmentKey;
    const garment = GARMENTS[gKey];
    if (!garment) return errors.push({ index, message: m.style });
    const color = getColor(garment, String(o.color ?? ''));
    if (!color) return errors.push({ index, message: m.color });
    const size = String(o.size ?? '');
    if (!garment.sizes.includes(size)) return errors.push({ index, message: m.size });
    const template = getTemplate(design.slug);
    const v = validateValues(template, o.values, locale);
    if (!v.ok) return errors.push({ index, message: Object.values(v.errors)[0] });
    const variant = printfulVariant(gKey, color.key, size);
    if (!variant || !isAvailable(gKey, color.key, size, locale)) {
      return errors.push({ index, message: m.stock(garmentText(gKey, locale).label, colorLabel(color, locale), size) });
    }
    const qty = Math.max(1, Math.min(shop.maxQuantityPerItem, Math.floor(Number(o.qty) || 1)));
    items.push({ design, template, garment, color, size, values: v.values, qty, variantId: variant.id, unitCents: unitPriceCents(gKey, size, locale, design.slug) });
  });

  return { items, errors };
}

/** Compact form stored on the Stripe line item, read back by the webhook. */
export type StoredItem = { d: string; g: GarmentKey; c: string; s: string; v: FieldValues };

export function toStored(i: CleanItem): StoredItem {
  return { d: i.design.slug, g: i.garment.key, c: i.color.key, s: i.size, v: i.values };
}

export function fromStored(s: StoredItem, qty: number): CleanItem | null {
  const d = getDesign(s.d);
  const { items } = parseItems([{ design: s.d, garment: s.g, color: s.c, size: s.s, values: s.v, qty }], d ? designLocale(d) : 'en');
  return items[0] ?? null;
}
