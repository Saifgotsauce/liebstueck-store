// Garment mockup + the real design markup. Pure component: works on server and client.
import { getTemplate } from '@/lib/design/templates';
import { designRect } from '@/lib/design/svg';
import { PALETTES, type FieldValues, type InkTheme } from '@/lib/design/types';
import { printfileSize } from '@/lib/catalog';
import { garmentPhoto, type MockupColor } from '@/lib/mockups';

type Props = {
  garment: 'tee' | 'hoodie';
  /** Colour key from the catalog – used to find the real Printful photo of this garment */
  colorKey?: string;
  colorHex: string;
  ink: InkTheme;
  templateId: string;
  values: FieldValues;
  label: string;
  className?: string;
  /** Close-up of the chest print instead of the whole garment */
  zoom?: boolean;
};

const TEE =
  'M400 96 C432 150 568 150 600 96 L772 132 Q800 140 818 160 L948 330 L852 428 L754 352 L758 1030 Q500 1052 242 1030 L246 352 L148 428 L52 330 L182 160 Q200 140 228 132 Z';
const HOODIE =
  'M382 150 L236 196 Q168 222 142 330 L58 880 Q104 904 166 908 L262 520 L262 1004 L738 1004 L738 520 L834 908 Q896 904 942 880 L858 330 Q832 222 764 196 L618 150 Z';

// Where the 12″ × 16″ print area sits on each mockup (mockup units)
const AREA = {
  tee: { x: 330, y: 188, w: 340, h: 453 },
  hoodie: { x: 362, y: 318, w: 276, h: 368 },
};

const ZOOM = { tee: '190 100 620 600', hoodie: '190 200 620 600' };

export default function ShirtPreview({ garment, colorKey, colorHex, ink, templateId, values, label, className, zoom }: Props) {
  const t = getTemplate(templateId);
  const design = t.render(values, PALETTES[ink]);
  const photo = colorKey ? garmentPhoto(garment, colorKey) : null;
  if (photo) return <PhotoPreview photo={photo} garment={garment} design={design} label={label} className={className} zoom={zoom} />;
  const light = ink === 'dark'; // light garment
  const area = AREA[garment];
  const outline = light ? '#C9D1E3' : 'rgba(0,0,0,0.25)';
  const gid = `shade-${garment}`;

  return (
    <svg viewBox={zoom ? ZOOM[garment] : '0 0 1000 1100'} role="img" aria-label={label} className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gid} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.14" />
          <stop offset="0.22" stopColor="#000" stopOpacity="0" />
          <stop offset="0.78" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.14" />
        </linearGradient>
      </defs>

      {garment === 'hoodie' && <path d="M356 196 C326 52 674 52 644 196 Z" fill={colorHex} stroke={outline} strokeWidth="3" />}
      {garment === 'hoodie' && <path d="M356 196 C326 52 674 52 644 196 Z" fill="#000" fillOpacity="0.12" />}

      <path d={garment === 'tee' ? TEE : HOODIE} fill={colorHex} stroke={outline} strokeWidth="3" strokeLinejoin="round" />
      <path d={garment === 'tee' ? TEE : HOODIE} fill={`url(#${gid})`} />

      {garment === 'tee' ? (
        <g>
          {/* inside of the back collar */}
          <path d="M400 96 Q500 74 600 96 C568 150 432 150 400 96 Z" fill={colorHex} stroke={outline} strokeWidth="3" />
          <path d="M400 96 Q500 74 600 96 C568 150 432 150 400 96 Z" fill="#000" fillOpacity="0.28" />
          <path d="M400 96 C432 150 568 150 600 96" fill="none" stroke="#000" strokeOpacity="0.16" strokeWidth="12" />
          <path d="M246 352 Q236 240 228 134 M754 352 Q764 240 772 134" fill="none" stroke="#000" strokeOpacity="0.1" strokeWidth="3" />
          <path d="M148 428 L52 330 M852 428 L948 330" stroke="#000" strokeOpacity="0.1" strokeWidth="10" />
        </g>
      ) : (
        <g>
          <path d="M382 150 C404 262 452 312 500 318 C548 312 596 262 618 150 C584 182 544 196 500 196 C456 196 416 182 382 150 Z" fill="#000" fillOpacity="0.28" />
          <path d="M382 150 C404 262 452 312 500 318 C548 312 596 262 618 150" fill="none" stroke="#000" strokeOpacity="0.18" strokeWidth="8" />
          <path d="M466 300 L456 470 M534 300 L544 470" stroke={light ? '#C4CAD6' : '#EDEDED'} strokeWidth="7" strokeLinecap="round" />
          <path d="M318 742 L682 742 Q700 840 720 958 L280 958 Q300 840 318 742 Z" fill="#000" fillOpacity="0.05" stroke="#000" strokeOpacity="0.14" strokeWidth="4" />
          <rect x="262" y="962" width="476" height="42" fill="#000" fillOpacity="0.1" />
          <path d="M70 862 L160 886 M930 862 L840 886" stroke="#000" strokeOpacity="0.12" strokeWidth="18" />
        </g>
      )}

      <svg x={area.x} y={area.y} width={area.w} height={area.h} viewBox="0 0 1200 1600">
        <g dangerouslySetInnerHTML={{ __html: design }} />
      </svg>
    </svg>
  );
}

/** The design on Printful's real garment photo: background → design → shadow/fold overlay. */
function PhotoPreview({
  photo,
  garment,
  design,
  label,
  className,
  zoom,
}: {
  photo: MockupColor;
  garment: 'tee' | 'hoodie';
  design: string;
  label: string;
  className?: string;
  zoom?: boolean;
}) {
  const { area, w, h } = photo;
  // Same placement as the print file: the design's spot inside Printful's print area
  const pf = printfileSize(garment);
  const r = designRect(pf.width, pf.height, pf.dpi);
  const k = area.width / pf.width;
  const d = { x: area.left + r.x * k, y: area.top + r.y * k, w: r.w * k, h: r.h * k };

  let viewBox = `0 0 ${w} ${h}`;
  if (zoom) {
    const size = Math.min(w, h, d.w * 1.7);
    const vx = Math.max(0, Math.min(w - size, d.x + d.w / 2 - size / 2));
    const vy = Math.max(0, Math.min(h - size, d.y - size * 0.12));
    viewBox = `${vx} ${vy} ${size} ${size}`;
  }
  const overlay = photo.overlay ? <image href={photo.overlay} x="0" y="0" width={w} height={h} /> : null;

  return (
    <svg viewBox={viewBox} role="img" aria-label={label} className={className} xmlns="http://www.w3.org/2000/svg">
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
