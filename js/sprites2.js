'use strict';
// ============================================================
//  Спрайты, часть 2: город, канализация, база, океан, вулкан,
//  Земля, космос, станция Молгелевича, бонусы. + кэш спрайтов.
// ============================================================

// ---------------- ГЛАВА 2: Город ----------------
S.leaf = (c, v = 0) => {
  const col = ['#69db7c', '#ffa94d', '#ff6b6b', '#ffd43b'][v % 4];
  c.save(); c.rotate(0.4);
  c.beginPath(); c.moveTo(-46, 0); c.quadraticCurveTo(0, -36, 46, 0); c.quadraticCurveTo(0, 36, -46, 0); c.closePath();
  fs(c, lg(c, 0, -30, 0, 30, [U.shade(col, 0.3), col, U.shade(col, -0.3)]), OL, 3);
  line(c, -46, 0, 40, 0, U.shade(col, -0.45), 2);
  for (let i = 0; i < 4; i++) { line(c, -26 + i * 16, 0, -14 + i * 16, -14, U.shade(col, -0.45), 1.5); line(c, -26 + i * 16, 0, -14 + i * 16, 14, U.shade(col, -0.45), 1.5); }
  c.restore();
};
S.can = (c, v = 0) => {
  const col = ['#e03131', '#1c7ed6', '#2f9e44', '#f08c00'][v % 4];
  c.save(); c.rotate(0.9);
  rect(c, -20, -44, 40, 88, 8, lg(c, -20, 0, 20, 0, [U.shade(col, -0.3), U.shade(col, 0.35), col, U.shade(col, -0.35)]));
  rect(c, -20, -44, 40, 10, 4, '#ced4da'); rect(c, -20, 34, 40, 10, 4, '#ced4da');
  c.fillStyle = '#fff'; c.font = 'bold 13px sans-serif'; c.save(); c.rotate(-Math.PI / 2); c.fillText('КОЛА', -18, 5); c.restore();
  c.restore();
};
S.pigeon = (c) => {
  ell(c, -4, 0, 34, 22, 0, rg(c, -4, 0, 34, ['#ced4da', '#868e96', '#495057']));
  poly(c, [-30, -6, -54, -14, -54, 14, -30, 6], '#495057');
  ell(c, 0, -10, 20, 10, -0.2, '#adb5bd', OL, 2);
  circ(c, 28, 0, 13, '#6c757d'); ell(c, 22, 0, 6, 10, 0, U.rgba('#40c057', 0.6), null);
  poly(c, [38, -3, 48, 0, 38, 3], '#ffa94d', OL, 2); circ(c, 32, -4, 2.5, '#fd7e14', OL, 1);
};
S.cat = (c, v = 0) => {
  const col = ['#ffa94d', '#495057', '#f8f9fa', '#c68642'][v % 4];
  c.beginPath(); c.moveTo(-30, 4); c.quadraticCurveTo(-56, 10, -50, -24); c.lineWidth = 9; c.strokeStyle = OL; c.stroke(); c.lineWidth = 5; c.strokeStyle = col; c.stroke();
  ell(c, -6, 4, 32, 22, 0, col);
  circ(c, 26, -4, 18, col);
  poly(c, [16, -16, 18, -32, 28, -20], col); poly(c, [30, -20, 40, -32, 40, -14], col);
  eyes(c, 26, -6, 7, 4); circ(c, 27, 3, 2.5, '#ff8787', null);
  if (v === 0) for (let i = 0; i < 3; i++) line(c, -20 + i * 10, -14, -16 + i * 10, -4, U.shade(col, -0.35), 3);
};
S.dog = (c, v = 0) => {
  const col = ['#d9a066', '#f8f9fa', '#343a40', '#a0522d'][v % 4];
  line(c, -34, -6, -48, -20, OL, 8); line(c, -34, -6, -48, -20, col, 4);
  ell(c, -4, 6, 34, 22, 0, col);
  for (const x of [-24, 16]) { rect(c, x - 5, 18, 10, 22, 4, U.shade(col, -0.15)); }
  circ(c, 28, -8, 20, col);
  ell(c, 18, -16, 7, 14, 0.4, U.shade(col, -0.35));
  ell(c, 42, -2, 10, 8, 0, U.shade(col, 0.2), OL, 2); circ(c, 50, -4, 4, OL, null);
  eyes(c, 30, -14, 6, 4);
  c.beginPath(); c.arc(44, 6, 5, 0, Math.PI); fs(c, '#ff6b6b', OL, 1.5);
};
S.person = (c, v = 0) => { // маленький прохожий
  const shirt = PAL.bright[v % 8 === 7 ? 4 : v % 8], skin = PAL.skin[v % 5], hair = PAL.hair[(v * 3) % 6];
  rect(c, -12, 18, 10, 28, 4, '#343a40'); rect(c, 2, 18, 10, 28, 4, '#343a40');
  rect(c, -20, -10, 40, 34, 10, shirt);
  line(c, -18, -4, -28, 18, OL, 7); line(c, -18, -4, -28, 18, skin, 4); line(c, 18, -4, 28, 18, OL, 7); line(c, 18, -4, 28, 18, skin, 4);
  circ(c, 0, -26, 18, skin);
  c.beginPath(); c.arc(0, -28, 18, Math.PI * 1.05, Math.PI * 1.95); c.closePath(); fs(c, hair, OL, 2.5);
  eyes(c, 0, -24, 6, 3.5, 2);
  circ(c, 0, -14, 3, OL, null);
};
S.bike = (c) => {
  circ(c, -30, 12, 18, null, OL, 5); circ(c, 30, 12, 18, null, OL, 5);
  poly(c, [-30, 12, -6, -12, 22, -12, 30, 12, 0, 12], null, '#e03131', 5, true);
  line(c, -6, -12, -10, -22, OL, 4); rect(c, -18, -26, 16, 6, 3, OL, null);
  line(c, 22, -12, 24, -26, OL, 4); line(c, 18, -26, 32, -26, OL, 4);
};
S.bench = (c) => {
  rect(c, -50, -20, 100, 40, 4, '#495057');
  for (let i = 0; i < 4; i++) rect(c, -48, -18 + i * 10, 96, 7, 2, '#c48a5a', OL, 1.5);
};
S.hydrant = (c) => {
  circ(c, 0, 0, 30, rg(c, 0, 0, 30, ['#ff8787', '#e03131', '#8b1a1a']));
  rect(c, -46, -8, 92, 16, 6, '#c92a2a'); circ(c, 0, 0, 14, '#ffd43b'); circ(c, 0, 0, 5, '#495057');
};
S.mailbox = (c) => {
  rect(c, -30, -40, 60, 80, 10, '#1c7ed6');
  rect(c, -20, -24, 40, 8, 3, '#212529'); c.fillStyle = '#ffd43b'; c.font = 'bold 14px sans-serif'; c.fillText('ПОЧТА', -24, 18);
};
S.streettrash = (c) => {
  circ(c, 0, 0, 40, '#2b8a3e'); circ(c, 0, 0, 30, '#1b5e20');
  blob(c, -6, 0, 14, 7, 0.3, 3, '#f8f9fa', OL, 2); blob(c, 10, 8, 10, 7, 0.3, 5, '#ffd43b', OL, 2);
};
S.car = (c, v = 0) => { // вид сверху, нос вправо
  const col = PAL.car[v % 8];
  for (const [x, y] of [[-26, -24], [26, -24], [-26, 24], [26, 24]]) rect(c, x - 9, y - 5, 18, 10, 3, '#212529');
  rect(c, -50, -24, 100, 48, 14, lg(c, 0, -24, 0, 24, [U.shade(col, 0.3), col, U.shade(col, -0.3)]));
  rect(c, -18, -19, 44, 38, 8, U.shade(col, -0.15));
  rect(c, 12, -17, 14, 34, 4, '#a5d8ff'); rect(c, -20, -16, 10, 32, 3, '#74c0fc');
  rect(c, 44, -18, 6, 8, 2, '#fff3bf', null); rect(c, 44, 10, 6, 8, 2, '#fff3bf', null);
  rect(c, -50, -18, 4, 8, 1, '#ff6b6b', null); rect(c, -50, 10, 4, 8, 1, '#ff6b6b', null);
};
S.bus = (c, v = 0) => {
  const col = ['#ffd43b', '#e03131', '#228be6'][v % 3];
  rect(c, -54, -20, 108, 40, 6, col);
  for (let i = 0; i < 6; i++) rect(c, -42 + i * 15, -16, 10, 32, 2, U.shade(col, -0.15), null);
  rect(c, 44, -17, 8, 34, 2, '#a5d8ff');
  circ(c, -30, 0, 4, '#495057', null); circ(c, 10, 0, 4, '#495057', null);
};
S.truck = (c, v = 0) => {
  const col = PAL.car[(v + 2) % 8];
  rect(c, -54, -22, 74, 44, 3, '#e9ecef');
  rect(c, 22, -20, 32, 40, 8, col); rect(c, 42, -17, 8, 34, 2, '#a5d8ff');
  line(c, -50, 0, 18, 0, U.rgba(OL, 0.3), 2); c.fillStyle = U.shade(col, -0.2); c.font = 'bold 12px sans-serif'; c.fillText('ГРУЗ', -36, -4);
};
S.tree = (c, v = 0) => { // крона сверху
  const col = ['#40c057', '#2b8a3e', '#82c91e', '#ffa94d'][v % 4];
  c.save(); c.globalAlpha = 0.25; circ(c, 6, 8, 46, '#000', null); c.restore();
  for (let i = 0; i < 7; i++) { const a = (i / 7) * TAU + v; circ(c, Math.cos(a) * 24, Math.sin(a) * 24, 22, U.shade(col, -0.15)); }
  circ(c, 0, 0, 30, rg(c, 0, 0, 30, [U.shade(col, 0.35), col, U.shade(col, -0.2)]), null);
  for (let i = 0; i < 5; i++) { const a = i * 1.3 + v; circ(c, Math.cos(a) * 14 - 4, Math.sin(a) * 14 - 4, 8, U.shade(col, 0.2), null); }
};
S.kiosk = (c) => {
  rect(c, -46, -36, 92, 72, 4, '#f8f9fa');
  for (let i = 0; i < 6; i++) rect(c, -46 + i * 15.3, -36, 15.3, 22, 0, i % 2 ? '#e03131' : '#fff', OL, 1.5);
  rect(c, -34, -6, 68, 30, 3, '#ffe066'); c.fillStyle = OL; c.font = 'bold 12px sans-serif'; c.fillText('ШАУРМА', -26, 14);
};
S.house = (c, v = 0) => { // крыша сверху
  const col = ['#c92a2a', '#5c7cfa', '#2b8a3e', '#e67700', '#868e96'][v % 5];
  c.save(); c.globalAlpha = 0.25; rect(c, -40, -36, 96, 84, 4, '#000', null); c.restore();
  rect(c, -48, -42, 96, 84, 3, U.shade(col, -0.2));
  poly(c, [-48, -42, 48, -42, 30, 0, -30, 0], U.shade(col, 0.15), OL, 2);
  poly(c, [-48, 42, 48, 42, 30, 0, -30, 0], U.shade(col, -0.1), OL, 2);
  poly(c, [-48, -42, -30, 0, -48, 42], col, OL, 2); poly(c, [48, -42, 30, 0, 48, 42], col, OL, 2);
  rect(c, 14, -30, 12, 14, 1, '#868e96', OL, 2);
};
S.building = (c, v = 0) => { // плоская крыша небоскрёба
  const col = ['#adb5bd', '#748ffc', '#e9ecef', '#ffd8a8', '#96f2d7'][v % 5];
  c.save(); c.globalAlpha = 0.3; rect(c, -40, -40, 100, 100, 3, '#000', null); c.restore();
  rect(c, -50, -50, 100, 100, 3, lg(c, -50, -50, 50, 50, [U.shade(col, 0.25), col, U.shade(col, -0.25)]));
  rect(c, -42, -42, 84, 84, 2, null, U.rgba(OL, 0.4), 2);
  rect(c, -30, -30, 24, 18, 2, '#868e96', OL, 2); rect(c, 10, 14, 26, 20, 2, '#868e96', OL, 2);
  circ(c, 20, -20, 10, '#495057', OL, 2); for (let i = 0; i < 4; i++) line(c, 20, -20, 20 + Math.cos(i * 1.57) * 9, -20 + Math.sin(i * 1.57) * 9, '#adb5bd', 2);
  if (v % 2) { circ(c, -22, 24, 14, '#ffd43b', OL, 2); c.fillStyle = OL; c.font = 'bold 16px sans-serif'; c.textAlign = 'center'; c.fillText('H', -22, 30); }
};
S.fountain = (c) => {
  circ(c, 0, 0, 46, '#ced4da'); circ(c, 0, 0, 38, rg(c, 0, 0, 38, ['#a5d8ff', '#4dabf7', '#1864ab']));
  circ(c, 0, 0, 12, '#adb5bd');
  for (let i = 0; i < 8; i++) { const a = i * TAU / 8; circ(c, Math.cos(a) * 22, Math.sin(a) * 22, 3, '#fff', null); }
};
S.streetlamp = (c) => {
  circ(c, 0, 0, 14, '#495057');
  c.save(); c.globalAlpha = 0.35; circ(c, 0, 0, 46, '#fff3bf', null); c.restore();
  circ(c, 0, 0, 8, '#fff3bf', OL, 2);
};
S.shawarma = (c) => {
  c.save(); c.rotate(-0.5);
  rect(c, -20, -46, 40, 92, 18, lg(c, -20, 0, 20, 0, ['#f4d19b', '#e9b872', '#c58b44']));
  ell(c, 0, -40, 18, 10, 0, '#e8d5b0');
  circ(c, -6, -42, 5, '#e03131', null); circ(c, 6, -40, 4, '#69db7c', null); circ(c, 0, -36, 4, '#fff', null);
  for (let i = 0; i < 5; i++) line(c, -18, -20 + i * 14, 18, -14 + i * 14, U.rgba('#8b5a2b', 0.4), 2);
  rect(c, -20, 10, 40, 36, 14, '#fff', OL, 2);
  c.restore();
};
S.icecart = (c) => {
  rect(c, -46, -26, 80, 52, 6, '#fff');
  rect(c, -46, -26, 80, 14, 4, '#ff8fab');
  circ(c, 38, 0, 12, '#868e96'); circ(c, -20, 30, 8, '#212529'); circ(c, 20, 30, 8, '#212529');
  circ(c, -24, 4, 8, '#ffc9c9'); circ(c, -6, 4, 8, '#ffec99'); circ(c, 12, 4, 8, '#b2f2bb');
};
S.umbrella = (c, v = 0) => {
  const col = PAL.bright[v % 7];
  for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 46, (i / 8) * TAU, ((i + 1) / 8) * TAU); c.closePath(); fs(c, i % 2 ? col : '#fff', OL, 2); }
  circ(c, 0, 0, 5, OL, null);
};
S.scooter = (c) => {
  rect(c, -40, -8, 80, 16, 6, '#20c997');
  circ(c, -36, 0, 10, '#212529'); circ(c, 36, 0, 10, '#212529');
  line(c, 32, 0, 38, -34, OL, 4); line(c, 28, -34, 48, -34, OL, 5);
};
S.pizza = (c) => {
  poly(c, [0, 46, -40, -34, 40, -34], '#ffd43b');
  rect(c, -42, -42, 84, 12, 6, '#d9822b');
  [[-14, -18], [12, -14], [0, 8], [-6, -2], [14, 6]].forEach(([x, y], i) => circ(c, x, y, i % 2 ? 6 : 7, i % 2 ? '#2f9e44' : '#e03131', OL, 1.5));
};

// ---------------- ГЛАВА 2: Канализация ----------------
S.rat = (c) => {
  c.beginPath(); c.moveTo(-30, 0); c.bezierCurveTo(-46, 14, -50, -16, -60, -4); c.lineWidth = 5; c.strokeStyle = '#d6a5a5'; c.stroke();
  ell(c, -4, 0, 32, 20, 0, rg(c, -4, 0, 32, ['#a1887f', '#6d4c41', '#3e2723']));
  ell(c, 28, 0, 18, 13, 0, '#6d4c41');
  circ(c, 20, -14, 8, '#bcaaa4'); circ(c, 20, 14, 8, '#bcaaa4');
  circ(c, 44, 0, 4, '#ff8a80', null); circ(c, 34, -6, 3, '#ff1744', null); circ(c, 34, 6, 3, '#ff1744', null);
};
S.slime = (c, v = 0) => {
  const col = ['#94d82d', '#66d9e8', '#da77f2'][v % 3];
  c.save(); c.globalAlpha = 0.85;
  blob(c, 0, 4, 42, 10, 0.18, v * 2 + 4, rg(c, 0, 0, 44, [U.shade(col, 0.5), col, U.shade(col, -0.3)]), U.shade(col, -0.5), 3);
  c.restore();
  eyes(c, 0, -4, 9, 6); smile(c, 0, 12, 8);
  hl(c, -16, -14, 10, 5, 0.6);
};
S.garbagebag = (c) => {
  blob(c, 0, 6, 40, 9, 0.12, 9, rg(c, 0, 0, 44, ['#495057', '#212529', '#000']));
  poly(c, [-8, -32, 8, -32, 14, -48, -14, -48], '#212529');
  rect(c, -10, -36, 20, 6, 3, '#ffd43b', null);
  hl(c, -14, -6, 10, 18, 0.18);
};
S.duck = (c) => {
  ell(c, -4, 10, 36, 26, 0, rg(c, -4, 10, 36, ['#fff3a3', '#ffd43b', '#e8a317']));
  circ(c, 16, -16, 20, '#ffd43b');
  ell(c, 38, -12, 12, 6, 0, '#ff922b'); circ(c, 20, -20, 4, OL, null);
  c.beginPath(); c.arc(-6, 6, 14, 0.2, 2.6); c.lineWidth = 3; c.strokeStyle = '#e8a317'; c.stroke();
};
S.ring = (c) => {
  circ(c, 0, 8, 34, null, OL, 14); circ(c, 0, 8, 34, null, '#ffd43b', 8);
  poly(c, [-14, -30, 14, -30, 22, -40, 0, -54, -22, -40], '#91e8ff');
  line(c, -14, -30, 0, -54, U.rgba('#fff', 0.7), 2);
};
S.mushroom = (c, v = 0) => {
  const col = ['#3bc9db', '#cc5de8', '#94d82d'][v % 3];
  c.save(); c.globalAlpha = 0.35; circ(c, 0, 0, 48, U.rgba(col, 0.6), null); c.restore();
  rect(c, -10, -4, 20, 34, 6, '#f1f3f5');
  c.beginPath(); c.arc(0, -4, 34, Math.PI, 0); c.closePath(); fs(c, rg(c, 0, -10, 34, [U.shade(col, 0.6), col, U.shade(col, -0.3)]), OL, 3);
  circ(c, -14, -18, 5, U.shade(col, 0.7), null); circ(c, 10, -24, 4, U.shade(col, 0.7), null); circ(c, 18, -10, 3, U.shade(col, 0.7), null);
};
S.croc = (c) => { // вид сверху
  poly(c, [-56, 0, -30, -8, -30, 8], '#2b8a3e');
  for (const [x, s] of [[-14, -1], [-14, 1], [18, -1], [18, 1]]) ell(c, x, s * 20, 8, 12, s * 0.5, '#2f9e44');
  ell(c, -4, 0, 30, 16, 0, rg(c, -4, 0, 30, ['#69db7c', '#2f9e44', '#1b5e20']));
  for (let i = 0; i < 5; i++) circ(c, -22 + i * 9, 0, 3, '#1b5e20', null);
  poly(c, [24, -12, 58, -8, 58, 8, 24, 12], '#37b24d');
  for (let i = 0; i < 5; i++) { poly(c, [30 + i * 6, -9, 33 + i * 6, -13, 36 + i * 6, -9], '#fff', OL, 1); poly(c, [30 + i * 6, 9, 33 + i * 6, 13, 36 + i * 6, 9], '#fff', OL, 1); }
  circ(c, 28, -10, 5, '#ffd43b'); circ(c, 28, 10, 5, '#ffd43b'); line(c, 28, -13, 28, -7, OL, 2); line(c, 28, 7, 28, 13, OL, 2);
};
S.bone = (c) => {
  rect(c, -34, -8, 68, 16, 6, '#f8f0e3');
  for (const x of [-38, 38]) for (const y of [-9, 9]) circ(c, x, y, 11, '#f8f0e3');
  rect(c, -34, -7, 68, 14, 0, '#f8f0e3', null);
};
S.sock = (c, v = 0) => {
  const col = PAL.bright[(v + 3) % 7];
  c.beginPath(); c.moveTo(-14, -46); c.lineTo(14, -46); c.lineTo(14, 18); c.quadraticCurveTo(14, 40, 40, 34); c.quadraticCurveTo(48, 48, 22, 48); c.quadraticCurveTo(-14, 48, -14, 20); c.closePath(); fs(c, col, OL, 3);
  rect(c, -14, -46, 28, 12, 2, '#fff', OL, 2);
  for (let i = 0; i < 3; i++) line(c, -14, -24 + i * 12, 14, -24 + i * 12, U.shade(col, -0.3), 3);
};
S.boot = (c) => {
  poly(c, [-20, -46, 14, -46, 14, 10, 46, 20, 46, 40, -20, 40], '#5c3d1e');
  rect(c, -24, 34, 74, 10, 3, '#212529');
  for (let i = 0; i < 4; i++) line(c, -14, -34 + i * 10, 8, -34 + i * 10, '#ced4da', 2);
};
S.bottle = (c, v = 0) => {
  const col = ['#2f9e44', '#a5711a', '#4dabf7'][v % 3];
  c.save(); c.rotate(0.7);
  rect(c, -14, -20, 28, 66, 8, U.rgba(col, 0.75)); rect(c, -6, -46, 12, 28, 4, U.rgba(col, 0.75));
  rect(c, -12, 0, 24, 24, 2, '#f8f9fa', OL, 2); line(c, -6, -14, -6, 38, U.rgba('#fff', 0.5), 3);
  c.restore();
};
S.pipejunk = (c) => {
  rect(c, -46, -14, 92, 28, 6, lg(c, 0, -14, 0, 14, ['#adb5bd', '#868e96', '#495057']));
  rect(c, -50, -18, 12, 36, 3, '#495057'); rect(c, 38, -18, 12, 36, 3, '#495057');
  ell(c, 0, 0, 20, 4, 0, U.rgba('#94d82d', 0.6), null);
};

// ---------------- ГЛАВА 2: Военная база ----------------
S.sandbag = (c) => {
  for (let i = 0; i < 4; i++) ell(c, -33 + i * 22, 8, 14, 12, 0, '#c2a878');
  for (let i = 0; i < 3; i++) ell(c, -22 + i * 22, -10, 14, 12, 0, '#d4bb8a');
};
S.ammobox = (c) => {
  rect(c, -46, -28, 92, 56, 3, '#556b2f');
  rect(c, -46, -28, 92, 10, 2, '#3e4f22');
  c.fillStyle = '#ffd43b'; c.font = 'bold 14px sans-serif'; c.fillText('ПАТРОНЫ', -34, 12);
};
S.jeep = (c) => {
  for (const [x, y] of [[-24, -26], [24, -26], [-24, 26], [24, 26]]) rect(c, x - 10, y - 6, 20, 12, 3, '#212529');
  rect(c, -48, -26, 96, 52, 8, '#5c6b38');
  rect(c, -10, -22, 34, 44, 4, '#4a572d'); rect(c, 18, -20, 10, 40, 2, '#a5d8ff');
  [[-38, -14, 10], [-26, 12, 8], [0, -10, 9]].forEach(([x, y, r]) => circ(c, x, y, r, '#3e4a24', null));
  circ(c, -30, 0, 7, '#212529', null);
};
S.tent = (c) => {
  poly(c, [-46, -40, 46, -40, 46, 40, -46, 40], '#6b8e23');
  poly(c, [-46, -40, 0, 0, -46, 40], '#556b2f', OL, 2); poly(c, [46, -40, 0, 0, 46, 40], '#556b2f', OL, 2);
  line(c, -46, -40, 46, 40, OL, 2); line(c, 46, -40, -46, 40, OL, 2);
};
S.guard = (c, v = 0) => {
  const skin = PAL.skin[v % 5];
  rect(c, -12, 18, 10, 28, 4, '#3e4a24'); rect(c, 2, 18, 10, 28, 4, '#3e4a24');
  rect(c, -20, -10, 40, 34, 10, '#5c6b38');
  circ(c, -8, 2, 4, '#3e4a24', null); circ(c, 8, 12, 5, '#3e4a24', null);
  circ(c, 0, -26, 17, skin);
  c.beginPath(); c.arc(0, -30, 19, Math.PI, 0); c.closePath(); fs(c, '#4a572d', OL, 2.5);
  eyes(c, 0, -24, 6, 3.5, 2);
};
S.heli = (c) => { // вертолёт сверху
  rect(c, 6, -5, 50, 10, 4, '#3e4a24');
  rect(c, 48, -14, 6, 28, 2, '#3e4a24');
  ell(c, -6, 0, 30, 20, 0, '#5c6b38');
  ell(c, -24, 0, 12, 14, 0, '#a5d8ff');
  c.save(); c.globalAlpha = 0.5; line(c, -50, -40, 38, 40, '#212529', 6); line(c, -50, 40, 38, -40, '#212529', 6); c.restore();
  circ(c, -6, 0, 6, '#212529');
};
S.fueltank = (c) => {
  circ(c, 0, 0, 46, rg(c, 0, 0, 46, ['#ffe066', '#f59f00', '#a35f00']));
  for (let i = 0; i < 8; i++) { c.save(); c.beginPath(); c.arc(0, 0, 46, (i / 8) * TAU, ((i + 0.5) / 8) * TAU); c.arc(0, 0, 36, ((i + 0.5) / 8) * TAU, (i / 8) * TAU, true); c.closePath(); fs(c, '#212529', null); c.restore(); }
  circ(c, 0, 0, 46, null);
  circ(c, 0, 0, 26, '#e03131'); c.fillStyle = '#fff'; c.font = 'bold 22px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('⛽', 0, 2);
};
S.radar = (c) => {
  rect(c, -20, -20, 40, 40, 4, '#868e96');
  ell(c, 0, -8, 40, 24, -0.3, rg(c, 0, -8, 40, ['#f8f9fa', '#ced4da', '#868e96']));
  line(c, 0, -8, 14, -30, OL, 3); circ(c, 14, -30, 4, '#e03131');
};
S.minitank = (c) => {
  rect(c, -46, -32, 92, 14, 5, '#343a40'); rect(c, -46, 18, 92, 14, 5, '#343a40');
  rect(c, -40, -22, 80, 44, 6, '#5c6b38');
  circ(c, -4, 0, 18, '#4a572d'); rect(c, 10, -5, 44, 10, 2, '#3e4a24');
};
S.cone = (c) => {
  rect(c, -34, -34, 68, 68, 6, '#212529');
  circ(c, 0, 0, 26, '#ff922b'); circ(c, 0, 0, 16, '#fff'); circ(c, 0, 0, 8, '#ff922b');
};
S.porta = (c) => {
  rect(c, -32, -46, 64, 92, 6, '#4dabf7'); rect(c, -24, -36, 48, 70, 3, '#339af0');
  ell(c, 0, -44, 32, 8, 0, '#74c0fc'); circ(c, 18, 0, 4, '#ced4da'); c.fillStyle = '#fff'; c.font = 'bold 12px sans-serif'; c.fillText('WC', -10, -14);
};
S.flag = (c) => {
  line(c, -30, 46, -30, -46, OL, 5);
  c.beginPath(); c.moveTo(-28, -44); c.quadraticCurveTo(0, -54, 40, -40); c.lineTo(40, -6); c.quadraticCurveTo(0, -18, -28, -10); c.closePath(); fs(c, '#e03131', OL, 3);
  c.fillStyle = '#ffd43b'; c.font = 'bold 18px sans-serif'; c.fillText('Д', -2, -20);
};
S.watchtower = (c) => {
  for (const [x, y] of [[-40, -40], [40, -40], [-40, 40], [40, 40]]) circ(c, x, y, 6, '#5c3d1e');
  rect(c, -34, -34, 68, 68, 4, '#8b5e34');
  for (let i = 0; i < 6; i++) line(c, -34, -26 + i * 11, 34, -26 + i * 11, U.rgba(OL, 0.3), 2);
  c.save(); c.globalAlpha = 0.4; poly(c, [0, 0, 60, -30, 60, 30], '#fff3bf', null); c.restore();
};

// ---------------- ГЛАВА 3: Океан ----------------
S.plankton = (c, v = 0) => {
  const col = ['#63e6be', '#91a7ff', '#ffd8a8'][v % 3];
  c.save(); c.globalAlpha = 0.35; circ(c, 0, 0, 48, col, null); c.restore();
  for (let i = 0; i < 6; i++) { const a = i * TAU / 6; line(c, Math.cos(a) * 18, Math.sin(a) * 18, Math.cos(a) * 40, Math.sin(a) * 40, U.shade(col, -0.3), 3); }
  circ(c, 0, 0, 22, rg(c, 0, 0, 22, [U.shade(col, 0.6), col, U.shade(col, -0.3)]), U.shade(col, -0.5), 3);
  circ(c, 0, 0, 7, U.shade(col, -0.4), null);
};
S.shrimp = (c) => {
  for (let i = 0; i < 5; i++) line(c, -10 + i * 9, 10, -14 + i * 9, 26, '#e8590c', 2);
  c.beginPath(); c.arc(0, 0, 32, Math.PI * 0.95, Math.PI * 2.1); c.lineWidth = 22; c.strokeStyle = OL; c.stroke(); c.lineWidth = 17; c.strokeStyle = '#ff8c69'; c.stroke();
  for (let i = 0; i < 5; i++) { const a = Math.PI * (1.1 + i * 0.2); line(c, Math.cos(a) * 24, Math.sin(a) * 24, Math.cos(a) * 40, Math.sin(a) * 40, '#e8590c', 2); }
  poly(c, [-34, 2, -50, -8, -48, 14], '#ff8c69');
  circ(c, 30, 8, 4, OL, null); line(c, 32, 4, 54, -24, '#e8590c', 1.5); line(c, 32, 6, 56, -10, '#e8590c', 1.5);
};
S.fish = (c, v = 0) => {
  const col = ['#ff922b', '#4dabf7', '#ffd43b', '#f06595', '#20c997', '#845ef7'][v % 6];
  poly(c, [-28, 0, -52, -22, -46, 0, -52, 22], U.shade(col, -0.15));
  ell(c, 0, 0, 36, 24, 0, lg(c, 0, -24, 0, 24, [U.shade(col, 0.4), col, U.shade(col, -0.3)]));
  poly(c, [-6, -22, 10, -34, 18, -18], U.shade(col, -0.15)); poly(c, [-2, 22, 10, 30, 14, 18], U.shade(col, -0.15));
  if (v % 2 === 0) for (let i = 0; i < 2; i++) { c.save(); c.beginPath(); c.ellipse(0, 0, 36, 24, 0, 0, TAU); c.clip(); rect(c, -10 + i * 16, -26, 7, 52, 0, '#fff', null); c.restore(); }
  ell(c, 0, 0, 36, 24, 0, null);
  eyes(c, 22, -6, 0, 6); c.beginPath(); c.arc(32, 6, 4, 0.3, 2.4); c.lineWidth = 2; c.strokeStyle = OL; c.stroke();
};
S.jelly = (c, v = 0) => {
  const col = ['#f783ac', '#b197fc', '#66d9e8'][v % 3];
  c.lineCap = 'round';
  for (let i = 0; i < 7; i++) { const x = -26 + i * 9; c.beginPath(); c.moveTo(x, 4); c.bezierCurveTo(x - 8, 20, x + 8, 32, x - 4, 48); c.lineWidth = 3; c.strokeStyle = U.shade(col, -0.2); c.stroke(); }
  c.save(); c.globalAlpha = 0.85;
  c.beginPath(); c.arc(0, 6, 36, Math.PI, 0); c.quadraticCurveTo(26, 14, 18, 8); c.quadraticCurveTo(10, 14, 0, 8); c.quadraticCurveTo(-10, 14, -18, 8); c.quadraticCurveTo(-26, 14, -36, 6); c.closePath();
  fs(c, rg(c, 0, -10, 36, [U.shade(col, 0.6), col, U.shade(col, -0.25)]), U.shade(col, -0.5), 3); c.restore();
  eyes(c, 0, -10, 9, 5); hl(c, -14, -20, 10, 5, 0.6);
};
S.puffer = (c) => {
  for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU; poly(c, [Math.cos(a - 0.1) * 34, Math.sin(a - 0.1) * 34, Math.cos(a) * 48, Math.sin(a) * 48, Math.cos(a + 0.1) * 34, Math.sin(a + 0.1) * 34], '#f8f9fa', OL, 1.5); }
  circ(c, 0, 0, 36, rg(c, 0, 0, 36, ['#fff3bf', '#ffd43b', '#e8a317']));
  for (let i = 0; i < 6; i++) circ(c, Math.cos(i) * 18 - 6, Math.sin(i * 1.7) * 16, 3, '#a35f00', null);
  eyes(c, 10, -6, 10, 6, 1); circ(c, 26, 10, 5, OL, null);
};
S.octopus = (c, v = 0) => {
  const col = ['#e64980', '#ff922b', '#9775fa'][v % 3];
  for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(Math.cos(a + 0.4) * 34, Math.sin(a + 0.4) * 34, Math.cos(a) * 48, Math.sin(a) * 48); c.lineWidth = 12; c.strokeStyle = OL; c.stroke(); c.lineWidth = 8; c.strokeStyle = U.shade(col, -0.1); c.stroke(); }
  circ(c, 0, 0, 28, rg(c, 0, 0, 28, [U.shade(col, 0.4), col, U.shade(col, -0.3)]));
  eyes(c, 0, -4, 9, 6, 1);
};
S.shark = (c) => {
  poly(c, [-36, 0, -58, -20, -50, 0, -58, 20], '#868e96');
  c.beginPath(); c.moveTo(56, 0); c.quadraticCurveTo(30, -24, -40, -8); c.lineTo(-40, 8); c.quadraticCurveTo(30, 24, 56, 0); c.closePath();
  fs(c, lg(c, 0, -20, 0, 20, ['#ced4da', '#868e96', '#495057']), OL, 3);
  poly(c, [0, -14, -16, -34, -20, -12], '#868e96'); poly(c, [0, 14, -16, 34, -20, 12], '#868e96');
  line(c, 10, -10, 30, -8, U.rgba(OL, 0.5), 2);
  circ(c, 38, -6, 3, OL, null); circ(c, 38, 6, 3, OL, null);
};
S.turtle = (c) => {
  for (const [x, y] of [[22, -24], [22, 24], [-22, -22], [-22, 22]]) ell(c, x, y, 12, 8, Math.atan2(y, x), '#8ce99a');
  circ(c, 40, 0, 12, '#8ce99a'); circ(c, 44, -5, 2.5, OL, null); circ(c, 44, 5, 2.5, OL, null);
  ell(c, 0, 0, 34, 28, 0, rg(c, 0, 0, 34, ['#a9e34b', '#5c940d', '#2b5a05']));
  const hex = (x, y, r) => { const p = []; for (let i = 0; i < 6; i++) p.push(x + Math.cos(i * TAU / 6) * r, y + Math.sin(i * TAU / 6) * r); poly(c, p, null, U.rgba(OL, 0.5), 2); };
  hex(0, 0, 10); for (let i = 0; i < 6; i++) hex(Math.cos(i * TAU / 6 + 0.5) * 19, Math.sin(i * TAU / 6 + 0.5) * 17, 8);
};
S.boat = (c, v = 0) => {
  const col = ['#f8f9fa', '#e03131', '#ffd43b'][v % 3];
  c.beginPath(); c.moveTo(54, 0); c.quadraticCurveTo(30, -24, -46, -20); c.lineTo(-46, 20); c.quadraticCurveTo(30, 24, 54, 0); c.closePath();
  fs(c, lg(c, 0, -22, 0, 22, [U.shade(col, 0.3), col, U.shade(col, -0.25)]), OL, 3);
  rect(c, -24, -12, 30, 24, 4, '#a5d8ff'); rect(c, -40, -8, 10, 16, 2, '#495057');
};
S.ship = (c, v = 0) => { // грузовое судно сверху
  const cols = ['#e03131', '#1c7ed6', '#2f9e44', '#f59f00', '#ae3ec9'];
  c.beginPath(); c.moveTo(56, 0); c.quadraticCurveTo(46, -18, 20, -18); c.lineTo(-52, -18); c.lineTo(-52, 18); c.lineTo(20, 18); c.quadraticCurveTo(46, 18, 56, 0); c.closePath();
  fs(c, '#343a40', OL, 3);
  for (let i = 0; i < 5; i++) for (let k = 0; k < 2; k++) rect(c, -30 + i * 12, -14 + k * 14, 11, 13, 1, cols[(i + k + v) % 5], OL, 1.5);
  rect(c, -50, -14, 16, 28, 3, '#f8f9fa'); rect(c, -46, -8, 8, 16, 2, '#a5d8ff');
};
S.buoy = (c) => {
  circ(c, 0, 0, 40, '#e03131'); circ(c, 0, 0, 28, '#fff'); circ(c, 0, 0, 16, '#e03131'); circ(c, 0, 0, 6, '#ffd43b');
};
S.oilrig = (c) => {
  for (const [x, y] of [[-34, -34], [34, -34], [-34, 34], [34, 34]]) circ(c, x, y, 9, '#495057');
  rect(c, -40, -40, 80, 80, 4, '#868e96');
  rect(c, -30, -30, 34, 30, 3, '#e03131'); circ(c, 18, 18, 14, '#ffd43b', OL, 2); c.fillStyle = OL; c.font = 'bold 14px sans-serif'; c.textAlign = 'center'; c.fillText('H', 18, 23);
  line(c, 20, -30, 44, -46, OL, 4); c.save(); c.globalAlpha = 0.8; circ(c, 46, -48, 7, '#ff922b', null); c.restore();
};
S.iceberg = (c) => {
  blob(c, 0, 0, 44, 8, 0.25, 12, rg(c, 0, 0, 46, ['#ffffff', '#d0ebff', '#74c0fc']), '#1c7ed6', 3);
  blob(c, -4, -4, 26, 7, 0.25, 14, '#fff', null);
};
S.island = (c, v = 0) => {
  c.save(); c.globalAlpha = 0.5; blob(c, 0, 0, 50, 10, 0.12, v + 20, '#99e9f2', null); c.restore();
  blob(c, 0, 0, 42, 10, 0.15, v + 21, '#ffe8a3', '#c9a227', 3);
  blob(c, 2, -2, 30, 9, 0.2, v + 23, rg(c, 0, 0, 30, ['#8ce99a', '#40c057', '#2b8a3e']), '#2b8a3e', 2);
  for (const [x, y] of [[-8, -6], [10, 4], [-2, 12]]) { for (let i = 0; i < 5; i++) { const a = i * TAU / 5; ell(c, x + Math.cos(a) * 7, y + Math.sin(a) * 7, 8, 3, a, '#2b8a3e', OL, 1.5); } circ(c, x, y, 3, '#8b5e34', null); }
};
S.whale = (c) => {
  poly(c, [-40, 0, -58, -18, -54, 0, -58, 18], '#364fc7');
  ell(c, 4, 0, 48, 26, 0, lg(c, 0, -26, 0, 26, ['#748ffc', '#4263eb', '#2b3990']));
  ell(c, 0, 18, 30, 6, 0, U.rgba('#dbe4ff', 0.6), null);
  poly(c, [0, 20, -14, 38, 10, 24], '#364fc7');
  circ(c, 34, -6, 4, OL, null); c.beginPath(); c.arc(40, 8, 8, 0.1, 1.8); c.lineWidth = 2; c.strokeStyle = OL; c.stroke();
  circ(c, 10, -20, 3, '#a5d8ff', null);
};
S.starfish = (c, v = 0) => {
  const col = ['#ff922b', '#f06595', '#fcc419'][v % 3];
  U.starPath(c, 0, 0, 5, 46, 20); fs(c, rg(c, 0, 0, 46, [U.shade(col, 0.4), col, U.shade(col, -0.3)]), OL, 3);
  for (let i = 0; i < 10; i++) { const a = i * 1.3; circ(c, Math.cos(a) * (8 + i * 2.5), Math.sin(a) * (8 + i * 2.5), 2.2, U.shade(col, 0.5), null); }
  eyes(c, 0, -2, 6, 4);
};
S.crab = (c) => {
  for (const s of [-1, 1]) { for (let i = 0; i < 3; i++) line(c, s * 20, -4 + i * 9, s * 42, 6 + i * 12, OL, 4); ell(c, s * 34, -30, 12, 9, s * 0.4, '#fa5252'); line(c, s * 16, -14, s * 28, -26, OL, 5); }
  ell(c, 0, 0, 28, 20, 0, rg(c, 0, 0, 28, ['#ff8787', '#fa5252', '#c92a2a']));
  line(c, -8, -16, -10, -28, OL, 3); line(c, 8, -16, 10, -28, OL, 3); circ(c, -10, -30, 5, '#fff'); circ(c, 10, -30, 5, '#fff'); circ(c, -10, -30, 2.5, OL, null); circ(c, 10, -30, 2.5, OL, null);
};
S.coral = (c, v = 0) => {
  const col = ['#ff6b6b', '#f783ac', '#ffa94d', '#b197fc'][v % 4];
  c.lineCap = 'round';
  const br = (x, y, a, l, d) => { if (d > 3) return; const x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l; line(c, x, y, x2, y2, OL, 14 - d * 3); line(c, x, y, x2, y2, col, 9 - d * 2); br(x2, y2, a - 0.5, l * 0.72, d + 1); br(x2, y2, a + 0.45, l * 0.72, d + 1); };
  br(0, 44, -Math.PI / 2, 30, 0);
};
S.chest = (c) => {
  rect(c, -44, -14, 88, 46, 4, '#8b5e34');
  c.beginPath(); c.moveTo(-44, -14); c.quadraticCurveTo(0, -46, 44, -14); c.closePath(); fs(c, '#a0693e', OL, 3);
  rect(c, -44, -14, 88, 8, 0, '#ffd43b', OL, 2); rect(c, -8, -10, 16, 18, 3, '#ffd43b', OL, 2);
  for (let i = 0; i < 5; i++) circ(c, -30 + i * 15, -24 + (i % 2) * 4, 5, '#ffe066', OL, 1);
};
S.mine = (c) => {
  for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU; line(c, Math.cos(a) * 30, Math.sin(a) * 30, Math.cos(a) * 46, Math.sin(a) * 46, OL, 7); circ(c, Math.cos(a) * 46, Math.sin(a) * 46, 5, '#495057', OL, 2); }
  circ(c, 0, 0, 34, rg(c, 0, 0, 34, ['#868e96', '#343a40', '#111']));
  circ(c, 0, 0, 8, '#e03131', null); hl(c, -12, -14, 10, 5, 0.3);
};
S.dolphin = (c) => {
  poly(c, [-36, 0, -54, -16, -50, 0, -54, 16], '#748ffc');
  c.beginPath(); c.moveTo(58, 2); c.quadraticCurveTo(40, -22, -40, -6); c.lineTo(-40, 6); c.quadraticCurveTo(30, 22, 58, 2); c.closePath();
  fs(c, lg(c, 0, -18, 0, 18, ['#a5b4fc', '#748ffc', '#4c6ef5']), OL, 3);
  poly(c, [0, -12, -10, -30, -16, -10], '#5c7cfa'); circ(c, 34, -4, 3, OL, null);
};

// ---------------- ГЛАВА 3: Вулкан ----------------
S.rock = (c, v = 0) => {
  const col = ['#868e96', '#a07e5a', '#5c5f66'][v % 3];
  blob(c, 0, 0, 42, 7, 0.22, v * 7 + 31, rg(c, 0, 0, 44, [U.shade(col, 0.35), col, U.shade(col, -0.35)]));
  line(c, -14, -10, 4, 6, U.rgba('#000', 0.25), 3); line(c, 4, 6, 18, 0, U.rgba('#000', 0.25), 3);
  hl(c, -14, -18, 12, 5, 0.3);
};
S.crystal = (c, v = 0) => {
  const col = ['#da77f2', '#4dabf7', '#ff6b6b', '#63e6be'][v % 4];
  [[-18, 10, 0.3, 30], [16, 12, -0.25, 34], [0, 6, 0, 46]].forEach(([x, y, a, h]) => {
    c.save(); c.translate(x, y); c.rotate(a);
    poly(c, [-9, 30, -10, -h + 14, 0, -h - 4, 10, -h + 14, 9, 30], lg(c, -10, 0, 10, 0, [U.shade(col, 0.5), col, U.shade(col, -0.35)]));
    line(c, 0, -h - 4, 0, 30, U.rgba('#fff', 0.45), 2); c.restore();
  });
};
S.goat = (c) => {
  ell(c, -4, 6, 30, 20, 0, '#f1f3f5');
  for (const x of [-22, 12]) rect(c, x - 4, 20, 8, 22, 3, '#ced4da');
  circ(c, 26, -12, 14, '#f1f3f5');
  c.beginPath(); c.arc(18, -26, 10, Math.PI, Math.PI * 1.8); c.lineWidth = 5; c.strokeStyle = '#868e96'; c.stroke();
  c.beginPath(); c.arc(30, -26, 10, Math.PI * 1.2, Math.PI * 2); c.stroke();
  poly(c, [30, 0, 36, 14, 26, 4], '#ced4da'); circ(c, 30, -14, 3, OL, null);
};
S.palm = (c) => {
  c.save(); c.globalAlpha = 0.25; circ(c, 8, 8, 40, '#000', null); c.restore();
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * TAU; c.save(); c.rotate(a);
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(26, -14, 50, 4); c.quadraticCurveTo(26, 8, 0, 0); fs(c, i % 2 ? '#40c057' : '#2f9e44', OL, 2);
    c.restore();
  }
  circ(c, 0, 0, 8, '#8b5e34'); circ(c, 6, 4, 5, '#5c3d1e', null); circ(c, -4, 6, 5, '#5c3d1e', null);
};
S.hut = (c) => {
  c.save(); c.globalAlpha = 0.25; circ(c, 6, 6, 44, '#000', null); c.restore();
  circ(c, 0, 0, 42, '#d9a441');
  for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU; line(c, 0, 0, Math.cos(a) * 42, Math.sin(a) * 42, '#b5832f', 2); }
  circ(c, 0, 0, 8, '#8b5e34');
};
S.boulder = (c) => {
  blob(c, 0, 0, 44, 9, 0.1, 44, rg(c, 0, 0, 46, ['#adb5bd', '#6c757d', '#343a40']));
  for (let i = 0; i < 5; i++) circ(c, Math.cos(i * 1.4) * 22, Math.sin(i * 2.1) * 18, 4, U.rgba('#000', 0.18), null);
  hl(c, -16, -20, 14, 6, 0.3);
};
S.dino = (c, v = 0) => {
  const col = ['#69db7c', '#ffa94d', '#9775fa'][v % 3];
  poly(c, [-20, 10, -56, 26, -24, 26], col);
  for (const x of [-10, 12]) rect(c, x - 6, 26, 12, 20, 4, U.shade(col, -0.15));
  ell(c, 0, 10, 28, 22, 0, rg(c, 0, 10, 28, [U.shade(col, 0.4), col, U.shade(col, -0.25)]));
  rect(c, 6, -40, 42, 30, 12, col);
  poly(c, [16, -14, 22, -8, 28, -14, 34, -8, 40, -14], '#fff', OL, 1.5, true);
  line(c, 18, 8, 28, 2, OL, 4);
  for (let i = 0; i < 4; i++) poly(c, [-20 + i * 9, -8 + i * -6, -14 + i * 9, -20 + i * -6, -10 + i * 9, -6 + i * -6], U.shade(col, -0.3), OL, 1.5);
  eyes(c, 34, -30, 0, 5, 1);
};
S.egg = (c, v = 0) => {
  const col = ['#fff3bf', '#d3f9d8', '#e5dbff'][v % 3];
  ell(c, 0, 4, 32, 42, 0, rg(c, 0, 0, 40, ['#ffffff', col, U.shade(col, -0.2)]));
  for (let i = 0; i < 6; i++) circ(c, Math.cos(i * 2) * 16, Math.sin(i * 1.3) * 22, 4, U.shade(col, -0.35), null);
  hl(c, -12, -16, 8, 12, 0.6);
};
S.lavarock = (c) => {
  c.save(); c.globalAlpha = 0.4; circ(c, 0, 0, 50, '#ff6b00', null); c.restore();
  blob(c, 0, 0, 40, 7, 0.2, 51, rg(c, 0, 0, 40, ['#495057', '#212529', '#000']));
  c.lineCap = 'round';
  [[-20, -10, 0, 4], [0, 4, 18, -8], [0, 4, 4, 24], [-14, 16, -4, 10]].forEach(([a, b, d, e]) => { line(c, a, b, d, e, '#ff922b', 5); line(c, a, b, d, e, '#ffe066', 2); });
};
S.tiki = (c) => {
  rect(c, -24, -46, 48, 92, 10, lg(c, -24, 0, 24, 0, ['#868e96', '#5c5f66', '#343a40']));
  rect(c, -24, -20, 48, 10, 3, '#495057', null);
  rect(c, -18, -8, 12, 8, 2, '#212529', null); rect(c, 6, -8, 12, 8, 2, '#212529', null);
  rect(c, -6, 0, 12, 22, 4, '#6c757d', OL, 2); rect(c, -14, 28, 28, 6, 2, '#212529', null);
};
S.coconut = (c) => {
  circ(c, 0, 0, 40, rg(c, 0, 0, 40, ['#a0693e', '#6b4226', '#3d2314']));
  circ(c, -10, -10, 5, '#2b1810', null); circ(c, 8, -12, 5, '#2b1810', null); circ(c, -2, 4, 5, '#2b1810', null);
};
S.bush = (c, v = 0) => {
  const col = ['#2f9e44', '#5c940d', '#37b24d'][v % 3];
  for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU + v; circ(c, Math.cos(a) * 22, Math.sin(a) * 22, 20, U.shade(col, -0.1)); }
  circ(c, 0, 0, 26, col, null);
  for (let i = 0; i < 6; i++) circ(c, Math.cos(i * 2.2) * 16, Math.sin(i * 2.2) * 16, 4, '#e03131', null);
};
S.volcano = (c) => {
  c.save(); c.globalAlpha = 0.35; circ(c, 6, 8, 50, '#000', null); c.restore();
  circ(c, 0, 0, 48, rg(c, 0, 0, 48, ['#5c4033', '#6b4f3a', '#3d2b1f']));
  for (let i = 0; i < 14; i++) { const a = (i / 14) * TAU; line(c, Math.cos(a) * 18, Math.sin(a) * 18, Math.cos(a + 0.1) * 46, Math.sin(a + 0.1) * 46, U.rgba('#000', 0.25), 3); }
  for (let i = 0; i < 5; i++) { const a = i * 1.3; c.beginPath(); c.moveTo(Math.cos(a) * 14, Math.sin(a) * 14); c.quadraticCurveTo(Math.cos(a + 0.3) * 28, Math.sin(a + 0.3) * 28, Math.cos(a) * 44, Math.sin(a) * 44); c.lineWidth = 5; c.strokeStyle = '#ff6b00'; c.stroke(); }
  circ(c, 0, 0, 18, rg(c, 0, 0, 18, ['#fff3bf', '#ffd43b', '#ff6b00']), '#3d2b1f', 4);
};

// ---------------- ГЛАВА 3: Планета Земля ----------------
S.city = (c, v = 0) => { // скопление домиков сверху
  c.save(); c.globalAlpha = 0.4; circ(c, 0, 0, 48, '#adb5bd', null); c.restore();
  const r = U.rng(v * 13 + 5);
  for (let i = 0; i < 16; i++) {
    const a = r() * TAU, d = r() * 36, w = 8 + r() * 10;
    rect(c, Math.cos(a) * d - w / 2, Math.sin(a) * d - w / 2, w, w, 1, PAL.car[i % 8], OL, 1.5);
  }
  rect(c, -7, -7, 14, 14, 1, '#f8f9fa', OL, 2);
};
S.megacity = (c, v = 0) => {
  c.save(); c.globalAlpha = 0.45; circ(c, 0, 0, 50, '#868e96', null); c.restore();
  const r = U.rng(v * 7 + 77);
  for (let i = 0; i < 28; i++) {
    const a = r() * TAU, d = Math.sqrt(r()) * 42, w = 6 + r() * 9;
    rect(c, Math.cos(a) * d - w / 2, Math.sin(a) * d - w / 2, w, w, 1, ['#dee2e6', '#adb5bd', '#748ffc', '#ffd8a8', '#96f2d7'][i % 5], OL, 1.2);
  }
  circ(c, 0, 0, 7, '#ffd43b', OL, 2);
};
S.mountain = (c, v = 0) => {
  c.save(); c.globalAlpha = 0.25; circ(c, 6, 6, 48, '#000', null); c.restore();
  poly(c, [0, -46, 44, 30, -44, 30], lg(c, -40, 0, 40, 0, ['#adb5bd', '#868e96', '#495057']));
  poly(c, [0, -46, 44, 30, 0, 30], U.rgba('#000', 0.18), null);
  poly(c, [0, -46, 14, -20, 6, -24, 0, -16, -6, -24, -14, -20], '#fff', OL, 2);
  if (v) { poly(c, [-26, -10, 4, 34, -50, 34], '#868e96'); poly(c, [-26, -10, -18, 2, -26, -2, -32, 2], '#fff', OL, 1.5); }
};
S.forest = (c, v = 0) => {
  const r = U.rng(v * 3 + 9);
  for (let i = 0; i < 14; i++) { const a = r() * TAU, d = Math.sqrt(r()) * 36; const x = Math.cos(a) * d, y = Math.sin(a) * d; poly(c, [x, y - 14, x + 9, y + 6, x - 9, y + 6], ['#2f9e44', '#2b8a3e', '#37b24d'][i % 3], OL, 1.5); }
};
S.plane = (c) => {
  poly(c, [52, 0, 40, -6, -40, -6, -50, 0, -40, 6, 40, 6], '#f8f9fa');
  poly(c, [10, -6, -10, -48, -22, -48, -12, -6], '#dee2e6'); poly(c, [10, 6, -10, 48, -22, 48, -12, 6], '#dee2e6');
  poly(c, [-36, -6, -46, -20, -52, -20, -46, -6], '#dee2e6'); poly(c, [-36, 6, -46, 20, -52, 20, -46, 6], '#dee2e6');
  line(c, -30, 0, 36, 0, '#4dabf7', 2); circ(c, 44, 0, 3, '#4dabf7', null);
};
S.cloud = (c) => {
  c.save(); c.globalAlpha = 0.85;
  [[-24, 6, 20], [0, -6, 26], [24, 6, 20], [8, 12, 18], [-10, 12, 18]].forEach(([x, y, r]) => circ(c, x, y, r, '#fff', null));
  c.restore();
};
S.eiffel = (c) => {
  poly(c, [0, -48, 6, -10, 22, 46, 12, 46, 0, 20, -12, 46, -22, 46, -6, -10], '#8d7b68');
  line(c, -10, 10, 10, 10, OL, 3); line(c, -16, 28, 16, 28, OL, 3);
  poly(c, [0, -48, 6, -10, 22, 46, 12, 46, 0, 20, -12, 46, -22, 46, -6, -10], null);
};
S.pyramid = (c) => {
  poly(c, [0, -44, 46, 36, -46, 36], '#ffd8a8');
  poly(c, [0, -44, 46, 36, 6, 36], '#e8b06a', OL, 2);
  for (let i = 1; i < 6; i++) line(c, -46 + i * 7.5, 36 - i * 13.3, 46 - i * 7.5, 36 - i * 13.3, U.rgba(OL, 0.3), 1.5);
};
S.liberty = (c) => {
  rect(c, -20, 20, 40, 26, 2, '#8d7b68');
  poly(c, [-12, 20, -14, -20, 14, -20, 12, 20], '#63e6be');
  circ(c, 0, -28, 10, '#63e6be');
  for (let i = 0; i < 5; i++) line(c, 0, -32, -14 + i * 7, -44, OL, 2);
  line(c, 12, -16, 22, -44, OL, 5); line(c, 12, -16, 22, -44, '#63e6be', 3); circ(c, 22, -48, 5, '#ffd43b');
};
S.tvtower = (c) => {
  line(c, 0, 46, 0, -48, OL, 7); line(c, 0, 46, 0, -48, '#ced4da', 4);
  circ(c, 0, -14, 12, '#e03131'); circ(c, 0, -14, 6, '#fff', null);
  line(c, -16, 46, 0, 10, OL, 3); line(c, 16, 46, 0, 10, OL, 3);
};
S.windmill = (c) => {
  rect(c, -10, -6, 20, 50, 3, '#f8f9fa');
  for (let i = 0; i < 4; i++) { c.save(); c.rotate(i * Math.PI / 2 + 0.3); rect(c, -4, -46, 8, 40, 2, '#e9ecef'); c.restore(); }
  circ(c, 0, 0, 5, '#495057');
};
S.lighthouse = (c) => {
  poly(c, [-14, 46, -8, -30, 8, -30, 14, 46], '#fff');
  for (let i = 0; i < 3; i++) poly(c, [-13 + i * 2, 30 - i * 22, -11 + i * 2, 20 - i * 22, 11 - i * 2, 20 - i * 22, 13 - i * 2, 30 - i * 22], '#e03131', null);
  rect(c, -10, -44, 20, 14, 2, '#ffd43b'); poly(c, [-12, -44, 0, -54, 12, -44], '#e03131');
  poly(c, [-14, 46, -8, -30, 8, -30, 14, 46], null);
};
S.stadium = (c) => {
  ell(c, 0, 0, 48, 36, 0, '#ced4da');
  ell(c, 0, 0, 38, 26, 0, '#69db7c');
  line(c, 0, -26, 0, 26, '#fff', 2); circ(c, 0, 0, 8, null, '#fff', 2);
  rect(c, -38, -8, 6, 16, 0, null, '#fff', 2); rect(c, 32, -8, 6, 16, 0, null, '#fff', 2);
};
S.ferris = (c) => {
  circ(c, 0, -4, 40, null, OL, 5); circ(c, 0, -4, 40, null, '#ff8fab', 3);
  for (let i = 0; i < 8; i++) { const a = i * TAU / 8; line(c, 0, -4, Math.cos(a) * 40, -4 + Math.sin(a) * 40, '#adb5bd', 2); rect(c, Math.cos(a) * 40 - 5, -4 + Math.sin(a) * 40 - 4, 10, 8, 2, PAL.bright[i], OL, 1.5); }
  line(c, 0, -4, -20, 46, OL, 4); line(c, 0, -4, 20, 46, OL, 4);
};
S.launchpad = (c) => {
  circ(c, 0, 0, 46, '#868e96'); circ(c, 0, 0, 36, '#495057');
  for (let i = 0; i < 8; i++) { const a = i * TAU / 8; line(c, Math.cos(a) * 14, Math.sin(a) * 14, Math.cos(a) * 34, Math.sin(a) * 34, '#ffd43b', 4); }
  circ(c, 0, 0, 12, '#e03131');
};

// ---------------- ГЛАВА 4: Космос ----------------
S.asteroid = (c, v = 0) => {
  const col = ['#868e96', '#a07e5a', '#6c757d'][v % 3];
  blob(c, 0, 0, 42, 8, 0.25, v * 11 + 3, rg(c, 0, 0, 44, [U.shade(col, 0.3), col, U.shade(col, -0.4)]));
  [[-12, -8, 9], [14, 10, 7], [6, -18, 5], [-16, 16, 5]].forEach(([x, y, r]) => { circ(c, x, y, r, U.shade(col, -0.25), U.rgba('#000', 0.3), 1.5); circ(c, x - 1.5, y - 1.5, r * 0.6, U.shade(col, -0.35), null); });
};
S.comet = (c) => {
  c.save(); const g = lg(c, -56, 0, 20, 0, ['rgba(116,192,252,0)', 'rgba(116,192,252,0.7)', '#e7f5ff']); c.beginPath(); c.moveTo(-58, -6); c.quadraticCurveTo(0, -30, 26, 0); c.quadraticCurveTo(0, 30, -58, 6); c.closePath(); c.fillStyle = g; c.fill(); c.restore();
  blob(c, 26, 0, 18, 7, 0.2, 5, rg(c, 26, 0, 18, ['#fff', '#a5d8ff', '#4dabf7']), '#1864ab', 3);
};
S.satellite = (c) => {
  rect(c, -54, -12, 34, 24, 2, '#1864ab'); rect(c, 20, -12, 34, 24, 2, '#1864ab');
  for (let i = 1; i < 4; i++) { line(c, -54 + i * 8.5, -12, -54 + i * 8.5, 12, '#74c0fc', 1); line(c, 20 + i * 8.5, -12, 20 + i * 8.5, 12, '#74c0fc', 1); }
  line(c, -20, 0, 20, 0, OL, 4);
  rect(c, -14, -16, 28, 32, 4, '#ffd43b'); circ(c, 0, -22, 8, '#ced4da'); line(c, 0, -22, 0, -34, OL, 2);
};
S.junk = (c, v = 0) => {
  const col = ['#adb5bd', '#ffd43b', '#e03131'][v % 3];
  poly(c, [-36, -18, 6, -30, 40, -4, 22, 30, -26, 20], lg(c, -36, -30, 40, 30, [U.shade(col, 0.4), col, U.shade(col, -0.35)]));
  line(c, -10, -20, 10, 20, U.rgba('#000', 0.3), 3); circ(c, 12, -4, 5, '#212529', null);
};
S.astronaut = (c) => {
  rect(c, -24, -12, 48, 40, 12, '#f8f9fa');
  rect(c, -30, -16, 12, 30, 4, '#ced4da');
  rect(c, -20, 26, 14, 18, 5, '#f1f3f5'); rect(c, 6, 26, 14, 18, 5, '#f1f3f5');
  circ(c, 0, -28, 20, '#f8f9fa'); ell(c, 2, -28, 14, 11, 0, lg(c, 0, -38, 0, -18, ['#ffd43b', '#e8590c']));
  hl(c, -4, -32, 5, 3, 0.8); rect(c, -8, 0, 16, 10, 2, '#e03131', OL, 1.5);
};
S.ufo = (c) => {
  ell(c, 0, 0, 48, 16, 0, lg(c, 0, -16, 0, 16, ['#e9ecef', '#adb5bd', '#495057']));
  ell(c, 0, -10, 22, 16, 0, U.rgba('#99e9f2', 0.8)); circ(c, 0, -10, 8, '#69db7c'); circ(c, -3, -12, 2, OL, null); circ(c, 3, -12, 2, OL, null);
  for (let i = 0; i < 5; i++) circ(c, -32 + i * 16, 4, 4, PAL.bright[i], OL, 1.5);
};
S.station = (c) => {
  rect(c, -54, -26, 34, 18, 2, '#1864ab'); rect(c, -54, 8, 34, 18, 2, '#1864ab'); rect(c, 20, -26, 34, 18, 2, '#1864ab'); rect(c, 20, 8, 34, 18, 2, '#1864ab');
  line(c, -38, -8, -38, 8, OL, 3); line(c, 38, -8, 38, 8, OL, 3);
  rect(c, -40, -6, 80, 12, 4, '#dee2e6'); rect(c, -12, -18, 24, 36, 6, '#f8f9fa'); circ(c, 0, 0, 6, '#ffd43b');
};
S.moon = (c, v = 0) => {
  const col = ['#ced4da', '#e9c46a', '#adb5bd', '#ffa8a8'][v % 4];
  circ(c, 0, 0, 46, rg(c, 0, 0, 46, [U.shade(col, 0.4), col, U.shade(col, -0.45)]));
  [[-16, -12, 9], [14, 14, 11], [18, -16, 6], [-18, 20, 6], [-2, 2, 5]].forEach(([x, y, r]) => circ(c, x, y, r, U.shade(col, -0.2), U.rgba('#000', 0.2), 1.5));
};
const planet = (base, bands, ring) => (c) => {
  if (ring) { c.save(); c.scale(1, 0.32); c.beginPath(); c.arc(0, 0, 58, Math.PI, TAU); c.lineWidth = 12; c.strokeStyle = U.rgba(ring, 0.9); c.stroke(); c.restore(); }
  circ(c, 0, 0, ring ? 34 : 46, rg(c, 0, 0, ring ? 34 : 46, [U.shade(base, 0.35), base, U.shade(base, -0.5)]));
  const R = ring ? 34 : 46;
  c.save(); c.beginPath(); c.arc(0, 0, R, 0, TAU); c.clip();
  bands.forEach(([y, h, col]) => { c.fillStyle = col; c.beginPath(); c.ellipse(0, y * R, R * 1.2, h * R, 0.08, 0, TAU); c.fill(); });
  const sh = c.createRadialGradient(-R * 0.4, -R * 0.4, R * 0.2, 0, 0, R * 1.1); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,30,0.45)'); c.fillStyle = sh; c.fillRect(-R, -R, 2 * R, 2 * R);
  c.restore(); circ(c, 0, 0, R, null);
  if (ring) { c.save(); c.scale(1, 0.32); c.beginPath(); c.arc(0, 0, 58, 0, Math.PI); c.lineWidth = 12; c.strokeStyle = U.rgba(ring, 0.9); c.stroke(); c.restore(); }
};
S.mercury = planet('#a8a29e', [[-0.3, 0.08, 'rgba(0,0,0,0.12)'], [0.4, 0.1, 'rgba(0,0,0,0.1)']]);
S.venus = planet('#f4c27a', [[-0.4, 0.15, 'rgba(255,240,200,0.4)'], [0.2, 0.2, 'rgba(200,120,40,0.25)']]);
S.earthp = (c) => {
  circ(c, 0, 0, 46, rg(c, 0, 0, 46, ['#74c0fc', '#1c7ed6', '#0b3d75']));
  c.save(); c.beginPath(); c.arc(0, 0, 46, 0, TAU); c.clip();
  [[-14, -12, 18, 3], [16, 10, 15, 5], [-8, 22, 10, 7], [24, -22, 9, 9]].forEach(([x, y, r, s]) => blob(c, x, y, r, 7, 0.35, s, '#51cf66', null));
  c.fillStyle = 'rgba(255,255,255,0.75)'; c.beginPath(); c.ellipse(0, -44, 30, 8, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(0, 44, 30, 8, 0, 0, TAU); c.fill();
  c.restore(); circ(c, 0, 0, 46, null);
};
S.mars = planet('#e8590c', [[-0.6, 0.15, 'rgba(255,255,255,0.6)'], [0.1, 0.1, 'rgba(120,30,0,0.3)']]);
S.jupiter = planet('#e9c49a', [[-0.6, 0.1, '#c08552'], [-0.25, 0.08, '#f3dfc1'], [0.05, 0.1, '#b5651d'], [0.35, 0.07, '#f3dfc1'], [0.6, 0.1, '#c08552']]);
S.saturn = planet('#f1d79b', [[-0.4, 0.1, '#d9b56b'], [0.0, 0.08, '#f8e9c2'], [0.4, 0.1, '#d9b56b']], '#d6c08a');
S.uranus = planet('#99e9f2', [[0, 0.08, 'rgba(255,255,255,0.25)']]);
S.neptune = planet('#4263eb', [[-0.2, 0.08, 'rgba(255,255,255,0.2)'], [0.3, 0.1, '#364fc7']]);
S.pluto = planet('#d4b8a0', [[0.1, 0.3, 'rgba(255,255,255,0.5)']]);

// ---------------- ФИНАЛ: станция Молгелевича ----------------
S.scrap = (c, v = 0) => {
  const col = ['#b197fc', '#adb5bd', '#ff8787', '#63e6be'][v % 4];
  poly(c, [-38, -10, -6, -36, 36, -20, 40, 18, 2, 38, -32, 22], lg(c, -40, -40, 40, 40, [U.shade(col, 0.4), col, U.shade(col, -0.35)]));
  circ(c, -10, 0, 7, '#212529', null); line(c, 6, -20, 22, 14, U.rgba('#fff', 0.5), 3);
};
S.brainbot = (c) => {
  for (let i = 0; i < 3; i++) for (const s of [-1, 1]) line(c, s * 16, 14 + i * 6, s * (36 + i * 4), 30 + i * 8, OL, 4);
  circ(c, 0, 10, 26, '#495057');
  circ(c, 0, -6, 30, U.rgba('#e7f5ff', 0.5));
  blob(c, 0, -8, 22, 10, 0.12, 4, '#ff8fab', '#c2255c', 2.5);
  c.beginPath(); c.moveTo(0, -28); c.bezierCurveTo(-6, -18, 6, -10, 0, 8); c.lineWidth = 2; c.strokeStyle = '#c2255c'; c.stroke();
  for (const s of [-1, 1]) { c.beginPath(); c.arc(s * 10, -10, 6, 0, Math.PI * 1.4); c.stroke(); }
  circ(c, 0, -6, 30, null, OL, 3); circ(c, -10, 14, 4, '#ff6b6b', null); circ(c, 10, 14, 4, '#ff6b6b', null);
};
S.generator = (c) => {
  c.save(); c.globalAlpha = 0.35; circ(c, 0, 0, 50, '#b197fc', null); c.restore();
  const p = []; for (let i = 0; i < 8; i++) p.push(Math.cos(i * TAU / 8 + 0.39) * 44, Math.sin(i * TAU / 8 + 0.39) * 44);
  poly(c, p, rg(c, 0, 0, 44, ['#adb5bd', '#495057', '#212529']));
  circ(c, 0, 0, 24, rg(c, 0, 0, 24, ['#fff', '#d0bfff', '#7048e8']), '#5f3dc4', 3);
  for (let i = 0; i < 4; i++) { const a = i * TAU / 4; circ(c, Math.cos(a) * 34, Math.sin(a) * 34, 5, '#ff6b6b', null); }
};

// ---------------- Бонусы ----------------
S.pw_speed = (c) => { // перец
  c.beginPath(); c.moveTo(-30, -20); c.bezierCurveTo(10, -36, 46, -10, 40, 30); c.bezierCurveTo(30, 0, 0, -8, -30, 0); c.closePath(); fs(c, lg(c, 0, -30, 0, 20, ['#ff8787', '#e03131', '#a61e1e']), OL, 3);
  c.beginPath(); c.moveTo(-30, -10); c.quadraticCurveTo(-46, -14, -44, -32); c.lineWidth = 6; c.strokeStyle = OL; c.stroke(); c.lineWidth = 3; c.strokeStyle = '#2f9e44'; c.stroke();
  hl(c, 4, -18, 14, 4, 0.6);
};
S.pw_magnet = (c) => {
  c.beginPath(); c.arc(0, -4, 30, Math.PI, 0); c.lineWidth = 24; c.strokeStyle = OL; c.stroke(); c.lineWidth = 18; c.strokeStyle = '#e03131'; c.stroke();
  rect(c, -40, -6, 20, 30, 2, '#e03131'); rect(c, 20, -6, 20, 30, 2, '#e03131');
  rect(c, -40, 22, 20, 14, 2, '#dee2e6'); rect(c, 20, 22, 20, 14, 2, '#dee2e6');
};
S.pw_shield = (c) => {
  circ(c, 0, 0, 42, rg(c, 0, 0, 42, ['rgba(255,255,255,0.9)', 'rgba(116,192,252,0.5)', 'rgba(28,126,214,0.8)']), '#1864ab', 3);
  c.beginPath(); c.moveTo(0, -24); c.lineTo(20, -14); c.quadraticCurveTo(20, 16, 0, 28); c.quadraticCurveTo(-20, 16, -20, -14); c.closePath(); fs(c, '#4dabf7', OL, 3);
  hl(c, -14, -22, 10, 5, 0.8);
};
S.pw_grow = (c) => { // гриб роста
  rect(c, -12, 0, 24, 36, 8, '#fff3bf');
  c.beginPath(); c.arc(0, 4, 40, Math.PI, 0); c.closePath(); fs(c, rg(c, 0, -10, 40, ['#ff8787', '#f03e3e', '#a61e1e']), OL, 3);
  circ(c, -18, -14, 8, '#fff', null); circ(c, 14, -22, 7, '#fff', null); circ(c, 22, -4, 5, '#fff', null); circ(c, -2, -26, 5, '#fff', null);
  circ(c, -5, 18, 2.5, OL, null); circ(c, 5, 18, 2.5, OL, null);
};
S.pw_time = (c) => {
  circ(c, 0, 4, 38, '#ffd43b'); circ(c, 0, 4, 30, '#fff');
  line(c, 0, 4, 0, -16, OL, 4); line(c, 0, 4, 14, 10, OL, 4);
  rect(c, -8, -44, 16, 10, 3, '#ffd43b'); line(c, -26, -28, -34, -36, OL, 6); line(c, 26, -28, 34, -36, OL, 6);
};
S.pw_pie = (c) => { // пирожок Наташи
  c.beginPath(); c.moveTo(-46, 10); c.quadraticCurveTo(-40, -36, 0, -36); c.quadraticCurveTo(40, -36, 46, 10); c.quadraticCurveTo(0, 28, -46, 10); c.closePath();
  fs(c, lg(c, 0, -36, 0, 20, ['#ffe8a3', '#f4a742', '#b9701b']), OL, 3);
  for (let i = 0; i < 6; i++) line(c, -30 + i * 12, 12 - Math.abs(i - 2.5) * 2, -26 + i * 12, 2 - Math.abs(i - 2.5) * 2, '#8a4b0b', 3);
  hl(c, -12, -22, 16, 5, 0.6);
  c.save(); c.globalAlpha = 0.6; [[-14, -44], [6, -50], [24, -42]].forEach(([x, y]) => { c.beginPath(); c.moveTo(x, y + 8); c.quadraticCurveTo(x + 6, y, x, y - 8); c.lineWidth = 3; c.strokeStyle = '#fff'; c.stroke(); }); c.restore();
};

// ============================================================
//  Кэш спрайтов (LOD): рисуем один раз — потом drawImage
// ============================================================
const Sprites = {
  cache: new Map(),
  buckets: [12, 32, 80, 200],
  PAD: 1.3, // запас вокруг радиуса 50
  get(name, v, pxR) {
    let b = this.buckets[this.buckets.length - 1];
    for (const s of this.buckets) if (s >= pxR) { b = s; break; }
    const key = name + '|' + v + '|' + b;
    let cv = this.cache.get(key);
    if (cv) return cv;
    const fn = S[name];
    const size = Math.ceil(b * 2 * this.PAD);
    cv = document.createElement('canvas'); cv.width = cv.height = size;
    const c = cv.getContext('2d');
    c.translate(size / 2, size / 2);
    c.scale(b / 50, b / 50);
    c.lineJoin = 'round'; c.lineCap = 'round';
    if (fn) { try { fn(c, v); } catch (e) { console.warn('sprite', name, e); } }
    else { circ(c, 0, 0, 44, '#ff00ff'); }
    this.cache.set(key, cv);
    return cv;
  },
  // Рисует спрайт в текущих (мировых) координатах. zoom — пикселей на единицу.
  draw(ctx, name, v, x, y, r, rot, zoom) {
    const pxR = r * zoom;
    if (pxR < 0.6) { // крошечное — точкой
      ctx.fillStyle = '#0003'; ctx.fillRect(x - r, y - r, r * 2, r * 2); return;
    }
    const cv = this.get(name, v, pxR);
    const half = r * this.PAD;
    if (rot) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
      ctx.drawImage(cv, -half, -half, half * 2, half * 2);
      ctx.restore();
    } else ctx.drawImage(cv, x - half, y - half, half * 2, half * 2);
  },
  // Доминирующий цвет для крошек при поедании
  colorOf(name, v) {
    const key = 'col|' + name + '|' + v;
    if (this.cache.has(key)) return this.cache.get(key);
    let col = '#ffd43b';
    if (!S[name]) { this.cache.set(key, col); return col; }
    try {
      const cv = this.get(name, v, 12);
      const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
      let r = 0, g = 0, b = 0, n = 0;
      for (let i = 0; i < d.length; i += 16) if (d[i + 3] > 200) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
      if (n) col = U.rgbToHex(r / n, g / n, b / n);
    } catch (e) { /* ignore */ }
    this.cache.set(key, col);
    return col;
  },
};
