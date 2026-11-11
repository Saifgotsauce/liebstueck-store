import type { Metadata } from 'next';
import Link from 'next/link';
import { IconCheck } from '@/components/Icons';
import ReferForm from '@/components/ReferForm';
import { ROUTES } from '@/lib/locale';
import { FRIEND, REFERRAL_RULES, REWARD } from '@/lib/referral';

export const metadata: Metadata = {
  title: `Give ${FRIEND}, get ${REWARD}`,
  description: `Get your Seasoned friend code. Your friend gets ${FRIEND} off, and you get ${REWARD} off every time a friend orders.`,
};

export default function Refer() {
  return (
    <>
      <section className="bg-lilac">
        <div className="wrap max-w-3xl py-12">
          <h1 className="text-[2.9rem] leading-[1.02] sm:text-[3.6rem]">
            Give {FRIEND}. Get {REWARD}.
          </h1>
          <p className="mt-4 text-[1.25rem] leading-relaxed">
            You were going to show your friends anyway. Get your code, send it to them, and every friend who orders earns you {REWARD} off your next shirt.
          </p>
          <div className="mt-8">
            <ReferForm cta="Get my friend code" red />
          </div>
        </div>
      </section>

      <section className="wrap max-w-3xl py-12" aria-labelledby="rules">
        <h2 id="rules" className="text-[2.1rem]">
          The rules, in plain English
        </h2>
        <ul className="mt-5 space-y-3 text-[1.1rem]">
          {REFERRAL_RULES.map((r) => (
            <li key={r} className="flex gap-3">
              <IconCheck className="mt-1 h-6 w-6 shrink-0 text-violet" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-[1.1rem]">
          Got a code from a friend? Open her link, or type the code in your{' '}
          <Link href={ROUTES.en.cart} className="font-bold text-violet underline">
            cart
          </Link>{' '}
          under “Have a code?”.
        </p>
      </section>
    </>
  );
}
