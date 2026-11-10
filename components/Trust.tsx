// Trust building blocks for the US store (docs/design-rules.md §5). Plain components: they render on the
// server and inside client components alike.
import Link from 'next/link';
import { CONTACT, ORDER_STEPS, PROMISE } from '@/lib/promise';
import { IconShield } from './Icons';

/** A lifestyle photo from public/lifestyle/ (made by optimising the originals into 900px and 1536px versions). */
export function Photo({ name, alt, sizes, eager, className, phone }: { name: string; alt: string; sizes: string; eager?: boolean; className?: string; phone?: { name: string; w: number; h: number } }) {
  const set = (ext: string) => `/lifestyle/${name}-900.${ext} 900w, /lifestyle/${name}-1536.${ext} 1536w`;
  return (
    <picture className="block">
      {phone && <source media="(max-width: 767px)" type="image/webp" srcSet={`/lifestyle/${phone.name}-900.webp`} width={phone.w} height={phone.h} />}
      {phone && <source media="(max-width: 767px)" srcSet={`/lifestyle/${phone.name}-900.jpg`} width={phone.w} height={phone.h} />}
      <source type="image/webp" srcSet={set('webp')} sizes={sizes} />
      <img
        src={`/lifestyle/${name}-1536.jpg`}
        srcSet={set('jpg')}
        sizes={sizes}
        width={1536}
        height={1024}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : undefined}
        decoding="async"
        className={className}
      />
    </picture>
  );
}

const CARDS = [
  { file: 'visa', label: 'Visa' },
  { file: 'mastercard', label: 'Mastercard' },
  { file: 'amex', label: 'American Express' },
  { file: 'applepay', label: 'Apple Pay' },
  { file: 'googlepay', label: 'Google Pay' },
];

/** The payment marks she looks for before she types a card number. */
export function PaymentLogos({ className = '', center }: { className?: string; center?: boolean }) {
  return (
    <ul className={`flex flex-wrap items-center gap-2 ${center ? 'justify-center' : ''} ${className}`} aria-label="We accept Visa, Mastercard, American Express, Apple Pay and Google Pay">
      {CARDS.map((c) => (
        <li key={c.file}>
          <img src={`/payment/${c.file}.svg`} alt={c.label} width={46} height={29} className="block h-[29px] w-[46px] rounded-[4px] shadow-[0_0_0_1px_rgba(30,22,38,.12)]" loading="lazy" />
        </li>
      ))}
    </ul>
  );
}

/** One-line promise for next to the Add to cart and checkout buttons. */
export function PromiseNote({ className = '' }: { className?: string }) {
  return (
    <div className={`flex gap-3 rounded-2xl bg-lilac p-4 ${className}`}>
      <IconShield className="mt-0.5 h-6 w-6 shrink-0 text-violet" />
      <p className="text-[1rem] leading-snug">
        <strong>Our promise:</strong> {PROMISE.short}{' '}
        <Link href="/returns/" className="font-bold text-violet">
          How it works
        </Link>
      </p>
    </div>
  );
}

/** The five steps from order to doorstep, numbered. */
export function OrderSteps({ className = '', tone = 'light' }: { className?: string; tone?: 'light' | 'onLilac' }) {
  return (
    <ol className={`space-y-4 ${className}`}>
      {ORDER_STEPS.map((s, i) => (
        <li key={s.t} className="flex gap-4">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-[1.25rem] font-black ${tone === 'onLilac' ? 'bg-white text-violet' : 'bg-violet text-white'}`} aria-hidden="true">
            {i + 1}
          </span>
          <div>
            <p className="text-[1.1rem] font-bold leading-tight">
              <span className="sr-only">Step {i + 1}: </span>
              {s.t}
            </p>
            <p className="mt-1 text-ink-soft">{s.d}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** How to reach a real person. Messenger shows once brand.messengerUrl is set in lib/config.ts. */
export function ContactCard({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-2xl border-2 border-lilac-line bg-white p-5 ${className}`}>
      <p className="text-[1.15rem] font-bold">Questions? Talk to a real person.</p>
      <p className="mt-1 text-ink-soft">
        Write to <a href={`mailto:${CONTACT.email}`} className="font-bold text-violet">{CONTACT.email}</a>. {CONTACT.line}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <a href={`mailto:${CONTACT.email}`} className="btn btn-violet">
          Email us
        </a>
        {CONTACT.messenger && (
          <a href={CONTACT.messenger} className="btn btn-line" target="_blank" rel="noopener noreferrer">
            Message us on Facebook
          </a>
        )}
      </div>
    </div>
  );
}
