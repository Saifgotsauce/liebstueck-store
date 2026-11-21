import 'server-only';
import crypto from 'node:crypto';
import { del, put } from '@vercel/blob';
import staticData from '@/data/reviews.json';
import { designLocale, getDesign } from '../designs';
import type { Review } from '../reviews';
import { requireEnv } from './env';

// Customer reviews posted on the site live in Vercel Blob (store "seasoned-reviews") as one
// public JSON file, reviews/index.json, with photos next to it. Reviews collected by hand
// (data/reviews.json) are added on top. Pages read the file through Next's data cache under
// the tag "reviews"; posting or removing a review clears that tag, so pages update at once.
//
// The file is public: never put an email address or anything private in it.

export const REVIEWS_TAG = 'reviews';
const INDEX = 'reviews/index.json';

export type StoredReview = Review & { id: string; store: 'en' | 'de' };

/** Public URL of the Blob store, from the token Vercel sets (vercel_blob_rw_<storeId>_<secret>). */
function blobBase() {
  if (process.env.REVIEWS_BLOB_BASE) return process.env.REVIEWS_BLOB_BASE; // local tests only
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const id = token?.split('_')[3];
  return id ? `https://${id.toLowerCase()}.public.blob.vercel-storage.com` : null;
}

function clean(list: unknown): StoredReview[] {
  const arr = (list as { reviews?: StoredReview[] } | null)?.reviews;
  return Array.isArray(arr) ? arr.filter((r) => r && r.id && r.text && r.rating >= 1 && r.rating <= 5) : [];
}

/** Posted reviews, cached for pages (cleared on every post / removal). */
async function postedReviews(): Promise<StoredReview[]> {
  const base = blobBase();
  if (!base) return [];
  try {
    const res = await fetch(`${base}/${INDEX}`, { cache: 'force-cache', next: { tags: [REVIEWS_TAG] } });
    if (!res.ok) return [];
    return clean(await res.json());
  } catch {
    return [];
  }
}

/** Posted reviews straight from storage (no caches) – for changing the list. */
async function freshPosted(): Promise<StoredReview[]> {
  const base = blobBase();
  if (!base) return [];
  const res = await fetch(`${base}/${INDEX}?fresh=${Date.now()}`, { cache: 'no-store' });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`Could not read reviews (${res.status})`);
  return clean(await res.json());
}

async function save(list: StoredReview[]) {
  await put(INDEX, JSON.stringify({ reviews: list }), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 60,
  });
}

/** Every real review for one store: hand-collected ones plus the ones posted on the site. */
export async function allReviews(store: 'en' | 'de' = 'en'): Promise<StoredReview[]> {
  const collected = ((staticData as { reviews: Review[] }).reviews ?? [])
    .filter((r) => r.rating >= 1 && r.rating <= 5 && r.text?.trim())
    .map((r, i) => {
      const d = r.design ? getDesign(r.design) : undefined;
      return { ...r, id: `c${i}`, store: d ? designLocale(d) : ('en' as const) };
    });
  const posted = (await postedReviews()).filter((r) => !r.hidden);
  return [...collected, ...posted].filter((r) => r.store === store).sort((a, b) => b.date.localeCompare(a.date));
}

export function summarize(list: Review[]) {
  if (!list.length) return null;
  const average = list.reduce((s, r) => s + r.rating, 0) / list.length;
  return { average: Math.round(average * 10) / 10, count: list.length };
}

export async function addReview(r: StoredReview) {
  const list = await freshPosted();
  // the same text twice (double tap, refresh) only counts once
  if (list.some((x) => x.design === r.design && x.text === r.text && x.name === r.name)) return false;
  list.push(r);
  await save(list);
  return true;
}

export async function removeReview(id: string) {
  const list = await freshPosted();
  const r = list.find((x) => x.id === id);
  if (!r) return null;
  await save(list.filter((x) => x.id !== id));
  if (r.photo) await del(r.photo).catch(() => {});
  return r;
}

export async function savePhoto(id: string, file: File) {
  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const blob = await put(`reviews/photos/${id}.${ext}`, file, { access: 'public', addRandomSuffix: true, contentType: file.type });
  return blob.url;
}

// Remove links in the owner email are signed, so only those links can take a review down.
const sign = (id: string) => crypto.createHmac('sha256', requireEnv('printFileSecret')).update(`review:${id}`).digest('base64url').slice(0, 32);

export const removeSignature = sign;

export function checkSignature(id: string, sig: string) {
  try {
    const a = Buffer.from(sign(id));
    const b = Buffer.from(sig);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
