import type { Plan } from '../types/domain';
import { deleteRecord, getAll, putRecord, replaceAll, STORE_NAMES } from './db';

const MAX_HISTORY = 20;

export async function loadPlanHistory(): Promise<Plan[]> {
  const all = await getAll<Plan>(STORE_NAMES.planHistory);
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export async function savePlanToHistory(plan: Plan): Promise<void> {
  await putRecord(STORE_NAMES.planHistory, plan);
  const all = await loadPlanHistory();
  for (const overflow of all.slice(MAX_HISTORY)) {
    await deleteRecord(STORE_NAMES.planHistory, overflow.id);
  }
}

export async function replacePlanHistory(plans: Plan[]): Promise<void> {
  await replaceAll(STORE_NAMES.planHistory, plans);
}
