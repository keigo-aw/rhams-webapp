import type { Waypoint } from '../types/domain';
import { PIXELS_PER_UNIT } from '../canvas/coordinates';

interface MeasurementMarkerProps {
  waypoint: Waypoint;
  n: number;
  onToggle: (id: string) => void;
}

export function MeasurementMarker({ waypoint, n, onToggle }: MeasurementMarkerProps) {
  return (
    <g
      transform={`translate(${waypoint.x * PIXELS_PER_UNIT}, ${waypoint.y * PIXELS_PER_UNIT})`}
      onClick={(e) => {
        e.stopPropagation();
        onToggle(waypoint.id);
      }}
    >
      <circle r={9} className={`measurement-marker${waypoint.isMeasurementPoint ? ' selected' : ''}`} />
      <text y={-14} textAnchor="middle" className="waypoint-label">
        {n}
      </text>
    </g>
  );
}
