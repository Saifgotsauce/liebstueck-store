'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { shop } from '@/lib/config';
import { loc } from '@/lib/i18n';
import { useLocale } from '@/lib/i18n/context';
import { useCart } from '@/lib/cart';
import { track } from '@/lib/pixel';

type Summary = { email: string | null; amountTotal: number; orderRef: string; items: { name: string; quantity: number }[] };

export default function ThankYouPage() {
  const { clear, ready } = useCart();
  const { t, locale, price } = useLocale();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (ready) clear();
  }, [ready, clear]);

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get('session_id');
    if (!sessionId) {
      setFailed(true);
      return;
    }
    fetch(`/api/order-summary?session_id=${encodeURIComponent(sessionId)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((s: Summary) => {
        setSummary(s);
        // Fire Purchase once per order; event ID matches the server-side Conversions API event.
        const key = `purchase-tracked-${sessionId}`;
        try {
          if (!sessionStorage.getItem(key)) {
            track('Purchase', { currency: 'EUR', value: s.amountTotal / 100 }, sessionId);
            sessionStorage.setItem(key, '1');
          }
        } catch {
          track('Purchase', { currency: 'EUR', value: s.amountTotal / 100 }, sessionId);
        }
      })
      .catch(() => setFailed(true));
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 pt-14 md:px-6">
      <h1 className="text-[2.3rem] md:text-[2.8rem]">{t('thanks.title')}</h1>
      {summary ? (
        <>
          <p className="mt-4 text-lg">{t('thanks.order', { ref: summary.orderRef, email: summary.email ?? '' })}</p>
          <ul className="mt-6 divide-y divide-linie border-y border-linie">
            {summary.items.map((i, idx) => (
              <li key={idx} className="flex justify-between py-3">
                <span>{i.name}</span>
                <span className="text-ink-soft">× {i.quantity}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-lg font-bold">{t('thanks.paid', { amount: price(summary.amountTotal) })}</p>
        </>
      ) : (
        <p className="mt-4 text-lg text-ink-soft">{failed ? t('thanks.fallback') : t('thanks.loading')}</p>
      )}
      <p className="mt-6 text-ink-soft">
        {t('thanks.next', { delivery: loc(shop.deliveryText, locale) })}
      </p>
      <Link href="/" className="btn btn-blue mt-8">
        {t('thanks.home')}
      </Link>
    </div>
  );
}
