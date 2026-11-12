'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { trackEvent } from '@/lib/analytics';
import ShirtPreview from '@/components/ShirtPreview';
import { PaymentLogos, PromiseNote } from '@/components/Trust';
import { GARMENTS, colorLabel, garmentText } from '@/lib/catalog';
import { isDemo } from '@/lib/config';
import { useCart } from '@/lib/cart';
import { itemPriceCents, nextBundle } from '@/lib/cart-math';
import { useConsent } from '@/lib/consent';
import { getDesign } from '@/lib/designs';
import { getTemplate } from '@/lib/design/templates';
import { useLocale } from '@/lib/i18n';
import { productPath } from '@/lib/locale';
import { metaIds, track } from '@/lib/pixel';
import { checkCode, saveCode, useAppliedCode } from '@/lib/referral-client';

/** The cart, for either store. The German one continues to its own order page (/de/kasse/). */
export default function CartView() {
  const { items, ready, totals, setQty, remove } = useCart();
  const { locale, t, routes, store, price: formatPrice } = useLocale();
  const C = t.cart;
  const shop = store;
  const { marketing } = useConsent();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  // US: friend / reward code ($5 off, on top of bundle savings)
  const appliedCode = useAppliedCode();
  const code = locale === 'en' ? appliedCode : null;
  const codeOff = code ? Math.min(code.cents, totals.merchandise) : 0;
  const grandTotal = totals.total - codeOff;
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');
  const [codeBusy, setCodeBusy] = useState(false);

  async function applyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!codeInput.trim()) return;
    setCodeBusy(true);
    setCodeError('');
    const { info, error: err } = await checkCode(codeInput);
    setCodeBusy(false);
    if (!info) return setCodeError(err ?? '');
    saveCode(info);
    setCodeInput('');
    trackEvent('ReferralCodeApplied', { kind: info.kind, source: 'cart' });
  }

  useEffect(() => {
    if (ready && items.length) trackEvent('CartViewed', { items: totals.count, value: totals.total / 100 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  async function checkout() {
    setBusy(true);
    setError('');
    track('InitiateCheckout', { value: grandTotal / 100, currency: store.currency, num_items: totals.count });
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale, items, ...(code ? { code: code.code } : {}), marketingConsent: marketing, ...(marketing ? metaIds() : {}) }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string; badCode?: boolean };
      if (data.badCode) saveCode(null);
      if (!res.ok || !data.url) throw new Error(data.error || C.error);
      window.location.href = data.url;
    } catch (e) {
      trackEvent('CheckoutError', { message: (e as Error).message.slice(0, 80) });
      setError((e as Error).message);
      setBusy(false);
    }
  }

  if (!ready) return <div className="wrap min-h-[50vh] pt-12" />;

  if (!items.length) {
    return (
      <div className="wrap max-w-2xl pt-16 text-center">
        <h1 className="text-[2.6rem]">{C.empty}</h1>
        <p className="mt-3 text-lg text-ink-soft">{C.emptyNote}</p>
        <Link href={routes.shop} className="btn btn-red mt-7">
          {C.shopAll}
        </Link>
      </div>
    );
  }

  const next = nextBundle(totals.count, locale);
  const toFree = shop.freeShippingFromCents - totals.merchandise;

  return (
    <div className="wrap pt-5 sm:pt-12">
      {/* Phone: small heading and tight spacing, so the total and the checkout button come sooner */}
      <h1 className="text-[2rem] sm:text-[3.2rem]">{C.title}</h1>
      <div className="mt-4 grid gap-6 sm:mt-8 lg:grid-cols-[1.5fr_1fr] lg:gap-10">
        <ul className="divide-y divide-lilac-line border-y border-lilac-line">
          {items.map((i) => {
            const d = getDesign(i.design)!;
            const g = GARMENTS[i.garment];
            const c = g.colors.find((x) => x.key === i.color);
            const personal = getTemplate(i.design).summarize(i.values);
            const href = productPath(locale, i.design);
            return (
              <li key={i.id} className="flex gap-4 py-4 sm:py-5">
                <Link href={href} className="w-24 shrink-0 self-start overflow-hidden rounded-xl bg-white ring-1 ring-lilac-line sm:w-32">
                  <ShirtPreview design={i.design} garment={i.garment} colorKey={i.color} values={i.values} label={d.title} className="block aspect-square w-full" view="tile" />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-3">
                    <Link href={href} className="font-bold leading-snug no-underline hover:text-violet">
                      {d.title}
                    </Link>
                    <span className="shrink-0 font-bold">{formatPrice(itemPriceCents(i, locale) * i.qty)}</span>
                  </div>
                  <p className="mt-1 text-[0.95rem] text-ink-soft">
                    {C.line(garmentText(i.garment, locale).label, c ? colorLabel(c, locale) : '', i.size)}
                  </p>
                  {personal && <p className="mt-0.5 text-[0.95rem] text-ink-soft">{personal}</p>}
                  <div className="mt-2 flex items-center gap-4">
                    <div className="flex items-center rounded-full ring-2 ring-lilac-line" role="group" aria-label={C.qtyOf(d.title)}>
                      <button type="button" className="h-11 w-11 text-lg font-bold" onClick={() => {
                          trackEvent('CartQuantityChanged', { direction: 'down' });
                          setQty(i.id, i.qty - 1);
                        }} aria-label={C.less}>
                        −
                      </button>
                      <span className="w-7 text-center font-bold">{i.qty}</span>
                      <button type="button" className="h-11 w-11 text-lg font-bold" onClick={() => {
                          trackEvent('CartQuantityChanged', { direction: 'up' });
                          setQty(i.id, i.qty + 1);
                        }} aria-label={C.more}>
                        +
                      </button>
                    </div>
                    <button type="button" className="inline-flex min-h-12 items-center font-bold text-ink-soft underline hover:text-red" onClick={() => {
                        trackEvent('CartItemRemoved', { product: i.design });
                        remove(i.id);
                      }}>
                      {C.remove}
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
                {C.addMore(next.minItems - totals.count, next.percent)}
              </p>
            ) : (
              <p className="coupon font-bold" style={{ ['--coupon-bg' as string]: 'var(--color-lilac)' }}>
                {C.saving(totals.percent)}
              </p>
            )}
            <dl className="mt-4 space-y-2 text-[1.05rem]">
              <div className="flex justify-between">
                <dt>{C.subtotal}</dt>
                <dd>{formatPrice(totals.subtotal)}</dd>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-red">
                  <dt>{C.bundle(totals.percent)}</dt>
                  <dd>−{formatPrice(totals.discount)}</dd>
                </div>
              )}
              {code && codeOff > 0 && (
                <div className="flex items-start justify-between gap-3 text-red">
                  <dt>
                    {code.kind === 'reward' ? 'Reward code' : code.name ? `${code.name}’s friend code` : 'Friend code'} <span className="font-bold">{code.code}</span>
                    <button type="button" className="ml-2 font-bold text-violet underline" onClick={() => saveCode(null)}>
                      Remove
                    </button>
                  </dt>
                  <dd className="whitespace-nowrap">−{formatPrice(codeOff)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt>{C.shipping}</dt>
                <dd>{totals.shipping ? formatPrice(totals.shipping) : C.free}</dd>
              </div>
              <div className="flex justify-between border-t border-lilac-line pt-3 text-[1.25rem] font-bold">
                <dt>{C.total}</dt>
                <dd>{formatPrice(grandTotal)}</dd>
              </div>
            </dl>
            {toFree > 0 && totals.shipping > 0 && (
              <div className="mt-4">
                <p className="text-[0.95rem]">{C.toFree(formatPrice(toFree))}</p>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white" aria-hidden="true">
                  <div className="h-full rounded-full bg-violet" style={{ width: `${Math.min(100, (totals.merchandise / shop.freeShippingFromCents) * 100)}%` }} />
                </div>
              </div>
            )}
            {locale === 'en' && !code && (
              // One quiet line until she opens it: an empty code box in front of the button sends
              // people off to hunt for a code. Codes from a friend's link are filled in already.
              <details className="mt-3">
                <summary className="flex min-h-12 cursor-pointer list-none items-center font-bold text-violet underline [&::-webkit-details-marker]:hidden">Have a friend or reward code?</summary>
                <form onSubmit={applyCode} className="pb-1">
                  <label htmlFor="cart-code" className="sr-only">
                    Your code
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="cart-code"
                      className="field min-w-0 flex-1"
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                      placeholder="e.g. LINDA7KQ"
                      autoComplete="off"
                      autoCapitalize="characters"
                      aria-invalid={codeError ? true : undefined}
                      aria-describedby={codeError ? 'cart-code-error' : undefined}
                    />
                    <button type="submit" className="btn btn-line shrink-0 px-5" disabled={codeBusy}>
                      {codeBusy ? 'Checking…' : 'Apply'}
                    </button>
                  </div>
                  {codeError && (
                    <p id="cart-code-error" className="mt-2 font-bold text-red" role="alert">
                      {codeError}
                    </p>
                  )}
                </form>
              </details>
            )}
            {locale === 'de' && <p className="mt-4 text-[0.92rem] text-ink-soft">{C.taxNote}</p>}
            {locale === 'de' ? (
              // Germany: our own order page comes first (address, overview, "zahlungspflichtig bestellen")
              <Link href={routes.checkout} className="btn btn-red mt-5 w-full" onClick={() => track('InitiateCheckout', { value: totals.total / 100, currency: store.currency, num_items: totals.count })}>
                {C.checkout}
              </Link>
            ) : (
              <button type="button" className="btn btn-red mt-3 w-full" onClick={checkout} disabled={busy || isDemo}>
                {isDemo ? C.demo : busy ? C.opening : C.checkout}
              </button>
            )}
            {error && (
              <p className="mt-3 font-bold text-red" role="alert">
                {error}
              </p>
            )}
            {locale === 'en' && <PaymentLogos center className="mt-4" />}
            <p className="mt-3 text-center text-[0.95rem] text-ink-soft">{C.payNote}</p>
            {locale === 'en' && <p className="mt-2 text-center text-[0.92rem] text-ink-soft">{C.taxNote}</p>}
          </div>
          {locale === 'en' && <PromiseNote className="mt-4 bg-white ring-2 ring-lilac-line" />}
          <p className="mt-4 text-[1rem] text-ink-soft">{C.deliveryNote(shop.deliveryMinDays, shop.deliveryMaxDays)}</p>
        </aside>
      </div>
    </div>
  );
}
