import { brand } from '@/lib/config';

/** Wordmark: the name in Fraunces with a red full stop – "Seasoned." */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`font-display text-[1.75rem] font-black leading-none tracking-tight ${className}`}>
      {brand.name}
      <span className="text-red">.</span>
    </span>
  );
}
