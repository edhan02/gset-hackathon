import type { RiskLevel } from '../types';

export interface EvalRow {
  text: string;
  label: 'scam' | 'legit';
  predicted?: RiskLevel;
  score?: number;
  error?: string;
}

export type ThresholdLevel = 'MEDIUM' | 'HIGH';

export interface Metrics {
  tp: number;
  fp: number;
  tn: number;
  fn: number;
  precision: number;
  recall: number;
  f1: number;
  falseAlarmRate: number;
}

export function computeMetrics(rows: EvalRow[], threshold: ThresholdLevel): Metrics {
  let tp = 0;
  let fp = 0;
  let tn = 0;
  let fn = 0;

  for (const row of rows) {
    if (!row.predicted) {
      continue;
    }

    const isPredictedScam =
      threshold === 'MEDIUM'
        ? row.predicted === 'MEDIUM' || row.predicted === 'HIGH'
        : row.predicted === 'HIGH';

    const isActualScam = row.label === 'scam';

    if (isActualScam && isPredictedScam) {
      tp++;
    } else if (!isActualScam && isPredictedScam) {
      fp++;
    } else if (!isActualScam && !isPredictedScam) {
      tn++;
    } else if (isActualScam && !isPredictedScam) {
      fn++;
    }
  }

  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  const falseAlarmRate = fp + tn > 0 ? fp / (fp + tn) : 0;

  return {
    tp,
    fp,
    tn,
    fn,
    precision,
    recall,
    f1,
    falseAlarmRate,
  };
}
