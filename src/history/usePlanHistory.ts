import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Plan } from '../types/domain';
import { clearPlanHistory, deletePlanFromHistory, loadPlanHistory } from '../persistence/planHistory';

export function usePlanHistory() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loaded = await loadPlanHistory();
      if (cancelled) return;
      setPlans(loaded);
      setSelectedId(loaded[0]?.id ?? null);
      setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedPlan = useMemo(() => plans.find((p) => p.id === selectedId) ?? null, [plans, selectedId]);

  const removePlan = useCallback(
    (id: string) => {
      setPlans((prev) => {
        const next = prev.filter((p) => p.id !== id);
        setSelectedId((cur) => (cur === id ? next[0]?.id ?? null : cur));
        return next;
      });
      deletePlanFromHistory(id).catch((err) => console.error('Failed to delete plan from history', err));
    },
    [],
  );

  const clearPlans = useCallback(() => {
    setPlans([]);
    setSelectedId(null);
    clearPlanHistory().catch((err) => console.error('Failed to clear plan history', err));
  }, []);

  return { plans, selectedPlan, selectPlan: setSelectedId, removePlan, clearPlans, isLoading };
}
