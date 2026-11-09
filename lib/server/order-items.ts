import 'server-only';
import { GARMENTS, getColor, getProduct, isAvailable, printfulVariant, type Garment, type GarmentColor, type Product } from '../catalog';
import { shop } from '../config';
import { getTemplate } from '../design/templates';
import { validateValues } from '../design/validate';
import type { DesignTemplate, FieldValues } from '../design/types';
import { fmt, loc, type Locale } from '../i18n';

const MSG = {
  de: { product: 'Unbekanntes Produkt.', variant: 'Unbekannte Variante.', colour: 'Unbekannte Farbe.', size: 'Unbekannte Größe.', unavailable: '{garment} in {colour}, Größe {size} ist gerade nicht verfügbar.' },
  en: { product: 'Unknown product.', variant: 'Unknown option.', colour: 'Unknown colour.', size: 'Unknown size.', unavailable: '{garment} in {colour}, size {size} is currently unavailable.' },
};

export type CleanItem = {
  product: Product;
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
export function parseItems(raw: unknown, locale: Locale = 'de'): { items: CleanItem[]; errors: ItemError[] } {
  const m = MSG[locale];
  const arr = Array.isArray(raw) ? raw.slice(0, shop.maxItemsPerOrder) : [];
  const items: CleanItem[] = [];
  const errors: ItemError[] = [];

  arr.forEach((r, index) => {
    const o = (r ?? {}) as Record<string, unknown>;
    const product = getProduct(String(o.productSlug ?? ''));
    if (!product) return errors.push({ index, message: m.product });
    const gKey = String(o.garment ?? '') as Garment['key'];
    if (!product.garments.includes(gKey)) return errors.push({ index, message: m.variant });
    const garment = GARMENTS[gKey];
    const color = getColor(garment, String(o.color ?? ''));
    if (!color) return errors.push({ index, message: m.colour });
    const size = String(o.size ?? '');
    if (!garment.sizes.includes(size)) return errors.push({ index, message: m.size });
    const template = getTemplate(product.template);
    const v = validateValues(template, o.values, locale);
    if (!v.ok) return errors.push({ index, message: Object.values(v.errors)[0] });
    const variant = printfulVariant(gKey, color.key, size);
    if (!variant || !isAvailable(gKey, color.key, size)) return errors.push({ index, message: fmt(m.unavailable, { garment: loc(garment.label, locale), colour: loc(color.label, locale), size }) });
    const qty = Math.max(1, Math.min(shop.maxQuantityPerItem, Math.floor(Number(o.qty) || 1)));
    items.push({ product, template, garment, color, size, values: v.values, qty, variantId: variant.id, unitCents: garment.priceCents });
  });

  return { items, errors };
}

/** Compact form stored on the Stripe line item, read back by the webhook. */
export type StoredItem = { p: string; g: Garment['key']; c: string; s: string; v: FieldValues };

export function toStored(i: CleanItem): StoredItem {
  return { p: i.product.slug, g: i.garment.key, c: i.color.key, s: i.size, v: i.values };
}

export function fromStored(s: StoredItem, qty: number): CleanItem | null {
  const { items } = parseItems([{ productSlug: s.p, garment: s.g, color: s.c, size: s.s, values: s.v, qty }]);
  return items[0] ?? null;
}
