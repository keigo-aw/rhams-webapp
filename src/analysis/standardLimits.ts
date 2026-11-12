import { FREE_SPACE_IMPEDANCE_OHM } from '../utils/units';

/** Frequency used when a survey record carries no frequency. */
export const DEFAULT_FREQUENCY_MHZ = 900;

/** Default max threshold power (watts) for the BS 6656:2002 formula. */
export const DEFAULT_PMAX_W = 10;

/** Plane-wave equivalent E-field from a power density S (W/m²): E = sqrt(S · 377). */
function eFromS(sWPerM2: number): number {
  return Math.sqrt(FREE_SPACE_IMPEDANCE_OHM * sWPerM2);
}

/** Picks the value whose band upper-bound first covers f; clamps to the last band above the table. */
function bandLookup(f: number, bands: [upperMHz: number, value: number][]): number {
  for (const [upper, value] of bands) {
    if (f <= upper) return value;
  }
  return bands[bands.length - 1][1];
}

/** log–log interpolation of S at frequency f between two (freq, S) control points. */
function logInterpS(f: number, f1: number, s1: number, f2: number, s2: number): number {
  const t = (Math.log10(f) - Math.log10(f1)) / (Math.log10(f2) - Math.log10(f1));
  return Math.pow(10, Math.log10(s1) + t * (Math.log10(s2) - Math.log10(s1)));
}

// ── Per-standard E-field limit (V/m) as a function of frequency (MHz) ──────────
// Encoded from the RADHAZ reference slides. Where a band is defined by power
// density the field is the plane-wave equivalent, E = sqrt(S·377).

// IEEE C95.1-2019 occupational (restricted) ERLs.
function ieeeRestricted(f: number): number {
  if (f < 1) return 1842;
  if (f < 30) return 1842 / f;
  if (f < 400) return 61.4;
  if (f < 2000) return eFromS(f / 40);
  return eFromS(50);
}

// IEEE C95.1-2019 general-public (unrestricted) ERLs.
function ieeeUnrestricted(f: number): number {
  if (f < 1.34) return 614;
  if (f < 30) return 823.8 / f;
  if (f < 400) return 27.5;
  if (f < 2000) return eFromS(f / 200);
  return eFromS(10);
}

// ICNIRP 2020 general-public reference levels (Table 5).
function icnirp2020(f: number): number {
  if (f <= 30) return 300 / Math.pow(f, 0.7);
  if (f <= 400) return 27.7;
  if (f <= 2000) return 1.375 * Math.sqrt(f);
  return eFromS(10);
}

// SAFE HERO curve (safe power density vs frequency) — digitized from the graph, so approximate.
function safeHeroCurve(f: number): number {
  let s: number;
  if (f <= 40) s = 0.01;
  else if (f <= 100) s = logInterpS(f, 40, 0.01, 100, 0.0035);
  else if (f <= 200) s = 0.0035;
  else if (f <= 40000) s = logInterpS(f, 200, 0.0035, 40000, 100);
  else s = 100;
  return eFromS(s);
}

// MIL-STD-464C — Restricted / Average field-intensity column (the most conservative), by band.
function milStd464c(f: number): number {
  return bandLookup(f, [
    [2, 80],
    [30, 100],
    [150, 80],
    [225, 70],
    [400, 100],
    [700, 100],
    [790, 270],
    [1000, 270],
    [2000, 160],
    [2700, 160],
    [3600, 220],
    [4000, 200],
    [5400, 200],
    [5900, 240],
    [6000, 240],
    [7900, 240],
    [8000, 200],
    [8400, 200],
    [8500, 200],
    [11000, 300],
    [14000, 220],
    [18000, 250],
    [50000, 200],
  ]);
}

// BS 6656:2002 effective field strength (≥ 30 MHz): E = sqrt(Pmax·(f²+3030)/124), f in MHz, Pmax in W.
function bs6656(f: number, pmaxW: number): number {
  return Math.sqrt((pmaxW * (f * f + 3030)) / 124);
}

/**
 * E-field limit (V/m) for a standard at a frequency (and Pmax, for BS 6656). Returns null for a
 * standard whose limit isn't a field-vs-frequency function, so the caller can fall back to a
 * nominal value — currently only NAVSEA OP 3563 (fuel-area power-density/separation rules).
 */
export function standardLimitVPerM(standardId: string, freqMHz: number, pmaxW: number = DEFAULT_PMAX_W): number | null {
  switch (standardId) {
    case 'ieee-c95.1-2019-restricted':
      return ieeeRestricted(freqMHz);
    case 'ieee-c95.1-2019-unrestricted':
      return ieeeUnrestricted(freqMHz);
    case 'icnirp-2020':
      return icnirp2020(freqMHz);
    case 'safe-hero-curve':
      return safeHeroCurve(freqMHz);
    case 'mil-std-464c':
      return milStd464c(freqMHz);
    case 'bs-6656-2002':
      return bs6656(freqMHz, pmaxW);
    default:
      return null;
  }
}

/** Whether a standard uses the Pmax input (only BS 6656:2002 does). */
export function usesPmax(standardId: string): boolean {
  return standardId === 'bs-6656-2002';
}
