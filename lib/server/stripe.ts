import 'server-only';
import Stripe from 'stripe';
import { requireEnv } from './env';

let client: Stripe | null = null;

export function stripe() {
  if (!client) {
    // STRIPE_API_BASE is only for local end-to-end tests against a mock server.
    const base = process.env.STRIPE_API_BASE ? new URL(process.env.STRIPE_API_BASE) : null;
    client = new Stripe(requireEnv('stripeSecretKey'), {
      appInfo: { name: 'liebstueck-store' },
      ...(base ? { host: base.hostname, port: Number(base.port), protocol: base.protocol.replace(':', '') as 'http' | 'https' } : {}),
    });
  }
  return client;
}

/** Short, human-friendly order number derived from the Checkout Session ID. */
export function orderRef(sessionId: string) {
  let h = 0;
  for (const ch of sessionId) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return `LS-${h.toString(36).toUpperCase().padStart(7, '0').slice(-7)}`;
}
