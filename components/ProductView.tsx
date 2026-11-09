'use client';

// Product page, laid out like a high-converting mobile product page: a headline photo
// first, then who it's for, quick benefits, price, options, bundle tiers, one big button,
// trust badges and a "complete the set" bundle. Stars and crossed-out prices only appear
// when they are real (data/reviews.json, shop.sale in lib/config.ts).

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GARMENTS, GARMENT_KEYS, defaultColor, isAvailable, regularPriceCents, unitPriceCents, type GarmentKey } from '@/lib/catalog';
import { formatPrice, shop } from '@/lib/config';
import { useCart } from '@/lib/cart';
import { bundlePercent, nextBundle } from '@/lib/cart-math';
import { deliveryWindow, holidayDeadline } from '@/lib/dates';
import { DESIGNS, designsInVibe, getDesign, getVibe, isPersonalized, type Design } from '@/lib/designs';
import { defaultValues, getTemplate } from '@/lib/design/templates';
import { validateValues } from '@/lib/design/validate';
import type { FieldDef, FieldValues } from '@/lib/design/types';
import { track } from '@/lib/pixel';
import { productPhotos } from '@/lib/mockups';
import ShirtPreview from './ShirtPreview';
import { IconBrush, IconCalendar, IconCheck, IconFeather, IconLock, IconShield, IconShirt, IconTruck, IconWash, Stars } from './Icons';

type Rating = { average: number; count: number } | null;
type SlideKey = 'hero' | 'front' | 'zoom' | 'alt' | number;

const TIERS = [1, 2, 3];
const SET_PERCENT = bundlePercent(3);

/** Bundle price for n items, rounded the same way as the cart. */
function tierTotal(unit: number, n: number) {
  const sub = unit * n;
  return sub - Math.round((sub * bundlePercent(n)) / 100);
}

/** Two other designs to sell with this one: same vibe, ready to buy without personalizing. */
function companionsFor(design: Design): Design[] {
  const plain = (d: Design) => d.slug !== design.slug && !isPersonalized(d);
  const byFeatured = (a: Design, b: Design) => Number(Boolean(b.featured)) - Number(Boolean(a.featured));
  const same = designsInVibe(design.vibe).filter(plain).sort(byFeatured);
  const other = DESIGNS.filter((d) => plain(d) && d.vibe !== design.vibe && d.featured);
  return [...same, ...other].slice(0, 2);
}

export default function ProductView({ slug, rating = null }: { slug: string; rating?: Rating }) {
  const design = getDesign(slug)!;
  const vibe = getVibe(design.vibe)!;
  const template = getTemplate(slug);
  const personalized = template.fields.length > 0;
  const { add, totals } = useCart();

  const [garment, setGarment] = useState<GarmentKey>('tee');
  const [color, setColor] = useState(() => defaultColor(design, 'tee'));
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [values, setValues] = useState<FieldValues>(() => defaultValues(template));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState<null | 'one' | 'set'>(null);
  const [slide, setSlide] = useState(0);
  const [sticky, setSticky] = useState(false);
  const [setMsg, alertSet] = useState('');
  const [dates, setDates] = useState<{ window: string; holiday: ReturnType<typeof holidayDeadline> } | null>(null);
  const addedRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const g = GARMENTS[garment];
  const photos = productPhotos(slug);
  const companions = useMemo(() => companionsFor(design), [design]);

  // Prefill personalization from the link (e.g. ?nickname=Nana from the home page demo)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const pre: FieldValues = {};
    for (const f of template.fields) {
      const v = q.get(f.key);
      if (v && f.type !== 'names') pre[f.key] = v.slice(0, 40);
    }
    if (Object.keys(pre).length) setValues((cur) => ({ ...cur, ...pre }));
    setDates({ window: deliveryWindow(), holiday: holidayDeadline() });
    track('ViewContent', { content_ids: [slug], content_type: 'product', value: unitPriceCents('tee') / 100, currency: 'USD' });
  }, [slug, template.fields]);

  // Sticky add-to-cart bar on phones whenever the main button is off screen
  useEffect(() => {
    const el = ctaRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setSticky(!e.isIntersecting), { rootMargin: '0px 0px -40px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const check = useMemo(() => validateValues(template, values), [template, values]);
  const price = unitPriceCents(garment, size ?? undefined);
  const regular = regularPriceCents(garment, size ?? undefined);
  const total = tierTotal(price, qty);
  const colorObj = g.colors.find((c) => c.key === color) ?? g.colors[0];
  const altGarment: GarmentKey = garment === 'tee' ? 'hoodie' : 'tee';
  const altColor = GARMENTS[altGarment].colors.some((c) => c.key === color) && isAvailable(altGarment, color) ? color : defaultColor(design, altGarment);
  const plural = (n: number) => (n === 1 ? g.label : `${g.label}s`);
  const pluralLower = garment === 'tee' ? 'T-shirts' : 'hoodies';
  const altName = altGarment === 'tee' ? 'T-shirt' : 'hoodie';

  const slides: SlideKey[] = ['hero', 'front', 'zoom', 'alt', ...photos.map((_, i) => i)];

  function goTo(i: number) {
    const el = trackRef.current;
    if (!el) return;
    const n = Math.max(0, Math.min(slides.length - 1, i));
    el.scrollTo({ left: n * el.clientWidth, behavior: 'smooth' });
    setSlide(n);
  }

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (el && el.clientWidth) setSlide(Math.round(el.scrollLeft / el.clientWidth));
  }, []);

  function pickGarment(k: GarmentKey) {
    setGarment(k);
    const keep = GARMENTS[k].colors.some((c) => c.key === color) && isAvailable(k, color);
    if (!keep) setColor(defaultColor(design, k));
    if (size && !GARMENTS[k].sizes.includes(size)) setSize(null);
  }

  function setField(key: string, v: string | string[]) {
    setValues((cur) => ({ ...cur, [key]: v }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
    setAdded(null);
  }

  /** Personalization and size are filled in; otherwise show what's missing. */
  function ready() {
    if (!check.ok) {
      setErrors(check.errors);
      const el = document.getElementById(`f-${Object.keys(check.errors)[0]}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.focus({ preventScroll: true });
      return false;
    }
    if (!size) {
      setSizeError(true);
      sizeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    return true;
  }

  function showAdded(kind: 'one' | 'set') {
    setAdded(kind);
    setTimeout(() => {
      addedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      addedRef.current?.focus({ preventScroll: true });
    }, 0);
  }

  function addToCart() {
    if (!ready() || !size) return;
    add({ design: slug, garment, color, size, values: check.values, qty });
    track('AddToCart', { content_ids: [slug], content_type: 'product', value: total / 100, currency: 'USD' });
    showAdded('one');
  }

  const setItems = companions.map((d) => ({ d, color: defaultColor(d, garment) }));
  const setSum = price * 3;
  const setTotal = tierTotal(price, 3);

  function addSet() {
    if (!ready() || !size) return;
    const blocked = setItems.find((x) => !isAvailable(garment, x.color, size));
    if (blocked) {
      alertSet(`“${blocked.d.title}” isn’t available in ${size} right now.`);
      return;
    }
    add({ design: slug, garment, color, size, values: check.values, qty: 1 });
    for (const x of setItems) add({ design: x.d.slug, garment, color: x.color, size, values: {}, qty: 1 });
    track('AddToCart', { content_ids: [slug, ...setItems.map((x) => x.d.slug)], content_type: 'product', value: setTotal / 100, currency: 'USD' });
    showAdded('set');
  }
  const next = nextBundle(totals.count);
  const twoFor = shop.bundles.find((b) => b.minItems === 2)?.percent ?? 10;

  const benefits = [
    vibe.occasion,
    personalized ? 'Printed with the name you type – see it live before you order' : 'Big, bold print right across the front',
    garment === 'tee' ? 'Soft, lightweight cotton in a relaxed unisex fit' : 'Warm, cozy fleece with a front pocket and hood',
    `Free US shipping on orders over ${formatPrice(shop.freeShippingFromCents)}`,
  ];

  const features = [
    { Icon: IconFeather, label: garment === 'tee' ? 'Super-soft cotton' : 'Cozy fleece' },
    { Icon: IconShirt, label: garment === 'tee' ? 'Unisex relaxed fit' : 'Unisex classic fit' },
    { Icon: IconBrush, label: 'Printed to order' },
    { Icon: IconWash, label: 'Machine washable' },
  ];

  const sticker = personalized ? ['Add', 'any name'] : [`Buy 2`, `save ${twoFor}%`];

  return (
    <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
      {/* ── Gallery ─────────────────────────────────────────── */}
      <div className="-mx-[1.1rem] min-w-0 md:mx-0 lg:sticky lg:top-6 lg:self-start">
        <div className="relative">
          <div
            ref={trackRef}
            onScroll={onScroll}
            className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto bg-white md:rounded-[1.5rem] md:ring-1 md:ring-lilac-line"
            aria-roledescription="carousel"
            aria-label="Product photos"
          >
            {slides.map((s, i) => (
              <div key={String(s)} className="w-full shrink-0 snap-center" role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${slides.length}`}>
                {s === 'hero' ? (
                  <HeroSlide hook={vibe.hook} tagline={vibe.tagline} sticker={sticker}>
                    <ShirtPreview design={slug} garment={garment} colorKey={color} values={check.values} label={`${design.title} on a ${colorObj.label.toLowerCase()} ${g.label.toLowerCase()}`} className="block h-full w-full" view="main" />
                  </HeroSlide>
                ) : s === 'front' ? (
                  <ShirtPreview design={slug} garment={garment} colorKey={color} values={check.values} label={`Front of the ${g.label.toLowerCase()}`} className="block aspect-square w-full" view="main" />
                ) : s === 'zoom' ? (
                  <ShirtPreview design={slug} garment={garment} colorKey={color} values={check.values} label="Close-up of the print" className="block aspect-square w-full" view="zoom" />
                ) : s === 'alt' ? (
                  <div className="relative">
                    <ShirtPreview design={slug} garment={altGarment} colorKey={altColor} values={check.values} label={`Also as a ${altName}`} className="block aspect-square w-full" view="main" />
                    <button
                      type="button"
                      onClick={() => {
                        pickGarment(altGarment);
                        goTo(0);
                      }} className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-violet px-5 py-2.5 font-bold text-white shadow-lg hover:bg-violet-deep">
                      Also as a {altName} · {formatPrice(unitPriceCents(altGarment))}
                    </button>
                  </div>
                ) : photos[s] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photos[s].src} alt={`${design.title}, example photo`} className="block aspect-square w-full object-cover" loading="lazy" />
                ) : null}
              </div>
            ))}
          </div>
          <button type="button" onClick={() => goTo(slide - 1)} disabled={slide === 0} aria-label="Previous photo" className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-2xl font-bold text-violet shadow-md ring-1 ring-lilac-line disabled:opacity-0 sm:flex">
            ‹
          </button>
          <button type="button" onClick={() => goTo(slide + 1)} disabled={slide === slides.length - 1} aria-label="Next photo" className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-2xl font-bold text-violet shadow-md ring-1 ring-lilac-line disabled:opacity-0 sm:flex">
            ›
          </button>
          <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-ink/75 px-2.5 py-1 text-[0.8rem] font-bold text-white" aria-hidden="true">
            {slide + 1} / {slides.length}
          </span>
        </div>

        <div className="no-scrollbar mt-3 flex gap-2.5 overflow-x-auto px-[1.1rem] py-1 md:px-1" role="group" aria-label="Choose a photo">
          {slides.map((s, i) => (
            <button key={String(s)} type="button" onClick={() => goTo(i)} aria-pressed={slide === i} aria-label={`Photo ${i + 1}`} className={`w-[4.6rem] shrink-0 overflow-hidden rounded-xl bg-white ring-1 sm:w-[5.4rem] ${slide === i ? 'ring-[3px] ring-violet' : 'ring-lilac-line'}`}>
              {s === 'hero' ? (
                <HeroSlide hook={vibe.hook} tagline="" sticker={null} thumb>
                  <ShirtPreview design={slug} garment={garment} colorKey={color} values={check.values} label="" className="block h-full w-full" view="main" />
                </HeroSlide>
              ) : typeof s === 'number' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photos[s]?.src} alt="" className="block aspect-square w-full object-cover" loading="lazy" />
              ) : (
                <ShirtPreview design={slug} garment={s === 'alt' ? altGarment : garment} colorKey={s === 'alt' ? altColor : color} values={check.values} label="" className="block aspect-square w-full" view={s === 'zoom' ? 'zoom' : 'tile'} />
              )}
            </button>
          ))}
        </div>
        <p className="mt-2 px-[1.1rem] text-[0.95rem] text-ink-soft md:px-0">The preview is exactly what we print. Change anything and it updates.</p>
      </div>

      {/* ── Buy box ─────────────────────────────────────────── */}
      <div>
        {rating && (
          <a href="#reviews" className="mb-2 flex items-center gap-2 text-ink no-underline">
            <Stars value={rating.average} className="text-[#E8A317]" />
            <span className="font-bold">{rating.average.toFixed(1)}</span>
            <span className="text-ink-soft underline">
              {rating.count} review{rating.count === 1 ? '' : 's'}
            </span>
          </a>
        )}
        <Link href={`/shop/${vibe.key}/`} className="text-[0.95rem] font-bold uppercase tracking-wide text-violet no-underline hover:underline">
          {vibe.name}
        </Link>
        <h1 className="mt-1 text-[2.1rem] leading-[1.05] sm:text-[2.6rem]">{design.title}</h1>
        <p className="mt-2 text-[1.15rem] font-bold text-red">{vibe.tagline}</p>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-[2rem] font-black leading-none">
            {shop.sale && <span className="sr-only">Sale price </span>}
            {formatPrice(price)}
          </span>
          {shop.sale && (
            <s className="text-[1.15rem] text-ink-soft">
              <span className="sr-only">Regular price </span>
              {formatPrice(regular)}
            </s>
          )}
          <span className="rounded-full bg-red px-3 py-1 text-[0.92rem] font-bold text-white">
            {shop.sale ? `${shop.sale.label}: ${shop.sale.percent}% off${shop.sale.ends ? ` – ends ${shop.sale.ends}` : ''}` : `Buy 2, save ${twoFor}%`}
          </span>
        </div>

        <ul className="mt-5 space-y-2.5">
          {benefits.map((b) => (
            <li key={b} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red text-white">
                <IconCheck className="h-3.5 w-3.5" />
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <ul className="mt-6 grid grid-cols-4 gap-2 rounded-2xl bg-lilac p-3 text-center">
          {features.map(({ Icon, label }) => (
            <li key={label} className="flex flex-col items-center gap-1.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-violet">
                <Icon className="h-6 w-6" />
              </span>
              <span className="text-[0.8rem] font-bold leading-tight sm:text-[0.86rem]">{label}</span>
            </li>
          ))}
        </ul>

        {personalized && (
          <fieldset className="mt-7 rounded-2xl border-2 border-violet bg-white p-4 sm:p-5">
            <legend className="sr-only">Personalize it</legend>
            <p className="font-display text-[1.45rem] font-black text-violet">Personalize it</p>
            <p className="text-[0.95rem] text-ink-soft">Free. The photos update as you type.</p>
            <div className="mt-3 space-y-4">
              {template.fields.map((f) => (
                <Field key={f.key} f={f} value={values[f.key]} error={errors[f.key]} onChange={(v) => setField(f.key, v)} />
              ))}
            </div>
          </fieldset>
        )}

        <div className="mt-7">
          <p className="font-bold" id="style-label">Style</p>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-labelledby="style-label">
            {GARMENT_KEYS.map((k) => (
              <button key={k} type="button" role="radio" aria-checked={garment === k} className="chip gap-2" onClick={() => pickGarment(k)}>
                {GARMENTS[k].label}
                <span className="font-medium opacity-80">{formatPrice(unitPriceCents(k))}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="font-bold" id="color-label">
            Color: <span className="font-medium">{colorObj.label}</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-2.5" role="radiogroup" aria-labelledby="color-label">
            {g.colors
              .filter((c) => isAvailable(garment, c.key))
              .map((c) => (
                <button
                  key={c.key}
                  type="button"
                  role="radio"
                  aria-checked={color === c.key}
                  aria-label={c.label}
                  title={c.label}
                  onClick={() => setColor(c.key)}
                  className={`h-11 w-11 rounded-full border-2 ${color === c.key ? 'border-violet ring-2 ring-violet ring-offset-2' : 'border-lilac-line'}`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
          </div>
        </div>

        <div className="mt-6 scroll-mt-24" ref={sizeRef}>
          <div className="flex items-baseline justify-between gap-4">
            <p className="font-bold" id="size-label">
              Size{size ? <span className="font-medium">: {size}</span> : null}
            </p>
            <SizeGuide garment={garment} />
          </div>
          <div className={`mt-2 flex flex-wrap gap-2 rounded-2xl ${sizeError ? 'p-2 ring-2 ring-red' : ''}`} role="radiogroup" aria-labelledby="size-label" aria-describedby={sizeError ? 'size-error' : undefined}>
            {g.sizes.map((s) => {
              const ok = isAvailable(garment, color, s);
              const extra = g.sizeExtraCents[s];
              return (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={size === s}
                  disabled={!ok}
                  className="chip flex-col leading-tight"
                  onClick={() => {
                    setSize(s);
                    setSizeError(false);
                    alertSet('');
                  }}
                >
                  {s}
                  {extra ? <span className="text-[0.72rem] font-medium opacity-80">+{formatPrice(extra)}</span> : null}
                </button>
              );
            })}
          </div>
          {sizeError && (
            <p id="size-error" className="mt-2 font-bold text-red">
              Pick a size first.
            </p>
          )}
          <p className="mt-2 text-[0.95rem] text-ink-soft">{g.fit}</p>
        </div>

        <fieldset className="mt-7">
          <legend className="font-bold">Bundle &amp; save</legend>
          <div className="mt-2 space-y-2.5">
            {TIERS.map((n) => {
              const pct = bundlePercent(n);
              const t = tierTotal(price, n);
              const on = qty === n;
              return (
                <label key={n} className={`relative flex cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3.5 ${on ? 'border-violet bg-lilac' : 'border-lilac-line bg-white hover:border-violet'}`}>
                  <input type="radio" name="tier" checked={on} onChange={() => setQty(n)} className="h-5 w-5 shrink-0 accent-violet" />
                  <span className="flex-1">
                    <span className="font-bold">
                      {n} {plural(n)}
                    </span>
                    {pct > 0 && <span className="ml-2 rounded-full bg-red px-2 py-0.5 text-[0.78rem] font-bold text-white">Save {pct}%</span>}
                    <span className="block text-[0.92rem] text-ink-soft">{n === 1 ? 'Just this one' : `${formatPrice(Math.round(t / n))} each`}</span>
                  </span>
                  <span className="text-right leading-tight">
                    <span className="block text-[1.15rem] font-black">{formatPrice(t)}</span>
                    {pct > 0 && (
                      <s className="text-[0.9rem] text-ink-soft">
                        <span className="sr-only">without the saving </span>
                        {formatPrice(price * n)}
                      </s>
                    )}
                  </span>
                  {n === TIERS[TIERS.length - 1] && <span className="absolute -top-2.5 right-4 rounded-full bg-violet px-2.5 py-0.5 text-[0.72rem] font-bold uppercase tracking-wide text-white">Best value</span>}
                </label>
              );
            })}
          </div>
          <p className="mt-2 text-[0.92rem] text-ink-soft">Same size for each. Mixing sizes or designs? Add them one by one – the saving still counts in your cart.</p>
        </fieldset>

        <button ref={ctaRef} type="button" className="btn btn-red mt-6 min-h-[4rem] w-full text-[1.2rem] shadow-[0_6px_0_var(--color-red-deep)] active:shadow-none" onClick={addToCart}>
          Add to cart – {formatPrice(total)}
        </button>

        <div className="mt-3 space-y-1 text-center text-[1rem]">
          {dates && (
            <p className="flex items-center justify-center gap-2">
              <IconTruck className="h-5 w-5 text-violet" />
              <span>
                Order today, arrives <strong>about {dates.window}</strong>
              </span>
            </p>
          )}
          {dates?.holiday && (
            <p className="font-bold text-red">
              Order by {dates.holiday.label} for {dates.holiday.name} delivery
            </p>
          )}
        </div>

        {added && (
          <div ref={addedRef} tabIndex={-1} className="mt-4 rounded-2xl border-2 border-violet bg-white p-4 outline-none" role="status">
            <p className="font-bold">{added === 'set' ? 'All 3 added to your cart.' : 'Added to your cart.'}</p>
            {next ? (
              <p className="mt-1 text-ink-soft">
                Add {next.minItems - totals.count} more and save {next.percent}% on everything.
              </p>
            ) : (
              <p className="mt-1 text-ink-soft">Your bundle saving is applied in the cart.</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/cart/" className="btn btn-violet">
                View cart
              </Link>
              <Link href={`/shop/${vibe.key}/`} className="btn btn-line">
                Keep shopping
              </Link>
            </div>
          </div>
        )}

        <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-lilac-line py-5 text-[0.9rem]">
          <Trust Icon={IconLock} title="Secure checkout" text="Apple Pay, Google Pay and cards" />
          <Trust Icon={IconTruck} title="Free shipping" text={`On US orders over ${formatPrice(shop.freeShippingFromCents)}`} />
          <Trust Icon={IconShield} title="Misprint? Free fix" text={<>We replace or refund it. <Link href="/returns/">Details</Link></>} />
          <Trust Icon={IconCalendar} title="Made for you" text="Printed in 2–5 days, shipped with tracking" />
        </ul>

        {setItems.length === 2 && (
          <section className="mt-7 rounded-[1.5rem] bg-lilac p-4 sm:p-5" aria-labelledby="set-title">
            <h2 id="set-title" className="text-[1.5rem] leading-tight sm:text-[1.7rem]">
              Complete the set <span className="text-red">– save {SET_PERCENT}%</span>
            </h2>
            <p className="mt-1 text-[0.95rem] text-ink-soft">
              This one plus two more favorites, all as {pluralLower}{size ? ` in ${size}` : ''}.
            </p>
            <div className="mt-4 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-start gap-1.5">
              {[{ d: design, color }, ...setItems].map((x, i) => (
                <SetTile key={x.d.slug} plus={i > 0}>
                  {i === 0 ? (
                    <div className="overflow-hidden rounded-xl bg-white ring-1 ring-lilac-line">
                      <ShirtPreview design={x.d.slug} garment={garment} colorKey={x.color} values={check.values} label={`${x.d.title} (this one)`} className="block aspect-square w-full" view="tile" />
                    </div>
                  ) : (
                    <Link href={`/p/${x.d.slug}/`} className="block overflow-hidden rounded-xl bg-white ring-1 ring-lilac-line hover:ring-violet">
                      <ShirtPreview design={x.d.slug} garment={garment} colorKey={x.color} values={defaultValues(getTemplate(x.d.slug))} label={x.d.title} className="block aspect-square w-full" view="tile" />
                    </Link>
                  )}
                  <p className="mt-1.5 text-[0.82rem] font-bold leading-tight">{i === 0 ? 'This one' : x.d.title}</p>
                </SetTile>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="leading-tight">
                <span className="block text-[0.9rem] text-ink-soft">
                  <s>
                    <span className="sr-only">Bought separately </span>
                    {formatPrice(setSum)}
                  </s>{' '}
                  separately
                </span>
                <span className="text-[1.5rem] font-black">{formatPrice(setTotal)}</span> <span className="font-bold text-red">for all 3</span>
              </p>
              <button type="button" className="btn btn-violet" onClick={addSet}>
                Add all 3 to cart
              </button>
            </div>
            {setMsg && <p className="mt-2 font-bold text-red">{setMsg}</p>}
          </section>
        )}

        <div className="mt-8 divide-y divide-lilac-line border-y border-lilac-line">
          <Details title="About this design" open>
            <p>{design.blurb}</p>
          </Details>
          <Details title="Fabric & fit">
            <p>
              {g.model}. {g.material}.
            </p>
            <p className="mt-2">{g.fit}</p>
          </Details>
          <Details title="Care">
            <ul className="list-disc pl-5">
              {g.care.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </Details>
          <Details title="Shipping">
            <p>
              Every shirt is printed to order, usually within 2–5 business days, then shipped with tracking. Most orders arrive {shop.deliveryMinDays}–{shop.deliveryMaxDays} business days after you order. We ship
              within the US.
            </p>
          </Details>
          <Details title="Returns & replacements">
            <p>
              If your order arrives damaged, misprinted or wrong, tell us within 30 days and we’ll send a replacement or refund it. Because each shirt is made just for you, we can’t take back items for a change of mind
              or the wrong size, so please check the size guide. <Link href="/returns/">Full policy</Link>
            </p>
          </Details>
        </div>
      </div>

      {/* ── Sticky add-to-cart on phones ───────────────────── */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-lilac-line bg-white/95 px-4 pt-3 shadow-[0_-6px_20px_rgba(30,22,38,.12)] backdrop-blur transition-transform duration-200 lg:hidden ${sticky ? 'translate-y-0' : 'pointer-events-none translate-y-full'}`}
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        aria-hidden={!sticky}
      >
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate font-bold">{design.title}</p>
            <p className="text-[0.95rem] text-ink-soft">
              {formatPrice(total)}
              {qty > 1 ? ` for ${qty}` : ''}
              {size ? ` · ${size}` : ''}
            </p>
          </div>
          <button type="button" tabIndex={sticky ? 0 : -1} className="btn btn-red min-h-[3.2rem] shrink-0 px-5" onClick={addToCart}>
            {size ? 'Add to cart' : 'Choose size'}
          </button>
        </div>
      </div>
    </div>
  );
}

/** First photo: a headline over the shirt, like the opening frame of an ad. Scales with its box. */
function HeroSlide({ hook, tagline, sticker, thumb, children }: { hook: string; tagline: string; sticker: string[] | null; thumb?: boolean; children: React.ReactNode }) {
  return (
    <div className="@container relative aspect-square w-full overflow-hidden bg-white">
      <div className="absolute bottom-[-4%] left-[12%] aspect-square w-[76%] overflow-hidden">{children}</div>
      <div className="absolute inset-x-[6%] top-[5.5%]">
        <p className={`font-display font-black leading-[0.98] tracking-[-0.01em] text-violet ${thumb ? 'text-[10.5cqw]' : 'text-[8.6cqw]'}`}>{hook}</p>
        {tagline && <p className="mt-[1.6cqw] text-[4.1cqw] font-bold text-red">{tagline}</p>}
      </div>
      {sticker && (
        <span className="absolute bottom-[7%] left-[5%] flex h-[23cqw] w-[23cqw] rotate-[-10deg] flex-col items-center justify-center rounded-full bg-red text-center leading-[1.05] text-white shadow-lg" aria-hidden="true">
          <span className="text-[5.4cqw] font-black">{sticker[0]}</span>
          <span className="text-[3.4cqw] font-bold">{sticker[1]}</span>
        </span>
      )}
    </div>
  );
}

function SetTile({ plus, children }: { plus: boolean; children: React.ReactNode }) {
  return (
    <>
      {plus && (
        <span className="mt-[38%] text-center text-xl font-black text-violet" aria-hidden="true">
          +
        </span>
      )}
      <div>{children}</div>
    </>
  );
}

function Trust({ Icon, title, text }: { Icon: (p: { className?: string }) => React.ReactNode; title: string; text: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <Icon className="mt-0.5 h-6 w-6 shrink-0 text-violet" />
      <span className="leading-snug">
        <span className="block font-bold">{title}</span>
        <span className="text-ink-soft">{text}</span>
      </span>
    </li>
  );
}

function Details({ title, open, children }: { title: string; open?: boolean; children: React.ReactNode }) {
  return (
    <details className="group py-1" open={open}>
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between font-bold [&::-webkit-details-marker]:hidden">
        {title}
        <span className="text-2xl leading-none text-violet transition group-open:rotate-45" aria-hidden="true">
          +
        </span>
      </summary>
      <div className="pb-4 text-ink-soft">{children}</div>
    </details>
  );
}

function SizeGuide({ garment }: { garment: GarmentKey }) {
  const ref = useRef<HTMLDialogElement>(null);
  const g = GARMENTS[garment];
  return (
    <>
      <button type="button" className="font-bold text-violet underline" onClick={() => ref.current?.showModal()}>
        Size guide
      </button>
      <dialog ref={ref} className="m-auto w-[min(32rem,92vw)] rounded-2xl p-0 backdrop:bg-ink/50" onClick={(e) => e.target === ref.current && ref.current?.close()}>
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-[1.6rem]">{g.label} sizes</h2>
            <button type="button" className="-mr-2 -mt-1 h-11 w-11 rounded-full text-2xl hover:bg-lilac" onClick={() => ref.current?.close()} aria-label="Close size guide">
              ×
            </button>
          </div>
          <p className="mt-2 text-ink-soft">Measured laid flat, in inches. Compare with a shirt you already love.</p>
          <table className="mt-4 w-full text-left">
            <thead>
              <tr className="border-b-2 border-lilac-line">
                <th className="py-2">Size</th>
                <th className="py-2">Chest width</th>
                <th className="py-2">Length</th>
              </tr>
            </thead>
            <tbody>
              {g.sizeChart.map((r) => (
                <tr key={r.size} className="border-b border-lilac-line">
                  <td className="py-2 font-bold">{r.size}</td>
                  <td className="py-2">{r.width}″</td>
                  <td className="py-2">{r.length}″</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-[0.95rem] text-ink-soft">{g.fit}</p>
        </div>
      </dialog>
    </>
  );
}

function Field({ f, value, error, onChange }: { f: FieldDef; value: string | string[] | undefined; error?: string; onChange: (v: string | string[]) => void }) {
  const id = `f-${f.key}`;
  const help = f.help ? `${id}-help` : undefined;
  const err = error ? `${id}-err` : undefined;
  const describedBy = [help, err].filter(Boolean).join(' ') || undefined;

  let control: React.ReactNode;
  if (f.type === 'names') {
    const list = Array.isArray(value) ? value : [];
    control = (
      <div className="space-y-2">
        {list.map((n, i) => (
          <div key={i} className="flex gap-2">
            <input
              id={i === 0 ? id : undefined}
              className="field"
              value={n}
              maxLength={f.maxLength}
              placeholder={f.placeholder ?? 'Name'}
              aria-label={`Name ${i + 1}`}
              aria-invalid={Boolean(error)}
              aria-describedby={describedBy}
              onChange={(e) => onChange(list.map((x, j) => (j === i ? e.target.value : x)))}
            />
            {list.length > 1 && (
              <button type="button" className="h-[3.2rem] w-12 shrink-0 rounded-xl bg-white text-xl ring-2 ring-lilac-line hover:ring-violet" onClick={() => onChange(list.filter((_, j) => j !== i))} aria-label={`Remove ${n || `name ${i + 1}`}`}>
                ×
              </button>
            )}
          </div>
        ))}
        {list.length < f.max && (
          <button type="button" className="font-bold text-violet underline" onClick={() => onChange([...list, ''])}>
            Add another name
          </button>
        )}
      </div>
    );
  } else if (f.type === 'select') {
    control = (
      <select id={id} className="field" value={String(value ?? f.default)} onChange={(e) => onChange(e.target.value)} aria-describedby={describedBy}>
        {f.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  } else {
    const numeric = f.type === 'year' || f.type === 'number';
    control = (
      <input
        id={id}
        className="field"
        value={String(value ?? '')}
        inputMode={numeric ? 'numeric' : undefined}
        maxLength={f.type === 'year' ? 4 : f.type === 'number' ? 3 : f.maxLength}
        placeholder={f.type === 'text' ? f.placeholder : undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        onChange={(e) => onChange(numeric ? e.target.value.replace(/\D/g, '') : e.target.value)}
      />
    );
  }

  return (
    <div>
      <label htmlFor={id} className="block font-bold">
        {f.label}
      </label>
      {f.help && (
        <p id={help} className="text-[0.95rem] text-ink-soft">
          {f.help}
        </p>
      )}
      <div className="mt-1.5">{control}</div>
      {error && (
        <p id={err} className="mt-1.5 font-bold text-red">
          {error}
        </p>
      )}
    </div>
  );
}
