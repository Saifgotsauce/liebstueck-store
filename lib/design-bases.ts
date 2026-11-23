// Real photos of a blank shirt for one design, so its live (editable) preview looks like a photo
// instead of Printful's mockup. Made from the owner's flat lays with the print removed (Nov 23).
// d = where the 1200×1600 design box sits on the photo, in photo pixels, measured so the default
// text lands exactly where it's printed in the original photo.
import { printfileSize, type GarmentKey } from './catalog';
import { designRect } from './design/svg';
import type { MockupColor } from './mockups';

type Base = { src: string; w: number; h: number; d: { x: number; y: number; w: number } };

const BASES: Record<string, Partial<Record<GarmentKey, Record<string, Base>>>> = {
  'the-grandma-they-warned-you-about': {
    tee: {
      maroon: { src: '/mockups/designs/the-grandma-they-warned-you-about-tee-maroon.webp', w: 1254, h: 1254, d: { x: 381.6, y: 233.0, w: 524.0 } },
      black: { src: '/mockups/designs/the-grandma-they-warned-you-about-tee-black.webp', w: 1254, h: 1254, d: { x: 382.2, y: 226.6, w: 523.8 } },
      navy: { src: '/mockups/designs/the-grandma-they-warned-you-about-tee-navy.webp', w: 1254, h: 1254, d: { x: 382.2, y: 232.1, w: 524.8 } },
    },
  },
};

/** The design's own blank photo for this garment and colour, in the same shape as a Printful mockup. */
export function designBase(slug: string, garment: GarmentKey, color: string): MockupColor | null {
  const b = BASES[slug]?.[garment]?.[color];
  if (!b) return null;
  const pf = printfileSize(garment);
  const r = designRect(pf.width, pf.height, pf.dpi);
  const k = b.d.w / r.w;
  return {
    w: b.w,
    h: b.h,
    area: { left: b.d.x - r.x * k, top: b.d.y - r.y * k, width: pf.width * k, height: pf.height * k },
    bg: b.src,
    bgColor: null,
    overlay: null,
    overlayOnTop: false,
    // a touch of the fabric shows through, like real ink
    printOpacity: 0.95,
  };
}
