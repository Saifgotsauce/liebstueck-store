import { NextResponse } from 'next/server';
import { brand } from '@/lib/config';
import { formatDateTime, isLocale, type Locale } from '@/lib/i18n';
import { emailLayout, escapeHtml, sendEmail } from '@/lib/server/email';
import { env } from '@/lib/server/env';

export const runtime = 'nodejs';

// Electronic withdrawal function (EU Directive 2023/2673): the customer declares
// withdrawal online and immediately receives a confirmation of receipt with the
// content of the declaration and the date and time it was received.

const COPY = {
  de: {
    missing: 'Bitte Name, E-Mail-Adresse und Bestellnummer angeben.',
    invalid: 'Ungültige Anfrage.',
    name: 'Name',
    email: 'E-Mail',
    order: 'Bestellnummer',
    orderDate: 'Bestellt am',
    items: 'Artikel',
    allItems: 'gesamte Bestellung',
    received: 'Eingegangen am',
    subject: 'Eingangsbestätigung deines Widerrufs ({order})',
    title: 'Wir haben deinen Widerruf erhalten',
    intro: 'Hiermit bestätigen wir den Eingang deiner Widerrufserklärung:',
    statement: '„Hiermit widerrufe ich den von mir abgeschlossenen Vertrag über den Kauf der oben genannten Waren.“',
    next: 'Wir melden uns mit den nächsten Schritten. Bitte beachte: Personalisierte Artikel sind vom Widerrufsrecht ausgeschlossen; wir prüfen deinen Fall und geben dir Bescheid.',
  },
  en: {
    missing: 'Please enter your name, email address and order number.',
    invalid: 'Invalid request.',
    name: 'Name',
    email: 'Email',
    order: 'Order number',
    orderDate: 'Ordered on',
    items: 'Items',
    allItems: 'whole order',
    received: 'Received on',
    subject: 'Confirmation of receipt of your withdrawal ({order})',
    title: 'We’ve received your withdrawal',
    intro: 'We hereby confirm receipt of your notice of withdrawal:',
    statement: '“I hereby withdraw from my contract for the purchase of the goods listed above.”',
    next: 'We’ll get back to you with the next steps. Please note: personalised items are excluded from the right of withdrawal; we’ll look at your case and let you know.',
  },
};

function details(c: (typeof COPY)['de'], f: { name: string; email: string; order: string; orderDate: string; items: string; stamp: string }) {
  const row = (k: string, v: string) => `<tr><td style="padding:4px 12px 4px 0;color:#4E5870">${k}</td><td>${v}</td></tr>`;
  return `<table style="border-collapse:collapse">${row(c.name, escapeHtml(f.name))}${row(c.email, escapeHtml(f.email))}${row(c.order, escapeHtml(f.order))}${
    f.orderDate ? row(c.orderDate, escapeHtml(f.orderDate)) : ''
  }${row(c.items, escapeHtml(f.items || c.allItems))}${row(c.received, f.stamp)}</table>`;
}

export async function POST(req: Request) {
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const locale: Locale = isLocale(b?.locale) ? (b!.locale as Locale) : 'de';
  const c = COPY[locale];
  if (!b) return NextResponse.json({ error: c.invalid }, { status: 400 });

  const receivedAt = new Date();
  if (b.website) return NextResponse.json({ ok: true, stamp: formatDateTime(receivedAt, locale) }); // honeypot

  const name = String(b.name ?? '').trim().slice(0, 120);
  const email = String(b.email ?? '').trim().slice(0, 200);
  const order = String(b.order ?? '').trim().slice(0, 60);
  const items = String(b.items ?? '').trim().slice(0, 1000);
  const orderDate = String(b.orderDate ?? '').trim().slice(0, 40);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !order) return NextResponse.json({ error: c.missing }, { status: 400 });

  const stamp = formatDateTime(receivedAt, locale);
  const fields = { name, email, order, orderDate, items };

  await sendEmail(
    email,
    c.subject.replace('{order}', order),
    emailLayout(c.title, `<p>${c.intro}</p>${details(c, { ...fields, stamp })}<p>${c.statement}</p><p>${c.next}</p>`, locale),
  );
  if (env.ownerEmail) {
    // Owner notification always in English
    await sendEmail(
      env.ownerEmail,
      `[${brand.name}] Withdrawal ${order}`,
      emailLayout('New withdrawal', `<p>Customer language: ${locale.toUpperCase()}</p>${details(COPY.en, { ...fields, stamp: formatDateTime(receivedAt, 'en') })}`, 'en'),
      email,
    );
  }
  return NextResponse.json({ ok: true, receivedAt: receivedAt.toISOString(), stamp });
}
