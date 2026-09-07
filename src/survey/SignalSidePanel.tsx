import type { ProbeType, SignalReading, SurveyHeight, Waypoint } from '../types/domain';
import { HEIGHT_OPTIONS, PROBE_TYPE_OPTIONS } from './surveyConfig';
import { signalColor } from '../utils/signalColor';

interface SignalSidePanelProps {
  waypoints: Waypoint[];
  readings: SignalReading[];
  revealedIds: Set<string>;
  isPlaying: boolean;
  isComplete: boolean;
  onStart: () => void;
  height: SurveyHeight;
  onHeightChange: (height: SurveyHeight) => void;
  probeType: ProbeType;
  onProbeTypeChange: (probeType: ProbeType) => void;
  frequencyStartMHz: string;
  onFrequencyStartMHzChange: (value: string) => void;
  frequencyEndMHz: string;
  onFrequencyEndMHzChange: (value: string) => void;
  configLocked: boolean;
}

export function SignalSidePanel({
  waypoints,
  readings,
  revealedIds,
  isPlaying,
  isComplete,
  onStart,
  height,
  onHeightChange,
  probeType,
  onProbeTypeChange,
  frequencyStartMHz,
  onFrequencyStartMHzChange,
  frequencyEndMHz,
  onFrequencyEndMHzChange,
  configLocked,
}: SignalSidePanelProps) {
  const readingByWaypointId = new Map(readings.map((r) => [r.waypointId, r]));
  const buttonLabel = isPlaying ? 'Robot Moving…' : isComplete ? 'Replay Survey' : 'Start Survey';

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
          <div className="survey-config-row">
            <label className="survey-config-field">
              <span>Start (MHz)</span>
              <input
                type="number"
                value={frequencyStartMHz}
                disabled={configLocked}
                onChange={(e) => onFrequencyStartMHzChange(e.target.value)}
              />
            </label>
            <label className="survey-config-field">
              <span>End (MHz)</span>
              <input
                type="number"
                placeholder="optional"
                value={frequencyEndMHz}
                disabled={configLocked}
                onChange={(e) => onFrequencyEndMHzChange(e.target.value)}
              />
            </label>
          </div>
        </div>
        <div className="toolbar-actions">
          <button type="button" disabled={isPlaying} onClick={onStart}>
            {buttonLabel}
          </button>
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
                  <span className="signal-reading" style={{ color: signalColor(reading.fieldStrengthVPerM) }}>
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
