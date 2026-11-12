export interface Point {
  x: number;
  y: number;
}

export interface Waypoint extends Point {
  id: string;
  order: number;
  /** Whether an RF reading should be taken at this waypoint. Not every waypoint is a measurement point. */
  isMeasurementPoint: boolean;
}

export type PlanStatus = 'draft' | 'confirmed';

export interface Plan {
  id: string;
  status: PlanStatus;
  waypoints: Waypoint[];
  createdAt: number;
  confirmedAt?: number;
}

export interface Obstacle {
  center: Point;
  radius: number;
}

export interface GridBounds {
  width: number;
  height: number;
}

export interface RobotAnimationState {
  position: Point;
  segmentIndex: number;
  progress: number;
  isPlaying: boolean;
  tracedPoints: Point[];
}

export interface SignalReading {
  waypointId: string;
  /** Measured electric field strength in volts per meter (V/m). */
  fieldStrengthVPerM: number;
}

export type SurveyHeight = 0.5 | 1.8;

export type ProbeType = 'Probe A' | 'Probe B';

export interface SurveyRecord {
  id: string;
  planId: string;
  waypoints: Waypoint[];
  readings: SignalReading[];
  completedAt: number;
  height: SurveyHeight;
  probeType: ProbeType;
  /** Legacy: older records stored a survey frequency; new records assess at the Analysis-page frequency. */
  frequencyStartMHz?: number;
  frequencyEndMHz?: number;
}
