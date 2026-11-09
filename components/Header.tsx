'use client';

import Link from 'next/link';
import { brand } from '@/lib/config';
import { useCart } from '@/lib/cart';
import { LanguageSwitch, useLocale } from '@/lib/i18n/context';
import type { MsgKey } from '@/lib/i18n';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-1.5 font-serif text-[1.6rem] leading-none ${className}`}>
      {brand.name}
      <svg viewBox="-0.5 -0.5 1 1" className="h-[0.55em] w-[0.55em] translate-y-[-0.05em] text-rot" aria-hidden="true">
        <path
          d="M0,0.42 C-0.08,0.34 -0.5,0.08 -0.5,-0.18 C-0.5,-0.36 -0.36,-0.46 -0.24,-0.46 C-0.12,-0.46 -0.04,-0.4 0,-0.3 C0.04,-0.4 0.12,-0.46 0.24,-0.46 C0.36,-0.46 0.5,-0.36 0.5,-0.18 C0.5,0.08 0.08,0.34 0,0.42 Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

const NAV: { href: string; label: MsgKey }[] = [
  { href: '/produkt/opa-oma-namen/', label: 'nav.grandparents' },
  { href: '/produkt/familie-weihnachten/', label: 'nav.christmas' },
  { href: '/produkt/jahrgang-geburtstag/', label: 'nav.birthday' },
];

export default function Header() {
  const { count, ready } = useCart();
  const { t } = useLocale();
  return (
    <header className="sticky top-0 z-40 border-b border-linie bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:h-[4.5rem] md:px-6">
        <Link href="/" className="no-underline" aria-label={t('nav.home', { brand: brand.name })}>
          <Logo />
        </Link>
        <nav aria-label={t('nav.main')} className="hidden gap-7 lg:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="font-bold text-ink no-underline hover:text-blau">
              {t(n.label)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
        <LanguageSwitch />
        <Link href="/warenkorb/" className="btn btn-ghost min-h-[2.75rem] px-3 py-2 sm:px-4" aria-label={t('cart.buttonAria', { n: count })}>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H6.2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="9" cy="20" r="1.4" />
            <circle cx="17" cy="20" r="1.4" />
          </svg>
          <span className="hidden sm:inline">{t('cart.button')}</span>
          {ready && count > 0 && <span className="rounded-full bg-gelb px-2 text-sm text-ink">{count}</span>}
        </Link>
        </div>
      </div>
      <nav aria-label={t('nav.occasions')} className="flex gap-2 overflow-x-auto border-t border-linie px-4 py-2 lg:hidden">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className="shrink-0 rounded-full bg-blau-hell px-3 py-1.5 text-[0.95rem] font-bold text-blau no-underline">
            {t(n.label)}
          </Link>
        ))}
      </nav>
    </header>
  );
}
