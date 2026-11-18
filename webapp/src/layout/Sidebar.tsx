import type { Screen } from './types';
import { PlanIcon, MeasurementIcon, SurveyIcon, HistoryIcon, AnalysisIcon, BackupIcon } from './icons';

const NAV: { id: Screen; label: string; icon: () => React.ReactNode }[] = [
  { id: 'plan', label: 'Path Planning', icon: PlanIcon },
  { id: 'measurement', label: 'Measurement Points', icon: MeasurementIcon },
  { id: 'survey', label: 'Signal Survey', icon: SurveyIcon },
  { id: 'history', label: 'Survey History', icon: HistoryIcon },
  { id: 'analysis', label: 'Analysis', icon: AnalysisIcon },
  { id: 'backup', label: 'Export / Import', icon: BackupIcon },
];

interface SidebarProps {
  active: Screen;
  surveyEnabled: boolean;
  onChange: (screen: Screen) => void;
}

export function Sidebar({ active, surveyEnabled, onChange }: SidebarProps) {
  return (
    <nav className="sidebar">
      {NAV.map((item) => {
        const disabled = (item.id === 'measurement' || item.id === 'survey') && !surveyEnabled;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            className={`sidebar-nav-item${active === item.id ? ' active' : ''}`}
            disabled={disabled}
            title={disabled ? 'Confirm a path first' : undefined}
            onClick={() => onChange(item.id)}
          >
            <Icon />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
