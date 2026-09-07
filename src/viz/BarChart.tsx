import { CHART_PLOT_BOTTOM, CHART_PLOT_LEFT, CHART_PLOT_RIGHT, computeBars, computeTicks, yFor } from './chartGeometry';

const FAINT = 'color-mix(in srgb, currentColor 72%, transparent)';

export interface BarChartPoint {
  id: string;
  n: number;
  valueVPerM: number;
  over: boolean;
}

interface BarChartProps {
  points: BarChartPoint[];
  limitVPerM: number;
}

export function BarChart({ points, limitVPerM }: BarChartProps) {
  const ticks = computeTicks();
  const bars = computeBars(points);
  const limitY = yFor(limitVPerM);

  return (
    <svg viewBox="0 0 660 300" width={660} height={300} style={{ display: 'block', flex: 'none', maxWidth: 'none', color: 'var(--color-text)' }} role="img" aria-label="Field strength chart">
      {ticks.map((t) => (
        <g key={t.value}>
          <line x1={CHART_PLOT_LEFT} y1={t.y} x2={CHART_PLOT_RIGHT} y2={t.y} stroke="var(--color-divider)" strokeWidth={1} />
          <text x={46} y={t.y + 5} textAnchor="end" fontSize={14} fill={FAINT} style={{ fontVariantNumeric: 'tabular-nums' }}>
            {t.value.toFixed(1)}
          </text>
        </g>
      ))}

      {bars.map((b) => (
        <g key={b.id}>
          <rect x={b.x} y={b.y} width={b.width} height={b.height} fill={b.over ? 'var(--color-danger)' : 'var(--color-accent)'} />
          <text x={b.x + b.width / 2} y={b.y - 9} textAnchor="middle" fontSize={14} fill="currentColor" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {b.valueLabel}
          </text>
          <text x={b.x + b.width / 2} y={288} textAnchor="middle" fontSize={14} fill={FAINT} style={{ fontVariantNumeric: 'tabular-nums' }}>
            {b.n}
          </text>
        </g>
      ))}

      <line x1={CHART_PLOT_LEFT} y1={limitY} x2={CHART_PLOT_RIGHT} y2={limitY} stroke="var(--color-accent)" strokeWidth={1.5} strokeDasharray="6 4" />
      <text x={60} y={limitY - 8} textAnchor="start" fontSize={14} fill="var(--color-accent-700)" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {`Limit ${limitVPerM.toFixed(2)} V/m`}
      </text>
      <line x1={CHART_PLOT_LEFT} y1={CHART_PLOT_BOTTOM} x2={CHART_PLOT_RIGHT} y2={CHART_PLOT_BOTTOM} stroke="color-mix(in srgb, currentColor 35%, transparent)" />
    </svg>
  );
}
