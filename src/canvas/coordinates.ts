import type { GridBounds, Obstacle, Point } from '../types/domain';

export const GRID_BOUNDS: GridBounds = { width: 40, height: 40 };
export const PIXELS_PER_UNIT = 20;
export const OBSTACLE: Obstacle = {
  center: { x: GRID_BOUNDS.width / 2, y: GRID_BOUNDS.height / 2 },
  radius: 5,
};
/** Minimum clearance the robot must keep from the vehicle's radius, in meters (1 grid unit = 1 meter). */
export const VEHICLE_CLEARANCE_METERS = 1;

export function gridToSvg(point: Point): Point {
  return { x: point.x * PIXELS_PER_UNIT, y: point.y * PIXELS_PER_UNIT };
}

export function svgToGrid(point: Point): Point {
  return { x: point.x / PIXELS_PER_UNIT, y: point.y / PIXELS_PER_UNIT };
}

export function clampToBounds(point: Point, bounds: GridBounds = GRID_BOUNDS): Point {
  return {
    x: Math.min(Math.max(point.x, 0), bounds.width),
    y: Math.min(Math.max(point.y, 0), bounds.height),
  };
}

/** Converts a pointer event's client coordinates into grid units, given the owning SVG element. */
export function clientPointToGrid(svg: SVGSVGElement, clientX: number, clientY: number): Point {
  const rect = svg.getBoundingClientRect();
  const box = svg.viewBox.baseVal;
  const scaleX = box.width / rect.width;
  const scaleY = box.height / rect.height;
  const svgX = (clientX - rect.left) * scaleX + box.x;
  const svgY = (clientY - rect.top) * scaleY + box.y;
  return clampToBounds(svgToGrid({ x: svgX, y: svgY }));
}
