import type { PlanStatus } from '../types/domain';
import type { Theme } from '../state/useTheme';
import { planStatusLabel } from '../utils/planStatus';
import { BrandIcon, DarkModeIcon, LightModeIcon } from './icons';

interface TopBarProps {
  planStatus: PlanStatus;
  theme: Theme;
  onToggleTheme: () => void;
}

export function TopBar({ planStatus, theme, onToggleTheme }: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="brand">
        <span className="brand-mark">
          <BrandIcon />
        </span>
        <div className="brand-text">
          <span className="brand-name">RHAMS</span>
          <span className="brand-tagline">Radiated Hazard Assessment &amp; Measurement Suite</span>
        </div>
      </div>
      <div className="top-bar-actions">
        <button
          type="button"
          className="theme-toggle"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
        </button>
        <span className={`status-badge ${planStatus === 'confirmed' ? 'status-confirmed' : ''}`}>
          {planStatusLabel(planStatus)}
        </span>
      </div>
    </header>
  );
}
