'use client';

import { legalHtml, type LegalPageKey } from '@/lib/legal-texts';
import { useLocale } from '@/lib/i18n/context';
import type { MsgKey } from '@/lib/i18n';

const TITLES: Record<LegalPageKey, MsgKey> = {
  impressum: 'legal.imprint',
  datenschutz: 'legal.privacy',
  agb: 'legal.terms',
  widerrufsbelehrung: 'legal.withdrawal',
  'versand-zahlung': 'legal.shipping',
};

export default function LegalPage({ page }: { page: LegalPageKey }) {
  const { t, locale } = useLocale();
  let html = legalHtml[locale][page];
  if (page === 'widerrufsbelehrung') html = html.replace(/^\s*<h2>[^<]*<\/h2>/, ''); // page already has the title
  const note = t('legal.translationNote');
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 md:px-6 md:pt-14">
      <h1 className="text-[2.2rem] md:text-[2.6rem]">{t(TITLES[page])}</h1>
      {note && <p className="mt-3 text-ink-soft">{note}</p>}
      <div className="prose-legal mt-4" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
