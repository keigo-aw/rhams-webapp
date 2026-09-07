import type { Plan } from '../types/domain';
import { FloorPlan } from '../viz/FloorPlan';
import { RightPanelList, type RightPanelListRow } from '../shell/RightPanelList';
import { PanelPortal } from '../shell/PanelSlot';

interface MeasurementScreenProps {
  plan: Plan;
  toggleMeasurementPoint: (id: string) => void;
}

export function MeasurementScreen({ plan, toggleMeasurementPoint }: MeasurementScreenProps) {
  const sorted = [...plan.waypoints].sort((a, b) => a.order - b.order);
  const measuredCount = sorted.filter((wp) => wp.isMeasurementPoint).length;

  const rows: RightPanelListRow[] = sorted.map((wp) => ({
    id: wp.id,
    n: wp.order + 1,
    coords: `${wp.x.toFixed(1)}, ${wp.y.toFixed(1)}`,
    value: wp.isMeasurementPoint ? 'measure' : 'transit',
    selected: wp.isMeasurementPoint,
  }));

  return (
    <>
      <figure className="blueprint" style={{ background: 'var(--color-surface)', margin: 0 }}>
        <i className="corner tl" />
        <i className="corner tr" />
        <i className="corner bl" />
        <i className="corner br" />
        <FloorPlan waypoints={plan.waypoints} mode="points" onMarkerClick={toggleMeasurementPoint} />
      </figure>
      <PanelPortal>
        <RightPanelList title="Waypoints" rows={rows} onRowClick={toggleMeasurementPoint} />
        <p style={{ fontSize: 12, margin: 0, color: 'color-mix(in srgb, var(--color-text) 55%, transparent)' }}>
          {measuredCount} of {sorted.length} waypoints flagged for measurement. The robot passes through the remaining{' '}
          {sorted.length - measuredCount} without stopping.
        </p>
      </PanelPortal>
    </>
  );
}
