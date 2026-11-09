'use client';

// Which store the visitor is in. Set once per layout (US root vs /de/), read by every
// client component through useLocale().
import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { formatPrice, stores } from './config';
import type { Locale } from './locale';
import { ROUTES } from './locale';
import { MESSAGES } from './messages';

const Ctx = createContext<Locale>('en');

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  // keep <html lang> right when moving between the US and German stores
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return <Ctx.Provider value={locale}>{children}</Ctx.Provider>;
}

export function useLocale() {
  const locale = useContext(Ctx);
  return {
    locale,
    t: MESSAGES[locale],
    routes: ROUTES[locale],
    store: stores[locale],
    price: (cents: number) => formatPrice(cents, locale),
  };
}
