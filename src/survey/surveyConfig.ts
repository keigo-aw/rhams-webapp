import type { ProbeType, SurveyHeight } from '../types/domain';

export const HEIGHT_OPTIONS: { value: SurveyHeight; label: string }[] = [
  { value: 1.8, label: '1.8 m' },
  { value: 0.5, label: '0.5 m' },
];

export const PROBE_TYPE_OPTIONS: { value: ProbeType; label: string; rangeLabel: string }[] = [
  { value: 'Probe B', label: 'Probe B', rangeLabel: '300 MHz – 30 GHz' },
  { value: 'Probe A', label: 'Probe A', rangeLabel: '30 MHz – 300 MHz' },
];

export const DEFAULT_HEIGHT: SurveyHeight = 1.8;
export const DEFAULT_PROBE_TYPE: ProbeType = 'Probe B';

export function probeTypeRangeLabel(probeType: ProbeType): string {
  return PROBE_TYPE_OPTIONS.find((option) => option.value === probeType)?.rangeLabel ?? '';
}
