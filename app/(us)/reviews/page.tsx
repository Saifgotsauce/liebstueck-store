import type { Metadata } from 'next';
import Link from 'next/link';
import { Stars } from '@/components/Icons';
import { ReviewCard } from '@/components/Reviews';
import { getDesign } from '@/lib/designs';
import { ROUTES } from '@/lib/locale';
import { allReviews, summarize } from '@/lib/server/reviews';

// Reviews refresh the moment one is posted (cache tag); this is the backstop.
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Reviews from real customers',
  description: 'What women who bought a Seasoned shirt say about it. Every review is from a customer, unedited, good or bad.',
  alternates: { canonical: '/reviews/' },
};

export default async function ReviewsPage() {
  const reviews = (await allReviews('en')).map((r) => ({ ...r, designTitle: r.design ? getDesign(r.design)?.title : undefined }));
  const rating = summarize(reviews);
  const withPhotos = reviews.filter((r) => r.photo).length;

  return (
    <>
      <section className="bg-lilac">
        <div className="wrap max-w-3xl py-12">
          <h1 className="text-[2.9rem] leading-[1.02] sm:text-[3.6rem]">What our customers say</h1>
          {rating ? (
            <p className="mt-4 flex flex-wrap items-center gap-2 text-[1.2rem]">
              <Stars value={rating.average} className="text-[#E8A317]" />
              <span className="font-bold">{rating.average.toFixed(1)} out of 5</span>
              <span className="text-ink-soft">
                · {rating.count} review{rating.count === 1 ? '' : 's'}
                {withPhotos ? `, ${withPhotos} with photos` : ''}
              </span>
            </p>
          ) : (
            <p className="mt-4 text-[1.2rem]">We’re a new shop, so the first reviews are on their way.</p>
          )}
          <p className="mt-4 text-[1.1rem] leading-relaxed">
            Every review here was written by someone who bought from us. We don’t edit them and we don’t hide the bad ones. Bought a shirt? Go to its page and tell
            the next woman what you think.
          </p>
        </div>
      </section>

      <section className="wrap max-w-5xl py-12" aria-label="Reviews">
        {reviews.length > 0 ? (
          <ul className="grid gap-4 md:grid-cols-2">
            {reviews.map((r) => (
              <ReviewCard key={r.id} r={r} showDesign />
            ))}
          </ul>
        ) : (
          <p>No reviews yet.</p>
        )}
        <p className="mt-10">
          <Link href={ROUTES.en.shop} className="btn btn-violet">
            See all shirts
          </Link>
        </p>
      </section>
    </>
  );
}
