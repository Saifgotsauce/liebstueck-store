'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useConsent } from '@/lib/consent';
import { captureSource, trackEvent } from '@/lib/analytics';

// Watches how people move through the shop: where they land, how far they scroll, how long they
// actually look at a page, what they click, which form fields they touch and where they leave.
// Runs only while ad/analytics tracking is allowed. Sends labels and counts, never typed values.

const SCROLL_STEPS = [25, 50, 75, 100];
const TIME_STEPS = [10, 30, 60, 120, 300];
const LANDED_KEY = 'seasoned-landed-v1';

function pageType(path: string) {
  const p = path.replace(/^\/de(?=\/|$)/, '') || '/';
  if (p === '/') return 'home';
  if (p.startsWith('/p/')) return 'product';
  if (p.startsWith('/shop')) return 'collection';
  if (p.startsWith('/pair/')) return 'ad_landing';
  if (p.startsWith('/cart') || p.startsWith('/warenkorb')) return 'cart';
  if (p.startsWith('/kasse')) return 'checkout';
  if (p.startsWith('/thanks') || p.startsWith('/danke')) return 'thanks';
  return 'info';
}

const clean = (s: string | null | undefined, max = 40) => (s ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

export default function BehaviorTracker() {
  const { marketing } = useConsent();
  const pathname = usePathname();
  const type = pageType(pathname);

  // Per page: landing, category, scroll depth, time on page, leaving
  useEffect(() => {
    if (!marketing) return;
    captureSource();

    try {
      if (!sessionStorage.getItem(LANDED_KEY)) {
        sessionStorage.setItem(LANDED_KEY, '1');
        trackEvent('LandingPage', { page: pathname, page_type: type });
      }
    } catch {
      /* ignore */
    }
    if (type === 'collection') trackEvent('ViewCategory', { category: pathname.split('/').filter(Boolean).pop() ?? 'all' });

    const fired = new Set<string>();
    let seconds = 0;
    let maxScroll = 0;
    let left = false;

    const timer = window.setInterval(() => {
      if (document.hidden) return; // only count time the page is actually on screen
      seconds += 1;
      if (TIME_STEPS.includes(seconds)) trackEvent('TimeOnPage', { seconds, page: pathname, page_type: type });
    }, 1000);

    const onScroll = () => {
      const doc = document.documentElement;
      const pct = ((window.scrollY + window.innerHeight) / Math.max(doc.scrollHeight, 1)) * 100;
      maxScroll = Math.max(maxScroll, Math.min(100, Math.round(pct)));
      for (const step of SCROLL_STEPS) {
        if (pct >= step - 1 && !fired.has(`s${step}`)) {
          fired.add(`s${step}`);
          trackEvent('ScrollDepth', { depth: step, page: pathname, page_type: type });
        }
      }
    };

    const leave = (exit: 'next_page' | 'closed_or_external') => {
      if (left) return;
      left = true;
      trackEvent('PageExit', { page: pathname, page_type: type, seconds, max_scroll: maxScroll, exit }, { beacon: true });
    };
    const onPageHide = () => leave('closed_or_external');

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pagehide', onPageHide);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pagehide', onPageHide);
      leave('next_page'); // the visitor moved on to another page of the shop
    };
  }, [marketing, pathname, type]);

  // Clicks on buttons, navigation, product links, plus which form fields get touched
  useEffect(() => {
    if (!marketing) return;
    const touched = new Set<string>();

    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest('a, button');
      if (!el) return;
      const href = el instanceof HTMLAnchorElement ? el.getAttribute('href') ?? '' : '';
      const product = href.match(/\/p\/([^/?#]+)/);
      if (product) {
        trackEvent('ProductClick', { product: product[1], from: type });
        return;
      }
      const kind = el.closest('footer') ? 'footer' : el.closest('header, nav') ? 'nav' : el.classList.contains('btn') ? 'cta' : null;
      if (!kind) return;
      trackEvent('UiClick', { kind, label: clean(el.getAttribute('data-track') || el.getAttribute('aria-label') || el.textContent), page: pathname, page_type: type });
    };

    const onFocus = (e: FocusEvent) => {
      const el = e.target as HTMLInputElement | null;
      if (!el || !/^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName) || el.type === 'password') return;
      const field = clean(el.id || el.name || el.getAttribute('aria-label'), 30);
      if (!field || touched.has(field)) return;
      touched.add(field);
      trackEvent('FieldFocus', { field, page: pathname, page_type: type });
    };

    document.addEventListener('click', onClick, true);
    document.addEventListener('focusin', onFocus);
    return () => {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('focusin', onFocus);
    };
  }, [marketing, pathname, type]);

  return null;
}
