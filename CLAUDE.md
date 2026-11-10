# Seasoned store (oldseasoned.com)

Print-on-demand shirts for women aged 50–70 (US store at `/`, German store at `/de/`). Next.js on Vercel,
Stripe checkout, Printful fulfilment.

**Before changing any page, copy, colour or shirt design, read `docs/design-rules.md` and follow it.**
Those rules come from customer research on this exact audience and override general design trends.

- Shirt designs: `lib/designs.ts` (US) and `lib/designs-de.ts` (DE); print colours in `lib/design/types.ts`.
- Site copy: `lib/messages.tsx` (both stores); US promise, order steps and contact copy in `lib/promise.ts`;
  policy pages under `app/(us)/` and `app/de/`. Trust components (photos, payment logos, promise): `components/Trust.tsx`.
- Lifestyle photos: `public/lifestyle/` (900px and 1536px, webp + jpg).
- After touching shirt colours or accents run `npm run check:contrast`; after copy/layout changes run `npm run test:e2e`.
- Store settings (prices, shipping, contact): `lib/config.ts`.
- Analytics events: `docs/analytics.md`.
- Never add fake reviews, ratings, urgency timers or stock counts.
