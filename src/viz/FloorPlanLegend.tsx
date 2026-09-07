interface FloorPlanLegendProps {
  limitVPerM: number;
}

export function FloorPlanLegend({ limitVPerM }: FloorPlanLegendProps) {
  return (
    <figcaption
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 14px 12px',
        fontSize: 12,
        color: 'color-mix(in srgb, var(--color-text) 60%, transparent)',
      }}
    >
      <svg width={34} height={10} viewBox="0 0 34 10" aria-hidden="true">
        <circle cx={5} cy={5} r={4} fill="var(--color-accent)" />
        <circle cx={17} cy={5} r={4} fill="none" stroke="color-mix(in srgb, var(--color-text) 45%, transparent)" strokeWidth={1.5} />
        <circle cx={29} cy={5} r={4} fill="var(--color-danger)" />
      </svg>
      <span>Ring radius scales with field strength. Red exceeds the {limitVPerM.toFixed(1)} V/m limit.</span>
    </figcaption>
  );
}
