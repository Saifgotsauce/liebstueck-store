// ─────────────────────────────────────────────────────────────────────────────
// Brand + shop settings. Change the brand name, contact details, prices, shipping
// and offers here – everything on the site reads from this file.
// Square brackets [like this] mark details to fill in before launch.
// ─────────────────────────────────────────────────────────────────────────────

export const brand = {
  name: 'Seasoned',
  tagline: 'Not old. Seasoned.',
  // Browser tab + search results
  description:
    'Funny shirts for women who are getting older out loud: aging, grandma life, retirement and milestone birthdays. Personalize with names and years. Printed to order.',
  email: 'hello@example.com', // public support address (shown on the site)
};

export const shop = {
  currency: 'USD' as const,
  locale: 'en-US',
  // Flat shipping, free from the threshold (merchandise total after bundle savings)
  shippingCents: 495,
  freeShippingFromCents: 5000,
  // Multi-buy savings on the merchandise total – best tier wins
  bundles: [
    { minItems: 3, percent: 15 },
    { minItems: 2, percent: 10 },
  ],
  // Printing (2–5 business days) + US standard shipping (3–4 business days)
  deliveryMinDays: 5,
  deliveryMaxDays: 9,
  // Countries Stripe Checkout accepts as a shipping address
  shipToCountries: ['US'] as const,
  // Printful region a variant must be in stock in to be sold
  fulfilmentRegion: 'US',
  maxQuantityPerItem: 10,
  maxItemsPerOrder: 20,
  // Seasonal deadline shown in the top bar and on product pages until `orderBy` passes.
  // Printful's US-to-US apparel cutoff for standard shipping – re-check printful.com/holiday-order-deadlines each year.
  holiday: { name: 'Christmas', orderBy: '2026-12-11' },
};

// Shown on the policy pages. No street address is shown publicly unless you add one here.
export const legal = {
  businessName: '[Legal business name]',
  contactEmail: brand.email,
  // Where returns or legal letters can be sent (optional; leave the brackets to hide it)
  mailingAddress: '[Mailing address]',
  governingLaw: '[State], United States',
  lastUpdated: 'November 9, 2026',
};

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
export const isDemo = process.env.NEXT_PUBLIC_DEMO === '1';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const whole = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
/** $29.95, but $50 rather than $50.00 for round amounts. */
export function formatPrice(cents: number) {
  return cents % 100 === 0 ? whole.format(cents / 100) : money.format(cents / 100);
}

export const isPlaceholder = (s: string) => /^\[.*\]$/.test(s.trim());
