import React from 'react';
import WobblyBorder from './WobblyBorder';

interface HandDrawnCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  borderColor?: 'tomato' | 'cobalt' | 'navy' | 'sage' | 'orange' | 'magenta' | 'black';
}

export default function HandDrawnCard({
  children,
  onClick,
  className = '',
  borderColor = 'black',
}: HandDrawnCardProps) {
  const borderColors = {
    tomato: '#E63946',
    cobalt: '#457B9D',
    navy: '#1D3557',
    sage: '#8CB369',
    orange: '#F77F00',
    magenta: '#E76F9B',
    black: '#1D1D1D',
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative bg-white p-5
        transition-all duration-200
        ${onClick ? 'cursor-pointer hover:-translate-y-1' : ''}
        ${className}
      `}
      style={{
        // Slight rotation for authentic hand-drawn feel
        transform: `rotate(${Math.random() * 1.5 - 0.75}deg)`,
      }}
    >
      {/* Wobbly hand-drawn border */}
      <WobblyBorder color={borderColors[borderColor]} />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
