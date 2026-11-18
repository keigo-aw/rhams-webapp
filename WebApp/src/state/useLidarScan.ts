import { useCallback, useEffect, useRef, useState } from 'react';
import type { Point, RobotAnimationState } from '../types/domain';
import { vehicleBodyPolygon } from '../canvas/vehicleModel';
import { REALISTIC_SCAN_OPTIONS, binKey, castScan } from '../utils/lidar';

export interface LidarSweep {
  origin: Point;
  hits: Point[];
}

/**
 * Accumulates a LIDAR point cloud from the moving robot. While `active` and the
 * animation is playing, it scans the vehicle body from the robot's current
 * position each frame and merges newly seen (binned) hits into `points`, so the
 * silhouette fills in as the robot orbits. `lastScan` carries the current sweep
 * for the live beam overlay.
 */
export function useLidarScan(animationState: RobotAnimationState, active: boolean) {
  const [points, setPoints] = useState<Point[]>([]);
  const [lastScan, setLastScan] = useState<LidarSweep | null>(null);
  const seenRef = useRef<Set<string>>(new Set());
  const polygonRef = useRef<Point[]>(vehicleBodyPolygon());

  const clear = useCallback(() => {
    seenRef.current = new Set();
    setPoints([]);
    setLastScan(null);
  }, []);

  const pos = animationState.position;
  const isPlaying = animationState.isPlaying;

  useEffect(() => {
    if (!active || !isPlaying) {
      setLastScan(null); // drop the beams once the run stops (no-op if already null)
      return;
    }
    const hits = castScan(pos, polygonRef.current, REALISTIC_SCAN_OPTIONS);
    setLastScan({ origin: pos, hits });

    const fresh: Point[] = [];
    for (const hit of hits) {
      const key = binKey(hit);
      if (!seenRef.current.has(key)) {
        seenRef.current.add(key);
        fresh.push(hit);
      }
    }
    if (fresh.length > 0) setPoints((prev) => [...prev, ...fresh]);
  }, [pos, active, isPlaying]);

  return { points, lastScan, clear };
}
