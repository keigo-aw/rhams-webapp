import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Plan, ProbeType, SignalReading, SurveyHeight } from '../types/domain';
import { OBSTACLE } from '../canvas/coordinates';
import { generateSignalReadings } from '../data/mockSignalGenerator';
import { useAnimationController } from '../state/useAnimationController';
import { saveSurveyRecord } from '../persistence/surveyHistory';
import { generateId } from '../utils/id';
import { DEFAULT_HEIGHT, DEFAULT_PROBE_TYPE } from './surveyConfig';

/** Video-paced playback: a slow glide between points with a long stop to read each one. */
const SURVEY_TRAVEL_SPEED_M_PER_S = 2;
const SURVEY_DWELL_SECONDS = 10;

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
  const { animationState, play, reset } = useAnimationController();

  useEffect(() => {
    const measurementPoints = sortedWaypoints.filter((wp) => wp.isMeasurementPoint);
    setReadings(generateSignalReadings(measurementPoints, OBSTACLE));
    setRevealedIds(new Set());
    hasStartedRef.current = false;
    savedRef.current = false;
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.id]);

  useEffect(() => {
    if (!hasStartedRef.current) return;
    const upTo = animationState.isPlaying ? animationState.segmentIndex : sortedWaypoints.length - 1;
    setRevealedIds((prev) => {
      const next = new Set(prev);
      for (let i = 0; i <= upTo && i < sortedWaypoints.length; i++) {
        next.add(sortedWaypoints[i].id);
      }
      return next;
    });
  }, [animationState.segmentIndex, animationState.isPlaying, sortedWaypoints]);

  const start = useCallback(() => {
    hasStartedRef.current = true;
    setRevealedIds(new Set(sortedWaypoints.length > 0 ? [sortedWaypoints[0].id] : []));
    play(sortedWaypoints, { speedUnitsPerSecond: SURVEY_TRAVEL_SPEED_M_PER_S, dwellSeconds: SURVEY_DWELL_SECONDS });
  }, [play, sortedWaypoints]);

  const isComplete = hasStartedRef.current && !animationState.isPlaying && revealedIds.size === sortedWaypoints.length;

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
    animationState,
    start,
    isPlaying: animationState.isPlaying,
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
