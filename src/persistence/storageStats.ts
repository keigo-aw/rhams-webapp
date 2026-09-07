import type { Plan, SurveyRecord } from '../types/domain';
import { getAll, getMeta, STORE_NAMES } from './db';

export interface StorageStats {
  waypointPlanBytes: number;
  surveyRecordBytes: number;
  quotaUsageBytes: number | null;
  quotaTotalBytes: number | null;
  lastWriteAt: number | null;
}

function byteSize(value: unknown): number {
  if (value === undefined) return 0;
  return new TextEncoder().encode(JSON.stringify(value)).length;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatLastWrite(timestamp: number | null): string {
  if (timestamp === null) return '—';
  return new Date(timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export async function getStorageStats(): Promise<StorageStats> {
  const [currentPlan, planHistory, surveyHistory] = await Promise.all([
    getMeta<Plan>('currentPlan'),
    getAll<Plan>(STORE_NAMES.planHistory),
    getAll<SurveyRecord>(STORE_NAMES.surveyHistory),
  ]);

  const waypointPlanBytes = byteSize(currentPlan) + byteSize(planHistory);
  const surveyRecordBytes = byteSize(surveyHistory);

  const timestamps: number[] = [];
  if (currentPlan) timestamps.push(currentPlan.createdAt, currentPlan.confirmedAt ?? 0);
  for (const plan of planHistory) timestamps.push(plan.createdAt, plan.confirmedAt ?? 0);
  for (const record of surveyHistory) timestamps.push(record.completedAt);
  const lastWriteAt = timestamps.length > 0 ? Math.max(...timestamps) : null;

  let quotaUsageBytes: number | null = null;
  let quotaTotalBytes: number | null = null;
  try {
    if (navigator.storage?.estimate) {
      const estimate = await navigator.storage.estimate();
      quotaUsageBytes = estimate.usage ?? null;
      quotaTotalBytes = estimate.quota ?? null;
    }
  } catch {
    // storage estimate not available in this browser — leave null, callers handle it
  }

  return { waypointPlanBytes, surveyRecordBytes, quotaUsageBytes, quotaTotalBytes, lastWriteAt };
}
