import type { RiskLevel } from '../types';

interface RiskGaugeProps {
  score: number;
  level: RiskLevel;
}

const RISK_COLORS: Record<RiskLevel, { stroke: string; text: string }> = {
  LOW: { stroke: '#16a34a', text: '#16a34a' },
  MEDIUM: { stroke: '#d97706', text: '#d97706' },
  HIGH: { stroke: '#dc2626', text: '#dc2626' },
};

export default function RiskGauge({ score, level }: RiskGaugeProps) {
  // SVG semicircle gauge
  const R = 52;
  const CX = 60;
  const CY = 60;
  const clampedScore = Math.max(0, Math.min(100, score));

  // Semicircle: from 180° to 0° (left to right)
  // Total arc = π radians (180°)
  const fraction = clampedScore / 100;
  const startAngle = Math.PI; // 180°
  const endAngle = Math.PI - fraction * Math.PI; // goes from π to 0

  const startX = CX + R * Math.cos(startAngle);
  const startY = CY + R * Math.sin(startAngle);
  const endX = CX + R * Math.cos(endAngle);
  const endY = CY + R * Math.sin(endAngle);

  const largeArc = fraction > 0.5 ? 1 : 0;

  const trackPath = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`;
  const fillPath =
    clampedScore === 0
      ? ''
      : `M ${startX} ${startY} A ${R} ${R} 0 ${largeArc} 1 ${endX} ${endY}`;

  const { stroke, text } = RISK_COLORS[level];

  return (
    <div
      className="flex flex-col items-center"
      role="img"
      aria-label={`Risk gauge: ${clampedScore} out of 100 (${level})`}
    >
      <svg width="120" height="68" viewBox="0 0 120 68" aria-hidden="true">
        {/* Track */}
        <path
          d={trackPath}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="10"
          strokeLinecap="round"
          className="dark:stroke-gray-700"
        />
        {/* Fill */}
        {fillPath && (
          <path
            d={fillPath}
            fill="none"
            stroke={stroke}
            strokeWidth="10"
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.4s ease' }}
          />
        )}
        {/* Score text */}
        <text
          x={CX}
          y={CY - 4}
          textAnchor="middle"
          fontSize="18"
          fontWeight="bold"
          fill={text}
        >
          {clampedScore}
        </text>
        <text
          x={CX}
          y={CY + 12}
          textAnchor="middle"
          fontSize="9"
          fill="#9ca3af"
        >
          / 100
        </text>
      </svg>
    </div>
  );
}
