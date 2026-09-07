import { SIGNAL_SOURCE } from '../data/mockSignalGenerator';
import { PIXELS_PER_UNIT } from '../canvas/coordinates';

export function SignalSourceMarker() {
  const cx = SIGNAL_SOURCE.x * PIXELS_PER_UNIT;
  const cy = SIGNAL_SOURCE.y * PIXELS_PER_UNIT;

  return (
    <g transform={`translate(${cx}, ${cy})`} className="signal-source">
      <rect x={-8} y={-8} width={16} height={16} rx={3} className="signal-source-body" />
      <path d="M -5 3 A 7 7 0 0 1 5 3" className="signal-source-wave" fill="none" />
      <path d="M -2.5 5 A 3.5 3.5 0 0 1 2.5 5" className="signal-source-wave" fill="none" />
      <text y={20} textAnchor="middle" className="signal-source-label">
        AP
      </text>
    </g>
  );
}
