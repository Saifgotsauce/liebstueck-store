import 'server-only';
import crypto from 'node:crypto';
import type Stripe from 'stripe';
import { brand, formatPrice, siteUrl } from '../config';
import { FRIEND, REFERRAL, REWARD, referLink, type CodeInfo } from '../referral';
import { emailLayout, escapeHtml, sendEmail } from './email';

// Referral codes live in Stripe as promotion codes (see lib/referral.ts). We never let Stripe apply
// them directly: checkout folds the $5 and any bundle saving into one exact-amount coupon, and the
// webhook pays out rewards and retires used reward codes.

export type FoundCode = CodeInfo & { id: string; email: string };

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O, 1/I/L
const pick = (bytes: Buffer) => Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');

export function normalizeCode(raw: unknown) {
  const c = String(raw ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return c.length >= 4 && c.length <= 24 ? c : '';
}
export function normalizeEmail(raw: unknown) {
  const e = String(raw ?? '').trim().toLowerCase().slice(0, 200);
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) ? e : '';
}
export function cleanName(raw: unknown) {
  return String(raw ?? '').replace(/[^\p{L}\p{M}' -]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 40);
}

/** The Stripe coupon behind the promotion codes ($5 off once). Created on first use. */
async function backingCoupon(s: Stripe, cents: number) {
  const id = `FRIEND-USD-${cents}`;
  try {
    const c = await s.coupons.retrieve(id);
    if (c.valid && c.amount_off === cents) return id;
  } catch (e) {
    if ((e as { code?: string }).code !== 'resource_missing') throw e;
    await s.coupons.create({ id, amount_off: cents, currency: 'usd', duration: 'once', name: `Friend code ${formatPrice(cents, 'en')}` });
    return id;
  }
  throw new Error(`Stripe coupon ${id} exists but doesn't match – delete it in the Stripe dashboard.`);
}

/** A usable code (active, not expired, one of ours), or null. */
export async function findCode(s: Stripe, raw: unknown): Promise<FoundCode | null> {
  const code = normalizeCode(raw);
  if (!code) return null;
  const list = await s.promotionCodes.list({ code, limit: 1 });
  const p = list.data[0];
  if (!p || !p.active) return null;
  if (p.expires_at && p.expires_at * 1000 < Date.now()) return null;
  const kind = p.metadata?.kind;
  if (kind !== 'referral' && kind !== 'reward') return null;
  return {
    id: p.id,
    code: p.code,
    kind,
    cents: Number(p.metadata?.cents) || (kind === 'reward' ? REFERRAL.rewardCents : REFERRAL.friendCents),
    email: p.metadata?.email ?? '',
    name: p.metadata?.name ?? '',
  };
}

/** Sign-up: returns the person's code, creating it on first sign-up (same email → same code). */
export async function signUp(s: Stripe, email: string, name: string) {
  const existing = await s.customers.list({ email, limit: 10 });
  for (const c of existing.data) {
    const found = c.metadata?.ref_code ? await findCode(s, c.metadata.ref_code) : null;
    if (found?.kind === 'referral') return { code: found.code, isNew: false };
  }
  const prefix =
    name
      .normalize('NFD')
      .replace(/[^A-Za-z]/g, '')
      .toUpperCase()
      .slice(0, 8) || 'FRIEND';
  let code = '';
  for (let i = 0; i < 6 && !code; i++) {
    const candidate = prefix + pick(crypto.randomBytes(3));
    if (!(await s.promotionCodes.list({ code: candidate, limit: 1 })).data.length) code = candidate;
  }
  if (!code) throw new Error('Could not find a free referral code');
  await s.promotionCodes.create({
    promotion: { type: 'coupon', coupon: await backingCoupon(s, REFERRAL.friendCents) },
    code,
    metadata: { kind: 'referral', email, name, cents: String(REFERRAL.friendCents) },
  });
  await s.customers.create({ email, name, metadata: { ref_code: code, source: 'referral-signup' } });
  return { code, isNew: true };
}

export function signUpEmail(name: string, code: string) {
  const link = referLink(code);
  return emailLayout(
    `${name ? `${name}, here’s` : 'Here’s'} your friend code`,
    `<p style="font-size:28px;font-weight:bold;letter-spacing:2px;margin:8px 0 4px;color:#5B2A86">${escapeHtml(code)}</p>
<p>Your friends get <strong>${FRIEND} off</strong> with this code. Every time one of them orders, we email you <strong>${REWARD} off</strong> your next shirt.</p>
<p>Easiest way to share it: send this link. The ${FRIEND} comes off by itself.<br><a href="${link}">${escapeHtml(link)}</a></p>
<p style="font-size:14px;color:#5E5468"><a href="${siteUrl}${REFERRAL.path}">How it works</a></p>`,
  );
}

/** Deterministic reward code per order, so a retried webhook can't create two. */
function rewardCodeFor(sessionId: string) {
  return 'THANKS' + pick(crypto.createHash('sha256').update(sessionId).digest().subarray(0, 6));
}

/**
 * After a paid order: retire a used reward code, or pay the referrer her reward.
 * Never throws for the customer's sake – the caller logs problems.
 */
export async function settleCode(s: Stripe, o: { code: string; buyerEmail?: string; sessionId: string; buyerName?: string }) {
  const found = await findCode(s, o.code);
  if (!found) return 'not-found' as const;
  if (found.kind === 'reward') {
    await s.promotionCodes.update(found.id, { active: false, metadata: { used_session: o.sessionId } });
    return 'reward-used' as const;
  }
  if (!found.email || (o.buyerEmail && o.buyerEmail.toLowerCase() === found.email)) return 'self' as const;

  const code = rewardCodeFor(o.sessionId);
  const expiresAt = Math.floor(Date.now() / 1000) + REFERRAL.rewardValidDays * 86400;
  try {
    await s.promotionCodes.create(
      {
        promotion: { type: 'coupon', coupon: await backingCoupon(s, REFERRAL.rewardCents) },
        code,
        expires_at: expiresAt,
        max_redemptions: 1,
        metadata: { kind: 'reward', email: found.email, name: found.name ?? '', cents: String(REFERRAL.rewardCents), from_code: found.code, from_session: o.sessionId },
      },
      { idempotencyKey: `reward-${o.sessionId}` },
    );
  } catch (e) {
    // Already created on an earlier delivery of this webhook
    if ((await s.promotionCodes.list({ code, limit: 1 })).data.length) return 'reward-exists' as const;
    throw e;
  }
  const until = new Date(expiresAt * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const friend = o.buyerName ? escapeHtml(o.buyerName.split(' ')[0]) : 'A friend';
  await sendEmail(
    found.email,
    `${o.buyerName ? o.buyerName.split(' ')[0] : 'Your friend'} just ordered. Here’s your ${REWARD}.`,
    emailLayout(
      `${friend} used your code. Nice work.`,
      `<p>Here’s ${REWARD} off your next ${brand.name} order:</p>
<p style="font-size:28px;font-weight:bold;letter-spacing:2px;margin:8px 0;color:#5B2A86">${escapeHtml(code)}</p>
<p>Type it in your cart under <strong>“Have a code?”</strong>. It works once and is good until ${until}.</p>
<p>Your own friend code <strong>${escapeHtml(found.code)}</strong> keeps working. Every friend who orders earns you another ${REWARD}.</p>`,
    ),
  );
  return 'rewarded' as const;
}
