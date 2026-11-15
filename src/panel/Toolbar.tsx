import type { PlanStatus } from '../types/domain';
import { MIN_CONFIRMABLE_WAYPOINTS } from '../state/usePlanStore';
import { planStatusLabel } from '../utils/planStatus';

interface ToolbarProps {
  status: PlanStatus;
  isPlaying: boolean;
  canConfirm: boolean;
  canScan: boolean;
  canClear: boolean;
  onConfirm: () => void;
  onResetToDraft: () => void;
  onScan: () => void;
  onClear: () => void;
}

export function Toolbar({ status, isPlaying, canConfirm, canScan, canClear, onConfirm, onResetToDraft, onScan, onClear }: ToolbarProps) {
  const isConfirmed = status === 'confirmed';

  return (
    <div className="toolbar">
      <span className={`status-badge ${isConfirmed ? 'status-confirmed' : ''}`}>{planStatusLabel(status)}</span>
      <div className="toolbar-actions">
        <button
          type="button"
          className="btn-scan"
          disabled={!canScan}
          title="Drive the default loop and map the vehicle with LIDAR"
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
      <div className="toolbar-actions">
        <button
          type="button"
          className="btn-danger"
          disabled={!canClear}
          title="Remove all waypoints and clear the scanned LIDAR outline"
          onClick={onClear}
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
