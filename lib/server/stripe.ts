import 'server-only';
import Stripe from 'stripe';
import { requireEnv } from './env';

let client: Stripe | null = null;

export function stripe() {
  if (!client) {
    // STRIPE_API_BASE is only for local end-to-end tests against a mock server.
    const base = process.env.STRIPE_API_BASE ? new URL(process.env.STRIPE_API_BASE) : null;
    client = new Stripe(requireEnv('stripeSecretKey'), {
      appInfo: { name: 'seasoned-store' },
      ...(base ? { host: base.hostname, port: Number(base.port), protocol: base.protocol.replace(':', '') as 'http' | 'https' } : {}),
    });
  }
  return client;
}

/**
 * The Stripe coupon for a bundle saving ("BUNDLE10", "BUNDLE15"). Created on first use,
 * so there is nothing to set up in the Stripe dashboard.
 */
export async function bundleCoupon(s: Stripe, percent: number) {
  const id = `BUNDLE${percent}`;
  try {
    const c = await s.coupons.retrieve(id);
    if (c.valid && c.percent_off === percent) return id;
  } catch (e) {
    if ((e as { code?: string }).code !== 'resource_missing') throw e;
    await s.coupons.create({ id, percent_off: percent, duration: 'once', name: `Bundle & save ${percent}%` });
    return id;
  }
  throw new Error(`Stripe coupon ${id} exists but is not a valid ${percent}% coupon – delete it in the Stripe dashboard.`);
}

/** Short, human-friendly order number derived from the Checkout Session ID. */
export function orderRef(sessionId: string) {
  let h = 0;
  for (const ch of sessionId) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return `SN-${h.toString(36).toUpperCase().padStart(7, '0').slice(-7)}`;
}
