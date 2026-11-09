import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Versand & Zahlung' };

export default function Page() {
  return <LegalPage page="versand-zahlung" />;
}
