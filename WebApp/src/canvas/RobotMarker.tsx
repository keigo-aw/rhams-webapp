import type { Point } from '../types/domain';

interface RobotMarkerProps {
  position: Point;
}

export function RobotMarker({ position }: RobotMarkerProps) {
  return (
    <g transform={`translate(${position.x}, ${position.y})`} className="robot-marker">
      <circle r={9} className="robot-body" />
      <circle r={3} className="robot-core" />
    </g>
  );
}
