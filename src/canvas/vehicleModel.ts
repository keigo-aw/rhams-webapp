import type { Point } from '../types/domain';
import { OBSTACLE, PIXELS_PER_UNIT, VEHICLE_FOOTPRINT } from './coordinates';

/**
 * Ground-truth geometry of the vehicle body, used as the LIDAR scan target. It
 * mirrors the body rectangle drawn in Obstacle.tsx (the 150x80px rounded rect),
 * expressed in grid units (metres). Only the body outline is modelled — wheels
 * and mirrors are ignored for the silhouette.
 *
 * Keep BODY_CORNER_RADIUS_M in sync with the body `rx` in Obstacle.tsx.
 */
export const BODY_CORNER_RADIUS_M = 17.6 / PIXELS_PER_UNIT; // 0.88 m

/** Arc segments used to approximate each rounded corner. */
const CORNER_SEGMENTS = 8;

/**
 * A closed polygon tracing the vehicle body outline, walked clockwise. Straight
 * edges connect four sampled corner arcs. Callers treat it as closed (the last
 * point joins back to the first).
 */
export function vehicleBodyPolygon(): Point[] {
  const { x: cx, y: cy } = OBSTACLE.center;
  const hw = VEHICLE_FOOTPRINT.halfWidth;
  const hh = VEHICLE_FOOTPRINT.halfHeight;
  const r = Math.min(BODY_CORNER_RADIUS_M, hw, hh);

  // Each corner is an arc centre plus the angle range (y-down screen space) that
  // sweeps clockwise from the incoming edge to the outgoing edge.
  const corners = [
    { ax: cx + hw - r, ay: cy - hh + r, start: -Math.PI / 2, end: 0 }, // top-right
    { ax: cx + hw - r, ay: cy + hh - r, start: 0, end: Math.PI / 2 }, // bottom-right
    { ax: cx - hw + r, ay: cy + hh - r, start: Math.PI / 2, end: Math.PI }, // bottom-left
    { ax: cx - hw + r, ay: cy - hh + r, start: Math.PI, end: (3 * Math.PI) / 2 }, // top-left
  ];

  const points: Point[] = [];
  for (const c of corners) {
    for (let i = 0; i <= CORNER_SEGMENTS; i++) {
      const angle = c.start + ((c.end - c.start) * i) / CORNER_SEGMENTS;
      points.push({ x: c.ax + r * Math.cos(angle), y: c.ay + r * Math.sin(angle) });
    }
  }
  return points;
}
