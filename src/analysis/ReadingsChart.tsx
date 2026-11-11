import { useCallback, useRef, type PointerEvent, type RefObject } from 'react';
import type { ReadingUnit } from '../utils/units';
import { unitLabel } from '../utils/units';
import {
  CHART_HEIGHT,
  CHART_WIDTH,
  PLOT_BOTTOM,
  PLOT_LEFT,
  PLOT_RIGHT,
  PLOT_TOP,
  computeBarGeometry,
  computeNiceMax,
  computeTicks,
  valueForY,
  yFor,
} from './chartScale';

const BG = '#151c28';
const GRID = '#3b494b';
const AXIS_TEXT = '#b9cacb';
const PASS = '#65f2b5';
const FAIL = '#ffb4ab';
const NEUTRAL_BAR = '#6b8299'; // bars when no limit is selected (no pass/fail judgement)
const BAR_RADIUS = 4;

interface ReadingsChartDatum {
  order: number;
  value: number;
}

export interface ChartLimit {
  key: string;
  kind: 'standard' | 'custom';
  refId: string;
  label: string;
  valueInUnit: number;
  color: string;
}

interface ReadingsChartProps {
  data: ReadingsChartDatum[];
  unit: ReadingUnit;
  limits: ChartLimit[];
  /** The most-restrictive limit in the current unit; null when no limit is selected. */
  activeThresholdInUnit: number | null;
  svgRef: RefObject<SVGSVGElement | null>;
  onCustomLimitChange: (customRefId: string, valueInUnit: number) => void;
}

function barPath(x: number, width: number, yTop: number): string {
  const r = Math.min(BAR_RADIUS, width / 2);
  return [
    `M ${x} ${PLOT_BOTTOM}`,
    `L ${x} ${yTop + r}`,
    `Q ${x} ${yTop} ${x + r} ${yTop}`,
    `L ${x + width - r} ${yTop}`,
    `Q ${x + width} ${yTop} ${x + width} ${yTop + r}`,
    `L ${x + width} ${PLOT_BOTTOM}`,
    'Z',
  ].join(' ');
}

export function ReadingsChart({ data, unit, limits, activeThresholdInUnit, svgRef, onCustomLimitChange }: ReadingsChartProps) {
  const draggingRefId = useRef<string | null>(null);
  const maxValue = Math.max(...data.map((d) => d.value), ...limits.map((l) => l.valueInUnit), 0);
  const niceMax = computeNiceMax(maxValue);
  const ticks = computeTicks(niceMax);
  const u = unitLabel(unit);

  const valueFromClientY = useCallback(
    (clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return null;
      const rect = svg.getBoundingClientRect();
      const localY = (clientY - rect.top) * (CHART_HEIGHT / rect.height);
      return Math.round(Math.min(Math.max(valueForY(localY, niceMax), 0), niceMax) * 100) / 100;
    },
    [niceMax, svgRef],
  );

  const handlePointerDown = (refId: string) => (e: PointerEvent<SVGLineElement>) => {
    draggingRefId.current = refId;
    e.currentTarget.setPointerCapture(e.pointerId);
    const v = valueFromClientY(e.clientY);
    if (v !== null) onCustomLimitChange(refId, v);
  };

  const handlePointerMove = (e: PointerEvent<SVGLineElement>) => {
    if (draggingRefId.current === null) return;
    const v = valueFromClientY(e.clientY);
    if (v !== null) onCustomLimitChange(draggingRefId.current, v);
  };

  const handlePointerUp = (e: PointerEvent<SVGLineElement>) => {
    draggingRefId.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      width="100%"
      // Never scale past natural size (labels are in user units, so upscaling bloats them);
      // narrower containers scale it down, still fully visible.
      style={{ maxWidth: CHART_WIDTH, height: 'auto' }}
      className="readings-chart"
      role="img"
      aria-label={`Field readings chart in ${u}`}
    >
      <rect x={0} y={0} width={CHART_WIDTH} height={CHART_HEIGHT} fill={BG} />

      {ticks.map((t) => (
        <g key={t.value}>
          <line x1={PLOT_LEFT} y1={t.y} x2={PLOT_RIGHT} y2={t.y} stroke={GRID} strokeWidth={1} />
          <text x={PLOT_LEFT - 8} y={t.y + 4} textAnchor="end" fontSize={11} fill={AXIS_TEXT}>
            {t.value.toFixed(2).replace(/\.?0+$/, '') || '0'}
          </text>
        </g>
      ))}
      <line x1={PLOT_LEFT} y1={PLOT_BOTTOM} x2={PLOT_RIGHT} y2={PLOT_BOTTOM} stroke={GRID} strokeWidth={1} />

      {data.map((d, i) => {
        const { x, width } = computeBarGeometry(i, data.length);
        const yTop = yFor(d.value, niceMax);
        const pass = activeThresholdInUnit === null ? null : d.value <= activeThresholdInUnit;
        const fill = pass === null ? NEUTRAL_BAR : pass ? PASS : FAIL;
        const statusText = pass === null ? 'no limit' : pass ? 'Pass' : 'Exceed';
        return (
          <g key={d.order}>
            <path d={barPath(x, width, yTop)} fill={fill}>
              <title>
                Waypoint {d.order + 1}: {d.value.toFixed(2)} {u} ({statusText})
              </title>
            </path>
            <text x={x + width / 2} y={PLOT_BOTTOM + 16} textAnchor="middle" fontSize={10} fill={AXIS_TEXT}>
              {d.order + 1}
            </text>
          </g>
        );
      })}

      {limits.map((limit) => {
        const y = yFor(Math.min(limit.valueInUnit, niceMax), niceMax);
        return (
          <g key={limit.key}>
            <line x1={PLOT_LEFT} y1={y} x2={PLOT_RIGHT} y2={y} stroke={limit.color} strokeWidth={2} strokeDasharray="6 4" pointerEvents="none" />
            {limit.kind === 'custom' && (
              <line
                x1={PLOT_LEFT}
                y1={y}
                x2={PLOT_RIGHT}
                y2={y}
                stroke="transparent"
                strokeWidth={16}
                style={{ cursor: 'ns-resize' }}
                onPointerDown={handlePointerDown(limit.refId)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              >
                <title>Drag to adjust this custom limit</title>
              </line>
            )}
            <text x={PLOT_RIGHT} y={y - 5} textAnchor="end" fontSize={11} fontWeight={600} fill={limit.color}>
              {limit.label}: {limit.valueInUnit.toFixed(2)} {u}
            </text>
          </g>
        );
      })}

      <text
        x={16}
        y={(PLOT_TOP + PLOT_BOTTOM) / 2}
        textAnchor="middle"
        fontSize={11}
        fill={AXIS_TEXT}
        transform={`rotate(-90, 16, ${(PLOT_TOP + PLOT_BOTTOM) / 2})`}
      >
        {u}
      </text>
    </svg>
  );
}
