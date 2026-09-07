import { useState } from 'react';
import { AppShell } from './shell/AppShell';
import type { Screen } from './shell/types';
import { PlanningScreen } from './planning/PlanningScreen';
import { MeasurementScreen } from './measurement/MeasurementScreen';
import { SignalSurveyScreen } from './survey/SignalSurveyScreen';
import { HistoryScreen } from './history/HistoryScreen';
import { AnalysisScreen } from './analysis/AnalysisScreen';
import { BackupScreen } from './backup/BackupScreen';
import { usePlanStore } from './state/usePlanStore';

function App() {
  const { plan, isLoading, addWaypoint, toggleMeasurementPoint, confirmPlan, resetToDraft, generateNewMockPath } =
    usePlanStore();
  const [screen, setScreen] = useState<Screen>('path');

  const surveyEnabled = plan.status === 'confirmed';
  const activeScreen = (screen === 'points' || screen === 'survey') && !surveyEnabled ? 'path' : screen;

  if (isLoading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <AppShell
      screen={activeScreen}
      onScreenChange={setScreen}
      surveyEnabled={surveyEnabled}
      planStatus={plan.status}
      center={
        <>
          {activeScreen === 'path' && (
            <PlanningScreen
              plan={plan}
              addWaypoint={addWaypoint}
              confirmPlan={confirmPlan}
              resetToDraft={resetToDraft}
              generateNewMockPath={generateNewMockPath}
            />
          )}
          {activeScreen === 'points' && <MeasurementScreen plan={plan} toggleMeasurementPoint={toggleMeasurementPoint} />}
          {activeScreen === 'survey' && <SignalSurveyScreen plan={plan} />}
          {activeScreen === 'history' && <HistoryScreen />}
          {activeScreen === 'analysis' && <AnalysisScreen />}
          {activeScreen === 'export' && <BackupScreen />}
        </>
      }
    />
  );
}

export default App;
