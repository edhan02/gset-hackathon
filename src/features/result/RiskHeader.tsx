import RiskGauge from '../../components/RiskGauge';
import type { AnalyzeResult, RiskLevel } from '../../types';
import type { Strings } from '../../i18n';

interface RiskHeaderProps {
  result: AnalyzeResult;
  t: Strings;
}

function ShieldAlertIcon({ className }: { className?: string }) {
  return (
    <svg width="32" height="32" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function AlertTriangleIcon({ className }: { className?: string }) {
  return (
    <svg width="32" height="32" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg width="32" height="32" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

const RISK_STYLES: Record<RiskLevel, { bg: string; text: string; border: string; badge: string; icon: React.ReactNode }> = {
  HIGH: {
    bg: 'bg-red-950/20 dark:bg-red-950/40',
    border: 'border-2 border-red-600',
    text: 'text-red-700 dark:text-red-400',
    badge: 'bg-red-600 text-white',
    icon: <ShieldAlertIcon className="w-9 h-9 text-red-600 dark:text-red-400" />,
  },
  MEDIUM: {
    bg: 'bg-amber-950/15 dark:bg-amber-950/30',
    border: 'border-2 border-amber-500',
    text: 'text-amber-700 dark:text-amber-400',
    badge: 'bg-amber-500 text-slate-950',
    icon: <AlertTriangleIcon className="w-9 h-9 text-amber-600 dark:text-amber-400" />,
  },
  LOW: {
    bg: 'bg-emerald-950/15 dark:bg-emerald-950/30',
    border: 'border-2 border-emerald-600',
    text: 'text-emerald-700 dark:text-emerald-400',
    badge: 'bg-emerald-600 text-white',
    icon: <ShieldCheckIcon className="w-9 h-9 text-emerald-600 dark:text-emerald-400" />,
  },
};

export default function RiskHeader({ result, t }: RiskHeaderProps) {
  const { level, score } = result.risk;
  const styles = RISK_STYLES[level];

  return (
    <div
      className={`rounded-xl ${styles.bg} ${styles.border} p-5 sm:p-6 shadow-md`}
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
        {/* Gauge & icon */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          {styles.icon}
          <RiskGauge score={score} level={level} />
        </div>

        {/* Threat assessment details */}
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className={`px-3 py-1 rounded text-xs font-black uppercase tracking-wider ${styles.badge}`}>
              {t.result.riskLevel[level]}
            </span>
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
              Composite Threat Score: {score} / 100
            </span>
          </div>

          {result.scam_type && result.scam_type !== 'None' && (
            <div className="mt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Identified Modus Operandi:
              </span>
              <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {result.scam_type}
              </p>
            </div>
          )}

          {result.summary && (
            <div className="p-3 rounded-lg bg-white/80 dark:bg-[#071324]/80 border border-slate-200 dark:border-[#1b3a63]">
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                {result.summary}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
