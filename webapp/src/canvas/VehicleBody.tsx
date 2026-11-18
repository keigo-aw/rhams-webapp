import { useMemo } from 'react';
import { Obstacle } from './Obstacle';
import { LidarCloud } from './LidarCloud';
import { vehicleOutlineCloud } from './vehicleModel';
import { OBSTACLE, PIXELS_PER_UNIT } from './coordinates';

const OBSTACLE_CENTER_PX = { x: OBSTACLE.center.x * PIXELS_PER_UNIT, y: OBSTACLE.center.y * PIXELS_PER_UNIT };

interface VehicleBodyProps {
  /** Once the vehicle has been LIDAR-scanned, show the discovered outline cloud instead of the car image. */
  scanned?: boolean;
}

/** The centred unit under test: its drawn car image, or the scanned LIDAR outline once discovered. */
export function VehicleBody({ scanned }: VehicleBodyProps) {
  const outline = useMemo(() => vehicleOutlineCloud(), []);
  return scanned ? <LidarCloud points={outline} lastScan={null} /> : <Obstacle center={OBSTACLE_CENTER_PX} />;
}
