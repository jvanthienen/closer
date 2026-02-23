"use client";

import { useEffect, useRef } from 'react';
import rough from 'roughjs';

interface RoughBorderProps {
  color?: string;
  roughness?: number;
  className?: string;
  shape?: 'rectangle' | 'circle';
}

export default function RoughBorder({
  color = '#1D1D1D',
  roughness = 1,
  className = '',
  shape = 'rectangle',
}: RoughBorderProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const rc = rough.svg(svg);

    // Clear previous drawings
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    const width = svg.clientWidth || 300;
    const height = svg.clientHeight || 100;

    // Draw with Rough.js
    let node;
    if (shape === 'circle') {
      const radius = Math.min(width, height) / 2 - 5;
      node = rc.circle(width / 2, height / 2, radius * 2, {
        stroke: color,
        strokeWidth: 3,
        roughness: roughness,
        fill: 'none',
        fillStyle: 'solid',
      });
    } else {
      node = rc.rectangle(5, 5, width - 10, height - 10, {
        stroke: color,
        strokeWidth: 3,
        roughness: roughness,
        fill: 'none',
        fillStyle: 'solid',
      });
    }

    svg.appendChild(node);
  }, [color, roughness, shape]);

  return (
    <svg
      ref={svgRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ overflow: 'visible' }}
    />
  );
}

export function RoughCircle({
  color = '#1D1D1D',
  roughness = 1,
  className = '',
}: Omit<RoughBorderProps, 'shape'>) {
  return (
    <RoughBorder
      color={color}
      roughness={roughness}
      className={className}
      shape="circle"
    />
  );
}
