import { Kicker } from '../ui/Kicker';
import { SCREEN_META, TOTAL_STEPS, type Screen } from './types';

export function RightPanelHeader({ screen }: { screen: Screen }) {
  const meta = SCREEN_META[screen];
  return (
    <div>
      {meta.step !== null && <Kicker style={{ margin: '0 0 2px' }}>Step {meta.step} of {TOTAL_STEPS}</Kicker>}
      <h4 style={{ margin: 0 }}>{meta.title}</h4>
      <p style={{ fontSize: 13, margin: '6px 0 0', color: 'color-mix(in srgb, var(--color-text) 65%, transparent)', lineHeight: 1.5 }}>
        {meta.blurb}
      </p>
    </div>
  );
}
