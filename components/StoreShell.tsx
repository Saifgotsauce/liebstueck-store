import { CartProvider } from '@/lib/cart';
import { ConsentProvider } from '@/lib/consent';
import { LocaleProvider } from '@/lib/i18n';
import type { Locale } from '@/lib/locale';
import SkipLink from './SkipLink';
import Header from './Header';
import Footer from './Footer';
import MetaPixel from './MetaPixel';
import Analytics from './Analytics';
import BehaviorTracker from './BehaviorTracker';
import DemoBanner from './DemoBanner';
import GeoBanner from './GeoBanner';
import CookieBanner from './CookieBanner';

/** Everything around the page content, for one store. */
export default function StoreShell({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    <LocaleProvider locale={locale}>
      <ConsentProvider mode={locale === 'de' ? 'optin' : 'optout'}>
        <CartProvider locale={locale}>
          <div lang={locale}>
            <SkipLink />
            <DemoBanner />
            <GeoBanner />
            <Header />
            <main id="main">{children}</main>
            <Footer />
            {locale === 'de' && <CookieBanner />}
            <MetaPixel />
            <Analytics />
            <BehaviorTracker />
          </div>
        </CartProvider>
      </ConsentProvider>
    </LocaleProvider>
  );
}
