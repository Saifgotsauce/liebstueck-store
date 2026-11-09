import { unsupportedChars } from './text';
import type { DesignTemplate, FieldValues } from './types';
import type { Locale } from '../locale';

const MSG = {
  en: {
    max: (n: number) => `Maximum ${n} characters.`,
    allowed: "Please only use letters, numbers, spaces and - . , ' & ! ?",
    cantPrint: (c: string) => `We can’t print these characters: ${c}`,
    oneName: 'Please enter at least one name.',
    minNames: (n: number) => `Please enter at least ${n} names.`,
    maxNames: (n: number) => `Maximum ${n} names.`,
    option: 'Please choose an option.',
    year: 'Please enter a year.',
    number: 'Please enter a number.',
    range: (year: boolean, a: number, b: number) => `Please enter a ${year ? 'year' : 'number'} between ${a} and ${b}.`,
    fill: 'Please fill this in.',
  },
  de: {
    max: (n: number) => `Höchstens ${n} Zeichen.`,
    allowed: "Bitte nur Buchstaben, Zahlen, Leerzeichen und - . , ' & ! ? verwenden.",
    cantPrint: (c: string) => `Diese Zeichen können wir nicht drucken: ${c}`,
    oneName: 'Bitte gib mindestens einen Namen ein.',
    minNames: (n: number) => `Bitte gib mindestens ${n} Namen ein.`,
    maxNames: (n: number) => `Höchstens ${n} Namen.`,
    option: 'Bitte wähle eine Option.',
    year: 'Bitte gib eine Jahreszahl ein.',
    number: 'Bitte gib eine Zahl ein.',
    range: (year: boolean, a: number, b: number) => `Bitte gib ${year ? 'eine Jahreszahl' : 'eine Zahl'} zwischen ${a} und ${b} ein.`,
    fill: 'Bitte ausfüllen.',
  },
};

// Letters (incl. accents), digits, spaces and a little punctuation.
const ALLOWED = /^[\p{L}\p{M}0-9 .,'’&!?\-]*$/u;

export type ValidationResult =
  | { ok: true; values: FieldValues }
  /** `missing` lists fields that are only empty (shown after "add to cart"), not wrong. */
  | { ok: false; values: FieldValues; errors: Record<string, string>; missing: string[] };

const clean = (s: unknown) =>
  String(s ?? '')
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .trim();

/** Cleans and validates customer input against a design's personalisation fields. */
export function validateValues(t: DesignTemplate, raw: unknown, locale: Locale = 'en'): ValidationResult {
  const m = MSG[locale];
  const input = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const values: FieldValues = {};
  const errors: Record<string, string> = {};
  const missing: string[] = [];

  const checkText = (s: string, maxLength: number): string | null => {
    if (Array.from(s).length > maxLength) return m.max(maxLength);
    if (!ALLOWED.test(s)) return m.allowed;
    const bad = unsupportedChars(s, t.fonts);
    if (bad.length) return m.cantPrint(bad.join(' '));
    return null;
  };

  for (const f of t.fields) {
    const v = input[f.key];
    if (f.type === 'names') {
      const arr = (Array.isArray(v) ? v : []).map(clean).filter(Boolean);
      if (arr.length < f.min) {
        errors[f.key] = f.min === 1 ? m.oneName : m.minNames(f.min);
        missing.push(f.key);
      } else if (arr.length > f.max) errors[f.key] = m.maxNames(f.max);
      else {
        for (const n of arr) {
          const e = checkText(n, f.maxLength);
          if (e) {
            errors[f.key] = locale === 'de' ? `„${n}“: ${e}` : `“${n}”: ${e}`;
            break;
          }
        }
      }
      values[f.key] = arr;
    } else if (f.type === 'select') {
      const s = clean(v) || f.default;
      if (!f.options.some((o) => o.value === s)) errors[f.key] = m.option;
      values[f.key] = s;
    } else if (f.type === 'year' || f.type === 'number') {
      const s = clean(v);
      const pattern = f.type === 'year' ? /^\d{4}$/ : /^\d{1,3}$/;
      if (!s) {
        if (f.required) {
          errors[f.key] = f.type === 'year' ? m.year : m.number;
          missing.push(f.key);
        }
      } else if (!pattern.test(s) || +s < f.min || +s > f.max) {
        errors[f.key] = m.range(f.type === 'year', f.min, f.max);
      }
      values[f.key] = s;
    } else {
      const s = clean(v);
      if (!s && f.required) {
        errors[f.key] = m.fill;
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
