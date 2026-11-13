import type { Point } from '../types/domain';
import { raySegmentIntersectionT } from './geometry';

export interface ScanOptions {
  /** Angular resolution of the sweep, in degrees. */
  angularStepDeg?: number;
  /** Rays beyond this range (metres) report no hit. */
  maxRangeM?: number;
}

const DEFAULT_ANGULAR_STEP_DEG = 2;
const DEFAULT_MAX_RANGE_M = 12;

/** Grid size (metres) the accumulated point cloud is binned to, to keep it clean and bounded. */
export const LIDAR_BIN_SIZE_M = 0.15;

/**
 * Simulates one 360° LIDAR scan from `origin` against a closed `polygon`. For
 * each ray it returns the nearest surface hit within range; rays that miss are
 * dropped. The polygon is treated as closed (last point joins the first).
 */
export function castScan(origin: Point, polygon: Point[], options: ScanOptions = {}): Point[] {
  const step = options.angularStepDeg ?? DEFAULT_ANGULAR_STEP_DEG;
  const maxRange = options.maxRangeM ?? DEFAULT_MAX_RANGE_M;
  const n = polygon.length;
  const hits: Point[] = [];

  for (let deg = 0; deg < 360; deg += step) {
    const angle = (deg * Math.PI) / 180;
    const dir = { x: Math.cos(angle), y: Math.sin(angle) };
    let nearest = Infinity;
    for (let i = 0; i < n; i++) {
      const t = raySegmentIntersectionT(origin, dir, polygon[i], polygon[(i + 1) % n]);
      if (t !== null && t < nearest) nearest = t;
    }
    if (nearest !== Infinity && nearest <= maxRange) {
      hits.push({ x: origin.x + dir.x * nearest, y: origin.y + dir.y * nearest });
    }
  }
  return hits;
}

/** Stable key for a point snapped to the bin grid, for deduping the accumulated cloud. */
export function binKey(p: Point, size: number = LIDAR_BIN_SIZE_M): string {
  return `${Math.round(p.x / size)}:${Math.round(p.y / size)}`;
}
