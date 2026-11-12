import NotFoundShell from '@/components/NotFoundShell';

// A link that matches no page (an old ad link, a typo, a shirt we no longer sell). Shown inside the
// right store, with header, cart and footer, so the visitor can carry on shopping. It used to be a
// bare page with a German-shop button for everyone.
export default function NotFound() {
  return <NotFoundShell />;
}
