import { useState } from 'react';
import type { Plan } from '../types/domain';
import { GridCanvas } from '../canvas/GridCanvas';
import { SidePanel } from '../panel/SidePanel';
import { useAnimationController } from '../state/useAnimationController';
import { WAYPOINT_COUNT_RANGE } from '../data/mockPathGenerator';

interface PlanningScreenProps {
  plan: Plan;
  moveWaypoint: (id: string, x: number, y: number) => void;
  addWaypoint: (x: number, y: number) => void;
  reorderWaypoint: (id: string, direction: 'up' | 'down') => void;
  deleteWaypoint: (id: string) => void;
  confirmPlan: () => void;
  resetToDraft: () => void;
  generateNewMockPath: (waypointCount?: number) => void;
}

export function PlanningScreen({
  plan,
  moveWaypoint,
  addWaypoint,
  reorderWaypoint,
  deleteWaypoint,
  confirmPlan,
  resetToDraft,
  generateNewMockPath,
}: PlanningScreenProps) {
  const { animationState, play, reset } = useAnimationController();
  const [selectedWaypointId, setSelectedWaypointId] = useState<string | null>(null);
  const [waypointCount, setWaypointCount] = useState(WAYPOINT_COUNT_RANGE.default);

  const handleConfirm = () => {
    const sorted = [...plan.waypoints].sort((a, b) => a.order - b.order);
    confirmPlan();
    // Animate the closing leg too, from the last waypoint back to the first.
    play(sorted.length > 1 ? [...sorted, sorted[0]] : sorted);
  };

  const handleResetToDraft = () => {
    reset();
    resetToDraft();
  };

  const handleGenerateNew = () => {
    reset();
    generateNewMockPath(waypointCount);
    setSelectedWaypointId(null);
  };

  return (
    <div className="app-layout">
      <main className="canvas-area">
        <GridCanvas
          plan={plan}
          animationState={animationState}
          selectedWaypointId={selectedWaypointId}
          onMoveWaypoint={moveWaypoint}
          onAddWaypoint={addWaypoint}
          onSelectWaypoint={setSelectedWaypointId}
          onDeleteWaypoint={deleteWaypoint}
        />
      </main>
      <SidePanel
        plan={plan}
        isPlaying={animationState.isPlaying}
        selectedId={selectedWaypointId}
        onSelect={setSelectedWaypointId}
        onReorder={reorderWaypoint}
        onDelete={deleteWaypoint}
        onGenerateNew={handleGenerateNew}
        onConfirm={handleConfirm}
        onResetToDraft={handleResetToDraft}
        waypointCount={waypointCount}
        onWaypointCountChange={setWaypointCount}
      />
    </div>
  );
}
