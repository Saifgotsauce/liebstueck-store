# Liebstück – personalised print-on-demand shop for EU customers

A custom Next.js store for name-personalised shirts and hoodies aimed at German-speaking
customers. Customers type names, see a live preview, pay through Stripe, and the order
goes to Printful automatically. Printful prints in its EU facilities and ships the order.

"Liebstück" is a working name. Change it in `lib/config.ts`.

## What's built

| Area | What it does |
|---|---|
| **Live personaliser** | Three designs (grandparents with grandkids' names, family Christmas, "Jahrgang" birthday). The preview runs on the same code and fonts as the print file, so what the customer sees is what gets printed. On phones the preview stays visible while they type. |
| **Print files** | `/api/print-file` renders a print-ready PNG at the exact size Printful needs. The URLs are signed, so only real orders can render one. |
| **Checkout** | Stripe Checkout in German, EU shipping countries only. Prices are checked on the server, flat shipping with free shipping from €60, delivery estimate shown. |
| **Fulfilment** | The Stripe webhook creates the Printful order. It is safe to retry and never creates an order twice. Orders start as **drafts** so you can check them; flip `PRINTFUL_AUTO_CONFIRM=true` later. |
| **Emails** (Resend) | Order confirmation with the full Widerrufsbelehrung, a shipping email with tracking (via Printful webhook), withdrawal receipt, and an owner alert when an order fails. |
| **EU rules** | "Vertrag hier widerrufen" button and form (required since 19 June 2026), personalised-goods exemption shown on the product page, cart and checkout, GPSR product-safety block, fibre composition and care info, "inkl. MwSt." price notices, legal page templates. |
| **Ads** | Meta Pixel (only after cookie consent) plus a server-side Purchase event via the Conversions API with the same event ID, so Meta counts each purchase once. |
| **German / English** | A DE/EN switch in the header. German browsers start in German, all other browsers in English, and the visitor's choice is saved. Product texts, sizes, errors, legal pages, the Stripe payment page and customer emails follow the chosen language. Emails to you (new orders, problems, withdrawals) are always in English. The text printed on the shirts stays German. |
| **Upsell** | After adding to cart: "Make a matching one for Oma" / "Next family member", plus a progress note toward free shipping. These push order value up, which you need because POD margins are thin. |

## Run it locally

```bash
npm install
cp .env.example .env.local     # fill in what you have; the storefront works without keys
npm run dev                    # http://localhost:3000
```

Other commands:

```bash
npm run printful:sync          # pull Printful variant IDs, costs, EU availability, print sizes
npm run test:print             # render sample print files into test-output/
npm run test:e2e               # full flow against mock Stripe + Printful (no accounts needed)
npm run build:preview          # one-file click-through preview (no checkout): preview/liebstueck-preview.html
npm run build:demo             # static export of all pages (no checkout) into demo-out/
```

## Go-live steps

1. **Printful**: create an account and a "Manual order / API" store. Under Settings → API, create a private token with order + product + webhook scopes. Put it in `.env.local` as `PRINTFUL_API_TOKEN`.
2. Run the sync: either `npm run printful:sync` locally, or with no local setup: add `PRINTFUL_API_TOKEN` as a GitHub repo secret, then GitHub → Actions → **Printful sync** → Run workflow (it commits the result, and Vercel redeploys). It prints the cost per colour and size and the net margin for each, and flags any colour that's missing or not printable in the EU. If a colour name doesn't match, fix `printfulColor` in `lib/catalog.ts` and run it again. Commit the generated `data/printful-variants.json`.
3. **Stripe**: create an account and turn on the payment methods German buyers expect (PayPal, Klarna, SEPA, cards, Apple/Google Pay) under Settings → Payment methods. Copy the secret key into `STRIPE_SECRET_KEY`.
4. **Deploy on Vercel**: import the repo, add every variable from `.env.example` (generate `PRINT_FILE_SECRET` and `PRINTFUL_WEBHOOK_SECRET` with `openssl rand -hex 32`), and set `NEXT_PUBLIC_SITE_URL` to your domain.
5. **Stripe webhook**: Developers → Webhooks → add `https://YOUR-DOMAIN/api/webhooks/stripe` with the events `checkout.session.completed`, `checkout.session.async_payment_succeeded` and `checkout.session.async_payment_failed`. Copy the signing secret into `STRIPE_WEBHOOK_SECRET` and redeploy.
6. **Printful webhook** (shipping emails): `npm run printful:sync -- --webhook` with your live `NEXT_PUBLIC_SITE_URL` set, or run the **Printful sync** action with “Also register the shipping-email webhook” ticked (needs secret `PRINTFUL_WEBHOOK_SECRET` and variable `SITE_URL`).
7. **Email**: verify your domain at resend.com, then set `RESEND_API_KEY`, `EMAIL_FROM` and `OWNER_EMAIL`.
8. **Test order** in Stripe test mode with card 4242 4242 4242 4242. Check the draft in Printful: open the print file and check placement and colours. Then switch to live keys.
9. **Meta (optional)**: set `NEXT_PUBLIC_META_PIXEL_ID`, and add `META_CAPI_TOKEN` from Events Manager → Settings → Conversions API.

## Before taking real money (legal checklist)

These are templates and placeholders, not legal advice. Have a German e-commerce lawyer or a
legal-text service (IT-Recht Kanzlei, Händlerbund, Trusted Shops) check everything.

- [ ] Fill in every `[placeholder]` in `lib/config.ts`. The **Impressum must show a real name or company and a postal address**. If you don't want your personal name and address on it, set up a company and/or use a registered business address.
- [ ] **EU Responsible Person (GPSR)**: copy the representative details from Printful (Settings → GPSR) into `legal.euResponsiblePerson`.
- [ ] **VAT**: as a non-EU seller shipping from EU stock you need EU VAT registration (OSS). Talk to an accountant or a VAT service. `STRIPE_AUTOMATIC_TAX=true` lets Stripe Tax calculate it.
- [ ] **Textile EPR**: some EU countries (e.g. France) already require registration for textile sellers, and all must have a scheme by 2028. Ask Printful or a compliance service which ones apply to you.
- [ ] Replace the AGB / Datenschutz / Widerrufsbelehrung templates in `lib/legal-texts.ts` with reviewed texts, in **both German and English** (the shop offers both, so the English versions need review too), and add the return address.
- [ ] **Jahrgang design**: if a customer only enters a birth year and no name, have the lawyer confirm whether the personalised-goods exemption still applies.
- [ ] Check the size charts in `lib/catalog.ts` against Printful's product pages.
- [ ] Check that the order button wording on Stripe's page meets the German "Button-Lösung" rule (Stripe shows "Bezahlen" in German).

## Changing things

- **Brand, prices, shipping, delivery time**: `lib/config.ts` and `GARMENTS[...].priceCents` in `lib/catalog.ts`.
- **Colours / garments**: `lib/catalog.ts`, then run `npm run printful:sync` again.
- **New design**: add a template in `lib/design/templates.ts`. It's a function that returns SVG in a 1200 × 1600 space, using `svgText`, `fitSize` and the shapes helpers. Then add a product in `PRODUCTS`. Run `npm run test:print` to check it renders, including umlauts and long names.
- **New font**: add the TTF to `assets/fonts` and `public/fonts`, register it in `scripts/font-metrics.mjs`, `lib/design/text.ts`, `lib/print/render.ts` and `app/globals.css`, then run `npm run fonts:metrics`.
- **Wording / translations**: interface text is in `lib/i18n/messages.ts` (German and English side by side). Product, garment and design-field texts are next to them in `lib/catalog.ts` and `lib/design/templates.ts` as `{ de, en }`. Legal texts are in `lib/legal-texts.ts`.
- **Another language** (e.g. French): add `'fr'` to `Locale` in `lib/i18n/index.ts`. TypeScript will then point to every place that needs a French text.

## Project map

```
app/                     pages (home, product, cart, thank-you, withdrawal, legal) + api/
components/              ShirtPreview (mockup + live design), Personalizer, Header, Footer, cookie banner, pixel
lib/design/              templates, text measuring, validation – shared by browser and server
lib/print/render.ts      server PNG rendering (resvg)
lib/server/              Stripe, Printful, email, Meta CAPI, signed print-file URLs
lib/catalog.ts           garments, colours, sizes, products, Printful variant lookup
lib/legal-texts.ts       German legal page templates
data/printful-variants.json   generated by npm run printful:sync
scripts/                 sync, tests, demo build, font metrics
```
