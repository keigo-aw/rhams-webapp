import type { SignalReading, Waypoint } from '../types/domain';
import { vPerMToWPerM2 } from '../utils/units';
import type { ReadingStatus } from './useAnalysis';

interface ReadingsRow {
  waypoint: Waypoint;
  reading: SignalReading;
  status: ReadingStatus;
}

interface ReadingsTableProps {
  rows: ReadingsRow[];
}

function StatusPill({ status }: { status: ReadingStatus }) {
  if (status === 'none') return <span className="status-pill status-none">—</span>;
  return (
    <span className={`status-pill ${status === 'pass' ? 'status-pass' : 'status-fail'}`}>
      {status === 'pass' ? 'Pass' : 'Exceed'}
    </span>
  );
}

export function ReadingsTable({ rows }: ReadingsTableProps) {
  return (
    <div className="readings-table-wrap">
      <table className="readings-table">
        <thead>
          <tr>
            <th>Waypoint</th>
            <th>X (m)</th>
            <th>Y (m)</th>
            <th>Field Strength (V/m)</th>
            <th>Power Density (W/m²)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ waypoint, reading, status }) => (
            <tr key={waypoint.id}>
              <td>{waypoint.order + 1}</td>
              <td>{waypoint.x.toFixed(2)}</td>
              <td>{waypoint.y.toFixed(2)}</td>
              <td>{reading.fieldStrengthVPerM.toFixed(2)}</td>
              <td>{vPerMToWPerM2(reading.fieldStrengthVPerM).toFixed(4)}</td>
              <td>
                <StatusPill status={status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
