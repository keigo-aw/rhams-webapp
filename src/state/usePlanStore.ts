import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import type { Plan, Waypoint } from '../types/domain';
import { GRID_BOUNDS, OBSTACLE, clampToBounds } from '../canvas/coordinates';
import { WAYPOINT_COUNT_RANGE, mockPathGenerator } from '../data/mockPathGenerator';
import { generateId } from '../utils/id';
import { loadCurrentPlan, saveCurrentPlan } from '../persistence/storage';
import { savePlanToHistory } from '../persistence/planHistory';

/** A plan needs at least a start and an end before it can be confirmed. */
export const MIN_CONFIRMABLE_WAYPOINTS = 2;

/** How long edits must settle before the plan is written to IndexedDB. */
const PERSIST_DEBOUNCE_MS = 300;

function createDraftPlan(waypointCount?: number): Plan {
  return {
    id: generateId(),
    status: 'draft',
    waypoints: mockPathGenerator.generateTravelledPath({ obstacle: OBSTACLE, bounds: GRID_BOUNDS, waypointCount }),
    createdAt: Date.now(),
  };
}

function renumber(waypoints: Waypoint[]): Waypoint[] {
  return waypoints.map((wp, index) => ({ ...wp, order: index }));
}

type Action =
  | { type: 'MOVE_WAYPOINT'; id: string; x: number; y: number }
  | { type: 'ADD_WAYPOINT'; x: number; y: number }
  | { type: 'TOGGLE_MEASUREMENT_POINT'; id: string }
  | { type: 'REORDER_WAYPOINT'; id: string; direction: 'up' | 'down' }
  | { type: 'DELETE_WAYPOINT'; id: string }
  | { type: 'CONFIRM' }
  | { type: 'RESET_TO_DRAFT' }
  | { type: 'GENERATE_NEW'; waypointCount?: number }
  | { type: 'SET_PATH'; waypoints: Waypoint[] }
  | { type: 'MARK_SCANNED' }
  | { type: 'HYDRATE'; plan: Plan };

function reducer(plan: Plan, action: Action): Plan {
  switch (action.type) {
    case 'MOVE_WAYPOINT': {
      if (plan.status !== 'draft') return plan;
      const clamped = clampToBounds({ x: action.x, y: action.y });
      return {
        ...plan,
        waypoints: plan.waypoints.map((wp) =>
          wp.id === action.id ? { ...wp, ...clamped } : wp,
        ),
      };
    }
    case 'ADD_WAYPOINT': {
      if (plan.status !== 'draft') return plan;
      const clamped = clampToBounds({ x: action.x, y: action.y });
      const waypoint: Waypoint = {
        id: generateId(),
        order: plan.waypoints.length,
        isMeasurementPoint: true,
        ...clamped,
      };
      return { ...plan, waypoints: [...plan.waypoints, waypoint] };
    }
    case 'TOGGLE_MEASUREMENT_POINT': {
      // Allowed on a confirmed plan too — marking measurement points happens after the route is locked in.
      return {
        ...plan,
        waypoints: plan.waypoints.map((wp) =>
          wp.id === action.id ? { ...wp, isMeasurementPoint: !wp.isMeasurementPoint } : wp,
        ),
      };
    }
    case 'REORDER_WAYPOINT': {
      if (plan.status !== 'draft') return plan;
      const index = plan.waypoints.findIndex((wp) => wp.id === action.id);
      if (index === -1) return plan;
      const swapWith = action.direction === 'up' ? index - 1 : index + 1;
      if (swapWith < 0 || swapWith >= plan.waypoints.length) return plan;
      const next = [...plan.waypoints];
      [next[index], next[swapWith]] = [next[swapWith], next[index]];
      return { ...plan, waypoints: renumber(next) };
    }
    case 'DELETE_WAYPOINT': {
      if (plan.status !== 'draft') return plan;
      return { ...plan, waypoints: renumber(plan.waypoints.filter((wp) => wp.id !== action.id)) };
    }
    case 'CONFIRM': {
      if (plan.waypoints.length < MIN_CONFIRMABLE_WAYPOINTS) return plan;
      return { ...plan, status: 'confirmed', confirmedAt: Date.now() };
    }
    case 'RESET_TO_DRAFT': {
      // Keep vehicleScanned — once discovered, the outline stays shown even while editing.
      return { ...plan, status: 'draft', confirmedAt: undefined };
    }
    case 'MARK_SCANNED': {
      return plan.vehicleScanned ? plan : { ...plan, vehicleScanned: true };
    }
    case 'GENERATE_NEW': {
      return createDraftPlan(action.waypointCount);
    }
    case 'SET_PATH': {
      // Replace the route in place (same plan id), back to draft. vehicleScanned is preserved.
      return { ...plan, status: 'draft', confirmedAt: undefined, waypoints: action.waypoints };
    }
    case 'HYDRATE': {
      return action.plan;
    }
    default:
      return plan;
  }
}

export function usePlanStore() {
  const [plan, dispatch] = useReducer(reducer, undefined, () => createDraftPlan());
  const [isLoading, setIsLoading] = useState(true);
  const hasHydratedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loaded = await loadCurrentPlan();
      if (cancelled) return;
      if (loaded) dispatch({ type: 'HYDRATE', plan: loaded });
      hasHydratedRef.current = true;
      setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Dragging a waypoint dispatches MOVE_WAYPOINT per pointermove, so persisting on every plan
  // change wrote the whole plan to IndexedDB 100+ times per drag. The in-memory plan drives the
  // UI; storage only needs to catch up once the edits settle.
  useEffect(() => {
    if (!hasHydratedRef.current) return;
    const timer = setTimeout(() => {
      saveCurrentPlan(plan).catch((err) => console.error('Failed to save current plan', err));
      if (plan.status === 'confirmed') {
        savePlanToHistory(plan).catch((err) => console.error('Failed to save plan history', err));
      }
    }, PERSIST_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [plan]);

  const moveWaypoint = useCallback((id: string, x: number, y: number) => {
    dispatch({ type: 'MOVE_WAYPOINT', id, x, y });
  }, []);

  const addWaypoint = useCallback((x: number, y: number) => {
    dispatch({ type: 'ADD_WAYPOINT', x, y });
  }, []);

  const toggleMeasurementPoint = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_MEASUREMENT_POINT', id });
  }, []);

  const reorderWaypoint = useCallback((id: string, direction: 'up' | 'down') => {
    dispatch({ type: 'REORDER_WAYPOINT', id, direction });
  }, []);

  const deleteWaypoint = useCallback((id: string) => {
    dispatch({ type: 'DELETE_WAYPOINT', id });
  }, []);

  const confirmPlan = useCallback(() => {
    dispatch({ type: 'CONFIRM' });
  }, []);

  const resetToDraft = useCallback(() => {
    dispatch({ type: 'RESET_TO_DRAFT' });
  }, []);

  const generateNewMockPath = useCallback((waypointCount?: number) => {
    dispatch({ type: 'GENERATE_NEW', waypointCount });
  }, []);

  const markVehicleScanned = useCallback(() => {
    dispatch({ type: 'MARK_SCANNED' });
  }, []);

  const setPath = useCallback((waypoints: Waypoint[]) => {
    dispatch({ type: 'SET_PATH', waypoints });
  }, []);

  /** A fresh default path at the minimum waypoint count, for restarting discovery from a clean loop. */
  const buildDefaultPath = useCallback(
    () => mockPathGenerator.generateTravelledPath({ obstacle: OBSTACLE, bounds: GRID_BOUNDS, waypointCount: WAYPOINT_COUNT_RANGE.min }),
    [],
  );

  return {
    plan,
    isLoading,
    moveWaypoint,
    addWaypoint,
    toggleMeasurementPoint,
    reorderWaypoint,
    deleteWaypoint,
    confirmPlan,
    resetToDraft,
    generateNewMockPath,
    markVehicleScanned,
    setPath,
    buildDefaultPath,
  };
}
