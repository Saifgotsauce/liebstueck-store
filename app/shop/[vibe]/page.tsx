import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ShopPage from '@/components/ShopPage';
import { DESIGNS, VIBES, designsInVibe, getVibe, isPersonalized } from '@/lib/designs';

type Params = { vibe: string };

export function generateStaticParams(): Params[] {
  return [...VIBES.map((v) => ({ vibe: v.key })), { vibe: 'personalized' }];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { vibe } = await params;
  if (vibe === 'personalized') return { title: 'Personalized shirts', description: 'Funny shirts with her name, his name, the grandkids or the year – printed exactly as you type it.' };
  const v = getVibe(vibe);
  if (!v) return {};
  return { title: `${v.name} – ${v.searchTerm}`, description: `${v.blurb} Shop ${v.searchTerm}, printed to order and shipped across the US.` };
}

export default async function VibePage({ params }: { params: Promise<Params> }) {
  const { vibe } = await params;
  if (vibe === 'personalized') {
    return (
      <ShopPage
        title="Personalize it"
        intro="Her name, his name, every grandkid or the year that matters. Type it in, watch the shirt change, and we print exactly that."
        designs={DESIGNS.filter(isPersonalized)}
        current="personalized"
      />
    );
  }
  const v = getVibe(vibe);
  if (!v) notFound();
  return <ShopPage title={v.name} intro={v.blurb} designs={designsInVibe(v.key)} current={v.key} />;
}
