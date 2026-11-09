// ─────────────────────────────────────────────────────────────────────────────
// Brand + shop settings. Change the brand name, contact details, prices and
// shipping here — everything on the site reads from this file.
// Legal details (Impressum, EU Responsible Person) are placeholders: fill them
// in before going live. Square brackets [like this] mark what still needs data.
// ─────────────────────────────────────────────────────────────────────────────

import type { L } from './i18n';

export const brand = {
  name: 'Liebstück',
  tagline: { de: 'Persönliche Shirts für die Menschen, die zählen.', en: 'Personal shirts for the people who matter.' } as L,
  // Short line shown in the browser tab and search results
  description:
    'Personalisierte Shirts und Hoodies mit Namen – für Opa, Oma, die ganze Familie und runde Geburtstage. In der EU gedruckt.',
  email: 'hallo@example.com', // public support address (shown on the site)
};

export const shop = {
  currency: 'EUR' as const,
  // Flat shipping, free above the threshold (both in cents, VAT included)
  shippingCents: 495,
  freeShippingFromCents: 6000,
  deliveryText: { de: 'ca. 5–8 Werktage', en: '5–8 working days' } as L,
  deliveryMinDays: 5,
  deliveryMaxDays: 8,
  // Countries Stripe Checkout accepts as shipping address (EU only → no customs).
  shipToCountries: [
    'DE', 'AT', 'NL', 'BE', 'LU', 'FR', 'IT', 'ES', 'PT', 'IE', 'DK', 'SE', 'FI', 'PL',
    'CZ', 'SK', 'SI', 'HR', 'HU', 'RO', 'BG', 'GR', 'EE', 'LV', 'LT', 'CY', 'MT',
  ] as const,
  maxQuantityPerItem: 10,
  maxItemsPerOrder: 20,
};

// Seller / manufacturer details. Under the EU product safety rules (GPSR) the shop
// owner selling under its own brand counts as the manufacturer, even with print-on-demand.
export const legal = {
  companyName: '[Firmenname / Name des Inhabers]',
  representative: '[Vertretungsberechtigte Person]',
  street: '[Straße und Hausnummer]',
  city: '[PLZ und Ort]',
  country: '[Land]',
  phone: '[Telefonnummer – optional, aber empfohlen]',
  email: brand.email,
  vatId: '[USt-IdNr., falls vorhanden]',
  // EU Responsible Person (GPSR). If you use Printful's EU representative service,
  // copy the details shown in your Printful dashboard (Settings → GPSR) here.
  euResponsiblePerson: {
    name: '[Name der EU-verantwortlichen Person]',
    address: '[Anschrift in der EU]',
    email: '[E-Mail]',
  },
};

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
export const isDemo = process.env.NEXT_PUBLIC_DEMO === '1';

export { formatPrice } from './i18n';
