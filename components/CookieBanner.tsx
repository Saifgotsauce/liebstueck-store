'use client';

import Link from 'next/link';
import { useConsent } from '@/lib/consent';
import { ROUTES } from '@/lib/locale';

/**
 * German store: asks before anything that tracks loads (§ 25 TDDDG). Both buttons equally
 * prominent, no pre-ticked boxes. The shop works the same either way.
 */
export default function CookieBanner() {
  const { mode, ready, decided, setConsent } = useConsent();
  if (mode !== 'optin' || !ready || decided) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4" role="dialog" aria-modal="false" aria-labelledby="cookie-title" lang="de">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-5 shadow-[0_10px_40px_rgba(30,22,38,.25)] ring-1 ring-lilac-line sm:p-6">
        <h2 id="cookie-title" className="text-[1.4rem]">
          Darf’s ein Cookie sein?
        </h2>
        <p className="mt-2 text-[0.98rem] text-ink-soft">
          Mit deiner Zustimmung nutzen wir das Meta-Pixel, um zu sehen, welche Werbung auf Facebook und Instagram zu Besuchen und Bestellungen führt. Dabei können Daten in die USA übertragen werden. Ohne
          Zustimmung funktioniert der Shop genauso. Du kannst deine Wahl jederzeit unter{' '}
          <Link href={ROUTES.de.privacyChoices}>Cookie-Einstellungen</Link> ändern. Mehr dazu im <Link href={ROUTES.de.privacy}>Datenschutz</Link>.
        </p>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          <button type="button" className="btn btn-violet w-full" onClick={() => setConsent(true)}>
            Einverstanden
          </button>
          <button type="button" className="btn btn-violet w-full" onClick={() => setConsent(false)}>
            Nur notwendige
          </button>
        </div>
      </div>
    </div>
  );
}
