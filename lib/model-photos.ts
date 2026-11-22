import variants from '@/data/image-variants.json';
import type { GarmentKey } from './catalog';

// Product photos: model photos (made in ChatGPT from the reference sheets in out/chatgpt/) and
// realistic mockups (flat lays, lifestyle shots). File: public/photos/<slug>-<n>.jpg, 1200×1200.
// Only add a photo after checking the print matches the real design.
//
// Each photo shows one garment in one colour. The product page only shows the photos that match
// what she has picked; for any other colour (or a personalised shirt with her own text) it shows
// the live preview instead, which is drawn in every colour. Within a garment + colour, the first
// photo leads (and is the shop card); the second one fades in on hover on computers and is the next
// slide on phones.
export const MODEL_PHOTOS: Record<string, number> = {
  'not-old-seasoned': 1,
  'coffee-hot-flashes-spite': 1,
  'fluent-in-sarcasm': 1,
  'fine-wine-cheap-tequila': 1,
  'vintage-knees': 1,
  'peaked-honey': 1,
  'too-old-for-drama': 2,
  'status-report': 1,
  'dont-do-mornings': 1,
  'say-what-im-thinking': 1,
  // 1 lifestyle, woman in the black tee (main), 2 flat lay (hover), 3 flat lay with coffee and jeans,
  // 4 hoodie with coffee
  'good-grandmas-bad-words': 4,
};

/** Photos that aren't the design's default colour on a tee. Index = photo number − 1. */
const PHOTO_OF: Record<string, Record<number, { garment?: GarmentKey; color?: string }>> = {
  'good-grandmas-bad-words': { 3: { garment: 'hoodie', color: 'black' } },
};

export type ModelPhoto = { src: string; title: string; srcSet?: string; garment?: GarmentKey; color?: string };

// Small WebP copies made by scripts/optimize-images.ts (480, 800 and 1200px wide).
const sizes = (variants as unknown as { photos: Record<string, number[]> }).photos;

/** All photos of a design. `color` undefined = the design's default colour. */
export function modelPhotos(slug: string): ModelPhoto[] {
  const n = MODEL_PHOTOS[slug] ?? 0;
  return Array.from({ length: n }, (_, i) => {
    const src = `/photos/${slug}-${i + 1}.jpg`;
    const widths = sizes[src];
    const of = PHOTO_OF[slug]?.[i];
    return {
      src,
      title: '',
      srcSet: widths?.map((w) => `${src.replace(/\.jpe?g$/, '')}-${w}.webp ${w}w`).join(', '),
      garment: of?.garment ?? 'tee',
      color: of?.color,
    };
  });
}

/** The photos that show exactly this garment in this colour (default colour passed in by the caller). */
export function photosFor(slug: string, garment: GarmentKey, color: string, defaultColor: string): ModelPhoto[] {
  return modelPhotos(slug).filter((p) => (p.garment ?? 'tee') === garment && (p.color ?? defaultColor) === color);
}
