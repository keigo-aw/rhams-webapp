// Static placeholder content — no run-metadata data model exists yet.
// See design_handoff_rhams/README.md "Content to confirm before shipping".
const RUN_META: { k: string; v: string }[] = [
  { k: 'Project', v: 'RF-2609-114' },
  { k: 'DUT', v: 'Transponder A2' },
  { k: 'Chamber', v: 'Bay 3 — semi-anechoic' },
  { k: 'Probe cal', v: 'valid to 12 Mar 2027' },
  { k: 'Operator', v: 'K. Almeida' },
];

export function RunMetaStrip() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        height: 38,
        padding: '0 20px',
        borderBottom: '1px solid var(--color-divider)',
        fontSize: 12,
        flex: 'none',
        overflow: 'hidden',
      }}
    >
      {RUN_META.map((m) => (
        <span
          key={m.k}
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 6,
            paddingRight: 22,
            marginRight: 22,
            borderRight: '1px solid var(--color-divider)',
            whiteSpace: 'nowrap',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 10,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'color-mix(in srgb, var(--color-text) 50%, transparent)',
            }}
          >
            {m.k}
          </span>
          <span className="num">{m.v}</span>
        </span>
      ))}
    </div>
  );
}
