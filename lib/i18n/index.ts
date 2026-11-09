// Languages: German (default, the target market) and English.
// UI strings live in ./messages.ts; product texts sit next to the products as { de, en }.
import { messages, type MsgKey } from './messages';

export type Locale = 'de' | 'en';
export const LOCALES: Locale[] = ['de', 'en'];
export const DEFAULT_LOCALE: Locale = 'de';

/** A value in both languages. */
export type L<T = string> = { de: T; en: T };

export const loc = <T,>(v: L<T>, l: Locale): T => v[l] ?? v.de;

export function isLocale(v: unknown): v is Locale {
  return v === 'de' || v === 'en';
}

export function fmt(s: string, p?: Record<string, string | number>) {
  return p ? s.replace(/\{(\w+)\}/g, (_, k) => String(p[k] ?? '')) : s;
}

export function translate(l: Locale, key: MsgKey, p?: Record<string, string | number>) {
  return fmt(messages[l][key] ?? messages.de[key], p);
}

const NUMBER_LOCALE: Record<Locale, string> = { de: 'de-DE', en: 'en-IE' };

export function formatPrice(cents: number, l: Locale = DEFAULT_LOCALE) {
  return new Intl.NumberFormat(NUMBER_LOCALE[l], { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

export function formatDateTime(d: Date, l: Locale) {
  return new Intl.DateTimeFormat(NUMBER_LOCALE[l], { dateStyle: 'long', timeStyle: 'medium', timeZone: 'Europe/Berlin' }).format(d);
}

export type { MsgKey };
