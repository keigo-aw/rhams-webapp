import type { Obstacle, Point, SignalReading, Waypoint } from '../types/domain';
import { distance, segmentIntersectsCircle } from '../utils/geometry';

/** Fixed access-point position the mock survey measures field strength relative to. */
export const SIGNAL_SOURCE: Point = { x: 2, y: 2 };

/** Field strength close to the source, in V/m. */
export const MAX_FIELD_STRENGTH_V_PER_M = 20;
/** Distance (m) at which free-space field strength has roughly halved. */
const FALLOFF_DISTANCE_METERS = 15;
/** Multiplicative attenuation applied when the vehicle blocks line-of-sight to the source. */
const OCCLUSION_ATTENUATION = 0.25;
/** +/- fractional measurement noise. */
const NOISE_FRACTION = 0.15;
const MIN_FIELD_STRENGTH_V_PER_M = 0.1;

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function generateSignalReadings(waypoints: Waypoint[], obstacle: Obstacle): SignalReading[] {
  return waypoints.map((wp) => {
    const distanceFromSource = distance(wp, SIGNAL_SOURCE);
    let fieldStrength = MAX_FIELD_STRENGTH_V_PER_M / (1 + distanceFromSource / FALLOFF_DISTANCE_METERS);

    if (segmentIntersectsCircle(SIGNAL_SOURCE, wp, obstacle.center, obstacle.radius)) {
      fieldStrength *= OCCLUSION_ATTENUATION;
    }

    fieldStrength *= 1 + randomBetween(-NOISE_FRACTION, NOISE_FRACTION);
    fieldStrength = Math.max(fieldStrength, MIN_FIELD_STRENGTH_V_PER_M);

    return { waypointId: wp.id, fieldStrengthVPerM: Math.round(fieldStrength * 100) / 100 };
  });
}
