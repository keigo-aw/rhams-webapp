import type { Plan } from '../types/domain';
import { WaypointListItem } from './WaypointListItem';

interface WaypointListProps {
  plan: Plan;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReorder: (id: string, direction: 'up' | 'down') => void;
  onDelete: (id: string) => void;
}

export function WaypointList({ plan, selectedId, onSelect, onReorder, onDelete }: WaypointListProps) {
  const sorted = [...plan.waypoints].sort((a, b) => a.order - b.order);
  const editable = plan.status === 'draft';

  return (
    <ul className="waypoint-list">
      {sorted.map((wp, i) => (
        <WaypointListItem
          key={wp.id}
          waypoint={wp}
          n={i + 1}
          selected={wp.id === selectedId}
          editable={editable}
          canMoveUp={i > 0}
          canMoveDown={i < sorted.length - 1}
          onSelect={onSelect}
          onReorder={onReorder}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
