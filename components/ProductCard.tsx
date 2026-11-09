import Link from 'next/link';
import { colorLabel, defaultColor, GARMENTS, unitPriceCents } from '@/lib/catalog';
import { formatPrice } from '@/lib/config';
import { designLocale, isPersonalized, type Design } from '@/lib/designs';
import { defaultValues, getTemplate } from '@/lib/design/templates';
import { productPath } from '@/lib/locale';
import { MESSAGES } from '@/lib/messages';
import { modelPhotos } from '@/lib/model-photos';
import ShirtPreview from './ShirtPreview';

export default function ProductCard({ design, eager = false }: { design: Design; eager?: boolean }) {
  const locale = designLocale(design);
  const t = MESSAGES[locale];
  const color = defaultColor(design, 'tee', locale);
  const c = GARMENTS.tee.colors.find((x) => x.key === color);
  const photo = modelPhotos(design.slug)[0];
  return (
    <li className="group">
      <Link href={productPath(locale, design.slug)} className="block no-underline" prefetch={eager ? undefined : false}>
        <div className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-lilac-line transition group-hover:ring-2 group-hover:ring-violet">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo.src} alt={t.card.label(design.title, c ? colorLabel(c, locale) : '')} className="block aspect-square w-full object-cover" loading={eager ? 'eager' : 'lazy'} />
          ) : (
            <ShirtPreview design={design.slug} garment="tee" colorKey={color} values={defaultValues(getTemplate(design.slug))} label={t.card.label(design.title, c ? colorLabel(c, locale) : '')} className="block aspect-square w-full" view="tile" />
          )}
          {isPersonalized(design) && (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-sun px-2.5 py-1 text-[0.8rem] font-bold text-ink">{t.card.badge}</span>
          )}
        </div>
        <h3 className="mt-3 font-sans text-[1.02rem] font-bold leading-snug tracking-normal text-ink group-hover:text-violet">{design.title}</h3>
        <p className="mt-1 text-[0.98rem] text-ink-soft">
          {t.common.from} <span className="font-bold text-ink">{formatPrice(unitPriceCents('tee', undefined, locale), locale)}</span>
        </p>
      </Link>
    </li>
  );
}

export function ProductGrid({ designs, eagerCount = 4 }: { designs: Design[]; eagerCount?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-x-3.5 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
      {designs.map((d, i) => (
        <ProductCard key={d.slug} design={d} eager={i < eagerCount} />
      ))}
    </ul>
  );
}
