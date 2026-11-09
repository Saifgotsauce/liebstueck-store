'use client';

import Link from 'next/link';
import { useState } from 'react';
import ShirtPreview from './ShirtPreview';
import { GARMENTS, getProduct } from '@/lib/catalog';
import { getTemplate } from '@/lib/design/templates';
import { shop } from '@/lib/config';
import { loc } from '@/lib/i18n';
import { useLocale } from '@/lib/i18n/context';

const TITLES = ['OPA', 'OMA', 'PAPA', 'MAMA'];

export default function HeroDemo() {
  const product = getProduct('opa-oma-namen')!;
  const { t, locale } = useLocale();
  const [titel, setTitel] = useState('OPA');
  const [namesText, setNamesText] = useState('Mia, Leon, Emma');
  const names = namesText
    .split(/[,;]+/)
    .map((s) => s.trim().slice(0, 14))
    .filter(Boolean)
    .slice(0, 8);
  const color = GARMENTS.tee.colors[0];
  const previewValues = { titel, namen: names.length ? names : ['Mia'], seit: '' };
  const previewLabel = t('hero.preview', { title: titel, names: names.join(', ') });
  const titleField = getTemplate(product.template).fields.find((f) => f.key === 'titel');
  const titleLabel = (v: string) => {
    const o = titleField?.type === 'select' ? titleField.options.find((x) => x.value === v) : undefined;
    return o ? loc(o.label, locale) : v;
  };
  const query = new URLSearchParams({ titel, namen: names.join(',') }).toString();

  return (
    <section className="bg-blau-hell">
      <div className="mx-auto grid max-w-6xl items-center gap-6 px-4 pb-12 pt-7 md:grid-cols-[1fr_1.05fr] md:gap-10 md:px-6 md:pb-20 md:pt-16">
        <div>
          <h1 className="text-[2.35rem] md:text-[3.4rem]">{t('hero.title')}</h1>
          <p className="mt-4 max-w-[34rem] text-lg text-ink-soft">
            {t('hero.text', { delivery: loc(shop.deliveryText, locale) })}
          </p>

          {/* Phones: close-up between text and input, so the change is visible while typing */}
          <ShirtPreview
            garment="tee"
            colorKey={color.key}
            colorHex={color.hex}
            ink={color.ink}
            templateId={product.template}
            values={previewValues}
            label={previewLabel}
            zoom
            className="mx-auto mt-5 h-[16rem] w-full md:hidden"
          />

          <div className="mt-5 max-w-[34rem] rounded-2xl bg-white p-5 shadow-[0_1px_0_#D5DCEC] md:mt-7">
            <div role="radiogroup" aria-label={t('hero.forWhom')} className="flex flex-wrap gap-2">
              {TITLES.map((tt) => (
                <button key={tt} type="button" role="radio" aria-checked={titel === tt} className="chip" onClick={() => setTitel(tt)}>
                  {titleLabel(tt)}
                </button>
              ))}
            </div>
            <label htmlFor="hero-names" className="mt-4 block font-bold">
              {t('hero.names')}
            </label>
            <input
              id="hero-names"
              className="field-input mt-1.5"
              value={namesText}
              onChange={(e) => setNamesText(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
            <Link href={`/produkt/${product.slug}/?${query}`} className="btn btn-primary mt-4 w-full text-lg">
              {t('hero.cta')}
            </Link>
          </div>
        </div>

        <div className="hidden md:block">
          <ShirtPreview
            garment="tee"
            colorKey={color.key}
            colorHex={color.hex}
            ink={color.ink}
            templateId={product.template}
            values={previewValues}
            label={previewLabel}
            className="mx-auto w-full max-w-[30rem] drop-shadow-[0_18px_30px_rgba(22,33,58,0.18)]"
          />
        </div>
      </div>
    </section>
  );
}
