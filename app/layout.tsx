import type { Metadata, Viewport } from 'next';
import './globals.css';
import { brand, siteUrl } from '@/lib/config';
import { CartProvider } from '@/lib/cart';
import { ConsentProvider } from '@/lib/consent';
import SkipLink from '@/components/SkipLink';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MetaPixel from '@/components/MetaPixel';
import DemoBanner from '@/components/DemoBanner';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${brand.name} – Funny shirts for women who are aging out loud`, template: `%s | ${brand.name}` },
  description: brand.description,
  openGraph: { siteName: brand.name, locale: 'en_US', type: 'website', images: [{ url: '/og/not-old-seasoned.jpg', width: 1200, height: 630 }] },
};

export const viewport: Viewport = { themeColor: '#5B2A86', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* The live shirt previews use these print fonts – load them early */}
        <link rel="preload" href="/fonts/Fraunces_900Black.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/ArchivoBlack_400Regular.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/PermanentMarker_400Regular.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-white antialiased">
        <ConsentProvider>
          <CartProvider>
            <SkipLink />
            <DemoBanner />
            <Header />
            <main id="main">{children}</main>
            <Footer />
            <MetaPixel />
          </CartProvider>
        </ConsentProvider>
      </body>
    </html>
  );
}
