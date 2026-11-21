// Every tuning number and colour in one place. The playfield is a fixed 1280x720 logical
// area; the renderer scales it to the window, so no rule below depends on the screen size.

export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

/** The two picture panels, in logical coordinates. */
export const PANEL = {
  width: 560,
  height: 460,
  top: 84,
  leftX: 48,
  rightX: 672,
  gap: 64,
};

/** The top bar and the footer strip, in logical coordinates. */
export const HUD = { height: 64 };
export const FOOTER = { top: 564, height: 136 };

/** How many differences each level hides, and how long the player gets, per level. */
export const LEVELS = [
  { name: 'Harbor at Dawn', seconds: 90, scene: 'harbor' },
  { name: 'Forest Camp', seconds: 75, scene: 'forest' },
  { name: 'Night Market', seconds: 60, scene: 'market' },
];

export const DIFFERENCES_PER_LEVEL = 7;
export const HINTS_PER_LEVEL = 3;
export const HINT_SECONDS = 2;

/** Points: a find, the combo step, a miss, and the per-second time bonus on a clear. */
export const SCORE = {
  find: 100,
  comboStep: 10,
  miss: -10,
  timeBonusPerSecond: 10,
};

/** How long a found ring's sparkle plays, and how long a wrong click shakes the frame. */
export const FX = {
  sparkleSeconds: 0.7,
  shakeSeconds: 0.18,
  missRingSeconds: 0.5,
};

/** The radius, in panel pixels, inside which a click counts as hitting a difference. */
export const HIT_SLACK = 8;

export const PALETTE = {
  backdrop: '#14161d',
  hud: '#1d212c',
  hudLine: '#2e3442',
  panelFrame: '#3a4152',
  panelShadow: '#0a0b0f',
  text: '#f2f4f8',
  muted: '#9aa2b1',
  gold: '#f2c94c',
  goldDark: '#c79a1d',
  green: '#58c98a',
  red: '#e5534b',
  accent: '#4fc3f7',
  chip: '#252b38',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'double-take.best';
