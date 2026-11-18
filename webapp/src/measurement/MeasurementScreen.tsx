import type { Plan } from '../types/domain';
import { MeasurementCanvas } from './MeasurementCanvas';
import { MeasurementSidePanel } from './MeasurementSidePanel';

interface MeasurementScreenProps {
  plan: Plan;
  toggleMeasurementPoint: (id: string) => void;
}

export function MeasurementScreen({ plan, toggleMeasurementPoint }: MeasurementScreenProps) {
  const handleSelectAll = () => {
    plan.waypoints.forEach((wp) => {
      if (!wp.isMeasurementPoint) toggleMeasurementPoint(wp.id);
    });
  };

  const handleClearAll = () => {
    plan.waypoints.forEach((wp) => {
      if (wp.isMeasurementPoint) toggleMeasurementPoint(wp.id);
    });
  };

  return (
    <div className="app-layout">
      <main className="canvas-area">
        <MeasurementCanvas waypoints={plan.waypoints} onToggle={toggleMeasurementPoint} vehicleScanned={plan.vehicleScanned} />
      </main>
      <MeasurementSidePanel
        waypoints={plan.waypoints}
        onToggle={toggleMeasurementPoint}
        onSelectAll={handleSelectAll}
        onClearAll={handleClearAll}
      />
    </div>
  );
}
