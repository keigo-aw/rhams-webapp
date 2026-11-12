import { useState } from 'react';
import type { ProbeType, RobotAnimationState, SurveyHeight } from '../types/domain';
import { SignalCanvas } from '../survey/SignalCanvas';
import { GridCanvas } from '../canvas/GridCanvas';
import { probeTypeRangeLabel } from '../survey/surveyConfig';
import { signalColor, signalLabel, summarizeSignalStrength } from '../utils/signalColor';
import { useCurrentTheme } from '../state/ThemeContext';
import { SurveyHistoryList } from './SurveyHistoryList';
import { PlanHistoryList } from './PlanHistoryList';
import { useSurveyHistory } from './useSurveyHistory';
import { usePlanHistory } from './usePlanHistory';

const IDLE_ANIMATION_STATE: RobotAnimationState = {
  position: { x: 0, y: 0 },
  segmentIndex: 0,
  progress: 0,
  isPlaying: false,
  tracedPoints: [],
};

const noop = () => {};

type HistoryView = 'surveys' | 'plans';

export function HistoryScreen() {
  const [view, setView] = useState<HistoryView>('surveys');
  const survey = useSurveyHistory();
  const planHistory = usePlanHistory();

  return (
    <div className="app-layout">
      <main className="canvas-area">
        {view === 'surveys' ? (
          survey.isLoading ? (
            <p className="empty-state">Loading…</p>
          ) : survey.selectedRecord ? (
            <div className="history-detail">
              <SignalCanvas
                waypoints={survey.selectedRecord.waypoints}
                readings={survey.selectedRecord.readings}
                revealedIds={new Set(survey.selectedRecord.waypoints.map((wp) => wp.id))}
                animationState={IDLE_ANIMATION_STATE}
              />
              <SurveyStats
                readings={survey.selectedRecord.readings.map((r) => r.fieldStrengthVPerM)}
                height={survey.selectedRecord.height}
                probeType={survey.selectedRecord.probeType}
              />
            </div>
          ) : (
            <p className="empty-state">
              {survey.records.length === 0
                ? 'No past surveys recorded yet. Confirm a path and run a Signal Survey to record one.'
                : 'Select a survey from the list to view it.'}
            </p>
          )
        ) : planHistory.isLoading ? (
          <p className="empty-state">Loading…</p>
        ) : planHistory.selectedPlan ? (
          <GridCanvas
            plan={planHistory.selectedPlan}
            animationState={IDLE_ANIMATION_STATE}
            selectedWaypointId={null}
            onMoveWaypoint={noop}
            onAddWaypoint={noop}
            onSelectWaypoint={noop}
            onDeleteWaypoint={noop}
          />
        ) : (
          <p className="empty-state">
            {planHistory.plans.length === 0
              ? 'No confirmed plans saved yet. Confirm a path to save one.'
              : 'Select a plan from the list to review it.'}
          </p>
        )}
      </main>

      <aside className="side-panel">
        <h1>History</h1>
        <div className="history-tabs">
          <button type="button" className={view === 'surveys' ? 'active' : ''} onClick={() => setView('surveys')}>
            Surveys
          </button>
          <button type="button" className={view === 'plans' ? 'active' : ''} onClick={() => setView('plans')}>
            Plans
          </button>
        </div>

        {view === 'surveys' ? (
          <SurveyHistoryList
            records={survey.records}
            selectedId={survey.selectedRecord?.id ?? null}
            onSelect={survey.selectRecord}
            onClearAll={survey.clearHistory}
          />
        ) : (
          <PlanHistoryList
            plans={planHistory.plans}
            selectedId={planHistory.selectedPlan?.id ?? null}
            onSelect={planHistory.selectPlan}
            onRemove={planHistory.removePlan}
            onClearAll={planHistory.clearPlans}
          />
        )}
      </aside>
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
