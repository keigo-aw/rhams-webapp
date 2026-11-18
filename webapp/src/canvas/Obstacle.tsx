import type { Point } from '../types/domain';

interface ObstacleProps {
  center: Point;
}

/** The parked "Unit Under Test" that the travelled path routes around. */
export function Obstacle({ center }: ObstacleProps) {
  return (
    <g transform={`translate(${center.x}, ${center.y})`}>
      <rect x={-75} y={-40} width={150} height={80} rx={17.6} className="obstacle-body" />
      <rect x={-12} y={-37} width={63} height={74} rx={12.8} className="obstacle-roof" />
      <rect x={-64.5} y={-45.12} width={33} height={12.8} rx={3.84} className="obstacle-wheel" />
      <rect x={-64.5} y={32.32} width={33} height={12.8} rx={3.84} className="obstacle-wheel" />
      <rect x={31.5} y={-45.12} width={33} height={12.8} rx={3.84} className="obstacle-wheel" />
      <rect x={31.5} y={32.32} width={33} height={12.8} rx={3.84} className="obstacle-wheel" />
      <circle cx={37.5} cy={-44} r={3} className="obstacle-mirror" />
      <circle cx={37.5} cy={44} r={3} className="obstacle-mirror" />
      <text y={-52} textAnchor="middle" className="obstacle-label">
        Unit Under Test
      </text>
    </g>
  );
}
