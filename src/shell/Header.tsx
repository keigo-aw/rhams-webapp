import { Home } from 'lucide-react';
import { Tag } from '../ui/Tag';
import type { PlanStatus } from '../types/domain';

const VERSION = 'v0.1.0';

interface HeaderProps {
  planStatus: PlanStatus;
}

export function Header({ planStatus }: HeaderProps) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '0 20px',
        height: 56,
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-divider)',
        flex: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 'auto' }}>
        <Home size={20} color="var(--color-accent)" strokeWidth={1.5} aria-hidden="true" />
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 19, letterSpacing: '0.01em' }}>
          RHAMS
        </span>
        <span
          style={{
            fontSize: 12,
            color: 'color-mix(in srgb, var(--color-text) 55%, transparent)',
            borderLeft: '1px solid var(--color-divider)',
            paddingLeft: 10,
          }}
        >
          Radiated Hazard Assessment &amp; Measurement Suite
        </span>
      </div>
      <Tag variant="outline">{VERSION}</Tag>
      <Tag variant="accent">{planStatus === 'confirmed' ? 'Plan confirmed' : 'Plan editing'}</Tag>
    </header>
  );
}
