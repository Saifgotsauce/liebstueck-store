import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="wrap max-w-2xl pt-20 text-center">
      <h1 className="text-[2.6rem]">This page retired early.</h1>
      <p className="mt-4 text-lg text-ink-soft">The link may be old or mistyped. The shirts are all still here.</p>
      <Link href="/shop/" className="btn btn-red mt-8">Shop all shirts</Link>
    </div>
  );
}
