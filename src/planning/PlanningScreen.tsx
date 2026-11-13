import { useState } from 'react';
import type { Plan } from '../types/domain';
import { GridCanvas } from '../canvas/GridCanvas';
import { SidePanel } from '../panel/SidePanel';
import { useAnimationController } from '../state/useAnimationController';
import { useLidarScan } from '../state/useLidarScan';
import { wobblePath } from '../utils/lidar';

/** Travel speed for the LIDAR scan lap, in metres/second — a slow crawl so the sweep reads as a real scan. */
const SCAN_SPEED_UNITS_PER_SECOND = 3;

interface PlanningScreenProps {
  plan: Plan;
  moveWaypoint: (id: string, x: number, y: number) => void;
  addWaypoint: (x: number, y: number) => void;
  reorderWaypoint: (id: string, direction: 'up' | 'down') => void;
  deleteWaypoint: (id: string) => void;
  confirmPlan: () => void;
  resetToDraft: () => void;
}

export function PlanningScreen({
  plan,
  moveWaypoint,
  addWaypoint,
  reorderWaypoint,
  deleteWaypoint,
  confirmPlan,
  resetToDraft,
}: PlanningScreenProps) {
  const { animationState, play, reset } = useAnimationController();
  const [selectedWaypointId, setSelectedWaypointId] = useState<string | null>(null);
  const [scanActive, setScanActive] = useState(false);
  const lidar = useLidarScan(animationState, scanActive);

  const handleConfirm = () => {
    const sorted = [...plan.waypoints].sort((a, b) => a.order - b.order);
    setScanActive(false);
    lidar.clear();
    confirmPlan();
    // Animate the closing leg too, from the last waypoint back to the first.
    play(sorted.length > 1 ? [...sorted, sorted[0]] : sorted);
  };

  const handleScan = () => {
    const sorted = [...plan.waypoints].sort((a, b) => a.order - b.order);
    if (sorted.length < 2) return;
    reset();
    lidar.clear();
    setScanActive(true);
    // Drive a full lap (incl. the closing leg) so every side of the body gets scanned, with a
    // slight wander so the driven path isn't perfectly straight like a real platform tracking a route.
    const drivenPath = wobblePath([...sorted, sorted[0]]);
    play(drivenPath, { speedUnitsPerSecond: SCAN_SPEED_UNITS_PER_SECOND, dwellSeconds: 0 });
  };

  const handleResetToDraft = () => {
    reset();
    setScanActive(false);
    lidar.clear();
    resetToDraft();
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
          scanActive={scanActive}
          lidarPoints={lidar.points}
          lastScan={lidar.lastScan}
        />
      </main>
      <SidePanel
        plan={plan}
        isPlaying={animationState.isPlaying}
        selectedId={selectedWaypointId}
        onSelect={setSelectedWaypointId}
        onReorder={reorderWaypoint}
        onDelete={deleteWaypoint}
        onConfirm={handleConfirm}
        onResetToDraft={handleResetToDraft}
        onScan={handleScan}
      />
    </div>
  );
}
