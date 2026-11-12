import Link from 'next/link';

/** "Page not found", in the store's own language and inside its header, cart and footer. */
export default function NotFoundContent({ de = false }: { de?: boolean }) {
  return (
    <div className="wrap max-w-2xl pb-20 pt-16 text-center sm:pt-20">
      <h1 className="text-[2.2rem] leading-tight sm:text-[2.6rem]">{de ? 'Diese Seite gibt es nicht mehr.' : 'This page retired early.'}</h1>
      <p className="mt-4 text-lg text-ink-soft">
        {de ? 'Der Link ist alt oder vertippt. Die Shirts sind alle noch da.' : 'The link may be old or mistyped. The shirts are all still here.'}
      </p>
      <p className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={de ? '/de/shop/' : '/shop/'} className="btn btn-red">
          {de ? 'Alle Shirts ansehen' : 'Shop all shirts'}
        </Link>
        <Link href={de ? '/de/' : '/'} className="btn btn-line">
          {de ? 'Zur Startseite' : 'Back to the home page'}
        </Link>
      </p>
    </div>
  );
}
