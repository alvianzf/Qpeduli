import { useId } from 'react';

export default function Logo({ size = 40 }: { size?: number }) {
  const gradId = useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Qpeduli"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1E5FE0" />
          <stop offset="1" stopColor="#60A5FA" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${gradId})`} />
      <rect x="12" y="13" width="40" height="25" rx="10" fill="#fff" />
      <path d="M19 36 L13 49 L27 37 Z" fill="#fff" />
      <path
        d="M32 33C32 33 22 26.5 22 20.8C22 17.6 24.7 15.5 27.4 15.9C29.2 16.2 30.4 17.4 32 18.8C33.6 17.4 34.8 16.2 36.6 15.9C39.3 15.5 42 17.6 42 20.8C42 26.5 32 33 32 33Z"
        fill={`url(#${gradId})`}
      />
    </svg>
  );
}
