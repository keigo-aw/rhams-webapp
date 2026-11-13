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
  onGenerateNew: () => void;
  onConfirm: () => void;
  onResetToDraft: () => void;
  onScan: () => void;
  waypointCount: number;
  onWaypointCountChange: (n: number) => void;
}

export function SidePanel({
  plan,
  isPlaying,
  selectedId,
  onSelect,
  onReorder,
  onDelete,
  onGenerateNew,
  onConfirm,
  onResetToDraft,
  onScan,
  waypointCount,
  onWaypointCountChange,
}: SidePanelProps) {
  return (
    <aside className="side-panel">
      <h1>Robot Waypoint Review</h1>
      <Toolbar
        status={plan.status}
        isPlaying={isPlaying}
        canConfirm={plan.waypoints.length >= MIN_CONFIRMABLE_WAYPOINTS}
        canScan={plan.waypoints.length >= 2}
        waypointCount={waypointCount}
        onWaypointCountChange={onWaypointCountChange}
        onGenerateNew={onGenerateNew}
        onConfirm={onConfirm}
        onResetToDraft={onResetToDraft}
        onScan={onScan}
      />
      <WaypointList plan={plan} selectedId={selectedId} onSelect={onSelect} onReorder={onReorder} onDelete={onDelete} />
    </aside>
  );
}
