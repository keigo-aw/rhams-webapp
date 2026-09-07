import { useCallback, useRef, useState } from 'react';
import type { Point, RobotAnimationState } from '../types/domain';
import { distance, lerp } from '../utils/geometry';

/** Simulated robot speed along the traced path, in grid units (metres) per second. */
const SPEED_UNITS_PER_SECOND = 12;

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
  const pointsRef = useRef<Point[]>([]);
  const segmentIndexRef = useRef(0);
  const progressRef = useRef(0);

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
    (points: Point[]) => {
      stop();
      if (points.length < 2) return;
      pointsRef.current = points;
      segmentIndexRef.current = 0;
      progressRef.current = 0;
      setAnimationState({ position: points[0], segmentIndex: 0, progress: 0, isPlaying: true, tracedPoints: [points[0]] });

      let lastTime: number | null = null;

      const step = (time: number) => {
        if (lastTime === null) lastTime = time;
        const dt = (time - lastTime) / 1000;
        lastTime = time;

        const pts = pointsRef.current;
        const segIndex = segmentIndexRef.current;
        const from = pts[segIndex];
        const to = pts[segIndex + 1];
        const segLength = distance(from, to) || 1;

        let progress = progressRef.current + (SPEED_UNITS_PER_SECOND * dt) / segLength;
        if (progress >= 1) {
          progress = 0;
          segmentIndexRef.current += 1;
        }
        progressRef.current = progress;

        const currentSeg = segmentIndexRef.current;
        const isDone = currentSeg >= pts.length - 1;
        const position = isDone ? pts[pts.length - 1] : lerp(pts[currentSeg], pts[currentSeg + 1], progress);
        const tracedPoints = [...pts.slice(0, currentSeg + 1), position];

        setAnimationState({ position, segmentIndex: currentSeg, progress, isPlaying: !isDone, tracedPoints });

        if (!isDone) {
          rafRef.current = requestAnimationFrame(step);
        }
      };

      rafRef.current = requestAnimationFrame(step);
    },
    [stop],
  );

  return { animationState, play, reset };
}
