import type { Point } from '../types/domain';

interface PathLineProps {
  points: Point[];
  traced?: boolean;
}

export function PathLine({ points, traced }: PathLineProps) {
  if (points.length === 0) return null;
  const pointsAttr = points.map((p) => `${p.x},${p.y}`).join(' ');
  return <polyline points={pointsAttr} className={traced ? 'path-line-traced' : 'path-line'} fill="none" />;
}
