import type { Obstacle, Point } from '../types/domain';

export function lerp(a: Point, b: Point, t: number): Point {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function pathLength(points: Point[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += distance(points[i - 1], points[i]);
  }
  return total;
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
 * Pushes a point outward from the obstacle center if it falls within
 * obstacle.radius + margin, so generated/dragged points visually avoid it.
 */
export function repelFromObstacle(point: Point, obstacle: Obstacle, margin: number): Point {
  const dx = point.x - obstacle.center.x;
  const dy = point.y - obstacle.center.y;
  const dist = Math.hypot(dx, dy);
  const minDist = obstacle.radius + margin;
  if (dist >= minDist || dist === 0) {
    if (dist === 0) {
      return { x: obstacle.center.x + minDist, y: obstacle.center.y };
    }
    return point;
  }
  const scale = minDist / dist;
  return {
    x: obstacle.center.x + dx * scale,
    y: obstacle.center.y + dy * scale,
  };
}
