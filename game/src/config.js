// Twin Harbor — Spot the Difference: shared constants for every module.
// All coordinates are in panel space: each picture is PANEL_W by PANEL_H pixels,
// drawn twice side by side (left = original, right = changed).

export const PANEL_W = 580;
export const PANEL_H = 620;
export const PANEL_GAP = 20;
export const PANEL_X_LEFT = 30;
export const PANEL_X_RIGHT = PANEL_X_LEFT + PANEL_W + PANEL_GAP;
export const PANEL_Y = 84;
export const CANVAS_W = 1280;
export const CANVAS_H = 800;

// How long a found-difference marker takes to pop in, in milliseconds.
export const MARKER_POP_MS = 260;
// How long a wrong-click red X stays on screen, in milliseconds.
export const MISS_FLASH_MS = 650;
// How long a hint ring pulses around an unfound difference, in milliseconds.
export const HINT_PULSE_MS = 2400;
// Seconds a wrong click costs on the clock.
export const MISS_PENALTY_SECONDS = 5;
// Points for one found difference, before the time bonus.
export const POINTS_PER_FIND = 100;
// Points per second left on the clock when a level is cleared.
export const POINTS_PER_SECOND_LEFT = 4;

// The colour of a found difference's ring on both panels.
export const MARKER_COLOR = '#22c55e';
// The colour of a wrong-click flash.
export const MISS_COLOR = '#ef4444';
// The colour of a hint pulse.
export const HINT_COLOR = '#f59e0b';
