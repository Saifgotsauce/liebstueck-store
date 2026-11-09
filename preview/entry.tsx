// Single-file, click-through preview of the shop (no checkout). Built by scripts/build-preview.ts.
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Home from '@/app/page';
import NotFound from '@/app/not-found';
import CartPage from '@/app/warenkorb/page';
import WithdrawalPage from '@/app/widerruf/page';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CookieBanner from '@/components/CookieBanner';
import DemoBanner from '@/components/DemoBanner';
import LegalPage from '@/components/LegalPage';
import Personalizer from '@/components/Personalizer';
import { CartProvider } from '@/lib/cart';
import { ConsentProvider } from '@/lib/consent';
import { getProduct } from '@/lib/catalog';
import { LocaleProvider } from '@/lib/i18n/context';
import type { LegalPageKey } from '@/lib/legal-texts';
import SkipLink from '@/components/SkipLink';
import { initialRoute, subscribe } from './router';

const LEGAL: LegalPageKey[] = ['impressum', 'datenschutz', 'agb', 'widerrufsbelehrung', 'versand-zahlung'];

function Page({ name, query }: { name: string; query: string }) {
  const product = getProduct(name);
  if (product)
    return (
      <div className="mx-auto max-w-6xl px-4 pt-5 md:px-6 md:pt-10">
        <Personalizer key={name + query} product={product} prefill={query} />
      </div>
    );
  if (name === 'warenkorb') return <CartPage />;
  if (name === 'widerruf') return <WithdrawalPage />;
  if ((LEGAL as string[]).includes(name)) return <LegalPage page={name as LegalPageKey} />;
  if (name === 'start' || name === '') return <Home />;
  return <NotFound />;
}

function App() {
  const [route, setRoute] = useState(initialRoute);
  useEffect(() => subscribe(setRoute), []);
  return (
    <LocaleProvider>
    <ConsentProvider>
      <CartProvider>
        <SkipLink />
        <DemoBanner />
        <Header />
        <main id="inhalt">
          <Page name={route.name} query={route.query} />
        </main>
        <Footer />
        <CookieBanner />
      </CartProvider>
    </ConsentProvider>
    </LocaleProvider>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
