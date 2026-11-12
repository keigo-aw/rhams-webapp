import { useCallback, useRef, useState } from 'react';
import type { Point, RobotAnimationState } from '../types/domain';
import { distance, lerp } from '../utils/geometry';

/** Default travel speed along the path, in grid units (metres) per second. */
const DEFAULT_SPEED_UNITS_PER_SECOND = 12;

interface PlayOptions {
  /** Travel speed along the path, in grid units (metres) per second. */
  speedUnitsPerSecond?: number;
  /** Seconds the robot pauses at each waypoint before moving on (0 = no stop). */
  dwellSeconds?: number;
}

interface LoopState {
  points: Point[];
  waypoint: number; // index the robot is at / departing from
  progress: number; // 0..1 along the segment toward waypoint + 1
  dwellRemaining: number; // pause left at the current waypoint
  speed: number;
  dwellSeconds: number;
  lastTime: number | null;
  active: boolean; // a run is in progress (playing or paused)
}

const IDLE_STATE: RobotAnimationState = {
  position: { x: 0, y: 0 },
  segmentIndex: 0,
  progress: 0,
  isPlaying: false,
  tracedPoints: [],
};

const IDLE_LOOP: LoopState = {
  points: [],
  waypoint: 0,
  progress: 0,
  dwellRemaining: 0,
  speed: DEFAULT_SPEED_UNITS_PER_SECOND,
  dwellSeconds: 0,
  lastTime: null,
  active: false,
};

export function useAnimationController() {
  const [animationState, setAnimationState] = useState<RobotAnimationState>(IDLE_STATE);
  const [isPaused, setIsPaused] = useState(false);
  const rafRef = useRef<number | null>(null);
  const loopRef = useRef<LoopState>({ ...IDLE_LOOP });

  const frame = useCallback((time: number) => {
    const s = loopRef.current;
    if (!s.active) return;
    if (s.lastTime === null) s.lastTime = time;
    const dt = (time - s.lastTime) / 1000;
    s.lastTime = time;

    const pts = s.points;
    const lastIndex = pts.length - 1;

    // Paused at the current waypoint.
    if (s.dwellRemaining > 0) {
      s.dwellRemaining -= dt;
      setAnimationState({
        position: pts[s.waypoint],
        segmentIndex: s.waypoint,
        progress: 0,
        isPlaying: true,
        tracedPoints: pts.slice(0, s.waypoint + 1),
      });
      rafRef.current = requestAnimationFrame(frame);
      return;
    }

    // Reached the final waypoint.
    if (s.waypoint >= lastIndex) {
      s.active = false;
      setAnimationState({ position: pts[lastIndex], segmentIndex: lastIndex, progress: 1, isPlaying: false, tracedPoints: pts.slice() });
      return;
    }

    const from = pts[s.waypoint];
    const to = pts[s.waypoint + 1];
    const segLength = distance(from, to) || 1;
    s.progress += (s.speed * dt) / segLength;

    // Arrived at the next waypoint — snap and start its dwell.
    if (s.progress >= 1) {
      s.waypoint += 1;
      s.progress = 0;
      s.dwellRemaining = s.dwellSeconds;
      setAnimationState({
        position: pts[s.waypoint],
        segmentIndex: s.waypoint,
        progress: 0,
        isPlaying: true,
        tracedPoints: pts.slice(0, s.waypoint + 1),
      });
      rafRef.current = requestAnimationFrame(frame);
      return;
    }

    const position = lerp(from, to, s.progress);
    setAnimationState({
      position,
      segmentIndex: s.waypoint,
      progress: s.progress,
      isPlaying: true,
      tracedPoints: [...pts.slice(0, s.waypoint + 1), position],
    });
    rafRef.current = requestAnimationFrame(frame);
  }, []);

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stop();
    loopRef.current = { ...IDLE_LOOP };
    setIsPaused(false);
    setAnimationState(IDLE_STATE);
  }, [stop]);

  const play = useCallback(
    (points: Point[], options?: PlayOptions) => {
      stop();
      if (points.length < 2) return;
      const dwellSeconds = Math.max(options?.dwellSeconds ?? 0, 0);
      loopRef.current = {
        points,
        waypoint: 0,
        progress: 0,
        dwellRemaining: dwellSeconds,
        speed: options?.speedUnitsPerSecond ?? DEFAULT_SPEED_UNITS_PER_SECOND,
        dwellSeconds,
        lastTime: null,
        active: true,
      };
      setIsPaused(false);
      setAnimationState({ position: points[0], segmentIndex: 0, progress: 0, isPlaying: true, tracedPoints: [points[0]] });
      rafRef.current = requestAnimationFrame(frame);
    },
    [stop, frame],
  );

  const pause = useCallback(() => {
    // Only pause a live run (rafRef is the "loop running" flag).
    if (!loopRef.current.active || rafRef.current === null) return;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    loopRef.current.lastTime = null; // don't count paused time against dwell/travel on resume
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    if (!loopRef.current.active || rafRef.current !== null) return;
    loopRef.current.lastTime = null;
    setIsPaused(false);
    rafRef.current = requestAnimationFrame(frame);
  }, [frame]);

  return { animationState, isPaused, play, pause, resume, reset };
}
