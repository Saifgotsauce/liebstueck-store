// Garments (the blank shirts Printful prints on). The designs themselves live in
// lib/designs.ts. After changing Printful products or colours, run the "Printful sync"
// GitHub Action so the variant IDs in data/printful-variants.json match.
import { TEE_PRICE_US } from './prices';
import variantData from '@/data/printful-variants.json';
import { stores } from './config';
import type { Locale } from './locale';
import type { Design } from './designs';
import type { InkTheme } from './design/types';

export type GarmentColor = {
  key: string;
  label: string;
  hex: string;
  printfulColor: string; // colour name exactly as Printful lists it
  ink: InkTheme; // which print palette works on this colour
};

export type GarmentKey = 'tee' | 'hoodie';

export type Garment = {
  key: GarmentKey;
  label: string;
  printfulProductId: number;
  model: string;
  material: string;
  fit: string;
  priceCents: number;
  /** Bigger sizes cost Printful more; we pass a little of that on. */
  sizeExtraCents: Record<string, number>;
  sizes: string[];
  colors: GarmentColor[];
  // Size chart in inches (laid flat). Matches Printful's size guide for this blank.
  sizeChart: { size: string; width: number; length: number }[];
  care: string[];
};

export const GARMENTS: Record<GarmentKey, Garment> = {
  tee: {
    key: 'tee',
    label: 'T-shirt',
    printfulProductId: 71, // Bella + Canvas 3001 Unisex Staple T-Shirt
    model: 'Bella+Canvas 3001 unisex tee',
    material: '100% combed, ring-spun cotton – soft and light (heather colors are a cotton-poly blend)',
    fit: 'Unisex, relaxed fit. Women usually take their normal size, or one down for a closer fit.',
    priceCents: 3495, // $34.95: covers ads, misprints and size swaps (Regular Mess charges ~$45)
    sizeExtraCents: { '2XL': 200, '3XL': 300, '4XL': 400 },
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
    colors: [
      { key: 'black', label: 'Black', hex: '#0C0C0C', printfulColor: 'Black', ink: 'light' },
      { key: 'white', label: 'White', hex: '#FFFFFF', printfulColor: 'White', ink: 'dark' },
      { key: 'heather', label: 'Heather Gray', hex: '#CECECC', printfulColor: 'Athletic Heather', ink: 'dark' },
      { key: 'mauve', label: 'Heather Mauve', hex: '#BF9AA0', printfulColor: 'Heather Mauve', ink: 'dark' },
      { key: 'navy', label: 'Navy', hex: '#212642', printfulColor: 'Navy', ink: 'light' },
      { key: 'maroon', label: 'Maroon', hex: '#721D37', printfulColor: 'Maroon', ink: 'light' },
      { key: 'forest', label: 'Forest Green', hex: '#223E25', printfulColor: 'Forest', ink: 'light' },
    ],
    sizeChart: [
      { size: 'XS', width: 16.5, length: 27 },
      { size: 'S', width: 18, length: 28 },
      { size: 'M', width: 20, length: 29 },
      { size: 'L', width: 22, length: 30 },
      { size: 'XL', width: 24, length: 31 },
      { size: '2XL', width: 26, length: 32 },
      { size: '3XL', width: 28, length: 33 },
      { size: '4XL', width: 30, length: 34 },
    ],
    care: ['Machine wash cold, inside out', 'Tumble dry low or hang dry', 'Don’t iron directly on the print'],
  },
  hoodie: {
    key: 'hoodie',
    label: 'Hoodie',
    printfulProductId: 146, // Gildan 18500 Unisex Heavy Blend Hoodie
    model: 'Gildan 18500 unisex heavy blend hoodie',
    material: '50% cotton, 50% polyester fleece – warm and cozy',
    fit: 'Unisex, classic fit with front pouch pocket and drawstring hood.',
    priceCents: 4995, // $49.95, and every order with a hoodie ships free (stores.en.freeShippingWithHoodie)
    sizeExtraCents: { '2XL': 300, '3XL': 400, '4XL': 500 },
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
    colors: [
      { key: 'black', label: 'Black', hex: '#0B0B0B', printfulColor: 'Black', ink: 'light' },
      { key: 'heather', label: 'Sport Gray', hex: '#B9B9B6', printfulColor: 'Sport Grey', ink: 'dark' },
      { key: 'navy', label: 'Navy', hex: '#131928', printfulColor: 'Navy', ink: 'light' },
      { key: 'maroon', label: 'Maroon', hex: '#47171C', printfulColor: 'Maroon', ink: 'light' },
      { key: 'forest', label: 'Forest Green', hex: '#222E1F', printfulColor: 'Forest Green', ink: 'light' },
      { key: 'pink', label: 'Light Pink', hex: '#F2CBD3', printfulColor: 'Light Pink', ink: 'dark' },
      { key: 'white', label: 'White', hex: '#FFFFFF', printfulColor: 'White', ink: 'dark' },
    ],
    sizeChart: [
      { size: 'S', width: 20, length: 27 },
      { size: 'M', width: 22, length: 28 },
      { size: 'L', width: 24, length: 29 },
      { size: 'XL', width: 26, length: 30 },
      { size: '2XL', width: 28, length: 31 },
      { size: '3XL', width: 30, length: 32 },
      { size: '4XL', width: 32, length: 33 },
    ],
    care: ['Machine wash cold, inside out', 'Tumble dry low', 'Don’t iron directly on the print'],
  },
};

export const GARMENT_KEYS = Object.keys(GARMENTS) as GarmentKey[];

export function getColor(g: Garment, key: string) {
  return g.colors.find((c) => c.key === key);
}

/** German store prices in euro cents, VAT included. */
const PRICES_DE: Record<GarmentKey, { base: number; sizeExtra: Record<string, number> }> = {
  tee: { base: 2995, sizeExtra: { '2XL': 200, '3XL': 300, '4XL': 400 } },
  hoodie: { base: 4995, sizeExtra: { '2XL': 300, '3XL': 400, '4XL': 500 } },
};

/** The everyday price, before any store-wide sale (US dollars or euros, in cents).
 *  US tees can have their own price per design (lib/prices.ts) – pass the design slug. */
export function regularPriceCents(garment: GarmentKey, size?: string, locale: Locale = 'en', design?: string) {
  if (locale === 'de') {
    const p = PRICES_DE[garment];
    return p.base + (size ? p.sizeExtra[size] ?? 0 : 0);
  }
  const g = GARMENTS[garment];
  const base = garment === 'tee' && design && TEE_PRICE_US[design] ? TEE_PRICE_US[design] : g.priceCents;
  return base + (size ? g.sizeExtraCents[size] ?? 0 : 0);
}

/** What the shopper pays per item (before bundle savings). Includes the store-wide sale when one is on. */
export function unitPriceCents(garment: GarmentKey, size?: string, locale: Locale = 'en', design?: string) {
  const regular = regularPriceCents(garment, size, locale, design);
  const sale = stores[locale].sale;
  return sale ? Math.round((regular * (100 - sale.percent)) / 100) : regular;
}

/** The lowest tee price in the store ("T-shirts from $29.95"). */
export function teeFromCents(locale: Locale = 'en') {
  if (locale === 'de') return unitPriceCents('tee', undefined, 'de');
  return Math.min(unitPriceCents('tee', undefined, 'en'), ...Object.keys(TEE_PRICE_US).map((slug) => unitPriceCents('tee', undefined, 'en', slug)));
}

/** Size extra for a size, for the "+$2" / "+2 €" hint on size buttons. */
export function sizeExtraCents(garment: GarmentKey, size: string, locale: Locale = 'en') {
  return locale === 'de' ? PRICES_DE[garment].sizeExtra[size] ?? 0 : GARMENTS[garment].sizeExtraCents[size] ?? 0;
}

// ── German wording for garments and colours ─────────────────────────────────

const COPY_DE: Record<GarmentKey, { label: string; model: string; material: string; fit: string; care: string[] }> = {
  tee: {
    label: 'T-Shirt',
    model: 'Bella+Canvas 3001 Unisex-T-Shirt',
    material: '100 % gekämmte, ringgesponnene Baumwolle – weich und leicht (meliert: Baumwolle mit Polyester)',
    fit: 'Unisex, locker geschnitten. Frauen nehmen meist ihre normale Größe, für einen engeren Sitz eine kleiner.',
    care: ['Auf links bei 30 °C waschen', 'Schonend trocknen oder aufhängen', 'Nicht direkt auf dem Druck bügeln'],
  },
  hoodie: {
    label: 'Hoodie',
    model: 'Gildan 18500 Unisex-Kapuzenpullover',
    material: '50 % Baumwolle, 50 % Polyester, innen angeraut – warm und kuschelig',
    fit: 'Unisex, klassischer Schnitt mit Kängurutasche und Kordel an der Kapuze.',
    care: ['Auf links bei 30 °C waschen', 'Schonend trocknen', 'Nicht direkt auf dem Druck bügeln'],
  },
};

const COLOR_DE: Record<string, string> = {
  Black: 'Schwarz',
  White: 'Weiß',
  'Heather Gray': 'Grau meliert',
  'Heather Mauve': 'Mauve meliert',
  Navy: 'Marineblau',
  Maroon: 'Weinrot',
  'Forest Green': 'Waldgrün',
  'Sport Gray': 'Grau meliert',
  'Light Pink': 'Rosa',
};

/** Garment name, model, material, fit and care text in the store's language. */
export function garmentText(garment: GarmentKey, locale: Locale = 'en') {
  const g = GARMENTS[garment];
  return locale === 'de' ? COPY_DE[garment] : { label: g.label, model: g.model, material: g.material, fit: g.fit, care: g.care };
}

export function colorLabel(c: GarmentColor, locale: Locale = 'en') {
  return locale === 'de' ? COLOR_DE[c.label] ?? c.label : c.label;
}

// ── Printful variant lookup (written by scripts/printful-sync.ts) ─────────────

type VariantInfo = { id: number; cost: number | null; regions?: string[]; eu?: boolean | null };
type VariantFile = {
  generatedAt: string | null;
  garments: Partial<
    Record<
      GarmentKey,
      {
        productId: number;
        productName: string;
        currency?: string | null;
        placement?: string;
        printfile: { width: number; height: number; dpi: number };
        variants: Record<string, Record<string, VariantInfo>>;
      }
    >
  >;
};
const variants = variantData as VariantFile;
export const variantsSynced = Boolean(variants.generatedAt);

export function printfulVariant(garment: GarmentKey, color: string, size: string): VariantInfo | null {
  return variants.garments[garment]?.variants?.[color]?.[size] ?? null;
}

/** Variant can be printed in the store's fulfilment region (unknown before the first sync with region data → yes). */
const inRegion = (v: VariantInfo, locale: Locale) => {
  const region = stores[locale].fulfilmentRegion;
  return !v.regions || v.regions.some((r) => r === region || r.startsWith(`${region}_`));
};

/**
 * Can this colour/size be sold? Before the first sync everything counts as available (demo).
 * After it, the variant must exist at Printful and be in stock in our fulfilment region.
 */
export function isAvailable(garment: GarmentKey, color: string, size?: string, locale: Locale = 'en'): boolean {
  if (!variantsSynced) return true;
  const byColor = variants.garments[garment]?.variants?.[color];
  if (!byColor) return false;
  if (size) return Boolean(byColor[size]) && inRegion(byColor[size], locale);
  return Object.values(byColor).some((v) => inRegion(v, locale));
}

export function availableColors(garment: GarmentKey, locale: Locale = 'en') {
  return GARMENTS[garment].colors.filter((c) => isAvailable(garment, c.key, undefined, locale));
}

/** The design's preferred colour on this garment, or the first one we can actually sell. */
export function defaultColor(design: Pick<Design, 'color'>, garment: GarmentKey, locale: Locale = 'en'): string {
  const avail = availableColors(garment, locale);
  if (avail.some((c) => c.key === design.color)) return design.color;
  // keep the same ink family if possible (dark shirt ↔ dark shirt)
  const wanted = getColor(GARMENTS.tee, design.color)?.ink;
  return (avail.find((c) => c.ink === wanted && c.key !== 'white') ?? avail.find((c) => c.ink === wanted) ?? avail[0] ?? GARMENTS[garment].colors[0]).key;
}

export function printfileSize(garment: GarmentKey) {
  // Defaults match Printful's 12" × 16" front area at 150 DPI until the sync script runs.
  return variants.garments[garment]?.printfile ?? { width: 1800, height: 2400, dpi: 150 };
}

/** Printful placement name for the chest print ('front_large' on newer DTG products). */
export function printPlacement(garment: GarmentKey) {
  return variants.garments[garment]?.placement ?? 'front';
}
