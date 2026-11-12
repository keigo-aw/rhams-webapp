import type { ProbeType, SignalReading, SurveyHeight, Waypoint } from '../types/domain';
import { HEIGHT_OPTIONS, PROBE_TYPE_OPTIONS } from './surveyConfig';
import { signalColor } from '../utils/signalColor';
import { useCurrentTheme } from '../state/ThemeContext';

interface SignalSidePanelProps {
  waypoints: Waypoint[];
  readings: SignalReading[];
  revealedIds: Set<string>;
  isPlaying: boolean;
  isPaused: boolean;
  isComplete: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  height: SurveyHeight;
  onHeightChange: (height: SurveyHeight) => void;
  probeType: ProbeType;
  onProbeTypeChange: (probeType: ProbeType) => void;
  configLocked: boolean;
}

export function SignalSidePanel({
  waypoints,
  readings,
  revealedIds,
  isPlaying,
  isPaused,
  isComplete,
  onStart,
  onPause,
  onResume,
  height,
  onHeightChange,
  probeType,
  onProbeTypeChange,
  configLocked,
}: SignalSidePanelProps) {
  const theme = useCurrentTheme();
  const readingByWaypointId = new Map(readings.map((r) => [r.waypointId, r]));

  return (
    <aside className="side-panel">
      <h1>Signal Strength Survey</h1>
      <div className="toolbar">
        <div className="survey-config">
          <label className="survey-config-field">
            <span>Antenna height</span>
            <select
              disabled={configLocked}
              value={height}
              onChange={(e) => onHeightChange(Number(e.target.value) as SurveyHeight)}
            >
              {HEIGHT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="survey-config-field">
            <span>Probe Type</span>
            <select disabled={configLocked} value={probeType} onChange={(e) => onProbeTypeChange(e.target.value as ProbeType)}>
              {PROBE_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label} ({o.rangeLabel})
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="toolbar-actions">
          {isPlaying && !isPaused ? (
            <button type="button" onClick={onPause}>
              Pause
            </button>
          ) : isPaused ? (
            <button type="button" className="btn-primary" onClick={onResume}>
              Resume
            </button>
          ) : (
            <button type="button" className="btn-primary" onClick={onStart}>
              {isComplete ? 'Replay Survey' : 'Start Survey'}
            </button>
          )}
        </div>
      </div>
      <ul className="waypoint-list">
        {[...waypoints]
          .sort((a, b) => a.order - b.order)
          .map((wp, i) => {
            const reading = revealedIds.has(wp.id) ? readingByWaypointId.get(wp.id) : undefined;
            return (
              <li key={wp.id} className={`waypoint-row${reading ? '' : ' waypoint-row-muted'}`}>
                <span className="waypoint-row-index">{i + 1}</span>
                <span className="waypoint-row-coords">
                  x: {wp.x.toFixed(1)}, y: {wp.y.toFixed(1)}
                </span>
                {reading ? (
                  <span className="signal-reading" style={{ color: signalColor(reading.fieldStrengthVPerM, theme) }}>
                    {reading.fieldStrengthVPerM.toFixed(1)} V/m
                  </span>
                ) : (
                  <span className="signal-reading signal-reading-pending">Not measured</span>
                )}
              </li>
            );
          })}
      </ul>
    </aside>
  );
}
