import type { Metadata } from 'next';
import Policy from '@/components/Policy';
import { brand } from '@/lib/config';

export const metadata: Metadata = { title: 'Returns & replacements', description: 'If your order arrives damaged, misprinted or wrong, we replace it or refund you.' };

export default function Returns() {
  return (
    <Policy title="Returns & replacements" intro="Every shirt is printed just for you. If we get something wrong, we make it right.">
      <h2>Damaged, misprinted or wrong item</h2>
      <p>
        Write to <a href={`mailto:${brand.email}`}>{brand.email}</a> within 30 days of delivery with your order number and a photo of the problem. We’ll send a free replacement or refund you, whichever you prefer. You don’t need to send the item back.
      </p>
      <h2>Wrong size or change of mind</h2>
      <p>Because each shirt is printed to order, we can’t accept returns or exchanges for the wrong size or a change of mind. Please check the size guide on the product page before ordering; it lists chest width and length in inches.</p>
      <h2>Personalized shirts</h2>
      <p>We print your text exactly as you type it and as shown in the preview. Please double-check spelling before you check out. If we print something different from what you entered, that’s on us and we’ll replace it.</p>
      <h2>Lost packages</h2>
      <p>If tracking stops moving for more than 7 business days, or the package is marked delivered but you can’t find it, let us know. We’ll work with the carrier and send a replacement if it’s lost.</p>
      <h2>Wrong address</h2>
      <p>If a package comes back because the address entered at checkout was incomplete or wrong, we can reship it once you confirm the address. Reshipping costs the shipping fee again.</p>
      <h2>Canceling an order</h2>
      <p>Write to us as soon as possible. We can cancel for a full refund until your order goes into production, usually within a few hours of ordering.</p>
    </Policy>
  );
}
