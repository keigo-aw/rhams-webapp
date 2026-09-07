import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import type { Plan, Waypoint } from '../types/domain';
import { GRID_BOUNDS, OBSTACLE, clampToBounds } from '../canvas/coordinates';
import { mockPathGenerator } from '../data/mockPathGenerator';
import { generateId } from '../utils/id';
import { loadCurrentPlan, saveCurrentPlan } from '../persistence/storage';
import { savePlanToHistory } from '../persistence/planHistory';

function createDraftPlan(waypointCount?: number): Plan {
  return {
    id: generateId(),
    status: 'draft',
    waypoints: mockPathGenerator.generateTravelledPath({ obstacle: OBSTACLE, bounds: GRID_BOUNDS, waypointCount }),
    createdAt: Date.now(),
  };
}

type Action =
  | { type: 'ADD_WAYPOINT'; x: number; y: number }
  | { type: 'TOGGLE_MEASUREMENT_POINT'; id: string }
  | { type: 'CONFIRM' }
  | { type: 'RESET_TO_DRAFT' }
  | { type: 'GENERATE_NEW'; waypointCount?: number }
  | { type: 'HYDRATE'; plan: Plan };

function reducer(plan: Plan, action: Action): Plan {
  switch (action.type) {
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
    case 'CONFIRM': {
      if (plan.waypoints.length < 2) return plan;
      return { ...plan, status: 'confirmed', confirmedAt: Date.now() };
    }
    case 'RESET_TO_DRAFT': {
      return { ...plan, status: 'draft', confirmedAt: undefined };
    }
    case 'GENERATE_NEW': {
      return createDraftPlan(action.waypointCount);
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

  useEffect(() => {
    if (!hasHydratedRef.current) return;
    saveCurrentPlan(plan).catch((err) => console.error('Failed to save current plan', err));
    if (plan.status === 'confirmed') {
      savePlanToHistory(plan).catch((err) => console.error('Failed to save plan history', err));
    }
  }, [plan]);

  const addWaypoint = useCallback((x: number, y: number) => {
    dispatch({ type: 'ADD_WAYPOINT', x, y });
  }, []);

  const toggleMeasurementPoint = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_MEASUREMENT_POINT', id });
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

  return {
    plan,
    isLoading,
    addWaypoint,
    toggleMeasurementPoint,
    confirmPlan,
    resetToDraft,
    generateNewMockPath,
  };
}
