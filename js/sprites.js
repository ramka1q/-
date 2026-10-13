'use strict';
// ============================================================
//  Спрайты: вся графика рисуется кодом.
//  Каждый спрайт рисуется в центре (0,0) и вписан в радиус ~50.
//  Кэшируется в offscreen-canvas нескольких размеров (LOD).
// ============================================================
const OL = '#1e1b2e';
const S = {}; // name -> (ctx, variant) => void

// ---------- примитивы рисования ----------
function fs(c, f, s, w) { if (f) { c.fillStyle = f; c.fill(); } if (s) { c.lineWidth = w; c.strokeStyle = s; c.stroke(); } }
function circ(c, x, y, r, f, s = OL, w = 3) { c.beginPath(); c.arc(x, y, Math.max(0.01, r), 0, TAU); fs(c, f, s, w); }
function ell(c, x, y, rx, ry, rot, f, s = OL, w = 3) { c.beginPath(); c.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot || 0, 0, TAU); fs(c, f, s, w); }
function rect(c, x, y, w, h, rad, f, s = OL, lw = 3) { U.roundRect(c, x, y, w, h, rad); fs(c, f, s, lw); }
function poly(c, pts, f, s = OL, w = 3, open = false) {
  c.beginPath(); c.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  if (!open) c.closePath(); fs(c, f, s, w);
}
function line(c, x1, y1, x2, y2, s = OL, w = 3) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.lineWidth = w; c.strokeStyle = s; c.stroke(); }
function hl(c, x, y, rx, ry, a = 0.45) { c.save(); c.globalAlpha = a; ell(c, x, y, rx, ry, -0.5, '#fff', null); c.restore(); }
function rg(c, x, y, r, stops) {
  const g = c.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.05, x, y, r * 1.05);
  stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s)); return g;
}
function lg(c, x0, y0, x1, y1, stops) {
  const g = c.createLinearGradient(x0, y0, x1, y1);
  stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s)); return g;
}
function ball(c, x, y, r, col, s = OL, w = 3) { circ(c, x, y, r, rg(c, x, y, r, [U.shade(col, 0.45), col, U.shade(col, -0.3)]), s, w); }
function blobPath(c, x, y, r, n, amp, seed) {
  c.beginPath();
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    const rr = r * (1 + amp * U.noise1(seed + i * 1.7));
    pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
  }
  for (let i = 0; i <= n; i++) {
    const p = pts[i % n], q = pts[(i + 1) % n];
    const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
    i === 0 ? c.moveTo(mx, my) : c.quadraticCurveTo(p[0], p[1], mx, my);
  }
  c.closePath();
}
function blob(c, x, y, r, n, amp, seed, f, s = OL, w = 3) { blobPath(c, x, y, r, n, amp, seed); fs(c, f, s, w); }
function eyes(c, x, y, sp, r, mood = 0) {
  for (const s of [-1, 1]) {
    circ(c, x + s * sp, y, r, '#fff', OL, Math.max(1, r * 0.3));
    circ(c, x + s * sp + r * 0.15, y + r * 0.15, r * 0.55, OL, null);
    circ(c, x + s * sp + r * 0.3, y - r * 0.1, r * 0.18, '#fff', null);
  }
  if (mood === 1) { line(c, x - sp - r, y - r * 1.5, x - sp + r * 0.8, y - r * 0.8, OL, r * 0.45); line(c, x + sp + r, y - r * 1.5, x + sp - r * 0.8, y - r * 0.8, OL, r * 0.45); }
  if (mood === 2) { line(c, x - sp - r, y - r * 0.9, x - sp + r * 0.6, y - r * 1.5, OL, r * 0.4); line(c, x + sp + r, y - r * 0.9, x + sp - r * 0.6, y - r * 1.5, OL, r * 0.4); }
}
function smile(c, x, y, w, s = OL, lw = 2.5) { c.beginPath(); c.arc(x, y - w * 0.4, w, 0.25 * Math.PI, 0.75 * Math.PI); c.lineWidth = lw; c.strokeStyle = s; c.stroke(); }
const PAL = {
  bright: ['#ff5d73', '#ffb84d', '#ffe156', '#6ee7a0', '#4cc9f0', '#9b7bff', '#ff7bd5', '#ffffff'],
  car: ['#e63946', '#2a9df4', '#ffd166', '#06d6a0', '#f4f1de', '#8338ec', '#ff7f11', '#3d405b'],
  skin: ['#ffd7b5', '#f1c27d', '#c68642', '#8d5524', '#ffe0c7'],
  hair: ['#2b1d14', '#6b3e1f', '#e8c35c', '#a33b20', '#111111', '#9a9a9a'],
};

// ============================================================
//  ГЛАВА 1 — микромир
// ============================================================
S.coccus = (c, v = 0) => {
  const col = ['#7bd389', '#f2a65a', '#c08cf0', '#5cc8e8'][v % 4];
  [[-17, -12, 25], [17, -14, 23], [0, 15, 28]].forEach(([x, y, r]) => { ball(c, x, y, r, col); hl(c, x - r * 0.3, y - r * 0.4, r * 0.35, r * 0.18); });
  eyes(c, 0, 14, 8, 5);
};
S.bacillus = (c, v = 0) => {
  const col = ['#8fd14f', '#f78c6b', '#a0c4ff', '#ffd166'][v % 4];
  c.lineWidth = 2; c.strokeStyle = U.shade(col, -0.4);
  for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-40, -8 + i * 4); c.bezierCurveTo(-48, -15 + i * 6, -52, 5 + i * 3, -58, i * 5 - 6); c.stroke(); }
  rect(c, -42, -18, 84, 36, 18, lg(c, 0, -18, 0, 18, [U.shade(col, 0.4), col, U.shade(col, -0.25)]));
  hl(c, -10, -9, 22, 4);
  eyes(c, 22, -1, 7, 5);
};
S.spirillum = (c, v = 0) => {
  const col = ['#ff7eb6', '#7afcff', '#feff9c'][v % 3];
  c.lineCap = 'round';
  const path = () => { c.beginPath(); for (let i = 0; i <= 40; i++) { const x = -45 + i * 2.25, y = Math.sin(i * 0.47) * 14; i ? c.lineTo(x, y) : c.moveTo(x, y); } };
  path(); c.lineWidth = 16; c.strokeStyle = OL; c.stroke();
  path(); c.lineWidth = 10; c.strokeStyle = col; c.stroke();
  circ(c, 44, Math.sin(40 * 0.47) * 14, 3, OL, null);
};
S.amoeba = (c, v = 0) => {
  const col = ['#b8f2e6', '#ffc6ff', '#caffbf'][v % 3];
  c.save(); c.globalAlpha = 0.9;
  blob(c, 0, 0, 44, 9, 0.22, v * 3 + 1, rg(c, 0, 0, 46, [U.shade(col, 0.5), col, U.shade(col, -0.2)]), U.shade(col, -0.45), 3);
  c.restore();
  ball(c, -6, -4, 14, '#9d6bd6', U.shade('#9d6bd6', -0.4), 2);
  circ(c, 18, 12, 5, U.rgba('#5aa', 0.5), null); circ(c, -20, 18, 4, U.rgba('#5aa', 0.5), null); circ(c, 14, -22, 3.5, U.rgba('#5aa', 0.5), null);
  eyes(c, -6, -6, 6, 4);
};
S.virus = (c, v = 0) => {
  const col = ['#ff4d6d', '#c77dff', '#ff9e00'][v % 3];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    line(c, Math.cos(a) * 26, Math.sin(a) * 26, Math.cos(a) * 44, Math.sin(a) * 44, OL, 6);
    line(c, Math.cos(a) * 26, Math.sin(a) * 26, Math.cos(a) * 44, Math.sin(a) * 44, U.shade(col, -0.2), 3);
    circ(c, Math.cos(a) * 45, Math.sin(a) * 45, 5, U.shade(col, 0.3), OL, 2);
  }
  ball(c, 0, 0, 30, col);
  eyes(c, 0, -2, 9, 6, 1);
  c.beginPath(); c.moveTo(-8, 13); c.lineTo(8, 13); c.lineWidth = 3; c.strokeStyle = OL; c.stroke();
};
S.diatom = (c, v = 0) => {
  const col = ['#c9e265', '#ffd670', '#90e0ef'][v % 3];
  c.save(); c.globalAlpha = 0.95;
  ell(c, 0, 0, 46, 30, 0, rg(c, 0, 0, 46, [U.shade(col, 0.6), col, U.shade(col, -0.3)]));
  c.restore();
  for (let i = -4; i <= 4; i++) line(c, i * 9, -Math.sqrt(1 - Math.pow(i / 5, 2)) * 27, i * 9, Math.sqrt(1 - Math.pow(i / 5, 2)) * 27, U.rgba('#3a5a00', 0.45), 2);
  line(c, -44, 0, 44, 0, U.rgba('#3a5a00', 0.6), 3);
  hl(c, -15, -14, 18, 5);
};
S.pollen = (c, v = 0) => {
  const col = ['#ffd23f', '#ff9f1c', '#f6f740'][v % 3];
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * TAU;
    poly(c, [Math.cos(a - 0.12) * 36, Math.sin(a - 0.12) * 36, Math.cos(a) * 49, Math.sin(a) * 49, Math.cos(a + 0.12) * 36, Math.sin(a + 0.12) * 36], U.shade(col, -0.15), OL, 2);
  }
  ball(c, 0, 0, 38, col);
  for (let i = 0; i < 9; i++) { const a = i * 2.4, d = 12 + (i % 3) * 7; circ(c, Math.cos(a) * d, Math.sin(a) * d, 3.5, U.shade(col, -0.35), null); }
};
S.dust = (c, v = 0) => {
  const col = ['#b8b8c8', '#c9b79c', '#9aa0a6'][v % 3];
  c.lineCap = 'round';
  for (let i = 0; i < 16; i++) {
    const a = i * 0.9 + v, l = 30 + (i % 4) * 6;
    c.beginPath(); c.moveTo(0, 0);
    c.quadraticCurveTo(Math.cos(a + 0.6) * l * 0.6, Math.sin(a + 0.6) * l * 0.6, Math.cos(a) * l, Math.sin(a) * l);
    c.lineWidth = 4; c.strokeStyle = U.shade(col, -0.3); c.stroke();
  }
  blob(c, 0, 0, 30, 10, 0.3, v + 7, rg(c, 0, 0, 30, [U.shade(col, 0.4), col, U.shade(col, -0.2)]), U.shade(col, -0.45), 2.5);
  for (let i = 0; i < 6; i++) circ(c, Math.cos(i * 2.1) * 14, Math.sin(i * 2.1) * 14, 3, U.shade(col, -0.25), null);
};
S.crumb = (c, v = 0) => {
  const col = ['#d9a05b', '#c68b4b', '#e7b871'][v % 3];
  blob(c, 0, 0, 42, 7, 0.28, v * 5 + 2, rg(c, 0, 0, 44, [U.shade(col, 0.35), col, U.shade(col, -0.35)]), U.shade(col, -0.55), 3);
  for (let i = 0; i < 10; i++) { const a = i * 1.9 + v, d = 8 + (i * 7) % 26; ell(c, Math.cos(a) * d, Math.sin(a) * d, 4, 2.5, a, U.shade(col, -0.3), null); }
  hl(c, -12, -14, 12, 5, 0.3);
};
S.sugar = (c) => {
  poly(c, [0, -44, 40, -22, 0, 0, -40, -22], '#ffffff');
  poly(c, [-40, -22, 0, 0, 0, 44, -40, 22], '#dfe7f5');
  poly(c, [40, -22, 0, 0, 0, 44, 40, 22], '#c2cfe6');
  hl(c, -6, -26, 12, 5, 0.8);
  [[-20, 10], [18, 14], [-10, -26], [24, -6]].forEach(([x, y]) => circ(c, x, y, 2, '#fff', null));
};
S.hair = (c, v = 0) => {
  const col = ['#3b2414', '#8a5a2b', '#e0b54f', '#1a1a1a'][v % 4];
  c.lineCap = 'round';
  const p = () => { c.beginPath(); c.moveTo(-52, 6); c.bezierCurveTo(-20, -18, 10, 22, 52, -6); };
  p(); c.lineWidth = 9; c.strokeStyle = OL; c.stroke();
  p(); c.lineWidth = 5; c.strokeStyle = col; c.stroke();
  p(); c.lineWidth = 1.5; c.strokeStyle = U.shade(col, 0.4); c.stroke();
};
S.tardigrade = (c, v = 0) => {
  const col = ['#e9c46a', '#f4a261', '#b5e48c'][v % 3];
  for (let i = 0; i < 4; i++) for (const s of [-1, 1]) {
    const x = -30 + i * 20;
    ell(c, x, s * 26, 7, 10, 0, U.shade(col, -0.15), OL, 2.5);
    for (let k = -1; k <= 1; k++) line(c, x + k * 3, s * 34, x + k * 4, s * 38, OL, 1.5);
  }
  ell(c, 0, 0, 46, 28, 0, rg(c, 0, 0, 46, [U.shade(col, 0.45), col, U.shade(col, -0.25)]));
  for (let i = -2; i <= 2; i++) c.beginPath(), c.arc(i * 14, 0, 26, -0.6, 0.6), c.lineWidth = 1.5, c.strokeStyle = U.rgba('#000', 0.15), c.stroke();
  ell(c, 38, 0, 12, 10, 0, U.shade(col, 0.15), OL, 2);
  circ(c, 46, 0, 4, '#c2185b', null);
  circ(c, 34, -7, 3, OL, null); circ(c, 34, 7, 3, OL, null);
};
S.phage = (c) => {
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
    c.beginPath(); c.moveTo(18, 0); c.lineTo(28 + i * 6, s * (14 + i * 9)); c.lineTo(46, s * (8 + i * 14));
    c.lineWidth = 3.5; c.strokeStyle = '#4a4e69'; c.stroke();
  }
  rect(c, -8, -6, 30, 12, 3, '#9a8c98');
  for (let i = 0; i < 4; i++) line(c, -4 + i * 7, -6, -4 + i * 7, 6, OL, 1.5);
  poly(c, [-8, -22, -26, -32, -46, -22, -46, 2, -46, 22, -26, 32, -8, 22, -8, 0], rg(c, -27, 0, 30, ['#e0aaff', '#9d4edd', '#5a189a']));
  line(c, -27, -32, -27, 32, U.rgba('#fff', 0.35), 2); line(c, -46, -22, -8, 22, U.rgba('#fff', 0.2), 2);
  eyes(c, -27, -2, 7, 5, 1);
};
S.paramecium = (c, v = 0) => {
  const col = ['#a8dadc', '#ffcad4', '#d8f3dc'][v % 3];
  c.lineWidth = 1.5; c.strokeStyle = U.shade(col, -0.45);
  for (let i = 0; i < 40; i++) { const a = (i / 40) * TAU; c.beginPath(); c.moveTo(Math.cos(a) * 46, Math.sin(a) * 22); c.lineTo(Math.cos(a) * 52, Math.sin(a) * 27); c.stroke(); }
  c.beginPath(); c.ellipse(0, 0, 46, 22, 0, 0, TAU); fs(c, rg(c, 0, 0, 46, [U.shade(col, 0.5), col, U.shade(col, -0.2)]), U.shade(col, -0.5), 3);
  ell(c, 4, 6, 14, 6, 0.3, U.rgba('#6c584c', 0.4), null);
  circ(c, -18, -4, 6, U.rgba('#7b2cbf', 0.4), null);
  eyes(c, 30, -3, 5, 3.5);
};
S.yeast = (c, v = 0) => {
  const col = ['#f1e3c6', '#e9d8a6', '#fde4cf'][v % 3];
  ell(c, 22, -18, 18, 15, 0.5, rg(c, 22, -18, 18, [U.shade(col, 0.4), col, U.shade(col, -0.25)]), U.shade(col, -0.5), 2.5);
  ell(c, -6, 6, 36, 30, 0.3, rg(c, -6, 6, 36, [U.shade(col, 0.4), col, U.shade(col, -0.25)]), U.shade(col, -0.5), 3);
  circ(c, -10, 8, 9, U.rgba('#9c6644', 0.35), null);
  eyes(c, -6, 0, 8, 4.5);
};
S.droplet = (c) => {
  c.beginPath(); c.moveTo(0, -46); c.bezierCurveTo(26, -10, 38, 10, 30, 26); c.bezierCurveTo(20, 46, -20, 46, -30, 26); c.bezierCurveTo(-38, 10, -26, -10, 0, -46); c.closePath();
  fs(c, rg(c, 0, 10, 40, ['#e0fbfc', '#7ec8e3', '#2a7fba']), '#1d4e89', 3);
  hl(c, -12, 8, 6, 12, 0.7);
};
S.algae = (c, v = 0) => {
  const col = ['#52b788', '#95d5b2', '#2d6a4f'][v % 3];
  for (let i = 0; i < 5; i++) { const x = -40 + i * 20, y = Math.sin(i * 1.2) * 8; ell(c, x, y, 13, 11, 0, rg(c, x, y, 13, [U.shade(col, 0.4), col, U.shade(col, -0.3)]), U.shade(col, -0.5), 2.5); circ(c, x, y, 3.5, U.shade(col, -0.4), null); }
};

// ============================================================
//  ГЛАВА 1 — Стол Пилипюка
// ============================================================
S.paperclip = (c, v = 0) => {
  const col = ['#c0c7d1', '#ff6b6b', '#4dabf7', '#ffd43b'][v % 4];
  const p = () => { c.beginPath(); c.moveTo(-20, 8); c.lineTo(40, 8); c.arc(40, -4, 12, Math.PI / 2, -Math.PI / 2, true); c.lineTo(-40, -16); c.arc(-40, -2, 14, -Math.PI / 2, Math.PI / 2, true); c.lineTo(30, 12); };
  c.lineCap = 'round'; p(); c.lineWidth = 7; c.strokeStyle = OL; c.stroke(); p(); c.lineWidth = 3.5; c.strokeStyle = col; c.stroke();
};
S.pill = (c, v = 0) => {
  const col = ['#ff6b6b', '#4dabf7', '#ffd43b', '#69db7c'][v % 4];
  c.save(); c.rotate(-0.4);
  rect(c, -42, -17, 84, 34, 17, '#fff');
  c.save(); U.roundRect(c, -42, -17, 84, 34, 17); c.clip(); c.fillStyle = col; c.fillRect(0, -20, 50, 40); c.restore();
  rect(c, -42, -17, 84, 34, 17, null);
  hl(c, -16, -8, 18, 4, 0.7); c.restore();
};
S.screw = (c) => {
  circ(c, 0, 0, 44, rg(c, 0, 0, 44, ['#f1f3f5', '#adb5bd', '#495057']));
  circ(c, 0, 0, 34, null, U.rgba('#000', 0.15), 3);
  rect(c, -28, -6, 56, 12, 3, '#343a40', null); rect(c, -6, -28, 12, 56, 3, '#343a40', null);
  hl(c, -16, -18, 12, 6);
};
S.pencap = (c, v = 0) => {
  const col = ['#1c7ed6', '#e03131', '#2b8a3e', '#212529'][v % 4];
  rect(c, -44, -14, 76, 28, 10, lg(c, 0, -14, 0, 14, [U.shade(col, 0.35), col, U.shade(col, -0.3)]));
  rect(c, 26, -18, 18, 36, 6, U.shade(col, -0.2));
  rect(c, -30, -22, 46, 8, 3, '#ced4da');
};
S.pencil = (c, v = 0) => {
  const col = ['#ffd43b', '#ff8787', '#74c0fc', '#8ce99a'][v % 4];
  poly(c, [-36, -9, 34, -9, 54, 0, 34, 9, -36, 9], col);
  poly(c, [34, -9, 54, 0, 34, 9], '#f4d6a0'); poly(c, [47, -3.5, 54, 0, 47, 3.5], '#343a40', null);
  rect(c, -48, -9, 14, 18, 2, '#ff8fab'); rect(c, -38, -10, 6, 20, 0, '#adb5bd');
  line(c, -32, -3, 34, -3, U.shade(col, -0.25), 2); line(c, -32, 3, 34, 3, U.shade(col, 0.3), 2);
};
S.eraser = (c, v = 0) => {
  const col = ['#ffa8a8', '#ffd8a8', '#d0bfff'][v % 3];
  c.save(); c.rotate(0.2);
  rect(c, -42, -22, 84, 44, 8, lg(c, 0, -22, 0, 22, [U.shade(col, 0.4), col, U.shade(col, -0.2)]));
  rect(c, -42, -22, 34, 44, 8, '#4dabf7');
  c.fillStyle = '#fff'; c.font = 'bold 14px sans-serif'; c.fillText('ЛАСТИК', -4, 6);
  c.restore();
};
S.testtube = (c, v = 0) => {
  const col = ['#ff6b6b', '#51cf66', '#339af0', '#cc5de8'][v % 4];
  c.save(); c.rotate(-Math.PI / 2 + 0.25);
  rect(c, -12, -50, 24, 96, 12, U.rgba('#e7f5ff', 0.55), OL, 3);
  c.save(); U.roundRect(c, -12, -50, 24, 96, 12); c.clip(); c.fillStyle = col; c.fillRect(-12, 0, 24, 50); c.fillStyle = U.shade(col, 0.4); c.fillRect(-12, 0, 24, 4); c.restore();
  rect(c, -12, -50, 24, 96, 12, null, OL, 3);
  rect(c, -15, -52, 30, 8, 3, '#dee2e6'); line(c, -6, -40, -6, 30, U.rgba('#fff', 0.7), 3);
  c.restore();
};
S.flask = (c, v = 0) => {
  const col = ['#ff6b6b', '#51cf66', '#339af0', '#fcc419', '#cc5de8'][v % 5];
  const shape = () => { c.beginPath(); c.moveTo(-9, -46); c.lineTo(9, -46); c.lineTo(9, -16); c.lineTo(38, 38); c.quadraticCurveTo(40, 46, 30, 46); c.lineTo(-30, 46); c.quadraticCurveTo(-40, 46, -38, 38); c.lineTo(-9, -16); c.closePath(); };
  shape(); fs(c, U.rgba('#e7f5ff', 0.5), null);
  c.save(); shape(); c.clip(); c.fillStyle = col; c.fillRect(-50, 8, 100, 50); c.fillStyle = U.shade(col, 0.45); c.fillRect(-50, 8, 100, 4);
  [[-10, 30, 4], [8, 22, 3], [16, 36, 5], [-20, 38, 2.5]].forEach(([x, y, r]) => circ(c, x, y, r, U.rgba('#fff', 0.6), null)); c.restore();
  shape(); fs(c, null, OL, 3); rect(c, -12, -50, 24, 7, 3, '#dee2e6');
  line(c, -4, -36, -24, 34, U.rgba('#fff', 0.6), 3);
};
S.beaker = (c, v = 0) => {
  const col = ['#74c0fc', '#ffa94d', '#b197fc', '#63e6be'][v % 4];
  const shape = () => { c.beginPath(); c.moveTo(-36, -44); c.lineTo(-30, 44); c.lineTo(30, 44); c.lineTo(36, -44); c.closePath(); };
  shape(); fs(c, U.rgba('#e7f5ff', 0.45), null);
  c.save(); shape(); c.clip(); c.fillStyle = U.rgba(col, 0.85); c.fillRect(-40, -4, 80, 50); c.restore();
  shape(); fs(c, null, OL, 3); line(c, -36, -44, -44, -50, OL, 3);
  for (let i = 0; i < 5; i++) line(c, 14, -30 + i * 14, 26, -30 + i * 14, OL, 2);
  line(c, -24, -36, -20, 36, U.rgba('#fff', 0.6), 4);
};
S.petridish = (c) => {
  circ(c, 0, 0, 46, U.rgba('#e7f5ff', 0.6));
  circ(c, 0, 0, 40, rg(c, 0, 0, 40, ['#fff3bf', '#ffe066', '#f2c94c']), U.rgba('#b08900', 0.5), 2);
  [[-14, -10, 6, '#7bd389'], [12, 8, 8, '#f2a65a'], [-6, 18, 5, '#c08cf0'], [18, -16, 4, '#5cc8e8'], [-20, 12, 3, '#7bd389']].forEach(([x, y, r, col]) => circ(c, x, y, r, col, U.shade(col, -0.4), 1.5));
  hl(c, -18, -24, 16, 6, 0.6);
};
S.microscope = (c) => {
  rect(c, -40, 30, 80, 16, 6, '#495057');
  rect(c, -6, -10, 14, 44, 4, '#adb5bd');
  c.beginPath(); c.arc(16, 0, 30, -1.9, 1.2); c.lineWidth = 14; c.strokeStyle = OL; c.stroke(); c.lineWidth = 9; c.strokeStyle = '#343a40'; c.stroke();
  c.save(); c.translate(-6, -16); c.rotate(-0.5);
  rect(c, -10, -36, 20, 60, 6, lg(c, -10, 0, 10, 0, ['#f8f9fa', '#ced4da', '#868e96']));
  rect(c, -14, -44, 28, 12, 4, '#212529'); rect(c, -7, 22, 14, 14, 3, '#495057');
  c.restore();
  rect(c, -30, 14, 50, 8, 2, '#868e96'); circ(c, 28, 4, 7, '#212529');
};
S.notebook = (c, v = 0) => {
  const col = ['#4263eb', '#e64980', '#2f9e44', '#f08c00'][v % 4];
  c.save(); c.rotate(-0.15);
  rect(c, -36, -46, 76, 92, 6, '#f8f9fa'); rect(c, -40, -46, 76, 92, 6, col);
  rect(c, -30, -30, 50, 22, 3, '#fff', OL, 2);
  for (let i = 0; i < 9; i++) circ(c, -40, -38 + i * 9.5, 4, '#dee2e6', OL, 1.5);
  c.fillStyle = OL; c.font = 'bold 10px sans-serif'; c.fillText('ОПЫТЫ', -24, -15);
  c.restore();
};
S.mug = (c, v = 0) => {
  const col = ['#e03131', '#1971c2', '#f8f9fa', '#2b8a3e'][v % 4];
  c.beginPath(); c.arc(32, 0, 16, -Math.PI / 2, Math.PI / 2); c.lineWidth = 12; c.strokeStyle = OL; c.stroke(); c.lineWidth = 7; c.strokeStyle = col; c.stroke();
  circ(c, -4, 0, 38, lg(c, -40, 0, 30, 0, [U.shade(col, -0.2), U.shade(col, 0.25), U.shade(col, -0.3)]));
  circ(c, -4, 0, 30, rg(c, -4, 0, 30, ['#a47148', '#6f4518', '#3b2410']));
  ell(c, -10, -8, 12, 4, -0.4, U.rgba('#fff', 0.25), null);
};
S.burner = (c) => {
  circ(c, 0, 0, 40, rg(c, 0, 0, 40, ['#dee2e6', '#868e96', '#343a40']));
  circ(c, 0, 0, 16, '#212529');
  circ(c, 0, 0, 8, '#000', null);
  line(c, 30, 20, 50, 44, '#e67700', 6);
};
S.labmouse = (c) => {
  c.lineCap = 'round'; c.beginPath(); c.moveTo(-30, 0); c.bezierCurveTo(-50, -10, -45, 20, -58, 16); c.lineWidth = 4; c.strokeStyle = '#ffa8a8'; c.stroke();
  ell(c, -4, 0, 32, 22, 0, rg(c, -4, 0, 32, ['#ffffff', '#f1f3f5', '#ced4da']));
  ell(c, 28, 0, 18, 14, 0, '#f8f9fa');
  circ(c, 20, -15, 9, '#ffc9c9'); circ(c, 20, 15, 9, '#ffc9c9');
  circ(c, 44, 0, 4, '#ff8787', null); circ(c, 34, -6, 3, '#c92a2a', null); circ(c, 34, 6, 3, '#c92a2a', null);
  for (const s of [-1, 1]) line(c, 40, s * 3, 52, s * 10, U.rgba(OL, 0.6), 1);
};
S.cockroach = (c) => {
  for (let i = 0; i < 3; i++) for (const s of [-1, 1]) { c.beginPath(); c.moveTo(-10 + i * 14, s * 10); c.lineTo(-16 + i * 16, s * 30); c.lineTo(-24 + i * 20, s * 38); c.lineWidth = 3; c.strokeStyle = '#3d2314'; c.stroke(); }
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(34, s * 6); c.quadraticCurveTo(52, s * 10, 58, s * 34); c.lineWidth = 2; c.strokeStyle = '#3d2314'; c.stroke(); }
  ell(c, -4, 0, 36, 20, 0, rg(c, -4, 0, 36, ['#b5651d', '#7f4214', '#4a250b']));
  line(c, -40, 0, 18, 0, U.rgba('#000', 0.35), 2);
  ell(c, 30, 0, 12, 13, 0, '#5c3010');
  hl(c, -12, -9, 16, 4, 0.35);
};
S.magnifier = (c) => {
  line(c, 18, 18, 48, 48, OL, 16); line(c, 18, 18, 48, 48, '#8d5524', 10);
  circ(c, -8, -8, 32, U.rgba('#d0ebff', 0.5), '#495057', 8);
  hl(c, -18, -18, 12, 6, 0.8);
};
S.ruler = (c) => {
  rect(c, -54, -12, 108, 24, 3, '#ffe066');
  for (let i = 0; i <= 20; i++) line(c, -50 + i * 5, -12, -50 + i * 5, -12 + (i % 5 === 0 ? 12 : 6), OL, 1.5);
};
S.calculator = (c) => {
  rect(c, -32, -44, 64, 88, 8, '#495057');
  rect(c, -24, -36, 48, 18, 3, '#a9e34b');
  c.fillStyle = OL; c.font = 'bold 12px monospace'; c.fillText('5318008', -22, -22);
  for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) rect(c, -24 + k * 12.5, -12 + r * 13, 10, 10, 2, k === 3 ? '#ff922b' : '#dee2e6', OL, 1.5);
};
S.sandwich = (c) => {
  poly(c, [-44, 30, 44, 30, 0, -40], '#e9c46a');
  poly(c, [-38, 22, 38, 22, 0, -32], '#f4a261', null);
  c.beginPath(); c.moveTo(-40, 26); for (let i = 0; i <= 8; i++) c.lineTo(-40 + i * 10, 26 + (i % 2 ? 6 : 0)); c.lineWidth = 6; c.strokeStyle = '#80b918'; c.stroke();
  poly(c, [-30, 18, 30, 18, 0, -24], '#ffe8d6', null);
  circ(c, -6, 4, 7, '#e63946', null); circ(c, 10, 8, 6, '#e63946', null);
  poly(c, [-44, 30, 44, 30, 0, -40], null);
};
S.donut = (c, v = 0) => {
  const col = ['#ff8fab', '#a47148', '#ffd6a5', '#bde0fe'][v % 4];
  circ(c, 0, 0, 44, '#e9a35a');
  blob(c, 0, 0, 38, 12, 0.08, v + 3, col, null);
  circ(c, 0, 0, 14, '#f8f3e6');
  const sp = ['#e63946', '#ffd166', '#06d6a0', '#118ab2', '#fff'];
  for (let i = 0; i < 18; i++) { const a = i * 2.3, d = 20 + (i % 3) * 5; c.save(); c.translate(Math.cos(a) * d, Math.sin(a) * d); c.rotate(a * 3); rect(c, -4, -1.5, 8, 3, 1.5, sp[i % 5], null); c.restore(); }
  circ(c, 0, 0, 44, null); circ(c, 0, 0, 14, null);
};
S.stapler = (c) => {
  rect(c, -46, 0, 92, 16, 6, '#343a40');
  rect(c, -44, -20, 86, 20, 8, '#e03131');
  hl(c, -10, -14, 28, 4, 0.4);
};
S.coin = (c, v = 0) => {
  const col = ['#ffd43b', '#ced4da', '#e8590c'][v % 3];
  circ(c, 0, 0, 44, rg(c, 0, 0, 44, [U.shade(col, 0.5), col, U.shade(col, -0.35)]));
  circ(c, 0, 0, 34, null, U.shade(col, -0.4), 3);
  c.fillStyle = U.shade(col, -0.45); c.font = 'bold 34px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(v === 1 ? '5' : '1', 0, 2);
  hl(c, -16, -18, 14, 6, 0.5);
};
S.stickynote = (c, v = 0) => {
  const col = ['#ffec99', '#ffc9c9', '#b2f2bb', '#a5d8ff'][v % 4];
  c.save(); c.rotate((v % 3 - 1) * 0.15);
  poly(c, [-40, -40, 40, -40, 40, 26, 26, 40, -40, 40], col);
  poly(c, [40, 26, 26, 26, 26, 40], U.shade(col, -0.2));
  for (let i = 0; i < 4; i++) line(c, -30, -22 + i * 13, 20 - (i % 2) * 14, -22 + i * 13, U.rgba(OL, 0.5), 2);
  c.restore();
};
S.book = (c, v = 0) => {
  const col = PAL.bright[v % 8];
  rect(c, -34, -44, 68, 88, 4, U.shade(col, -0.1));
  rect(c, -34, -44, 12, 88, 3, U.shade(col, -0.35));
  rect(c, -14, -28, 38, 14, 2, U.rgba('#fff', 0.7), null);
};
S.lamp = (c) => {
  circ(c, 20, 30, 18, '#495057');
  line(c, 20, 30, -8, -4, OL, 9); line(c, 20, 30, -8, -4, '#adb5bd', 5);
  line(c, -8, -4, 16, -32, OL, 9); line(c, -8, -4, 16, -32, '#adb5bd', 5);
  c.save(); c.translate(16, -32); c.rotate(0.6); poly(c, [-10, -6, 10, -6, 26, 20, -26, 20], '#2f9e44'); ell(c, 0, 20, 26, 6, 0, '#fff3bf'); c.restore();
};
S.rack = (c) => {
  rect(c, -50, 10, 100, 14, 4, '#c48a5a');
  ['#ff6b6b', '#51cf66', '#339af0', '#fcc419', '#cc5de8'].forEach((col, i) => {
    const x = -40 + i * 20;
    rect(c, x - 7, -40, 14, 56, 7, U.rgba('#e7f5ff', 0.6));
    c.save(); U.roundRect(c, x - 7, -40, 14, 56, 7); c.clip(); c.fillStyle = col; c.fillRect(x - 8, -10 + i * 3, 16, 40); c.restore();
    rect(c, x - 7, -40, 14, 56, 7, null);
  });
  rect(c, -50, -6, 100, 8, 3, '#d8a37a');
};

// ============================================================
//  ГЛАВА 1 — Коридоры НИИ
// ============================================================
S.wrapper = (c, v = 0) => {
  const col = PAL.bright[v % 7];
  poly(c, [-24, -14, -50, -26, -44, 0, -50, 26, -24, 14], U.shade(col, -0.15));
  poly(c, [24, -14, 50, -26, 44, 0, 50, 26, 24, 14], U.shade(col, -0.15));
  ell(c, 0, 0, 28, 18, 0, lg(c, 0, -18, 0, 18, [U.shade(col, 0.4), col, U.shade(col, -0.25)]));
  line(c, -14, -6, 14, -6, U.rgba('#fff', 0.6), 3);
};
S.cup = (c) => {
  poly(c, [-28, -40, 28, -40, 20, 44, -20, 44], '#f8f9fa');
  rect(c, -32, -46, 64, 10, 4, '#dee2e6');
  rect(c, -26, -10, 52, 20, 2, '#e03131', null);
  poly(c, [-28, -40, 28, -40, 20, 44, -20, 44], null);
};
S.chair = (c) => {
  for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU - Math.PI / 2; line(c, 0, 0, Math.cos(a) * 44, Math.sin(a) * 44, OL, 9); line(c, 0, 0, Math.cos(a) * 44, Math.sin(a) * 44, '#495057', 5); circ(c, Math.cos(a) * 44, Math.sin(a) * 44, 6, '#212529'); }
  rect(c, -30, -26, 60, 56, 14, rg(c, 0, 0, 40, ['#5c7cfa', '#364fc7', '#1c2a6b']));
  rect(c, -32, -42, 64, 18, 8, '#364fc7');
};
S.plant = (c, v = 0) => {
  circ(c, 0, 0, 30, rg(c, 0, 0, 30, ['#e8a87c', '#c0703c', '#7a3e17']));
  const col = ['#40c057', '#2f9e44', '#69db7c'][v % 3];
  for (let i = 0; i < 9; i++) { const a = (i / 9) * TAU + v; c.save(); c.rotate(a); ell(c, 26, 0, 24, 9, 0, i % 2 ? col : U.shade(col, -0.2), OL, 2.5); line(c, 6, 0, 44, 0, U.shade(col, -0.4), 1.5); c.restore(); }
  circ(c, 0, 0, 10, '#5c3d1e', null);
};
S.extinguisher = (c) => {
  rect(c, -16, -36, 32, 80, 14, lg(c, -16, 0, 16, 0, ['#ff8787', '#e03131', '#a61e1e']));
  rect(c, -8, -48, 16, 14, 3, '#343a40');
  c.beginPath(); c.moveTo(6, -44); c.quadraticCurveTo(34, -44, 30, -10); c.lineWidth = 5; c.strokeStyle = OL; c.stroke();
  rect(c, -12, -6, 24, 18, 2, '#fff', OL, 2);
};
S.cooler = (c) => {
  rect(c, -24, -4, 48, 50, 6, '#e9ecef');
  rect(c, -20, -50, 40, 46, 16, U.rgba('#74c0fc', 0.75));
  rect(c, -10, 10, 8, 6, 2, '#e03131', null); rect(c, 4, 10, 8, 6, 2, '#1c7ed6', null);
  hl(c, -8, -32, 6, 12, 0.6);
};
S.trashbin = (c) => {
  circ(c, 0, 0, 44, '#868e96');
  circ(c, 0, 0, 36, '#495057');
  [[-10, -8, '#fff'], [10, 6, '#ffec99'], [-4, 14, '#fff'], [14, -14, '#a5d8ff']].forEach(([x, y, col]) => blob(c, x, y, 12, 7, 0.3, x, col, OL, 2));
};
S.vending = (c) => {
  rect(c, -34, -48, 68, 96, 6, '#e03131');
  rect(c, -26, -40, 38, 66, 3, '#a5d8ff');
  for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) rect(c, -23 + k * 12, -36 + r * 16, 9, 12, 2, PAL.bright[(r + k) % 7], OL, 1);
  rect(c, 16, -40, 12, 30, 2, '#343a40'); rect(c, -26, 32, 38, 10, 2, '#212529');
};
S.desk = (c) => {
  rect(c, -50, -32, 100, 64, 5, lg(c, 0, -32, 0, 32, ['#d4a373', '#b5835a', '#8b5e34']));
  rect(c, -20, -26, 40, 26, 3, '#212529'); rect(c, -17, -23, 34, 20, 2, '#4dabf7', null);
  rect(c, -18, 6, 36, 12, 2, '#dee2e6', OL, 2);
  rect(c, 26, -20, 18, 24, 1, '#fff', OL, 1.5); circ(c, -36, 10, 8, '#e03131', OL, 2);
};
S.computer = (c) => {
  rect(c, -46, -40, 92, 62, 6, '#343a40');
  rect(c, -40, -34, 80, 50, 3, lg(c, 0, -34, 0, 16, ['#4dabf7', '#1864ab']));
  c.fillStyle = '#b2f2bb'; c.font = 'bold 10px monospace'; c.fillText('> ЕДА?', -34, -16); c.fillText('> ДА', -34, -2);
  rect(c, -8, 22, 16, 12, 0, '#495057'); rect(c, -26, 34, 52, 8, 3, '#495057');
};
S.papers = (c) => {
  for (let i = 3; i >= 0; i--) { c.save(); c.rotate(i * 0.12 - 0.15); rect(c, -32, -42, 64, 84, 2, i ? '#f1f3f5' : '#fff', OL, 2); c.restore(); }
  for (let i = 0; i < 6; i++) line(c, -22, -26 + i * 10, 18 - (i % 2) * 10, -26 + i * 10, U.rgba(OL, 0.4), 2);
};
S.keycard = (c, v = 'red') => {
  const col = { red: '#ff3b3b', blue: '#3b8bff', yellow: '#ffd93b', green: '#3bff7a', purple: '#b23bff' }[v] || v;
  c.save(); c.rotate(-0.2);
  rect(c, -44, -28, 88, 56, 8, lg(c, -44, -28, 44, 28, [U.shade(col, 0.45), col, U.shade(col, -0.3)]));
  rect(c, -34, -16, 22, 18, 3, '#ffe066', OL, 2);
  line(c, -34, -8, -12, -8, U.shade('#ffe066', -0.4), 1.5);
  rect(c, 0, -14, 34, 6, 2, U.rgba('#fff', 0.8), null); rect(c, 0, -2, 26, 5, 2, U.rgba('#fff', 0.6), null);
  rect(c, -44, 12, 88, 8, 0, U.rgba('#000', 0.35), null);
  c.restore();
};
S.cactus = (c) => {
  circ(c, 0, 20, 22, '#c0703c');
  rect(c, -14, -44, 28, 66, 14, '#2f9e44');
  rect(c, -38, -20, 18, 30, 9, '#2f9e44'); rect(c, 20, -30, 18, 26, 9, '#2f9e44');
  for (let i = 0; i < 8; i++) line(c, -4 + (i % 2) * 8, -36 + i * 7, -10 + (i % 2) * 20, -38 + i * 7, '#fff', 1.5);
  circ(c, 0, -44, 6, '#ff6b9d', OL, 2);
};
S.clock = (c) => {
  circ(c, 0, 0, 44, '#fff', OL, 6);
  for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; line(c, Math.cos(a) * 34, Math.sin(a) * 34, Math.cos(a) * 40, Math.sin(a) * 40, OL, 3); }
  line(c, 0, 0, 0, -28, OL, 4); line(c, 0, 0, 20, 8, OL, 4); circ(c, 0, 0, 4, '#e03131', null);
};
S.cardbox = (c) => {
  rect(c, -46, -40, 92, 80, 3, lg(c, 0, -40, 0, 40, ['#e0b07a', '#c68b4b', '#a0692e']));
  rect(c, -8, -40, 16, 80, 0, U.rgba('#ffe8a3', 0.6), null);
  line(c, -46, 0, 46, 0, U.rgba(OL, 0.35), 2);
  c.fillStyle = U.rgba(OL, 0.5); c.font = 'bold 11px sans-serif'; c.fillText('↑↑ НЕ ЕСТЬ', -40, 26);
};
S.phone = (c, v = 0) => {
  rect(c, -24, -46, 48, 92, 8, '#212529');
  rect(c, -19, -38, 38, 72, 3, lg(c, 0, -38, 0, 34, [['#845ef7', '#20c997', '#ff6b6b'][v % 3], '#1c1c3c']));
  for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) rect(c, -14 + k * 11, -30 + r * 13, 8, 8, 2, PAL.bright[(r * 3 + k) % 8], null);
  circ(c, 0, 40, 3.5, '#495057', null);
};
S.printer = (c) => {
  rect(c, -46, -20, 92, 46, 8, '#ced4da');
  rect(c, -32, -44, 64, 28, 2, '#fff');
  rect(c, -38, 18, 76, 10, 2, '#495057');
  circ(c, 32, -6, 4, '#51cf66', null); rect(c, -30, 0, 40, 6, 2, '#868e96', null);
};
S.sofa = (c, v = 0) => {
  const col = ['#c92a2a', '#5f3dc4', '#2b8a3e'][v % 3];
  rect(c, -52, -30, 104, 62, 14, U.shade(col, -0.25));
  rect(c, -40, -18, 38, 42, 8, col); rect(c, 2, -18, 38, 42, 8, col);
  rect(c, -52, -30, 104, 16, 8, U.shade(col, -0.1));
};
S.banana = (c) => {
  c.beginPath(); c.moveTo(-44, -10); c.quadraticCurveTo(0, 40, 44, -14); c.quadraticCurveTo(0, 20, -44, -10); c.closePath();
  fs(c, lg(c, 0, -10, 0, 20, ['#fff3a3', '#ffd43b', '#e8a317']), OL, 3);
  rect(c, 40, -20, 8, 10, 2, '#5c3d1e', null);
};

// ============================================================
//  ГЛАВА 1 — Мастерская Дани
// ============================================================
S.bolt = (c) => {
  const hex = r => { const p = []; for (let i = 0; i < 6; i++) p.push(Math.cos(i * TAU / 6) * r, Math.sin(i * TAU / 6) * r); return p; };
  poly(c, hex(42), rg(c, 0, 0, 42, ['#f1f3f5', '#adb5bd', '#495057']));
  poly(c, hex(30), null, U.rgba('#000', 0.2), 3);
  hl(c, -14, -16, 12, 6);
};
S.nut = (c) => {
  const p = []; for (let i = 0; i < 6; i++) p.push(Math.cos(i * TAU / 6 + 0.5) * 44, Math.sin(i * TAU / 6 + 0.5) * 44);
  poly(c, p, rg(c, 0, 0, 44, ['#e9ecef', '#868e96', '#343a40']));
  circ(c, 0, 0, 18, '#1e1e24'); circ(c, 0, 0, 18, null, '#adb5bd', 2);
};
S.gear = (c, v = 0) => {
  const col = ['#adb5bd', '#ffa94d', '#74c0fc', '#ffd43b'][v % 4];
  c.beginPath();
  for (let i = 0; i < 12; i++) {
    const a0 = (i / 12) * TAU, a1 = a0 + TAU / 24;
    c.lineTo(Math.cos(a0) * 34, Math.sin(a0) * 34); c.lineTo(Math.cos(a0 + 0.06) * 46, Math.sin(a0 + 0.06) * 46);
    c.lineTo(Math.cos(a1 - 0.06) * 46, Math.sin(a1 - 0.06) * 46); c.lineTo(Math.cos(a1) * 34, Math.sin(a1) * 34);
  }
  c.closePath(); fs(c, rg(c, 0, 0, 46, [U.shade(col, 0.45), col, U.shade(col, -0.35)]), OL, 3);
  circ(c, 0, 0, 12, '#212529');
  for (let i = 0; i < 4; i++) circ(c, Math.cos(i * TAU / 4 + 0.78) * 22, Math.sin(i * TAU / 4 + 0.78) * 22, 5, U.shade(col, -0.4), null);
};
S.spring = (c) => {
  c.lineCap = 'round';
  for (const [w, col] of [[8, OL], [4, '#ced4da']]) {
    c.beginPath(); for (let i = 0; i <= 60; i++) { const t = i / 60, x = -46 + t * 92, y = Math.sin(t * TAU * 6) * 20; i ? c.lineTo(x, y) : c.moveTo(x, y); }
    c.lineWidth = w; c.strokeStyle = col; c.stroke();
  }
};
S.battery = (c) => {
  rect(c, -44, -18, 82, 36, 8, '#212529');
  rect(c, 2, -18, 36, 36, 6, '#f08c00', null);
  rect(c, 38, -9, 9, 18, 3, '#adb5bd');
  rect(c, -44, -18, 82, 36, 8, null);
  c.fillStyle = '#fff'; c.font = 'bold 16px sans-serif'; c.fillText('+', 16, 6); c.fillText('−', -30, 6);
  hl(c, -10, -10, 22, 3, 0.4);
};
S.chip = (c) => {
  for (let i = 0; i < 5; i++) for (const s of [-1, 1]) { rect(c, -30 + i * 14, s * 34 - 6, 6, 12, 1, '#dee2e6', OL, 1.5); rect(c, s * 34 - 6, -30 + i * 14, 12, 6, 1, '#dee2e6', OL, 1.5); }
  rect(c, -32, -32, 64, 64, 4, '#212529');
  rect(c, -20, -20, 40, 40, 2, '#343a40', '#495057', 2);
  c.fillStyle = '#69db7c'; c.font = 'bold 10px monospace'; c.fillText('DANYA', -17, 4);
};
S.wrench = (c) => {
  c.save(); c.rotate(-0.6);
  rect(c, -10, -6, 66, 12, 6, '#adb5bd');
  c.beginPath(); c.arc(-22, 0, 20, 0.6, TAU - 0.6); c.lineTo(-8, -6); c.lineTo(-14, 0); c.lineTo(-8, 6); c.closePath(); fs(c, '#ced4da', OL, 3);
  c.restore();
};
S.toolbox = (c) => {
  rect(c, -48, -22, 96, 52, 6, lg(c, 0, -22, 0, 30, ['#ff6b6b', '#e03131', '#a61e1e']));
  rect(c, -20, -38, 40, 18, 6, null, OL, 6); rect(c, -20, -38, 40, 18, 6, null, '#adb5bd', 3);
  rect(c, -48, -6, 96, 6, 0, '#a61e1e', null); rect(c, -8, -10, 16, 12, 2, '#ffd43b', OL, 2);
};
S.drill = (c) => {
  rect(c, -40, -20, 60, 30, 10, '#fcc419');
  poly(c, [-16, 6, 4, 6, 10, 44, -10, 44], '#212529');
  rect(c, 18, -12, 14, 14, 2, '#495057');
  poly(c, [32, -9, 54, -5, 54, -1, 32, 3], '#ced4da');
  rect(c, -12, 30, 20, 14, 3, '#495057');
};
S.minibot = (c, v = 0) => {
  const col = ['#74c0fc', '#ff8787', '#b2f2bb', '#ffd43b'][v % 4];
  line(c, 0, -30, 0, -46, OL, 3); circ(c, 0, -46, 5, '#ff6b6b');
  rect(c, -28, -32, 56, 40, 10, col);
  rect(c, -20, -24, 40, 22, 6, '#212529');
  circ(c, -9, -13, 5, '#69db7c', null); circ(c, 9, -13, 5, '#69db7c', null);
  rect(c, -22, 8, 44, 28, 6, U.shade(col, -0.2));
  circ(c, -16, 40, 7, '#343a40'); circ(c, 16, 40, 7, '#343a40');
};
S.crate = (c) => {
  rect(c, -46, -46, 92, 92, 4, lg(c, -46, -46, 46, 46, ['#e0a96d', '#b5793f', '#8a5426']));
  rect(c, -38, -38, 76, 76, 2, null, U.rgba(OL, 0.5), 3);
  line(c, -38, -38, 38, 38, '#8a5426', 8); line(c, -38, -38, 38, 38, OL, 2);
  for (let i = 0; i < 4; i++) circ(c, (i % 2 ? 40 : -40), (i < 2 ? -40 : 40), 3, '#495057', null);
};
S.barrel = (c, v = 0) => {
  const col = ['#1971c2', '#e03131', '#2b8a3e', '#f59f00'][v % 4];
  circ(c, 0, 0, 44, rg(c, 0, 0, 44, [U.shade(col, 0.35), col, U.shade(col, -0.35)]));
  circ(c, 0, 0, 34, null, U.shade(col, -0.45), 3); circ(c, 0, 0, 22, null, U.shade(col, -0.45), 2);
  circ(c, 14, -14, 5, '#adb5bd');
  if (v === 3) { c.fillStyle = OL; c.font = 'bold 22px sans-serif'; c.textAlign = 'center'; c.fillText('☢', 0, 8); }
};
S.tire = (c) => {
  circ(c, 0, 0, 46, '#212529');
  for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU; line(c, Math.cos(a) * 38, Math.sin(a) * 38, Math.cos(a) * 46, Math.sin(a) * 46, '#495057', 4); }
  circ(c, 0, 0, 22, '#ced4da'); circ(c, 0, 0, 8, '#495057');
};
S.oilcan = (c) => {
  rect(c, -34, -26, 60, 58, 8, '#2b8a3e');
  poly(c, [26, -18, 54, -34, 56, -28, 26, -6], '#adb5bd');
  rect(c, -16, -40, 24, 16, 4, '#ced4da');
  c.fillStyle = '#ffd43b'; c.font = 'bold 14px sans-serif'; c.fillText('OIL', -22, 10);
};
S.screwdriver = (c) => {
  rect(c, -48, -12, 44, 24, 10, '#f03e3e');
  for (let i = 0; i < 3; i++) line(c, -40 + i * 12, -10, -40 + i * 12, 10, U.rgba('#000', 0.3), 3);
  rect(c, -6, -4, 46, 8, 2, '#ced4da'); rect(c, 38, -6, 12, 12, 1, '#868e96');
};
S.vacpart = (c, v = 0) => { // обломки пылесоса
  const col = ['#ffd43b', '#495057', '#e03131'][v % 3];
  poly(c, [-40, -20, 10, -38, 44, -6, 20, 36, -30, 28], lg(c, -40, -40, 40, 40, [U.shade(col, 0.4), col, U.shade(col, -0.3)]));
  circ(c, 0, 0, 8, '#212529'); line(c, -20, 10, 20, -16, U.rgba('#000', 0.3), 3);
};
