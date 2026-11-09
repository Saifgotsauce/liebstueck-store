import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { brand, siteUrl } from '@/lib/config';
import { formatPrice, isLocale, loc, type Locale } from '@/lib/i18n';
import { withdrawalNoticeHtml } from '@/lib/legal-texts';
import { emailLayout, escapeHtml, sendEmail } from '@/lib/server/email';
import { env, requireEnv } from '@/lib/server/env';
import { sendPurchaseEvent } from '@/lib/server/meta-capi';
import { fromStored, type CleanItem, type StoredItem } from '@/lib/server/order-items';
import { printFileUrl } from '@/lib/server/print-url';
import { createOrder, findOrder } from '@/lib/server/printful';
import { orderRef, stripe } from '@/lib/server/stripe';

export const runtime = 'nodejs';

// Stripe → (payment confirmed) → Printful order + confirmation email + Meta CAPI.
// Stripe retries failed deliveries for up to 3 days; the Printful external ID makes
// retries safe (an order is never created twice).

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(raw, sig ?? '', requireEnv('stripeWebhookSecret'));
  } catch (e) {
    console.error('Stripe webhook signature check failed', e);
    return NextResponse.json({ error: 'invalid signature' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status === 'paid' || session.payment_status === 'no_payment_required') await fulfill(session.id);
    } else if (event.type === 'checkout.session.async_payment_failed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await notifyOwner('Payment failed', `The delayed payment for ${orderRef(session.id)} failed. No print order was created.`);
    }
    return NextResponse.json({ received: true });
  } catch (e) {
    console.error('Fulfilment error', e);
    await notifyOwner('Order could not be sent to Printful', `Error: ${escapeHtml(String((e as Error).message))}<br>Event: ${event.id}. Stripe will retry automatically.`);
    return NextResponse.json({ error: 'fulfilment failed' }, { status: 500 });
  }
}

async function fulfill(sessionId: string) {
  const externalId = crypto.createHash('sha256').update(sessionId).digest('hex').slice(0, 32);
  if (await findOrder(externalId)) return; // already handled on an earlier delivery

  const s = stripe();
  const session = await s.checkout.sessions.retrieve(sessionId);
  const lineItems = await s.checkout.sessions.listLineItems(sessionId, { limit: 100, expand: ['data.price.product'] });

  const shipping =
    session.collected_information?.shipping_details ??
    ((session as unknown as { shipping_details?: Stripe.Checkout.Session.CollectedInformation.ShippingDetails }).shipping_details || null);
  if (!shipping?.address) throw new Error('No shipping address on session');
  const a = shipping.address;
  const email = session.customer_details?.email ?? undefined;

  const items: { clean: CleanItem; unitCents: number }[] = [];
  for (const li of lineItems.data) {
    const product = li.price?.product as Stripe.Product | undefined;
    const storedJson = product?.metadata?.item;
    if (!storedJson) throw new Error(`Line item ${li.id} has no design metadata`);
    const clean = fromStored(JSON.parse(storedJson) as StoredItem, li.quantity ?? 1);
    if (!clean) throw new Error(`Line item ${li.id} no longer matches the catalog`);
    items.push({ clean, unitCents: Math.round((li.amount_total ?? 0) / Math.max(1, li.quantity ?? 1)) });
  }

  const total = session.amount_total ?? 0;
  const shippingCents = session.shipping_cost?.amount_total ?? 0;
  await createOrder({
    externalId,
    recipient: {
      name: shipping.name ?? session.customer_details?.name ?? '',
      address1: a.line1 ?? '',
      address2: a.line2 ?? undefined,
      city: a.city ?? '',
      zip: a.postal_code ?? '',
      country_code: a.country ?? '',
      state_code: a.state ?? undefined,
      email,
      phone: session.customer_details?.phone ?? undefined,
    },
    items: items.map(({ clean, unitCents }) => ({
      variant_id: clean.variantId,
      quantity: clean.qty,
      retail_price: (unitCents / 100).toFixed(2),
      name: `${clean.product.name.en} – ${clean.template.summarize(clean.values, 'en')}`.slice(0, 200),
      files: [{ type: 'front', url: printFileUrl({ p: clean.product.slug, g: clean.garment.key, c: clean.color.key, v: clean.values }) }],
    })),
    retailCosts: {
      currency: 'EUR',
      subtotal: ((total - shippingCents) / 100).toFixed(2),
      shipping: (shippingCents / 100).toFixed(2),
      total: (total / 100).toFixed(2),
    },
  });

  const ref = orderRef(sessionId);
  const lang: Locale = isLocale(session.metadata?.lang) ? session.metadata.lang : 'de';
  const c = COPY[lang];
  const money = (cents: number) => formatPrice(cents, lang);
  if (email) {
    const rows = items
      .map(
        ({ clean, unitCents }) =>
          `<tr><td style="padding:8px 0;border-bottom:1px solid #D5DCEC">${clean.qty} × ${escapeHtml(loc(clean.product.name, lang))}<br><span style="color:#4E5870">${escapeHtml(
            `${loc(clean.garment.label, lang)}, ${loc(clean.color.label, lang)}, ${c.size} ${clean.size}`,
          )}<br>${c.personalisation}: ${escapeHtml(clean.template.summarize(clean.values, lang))}</span></td><td style="padding:8px 0;border-bottom:1px solid #D5DCEC;text-align:right;white-space:nowrap">${money(
            unitCents * clean.qty,
          )}</td></tr>`,
      )
      .join('');
    const html = emailLayout(
      c.title,
      `<p>${c.orderNumber}: <strong>${ref}</strong></p>
<table style="width:100%;border-collapse:collapse">${rows}
<tr><td style="padding:8px 0">${c.shipping}</td><td style="text-align:right">${shippingCents ? money(shippingCents) : c.free}</td></tr>
<tr><td style="padding:8px 0;font-weight:bold">${c.total}</td><td style="text-align:right;font-weight:bold">${money(total)}</td></tr></table>
<p>${c.address}: ${escapeHtml([shipping.name, a.line1, a.line2, `${a.postal_code ?? ''} ${a.city ?? ''}`, a.country].filter(Boolean).join(', '))}</p>
<p>${c.next}</p>
<hr style="border:none;border-top:1px solid #D5DCEC;margin:20px 0">
<p style="font-size:13px;color:#4E5870">${c.legal.replace('{terms}', `<a href="${siteUrl}/agb/">${c.terms}</a>`)}</p>
<div style="font-size:13px;color:#4E5870">${withdrawalNoticeHtml[lang]}</div>`,
      lang,
    );
    await sendEmail(email, c.subject.replace('{ref}', ref).replace('{brand}', brand.name), html);
  }
  if (env.ownerEmail) {
    const lines = items.map(({ clean }) => `${clean.qty} × ${escapeHtml(clean.product.name.en)} (${clean.garment.label.en}, ${clean.color.label.en}, ${clean.size}) – ${escapeHtml(clean.template.summarize(clean.values, 'en'))}`);
    await sendEmail(
      env.ownerEmail,
      `New order ${ref} (${formatPrice(total, 'en')})`,
      emailLayout(
        'New order',
        `<p>${ref}: ${formatPrice(total, 'en')}, customer language: ${lang.toUpperCase()}.</p><ul>${lines.map((l) => `<li>${l}</li>`).join('')}</ul><p>The print order is in Printful${env.printfulAutoConfirm ? ' and confirmed' : ' as a draft – please check and confirm it'}.</p>`,
        'en',
      ),
    );
  }

  if (session.metadata?.marketing === '1') {
    const [firstName, ...rest] = (shipping.name ?? '').split(' ');
    await sendPurchaseEvent({
      eventId: sessionId,
      valueCents: total,
      email,
      phone: session.customer_details?.phone,
      firstName,
      lastName: rest.join(' '),
      city: a.city ?? undefined,
      zip: a.postal_code ?? undefined,
      country: a.country ?? undefined,
      fbp: session.metadata?.fbp,
      fbc: session.metadata?.fbc,
      contentIds: items.map((i) => i.clean.product.slug),
    }).catch((e) => console.error('CAPI failed', e));
  }
}

// Owner alerts are always in English.
async function notifyOwner(subject: string, html: string) {
  if (!env.ownerEmail) return;
  await sendEmail(env.ownerEmail, `[${brand.name}] ${subject}`, emailLayout(subject, `<p>${html}</p>`, 'en')).catch(() => {});
}

const COPY: Record<Locale, Record<string, string>> = {
  de: {
    subject: 'Deine Bestellung {ref} bei {brand}',
    title: 'Danke für deine Bestellung!',
    orderNumber: 'Bestellnummer',
    size: 'Größe',
    personalisation: 'Personalisierung',
    shipping: 'Versand',
    free: 'kostenlos',
    total: 'Gesamt (inkl. MwSt.)',
    address: 'Lieferadresse',
    next: 'Wir drucken jetzt dein Shirt in der EU. Sobald es unterwegs ist, bekommst du eine E-Mail mit der Sendungsverfolgung.',
    terms: 'AGB',
    legal: 'Es gelten unsere {terms}. Hinweis: Personalisierte Artikel werden nach deinen Angaben angefertigt und sind vom Widerrufsrecht ausgeschlossen (§ 312g Abs. 2 Nr. 1 BGB).',
  },
  en: {
    subject: 'Your order {ref} from {brand}',
    title: 'Thank you for your order!',
    orderNumber: 'Order number',
    size: 'size',
    personalisation: 'Personalisation',
    shipping: 'Shipping',
    free: 'free',
    total: 'Total (incl. VAT)',
    address: 'Delivery address',
    next: 'We’re now printing your shirt in the EU. Once it’s on its way, you’ll get an email with tracking.',
    terms: 'terms and conditions',
    legal: 'Our {terms} apply. Note: personalised items are made to your specifications and are excluded from the right of withdrawal (§ 312g para. 2 no. 1 BGB).',
  },
};
