import type { Point } from '../types/domain';

export function lerp(a: Point, b: Point, t: number): Point {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/** Closest distance from point p to the segment a-b. */
export function distanceToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSq = dx * dx + dy * dy;
  if (lengthSq === 0) return distance(p, a);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSq;
  t = Math.min(Math.max(t, 0), 1);
  return distance(p, { x: a.x + t * dx, y: a.y + t * dy });
}

/** Whether the segment a-b passes through the given circle. */
export function segmentIntersectsCircle(a: Point, b: Point, center: Point, radius: number): boolean {
  return distanceToSegment(center, a, b) <= radius;
}

/**
 * Distance along a ray (from `origin` in unit direction `dir`) to where it first
 * crosses the segment a-b, or null if it never does. `dir` is assumed to be a unit
 * vector, so the returned value is in the same units as the points.
 */
export function raySegmentIntersectionT(origin: Point, dir: Point, a: Point, b: Point): number | null {
  const v1x = origin.x - a.x;
  const v1y = origin.y - a.y;
  const v2x = b.x - a.x;
  const v2y = b.y - a.y;
  const v3x = -dir.y;
  const v3y = dir.x;
  const denom = v2x * v3x + v2y * v3y;
  if (Math.abs(denom) < 1e-9) return null; // ray parallel to the segment
  const t = (v2x * v1y - v2y * v1x) / denom; // distance along the ray
  const u = (v1x * v3x + v1y * v3y) / denom; // position along the segment (0..1)
  if (t >= 0 && u >= 0 && u <= 1) return t;
  return null;
}
