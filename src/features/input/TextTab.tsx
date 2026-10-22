import { useRef } from 'react';
import { TEXT_MAX } from '../../lib/validators';
import type { Strings } from '../../i18n';

interface TextTabProps {
  value: string;
  onChange: (v: string) => void;
  t: Strings;
}

export default function TextTab({ value, onChange, t }: TextTabProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const combined = (value + text).slice(0, TEXT_MAX);
      onChange(combined);
      textareaRef.current?.focus();
    } catch {
      // Clipboard access denied — let the user paste manually
      textareaRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, TEXT_MAX))}
          placeholder={t.input.placeholder}
          maxLength={TEXT_MAX}
          rows={7}
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm p-3 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
          aria-label="Message to analyse"
        />
      </div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handlePaste}
          className="min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          </svg>
          {t.input.pasteBtn}
        </button>
        <span
          className={`text-xs tabular-nums ${value.length >= TEXT_MAX ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}
          aria-live="polite"
          aria-label={`${value.length} of ${TEXT_MAX} ${t.input.charCount}`}
        >
          {value.length.toLocaleString()} / {TEXT_MAX.toLocaleString()} {t.input.charCount}
        </span>
      </div>
    </div>
  );
}
