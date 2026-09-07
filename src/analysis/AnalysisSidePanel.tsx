import type { SurveyRecord } from '../types/domain';
import type { ReadingUnit } from '../utils/units';
import { unitLabel } from '../utils/units';
import { probeTypeRangeLabel } from '../survey/surveyConfig';
import { HAZARD_CATEGORIES, standardsForCategory, type HazardCategory } from './standards';

interface AnalysisSidePanelProps {
  records: SurveyRecord[];
  selectedId: string | null;
  onSelectRecord: (id: string) => void;
  hazardCategory: HazardCategory | null;
  onHazardCategoryChange: (category: HazardCategory | null) => void;
  standardId: string | null;
  onStandardChange: (id: string | null) => void;
  unit: ReadingUnit;
  onUnitChange: (unit: ReadingUnit) => void;
  thresholdInUnit: number;
  onThresholdChange: (value: number) => void;
  onExportCsv: () => void;
  onCopyPng: () => void;
  copyStatus: string | null;
  disabled: boolean;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function AnalysisSidePanel({
  records,
  selectedId,
  onSelectRecord,
  hazardCategory,
  onHazardCategoryChange,
  standardId,
  onStandardChange,
  unit,
  onUnitChange,
  thresholdInUnit,
  onThresholdChange,
  onExportCsv,
  onCopyPng,
  copyStatus,
  disabled,
}: AnalysisSidePanelProps) {
  const selectedRecord = records.find((r) => r.id === selectedId) ?? null;
  const standardOptions = standardsForCategory(hazardCategory);

  return (
    <aside className="side-panel">
      <h1>Analysis</h1>

      {records.length === 0 ? (
        <p className="empty-state">No completed surveys yet. Run a Signal Survey to record data to analyze.</p>
      ) : (
        <div className="toolbar">
          <label className="survey-config-field">
            <span>Survey record</span>
            <select value={selectedId ?? ''} onChange={(e) => onSelectRecord(e.target.value)}>
              {records.map((record) => (
                <option key={record.id} value={record.id}>
                  {formatDate(record.completedAt)} ({record.waypoints.length} pts) · {record.height} m · {record.probeType}
                </option>
              ))}
            </select>
          </label>

          {selectedRecord && (
            <p className="analysis-record-meta">
              Height <strong>{selectedRecord.height} m</strong> · Probe{' '}
              <strong>{selectedRecord.probeType}</strong> ({probeTypeRangeLabel(selectedRecord.probeType)})
            </p>
          )}

          <label className="survey-config-field">
            <span>Hazard category</span>
            <select
              value={hazardCategory ?? ''}
              onChange={(e) => onHazardCategoryChange((e.target.value || null) as HazardCategory | null)}
            >
              <option value="">Custom (manual limit)</option>
              {HAZARD_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>

          {hazardCategory && (
            <label className="survey-config-field">
              <span>Standard</span>
              <select value={standardId ?? ''} onChange={(e) => onStandardChange(e.target.value || null)}>
                {standardOptions.map((standard) => (
                  <option key={standard.id} value={standard.id}>
                    {standard.label} ({standard.thresholdVPerM} V/m)
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="survey-config-field">
            <span>Unit</span>
            <select value={unit} onChange={(e) => onUnitChange(e.target.value as ReadingUnit)}>
              <option value="V/m">Field strength (V/m)</option>
              <option value="W/m2">Power density (W/m²)</option>
            </select>
          </label>

          <label className="survey-config-field">
            <span>Pass/fail limit ({unitLabel(unit)})</span>
            <input
              type="number"
              step="0.1"
              min={0}
              value={thresholdInUnit}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (!Number.isNaN(next)) onThresholdChange(next);
              }}
            />
          </label>

          <div className="toolbar-actions">
            <button type="button" disabled={disabled} onClick={onExportCsv}>
              Export CSV
            </button>
            <button type="button" disabled={disabled} onClick={onCopyPng}>
              Copy Chart as PNG
            </button>
          </div>
          {copyStatus && <p className="analysis-copy-status">{copyStatus}</p>}
        </div>
      )}
    </aside>
  );
}
