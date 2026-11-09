// German legal page templates. These are starting points, NOT legal advice:
// have a German e-commerce lawyer or a legal-text service (e.g. IT-Recht Kanzlei,
// Händlerbund, Trusted Shops) review and replace them before launch.
// Everything in [square brackets] still needs your real data (see lib/config.ts).
import { brand, legal, shop, siteUrl } from './config';
import type { Locale } from './i18n';

const t = (s: string) => (s.startsWith('[') ? `<span class="todo">${s}</span>` : s);
const seller = `${t(legal.companyName)}, ${t(legal.street)}, ${t(legal.city)}, ${t(legal.country)}, E-Mail: ${legal.email}`;
const RETURN_ADDRESS = '[Rücksendeadresse in der EU]';

const withdrawalDe = `
<h2>Widerrufsbelehrung</h2>
<h3>Widerrufsrecht</h3>
<p>Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.</p>
<p>Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die letzte Ware in Besitz genommen haben bzw. hat.</p>
<p>Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (${seller}) mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder eine E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das untenstehende Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist. Sie können Ihren Widerruf auch über die Schaltfläche „Vertrag hier widerrufen“ auf unserer Website erklären (${siteUrl}/widerruf/). In diesem Fall übermitteln wir Ihnen unverzüglich eine Bestätigung über den Eingang des Widerrufs.</p>
<p>Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.</p>
<h3>Folgen des Widerrufs</h3>
<p>Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.</p>
<p>Wir können die Rückzahlung verweigern, bis wir die Waren wieder zurückerhalten haben oder bis Sie den Nachweis erbracht haben, dass Sie die Waren zurückgesandt haben, je nachdem, welches der frühere Zeitpunkt ist.</p>
<p>Sie haben die Waren unverzüglich und in jedem Fall spätestens binnen vierzehn Tagen ab dem Tag, an dem Sie uns über den Widerruf dieses Vertrags unterrichten, an ${t(RETURN_ADDRESS)} zurückzusenden oder zu übergeben. Die Frist ist gewahrt, wenn Sie die Waren vor Ablauf der Frist von vierzehn Tagen absenden. Sie tragen die unmittelbaren Kosten der Rücksendung der Waren.</p>
<p>Sie müssen für einen etwaigen Wertverlust der Waren nur aufkommen, wenn dieser Wertverlust auf einen zur Prüfung der Beschaffenheit, Eigenschaften und Funktionsweise der Waren nicht notwendigen Umgang mit ihnen zurückzuführen ist.</p>
<h3>Ausschluss des Widerrufsrechts</h3>
<p>Das Widerrufsrecht besteht nicht bei Verträgen zur Lieferung von Waren, die nicht vorgefertigt sind und für deren Herstellung eine individuelle Auswahl oder Bestimmung durch den Verbraucher maßgeblich ist oder die eindeutig auf die persönlichen Bedürfnisse des Verbrauchers zugeschnitten sind (§ 312g Abs. 2 Nr. 1 BGB). Das betrifft alle Shirts und Hoodies, die nach Ihren Angaben mit Namen, Jahreszahlen oder anderen Texten bedruckt werden.</p>
<h3>Muster-Widerrufsformular</h3>
<p>(Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück.)</p>
<p>– An ${seller}<br>
– Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*)<br>
– Bestellt am (*)/erhalten am (*)<br>
– Name des/der Verbraucher(s)<br>
– Anschrift des/der Verbraucher(s)<br>
– Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)<br>
– Datum<br>
(*) Unzutreffendes streichen.</p>`;

const impressumDe = `
<h2>Angaben gemäß § 5 DDG</h2>
<p>${t(legal.companyName)}<br>${t(legal.street)}<br>${t(legal.city)}<br>${t(legal.country)}</p>
<p>Vertreten durch: ${t(legal.representative)}</p>
<h3>Kontakt</h3>
<p>E-Mail: ${legal.email}<br>Telefon: ${t(legal.phone)}</p>
<h3>Umsatzsteuer</h3>
<p>Umsatzsteuer-Identifikationsnummer: ${t(legal.vatId)}</p>
<h3>Verbraucherstreitbeilegung</h3>
<p>Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>`;

const versandDe = `
<h2>Lieferländer</h2>
<p>Wir liefern in alle Länder der Europäischen Union. Da wir in der EU drucken, fallen keine Zollgebühren an.</p>
<h2>Versandkosten</h2>
<p>Standardversand: ${(shop.shippingCents / 100).toFixed(2).replace('.', ',')} € pro Bestellung. Ab einem Bestellwert von ${(shop.freeShippingFromCents / 100).toFixed(2).replace('.', ',')} € liefern wir kostenlos. Alle Preise inkl. MwSt.</p>
<h2>Lieferzeit</h2>
<p>Jedes Shirt wird nach deiner Bestellung einzeln gedruckt. Die Lieferzeit beträgt ${shop.deliveryText.de} ab Zahlungseingang. Sobald dein Paket unterwegs ist, bekommst du eine E-Mail mit der Sendungsverfolgung.</p>
<h2>Zahlung</h2>
<p>Die Zahlung läuft sicher über unseren Zahlungsdienstleister Stripe. Welche Zahlungsarten dir angeboten werden (z. B. Kreditkarte, Apple Pay, Google Pay, PayPal, Klarna, SEPA-Lastschrift), siehst du auf der Bezahlseite.</p>
<h2>Fehldruck oder Beschädigung</h2>
<p>Ist ein Shirt falsch gedruckt, beschädigt oder fehlerhaft, schreib uns innerhalb von 30 Tagen ein Foto an ${legal.email}. Du bekommst kostenlos Ersatz oder dein Geld zurück. Deine gesetzlichen Gewährleistungsrechte bleiben unberührt.</p>`;

const agbDe = `
<h2>1. Geltungsbereich</h2>
<p>Diese AGB gelten für alle Bestellungen, die Verbraucher über ${siteUrl} bei ${t(legal.companyName)} (nachfolgend „wir“) aufgeben.</p>
<h2>2. Vertragsschluss</h2>
<p>Die Darstellung der Produkte im Shop ist kein rechtlich bindendes Angebot. Mit Klick auf die Bezahl-Schaltfläche auf der Bezahlseite gibst du ein verbindliches Angebot ab. Der Vertrag kommt zustande, wenn wir die Bestellung per E-Mail bestätigen. Vertragssprache ist die Sprache, in der du bestellst (Deutsch oder Englisch). Den Vertragstext speichern wir; die Bestelldaten und diese AGB erhältst du mit der Bestellbestätigung per E-Mail.</p>
<h2>3. Personalisierung</h2>
<p>Wir drucken Namen und Texte genau so, wie du sie eingibst und wie sie in der Vorschau angezeigt werden. Bitte prüfe die Schreibweise vor der Bestellung. Wir drucken keine Inhalte, die Rechte Dritter verletzen oder rechtswidrig sind, und können solche Bestellungen ablehnen; bereits gezahlte Beträge erstatten wir dann.</p>
<h2>4. Preise und Versand</h2>
<p>Alle Preise sind Endpreise inkl. gesetzlicher Mehrwertsteuer, zzgl. der auf der Seite „Versand &amp; Zahlung“ genannten Versandkosten.</p>
<h2>5. Zahlung</h2>
<p>Die Zahlung erfolgt über den Zahlungsdienstleister Stripe mit den dort angebotenen Zahlungsarten. Der Druck beginnt nach Zahlungseingang.</p>
<h2>6. Lieferung</h2>
<p>Wir liefern innerhalb der EU. Die Lieferzeit beträgt ${shop.deliveryText.de} ab Zahlungseingang.</p>
<h2>7. Eigentumsvorbehalt</h2>
<p>Die Ware bleibt bis zur vollständigen Bezahlung unser Eigentum.</p>
<h2>8. Widerrufsrecht</h2>
<p>Für personalisierte Artikel besteht kein Widerrufsrecht (§ 312g Abs. 2 Nr. 1 BGB). Einzelheiten stehen in der <a class="link" href="/widerrufsbelehrung/">Widerrufsbelehrung</a>.</p>
<h2>9. Gewährleistung</h2>
<p>Es gilt das gesetzliche Mängelhaftungsrecht.</p>
<h2>10. Schlussbestimmungen</h2>
<p>Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Bei Verbrauchern gilt diese Rechtswahl nur, soweit dadurch nicht der Schutz durch zwingende Bestimmungen des Rechts des Staates ihres gewöhnlichen Aufenthalts entzogen wird. ${t('[Rechtswahl mit Anwalt abstimmen – abhängig vom Sitz deines Unternehmens]')}</p>`;

const datenschutzDe = `
<h2>1. Verantwortlicher</h2>
<p>${seller}</p>
<h2>2. Hosting</h2>
<p>Die Website wird bei ${t('[Hosting-Anbieter, z. B. Vercel Inc.]')} gehostet. Beim Aufruf werden technisch notwendige Daten (z. B. IP-Adresse, Zeitpunkt, aufgerufene Seite) verarbeitet, um die Seite auszuliefern und abzusichern (Art. 6 Abs. 1 lit. f DSGVO).</p>
<h2>3. Warenkorb und Einstellungen</h2>
<p>Dein Warenkorb, deine Sprachwahl und deine Cookie-Auswahl werden nur in deinem Browser (Local Storage) gespeichert. Das ist für die Funktion des Shops erforderlich (§ 25 Abs. 2 TDDDG).</p>
<h2>4. Bestellung und Zahlung</h2>
<p>Für die Abwicklung deiner Bestellung verarbeiten wir Name, Anschrift, E-Mail-Adresse, ggf. Telefonnummer, Bestelldaten und deine Personalisierungstexte (Art. 6 Abs. 1 lit. b DSGVO). Die Zahlung wickelt Stripe Payments Europe Ltd. (Irland) ab. Den Druck und Versand übernimmt unser Fulfillment-Partner Printful; dafür geben wir Lieferadresse, E-Mail-Adresse und die Druckdaten weiter. ${t('[Angaben zu Printful (Gesellschaft, Sitz, Datenübermittlung in Drittländer) und Auftragsverarbeitungsverträgen ergänzen]')}</p>
<h2>5. E-Mails</h2>
<p>Bestell-, Versand- und Widerrufsbestätigungen versenden wir über ${t('[E-Mail-Dienst, z. B. Resend]')}.</p>
<h2>6. Meta-Pixel (nur mit Einwilligung)</h2>
<p>Wenn du unter „Cookie-Einstellungen“ zustimmst, setzen wir das Meta-Pixel der Meta Platforms Ireland Ltd. ein und übermitteln Kaufereignisse zusätzlich serverseitig (Conversions API), um die Wirkung unserer Werbung auf Facebook und Instagram zu messen (Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TDDDG). Daten können dabei in die USA übermittelt werden. Du kannst deine Einwilligung jederzeit unter „Cookie-Einstellungen“ widerrufen.</p>
<h2>7. Speicherdauer</h2>
<p>Bestelldaten speichern wir, solange gesetzliche Aufbewahrungsfristen (bis zu 10 Jahre) bestehen.</p>
<h2>8. Deine Rechte</h2>
<p>Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch sowie das Recht, eine erteilte Einwilligung zu widerrufen. Außerdem kannst du dich bei einer Datenschutz-Aufsichtsbehörde beschweren. Schreib uns einfach an ${legal.email}.</p>
<p>Stand: ${t('[Datum]')} · ${brand.name}</p>`;

// ── English versions ──────────────────────────────────────────────────────────

const withdrawalEn = `
<h2>Right of withdrawal</h2>
<h3>Right of withdrawal</h3>
<p>You have the right to withdraw from this contract within 14 days without giving any reason.</p>
<p>The withdrawal period will expire after 14 days from the day on which you acquire, or a third party other than the carrier and indicated by you acquires, physical possession of the last good.</p>
<p>To exercise the right of withdrawal, you must inform us (${seller}) of your decision to withdraw from this contract by an unequivocal statement (e.g. a letter sent by post or an email). You may use the model withdrawal form below, but it is not obligatory. You can also withdraw using the “Withdraw from contract here” button on our website (${siteUrl}/widerruf/). If you use this option, we will send you an acknowledgement of receipt of your withdrawal without delay.</p>
<p>To meet the withdrawal deadline, it is sufficient for you to send your communication concerning your exercise of the right of withdrawal before the withdrawal period has expired.</p>
<h3>Effects of withdrawal</h3>
<p>If you withdraw from this contract, we shall reimburse to you all payments received from you, including the costs of delivery (with the exception of the supplementary costs resulting from your choice of a type of delivery other than the least expensive type of standard delivery offered by us), without undue delay and in any event not later than 14 days from the day on which we are informed about your decision to withdraw from this contract. We will carry out such reimbursement using the same means of payment as you used for the initial transaction, unless you have expressly agreed otherwise; in any event, you will not incur any fees as a result of such reimbursement.</p>
<p>We may withhold reimbursement until we have received the goods back or you have supplied evidence of having sent back the goods, whichever is the earliest.</p>
<p>You shall send back the goods or hand them over to us at ${t(RETURN_ADDRESS)} without undue delay and in any event not later than 14 days from the day on which you communicate your withdrawal from this contract to us. The deadline is met if you send back the goods before the period of 14 days has expired. You will have to bear the direct cost of returning the goods.</p>
<p>You are only liable for any diminished value of the goods resulting from the handling other than what is necessary to establish the nature, characteristics and functioning of the goods.</p>
<h3>Exclusion of the right of withdrawal</h3>
<p>The right of withdrawal does not apply to contracts for the supply of goods made to the consumer’s specifications or clearly personalised (Art. 16(c) Directive 2011/83/EU, § 312g para. 2 no. 1 BGB). This covers all shirts and hoodies printed with names, years or other text you entered.</p>
<h3>Model withdrawal form</h3>
<p>(Complete and return this form only if you wish to withdraw from the contract.)</p>
<p>– To ${seller}<br>
– I/We (*) hereby give notice that I/We (*) withdraw from my/our (*) contract of sale of the following goods (*)<br>
– Ordered on (*)/received on (*)<br>
– Name of consumer(s)<br>
– Address of consumer(s)<br>
– Signature of consumer(s) (only if this form is notified on paper)<br>
– Date<br>
(*) Delete as appropriate.</p>`;

const impressumEn = `
<h2>Information pursuant to § 5 DDG (German Digital Services Act)</h2>
<p>${t(legal.companyName)}<br>${t(legal.street)}<br>${t(legal.city)}<br>${t(legal.country)}</p>
<p>Represented by: ${t(legal.representative)}</p>
<h3>Contact</h3>
<p>Email: ${legal.email}<br>Phone: ${t(legal.phone)}</p>
<h3>VAT</h3>
<p>VAT identification number: ${t(legal.vatId)}</p>
<h3>Consumer dispute resolution</h3>
<p>We are neither willing nor obliged to take part in dispute resolution proceedings before a consumer arbitration board.</p>`;

const versandEn = `
<h2>Delivery countries</h2>
<p>We deliver to every country in the European Union. Because we print in the EU, there are no customs fees.</p>
<h2>Shipping costs</h2>
<p>Standard shipping: €${(shop.shippingCents / 100).toFixed(2)} per order. Orders from €${(shop.freeShippingFromCents / 100).toFixed(2)} ship free. All prices include VAT.</p>
<h2>Delivery time</h2>
<p>Every shirt is printed individually after you order. Delivery takes ${shop.deliveryText.en} from receipt of payment. Once your parcel is on its way, you’ll get an email with tracking.</p>
<h2>Payment</h2>
<p>Payment is handled securely by our payment provider Stripe. The payment methods available to you (e.g. card, Apple Pay, Google Pay, PayPal, Klarna, SEPA Direct Debit) are shown on the payment page.</p>
<h2>Misprints or damage</h2>
<p>If a shirt is misprinted, damaged or faulty, email a photo to ${legal.email} within 30 days. You’ll get a free replacement or your money back. Your statutory warranty rights are not affected.</p>`;

const agbEn = `
<h2>1. Scope</h2>
<p>These terms apply to all orders placed by consumers via ${siteUrl} with ${t(legal.companyName)} (“we”).</p>
<h2>2. Conclusion of contract</h2>
<p>The products shown in the shop are not a legally binding offer. By clicking the payment button on the payment page you place a binding offer. The contract is concluded when we confirm the order by email. The contract language is the language you order in (German or English). We store the contract text; you receive the order details and these terms with your order confirmation email.</p>
<h2>3. Personalisation</h2>
<p>We print names and text exactly as you enter them and as shown in the preview. Please check the spelling before ordering. We do not print content that infringes the rights of others or is unlawful, and may refuse such orders; any amount already paid will then be refunded.</p>
<h2>4. Prices and shipping</h2>
<p>All prices are final prices including statutory VAT, plus the shipping costs stated on the “Shipping &amp; payment” page.</p>
<h2>5. Payment</h2>
<p>Payment is made through the payment provider Stripe using the methods offered there. Printing starts once payment has been received.</p>
<h2>6. Delivery</h2>
<p>We deliver within the EU. Delivery takes ${shop.deliveryText.en} from receipt of payment.</p>
<h2>7. Retention of title</h2>
<p>The goods remain our property until paid in full.</p>
<h2>8. Right of withdrawal</h2>
<p>There is no right of withdrawal for personalised items (§ 312g para. 2 no. 1 BGB). Details are in the <a class="link" href="/widerrufsbelehrung/">withdrawal policy</a>.</p>
<h2>9. Warranty</h2>
<p>Statutory warranty rights apply.</p>
<h2>10. Final provisions</h2>
<p>German law applies, excluding the UN Convention on Contracts for the International Sale of Goods. For consumers, this choice of law applies only insofar as it does not remove the protection of mandatory provisions of the law of the country where they normally live. ${t('[Agree the choice of law with your lawyer – it depends on where your company is registered]')}</p>`;

const datenschutzEn = `
<h2>1. Controller</h2>
<p>${seller}</p>
<h2>2. Hosting</h2>
<p>This website is hosted by ${t('[hosting provider, e.g. Vercel Inc.]')}. When you visit, technically necessary data (e.g. IP address, time, page requested) is processed to deliver and secure the site (Art. 6(1)(f) GDPR).</p>
<h2>3. Cart and settings</h2>
<p>Your cart, language and cookie choice are stored only in your browser (local storage). This is necessary for the shop to work (§ 25(2) TDDDG).</p>
<h2>4. Orders and payment</h2>
<p>To process your order we use your name, address, email address, phone number if given, order details and your personalisation text (Art. 6(1)(b) GDPR). Payment is handled by Stripe Payments Europe Ltd. (Ireland). Printing and shipping are handled by our fulfilment partner Printful, to whom we pass your delivery address, email address and print data. ${t('[Add Printful details (company, location, transfers to third countries) and data processing agreements]')}</p>
<h2>5. Emails</h2>
<p>We send order, shipping and withdrawal confirmations via ${t('[email service, e.g. Resend]')}.</p>
<h2>6. Meta Pixel (only with your consent)</h2>
<p>If you agree under “Cookie settings”, we use the Meta Pixel by Meta Platforms Ireland Ltd. and also send purchase events from our server (Conversions API) to measure how our ads on Facebook and Instagram perform (Art. 6(1)(a) GDPR, § 25(1) TDDDG). Data may be transferred to the USA. You can withdraw your consent at any time under “Cookie settings”.</p>
<h2>7. Retention</h2>
<p>We keep order data for as long as statutory retention periods require (up to 10 years).</p>
<h2>8. Your rights</h2>
<p>You have the right of access, rectification, erasure, restriction of processing, data portability and objection, and the right to withdraw consent. You can also complain to a data protection supervisory authority. Just email us at ${legal.email}.</p>
<p>Last updated: ${t('[date]')} · ${brand.name}</p>`;

export type LegalPageKey = 'impressum' | 'datenschutz' | 'agb' | 'widerrufsbelehrung' | 'versand-zahlung';

export const legalHtml: Record<Locale, Record<LegalPageKey, string>> = {
  de: { impressum: impressumDe, datenschutz: datenschutzDe, agb: agbDe, widerrufsbelehrung: withdrawalDe, 'versand-zahlung': versandDe },
  en: { impressum: impressumEn, datenschutz: datenschutzEn, agb: agbEn, widerrufsbelehrung: withdrawalEn, 'versand-zahlung': versandEn },
};

/** Full withdrawal policy, included in order confirmation emails. */
export const withdrawalNoticeHtml: Record<Locale, string> = { de: withdrawalDe, en: withdrawalEn };
