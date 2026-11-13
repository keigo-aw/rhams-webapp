import type { Point } from '../types/domain';
import { raySegmentIntersectionT } from './geometry';

export interface ScanOptions {
  /** Angular resolution of the sweep, in degrees. */
  angularStepDeg?: number;
  /** Rays beyond this range (metres) report no hit. */
  maxRangeM?: number;
  /** Std-dev of per-ray range noise (metres); 0 = a perfectly clean scan. */
  rangeNoiseM?: number;
  /** Max per-ray angular jitter (degrees), applied symmetrically; 0 = evenly spaced rays. */
  angleJitterDeg?: number;
}

const DEFAULT_ANGULAR_STEP_DEG = 2;
const DEFAULT_MAX_RANGE_M = 12;

/** Grid size (metres) the accumulated point cloud is binned to, to keep it clean and bounded. */
export const LIDAR_BIN_SIZE_M = 0.06;

/** Sensor-realism defaults: a little range noise and angular jitter so the cloud looks measured, not drawn. */
export const REALISTIC_SCAN_OPTIONS: ScanOptions = { rangeNoiseM: 0.04, angleJitterDeg: 0.8 };

/** Standard-normal sample (Box–Muller), used for range noise. */
function gaussian(): number {
  const u = 1 - Math.random();
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/**
 * Simulates one 360° LIDAR scan from `origin` against a closed `polygon`. For
 * each ray it returns the nearest surface hit within range; rays that miss are
 * dropped. The polygon is treated as closed (last point joins the first).
 * Optional range noise and angular jitter make the result read like a real sensor.
 */
export function castScan(origin: Point, polygon: Point[], options: ScanOptions = {}): Point[] {
  const step = options.angularStepDeg ?? DEFAULT_ANGULAR_STEP_DEG;
  const maxRange = options.maxRangeM ?? DEFAULT_MAX_RANGE_M;
  const rangeNoise = options.rangeNoiseM ?? 0;
  const angleJitter = options.angleJitterDeg ?? 0;
  const n = polygon.length;
  const hits: Point[] = [];

  for (let deg = 0; deg < 360; deg += step) {
    const jittered = deg + (angleJitter > 0 ? (Math.random() * 2 - 1) * angleJitter : 0);
    const angle = (jittered * Math.PI) / 180;
    const dir = { x: Math.cos(angle), y: Math.sin(angle) };
    let nearest = Infinity;
    for (let i = 0; i < n; i++) {
      const t = raySegmentIntersectionT(origin, dir, polygon[i], polygon[(i + 1) % n]);
      if (t !== null && t < nearest) nearest = t;
    }
    if (nearest !== Infinity && nearest <= maxRange) {
      const measured = Math.max(0, nearest + (rangeNoise > 0 ? gaussian() * rangeNoise : 0));
      hits.push({ x: origin.x + dir.x * measured, y: origin.y + dir.y * measured });
    }
  }
  return hits;
}

/** Stable key for a point snapped to the bin grid, for deduping the accumulated cloud. */
export function binKey(p: Point, size: number = LIDAR_BIN_SIZE_M): string {
  return `${Math.round(p.x / size)}:${Math.round(p.y / size)}`;
}
