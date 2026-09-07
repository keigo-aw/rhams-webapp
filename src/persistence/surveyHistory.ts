import type { SurveyRecord } from '../types/domain';
import { clearStore, deleteRecord, getAll, putRecord, replaceAll, STORE_NAMES } from './db';

const MAX_HISTORY = 30;

export async function loadSurveyHistory(): Promise<SurveyRecord[]> {
  const all = await getAll<SurveyRecord>(STORE_NAMES.surveyHistory);
  return all.sort((a, b) => b.completedAt - a.completedAt);
}

export async function saveSurveyRecord(record: SurveyRecord): Promise<void> {
  await putRecord(STORE_NAMES.surveyHistory, record);
  const all = await loadSurveyHistory();
  for (const overflow of all.slice(MAX_HISTORY)) {
    await deleteRecord(STORE_NAMES.surveyHistory, overflow.id);
  }
}

export async function clearSurveyHistory(): Promise<void> {
  await clearStore(STORE_NAMES.surveyHistory);
}

export async function replaceSurveyHistory(records: SurveyRecord[]): Promise<void> {
  await replaceAll(STORE_NAMES.surveyHistory, records);
}
