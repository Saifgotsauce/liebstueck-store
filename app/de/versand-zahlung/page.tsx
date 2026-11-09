import LegalDoc from '@/components/LegalDoc';
import { versandHtml } from '@/lib/legal-de';

export const metadata = { title: 'Versand & Zahlung', description: 'Versandkosten, Lieferzeit, Zahlungsarten und unser Fehldruck-Versprechen.' };

export default function Versand() {
  return <LegalDoc title="Versand & Zahlung" html={versandHtml} />;
}
