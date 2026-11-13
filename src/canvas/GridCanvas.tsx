import { useRef, type MouseEvent } from 'react';
import type { Plan, Point, RobotAnimationState } from '../types/domain';
import type { LidarSweep } from '../state/useLidarScan';
import { Grid } from './Grid';
import { Obstacle } from './Obstacle';
import { LidarCloud } from './LidarCloud';
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
  onDeleteWaypoint: (id: string) => void;
  /** When scanning, the vehicle body is hidden and the LIDAR point cloud is drawn in its place. */
  scanActive?: boolean;
  lidarPoints?: Point[];
  lastScan?: LidarSweep | null;
}

const OBSTACLE_CENTER_PX = { x: OBSTACLE.center.x * PIXELS_PER_UNIT, y: OBSTACLE.center.y * PIXELS_PER_UNIT };

export function GridCanvas({
  plan,
  animationState,
  selectedWaypointId,
  onMoveWaypoint,
  onAddWaypoint,
  onSelectWaypoint,
  onDeleteWaypoint,
  scanActive = false,
  lidarPoints,
  lastScan,
}: GridCanvasProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const suppressNextClickRef = useRef(false);
  const sorted = [...plan.waypoints].sort((a, b) => a.order - b.order);
  const isDraft = plan.status === 'draft';

  const pathPoints =
    sorted.length > 0
      ? [...sorted, sorted[0]].map((wp) => ({ x: wp.x * PIXELS_PER_UNIT, y: wp.y * PIXELS_PER_UNIT }))
      : [];
  const tracedPixelPoints = animationState.tracedPoints.map((p) => ({ x: p.x * PIXELS_PER_UNIT, y: p.y * PIXELS_PER_UNIT }));
  const robotPixelPosition = { x: animationState.position.x * PIXELS_PER_UNIT, y: animationState.position.y * PIXELS_PER_UNIT };

  const handleClick = (e: MouseEvent<SVGSVGElement>) => {
    // A click that started on a waypoint marker (select or drag) must never also add a point —
    // checking e.target here isn't reliable because pointer capture during a drag can retarget
    // the synthetic click to the marker's <g> wrapper, which the marker's own class isn't on.
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;
      return;
    }
    if (!isDraft || !svgRef.current) return;
    if ((e.target as Element).closest('.waypoint-marker, .robot-marker')) return;
    const grid = clientPointToGrid(svgRef.current, e.clientX, e.clientY);
    onAddWaypoint(grid.x, grid.y);
  };

  const handleMarkerInteractionStart = () => {
    suppressNextClickRef.current = true;
  };

  // Markers stop propagation on pointerdown, so this only runs for presses that start on empty
  // canvas — clearing any flag left armed by a marker interaction that never produced a click
  // (pointercancel, interrupted touch), which would otherwise swallow the next real canvas click.
  const handleCanvasPointerDown = () => {
    suppressNextClickRef.current = false;
  };

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 800 800"
      className={`grid-canvas${isDraft ? ' addable' : ''}`}
      role="img"
      aria-label="Robot waypoint planning grid"
      onPointerDown={handleCanvasPointerDown}
      onClick={handleClick}
    >
      <Grid />
      {scanActive ? (
        <LidarCloud points={lidarPoints ?? []} lastScan={lastScan ?? null} />
      ) : (
        <Obstacle center={OBSTACLE_CENTER_PX} />
      )}
      {/* During a scan the planned waypoints and route are hidden — only the robot drives and the
          LIDAR point cloud appears. */}
      {!scanActive && <PathLine points={pathPoints} />}
      {animationState.isPlaying && tracedPixelPoints.length > 1 && <PathLine points={tracedPixelPoints} traced />}
      {!scanActive &&
        sorted.map((wp, i) => (
          <WaypointMarker
            key={wp.id}
            waypoint={wp}
            n={i + 1}
            selected={wp.id === selectedWaypointId}
            draggable={isDraft}
            onMove={onMoveWaypoint}
            onSelect={onSelectWaypoint}
            onDelete={onDeleteWaypoint}
            onInteractionStart={handleMarkerInteractionStart}
          />
        ))}
      {animationState.isPlaying && <RobotMarker position={robotPixelPosition} />}
    </svg>
  );
}
