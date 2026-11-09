import type { Metadata } from 'next';
import Link from 'next/link';
import { brand, formatPrice, stores } from '@/lib/config';
import { ROUTES } from '@/lib/locale';

export const metadata: Metadata = { title: 'Häufige Fragen', description: 'Größen, Personalisierung, Versand, Mengenrabatt, Widerruf und mehr.' };

const s = stores.de;
const pct = (n: number) => s.bundles.find((b) => b.minItems === n)?.percent;

const QA: { q: string; a: React.ReactNode }[] = [
  {
    q: 'Wie fallen die Größen aus?',
    a: 'Unsere T-Shirts sind Unisex-Shirts von Bella+Canvas (Modell 3001) mit lockerem Schnitt. Die meisten Frauen bestellen ihre normale Größe, für einen engeren Sitz eine Nummer kleiner. Auf jeder Produktseite findest du eine Größentabelle mit Brustbreite und Länge in Zentimetern.',
  },
  {
    q: 'Woraus sind die Shirts?',
    a: 'Die T-Shirts sind aus weicher, leichter, ringgesponnener Baumwolle (die melierten Farben aus Baumwolle mit Polyester). Die Hoodies sind aus kuscheligem Fleece mit 50 % Baumwolle und 50 % Polyester.',
  },
  {
    q: 'Sieht das Shirt genauso aus wie in der Vorschau?',
    a: 'Ja. Die Vorschau entsteht aus genau der Datei, die wir an die Druckerei schicken – Text, Anordnung und Farben stimmen überein. Je nach Bildschirm und Stoff können Farben in echt minimal anders wirken.',
  },
  {
    q: 'Wie funktioniert das Personalisieren?',
    a: 'Bei Shirts mit dem Hinweis „Mit Namen“ tippst du Name, Jahreszahl oder Alter einfach in die Felder. Die Vorschau ändert sich sofort, und wir drucken genau das, was du siehst – bitte prüf die Schreibweise. Umlaute wie ä, ö, ü und ß sind kein Problem.',
  },
  {
    q: 'Wie funktioniert der Mengenrabatt?',
    a: `Ab 2 Artikeln sparst du ${pct(2)} %, ab 3 Artikeln ${pct(3)} % auf deine ganze Bestellung. T-Shirts und Hoodies lassen sich beliebig kombinieren, auch verschiedene Motive und Größen. Der Rabatt wird im Warenkorb automatisch abgezogen – ohne Gutscheincode.`,
  },
  {
    q: 'Wie lange dauert die Lieferung?',
    a: `Jedes Shirt wird nach deiner Bestellung einzeln für dich gedruckt. Insgesamt dauert es ${s.deliveryMinDays}–${s.deliveryMaxDays} Werktage, bis es bei dir ist. Gedruckt wird in der EU, deshalb fallen keine Zölle an. Sobald das Paket unterwegs ist, bekommst du die Sendungsverfolgung per E-Mail.`,
  },
  {
    q: 'Was kostet der Versand?',
    a: `${formatPrice(s.shippingCents, 'de')} pro Bestellung, ab ${formatPrice(s.freeShippingFromCents, 'de')} ist der Versand kostenlos. Wir liefern innerhalb Deutschlands.`,
  },
  {
    q: 'Kommt es rechtzeitig zu Weihnachten?',
    a: (
      <>
        Wenn du bis zum {new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long' }).format(new Date(`${s.holiday.orderBy}T12:00:00`))} bestellst, ist es normalerweise rechtzeitig vor Heiligabend da. Details unter{' '}
        <Link href={ROUTES.de.shipping}>Versand &amp; Zahlung</Link>.
      </>
    ),
  },
  {
    q: 'Wie kann ich bezahlen?',
    a: 'Sicher über unseren Zahlungsdienstleister Stripe – zum Beispiel mit Kreditkarte, Apple Pay oder Google Pay. Welche Zahlungsarten dir angeboten werden, siehst du auf der Bezahlseite.',
  },
  {
    q: 'Was ist, wenn etwas falsch gedruckt oder beschädigt ankommt?',
    a: (
      <>
        Schreib uns innerhalb von 30 Tagen ein Foto an <a href={`mailto:${brand.email}`}>{brand.email}</a>. Du bekommst kostenlos Ersatz oder dein Geld zurück – ohne Rücksendung.
      </>
    ),
  },
  {
    q: 'Kann ich meine Bestellung widerrufen?',
    a: (
      <>
        Shirts ohne Personalisierung kannst du innerhalb von 14 Tagen nach Erhalt widerrufen – am einfachsten über die Schaltfläche „Vertrag widerrufen“ unten auf jeder Seite. Personalisierte Shirts (mit Namen, Jahreszahl oder Alter) werden nur für dich gedruckt und sind deshalb vom Widerruf ausgeschlossen. Alles Weitere steht in
        der <Link href={ROUTES.de.returns}>Widerrufsbelehrung</Link>.
      </>
    ),
  },
  {
    q: 'Gibt es die Shirts auch auf Englisch?',
    a: (
      <>
        Ja – im <Link href={ROUTES.en.home} hrefLang="en-US">US-Shop</Link> gibt es eigene englische Motive. Der US-Shop liefert allerdings nur in die USA.
      </>
    ),
  },
];

export default function Faq() {
  return (
    <div className="wrap pt-10 sm:pt-14">
      <h1 className="text-[2.6rem] sm:text-[3.2rem]">Fragen &amp; Antworten</h1>
      <div className="prose-s mt-8">
        {QA.map((x) => (
          <section key={x.q}>
            <h3>{x.q}</h3>
            <p>{x.a}</p>
          </section>
        ))}
        <h2>Noch Fragen?</h2>
        <p>
          Schreib uns an <a href={`mailto:${brand.email}`}>{brand.email}</a>. Es antwortet ein echter Mensch, meist innerhalb eines Werktags.
        </p>
      </div>
    </div>
  );
}
