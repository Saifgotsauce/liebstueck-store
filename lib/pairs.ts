// Ad landing pages with exactly the shirts an ad shows (US store), at /pair/<slug>/.
// An ad can only link to one page; when it shows two shirts, she should land on those two,
// not on all 52 (Clarity, Nov 13: visitors from the two-shirt video scrolled the shop and tapped nothing).
// The headline repeats the ad's own banner, so the page feels like the next frame of the ad.

export type Pair = {
  slug: string;
  /** Same words as the ad's banner */
  headline: string;
  /** One line under the headline */
  intro: string;
  designs: [string, string];
  /** Which ad links here (for the analytics docs) */
  ad: string;
};

export const PAIRS: Pair[] = [
  {
    slug: 'say-what-they-think',
    headline: 'Shirts for women who say exactly what they think.',
    intro: 'The two from the video. Her friends already knew.',
    designs: ['older-i-get-heller-no', 'good-grandmas-bad-words'],
    ad: 'SEAS_US_ATC_SayWhatTheyThink_Vid_2611',
  },
];

export const getPair = (slug: string) => PAIRS.find((p) => p.slug === slug);

export const PAIR_COPY = {
  both: 'Get both',
  bothNote: (save: number) => `Buy the two together: you save ${save}% and shipping is free.`,
  sizeBoth: 'Size for both',
  sizeFor: (title: string) => `Size: ${title}`,
  differentSizes: 'Different size for each shirt',
  sameSize: 'Same size for both',
  addBoth: (total: string) => `Add both to cart – ${total}`,
  addOne: (price: string) => `Add to cart – ${price}`,
  pickSize: 'Pick a size first.',
  orOne: 'Or just one',
  details: 'More photos, sizes and details',
  inCart: 'In your cart',
  bothInCart: 'Both are in your cart',
  goToCart: 'Go to cart and check out',
  cartNow: (n: number, total: string, shipFree: boolean) => `Your cart: ${n} ${n === 1 ? 'item' : 'items'} · ${total}${shipFree ? ', shipping is free' : ' with shipping'}`,
  addOther: (title: string) => `Add ${title} too`,
  was: (price: string) => `instead of ${price}`,
  each: (price: string) => `${price} each`,
  seeShirt: (title: string) => `See ${title}`,
};
