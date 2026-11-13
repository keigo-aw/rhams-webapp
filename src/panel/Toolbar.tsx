import type { PlanStatus } from '../types/domain';
import { WAYPOINT_COUNT_RANGE } from '../data/mockPathGenerator';
import { MIN_CONFIRMABLE_WAYPOINTS } from '../state/usePlanStore';
import { planStatusLabel } from '../utils/planStatus';

interface ToolbarProps {
  status: PlanStatus;
  isPlaying: boolean;
  canConfirm: boolean;
  canScan: boolean;
  waypointCount: number;
  onWaypointCountChange: (n: number) => void;
  onGenerateNew: () => void;
  onConfirm: () => void;
  onResetToDraft: () => void;
  onScan: () => void;
}

export function Toolbar({ status, isPlaying, canConfirm, canScan, waypointCount, onWaypointCountChange, onGenerateNew, onConfirm, onResetToDraft, onScan }: ToolbarProps) {
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
        <button
          type="button"
          className="btn-scan"
          disabled={!canScan || isPlaying}
          title={canScan ? 'Drive the loop and map the vehicle with LIDAR' : 'Add at least 2 waypoints to scan'}
          onClick={onScan}
        >
          LIDAR Scan
        </button>
        {isConfirmed ? (
          <button type="button" className="btn-primary" disabled={isPlaying} onClick={onResetToDraft}>
            Edit Again
          </button>
        ) : (
          <button
            type="button"
            className="btn-primary"
            disabled={!canConfirm}
            title={canConfirm ? undefined : `Add at least ${MIN_CONFIRMABLE_WAYPOINTS} waypoints to confirm`}
            onClick={onConfirm}
          >
            Confirm
          </button>
        )}
      </div>
    </div>
  );
}
