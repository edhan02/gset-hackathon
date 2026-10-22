import type { RedFlag } from '../types';

const CATEGORY_COLORS: Record<string, string> = {};
const CHIP_PALETTE = [
  'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
];

function chipColor(category: string): string {
  if (!CATEGORY_COLORS[category]) {
    const idx = Object.keys(CATEGORY_COLORS).length % CHIP_PALETTE.length;
    CATEGORY_COLORS[category] = CHIP_PALETTE[idx];
  }
  return CATEGORY_COLORS[category];
}

interface RedFlagCardProps {
  flag: RedFlag;
  index: number;
}

export default function RedFlagCard({ flag, index }: RedFlagCardProps) {
  return (
    <div className="flex gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 flex items-center justify-center text-xs font-bold mt-0.5">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${chipColor(flag.category)}`}>
            {flag.category}
          </span>
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
            &ldquo;{flag.phrase}&rdquo;
          </span>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">{flag.why}</p>
      </div>
    </div>
  );
}
