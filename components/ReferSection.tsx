import Link from 'next/link';
import { FRIEND, REFERRAL, REWARD } from '@/lib/referral';
import ReferForm from './ReferForm';

/** "Give $5, get $5" block for the homepage and the thank-you page. */
export default function ReferSection({ headingId = 'refer', compact = false }: { headingId?: string; compact?: boolean }) {
  return (
    <div className={compact ? '' : 'grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:items-start lg:gap-14'}>
      <div>
        <h2 id={headingId} className="text-[2.3rem] sm:text-[2.8rem]">
          Give {FRIEND}. Get {REWARD}.
        </h2>
        <p className="mt-3 text-[1.2rem] leading-relaxed">You were going to tell your friends anyway. Now it pays.</p>
        <ol className="mt-5 space-y-3 text-[1.1rem]">
          <li className="flex gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet font-bold text-white">1</span>
            <span className="pt-1">Get your own friend code. You don’t need to have ordered.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet font-bold text-white">2</span>
            <span className="pt-1">Your friend gets {FRIEND} off her order with it.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet font-bold text-white">3</span>
            <span className="pt-1">When she orders, we email you {REWARD} off yours. No limit.</span>
          </li>
        </ol>
        <p className="mt-4 text-[1.05rem]">
          <Link href={REFERRAL.path} className="font-bold text-violet underline">
            The rules, in plain English
          </Link>
        </p>
      </div>
      <div className={compact ? 'mt-6' : ''}>
        <ReferForm />
      </div>
    </div>
  );
}
