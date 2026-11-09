'use client';

import Link from 'next/link';
import { useConsent } from '@/lib/consent';
import { ROUTES } from '@/lib/locale';

export default function CookieEinstellungen() {
  const { ready, marketing, decided, setConsent } = useConsent();
  return (
    <div className="wrap max-w-2xl pt-10 sm:pt-14">
      <h1 className="text-[2.6rem] sm:text-[3.2rem]">Cookie-Einstellungen</h1>
      <p className="mt-4 text-[1.1rem]">
        Notwendig sind nur dein Warenkorb und diese Einstellung – beides bleibt in deinem Browser. Mit deiner Zustimmung nutzen wir zusätzlich das Meta-Pixel, um zu sehen, welche Werbung auf Facebook und Instagram
        funktioniert. Der Shop funktioniert in beiden Fällen gleich. Mehr dazu im <Link href={ROUTES.de.privacy}>Datenschutz</Link>.
      </p>
      {ready && (
        <div className="mt-8 rounded-2xl bg-lilac p-5" role="status">
          <p className="font-bold">{marketing ? 'Meta-Pixel: erlaubt.' : decided ? 'Meta-Pixel: nicht erlaubt.' : 'Du hast noch keine Auswahl getroffen.'}</p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <button type="button" className="btn btn-violet" onClick={() => setConsent(true)} disabled={marketing}>
              Erlauben
            </button>
            <button type="button" className="btn btn-line" onClick={() => setConsent(false)} disabled={decided && !marketing}>
              Nicht erlauben
            </button>
          </div>
        </div>
      )}
      <p className="mt-6 text-[0.95rem] text-ink-soft">Deine Auswahl gilt für diesen Browser. Auf einem anderen Gerät oder nach dem Löschen der Browserdaten fragen wir neu.</p>
    </div>
  );
}
