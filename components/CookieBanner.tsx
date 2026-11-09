'use client';

import Link from 'next/link';
import { useConsent } from '@/lib/consent';
import { useLocale } from '@/lib/i18n/context';

export default function CookieBanner() {
  const { ready, decided, settingsOpen, save, marketing } = useConsent();
  const { t } = useLocale();
  if (!ready || (decided && !settingsOpen)) return null;

  return (
    <div role="dialog" aria-modal="false" aria-labelledby="cookie-title" className="fixed inset-x-0 bottom-0 z-50 p-3 md:p-5">
      <div className="mx-auto max-w-3xl rounded-2xl border border-linie bg-white p-5 shadow-[0_8px_40px_rgba(22,33,58,0.18)] md:p-6">
        <h2 id="cookie-title" className="text-xl">{t('cookie.title')}</h2>
        <p className="mt-2 text-ink-soft">
          {t('cookie.text')}{' '}
          <Link href="/datenschutz/" className="link">
            {t('cookie.more')}
          </Link>
          .
        </p>
        {settingsOpen && decided && (
          <p className="mt-2 text-sm text-ink-soft">{t('cookie.current', { state: t(marketing ? 'cookie.allowed' : 'cookie.declined') })}</p>
        )}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button type="button" className="btn btn-blue" onClick={() => save(true)}>
            {t('cookie.acceptAll')}
          </button>
          <button type="button" className="btn btn-blue" onClick={() => save(false)}>
            {t('cookie.necessary')}
          </button>
        </div>
      </div>
    </div>
  );
}
