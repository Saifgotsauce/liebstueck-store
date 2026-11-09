import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { brand } from '@/lib/config';
import { emailLayout, escapeHtml, sendEmail } from '@/lib/server/email';
import { env } from '@/lib/server/env';

export const runtime = 'nodejs';

// Printful → "package_shipped" → branded shipping email with tracking link.
// Register this URL (with ?token=PRINTFUL_WEBHOOK_SECRET) via `npm run printful:sync -- --webhook`.

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
      // Printful doesn't know the shop language, so German-speaking countries get German, everyone else English.
      const de = ['DE', 'AT', 'LI', 'CH'].includes((r.country_code ?? '').toUpperCase());
      const first = escapeHtml((r.name ?? '').split(' ')[0]);
      const carrier = escapeHtml(sh.carrier ?? (de ? 'den Versanddienstleister' : 'the carrier'));
      const button = sh.tracking_url
        ? `<p><a href="${escapeHtml(sh.tracking_url)}" style="display:inline-block;background:#F6C445;color:#16213A;padding:12px 20px;border-radius:999px;font-weight:bold;text-decoration:none">${de ? 'Sendung verfolgen' : 'Track your parcel'}</a></p>`
        : '';
      const number = sh.tracking_number ? `<p style="color:#4E5870">${de ? 'Sendungsnummer' : 'Tracking number'}: ${escapeHtml(sh.tracking_number)}</p>` : '';
      await sendEmail(
        r.email,
        de ? 'Dein Shirt ist unterwegs' : 'Your shirt is on its way',
        emailLayout(
          de ? `${first ? `${first}, dein` : 'Dein'} Shirt ist unterwegs!` : `${first ? `${first}, your` : 'Your'} shirt is on its way!`,
          de
            ? `<p>Es wurde gerade an ${carrier} übergeben.</p>${button}${number}<p>Viel Freude damit!</p>`
            : `<p>It has just been handed to ${carrier}.</p>${button}${number}<p>Enjoy it!</p>`,
          de ? 'de' : 'en',
        ),
      );
    }
  } else if ((body.type === 'order_failed' || body.type === 'order_put_hold') && env.ownerEmail) {
    await sendEmail(
      env.ownerEmail,
      `[${brand.name}] Printful: ${body.type}`,
      emailLayout('Printful reported a problem', `<p>Order ${escapeHtml(body.data?.order?.external_id ?? '')}: ${escapeHtml(body.data?.reason ?? body.type)}. Please check the Printful dashboard.</p>`, 'en'),
    );
  }
  return NextResponse.json({ ok: true });
}
