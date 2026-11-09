'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

// Cookie consent. "Notwendig" (cart, this choice) is always on; "Marketing" (Meta Pixel)
// only after an explicit opt-in. Reject is as easy as accept, as German regulators require.

type Consent = { decided: boolean; marketing: boolean };
type ConsentCtx = Consent & {
  ready: boolean;
  settingsOpen: boolean;
  openSettings: () => void;
  save: (marketing: boolean) => void;
};

const KEY = 'liebstueck-consent-v1';
const Ctx = createContext<ConsentCtx | null>(null);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Consent>({ decided: false, marketing: false });
  const [ready, setReady] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const c = JSON.parse(raw) as { marketing: boolean };
        setState({ decided: true, marketing: !!c.marketing });
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const save = useCallback((marketing: boolean) => {
    setState({ decided: true, marketing });
    setSettingsOpen(false);
    try {
      localStorage.setItem(KEY, JSON.stringify({ marketing, ts: new Date().toISOString() }));
    } catch {
      /* ignore */
    }
    // Withdrawing consent: reload so the already-loaded pixel script is gone.
    if (!marketing && typeof window !== 'undefined' && (window as unknown as { fbq?: unknown }).fbq) window.location.reload();
  }, []);

  const openSettings = useCallback(() => setSettingsOpen(true), []);

  return <Ctx.Provider value={{ ...state, ready, settingsOpen, openSettings, save }}>{children}</Ctx.Provider>;
}

export function useConsent() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useConsent must be used inside ConsentProvider');
  return c;
}
