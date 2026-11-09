// Delivery estimates in business days (Mon–Fri), shown on product pages and in the cart.
import { shop } from './config';

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

const fmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

/** "Nov 16 – Nov 20" for an order placed now. */
export function deliveryWindow(now = new Date()) {
  const a = addBusinessDays(now, shop.deliveryMinDays);
  const b = addBusinessDays(now, shop.deliveryMaxDays);
  return a.getMonth() === b.getMonth() ? `${fmt.format(a)}–${b.getDate()}` : `${fmt.format(a)} – ${fmt.format(b)}`;
}

/** The seasonal order-by date while it's still ahead, e.g. { name: 'Christmas', label: 'Dec 11' }. */
export function holidayDeadline(now = new Date()) {
  const end = new Date(`${shop.holiday.orderBy}T23:59:59`);
  if (now > end) return null;
  return { name: shop.holiday.name, label: fmt.format(end) };
}
