import type { Metadata, Viewport } from 'next';
import './globals.css';
import { siteUrl } from '@/lib/config';

// Bare document. The US store (app/(us)/layout.tsx) and the German store (app/de/layout.tsx)
// each add their own header, footer, cart and privacy setup.
export const metadata: Metadata = { metadataBase: new URL(siteUrl) };

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
      <body className="min-h-screen bg-white antialiased">{children}</body>
    </html>
  );
}
