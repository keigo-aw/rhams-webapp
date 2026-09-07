import { useRef, type MouseEvent } from 'react';
import type { Plan, RobotAnimationState } from '../types/domain';
import { Grid } from './Grid';
import { Obstacle } from './Obstacle';
import { PathLine } from './PathLine';
import { RobotMarker } from './RobotMarker';
import { WaypointMarker } from './WaypointMarker';
import { OBSTACLE, PIXELS_PER_UNIT, clientPointToGrid } from './coordinates';

interface GridCanvasProps {
  plan: Plan;
  animationState: RobotAnimationState;
  selectedWaypointId: string | null;
  onMoveWaypoint: (id: string, x: number, y: number) => void;
  onAddWaypoint: (x: number, y: number) => void;
  onSelectWaypoint: (id: string | null) => void;
}

const OBSTACLE_CENTER_PX = { x: OBSTACLE.center.x * PIXELS_PER_UNIT, y: OBSTACLE.center.y * PIXELS_PER_UNIT };

export function GridCanvas({
  plan,
  animationState,
  selectedWaypointId,
  onMoveWaypoint,
  onAddWaypoint,
  onSelectWaypoint,
}: GridCanvasProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const sorted = [...plan.waypoints].sort((a, b) => a.order - b.order);
  const isDraft = plan.status === 'draft';

  const pathPoints =
    sorted.length > 0
      ? [...sorted, sorted[0]].map((wp) => ({ x: wp.x * PIXELS_PER_UNIT, y: wp.y * PIXELS_PER_UNIT }))
      : [];
  const tracedPixelPoints = animationState.tracedPoints.map((p) => ({ x: p.x * PIXELS_PER_UNIT, y: p.y * PIXELS_PER_UNIT }));
  const robotPixelPosition = { x: animationState.position.x * PIXELS_PER_UNIT, y: animationState.position.y * PIXELS_PER_UNIT };

  const handleClick = (e: MouseEvent<SVGSVGElement>) => {
    if (!isDraft || !svgRef.current) return;
    if ((e.target as Element).closest('.waypoint-marker, .robot-marker')) return;
    const grid = clientPointToGrid(svgRef.current, e.clientX, e.clientY);
    onAddWaypoint(grid.x, grid.y);
  };

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 800 800"
      className={`grid-canvas${isDraft ? ' addable' : ''}`}
      role="img"
      aria-label="Robot waypoint planning grid"
      onClick={handleClick}
    >
      <Grid />
      <Obstacle center={OBSTACLE_CENTER_PX} />
      <PathLine points={pathPoints} />
      {animationState.isPlaying && tracedPixelPoints.length > 1 && <PathLine points={tracedPixelPoints} traced />}
      {sorted.map((wp, i) => (
        <WaypointMarker
          key={wp.id}
          waypoint={wp}
          n={i + 1}
          selected={wp.id === selectedWaypointId}
          draggable={isDraft}
          onMove={onMoveWaypoint}
          onSelect={onSelectWaypoint}
        />
      ))}
      {animationState.isPlaying && <RobotMarker position={robotPixelPosition} />}
    </svg>
  );
}
