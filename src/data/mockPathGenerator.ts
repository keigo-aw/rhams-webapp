import type { GenerateTravelledPathParams, PathDataSource } from './dataSource';
import type { Point, Waypoint } from '../types/domain';
import { generateId } from '../utils/id';
import { clampToBounds, VEHICLE_CLEARANCE_METERS } from '../canvas/coordinates';

export const WAYPOINT_COUNT_RANGE = { min: 8, max: 25, default: 8 };

/** How far the symmetric ring sits beyond the vehicle's required clearance. */
const RING_MARGIN_METERS = 6;
/** First point sits at the top (12 o'clock); the rest space out clockwise from there. */
const START_ANGLE = -Math.PI / 2;

function resolveWaypointCount(requested?: number): number {
  if (requested === undefined) return WAYPOINT_COUNT_RANGE.default;
  return Math.round(Math.min(Math.max(requested, WAYPOINT_COUNT_RANGE.min), WAYPOINT_COUNT_RANGE.max));
}

function pointOnOrbit(center: Point, radius: number, angleRad: number): Point {
  return {
    x: center.x + radius * Math.cos(angleRad),
    y: center.y + radius * Math.sin(angleRad),
  };
}

/**
 * A full lap around the parked vehicle: the waypoints are spaced evenly on a
 * fixed-radius ring, so the loop is symmetric and repeatable (useful for demos).
 */
function generateTravelledPath({ obstacle, bounds, waypointCount }: GenerateTravelledPathParams): Waypoint[] {
  const radius = obstacle.radius + VEHICLE_CLEARANCE_METERS + RING_MARGIN_METERS;

  // The loop is closed visually at render time (last point connects back to
  // the first), so all `totalPoints` generated here are distinct, real
  // waypoints — the configured count is exactly how many you get.
  const totalPoints = resolveWaypointCount(waypointCount);
  const points: Point[] = [];

  for (let i = 0; i < totalPoints; i++) {
    const angle = START_ANGLE + (i / totalPoints) * Math.PI * 2;
    const point = clampToBounds(pointOnOrbit(obstacle.center, radius, angle), bounds);
    points.push(point);
  }

  return points.map((point, index) => ({
    id: generateId(),
    order: index,
    x: Math.round(point.x * 100) / 100,
    y: Math.round(point.y * 100) / 100,
    isMeasurementPoint: true,
  }));
}

export const mockPathGenerator: PathDataSource = { generateTravelledPath };
