import type { SignalReading, Waypoint } from '../types/domain';
import { OBSTACLE, PIXELS_PER_UNIT } from '../canvas/coordinates';

export type FloorPlanMode = 'path' | 'points' | 'survey' | 'history';

export interface FloorPlanMarker {
  id: string;
  n: number;
  cx: number;
  cy: number;
  filled: boolean;
  hasValue: boolean;
  ringRadius: number;
  over: boolean;
  color: string;
  numberLabel: { x: number; y: number };
  valueLabel?: { x: number; y: number; text: string };
}

const DUT_CENTER = { x: OBSTACLE.center.x * PIXELS_PER_UNIT, y: OBSTACLE.center.y * PIXELS_PER_UNIT };
const MAG_MIN = 12;
const MAG_SCALE = 26;
const MAG_REF_V_PER_M = 8.0;

/** Magnitude ring radius scales with field strength so hot points read at a glance. */
function magnitudeRadius(valueVPerM: number): number {
  return MAG_MIN + (valueVPerM / MAG_REF_V_PER_M) * MAG_SCALE;
}

function radialBias(v: number): number {
  return v > 0.3 ? 11 : v < -0.3 ? -3 : 5;
}

export function computeFloorPlanMarkers(
  sortedWaypoints: Waypoint[],
  mode: FloorPlanMode,
  readingByWaypointId: Map<string, SignalReading>,
  limitVPerM: number,
): FloorPlanMarker[] {
  return sortedWaypoints.map((wp) => {
    const n = wp.order + 1;
    const reading = readingByWaypointId.get(wp.id);
    const filled =
      mode === 'points' ? wp.isMeasurementPoint : mode === 'survey' || mode === 'history' ? !!reading : false;
    const hasValue = (mode === 'survey' || mode === 'history') && !!reading;

    const cx = wp.x * PIXELS_PER_UNIT;
    const cy = wp.y * PIXELS_PER_UNIT;
    const dx = cx - DUT_CENTER.x;
    const dy = cy - DUT_CENTER.y;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const bias = radialBias(uy);

    const value = reading?.fieldStrengthVPerM ?? 0;
    const over = hasValue && value > limitVPerM;
    const color = over ? 'var(--color-danger)' : 'var(--color-accent-700)';
    const ringRadius = hasValue ? magnitudeRadius(value) : 0;

    const numberLabel = hasValue
      ? { x: ux * (ringRadius + 16), y: uy * (ringRadius + 16) + bias }
      : { x: 0, y: -15 };
    const valueLabel = hasValue
      ? { x: ux * (ringRadius + 38), y: uy * (ringRadius + 38) + bias, text: value.toFixed(1) }
      : undefined;

    return { id: wp.id, n, cx, cy, filled, hasValue, ringRadius, over, color, numberLabel, valueLabel };
  });
}
