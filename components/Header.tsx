'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { formatPrice, shop } from '@/lib/config';
import { useCart } from '@/lib/cart';
import { holidayDeadline } from '@/lib/dates';
import { VIBES } from '@/lib/designs';
import { Logo } from './Logo';

const SHORT: Record<string, string> = {
  aging: 'Aging',
  grandma: 'Grandma',
  retired: 'Retired',
  birthday: 'Birthdays',
  'for-him': 'For Him',
  holiday: 'Holiday',
};

export default function Header() {
  const { totals, ready } = useCart();
  const [menu, setMenu] = useState(false);
  const [deadline, setDeadline] = useState<ReturnType<typeof holidayDeadline>>(null);
  const pathname = usePathname();
  useEffect(() => setDeadline(holidayDeadline()), []);
  useEffect(() => setMenu(false), [pathname]);

  return (
    <header className="relative z-40 bg-white">
      <p className="bg-violet px-4 py-2 text-center text-[0.92rem] font-medium text-white">
        {deadline ? (
          <>
            Order by <strong>{deadline.label}</strong> for {deadline.name} delivery. Free shipping over {formatPrice(shop.freeShippingFromCents)}.
          </>
        ) : (
          <>
            Free US shipping over {formatPrice(shop.freeShippingFromCents)}. Buy 2, save 10%.
          </>
        )}
      </p>
      <div className="wrap flex h-[4.4rem] items-center justify-between gap-4">
        <button
          type="button"
          className="-ml-2 flex h-12 w-12 items-center justify-center rounded-full lg:hidden"
          aria-expanded={menu}
          aria-controls="mobile-menu"
          onClick={() => setMenu((m) => !m)}
        >
          <span className="sr-only">{menu ? 'Close menu' : 'Open menu'}</span>
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            {menu ? <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /> : <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />}
          </svg>
        </button>
        <Link href="/" className="text-violet no-underline" aria-label="Seasoned home">
          <Logo />
        </Link>
        <nav aria-label="Shop by vibe" className="hidden items-center gap-6 lg:flex">
          <Link href="/shop/" className="font-bold no-underline hover:text-violet">
            All shirts
          </Link>
          {VIBES.map((v) => (
            <Link key={v.key} href={`/shop/${v.key}/`} className="font-medium no-underline hover:text-violet" aria-current={pathname === `/shop/${v.key}/` ? 'page' : undefined}>
              {SHORT[v.key]}
            </Link>
          ))}
        </nav>
        <Link href="/cart/" className="relative -mr-2 flex h-12 w-12 items-center justify-center rounded-full no-underline hover:bg-lilac" aria-label={`Cart, ${ready ? totals.count : 0} items`}>
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M5 8h14l-1.2 11.1a1 1 0 0 1-1 .9H7.2a1 1 0 0 1-1-.9L5 8Z" strokeLinejoin="round" />
            <path d="M9 10V6.5a3 3 0 0 1 6 0V10" strokeLinecap="round" />
          </svg>
          {ready && totals.count > 0 && (
            <span className="absolute right-0.5 top-0.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-red px-1.5 text-[0.8rem] font-bold text-white">{totals.count}</span>
          )}
        </Link>
      </div>
      {menu && (
        <nav id="mobile-menu" aria-label="Shop by vibe" className="absolute inset-x-0 top-full border-t border-lilac-line bg-white pb-6 shadow-[0_18px_30px_-18px_rgba(30,22,38,.35)] lg:hidden">
          <ul className="wrap divide-y divide-lilac-line">
            <li>
              <Link href="/shop/" className="flex min-h-14 items-center text-lg font-bold no-underline">
                All shirts
              </Link>
            </li>
            {VIBES.map((v) => (
              <li key={v.key}>
                <Link href={`/shop/${v.key}/`} className="flex min-h-14 flex-col justify-center py-2 no-underline">
                  <span className="text-lg font-bold">{v.name}</span>
                  <span className="text-[0.95rem] text-ink-soft">{v.blurb}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <div className="h-px bg-lilac-line" />
    </header>
  );
}
