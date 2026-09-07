import { useState, type ReactNode } from 'react';
import type { PlanStatus } from '../types/domain';
import { Header } from './Header';
import { RunMetaStrip } from './RunMetaStrip';
import { LeftRail } from './LeftRail';
import { RightPanelHeader } from './RightPanelHeader';
import { PanelSlotProvider } from './PanelSlot';
import type { Screen } from './types';

interface AppShellProps {
  screen: Screen;
  onScreenChange: (screen: Screen) => void;
  surveyEnabled: boolean;
  planStatus: PlanStatus;
  center: ReactNode;
}

export function AppShell({ screen, onScreenChange, surveyEnabled, planStatus, center }: AppShellProps) {
  const [panelNode, setPanelNode] = useState<HTMLDivElement | null>(null);

  return (
    <PanelSlotProvider value={panelNode}>
      <div
        style={{
          display: 'grid',
          gridTemplateRows: 'auto auto 1fr',
          height: '100vh',
          background: 'var(--color-bg)',
          color: 'var(--color-text)',
          fontFamily: 'var(--font-body)',
        }}
      >
        <Header planStatus={planStatus} />
        <RunMetaStrip />
        <div style={{ display: 'grid', gridTemplateColumns: '224px minmax(0,1fr) 348px', minHeight: 0 }}>
          <LeftRail active={screen} surveyEnabled={surveyEnabled} onChange={onScreenChange} />
          <main style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 20, minWidth: 0, overflow: 'auto' }}>
            {center}
          </main>
          <aside
            style={{
              borderLeft: '1px solid var(--color-divider)',
              padding: 18,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              minHeight: 0,
            }}
          >
            <RightPanelHeader screen={screen} />
            <div ref={setPanelNode} style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }} />
          </aside>
        </div>
      </div>
    </PanelSlotProvider>
  );
}
