import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { variantsSynced } from '@/lib/catalog';
import { shop, siteUrl } from '@/lib/config';
import { shippingFor } from '@/lib/cart-math';
import { env } from '@/lib/server/env';
import { parseItems, toStored } from '@/lib/server/order-items';
import { stripe } from '@/lib/server/stripe';
import { fmt, isLocale, loc, type Locale } from '@/lib/i18n';

const MSG = {
  de: {
    noStripe: 'Die Kasse ist noch nicht eingerichtet (Stripe-Schlüssel fehlt).',
    noVariants: 'Die Kasse ist noch nicht eingerichtet (Printful-Varianten fehlen).',
    item: 'Artikel {n}: {msg}',
    empty: 'Dein Warenkorb ist leer.',
    failed: 'Die Kasse konnte nicht geöffnet werden. Bitte versuche es gleich noch einmal.',
    shipping: 'Standardversand',
    freeShipping: 'Kostenloser Versand',
    size: 'Größe',
    shippingNote: 'Wir drucken in der EU. Lieferzeit: {delivery}.',
    submit:
      'Personalisierte Artikel werden nach deinen Angaben einzeln angefertigt und sind daher vom Widerrufsrecht ausgeschlossen (§ 312g Abs. 2 Nr. 1 BGB). Es gelten unsere AGB.',
  },
  en: {
    noStripe: 'Checkout is not set up yet (Stripe key missing).',
    noVariants: 'Checkout is not set up yet (Printful variants missing).',
    item: 'Item {n}: {msg}',
    empty: 'Your cart is empty.',
    failed: 'Checkout could not be opened. Please try again in a moment.',
    shipping: 'Standard shipping',
    freeShipping: 'Free shipping',
    size: 'size',
    shippingNote: 'We print in the EU. Delivery time: {delivery}.',
    submit:
      'Personalised items are made individually to your specifications and are therefore excluded from the right of withdrawal (§ 312g para. 2 no. 1 BGB). Our terms and conditions apply.',
  },
};

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    items?: unknown;
    marketingConsent?: boolean;
    fbp?: string;
    fbc?: string;
    locale?: string;
  } | null;
  const locale: Locale = isLocale(body?.locale) ? body.locale : 'de';
  const m = MSG[locale];

  if (!env.stripeSecretKey) return NextResponse.json({ error: m.noStripe }, { status: 503 });
  if (!variantsSynced) return NextResponse.json({ error: m.noVariants }, { status: 503 });

  const { items, errors } = parseItems(body?.items, locale);
  if (errors.length) return NextResponse.json({ error: fmt(m.item, { n: errors[0].index + 1, msg: errors[0].message }) }, { status: 400 });
  if (!items.length) return NextResponse.json({ error: m.empty }, { status: 400 });

  const subtotal = items.reduce((s, i) => s + i.unitCents * i.qty, 0);
  const shipping = shippingFor(subtotal);
  const taxBehavior = env.stripeAutomaticTax ? ('inclusive' as const) : undefined;

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((i) => {
    const stored = JSON.stringify(toStored(i));
    if (stored.length > 500) throw new Error('Personalisation too long for Stripe metadata');
    return {
      quantity: i.qty,
      price_data: {
        currency: 'eur',
        unit_amount: i.unitCents,
        tax_behavior: taxBehavior,
        product_data: {
          name: `${loc(i.product.name, locale)} (${loc(i.garment.label, locale)})`,
          description: `${loc(i.color.label, locale)}, ${m.size} ${i.size} – ${i.template.summarize(i.values, locale)}`,
          metadata: { item: stored },
        },
      },
    };
  });

  const marketing = body?.marketingConsent === true;
  const params: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    locale,
    line_items,
    shipping_address_collection: { allowed_countries: [...shop.shipToCountries] },
    shipping_options: [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          display_name: shipping ? m.shipping : m.freeShipping,
          fixed_amount: { amount: shipping, currency: 'eur' },
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
      shipping_address: { message: fmt(m.shippingNote, { delivery: loc(shop.deliveryText, locale) }) },
      submit: { message: m.submit },
    },
    ...(env.stripeRequireTerms ? { consent_collection: { terms_of_service: 'required' as const } } : {}),
    metadata: {
      marketing: marketing ? '1' : '0',
      lang: locale,
      ...(marketing && body?.fbp ? { fbp: String(body.fbp).slice(0, 200) } : {}),
      ...(marketing && body?.fbc ? { fbc: String(body.fbc).slice(0, 200) } : {}),
    },
    success_url: `${siteUrl}/danke/?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/warenkorb/`,
  };

  try {
    const session = await stripe().checkout.sessions.create(params);
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error('Stripe checkout error', e);
    return NextResponse.json({ error: m.failed }, { status: 502 });
  }
}
