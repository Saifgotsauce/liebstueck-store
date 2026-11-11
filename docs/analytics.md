# Analytics: following a customer from the ad to the sale

Three tools, each for a different question. All of them respect the visitor's choice (US store: on unless
they opt out or send Global Privacy Control; German store: Meta events only after they accept the banner;
Google Analytics and Clarity are **US store only** until the German banner and Datenschutz text cover them).

| Tool | Answers | Needs |
| --- | --- | --- |
| Meta Pixel + Conversions API | Which ads bring buyers; feeds Meta's ad optimisation | `NEXT_PUBLIC_META_PIXEL_ID`, `META_CAPI_TOKEN` |
| Google Analytics 4 | Funnel numbers, drop-off by page, by campaign and ad | `NEXT_PUBLIC_GA_ID` (G-XXXXXXXXXX) |
| Microsoft Clarity (free) | WHY: session replays, heatmaps, scroll maps, rage and dead clicks | `NEXT_PUBLIC_CLARITY_ID` |

Add the IDs in Vercel (Settings → Environment Variables, Production) and redeploy.

## Ad links: tag every ad

Put this on the end of every ad's website URL (Meta Ads Manager → ad → Tracking → URL parameters):

```
utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{adset.name}}
```

The site keeps these for the whole visit and attaches them to every event, so each recording and each
funnel step can be split by campaign, ad set and ad. Name ads by creative (e.g. `meme-warning-v2`).

## Events

Standard shopping events (Meta + GA4 + Clarity): `ViewContent` (view_item), `AddToCart`, `InitiateCheckout`
(begin_checkout), `Purchase` (also sent server-side).

Referral program: `ReferralSignup` (got a friend code), `ReferralShared` (method: sms, facebook, copy),
`ReferralCodeApplied` (kind: referral or reward; source: link or cart).

Custom events (Meta custom events, GA4 snake_case, Clarity events):

| Event | Fires when | Useful params |
| --- | --- | --- |
| `LandingPage` | first page of a visit | `page`, `page_type` |
| `ViewCategory` | a collection page opens | `category` |
| `ScrollDepth` | 25 / 50 / 75 / 100 % of a page | `depth`, `page` |
| `TimeOnPage` | 10 / 30 / 60 / 120 / 300 s of visible time | `seconds`, `page` |
| `PageExit` | visitor leaves a page | `seconds`, `max_scroll`, `exit` (`next_page` or `closed_or_external`) |
| `ProductClick` | a product link is clicked | `product`, `from` |
| `UiClick` | CTA buttons, header/nav and footer links | `kind`, `label` |
| `FieldFocus` | a form field is touched (name only, never the value) | `field`, `page` |
| `PhotoViewed`, `GarmentSelected`, `ColorSelected`, `SizeSelected`, `QuantitySelected`, `SizeGuideOpened` | product page choices | `product`, choice |
| `AddToCartBlocked` | "Add to cart" pressed but something is missing | `reason`: `no_size_chosen`, `missing_personalization`, `set_item_unavailable` |
| `CartViewed`, `CartQuantityChanged`, `CartItemRemoved` | cart behaviour | |
| `CheckoutError` | checkout could not start | `message` |

`PageExit` with `exit=closed_or_external` is the page they actually left the shop from. On exit, browsers may
drop the Meta request; GA4 uses a beacon and Clarity records the exit itself, so use those for exact exit pages.

## Reading the funnel: ad problem or site problem?

1. **Ad creative problem:** low CTR or low hook rate in Ads Manager. People aren't clicking; the site is irrelevant.
2. **Click → landing gap:** Ads Manager link clicks far above `LandingPage` events means the site loads too slowly or people bounce first.
3. **Landing but no engagement:** low `ScrollDepth` 50 / `TimeOnPage` 10s means the ad's promise doesn't match the page, or the top of the page doesn't hook. Watch Clarity recordings of those visits.
4. **ViewContent → AddToCart low:** product page. Check `AddToCartBlocked` reasons, `SizeGuideOpened`, `SizeSelected`, and the Clarity scroll map.
5. **AddToCart → InitiateCheckout low:** cart. Look at `CartItemRemoved`, shipping cost shown, and recordings.
6. **InitiateCheckout → Purchase low:** Stripe checkout and `CheckoutError`.

Never put personal data (names, emails, typed values) in event params.
