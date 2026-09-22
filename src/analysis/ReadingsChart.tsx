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
const ACCENT = '#00f0ff';
const PASS = '#65f2b5';
const FAIL = '#ffb4ab';
const BAR_RADIUS = 4;

interface ReadingsChartDatum {
  order: number;
  value: number;
}

interface ReadingsChartProps {
  data: ReadingsChartDatum[];
  unit: ReadingUnit;
  threshold: number;
  svgRef: RefObject<SVGSVGElement | null>;
  onThresholdChange: (value: number) => void;
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

export function ReadingsChart({ data, unit, threshold, svgRef, onThresholdChange }: ReadingsChartProps) {
  const draggingRef = useRef(false);
  const maxValue = Math.max(threshold, ...data.map((d) => d.value), 0);
  const niceMax = computeNiceMax(maxValue);
  const ticks = computeTicks(niceMax);
  const limitY = yFor(Math.min(threshold, niceMax), niceMax);

  const updateFromClientY = useCallback(
    (clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const scaleY = CHART_HEIGHT / rect.height;
      const localY = (clientY - rect.top) * scaleY;
      const value = Math.min(Math.max(valueForY(localY, niceMax), 0), niceMax);
      onThresholdChange(Math.round(value * 100) / 100);
    },
    [niceMax, onThresholdChange, svgRef],
  );

  const handlePointerDown = (e: PointerEvent<SVGLineElement>) => {
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromClientY(e.clientY);
  };

  const handlePointerMove = (e: PointerEvent<SVGLineElement>) => {
    if (!draggingRef.current) return;
    updateFromClientY(e.clientY);
  };

  const handlePointerUp = (e: PointerEvent<SVGLineElement>) => {
    draggingRef.current = false;
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
      aria-label={`Field readings chart in ${unitLabel(unit)}`}
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
        const pass = d.value <= threshold;
        return (
          <g key={d.order}>
            <path d={barPath(x, width, yTop)} fill={pass ? PASS : FAIL}>
              <title>
                Waypoint {d.order + 1}: {d.value.toFixed(2)} {unitLabel(unit)} ({pass ? 'Pass' : 'Fail'})
              </title>
            </path>
            <text x={x + width / 2} y={PLOT_BOTTOM + 16} textAnchor="middle" fontSize={10} fill={AXIS_TEXT}>
              {d.order + 1}
            </text>
          </g>
        );
      })}

      <g>
        <line
          x1={PLOT_LEFT}
          y1={limitY}
          x2={PLOT_RIGHT}
          y2={limitY}
          stroke={ACCENT}
          strokeWidth={2}
          strokeDasharray="6 4"
          pointerEvents="none"
        />
        <line
          x1={PLOT_LEFT}
          y1={limitY}
          x2={PLOT_RIGHT}
          y2={limitY}
          stroke="transparent"
          strokeWidth={16}
          style={{ cursor: 'ns-resize' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <title>Drag to adjust the pass/fail limit</title>
        </line>
      </g>
      <text x={PLOT_RIGHT} y={limitY - 6} textAnchor="end" fontSize={11} fill={ACCENT} fontWeight={600}>
        Limit: {threshold.toFixed(2)} {unitLabel(unit)}
      </text>
      <text
        x={16}
        y={(PLOT_TOP + PLOT_BOTTOM) / 2}
        textAnchor="middle"
        fontSize={11}
        fill={AXIS_TEXT}
        transform={`rotate(-90, 16, ${(PLOT_TOP + PLOT_BOTTOM) / 2})`}
      >
        {unitLabel(unit)}
      </text>
    </svg>
  );
}
