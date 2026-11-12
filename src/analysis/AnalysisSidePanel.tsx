import type { SurveyRecord } from '../types/domain';
import type { ReadingUnit } from '../utils/units';
import { unitLabel } from '../utils/units';
import { probeTypeRangeLabel } from '../survey/surveyConfig';
import { HAZARD_CATEGORIES } from './standards';
import { standardLimitVPerM } from './standardLimits';
import type { LimitLine } from './useAnalysis';

interface AnalysisSidePanelProps {
  records: SurveyRecord[];
  selectedId: string | null;
  onSelectRecord: (id: string) => void;
  unit: ReadingUnit;
  onUnitChange: (unit: ReadingUnit) => void;
  limitLines: LimitLine[];
  frequencyMHz: number;
  onFrequencyChange: (mhz: number) => void;
  frequencyIsDefault: boolean;
  pmaxW: number;
  onPmaxChange: (w: number) => void;
  selectedStandardIds: string[];
  onToggleStandard: (id: string) => void;
  onAddCustomLine: () => void;
  onRemoveCustomLine: (id: string) => void;
  onRenameCustomLine: (id: string, name: string) => void;
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
  frequencyMHz,
  onFrequencyChange,
  frequencyIsDefault,
  pmaxW,
  onPmaxChange,
  selectedStandardIds,
  onToggleStandard,
  onAddCustomLine,
  onRemoveCustomLine,
  onRenameCustomLine,
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

        <div className="survey-config-row">
          <label className="survey-config-field">
            <span>Frequency (MHz)</span>
            <input
              type="number"
              step="1"
              min={0}
              value={frequencyMHz}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (!Number.isNaN(next) && next > 0) onFrequencyChange(next);
              }}
            />
          </label>
          <label className="survey-config-field">
            <span>Pmax (W)</span>
            <input
              type="number"
              step="1"
              min={0}
              value={pmaxW}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (!Number.isNaN(next) && next >= 0) onPmaxChange(next);
              }}
            />
          </label>
        </div>
        <p className="analysis-record-meta">
          Frequency {frequencyIsDefault ? 'defaulted (survey had none)' : 'from survey'}, editable. Pmax feeds BS 6656:2002.
        </p>
      </div>

      <div className="limit-section">
        <span className="limit-section-title">Standards</span>
        <p className="limit-section-hint">
          Limits computed at <strong>{frequencyMHz} MHz</strong>. Pass/fail uses the most restrictive selected line.
        </p>
        {HAZARD_CATEGORIES.map((category) => (
          <div key={category.value} className="standard-group">
            <span className="standard-group-label">{category.label}</span>
            {category.standards.map((standard) => {
              const checked = selectedStandardIds.includes(standard.id);
              const computed = standardLimitVPerM(standard.id, frequencyMHz, pmaxW);
              const limit = computed ?? standard.thresholdVPerM;
              const isFlat = computed === null;
              return (
                <label key={standard.id} className="standard-check-row">
                  <input type="checkbox" checked={checked} onChange={() => onToggleStandard(standard.id)} />
                  {checked ? <Swatch color={colorByRef.get(standard.id) ?? '#888'} /> : <span className="limit-swatch limit-swatch-empty" />}
                  <span className="standard-name">{standard.label}</span>
                  <span className="standard-value num" title={isFlat ? 'Nominal — not frequency-dependent' : undefined}>
                    {limit.toFixed(1)}{isFlat ? '*' : ''} V/m
                  </span>
                </label>
              );
            })}
          </div>
        ))}
        <p className="limit-section-hint">* nominal value, not frequency-dependent.</p>
      </div>

      <div className="limit-section">
        <span className="limit-section-title">Custom lines</span>
        {customLines.length === 0 && <p className="limit-section-hint">None. Add a line to set your own limit.</p>}
        {customLines.map((line) => (
          <div key={line.refId} className="custom-line-row">
            <div className="custom-line-top">
              <Swatch color={line.color} />
              <input
                className="custom-line-name"
                type="text"
                value={line.label}
                aria-label="Line name"
                placeholder="Line name"
                onChange={(e) => onRenameCustomLine(line.refId, e.target.value)}
              />
              <button type="button" className="custom-line-remove" aria-label="Remove line" onClick={() => onRemoveCustomLine(line.refId)}>
                ✕
              </button>
            </div>
            <div className="custom-line-bottom">
              <input
                className="custom-line-input num"
                type="number"
                step="0.1"
                min={0}
                value={line.valueInUnit}
                aria-label="Line value"
                onChange={(e) => {
                  const next = Number(e.target.value);
                  if (!Number.isNaN(next)) onCustomLineChange(line.refId, next);
                }}
              />
              <span className="custom-line-unit">{unitLabel(unit)}</span>
            </div>
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
