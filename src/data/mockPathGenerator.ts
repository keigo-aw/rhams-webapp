import type { GenerateTravelledPathParams, PathDataSource } from './dataSource';
import type { GridBounds, Point, Waypoint } from '../types/domain';
import { generateId } from '../utils/id';
import { clampToBounds, VEHICLE_FOOTPRINT } from '../canvas/coordinates';

export const WAYPOINT_COUNT_RANGE = { min: 8, max: 25, default: 8 };

/** How far the measurement ring sits outside the vehicle body, in meters. */
const MEASUREMENT_CLEARANCE_METERS = 0.5;

function resolveWaypointCount(requested?: number): number {
  if (requested === undefined) return WAYPOINT_COUNT_RANGE.default;
  return Math.round(Math.min(Math.max(requested, WAYPOINT_COUNT_RANGE.min), WAYPOINT_COUNT_RANGE.max));
}

/**
 * Lays `total` points on a rectangle centred on `center` with the given half-extents.
 * The four corners are always included; any remaining points are shared across the
 * edges in proportion to edge length and spaced evenly along each, so the loop traces
 * a crisp rectangle regardless of count. Walks clockwise from the top-left corner.
 */
function rectanglePerimeter(center: Point, halfWidth: number, halfHeight: number, total: number): Point[] {
  const corners: Point[] = [
    { x: center.x - halfWidth, y: center.y - halfHeight }, // top-left
    { x: center.x + halfWidth, y: center.y - halfHeight }, // top-right
    { x: center.x + halfWidth, y: center.y + halfHeight }, // bottom-right
    { x: center.x - halfWidth, y: center.y + halfHeight }, // bottom-left
  ];
  const edgeLengths = [2 * halfWidth, 2 * halfHeight, 2 * halfWidth, 2 * halfHeight]; // top, right, bottom, left
  const perimeter = edgeLengths.reduce((sum, len) => sum + len, 0);

  // Distribute the non-corner points across edges proportional to length, using
  // largest-remainder rounding so they always sum back to `extra`.
  const extra = Math.max(total - corners.length, 0);
  const rawShare = edgeLengths.map((len) => (extra * len) / perimeter);
  const interiorPerEdge = rawShare.map(Math.floor);
  let placed = interiorPerEdge.reduce((sum, n) => sum + n, 0);
  const byRemainder = rawShare
    .map((share, i) => ({ i, frac: share - interiorPerEdge[i] }))
    .sort((a, b) => b.frac - a.frac);
  for (let k = 0; placed < extra; k++, placed++) interiorPerEdge[byRemainder[k % 4].i]++;

  const points: Point[] = [];
  for (let edge = 0; edge < 4; edge++) {
    const from = corners[edge];
    const to = corners[(edge + 1) % 4];
    points.push(from);
    const interior = interiorPerEdge[edge];
    for (let j = 0; j < interior; j++) {
      const t = (j + 1) / (interior + 1);
      points.push({ x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t });
    }
  }
  return points;
}

/**
 * A full lap around the parked vehicle: waypoints trace a rectangle 0.5 m outside the
 * vehicle body, so the loop hugs its shape and is symmetric/repeatable (useful for demos).
 */
function generateTravelledPath({ obstacle, bounds, waypointCount }: GenerateTravelledPathParams): Waypoint[] {
  const halfWidth = VEHICLE_FOOTPRINT.halfWidth + MEASUREMENT_CLEARANCE_METERS;
  const halfHeight = VEHICLE_FOOTPRINT.halfHeight + MEASUREMENT_CLEARANCE_METERS;
  const totalPoints = resolveWaypointCount(waypointCount);

  const points = rectanglePerimeter(obstacle.center, halfWidth, halfHeight, totalPoints);
  const safeBounds: GridBounds = bounds;

  return points.map((point, index) => {
    const clamped = clampToBounds(point, safeBounds);
    return {
      id: generateId(),
      order: index,
      x: Math.round(clamped.x * 100) / 100,
      y: Math.round(clamped.y * 100) / 100,
      isMeasurementPoint: true,
    };
  });
}

export const mockPathGenerator: PathDataSource = { generateTravelledPath };
