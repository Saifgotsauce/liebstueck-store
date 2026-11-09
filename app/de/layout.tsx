import type { Metadata } from 'next';
import StoreShell from '@/components/StoreShell';
import { brand } from '@/lib/config';
import { MESSAGES } from '@/lib/messages';

export const metadata: Metadata = {
  title: { default: MESSAGES.de.meta.title, template: `%s | ${brand.name}` },
  description: 'Lustige Shirts für Frauen ab 50, Omas und Rentnerinnen – und Geschenke für Opa. Mit Namen, Enkeln oder Jahrgang personalisierbar. In der EU gedruckt.',
  openGraph: { siteName: brand.name, locale: 'de_DE', type: 'website', images: [{ url: '/og/nicht-alt-vintage.jpg', width: 1200, height: 630 }] },
};

export default function GermanLayout({ children }: { children: React.ReactNode }) {
  return <StoreShell locale="de">{children}</StoreShell>;
}
