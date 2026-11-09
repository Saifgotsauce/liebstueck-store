'use client';

import Link from 'next/link';
import { useState } from 'react';
import ShirtPreview from '@/components/ShirtPreview';
import { GARMENTS, getColor, getProduct } from '@/lib/catalog';
import { isDemo, shop } from '@/lib/config';
import { loc } from '@/lib/i18n';
import { useLocale } from '@/lib/i18n/context';
import { itemPriceCents, useCart } from '@/lib/cart';
import { useConsent } from '@/lib/consent';
import { getTemplate } from '@/lib/design/templates';
import { metaIds, track } from '@/lib/pixel';

export default function CartPage() {
  const cart = useCart();
  const { marketing } = useConsent();
  const { t, locale, price } = useLocale();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkout() {
    setBusy(true);
    setError(null);
    if (isDemo) {
      setError(t('cart.demo'));
      setBusy(false);
      return;
    }
    track('InitiateCheckout', { currency: 'EUR', value: cart.subtotalCents / 100, num_items: cart.count });
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.items.map(({ productSlug, garment, color, size, values, qty }) => ({ productSlug, garment, color, size, values, qty })),
          marketingConsent: marketing,
          locale,
          ...(marketing ? metaIds() : {}),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || t('cart.error'));
      window.location.href = data.url;
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  if (!cart.ready) return <div className="mx-auto min-h-[50vh] max-w-6xl px-4 pt-10" />;

  if (!cart.items.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-14 text-center md:px-6">
        <h1 className="text-[2.2rem]">{t('cart.emptyTitle')}</h1>
        <p className="mt-3 text-lg text-ink-soft">{t('cart.emptyText')}</p>
        <Link href="/produkt/opa-oma-namen/" className="btn btn-primary mt-6 text-lg">
          {t('cart.emptyCta')}
        </Link>
      </div>
    );
  }

  const total = cart.subtotalCents + cart.shippingCents;
  const missing = shop.freeShippingFromCents - cart.subtotalCents;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 md:px-6 md:pt-12">
      <h1 className="text-[2.2rem] md:text-[2.6rem]">{t('cart.title')}</h1>

      <div className="mt-8 grid gap-10 md:grid-cols-[1.6fr_1fr]">
        <ul className="divide-y divide-linie border-y border-linie">
          {cart.items.map((item) => {
            const product = getProduct(item.productSlug)!;
            const g = GARMENTS[item.garment];
            const c = getColor(g, item.color) ?? g.colors[0];
            const tpl = getTemplate(product.template);
            return (
              <li key={item.id} className="grid grid-cols-[6.5rem_1fr] gap-4 py-5 sm:grid-cols-[8.5rem_1fr]">
                <div className="rounded-xl bg-blau-hell p-1.5">
                  <ShirtPreview garment={item.garment} colorHex={c.hex} ink={c.ink} templateId={product.template} values={item.values} label={`${loc(product.name, locale)}: ${tpl.summarize(item.values, locale)}`} className="w-full" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-sans text-lg font-bold leading-snug">{loc(product.name, locale)}</h2>
                    <p className="shrink-0 font-bold">{price(itemPriceCents(item) * item.qty)}</p>
                  </div>
                  <p className="mt-1 text-ink-soft">
                    {t('cart.line', { garment: loc(g.label, locale), colour: loc(c.label, locale), size: item.size })}
                  </p>
                  <p className="mt-1 break-words">{tpl.summarize(item.values, locale)}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-4">
                    <div className="flex items-center rounded-full border-2 border-linie">
                      <button type="button" className="h-10 w-10 rounded-full text-xl font-bold" aria-label={t('cart.less')} onClick={() => cart.setQty(item.id, item.qty - 1)} disabled={item.qty <= 1}>
                        −
                      </button>
                      <span className="w-8 text-center font-bold" aria-live="polite">
                        {item.qty}
                      </span>
                      <button type="button" className="h-10 w-10 rounded-full text-xl font-bold" aria-label={t('cart.more')} onClick={() => cart.setQty(item.id, item.qty + 1)}>
                        +
                      </button>
                    </div>
                    <button type="button" className="link" onClick={() => cart.remove(item.id)}>
                      {t('cart.remove')}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="self-start rounded-2xl bg-blau-hell p-6 md:sticky md:top-28">
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt>{t('cart.subtotal')}</dt>
              <dd>{price(cart.subtotalCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>{t('cart.shipping')}</dt>
              <dd>{cart.shippingCents ? price(cart.shippingCents) : t('cart.free')}</dd>
            </div>
            <div className="flex justify-between border-t border-linie pt-3 text-xl font-bold">
              <dt>{t('cart.total')}</dt>
              <dd>{price(total)}</dd>
            </div>
          </dl>
          <p className="mt-1 text-sm text-ink-soft">{t('cart.vat')}</p>
          {missing > 0 && (
            <p className="mt-4 rounded-lg bg-white px-3 py-2 text-sm">{t('cart.freeLeft', { amount: price(missing) })}</p>
          )}
          <button type="button" className="btn btn-primary mt-5 w-full text-lg" onClick={checkout} disabled={busy}>
            {busy ? t('cart.opening') : t('cart.checkout')}
          </button>
          {error && (
            <p className="mt-3 font-bold text-rot" role="alert">
              {error}
            </p>
          )}
          <p className="mt-4 text-sm text-ink-soft">
            {t('cart.note', { delivery: loc(shop.deliveryText, locale) })}
          </p>
        </aside>
      </div>
    </div>
  );
}
