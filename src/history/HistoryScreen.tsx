import { FloorPlan } from '../viz/FloorPlan';
import { FloorPlanLegend } from '../viz/FloorPlanLegend';
import { Kicker } from '../ui/Kicker';
import { Button } from '../ui/Button';
import { PanelPortal } from '../shell/PanelSlot';
import { DEFAULT_LIMIT_V_PER_M } from '../analysis/standards';
import { useSurveyHistory } from './useSurveyHistory';

export function HistoryScreen() {
  const { records, selectedRecord, selectRecord, clearHistory, isLoading } = useSurveyHistory();
  const readingByWaypointId = new Map((selectedRecord?.readings ?? []).map((r) => [r.waypointId, r]));

  return (
    <>
      <figure className="blueprint" style={{ background: 'var(--color-surface)', margin: 0 }}>
        <i className="corner tl" />
        <i className="corner tr" />
        <i className="corner bl" />
        <i className="corner br" />
        {isLoading ? (
          <p style={{ padding: 20 }}>Loading…</p>
        ) : selectedRecord ? (
          <>
            <FloorPlan waypoints={selectedRecord.waypoints} mode="history" readingByWaypointId={readingByWaypointId} limitVPerM={DEFAULT_LIMIT_V_PER_M} />
            <FloorPlanLegend limitVPerM={DEFAULT_LIMIT_V_PER_M} />
          </>
        ) : (
          <p style={{ padding: 20, fontSize: 13, color: 'color-mix(in srgb, var(--color-text) 55%, transparent)' }}>
            {records.length === 0
              ? 'No past surveys recorded yet. Confirm a path and run a Signal Survey to record one.'
              : 'Select a survey from the list to view it.'}
          </p>
        )}
      </figure>

      <PanelPortal>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Kicker style={{ margin: '0 0 6px' }}>Saved surveys</Kicker>
        {records.length === 0 ? (
          <p style={{ fontSize: 13, color: 'color-mix(in srgb, var(--color-text) 55%, transparent)' }}>No saved surveys yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {records.map((record) => {
              const values = record.readings.map((r) => r.fieldStrengthVPerM);
              const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
              const peak = values.length ? Math.max(...values) : 0;
              const selected = record.id === selectedRecord?.id;
              return (
                <div
                  key={record.id}
                  className="blueprint"
                  onClick={() => selectRecord(record.id)}
                  style={{
                    cursor: 'pointer',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    borderColor: selected ? 'var(--color-accent)' : undefined,
                    background: selected ? 'color-mix(in srgb, var(--color-accent) 8%, transparent)' : undefined,
                  }}
                >
                  <i className="corner tl" />
                  <i className="corner tr" />
                  <i className="corner bl" />
                  <i className="corner br" />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: 15 }}>
                      {new Date(record.completedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                    <span className="num" style={{ fontSize: 12, color: 'color-mix(in srgb, var(--color-text) 55%, transparent)' }}>
                      {record.waypoints.length} pts
                    </span>
                  </div>
                  <div className="num" style={{ fontSize: 12, color: 'color-mix(in srgb, var(--color-text) 55%, transparent)' }}>
                    {record.height} m · {record.probeType}
                  </div>
                  <div className="num" style={{ display: 'flex', gap: 14, fontSize: 13 }}>
                    <span>Avg {avg.toFixed(2)} V/m</span>
                    <span>Peak {peak.toFixed(2)} V/m</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <Button variant="secondary" block onClick={clearHistory} disabled={records.length === 0} style={{ marginTop: 12 }}>
          Clear all history
        </Button>
      </div>
      </PanelPortal>
    </>
  );
}
