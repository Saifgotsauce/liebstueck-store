import { isPlaceholder, legal } from '@/lib/config';

export default function Policy({ title, intro, children, updated = true }: { title: string; intro?: string; children: React.ReactNode; updated?: boolean }) {
  return (
    <div className="wrap pt-10 sm:pt-14">
      <h1 className="text-[2.6rem] sm:text-[3.2rem]">{title}</h1>
      {intro && <p className="mt-3 max-w-2xl text-[1.15rem]">{intro}</p>}
      <div className="prose-s mt-8">{children}</div>
      {updated && <p className="mt-10 text-[0.95rem] text-ink-soft">Last updated {legal.lastUpdated}.</p>}
    </div>
  );
}

/** Business name for policy text – falls back to the brand while the legal name is a placeholder. */
export function businessName(fallback: string) {
  return isPlaceholder(legal.businessName) ? fallback : legal.businessName;
}
