# Seasoned design rules

Who every page, shirt and ad is for: **a woman of 50 to 70 who doesn't feel old and hates being treated
like she is.** She's funny, a bit sarcastic and on Facebook every day. She grew up on TV ads and spots a
sales pitch fast. She reads before she buys, she buys when she's in the mood, and if she likes it she tells
her friends. Often the buyer is her daughter or her best friend, shopping for her.

These rules beat personal taste, design trends and anything that "looks modern". If a choice helps her
read, trust or laugh, it's right. If it only impresses designers, it's wrong.

Customer research: `docs/` and the two research files in the project chat (who she is, the trust plan).

---

## 1. The look: a warm catalogue, not a tech start-up

Think of a friendly boutique catalogue on the kitchen table: big photos of real women, clear prices,
headings you can read from the sofa.

- **Do:** big real photos of women her age laughing; serif headings (Fraunces); plain white or soft lilac
  backgrounds; one clear button per section; words next to every icon; prices and delivery times in plain
  sight.
- **Don't:** dark mode, glassy blur panels, gradient blobs, neon, bento grids, tiny grey captions, giant
  headlines with nothing under them, marquee tickers, auto-playing carousels, parallax, scroll effects,
  hover-only information, icon-only buttons, hamburger menus on desktop, emojis as decoration.
- **Palette:** violet `#5B2A86` (headings, quiet buttons), red `#E2342B` (the one action that matters on a
  screen), lilac `#F2ECF8` (soft sections; it matches the lavender in our photos), ink `#1E1626` (text).
  No other colours on the site except the shirts themselves.

## 2. Reading comfort (non-negotiable)

Most people over 50 need reading glasses for small type, and phone screens are where she shops.

| Thing | Rule |
| --- | --- |
| Body text | 18px minimum (the site base), line height 1.5–1.6, lines no wider than ~70 characters |
| Small print | Never under 15px. If it matters (price, delivery, returns), it isn't small print |
| Text contrast | 7:1 for body text, 4.5:1 minimum for anything else. No light grey text, no text on busy photos |
| Headings | Sentence case. No all-caps paragraphs, no tiny letter-spaced "eyebrow" labels |
| Links | Bold or underlined, never colour alone |
| Buttons | At least 48px tall (ours are 54px), full words: "Add to cart – $34.95", not "→" |
| Tap targets | 48px minimum, 8px apart |
| Forms | A visible label above every box. Placeholder text is an example, never the label |
| Motion | None needed. If something moves, it must respect "reduce motion" and never block reading |

## 3. Photos

- Real-looking women aged 50–70: grey and silver hair, laugh lines, real skin, different body types and
  backgrounds. Never young models. Never airbrushed.
- Laughing **with** friends, family, a coffee or a glass of wine. Never alone and sad, never in a care
  setting, never "elderly" props (walkers, pill boxes, rocking chairs).
- The shirt text must be readable in the photo. If you can't read the joke, the photo doesn't go up.
- Lifestyle photos are mood pictures. Never caption them as customers or use them as reviews.
- Every photo has a plain alt text describing what's happening.

## 4. Words: confident, a little rude, never mean

She's in charge and she's done asking permission. What she actually buys is defiant and mildly rude
("The older I get, the heller the no", "Good grandmas say bad words"). Safe, polite jokes (naps, "young at
heart") are what she's seen a hundred times. The site talks the way she does.

- **Attitude goes in headlines, product blurbs and shirt jokes.** "Buy more, pay less. Obviously."
  "Mornings aren't happening." "The answer is still no." The joke is on everyone who thinks she's slowing
  down, never on her.
- **Facts stay plain.** Prices, sizes, shipping, payment and policies are clear and friendly, no jokes that
  could blur what she's paying or getting.
- **Allowed:** sarcasm, eye-rolls, spite, "hell no", "damn", mild "bad words" energy.
  **Not allowed:** the f-word or worse, slurs, mocking other people's bodies, politics, religion, anything
  mean to a group.
- Never apologise, never beg, no filler ("the perfect gift for any occasion", "we're so excited").
- Talk to her like a funny friend who respects her. Short sentences, everyday words.
- **The joke is about independence, not decline.** She's the boss, the wild one, the one who says no.
  No bladder, memory-loss or "over the hill" jokes. No "elderly", "senior", "anti-aging", "golden years".
- "Grandma" lines sell, but many of our customers aren't grandmothers. Every page that mentions grandkids
  needs a non-grandma option next to it.
- Mild cheek is fine ("spite", "cheap tequila"). Politics, religion and anything mean are not.
- Write for the gift buyer too: "for your mom who…", "send it straight to her".
- Promises must be true and specific: "At your door in about a week", "Wrong size? We'll send the right
  one for $9.95 and you keep the first." Never "world-class quality" or "best shirts ever".

## 5. Trust (she checks before she buys)

Show these without making her look for them:

1. **Price, shipping cost and delivery time** next to every buy button.
2. **The promise, free parts only** ("If we get it wrong, we fix it free: misprint, damage or a lost package
   gets a new shirt or your money back") next to Add to cart, in the cart and on the homepage.
   **The paid size swap** ($9.95, she keeps the first) only appears next to the size picker, in the FAQ, on the
   promise page and in emails after she's bought. A price on a problem she hasn't had yet reads as a penalty.
3. **What happens after you order**, step by step. Uncertainty is what scares her.
4. **A real person to talk to:** email (and Facebook Messenger once the page is set up). Say "a real
   person answers, usually within a day". Sign as "The Seasoned team"; never invent a person.
5. **Payment logos** (Visa, Mastercard, Amex, Apple Pay, Google Pay) under checkout buttons.
6. **Plain policies** written in her words, not legal speak. The FAQ starts with "Is Seasoned a real shop?"

Never: charity or donation claims before a real program exists (name who gets what, and how much, or say
nothing; many US states regulate cause marketing), fake countdown timers, "only 3 left" (it's print on demand), pop-ups, fake reviews, star ratings
before there are real reviews (FTC 16 CFR 465), "as seen on", invented testimonials, pressure language.

## 5a. The product page on a phone (where every ad visitor lands)

Ad visitors arrive on an iPhone inside Facebook's own browser, which shows about 390 × 664 px of page
(less on small phones). In the first week of ads (Clarity, November 2026) 89% of phone visitors to the
ad's product page never scrolled and nobody tapped anything. The first screen was a two-line banner, the
header, the photo and a sticky bar; the name, price and size picker were one to three screens further down.

- **First screen at 390 × 664:** the photo with the whole slogan readable, the shirt's name, its price and
  the offer. Something is visibly cut off at the bottom, so she can see the page goes on.
- **Order under the photo:** name, price, who it's for; personalising; style, colour, size; bundle; the red
  button; delivery date, promise, payment logos. Benefits, trust badges, the set and the details come
  *after* the button. Size picker within one scroll of the top, the button within about two.
- **Announcement bar:** one line on phones.
- **Sticky bar:** never on arrival (it covered the shirt and made the page look finished). It appears once
  she has scrolled past the red button, or has picked a size. "Choose size" takes her to the sizes; it
  is not an error.
- Phone photo height is set in `.pdp-slide` (`app/globals.css`); model photos crop from the bottom, so keep
  the print in the top 75% of a model photo.

## 5b. Speed and the other pages on a phone

She comes from an ad on mobile data. Every extra second before the page shows costs visitors, and
unexpected costs at checkout are the most common reason carts get abandoned (Baymard). Site audit,
November 12, 2026: the pages weighed 1.8–3 MB; pictures and fonts alone were 1–2 MB.

- **Photos:** never link a full-size file from a grid or a phone page. `npm run images` (runs before
  every build) makes small WebP copies; `modelPhotos()` hands out a `srcSet`, shop tiles use the 560 px
  shirt photo (`tilePhoto`). New photo → run it and commit the copies with `data/image-variants.json`.
- **Fonts:** browsers get the `.woff2` files; only the heading face and DM Sans are preloaded.
- **Product gallery:** only the first photo loads with the page; the next one loads once the page has
  settled, the rest as she swipes. Thumbnails are for tablets and desktops.
- **Home, first screen at 390 × 664:** photo, headline, one line, the red button. Shirts come straight
  after the hero; the friend-code offer sits low on the page.
- **Shop and collections:** the first row of shirts, with prices, shows on the first screen.
- **Next to Add to cart:** what shipping costs for *this* order ("Shipping $4.95. Free when you buy 2."),
  then the delivery date.
- **Cart:** total and checkout button come before anything optional. The code box is one quiet link
  until she opens it; an empty code box in front of the button sends people off to hunt for a code.
- **Wrong link (404):** always inside the store, with header, cart and a way back to the shirts.
- Links that stand alone ("See all shirts", "Remove", "Size guide", footer links) are 48 px tall, like
  buttons.

## 6. The shirts (print designs)

The shirt is read from across a room by her friends. If they can't read it, the joke is dead.

- **Every colour in a design must reach 4.5:1 contrast against the shirt.** The code enforces this
  (`readableAccent` in `lib/design/types.ts`): accents are darkened or lightened until they pass, and on
  mid-tone shirts (Heather Mauve, Sport Grey) the design prints in one ink colour. Run
  `npm run check:contrast` after adding a colour or an accent.
- **Default colours:** black, navy, maroon or forest with cream ink, or white and heather grey with dark ink.
  Heather Mauve is offered as an option, never as a design's default or in a hero.
- **Script fonts** only at large sizes (the word should be at least as tall as the bold line next to it)
  and only in a colour that passes contrast. Never script for the punchline if the shirt is mid-tone.
- **Two colours maximum** per design: ink plus one accent.
- **Big and bold:** the main line fills the width of the print area. Small secondary lines no less than
  a third of the main line's height.
- **Personalised text** (names, years) is the biggest thing on the shirt, in the bold font.
- **Never** band names, lyrics, album art, logos, characters or real people. Nostalgia through generic
  imagery only (vinyl, cassettes, 70s sunsets, cowgirl boots).

## 7. Checks before anything ships

- [ ] Read every page on a phone at arm's length. Can you read all of it without zooming?
- [ ] Every shirt preview: can you read every word from the shop grid tile?
- [ ] Product page at 390 × 664 and 375 × 548 (Facebook's in-app browser): whole slogan, name and price
      on the first screen; nothing covering the photo.
- [ ] Home at 390 × 664: the red button is on the first screen. Shop: the first row of shirts is.
- [ ] No picture over about 100 KB on a phone page (run `npm run images` after adding photos).
- [ ] One red button per screen, and it says exactly what happens.
- [ ] Price, delivery time and the promise visible near every buy button.
- [ ] No fake urgency, no pop-ups, no invented reviews or customers.
- [ ] Would a sharp 62-year-old feel talked down to anywhere? Fix it.
