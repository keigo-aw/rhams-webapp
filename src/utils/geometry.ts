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
