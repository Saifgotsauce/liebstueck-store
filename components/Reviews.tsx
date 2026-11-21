'use client';

// Reviews under a product: the list, and a no-account form (name, stars, a few words, an
// optional photo). The review shows up straight away. Only real reviews ever appear here.

import Link from 'next/link';
import { useRef, useState } from 'react';
import { Stars } from './Icons';
import { trackEvent } from '@/lib/analytics';
import { productPath } from '@/lib/locale';
import { REVIEW_LIMITS, type Rating, type Review } from '@/lib/reviews';

export type ShownReview = Review & { id: string; designTitle?: string };

const dateText = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

export function ReviewCard({ r, showDesign = false }: { r: ShownReview; showDesign?: boolean }) {
  return (
    <li className="rounded-2xl bg-white p-5 ring-1 ring-lilac-line">
      <Stars value={r.rating} className="text-[#E8A317]" />
      <span className="sr-only">{r.rating} out of 5 stars</span>
      {showDesign && r.design && r.designTitle && (
        <p className="mt-2 text-[0.95rem]">
          On{' '}
          <Link href={productPath('en', r.design)} className="font-bold text-violet underline">
            {r.designTitle}
          </Link>
        </p>
      )}
      <p className="mt-2 whitespace-pre-line">{r.text}</p>
      {r.photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={r.photo} alt={`Photo from ${r.name}`} loading="lazy" className="mt-3 max-h-80 w-auto rounded-xl object-cover" />
      )}
      <p className="mt-3 text-[0.95rem] font-bold">
        {r.name}
        {r.verified && <span className="ml-2 inline-block rounded-full bg-lilac px-2.5 py-0.5 text-[0.9rem] font-bold text-violet">Verified buyer</span>}{' '}
        <span className="font-medium text-ink-soft">· {dateText(r.date)}</span>
      </p>
    </li>
  );
}

/** Shrink phone photos (often 3–8 MB) to a 1600px JPEG before upload. */
async function shrink(file: File): Promise<File> {
  if (file.size < 900 * 1024 && ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return file;
  try {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * k);
    canvas.height = Math.round(bmp.height * k);
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, 'image/jpeg', 0.85));
    return blob ? new File([blob], 'photo.jpg', { type: 'image/jpeg' }) : file;
  } catch {
    return file;
  }
}

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const labels = ['Didn’t like it', 'Not great', 'It’s OK', 'Liked it', 'Loved it'];
  return (
    <fieldset>
      <legend className="font-bold">Your rating</legend>
      <div className="mt-2 flex gap-[6px]" role="radiogroup" aria-label="Your rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n > 1 ? 's' : ''}: ${labels[n - 1]}`}
            onClick={() => onChange(n)}
            className={`flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-xl border-2 text-[1.6rem] leading-none ${n <= value ? 'border-[#B7791F] bg-[#FFF6DD] text-[#B7791F]' : 'border-lilac-line bg-white text-lilac-line'}`}
          >
            ★
          </button>
        ))}
      </div>
      <p className="mt-1 min-h-[1.5em] text-[0.95rem] text-ink-soft" aria-live="polite">
        {value ? labels[value - 1] : 'Tap a star'}
      </p>
    </fieldset>
  );
}

function ReviewForm({ design, onPosted }: { design: string; onPosted: (r: ShownReview) => void }) {
  const [rating, setRating] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (!rating) return setError('Please tap a star rating first.');
    setBusy(true);
    setError('');
    try {
      form.set('rating', String(rating));
      form.set('design', design);
      const photo = form.get('photo');
      if (photo instanceof File && photo.size > 0) {
        const small = await shrink(photo);
        if (small.size > REVIEW_LIMITS.photoBytes) throw new Error('That photo is too big. Please pick a smaller one.');
        form.set('photo', small);
      } else form.delete('photo');
      const res = await fetch('/api/reviews', { method: 'POST', body: form });
      const d = (await res.json().catch(() => ({}))) as { review?: ShownReview; error?: string };
      if (!res.ok || !d.review) throw new Error(d.error || 'Something went wrong. Please try again.');
      trackEvent('ReviewPosted', { product: design, rating, photo: d.review.photo ? 1 : 0 });
      onPosted(d.review);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 grid max-w-xl gap-5 rounded-2xl bg-lilac p-5 sm:p-6" noValidate>
      <StarPicker value={rating} onChange={setRating} />
      <div>
        <label htmlFor="rv-name" className="font-bold">
          Your first name
        </label>
        <input id="rv-name" name="name" className="field mt-2" autoComplete="name" maxLength={REVIEW_LIMITS.name} required placeholder="e.g. Linda R." />
        <p className="mt-1 text-[0.95rem] text-ink-soft">Only your first name and last initial are shown.</p>
      </div>
      <div>
        <label htmlFor="rv-text" className="font-bold">
          Your review
        </label>
        <textarea id="rv-text" name="text" className="field mt-2 min-h-32" maxLength={REVIEW_LIMITS.text} required placeholder="How does it fit? What did people say when you wore it?" />
      </div>
      <div>
        <label htmlFor="rv-photo" className="font-bold">
          Add a photo <span className="font-medium text-ink-soft">(if you like)</span>
        </label>
        <input
          ref={fileRef}
          id="rv-photo"
          name="photo"
          type="file"
          accept="image/*"
          className="mt-2 block w-full text-[1rem] file:mr-3 file:min-h-12 file:cursor-pointer file:rounded-full file:border-0 file:bg-white file:px-5 file:font-bold file:text-violet"
          onChange={(e) => {
            const f = e.target.files?.[0];
            setPreview(f ? URL.createObjectURL(f) : null);
          }}
        />
        {preview && (
          <div className="mt-3 flex items-end gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Your photo" className="h-28 w-auto rounded-xl object-cover" />
            <button
              type="button"
              className="min-h-12 font-bold text-violet underline"
              onClick={() => {
                if (fileRef.current) fileRef.current.value = '';
                setPreview(null);
              }}
            >
              Remove photo
            </button>
          </div>
        )}
      </div>
      <div>
        <label htmlFor="rv-email" className="font-bold">
          Email <span className="font-medium text-ink-soft">(if you like, never shown)</span>
        </label>
        <input id="rv-email" name="email" type="email" className="field mt-2" autoComplete="email" inputMode="email" placeholder="e.g. linda@example.com" />
        <p className="mt-1 text-[0.95rem] text-ink-soft">Use the one you ordered with and your review gets a “Verified buyer” badge.</p>
      </div>
      {/* bots fill this in, people never see it */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="rv-website">Website</label>
        <input id="rv-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {error && (
        <p className="font-bold text-red-deep" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-violet w-full sm:w-auto" disabled={busy}>
        {busy ? 'Posting…' : 'Post my review'}
      </button>
    </form>
  );
}

export default function Reviews({ design, designTitle, initial, rating }: { design: string; designTitle: string; initial: ShownReview[]; rating: Rating | null }) {
  const [list, setList] = useState(initial);
  const [open, setOpen] = useState(false);
  const [posted, setPosted] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? list : list.slice(0, 6);
  const live = list.length ? { average: Math.round((list.reduce((s, r) => s + r.rating, 0) / list.length) * 10) / 10, count: list.length } : rating;

  return (
    <section id="reviews" className="mt-16 scroll-mt-24" aria-labelledby="reviews-title">
      <h2 id="reviews-title" className="text-[2rem] sm:text-[2.4rem]">
        What customers say
      </h2>
      {live ? (
        <p className="mt-2 flex flex-wrap items-center gap-2">
          <Stars value={live.average} className="text-[#E8A317]" />
          <span className="font-bold">{live.average.toFixed(1)} out of 5</span>
          <span className="text-ink-soft">
            · {live.count} review{live.count === 1 ? '' : 's'}
          </span>
        </p>
      ) : (
        <p className="mt-2 max-w-xl">No reviews on this one yet. Got it? Tell the next woman what you think.</p>
      )}

      {posted && (
        <p className="mt-4 max-w-xl rounded-2xl bg-white p-4 font-bold ring-2 ring-violet" role="status">
          Thank you, {posted}. Your review is up.
        </p>
      )}

      {!open && !posted && (
        <button
          type="button"
          className="btn btn-line mt-5"
          onClick={() => {
            setOpen(true);
            trackEvent('ReviewFormOpened', { product: design });
          }}
        >
          Write a review of {designTitle.length > 32 ? 'this shirt' : designTitle}
        </button>
      )}
      {open && !posted && (
        <ReviewForm
          design={design}
          onPosted={(r) => {
            setList((l) => [r, ...l.filter((x) => x.id !== r.id)]);
            setPosted(r.name.split(' ')[0]);
            setOpen(false);
          }}
        />
      )}

      {list.length > 0 && (
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {shown.map((r) => (
            <ReviewCard key={r.id} r={r} />
          ))}
        </ul>
      )}
      {list.length > 6 && !showAll && (
        <button type="button" className="btn btn-line mt-5" onClick={() => setShowAll(true)}>
          Show all {list.length} reviews
        </button>
      )}
      <p className="mt-5">
        <Link href="/reviews/" className="font-bold text-violet underline">
          Read reviews of all our shirts
        </Link>
      </p>
    </section>
  );
}
