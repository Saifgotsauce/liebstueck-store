import type { Metadata } from 'next';
import Link from 'next/link';
import Policy from '@/components/Policy';
import { ContactCard, OrderSteps, PaymentLogos } from '@/components/Trust';
import { formatPrice, promise, shop } from '@/lib/config';

export const metadata: Metadata = { title: 'Questions & answers', description: 'Is Seasoned a real shop, what if it doesn’t fit, will it shrink, how long it takes and how to pay.' };

const swap = formatPrice(promise.sizeSwapCents);

// The questions she asks first come first, in her words (docs/design-rules.md §5).
const QA: { q: string; a: React.ReactNode }[] = [
  {
    q: 'Is Seasoned a real shop?',
    a: (
      <>
        Yes. Seasoned is a small, independent online shop. Every order is printed to order in the US and shipped with tracking, and a real person answers every message, usually within a day. <Link href="/about/">More about us</Link>
      </>
    ),
  },
  {
    q: 'What if it doesn’t fit?',
    a: (
      <>
        Keep it, and we’ll send the right size for a flat {swap}. Nothing to send back. This works for personalized shirts too, within {promise.problemDays} days of delivery. <Link href="/returns/">How the swap works</Link>
      </>
    ),
  },
  {
    q: 'How do the sizes run?',
    a: 'Our tees are unisex Bella+Canvas 3001s with a relaxed fit. Most women order their usual size, or one size down for a closer fit. Every product page has a size chart with chest width and length in inches. Sizes go from XS to 4XL.',
  },
  {
    q: 'Will it shrink?',
    a: 'The tees are pre-shrunk. Wash cold and inside out, and tumble dry low or hang dry. Don’t iron directly on the print. That keeps the shirt its size and the print bright.',
  },
  {
    q: 'How long does it take?',
    a: (
      <>
        Most orders arrive {shop.deliveryMinDays}–{shop.deliveryMaxDays} business days after you order: 2–5 days to print, then 3–4 days in the mail. Shipping is free over {formatPrice(shop.freeShippingFromCents)}, and always free on hoodies. <Link href="/shipping/">Shipping details</Link>
      </>
    ),
  },
  {
    q: 'Is it safe to pay?',
    a: 'Yes. Checkout is run by Stripe, one of the biggest payment companies in the world. You can pay by credit or debit card, Apple Pay or Google Pay. We never see or store your card number.',
  },
  {
    q: 'Can I talk to a person?',
    a: 'Always. Write to us and a real person (not a bot) answers, usually within a day. Our details are at the bottom of this page.',
  },
  {
    q: 'What are the shirts made of?',
    a: 'T-shirts are soft, lightweight 100% combed ring-spun cotton (heather colors are a cotton-poly blend). Hoodies are a cozy 50/50 cotton-poly fleece.',
  },
  {
    q: 'Will the shirt look like the picture?',
    a: 'Yes. The preview on the product page is drawn from the same file we send to the printer, so the words, layout and colors match. Fabric texture and your screen can make colors look slightly different in person.',
  },
  {
    q: 'How does personalization work?',
    a: 'On a shirt marked “Personalize it”, type the name, year or age into the boxes. The preview updates as you type, and we print exactly what you see, so please double-check the spelling.',
  },
  {
    q: 'How do the bundle savings work?',
    a: `Buy any 2 items and save ${shop.bundles.find((b) => b.minItems === 2)?.percent}%, or 3 or more and save ${shop.bundles.find((b) => b.minItems === 3)?.percent}%. Shirts and hoodies can be mixed. The saving comes off automatically in your cart. No codes to remember.`,
  },
  {
    q: 'Can I send it straight to the person as a gift?',
    a: 'Yes. Enter their name and address as the shipping address at checkout. You’ll get the confirmation and tracking emails. If the size is wrong, the swap above works for gifts too.',
  },
  {
    q: 'What if the print is wrong or the shirt arrives damaged?',
    a: (
      <>
        That’s on us. Send us your order number and a photo within {promise.problemDays} days and we’ll send a new one or refund you, whichever you prefer. <Link href="/returns/">Our full promise</Link>
      </>
    ),
  },
  {
    q: 'Do you ship outside the US?',
    a: 'Not yet. For now we ship to US addresses only.',
  },
];

export default function Faq() {
  return (
    <Policy title="Questions & answers" intro="The things people ask us before they order, answered plainly." updated={false}>
      {QA.map(({ q, a }) => (
        <section key={q}>
          <h3>{q}</h3>
          <p>{a}</p>
        </section>
      ))}
      <h2>What happens after you order</h2>
      <OrderSteps className="mt-4" />
      <h2>Ways to pay</h2>
      <PaymentLogos className="mt-3" />
      <h2>Still wondering?</h2>
      <ContactCard className="mt-4" />
    </Policy>
  );
}
