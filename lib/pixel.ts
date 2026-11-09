// Meta Pixel helpers. The pixel script is only injected when ad tracking is allowed
// (see components/MetaPixel.tsx); before that these calls do nothing.

type Fbq = (...args: unknown[]) => void;

export function track(event: string, params?: Record<string, unknown>, eventId?: string) {
  if (typeof window === 'undefined') return;
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  if (!fbq) return;
  if (eventId) fbq('track', event, params ?? {}, { eventID: eventId });
  else fbq('track', event, params ?? {});
}

function cookie(name: string) {
  if (typeof document === 'undefined') return undefined;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : undefined;
}

/** Facebook browser + click IDs, passed to the server so Conversions API events match. */
export function metaIds() {
  return { fbp: cookie('_fbp'), fbc: cookie('_fbc') };
}
