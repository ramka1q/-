/* =========================================================================
 *  game.js  —  рушій "Нікіта: Пожирач планети" (15 рівнів, 15 механік).
 *  Стани: title → difficulty → comic → play → comic → ... → win
 * ========================================================================= */

(() => {
  'use strict';

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, DPR = 1;
  const roundRect = Art.roundRect, circle = Art.circle, star = Art.star;

  const NIKITA_IMG = new Image();
  NIKITA_IMG.src = 'assets/nikita.png';
  let nikitaPhotoOk = false;
  NIKITA_IMG.onload = () => { nikitaPhotoOk = NIKITA_IMG.naturalWidth > 0; };

  /* ---- баланс ---- */
  const EAT_RATIO = 1.06;
  const BASE_GROW = 0.032;       // ріст за укус у 5 разів повільніший (накопичується довго)
  const FOOD_MULT = 4;           // у 4 рази більше обʼєктів, які можна їсти
  const SPEED_K = 6.2;
  const DASH_MULT = 2.35;
  const RESPAWN_MIN = 80;
  const RESPAWN_CAP = 620;       // більше їжі на полі
  const DASH_DRAIN = 0.0875;     // витрата витривалості (×8 більший запас ривка)
  const DASH_REGEN = 0.35;

  /* ---- стан ---- */
  const S = {
    mode: 'title', levelIndex: 0, score: 0, eaten: 0,
    shake: 0, time: 0, paused: false, muted: false,
    combo: 0, comboTimer: 0, flash: 0, flashColor: '#fff',
    diff: 'normal', diffPick: 1, gotSmart: 0,
  };
  let DIFF = DIFFICULTIES.normal;

  /* ---- світ ---- */
  let level = null;
  let props = [], enemies = [], projectiles = [], particles = [], popups = [], wells = [];
  let boss = null;
  let splitTimer = 0;
  const nikita = { x: 0, y: 0, r: 10, vx: 0, vy: 0, dir: 0, chomp: 0, wob: 0, stamina: 1, staminaLock: false, dashing: false, hurtCd: 0 };
  const cam = { x: 0, y: 0, zoom: 1 };
  let parallax = [];

  /* ---- ввід ---- */
  const input = { mx: 0, my: 0, has: false, keys: {}, dashKey: false, dashMouse: false, dashBtn: false };
  const pointers = new Map();
  let movePtr = null;

  /* =================================================================== */
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener('resize', resize);

  /* ---- звук ---- */
  let AC = null;
  function audioInit() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } }
  function beep(freq, dur, type = 'square', vol = 0.18, slide = 0) {
    if (S.muted || !AC) return;
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, AC.currentTime);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), AC.currentTime + dur);
    g.gain.setValueAtTime(vol, AC.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + dur);
    o.connect(g); g.connect(AC.destination); o.start(); o.stop(AC.currentTime + dur);
  }
  const sfxEat = () => beep(220 + Math.min(S.combo, 20) * 22, 0.08, 'square', 0.1, 120);
  const sfxBig = () => beep(150, 0.18, 'sawtooth', 0.16, 90);
  const sfxHurt = () => beep(150, 0.18, 'sawtooth', 0.18, -90);
  const sfxDash = () => beep(500, 0.12, 'triangle', 0.12, 300);
  const sfxLevel = () => [0, 0.1, 0.2].forEach((d, i) => setTimeout(() => beep([330, 415, 523][i], 0.18, 'triangle', 0.16), d * 1000));
  const sfxWin = () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => beep(f, 0.25, 'triangle', 0.2), i * 140));

  /* =================================================================== *
   *  Побудова рівня
   * =================================================================== */
  function buildWorld(i) {
    level = LEVELS[i];
    props = []; enemies = []; projectiles = []; particles = []; popups = []; wells = [];
    splitTimer = 0;
    nikita.x = level.world / 2; nikita.y = level.world / 2;
    nikita.r = level.startR; nikita.vx = nikita.vy = 0; nikita.chomp = 0; nikita.stamina = 1; nikita.staminaLock = false; nikita.hurtCd = 0;
    cam.x = nikita.x; cam.y = nikita.y; cam.zoom = 1;

    for (const sp of level.spawns) for (let k = 0; k < sp.count * FOOD_MULT; k++) props.push(makeProp(sp.type, rand(sp.rMin, sp.rMax)));
    for (const es of (level.enemies || [])) for (let k = 0; k < es.count; k++) enemies.push(makeEnemy(es));

    boss = {
      x: level.world * 0.82, y: level.world * 0.18, r: level.bossR, vx: 0, vy: 0, t: rand(0, 10),
      key: level.boss, alive: true, panic: 0,
      cfg: level.bossCfg || {}, shootTimer: 1.5, summonTimer: 1.2,
      shieldUp: !!(level.bossCfg && level.bossCfg.shield), shieldHits: 0, shieldMax: 6,
      guardianAlive: false, guardianDead: false, sidekick: (level.bossCfg && level.bossCfg.sidekick) || null,
    };

    // гравітаційні колодязі
    const gcount = (level.env && level.env.gravity) || 0;
    for (let k = 0; k < gcount; k++) wells.push({ x: rand(0.2, 0.8) * level.world, y: rand(0.2, 0.8) * level.world, r: rand(120, 200), s: rand(0.6, 1) });

    // парадлакс-крапки тла
    parallax = [];
    for (let k = 0; k < 80; k++) parallax.push({ x: rand(0, 1), y: rand(0, 1), z: rand(0.2, 0.8), r: rand(1, 3) });
  }

  function makeProp(type, r, atEdge = false) {
    let x, y, tries = 0;
    do {
      if (atEdge) { const a = rand(0, TAU), d = (Math.max(W, H) / cam.zoom) * rand(0.45, 0.7); x = clamp(nikita.x + Math.cos(a) * d, r, level.world - r); y = clamp(nikita.y + Math.sin(a) * d, r, level.world - r); }
      else { x = rand(r, level.world - r); y = rand(r, level.world - r); }
      tries++;
    } while (tries < 6 && dist(x, y, nikita.x, nikita.y) < nikita.r * 4 + r);
    const p = { x, y, r, type, seed: rand(0, 1000), t: rand(0, 10), vx: 0, vy: 0 };
    return p;
  }

  function makeEnemy(spec, atBoss = false) {
    const r = rand(spec.rMin, spec.rMax);
    let x, y;
    if (atBoss && boss) { x = boss.x + rand(-boss.r, boss.r); y = boss.y + rand(-boss.r, boss.r); }
    else { const a = rand(0, TAU), d = rand(level.world * 0.2, level.world * 0.45); x = clamp(level.world / 2 + Math.cos(a) * d, r, level.world - r); y = clamp(level.world / 2 + Math.sin(a) * d, r, level.world - r); }
    const e = {
      kind: spec.kind, x, y, r, vx: 0, vy: 0, seed: rand(0, 1000), t: rand(0, 10),
      chase: !!spec.chase, flee: !!spec.flee, moving: !!spec.moving, blink: spec.blink ? { timer: rand(2, 5) } : null,
      contact: spec.contact || 0, edibleBonus: !!spec.edibleBonus, hp: spec.hp || 0, maxhp: spec.hp || 0,
      shoot: spec.shoot ? { rate: spec.shoot.rate, shrink: spec.shoot.shrink, timer: rand(0.5, 2) } : null,
      aim: 0, hitCd: 0, guardian: !!spec.guardian, panic: 0,
    };
    if (e.moving) { const a = rand(0, TAU); const sp = rand(0.6, 1) * 130; e.vx = Math.cos(a) * sp; e.vy = Math.sin(a) * sp; } // вдвічі повільніше
    return e;
  }

  /* =================================================================== *
   *  Потік гри
   * =================================================================== */
  function startGame() { S.score = 0; S.eaten = 0; S.gotSmart = 0; playComic(STORY.intro, () => enterLevel(0)); }
  function enterLevel(i) {
    S.levelIndex = i; buildWorld(i); S.mode = 'play'; S.paused = false;
    banner(level.name, level.subtitle, level.tips); sfxLevel();
  }
  function completeLevel() {
    S.flash = 1; S.flashColor = '#fff'; S.shake = 14; sfxBig();
    const i = S.levelIndex;
    if (i < LEVELS.length - 1) {
      const key = 't' + (i + 1) + (i + 2);
      setTimeout(() => playComic(STORY[key] || STORY.generic(i), () => enterLevel(i + 1)), 700);
    } else { sfxWin(); setTimeout(() => playComic(STORY.ending, () => { S.mode = 'win'; }), 700); }
  }
  function playComic(script, done) { S.mode = 'comic'; Comics.play(script, done, nikitaPhotoOk ? NIKITA_IMG : null); }

  let bannerData = null;
  function banner(title, sub, tip) { bannerData = { title, sub, tip, t: 0 }; }

  /* =================================================================== *
   *  Оновлення
   * =================================================================== */
  function update(dt) {
    S.time += dt;
    S.flash = Math.max(0, S.flash - dt * 2.5);
    S.shake = Math.max(0, S.shake - dt * 30);
    if (S.mode === 'comic') { Comics.update(dt); return; }
    if (S.mode === 'play' && !S.paused) updatePlay(dt);
    if (S.gotSmart > 0 && S.gotSmart < 1) S.gotSmart = Math.min(1, S.gotSmart + dt * 0.5);
  }

  function updatePlay(dt) {
    nikita.wob += dt;
    nikita.chomp = Math.max(0, nikita.chomp - dt * 3);
    nikita.hurtCd = Math.max(0, nikita.hurtCd - dt);

    /* --- ривок / витривалість ---
       Запас НЕ відновлюється під час часткового використання. Він починає
       відновлюватися ЛИШЕ після того, як його повністю витрачено (до нуля),
       і тоді блокується, доки не відновиться ПОВНІСТЮ. */
    const btn = input.dashKey || input.dashMouse || input.dashBtn;
    if (nikita.staminaLock) {
      nikita.dashing = false;
      if (!btn) nikita.stamina = Math.min(1, nikita.stamina + dt * DASH_REGEN * DIFF.stamina); // поки тримаєш — не відновлюється
      if (nikita.stamina >= 1) { nikita.stamina = 1; nikita.staminaLock = false; }
    } else if (btn && nikita.stamina > 0) {
      nikita.dashing = true;
      nikita.stamina = Math.max(0, nikita.stamina - dt * DASH_DRAIN);
      if (Math.random() < 0.3) sfxDash();
      if (nikita.stamina <= 0) { nikita.stamina = 0; nikita.staminaLock = true; nikita.dashing = false; sfxHurt(); }
    } else {
      nikita.dashing = false;
      // часткове використання: запас стоїть на місці, не відновлюється
    }
    const wantDash = nikita.dashing;

    /* --- ціль руху --- */
    let tx, ty;
    const k = input.keys;
    const kx = (k['d'] || k['arrowright'] ? 1 : 0) - (k['a'] || k['arrowleft'] ? 1 : 0);
    const ky = (k['s'] || k['arrowdown'] ? 1 : 0) - (k['w'] || k['arrowup'] ? 1 : 0);
    if (kx || ky) { tx = nikita.x + kx * 1000; ty = nikita.y + ky * 1000; }
    else if (input.has) { const wp = screenToWorld(input.mx, input.my); tx = wp.x; ty = wp.y; }
    else { tx = nikita.x; ty = nikita.y; }

    let baseSpeed = nikita.r * SPEED_K * (1 + S.gotSmart * 0.25);
    if (wantDash) baseSpeed *= DASH_MULT;
    const dx = tx - nikita.x, dy = ty - nikita.y, d = Math.hypot(dx, dy) || 1;
    const want = Math.min(d, 6) / 6;
    const tvx = (dx / d) * baseSpeed * want, tvy = (dy / d) * baseSpeed * want;
    const friction = level.env && level.env.slippery ? lerp(0.0008, 0.05, level.env.slippery) : 0.0008;
    nikita.vx = damp(nikita.vx, tvx, friction, dt);
    nikita.vy = damp(nikita.vy, tvy, friction, dt);

    applyEnvForces(dt);

    nikita.x = clamp(nikita.x + nikita.vx * dt, nikita.r, level.world - nikita.r);
    nikita.y = clamp(nikita.y + nikita.vy * dt, nikita.r, level.world - nikita.r);
    if (Math.hypot(nikita.vx, nikita.vy) > 5) nikita.dir = Math.atan2(nikita.vy, nikita.vx);

    /* --- камера: що більший Нікіта — то далі камера (видно більше світу) --- */
    const baseR = Math.min(W, H) * 0.082;
    const screenR = baseR * Math.pow(level.startR / nikita.r, 0.32);  // ефективний розмір на екрані зменшується з ростом
    cam.zoom = damp(cam.zoom, clamp(screenR / nikita.r, 0.02, 4), 0.0025, dt);
    cam.x = damp(cam.x, nikita.x, 0.0001, dt); cam.y = damp(cam.y, nikita.y, 0.0001, dt);

    /* --- їжа --- */
    const eatR = nikita.r * EAT_RATIO;
    for (let i = props.length - 1; i >= 0; i--) {
      const p = props[i]; p.t += dt;
      if (p.vx || p.vy) { p.x = clamp(p.x + p.vx * dt, p.r, level.world - p.r); p.y = clamp(p.y + p.vy * dt, p.r, level.world - p.r); }
      const dd = dist(p.x, p.y, nikita.x, nikita.y);
      if (p.r <= eatR) { if (dd < nikita.r + p.r * 0.25) { eatThing(p, false); props.splice(i, 1); } }
      else if (p.r > nikita.r * 1.3 && dd < nikita.r + p.r * 0.8) {
        const a = angleTo(p.x, p.y, nikita.x, nikita.y); const push = (nikita.r + p.r * 0.8 - dd) * 0.5;
        nikita.x += Math.cos(a) * push; nikita.y += Math.sin(a) * push;
      }
    }

    updateEnemies(dt);
    updateBoss(dt);
    updateProjectiles(dt);
    updateParticles(dt);
    applyMechanic(dt);

    /* --- комбо --- */
    S.comboTimer -= dt; if (S.comboTimer <= 0) S.combo = 0;

    /* --- підтримка їжі --- */
    let edible = 0; for (const p of props) if (p.r <= eatR) edible++;
    if (edible < RESPAWN_MIN && props.length < RESPAWN_CAP) {
      const sp = pick(level.spawns);
      for (let n = 0; n < 8; n++) props.push(makeProp(sp.type, clamp(rand(nikita.r * 0.4, nikita.r * 0.95), 4, level.bossR * 0.9), true));
    }

    if (bannerData) { bannerData.t += dt; if (bannerData.t > 4) bannerData = null; }
  }

  /* ---- сили середовища (течія, гравітація, промінь) ---- */
  function applyEnvForces(dt) {
    const env = level.env || {};
    if (env.flow === 'swirl') {
      const cx = level.world / 2, cy = level.world / 2;
      const vx = -(nikita.y - cy), vy = (nikita.x - cx); const m = Math.hypot(vx, vy) || 1;
      nikita.vx += (vx / m) * nikita.r * 5 * dt; nikita.vy += (vy / m) * nikita.r * 5 * dt;   // м'яка течія
      for (const p of props) { const px = -(p.y - cy), py = (p.x - cx); const pm = Math.hypot(px, py) || 1; p.x += (px / pm) * dt * 28; p.y += (py / pm) * dt * 28; }
    }
    for (const w of wells) pull(nikita, w.x, w.y, w.r, nikita.r * 12 * w.s, dt);
    if (boss && boss.alive) {
      if (boss.cfg.beam && dist(nikita.x, nikita.y, boss.x, boss.y) < boss.r * 10) pull(nikita, boss.x, boss.y, boss.r * 10, nikita.r * 11, dt);
      if (level.mechanic === 'gravity' || level.mechanic === 'david') pull(nikita, boss.x, boss.y, boss.r * 8, nikita.r * 8, dt);
    }
  }
  // плавне прискорення до центру (units/s^2), масштабоване розміром Нікіти
  function pull(o, wx, wy, range, strength, dt) {
    const dd = dist(o.x, o.y, wx, wy); if (dd > range || dd < 1) return;
    const a = strength * (1 - dd / range);
    o.vx += ((wx - o.x) / dd) * a * dt; o.vy += ((wy - o.y) / dd) * a * dt;
  }

  /* ---- механіки рівнів ---- */
  function applyMechanic(dt) {
    if (level.mechanic === 'split') {
      splitTimer -= dt;
      if (splitTimer <= 0) {
        splitTimer = 1.6;
        const small = props.filter(p => p.type === 'microbe' || p.type === 'cell');
        const n = Math.min(6, Math.floor(small.length * 0.04));
        for (let i = 0; i < n && props.length < 360; i++) {
          const s = pick(small); const a = rand(0, TAU);
          props.push({ x: clamp(s.x + Math.cos(a) * s.r * 2, 4, level.world), y: clamp(s.y + Math.sin(a) * s.r * 2, 4, level.world), r: s.r * 0.85, type: s.type, seed: rand(0, 1000), t: 0, vx: 0, vy: 0 });
        }
      }
    }
  }

  /* ---- вороги ---- */
  function updateEnemies(dt) {
    const eatR = nikita.r * EAT_RATIO;
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i]; e.t += dt; e.hitCd = Math.max(0, e.hitCd - dt);
      const dd = dist(e.x, e.y, nikita.x, nikita.y);
      e.panic = damp(e.panic, (e.edibleBonus && nikita.r > e.r) ? 1 : 0, 0.02, dt);

      // поведінка
      let ax = 0, ay = 0;
      if (e.blink) { e.blink.timer -= dt; if (e.blink.timer <= 0 && dd < nikita.r * 14) { const a = rand(0, TAU), rr = rand(nikita.r * 4, nikita.r * 7); e.x = clamp(nikita.x + Math.cos(a) * rr, e.r, level.world - e.r); e.y = clamp(nikita.y + Math.sin(a) * rr, e.r, level.world - e.r); e.blink.timer = rand(2.5, 5); burst(e.x, e.y, e.r, 8, 150); } }
      if (e.moving) { e.x += e.vx * dt; e.y += e.vy * dt; if (e.x < e.r || e.x > level.world - e.r) e.vx *= -1; if (e.y < e.r || e.y > level.world - e.r) e.vy *= -1; e.x = clamp(e.x, e.r, level.world - e.r); e.y = clamp(e.y, e.r, level.world - e.r); e.aim = Math.atan2(e.vy, e.vx); }
      else if (e.chase && nikita.r < e.r * 2.2) { const a = angleTo(e.x, e.y, nikita.x, nikita.y); ax = Math.cos(a); ay = Math.sin(a); }
      else if (e.flee || (e.chase && nikita.r >= e.r * 2.2)) { const a = angleTo(nikita.x, nikita.y, e.x, e.y); ax = Math.cos(a); ay = Math.sin(a); }
      if (!e.moving) {
        const sp = e.r * 2.75 * DIFF.enemySpeed * (e.kind === 'tank' ? 0.5 : e.kind === 'robot' ? 0.8 : 1); // вдвічі повільніше
        e.vx = damp(e.vx, ax * sp, 0.002, dt); e.vy = damp(e.vy, ay * sp, 0.002, dt);
        e.x = clamp(e.x + e.vx * dt, e.r, level.world - e.r); e.y = clamp(e.y + e.vy * dt, e.r, level.world - e.r);
        if (ax || ay) e.aim = Math.atan2(nikita.y - e.y, nikita.x - e.x);
      }

      // стрільба
      if (e.shoot && dd < nikita.r * 16) { e.shoot.timer -= dt; if (e.shoot.timer <= 0) { e.shoot.timer = e.shoot.rate / DIFF.shootRate; shootAt(e.x, e.y, e.r * 0.18, e.shoot.shrink); } }

      // контакт
      if (dd < nikita.r + e.r * 0.6) {
        if (e.r <= eatR && e.edibleBonus) { killEnemy(e, i, true); continue; }
        if (nikita.dashing && e.hp > 0 && e.hitCd <= 0) { e.hp--; e.hitCd = 0.3; const a = angleTo(nikita.x, nikita.y, e.x, e.y); e.vx += Math.cos(a) * 400; e.vy += Math.sin(a) * 400; burst(e.x, e.y, e.r * 0.5, 6, 0); sfxHurt(); if (e.hp <= 0) { killEnemy(e, i, false); continue; } }
        else if (e.contact && nikita.r < e.r * 1.05 && nikita.hurtCd <= 0 && !nikita.dashing) hurtNikita(e.contact, e.x, e.y);
      }
    }
  }
  function killEnemy(e, i, eaten) {
    enemies.splice(i, 1);
    if (eaten) { eatThing(e, true); } else { burst(e.x, e.y, e.r, 16, 30); S.score += 40; popup(e.x, e.y, '+40', '#ffd84d'); }
    if (e.guardian && boss) { boss.guardianAlive = false; boss.guardianDead = true; boss.shieldUp = false; S.flash = 0.6; S.flashColor = '#7CFFB2'; popup(boss.x, boss.y, 'ЩИТ ВПАВ!', '#7CFFB2'); }
  }

  /* ---- бос ---- */
  function updateBoss(dt) {
    if (!boss || !boss.alive) return;
    boss.t += dt;
    const dd = dist(boss.x, boss.y, nikita.x, nikita.y);
    const bigEnough = nikita.r >= boss.r * 0.95;
    const edible = bigEnough && !boss.shieldUp;
    boss.panic = damp(boss.panic, edible && dd < boss.r * 7 ? 1 : (dd < boss.r * 5 ? 0.5 : 0), 0.01, dt);

    // рух — тікає
    const fleeRange = boss.r * 9;
    let bx, by;
    if (dd < fleeRange) { const a = angleTo(nikita.x, nikita.y, boss.x, boss.y); bx = Math.cos(a); by = Math.sin(a); }
    else { bx = Math.cos(boss.t * 0.4); by = Math.sin(boss.t * 0.5); }
    const bspeed = nikita.r * SPEED_K * DIFF.bossSpeed * (edible ? 0.3 : 0.24); // бос теж удвічі повільніший
    boss.x = clamp(boss.x + bx * bspeed * dt, boss.r, level.world - boss.r);
    boss.y = clamp(boss.y + by * bspeed * dt, boss.r, level.world - boss.r);

    // стрільба
    if (boss.cfg.shoot && dd < fleeRange * 1.4) { boss.shootTimer -= dt; if (boss.shootTimer <= 0) { boss.shootTimer = boss.cfg.shoot.rate / DIFF.shootRate; shootAt(boss.x, boss.y, boss.r * 0.16, boss.cfg.shoot.shrink, true); } }

    // виклик підмоги/робота
    if (boss.cfg.summon && !(boss.cfg.summon.guardian && boss.guardianDead)) {
      boss.summonTimer -= dt;
      const sameKind = enemies.filter(e => e.kind === boss.cfg.summon.kind).length;
      if (boss.summonTimer <= 0 && sameKind < boss.cfg.summon.max) {
        boss.summonTimer = boss.cfg.summon.every;
        const spec = { kind: boss.cfg.summon.kind, rMin: boss.r * 0.4, rMax: boss.r * 0.5, chase: true, shoot: { rate: 1.8, shrink: 0.05 }, hp: boss.cfg.summon.kind === 'robot' ? 4 : 0, edibleBonus: true, guardian: boss.cfg.summon.guardian };
        const e = makeEnemy(spec, true); enemies.push(e);
        if (boss.cfg.summon.guardian) boss.guardianAlive = true;
        popup(boss.x, boss.y, boss.cfg.summon.guardian ? 'РОБОТ!' : 'ПІДМОГА!', '#ff6b8a');
      }
    }

    // щит (для guarded — продавлюється ривком)
    if (boss.shieldUp && !boss.cfg.summon) {
      if (nikita.dashing && dd < nikita.r + boss.r * 1.2 && nikita.hurtCd <= 0) {
        boss.shieldHits++; nikita.hurtCd = 0.4; burst((boss.x + nikita.x) / 2, (boss.y + nikita.y) / 2, boss.r * 0.4, 10, 190);
        const a = angleTo(boss.x, boss.y, nikita.x, nikita.y); nikita.vx += Math.cos(a) * 200; nikita.vy += Math.sin(a) * 200;
        if (boss.shieldHits >= boss.shieldMax) { boss.shieldUp = false; S.flash = 0.6; S.flashColor = '#7CFFB2'; popup(boss.x, boss.y, 'ЩИТ ЗЛАМАНО!', '#7CFFB2'); }
      }
    }

    // з'їдання боса
    if (edible && dd < nikita.r + boss.r * 0.2) {
      boss.alive = false;
      nikita.r = radiusFromArea(areaOf(nikita.r) + areaOf(boss.r) * BASE_GROW);
      nikita.chomp = 1; burst(boss.x, boss.y, boss.r, 30, 50); S.score += 500;
      popup(boss.x, boss.y, Art.nameOf(boss.key).toUpperCase() + ' З\'ЇДЕНИЙ!', '#7CFFB2');
      if (level.mechanic === 'david') S.gotSmart = 0.001;
      completeLevel();
    }
  }

  function shootAt(x, y, r, shrink, big) {
    const lead = 0.12; const px = nikita.x + nikita.vx * lead, py = nikita.y + nikita.vy * lead;
    const a = angleTo(x, y, px, py) + rand(-0.08, 0.08);
    const sp = Math.min(W, H) / cam.zoom * (big ? 0.85 : 0.95);
    projectiles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r, life: 4, shrink: shrink * DIFF.shrink, big });
    beep(300, 0.08, 'sawtooth', 0.08, -120);
  }
  function updateProjectiles(dt) {
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const pr = projectiles[i]; pr.x += pr.vx * dt; pr.y += pr.vy * dt; pr.life -= dt;
      if (dist(pr.x, pr.y, nikita.x, nikita.y) < nikita.r + pr.r && nikita.hurtCd <= 0) { hurtNikita(pr.shrink, pr.x, pr.y); projectiles.splice(i, 1); continue; }
      if (pr.life <= 0 || pr.x < -50 || pr.x > level.world + 50 || pr.y < -50 || pr.y > level.world + 50) projectiles.splice(i, 1);
    }
  }
  function hurtNikita(frac, x, y) {
    nikita.r = Math.max(level.startR * 0.7, radiusFromArea(areaOf(nikita.r) * (1 - frac)));
    nikita.hurtCd = 0.6; S.shake = 14; S.flash = 0.5; S.flashColor = '#ff5a6e'; sfxHurt();
    burst(x, y, nikita.r * 0.3, 10, 0); popup(nikita.x, nikita.y - nikita.r, '-' + Math.round(frac * 100) + '%', '#ff6b8a');
    S.combo = 0;
  }

  function eatThing(p, isEnemy) {
    nikita.r = radiusFromArea(areaOf(nikita.r) + areaOf(p.r) * BASE_GROW * DIFF.grow);
    nikita.chomp = 1; S.eaten++; S.combo++; S.comboTimer = 1.4;
    const val = Math.ceil(areaOf(p.r) / 60) + S.combo + (isEnemy ? 20 : 0);
    S.score += val; sfxEat(); burst(p.x, p.y, p.r, isEnemy ? 12 : 6, isEnemy ? 30 : 285);
    if (S.combo > 4 && S.combo % 3 === 0) popup(p.x, p.y, 'x' + S.combo, '#ffd84d');
  }

  /* ---- частинки / спливання ---- */
  function burst(x, y, r, n, hue) { for (let i = 0; i < n; i++) { const a = rand(0, TAU), sp = rand(0.5, 3) * (r + 20); particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: rand(0.4, 0.9), max: 0.9, r: rand(r * 0.1, r * 0.3) + 3, hue: hue + rand(-20, 20), goo: hue === 285 }); } }
  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) { const p = particles[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.92; p.vy *= 0.92; p.life -= dt; if (p.life <= 0) particles.splice(i, 1); }
    for (let i = popups.length - 1; i >= 0; i--) { const p = popups[i]; p.y += p.vy * dt; p.life -= dt; if (p.life <= 0) popups.splice(i, 1); }
  }
  function popup(x, y, text, color) { popups.push({ x, y, vy: -40, life: 1.1, text, color }); }

  /* =================================================================== *
   *  Координати
   * =================================================================== */
  const worldToScreen = (x, y) => ({ x: (x - cam.x) * cam.zoom + W / 2, y: (y - cam.y) * cam.zoom + H / 2 });
  const screenToWorld = (x, y) => ({ x: (x - W / 2) / cam.zoom + cam.x, y: (y - H / 2) / cam.zoom + cam.y });

  /* =================================================================== *
   *  Рендер
   * =================================================================== */
  function render() {
    ctx.clearRect(0, 0, W, H);
    if (S.mode === 'title') return drawTitle();
    if (S.mode === 'difficulty') return drawDifficulty();
    if (S.mode === 'comic') return Comics.render(ctx, W, H);
    if (S.mode === 'play' || S.mode === 'win') {
      renderWorld();
      if ((level.env && (level.env.dark || level.env.fog))) drawVisionMask();
      if (S.mode === 'play') { drawBossArrow(); drawHUD(); drawDashButton(); if (S.paused) drawPause(); if (bannerData) drawBanner(); }
    }
    if (S.mode === 'win') drawWin();
    drawVignette();
    if (S.flash > 0) { ctx.save(); ctx.globalAlpha = S.flash * 0.6; ctx.fillStyle = S.flashColor; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  }

  function renderWorld() {
    ctx.save();
    if (S.shake > 0) ctx.translate(rand(-S.shake, S.shake), rand(-S.shake, S.shake));
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, level.sky[0]); g.addColorStop(1, level.sky[1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // парадлакс
    for (const s of parallax) { const sx = (s.x * W + (-cam.x * s.z * cam.zoom)) % W; const sy = (s.y * H + (-cam.y * s.z * cam.zoom)) % H; ctx.fillStyle = `rgba(255,255,255,${0.05 + s.z * 0.1})`; ctx.fillRect((sx + W) % W, (sy + H) % H, s.r, s.r); }

    ctx.save();
    ctx.translate(W / 2, H / 2); ctx.scale(cam.zoom, cam.zoom); ctx.translate(-cam.x, -cam.y);
    drawFloor();

    const view = { x0: cam.x - W / 2 / cam.zoom, y0: cam.y - H / 2 / cam.zoom, x1: cam.x + W / 2 / cam.zoom, y1: cam.y + H / 2 / cam.zoom };
    const pad = 100 / cam.zoom;
    const vis = (o) => o.x > view.x0 - o.r - pad && o.x < view.x1 + o.r + pad && o.y > view.y0 - o.r - pad && o.y < view.y1 + o.r + pad;

    // колодязі гравітації
    for (const w of wells) { ctx.save(); const gg = ctx.createRadialGradient(w.x, w.y, 0, w.x, w.y, w.r); gg.addColorStop(0, 'rgba(120,40,200,0.35)'); gg.addColorStop(1, 'rgba(120,40,200,0)'); ctx.fillStyle = gg; circle(ctx, w.x, w.y, w.r); ctx.fill(); ctx.strokeStyle = 'rgba(180,120,255,0.3)'; ctx.lineWidth = 2 / cam.zoom; for (let rr = w.r; rr > 10; rr -= w.r / 4) { ctx.beginPath(); ctx.arc(w.x, w.y, rr * (0.6 + 0.4 * ((S.time * 0.3 + rr / w.r) % 1)), 0, TAU); ctx.stroke(); } ctx.restore(); }

    const edibleMark = nikita.r * EAT_RATIO;
    const visible = props.filter(vis); visible.sort((a, b) => b.r - a.r);
    for (const p of visible) {
      Art.prop(ctx, p.x, p.y, p.r, p.type, p.seed, p.t);
      if (p.r <= edibleMark && p.r > nikita.r * 0.5) { ctx.save(); ctx.globalAlpha = 0.22 + 0.18 * Math.sin(S.time * 6 + p.seed); ctx.strokeStyle = '#7CFFB2'; ctx.lineWidth = 2 / cam.zoom; circle(ctx, p.x, p.y, p.r * 1.12); ctx.stroke(); ctx.restore(); }
    }
    for (const e of enemies) if (vis(e)) drawEnemy(e);
    if (boss && boss.alive && vis(boss)) drawBoss();
    for (const pr of projectiles) if (vis(pr)) drawProjectile(pr);

    Art.nikita(ctx, nikita.x, nikita.y, nikita.r, { dir: nikita.dir, chomp: nikita.chomp, wobble: nikita.wob, img: nikitaPhotoOk ? NIKITA_IMG : null, hue: level.hue, smart: S.gotSmart });
    if (nikita.dashing) { ctx.save(); ctx.globalAlpha = 0.4; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3 / cam.zoom; for (let i = 1; i <= 3; i++) { circle(ctx, nikita.x - nikita.vx * 0.01 * i, nikita.y - nikita.vy * 0.01 * i, nikita.r * (1 - i * 0.12)); ctx.stroke(); } ctx.restore(); }

    for (const p of particles) Art.sparkle(ctx, p.x, p.y, p.r, p.hue, clamp(p.life / p.max, 0, 1), p.goo ? 'goo' : 'star');
    for (const p of popups) { ctx.save(); ctx.globalAlpha = clamp(p.life, 0, 1); ctx.font = `800 ${Math.round(nikita.r * 0.5)}px Montserrat, Arial`; ctx.fillStyle = p.color; ctx.textAlign = 'center'; ctx.lineWidth = nikita.r * 0.06; ctx.strokeStyle = '#000'; ctx.strokeText(p.text, p.x, p.y); ctx.fillText(p.text, p.x, p.y); ctx.restore(); }

    ctx.restore(); ctx.restore();
  }

  function drawFloor() {
    ctx.fillStyle = level.floor; ctx.fillRect(0, 0, level.world, level.world);
    ctx.strokeStyle = level.grid; ctx.lineWidth = 1.5 / cam.zoom;
    const step = level.world / 24; ctx.beginPath();
    for (let i = 0; i <= 24; i++) { ctx.moveTo(i * step, 0); ctx.lineTo(i * step, level.world); ctx.moveTo(0, i * step); ctx.lineTo(level.world, i * step); }
    ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 8 / cam.zoom; ctx.strokeRect(0, 0, level.world, level.world);
  }

  function drawEnemy(e) {
    Art.figure(ctx, e.kind, e.x, e.y, e.r, { t: e.t, seed: e.seed, aim: e.aim, panic: e.panic });
    if (e.maxhp > 1) { const w = e.r * 1.6, h = e.r * 0.16; ctx.fillStyle = 'rgba(0,0,0,0.5)'; roundRect(ctx, e.x - w / 2, e.y - e.r * 1.5, w, h, h / 2); ctx.fill(); ctx.fillStyle = '#ff5a6e'; roundRect(ctx, e.x - w / 2, e.y - e.r * 1.5, w * (e.hp / e.maxhp), h, h / 2); ctx.fill(); }
  }
  function drawBoss() {
    const bigEnough = nikita.r >= boss.r * 0.95;
    const edible = bigEnough && !boss.shieldUp;
    ctx.save();
    const pulse = 0.5 + 0.5 * Math.sin(S.time * 4); ctx.globalAlpha = (edible ? 0.5 : 0.3) * (0.6 + pulse * 0.4);
    const gg = ctx.createRadialGradient(boss.x, boss.y, boss.r * 0.5, boss.x, boss.y, boss.r * 1.8);
    gg.addColorStop(0, edible ? 'rgba(124,255,178,0.6)' : 'rgba(255,90,120,0.5)'); gg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gg; circle(ctx, boss.x, boss.y, boss.r * 1.8); ctx.fill(); ctx.restore();

    if (boss.sidekick) Art.figure(ctx, boss.sidekick, boss.x - boss.r * 0.95, boss.y + boss.r * 0.1, boss.r * 0.78, { t: boss.t + 1, panic: boss.panic });
    Art.figure(ctx, boss.key, boss.x, boss.y, boss.r, { t: boss.t, panic: boss.panic });

    // щит
    if (boss.shieldUp) {
      ctx.save(); const sp = boss.cfg.summon ? 1 : (1 - boss.shieldHits / boss.shieldMax);
      ctx.globalAlpha = 0.25 + 0.2 * Math.sin(S.time * 5); ctx.strokeStyle = '#6fe3ff'; ctx.lineWidth = 4 / cam.zoom;
      circle(ctx, boss.x, boss.y, boss.r * 1.4); ctx.stroke();
      ctx.globalAlpha = 0.12 * sp; const sg = ctx.createRadialGradient(boss.x, boss.y, boss.r, boss.x, boss.y, boss.r * 1.4); sg.addColorStop(0, 'rgba(120,220,255,0)'); sg.addColorStop(1, 'rgba(120,220,255,0.8)'); ctx.fillStyle = sg; circle(ctx, boss.x, boss.y, boss.r * 1.4); ctx.fill(); ctx.restore();
    }

    const nm = (boss.sidekick ? Art.nameOf(boss.key) + ' & ' + Art.nameOf(boss.sidekick) : Art.nameOf(boss.key)).toUpperCase();
    ctx.save(); ctx.font = `800 ${Math.round(boss.r * 0.3)}px Montserrat, Arial`; ctx.textAlign = 'center';
    ctx.lineWidth = boss.r * 0.06; ctx.strokeStyle = '#000'; ctx.strokeText(nm, boss.x, boss.y - boss.r * 1.65);
    ctx.fillStyle = edible ? '#7CFFB2' : '#ffd84d'; ctx.fillText(nm, boss.x, boss.y - boss.r * 1.65);
    ctx.font = `700 ${Math.round(boss.r * 0.17)}px Montserrat, Arial`; ctx.fillStyle = '#fff';
    const hint = boss.shieldUp ? (boss.cfg.summon ? 'знищ робота → впаде щит' : 'ривок крізь щит!') : (edible ? '★ ЇЖ ЙОГО! ★' : 'замалий... рости ще!');
    ctx.fillText(hint, boss.x, boss.y - boss.r * 1.4); ctx.restore();
  }
  function drawProjectile(pr) {
    ctx.save(); const gg = ctx.createRadialGradient(pr.x, pr.y, 1, pr.x, pr.y, pr.r * 2.4);
    gg.addColorStop(0, '#fff'); gg.addColorStop(0.4, pr.big ? '#b06bff' : '#ff7a5a'); gg.addColorStop(1, 'rgba(120,40,200,0)');
    ctx.fillStyle = gg; circle(ctx, pr.x, pr.y, pr.r * 2.4); ctx.fill();
    ctx.fillStyle = '#2a0a40'; circle(ctx, pr.x, pr.y, pr.r); ctx.fill(); ctx.restore();
  }

  /* ---- маска зору (темрява/туман) ---- */
  function drawVisionMask() {
    const sp = worldToScreen(nikita.x, nikita.y);
    const dark = level.env.dark;
    const R = dark ? dark * cam.zoom : Math.min(W, H) * 0.55;
    ctx.save();
    const g = ctx.createRadialGradient(sp.x, sp.y, R * 0.4, sp.x, sp.y, R);
    if (dark) { g.addColorStop(0, 'rgba(3,3,8,0)'); g.addColorStop(0.7, 'rgba(3,3,8,0.2)'); g.addColorStop(1, 'rgba(3,3,8,0.97)'); }
    else { g.addColorStop(0, 'rgba(200,210,225,0)'); g.addColorStop(0.6, 'rgba(200,210,225,0.25)'); g.addColorStop(1, 'rgba(190,200,215,0.92)'); }
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  }
  function drawVignette() {
    ctx.save(); const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.4)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  }

  /* ---- стрілка до боса ---- */
  function drawBossArrow() {
    if (!boss || !boss.alive) return;
    const sp = worldToScreen(boss.x, boss.y);
    const margin = 60, on = sp.x > margin && sp.x < W - margin && sp.y > margin && sp.y < H - margin;
    if (on && !(level.env && (level.env.fog || level.env.dark))) return;
    const a = Math.atan2(sp.y - H / 2, sp.x - W / 2);
    const ax = clamp(sp.x, margin, W - margin), ay = clamp(sp.y, margin, H - margin);
    ctx.save(); ctx.translate(on ? sp.x : ax, on ? sp.y - 70 : ay); ctx.rotate(on ? -Math.PI / 2 : a);
    ctx.fillStyle = '#ffd84d'; ctx.beginPath(); ctx.moveTo(22, 0); ctx.lineTo(-12, -14); ctx.lineTo(-12, 14); ctx.closePath(); ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = '#000'; ctx.stroke(); ctx.restore();
    ctx.save(); ctx.font = '700 13px Montserrat, Arial'; ctx.fillStyle = '#ffd84d'; ctx.textAlign = 'center';
    ctx.fillText('🎯 ' + Art.nameOf(boss.key), on ? sp.x : ax, on ? sp.y - 86 : ay + (ay < H / 2 ? 34 : -24)); ctx.restore();
  }

  /* =================================================================== *
   *  HUD / екрани
   * =================================================================== */
  function drawHUD() {
    const prog = clamp(invLerp(level.startR, level.bossR, nikita.r), 0, 1);
    const bx = 24, by = 26, bw = Math.min(440, W * 0.45), bh = 16;
    ctx.save();
    ctx.font = '800 16px Montserrat, Arial'; ctx.fillStyle = '#fff'; ctx.textAlign = 'left';
    ctx.fillText(level.name, bx, by - 8);
    ctx.font = '600 11px Montserrat, Arial'; ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText('масштаб: ' + level.scale + '  ·  ' + DIFF.name, bx, by + bh + 14);
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; roundRect(ctx, bx, by, bw, bh, 8); ctx.fill();
    const grd = ctx.createLinearGradient(bx, 0, bx + bw, 0); grd.addColorStop(0, '#7CFFB2'); grd.addColorStop(1, '#9b5de5');
    ctx.fillStyle = grd; roundRect(ctx, bx, by, Math.max(8, bw * prog), bh, 8); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.font = '700 11px Montserrat, Arial'; ctx.fillText('розмір ' + Math.round(prog * 100) + '%', bx + 8, by + bh - 4);

    // стаміна (ривок)
    const sx2 = bx, sy2 = by + bh + 22, sw = 180, sh = 9;
    const locked = nikita.staminaLock;
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; roundRect(ctx, sx2, sy2, sw, sh, 4); ctx.fill();
    ctx.fillStyle = locked ? '#ff5a6e' : (nikita.stamina > 0.99 ? '#7CFFB2' : '#6fe3ff');
    roundRect(ctx, sx2, sy2, Math.max(2, sw * nikita.stamina), sh, 4); ctx.fill();
    ctx.font = '700 10px Montserrat, Arial';
    if (locked) { ctx.fillStyle = (0.5 + 0.5 * Math.sin(S.time * 10)) > 0.5 ? '#ff7a8e' : '#ffd84d'; ctx.fillText('ПЕРЕЗАРЯДКА — відпусти ривок (' + Math.round(nikita.stamina * 100) + '%)', sx2 + sw + 8, sy2 + sh); }
    else if (nikita.stamina < 0.999) { ctx.fillStyle = '#ffd06b'; ctx.fillText('РИВОК — витрать до нуля для перезарядки', sx2 + sw + 8, sy2 + sh); }
    else { ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillText('РИВОК (Shift / ПКМ / ⚡)', sx2 + sw + 8, sy2 + sh); }

    ctx.textAlign = 'right'; ctx.font = '800 20px Montserrat, Arial'; ctx.fillStyle = '#fff';
    ctx.fillText('🍴 ' + S.score, W - 24, 36);
    ctx.font = '700 13px Montserrat, Arial'; ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('Рівень ' + (S.levelIndex + 1) + '/' + LEVELS.length, W - 24, 56);
    if (S.combo > 2) { ctx.fillStyle = '#ffd84d'; ctx.font = '800 16px Montserrat, Arial'; ctx.fillText('КОМБО x' + S.combo, W - 24, 78); }

    ctx.textAlign = 'right'; ctx.font = '600 12px Montserrat, Arial'; ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('миша/WASD рух · P пауза · M звук' + (S.muted ? ' 🔇' : ' 🔊'), W - 24, H - 18);
    ctx.restore();
  }

  function drawDashButton() {
    const r = Math.min(W, H) * 0.08, x = W - r - 30, y = H - r - 30;
    const locked = nikita.staminaLock;
    ctx.save();
    ctx.globalAlpha = locked ? 0.4 : (nikita.dashing ? 0.95 : 0.6);
    const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r);
    if (locked) { g.addColorStop(0, '#ff7a8e'); g.addColorStop(1, '#7a2230'); } else { g.addColorStop(0, '#6fe3ff'); g.addColorStop(1, '#2a5fa0'); }
    ctx.fillStyle = g; circle(ctx, x, y, r); ctx.fill();
    // кільце запасу
    ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(0,0,0,0.35)'; circle(ctx, x, y, r); ctx.stroke();
    ctx.strokeStyle = locked ? '#ffd84d' : '#fff';
    ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + TAU * nikita.stamina); ctx.stroke();
    ctx.globalAlpha = locked ? 0.6 : 1;
    ctx.fillStyle = '#fff'; ctx.font = `800 ${Math.round(r * 0.5)}px Montserrat, Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(locked ? '⌛' : '⚡', x, y); ctx.restore();
    drawDashButton.rect = { x, y, r };
  }

  function drawBanner() {
    const a = bannerData.t < 0.5 ? Ease.outCubic(bannerData.t / 0.5) : bannerData.t > 3.3 ? 1 - Ease.inOutQuad((bannerData.t - 3.3) / 0.7) : 1;
    ctx.save(); ctx.globalAlpha = clamp(a, 0, 1); ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; roundRect(ctx, W / 2 - 340, H * 0.15, 680, 104, 14); ctx.fill();
    ctx.fillStyle = '#ffd84d'; ctx.font = '900 30px Montserrat, Arial'; ctx.fillText(bannerData.title, W / 2, H * 0.15 + 40);
    ctx.fillStyle = '#fff'; ctx.font = '600 17px Montserrat, Arial'; ctx.fillText(bannerData.sub, W / 2, H * 0.15 + 68);
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = '500 13px Montserrat, Arial'; ctx.fillText(bannerData.tip, W / 2, H * 0.15 + 92);
    ctx.restore();
  }
  function drawPause() { ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, W, H); ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = '900 48px Montserrat, Arial'; ctx.fillText('ПАУЗА', W / 2, H / 2 - 10); ctx.font = '600 18px Montserrat, Arial'; ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillText('натисни P, щоб продовжити', W / 2, H / 2 + 26); ctx.restore(); }

  /* ---- титул ---- */
  let titleProps = [];
  function ensureTitleProps() { if (titleProps.length) return; const types = ['microbe', 'pill', 'mug', 'car', 'tree', 'book', 'atom', 'star', 'satellite', 'cell']; for (let i = 0; i < 18; i++) titleProps.push({ x: rand(0, 1), y: rand(0, 1), r: rand(14, 30), type: pick(types), seed: rand(0, 1000), vx: rand(-0.02, 0.02), vy: rand(-0.02, 0.02), t: rand(0, 10) }); }
  function drawTitle() {
    ensureTitleProps();
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a1245'); g.addColorStop(1, '#0a0414'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (const p of titleProps) { p.x += p.vx * 0.01; p.y += p.vy * 0.01; p.t += 0.016; if (p.x < -0.05) p.x = 1.05; if (p.x > 1.05) p.x = -0.05; if (p.y < -0.05) p.y = 1.05; if (p.y > 1.05) p.y = -0.05; ctx.globalAlpha = 0.45; Art.prop(ctx, p.x * W, p.y * H, p.r, p.type, p.seed, p.t); ctx.globalAlpha = 1; }
    const t = S.time, r = Math.min(W, H) * 0.13;
    Art.nikita(ctx, W / 2, H * 0.44, r, { dir: Math.sin(t) * 0.5, chomp: 0.5 + 0.5 * Math.sin(t * 4), wobble: t * 1.4, img: nikitaPhotoOk ? NIKITA_IMG : null, hue: 285 });
    ctx.textAlign = 'center';
    ctx.save(); ctx.translate(W / 2, H * 0.17); const bob = Math.sin(t * 2) * 4;
    ctx.font = `900 ${Math.round(Math.min(W * 0.12, 96))}px Montserrat, Arial Black, Arial`; ctx.lineJoin = 'round'; ctx.lineWidth = 14; ctx.strokeStyle = '#160a26'; ctx.strokeText('НІКІТА', 0, bob);
    const tg = ctx.createLinearGradient(0, -40, 0, 40); tg.addColorStop(0, '#c79bff'); tg.addColorStop(1, '#7b3fd0'); ctx.fillStyle = tg; ctx.fillText('НІКІТА', 0, bob);
    ctx.font = `800 ${Math.round(Math.min(W * 0.05, 38))}px Montserrat, Arial`; ctx.lineWidth = 8; ctx.strokeStyle = '#160a26'; ctx.strokeText('ПОЖИРАЧ ПЛАНЕТИ', 0, 52 + bob); ctx.fillStyle = '#ffd84d'; ctx.fillText('ПОЖИРАЧ ПЛАНЕТИ', 0, 52 + bob); ctx.restore();
    const blink = 0.55 + 0.45 * Math.sin(t * 3); ctx.globalAlpha = blink; ctx.fillStyle = '#fff'; ctx.font = '800 24px Montserrat, Arial'; ctx.fillText('▶ КЛІК / ПРОБІЛ — почати', W / 2, H * 0.72); ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '500 14px Montserrat, Arial';
    ctx.fillText('15 рівнів · 15 механік · бактерії → вчені → армія → прибульці → ДАВІД', W / 2, H * 0.79);
    ctx.fillStyle = nikitaPhotoOk ? 'rgba(124,255,178,0.8)' : 'rgba(255,255,255,0.45)'; ctx.font = '500 12px Montserrat, Arial';
    ctx.fillText(nikitaPhotoOk ? '✓ фото Нікіти завантажено' : 'поклади фото у assets/nikita.png — стане обличчям Нікіти', W / 2, H * 0.85);
  }

  /* ---- вибір складності ---- */
  const diffKeys = ['easy', 'normal', 'hard'];
  function drawDifficulty() {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#241040'); g.addColorStop(1, '#0a0414'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = '900 40px Montserrat, Arial'; ctx.fillText('ОБЕРИ СКЛАДНІСТЬ', W / 2, H * 0.22);
    const cardW = Math.min(260, W * 0.26), gap = 30, totalW = cardW * 3 + gap * 2, x0 = W / 2 - totalW / 2, cy = H * 0.5, cardH = H * 0.32;
    drawDifficulty.rects = [];
    for (let i = 0; i < 3; i++) {
      const d = DIFFICULTIES[diffKeys[i]]; const x = x0 + i * (cardW + gap), y = cy - cardH / 2; const sel = i === S.diffPick;
      ctx.save(); if (sel) { ctx.shadowColor = d.color; ctx.shadowBlur = 30; }
      ctx.fillStyle = sel ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)'; roundRect(ctx, x, y, cardW, cardH, 18); ctx.fill();
      ctx.strokeStyle = d.color; ctx.lineWidth = sel ? 5 : 2; roundRect(ctx, x, y, cardW, cardH, 18); ctx.stroke(); ctx.restore();
      ctx.fillStyle = d.color; ctx.font = '900 30px Montserrat, Arial'; ctx.fillText(d.name, x + cardW / 2, y + 56);
      ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.font = '600 14px Montserrat, Arial';
      const desc = i === 0 ? ['швидкий ріст', 'слабші вороги', 'для новачка'] : i === 1 ? ['баланс', 'як задумано', 'рекомендовано'] : ['повільний ріст', 'злі вороги', 'для хардкору'];
      desc.forEach((line, j) => ctx.fillText(line, x + cardW / 2, y + 92 + j * 24));
      const stars = i + 1; ctx.fillStyle = '#ffd84d'; ctx.font = '20px Arial'; ctx.fillText('★'.repeat(stars) + '☆'.repeat(3 - stars), x + cardW / 2, y + cardH - 24);
      drawDifficulty.rects.push({ x, y, w: cardW, h: cardH, key: diffKeys[i] });
    }
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '600 16px Montserrat, Arial';
    ctx.fillText('◀ ▶ або клік по картці · ПРОБІЛ/КЛІК — почати', W / 2, H * 0.82);
  }

  function drawWin() {
    ctx.save(); ctx.fillStyle = 'rgba(8,2,20,0.62)'; ctx.fillRect(0, 0, W, H); ctx.textAlign = 'center'; const t = S.time;
    ctx.font = `900 ${Math.round(Math.min(W * 0.12, 92))}px Montserrat, Arial Black, Arial`; ctx.lineJoin = 'round'; ctx.lineWidth = 14; ctx.strokeStyle = '#160a26'; ctx.strokeText('ПЕРЕМОГА!', W / 2, H * 0.32 + Math.sin(t * 2) * 5);
    const tg = ctx.createLinearGradient(0, H * 0.26, 0, H * 0.38); tg.addColorStop(0, '#7CFFB2'); tg.addColorStop(1, '#2bd17a'); ctx.fillStyle = tg; ctx.fillText('ПЕРЕМОГА!', W / 2, H * 0.32 + Math.sin(t * 2) * 5);
    ctx.font = '700 22px Montserrat, Arial'; ctx.fillStyle = '#fff';
    ctx.fillText('Нікіта зжер Давіда й став РОЗУМНІШИМ та ШВИДШИМ.', W / 2, H * 0.45);
    ctx.fillText('Складність: ' + DIFF.name + '  ·  Рахунок: ' + S.score + '  ·  З\'їдено: ' + S.eaten, W / 2, H * 0.51);
    const blink = 0.55 + 0.45 * Math.sin(t * 3); ctx.globalAlpha = blink; ctx.fillStyle = '#ffd84d'; ctx.font = '800 24px Montserrat, Arial'; ctx.fillText('▶ КЛІК — зіграти ще раз', W / 2, H * 0.64); ctx.restore();
  }

  /* =================================================================== *
   *  Ввід
   * =================================================================== */
  function inDash(x, y) { const r = drawDashButton.rect; return r && Math.hypot(x - r.x, y - r.y) <= r.r * 1.2; }

  function onDown(e) {
    audioInit(); if (e.cancelable) e.preventDefault();
    const p = e.changedTouches ? e.changedTouches[0] : e;
    const id = e.changedTouches ? p.identifier : 'mouse';
    const x = p.clientX, y = p.clientY;
    if (e.button === 2) { input.dashMouse = true; return; }

    if (S.mode === 'play' && inDash(x, y)) { input.dashBtn = true; pointers.set(id, { dash: true }); return; }
    pointers.set(id, { dash: false }); movePtr = id; input.mx = x; input.my = y; input.has = true;

    if (S.mode === 'title') S.mode = 'difficulty';
    else if (S.mode === 'difficulty') { const hit = (drawDifficulty.rects || []).find(r => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h); if (hit) S.diffPick = diffKeys.indexOf(hit.key); pickDifficultyAndStart(); }
    else if (S.mode === 'comic') Comics.skip();
    else if (S.mode === 'win') { S.mode = 'title'; titleProps = []; }
  }
  function onMove(e) {
    const list = e.changedTouches ? Array.from(e.changedTouches) : [e];
    for (const p of list) { const id = e.changedTouches ? p.identifier : 'mouse'; if (id === movePtr || id === 'mouse') { input.mx = p.clientX; input.my = p.clientY; input.has = true; } }
  }
  function onUp(e) {
    const p = e.changedTouches ? e.changedTouches[0] : e; const id = e.changedTouches ? p.identifier : 'mouse';
    if (e.button === 2) { input.dashMouse = false; return; }
    const rec = pointers.get(id); if (rec && rec.dash) input.dashBtn = false;
    pointers.delete(id); if (id === movePtr) { movePtr = null; if (!e.changedTouches) input.has = true; }
    // якщо більше немає рухомих дотиків — зупиняємось на місці (тільки тач)
    if (e.changedTouches && pointers.size === 0) input.has = false;
  }
  function pickDifficultyAndStart() { S.diff = diffKeys[S.diffPick]; DIFF = DIFFICULTIES[S.diff]; startGame(); }

  window.addEventListener('mousemove', onMove);
  window.addEventListener('mousedown', onDown);
  window.addEventListener('mouseup', onUp);
  window.addEventListener('touchstart', onDown, { passive: false });
  window.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('touchend', onUp, { passive: false });
  window.addEventListener('touchcancel', onUp, { passive: false });
  window.addEventListener('contextmenu', (e) => e.preventDefault());

  window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase(); input.keys[key] = true;
    if (key === 'shift') input.dashKey = true;
    if (key === ' ' || key === 'enter') {
      if (S.mode === 'title') S.mode = 'difficulty';
      else if (S.mode === 'difficulty') pickDifficultyAndStart();
      else if (S.mode === 'comic') Comics.skip();
      else if (S.mode === 'win') { S.mode = 'title'; titleProps = []; }
      e.preventDefault();
    }
    if (S.mode === 'difficulty') { if (key === 'arrowleft' || key === 'a') S.diffPick = (S.diffPick + 2) % 3; if (key === 'arrowright' || key === 'd') S.diffPick = (S.diffPick + 1) % 3; }
    if (key === 'p' && S.mode === 'play') S.paused = !S.paused;
    if (key === 'm') { S.muted = !S.muted; audioInit(); }
  });
  window.addEventListener('keyup', (e) => { const key = e.key.toLowerCase(); input.keys[key] = false; if (key === 'shift') input.dashKey = false; });

  /* =================================================================== *
   *  Цикл
   * =================================================================== */
  let last = performance.now();
  function loop(now) { let dt = (now - last) / 1000; last = now; dt = Math.min(dt, 0.05); update(dt); render(); requestAnimationFrame(loop); }

  // діагностика для автотестів (на гру не впливає)
  if (typeof window !== 'undefined') {
    window.__nikita = {
      get mode() { return S.mode; }, get level() { return S.levelIndex; }, get score() { return S.score; },
      get nx() { return nikita.x; }, get ny() { return nikita.y; }, get nr() { return nikita.r; }, get stamina() { return nikita.stamina; }, get staminaLock() { return nikita.staminaLock; },
      get bx() { return boss ? boss.x : 0; }, get by() { return boss ? boss.y : 0; }, get br() { return boss ? boss.r : 0; },
      get balive() { return !!(boss && boss.alive); }, get shield() { return !!(boss && boss.shieldUp); },
      get robot() { const r = enemies.find(e => e.guardian && e.hp > 0); return r ? { x: r.x, y: r.y, r: r.r } : null; },
      get food() { let b = null, bd = 1e18; const eatR = nikita.r * EAT_RATIO; for (const p of props) { if (p.r <= eatR && p.r > nikita.r * 0.25) { const dd = dist2(p.x, p.y, nikita.x, nikita.y); if (dd < bd) { bd = dd; b = p; } } } return b ? { x: b.x, y: b.y, r: b.r } : null; },
      setDiff(d) { S.diffPick = diffKeys.indexOf(d); }, get diff() { return S.diff; },
    };
  }

  resize();
  requestAnimationFrame(loop);
})();
