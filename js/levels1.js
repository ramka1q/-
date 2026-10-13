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
//  1-3. КОРИДОРЫ НИИ (Кирилл и Наташа, ключ-карты, «Саймон»)
// ============================================================
LEVELS.push({
  id: 'corridors', name: 'Коридоры НИИ', chapter: 'Глава 1 · НИИ «Мозгоправ»', host: 'natasha', music: 'lab', bg: 'office',
  desc: 'Лабиринт кабинетов. Ищи ключ-карты, обходи лазеры, повтори код Кирилла.',
  unit: 1e-2, world: { w: 6000, h: 4400 }, start: { x: 900, y: 3500, r: 10 }, goal: { r: 165 },
  growK: 0.12, medals: [420, 660], seed: 303, mmColor: 'rgba(90,100,130,0.9)', burp: 'Заначка Кирилла — объедение!',
  objectives: [{ type: 'size' }, { type: 'flag', flag: 'simonDone', text: 'Открой заначку Кирилла (код)' }],
  milestones: [
    { r: 40, who: 'natasha', text: 'Кирюша, не подходи к нему! Он уже размером с кота!', expr: 'shock' },
    { r: 90, text: 'Ты стал таким большим, что можешь есть СТЕНЫ (подсвечены зелёным)!' },
    { r: 140, who: 'egor', text: 'Он ест здание изнутри! Все на выход!', expr: 'shock' },
  ],
  respawn: [['crumb', 3, 9], ['coin', 5, 12], ['wrapper', 5, 14], ['stickynote', 6, 16], ['phone', 10, 20], ['banana', 10, 20], ['papers', 12, 26], ['cup', 12, 26], ['cardbox', 20, 40]],
  build(b) {
    const T = 60, ED = 92;
    const st = { style: 'office', ed: ED };
    // перегородки: горизонтальный коридор y 2000–2400, вертикальные x 1800–2100 и 3800–4100
    // комната A (кладовка, старт) x0–1800 y2400–4400: выход наверх
    b.wall(0, 2400, 600, T, st); b.wall(1000, 2400, 800, T, st);
    b.wall(1800 - T, 2400, T, 2000, st);
    // комната B (кабинет Егора) x0–1800 y0–2000: красная дверь снизу
    b.wall(0, 2000 - T, 700, T, st); b.wall(1100, 2000 - T, 700, T, st); b.door('dB', 700, 2000 - T, 400, T, 'key:red', { ed: 120 });
    b.wall(1800 - T, 0, T, 2000, st);
    // комната C (столовая) x2100–3800 y0–2000: вход только из левого коридора (за лазером)
    b.wall(2100, 0, T, 700, st); b.wall(2100, 1100, T, 900, st); b.wall(3800 - T, 0, T, 2000, st);
    b.wall(2100, 2000 - T, 1700, T, st);
    // комната D (игровая Кирилла) x2100–3800 y2400–4400: открыта сверху
    b.wall(2100, 2400, T, 2000, st); b.wall(3800 - T, 2400, T, 900, st); b.wall(3800 - T, 3700, T, 700, st);
    b.wall(2100, 2400, 400, T, st); b.wall(2900, 2400, 900, T, st);
    // комната E (серверная) x4100–6000 y0–2000: синяя дверь снизу
    b.wall(4100, 0, T, 2000, st);
    b.wall(4100, 2000 - T, 600, T, st); b.wall(5100, 2000 - T, 900, T, st); b.door('dE', 4700, 2000 - T, 400, T, 'key:blue', { ed: 120 });
    // комната F (зал совещаний) x4100–6000 y2400–4400: жёлтая дверь сверху
    b.wall(4100, 2400, T, 2000, st);
    b.wall(4100, 2400, 600, T, st); b.wall(5100, 2400, 900, T, st); b.door('dF', 4700, 2400, 400, T, 'key:yellow', { ed: 120 });
    // заначка внутри F
    b.box(5300, 3600, 700, 800, T, { style: 'metal', ed: 140 }, {});
    b.door('vault', 5300, 3800, T, 400, 'flag:simonDone', { ed: 150, col: '#be4bdb', msg: 'Заначка Кирилла открыта!' });
    // лазеры в вертикальных коридорах (их переключает Кирилл)
    b.laser('k1', 1800, 1500, 2100, 1500, { on: true, group: 'kc' });
    b.laser('k2', 1800, 3300, 2100, 3300, { on: false, group: 'kc' });
    b.laser('k3', 3800, 1500, 4100, 1500, { on: false, group: 'kc' });
    b.laser('k4', 3800, 2900, 4100, 2900, { on: true, group: 'kc' });
    b.button('bk1', 1950, 1800, 34, 'toggle:k1', { col: '#ff6b6b' });
    b.button('bk2', 1950, 3000, 34, 'toggle:k2', { col: '#ff6b6b' });
    b.button('bk3', 3950, 1800, 34, 'toggle:k3', { col: '#ff6b6b' });
    b.button('bk4', 3950, 2600, 34, 'toggle:k4', { col: '#ff6b6b' });
    b.sign(1950, 2150, 140, 'Красная кнопка переключает лазер в коридоре. Вход в столовую — выше по коридору!');
    // красный ключ в клетке из лазеров (столовая)
    b.laser('c1', 3150, 650, 3740, 650, { on: true });
    b.laser('c2', 3150, 60, 3150, 650, { on: true });
    b.button('bc', 2350, 1700, 40, 'toggle:c1,c2', { col: '#4dabf7' });
    b.key('red', 3500, 330, 28);
    b.sign(2350, 1550, 120, 'Синяя кнопка выключает лазерную клетку с ключом!');
    // серверная: вращающийся лазер, жёлтый ключ
    b.laser('rot', 5050, 1000, 5750, 1000, { rotate: { cx: 5050, cy: 1000, len: 700, spd: 0.9 }, a: 0, noEmit: false, w: 6 });
    b.key('yellow', 5800, 250, 30);
    // кабинет Егора: синий ключ
    b.key('blue', 300, 300, 28);
    // «Саймон» в зале совещаний
    const sim = b.trig('simon', 4800, 2750, 110, { act: 'flag:simonDone', seq: [0, 3, 1, 2, 3], pads: [
      { x: 4450, y: 3150, r: 95, col: '#ff4d4d' }, { x: 5150, y: 3150, r: 95, col: '#4d7cff' }, { x: 4450, y: 3800, r: 95, col: '#3ddc84' }, { x: 5150, y: 3800, r: 95, col: '#ffd23f' }] });
    sim.onStart = L => { const k = L.byId.kirill; L.radio('kirill', 'О! Это мой код от заначки! Красный, зелёный, синий… ой, я тебе подскажу! Смотри на плиты!', 'crazy'); if (k && !k.dead) k.say = { text: 'Смотри-смотри!', t: 2 }; };
    sim.onFail = L => { L.radio('kirill', 'Не-не-не! Ещё раз! Я сам иногда путаю.', 'crazy'); };
    sim.onDone = L => { L.radio('natasha', 'Кирюша, ты рассказал ему код?! Ох…', 'facepalm'); };
    b.clear(4200, 2500, 1800, 1100); b.clear(4200, 2500, 1100, 1900);
    // ----- предметы -----
    const A = { x: 60, y: 2470, w: 1680, h: 1870 };
    const nur = { cx: 900, cy: 3500, r0: 40, r1: 650 };
    b.scatter('crumb', 160, 3, 8, nur); b.scatter('coin', 40, 4, 8.5, nur); b.scatter('wrapper', 40, 4, 9, nur); b.scatter('stickynote', 20, 6, 12, { cx: 900, cy: 3500, r0: 200, r1: 900 });
    b.scatter('crumb', 120, 3, 8, A); b.scatter('coin', 40, 5, 10, A); b.scatter('wrapper', 40, 5, 12, A);
    b.scatter('stickynote', 30, 6, 14, A); b.scatter('phone', 8, 10, 16, A); b.scatter('banana', 10, 10, 18, A);
    b.scatter('papers', 10, 12, 20, A); b.scatter('cardbox', 8, 20, 35, A); b.pw('speed', 1500, 4200, 14);
    const corr = [{ x: 60, y: 2020, w: 5880, h: 360 }, { x: 1830, y: 60, w: 240, h: 4280 }, { x: 3830, y: 60, w: 240, h: 4280 }];
    for (const c of corr) { b.scatter('crumb', 40, 4, 10, c); b.scatter('coin', 15, 6, 12, c); b.scatter('wrapper', 15, 6, 14, c); b.scatter('cup', 8, 12, 22, c); b.scatter('papers', 6, 14, 24, c); }
    const Bv = { x: 60, y: 60, w: 1680, h: 1860 };
    b.item('desk', 900, 600, 80); b.item('computer', 900, 520, 34); b.item('chair', 900, 800, 45);
    b.scatter('papers', 15, 18, 30, Bv); b.scatter('plant', 4, 30, 50, Bv, { big: true }); b.scatter('cup', 10, 15, 25, Bv);
    b.scatter('book', 10, 20, 35, Bv); b.scatter('clock', 3, 25, 40, Bv); b.scatter('cardbox', 6, 30, 50, Bv, { big: true }); b.scatter('phone', 6, 14, 22, Bv);
    const Cv = { x: 2170, y: 60, w: 1560, h: 1860 };
    b.item('vending', 2300, 300, 70); b.item('vending', 2500, 300, 70, {}); b.item('cooler', 2750, 280, 50);
    b.scatter('cup', 25, 10, 24, Cv); b.scatter('banana', 15, 12, 22, Cv); b.scatter('wrapper', 25, 8, 16, Cv); b.scatter('donut', 10, 18, 30, Cv);
    b.scatter('sandwich', 8, 20, 32, Cv); b.scatter('chair', 6, 30, 45, Cv, { big: true }); b.scatter('trashbin', 4, 30, 40, Cv, { big: true });
    const Dv = { x: 2170, y: 2470, w: 1560, h: 1870 };
    b.item('sofa', 2950, 4100, 90); b.scatter('duck', 15, 10, 22, Dv); b.scatter('wrapper', 30, 8, 16, Dv); b.scatter('donut', 10, 16, 28, Dv);
    b.scatter('banana', 10, 12, 22, Dv); b.scatter('plant', 4, 30, 45, Dv, { big: true }); b.scatter('cardbox', 6, 25, 45, Dv, { big: true });
    b.pw('magnet', 2300, 4250, 22);
    const Ev = { x: 4170, y: 60, w: 1770, h: 1860 };
    b.scatter('computer', 10, 35, 50, Ev, { big: true, avoid: (x, y) => U.dist(x, y, 5050, 1000) < 120 }); b.scatter('printer', 6, 40, 55, Ev, { big: true }); b.scatter('chip', 20, 12, 24, Ev);
    b.scatter('phone', 15, 14, 24, Ev); b.scatter('papers', 15, 20, 32, Ev); b.scatter('extinguisher', 4, 30, 40, Ev); b.scatter('cardbox', 6, 35, 55, Ev, { big: true });
    const Fv = { x: 4170, y: 2470, w: 1100, h: 1870 };
    b.scatter('desk', 4, 70, 100, Fv, { big: true, spaced: 1.1 }); b.scatter('chair', 10, 40, 60, Fv); b.scatter('plant', 4, 50, 75, Fv); b.scatter('sofa', 2, 90, 115, Fv, { big: true });
    b.scatter('cooler', 3, 50, 65, Fv); b.scatter('papers', 10, 30, 45, Fv); b.scatter('vending', 2, 85, 105, Fv, { big: true });
    // крупная мебель в коридорах — еда для финала уровня
    for (const c of corr) b.clear(c.x - 30, c.y - 30, c.w + 60, c.h + 60);
    b.scatter('sofa', 1, 90, 110, Bv, { big: true }); b.scatter('vending', 1, 80, 95, Bv, { big: true }); b.scatter('plant', 3, 50, 70, Bv, { big: true });
    b.scatter('desk', 2, 80, 100, Cv, { big: true, spaced: 1.1 }); b.scatter('cooler', 2, 50, 60, Cv, { big: true });
    b.scatter('desk', 3, 80, 110, Dv, { big: true, spaced: 1.1 }); b.scatter('vending', 2, 80, 100, Ev, { big: true }); b.scatter('cooler', 2, 50, 65, Ev, { big: true });
    const Vv = { x: 5370, y: 3670, w: 560, h: 660 };
    b.scatter('pizza', 6, 80, 120, Vv); b.scatter('donut', 8, 60, 100, Vv); b.scatter('sandwich', 6, 70, 100, Vv); b.pw('grow', 5650, 4000, 70);
    // Кирилл и Наташа
    b.item('sci', 2900, 3200, 60, { id: 'kirill', who: 'kirill', draw: Draws.sci, beh: 'kirill', spd: 1.5, rotMode: 'none', always: true,
      lines: ['Пёсик! Иди сюда, пёсик!', 'Красная кнопка самая вкусная!', 'Наташа, смотри — Никита!', 'Я пилот! Вжжжж!', 'Хочу нажать на кнопку!', 'А лазеры щекотные?'] });
    b.item('sci', 3000, 3300, 64, { id: 'natasha', who: 'natasha', draw: Draws.sci, beh: 'natasha', spd: 1.7, rotMode: 'none', always: true,
      lines: ['Кирюша, не трогай!', 'Кирилл, положи пульт!', 'Ну почему я не пошла в бухгалтеры…', 'Кирюша, это не пёсик!', 'Где моя валерьянка?'] });
  },
  events: {
    kirillPress(L, k) {
      const ls = L.lasers.filter(l => l.group === 'kc');
      const l = U.pick(ls); l.on = !l.on;
      k.say = { text: U.pick(['Пип!', 'Нажал!', 'Кнопочка!', 'Ой, а что я выключил?']), t: 1.6 };
      Sound.play('button');
      if (!L.data.kp) { L.data.kp = 1; L.radio('natasha', 'Кирюша опять жмёт на кнопки! Лазеры в коридорах включаются сами по себе!', 'tired'); }
    },
  },
  init(L) {
    L.radio('natasha', 'Кирюша, стой! Ой… Никита сбежал из лаборатории! Все кабинеты заперты на ключ-карты.', 'shock');
    L.toast('Ищи ключ-карты: красная → синяя → жёлтая', '#ffe066', 5);
  },
});

// ============================================================
//  1-4. МАСТЕРСКАЯ ДАНИ (конвейеры, ящики, босс Пылесос-9000)
// ============================================================
LEVELS.push({
  id: 'workshop', name: 'Мастерская Дани', chapter: 'Глава 1 · НИИ «Мозгоправ»', host: 'danya', music: 'lab', bg: 'workshop',
  desc: 'Конвейеры, ящики на кнопки и БОСС: Пылесос-9000!',
  unit: 2e-2, world: { w: 6400, h: 4800 }, start: { x: 500, y: 500, r: 10 }, goal: { r: 150 },
  growK: 0.12, medals: [300, 480], seed: 404, mmColor: 'rgba(120,125,135,0.9)', burp: 'Пылесос на вкус как батарейки!',
  objectives: [{ type: 'flag', flag: 'plates', text: 'Поставь ящики на 3 кнопки' }, { type: 'flag', flag: 'arenaOpen', text: 'Поверни рубильник цеха' }, { type: 'flag', flag: 'vacuumDead', text: 'Победи Пылесос-9000' }],
  milestones: [
    { r: 30, who: 'danya', text: 'Эй! Это мои болты! Я их по размеру сортировал!', expr: 'angry' },
    { r: 70, who: 'danya', text: 'Ничего-ничего. В конце цеха тебя ждёт мой лучший робот…', expr: 'smug' },
  ],
  respawn: [['bolt', 3, 10], ['nut', 3, 10], ['screw', 4, 10], ['spring', 6, 16], ['chip', 8, 20], ['battery', 10, 24], ['gear', 10, 30], ['wrench', 15, 35], ['screwdriver', 15, 32], ['drill', 25, 45], ['toolbox', 35, 60]],
  build(b) {
    const T = 60;
    const st = { style: 'metal', ed: 125 };
    // A | B перегородка x=2200 (y0–2400), проход 1000–1400
    b.wall(2200, 0, T, 1000, st); b.wall(2200, 1400, T, 1000, st);
    // A,B | C — y=2400, дверь B1 по кнопкам
    b.wall(0, 2400, 3150, T, st); b.door('B1', 3150, 2400, 300, T, 'plates', { ed: 140, col: '#ffd43b', msg: 'Ворота склада открыты!' }); b.wall(3450, 2400, 1010, T, st);
    // стена x=4400 с дверью арены (рубильник)
    b.wall(4400, 0, T, 3600, st); b.door('arenaDoor', 4400, 3600, T, 400, 'flag:arenaOpen', { ed: 140, col: '#ff6b6b', msg: 'Проход к арене открыт!' }); b.wall(4400, 4000, T, 800, st);
    // треснувшие стены-шорткаты (рывком)
    b.wall(900, 1450, 600, 40, { style: 'metal' }); b.wall(900, 1650, 600, 40, { style: 'metal' });
    b.wall(900, 1490, 40, 160, { style: 'metal', dash: true }); b.wall(1460, 1490, 40, 160, { style: 'metal', dash: true });
    b.pw('grow', 1200, 1570, 22); b.item('chip', 1080, 1570, 14); b.item('chip', 1320, 1570, 14);
    b.sign(800, 1570, 120, 'За треснувшей стеной что-то есть… Рывок!');
    // конвейеры в зоне A
    b.zone('conveyor', { x: 300, y: 900, w: 1600, h: 140 }, { dx: 1, dy: 0, str: 0.45 });
    b.zone('conveyor', { x: 1900, y: 900, w: 140, h: 1200 }, { dx: 0, dy: 1, str: 0.45 });
    b.zone('conveyor', { x: 300, y: 2100, w: 1740, h: 140 }, { dx: -1, dy: 0, str: 0.45 });
    b.zone('conveyor', { x: 300, y: 1040, w: 140, h: 1060 }, { dx: 0, dy: -1, str: 0.45 });
    b.zone('conveyor', { x: 700, y: 1250, w: 1000, h: 120 }, { dx: 1, dy: 0, str: 0.7 });
    b.zone('conveyor', { x: 700, y: 1780, w: 1000, h: 120 }, { dx: -1, dy: 0, str: 0.7 });
    b.floor({ k: 'stripes', x: 2200, y: 950, w: 60, h: 500, s: 30 });
    // склад B: 3 ящика и 3 кнопки
    b.plate('p1', 2650, 2150, 70, 'B1'); b.plate('p2', 3300, 2150, 70, 'B1'); b.plate('p3', 3950, 2150, 70, 'B1');
    b.item('crate', 2700, 1300, 62, { mov: true, heavy: 0.2, ed: 135, rotMode: 'none', mm: '#c68b4b' });
    b.item('crate', 3300, 900, 62, { mov: true, heavy: 0.2, ed: 135, rotMode: 'none', mm: '#c68b4b' });
    b.item('crate', 3900, 1400, 62, { mov: true, heavy: 0.2, ed: 135, rotMode: 'none', mm: '#c68b4b' });
    b.sign(2600, 1150, 200, 'Толкай тяжёлые ящики на жёлтые кнопки в полу!');
    b.clear(2300, 60, 2050, 2300);
    // цех C: роборуки-сварщики, масло, рубильник
    for (const [x, y, s] of [[900, 3500, 1], [2100, 3300, -1.2], [3300, 3800, 0.9]]) b.laser('weld' + x, x, y, x + 380, y, { rotate: { cx: x, cy: y, len: 380, spd: s }, a: x, w: 7, col: '#4dabf7' });
    b.zone('ice', { x: 1300, y: 4200, r: 220 }); b.zone('ice', { x: 2700, y: 2900, r: 200 }); b.zone('ice', { x: 3900, y: 3300, r: 160 });
    b.hold('valve', 4100, 4500, 60, 'flag:arenaOpen', { need: 2 });
    b.sign(3900, 4400, 220, 'Рубильник! Постой на нём, пока не провернётся.');
    // арена D
    b.box(4700, 1100, 1500, 1700, T, { style: 'metal' }, { s: [[550, 400]] });
    for (const [x, y] of [[5050, 1500], [5850, 1500], [5050, 2350], [5850, 2350]]) b.item('barrel', x, y, 80, { noEat: true, pillar: true, v: 3, rotMode: 'none' });
    b.event(5450, 2550, 160, (L) => { L.flag('bossStart'); L.radio('danya', 'Встречай, Никита! ПЫЛЕСОС-9000! Втягивает всё, даже твои шансы!', 'smug'); Sound.playMusic('boss'); });
    b.item('vacuum', 5450, 1700, 150, { id: 'vac', boss: true, bossName: 'ПЫЛЕСОС-9000', hp: 3, maxHp: 3, draw: Draws.vacuum, beh: 'boss_vacuum', noEat: true, always: true, onDashHit: vacuumHit, heading: Math.PI / 2, mm: '#ff4d4d' });
    b.item('sci', 6300, 950, 70, { who: 'danya', draw: Draws.sci, noEat: true, solid: false, rotMode: 'none', pose: 'hold', expr: 'smug', accName: 'remote' });
    b.clear(4700, 1100, 1500, 1700);
    // ----- предметы -----
    const A = { x: 60, y: 60, w: 2100, h: 2300 };
    const nur = { cx: 500, cy: 500, r0: 40, r1: 650 };
    b.scatter('bolt', 90, 3, 8, nur); b.scatter('nut', 80, 3, 8, nur); b.scatter('screw', 50, 4, 8.5, nur); b.scatter('spring', 20, 6, 12, { cx: 500, cy: 500, r0: 200, r1: 900 }); b.scatter('chip', 15, 8, 14, { cx: 500, cy: 500, r0: 300, r1: 1000 });
    b.scatter('bolt', 90, 3, 8, A); b.scatter('nut', 80, 3, 8, A); b.scatter('screw', 50, 4, 9, A); b.scatter('spring', 30, 6, 14, A);
    b.scatter('chip', 25, 8, 16, A); b.scatter('battery', 20, 10, 18, A); b.scatter('gear', 20, 10, 20, A); b.scatter('minibot', 8, 12, 18, A);
    b.pw('speed', 1500, 200, 14);
    const Bz = { x: 2300, y: 60, w: 2050, h: 2300 };
    b.scatter('wrench', 20, 14, 26, Bz); b.scatter('screwdriver', 16, 14, 26, Bz); b.scatter('battery', 25, 12, 22, Bz); b.scatter('gear', 25, 14, 28, Bz);
    b.scatter('spring', 20, 10, 18, Bz); b.scatter('chip', 20, 12, 20, Bz); b.scatter('minibot', 10, 16, 26, Bz); b.scatter('nut', 30, 6, 12, Bz);
    const Cz = { x: 60, y: 2500, w: 4300, h: 2240 };
    b.scatter('toolbox', 14, 30, 55, Cz, { big: true }); b.scatter('drill', 14, 25, 42, Cz); b.scatter('tire', 12, 30, 50, Cz, { big: true }); b.scatter('barrel', 10, 35, 55, Cz, { big: true });
    b.scatter('oilcan', 12, 20, 35, Cz); b.scatter('wrench', 20, 20, 35, Cz); b.scatter('gear', 30, 18, 40, Cz); b.scatter('battery', 25, 15, 28, Cz); b.scatter('chip', 20, 15, 25, Cz);
    b.scatter('minibot', 10, 34, 48, Cz, { opts: { beh: 'chase', hz: 0.07, spd: 1.1, aggro: 7, taunt: ['ОХРАНА!', 'Бип-бип! Нарушитель!'] } });
    b.pw('shield', 2000, 4500, 26); b.pw('magnet', 3600, 2700, 30);
    const Dz = { x: 4500, y: 60, w: 1850, h: 4680 };
    b.scatter('toolbox', 12, 45, 75, Dz, { big: true }); b.scatter('barrel', 10, 45, 75, Dz, { big: true }); b.scatter('tire', 10, 45, 65, Dz, { big: true });
    b.scatter('drill', 10, 35, 55, Dz); b.scatter('gear', 20, 30, 55, Dz); b.scatter('oilcan', 10, 30, 45, Dz); b.scatter('minibot', 6, 40, 60, Dz);
  },
  init(L) {
    L.radio('danya', 'Добро пожаловать в мою мастерскую! Тут всё на конвейерах. Даже обед.', 'smug');
  },
  update(L, dt) {
    if (!L.flags.plates && L.triggers.filter(t => t.k === 'plate').every(t => t.active)) { L.flag('plates'); }
    if (L.flags.vacuumDead && !L.data.vd) { L.data.vd = 1; L.toast('ПЫЛЕСОС-9000 ПОВЕРЖЕН!', '#69db7c', 3); }
  },
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
    let n = 0;
    for (let j = 0; j < 4; j++) for (let i = 0; i < 5; i++) {
      if ((i + j) % 2 === 1) continue;
      const path = loop(i, j, n % 2 === 0);
      const k = n % 4;
      const [sx, sy] = path[k % 4];
      const t = n % 5 === 0 ? 'bus' : n % 7 === 3 ? 'truck' : 'car';
      b.item(t, sx, sy, t === 'bus' ? 105 : t === 'truck' ? 75 : 45, { beh: 'traffic', path, spd: t === 'car' ? 1.7 : 0.9, hz: 0.06, data: { pi: (k + 1) % 4 }, rotMode: 'dir' });
      const [sx2, sy2] = path[(k + 2) % 4];
      b.item('car', sx2, sy2, 45, { beh: 'traffic', path, spd: 1.5, hz: 0.06, data: { pi: (k + 3) % 4 }, rotMode: 'dir' });
      n++;
    }
    // Дима на джипе
    b.item('sci', 2200, 4600, 55, { id: 'dima', who: 'dima', draw: Draws.jeep, beh: 'sci', spd: 1.8, keep: 6, range: 2500, rate: 3.2, always: true, rotMode: 'none',
      shot: { k: 'net', eff: 'stun', hz: 0, col: '#fff', stunT: 1.3 },
      lines: ['Стоять! Полиция НИИ!', 'Никита, это для твоего же блага!', 'Сетка — лучший друг охотника!', 'Я ловил даже голубей!'], scared: ['Мой джип!', 'Никита, нет!', 'Задний ход!'] });
    b.pw('speed', 1900, 5800, 16); b.pw('shield', 4600, 4600, 40); b.pw('magnet', 3000, 1500, 70); b.pw('grow', 7700, 1400, 140); b.pw('speed', 6200, 6300, 60);
  },
  init(L) { L.radio('dima', 'Внимание всем постам! Слизень с лицом Никиты в городском парке!', 'determined'); L.tip('cars', 'Машины опасны, пока ты меньше их. Река сносит течением!', '#ffe066'); },
  update(L, dt) {
    const P = L.P;
    for (const it of L.items) if (it.beh === 'traffic' && !it.dead) it.harmless = L.canEat(it);
  },
});

// ============================================================
//  2-2. КАНАЛИЗАЦИЯ (темнота, стелс-дроны, вентили, крокодил)
// ============================================================
LEVELS.push({
  id: 'sewer', name: 'Канализация', chapter: 'Глава 2 · Город', host: 'danya', music: 'dark', bg: 'sewer',
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
