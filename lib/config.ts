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

import type { Locale } from './locale';

type Bundle = { minItems: number; percent: number };
export type Store = {
  locale: Locale;
  currency: 'USD' | 'EUR';
  /** Intl locale for numbers and dates */
  intl: string;
  /** Prices already include VAT (Germany) or tax is added at checkout (US). */
  vatIncluded: boolean;
  shippingCents: number;
  freeShippingFromCents: number;
  bundles: Bundle[];
  deliveryMinDays: number;
  deliveryMaxDays: number;
  shipToCountries: readonly string[];
  /** Printful stock region to check availability against */
  fulfilmentRegion: 'US' | 'EU';
  maxQuantityPerItem: number;
  maxItemsPerOrder: number;
  holiday: { name: string; orderBy: string };
  /**
   * Store-wide sale. Off (null) until you run a real one, e.g. { percent: 20, label: 'Black Friday', ends: 'Monday' }.
   * When on, every price drops by `percent` at checkout too, and the regular price shows crossed out.
   * US (FTC 16 CFR 233): only cross out a price you really charged for a good while before the sale.
   * Germany (§ 11 PAngV): the crossed-out price must be your lowest price of the last 30 days.
   */
  sale: null | { percent: number; label: string; ends?: string };
};

const BUNDLES: Bundle[] = [
  { minItems: 3, percent: 15 },
  { minItems: 2, percent: 10 },
];

export const stores: Record<Locale, Store> = {
  en: {
    locale: 'en',
    currency: 'USD',
    intl: 'en-US',
    vatIncluded: false,
    shippingCents: 495,
    freeShippingFromCents: 5000,
    bundles: BUNDLES,
    deliveryMinDays: 5,
    deliveryMaxDays: 9,
    shipToCountries: ['US'],
    fulfilmentRegion: 'US',
    maxQuantityPerItem: 10,
    maxItemsPerOrder: 20,
    holiday: { name: 'Christmas', orderBy: '2026-12-11' },
    sale: null,
  },
  de: {
    locale: 'de',
    currency: 'EUR',
    intl: 'de-DE',
    vatIncluded: true,
    shippingCents: 495,
    freeShippingFromCents: 5000,
    bundles: BUNDLES,
    // printed in Printful's EU facilities (2–5 days) + 4–7 days to Germany
    deliveryMinDays: 6,
    deliveryMaxDays: 10,
    shipToCountries: ['DE'],
    fulfilmentRegion: 'EU',
    maxQuantityPerItem: 10,
    maxItemsPerOrder: 20,
    holiday: { name: 'Weihnachten', orderBy: '2026-12-10' },
    sale: null,
  },
};

/** The US store (most of the code was written for it first). */
export const shop = stores.en;

// Shown on the policy pages. No street address is shown publicly unless you add one here.
export const legal = {
  businessName: '[Legal business name]',
  contactEmail: brand.email,
  // Where returns or legal letters can be sent (optional; leave the brackets to hide it)
  mailingAddress: '[Mailing address]',
  governingLaw: '[State], United States',
  lastUpdated: 'November 9, 2026',
};

/**
 * German store: seller details for the Impressum, GPSR and the legal pages.
 * German law (§ 5 DDG) needs a real name and a postal address that can receive letters
 * (a business address service is fine, a PO box is not). Fill these in before German ads run.
 */
export const legalDe = {
  name: '[Vor- und Nachname]',
  /** optional trading name shown after the name, e.g. "Seasoned" */
  tradingAs: brand.name,
  street: '[Straße und Hausnummer]',
  city: '[PLZ und Ort]',
  country: '[Land]',
  email: brand.email,
  phone: '', // optional
  vatId: '', // USt-IdNr., once you have one
  /** Where withdrawn (non-personalized) shirts go back to. Printful doesn't take returns, so use your own address. */
  returnAddress: '[Rücksendeadresse]',
  /** EU responsible person for product safety (GPSR) – Printful's, unless you have your own in the EU */
  euResponsible: { name: 'SINDEN VENTURES LIMITED', address: 'Markou Evgenikou 11, Mesa Geitonia 4002 Limassol, Zypern', email: 'gpsr@sindenventures.com' },
  lastUpdated: '9. November 2026',
};

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
export const isDemo = process.env.NEXT_PUBLIC_DEMO === '1';

const MONEY: Record<Locale, [Intl.NumberFormat, Intl.NumberFormat]> = {
  en: [new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }), new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })],
  de: [new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }), new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })],
};
/** $29.95 / 29,95 €, but $50 / 50 € for round amounts. */
export function formatPrice(cents: number, locale: Locale = 'en') {
  const [money, whole] = MONEY[locale];
  return cents % 100 === 0 ? whole.format(cents / 100) : money.format(cents / 100);
}

export const isPlaceholder = (s: string) => /^\[.*\]$/.test(s.trim());
