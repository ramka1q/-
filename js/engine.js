'use strict';
// ============================================================
//  ДВИЖОК: мир уровня, Никита, поедание, столкновения, ловушки,
//  головоломки, камера, частицы, рендер мира.
// ============================================================
const EAT = 0.92;        // можно съесть, если радиус предмета <= 92% радиуса Никиты
const BASE_SPD = 5.0;    // скорость Никиты в радиусах/сек

// ---------- дополнительные тайлы стен ----------
Object.assign(BG.tileDefs, {
  brick(c, N, r) {
    c.fillStyle = '#7a3b2e'; c.fillRect(0, 0, N, N);
    const bh = N / 8;
    for (let row = 0; row < 8; row++) { const off = row % 2 ? N / 8 : 0; for (let k = -1; k < 4; k++) { c.fillStyle = U.shade('#b5533c', (r() - 0.5) * 0.25); c.fillRect(off + k * N / 4 + 3, row * bh + 3, N / 4 - 6, bh - 6); } }
  },
  officewall(c, N, r) {
    c.fillStyle = '#c5cbe0'; c.fillRect(0, 0, N, N);
    c.fillStyle = '#aab2cf'; for (let i = 0; i < 8; i++) c.fillRect(i * N / 8, 0, 4, N);
  },
  hedge(c, N, r) {
    c.fillStyle = '#2b8a3e'; c.fillRect(0, 0, N, N);
    for (let i = 0; i < 160; i++) circ(c, r() * N, r() * N, 8 + r() * 16, r() < 0.5 ? '#37b24d' : '#2f9e44', null);
    for (let i = 0; i < 20; i++) circ(c, r() * N, r() * N, 4, '#ff8787', null);
  },
  rockwall(c, N, r) {
    c.fillStyle = '#5c5048'; c.fillRect(0, 0, N, N);
    for (let i = 0; i < 40; i++) blob(c, r() * N, r() * N, 20 + r() * 40, 7, 0.25, i, U.shade('#6b5d54', (r() - 0.5) * 0.4), '#3b322c', 3);
  },
  metalwall(c, N, r) {
    c.fillStyle = '#5a5f6b'; c.fillRect(0, 0, N, N);
    const s = N / 4;
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { c.strokeStyle = '#3d414a'; c.lineWidth = 3; c.strokeRect(i * s + 2, j * s + 2, s - 4, s - 4); circ(c, i * s + 10, j * s + 10, 3, '#8a909c', null); circ(c, i * s + s - 10, j * s + s - 10, 3, '#8a909c', null); }
  },
  pipewall(c, N, r) {
    c.fillStyle = '#3a4048'; c.fillRect(0, 0, N, N);
    for (let i = 0; i < 4; i++) { const y = i * N / 4; c.fillStyle = lg(c, 0, y, 0, y + N / 4, ['#868e96', '#5c636a', '#343a40']); c.fillRect(0, y + 6, N, N / 4 - 12); for (let k = 0; k < 4; k++) rect(c, k * N / 4 + 20, y + 2, 20, N / 4 - 4, 3, '#495057', null); }
  },
  sandbags(c, N, r) {
    c.fillStyle = '#9c8a5e'; c.fillRect(0, 0, N, N);
    for (let row = 0; row < 8; row++) for (let k = 0; k < 5; k++) ell(c, (k + (row % 2) * 0.5) * N / 4, row * N / 8 + N / 16, N / 9, N / 18, 0, U.shade('#d4bb8a', (r() - 0.5) * 0.2), '#7a6a44', 3);
  },
  crystalwall(c, N, r) {
    c.fillStyle = '#2b1d4a'; c.fillRect(0, 0, N, N);
    for (let i = 0; i < 30; i++) { const x = r() * N, y = r() * N, s = 20 + r() * 40; poly(c, [x, y - s, x + s * 0.4, y, x, y + s, x - s * 0.4, y], U.rgba(r() < 0.5 ? '#b197fc' : '#66d9e8', 0.7), '#1b1033', 2); }
  },
  station(c, N, r) {
    c.fillStyle = '#2d2a45'; c.fillRect(0, 0, N, N);
    for (let i = 0; i < 4; i++) { c.fillStyle = '#3d3a5c'; c.fillRect(8, i * N / 4 + 8, N - 16, N / 4 - 16); c.fillStyle = U.rgba('#be4bdb', 0.5); c.fillRect(20, i * N / 4 + N / 8 - 3, N - 40, 6); }
  },
  icewall(c, N, r) {
    c.fillStyle = '#a5d8ff'; c.fillRect(0, 0, N, N);
    for (let i = 0; i < 30; i++) line(c, r() * N, r() * N, r() * N, r() * N, 'rgba(255,255,255,0.7)', 3);
  },
});

const WALLSTYLE = {
  lab: { pat: 'officewall', T: 300, border: '#2b2d42' },
  office: { pat: 'officewall', T: 300, border: '#2b2d42' },
  brick: { pat: 'brick', T: 300, border: '#3d1c14' },
  hedge: { pat: 'hedge', T: 500, border: '#1b5e20' },
  rock: { pat: 'rockwall', T: 600, border: '#2b231e' },
  metal: { pat: 'metalwall', T: 300, border: '#1e2128' },
  pipe: { pat: 'pipewall', T: 300, border: '#1e2128' },
  sandbags: { pat: 'sandbags', T: 300, border: '#5c4d30' },
  crystal: { pat: 'crystalwall', T: 400, border: '#120a24' },
  station: { pat: 'station', T: 500, border: '#120a24' },
  ice: { pat: 'icewall', T: 300, border: '#1864ab' },
  books: { books: true, border: '#3b2412' },
};
const PAINT = { red: '#ff4d4d', blue: '#4d7cff', green: '#3ddc84', yellow: '#ffd23f', purple: '#b04dff' };

// ============================================================
class World {
  constructor(def) {
    this.def = def;
    this.rng = U.rng(def.seed || 12345);
    this.items = []; this.walls = []; this.lasers = []; this.zones = []; this.triggers = [];
    this.projs = []; this.parts = []; this.floats = []; this.eating = []; this.warns = []; this.floor = [];
    this.byId = {}; this.flags = {}; this.keys = {}; this.data = {}; this.uidc = 0; this.clearRects = [];
    this.time = 0; this.score = 0; this.combo = 0; this.comboT = 0; this.capture = 0;
    this.toasts = []; this.radioQ = []; this.radioCur = null; this.boss = null;
    this.won = false; this.failed = false; this.endT = 0; this.paused = false; this.pushX = 0; this.pushY = 0;
    this.wallsDirty = true; this.needSort = true; this.shownTips = {}; this.milestonesDone = {};
    this.stats = { eaten: 0, biggest: '', hurt: 0 };
    const st = def.start;
    this.P = { x: st.x, y: st.y, vx: 0, vy: 0, r: st.r, rd: st.r, dir: 0, spd01: 0, inv: 0, stun: 0, slow: 0, freeze: 0,
      dashT: 0, dashCD: 0, dashDir: 0, chomp: 0, color: null, pw: { speed: 0, magnet: 0, shield: 0 }, hurtT: 0, lastPort: 0 };
    this.minR = st.r * (def.minK || 0.7);
    this.W = def.world.w; this.H = def.world.h;
    this.cam = { x: st.x, y: st.y, zoom: 1, shake: 0, sx: 0, sy: 0 };
    const b = new Builder(this);
    def.build(b);
    b.finish();
    this.objectives = (def.objectives || [{ type: 'size' }]).map(o => Object.assign({ n: 0, done: false }, o));
    for (const o of this.objectives) if (o.type === 'size') { o.target = o.target || def.goal.r; o.text = o.text || ('Вырасти до ' + this.sizeText(o.target)); }
    this.buildWallGrid();
    if (def.init) def.init(this);
    this.prewarm();
  }
  // Заранее рисуем спрайты мелких размеров, чтобы не было подтормаживаний
  prewarm() {
    const seen = new Set();
    for (const it of this.items) {
      if (it.draw) continue;
      const k = (it.spr || it.t) + '|' + it.v;
      if (seen.has(k)) continue;
      seen.add(k);
      Sprites.get(it.spr || it.t, it.v, 12); Sprites.get(it.spr || it.t, it.v, 32);
    }
    this.warmQ = [...seen];
  }

  // ---------- утилиты ----------
  sizeText(r) { return U.formatSize(r * 2 * this.def.unit); }
  toast(text, col = '#fff', dur = 2.6) { this.toasts.push({ text, col, t: 0, dur }); if (this.toasts.length > 4) this.toasts.shift(); }
  radio(who, text, expr = 'normal', dur = 0) {
    if (this.radioQ.length > 4) return;
    this.radioQ.push({ who, text, expr, dur: dur || Math.max(2.8, text.length * 0.055 + 1.5), t: 0 });
  }
  tip(key, text, col = '#ffe066') { if (this.shownTips[key]) return; this.shownTips[key] = true; this.toast(text, col, 4); }
  flag(name, v = true) { this.flags[name] = v; this.checkDoors(); }
  inWorld(x, y, pad = 0) {
    const w = this.def.world;
    if (w.shape === 'circle') return U.dist(x, y, w.w / 2, w.h / 2) <= w.w / 2 - pad;
    return x >= pad && y >= pad && x <= this.W - pad && y <= this.H - pad;
  }
  canEat(it) {
    if (it.dead || it.noEat) return false;
    if (it.alwaysEat) return true;
    if (it.ed && this.P.r < it.ed) return false;
    return it.r <= this.P.r * EAT;
  }

  // ---------- сетка стен (для быстрых столкновений) ----------
  buildWallGrid() {
    const G = this.gridSize = 500;
    this.wgrid = new Map();
    for (const w of this.walls) {
      if (w.dead) continue;
      for (let gx = Math.floor(w.x / G); gx <= Math.floor((w.x + w.w) / G); gx++)
        for (let gy = Math.floor(w.y / G); gy <= Math.floor((w.y + w.h) / G); gy++) {
          const k = gx * 10007 + gy;
          if (!this.wgrid.has(k)) this.wgrid.set(k, []);
          this.wgrid.get(k).push(w);
        }
    }
    this.wallsDirty = true;
  }
  wallsNear(x, y, r) {
    const G = this.gridSize, out = this._wn || (this._wn = []);
    out.length = 0; const seen = this._ws || (this._ws = new Set()); seen.clear();
    for (let gx = Math.floor((x - r) / G); gx <= Math.floor((x + r) / G); gx++)
      for (let gy = Math.floor((y - r) / G); gy <= Math.floor((y + r) / G); gy++) {
        const arr = this.wgrid.get(gx * 10007 + gy);
        if (arr) for (const w of arr) if (!seen.has(w)) { seen.add(w); out.push(w); }
      }
    return out;
  }
  wallBlocks(w, forPlayer) {
    if (w.dead) return false;
    if (w.door && w.door.open >= 1) return false;
    if (w.door && w.door.open > 0.6) return false;
    if (w.gate && forPlayer && this.P.color === w.gate) return false;
    return true;
  }
  // Выталкивание круга из стен. Возвращает true, если было касание.
  collideWalls(o, forPlayer = false) {
    let hit = false;
    for (const w of this.wallsNear(o.x, o.y, o.r)) {
      if (!this.wallBlocks(w, forPlayer)) continue;
      const res = U.circleRect(o.x, o.y, o.r, w.x, w.y, w.w, w.h);
      if (!res) continue;
      if (forPlayer && this.onPlayerWall(w)) continue;
      o.x += res.nx * res.depth; o.y += res.ny * res.depth;
      const vn = (o.vx || 0) * res.nx + (o.vy || 0) * res.ny;
      if (vn < 0) { o.vx -= vn * res.nx; o.vy -= vn * res.ny; }
      hit = w;
    }
    // граница мира
    const wd = this.def.world;
    if (wd.shape === 'circle') {
      const cx = wd.w / 2, cy = wd.h / 2, R = wd.w / 2;
      const d = U.dist(o.x, o.y, cx, cy);
      if (d > R - o.r) { const nx = (o.x - cx) / d, ny = (o.y - cy) / d; o.x = cx + nx * (R - o.r); o.y = cy + ny * (R - o.r); hit = hit || true; const vn = (o.vx || 0) * nx + (o.vy || 0) * ny; if (vn > 0) { o.vx -= vn * nx; o.vy -= vn * ny; } }
    } else {
      if (o.x < o.r) { o.x = o.r; if (o.vx < 0) o.vx = 0; hit = hit || true; }
      if (o.y < o.r) { o.y = o.r; if (o.vy < 0) o.vy = 0; hit = hit || true; }
      if (o.x > this.W - o.r) { o.x = this.W - o.r; if (o.vx > 0) o.vx = 0; hit = hit || true; }
      if (o.y > this.H - o.r) { o.y = this.H - o.r; if (o.vy > 0) o.vy = 0; hit = hit || true; }
    }
    return hit;
  }
  // Никита касается стены: съесть / открыть ключом / разбить рывком
  onPlayerWall(w) {
    const P = this.P;
    if (w.ed && P.r >= w.ed) { this.eatWall(w); return true; }
    if (w.door && w.door.need && w.door.need.startsWith('key:')) {
      const col = w.door.need.slice(4);
      if (this.keys[col] && !w.door.opening) { this.openDoor(w); return false; }
      if (!this.keys[col]) this.tip('needkey' + col, 'Нужна ' + ({ red: 'красная', blue: 'синяя', yellow: 'жёлтая', green: 'зелёная', purple: 'фиолетовая' }[col] || '') + ' ключ-карта!', PAINT[col]);
    }
    if (w.gate && P.color !== w.gate) this.tip('gate' + w.gate, 'Барьер пропускает только ' + ({ red: 'КРАСНОГО', blue: 'СИНЕГО', green: 'ЗЕЛЁНОГО', yellow: 'ЖЁЛТОГО', purple: 'ФИОЛЕТОВОГО' }[w.gate]) + ' Никиту. Найди лужу краски!', PAINT[w.gate]);
    if (w.dash && P.dashT > 0) { this.breakWall(w); return true; }
    if (w.dash) this.tip('dashwall', 'Треснувшая стена! Разбей её рывком (ПРОБЕЛ)');
    return false;
  }
  eatWall(w) {
    if (w.dead) return;
    w.dead = true; this.buildWallGrid();
    const P = this.P;
    const area = Math.min(w.w * w.h, P.r * P.r * 6) * 0.22 * (this.def.growK || 0.35);
    P.r = Math.sqrt(P.r * P.r + area);
    for (let i = 0; i < 18; i++) this.part('dot', w.x + Math.random() * w.w, w.y + Math.random() * w.h, (Math.random() - 0.5) * P.r * 6, (Math.random() - 0.5) * P.r * 6, P.r * 0.15, (WALLSTYLE[w.style] || {}).border || '#888', 0.8);
    Sound.play('crunch'); this.cam.shake = Math.max(this.cam.shake, 6);
    this.score += 50; P.chomp = 1;
  }
  breakWall(w) {
    if (w.dead) return;
    w.dead = true; this.buildWallGrid();
    for (let i = 0; i < 30; i++) this.part('dot', w.x + Math.random() * w.w, w.y + Math.random() * w.h, (Math.random() - 0.5) * 400, (Math.random() - 0.5) * 400, Math.min(w.w, w.h) * 0.25, '#8a8f99', 1);
    Sound.play('boom'); this.cam.shake = 14; this.toast('БАБАХ!', '#ffd43b', 1.2);
  }
  openDoor(w) {
    if (!w.door || w.door.opening) return;
    w.door.opening = true;
    Sound.play('door');
    this.toast(w.door.msg || 'Дверь открыта!', '#69db7c', 1.8);
  }
  checkDoors() {
    for (const w of this.walls) {
      if (!w.door || w.door.opening) continue;
      const need = w.door.need || '';
      if (need === 'plates') { const ps = this.triggers.filter(t => t.k === 'plate' && t.door === w.id); if (ps.length && ps.every(p => p.active)) this.openDoor(w); }
      else if (need.startsWith('flag:')) { if (this.flags[need.slice(5)]) this.openDoor(w); }
    }
  }

  // ---------- частицы ----------
  part(k, x, y, vx, vy, size, col, life = 0.8, extra) {
    if (this.parts.length > 700) this.parts.shift();
    const p = { k, x, y, vx, vy, s: size, col, life, max: life, rot: Math.random() * TAU };
    if (extra) Object.assign(p, extra);
    this.parts.push(p);
    return p;
  }
  floatText(x, y, text, col = '#fff', size = 1) { this.floats.push({ x, y, text, col, t: 0, size }); if (this.floats.length > 40) this.floats.shift(); }
  burst(x, y, n, col, speed, size, life = 0.7) {
    for (let i = 0; i < n; i++) { const a = Math.random() * TAU, s = speed * (0.3 + Math.random()); this.part('dot', x, y, Math.cos(a) * s, Math.sin(a) * s, size * (0.5 + Math.random() * 0.8), col, life * (0.6 + Math.random() * 0.6)); }
  }
  // Предупреждение-зона (капля/снаряд/лава): через dur сек «бабах»
  warn(x, y, r, dur, cb, col = '#ff4d4d', label = '') {
    const w = { x, y, r, t: 0, dur, cb, col, label };
    this.warns.push(w); return w;
  }

  // ---------- урон ----------
  hurt(amount, sx, sy, kind = 'hurt') {
    const P = this.P;
    if (this.won || this.failed) return false;
    if (P.inv > 0) return false;
    if (P.pw.shield > 0) { P.inv = 0.4; this.burst(P.x, P.y, 8, '#74c0fc', P.r * 4, P.r * 0.12); Sound.play('pop'); return false; }
    const atMin = P.r <= this.minR * 1.03;
    P.r = Math.max(this.minR, P.r * (1 - amount));
    P.inv = 1.1; P.hurtT = 0.35;
    if (sx !== undefined) { const a = U.angle(sx, sy, P.x, P.y); P.vx = Math.cos(a) * P.r * 9; P.vy = Math.sin(a) * P.r * 9; }
    this.burst(P.x, P.y, 14, P.color ? PAINT[P.color] : '#b07cff', P.r * 5, P.r * 0.14);
    this.cam.shake = Math.max(this.cam.shake, 10);
    Sound.play('hurt');
    this.stats.hurt++;
    this.combo = 0;
    if (atMin) {
      this.capture += 0.34;
      if (this.capture >= 1) { this.fail(); }
      else this.toast('Осторожно! Ещё немного — и Никиту поймают!', '#ff6b6b', 2.2);
    }
    if (this.def.onHurt) this.def.onHurt(this, kind);
    return true;
  }
  stunPlayer(t) { const P = this.P; if (P.pw.shield > 0 || P.inv > 0) return; P.stun = Math.max(P.stun, t); P.inv = Math.max(P.inv, 0.3); Sound.play('stun'); this.toast('Никиту опутало сеткой!', '#ffd43b', 1.5); }
  fail() { if (this.failed || this.won) return; this.failed = true; this.endT = 0; Sound.play('lose'); }
  win() { if (this.won || this.failed) return; this.won = true; this.endT = 0; Sound.play('win'); this.cam.shake = 12; }

  // ---------- поедание ----------
  eat(it) {
    const P = this.P;
    it.dead = true;
    this.eating.push({ it, t: 0, sx: it.x, sy: it.y });
    const k = (this.def.growK || 0.35) * (it.food === undefined ? 1 : it.food);
    const add = Math.min(it.r * it.r, P.r * P.r * 2.5) * k;
    const before = P.r;
    P.r = Math.sqrt(P.r * P.r + add);
    P.chomp = 1;
    const rel = it.r / P.r;
    this.combo = this.comboT > 0 ? this.combo + 1 : 1; this.comboT = 1.1;
    const pts = Math.ceil((it.pts || 10 * Math.sqrt(it.r / this.def.start.r)) * (1 + Math.min(this.combo, 20) * 0.1));
    this.score += pts;
    this.stats.eaten++;
    if (rel > 0.35 || it.pts) this.floatText(it.x, it.y - it.r, '+' + pts + (this.combo > 2 ? ' ×' + this.combo : ''), this.combo > 5 ? '#ffd43b' : '#fff', Math.max(0.6, rel));
    const col = it.col || Sprites.colorOf(it.spr || it.t, it.v);
    this.burst(it.x, it.y, rel > 0.4 ? 10 : 4, col, P.r * 2.5, Math.max(it.r * 0.25, P.r * 0.05), 0.5);
    if (rel > 0.55) { Sound.play('bigeat'); this.cam.shake = Math.max(this.cam.shake, 4 * rel); }
    else Sound.play('eat', U.clamp(rel, 0, 1));
    if (it.tag) for (const o of this.objectives) if (o.type === 'count' && o.tag === it.tag && !o.done) { o.n++; if (o.n >= o.target) { o.done = true; this.toast('✔ ' + o.text, '#69db7c', 2.5); Sound.play('chime'); } }
    if (it.key) { this.keys[it.key] = true; Sound.play('key'); this.toast('Найдена ' + ({ red: 'КРАСНАЯ', blue: 'СИНЯЯ', yellow: 'ЖЁЛТАЯ', green: 'ЗЕЛЁНАЯ', purple: 'ФИОЛЕТОВАЯ' }[it.key] || '') + ' ключ-карта!', PAINT[it.key], 2.5); }
    if (it.pw) this.powerup(it.pw);
    if (it.who) this.onEatScientist(it);
    if (it.onEat) it.onEat(this, it);
    if (this.def.onEat) this.def.onEat(this, it);
    // вехи
    for (const m of (this.def.milestones || [])) if (!this.milestonesDone[m.r] && before < m.r && P.r >= m.r) {
      this.milestonesDone[m.r] = true;
      if (m.who) this.radio(m.who, m.text, m.expr || 'shock'); else this.toast(m.text, '#ffe066', 3.5);
      Sound.play('grow');
    }
  }
  onEatScientist(it) {
    const name = CH[it.who] ? CH[it.who].name : it.who;
    this.toast(name + ' проглочен! (не волнуйся, его выплюнут)', '#ffa8a8', 3);
    if (it.who === 'kirill' && this.byId.natasha && !this.byId.natasha.dead) { this.byId.natasha.say = { text: 'КИРЮША!!!', t: 2.5 }; this.byId.natasha.data.rage = 15; }
    if (it.who === 'natasha' && this.byId.kirill && !this.byId.kirill.dead) { this.byId.kirill.say = { text: 'Наташа пропала! Ура, свобода!', t: 3 }; this.byId.kirill.data.free = true; }
  }
  powerup(k) {
    const P = this.P;
    Sound.play('power');
    switch (k) {
      case 'speed': P.pw.speed = 7; this.toast('ПЕРЕЦ! Скорость ×1.6', '#ff6b6b'); break;
      case 'magnet': P.pw.magnet = 9; this.toast('МАГНИТ! Еда летит к тебе', '#ff8787'); break;
      case 'shield': P.pw.shield = 8; this.toast('ЩИТ! Ловушки не страшны', '#74c0fc'); break;
      case 'grow': P.r *= 1.12; this.toast('ГРИБ РОСТА! +12% размера', '#69db7c'); this.burst(P.x, P.y, 20, '#69db7c', P.r * 4, P.r * 0.1); break;
      case 'time': this.time = Math.max(0, this.time - 15); this.toast('−15 секунд к таймеру!', '#ffd43b'); break;
      case 'pie': P.r *= 1.08; P.pw.shield = Math.max(P.pw.shield, 4); this.toast('Пирожок от Наташи! Вкусно и безопасно', '#ffc078'); break;
    }
  }

  // ============================================================
  //  ОБНОВЛЕНИЕ
  // ============================================================
  update(dt, input) {
    this.dtLast = dt;
    if (this.won || this.failed) { this.endT += dt; this.updateParts(dt); this.updateCamera(dt, input); return; }
    this.time += dt;
    const P = this.P;
    // таймеры
    P.inv -= dt; P.stun -= dt; P.slow -= dt; P.freeze -= dt; P.dashCD -= dt; P.hurtT -= dt; P.lastPort -= dt;
    for (const k in P.pw) P.pw[k] = Math.max(0, P.pw[k] - dt);
    P.chomp = Math.max(0, P.chomp - dt * 4);
    this.comboT -= dt; if (this.comboT <= 0) this.combo = 0;
    this.capture = Math.max(0, this.capture - dt * 0.04);

    this.updatePlayer(dt, input);
    this.updateZones(dt);
    this.updateTriggers(dt);
    this.updateItems(dt);
    this.updateProjs(dt);
    this.updateLasers(dt);
    this.updateWarns(dt);
    this.updateDoors(dt);
    if (this.def.update) this.def.update(this, dt);
    this.respawn(dt);
    this.updateParts(dt);
    this.updateCamera(dt, input);
    // постепенно догреваем крупные версии спрайтов
    if (this.warmQ && this.warmQ.length) for (let i = 0; i < 2 && this.warmQ.length; i++) { const [n, v] = this.warmQ.pop().split('|'); Sprites.get(n, isNaN(+v) ? v : +v, 80); }
    // отображаемый радиус плавно догоняет реальный
    P.rd += (P.r - P.rd) * (1 - Math.exp(-6 * dt));
    // цели
    let all = true;
    for (const o of this.objectives) {
      if (o.type === 'size') { o.n = P.r; if (!o.done && P.r >= o.target) { o.done = true; } }
      if (o.type === 'flag') o.done = !!this.flags[o.flag];
      if (!o.done) all = false;
    }
    if (all) this.win();
    // радио
    if (!this.radioCur && this.radioQ.length) this.radioCur = this.radioQ.shift();
    if (this.radioCur) { this.radioCur.t += dt; if (this.radioCur.t > this.radioCur.dur) this.radioCur = null; }
    for (const t of this.toasts) t.t += dt;
    this.toasts = this.toasts.filter(t => t.t < t.dur);
  }

  updatePlayer(dt, input) {
    const P = this.P;
    let mx = 0, my = 0, mag = 0;
    if (P.stun <= 0) {
      if (input.kx || input.ky) { const l = Math.hypot(input.kx, input.ky); mx = input.kx / l; my = input.ky / l; mag = 1; }
      else if (input.mouse) {
        const dx = input.wx - P.x, dy = input.wy - P.y, d = Math.hypot(dx, dy);
        if (d > 1e-3) { mx = dx / d; my = dy / d; mag = U.clamp((d - P.r * 0.25) / (P.r * 2.2), 0, 1); }
      }
    }
    let mult = 1;
    if (P.pw.speed > 0) mult *= 1.6;
    if (P.slow > 0) mult *= 0.55;
    if (P.freeze > 0) mult *= 0.35;
    if (this.zoneSlow) mult *= this.zoneSlow;
    const spd = P.r * BASE_SPD * mult;
    // рывок
    if (input.dash && P.dashCD <= 0 && P.stun <= 0) {
      P.dashT = 0.26; P.dashCD = 1.5;
      P.dashDir = mag > 0.05 ? Math.atan2(my, mx) : P.dir;
      Sound.play('dash');
    }
    let k = this.onIce ? 1.4 : 9;
    if (P.dashT > 0) {
      P.dashT -= dt;
      P.vx = Math.cos(P.dashDir) * spd * 3.1; P.vy = Math.sin(P.dashDir) * spd * 3.1;
      if (Math.random() < 0.6) this.part('dot', P.x, P.y, -P.vx * 0.1, -P.vy * 0.1, P.r * 0.3, P.color ? PAINT[P.color] : '#b07cff', 0.35);
    } else {
      const f = 1 - Math.exp(-k * dt);
      P.vx += (mx * mag * spd - P.vx) * f;
      P.vy += (my * mag * spd - P.vy) * f;
    }
    if (P.stun > 0) { P.vx *= 0.9; P.vy *= 0.9; }
    // внешние силы (течения, гравитация, всасывание)
    P.x += (P.vx + this.pushX) * dt; P.y += (P.vy + this.pushY) * dt;
    const sp = Math.hypot(P.vx, P.vy);
    if (sp > P.r * 0.5) P.dir = Math.atan2(P.vy, P.vx);
    P.spd01 = U.clamp(sp / (P.r * BASE_SPD), 0, 1.5);
    this.pushX = 0; this.pushY = 0;
    // столкновения
    this.collideWalls(P, true);
    this.playerVsItems(dt);
  }

  playerVsItems(dt) {
    const P = this.P;
    const magnet = P.pw.magnet > 0;
    const magR = P.r * 8;
    for (let i = 0; i < this.items.length; i++) {
      const it = this.items[i];
      if (it.dead || it.ghost) continue;
      const dx = it.x - P.x, dy = it.y - P.y;
      if (magnet && Math.abs(dx) < magR && Math.abs(dy) < magR && !it.static && this.canEat(it) && !it.noMag) {
        const d = Math.hypot(dx, dy) || 1;
        if (d < magR) { const pull = P.r * 7 * dt; it.x -= dx / d * pull; it.y -= dy / d * pull; }
      }
      const rr = P.r + it.r;
      if (dx > rr || dx < -rr || dy > rr || dy < -rr) continue;
      const d2 = dx * dx + dy * dy;
      if (d2 > rr * rr) continue;
      const d = Math.sqrt(d2) || 0.001;
      if (this.canEat(it)) {
        if (d < P.r + it.r * 0.35) this.eat(it);
        continue;
      }
      if (it.onTouch) it.onTouch(this, it);
      if (it.hz && !it.harmless) this.hurt(it.hz, it.x, it.y, 'touch');
      if (it.solid === false) continue;
      const nx = dx / d, ny = dy / d, over = rr - d;
      if (it.mov) {
        const mp = P.r * P.r, mi = (it.mass || it.r * it.r) * (it.heavy || 1);
        const share = mp / (mp + mi);
        it.x += nx * over * share; it.y += ny * over * share;
        it.vx = (it.vx || 0) + nx * 10; it.vy = (it.vy || 0) + ny * 10;
        this.collideWalls(it);
        const d3 = Math.hypot(it.x - P.x, it.y - P.y) || 0.001;
        const over2 = P.r + it.r - d3;
        if (over2 > 0) { P.x -= (it.x - P.x) / d3 * over2; P.y -= (it.y - P.y) / d3 * over2; }
      } else {
        P.x -= nx * over; P.y -= ny * over;
        const vn = P.vx * nx + P.vy * ny;
        if (vn > 0) { P.vx -= vn * nx; P.vy -= vn * ny; }
        if (vn > P.r * 2 && !it.hz) {
          it.flash = 0.35; Sound.play('bonk');
          if (!it.boss) this.tip('toobig', 'Это пока слишком большое — сначала подрасти!', '#ffa8a8');
        }
      }
      if (it.boss && P.dashT > 0 && it.onDashHit) it.onDashHit(this, it);
    }
  }

  updateZones(dt) {
    const P = this.P;
    this.onIce = false; this.zoneSlow = 0; this.pushX = this.pushX || 0; this.pushY = this.pushY || 0;
    let slow = 1;
    for (const z of this.zones) {
      if (z.off) continue;
      z.t = (z.t || 0) + dt;
      const inside = (x, y, r) => z.shape === 'circ' ? U.dist(x, y, z.x, z.y) < z.r + r * 0.3 : U.pointInRect(x, y, z.x - r * 0.3, z.y - r * 0.3, z.w + r * 0.6, z.h + r * 0.6);
      if (!inside(P.x, P.y, P.r)) continue;
      switch (z.k) {
        case 'current': case 'conveyor': { const s = (z.str || 1) * P.r * BASE_SPD * (z.abs ? 0 : 1) + (z.abs || 0); this.pushX += z.dx * s; this.pushY += z.dy * s; break; }
        case 'ice': this.onIce = true; break;
        case 'slow': slow = Math.min(slow, z.mult || 0.5); break;
        case 'paint': if (P.color !== z.color) { P.color = z.color; Sound.play('splash'); this.toast('Никита теперь ' + ({ red: 'КРАСНЫЙ', blue: 'СИНИЙ', green: 'ЗЕЛЁНЫЙ', yellow: 'ЖЁЛТЫЙ', purple: 'ФИОЛЕТОВЫЙ' }[z.color]) + '!', PAINT[z.color]); this.burst(P.x, P.y, 16, PAINT[z.color], P.r * 3, P.r * 0.15); } break;
        case 'lava': if (!z.frozen && !(z.safeR && P.r >= z.safeR)) this.hurt(z.hz || 0.1, P.x - P.vx, P.y - P.vy, 'lava'); break;
        case 'hazard': if (!(z.safeR && P.r >= z.safeR)) this.hurt(z.hz || 0.08, z.shape === 'circ' ? z.x : P.x - P.vx, z.shape === 'circ' ? z.y : P.y - P.vy, 'zone'); break;
        case 'vortex': { const d = U.dist(P.x, P.y, z.x, z.y) || 1; const s = P.r * BASE_SPD * (z.str || 0.6); this.pushX += (z.x - P.x) / d * s - (z.y - P.y) / d * s * 0.8; this.pushY += (z.y - P.y) / d * s + (z.x - P.x) / d * s * 0.8; if (d < z.r * 0.18 && z.to && P.lastPort <= 0) { P.x = z.to.x; P.y = z.to.y; P.lastPort = 2; Sound.play('teleport'); this.toast('Водоворот выплюнул Никиту!', '#74c0fc'); } break; }
      }
    }
    this.zoneSlow = slow < 1 ? slow : 0;
    // временные зоны (лужи от капель)
    this.zones = this.zones.filter(z => !(z.life !== undefined && (z.life -= dt) <= 0));
  }

  updateTriggers(dt) {
    const P = this.P;
    for (const tr of this.triggers) {
      tr.t = (tr.t || 0) + dt;
      const d = U.dist(P.x, P.y, tr.x, tr.y);
      const on = d < tr.r + P.r * 0.4;
      switch (tr.k) {
        case 'button':
          tr.cd = (tr.cd || 0) - dt;
          if (on && !tr.inside && tr.cd <= 0 && (!tr.minR || P.r >= tr.minR) && !(tr.once && tr.used)) {
            tr.pressed = !tr.pressed; tr.used = true; tr.cd = 0.6; tr.flashT = 0.4;
            Sound.play('button');
            this.fire(tr.act, tr);
          }
          if (on && tr.minR && P.r < tr.minR) this.tip('btnheavy' + tr.id, 'Слишком лёгкий! Кнопка нажмётся, когда Никита станет больше', '#ffa8a8');
          tr.inside = on;
          break;
        case 'plate': {
          let act = on && (!tr.minR || P.r >= tr.minR);
          if (!act) for (const it of this.items) if (it.mov && !it.dead && U.dist(it.x, it.y, tr.x, tr.y) < tr.r * 0.8) { act = true; break; }
          if (act !== tr.active) { tr.active = act; if (act) Sound.play('click'); this.checkDoors(); if (tr.act && act) this.fire(tr.act, tr); }
          break;
        }
        case 'hold':
          if (tr.done) break;
          if (on && (!tr.minR || P.r >= tr.minR)) { tr.p = (tr.p || 0) + dt / (tr.need || 1.5); if (Math.random() < 0.3) Sound.play('click'); if (tr.p >= 1) { tr.done = true; Sound.play('chime'); this.fire(tr.act, tr); } }
          else tr.p = Math.max(0, (tr.p || 0) - dt * 0.5);
          break;
        case 'sign': if (on && !tr.shown) { tr.shown = true; if (tr.who) this.radio(tr.who, tr.text, tr.expr || 'normal'); else this.toast(tr.text, tr.col || '#ffe066', tr.dur || 4); } break;
        case 'event': if (on && !tr.done && (!tr.minR || P.r >= tr.minR)) { tr.done = true; this.fire(tr.act, tr); } break;
        case 'portal':
          if (on && P.lastPort <= 0 && tr.to) {
            const dst = this.triggers.find(q => q.id === tr.to);
            if (dst) { P.x = dst.x; P.y = dst.y; P.lastPort = 1.2; Sound.play('teleport'); this.burst(dst.x, dst.y, 20, tr.col || '#b197fc', P.r * 4, P.r * 0.1); }
          }
          break;
        case 'simon': Puzzles.simonUpdate(this, tr, dt); break;
      }
    }
  }
  // Действия триггеров: 'toggle:id1,id2' | 'open:id' | 'flag:name' | 'event:name' | функция
  fire(act, src) {
    if (!act) return;
    if (typeof act === 'function') { act(this, src); return; }
    for (const a of String(act).split(' ')) {
      const [op, arg] = a.split(':');
      const ids = arg ? arg.split(',') : [];
      if (op === 'toggle') for (const id of ids) this.toggle(id);
      if (op === 'open') for (const id of ids) { const w = this.walls.find(w => w.id === id); if (w) this.openDoor(w); }
      if (op === 'flag') for (const id of ids) this.flag(id);
      if (op === 'event' && this.def.events && this.def.events[arg]) this.def.events[arg](this, src);
    }
  }
  toggle(id) {
    for (const l of this.lasers) if (l.id === id) l.on = !l.on;
    for (const z of this.zones) if (z.id === id) z.off = !z.off;
    for (const w of this.walls) if (w.id === id && w.door) this.openDoor(w);
  }

  updateItems(dt) {
    const P = this.P, cam = this.cam;
    const act = Math.max(this.viewW || 2000, this.viewH || 2000) * 1.2 + P.r * 10;
    for (let i = 0; i < this.items.length; i++) {
      const it = this.items[i];
      if (it.dead) continue;
      if (it.flash > 0) it.flash -= dt;
      if (it.say) { it.say.t -= dt; if (it.say.t <= 0) it.say = null; }
      if (!it.beh) continue;
      if (!it.always && (Math.abs(it.x - cam.x) > act || Math.abs(it.y - cam.y) > act)) continue;
      const fn = BEH[it.beh];
      if (fn) fn(it, dt, this);
    }
    // уборка съеденных
    if (this.items.some(it => it.dead)) this.items = this.items.filter(it => !it.dead);
    if (this.needSort) { this.items.sort((a, b) => (a.layer || 0) - (b.layer || 0) || a.r - b.r); this.needSort = false; }
    for (const e of this.eating) e.t += dt;
    this.eating = this.eating.filter(e => e.t < 0.2);
  }
  // Движение существа с учётом стен
  moveActor(it, vx, vy, dt) {
    it.vx = vx; it.vy = vy;
    it.x += (vx + (it.pushX || 0)) * dt; it.y += (vy + (it.pushY || 0)) * dt;
    return this.collideWalls(it);
  }

  updateProjs(dt) {
    const P = this.P;
    for (const p of this.projs) {
      p.life -= dt; p.t = (p.t || 0) + dt;
      if (p.homing) {
        const a = U.angle(p.x, p.y, P.x, P.y), cur = Math.atan2(p.vy, p.vx), sp = Math.hypot(p.vx, p.vy);
        const na = cur + U.clamp(U.angDiff(cur, a), -p.homing * dt, p.homing * dt);
        p.vx = Math.cos(na) * sp; p.vy = Math.sin(na) * sp;
      }
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.trail && Math.random() < 0.5) this.part('dot', p.x, p.y, 0, 0, p.r * 0.5, p.trail, 0.4);
      // стены
      if (!p.noWall) for (const w of this.wallsNear(p.x, p.y, p.r)) if (this.wallBlocks(w, false) && U.circleRect(p.x, p.y, p.r, w.x, w.y, w.w, w.h)) { p.life = 0; break; }
      if (!this.inWorld(p.x, p.y)) p.life = 0;
      // Никита
      const d = U.dist(p.x, p.y, P.x, P.y);
      if (p.life > 0 && d < P.r + p.r) {
        if (p.edible === true && p.r <= P.r * EAT) { p.life = 0; this.score += 5; Sound.play('eat', 0.2); P.chomp = 1; this.burst(p.x, p.y, 4, p.col || '#fff', P.r, p.r * 0.5); }
        else {
          p.life = 0;
          if (p.eff === 'stun') this.stunPlayer(p.stunT || 1.4);
          else if (p.eff === 'slow') { if (P.pw.shield <= 0) { P.slow = 3; this.toast('Липкая жижа! Никита замедлен', '#94d82d', 1.2); } }
          else if (p.eff === 'freeze') { if (P.pw.shield <= 0) { P.freeze = 2.5; Sound.play('freeze'); this.toast('Заморозка!', '#a5d8ff', 1.2); } }
          if (p.hz) this.hurt(p.hz, p.x - p.vx, p.y - p.vy, 'proj');
        }
      }
      if (p.life <= 0 && p.onEnd) p.onEnd(this, p);
    }
    this.projs = this.projs.filter(p => p.life > 0);
  }
  shoot(x, y, ang, speed, o) {
    const p = Object.assign({ x, y, vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed, r: 5, life: 4, k: 'ball', col: '#fff', hz: 0.06 }, o);
    this.projs.push(p);
    return p;
  }

  updateLasers(dt) {
    const P = this.P;
    for (const l of this.lasers) {
      l.t = (l.t || 0) + dt;
      if (l.period) { const cyc = l.period[0] + l.period[1]; l.on = ((l.t + (l.phase || 0)) % cyc) < l.period[0]; }
      if (l.rotate) { l.a += l.rotate.spd * dt; l.x1 = l.rotate.cx; l.y1 = l.rotate.cy; l.x2 = l.rotate.cx + Math.cos(l.a) * l.rotate.len; l.y2 = l.rotate.cy + Math.sin(l.a) * l.rotate.len; }
      if (l.follow) { const f = this.byId[l.follow]; if (!f || f.dead) l.on = false; }
      if (!l.on) continue;
      if (l.safeR && P.r >= l.safeR) continue;
      const d = U.segDist(P.x, P.y, l.x1, l.y1, l.x2, l.y2);
      if (d < P.r + (l.w || 4)) { this.hurt(l.hz || 0.1, P.x - (l.y2 - l.y1) * 0.01, P.y + (l.x2 - l.x1) * 0.01, 'laser'); Sound.play('laser'); }
    }
  }
  updateWarns(dt) {
    for (const w of this.warns) { w.t += dt; if (w.t >= w.dur && !w.done) { w.done = true; if (w.cb) w.cb(this, w); } }
    this.warns = this.warns.filter(w => !w.done);
  }
  updateDoors(dt) {
    let changed = false;
    for (const w of this.walls) if (w.door && w.door.opening && w.door.open < 1) { w.door.open = Math.min(1, w.door.open + dt * 1.5); changed = true; }
    if (changed) this.wallsDirty = true;
  }

  // Подсыпаем еды подходящего размера, чтобы не застрять
  respawn(dt) {
    const def = this.def;
    if (!def.respawn || !def.respawn.length) return;
    this.respT = (this.respT || 0) - dt;
    if (this.respT > 0) return;
    this.respT = 0.9;
    const P = this.P;
    const R = Math.hypot(this.viewW || 1000, this.viewH || 1000) * 0.55;
    let n = 0;
    const R2 = R * 1.7;
    for (const it of this.items) {
      if (it.dead || !this.canEat(it) || it.r < P.r * 0.22) continue;
      if (Math.abs(it.x - P.x) < R2 && Math.abs(it.y - P.y) < R2) n++;
      if (n >= 18) return;
    }
    const lo = P.r * 0.3, hi = P.r * 0.85;
    const opts = def.respawn.filter(o => o[1] < hi && o[2] > lo);
    if (!opts.length) return;
    for (let k = 0; k < 4; k++) {
      const o = U.pick(opts);
      const r = U.rand(Math.max(lo, o[1]), Math.min(hi, o[2]));
      for (let tries = 0; tries < 8; tries++) {
        const a = Math.random() * TAU, d = R * (1.05 + Math.random() * 0.6);
        const x = P.x + Math.cos(a) * d, y = P.y + Math.sin(a) * d;
        if (!this.inWorld(x, y, r)) continue;
        if (this.wallsNear(x, y, r).some(w => this.wallBlocks(w, false) && U.circleRect(x, y, r, w.x, w.y, w.w, w.h))) continue;
        if (o[4] && !o[4](x, y)) continue;
        const T = TYPES[o[0]] || {};
        this.spawn(o[0], x, y, r, Object.assign({ v: T.vN ? U.randInt(0, T.vN - 1) : 0 }, o[3] || {}));
        break;
      }
    }
  }

  updateParts(dt) {
    for (const p of this.parts) {
      p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.94; p.vy *= 0.94; p.rot += dt * 3;
      if (p.grav) p.vy += p.grav * dt;
    }
    this.parts = this.parts.filter(p => p.life > 0);
    for (const f of this.floats) f.t += dt;
    this.floats = this.floats.filter(f => f.t < 1.1);
  }

  updateCamera(dt, input) {
    const cam = this.cam, P = this.P;
    const sw = input.sw, sh = input.sh;
    const minDim = Math.min(sw, sh);
    let tz = (minDim * (this.def.camFrac || 0.05)) / P.rd;
    const wd = this.def.world;
    const fitZ = Math.max(sw / this.W, sh / this.H);
    if (!this.def.noClamp) tz = Math.max(tz, fitZ * 1.0);
    if (!cam.init) { cam.zoom = tz; cam.x = P.x; cam.y = P.y; cam.init = true; }
    cam.zoom = Math.exp(U.damp(Math.log(cam.zoom), Math.log(tz), 2.2, dt));
    // небольшое опережение по направлению движения
    const lead = P.r * 1.5;
    const tx = P.x + Math.cos(P.dir) * lead * P.spd01, ty = P.y + Math.sin(P.dir) * lead * P.spd01;
    cam.x = U.damp(cam.x, tx, 6, dt); cam.y = U.damp(cam.y, ty, 6, dt);
    this.viewW = sw / cam.zoom; this.viewH = sh / cam.zoom;
    if (!this.def.noClamp) {
      if (this.viewW < this.W) cam.x = U.clamp(cam.x, this.viewW / 2, this.W - this.viewW / 2); else cam.x = this.W / 2;
      if (this.viewH < this.H) cam.y = U.clamp(cam.y, this.viewH / 2, this.H - this.viewH / 2); else cam.y = this.H / 2;
    }
    cam.shake = Math.max(0, cam.shake - dt * 30);
    cam.sx = (Math.random() - 0.5) * cam.shake; cam.sy = (Math.random() - 0.5) * cam.shake;
  }

  // ============================================================
  //  РЕНДЕР МИРА
  // ============================================================
  render(ctx, sw, sh, t) {
    const cam = this.cam, z = cam.zoom;
    const view = { x: cam.x - sw / 2 / z, y: cam.y - sh / 2 / z, w: sw / z, h: sh / z };
    this.view = view;
    const bgs = LevelBG[this.def.bg];
    if (bgs && bgs.screen) bgs.screen(ctx, this, sw, sh, t);
    ctx.save();
    ctx.translate(sw / 2 + cam.sx, sh / 2 + cam.sy);
    ctx.scale(z, z);
    ctx.translate(-cam.x, -cam.y);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    // фон
    const bgf = LevelBG[this.def.bg] || LevelBG.plain;
    if (typeof bgf === 'function') bgf(ctx, this, view, z, t);
    else {
      bgf.world(ctx, this, view, z, t);
    }
    if (this.floor.length) BG.drawFloor(ctx, this.floor, view, z, t);
    this.drawZones(ctx, view, z, t);
    this.drawTriggers(ctx, view, z, t);
    // предметы
    const P = this.P;
    const margin = 1.5;
    for (const it of this.items) {
      if (it.dead || it.hidden) continue;
      const rr = it.r * margin * (it.drawScale || 1);
      if (it.x + rr < view.x || it.x - rr > view.x + view.w || it.y + rr < view.y || it.y - rr > view.y + view.h) continue;
      this.drawItem(ctx, it, z, t);
    }
    for (const e of this.eating) {
      const k = e.t / 0.2, it = e.it;
      const x = U.lerp(e.sx, P.x, U.ease.inQuad(k)), y = U.lerp(e.sy, P.y + P.r * 0.4, U.ease.inQuad(k));
      ctx.save(); ctx.globalAlpha = 1 - k * 0.5;
      const sc = 1 - k * 0.85;
      if (it.draw) { ctx.translate(x, y); ctx.scale(sc, sc); ctx.translate(-it.x, -it.y); it.draw(ctx, it, t, z, this); }
      else Sprites.draw(ctx, it.spr || it.t, it.v, x, y, it.r * sc, it.rot + k * 3, z);
      ctx.restore();
    }
    this.drawWalls(ctx, view, z, t);
    this.drawLasers(ctx, view, z, t);
    this.drawWarns(ctx, z, t);
    this.drawProjs(ctx, z, t);
    // Никита
    const blinkHide = P.inv > 0 && Math.floor(t * 20) % 2 === 0 && P.hurtT < 0;
    if (!blinkHide) Chars.nikita(ctx, P.x, P.y, P.rd, { t, chomp: P.chomp, dir: P.dir, speed: P.spd01, tint: P.color ? PAINT[P.color] : null, hurt: P.hurtT > 0, stun: P.stun > 0, shield: P.pw.shield > 0, dash: P.dashT > 0 });
    if (P.stun > 0) { ctx.save(); ctx.globalAlpha = 0.8; ctx.strokeStyle = '#e8c35c'; ctx.lineWidth = P.r * 0.06; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(P.x + i * P.r * 0.3 - P.r, P.y - P.r); ctx.lineTo(P.x + i * P.r * 0.3 + P.r, P.y + P.r); ctx.stroke(); ctx.beginPath(); ctx.moveTo(P.x + i * P.r * 0.3 + P.r, P.y - P.r); ctx.lineTo(P.x + i * P.r * 0.3 - P.r, P.y + P.r); ctx.stroke(); } ctx.restore(); }
    if (P.freeze > 0) { ctx.save(); ctx.globalAlpha = 0.45; circ(ctx, P.x, P.y, P.rd * 1.05, '#a5d8ff', '#e7f5ff', P.r * 0.06); ctx.restore(); }
    if (this.def.drawOver) this.def.drawOver(ctx, this, view, z, t);
    this.drawParts(ctx, z, t);
    this.drawSays(ctx, z, t);
    ctx.restore();
    if (this.def.dark) this.drawDark(ctx, sw, sh, z, t);
  }

  drawItem(ctx, it, z, t) {
    if (it.draw) { it.draw(ctx, it, t, z, this); }
    else {
      let rot = it.rot;
      let x = it.x, y = it.y;
      if (it.bob) y += Math.sin(t * 3 + it.uid) * it.r * 0.1;
      if (it.wob) rot += Math.sin(t * 2 + it.uid) * 0.15;
      if (it.spin) rot = it.rot + t * it.spin;
      if (it.glow) { ctx.save(); ctx.globalAlpha = 0.3 + 0.15 * Math.sin(t * 4 + it.uid); circ(ctx, x, y, it.r * 1.5, it.glow, null); ctx.restore(); }
      Sprites.draw(ctx, it.spr || it.t, it.v, x, y, it.r * (it.drawScale || 1), rot, z);
    }
    if (it.flash > 0) { ctx.save(); ctx.globalAlpha = it.flash * 2; circ(ctx, it.x, it.y, it.r * 1.08, null, '#ff4d4d', Math.max(2 / z, it.r * 0.08)); ctx.restore(); }
  }

  drawWalls(ctx, view, z, t) {
    for (const w of this.walls) {
      if (w.dead) continue;
      if (w.x > view.x + view.w || w.x + w.w < view.x || w.y > view.y + view.h || w.y + w.h < view.y) continue;
      if (w.gate) { this.drawGate(ctx, w, z, t); continue; }
      let x = w.x, y = w.y, ww = w.w, hh = w.h;
      if (w.door) {
        const o = U.ease.inOutCubic(w.door.open || 0);
        if (o >= 1) continue;
        if (ww >= hh) { ww = w.w * (1 - o) / 2; this.drawWallRect(ctx, w, x, y, ww, hh, z, t); this.drawWallRect(ctx, w, x + w.w - ww, y, ww, hh, z, t); }
        else { hh = w.h * (1 - o) / 2; this.drawWallRect(ctx, w, x, y, ww, hh, z, t); this.drawWallRect(ctx, w, x, y + w.h - hh, ww, hh, z, t); }
        continue;
      }
      this.drawWallRect(ctx, w, x, y, ww, hh, z, t);
    }
  }
  drawWallRect(ctx, w, x, y, ww, hh, z, t) {
    const lw = Math.max(2 / z, Math.min(ww, hh) * 0.08);
    if (w.door) {
      const col = w.door.need && w.door.need.startsWith('key:') ? PAINT[w.door.need.slice(4)] : w.door.col || '#868e96';
      ctx.fillStyle = U.shade(col, -0.25); ctx.fillRect(x, y, ww, hh);
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, ww, hh); ctx.clip();
      ctx.strokeStyle = U.shade(col, 0.3); ctx.lineWidth = Math.min(ww, hh) * 0.25;
      const s = Math.min(ww, hh) * 0.9;
      for (let k = -Math.max(ww, hh); k < Math.max(ww, hh) * 2; k += s * 1.5) { ctx.beginPath(); ctx.moveTo(x + k, y); ctx.lineTo(x + k - hh, y + hh); ctx.stroke(); }
      ctx.restore();
      ctx.strokeStyle = OL; ctx.lineWidth = lw; ctx.strokeRect(x, y, ww, hh);
      if (w.door.need && w.door.need.startsWith('key:') && ww > 0 && hh > 0) {
        const cx = w.x + w.w / 2, cy = w.y + w.h / 2, s2 = Math.min(w.w, w.h) * 0.7;
        if (U.pointInRect(cx, cy, x - 1, y - 1, ww + 2, hh + 2)) { rect(ctx, cx - s2 / 2, cy - s2 * 0.15, s2, s2 * 0.75, s2 * 0.1, '#ffd43b', OL, lw * 0.7); ctx.beginPath(); ctx.arc(cx, cy - s2 * 0.15, s2 * 0.3, Math.PI, 0); ctx.lineWidth = s2 * 0.12; ctx.strokeStyle = OL; ctx.stroke(); }
      }
      return;
    }
    const st = WALLSTYLE[w.style] || WALLSTYLE.lab;
    if (st.books) this.drawBooks(ctx, w, x, y, ww, hh, z);
    else {
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, ww, hh); ctx.clip();
      BG.fillPattern(ctx, st.pat, st.T, x, y, ww, hh, z);
      if (w.ed && this.P.r >= w.ed * 0.85) { ctx.globalAlpha = 0.25 + 0.15 * Math.sin(t * 5); ctx.fillStyle = '#69db7c'; ctx.fillRect(x, y, ww, hh); }
      if (w.dash) { ctx.globalAlpha = 0.8; ctx.strokeStyle = '#1e1b2e'; ctx.lineWidth = Math.min(ww, hh) * 0.06; ctx.beginPath(); const cx = x + ww / 2, cy = y + hh / 2, m = Math.min(ww, hh) * 0.45; ctx.moveTo(cx - m, cy - m * 0.3); ctx.lineTo(cx - m * 0.2, cy + m * 0.1); ctx.lineTo(cx + m * 0.1, cy - m * 0.4); ctx.lineTo(cx + m * 0.5, cy + m * 0.4); ctx.stroke(); }
      ctx.restore();
    }
    ctx.strokeStyle = st.border; ctx.lineWidth = lw; ctx.strokeRect(x, y, ww, hh);
  }
  drawBooks(ctx, w, x, y, ww, hh, z) {
    ctx.fillStyle = '#5c3a1e'; ctx.fillRect(x, y, ww, hh);
    const horiz = ww >= hh, short = horiz ? hh : ww, long = horiz ? ww : hh;
    const s = short * 0.32;
    const v = this.view;
    const from = horiz ? Math.max(0, v.x - x) : Math.max(0, v.y - y), to = horiz ? Math.min(long, v.x + v.w - x) : Math.min(long, v.y + v.h - y);
    const i0 = Math.floor(from / s), i1 = Math.ceil(to / s);
    if (s * z < 1.5) { ctx.fillStyle = '#9c5a3c'; ctx.fillRect(x + short * 0.06, y + short * 0.06, ww - short * 0.12, hh - short * 0.12); return; }
    for (let i = i0; i < i1; i++) {
      const h = ((i * 7919 + w.uid * 31) % 97) / 97;
      const col = PAL.bright[(i * 3 + w.uid) % 7];
      const len = short * (0.7 + h * 0.25);
      if (horiz) { ctx.fillStyle = U.shade(col, -0.15); ctx.fillRect(x + i * s + 1, y + short - len - short * 0.04, s - 2, len); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x + i * s + s * 0.3, y + short - len * 0.8, s * 0.2, len * 0.5); }
      else { ctx.fillStyle = U.shade(col, -0.15); ctx.fillRect(x + short * 0.04, y + i * s + 1, len, s - 2); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x + len * 0.2, y + i * s + s * 0.3, len * 0.5, s * 0.2); }
    }
  }
  drawGate(ctx, w, z, t) {
    const col = PAINT[w.gate];
    const pass = this.P.color === w.gate;
    ctx.save();
    ctx.globalAlpha = pass ? 0.25 : 0.55 + 0.1 * Math.sin(t * 3);
    ctx.fillStyle = col; ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.globalAlpha = pass ? 0.3 : 0.8;
    ctx.beginPath(); ctx.rect(w.x, w.y, w.w, w.h); ctx.clip();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.min(w.w, w.h) * 0.15;
    const L = Math.max(w.w, w.h), off = (t * 60) % (L * 0.5);
    for (let k = -L; k < L * 2; k += L * 0.25) { ctx.beginPath(); ctx.moveTo(w.x + k + off, w.y); ctx.lineTo(w.x + k + off - w.h, w.y + w.h); ctx.stroke(); }
    ctx.restore();
    ctx.strokeStyle = U.shade(col, -0.4); ctx.lineWidth = Math.max(2 / z, Math.min(w.w, w.h) * 0.1); ctx.strokeRect(w.x, w.y, w.w, w.h);
  }

  drawZones(ctx, view, z, t) {
    for (const zn of this.zones) {
      const bx = zn.shape === 'circ' ? zn.x - zn.r : zn.x, by = zn.shape === 'circ' ? zn.y - zn.r : zn.y;
      const bw = zn.shape === 'circ' ? zn.r * 2 : zn.w, bh = zn.shape === 'circ' ? zn.r * 2 : zn.h;
      if (bx > view.x + view.w || bx + bw < view.x || by > view.y + view.h || by + bh < view.y) continue;
      ZoneDraw[zn.k] && ZoneDraw[zn.k](ctx, zn, z, t, this);
    }
  }
  drawTriggers(ctx, view, z, t) {
    for (const tr of this.triggers) {
      if (tr.hidden) continue;
      if (tr.x + tr.r * 2 < view.x || tr.x - tr.r * 2 > view.x + view.w || tr.y + tr.r * 2 < view.y || tr.y - tr.r * 2 > view.y + view.h) continue;
      TrigDraw[tr.k] && TrigDraw[tr.k](ctx, tr, z, t, this);
    }
  }
  drawLasers(ctx, view, z, t) {
    for (const l of this.lasers) {
      const w = l.w || 4;
      // эмиттеры
      for (const [x, y] of [[l.x1, l.y1], [l.x2, l.y2]]) if (!l.noEmit) { circ(ctx, x, y, w * 2.2, '#343a40', OL, w * 0.5); circ(ctx, x, y, w * 1.1, l.on ? (l.col || '#ff3b3b') : '#555', null); }
      if (!l.on) { ctx.save(); ctx.globalAlpha = 0.2; ctx.setLineDash([w * 2, w * 3]); line(ctx, l.x1, l.y1, l.x2, l.y2, l.col || '#ff3b3b', w * 0.5); ctx.restore(); continue; }
      const col = l.col || '#ff3b3b';
      ctx.save();
      ctx.globalAlpha = 0.35; line(ctx, l.x1, l.y1, l.x2, l.y2, col, w * 3.2 + Math.sin(t * 30) * w * 0.5);
      ctx.globalAlpha = 1; line(ctx, l.x1, l.y1, l.x2, l.y2, col, w * 1.4); line(ctx, l.x1, l.y1, l.x2, l.y2, '#fff', w * 0.5);
      ctx.restore();
    }
  }
  drawWarns(ctx, z, t) {
    for (const w of this.warns) {
      const k = U.clamp(w.t / w.dur, 0, 1);
      ctx.save();
      ctx.globalAlpha = 0.18 + 0.12 * Math.sin(t * 20);
      circ(ctx, w.x, w.y, w.r, w.col, null);
      ctx.globalAlpha = 0.5; circ(ctx, w.x, w.y, w.r * k, w.col, null);
      ctx.globalAlpha = 0.9; circ(ctx, w.x, w.y, w.r, null, w.col, Math.max(2 / z, w.r * 0.05));
      if (w.label) { ctx.fillStyle = '#fff'; ctx.font = `900 ${w.r * 0.5}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(w.label, w.x, w.y); }
      ctx.restore();
    }
  }
  drawProjs(ctx, z, t) {
    for (const p of this.projs) ProjDraw[p.k] ? ProjDraw[p.k](ctx, p, z, t) : circ(ctx, p.x, p.y, p.r, p.col, OL, p.r * 0.2);
  }
  drawParts(ctx, z, t) {
    for (const p of this.parts) {
      const a = U.clamp(p.life / p.max, 0, 1);
      ctx.globalAlpha = a;
      if (p.k === 'dot') { ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(p.s * (0.4 + a * 0.6), 0.5 / z), 0, TAU); ctx.fill(); }
      else if (p.k === 'ring') { ctx.strokeStyle = p.col; ctx.lineWidth = p.s * 0.15 * a + 1 / z; ctx.beginPath(); ctx.arc(p.x, p.y, p.s * (1 + (1 - a) * 3), 0, TAU); ctx.stroke(); }
      else if (p.k === 'star') { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); U.starPath(ctx, 0, 0, 5, p.s, p.s * 0.45); ctx.fillStyle = p.col; ctx.fill(); ctx.restore(); }
      else if (p.k === 'smoke') { ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(p.x, p.y, p.s * (1.6 - a * 0.6), 0, TAU); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
    for (const f of this.floats) {
      const k = f.t / 1.1;
      ctx.save(); ctx.globalAlpha = 1 - k * k;
      const px = 18 / z * f.size;
      ctx.font = `900 ${px}px Rubik, sans-serif`; ctx.textAlign = 'center';
      ctx.lineWidth = px * 0.2; ctx.strokeStyle = OL; ctx.strokeText(f.text, f.x, f.y - k * px * 2.5);
      ctx.fillStyle = f.col; ctx.fillText(f.text, f.x, f.y - k * px * 2.5);
      ctx.restore();
    }
  }
  drawSays(ctx, z, t) {
    for (const it of this.items) {
      if (!it.say || it.dead) continue;
      const v = this.view;
      if (it.x < v.x - 50 / z || it.x > v.x + v.w + 50 / z || it.y < v.y || it.y > v.y + v.h + 200 / z) continue;
      const px = 15 / z;
      ctx.save();
      ctx.font = `700 ${px}px Rubik, sans-serif`;
      const lines = U.wrapText(ctx, it.say.text, 220 / z);
      const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + px * 1.4, h = lines.length * px * 1.25 + px * 0.9;
      const bx = it.x - w / 2, by = it.y - it.r * 1.15 - h - px;
      ctx.globalAlpha = Math.min(1, it.say.t * 3);
      rect(ctx, bx, by, w, h, px * 0.6, '#fff', OL, px * 0.15);
      poly(ctx, [it.x - px * 0.5, by + h - px * 0.1, it.x + px * 0.5, by + h - px * 0.1, it.x, by + h + px * 0.8], '#fff', null);
      ctx.fillStyle = OL; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      lines.forEach((l, i) => ctx.fillText(l, it.x, by + px * 0.5 + i * px * 1.25));
      ctx.restore();
    }
  }
  drawDark(ctx, sw, sh, z, t) {
    if (!this.darkCv || this.darkCv.width !== sw || this.darkCv.height !== sh) { this.darkCv = document.createElement('canvas'); this.darkCv.width = sw; this.darkCv.height = sh; }
    const c = this.darkCv.getContext('2d');
    c.globalCompositeOperation = 'source-over';
    c.clearRect(0, 0, sw, sh);
    c.fillStyle = `rgba(5,8,20,${this.def.dark})`; c.fillRect(0, 0, sw, sh);
    c.globalCompositeOperation = 'destination-out';
    const cam = this.cam;
    const toS = (x, y) => [(x - cam.x) * z + sw / 2 + cam.sx, (y - cam.y) * z + sh / 2 + cam.sy];
    const light = (x, y, R, a = 1) => {
      const [sx, sy] = toS(x, y);
      if (sx < -R || sx > sw + R || sy < -R || sy > sh + R) return;
      const g = c.createRadialGradient(sx, sy, 0, sx, sy, R);
      g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(0.6, `rgba(0,0,0,${a * 0.7})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g; c.beginPath(); c.arc(sx, sy, R, 0, TAU); c.fill();
    };
    const P = this.P;
    light(P.x, P.y, P.rd * z * (this.def.lightR || 6) + 60);
    for (const it of this.items) if (it.light && !it.dead) light(it.x, it.y, it.r * z * it.light, 0.9);
    for (const zn of this.zones) if (zn.light && !zn.off) light(zn.x + (zn.w || 0) / 2, zn.y + (zn.h || 0) / 2, (zn.r || Math.max(zn.w, zn.h) / 2) * z * zn.light, 0.6);
    // конусы прожекторов
    for (const it of this.items) if (it.cone && !it.dead) {
      const [sx, sy] = toS(it.x, it.y);
      const L = it.cone.len * z;
      if (sx < -L || sx > sw + L || sy < -L || sy > sh + L) continue;
      const g = c.createRadialGradient(sx, sy, 0, sx, sy, L);
      g.addColorStop(0, 'rgba(0,0,0,0.95)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g; c.beginPath(); c.moveTo(sx, sy); c.arc(sx, sy, L, it.cone.a - it.cone.w, it.cone.a + it.cone.w); c.closePath(); c.fill();
    }
    c.globalCompositeOperation = 'source-over';
    ctx.drawImage(this.darkCv, 0, 0);
  }
}

// ============================================================
//  Построитель уровней (детерминированный)
// ============================================================
class Builder {
  constructor(L) { this.L = L; this.rng = L.rng; this.pending = []; }
  get r() { return this.rng; }
  wall(x, y, w, h, o = {}) {
    if (typeof o === 'string') o = { style: o };
    const wl = Object.assign({ x, y, w, h, style: 'lab', uid: this.L.walls.length + 1 }, o);
    this.L.walls.push(wl); return wl;
  }
  // Комната: gaps = {n:[[from,len]], s:[], w:[], e:[]} — проёмы вдоль сторон
  box(x, y, w, h, th, o = {}, gaps = {}) {
    const side = (sx, sy, len, horiz, g) => {
      let cur = 0; const gs = (g || []).slice().sort((a, b) => a[0] - b[0]);
      for (const [from, gl] of gs) {
        if (from > cur) horiz ? this.wall(sx + cur, sy, from - cur, th, o) : this.wall(sx, sy + cur, th, from - cur, o);
        cur = from + gl;
      }
      if (cur < len) horiz ? this.wall(sx + cur, sy, len - cur, th, o) : this.wall(sx, sy + cur, th, len - cur, o);
    };
    side(x, y, w, true, gaps.n); side(x, y + h - th, w, true, gaps.s);
    side(x, y + th, h - th * 2, false, gaps.w && gaps.w.map(([a, b]) => [a - th, b])); side(x + w - th, y + th, h - th * 2, false, gaps.e && gaps.e.map(([a, b]) => [a - th, b]));
  }
  door(id, x, y, w, h, need, o = {}) { return this.wall(x, y, w, h, Object.assign({ id, door: { need, open: 0, msg: o.msg, col: o.col } }, o)); }
  gate(x, y, w, h, color, o = {}) { return this.wall(x, y, w, h, Object.assign({ gate: color }, o)); }
  item(t, x, y, r, o = {}) {
    const T = TYPES[t] || {};
    const opts = Object.assign({}, o);
    if (opts.v === undefined && T.vN) opts.v = this.rng.int(0, T.vN - 1);
    return this.L.spawn(t, x, y, r, opts, this.rng);
  }
  clear(x, y, w, h) { this.L.clearRects.push({ x, y, w, h }); }
  // Рассыпать предметы в области (rect {x,y,w,h} или кольцо {cx,cy,r0,r1})
  scatter(t, n, r0, r1, area, o = {}) {
    const out = [];
    for (let i = 0; i < n; i++) {
      for (let tries = 0; tries < 25; tries++) {
        let x, y;
        if (area.cx !== undefined) { const a = this.rng() * TAU, d = Math.sqrt(U.lerp((area.r0 || 0) ** 2 / area.r1 ** 2, 1, this.rng())) * area.r1; x = area.cx + Math.cos(a) * d; y = area.cy + Math.sin(a) * d; }
        else { x = area.x + this.rng() * area.w; y = area.y + this.rng() * area.h; }
        const r = r0 + Math.pow(this.rng(), o.skew || 1) * (r1 - r0);
        if (!this.L.inWorld(x, y, r)) continue;
        if (this.L.walls.some(w => U.circleRect(x, y, r * 1.1, w.x, w.y, w.w, w.h))) continue;
        if ((o.big || r > (o.clearMin || 1e9)) && this.L.clearRects.some(c => U.circleRect(x, y, r, c.x, c.y, c.w, c.h))) continue;
        if (o.avoid && o.avoid(x, y, r)) continue;
        if (o.spaced) { if (this.L.items.some(it => !it.dead && it.r > r * 0.5 && U.dist(it.x, it.y, x, y) < (it.r + r) * o.spaced)) continue; }
        out.push(this.item(t, x, y, r, Object.assign({}, o.opts || {})));
        break;
      }
    }
    return out;
  }
  zone(k, shape, o = {}) { const z = Object.assign({ k }, shape, o); if (shape.r !== undefined) z.shape = 'circ'; this.L.zones.push(z); return z; }
  laser(id, x1, y1, x2, y2, o = {}) { const l = Object.assign({ id, x1, y1, x2, y2, on: true, w: 4 }, o); this.L.lasers.push(l); return l; }
  trig(k, x, y, r, o = {}) { const t = Object.assign({ k, x, y, r }, o); this.L.triggers.push(t); return t; }
  button(id, x, y, r, act, o = {}) { return this.trig('button', x, y, r, Object.assign({ id, act }, o)); }
  plate(id, x, y, r, door, o = {}) { return this.trig('plate', x, y, r, Object.assign({ id, door }, o)); }
  hold(id, x, y, r, act, o = {}) { return this.trig('hold', x, y, r, Object.assign({ id, act }, o)); }
  sign(x, y, r, text, o = {}) { return this.trig('sign', x, y, r, Object.assign({ text }, o)); }
  event(x, y, r, act, o = {}) { return this.trig('event', x, y, r, Object.assign({ act }, o)); }
  portal(id, x, y, r, to, o = {}) { return this.trig('portal', x, y, r, Object.assign({ id, to }, o)); }
  key(color, x, y, r) { return this.item('keycard', x, y, r, { v: color, key: color, alwaysEat: true, glow: PAINT[color], bob: true, rotMode: 'none', noMag: true }); }
  pw(kind, x, y, r) { return this.item('pw_' + kind, x, y, r, { pw: kind, alwaysEat: true, glow: '#fff3bf', bob: true, rotMode: 'none' }); }
  floor(d) {
    if (!d.bb) {
      if (d.k === 'rect' || d.k === 'stripes') d.bb = { x: d.x, y: d.y, w: d.w, h: d.h };
      else if (d.k === 'circ') d.bb = { x: d.x - d.r, y: d.y - d.r, w: d.r * 2, h: d.r * 2 };
      else if (d.pts) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (let i = 0; i < d.pts.length; i += 2) { x0 = Math.min(x0, d.pts[i]); x1 = Math.max(x1, d.pts[i]); y0 = Math.min(y0, d.pts[i + 1]); y1 = Math.max(y1, d.pts[i + 1]); } const p = (d.w || 0) / 2 + (d.edgeW || 0); d.bb = { x: x0 - p, y: y0 - p, w: x1 - x0 + p * 2, h: y1 - y0 + p * 2 }; }
    }
    this.L.floor.push(d); return d;
  }
  finish() { this.L.needSort = true; }
}

World.prototype.spawn = function (t, x, y, r, o = {}, rng) {
  const T = TYPES[t] || {};
  const R = rng || Math.random;
  const it = Object.assign({ t, x, y, r, v: 0, vx: 0, vy: 0, rot: 0, hz: 0, food: 1, beh: null }, T, o);
  it.data = Object.assign({}, T.data || {}, o.data || {});
  const rm = it.rotMode || 'rand';
  it.rot = o.rot !== undefined ? o.rot : rm === 'rand' ? R() * TAU : rm === 'tilt' ? (R() - 0.5) * 0.6 : rm === 'dir' ? R() * TAU : 0;
  it.heading = R() * TAU;
  it.uid = ++this.uidc;
  this.items.push(it); this.needSort = true;
  if (it.id) this.byId[it.id] = it;
  if (it.boss) this.boss = it;
  if (it.init) it.init(this, it);
  return it;
};
