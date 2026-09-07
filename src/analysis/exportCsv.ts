import type { SignalReading, Waypoint } from '../types/domain';
import { vPerMToWPerM2 } from '../utils/units';

interface CsvRow {
  waypoint: Waypoint;
  reading: SignalReading;
  pass: boolean;
}

export function buildSurveyCsv(rows: CsvRow[]): string {
  const header = ['Waypoint', 'X (m)', 'Y (m)', 'Field Strength (V/m)', 'Power Density (W/m2)', 'Status'];
  const lines = rows.map(({ waypoint, reading, pass }) => {
    const wPerM2 = vPerMToWPerM2(reading.fieldStrengthVPerM);
    return [
      waypoint.order + 1,
      waypoint.x.toFixed(2),
      waypoint.y.toFixed(2),
      reading.fieldStrengthVPerM.toFixed(2),
      wPerM2.toFixed(4),
      pass ? 'Pass' : 'Fail',
    ].join(',');
  });
  return [header.join(','), ...lines].join('\n');
}

export function downloadCsv(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
