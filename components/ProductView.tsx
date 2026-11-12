'use client';

// Product page. Most visitors land here from a Facebook ad on a phone, inside Facebook's own
// (short) browser, so the order is: photo, name, price, then straight to style / colour / size
// and one big button. The reasons to believe (benefits, trust, the set, details) come after it.
// Session recordings (Nov 2026) showed nobody scrolled when the first screen was only a photo
// and a sticky bar, with the size picker three screens down.
// Stars and crossed-out prices only appear when they are real (data/reviews.json, the store's
// sale switch in lib/config.ts).

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { trackEvent } from '@/lib/analytics';
import { OrderSteps, PaymentLogos, PromiseNote } from './Trust';
import { SIZE_HELP } from '@/lib/promise';
import { useConsent } from '@/lib/consent';
import { GARMENTS, GARMENT_KEYS, colorLabel, defaultColor, garmentText, isAvailable, regularPriceCents, sizeExtraCents, unitPriceCents, type GarmentKey } from '@/lib/catalog';
import { legalDe } from '@/lib/config';
import { useLocale } from '@/lib/i18n';
import { ROUTES, productPath, shopPath, type Locale } from '@/lib/locale';
import { useCart } from '@/lib/cart';
import { bundlePercent, nextBundle, shippingFor } from '@/lib/cart-math';
import { deliveryWindow, holidayDeadline } from '@/lib/dates';
import { designsFor, designsInVibe, getDesign, getVibe, isPersonalized, type Design } from '@/lib/designs';
import { defaultValues, getTemplate } from '@/lib/design/templates';
import { validateValues } from '@/lib/design/validate';
import type { FieldDef, FieldValues } from '@/lib/design/types';
import { track } from '@/lib/pixel';
import { productPhotos } from '@/lib/mockups';
import { modelPhotos, type ModelPhoto } from '@/lib/model-photos';
import ShirtPreview from './ShirtPreview';
import { IconBrush, IconCalendar, IconCheck, IconFeather, IconLock, IconShield, IconShirt, IconTruck, IconWash, Stars } from './Icons';

type Rating = { average: number; count: number } | null;
type SlideKey = 'hero' | 'front' | 'zoom' | 'alt' | number;

const TIERS = [1, 2, 3];
/** Bundle price for n items, rounded the same way as the cart. */
function tierTotal(unit: number, n: number, locale: Locale) {
  const sub = unit * n;
  return sub - Math.round((sub * bundlePercent(n, locale)) / 100);
}

/** Two other designs to sell with this one: same vibe, ready to buy without personalizing. */
function companionsFor(design: Design, locale: Locale): Design[] {
  const plain = (d: Design) => d.slug !== design.slug && !isPersonalized(d);
  const byFeatured = (a: Design, b: Design) => Number(Boolean(b.featured)) - Number(Boolean(a.featured));
  const same = designsInVibe(design.vibe).filter(plain).sort(byFeatured);
  const other = designsFor(locale).filter((d) => plain(d) && d.vibe !== design.vibe && d.featured);
  return [...same, ...other].slice(0, 2);
}

export default function ProductView({ slug, rating = null }: { slug: string; rating?: Rating }) {
  const design = getDesign(slug)!;
  const vibe = getVibe(design.vibe)!;
  const template = getTemplate(slug);
  const personalized = template.fields.length > 0;
  const { add, totals } = useCart();
  const { locale, t: M, store, price: fmt } = useLocale();
  const T = M.pdp;
  const SET_PERCENT = bundlePercent(3, locale);

  const { marketing } = useConsent();
  const [garment, setGarment] = useState<GarmentKey>('tee');
  const [color, setColor] = useState(() => defaultColor(design, 'tee', locale));
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [values, setValues] = useState<FieldValues>(() => defaultValues(template));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState<null | 'one' | 'set'>(null);
  const [slide, setSlide] = useState(0);
  // Where the main button is: on screen, further down, or scrolled past
  const [ctaPos, setCtaPos] = useState<'visible' | 'below' | 'above'>('below');
  const [sizeNudge, setSizeNudge] = useState(false);
  // On a phone only the first photo loads with the page; the first screen (photo, name, price) must
  // not queue behind pictures she hasn't asked for. `reach` is how far the gallery is filled in:
  // the next photo once the page has settled, then always one ahead of where she has swiped.
  const [reach, setReach] = useState(0);
  const [wide, setWide] = useState(false);
  const [setMsg, alertSet] = useState('');
  const [dates, setDates] = useState<{ window: string; holiday: ReturnType<typeof holidayDeadline> } | null>(null);
  const addedRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const g = GARMENTS[garment];
  // Model photos first, then Printful photos; slides refer to them by index.
  const model = modelPhotos(slug);
  const photos: ModelPhoto[] = [...model, ...productPhotos(slug)];
  const companions = useMemo(() => companionsFor(design, locale), [design, locale]);

  // Prefill personalization from the link (e.g. ?nickname=Nana from the home page demo)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const pre: FieldValues = {};
    for (const f of template.fields) {
      const v = q.get(f.key);
      if (v && f.type !== 'names') pre[f.key] = v.slice(0, 40);
    }
    if (Object.keys(pre).length) setValues((cur) => ({ ...cur, ...pre }));
    setDates({ window: deliveryWindow(locale), holiday: holidayDeadline(locale) });
  }, [slug, template.fields, locale]);

  // Waits for the visitor's tracking choice: the pixel isn't on the page yet when this component first mounts,
  // so firing straight away would lose the view for anyone who lands directly on a product page (e.g. from an ad).
  useEffect(() => {
    if (!marketing) return;
    track('ViewContent', { content_ids: [slug], content_type: 'product', value: unitPriceCents('tee', undefined, locale, slug) / 100, currency: store.currency });
  }, [marketing, slug, locale, store.currency]);

  // Sticky add-to-cart bar on phones. Not on arrival: there it covered the photo and made the page
  // look finished. It shows once she has scrolled past the main button, or has picked a size.
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    let frame = 0;
    // Measured on scroll (not IntersectionObserver): a fast flick can jump straight past the button
    const measure = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      setCtaPos(r.bottom < 0 ? 'above' : r.top > window.innerHeight - 40 ? 'below' : 'visible');
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    let timer = 0;
    const settled = () => {
      timer = window.setTimeout(() => setReach((r) => Math.max(r, 1)), 1500);
    };
    if (document.readyState === 'complete') settled();
    else window.addEventListener('load', settled, { once: true });
    return () => {
      mq.removeEventListener('change', sync);
      window.removeEventListener('load', settled);
      window.clearTimeout(timer);
    };
  }, []);
  /** Has this photo been asked for yet? Desktop shows the thumbnail strip, so all of them. */
  const filled = (i: number) => wide || i <= reach;

  const sticky = ctaPos === 'above' || (ctaPos === 'below' && size !== null);
  const check = useMemo(() => validateValues(template, values, locale), [template, values, locale]);
  const price = unitPriceCents(garment, size ?? undefined, locale, slug);
  const regular = regularPriceCents(garment, size ?? undefined, locale, slug);
  const total = tierTotal(price, qty, locale);
  const ship = shippingFor(total, locale, garment === 'hoodie');
  const gt = garmentText(garment, locale);
  const colorObj = g.colors.find((c) => c.key === color) ?? g.colors[0];
  const altGarment: GarmentKey = garment === 'tee' ? 'hoodie' : 'tee';
  const altColor = GARMENTS[altGarment].colors.some((c) => c.key === color) && isAvailable(altGarment, color, undefined, locale) ? color : defaultColor(design, altGarment, locale);
  const pluralLower = T.plural(garment);
  const altName = T.single(altGarment);

  // A model photo leads when there is one; the headline slide follows.
  const extra = photos.map((_, i) => i).filter((i) => i > 0 || !model.length);
  const slides: SlideKey[] = [...(model.length ? [0] : []), 'hero', 'front', 'zoom', 'alt', ...extra];

  function goTo(i: number) {
    const el = trackRef.current;
    if (!el) return;
    const n = Math.max(0, Math.min(slides.length - 1, i));
    setReach((r) => Math.max(r, n + 1));
    el.scrollTo({ left: n * el.clientWidth, behavior: 'smooth' });
    setSlide(n);
    trackEvent('PhotoViewed', { product: slug, photo: n + 1 });
  }

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el || !el.clientWidth) return;
    setSlide(Math.round(el.scrollLeft / el.clientWidth));
    // ceil: as soon as a swipe starts, the photo after the one coming in is fetched too
    setReach((r) => Math.max(r, Math.ceil(el.scrollLeft / el.clientWidth) + 1));
  }, []);

  function pickGarment(k: GarmentKey) {
    setGarment(k);
    trackEvent('GarmentSelected', { product: slug, garment: k });
    const keep = GARMENTS[k].colors.some((c) => c.key === color) && isAvailable(k, color, undefined, locale);
    if (!keep) setColor(defaultColor(design, k, locale));
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
      trackEvent('AddToCartBlocked', { product: slug, reason: 'missing_personalization', fields: Object.keys(check.errors).join(',') });
      setErrors(check.errors);
      const el = document.getElementById(`f-${Object.keys(check.errors)[0]}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.focus({ preventScroll: true });
      return false;
    }
    if (!size) {
      trackEvent('AddToCartBlocked', { product: slug, reason: 'no_size_chosen' });
      setSizeError(true);
      sizeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    return true;
  }

  /** "Choose size" in the sticky bar: take her to the sizes, without an error message. */
  function jumpToSize() {
    setSizeNudge(true);
    sizeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    track('AddToCart', { content_ids: [slug], content_type: 'product', value: total / 100, currency: store.currency });
    showAdded('one');
  }

  const setItems = companions.map((d) => ({ d, color: defaultColor(d, garment, locale) }));
  const setSum = price * 3;
  const setTotal = tierTotal(price, 3, locale);

  function addSet() {
    if (!ready() || !size) return;
    const blocked = setItems.find((x) => !isAvailable(garment, x.color, size, locale));
    if (blocked) {
      trackEvent('AddToCartBlocked', { product: slug, reason: 'set_item_unavailable', size });
      alertSet(T.notAvailable(blocked.d.title, size));
      return;
    }
    add({ design: slug, garment, color, size, values: check.values, qty: 1 });
    for (const x of setItems) add({ design: x.d.slug, garment, color: x.color, size, values: {}, qty: 1 });
    track('AddToCart', { content_ids: [slug, ...setItems.map((x) => x.d.slug)], content_type: 'product', value: setTotal / 100, currency: store.currency });
    showAdded('set');
  }
  const next = nextBundle(totals.count, locale);
  const twoFor = store.bundles.find((b) => b.minItems === 2)?.percent ?? 10;

  const benefits = [
    vibe.occasion,
    personalized ? T.benefitName : T.benefitPrint,
    T.benefitFabric(garment),
    locale === 'en' && garment === 'hoodie' ? 'Free US shipping on every hoodie' : T.benefitShipping(fmt(store.freeShippingFromCents)),
  ];

  const featureText = T.features(garment);
  const features = [IconFeather, IconShirt, IconBrush, IconWash].map((Icon, i) => ({ Icon, label: featureText[i] }));

  const sticker = personalized ? T.stickerName : T.stickerBundle(twoFor);
  const cLabel = colorLabel(colorObj, locale);

  return (
    <div className="grid grid-cols-1 gap-4 md:gap-7 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
      {/* ── Gallery ─────────────────────────────────────────── */}
      <div className="-mx-[1.1rem] min-w-0 md:mx-0 lg:sticky lg:top-6 lg:self-start">
        <div className="relative">
          <div
            ref={trackRef}
            onScroll={onScroll}
            onPointerDown={() => setReach((r) => Math.max(r, 1))}
            onTouchStart={() => setReach((r) => Math.max(r, 1))}
            className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto bg-white md:rounded-[1.5rem] md:ring-1 md:ring-lilac-line"
            aria-roledescription="carousel"
            aria-label={T.photos}
          >
            {slides.map((s, i) => (
              <div key={String(s)} className="pdp-slide w-full shrink-0 snap-center" role="group" aria-roledescription="slide" aria-label={T.slideOf(i + 1, slides.length)}>
                {!filled(i) ? null : s === 'hero' ? (
                  <div className="mx-auto aspect-square h-full">
                    <HeroSlide hook={vibe.hook} tagline={vibe.tagline} sticker={sticker}>
                      <ShirtPreview design={slug} garment={garment} colorKey={color} values={check.values} label={T.heroLabel(design.title, cLabel, gt.label)} className="block h-full w-full" view="main" />
                    </HeroSlide>
                  </div>
                ) : s === 'front' ? (
                  <ShirtPreview design={slug} garment={garment} colorKey={color} values={check.values} label={T.front(gt.label)} className="block h-full w-full" view="main" />
                ) : s === 'zoom' ? (
                  <ShirtPreview design={slug} garment={garment} colorKey={color} values={check.values} label={T.closeUp} className="block h-full w-full" view="zoom" />
                ) : s === 'alt' ? (
                  <div className="relative h-full">
                    <ShirtPreview design={slug} garment={altGarment} colorKey={altColor} values={check.values} label={T.alsoAs(altName)} className="block h-full w-full" view="main" />
                    <button
                      type="button"
                      onClick={() => {
                        pickGarment(altGarment);
                        goTo(slides.indexOf('hero'));
                      }} className="absolute bottom-14 left-1/2 min-h-12 -translate-x-1/2 whitespace-nowrap rounded-full bg-violet px-5 py-2.5 font-bold text-white shadow-lg hover:bg-violet-deep md:bottom-4">
                      {T.alsoAs(altName)} · {fmt(unitPriceCents(altGarment, undefined, locale, slug))}
                    </button>
                  </div>
                ) : photos[s] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photos[s].src} srcSet={photos[s].srcSet} sizes="(min-width: 1024px) 50vw, 100vw" alt={T.examplePhoto(design.title)} className="block h-full w-full object-cover object-top" loading={i === 0 ? 'eager' : 'lazy'} fetchPriority={i === 0 ? 'high' : undefined} />
                ) : null}
              </div>
            ))}
          </div>
          <button type="button" onClick={() => goTo(slide - 1)} disabled={slide === 0} aria-label={T.prev} className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-2xl font-bold text-violet shadow-md ring-1 ring-lilac-line disabled:opacity-0 md:left-3">
            ‹
          </button>
          <button type="button" onClick={() => goTo(slide + 1)} disabled={slide === slides.length - 1} aria-label={T.next} className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-2xl font-bold text-violet shadow-md ring-1 ring-lilac-line disabled:opacity-0 md:right-3">
            ›
          </button>
          <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-ink/75 px-2.5 py-1 text-[0.85rem] font-bold text-white" aria-hidden="true">
            {slide + 1} / {slides.length}
          </span>
        </div>

        {/* Thumbnails are for tablets and desktops; phones swipe (and skip the downloads). */}
        <div className="no-scrollbar mt-3 hidden gap-2.5 overflow-x-auto px-[1.1rem] py-1 md:flex md:min-h-[6.15rem] md:px-1" role="group" aria-label={T.choosePhoto}>
          {wide &&
            slides.map((s, i) => (
            <button key={String(s)} type="button" onClick={() => goTo(i)} aria-pressed={slide === i} aria-label={T.photoN(i + 1)} className={`w-[4.6rem] shrink-0 overflow-hidden rounded-xl bg-white ring-1 sm:w-[5.4rem] ${slide === i ? 'ring-[3px] ring-violet' : 'ring-lilac-line'}`}>
              {s === 'hero' ? (
                <HeroSlide hook={vibe.hook} tagline="" sticker={null} thumb>
                  <ShirtPreview design={slug} garment={garment} colorKey={color} values={check.values} label="" className="block h-full w-full" view="main" />
                </HeroSlide>
              ) : typeof s === 'number' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photos[s]?.src} srcSet={photos[s]?.srcSet} sizes="90px" alt="" className="block aspect-square w-full object-cover" loading="lazy" />
              ) : (
                <ShirtPreview design={slug} garment={s === 'alt' ? altGarment : garment} colorKey={s === 'alt' ? altColor : color} values={check.values} label="" className="block aspect-square w-full" view={s === 'zoom' ? 'zoom' : 'tile'} />
              )}
            </button>
          ))}
        </div>
        <p className={`mt-2 px-[1.1rem] text-[0.95rem] text-ink-soft md:block md:px-0 ${personalized ? '' : 'hidden'}`}>{T.previewNote}</p>
      </div>

      {/* ── Buy box ─────────────────────────────────────────── */}
      <div>
        {rating && (
          <a href="#reviews" className="mb-2 flex items-center gap-2 text-ink no-underline">
            <Stars value={rating.average} className="text-[#E8A317]" />
            <span className="font-bold">{rating.average.toFixed(1)}</span>
            <span className="text-ink-soft underline">{T.reviews(rating.count)}</span>
          </a>
        )}
        <Link href={shopPath(locale, vibe.key)} className="hidden text-[0.95rem] font-bold uppercase tracking-wide text-violet no-underline hover:underline md:inline-block">
          {vibe.name}
        </Link>
        <h1 className="text-[1.65rem] leading-[1.08] md:mt-1 md:text-[2.6rem] md:leading-[1.05]">{design.title}</h1>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-[2rem] font-black leading-none">
            {store.sale && <span className="sr-only">{T.salePrice}</span>}
            {fmt(price)}
          </span>
          {store.sale && (
            <s className="text-[1.15rem] text-ink-soft">
              <span className="sr-only">{T.regularPrice}</span>
              {fmt(regular)}
            </s>
          )}
          <span className="rounded-full bg-red px-3 py-1 text-[0.92rem] font-bold text-white">
            {store.sale ? T.saleBadge(store.sale.label, store.sale.percent, store.sale.ends) : T.buy2Badge(twoFor)}
          </span>
        </div>
        {store.vatIncluded && (
          <p className="mt-2 text-[0.92rem] text-ink-soft">
            inkl. MwSt., zzgl. <Link href={ROUTES.de.shipping}>Versand</Link>
          </p>
        )}
        <p className="mt-2.5 text-[1.1rem] font-bold leading-snug text-red">{vibe.tagline}</p>

        {personalized && (
          <fieldset className="mt-5 rounded-2xl border-2 border-violet bg-white p-4 sm:p-5">
            <legend className="sr-only">{T.personalize}</legend>
            <p className="font-display text-[1.45rem] font-black text-violet">{T.personalize}</p>
            <p className="text-[0.95rem] text-ink-soft">{T.personalizeNote}</p>
            <div className="mt-3 space-y-4">
              {template.fields.map((f) => (
                <Field key={f.key} f={f} value={values[f.key]} error={errors[f.key]} onChange={(v) => setField(f.key, v)} T={T} />
              ))}
            </div>
          </fieldset>
        )}

        <div className="mt-5">
          <p className="font-bold" id="style-label">{T.style}</p>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-labelledby="style-label">
            {GARMENT_KEYS.map((k) => (
              <button key={k} type="button" role="radio" aria-checked={garment === k} className="chip gap-2" onClick={() => pickGarment(k)}>
                {garmentText(k, locale).label}
                <span className="font-medium opacity-80">{fmt(unitPriceCents(k, undefined, locale, slug))}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="font-bold" id="color-label">
            {T.color}: <span className="font-medium">{cLabel}</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-labelledby="color-label">
            {g.colors
              .filter((c) => isAvailable(garment, c.key, undefined, locale))
              .map((c) => (
                <button
                  key={c.key}
                  type="button"
                  role="radio"
                  aria-checked={color === c.key}
                  aria-label={colorLabel(c, locale)}
                  title={colorLabel(c, locale)}
                  onClick={() => {
                    setColor(c.key);
                    trackEvent('ColorSelected', { product: slug, color: c.key });
                  }}
                  className={`h-11 w-11 rounded-full border-2 ${color === c.key ? 'border-violet ring-2 ring-violet ring-offset-2' : 'border-lilac-line'}`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
          </div>
        </div>

        <div className="mt-5 scroll-mt-24" ref={sizeRef}>
          <div className="flex items-baseline justify-between gap-4">
            <p className="font-bold" id="size-label">
              {T.size}
              {size ? <span className="font-medium">: {size}</span> : null}
            </p>
            <SizeGuide garment={garment} locale={locale} T={T} />
          </div>
          <div className={`mt-2 flex flex-wrap gap-2 rounded-2xl ${sizeError ? 'p-2 ring-2 ring-red' : sizeNudge && !size ? 'p-2 ring-2 ring-violet' : ''}`} role="radiogroup" aria-labelledby="size-label" aria-describedby={sizeError ? 'size-error' : undefined}>
            {g.sizes.map((s) => {
              const ok = isAvailable(garment, color, s, locale);
              const extra = sizeExtraCents(garment, s, locale);
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
                    trackEvent('SizeSelected', { product: slug, garment, size: s });
                    setSizeError(false);
                    setSizeNudge(false);
                    alertSet('');
                  }}
                >
                  {s}
                  {extra ? <span className="text-[0.85rem] font-medium">+{fmt(extra)}</span> : null}
                </button>
              );
            })}
          </div>
          {sizeError && (
            <p id="size-error" className="mt-2 font-bold text-red">
              {T.pickSize}
            </p>
          )}
          <p className="mt-2 text-[0.95rem] text-ink-soft">{gt.fit}</p>
          {locale === 'en' && (
            <p className="mt-2 text-[0.95rem]">
              {SIZE_HELP.note}{' '}
              <Link href={ROUTES.en.returns} className="font-bold text-violet">
                How swaps work
              </Link>
            </p>
          )}
        </div>

        <fieldset className="mt-6">
          <legend className="font-bold">{T.bundleTitle}</legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {TIERS.map((n) => {
              const pct = bundlePercent(n, locale);
              const t = tierTotal(price, n, locale);
              const on = qty === n;
              return (
                <label
                  key={n}
                  className={`flex cursor-pointer flex-col items-center rounded-2xl border-2 px-1 pb-3 pt-2.5 text-center leading-tight has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-violet ${on ? 'border-violet bg-lilac' : 'border-lilac-line bg-white hover:border-violet'}`}
                >
                  <input
                    type="radio"
                    name="tier"
                    checked={on}
                    onChange={() => {
                      setQty(n);
                      trackEvent('QuantitySelected', { product: slug, qty: n });
                    }}
                    className="h-5 w-5 shrink-0 accent-violet"
                  />
                  <span className="mt-1.5 text-[0.95rem] font-bold">{T.pieces(n, garment)}</span>
                  <span className="mt-0.5 text-[1.15rem] font-black">{fmt(t)}</span>
                  {pct > 0 ? (
                    <span className="mt-1.5 rounded-full bg-red px-2 py-0.5 text-[0.85rem] font-bold text-white">{T.save(pct)}</span>
                  ) : (
                    <span className="mt-1.5 text-[0.85rem] text-ink-soft">{T.justThis}</span>
                  )}
                </label>
              );
            })}
          </div>
          <p className="mt-2 text-[0.92rem] text-ink-soft">{T.tierNote}</p>
        </fieldset>

        <button ref={ctaRef} type="button" className="btn btn-red mt-6 min-h-[4rem] w-full text-[1.2rem] shadow-[0_6px_0_var(--color-red-deep)] active:shadow-none" onClick={addToCart}>
          {T.addToCart(fmt(total))}
        </button>

        {/* What she pays on top and when it comes, right under the button (surprise costs at checkout
            are the most common reason carts get left) */}
        <div className="mt-3 space-y-1 text-center text-[1rem]">
          <p>{ship === 0 ? T.shipFree : T.shipPaid(fmt(ship), fmt(store.freeShippingFromCents), qty === 1 && shippingFor(tierTotal(price, 2, locale), locale, garment === 'hoodie') === 0)}</p>
          {dates && (
            <p className="flex items-center justify-center gap-2">
              <IconTruck className="h-5 w-5 text-violet" />
              <span>{T.arrives(dates.window)}</span>
            </p>
          )}
          {dates?.holiday && (
            <p className="font-bold text-red">
              {T.holiday(dates.holiday.label, dates.holiday.name)}
            </p>
          )}
        </div>
        {locale === 'en' && (
          <>
            <PromiseNote className="mt-4" />
            <PaymentLogos center className="mt-4" />
          </>
        )}

        {added && (
          <div ref={addedRef} tabIndex={-1} className="mt-4 rounded-2xl border-2 border-violet bg-white p-4 outline-none" role="status">
            <p className="font-bold">{added === 'set' ? T.addedSet : T.addedOne}</p>
            {next ? (
              <p className="mt-1 text-ink-soft">{T.addMore(next.minItems - totals.count, next.percent)}</p>
            ) : (
              <p className="mt-1 text-ink-soft">{T.savingApplied}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={ROUTES[locale].cart} className="btn btn-violet">
                {T.viewCart}
              </Link>
              <Link href={shopPath(locale, vibe.key)} className="btn btn-line">
                {T.keepShopping}
              </Link>
            </div>
          </div>
        )}

        <ul className="mt-8 space-y-2.5">
          {benefits.map((b) => (
            <li key={b} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red text-white">
                <IconCheck className="h-3.5 w-3.5" />
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <ul className="mt-5 grid grid-cols-4 gap-2 rounded-2xl bg-lilac p-3 text-center">
          {features.map(({ Icon, label }) => (
            <li key={label} className="flex flex-col items-center gap-1.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-violet">
                <Icon className="h-6 w-6" />
              </span>
              <span className="text-[0.85rem] font-bold leading-tight sm:text-[0.9rem]">{label}</span>
            </li>
          ))}
        </ul>

        <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-lilac-line py-5 text-[0.9rem]">
          {T.trust(fmt(store.freeShippingFromCents))
            .map((x, i) => (i === 1 && locale === 'en' && garment === 'hoodie' ? { ...x, text: 'On every hoodie' } : x))
            .map((x, i) => (
            <Trust
              key={x.title}
              Icon={[IconLock, IconTruck, IconShield, IconCalendar][i]}
              title={x.title}
              text={
                x.link ? (
                  <>
                    {x.text} <Link href={locale === 'de' ? ROUTES.de.shipping : ROUTES.en.returns}>{x.link}</Link>
                  </>
                ) : (
                  x.text
                )
              }
            />
          ))}
        </ul>

        {setItems.length === 2 && (
          <section className="mt-7 rounded-[1.5rem] bg-lilac p-4 sm:p-5" aria-labelledby="set-title">
            <h2 id="set-title" className="text-[1.5rem] leading-tight sm:text-[1.7rem]">
              {T.setTitle} <span className="text-red">{T.setSave(SET_PERCENT)}</span>
            </h2>
            <p className="mt-1 text-[0.95rem] text-ink-soft">
              {T.setIntro(pluralLower, size)}
            </p>
            <div className="mt-4 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-start gap-1.5">
              {[{ d: design, color }, ...setItems].map((x, i) => (
                <SetTile key={x.d.slug} plus={i > 0}>
                  {i === 0 ? (
                    <div className="overflow-hidden rounded-xl bg-white ring-1 ring-lilac-line">
                      <ShirtPreview design={x.d.slug} garment={garment} colorKey={x.color} values={check.values} label={T.thisOneLabel(x.d.title)} className="block aspect-square w-full" view="tile" />
                    </div>
                  ) : (
                    <Link href={productPath(locale, x.d.slug)} className="block overflow-hidden rounded-xl bg-white ring-1 ring-lilac-line hover:ring-violet">
                      <ShirtPreview design={x.d.slug} garment={garment} colorKey={x.color} values={defaultValues(getTemplate(x.d.slug))} label={x.d.title} className="block aspect-square w-full" view="tile" />
                    </Link>
                  )}
                  <p className="mt-1.5 text-[0.88rem] font-bold leading-tight">{i === 0 ? T.thisOne : x.d.title}</p>
                </SetTile>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="leading-tight">
                <span className="block text-[0.9rem] text-ink-soft">
                  <s>
                    <span className="sr-only">{T.boughtSeparately}</span>
                    {fmt(setSum)}
                  </s>{' '}
                  {T.separately}
                </span>
                <span className="text-[1.5rem] font-black">{fmt(setTotal)}</span> <span className="font-bold text-red">{T.forAll3}</span>
              </p>
              <button type="button" className="btn btn-violet" onClick={addSet}>
                {T.addAll3}
              </button>
            </div>
            {setMsg && <p className="mt-2 font-bold text-red">{setMsg}</p>}
          </section>
        )}

        <div className="mt-8 divide-y divide-lilac-line border-y border-lilac-line">
          <Details title={T.about} open>
            <p>{design.blurb}</p>
          </Details>
          <Details title={T.fabric}>
            <p>
              {gt.model}. {gt.material}.
            </p>
            <p className="mt-2">{gt.fit}</p>
          </Details>
          <Details title={T.care}>
            <ul className="list-disc pl-5">
              {gt.care.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </Details>
          <Details title={T.shipping}>
            <p>{T.shippingText(store.deliveryMinDays, store.deliveryMaxDays)}</p>
          </Details>
          {locale === 'en' && (
            <Details title="What happens after you order">
              <OrderSteps />
            </Details>
          )}
          <Details title={T.returns}>
            <p>
              {T.returnsText} <Link href={ROUTES[locale].returns}>{T.returnsLink}</Link>
            </p>
          </Details>
          {locale === 'de' && <SafetyInfo design={design} model={gt.model} />}
        </div>
      </div>

      {/* ── Sticky add-to-cart on phones ───────────────────── */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t-2 border-lilac-line bg-white px-4 pt-3 transition-transform duration-200 motion-reduce:transition-none lg:hidden ${sticky ? 'translate-y-0 shadow-[0_-6px_20px_rgba(30,22,38,.12)]' : 'pointer-events-none translate-y-full'}`}
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        aria-hidden={!sticky}
      >
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0 flex-1 leading-tight">
            <p className="text-[1.15rem] font-black">
              {fmt(total)}
              {qty > 1 ? T.forN(qty) : ''}
              {size ? ` · ${size}` : ''}
            </p>
            <p className="truncate text-[0.95rem] text-ink-soft">{design.title}</p>
          </div>
          <button type="button" tabIndex={sticky ? 0 : -1} className="btn btn-red min-h-[3.2rem] shrink-0 px-5" data-track={size ? 'sticky-add-to-cart' : 'sticky-choose-size'} onClick={size ? addToCart : jumpToSize}>
            {size ? T.addShort : T.chooseSize}
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
      <div className="absolute bottom-[-4%] left-[14%] aspect-square w-[72%] overflow-hidden">{children}</div>
      <div className="absolute inset-x-[6%] top-[5.5%]">
        <p className={`font-display font-black leading-[0.98] tracking-[-0.01em] text-violet ${thumb ? 'text-[10.5cqw]' : hook.length > 30 ? 'text-[7cqw]' : hook.length > 26 ? 'text-[7.8cqw]' : 'text-[8.6cqw]'}`}>{hook}</p>
        {tagline && <p className={`mt-[1.6cqw] font-bold leading-tight text-red ${tagline.length > 52 ? 'text-[max(15px,3.5cqw)]' : 'text-[max(15px,4.1cqw)]'}`}>{tagline}</p>}
      </div>
      {sticker && (
        <span className="absolute bottom-[7%] left-[5%] flex h-[max(92px,23cqw)] w-[max(92px,23cqw)] rotate-[-10deg] flex-col items-center justify-center rounded-full bg-red text-center leading-[1.05] text-white shadow-lg" aria-hidden="true">
          <span className="text-[max(19px,5.4cqw)] font-black">{sticker[0]}</span>
          <span className="text-[max(15px,3.4cqw)] font-bold">{sticker[1]}</span>
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

type PdpText = ReturnType<typeof useLocale>['t']['pdp'];

function SizeGuide({ garment, locale, T }: { garment: GarmentKey; locale: Locale; T: PdpText }) {
  const ref = useRef<HTMLDialogElement>(null);
  const g = GARMENTS[garment];
  const gt = garmentText(garment, locale);
  // the chart is kept in inches; Germany gets centimetres
  const unit = (inches: number) => (T.inches ? `${inches}″` : `${Math.round(inches * 2.54)} cm`);
  return (
    <>
      <button type="button" className="-my-3 inline-flex min-h-12 items-center font-bold text-violet underline" onClick={() => {
            trackEvent('SizeGuideOpened', { garment });
            ref.current?.showModal();
          }}>
        {T.sizeGuide}
      </button>
      <dialog ref={ref} className="m-auto w-[min(32rem,92vw)] rounded-2xl p-0 backdrop:bg-ink/50" onClick={(e) => e.target === ref.current && ref.current?.close()}>
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-[1.6rem]">{T.sizesOf(gt.label)}</h2>
            <button type="button" className="-mr-2 -mt-1 h-11 w-11 rounded-full text-2xl hover:bg-lilac" onClick={() => ref.current?.close()} aria-label={T.closeSizes}>
              ×
            </button>
          </div>
          <p className="mt-2 text-ink-soft">{T.sizeNote}</p>
          <table className="mt-4 w-full text-left">
            <thead>
              <tr className="border-b-2 border-lilac-line">
                {T.sizeCols.map((c) => (
                  <th key={c} className="py-2">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {g.sizeChart.map((r) => (
                <tr key={r.size} className="border-b border-lilac-line">
                  <td className="py-2 font-bold">{r.size}</td>
                  <td className="py-2">{unit(r.width)}</td>
                  <td className="py-2">{unit(r.length)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-[0.95rem] text-ink-soft">{gt.fit}</p>
        </div>
      </dialog>
    </>
  );
}

/** Product safety details the EU's GPSR requires on German product pages. */
function SafetyInfo({ design, model }: { design: Design; model: string }) {
  const r = legalDe.euResponsible;
  return (
    <Details title="Produktsicherheit">
      <p>
        <strong>Hersteller:</strong> {legalDe.name} ({legalDe.tradingAs}), {legalDe.street}, {legalDe.city}, {legalDe.country}, {legalDe.email}
      </p>
      <p className="mt-2">
        <strong>Verantwortliche Person in der EU:</strong> {r.name}, {r.address}, {r.email}
      </p>
      <p className="mt-2">
        <strong>Produkt:</strong> {model}, Motiv „{design.title}“ (Artikel {design.slug})
      </p>
      <p className="mt-2">Keine besonderen Warnhinweise. Bitte die Pflegehinweise beachten.</p>
    </Details>
  );
}

function Field({ f, value, error, onChange, T }: { f: FieldDef; value: string | string[] | undefined; error?: string; onChange: (v: string | string[]) => void; T: PdpText }) {
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
              placeholder={f.placeholder ?? T.namePlaceholder}
              aria-label={T.nameN(i + 1)}
              aria-invalid={Boolean(error)}
              aria-describedby={describedBy}
              onChange={(e) => onChange(list.map((x, j) => (j === i ? e.target.value : x)))}
            />
            {list.length > 1 && (
              <button type="button" className="h-[3.2rem] w-12 shrink-0 rounded-xl bg-white text-xl ring-2 ring-lilac-line hover:ring-violet" onClick={() => onChange(list.filter((_, j) => j !== i))} aria-label={T.removeName(n || T.nameN(i + 1))}>
                ×
              </button>
            )}
          </div>
        ))}
        {list.length < f.max && (
          <button type="button" className="inline-flex min-h-12 items-center font-bold text-violet underline" onClick={() => onChange([...list, ''])}>
            {T.addName}
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
