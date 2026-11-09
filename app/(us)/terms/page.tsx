import type { Metadata } from 'next';
import Link from 'next/link';
import Policy, { businessName } from '@/components/Policy';
import { brand, isPlaceholder, legal } from '@/lib/config';

export const metadata: Metadata = { title: 'Terms of service', description: 'The terms for buying from our shop.' };

export default function Terms() {
  const us = businessName(brand.name);
  return (
    <Policy title="Terms of service" intro={`These terms apply when you shop with ${us}. By placing an order, you agree to them.`}>
      <h2>Orders</h2>
      <p>Your order is accepted once payment is confirmed and you receive our confirmation email. We may cancel and fully refund an order if an item can’t be produced, if there is an obvious pricing error, or if we suspect fraud.</p>
      <h2>Prices and payment</h2>
      <p>Prices are in US dollars. Sales tax is added at checkout where it applies. Bundle savings are applied automatically and can’t be combined with other offers unless we say so.</p>
      <h2>Personalization</h2>
      <p>You’re responsible for the text you enter, including spelling. Please don’t enter anything hateful, harassing, or that uses someone else’s trademark or copyrighted material. We may cancel and refund orders with text like that.</p>
      <h2>Production and shipping</h2>
      <p>
        Items are printed to order by our production partner and shipped within the US. Delivery times are estimates, not guarantees. See <Link href="/shipping/">Shipping</Link>.
      </p>
      <h2>Returns</h2>
      <p>
        See <Link href="/returns/">Returns & replacements</Link>.
      </p>
      <h2>Colors and fit</h2>
      <p>We show colors as accurately as we can, but screens vary and printed colors can look slightly different on fabric. Size charts are approximate.</p>
      <h2>Our designs</h2>
      <p>The designs, text and images on this site belong to {us}. Please don’t copy or resell them.</p>
      <h2>Liability</h2>
      <p>To the extent the law allows, our total liability for any order is limited to the amount you paid for it.</p>
      <h2>Governing law</h2>
      <p>These terms are governed by the laws of {isPlaceholder(legal.governingLaw) ? 'the state where our business is registered' : legal.governingLaw}.</p>
      <h2>Contact</h2>
      <p>
        <a href={`mailto:${brand.email}`}>{brand.email}</a>
        {!isPlaceholder(legal.mailingAddress) && <>, {legal.mailingAddress}</>}
      </p>
    </Policy>
  );
}
