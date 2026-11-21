import ProductPage, { productMetadata } from '@/components/pages/ProductPage';
import { designsFor } from '@/lib/designs';

type Params = { slug: string };

// Not `dynamicParams = false`: with it, Next 15 answers 404 when a page is rebuilt after a
// new review (NoFallbackError). Unknown slugs still 404 through notFound() in ProductPage.
export const dynamicParams = true;

export function generateStaticParams(): Params[] {
  return designsFor('de').map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  return productMetadata((await params).slug, 'de');
}

export default async function Page({ params }: { params: Promise<Params> }) {
  return <ProductPage slug={(await params).slug} locale="de" />;
}
