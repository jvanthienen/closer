import React from 'react';
import { WobblyPill } from './WobblyBorder';

interface HandDrawnButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  color?: 'tomato' | 'cobalt' | 'sage' | 'orange' | 'navy' | 'magenta';
  children: React.ReactNode;
}

export default function HandDrawnButton({
  variant = 'primary',
  color = 'tomato',
  className = '',
  children,
  ...props
}: HandDrawnButtonProps) {
  const colorValues = {
    tomato: '#E63946',
    cobalt: '#457B9D',
    sage: '#8CB369',
    orange: '#F77F00',
    navy: '#1D3557',
    magenta: '#E76F9B',
  };

  const bgColor = colorValues[color];

  const baseClasses = `
    relative px-6 py-3 font-bold text-sm
    transition-all duration-200
    hover:scale-105 active:scale-96
    ${className}
  `;

  if (variant === 'primary') {
    return (
      <button
        className={`${baseClasses} text-white`}
        style={{
          background: bgColor,
          // Slight rotation for hand-drawn feel
          transform: `rotate(${Math.random() * 2 - 1}deg)`,
        }}
        {...props}
      >
        <WobblyPill color={bgColor} />
        <span className="relative z-10">{children}</span>
      </button>
    );
  }

  if (variant === 'outline') {
    return (
      <button
        className={`${baseClasses} bg-transparent`}
        style={{
          color: bgColor,
          transform: `rotate(${Math.random() * 2 - 1}deg)`,
        }}
        {...props}
      >
        <WobblyPill color={bgColor} />
        <span className="relative z-10">{children}</span>
      </button>
    );
  }

  return (
    <button
      className={`${baseClasses} bg-transparent hover:bg-opacity-10`}
      style={{
        color: bgColor,
      }}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
}
