// Twin Harbor — Spot the Difference: bootstrap and game loop.
//
// Wires the canvas, the state, the input and the renderer together and runs
// the animation frame loop. The loop advances the clock, then paints one
// frame. A tiny debug handle (window.__twinHarbor) exposes the live state so
// the maker's play-test can click a difference and read back what happened.
//
// Screenshot presets (?shot=...): the maker takes the entry's screenshots by
// loading the page with a query string, so each shot shows a real frame of
// the game in a chosen state — no editing, no compositing:
//   ?shot=start   the menu
//   ?shot=play    level 1 mid-game, two differences already found
//   ?shot=level2  level 2 mid-game, one difference found, a hint pulsing
//   ?shot=end     level 1 cleared, the level-complete card up

import { CANVAS_H, CANVAS_W } from './config.js';
import { attachInput } from './input.js';
import { renderFrame } from './render.js';
import { SCREENS, currentLevel, startGame, startLevel, useHint } from './state.js';
import { newGameState } from './state.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const state = newGameState();
const input = attachInput(canvas, state);

// The debug handle the play-test reads: found count, screen, timer, score.
window.__twinHarbor = { state, input };

function applyShotPreset() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) return;
  if (shot === 'start') {
    state.screen = SCREENS.MENU;
    return;
  }
  if (shot === 'play' || shot === 'end' || shot === 'level2') {
    const levelIndex = shot === 'level2' ? 1 : 0;
    startGame(state);
    if (levelIndex === 1) startLevel(state, 1);
    const level = currentLevel(state);
    if (shot === 'play') {
      // Two found, four still hiding: the cover shot.
      state.found = level.differences.slice(0, 2).map((d) => d.id);
      state.score = 200;
      state.secondsLeft = 118;
    } else if (shot === 'level2') {
      state.found = level.differences.slice(0, 1).map((d) => d.id);
      state.score = 100;
      state.secondsLeft = 121;
      useHint(state);
    } else {
      // Every difference found: the level-complete card.
      state.found = level.differences.map((d) => d.id);
      state.score = 600;
      state.secondsLeft = 96;
      state.screen = SCREENS.LEVEL_DONE;
    }
    // Freeze the clock for screenshots so the timer never runs out mid-shot.
    state.lastTickAt = null;
  }
}

applyShotPreset();

// The clock only ticks while playing; overlays and the menu freeze it.
function frame(now) {
  if (state.screen === SCREENS.PLAYING && state.lastTickAt !== null) {
    const elapsed = (now - state.lastTickAt) / 1000;
    state.lastTickAt = now;
    state.secondsLeft -= elapsed;
    if (state.secondsLeft <= 0) {
      state.secondsLeft = 0;
      state.screen = SCREENS.TIME_UP;
    }
  }
  renderFrame(ctx, state, input.cursor, now);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

// Keep the canvas crisp on high-DPI screens without changing its layout size.
function fitCanvas() {
  const scale = Math.min(window.innerWidth / CANVAS_W, window.innerHeight / CANVAS_H, 1);
  canvas.style.width = `${Math.floor(CANVAS_W * scale)}px`;
  canvas.style.height = `${Math.floor(CANVAS_H * scale)}px`;
}
window.addEventListener('resize', fitCanvas);
fitCanvas();
