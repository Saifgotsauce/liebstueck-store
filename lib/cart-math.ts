// Prices, bundle savings and shipping – shared by the browser cart and the server checkout
// (kept free of 'use client' so both can import it).
import { unitPriceCents, type GarmentKey } from './catalog';
import { shop } from './config';

export type PricedLine = { garment: GarmentKey; size: string; qty: number };

export function itemPriceCents(item: { garment: GarmentKey; size?: string }) {
  return unitPriceCents(item.garment, item.size);
}

/** Bundle saving for this many items, in percent (0 when none applies). */
export function bundlePercent(itemCount: number) {
  return shop.bundles.find((b) => itemCount >= b.minItems)?.percent ?? 0;
}

/** The next bundle tier the shopper could reach, for "add 1 more and save 15%" nudges. */
export function nextBundle(itemCount: number) {
  const tiers = [...shop.bundles].sort((a, b) => a.minItems - b.minItems);
  return tiers.find((b) => itemCount < b.minItems) ?? null;
}

export function shippingFor(merchandiseCents: number) {
  return merchandiseCents === 0 || merchandiseCents >= shop.freeShippingFromCents ? 0 : shop.shippingCents;
}

export function cartTotals(lines: PricedLine[]) {
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const subtotal = lines.reduce((s, l) => s + itemPriceCents(l) * l.qty, 0);
  const percent = bundlePercent(count);
  const discount = Math.round((subtotal * percent) / 100);
  const merchandise = subtotal - discount;
  const shipping = shippingFor(merchandise);
  return { count, subtotal, percent, discount, merchandise, shipping, total: merchandise + shipping };
}
