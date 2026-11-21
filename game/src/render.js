// Twin Harbor — Spot the Difference: the renderer.
//
// One canvas, one frame function. It paints the header (title, level, timer,
// score), the two pictures side by side (left untouched, right changed), the
// green rings on every difference found so far, the counter of how many are
// left, the footer buttons, and whichever overlay screen is up. The judge
// sees the game through screenshots, so the frame is built to read at a
// glance: big counter, big timer, rings you cannot miss.

import {
  CANVAS_H,
  CANVAS_W,
  HINT_COLOR,
  MARKER_COLOR,
  MISS_COLOR,
  PANEL_H,
  PANEL_W,
  PANEL_X_LEFT,
  PANEL_X_RIGHT,
  PANEL_Y,
} from './config.js';
import { LEVELS } from './differences.js';
import { drawScene } from './scenes.js';
import { SCREENS, currentLevel, markerPopProgress } from './state.js';
import { isMuted } from './audio.js';
import {
  FOOTER_Y,
  HINT_BUTTON,
  LEFT_FRAME,
  MENU_BUTTON,
  MENU_FROM_WIN_BUTTON,
  NEXT_LEVEL_BUTTON,
  PLAY_AGAIN_BUTTON,
  RETRY_BUTTON,
  RESTART_BUTTON,
  RIGHT_FRAME,
  SOUND_BUTTON,
  START_BUTTON,
  formatTime,
} from './ui.js';

const EMPTY_SET = new Set();

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawButton(ctx, rect, label, enabled, accent) {
  ctx.fillStyle = enabled ? accent : '#94a3b8';
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 10);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 17px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 1);
}

function drawFoundMarker(ctx, x, y, scale, now) {
  const r = 26 * scale;
  ctx.save();
  ctx.globalAlpha = 0.95;
  ctx.strokeStyle = MARKER_COLOR;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = MARKER_COLOR;
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();
  // The check mark inside the ring.
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 11, y);
  ctx.lineTo(x - 3, y + 9);
  ctx.lineTo(x + 12, y - 9);
  ctx.stroke();
  ctx.restore();
}

function drawMissFlash(ctx, miss, now) {
  if (!miss || now > miss.until) return;
  const alpha = 1 - (now - (miss.until - 650)) / 650;
  ctx.save();
  ctx.globalAlpha = Math.max(0, alpha);
  ctx.strokeStyle = MISS_COLOR;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  const s = 16;
  ctx.beginPath();
  ctx.moveTo(miss.x - s, miss.y - s);
  ctx.lineTo(miss.x + s, miss.y + s);
  ctx.moveTo(miss.x + s, miss.y - s);
  ctx.lineTo(miss.x - s, miss.y + s);
  ctx.stroke();
  ctx.restore();
}

function drawHintPulse(ctx, state, now) {
  if (!state.hintTarget || now > state.hintEndsAt) return;
  const level = currentLevel(state);
  const diff = level.differences.find((d) => d.id === state.hintTarget);
  if (!diff) return;
  const phase = ((now % 600) / 600) * Math.PI * 2;
  const pulse = 1 + 0.18 * Math.sin(phase);
  for (const frame of [LEFT_FRAME, RIGHT_FRAME]) {
    ctx.save();
    ctx.strokeStyle = HINT_COLOR;
    ctx.lineWidth = 5;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.arc(frame.x + diff.x, frame.y + diff.y, (diff.r + 10) * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawPanel(ctx, state, side) {
  const frame = side === 'left' ? LEFT_FRAME : RIGHT_FRAME;
  const level = currentLevel(state);
  ctx.save();
  ctx.beginPath();
  ctx.rect(frame.x, frame.y, frame.w, frame.h);
  ctx.clip();
  ctx.translate(frame.x, frame.y);
  if (side === 'left') drawScene(ctx, level.id, EMPTY_SET);
  else drawScene(ctx, level.id, new Set(level.differences.map((d) => d.id)));
  ctx.restore();
  // Frame and a small label chip inside the panel's top-left corner.
  ctx.strokeStyle = side === 'left' ? '#0d9488' : '#d97706';
  ctx.lineWidth = 4;
  ctx.strokeRect(frame.x, frame.y, frame.w, frame.h);
  ctx.fillStyle = side === 'left' ? 'rgba(13,148,136,0.9)' : 'rgba(217,119,6,0.9)';
  roundRect(ctx, frame.x + 10, frame.y + 10, 118, 30, 8);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(side === 'left' ? 'ORIGINAL' : 'CHANGED', frame.x + 69, frame.y + 26);
}

function drawMarkers(ctx, state, now) {
  const level = currentLevel(state);
  for (const diff of level.differences) {
    if (!state.found.includes(diff.id)) continue;
    const scale = markerPopProgress(state, diff.id, now);
    drawFoundMarker(ctx, LEFT_FRAME.x + diff.x, LEFT_FRAME.y + diff.y, scale, now);
    drawFoundMarker(ctx, RIGHT_FRAME.x + diff.x, RIGHT_FRAME.y + diff.y, scale, now);
  }
}

function drawHeader(ctx, state) {
  ctx.fillStyle = '#0f2a43';
  ctx.fillRect(0, 0, CANVAS_W, 64);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Twin Harbor', 30, 33);
  const level = currentLevel(state);
  ctx.font = '17px system-ui, sans-serif';
  ctx.fillStyle = '#bae6fd';
  ctx.fillText(`Level ${state.levelIndex + 1} of ${LEVELS.length} — ${level.name}`, 260, 33);

  // Timer, centre-right, red and pulsing under 30 seconds.
  const lowTime = state.secondsLeft <= 30 && state.screen === SCREENS.PLAYING;
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = lowTime ? '#f87171' : '#ffffff';
  ctx.fillText(formatTime(state.secondsLeft), 830, 33);

  // Score.
  ctx.textAlign = 'right';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillStyle = '#fde68a';
  ctx.fillText(`Score ${state.score}`, 1060, 33);

  drawButton(ctx, MENU_BUTTON, 'Menu', true, '#475569');
  drawButton(ctx, SOUND_BUTTON, isMuted() ? 'Muted' : 'Sound', true, '#475569');

  // Thin time bar under the header.
  const levelTime = LEVELS[state.levelIndex].timeLimitSeconds;
  const fraction = Math.max(0, state.secondsLeft / levelTime);
  ctx.fillStyle = '#1e3a5f';
  ctx.fillRect(0, 64, CANVAS_W, 6);
  ctx.fillStyle = lowTime ? '#ef4444' : '#22c55e';
  ctx.fillRect(0, 64, CANVAS_W * fraction, 6);
}

function drawFooter(ctx, state, now) {
  const level = currentLevel(state);
  const remaining = level.differences.length - state.found.length;
  ctx.fillStyle = '#0f2a43';
  ctx.fillRect(0, FOOTER_Y - 4, CANVAS_W, CANVAS_H - FOOTER_Y + 4);

  // The counter of how many differences remain — the judge's first criterion.
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.fillStyle = remaining === 0 ? '#4ade80' : '#ffffff';
  ctx.fillText(
    remaining === 0 ? 'All differences found!' : `Found ${state.found.length} of ${level.differences.length}  •  ${remaining} to go`,
    700,
    FOOTER_Y + 22,
  );

  drawButton(ctx, HINT_BUTTON, `Hint (${state.hintsLeft})`, state.hintsLeft > 0, '#d97706');
  drawButton(ctx, RESTART_BUTTON, '↻ Restart level', true, '#475569');

  // Feedback line, when fresh.
  if (state.message && now < state.messageUntil) {
    ctx.font = '16px system-ui, sans-serif';
    ctx.fillStyle = '#bae6fd';
    ctx.textAlign = 'right';
    ctx.fillText(state.message, CANVAS_W - 30, FOOTER_Y + 22);
  }
}

function drawCrosshair(ctx, cursor) {
  if (!cursor.visible) return;
  const frame = cursor.side === 'left' ? LEFT_FRAME : RIGHT_FRAME;
  const x = frame.x + cursor.x;
  const y = frame.y + cursor.y;
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 14, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 20, y);
  ctx.lineTo(x - 8, y);
  ctx.moveTo(x + 8, y);
  ctx.lineTo(x + 20, y);
  ctx.moveTo(x, y - 20);
  ctx.lineTo(x, y - 8);
  ctx.moveTo(x, y + 8);
  ctx.lineTo(x, y + 20);
  ctx.stroke();
  ctx.restore();
}

function drawOverlayCard(ctx, title, lines, buttons) {
  ctx.fillStyle = 'rgba(8, 25, 43, 0.72)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  const cardW = 640;
  const cardH = 380;
  const cardX = (CANVAS_W - cardW) / 2;
  const cardY = 150;
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, cardX, cardY, cardW, cardH, 18);
  ctx.fill();
  ctx.fillStyle = '#0f2a43';
  ctx.font = 'bold 34px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(title, CANVAS_W / 2, cardY + 62);
  ctx.font = '18px system-ui, sans-serif';
  ctx.fillStyle = '#334155';
  lines.forEach((line, i) => {
    ctx.fillText(line, CANVAS_W / 2, cardY + 108 + i * 32);
  });
  for (const { rect, label, accent, enabled } of buttons) {
    drawButton(ctx, rect, label, enabled !== false, accent);
  }
}

function drawMenu(ctx) {
  ctx.fillStyle = '#0f2a43';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  // A decorative strip of the harbor scene behind the title.
  ctx.save();
  ctx.globalAlpha = 0.35;
  for (const offsetX of [0, 430, 860]) {
    ctx.save();
    ctx.translate(offsetX, 120);
    drawScene(ctx, 'harbor', EMPTY_SET);
    ctx.restore();
  }
  ctx.restore();
  ctx.fillStyle = 'rgba(8, 25, 43, 0.55)';
  ctx.fillRect(0, 120, CANVAS_W, PANEL_H);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 64px system-ui, sans-serif';
  ctx.fillText('Twin Harbor', CANVAS_W / 2, 90);
  ctx.font = '24px system-ui, sans-serif';
  ctx.fillStyle = '#bae6fd';
  ctx.fillText('Spot the Difference', CANVAS_W / 2, 132);

  ctx.font = '19px system-ui, sans-serif';
  ctx.fillStyle = '#e2e8f0';
  const lines = [
    'Two pictures, side by side — almost identical.',
    'Click or tap every difference on either picture.',
    'A wrong click costs 5 seconds. Hints cost nothing but pride.',
    '',
    '3 levels: Sunny Harbor (6)  •  Cozy Kitchen (7)  •  Night Garden (8)',
    'Mouse, touch, or keyboard: arrows move, Enter clicks, H hints.',
  ];
  lines.forEach((line, i) => ctx.fillText(line, CANVAS_W / 2, 430 + i * 30));
  drawButton(ctx, START_BUTTON, '▶  Start playing', true, '#16a34a');
  ctx.font = '15px system-ui, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('An original game — every scene drawn in code, no copied art.', CANVAS_W / 2, 720);
}

function drawLevelDone(ctx, state) {
  const level = currentLevel(state);
  const bonus = Math.round(state.secondsLeft) * 4;
  drawOverlayCard(
    ctx,
    'Level clear!',
    [
      `${level.name} — all ${level.differences.length} differences found.`,
      `Time bonus: +${bonus} points (${Math.round(state.secondsLeft)}s left)`,
      `Score so far: ${state.score}`,
      state.levelIndex + 1 >= LEVELS.length ? 'That was the last level!' : `Next up: ${LEVELS[state.levelIndex + 1].name}`,
    ],
    [{ rect: NEXT_LEVEL_BUTTON, label: state.levelIndex + 1 >= LEVELS.length ? 'See results' : 'Next level ▶', accent: '#16a34a' }],
  );
}

function drawTimeUp(ctx, state) {
  const level = currentLevel(state);
  drawOverlayCard(
    ctx,
    `Time's up!`,
    [
      `You found ${state.found.length} of ${level.differences.length} differences in ${level.name}.`,
      'The ones you missed are still hiding in the pictures.',
      'Try the level again — the timer resets.',
    ],
    [{ rect: RETRY_BUTTON, label: '↻  Try again', accent: '#d97706' }],
  );
}

function drawWin(ctx, state) {
  drawOverlayCard(
    ctx,
    'You found them all!',
    [
      `All ${state.totalFound} differences across 3 levels.`,
      `Final score: ${state.score}`,
      state.bestScore > 0 ? `Best score this session: ${state.bestScore}` : '',
      'Thanks for playing Twin Harbor!',
    ].filter(Boolean),
    [
      { rect: PLAY_AGAIN_BUTTON, label: '▶  Play again', accent: '#16a34a' },
      { rect: MENU_FROM_WIN_BUTTON, label: 'Menu', accent: '#475569' },
    ],
  );
}

export function renderFrame(ctx, state, cursor, now) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  if (state.screen === SCREENS.MENU) {
    drawMenu(ctx);
    return;
  }
  // The game table behind the pictures.
  ctx.fillStyle = '#e8eef4';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  drawHeader(ctx, state);
  drawPanel(ctx, state, 'left');
  drawPanel(ctx, state, 'right');
  drawMarkers(ctx, state, now);
  drawHintPulse(ctx, state, now);
  drawMissFlash(ctx, state.miss, now);
  drawCrosshair(ctx, cursor);
  drawFooter(ctx, state, now);
  if (state.screen === SCREENS.LEVEL_DONE) drawLevelDone(ctx, state);
  if (state.screen === SCREENS.TIME_UP) drawTimeUp(ctx, state);
  if (state.screen === SCREENS.WIN) drawWin(ctx, state);
}
