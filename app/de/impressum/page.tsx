import LegalDoc from '@/components/LegalDoc';
import { impressumHtml } from '@/lib/legal-de';

export const metadata = { title: 'Impressum' };

export default function Impressum() {
  return <LegalDoc title="Impressum" html={impressumHtml} />;
}
