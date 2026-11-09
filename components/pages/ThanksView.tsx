'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useCart } from '@/lib/cart';
import { useLocale } from '@/lib/i18n';
import { track } from '@/lib/pixel';

type Summary = { email: string | null; amountTotal: number; orderRef: string; items: { name: string; quantity: number }[] };

export default function ThanksView() {
  const { clear, ready } = useCart();
  const { t, routes, store, price: formatPrice } = useLocale();
  const T = t.thanks;
  const [summary, setSummary] = useState<Summary | null>(null);
  const done = useRef(false);

  useEffect(() => {
    if (!ready || done.current) return;
    done.current = true;
    const id = new URLSearchParams(window.location.search).get('session_id');
    clear();
    if (!id) return;
    fetch(`/api/order-summary?session_id=${encodeURIComponent(id)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((s: Summary | null) => {
        if (!s) return;
        setSummary(s);
        // same event ID as the server-side Conversions API event → Meta counts it once
        track('Purchase', { value: s.amountTotal / 100, currency: store.currency }, id);
      })
      .catch(() => {});
  }, [ready, clear, store.currency]);

  return (
    <div className="wrap max-w-2xl pt-14">
      <h1 className="text-[2.8rem] sm:text-[3.4rem]">{T.title}</h1>
      <p className="mt-4 text-lg">
        {summary?.email ? T.sentTo(summary.email) : T.soon} {T.printed}
      </p>
      {summary && (
        <div className="mt-8 rounded-2xl bg-lilac p-5">
          <p className="font-bold">{T.order(summary.orderRef)}</p>
          <ul className="mt-2 space-y-1 text-ink-soft">
            {summary.items.map((i, n) => (
              <li key={n}>
                {i.quantity} × {i.name}
              </li>
            ))}
          </ul>
          <p className="mt-3 font-bold">{T.total(formatPrice(summary.amountTotal))}</p>
        </div>
      )}
      <p className="mt-8">{T.questions}</p>
      <Link href={routes.shop} className="btn btn-line mt-6">
        {T.back}
      </Link>
    </div>
  );
}
