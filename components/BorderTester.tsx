"use client";

import { useState } from 'react';

export type BorderStyle = {
  name: string;
  frequency: number;
  scale: number;
  octaves: number;
  strokeWidth: number;
};

export const borderStyles: BorderStyle[] = [
  {
    name: 'Clean Lines',
    frequency: 0,
    scale: 0.5,
    octaves: 0,
    strokeWidth: 2,
  },
  {
    name: 'Light Chalk',
    frequency: 0.01,
    scale: 2,
    octaves: 1,
    strokeWidth: 3,
  },
  {
    name: 'Medium Chalk',
    frequency: 0.015,
    scale: 4,
    octaves: 2,
    strokeWidth: 3,
  },
  {
    name: 'Rough Chalk',
    frequency: 0.02,
    scale: 6,
    octaves: 2,
    strokeWidth: 3.5,
  },
  {
    name: 'Very Rough',
    frequency: 0.025,
    scale: 8,
    octaves: 3,
    strokeWidth: 4,
  },
  {
    name: 'Super Sketchy',
    frequency: 0.03,
    scale: 10,
    octaves: 3,
    strokeWidth: 4,
  },
];

interface BorderTesterProps {
  onStyleChange: (style: BorderStyle) => void;
}

export default function BorderTester({ onStyleChange }: BorderTesterProps) {
  const [currentStyle, setCurrentStyle] = useState(borderStyles[2]); // Gentle (Current)

  const handleStyleChange = (style: BorderStyle) => {
    setCurrentStyle(style);
    onStyleChange(style);
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-white p-4 rounded-[20px] border-[3px] border-navy shadow-lg max-w-[220px]">
      <h4 className="text-sm mb-2 text-navy">Border Style Tester</h4>
      <div className="text-xs mb-3 px-2 py-1 bg-gray-100 rounded">
        Roughness: <strong>{currentStyle.scale}</strong>
      </div>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {borderStyles.map((style) => (
          <button
            key={style.name}
            onClick={() => handleStyleChange(style)}
            className={`
              w-full text-left px-3 py-2 rounded-lg text-[13px] transition-all relative
              ${currentStyle.name === style.name
                ? 'bg-cobalt text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <span>{style.name}</span>
              {/* Preview circle */}
              <div className="relative w-6 h-6 ml-2 flex-shrink-0">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24">
                  <defs>
                    {style.frequency > 0 && (
                      <filter id={`preview-${style.name}`}>
                        <feTurbulence
                          type="fractalNoise"
                          baseFrequency={style.frequency}
                          numOctaves={style.octaves}
                        />
                        <feDisplacementMap in="SourceGraphic" scale={style.scale} />
                      </filter>
                    )}
                  </defs>
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    fill="none"
                    stroke={currentStyle.name === style.name ? 'white' : '#E63946'}
                    strokeWidth={style.strokeWidth * 0.8}
                    filter={style.frequency > 0 ? `url(#preview-${style.name})` : undefined}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
