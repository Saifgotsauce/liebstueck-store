// Real photos from Printful, written by `npm run printful:sync`. Until the first sync the
// shop falls back to drawn garments.
import data from '@/data/printful-mockups.json';

export type MockupColor = {
  w: number;
  h: number;
  area: { left: number; top: number; width: number; height: number };
  bg: string | null;
  bgColor: string | null;
  overlay: string | null;
  overlayOnTop: boolean;
};

type MockupFile = {
  generatedAt: string | null;
  garments: Record<string, { placement: string; colors: Record<string, MockupColor> }>;
  products: Record<string, { src: string; title: string }[]>;
};

const mockups = data as unknown as MockupFile;

export function garmentPhoto(garment: string, color: string): MockupColor | null {
  return mockups.garments[garment]?.colors?.[color] ?? null;
}

export function productPhotos(slug: string) {
  return mockups.products[slug] ?? [];
}
