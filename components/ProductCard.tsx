import Link from 'next/link';
import { defaultColor, GARMENTS, unitPriceCents } from '@/lib/catalog';
import { formatPrice } from '@/lib/config';
import { isPersonalized, type Design } from '@/lib/designs';
import { defaultValues, getTemplate } from '@/lib/design/templates';
import ShirtPreview from './ShirtPreview';

export default function ProductCard({ design, eager = false }: { design: Design; eager?: boolean }) {
  const color = defaultColor(design, 'tee');
  const colorLabel = GARMENTS.tee.colors.find((c) => c.key === color)?.label ?? '';
  return (
    <li className="group">
      <Link href={`/p/${design.slug}/`} className="block no-underline" prefetch={eager ? undefined : false}>
        <div className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-lilac-line transition group-hover:ring-2 group-hover:ring-violet">
          <ShirtPreview design={design.slug} garment="tee" colorKey={color} values={defaultValues(getTemplate(design.slug))} label={`${design.title} – ${colorLabel} t-shirt`} className="block aspect-square w-full" view="tile" />
          {isPersonalized(design) && (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-sun px-2.5 py-1 text-[0.8rem] font-bold text-ink">Personalize it</span>
          )}
        </div>
        <h3 className="mt-3 font-sans text-[1.02rem] font-bold leading-snug tracking-normal text-ink group-hover:text-violet">{design.title}</h3>
        <p className="mt-1 text-[0.98rem] text-ink-soft">
          From <span className="font-bold text-ink">{formatPrice(unitPriceCents('tee'))}</span>
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
