import { describe, it, expect } from 'vitest';
import { computeMetrics } from '../lib/metrics';
import type { EvalRow } from '../lib/metrics';

describe('computeMetrics()', () => {
  it('all correct scam predictions — perfect precision & recall', () => {
    const rows: EvalRow[] = [
      { text: 'a', label: 'scam', predicted: 'HIGH' },
      { text: 'b', label: 'scam', predicted: 'MEDIUM' },
    ];
    const m = computeMetrics(rows, 'MEDIUM');
    expect(m.tp).toBe(2);
    expect(m.fp).toBe(0);
    expect(m.fn).toBe(0);
    expect(m.tn).toBe(0);
    expect(m.precision).toBe(1);
    expect(m.recall).toBe(1);
    expect(m.f1).toBe(1);
  });

  it('all correct legit predictions', () => {
    const rows: EvalRow[] = [
      { text: 'a', label: 'legit', predicted: 'LOW' },
      { text: 'b', label: 'legit', predicted: 'LOW' },
    ];
    const m = computeMetrics(rows, 'MEDIUM');
    expect(m.tp).toBe(0);
    expect(m.fp).toBe(0);
    expect(m.tn).toBe(2);
    expect(m.fn).toBe(0);
    expect(m.precision).toBe(0);
    expect(m.recall).toBe(0);
    expect(m.falseAlarmRate).toBe(0);
  });

  it('mixed: 2 TP, 1 FP, 1 TN, 1 FN', () => {
    const rows: EvalRow[] = [
      { text: 'a', label: 'scam', predicted: 'HIGH' },   // TP
      { text: 'b', label: 'scam', predicted: 'MEDIUM' }, // TP
      { text: 'c', label: 'legit', predicted: 'HIGH' },  // FP
      { text: 'd', label: 'legit', predicted: 'LOW' },   // TN
      { text: 'e', label: 'scam', predicted: 'LOW' },    // FN
    ];
    const m = computeMetrics(rows, 'MEDIUM');
    expect(m.tp).toBe(2);
    expect(m.fp).toBe(1);
    expect(m.tn).toBe(1);
    expect(m.fn).toBe(1);
    // precision = 2/3
    expect(m.precision).toBeCloseTo(2 / 3, 5);
    // recall = 2/3
    expect(m.recall).toBeCloseTo(2 / 3, 5);
    // FAR = 1/2
    expect(m.falseAlarmRate).toBeCloseTo(0.5, 5);
  });

  it('threshold HIGH: only HIGH counts as predicted scam', () => {
    const rows: EvalRow[] = [
      { text: 'a', label: 'scam', predicted: 'MEDIUM' }, // FN with HIGH threshold
      { text: 'b', label: 'scam', predicted: 'HIGH' },   // TP
      { text: 'c', label: 'legit', predicted: 'MEDIUM' },// TN with HIGH threshold
    ];
    const m = computeMetrics(rows, 'HIGH');
    expect(m.tp).toBe(1);
    expect(m.fn).toBe(1);
    expect(m.tn).toBe(1);
    expect(m.fp).toBe(0);
  });

  it('all predictions wrong', () => {
    const rows: EvalRow[] = [
      { text: 'a', label: 'scam', predicted: 'LOW' },   // FN
      { text: 'b', label: 'legit', predicted: 'HIGH' },  // FP
    ];
    const m = computeMetrics(rows, 'MEDIUM');
    expect(m.tp).toBe(0);
    expect(m.fn).toBe(1);
    expect(m.fp).toBe(1);
    expect(m.tn).toBe(0);
    expect(m.recall).toBe(0);
    expect(m.precision).toBe(0);
    expect(m.f1).toBe(0);
    expect(m.falseAlarmRate).toBe(1);
  });

  it('edge: no scam rows — recall is 0 (no NaN)', () => {
    const rows: EvalRow[] = [
      { text: 'a', label: 'legit', predicted: 'LOW' },
      { text: 'b', label: 'legit', predicted: 'HIGH' },
    ];
    const m = computeMetrics(rows, 'MEDIUM');
    expect(m.tp).toBe(0);
    expect(m.fn).toBe(0);
    expect(Number.isNaN(m.recall)).toBe(false);
    expect(m.recall).toBe(0);
  });

  it('skips rows with no predicted value', () => {
    const rows: EvalRow[] = [
      { text: 'a', label: 'scam' }, // no predicted
      { text: 'b', label: 'scam', predicted: 'HIGH' }, // TP
    ];
    const m = computeMetrics(rows, 'MEDIUM');
    expect(m.tp).toBe(1);
    // The row without prediction is skipped
    expect(m.fn).toBe(0);
  });
});
