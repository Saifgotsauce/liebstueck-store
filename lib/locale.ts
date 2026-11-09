// The two storefronts. 'en' = US store at /, 'de' = German store at /de/.
// The language follows the store: German designs, euro prices and shipping to Germany live
// only under /de/, so nobody orders a shirt in a language they didn't expect.
export type Locale = 'en' | 'de';
export const LOCALES: Locale[] = ['en', 'de'];
export const isLocale = (x: unknown): x is Locale => x === 'en' || x === 'de';

/** Page paths per store. German pages use German slugs. */
export const ROUTES = {
  en: {
    home: '/', shop: '/shop/', cart: '/cart/', checkout: '/cart/', thanks: '/thanks/', faq: '/faq/',
    shipping: '/shipping/', returns: '/returns/', privacy: '/privacy/', terms: '/terms/', privacyChoices: '/privacy-choices/',
  },
  de: {
    home: '/de/', shop: '/de/shop/', cart: '/de/warenkorb/', checkout: '/de/kasse/', thanks: '/de/danke/', faq: '/de/faq/',
    shipping: '/de/versand-zahlung/', returns: '/de/widerrufsbelehrung/', privacy: '/de/datenschutz/', terms: '/de/agb/', privacyChoices: '/de/cookie-einstellungen/',
    imprint: '/de/impressum/', withdraw: '/de/widerruf/',
  },
} as const;

export const shopPath = (locale: Locale, vibe?: string) => `${ROUTES[locale].shop}${vibe ? `${vibe}/` : ''}`;
export const productPath = (locale: Locale, slug: string) => `${locale === 'de' ? '/de' : ''}/p/${slug}/`;
