'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useCart } from '@/lib/cart';
import { holidayDeadline } from '@/lib/dates';
import { vibeNav, vibesFor } from '@/lib/designs';
import { useLocale } from '@/lib/i18n';
import { ROUTES, shopPath } from '@/lib/locale';
import { Logo } from './Logo';

export default function Header() {
  const { totals, ready } = useCart();
  const { locale, t, routes, store, price } = useLocale();
  const vibes = vibesFor(locale);
  const [menu, setMenu] = useState(false);
  const [deadline, setDeadline] = useState<ReturnType<typeof holidayDeadline>>(null);
  const pathname = usePathname();
  useEffect(() => setDeadline(holidayDeadline(locale)), [locale]);
  useEffect(() => setMenu(false), [pathname]);

  return (
    <header className="relative z-40 bg-white">
      <p className="bg-violet px-4 py-1.5 text-center text-[0.92rem] font-medium text-white sm:py-2">
        <span className="sm:hidden">{deadline ? t.header.deadlineShort(deadline.label, deadline.name) : t.header.offerShort(price(store.freeShippingFromCents))}</span>
        <span className="hidden sm:inline">
          {deadline ? t.header.deadline(deadline.label, deadline.name, price(store.freeShippingFromCents)) : t.header.offer(price(store.freeShippingFromCents))}
        </span>
      </p>
      <div className="wrap flex h-[3.6rem] items-center justify-between gap-4 sm:h-[4.4rem]">
        <button
          type="button"
          className="-ml-2 flex h-12 w-12 items-center justify-center rounded-full lg:hidden"
          aria-expanded={menu}
          aria-controls="mobile-menu"
          onClick={() => setMenu((m) => !m)}
        >
          <span className="sr-only">{menu ? t.header.closeMenu : t.header.openMenu}</span>
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            {menu ? <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /> : <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />}
          </svg>
        </button>
        <Link href={routes.home} prefetch={false} className="flex min-h-12 items-center text-violet no-underline" aria-label={t.header.home}>
          <Logo />
        </Link>
        <nav aria-label={t.header.nav} className="hidden items-center gap-6 lg:flex">
          <Link href={routes.shop} className="font-bold no-underline hover:text-violet">
            {t.common.allShirts}
          </Link>
          {vibes.map((v) => (
            <Link key={v.key} href={shopPath(locale, v.key)} className="font-medium no-underline hover:text-violet" aria-current={pathname === shopPath(locale, v.key) ? 'page' : undefined}>
              {vibeNav(v)}
            </Link>
          ))}
          {locale === 'en' && (
            <Link href={ROUTES.en.about} className="font-medium no-underline hover:text-violet" aria-current={pathname === ROUTES.en.about ? 'page' : undefined}>
              Our story
            </Link>
          )}
        </nav>
        <Link href={routes.cart} className="relative -mr-2 flex h-12 w-12 items-center justify-center rounded-full no-underline hover:bg-lilac" aria-label={t.header.cart(ready ? totals.count : 0)}>
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
        <nav id="mobile-menu" aria-label={t.header.nav} className="absolute inset-x-0 top-full border-t border-lilac-line bg-white pb-6 shadow-[0_18px_30px_-18px_rgba(30,22,38,.35)] lg:hidden">
          <ul className="wrap divide-y divide-lilac-line">
            <li>
              <Link href={routes.shop} className="flex min-h-14 items-center text-lg font-bold no-underline">
                {t.common.allShirts}
              </Link>
            </li>
            {vibes.map((v) => (
              <li key={v.key}>
                <Link href={shopPath(locale, v.key)} className="flex min-h-14 flex-col justify-center py-2 no-underline">
                  <span className="text-lg font-bold">{v.name}</span>
                  <span className="text-[0.95rem] text-ink-soft">{v.blurb}</span>
                </Link>
              </li>
            ))}
            {locale === 'en' && (
              <li className="flex flex-wrap gap-x-6 gap-y-1 pt-3">
                <Link href={ROUTES.en.about} className="flex min-h-12 items-center font-bold text-violet no-underline">
                  Our story
                </Link>
                <Link href={ROUTES.en.faq} className="flex min-h-12 items-center font-bold text-violet no-underline">
                  Questions & answers
                </Link>
                <Link href={ROUTES.en.returns} className="flex min-h-12 items-center font-bold text-violet no-underline">
                  Our promise
                </Link>
              </li>
            )}
          </ul>
        </nav>
      )}
      <div className="h-px bg-lilac-line" />
    </header>
  );
}
