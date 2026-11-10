// Meta Pixel helpers. The pixel script is only injected when ad tracking is allowed
// (see components/MetaPixel.tsx); before that these calls do nothing.
// The standard shopping events also go to Google Analytics 4 and Microsoft Clarity when those
// are loaded (see components/Analytics.tsx), so all three tools show the same funnel.

type Fbq = (...args: unknown[]) => void;
type Tools = Window & { fbq?: Fbq; gtag?: Fbq; clarity?: Fbq };

const GA4_NAMES: Record<string, string> = {
  ViewContent: 'view_item',
  AddToCart: 'add_to_cart',
  InitiateCheckout: 'begin_checkout',
  Purchase: 'purchase',
};

export function track(event: string, params?: Record<string, unknown>, eventId?: string, retry = true) {
  if (typeof window === 'undefined') return;
  const w = window as Tools;

  // A page's own effects run before the tracking scripts are set up in the same render, so on a direct
  // landing the first call can arrive a moment too early. Try once more right after; if the visitor
  // opted out nothing is on the page then either and the event is simply dropped.
  if (!w.fbq && !w.gtag && !w.clarity) {
    if (retry) setTimeout(() => track(event, params, eventId, false), 0);
    return;
  }

  if (w.fbq) {
    if (eventId) w.fbq('track', event, params ?? {}, { eventID: eventId });
    else w.fbq('track', event, params ?? {});
  }

  const ga = GA4_NAMES[event];
  if (w.gtag && ga) {
    const ids = Array.isArray(params?.content_ids) ? (params?.content_ids as string[]) : [];
    w.gtag('event', ga, {
      currency: params?.currency,
      value: params?.value,
      items: ids.map((id) => ({ item_id: id })),
      ...(event === 'Purchase' && eventId ? { transaction_id: eventId } : {}),
    });
  }
  w.clarity?.('event', event);
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
