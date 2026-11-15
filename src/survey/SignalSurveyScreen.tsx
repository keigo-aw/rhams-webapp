import type { Plan } from '../types/domain';
import { SignalCanvas } from './SignalCanvas';
import { SignalSidePanel } from './SignalSidePanel';
import { useSignalSurvey } from './useSignalSurvey';

interface SignalSurveyScreenProps {
  plan: Plan;
}

export function SignalSurveyScreen({ plan }: SignalSurveyScreenProps) {
  const {
    readings,
    revealedIds,
    animationState,
    start,
    pause,
    resume,
    isPaused,
    isPlaying,
    isComplete,
    height,
    setHeight,
    probeType,
    setProbeType,
    configLocked,
  } = useSignalSurvey(plan);
  const sortedWaypoints = [...plan.waypoints].sort((a, b) => a.order - b.order);

  return (
    <div className="app-layout">
      <main className="canvas-area">
        <SignalCanvas
          waypoints={sortedWaypoints}
          readings={readings}
          revealedIds={revealedIds}
          animationState={animationState}
          showSignalSource={false}
          vehicleScanned={plan.vehicleScanned}
        />
      </main>
      <SignalSidePanel
        waypoints={sortedWaypoints}
        readings={readings}
        revealedIds={revealedIds}
        isPlaying={isPlaying}
        isPaused={isPaused}
        isComplete={isComplete}
        onStart={start}
        onPause={pause}
        onResume={resume}
        height={height}
        onHeightChange={setHeight}
        probeType={probeType}
        onProbeTypeChange={setProbeType}
        configLocked={configLocked}
      />
    </div>
  );
}
