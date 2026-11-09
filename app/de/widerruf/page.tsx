'use client';

import Link from 'next/link';
import { useState } from 'react';
import { isDemo } from '@/lib/config';
import { ROUTES } from '@/lib/locale';

// Elektronische Widerrufsfunktion (§ 356a BGB, seit 19. Juni 2026): Schaltfläche „Vertrag
// widerrufen“ (Footer) → dieses Formular → „Widerruf bestätigen“ → sofortige Eingangsbestätigung
// per E-Mail mit Inhalt, Datum und Uhrzeit. Ein Grund wird nicht abgefragt.

type Fields = { name: string; email: string; order: string; items: string };

export default function Widerruf() {
  const [state, setState] = useState<'form' | 'sending' | 'done'>('form');
  const [error, setError] = useState('');
  const [stamp, setStamp] = useState('');
  const [f, setF] = useState<Fields>({ name: '', email: '', order: '', items: '' });
  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((x) => ({ ...x, [k]: e.target.value }));

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const honeypot = (new FormData(e.currentTarget).get('website') as string) || '';
    if (isDemo) {
      setStamp(new Date().toLocaleString('de-DE', { dateStyle: 'long', timeStyle: 'short' }));
      setState('done');
      return;
    }
    setState('sending');
    try {
      const res = await fetch('/api/withdrawal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, website: honeypot }) });
      const json = (await res.json().catch(() => ({}))) as { error?: string; stamp?: string };
      if (!res.ok) throw new Error(json.error || 'Das hat nicht geklappt. Bitte versuch es noch einmal oder schreib uns eine E-Mail.');
      setStamp(json.stamp ?? '');
      setState('done');
    } catch (err) {
      setError((err as Error).message);
      setState('form');
    }
  }

  if (state === 'done') {
    return (
      <div className="wrap max-w-2xl pt-14" role="status">
        <h1 className="text-[2.4rem] sm:text-[2.8rem]">Dein Widerruf ist bei uns eingegangen.</h1>
        <p className="mt-4 text-lg">
          Eingegangen am <strong>{stamp}</strong>. Eine Bestätigung mit allen Angaben ist per E-Mail an <strong>{f.email}</strong> unterwegs.
        </p>
        <p className="mt-3 text-ink-soft">Wir melden uns mit den nächsten Schritten zur Rücksendung und Erstattung.</p>
        <Link href={ROUTES.de.home} className="btn btn-line mt-8">
          Zur Startseite
        </Link>
      </div>
    );
  }

  const field = 'field';
  return (
    <div className="wrap max-w-2xl pt-10 sm:pt-14">
      <h1 className="text-[2.4rem] sm:text-[2.8rem]">Vertrag widerrufen</h1>
      <p className="mt-3 text-[1.1rem]">
        Hier kannst du deinen Kaufvertrag ganz einfach online widerrufen. Einen Grund musst du nicht angeben. Nach dem Absenden bekommst du sofort eine Eingangsbestätigung per E-Mail.
      </p>
      <p className="mt-2">
        <Link href={ROUTES.de.returns}>Zur Widerrufsbelehrung</Link>
      </p>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="w-name" className="block font-bold">
            Dein Name
          </label>
          <input id="w-name" required autoComplete="name" className={`${field} mt-1.5`} value={f.name} onChange={set('name')} />
        </div>
        <div>
          <label htmlFor="w-email" className="block font-bold">
            E-Mail-Adresse (für die Eingangsbestätigung)
          </label>
          <input id="w-email" type="email" required autoComplete="email" className={`${field} mt-1.5`} value={f.email} onChange={set('email')} />
        </div>
        <div>
          <label htmlFor="w-order" className="block font-bold">
            Bestellnummer
          </label>
          <p id="w-order-help" className="text-[0.95rem] text-ink-soft">
            Steht in deiner Bestellbestätigung, z. B. SN-1A2B3C4.
          </p>
          <input id="w-order" required aria-describedby="w-order-help" className={`${field} mt-1.5`} value={f.order} onChange={set('order')} />
        </div>
        <div>
          <label htmlFor="w-items" className="block font-bold">
            Welche Artikel? (optional)
          </label>
          <p id="w-items-help" className="text-[0.95rem] text-ink-soft">
            Leer lassen, wenn du die ganze Bestellung widerrufen möchtest.
          </p>
          <textarea id="w-items" rows={3} aria-describedby="w-items-help" className={`${field} mt-1.5`} value={f.items} onChange={set('items')} />
        </div>
        <div className="hidden" aria-hidden="true">
          <label htmlFor="w-website">Website</label>
          <input id="w-website" name="website" tabIndex={-1} autoComplete="off" />
        </div>
        {error && (
          <p className="font-bold text-red" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-red w-full text-[1.1rem]" disabled={state === 'sending'}>
          {state === 'sending' ? 'Wird gesendet …' : 'Widerruf bestätigen'}
        </button>
      </form>
    </div>
  );
}
