import type { PlanStatus } from '../types/domain';
import { WAYPOINT_COUNT_RANGE } from '../data/mockPathGenerator';
import { planStatusLabel } from '../utils/planStatus';

interface ToolbarProps {
  status: PlanStatus;
  isPlaying: boolean;
  waypointCount: number;
  onWaypointCountChange: (n: number) => void;
  onGenerateNew: () => void;
  onConfirm: () => void;
  onResetToDraft: () => void;
}

export function Toolbar({ status, isPlaying, waypointCount, onWaypointCountChange, onGenerateNew, onConfirm, onResetToDraft }: ToolbarProps) {
  const isConfirmed = status === 'confirmed';

  return (
    <div className="toolbar">
      <span className={`status-badge ${isConfirmed ? 'status-confirmed' : ''}`}>{planStatusLabel(status)}</span>
      <label className="waypoint-count-field">
        <span>Number of waypoints</span>
        <input
          type="number"
          min={WAYPOINT_COUNT_RANGE.min}
          max={WAYPOINT_COUNT_RANGE.max}
          value={waypointCount}
          onChange={(e) => onWaypointCountChange(Number(e.target.value))}
        />
        <span className="waypoint-count-hint">
          Min {WAYPOINT_COUNT_RANGE.min}, max {WAYPOINT_COUNT_RANGE.max}
        </span>
      </label>
      <div className="toolbar-actions">
        <button type="button" onClick={onGenerateNew}>
          Generate New Mock Path
        </button>
        {isConfirmed ? (
          <button type="button" className="btn-primary" disabled={isPlaying} onClick={onResetToDraft}>
            Edit Again
          </button>
        ) : (
          <button type="button" className="btn-primary" onClick={onConfirm}>
            Confirm
          </button>
        )}
      </div>
    </div>
  );
}
