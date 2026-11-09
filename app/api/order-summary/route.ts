import { NextResponse } from 'next/server';
import { env } from '@/lib/server/env';
import { orderRef, stripe } from '@/lib/server/stripe';

export const runtime = 'nodejs';

// Used by the thank-you page to show what was ordered.
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('session_id') ?? '';
  if (!env.stripeSecretKey || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(id)) return NextResponse.json({ error: 'not found' }, { status: 404 });
  try {
    const s = stripe();
    const session = await s.checkout.sessions.retrieve(id);
    if (session.status !== 'complete') return NextResponse.json({ error: 'not complete' }, { status: 404 });
    const items = await s.checkout.sessions.listLineItems(id, { limit: 100 });
    return NextResponse.json({
      email: session.customer_details?.email ?? null,
      amountTotal: session.amount_total ?? 0,
      orderRef: orderRef(id),
      // the German store bills shipping as its own line – not a product
      items: items.data.filter((li) => !/^Versand innerhalb/.test(li.description ?? '')).map((li) => ({ name: li.description ?? '', quantity: li.quantity ?? 1 })),
    });
  } catch {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
}
