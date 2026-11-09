// Rechtstexte für den deutschen Shop (/de/). Stand: November 2026 – siehe docs/germany.md.
// Ausgangspunkt, keine Rechtsberatung: Vor dem Start bitte von einem Rechtstexte-Service
// (z. B. IT-Recht Kanzlei, Händlerbund) prüfen lassen. [Eckige Klammern] = deine Daten
// in lib/config.ts (legalDe) eintragen.
import { brand, formatPrice, legalDe as L, siteUrl, stores } from './config';
import { ROUTES } from './locale';

const s = stores.de;
const todo = (x: string) => (/^\[.*\]$/.test(x.trim()) ? `<span class="todo">${x}</span>` : x);
const esc = (x: string) => x.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const seller = `${todo(L.name)} („${esc(L.tradingAs)}“), ${todo(L.street)}, ${todo(L.city)}, ${todo(L.country)}, E-Mail: ${esc(L.email)}`;
const eur = (c: number) => formatPrice(c, 'de');
const link = (path: string, text: string) => `<a href="${path}">${text}</a>`;

export const impressumHtml = `
<h2>Angaben gemäß § 5 DDG</h2>
<p>${todo(L.name)}<br>${esc(L.tradingAs)}<br>${todo(L.street)}<br>${todo(L.city)}<br>${todo(L.country)}</p>
<h2>Kontakt</h2>
<p>E-Mail: <a href="mailto:${esc(L.email)}">${esc(L.email)}</a>${L.phone ? `<br>Telefon: ${esc(L.phone)}` : ''}</p>
${L.vatId ? `<h2>Umsatzsteuer</h2><p>Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz: ${esc(L.vatId)}</p>` : ''}
<h2>Verbraucherstreitbeilegung</h2>
<p>Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
<h2>Verantwortliche Person in der EU (Produktsicherheit)</h2>
<p>${esc(L.euResponsible.name)}, ${esc(L.euResponsible.address)}, ${esc(L.euResponsible.email)}</p>
<p class="muted">Stand: ${esc(L.lastUpdated)}</p>`;

/** Widerrufsbelehrung nach dem gesetzlichen Muster (Anlage 1 zu Art. 246a EGBGB), inkl. Widerrufsfunktion (§ 356a BGB). */
export const widerrufsbelehrungHtml = `
<h2>Widerrufsrecht</h2>
<p>Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.</p>
<p>Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die letzte Ware in Besitz genommen haben bzw. hat.</p>
<p>Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (${seller}) mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.</p>
<p>Sie können Ihren Widerruf auch über die Widerrufsfunktion auf unserer Website erklären: Schaltfläche „Vertrag widerrufen“ unten auf jeder Seite oder direkt unter ${link(ROUTES.de.withdraw, `${siteUrl}${ROUTES.de.withdraw}`)}. Machen Sie davon Gebrauch, so werden wir Ihnen unverzüglich (z. B. per E-Mail) eine Bestätigung über den Eingang eines solchen Widerrufs übermitteln.</p>
<p>Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.</p>
<h2>Folgen des Widerrufs</h2>
<p>Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.</p>
<p>Wir können die Rückzahlung verweigern, bis wir die Waren wieder zurückerhalten haben oder bis Sie den Nachweis erbracht haben, dass Sie die Waren zurückgesandt haben, je nachdem, welches der frühere Zeitpunkt ist.</p>
<p>Sie haben die Waren unverzüglich und in jedem Fall spätestens binnen vierzehn Tagen ab dem Tag, an dem Sie uns über den Widerruf dieses Vertrags unterrichten, an ${todo(L.returnAddress)} zurückzusenden oder zu übergeben. Die Frist ist gewahrt, wenn Sie die Waren vor Ablauf der Frist von vierzehn Tagen absenden.</p>
<p>Sie tragen die unmittelbaren Kosten der Rücksendung der Waren.</p>
<p>Sie müssen für einen etwaigen Wertverlust der Waren nur aufkommen, wenn dieser Wertverlust auf einen zur Prüfung der Beschaffenheit, Eigenschaften und Funktionsweise der Waren nicht notwendigen Umgang mit ihnen zurückzuführen ist.</p>
<h2>Ausschluss des Widerrufsrechts</h2>
<p>Das Widerrufsrecht besteht nicht bei Verträgen zur Lieferung von Waren, die nicht vorgefertigt sind und für deren Herstellung eine individuelle Auswahl oder Bestimmung durch den Verbraucher maßgeblich ist oder die eindeutig auf die persönlichen Bedürfnisse des Verbrauchers zugeschnitten sind (§ 312g Abs. 2 Nr. 1 BGB). Das betrifft alle Shirts und Hoodies, die nach Ihren Angaben mit Namen, Jahreszahlen, Altersangaben oder anderen von Ihnen eingegebenen Texten bedruckt werden.</p>
<h2>Muster-Widerrufsformular</h2>
<p>(Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück.)</p>
<p>– An ${seller}<br>
– Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*)<br>
– Bestellt am (*)/erhalten am (*)<br>
– Name des/der Verbraucher(s)<br>
– Anschrift des/der Verbraucher(s)<br>
– Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)<br>
– Datum</p>
<p>(*) Unzutreffendes streichen.</p>`;

export const agbHtml = `
<h2>1. Geltungsbereich und Vertragspartner</h2>
<p>Diese Allgemeinen Geschäftsbedingungen gelten für alle Bestellungen, die du als Verbraucherin oder Verbraucher im Online-Shop ${esc(brand.name)} unter ${siteUrl}${ROUTES.de.home} aufgibst. Dein Vertragspartner ist ${seller}.</p>
<h2>2. Vertragsschluss</h2>
<p>Die Darstellung der Produkte im Shop ist kein rechtlich bindendes Angebot, sondern eine Einladung zur Bestellung. Du legst Artikel in den Warenkorb und gehst „Weiter zur Kasse“. Dort gibst du deine Lieferadresse und E-Mail-Adresse ein und siehst eine Übersicht deiner Bestellung mit allen Preisen. Bis zum Absenden kannst du alle Angaben ändern oder über den Warenkorb korrigieren.</p>
<p>Mit Klick auf die Schaltfläche „Zahlungspflichtig bestellen“ gibst du ein verbindliches Angebot zum Kauf der Waren im Warenkorb ab. Danach wirst du zu unserem Zahlungsdienstleister Stripe weitergeleitet, um zu bezahlen. Der Vertrag kommt zustande, wenn wir dein Angebot per E-Mail annehmen (Bestellbestätigung). Diese senden wir, sobald die Zahlung eingegangen ist. Schließt du die Zahlung nicht ab, kommt kein Vertrag zustande.</p>
<h2>3. Vertragssprache und Vertragstext</h2>
<p>Vertragssprache ist Deutsch. Wir speichern den Vertragstext. Die Bestelldaten, diese AGB und die Widerrufsbelehrung erhältst du mit der Bestellbestätigung per E-Mail. Die aktuellen AGB findest du jederzeit auf dieser Seite.</p>
<h2>4. Personalisierte Artikel</h2>
<p>Wir drucken Namen, Jahreszahlen und Texte genau so, wie du sie eingibst und wie sie in der Vorschau angezeigt werden. Bitte prüfe die Schreibweise vor der Bestellung. Inhalte, die gegen Gesetze oder Rechte Dritter verstoßen, drucken wir nicht; solche Bestellungen lehnen wir ab und erstatten bereits gezahlte Beträge.</p>
<h2>5. Preise und Versandkosten</h2>
<p>Alle Preise sind Endpreise und enthalten die gesetzliche Mehrwertsteuer. Hinzu kommen Versandkosten von ${eur(s.shippingCents)} pro Bestellung; ab einem Warenwert von ${eur(s.freeShippingFromCents)} (nach Rabatt) liefern wir versandkostenfrei. Mengenrabatte (${s.bundles
  .slice()
  .sort((a, b) => a.minItems - b.minItems)
  .map((b) => `${b.percent} % ab ${b.minItems} Artikeln`)
  .join(', ')}) werden im Warenkorb automatisch abgezogen.</p>
<h2>6. Lieferung</h2>
<p>Wir liefern nur innerhalb Deutschlands. Jeder Artikel wird nach deiner Bestellung einzeln gedruckt. Die Lieferzeit beträgt ${s.deliveryMinDays}–${s.deliveryMaxDays} Werktage ab Vertragsschluss.</p>
<h2>7. Zahlung</h2>
<p>Die Zahlung erfolgt über den Zahlungsdienstleister Stripe Payments Europe Ltd. (Irland). Die verfügbaren Zahlungsarten werden dir auf der Bezahlseite angezeigt. Der Kaufpreis ist mit Vertragsschluss fällig.</p>
<h2>8. Eigentumsvorbehalt</h2>
<p>Die Ware bleibt bis zur vollständigen Bezahlung unser Eigentum.</p>
<h2>9. Widerrufsrecht</h2>
<p>Als Verbraucherin oder Verbraucher hast du ein gesetzliches Widerrufsrecht. Für personalisierte Artikel besteht kein Widerrufsrecht (§ 312g Abs. 2 Nr. 1 BGB). Einzelheiten findest du in der ${link(ROUTES.de.returns, 'Widerrufsbelehrung')}. Den Widerruf kannst du jederzeit über die Schaltfläche „Vertrag widerrufen“ erklären.</p>
<h2>10. Gewährleistung und Fehldrucke</h2>
<p>Es gilt das gesetzliche Mängelhaftungsrecht. Zusätzlich gilt unser Versprechen: Kommt ein Artikel beschädigt, falsch bedruckt oder falsch an, schreib uns innerhalb von 30 Tagen mit einem Foto – du bekommst kostenlos Ersatz oder dein Geld zurück. Deine gesetzlichen Rechte bleiben davon unberührt.</p>
<h2>11. Streitbeilegung</h2>
<p>Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
<h2>12. Schlussbestimmungen</h2>
<p>Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Zwingende Verbraucherschutzvorschriften des Staates, in dem du deinen gewöhnlichen Aufenthalt hast, bleiben unberührt.</p>
<p class="muted">Stand: ${esc(L.lastUpdated)}</p>`;

export const versandHtml = `
<h2>Lieferland</h2>
<p>Wir liefern innerhalb Deutschlands. Gedruckt wird in den EU-Produktionsstätten unseres Druckpartners – es fallen also keine Zölle oder Einfuhrgebühren an.</p>
<h2>Versandkosten</h2>
<p>Standardversand: ${eur(s.shippingCents)} pro Bestellung. Ab einem Warenwert von ${eur(s.freeShippingFromCents)} (nach Mengenrabatt) liefern wir kostenlos. Alle Preise inkl. MwSt.</p>
<h2>Lieferzeit</h2>
<p>Jedes Shirt wird nach deiner Bestellung einzeln für dich gedruckt (meist 2–5 Werktage) und dann verschickt. Die Lieferzeit beträgt insgesamt ${s.deliveryMinDays}–${s.deliveryMaxDays} Werktage. Sobald dein Paket unterwegs ist, bekommst du eine E-Mail mit der Sendungsverfolgung.</p>
<h2>Weihnachten</h2>
<p>Damit deine Bestellung rechtzeitig zu Heiligabend ankommt, bestell bitte bis zum ${new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long' }).format(new Date(`${s.holiday.orderBy}T12:00:00`))}.</p>
<h2>Zahlung</h2>
<p>Die Zahlung läuft sicher über unseren Zahlungsdienstleister Stripe. Welche Zahlungsarten dir angeboten werden (z. B. Kreditkarte, Apple Pay, Google Pay und – sofern freigeschaltet – weitere Zahlungsarten wie Klarna oder SEPA-Lastschrift), siehst du auf der Bezahlseite.</p>
<h2>Fehldruck oder Beschädigung</h2>
<p>Ist ein Shirt falsch gedruckt, beschädigt oder falsch geliefert, schreib uns innerhalb von 30 Tagen ein Foto an <a href="mailto:${esc(L.email)}">${esc(L.email)}</a>. Du bekommst kostenlos Ersatz oder dein Geld zurück – ohne Rücksendung. Deine gesetzlichen Gewährleistungsrechte bleiben unberührt.</p>
<h2>Widerruf</h2>
<p>Shirts ohne Personalisierung kannst du innerhalb von 14 Tagen widerrufen – ganz einfach über „Vertrag widerrufen“ unten auf jeder Seite. Details in der ${link(ROUTES.de.returns, 'Widerrufsbelehrung')}.</p>`;

export const datenschutzHtml = `
<h2>1. Verantwortlicher</h2>
<p>${seller}</p>
<h2>2. Hosting und Server-Logfiles</h2>
<p>Unsere Website wird bei Vercel Inc. (USA) gehostet. Beim Aufruf verarbeitet Vercel technisch notwendige Daten wie IP-Adresse, Datum und Uhrzeit, aufgerufene Seite und Browsertyp, um die Seite auszuliefern und vor Angriffen zu schützen (Art. 6 Abs. 1 lit. f DSGVO). Dabei können Daten in die USA übermittelt werden; die Übermittlung stützt sich auf das EU-US Data Privacy Framework bzw. EU-Standardvertragsklauseln.</p>
<p>Um dir einen Hinweis auf den passenden Shop (USA oder Deutschland) zu zeigen, ermittelt Vercel aus deiner IP-Adresse dein Land. Das Land wird nicht gespeichert.</p>
<h2>3. Warenkorb und Einstellungen</h2>
<p>Dein Warenkorb und deine Cookie-Auswahl werden nur in deinem Browser gespeichert (Local Storage). Das ist für die Funktion des Shops erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG).</p>
<h2>4. Bestellung, Zahlung und Versand</h2>
<p>Für die Abwicklung deiner Bestellung verarbeiten wir Name, Lieferadresse, E-Mail-Adresse, Bestelldaten und deine Personalisierungstexte (Art. 6 Abs. 1 lit. b DSGVO). Die Zahlung wickelt Stripe Payments Europe Ltd. (1 Grand Canal Street Lower, Dublin, Irland) ab; Stripe verarbeitet deine Zahlungsdaten als eigener Verantwortlicher und kann Daten an Stripe, Inc. (USA) übermitteln. Druck und Versand übernimmt unser Dienstleister Printful (Printful Inc., USA, mit Produktionsstätten in der EU); dafür geben wir Lieferadresse, E-Mail-Adresse und die Druckdaten weiter. Mit unseren Dienstleistern bestehen Verträge zur Auftragsverarbeitung bzw. EU-Standardvertragsklauseln.</p>
<h2>5. E-Mails</h2>
<p>Bestell-, Versand- und Widerrufsbestätigungen versenden wir über Resend (Resend, Inc., USA) auf Grundlage von EU-Standardvertragsklauseln.</p>
<h2>6. Widerrufsfunktion</h2>
<p>Wenn du über „Vertrag widerrufen“ einen Widerruf erklärst, verarbeiten wir Name, E-Mail-Adresse, Bestellnummer und deine Angaben, um den Widerruf zu bearbeiten und dir den Eingang zu bestätigen (Art. 6 Abs. 1 lit. c DSGVO).</p>
<h2>7. Meta-Pixel (nur mit Einwilligung)</h2>
<p>Nur wenn du im Cookie-Hinweis zustimmst, setzen wir das Meta-Pixel der Meta Platforms Ireland Ltd. ein und übermitteln Kaufereignisse zusätzlich serverseitig (Conversions API), um die Wirkung unserer Werbung auf Facebook und Instagram zu messen (Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TDDDG). Dabei können Daten in die USA übermittelt werden. Du kannst deine Einwilligung jederzeit unter ${link(ROUTES.de.privacyChoices, 'Cookie-Einstellungen')} widerrufen.</p>
<h2>8. Speicherdauer</h2>
<p>Bestell- und Rechnungsdaten bewahren wir so lange auf, wie es handels- und steuerrechtliche Pflichten verlangen (bis zu 10 Jahre). Alle anderen Daten löschen wir, sobald sie nicht mehr gebraucht werden.</p>
<h2>9. Deine Rechte</h2>
<p>Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch sowie das Recht, eine Einwilligung jederzeit zu widerrufen. Außerdem kannst du dich bei einer Datenschutz-Aufsichtsbehörde beschweren. Schreib uns einfach an <a href="mailto:${esc(L.email)}">${esc(L.email)}</a>.</p>
<p class="muted">Stand: ${esc(L.lastUpdated)}</p>`;
