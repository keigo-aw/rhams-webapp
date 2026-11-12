import type { Plan } from '../types/domain';

interface PlanHistoryListProps {
  plans: Plan[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

export function PlanHistoryList({ plans, selectedId, onSelect, onRemove, onClearAll }: PlanHistoryListProps) {
  return (
    <>
      <div className="toolbar">
        <div className="toolbar-actions">
          <button type="button" className="btn-danger" disabled={plans.length === 0} onClick={onClearAll}>
            Clear All Plans
          </button>
        </div>
      </div>
      {plans.length === 0 ? (
        <p className="empty-state">No confirmed plans saved yet.</p>
      ) : (
        <ul className="waypoint-list">
          {plans.map((plan) => {
            const selected = plan.id === selectedId;
            const when = plan.confirmedAt ?? plan.createdAt;
            return (
              <li key={plan.id} className={`waypoint-row history-row${selected ? ' selected' : ''}`} onClick={() => onSelect(plan.id)}>
                <span className="history-row-main">
                  <span className="history-row-date">
                    {new Date(when).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                  <span className="plan-row-actions">
                    <span className="history-row-count">{plan.waypoints.length} waypoints</span>
                    <button
                      type="button"
                      className="custom-line-remove"
                      aria-label="Remove plan"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(plan.id);
                      }}
                    >
                      ✕
                    </button>
                  </span>
                </span>
                <span className="history-row-config">
                  {new Set(plan.waypoints.filter((w) => w.isMeasurementPoint)).size} measurement points
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
