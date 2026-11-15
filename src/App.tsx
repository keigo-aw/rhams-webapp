import { useState } from 'react';
import './App.css';
import { PlanningScreen } from './planning/PlanningScreen';
import { MeasurementScreen } from './measurement/MeasurementScreen';
import { SignalSurveyScreen } from './survey/SignalSurveyScreen';
import { HistoryScreen } from './history/HistoryScreen';
import { AnalysisScreen } from './analysis/AnalysisScreen';
import { BackupScreen } from './backup/BackupScreen';
import { TopBar } from './layout/TopBar';
import { Sidebar } from './layout/Sidebar';
import { ResizeHandle } from './layout/ResizeHandle';
import type { Screen } from './layout/types';
import { usePlanStore } from './state/usePlanStore';
import { useTheme } from './state/useTheme';
import { ThemeContext } from './state/ThemeContext';

function App() {
  const {
    plan,
    isLoading,
    moveWaypoint,
    addWaypoint,
    toggleMeasurementPoint,
    reorderWaypoint,
    deleteWaypoint,
    confirmPlan,
    resetToDraft,
    markVehicleScanned,
    setPath,
    buildDefaultPath,
    clearAll,
  } = usePlanStore();
  const [screen, setScreen] = useState<Screen>('plan');
  const { theme, toggleTheme } = useTheme();

  const surveyEnabled = plan.status === 'confirmed';
  const activeScreen = (screen === 'survey' || screen === 'measurement') && !surveyEnabled ? 'plan' : screen;

  if (isLoading) {
    return (
      <div className="app-shell app-loading">
        <p className="empty-state">Loading…</p>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={theme}>
      <div className="app-shell">
        <TopBar planStatus={plan.status} theme={theme} onToggleTheme={toggleTheme} />
        <div className="app-body">
          <Sidebar active={activeScreen} surveyEnabled={surveyEnabled} onChange={setScreen} />
          <ResizeHandle
            edge="start"
            cssVar="--sidebar-width"
            storageKey="rhams-sidebar-width"
            min={160}
            max={400}
            defaultWidth={210}
            label="Resize navigation panel"
          />
          {activeScreen !== 'backup' && (
            <ResizeHandle
              edge="end"
              className="resize-handle-panel"
              cssVar="--side-panel-width"
              storageKey="rhams-side-panel-width"
              min={240}
              max={560}
              defaultWidth={320}
              label="Resize details panel"
            />
          )}
          <div className="app-content">
            {activeScreen === 'plan' && (
              <PlanningScreen
                plan={plan}
                moveWaypoint={moveWaypoint}
                addWaypoint={addWaypoint}
                reorderWaypoint={reorderWaypoint}
                deleteWaypoint={deleteWaypoint}
                confirmPlan={confirmPlan}
                resetToDraft={resetToDraft}
                markVehicleScanned={markVehicleScanned}
                setPath={setPath}
                buildDefaultPath={buildDefaultPath}
                clearAll={clearAll}
              />
            )}
            {activeScreen === 'measurement' && (
              <MeasurementScreen plan={plan} toggleMeasurementPoint={toggleMeasurementPoint} />
            )}
            {activeScreen === 'survey' && <SignalSurveyScreen plan={plan} />}
            {activeScreen === 'history' && <HistoryScreen />}
            {activeScreen === 'analysis' && <AnalysisScreen />}
            {activeScreen === 'backup' && <BackupScreen />}
          </div>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
