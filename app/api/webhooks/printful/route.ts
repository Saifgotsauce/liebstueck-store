import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { brand, formatPrice, promise, siteUrl } from '@/lib/config';
import { emailLayout, escapeHtml, sendEmail } from '@/lib/server/email';
import { env } from '@/lib/server/env';

export const runtime = 'nodejs';

// Printful → "package_shipped" → branded shipping email with tracking link.
// Registered by the Printful sync Action (tick "webhook") with ?token=PRINTFUL_WEBHOOK_SECRET.

type ShippedPayload = {
  type: string;
  data?: {
    shipment?: { carrier?: string; service?: string; tracking_number?: string; tracking_url?: string };
    order?: { external_id?: string; recipient?: { name?: string; email?: string; country_code?: string } };
    reason?: string;
  };
};

export async function POST(req: Request) {
  const token = new URL(req.url).searchParams.get('token') ?? '';
  const secret = env.printfulWebhookSecret ?? '';
  if (!secret || token.length !== secret.length || !crypto.timingSafeEqual(Buffer.from(token), Buffer.from(secret))) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const body = (await req.json().catch(() => null)) as ShippedPayload | null;
  if (!body) return NextResponse.json({ error: 'bad request' }, { status: 400 });

  if (body.type === 'package_shipped') {
    const r = body.data?.order?.recipient;
    const sh = body.data?.shipment;
    if (r?.email && sh) {
      const first = escapeHtml((r.name ?? '').split(' ')[0]);
      const carrier = escapeHtml(sh.carrier ?? 'the carrier');
      const button = sh.tracking_url
        ? `<p><a href="${escapeHtml(sh.tracking_url)}" style="display:inline-block;background:#D2452B;color:#fff;padding:12px 22px;border-radius:999px;font-weight:bold;text-decoration:none">Track your package</a></p>`
        : '';
      const number = sh.tracking_number ? `<p style="color:#6B635B">Tracking number: ${escapeHtml(sh.tracking_number)}</p>` : '';
      const us = (r.country_code ?? 'US') === 'US';
      const swapNote = us
        ? `<p style="color:#5E5468">Not the right size when it arrives? Just reply to this email. We’ll send the right one for ${formatPrice(promise.sizeSwapCents)} and you keep this one.</p>`
        : '';
      await sendEmail(
        r.email,
        'Your order is on its way',
        emailLayout(`${first ? `${first}, your` : 'Your'} order is on its way!`, `<p>It was just handed to ${carrier}.</p>${button}${number}${swapNote}<p>Wear it loud.</p>`),
      );
      // US orders: a friendly check-in a few days after it should have arrived (docs: trust plan, item A).
      if (us) {
        const when = new Date(Date.now() + CHECK_IN_DAYS * 86_400_000).toISOString();
        await sendEmail(r.email, 'Did it fit?', checkInEmail(first), undefined, when);
      }
    }
  } else if ((body.type === 'order_failed' || body.type === 'order_put_hold') && env.ownerEmail) {
    await sendEmail(
      env.ownerEmail,
      `[${brand.name}] Printful: ${body.type}`,
      emailLayout('Printful reported a problem', `<p>Order ${escapeHtml(body.data?.order?.external_id ?? '')}: ${escapeHtml(body.data?.reason ?? body.type)}. Please check the Printful dashboard.</p>`),
    );
  }
  return NextResponse.json({ ok: true });
}

/** Days after shipping to ask how it went: 3–4 days in the mail plus about 3 days of wearing it. */
const CHECK_IN_DAYS = 7;

function checkInEmail(first: string) {
  const swap = formatPrice(promise.sizeSwapCents);
  return emailLayout(
    `${first ? `${first}, did` : 'Did'} it fit?`,
    `<p>Your Seasoned shirt should have arrived a few days ago. Did it fit? Did it make anyone laugh?</p>
<p>If the size is off, just reply to this email. We’ll send the right one for ${swap} and you keep this one. Nothing to send back.</p>
<p>If anything else isn’t right, like the print or a package that never showed up, reply and we’ll fix it for free.</p>
<p>And if you love it, we’d love to hear that too.</p>
<p><a href="${siteUrl}/returns/" style="color:#5B2A86;font-weight:bold">Our promise</a></p>`,
  );
}
