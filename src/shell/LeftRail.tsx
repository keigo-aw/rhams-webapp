import { Kicker } from '../ui/Kicker';
import { formatBytes, formatLastWrite } from '../persistence/storageStats';
import { useStorageStats } from './useStorageStats';
import { SCREEN_META, type Screen } from './types';

const NAV: { id: Screen; label: string }[] = [
  { id: 'path', label: 'Path planning' },
  { id: 'points', label: 'Measurement points' },
  { id: 'survey', label: 'Signal survey' },
  { id: 'analysis', label: 'Analysis' },
  { id: 'history', label: 'Survey history' },
  { id: 'export', label: 'Export / import' },
];

/** Badge shown for the two reference screens that sit outside the numbered workflow. */
const NON_STEP_BADGE: Partial<Record<Screen, string>> = { history: 'A', export: 'B' };

interface LeftRailProps {
  active: Screen;
  surveyEnabled: boolean;
  onChange: (screen: Screen) => void;
}

export function LeftRail({ active, surveyEnabled, onChange }: LeftRailProps) {
  const stats = useStorageStats();
  const totalBytes = stats ? stats.waypointPlanBytes + stats.surveyRecordBytes : null;

  return (
    <nav
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        padding: '14px 10px',
        borderRight: '1px solid var(--color-divider)',
        overflowY: 'auto',
      }}
    >
      <Kicker style={{ padding: '0 10px 8px' }}>Workflow</Kicker>
      {NAV.map((item) => {
        const disabled = (item.id === 'points' || item.id === 'survey') && !surveyEnabled;
        const step = SCREEN_META[item.id].step;
        return (
          <button
            key={item.id}
            type="button"
            disabled={disabled}
            title={disabled ? 'Confirm a path first' : undefined}
            onClick={() => onChange(item.id)}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              textAlign: 'left',
              padding: '9px 10px',
              border: 0,
              background: 'transparent',
              color: 'inherit',
              font: 'inherit',
              fontSize: 14,
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.45 : 1,
            }}
          >
            {active === item.id && (
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'color-mix(in srgb, var(--color-accent) 14%, transparent)',
                  borderLeft: '2px solid var(--color-accent)',
                }}
              />
            )}
            <span className="num" style={{ position: 'relative', fontSize: 11, width: 16, color: 'color-mix(in srgb, var(--color-text) 45%, transparent)' }}>
              {step !== null ? String(step).padStart(2, '0') : NON_STEP_BADGE[item.id]}
            </span>
            <span style={{ position: 'relative' }}>{item.label}</span>
          </button>
        );
      })}
      <div
        style={{
          marginTop: 'auto',
          padding: '12px 10px 0',
          borderTop: '1px solid var(--color-divider)',
          fontSize: 11,
          color: 'color-mix(in srgb, var(--color-text) 55%, transparent)',
          lineHeight: 1.5,
        }}
      >
        <div>
          Local store: <span className="num">{totalBytes === null ? '—' : formatBytes(totalBytes)}</span>
        </div>
        <div>
          Last write <span className="num">{stats ? formatLastWrite(stats.lastWriteAt) : '—'}</span>
        </div>
      </div>
    </nav>
  );
}
