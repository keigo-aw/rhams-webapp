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

const IDLE_STATE: RobotAnimationState = {
  position: { x: 0, y: 0 },
  segmentIndex: 0,
  progress: 0,
  isPlaying: false,
  tracedPoints: [],
};

export function useAnimationController() {
  const [animationState, setAnimationState] = useState<RobotAnimationState>(IDLE_STATE);
  const rafRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stop();
    setAnimationState(IDLE_STATE);
  }, [stop]);

  const play = useCallback(
    (points: Point[], options?: PlayOptions) => {
      stop();
      if (points.length < 2) return;

      const speed = options?.speedUnitsPerSecond ?? DEFAULT_SPEED_UNITS_PER_SECOND;
      const dwellSeconds = Math.max(options?.dwellSeconds ?? 0, 0);
      const lastIndex = points.length - 1;

      let waypoint = 0; // index the robot is at / departing from
      let progress = 0; // 0..1 along the segment toward waypoint + 1
      let dwellRemaining = dwellSeconds; // pause left at the current waypoint
      let lastTime: number | null = null;

      setAnimationState({ position: points[0], segmentIndex: 0, progress: 0, isPlaying: true, tracedPoints: [points[0]] });

      const step = (time: number) => {
        if (lastTime === null) lastTime = time;
        const dt = (time - lastTime) / 1000;
        lastTime = time;

        // Paused at the current waypoint.
        if (dwellRemaining > 0) {
          dwellRemaining -= dt;
          setAnimationState({
            position: points[waypoint],
            segmentIndex: waypoint,
            progress: 0,
            isPlaying: true,
            tracedPoints: points.slice(0, waypoint + 1),
          });
          rafRef.current = requestAnimationFrame(step);
          return;
        }

        // Reached the final waypoint (and finished dwelling there).
        if (waypoint >= lastIndex) {
          setAnimationState({
            position: points[lastIndex],
            segmentIndex: lastIndex,
            progress: 1,
            isPlaying: false,
            tracedPoints: points.slice(),
          });
          return;
        }

        const from = points[waypoint];
        const to = points[waypoint + 1];
        const segLength = distance(from, to) || 1;
        progress += (speed * dt) / segLength;

        // Arrived at the next waypoint — snap to it and start its dwell.
        if (progress >= 1) {
          waypoint += 1;
          progress = 0;
          dwellRemaining = dwellSeconds;
          setAnimationState({
            position: points[waypoint],
            segmentIndex: waypoint,
            progress: 0,
            isPlaying: true,
            tracedPoints: points.slice(0, waypoint + 1),
          });
          rafRef.current = requestAnimationFrame(step);
          return;
        }

        const position = lerp(from, to, progress);
        setAnimationState({
          position,
          segmentIndex: waypoint,
          progress,
          isPlaying: true,
          tracedPoints: [...points.slice(0, waypoint + 1), position],
        });
        rafRef.current = requestAnimationFrame(step);
      };

      rafRef.current = requestAnimationFrame(step);
    },
    [stop],
  );

  return { animationState, play, reset };
}
