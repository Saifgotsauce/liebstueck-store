'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLocale } from '@/lib/i18n';
import { ROUTES, type Locale } from '@/lib/locale';
import { MESSAGES } from '@/lib/messages';

// Which store fits a visitor's country. Only these two are suggested – everyone else stays put.
const STORE_FOR: Record<string, Locale> = { US: 'en', DE: 'de' };
const DISMISS = 'seasoned-geo-dismissed';

/** "Du bist in Deutschland? Zum deutschen Shop" on the US site, and the reverse. Never redirects. */
export default function GeoBanner() {
  const { locale } = useLocale();
  const [target, setTarget] = useState<Locale | null>(null);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISS)) return;
    } catch {
      /* ignore */
    }
    let live = true;
    fetch('/api/geo')
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { country?: string } | null) => {
        const want = j?.country ? STORE_FOR[j.country] : undefined;
        if (live && want && want !== locale) setTarget(want);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [locale]);

  if (!target) return null;
  const m = MESSAGES[target].geo;
  const close = () => {
    try {
      sessionStorage.setItem(DISMISS, '1');
    } catch {
      /* ignore */
    }
    setTarget(null);
  };
  return (
    <div className="bg-sun text-ink" lang={target} role="region" aria-label={m.link}>
      <div className="wrap flex items-center justify-between gap-3 py-2.5">
        <p className="text-[0.98rem]">
          {m.text}{' '}
          <Link href={ROUTES[target].home} className="font-bold" hrefLang={target === 'de' ? 'de-DE' : 'en-US'} onClick={close}>
            {m.link} →
          </Link>
        </p>
        <button type="button" onClick={close} className="h-10 w-10 shrink-0 rounded-full text-xl hover:bg-white/50" aria-label={m.close}>
          ×
        </button>
      </div>
    </div>
  );
}
