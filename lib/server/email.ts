import 'server-only';
import { brand } from '../config';
import { env } from './env';
import type { Locale } from '../i18n';

// Transactional email via Resend (https://resend.com). Without RESEND_API_KEY emails
// are only logged, so the shop still works while you set things up.

export async function sendEmail(to: string, subject: string, html: string, replyTo?: string) {
  if (!env.resendApiKey || !env.emailFrom) {
    console.log(`[email skipped – RESEND_API_KEY/EMAIL_FROM missing] to=${to} subject=${subject}`);
    return false;
  }
  const res = await fetch(`${process.env.RESEND_API_BASE || 'https://api.resend.com'}/emails`, { // base override only for local tests
    method: 'POST',
    headers: { Authorization: `Bearer ${env.resendApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.emailFrom, to: [to], subject, html, reply_to: replyTo ?? brand.email }),
  });
  if (!res.ok) {
    console.error('Resend error', res.status, await res.text().catch(() => ''));
    return false;
  }
  return true;
}

export const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Simple, readable email layout. */
export function emailLayout(title: string, body: string, locale: Locale = 'de') {
  const footer =
    locale === 'en'
      ? `Questions? Just reply to this email or write to ${escapeHtml(brand.email)}.`
      : `Fragen? Antworte einfach auf diese E-Mail oder schreib an ${escapeHtml(brand.email)}.`;
  return `<!doctype html><html lang="${locale}"><body style="margin:0;background:#E9EEFA;font-family:Arial,Helvetica,sans-serif;color:#16213A">
<div style="max-width:560px;margin:0 auto;padding:24px">
<p style="font-family:Georgia,serif;font-size:24px;margin:0 0 16px">${escapeHtml(brand.name)} <span style="color:#C8382D">&#9829;</span></p>
<div style="background:#fff;border-radius:14px;padding:24px;font-size:16px;line-height:1.55">
<h1 style="font-family:Georgia,serif;font-weight:400;font-size:24px;margin:0 0 12px">${escapeHtml(title)}</h1>
${body}
</div>
<p style="font-size:13px;color:#4E5870;margin-top:16px">${footer}</p>
</div></body></html>`;
}
