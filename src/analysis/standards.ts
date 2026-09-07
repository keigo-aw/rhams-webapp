export type HazardCategory = 'HERP' | 'HERO' | 'HERF';

export interface StandardOption {
  id: string;
  label: string;
  /** Representative placeholder limit — confirm against the governing document before relying on it. */
  thresholdVPerM: number;
}

export interface HazardCategoryOption {
  value: HazardCategory;
  label: string;
  standards: StandardOption[];
}

export const HAZARD_CATEGORIES: HazardCategoryOption[] = [
  {
    value: 'HERP',
    label: 'HERP (Personnel)',
    standards: [
      { id: 'ieee-c95.1-2019', label: 'IEEE C95.1-2019', thresholdVPerM: 27.5 },
      { id: 'icnirp-2020', label: 'ICNIRP 2020', thresholdVPerM: 28 },
    ],
  },
  {
    value: 'HERO',
    label: 'HERO (Ordnance)',
    standards: [
      { id: 'safe-hero-curve', label: 'SAFE HERO Curve', thresholdVPerM: 5 },
      { id: 'mil-std-464c', label: 'MIL-STD-464C', thresholdVPerM: 10 },
    ],
  },
  {
    value: 'HERF',
    label: 'HERF (Fuel)',
    standards: [{ id: 'navsea-op-3563', label: 'NAVSEA OP 3563', thresholdVPerM: 5 }],
  },
];

export function standardsForCategory(category: HazardCategory | null): StandardOption[] {
  return HAZARD_CATEGORIES.find((c) => c.value === category)?.standards ?? [];
}

export function findStandard(category: HazardCategory | null, standardId: string | null): StandardOption | null {
  if (!standardId) return null;
  return standardsForCategory(category).find((s) => s.id === standardId) ?? null;
}
