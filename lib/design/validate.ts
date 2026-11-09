import { unsupportedChars } from './text';
import type { DesignTemplate, FieldValues } from './types';
import { fmt, type Locale } from '../i18n';

// Letters (incl. accents/umlauts), digits, spaces and a little punctuation.
const ALLOWED = /^[\p{L}\p{M}0-9 .,'’&\-]*$/u;

const MSG = {
  de: {
    maxChars: 'Maximal {n} Zeichen.',
    badChars: "Bitte nur Buchstaben, Zahlen, Leerzeichen und - . , ' & verwenden.",
    unsupported: 'Diese Zeichen können wir leider nicht drucken: {chars}',
    oneName: 'Bitte mindestens einen Namen eingeben.',
    minNames: 'Bitte mindestens {n} Namen eingeben.',
    maxNames: 'Maximal {n} Namen.',
    option: 'Bitte eine Option wählen.',
    yearRequired: 'Bitte ein Jahr eingeben.',
    yearRange: 'Bitte ein Jahr zwischen {min} und {max} eingeben.',
    required: 'Bitte ausfüllen.',
  },
  en: {
    maxChars: 'Maximum {n} characters.',
    badChars: "Please only use letters, numbers, spaces and - . , ' &",
    unsupported: 'We can’t print these characters: {chars}',
    oneName: 'Please enter at least one name.',
    minNames: 'Please enter at least {n} names.',
    maxNames: 'Maximum {n} names.',
    option: 'Please choose an option.',
    yearRequired: 'Please enter a year.',
    yearRange: 'Please enter a year between {min} and {max}.',
    required: 'Please fill this in.',
  },
};

export type ValidationResult =
  | { ok: true; values: FieldValues }
  /** `missing` lists fields that are only empty (shown after "add to cart"), not wrong. */
  | { ok: false; values: FieldValues; errors: Record<string, string>; missing: string[] };

const clean = (s: unknown) =>
  String(s ?? '')
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .trim();

/** Cleans and validates customer input against a template's field definitions. */
export function validateValues(t: DesignTemplate, raw: unknown, locale: Locale = 'de'): ValidationResult {
  const m = MSG[locale];
  const input = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const values: FieldValues = {};
  const errors: Record<string, string> = {};
  const missing: string[] = [];

  const checkText = (s: string, maxLength: number): string | null => {
    if (Array.from(s).length > maxLength) return fmt(m.maxChars, { n: maxLength });
    if (!ALLOWED.test(s)) return m.badChars;
    const bad = unsupportedChars(s);
    if (bad.length) return fmt(m.unsupported, { chars: bad.join(' ') });
    return null;
  };

  for (const f of t.fields) {
    const v = input[f.key];
    if (f.type === 'names') {
      const arr = (Array.isArray(v) ? v : []).map(clean).filter(Boolean);
      if (arr.length < f.min) {
        errors[f.key] = f.min === 1 ? m.oneName : fmt(m.minNames, { n: f.min });
        missing.push(f.key);
      } else if (arr.length > f.max) errors[f.key] = fmt(m.maxNames, { n: f.max });
      else {
        for (const n of arr) {
          const e = checkText(n, f.maxLength);
          if (e) {
            errors[f.key] = `„${n}“: ${e}`;
            break;
          }
        }
      }
      values[f.key] = arr;
    } else if (f.type === 'select') {
      const s = clean(v) || f.default;
      if (!f.options.some((o) => o.value === s)) errors[f.key] = m.option;
      values[f.key] = s;
    } else if (f.type === 'year') {
      const s = clean(v);
      if (!s) {
        if (f.required) {
          errors[f.key] = m.yearRequired;
          missing.push(f.key);
        }
      } else if (!/^\d{4}$/.test(s) || +s < f.min || +s > f.max) {
        errors[f.key] = fmt(m.yearRange, { min: f.min, max: f.max });
      }
      values[f.key] = s;
    } else {
      const s = clean(v);
      if (!s && f.required) {
        errors[f.key] = m.required;
        missing.push(f.key);
      } else if (s) {
        const e = checkText(s, f.maxLength);
        if (e) errors[f.key] = e;
      }
      values[f.key] = s;
    }
  }
  return Object.keys(errors).length ? { ok: false, values, errors, missing } : { ok: true, values };
}
