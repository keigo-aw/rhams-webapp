import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SurveyRecord } from '../types/domain';
import { loadSurveyHistory } from '../persistence/surveyHistory';
import { convertFromVPerM, vPerMToWPerM2, wPerM2ToVPerM, type ReadingUnit } from '../utils/units';
import { generateId } from '../utils/id';
import { HAZARD_CATEGORIES } from './standards';
import { LIMIT_LINE_COLORS } from './chartScale';

const DEFAULT_CUSTOM_V_PER_M = 10;

export type ReadingStatus = 'pass' | 'exceed' | 'none';

/** A horizontal limit on the chart — either a selected standard or a user-added custom line. */
export interface LimitLine {
  key: string; // 'standard:<id>' | 'custom:<id>'
  kind: 'standard' | 'custom';
  refId: string; // the standard id or the custom-line id
  label: string;
  valueVPerM: number;
  valueInUnit: number;
  color: string;
}

const ALL_STANDARDS = HAZARD_CATEGORIES.flatMap((c) => c.standards);

export function useAnalysis() {
  const [records, setRecords] = useState<SurveyRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unit, setUnit] = useState<ReadingUnit>('V/m');
  const [selectedStandardIds, setSelectedStandardIds] = useState<string[]>([]);
  const [customLines, setCustomLines] = useState<{ id: string; valueVPerM: number }[]>([]);

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

  const selectedRecord = useMemo(() => records.find((r) => r.id === selectedId) ?? null, [records, selectedId]);

  const sortedWaypoints = useMemo(
    () => (selectedRecord ? [...selectedRecord.waypoints].sort((a, b) => a.order - b.order) : []),
    [selectedRecord],
  );

  const readingByWaypointId = useMemo(
    () => new Map((selectedRecord?.readings ?? []).map((r) => [r.waypointId, r])),
    [selectedRecord],
  );

  // Standards first (in HERP→HERO→HERF order), then custom lines in creation order; color by position.
  const limitLines = useMemo<LimitLine[]>(() => {
    const base = [
      ...ALL_STANDARDS.filter((s) => selectedStandardIds.includes(s.id)).map((s) => ({
        kind: 'standard' as const,
        refId: s.id,
        label: s.label,
        valueVPerM: s.thresholdVPerM,
      })),
      ...customLines.map((c, i) => ({
        kind: 'custom' as const,
        refId: c.id,
        label: `Custom ${i + 1}`,
        valueVPerM: c.valueVPerM,
      })),
    ];
    return base.map((line, idx) => ({
      key: `${line.kind}:${line.refId}`,
      ...line,
      valueInUnit: convertFromVPerM(line.valueVPerM, unit),
      color: LIMIT_LINE_COLORS[idx % LIMIT_LINE_COLORS.length],
    }));
  }, [selectedStandardIds, customLines, unit]);

  // "Most restrictive wins": pass/fail is judged against the lowest active limit.
  const activeThresholdVPerM = useMemo(
    () => (limitLines.length ? Math.min(...limitLines.map((l) => l.valueVPerM)) : null),
    [limitLines],
  );
  const activeThresholdInUnit = activeThresholdVPerM === null ? null : convertFromVPerM(activeThresholdVPerM, unit);

  const rows = useMemo(
    () =>
      sortedWaypoints.flatMap((waypoint) => {
        const reading = readingByWaypointId.get(waypoint.id);
        if (!reading) return [];
        const status: ReadingStatus =
          activeThresholdVPerM === null ? 'none' : reading.fieldStrengthVPerM <= activeThresholdVPerM ? 'pass' : 'exceed';
        return [{ waypoint, reading, status }];
      }),
    [sortedWaypoints, readingByWaypointId, activeThresholdVPerM],
  );

  const chartData = useMemo(
    () => rows.map(({ waypoint, reading }) => ({ order: waypoint.order, value: convertFromVPerM(reading.fieldStrengthVPerM, unit) })),
    [rows, unit],
  );

  const toggleStandard = useCallback((id: string) => {
    setSelectedStandardIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const addCustomLine = useCallback(() => {
    setCustomLines((prev) => [...prev, { id: generateId(), valueVPerM: DEFAULT_CUSTOM_V_PER_M }]);
  }, []);

  const removeCustomLine = useCallback((id: string) => {
    setCustomLines((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const setCustomLineInUnit = useCallback(
    (id: string, valueInUnit: number) => {
      const valueVPerM = unit === 'V/m' ? valueInUnit : wPerM2ToVPerM(valueInUnit);
      setCustomLines((prev) => prev.map((c) => (c.id === id ? { ...c, valueVPerM: Math.max(valueVPerM, 0) } : c)));
    },
    [unit],
  );

  return {
    records,
    isLoading,
    selectedRecord,
    selectRecord: setSelectedId,
    unit,
    setUnit,
    limitLines,
    activeThresholdInUnit,
    selectedStandardIds,
    toggleStandard,
    addCustomLine,
    removeCustomLine,
    setCustomLineInUnit,
    rows,
    chartData,
    vPerMToWPerM2,
  };
}
