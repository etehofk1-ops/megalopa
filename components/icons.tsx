type IconProps = { className?: string };

export function CrabMark({ className = "" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M8 18c0-4.4 3.6-8 8-8s8 3.6 8 8v1.5c0 2.5-2 4.5-4.5 4.5h-7C10 24 8 22 8 19.5V18Z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M11 10 7 6M21 10l4-4M9 15H4M23 15h5M12 18h.01M20 18h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function ShieldIcon({ className = "" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3 5 5.8v5.4c0 4.4 2.8 8.3 7 9.8 4.2-1.5 7-5.4 7-9.8V5.8L12 3Z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8.5 12.1 11 14.6l4.8-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function NodeIcon({ className = "" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="6" cy="12" r="2.8" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="18" cy="6" r="2.8" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="18" cy="18" r="2.8" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8.5 10.8 15.4 7.2M8.5 13.2l6.9 3.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
