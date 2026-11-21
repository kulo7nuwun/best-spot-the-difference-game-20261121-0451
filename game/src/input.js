// Twin Harbor — Spot the Difference: mouse and keyboard input.
//
// Clicking (or pressing Enter over) either picture tests that spot against the
// level's differences; the state module decides found / already / miss. The
// arrow keys drive a crosshair so the game is fully playable without a mouse:
// Tab switches pictures, Enter or Space clicks, H spends a hint, M mutes,
// Esc goes back to the menu. Buttons are the rectangles ui.js lays out.

import { PANEL_H, PANEL_W } from './config.js';
import {
  HINT_BUTTON,
  MENU_BUTTON,
  MENU_FROM_WIN_BUTTON,
  NEXT_LEVEL_BUTTON,
  PLAY_AGAIN_BUTTON,
  RETRY_BUTTON,
  SOUND_BUTTON,
  START_BUTTON,
  RESTART_BUTTON,
  panelAt,
  pointInRect,
} from './ui.js';
import {
  SCREENS,
  currentLevel,
  nextLevel,
  registerMiss,
  startGame,
  startLevel,
  tryPoint,
  useHint,
} from './state.js';
import {
  playClickSound,
  playFoundSound,
  playHintSound,
  playLevelClearSound,
  playMissSound,
  toggleMuted,
} from './audio.js';

const CURSOR_STEP = 10;
const CURSOR_STEP_FAST = 32;

export function attachInput(canvas, state) {
  // The keyboard crosshair: which picture it is on, and where in panel space.
  const cursor = { side: 'left', x: PANEL_W / 2, y: PANEL_H / 2, visible: false };

  function clickAt(canvasX, canvasY) {
    // Header buttons work on every screen.
    if (pointInRect(canvasX, canvasY, SOUND_BUTTON)) {
      toggleMuted();
      playClickSound();
      return;
    }
    if (pointInRect(canvasX, canvasY, MENU_BUTTON)) {
      state.screen = SCREENS.MENU;
      state.lastTickAt = null;
      playClickSound();
      return;
    }

    if (state.screen === SCREENS.MENU) {
      if (pointInRect(canvasX, canvasY, START_BUTTON)) {
        playClickSound();
        startGame(state);
      }
      return;
    }
    if (state.screen === SCREENS.LEVEL_DONE) {
      if (pointInRect(canvasX, canvasY, NEXT_LEVEL_BUTTON)) {
        playClickSound();
        nextLevel(state);
      }
      return;
    }
    if (state.screen === SCREENS.TIME_UP) {
      if (pointInRect(canvasX, canvasY, RETRY_BUTTON)) {
        playClickSound();
        startLevel(state, state.levelIndex);
      }
      return;
    }
    if (state.screen === SCREENS.WIN) {
      if (pointInRect(canvasX, canvasY, PLAY_AGAIN_BUTTON)) {
        playClickSound();
        startGame(state);
      } else if (pointInRect(canvasX, canvasY, MENU_FROM_WIN_BUTTON)) {
        playClickSound();
        state.screen = SCREENS.MENU;
      }
      return;
    }

    // Playing: the bottom-bar buttons first.
    if (pointInRect(canvasX, canvasY, HINT_BUTTON)) {
      const picked = useHint(state);
      if (picked) playHintSound();
      return;
    }
    if (pointInRect(canvasX, canvasY, RESTART_BUTTON)) {
      playClickSound();
      startLevel(state, state.levelIndex);
      return;
    }

    const hit = panelAt(canvasX, canvasY);
    if (!hit) return;
    const result = tryPoint(state, hit.x, hit.y);
    if (result === 'found') {
      if (state.screen === SCREENS.LEVEL_DONE) playLevelClearSound();
      else playFoundSound();
    } else if (result === 'miss') {
      registerMiss(state, canvasX, canvasY, hit.side);
      playMissSound();
    }
  }

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  function onMouseDown(event) {
    const { x, y } = canvasPoint(event);
    cursor.visible = false;
    clickAt(x, y);
  }

  function onMouseMove(event) {
    const { x, y } = canvasPoint(event);
    const hit = panelAt(x, y);
    if (hit) {
      cursor.side = hit.side;
      cursor.x = hit.x;
      cursor.y = hit.y;
      cursor.visible = true;
    } else {
      cursor.visible = false;
    }
  }

  function onKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault();
      cursor.side = cursor.side === 'left' ? 'right' : 'left';
      cursor.visible = true;
      return;
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      const step = event.shiftKey ? CURSOR_STEP_FAST : CURSOR_STEP;
      if (event.key === 'ArrowLeft') cursor.x = Math.max(0, cursor.x - step);
      if (event.key === 'ArrowRight') cursor.x = Math.min(PANEL_W, cursor.x + step);
      if (event.key === 'ArrowUp') cursor.y = Math.max(0, cursor.y - step);
      if (event.key === 'ArrowDown') cursor.y = Math.min(PANEL_H, cursor.y + step);
      cursor.visible = true;
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (state.screen === SCREENS.MENU) {
        playClickSound();
        startGame(state);
        return;
      }
      if (state.screen === SCREENS.LEVEL_DONE) {
        playClickSound();
        nextLevel(state);
        return;
      }
      if (state.screen === SCREENS.TIME_UP) {
        playClickSound();
        startLevel(state, state.levelIndex);
        return;
      }
      if (state.screen === SCREENS.WIN) {
        playClickSound();
        startGame(state);
        return;
      }
      if (state.screen !== SCREENS.PLAYING) return;
      cursor.visible = true;
      const result = tryPoint(state, cursor.x, cursor.y);
      if (result === 'found') {
        if (state.screen === SCREENS.LEVEL_DONE) playLevelClearSound();
        else playFoundSound();
      } else if (result === 'miss') {
        const frameX = cursor.side === 'left' ? 30 : 30 + PANEL_W + 20;
        registerMiss(state, frameX + cursor.x, 84 + cursor.y, cursor.side);
        playMissSound();
      }
      return;
    }
    if (event.key === 'h' || event.key === 'H') {
      const picked = useHint(state);
      if (picked) playHintSound();
      return;
    }
    if (event.key === 'm' || event.key === 'M') {
      toggleMuted();
      return;
    }
    if (event.key === 'Escape') {
      state.screen = SCREENS.MENU;
      state.lastTickAt = null;
    }
  }

  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mousemove', onMouseMove);
  window.addEventListener('keydown', onKeyDown);

  return {
    cursor,
    destroy() {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('keydown', onKeyDown);
    },
  };
}

// Test helper used by the CDP play-test: click a panel-space point programmatically.
export function clickPanelPoint(state, side, x, y) {
  const result = tryPoint(state, x, y);
  if (result === 'miss') {
    const frameX = side === 'left' ? 30 : 30 + PANEL_W + 20;
    registerMiss(state, frameX + x, 84 + y, side);
  }
  return result;
}

export { currentLevel };
