import { useState } from 'react';
import type { Plan } from '../types/domain';
import { FloorPlan } from '../viz/FloorPlan';
import { RightPanelList, type RightPanelListRow } from '../shell/RightPanelList';
import { Field } from '../ui/Field';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { PanelPortal } from '../shell/PanelSlot';
import { WAYPOINT_COUNT_RANGE } from '../data/mockPathGenerator';

interface PlanningScreenProps {
  plan: Plan;
  addWaypoint: (x: number, y: number) => void;
  confirmPlan: () => void;
  resetToDraft: () => void;
  generateNewMockPath: (waypointCount?: number) => void;
}

export function PlanningScreen({ plan, addWaypoint, confirmPlan, resetToDraft, generateNewMockPath }: PlanningScreenProps) {
  const [waypointCount, setWaypointCount] = useState(WAYPOINT_COUNT_RANGE.default);
  const sorted = [...plan.waypoints].sort((a, b) => a.order - b.order);
  const isConfirmed = plan.status === 'confirmed';

  const rows: RightPanelListRow[] = sorted.map((wp, i) => {
    const prev = sorted[i - 1];
    const distance = prev ? Math.hypot(wp.x - prev.x, wp.y - prev.y) : 0;
    return {
      id: wp.id,
      n: wp.order + 1,
      coords: `${wp.x.toFixed(1)}, ${wp.y.toFixed(1)}`,
      value: distance.toFixed(1),
    };
  });

  return (
    <>
      <figure className="blueprint" style={{ background: 'var(--color-surface)', margin: 0 }}>
        <i className="corner tl" />
        <i className="corner tr" />
        <i className="corner bl" />
        <i className="corner br" />
        <FloorPlan waypoints={plan.waypoints} mode="path" onAddPoint={isConfirmed ? undefined : addWaypoint} />
      </figure>
      <PanelPortal>
        <RightPanelScaffold
          waypointCount={waypointCount}
          onWaypointCountChange={setWaypointCount}
          isConfirmed={isConfirmed}
          onRegenerate={() => generateNewMockPath(waypointCount)}
          onConfirm={confirmPlan}
          onEditAgain={resetToDraft}
          rows={rows}
        />
      </PanelPortal>
    </>
  );
}

interface RightPanelScaffoldProps {
  waypointCount: number;
  onWaypointCountChange: (n: number) => void;
  isConfirmed: boolean;
  onRegenerate: () => void;
  onConfirm: () => void;
  onEditAgain: () => void;
  rows: RightPanelListRow[];
}

function RightPanelScaffold({
  waypointCount,
  onWaypointCountChange,
  isConfirmed,
  onRegenerate,
  onConfirm,
  onEditAgain,
  rows,
}: RightPanelScaffoldProps) {
  return (
    <>
      <div style={{ borderBottom: '1px solid var(--color-divider)', paddingBottom: 16 }}>
        <Field label="Waypoints" maxWidth={120}>
          <Input
            num
            type="number"
            min={WAYPOINT_COUNT_RANGE.min}
            max={WAYPOINT_COUNT_RANGE.max}
            value={waypointCount}
            disabled={isConfirmed}
            onChange={(e) => onWaypointCountChange(Number(e.target.value))}
          />
        </Field>
        <p style={{ fontSize: 11, margin: '8px 0 0', color: 'color-mix(in srgb, var(--color-text) 55%, transparent)' }}>
          Minimum {WAYPOINT_COUNT_RANGE.min}, maximum {WAYPOINT_COUNT_RANGE.max}. Click the plan to add a point.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <Button variant="primary" style={{ flex: 1 }} disabled={isConfirmed} onClick={onRegenerate}>
            Regenerate path
          </Button>
          {isConfirmed ? (
            <Button variant="secondary" style={{ flex: 1 }} onClick={onEditAgain}>
              Edit again
            </Button>
          ) : (
            <Button variant="secondary" style={{ flex: 1 }} onClick={onConfirm}>
              Confirm
            </Button>
          )}
        </div>
      </div>
      <RightPanelList title="Waypoints" rows={rows} />
    </>
  );
}
