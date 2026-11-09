'use client';

import Link from 'next/link';
import { useState } from 'react';
import ShirtPreview from '@/components/ShirtPreview';
import { GARMENTS } from '@/lib/catalog';
import { formatPrice, isDemo, shop } from '@/lib/config';
import { useCart } from '@/lib/cart';
import { itemPriceCents, nextBundle } from '@/lib/cart-math';
import { useConsent } from '@/lib/consent';
import { getDesign } from '@/lib/designs';
import { getTemplate } from '@/lib/design/templates';
import { metaIds, track } from '@/lib/pixel';

export default function CartPage() {
  const { items, ready, totals, setQty, remove } = useCart();
  const { marketing } = useConsent();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function checkout() {
    setBusy(true);
    setError('');
    track('InitiateCheckout', { value: totals.total / 100, currency: 'USD', num_items: totals.count });
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, marketingConsent: marketing, ...(marketing ? metaIds() : {}) }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || 'Checkout couldn’t be opened. Please try again.');
      window.location.href = data.url;
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  if (!ready) return <div className="wrap min-h-[50vh] pt-12" />;

  if (!items.length) {
    return (
      <div className="wrap max-w-2xl pt-16 text-center">
        <h1 className="text-[2.6rem]">Your cart is empty.</h1>
        <p className="mt-3 text-lg text-ink-soft">The jokes are all still in the shop.</p>
        <Link href="/shop/" className="btn btn-red mt-7">
          Shop all shirts
        </Link>
      </div>
    );
  }

  const next = nextBundle(totals.count);
  const toFree = shop.freeShippingFromCents - totals.merchandise;

  return (
    <div className="wrap pt-8 sm:pt-12">
      <h1 className="text-[2.6rem] sm:text-[3.2rem]">Your cart</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <ul className="divide-y divide-lilac-line border-y border-lilac-line">
          {items.map((i) => {
            const d = getDesign(i.design)!;
            const g = GARMENTS[i.garment];
            const c = g.colors.find((x) => x.key === i.color);
            const personal = getTemplate(i.design).summarize(i.values);
            return (
              <li key={i.id} className="flex gap-4 py-5">
                <Link href={`/p/${i.design}/`} className="w-24 shrink-0 self-start overflow-hidden rounded-xl bg-white ring-1 ring-lilac-line sm:w-32">
                  <ShirtPreview design={i.design} garment={i.garment} colorKey={i.color} values={i.values} label={d.title} className="block aspect-square w-full" view="tile" />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-3">
                    <Link href={`/p/${i.design}/`} className="font-bold leading-snug no-underline hover:text-violet">
                      {d.title}
                    </Link>
                    <span className="shrink-0 font-bold">{formatPrice(itemPriceCents(i) * i.qty)}</span>
                  </div>
                  <p className="mt-1 text-[0.95rem] text-ink-soft">
                    {g.label}, {c?.label}, size {i.size}
                  </p>
                  {personal && <p className="mt-0.5 text-[0.95rem] text-ink-soft">{personal}</p>}
                  <div className="mt-3 flex items-center gap-4">
                    <div className="flex items-center rounded-full ring-2 ring-lilac-line" role="group" aria-label={`Quantity of ${d.title}`}>
                      <button type="button" className="h-10 w-10 text-lg font-bold" onClick={() => setQty(i.id, i.qty - 1)} aria-label="One less">
                        −
                      </button>
                      <span className="w-7 text-center font-bold">{i.qty}</span>
                      <button type="button" className="h-10 w-10 text-lg font-bold" onClick={() => setQty(i.id, i.qty + 1)} aria-label="One more">
                        +
                      </button>
                    </div>
                    <button type="button" className="font-bold text-ink-soft underline hover:text-red" onClick={() => remove(i.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl bg-lilac p-5 sm:p-6">
            {next ? (
              <p className="coupon" style={{ ['--coupon-bg' as string]: 'var(--color-lilac)' }}>
                <span className="font-bold">
                  Add {next.minItems - totals.count} more {next.minItems - totals.count === 1 ? 'shirt' : 'shirts'} and save {next.percent}%
                </span>{' '}
                on your whole order.
              </p>
            ) : (
              <p className="coupon font-bold" style={{ ['--coupon-bg' as string]: 'var(--color-lilac)' }}>
                You’re saving {totals.percent}% with your bundle.
              </p>
            )}
            <dl className="mt-5 space-y-2 text-[1.05rem]">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd>{formatPrice(totals.subtotal)}</dd>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-red">
                  <dt>Bundle savings ({totals.percent}%)</dt>
                  <dd>−{formatPrice(totals.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt>Shipping</dt>
                <dd>{totals.shipping ? formatPrice(totals.shipping) : 'Free'}</dd>
              </div>
              <div className="flex justify-between border-t border-lilac-line pt-3 text-[1.25rem] font-bold">
                <dt>Total</dt>
                <dd>{formatPrice(totals.total)}</dd>
              </div>
            </dl>
            {toFree > 0 && (
              <div className="mt-4">
                <p className="text-[0.95rem]">
                  You’re {formatPrice(toFree)} away from free shipping.
                </p>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white" aria-hidden="true">
                  <div className="h-full rounded-full bg-violet" style={{ width: `${Math.min(100, (totals.merchandise / shop.freeShippingFromCents) * 100)}%` }} />
                </div>
              </div>
            )}
            <p className="mt-4 text-[0.92rem] text-ink-soft">Sales tax, if any, is calculated at checkout.</p>
            <button type="button" className="btn btn-red mt-5 w-full" onClick={checkout} disabled={busy || isDemo}>
              {isDemo ? 'Checkout is off in this preview' : busy ? 'Opening secure checkout…' : 'Check out securely'}
            </button>
            {error && (
              <p className="mt-3 font-bold text-red" role="alert">
                {error}
              </p>
            )}
            <p className="mt-4 text-center text-[0.92rem] text-ink-soft">Card, Apple Pay or Google Pay via Stripe</p>
          </div>
          <p className="mt-4 text-[0.95rem] text-ink-soft">
            Printed to order and delivered in about {shop.deliveryMinDays}–{shop.deliveryMaxDays} business days. Personalized items are printed exactly as entered, so please double-check the spelling.
          </p>
        </aside>
      </div>
    </div>
  );
}
