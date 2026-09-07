import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SurveyRecord } from '../types/domain';
import { clearSurveyHistory, loadSurveyHistory } from '../persistence/surveyHistory';

export function useSurveyHistory() {
  const [records, setRecords] = useState<SurveyRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loaded = await loadSurveyHistory();
      if (cancelled) return;
      setRecords(loaded);
      setSelectedId(loaded[0]?.id ?? null);
      setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedRecord = useMemo(
    () => records.find((r) => r.id === selectedId) ?? null,
    [records, selectedId],
  );

  const clearHistory = useCallback(() => {
    setRecords([]);
    setSelectedId(null);
    clearSurveyHistory().catch((err) => console.error('Failed to clear survey history', err));
  }, []);

  return { records, selectedRecord, selectRecord: setSelectedId, clearHistory, isLoading };
}
