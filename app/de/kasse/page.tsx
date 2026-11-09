'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ShirtPreview from '@/components/ShirtPreview';
import { GARMENTS, colorLabel, garmentText } from '@/lib/catalog';
import { isDemo, stores } from '@/lib/config';
import { useCart } from '@/lib/cart';
import { itemPriceCents } from '@/lib/cart-math';
import { useConsent } from '@/lib/consent';
import { getDesign } from '@/lib/designs';
import { getTemplate } from '@/lib/design/templates';
import { useLocale } from '@/lib/i18n';
import { ROUTES, productPath } from '@/lib/locale';
import { metaIds } from '@/lib/pixel';

// Kasse des deutschen Shops. Hier gibt die Kundin ihre Adresse ein, sieht die vollständige
// Bestellübersicht und gibt mit „Zahlungspflichtig bestellen“ ihre Bestellung ab (§ 312j BGB).
// Erst danach geht es zu Stripe – nur zum Bezahlen.

type Addr = { firstName: string; lastName: string; street: string; extra: string; zip: string; city: string; email: string };
const EMPTY: Addr = { firstName: '', lastName: '', street: '', extra: '', zip: '', city: '', email: '' };
const KEY = 'seasoned-de-address-v1';
const store = stores.de;

export default function Kasse() {
  const { items, ready, totals } = useCart();
  const { price } = useLocale();
  const { marketing } = useConsent();
  const [a, setA] = useState<Addr>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // remember the address on this device only (convenience for the next order)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setA({ ...EMPTY, ...(JSON.parse(raw) as Partial<Addr>) });
    } catch {
      /* ignore */
    }
  }, []);
  const set = (k: keyof Addr) => (e: React.ChangeEvent<HTMLInputElement>) => setA((x) => ({ ...x, [k]: k === 'zip' ? e.target.value.replace(/\D/g, '').slice(0, 5) : e.target.value }));

  async function order(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      localStorage.setItem(KEY, JSON.stringify(a));
    } catch {
      /* ignore */
    }
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: 'de', items, address: a, marketingConsent: marketing, ...(marketing ? metaIds() : {}) }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || 'Die Bezahlseite konnte nicht geöffnet werden. Bitte versuch es noch einmal.');
      window.location.href = data.url;
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  if (!ready) return <div className="wrap min-h-[50vh] pt-12" />;
  if (!items.length) {
    return (
      <div className="wrap max-w-2xl pt-16 text-center">
        <h1 className="text-[2.6rem]">Dein Warenkorb ist leer.</h1>
        <Link href={ROUTES.de.shop} className="btn btn-red mt-7">
          Alle Shirts ansehen
        </Link>
      </div>
    );
  }

  const input = (k: keyof Addr, label: string, opts: { auto?: string; type?: string; required?: boolean; mode?: 'numeric'; className?: string } = {}) => (
    <div className={opts.className}>
      <label htmlFor={`k-${k}`} className="block font-bold">
        {label}
        {opts.required === false && <span className="font-medium text-ink-soft"> (optional)</span>}
      </label>
      <input
        id={`k-${k}`}
        className="field mt-1.5"
        type={opts.type ?? 'text'}
        inputMode={opts.mode}
        autoComplete={opts.auto}
        required={opts.required !== false}
        value={a[k]}
        onChange={set(k)}
      />
    </div>
  );

  return (
    <div className="wrap pt-8 sm:pt-12">
      <p className="text-[0.95rem] text-ink-soft">
        <Link href={ROUTES.de.cart}>← Zurück zum Warenkorb</Link>
      </p>
      <h1 className="mt-2 text-[2.6rem] sm:text-[3.2rem]">Kasse</h1>
      <form onSubmit={order} className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <section aria-labelledby="addr-title">
          <h2 id="addr-title" className="text-[1.7rem]">
            Lieferadresse
          </h2>
          <p className="mt-1 text-ink-soft">Wir liefern innerhalb Deutschlands.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {input('firstName', 'Vorname', { auto: 'given-name' })}
            {input('lastName', 'Nachname', { auto: 'family-name' })}
            {input('street', 'Straße und Hausnummer', { auto: 'address-line1', className: 'sm:col-span-2' })}
            {input('extra', 'Adresszusatz', { auto: 'address-line2', required: false, className: 'sm:col-span-2' })}
            {input('zip', 'PLZ', { auto: 'postal-code', mode: 'numeric' })}
            {input('city', 'Ort', { auto: 'address-level2' })}
            <div className="sm:col-span-2">
              <p className="font-bold">Land</p>
              <p className="mt-1.5 rounded-xl bg-lilac px-4 py-3">Deutschland</p>
            </div>
            {input('email', 'E-Mail-Adresse (für Bestellbestätigung und Sendungsverfolgung)', { auto: 'email', type: 'email', className: 'sm:col-span-2' })}
          </div>
        </section>

        <section aria-labelledby="sum-title" className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl bg-lilac p-5 sm:p-6">
            <h2 id="sum-title" className="text-[1.7rem]">
              Deine Bestellung
            </h2>
            <ul className="mt-4 divide-y divide-lilac-line">
              {items.map((i) => {
                const d = getDesign(i.design)!;
                const c = GARMENTS[i.garment].colors.find((x) => x.key === i.color);
                const personal = getTemplate(i.design).summarize(i.values);
                return (
                  <li key={i.id} className="flex gap-3 py-3">
                    <Link href={productPath('de', i.design)} className="w-16 shrink-0 self-start overflow-hidden rounded-lg bg-white">
                      <ShirtPreview design={i.design} garment={i.garment} colorKey={i.color} values={i.values} label={d.title} className="block aspect-square w-full" view="tile" />
                    </Link>
                    <div className="min-w-0 flex-1 text-[0.95rem]">
                      <p className="font-bold leading-snug">
                        {i.qty} × {d.title}
                      </p>
                      <p className="text-ink-soft">
                        {garmentText(i.garment, 'de').label}, {c ? colorLabel(c, 'de') : ''}, Größe {i.size}
                      </p>
                      {personal && <p className="text-ink-soft">{personal}</p>}
                    </div>
                    <p className="shrink-0 font-bold">{price(itemPriceCents(i, 'de') * i.qty)}</p>
                  </li>
                );
              })}
            </ul>
            <dl className="mt-3 space-y-1.5 border-t border-lilac-line pt-3">
              <div className="flex justify-between">
                <dt>Zwischensumme</dt>
                <dd>{price(totals.subtotal)}</dd>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-red">
                  <dt>Mengenrabatt ({totals.percent} %)</dt>
                  <dd>−{price(totals.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt>Versand (Deutschland)</dt>
                <dd>{totals.shipping ? price(totals.shipping) : 'kostenlos'}</dd>
              </div>
              <div className="flex justify-between border-t border-lilac-line pt-2 text-[1.25rem] font-bold">
                <dt>Gesamtsumme</dt>
                <dd>{price(totals.total)}</dd>
              </div>
              <p className="text-right text-[0.9rem] text-ink-soft">inkl. 19 % MwSt.</p>
            </dl>
            <p className="mt-3 text-[0.95rem]">
              Lieferzeit: {store.deliveryMinDays}–{store.deliveryMaxDays} Werktage. Bezahlen kannst du im nächsten Schritt über Stripe.
            </p>
            <p className="mt-3 text-[0.92rem] text-ink-soft">
              Es gelten unsere <Link href={ROUTES.de.terms}>AGB</Link>. Hinweise zu deinem <Link href={ROUTES.de.returns}>Widerrufsrecht</Link> (personalisierte Artikel sind ausgeschlossen) und zum{' '}
              <Link href={ROUTES.de.privacy}>Datenschutz</Link>.
            </p>
            <button type="submit" className="btn btn-red mt-5 min-h-[3.8rem] w-full text-[1.15rem]" disabled={busy || isDemo}>
              {isDemo ? 'Bestellen ist in dieser Vorschau aus' : busy ? 'Einen Moment …' : 'Zahlungspflichtig bestellen'}
            </button>
            {error && (
              <p className="mt-3 font-bold text-red" role="alert">
                {error}
              </p>
            )}
          </div>
        </section>
      </form>
    </div>
  );
}
