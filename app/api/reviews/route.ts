import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import crypto from 'node:crypto';
import { siteUrl } from '@/lib/config';
import { designLocale, getDesign } from '@/lib/designs';
import { productPath } from '@/lib/locale';
import { REVIEW_LIMITS, shortName } from '@/lib/reviews';
import { env } from '@/lib/server/env';
import { emailLayout, escapeHtml, sendEmail } from '@/lib/server/email';
import { REVIEWS_TAG, addReview, removeSignature, savePhoto, type StoredReview } from '@/lib/server/reviews';
import { stripe } from '@/lib/server/stripe';

export const runtime = 'nodejs';

const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

/**
 * POST /api/reviews (multipart form): design, name, rating, text, photo (optional),
 * email (optional, never shown – only to mark the review "Verified buyer"), website (honeypot).
 * The review goes live straight away; the owner gets an email with a link to take it down.
 */
export async function POST(req: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return fail('Reviews aren’t switched on yet. Please try again later.', 503);
  const form = await req.formData().catch(() => null);
  if (!form) return fail('Please try again.');
  if (String(form.get('website') ?? '')) return fail('Please try again.'); // bots fill the hidden field

  const slug = String(form.get('design') ?? '');
  const design = getDesign(slug);
  if (!design || design.hidden || designLocale(design) !== 'en') return fail('We couldn’t find that shirt.');

  const name = shortName(String(form.get('name') ?? '').slice(0, REVIEW_LIMITS.name));
  const rating = Number(form.get('rating'));
  const text = String(form.get('text') ?? '').replace(/\r/g, '').replace(/\n{3,}/g, '\n\n').trim();
  if (!name) return fail('Please add your first name.');
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return fail('Please pick from 1 to 5 stars.');
  if (text.length < REVIEW_LIMITS.minText) return fail('Please write a few words about the shirt.');
  if (text.length > REVIEW_LIMITS.text) return fail(`Please keep it under ${REVIEW_LIMITS.text} characters.`);
  if (/https?:\/\/|www\.|\.com\b/i.test(text)) return fail('Please leave links out of your review.');

  const photo = form.get('photo');
  const file = photo instanceof File && photo.size > 0 ? photo : null;
  if (file && !PHOTO_TYPES.includes(file.type)) return fail('Photos need to be JPG, PNG or WebP.');
  if (file && file.size > REVIEW_LIMITS.photoBytes) return fail('That photo is too big. Please pick a smaller one.');

  const email = String(form.get('email') ?? '').trim().toLowerCase().slice(0, 200);
  const verified = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? await boughtFromUs(email) : false;

  const id = crypto.randomBytes(8).toString('hex');
  try {
    const review: StoredReview = {
      id,
      store: 'en',
      design: slug,
      name,
      rating,
      text,
      date: new Date().toISOString().slice(0, 10),
      ...(verified ? { verified: true } : {}),
      ...(file ? { photo: await savePhoto(id, file) } : {}),
    };
    const added = await addReview(review);
    revalidateTag(REVIEWS_TAG);
    if (added) await tellOwner(review, design.title, email).catch(() => {});
    return NextResponse.json({ review });
  } catch (e) {
    console.error('Review could not be saved', e);
    return fail('Something went wrong on our side. Please try again in a minute.', 502);
  }
}

/** Has this email paid for an order? (Stripe Checkout, US store) */
async function boughtFromUs(email: string) {
  if (!env.stripeSecretKey) return false;
  try {
    const list = await stripe().checkout.sessions.list({ customer_details: { email }, status: 'complete', limit: 5 });
    return list.data.some((s) => s.payment_status === 'paid');
  } catch {
    return false;
  }
}

async function tellOwner(r: StoredReview, title: string, email: string) {
  if (!env.ownerEmail) return;
  const remove = `${siteUrl}/api/reviews/remove?id=${r.id}&sig=${removeSignature(r.id)}`;
  const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
  await sendEmail(
    env.ownerEmail,
    `New review: ${stars} ${title}`,
    emailLayout(
      'New review on the site',
      `<p><strong>${escapeHtml(r.name)}</strong> on <a href="${siteUrl}${productPath('en', r.design!)}#reviews">${escapeHtml(title)}</a>: ${stars}${r.verified ? ' (verified buyer)' : ''}</p>
<p style="white-space:pre-line">${escapeHtml(r.text)}</p>
${r.photo ? `<p><img src="${r.photo}" alt="" style="max-width:100%;border-radius:10px"></p>` : ''}
${email ? `<p style="color:#5E5468">Email they gave (not shown on the site): ${escapeHtml(email)}</p>` : ''}
<p>It’s live now. Spam, abuse or not about the shirt? <a href="${remove}">Take it down</a>.</p>
<p style="color:#5E5468;font-size:14px">Bad reviews stay up: removing honest negative reviews is illegal in the US (FTC). Reply to her instead and fix it.</p>`,
    ),
  );
}
