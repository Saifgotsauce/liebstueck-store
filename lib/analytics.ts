// Behavior analytics: one place that sends an event to every tool that is loaded
// (Meta Pixel, Google Analytics 4, Microsoft Clarity). Each tool only exists on the page when
// the visitor's consent allows it (see components/MetaPixel.tsx and components/Analytics.tsx),
// so before that every call here quietly does nothing.
//
// Never pass personal data in params: no names, emails, typed values. Field names and counts only.

type Params = Record<string, string | number | boolean | undefined>;
type Tools = Window & {
  fbq?: (...a: unknown[]) => void;
  gtag?: (...a: unknown[]) => void;
  clarity?: (...a: unknown[]) => void;
};

const SRC_KEY = 'seasoned-src-v1';

/** Where this visit came from, remembered for the whole browser session. */
export type Source = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  from_meta_ad?: boolean;
  referrer?: string;
  landing_path?: string;
};

const UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

/** Read the ad link's utm_* tags (and Meta's click id) on the first page of a session and keep them. */
export function captureSource(): Source {
  if (typeof window === 'undefined') return {};
  try {
    const saved = sessionStorage.getItem(SRC_KEY);
    if (saved) return JSON.parse(saved) as Source;
    const q = new URLSearchParams(window.location.search);
    const src: Source = { landing_path: window.location.pathname };
    for (const k of UTM) {
      const v = q.get(k);
      if (v) src[k] = v.slice(0, 100);
    }
    if (q.get('fbclid')) src.from_meta_ad = true;
    if (document.referrer) {
      const host = new URL(document.referrer).hostname;
      if (host && host !== window.location.hostname) src.referrer = host;
    }
    sessionStorage.setItem(SRC_KEY, JSON.stringify(src));
    return src;
  } catch {
    return {};
  }
}

/** Same session, so every event can be split by ad campaign, ad and ad set. */
function context(): Params {
  const s = captureSource();
  return {
    utm_source: s.utm_source,
    utm_campaign: s.utm_campaign,
    utm_content: s.utm_content,
    utm_term: s.utm_term,
    from_meta_ad: s.from_meta_ad,
  };
}

const snake = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();

/** Send a custom event to every tool that is loaded. `beacon` = use a send-on-exit transport where available. */
export function trackEvent(name: string, params: Params = {}, opts: { beacon?: boolean } = {}) {
  if (typeof window === 'undefined') return;
  const w = window as Tools;
  const data = { ...context(), ...params };
  w.fbq?.('trackCustom', name, data);
  w.gtag?.('event', snake(name), opts.beacon ? { ...data, transport_type: 'beacon' } : data);
  w.clarity?.('event', name);
}
