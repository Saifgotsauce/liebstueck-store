import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ShopPage from '@/components/ShopPage';
import { designsFor, designsInVibe, getVibe, isPersonalized, vibesFor } from '@/lib/designs';
import type { Locale } from '@/lib/locale';
import { MESSAGES } from '@/lib/messages';

/** URL slug of the "personalize it" collection in each store. */
export const PERSONALIZED: Record<Locale, string> = { en: 'personalized', de: 'mit-namen' };

export const vibeParams = (locale: Locale) => [...vibesFor(locale).map((v) => ({ vibe: v.key })), { vibe: PERSONALIZED[locale] }];

export function vibeMetadata(vibe: string, locale: Locale): Metadata {
  const t = MESSAGES[locale].meta;
  if (vibe === PERSONALIZED[locale]) return { title: t.personalizedMetaTitle, description: t.personalizedMetaDesc };
  const v = getVibe(vibe);
  if (!v || (v.locale ?? 'en') !== locale) return {};
  return { title: `${v.name} – ${v.searchTerm}`, description: t.vibeDesc(v.blurb, v.searchTerm) };
}

export default function VibePage({ vibe, locale }: { vibe: string; locale: Locale }) {
  const t = MESSAGES[locale].meta;
  if (vibe === PERSONALIZED[locale]) {
    return <ShopPage title={t.personalizedTitle} intro={t.personalizedIntro} designs={designsFor(locale).filter(isPersonalized)} current="personalized" locale={locale} />;
  }
  const v = getVibe(vibe);
  if (!v || (v.locale ?? 'en') !== locale) notFound();
  return <ShopPage title={v.name} intro={v.blurb} designs={designsInVibe(v.key)} current={v.key} locale={locale} />;
}
