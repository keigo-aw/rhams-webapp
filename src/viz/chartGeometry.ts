const MAX_V = 10.5;
const PLOT_TOP = 28;
const PLOT_BOTTOM = 266;
const PLOT_LEFT = 56;
const PLOT_RIGHT = 640;
const BAR_WIDTH = 64;
const TICKS = [0, 2.5, 5, 7.5, 10];

export function yFor(valueVPerM: number): number {
  return PLOT_BOTTOM - (valueVPerM / MAX_V) * (PLOT_BOTTOM - PLOT_TOP);
}

export interface ChartTick {
  value: number;
  y: number;
}

export function computeTicks(): ChartTick[] {
  return TICKS.map((value) => ({ value, y: yFor(value) }));
}

export interface ChartBar {
  id: string;
  n: number;
  x: number;
  y: number;
  width: number;
  height: number;
  over: boolean;
  valueLabel: string;
}

export function computeBars(points: { id: string; n: number; valueVPerM: number; over: boolean }[]): ChartBar[] {
  const count = points.length;
  if (count === 0) return [];
  const gap = (PLOT_RIGHT - PLOT_LEFT - count * BAR_WIDTH) / (count + 1);
  return points.map((p, i) => {
    const x = PLOT_LEFT + gap + i * (BAR_WIDTH + gap);
    const y = yFor(p.valueVPerM);
    return {
      id: p.id,
      n: p.n,
      x,
      y,
      width: BAR_WIDTH,
      height: PLOT_BOTTOM - y,
      over: p.over,
      valueLabel: p.valueVPerM.toFixed(2),
    };
  });
}

export const CHART_PLOT_LEFT = PLOT_LEFT;
export const CHART_PLOT_RIGHT = PLOT_RIGHT;
export const CHART_PLOT_BOTTOM = PLOT_BOTTOM;
