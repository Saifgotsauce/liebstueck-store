import type { Metadata } from 'next';
import StoreShell from '@/components/StoreShell';
import { brand } from '@/lib/config';
import { MESSAGES } from '@/lib/messages';

export const metadata: Metadata = {
  title: { default: MESSAGES.en.meta.title, template: `%s | ${brand.name}` },
  description: brand.description,
  openGraph: { siteName: brand.name, locale: 'en_US', type: 'website', images: [{ url: '/og/not-old-seasoned.jpg', width: 1200, height: 630 }] },
};

export default function UsLayout({ children }: { children: React.ReactNode }) {
  return <StoreShell locale="en">{children}</StoreShell>;
}
