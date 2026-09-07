import type { Plan } from '../types/domain';
import { FloorPlan } from '../viz/FloorPlan';
import { FloorPlanLegend } from '../viz/FloorPlanLegend';
import { RightPanelList, type RightPanelListRow } from '../shell/RightPanelList';
import { PanelPortal } from '../shell/PanelSlot';
import { Field } from '../ui/Field';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { HEIGHT_OPTIONS, PROBE_TYPE_OPTIONS } from './surveyConfig';
import { DEFAULT_LIMIT_V_PER_M } from '../analysis/standards';
import { useSignalSurvey } from './useSignalSurvey';

interface SignalSurveyScreenProps {
  plan: Plan;
}

export function SignalSurveyScreen({ plan }: SignalSurveyScreenProps) {
  const { readings, revealedIds, start, height, probeType, frequencyStartMHz, frequencyEndMHz } = useSignalSurvey(plan);
  const sorted = [...plan.waypoints].sort((a, b) => a.order - b.order);
  const readingByWaypointId = new Map(readings.map((r) => [r.waypointId, r]));

  const rows: RightPanelListRow[] = sorted.map((wp) => {
    const reading = revealedIds.has(wp.id) ? readingByWaypointId.get(wp.id) : undefined;
    if (!reading) {
      return {
        id: wp.id,
        n: wp.order + 1,
        coords: `${wp.x.toFixed(1)}, ${wp.y.toFixed(1)}`,
        value: 'not measured',
        valueColor: 'color-mix(in srgb, var(--color-text) 55%, transparent)',
      };
    }
    const over = reading.fieldStrengthVPerM > DEFAULT_LIMIT_V_PER_M;
    return {
      id: wp.id,
      n: wp.order + 1,
      coords: `${wp.x.toFixed(1)}, ${wp.y.toFixed(1)}`,
      value: `${reading.fieldStrengthVPerM.toFixed(2)} V/m`,
      valueColor: over ? 'var(--color-danger)' : 'var(--color-accent-700)',
    };
  });

  return (
    <>
      <figure className="blueprint" style={{ background: 'var(--color-surface)', margin: 0 }}>
        <i className="corner tl" />
        <i className="corner tr" />
        <i className="corner bl" />
        <i className="corner br" />
        <FloorPlan waypoints={plan.waypoints} mode="survey" readingByWaypointId={readingByWaypointId} limitVPerM={DEFAULT_LIMIT_V_PER_M} />
        <FloorPlanLegend limitVPerM={DEFAULT_LIMIT_V_PER_M} />
      </figure>

      <PanelPortal>
      <div style={{ borderBottom: '1px solid var(--color-divider)', paddingBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Field label="Antenna height">
          <Select value={height} disabled>
            {HEIGHT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Probe type">
          <Select value={probeType} disabled>
            {PROBE_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label} — {o.rangeLabel}
              </option>
            ))}
          </Select>
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Field label="Start (MHz)">
            <Input num type="number" value={frequencyStartMHz} disabled placeholder="optional" />
          </Field>
          <Field label="End (MHz)">
            <Input num type="number" value={frequencyEndMHz} disabled placeholder="optional" />
          </Field>
        </div>
        <Button variant="primary" block onClick={start}>
          Replay survey
        </Button>
      </div>

      <RightPanelList title="Readings" rows={rows} />
      </PanelPortal>
    </>
  );
}
