import Link from 'next/link';
import Coupons from '@/components/Coupons';
import HeroTry from '@/components/HeroTry';
import { IconChat, IconCheck, IconLock, IconShield, IconTruck } from '@/components/Icons';
import ProductCard, { ProductGrid } from '@/components/ProductCard';
import ShirtPreview from '@/components/ShirtPreview';
import { ContactCard, OrderSteps, PaymentLogos, Photo } from '@/components/Trust';
import { defaultColor, unitPriceCents } from '@/lib/catalog';
import { formatPrice, stores } from '@/lib/config';
import { holidayDeadline } from '@/lib/dates';
import { designsFor, designsInVibe, getDesign, vibesFor } from '@/lib/designs';
import { MODEL_PHOTOS } from '@/lib/model-photos';
import { defaultValues, getTemplate } from '@/lib/design/templates';
import { ROUTES, productPath, shopPath } from '@/lib/locale';
import { MESSAGES } from '@/lib/messages';
import { PROMISE } from '@/lib/promise';

// US home page, built to docs/design-rules.md: real women her age first, big readable type, the promise
// and the "what happens next" steps in plain sight, one red button per section.
export default function HomeUS() {
  const locale = 'en' as const;
  const t = MESSAGES.en;
  const H = t.home;
  const store = stores.en;
  const routes = ROUTES.en;
  const fmt = (c: number) => formatPrice(c, locale);
  const DESIGNS = designsFor(locale);
  const VIBES = vibesFor(locale);
  const holiday = holidayDeadline(locale);
  // The shirts with photos on real-looking women lead (the same ten the ads test).
  const featured = Object.keys(MODEL_PHOTOS).map((slug) => getDesign(slug)!).filter(Boolean);
  const free = fmt(store.freeShippingFromCents);
  const two = store.bundles.find((b) => b.minItems === 2)?.percent;
  const three = store.bundles.find((b) => b.minItems === 3)?.percent;

  return (
    <>
      {/* ── Hero: three friends, the brand line, one red button ───────────────── */}
      <section className="bg-lilac" aria-labelledby="hero-title">
        <div className="wrap grid items-center gap-7 pb-10 pt-5 sm:pt-8 lg:grid-cols-[0.95fr_1.25fr] lg:gap-12 lg:py-14">
          <div className="order-2 lg:order-1">
            <h1 id="hero-title" className="text-[3.3rem] leading-[0.95] sm:text-[4.4rem] lg:text-[5.2rem]">
              Not old. Seasoned.
            </h1>
            <p className="mt-5 max-w-xl text-[1.2rem] leading-relaxed">
              Funny shirts for women who stopped asking permission years ago. Big, loud print your friends can read across the room. Soft cotton. Zero apologies.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={routes.shop} className="btn btn-red">
                Shop all {DESIGNS.length} shirts
              </Link>
              <Link href={shopPath(locale, 'personalized')} className="btn btn-line">
                Put your name on one
              </Link>
            </div>
            <ul className="mt-7 space-y-2 text-[1.05rem]">
              {[`T-shirts ${fmt(unitPriceCents('tee', undefined, locale))}. Free US shipping over ${free}`, `Hoodies ${fmt(unitPriceCents('hoodie', undefined, locale))}, always shipped free`, `At your door in about a week, with tracking`, `We mess up, we fix it free`].map((x) => (
                <li key={x} className="flex gap-2.5">
                  <IconCheck className="mt-1 h-5 w-5 shrink-0 text-red" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="order-1 lg:order-2">
            <Photo
              name="friends-studio"
              phone={{ name: 'friends-studio-phone', w: 900, h: 717 }}
              alt="Three women in their sixties laughing together, wearing Seasoned shirts: “I don’t do mornings”, “Powered by coffee, hot flashes & spite” and “Aging like fine wine”."
              sizes="(min-width: 1024px) 58vw, 100vw"
              eager
              className="block h-auto w-full rounded-[1.75rem]"
            />
          </div>
        </div>
      </section>

      {/* ── The promise, right under the hero ─────────────────────────────────── */}
      <section className="border-b border-lilac-line bg-white" aria-labelledby="promise-strip">
        <h2 id="promise-strip" className="sr-only">
          Why shopping with us is safe
        </h2>
        <div className="wrap py-9">
          <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { Icon: IconTruck, t: 'At your door in about a week', d: `Printed just for you in 2–5 days, then shipped with tracking. Free over ${free} or with any hoodie.` },
              { Icon: IconShield, t: 'We mess up, we pay', d: 'Misprint, damage or a lost package: a new shirt or your money back. Nothing to send back.' },
              { Icon: IconLock, t: 'Pay safely', d: 'Card, Apple Pay or Google Pay through Stripe. We never see your card number.' },
              { Icon: IconChat, t: 'Real humans answer', d: 'Email us and a real person replies, usually within a day. No bots, no runaround.' },
            ].map(({ Icon, t: title, d }) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-lilac text-violet">
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-[1.1rem] font-bold leading-tight">{title}</p>
                  <p className="mt-1 text-ink-soft">{d}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
            <PaymentLogos />
            <Link href={routes.returns} className="font-bold text-violet">
              Read our promise
            </Link>
          </div>
        </div>
      </section>

      {/* Standing offers */}
      <section className="bg-lilac py-10" aria-labelledby="offers">
        <div className="wrap">
          <h2 id="offers" className="text-[2rem] sm:text-[2.3rem]">
            Buy more, pay less. Obviously.
          </h2>
          <div className="mt-5">
            <Coupons locale={locale} />
          </div>
          <p className="mt-3 text-[1rem] text-ink-soft">{H.savingsNote}</p>
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
            <Link href={shopPath(locale, 'holiday')} className="font-bold text-violet">
              {H.seeHoliday}
            </Link>
          </div>
          <div className="mt-6">
            <ProductGrid designs={designsInVibe('holiday').slice(0, 4)} />
          </div>
        </section>
      )}

      <section className="wrap mt-16" aria-labelledby="start">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="start" className="text-[2.2rem] sm:text-[2.6rem]">
            Start here. Pick your attitude.
          </h2>
          <Link href={routes.shop} className="font-bold text-violet">
            {H.seeAll(DESIGNS.length)}
          </Link>
        </div>
        <ul className="mt-6 grid grid-cols-2 gap-x-3.5 gap-y-8 sm:gap-x-5 lg:grid-cols-5">
          {featured.map((d, i) => (
            <ProductCard key={d.slug} design={d} eager={i < 4} />
          ))}
        </ul>
      </section>

      {/* ── Friends: the shirts are made to be worn together ───────────────────── */}
      <section className="mt-20 bg-lilac" aria-labelledby="friends">
        <div className="wrap grid items-center gap-8 py-12 lg:grid-cols-[1.25fr_1fr] lg:gap-14 lg:py-16">
          <Photo
            name="patio-friends"
            alt="Four women in their fifties and sixties laughing around a patio table at sunset, with wine and cheese. Two wear “Aging like fine wine” and “Too old for drama” shirts."
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="block h-auto w-full rounded-[1.75rem]"
          />
          <div>
            <h2 id="friends" className="text-[2.3rem] sm:text-[2.8rem]">
              Wear it to brunch. Watch the table lose it.
            </h2>
            <p className="mt-4 text-[1.15rem] leading-relaxed">
              Made for the friends who make you laugh till you snort. The print’s big enough to read across the table, and every joke is about doing exactly what you want. None of that “over the hill” nonsense.
            </p>
            <p className="mt-4 text-[1.15rem] leading-relaxed">
              Getting one for the whole crew? Buy 2 and save {two}%. Buy 3 or more and save {three}%. It comes off in your cart, no codes.
            </p>
            <Link href={routes.shop} className="btn btn-red mt-7">
              Shop all {DESIGNS.length} shirts
            </Link>
          </div>
        </div>
      </section>

      {/* Shop by vibe */}
      <section className="wrap mt-20" aria-labelledby="vibes">
        <h2 id="vibes" className="text-[2.2rem] sm:text-[2.6rem]">
          Find your kind of trouble
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
                    <p className="mt-1.5 text-[1rem] font-bold text-ink">{t.common.shirts(designsInVibe(v.key).length)}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ── Personalize: live demo on a readable shirt ─────────────────────────── */}
      <section className="mt-20 bg-violet text-white" aria-labelledby="personal">
        <div className="wrap grid items-center gap-10 py-14 lg:grid-cols-[1fr_1fr] lg:gap-14">
          <div>
            <h2 id="personal" className="text-[2.4rem] text-white sm:text-[2.8rem]">
              Put your name on it. Loudly.
            </h2>
            <p className="mt-4 max-w-md text-[1.15rem] leading-relaxed text-white">
              What the grandkids call you. The year you were born (we won’t tell). The year you finally quit. Type it in, watch the shirt change, and we print exactly what you see. Buying for someone else? Use her name.
            </p>
            <p className="mt-4 max-w-md text-[1.15rem] leading-relaxed text-white">
              Not a grandma? Try{' '}
              <Link href={productPath(locale, 'vintage-birth-year')} className="font-bold text-white underline">
                your birth year
              </Link>{' '}
              or{' '}
              <Link href={productPath(locale, 'took-me-years-to-look-this-good')} className="font-bold text-white underline">
                the age you’re proud of
              </Link>
              .
            </p>
            <Link href={shopPath(locale, 'personalized')} className="btn mt-7 bg-white text-violet hover:bg-lilac">
              See all shirts you can personalize
            </Link>
          </div>
          <HeroTry />
        </div>
      </section>

      {/* ── Gifts: written for the daughter or friend who's buying ─────────────── */}
      <section className="wrap mt-20" aria-labelledby="gifts">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-14">
          <div className="order-2 lg:order-1">
            <h2 id="gifts" className="text-[2.3rem] sm:text-[2.8rem]">
              Buying for your mom, your sister or the friend who says what everyone’s thinking?
            </h2>
            <ul className="mt-6 space-y-5">
              {[
                { t: 'Send it straight to her.', d: 'Put her name and address as the shipping address at checkout. You get the confirmation and tracking emails.' },
                { t: 'Not sure of her size?', d: 'Pick what she wears in everyday tees. Most women take their usual size, and every shirt has a size chart in inches.' },
                ...(holiday ? [{ t: `Order by ${holiday.label} for ${holiday.name}.`, d: 'That’s our printer’s deadline for standard US shipping before the holidays.' }] : []),
              ].map((x) => (
                <li key={x.t} className="flex gap-3.5">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red text-white">
                    <IconCheck className="h-4 w-4" />
                  </span>
                  <p className="text-[1.1rem] leading-relaxed">
                    <strong>{x.t}</strong> {x.d}
                  </p>
                </li>
              ))}
            </ul>
            <Link href={routes.shop} className="btn btn-red mt-8">
              Find her shirt
            </Link>
          </div>
          <div className="order-1 lg:order-2">
            <Photo
              name="gift-unwrap"
              alt="A woman in her sixties laughing as she holds up a “Warning: may spontaneously say what I’m thinking” shirt she just unwrapped, next to her daughter."
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="block h-auto w-full rounded-[1.75rem]"
            />
          </div>
        </div>
      </section>

      {/* ── What happens after you order + the promise ─────────────────────────── */}
      <section className="mt-20 bg-lilac" aria-labelledby="after">
        <div className="wrap grid gap-10 py-14 lg:grid-cols-[1fr_1fr] lg:gap-14">
          <div>
            <h2 id="after" className="text-[2.3rem] sm:text-[2.8rem]">
              What happens after you order
            </h2>
            <p className="mt-3 text-[1.15rem]">No surprises. You’ve had enough of those. Here’s every step, from your click to your front door.</p>
            <OrderSteps className="mt-7" tone="onLilac" />
          </div>
          <div className="flex flex-col gap-6">
            <Photo
              name="kitchen-mornings"
              alt="A woman in her sixties in a sunny kitchen holding a mug, smiling, in an “I don’t do mornings. Or most afternoons.” shirt."
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="block h-auto w-full rounded-[1.75rem]"
            />
            <div className="rounded-2xl bg-white p-6">
              <h3 className="text-[1.8rem]">{PROMISE.title}</h3>
              <ul className="mt-4 space-y-3">
                {PROMISE.points.map((p) => (
                  <li key={p.t}>
                    <p className="font-bold">{p.t}</p>
                    <p className="text-ink-soft">{p.d}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-4">
                {PROMISE.window}{' '}
                <Link href={routes.returns} className="font-bold text-violet">
                  The full promise
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── The questions she asks first ───────────────────────────────────────── */}
      <section className="wrap mt-20" aria-labelledby="questions">
        <h2 id="questions" className="text-[2.2rem] sm:text-[2.6rem]">
          Fair questions. Straight answers.
        </h2>
        <dl className="mt-7 grid gap-x-12 gap-y-7 md:grid-cols-2">
          {[
            { q: 'Is Seasoned a real shop?', a: 'Yes. A small, independent online shop, not a faceless warehouse. Every shirt is printed to order in the US and shipped with tracking, and a real person answers every message.' },
            { q: 'How do the sizes run?', a: 'Our tees are a relaxed unisex fit. Most women take their usual size, or one size down for a closer fit. Every product page has a size chart in inches.' },
            { q: 'Will it shrink?', a: 'The tees are pre-shrunk cotton. Wash cold, inside out, and tumble dry low or hang dry, and the shirt and the print will last.' },
            { q: 'Is it safe to pay?', a: 'Yes. Checkout is run by Stripe, which handles payments for millions of businesses. Pay by card, Apple Pay or Google Pay. We never see your card number.' },
          ].map((x) => (
            <div key={x.q}>
              <dt className="text-[1.2rem] font-bold">{x.q}</dt>
              <dd className="mt-1.5 text-[1.05rem] leading-relaxed">{x.a}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <ContactCard />
          <Link href={routes.faq} className="btn btn-line">
            All questions & answers
          </Link>
        </div>
      </section>
    </>
  );
}
