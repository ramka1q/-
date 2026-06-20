/* =========================================================================
 *  game.js  —  рушій гри "Нікіта: Пожирач" (у стилі Tasty Planet).
 *  Стани: title → comic(вступ) → play → comic(перехід) → ... → win.
 * ========================================================================= */

(() => {
  'use strict';

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, DPR = 1;

  /* ---- фото Нікіти (необов'язкове): assets/nikita.png ---- */
  const NIKITA_IMG = new Image();
  NIKITA_IMG.src = 'assets/nikita.png';
  let nikitaPhotoOk = false;
  NIKITA_IMG.onload = () => { nikitaPhotoOk = NIKITA_IMG.naturalWidth > 0; };

  /* ---- константи балансу ---- */
  const EAT_RATIO = 1.05;     // що менше за r*цей_коеф — те їстівне
  const GROW = 0.40;          // частка площі з'їденого, що додається
  const SPEED_K = 7.0;        // швидкість світу пропорційна радіусу
  const RESPAWN_MIN = 60;     // мінімум їстівних об'єктів на полі

  /* ---- стан гри ---- */
  const S = {
    mode: 'title',            // title | comic | play | win
    levelIndex: 0,
    score: 0,
    eaten: 0,
    shake: 0,
    time: 0,
    paused: false,
    muted: false,
    combo: 0, comboTimer: 0,
    flash: 0, flashColor: '#fff',
  };

  /* ---- світ ---- */
  let level = null;
  let props = [];
  let particles = [];
  let projectiles = [];
  let boss = null;
  const nikita = { x: 0, y: 0, r: 10, vx: 0, vy: 0, dir: 0, chomp: 0, wob: 0 };
  const cam = { x: 0, y: 0, zoom: 1 };

  /* ---- ввід ---- */
  const input = { mx: 0, my: 0, has: false, keys: {} };

  /* =================================================================== *
   *  Розмір/полотно
   * =================================================================== */
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener('resize', resize);

  /* =================================================================== *
   *  Звук (маленький WebAudio-синтезатор, без файлів)
   * =================================================================== */
  let AC = null;
  function audioInit() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } }
  function beep(freq, dur, type = 'square', vol = 0.18, slide = 0) {
    if (S.muted || !AC) return;
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, AC.currentTime);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), AC.currentTime + dur);
    g.gain.setValueAtTime(vol, AC.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + dur);
    o.connect(g); g.connect(AC.destination);
    o.start(); o.stop(AC.currentTime + dur);
  }
  function sfxEat() { beep(220 + Math.min(S.combo, 20) * 22, 0.08, 'square', 0.12, 120); }
  function sfxBig() { beep(160, 0.16, 'sawtooth', 0.16, 90); }
  function sfxHurt() { beep(140, 0.2, 'sawtooth', 0.2, -90); }
  function sfxLevel() { [0, 0.1, 0.2].forEach((d, i) => setTimeout(() => beep([330, 415, 523][i], 0.18, 'triangle', 0.18), d * 1000)); }
  function sfxWin() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => beep(f, 0.25, 'triangle', 0.2), i * 140)); }

  /* =================================================================== *
   *  Світ / рівень
   * =================================================================== */
  function buildWorld(i) {
    level = LEVELS[i];
    props = []; particles = []; projectiles = [];
    nikita.x = level.world / 2; nikita.y = level.world / 2;
    nikita.r = level.startR; nikita.vx = nikita.vy = 0; nikita.chomp = 0;
    cam.x = nikita.x; cam.y = nikita.y;

    for (const sp of level.spawns)
      for (let k = 0; k < sp.count; k++) props.push(makeProp(sp.type, rand(sp.rMin, sp.rMax)));

    // бос — у дальньому куті
    boss = {
      x: level.world * 0.8, y: level.world * 0.2,
      r: level.bossR, vx: 0, vy: 0, t: rand(0, 10),
      shootTimer: 1.2, alive: true, key: level.boss, sidekick: level.sidekick || null,
      panic: 0,
    };
  }

  function makeProp(type, r, atEdge = false) {
    let x, y, tries = 0;
    do {
      if (atEdge) {
        // з'являється ближче до краю екрана навколо Нікіти, поза зором
        const a = rand(0, TAU), d = (Math.max(W, H) / cam.zoom) * rand(0.5, 0.7);
        x = clamp(nikita.x + Math.cos(a) * d, r, level.world - r);
        y = clamp(nikita.y + Math.sin(a) * d, r, level.world - r);
      } else {
        x = rand(r, level.world - r); y = rand(r, level.world - r);
      }
      tries++;
    } while (tries < 6 && dist(x, y, nikita.x, nikita.y) < nikita.r * 4 + r);
    return { x, y, r, type, seed: rand(0, 1000), t: rand(0, 10) };
  }

  /* =================================================================== *
   *  Керування потоком гри
   * =================================================================== */
  function startGame() {
    S.score = 0; S.eaten = 0; S.levelIndex = 0;
    playComic(STORY.intro, () => enterLevel(0));
  }
  function enterLevel(i) {
    S.levelIndex = i;
    buildWorld(i);
    S.mode = 'play'; S.paused = false;
    banner(level.name, level.subtitle, level.tips);
    sfxLevel();
  }
  const TRANSITIONS = [STORY.t12, STORY.t23, STORY.t34, STORY.t45, STORY.t56];
  function completeLevel() {
    S.flash = 1; S.flashColor = '#fff'; S.shake = 14; sfxBig();
    const i = S.levelIndex;
    if (i < LEVELS.length - 1) {
      setTimeout(() => playComic(TRANSITIONS[i], () => enterLevel(i + 1)), 700);
    } else {
      sfxWin();
      setTimeout(() => playComic(STORY.ending, () => { S.mode = 'win'; }), 700);
    }
  }
  function playComic(script, done) {
    S.mode = 'comic';
    Comics.play(script, done, nikitaPhotoOk ? NIKITA_IMG : null);
  }

  /* банер на початку рівня */
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
  }

  function updatePlay(dt) {
    nikita.wob += dt;
    nikita.chomp = Math.max(0, nikita.chomp - dt * 3);

    // --- ціль руху ---
    let tx, ty;
    const k = input.keys;
    let kx = (k['d'] || k['arrowright'] ? 1 : 0) - (k['a'] || k['arrowleft'] ? 1 : 0);
    let ky = (k['s'] || k['arrowdown'] ? 1 : 0) - (k['w'] || k['arrowup'] ? 1 : 0);
    if (kx || ky) { tx = nikita.x + kx * 1000; ty = nikita.y + ky * 1000; }
    else if (input.has) { const wp = screenToWorld(input.mx, input.my); tx = wp.x; ty = wp.y; }
    else { tx = nikita.x; ty = nikita.y; }

    const maxSpeed = nikita.r * SPEED_K;
    const dx = tx - nikita.x, dy = ty - nikita.y;
    const d = Math.hypot(dx, dy) || 1;
    const want = Math.min(d, 6) / 6;                  // плавне гальмування біля цілі
    const tvx = (dx / d) * maxSpeed * want;
    const tvy = (dy / d) * maxSpeed * want;
    nikita.vx = damp(nikita.vx, tvx, 0.0008, dt);
    nikita.vy = damp(nikita.vy, tvy, 0.0008, dt);
    nikita.x = clamp(nikita.x + nikita.vx * dt, nikita.r, level.world - nikita.r);
    nikita.y = clamp(nikita.y + nikita.vy * dt, nikita.r, level.world - nikita.r);
    if (Math.hypot(nikita.vx, nikita.vy) > 5) nikita.dir = Math.atan2(nikita.vy, nikita.vx);

    // --- камера (зум залежить від розміру Нікіти) ---
    const baseR = Math.min(W, H) * 0.078;
    const targetZoom = clamp(baseR / nikita.r, 0.045, 4);
    cam.zoom = damp(cam.zoom, targetZoom, 0.002, dt);
    cam.x = damp(cam.x, nikita.x, 0.0001, dt);
    cam.y = damp(cam.y, nikita.y, 0.0001, dt);

    // --- поїдання об'єктів ---
    const eatR = nikita.r * EAT_RATIO;
    for (let i = props.length - 1; i >= 0; i--) {
      const p = props[i];
      const dd = dist(p.x, p.y, nikita.x, nikita.y);
      if (p.r <= eatR) {
        if (dd < nikita.r + p.r * 0.25) { eatProp(p); props.splice(i, 1); }
      } else if (p.r > nikita.r * 1.35 && dd < nikita.r + p.r * 0.8) {
        // надто велике — м'яко відштовхує Нікіту
        const a = angleTo(p.x, p.y, nikita.x, nikita.y);
        const push = (nikita.r + p.r * 0.8 - dd) * 0.5;
        nikita.x += Math.cos(a) * push; nikita.y += Math.sin(a) * push;
      }
      p.t += dt;
    }

    // --- комбо ---
    S.comboTimer -= dt;
    if (S.comboTimer <= 0) S.combo = 0;

    // --- підтримуємо поле заповненим (нескінченний ріст) ---
    let edible = 0;
    for (const p of props) if (p.r <= eatR) edible++;
    if (edible < RESPAWN_MIN && props.length < 360) {
      for (let n = 0; n < 5; n++) {
        const sp = pick(level.spawns);
        const r = clamp(rand(nikita.r * 0.35, nikita.r * 0.92), 4, level.bossR * 0.9);
        props.push(makeProp(sp.type, r, true));
      }
    }

    // --- бос ---
    updateBoss(dt);

    // --- снаряди боса ---
    updateProjectiles(dt);

    // --- частинки ---
    updateParticles(dt);

    if (bannerData) { bannerData.t += dt; if (bannerData.t > 4) bannerData = null; }
  }

  function eatProp(p) {
    nikita.r = radiusFromArea(areaOf(nikita.r) + areaOf(p.r) * GROW);
    nikita.chomp = 1;
    S.eaten++; S.combo++; S.comboTimer = 1.4;
    S.score += Math.ceil(areaOf(p.r) / 60) + S.combo;
    sfxEat();
    burst(p.x, p.y, p.r, 6, 285);
  }

  function updateBoss(dt) {
    if (!boss || !boss.alive) return;
    boss.t += dt;
    const dd = dist(boss.x, boss.y, nikita.x, nikita.y);
    const edibleBoss = nikita.r >= boss.r * 0.95;
    boss.panic = damp(boss.panic, edibleBoss && dd < boss.r * 6 ? 1 : (dd < boss.r * 5 ? 0.5 : 0), 0.01, dt);

    // тікає від Нікіти
    const fleeRange = boss.r * 8;
    let bx = 0, by = 0;
    if (dd < fleeRange) {
      const a = angleTo(nikita.x, nikita.y, boss.x, boss.y);
      bx = Math.cos(a); by = Math.sin(a);
    } else {
      // блукає
      bx = Math.cos(boss.t * 0.4); by = Math.sin(boss.t * 0.5);
    }
    const bspeed = nikita.r * SPEED_K * (edibleBoss ? 0.62 : 0.5);
    boss.x = clamp(boss.x + bx * bspeed * dt, boss.r, level.world - boss.r);
    boss.y = clamp(boss.y + by * bspeed * dt, boss.r, level.world - boss.r);

    // фінальний бос стріляє анти-матерією
    if (level.bossShoots && dd < fleeRange * 1.3) {
      boss.shootTimer -= dt;
      if (boss.shootTimer <= 0) {
        boss.shootTimer = clamp(1.4 - S.levelIndex * 0.05, 0.7, 1.4);
        const a = angleTo(boss.x, boss.y, nikita.x, nikita.y) + rand(-0.15, 0.15);
        const sp = Math.min(W, H) / cam.zoom * 0.9;
        projectiles.push({ x: boss.x, y: boss.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: boss.r * 0.16, life: 4 });
        beep(300, 0.1, 'sawtooth', 0.1, -120);
      }
    }

    // з'їдання боса = перемога рівня
    if (edibleBoss && dd < nikita.r + boss.r * 0.2) {
      boss.alive = false;
      nikita.r = radiusFromArea(areaOf(nikita.r) + areaOf(boss.r) * GROW * 1.4);
      nikita.chomp = 1;
      burst(boss.x, boss.y, boss.r, 28, 50);
      S.score += 500;
      completeLevel();
    }
  }

  function updateProjectiles(dt) {
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const pr = projectiles[i];
      pr.x += pr.vx * dt; pr.y += pr.vy * dt; pr.life -= dt;
      if (dist(pr.x, pr.y, nikita.x, nikita.y) < nikita.r + pr.r) {
        // влучення — Нікіта трохи зменшується
        nikita.r = Math.max(level.startR * 0.8, radiusFromArea(areaOf(nikita.r) * 0.9));
        S.shake = 16; S.flash = 0.7; S.flashColor = '#b06bff';
        sfxHurt(); burst(pr.x, pr.y, pr.r * 2, 12, 280);
        projectiles.splice(i, 1); continue;
      }
      if (pr.life <= 0) projectiles.splice(i, 1);
    }
  }

  /* частинки */
  function burst(x, y, r, n, hue) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU), sp = rand(0.5, 3) * (r + 20);
      particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: rand(0.4, 0.9), max: 0.9, r: rand(r * 0.1, r * 0.3) + 3, hue: hue + rand(-20, 20) });
    }
  }
  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.92; p.vy *= 0.92; p.life -= dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  /* =================================================================== *
   *  Координати
   * =================================================================== */
  function worldToScreen(x, y) {
    return { x: (x - cam.x) * cam.zoom + W / 2, y: (y - cam.y) * cam.zoom + H / 2 };
  }
  function screenToWorld(x, y) {
    return { x: (x - W / 2) / cam.zoom + cam.x, y: (y - H / 2) / cam.zoom + cam.y };
  }

  /* =================================================================== *
   *  Рендер
   * =================================================================== */
  function render() {
    ctx.clearRect(0, 0, W, H);
    if (S.mode === 'title') { drawTitle(); return; }
    if (S.mode === 'comic') { Comics.render(ctx, W, H); return; }
    if (S.mode === 'play' || S.mode === 'win') {
      renderWorld();
      if (S.mode === 'play') { drawHUD(); if (S.paused) drawPause(); if (bannerData) drawBanner(); }
    }
    if (S.mode === 'win') drawWin();

    if (S.flash > 0) {
      ctx.save(); ctx.globalAlpha = S.flash * 0.6;
      ctx.fillStyle = S.flashColor; ctx.fillRect(0, 0, W, H); ctx.restore();
    }
  }

  function renderWorld() {
    ctx.save();
    if (S.shake > 0) ctx.translate(rand(-S.shake, S.shake), rand(-S.shake, S.shake));

    // тло-небо
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, level.sky[0]); g.addColorStop(1, level.sky[1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // світ
    ctx.save();
    ctx.translate(W / 2, H / 2); ctx.scale(cam.zoom, cam.zoom); ctx.translate(-cam.x, -cam.y);

    drawFloor();

    // куля — межі видимого
    const view = { x0: cam.x - W / 2 / cam.zoom, y0: cam.y - H / 2 / cam.zoom, x1: cam.x + W / 2 / cam.zoom, y1: cam.y + H / 2 / cam.zoom };
    const pad = 80 / cam.zoom;

    // об'єкти (великі — позаду)
    const visible = props.filter(p => p.x > view.x0 - p.r - pad && p.x < view.x1 + p.r + pad && p.y > view.y0 - p.r - pad && p.y < view.y1 + p.r + pad);
    visible.sort((a, b) => b.r - a.r);
    const edibleMark = nikita.r * EAT_RATIO;
    for (const p of visible) {
      Art.prop(ctx, p.x, p.y, p.r, p.type, p.seed, p.t);
      // підсвітка щойно їстівного
      if (p.r <= edibleMark && p.r > nikita.r * 0.55) {
        ctx.save(); ctx.globalAlpha = 0.25 + 0.2 * Math.sin(S.time * 6 + p.seed);
        ctx.strokeStyle = '#7CFFB2'; ctx.lineWidth = 2 / cam.zoom;
        Art.circle(ctx, p.x, p.y, p.r * 1.12); ctx.stroke(); ctx.restore();
      }
    }

    // бос
    if (boss && boss.alive) drawBoss();

    // снаряди
    for (const pr of projectiles) drawProjectile(pr);

    // Нікіта
    Art.nikita(ctx, nikita.x, nikita.y, nikita.r, {
      dir: nikita.dir, chomp: nikita.chomp, wobble: nikita.wob,
      img: nikitaPhotoOk ? NIKITA_IMG : null, hue: level.hue,
    });

    // частинки
    for (const p of particles) {
      const a = clamp(p.life / p.max, 0, 1);
      Art.sparkle(ctx, p.x, p.y, p.r, p.hue, a);
    }

    ctx.restore();
    ctx.restore();
  }

  function drawFloor() {
    // підлога рівня
    ctx.fillStyle = level.floor;
    ctx.fillRect(0, 0, level.world, level.world);
    // сітка
    ctx.strokeStyle = level.grid; ctx.lineWidth = 1.5 / cam.zoom;
    const step = level.world / 20;
    ctx.beginPath();
    for (let i = 0; i <= 20; i++) {
      ctx.moveTo(i * step, 0); ctx.lineTo(i * step, level.world);
      ctx.moveTo(0, i * step); ctx.lineTo(level.world, i * step);
    }
    ctx.stroke();
    // рамка світу
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 8 / cam.zoom;
    ctx.strokeRect(0, 0, level.world, level.world);
  }

  function drawBoss() {
    const edible = nikita.r >= boss.r * 0.95;
    // ореол
    ctx.save();
    const pulse = 0.5 + 0.5 * Math.sin(S.time * 4);
    ctx.globalAlpha = (edible ? 0.5 : 0.3) * (0.6 + pulse * 0.4);
    const gg = ctx.createRadialGradient(boss.x, boss.y, boss.r * 0.5, boss.x, boss.y, boss.r * 1.8);
    gg.addColorStop(0, edible ? 'rgba(124,255,178,0.6)' : 'rgba(255,90,120,0.5)');
    gg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gg; Art.circle(ctx, boss.x, boss.y, boss.r * 1.8); ctx.fill();
    ctx.restore();

    const st = { t: boss.t, panic: boss.panic, facing: 1 };
    // няня поруч (рівень 5)
    if (boss.sidekick) {
      Art.character(ctx, boss.sidekick, boss.x - boss.r * 0.9, boss.y + boss.r * 0.1, boss.r * 0.8, { t: boss.t + 1, panic: boss.panic });
    }
    Art.character(ctx, boss.key, boss.x, boss.y, boss.r, st);

    // мітка боса + ім'я
    const nm = (boss.sidekick ? Art.CHARS[boss.key].name + ' & ' + Art.CHARS[boss.sidekick].name : Art.CHARS[boss.key].name).toUpperCase();
    ctx.save();
    ctx.font = `800 ${Math.round(boss.r * 0.3)}px Montserrat, Arial`;
    ctx.textAlign = 'center';
    ctx.lineWidth = boss.r * 0.06; ctx.strokeStyle = '#000';
    ctx.strokeText(nm, boss.x, boss.y - boss.r * 1.6);
    ctx.fillStyle = edible ? '#7CFFB2' : '#ffd84d';
    ctx.fillText(nm, boss.x, boss.y - boss.r * 1.6);
    ctx.font = `700 ${Math.round(boss.r * 0.18)}px Montserrat, Arial`;
    ctx.fillStyle = '#fff';
    ctx.fillText(edible ? '★ БОС — ЇЖ ЙОГО! ★' : 'замалий... рости ще!', boss.x, boss.y - boss.r * 1.35);
    ctx.restore();
  }

  function drawProjectile(pr) {
    ctx.save();
    const gg = ctx.createRadialGradient(pr.x, pr.y, 1, pr.x, pr.y, pr.r * 2.2);
    gg.addColorStop(0, '#fff'); gg.addColorStop(0.4, '#b06bff'); gg.addColorStop(1, 'rgba(120,40,200,0)');
    ctx.fillStyle = gg; Art.circle(ctx, pr.x, pr.y, pr.r * 2.2); ctx.fill();
    ctx.fillStyle = '#2a0a40'; Art.circle(ctx, pr.x, pr.y, pr.r); ctx.fill();
    ctx.restore();
  }

  /* =================================================================== *
   *  HUD / екрани
   * =================================================================== */
  function drawHUD() {
    // прогрес розміру
    const prog = clamp(invLerp(level.startR, level.bossR, nikita.r), 0, 1);
    const bx = 24, by = 22, bw = Math.min(420, W * 0.42), bh = 16;
    ctx.save();
    ctx.font = '800 16px Montserrat, Arial';
    ctx.fillStyle = '#fff'; ctx.textAlign = 'left';
    ctx.fillText(level.name, bx, by - 6);
    // фон смуги
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; Art.roundRect(ctx, bx, by, bw, bh, 8); ctx.fill();
    // заповнення
    const grd = ctx.createLinearGradient(bx, 0, bx + bw, 0);
    grd.addColorStop(0, '#7CFFB2'); grd.addColorStop(1, '#9b5de5');
    ctx.fillStyle = grd; Art.roundRect(ctx, bx, by, Math.max(8, bw * prog), bh, 8); ctx.fill();
    // позначка боса
    ctx.fillStyle = '#ffd84d'; ctx.font = '700 12px Montserrat, Arial';
    ctx.textAlign = 'right';
    ctx.fillText('🎯 ' + Art.CHARS[level.boss].name, bx + bw, by - 6);
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = '600 12px Montserrat, Arial';
    ctx.fillText('розмір ' + Math.round(prog * 100) + '%', bx + 6, by + bh - 3);

    // рахунок + комбо
    ctx.textAlign = 'right';
    ctx.font = '800 20px Montserrat, Arial'; ctx.fillStyle = '#fff';
    ctx.fillText('🍴 ' + S.score, W - 24, 34);
    if (S.combo > 2) {
      ctx.fillStyle = '#ffd84d'; ctx.font = '800 16px Montserrat, Arial';
      ctx.fillText('КОМБО x' + S.combo, W - 24, 56);
    }

    // підказки керування
    ctx.textAlign = 'right'; ctx.font = '600 12px Montserrat, Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillText('миша / WASD — рух    P — пауза    M — звук' + (S.muted ? ' 🔇' : ' 🔊'), W - 24, H - 18);
    ctx.restore();
  }

  function drawBanner() {
    const a = bannerData.t < 0.5 ? Ease.outCubic(bannerData.t / 0.5)
            : bannerData.t > 3.3 ? 1 - Ease.inOutQuad((bannerData.t - 3.3) / 0.7) : 1;
    ctx.save();
    ctx.globalAlpha = clamp(a, 0, 1);
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; Art.roundRect(ctx, W / 2 - 320, H * 0.16, 640, 96, 14); ctx.fill();
    ctx.fillStyle = '#ffd84d'; ctx.font = '900 30px Montserrat, Arial';
    ctx.fillText(bannerData.title, W / 2, H * 0.16 + 38);
    ctx.fillStyle = '#fff'; ctx.font = '600 17px Montserrat, Arial';
    ctx.fillText(bannerData.sub, W / 2, H * 0.16 + 66);
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.font = '500 13px Montserrat, Arial';
    ctx.fillText(bannerData.tip, W / 2, H * 0.16 + 88);
    ctx.restore();
  }

  function drawPause() {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = '900 48px Montserrat, Arial';
    ctx.fillText('ПАУЗА', W / 2, H / 2 - 10);
    ctx.font = '600 18px Montserrat, Arial'; ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText('натисни P, щоб продовжити', W / 2, H / 2 + 26);
    ctx.restore();
  }

  /* титульний екран */
  let titleProps = [];
  function ensureTitleProps() {
    if (titleProps.length) return;
    const types = ['microbe', 'pill', 'mug', 'car', 'tree', 'book', 'atom', 'star'];
    for (let i = 0; i < 16; i++)
      titleProps.push({ x: rand(0, 1), y: rand(0, 1), r: rand(14, 30), type: pick(types), seed: rand(0, 1000), vx: rand(-0.02, 0.02), vy: rand(-0.02, 0.02), t: rand(0, 10) });
  }
  function drawTitle() {
    ensureTitleProps();
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#2a1245'); g.addColorStop(1, '#0a0414');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // плаваючі об'єкти
    for (const p of titleProps) {
      p.x += p.vx * 0.01; p.y += p.vy * 0.01; p.t += 0.016;
      if (p.x < -0.05) p.x = 1.05; if (p.x > 1.05) p.x = -0.05;
      if (p.y < -0.05) p.y = 1.05; if (p.y > 1.05) p.y = -0.05;
      ctx.globalAlpha = 0.5;
      Art.prop(ctx, p.x * W, p.y * H, p.r, p.type, p.seed, p.t);
      ctx.globalAlpha = 1;
    }

    // Нікіта в центрі, що жує
    const t = S.time;
    const r = Math.min(W, H) * 0.13;
    Art.nikita(ctx, W / 2, H * 0.44, r, { dir: Math.sin(t) * 0.5, chomp: 0.5 + 0.5 * Math.sin(t * 4), wobble: t * 1.4, img: nikitaPhotoOk ? NIKITA_IMG : null, hue: 285 });

    // заголовок
    ctx.textAlign = 'center';
    ctx.save();
    ctx.translate(W / 2, H * 0.18);
    const bob = Math.sin(t * 2) * 4;
    ctx.font = `900 ${Math.round(Math.min(W * 0.12, 96))}px Montserrat, Arial Black, Arial`;
    ctx.lineJoin = 'round'; ctx.lineWidth = 14; ctx.strokeStyle = '#160a26';
    ctx.strokeText('НІКІТА', 0, bob);
    const tg = ctx.createLinearGradient(0, -40, 0, 40);
    tg.addColorStop(0, '#c79bff'); tg.addColorStop(1, '#7b3fd0');
    ctx.fillStyle = tg; ctx.fillText('НІКІТА', 0, bob);
    ctx.font = `800 ${Math.round(Math.min(W * 0.05, 38))}px Montserrat, Arial`;
    ctx.lineWidth = 8; ctx.strokeStyle = '#160a26';
    ctx.strokeText('ПОЖИРАЧ ПЛАНЕТИ', 0, 52 + bob);
    ctx.fillStyle = '#ffd84d'; ctx.fillText('ПОЖИРАЧ ПЛАНЕТИ', 0, 52 + bob);
    ctx.restore();

    // підказка "почати"
    const blink = 0.55 + 0.45 * Math.sin(t * 3);
    ctx.globalAlpha = blink;
    ctx.fillStyle = '#fff'; ctx.font = '800 24px Montserrat, Arial';
    ctx.fillText('▶ КЛІК або ПРОБІЛ — почати', W / 2, H * 0.74);
    ctx.globalAlpha = 1;

    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '500 15px Montserrat, Arial';
    ctx.fillText('Їж усе, рости й проковтни вчених: Єгор · Даня · Пилипюк · Діма · Кирило (з нянею Наташею)', W / 2, H * 0.80);
    ctx.fillText('Фінальний бос — геній Молгелевич', W / 2, H * 0.835);
    ctx.fillStyle = nikitaPhotoOk ? 'rgba(124,255,178,0.8)' : 'rgba(255,255,255,0.45)';
    ctx.font = '500 13px Montserrat, Arial';
    ctx.fillText(nikitaPhotoOk ? '✓ фото Нікіти завантажено (assets/nikita.png)' : 'підказка: поклади фото у assets/nikita.png — і це стане обличчям Нікіти', W / 2, H * 0.88);
  }

  function drawWin() {
    ctx.save();
    ctx.fillStyle = 'rgba(8,2,20,0.6)'; ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    const t = S.time;
    ctx.font = `900 ${Math.round(Math.min(W * 0.12, 92))}px Montserrat, Arial Black, Arial`;
    ctx.lineJoin = 'round'; ctx.lineWidth = 14; ctx.strokeStyle = '#160a26';
    ctx.strokeText('ПЕРЕМОГА!', W / 2, H * 0.34 + Math.sin(t * 2) * 5);
    const tg = ctx.createLinearGradient(0, H * 0.28, 0, H * 0.4);
    tg.addColorStop(0, '#7CFFB2'); tg.addColorStop(1, '#2bd17a');
    ctx.fillStyle = tg; ctx.fillText('ПЕРЕМОГА!', W / 2, H * 0.34 + Math.sin(t * 2) * 5);

    ctx.font = '700 22px Montserrat, Arial'; ctx.fillStyle = '#fff';
    ctx.fillText('Нікіта зжер усіх учених та цілий Всесвіт.', W / 2, H * 0.46);
    ctx.fillText('Рахунок: ' + S.score + '   ·   З\'їдено об\'єктів: ' + S.eaten, W / 2, H * 0.52);

    const blink = 0.55 + 0.45 * Math.sin(t * 3);
    ctx.globalAlpha = blink;
    ctx.fillStyle = '#ffd84d'; ctx.font = '800 24px Montserrat, Arial';
    ctx.fillText('▶ КЛІК — зіграти ще раз', W / 2, H * 0.64);
    ctx.restore();
  }

  /* =================================================================== *
   *  Ввід
   * =================================================================== */
  function onPointerMove(e) {
    const t = e.touches ? e.touches[0] : e;
    input.mx = t.clientX; input.my = t.clientY; input.has = true;
  }
  function onPointerDown(e) {
    audioInit();
    if (e.cancelable) e.preventDefault();
    const t = e.touches ? e.touches[0] : e;
    if (t) { input.mx = t.clientX; input.my = t.clientY; input.has = true; }
    if (S.mode === 'title') startGame();
    else if (S.mode === 'comic') Comics.skip();
    else if (S.mode === 'win') { S.mode = 'title'; titleProps = []; }
  }
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('touchmove', onPointerMove, { passive: true });
  window.addEventListener('mousedown', onPointerDown);
  window.addEventListener('touchstart', onPointerDown, { passive: false });

  window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    input.keys[key] = true;
    if (key === ' ' || key === 'enter') {
      if (S.mode === 'title') startGame();
      else if (S.mode === 'comic') Comics.skip();
      else if (S.mode === 'win') { S.mode = 'title'; titleProps = []; }
      e.preventDefault();
    }
    if (key === 'p' && S.mode === 'play') S.paused = !S.paused;
    if (key === 'm') { S.muted = !S.muted; audioInit(); }
  });
  window.addEventListener('keyup', (e) => { input.keys[e.key.toLowerCase()] = false; });

  /* =================================================================== *
   *  Головний цикл
   * =================================================================== */
  let last = performance.now();
  function loop(now) {
    let dt = (now - last) / 1000; last = now;
    dt = Math.min(dt, 0.05);
    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  // невеликий діагностичний доступ (використовується автотестами); на гру не впливає
  if (typeof window !== 'undefined') {
    window.__nikita = {
      get mode() { return S.mode; }, get score() { return S.score; }, get level() { return S.levelIndex; },
      get nx() { return nikita.x; }, get ny() { return nikita.y; }, get nr() { return nikita.r; },
      get bx() { return boss ? boss.x : 0; }, get by() { return boss ? boss.y : 0; },
      get balive() { return !!(boss && boss.alive); }, get bossR() { return boss ? boss.r : 0; },
    };
  }

  resize();
  requestAnimationFrame(loop);
})();
