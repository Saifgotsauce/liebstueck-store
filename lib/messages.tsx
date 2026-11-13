// Every piece of shop wording, in the US store's English and the German store's German.
// The German was written for women 50–70 (warm "du", no youth slang, no "Senioren" talk) –
// see docs/germany.md. Add a key to `en` and TypeScript makes sure `de` gets it too.
import type { ReactNode } from 'react';
import type { GarmentKey } from './catalog';
import type { Locale } from './locale';

const en = {
  common: {
    allShirts: 'All shirts',
    shirts: (n: number) => `${n} ${n === 1 ? 'shirt' : 'shirts'}`,
    personalizeTab: 'Personalize it',
    collections: 'Collections',
    from: 'From',
    pct: (p: number) => `${p}%`,
  },
  meta: {
    title: 'Seasoned – Funny shirts for women who are aging out loud',
    allTitle: 'All shirts',
    allIntro: 'Every joke we’ve got, on soft tees and cozy hoodies. Pick one, or grab a few and pay less for each.',
    personalizedTitle: 'Personalize it',
    personalizedIntro: 'Her name, his name, every grandkid or the year that matters. Type it in, watch the shirt change, and we print exactly that.',
    personalizedMetaTitle: 'Personalized shirts',
    personalizedMetaDesc: 'Funny shirts with her name, his name, the grandkids or the year – printed exactly as you type it.',
    vibeDesc: (blurb: string, term: string) => `${blurb} Shop ${term}, printed to order and shipped across the US.`,
    productDesc: (blurb: string) => `${blurb} Printed to order on a soft tee or cozy hoodie. Free US shipping over $50.`,
    moreFrom: (vibe: string) => `More from ${vibe}`,
  },
  header: {
    deadline: (label: string, name: string, free: string): ReactNode => (
      <>
        Order by <strong>{label}</strong> for {name} delivery. Free shipping over {free}.
      </>
    ),
    offer: (free: string) => `Free US shipping over ${free}. Buy 2, save 10%.`,
    // Phones: one line, so the page itself starts higher
    deadlineShort: (label: string, name: string): ReactNode => (
      <>
        Order by <strong>{label}</strong> for {name} delivery
      </>
    ),
    offerShort: (free: string) => `Free US shipping over ${free}`,
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    home: 'Seasoned home',
    nav: 'Shop by vibe',
    cart: (n: number) => `Cart, ${n} items`,
  },
  footer: {
    about: 'Funny shirts for women who are getting older out loud and stopped asking permission years ago. Printed to order, one at a time.',
    questions: 'Questions?',
    shop: 'Shop',
    help: 'Help',
    legal: '',
    bottom: (year: number) => `© ${year} Seasoned. Secure checkout by Stripe.`,
  },
  coupons: {
    items: (two: { percent: number; minItems: number }, three: { percent: number; minItems: number }, free: string) => [
      { big: `Save ${two.percent}%`, small: `when you buy ${two.minItems} shirts` },
      { big: `Save ${three.percent}%`, small: `when you buy ${three.minItems} or more` },
      { big: 'Free shipping', small: `over ${free}, or with any hoodie` },
    ],
    note: 'Mix and match any shirts. Savings apply automatically in your cart.',
  },
  card: {
    badge: 'Personalize it',
    label: (title: string, color: string) => `${title} – ${color} t-shirt`,
  },
  hero: {
    design: 'grandma-era',
    ask: 'What do the grandkids call you?',
    placeholder: 'Grandma',
    ideas: ['Nana', 'Gigi', 'Mimi', 'Grammy', 'Oma'],
    ideasLabel: 'Name ideas',
    make: 'Make it',
    label: (name: string) => `In my ${name} era t-shirt`,
  },
  home: {
    h1: 'Not old. Seasoned.',
    intro:
      'Funny shirts for women who are getting older out loud, and gifts for the grandpas, husbands and nap champions in their lives. Add a name, a year or the grandkids, and we print it just for you.',
    shopAll: (n: number) => `Shop all ${n} shirts`,
    personalizable: 'Shirts you can personalize',
    prices: (tee: string, hoodie: string, free: string) => `T-shirts ${tee}, hoodies ${hoodie}. Free shipping over ${free}.`,
    savings: 'Savings',
    savingsNote: 'Savings apply automatically in your cart. No codes to remember.',
    holidayTitle: 'The holiday shop',
    holidayText: (label: string, name: string): ReactNode => (
      <>
        Order by <strong>{label}</strong> for {name} delivery. Matching family shirts welcome.
      </>
    ),
    seeHoliday: 'See all holiday shirts',
    startHere: 'Start here',
    seeAll: (n: number) => `See all ${n} shirts`,
    byVibe: 'Shop by vibe',
    personalTitle: 'Put their name on it.',
    personalText:
      'Grandma’s name and every grandkid. The year she retired. The year he was born. The family name for the Christmas photo. Type it in, see the shirt change, and we print exactly that.',
    personalCta: 'Shop personalized shirts',
    personalExamples: ['loved-by-grandkids', 'vintage-birth-year', 'family-christmas'],
    goodToKnow: 'Good to know',
    facts: (min: number, max: number) => [
      { t: 'Printed just for you', d: 'Every shirt is printed to order on a soft Bella+Canvas tee or a cozy Gildan hoodie.' },
      { t: 'At your door in about a week', d: `Most orders arrive in ${min}–${max} business days, with tracking.` },
      { t: 'Made right, or made again', d: 'Damaged, misprinted or wrong? We replace it or refund you. No return trip to the post office.' },
      { t: 'Pay the way you like', d: 'Card, Apple Pay or Google Pay through Stripe’s secure checkout.' },
    ],
    moreQuestions: 'More questions answered',
  },
  pdp: {
    photos: 'Product photos',
    slideOf: (i: number, n: number) => `${i} of ${n}`,
    prev: 'Previous photo',
    next: 'Next photo',
    choosePhoto: 'Choose a photo',
    photoN: (i: number) => `Photo ${i}`,
    heroLabel: (title: string, color: string, garment: string) => `${title} on a ${color.toLowerCase()} ${garment.toLowerCase()}`,
    front: (garment: string) => `Front of the ${garment.toLowerCase()}`,
    closeUp: 'Close-up of the print',
    alsoAs: (name: string) => `Also as a ${name}`,
    examplePhoto: (title: string) => `${title}, example photo`,
    previewNote: 'The preview is exactly what we print. Change anything and it updates.',
    reviews: (n: number) => `${n} review${n === 1 ? '' : 's'}`,
    salePrice: 'Sale price ',
    regularPrice: 'Regular price ',
    saleBadge: (label: string, p: number, ends?: string) => `${label}: ${p}% off${ends ? ` – ends ${ends}` : ''}`,
    buy2Badge: (p: number) => `Buy 2, save ${p}%`,
        benefitName: 'Printed with the name you type – see it live before you order',
    benefitPrint: 'Big, bold print they can read from across the room',
    benefitFabric: (g: GarmentKey): string => (g === 'tee' ? 'Soft, lightweight cotton in a relaxed unisex fit' : 'Warm, cozy fleece with a front pocket and hood'),
    benefitShipping: (free: string) => `Free US shipping on orders over ${free}`,
    features: (g: GarmentKey) => [g === 'tee' ? 'Super-soft cotton' : 'Cozy fleece', g === 'tee' ? 'Unisex relaxed fit' : 'Unisex classic fit', 'Printed to order', 'Machine washable'],
    stickerName: ['Add', 'any name'],
    stickerBundle: (p: number) => ['Buy 2', `save ${p}%`],
    personalize: 'Personalize it',
    personalizeNote: 'Free. The photos update as you type.',
    style: 'Style',
    color: 'Color',
    size: 'Size',
    pickSize: 'Pick a size first.',
    bundleTitle: 'Bundle & save',
    pieces: (n: number, g: GarmentKey) => `${n} ${g === 'tee' ? (n === 1 ? 'T-shirt' : 'T-shirts') : n === 1 ? 'Hoodie' : 'Hoodies'}`,
    plural: (g: GarmentKey): string => (g === 'tee' ? 'T-shirts' : 'hoodies'),
    single: (g: GarmentKey): string => (g === 'tee' ? 'T-shirt' : 'hoodie'),
    save: (p: number) => `Save ${p}%`,
    justThis: 'Just this one',
    each: (price: string) => `${price} each`,
    withoutSaving: 'without the saving ',
    bestValue: 'Best value',
    tierNote: 'Same size for each. Mixing sizes or designs? Add them one by one – the saving still counts in your cart.',
    addToCart: (price: string) => `Add to cart – ${price}`,
    shipFree: 'Free shipping on this order',
    shipPaid: (cost: string, free: string, twoShipFree: boolean) => `Shipping ${cost}. ${twoShipFree ? 'Free when you buy 2.' : `Free over ${free}.`}`,
    arrives: (w: string): ReactNode => (
      <>
        Order today, arrives <strong>about {w}</strong>
      </>
    ),
    holiday: (label: string, name: string) => `Order by ${label} for ${name} delivery`,
    addedOne: 'In your cart. Good call.',
    addedSet: 'All 3 are in your cart. Excellent decision.',
    addMore: (n: number, p: number) => `Add ${n} more and save ${p}% on everything.`,
    savingApplied: 'Your bundle saving is applied in the cart.',
    viewCart: 'View cart',
    keepShopping: 'Keep shopping',
    cartNow: (n: number, total: string, shipFree: boolean) => `Your cart: ${n} ${n === 1 ? 'item' : 'items'} · ${total}${shipFree ? ', shipping is free' : ' with shipping'}`,
    cartShort: (n: number, total: string) => `${n} ${n === 1 ? 'item' : 'items'} · ${total}`,
    goToCart: 'Go to cart and check out',
    goToCartShort: 'Go to cart',
    inCart: 'In your cart',
    addAnother: 'Add one more of this one',
    saveChanges: 'Save changes',
    editing: 'You’re changing a shirt in your cart.',
    backToCart: 'Back to cart, no changes',
    seeBigger: 'See it bigger',
    yourPrint: 'This is what we print',
    previewTitle: 'Your shirt',
    closePreview: 'Close preview',
    trust: (free: string) => [
      { title: 'Secure checkout', text: 'Apple Pay, Google Pay and cards' },
      { title: 'Free shipping', text: `On US orders over ${free}` },
      { title: 'Our mistake? Free fix', text: 'A new one or your money back.', link: 'Details' },
      { title: 'Made for you', text: 'Printed in 2–5 days, shipped with tracking' },
    ],
    setTitle: 'Complete the set',
    setSave: (p: number) => `– save ${p}%`,
    setIntro: (plural: string, size: string | null) => `This one plus two more troublemakers, all as ${plural}${size ? ` in ${size}` : ''}.`,
    thisOne: 'This one',
    thisOneLabel: (title: string) => `${title} (this one)`,
    separately: 'separately',
    boughtSeparately: 'Bought separately ',
    forAll3: 'for all 3',
    addAll3: 'Add all 3 to cart',
    notAvailable: (title: string, size: string) => `“${title}” isn’t available in ${size} right now.`,
    about: 'About this design',
    fabric: 'Fabric & fit',
    care: 'Care',
    shipping: 'Shipping',
    shippingText: (min: number, max: number) =>
      `Every shirt is printed to order, usually within 2–5 business days, then shipped with tracking. Most orders arrive ${min}–${max} business days after you order. We ship within the US.`,
    returns: 'Returns & replacements',
    returnsText:
      'If we get it wrong (misprint, damage, wrong item), tell us within 30 days and we send a new one or refund you, free. Wrong size? We print the right one for $9.95 and you keep the first. Nothing to send back, personalized shirts included.',
    returnsLink: 'Full policy',
    chooseSize: 'Choose size',
    addShort: 'Add to cart',
    forN: (n: number) => ` for ${n}`,
    sizeGuide: 'Size guide',
    sizesOf: (g: string) => `${g} sizes`,
    closeSizes: 'Close size guide',
    sizeNote: 'Measured laid flat, in inches. Compare with a shirt you already love.',
    sizeCols: ['Size', 'Chest width', 'Length'],
    inches: true,
    namePlaceholder: 'Name',
    nameN: (i: number) => `Name ${i}`,
    removeName: (n: string) => `Remove ${n}`,
    addName: 'Add another name',
  },
  cart: {
    loading: '',
    empty: 'Your cart is empty.',
    emptyNote: 'That’s not like you. The jokes are waiting.',
    shopAll: 'Shop all shirts',
    title: 'Your cart',
    line: (garment: string, color: string, size: string) => `${garment}, ${color}, size ${size}`,
    qtyOf: (title: string) => `Quantity of ${title}`,
    less: 'One less',
    more: 'One more',
    remove: 'Remove',
    lineShort: (garment: string, color: string) => `${garment}, ${color}`,
    sizeLabel: 'Size',
    edit: (personal: boolean): string => (personal ? 'Change the text or color' : 'Change color or style'),
    bar: (n: number, total: string) => `${n} ${n === 1 ? 'item' : 'items'} in your cart · ${total}`,
    barGo: 'Go to cart',
    addMore: (n: number, p: number): ReactNode => (
      <>
        <span className="font-bold">
          Add {n} more {n === 1 ? 'shirt' : 'shirts'} and save {p}%
        </span>{' '}
        on your whole order.
      </>
    ),
    saving: (p: number) => `You’re saving ${p}% with your bundle.`,
    subtotal: 'Subtotal',
    bundle: (p: number) => `Bundle savings (${p}%)`,
    shipping: 'Shipping',
    free: 'Free',
    total: 'Total',
    toFree: (x: string) => `You’re ${x} away from free shipping.`,
    taxNote: 'Sales tax, if any, is calculated at checkout.',
    checkout: 'Check out securely',
    demo: 'Checkout is off in this preview',
    opening: 'Opening secure checkout…',
    error: 'Checkout couldn’t be opened. Please try again.',
    payNote: 'Card, Apple Pay or Google Pay via Stripe',
    deliveryNote: (min: number, max: number) =>
      `Printed to order and delivered in about ${min}–${max} business days. Personalized items are printed exactly as entered, so please double-check the spelling.`,
  },
  thanks: {
    title: 'Thank you! Your shirt is being made.',
    sentTo: (email: string): ReactNode => (
      <>
        We sent your confirmation to <strong>{email}</strong>.
      </>
    ),
    soon: 'You’ll get a confirmation email in a moment.',
    printed: 'Your order is printed just for you and usually ships within 2–5 business days. We’ll email the tracking link as soon as it’s on its way.',
    order: (ref: string) => `Order ${ref}`,
    total: (p: string) => `Total ${p}`,
    questions: 'Questions about your order? Just reply to the confirmation email.',
    back: 'Back to the shop',
  },
  geo: {
    text: 'Shopping from the US?',
    link: 'Go to the US store',
    close: 'Close',
  },
};

export type Messages = typeof en;

const de: Messages = {
  common: {
    allShirts: 'Alle Shirts',
    shirts: (n) => `${n} Shirts`.replace(/^1 Shirts$/, '1 Shirt'),
    personalizeTab: 'Mit Namen & Jahr',
    collections: 'Kategorien',
    from: 'ab',
    pct: (p) => `${p} %`,
  },
  meta: {
    title: 'Seasoned – Lustige Shirts für Frauen ab 50, Omas und Rentnerinnen',
    allTitle: 'Alle Shirts',
    allIntro: 'Jeder Spruch im Shop, auf weichen T-Shirts und kuscheligen Hoodies. Such dir eins aus – oder kombinier ein paar und spar dabei.',
    personalizedTitle: 'Mit Namen & Jahr',
    personalizedIntro: 'Ihr Name, sein Name, alle Enkel oder das Jahr, das zählt. Eintippen, zusehen, wie sich das Shirt verändert – und wir drucken genau das.',
    personalizedMetaTitle: 'Personalisierte Shirts',
    personalizedMetaDesc: 'Lustige Shirts mit Namen, Enkeln oder Jahreszahl – genau so gedruckt, wie du es eintippst.',
    vibeDesc: (blurb, term) => `${blurb} ${term[0].toUpperCase()}${term.slice(1)} – einzeln für dich gedruckt und versandkostenfrei ab 50 €.`,
    productDesc: (blurb) => `${blurb} Einzeln für dich gedruckt, auf weichem T-Shirt oder kuscheligem Hoodie. Versandkostenfrei ab 50 €.`,
    moreFrom: (vibe) => `Mehr aus „${vibe}“`,
  },
  header: {
    deadline: (label, name, free) => (
      <>
        Bis zum <strong>{label}</strong> bestellen – rechtzeitig zu {name} da. Gratis Versand ab {free}.
      </>
    ),
    offer: (free) => `Gratis Versand ab ${free}. Ab 2 Shirts 10 % sparen.`,
    deadlineShort: (label, name) => (
      <>
        {name}: bis <strong>{label}</strong> bestellen
      </>
    ),
    offerShort: (free) => `Gratis Versand ab ${free}`,
    openMenu: 'Menü öffnen',
    closeMenu: 'Menü schließen',
    home: 'Seasoned Startseite',
    nav: 'Kategorien',
    cart: (n) => `Warenkorb, ${n} Artikel`,
  },
  footer: {
    about: 'Lustige Shirts für Frauen, die mit Humor älter werden – und für die Menschen, die sie lieben. Einzeln für dich gedruckt.',
    questions: 'Fragen?',
    shop: 'Shop',
    help: 'Hilfe',
    legal: 'Rechtliches',
    bottom: (year) => `© ${year} Seasoned. Sichere Bezahlung über Stripe. Alle Preise inkl. MwSt., zzgl. Versand.`,
  },
  coupons: {
    items: (two, three, free) => [
      { big: `${two.percent} % sparen`, small: `beim Kauf von ${two.minItems} Shirts` },
      { big: `${three.percent} % sparen`, small: `ab ${three.minItems} Shirts` },
      { big: 'Gratis Versand', small: `in Deutschland ab ${free}` },
    ],
    note: 'Beliebig kombinieren. Der Rabatt wird im Warenkorb automatisch abgezogen.',
  },
  card: {
    badge: 'Mit Namen',
    label: (title, color) => `${title} – T-Shirt in ${color}`,
  },
  hero: {
    design: 'oma-modus-aktiviert',
    ask: 'Wie nennen dich die Enkel?',
    placeholder: 'Oma',
    ideas: ['Omi', 'Oma', 'Omma', 'Großmama', 'Oma Gisela'],
    ideasLabel: 'Namensideen',
    make: 'Gestalten',
    label: (name) => `${name}-Modus-T-Shirt`,
  },
  home: {
    h1: 'Nicht alt. Erfahren.',
    intro:
      'Lustige Shirts für Frauen, die laut und mit Humor älter werden – und Geschenke für die Opas, Ehemänner und Mittagsschlaf-Profis in ihrem Leben. Mit Namen, Jahreszahl oder den Enkeln: Wir drucken es nur für dich.',
    shopAll: (n) => `Alle ${n} Shirts ansehen`,
    personalizable: 'Shirts mit deinem Namen',
    prices: (tee, hoodie, free) => `T-Shirts ${tee}, Hoodies ${hoodie}, inkl. MwSt. Gratis Versand ab ${free}.`,
    savings: 'Rabatte',
    savingsNote: 'Der Rabatt wird im Warenkorb automatisch abgezogen. Kein Gutscheincode nötig.',
    holidayTitle: 'Der Weihnachtsshop',
    holidayText: (label) => (
      <>
        Bis zum <strong>{label}</strong> bestellen – dann liegt es rechtzeitig unterm Baum. Passende Familien-Shirts ausdrücklich erwünscht.
      </>
    ),
    seeHoliday: 'Alle Weihnachtsshirts',
    startHere: 'Unsere Lieblinge',
    seeAll: (n) => `Alle ${n} Shirts`,
    byVibe: 'Nach Anlass stöbern',
    personalTitle: 'Mit ihrem Namen drauf.',
    personalText:
      'Omas Name und alle Enkel. Das Jahr, in dem sie in Rente ging. Sein Geburtsjahr. Der Familienname fürs Weihnachtsfoto. Eintippen, zusehen, wie sich das Shirt verändert – und wir drucken genau das.',
    personalCta: 'Shirts zum Personalisieren',
    personalExamples: ['geliebt-von-enkeln', 'jahrgang-alle-teile-original', 'familie-weihnachten'],
    goodToKnow: 'Gut zu wissen',
    facts: (min, max) => [
      { t: 'Nur für dich gedruckt', d: 'Jedes Shirt wird erst nach deiner Bestellung gedruckt – auf ein weiches Bella+Canvas-T-Shirt oder einen kuscheligen Gildan-Hoodie.' },
      { t: `In ${min}–${max} Werktagen bei dir`, d: 'Gedruckt in der EU, also ohne Zoll. Mit Sendungsverfolgung.' },
      { t: 'Fehldruck? Wird neu gemacht.', d: 'Beschädigt, falsch bedruckt oder falsch geliefert? Du bekommst kostenlos Ersatz oder dein Geld zurück.' },
      { t: 'Sicher bezahlen', d: 'Über Stripe – mit Karte, Apple Pay, Google Pay und weiteren Zahlungsarten, die du an der Kasse siehst.' },
    ],
    moreQuestions: 'Weitere Fragen & Antworten',
  },
  pdp: {
    photos: 'Produktfotos',
    slideOf: (i, n) => `${i} von ${n}`,
    prev: 'Vorheriges Foto',
    next: 'Nächstes Foto',
    choosePhoto: 'Foto auswählen',
    photoN: (i) => `Foto ${i}`,
    heroLabel: (title, color, garment) => `${title} auf ${garment === 'Hoodie' ? 'einem Hoodie' : 'einem T-Shirt'} in ${color}`,
    front: () => 'Vorderansicht',
    closeUp: 'Nahaufnahme des Drucks',
    alsoAs: (name) => `Auch als ${name}`,
    examplePhoto: (title) => `${title}, Beispielfoto`,
    previewNote: 'Die Vorschau zeigt genau, was wir drucken. Jede Änderung siehst du sofort.',
    reviews: (n) => `${n} ${n === 1 ? 'Bewertung' : 'Bewertungen'}`,
    salePrice: 'Angebotspreis ',
    regularPrice: 'Niedrigster Preis der letzten 30 Tage: ',
    saleBadge: (label, p, ends) => `${label}: ${p} % Rabatt${ends ? ` – bis ${ends}` : ''}`,
    buy2Badge: (p) => `Ab 2 Stück ${p} % sparen`,
    benefitName: 'Mit dem Namen, den du eintippst – live in der Vorschau, bevor du bestellst',
    benefitPrint: 'Großer, kräftiger Druck auf der Vorderseite',
    benefitFabric: (g) => (g === 'tee' ? 'Weiche, leichte Baumwolle in lockerer Unisex-Passform' : 'Warmer, kuscheliger Hoodie mit Kängurutasche und Kapuze'),
    benefitShipping: (free) => `Gratis Versand innerhalb Deutschlands ab ${free}`,
    features: (g) => [g === 'tee' ? 'Superweiche Baumwolle' : 'Kuschelig warm', g === 'tee' ? 'Unisex, locker' : 'Unisex, klassisch', 'Für dich gedruckt', 'Waschbar bei 30 °C'],
    stickerName: ['Mit', 'deinem Namen'],
    stickerBundle: (p) => [`−${p} %`, 'ab 2 Shirts'],
    personalize: 'Personalisieren',
    personalizeNote: 'Kostenlos. Die Fotos ändern sich, während du tippst.',
    style: 'Modell',
    color: 'Farbe',
    size: 'Größe',
    pickSize: 'Bitte wähle zuerst eine Größe.',
    bundleTitle: 'Mehr kaufen, mehr sparen',
    pieces: (n, g) => `${n} ${g === 'tee' ? (n === 1 ? 'T-Shirt' : 'T-Shirts') : n === 1 ? 'Hoodie' : 'Hoodies'}`,
    plural: (g) => (g === 'tee' ? 'T-Shirts' : 'Hoodies'),
    single: (g) => (g === 'tee' ? 'T-Shirt' : 'Hoodie'),
    save: (p) => `${p} % sparen`,
    justThis: 'Nur dieses eine',
    each: (price) => `je ${price}`,
    withoutSaving: 'ohne Rabatt ',
    bestValue: 'Bester Preis',
    tierNote: 'Alle in derselben Größe. Verschiedene Größen oder Motive? Einfach einzeln in den Warenkorb legen – der Rabatt gilt trotzdem.',
    addToCart: (price) => `In den Warenkorb – ${price}`,
    shipFree: 'Diese Bestellung liefern wir versandkostenfrei',
    shipPaid: (cost, free, twoShipFree) => `zzgl. ${cost} Versand. ${twoShipFree ? 'Ab 2 Stück gratis.' : `Ab ${free} gratis.`}`,
    arrives: (w) => (
      <>
        Heute bestellt, bei dir <strong>ca. {w}</strong>
      </>
    ),
    holiday: (label, name) => `Bis zum ${label} bestellen – rechtzeitig zu ${name} da`,
    addedOne: 'Liegt im Warenkorb.',
    addedSet: 'Alle 3 liegen im Warenkorb.',
    addMore: (n, p) => `Noch ${n} dazu und du sparst ${p} % auf alles.`,
    savingApplied: 'Dein Mengenrabatt wird im Warenkorb abgezogen.',
    viewCart: 'Zum Warenkorb',
    keepShopping: 'Weiter stöbern',
    cartNow: (n, total, shipFree) => `Im Warenkorb: ${n} Artikel · ${total}${shipFree ? ', Versand gratis' : ' inkl. Versand'}`,
    cartShort: (n, total) => `${n} Artikel · ${total}`,
    goToCart: 'Zum Warenkorb und zur Kasse',
    goToCartShort: 'Zum Warenkorb',
    inCart: 'Liegt im Warenkorb',
    addAnother: 'Noch eins davon dazu',
    saveChanges: 'Änderungen speichern',
    editing: 'Du änderst gerade ein Shirt aus deinem Warenkorb.',
    backToCart: 'Zurück zum Warenkorb, nichts ändern',
    seeBigger: 'Größer ansehen',
    yourPrint: 'Das drucken wir',
    previewTitle: 'Dein Shirt',
    closePreview: 'Vorschau schließen',
    trust: (free) => [
      { title: 'Sicher bezahlen', text: 'Karte, Apple Pay, Google Pay & mehr' },
      { title: 'Gratis Versand', text: `In Deutschland ab ${free}` },
      { title: 'Fehldruck? Ersatz gratis', text: 'Wir ersetzen oder erstatten.', link: 'Details' },
      { title: 'Für dich gemacht', text: 'In 2–5 Tagen gedruckt, mit Sendungsverfolgung' },
    ],
    setTitle: 'Mach das Set komplett',
    setSave: (p) => `– ${p} % sparen`,
    setIntro: (plural, size) => `Dieses hier plus zwei weitere Lieblinge, alle als ${plural}${size ? ` in Größe ${size}` : ''}.`,
    thisOne: 'Dieses hier',
    thisOneLabel: (title) => `${title} (dieses hier)`,
    separately: 'einzeln',
    boughtSeparately: 'Einzeln gekauft ',
    forAll3: 'für alle 3',
    addAll3: 'Alle 3 in den Warenkorb',
    notAvailable: (title, size) => `„${title}“ gibt es gerade nicht in Größe ${size}.`,
    about: 'Über dieses Motiv',
    fabric: 'Material & Passform',
    care: 'Pflege',
    shipping: 'Versand & Lieferzeit',
    shippingText: (min, max) =>
      `Jedes Shirt wird erst nach deiner Bestellung gedruckt, meist innerhalb von 2–5 Werktagen, und dann mit Sendungsverfolgung verschickt. Die Lieferzeit beträgt ${min}–${max} Werktage ab Bestellung. Wir liefern innerhalb Deutschlands.`,
    returns: 'Widerruf & Ersatz',
    returnsText:
      'Ist ein Shirt beschädigt, falsch bedruckt oder falsch geliefert, melde dich innerhalb von 30 Tagen – du bekommst kostenlos Ersatz oder dein Geld zurück. Shirts ohne Personalisierung kannst du innerhalb von 14 Tagen widerrufen. Personalisierte Shirts (mit Namen oder Jahreszahl) sind vom Widerrufsrecht ausgeschlossen, weil sie nur für dich gedruckt werden.',
    returnsLink: 'Zur Widerrufsbelehrung',
    chooseSize: 'Größe wählen',
    addShort: 'In den Warenkorb',
    forN: (n) => ` für ${n}`,
    sizeGuide: 'Größentabelle',
    sizesOf: (g) => `Größen ${g}`,
    closeSizes: 'Größentabelle schließen',
    sizeNote: 'Flach liegend gemessen, in Zentimetern. Am besten mit einem Shirt vergleichen, das dir gut passt.',
    sizeCols: ['Größe', 'Brustbreite', 'Länge'],
    inches: false,
    namePlaceholder: 'Name',
    nameN: (i) => `Name ${i}`,
    removeName: (n) => `${n} entfernen`,
    addName: 'Weiteren Namen hinzufügen',
  },
  cart: {
    loading: '',
    empty: 'Dein Warenkorb ist leer.',
    emptyNote: 'Die Sprüche warten alle noch im Shop.',
    shopAll: 'Alle Shirts ansehen',
    title: 'Dein Warenkorb',
    line: (garment, color, size) => `${garment}, ${color}, Größe ${size}`,
    qtyOf: (title) => `Anzahl: ${title}`,
    less: 'Eins weniger',
    more: 'Eins mehr',
    remove: 'Entfernen',
    lineShort: (garment, color) => `${garment}, ${color}`,
    sizeLabel: 'Größe',
    edit: (personal) => (personal ? 'Text oder Farbe ändern' : 'Farbe oder Modell ändern'),
    bar: (n, total) => `${n} Artikel im Warenkorb · ${total}`,
    barGo: 'Zum Warenkorb',
    addMore: (n, p) => (
      <>
        <span className="font-bold">
          Noch {n} {n === 1 ? 'Shirt' : 'Shirts'} dazu und du sparst {p} %
        </span>{' '}
        auf deine ganze Bestellung.
      </>
    ),
    saving: (p) => `Du sparst ${p} % mit deinem Mengenrabatt.`,
    subtotal: 'Zwischensumme',
    bundle: (p) => `Mengenrabatt (${p} %)`,
    shipping: 'Versand',
    free: 'Kostenlos',
    total: 'Gesamt',
    toFree: (x) => `Noch ${x} bis zum Gratisversand.`,
    taxNote: 'Alle Preise inkl. 19 % MwSt.',
    checkout: 'Weiter zur Kasse',
    demo: 'Die Kasse ist in dieser Vorschau ausgeschaltet',
    opening: 'Kasse wird geöffnet …',
    error: 'Die Kasse konnte nicht geöffnet werden. Bitte versuch es noch einmal.',
    payNote: 'Sicher bezahlen über Stripe',
    deliveryNote: (min, max) =>
      `Wird für dich gedruckt und in ca. ${min}–${max} Werktagen geliefert. Personalisierte Shirts drucken wir genau so, wie du sie eingibst – bitte prüf die Schreibweise.`,
  },
  thanks: {
    title: 'Danke für deine Bestellung!',
    sentTo: (email) => (
      <>
        Deine Bestellbestätigung ist unterwegs an <strong>{email}</strong>.
      </>
    ),
    soon: 'Du bekommst gleich eine Bestellbestätigung per E-Mail.',
    printed: 'Deine Shirts werden nur für dich gedruckt und verlassen uns meist innerhalb von 2–5 Werktagen. Sobald das Paket unterwegs ist, schicken wir dir den Link zur Sendungsverfolgung.',
    order: (ref) => `Bestellung ${ref}`,
    total: (p) => `Gesamt ${p}`,
    questions: 'Fragen zu deiner Bestellung? Antworte einfach auf die Bestätigungs-E-Mail.',
    back: 'Zurück zum Shop',
  },
  geo: {
    text: 'Du bist in Deutschland?',
    link: 'Zum deutschen Shop',
    close: 'Schließen',
  },
};

export const MESSAGES: Record<Locale, Messages> = { en, de };
