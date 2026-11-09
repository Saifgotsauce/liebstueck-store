# Seasoned Germany (/de) – research notes and build plan

Researched November 2026. Not legal advice – have a German legal-text service check the
legal pages before ads go live (IT-Recht Kanzlei or Händlerbund, about €10–20 a month).

## Who we sell to in Germany

Same buyer as the US store: women roughly 50–70, on Facebook, buying funny shirts for
themselves and as gifts (grandkids' parents, husbands, friends, colleagues retiring).

How they talk and what they respond to:
- **"du", not "Sie".** Funny-shirt shops in Germany (Spreadshirt, Amazon/eBay sellers) all
  use "du", and so do the shirts themselves. Keep it warm and respectful, never "Seniorin".
- Words they use: **Ü50 / Ü60**, Oma / Omi, Opa, Enkel, Rente / Ruhestand, Rentnerin,
  Jahrgang, runder Geburtstag, Kaffee und Kuchen, Sekt, Mittagsschlaf, Plätzchen, Glühwein.
- Formulas that already sell on German shirts: "Jahrgang 1966 – alle Teile original",
  "Limited Edition 1966", "Ich bin nicht 60, ich bin 18 mit … Jahren Erfahrung",
  "Die Frau. Der Mythos. Die Legende.", "Ich bin in Rente, ich muss gar nix",
  "Befördert zur Oma", "Ich bin nicht stur, nur meinungsstabil", "Älter ist wie jung, nur besser".
- Proverbs every German over 50 knows (free to use, no owner): "Je oller, desto doller",
  "Wer rastet, der rostet", "Morgenstund hat Gold im Mund", "Alter schützt vor Torheit nicht",
  "Ein Gläschen in Ehren kann niemand verwehren", "Man ist so alt, wie man sich fühlt".
- Best-ager shoppers want clear prices, clear delivery dates and a safe checkout
  (PayPal and Klarna matter more than in the US).
- Key dates: Muttertag (2nd Sunday in May), Vatertag (Ascension Day), runde Geburtstage,
  Rente/Abschied, Nikolaus (6 Dec), Heiligabend (24 Dec – gifts are given on the 24th).

## The 50 German designs (lib/designs-de.ts)

28 lean on well-known phrases – proverbs, carols and German shirt classics (marked ★ / `famous: true` in the file). The other 22 are original. Avoided on purpose:
Loriot quotes ("Früher war mehr Lametta"), Hape Kerkeling ("Isch hab Rücken"),
"Lass mich, ich muss mich da jetzt reinsteigern" (registered and enforced), "TÜV"
(registered), "HO HO HO" (registered), song lyrics, brand names (Aperol etc.).

The ★ designs (well-known phrases or riffs on them):

- Nicht alt. Vintage. (nicht-alt-vintage)
- Je oller, desto doller (je-oller-desto-doller)
- Zustand entspricht Alter und Laufleistung (zustand-alter-laufleistung)
- Nicht stur. Nur meinungsstabil. (nicht-stur-meinungsstabil)
- Älter ist wie jung, nur besser (aelter-ist-wie-jung)
- Alter schützt vor Torheit nicht. Zum Glück. (alter-schuetzt-vor-torheit-nicht)
- Oma – Die Frau. Der Mythos. Die Legende. (oma-frau-mythos-legende)
- Oma: wie Mama, nur cooler (oma-wie-mama-nur-cooler)
- Befördert zur Oma – mit Jahr (befoerdert-zur-oma)
- Ich bin Oma. Was ist deine Superkraft? (oma-superkraft)
- Ich bin in Rente. Ich muss gar nix. (rente-muss-gar-nix)
- Wie nennt man Frauen, die montags gute Laune haben? Rentnerin. (montags-gut-gelaunt)
- Wer rastet, der rostet. Ich roste gern. (wer-rastet-der-rostet)
- Morgenstund hat Gold im Mund. Ich schlaf trotzdem aus. (morgenstund-ausschlafen)
- Ruhestand: aussehen wie 60, denken wie 30, handeln wie 18 (ruhestand-aussehen-denken-handeln)
- Jahrgang – alle Teile original (mit Geburtsjahr) (jahrgang-alle-teile-original)
- Limited Edition – Jahrgang mit Geburtsjahr (limited-edition-jahrgang)
- Ich bin nicht 60. Ich bin 18 mit sehr viel Erfahrung. (mit Alter) (nicht-alt-18-mit-erfahrung)
- 60 und kein bisschen leise (mit Alter) (kein-bisschen-leise)
- Ein Gläschen in Ehren kann niemand verwehren (glaeschen-in-ehren)
- Man ist so alt, wie man sich fühlt. Heute: 29. (so-alt-wie-man-sich-fuehlt)
- Wenn Opa es nicht reparieren kann, kann es keiner (wenn-opa-es-nicht-reparieren-kann)
- Papas wissen viel. Opas wissen alles. (opas-wissen-alles)
- Opa – Der Mann. Der Mythos. Die Legende. (opa-mann-mythos-legende)
- Rentner. Unter neuer Leitung. Details bei meiner Frau. (rentner-unter-neuer-leitung)
- Alle Jahre wieder: zu viele Plätzchen (alle-jahre-wieder-plaetzchen)
- O du fröhliche Glühweinzeit (o-du-froehliche-gluehweinzeit)
- Stille Nacht? Nicht bei uns. (stille-nacht-nicht-bei-uns)

**Before running ads:** search each ★ phrase in the free DPMA register
(register.dpma.de → Marke → Einsteigerrecherche) and EUIPO eSearch, class 25 (clothing).
If one is registered for clothing, switch that design off (`hidden: true`).

## Laws checked (state: November 2026)

| Rule | What the store does |
|---|---|
| Impressum (§ 5 DDG) | `/de/impressum/`, linked "Impressum" in every footer. Name + postal address (no PO box) + email. No OS-platform link (platform shut down 20 July 2025; old links must go). |
| Withdrawal button (§ 356a BGB, since 19 June 2026) | "Vertrag widerrufen" button in every footer → form (name, order, email, no reason asked) → "Widerruf bestätigen" → instant receipt email with content, date and time. Widerrufsbelehrung mentions the online function. |
| 14-day withdrawal right | Applies to non-personalized shirts. Personalized ones are excluded (§ 312g Abs. 2 Nr. 1 BGB). |
| Order button (§ 312j BGB) | Our own last step shows address, items, VAT-inclusive total, shipping, delivery time, then **"Zahlungspflichtig bestellen"**. Stripe is only used to pay afterwards (Stripe's own button just says "Bezahlen", which on its own would not be enough). |
| Prices (PAngV) | All prices incl. 19 % MwSt., "zzgl. Versand" linked. Sale switch: in Germany the crossed-out price must be the lowest price of the last 30 days. |
| Cookies (§ 25 TDDDG) | Meta Pixel only after opt-in in the cookie banner. |
| Product safety (GPSR) | Product pages show manufacturer (you) and the EU responsible person Printful provides: SINDEN VENTURES LIMITED, Markou Evgenikou 11, Mesa Geitonia 4002 Limassol, Cyprus, gpsr@sindenventures.com. |
| Packaging (PPWR + VerpackDG, since 12 Aug 2026) | **You must:** register in LUCID yourself, appoint a German "Bevollmächtigter" (foreign sellers), and license the shipping packaging with a dual system. Services like Lizenzero or ecosistant do the last two for a small yearly fee. |
| Accessibility (BFSG) | Micro-businesses are exempt; the site follows it anyway. |
| VAT | Prices include German VAT. As a seller outside the EU you need an accountant to set up VAT (OSS) before selling. |

## Store setup

- `/de/` mirrors the US store: same design, German copy, euro prices, German-only designs.
- Language follows the store, not a toggle: the US store only shows English designs and
  ships to the US; the German store only shows German designs and ships to Germany.
- Visitors in Germany on the US site see a small "Zum deutschen Shop?" banner (and the
  reverse). Ads link straight to the right store.
- Prices: T-shirt €29.95, hoodie €49.95, shipping €4.95, free from €50, bundle savings
  10 % / 15 % like the US. Delivery 6–10 working days (printed in Printful's EU facilities).

## What you still need to do before German ads run

1. Fill in `legalDe` in `lib/config.ts`: your name, a postal address that can receive letters
   (a business address service is fine), the return address. The Impressum, terms,
   withdrawal notice and product pages read from there.
2. Register in LUCID (verpackungsregister.org), appoint a German authorised representative and
   license your shipping packaging (Lizenzero, ecosistant or similar do both).
3. Talk to an accountant about German VAT (OSS) before the first sale.
4. Have the legal pages checked by a legal-text service.
5. Check the ★ phrases in the DPMA and EUIPO registers (10 minutes).
6. In Stripe: turn on the payment methods Germans use (Klarna, SEPA; PayPal if your Stripe
   account supports it). Optional: Stripe Tax with "inclusive" prices.
7. Meta: run the German ad set to `/de/` (or a `/de/p/…` product page). The pixel only fires
   for German visitors who accepted cookies, so expect fewer tracked conversions than in the US.
