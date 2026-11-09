import 'server-only';
import crypto from 'node:crypto';
import { siteUrl } from '../config';
import { requireEnv } from './env';
import type { StoredItem } from './order-items';

// Print files are rendered on demand at /api/print-file. The URL carries the design
// data and an HMAC signature, so only URLs this server created can be rendered.

const b64url = (b: Buffer) => b.toString('base64url');

function sign(data: string) {
  return crypto.createHmac('sha256', requireEnv('printFileSecret')).update(data).digest('base64url').slice(0, 32);
}

export function printFileUrl(item: Omit<StoredItem, 's'>) {
  const d = b64url(Buffer.from(JSON.stringify({ p: item.p, g: item.g, c: item.c, v: item.v })));
  return `${siteUrl}/api/print-file?d=${d}&s=${sign(d)}`;
}

export function verifyPrintParams(d: string, s: string): Omit<StoredItem, 's'> | null {
  const expected = sign(d);
  const a = Buffer.from(expected);
  const b = Buffer.from(s);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(d, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}
