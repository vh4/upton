'use client';

import React, { useId } from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = '', size = 32 }: LogoProps) {
  const rawId = useId();
  const safeId = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
  const bgGradId = `logoBgGrad_${safeId}`;
  const accentGradId = `logoAccentGrad_${safeId}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
    >
      <defs>
        <linearGradient id={bgGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#18181b" />
          <stop offset="100%" stopColor="#09090b" />
        </linearGradient>
        <linearGradient id={accentGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <rect
        x="4"
        y="4"
        width="120"
        height="120"
        rx="28"
        fill={`url(#${bgGradId})`}
        stroke="#3f3f46"
        strokeWidth="3"
      />
      <rect
        x="6"
        y="6"
        width="116"
        height="116"
        rx="26"
        fill="none"
        stroke={`url(#${accentGradId})`}
        strokeWidth="2"
        strokeOpacity="0.4"
      />
      <g transform="translate(64, 62)">
        <path
          d="M 0 -26 L 22 -4 L 10 -4 L 10 12 L -10 12 L -10 -4 L -22 -4 Z"
          fill={`url(#${accentGradId})`}
        />
        <path
          d="M -24 22 L 24 22"
          stroke={`url(#${accentGradId})`}
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
