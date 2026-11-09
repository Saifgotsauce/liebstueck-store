'use client';

import Link from 'next/link';
import { brand } from '@/lib/config';
import { VIBES } from '@/lib/designs';
import { Logo } from './Logo';

export default function Footer() {
  return (
    <footer className="mt-24 bg-violet text-white">
      <div className="wrap grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo className="text-white" />
          <p className="mt-4 max-w-sm text-white/80">Funny shirts for women who are getting older out loud, and the people who love them. Printed to order, one at a time.</p>
          <p className="mt-4 text-white/80">
            Questions? <a href={`mailto:${brand.email}`} className="font-bold text-white">{brand.email}</a>
          </p>
        </div>
        <div>
          <h2 className="font-sans text-base font-bold tracking-normal text-white">Shop</h2>
          <ul className="mt-3 space-y-2 text-white/80">
            <li><Link href="/shop/" className="no-underline hover:text-white">All shirts</Link></li>
            {VIBES.map((v) => (
              <li key={v.key}>
                <Link href={`/shop/${v.key}/`} className="no-underline hover:text-white">{v.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-sans text-base font-bold tracking-normal text-white">Help</h2>
          <ul className="mt-3 space-y-2 text-white/80">
            <li><Link href="/faq/" className="no-underline hover:text-white">FAQ</Link></li>
            <li><Link href="/shipping/" className="no-underline hover:text-white">Shipping</Link></li>
            <li><Link href="/returns/" className="no-underline hover:text-white">Returns & replacements</Link></li>
            <li><Link href="/privacy/" className="no-underline hover:text-white">Privacy policy</Link></li>
            <li><Link href="/terms/" className="no-underline hover:text-white">Terms of service</Link></li>
            <li><Link href="/privacy-choices/" className="no-underline hover:text-white">Your privacy choices</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/20">
        <p className="wrap py-5 text-sm text-white/70">© {new Date().getFullYear()} {brand.name}. Secure checkout by Stripe.</p>
      </div>
    </footer>
  );
}
