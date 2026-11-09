'use client';

import { useLocale } from '@/lib/i18n/context';

export default function SkipLink() {
  const { t } = useLocale();
  return (
    <a href="#inhalt" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-gelb focus:px-3 focus:py-2">
      {t('nav.skip')}
    </a>
  );
}
