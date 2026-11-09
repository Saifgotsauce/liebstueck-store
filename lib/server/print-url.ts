import 'server-only';
import crypto from 'node:crypto';
import { siteUrl } from '../config';
import type { GarmentKey } from '../catalog';
import { buildPrintFileUrl, signPrintData, type PrintPayload } from '../print-sign';
import { requireEnv } from './env';

// Print files are rendered on demand at /api/print-file. The URL carries the design
// data and an HMAC signature, so only URLs this server created can be rendered.

/** p = design slug, g = garment, c = colour key, v = personalisation values */
export type PrintData = Omit<PrintPayload, 'g'> & { g: GarmentKey };

export function printFileUrl(item: PrintData) {
  return buildPrintFileUrl(siteUrl, requireEnv('printFileSecret'), item);
}

export function verifyPrintParams(d: string, s: string): PrintData | null {
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
