// Twin Harbor — Spot the Difference: where every clickable thing lives.
//
// The whole interface is drawn on one canvas, so buttons are rectangles in
// canvas space, shared here between the renderer (which draws them) and the
// input handler (which tests clicks against them). Overlay buttons sit on the
// menu / level-done / time-up / win screens.

import { CANVAS_W, PANEL_H, PANEL_W, PANEL_X_LEFT, PANEL_X_RIGHT, PANEL_Y } from './config.js';

export const HEADER_H = 64;
export const FOOTER_Y = 724;
export const FOOTER_H = 56;

// The two picture frames, in canvas space.
export const LEFT_FRAME = { x: PANEL_X_LEFT, y: PANEL_Y, w: PANEL_W, h: PANEL_H };
export const RIGHT_FRAME = { x: PANEL_X_RIGHT, y: PANEL_Y, w: PANEL_W, h: PANEL_H };

// Bottom-bar buttons.
export const HINT_BUTTON = { x: 30, y: FOOTER_Y, w: 180, h: 48 };
export const RESTART_BUTTON = { x: 230, y: FOOTER_Y, w: 180, h: 48 };

// Header buttons.
export const SOUND_BUTTON = { x: CANVAS_W - 100, y: 12, w: 70, h: 40 };
export const MENU_BUTTON = { x: CANVAS_W - 190, y: 12, w: 80, h: 40 };

// Overlay buttons, centred on the canvas.
function centredButton(y, w, h) {
  return { x: (CANVAS_W - w) / 2, y, w, h };
}
export const START_BUTTON = centredButton(620, 240, 60);
export const NEXT_LEVEL_BUTTON = centredButton(520, 260, 60);
export const RETRY_BUTTON = centredButton(520, 240, 60);
export const PLAY_AGAIN_BUTTON = centredButton(540, 260, 60);
export const MENU_FROM_WIN_BUTTON = centredButton(620, 240, 52);

export function pointInRect(px, py, rect) {
  return px >= rect.x && px <= rect.x + rect.w && py >= rect.y && py <= rect.y + rect.h;
}

// Which panel a canvas point falls in, with its panel-space coordinates.
export function panelAt(canvasX, canvasY) {
  if (pointInRect(canvasX, canvasY, LEFT_FRAME)) {
    return { side: 'left', x: canvasX - LEFT_FRAME.x, y: canvasY - LEFT_FRAME.y };
  }
  if (pointInRect(canvasX, canvasY, RIGHT_FRAME)) {
    return { side: 'right', x: canvasX - RIGHT_FRAME.x, y: canvasY - RIGHT_FRAME.y };
  }
  return null;
}

// Format seconds as M:SS for the timer.
export function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}
