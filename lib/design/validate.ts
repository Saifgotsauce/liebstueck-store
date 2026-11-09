import { unsupportedChars } from './text';
import type { DesignTemplate, FieldValues } from './types';

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
export function validateValues(t: DesignTemplate, raw: unknown): ValidationResult {
  const input = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const values: FieldValues = {};
  const errors: Record<string, string> = {};
  const missing: string[] = [];

  const checkText = (s: string, maxLength: number): string | null => {
    if (Array.from(s).length > maxLength) return `Maximum ${maxLength} characters.`;
    if (!ALLOWED.test(s)) return "Please only use letters, numbers, spaces and - . , ' & ! ?";
    const bad = unsupportedChars(s, t.fonts);
    if (bad.length) return `We can’t print these characters: ${bad.join(' ')}`;
    return null;
  };

  for (const f of t.fields) {
    const v = input[f.key];
    if (f.type === 'names') {
      const arr = (Array.isArray(v) ? v : []).map(clean).filter(Boolean);
      if (arr.length < f.min) {
        errors[f.key] = f.min === 1 ? 'Please enter at least one name.' : `Please enter at least ${f.min} names.`;
        missing.push(f.key);
      } else if (arr.length > f.max) errors[f.key] = `Maximum ${f.max} names.`;
      else {
        for (const n of arr) {
          const e = checkText(n, f.maxLength);
          if (e) {
            errors[f.key] = `“${n}”: ${e}`;
            break;
          }
        }
      }
      values[f.key] = arr;
    } else if (f.type === 'select') {
      const s = clean(v) || f.default;
      if (!f.options.some((o) => o.value === s)) errors[f.key] = 'Please choose an option.';
      values[f.key] = s;
    } else if (f.type === 'year' || f.type === 'number') {
      const s = clean(v);
      const pattern = f.type === 'year' ? /^\d{4}$/ : /^\d{1,3}$/;
      if (!s) {
        if (f.required) {
          errors[f.key] = f.type === 'year' ? 'Please enter a year.' : 'Please enter a number.';
          missing.push(f.key);
        }
      } else if (!pattern.test(s) || +s < f.min || +s > f.max) {
        errors[f.key] = `Please enter a ${f.type === 'year' ? 'year' : 'number'} between ${f.min} and ${f.max}.`;
      }
      values[f.key] = s;
    } else {
      const s = clean(v);
      if (!s && f.required) {
        errors[f.key] = 'Please fill this in.';
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
