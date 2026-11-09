'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { GARMENTS, getProduct } from './catalog';
import { shop } from './config';
import { itemPriceCents, shippingFor } from './cart-math';
import type { FieldValues } from './design/types';

export type CartItem = {
  id: string;
  productSlug: string;
  garment: 'tee' | 'hoodie';
  color: string;
  size: string;
  values: FieldValues;
  qty: number;
};

type CartCtx = {
  items: CartItem[];
  ready: boolean;
  count: number;
  subtotalCents: number;
  shippingCents: number;
  add: (item: Omit<CartItem, 'id'>) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const KEY = 'liebstueck-cart-v1';
const Ctx = createContext<CartCtx | null>(null);

export { itemPriceCents, shippingFor };

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        setItems(parsed.filter((i) => getProduct(i.productSlug) && GARMENTS[i.garment]));
      }
    } catch {
      /* storage unavailable – cart lives in memory only */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, ready]);

  const add = useCallback((item: Omit<CartItem, 'id'>) => {
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now() + Math.random());
    setItems((prev) => [...prev, { ...item, id }].slice(0, shop.maxItemsPerOrder));
  }, []);
  const setQty = useCallback(
    (id: string, qty: number) =>
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(shop.maxQuantityPerItem, qty)) } : i))),
    [],
  );
  const remove = useCallback((id: string) => setItems((prev) => prev.filter((i) => i.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const subtotalCents = items.reduce((s, i) => s + itemPriceCents(i) * i.qty, 0);
    return {
      items,
      ready,
      count: items.reduce((s, i) => s + i.qty, 0),
      subtotalCents,
      shippingCents: shippingFor(subtotalCents),
      add,
      setQty,
      remove,
      clear,
    };
  }, [items, ready, add, setQty, remove, clear]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCart must be used inside CartProvider');
  return c;
}
