// Signing for print-file URLs. Shared by the server (lib/server/print-url.ts) and the
// Printful sync script, which needs the same URLs for the mockup generator.
import crypto from 'node:crypto';

export type PrintPayload = { p: string; g: string; c: string; v: Record<string, string | string[]> };

export function signPrintData(data: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(data).digest('base64url').slice(0, 32);
}

export function buildPrintFileUrl(siteUrl: string, secret: string, item: PrintPayload) {
  const d = Buffer.from(JSON.stringify({ p: item.p, g: item.g, c: item.c, v: item.v })).toString('base64url');
  return `${siteUrl.replace(/\/$/, '')}/api/print-file?d=${d}&s=${signPrintData(d, secret)}`;
}
