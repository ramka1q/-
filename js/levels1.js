'use strict';
// ============================================================
//  УРОВНИ, часть 1: Глава 1 «НИИ» и Глава 2 «Город»
//  Все карты построены заранее (детерминированный генератор).
// ============================================================
const LEVELS = [];

function inPoly(x, y, p) {
  let c = false;
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
    const xi = p[i], yi = p[i + 1], xj = p[j], yj = p[j + 1];
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) c = !c;
  }
  return c;
}
// Цепочка круглых зон вдоль ломаной (реки лавы, течения)
function chainZones(b, k, pts, r, o = {}, gapAt = []) {
  const out = [];
  for (let i = 0; i < pts.length - 2; i += 2) {
    const x1 = pts[i], y1 = pts[i + 1], x2 = pts[i + 2], y2 = pts[i + 3];
    const L = U.dist(x1, y1, x2, y2), n = Math.max(1, Math.ceil(L / (r * 0.9)));
    for (let s = 0; s < n; s++) {
      const t = s / n, x = U.lerp(x1, x2, t), y = U.lerp(y1, y2, t);
      if (gapAt.some(g => U.dist(g[0], g[1], x, y) < g[2])) continue;
      out.push(b.zone(k, { x, y, r: r * (0.9 + 0.2 * Math.sin(x * 0.01 + y * 0.013)) }, Object.assign({}, o)));
    }
  }
  return out;
}
// Капля / колба / снаряд с неба с предупреждением
function skyDrop(L, x, y, R, dur, kind, opts = {}) {
  L.warn(x, y, R, dur, (L2, w) => {
    Sound.play('splash');
    L2.burst(w.x, w.y, 14, opts.col || '#3bc9db', w.r * 2, w.r * 0.15);
    if (kind === 'hazard') L2.zones.push({ k: 'hazard', shape: 'circ', x: w.x, y: w.y, r: w.r, life: opts.life || 5, maxLife: opts.life || 5, hz: opts.hz || 0.07, col: opts.col });
    if (kind === 'slow') L2.zones.push({ k: 'slow', shape: 'circ', x: w.x, y: w.y, r: w.r, life: opts.life || 6, mult: 0.45, col: opts.col || '#94d82d' });
    if (kind === 'ice') L2.zones.push({ k: 'ice', shape: 'circ', x: w.x, y: w.y, r: w.r, life: opts.life || 7 });
    if (U.dist(w.x, w.y, L2.P.x, L2.P.y) < w.r * 0.8 && opts.dmg) L2.hurt(opts.dmg, w.x, w.y, 'drop');
  }, opts.col || '#3bc9db', opts.label || '');
}
function nearPlayer(L, spread = 3) {
  const P = L.P;
  for (let i = 0; i < 10; i++) {
    const a = Math.random() * TAU, d = Math.random() * P.r * spread;
    const x = P.x + P.vx * 0.8 + Math.cos(a) * d, y = P.y + P.vy * 0.8 + Math.sin(a) * d;
    if (L.inWorld(x, y, P.r)) return [x, y];
  }
  return [P.x, P.y];
}

// ============================================================
//  1-1. ЧАШКА ПЕТРИ (Егор)
// ============================================================
LEVELS.push({
  id: 'dish', name: 'Чашка Петри', chapter: 'Глава 1 · НИИ «Мозгоправ»', host: 'egor', music: 'lab', bg: 'dish',
  mech: { icon: '🍽', name: 'КЛАССИКА', text: 'Ешь всё, что меньше тебя, и расти. Уворачивайся от капель антибиотика.' },
  desc: 'Никита — микроб в чашке Петри. Ешь бактерии и расти!',
  unit: 1e-5, world: { w: 4200, h: 4200, shape: 'circle' }, start: { x: 2100, y: 2100, r: 10 }, goal: { r: 150 },
  growK: 0.12, medals: [180, 300], seed: 101, mmColor: 'rgba(210,170,70,0.85)', burp: 'Бактерии — на вкус как чипсы!',
  milestones: [
    { r: 28, who: 'egor', text: 'Странно… кто-то ест мои бактерии. И оно растёт!', expr: 'shock' },
    { r: 60, who: 'egor', text: 'Это… лицо?! Это же НИКИТА! Пипетку мне, срочно!', expr: 'shock' },
    { r: 100, who: 'egor', text: 'Он уже размером с крошку хлеба! Чашка его не удержит!', expr: 'angry' },
  ],
  respawn: [['coccus', 2, 9], ['bacillus', 3, 11], ['yeast', 5, 15], ['paramecium', 8, 22], ['amoeba', 12, 32], ['pollen', 15, 40], ['crumb', 18, 70], ['dust', 30, 80], ['diatom', 12, 30], ['sugar', 20, 60]],
  build(b) {
    const C = 2100, ring = (r0, r1) => ({ cx: C, cy: C, r0, r1 });
    b.clear(C - 120, C - 120, 240, 240);
    b.scatter('coccus', 230, 2, 7, ring(60, 700));
    b.scatter('bacillus', 120, 3, 8.5, ring(60, 750));
    b.scatter('algae', 40, 4, 9, ring(100, 800));
    b.scatter('yeast', 70, 5, 13, ring(200, 1000));
    b.scatter('droplet', 25, 6, 14, ring(200, 1100));
    b.scatter('virus', 34, 7, 15, ring(350, 1200));
    b.scatter('paramecium', 60, 9, 20, ring(500, 1400));
    b.scatter('spirillum', 70, 8, 17, ring(400, 1500));
    b.scatter('amoeba', 55, 12, 28, ring(600, 1650));
    b.scatter('diatom', 60, 12, 26, ring(600, 1700));
    b.scatter('pollen', 50, 16, 36, ring(800, 1950));
    b.scatter('crumb', 75, 14, 46, ring(700, 2000));
    b.scatter('sugar', 30, 18, 42, ring(900, 2000));
    b.scatter('phage', 12, 28, 42, ring(950, 1750));
    b.scatter('dust', 45, 35, 80, ring(1300, 2050));
    b.scatter('hair', 26, 45, 95, ring(1200, 2050));
    b.scatter('tardigrade', 11, 45, 72, ring(1400, 2000));
    b.scatter('crumb', 28, 60, 115, ring(1500, 2050));
    b.scatter('pollen', 16, 50, 95, ring(1400, 2050));
    b.scatter('sugar', 14, 60, 100, ring(1600, 2050));
    // колонии бактерий под охраной фагов
    for (let k = 0; k < 4; k++) {
      const a = k * TAU / 4 + 0.6, cx = C + Math.cos(a) * 1250, cy = C + Math.sin(a) * 1250;
      b.scatter('coccus', 30, 8, 16, { cx, cy, r1: 170 }, { opts: { beh: null } });
      b.scatter('yeast', 10, 14, 22, { cx, cy, r1: 190 });
      b.item('phage', cx + 60, cy, 46, { aggro: 6, taunt: ['Колония под защитой!', 'Бззз!'] });
    }
    b.pw('speed', C + 900, C - 300, 16);
    b.pw('magnet', C - 1100, C + 700, 24);
    b.pw('shield', C + 300, C + 1500, 34);
    b.pw('grow', C - 1500, C - 900, 40);
  },
  init(L) { L.radio('egor', 'Так, свежая культура бактерий. Посмотрим, как они растут…', 'normal'); },
  update(L, dt) {
    const D = L.data, P = L.P;
    if (!D.t1 && L.time > 0.6) { D.t1 = 1; L.toast('Двигай мышкой — Никита ползёт за курсором (или WASD / стрелки)', '#ffe066', 5); }
    if (!D.t2 && L.time > 6.5) { D.t2 = 1; L.toast('Ешь всё, что МЕНЬШЕ тебя — и расти!', '#ffe066', 4.5); }
    if (!D.t3 && P.r > 15) { D.t3 = 1; L.toast('ПРОБЕЛ или правая кнопка мыши — РЫВОК!', '#ffe066', 4.5); }
    if (!D.t4 && P.r > 22) { D.t4 = 1; L.toast('Колючие вирусы и фаги жалят, пока ты меньше их!', '#ff8787', 4.5); }
    if (P.r > 20) {
      D.pip = (D.pip === undefined ? 4 : D.pip) - dt;
      if (D.pip <= 0) {
        D.pip = Math.max(5.5, 10 - L.time / 60);
        const [x, y] = nearPlayer(L, 2.5);
        skyDrop(L, x, y, P.r * 1.9, 1.5, 'hazard', { col: '#3bc9db', life: 5, hz: 0.07, label: '💧' });
        if (!D.pipSaid) { D.pipSaid = 1; L.radio('egor', 'Капля антибиотика! Не бойся, Никита… это для науки!', 'determined'); L.tip('drop', 'Голубые круги — сюда упадёт капля. Уползай!', '#74c0fc'); }
      }
    }
  },
});

// ============================================================
//  1-2. СТОЛ ПИЛИПЮКА (цветные барьеры)
// ============================================================
LEVELS.push({
  id: 'table', name: 'Стол Пилипюка', chapter: 'Глава 1 · НИИ «Мозгоправ»', host: 'pylypyuk', music: 'lab', bg: 'table',
  mech: { icon: '🎨', name: 'КРАСКИ', text: 'Наступай в лужи краски — барьер пропускает только Никиту своего цвета.' },
  desc: 'Химический стол. Меняй цвет в лужах краски, чтобы проходить сквозь барьеры.',
  unit: 1e-3, world: { w: 6400, h: 4200 }, start: { x: 600, y: 2100, r: 10 }, goal: { r: 170 },
  growK: 0.12, medals: [420, 660], seed: 202, mmColor: 'rgba(150,100,60,0.85)', burp: 'Микроскоп оказался хрустящим!',
  milestones: [
    { r: 25, who: 'pylypyuk', text: 'Хм. Стажёр Никита, вы съели мою скрепку. Это служебная скрепка!', expr: 'angry' },
    { r: 60, who: 'pylypyuk', text: 'Только не мой бутерброд… Я его с утра берёг!', expr: 'shock' },
    { r: 110, who: 'pylypyuk', text: 'Мои книги! Мои пробирки! Мои УСЫ трясутся от гнева!', expr: 'angry' },
  ],
  respawn: [['crumb', 3, 9], ['pill', 4, 12], ['coin', 6, 16], ['paperclip', 5, 14], ['sugar', 5, 14], ['pencil', 12, 30], ['eraser', 10, 24], ['testtube', 14, 30], ['stickynote', 12, 26]],
  build(b) {
    const H = 4200;
    // книжные перегородки с цветными барьерами
    for (const [x, col] of [[1600, 'red'], [3400, 'blue'], [5000, 'yellow']]) {
      b.wall(x, 0, 80, 1900, { style: 'books', ed: 105 });
      b.wall(x, 2300, 80, H - 2300, { style: 'books', ed: 105 });
      b.gate(x, 1900, 80, 400, col, { ed: 115 });
      b.clear(x - 300, 1750, 680, 700);
    }
    // зелёная комната с синей краской
    b.box(2300, 2900, 800, 1150, 60, { style: 'books', ed: 105 }, { n: [[250, 300]], e: [[650, 300]] });
    b.gate(2550, 2900, 300, 60, 'green', { ed: 115 });
    b.gate(3040, 3550, 60, 300, 'blue', { ed: 115 });
    b.clear(2300, 2900, 800, 1150);
    b.zone('paint', { x: 1100, y: 650, r: 95 }, { color: 'red' });
    b.zone('paint', { x: 2050, y: 650, r: 100 }, { color: 'green' });
    b.zone('paint', { x: 2700, y: 3550, r: 105 }, { color: 'blue' });
    b.zone('paint', { x: 4250, y: 3550, r: 105 }, { color: 'yellow' });
    b.clear(900, 450, 400, 400); b.clear(1850, 450, 400, 400); b.clear(4000, 3300, 500, 500);
    // кольцо горелок вокруг жёлтой краски
    for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; b.item('burner', 4250 + Math.cos(a) * 270, 3550 + Math.sin(a) * 270, 40, { beh: 'burner', draw: Draws.burner, noEat: true, on: 1.8, off: 1.6, phase: (i % 3) * 1.15, ed: 0 }); }
    // A: стартовая зона (плотная «ясельная» россыпь у старта)
    const nur = { cx: 600, cy: 2100, r0: 40, r1: 700 };
    b.scatter('crumb', 170, 3, 8, nur); b.scatter('pill', 40, 4, 8.5, nur); b.scatter('sugar', 40, 4, 8, nur); b.scatter('paperclip', 25, 5, 9, nur); b.scatter('screw', 20, 5, 9, nur);
    b.scatter('pill', 30, 8, 14, { cx: 600, cy: 2100, r0: 300, r1: 1200 }); b.scatter('coin', 20, 9, 16, { cx: 600, cy: 2100, r0: 300, r1: 1300 });
    const A = { x: 60, y: 60, w: 1500, h: 4080 };
    b.scatter('crumb', 150, 3, 8, A); b.scatter('paperclip', 40, 5, 10, A); b.scatter('pill', 50, 4, 9, A);
    b.scatter('screw', 30, 5, 10, A); b.scatter('coin', 22, 7, 14, A); b.scatter('sugar', 40, 4, 10, A);
    b.scatter('pencap', 16, 10, 18, A); b.scatter('eraser', 10, 12, 20, A); b.scatter('cockroach', 3, 16, 22, A, { opts: { taunt: ['Шшш!'] } });
    b.pw('speed', 300, 3700, 14);
    // B
    const B = { x: 1700, y: 60, w: 1650, h: 4080 };
    b.scatter('pencil', 25, 14, 26, B); b.scatter('eraser', 20, 10, 22, B); b.scatter('testtube', 25, 14, 28, B);
    b.scatter('stickynote', 25, 12, 24, B); b.scatter('pill', 40, 6, 12, B); b.scatter('coin', 25, 8, 16, B);
    b.scatter('labmouse', 8, 16, 26, B); b.scatter('cockroach', 6, 20, 30, B); b.scatter('sugar', 40, 8, 14, B);
    b.scatter('paperclip', 30, 8, 14, B);
    for (const [x, y] of [[2000, 1500], [2900, 1200], [3100, 2600], [1900, 3300], [2600, 1800], [3200, 3700]]) b.item('burner', x, y, 34, { beh: 'burner', draw: Draws.burner, noEat: true, on: 2, off: 1.8, phase: x % 3 });
    b.pw('shield', 2700, 3300, 22);
    // C
    const Cc = { x: 3500, y: 60, w: 1450, h: 4080 };
    b.scatter('beaker', 20, 25, 45, Cc, { big: true }); b.scatter('flask', 20, 25, 45, Cc, { big: true });
    b.scatter('notebook', 8, 35, 55, Cc, { big: true }); b.scatter('sandwich', 6, 30, 50, Cc); b.scatter('donut', 10, 25, 40, Cc);
    b.scatter('calculator', 6, 30, 45, Cc); b.scatter('stapler', 8, 25, 40, Cc); b.scatter('petridish', 6, 30, 45, Cc);
    b.scatter('magnifier', 4, 35, 50, Cc); b.scatter('labmouse', 6, 25, 35, Cc); b.scatter('cockroach', 6, 30, 40, Cc);
    b.scatter('pencil', 15, 22, 35, Cc); b.scatter('coin', 20, 12, 20, Cc); b.scatter('testtube', 15, 20, 32, Cc);
    for (const [x, y] of [[3800, 800], [4500, 1400], [3700, 2800], [4600, 2700]]) b.item('burner', x, y, 48, { beh: 'burner', draw: Draws.burner, noEat: true, on: 2.2, off: 1.6, phase: y % 3 });
    b.pw('magnet', 4600, 500, 30);
    // D: большой финал
    const Dd = { x: 5100, y: 60, w: 1250, h: 4080 };
    b.item('microscope', 5700, 1150, 120); b.item('lamp', 6100, 600, 150); b.item('mug', 5450, 3000, 92, { v: 0 });
    b.item('notebook', 6000, 2500, 110); b.item('rack', 5650, 3750, 125); b.item('mug', 6150, 3600, 85, { v: 1 });
    b.scatter('ruler', 6, 50, 80, Dd); b.scatter('book', 10, 60, 90, Dd, { spaced: 1 }); b.scatter('sandwich', 6, 50, 70, Dd);
    b.scatter('beaker', 8, 50, 80, Dd); b.scatter('flask', 8, 50, 80, Dd); b.scatter('donut', 8, 45, 65, Dd);
    b.scatter('petridish', 6, 40, 60, Dd); b.scatter('calculator', 4, 45, 65, Dd);
    b.pw('grow', 5300, 300, 40);
  },
  init(L) {
    L.radio('pylypyuk', 'Стажёр на моём столе! Предупреждаю: барьеры пропускают только того же цвета!', 'angry');
    L.toast('Наступи в КРАСНУЮ лужу краски, чтобы пройти красный барьер', '#ff6b6b', 5);
  },
  update(L, dt) {
    const D = L.data, P = L.P;
    if (P.x > 1700) {
      D.fl = (D.fl === undefined ? 5 : D.fl) - dt;
      if (D.fl <= 0) {
        D.fl = Math.max(4, 9 - L.time / 60);
        const [x, y] = nearPlayer(L, 2.5);
        const kind = Math.random() < 0.6 ? 'slow' : 'ice';
        skyDrop(L, x, y, P.r * 1.8, 1.4, kind, { col: kind === 'slow' ? '#94d82d' : '#74c0fc', label: '⚗' });
        if (!D.said) { D.said = 1; L.radio('pylypyuk', 'Получай мой фирменный реактив! Липкий и холодный!', 'smug'); }
      }
    }
  },
});

// ============================================================
//  1-3. ЛАБИРИНТ НИИ — настоящий лабиринт с туманом на карте,
//  ключ-картами в тупиках, лазерами Кирилла и заначкой за кодом
// ============================================================
function genMaze(cols, rows, seed, sc, sr) {
  const R = U.rng(seed);
  const right = [], bottom = [], vis = [];
  for (let c = 0; c < cols; c++) { right.push(Array(rows).fill(true)); bottom.push(Array(rows).fill(true)); vis.push(Array(rows).fill(false)); }
  const stack = [[sc, sr]]; vis[sc][sr] = true;
  while (stack.length) {
    const [c, r] = stack[stack.length - 1];
    const nb = [];
    if (c > 0 && !vis[c - 1][r]) nb.push([c - 1, r]);
    if (c < cols - 1 && !vis[c + 1][r]) nb.push([c + 1, r]);
    if (r > 0 && !vis[c][r - 1]) nb.push([c, r - 1]);
    if (r < rows - 1 && !vis[c][r + 1]) nb.push([c, r + 1]);
    if (!nb.length) { stack.pop(); continue; }
    const [nc, nr] = nb[Math.floor(R() * nb.length)];
    if (nc < c) right[nc][nr] = false; if (nc > c) right[c][r] = false;
    if (nr < r) bottom[nc][nr] = false; if (nr > r) bottom[c][r] = false;
    vis[nc][nr] = true; stack.push([nc, nr]);
  }
  const M = { cols, rows, right, bottom };
  M.open = (c, r) => {
    const o = [];
    if (c > 0 && !right[c - 1][r]) o.push([c - 1, r]);
    if (c < cols - 1 && !right[c][r]) o.push([c + 1, r]);
    if (r > 0 && !bottom[c][r - 1]) o.push([c, r - 1]);
    if (r < rows - 1 && !bottom[c][r]) o.push([c, r + 1]);
    return o;
  };
  M.ekey = (a, b) => { const i = a[0] + a[1] * cols, j = b[0] + b[1] * cols; return Math.min(i, j) + '-' + Math.max(i, j); };
  M.bfs = (s, blocked = new Set()) => {
    const dist = new Map(), par = new Map(); const k = (c, r) => c + r * cols;
    dist.set(k(s[0], s[1]), 0); const q = [s];
    while (q.length) { const cur = q.shift(); for (const n of M.open(cur[0], cur[1])) { if (blocked.has(M.ekey(cur, n))) continue; const kk = k(n[0], n[1]); if (dist.has(kk)) continue; dist.set(kk, dist.get(k(cur[0], cur[1])) + 1); par.set(kk, cur); q.push(n); } }
    return { dist, par };
  };
  return M;
}
const MZ = { cols: 12, rows: 9, cell: 480, th: 50, hall: 1500 };
LEVELS.push({
  id: 'corridors', name: 'Лабиринт НИИ', chapter: 'Глава 1 · НИИ «Мозгоправ»', host: 'natasha', music: 'lab', bg: 'office',
  mech: { icon: '🌀', name: 'ЛАБИРИНТ', text: 'Настоящий лабиринт: туман на карте, ключ-карты в тупиках, двери на пути к выходу.' },
  desc: 'Кирилл спрятал ключ-карты в тупиках огромного лабиринта. Найди выход в зал и код от заначки!',
  unit: 1e-2, world: { w: MZ.cols * MZ.cell + MZ.hall, h: MZ.rows * MZ.cell }, start: { x: MZ.cell / 2, y: (MZ.rows - 0.5) * MZ.cell, r: 10 }, goal: { r: 165 },
  growK: 0.12, medals: [420, 660], seed: 303, mmColor: 'rgba(90,100,130,0.9)', burp: 'Заначка Кирилла — объедение!',
  objectives: [{ type: 'size' }, { type: 'flag', flag: 'simonDone', text: 'Открой заначку Кирилла (код)' }],
  milestones: [
    { r: 40, who: 'natasha', text: 'Кирюша, не подходи к нему! Он уже размером с кота!', expr: 'shock' },
    { r: 95, text: 'Ты стал таким большим, что можешь есть СТЕНЫ лабиринта (подсвечены зелёным)!' },
    { r: 130, who: 'egor', text: 'Он ест лабиринт изнутри! Все на выход!', expr: 'shock' },
  ],
  respawn: [['crumb', 3, 9], ['coin', 5, 12], ['wrapper', 5, 14], ['stickynote', 6, 16], ['phone', 10, 20], ['banana', 10, 20], ['papers', 12, 26], ['cup', 12, 26], ['cardbox', 20, 40]],
  build(b) {
    const { cols, rows, cell: CE, th: TH } = MZ;
    const L = b.L, R = b.r;
    const M = genMaze(cols, rows, 3031, 0, rows - 1);
    L.data.maze = M;
    const S = [0, rows - 1];
    const all = M.bfs(S);
    const K = (c, r) => c + r * cols;
    let exit = null, best = -1;
    for (let r = 0; r < rows; r++) { const d = all.dist.get(K(cols - 1, r)); if (d > best) { best = d; exit = [cols - 1, r]; } }
    const path = [exit]; let cur = exit;
    while (cur[0] !== S[0] || cur[1] !== S[1]) { cur = all.par.get(K(cur[0], cur[1])); path.unshift(cur); }
    const cx = c => c * CE + CE / 2, cy = r => r * CE + CE / 2;
    const st = { style: 'office', ed: 95 };
    // стены лабиринта
    for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
      if (c < cols - 1 && M.right[c][r]) b.wall((c + 1) * CE - TH / 2, Math.max(0, r * CE - TH / 2), TH, CE + TH - (r === 0 ? TH / 2 : 0) - (r === rows - 1 ? TH / 2 : 0), st);
      if (r < rows - 1 && M.bottom[c][r]) b.wall(Math.max(0, c * CE - TH / 2), (r + 1) * CE - TH / 2, CE + TH - (c === 0 ? TH / 2 : 0), TH, st);
    }
    // восточная граница с жёлтой дверью в зал
    for (let r = 0; r < rows; r++) {
      if (r === exit[1]) b.door('dY', cols * CE - TH / 2, r * CE + TH / 2, TH, CE - TH, 'key:yellow', { ed: 125 });
      b.wall(cols * CE - TH / 2, r * CE - TH / 2, TH, r === exit[1] ? TH : CE + TH, st);
    }
    // двери на главном пути
    const doorAt = (i, id, need) => {
      const a = path[i], c2 = path[i + 1];
      if (a[1] === c2[1]) b.door(id, Math.max(a[0], c2[0]) * CE - TH / 2, a[1] * CE + TH / 2, TH, CE - TH, need, { ed: 125 });
      else b.door(id, a[0] * CE + TH / 2, Math.max(a[1], c2[1]) * CE - TH / 2, CE - TH, TH, need, { ed: 125 });
      return M.ekey(a, c2);
    };
    const onPath = new Set(path.map(p => K(p[0], p[1])));
    const sideDeadEnd = (cells) => cells.some(k => !onPath.has(k) && M.open(k % cols, Math.floor(k / cols)).length === 1 && all.dist.get(k) >= 5);
    // двери ставим так, чтобы перед каждой был боковой тупик для ключа
    let i1 = Math.floor(path.length * 0.25), R0;
    for (; i1 < path.length * 0.5; i1++) { R0 = M.bfs(S, new Set([M.ekey(path[i1], path[i1 + 1])])).dist; if (sideDeadEnd([...R0.keys()])) break; }
    let i2 = Math.max(i1 + 4, Math.floor(path.length * 0.58)), R1;
    for (; i2 < path.length * 0.85; i2++) { R1 = M.bfs(S, new Set([M.ekey(path[i2], path[i2 + 1])])).dist; if (sideDeadEnd([...R1.keys()].filter(k => !R0.has(k)))) break; }
    const e1 = doorAt(i1, 'dR', 'key:red');
    const e2 = doorAt(i2, 'dB', 'key:blue');
    R0 = M.bfs(S, new Set([e1])).dist; R1 = M.bfs(S, new Set([e2])).dist;
    const pick = (cands) => {
      let bestC = null, bs = -Infinity;
      for (const k of cands) { const c = k % cols, r = Math.floor(k / cols); const de = M.open(c, r).length === 1; const s = all.dist.get(k) + (de ? 100 : 0) + (onPath.has(k) ? -50 : 0); if (s > bs) { bs = s; bestC = [c, r]; } }
      return bestC;
    };
    const kR = pick([...R0.keys()].filter(k => k !== K(S[0], S[1])));
    const kB = pick([...R1.keys()].filter(k => !R0.has(k)));
    const kY = pick([...all.dist.keys()].filter(k => !R1.has(k)));
    b.key('red', cx(kR[0]), cy(kR[1]), 26); b.key('blue', cx(kB[0]), cy(kB[1]), 28); b.key('yellow', cx(kY[0]), cy(kY[1]), 30);
    L.data.keysAt = { red: kR, blue: kB, yellow: kY }; L.data.exit = exit; L.data.path = path;
    // лазеры поперёк проходов (Кирилл их щёлкает)
    const edges = [];
    for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) for (const n of M.open(c, r)) if (n[0] > c || n[1] > r) edges.push([[c, r], n]);
    let placed = 0;
    for (let tries = 0; tries < 200 && placed < 7; tries++) {
      const [a, c2] = edges[Math.floor(R() * edges.length)];
      const ek = M.ekey(a, c2);
      if (ek === e1 || ek === e2 || K(a[0], a[1]) === K(S[0], S[1])) continue;
      const id = 'k' + placed;
      const near = all.dist.get(K(a[0], a[1])) < all.dist.get(K(c2[0], c2[1])) ? a : c2;
      if (a[1] === c2[1]) { const x = Math.max(a[0], c2[0]) * CE; b.laser(id, x, a[1] * CE + TH / 2, x, (a[1] + 1) * CE - TH / 2, { on: R() < 0.5, group: 'kc' }); b.button('b' + id, cx(near[0]) + (near[0] < Math.max(a[0], c2[0]) ? 90 : -90), cy(near[1]) + 120, 32, 'toggle:' + id, { col: '#ff6b6b' }); }
      else { const y = Math.max(a[1], c2[1]) * CE; b.laser(id, a[0] * CE + TH / 2, y, (a[0] + 1) * CE - TH / 2, y, { on: R() < 0.5, group: 'kc' }); b.button('b' + id, cx(near[0]) + 120, cy(near[1]) + (near[1] < Math.max(a[1], c2[1]) ? 90 : -90), 32, 'toggle:' + id, { col: '#ff6b6b' }); }
      placed++;
    }
    // предметы по клеткам: чем дальше от входа — тем крупнее
    const maxD = Math.max(...all.dist.values());
    const tiers = [
      [['crumb', 'coin', 'wrapper'], 3, 8.5, 9],
      [['stickynote', 'cup', 'phone', 'banana', 'coin', 'wrapper'], 7, 18, 7],
      [['papers', 'cardbox', 'book', 'donut', 'cup', 'phone'], 14, 32, 6],
      [['chair', 'plant', 'cardbox', 'sandwich', 'papers', 'extinguisher'], 22, 50, 5],
    ];
    for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
      const k = K(c, r), dn = all.dist.get(k) / maxD;
      const T = tiers[Math.min(3, Math.floor(dn * 4))];
      const area = { x: c * CE + TH, y: r * CE + TH, w: CE - TH * 2, h: CE - TH * 2 };
      for (let i = 0; i < T[3] + (dn < 0.12 ? 10 : 0); i++) b.scatter(R.pick(T[0]), 1, T[1], T[2], area);
      if (dn > 0.2) b.scatter('crumb', 3, 3, 7, area);
      if (M.open(c, r).length === 1 && k !== K(S[0], S[1])) {
        b.scatter(R.pick(T[0]), 1, T[2], T[2] * 1.4, area);
        if (R() < 0.3) b.pw(R.pick(['speed', 'magnet', 'shield', 'grow']), cx(c) + 60, cy(r) - 60, 14 + dn * 30);
      }
    }
    // Кирилл и Наташа бродят по лабиринту
    const mid = path[Math.floor(path.length * 0.45)];
    b.item('sci', cx(mid[0]), cy(mid[1]), 60, { id: 'kirill', who: 'kirill', draw: Draws.sci, beh: 'kirill', spd: 1.4, rotMode: 'none', always: true,
      lines: ['Пёсик! Иди сюда, пёсик!', 'Я спрятал карты в тупиках! Хи-хи!', 'Наташа, смотри — Никита!', 'Направо! Нет, налево!', 'Хочу нажать на кнопку!', 'А лазеры щекотные?'] });
    b.item('sci', cx(mid[0]) + 80, cy(mid[1]) + 60, 64, { id: 'natasha', who: 'natasha', draw: Draws.sci, beh: 'natasha', spd: 1.7, rotMode: 'none', always: true,
      lines: ['Кирюша, не трогай!', 'Кирилл, мы заблудились!', 'Ну почему я не пошла в бухгалтеры…', 'Кирюша, это не пёсик!', 'Где моя валерьянка?'] });
    // ЗАЛ: «Саймон» и заначка
    const HX = cols * CE, HW = MZ.hall, H = rows * CE;
    b.floor({ k: 'rect', x: HX, y: 0, w: HW, h: H, c: 'rgba(255,230,150,0.12)', mm: 'rgba(130,140,170,0.9)' });
    const sim = b.trig('simon', HX + 750, 800, 110, { act: 'flag:simonDone', seq: [0, 3, 1, 2, 3], pads: [
      { x: HX + 400, y: 1250, r: 95, col: '#ff4d4d' }, { x: HX + 1100, y: 1250, r: 95, col: '#4d7cff' }, { x: HX + 400, y: 1850, r: 95, col: '#3ddc84' }, { x: HX + 1100, y: 1850, r: 95, col: '#ffd23f' }] });
    sim.onStart = L2 => { L2.radio('kirill', 'О! Это мой код от заначки! Смотри на плиты — я подскажу!', 'crazy'); };
    sim.onFail = L2 => { L2.radio('kirill', 'Не-не-не! Ещё раз! Я сам иногда путаю.', 'crazy'); };
    sim.onDone = L2 => { L2.radio('natasha', 'Кирюша, ты рассказал ему код?! Ох…', 'facepalm'); };
    b.clear(HX, 500, HW, 1650);
    b.box(HX + 350, 2950, 1000, 1300, 60, { style: 'metal', ed: 150 }, { n: [[350, 300]] });
    b.door('vault', HX + 700, 2950, 300, 60, 'flag:simonDone', { ed: 160, col: '#be4bdb', msg: 'Заначка Кирилла открыта!' });
    b.clear(HX + 300, 2900, 1100, 1400);
    const V = { x: HX + 420, y: 3020, w: 860, h: 1160 };
    b.scatter('pizza', 7, 80, 120, V); b.scatter('donut', 8, 60, 100, V); b.scatter('sandwich', 6, 70, 100, V); b.pw('grow', HX + 850, 3600, 70);
    const HALLR = { x: HX + 60, y: 60, w: HW - 120, h: H - 120 };
    b.scatter('desk', 4, 80, 105, HALLR, { big: true, spaced: 1.1 }); b.scatter('sofa', 3, 90, 115, HALLR, { big: true, spaced: 1.1 });
    b.scatter('vending', 3, 80, 100, HALLR, { big: true, spaced: 1.1 }); b.scatter('cooler', 3, 50, 65, HALLR, { big: true }); b.scatter('plant', 5, 50, 75, HALLR, { big: true });
    b.scatter('chair', 10, 40, 60, HALLR); b.scatter('papers', 12, 30, 45, HALLR); b.scatter('cardbox', 8, 35, 55, HALLR);
  },
  events: {
    kirillPress(L, k) {
      const ls = L.lasers.filter(l => l.group === 'kc');
      if (!ls.length) return;
      const l = U.pick(ls); l.on = !l.on;
      k.say = { text: U.pick(['Пип!', 'Нажал!', 'Кнопочка!', 'Ой, а что я выключил?']), t: 1.6 };
      Sound.play('button');
      if (!L.data.kp) { L.data.kp = 1; L.radio('natasha', 'Кирюша опять жмёт на кнопки! Лазеры в лабиринте включаются сами по себе!', 'tired'); }
    },
  },
  init(L) {
    L.data.seen = new Uint8Array(MZ.cols * MZ.rows);
    L.radio('natasha', 'Кирюша, стой! Ой… Никита в лабиринте! Кирилл спрятал ключ-карты по тупикам. Карта открывается, только где ты уже был.', 'shock');
    L.toast('ЛАБИРИНТ: ищи ключ-карты в тупиках — красная → синяя → жёлтая', '#ffe066', 5);
  },
  update(L, dt) {
    const P = L.P, CE = MZ.cell, s = L.data.seen;
    const R = Math.max(CE * 0.8, Math.min(L.viewW || 1000, L.viewH || 1000) * 0.5);
    const c0 = Math.max(0, Math.floor((P.x - R) / CE)), c1 = Math.min(MZ.cols - 1, Math.floor((P.x + R) / CE));
    const r0 = Math.max(0, Math.floor((P.y - R) / CE)), r1 = Math.min(MZ.rows - 1, Math.floor((P.y + R) / CE));
    for (let c = c0; c <= c1; c++) for (let r = r0; r <= r1; r++) s[c + r * MZ.cols] = 1;
  },
  mmOverlay(L, ctx, mx, my, k) {
    const CE = MZ.cell, s = L.data.seen;
    ctx.fillStyle = 'rgba(12,10,28,0.96)';
    for (let c = 0; c < MZ.cols; c++) for (let r = 0; r < MZ.rows; r++) if (!s[c + r * MZ.cols]) ctx.fillRect(mx + c * CE * k - 0.5, my + r * CE * k - 0.5, CE * k + 1, CE * k + 1);
    if (!L.data.hallSeen && L.P.x > MZ.cols * CE) L.data.hallSeen = 1;
    if (!L.data.hallSeen) ctx.fillRect(mx + MZ.cols * CE * k, my, MZ.hall * k + 1, MZ.rows * CE * k + 1);
  },
});

// ============================================================
//  1-4. МАСТЕРСКАЯ ДАНИ — ПАРКУР над шахтой цеха + босс Пылесос-9000
// ============================================================
LEVELS.push({
  id: 'workshop', name: 'Мастерская Дани', chapter: 'Глава 1 · НИИ «Мозгоправ»', host: 'danya', music: 'lab', bg: 'pit',
  mech: { icon: '🦘', name: 'ПАРКУР', text: 'Пол — это пропасть! Прыгай по балкам, лифтам и рассыпающимся решёткам.' },
  desc: 'Цех над бездонной шахтой. Прыгай (ПРОБЕЛ) по балкам, лифтам, решёткам и батутам. В конце — Пылесос-9000!',
  unit: 2e-2, world: { w: 8600, h: 4200 }, start: { x: 800, y: 2150, r: 10 }, goal: { r: 100 }, pit: true, camFrac: 0.036,
  growK: 0.13, medals: [200, 330], seed: 404, mmColor: 'rgba(10,12,18,0.95)', burp: 'Пылесос на вкус как батарейки!',
  objectives: [{ type: 'flag', flag: 'arena', text: 'Допрыгай до арены Пылесоса' }, { type: 'flag', flag: 'vacuumDead', text: 'Победи Пылесос-9000' }],
  milestones: [
    { r: 22, who: 'danya', text: 'Эй, это мои болты! И не прыгай так — внизу шахта на сорок этажей!', expr: 'angry' },
    { r: 45, who: 'danya', text: 'Ржавые решётки я так и не починил… Ну, тем хуже для тебя!', expr: 'smug' },
  ],
  respawn: [['bolt', 3, 10], ['nut', 3, 10], ['screw', 4, 10], ['spring', 6, 16], ['chip', 8, 20], ['battery', 10, 24], ['gear', 10, 28]],
  build(b) {
    // A — стартовая площадка
    const A = b.plat(650, 1950, 450, 420, { style: 'floor' });
    b.checkpoint(720, 2020);
    b.sign(1000, 2100, 140, 'Вокруг — пропасть! ПРОБЕЛ (или ПКМ) — ПРЫЖОК через щель. Целься мышкой!', { col: '#ffd43b' });
    b.scatterOn('bolt', 35, 3, 8, A); b.scatterOn('nut', 30, 3, 8, A); b.scatterOn('screw', 25, 4, 8.5, A);
    b.scatterOn('spring', 15, 6, 10, A); b.scatterOn('chip', 8, 8, 12, A);
    // B — балки с узкими щелями
    const B1 = b.plat(1135, 2000, 320, 200), B2 = b.plat(1490, 1880, 280, 200), B3 = b.plat(1805, 2030, 300, 180);
    for (const p of [B1, B2, B3]) { b.scatterOn('nut', 10, 4, 9, p); b.scatterOn('spring', 4, 7, 11, p); }
    const B4 = b.plat(2140, 1800, 520, 520, { style: 'floor' });
    b.checkpoint(2250, 2050);
    b.scatterOn('spring', 15, 7, 13, B4); b.scatterOn('chip', 15, 8, 15, B4); b.scatterOn('battery', 10, 10, 17, B4); b.scatterOn('gear', 10, 10, 18, B4); b.scatterOn('bolt', 20, 5, 10, B4);
    b.pw('speed', 2580, 1880, 14);
    // C — лифты через пропасть
    b.plat(0, 0, 240, 200, { path: [[2680, 1960], [3240, 1960]], period: 7, style: 'lift' });
    b.plat(0, 0, 240, 160, { path: [[2680, 2220], [3240, 2220]], period: 7, phase: 3.5, style: 'lift' });
    b.sign(2560, 2050, 120, 'Лифт! Запрыгивай, когда он подъедет, и спрыгивай на другой стороне.', { col: '#ffd43b' });
    const C = b.plat(3500, 1650, 750, 850, { style: 'floor' });
    b.checkpoint(3600, 2050);
    b.scatterOn('wrench', 14, 12, 24, C); b.scatterOn('battery', 14, 12, 22, C); b.scatterOn('gear', 16, 12, 26, C); b.scatterOn('chip', 15, 10, 18, C);
    b.scatterOn('screwdriver', 8, 12, 24, C); b.scatterOn('minibot', 6, 14, 22, C); b.scatterOn('spring', 10, 8, 14, C);
    b.item('geyser', 3900, 1850, 45, { beh: 'geyser', draw: Draws.geyser, noEat: true, solid: false, cyc: 4, phase: 0 });
    b.item('geyser', 4050, 2300, 45, { beh: 'geyser', draw: Draws.geyser, noEat: true, solid: false, cyc: 4, phase: 2 });
    // D — рассыпающиеся решётки
    for (const [x, y] of [[4310, 1950], [4600, 1720], [4890, 1490], [5180, 1260]]) { const g = b.plat(x, y, 230, 230, { kind: 'crumble', life: 1.0 }); b.scatterOn('gear', 2, 12, 22, g); }
    const D = b.plat(5470, 700, 800, 800, { style: 'floor' });
    b.checkpoint(5600, 1100);
    b.scatterOn('toolbox', 10, 22, 40, D); b.scatterOn('drill', 10, 18, 35, D); b.scatterOn('tire', 8, 22, 38, D); b.scatterOn('oilcan', 8, 16, 30, D);
    b.scatterOn('gear', 15, 15, 32, D); b.scatterOn('battery', 12, 14, 26, D); b.scatterOn('wrench', 10, 16, 30, D);
    b.pw('shield', 6200, 760, 26);
    // E — конвейер вниз и остров со сварщиками
    b.plat(5650, 1560, 300, 900, { kind: 'conveyor', cdx: 1, cdy: 0, str: 0.42 });
    b.sign(5800, 1540, 120, 'Конвейер сносит в сторону! Держись против течения.', { col: '#ffd43b' });
    const E = b.plat(5400, 2520, 1100, 900, { style: 'floor' });
    b.checkpoint(5550, 2700);
    b.scatterOn('barrel', 10, 28, 50, E); b.scatterOn('toolbox', 10, 30, 52, E); b.scatterOn('tire', 8, 30, 48, E); b.scatterOn('drill', 8, 26, 42, E);
    b.scatterOn('minibot', 6, 30, 45, E, { opts: { beh: 'chase', hz: 0.07, spd: 1.0, aggro: 7, taunt: ['ОХРАНА!', 'Бип! Нарушитель!'] } });
    b.laser('weldE', 5800, 3050, 6100, 3050, { rotate: { cx: 5800, cy: 3050, len: 300, spd: 0.7 }, a: 0, w: 7, col: '#4dabf7' });
    // F — батут к арене (+ запасная ступенька)
    b.platC(6380, 2800, 70, { kind: 'spring', dir: 0, pow: 720, air: 0.8 });
    b.plat(6560, 2600, 180, 180);
    b.sign(6250, 2800, 130, 'Батут! Наступи — и тебя подбросит прямо к арене.', { col: '#ffd43b' });
    // арена
    const AR = b.plat(6800, 1300, 1600, 1800, { style: 'floor' });
    b.checkpoint(6950, 2200);
    for (const [x, y] of [[7200, 1800], [8000, 1800], [7200, 2600], [8000, 2600]]) b.item('barrel', x, y, 80, { noEat: true, pillar: true, v: 3, rotMode: 'none' });
    b.L.data.arena = AR;
    b.item('vacuum', 7600, 2200, 150, { id: 'vac', boss: true, bossName: 'ПЫЛЕСОС-9000', hp: 4, maxHp: 4, draw: Draws.vacuum, beh: 'boss_vacuum', noEat: true, always: true, onDashHit: vacuumHit, heading: Math.PI, mm: '#ff4d4d' });
    b.plat(8420, 2100, 150, 200);
    b.item('sci', 8495, 2200, 70, { who: 'danya', draw: Draws.sci, noEat: true, solid: false, rotMode: 'none', pose: 'hold', expr: 'smug', accName: 'remote', fly: true });
    b.scatterOn('gear', 8, 25, 40, AR, { avoid: (x, y) => U.dist(x, y, 7600, 2200) < 400 });
  },
  init(L) {
    L.radio('danya', 'Добро пожаловать в мою мастерскую! Аккуратнее — пол я ещё не доделал. Его просто нет.', 'smug');
  },
  update(L, dt) {
    const P = L.P;
    if (!L.flags.arena && P.falling <= 0 && P.air <= 0 && P.dashT <= 0 && L.platAt(P.x, P.y, 0) === L.data.arena) {
      L.flag('arena'); L.flag('bossStart'); Sound.playMusic('boss');
      L.radio('danya', 'Встречай, Никита! ПЫЛЕСОС-9000! Он гоняется, втягивает и таранит. Но если врежется в колонну или в край — оглохнет!', 'smug');
    }
    if (L.flags.vacuumDead && !L.data.vd) { L.data.vd = 1; L.toast('ПЫЛЕСОС-9000 ПОВЕРЖЕН!', '#69db7c', 3); }
  },
  onFall(L) { if (!L.data.fallSaid) { L.data.fallSaid = 1; L.radio('danya', 'Ха! Говорил же — шахта на сорок этажей. Хорошо, что там батут.', 'smug'); } },
});

// ============================================================
//  2-1. ГОРОД (Дима на джипе, пробки, река)
// ============================================================
function cityBlocks() {
  const roadsX = [600, 2200, 3800, 5400, 7000, 8600], roadsY = [600, 2200, 3800, 5400, 7000];
  const types = [
    ['downtown', 'downtown', 'plaza', 'downtown', 'downtown'],
    ['residential', 'park', 'market', 'residential', 'downtown'],
    ['residential', 'market', 'residential', 'park', 'residential'],
    ['park', 'residential', 'park', 'residential', 'market'],
  ];
  const out = [];
  for (let j = 0; j < 4; j++) for (let i = 0; i < 5; i++) out.push({ i, j, type: types[j][i], x: roadsX[i] + 110, y: roadsY[j] + 110, w: 1380, h: 1380 });
  return { roadsX, roadsY, blocks: out };
}
LEVELS.push({
  id: 'city', name: 'Город', chapter: 'Глава 2 · Город', host: 'dima', music: 'city', bg: 'city',
  mech: { icon: '🚦', name: 'СВЕТОФОРЫ', text: 'Час пик! Машины едут по правилам: переходи дорогу, когда им горит красный.' },
  desc: 'Никита на свободе! Ешь всё — от голубей до небоскрёбов. Дима гоняется на джипе.',
  unit: 5e-2, world: { w: 9200, h: 7600 }, start: { x: 1400, y: 6200, r: 10 }, goal: { r: 340 },
  growK: 0.13, medals: [260, 420], seed: 505, mmColor: 'rgba(90,150,90,0.85)', burp: 'Мэрия была с начинкой!',
  milestones: [
    { r: 25, who: 'dima', text: 'Объект обнаружен в парке. Размер — с собаку. Выдвигаюсь!', expr: 'determined' },
    { r: 60, who: 'dima', text: 'Он съел мой джип?! Нет, это был чужой джип. Фух.', expr: 'shock' },
    { r: 150, who: 'dima', text: 'Он ест ДОМА! Всем срочно эвакуироваться!', expr: 'shock' },
    { r: 250, who: 'egor', text: 'Никита, это небоскрёб! В нём люди… ну, были люди. Они уже убежали.', expr: 'facepalm' },
  ],
  respawn: [['leaf', 2, 7], ['can', 3, 7], ['pigeon', 5, 9], ['streettrash', 8, 16], ['person', 15, 21], ['cat', 12, 17], ['dog', 17, 25], ['bench', 25, 35], ['car', 40, 50], ['tree', 45, 90], ['kiosk', 50, 70], ['bus', 90, 115], ['house', 120, 180], ['building', 180, 300]],
  build(b) {
    const { roadsX, roadsY, blocks } = cityBlocks();
    const W = 9200, H = 7600;
    const riverY0 = 2850, riverY1 = 3150;
    const inRiver = (x, y, r) => y + r > riverY0 - 40 && y - r < riverY1 + 40;
    // дороги
    for (const x of roadsX) { b.floor({ k: 'rect', x: x - 110, y: 0, w: 220, h: H, pat: 'asphalt', T: 400, mm: 'rgba(60,60,70,0.9)' }); b.floor({ k: 'path', pts: [x, 0, x, H], w: 220, c: 'rgba(0,0,0,0)', dash: '#fff3bf' }); }
    for (const y of roadsY) { b.floor({ k: 'rect', x: 0, y: y - 110, w: W, h: 220, pat: 'asphalt', T: 400, mm: 'rgba(60,60,70,0.9)' }); b.floor({ k: 'path', pts: [0, y, W, y], w: 220, c: 'rgba(0,0,0,0)', dash: '#fff3bf' }); }
    for (const x of roadsX) for (const y of roadsY) { b.floor({ k: 'rect', x: x - 110, y: y - 110, w: 220, h: 220, pat: 'asphalt', T: 400 }); b.floor({ k: 'stripes', x: x - 110, y: y - 150, w: 220, h: 36, c1: '#f8f9fa', c2: 'rgba(0,0,0,0)', s: 22 }); }
    // река с мостами
    let lastX = 0;
    for (const x of roadsX.concat([W + 110])) {
      const x0 = lastX, x1 = x - 110;
      if (x1 > x0) { b.zone('water', { x: x0, y: riverY0, w: x1 - x0, h: riverY1 - riverY0 }); b.zone('current', { x: x0, y: riverY0, w: x1 - x0, h: riverY1 - riverY0 }, { dx: 1, dy: 0, str: 0.35, col: 'rgba(30,120,200,0.25)' }); b.zone('slow', { x: x0, y: riverY0, w: x1 - x0, h: riverY1 - riverY0 }, { mult: 0.7, col: 'rgba(0,0,0,0)' }); }
      lastX = x + 110;
    }
    for (const x of roadsX) { b.floor({ k: 'rect', x: x - 125, y: riverY0 - 20, w: 250, h: riverY1 - riverY0 + 40, c: '#868e96', stroke: '#495057', sw: 12 }); b.floor({ k: 'rect', x: x - 110, y: riverY0 - 20, w: 220, h: riverY1 - riverY0 + 40, pat: 'asphalt', T: 400 }); }
    // кварталы
    for (const B of blocks) {
      const R = { x: B.x, y: B.y, w: B.w, h: B.h };
      const o = { avoid: inRiver };
      const ob = { avoid: inRiver, big: true, spaced: 1.1 };
      if (B.type !== 'park') b.floor({ k: 'rect', x: B.x, y: B.y, w: B.w, h: B.h, pat: 'sidewalk', T: 360, mm: 'rgba(170,170,170,0.8)' });
      const start = B.i === 0 && B.j === 3;
      if (start) { b.clear(1200, 6000, 400, 400); }
      switch (B.type) {
        case 'park':
          b.scatter('tree', 9, 40, 80, R, ob); b.scatter('bench', 5, 25, 34, R, o); b.scatter('pigeon', 20, 5, 8, R, o);
          b.scatter('leaf', start ? 90 : 40, 2, 6, R, o); b.scatter('can', start ? 40 : 15, 3, 6, R, o); b.scatter('streettrash', 8, 8, 14, R, o);
          b.scatter('person', 6, 16, 20, R, o); b.scatter('dog', 2, 18, 24, R, o); b.scatter('cat', 3, 12, 16, R, o);
          b.scatter('icecart', 1, 34, 38, R, o); b.scatter('scooter', 2, 14, 18, R, o); b.scatter('bike', 2, 22, 28, R, o);
          if (start) { b.scatter('leaf', 120, 2, 7, { cx: 1400, cy: 6200, r1: 650 }); b.scatter('can', 50, 3, 7, { cx: 1400, cy: 6200, r1: 650 }); b.scatter('leaf', 40, 3, 8, { cx: 1400, cy: 6200, r1: 500 }); b.scatter('can', 20, 3, 7, { cx: 1400, cy: 6200, r1: 500 }); b.scatter('pigeon', 12, 5, 9, { cx: 1400, cy: 6200, r1: 600 }); b.scatter('shawarma', 6, 6, 10, { cx: 1400, cy: 6200, r1: 600 }); }
          break;
        case 'residential':
          b.scatter('house', 4, 120, 165, R, ob); b.scatter('tree', 6, 40, 70, R, ob); b.scatter('car', 3, 42, 46, R, ob);
          b.scatter('mailbox', 4, 10, 14, R, o); b.scatter('hydrant', 4, 8, 12, R, o); b.scatter('person', 6, 16, 20, R, o);
          b.scatter('cat', 3, 12, 16, R, o); b.scatter('dog', 2, 18, 24, R, o); b.scatter('streettrash', 6, 10, 16, R, o); b.scatter('leaf', 20, 2, 6, R, o);
          break;
        case 'market':
          b.scatter('kiosk', 4, 52, 70, R, ob); b.scatter('umbrella', 6, 30, 45, R, ob); b.scatter('shawarma', 12, 6, 12, R, o);
          b.scatter('pizza', 8, 8, 16, R, o); b.scatter('icecart', 2, 34, 38, R, o); b.scatter('person', 15, 15, 21, R, o);
          b.scatter('pigeon', 10, 5, 8, R, o); b.scatter('can', 12, 3, 6, R, o); b.scatter('streettrash', 6, 8, 14, R, o);
          break;
        case 'downtown':
          b.scatter('building', 3, 190, 290, R, ob); b.scatter('person', 10, 16, 20, R, o); b.scatter('car', 3, 42, 46, R, ob);
          b.scatter('streetlamp', 5, 10, 14, R, o); b.scatter('hydrant', 3, 8, 12, R, o); b.scatter('bench', 3, 26, 32, R, o); b.scatter('bus', 1, 100, 110, R, ob);
          break;
        case 'plaza':
          b.item('fountain', B.x + B.w / 2, B.y + B.h / 2, 140); b.item('liberty', B.x + 250, B.y + 250, 90);
          b.scatter('bench', 6, 26, 32, R, o); b.scatter('pigeon', 25, 5, 8, R, o); b.scatter('person', 15, 15, 21, R, o); b.scatter('icecart', 2, 34, 38, R, o);
          break;
      }
    }
    // движение: машины по кольцам вокруг кварталов
    const lane = 55;
    const loop = (i, j, cw) => {
      const x0 = roadsX[i] + (cw ? lane : -lane), x1 = roadsX[i + 1] - (cw ? lane : -lane), y0 = roadsY[j] + (cw ? lane : -lane), y1 = roadsY[j + 1] - (cw ? lane : -lane);
      return cw ? [[x0, y0], [x1, y0], [x1, y1], [x0, y1]] : [[x0, y0], [x0, y1], [x1, y1], [x1, y0]];
    };
    // светофоры на всех перекрёстках
    const inters = [];
    roadsX.forEach((x, i) => roadsY.forEach((y, j) => inters.push({ x, y, off: (i * 2.3 + j * 3.7) % 12, red: 0 })));
    b.L.data.inters = inters;
    // пешеходные кнопки: «все машины — стоп»
    for (const I of inters.filter((_, q) => q % 3 === 1)) b.button('ped' + I.x + '_' + I.y, I.x + 150, I.y + 150, 30, (L) => { I.red = 7; L.toast('Пешеходный переход! Машины стоят 7 секунд', '#69db7c', 2); }, { col: '#69db7c' });
    // час пик: машины по кольцам вокруг каждого квартала
    let n = 0;
    for (let j = 0; j < 4; j++) for (let i = 0; i < 5; i++) {
      const path = loop(i, j, true);
      for (let c = 0; c < 3; c++) {
        const seg = (n + c) % 4, [ax, ay] = path[seg], [bx2, by2] = path[(seg + 1) % 4];
        const t = (n + c) % 7 === 0 ? 'bus' : (n + c) % 9 === 4 ? 'truck' : 'car';
        b.item(t, (ax + bx2) / 2, (ay + by2) / 2, t === 'bus' ? 105 : t === 'truck' ? 75 : 45, { beh: 'car', path, spd: t === 'car' ? 1.8 : 1.0, hz: 0.09, data: { pi: (seg + 1) % 4 }, rotMode: 'dir', rot: Math.atan2(by2 - ay, bx2 - ax), always: true });
      }
      n++;
    }
    // Дима на джипе
    b.item('sci', 2200, 4600, 55, { id: 'dima', who: 'dima', draw: Draws.jeep, beh: 'sci', spd: 1.8, keep: 6, range: 2500, rate: 3.2, always: true, rotMode: 'none',
      shot: { k: 'net', eff: 'stun', hz: 0, col: '#fff', stunT: 1.3 },
      lines: ['Стоять! Полиция НИИ!', 'Никита, это для твоего же блага!', 'Сетка — лучший друг охотника!', 'Я ловил даже голубей!'], scared: ['Мой джип!', 'Никита, нет!', 'Задний ход!'] });
    b.pw('speed', 1900, 5800, 16); b.pw('shield', 4600, 4600, 40); b.pw('magnet', 3000, 1500, 70); b.pw('grow', 7700, 1400, 140); b.pw('speed', 6200, 6300, 60);
  },
  init(L) {
    L.radio('dima', 'Внимание всем постам! Слизень с лицом Никиты в городском парке! Час пик — машин полно.', 'determined');
    L.toast('ЧАС ПИК: переходи дороги на КРАСНЫЙ для машин! Зелёные кнопки — пешеходный переход', '#ffe066', 5.5);
  },
  update(L, dt) {
    for (const I of L.data.inters) if (I.red > 0) I.red -= dt;
  },
  drawUnder(ctx, L, v, z, t) {
    for (const I of L.data.inters) {
      if (I.x < v.x - 300 || I.x > v.x + v.w + 300 || I.y < v.y - 300 || I.y > v.y + v.h + 300) continue;
      const hs = cityLight(L, I, true), vs = cityLight(L, I, false);
      // стоп-линии
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillRect(I.x - 122, I.y - 110, 10, 110); ctx.fillRect(I.x + 112, I.y, 10, 110); ctx.fillRect(I.x, I.y - 122, 110, 10); ctx.fillRect(I.x - 110, I.y + 112, 110, 10);
      const head = (x, y, st) => {
        rect(ctx, x - 14, y - 34, 28, 68, 6, '#212529', OL, 3);
        const cols = [['#ff3b3b', '#4a1414'], ['#ffd43b', '#4a3f14'], ['#3ddc84', '#123d24']];
        const on = st === 'green' ? 2 : st === 'yellow' ? 1 : 0;
        for (let k = 0; k < 3; k++) { circ(ctx, x, y - 21 + k * 21, 8, k === on ? cols[k][0] : cols[k][1], null); if (k === on) { ctx.save(); ctx.globalAlpha = 0.35; circ(ctx, x, y - 21 + k * 21, 16, cols[k][0], null); ctx.restore(); } }
      };
      head(I.x - 140, I.y - 140, hs); head(I.x + 140, I.y + 140, hs);
      head(I.x + 140, I.y - 140, vs); head(I.x - 140, I.y + 140, vs);
    }
  },
});

// ============================================================
//  2-2. КАНАЛИЗАЦИЯ (темнота, стелс-дроны, вентили, крокодил)
// ============================================================
LEVELS.push({
  id: 'sewer', name: 'Канализация', chapter: 'Глава 2 · Город', host: 'danya', music: 'dark', bg: 'sewer',
  mech: { icon: '🔦', name: 'СТЕЛС', text: 'Темнота и дроны-прожекторы. Не попадайся в лучи, крути вентили течений.' },
  desc: 'Темно и сыро. Прячься от лучей дронов, крути вентили, ищи кольца. Где-то живёт крокодил…',
  unit: 3e-2, world: { w: 6000, h: 4500 }, start: { x: 250, y: 250, r: 10 }, goal: { r: 160 },
  growK: 0.12, medals: [360, 560], seed: 606, dark: 0.93, lightR: 7, mmColor: 'rgba(40,45,55,0.95)', burp: 'Крокодил был как резиновый!',
  objectives: [{ type: 'size' }, { type: 'count', tag: 'ring', target: 5, text: 'Найди 5 потерянных колец' }],
  milestones: [
    { r: 30, who: 'danya', text: 'Мои дроны-прожекторы видят всё. Ну, почти всё. Ну, что светят.', expr: 'smug' },
    { r: 80, who: 'danya', text: 'Он стал больше дронов! Отзываю их… ой, поздно.', expr: 'shock' },
    { r: 130, text: 'Теперь ты больше крокодила. Его время пришло!' },
  ],
  respawn: [['cockroach', 3, 9], ['rat', 5, 14], ['bone', 6, 14], ['sock', 8, 18], ['duck', 8, 16], ['bottle', 10, 22], ['slime', 12, 32], ['boot', 14, 30], ['garbagebag', 20, 45]],
  build(b) {
    const st = { style: 'pipe', ed: 135 };
    // блоки между тоннелями
    const xs = [[500, 1800], [2300, 3500], [4000, 5500]], ys = [[500, 1400], [1900, 2700], [3200, 4000]];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      if (i === 1 && j === 1) continue; // логово крокодила
      if (i === 2 && j === 2) continue; // свалка
      const [x0, x1] = xs[i], [y0, y1] = ys[j];
      b.wall(x0, y0, x1 - x0, y1 - y0, st);
    }
    // стены вокруг логова/свалки с проходами
    b.wall(2300, 1900, 400, 60, st); b.wall(3100, 1900, 400, 60, st); b.wall(2300, 2640, 400, 60, st); b.wall(3100, 2640, 400, 60, st);
    b.wall(4000, 3200, 600, 60, st); b.wall(4900, 3200, 600, 60, st); b.wall(4000, 3940, 1500, 60, st);
    // течения
    b.zone('current', { x: 500, y: 1400, w: 5000, h: 500 }, { id: 'c1', dx: -1, dy: 0, str: 0.95, col: 'rgba(80,140,60,0.35)', arrow: 'rgba(200,255,150,0.5)' });
    b.zone('current', { x: 3500, y: 2700, w: 500, h: 1300 }, { id: 'c2', dx: 0, dy: -1, str: 0.9, col: 'rgba(80,140,60,0.35)', arrow: 'rgba(200,255,150,0.5)' });
    b.zone('current', { x: 5500, y: 500, w: 500, h: 3500 }, { id: 'c3', dx: 0, dy: -1, str: 0.6, col: 'rgba(80,140,60,0.35)', arrow: 'rgba(200,255,150,0.5)' });
    b.hold('v1', 2050, 250, 55, 'toggle:c1', { need: 2, col: '#69db7c' });
    b.hold('v2', 3750, 4250, 55, 'toggle:c2', { need: 2, col: '#69db7c' });
    b.hold('v3', 5750, 4250, 55, 'toggle:c3', { need: 2, col: '#69db7c' });
    b.sign(1850, 250, 200, 'Вентиль! Постой на нём — и течение в главном тоннеле остановится.');
    // дроны
    const drone = (path, len = 480) => b.item('drone', path[0][0], path[0][1], 30, { beh: 'drone', draw: Draws.drone, path, spd: 2.2, alarmSpd: 1, cone: { a: 0, w: 0.42, len }, always: true, light: 2, mm: '#ff922b' });
    drone([[250, 900], [250, 3600]]); drone([[2050, 600], [2050, 3700]]); drone([[700, 250], [3200, 250]]);
    drone([[800, 4250], [3200, 4250]]); drone([[4100, 2950], [5300, 2950]]); drone([[3750, 600], [3750, 1300]]);
    drone([[4300, 250], [5300, 250]]); drone([[700, 2950], [1700, 2950]]);
    // крокодил
    b.item('croc', 2900, 2300, 120, { aggro: 5, taunt: ['ГРРР!', '*щёлк-щёлк*'], mm: '#2f9e44' });
    // кольца в тупиках
    for (const [x, y] of [[5800, 300], [250, 4300], [2900, 2000], [4700, 3600], [1150, 2950]]) b.item('ring', x, y, 12, { tag: 'ring', glow: '#ffe066', bob: true, light: 4, mm: '#ffe066', pts: 150 });
    // светящиеся грибы
    b.scatter('mushroom', 50, 8, 18, { x: 0, y: 0, w: 6000, h: 4500 });
    // предметы
    const all = { x: 0, y: 0, w: 6000, h: 4500 };
    const nur = { cx: 250, cy: 250, r0: 30, r1: 700 };
    b.scatter('cockroach', 120, 3, 8, nur, { opts: { beh: 'wander', hz: 0 } }); b.scatter('bone', 50, 4, 8.5, nur); b.scatter('rat', 25, 5, 9, nur); b.scatter('sock', 20, 6, 9, nur);
    b.scatter('cockroach', 120, 3, 8, { x: 0, y: 0, w: 2300, h: 1400 }, { opts: { beh: 'wander', hz: 0 } });
    b.scatter('bone', 40, 5, 9, { x: 0, y: 0, w: 2300, h: 1400 }); b.scatter('rat', 30, 5, 9, { x: 0, y: 0, w: 2300, h: 1400 });
    b.scatter('rat', 60, 8, 16, all); b.scatter('sock', 40, 8, 18, all); b.scatter('duck', 30, 8, 16, all); b.scatter('bottle', 30, 10, 22, all);
    b.scatter('slime', 40, 12, 32, all); b.scatter('boot', 25, 14, 30, all); b.scatter('phone', 15, 12, 20, all);
    b.scatter('garbagebag', 25, 20, 50, all); b.scatter('pipejunk', 15, 30, 70, all);
    const dump = { x: 4050, y: 3260, w: 1400, h: 660 };
    b.scatter('garbagebag', 15, 40, 80, dump); b.scatter('pipejunk', 8, 50, 90, dump); b.scatter('boot', 10, 30, 50, dump);
    const lair = { x: 2350, y: 1960, w: 1100, h: 680 };
    b.scatter('bone', 20, 15, 40, lair); b.scatter('garbagebag', 6, 40, 70, lair);
    b.pw('speed', 900, 250, 14); b.pw('shield', 2050, 3600, 30); b.pw('magnet', 5750, 2000, 50);
  },
  onAlarm(L, it) { if (!L.data.al) { L.data.al = 1; L.radio('danya', 'Ага! Попался в луч! Дроны, сетки — огонь!', 'smug'); } },
  init(L) {
    L.radio('danya', 'Никита в канализации. Запускаю дронов-прожекторов. В темноте тебе не спрятаться!', 'determined');
    L.toast('Не попадайся в лучи дронов, пока ты меньше их!', '#ffe066', 5);
  },
  update(L, dt) {
    if (L.flags.alarm > 0) L.flags.alarm -= dt;
  },
});
