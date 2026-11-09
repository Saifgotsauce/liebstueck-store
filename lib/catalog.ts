// Garments (the blank shirts Printful prints on). The designs themselves live in
// lib/designs.ts. After changing Printful products or colours, run the "Printful sync"
// GitHub Action so the variant IDs in data/printful-variants.json match.
import variantData from '@/data/printful-variants.json';
import { shop } from './config';
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
    priceCents: 2995,
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
    priceCents: 4495,
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

export function unitPriceCents(garment: GarmentKey, size?: string) {
  const g = GARMENTS[garment];
  return g.priceCents + (size ? g.sizeExtraCents[size] ?? 0 : 0);
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

/** Variant can be printed in our fulfilment region (unknown before the first sync with region data → yes). */
const inRegion = (v: VariantInfo) => !v.regions || v.regions.some((r) => r === shop.fulfilmentRegion || r.startsWith(`${shop.fulfilmentRegion}_`));

/**
 * Can this colour/size be sold? Before the first sync everything counts as available (demo).
 * After it, the variant must exist at Printful and be in stock in our fulfilment region.
 */
export function isAvailable(garment: GarmentKey, color: string, size?: string): boolean {
  if (!variantsSynced) return true;
  const byColor = variants.garments[garment]?.variants?.[color];
  if (!byColor) return false;
  if (size) return Boolean(byColor[size]) && inRegion(byColor[size]);
  return Object.values(byColor).some(inRegion);
}

export function availableColors(garment: GarmentKey) {
  return GARMENTS[garment].colors.filter((c) => isAvailable(garment, c.key));
}

/** The design's preferred colour on this garment, or the first one we can actually sell. */
export function defaultColor(design: Pick<Design, 'color'>, garment: GarmentKey): string {
  const avail = availableColors(garment);
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
