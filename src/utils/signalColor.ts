import type { Theme } from '../state/useTheme';

const COLOR_SCALE_MAX_V_PER_M = 20;
const STRONG_THRESHOLD_V_PER_M = 10;
const MEDIUM_THRESHOLD_V_PER_M = 3;

/** Low field strength is green (safe), high is red (hazardous) — a green→red heat scale.
 * The same hue at 45% lightness reads well on the dark canvas but fails contrast (as low as
 * 1.8:1 for yellow/green hues) on the light one — pull it down to 28% for the light theme. */
export function signalColor(fieldStrengthVPerM: number, theme: Theme = 'dark'): string {
  const clamped = Math.min(Math.max(fieldStrengthVPerM, 0), COLOR_SCALE_MAX_V_PER_M);
  // hue 120 (green) at the low end down to hue 0 (red) at the high end
  const hue = (COLOR_SCALE_MAX_V_PER_M - clamped) * (120 / COLOR_SCALE_MAX_V_PER_M);
  const lightness = theme === 'light' ? 28 : 45;
  return `hsl(${hue}, 70%, ${lightness}%)`;
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
