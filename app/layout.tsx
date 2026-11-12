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
        {/* The two faces every first screen needs: headings and body text.
            The print fonts for shirt previews load when a preview asks for them. */}
        <link rel="preload" href="/fonts/Fraunces_900Black.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/DMSans_400Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/DMSans_700Bold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-white antialiased">{children}</body>
    </html>
  );
}
