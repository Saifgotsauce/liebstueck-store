'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/i18n/context';

export default function NotFound() {
  const { t } = useLocale();
  return (
    <div className="mx-auto max-w-2xl px-4 pt-16 text-center md:px-6">
      <h1 className="text-[2.2rem]">{t('nf.title')}</h1>
      <p className="mt-3 text-lg text-ink-soft">{t('nf.text')}</p>
      <Link href="/" className="btn btn-primary mt-6">{t('nf.cta')}</Link>
    </div>
  );
}
