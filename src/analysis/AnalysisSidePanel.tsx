import type { SurveyRecord } from '../types/domain';
import { Field } from '../ui/Field';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
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
  thresholdInUnit,
  onThresholdChange,
  onExportCsv,
  onCopyPng,
  copyStatus,
  disabled,
}: AnalysisSidePanelProps) {
  const selectedRecord = records.find((r) => r.id === selectedId) ?? null;
  const standardOptions = standardsForCategory(hazardCategory);

  if (records.length === 0) {
    return (
      <p style={{ fontSize: 13, color: 'color-mix(in srgb, var(--color-text) 55%, transparent)' }}>
        No completed surveys yet. Run a Signal Survey to record data to analyze.
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Field label="Survey record">
        <Select value={selectedId ?? ''} onChange={(e) => onSelectRecord(e.target.value)}>
          {records.map((record) => (
            <option key={record.id} value={record.id}>
              {formatDate(record.completedAt)} — {record.waypoints.length} pts
            </option>
          ))}
        </Select>
      </Field>

      {selectedRecord && (
        <p className="num" style={{ fontSize: 12, margin: 0, color: 'color-mix(in srgb, var(--color-text) 55%, transparent)' }}>
          Height {selectedRecord.height} m · Probe {selectedRecord.probeType} ({probeTypeRangeLabel(selectedRecord.probeType)})
        </p>
      )}

      <Field label="Hazard category">
        <Select
          value={hazardCategory ?? ''}
          onChange={(e) => onHazardCategoryChange((e.target.value || null) as HazardCategory | null)}
        >
          <option value="">Custom (manual limit)</option>
          {HAZARD_CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </Select>
      </Field>

      {hazardCategory && (
        <Field label="Standard">
          <Select value={standardId ?? ''} onChange={(e) => onStandardChange(e.target.value || null)}>
            {standardOptions.map((standard) => (
              <option key={standard.id} value={standard.id}>
                {standard.label} ({standard.thresholdVPerM} V/m)
              </option>
            ))}
          </Select>
        </Field>
      )}

      <Field label="Pass / fail limit (V/m)">
        <Input
          num
          type="number"
          step={0.5}
          min={0}
          value={thresholdInUnit}
          onChange={(e) => {
            const next = Number(e.target.value);
            if (!Number.isNaN(next)) onThresholdChange(next);
          }}
        />
      </Field>

      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="secondary" style={{ flex: 1 }} disabled={disabled} onClick={onExportCsv}>
          Export CSV
        </Button>
        <Button variant="secondary" style={{ flex: 1 }} disabled={disabled} onClick={onCopyPng}>
          Copy chart
        </Button>
      </div>
      {copyStatus && (
        <p style={{ fontSize: 12, margin: 0, color: 'color-mix(in srgb, var(--color-text) 55%, transparent)' }}>{copyStatus}</p>
      )}
    </div>
  );
}
