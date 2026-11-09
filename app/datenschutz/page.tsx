import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Datenschutzerklärung' };

export default function Page() {
  return <LegalPage page="datenschutz" />;
}
