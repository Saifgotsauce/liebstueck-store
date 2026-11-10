// Prices, bundle savings and shipping – shared by the browser cart and the server checkout
// (kept free of 'use client' so both can import it).
import { unitPriceCents, type GarmentKey } from './catalog';
import { stores } from './config';
import type { Locale } from './locale';

export type PricedLine = { garment: GarmentKey; size: string; qty: number };

export function itemPriceCents(item: { garment: GarmentKey; size?: string }, locale: Locale = 'en') {
  return unitPriceCents(item.garment, item.size, locale);
}

/** Bundle saving for this many items, in percent (0 when none applies). */
export function bundlePercent(itemCount: number, locale: Locale = 'en') {
  return stores[locale].bundles.find((b) => itemCount >= b.minItems)?.percent ?? 0;
}

/** The next bundle tier the shopper could reach, for "add 1 more and save 15%" nudges. */
export function nextBundle(itemCount: number, locale: Locale = 'en') {
  const tiers = [...stores[locale].bundles].sort((a, b) => a.minItems - b.minItems);
  return tiers.find((b) => itemCount < b.minItems) ?? null;
}

/** Shipping for an order: free over the threshold, and (US) free whenever there's a hoodie in it. */
export function shippingFor(merchandiseCents: number, locale: Locale = 'en', hasHoodie = false) {
  const s = stores[locale];
  if (merchandiseCents === 0 || merchandiseCents >= s.freeShippingFromCents) return 0;
  return hasHoodie && s.freeShippingWithHoodie ? 0 : s.shippingCents;
}

export function cartTotals(lines: PricedLine[], locale: Locale = 'en') {
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const subtotal = lines.reduce((s, l) => s + itemPriceCents(l, locale) * l.qty, 0);
  const percent = bundlePercent(count, locale);
  const discount = Math.round((subtotal * percent) / 100);
  const merchandise = subtotal - discount;
  const shipping = shippingFor(merchandise, locale, lines.some((l) => l.garment === 'hoodie' && l.qty > 0));
  return { count, subtotal, percent, discount, merchandise, shipping, total: merchandise + shipping };
}
