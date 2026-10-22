import RiskHeader from './RiskHeader';
import ActionsPanel from './ActionsPanel';
import HighlightedText from '../../components/HighlightedText';
import RedFlagCard from '../../components/RedFlagCard';
import SimilarCases from '../../components/SimilarCases';
import CopyButton from '../../components/CopyButton';
import { buildCopySummary } from '../../lib/format';
import type { AnalyzeResult } from '../../types';
import type { Strings } from '../../i18n';

interface ResultViewProps {
  result: AnalyzeResult;
  onCheckAnother: () => void;
  t: Strings;
}

export default function ResultView({ result, onCheckAnother, t }: ResultViewProps) {
  const copyText = buildCopySummary(result);

  return (
    <div className="space-y-4 motion-reduce:transition-none">
      {/* Official Threat Header */}
      <RiskHeader result={result} t={t} />

      {/* Highlighted analyzed text */}
      {result.analyzed_text && (
        <section aria-labelledby="analyzed-text-heading" className="rounded-xl bg-white dark:bg-[#0c1f38] border-2 border-slate-200 dark:border-[#1b3a63] shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 border-b border-slate-200 dark:border-[#162f52] pb-2">
            <h3 id="analyzed-text-heading" className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Intercepted Evidence &amp; Coercion Phrase Highlighting
            </h3>
            <span className="text-[11px] font-bold text-slate-500 uppercase">
              Format: {result.input_type}
            </span>
          </div>
          <HighlightedText text={result.analyzed_text} flags={result.red_flags} />
        </section>
      )}

      {/* Red flags */}
      <section aria-labelledby="red-flags-heading" className="rounded-xl bg-white dark:bg-[#0c1f38] border-2 border-slate-200 dark:border-[#1b3a63] shadow-sm p-4 sm:p-5">
        <h3 id="red-flags-heading" className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-3 border-b border-slate-200 dark:border-[#162f52] pb-2">
          Specific Coercion Tactics Detected
        </h3>
        {result.red_flags.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            No prominent extortion phrases or arrest threats identified in this submission.
          </p>
        ) : (
          <div className="space-y-2">
            {result.red_flags.map((flag, i) => (
              <RedFlagCard key={i} flag={flag} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Mandatory Citizen Protocol */}
      <section className="rounded-xl bg-white dark:bg-[#0c1f38] border-2 border-slate-200 dark:border-[#1b3a63] shadow-sm p-4 sm:p-5">
        <ActionsPanel result={result} />
      </section>

      {/* Similar cases */}
      {result.similar_cases.length > 0 && (
        <section className="rounded-xl bg-white dark:bg-[#0c1f38] border-2 border-slate-200 dark:border-[#1b3a63] shadow-sm p-4 sm:p-5">
          <SimilarCases cases={result.similar_cases} title="Verified Law Enforcement Incident Precedents" />
        </section>
      )}

      {/* Copy + Share */}
      <div className="rounded-xl bg-white dark:bg-[#0c1f38] border border-slate-200 dark:border-[#1b3a63] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div>
          <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Share Threat Dossier
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Copy the structured incident summary to provide to police, cyber cell, or family.
          </p>
        </div>
        <CopyButton
          text={copyText}
          label="Copy Incident Report"
          copiedLabel="Incident Report Copied!"
          className="px-4 py-2 bg-slate-100 dark:bg-[#15325b] hover:bg-slate-200 dark:hover:bg-[#1d437a] text-slate-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider border border-slate-300 dark:border-[#2b5997]"
        />
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl bg-slate-50 dark:bg-[#071324] border border-slate-200 dark:border-[#162f52] p-4 text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <p className="font-semibold">{result.disclaimer || t.result.disclaimer}</p>
        <p className="font-bold text-slate-700 dark:text-slate-300">
          Official statutory advisory: Indian Police / CBI never arrest or solicit settlements over chat or video calls.
        </p>
        {result.analyzed_at && (
          <p className="text-[11px] font-mono opacity-80 pt-1">
            Verification Timestamp: {new Date(result.analyzed_at).toLocaleString()}
          </p>
        )}
      </div>

      {/* Check another */}
      <button
        type="button"
        onClick={onCheckAnother}
        className="w-full min-h-[46px] rounded-lg border-2 border-[#1d4ed8] text-blue-700 dark:text-amber-300 bg-white dark:bg-[#0c1f38] hover:bg-blue-50 dark:hover:bg-[#15325b] font-black text-xs uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      >
        Verify Another Incident / Notice
      </button>
    </div>
  );
}
