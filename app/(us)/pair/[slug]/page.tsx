import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PairView from '@/components/pages/PairView';
import { getPair, PAIRS } from '@/lib/pairs';

// Ad landing pages with exactly the shirts the ad shows (lib/pairs.ts).
type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return PAIRS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const p = getPair((await params).slug);
  if (!p) return {};
  // Only for ad traffic: the product pages are the ones search engines should list
  return { title: p.headline, description: p.intro, robots: { index: false, follow: true }, openGraph: { images: [{ url: `/og/${p.designs[1]}.jpg`, width: 1200, height: 630 }] } };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const p = getPair((await params).slug);
  if (!p) notFound();
  return <PairView pair={p} />;
}
