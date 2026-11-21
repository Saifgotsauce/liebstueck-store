// Customer reviews. Only real reviews: customers post them on the product page (stored in
// Vercel Blob, see lib/server/reviews.ts) and reviews collected by hand go in data/reviews.json.
// Stars, counts and the review list stay hidden until there are some. Never add made-up,
// edited or cherry-picked reviews, and never take a review down for being negative
// (FTC rule 16 CFR 465: fines per review). Spam, abuse and off-topic posts may go.

export type Review = {
  /** design slug; omit for a review of the whole store */
  design?: string;
  name: string;
  rating: number;
  text: string;
  /** YYYY-MM-DD */
  date: string;
  /** public photo URL, if the customer added one */
  photo?: string;
  /** the email they gave matches a paid order */
  verified?: boolean;
  hidden?: boolean;
};

export type Rating = { average: number; count: number };

export const REVIEW_LIMITS = { name: 40, text: 1500, minText: 10, photoBytes: 4 * 1024 * 1024 };

/** "Linda Robertson" → "Linda R." – full surnames stay off the site. */
export function shortName(raw: string) {
  const parts = raw.replace(/\s+/g, ' ').trim().split(' ');
  if (parts.length < 2) return parts[0] ?? '';
  const last = parts[parts.length - 1];
  return `${parts.slice(0, -1).join(' ')} ${last[0].toUpperCase()}.`;
}
