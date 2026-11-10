import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { brand, formatPrice as fmtPrice, promise, siteUrl } from '@/lib/config';
import { colorLabel, garmentText, printPlacement } from '@/lib/catalog';
import { agbHtml, widerrufsbelehrungHtml } from '@/lib/legal-de';
import { ROUTES } from '@/lib/locale';
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
    console.error('Fulfillment error', e);
    await notifyOwner('Order could not be sent to Printful', `Error: ${escapeHtml(String((e as Error).message))}<br>Event: ${event.id}. Stripe will retry automatically.`);
    return NextResponse.json({ error: 'fulfillment failed' }, { status: 500 });
  }
}

async function fulfill(sessionId: string) {
  const externalId = crypto.createHash('sha256').update(sessionId).digest('hex').slice(0, 32);
  if (await findOrder(externalId)) return; // already handled on an earlier delivery

  const s = stripe();
  const session = await s.checkout.sessions.retrieve(sessionId);
  const lineItems = await s.checkout.sessions.listLineItems(sessionId, { limit: 100, expand: ['data.price.product'] });

  // German orders: the address was entered on our own order page (/de/kasse/) and travels in metadata
  const de = session.metadata?.store === 'de';
  const md = session.metadata ?? {};
  const shipping = de
    ? {
        name: md.ship_name ?? '',
        address: { line1: md.ship_line1 ?? '', line2: md.ship_line2 || null, city: md.ship_city ?? '', postal_code: md.ship_zip ?? '', country: md.ship_country ?? 'DE', state: null },
      }
    : (session.collected_information?.shipping_details ??
      ((session as unknown as { shipping_details?: Stripe.Checkout.Session.CollectedInformation.ShippingDetails }).shipping_details || null));
  if (!shipping?.address || !shipping.address.line1) throw new Error('No shipping address on session');
  const a = shipping.address;
  const email = session.customer_details?.email ?? session.customer_email ?? undefined;
  const formatPrice = (c: number) => fmtPrice(c, de ? 'de' : 'en');

  const items: { clean: CleanItem; unitCents: number }[] = [];
  let shippingLine = { subtotal: 0, total: 0 };
  for (const li of lineItems.data) {
    const product = li.price?.product as Stripe.Product | undefined;
    if (product?.metadata?.kind === 'shipping') {
      shippingLine = { subtotal: li.amount_subtotal ?? 0, total: li.amount_total ?? 0 };
      continue;
    }
    const storedJson = product?.metadata?.item;
    if (!storedJson) throw new Error(`Line item ${li.id} has no design metadata`);
    const clean = fromStored(JSON.parse(storedJson) as StoredItem, li.quantity ?? 1);
    if (!clean) throw new Error(`Line item ${li.id} no longer matches the catalog`);
    // amount_subtotal = before discounts; Printful wants the price the customer paid per piece
    const paid = (li.amount_subtotal ?? 0) - (li.amount_discount ?? 0);
    items.push({ clean, unitCents: Math.round(paid / Math.max(1, li.quantity ?? 1)) });
  }

  const total = session.amount_total ?? 0;
  const shippingCents = de ? shippingLine.subtotal : (session.shipping_cost?.amount_total ?? 0);
  const discount = session.total_details?.amount_discount ?? 0;
  const tax = session.total_details?.amount_tax ?? 0;
  const subtotal = (session.amount_subtotal ?? 0) - shippingLine.subtotal;
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
      name: [clean.design.title, clean.template.summarize(clean.values)].filter(Boolean).join(' – ').slice(0, 200),
      files: [{ type: printPlacement(clean.garment.key), url: printFileUrl({ p: clean.design.slug, g: clean.garment.key, c: clean.color.key, v: clean.values }) }],
    })),
    retailCosts: {
      currency: de ? 'EUR' : 'USD',
      subtotal: (subtotal / 100).toFixed(2),
      discount: (discount / 100).toFixed(2),
      shipping: (shippingCents / 100).toFixed(2),
      tax: (tax / 100).toFixed(2),
      total: (total / 100).toFixed(2),
    },
  });

  const ref = orderRef(sessionId);
  if (email && de) {
    await sendEmail(email, `Deine Bestellung ${ref} bei ${brand.name}`, germanConfirmation({ ref, items, discount, shippingCents, tax, total, shipping }), undefined);
  } else if (email) {
    const row = (left: string, right: string, bold = false) =>
      `<tr><td style="padding:6px 0;${bold ? 'font-weight:bold' : ''}">${left}</td><td style="padding:6px 0;text-align:right;white-space:nowrap;${bold ? 'font-weight:bold' : ''}">${right}</td></tr>`;
    const rows = items
      .map(({ clean, unitCents }) => {
        const personal = clean.template.summarize(clean.values);
        return `<tr><td style="padding:10px 0;border-bottom:1px solid #E7DFD2">${clean.qty} × ${escapeHtml(clean.design.title)}<br><span style="color:#6B635B">${escapeHtml(
          `${clean.garment.label}, ${clean.color.label}, size ${clean.size}`,
        )}${personal ? `<br>${escapeHtml(personal)}` : ''}</span></td><td style="padding:10px 0;border-bottom:1px solid #E7DFD2;text-align:right;white-space:nowrap">${formatPrice(unitCents * clean.qty)}</td></tr>`;
      })
      .join('');
    const html = emailLayout(
      'Thanks for your order!',
      `<p>Order number: <strong>${ref}</strong></p>
<table style="width:100%;border-collapse:collapse">${rows}
${discount ? row('Bundle savings', `−${formatPrice(discount)}`) : ''}
${row('Shipping', shippingCents ? formatPrice(shippingCents) : 'Free')}
${tax ? row('Sales tax', formatPrice(tax)) : ''}
${row('Total', formatPrice(total), true)}</table>
<p>Shipping to: ${escapeHtml([shipping.name, a.line1, a.line2, `${a.city ?? ''}, ${a.state ?? ''} ${a.postal_code ?? ''}`].filter(Boolean).join(', '))}</p>
<p>Your order is printed just for you and usually ships within 2–5 business days. We’ll email you the tracking link as soon as it’s on its way.</p>
<p style="color:#5E5468">Our promise: if we get it wrong, we fix it free. Wrong size? Reply to this email within ${promise.problemDays} days of delivery and we’ll send the right one for ${formatPrice(promise.sizeSwapCents)}. You keep the first.</p>
<p style="font-size:14px;color:#5E5468"><a href="${siteUrl}/returns/">Our promise</a> · <a href="${siteUrl}/terms/">Terms</a></p>`,
    );
    await sendEmail(email, `Your ${brand.name} order ${ref}`, html);
  }
  if (env.ownerEmail) {
    const lines = items.map(
      ({ clean }) =>
        `${clean.qty} × ${escapeHtml(clean.design.title)} (${clean.garment.label}, ${clean.color.label}, ${clean.size})${clean.template.summarize(clean.values) ? ` – ${escapeHtml(clean.template.summarize(clean.values))}` : ''}`,
    );
    await sendEmail(
      env.ownerEmail,
      `New order ${ref} (${formatPrice(total)})`,
      emailLayout(
        'New order',
        `<p>${ref}: ${formatPrice(total)}${discount ? ` (bundle savings ${formatPrice(discount)})` : ''}.</p><ul>${lines.map((l) => `<li>${l}</li>`).join('')}</ul><p>The print order is in Printful${env.printfulAutoConfirm ? ' and confirmed' : ' as a draft – please check and confirm it'}.</p>`,
      ),
    );
  }

  if (session.metadata?.marketing === '1') {
    const [firstName, ...rest] = (shipping.name ?? '').split(' ');
    await sendPurchaseEvent({
      currency: de ? 'EUR' : 'USD',
      sourcePath: de ? ROUTES.de.thanks : ROUTES.en.thanks,
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
      contentIds: items.map((i) => i.clean.design.slug),
    }).catch((e) => console.error('CAPI failed', e));
  }
}

type Shipping = { name?: string | null; address: { line1?: string | null; line2?: string | null; postal_code?: string | null; city?: string | null } };

/**
 * Bestellbestätigung = Vertragsannahme und Vertragsbestätigung auf einem dauerhaften
 * Datenträger (§ 312f BGB): mit Bestelldaten, AGB und Widerrufsbelehrung inkl. Formular.
 */
function germanConfirmation(o: { ref: string; items: { clean: CleanItem; unitCents: number }[]; discount: number; shippingCents: number; tax: number; total: number; shipping: Shipping }) {
  const eur = (c: number) => fmtPrice(c, 'de');
  const row = (left: string, right: string, bold = false) =>
    `<tr><td style="padding:6px 0;${bold ? 'font-weight:bold' : ''}">${left}</td><td style="padding:6px 0;text-align:right;white-space:nowrap;${bold ? 'font-weight:bold' : ''}">${right}</td></tr>`;
  const rows = o.items
    .map(({ clean, unitCents }) => {
      const personal = clean.template.summarize(clean.values);
      const line = `${garmentText(clean.garment.key, 'de').label}, ${colorLabel(clean.color, 'de')}, Größe ${clean.size}`;
      return `<tr><td style="padding:10px 0;border-bottom:1px solid #DCCFEA">${clean.qty} × ${escapeHtml(clean.design.title)}<br><span style="color:#5E5468">${escapeHtml(line)}${
        personal ? `<br>${escapeHtml(personal)}` : ''
      }</span></td><td style="padding:10px 0;border-bottom:1px solid #DCCFEA;text-align:right;white-space:nowrap">${eur(unitCents * clean.qty)}</td></tr>`;
    })
    .join('');
  const a = o.shipping.address;
  const legal = (title: string, html: string) =>
    `<h2 style="font-family:Georgia,serif;font-size:19px;margin:28px 0 8px">${title}</h2><div style="font-size:13px;line-height:1.5;color:#3d3446">${html.replace(/<h2>/g, '<h3 style="font-size:15px;margin:16px 0 4px">').replace(/<\/h2>/g, '</h3>')}</div>`;
  return emailLayout(
    'Danke für deine Bestellung!',
    `<p>Hiermit bestätigen wir deine Bestellung und nehmen sie an. Bestellnummer: <strong>${o.ref}</strong></p>
<table style="width:100%;border-collapse:collapse">${rows}
${o.discount ? row('Mengenrabatt', `−${eur(o.discount)}`) : ''}
${row('Versand', o.shippingCents ? eur(o.shippingCents) : 'kostenlos')}
${row('Gesamt', eur(o.total), true)}
${o.tax ? row('darin enthaltene MwSt.', eur(o.tax)) : row('inkl. gesetzlicher MwSt.', '')}</table>
<p>Lieferung an: ${escapeHtml([o.shipping.name, a.line1, a.line2, `${a.postal_code ?? ''} ${a.city ?? ''}`].filter(Boolean).join(', '))}</p>
<p>Deine Bestellung wird nur für dich gedruckt und verlässt uns meist innerhalb von 2–5 Werktagen. Sobald sie unterwegs ist, schicken wir dir den Link zur Sendungsverfolgung.</p>
<p>Etwas stimmt nicht, wenn das Paket ankommt? Antworte innerhalb von 30 Tagen auf diese E-Mail – du bekommst kostenlos Ersatz oder dein Geld zurück. Widerrufen kannst du jederzeit hier: <a href="${siteUrl}${ROUTES.de.withdraw}">Vertrag widerrufen</a>.</p>
${legal('Widerrufsbelehrung', widerrufsbelehrungHtml)}
${legal('Allgemeine Geschäftsbedingungen', agbHtml)}`,
    'de',
  );
}

async function notifyOwner(subject: string, html: string) {
  if (!env.ownerEmail) return;
  await sendEmail(env.ownerEmail, `[${brand.name}] ${subject}`, emailLayout(subject, `<p>${html}</p>`)).catch(() => {});
}
