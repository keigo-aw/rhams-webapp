import { Kicker } from '../ui/Kicker';

export interface RightPanelListRow {
  id: string;
  n: number;
  coords: string;
  value: string;
  valueColor?: string;
  selected?: boolean;
}

interface RightPanelListProps {
  title: string;
  rows: RightPanelListRow[];
  onRowClick?: (id: string) => void;
}

export function RightPanelList({ title, rows, onRowClick }: RightPanelListProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <Kicker style={{ margin: '0 0 6px' }}>{title}</Kicker>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
        {rows.map((r) => (
          <li
            key={r.id}
            onClick={onRowClick ? () => onRowClick(r.id) : undefined}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '7px 8px',
              fontSize: 13,
              borderBottom: '1px solid color-mix(in srgb, var(--color-text) 8%, transparent)',
              cursor: onRowClick ? 'pointer' : undefined,
            }}
          >
            {r.selected && (
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'color-mix(in srgb, var(--color-accent) 12%, transparent)',
                }}
              />
            )}
            <span className="num" style={{ position: 'relative', width: 20, color: 'color-mix(in srgb, var(--color-text) 50%, transparent)' }}>
              {r.n}
            </span>
            <span className="num" style={{ position: 'relative', flex: 1, fontSize: 12 }}>
              {r.coords}
            </span>
            <span className="num" style={{ position: 'relative', fontSize: 12, color: r.valueColor }}>
              {r.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
