'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

// Two privacy models:
// • US store ('optout'): ad tracking (Meta Pixel) is on unless the visitor opts out via
//   "Your Privacy Choices", or their browser sends a Global Privacy Control signal.
// • German store ('optin', § 25 TDDDG / GDPR): nothing loads until the visitor agrees in the
//   cookie banner; "Cookie-Einstellungen" in the footer changes the choice at any time.

export type ConsentMode = 'optout' | 'optin';

type ConsentCtx = {
  mode: ConsentMode;
  ready: boolean;
  /** Ad tracking allowed */
  marketing: boolean;
  /** Opted out via the browser's Global Privacy Control */
  gpc: boolean;
  /** Opt-in only: the visitor has answered the banner */
  decided: boolean;
  setOptOut: (optOut: boolean) => void;
  /** Opt-in only: save the banner answer */
  setConsent: (allow: boolean) => void;
};

const KEYS: Record<ConsentMode, string> = { optout: 'seasoned-privacy-v1', optin: 'seasoned-de-consent-v1' };
const Ctx = createContext<ConsentCtx | null>(null);

export function ConsentProvider({ children, mode = 'optout' }: { children: ReactNode; mode?: ConsentMode }) {
  const KEY = KEYS[mode];
  const [optOut, setOptOutState] = useState(false);
  const [allow, setAllow] = useState<boolean | null>(null);
  const [gpc, setGpc] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { optOut?: boolean; allow?: boolean };
        if (mode === 'optout') setOptOutState(Boolean(saved.optOut));
        else if (typeof saved.allow === 'boolean') setAllow(saved.allow);
      }
    } catch {
      /* ignore */
    }
    setGpc(Boolean((navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl));
    setReady(true);
  }, [KEY, mode]);

  const save = useCallback(
    (data: object) => {
      try {
        localStorage.setItem(KEY, JSON.stringify({ ...data, ts: new Date().toISOString() }));
      } catch {
        /* ignore */
      }
    },
    [KEY],
  );
  const pixelLoaded = () => typeof window !== 'undefined' && Boolean((window as unknown as { fbq?: unknown }).fbq);

  const setOptOut = useCallback(
    (value: boolean) => {
      setOptOutState(value);
      save({ optOut: value });
      // Opting out after the pixel loaded: reload so the script is gone.
      if (value && pixelLoaded()) window.location.reload();
    },
    [save],
  );

  const setConsent = useCallback(
    (value: boolean) => {
      setAllow(value);
      save({ allow: value });
      if (!value && pixelLoaded()) window.location.reload();
    },
    [save],
  );

  const marketing = mode === 'optout' ? ready && !optOut && !gpc : ready && allow === true;
  return <Ctx.Provider value={{ mode, ready, marketing, gpc, decided: allow !== null, setOptOut, setConsent }}>{children}</Ctx.Provider>;
}

export function useConsent() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useConsent must be used inside ConsentProvider');
  return c;
}
