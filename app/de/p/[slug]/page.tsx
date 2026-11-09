import ProductPage, { productMetadata } from '@/components/pages/ProductPage';
import { designsFor } from '@/lib/designs';

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return designsFor('de').map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  return productMetadata((await params).slug, 'de');
}

export default async function Page({ params }: { params: Promise<Params> }) {
  return <ProductPage slug={(await params).slug} locale="de" />;
}
