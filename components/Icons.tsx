// Small line icons for the product page. 24×24, drawn with currentColor.
type P = { className?: string };
const base = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };

export const IconCheck = ({ className }: P) => (
  <svg {...base} strokeWidth={3} className={className}>
    <path d="M5 12.5l4.2 4.2L19 7" />
  </svg>
);
export const IconShirt = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M8.5 3.5c.8 1.4 2 2.1 3.5 2.1s2.7-.7 3.5-2.1l5 2.3-1.9 4.4-2.4-1v11.3H7.8V9.2l-2.4 1-1.9-4.4z" />
  </svg>
);
export const IconFeather = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M20 4c-6 0-11 4.5-11 11v5" />
    <path d="M9 15c4.5 0 8.5-3 10-8" />
    <path d="M9 11.5c2.2-.2 4.2-1 5.8-2.4" />
  </svg>
);
export const IconBrush = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M14.5 4.5l5 5-7.5 7.5-5-5z" />
    <path d="M7 12l-2.6 2.6a2.4 2.4 0 000 3.4l1.6 1.6a2.4 2.4 0 003.4 0L12 17" />
  </svg>
);
export const IconWash = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M3.5 7l2 12.5h13L20.5 7" />
    <path d="M3.5 10.5c1.4 0 1.4 1 2.8 1s1.4-1 2.8-1 1.4 1 2.9 1 1.4-1 2.8-1 1.4 1 2.8 1 1.5-1 2.9-1" />
  </svg>
);
export const IconLock = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="5" y="10.5" width="14" height="10" rx="2" />
    <path d="M8 10.5V8a4 4 0 018 0v2.5" />
  </svg>
);
export const IconTruck = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M2.5 6.5h11v10h-11z" />
    <path d="M13.5 10h4l3 3.2v3.3h-7" />
    <circle cx="6.5" cy="17.5" r="1.8" fill="#fff" />
    <circle cx="17" cy="17.5" r="1.8" fill="#fff" />
  </svg>
);
export const IconShield = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M12 3l7.5 3v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6z" />
    <path d="M8.8 12.2l2.3 2.3 4.2-4.4" />
  </svg>
);
export const IconGift = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="3.5" y="8.5" width="17" height="4" rx="1" />
    <path d="M5 12.5v8h14v-8M12 8.5v12" />
    <path d="M12 8.5C10.5 5 7 4.5 7 6.6 7 8.2 9.5 8.5 12 8.5zM12 8.5c1.5-3.5 5-4 5-1.9 0 1.6-2.5 1.9-5 1.9z" />
  </svg>
);
export const IconCalendar = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
    <path d="M3.5 9.5h17M8 3v4M16 3v4" />
  </svg>
);

export const IconChat = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M4.5 5.5h15a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H10l-4.5 3.5V16.5h-1a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z" />
    <path d="M8 10h8M8 13h5" />
  </svg>
);

/** Five stars filled to `value` (0–5). Decorative – always pair with the number in text. */
export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={`inline-flex ${className ?? ''}`} aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <svg key={i} width="18" height="18" viewBox="0 0 24 24">
            <defs>
              <linearGradient id={`st${i}-${Math.round(fill * 100)}`}>
                <stop offset={fill} stopColor="currentColor" />
                <stop offset={fill} stopColor="#DCCFEA" />
              </linearGradient>
            </defs>
            <path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" fill={`url(#st${i}-${Math.round(fill * 100)})`} />
          </svg>
        );
      })}
    </span>
  );
}
