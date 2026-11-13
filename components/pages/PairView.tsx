'use client';

// Landing page for an ad that shows two shirts (lib/pairs.ts). First screen on a phone: the ad's own
// headline and both shirts with their prices. Then "Get both" (the order that pays for the ad: two
// shirts, bundle saving, free shipping), then each shirt on its own. Rules: docs/design-rules.md §5a.

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import ShirtPreview from '@/components/ShirtPreview';
import { OrderSteps, PaymentLogos, PromiseNote } from '@/components/Trust';
import { IconCheck, IconTruck } from '@/components/Icons';
import { trackEvent } from '@/lib/analytics';
import { GARMENTS, defaultColor, garmentText, isAvailable, sizeExtraCents, unitPriceCents } from '@/lib/catalog';
import { cartTotals } from '@/lib/cart-math';
import { useCart } from '@/lib/cart';
import { useConsent } from '@/lib/consent';
import { deliveryWindow, holidayDeadline } from '@/lib/dates';
import { getDesign, type Design } from '@/lib/designs';
import { defaultValues, getTemplate } from '@/lib/design/templates';
import { useLocale } from '@/lib/i18n';
import { ROUTES, productPath } from '@/lib/locale';
import { PAIR_COPY as C, type Pair } from '@/lib/pairs';
import { track } from '@/lib/pixel';
import { SIZE_HELP } from '@/lib/promise';

const g = GARMENTS.tee;
const locale = 'en' as const;

export default function PairView({ pair }: { pair: Pair }) {
  const designs = pair.designs.map((s) => getDesign(s)!) as [Design, Design];
  const colors = designs.map((d) => defaultColor(d, 'tee', locale));
  const { add, totals } = useCart();
  const { marketing } = useConsent();
  const { t, price: fmt, store } = useLocale();
  const T = t.pdp;

  const [bothSize, setBothSize] = useState<string | null>(null);
  const [split, setSplit] = useState(false);
  const [splitSizes, setSplitSizes] = useState<[string | null, string | null]>([null, null]);
  const [bothAdded, setBothAdded] = useState(false);
  const [bothError, setBothError] = useState(false);
  const [oneSize, setOneSize] = useState<[string | null, string | null]>([null, null]);
  const [oneAdded, setOneAdded] = useState<[boolean, boolean]>([false, false]);
  const [oneError, setOneError] = useState<[boolean, boolean]>([false, false]);
  const [dates, setDates] = useState<{ window: string; holiday: ReturnType<typeof holidayDeadline> } | null>(null);

  // Dates depend on today: work them out in the browser, so the page can be built ahead of time
  useEffect(() => setDates({ window: deliveryWindow(locale), holiday: holidayDeadline(locale) }), []);

  useEffect(() => {
    if (!marketing) return;
    const value = designs.reduce((s, d) => s + unitPriceCents('tee', undefined, locale, d.slug), 0) / 100;
    track('ViewContent', { content_ids: pair.designs, content_type: 'product', value, currency: store.currency });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketing, pair.slug]);

  const sizesBoth: [string | null, string | null] = split ? splitSizes : [bothSize, bothSize];
  const both = useMemo(
    () => cartTotals(designs.map((d, i) => ({ garment: 'tee' as const, size: sizesBoth[i] ?? 'M', qty: 1, design: d.slug })), locale),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sizesBoth[0], sizesBoth[1]],
  );
  const single = (i: number) => unitPriceCents('tee', oneSize[i] ?? undefined, locale, designs[i].slug);

  function addBoth() {
    if (!sizesBoth[0] || !sizesBoth[1]) {
      setBothError(true);
      trackEvent('AddToCartBlocked', { reason: 'no_size_chosen', product: pair.slug });
      return;
    }
    designs.forEach((d, i) => add({ design: d.slug, garment: 'tee', color: colors[i], size: sizesBoth[i]!, values: defaultValues(getTemplate(d.slug)), qty: 1 }));
    track('AddToCart', { content_ids: pair.designs, content_type: 'product', value: both.merchandise / 100, currency: store.currency });
    trackEvent('PairAdded', { pair: pair.slug, which: 'both' });
    setBothAdded(true);
  }

  function addOne(i: number) {
    const size = oneSize[i];
    if (!size) {
      setOneError((e) => (i === 0 ? [true, e[1]] : [e[0], true]));
      trackEvent('AddToCartBlocked', { reason: 'no_size_chosen', product: designs[i].slug });
      return;
    }
    const d = designs[i];
    add({ design: d.slug, garment: 'tee', color: colors[i], size, values: defaultValues(getTemplate(d.slug)), qty: 1 });
    track('AddToCart', { content_ids: [d.slug], content_type: 'product', value: single(i) / 100, currency: store.currency });
    trackEvent('PairAdded', { pair: pair.slug, which: d.slug });
    setOneAdded((a) => (i === 0 ? [true, a[1]] : [a[0], true]));
  }

  const shipLine = (merch: number) => {
    const ship = merch >= store.freeShippingFromCents ? 0 : store.shippingCents;
    return ship === 0 ? T.shipFree : T.shipPaid(fmt(ship), fmt(store.freeShippingFromCents), true);
  };

  return (
    <>
      {/* First screen: the ad's headline, both shirts, both prices */}
      <section className="bg-lilac">
        <div className="wrap pb-6 pt-5 sm:py-12">
          <h1 className="max-w-3xl text-[1.9rem] leading-tight sm:text-[3rem]">{pair.headline}</h1>
          <p className="mt-1.5 text-[1.05rem] leading-snug sm:mt-3 sm:text-[1.15rem]">{pair.intro}</p>
          <ul className="mt-4 grid max-w-3xl grid-cols-2 gap-3 sm:mt-8 sm:gap-6">
            {designs.map((d, i) => (
              <li key={d.slug}>
                <a href={`#${d.slug}`} className="block no-underline" onClick={() => trackEvent('UiClick', { label: `pair-tile-${d.slug}` })}>
                  <ShirtPreview design={d.slug} garment="tee" colorKey={colors[i]} values={defaultValues(getTemplate(d.slug))} label={`${d.title}, black T-shirt`} className="block aspect-square w-full overflow-hidden rounded-2xl bg-white ring-1 ring-lilac-line" view="tile" />
                  <span className="mt-2 block font-bold leading-snug text-ink">{d.title}</span>
                  <span className="block text-ink-soft">{fmt(unitPriceCents('tee', undefined, locale, d.slug))}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Get both */}
      <section className="wrap mt-6 max-w-3xl sm:mt-10">
        <div className="rounded-2xl border-2 border-violet bg-white p-4 sm:p-6">
          <h2 className="text-[1.6rem] leading-tight">{C.both}</h2>
          <p className="mt-1">{C.bothNote(both.percent)}</p>
          <p className="mt-2 text-[1.3rem] font-black">
            {fmt(both.total)} <span className="text-[1rem] font-medium text-ink-soft line-through">{fmt(both.subtotal)}</span>
          </p>

          {!split ? (
            <SizePicker label={C.sizeBoth} id="size-both" value={bothSize} error={bothError} onPick={(s) => { setBothSize(s); setBothError(false); setBothAdded(false); trackEvent('SizeSelected', { product: pair.slug, garment: 'tee', size: s }); }} />
          ) : (
            designs.map((d, i) => (
              <SizePicker key={d.slug} label={C.sizeFor(d.title)} id={`size-both-${i}`} value={splitSizes[i]} error={bothError && !splitSizes[i]} onPick={(s) => { setSplitSizes((v) => (i === 0 ? [s, v[1]] : [v[0], s])); setBothError(false); setBothAdded(false); }} />
            ))
          )}
          <button
            type="button"
            className="mt-2 inline-flex min-h-12 items-center font-bold text-violet underline"
            onClick={() => {
              setSplit(!split);
              if (!split) setSplitSizes([bothSize, bothSize]);
              setBothAdded(false);
            }}
          >
            {split ? C.sameSize : C.differentSizes}
          </button>
          {bothError && <p className="mt-1 font-bold text-red">{C.pickSize}</p>}

          <div className="mt-3">
            {bothAdded ? (
              <Added title={C.bothInCart} line={C.cartNow(totals.count, fmt(totals.total), totals.shipping === 0)} />
            ) : (
              <button type="button" className="btn btn-red min-h-[4rem] w-full text-[1.15rem] shadow-[0_6px_0_var(--color-red-deep)] active:shadow-none" onClick={addBoth}>
                {C.addBoth(fmt(both.total))}
              </button>
            )}
          </div>
          <Facts ship={T.shipFree} dates={dates} T={T} />
          <PromiseNote className="mt-4" />
          <PaymentLogos center className="mt-4" />
        </div>
      </section>

      {/* Each shirt on its own */}
      <section className="wrap mt-10 max-w-3xl">
        <h2 className="text-[1.6rem]">{C.orOne}</h2>
        {designs.map((d, i) => {
          const other = designs[1 - i];
          return (
            <article key={d.slug} id={d.slug} className="mt-6 scroll-mt-24 border-t border-lilac-line pt-6 sm:grid sm:grid-cols-2 sm:gap-8">
              <ShirtPreview design={d.slug} garment="tee" colorKey={colors[i]} values={defaultValues(getTemplate(d.slug))} label={`${d.title}, black T-shirt`} className="block aspect-square w-full overflow-hidden rounded-2xl bg-white ring-1 ring-lilac-line" view="main" />
              <div className="mt-4 sm:mt-0">
                <h3 className="font-sans text-[1.3rem] font-bold leading-snug">{d.title}</h3>
                <p className="mt-1 text-[1.2rem] font-black">{fmt(single(i))}</p>
                <p className="mt-2">{d.blurb}</p>
                <SizePicker label={T.size} id={`size-${d.slug}`} value={oneSize[i]} error={oneError[i]} onPick={(s) => { setOneSize((v) => (i === 0 ? [s, v[1]] : [v[0], s])); setOneError((e) => (i === 0 ? [false, e[1]] : [e[0], false])); setOneAdded((a) => (i === 0 ? [false, a[1]] : [a[0], false])); trackEvent('SizeSelected', { product: d.slug, garment: 'tee', size: s }); }} />
                {oneError[i] && <p className="mt-1 font-bold text-red">{C.pickSize}</p>}
                <div className="mt-3">
                  {oneAdded[i] ? (
                    <Added title={C.inCart} line={C.cartNow(totals.count, fmt(totals.total), totals.shipping === 0)}>
                      {!oneAdded[1 - i] && (
                        <a href={`#${other.slug}`} className="mt-1 inline-flex min-h-12 items-center font-bold text-violet underline">
                          {C.addOther(other.title)}
                        </a>
                      )}
                    </Added>
                  ) : (
                    <button type="button" className="btn btn-violet min-h-[3.6rem] w-full text-[1.1rem]" onClick={() => addOne(i)}>
                      {C.addOne(fmt(single(i)))}
                    </button>
                  )}
                </div>
                <Facts ship={shipLine(single(i))} dates={dates} T={T} />
                <Link href={productPath(locale, d.slug)} className="mt-2 inline-flex min-h-12 items-center font-bold text-violet underline">
                  {C.details}
                </Link>
              </div>
            </article>
          );
        })}
      </section>

      <section className="wrap mt-12 max-w-3xl">
        <OrderSteps />
      </section>
    </>
  );
}

function SizePicker({ label, id, value, error, onPick }: { label: string; id: string; value: string | null; error: boolean; onPick: (s: string) => void }) {
  const { price: fmt } = useLocale();
  return (
    <div className="mt-4">
      <p id={id} className="font-bold">
        {label}
      </p>
      <div className={`mt-2 flex flex-wrap gap-2 rounded-2xl ${error ? 'p-2 ring-2 ring-red' : ''}`} role="radiogroup" aria-labelledby={id}>
        {g.sizes.map((s) => {
          const extra = sizeExtraCents('tee', s, locale);
          return (
            <button key={s} type="button" role="radio" aria-checked={value === s} disabled={!isAvailable('tee', 'black', s, locale)} className="chip flex-col leading-tight" onClick={() => onPick(s)}>
              {s}
              {extra ? <span className="text-[0.85rem] font-medium">+{fmt(extra)}</span> : null}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[0.95rem] text-ink-soft">{garmentText('tee', locale).fit}</p>
      <p className="mt-1 text-[0.95rem]">
        {SIZE_HELP.note}{' '}
        <Link href={ROUTES.en.returns} className="font-bold text-violet">
          How swaps work
        </Link>
      </p>
    </div>
  );
}

/** Replaces the button once the shirt is in the cart: nothing on the page still says "Add to cart" for it. */
function Added({ title, line, children }: { title: string; line: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-violet bg-white p-4" role="status">
      <p className="flex items-center gap-2.5 text-[1.2rem] font-bold leading-snug">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet text-white">
          <IconCheck className="h-4 w-4" />
        </span>
        {title}
      </p>
      <p className="mt-2">{line}</p>
      <Link href={ROUTES.en.cart} className="btn btn-red mt-3 w-full" data-track="pair-go-to-cart">
        {C.goToCart}
      </Link>
      {children}
    </div>
  );
}

type PdpText = ReturnType<typeof useLocale>['t']['pdp'];

function Facts({ ship, dates, T }: { ship: string; dates: { window: string; holiday: ReturnType<typeof holidayDeadline> } | null; T: PdpText }) {
  return (
    <div className="mt-3 space-y-1 text-center text-[1rem]">
      <p>{ship}</p>
      {dates && (
        <p className="flex items-center justify-center gap-2">
          <IconTruck className="h-5 w-5 text-violet" />
          <span>{T.arrives(dates.window)}</span>
        </p>
      )}
      {dates?.holiday && <p className="font-bold text-red">{T.holiday(dates.holiday.label, dates.holiday.name)}</p>}
    </div>
  );
}
