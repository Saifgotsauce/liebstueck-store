// ─────────────────────────────────────────────────────────────────────────────
// Die deutschen Designs für /de/ – 50 Sprüche, geschrieben (nicht übersetzt) für Frauen
// ab 50, Omas, Rentnerinnen und die Männer, die sie beschenken.
//
// ★ = beruht auf einer bekannten Redewendung oder einem verbreiteten Shirt-Spruch.
// Vor dem Schalten von Anzeigen jeden ★-Spruch im DPMA-Register und bei EUIPO (Klasse 25)
// prüfen – siehe docs/germany.md. Ist einer für Kleidung eingetragen: `hidden: true`.
// ─────────────────────────────────────────────────────────────────────────────
import type { Design, Vibe } from './designs';
import type { FieldDef } from './design/types';

// Slugs and vibe keys here must not clash with the US ones (lib/designs.ts).
export const VIBES_DE: Vibe[] = [
  {
    key: 'ue50', nav: 'Ü50', locale: 'de', name: 'Ü50 & kein bisschen leise', blurb: 'Älter? Ja. Leiser? Nie.', searchTerm: 'lustige Shirts für Frauen ab 50',
    hook: 'Älter? Ja. Leiser? Nie.', tagline: 'Für Frauen, die nicht vorhaben, leiser zu werden.',
    occasion: 'Perfekt zum Geburtstag, zum Muttertag oder einfach so',
  },
  {
    key: 'oma', nav: 'Oma', locale: 'de', name: 'Oma-Modus', blurb: 'Verwöhnen ist Leistungssport. Hier sind die Trikots.', searchTerm: 'lustige Oma-Shirts',
    hook: 'Verwöhnen. Angeben. Wiederholen.', tagline: 'Für Omas mit Humor.',
    occasion: 'Perfekt zum Muttertag, zum Geburtstag oder wenn ein Enkel unterwegs ist',
  },
  {
    key: 'rente', nav: 'Rente', locale: 'de', name: 'Rente & Ruhestand', blurb: 'Feierabend. Für immer.', searchTerm: 'lustige Shirts zur Rente',
    hook: 'Feierabend. Für immer.', tagline: 'Für Rentnerinnen, die endlich ausschlafen.',
    occasion: 'Perfekt zum Abschied in den Ruhestand und für den ersten freien Montag',
  },
  {
    key: 'geburtstag', nav: 'Geburtstag', locale: 'de', name: 'Runde Geburtstage', blurb: '50, 60, 70 – und kein bisschen leise.', searchTerm: 'lustige Shirts zum 50., 60. und 70. Geburtstag',
    hook: 'Die große Zahl? Steht dir.', tagline: 'Für das Geburtstagskind mit der runden Zahl.',
    occasion: 'Perfekt zum 50., 60. und 70. Geburtstag',
  },
  {
    key: 'fuer-ihn', nav: 'Für ihn', locale: 'de', name: 'Für ihn', blurb: 'Für Opas, Ehemänner und Mittagsschlaf-Profis.', searchTerm: 'lustige Geschenke für Opa und Papa',
    hook: 'Das Geschenk, das er wirklich anzieht.', tagline: 'Für Opas, Ehemänner und Mittagsschlaf-Profis.',
    occasion: 'Perfekt zum Vatertag, zum Geburtstag und zu Weihnachten',
  },
  {
    key: 'weihnachten', nav: 'Weihnachten', locale: 'de', name: 'Weihnachten', blurb: 'Familien-Shirts und festliche Frechheiten.', searchTerm: 'lustige Weihnachtsshirts für die Familie',
    hook: 'Gleiche Shirts. Volles Chaos.', tagline: 'Für das ganze Familienfoto.',
    occasion: 'Eins für alle – der Mengenrabatt gilt automatisch',
  },
];

// ── Felder zum Personalisieren ────────────────────────────────────────────────

const nickname = (def: string, help = 'Oma, Omi, Oma Gisela … so, wie die Enkel dich nennen.'): FieldDef => ({
  key: 'nickname',
  type: 'text',
  label: 'Name auf dem Shirt',
  help,
  maxLength: 12,
  required: true,
  default: def,
});
const HIS_NAME = 'Opa, Opi, Papa, Opa Klaus … so, wie ihn die Enkel nennen.';
const year = (def: string, opts: { label?: string; required?: boolean; min?: number; max?: number; help?: string } = {}): FieldDef => ({
  key: 'year',
  type: 'year',
  label: opts.label ?? 'Jahr',
  help: opts.help,
  min: opts.min ?? 1920,
  max: opts.max ?? 2035,
  required: opts.required ?? true,
  default: def,
});
const birthYear = (def: string) => year(def, { label: 'Geburtsjahr', min: 1920, max: 2010 });
const age = (def: string): FieldDef => ({ key: 'age', type: 'number', label: 'Alter', help: 'Die Zahl, die gefeiert wird – z. B. 50, 60 oder 70.', min: 18, max: 110, required: true, default: def });

const d = (x: Omit<Design, 'locale'>): Design => ({ ...x, locale: 'de' });

export const DESIGNS_DE: Design[] = [
  // ── Ü50 & kein bisschen leise ─────────────────────────────────────────────
  d({
    slug: 'nicht-alt-vintage',
    title: 'Nicht alt. Vintage.',
    vibe: 'ue50',
    accent: 'red',
    color: 'black',
    featured: true,
    famous: true,
    blurb: 'Alt ist, was man wegwirft. Vintage ist, was man sammelt. Für jede, die mit jedem Jahr wertvoller wird.',
    spec: {
      layout: 'stack',
      lines: [
        { t: 'NICHT ALT.', font: 'heavy', size: 220 },
        { t: 'Vintage.', font: 'retroItalic', size: 320, tone: 'accent', gap: -6 },
      ],
    },
  }),
  d({
    slug: 'je-oller-desto-doller',
    title: 'Je oller, desto doller',
    vibe: 'ue50',
    accent: 'red',
    color: 'navy',
    featured: true,
    famous: true,
    blurb: 'Das älteste Versprechen der Welt – und du hältst es jeden Tag. Für Frauen, die mit den Jahren nur mutiger werden.',
    spec: {
      layout: 'stack',
      lines: [
        { t: 'JE OLLER,', font: 'heavy', size: 230 },
        { t: 'desto', font: 'script', size: 170, tone: 'accent', gap: -8 },
        { t: 'DOLLER.', font: 'retro', size: 320, gap: -6 },
      ],
    },
  }),
  d({
    slug: 'kaffee-hitzewallungen-trotz',
    title: 'Angetrieben von Kaffee, Hitzewallungen und purem Trotz',
    vibe: 'ue50',
    accent: 'red',
    color: 'heather',
        blurb: 'Die drei Dinge, die diesen Haushalt am Laufen halten. Ehrlich, warmherzig und ein bisschen gefährlich.',
    spec: {
      layout: 'stack',
      lines: [
        { t: 'Angetrieben von', font: 'marker', size: 120 },
        { t: 'KAFFEE,', font: 'heavy', size: 200 },
        { t: 'HITZEWALLUNGEN', font: 'heavy', size: 200, tone: 'accent' },
        { t: '& PUREM TROTZ', font: 'heavy', size: 200 },
      ],
    },
  }),
  d({
    slug: 'zustand-alter-laufleistung',
    title: 'Zustand entspricht Alter und Laufleistung',
    vibe: 'ue50',
    accent: 'red',
    color: 'white',
    famous: true,
    blurb: 'Wie im Gebrauchtwagen-Inserat: ehrlich, gepflegt, mit ein paar Kilometern drauf. Läuft trotzdem wie eine Eins.',
    spec: {
      layout: 'label',
      header: 'Gutachten',
      lines: [
        { t: 'ZUSTAND', font: 'retro', size: 260 },
        { t: 'entspricht Alter', font: 'marker', size: 140, tone: 'accent' },
        { t: 'und Laufleistung', font: 'marker', size: 140, tone: 'accent' },
      ],
    },
  }),
  d({
    slug: 'zu-alt-fuer-drama',
    title: 'Zu alt für Drama. Genau richtig für Wein.',
    vibe: 'ue50',
    accent: 'pink',
    color: 'black',
    blurb: 'Eine Lebensphilosophie, praktischerweise auf Baumwolle gedruckt.',
    spec: {
      layout: 'stack',
      lines: [
        { t: 'ZU ALT', font: 'heavy', size: 220 },
        { t: 'für Drama.', font: 'script', size: 190, tone: 'accent', gap: -10 },
        { t: 'GENAU RICHTIG', font: 'heavy', size: 200, gap: 16 },
        { t: 'für Wein.', font: 'script', size: 190, tone: 'accent', gap: -10 },
      ],
    },
  }),
  d({
    slug: 'nicht-stur-meinungsstabil',
    title: 'Nicht stur. Nur meinungsstabil.',
    vibe: 'ue50',
    accent: 'gold',
    color: 'navy',
    famous: true,
    blurb: 'Jahrzehnte Erfahrung führen zu festen Überzeugungen. Diskutieren kann man trotzdem – verlieren wirst du.',
    spec: {
      layout: 'stack',
      lines: [
        { t: 'NICHT STUR.', font: 'heavy', size: 200 },
        { t: 'Nur', font: 'marker', size: 130, gap: 6 },
        { t: 'meinungsstabil.', font: 'retroItalic', size: 240, tone: 'accent', gap: -4 },
      ],
    },
  }),
  d({
    slug: 'statusbericht',
    title: 'Statusbericht: tiefenentspannt, gut eingecremt, leicht lästerlich',
    vibe: 'ue50',
    accent: 'teal',
    color: 'heather',
    blurb: 'Alle drei Häkchen gesetzt – noch vor dem Frühstück.',
    spec: { layout: 'checklist', title: [{ t: 'STATUSBERICHT:', font: 'heavy', size: 150 }], items: ['Tiefenentspannt', 'Gut eingecremt', 'Leicht lästerlich'] },
  }),
  d({
    slug: 'achtung-sage-was-ich-denke',
    title: 'Achtung: Kann jederzeit sagen, was ich denke',
    vibe: 'ue50',
    accent: 'red',
    color: 'white',
    blurb: 'Du bist gewarnt. Der Filter ist vor Jahren in Rente gegangen und kommt nicht wieder.',
    spec: {
      layout: 'label',
      header: 'Achtung',
      lines: [
        { t: 'KANN JEDERZEIT', font: 'heavy', size: 120 },
        { t: 'SAGEN, WAS', font: 'retro', size: 220, tone: 'accent' },
        { t: 'ICH DENKE', font: 'retro', size: 220, tone: 'accent' },
      ],
    },
  }),
  d({
    slug: 'aelter-ist-wie-jung',
    title: 'Älter ist wie jung, nur besser',
    vibe: 'ue50',
    accent: 'pink',
    color: 'maroon',
    famous: true,
    blurb: 'Gleiche Frau, mehr Erfahrung, weniger Geduld für Unsinn. Ein klares Upgrade.',
    spec: {
      layout: 'stack',
      lines: [
        { t: 'ÄLTER', font: 'retro', size: 320 },
        { t: 'ist wie jung,', font: 'marker', size: 140 },
        { t: 'nur besser.', font: 'retroItalic', size: 230, tone: 'accent', gap: -4 },
      ],
    },
  }),
  d({
    slug: 'alter-schuetzt-vor-torheit-nicht',
    title: 'Alter schützt vor Torheit nicht. Zum Glück.',
    vibe: 'ue50',
    accent: 'gold',
    color: 'navy',
    famous: true,
    blurb: 'Das Sprichwort kennt jede. Den zweiten Teil haben wir ergänzt – weil er stimmt.',
    spec: {
      layout: 'quote',
      lines: [
        { t: 'Alter schützt', font: 'retroItalic', size: 190 },
        { t: 'vor Torheit nicht.', font: 'retroItalic', size: 160 },
        { t: 'Zum Glück.', font: 'retroItalic', size: 170, tone: 'accent' },
      ],
      by: '— Volksmund, frei ergänzt',
    },
  }),

  // ── Oma-Modus ─────────────────────────────────────────────────────────────
  d({
    slug: 'oma-modus-aktiviert',
    title: 'Oma-Modus: aktiviert – mit deinem Namen',
    vibe: 'oma',
    accent: 'red',
    color: 'navy',
    featured: true,
    blurb: 'Dein Name, dein Modus. Ob Oma, Omi oder Oma Gisela – wir drucken es groß.',
    fields: [nickname('Oma')],
    spec: {
      layout: 'stack',
      lines: [
        { t: '{nickname}', font: 'retro', size: 300, upper: true },
        { t: 'Modus', font: 'script', size: 280, tone: 'accent', gap: -40 },
        { t: 'AKTIVIERT', font: 'heavy', size: 150, track: 0.08, gap: 10 },
      ],
    },
  }),
  d({
    slug: 'oma-frau-mythos-legende',
    title: 'Oma – Die Frau. Der Mythos. Die Legende.',
    vibe: 'oma',
    accent: 'gold',
    color: 'navy',
        famous: true,
    blurb: 'Für die Frau, über die in der Familie Geschichten erzählt werden. Mit dem Namen, den die Enkel ihr gegeben haben.',
    fields: [nickname('Oma')],
    spec: {
      layout: 'stack',
      lines: [
        { t: '{nickname}', font: 'retro', size: 320, upper: true },
        { t: 'Die Frau.', font: 'marker', size: 130, gap: 10 },
        { t: 'Der Mythos.', font: 'marker', size: 130 },
        { t: 'Die Legende.', font: 'marker', size: 150, tone: 'accent' },
      ],
    },
  }),
  d({
    slug: 'oma-wie-mama-nur-cooler',
    title: 'Oma: wie Mama, nur cooler',
    vibe: 'oma',
    accent: 'pink',
    color: 'heather',
    famous: true,
    blurb: 'Mehr Eis, mehr Geduld, mehr Geschichten von früher. Die Enkel wissen genau, wer hier die Coole ist.',
    spec: {
      layout: 'stack',
      lines: [
        { t: 'OMA', font: 'retro', size: 360 },
        { t: 'wie Mama,', font: 'script', size: 180, gap: -14 },
        { t: 'nur cooler.', font: 'script', size: 190, tone: 'accent', gap: -18 },
      ],
    },
  }),
  d({
    slug: 'geliebt-von-enkeln',
    title: 'Geliebt von – Oma-Shirt mit den Namen der Enkel',
    vibe: 'oma',
    accent: 'pink',
    color: 'navy',
    featured: true,
    blurb: 'Ihr Name, das Jahr ihrer Beförderung und jedes Enkelkind, das sie liebt – bis zu neun Namen, genau so gedruckt, wie du sie eintippst.',
    fields: [
      nickname('Oma'),
      year('2016', { label: 'Oma seit (optional)', required: false, help: 'Leer lassen, dann fällt die „Seit“-Zeile weg.' }),
      { key: 'names', type: 'names', label: 'Namen der Enkel', help: 'Bis zu 9 Namen. Wir drucken sie genau so, wie du sie eintippst.', min: 1, max: 9, maxLength: 12, default: ['Emma', 'Ben', 'Mia'] },
    ],
    spec: { layout: 'names', title: '{nickname}', est: 'year', estLabel: 'SEIT', lovedBy: 'geliebt von', namesKey: 'names' },
  }),
  d({
    slug: 'befoerdert-zur-oma',
    title: 'Befördert zur Oma – mit Jahr',
    vibe: 'oma',
    accent: 'red',
    color: 'white',
    famous: true,
    blurb: 'Die schönste Beförderung des Lebens – ganz ohne Bewerbungsgespräch. Perfekt, um die frohe Nachricht zu verkünden.',
    fields: [nickname('Oma'), year('2027', { label: 'Jahr', min: 2024, max: 2035 })],
    spec: {
      layout: 'stack',
      lines: [
        { t: 'BEFÖRDERT', font: 'heavy', size: 200 },
        { t: 'zur', font: 'script', size: 150, gap: -6 },
        { t: '{nickname}', font: 'retro', size: 300, upper: true, tone: 'accent', gap: -10 },
        { t: '{year}', font: 'heavy', size: 160, track: 0.12 },
      ],
    },
  }),
  d({
    slug: 'verwoehnen-ist-mein-sport',
    title: 'Verwöhnen ist mein Sport',
    vibe: 'oma',
    accent: 'gold',
    color: 'forest',
    blurb: 'Training täglich, Turniere am Wochenende. Disziplinen: Eis, Pommes und „Na gut, noch fünf Minuten“.',
    spec: {
      layout: 'stack',
      lines: [
        { t: 'VERWÖHNEN', font: 'heavy', size: 210 },
        { t: 'ist mein', font: 'marker', size: 140 },
        { t: 'Sport.', font: 'retroItalic', size: 320, tone: 'accent', gap: -8 },
      ],
    },
  }),
  d({
    slug: 'oma-superkraft',
    title: 'Ich bin Oma. Was ist deine Superkraft?',
    vibe: 'oma',
    accent: 'red',
    color: 'black',
    famous: true,
    blurb: 'Trösten, backen, Geheimnisse bewahren – gleichzeitig. Mit dem Namen, den die Enkel benutzen.',
    fields: [nickname('Oma')],
    spec: {
      layout: 'stack',
      lines: [
        { t: 'Ich bin', font: 'script', size: 160 },
        { t: '{nickname}.', font: 'retro', size: 300, upper: true, gap: -10 },
        { t: 'Was ist deine', font: 'marker', size: 120, gap: 8 },
        { t: 'Superkraft?', font: 'retroItalic', size: 220, tone: 'accent' },
      ],
    },
  }),
  d({
    slug: 'omas-regeln',
    title: 'Omas Regeln: Eis zum Frühstück, länger aufbleiben, Mama nix verraten',
    vibe: 'oma',
    accent: 'red',
    color: 'heather',
    blurb: 'Bei Oma gelten andere Gesetze. Hier sind sie, schriftlich festgehalten.',
    spec: {
      layout: 'checklist',
      title: [
        { t: 'OMAS', font: 'heavy', size: 170 },
        { t: 'REGELN:', font: 'heavy', size: 170, tone: 'accent' },
      ],
      items: ['Eis zum Frühstück', 'Länger aufbleiben', 'Mama nix verraten'],
    },
  }),
  d({
    slug: 'kaffee-kuchen-enkel',
    title: 'Kaffee. Kuchen. Enkel.',
    vibe: 'oma',
    accent: 'pink',
    color: 'maroon',
    blurb: 'Die heilige Dreifaltigkeit eines perfekten Sonntagnachmittags.',
    spec: {
      layout: 'stack',
      lines: [
        { t: 'KAFFEE.', font: 'heavy', size: 230 },
        { t: 'KUCHEN.', font: 'heavy', size: 230, tone: 'accent' },
        { t: 'Enkel.', font: 'script', size: 300, gap: -12 },
      ],
    },
  }),

  // ── Rente & Ruhestand ─────────────────────────────────────────────────────
  d({
    slug: 'rente-muss-gar-nix',
    title: 'Ich bin in Rente. Ich muss gar nix.',
    vibe: 'rente',
    accent: 'gold',
    color: 'navy',
    featured: true,
    famous: true,
    blurb: 'Vierzig Jahre lang musste man. Jetzt nicht mehr. Der Satz, den jede Rentnerin einmal laut sagen sollte.',
    spec: {
      layout: 'stack',
      lines: [
        { t: 'Ich bin in', font: 'marker', size: 140 },
        { t: 'RENTE.', font: 'retro', size: 340, tone: 'accent' },
        { t: 'Ich muss gar nix.', font: 'marker', size: 140 },
      ],
    },
  }),
  d({
    slug: 'montags-gut-gelaunt',
    title: 'Wie nennt man Frauen, die montags gute Laune haben? Rentnerin.',
    vibe: 'rente',
    accent: 'red',
    color: 'white',
        famous: true,
    blurb: 'Der älteste Rentnerwitz der Republik – endlich zum Anziehen. Für den ersten Montag ohne Wecker.',
    spec: {
      layout: 'stack',
      lines: [
        { t: 'Wie nennt man Frauen,', font: 'marker', size: 100 },
        { t: 'die montags gute', font: 'marker', size: 100 },
        { t: 'Laune haben?', font: 'marker', size: 100 },
        { t: 'RENTNERIN.', font: 'retro', size: 260, tone: 'accent', gap: 16 },
      ],
    },
  }),
  d({
    slug: 'rentenplan',
    title: 'Rentenplan: Kaffee, Mittagsschlaf, Wecker ignorieren, wiederholen',
    vibe: 'rente',
    accent: 'red',
    color: 'heather',
    blurb: 'Eine sorgfältig durchdachte Strategie – jahrzehntelang vorbereitet.',
    spec: {
      layout: 'checklist',
      title: [
        { t: 'RENTEN-', font: 'heavy', size: 170 },
        { t: 'PLAN:', font: 'heavy', size: 170, tone: 'accent' },
      ],
      items: ['Kaffee', 'Mittagsschlaf', 'Wecker ignorieren', 'Wiederholen'],
    },
  }),
  d({
    slug: 'wer-rastet-der-rostet',
    title: 'Wer rastet, der rostet. Ich roste gern.',
    vibe: 'rente',
    accent: 'gold',
    color: 'maroon',
    famous: true,
    blurb: 'Das Sprichwort hat recht. Es ist uns nur inzwischen egal.',
    spec: {
      layout: 'stack',
      lines: [
        { t: 'Wer rastet,', font: 'marker', size: 150 },
        { t: 'der rostet.', font: 'marker', size: 150 },
        { t: 'ICH ROSTE', font: 'heavy', size: 210, gap: 20 },
        { t: 'gern.', font: 'retroItalic', size: 300, tone: 'accent', gap: -6 },
      ],
    },
  }),
  d({
    slug: 'morgenstund-ausschlafen',
    title: 'Morgenstund hat Gold im Mund. Ich schlaf trotzdem aus.',
    vibe: 'rente',
    accent: 'gold',
    color: 'navy',
    famous: true,
    blurb: 'Das Gold kann warten. Bis halb zehn mindestens.',
    spec: {
      layout: 'quote',
      lines: [
        { t: 'Morgenstund', font: 'retroItalic', size: 200 },
        { t: 'hat Gold im Mund.', font: 'retroItalic', size: 160 },
        { t: 'Ich schlaf trotzdem aus.', font: 'retroItalic', size: 120, tone: 'accent' },
      ],
      by: '— Rentnerweisheit',
    },
  }),
  d({
    slug: 'feierabend-fuer-immer',
    title: 'Feierabend. Für immer.',
    vibe: 'rente',
    accent: 'red',
    color: 'black',
    blurb: 'Das schönste Wort der deutschen Sprache – jetzt mit Ewigkeitsgarantie.',
    spec: {
      layout: 'stack',
      lines: [
        { t: 'FEIERABEND.', font: 'heavy', size: 220 },
        { t: 'für immer.', font: 'script', size: 280, tone: 'accent', gap: -8 },
      ],
    },
  }),
  d({
    slug: 'ruhestand-aussehen-denken-handeln',
    title: 'Ruhestand: aussehen wie 60, denken wie 30, handeln wie 18',
    vibe: 'rente',
    accent: 'gold',
    color: 'forest',
    famous: true,
    blurb: 'Die bekannteste Formel des Ruhestands. Die letzte Zeile ist die wichtigste.',
    spec: {
      layout: 'stack',
      lines: [
        { t: 'RUHESTAND:', font: 'heavy', size: 190 },
        { t: 'aussehen wie 60,', font: 'marker', size: 130, gap: 8 },
        { t: 'denken wie 30,', font: 'marker', size: 130 },
        { t: 'handeln wie 18.', font: 'marker', size: 150, tone: 'accent' },
      ],
    },
  }),
  d({
    slug: 'rente-jahr-mission-erfuellt',
    title: 'Rente – Mission erfüllt (mit Jahr)',
    vibe: 'rente',
    accent: 'red',
    color: 'white',
    blurb: 'Das Jahr, in dem der Wecker endgültig verloren hat. Das perfekte Abschiedsgeschenk von den Kolleginnen.',
    fields: [year('2026', { label: 'Rentenjahr', min: 2020, max: 2035 })],
    spec: {
      layout: 'stack',
      lines: [
        { t: 'RENTE', font: 'retro', size: 330 },
        { t: '{year}', font: 'heavy', size: 220, tone: 'accent', track: 0.06 },
        { t: 'Mission erfüllt.', font: 'marker', size: 140, gap: 8 },
      ],
    },
  }),

  // ── Runde Geburtstage ─────────────────────────────────────────────────────
  d({
    slug: 'jahrgang-alle-teile-original',
    title: 'Jahrgang – alle Teile original (mit Geburtsjahr)',
    vibe: 'geburtstag',
    accent: 'gold',
    color: 'black',
    featured: true,
    famous: true,
    blurb: 'Geburtsjahr eintragen, fertig ist das einfachste Geschenk zum 50., 60. oder 70. Geburtstag.',
    fields: [birthYear('1966')],
    spec: { layout: 'vintage', top: 'Jahrgang', big: '{year}', bottom: 'Alle Teile original' },
  }),
  d({
    slug: 'limited-edition-jahrgang',
    title: 'Limited Edition – Jahrgang mit Geburtsjahr',
    vibe: 'geburtstag',
    accent: 'red',
    color: 'white',
    famous: true,
    blurb: 'Nur ein Exemplar hergestellt. Keine Nachproduktion geplant.',
    fields: [birthYear('1966')],
    spec: {
      layout: 'badge',
      top: 'Limited Edition',
      lines: [
        { t: 'JAHRGANG', font: 'heavy', size: 150, track: 0.06 },
        { t: '{year}', font: 'retro', size: 320, tone: 'accent' },
      ],
      bottom: 'Nur 1 Exemplar',
    },
  }),
  d({
    slug: 'nicht-alt-18-mit-erfahrung',
    title: 'Ich bin nicht 60. Ich bin 18 mit sehr viel Erfahrung. (mit Alter)',
    vibe: 'geburtstag',
    accent: 'red',
    color: 'heather',
    famous: true,
    blurb: 'Die beliebteste Geburtstagsrechnung Deutschlands – mit der Zahl, die gefeiert wird.',
    fields: [age('60')],
    spec: {
      layout: 'stack',
      lines: [
        { t: 'Ich bin nicht', font: 'marker', size: 140 },
        { t: '{age}.', font: 'retro', size: 340, tone: 'accent' },
        { t: 'ICH BIN 18', font: 'heavy', size: 180 },
        { t: 'mit sehr viel Erfahrung.', font: 'marker', size: 120 },
      ],
    },
  }),
  d({
    slug: 'kein-bisschen-leise',
    title: '60 und kein bisschen leise (mit Alter)',
    vibe: 'geburtstag',
    accent: 'gold',
    color: 'navy',
    featured: true,
    famous: true,
    blurb: 'Frei nach dem alten Schlager – nur dass hier niemand vorhat, ruhiger zu werden.',
    fields: [age('60')],
    spec: {
      layout: 'stack',
      lines: [
        { t: '{age}', font: 'retro', size: 440, tone: 'accent' },
        { t: 'und kein bisschen', font: 'marker', size: 140, gap: -4 },
        { t: 'LEISE.', font: 'heavy', size: 250 },
      ],
    },
  }),
  d({
    slug: 'geburtstagskind-will-sekt',
    title: 'Das Geburtstagskind will Sekt',
    vibe: 'geburtstag',
    accent: 'red',
    color: 'black',
    blurb: 'Klare Ansage, klare Wünsche. Gläser bitte bereithalten.',
    spec: {
      layout: 'stack',
      lines: [
        { t: 'Das', font: 'script', size: 160 },
        { t: 'GEBURTSTAGSKIND', font: 'heavy', size: 150, gap: -6 },
        { t: 'will Sekt.', font: 'retroItalic', size: 270, tone: 'accent' },
      ],
    },
  }),
  d({
    slug: 'glaeschen-in-ehren',
    title: 'Ein Gläschen in Ehren kann niemand verwehren',
    vibe: 'geburtstag',
    accent: 'pink',
    color: 'maroon',
    famous: true,
    blurb: 'Das Sprichwort, das schon Oma kannte – und das bei jeder Feier wieder gilt.',
    spec: {
      layout: 'quote',
      lines: [
        { t: 'Ein Gläschen', font: 'retroItalic', size: 200 },
        { t: 'in Ehren', font: 'retroItalic', size: 200 },
        { t: 'kann niemand verwehren.', font: 'retroItalic', size: 120, tone: 'accent' },
      ],
      by: '— sagt schon Oma',
    },
  }),
  d({
    slug: 'so-alt-wie-man-sich-fuehlt',
    title: 'Man ist so alt, wie man sich fühlt. Heute: 29.',
    vibe: 'geburtstag',
    accent: 'red',
    color: 'heather',
    famous: true,
    blurb: 'Das Gefühl entscheidet. Und das Gefühl sagt heute eindeutig 29.',
    spec: {
      layout: 'stack',
      lines: [
        { t: 'Man ist so alt,', font: 'marker', size: 130 },
        { t: 'wie man sich fühlt.', font: 'marker', size: 130 },
        { t: 'HEUTE:', font: 'heavy', size: 160, gap: 20 },
        { t: '29', font: 'retro', size: 400, tone: 'accent', gap: -6 },
      ],
    },
  }),
  d({
    slug: 'geburtstagskoenigin-seit',
    title: 'Geburtstagskönigin seit … (mit Geburtsjahr)',
    vibe: 'geburtstag',
    accent: 'gold',
    color: 'black',
    blurb: 'Eine Krönung, die jedes Jahr wiederholt wird. Mit dem Jahr, in dem die Regentschaft begann.',
    fields: [birthYear('1966')],
    spec: {
      layout: 'stack',
      lines: [
        { t: 'GEBURTSTAGS-', font: 'heavy', size: 160 },
        { t: 'königin', font: 'retroItalic', size: 300, tone: 'accent', gap: -6 },
        { t: 'seit {year}', font: 'marker', size: 140, gap: 6 },
      ],
    },
  }),

  // ── Für ihn ──────────────────────────────────────────────────────────────
  d({
    slug: 'wenn-opa-es-nicht-reparieren-kann',
    title: 'Wenn Opa es nicht reparieren kann, kann es keiner',
    vibe: 'fuer-ihn',
    accent: 'gold',
    color: 'navy',
    featured: true,
    famous: true,
    blurb: 'Kabelbinder, Klebeband und vierzig Jahre Erfahrung. Mit dem Namen, den die Enkel ihm geben.',
    fields: [nickname('Opa', HIS_NAME)],
    spec: {
      layout: 'stack',
      lines: [
        { t: 'Wenn', font: 'marker', size: 130 },
        { t: '{nickname}', font: 'retro', size: 300, upper: true, gap: -4 },
        { t: 'es nicht reparieren kann,', font: 'marker', size: 115 },
        { t: 'KANN ES KEINER.', font: 'heavy', size: 170, tone: 'accent', gap: 10 },
      ],
    },
  }),
  d({
    slug: 'opas-wissen-alles',
    title: 'Papas wissen viel. Opas wissen alles.',
    vibe: 'fuer-ihn',
    accent: 'red',
    color: 'heather',
    famous: true,
    blurb: 'Eine wissenschaftlich nie widerlegte Tatsache. Fragt ihn ruhig – er erklärt es gern ausführlich.',
    spec: {
      layout: 'stack',
      lines: [
        { t: 'Papas wissen viel.', font: 'marker', size: 140 },
        { t: 'OPAS', font: 'retro', size: 340, tone: 'accent', gap: 6 },
        { t: 'WISSEN ALLES.', font: 'heavy', size: 180 },
      ],
    },
  }),
  d({
    slug: 'opa-mann-mythos-legende',
    title: 'Opa – Der Mann. Der Mythos. Die Legende.',
    vibe: 'fuer-ihn',
    accent: 'gold',
    color: 'black',
    famous: true,
    blurb: 'Für den Mann, über den die Familie am liebsten Geschichten erzählt. Mit seinem Opa-Namen.',
    fields: [nickname('Opa', HIS_NAME)],
    spec: {
      layout: 'stack',
      lines: [
        { t: '{nickname}', font: 'retro', size: 320, upper: true },
        { t: 'Der Mann.', font: 'marker', size: 130, gap: 10 },
        { t: 'Der Mythos.', font: 'marker', size: 130 },
        { t: 'Die Legende.', font: 'marker', size: 150, tone: 'accent' },
      ],
    },
  }),
  d({
    slug: 'mittagsschlaf-unterbrochen',
    title: 'Ich habe meinen Mittagsschlaf unterbrochen, um hier zu sein',
    vibe: 'fuer-ihn',
    accent: 'red',
    color: 'heather',
    featured: true,
    blurb: 'Das größte Opfer, das ein Mann bringen kann. Bitte entsprechend würdigen.',
    spec: {
      layout: 'stack',
      lines: [
        { t: 'ICH HABE MEINEN', font: 'heavy', size: 130 },
        { t: 'Mittagsschlaf', font: 'retroItalic', size: 240, tone: 'accent' },
        { t: 'unterbrochen,', font: 'marker', size: 130 },
        { t: 'um hier zu sein.', font: 'marker', size: 130 },
      ],
    },
  }),
  d({
    slug: 'nicht-grummelig-akku-leer',
    title: 'Nicht grummelig. Nur Akku leer.',
    vibe: 'fuer-ihn',
    accent: 'gold',
    color: 'forest',
    blurb: 'Bitte nicht persönlich nehmen. Ein Mittagsschlaf und ein Stück Kuchen beheben das Problem.',
    spec: {
      layout: 'stack',
      lines: [
        { t: 'NICHT', font: 'heavy', size: 200 },
        { t: 'GRUMMELIG.', font: 'heavy', size: 200 },
        { t: 'Nur', font: 'marker', size: 130, gap: 8 },
        { t: 'Akku leer.', font: 'retro', size: 250, tone: 'accent' },
      ],
    },
  }),
  d({
    slug: 'opas-plan',
    title: 'Opas Plan: Grillen, Mittagsschlaf, alles besser wissen, wiederholen',
    vibe: 'fuer-ihn',
    accent: 'red',
    color: 'black',
    blurb: 'Bewährt seit Jahrzehnten. Änderungen sind nicht vorgesehen.',
    spec: {
      layout: 'checklist',
      title: [
        { t: 'OPAS', font: 'heavy', size: 170 },
        { t: 'PLAN:', font: 'heavy', size: 170, tone: 'accent' },
      ],
      items: ['Grillen', 'Mittagsschlaf', 'Alles besser wissen', 'Wiederholen'],
    },
  }),
  d({
    slug: 'rentner-unter-neuer-leitung',
    title: 'Rentner. Unter neuer Leitung. Details bei meiner Frau.',
    vibe: 'fuer-ihn',
    accent: 'red',
    color: 'white',
    famous: true,
    blurb: 'Er ist in Rente. Sie hat jetzt einen Mitarbeiter mehr. Das ideale Abschiedsgeschenk mit Augenzwinkern.',
    spec: {
      layout: 'label',
      header: 'Hinweis',
      lines: [
        { t: 'RENTNER.', font: 'retro', size: 260 },
        { t: 'Unter neuer Leitung.', font: 'marker', size: 130 },
        { t: 'Details bei meiner Frau.', font: 'marker', size: 115, tone: 'accent' },
      ],
    },
  }),
  d({
    slug: 'grillmeister-im-ruhestand',
    title: 'Grillmeister im Ruhestand – Dienst nur noch am Wochenende',
    vibe: 'fuer-ihn',
    accent: 'gold',
    color: 'maroon',
    blurb: 'Er hat die Arbeit aufgegeben, nicht den Grill. Die Zange gibt er nicht her.',
    spec: {
      layout: 'badge',
      top: 'Im Ruhestand',
      lines: [
        { t: 'GRILL-', font: 'retro', size: 230 },
        { t: 'MEISTER', font: 'retro', size: 230 },
        { t: 'a. D.', font: 'script', size: 200, tone: 'accent', gap: -10 },
      ],
      bottom: 'Dienst nur am Wochenende',
    },
  }),

  // ── Weihnachten ──────────────────────────────────────────────────────────
  d({
    slug: 'familie-weihnachten',
    title: 'Familie … Weihnachten (mit Familienname und Jahr)',
    vibe: 'weihnachten',
    accent: 'red',
    color: 'forest',
    featured: true,
    blurb: 'Gleiche Shirts für das Familienfoto unterm Baum. Familienname und Jahr eintragen, für alle bestellen – ab 3 Stück sparst du 15 %.',
    fields: [
      { key: 'surname', type: 'text', label: 'Familienname', help: 'So, wie er auf dem Shirt stehen soll.', maxLength: 14, required: true, default: 'Müller' },
      year('2026', { label: 'Jahr', min: 2024, max: 2035 }),
    ],
    spec: {
      layout: 'stack',
      lines: [
        { t: 'Familie', font: 'script', size: 180 },
        { t: '{surname}', font: 'retro', size: 300, upper: true, gap: -12 },
        { t: 'WEIHNACHTEN', font: 'heavy', size: 140, track: 0.08, tone: 'accent', gap: 10 },
        { t: '{year}', font: 'heavy', size: 170, track: 0.12 },
      ],
    },
  }),
  d({
    slug: 'alle-jahre-wieder-plaetzchen',
    title: 'Alle Jahre wieder: zu viele Plätzchen',
    vibe: 'weihnachten',
    accent: 'gold',
    color: 'maroon',
    famous: true,
    blurb: 'Das Weihnachtslied kennt jeder. Die zweite Strophe schreiben wir selbst – mit Butter.',
    spec: {
      layout: 'stack',
      lines: [
        { t: 'Alle Jahre', font: 'script', size: 200 },
        { t: 'wieder:', font: 'script', size: 200, gap: -20 },
        { t: 'ZU VIELE', font: 'heavy', size: 190, tone: 'accent', gap: 10 },
        { t: 'PLÄTZCHEN.', font: 'heavy', size: 190, tone: 'accent' },
      ],
    },
  }),
  d({
    slug: 'o-du-froehliche-gluehweinzeit',
    title: 'O du fröhliche Glühweinzeit',
    vibe: 'weihnachten',
    accent: 'red',
    color: 'forest',
    famous: true,
    blurb: 'Das schönste Weihnachtslied, leicht angepasst an die Realität auf dem Weihnachtsmarkt.',
    spec: {
      layout: 'stack',
      lines: [
        { t: 'O du', font: 'script', size: 190 },
        { t: 'FRÖHLICHE', font: 'retro', size: 250, tone: 'accent', gap: -10 },
        { t: 'Glühweinzeit.', font: 'marker', size: 160 },
      ],
    },
  }),
  d({
    slug: 'plaetzchen-crew',
    title: 'Omas Plätzchen-Crew – mit Namen',
    vibe: 'weihnachten',
    accent: 'red',
    color: 'navy',
    blurb: 'Die offizielle Backstuben-Uniform. Für Oma und alle kleinen Helfer, die den Teig schon vorher naschen.',
    fields: [nickname('Oma')],
    spec: {
      layout: 'stack',
      lines: [
        { t: '{nickname}s', font: 'retro', size: 280, upper: true },
        { t: 'Plätzchen', font: 'script', size: 270, tone: 'accent', gap: -30 },
        { t: 'CREW', font: 'heavy', size: 200, track: 0.12 },
      ],
    },
  }),
  d({
    slug: 'stille-nacht-nicht-bei-uns',
    title: 'Stille Nacht? Nicht bei uns.',
    vibe: 'weihnachten',
    accent: 'gold',
    color: 'black',
    famous: true,
    blurb: 'Für Familien, bei denen Heiligabend vieles ist – nur nicht still.',
    spec: {
      layout: 'stack',
      lines: [
        { t: 'Stille Nacht?', font: 'retroItalic', size: 220 },
        { t: 'NICHT', font: 'heavy', size: 230, tone: 'accent', gap: 10 },
        { t: 'BEI UNS.', font: 'heavy', size: 230, tone: 'accent' },
      ],
    },
  }),
  d({
    slug: 'nur-wegen-der-plaetzchen',
    title: 'Ich bin nur wegen der Plätzchen hier',
    vibe: 'weihnachten',
    accent: 'red',
    color: 'heather',
    blurb: 'Ehrlichkeit ist die beste Weihnachtstradition.',
    spec: {
      layout: 'stack',
      lines: [
        { t: 'Ich bin nur wegen', font: 'marker', size: 130 },
        { t: 'der Plätzchen', font: 'retroItalic', size: 230, tone: 'accent' },
        { t: 'HIER.', font: 'heavy', size: 250 },
      ],
    },
  }),
  d({
    slug: 'gluehwein-zaehlt-als-tee',
    title: 'Glühwein zählt als Tee',
    vibe: 'weihnachten',
    accent: 'gold',
    color: 'maroon',
    blurb: 'Heiß, mit Gewürzen, in einer Tasse. Wir sehen da keinen Unterschied.',
    spec: {
      layout: 'stack',
      lines: [
        { t: 'GLÜHWEIN', font: 'heavy', size: 220 },
        { t: 'zählt als', font: 'marker', size: 140 },
        { t: 'Tee.', font: 'retroItalic', size: 340, tone: 'accent', gap: -10 },
      ],
    },
  }),
];
