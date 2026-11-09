import VibePage, { vibeMetadata, vibeParams } from '@/components/pages/VibePage';

type Params = { vibe: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return vibeParams('en');
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  return vibeMetadata((await params).vibe, 'en');
}

export default async function Page({ params }: { params: Promise<Params> }) {
  return <VibePage vibe={(await params).vibe} locale="en" />;
}
