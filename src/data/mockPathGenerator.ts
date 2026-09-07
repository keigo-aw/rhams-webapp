import type { GenerateTravelledPathParams, PathDataSource } from './dataSource';
import type { Point, Waypoint } from '../types/domain';
import { generateId } from '../utils/id';
import { clampToBounds, VEHICLE_CLEARANCE_METERS } from '../canvas/coordinates';

const RADIUS_JITTER = 1.5;

export const WAYPOINT_COUNT_RANGE = { min: 10, max: 25, default: 10 };

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

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
 * Simulates a robot that travelled a full lap around the parked vehicle (e.g.
 * a patrol/inspection loop), closing back on its own starting point.
 */
function generateTravelledPath({ obstacle, bounds, waypointCount }: GenerateTravelledPathParams): Waypoint[] {
  // The vehicle icon is indicative only, so the travelled path can sit well
  // beyond the minimum clearance rather than hugging tightly around it.
  const minClearanceRadius = obstacle.radius + VEHICLE_CLEARANCE_METERS;
  const baseRadius = minClearanceRadius + randomBetween(0, 8);
  const startAngle = randomBetween(0, Math.PI * 2);
  const direction = Math.random() < 0.5 ? 1 : -1;

  // The loop is closed visually at render time (last point connects back to
  // the first), so all `totalPoints` generated here are distinct, real
  // waypoints — the configured count is exactly how many you get.
  const totalPoints = resolveWaypointCount(waypointCount);
  const points: Point[] = [];

  for (let i = 0; i < totalPoints; i++) {
    const t = i / totalPoints;
    const angle = startAngle + direction * Math.PI * 2 * t;
    const radius = Math.max(baseRadius + randomBetween(-RADIUS_JITTER, RADIUS_JITTER), minClearanceRadius);
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
