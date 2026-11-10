import type { Metadata } from 'next';
import Link from 'next/link';
import { IconCheck } from '@/components/Icons';
import { ContactCard, Photo } from '@/components/Trust';
import { brand } from '@/lib/config';
import { ROUTES } from '@/lib/locale';
import { PROMISE } from '@/lib/promise';

export const metadata: Metadata = {
  title: 'About us',
  description: 'Seasoned is a small, independent shop making funny shirts for women who are getting older out loud. Printed to order in the US, with a real person answering every message.',
};

// No founder story on purpose: the page is about her, how the shirt is made and who answers when she writes.
export default function About() {
  const r = ROUTES.en;
  return (
    <>
      <section className="bg-lilac">
        <div className="wrap grid items-center gap-8 pb-12 pt-8 lg:grid-cols-[1fr_1.2fr] lg:gap-14 lg:py-14">
          <div className="order-2 lg:order-1">
            <h1 className="text-[2.9rem] leading-[1] sm:text-[3.8rem]">For women who don’t do “old”.</h1>
            <p className="mt-5 text-[1.2rem] leading-relaxed">
              {brand.name} is a small, independent online shop. We make funny shirts for women who are getting older out loud, and we answer every message ourselves.
            </p>
          </div>
          <div className="order-1 lg:order-2">
            <Photo
              name="cafe-not-old"
              alt="Two women in their sixties laughing in a café on a rainy day, wearing “Not old. Seasoned.” and “I don’t do mornings” shirts."
              sizes="(min-width: 1024px) 55vw, 100vw"
              eager
              className="block h-auto w-full rounded-[1.75rem]"
            />
          </div>
        </div>
      </section>

      <div className="wrap mt-14 grid gap-14 lg:grid-cols-[1.1fr_1fr]">
        <div className="max-w-2xl space-y-12 text-[1.12rem] leading-relaxed">
          <section aria-labelledby="who">
            <h2 id="who" className="text-[2.1rem] sm:text-[2.4rem]">
              Who we make them for
            </h2>
            <p className="mt-4">
              You don’t feel old, and you’re done being treated like you are. You’ve earned your opinions, your laugh lines and your right to say no, loudly. Our shirts say it for you: sarcasm, spite, coffee, wine, grandkids if you’ve got them, and a lot of doing exactly what you want.
            </p>
            <p className="mt-4">What you won’t find here: “over the hill” jokes, bladder jokes, or anything that makes getting older sound like a problem. It isn’t one. Other people’s opinions about it might be.</p>
          </section>

          <section aria-labelledby="made">
            <h2 id="made" className="text-[2.1rem] sm:text-[2.4rem]">
              How your shirt is made
            </h2>
            <ul className="mt-5 space-y-4">
              {[
                { t: 'Printed just for you.', d: 'Nothing sits in a warehouse. When you order, your shirt is printed in the US, usually within 2–5 business days.' },
                { t: 'On a soft, roomy tee.', d: 'We use the Bella+Canvas 3001: 100% combed, ring-spun cotton (heather colors are a cotton blend) in a relaxed unisex fit, from XS to 4XL.' },
                { t: 'Big print you can read.', d: 'Every design is checked so every word stands out clearly on every shirt color. If your friends can’t read the joke, it isn’t a joke.' },
                { t: 'Shipped with tracking.', d: 'You get an email with a tracking link the day it ships. Most orders arrive in about a week.' },
              ].map((x) => (
                <li key={x.t} className="flex gap-3.5">
                  <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red text-white">
                    <IconCheck className="h-4 w-4" />
                  </span>
                  <p>
                    <strong>{x.t}</strong> {x.d}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="promise">
            <h2 id="promise" className="text-[2.1rem] sm:text-[2.4rem]">
              {PROMISE.title}
            </h2>
            <p className="mt-4">
              If we get it wrong, we fix it for free, and you don’t send anything back. A misprint, a damaged shirt or a package that never shows up gets you a new one or your money back. <Link href={r.returns} className="font-bold text-violet">Read the whole promise</Link>
            </p>
          </section>

          <section aria-labelledby="never">
            <h2 id="never" className="text-[2.1rem] sm:text-[2.4rem]">
              What we’ll never do
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>Make up reviews. You’ll only ever see reviews from real customers here.</li>
              <li>Rush you with countdown clocks or “only 3 left!” We print to order, so there’s always one for you. Take your time.</li>
              <li>Sell your email address.</li>
              <li>Hide our prices, shipping costs or delivery times.</li>
            </ul>
          </section>
        </div>

        <aside className="space-y-8 lg:pt-2" aria-label="More about us">
          <Photo
            name="cafe-peaked"
            alt="Two friends in their sixties laughing over coffee and cake. One wears a “Peaked? Honey, I’m just getting started.” shirt."
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="block h-auto w-full rounded-[1.75rem]"
          />
          <ContactCard />
          <div className="rounded-2xl bg-lilac p-6">
            <p className="text-[1.15rem] font-bold">Who answers when you write?</p>
            <p className="mt-2 text-[1.05rem] leading-relaxed">
              A real person, not a bot. We read every email and usually reply within a day. Messages are signed “{brand.signOff}”.
            </p>
          </div>
          <Link href={r.shop} className="btn btn-red w-full">
            Shop all shirts
          </Link>
        </aside>
      </div>
    </>
  );
}
