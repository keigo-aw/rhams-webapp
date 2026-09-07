export const CHART_WIDTH = 320;
export const CHART_HEIGHT = 480;
export const PLOT_LEFT = 56;
export const PLOT_RIGHT = 296;
export const PLOT_TOP = 28;
export const PLOT_BOTTOM = 444;

const TICK_INTERVALS = 4;

/** Rounds the axis max up to a clean increment with ~30% headroom above the highest reading, so the tallest bar never touches the top. */
export function computeNiceMax(maxValue: number): number {
  if (maxValue <= 0) return 1;
  return Math.ceil((maxValue * 1.3) / 0.5) * 0.5;
}

export function yFor(value: number, niceMax: number): number {
  return PLOT_BOTTOM - (value / niceMax) * (PLOT_BOTTOM - PLOT_TOP);
}

export function valueForY(y: number, niceMax: number): number {
  return ((PLOT_BOTTOM - y) / (PLOT_BOTTOM - PLOT_TOP)) * niceMax;
}

export interface ChartTick {
  value: number;
  y: number;
}

export function computeTicks(niceMax: number): ChartTick[] {
  const ticks: ChartTick[] = [];
  for (let i = 0; i <= TICK_INTERVALS; i++) {
    const value = (niceMax / TICK_INTERVALS) * i;
    ticks.push({ value, y: yFor(value, niceMax) });
  }
  return ticks;
}

export interface ChartBarGeometry {
  x: number;
  width: number;
}

export function computeBarGeometry(index: number, count: number): ChartBarGeometry {
  const slot = (PLOT_RIGHT - PLOT_LEFT) / count;
  const width = slot * 0.5;
  const x = PLOT_LEFT + slot * index + (slot - width) / 2;
  return { x, width };
}
