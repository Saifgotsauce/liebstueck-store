'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import ShirtPreview from './ShirtPreview';
import { GARMENTS, getColor, type Product } from '@/lib/catalog';
import { legal, shop } from '@/lib/config';
import { loc } from '@/lib/i18n';
import { useLocale } from '@/lib/i18n/context';
import { useCart } from '@/lib/cart';
import { defaultValues, getTemplate } from '@/lib/design/templates';
import { validateValues } from '@/lib/design/validate';
import type { FieldDef, FieldValues } from '@/lib/design/types';
import { track } from '@/lib/pixel';

type Props = { product: Product; /** query string to pre-fill fields; defaults to the page URL */ prefill?: string };

export default function Personalizer({ product, prefill }: Props) {
  const template = getTemplate(product.template);
  const cart = useCart();
  const { t, locale, price } = useLocale();

  const [garmentKey, setGarmentKey] = useState(product.defaultGarment);
  const garment = GARMENTS[garmentKey];
  const [colorKey, setColorKey] = useState(product.defaultColor);
  const color = getColor(garment, colorKey) ?? garment.colors[0];
  const [size, setSize] = useState<string>('');
  const [values, setValues] = useState<FieldValues>(() => defaultValues(template));
  const [checked, setChecked] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [added, setAdded] = useState(false);
  const sizeRef = useRef<HTMLFieldSetElement>(null);

  // Pre-fill from the URL (e.g. coming from the homepage demo: ?titel=OMA&namen=Mia,Leon)
  useEffect(() => {
    const params = new URLSearchParams(prefill ?? window.location.search);
    if (![...params.keys()].length) return;
    setValues((prev) => {
      const next = { ...prev };
      for (const f of template.fields) {
        const raw = params.get(f.key);
        if (raw === null) continue;
        next[f.key] = f.type === 'names' ? raw.split(',').map((s) => s.trim()).filter(Boolean).slice(0, f.max) : raw;
      }
      return next;
    });
  }, [template, prefill]);

  useEffect(() => {
    track('ViewContent', { content_ids: [product.slug], content_type: 'product', currency: 'EUR', value: garment.priceCents / 100 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.slug]);

  // Keep the chosen colour when switching garment if it exists there
  useEffect(() => {
    if (!getColor(garment, colorKey)) setColorKey(garment.colors[0].key);
  }, [garment, colorKey]);

  const validation = useMemo(() => validateValues(template, values, locale), [template, values, locale]);
  const errors = validation.ok ? {} : validation.errors;
  const missing = validation.ok ? [] : validation.missing;
  // Preview shows the cleaned values; while typing, invalid input is still previewed as typed.
  const previewValues = validation.ok ? validation.values : values;

  function setField(key: string, v: string | string[]) {
    setValues((prev) => ({ ...prev, [key]: v }));
    setAdded(false);
    setChecked(false);
  }

  function addToCart() {
    setShowErrors(true);
    if (!validation.ok) return;
    if (!size) {
      sizeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (product.personalized && !checked) return;
    cart.add({ productSlug: product.slug, garment: garmentKey, color: color.key, size, values: validation.values, qty: 1 });
    track('AddToCart', { content_ids: [product.slug], content_type: 'product', currency: 'EUR', value: garment.priceCents / 100 });
    setAdded(true);
  }

  function companion() {
    if (product.companionResetFields) {
      setValues((prev) => {
        const next = { ...prev };
        for (const k of product.companionResetFields!) next[k] = '';
        return next;
      });
    }
    setAdded(false);
    setChecked(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const label = t('product.previewAria', { garment: loc(garment.label, locale), colour: loc(color.label, locale), summary: template.summarize(previewValues, locale) });

  return (
    <>
    <nav aria-label={t('crumbs.label')} className="mb-4 text-sm text-ink-soft">
      <Link href="/" className="hover:text-blau">
        {t('crumbs.home')}
      </Link>{' '}
      / <span>{loc(product.occasion, locale)}</span>
    </nav>
    <div className="grid gap-6 md:grid-cols-[1.05fr_1fr] md:gap-12">
      {/* Preview – sticky so it stays visible while typing, also on phones */}
      <div className="sticky top-[6.6rem] z-10 -mx-4 self-start bg-white px-4 pb-2 md:top-24 md:mx-0 md:px-0">
        <div className="rounded-2xl bg-blau-hell px-4 pt-3 md:px-8 md:pt-8">
          {/* Phones: close-up of the print, so the names stay readable while typing */}
          <ShirtPreview
            garment={garmentKey}
            colorHex={color.hex}
            ink={color.ink}
            templateId={product.template}
            values={previewValues}
            label={label}
            zoom
            className="mx-auto h-[30vh] w-full md:hidden"
          />
          <ShirtPreview
            garment={garmentKey}
            colorHex={color.hex}
            ink={color.ink}
            templateId={product.template}
            values={previewValues}
            label={label}
            className="mx-auto hidden w-full md:block md:max-w-[34rem]"
          />
        </div>
        <p className="mt-2 hidden text-center text-sm text-ink-soft md:block">{t('product.previewNote')}</p>
      </div>

      <div>
        <h1 className="text-[2rem] md:text-[2.5rem]">{loc(product.name, locale)}</h1>
        <p className="mt-3 text-lg text-ink-soft">{loc(product.short, locale)}</p>
        {t('product.printLanguage') && <p className="mt-2 rounded-lg bg-blau-hell px-3 py-2 text-sm">{t('product.printLanguage')}</p>}
        <p className="mt-4 text-2xl font-bold">
          {price(garment.priceCents)}
          <span className="ml-2 align-middle text-sm font-normal text-ink-soft">
            {t('product.vat')}{' '}
            <Link href="/versand-zahlung/" className="link">
              {t('product.shippingLink')}
            </Link>
          </span>
        </p>

        <form
          className="mt-6 space-y-7"
          onSubmit={(e) => {
            e.preventDefault();
            addToCart();
          }}
          noValidate
        >
          {/* Garment */}
          <fieldset>
            <legend className="mb-2 font-bold">{t('product.garment')}</legend>
            <div className="grid grid-cols-2 gap-3">
              {product.garments.map((k) => {
                const g = GARMENTS[k];
                const on = k === garmentKey;
                return (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      setGarmentKey(k);
                      setAdded(false);
                    }}
                    className={`rounded-xl border-2 px-4 py-3 text-left ${on ? 'border-blau bg-blau-hell' : 'border-linie hover:border-blau'}`}
                  >
                    <span className="block font-bold">{loc(g.label, locale)}</span>
                    <span className="text-ink-soft">{price(g.priceCents)}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Colour */}
          <fieldset>
            <legend className="mb-2 font-bold">
              {t('product.colour')}: <span className="font-normal">{loc(color.label, locale)}</span>
            </legend>
            <div role="radiogroup" aria-label={t('product.colour')} className="flex flex-wrap gap-3">
              {garment.colors.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  role="radio"
                  aria-checked={c.key === color.key}
                  aria-label={loc(c.label, locale)}
                  title={loc(c.label, locale)}
                  onClick={() => {
                    setColorKey(c.key);
                    setAdded(false);
                  }}
                  className={`h-11 w-11 rounded-full border-2 ${c.key === color.key ? 'border-blau ring-4 ring-blau/25' : 'border-linie'}`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </fieldset>

          {/* Personalisation fields */}
          {template.fields.map((f) => (
            <Field
              key={f.key}
              field={f}
              value={values[f.key]}
              error={showErrors || !missing.includes(f.key) ? errors[f.key] : undefined}
              onChange={(v) => setField(f.key, v)}
            />
          ))}

          {/* Size */}
          <fieldset ref={sizeRef}>
            <legend className="mb-2 font-bold">{t('product.size')}</legend>
            <div role="radiogroup" aria-label={t('product.size')} className="flex flex-wrap gap-2">
              {garment.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={size === s}
                  className="chip min-w-[3.4rem]"
                  onClick={() => {
                    setSize(s);
                    setAdded(false);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
            {showErrors && !size && <p className="mt-2 font-bold text-rot">{t('product.sizeError')}</p>}
            <p className="mt-2 text-sm text-ink-soft">{loc(garment.fit, locale)}</p>
          </fieldset>

          {product.personalized && (
            <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-gelb-hell p-4">
              <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-blau" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
              <span>
                <strong>{t('product.checkStrong')}</strong> {t('product.checkText')} (
                <Link href="/widerrufsbelehrung/" className="link">
                  {t('product.checkMore')}
                </Link>
                ).
                {showErrors && !checked && <span className="mt-1 block font-bold text-rot">{t('product.checkError')}</span>}
              </span>
            </label>
          )}

          {!added ? (
            <button type="submit" className="btn btn-primary w-full text-lg">
              {t('product.add', { price: price(garment.priceCents) })}
            </button>
          ) : (
            <div className="rounded-2xl border-2 border-blau p-5" role="status">
              <p className="font-bold">{t('product.added')}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Link href="/warenkorb/" className="btn btn-primary">
                  {t('product.toCart')}
                </Link>
                {product.companionHint && (
                  <button type="button" className="btn btn-ghost" onClick={companion}>
                    {loc(product.companionHint, locale)}
                  </button>
                )}
              </div>
              {cart.subtotalCents < shop.freeShippingFromCents && (
                <p className="mt-3 text-sm text-ink-soft">{t('product.freeLeft', { amount: price(shop.freeShippingFromCents - cart.subtotalCents) })}</p>
              )}
            </div>
          )}
        </form>

        <div className="mt-10 space-y-3 text-ink-soft">
          {loc(product.description, locale).map((d) => (
            <p key={d}>{d}</p>
          ))}
        </div>

        <div className="mt-8">
          <details className="info">
            <summary>{t('product.material')}</summary>
            <div className="space-y-2 pb-4 text-ink-soft">
              <p>
                {garment.model}, {garment.weight}.
              </p>
              <p>
                {t('product.materialLabel')}: {loc(garment.material, locale)}
              </p>
              <ul className="list-disc pl-5">
                {loc(garment.care, locale).map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          </details>
          <details className="info">
            <summary>{t('product.sizeChart')}</summary>
            <div className="pb-4">
              <table className="w-full text-left">
                <caption className="pb-2 text-left text-sm text-ink-soft">{t('product.sizeCaption')}</caption>
                <thead>
                  <tr className="border-b border-linie">
                    <th className="py-1.5">{t('product.size')}</th>
                    <th>{t('product.width')}</th>
                    <th>{t('product.length')}</th>
                  </tr>
                </thead>
                <tbody>
                  {garment.sizeChart.map((r) => (
                    <tr key={r.size} className="border-b border-linie/60">
                      <td className="py-1.5 font-bold">{r.size}</td>
                      <td>{r.width}</td>
                      <td>{r.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
          <details className="info">
            <summary>{t('product.shipping')}</summary>
            <p className="pb-4 text-ink-soft">
              {t('product.shippingText', { delivery: loc(shop.deliveryText, locale), ship: price(shop.shippingCents), free: price(shop.freeShippingFromCents) })}
            </p>
          </details>
          <details className="info">
            <summary>{t('product.safety')}</summary>
            <div className="space-y-2 pb-4 text-ink-soft">
              <p>
                <strong>{t('product.manufacturer')}:</strong> {legal.companyName}, {legal.street}, {legal.city}, {legal.country}, {legal.email}
              </p>
              <p>
                <strong>{t('product.euPerson')}:</strong> {legal.euResponsiblePerson.name}, {legal.euResponsiblePerson.address}, {legal.euResponsiblePerson.email}
              </p>
              <ul className="list-disc pl-5">
                {loc(garment.safety, locale).map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          </details>
          <div className="border-t border-linie" />
        </div>
      </div>
    </div>
    </>
  );
}

function Field({
  field,
  value,
  error,
  onChange,
}: {
  field: FieldDef;
  value: string | string[] | undefined;
  error?: string;
  onChange: (v: string | string[]) => void;
}) {
  const { t, locale } = useLocale();
  const id = `f-${field.key}`;
  const errId = `${id}-err`;
  const label = loc(field.label, locale);
  const errorEl = error ? (
    <p id={errId} className="mt-2 font-bold text-rot">
      {error}
    </p>
  ) : null;
  const help = field.help ? <p className="mt-1.5 text-sm text-ink-soft">{loc(field.help, locale)}</p> : null;

  if (field.type === 'select') {
    return (
      <fieldset>
        <legend className="mb-2 font-bold">{label}</legend>
        <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
          {field.options.map((o) => (
            <button key={o.value} type="button" role="radio" aria-checked={value === o.value} className="chip" onClick={() => onChange(o.value)}>
              {loc(o.label, locale)}
            </button>
          ))}
        </div>
        {help}
        {errorEl}
      </fieldset>
    );
  }

  if (field.type === 'names') {
    const names = Array.isArray(value) ? value : [];
    const list = names.length ? names : [''];
    const ph = field.placeholder ? loc(field.placeholder, locale) : 'Name';
    return (
      <fieldset>
        <legend className="mb-2 font-bold">{label}</legend>
        <div className="space-y-2">
          {list.map((n, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="field-input"
                value={n}
                maxLength={field.maxLength + 4}
                placeholder={`${ph} ${i + 1}`}
                aria-label={`${ph} ${i + 1}`}
                aria-invalid={!!error}
                aria-describedby={error ? errId : undefined}
                autoComplete="off"
                spellCheck={false}
                onChange={(e) => {
                  const next = [...list];
                  next[i] = e.target.value;
                  onChange(next);
                }}
              />
              {list.length > 1 && (
                <button
                  type="button"
                  className="btn btn-ghost min-h-[3.1rem] w-[3.1rem] shrink-0 p-0"
                  aria-label={n ? t('field.remove', { name: n }) : t('field.removeEmpty')}
                  onClick={() => onChange(list.filter((_, j) => j !== i))}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
        {list.length < field.max && (
          <button type="button" className="btn btn-ghost mt-3 min-h-[2.75rem] py-2" onClick={() => onChange([...list, ''])}>
            {t('field.addName')}
          </button>
        )}
        {help}
        {errorEl}
      </fieldset>
    );
  }

  return (
    <div>
      <label htmlFor={id} className="mb-2 block font-bold">
        {label}
      </label>
      <input
        id={id}
        className="field-input"
        value={typeof value === 'string' ? value : ''}
        placeholder={field.type === 'text' ? (field.placeholder ? loc(field.placeholder, locale) : undefined) : t('field.year')}
        inputMode={field.type === 'year' ? 'numeric' : undefined}
        maxLength={field.type === 'year' ? 4 : field.maxLength + 4}
        aria-invalid={!!error}
        aria-describedby={error ? errId : undefined}
        autoComplete="off"
        spellCheck={false}
        onChange={(e) => onChange(field.type === 'year' ? e.target.value.replace(/\D/g, '') : e.target.value)}
      />
      {help}
      {errorEl}
    </div>
  );
}
