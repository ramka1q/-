/* =========================================================================
 *  comics.js  —  рушій анімованих коміксів між рівнями.
 *  Кожна сцена ("beat") — це повноекранна панель у стилі коміксу:
 *  персонажі виїжджають із анімацією, репліки друкуються по літері,
 *  звукові слова (ХРУМ! БУМ!) вилітають, є струси та спалахи.
 * ========================================================================= */

const Comics = (() => {

  let beats = [];          // масив сцен поточного коміксу
  let idx = 0;             // індекс активної сцени
  let bt = 0;              // час у поточній сцені
  let turning = 0;         // прогрес "перегортання сторінки" 0..1
  let active = false;
  let onDone = null;
  let nikitaImg = null;

  function play(script, done, img) {
    beats = script; idx = 0; bt = 0; turning = 0; active = true; onDone = done; nikitaImg = img || null;
  }
  function isActive() { return active; }

  function skip() {
    if (!active) return;
    if (turning > 0) return;
    if (idx >= beats.length - 1) { finish(); }
    else { turning = 0.0001; }   // запускаємо перехід
  }
  function finish() { active = false; const d = onDone; onDone = null; if (d) d(); }

  function update(dt) {
    if (!active) return;
    if (turning > 0) {
      turning += dt / 0.45;
      if (turning >= 1) { turning = 0; idx++; bt = 0; if (idx >= beats.length) finish(); }
      return;
    }
    bt += dt;
    const beat = beats[idx];
    if (beat && bt >= (beat.dur || 4)) {
      if (idx >= beats.length - 1) finish();
      else turning = 0.0001;
    }
  }

  /* ----------------------------- РЕНДЕР ------------------------------- */
  function render(ctx, w, h) {
    if (!active) return;
    const beat = beats[idx];
    if (!beat) return;

    // невеликий «вступ» сцени для плавної появи
    const appear = Ease.outCubic(clamp(bt / 0.4, 0, 1));

    ctx.save();

    // ефект перегортання сторінки (горизонтальний зсув)
    if (turning > 0) {
      const e = Ease.inOutCubic(turning);
      ctx.translate(-w * e, 0);
      drawBeat(ctx, w, h, beats[idx], 1, 1);             // стара сторінка їде вліво
      ctx.translate(w, 0);
      const nb = beats[idx + 1];
      if (nb) drawBeat(ctx, w, h, nb, 0.0001, 1);        // нова заїжджає
      ctx.restore();
      drawPageEdge(ctx, w, h, e);
      return;
    }

    drawBeat(ctx, w, h, beat, bt, appear);
    ctx.restore();

    drawChrome(ctx, w, h);
  }

  function drawPageEdge(ctx, w, h, e) {
    ctx.save();
    const x = w * (1 - e);
    const g = ctx.createLinearGradient(x - 40, 0, x + 10, 0);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = g; ctx.fillRect(x - 40, 0, 50, h);
    ctx.restore();
  }

  function drawBeat(ctx, w, h, beat, localT, appear) {
    ctx.save();

    // --- ефекти екрану ---
    let shake = 0;
    if (beat.fx && beat.fx.includes('shake')) shake = Math.max(0, 1 - localT) * 14 + (beat.shakeHold ? 4 : 0);
    if (beat.shakeAt != null && Math.abs(localT - beat.shakeAt) < 0.25) shake = 12;
    if (shake) ctx.translate(rand(-shake, shake), rand(-shake, shake));

    // --- фон коміксу ---
    const sky = beat.bg || ['#2a3550', '#0c1020'];
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, sky[0]); g.addColorStop(1, sky[1]);
    ctx.fillStyle = g; ctx.fillRect(-40, -40, w + 80, h + 80);

    halftone(ctx, w, h, beat.dots || 'rgba(255,255,255,0.05)');
    if (beat.rays) speedRays(ctx, w / 2, h * 0.45, w, localT);

    // --- кастомний фон ---
    if (beat.scene) { ctx.save(); beat.scene(ctx, w, h, localT); ctx.restore(); }

    // --- актори ---
    if (beat.actors) {
      // сортуємо за y, щоб ближчі були спереду
      const arr = beat.actors.slice().sort((a, b) => (a.y || 0) - (b.y || 0));
      for (const a of arr) drawActor(ctx, w, h, a, localT);
    }

    // спалах
    if (beat.flashAt != null) {
      const fa = clamp(1 - Math.abs(localT - beat.flashAt) / 0.18, 0, 1);
      if (fa > 0) { ctx.fillStyle = `rgba(255,255,255,${fa * 0.8})`; ctx.fillRect(-40, -40, w + 80, h + 80); }
    }

    // --- звукові слова ---
    if (beat.sfx) for (const s of beat.sfx) drawSfx(ctx, w, h, s, localT);

    // --- репліки ---
    if (beat.bubbles) for (const b of beat.bubbles) drawBubble(ctx, w, h, b, localT);

    // --- підпис-каптіон (жовта плашка зверху) ---
    if (beat.caption) drawCaption(ctx, w, h, beat.caption, appear);

    // рамка панелі
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = '#0a0a12'; ctx.lineWidth = 10;
    ctx.strokeRect(8, 8, w - 16, h - 16);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
    ctx.strokeRect(8, 8, w - 16, h - 16);
    ctx.restore();
  }

  /* ----- актор у коміксі (персонаж із анімацією появи) ----- */
  function drawActor(ctx, w, h, a, localT) {
    const t0 = localT - (a.delay || 0);
    if (t0 < 0) return;
    const x = (a.x ?? 0.5) * w, y = (a.y ?? 0.6) * h;
    const r = (a.r ?? 0.16) * h;
    let dx = 0, dy = 0, sc = 1, al = 1;
    const e = clamp(t0 / (a.enterDur || 0.6), 0, 1);
    switch (a.enter) {
      case 'left': dx = -(1 - Ease.outBack(e)) * w * 0.7; break;
      case 'right': dx = (1 - Ease.outBack(e)) * w * 0.7; break;
      case 'rise': dy = (1 - Ease.outBack(e)) * h * 0.6; break;
      case 'drop': dy = -(1 - Ease.outBounce(e)) * h * 0.6; break;
      case 'pop': sc = Ease.outElastic(e); break;
      case 'fade': al = e; break;
      default: al = e;
    }
    // легке «дихання»
    const breathe = 1 + Math.sin(localT * 3 + (a.ph || 0)) * 0.01;
    ctx.save();
    ctx.globalAlpha = al;
    ctx.translate(x + dx, y + dy);
    if (a.flip) ctx.scale(-1, 1);
    ctx.scale(sc * (a.scale || 1) * breathe, sc * (a.scale || 1) * breathe);
    const st = { t: localT + (a.ph || 0), panic: a.panic || 0, facing: a.facing || 1 };
    if (a.char === 'nikita') {
      Art.nikita(ctx, 0, 0, r, { wobble: localT * 1.5, chomp: a.chomp ?? (0.5 + 0.5 * Math.sin(localT * 6)), dir: 0, img: nikitaImg, hue: a.hue || 285 });
    } else {
      Art.character(ctx, a.char, 0, 0, r, st);
    }
    ctx.restore();

    // ім'я під персонажем
    if (a.label && e > 0.6) {
      ctx.save();
      ctx.globalAlpha = clamp((e - 0.6) / 0.4, 0, 1);
      ctx.font = `700 ${Math.round(h * 0.03)}px Montserrat, Arial`;
      ctx.textAlign = 'center';
      const name = a.char === 'nikita' ? 'НІКІТА' : (Art.CHARS[a.char] ? Art.CHARS[a.char].name.toUpperCase() : a.label);
      const tw = ctx.measureText(name).width;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      Art.roundRect(ctx, x - tw / 2 - 10, y + r * 1.05, tw + 20, h * 0.045, 6); ctx.fill();
      ctx.fillStyle = '#ffd84d';
      ctx.fillText(name, x, y + r * 1.05 + h * 0.034);
      ctx.restore();
    }
  }

  /* ----- мовна бульбашка з друкованим текстом ----- */
  function drawBubble(ctx, w, h, b, localT) {
    const t0 = localT - (b.delay || 0);
    if (t0 < 0) return;
    const pop = Ease.outBack(clamp(t0 / 0.28, 0, 1));
    const cx = (b.x ?? 0.5) * w, cy = (b.y ?? 0.2) * h;
    const fs = Math.round(h * (b.size || 0.032));
    ctx.save();
    ctx.font = `700 ${fs}px Montserrat, Arial`;
    const maxW = (b.w || 0.34) * w;
    const lines = wrap(ctx, b.text, maxW - fs);
    const lineH = fs * 1.25;
    const bw = Math.min(maxW, Math.max(...lines.map(l => ctx.measureText(l).width)) + fs);
    const bh = lines.length * lineH + fs * 0.8;

    ctx.translate(cx, cy);
    ctx.scale(pop, pop);

    const think = b.think;
    const fill = b.who === 'nikita' ? '#3a1b46' : (b.fill || '#ffffff');
    const ink = b.who === 'nikita' ? '#ffe6ff' : (b.ink || '#161620');

    // хвіст
    if (b.from) {
      const fx = (b.from.x - (b.x ?? 0.5)) * w, fy = (b.from.y - (b.y ?? 0.2)) * h;
      if (!think) {
        ctx.fillStyle = fill;
        ctx.strokeStyle = '#161620'; ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-bw * 0.08, bh * 0.4);
        ctx.lineTo(bw * 0.08, bh * 0.4);
        ctx.lineTo(fx * 0.5, fy * 0.5);
        ctx.closePath(); ctx.fill(); ctx.stroke();
      } else {
        ctx.fillStyle = fill;
        for (let i = 1; i <= 3; i++) { Art.circle(ctx, fx * 0.18 * i, fy * 0.18 * i, 8 - i * 1.6); ctx.fill(); }
      }
    }

    // тіло бульбашки
    ctx.fillStyle = fill;
    ctx.strokeStyle = b.who === 'nikita' ? '#a13bd0' : '#161620';
    ctx.lineWidth = 4;
    if (b.shout) {
      // вибухова бульбашка-крик
      ctx.beginPath();
      const pts = 18;
      for (let i = 0; i <= pts; i++) {
        const a = (i / pts) * TAU;
        const rr = (i % 2 ? 0.78 : 1.0);
        ctx.lineTo(Math.cos(a) * bw * 0.62 * rr, Math.sin(a) * bh * 0.7 * rr);
      }
      ctx.closePath();
    } else {
      Art.roundRect(ctx, -bw / 2, -bh / 2, bw, bh, fs * 0.6);
    }
    ctx.fill(); ctx.stroke();

    // текст (друкарська машинка)
    const total = b.text.length;
    const shown = Math.min(total, Math.floor(t0 / (b.speed || 0.028)));
    ctx.fillStyle = ink;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let count = 0;
    const startY = -bh / 2 + fs * 0.7 + lineH * 0.2;
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      // обрізаємо за лічильником друку
      if (count + line.length > shown) line = line.slice(0, Math.max(0, shown - count));
      count += lines[i].length + 1;
      ctx.fillText(line, 0, startY + i * lineH + (lines.length * lineH) / 2 - lineH / 2 - (lines.length - 1) * lineH / 2);
    }
    ctx.restore();
  }

  /* ----- велике звукове слово ----- */
  function drawSfx(ctx, w, h, s, localT) {
    const t0 = localT - (s.at || 0);
    if (t0 < 0 || t0 > (s.life || 1.4)) return;
    const e = clamp(t0 / 0.25, 0, 1);
    const sc = Ease.outBack(e) * (1 + t0 * 0.12);
    const al = clamp(1 - (t0 - (s.life || 1.4) + 0.4) / 0.4, 0, 1);
    ctx.save();
    ctx.globalAlpha = al;
    ctx.translate((s.x ?? 0.5) * w, (s.y ?? 0.3) * h);
    ctx.rotate((s.rot || -0.12));
    ctx.scale(sc, sc);
    const fs = Math.round(h * (s.size || 0.1));
    ctx.font = `900 ${fs}px Montserrat, Arial Black, Arial`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = fs * 0.16; ctx.strokeStyle = '#161620'; ctx.strokeText(s.text, 0, 0);
    ctx.fillStyle = s.color || '#ffd84d'; ctx.fillText(s.text, 0, 0);
    ctx.lineWidth = fs * 0.03; ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.strokeText(s.text, 0, 0);
    ctx.restore();
  }

  /* ----- жовта плашка-каптіон ----- */
  function drawCaption(ctx, w, h, text, appear) {
    ctx.save();
    const fs = Math.round(h * 0.034);
    ctx.font = `800 ${fs}px Montserrat, Arial`;
    const lines = wrap(ctx, text, w * 0.8);
    const lineH = fs * 1.3;
    const bw = Math.max(...lines.map(l => ctx.measureText(l).width)) + fs * 1.2;
    const bh = lines.length * lineH + fs * 0.5;
    const y = 26 - (1 - appear) * 60;
    ctx.globalAlpha = appear;
    ctx.translate((w - bw) / 2, y);
    ctx.fillStyle = '#161620'; Art.roundRect(ctx, -4, -4, bw + 8, bh + 8, 6); ctx.fill();
    ctx.fillStyle = '#ffe27a'; Art.roundRect(ctx, 0, 0, bw, bh, 5); ctx.fill();
    ctx.fillStyle = '#161620'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let i = 0; i < lines.length; i++) ctx.fillText(lines[i], bw / 2, fs * 0.55 + i * lineH + lineH / 2);
    ctx.restore();
  }

  /* ----- елементи інтерфейсу коміксу ----- */
  function drawChrome(ctx, w, h) {
    // індикатор сторінок
    ctx.save();
    const n = beats.length;
    const r = 5, gap = 16;
    const totalW = (n - 1) * gap;
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = i === idx ? '#ffd84d' : 'rgba(255,255,255,0.35)';
      Art.circle(ctx, w / 2 - totalW / 2 + i * gap, h - 26, i === idx ? r + 1 : r); ctx.fill();
    }
    // підказка
    ctx.font = `600 ${Math.round(h * 0.022)}px Montserrat, Arial`;
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.textAlign = 'right';
    const blink = 0.5 + 0.5 * Math.sin(performance.now() / 300);
    ctx.globalAlpha = 0.5 + blink * 0.5;
    ctx.fillText('▶ КЛІК / ПРОБІЛ — далі', w - 24, h - 20);
    ctx.restore();
  }

  /* ------------------------- помічники ------------------------------- */
  function halftone(ctx, w, h, color) {
    ctx.save();
    ctx.fillStyle = color;
    const step = 26;
    for (let y = 0; y < h; y += step)
      for (let x = (y % (step * 2)) ? step / 2 : 0; x < w; x += step) {
        Art.circle(ctx, x, y, 3.2); ctx.fill();
      }
    ctx.restore();
  }
  function speedRays(ctx, cx, cy, R, t) {
    ctx.save();
    ctx.globalAlpha = 0.10;
    ctx.fillStyle = '#fff';
    const n = 26;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + t * 0.2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a - 0.04) * R, cy + Math.sin(a - 0.04) * R);
      ctx.lineTo(cx + Math.cos(a + 0.04) * R, cy + Math.sin(a + 0.04) * R);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  function wrap(ctx, text, maxW) {
    const words = text.split(' ');
    const lines = []; let cur = '';
    for (const word of words) {
      const test = cur ? cur + ' ' + word : word;
      if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = word; }
      else cur = test;
    }
    if (cur) lines.push(cur);
    return lines;
  }

  return { play, update, render, skip, isActive };
})();
