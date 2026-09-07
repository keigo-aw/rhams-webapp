const COLOR_SCALE_MAX_V_PER_M = 20;
const STRONG_THRESHOLD_V_PER_M = 10;
const MEDIUM_THRESHOLD_V_PER_M = 3;

export function signalColor(fieldStrengthVPerM: number): string {
  const hue = Math.min(Math.max(fieldStrengthVPerM, 0), COLOR_SCALE_MAX_V_PER_M) * (120 / COLOR_SCALE_MAX_V_PER_M);
  return `hsl(${hue}, 70%, 45%)`;
}

export function signalLabel(fieldStrengthVPerM: number): string {
  if (fieldStrengthVPerM >= STRONG_THRESHOLD_V_PER_M) return 'Strong';
  if (fieldStrengthVPerM >= MEDIUM_THRESHOLD_V_PER_M) return 'Medium';
  return 'Weak';
}

export function summarizeSignalStrength(values: number[]): { avg: number; min: number; max: number } {
  if (values.length === 0) return { avg: 0, min: 0, max: 0 };
  const avg = Math.round((values.reduce((sum, v) => sum + v, 0) / values.length) * 100) / 100;
  return { avg, min: Math.min(...values), max: Math.max(...values) };
}
