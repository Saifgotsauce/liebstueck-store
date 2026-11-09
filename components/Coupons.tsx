import { formatPrice, shop } from '@/lib/config';

/** The three standing offers, shown as clip-out coupons. */
export default function Coupons({ bg = 'lilac' }: { bg?: 'lilac' | 'white' }) {
  const [three, two] = [...shop.bundles].sort((a, b) => b.minItems - a.minItems);
  const items = [
    { big: `Save ${two.percent}%`, small: `when you buy ${two.minItems} shirts` },
    { big: `Save ${three.percent}%`, small: `when you buy ${three.minItems} or more` },
    { big: 'Free shipping', small: `on US orders over ${formatPrice(shop.freeShippingFromCents)}` },
  ];
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
