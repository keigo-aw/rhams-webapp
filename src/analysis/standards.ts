export type HazardCategory = 'HERP' | 'HERO' | 'HERF';

export interface StandardOption {
  id: string;
  label: string;
  /** Nominal fallback limit (V/m), used only when the standard has no frequency-dependent
   * function in standardLimits.ts. The real limit is computed per-frequency there. */
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
      { id: 'ieee-c95.1-2019-restricted', label: 'IEEE C95.1-2019 (Restricted)', thresholdVPerM: 61.4 },
      { id: 'ieee-c95.1-2019-unrestricted', label: 'IEEE C95.1-2019 (Unrestricted)', thresholdVPerM: 27.5 },
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
    standards: [
      // NAVSEA OP 3565 gives two fixed field thresholds split at 225 MHz (power densities
      // converted to E via E = sqrt(S·377)): 0.09 W/m² → 5.82 V/m below, 5 W/cm² → 4342 V/m above.
      { id: 'navsea-op-3565-sub225', label: 'NAVSEA OP 3565 (<225 MHz)', thresholdVPerM: 5.82 },
      { id: 'navsea-op-3565-main', label: 'NAVSEA OP 3565 (≥225 MHz)', thresholdVPerM: 4342 },
      // BS 6656:2002 is frequency/Pmax dependent: E = sqrt(Pmax·(f²+3030)/124), f in MHz, Pmax in W.
      { id: 'bs-6656-2002', label: 'BS 6656:2002', thresholdVPerM: 5 },
    ],
  },
];

export function standardsForCategory(category: HazardCategory | null): StandardOption[] {
  return HAZARD_CATEGORIES.find((c) => c.value === category)?.standards ?? [];
}

export function findStandard(category: HazardCategory | null, standardId: string | null): StandardOption | null {
  if (!standardId) return null;
  return standardsForCategory(category).find((s) => s.id === standardId) ?? null;
}
