import { useState } from 'react';
import type { Plan } from '../types/domain';
import { GridCanvas } from '../canvas/GridCanvas';
import { SidePanel } from '../panel/SidePanel';
import { useAnimationController } from '../state/useAnimationController';
import { useLidarScan } from '../state/useLidarScan';
import { WAYPOINT_COUNT_RANGE } from '../data/mockPathGenerator';

/** Travel speed for the LIDAR scan lap, in metres/second — slower than the plain loop so the sweep reads. */
const SCAN_SPEED_UNITS_PER_SECOND = 6;

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
    // Drive a full lap (incl. the closing leg) so every side of the body gets scanned.
    play([...sorted, sorted[0]], { speedUnitsPerSecond: SCAN_SPEED_UNITS_PER_SECOND, dwellSeconds: 0 });
  };

  const handleResetToDraft = () => {
    reset();
    setScanActive(false);
    lidar.clear();
    resetToDraft();
  };

  const handleGenerateNew = () => {
    reset();
    setScanActive(false);
    lidar.clear();
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
        onGenerateNew={handleGenerateNew}
        onConfirm={handleConfirm}
        onResetToDraft={handleResetToDraft}
        onScan={handleScan}
        waypointCount={waypointCount}
        onWaypointCountChange={setWaypointCount}
      />
    </div>
  );
}
