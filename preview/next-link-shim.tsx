// Stand-in for next/link in the single-file preview: in-page navigation via #hash.
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { navigate, toHash } from './router';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: ReactNode };

export default function Link({ href, children, onClick, ...rest }: Props) {
  return (
    <a
      {...rest}
      href={toHash(href)}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey) return;
        e.preventDefault();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
}
