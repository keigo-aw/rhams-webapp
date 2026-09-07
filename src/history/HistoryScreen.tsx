import type { ProbeType, RobotAnimationState, SurveyHeight } from '../types/domain';
import { SignalCanvas } from '../survey/SignalCanvas';
import { probeTypeRangeLabel } from '../survey/surveyConfig';
import { signalColor, signalLabel, summarizeSignalStrength } from '../utils/signalColor';
import { useCurrentTheme } from '../state/ThemeContext';
import { SurveyHistoryList } from './SurveyHistoryList';
import { useSurveyHistory } from './useSurveyHistory';

const IDLE_ANIMATION_STATE: RobotAnimationState = {
  position: { x: 0, y: 0 },
  segmentIndex: 0,
  progress: 0,
  isPlaying: false,
  tracedPoints: [],
};

export function HistoryScreen() {
  const { records, selectedRecord, selectRecord, clearHistory, isLoading } = useSurveyHistory();

  return (
    <div className="app-layout">
      <main className="canvas-area">
        {isLoading ? (
          <p className="empty-state">Loading…</p>
        ) : selectedRecord ? (
          <div className="history-detail">
            <SignalCanvas
              waypoints={selectedRecord.waypoints}
              readings={selectedRecord.readings}
              revealedIds={new Set(selectedRecord.waypoints.map((wp) => wp.id))}
              animationState={IDLE_ANIMATION_STATE}
            />
            <SurveyStats
              readings={selectedRecord.readings.map((r) => r.fieldStrengthVPerM)}
              height={selectedRecord.height}
              probeType={selectedRecord.probeType}
            />
          </div>
        ) : (
          <p className="empty-state">
            {records.length === 0
              ? 'No past surveys recorded yet. Confirm a path and run a Signal Survey to record one.'
              : 'Select a survey from the list to view it.'}
          </p>
        )}
      </main>
      <SurveyHistoryList
        records={records}
        selectedId={selectedRecord?.id ?? null}
        onSelect={selectRecord}
        onClearAll={clearHistory}
      />
    </div>
  );
}

interface SurveyStatsProps {
  readings: number[];
  height: SurveyHeight;
  probeType: ProbeType;
}

function SurveyStats({ readings, height, probeType }: SurveyStatsProps) {
  const theme = useCurrentTheme();
  const { avg, min, max } = summarizeSignalStrength(readings);
  return (
    <div className="history-stats">
      <span>
        Avg <strong style={{ color: signalColor(avg, theme) }}>{avg.toFixed(1)} V/m</strong> ({signalLabel(avg)})
      </span>
      <span>
        Min <strong style={{ color: signalColor(min, theme) }}>{min.toFixed(1)} V/m</strong>
      </span>
      <span>
        Max <strong style={{ color: signalColor(max, theme) }}>{max.toFixed(1)} V/m</strong>
      </span>
      <span>{readings.length} readings</span>
      <span>
        Height <strong>{height} m</strong>
      </span>
      <span>
        Probe <strong>{probeType}</strong> ({probeTypeRangeLabel(probeType)})
      </span>
    </div>
  );
}
