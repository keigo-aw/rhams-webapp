import type { PlanStatus } from '../types/domain';
import { planStatusLabel } from '../utils/planStatus';
import { BrandIcon } from './icons';

interface TopBarProps {
  planStatus: PlanStatus;
}

export function TopBar({ planStatus }: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="brand">
        <span className="brand-mark">
          <BrandIcon />
        </span>
        <div className="brand-text">
          <span className="brand-name">RHAMS</span>
          <span className="brand-tagline">Robot Waypoint Planner</span>
        </div>
      </div>
      <span className={`status-badge ${planStatus === 'confirmed' ? 'status-confirmed' : ''}`}>
        {planStatusLabel(planStatus)}
      </span>
    </header>
  );
}
