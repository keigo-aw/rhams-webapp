import type { Plan, SurveyRecord } from '../types/domain';
import { loadCurrentPlan, saveCurrentPlan } from '../persistence/storage';
import { loadPlanHistory, replacePlanHistory } from '../persistence/planHistory';
import { loadSurveyHistory, replaceSurveyHistory } from '../persistence/surveyHistory';
import { clearStore, STORE_NAMES } from '../persistence/db';

const EXPORT_SCHEMA_VERSION = 1;

export interface RhamsExport {
  schemaVersion: number;
  exportedAt: number;
  currentPlan: Plan | null;
  planHistory: Plan[];
  surveyHistory: SurveyRecord[];
}

export interface DataSummary {
  hasCurrentPlan: boolean;
  planHistoryCount: number;
  surveyHistoryCount: number;
}

export async function loadDataSummary(): Promise<DataSummary> {
  const [currentPlan, planHistory, surveyHistory] = await Promise.all([
    loadCurrentPlan(),
    loadPlanHistory(),
    loadSurveyHistory(),
  ]);
  return {
    hasCurrentPlan: currentPlan !== null,
    planHistoryCount: planHistory.length,
    surveyHistoryCount: surveyHistory.length,
  };
}

export async function buildExport(): Promise<RhamsExport> {
  const [currentPlan, planHistory, surveyHistory] = await Promise.all([
    loadCurrentPlan(),
    loadPlanHistory(),
    loadSurveyHistory(),
  ]);
  return { schemaVersion: EXPORT_SCHEMA_VERSION, exportedAt: Date.now(), currentPlan, planHistory, surveyHistory };
}

export function downloadExport(data: RhamsExport): string {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStamp = new Date(data.exportedAt).toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const filename = `rhams-backup-${dateStamp}.json`;
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return filename;
}

export function parseExportFile(text: string): RhamsExport {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  if (
    !parsed ||
    typeof parsed !== 'object' ||
    (parsed as RhamsExport).schemaVersion !== EXPORT_SCHEMA_VERSION ||
    !Array.isArray((parsed as RhamsExport).planHistory) ||
    !Array.isArray((parsed as RhamsExport).surveyHistory)
  ) {
    throw new Error('Unrecognized RHAMS backup file format.');
  }
  return parsed as RhamsExport;
}

export async function applyImport(data: RhamsExport): Promise<void> {
  await Promise.all([
    data.currentPlan ? saveCurrentPlan(data.currentPlan) : Promise.resolve(),
    replacePlanHistory(data.planHistory),
    replaceSurveyHistory(data.surveyHistory),
  ]);
}

export async function resetWorkspace(): Promise<void> {
  await Promise.all([
    clearStore(STORE_NAMES.meta),
    clearStore(STORE_NAMES.planHistory),
    clearStore(STORE_NAMES.surveyHistory),
  ]);
}
