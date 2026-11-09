'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_LOCALE, formatPrice, isLocale, translate, type Locale, type MsgKey } from './index';

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: MsgKey, p?: Record<string, string | number>) => string;
  price: (cents: number) => string;
};

const KEY = 'liebstueck-lang';
const LocaleCtx = createContext<Ctx | null>(null);

/** Saved choice first; otherwise German for German browsers, English for everyone else. */
function detect(): Locale {
  try {
    const saved = localStorage.getItem(KEY);
    if (isLocale(saved)) return saved;
  } catch {
    /* ignore */
  }
  const langs = typeof navigator !== 'undefined' ? navigator.languages ?? [navigator.language] : [];
  return langs.some((l) => l?.toLowerCase().startsWith('de')) ? 'de' : 'en';
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  // Pages are pre-rendered in German; the visitor's language is applied right after load.
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    setLocaleState(detect());
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      locale,
      setLocale,
      t: (key, p) => translate(locale, key, p),
      price: (cents) => formatPrice(cents, locale),
    }),
    [locale, setLocale],
  );

  return <LocaleCtx.Provider value={value}>{children}</LocaleCtx.Provider>;
}

export function useLocale() {
  const c = useContext(LocaleCtx);
  if (!c) throw new Error('useLocale must be used inside LocaleProvider');
  return c;
}

/** DE | EN switch for the header. */
export function LanguageSwitch({ className = '' }: { className?: string }) {
  const { locale, setLocale, t } = useLocale();
  return (
    <div role="group" aria-label={t('lang.label')} className={`flex rounded-full border-2 border-linie p-0.5 ${className}`}>
      {(['de', 'en'] as const).map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={locale === l}
          aria-label={l === 'de' ? 'Deutsch' : 'English'}
          onClick={() => setLocale(l)}
          className={`min-h-[2.25rem] min-w-[2.6rem] rounded-full px-2 text-sm font-bold ${locale === l ? 'bg-blau text-white' : 'text-ink hover:text-blau'}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
