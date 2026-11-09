import 'server-only';
import crypto from 'node:crypto';
import { siteUrl } from '../config';
import { env } from './env';

// Meta Conversions API: sends the Purchase server-side so ads can optimise even when the
// browser pixel is blocked. Only used when the customer gave marketing consent.

const hash = (v?: string | null) => (v ? crypto.createHash('sha256').update(v.trim().toLowerCase()).digest('hex') : undefined);

export async function sendPurchaseEvent(input: {
  eventId: string;
  valueCents: number;
  email?: string | null;
  phone?: string | null;
  firstName?: string;
  lastName?: string;
  city?: string;
  zip?: string;
  country?: string;
  fbp?: string;
  fbc?: string;
  contentIds: string[];
}) {
  if (!env.metaPixelId || !env.metaCapiToken) return;
  const user_data: Record<string, unknown> = {
    em: hash(input.email) ? [hash(input.email)] : undefined,
    ph: input.phone ? [hash(input.phone.replace(/[^\d]/g, ''))] : undefined,
    fn: hash(input.firstName) ? [hash(input.firstName)] : undefined,
    ln: hash(input.lastName) ? [hash(input.lastName)] : undefined,
    ct: hash(input.city?.replace(/\s/g, '')) ? [hash(input.city?.replace(/\s/g, ''))] : undefined,
    zp: hash(input.zip) ? [hash(input.zip)] : undefined,
    country: hash(input.country) ? [hash(input.country)] : undefined,
    fbp: input.fbp,
    fbc: input.fbc,
  };
  const body = {
    data: [
      {
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId, // same ID as the browser pixel → Meta de-duplicates
        action_source: 'website',
        event_source_url: `${siteUrl}/danke/`,
        user_data,
        custom_data: {
          currency: 'EUR',
          value: input.valueCents / 100,
          content_type: 'product',
          content_ids: input.contentIds,
        },
      },
    ],
  };
  const res = await fetch(`https://graph.facebook.com/${env.metaGraphVersion}/${env.metaPixelId}/events?access_token=${encodeURIComponent(env.metaCapiToken)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) console.error('Meta CAPI error', res.status, await res.text().catch(() => ''));
}
