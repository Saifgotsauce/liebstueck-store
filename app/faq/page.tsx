import type { Metadata } from 'next';
import Link from 'next/link';
import Policy from '@/components/Policy';
import { brand, formatPrice, shop } from '@/lib/config';

export const metadata: Metadata = { title: 'FAQ', description: 'Sizing, personalization, shipping, bundles and more.' };

const QA: { q: string; a: React.ReactNode }[] = [
  {
    q: 'How do the sizes run?',
    a: 'Our tees are unisex Bella+Canvas 3001s with a relaxed fit. Most women order their usual size, or one size down for a closer fit. Each product page has a size guide with chest width and length in inches.',
  },
  {
    q: 'What are the shirts made of?',
    a: 'T-shirts are soft, lightweight 100% combed ring-spun cotton (heather colors are a cotton-poly blend). Hoodies are a cozy 50/50 cotton-poly fleece.',
  },
  {
    q: 'Will the shirt look like the preview?',
    a: 'Yes. The preview on the product page is drawn from the same file we send to the printer, so the words, layout and colors match. Fabric texture and screen settings can make colors look slightly different in person.',
  },
  {
    q: 'How does personalization work?',
    a: 'On a shirt marked “Personalize it”, type the name, year or age into the boxes. The preview updates as you type, and we print exactly what you see, so please double-check the spelling.',
  },
  {
    q: 'How do the bundle savings work?',
    a: `Buy any 2 items and save ${shop.bundles.find((b) => b.minItems === 2)?.percent}% on your order, or 3 or more and save ${shop.bundles.find((b) => b.minItems === 3)?.percent}%. Shirts and hoodies can be mixed. The saving is applied automatically in your cart.`,
  },
  {
    q: 'How long does delivery take?',
    a: (
      <>
        Most orders arrive {shop.deliveryMinDays}–{shop.deliveryMaxDays} business days after you order. Shipping is free over {formatPrice(shop.freeShippingFromCents)}. <Link href="/shipping/">Shipping details</Link>
      </>
    ),
  },
  {
    q: 'Can I send it straight to the person as a gift?',
    a: 'Yes. Enter their name and address as the shipping address at checkout. You’ll get the confirmation and tracking emails.',
  },
  {
    q: 'What if something’s wrong with my order?',
    a: (
      <>
        Tell us within 30 days with a photo and we’ll replace it or refund you. <Link href="/returns/">Returns & replacements</Link>
      </>
    ),
  },
  {
    q: 'Do you ship outside the US?',
    a: 'Not yet. For now we ship to US addresses only.',
  },
  {
    q: 'How do I pay?',
    a: 'Checkout is handled by Stripe. You can pay by credit or debit card, and with Apple Pay or Google Pay on supported devices. We never see your card number.',
  },
];

export default function Faq() {
  return (
    <Policy title="Questions & answers" updated={false}>
      {QA.map(({ q, a }) => (
        <section key={q}>
          <h3>{q}</h3>
          <p>{a}</p>
        </section>
      ))}
      <h2>Still wondering?</h2>
      <p>
        Write to <a href={`mailto:${brand.email}`}>{brand.email}</a>. A real person answers, usually within one business day.
      </p>
    </Policy>
  );
}
