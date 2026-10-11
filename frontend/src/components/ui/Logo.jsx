const MARK_PATHS = [
  "M7.65,76.03h0c-2.87.02-5.14-2.85-5.08-6.41l.74-39.72c.07-3.56,2.45-6.46,5.32-6.47h0c2.87-.02,5.14,2.85,5.08,6.41l-.74,39.72c-.07,3.56-2.45,6.46-5.32,6.47Z",
  "M63,77.18h0c2.9-.18,5.2-3.23,5.13-6.82l-.72-40.01c-.06-3.59-2.46-6.35-5.36-6.17h0c-2.9.18-5.2,3.23-5.13,6.82l.72,40.01c.06,3.59,2.46,6.35,5.36,6.17Z",
  "M8.71.09C4.75-.63.84,2.97.12,7.99c-.73,5.09,1.92,9.73,5.970,10.48,3.96.73,7.83-2.85,8.55-7.92C15.34,5.65,12.59.8,8.71.09Z",
  "M63.14.17c-3.96-.72-7.87,2.88-8.59,7.9-.73,5.09,1.92,9.73,5.97,10.48,3.96.73,7.83-2.85,8.55-7.92.7-4.9-2.06-9.75-5.94-10.46Z",
  "M65.89,27.26l-.91-1.16c-2.1-2.68-5.62-2.74-7.87-.14l-25.2,29.12,8.51,10.87,25.19-29.11c2.25-2.6,2.38-6.89.28-9.58Z",
  "M42.11,64L13.26,26.42c-2.1-2.74-5.64-2.79-7.91-.11-2.27,2.68-2.41,7.070-.31,9.81l28.85,37.68,8.22-9.81Z",
];

export function LogoMark({ className = "h-8 w-8" }) {
  return (
    <svg viewBox="0 0 70 78" className={className} aria-hidden="true" fill="currentColor">
      {MARK_PATHS.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

export default function Logo({ className = "", markClassName = "text-primary" }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark className={`h-8 w-7 ${markClassName}`} />
      <span className="text-2xl font-extrabold tracking-tight">Mingle</span>
    </span>
  );
}
