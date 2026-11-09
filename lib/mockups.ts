// Real garment photos from Printful (layout templates), written by the Printful sync.
// Until the first sync the shop falls back to drawn garments.
import data from '@/data/printful-mockups.json';
import { printfileSize, type GarmentKey } from './catalog';
import { designRect } from './design/svg';

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

export type MockupView = 'full' | 'main' | 'tile' | 'zoom';

/**
 * Where the design sits on the photo (same placement as the print file) and the square
 * crop for each view. Shared by the live preview and the image renderer script.
 */
export function mockupGeometry(photo: MockupColor, garment: GarmentKey, view: MockupView) {
  const { area, w, h } = photo;
  const pf = printfileSize(garment);
  const r = designRect(pf.width, pf.height, pf.dpi);
  const k = area.width / pf.width;
  const d = { x: area.left + r.x * k, y: area.top + r.y * k, w: r.w * k, h: r.h * k };
  let box = { x: 0, y: 0, size: Math.min(w, h) };
  if (view === 'zoom') {
    const size = Math.min(w, h, d.w * 1.45);
    box = { size, x: Math.max(0, Math.min(w - size, d.x + d.w / 2 - size / 2)), y: Math.max(0, Math.min(h - size, d.y - size * 0.06)) };
  } else if (view === 'tile' || view === 'main') {
    // a square around the shirt body; tighter for grid tiles so the slogan stays readable
    const size = Math.min(w, h, d.w * (view === 'tile' ? 2.3 : 2.75));
    box = { size, x: Math.max(0, Math.min(w - size, d.x + d.w / 2 - size / 2)), y: Math.max(0, Math.min(h - size, d.y - size * 0.2)) };
  }
  return { d, box, viewBox: view === 'full' ? `0 0 ${w} ${h}` : `${box.x} ${box.y} ${box.size} ${box.size}` };
}
