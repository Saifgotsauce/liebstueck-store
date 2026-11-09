import 'server-only';
import { env, requireEnv } from './env';

// Minimal Printful API v1 client: https://developers.printful.com/docs/
const BASE = process.env.PRINTFUL_API_BASE || 'https://api.printful.com'; // override only for local tests

async function call<T>(method: string, path: string, body?: unknown): Promise<{ status: number; data: T | null; error?: string }> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${requireEnv('printfulToken')}`,
    'Content-Type': 'application/json',
  };
  if (env.printfulStoreId) headers['X-PF-Store-Id'] = env.printfulStoreId;
  const res = await fetch(`${BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined, cache: 'no-store' });
  const json = (await res.json().catch(() => null)) as { result?: T; error?: { message?: string } } | null;
  if (!res.ok) return { status: res.status, data: null, error: json?.error?.message || `Printful HTTP ${res.status}` };
  return { status: res.status, data: (json?.result ?? null) as T | null };
}

export type PrintfulRecipient = {
  name: string;
  address1: string;
  address2?: string;
  city: string;
  zip: string;
  country_code: string;
  state_code?: string;
  email?: string;
  phone?: string;
};

export type PrintfulOrderItem = {
  variant_id: number;
  quantity: number;
  retail_price: string;
  name: string;
  files: { type: string; url: string }[];
};

type PrintfulOrder = { id: number; external_id: string; status: string };

/** Looks an order up by our own external ID ("@" prefix). Returns null if it doesn't exist. */
export async function findOrder(externalId: string) {
  const r = await call<PrintfulOrder>('GET', `/orders/@${encodeURIComponent(externalId)}`);
  if (r.status === 404) return null;
  if (r.error) throw new Error(r.error);
  return r.data;
}

/**
 * Creates the order. With PRINTFUL_AUTO_CONFIRM=false (default) it lands as a draft in
 * the Printful dashboard for a manual check; set it to true once you trust the flow.
 */
export async function createOrder(input: {
  externalId: string;
  recipient: PrintfulRecipient;
  items: PrintfulOrderItem[];
  retailCosts: { currency: string; subtotal: string; discount?: string; shipping: string; tax?: string; total: string };
}) {
  const r = await call<PrintfulOrder>('POST', `/orders${env.printfulAutoConfirm ? '?confirm=true' : ''}`, {
    external_id: input.externalId,
    shipping: 'STANDARD',
    recipient: input.recipient,
    items: input.items,
    retail_costs: input.retailCosts,
  });
  if (r.error || !r.data) throw new Error(r.error || 'Printful order failed');
  return r.data;
}
