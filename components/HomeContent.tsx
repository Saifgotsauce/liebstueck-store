'use client';

import Link from 'next/link';
import HeroDemo from './HeroDemo';
import ShirtPreview from './ShirtPreview';
import { GARMENTS, PRODUCTS, getColor } from '@/lib/catalog';
import { defaultValues, getTemplate } from '@/lib/design/templates';
import { shop } from '@/lib/config';
import { loc, type MsgKey } from '@/lib/i18n';
import { useLocale } from '@/lib/i18n/context';
import { productPhotos } from '@/lib/mockups';

const TILE_BG = ['bg-blau-hell', 'bg-rose-hell', 'bg-gelb-hell'];
const FAQ: [MsgKey, MsgKey][] = [
  ['faq.size.q', 'faq.size.a'],
  ['faq.return.q', 'faq.return.a'],
  ['faq.delivery.q', 'faq.delivery.a'],
  ['faq.countries.q', 'faq.countries.a'],
  ['faq.wash.q', 'faq.wash.a'],
];
const STEPS: [MsgKey, MsgKey][] = [
  ['home.step1.title', 'home.step1.text'],
  ['home.step2.title', 'home.step2.text'],
  ['home.step3.title', 'home.step3.text'],
];

export default function HomeContent() {
  const { t, locale, price } = useLocale();
  const delivery = loc(shop.deliveryText, locale);

  return (
    <>
      <HeroDemo />

      <section className="mx-auto max-w-6xl px-4 pt-16 md:px-6 md:pt-24">
        <h2 className="text-[2rem] md:text-[2.6rem]">{t('home.occasions')}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {PRODUCTS.map((p, i) => {
            const g = GARMENTS[p.defaultGarment];
            const c = getColor(g, p.defaultColor)!;
            const tpl = getTemplate(p.template);
            return (
              <Link key={p.slug} href={`/produkt/${p.slug}/`} className="group flex flex-col no-underline">
                {productPhotos(p.slug)[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={productPhotos(p.slug)[0].src}
                    alt={t('home.example', { name: loc(p.name, locale) })}
                    className="aspect-square w-full rounded-2xl object-cover transition-transform duration-200 group-hover:-translate-y-1"
                  />
                ) : (
                <div className={`${TILE_BG[i % 3]} rounded-2xl px-6 pb-2 pt-6`}>
                  <ShirtPreview
                    garment={p.defaultGarment}
                    colorKey={c.key}
                    colorHex={c.hex}
                    ink={c.ink}
                    templateId={p.template}
                    values={defaultValues(tpl)}
                    label={t('home.example', { name: loc(p.name, locale) })}
                    className="mx-auto w-full max-w-[19rem] transition-transform duration-200 group-hover:-translate-y-1"
                  />
                </div>
                )}
                <h3 className="mt-4 text-[1.45rem] group-hover:text-blau">{loc(p.occasion, locale)}</h3>
                <p className="mt-1 text-ink-soft">{loc(p.short, locale)}</p>
                <p className="mt-2 font-bold">{t('home.from', { price: price(GARMENTS.tee.priceCents) })}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-4 md:mt-28 md:px-6">
        <h2 className="text-[2rem] md:text-[2.6rem]">{t('home.steps')}</h2>
        <ol className="mt-8 grid gap-8 md:grid-cols-3">
          {STEPS.map(([title, text], i) => (
            <li key={title} className="flex gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blau font-serif text-xl text-white" aria-hidden="true">
                {i + 1}
              </span>
              <div>
                <h3 className="text-xl">{t(title)}</h3>
                <p className="mt-1 text-ink-soft">{t(text, { delivery })}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-4 md:mt-28 md:px-6">
        <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
          <h2 className="text-[2rem] md:text-[2.6rem]">{t('home.faq')}</h2>
          <div>
            {FAQ.map(([q, a]) => (
              <details key={q} className="info">
                <summary>{t(q)}</summary>
                <p className="pb-4 text-ink-soft">{t(a, { delivery })}</p>
              </details>
            ))}
            <div className="border-t border-linie" />
          </div>
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-4 md:mt-28 md:px-6">
        <div className="flex flex-col items-start gap-5 rounded-3xl bg-blau px-6 py-10 text-white md:flex-row md:items-center md:justify-between md:px-12">
          <p className="max-w-xl font-serif text-[1.7rem] leading-snug md:text-[2rem]">{t('home.band', { free: price(shop.freeShippingFromCents) })}</p>
          <Link href="/produkt/opa-oma-namen/" className="btn btn-primary shrink-0 text-lg">
            {t('home.bandCta')}
          </Link>
        </div>
      </section>
    </>
  );
}
