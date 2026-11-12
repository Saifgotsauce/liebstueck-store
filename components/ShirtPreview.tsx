// A design on a real garment photo (Printful's mockup template), as one SVG. Pure component:
// renders on the server for product grids and live in the browser while personalizing.
import { getTemplate, designPalette } from '@/lib/design/templates';
import type { FieldValues } from '@/lib/design/types';
import { GARMENTS, getColor, type GarmentKey } from '@/lib/catalog';
import { garmentPhoto, mockupGeometry, tilePhoto, type MockupColor, type MockupView } from '@/lib/mockups';

type Props = {
  design: string;
  garment: GarmentKey;
  colorKey: string;
  values: FieldValues;
  label: string;
  className?: string;
  /** 'full' = whole photo, 'main' = product photo, 'tile' = tighter square for grids, 'zoom' = close-up of the print */
  view?: MockupView;
  /** Use the small photo files. On by default for tiles; turn off where a tile is shown large. */
  small?: boolean;
};

export default function ShirtPreview({ design, garment, colorKey, values, label, className, view = 'full', small = view === 'tile' }: Props) {
  const t = getTemplate(design);
  const color = getColor(GARMENTS[garment], colorKey) ?? GARMENTS[garment].colors[0];
  const markup = t.render(values, designPalette(design, color));
  const photo = garmentPhoto(garment, color.key);
  // Grid tiles show at about a third of the photo's size: they get the small file.
  if (photo) return <PhotoPreview photo={small ? tilePhoto(photo) : photo} garment={garment} design={markup} label={label} className={className} view={view} />;
  return <DrawnPreview garment={garment} hex={color.hex} light={color.ink === 'dark'} design={markup} label={label} className={className} />;
}

function PhotoPreview({ photo, garment, design, label, className, view = 'full' }: { photo: MockupColor; garment: GarmentKey; design: string; label: string; className?: string; view: Props['view'] }) {
  const { w, h } = photo;
  const { d, viewBox } = mockupGeometry(photo, garment, view);
  const overlay = photo.overlay ? <image href={photo.overlay} x="0" y="0" width={w} height={h} /> : null;

  return (
    <svg viewBox={viewBox} role="img" aria-label={label} className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width={w} height={h} fill="#fff" />
      {photo.bgColor && <rect x="0" y="0" width={w} height={h} fill={photo.bgColor} />}
      {photo.bg && <image href={photo.bg} x="0" y="0" width={w} height={h} />}
      {!photo.overlayOnTop && overlay}
      <svg x={d.x} y={d.y} width={d.w} height={d.h} viewBox="0 0 1200 1600">
        <g dangerouslySetInnerHTML={{ __html: design }} />
      </svg>
      {photo.overlayOnTop && overlay}
    </svg>
  );
}

// Fallback before the first Printful sync: a simple drawn garment.
const TEE = 'M400 96 C432 150 568 150 600 96 L772 132 Q800 140 818 160 L948 330 L852 428 L754 352 L758 1030 Q500 1052 242 1030 L246 352 L148 428 L52 330 L182 160 Q200 140 228 132 Z';
const HOODIE = 'M382 150 L236 196 Q168 222 142 330 L58 880 Q104 904 166 908 L262 520 L262 1004 L738 1004 L738 520 L834 908 Q896 904 942 880 L858 330 Q832 222 764 196 L618 150 Z';
const AREA = { tee: { x: 330, y: 188, w: 340, h: 453 }, hoodie: { x: 362, y: 318, w: 276, h: 368 } };

function DrawnPreview({ garment, hex, light, design, label, className }: { garment: GarmentKey; hex: string; light: boolean; design: string; label: string; className?: string }) {
  const a = AREA[garment];
  return (
    <svg viewBox="0 0 1000 1100" role="img" aria-label={label} className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="1000" height="1100" fill="#fff" />
      <path d={garment === 'tee' ? TEE : HOODIE} fill={hex} stroke={light ? '#D8D2DE' : 'rgba(0,0,0,.25)'} strokeWidth="3" strokeLinejoin="round" />
      <svg x={a.x} y={a.y} width={a.w} height={a.h} viewBox="0 0 1200 1600">
        <g dangerouslySetInnerHTML={{ __html: design }} />
      </svg>
    </svg>
  );
}
