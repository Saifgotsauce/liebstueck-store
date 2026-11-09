import type { Metadata, Viewport } from 'next';
import './globals.css';
import { brand, siteUrl } from '@/lib/config';
import { CartProvider } from '@/lib/cart';
import { ConsentProvider } from '@/lib/consent';
import { LocaleProvider } from '@/lib/i18n/context';
import SkipLink from '@/components/SkipLink';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CookieBanner from '@/components/CookieBanner';
import MetaPixel from '@/components/MetaPixel';
import DemoBanner from '@/components/DemoBanner';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${brand.name} – Shirts mit den Namen, die zählen`, template: `%s | ${brand.name}` },
  description: brand.description,
  openGraph: { siteName: brand.name, locale: 'de_DE', type: 'website' },
};

export const viewport: Viewport = { themeColor: '#23408E', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        {/* Load the print fonts early so the live preview never flashes a fallback font */}
        <link rel="preload" href="/fonts/BebasNeue_400Regular.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/DancingScript_700Bold.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-white antialiased">
        <LocaleProvider>
        <ConsentProvider>
          <CartProvider>
            <SkipLink />
            <DemoBanner />
            <Header />
            <main id="inhalt">{children}</main>
            <Footer />
            <CookieBanner />
            <MetaPixel />
          </CartProvider>
        </ConsentProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
