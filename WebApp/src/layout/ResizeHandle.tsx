import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';

type Edge = 'start' | 'end';

interface ResizeHandleProps {
  /** Which side of the container the panel sits on: 'start' = left rail, 'end' = right panel. */
  edge: Edge;
  /** CSS custom property carrying the panel's width, e.g. '--sidebar-width'. */
  cssVar: string;
  storageKey: string;
  min: number;
  max: number;
  defaultWidth: number;
  label: string;
  className?: string;
}

const KEYBOARD_STEP_PX = 16;

function readStoredWidth(storageKey: string, fallback: number): number {
  try {
    const stored = Number(localStorage.getItem(storageKey));
    return Number.isFinite(stored) && stored > 0 ? stored : fallback;
  } catch {
    return fallback;
  }
}

export function ResizeHandle({ edge, cssVar, storageKey, min, max, defaultWidth, label, className }: ResizeHandleProps) {
  const draggingRef = useRef(false);
  // Only tracked so the separator can expose an accurate aria-valuenow — the drag itself writes
  // straight to the CSS variable, so dragging never re-renders the screen behind it.
  const [width, setWidth] = useState(() => readStoredWidth(storageKey, defaultWidth));

  const applyWidth = (next: number): number => {
    const clamped = Math.min(Math.max(next, min), max);
    document.documentElement.style.setProperty(cssVar, `${clamped}px`);
    return clamped;
  };

  const commitWidth = (next: number) => {
    const clamped = applyWidth(next);
    setWidth(clamped);
    try {
      localStorage.setItem(storageKey, String(clamped));
    } catch {
      // localStorage unavailable — the width just won't persist across reloads
    }
  };

  const widthFromPointer = (e: PointerEvent<HTMLDivElement>): number => {
    const container = e.currentTarget.parentElement;
    if (!container) return width;
    const rect = container.getBoundingClientRect();
    return edge === 'start' ? e.clientX - rect.left : rect.right - e.clientX;
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    applyWidth(widthFromPointer(e));
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    commitWidth(widthFromPointer(e));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const grow = edge === 'start' ? e.key === 'ArrowRight' : e.key === 'ArrowLeft';
    commitWidth(width + (grow ? KEYBOARD_STEP_PX : -KEYBOARD_STEP_PX));
  };

  return (
    <div
      className={['resize-handle', className].filter(Boolean).join(' ')}
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuenow={width}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onKeyDown={handleKeyDown}
    />
  );
}
