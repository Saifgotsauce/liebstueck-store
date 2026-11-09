import 'server-only';
import crypto from 'node:crypto';
import { siteUrl } from '../config';
import { buildPrintFileUrl, signPrintData } from '../print-sign';
import { requireEnv } from './env';
import type { StoredItem } from './order-items';

// Print files are rendered on demand at /api/print-file. The URL carries the design
// data and an HMAC signature, so only URLs this server created can be rendered.

export function printFileUrl(item: Omit<StoredItem, 's'>) {
  return buildPrintFileUrl(siteUrl, requireEnv('printFileSecret'), item);
}

export function verifyPrintParams(d: string, s: string): Omit<StoredItem, 's'> | null {
  const expected = signPrintData(d, requireEnv('printFileSecret'));
  const a = Buffer.from(expected);
  const b = Buffer.from(s);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(d, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}
