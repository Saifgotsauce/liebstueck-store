'use client';

import { useEffect, useState } from 'react';
import NotFoundContent from './NotFoundContent';
import StoreShell from './StoreShell';

/**
 * "Page not found" for links that match no page at all. Next sends every one of those to the single
 * root not-found page and doesn't tell the server which address was asked for, so the page starts
 * as the US store and switches to the German one in the browser when the address begins with /de.
 */
export default function NotFoundShell() {
  const [de, setDe] = useState(false);
  useEffect(() => setDe(window.location.pathname.startsWith('/de')), []);
  return (
    <StoreShell locale={de ? 'de' : 'en'}>
      <NotFoundContent de={de} />
    </StoreShell>
  );
}
