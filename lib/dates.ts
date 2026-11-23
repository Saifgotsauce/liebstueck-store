// Delivery estimates in business days (Mon–Fri), shown on product pages and in the cart.
import { stores } from './config';
import type { Locale } from './locale';

// US days with no printing or delivery: Thanksgiving, Christmas, New Year's Day.
const US_HOLIDAYS = new Set(['2026-11-26', '2026-12-25', '2027-01-01', '2027-11-25', '2027-12-24', '2027-12-31']);
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function addBusinessDays(from: Date, days: number, skip: Set<string> = new Set()) {
  const d = new Date(from);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6 && !skip.has(ymd(d))) added++;
  }
  return d;
}

const FMT: Record<Locale, Intl.DateTimeFormat> = {
  en: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }),
  de: new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long' }),
};

/**
 * US: one "get it by" date, e.g. "Fri, Dec 4" (Nov 23: a range like "about Nov 30 – Dec 4" left
 * her guessing). It's business day `deliveryByDays` (8 of the 5–9 policy), skipping holidays.
 * Germany: "16.–20. November" for an order placed now.
 */
export function deliveryWindow(locale: Locale = 'en', now = new Date()) {
  const s = stores[locale];
  if (locale === 'en' && s.deliveryByDays) {
    return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(addBusinessDays(now, s.deliveryByDays, US_HOLIDAYS));
  }
  const a = addBusinessDays(now, s.deliveryMinDays);
  const b = addBusinessDays(now, s.deliveryMaxDays);
  const fmt = FMT[locale];
  if (locale === 'de') return a.getMonth() === b.getMonth() ? `${a.getDate()}.–${fmt.format(b)}` : `${fmt.format(a)} – ${fmt.format(b)}`;
  return a.getMonth() === b.getMonth() ? `${fmt.format(a)}–${b.getDate()}` : `${fmt.format(a)} – ${fmt.format(b)}`;
}

/** The seasonal order-by date while it's still ahead, e.g. { name: 'Christmas', label: 'Dec 11' }. */
export function holidayDeadline(locale: Locale = 'en', now = new Date()) {
  const s = stores[locale];
  const end = new Date(`${s.holiday.orderBy}T23:59:59`);
  if (now > end) return null;
  return { name: s.holiday.name, label: FMT[locale].format(end) };
}
