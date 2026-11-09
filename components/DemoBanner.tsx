'use client';

import { isDemo } from '@/lib/config';
import { useLocale } from '@/lib/i18n/context';

/** Only shown in the clickable preview build (NEXT_PUBLIC_DEMO=1). */
export default function DemoBanner() {
  const { t } = useLocale();
  if (!isDemo) return null;
  return <div className="bg-gelb px-4 py-2 text-center text-sm font-bold text-ink">{t('demo.banner')}</div>;
}
