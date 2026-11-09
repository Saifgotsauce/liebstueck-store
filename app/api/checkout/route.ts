import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { variantsSynced } from '@/lib/catalog';
import { shop, siteUrl } from '@/lib/config';
import { bundlePercent, shippingFor } from '@/lib/cart-math';
import { env } from '@/lib/server/env';
import { parseItems, toStored } from '@/lib/server/order-items';
import { bundleCoupon, stripe } from '@/lib/server/stripe';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { items?: unknown; marketingConsent?: boolean; fbp?: string; fbc?: string } | null;

  if (!env.stripeSecretKey) return NextResponse.json({ error: 'Checkout isn’t set up yet (Stripe key missing).' }, { status: 503 });
  if (!variantsSynced) return NextResponse.json({ error: 'Checkout isn’t set up yet (Printful products not synced).' }, { status: 503 });

  const { items, errors } = parseItems(body?.items);
  if (errors.length) return NextResponse.json({ error: `Item ${errors[0].index + 1}: ${errors[0].message}` }, { status: 400 });
  if (!items.length) return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });

  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.unitCents * i.qty, 0);
  const percent = bundlePercent(count);
  const merchandise = subtotal - Math.round((subtotal * percent) / 100);
  const shipping = shippingFor(merchandise);
  const taxBehavior = env.stripeAutomaticTax ? ('exclusive' as const) : undefined;

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((i) => {
    const stored = JSON.stringify(toStored(i));
    if (stored.length > 500) throw new Error('Personalization too long for Stripe metadata');
    const personal = i.template.summarize(i.values);
    return {
      quantity: i.qty,
      price_data: {
        currency: 'usd',
        unit_amount: i.unitCents,
        tax_behavior: taxBehavior,
        product_data: {
          name: `${i.design.title} – ${i.garment.label}`,
          description: [`${i.color.label}, size ${i.size}`, personal].filter(Boolean).join(' · '),
          metadata: { item: stored },
        },
      },
    };
  });

  const marketing = body?.marketingConsent === true;
  const params: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    locale: 'en',
    line_items,
    shipping_address_collection: { allowed_countries: [...shop.shipToCountries] },
    shipping_options: [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          display_name: shipping ? 'Standard shipping' : 'Free standard shipping',
          fixed_amount: { amount: shipping, currency: 'usd' },
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
    metadata: {
      marketing: marketing ? '1' : '0',
      ...(marketing && body?.fbp ? { fbp: String(body.fbp).slice(0, 200) } : {}),
      ...(marketing && body?.fbc ? { fbc: String(body.fbc).slice(0, 200) } : {}),
    },
    success_url: `${siteUrl}/thanks/?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/cart/`,
  };

  try {
    const s = stripe();
    if (percent) params.discounts = [{ coupon: await bundleCoupon(s, percent) }];
    const session = await s.checkout.sessions.create(params);
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error('Stripe checkout error', e);
    return NextResponse.json({ error: 'Checkout couldn’t be opened. Please try again in a moment.' }, { status: 502 });
  }
}
