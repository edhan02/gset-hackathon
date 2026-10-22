import { useEffect, useRef, useState } from 'react';
import InputCard from '../features/input/InputCard';
import ResultView from '../features/result/ResultView';
import { useAnalyze } from '../hooks/useAnalyze';
import { useLang } from '../hooks/useLang';
import EmblemOfIndia from '../components/EmblemOfIndia';

type SubmitInput =
  | { type: 'text'; value: string }
  | { type: 'image'; file: File }
  | { type: 'audio'; file: File };

function ElapsedTimer({ startedAt }: { startedAt: number }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  return (
    <span className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300 tabular-nums">
      Scanning: {elapsed}s
    </span>
  );
}

function getErrorMessage(code: string, fallback: string, t: ReturnType<typeof useLang>['t']): string {
  if (code === 'no_input') return t.errors.no_input;
  if (code === 'no_text_found') return t.errors.no_text_found;
  if (code === 'network') return t.errors.network;
  if (code === 'aborted') return t.errors.aborted;
  return fallback || t.errors.generic;
}

export default function Home() {
  const { state, submit, cancel, reset } = useAnalyze();
  const { t } = useLang();
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.phase === 'success' || state.phase === 'error') {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [state.phase]);

  const handleSubmit = (input: SubmitInput) => {
    submit(input);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Official Government Advisory Banner */}
      <div className="rounded-xl border-2 border-red-500/50 bg-red-950/20 text-red-900 dark:text-red-200 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0 font-bold text-lg mt-0.5">
            !
          </div>
          <div className="space-y-1 text-xs sm:text-sm">
            <p className="font-black uppercase tracking-wider text-red-700 dark:text-red-400">
              National Cybercrime Warning: Beware of &ldquo;Digital Arrest&rdquo; Extortion
            </p>
            <p className="leading-relaxed opacity-95">
              Indian law enforcement agencies (<strong>CBI, Enforcement Directorate, State Police, Customs, or TRAI</strong>) <strong>NEVER</strong> issue arrest warrants, hold courtroom trials, or demand security deposits over <strong>WhatsApp, Skype, or Video Calls</strong>. Anyone claiming to place you under &ldquo;Digital Arrest&rdquo; is a cybercriminal.
            </p>
          </div>
        </div>
      </div>

      {/* Main Header / Emblem */}
      <div className="text-center space-y-2">
        <EmblemOfIndia size={52} gold className="mx-auto" />
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-slate-900 dark:text-white">
          Digital Arrest &amp; Cyber Fraud Shield
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
          Received an intimidation message, arrest threat, fraudulent legal notice, or video call extortion? Upload or paste the evidence below for immediate verification against real scam patterns.
        </p>
      </div>

      {/* Input Card */}
      <InputCard
        onSubmit={handleSubmit}
        disabled={state.phase === 'loading'}
        t={t}
      />

      {/* Loading state */}
      {state.phase === 'loading' && (
        <div
          ref={resultRef}
          className="rounded-xl bg-white dark:bg-[#0c1f38] border-2 border-blue-500/50 shadow-lg p-6 flex flex-col items-center gap-4 text-center"
          role="status"
          aria-live="polite"
        >
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 animate-spin" />
          <div>
            <p className="text-base font-bold text-slate-900 dark:text-white">
              Analyzing Evidence for Digital Arrest &amp; Extortion Patterns...
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Cross-referencing with known threat scripts, impersonation tactics, and legal precedents (10–30s)
            </p>
          </div>

          <div className="flex items-center gap-4">
            <ElapsedTimer startedAt={state.startedAt} />
            <button
              type="button"
              onClick={cancel}
              className="min-h-[38px] px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel Scan
            </button>
          </div>
        </div>
      )}

      {/* Error state */}
      {state.phase === 'error' && (
        <div
          ref={resultRef}
          className="rounded-xl bg-red-50 dark:bg-red-950/30 border-2 border-red-500 p-5 shadow-sm"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-bold text-red-800 dark:text-red-300 uppercase tracking-wide">
                Analysis Verification Halted
              </p>
              <p className="mt-1 text-xs text-red-700 dark:text-red-400">
                {getErrorMessage(state.code, state.message, t)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={reset}
            className="mt-4 min-h-[40px] w-full rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Retry Verification
          </button>
        </div>
      )}

      {/* Success View */}
      {state.phase === 'success' && (
        <div ref={resultRef}>
          <ResultView result={state.result} onCheckAnother={reset} t={t} />
        </div>
      )}
    </div>
  );
}
