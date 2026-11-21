// Twin Harbor — Spot the Difference: the game state.
//
// One object owns everything that changes while playing: which screen is up,
// which level, what has been found, how much time is left, the score and the
// transient feedback (a miss flash, a hint pulse, a just-found pop). The
// renderer reads this object every frame; input handlers mutate it through the
// small methods below, never by reaching into its fields.

import { LEVELS, TOTAL_DIFFERENCES } from './differences.js';
import {
  HINT_PULSE_MS,
  MARKER_POP_MS,
  MISS_FLASH_MS,
  MISS_PENALTY_SECONDS,
  POINTS_PER_FIND,
  POINTS_PER_SECOND_LEFT,
} from './config.js';

export const SCREENS = {
  MENU: 'menu',
  PLAYING: 'playing',
  LEVEL_DONE: 'level-done',
  TIME_UP: 'time-up',
  WIN: 'win',
};

export function newGameState() {
  return {
    screen: SCREENS.MENU,
    levelIndex: 0,
    // Ids of the differences found in the current level, in find order.
    found: [],
    // The difference id a hint is currently pulsing around, or null.
    hintTarget: null,
    hintEndsAt: 0,
    hintsLeft: LEVELS[0].hints,
    // Seconds left on the clock for the current level.
    secondsLeft: LEVELS[0].timeLimitSeconds,
    // The last frame time the clock was advanced, or null while paused.
    lastTickAt: null,
    score: 0,
    totalFound: 0,
    // A wrong click: {x, y, panel} in canvas space, plus when it fades.
    miss: null,
    // The most recently found difference, for its pop animation.
    justFound: null,
    justFoundAt: 0,
    // Best score kept for this browser session only.
    bestScore: 0,
    // A line of feedback under the pictures ("Nice! 3 of 6 found").
    message: '',
    messageUntil: 0,
  };
}

export function currentLevel(state) {
  return LEVELS[state.levelIndex];
}

export function levelComplete(state) {
  return state.found.length >= currentLevel(state).differences.length;
}

export function startLevel(state, index) {
  const level = LEVELS[index];
  state.levelIndex = index;
  state.found = [];
  state.hintTarget = null;
  state.hintsLeft = level.hints;
  state.secondsLeft = level.timeLimitSeconds;
  state.lastTickAt = performance.now();
  state.miss = null;
  state.justFound = null;
  state.screen = SCREENS.PLAYING;
  state.message = `Find ${level.differences.length} differences!`;
  state.messageUntil = performance.now() + 2500;
}

export function startGame(state) {
  state.score = 0;
  state.totalFound = 0;
  startLevel(state, 0);
}

export function advanceClock(state, now) {
  if (state.screen !== SCREENS.PLAYING || state.lastTickAt === null) return;
  const elapsed = (now - state.lastTickAt) / 1000;
  state.lastTickAt = now;
  state.secondsLeft -= elapsed;
  if (state.secondsLeft <= 0) {
    state.secondsLeft = 0;
    state.screen = SCREENS.TIME_UP;
  }
}

// Try the point (x, y) in panel space. Returns 'found', 'already' or 'miss'.
export function tryPoint(state, x, y) {
  const level = currentLevel(state);
  for (const diff of level.differences) {
    if (state.found.includes(diff.id)) continue;
    const dx = x - diff.x;
    const dy = y - diff.y;
    if (dx * dx + dy * dy <= diff.r * diff.r) {
      state.found.push(diff.id);
      state.justFound = diff.id;
      state.justFoundAt = performance.now();
      state.score += POINTS_PER_FIND;
      state.totalFound += 1;
      if (state.hintTarget === diff.id) state.hintTarget = null;
      if (levelComplete(state)) {
        const bonus = Math.round(state.secondsLeft) * POINTS_PER_SECOND_LEFT;
        state.score += bonus;
        state.screen = SCREENS.LEVEL_DONE;
      } else {
        state.message = `Found it — ${diff.label}! ${state.found.length} of ${level.differences.length}`;
        state.messageUntil = performance.now() + 2200;
      }
      return 'found';
    }
  }
  for (const diff of level.differences) {
    if (!state.found.includes(diff.id)) continue;
    const dx = x - diff.x;
    const dy = y - diff.y;
    if (dx * dx + dy * dy <= diff.r * diff.r) return 'already';
  }
  return 'miss';
}

export function registerMiss(state, canvasX, canvasY, panel) {
  state.miss = { x: canvasX, y: canvasY, panel, until: performance.now() + MISS_FLASH_MS };
  state.secondsLeft = Math.max(0, state.secondsLeft - MISS_PENALTY_SECONDS);
  state.message = `Not a difference — minus ${MISS_PENALTY_SECONDS} seconds!`;
  state.messageUntil = performance.now() + 1800;
  if (state.secondsLeft <= 0) state.screen = SCREENS.TIME_UP;
}

// Spend one hint: pick an unfound difference and pulse a ring around it.
export function useHint(state) {
  if (state.screen !== SCREENS.PLAYING || state.hintsLeft <= 0) return null;
  const level = currentLevel(state);
  const remaining = level.differences.filter((d) => !state.found.includes(d.id));
  if (remaining.length === 0) return null;
  const pick = remaining[Math.floor(Math.random() * remaining.length)];
  state.hintsLeft -= 1;
  state.hintTarget = pick.id;
  state.hintEndsAt = performance.now() + HINT_PULSE_MS;
  state.message = `Hint: look near — ${pick.label}`;
  state.messageUntil = state.hintEndsAt;
  return pick;
}

export function nextLevel(state) {
  if (state.levelIndex + 1 >= LEVELS.length) {
    state.screen = SCREENS.WIN;
    if (state.score > state.bestScore) state.bestScore = state.score;
    return;
  }
  startLevel(state, state.levelIndex + 1);
}

export function markerPopProgress(state, diffId, now) {
  if (state.justFound !== diffId) return 1;
  return Math.min(1, (now - state.justFoundAt) / MARKER_POP_MS);
}

export function totalDifferences() {
  return TOTAL_DIFFERENCES;
}
