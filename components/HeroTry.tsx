'use client';

import Link from 'next/link';
import { useState } from 'react';
import { defaultColor } from '@/lib/catalog';
import { getDesign } from '@/lib/designs';
import ShirtPreview from './ShirtPreview';

const IDEAS = ['Nana', 'Gigi', 'Mimi', 'Grammy', 'Oma'];
const DESIGN = 'grandma-era';

/** Hero demo: type a grandma name, watch the real shirt update. */
export default function HeroTry() {
  const [name, setName] = useState('');
  const design = getDesign(DESIGN)!;
  const shown = name.trim() || 'Grandma';
  const color = defaultColor(design, 'tee');
  return (
    <div className="rounded-[1.75rem] bg-white p-3 ring-1 ring-lilac-line sm:p-4">
      <ShirtPreview design={DESIGN} garment="tee" colorKey={color} values={{ nickname: shown }} label={`In my ${shown} era t-shirt`} className="block aspect-square w-full rounded-2xl" view="tile" />
      <div className="px-1 pb-1 pt-4 sm:px-2">
        <label htmlFor="try-name" className="block font-bold">
          What do the grandkids call you?
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="try-name"
            className="field"
            maxLength={12}
            placeholder="Grandma"
            value={name}
            autoComplete="off"
            onChange={(e) => setName(e.target.value.replace(/[^\p{L}\p{M} .'’&-]/gu, ''))}
          />
          <Link href={`/p/${DESIGN}/?nickname=${encodeURIComponent(shown)}`} className="btn btn-red shrink-0 px-5">
            Make it
          </Link>
        </div>
        <div className="mt-3 flex flex-wrap gap-2" aria-label="Name ideas">
          {IDEAS.map((n) => (
            <button key={n} type="button" className="rounded-full bg-lilac px-3.5 py-1.5 text-[0.95rem] font-bold text-violet hover:bg-lilac-line" onClick={() => setName(n)}>
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
