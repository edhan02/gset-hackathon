interface EmblemProps {
  className?: string;
  size?: number;
  textColor?: string;
  gold?: boolean;
}

export default function EmblemOfIndia({
  className = '',
  size = 64,
  textColor = 'currentColor',
  gold = false,
}: EmblemProps) {
  const primaryColor = gold ? '#C5A059' : textColor;
  const secondaryColor = gold ? '#997328' : 'currentColor';

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <svg
        width={size}
        height={Math.round(size * 1.25)}
        viewBox="0 0 100 125"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="State Emblem of India - Satyameva Jayate"
        role="img"
      >
        {/* LION CAPITAL OF ASHOKA */}
        <g stroke={primaryColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Central Lion Head */}
          <path d="M50 14 C44 14 42 18 42 22 C42 26 44 28 50 28 C56 28 58 26 58 22 C58 18 56 14 50 14 Z" fill={primaryColor} fillOpacity="0.12" />
          <path d="M47 19 Q50 21 53 19" />
          <circle cx="46" cy="18" r="0.8" fill={primaryColor} />
          <circle cx="54" cy="18" r="0.8" fill={primaryColor} />
          {/* Central Lion Ears */}
          <path d="M42 16 Q40 12 43 14" />
          <path d="M58 16 Q60 12 57 14" />
          {/* Central Lion Mane */}
          <path d="M41 24 C38 28 39 34 43 38 C46 41 50 42 50 42 C50 42 54 41 57 38 C61 34 62 28 59 24" strokeWidth="1.8" />
          <path d="M44 28 C41 33 43 38 46 40" />
          <path d="M56 28 C59 33 57 38 54 40" />
          <path d="M50 28 L50 42" strokeWidth="1.2" />

          {/* Left Lion Head (Profile) */}
          <path d="M30 20 C27 20 25 24 25 27 C25 31 28 33 33 33 C36 33 38 31 38 27 C38 24 35 20 30 20 Z" fill={primaryColor} fillOpacity="0.08" />
          <path d="M26 23 Q24 21 27 21" />
          <circle cx="28" cy="25" r="0.8" fill={primaryColor} />
          {/* Left Lion Mane */}
          <path d="M25 29 C21 34 23 41 28 44 C33 46 39 46 41 43" />
          <path d="M29 34 C26 38 28 42 32 44" />

          {/* Right Lion Head (Profile) */}
          <path d="M70 20 C73 20 75 24 75 27 C75 31 72 33 67 33 C64 33 62 31 62 27 C62 24 65 20 70 20 Z" fill={primaryColor} fillOpacity="0.08" />
          <path d="M74 23 Q76 21 73 21" />
          <circle cx="72" cy="25" r="0.8" fill={primaryColor} />
          {/* Right Lion Mane */}
          <path d="M75 29 C79 34 77 41 72 44 C67 46 61 46 59 43" />
          <path d="M71 34 C74 38 72 42 68 44" />

          {/* Pedestal / Abacus Upper Rim */}
          <path d="M18 52 L82 52" strokeWidth="2.4" />
          <path d="M16 56 L84 56" strokeWidth="1.6" />

          {/* Central Ashoka Chakra on Abacus */}
          <circle cx="50" cy="65" r="7" strokeWidth="1.8" />
          <circle cx="50" cy="65" r="1.5" fill={primaryColor} />
          {/* 16 visible spoke indications */}
          <line x1="50" y1="58" x2="50" y2="72" strokeWidth="0.9" />
          <line x1="43" y1="65" x2="57" y2="65" strokeWidth="0.9" />
          <line x1="45" y1="60" x2="55" y2="70" strokeWidth="0.9" />
          <line x1="55" y1="60" x2="45" y2="70" strokeWidth="0.9" />
          <line x1="47.5" y1="58.5" x2="52.5" y2="71.5" strokeWidth="0.7" />
          <line x1="52.5" y1="58.5" x2="47.5" y2="71.5" strokeWidth="0.7" />
          <line x1="43.5" y1="62.5" x2="56.5" y2="67.5" strokeWidth="0.7" />
          <line x1="43.5" y1="67.5" x2="56.5" y2="62.5" strokeWidth="0.7" />

          {/* Bull on Right of Abacus */}
          <path d="M68 62 C71 61 74 63 76 66 C77 68 76 71 73 71 C70 71 69 68 66 67" strokeWidth="1.2" />
          <path d="M76 64 L79 63" strokeWidth="1" />

          {/* Galloping Horse on Left of Abacus */}
          <path d="M32 62 C29 61 26 63 24 66 C23 68 24 71 27 71 C30 71 31 68 34 67" strokeWidth="1.2" />
          <path d="M24 64 L21 63" strokeWidth="1" />

          {/* Abacus Lower Rim */}
          <path d="M16 74 L84 74" strokeWidth="1.6" />
          <path d="M18 78 L82 78" strokeWidth="2.4" />

          {/* Bell-shaped Inverted Lotus Base */}
          <path d="M24 78 C26 86 35 90 50 90 C65 90 74 86 76 78" strokeWidth="1.6" />
          <path d="M32 78 C34 85 40 88 50 88 C60 88 66 85 68 78" strokeWidth="1.2" strokeDasharray="1 2" />
          <path d="M22 93 L78 93" strokeWidth="2.2" />
        </g>

        {/* SATYAMEVA JAYATE (सत्यमेव जयते) Inscription */}
        <text
          x="50"
          y="110"
          textAnchor="middle"
          fontSize="9.5"
          fontWeight="bold"
          fontFamily="'Noto Sans Devanagari', 'Mangal', 'Segoe UI Historic', 'Arial Unicode MS', sans-serif"
          fill={secondaryColor}
          letterSpacing="1.2"
        >
          सत्यमेव जयते
        </text>

        <text
          x="50"
          y="121"
          textAnchor="middle"
          fontSize="4.5"
          fontWeight="600"
          fontFamily="Inter, system-ui, sans-serif"
          fill={secondaryColor}
          letterSpacing="1.5"
          opacity="0.85"
        >
          SATYAMEVA JAYATE
        </text>
      </svg>
    </div>
  );
}
