// Garments (the blank shirts Printful prints on) and products (a design + garments).
// After changing Printful products or colours, run `npm run printful:sync` so the
// variant IDs in data/printful-variants.json match.
import variantData from '@/data/printful-variants.json';
import type { InkTheme } from './design/types';
import type { L } from './i18n';

export type GarmentColor = {
  key: string;
  label: L;
  hex: string;
  printfulColor: string; // colour name exactly as Printful lists it
  ink: InkTheme; // which print palette works on this colour
};

export type Garment = {
  key: 'tee' | 'hoodie';
  label: L;
  printfulProductId: number;
  model: string;
  material: L;
  weight: string;
  fit: L;
  priceCents: number;
  sizes: string[];
  colors: GarmentColor[];
  // Size chart in cm (measured flat). Check against Printful's size guide before launch.
  sizeChart: { size: string; width: number; length: number }[];
  care: L<string[]>;
  safety: L<string[]>;
};

export const GARMENTS: Record<Garment['key'], Garment> = {
  tee: {
    key: 'tee',
    label: { de: 'T-Shirt', en: 'T-shirt' },
    printfulProductId: 71, // Bella + Canvas 3001 Unisex Staple T-Shirt
    model: 'Bella+Canvas 3001 Unisex',
    material: {
      de: '100 % gekämmte und ringgesponnene Baumwolle (Grau meliert: 90 % Baumwolle, 10 % Polyester)',
      en: '100% combed and ring-spun cotton (heather grey: 90% cotton, 10% polyester)',
    },
    weight: 'ca. 142 g/m²',
    fit: {
      de: 'Unisex, normale Passform. Fällt eher klein aus – im Zweifel eine Größe größer wählen.',
      en: 'Unisex, regular fit. Runs small – if in doubt, size up.',
    },
    priceCents: 3495,
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    colors: [
      { key: 'navy', label: { de: 'Marineblau', en: 'Navy' }, hex: '#1F2A44', printfulColor: 'Navy', ink: 'light' },
      { key: 'weiss', label: { de: 'Weiß', en: 'White' }, hex: '#FFFFFF', printfulColor: 'White', ink: 'dark' },
      { key: 'schwarz', label: { de: 'Schwarz', en: 'Black' }, hex: '#1B1B1D', printfulColor: 'Black', ink: 'light' },
      { key: 'bordeaux', label: { de: 'Bordeaux', en: 'Maroon' }, hex: '#5A1E2A', printfulColor: 'Maroon', ink: 'light' },
      { key: 'waldgruen', label: { de: 'Waldgrün', en: 'Forest green' }, hex: '#253B2F', printfulColor: 'Forest', ink: 'light' },
      { key: 'grau', label: { de: 'Grau meliert', en: 'Heather grey' }, hex: '#BDBCB8', printfulColor: 'Athletic Heather', ink: 'dark' },
    ],
    sizeChart: [
      { size: 'S', width: 46, length: 71 },
      { size: 'M', width: 51, length: 74 },
      { size: 'L', width: 56, length: 76 },
      { size: 'XL', width: 61, length: 79 },
      { size: '2XL', width: 66, length: 81 },
      { size: '3XL', width: 71, length: 84 },
    ],
    care: {
      de: ['Auf links waschen, max. 30 °C', 'Nicht in den Trockner', 'Nicht direkt auf dem Druck bügeln'],
      en: ['Wash inside out, 30 °C max', 'Do not tumble dry', 'Do not iron directly on the print'],
    },
    safety: { de: ['Von offenem Feuer fernhalten.'], en: ['Keep away from open flames.'] },
  },
  hoodie: {
    key: 'hoodie',
    label: { de: 'Hoodie', en: 'Hoodie' },
    printfulProductId: 146, // Gildan 18500 Unisex Heavy Blend Hoodie
    model: 'Gildan 18500 Unisex Heavy Blend',
    material: { de: '50 % Baumwolle, 50 % Polyester', en: '50% cotton, 50% polyester' },
    weight: 'ca. 271 g/m²',
    fit: { de: 'Unisex, normale Passform mit Kängurutasche und Kordel.', en: 'Unisex, regular fit with front pouch pocket and drawstring.' },
    priceCents: 5495,
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    colors: [
      { key: 'navy', label: { de: 'Marineblau', en: 'Navy' }, hex: '#1F2A44', printfulColor: 'Navy', ink: 'light' },
      { key: 'schwarz', label: { de: 'Schwarz', en: 'Black' }, hex: '#1B1B1D', printfulColor: 'Black', ink: 'light' },
      { key: 'bordeaux', label: { de: 'Bordeaux', en: 'Maroon' }, hex: '#5A1E2A', printfulColor: 'Maroon', ink: 'light' },
      { key: 'waldgruen', label: { de: 'Waldgrün', en: 'Forest green' }, hex: '#253B2F', printfulColor: 'Forest Green', ink: 'light' },
      { key: 'grau', label: { de: 'Grau meliert', en: 'Heather grey' }, hex: '#B7B7B3', printfulColor: 'Sport Grey', ink: 'dark' },
      { key: 'weiss', label: { de: 'Weiß', en: 'White' }, hex: '#FFFFFF', printfulColor: 'White', ink: 'dark' },
    ],
    sizeChart: [
      { size: 'S', width: 51, length: 69 },
      { size: 'M', width: 56, length: 71 },
      { size: 'L', width: 61, length: 74 },
      { size: 'XL', width: 66, length: 76 },
      { size: '2XL', width: 71, length: 79 },
      { size: '3XL', width: 76, length: 81 },
    ],
    care: {
      de: ['Auf links waschen, max. 30 °C', 'Nicht in den Trockner', 'Nicht direkt auf dem Druck bügeln'],
      en: ['Wash inside out, 30 °C max', 'Do not tumble dry', 'Do not iron directly on the print'],
    },
    safety: {
      de: ['Von offenem Feuer fernhalten.', 'Mit Kordel – nicht für Kinder geeignet.'],
      en: ['Keep away from open flames.', 'Has a drawstring – not suitable for children.'],
    },
  },
};

export type Product = {
  slug: string;
  template: string;
  name: L;
  occasion: L;
  short: L;
  description: L<string[]>;
  garments: Garment['key'][];
  defaultGarment: Garment['key'];
  defaultColor: string;
  /** Made to the customer's specification → no 14-day right of withdrawal (§ 312g Abs. 2 Nr. 1 BGB). */
  personalized: boolean;
  /** Offer "another one with these details" after adding to the cart. */
  companionHint?: L;
  companionResetFields?: string[];
};

export const PRODUCTS: Product[] = [
  {
    slug: 'opa-oma-namen',
    template: 'familienbande',
    name: { de: 'Shirt für Opa & Oma – mit den Namen der Enkel', en: 'Grandpa & Grandma shirt with the grandkids’ names' },
    occasion: { de: 'Für Großeltern', en: 'For grandparents' },
    short: {
      de: 'Groß und stolz: „OPA – von Mia ♥ Leon ♥ Emma“. Auch für Oma, Papa, Mama, Onkel & Tante.',
      en: 'Big and proud: “OPA – von Mia ♥ Leon ♥ Emma”. Also for Grandma, Dad, Mum, uncles and aunts.',
    },
    description: {
      de: [
        'Ein Geschenk, das nicht im Schrank landet: Das Shirt zeigt, wem das Herz gehört – mit bis zu acht Namen.',
        'Du wählst den Titel (Opa, Oma, Papa, Mama …), gibst die Namen ein und siehst sofort, wie das Shirt aussieht. Genau so wird es gedruckt.',
      ],
      en: [
        'A gift that won’t end up at the back of the wardrobe: the shirt shows who holds their heart – with up to eight names.',
        'Choose the title (Opa, Oma, Papa, Mama …), type in the names and see the shirt straight away. That’s exactly how it gets printed.',
      ],
    },
    garments: ['tee', 'hoodie'],
    defaultGarment: 'tee',
    defaultColor: 'navy',
    personalized: true,
    companionHint: { de: 'Passendes Shirt für Oma oder Opa gestalten', en: 'Design a matching one for Grandma or Grandpa' },
  },
  {
    slug: 'familie-weihnachten',
    template: 'weihnachten',
    name: { de: 'Familien-Weihnachtsshirt im Partnerlook', en: 'Matching family Christmas shirt' },
    occasion: { de: 'Weihnachten', en: 'Christmas' },
    short: {
      de: 'Für das Familienfoto unterm Baum: Familienname, Jahr und auf Wunsch der eigene Vorname.',
      en: 'For the family photo under the tree: family name, year and, if you like, each person’s first name.',
    },
    description: {
      de: [
        'Der Partnerlook für Heiligabend: Alle tragen den Familiennamen, und jedes Shirt bekommt auf Wunsch den eigenen Vornamen.',
        'Tipp: Nach dem ersten Shirt kannst du mit einem Klick das nächste für ein weiteres Familienmitglied gestalten.',
      ],
      en: [
        'Matching outfits for Christmas Eve: everyone wears the family name, and each shirt can carry its own first name.',
        'Tip: after the first shirt, one click lets you design the next one for another family member.',
      ],
    },
    garments: ['tee', 'hoodie'],
    defaultGarment: 'tee',
    defaultColor: 'bordeaux',
    personalized: true,
    companionHint: { de: 'Nächstes Shirt für ein weiteres Familienmitglied', en: 'Next shirt for another family member' },
    companionResetFields: ['vorname'],
  },
  {
    slug: 'jahrgang-geburtstag',
    template: 'jahrgang',
    name: { de: 'Jahrgang-Shirt zum runden Geburtstag', en: '“Jahrgang” shirt for a milestone birthday' },
    occasion: { de: 'Runder Geburtstag', en: 'Milestone birthday' },
    short: {
      de: '„Limitierte Auflage – Jahrgang 1966 – alle Teile original.“ Mit Geburtsjahr und Name.',
      en: '“Limited edition – vintage 1966 – all original parts”, printed in German. With birth year and name.',
    },
    description: {
      de: [
        'Für den 50., 60. oder 70. Geburtstag: ein Augenzwinkern, das Geburtstagskinder gerne tragen.',
        'Geburtsjahr eingeben, auf Wunsch den Namen dazu – fertig.',
      ],
      en: [
        'For a 50th, 60th or 70th birthday: a wink that birthday kids are happy to wear.',
        'Enter the birth year, add a name if you like – done.',
      ],
    },
    garments: ['tee', 'hoodie'],
    defaultGarment: 'tee',
    defaultColor: 'schwarz',
    personalized: true,
  },
];

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getColor(g: Garment, key: string) {
  return g.colors.find((c) => c.key === key);
}

// ── Printful variant lookup (generated by scripts/printful-sync.mjs) ───────────

type VariantInfo = { id: number; cost: number | null; eu: boolean | null };
type VariantFile = {
  generatedAt: string | null;
  garments: Partial<
    Record<Garment['key'], { productId: number; productName: string; printfile: { width: number; height: number; dpi: number }; variants: Record<string, Record<string, VariantInfo>> }>
  >;
};
const variants = variantData as VariantFile;

export function printfulVariant(garment: Garment['key'], color: string, size: string): VariantInfo | null {
  return variants.garments[garment]?.variants?.[color]?.[size] ?? null;
}

export function printfileSize(garment: Garment['key']) {
  // Defaults match Printful's 12" × 16" (tee) front area at 150 DPI until the sync script runs.
  return variants.garments[garment]?.printfile ?? { width: 1800, height: 2400, dpi: 150 };
}

export const variantsSynced = Boolean(variants.generatedAt);
