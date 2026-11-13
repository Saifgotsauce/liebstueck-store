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
| `CartSizeChanged` | size changed with the picker in the cart | `product`, `from`, `to` |
| `CartItemEdited` | "Save changes" on a shirt opened from the cart (`?edit=`) | `product`, `from` (`main` or `sticky`) |
| `AddedOneMore` | "Add one more of this one" in the confirmation (also fires `AddToCart`) | `product` |
| `PairAdded` | Add to cart on an ad landing page (`/pair/<slug>/`, also fires `AddToCart`) | `pair`, `which` (`both` or the shirt) |
| `PreviewEnlarged` | the large live preview is opened | `product`, `from` (`gallery` or `fields`) |
| `CheckoutError` | checkout could not start | `message` |

`UiClick` labels for the way to the cart: `sticky-go-to-cart` (product page bar after adding), `added-go-to-cart`
(confirmation on the product page), `cart-bar-go-to-cart` (bar on shop, collection and home pages).

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

## Site changes to compare against

Note every change to a landing page here, so Clarity and GA can be compared before and after.
Change one thing at a time: page **or** ad, never both in the same few days.

| When (Mountain time) | What changed | Baseline before |
| --- | --- | --- |
| Nov 11, 2026, about 11:30 pm | Product page rebuilt for phones: one-line banner, shorter photo, name and price on the first screen, size picker and button moved up (from 3–4 screens down to 1–2), no sticky bar on arrival | `/p/say-what-im-thinking`, 27 phone visits from the ad: 89% never scrolled past the top 5%, nobody past 15%, 0 taps, 0 real add-to-carts |
| Nov 12, 2026, early morning | Whole-site audit: pages made lighter (WebP photos in phone sizes, WOFF2 fonts, gallery loads one photo ahead), shipping cost shown under Add to cart, home page shows the red button on the first screen and shirts right after the hero, shorter shop header, cart code box collapsed and checkout button higher, 404 page inside the store | Page weight on a phone before → after: ad product page 1.87 → 1.14 MB (pictures + fonts 1.10 MB → 0.45 MB), home 2.41 → 1.30 MB, shop 2.62 → 1.34 MB, collection 3.00 → 1.05 MB. Clarity load time before: 3.7 s. Home red button at 780 px → 570 px; cart checkout button at 1045 px → 796 px |
| Nov 12, 2026, afternoon | After "Add to cart" the button and the sticky bar turn into "In your cart" with the way to the cart (a repeat tap can no longer add a second shirt); confirmation shows the cart's count and total and sits where the button was; cart bar on phones while browsing with something in the cart; size can be changed in the cart, and every cart line opens the shirt for editing (`?edit=`); the personalised preview enlarges on tap and a print preview sits with the name fields | One real shopper from the video ad (Nov 12, 7:31 am, phone, 9 minutes, 23 pages): tapped the sticky Add to cart 4 times in 8 seconds and got 4 shirts, tapped the preview note 3 times with nothing happening, rebuilt a personalised shirt to fix it and removed the old one, viewed the cart 3 times, never tapped checkout, left from the shop page with about 6 shirts. Meta: 6 AddToCart, 0 InitiateCheckout |
| Nov 13, 2026, evening | Ad landing page `/pair/say-what-they-think/` with only the two shirts from the video (The Older I Get, Good Grandmas), "Get both" first; Heller No to $34.95 to match the video; new campaign optimised for Add to cart at $12/day | Video ad landed on /shop: 17 phone visits, 9 taps in 3 days; CPM $121 (today $166); 1 purchase, $63.80 spent |
