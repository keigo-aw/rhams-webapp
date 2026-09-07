import type { Plan } from '../types/domain';
import { getMeta, setMeta } from './db';

const CURRENT_PLAN_KEY = 'currentPlan';

export async function saveCurrentPlan(plan: Plan): Promise<void> {
  await setMeta(CURRENT_PLAN_KEY, plan);
}

export async function loadCurrentPlan(): Promise<Plan | null> {
  const plan = await getMeta<Plan>(CURRENT_PLAN_KEY);
  return plan ?? null;
}
