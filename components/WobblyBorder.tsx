import React from 'react';

interface WobblyBorderProps {
  color?: string;
  className?: string;
}

// Creates a subtle, hand-drawn SVG border
export default function WobblyBorder({
  color = '#1D1D1D',
  className = ''
}: WobblyBorderProps) {
  const seed = React.useMemo(() => Math.random() * 100, []);

  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Subtle turbulence for gentle hand-drawn effect */}
        <filter id={`wobble-${seed}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.015"
            numOctaves="2"
            seed={seed}
          />
          <feDisplacementMap in="SourceGraphic" scale="1.5" />
        </filter>
      </defs>
      <rect
        x="2"
        y="2"
        width="calc(100% - 4px)"
        height="calc(100% - 4px)"
        rx="18"
        fill="none"
        stroke={color}
        strokeWidth="3"
        filter={`url(#wobble-${seed})`}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Wobbly pill shape for buttons
export function WobblyPill({
  color = '#1D1D1D',
  className = ''
}: WobblyBorderProps) {
  const seed = React.useMemo(() => Math.random() * 100, []);

  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <filter id={`wobble-pill-${seed}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.018"
            numOctaves="2"
            seed={seed}
          />
          <feDisplacementMap in="SourceGraphic" scale="1.2" />
        </filter>
      </defs>
      <rect
        x="2"
        y="2"
        width="calc(100% - 4px)"
        height="calc(100% - 4px)"
        rx="999"
        fill="none"
        stroke={color}
        strokeWidth="3"
        filter={`url(#wobble-pill-${seed})`}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Wobbly circle
export function WobblyCircle({
  color = '#1D1D1D',
  className = ''
}: WobblyBorderProps) {
  const seed = React.useMemo(() => Math.random() * 100, []);

  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <filter id={`wobble-circle-${seed}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02"
            numOctaves="2"
            seed={seed}
          />
          <feDisplacementMap in="SourceGraphic" scale="1.5" />
        </filter>
      </defs>
      <circle
        cx="50%"
        cy="50%"
        r="calc(50% - 3px)"
        fill="none"
        stroke={color}
        strokeWidth="3"
        filter={`url(#wobble-circle-${seed})`}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
