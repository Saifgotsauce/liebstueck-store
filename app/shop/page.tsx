import type { Metadata } from 'next';
import ShopPage from '@/components/ShopPage';
import { DESIGNS } from '@/lib/designs';

export const metadata: Metadata = {
  title: 'All shirts',
  description: 'Every funny shirt in the shop: aging, grandma life, retirement, milestone birthdays, gifts for him and the holiday shop.',
};

export default function AllShirts() {
  return <ShopPage title="All shirts" intro="Every joke in the shop, on soft tees and cozy hoodies. Pick one, or bundle a few and save." designs={DESIGNS} current="all" />;
}
