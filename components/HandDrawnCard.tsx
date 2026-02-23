import React from 'react';

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
        relative bg-white rounded-[20px] p-5
        border-[2.5px] transition-all duration-200
        ${onClick ? 'cursor-pointer hover:-translate-y-1' : ''}
        ${className}
      `}
      style={{
        borderColor: borderColors[borderColor],
      }}
    >
      {children}
    </div>
  );
}
