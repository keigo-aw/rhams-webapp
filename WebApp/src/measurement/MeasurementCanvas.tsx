import type { Waypoint } from '../types/domain';
import { Grid } from '../canvas/Grid';
import { VehicleBody } from '../canvas/VehicleBody';
import { PathLine } from '../canvas/PathLine';
import { PIXELS_PER_UNIT } from '../canvas/coordinates';
import { MeasurementMarker } from './MeasurementMarker';

interface MeasurementCanvasProps {
  waypoints: Waypoint[];
  onToggle: (id: string) => void;
  vehicleScanned?: boolean;
}

export function MeasurementCanvas({ waypoints, onToggle, vehicleScanned }: MeasurementCanvasProps) {
  const sorted = [...waypoints].sort((a, b) => a.order - b.order);
  const pathPoints =
    sorted.length > 0
      ? [...sorted, sorted[0]].map((wp) => ({ x: wp.x * PIXELS_PER_UNIT, y: wp.y * PIXELS_PER_UNIT }))
      : [];

  return (
    <svg className="grid-canvas" viewBox="0 0 800 800" role="img" aria-label="Measurement point selection grid">
      <Grid />
      <VehicleBody scanned={vehicleScanned} />
      <PathLine points={pathPoints} />
      {sorted.map((wp, i) => (
        <MeasurementMarker key={wp.id} waypoint={wp} n={i + 1} onToggle={onToggle} />
      ))}
    </svg>
  );
}
