import { useCallback, useRef, type PointerEvent } from 'react';
import { clientPointToGrid } from '../canvas/coordinates';

interface UseDragWaypointOptions {
  disabled?: boolean;
  onMove: (x: number, y: number) => void;
  /** Fired on release when the pointer never moved past the click threshold — i.e. a plain click, not a drag. */
  onClick?: () => void;
}

/** Below this much on-screen movement, a press-and-release counts as a click rather than a drag. */
const CLICK_MOVE_THRESHOLD_PX = 4;

/** Pointer-drag handling for a single waypoint marker: converts pointer position to grid units via the owning SVG's viewBox. */
export function useDragWaypoint({ disabled, onMove, onClick }: UseDragWaypointOptions) {
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });

  const handlePointerDown = useCallback(
    (e: PointerEvent<SVGGElement>) => {
      if (disabled) return;
      draggingRef.current = true;
      movedRef.current = false;
      startRef.current = { x: e.clientX, y: e.clientY };
      e.currentTarget.setPointerCapture(e.pointerId);
      e.stopPropagation();
    },
    [disabled],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent<SVGGElement>) => {
      if (!draggingRef.current || disabled) return;
      if (Math.hypot(e.clientX - startRef.current.x, e.clientY - startRef.current.y) > CLICK_MOVE_THRESHOLD_PX) {
        movedRef.current = true;
      }
      const svg = e.currentTarget.ownerSVGElement;
      if (!svg) return;
      const grid = clientPointToGrid(svg, e.clientX, e.clientY);
      onMove(grid.x, grid.y);
    },
    [disabled, onMove],
  );

  const handlePointerUp = useCallback(
    (e: PointerEvent<SVGGElement>) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      e.currentTarget.releasePointerCapture(e.pointerId);
      if (!movedRef.current) onClick?.();
    },
    [onClick],
  );

  return { handlePointerDown, handlePointerMove, handlePointerUp };
}
