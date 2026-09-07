import { useRef, type MouseEvent } from 'react';
import type { SignalReading, Waypoint } from '../types/domain';
import { PIXELS_PER_UNIT, clientPointToGrid } from '../canvas/coordinates';
import { computeFloorPlanMarkers, type FloorPlanMode } from './floorPlanGeometry';

const FAINT = 'color-mix(in srgb, currentColor 72%, transparent)';
const HAIRLINE = 'color-mix(in srgb, currentColor 45%, transparent)';
const RANGE_RINGS_M = [5, 10, 15];

interface FloorPlanProps {
  waypoints: Waypoint[];
  mode: FloorPlanMode;
  readingByWaypointId?: Map<string, SignalReading>;
  limitVPerM?: number;
  onAddPoint?: (x: number, y: number) => void;
  onMarkerClick?: (id: string) => void;
}

export function FloorPlan({ waypoints, mode, readingByWaypointId, limitVPerM = 0, onAddPoint, onMarkerClick }: FloorPlanProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const sorted = [...waypoints].sort((a, b) => a.order - b.order);
  const readings = readingByWaypointId ?? new Map<string, SignalReading>();
  const markers = computeFloorPlanMarkers(sorted, mode, readings, limitVPerM);

  const pathPoints = sorted.length > 0 ? [...sorted, sorted[0]] : [];
  const pathPts = pathPoints.map((wp) => `${wp.x * PIXELS_PER_UNIT},${wp.y * PIXELS_PER_UNIT}`).join(' ');

  const gridLines: { key: string; x1: number; y1: number; x2: number; y2: number }[] = [];
  const axisLabels: { key: string; x: number; y: number; text: string; anchor: 'middle' | 'end' }[] = [];
  for (let i = 0; i <= 8; i++) {
    const p = i * 100;
    gridLines.push({ key: `gv${i}`, x1: p, y1: 0, x2: p, y2: 800 });
    gridLines.push({ key: `gh${i}`, x1: 0, y1: p, x2: 800, y2: p });
    const label = String((i - 4) * 5);
    axisLabels.push({ key: `ax${i}`, x: p, y: -10, text: label, anchor: 'middle' });
    axisLabels.push({ key: `ay${i}`, x: -10, y: p + 5, text: label, anchor: 'end' });
  }

  const handleClick = (e: MouseEvent<SVGSVGElement>) => {
    if (mode !== 'path' || !onAddPoint || !svgRef.current) return;
    const grid = clientPointToGrid(svgRef.current, e.clientX, e.clientY);
    onAddPoint(grid.x, grid.y);
  };

  return (
    <svg
      ref={svgRef}
      viewBox="-40 -30 880 858"
      width="784"
      height="764"
      style={{ display: 'block', flex: 'none', color: 'var(--color-text)', cursor: mode === 'path' ? 'crosshair' : undefined }}
      role="img"
      aria-label="Measurement floor plan"
      onClick={handleClick}
    >
      {gridLines.map((l) => (
        <line key={l.key} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="var(--color-divider)" strokeWidth={1} />
      ))}
      {axisLabels.map((a) => (
        <text
          key={a.key}
          x={a.x}
          y={a.y}
          textAnchor={a.anchor}
          fontSize={15}
          fill={FAINT}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {a.text}
        </text>
      ))}

      <rect x={0} y={0} width={800} height={800} fill="none" stroke="color-mix(in srgb, currentColor 35%, transparent)" strokeWidth={1} />

      <g transform="translate(400,400)">
        {RANGE_RINGS_M.map((m) => (
          <g key={`ring${m}`}>
            <circle r={m * 20} fill="none" stroke="color-mix(in srgb, currentColor 22%, transparent)" strokeWidth={1} strokeDasharray="2 6" />
            <text x={m * 20 - 6} y={20} fontSize={14} fill={FAINT} textAnchor="end" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {m} m
            </text>
          </g>
        ))}
        <line x1={-360} y1={0} x2={360} y2={0} stroke="color-mix(in srgb, currentColor 18%, transparent)" strokeWidth={1} />
        <line x1={0} y1={-360} x2={0} y2={360} stroke="color-mix(in srgb, currentColor 18%, transparent)" strokeWidth={1} />
      </g>

      <g transform="translate(400,400)">
        <rect x={-75} y={-40} width={150} height={80} fill="none" stroke="currentColor" strokeWidth={1.5} />
        <rect x={-14} y={-30} width={58} height={60} fill="none" stroke="color-mix(in srgb, currentColor 45%, transparent)" strokeWidth={1} />
        <line x1={-75} y1={-40} x2={-14} y2={-30} stroke="color-mix(in srgb, currentColor 25%, transparent)" />
        <line x1={-75} y1={40} x2={-14} y2={30} stroke="color-mix(in srgb, currentColor 25%, transparent)" />
        <circle r={3} fill="var(--color-accent)" />
        <text
          y={-52}
          textAnchor="middle"
          fontSize={15}
          fontFamily="var(--font-heading)"
          letterSpacing="0.1em"
          fill="color-mix(in srgb, currentColor 78%, transparent)"
        >
          DEVICE UNDER TEST
        </text>
        <text y={60} textAnchor="middle" fontSize={14} fill="color-mix(in srgb, currentColor 72%, transparent)" style={{ fontVariantNumeric: 'tabular-nums' }}>
          0.0, 0.0 m
        </text>
      </g>

      {pathPts && <polyline points={pathPts} fill="none" stroke="var(--color-accent)" strokeWidth={1.5} strokeDasharray="7 5" />}

      {markers.map((m) => (
        <g
          key={m.id}
          transform={`translate(${m.cx}, ${m.cy})`}
          onClick={mode === 'points' && onMarkerClick ? (e) => { e.stopPropagation(); onMarkerClick(m.id); } : undefined}
          style={mode === 'points' && onMarkerClick ? { cursor: 'pointer' } : undefined}
        >
          {mode === 'points' && onMarkerClick && <circle r={14} fill="transparent" />}
          {m.hasValue && (
            <circle
              r={m.ringRadius}
              strokeWidth={m.over ? 2 : 1}
              stroke={m.color}
              fill={m.over ? 'color-mix(in srgb, var(--color-danger) 14%, transparent)' : 'color-mix(in srgb, var(--color-accent) 12%, transparent)'}
            />
          )}
          {m.filled ? (
            <circle r={6} fill={m.color} stroke={m.color} strokeWidth={1.5} />
          ) : (
            <circle r={6} fill="var(--color-bg)" stroke={HAIRLINE} strokeWidth={1.5} />
          )}
          {m.hasValue ? (
            <>
              <text x={m.numberLabel.x} y={m.numberLabel.y} textAnchor="middle" fill="currentColor" fontSize={15} style={{ fontVariantNumeric: 'tabular-nums' }}>
                {m.n}
              </text>
              {m.valueLabel && (
                <text x={m.valueLabel.x} y={m.valueLabel.y} textAnchor="middle" fontSize={14} fill={m.color} style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {m.valueLabel.text}
                </text>
              )}
            </>
          ) : (
            <text x={0} y={-15} textAnchor="middle" fill="currentColor" fontSize={15} style={{ fontVariantNumeric: 'tabular-nums' }}>
              {m.n}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
