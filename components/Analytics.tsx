'use client';

import { useEffect, useRef } from 'react';
import { useConsent } from '@/lib/consent';
import { useLocale } from '@/lib/i18n';
import { captureSource } from '@/lib/analytics';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

/**
 * Google Analytics 4 (funnel numbers) and Microsoft Clarity (session recordings, heatmaps, rage
 * clicks). Each loads only when its ID is set AND the visitor hasn't opted out. US store only:
 * the German store needs its cookie banner and privacy text updated before these can run there.
 */
export default function Analytics() {
  const { marketing } = useConsent();
  const { locale } = useLocale();
  const loaded = useRef(false);

  useEffect(() => {
    if (!marketing || locale !== 'en' || loaded.current || (!GA_ID && !CLARITY_ID)) return;
    loaded.current = true;
    const src = captureSource();
    /* eslint-disable */
    const w = window as any;

    if (GA_ID) {
      w.dataLayer = w.dataLayer || [];
      w.gtag = function () {
        // gtag.js expects the arguments object itself, not an array
        // eslint-disable-next-line prefer-rest-params
        w.dataLayer.push(arguments);
      };
      w.gtag('js', new Date());
      w.gtag('config', GA_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
      const s = document.createElement('script');
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
      document.head.appendChild(s);
    }

    if (CLARITY_ID) {
      w.clarity =
        w.clarity ||
        function (...args: unknown[]) {
          (w.clarity.q = w.clarity.q || []).push(args);
        };
      const s = document.createElement('script');
      s.async = true;
      s.src = `https://www.clarity.ms/tag/${encodeURIComponent(CLARITY_ID)}`;
      document.head.appendChild(s);
      // Tag every recording with the ad it came from so you can filter by campaign or ad
      for (const [k, v] of Object.entries(src)) if (v !== undefined && k.startsWith('utm_')) w.clarity('set', k, String(v));
      if (src.from_meta_ad) w.clarity('set', 'from_meta_ad', 'yes');
    }
    /* eslint-enable */
  }, [marketing, locale]);

  return null;
}
