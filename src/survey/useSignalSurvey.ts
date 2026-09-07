import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Plan, ProbeType, SignalReading, SurveyHeight } from '../types/domain';
import { OBSTACLE } from '../canvas/coordinates';
import { generateSignalReadings } from '../data/mockSignalGenerator';
import { saveSurveyRecord } from '../persistence/surveyHistory';
import { generateId } from '../utils/id';
import { DEFAULT_HEIGHT, DEFAULT_PROBE_TYPE } from './surveyConfig';

export function useSignalSurvey(plan: Plan) {
  const sortedWaypoints = useMemo(() => [...plan.waypoints].sort((a, b) => a.order - b.order), [plan.waypoints]);
  const [readings, setReadings] = useState<SignalReading[]>([]);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [height, setHeight] = useState<SurveyHeight>(DEFAULT_HEIGHT);
  const [probeType, setProbeType] = useState<ProbeType>(DEFAULT_PROBE_TYPE);
  const [frequencyStartMHz, setFrequencyStartMHz] = useState('');
  const [frequencyEndMHz, setFrequencyEndMHz] = useState('');
  const hasStartedRef = useRef(false);
  const savedRef = useRef(false);

  useEffect(() => {
    const measurementPoints = sortedWaypoints.filter((wp) => wp.isMeasurementPoint);
    setReadings(generateSignalReadings(measurementPoints, OBSTACLE));
    setRevealedIds(new Set());
    hasStartedRef.current = false;
    savedRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.id]);

  const start = useCallback(() => {
    hasStartedRef.current = true;
    setRevealedIds(new Set(sortedWaypoints.map((wp) => wp.id)));
  }, [sortedWaypoints]);

  const isComplete = hasStartedRef.current;

  useEffect(() => {
    if (!isComplete || savedRef.current || readings.length === 0) return;
    savedRef.current = true;
    saveSurveyRecord({
      id: generateId(),
      planId: plan.id,
      waypoints: sortedWaypoints,
      readings,
      completedAt: Date.now(),
      height,
      probeType,
      frequencyStartMHz: Number(frequencyStartMHz) || 0,
      ...(frequencyEndMHz !== '' ? { frequencyEndMHz: Number(frequencyEndMHz) } : {}),
    }).catch((err) => console.error('Failed to save survey record', err));
  }, [isComplete, readings, plan.id, sortedWaypoints, height, probeType, frequencyStartMHz, frequencyEndMHz]);

  return {
    readings,
    revealedIds,
    start,
    isComplete,
    height,
    setHeight,
    probeType,
    setProbeType,
    frequencyStartMHz,
    setFrequencyStartMHz,
    frequencyEndMHz,
    setFrequencyEndMHz,
    configLocked: hasStartedRef.current,
  };
}
