import type { PlanStatus } from '../types/domain';
import { MIN_CONFIRMABLE_WAYPOINTS } from '../state/usePlanStore';
import { planStatusLabel } from '../utils/planStatus';

interface ToolbarProps {
  status: PlanStatus;
  isPlaying: boolean;
  canConfirm: boolean;
  canScan: boolean;
  onConfirm: () => void;
  onResetToDraft: () => void;
  onScan: () => void;
}

export function Toolbar({ status, isPlaying, canConfirm, canScan, onConfirm, onResetToDraft, onScan }: ToolbarProps) {
  const isConfirmed = status === 'confirmed';

  return (
    <div className="toolbar">
      <span className={`status-badge ${isConfirmed ? 'status-confirmed' : ''}`}>{planStatusLabel(status)}</span>
      <div className="toolbar-actions">
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
