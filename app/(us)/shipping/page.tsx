import type { Metadata } from 'next';
import Policy from '@/components/Policy';
import { formatPrice, shop } from '@/lib/config';

export const metadata: Metadata = { title: 'Shipping', description: 'How long shipping takes, what it costs and how to track your order.' };

export default function Shipping() {
  const orderBy = new Date(`${shop.holiday.orderBy}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  return (
    <Policy title="Shipping" intro="Every shirt is printed to order, then shipped with tracking.">
      <h2>How long it takes</h2>
      <p>Printing takes 2–5 business days. Standard shipping within the US then takes about 3–4 business days, so most orders arrive {shop.deliveryMinDays}–{shop.deliveryMaxDays} business days after you order. Orders with several items may arrive in separate packages.</p>
      <h2>What it costs</h2>
      <ul>
        <li>Orders over {formatPrice(shop.freeShippingFromCents)}: free standard shipping.</li>
        <li>Any order with a hoodie in it: free standard shipping, whatever the total.</li>
        <li>T-shirt orders under {formatPrice(shop.freeShippingFromCents)}: {formatPrice(shop.shippingCents)} flat.</li>
      </ul>
      <p>The free-shipping total is counted after bundle savings.</p>
      <h2>Holiday orders</h2>
      <p>
        For {shop.holiday.name} delivery, order by {orderBy} with standard shipping. Carriers get busy in December, so earlier is safer.
      </p>
      <h2>Tracking</h2>
      <p>As soon as your order ships we email you a tracking link. If it hasn’t arrived 5 business days after the carrier shows it as delivered, write to us and we’ll sort it out.</p>
      <h2>Where we ship</h2>
      <p>For now we ship to addresses in the United States only.</p>
    </Policy>
  );
}
