import type { Waypoint } from '../types/domain';
import { PIXELS_PER_UNIT } from './coordinates';
import { useDragWaypoint } from '../hooks/useDragWaypoint';

interface WaypointMarkerProps {
  waypoint: Waypoint;
  n: number;
  selected: boolean;
  draggable: boolean;
  onMove: (id: string, x: number, y: number) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onInteractionStart?: () => void;
}

export function WaypointMarker({ waypoint, n, selected, draggable, onMove, onSelect, onDelete, onInteractionStart }: WaypointMarkerProps) {
  const { handlePointerDown, handlePointerMove, handlePointerUp } = useDragWaypoint({
    disabled: !draggable,
    onMove: (x, y) => onMove(waypoint.id, x, y),
    // A plain click (no drag) removes the point; dragging repositions it instead.
    onClick: draggable ? () => onDelete(waypoint.id) : undefined,
  });

  const classes = ['waypoint-marker', draggable ? 'draggable' : '', selected ? 'selected' : ''].filter(Boolean).join(' ');

  return (
    <g
      transform={`translate(${waypoint.x * PIXELS_PER_UNIT}, ${waypoint.y * PIXELS_PER_UNIT})`}
      onPointerDown={(e) => {
        onInteractionStart?.();
        onSelect(waypoint.id);
        handlePointerDown(e);
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {draggable && <title>Click to remove, drag to reposition</title>}
      <circle r={7} className={classes} />
      <text y={-12} textAnchor="middle" className="waypoint-label">
        {n}
      </text>
    </g>
  );
}
