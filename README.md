# Seasoned – funny shirts for women who are aging out loud (US store)

Next.js shop in the style of Regular Mess: a big catalog of slogan tees and hoodies, shop by vibe,
live personalization (names, years, ages), bundle savings, Stripe Checkout and automatic
fulfilment through Printful. The German "Liebstück" version is kept at git tag `liebstueck-de-v1`.

## How it works

- **Designs** live in `lib/designs.ts` – the phrase bank. Each design is a phrase + a layout
  (`lib/design/layouts.ts`: stack, badge, warning label, checklist, quote, vintage year, names)
  + optional personalization fields. The same code draws the live preview in the browser and the
  print file Printful downloads (`/api/print-file`), so the preview is exactly what gets printed.
- **Garments, colors, sizes, prices** – `lib/catalog.ts`. **Brand, shipping, bundles, holiday
  deadline** – `lib/config.ts`.
- **Checkout** – `/api/checkout` re-validates everything, prices come from the catalog, bundle
  savings become Stripe coupons (`BUNDLE10`, `BUNDLE15`, created automatically on first use).
- **Fulfilment** – Stripe webhook → Printful order (idempotent) → confirmation email (Resend)
  → Meta Conversions API. Printful's shipping webhook sends the tracking email.

## Add a design (the "AI-run" loop)

1. Write the phrase in `lib/designs.ts` (copy an entry, new slug).
2. `npm run design:sheet -- <slug>` → check it in `out/designs/`.
3. Check the phrase at tmsearch.uspto.gov (trademarks) before advertising it.
4. `npm run render:mockups -- <slug>` → link-preview image (`public/og/`) and ad images
   (`out/creatives/<slug>-feed.jpg`, `-story.jpg`).
5. Commit and push – Vercel deploys.

## Setup

1. **Printful**: set your billing currency to USD (Settings → Billing) so costs compare 1:1.
   Then GitHub → Actions → "Printful sync" → Run workflow (tick *photos* once the site is live).
   This fills `data/printful-variants.json` with variant IDs, US stock and garment photos.
2. **Vercel**: add the variables from `.env.example`.
3. **Stripe**: add a webhook to `https://your-domain.com/api/webhooks/stripe` for
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
   `checkout.session.async_payment_failed`. Turn on Apple Pay / Google Pay / Link in
   Settings → Payment methods.
4. **Before launch**: fill the `[placeholders]` in `lib/config.ts` (business name, mailing
   address, governing state) and the support email.

## Commands

| | |
|---|---|
| `npm run dev` | local shop |
| `npm run test:e2e` | full flow against mock Stripe/Printful/Resend |
| `npm run test:print` | stress-test personalization (longest names, most names, accents) |
| `npm run design:sheet` | contact sheets of every design |
| `npm run render:mockups` | link-preview + ad images for every design |
| `npm run fonts:metrics` | rebuild font metrics after adding a print font |

Fonts are under the SIL Open Font License (Permanent Marker: Apache 2.0) – see `assets/fonts/FONT-LICENSES.md`.
