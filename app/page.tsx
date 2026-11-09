import Link from 'next/link';
import Coupons from '@/components/Coupons';
import HeroTry from '@/components/HeroTry';
import ProductCard, { ProductGrid } from '@/components/ProductCard';
import ShirtPreview from '@/components/ShirtPreview';
import { defaultColor, unitPriceCents } from '@/lib/catalog';
import { formatPrice, shop } from '@/lib/config';
import { holidayDeadline } from '@/lib/dates';
import { DESIGNS, VIBES, designsInVibe, getDesign } from '@/lib/designs';
import { defaultValues, getTemplate } from '@/lib/design/templates';

export const revalidate = 3600; // keeps the holiday deadline current

const PERSONAL_EXAMPLES = ['loved-by-grandkids', 'vintage-birth-year', 'family-christmas'];

export default function Home() {
  const holiday = holidayDeadline();
  // the holiday shop has its own row while it's in season
  const featured = DESIGNS.filter((d) => d.featured && !(holiday && d.vibe === 'holiday'));
  return (
    <>
      {/* Hero: the brand line + a live personalization demo */}
      <section className="bg-lilac">
        <div className="wrap grid items-center gap-8 py-10 sm:py-14 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-20">
          <div>
            <h1 className="text-[3.4rem] leading-[0.95] sm:text-[4.6rem] lg:text-[5.6rem]">Not old. Seasoned.</h1>
            <p className="mt-5 max-w-xl text-[1.2rem] leading-relaxed">
              Funny shirts for women who are getting older out loud, and gifts for the grandpas, husbands and nap champions in their lives. Add a name, a year or the grandkids, and we print it just for you.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/shop/" className="btn btn-red">
                Shop all {DESIGNS.length} shirts
              </Link>
              <Link href="/shop/personalized/" className="btn btn-line">
                Shirts you can personalize
              </Link>
            </div>
            <p className="mt-6 text-ink-soft">
              T-shirts {formatPrice(unitPriceCents('tee'))}, hoodies {formatPrice(unitPriceCents('hoodie'))}. Free shipping over {formatPrice(shop.freeShippingFromCents)}.
            </p>
          </div>
          <HeroTry />
        </div>
      </section>

      {/* Standing offers */}
      <section className="bg-lilac pb-12" aria-labelledby="offers">
        <div className="wrap">
          <h2 id="offers" className="sr-only">
            Savings
          </h2>
          <Coupons />
          <p className="mt-3 text-[0.95rem] text-ink-soft">Savings apply automatically in your cart. No codes to remember.</p>
        </div>
      </section>

      {holiday && (
        <section className="wrap mt-14" aria-labelledby="holiday">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="holiday" className="text-[2.2rem] sm:text-[2.6rem]">
                The holiday shop
              </h2>
              <p className="mt-2 text-lg">
                Order by <strong>{holiday.label}</strong> for {holiday.name} delivery. Matching family shirts welcome.
              </p>
            </div>
            <Link href="/shop/holiday/" className="font-bold text-violet">
              See all holiday shirts
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
            Start here
          </h2>
          <Link href="/shop/" className="font-bold text-violet">
            See all {DESIGNS.length} shirts
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
          Shop by vibe
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VIBES.map((v) => {
            const lead = designsInVibe(v.key).find((d) => d.featured) ?? designsInVibe(v.key)[0];
            return (
              <li key={v.key}>
                <Link href={`/shop/${v.key}/`} className="group flex h-full items-center gap-4 rounded-2xl bg-lilac p-3 pr-4 no-underline hover:bg-lilac-line">
                  <div className="w-28 shrink-0 overflow-hidden rounded-xl bg-white sm:w-32">
                    <ShirtPreview design={lead.slug} garment="tee" colorKey={defaultColor(lead, 'tee')} values={defaultValues(getTemplate(lead.slug))} label="" className="block aspect-square w-full" view="tile" />
                  </div>
                  <div>
                    <p className="font-display text-[1.5rem] font-black leading-tight text-violet">{v.name}</p>
                    <p className="mt-1 text-ink-soft">{v.blurb}</p>
                    <p className="mt-1.5 text-[0.95rem] font-bold text-ink">{designsInVibe(v.key).length} shirts</p>
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
              Put their name on it.
            </h2>
            <p className="mt-4 max-w-md text-[1.1rem] text-white/85">
              Grandma’s name and every grandkid. The year she retired. The year he was born. The family name for the Christmas photo. Type it in, see the shirt change, and we print exactly that.
            </p>
            <Link href="/shop/personalized/" className="btn mt-7 bg-white text-violet hover:bg-lilac">
              Shop personalized shirts
            </Link>
          </div>
          <ul className="grid grid-cols-3 gap-3">
            {PERSONAL_EXAMPLES.map((slug) => {
              const d = getDesign(slug)!;
              return (
                <li key={slug}>
                  <Link href={`/p/${slug}/`} className="block overflow-hidden rounded-2xl bg-white no-underline">
                    <ShirtPreview design={slug} garment="tee" colorKey={defaultColor(d, 'tee')} values={defaultValues(getTemplate(slug))} label={d.title} className="block aspect-square w-full" view="tile" />
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
          Good to know
        </h2>
        <dl className="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-lg font-bold">Printed just for you</dt>
            <dd className="mt-1 text-ink-soft">Every shirt is printed to order on a soft Bella+Canvas tee or a cozy Gildan hoodie.</dd>
          </div>
          <div>
            <dt className="text-lg font-bold">At your door in about a week</dt>
            <dd className="mt-1 text-ink-soft">
              Most orders arrive in {shop.deliveryMinDays}–{shop.deliveryMaxDays} business days, with tracking.
            </dd>
          </div>
          <div>
            <dt className="text-lg font-bold">Made right, or made again</dt>
            <dd className="mt-1 text-ink-soft">Damaged, misprinted or wrong? We replace it or refund you. No return trip to the post office.</dd>
          </div>
          <div>
            <dt className="text-lg font-bold">Pay the way you like</dt>
            <dd className="mt-1 text-ink-soft">Card, Apple Pay or Google Pay through Stripe’s secure checkout.</dd>
          </div>
        </dl>
        <p className="mt-8">
          <Link href="/faq/" className="font-bold text-violet">
            More questions answered
          </Link>
        </p>
      </section>
    </>
  );
}

