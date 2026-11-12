import type { SurveyRecord } from '../types/domain';
import { signalColor, summarizeSignalStrength } from '../utils/signalColor';
import { useCurrentTheme } from '../state/ThemeContext';

interface SurveyHistoryListProps {
  records: SurveyRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClearAll: () => void;
}

export function SurveyHistoryList({ records, selectedId, onSelect, onClearAll }: SurveyHistoryListProps) {
  const theme = useCurrentTheme();
  return (
    <>
      <div className="toolbar">
        <div className="toolbar-actions">
          <button type="button" className="btn-danger" disabled={records.length === 0} onClick={onClearAll}>
            Clear All History
          </button>
        </div>
      </div>
      {records.length === 0 && <p className="empty-state">No completed surveys yet.</p>}
      <ul className="waypoint-list">
        {records.map((record) => {
          const { avg, max } = summarizeSignalStrength(record.readings.map((r) => r.fieldStrengthVPerM));
          const selected = record.id === selectedId;
          return (
            <li
              key={record.id}
              className={`waypoint-row history-row${selected ? ' selected' : ''}`}
              onClick={() => onSelect(record.id)}
            >
              <span className="history-row-main">
                <span className="history-row-date">
                  {new Date(record.completedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
                <span className="history-row-count">{record.waypoints.length} waypoints</span>
              </span>
              <span className="history-row-config">
                {record.height} m · {record.probeType}
              </span>
              <span className="history-row-stats">
                <span style={{ color: signalColor(avg, theme) }}>Avg {avg.toFixed(1)} V/m</span>
                <span style={{ color: signalColor(max, theme) }}>Peak {max.toFixed(1)} V/m</span>
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
}
