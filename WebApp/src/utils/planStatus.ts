import type { PlanStatus } from '../types/domain';

const PLAN_STATUS_LABEL: Record<PlanStatus, string> = {
  draft: 'Editing',
  confirmed: 'Confirmed',
};

export function planStatusLabel(status: PlanStatus): string {
  return PLAN_STATUS_LABEL[status];
}
