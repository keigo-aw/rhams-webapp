export type Screen = 'path' | 'points' | 'survey' | 'history' | 'analysis' | 'export';

/** Total number of screens counted in the "Step N of TOTAL_STEPS" workflow — history and export/import are reference screens, not workflow steps. */
export const TOTAL_STEPS = 4;

export const SCREEN_META: Record<Screen, { step: number | null; title: string; blurb: string }> = {
  path: {
    step: 1,
    title: 'Robot waypoint review',
    blurb: 'Confirm the traverse the robot will follow around the device under test.',
  },
  points: {
    step: 2,
    title: 'Measurement points',
    blurb: 'Select which waypoints the probe stops at and records a reading.',
  },
  survey: {
    step: 3,
    title: 'Signal strength survey',
    blurb: 'Live capture along the confirmed path at the configured probe settings.',
  },
  analysis: {
    step: 4,
    title: 'Analysis',
    blurb: 'Compare recorded field strength against the applicable exposure limit.',
  },
  history: {
    step: null,
    title: 'Survey history',
    blurb: 'Previously completed runs stored on this workstation.',
  },
  export: {
    step: null,
    title: 'Export & import',
    blurb: 'Move plans and survey records between workstations.',
  },
};
