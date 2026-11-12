'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { defaultColor } from '@/lib/catalog';
import { getDesign } from '@/lib/designs';
import { useLocale } from '@/lib/i18n';
import { productPath } from '@/lib/locale';
import ShirtPreview from './ShirtPreview';

/** Hero demo: type a grandma name, watch the real shirt update. */
export default function HeroTry() {
  const [name, setName] = useState('');
  // This sits far down the home page. The sharp shirt photo (165 KB) is fetched when she gets
  // close to it, not while the first screen is still loading.
  const [near, setNear] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = box.current;
    if (!el || !('IntersectionObserver' in window)) return setNear(true);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: '900px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const { locale, t } = useLocale();
  const DESIGN = t.hero.design;
  const design = getDesign(DESIGN)!;
  const shown = name.trim() || t.hero.placeholder;
  const color = defaultColor(design, 'tee', locale);
  return (
    <div ref={box} className="rounded-[1.75rem] bg-white p-3 ring-1 ring-lilac-line sm:p-4">
      <ShirtPreview design={DESIGN} garment="tee" colorKey={color} values={{ nickname: shown }} label={t.hero.label(shown)} className="block aspect-square w-full rounded-2xl" view="tile" small={!near} />
      <div className="px-1 pb-1 pt-4 sm:px-2">
        <label htmlFor="try-name" className="block font-bold">
          {t.hero.ask}
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="try-name"
            className="field"
            maxLength={12}
            placeholder={t.hero.placeholder}
            value={name}
            autoComplete="off"
            onChange={(e) => setName(e.target.value.replace(/[^\p{L}\p{M} .'’&-]/gu, ''))}
          />
          <Link href={`${productPath(locale, DESIGN)}?nickname=${encodeURIComponent(shown)}`} className="btn btn-red shrink-0 px-5">
            {t.hero.make}
          </Link>
        </div>
        <div className="mt-3 flex flex-wrap gap-2" aria-label={t.hero.ideasLabel}>
          {t.hero.ideas.map((n) => (
            <button key={n} type="button" className="min-h-12 rounded-full bg-lilac px-4 text-[0.95rem] font-bold text-violet hover:bg-lilac-line" onClick={() => setName(n)}>
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
