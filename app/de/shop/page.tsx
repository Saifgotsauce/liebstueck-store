import type { Metadata } from 'next';
import ShopPage from '@/components/ShopPage';
import { designsFor } from '@/lib/designs';
import { MESSAGES } from '@/lib/messages';

const t = MESSAGES.de.meta;

export const metadata: Metadata = { title: 'Alle Shirts – lustige Shirts für Frauen ab 50, Omas und Rentnerinnen', description: t.allIntro };

export default function AllShirts() {
  return <ShopPage title={t.allTitle} intro={t.allIntro} designs={designsFor('de')} current="all" locale="de" />;
}
