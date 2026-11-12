import type { RobotAnimationState, SignalReading, Waypoint } from '../types/domain';
import { Obstacle } from '../canvas/Obstacle';
import { PathLine } from '../canvas/PathLine';
import { RobotMarker } from '../canvas/RobotMarker';
import { OBSTACLE, PIXELS_PER_UNIT } from '../canvas/coordinates';
import { SignalMarker } from './SignalMarker';
import { SignalSourceMarker } from './SignalSourceMarker';

interface SignalCanvasProps {
  waypoints: Waypoint[];
  readings: SignalReading[];
  revealedIds: Set<string>;
  animationState: RobotAnimationState;
  showSignalSource?: boolean;
}

const OBSTACLE_CENTER_PX = { x: OBSTACLE.center.x * PIXELS_PER_UNIT, y: OBSTACLE.center.y * PIXELS_PER_UNIT };

export function SignalCanvas({ waypoints, readings, revealedIds, animationState, showSignalSource = true }: SignalCanvasProps) {
  const sorted = [...waypoints].sort((a, b) => a.order - b.order);
  const readingByWaypointId = new Map(readings.map((r) => [r.waypointId, r]));
  const pathPoints =
    sorted.length > 0
      ? [...sorted, sorted[0]].map((wp) => ({ x: wp.x * PIXELS_PER_UNIT, y: wp.y * PIXELS_PER_UNIT }))
      : [];
  const robotPixelPosition = { x: animationState.position.x * PIXELS_PER_UNIT, y: animationState.position.y * PIXELS_PER_UNIT };

  return (
    <svg className="grid-canvas" viewBox="0 0 800 800" role="img" aria-label="Signal strength survey grid">
      <Obstacle center={OBSTACLE_CENTER_PX} />
      {showSignalSource && <SignalSourceMarker />}
      <PathLine points={pathPoints} />
      {sorted.map((wp) => {
        const reading = revealedIds.has(wp.id) ? readingByWaypointId.get(wp.id) : undefined;
        if (!reading) return null;
        return <SignalMarker key={wp.id} waypoint={wp} fieldStrengthVPerM={reading.fieldStrengthVPerM} />;
      })}
      {animationState.isPlaying && <RobotMarker position={robotPixelPosition} />}
    </svg>
  );
}
