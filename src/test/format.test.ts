import { describe, it, expect } from 'vitest';
import { formatScore, formatElapsed, buildCopySummary } from '../lib/format';
import type { AnalyzeResult } from '../types';

describe('formatScore()', () => {
  it('rounds and formats as x/100', () => {
    expect(formatScore(73)).toBe('73/100');
  });

  it('rounds a decimal', () => {
    expect(formatScore(73.7)).toBe('74/100');
  });

  it('handles 0', () => {
    expect(formatScore(0)).toBe('0/100');
  });

  it('handles 100', () => {
    expect(formatScore(100)).toBe('100/100');
  });
});

describe('formatElapsed()', () => {
  it('converts ms to seconds string', () => {
    expect(formatElapsed(12000)).toBe('12s');
  });

  it('floors partial seconds', () => {
    expect(formatElapsed(12999)).toBe('12s');
  });

  it('handles 0ms', () => {
    expect(formatElapsed(0)).toBe('0s');
  });

  it('handles 60s', () => {
    expect(formatElapsed(60000)).toBe('60s');
  });
});

describe('buildCopySummary()', () => {
  const result: AnalyzeResult = {
    ok: true,
    risk: { score: 85, level: 'HIGH' },
    scam_type: 'Digital arrest (impersonating CBI)',
    summary: 'This message shows patterns of digital arrest fraud.',
    red_flags: [
      { phrase: 'CBI', category: 'Authority', why: 'Fraudulent authority claim' },
    ],
    actions: ['Do not pay anything', 'Call 1930'],
    similar_cases: [],
    analyzed_text: 'You are under CBI investigation.',
    input_type: 'text',
    disclaimer: 'For awareness only.',
    analyzed_at: '2026-01-01T00:00:00Z',
  };

  it('contains the risk level', () => {
    expect(buildCopySummary(result)).toContain('HIGH');
  });

  it('contains the score', () => {
    expect(buildCopySummary(result)).toContain('85/100');
  });

  it('contains actions', () => {
    const summary = buildCopySummary(result);
    expect(summary).toContain('Do not pay anything');
    expect(summary).toContain('Call 1930');
  });

  it('contains the red flag phrase', () => {
    expect(buildCopySummary(result)).toContain('CBI');
  });

  it('contains the cybercrime helpline', () => {
    expect(buildCopySummary(result)).toContain('1930');
  });
});
