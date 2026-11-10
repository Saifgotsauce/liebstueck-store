'use client';

import Link from 'next/link';
import { useConsent } from '@/lib/consent';

export default function PrivacyChoices() {
  const { ready, marketing, gpc, setOptOut } = useConsent();
  return (
    <div className="wrap max-w-2xl pt-10 sm:pt-14">
      <h1 className="text-[2.6rem] sm:text-[3.2rem]">Your privacy choices</h1>
      <p className="mt-4 text-[1.1rem]">
        We use the Meta Pixel, Google Analytics and Microsoft Clarity to see which ads lead to visits and orders and how people use the shop. You can turn all of that off here. The shop works exactly the same either way. Details are in our <Link href="/privacy/" className="font-bold text-violet">privacy policy</Link>.
      </p>
      {ready && (
        <div className="mt-8 rounded-2xl bg-lilac p-5" role="status">
          {gpc ? (
            <p className="font-bold">Your browser sends a Global Privacy Control signal, so ad tracking is already off.</p>
          ) : marketing ? (
            <>
              <p className="font-bold">Ad tracking is on.</p>
              <button type="button" className="btn btn-violet mt-4" onClick={() => setOptOut(true)}>
                Turn off ad tracking
              </button>
            </>
          ) : (
            <>
              <p className="font-bold">Ad tracking is off on this browser.</p>
              <button type="button" className="btn btn-line mt-4" onClick={() => setOptOut(false)}>
                Turn ad tracking back on
              </button>
            </>
          )}
        </div>
      )}
      <p className="mt-6 text-[0.95rem] text-ink-soft">This choice is saved in this browser. If you use another device or clear your browser data, set it again there.</p>
    </div>
  );
}
