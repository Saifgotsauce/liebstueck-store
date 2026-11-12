import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductView from '@/components/ProductView';
import { ProductGrid } from '@/components/ProductCard';
import { Stars } from '@/components/Icons';
import { unitPriceCents } from '@/lib/catalog';
import { brand, stores, siteUrl } from '@/lib/config';
import { designLocale, designsInVibe, getDesign, getVibe } from '@/lib/designs';
import { productPath, type Locale } from '@/lib/locale';
import { MESSAGES } from '@/lib/messages';
import { ratingFor, reviewsFor } from '@/lib/reviews';

/** A design only exists in its own store: German designs 404 on the US site and vice versa. */
function find(slug: string, locale: Locale) {
  const d = getDesign(slug);
  return d && designLocale(d) === locale && !d.hidden ? d : undefined;
}

export function productMetadata(slug: string, locale: Locale): Metadata {
  const d = find(slug, locale);
  if (!d) return {};
  const v = getVibe(d.vibe)!;
  return {
    title: `${d.title} – ${v.searchTerm}`,
    description: MESSAGES[locale].meta.productDesc(d.blurb),
    alternates: { canonical: productPath(locale, d.slug) },
    // made by `npm run render:mockups`
    openGraph: { title: d.title, description: d.blurb, locale: locale === 'de' ? 'de_DE' : 'en_US', images: [{ url: `/og/${d.slug}.jpg`, width: 1200, height: 630 }] },
  };
}

const COPY = {
  en: {
    reviewsTitle: 'What customers say',
    outOf5: (a: string) => `${a} out of 5`,
    count: (n: number) => `${n} review${n === 1 ? '' : 's'}`,
    stars: (n: number) => `${n} out of 5 stars`,
    verified: null as string | null,
  },
  de: {
    reviewsTitle: 'Das sagen unsere Kundinnen',
    outOf5: (a: string) => `${a} von 5`,
    count: (n: number) => `${n} ${n === 1 ? 'Bewertung' : 'Bewertungen'}`,
    stars: (n: number) => `${n} von 5 Sternen`,
    // § 5b Abs. 3 UWG: say how we make sure reviews are real
    verified: 'Wir veröffentlichen nur Bewertungen von Kundinnen und Kunden, die das Shirt bei uns gekauft haben. Wir prüfen das anhand der Bestellnummer.',
  },
};

export default function ProductPage({ slug, locale }: { slug: string; locale: Locale }) {
  const d = find(slug, locale);
  if (!d) notFound();
  const v = getVibe(d.vibe)!;
  const t = MESSAGES[locale];
  const c = COPY[locale];
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
    offers: {
      '@type': 'Offer',
      priceCurrency: stores[locale].currency,
      price: (unitPriceCents('tee', undefined, locale, d.slug) / 100).toFixed(2),
      availability: 'https://schema.org/InStock',
      url: `${siteUrl}${productPath(locale, d.slug)}`,
    },
    // only real reviews (data/reviews.json)
    ...(rating ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: rating.average, reviewCount: rating.count } } : {}),
  };
  return (
    <div className="wrap pt-0 md:pt-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductView slug={slug} rating={rating} />
      {reviews.length > 0 && rating && (
        <section id="reviews" className="mt-16 scroll-mt-24" aria-labelledby="reviews-title">
          <h2 id="reviews-title" className="text-[2rem] sm:text-[2.4rem]">
            {c.reviewsTitle}
          </h2>
          <p className="mt-2 flex items-center gap-2">
            <Stars value={rating.average} className="text-[#E8A317]" />
            <span className="font-bold">{c.outOf5(rating.average.toLocaleString(stores[locale].intl))}</span>
            <span className="text-ink-soft">· {c.count(rating.count)}</span>
          </p>
          {c.verified && <p className="mt-2 text-[0.95rem] text-ink-soft">{c.verified}</p>}
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {reviews.slice(0, 8).map((r) => (
              <li key={`${r.name}-${r.date}`} className="rounded-2xl bg-white p-5 ring-1 ring-lilac-line">
                <Stars value={r.rating} className="text-[#E8A317]" />
                <span className="sr-only">{c.stars(r.rating)}</span>
                <p className="mt-2">{r.text}</p>
                <p className="mt-3 text-[0.95rem] font-bold">
                  {r.name}{' '}
                  <span className="font-medium text-ink-soft">· {new Date(r.date + 'T12:00:00').toLocaleDateString(stores[locale].intl, { month: 'long', year: 'numeric' })}</span>
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
      {more.length > 0 && (
        <section className="mt-20" aria-labelledby="more">
          <h2 id="more" className="text-[2rem] sm:text-[2.4rem]">
            {t.meta.moreFrom(v.name)}
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
