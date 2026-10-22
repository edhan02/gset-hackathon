import type { Metrics } from '../../lib/metrics';
import type { Strings } from '../../i18n';

interface MetricsDisplayProps {
  metrics: Metrics;
  t: Strings;
}

function MetricCard({ label, value }: { label: string; value: number }) {
  const pct = isNaN(value) ? '—' : `${(value * 100).toFixed(1)}%`;
  const color =
    isNaN(value) ? 'text-gray-400' :
    value >= 0.8 ? 'text-green-600 dark:text-green-400' :
    value >= 0.5 ? 'text-amber-600 dark:text-amber-400' :
    'text-red-600 dark:text-red-400';
  return (
    <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 text-center">
      <p className={`text-2xl font-bold ${color}`}>{pct}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
    </div>
  );
}

export default function MetricsDisplay({ metrics, t }: MetricsDisplayProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <MetricCard label={t.evaluation.precision} value={metrics.precision} />
      <MetricCard label={t.evaluation.recall} value={metrics.recall} />
      <MetricCard label={t.evaluation.f1} value={metrics.f1} />
      <MetricCard label={t.evaluation.falseAlarmRate} value={metrics.falseAlarmRate} />
    </div>
  );
}
