'use client';

import { useEffect, useState } from 'react';
import type { CodeInfo } from './referral';

// The friend/reward code a shopper has applied, kept in this browser until checkout.
const KEY = 'seasoned-code-v1';
const EVENT = 'seasoned-code';

export function readCode(): CodeInfo | null {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || 'null') as CodeInfo | null;
    return v?.code ? v : null;
  } catch {
    return null;
  }
}

export function saveCode(c: CodeInfo | null) {
  try {
    if (c) localStorage.setItem(KEY, JSON.stringify(c));
    else localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* private mode: the code just won't be remembered */
  }
}

export async function checkCode(raw: string): Promise<{ info?: CodeInfo; error?: string }> {
  try {
    const res = await fetch(`/api/referral?code=${encodeURIComponent(raw.trim())}`);
    const d = (await res.json().catch(() => ({}))) as { valid?: boolean; code?: string; kind?: CodeInfo['kind']; cents?: number; name?: string; error?: string };
    if (d.valid && d.code && d.kind && d.cents) return { info: { code: d.code, kind: d.kind, cents: d.cents, name: d.name } };
    return { error: d.error || 'That code doesn’t work. Check the spelling. Reward codes only work once.' };
  } catch {
    return { error: 'We couldn’t check that code just now. Please try again.' };
  }
}

export function useAppliedCode() {
  const [code, setCode] = useState<CodeInfo | null>(null);
  useEffect(() => {
    const sync = () => setCode(readCode());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return code;
}
