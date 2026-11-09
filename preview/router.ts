// Tiny hash router for the single-file preview (artifact pages only keep a plain #name).
type Route = { name: string; query: string };
let listeners: ((r: Route) => void)[] = [];
let current: Route = { name: 'start', query: '' };

export function toHash(href: string) {
  const [path] = href.split('?');
  const parts = path.split('/').filter(Boolean);
  const name = parts[0] === 'produkt' ? parts[1] : parts[0] || 'start';
  return `#${name}`;
}

export function navigate(href: string) {
  const [, q = ''] = href.split('?');
  current = { name: toHash(href).slice(1), query: q ? `?${q}` : '' };
  try {
    history.replaceState(null, '', `#${current.name}`);
  } catch {
    location.hash = current.name;
  }
  listeners.forEach((l) => l(current));
  window.scrollTo(0, 0);
}

export function initialRoute(): Route {
  current = { name: (location.hash || '#start').slice(1) || 'start', query: '' };
  return current;
}

export function subscribe(l: (r: Route) => void) {
  listeners.push(l);
  const onHash = () => {
    current = { name: (location.hash || '#start').slice(1), query: '' };
    l(current);
  };
  window.addEventListener('hashchange', onHash);
  return () => {
    listeners = listeners.filter((x) => x !== l);
    window.removeEventListener('hashchange', onHash);
  };
}
