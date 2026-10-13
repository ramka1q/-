'use strict';
// ============================================================
//  HUD: размер, таймер, цели, рация учёных, мини-карта, тосты
// ============================================================
const FONT = 'Rubik, "Trebuchet MS", "Segoe UI", sans-serif';
const HUD = {
  text(ctx, s, x, y, size, col = '#fff', align = 'left', stroke = OL, weight = 900, base = 'alphabetic') {
    ctx.font = `${weight} ${size}px ${FONT}`;
    ctx.textAlign = align; ctx.textBaseline = base;
    if (stroke) { ctx.lineWidth = Math.max(2, size * 0.18); ctx.strokeStyle = stroke; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); }
    ctx.fillStyle = col; ctx.fillText(s, x, y);
  },
  panel(ctx, x, y, w, h, r = 12, col = 'rgba(20,18,40,0.72)') { rect(ctx, x, y, w, h, r, col, 'rgba(255,255,255,0.18)', 2); },

  draw(ctx, L, sw, sh, t, input) {
    const sc = U.clamp(Math.min(sw, sh) / 800, 0.7, 1.4);
    const P = L.P;
    ctx.save();
    // --- шкала размера ---
    const narrow = sw < 720;
    const bw = narrow ? sw - 60 * sc : Math.min(sw * 0.42, 520 * sc), bh = 18 * sc, bx = sw / 2 - bw / 2, by = 16 * sc;
    this.panel(ctx, bx - 14 * sc, by - 8 * sc, bw + 28 * sc, bh + 34 * sc, 14 * sc);
    const goal = L.def.goal.r, start = L.def.start.r;
    const k = U.clamp(Math.log(P.r / start) / Math.log(goal / start), 0, 1);
    rect(ctx, bx, by, bw, bh, bh / 2, '#2b2550', null);
    if (k > 0) { rect(ctx, bx, by, Math.max(bh, bw * k), bh, bh / 2, lg(ctx, bx, 0, bx + bw, 0, ['#9b5cff', '#ff6bd6', '#ffd43b']), null); }
    rect(ctx, bx, by, bw, bh, bh / 2, null, OL, 2.5);
    // засечки целей по пути
    for (const m of (L.def.milestones || [])) { const mk = Math.log(m.r / start) / Math.log(goal / start); if (mk > 0 && mk < 1) line(ctx, bx + bw * mk, by + 3, bx + bw * mk, by + bh - 3, 'rgba(255,255,255,0.5)', 2); }
    Chars.face(ctx, bx + bw * k, by + bh / 2, bh * 0.95, 'happy', t);
    this.text(ctx, L.sizeText(P.r), bx, by + bh + 17 * sc, 14 * sc, '#fff', 'left');
    this.text(ctx, '🏁 ' + L.sizeText(goal), bx + bw, by + bh + 17 * sc, 14 * sc, '#ffd43b', 'right');
    this.text(ctx, L.def.name, sw / 2, by + bh + 17 * sc, 13 * sc, '#b8b5ff', 'center', OL, 700);
    // --- таймер / очки ---
    const rx = sw - 16 * sc;
    ctx.save(); if (narrow) ctx.translate(0, by + bh + 32 * sc);
    this.panel(ctx, rx - 170 * sc, 10 * sc, 170 * sc, 68 * sc, 14 * sc);
    const m = L.def.medals || [120, 240];
    const medal = L.time <= m[0] ? 0 : L.time <= m[1] ? 1 : 2;
    const mcol = ['#ffd43b', '#dee2e6', '#e8a35a'][medal];
    circ(ctx, rx - 150 * sc, 31 * sc, 10 * sc, mcol, OL, 2);
    this.text(ctx, U.formatTime(L.time), rx - 134 * sc, 38 * sc, 20 * sc, '#fff', 'left');
    this.text(ctx, '★ ' + L.score.toLocaleString('ru-RU'), rx - 12 * sc, 38 * sc, 16 * sc, '#ffe066', 'right');
    const next = medal < 2 ? m[medal] - L.time : 0;
    this.text(ctx, medal < 2 ? (medal === 0 ? 'до золота: ' : 'до серебра: ') + Math.ceil(next) + ' с' : 'медаль: бронза', rx - 158 * sc, 62 * sc, 11 * sc, mcol, 'left', OL, 700);
    if (L.combo >= 3) {
      const pulse = 1 + Math.sin(t * 12) * 0.06;
      ctx.save(); ctx.translate(rx - 85 * sc, 92 * sc); ctx.scale(pulse, pulse);
      this.text(ctx, 'КОМБО ×' + L.combo, 0, 0, 18 * sc, L.combo > 10 ? '#ff6bd6' : '#ffd43b', 'center');
      ctx.restore();
    }
    ctx.restore();
    // --- цели ---
    let oy = narrow ? by + bh + 48 * sc : 18 * sc;
    const ox = 14 * sc;
    const objs = L.objectives;
    if (objs.length) {
      ctx.font = `700 ${12.5 * sc}px ${FONT}`;
      const ow = U.clamp(Math.max(...objs.map(o => ctx.measureText((o.text || '') + ' (00/00)').width)) + 50 * sc, Math.min(200 * sc, sw * 0.5), narrow ? sw - 200 * sc : Math.min(380 * sc, sw * 0.3)), oh = (26 + objs.length * 22) * sc;
      this.panel(ctx, ox, oy - 6 * sc, ow, oh, 12 * sc);
      this.text(ctx, 'ЦЕЛИ', ox + 12 * sc, oy + 12 * sc, 12 * sc, '#b8b5ff', 'left', null, 800);
      objs.forEach((o, i) => {
        const y = oy + (32 + i * 22) * sc;
        rect(ctx, ox + 12 * sc, y - 12 * sc, 14 * sc, 14 * sc, 3 * sc, o.done ? '#69db7c' : 'rgba(255,255,255,0.1)', '#fff', 1.5);
        if (o.done) this.text(ctx, '✓', ox + 19 * sc, y, 12 * sc, OL, 'center', null);
        let s = o.text || '';
        if (o.type === 'count') s += ` (${Math.min(o.n, o.target)}/${o.target})`;
        ctx.font = `700 ${12.5 * sc}px ${FONT}`;
        while (ctx.measureText(s).width > ow - 46 * sc && s.length > 4) s = s.slice(0, -2);
        this.text(ctx, s, ox + 32 * sc, y, 12.5 * sc, o.done ? '#8ce99a' : '#fff', 'left', null, 700);
      });
      oy += oh + 6 * sc;
    }
    // ключи
    const keys = Object.keys(L.keys);
    if (keys.length) {
      this.panel(ctx, ox, oy, 26 * sc + keys.length * 34 * sc, 34 * sc, 10 * sc);
      keys.forEach((kk, i) => { ctx.save(); ctx.translate(ox + 28 * sc + i * 34 * sc, oy + 17 * sc); ctx.scale(sc * 0.28, sc * 0.28); S.keycard(ctx, kk); ctx.restore(); });
      oy += 40 * sc;
    }
    // ловля
    if (L.capture > 0.01) {
      const cw = 200 * sc;
      this.panel(ctx, sw / 2 - cw / 2 - 8, by + bh + 32 * sc, cw + 16, 30 * sc, 10);
      rect(ctx, sw / 2 - cw / 2, by + bh + 44 * sc, cw, 10 * sc, 5, '#3b1d1d', null);
      rect(ctx, sw / 2 - cw / 2, by + bh + 44 * sc, cw * U.clamp(L.capture, 0, 1), 10 * sc, 5, Math.sin(t * 10) > 0 ? '#ff4d4d' : '#ff8787', null);
      this.text(ctx, 'УГРОЗА ПОИМКИ', sw / 2, by + bh + 42 * sc, 10 * sc, '#ffa8a8', 'center', null, 800);
    }
    // --- босс ---
    if (L.boss && !L.boss.dead && L.boss.showBar) {
      const B = L.boss;
      const w = Math.min(sw * 0.5, 560 * sc), y = sh - 46 * sc;
      this.panel(ctx, sw / 2 - w / 2 - 12, y - 24 * sc, w + 24, 46 * sc, 12);
      this.text(ctx, B.bossName || 'БОСС', sw / 2, y - 6 * sc, 14 * sc, '#ffa8a8', 'center');
      rect(ctx, sw / 2 - w / 2, y, w, 12 * sc, 6, '#3b1d1d', null);
      rect(ctx, sw / 2 - w / 2, y, w * U.clamp(B.hp / B.maxHp, 0, 1), 12 * sc, 6, lg(ctx, sw / 2 - w / 2, 0, sw / 2 + w / 2, 0, ['#ff4d4d', '#ff922b']), null);
      for (let i = 1; i < B.maxHp; i++) line(ctx, sw / 2 - w / 2 + w * i / B.maxHp, y, sw / 2 - w / 2 + w * i / B.maxHp, y + 12 * sc, OL, 2);
      rect(ctx, sw / 2 - w / 2, y, w, 12 * sc, 6, null, OL, 2);
      if (B.phaseText) this.text(ctx, B.phaseText, sw / 2, y + 30 * sc, 12 * sc, '#fff', 'center', OL, 700);
    }
    // --- бонусы и рывок ---
    const pws = Object.entries(P.pw).filter(([, v]) => v > 0);
    const icons = { speed: 'pw_speed', magnet: 'pw_magnet', shield: 'pw_shield' };
    const total = { speed: 7, magnet: 9, shield: 8 };
    let px = sw / 2 - (pws.length + 1) * 26 * sc;
    const py = sh - (L.boss && L.boss.showBar ? 110 : 44) * sc;
    for (const [kk, v] of pws) {
      circ(ctx, px, py, 21 * sc, 'rgba(20,18,40,0.7)', null);
      ctx.save(); ctx.translate(px, py); ctx.scale(sc * 0.3, sc * 0.3); S[icons[kk]](ctx); ctx.restore();
      ctx.beginPath(); ctx.arc(px, py, 22 * sc, -Math.PI / 2, -Math.PI / 2 + TAU * v / total[kk]); ctx.lineWidth = 4 * sc; ctx.strokeStyle = '#ffd43b'; ctx.stroke();
      px += 52 * sc;
    }
    // рывок
    const dk = U.clamp(1 - P.dashCD / 1.5, 0, 1);
    circ(ctx, px, py, 21 * sc, 'rgba(20,18,40,0.7)', null);
    this.text(ctx, '⚡', px, py + 7 * sc, 20 * sc, dk >= 1 ? '#ffd43b' : '#666', 'center', null);
    ctx.beginPath(); ctx.arc(px, py, 22 * sc, -Math.PI / 2, -Math.PI / 2 + TAU * dk); ctx.lineWidth = 4 * sc; ctx.strokeStyle = dk >= 1 ? '#69db7c' : '#868e96'; ctx.stroke();
    if (sw > 700) this.text(ctx, L.def.pit ? 'ПРЫЖОК' : 'ПРОБЕЛ', px, py + 36 * sc, 9 * sc, L.def.pit ? '#ffd43b' : '#aaa', 'center', null, 700);
    // --- рация ---
    this.drawRadio(ctx, L, sw, sh, t, sc);
    // --- тосты ---
    L.toasts.forEach((ts, i) => {
      const a = Math.min(1, ts.t * 6, (ts.dur - ts.t) * 3);
      const pop = U.ease.outBack(Math.min(1, ts.t * 4));
      ctx.save(); ctx.globalAlpha = a;
      const y = (L.time < 3.2 ? sh * 0.6 : sh * 0.22) + i * 40 * sc;
      ctx.translate(sw / 2, y); ctx.scale(pop, pop);
      ctx.font = `900 ${20 * sc}px ${FONT}`;
      const fit = Math.min(1, (sw - 24) / (ctx.measureText(ts.text).width + 30 * sc));
      ctx.scale(fit, fit);
      const w = ctx.measureText(ts.text).width + 30 * sc;
      rect(ctx, -w / 2, -22 * sc, w, 34 * sc, 17 * sc, 'rgba(20,18,40,0.85)', ts.col, 2.5);
      this.text(ctx, ts.text, 0, 1 * sc, 20 * sc, U.shade(ts.col, 0.55), 'center', null);
      ctx.restore();
    });
    // --- мини-карта ---
    if (input.showMap !== false) this.drawMinimap(ctx, L, sw, sh, t, sc);
    // --- курсор ---
    if (input.mouse && !input.touch && !(input.kx || input.ky)) {
      ctx.save(); ctx.globalAlpha = 0.6;
      circ(ctx, input.mx, input.my, 9, null, '#fff', 2); circ(ctx, input.mx, input.my, 2.5, '#fff', null);
      ctx.restore();
    }
    // --- заставка уровня ---
    if (L.time < 3.2) {
      const a = Math.min(1, L.time * 3, (3.2 - L.time) * 2);
      const k = U.ease.outBack(Math.min(1, L.time * 2.5));
      ctx.save(); ctx.globalAlpha = a; ctx.translate(sw / 2, sh * 0.3); ctx.scale(k * Math.min(1, sw / (560 * sc)), k * Math.min(1, sw / (560 * sc)));
      this.text(ctx, L.def.chapter, 0, -40 * sc, 16 * sc, '#d0bfff', 'center', OL, 800);
      this.text(ctx, L.def.name.toUpperCase(), 0, 8 * sc, 48 * sc, '#fff', 'center');
      if (L.def.mech) { const mk = U.ease.outBack(U.clamp(L.time * 2 - 0.5, 0, 1)); ctx.save(); ctx.translate(0, -78 * sc); ctx.scale(mk, mk); ctx.font = `900 ${18 * sc}px ${FONT}`; const mw = ctx.measureText('МЕХАНИКА: ' + L.def.mech.name).width + 70 * sc; rect(ctx, -mw / 2, -20 * sc, mw, 32 * sc, 16 * sc, '#ffd43b', OL, 3); this.text(ctx, L.def.mech.icon + ' МЕХАНИКА: ' + L.def.mech.name, 0, 3 * sc, 18 * sc, OL, 'center', null); ctx.restore(); }
      ctx.font = `700 ${15 * sc}px ${FONT}`;
      U.wrapText(ctx, L.def.desc, Math.min(sw * 0.8, 620 * sc)).forEach((ln, i) => this.text(ctx, ln, 0, (40 + i * 20) * sc, 15 * sc, '#ffe066', 'center', OL, 700));
      ctx.restore();
    }
    // --- финальные надписи ---
    if (L.won) {
      const k2 = U.ease.outElastic(Math.min(1, L.endT * 1.2));
      ctx.save(); ctx.translate(sw / 2, sh * 0.42); ctx.scale(k2, k2); ctx.rotate(Math.sin(t * 3) * 0.03);
      this.text(ctx, L.def.winText || 'УРОВЕНЬ ПРОЙДЕН!', 0, 0, 54 * sc, '#ffd43b', 'center');
      this.text(ctx, 'Никита: «' + (L.def.burp || 'Ещё хочу!') + '»', 0, 46 * sc, 22 * sc, '#fff', 'center');
      ctx.restore();
      for (let i = 0; i < 3; i++) { if (Math.random() < 0.5) L.part('star', L.cam.x + (Math.random() - 0.5) * L.viewW, L.cam.y - L.viewH * 0.5, (Math.random() - 0.5) * 100 / L.cam.zoom, 250 / L.cam.zoom, 8 / L.cam.zoom, PAL.bright[Math.floor(Math.random() * 7)], 2, { grav: 200 / L.cam.zoom }); }
    }
    if (L.failed) {
      ctx.fillStyle = `rgba(40,0,0,${Math.min(0.55, L.endT)})`; ctx.fillRect(0, 0, sw, sh);
      const k2 = U.ease.outBack(Math.min(1, L.endT * 1.5));
      ctx.save(); ctx.translate(sw / 2, sh * 0.4); ctx.scale(k2, k2);
      this.text(ctx, 'НИКИТУ ПОЙМАЛИ!', 0, 0, 52 * sc, '#ff6b6b', 'center');
      this.text(ctx, 'Учёные посадили его в банку. Но банка тоже съедобная…', 0, 42 * sc, 18 * sc, '#fff', 'center', OL, 700);
      ctx.restore();
    }
    ctx.restore();
  },

  drawRadio(ctx, L, sw, sh, t, sc) {
    const R = L.radioCur;
    if (!R) return;
    const inK = U.ease.outBack(Math.min(1, R.t * 4)), outK = Math.min(1, (R.dur - R.t) * 4);
    const pr = 40 * sc;
    const x = 18 * sc + pr, y = sh - 18 * sc - pr - (sw < 700 ? 40 * sc : 0);
    ctx.save();
    ctx.globalAlpha = outK;
    ctx.translate((1 - inK) * -200 * sc, 0);
    circ(ctx, x, y, pr + 5 * sc, '#1e1b2e', null);
    Chars.portrait(ctx, R.who, x, y, pr, { expr: R.expr, t, talking: R.t < R.text.length * 0.035 + 0.3 });
    const name = CH[R.who] ? CH[R.who].name : R.who;
    // пузырь
    const shown = R.text.slice(0, Math.floor(R.t * 40));
    const bx = x + pr + 14 * sc, maxW = Math.min(sw * 0.5, 420 * sc);
    ctx.font = `700 ${15 * sc}px ${FONT}`;
    const lines = U.wrapText(ctx, R.text, maxW - 24 * sc);
    const bh = (lines.length * 19 + 32) * sc;
    const by = y - bh / 2;
    rect(ctx, bx, by, maxW, bh, 14 * sc, '#fff', OL, 3);
    poly(ctx, [bx + 2, y - 8 * sc, bx - 12 * sc, y, bx + 2, y + 8 * sc], '#fff', null);
    line(ctx, bx, y - 8 * sc, bx - 12 * sc, y, OL, 3); line(ctx, bx - 12 * sc, y, bx, y + 8 * sc, OL, 3);
    this.text(ctx, name.toUpperCase() + ' 📻', bx + 12 * sc, by + 17 * sc, 11 * sc, CH[R.who] ? U.shade(CH[R.who].color, -0.3) : '#555', 'left', null, 900);
    let left = shown.length;
    lines.forEach((ln, i) => {
      const part = ln.slice(0, Math.max(0, left)); left -= ln.length + 1;
      this.text(ctx, part, bx + 12 * sc, by + (36 + i * 19) * sc, 15 * sc, OL, 'left', null, 700);
    });
    if (shown.length < R.text.length && Math.random() < 0.5) Sound.play('type');
    ctx.restore();
  },

  drawMinimap(ctx, L, sw, sh, t, sc) {
    const maxS = (sw < 700 ? 110 : 170) * sc;
    const asp = L.W / L.H;
    const mw = asp >= 1 ? maxS : maxS * asp, mh = asp >= 1 ? maxS / asp : maxS;
    const mx = sw - mw - 14 * sc, my = sh - mh - 14 * sc;
    const k = mw / L.W;
    if (L.wallsDirty || !L.mmCv) {
      L.wallsDirty = false;
      const cv = L.mmCv || document.createElement('canvas');
      cv.width = Math.ceil(mw); cv.height = Math.ceil(mh);
      const c = cv.getContext('2d');
      c.clearRect(0, 0, cv.width, cv.height);
      c.fillStyle = L.def.mmColor || 'rgba(60,70,90,0.85)';
      if (L.def.world.shape === 'circle') { c.beginPath(); c.arc(mw / 2, mh / 2, mw / 2, 0, TAU); c.fill(); } else c.fillRect(0, 0, mw, mh);
      for (const d of L.floor) if (d.mm) { c.fillStyle = d.mm; if (d.k === 'rect') c.fillRect(d.x * k, d.y * k, Math.max(1, d.w * k), Math.max(1, d.h * k)); else if (d.k === 'circ') { c.beginPath(); c.arc(d.x * k, d.y * k, d.r * k, 0, TAU); c.fill(); } else if (d.k === 'poly') { c.beginPath(); for (let i = 0; i < d.pts.length; i += 2) c.lineTo(d.pts[i] * k, d.pts[i + 1] * k); c.closePath(); c.fill(); } else if (d.k === 'path') { c.beginPath(); for (let i = 0; i < d.pts.length; i += 2) c.lineTo(d.pts[i] * k, d.pts[i + 1] * k); c.lineWidth = Math.max(1, d.w * k); c.strokeStyle = d.mm; c.stroke(); } }
      for (const z of L.zones) { const col = { lava: '#ff6b00', paint: PAINT[z.color], current: 'rgba(116,192,252,0.6)', conveyor: '#495057', ice: '#d0ebff', slow: '#94d82d', water: '#1971c2' }[z.k]; if (!col) continue; c.fillStyle = col; if (z.shape === 'circ') { c.beginPath(); c.arc(z.x * k, z.y * k, Math.max(1.5, z.r * k), 0, TAU); c.fill(); } else c.fillRect(z.x * k, z.y * k, Math.max(1, z.w * k), Math.max(1, z.h * k)); }
      for (const p of L.plats) {
        c.fillStyle = p.kind === 'crumble' ? '#a0522d' : p.kind === 'conveyor' ? '#495057' : p.path ? 'rgba(255,212,59,0.35)' : '#adb5bd';
        if (p.shape === 'circ') { c.beginPath(); c.arc(p.x * k, p.y * k, Math.max(2, p.r * k), 0, TAU); c.fillStyle = '#ffd43b'; c.fill(); }
        else if (p.path) { const x0 = Math.min(p.path[0][0], p.path[1][0]), y0 = Math.min(p.path[0][1], p.path[1][1]); c.fillRect(x0 * k, y0 * k, (Math.abs(p.path[1][0] - p.path[0][0]) + p.w) * k, (Math.abs(p.path[1][1] - p.path[0][1]) + p.h) * k); }
        else c.fillRect(p.x * k, p.y * k, Math.max(1, p.w * k), Math.max(1, p.h * k));
      }
      for (const w of L.walls) {
        if (w.dead) continue;
        if (w.door && w.door.open >= 1) continue;
        c.fillStyle = w.gate ? PAINT[w.gate] : w.door ? (w.door.need && w.door.need.startsWith('key:') ? PAINT[w.door.need.slice(4)] : '#adb5bd') : '#e9ecef';
        c.fillRect(w.x * k, w.y * k, Math.max(1, w.w * k), Math.max(1, w.h * k));
      }
      L.mmCv = cv;
    }
    this.panel(ctx, mx - 6, my - 6, mw + 12, mh + 12, 10);
    ctx.drawImage(L.mmCv, mx, my);
    // важные объекты
    for (const it of L.items) {
      if (it.dead) continue;
      let col = it.mm;
      if (!col && it.key) col = PAINT[it.key];
      if (!col && it.boss) col = '#ff4d4d';
      if (!col && it.who) col = CH[it.who] ? CH[it.who].color : '#fff';
      if (!col) continue;
      circ(ctx, mx + it.x * k, my + it.y * k, Math.max(2.5 * sc, it.r * k), col, OL, 1);
    }
    for (const tr of L.triggers) { if (tr.k === 'plate' || tr.k === 'button' || tr.k === 'hold' || tr.k === 'simon') circ(ctx, mx + tr.x * k, my + tr.y * k, 2.5 * sc, tr.active || tr.done || tr.state === 'done' ? '#69db7c' : '#ffd43b', null); if (tr.k === 'portal') circ(ctx, mx + tr.x * k, my + tr.y * k, 3 * sc, '#b197fc', null); }
    for (const tr of L.triggers) if (tr.k === 'checkpoint') circ(ctx, mx + tr.x * k, my + tr.y * k, 2.5 * sc, tr.active ? '#69db7c' : '#ff6b6b', null);
    if (L.def.mmOverlay) L.def.mmOverlay(L, ctx, mx, my, k, sc);
    // область обзора
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1;
    const v = L.view; if (v) ctx.strokeRect(mx + Math.max(0, v.x) * k, my + Math.max(0, v.y) * k, Math.min(v.w, L.W) * k, Math.min(v.h, L.H) * k);
    const P = L.P;
    circ(ctx, mx + P.x * k, my + P.y * k, Math.max(3.5 * sc, P.r * k) * (1 + Math.sin(t * 6) * 0.15), '#ff6bd6', '#fff', 1.5);
  },
};
