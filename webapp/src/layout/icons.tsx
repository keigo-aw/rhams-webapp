function Icon({ name, size }: { name: string; size?: number }) {
  return (
    <span className="material-symbols-outlined" style={size ? { fontSize: size } : undefined} aria-hidden="true">
      {name}
    </span>
  );
}

export function BrandIcon() {
  return <Icon name="settings_input_antenna" size={22} />;
}

export function PlanIcon() {
  return <Icon name="alt_route" />;
}

export function MeasurementIcon() {
  return <Icon name="adjust" />;
}

export function SurveyIcon() {
  return <Icon name="sensors" />;
}

export function HistoryIcon() {
  return <Icon name="history_toggle_off" />;
}

export function AnalysisIcon() {
  return <Icon name="analytics" />;
}

export function BackupIcon() {
  return <Icon name="import_export" />;
}

export function LightModeIcon() {
  return <Icon name="light_mode" />;
}

export function DarkModeIcon() {
  return <Icon name="dark_mode" />;
}
