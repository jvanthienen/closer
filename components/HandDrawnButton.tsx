import React from 'react';

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
  const colorClasses = {
    tomato: {
      primary: 'bg-tomato text-white border-tomato',
      outline: 'bg-transparent text-tomato border-tomato',
      ghost: 'bg-transparent text-tomato border-transparent hover:bg-[#E63946]/10',
    },
    cobalt: {
      primary: 'bg-cobalt text-white border-cobalt',
      outline: 'bg-transparent text-cobalt border-cobalt',
      ghost: 'bg-transparent text-cobalt border-transparent hover:bg-[#457B9D]/10',
    },
    sage: {
      primary: 'bg-sage text-white border-sage',
      outline: 'bg-transparent text-sage border-sage',
      ghost: 'bg-transparent text-sage border-transparent hover:bg-[#8CB369]/10',
    },
    orange: {
      primary: 'bg-orange text-white border-orange',
      outline: 'bg-transparent text-orange border-orange',
      ghost: 'bg-transparent text-orange border-transparent hover:bg-[#F77F00]/10',
    },
    navy: {
      primary: 'bg-navy text-white border-navy',
      outline: 'bg-transparent text-navy border-navy',
      ghost: 'bg-transparent text-navy border-transparent hover:bg-[#1D3557]/10',
    },
    magenta: {
      primary: 'bg-magenta text-white border-magenta',
      outline: 'bg-transparent text-magenta border-magenta',
      ghost: 'bg-transparent text-magenta border-transparent hover:bg-[#E76F9B]/10',
    },
  };

  const variantClass = colorClasses[color][variant];

  return (
    <button
      className={`
        relative rounded-[28px] px-6 py-3 font-semibold text-sm
        border-[2.5px] transition-all duration-200
        hover:scale-105 active:scale-96
        ${variantClass}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
