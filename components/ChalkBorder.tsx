import React from 'react';

interface ChalkBorderProps {
  color?: string;
  width?: number;
  height?: number;
  borderRadius?: number;
  roughness?: number; // 0-10, how rough/chalky
}

// Generates rough, hand-drawn chalk-like path
function generateRoughRect(
  width: number,
  height: number,
  radius: number,
  roughness: number = 5
): string {
  const rough = roughness * 0.5;
  const points: [number, number][] = [];

  // Top edge (left to right)
  for (let x = radius; x < width - radius; x += 3) {
    points.push([x + (Math.random() - 0.5) * rough, 0 + (Math.random() - 0.5) * rough]);
  }

  // Right edge (top to bottom)
  for (let y = radius; y < height - radius; y += 3) {
    points.push([width + (Math.random() - 0.5) * rough, y + (Math.random() - 0.5) * rough]);
  }

  // Bottom edge (right to left)
  for (let x = width - radius; x > radius; x -= 3) {
    points.push([x + (Math.random() - 0.5) * rough, height + (Math.random() - 0.5) * rough]);
  }

  // Left edge (bottom to top)
  for (let y = height - radius; y > radius; y -= 3) {
    points.push([0 + (Math.random() - 0.5) * rough, y + (Math.random() - 0.5) * rough]);
  }

  // Create path
  let path = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i][0]} ${points[i][1]}`;
  }
  path += ' Z';

  return path;
}

export default function ChalkBorder({
  color = '#1D1D1D',
  width = 100,
  height = 100,
  borderRadius = 20,
  roughness = 5,
}: ChalkBorderProps) {
  const path = React.useMemo(
    () => generateRoughRect(width, height, borderRadius, roughness),
    [width, height, borderRadius, roughness]
  );

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ overflow: 'visible' }}
    >
      {/* Multiple overlapping strokes for chalk texture */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
        strokeDasharray="2 1" // Creates gaps like chalk
      />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.3"
      />
    </svg>
  );
}

// Chalk circle for buttons
export function ChalkCircle({
  color = '#1D1D1D',
  roughness = 4,
}: Omit<ChalkBorderProps, 'width' | 'height' | 'borderRadius'>) {
  const path = React.useMemo(() => {
    const points: [number, number][] = [];
    const radius = 48;
    const center = 50;
    const rough = roughness * 0.4;

    // Generate rough circle
    for (let angle = 0; angle < Math.PI * 2; angle += 0.15) {
      const r = radius + (Math.random() - 0.5) * rough;
      const x = center + Math.cos(angle) * r;
      const y = center + Math.sin(angle) * r;
      points.push([x, y]);
    }

    let path = `M ${points[0][0]} ${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i][0]} ${points[i][1]}`;
    }
    path += ' Z';

    return path;
  }, [roughness]);

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      style={{ overflow: 'visible' }}
    >
      {/* Multiple overlapping strokes for chalk texture */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
        strokeDasharray="3 1.5"
      />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.3"
      />
    </svg>
  );
}
