import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { REVIEWS_TAG, checkSignature, removeReview } from '@/lib/server/reviews';

export const runtime = 'nodejs';

// The link in the owner's "New review" email. Opening it only shows a button: email apps
// open links on their own to scan them, and that must never take a review down.

const page = (title: string, body: string) =>
  new NextResponse(
    `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title></head>
<body style="font-family:Arial,sans-serif;font-size:18px;line-height:1.5;color:#1E1626;background:#F2ECF8;margin:0;padding:32px 20px">
<div style="max-width:520px;margin:0 auto;background:#fff;border-radius:14px;padding:24px"><h1 style="font-family:Georgia,serif;margin-top:0">${title}</h1>${body}</div></body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );

function params(url: string) {
  const u = new URL(url);
  const id = (u.searchParams.get('id') ?? '').replace(/[^a-f0-9]/g, '');
  const sig = u.searchParams.get('sig') ?? '';
  return { id, sig, ok: !!id && checkSignature(id, sig) };
}

export async function GET(req: Request) {
  const { id, sig, ok } = params(req.url);
  if (!ok) return page('Link not valid', '<p>This link doesn’t work. Use the one in the review email.</p>');
  return page(
    'Take this review down?',
    `<p>Only for spam, abuse or posts that aren’t about the shirt. Honest bad reviews stay up.</p>
<form method="post" action="/api/reviews/remove?id=${id}&sig=${encodeURIComponent(sig)}"><button style="font-size:18px;min-height:48px;padding:0 20px;border:0;border-radius:999px;background:#E2342B;color:#fff;font-weight:bold">Take it down</button></form>`,
  );
}

export async function POST(req: Request) {
  const { id, ok } = params(req.url);
  if (!ok) return page('Link not valid', '<p>This link doesn’t work. Use the one in the review email.</p>');
  const removed = await removeReview(id).catch(() => undefined);
  if (removed === undefined) return page('Something went wrong', '<p>Please try again in a minute.</p>');
  revalidateTag(REVIEWS_TAG);
  return page(removed ? 'Review taken down' : 'Already gone', `<p>${removed ? 'It’s off the site now.' : 'This review isn’t on the site anymore.'}</p>`);
}
