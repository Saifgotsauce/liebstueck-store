import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Personalizer from '@/components/Personalizer';
import { PRODUCTS, getProduct } from '@/lib/catalog';

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  return p ? { title: p.name.de, description: p.short.de } : {};
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  return (
    <div className="mx-auto max-w-6xl px-4 pt-5 md:px-6 md:pt-10">
      <Personalizer product={product} />
    </div>
  );
}
