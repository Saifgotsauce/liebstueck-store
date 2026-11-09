// Shared by the browser cart and the server checkout (kept free of 'use client').
import { GARMENTS, type Garment } from './catalog';
import { shop } from './config';

export function itemPriceCents(item: { garment: Garment['key'] }) {
  return GARMENTS[item.garment]?.priceCents ?? 0;
}

export function shippingFor(subtotalCents: number) {
  return subtotalCents === 0 || subtotalCents >= shop.freeShippingFromCents ? 0 : shop.shippingCents;
}
