import type { GridBounds, Obstacle, Waypoint } from '../types/domain';

export interface GenerateTravelledPathParams {
  obstacle: Obstacle;
  bounds: GridBounds;
  waypointCount?: number;
}

/**
 * Seam for robot path data. mockPathGenerator is the only implementer today;
 * a future real robot integration (ROS/REST/MQTT) would implement this same
 * interface and be swapped in at the usePlanStore call site.
 */
export interface PathDataSource {
  generateTravelledPath(params: GenerateTravelledPathParams): Waypoint[];
}
