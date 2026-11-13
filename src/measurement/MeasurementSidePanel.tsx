import type { Waypoint } from '../types/domain';

interface MeasurementSidePanelProps {
  waypoints: Waypoint[];
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export function MeasurementSidePanel({ waypoints, onToggle, onSelectAll, onClearAll }: MeasurementSidePanelProps) {
  const sorted = [...waypoints].sort((a, b) => a.order - b.order);
  const selectedCount = sorted.filter((wp) => wp.isMeasurementPoint).length;

  return (
    <aside className="side-panel">
      <h1>Measurement Points</h1>
      <p className="canvas-hint">
        Click a waypoint on the grid, or check it in the list, to mark it as an RF measurement point. Only
        measurement points get a signal reading during the survey.
      </p>
      <div className="toolbar">
        <span className="waypoint-count-hint">
          {selectedCount} of {sorted.length} waypoints selected
        </span>
        <div className="toolbar-actions">
          <button type="button" onClick={onSelectAll}>
            Select All
          </button>
          <button type="button" onClick={onClearAll}>
            Clear All
          </button>
        </div>
      </div>
      <ul className="waypoint-list">
        {sorted.map((wp, i) => (
          <li key={wp.id} className="waypoint-row">
            <label className="measurement-checkbox-label">
              <input type="checkbox" checked={wp.isMeasurementPoint} onChange={() => onToggle(wp.id)} />
              <span className="waypoint-row-index">{i + 1}</span>
            </label>
            <span className="waypoint-row-spacer" />
            <span className={`status-pill ${wp.isMeasurementPoint ? 'measurement-badge-selected' : 'measurement-badge-unselected'}`}>
              {wp.isMeasurementPoint ? 'Measured' : 'Skipped'}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
