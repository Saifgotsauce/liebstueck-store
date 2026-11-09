import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductView from '@/components/ProductView';
import { ProductGrid } from '@/components/ProductCard';
import { unitPriceCents } from '@/lib/catalog';
import { brand, siteUrl } from '@/lib/config';
import { DESIGNS, designsInVibe, getDesign, getVibe } from '@/lib/designs';

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
  // Product data for search engines
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: d.title,
    description: d.blurb,
    brand: { '@type': 'Brand', name: brand.name },
    category: v.searchTerm,
    offers: { '@type': 'Offer', priceCurrency: 'USD', price: (unitPriceCents('tee') / 100).toFixed(2), availability: 'https://schema.org/InStock', url: `${siteUrl}/p/${d.slug}/` },
  };
  return (
    <div className="wrap pt-6 sm:pt-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductView slug={slug} />
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
    </div>
  );
}
