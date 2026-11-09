import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Allgemeine Geschäftsbedingungen' };

export default function Page() {
  return <LegalPage page="agb" />;
}
