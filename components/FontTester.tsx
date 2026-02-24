"use client";

import { useState, useEffect } from 'react';

const fonts = [
  { name: 'Kalam', value: 'Kalam' },
  { name: 'Caveat', value: 'Caveat' },
  { name: 'Dancing Script', value: 'Dancing Script' },
  { name: 'Architects Daughter', value: 'Architects Daughter' },
  { name: 'Amatic SC', value: 'Amatic SC' },
  { name: 'Patrick Hand', value: 'Patrick Hand' },
  { name: 'Permanent Marker', value: 'Permanent Marker' },
  { name: 'Indie Flower', value: 'Indie Flower' },
  { name: 'Shadows Into Light', value: 'Shadows Into Light' },
];

export default function FontTester() {
  const [currentFont, setCurrentFont] = useState('Kalam');
  const [loaded, setLoaded] = useState<Set<string>>(new Set(['Kalam']));

  useEffect(() => {
    // Load all Google Fonts dynamically
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${fonts.map(f => f.value.replace(/ /g, '+')).join('&family=')}&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const handleFontChange = (fontValue: string) => {
    setCurrentFont(fontValue);
    // Apply to body
    document.body.style.fontFamily = `"${fontValue}", cursive`;
    // Update loaded set
    setLoaded(prev => new Set([...prev, fontValue]));
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-white p-4 rounded-[20px] border-[2.5px] border-navy shadow-lg max-w-[200px]">
      <h4 className="text-sm font-bold mb-2 text-navy">Font Tester</h4>
      <div className="space-y-2">
        {fonts.map((font) => (
          <button
            key={font.value}
            onClick={() => handleFontChange(font.value)}
            className={`
              w-full text-left px-3 py-2 rounded-lg text-sm transition-all
              ${currentFont === font.value
                ? 'bg-cobalt text-white font-bold'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
            style={{
              fontFamily: loaded.has(font.value) ? `"${font.value}", cursive` : 'inherit',
            }}
          >
            {font.name}
          </button>
        ))}
      </div>
    </div>
  );
}
