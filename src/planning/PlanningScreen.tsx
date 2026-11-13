import { useEffect, useMemo, useRef, useState } from 'react';
import type { Plan } from '../types/domain';
import { GridCanvas } from '../canvas/GridCanvas';
import { SidePanel } from '../panel/SidePanel';
import { useAnimationController } from '../state/useAnimationController';
import { useLidarScan } from '../state/useLidarScan';
import { wobblePath } from '../utils/lidar';
import { vehicleOutlineCloud } from '../canvas/vehicleModel';
import { distance } from '../utils/geometry';

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
  markVehicleScanned: () => void;
}

export function PlanningScreen({
  plan,
  moveWaypoint,
  addWaypoint,
  reorderWaypoint,
  deleteWaypoint,
  confirmPlan,
  resetToDraft,
  markVehicleScanned,
}: PlanningScreenProps) {
  const { animationState, play, reset } = useAnimationController();
  const [selectedWaypointId, setSelectedWaypointId] = useState<string | null>(null);
  const [scanActive, setScanActive] = useState(false);
  const lidar = useLidarScan(animationState, scanActive);
  // Number of segments in the driven (wobbled) scan path, for mapping animation progress to a lap fraction.
  const scanTotalSegmentsRef = useRef(1);
  const wasPlayingRef = useRef(false);

  // A static outline cloud stands in for the car image once the vehicle has been scanned — including
  // after a reload, when the live scan points are gone. Generated once.
  const outlineCloud = useMemo(() => vehicleOutlineCloud(), []);

  // When the live scan lap finishes, drop out of active-scan mode; the persisted outline takes over.
  useEffect(() => {
    if (scanActive && wasPlayingRef.current && !animationState.isPlaying) {
      setScanActive(false);
    }
    wasPlayingRef.current = animationState.isPlaying;
  }, [animationState.isPlaying, scanActive]);

  const sortedWaypoints = useMemo(() => [...plan.waypoints].sort((a, b) => a.order - b.order), [plan.waypoints]);

  // Arc-length fraction around the closed loop at which each waypoint sits. A waypoint is
  // "discovered" (plotted) once the robot's progress around the lap passes its fraction.
  const waypointFractions = useMemo(() => {
    const loop = sortedWaypoints.length > 1 ? [...sortedWaypoints, sortedWaypoints[0]] : sortedWaypoints;
    const segLengths: number[] = [];
    for (let i = 0; i < loop.length - 1; i++) segLengths.push(distance(loop[i], loop[i + 1]));
    const total = segLengths.reduce((sum, len) => sum + len, 0) || 1;
    const fractions: number[] = [];
    let cumulative = 0;
    for (let k = 0; k < sortedWaypoints.length; k++) {
      fractions.push(cumulative / total);
      cumulative += segLengths[k] ?? 0;
    }
    return fractions;
  }, [sortedWaypoints]);

  // During a scan: nothing is known up front; waypoints are plotted one by one as the robot
  // reaches them, and all are shown once the lap completes. Null = not scanning (show all normally).
  const robotLapFraction = Math.min(1, (animationState.segmentIndex + animationState.progress) / scanTotalSegmentsRef.current);
  const revealedWaypointIds = useMemo(() => {
    if (!scanActive) return null;
    const reached = animationState.isPlaying ? robotLapFraction : 1;
    const ids = new Set<string>();
    sortedWaypoints.forEach((wp, k) => {
      if (reached >= waypointFractions[k]) ids.add(wp.id);
    });
    return ids;
  }, [scanActive, animationState.isPlaying, robotLapFraction, sortedWaypoints, waypointFractions]);

  const handleConfirm = () => {
    confirmPlan();
    // Once scanned, the outline persists and the car image never returns — no replay.
    if (plan.vehicleScanned || scanActive) return;
    // Plain flow (never scanned): animate the confirmed route around the vehicle (incl. the closing leg).
    play(sortedWaypoints.length > 1 ? [...sortedWaypoints, sortedWaypoints[0]] : sortedWaypoints);
  };

  const handleScan = () => {
    if (sortedWaypoints.length < 2) return;
    reset();
    lidar.clear();
    setScanActive(true);
    markVehicleScanned(); // from now on the plan shows the discovered outline instead of the car
    // Drive a full lap (incl. the closing leg) so every side of the body gets scanned, with a
    // slight wander so the driven path isn't perfectly straight like a real platform tracking a route.
    const drivenPath = wobblePath([...sortedWaypoints, sortedWaypoints[0]]);
    scanTotalSegmentsRef.current = Math.max(1, drivenPath.length - 1);
    play(drivenPath, { speedUnitsPerSecond: SCAN_SPEED_UNITS_PER_SECOND, dwellSeconds: 0 });
  };

  const handleResetToDraft = () => {
    reset();
    setScanActive(false);
    lidar.clear();
    resetToDraft(); // keeps vehicleScanned, so the outline stays shown while editing
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
          revealedWaypointIds={revealedWaypointIds}
          staticOutline={plan.vehicleScanned ? outlineCloud : null}
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
