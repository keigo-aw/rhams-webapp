import type { Point } from '../types/domain';
import type { LidarSweep } from '../state/useLidarScan';
import { PIXELS_PER_UNIT } from './coordinates';

interface LidarCloudProps {
  points: Point[];
  lastScan: LidarSweep | null;
}

/** Renders the accumulated LIDAR point cloud plus the current scan's beams. */
export function LidarCloud({ points, lastScan }: LidarCloudProps) {
  return (
    <g className="lidar-cloud">
      {lastScan && (
        <g className="lidar-beams">
          {lastScan.hits.map((hit) => (
            <line
              key={`${hit.x.toFixed(2)},${hit.y.toFixed(2)}`}
              x1={lastScan.origin.x * PIXELS_PER_UNIT}
              y1={lastScan.origin.y * PIXELS_PER_UNIT}
              x2={hit.x * PIXELS_PER_UNIT}
              y2={hit.y * PIXELS_PER_UNIT}
              className="lidar-beam"
            />
          ))}
        </g>
      )}
      {points.map((p) => (
        <circle
          key={`${p.x.toFixed(2)},${p.y.toFixed(2)}`}
          cx={p.x * PIXELS_PER_UNIT}
          cy={p.y * PIXELS_PER_UNIT}
          r={1.5}
          className="lidar-point"
        />
      ))}
    </g>
  );
}
