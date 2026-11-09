import { formatPrice, stores } from '@/lib/config';
import type { Locale } from '@/lib/locale';
import { MESSAGES } from '@/lib/messages';

/** The three standing offers, shown as clip-out coupons. */
export default function Coupons({ bg = 'lilac', locale = 'en' }: { bg?: 'lilac' | 'white'; locale?: Locale }) {
  const store = stores[locale];
  const [three, two] = [...store.bundles].sort((a, b) => b.minItems - a.minItems);
  const items = MESSAGES[locale].coupons.items(two, three, formatPrice(store.freeShippingFromCents, locale));
  return (
    <ul className="grid gap-4 sm:grid-cols-3" style={{ ['--coupon-bg' as string]: bg === 'lilac' ? 'var(--color-lilac)' : '#fff' }}>
      {items.map((c) => (
        <li key={c.big} className="coupon">
          <span className="block font-display text-[1.7rem] font-black leading-none text-red">{c.big}</span>
          <span className="mt-1.5 block text-[1rem] font-medium text-ink">{c.small}</span>
        </li>
      ))}
    </ul>
  );
}
