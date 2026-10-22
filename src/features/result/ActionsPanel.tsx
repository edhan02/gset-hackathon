import type { AnalyzeResult } from '../../types';

interface ActionsPanelProps {
  result: AnalyzeResult;
}

export default function ActionsPanel({ result }: ActionsPanelProps) {
  const isHigh = result.risk.level === 'HIGH' || result.risk.score >= 70;

  return (
    <section aria-labelledby="actions-heading" className="space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#1b3a63] pb-2">
        <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
        <h3 id="actions-heading" className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
          Citizen Protection Protocol (Mandatory Next Steps)
        </h3>
      </div>

      {result.actions.length > 0 && (
        <ol className="space-y-2 list-none">
          {result.actions.map((action, i) => (
            <li
              key={i}
              className="flex gap-3 items-start p-3 rounded-lg bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-[#162f52]"
            >
              <span className="shrink-0 w-6 h-6 rounded-md bg-blue-700 text-white flex items-center justify-center text-xs font-black">
                {i + 1}
              </span>
              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                {action}
              </p>
            </li>
          ))}
        </ol>
      )}

      {/* Direct helpline buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <a
          href="tel:1930"
          className={`
            min-h-[46px] px-4 rounded-lg font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400
            ${
              isHigh
                ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                : 'bg-blue-700 hover:bg-blue-800 text-white'
            }
          `}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.63A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z" />
          </svg>
          <span>Call Cyber Helpline 1930 (Immediate)</span>
        </a>

        <a
          href="https://cybercrime.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[46px] px-4 rounded-lg font-black text-xs uppercase tracking-wider border-2 border-[#1d4ed8] text-blue-700 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 flex items-center justify-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          <span>File Complaint (cybercrime.gov.in)</span>
        </a>
      </div>
    </section>
  );
}
