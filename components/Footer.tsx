'use client';

import Link from 'next/link';
import { brand, shop } from '@/lib/config';
import { PRODUCTS } from '@/lib/catalog';
import { useConsent } from '@/lib/consent';
import { useLocale } from '@/lib/i18n/context';
import { loc } from '@/lib/i18n';
import { Logo } from './Header';

export default function Footer() {
  const { openSettings } = useConsent();
  const { t, locale, price } = useLocale();
  return (
    <footer className="mt-24 bg-ink text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-6">
        <div>
          <Logo className="text-white" />
          <p className="mt-3 max-w-xs text-white/75">{loc(brand.tagline, locale)}</p>
          {/* Withdrawal button – required for EU online shops since 19 June 2026 */}
          <Link href="/widerruf/" className="btn mt-6 bg-white text-ink hover:bg-blau-hell">
            {t('footer.withdraw')}
          </Link>
        </div>
        <div>
          <h2 className="font-sans text-base font-bold">{t('footer.shirts')}</h2>
          <ul className="mt-3 space-y-2 text-white/80">
            {PRODUCTS.map((p) => (
              <li key={p.slug}>
                <Link href={`/produkt/${p.slug}/`} className="hover:text-white">
                  {loc(p.occasion, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-sans text-base font-bold">{t('footer.help')}</h2>
          <ul className="mt-3 space-y-2 text-white/80">
            <li><Link href="/versand-zahlung/" className="hover:text-white">{t('footer.shipping')}</Link></li>
            <li><Link href="/widerrufsbelehrung/" className="hover:text-white">{t('footer.withdrawalNotice')}</Link></li>
            <li><a href={`mailto:${brand.email}`} className="hover:text-white">{brand.email}</a></li>
          </ul>
        </div>
        <div>
          <h2 className="font-sans text-base font-bold">{t('footer.legal')}</h2>
          <ul className="mt-3 space-y-2 text-white/80">
            <li><Link href="/impressum/" className="hover:text-white">{t('footer.imprint')}</Link></li>
            <li><Link href="/datenschutz/" className="hover:text-white">{t('footer.privacy')}</Link></li>
            <li><Link href="/agb/" className="hover:text-white">{t('footer.terms')}</Link></li>
            <li>
              <button type="button" onClick={openSettings} className="text-left hover:text-white">
                {t('footer.cookies')}
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/15">
        <p className="mx-auto max-w-6xl px-4 py-5 text-sm text-white/65 md:px-6">
          {t('footer.note', { free: price(shop.freeShippingFromCents) })} ©{' '}
          {new Date().getFullYear()} {brand.name}
        </p>
      </div>
    </footer>
  );
}
