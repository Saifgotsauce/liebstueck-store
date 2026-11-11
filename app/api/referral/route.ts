import { NextResponse } from 'next/server';
import { env } from '@/lib/server/env';
import { sendEmail } from '@/lib/server/email';
import { cleanName, findCode, normalizeEmail, signUp, signUpEmail } from '@/lib/server/referral';
import { stripe } from '@/lib/server/stripe';

export const runtime = 'nodejs';

const NOT_READY = 'Friend codes aren’t switched on yet. Please try again later.';

/** GET /api/referral?code=LINDA7KQ → is this code usable? (cart box + friend link banner) */
export async function GET(req: Request) {
  if (!env.stripeSecretKey) return NextResponse.json({ valid: false, error: NOT_READY }, { status: 503 });
  const code = new URL(req.url).searchParams.get('code');
  try {
    const found = await findCode(stripe(), code);
    if (!found) return NextResponse.json({ valid: false });
    // First name only, and only for friend codes: that's what the referrer agreed to show
    return NextResponse.json({ valid: true, code: found.code, kind: found.kind, cents: found.cents, ...(found.kind === 'referral' && found.name ? { name: found.name.split(' ')[0] } : {}) });
  } catch (e) {
    console.error('Referral lookup failed', e);
    return NextResponse.json({ valid: false, error: 'We couldn’t check that code just now. Please try again.' }, { status: 502 });
  }
}

/** POST /api/referral {name, email} → the person's friend code (emailed too). */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { name?: unknown; email?: unknown; website?: unknown } | null;
  if (body?.website) return NextResponse.json({ error: 'Please try again.' }, { status: 400 }); // bots fill the hidden field
  const email = normalizeEmail(body?.email);
  const name = cleanName(body?.name);
  if (!name) return NextResponse.json({ error: 'Please add your first name. Your friends will see it.' }, { status: 400 });
  if (!email) return NextResponse.json({ error: 'Please check your email address.' }, { status: 400 });
  if (!env.stripeSecretKey) return NextResponse.json({ error: NOT_READY }, { status: 503 });
  try {
    const { code, isNew } = await signUp(stripe(), email, name);
    const emailed = await sendEmail(email, `Your friend code: ${code}`, signUpEmail(name, code)).catch(() => false);
    return NextResponse.json({ code, isNew, emailed });
  } catch (e) {
    console.error('Referral sign-up failed', e);
    return NextResponse.json({ error: 'Something went wrong on our side. Please try again in a minute.' }, { status: 502 });
  }
}
