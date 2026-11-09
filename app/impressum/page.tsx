import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Impressum' };

export default function Page() {
  return <LegalPage page="impressum" />;
}
