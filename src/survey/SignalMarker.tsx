import type { Waypoint } from '../types/domain';
import { PIXELS_PER_UNIT } from '../canvas/coordinates';
import { signalColor } from '../utils/signalColor';

interface SignalMarkerProps {
  waypoint: Waypoint;
  fieldStrengthVPerM: number;
}

export function SignalMarker({ waypoint, fieldStrengthVPerM }: SignalMarkerProps) {
  return (
    <g transform={`translate(${waypoint.x * PIXELS_PER_UNIT}, ${waypoint.y * PIXELS_PER_UNIT})`} className="signal-marker">
      <circle r={10} fill={signalColor(fieldStrengthVPerM)} className="signal-marker-dot" />
      <text y={-14} textAnchor="middle" className="signal-marker-label">
        {fieldStrengthVPerM.toFixed(1)} V/m
      </text>
    </g>
  );
}
