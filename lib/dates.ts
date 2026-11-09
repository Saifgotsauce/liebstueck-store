// Delivery estimates in business days (Mon–Fri), shown on product pages and in the cart.
import { stores } from './config';
import type { Locale } from './locale';

function addBusinessDays(from: Date, days: number) {
  const d = new Date(from);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6) added++;
  }
  return d;
}

const FMT: Record<Locale, Intl.DateTimeFormat> = {
  en: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }),
  de: new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long' }),
};

/** "Nov 16–20" / "16.–20. November" for an order placed now. */
export function deliveryWindow(locale: Locale = 'en', now = new Date()) {
  const s = stores[locale];
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
