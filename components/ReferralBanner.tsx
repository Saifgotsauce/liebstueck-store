'use client';

import { useEffect, useState } from 'react';
import { trackEvent } from '@/lib/analytics';
import { formatPrice } from '@/lib/config';
import { checkCode, saveCode } from '@/lib/referral-client';

/**
 * A friend opened a ?ref=CODE link: remember the code for the cart and say so once, in plain words.
 * Invalid codes are ignored silently (she can still shop normally).
 */
export default function ReferralBanner() {
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const url = new URL(window.location.href);
    const raw = url.searchParams.get('ref');
    if (!raw) return;
    url.searchParams.delete('ref');
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    checkCode(raw).then(({ info }) => {
      if (!info) return;
      saveCode(info);
      trackEvent('ReferralCodeApplied', { kind: info.kind, source: 'link' });
      const off = formatPrice(info.cents, 'en');
      setMsg(info.name ? `${info.name} sent you ${off} off. It comes off in your cart.` : `Your code ${info.code} is saved: ${off} off in your cart.`);
    });
  }, []);

  if (!msg) return null;
  return (
    <div className="border-b-2 border-lilac-line bg-lilac" role="status">
      <div className="wrap flex items-center justify-between gap-4 py-3">
        <p className="text-[1.1rem] font-bold">{msg}</p>
        <button type="button" className="min-h-12 shrink-0 rounded-full px-4 font-bold text-violet underline" onClick={() => setMsg('')}>
          Got it
        </button>
      </div>
    </div>
  );
}
