export const FREE_SPACE_IMPEDANCE_OHM = 377;

export type ReadingUnit = 'V/m' | 'W/m2';

export function vPerMToWPerM2(eFieldVPerM: number): number {
  return (eFieldVPerM * eFieldVPerM) / FREE_SPACE_IMPEDANCE_OHM;
}

export function wPerM2ToVPerM(powerDensityWPerM2: number): number {
  return Math.sqrt(Math.max(powerDensityWPerM2, 0) * FREE_SPACE_IMPEDANCE_OHM);
}

export function convertFromVPerM(eFieldVPerM: number, unit: ReadingUnit): number {
  return unit === 'V/m' ? eFieldVPerM : vPerMToWPerM2(eFieldVPerM);
}

export function unitLabel(unit: ReadingUnit): string {
  return unit === 'V/m' ? 'V/m' : 'W/m²';
}
