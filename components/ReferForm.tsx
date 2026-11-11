'use client';

import { useState } from 'react';
import { trackEvent } from '@/lib/analytics';
import { FRIEND, REWARD, referLink, shareText } from '@/lib/referral';

/** Sign up for a friend code, then share it. Visible labels, big targets, no pop-ups. */
export default function ReferForm({ cta = 'Get my code', red = false }: { cta?: string; red?: boolean }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<{ code: string; emailed: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const website = (new FormData(e.currentTarget).get('website') as string) || '';
    try {
      const res = await fetch('/api/referral', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, website }) });
      const d = (await res.json().catch(() => ({}))) as { code?: string; emailed?: boolean; isNew?: boolean; error?: string };
      if (!res.ok || !d.code) throw new Error(d.error || 'Something went wrong. Please try again.');
      setDone({ code: d.code, emailed: !!d.emailed });
      trackEvent('ReferralSignup', { new_code: d.isNew ? 1 : 0 });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    const link = referLink(done.code);
    const text = shareText(done.code);
    const share = (method: string) => trackEvent('ReferralShared', { method });
    return (
      <div className="rounded-2xl bg-white p-5 ring-2 ring-lilac-line sm:p-6" aria-live="polite">
        <p className="text-[1.15rem] font-bold">Your friend code</p>
        <p className="coupon mt-2 text-center font-serif text-[2.2rem] font-black tracking-wider text-violet" style={{ ['--coupon-bg' as string]: '#fff' }}>
          {done.code}
        </p>
        <p className="mt-4 text-[1.1rem]">
          Send this link to your friends. The {FRIEND} comes off by itself:
          <br />
          <span className="break-all font-bold">{link}</span>
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <a className="btn btn-violet" href={`sms:?&body=${encodeURIComponent(text)}`} onClick={() => share('sms')}>
            Text a friend
          </a>
          <a className="btn btn-line" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`} target="_blank" rel="noopener noreferrer" onClick={() => share('facebook')}>
            Share on Facebook
          </a>
          <button
            type="button"
            className="btn btn-line"
            onClick={async () => {
              share('copy');
              try {
                await navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
              } catch {
                /* the link is shown above to copy by hand */
              }
            }}
          >
            {copied ? 'Copied' : 'Copy message'}
          </button>
        </div>
        <p className="mt-4 text-[1.05rem] text-ink-soft">
          {done.emailed ? 'We also emailed you the code. ' : 'Take a screenshot so you have the code. '}
          Every friend who orders earns you {REWARD} off. We email it to you.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl bg-white p-5 ring-2 ring-lilac-line sm:p-6" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="refer-name" className="block text-[1.05rem] font-bold">
            Your first name
          </label>
          <input id="refer-name" className="field mt-1.5" value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" placeholder="e.g. Linda" required maxLength={40} />
          <p className="mt-1 text-[0.95rem] text-ink-soft">Your friends see this, so they know who sent it.</p>
        </div>
        <div>
          <label htmlFor="refer-email" className="block text-[1.05rem] font-bold">
            Your email
          </label>
          <input id="refer-email" type="email" className="field mt-1.5" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" inputMode="email" placeholder="e.g. linda@gmail.com" required maxLength={200} />
          <p className="mt-1 text-[0.95rem] text-ink-soft">We send your {REWARD} rewards here. No newsletters.</p>
        </div>
      </div>
      {/* Hidden from people, filled in by bots */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label htmlFor="refer-website">Website</label>
        <input id="refer-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <button type="submit" className={`btn ${red ? 'btn-red' : 'btn-violet'} mt-5 w-full sm:w-auto`} disabled={busy}>
        {busy ? 'Getting your code…' : cta}
      </button>
      {error && (
        <p className="mt-3 font-bold text-red" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
