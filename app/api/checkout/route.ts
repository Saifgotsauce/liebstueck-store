import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { colorLabel, garmentText, variantsSynced } from '@/lib/catalog';
import { formatPrice, siteUrl, stores } from '@/lib/config';
import { bundlePercent, shippingFor } from '@/lib/cart-math';
import { ROUTES, isLocale, type Locale } from '@/lib/locale';
import { env } from '@/lib/server/env';
import { parseItems, toStored, type CleanItem } from '@/lib/server/order-items';
import { findCode, type FoundCode } from '@/lib/server/referral';
import { amountCoupon, bundleCoupon, stripe } from '@/lib/server/stripe';

export const runtime = 'nodejs';

type Body = { locale?: unknown; items?: unknown; address?: unknown; code?: unknown; marketingConsent?: boolean; fbp?: string; fbc?: string };

const MSG = {
  en: {
    noStripe: 'Checkout isn’t set up yet (Stripe key missing).',
    noSync: 'Checkout isn’t set up yet (Printful products not synced).',
    item: (n: number, m: string) => `Item ${n}: ${m}`,
    empty: 'Your cart is empty.',
    failed: 'Checkout couldn’t be opened. Please try again in a moment.',
    badCode: 'That code doesn’t work anymore. Remove it and try again.',
  },
  de: {
    noStripe: 'Die Kasse ist noch nicht eingerichtet (Stripe-Schlüssel fehlt).',
    noSync: 'Die Kasse ist noch nicht eingerichtet (Printful-Produkte nicht synchronisiert).',
    item: (n: number, m: string) => `Artikel ${n}: ${m}`,
    empty: 'Dein Warenkorb ist leer.',
    failed: 'Die Bezahlseite konnte nicht geöffnet werden. Bitte versuch es gleich noch einmal.',
  },
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Body | null;
  const rawLocale = body?.locale;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : 'en';
  const m = MSG[locale];

  if (!env.stripeSecretKey) return NextResponse.json({ error: m.noStripe }, { status: 503 });
  if (!variantsSynced) return NextResponse.json({ error: m.noSync }, { status: 503 });

  const { items, errors } = parseItems(body?.items, locale);
  if (errors.length) return NextResponse.json({ error: m.item(errors[0].index + 1, errors[0].message) }, { status: 400 });
  if (!items.length) return NextResponse.json({ error: m.empty }, { status: 400 });

  let address: Address | null = null;
  if (locale === 'de') {
    const a = parseAddress(body?.address);
    if ('error' in a) return NextResponse.json({ error: a.error }, { status: 400 });
    address = a;
  }

  // US: friend / reward code (checked again here – the cart only shows it)
  let code: FoundCode | null = null;
  if (locale === 'en' && body?.code) {
    code = await findCode(stripe(), body.code).catch(() => null);
    if (!code) return NextResponse.json({ error: MSG.en.badCode, badCode: true }, { status: 400 });
  }

  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.unitCents * i.qty, 0);
  const percent = bundlePercent(count, locale);
  const discount = Math.round((subtotal * percent) / 100);
  const shipping = shippingFor(subtotal - discount, locale, items.some((i) => i.garment.key === 'hoodie'));
  const marketing = body?.marketingConsent === true;
  const tracking = {
    marketing: marketing ? '1' : '0',
    ...(marketing && body?.fbp ? { fbp: String(body.fbp).slice(0, 200) } : {}),
    ...(marketing && body?.fbc ? { fbc: String(body.fbc).slice(0, 200) } : {}),
  };

  try {
    const s = stripe();
    const params = address ? await germanSession(s, items, address, { percent, discount, shipping, tracking }) : await usSession(s, items, { percent, discount, shipping, tracking, code });
    const session = await s.checkout.sessions.create(params);
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error('Stripe checkout error', e);
    return NextResponse.json({ error: m.failed }, { status: 502 });
  }
}

function lineItem(i: CleanItem, locale: Locale, taxBehavior: 'exclusive' | 'inclusive' | undefined): Stripe.Checkout.SessionCreateParams.LineItem {
  const stored = JSON.stringify(toStored(i));
  if (stored.length > 500) throw new Error('Personalization too long for Stripe metadata');
  const personal = i.template.summarize(i.values);
  const g = garmentText(i.garment.key, locale).label;
  const c = colorLabel(i.color, locale);
  return {
    quantity: i.qty,
    price_data: {
      currency: stores[locale].currency.toLowerCase(),
      unit_amount: i.unitCents,
      tax_behavior: taxBehavior,
      product_data: {
        name: `${i.design.title} – ${g}`,
        description: [locale === 'de' ? `${c}, Größe ${i.size}` : `${c}, size ${i.size}`, personal].filter(Boolean).join(' · '),
        metadata: { item: stored },
      },
    },
  };
}

// ── US store: Stripe collects the address, bundle saving as a % coupon ─────────
async function usSession(
  s: Stripe,
  items: CleanItem[],
  o: { percent: number; discount: number; shipping: number; tracking: Record<string, string>; code: FoundCode | null },
): Promise<Stripe.Checkout.SessionCreateParams> {
  const shop = stores.en;
  // Stripe takes one discount per session: with a code, bundle saving + code become one exact amount.
  // The code doesn't change the free-shipping threshold (that's worked out before it).
  const subtotal = items.reduce((sum, i) => sum + i.unitCents * i.qty, 0);
  const off = o.code ? Math.min(o.discount + o.code.cents, subtotal - 50) : 0;
  const discounts = o.code
    ? [{ coupon: await amountCoupon(s, off, 'usd', o.discount ? `Bundle savings + ${o.code.kind === 'reward' ? 'reward' : 'friend'} code` : `${o.code.kind === 'reward' ? 'Reward' : 'Friend'} code`, 'SAVINGS') }]
    : o.percent
      ? [{ coupon: await bundleCoupon(s, o.percent) }]
      : [];
  const taxBehavior = env.stripeAutomaticTax ? ('exclusive' as const) : undefined;
  return {
    mode: 'payment',
    locale: 'en',
    line_items: items.map((i) => lineItem(i, 'en', taxBehavior)),
    shipping_address_collection: { allowed_countries: [...shop.shipToCountries] as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[] },
    shipping_options: [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          display_name: o.shipping ? 'Standard shipping' : 'Free standard shipping',
          fixed_amount: { amount: o.shipping, currency: 'usd' },
          tax_behavior: taxBehavior,
          delivery_estimate: {
            minimum: { unit: 'business_day', value: shop.deliveryMinDays },
            maximum: { unit: 'business_day', value: shop.deliveryMaxDays },
          },
        },
      },
    ],
    automatic_tax: { enabled: env.stripeAutomaticTax },
    billing_address_collection: 'auto',
    submit_type: 'pay',
    custom_text: {
      shipping_address: { message: `Every shirt is printed to order and arrives in about ${shop.deliveryMinDays}–${shop.deliveryMaxDays} business days.` },
      submit: { message: 'Made just for you: we replace or refund anything that arrives damaged, misprinted or wrong. See our return policy for details.' },
    },
    ...(env.stripeRequireTerms ? { consent_collection: { terms_of_service: 'required' as const } } : {}),
    ...(discounts.length ? { discounts } : {}),
    metadata: { store: 'en', ...o.tracking, ...(o.code ? { code: o.code.code, code_kind: o.code.kind } : {}) },
    success_url: `${siteUrl}${ROUTES.en.thanks}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}${ROUTES.en.cart}`,
  };
}

// ── German store ────────────────────────────────────────────────────────────
// The customer already placed the binding order on our own page ("Zahlungspflichtig
// bestellen", § 312j BGB) with their address – Stripe only takes the payment.

type Address = { firstName: string; lastName: string; street: string; extra: string; zip: string; city: string; email: string };

function parseAddress(raw: unknown): Address | { error: string } {
  const o = (raw ?? {}) as Record<string, unknown>;
  const v = (k: string, max: number) => String(o[k] ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
  const a: Address = { firstName: v('firstName', 60), lastName: v('lastName', 60), street: v('street', 100), extra: v('extra', 100), zip: v('zip', 5), city: v('city', 60), email: v('email', 200) };
  if (!a.firstName || !a.lastName || !a.street || !a.city) return { error: 'Bitte gib Vorname, Nachname, Straße mit Hausnummer und Ort an.' };
  if (!/\d/.test(a.street)) return { error: 'Bitte gib bei der Straße auch die Hausnummer an.' };
  if (!/^\d{5}$/.test(a.zip)) return { error: 'Bitte gib eine gültige deutsche Postleitzahl (5 Ziffern) an.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email)) return { error: 'Bitte gib eine gültige E-Mail-Adresse an.' };
  return a;
}

async function germanSession(
  s: Stripe,
  items: CleanItem[],
  a: Address,
  o: { percent: number; discount: number; shipping: number; tracking: Record<string, string> },
): Promise<Stripe.Checkout.SessionCreateParams> {
  const shop = stores.de;
  // German prices already include VAT
  const taxBehavior = env.stripeAutomaticTax ? ('inclusive' as const) : undefined;
  const line_items = items.map((i) => lineItem(i, 'de', taxBehavior));
  if (o.shipping) {
    line_items.push({
      quantity: 1,
      price_data: {
        currency: 'eur',
        unit_amount: o.shipping,
        tax_behavior: taxBehavior,
        product_data: { name: 'Versand innerhalb Deutschlands', description: `Lieferzeit ${shop.deliveryMinDays}–${shop.deliveryMaxDays} Werktage`, metadata: { kind: 'shipping' } },
      },
    });
  }
  const name = `${a.firstName} ${a.lastName}`;
  return {
    mode: 'payment',
    locale: 'de',
    line_items,
    customer_email: a.email,
    payment_intent_data: { shipping: { name, address: { line1: a.street, line2: a.extra || undefined, postal_code: a.zip, city: a.city, country: 'DE' } } },
    automatic_tax: { enabled: env.stripeAutomaticTax },
    billing_address_collection: 'auto',
    submit_type: 'pay',
    custom_text: {
      submit: {
        message: `Hier bezahlst du deine Bestellung, die du bei Seasoned mit „Zahlungspflichtig bestellen“ aufgegeben hast. Lieferung an: ${name}, ${a.street}, ${a.zip} ${a.city}.`,
      },
    },
    ...(o.discount ? { discounts: [{ coupon: await amountCoupon(s, o.discount, 'eur', `Mengenrabatt ${o.percent} % (${formatPrice(o.discount, 'de')})`) }] } : {}),
    metadata: {
      store: 'de',
      ship_name: name,
      ship_line1: a.street,
      ship_line2: a.extra,
      ship_zip: a.zip,
      ship_city: a.city,
      ship_country: 'DE',
      ...o.tracking,
    },
    success_url: `${siteUrl}${ROUTES.de.thanks}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}${ROUTES.de.checkout}`,
  };
}
