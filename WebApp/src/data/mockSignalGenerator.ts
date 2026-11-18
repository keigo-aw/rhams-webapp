import type { Point, SignalReading, Waypoint } from '../types/domain';

/** Fixed access-point position the mock survey measures field strength relative to. */
export const SIGNAL_SOURCE: Point = { x: 2, y: 2 };

/** Field-strength readings (V/m) assigned to the survey points in order: point 1 → point 10. */
const FIXED_READINGS_V_PER_M = [74.49, 87.78, 41.07, 38.07, 42.33, 37.18, 44.97, 44.62, 40.26, 39.03];

/** Assigns the fixed readings to the measurement points in visiting order (wrapping if there are more than 10). */
export function generateSignalReadings(waypoints: Waypoint[]): SignalReading[] {
  return waypoints.map((wp, index) => ({
    waypointId: wp.id,
    fieldStrengthVPerM: FIXED_READINGS_V_PER_M[index % FIXED_READINGS_V_PER_M.length],
  }));
}
