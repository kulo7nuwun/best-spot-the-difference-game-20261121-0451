// Twin Harbor — Spot the Difference: the scene painters.
//
// Every picture is original art drawn with canvas paths — no images, no copied
// characters. Each painter draws one panel in panel space (580 x 620) and takes
// a Set of difference ids that are "changed" for that panel: the left picture
// is always painted with an empty set, the right picture with the level's full
// set, so the two pictures differ in exactly the places differences.js lists.

import { PANEL_W, PANEL_H } from './config.js';

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function poly(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function waveLine(ctx, y, amplitude, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = 0; x <= PANEL_W; x += 10) {
    const yy = y + Math.sin((x / PANEL_W) * Math.PI * 4) * amplitude;
    if (x === 0) ctx.moveTo(x, yy);
    else ctx.lineTo(x, yy);
  }
  ctx.stroke();
}

function drawGull(ctx, x, y, size, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(x - size, y, size, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + size, y, size, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
}

// ---------------------------------------------------------------- harbor

export function drawHarbor(ctx, changed) {
  // Sky and sun.
  const sky = ctx.createLinearGradient(0, 0, 0, 380);
  sky.addColorStop(0, '#7ec8f7');
  sky.addColorStop(1, '#cfeeff');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_W, 380);

  ctx.fillStyle = '#ffd93b';
  circle(ctx, 96, 78, 34);
  if (!changed.has('sun-rays')) {
    ctx.strokeStyle = '#f5b301';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(96 + Math.cos(a) * 44, 78 + Math.sin(a) * 44);
      ctx.lineTo(96 + Math.cos(a) * 58, 78 + Math.sin(a) * 58);
      ctx.stroke();
    }
  }

  // Clouds.
  ctx.fillStyle = '#ffffff';
  ellipse(ctx, 240, 90, 52, 20);
  ellipse(ctx, 272, 78, 38, 18);
  ellipse(ctx, 480, 60, 44, 16);

  // Seagulls: three in the original, two when the middle one flew away.
  drawGull(ctx, 380, 118, 12, '#334155');
  if (!changed.has('gull')) drawGull(ctx, 452, 118, 12, '#334155');
  drawGull(ctx, 516, 100, 10, '#334155');

  // Sea.
  const sea = ctx.createLinearGradient(0, 380, 0, PANEL_H);
  sea.addColorStop(0, '#2f7fc4');
  sea.addColorStop(1, '#1d4e89');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 380, PANEL_W, PANEL_H - 380);
  waveLine(ctx, 430, 6, 'rgba(255,255,255,0.45)');
  waveLine(ctx, 500, 7, 'rgba(255,255,255,0.35)');
  waveLine(ctx, 580, 6, 'rgba(255,255,255,0.3)');

  // The red buoy (gone in the changed picture).
  if (!changed.has('buoy')) {
    ctx.fillStyle = '#e23b3b';
    ctx.beginPath();
    ctx.moveTo(150, 496);
    ctx.lineTo(168, 516);
    ctx.lineTo(168, 536);
    ctx.lineTo(132, 536);
    ctx.lineTo(132, 516);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(132, 516, 36, 7);
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(150, 496);
    ctx.lineTo(150, 484);
    ctx.stroke();
  }

  // A jumping fish (gone in the changed picture).
  if (!changed.has('fish')) {
    ctx.fillStyle = '#f97316';
    ellipse(ctx, 400, 556, 20, 9);
    poly(ctx, [[418, 556], [434, 546], [434, 566]]);
    ctx.fillStyle = '#ffffff';
    circle(ctx, 392, 553, 3);
    ctx.fillStyle = '#1d4e89';
    circle(ctx, 392, 553, 1.5);
  }

  // The little fishing boat, sail red in the original, blue in the changed one.
  ctx.fillStyle = '#8b5a2b';
  poly(ctx, [[220, 380], [380, 380], [356, 420], [244, 420]]);
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(216, 372, 168, 10);
  ctx.fillStyle = '#5b3a1e';
  ctx.fillRect(296, 240, 8, 140);
  ctx.fillStyle = changed.has('sail-color') ? '#2563eb' : '#e23b3b';
  poly(ctx, [[308, 248], [308, 368], [392, 368]]);
  ctx.fillStyle = '#f8fafc';
  poly(ctx, [[292, 252], [292, 368], [216, 368]]);
  ctx.fillStyle = '#fbbf24';
  circle(ctx, 300, 238, 6);

  // The lighthouse on the rocks.
  ctx.fillStyle = '#64748b';
  poly(ctx, [[430, 400], [510, 400], [528, 380], [412, 380]]);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(448, 190, 44, 190);
  if (!changed.has('lighthouse-stripe')) {
    ctx.fillStyle = '#e23b3b';
    ctx.fillRect(448, 210, 44, 26);
  }
  ctx.fillStyle = '#e23b3b';
  ctx.fillRect(448, 268, 44, 26);
  ctx.fillRect(448, 326, 44, 26);
  ctx.fillStyle = '#334155';
  ctx.fillRect(442, 168, 56, 22);
  ctx.fillStyle = '#fde68a';
  circle(ctx, 470, 179, 8);
  ctx.fillStyle = '#334155';
  poly(ctx, [[440, 168], [500, 168], [470, 148]]);

  // Wooden pier on the left.
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(0, 470, 120, 14);
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(18, 484, 10, 60);
  ctx.fillRect(84, 484, 10, 60);
  ctx.fillStyle = '#e23b3b';
  circle(ctx, 60, 458, 8);
}

// ---------------------------------------------------------------- kitchen

export function drawKitchen(ctx, changed) {
  // Wall, floor and window.
  ctx.fillStyle = '#fde8c8';
  ctx.fillRect(0, 0, PANEL_W, 420);
  ctx.fillStyle = '#d9a05b';
  ctx.fillRect(0, 420, PANEL_W, PANEL_H - 420);
  ctx.fillStyle = '#bfe3f5';
  ctx.fillRect(400, 60, 150, 200);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(392, 52, 166, 216);
  ctx.fillStyle = '#bfe3f5';
  ctx.fillRect(400, 60, 150, 200);
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(468, 60, 8, 200);
  ctx.fillRect(400, 152, 150, 8);
  ctx.fillStyle = '#fbbf24';
  circle(ctx, 430, 100, 22);
  ctx.fillStyle = '#ffffff';
  ellipse(ctx, 510, 110, 30, 12);
  ellipse(ctx, 522, 100, 20, 10);
  // The cat sitting on the windowsill (gone in the changed picture).
  if (!changed.has('cat')) {
    ctx.fillStyle = '#475569';
    ellipse(ctx, 468, 250, 34, 18);
    circle(ctx, 492, 224, 16);
    poly(ctx, [[482, 212], [488, 196], [496, 210]]);
    poly(ctx, [[500, 210], [508, 196], [512, 212]]);
    ctx.fillStyle = '#fbbf24';
    circle(ctx, 497, 222, 2.5);
  }
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(392, 260, 166, 10);

  // Wall clock: 3 o'clock in the original, 6 o'clock in the changed picture.
  ctx.fillStyle = '#ffffff';
  circle(ctx, 290, 92, 40);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(290, 92, 40, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#334155';
  circle(ctx, 290, 92, 4);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(290, 92);
  if (changed.has('clock-hands')) ctx.lineTo(290, 120);
  else ctx.lineTo(318, 92);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(290, 92);
  ctx.lineTo(290, 66);
  ctx.stroke();

  // Framed picture on the left wall: a sun in the original, a moon in the changed picture.
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(56, 86, 72, 72);
  ctx.fillStyle = '#dbeafe';
  ctx.fillRect(64, 94, 56, 56);
  if (changed.has('picture')) {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(64, 94, 56, 56);
    ctx.fillStyle = '#fde68a';
    circle(ctx, 92, 122, 14);
    ctx.fillStyle = '#1e293b';
    circle(ctx, 98, 118, 12);
  } else {
    ctx.fillStyle = '#fbbf24';
    circle(ctx, 92, 122, 14);
  }

  // Shelf with mugs: the left mug is teal in the original, pink in the changed one.
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(60, 270, 180, 12);
  ctx.fillStyle = changed.has('mug-color') ? '#ec4899' : '#0d9488';
  ctx.fillRect(96, 226, 48, 44);
  ctx.strokeStyle = changed.has('mug-color') ? '#ec4899' : '#0d9488';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(150, 248, 12, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  ctx.fillStyle = '#f97316';
  ctx.fillRect(168, 226, 48, 44);
  ctx.strokeStyle = '#f97316';
  ctx.beginPath();
  ctx.arc(222, 248, 12, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();

  // Table, kettle and fruit bowl.
  ctx.fillStyle = '#a16207';
  ctx.fillRect(60, 500, 460, 18);
  ctx.fillStyle = '#854d0e';
  ctx.fillRect(90, 518, 16, 80);
  ctx.fillRect(474, 518, 16, 80);

  // Kettle with steam (no steam in the changed picture).
  ctx.fillStyle = '#94a3b8';
  ellipse(ctx, 210, 470, 46, 30);
  poly(ctx, [[168, 462], [140, 436], [150, 430], [172, 448]]);
  ctx.fillStyle = '#64748b';
  ctx.fillRect(204, 430, 12, 12);
  if (!changed.has('steam')) {
    ctx.strokeStyle = 'rgba(148,163,184,0.9)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(200, 424);
    ctx.quadraticCurveTo(190, 402, 202, 384);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(218, 424);
    ctx.quadraticCurveTo(228, 402, 216, 384);
    ctx.stroke();
  }

  // Fruit bowl: three apples in the original, two in the changed picture.
  ctx.fillStyle = '#dc2626';
  circle(ctx, 282, 462, 16);
  circle(ctx, 318, 462, 16);
  if (!changed.has('apple')) {
    circle(ctx, 300, 440, 16);
  }
  ctx.fillStyle = '#16a34a';
  ellipse(ctx, 300, 420, 10, 4);
  ctx.fillStyle = '#2563eb';
  ellipse(ctx, 300, 482, 52, 14);

  // Chair with a cushion: mustard in the original, violet in the changed one.
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(60, 540, 12, 70);
  ctx.fillRect(140, 540, 12, 70);
  ctx.fillRect(60, 540, 92, 12);
  ctx.fillStyle = changed.has('cushion') ? '#7c3aed' : '#d97706';
  ctx.fillRect(64, 512, 84, 28);
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(60, 470, 12, 70);
  ctx.fillRect(140, 470, 12, 70);
  ctx.fillRect(60, 470, 92, 10);

  // A hanging plant and a rug for warmth.
  ctx.fillStyle = '#16a34a';
  ellipse(ctx, 520, 340, 26, 34);
  ctx.fillStyle = '#b45309';
  poly(ctx, [[500, 372], [540, 372], [532, 400], [508, 400]]);
  ctx.fillStyle = '#f472b6';
  ellipse(ctx, 60, 600, 90, 12);
  ellipse(ctx, 520, 600, 90, 12);
}

// ---------------------------------------------------------------- garden

export function drawGarden(ctx, changed) {
  // Night sky, stars and moon.
  const sky = ctx.createLinearGradient(0, 0, 0, 420);
  sky.addColorStop(0, '#0f172a');
  sky.addColorStop(1, '#1e3a5f');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_W, 420);
  ctx.fillStyle = '#fde68a';
  const stars = [[80, 60], [160, 110], [240, 48], [300, 60], [360, 100], [420, 50], [520, 140], [120, 180], [260, 150]];
  for (const [sx, sy] of stars) {
    if (changed.has('star') && sx === 300) continue;
    circle(ctx, sx, sy, 3);
  }
  // Moon: full in the original, crescent in the changed picture.
  ctx.fillStyle = '#fef3c7';
  circle(ctx, 486, 82, 34);
  if (changed.has('moon')) {
    ctx.fillStyle = '#1e3a5f';
    circle(ctx, 498, 74, 30);
  }
  ctx.fillStyle = 'rgba(254,243,199,0.15)';
  circle(ctx, 486, 82, 52);

  // Fireflies: five glowing dots in the original, four in the changed one.
  ctx.fillStyle = '#a3e635';
  const fireflies = [[120, 220], [180, 260], [250, 210], [330, 280], [400, 230]];
  for (const [fx, fy] of fireflies) {
    if (changed.has('firefly') && fx === 180 && fy === 260) continue;
    ctx.fillStyle = 'rgba(163,230,53,0.25)';
    circle(ctx, fx, fy, 12);
    ctx.fillStyle = '#a3e635';
    circle(ctx, fx, fy, 4);
  }

  // The old garden wall and fence.
  ctx.fillStyle = '#475569';
  ctx.fillRect(0, 380, PANEL_W, 60);
  ctx.fillStyle = '#64748b';
  for (let x = 0; x < PANEL_W; x += 40) ctx.fillRect(x, 380, 34, 8);
  ctx.fillStyle = '#d6c9a8';
  const pickets = [30, 90, 150, 210, 270, 330, 390, 450, 510];
  for (const px of pickets) {
    if (changed.has('picket') && px === 90) continue;
    ctx.fillRect(px, 330, 16, 60);
    poly(ctx, [[px, 330], [px + 16, 330], [px + 8, 314]]);
  }

  // The owl on its branch: eyes open in the original, closed in the changed one.
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(400, 250, 130, 12);
  ctx.fillStyle = '#8b5a2b';
  ellipse(ctx, 462, 210, 30, 40);
  poly(ctx, [[440, 176], [448, 158], [456, 174]]);
  poly(ctx, [[468, 174], [476, 158], [484, 176]]);
  if (changed.has('owl-eyes')) {
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(448, 202);
    ctx.lineTo(458, 202);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(466, 202);
    ctx.lineTo(476, 202);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#fde68a';
    circle(ctx, 453, 202, 7);
    circle(ctx, 471, 202, 7);
    ctx.fillStyle = '#1e293b';
    circle(ctx, 453, 202, 3.5);
    circle(ctx, 471, 202, 3.5);
  }
  ctx.fillStyle = '#f59e0b';
  poly(ctx, [[458, 218], [466, 218], [462, 226]]);

  // Grass, flowers and the mushroom.
  ctx.fillStyle = '#14532d';
  ctx.fillRect(0, 440, PANEL_W, PANEL_H - 440);
  ctx.fillStyle = '#166534';
  for (let x = 20; x < PANEL_W; x += 46) {
    poly(ctx, [[x, 470], [x + 6, 446], [x + 12, 470]]);
  }
  // Flowers: the one at (330, 470) is pink in the original, violet in the changed one.
  const flowers = [[120, 500, '#f472b6'], [330, 470, '#f472b6'], [470, 500, '#f472b6'], [250, 520, '#fbbf24']];
  for (const [fx, fy, fc] of flowers) {
    const color = changed.has('flower-color') && fx === 330 ? '#a78bfa' : fc;
    ctx.fillStyle = color;
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * Math.PI * 2;
      circle(ctx, fx + Math.cos(a) * 9, fy + Math.sin(a) * 9, 6);
    }
    ctx.fillStyle = '#fde68a';
    circle(ctx, fx, fy, 5);
    ctx.strokeStyle = '#166534';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(fx, fy + 8);
    ctx.lineTo(fx, fy + 34);
    ctx.stroke();
  }
  // Mushroom: spotted in the original, plain in the changed picture.
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(200, 540, 20, 34);
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(210, 542, 30, Math.PI, 0);
  ctx.fill();
  if (!changed.has('mushroom-spots')) {
    ctx.fillStyle = '#ffffff';
    circle(ctx, 194, 528, 5);
    circle(ctx, 214, 520, 6);
    circle(ctx, 228, 534, 4);
  }

  // Stepping stones: four in the original, three in the changed picture.
  ctx.fillStyle = '#94a3b8';
  const stones = [[300, 560], [350, 585], [400, 560], [450, 585]];
  for (const [sx, sy] of stones) {
    if (changed.has('stepping-stone') && sx === 400) continue;
    ellipse(ctx, sx, sy, 26, 12);
  }
}

// Paint one panel of a level: `changed` is the Set of difference ids applied.
export function drawScene(ctx, levelId, changed) {
  if (levelId === 'harbor') drawHarbor(ctx, changed);
  else if (levelId === 'kitchen') drawKitchen(ctx, changed);
  else drawGarden(ctx, changed);
}
