import type { Plan } from '../types/domain';
import { MIN_CONFIRMABLE_WAYPOINTS } from '../state/usePlanStore';
import { Toolbar } from './Toolbar';
import { WaypointList } from './WaypointList';

interface SidePanelProps {
  plan: Plan;
  isPlaying: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReorder: (id: string, direction: 'up' | 'down') => void;
  onDelete: (id: string) => void;
  onConfirm: () => void;
  onResetToDraft: () => void;
  onScan: () => void;
  onClear: () => void;
}

export function SidePanel({
  plan,
  isPlaying,
  selectedId,
  onSelect,
  onReorder,
  onDelete,
  onConfirm,
  onResetToDraft,
  onScan,
  onClear,
}: SidePanelProps) {
  return (
    <aside className="side-panel">
      <h1>Robot Waypoint Review</h1>
      <Toolbar
        status={plan.status}
        isPlaying={isPlaying}
        canConfirm={plan.waypoints.length >= MIN_CONFIRMABLE_WAYPOINTS}
        canScan={!isPlaying}
        canClear={plan.waypoints.length > 0 || Boolean(plan.vehicleScanned)}
        onConfirm={onConfirm}
        onResetToDraft={onResetToDraft}
        onScan={onScan}
        onClear={onClear}
      />
      <WaypointList plan={plan} selectedId={selectedId} onSelect={onSelect} onReorder={onReorder} onDelete={onDelete} />
    </aside>
  );
}
