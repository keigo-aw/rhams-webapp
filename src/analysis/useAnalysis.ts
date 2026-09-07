import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SurveyRecord } from '../types/domain';
import { loadSurveyHistory } from '../persistence/surveyHistory';
import { convertFromVPerM, vPerMToWPerM2, wPerM2ToVPerM, type ReadingUnit } from '../utils/units';
import { findStandard, standardsForCategory, type HazardCategory } from './standards';

const DEFAULT_THRESHOLD_V_PER_M = 10;

export function useAnalysis() {
  const [records, setRecords] = useState<SurveyRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unit, setUnit] = useState<ReadingUnit>('V/m');
  const [thresholdVPerM, setThresholdVPerM] = useState<number>(DEFAULT_THRESHOLD_V_PER_M);
  const [hazardCategory, setHazardCategoryState] = useState<HazardCategory | null>(null);
  const [standardId, setStandardIdState] = useState<string | null>(null);

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

  const sortedWaypoints = useMemo(
    () => (selectedRecord ? [...selectedRecord.waypoints].sort((a, b) => a.order - b.order) : []),
    [selectedRecord],
  );

  const readingByWaypointId = useMemo(
    () => new Map((selectedRecord?.readings ?? []).map((r) => [r.waypointId, r])),
    [selectedRecord],
  );

  const thresholdInUnit = convertFromVPerM(thresholdVPerM, unit);

  const rows = useMemo(
    () =>
      sortedWaypoints.flatMap((waypoint) => {
        const reading = readingByWaypointId.get(waypoint.id);
        if (!reading) return [];
        const valueInUnit = convertFromVPerM(reading.fieldStrengthVPerM, unit);
        return [{ waypoint, reading, pass: valueInUnit < thresholdInUnit }];
      }),
    [sortedWaypoints, readingByWaypointId, unit, thresholdInUnit],
  );

  const chartData = useMemo(
    () => rows.map(({ waypoint, reading }) => ({ order: waypoint.order, value: convertFromVPerM(reading.fieldStrengthVPerM, unit) })),
    [rows, unit],
  );

  const setThresholdInUnit = useCallback(
    (value: number) => {
      setThresholdVPerM(unit === 'V/m' ? value : wPerM2ToVPerM(value));
    },
    [unit],
  );

  const setHazardCategory = useCallback((category: HazardCategory | null) => {
    setHazardCategoryState(category);
    const first = standardsForCategory(category)[0] ?? null;
    setStandardIdState(first?.id ?? null);
    if (first) setThresholdVPerM(first.thresholdVPerM);
  }, []);

  const setStandard = useCallback(
    (id: string | null) => {
      setStandardIdState(id);
      const standard = findStandard(hazardCategory, id);
      if (standard) setThresholdVPerM(standard.thresholdVPerM);
    },
    [hazardCategory],
  );

  return {
    records,
    isLoading,
    selectedRecord,
    selectRecord: setSelectedId,
    unit,
    setUnit,
    thresholdInUnit,
    setThresholdInUnit,
    hazardCategory,
    setHazardCategory,
    standardId,
    setStandard,
    rows,
    chartData,
    vPerMToWPerM2,
  };
}
