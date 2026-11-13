import type { Waypoint } from '../types/domain';

interface WaypointListItemProps {
  waypoint: Waypoint;
  n: number;
  selected: boolean;
  editable: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onSelect: (id: string) => void;
  onReorder: (id: string, direction: 'up' | 'down') => void;
  onDelete: (id: string) => void;
}

export function WaypointListItem({
  waypoint,
  n,
  selected,
  editable,
  canMoveUp,
  canMoveDown,
  onSelect,
  onReorder,
  onDelete,
}: WaypointListItemProps) {
  return (
    <li className={`waypoint-row${selected ? ' selected' : ''}`} onClick={() => onSelect(waypoint.id)}>
      <span className="waypoint-row-index">{n}</span>
      <span className="waypoint-row-spacer" />
      <span className="waypoint-row-actions">
        <button
          type="button"
          disabled={!editable || !canMoveUp}
          aria-label="Move up"
          onClick={(e) => {
            e.stopPropagation();
            onReorder(waypoint.id, 'up');
          }}
        >
          ↑
        </button>
        <button
          type="button"
          disabled={!editable || !canMoveDown}
          aria-label="Move down"
          onClick={(e) => {
            e.stopPropagation();
            onReorder(waypoint.id, 'down');
          }}
        >
          ↓
        </button>
        <button
          type="button"
          disabled={!editable}
          aria-label="Delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(waypoint.id);
          }}
        >
          ✕
        </button>
      </span>
    </li>
  );
}
