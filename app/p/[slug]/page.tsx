import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductView from '@/components/ProductView';
import { ProductGrid } from '@/components/ProductCard';
import { unitPriceCents } from '@/lib/catalog';
import { brand, siteUrl } from '@/lib/config';
import { DESIGNS, designsInVibe, getDesign, getVibe } from '@/lib/designs';
import { ratingFor, reviewsFor } from '@/lib/reviews';
import { Stars } from '@/components/Icons';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return DESIGNS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const d = getDesign(slug);
  if (!d) return {};
  const v = getVibe(d.vibe)!;
  return {
    title: `${d.title} – ${v.searchTerm}`,
    description: d.blurb,
    alternates: { canonical: `/p/${d.slug}/` },
    // made by `npm run render:mockups`
    openGraph: { title: d.title, description: d.blurb, images: [{ url: `/og/${d.slug}.jpg`, width: 1200, height: 630 }] },
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const d = getDesign(slug);
  if (!d) notFound();
  const v = getVibe(d.vibe)!;
  const more = designsInVibe(d.vibe).filter((x) => x.slug !== slug).slice(0, 4);
  const rating = ratingFor(slug);
  const reviews = reviewsFor(slug);
  // Product data for search engines
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: d.title,
    description: d.blurb,
    brand: { '@type': 'Brand', name: brand.name },
    category: v.searchTerm,
    offers: { '@type': 'Offer', priceCurrency: 'USD', price: (unitPriceCents('tee') / 100).toFixed(2), availability: 'https://schema.org/InStock', url: `${siteUrl}/p/${d.slug}/` },
    // only real reviews (data/reviews.json)
    ...(rating ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: rating.average, reviewCount: rating.count } } : {}),
  };
  return (
    <div className="wrap pt-6 sm:pt-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductView slug={slug} rating={rating} />
      {reviews.length > 0 && rating && (
        <section id="reviews" className="mt-16 scroll-mt-24" aria-labelledby="reviews-title">
          <h2 id="reviews-title" className="text-[2rem] sm:text-[2.4rem]">
            What customers say
          </h2>
          <p className="mt-2 flex items-center gap-2">
            <Stars value={rating.average} className="text-[#E8A317]" />
            <span className="font-bold">{rating.average.toFixed(1)} out of 5</span>
            <span className="text-ink-soft">
              · {rating.count} review{rating.count === 1 ? '' : 's'}
            </span>
          </p>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {reviews.slice(0, 8).map((r) => (
              <li key={`${r.name}-${r.date}`} className="rounded-2xl bg-white p-5 ring-1 ring-lilac-line">
                <Stars value={r.rating} className="text-[#E8A317]" />
                <span className="sr-only">{r.rating} out of 5 stars</span>
                <p className="mt-2">{r.text}</p>
                <p className="mt-3 text-[0.95rem] font-bold">
                  {r.name} <span className="font-medium text-ink-soft">· {new Date(r.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
      {more.length > 0 && (
        <section className="mt-20" aria-labelledby="more">
          <h2 id="more" className="text-[2rem] sm:text-[2.4rem]">
            More from {v.name}
          </h2>
          <div className="mt-6">
            <ProductGrid designs={more} eagerCount={0} />
          </div>
        </section>
      )}
      {/* room for the sticky add-to-cart bar on phones */}
      <div className="h-20 lg:hidden" aria-hidden="true" />
    </div>
  );
}
