// US T-shirt prices per design, in cents. Any design not listed costs the standard tee price
// (GARMENTS.tee.priceCents in lib/catalog.ts, $34.95). Size extras (2XL +$2 …) still apply.
// Hoodies and the German store have one price for every design.
//
// Ads say "tees from $29.95", so keep at least one design at that price in every collection
// you advertise. Stay between $29.95 and $34.95.
export const TEE_PRICE_US: Record<string, number> = {
  // $29.95: the 10 ad-test shirts + one or two per collection
  'not-old-seasoned': 2995,
  'coffee-hot-flashes-spite': 2995,
  'fluent-in-sarcasm': 2995,
  'fine-wine-cheap-tequila': 2995,
  'vintage-knees': 2995,
  'peaked-honey': 2995,
  'too-old-for-drama': 2995,
  'status-report': 2995,
  'dont-do-mornings': 2995,
  'say-what-im-thinking': 2995,
  'grandma-era': 2995,
  'spoiling-is-my-cardio': 2995,
  'officially-not-my-problem': 2995,
  'grill-nap-repeat': 2995,
  'nice-ish': 2995,
  // the video ad's shirt
  'good-grandmas-bad-words': 2995,

  // In between
  'older-i-get-heller-no': 3295,
  'the-grandma-they-warned-you-about': 3295,
  'my-weekend-lasts-all-week': 3195,
  'dear-santa-define-good': 3195,
};

/** Shop order for "All shirts": $29.95 shirts alternate with the rest, so the top of the page mixes prices. */
export function mixByPrice<T extends { slug: string }>(designs: T[]): T[] {
  const low = Math.min(...Object.values(TEE_PRICE_US));
  const cheap = designs.filter((d) => TEE_PRICE_US[d.slug] === low);
  const rest = designs.filter((d) => TEE_PRICE_US[d.slug] !== low);
  const out: T[] = [];
  for (let i = 0; i < Math.max(cheap.length, rest.length); i++) {
    if (cheap[i]) out.push(cheap[i]);
    if (rest[i]) out.push(rest[i]);
  }
  return out;
}
