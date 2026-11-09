'use client';

import Link from 'next/link';
import { useState } from 'react';
import { isDemo } from '@/lib/config';
import { formatDateTime } from '@/lib/i18n';
import { useLocale } from '@/lib/i18n/context';

// "Vertrag hier widerrufen": the electronic withdrawal function required for EU online
// shops since 19 June 2026. Two steps: fill in → "Widerruf bestätigen" → receipt.

export default function WithdrawalPage() {
  const [state, setState] = useState<'form' | 'sending' | 'done'>('form');
  const [error, setError] = useState<string | null>(null);
  const [stamp, setStamp] = useState('');
  const { t, locale } = useLocale();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = { ...Object.fromEntries(new FormData(e.currentTarget).entries()), locale };
    if (isDemo) {
      setStamp(formatDateTime(new Date(), locale));
      setState('done');
      return;
    }
    setState('sending');
    try {
      const res = await fetch('/api/withdrawal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const json = (await res.json().catch(() => ({}))) as { error?: string; stamp?: string };
      if (!res.ok) throw new Error(json.error || t('wd.error'));
      setStamp(json.stamp ?? '');
      setState('done');
    } catch (err) {
      setError((err as Error).message);
      setState('form');
    }
  }

  if (state === 'done') {
    return (
      <div className="mx-auto max-w-2xl px-4 pt-14 md:px-6" role="status">
        <h1 className="text-[2.2rem]">{t('wd.doneTitle')}</h1>
        <p className="mt-4 text-lg">{t('wd.doneText', { stamp })}</p>
        <p className="mt-3 text-ink-soft">{t('wd.doneNote')}</p>
        <Link href="/" className="btn btn-blue mt-8">
          {t('wd.home')}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pt-10 md:px-6 md:pt-14">
      <h1 className="text-[2.2rem] md:text-[2.6rem]">{t('wd.title')}</h1>
      <p className="mt-3 text-ink-soft">{t('wd.intro')}</p>
      <p className="mt-2">
        <Link href="/widerrufsbelehrung/" className="link">
          {t('wd.noticeLink')}
        </Link>
      </p>

      <form onSubmit={submit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="w-name" className="mb-1.5 block font-bold">{t('wd.name')}</label>
          <input id="w-name" name="name" required autoComplete="name" className="field-input" />
        </div>
        <div>
          <label htmlFor="w-email" className="mb-1.5 block font-bold">{t('wd.email')}</label>
          <input id="w-email" name="email" type="email" required autoComplete="email" className="field-input" />
        </div>
        <div>
          <label htmlFor="w-order" className="mb-1.5 block font-bold">{t('wd.order')}</label>
          <input id="w-order" name="order" required placeholder={t('wd.orderPlaceholder')} className="field-input" />
          <p className="mt-1.5 text-sm text-ink-soft">{t('wd.orderHelp')}</p>
        </div>
        <div>
          <label htmlFor="w-date" className="mb-1.5 block font-bold">{t('wd.date')}</label>
          <input id="w-date" name="orderDate" className="field-input" placeholder={t('wd.datePlaceholder')} />
        </div>
        <div>
          <label htmlFor="w-items" className="mb-1.5 block font-bold">{t('wd.items')}</label>
          <textarea id="w-items" name="items" rows={3} className="field-input" placeholder={t('wd.itemsPlaceholder')} />
        </div>
        <div className="hidden" aria-hidden="true">
          <label htmlFor="w-website">Website</label>
          <input id="w-website" name="website" tabIndex={-1} autoComplete="off" />
        </div>
        {error && (
          <p className="font-bold text-rot" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-blue w-full text-lg" disabled={state === 'sending'}>
          {state === 'sending' ? t('wd.sending') : t('wd.submit')}
        </button>
      </form>
    </div>
  );
}
