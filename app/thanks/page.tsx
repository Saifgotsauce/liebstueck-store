'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { formatPrice } from '@/lib/config';
import { useCart } from '@/lib/cart';
import { track } from '@/lib/pixel';

type Summary = { email: string | null; amountTotal: number; orderRef: string; items: { name: string; quantity: number }[] };

export default function Thanks() {
  const { clear, ready } = useCart();
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
        track('Purchase', { value: s.amountTotal / 100, currency: 'USD' }, id);
      })
      .catch(() => {});
  }, [ready, clear]);

  return (
    <div className="wrap max-w-2xl pt-14">
      <h1 className="text-[2.8rem] sm:text-[3.4rem]">Thank you! It’s being made.</h1>
      <p className="mt-4 text-lg">
        {summary?.email ? (
          <>
            We sent your confirmation to <strong>{summary.email}</strong>.
          </>
        ) : (
          'You’ll get a confirmation email in a moment.'
        )}{' '}
        Your order is printed just for you and usually ships within 2–5 business days. We’ll email the tracking link as soon as it’s on its way.
      </p>
      {summary && (
        <div className="mt-8 rounded-2xl bg-lilac p-5">
          <p className="font-bold">Order {summary.orderRef}</p>
          <ul className="mt-2 space-y-1 text-ink-soft">
            {summary.items.map((i, n) => (
              <li key={n}>
                {i.quantity} × {i.name}
              </li>
            ))}
          </ul>
          <p className="mt-3 font-bold">Total {formatPrice(summary.amountTotal)}</p>
        </div>
      )}
      <p className="mt-8">Questions about your order? Just reply to the confirmation email.</p>
      <Link href="/shop/" className="btn btn-line mt-6">
        Back to the shop
      </Link>
    </div>
  );
}
