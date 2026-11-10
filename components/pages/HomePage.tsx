import Link from 'next/link';
import Coupons from '@/components/Coupons';
import HeroTry from '@/components/HeroTry';
import ProductCard, { ProductGrid } from '@/components/ProductCard';
import ShirtPreview from '@/components/ShirtPreview';
import { defaultColor, unitPriceCents } from '@/lib/catalog';
import { formatPrice, stores } from '@/lib/config';
import { holidayDeadline } from '@/lib/dates';
import { designsFor, designsInVibe, getDesign, vibesFor } from '@/lib/designs';
import { defaultValues, getTemplate } from '@/lib/design/templates';
import { ROUTES, productPath, shopPath, type Locale } from '@/lib/locale';
import { MESSAGES } from '@/lib/messages';
import HomeUS from './HomeUS';

/** Home page. The US store has its own photo-led page (HomeUS); the German store keeps this layout. */
export default function HomePage({ locale }: { locale: Locale }) {
  return locale === 'en' ? <HomeUS /> : <HomeClassic locale={locale} />;
}

function HomeClassic({ locale }: { locale: Locale }) {
  const t = MESSAGES[locale];
  const H = t.home;
  const store = stores[locale];
  const fmt = (c: number) => formatPrice(c, locale);
  const routes = ROUTES[locale];
  const DESIGNS = designsFor(locale);
  const VIBES = vibesFor(locale);
  const holidayVibe = locale === 'de' ? 'weihnachten' : 'holiday';
  const personalized = shopPath(locale, locale === 'de' ? 'mit-namen' : 'personalized');
  const holiday = holidayDeadline(locale);
  // the holiday shop has its own row while it's in season
  const featured = DESIGNS.filter((d) => d.featured && !(holiday && d.vibe === holidayVibe));
  return (
    <>
      {/* Hero: the brand line + a live personalization demo */}
      <section className="bg-lilac">
        <div className="wrap grid items-center gap-8 py-10 sm:py-14 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-20">
          <div>
            <h1 className="text-[3.4rem] leading-[0.95] sm:text-[4.6rem] lg:text-[5.6rem]">{H.h1}</h1>
            <p className="mt-5 max-w-xl text-[1.2rem] leading-relaxed">{H.intro}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={routes.shop} className="btn btn-red">
                {H.shopAll(DESIGNS.length)}
              </Link>
              <Link href={personalized} className="btn btn-line">
                {H.personalizable}
              </Link>
            </div>
            <p className="mt-6 text-ink-soft">{H.prices(fmt(unitPriceCents('tee', undefined, locale)), fmt(unitPriceCents('hoodie', undefined, locale)), fmt(store.freeShippingFromCents))}</p>
          </div>
          <HeroTry />
        </div>
      </section>

      {/* Standing offers */}
      <section className="bg-lilac pb-12" aria-labelledby="offers">
        <div className="wrap">
          <h2 id="offers" className="sr-only">
            {H.savings}
          </h2>
          <Coupons locale={locale} />
          <p className="mt-3 text-[0.95rem] text-ink-soft">{H.savingsNote}</p>
        </div>
      </section>

      {holiday && (
        <section className="wrap mt-14" aria-labelledby="holiday">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="holiday" className="text-[2.2rem] sm:text-[2.6rem]">
                {H.holidayTitle}
              </h2>
              <p className="mt-2 text-lg">{H.holidayText(holiday.label, holiday.name)}</p>
            </div>
            <Link href={shopPath(locale, holidayVibe)} className="font-bold text-violet">
              {H.seeHoliday}
            </Link>
          </div>
          <div className="mt-6">
            <ProductGrid designs={designsInVibe(holidayVibe).slice(0, 4)} />
          </div>
        </section>
      )}

      <section className="wrap mt-16" aria-labelledby="start">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="start" className="text-[2.2rem] sm:text-[2.6rem]">
            {H.startHere}
          </h2>
          <Link href={routes.shop} className="font-bold text-violet">
            {H.seeAll(DESIGNS.length)}
          </Link>
        </div>
        <ul className="mt-6 grid grid-cols-2 gap-x-3.5 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
          {featured.map((d, i) => (
            <ProductCard key={d.slug} design={d} eager={i < 4} />
          ))}
        </ul>
      </section>

      {/* Shop by vibe */}
      <section className="wrap mt-20" aria-labelledby="vibes">
        <h2 id="vibes" className="text-[2.2rem] sm:text-[2.6rem]">
          {H.byVibe}
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VIBES.map((v) => {
            const lead = designsInVibe(v.key).find((d) => d.featured) ?? designsInVibe(v.key)[0];
            return (
              <li key={v.key}>
                <Link href={shopPath(locale, v.key)} className="group flex h-full items-center gap-4 rounded-2xl bg-lilac p-3 pr-4 no-underline hover:bg-lilac-line">
                  <div className="w-28 shrink-0 overflow-hidden rounded-xl bg-white sm:w-32">
                    <ShirtPreview design={lead.slug} garment="tee" colorKey={defaultColor(lead, 'tee', locale)} values={defaultValues(getTemplate(lead.slug))} label="" className="block aspect-square w-full" view="tile" />
                  </div>
                  <div>
                    <p className="font-display text-[1.5rem] font-black leading-tight text-violet">{v.name}</p>
                    <p className="mt-1 text-ink-soft">{v.blurb}</p>
                    <p className="mt-1.5 text-[0.95rem] font-bold text-ink">{t.common.shirts(designsInVibe(v.key).length)}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Personalization */}
      <section className="mt-20 bg-violet text-white" aria-labelledby="personal">
        <div className="wrap grid items-center gap-10 py-14 lg:grid-cols-[1.15fr_1.2fr]">
          <div>
            <h2 id="personal" className="text-[2.4rem] text-white sm:text-[2.8rem]">
              {H.personalTitle}
            </h2>
            <p className="mt-4 max-w-md text-[1.1rem] text-white/85">{H.personalText}</p>
            <Link href={personalized} className="btn mt-7 bg-white text-violet hover:bg-lilac">
              {H.personalCta}
            </Link>
          </div>
          <ul className="grid grid-cols-3 gap-3">
            {H.personalExamples.map((slug) => {
              const d = getDesign(slug)!;
              return (
                <li key={slug}>
                  <Link href={productPath(locale, slug)} className="block overflow-hidden rounded-2xl bg-white no-underline">
                    <ShirtPreview design={slug} garment="tee" colorKey={defaultColor(d, 'tee', locale)} values={defaultValues(getTemplate(slug))} label={d.title} className="block aspect-square w-full" view="tile" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Plain answers to the questions people ask before buying */}
      <section className="wrap mt-20" aria-labelledby="how">
        <h2 id="how" className="text-[2.2rem] sm:text-[2.6rem]">
          {H.goodToKnow}
        </h2>
        <dl className="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {H.facts(store.deliveryMinDays, store.deliveryMaxDays).map((f) => (
            <div key={f.t}>
              <dt className="text-lg font-bold">{f.t}</dt>
              <dd className="mt-1 text-ink-soft">{f.d}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-8">
          <Link href={routes.faq} className="font-bold text-violet">
            {H.moreQuestions}
          </Link>
        </p>
      </section>
    </>
  );
}

