import type { AnalyzeResult } from '../types';

export function formatScore(score: number): string {
  const rounded = Math.round(score);
  return `${rounded}/100`;
}

export function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  return `${seconds}s`;
}

export function buildCopySummary(result: AnalyzeResult): string {
  const lines: string[] = [
    'Digital Arrest & Cyber Fraud Shield Analysis Report',
    `Risk Level: ${result.risk.level} (${formatScore(result.risk.score)})`,
    `Scam Type: ${result.scam_type}`,
    `Summary: ${result.summary}`,
    '',
  ];

  if (result.red_flags && result.red_flags.length > 0) {
    lines.push('Red Flags Detected:');
    result.red_flags.forEach((flag, i) => {
      lines.push(`${i + 1}. "${flag.phrase}" [${flag.category}]: ${flag.why}`);
    });
    lines.push('');
  }

  if (result.actions && result.actions.length > 0) {
    lines.push('Recommended Actions:');
    result.actions.forEach((action, i) => {
      lines.push(`${i + 1}. ${action}`);
    });
    lines.push('');
  }

  lines.push('Cybercrime Helpline: 1930');
  lines.push('National Cyber Crime Reporting Portal: https://cybercrime.gov.in');
  if (result.analyzed_at) {
    lines.push(`Analyzed: ${result.analyzed_at}`);
  }

  return lines.join('\n');
}
