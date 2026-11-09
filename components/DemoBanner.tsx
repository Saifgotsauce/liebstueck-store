import { isDemo } from '@/lib/config';

/** Only shown in the clickable preview build (NEXT_PUBLIC_DEMO=1). */
export default function DemoBanner() {
  if (!isDemo) return null;
  return <div className="bg-sun px-4 py-2 text-center text-sm font-bold text-ink">Preview – checkout is switched off.</div>;
}
