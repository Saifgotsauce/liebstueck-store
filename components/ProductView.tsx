'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { GARMENTS, GARMENT_KEYS, defaultColor, isAvailable, unitPriceCents, type GarmentKey } from '@/lib/catalog';
import { formatPrice, shop } from '@/lib/config';
import { useCart } from '@/lib/cart';
import { nextBundle } from '@/lib/cart-math';
import { deliveryWindow, holidayDeadline } from '@/lib/dates';
import { getDesign, getVibe } from '@/lib/designs';
import { defaultValues, getTemplate } from '@/lib/design/templates';
import { validateValues } from '@/lib/design/validate';
import type { FieldDef, FieldValues } from '@/lib/design/types';
import { track } from '@/lib/pixel';
import { productPhotos } from '@/lib/mockups';
import ShirtPreview from './ShirtPreview';

export default function ProductView({ slug }: { slug: string }) {
  const design = getDesign(slug)!;
  const vibe = getVibe(design.vibe)!;
  const template = getTemplate(slug);
  const { add, totals } = useCart();

  const [garment, setGarment] = useState<GarmentKey>('tee');
  const [color, setColor] = useState(() => defaultColor(design, 'tee'));
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [values, setValues] = useState<FieldValues>(() => defaultValues(template));
  // 'full' / 'zoom' = live preview; a number = one of Printful's model photos of the default design
  const [view, setView] = useState<'full' | 'zoom' | number>('full');
  const photos = productPhotos(slug);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState(false);
  const [dates, setDates] = useState<{ window: string; holiday: ReturnType<typeof holidayDeadline> } | null>(null);
  const addedRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);
  const g = GARMENTS[garment];

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

  const check = useMemo(() => validateValues(template, values), [template, values]);
  const price = unitPriceCents(garment, size ?? undefined);
  const colorObj = g.colors.find((c) => c.key === color) ?? g.colors[0];

  function pickGarment(k: GarmentKey) {
    setGarment(k);
    const keep = GARMENTS[k].colors.some((c) => c.key === color) && isAvailable(k, color);
    if (!keep) setColor(defaultColor(design, k));
    if (size && !GARMENTS[k].sizes.includes(size)) setSize(null);
  }

  function setField(key: string, v: string | string[]) {
    setValues((cur) => ({ ...cur, [key]: v }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
    setAdded(false);
  }

  function addToCart() {
    if (!check.ok) {
      setErrors(check.errors);
      document.getElementById(`f-${Object.keys(check.errors)[0]}`)?.focus();
      return;
    }
    if (!size) {
      setSizeError(true);
      sizeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    add({ design: slug, garment, color, size, values: check.values, qty });
    track('AddToCart', { content_ids: [slug], content_type: 'product', value: (price * qty) / 100, currency: 'USD' });
    setAdded(true);
    setTimeout(() => addedRef.current?.focus(), 0);
  }

  const countAfter = totals.count;
  const next = nextBundle(countAfter);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
      {/* ── Gallery ─────────────────────────────────────────── */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <div className="overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-lilac-line">
          {typeof view === 'number' && photos[view] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photos[view].src} alt={`${design.title}, example photo`} className="block aspect-square w-full object-cover" />
          ) : (
            <ShirtPreview design={slug} garment={garment} colorKey={color} values={check.values} label={`${design.title} on a ${colorObj.label.toLowerCase()} ${g.label.toLowerCase()}`} className="block aspect-square w-full" view={view === 'zoom' ? 'zoom' : 'main'} />
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-3" role="group" aria-label="Photo">
          {(['full', 'zoom'] as const).map((v) => (
            <button key={v} type="button" onClick={() => setView(v)} aria-pressed={view === v} className={`w-20 overflow-hidden rounded-xl bg-white ring-1 sm:w-24 ${view === v ? 'ring-2 ring-violet' : 'ring-lilac-line'}`}>
              <ShirtPreview design={slug} garment={garment} colorKey={color} values={check.values} label={v === 'full' ? 'Whole shirt' : 'Close-up of the print'} className="block aspect-square w-full" view={v === 'zoom' ? 'zoom' : 'tile'} />
            </button>
          ))}
          {photos.map((ph, i) => (
            <button key={ph.src} type="button" onClick={() => setView(i)} aria-pressed={view === i} className={`w-20 overflow-hidden rounded-xl bg-white ring-1 sm:w-24 ${view === i ? 'ring-2 ring-violet' : 'ring-lilac-line'}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ph.src} alt={`Example photo ${i + 1}`} className="block aspect-square w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
        <p className="mt-3 text-[0.95rem] text-ink-soft">This preview is exactly what we print. Change anything and it updates.</p>
      </div>

      {/* ── Options ─────────────────────────────────────────── */}
      <div>
        <Link href={`/shop/${vibe.key}/`} className="font-bold text-violet no-underline hover:underline">
          {vibe.name}
        </Link>
        <h1 className="mt-2 text-[2.1rem] sm:text-[2.6rem]">{design.title}</h1>
        <p className="mt-3 text-[1.5rem] font-bold">
          {formatPrice(price)}
          <span className="ml-3 align-middle text-[1rem] font-medium text-red">Buy 2, save {shop.bundles.find((b) => b.minItems === 2)?.percent ?? 10}%</span>
        </p>
        <p className="mt-3 max-w-xl text-[1.05rem] text-ink-soft">{design.blurb}</p>

        {template.fields.length > 0 && (
          <fieldset className="mt-7 rounded-2xl bg-lilac p-4 sm:p-5">
            <legend className="sr-only">Personalize it</legend>
            <p className="font-display text-[1.45rem] font-black text-violet">Personalize it</p>
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

        <div className="mt-6" ref={sizeRef}>
          <div className="flex items-baseline justify-between gap-4">
            <p className="font-bold" id="size-label">Size</p>
            <SizeGuide garment={garment} />
          </div>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-labelledby="size-label" aria-describedby={sizeError ? 'size-error' : undefined}>
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

        <div className="mt-7 flex items-stretch gap-3">
          <div className="flex items-center rounded-full ring-2 ring-lilac-line" role="group" aria-label="Quantity">
            <button type="button" className="h-full w-12 text-xl font-bold" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="One less">
              −
            </button>
            <span className="w-8 text-center text-lg font-bold" aria-live="polite">
              {qty}
            </span>
            <button type="button" className="h-full w-12 text-xl font-bold" onClick={() => setQty((q) => Math.min(shop.maxQuantityPerItem, q + 1))} aria-label="One more">
              +
            </button>
          </div>
          <button type="button" className="btn btn-red flex-1" onClick={addToCart}>
            Add to cart{qty > 1 ? ` – ${formatPrice(price * qty)}` : ""}
          </button>
        </div>

        {added && (
          <div ref={addedRef} tabIndex={-1} className="mt-4 rounded-2xl border-2 border-violet bg-white p-4 outline-none" role="status">
            <p className="font-bold">Added to your cart.</p>
            {next ? (
              <p className="mt-1 text-ink-soft">
                Add {next.minItems - countAfter} more and save {next.percent}% on everything.
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

        <div className="mt-6 space-y-1.5 text-[1rem]">
          {dates && (
            <p>
              <strong>Arrives about {dates.window}</strong> if you order today.
            </p>
          )}
          {dates?.holiday && (
            <p className="text-red">
              Order by <strong>{dates.holiday.label}</strong> for {dates.holiday.name} delivery.
            </p>
          )}
          <p className="text-ink-soft">Free US shipping over {formatPrice(shop.freeShippingFromCents)}. Arrived damaged or misprinted? We replace it free.</p>
        </div>

        <div className="mt-8 divide-y divide-lilac-line border-y border-lilac-line">
          <Details title="Fabric & fit">
            <p>{g.model}. {g.material}.</p>
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
    </div>
  );
}

function Details({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group py-1">
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
