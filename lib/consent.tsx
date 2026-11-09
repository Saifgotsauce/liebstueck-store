'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

// US privacy model: ad tracking (Meta Pixel) is on unless the visitor opts out via
// "Your Privacy Choices" in the footer, or their browser sends a Global Privacy Control signal.

type ConsentCtx = {
  ready: boolean;
  /** Ad tracking allowed */
  marketing: boolean;
  /** Opted out via the browser's Global Privacy Control */
  gpc: boolean;
  setOptOut: (optOut: boolean) => void;
};

const KEY = 'seasoned-privacy-v1';
const Ctx = createContext<ConsentCtx | null>(null);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [optOut, setOptOutState] = useState(false);
  const [gpc, setGpc] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setOptOutState(Boolean((JSON.parse(raw) as { optOut?: boolean }).optOut));
    } catch {
      /* ignore */
    }
    setGpc(Boolean((navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl));
    setReady(true);
  }, []);

  const setOptOut = useCallback((value: boolean) => {
    setOptOutState(value);
    try {
      localStorage.setItem(KEY, JSON.stringify({ optOut: value, ts: new Date().toISOString() }));
    } catch {
      /* ignore */
    }
    // Opting out after the pixel loaded: reload so the script is gone.
    if (value && typeof window !== 'undefined' && (window as unknown as { fbq?: unknown }).fbq) window.location.reload();
  }, []);

  return <Ctx.Provider value={{ ready, marketing: ready && !optOut && !gpc, gpc, setOptOut }}>{children}</Ctx.Provider>;
}

export function useConsent() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useConsent must be used inside ConsentProvider');
  return c;
}
