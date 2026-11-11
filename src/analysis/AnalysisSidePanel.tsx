import type { SurveyRecord } from '../types/domain';
import type { ReadingUnit } from '../utils/units';
import { unitLabel } from '../utils/units';
import { probeTypeRangeLabel } from '../survey/surveyConfig';
import { HAZARD_CATEGORIES } from './standards';
import type { LimitLine } from './useAnalysis';

interface AnalysisSidePanelProps {
  records: SurveyRecord[];
  selectedId: string | null;
  onSelectRecord: (id: string) => void;
  unit: ReadingUnit;
  onUnitChange: (unit: ReadingUnit) => void;
  limitLines: LimitLine[];
  selectedStandardIds: string[];
  onToggleStandard: (id: string) => void;
  onAddCustomLine: () => void;
  onRemoveCustomLine: (id: string) => void;
  onCustomLineChange: (id: string, valueInUnit: number) => void;
  onExportCsv: () => void;
  onCopyPng: () => void;
  copyStatus: string | null;
  disabled: boolean;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function Swatch({ color }: { color: string }) {
  return <span className="limit-swatch" style={{ background: color }} aria-hidden="true" />;
}

export function AnalysisSidePanel({
  records,
  selectedId,
  onSelectRecord,
  unit,
  onUnitChange,
  limitLines,
  selectedStandardIds,
  onToggleStandard,
  onAddCustomLine,
  onRemoveCustomLine,
  onCustomLineChange,
  onExportCsv,
  onCopyPng,
  copyStatus,
  disabled,
}: AnalysisSidePanelProps) {
  const selectedRecord = records.find((r) => r.id === selectedId) ?? null;
  const colorByRef = new Map(limitLines.map((l) => [l.refId, l.color]));
  const customLines = limitLines.filter((l) => l.kind === 'custom');

  if (records.length === 0) {
    return (
      <aside className="side-panel">
        <h1>Analysis</h1>
        <p className="empty-state">No completed surveys yet. Run a Signal Survey to record data to analyze.</p>
      </aside>
    );
  }

  return (
    <aside className="side-panel">
      <h1>Analysis</h1>
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
            Height <strong>{selectedRecord.height} m</strong> · Probe <strong>{selectedRecord.probeType}</strong> (
            {probeTypeRangeLabel(selectedRecord.probeType)})
          </p>
        )}

        <label className="survey-config-field">
          <span>Unit</span>
          <select value={unit} onChange={(e) => onUnitChange(e.target.value as ReadingUnit)}>
            <option value="V/m">Field strength (V/m)</option>
            <option value="W/m2">Power density (W/m²)</option>
          </select>
        </label>
      </div>

      <div className="limit-section">
        <span className="limit-section-title">Standards</span>
        <p className="limit-section-hint">Each selected standard draws a limit line. Pass/fail uses the most restrictive one.</p>
        {HAZARD_CATEGORIES.map((category) => (
          <div key={category.value} className="standard-group">
            <span className="standard-group-label">{category.label}</span>
            {category.standards.map((standard) => {
              const checked = selectedStandardIds.includes(standard.id);
              return (
                <label key={standard.id} className="standard-check-row">
                  <input type="checkbox" checked={checked} onChange={() => onToggleStandard(standard.id)} />
                  {checked ? <Swatch color={colorByRef.get(standard.id) ?? '#888'} /> : <span className="limit-swatch limit-swatch-empty" />}
                  <span className="standard-name">{standard.label}</span>
                  <span className="standard-value num">{standard.thresholdVPerM} V/m</span>
                </label>
              );
            })}
          </div>
        ))}
      </div>

      <div className="limit-section">
        <span className="limit-section-title">Custom lines</span>
        {customLines.length === 0 && <p className="limit-section-hint">None. Add a line to set your own limit.</p>}
        {customLines.map((line) => (
          <div key={line.refId} className="custom-line-row">
            <Swatch color={line.color} />
            <span className="custom-line-label">{line.label}</span>
            <input
              className="custom-line-input num"
              type="number"
              step="0.1"
              min={0}
              value={line.valueInUnit}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (!Number.isNaN(next)) onCustomLineChange(line.refId, next);
              }}
            />
            <span className="custom-line-unit">{unitLabel(unit)}</span>
            <button type="button" className="custom-line-remove" aria-label="Remove line" onClick={() => onRemoveCustomLine(line.refId)}>
              ✕
            </button>
          </div>
        ))}
        <button type="button" className="add-custom-line" onClick={onAddCustomLine}>
          + Add custom line
        </button>
      </div>

      <div className="toolbar">
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
    </aside>
  );
}
