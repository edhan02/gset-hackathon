import { useState } from 'react';
import { highlight } from '../lib/highlight';
import type { RedFlag } from '../types';

interface HighlightedTextProps {
  text: string;
  flags: RedFlag[];
}

// Cycle of mark colour classes keyed by category
const MARK_COLORS = [
  'bg-red-100 dark:bg-red-900/40 border-b-2 border-red-500',
  'bg-amber-100 dark:bg-amber-900/40 border-b-2 border-amber-500',
  'bg-purple-100 dark:bg-purple-900/40 border-b-2 border-purple-500',
  'bg-blue-100 dark:bg-blue-900/40 border-b-2 border-blue-500',
];

function getCategoryColor(phrase: string, flags: RedFlag[]): string {
  const idx = flags.findIndex((f) => f.phrase === phrase);
  return MARK_COLORS[(idx >= 0 ? idx : 0) % MARK_COLORS.length];
}

function FlagPopover({ flag }: { flag: RedFlag }) {
  return (
    <span
      role="tooltip"
      className="
        absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2
        w-56 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900
        text-xs p-2 shadow-lg pointer-events-none
      "
    >
      <span className="block font-semibold mb-1">{flag.category}</span>
      <span className="block text-gray-300 dark:text-gray-600">{flag.why}</span>
      {/* Arrow */}
      <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100" />
    </span>
  );
}

export default function HighlightedText({ text, flags }: HighlightedTextProps) {
  const [activePhrase, setActivePhrase] = useState<string | null>(null);
  const phrases = flags.map((f) => f.phrase);
  const segments = highlight(text, phrases);

  return (
    <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap break-words font-mono bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
      {segments.map((seg, i) => {
        if (!seg.mark) {
          return <span key={i}>{seg.text}</span>;
        }

        const flag = flags.find((f) => f.phrase === seg.phrase) ?? flags[seg.index] ?? flags[0];
        const markColor = getCategoryColor(seg.phrase, flags);
        const isActive = activePhrase === `${seg.phrase}-${i}`;

        return (
          <span key={i} className="relative inline-block">
            <mark
              className={`${markColor} rounded px-0.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500`}
              tabIndex={0}
              onMouseEnter={() => setActivePhrase(`${seg.phrase}-${i}`)}
              onMouseLeave={() => setActivePhrase(null)}
              onFocus={() => setActivePhrase(`${seg.phrase}-${i}`)}
              onBlur={() => setActivePhrase(null)}
              aria-describedby={isActive ? `flag-tooltip-${i}` : undefined}
            >
              {seg.text}
            </mark>
            {isActive && flag && (
              <span id={`flag-tooltip-${i}`}>
                <FlagPopover flag={flag} />
              </span>
            )}
          </span>
        );
      })}
    </p>
  );
}
