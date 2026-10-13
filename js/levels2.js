'use strict';
// ============================================================
//  УРОВНИ, часть 2: база, океан, вулкан, Земля, космос, финал
// ============================================================

// ============================================================
//  2-3. ВОЕННАЯ БАЗА (прожекторы, минное поле, босс Т-Димон)
// ============================================================
LEVELS.push({
  id: 'base', name: 'Военная база', chapter: 'Глава 2 · Город', host: 'dima', music: 'base', bg: 'base',
  desc: 'Прожекторы, мины, мини-танки. В конце — Т-ДИМОН. Съешь его топливные баки!',
  unit: 0.1, world: { w: 7000, h: 5000 }, start: { x: 450, y: 4550, r: 10 }, goal: { r: 200 },
  growK: 0.13, medals: [360, 560], seed: 707, mmColor: 'rgba(160,140,90,0.9)', burp: 'Танк — это просто большая консерва!',
  objectives: [{ type: 'count', tag: 'fuel', target: 4, text: 'Съешь 4 топливных бака Т-Димона' }, { type: 'flag', flag: 'tankEaten', text: 'Съешь заглохший Т-Димон' }],
  milestones: [
    { r: 30, who: 'dima', text: 'Объект проник на базу! Прожектористы, не спать!', expr: 'angry' },
    { r: 55, text: 'Мешки с песком теперь съедобные!' },
    { r: 66, who: 'dima', text: 'Он дорос до моих топливных баков… Т-Димон, к бою!', expr: 'shock' },
  ],
  respawn: [['leaf', 2, 6], ['can', 3, 6], ['rock', 2, 9], ['cone', 5, 9], ['guard', 8, 10], ['sandbag', 10, 22], ['ammobox', 14, 30], ['flag', 10, 15], ['porta', 14, 20], ['crate', 20, 50], ['barrel', 15, 40], ['jeep', 25, 45], ['tent', 40, 80], ['heli', 55, 85]],
  build(b) {
    const sb = { style: 'sandbags', ed: 55 }, fe = { style: 'metal', ed: 78 };
    // заборы зон
    b.wall(2500, 0, 50, 2000, fe); b.wall(2500, 2500, 50, 2500, fe);
    b.wall(4500, 0, 50, 1000, fe); b.wall(4500, 1500, 50, 2000, fe); b.wall(4500, 4000, 50, 1000, fe);
    // укрытия из мешков в казармах
    b.wall(600, 3600, 900, 50, sb); b.wall(1200, 2700, 50, 700, sb); b.wall(300, 1800, 1000, 50, sb); b.wall(1700, 1200, 50, 900, sb); b.wall(900, 600, 900, 50, sb);
    // мешки на арене (укрытия от снарядов)
    b.wall(5300, 1800, 400, 50, sb); b.wall(6200, 3150, 400, 50, sb); b.wall(5200, 3300, 50, 400, sb); b.wall(6500, 1400, 50, 400, sb);
    // прожекторы
    for (const [x, y, base] of [[1300, 3100, -1.2], [700, 2300, 0], [2000, 1700, 3.14], [1300, 300, 1.57], [3500, 2200, 0], [3500, 600, 1.57], [3600, 4500, -1.57]]) b.item('watchtower', x, y, 40, { beh: 'searchlight', draw: Draws.searchlight, base, cone: { a: base, w: 0.35, len: 650 }, sweep: 1.1, noEat: false, ed: 50, always: true, light: 0, mm: '#fff3bf' });
    // турели (стреляют при тревоге)
    for (const [x, y] of [[2300, 3900], [2300, 1000], [1000, 1200], [4300, 2200], [3000, 3400], [4300, 4500]]) b.item('turret', x, y, 30, { beh: 'turret', draw: Draws.turret, rate: 1.1, range: 900, shot: { k: 'bolt', hz: 0.05, col: '#ffd43b', speed: 0, spread: 0.15 }, data: { off: true }, col: '#4a572d', col2: '#5c6b38' });
    // минное поле
    const mineArea = { x: 2600, y: 100, w: 1850, h: 4800 };
    b.clear(2550, 2000, 1950, 500); b.clear(3300, 100, 300, 4800);
    b.scatter('mine', 70, 14, 20, mineArea, { big: true, clearMin: 0, opts: { pts: 5 } });
    b.floor({ k: 'rect', x: 2550, y: 2000, w: 1950, h: 500, c: 'rgba(120,100,60,0.35)', mm: 'rgba(120,100,60,0.6)' });
    b.floor({ k: 'rect', x: 3300, y: 100, w: 300, h: 4800, c: 'rgba(120,100,60,0.35)', mm: 'rgba(120,100,60,0.6)' });
    b.sign(2600, 2250, 160, 'Минное поле! Безопасные тропы — светлые полосы. Мины взрываются, пока ты меньше их.');
    // ---- предметы ----
    const Z1 = { x: 50, y: 50, w: 2400, h: 4900 };
    const nur = { cx: 450, cy: 4550, r0: 30, r1: 700 };
    b.scatter('leaf', 100, 2, 7, nur); b.scatter('can', 50, 3, 7, nur); b.scatter('rock', 60, 2, 8, nur); b.scatter('cone', 15, 5, 8, nur);
    b.scatter('leaf', 70, 2, 6, { x: 50, y: 3600, w: 1500, h: 1350 }); b.scatter('can', 40, 3, 6, { x: 50, y: 3600, w: 1500, h: 1350 }); b.scatter('rock', 60, 2, 8, Z1);
    b.scatter('cone', 30, 5, 8, Z1); b.scatter('guard', 30, 8.5, 10, Z1, { opts: { panic: ['Тревога!', 'Слизень!', 'Мама!'] } });
    b.scatter('sandbag', 30, 12, 22, Z1); b.scatter('ammobox', 25, 14, 24, Z1); b.scatter('flag', 6, 10, 14, Z1); b.scatter('porta', 6, 14, 18, Z1);
    b.scatter('tent', 8, 40, 55, Z1, { big: true, spaced: 1.2 }); b.scatter('jeep', 6, 25, 30, Z1, { big: true }); b.scatter('crate', 15, 18, 35, Z1); b.scatter('barrel', 15, 15, 25, Z1);
    b.pw('speed', 900, 4300, 14); b.pw('shield', 2000, 2800, 24);
    const Z2 = { x: 2600, y: 50, w: 1850, h: 4900 };
    b.scatter('guard', 20, 9, 10, Z2); b.scatter('ammobox', 20, 25, 40, Z2); b.scatter('crate', 15, 30, 50, Z2); b.scatter('tent', 5, 50, 70, Z2, { big: true });
    b.scatter('minitank', 8, 35, 50, Z2, { opts: { taunt: ['Цель вижу!', 'Пли!'] } }); b.scatter('heli', 4, 55, 70, Z2, { opts: { beh: 'wander', spd: 0.5 } }); b.scatter('radar', 3, 50, 65, Z2);
    b.pw('magnet', 3450, 3500, 40);
    const Z3 = { x: 4600, y: 50, w: 2350, h: 4900 };
    b.scatter('crate', 14, 40, 70, Z3, { big: true, spaced: 1.1 }); b.scatter('ammobox', 14, 35, 55, Z3); b.scatter('tent', 5, 60, 80, Z3, { big: true, spaced: 1.2 });
    b.scatter('jeep', 6, 40, 50, Z3, { big: true }); b.scatter('heli', 4, 60, 80, Z3, { big: true }); b.scatter('barrel', 14, 30, 55, Z3); b.scatter('guard', 12, 9, 10, Z3);
    // топливные баки и танк
    for (const [x, y] of [[5000, 1100], [6600, 1100], [5000, 3900], [6600, 3900]]) b.item('fueltank', x, y, 60, { tag: 'fuel', onEat: tankFuelEaten, mm: '#ffd43b', pts: 300, noMag: true });
    b.item('tank', 5800, 2500, 170, { id: 'tank', boss: true, bossName: 'Т-ДИМОН', hp: 4, maxHp: 4, draw: Draws.tank, beh: 'boss_tank', noEat: true, always: true, heading: Math.PI, hz: 0.1, rotMode: 'none',
      onEat: (L) => { L.flag('tankEaten'); L.toast('Т-ДИМОН СЪЕДЕН!', '#69db7c', 3); }, pts: 2000 });
  },
  onAlarm(L) {
    for (const it of L.items) if (it.beh === 'turret') it.data.off = false;
    if (!L.data.al) { L.data.al = 1; L.radio('dima', 'Объект в луче! Турели — огонь!', 'angry'); }
  },
  init(L) { L.radio('dima', 'Добро пожаловать на базу, Никита. Прожекторы, мины, турели. И мой малыш Т-Димон.', 'smug'); L.tip('lights', 'Попал в луч прожектора — включатся турели!', '#fff3bf'); },
  update(L, dt) {
    if (L.flags.alarm > 0) { L.flags.alarm -= dt; if (L.flags.alarm <= 0) for (const it of L.items) if (it.beh === 'turret') it.data.off = true; }
    for (const it of L.items) if (it.t === 'mine' && !it.dead && !L.canEat(it) && U.dist(it.x, it.y, L.P.x, L.P.y) < it.r + L.P.r) {
      it.dead = true; Sound.play('boom'); L.burst(it.x, it.y, 20, '#ff922b', it.r * 6, it.r * 0.5); L.cam.shake = 12;
    }
    if (!L.flags.bossStart && L.P.x > 4650) { L.flag('bossStart'); Sound.playMusic('boss'); }
  },
});

// ============================================================
//  3-1. ОКЕАН (подлодка Егора, течения, водовороты)
// ============================================================
LEVELS.push({
  id: 'ocean', name: 'Океан', chapter: 'Глава 3 · Весь мир', host: 'egor', music: 'ocean', bg: 'ocean',
  desc: 'Огромный океан: рифы, акулы, корабли и острова. Егор охотится на подлодке.',
  unit: 0.5, world: { w: 12000, h: 8000 }, start: { x: 1500, y: 6800, r: 10 }, goal: { r: 400 },
  growK: 0.14, medals: [420, 660], seed: 808, mmColor: 'rgba(25,113,194,0.9)', burp: 'Солёненько!',
  milestones: [
    { r: 30, who: 'egor', text: 'Никита вышел в открытое море. Погружаюсь!', expr: 'determined' },
    { r: 80, who: 'egor', text: 'Он больше моей подлодки! Торпеды бессильны!', expr: 'shock' },
    { r: 200, who: 'egor', text: 'Он ест КОРАБЛИ. И нефтяные вышки. И, кажется, остров.', expr: 'facepalm' },
  ],
  respawn: [['plankton', 1.5, 5], ['shrimp', 3, 7], ['fish', 4, 14], ['starfish', 4, 9], ['crab', 5, 11], ['turtle', 14, 30], ['dolphin', 15, 28], ['boat', 25, 55], ['shark', 25, 45], ['whale', 120, 200], ['ship', 120, 200], ['iceberg', 60, 220], ['island', 200, 330]],
  build(b) {
    const W = 12000, H = 8000;
    b.floor({ k: 'poly', pts: [0, 5200, 1800, 4800, 3800, 5400, 4600, 6600, 4200, 8000, 0, 8000], c: 'rgba(130,220,230,0.35)', mm: 'rgba(130,220,230,0.5)' });
    b.floor({ k: 'poly', pts: [5200, 3000, 9000, 2700, 11000, 3600, 10200, 5000, 7000, 5600, 5600, 4800], c: 'rgba(3,25,55,0.45)', mm: 'rgba(3,25,55,0.7)' });
    b.floor({ k: 'rect', x: 0, y: 0, w: W, h: 1200, c: 'rgba(220,240,255,0.25)', mm: 'rgba(220,240,255,0.4)' });
    b.floor({ k: 'text', x: 7600, y: 4200, text: 'МАРИАНСКАЯ ВПАДИНА', size: 140, c: 'rgba(255,255,255,0.08)' });
    // течения и водовороты
    b.zone('current', { x: 0, y: 3600, w: W, h: 600 }, { dx: 1, dy: 0, str: 0.45, col: 'rgba(165,216,255,0.12)' });
    b.zone('current', { x: 11000, y: 1200, w: 700, h: 6000 }, { dx: 0, dy: 1, str: 0.4, col: 'rgba(165,216,255,0.12)' });
    b.zone('vortex', { x: 4000, y: 2000, r: 380 }, { str: 0.55, to: { x: 9300, y: 6400 } });
    b.zone('vortex', { x: 9800, y: 6800, r: 380 }, { str: 0.55, to: { x: 4600, y: 2400 } });
    // риф
    const reef = { x: 0, y: 5000, w: 4400, h: 3000 };
    const inReef = (x, y) => inPoly(x, y, [0, 5200, 1800, 4800, 3800, 5400, 4600, 6600, 4200, 8000, 0, 8000]);
    b.scatter('plankton', 260, 1.5, 4.5, reef, { avoid: (x, y) => !inReef(x, y) });
    b.scatter('shrimp', 120, 3, 7, reef, { avoid: (x, y) => !inReef(x, y) });
    b.scatter('fish', 160, 4, 9, reef, { avoid: (x, y) => !inReef(x, y) });
    b.scatter('starfish', 50, 4, 9, reef, { avoid: (x, y) => !inReef(x, y) });
    b.scatter('crab', 40, 5, 11, reef, { avoid: (x, y) => !inReef(x, y) });
    b.scatter('coral', 60, 12, 40, reef, { avoid: (x, y) => !inReef(x, y) });
    b.scatter('chest', 6, 16, 24, reef, { avoid: (x, y) => !inReef(x, y), opts: { pts: 500, glow: '#ffe066' } });
    b.scatter('puffer', 15, 8, 16, reef, { avoid: (x, y) => !inReef(x, y) || U.dist(x, y, 1500, 6800) < 900 });
    b.clear(1300, 6600, 400, 400);
    const nur = { cx: 1500, cy: 6800, r0: 40, r1: 750 };
    b.scatter('plankton', 160, 1.5, 4.5, nur); b.scatter('shrimp', 70, 3, 7, nur); b.scatter('fish', 90, 4, 9, nur); b.scatter('starfish', 25, 4, 8, nur);
    // открытый океан
    const sea = { x: 0, y: 1000, w: W, h: 7000 };
    b.scatter('fish', 260, 6, 16, sea); b.scatter('plankton', 120, 2, 5, sea); b.scatter('turtle', 40, 14, 30, sea); b.scatter('dolphin', 30, 15, 28, sea);
    const farStart = (x, y) => U.dist(x, y, 1500, 6800) < 2600;
    b.scatter('octopus', 25, 12, 30, sea, { avoid: farStart, opts: { taunt: ['Буль!'] } }); b.scatter('shark', 28, 20, 45, sea, { avoid: farStart, opts: { taunt: ['*клац*', 'Ням?'] } });
    b.scatter('boat', 40, 25, 55, { x: 0, y: 0, w: W, h: 3500 }); b.scatter('whale', 10, 140, 200, { x: 3000, y: 1500, w: 8000, h: 5500 }, { big: true });
    b.scatter('jelly', 70, 8, 22, { x: 5000, y: 4400, w: 2400, h: 2200 }); b.scatter('jelly', 30, 15, 40, sea, { avoid: farStart });
    b.scatter('buoy', 20, 6, 10, { x: 0, y: 0, w: W, h: 4000 });
    // судоходный путь
    for (let i = 0; i < 9; i++) { const y = 1500 + (i % 3) * 350, dir = i % 2 ? 1 : -1; const x0 = 600 + i * 1200; b.item('ship', x0, y, 130 + (i % 4) * 25, { beh: 'patrol', path: dir > 0 ? [[600, y], [11400, y]] : [[11400, y + 120], [600, y + 120]], spd: 0.35, rotMode: 'dir', hz: 0.05 }); }
    b.scatter('mine', 40, 14, 22, { x: 7600, y: 2300, w: 2600, h: 1000 }, { opts: { pts: 5 } });
    // нефтевышки, айсберги, острова
    for (const [x, y] of [[6200, 2300], [8800, 5500], [3400, 3000], [10200, 2600]]) b.item('oilrig', x, y, 140);
    b.scatter('iceberg', 30, 40, 240, { x: 0, y: 0, w: W, h: 1200 }, { big: true, spaced: 1.1 });
    for (const [x, y, r] of [[10800, 4800, 330], [9700, 7300, 260], [11300, 7000, 220], [7800, 7400, 280], [6000, 800, 300]]) b.item('island', x, y, r);
    // подлодка Егора
    b.item('sci', 5200, 4300, 70, { id: 'egorsub', who: 'egor', draw: Draws.sub, beh: 'sci', spd: 1.3, keep: 6, range: 1800, rate: 4.5, always: true, rotMode: 'dir',
      shot: { k: 'torpedo', homing: 1.1, hz: 0.08, speed: 0, edible: true, r: 16 },
      lines: ['Торпеда с антиаппетитином пошла!', 'Никита, всплывай!', 'Перископ поднять!', 'Это для науки!'], scared: ['Срочное погружение!', 'Полный назад!'] });
    b.pw('speed', 2300, 6300, 16); b.pw('magnet', 6000, 5000, 40); b.pw('shield', 7600, 3000, 60); b.pw('grow', 10500, 1800, 160);
  },
  init(L) { L.radio('egor', 'Никита уплыл в океан. Я на подлодке. Торпеды заряжены антиаппетитином!', 'determined'); L.tip('vortex', 'Водовороты переносят на другой конец океана!', '#74c0fc'); },
});

// ============================================================
//  3-2. ВУЛКАН (реки лавы, крио-переключатели, извержения)
// ============================================================
LEVELS.push({
  id: 'volcano', name: 'Остров-вулкан', chapter: 'Глава 3 · Весь мир', host: 'pylypyuk', music: 'volcano', bg: 'volcano',
  desc: 'Остров разрезан реками лавы. Замораживай их крио-кнопками Пилипюка и съешь вулкан!',
  unit: 2, world: { w: 9000, h: 9000 }, start: { x: 4500, y: 8250, r: 10 }, goal: { r: 420 },
  growK: 0.1, medals: [360, 560], seed: 909, mmColor: 'rgba(25,113,194,0.9)', burp: 'Горячо-горячо! Но вкусно!',
  objectives: [{ type: 'count', tag: 'volcano', target: 1, text: 'Съешь вулкан' }],
  milestones: [
    { r: 40, who: 'pylypyuk', text: 'Мои криогенераторы заморозят лаву… и тебя заодно!', expr: 'smug' },
    { r: 120, who: 'pylypyuk', text: 'Он ест динозавров?! Откуда на острове динозавры?! Я не заказывал!', expr: 'shock' },
    { r: 250, text: 'Лава больше не обжигает — ты слишком большой!' },
    { r: 413, text: 'Теперь ты можешь съесть ВУЛКАН!' },
  ],
  respawn: [['coconut', 2, 8], ['rock', 2, 30], ['bush', 6, 30], ['egg', 5, 20], ['goat', 8, 20], ['palm', 15, 60], ['hut', 25, 70], ['crystal', 10, 70], ['tiki', 30, 70], ['boulder', 40, 80], ['dino', 20, 70]],
  build(b) {
    const C = 4500;
    b.floor({ k: 'rect', x: 0, y: 0, w: 9000, h: 9000, pat: 'ocean', T: 1400, mm: 'rgba(25,113,194,0.9)' });
    b.floor({ k: 'circ', x: C, y: C, r: 4400, c: '#e9d8a6', mm: '#e9d8a6' });
    b.floor({ k: 'circ', x: C, y: C, r: 4150, pat: 'grass', T: 800, mm: '#5bb15a' });
    b.floor({ k: 'circ', x: C, y: C, r: 1700, pat: 'volcrock', T: 900, mm: '#5c5048' });
    const onIsland = (x, y, r = 0) => U.dist(x, y, C, C) < 4100 - r;
    // лавовый ров
    const moat = [];
    for (let i = 0; i <= 40; i++) { const a = i / 40 * TAU; moat.push(C + Math.cos(a) * 600, C + Math.sin(a) * 600); }
    chainZones(b, 'lava', moat, 150, { hz: 0.16, safeR: 250, light: 1.5 });
    // 4 реки лавы по диагоналям с узкими бродами у берега
    L_RIVERS = [];
    for (let k = 0; k < 4; k++) {
      const a = Math.PI / 4 + k * Math.PI / 2;
      const pts = [];
      for (let s = 0; s <= 10; s++) { const d = 700 + s * 340; const wig = Math.sin(s * 1.3 + k) * 180; pts.push(C + Math.cos(a) * d - Math.sin(a) * wig, C + Math.sin(a) * d + Math.cos(a) * wig); }
      const gap = [[pts[18], pts[19], 330]];
      const zs = chainZones(b, 'lava', pts, 140, { hz: 0.16, safeR: 250, river: k }, gap);
      L_RIVERS.push(zs);
      // крио-кнопки с обеих сторон реки
      const mx = pts[10], my = pts[11];
      for (const s of [-1, 1]) {
        const bx = mx + Math.cos(a + s * Math.PI / 2) * 380, by = my + Math.sin(a + s * Math.PI / 2) * 380;
        b.button('cryo' + k + s, bx, by, 55, (L) => freezeRiver(L, k), { col: '#4dabf7' });
      }
    }
    b.sign(4500, 7500, 300, 'Реки лавы делят остров! Ищи узкий брод у берега или жми синюю КРИО-кнопку — она заморозит реку.', { who: 'pylypyuk', expr: 'smug' });
    // вулкан
    b.item('volcano', C, C, 380, { id: 'volcano', tag: 'volcano', mm: '#ff6b00', pts: 5000, noMag: true });
    // секторы: S, W, N, E
    const sector = (k) => (x, y, r) => { if (!onIsland(x, y, r)) return true; let a = Math.atan2(y - C, x - C); a = (a - Math.PI / 4 + TAU * 2) % TAU; const sec = Math.floor(a / (Math.PI / 2)); return sec !== k; };
    const area = { x: 0, y: 0, w: 9000, h: 9000 };
    const S = sector(0), Wd = sector(1), N = sector(2), E = sector(3);
    const notAsh = (f) => (x, y, r) => f(x, y, r) || U.dist(x, y, C, C) < 1750 + r;
    b.clear(4300, 8050, 400, 400);
    const nur = { cx: 4500, cy: 8250, r0: 40, r1: 750 };
    b.scatter('coconut', 120, 2, 7, nur); b.scatter('rock', 110, 2, 8, nur); b.scatter('egg', 30, 5, 9, nur); b.scatter('bush', 25, 6, 9, nur); b.scatter('crystal', 20, 5, 9, nur);
    b.scatter('coconut', 120, 2, 8, area, { avoid: notAsh(S) }); b.scatter('rock', 120, 2, 10, area, { avoid: notAsh(S) });
    b.scatter('bush', 60, 6, 16, area, { avoid: notAsh(S) }); b.scatter('egg', 40, 5, 12, area, { avoid: notAsh(S) });
    b.scatter('goat', 25, 8, 14, area, { avoid: notAsh(S) }); b.scatter('palm', 35, 15, 30, area, { avoid: notAsh(S) });
    b.scatter('hut', 10, 25, 40, area, { avoid: notAsh(S), big: true }); b.scatter('crystal', 25, 5, 12, area, { avoid: notAsh(S) });
    for (const f of [Wd, E]) {
      b.scatter('rock', 60, 10, 30, area, { avoid: notAsh(f) }); b.scatter('palm', 40, 25, 45, area, { avoid: notAsh(f) }); b.scatter('hut', 15, 35, 60, area, { avoid: notAsh(f), big: true });
      b.scatter('goat', 25, 12, 20, area, { avoid: notAsh(f) }); b.scatter('dino', 10, 15, 28, area, { avoid: notAsh(f), opts: { taunt: ['РРРАР!'] } }); b.scatter('tiki', 10, 30, 50, area, { avoid: notAsh(f), big: true });
      b.scatter('crystal', 25, 15, 30, area, { avoid: notAsh(f) }); b.scatter('boulder', 12, 40, 70, area, { avoid: notAsh(f), big: true }); b.scatter('egg', 30, 10, 20, area, { avoid: notAsh(f) });
      b.scatter('bush', 40, 12, 30, area, { avoid: notAsh(f) }); b.scatter('coconut', 40, 5, 10, area, { avoid: notAsh(f) });
    }
    b.scatter('boulder', 25, 60, 150, area, { avoid: notAsh(N), big: true, spaced: 1 }); b.scatter('dino', 18, 40, 90, area, { avoid: notAsh(N), opts: { taunt: ['РРРАААР!', '*топ-топ*'] } });
    b.scatter('tiki', 14, 60, 120, area, { avoid: notAsh(N), big: true }); b.scatter('crystal', 25, 40, 80, area, { avoid: notAsh(N) }); b.scatter('hut', 12, 60, 80, area, { avoid: notAsh(N) });
    b.scatter('palm', 30, 45, 70, area, { avoid: notAsh(N) }); b.scatter('egg', 30, 20, 35, area, { avoid: notAsh(N) }); b.scatter('rock', 40, 25, 60, area, { avoid: notAsh(N) });
    const ash = (x, y, r) => { const d = U.dist(x, y, C, C); return d < 820 + r || d > 1650 - r; };
    b.scatter('lavarock', 50, 30, 120, area, { avoid: ash }); b.scatter('crystal', 25, 50, 110, area, { avoid: ash }); b.scatter('boulder', 15, 80, 160, area, { avoid: ash, big: true });
    // гейзеры
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + 0.2, d = i % 2 ? 1200 : 3800; b.item('geyser', C + Math.cos(a) * d, C + Math.sin(a) * d, d < 2000 ? 70 : 40, { beh: 'geyser', draw: Draws.geyser, noEat: true, solid: false, lava: d < 2000, cyc: 4 + (i % 3), phase: i * 0.7 }); }
    // крио-пушки Пилипюка
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + 0.4, d = 2600; b.item('turret', C + Math.cos(a) * d, C + Math.sin(a) * d, 44, { beh: 'turret', draw: Draws.turret, rate: 2.6, range: 1300, shot: { k: 'freeze', eff: 'freeze', hz: 0.03, col: '#a5d8ff' }, col: '#1864ab', col2: '#74c0fc', eye: '#e7f5ff', mm: '#74c0fc' }); }
    b.pw('speed', 4000, 7600, 16); b.pw('shield', 1400, 4800, 40); b.pw('magnet', 7600, 4200, 40); b.pw('grow', 4500, 900, 120); b.pw('shield', 4500, 2300, 150);
  },
  init(L) { L.radio('pylypyuk', 'Остров-вулкан! Мои криогенераторы и пушки готовы. Тут ты и замёрзнешь, стажёр!', 'smug'); L.data.freeze = {}; },
  update(L, dt) {
    const P = L.P, D = L.data;
    for (const k in D.freeze) { D.freeze[k] -= dt; if (D.freeze[k] <= 0) { delete D.freeze[k]; for (const z of L.zones) if (z.river === +k) z.frozen = false; L.toast('Лава снова течёт!', '#ff922b', 1.5); } }
    // извержения
    if (U.dist(P.x, P.y, 4500, 4500) < 3600) {
      D.er = (D.er === undefined ? 6 : D.er) - dt;
      if (D.er <= 0) {
        D.er = 6 + Math.random() * 3;
        L.cam.shake = 8; Sound.play('boom');
        for (let i = 0; i < 2; i++) {
          const [x, y] = nearPlayer(L, 3.5);
          L.warn(x, y, P.r * 1.6, 1.7, (L2, w) => {
            Sound.play('boom'); L2.burst(w.x, w.y, 16, '#ff6b00', w.r * 2, w.r * 0.2);
            if (U.dist(w.x, w.y, L2.P.x, L2.P.y) < w.r + L2.P.r * 0.4 && L2.P.r < 250) L2.hurt(0.1, w.x, w.y, 'lava');
            L2.spawn('lavarock', w.x, w.y, w.r * 0.5, {});
          }, '#ff6b00', '🌋');
        }
        if (!D.erSaid) { D.erSaid = 1; L.radio('pylypyuk', 'Вулкан проснулся! Это не я! Честно!', 'shock'); }
      }
    }
  },
});
let L_RIVERS = [];
function freezeRiver(L, k) {
  for (const z of L.zones) if (z.river === k) z.frozen = true;
  L.data.freeze[k] = 15; Sound.play('freeze');
  L.toast('Лава заморожена на 15 секунд! Беги!', '#74c0fc', 2);
  L.burst(L.P.x, L.P.y, 20, '#a5d8ff', L.P.r * 4, L.P.r * 0.1);
}

// ============================================================
//  3-3. ПЛАНЕТА ЗЕМЛЯ (континенты, ракеты Кирилла)
// ============================================================
const CONT = {
  namerica: [1500, 1500, 4200, 1200, 5200, 2000, 4800, 3200, 3800, 3600, 3400, 4300, 2600, 4000, 1800, 3000, 1200, 2200],
  samerica: [3800, 4600, 4800, 4800, 5200, 5600, 4600, 7000, 4100, 7800, 3700, 6800, 3500, 5400],
  europe: [7200, 1700, 8800, 1500, 9300, 2100, 8800, 2800, 7800, 2900, 7300, 2500],
  africa: [7400, 3200, 9200, 3100, 9900, 4200, 9400, 5600, 8600, 6800, 8000, 6600, 7700, 5200, 7000, 4300],
  asia: [8800, 1200, 12500, 1000, 14500, 1600, 14200, 2800, 13000, 3600, 12200, 4200, 11000, 4000, 10000, 3300, 9300, 2800, 9300, 2000],
  india: [10600, 3800, 11700, 3900, 11200, 5000],
  australia: [12600, 5800, 14400, 5600, 14800, 6600, 13800, 7300, 12700, 7000],
  greenland: [5600, 700, 6800, 600, 6600, 1500, 5800, 1600],
  antarctica: [500, 8400, 15500, 8400, 15800, 9000, 200, 9000],
  uk: [6800, 1700, 7050, 1650, 7100, 2050, 6850, 2100],
  japan: [14600, 2300, 14800, 2200, 14900, 2900, 14650, 3000],
  indonesia: [12300, 4800, 13600, 4900, 13500, 5200, 12400, 5150],
};
const DESERTS = [[7600, 3500, 9400, 3500, 9300, 4300, 7700, 4300], [13100, 6100, 14200, 6000, 14100, 6700, 13300, 6800], [9700, 3200, 10500, 3300, 10300, 3800, 9800, 3700]];
const onLand = (x, y) => Object.values(CONT).some(p => inPoly(x, y, p));
LEVELS.push({
  id: 'earth', name: 'Планета Земля', chapter: 'Глава 3 · Весь мир', host: 'kirill', music: 'earth', bg: 'earth',
  desc: 'Никита ростом с горы. Ешь города и континенты! Кирилл запускает ракеты с бантиками.',
  unit: 3000, world: { w: 16000, h: 9000 }, start: { x: 8700, y: 2150, r: 10 }, goal: { r: 500 },
  growK: 0.15, medals: [240, 400], seed: 1010, mmColor: 'rgba(25,113,194,0.9)', camFrac: 0.05, burp: 'Евразия — это как шаурма, только больше!',
  milestones: [
    { r: 30, who: 'kirill', text: 'Ура! Мои ракеты с бантиками готовы! Пять… четыре… ой, уже полетели!', expr: 'crazy' },
    { r: 100, who: 'natasha', text: 'Кирюша, он съел Альпы… Может, ракеты всё-таки не помогают?', expr: 'tired' },
    { r: 250, who: 'egor', text: 'Он съел половину континента! Срочно эвакуируемся на орбиту!', expr: 'shock' },
  ],
  respawn: [['city', 3, 10, {}, onLand], ['forest', 4, 14, {}, onLand], ['plane', 4, 14], ['ship', 3, 12, {}, (x, y) => !onLand(x, y)], ['megacity', 20, 60, {}, onLand], ['mountain', 20, 180, {}, onLand], ['island', 30, 200, {}, (x, y) => !onLand(x, y)], ['iceberg', 20, 200, {}, (x, y) => !onLand(x, y)]],
  build(b) {
    const W = 16000, H = 9000;
    b.floor({ k: 'rect', x: 0, y: 0, w: W, h: 450, c: '#f1f3f5', mm: '#f1f3f5' });
    for (const [name, p] of Object.entries(CONT)) b.floor({ k: 'poly', pts: p, pat: 'grass', T: 1200, stroke: '#e9d8a6', sw: 60, mm: name === 'antarctica' || name === 'greenland' ? '#f1f3f5' : '#69db7c' });
    b.floor({ k: 'poly', pts: CONT.antarctica, c: '#f1f3f5' }); b.floor({ k: 'poly', pts: CONT.greenland, c: '#e9ecef' });
    for (const d of DESERTS) b.floor({ k: 'poly', pts: d, c: 'rgba(233,196,106,0.85)', mm: '#e9c46a' });
    const land = (x, y) => !onLand(x, y), sea = (x, y) => onLand(x, y);
    const all = { x: 0, y: 450, w: W, h: 7900 };
    // старт: Европа
    const eu = { x: 7100, y: 1400, w: 2300, h: 1600 };
    b.clear(8550, 2000, 300, 300);
    const nur = { cx: 8700, cy: 2150, r0: 30, r1: 650 };
    b.scatter('city', 130, 3, 7, nur, { avoid: land }); b.scatter('forest', 60, 4, 8, nur, { avoid: land }); b.scatter('plane', 20, 4, 7, nur); b.scatter('windmill', 10, 4, 7, nur, { avoid: land });
    b.scatter('city', 120, 3, 8, eu, { avoid: land }); b.scatter('forest', 60, 4, 9, eu, { avoid: land }); b.scatter('windmill', 12, 5, 8, eu, { avoid: land });
    b.scatter('plane', 30, 4, 8, eu); b.scatter('ship', 25, 3, 8, { x: 6500, y: 1200, w: 3500, h: 2500 }, { avoid: sea, opts: { beh: null } });
    // весь мир
    b.scatter('city', 380, 4, 14, all, { avoid: land }); b.scatter('forest', 260, 6, 20, all, { avoid: land }); b.scatter('plane', 80, 6, 16, all);
    b.scatter('ship', 150, 5, 16, all, { avoid: sea, opts: { beh: null } }); b.scatter('megacity', 50, 22, 50, all, { avoid: land, big: true });
    b.scatter('iceberg', 30, 20, 150, { x: 0, y: 7800, w: W, h: 600 }, { avoid: sea }); b.scatter('iceberg', 20, 15, 90, { x: 0, y: 400, w: W, h: 600 }, { avoid: sea });
    b.scatter('island', 40, 25, 90, all, { avoid: sea }); b.scatter('cloud', 70, 60, 200, { x: 0, y: 0, w: W, h: H });
    // горные хребты
    const range = (pts, n, r0, r1) => { for (let i = 0; i < n; i++) { const t = i / (n - 1); const seg = Math.min(pts.length / 2 - 2, Math.floor(t * (pts.length / 2 - 1))); const lt = t * (pts.length / 2 - 1) - seg; const x = U.lerp(pts[seg * 2], pts[seg * 2 + 2], lt) + (b.r() - 0.5) * 200, y = U.lerp(pts[seg * 2 + 1], pts[seg * 2 + 3], lt) + (b.r() - 0.5) * 200; b.item('mountain', x, y, U.lerp(r0, r1, b.r()), { v: b.r() < 0.5 ? 1 : 0 }); } };
    range([2400, 1700, 2600, 2600, 3000, 3500], 14, 25, 140); // Скалистые
    range([4000, 5000, 4300, 6200, 4100, 7500], 12, 25, 150); // Анды
    range([10500, 3000, 11500, 3100, 12500, 3300], 14, 40, 180); // Гималаи
    range([7700, 2500, 8150, 2450], 6, 15, 40); // Альпы
    range([10200, 1500, 10300, 2500], 7, 20, 70); // Урал
    // мегаполисы и чудеса света
    for (const [x, y, r] of [[3900, 2700, 40], [2200, 3200, 35], [8500, 2000, 30], [7600, 2200, 28], [9000, 1900, 30], [14300, 2600, 45], [12800, 2700, 45], [11200, 3700, 40], [8900, 3500, 30], [4600, 5800, 35], [14000, 6400, 30], [8700, 2250, 20]]) b.item('megacity', x, y, r);
    b.item('eiffel', 7750, 2250, 30); b.item('pyramid', 8800, 3700, 40); b.item('liberty', 4100, 2800, 30); b.item('tvtower', 9150, 1950, 28);
    b.item('lighthouse', 7100, 2700, 15); b.item('stadium', 4500, 5200, 30); b.item('ferris', 7050, 1900, 25); b.item('windmill', 7900, 1800, 14);
    // Кирилл и Наташа у стартовой площадки
    b.item('launchpad', 10500, 2350, 70, { id: 'pad', mm: '#e03131' });
    b.item('sci', 10380, 2350, 40, { id: 'kirill', who: 'kirill', draw: Draws.sci, rotMode: 'none', pose: 'armsUp', expr: 'crazy', solid: false });
    b.item('sci', 10620, 2350, 42, { id: 'natasha', who: 'natasha', draw: Draws.sci, rotMode: 'none', pose: 'facepalm', expr: 'tired', solid: false });
    b.pw('speed', 8500, 1900, 16); b.pw('magnet', 12000, 2000, 60); b.pw('shield', 4200, 3300, 70); b.pw('grow', 13600, 6300, 120); b.pw('grow', 3000, 2200, 100);
  },
  init(L) { L.radio('kirill', 'Наташа, смотри! Никита размером с Европу! Можно я запущу ракеты? С бантиками!', 'crazy'); L.data.rk = 6; L.data.pause = 0; },
  update(L, dt) {
    const P = L.P, D = L.data;
    const pad = L.byId.pad, kir = L.byId.kirill, nat = L.byId.natasha;
    if (!pad || pad.dead || !kir || kir.dead) { if (!D.stop) { D.stop = 1; L.radio('natasha', 'Ракет больше не будет. Кирюша, иди сюда… ой, его съели.', 'tired'); } return; }
    D.pause -= dt;
    D.nat = (D.nat === undefined ? 30 : D.nat) - dt;
    if (D.nat <= 0 && nat && !nat.dead) { D.nat = 28; D.pause = 8; L.radio('natasha', U.pick(['Кирюша, хватит! Перерыв на кефир.', 'Кирилл! Положи пульт! Восемь секунд тишины, пожалуйста!', 'Всё, Кирюша, тихий час!']), 'angry'); }
    if (D.pause > 0) return;
    const d = U.dist(P.x, P.y, pad.x, pad.y);
    D.rk -= dt;
    if (D.rk <= 0 && d < 6500) {
      const free = !nat || nat.dead;
      D.rk = free ? 3.5 : 6;
      const a = U.angle(pad.x, pad.y, P.x, P.y);
      // ракеты фиксированного размера: когда Никита вырастет — их можно есть!
      L.shoot(pad.x, pad.y, a, Math.max(120, P.r * 3.6), { k: 'missile', r: 34, hz: 0.07, homing: 1.0, life: 8, bow: true, col: '#fff', edible: true, noWall: true });
      if (!D.rkTip && P.r > 37) { D.rkTip = 1; L.toast('Теперь ракеты Кирилла — просто вкусняшки!', '#69db7c', 3); }
      Sound.play('shoot');
      if (Math.random() < 0.3) kir.say = { text: U.pick(['Пуск!', 'С бантиком!', 'Лети, ракетка!', 'Вжжжух!']), t: 1.5 };
    }
  },
});

// ============================================================
//  4-1. СОЛНЕЧНАЯ СИСТЕМА (орбиты, гравитация, лазерные спутники)
// ============================================================
LEVELS.push({
  id: 'space', name: 'Солнечная система', chapter: 'Глава 4 · Космос', host: 'danya', music: 'space', bg: 'space',
  desc: 'Планеты кружатся вокруг Солнца. Спутники Дани стреляют лазерами. Съешь Солнце!',
  unit: 1e6, world: { w: 18000, h: 18000, shape: 'circle' }, start: { x: 10850, y: 9000, r: 6 }, goal: { r: 330 },
  growK: 0.16, medals: [420, 660], seed: 1111, mmColor: 'rgba(15,12,40,0.95)', camFrac: 0.05, burp: 'Солнце — острое!',
  objectives: [{ type: 'count', tag: 'sun', target: 1, text: 'Съешь Солнце' }],
  milestones: [
    { r: 12, who: 'danya', text: 'Он съел Землю?! Хорошо, что мы на орбитальной станции. Наверное.', expr: 'shock' },
    { r: 80, who: 'danya', text: 'Юпитер под угрозой! Лазерная сеть, огонь!', expr: 'angry' },
    { r: 200, who: 'egor', text: 'Он идёт к Солнцу… Никита, оно же горячее!', expr: 'shock' },
    { r: 326, text: 'Ты больше Солнца. Обед подан!' },
  ],
  respawn: [['junk', 0.5, 3], ['satellite', 1, 4], ['asteroid', 1, 40], ['comet', 4, 30], ['moon', 10, 90], ['ufo', 10, 30]],
  build(b) {
    const C = 9000;
    const planet = (t, r, R, w, a, id) => b.item(t, C + Math.cos(a) * R, C + Math.sin(a) * R, r, { id, beh: 'orbit', orbit: { cx: C, cy: C, R, w, a }, always: true, tag: 'planet', mm: '#adb5bd', rotMode: 'none' });
    b.item('sun', C, C, 300, { id: 'sun', tag: 'sun', draw: Draws.sun, light: 0, mm: '#ffd43b', pts: 10000, noMag: true });
    planet('mercury', 4.5, 900, 0.05, 1, 'mercury'); planet('venus', 8.5, 1300, 0.035, 2.5, 'venus');
    planet('earthp', 9, 1800, 0.026, 0.05, 'earth'); planet('mars', 6, 2400, 0.02, 4, 'mars');
    planet('jupiter', 70, 4300, 0.012, 2, 'jupiter'); planet('saturn', 60, 5600, 0.009, 5, 'saturn');
    planet('uranus', 32, 6700, 0.007, 3.5, 'uranus'); planet('neptune', 30, 7600, 0.006, 0.8, 'neptune'); planet('pluto', 3, 8300, 0.005, 2.2, 'pluto');
    // орбиты пунктиром
    for (const R of [900, 1300, 1800, 2400, 4300, 5600, 6700, 7600, 8300]) b.floor({ k: 'circ', x: C, y: C, r: R, c: 'rgba(0,0,0,0)', stroke: 'rgba(255,255,255,0.08)', sw: 6 });
    const moon = (parent, r, R, w, a, v = 0) => b.item('moon', 0, 0, r, { v, beh: 'orbit', orbit: { parent, R, w, a }, always: true });
    moon('earth', 2.5, 30, 0.5, 0, 0); moon('mars', 1.2, 16, 0.9, 1, 2); moon('mars', 0.9, 22, 0.7, 3, 2);
    moon('jupiter', 4, 110, 0.25, 0, 1); moon('jupiter', 3.5, 150, 0.2, 2, 3); moon('jupiter', 6, 200, 0.15, 4, 0); moon('jupiter', 5.5, 250, 0.12, 5.5, 2);
    moon('saturn', 6.5, 160, 0.15, 1, 1); moon('saturn', 3, 210, 0.12, 3, 0); moon('neptune', 3.5, 70, 0.3, 2, 2); moon('uranus', 3, 70, 0.3, 4, 0);
    // околоземный мусор — стартовая еда
    for (let i = 0; i < 70; i++) { const t = U.pick(['junk', 'satellite', 'junk', 'astronaut']); b.item(t, 0, 0, U.lerp(0.5, t === 'satellite' ? 3.5 : 2.5, b.r()), { beh: 'orbit', orbit: { parent: 'earth', R: 18 + b.r() * 90, w: (0.15 + b.r() * 0.3) * (b.r() < 0.5 ? 1 : -1), a: b.r() * TAU }, always: true, rotMode: 'rand' }); }
    b.item('station', 0, 0, 3, { beh: 'orbit', orbit: { parent: 'earth', R: 50, w: 0.3, a: 2 }, always: true });
    b.scatter('junk', 80, 0.5, 4, { cx: 10800, cy: 9000, r1: 700 });
    const nur = { cx: 10850, cy: 9000, r0: 20, r1: 450 };
    b.scatter('junk', 170, 0.5, 4.5, nur, { opts: { beh: 'drift', spd: 0.05 } }); b.scatter('satellite', 50, 1, 5, nur, { opts: { beh: 'drift', spd: 0.05 } }); b.scatter('astronaut', 25, 1, 4, nur); b.scatter('asteroid', 60, 1, 5, nur); b.scatter('satellite', 30, 1, 4, { cx: 10800, cy: 9000, r1: 900 });
    b.scatter('asteroid', 120, 1, 8, { cx: C, cy: C, r0: 1500, r1: 2900 }); b.scatter('comet', 30, 3, 14, { cx: C, cy: C, r0: 1500, r1: 8000 });
    // пояс астероидов (вращается)
    for (let i = 0; i < 340; i++) { const R = 3000 + b.r() * 700, a = b.r() * TAU, r = 1 + Math.pow(b.r(), 2) * 28; b.item('asteroid', C + Math.cos(a) * R, C + Math.sin(a) * R, r, { beh: 'orbit', orbit: { cx: C, cy: C, R, w: 0.012 + b.r() * 0.01, a } }); }
    // НЛО
    b.scatter('ufo', 20, 10, 28, { cx: C, cy: C, r0: 2500, r1: 7500 }, { opts: { taunt: ['Бип-боп!', 'Землянин?'] } });
    // пояс Койпера: ледяные тела и бродячие планеты
    b.scatter('moon', 140, 15, 70, { cx: C, cy: C, r0: 7900, r1: 8900 }, { opts: { v: 2, beh: 'drift', spd: 0.03 } });
    for (let i = 0; i < 24; i++) { const a = i / 24 * TAU + 0.13, R = 8350 + (i % 3) * 180; b.item(U.pick(['moon', 'neptune', 'uranus', 'mars', 'mercury']), C + Math.cos(a) * R, C + Math.sin(a) * R, 70 + (i * 37 % 110), { v: i % 4, rotMode: 'none' }); }
    // лазерные спутники Дани
    for (const [parent, R, n, rr] of [['earth', 140, 3, 10], ['mars', 120, 3, 12], ['jupiter', 330, 4, 22], ['saturn', 300, 3, 26]]) for (let i = 0; i < n; i++) b.item('lasersat', 0, 0, rr, { draw: Draws.lasersat, beh: 'orbitTurret', orbit: { parent, R, w: 0.12, a: i / n * TAU }, rate: 2.2, range: 1500, shot: { k: 'bolt', hz: 0.06, col: '#ff3b3b' }, always: true, mm: '#ff3b3b' });
    b.pw('speed', 10600, 9300, 4); b.pw('shield', 12600, 8000, 16); b.pw('magnet', 6000, 6000, 40); b.pw('grow', 4500, 12500, 80); b.pw('grow', 14000, 4000, 120); b.pw('shield', 9000, 7900, 150);
  },
  init(L) { L.radio('danya', 'Мы на станции «Ковчег». Никита в космосе. Включаю сеть лазерных спутников!', 'determined'); L.tip('grav', 'Большие планеты притягивают. Солнце обжигает, пока ты меньше его!', '#ffd43b'); },
  update(L, dt) {
    const P = L.P;
    for (const it of L.items) {
      if (it.dead || it.tag !== 'planet' || L.canEat(it)) continue;
      const d = U.dist(it.x, it.y, P.x, P.y), R = it.r * 6;
      if (d < R && d > it.r) { const f = (1 - d / R) * P.r * BASE_SPD * 0.35; L.pushX += (it.x - P.x) / d * f; L.pushY += (it.y - P.y) / d * f; }
    }
    const sun = L.byId.sun;
    if (sun && !sun.dead && !L.canEat(sun) && U.dist(sun.x, sun.y, P.x, P.y) < sun.r * 1.7 + P.r) L.hurt(0.06, sun.x, sun.y, 'sun');
  },
});

// ============================================================
//  4-2. ФИНАЛ: МОЗГ-СТАНЦИЯ МОЛГЕЛЕВИЧА
// ============================================================
LEVELS.push({
  id: 'final', name: 'Мозг-Станция', chapter: 'Глава 4 · Космос', host: 'molgelevich', music: 'boss', bg: 'station',
  desc: 'ФИНАЛ. Профессор Молгелевич и его Мега-Мех. Кирилл и Наташа — на твоей стороне!',
  unit: 1e7, world: { w: 6400, h: 6400, shape: 'circle' }, start: { x: 3200, y: 5700, r: 40 }, goal: { r: 120 },
  growK: 0.2, medals: [240, 400], seed: 1212, mmColor: 'rgba(45,42,69,0.95)', winText: 'МОЛГЕЛЕВИЧ ПОВЕРЖЕН!', burp: 'Мозги — полезная еда!',
  objectives: [{ type: 'flag', flag: 'molEaten', text: 'Победи профессора Молгелевича' }],
  respawn: [['scrap', 8, 40], ['brainbot', 20, 60, { beh: 'chase' }]],
  build(b) {
    const C = 3200;
    b.item('molboss', C, C, 420, { id: 'mol', boss: true, bossName: 'ПРОФ. МОЛГЕЛЕВИЧ', hp: 4, maxHp: 4, draw: Draws.molboss, beh: 'boss_mol', noEat: true, always: true, onDashHit: molHit, rotMode: 'none', heading: 0,
      onEat: (L) => L.flag('molEaten'), pts: 20000 });
    for (let k = 0; k < 4; k++) { const a = Math.PI / 4 + k * Math.PI / 2; b.item('generator', C + Math.cos(a) * 1750, C + Math.sin(a) * 1750, 68, { tag: 'gen', mm: '#b197fc', pts: 1000, glow: '#b197fc' }); }
    b.laser('ml1', C, C, C + 3150, C, { rotate: { cx: C, cy: C, len: 3150, spd: 0.3 }, a: -0.6, w: 12, col: '#e599f7', noEmit: true, on: false });
    b.laser('ml2', C, C, C - 3150, C, { rotate: { cx: C, cy: C, len: 3150, spd: -0.22 }, a: Math.PI + 0.8, w: 12, col: '#e599f7', noEmit: true, on: false });
    b.scatter('scrap', 50, 8, 30, { cx: 3200, cy: 5700, r0: 150, r1: 900 }, { avoid: (x, y) => U.dist(x, y, C, C) < 600 });
    b.clear(C - 500, C - 500, 1000, 1000);
    b.scatter('scrap', 260, 8, 36, { cx: C, cy: C, r0: 600, r1: 3100 }, { avoid: (x, y) => U.dist(x, y, C, C) < 600 });
    b.scatter('brainbot', 14, 25, 45, { cx: C, cy: C, r0: 900, r1: 3000 });
    b.pw('shield', 2000, 4700, 34); b.pw('speed', 4400, 4700, 34); b.pw('magnet', 1200, 3200, 36);
  },
  init(L) {
    L.data.ringR = 3200; L.data.pie = 10;
    L.radio('molgelevich', 'Добро пожаловать в мою Мозг-Станцию, Никита! Твой аппетит станет МОИМ!', 'evil');
    L.toast('Съешь 4 генератора щита. Уворачивайся от лазеров!', '#e599f7', 5);
    Sound.playMusic('boss');
  },
  update(L, dt) {
    const P = L.P, D = L.data, C = 3200;
    if (!D.lz && L.time > 6) { D.lz = 1; for (const l of L.lasers) l.on = true; L.toast('Лазеры станции включены! Уворачивайся!', '#e599f7', 2.5); Sound.play('laser'); }
    if (L.flags.phase2) {
      if (!D.allies) {
        D.allies = 1;
        L.spawn('sci', 3200, 250, 70, { id: 'kirill2', who: 'kirill', draw: Draws.sci, noEat: true, solid: false, rotMode: 'none', pose: 'armsUp', expr: 'happy' });
        L.spawn('sci', 3400, 250, 74, { id: 'natasha2', who: 'natasha', draw: Draws.sci, noEat: true, solid: false, rotMode: 'none', pose: 'wave', expr: 'determined' });
        L.radio('kirill', 'Никита хороший! Профессор — плохой! Наташа, кидай пирожки!', 'happy');
      }
      D.pie -= dt;
      if (D.pie <= 0) {
        D.pie = 12;
        const [x, y] = nearPlayer(L, 4);
        L.spawn('pw_pie', x, y, Math.max(20, P.r * 0.5), { pw: 'pie', alwaysEat: true, glow: '#ffc078', bob: true, rotMode: 'none' });
        L.burst(x, y, 14, '#ffc078', P.r * 3, P.r * 0.1);
        if (Math.random() < 0.6) L.radio(Math.random() < 0.5 ? 'natasha' : 'kirill', U.pick(['Лови пирожок, Никита!', 'С капустой! Свежий!', 'Ешь, а то совсем исхудал!', 'Никита, держись!']), 'happy');
      }
    }
    if (L.flags.phase3 && !L.flags.molEaten) {
      D.ringR = Math.max(1700, D.ringR - dt * 30);
      const d = U.dist(P.x, P.y, C, C);
      if (d > D.ringR - P.r * 0.5) { L.hurt(0.08, C + (P.x - C) * 1.2, C + (P.y - C) * 1.2, 'ring'); const f = P.r * BASE_SPD * 0.8; L.pushX += (C - P.x) / d * f; L.pushY += (C - P.y) / d * f; }
    }
  },
  drawOver(ctx, L, v, z, t) {
    if (!L.flags.phase3) return;
    const C = 3200, R = L.data.ringR;
    ctx.save();
    ctx.beginPath(); ctx.arc(C, C, R + 4000, 0, TAU); ctx.arc(C, C, R, 0, TAU, true); ctx.fillStyle = 'rgba(255,40,80,0.18)'; ctx.fill();
    ctx.beginPath(); ctx.arc(C, C, R, 0, TAU); ctx.lineWidth = 14 + Math.sin(t * 10) * 4; ctx.strokeStyle = '#ff4d6d'; ctx.setLineDash([60, 30]); ctx.lineDashOffset = -t * 80; ctx.stroke();
    ctx.restore();
  },
});
