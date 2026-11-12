import type { Metadata } from 'next';
import ShopPage from '@/components/ShopPage';
import { designsFor } from '@/lib/designs';
import { MESSAGES } from '@/lib/messages';
import { mixByPrice } from '@/lib/prices';

const t = MESSAGES.en.meta;

export const metadata: Metadata = { title: 'All shirts – funny shirts for women over 50, grandmas and retirees', description: t.allIntro };

export default function AllShirts() {
  return <ShopPage title={t.allTitle} intro={t.allIntro} designs={mixByPrice(designsFor('en'))} current="all" locale="en" />;
}
