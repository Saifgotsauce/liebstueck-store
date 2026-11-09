'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useConsent } from '@/lib/consent';

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/** Loads the Meta Pixel unless the visitor opted out of ad tracking, then tracks page views. */
export default function MetaPixel() {
  const { marketing } = useConsent();
  const pathname = usePathname();
  const loaded = useRef(false);

  useEffect(() => {
    if (!PIXEL_ID || !marketing || loaded.current) return;
    loaded.current = true;
    /* eslint-disable */
    // Standard Meta Pixel bootstrap
    (function (f: any, b: Document, e: string, v: string) {
      if (f.fbq) return;
      const n: any = (f.fbq = function (...args: unknown[]) {
        n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args);
      });
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      const t = b.createElement(e) as HTMLScriptElement;
      t.async = true;
      t.src = v;
      const s = b.getElementsByTagName(e)[0];
      s.parentNode!.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    (window as any).fbq('init', PIXEL_ID);
    /* eslint-enable */
  }, [marketing]);

  useEffect(() => {
    if (!PIXEL_ID || !marketing) return;
    const fbq = (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq;
    fbq?.('track', 'PageView');
  }, [pathname, marketing]);

  return null;
}
