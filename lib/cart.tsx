'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { GARMENTS, type GarmentKey } from './catalog';
import { stores } from './config';
import type { Locale } from './locale';
import { getDesign } from './designs';
import { cartTotals } from './cart-math';
import type { FieldValues } from './design/types';

export type CartItem = {
  id: string;
  design: string;
  garment: GarmentKey;
  color: string;
  size: string;
  values: FieldValues;
  qty: number;
};

type CartCtx = {
  items: CartItem[];
  ready: boolean;
  totals: ReturnType<typeof cartTotals>;
  open: boolean;
  setOpen: (o: boolean) => void;
  add: (item: Omit<CartItem, 'id'>) => void;
  setQty: (id: string, qty: number) => void;
  /** Change a line's size, colour, style or printed text; merges into an identical line if there is one. */
  update: (id: string, patch: Partial<Omit<CartItem, 'id' | 'design'>>) => void;
  remove: (id: string) => void;
  clear: () => void;
};

// one cart per store: US and German shirts never end up in the same order
const KEYS: Record<Locale, string> = { en: 'seasoned-cart-v1', de: 'seasoned-de-cart-v1' };
const Ctx = createContext<CartCtx | null>(null);

type Line = Omit<CartItem, 'id'>;
/** Same design with the same options: one line in the cart. */
const sameLine = (a: Line, b: Line) => a.design === b.design && a.garment === b.garment && a.color === b.color && a.size === b.size && JSON.stringify(a.values) === JSON.stringify(b.values);

export function CartProvider({ children, locale = 'en' }: { children: ReactNode; locale?: Locale }) {
  const KEY = KEYS[locale];
  const shop = stores[locale];
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        setItems(parsed.filter((i) => (getDesign(i.design)?.locale ?? 'en') === locale && GARMENTS[i.garment]));
      }
    } catch {
      /* storage unavailable – the cart lives in memory only */
    }
    setReady(true);
  }, [KEY, locale]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, ready, KEY]);

  const add = useCallback((item: Omit<CartItem, 'id'>) => {
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now() + Math.random());
    setItems((prev) => {
      // same design + options → just bump the quantity
      const same = prev.find((p) => sameLine(p, item));
      if (same) return prev.map((p) => (p === same ? { ...p, qty: Math.min(shop.maxQuantityPerItem, p.qty + item.qty) } : p));
      return [...prev, { ...item, id }].slice(0, shop.maxItemsPerOrder);
    });
  }, [shop]);
  const setQty = useCallback(
    (id: string, qty: number) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(shop.maxQuantityPerItem, qty)) } : i))),
    [shop],
  );
  const update = useCallback(
    (id: string, patch: Partial<Omit<CartItem, 'id' | 'design'>>) =>
      setItems((prev) => {
        const cur = prev.find((i) => i.id === id);
        if (!cur) return prev;
        const changed = { ...cur, ...patch };
        // The change made it identical to another line (e.g. both now XL): keep one line, add the quantities
        const twin = prev.find((i) => i.id !== id && sameLine(i, changed));
        if (twin) return prev.filter((i) => i.id !== id).map((i) => (i === twin ? { ...i, qty: Math.min(shop.maxQuantityPerItem, i.qty + changed.qty) } : i));
        return prev.map((i) => (i.id === id ? changed : i));
      }),
    [shop],
  );
  const remove = useCallback((id: string) => setItems((prev) => prev.filter((i) => i.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({ items, ready, totals: cartTotals(items, locale), open, setOpen, add, setQty, update, remove, clear }),
    [items, ready, open, add, setQty, update, remove, clear, locale],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCart must be used inside CartProvider');
  return c;
}
