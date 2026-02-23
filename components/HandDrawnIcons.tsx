// Playful hand-drawn style icons
// These use simple SVG paths with wobbly, imperfect lines

interface IconProps {
  className?: string;
  color?: string;
}

// Croissant icon for call button!
export function CroissantIcon({ className = "w-5 h-5", color = "currentColor" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
      <path
        d="M4 14c1-1 2.5-1.5 4-1 1.5.5 2 2 3 3s2.5 2.5 4 2c1.5-.5 2-2 2.5-3.5.5-1.5 0-3-1-4-1-1-2.5-1.5-4-1s-2.5 1-3.5 2-2 2.5-2.5 4c-.5 1.5-.5 3 0 4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 12c.5-.5 1-1 2-1s1.5.5 2 1"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Hand waving icon
export function HandWaveIcon({ className = "w-5 h-5", color = "currentColor" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
      <path
        d="M7 12c0-1 0-2 1-3s2-1 3-1 2 0 3 1 1 2 1 3v5c0 1 0 2-1 3s-2 1-3 1-2 0-3-1-1-2-1-3v-5z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M11 8V6M15 8V5" strokeLinecap="round" />
      <path d="M5 14l1 1M18 14l-1 1" strokeLinecap="round" />
    </svg>
  );
}

// Two hands hugging
export function HandsHugIcon({ className = "w-5 h-5", color = "currentColor" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
      <path
        d="M6 10c1 0 2 1 2 2v4c0 1-1 2-2 2s-2-1-2-2v-4c0-1 1-2 2-2z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 10c-1 0-2 1-2 2v4c0 1 1 2 2 2s2-1 2-2v-4c0-1-1-2-2-2z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 12c1-1 2-1 3-1h2c1 0 2 0 3 1"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Simple flower
export function FlowerIcon({ className = "w-5 h-5", color = "currentColor" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
      <circle cx="12" cy="10" r="1.5" fill={color} />
      <path
        d="M12 8.5c-1-1-2-1-2.5 0s0 2 1 2.5M12 8.5c1-1 2-1 2.5 0s0 2-1 2.5M12 11.5c-1 1-1 2 0 2.5s2 0 2.5-1M12 11.5c1 1 1 2 0 2.5s-2 0-2.5-1"
        strokeLinecap="round"
      />
      <path d="M12 14v5" strokeLinecap="round" />
    </svg>
  );
}

// Plus sign made of lines
export function PlusIcon({ className = "w-5 h-5", color = "currentColor" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

// Simple calendar with face
export function CalendarIcon({ className = "w-5 h-5", color = "currentColor" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
      <rect x="4" y="6" width="16" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 4v4M16 4v4M4 10h16" strokeLinecap="round" />
      <circle cx="10" cy="14" r="0.5" fill={color} />
      <circle cx="14" cy="14" r="0.5" fill={color} />
      <path d="M10 16c.5.5 1.5.5 2 0" strokeLinecap="round" />
    </svg>
  );
}

// Import icon
export function ImportIcon({ className = "w-5 h-5", color = "currentColor" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
      <path d="M12 3v12M8 11l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 17v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2" strokeLinecap="round" />
    </svg>
  );
}

// Edit/pencil icon
export function EditIcon({ className = "w-5 h-5", color = "currentColor" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
      <path
        d="M4 20h4l10-10a2 2 0 0 0 0-3l-1-1a2 2 0 0 0-3 0L4 16v4z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M13.5 6.5l4 4" strokeLinecap="round" />
    </svg>
  );
}

// Message bubble
export function MessageIcon({ className = "w-5 h-5", color = "currentColor" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
      <path
        d="M21 12c0 4-4 8-9 8-1.5 0-3-.3-4.3-1L3 20l1.4-3.7C3.5 15 3 13.5 3 12c0-4 4-8 9-8s9 4 9 8z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="12" r="0.5" fill={color} />
      <circle cx="12" cy="12" r="0.5" fill={color} />
      <circle cx="15" cy="12" r="0.5" fill={color} />
    </svg>
  );
}

// Sparkle/star
export function SparkleIcon({ className = "w-5 h-5", color = "currentColor" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" strokeLinecap="round" />
      <path d="M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2" strokeLinecap="round" />
    </svg>
  );
}
