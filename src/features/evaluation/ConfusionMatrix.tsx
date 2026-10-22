import type { Metrics } from '../../lib/metrics';
import type { Strings } from '../../i18n';

interface ConfusionMatrixProps {
  metrics: Metrics;
  t: Strings;
}

function Cell({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-4 rounded-xl border ${color}`}>
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs text-center mt-1 leading-tight opacity-80">{label}</span>
    </div>
  );
}

export default function ConfusionMatrix({ metrics, t }: ConfusionMatrixProps) {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
        {t.evaluation.confusionMatrix}
      </h3>

      {/* Matrix labels */}
      <div className="grid grid-cols-[auto_1fr_1fr] gap-2 text-xs text-center">
        {/* Header row */}
        <div className="col-start-2 font-semibold text-gray-600 dark:text-gray-400 py-1">
          {t.evaluation.predScam}
        </div>
        <div className="font-semibold text-gray-600 dark:text-gray-400 py-1">
          {t.evaluation.predLegit}
        </div>

        {/* Row 1: Actual Scam */}
        <div className="flex items-center justify-end pr-2 font-semibold text-gray-600 dark:text-gray-400 text-right leading-tight">
          {t.evaluation.actualScam}
        </div>
        <Cell
          value={metrics.tp}
          label="TP"
          color="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-800 dark:text-green-300"
        />
        <Cell
          value={metrics.fn}
          label="FN"
          color="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-800 dark:text-red-300"
        />

        {/* Row 2: Actual Legit */}
        <div className="flex items-center justify-end pr-2 font-semibold text-gray-600 dark:text-gray-400 text-right leading-tight">
          {t.evaluation.actualLegit}
        </div>
        <Cell
          value={metrics.fp}
          label="FP"
          color="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-300"
        />
        <Cell
          value={metrics.tn}
          label="TN"
          color="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-800 dark:text-green-300"
        />
      </div>
    </div>
  );
}
