import LegalDoc from '@/components/LegalDoc';
import { agbHtml } from '@/lib/legal-de';

export const metadata = { title: 'Allgemeine Geschäftsbedingungen' };

export default function Agb() {
  return <LegalDoc title="Allgemeine Geschäftsbedingungen" html={agbHtml} />;
}
