// Customer reviews. Only real reviews go in data/reviews.json – the stars, counts and the
// reviews section stay hidden until there are some. (Made-up or cherry-picked reviews are
// illegal in the US: FTC rule 16 CFR 465, fines per review.)
import data from '@/data/reviews.json';

export type Review = { design?: string; name: string; rating: number; text: string; date: string };

const ALL = (data as { reviews: Review[] }).reviews.filter((r) => r.rating >= 1 && r.rating <= 5 && r.text?.trim());

/** Reviews for one design, newest first. */
export function reviewsFor(slug: string) {
  return ALL.filter((r) => r.design === slug).sort((a, b) => b.date.localeCompare(a.date));
}

/** Average and count for a design, or null when it has no reviews yet. */
export function ratingFor(slug: string) {
  const list = reviewsFor(slug);
  if (!list.length) return null;
  const average = list.reduce((s, r) => s + r.rating, 0) / list.length;
  return { average: Math.round(average * 10) / 10, count: list.length };
}
