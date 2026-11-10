import type { Metadata } from 'next';
import Link from 'next/link';
import Policy from '@/components/Policy';
import { ContactCard } from '@/components/Trust';
import { brand, formatPrice, promise } from '@/lib/config';

export const metadata: Metadata = {
  title: 'We’ll make it right: returns, replacements & size swaps',
  description: `Misprint, damage or a lost package: free replacement or refund. Wrong size: we send the right one for ${formatPrice(promise.sizeSwapCents)} and you keep the first.`,
};

// Printful doesn't restock returned shirts, so we never ask for one back (see the trust plan in the project chat).
export default function Returns() {
  const swap = formatPrice(promise.sizeSwapCents);
  const days = promise.problemDays;
  return (
    <Policy title="We’ll make it right" intro={`Every Seasoned shirt is printed just for you. If something isn’t right, write to us within ${days} days of delivery and a real person will sort it out, usually within a day.`}>
      <h2>If we got it wrong, it’s free</h2>
      <p>
        The print is off, the shirt is damaged, or you got the wrong item? Send us your order number and a photo. We’ll send a new one or refund you, whichever you prefer. There’s nothing to send back.
      </p>

      <h2>Wrong size? Keep it, and we’ll send the right one</h2>
      <p>
        Tell us the size you need. We’ll print and send a new shirt for a flat {swap}, and you keep the first one. Pass it to a friend, a sister, or the gym bag. Nothing to post back, no trip to the post office.
      </p>
      <p>This works for personalized shirts too. One swap per shirt, within {days} days of delivery.</p>
      <h3>How to ask for a swap</h3>
      <ul>
        <li>
          Email <a href={`mailto:${brand.email}?subject=Size%20swap`}>{brand.email}</a> with your order number (it starts with SN-) and the size you need.
        </li>
        <li>We reply with a secure payment link for {swap}.</li>
        <li>As soon as it’s paid, we print the new size and email you the tracking link when it ships.</li>
      </ul>

      <h2>Typo in your personalization?</h2>
      <p>
        We print exactly what you type, so please check the preview before you order. If you spot a typo after it arrives, we’ll reprint it with the right spelling for {swap}. If we printed something different from what you typed, that’s on us and it’s free.
      </p>

      <h2>Lost package</h2>
      <p>
        If tracking hasn’t moved for {promise.lostAfterBusinessDays} business days, or it says delivered but you can’t find it, tell us. We’ll chase the carrier and send a replacement if it’s lost.
      </p>

      <h2>Wrong address</h2>
      <p>If a package comes back because the address entered at checkout was incomplete or wrong, we can send it again once you confirm the address. Sending it again costs the shipping fee again.</p>

      <h2>Changed your mind?</h2>
      <p>
        Because every shirt is printed to order, we can’t take back a shirt that simply isn’t wanted. You can cancel for a full refund until it goes to print, usually within a few hours of ordering, so write to us quickly.
      </p>

      <h2>How to reach us</h2>
      <ContactCard className="not-prose mt-4" />
      <p className="mt-6">
        Questions about sizes before you order? See the size chart on every product page, or our <Link href="/faq/">questions & answers</Link>.
      </p>
    </Policy>
  );
}
