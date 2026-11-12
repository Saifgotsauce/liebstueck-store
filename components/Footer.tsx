'use client';

import { FRIEND, REFERRAL, REWARD } from '@/lib/referral';
import Link from 'next/link';
import { brand } from '@/lib/config';
import { vibesFor } from '@/lib/designs';
import { useLocale } from '@/lib/i18n';
import { ROUTES, shopPath } from '@/lib/locale';
import { Logo } from './Logo';
import { PaymentLogos } from './Trust';

const HELP = {
  en: [
    { href: ROUTES.en.about, label: 'Our story' },
    { href: ROUTES.en.faq, label: 'Questions & answers' },
    { href: REFERRAL.path, label: `Give ${FRIEND}, get ${REWARD}` },
    { href: ROUTES.en.shipping, label: 'Shipping' },
    { href: ROUTES.en.returns, label: 'Our promise: swaps & replacements' },
    { href: ROUTES.en.privacy, label: 'Privacy policy' },
    { href: ROUTES.en.terms, label: 'Terms of service' },
    { href: ROUTES.en.privacyChoices, label: 'Your privacy choices' },
  ],
  de: [
    { href: ROUTES.de.faq, label: 'Häufige Fragen' },
    { href: ROUTES.de.shipping, label: 'Versand & Zahlung' },
    { href: ROUTES.de.returns, label: 'Widerrufsbelehrung' },
    { href: ROUTES.de.terms, label: 'AGB' },
    { href: ROUTES.de.privacy, label: 'Datenschutz' },
    { href: ROUTES.de.imprint, label: 'Impressum' },
    { href: ROUTES.de.privacyChoices, label: 'Cookie-Einstellungen' },
  ],
};

export default function Footer() {
  const { locale, t, routes } = useLocale();
  return (
    <footer className="mt-24 bg-violet text-white">
      <div className="wrap grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo className="text-white" />
          <p className="mt-4 max-w-sm text-white/80">{t.footer.about}</p>
          <p className="mt-4 text-white/80">
            {t.footer.questions} <a href={`mailto:${brand.email}`} className="font-bold text-white">{brand.email}</a>
          </p>
          {locale === 'en' && (
            <>
              <p className="mt-2 text-white/80">A real person answers every message, usually within a day.</p>
              {brand.messengerUrl && (
                <p className="mt-2">
                  <a href={brand.messengerUrl} className="font-bold text-white" target="_blank" rel="noopener noreferrer">
                    Message us on Facebook
                  </a>
                </p>
              )}
              <PaymentLogos className="mt-5" />
            </>
          )}
          {locale === 'de' && (
            // Electronic withdrawal function (§ 356a BGB): always visible, set apart from the legal links
            <Link href={ROUTES.de.withdraw} className="btn mt-6 border-2 border-white bg-transparent text-white no-underline hover:bg-white hover:text-violet">
              Vertrag widerrufen
            </Link>
          )}
        </div>
        <div>
          <h2 className="font-sans text-base font-bold tracking-normal text-white">{t.footer.shop}</h2>
          <ul className="mt-1 text-white/80">
            <li><Link href={routes.shop} prefetch={false} className="flex min-h-12 items-center no-underline hover:text-white">{t.common.allShirts}</Link></li>
            {vibesFor(locale).map((v) => (
              <li key={v.key}>
                <Link href={shopPath(locale, v.key)} prefetch={false} className="flex min-h-12 items-center no-underline hover:text-white">{v.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-sans text-base font-bold tracking-normal text-white">{t.footer.help}</h2>
          <ul className="mt-1 text-white/80">
            {HELP[locale].map((l) => (
              <li key={l.href}>
                <Link href={l.href} prefetch={false} className="flex min-h-12 items-center no-underline hover:text-white">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/20">
        <p className="wrap flex flex-wrap justify-between gap-x-6 gap-y-2 py-5 text-sm text-white/70">
          <span>{t.footer.bottom(new Date().getFullYear())}</span>
          <Link href={locale === 'de' ? ROUTES.en.home : ROUTES.de.home} prefetch={false} className="-my-3 inline-flex min-h-12 items-center text-white/80 hover:text-white" hrefLang={locale === 'de' ? 'en-US' : 'de-DE'}>
            {locale === 'de' ? 'US store (English)' : 'Deutscher Shop'}
          </Link>
        </p>
      </div>
    </footer>
  );
}
