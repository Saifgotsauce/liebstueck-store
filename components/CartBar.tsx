'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/lib/cart';
import { useConsent } from '@/lib/consent';
import { useLocale } from '@/lib/i18n';

// Phones and tablets, while she browses with something in her cart: what's in it, what it costs and
// the way to the cart, always in reach. A recording (Nov 12, 2026) showed a shopper add six shirts,
// go back to the shop page each time and leave from there without ever tapping checkout; the only
// sign of her cart on that page was the small number on the bag.
// Not on product pages (they have their own bar), nor in the cart, at checkout or after ordering.
const HIDE = /^\/(de\/)?(p\/|cart|warenkorb|kasse|thanks|danke)/;

export default function CartBar() {
  const { totals, ready } = useCart();
  const { t, routes, price } = useLocale();
  const { mode, decided } = useConsent();
  const pathname = usePathname();
  // German store: the cookie question sits in the same spot until it is answered
  if (!ready || totals.count === 0 || HIDE.test(pathname) || (mode === 'optin' && !decided)) return null;
  return (
    <>
      {/* keeps the end of the footer clear of the bar */}
      <div className="h-24 lg:hidden" aria-hidden="true" />
      <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-lilac-line bg-white px-4 pt-3 shadow-[0_-6px_20px_rgba(30,22,38,.12)] lg:hidden" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <p className="min-w-0 flex-1 font-bold leading-tight">{t.cart.bar(totals.count, price(totals.total))}</p>
          <Link href={routes.cart} className="btn btn-red min-h-[3.2rem] shrink-0 px-5" data-track="cart-bar-go-to-cart">
            {t.cart.barGo}
          </Link>
        </div>
      </div>
    </>
  );
}
