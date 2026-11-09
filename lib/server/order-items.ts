import 'server-only';
import { GARMENTS, getColor, isAvailable, printfulVariant, unitPriceCents, type Garment, type GarmentColor, type GarmentKey } from '../catalog';
import { shop } from '../config';
import { getDesign, type Design } from '../designs';
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

/**
 * Re-validates everything the browser sent. Prices always come from the catalog,
 * never from the client.
 */
export function parseItems(raw: unknown): { items: CleanItem[]; errors: ItemError[] } {
  const arr = Array.isArray(raw) ? raw.slice(0, shop.maxItemsPerOrder) : [];
  const items: CleanItem[] = [];
  const errors: ItemError[] = [];

  arr.forEach((r, index) => {
    const o = (r ?? {}) as Record<string, unknown>;
    const design = getDesign(String(o.design ?? ''));
    if (!design) return errors.push({ index, message: 'This design is no longer available.' });
    const gKey = String(o.garment ?? '') as GarmentKey;
    const garment = GARMENTS[gKey];
    if (!garment) return errors.push({ index, message: 'Unknown style.' });
    const color = getColor(garment, String(o.color ?? ''));
    if (!color) return errors.push({ index, message: 'Unknown color.' });
    const size = String(o.size ?? '');
    if (!garment.sizes.includes(size)) return errors.push({ index, message: 'Unknown size.' });
    const template = getTemplate(design.slug);
    const v = validateValues(template, o.values);
    if (!v.ok) return errors.push({ index, message: Object.values(v.errors)[0] });
    const variant = printfulVariant(gKey, color.key, size);
    if (!variant || !isAvailable(gKey, color.key, size)) {
      return errors.push({ index, message: `The ${garment.label.toLowerCase()} in ${color.label}, size ${size} is out of stock right now.` });
    }
    const qty = Math.max(1, Math.min(shop.maxQuantityPerItem, Math.floor(Number(o.qty) || 1)));
    items.push({ design, template, garment, color, size, values: v.values, qty, variantId: variant.id, unitCents: unitPriceCents(gKey, size) });
  });

  return { items, errors };
}

/** Compact form stored on the Stripe line item, read back by the webhook. */
export type StoredItem = { d: string; g: GarmentKey; c: string; s: string; v: FieldValues };

export function toStored(i: CleanItem): StoredItem {
  return { d: i.design.slug, g: i.garment.key, c: i.color.key, s: i.size, v: i.values };
}

export function fromStored(s: StoredItem, qty: number): CleanItem | null {
  const { items } = parseItems([{ design: s.d, garment: s.g, color: s.c, size: s.s, values: s.v, qty }]);
  return items[0] ?? null;
}
