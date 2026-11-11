// "Give $5, get $5" (US store only). Shared by browser and server – no secrets here.
//
// Anyone signs up on /refer (or the homepage) with first name + email and gets a code, e.g. LINDA7KQ.
// A friend who uses it gets $5 off. When the friend's order is paid, the referrer is emailed her own
// single-use $5 code (THANKS…). Codes live in Stripe as promotion codes (no database):
//   metadata.kind = 'referral' (friend code, reusable) | 'reward' (single use, retired after use).
import { formatPrice, siteUrl } from './config';

export const REFERRAL = {
  /** What the friend gets off her order. */
  friendCents: 500,
  /** What the referrer gets for each friend who orders. */
  rewardCents: 500,
  /** How long a reward code stays valid. */
  rewardValidDays: 365,
  path: '/refer',
} as const;

export const FRIEND = formatPrice(REFERRAL.friendCents, 'en');
export const REWARD = formatPrice(REFERRAL.rewardCents, 'en');

export const referLink = (code: string) => `${siteUrl}/?ref=${encodeURIComponent(code)}`;

/** Pre-filled share message. Says plainly that the sender gets something too (FTC endorsement rules). */
export const shareText = (code: string) =>
  `Found shirts that say what we're all thinking. Here's ${FRIEND} off your first one: ${referLink(code)} (Full disclosure: I get ${REWARD} off too.)`;

export type CodeInfo = { code: string; kind: 'referral' | 'reward'; cents: number; name?: string };

/** The rules, shown on /refer. Plain words, no small print. */
export const REFERRAL_RULES = [
  `Your friend gets ${FRIEND} off her order with your code or link. One code per order.`,
  `When her order is paid, we email you a ${REWARD} code for your next order. It works once and is good for ${REFERRAL.rewardValidDays / 365 === 1 ? 'a year' : `${REFERRAL.rewardValidDays} days`}.`,
  'No limit: every friend who orders earns you another code.',
  'Your friend has to order with a different email address than yours. Codes can’t be swapped for cash.',
  'Codes work on top of the bundle savings (2 shirts save 10%, 3 or more save 15%).',
  'Your friend sees your first name when she opens your link, so she knows who sent it.',
];
