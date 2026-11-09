import LegalDoc from '@/components/LegalDoc';
import { datenschutzHtml } from '@/lib/legal-de';

export const metadata = { title: 'Datenschutzerklärung' };

export default function Datenschutz() {
  return <LegalDoc title="Datenschutzerklärung" intro="Wer wir sind, welche Daten wir für deine Bestellung brauchen und welche Rechte du hast." html={datenschutzHtml} />;
}
