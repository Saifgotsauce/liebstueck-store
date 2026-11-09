import Link from 'next/link';
import Coupons from './Coupons';
import { ProductGrid } from './ProductCard';
import { VIBES, type Design } from '@/lib/designs';

/** Shared layout for "all shirts", each vibe and the personalized collection. */
export default function ShopPage({ title, intro, designs, current }: { title: string; intro: string; designs: Design[]; current: string }) {
  const tabs = [{ key: 'all', name: 'All shirts', href: '/shop/' }, ...VIBES.map((v) => ({ key: v.key, name: v.name, href: `/shop/${v.key}/` })), { key: 'personalized', name: 'Personalize it', href: '/shop/personalized/' }];
  return (
    <>
      <section className="bg-lilac">
        <div className="wrap py-10 sm:py-12">
          <h1 className="text-[2.6rem] sm:text-[3.4rem]">{title}</h1>
          <p className="mt-3 max-w-2xl text-[1.15rem]">{intro}</p>
        </div>
        <nav aria-label="Collections" className="wrap -mb-px flex gap-2 overflow-x-auto pb-4">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={t.href}
              aria-current={t.key === current ? 'page' : undefined}
              className={`shrink-0 rounded-full px-4 py-2 font-bold no-underline ${t.key === current ? 'bg-violet text-white' : 'bg-white text-violet hover:bg-lilac-line'}`}
            >
              {t.name}
            </Link>
          ))}
        </nav>
      </section>
      <div className="wrap mt-8">
        <p className="mb-5 text-ink-soft">{designs.length} shirts</p>
        <ProductGrid designs={designs} eagerCount={8} />
        <div className="mt-16">
          <Coupons bg="white" />
          <p className="mt-3 text-[0.95rem] text-ink-soft">Mix and match any shirts. Savings apply automatically in your cart.</p>
        </div>
      </div>
    </>
  );
}
