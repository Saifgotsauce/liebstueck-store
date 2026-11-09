// ─────────────────────────────────────────────────────────────────────────────
// The phrase bank: every design in the shop. A design = the words + a layout
// (lib/design/layouts.ts) + optional personalisation fields.
//
// To add a design: copy an entry, give it a new slug, change the words, run
// `npm run render:mockups` for its photos. Check every new phrase against the
// USPTO trademark search (tmsearch.uspto.gov) before advertising it.
// ─────────────────────────────────────────────────────────────────────────────
import type { LayoutSpec } from './design/layouts';
import type { AccentKey, FieldDef } from './design/types';
import type { Locale } from './locale';
import { DESIGNS_DE, VIBES_DE } from './designs-de';

/** US: aging, grandma, retired, birthday, for-him, holiday · DE: see lib/designs-de.ts */
export type VibeKey = string;

export type Vibe = {
  key: VibeKey;
  /** Store the vibe belongs to (default 'en'). */
  locale?: Locale;
  name: string;
  /** Short label for the menu (defaults to the first word of name). */
  nav?: string;
  blurb: string;
  /** How people search for this kind of shirt – used in page titles and descriptions. */
  searchTerm: string;
  /** Big headline on the first product photo. */
  hook: string;
  /** Red line under the product title: who it is for. */
  tagline: string;
  /** "Perfect for …" line in the benefits list. */
  occasion: string;
};

export const VIBES: Vibe[] = [
  {
    key: 'aging', nav: 'Aging', name: 'Aging, Unbothered', blurb: 'Getting older? Getting louder.', searchTerm: 'funny shirts for women over 50',
    hook: 'Getting older? Getting louder.', tagline: 'For women who refuse to act their age.',
    occasion: 'Perfect for birthdays, Mother’s Day or just because',
  },
  {
    key: 'grandma', nav: 'Grandma', name: 'Grandma Era', blurb: 'Spoiling is a sport. These are the uniforms.', searchTerm: 'funny grandma shirts',
    hook: 'Spoil them. Brag about it.', tagline: 'For grandmas with a sense of humor.',
    occasion: 'Perfect for Mother’s Day, birthdays and new-grandma news',
  },
  {
    key: 'retired', nav: 'Retired', name: 'Retired & Loving It', blurb: 'Out of office. Permanently.', searchTerm: 'funny retirement shirts',
    hook: 'Off the clock. Forever.', tagline: 'For the newly retired and gloriously unbothered.',
    occasion: 'Perfect for retirement parties and the first Monday off',
  },
  {
    key: 'birthday', nav: 'Birthdays', name: 'Milestone Birthdays', blurb: '50, 60, 70 and fabulously unbothered.', searchTerm: 'funny 50th, 60th and 70th birthday shirts',
    hook: 'Make the big number look good.', tagline: 'For the milestone birthday girl.',
    occasion: 'Perfect for 50th, 60th and 70th birthdays',
  },
  {
    key: 'for-him', nav: 'For Him', name: 'Gifts for Him', blurb: 'For grandpas, husbands and professional nappers.', searchTerm: 'funny gifts for grandpa and dad',
    hook: 'The gift he’ll actually wear.', tagline: 'For grandpas, husbands and nap champions.',
    occasion: 'Perfect for Father’s Day, birthdays and Christmas',
  },
  {
    key: 'holiday', nav: 'Holiday', name: 'Holiday Shop', blurb: 'Family Christmas shirts and festive sass.', searchTerm: 'funny family Christmas shirts',
    hook: 'Matching shirts. Unmatched chaos.', tagline: 'For the whole family photo.',
    occasion: 'Get one for everyone – bundle savings apply automatically',
  },
];

export type Design = {
  slug: string;
  /** The phrase – also the product name, the way people quote it. */
  title: string;
  vibe: VibeKey;
  spec: LayoutSpec;
  fields?: FieldDef[];
  accent: AccentKey;
  /** Default garment colour (key from lib/catalog.ts). */
  color: string;
  blurb: string;
  featured?: boolean;
  /** Store the design is sold in (default 'en' = US). German designs only appear under /de/. */
  locale?: Locale;
  /** Based on a well-known phrase – check the trademark registers before advertising it. */
  famous?: boolean;
  /** Switched off (e.g. the phrase turned out to be trademarked). */
  hidden?: boolean;
};

// ── Personalisation fields ─────────────────────────────────────────────────────
const nickname = (def: string, help = 'Grandma, Nana, Gigi, Mimi, Grammy… whatever the grandkids call you.'): FieldDef => ({
  key: 'nickname',
  type: 'text',
  label: 'Name on the shirt',
  help,
  maxLength: 12,
  required: true,
  default: def,
});
const HIS_NAME = 'Grandpa, Papa, Pop, Gramps… whatever the grandkids call him.';
const year = (def: string, opts: { label?: string; required?: boolean; min?: number; max?: number; help?: string } = {}): FieldDef => ({
  key: 'year',
  type: 'year',
  label: opts.label ?? 'Year',
  help: opts.help,
  min: opts.min ?? 1920,
  max: opts.max ?? 2035,
  required: opts.required ?? true,
  default: def,
});
const birthYear = (def: string) => year(def, { label: 'Birth year', min: 1920, max: 2010 });
const age = (def: string): FieldDef => ({ key: 'age', type: 'number', label: 'Age', help: 'The birthday number, e.g. 50, 60 or 70.', min: 18, max: 110, required: true, default: def });

export const DESIGNS: Design[] = [
  // ── Aging, Unbothered ─────────────────────────────────────────────────────
  {
    slug: 'not-old-seasoned',
    title: 'Not Old. Seasoned.',
    vibe: 'aging',
    accent: 'red',
    color: 'black',
    featured: true,
    blurb: 'Some people get old. You got seasoned. For anyone who has earned every gray hair and isn’t apologizing for a single one.',
    spec: {
      layout: 'stack',
      lines: [
        { t: 'NOT OLD.', font: 'heavy', size: 230 },
        { t: 'Seasoned.', font: 'retroItalic', size: 300, tone: 'accent', gap: -6 },
      ],
    },
  },
  {
    slug: 'coffee-hot-flashes-spite',
    title: 'Powered by Coffee, Hot Flashes & Spite',
    vibe: 'aging',
    accent: 'red',
    color: 'heather',
    featured: true,
    blurb: 'The three things actually keeping this household running. Honest, warm and slightly dangerous.',
    spec: {
      layout: 'stack',
      lines: [
        { t: 'Powered by', font: 'marker', size: 120 },
        { t: 'COFFEE,', font: 'heavy', size: 200 },
        { t: 'HOT FLASHES', font: 'heavy', size: 200, tone: 'accent' },
        { t: '& SPITE', font: 'heavy', size: 200 },
      ],
    },
  },
  {
    slug: 'fluent-in-sarcasm',
    title: 'Fluent in Sarcasm. Rusty in Patience.',
    vibe: 'aging',
    accent: 'gold',
    color: 'navy',
    blurb: 'Decades of practice. Zero interest in a refresher course.',
    spec: {
      layout: 'stack',
      lines: [
        { t: 'FLUENT IN', font: 'heavy', size: 150, track: 0.04 },
        { t: 'SARCASM.', font: 'retro', size: 280 },
        { t: 'Rusty in patience.', font: 'marker', size: 120, tone: 'accent' },
      ],
    },
  },
  {
    slug: 'fine-wine-cheap-tequila',
    title: 'Aging Like Fine Wine, Acting Like Cheap Tequila',
    vibe: 'aging',
    accent: 'pink',
    color: 'maroon',
    blurb: 'Classy on the label. A little unpredictable after the second glass.',
    spec: {
      layout: 'stack',
      lines: [
        { t: 'AGING LIKE', font: 'heavy', size: 130, track: 0.08 },
        { t: 'Fine Wine', font: 'retroItalic', size: 280, tone: 'accent' },
        { t: 'acting like cheap tequila', font: 'marker', size: 110 },
      ],
    },
  },
  {
    slug: 'vintage-knees',
    title: 'Vintage Knees, Limited Edition Attitude',
    vibe: 'aging',
    accent: 'red',
    color: 'white',
    blurb: 'The knees have a few miles on them. The attitude is in mint condition.',
    spec: {
      layout: 'badge',
      top: 'Vintage knees',
      lines: [
        { t: 'LIMITED', font: 'retro', size: 210 },
        { t: 'EDITION', font: 'retro', size: 210 },
        { t: 'attitude', font: 'script', size: 200, tone: 'accent', gap: -10 },
      ],
      bottom: 'Est. a while ago',
    },
  },
  {
    slug: 'peaked-honey',
    title: 'Peaked? Honey, I’m Just Getting Started',
    vibe: 'aging',
    accent: 'red',
    color: 'heather',
    blurb: 'For the woman who took one look at “slowing down” and politely declined.',
    spec: {
      layout: 'stack',
      lines: [
        { t: 'PEAKED?', font: 'retro', size: 300 },
        { t: 'Honey, I’m just', font: 'marker', size: 130, tone: 'accent' },
        { t: 'getting started.', font: 'marker', size: 130, tone: 'accent' },
      ],
    },
  },
  {
    slug: 'too-old-for-drama',
    title: 'Too Old for Drama, Just Right for Wine',
    vibe: 'aging',
    accent: 'pink',
    color: 'black',
    blurb: 'A life philosophy, conveniently printed on cotton.',
    spec: {
      layout: 'stack',
      lines: [
        { t: 'TOO OLD', font: 'heavy', size: 220 },
        { t: 'for drama.', font: 'script', size: 190, tone: 'accent', gap: -10 },
        { t: 'JUST RIGHT', font: 'heavy', size: 220, gap: 16 },
        { t: 'for wine.', font: 'script', size: 190, tone: 'accent', gap: -10 },
      ],
    },
  },
  {
    slug: 'status-report',
    title: 'Status Report: Unbothered, Moisturized, Mildly Judgmental',
    vibe: 'aging',
    accent: 'teal',
    color: 'heather',
    blurb: 'All three boxes checked before breakfast.',
    spec: { layout: 'checklist', title: [{ t: 'STATUS REPORT:', font: 'heavy', size: 150 }], items: ['Unbothered', 'Moisturized', 'Mildly judgmental'] },
  },
  {
    slug: 'dont-do-mornings',
    title: 'I Don’t Do Mornings. Or Most Afternoons.',
    vibe: 'aging',
    accent: 'gold',
    color: 'navy',
    blurb: 'Evenings are negotiable. Bring coffee and we’ll talk.',
    spec: {
      layout: 'quote',
      lines: [
        { t: 'I don’t do', font: 'retroItalic', size: 190 },
        { t: 'mornings.', font: 'retroItalic', size: 190 },
        { t: 'Or most afternoons.', font: 'retroItalic', size: 120, tone: 'accent' },
      ],
      by: '— me, every day',
    },
  },
  {
    slug: 'say-what-im-thinking',
    title: 'Warning: May Spontaneously Say What I’m Thinking',
    vibe: 'aging',
    accent: 'red',
    color: 'white',
    blurb: 'Consider yourself warned. The filter left years ago and isn’t coming back.',
    spec: {
      layout: 'label',
      header: 'Warning',
      lines: [
        { t: 'MAY SPONTANEOUSLY', font: 'heavy', size: 110 },
        { t: 'SAY WHAT', font: 'retro', size: 220, tone: 'accent' },
        { t: 'I’M THINKING', font: 'retro', size: 220, tone: 'accent' },
      ],
    },
  },

  // ── Grandma Era ─────────────────────────────────────────────────────────────
  {
    slug: 'grandma-era',
    title: 'In My Grandma Era',
    vibe: 'grandma',
    accent: 'red',
    color: 'mauve',
    featured: true,
    blurb: 'Your name, your era. Type Nana, Gigi, Mimi or whatever the little ones call you – we print it big.',
    fields: [nickname('Grandma')],
    spec: {
      layout: 'stack',
      lines: [
        { t: 'In my', font: 'script', size: 160 },
        { t: '{nickname}', font: 'retro', size: 300, upper: true, gap: -14 },
        { t: 'era', font: 'script', size: 400, tone: 'accent', gap: -80 },
      ],
    },
  },
  {
    slug: 'loved-by-grandkids',
    title: 'Loved By – Grandma Shirt with the Grandkids’ Names',
    vibe: 'grandma',
    accent: 'pink',
    color: 'navy',
    featured: true,
    blurb: 'Her name, the year she got promoted, and every grandkid who adores her – up to nine names, printed exactly as you type them.',
    fields: [
      nickname('Nana'),
      year('2016', { label: 'Grandma since (optional)', required: false, help: 'Leave empty to skip the “est.” line.' }),
      { key: 'names', type: 'names', label: 'Grandkids’ names', help: 'Up to 9 names. We print them exactly as typed.', min: 1, max: 9, maxLength: 12, default: ['Emma', 'Liam', 'Noah'] },
    ],
    spec: { layout: 'names', title: '{nickname}', est: 'year', lovedBy: 'loved by', namesKey: 'names' },
  },
  {
    slug: 'retired-from-parenting',
    title: 'Retired from Parenting, Promoted to Grandma',
    vibe: 'grandma',
    accent: 'red',
    color: 'heather',
    blurb: 'Same love, better hours, way more snacks.',
    fields: [nickname('Grandma')],
    spec: {
      layout: 'stack',
      lines: [
        { t: 'RETIRED', font: 'heavy', size: 220 },
        { t: 'from parenting.', font: 'marker', size: 120, tone: 'accent' },
        { t: 'PROMOTED', font: 'heavy', size: 220, gap: 24 },
        { t: 'to {nickname}.', font: 'marker', size: 120, tone: 'accent' },
      ],
    },
  },
  {
    slug: 'spoiling-is-my-cardio',
    title: 'Spoiling My Grandkids Is My Cardio',
    vibe: 'grandma',
    accent: 'pink',
    color: 'black',
    blurb: 'Who needs a gym when there’s a toy aisle and a cookie jar?',
    spec: {
      layout: 'stack',
      lines: [
        { t: 'Spoiling my grandkids', font: 'marker', size: 120 },
        { t: 'IS MY', font: 'heavy', size: 170, tone: 'accent' },
        { t: 'CARDIO', font: 'retro', size: 330 },
      ],
    },
  },
  {
    slug: 'grandmas-house-rules',
    title: 'Grandma’s House Rules',
    vibe: 'grandma',
    accent: 'red',
    color: 'white',
    blurb: 'Bedtime is optional, dessert comes first, and Mom doesn’t need to know. Personalized with her name.',
    fields: [nickname('Grandma')],
    spec: {
      layout: 'checklist',
      title: [
        { t: '{nickname}’s', font: 'script', size: 190, tone: 'accent' },
        { t: 'HOUSE RULES', font: 'heavy', size: 170, gap: -6 },
      ],
      items: ['Bedtime is optional', 'Dessert comes first', 'Mom doesn’t need to know'],
    },
  },
  {
    slug: 'snack-dealer',
    title: 'Grandma: Snack Dealer & Professional Spoiler',
    vibe: 'grandma',
    accent: 'gold',
    color: 'navy',
    blurb: 'Licensed, experienced and fully stocked. Personalized with her name.',
    fields: [nickname('Grandma')],
    spec: {
      layout: 'badge',
      top: '{nickname}',
      lines: [
        { t: 'SNACK', font: 'retro', size: 230 },
        { t: 'DEALER', font: 'retro', size: 230, tone: 'accent' },
      ],
      bottom: '& professional spoiler',
    },
  },
  {
    slug: 'the-grandma-they-warned-you-about',
    title: 'I’m the Grandma They Warned You About',
    vibe: 'grandma',
    accent: 'pink',
    color: 'maroon',
    blurb: 'Sweet as pie, sharp as a tack, and absolutely the reason the kids came home with a drum set.',
    fields: [nickname('Grandma')],
    spec: {
      layout: 'stack',
      lines: [
        { t: 'I’M THE', font: 'heavy', size: 140, track: 0.06 },
        { t: '{nickname}', font: 'script', size: 290, tone: 'accent' },
        { t: 'THEY WARNED', font: 'heavy', size: 170 },
        { t: 'YOU ABOUT', font: 'heavy', size: 170 },
      ],
    },
  },
  {
    slug: 'grandma-on-duty',
    title: 'Now on Duty: Grandma. Spoiling in Progress.',
    vibe: 'grandma',
    accent: 'red',
    color: 'heather',
    blurb: 'Do not disturb. Unless you have grandkids, in which case come right in.',
    fields: [nickname('Grandma')],
    spec: {
      layout: 'label',
      header: 'Now on duty',
      lines: [
        { t: '{nickname}', font: 'retro', size: 260, upper: true },
        { t: 'spoiling in progress', font: 'marker', size: 110, tone: 'accent' },
        { t: 'do not disturb', font: 'marker', size: 110, tone: 'accent' },
      ],
    },
  },
  {
    slug: 'brand-new-grandma',
    title: 'Brand New Grandma, Est. 2026',
    vibe: 'grandma',
    accent: 'pink',
    color: 'white',
    blurb: 'The perfect way to announce the news – or to celebrate the first year on the job.',
    fields: [nickname('Grandma'), year('2026')],
    spec: {
      layout: 'stack',
      lines: [
        { t: 'BRAND NEW', font: 'heavy', size: 160, track: 0.04 },
        { t: '{nickname}', font: 'script', size: 300, tone: 'accent' },
        { t: 'EST. {year}', font: 'heavy', size: 110, track: 0.3, ifField: 'year' },
        { t: '*spoiling starts immediately', font: 'marker', size: 90, gap: 10 },
      ],
    },
  },

  // ── Retired & Loving It ─────────────────────────────────────────────────────
  {
    slug: 'out-of-office-permanently',
    title: 'Out of Office. Permanently.',
    vibe: 'retired',
    accent: 'gold',
    color: 'navy',
    featured: true,
    blurb: 'The last auto-reply they’ll ever need. Add the retirement year for a keepsake from the big send-off.',
    fields: [year('2026', { label: 'Retirement year (optional)', required: false })],
    spec: {
      layout: 'label',
      header: 'Auto-reply',
      lines: [
        { t: 'OUT OF', font: 'heavy', size: 190 },
        { t: 'OFFICE', font: 'heavy', size: 190 },
        { t: 'Permanently.', font: 'retroItalic', size: 200, tone: 'accent' },
        { t: 'Retired {year}', font: 'marker', size: 90, ifField: 'year' },
      ],
    },
  },
  {
    slug: 'retirement-plan',
    title: 'Retirement Plan: Coffee, Nap, Ignore the Alarm, Repeat',
    vibe: 'retired',
    accent: 'red',
    color: 'heather',
    featured: true,
    blurb: 'A carefully considered strategy, decades in the making.',
    spec: {
      layout: 'checklist',
      title: [
        { t: 'RETIREMENT', font: 'heavy', size: 170 },
        { t: 'PLAN:', font: 'heavy', size: 170, tone: 'accent' },
      ],
      items: ['Coffee', 'Nap', 'Ignore the alarm', 'Repeat'],
    },
  },
  {
    slug: 'officially-not-my-problem',
    title: 'Retired. Officially Not My Problem Anymore.',
    vibe: 'retired',
    accent: 'gold',
    color: 'black',
    blurb: 'Forty years of meetings, and this is the only memo that matters.',
    spec: {
      layout: 'stack',
      lines: [
        { t: 'RETIRED.', font: 'retro', size: 300 },
        { t: 'officially', font: 'script', size: 150, tone: 'accent' },
        { t: 'NOT MY PROBLEM', font: 'heavy', size: 160 },
        { t: 'ANYMORE.', font: 'heavy', size: 160 },
      ],
    },
  },
  {
    slug: 'under-new-management',
    title: 'Retired: Under New Management (Me)',
    vibe: 'retired',
    accent: 'teal',
    color: 'white',
    blurb: 'The new boss is wonderful. Very flexible about start times.',
    fields: [year('2026', { label: 'Retirement year' })],
    spec: {
      layout: 'badge',
      top: 'Retired {year}',
      lines: [
        { t: 'UNDER', font: 'heavy', size: 150 },
        { t: 'NEW', font: 'retro', size: 240, tone: 'accent' },
        { t: 'MANAGEMENT', font: 'heavy', size: 150 },
      ],
      bottom: 'Me. Just me.',
    },
  },
  {
    slug: 'legend-has-left-the-building',
    title: 'The Legend Has Left the Building',
    vibe: 'retired',
    accent: 'gold',
    color: 'navy',
    blurb: 'For the colleague everyone will miss – and who will not miss the commute one bit.',
    fields: [year('2026', { label: 'Retirement year (optional)', required: false })],
    spec: {
      layout: 'stack',
      lines: [
        { t: 'THE LEGEND', font: 'heavy', size: 190 },
        { t: 'has left', font: 'script', size: 180, tone: 'accent' },
        { t: 'THE BUILDING', font: 'heavy', size: 190 },
        { t: 'Retired {year}', font: 'marker', size: 100, tone: 'accent', ifField: 'year', gap: 10 },
      ],
    },
  },
  {
    slug: 'worked-my-whole-life-for-this-nap',
    title: 'I Worked My Whole Life for This Nap',
    vibe: 'retired',
    accent: 'pink',
    color: 'maroon',
    blurb: 'Earned, not given. Please keep your voice down.',
    spec: {
      layout: 'quote',
      lines: [
        { t: 'I worked', font: 'retroItalic', size: 180 },
        { t: 'my whole life', font: 'retroItalic', size: 180 },
        { t: 'for this nap.', font: 'retroItalic', size: 180, tone: 'accent' },
      ],
      by: '— retired & resting',
    },
  },
  {
    slug: 'my-weekend-lasts-all-week',
    title: 'My Weekend Now Lasts All Week',
    vibe: 'retired',
    accent: 'red',
    color: 'heather',
    blurb: 'Monday is just Saturday with less traffic.',
    spec: {
      layout: 'stack',
      stars: true,
      lines: [
        { t: 'MY WEEKEND', font: 'heavy', size: 170 },
        { t: 'now lasts', font: 'marker', size: 130, tone: 'accent' },
        { t: 'ALL WEEK', font: 'retro', size: 280 },
      ],
    },
  },
  {
    slug: 'professional-napper',
    title: 'Retired Professional Napper',
    vibe: 'retired',
    accent: 'pink',
    color: 'navy',
    blurb: 'No meetings. No alarms. Fully qualified.',
    spec: {
      layout: 'badge',
      top: 'Retired',
      lines: [
        { t: 'PROFESSIONAL', font: 'heavy', size: 130 },
        { t: 'Napper', font: 'retroItalic', size: 280, tone: 'accent' },
      ],
      bottom: 'No meetings · no alarms',
    },
  },
  {
    slug: 'my-filter-retired-first',
    title: 'My Filter Retired Before I Did',
    vibe: 'retired',
    accent: 'red',
    color: 'black',
    blurb: 'It put in its notice years ago. Nobody threw it a party.',
    spec: {
      layout: 'stack',
      lines: [
        { t: 'My filter', font: 'marker', size: 140 },
        { t: 'RETIRED', font: 'retro', size: 300, tone: 'accent' },
        { t: 'before I did.', font: 'marker', size: 140 },
      ],
    },
  },

  // ── Milestone Birthdays ─────────────────────────────────────────────────────
  {
    slug: 'vintage-birth-year',
    title: 'Vintage – Still Running, Minor Rattles (Custom Birth Year)',
    vibe: 'birthday',
    accent: 'gold',
    color: 'black',
    featured: true,
    blurb: 'Pop in the birth year and you have the easiest 50th, 60th or 70th birthday gift on the block.',
    fields: [birthYear('1966')],
    spec: { layout: 'vintage', top: 'Vintage', big: '{year}', bottom: 'Still running · minor rattles' },
  },
  {
    slug: 'still-not-a-grown-up',
    title: '60 and Still Not a Grown-Up (Custom Age)',
    vibe: 'birthday',
    accent: 'gold',
    color: 'navy',
    blurb: 'Any number you like – the sentiment stays exactly the same.',
    fields: [age('60')],
    spec: {
      layout: 'stack',
      lines: [
        { t: '{age}', font: 'retro', size: 520, tone: 'accent' },
        { t: 'AND STILL NOT', font: 'heavy', size: 150 },
        { t: 'a grown-up', font: 'script', size: 220 },
      ],
    },
  },
  {
    slug: 'took-me-years-to-look-this-good',
    title: 'It Took Me 50 Years to Look This Good (Custom Age)',
    vibe: 'birthday',
    accent: 'red',
    color: 'mauve',
    blurb: 'Craftsmanship takes time. Change the number to match the masterpiece.',
    fields: [age('50')],
    spec: {
      layout: 'stack',
      lines: [
        { t: 'IT TOOK ME', font: 'heavy', size: 150 },
        { t: '{age} YEARS', font: 'retro', size: 280, tone: 'accent' },
        { t: 'TO LOOK', font: 'heavy', size: 150 },
        { t: 'THIS GOOD', font: 'heavy', size: 150 },
      ],
    },
  },
  {
    slug: 'officially-unofficially-39',
    title: 'Officially 60, Unofficially Still 39 (Custom Age)',
    vibe: 'birthday',
    accent: 'pink',
    color: 'white',
    blurb: 'The paperwork says one thing. The heart has its own records.',
    fields: [age('60')],
    spec: {
      layout: 'stack',
      lines: [
        { t: 'OFFICIALLY', font: 'heavy', size: 150, track: 0.08 },
        { t: '{age}', font: 'retro', size: 500 },
        { t: 'unofficially still 39', font: 'marker', size: 120, tone: 'accent' },
      ],
    },
  },
  {
    slug: 'birthday-girl-edition',
    title: 'Birthday Girl, 70 Edition (Custom Age)',
    vibe: 'birthday',
    accent: 'gold',
    color: 'maroon',
    blurb: 'Limited run, no returns, highly collectible. Works for any milestone.',
    fields: [age('70')],
    spec: {
      layout: 'badge',
      top: 'Birthday girl',
      lines: [
        { t: '{age}', font: 'retro', size: 360, tone: 'accent' },
        { t: 'EDITION', font: 'heavy', size: 160, track: 0.1 },
      ],
      bottom: 'Limited run · no returns',
    },
  },
  {
    slug: 'earned-the-right-to-say-no',
    title: 'At 50, I’ve Earned the Right to Say No (Custom Age)',
    vibe: 'birthday',
    accent: 'teal',
    color: 'heather',
    blurb: 'A birthday present and a boundary, all in one.',
    fields: [age('50')],
    spec: {
      layout: 'quote',
      lines: [
        { t: 'At {age}, I’ve', font: 'retroItalic', size: 170 },
        { t: 'earned the right', font: 'retroItalic', size: 170 },
        { t: 'to say no.', font: 'retroItalic', size: 170, tone: 'accent' },
      ],
      by: '— and I will',
    },
  },
  {
    slug: 'send-snacks-and-compliments',
    title: 'Turning 70 – Send Snacks & Compliments (Custom Age)',
    vibe: 'birthday',
    accent: 'pink',
    color: 'black',
    blurb: 'Clear instructions for the whole family. Any age you need.',
    fields: [age('70')],
    spec: {
      layout: 'stack',
      lines: [
        { t: 'TURNING', font: 'heavy', size: 130, track: 0.12 },
        { t: '{age}', font: 'retro', size: 480, tone: 'accent' },
        { t: 'SEND SNACKS', font: 'heavy', size: 170 },
        { t: '& COMPLIMENTS', font: 'heavy', size: 170 },
      ],
    },
  },
  {
    slug: 'fabulously-unbothered',
    title: '60 & Fabulously Unbothered (Custom Age)',
    vibe: 'birthday',
    accent: 'red',
    color: 'mauve',
    blurb: 'Six decades of not caring what anyone thinks, and still improving.',
    fields: [age('60')],
    spec: {
      layout: 'stack',
      lines: [
        { t: '{age}', font: 'retro', size: 480 },
        { t: '& fabulously', font: 'script', size: 180, tone: 'accent' },
        { t: 'UNBOTHERED', font: 'heavy', size: 200 },
      ],
    },
  },

  // ── Gifts for Him ───────────────────────────────────────────────────────────
  {
    slug: 'grandpa-job-description',
    title: 'Grandpa: Fixes Toys, Tells Tall Tales, Naps in Public',
    vibe: 'for-him',
    accent: 'gold',
    color: 'navy',
    blurb: 'The full job description, all boxes checked. Personalized with whatever the grandkids call him.',
    fields: [nickname('Grandpa', HIS_NAME)],
    spec: {
      layout: 'checklist',
      title: [{ t: '{nickname}:', font: 'retro', size: 230, upper: true }],
      items: ['Fixes toys', 'Tells tall tales', 'Naps in public'],
    },
  },
  {
    slug: 'paused-my-nap',
    title: 'I Paused My Nap to Be Here',
    vibe: 'for-him',
    accent: 'red',
    color: 'heather',
    featured: true,
    blurb: 'For family dinners, graduations and any event that dared to start before 3 p.m.',
    spec: {
      layout: 'stack',
      lines: [
        { t: 'I PAUSED', font: 'heavy', size: 200 },
        { t: 'my nap', font: 'script', size: 220, tone: 'accent' },
        { t: 'TO BE HERE', font: 'heavy', size: 200 },
      ],
    },
  },
  {
    slug: 'retired-husband-take-a-number',
    title: 'Retired Husband: Please Take a Number',
    vibe: 'for-him',
    accent: 'red',
    color: 'white',
    blurb: 'Now serving: whoever asked first. Wait times may vary.',
    spec: {
      layout: 'label',
      header: 'Notice',
      lines: [
        { t: 'RETIRED', font: 'heavy', size: 190 },
        { t: 'HUSBAND', font: 'heavy', size: 190 },
        { t: 'please take a number', font: 'marker', size: 120, tone: 'accent' },
      ],
    },
  },
  {
    slug: 'im-listening-face',
    title: 'This Is My “I’m Listening” Face (I’m Not)',
    vibe: 'for-him',
    accent: 'gold',
    color: 'black',
    blurb: 'Perfected over decades of marriage. Absolutely nobody is fooled.',
    spec: {
      layout: 'stack',
      lines: [
        { t: 'THIS IS MY', font: 'heavy', size: 150 },
        { t: '“I’m listening”', font: 'marker', size: 170, tone: 'accent' },
        { t: 'FACE', font: 'retro', size: 300 },
        { t: '(I’m not.)', font: 'marker', size: 100 },
      ],
    },
  },
  {
    slug: 'professional-grandpa',
    title: 'Professional Grandpa, Amateur at Everything Else',
    vibe: 'for-him',
    accent: 'gold',
    color: 'maroon',
    blurb: 'A true expert in his field. Personalized with the name the grandkids use.',
    fields: [nickname('Grandpa', HIS_NAME)],
    spec: {
      layout: 'badge',
      top: 'Professional',
      lines: [
        { t: 'certified', font: 'script', size: 170, tone: 'accent' },
        { t: '{nickname}', font: 'retro', size: 260, upper: true, gap: -10 },
      ],
      bottom: 'Amateur at everything else',
    },
  },
  {
    slug: 'grill-nap-repeat',
    title: 'Grill. Nap. Repeat.',
    vibe: 'for-him',
    accent: 'red',
    color: 'black',
    blurb: 'A weekend routine with a perfect safety record. Mostly.',
    spec: {
      layout: 'stack',
      lines: [
        { t: 'GRILL.', font: 'retro', size: 260 },
        { t: 'NAP.', font: 'retro', size: 260, tone: 'accent' },
        { t: 'REPEAT.', font: 'retro', size: 260 },
      ],
    },
  },
  {
    slug: 'not-grumpy-low-battery',
    title: 'I’m Not Grumpy, I Just Have Low Battery',
    vibe: 'for-him',
    accent: 'red',
    color: 'heather',
    blurb: 'Recharges with a nap, a sandwich and absolutely no small talk.',
    spec: {
      layout: 'stack',
      lines: [
        { t: 'I’M NOT GRUMPY', font: 'heavy', size: 170 },
        { t: 'I just have', font: 'marker', size: 130, tone: 'accent' },
        { t: 'LOW BATTERY', font: 'retro', size: 230 },
      ],
    },
  },
  {
    slug: 'classic-birth-year',
    title: 'Classic – Original Parts (Mostly), Custom Birth Year',
    vibe: 'for-him',
    accent: 'gold',
    color: 'navy',
    blurb: 'For the man who’s been around the block and kept most of the factory parts.',
    fields: [birthYear('1958')],
    spec: { layout: 'vintage', top: 'Classic', big: '{year}', bottom: 'Original parts (mostly)' },
  },

  // ── Holiday Shop ────────────────────────────────────────────────────────────
  {
    slug: 'nice-ish',
    title: 'Nice-ish',
    vibe: 'holiday',
    accent: 'gold',
    color: 'maroon',
    featured: true,
    blurb: 'Technically on the list. Santa has notes.',
    spec: {
      layout: 'stack',
      stars: true,
      lines: [
        { t: 'NICE', font: 'retro', size: 420 },
        { t: '-ish', font: 'script', size: 260, tone: 'accent', gap: -70 },
      ],
    },
  },
  {
    slug: 'oh-what-fun-it-is-to-nap',
    title: 'Oh What Fun It Is to Nap',
    vibe: 'holiday',
    accent: 'red',
    color: 'navy',
    blurb: 'The only carol we know all the words to.',
    spec: {
      layout: 'stack',
      lines: [
        { t: 'Oh what fun', font: 'script', size: 210, tone: 'accent' },
        { t: 'IT IS', font: 'heavy', size: 170 },
        { t: 'TO NAP', font: 'retro', size: 300 },
      ],
    },
  },
  {
    slug: 'most-likely-to-christmas',
    title: 'Most Likely To… (Custom Family Christmas Shirt)',
    vibe: 'holiday',
    accent: 'gold',
    color: 'maroon',
    blurb: 'Give everyone in the family their own line – one shirt each, one hilarious photo.',
    fields: [
      {
        key: 'line',
        type: 'text',
        label: 'Most likely to…',
        help: 'Ideas: nap before dessert · start the group chat drama · burn the cookies · re-gift this shirt',
        maxLength: 30,
        required: true,
        default: 'nap before dessert',
      },
      year('2026', { label: 'Year (optional)', required: false }),
    ],
    spec: {
      layout: 'stack',
      stars: true,
      lines: [
        { t: 'MOST LIKELY TO', font: 'heavy', size: 150, track: 0.04 },
        { t: '{line}', font: 'marker', size: 150, tone: 'accent' },
        { t: 'CHRISTMAS {year}', font: 'heavy', size: 90, track: 0.3, ifField: 'year', gap: 16 },
      ],
    },
  },
  {
    slug: 'family-christmas',
    title: 'Family Christmas Shirt with Your Last Name',
    vibe: 'holiday',
    accent: 'gold',
    color: 'forest',
    blurb: 'Matching shirts for the whole crew, with your family name and the year. Order one for everyone in a single cart.',
    fields: [
      { key: 'surname', type: 'text', label: 'Family name, as it should print', help: 'For example MILLERS, JONESES or GARCIA FAMILY.', maxLength: 16, required: true, default: 'Millers' },
      year('2026'),
    ],
    spec: {
      layout: 'stack',
      stars: true,
      lines: [
        { t: 'THE {surname}', font: 'retro', size: 230, upper: true },
        { t: 'Christmas', font: 'script', size: 280, tone: 'accent' },
        { t: '{year}', font: 'heavy', size: 130, track: 0.35, ifField: 'year' },
      ],
    },
  },
  {
    slug: 'grandmas-cookie-crew',
    title: 'Grandma’s Cookie Crew',
    vibe: 'holiday',
    accent: 'red',
    color: 'white',
    blurb: 'Matching shirts for the baking team. Personalized with her name and the year.',
    fields: [nickname('Grandma'), year('2026')],
    spec: {
      layout: 'badge',
      top: '{nickname}’s',
      lines: [
        { t: 'COOKIE', font: 'retro', size: 230 },
        { t: 'CREW', font: 'retro', size: 230, tone: 'accent' },
      ],
      bottom: 'Batch of {year}',
    },
  },
  {
    slug: 'dear-santa-define-good',
    title: 'Dear Santa, Define “Good”',
    vibe: 'holiday',
    accent: 'gold',
    color: 'forest',
    blurb: 'A reasonable request for clarification before the list is finalized.',
    spec: {
      layout: 'quote',
      lines: [
        { t: 'Dear Santa,', font: 'retroItalic', size: 170 },
        { t: 'define ‘good.’', font: 'retroItalic', size: 210, tone: 'accent' },
      ],
      by: '— your favorite troublemaker',
    },
  },
];

/** Every design in both stores (slugs are unique across stores). */
export const ALL_DESIGNS: Design[] = [...DESIGNS, ...DESIGNS_DE];
const ALL_VIBES: Vibe[] = [...VIBES, ...VIBES_DE];

export const designLocale = (d: Pick<Design, 'locale'>): Locale => d.locale ?? 'en';

/** The designs on sale in one store. */
export function designsFor(locale: Locale) {
  return ALL_DESIGNS.filter((d) => designLocale(d) === locale && !d.hidden);
}

export function vibesFor(locale: Locale) {
  return ALL_VIBES.filter((v) => (v.locale ?? 'en') === locale);
}

export const vibeNav = (v: Vibe) => v.nav ?? v.name.split(/[ ,&]/)[0];

export function getDesign(slug: string) {
  return ALL_DESIGNS.find((d) => d.slug === slug);
}

export function getVibe(key: string) {
  return ALL_VIBES.find((v) => v.key === key);
}

export function designsInVibe(key: VibeKey) {
  return ALL_DESIGNS.filter((d) => d.vibe === key && !d.hidden);
}

export const isPersonalized = (d: Design) => Boolean(d.fields?.length);
