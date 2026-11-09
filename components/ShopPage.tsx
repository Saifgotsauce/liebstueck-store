import Link from 'next/link';
import Coupons from './Coupons';
import { ProductGrid } from './ProductCard';
import { vibesFor, type Design } from '@/lib/designs';
import { ROUTES, shopPath, type Locale } from '@/lib/locale';
import { MESSAGES } from '@/lib/messages';

/** Shared layout for "all shirts", each vibe and the personalized collection. */
export default function ShopPage({ title, intro, designs, current, locale = 'en' }: { title: string; intro: string; designs: Design[]; current: string; locale?: Locale }) {
  const t = MESSAGES[locale];
  const tabs = [
    { key: 'all', name: t.common.allShirts, href: ROUTES[locale].shop },
    ...vibesFor(locale).map((v) => ({ key: v.key, name: v.name, href: shopPath(locale, v.key) })),
    { key: 'personalized', name: t.common.personalizeTab, href: shopPath(locale, locale === 'de' ? 'mit-namen' : 'personalized') },
  ];
  return (
    <>
      <section className="bg-lilac">
        <div className="wrap py-10 sm:py-12">
          <h1 className="text-[2.6rem] sm:text-[3.4rem]">{title}</h1>
          <p className="mt-3 max-w-2xl text-[1.15rem]">{intro}</p>
        </div>
        <nav aria-label={t.common.collections} className="wrap -mb-px flex gap-2 overflow-x-auto pb-4">
          {tabs.map((tab) => (
            <Link
              key={tab.key}
              href={tab.href}
              aria-current={tab.key === current ? 'page' : undefined}
              className={`shrink-0 rounded-full px-4 py-2 font-bold no-underline ${tab.key === current ? 'bg-violet text-white' : 'bg-white text-violet hover:bg-lilac-line'}`}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </section>
      <div className="wrap mt-8">
        <p className="mb-5 text-ink-soft">{t.common.shirts(designs.length)}</p>
        <ProductGrid designs={designs} eagerCount={8} />
        <div className="mt-16">
          <Coupons bg="white" locale={locale} />
          <p className="mt-3 text-[0.95rem] text-ink-soft">{t.coupons.note}</p>
        </div>
      </div>
    </>
  );
}
