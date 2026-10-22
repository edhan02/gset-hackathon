import { useState, useRef, useCallback } from 'react';
import { analyze } from '../api/client';
import { computeMetrics } from '../lib/metrics';
import ConfusionMatrix from '../features/evaluation/ConfusionMatrix';
import MetricsDisplay from '../features/evaluation/MetricsDisplay';
import { useLang } from '../hooks/useLang';
import type { EvalRow, ThresholdLevel } from '../lib/metrics';
import type { RiskLevel } from '../types';

// --- CSV parser (no library) ---
function parseCsv(text: string): { text: string; label: 'scam' | 'legit' }[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const header = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim().toLowerCase());
  const textIdx = header.indexOf('text');
  const labelIdx = header.indexOf('label');
  if (textIdx === -1 || labelIdx === -1) return [];

  const rows: { text: string; label: 'scam' | 'legit' }[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const rawText = (cols[textIdx] ?? '').replace(/^"|"$/g, '').trim();
    const rawLabel = (cols[labelIdx] ?? '').replace(/^"|"$/g, '').trim().toLowerCase();
    if (rawText && (rawLabel === 'scam' || rawLabel === 'legit')) {
      rows.push({ text: rawText, label: rawLabel });
    }
  }
  return rows;
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function parseJson(text: string): { text: string; label: 'scam' | 'legit' }[] {
  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) return [];
    const rows: { text: string; label: 'scam' | 'legit' }[] = [];
    for (const item of parsed) {
      if (
        typeof item === 'object' &&
        typeof item.text === 'string' &&
        (item.label === 'scam' || item.label === 'legit')
      ) {
        rows.push({ text: item.text, label: item.label });
      }
    }
    return rows;
  } catch {
    return [];
  }
}

function exportCsv(rows: EvalRow[]): void {
  const header = 'text,label,predicted,score,status\n';
  const csvRows = rows.map((r) => {
    const text = `"${r.text.replace(/"/g, '""').slice(0, 200)}"`;
    const label = r.label;
    const predicted = r.predicted ?? '';
    const score = r.score !== undefined ? String(r.score) : '';
    const status = r.error ? `"Error: ${r.error}"` : r.predicted ? 'done' : 'pending';
    return `${text},${label},${predicted},${score},${status}`;
  });
  const blob = new Blob([header + csvRows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'evaluation-results.csv';
  a.click();
  URL.revokeObjectURL(url);
}

type RunStatus = 'idle' | 'running' | 'done';

export default function EvaluationPage() {
  const { t } = useLang();
  const [rows, setRows] = useState<EvalRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [runStatus, setRunStatus] = useState<RunStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [threshold, setThreshold] = useState<ThresholdLevel>('MEDIUM');
  const abortRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasResults = rows.some((r) => r.predicted !== undefined || r.error !== undefined);
  const doneRows = rows.filter((r) => r.predicted !== undefined || r.error !== undefined);
  const metrics = hasResults ? computeMetrics(doneRows, threshold) : null;

  const handleFile = async (file: File) => {
    setParseError(null);
    setRows([]);
    setRunStatus('idle');
    setProgress(0);

    const text = await file.text();
    let parsed: { text: string; label: 'scam' | 'legit' }[];

    if (file.name.endsWith('.json')) {
      parsed = parseJson(text);
    } else {
      parsed = parseCsv(text);
    }

    if (parsed.length === 0) {
      setParseError('Could not parse any rows. Check the file format matches the expected schema.');
      return;
    }

    setRows(parsed.map((r) => ({ text: r.text, label: r.label })));
  };

  const runEvaluation = useCallback(async () => {
    if (rows.length === 0 || runStatus === 'running') return;

    abortRef.current = new AbortController();
    setRunStatus('running');
    setProgress(0);

    // Reset all rows
    setRows((prev) => prev.map((r) => ({ text: r.text, label: r.label })));

    for (let i = 0; i < rows.length; i++) {
      if (abortRef.current.signal.aborted) break;

      const row = rows[i];
      const result = await analyze(
        { type: 'text', value: row.text },
        abortRef.current.signal,
      );

      setRows((prev) => {
        const updated = [...prev];
        if (result.status === 'ok') {
          updated[i] = {
            ...updated[i],
            predicted: result.data.risk.level as RiskLevel,
            score: result.data.risk.score,
          };
        } else {
          updated[i] = { ...updated[i], error: result.message };
        }
        return updated;
      });

      setProgress(i + 1);
    }

    setRunStatus('done');
  }, [rows, runStatus]);

  const cancelEvaluation = () => {
    abortRef.current?.abort();
    setRunStatus('done');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.evaluation.title}</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t.evaluation.instructions}</p>
      </div>

      {/* Threshold selector */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-5">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {t.evaluation.thresholdLabel}
        </label>
        <div className="flex gap-3">
          {(['MEDIUM', 'HIGH'] as ThresholdLevel[]).map((thr) => (
            <label
              key={thr}
              className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300"
            >
              <input
                type="radio"
                name="threshold"
                value={thr}
                checked={threshold === thr}
                onChange={() => setThreshold(thr)}
                className="accent-teal-600"
              />
              {thr === 'MEDIUM' ? t.evaluation.thresholdMedium : t.evaluation.thresholdHigh}
            </label>
          ))}
        </div>
      </div>

      {/* File upload */}
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-5">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
          {t.evaluation.uploadLabel}
        </label>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">{t.evaluation.expectedFormat}</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="min-h-[44px] px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        >
          Choose file (.json or .csv)
        </button>
        {parseError && (
          <p className="mt-2 text-xs text-red-500 dark:text-red-400" role="alert">{parseError}</p>
        )}
        {rows.length > 0 && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {t.evaluation.rowCount}: <strong>{rows.length}</strong>
          </p>
        )}
      </div>

      {/* Empty state */}
      {rows.length === 0 && !parseError && (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-10 text-center">
          <p className="text-gray-400 dark:text-gray-500 text-sm">{t.evaluation.noFile}</p>
          <div className="mt-4 text-xs text-left inline-block bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4 font-mono text-gray-500 dark:text-gray-400">
            <p className="font-semibold mb-1 font-sans">JSON format:</p>
            <p>{`[`}</p>
            <p className="pl-4">{`{ "text": "Your bank account...", "label": "scam" },`}</p>
            <p className="pl-4">{`{ "text": "Reminder: your EMI...", "label": "legit" }`}</p>
            <p>{`]`}</p>
            <p className="font-semibold mt-3 mb-1 font-sans">CSV format:</p>
            <p>text,label</p>
            <p>&quot;Your bank account...&quot;,scam</p>
            <p>&quot;Reminder: your EMI...&quot;,legit</p>
          </div>
        </div>
      )}

      {/* Run controls */}
      {rows.length > 0 && (
        <div className="flex gap-3 items-center flex-wrap">
          <button
            type="button"
            onClick={runEvaluation}
            disabled={runStatus === 'running'}
            className="min-h-[44px] px-6 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            {t.evaluation.runBtn}
          </button>
          {runStatus === 'running' && (
            <button
              type="button"
              onClick={cancelEvaluation}
              className="min-h-[44px] px-6 rounded-xl border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              {t.evaluation.cancelBtn}
            </button>
          )}
          {runStatus === 'running' && (
            <span className="text-sm text-gray-500 dark:text-gray-400" aria-live="polite">
              {t.evaluation.progress}: {progress} / {rows.length}
            </span>
          )}
          {hasResults && (
            <button
              type="button"
              onClick={() => exportCsv(rows)}
              className="ml-auto min-h-[44px] px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              {t.evaluation.exportBtn}
            </button>
          )}
        </div>
      )}

      {/* Metrics */}
      {metrics && (
        <>
          <ConfusionMatrix metrics={metrics} t={t} />
          <MetricsDisplay metrics={metrics} t={t} />
        </>
      )}

      {/* Results table */}
      {rows.length > 0 && (
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-3 py-2 text-gray-600 dark:text-gray-400 font-semibold w-1/2">{t.evaluation.tableText}</th>
                  <th className="text-left px-3 py-2 text-gray-600 dark:text-gray-400 font-semibold">{t.evaluation.tableExpected}</th>
                  <th className="text-left px-3 py-2 text-gray-600 dark:text-gray-400 font-semibold">{t.evaluation.tablePredicted}</th>
                  <th className="text-left px-3 py-2 text-gray-600 dark:text-gray-400 font-semibold">{t.evaluation.tableScore}</th>
                  <th className="text-left px-3 py-2 text-gray-600 dark:text-gray-400 font-semibold">{t.evaluation.tableStatus}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300 max-w-[200px]">
                      <span className="line-clamp-2">{row.text.slice(0, 120)}{row.text.length > 120 ? '…' : ''}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${row.label === 'scam' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'}`}>
                        {row.label}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                      {row.predicted ? (
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          row.predicted === 'HIGH' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' :
                          row.predicted === 'MEDIUM' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                          'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                        }`}>{row.predicted}</span>
                      ) : row.error ? '—' : <span className="text-gray-400">Pending</span>}
                    </td>
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400 tabular-nums">
                      {row.score !== undefined ? row.score : '—'}
                    </td>
                    <td className="px-3 py-2">
                      {row.error ? (
                        <span className="text-red-500 dark:text-red-400 text-xs" title={row.error}>{t.evaluation.statusError}</span>
                      ) : row.predicted !== undefined ? (
                        <span className="text-green-600 dark:text-green-400 text-xs">{t.evaluation.statusDone}</span>
                      ) : runStatus === 'running' && i === progress ? (
                        <span className="text-teal-600 dark:text-teal-400 text-xs">{t.evaluation.statusRunning}</span>
                      ) : (
                        <span className="text-gray-400 text-xs">{t.evaluation.statusPending}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
