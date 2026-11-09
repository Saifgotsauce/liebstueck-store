import { NextResponse } from 'next/server';
import { brand } from '@/lib/config';
import { emailLayout, escapeHtml, sendEmail } from '@/lib/server/email';
import { env } from '@/lib/server/env';

export const runtime = 'nodejs';

// Elektronische Widerrufsfunktion (§ 356a BGB): the customer declares withdrawal online and
// immediately gets a confirmation of receipt with the content, date and time.

const stampOf = (d: Date) => d.toLocaleString('de-DE', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Berlin' }) + ' Uhr';

function table(f: { name: string; email: string; order: string; items: string; stamp: string }) {
  const row = (k: string, v: string) => `<tr><td style="padding:4px 12px 4px 0;color:#5E5468">${k}</td><td>${v}</td></tr>`;
  return `<table style="border-collapse:collapse">${row('Name', escapeHtml(f.name))}${row('E-Mail', escapeHtml(f.email))}${row('Bestellnummer', escapeHtml(f.order))}${row(
    'Artikel',
    escapeHtml(f.items || 'gesamte Bestellung'),
  )}${row('Eingegangen am', f.stamp)}</table>`;
}

export async function POST(req: Request) {
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!b) return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 });
  const receivedAt = new Date();
  const stamp = stampOf(receivedAt);
  if (b.website) return NextResponse.json({ ok: true, stamp }); // honeypot – bots

  const name = String(b.name ?? '').trim().slice(0, 120);
  const email = String(b.email ?? '').trim().slice(0, 200);
  const order = String(b.order ?? '').trim().slice(0, 60);
  const items = String(b.items ?? '').trim().slice(0, 1000);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !order) {
    return NextResponse.json({ error: 'Bitte Name, E-Mail-Adresse und Bestellnummer angeben.' }, { status: 400 });
  }
  const f = { name, email, order, items, stamp };

  await sendEmail(
    email,
    `Eingangsbestätigung deines Widerrufs (${order})`,
    emailLayout(
      'Wir haben deinen Widerruf erhalten',
      `<p>Hiermit bestätigen wir den Eingang deiner Widerrufserklärung:</p>${table(f)}
<p>„Hiermit widerrufe ich den von mir abgeschlossenen Vertrag über den Kauf der oben genannten Waren.“</p>
<p>Wir melden uns mit den nächsten Schritten zur Rücksendung und Erstattung. Bitte beachte: Personalisierte Artikel sind vom Widerrufsrecht ausgeschlossen – wir prüfen deine Bestellung und geben dir Bescheid.</p>`,
      'de',
    ),
  );
  if (env.ownerEmail) {
    await sendEmail(env.ownerEmail, `[${brand.name}] Withdrawal (Germany) ${order}`, emailLayout('New withdrawal (German store)', table(f)), email);
  }
  return NextResponse.json({ ok: true, receivedAt: receivedAt.toISOString(), stamp });
}
