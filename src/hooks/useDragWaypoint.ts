import { useCallback, useRef, type PointerEvent } from 'react';
import { clientPointToGrid } from '../canvas/coordinates';

interface UseDragWaypointOptions {
  disabled?: boolean;
  onMove: (x: number, y: number) => void;
}

/** Pointer-drag handling for a single waypoint marker: converts pointer position to grid units via the owning SVG's viewBox. */
export function useDragWaypoint({ disabled, onMove }: UseDragWaypointOptions) {
  const draggingRef = useRef(false);

  const handlePointerDown = useCallback(
    (e: PointerEvent<SVGGElement>) => {
      if (disabled) return;
      draggingRef.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      e.stopPropagation();
    },
    [disabled],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent<SVGGElement>) => {
      if (!draggingRef.current || disabled) return;
      const svg = e.currentTarget.ownerSVGElement;
      if (!svg) return;
      const grid = clientPointToGrid(svg, e.clientX, e.clientY);
      onMove(grid.x, grid.y);
    },
    [disabled, onMove],
  );

  const handlePointerUp = useCallback((e: PointerEvent<SVGGElement>) => {
    draggingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);

  return { handlePointerDown, handlePointerMove, handlePointerUp };
}
