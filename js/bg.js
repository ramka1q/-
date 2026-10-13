'use strict';
// ============================================================
//  Фоны: текстуры уровней (тайлы) и фоны для панелей комиксов
// ============================================================
const BG = {
  tiles: {},
  pats: {},

  tileDefs: {
    agar(c, N, r) {
      c.fillStyle = '#f3d27a'; c.fillRect(0, 0, N, N);
      for (let i = 0; i < 70; i++) { c.globalAlpha = 0.06 + r() * 0.06; circ(c, r() * N, r() * N, 10 + r() * 50, r() < 0.5 ? '#fff6c9' : '#d9a93f', null); }
      c.globalAlpha = 0.25;
      for (let i = 0; i < 40; i++) circ(c, r() * N, r() * N, 2 + r() * 8, null, '#fff', 1.5);
      c.globalAlpha = 1;
    },
    wood(c, N, r) {
      for (let p = 0; p < 4; p++) {
        c.fillStyle = p % 2 ? '#c4935c' : '#b98653'; c.fillRect(0, p * N / 4, N, N / 4);
        c.strokeStyle = 'rgba(90,50,20,0.18)'; c.lineWidth = 2;
        for (let k = 0; k < 7; k++) { c.beginPath(); const y0 = p * N / 4 + 8 + k * 16 + r() * 6; c.moveTo(0, y0); for (let x = 0; x <= N; x += 32) c.lineTo(x, y0 + Math.sin(x * 0.02 + k + p) * 4); c.stroke(); }
        c.fillStyle = 'rgba(60,30,10,0.35)'; c.fillRect(0, p * N / 4, N, 3);

      }
    },
    floortiles(c, N, r) {
      const n = 4, s = N / n;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { c.fillStyle = (i + j) % 2 ? '#e9ecef' : '#dde1e6'; c.fillRect(i * s, j * s, s, s); }
      c.strokeStyle = '#c3c9d0'; c.lineWidth = 3;
      for (let i = 0; i <= n; i++) { c.beginPath(); c.moveTo(i * s, 0); c.lineTo(i * s, N); c.stroke(); c.beginPath(); c.moveTo(0, i * s); c.lineTo(N, i * s); c.stroke(); }
      for (let i = 0; i < 6; i++) { c.globalAlpha = 0.08; line(c, r() * N, r() * N, r() * N, r() * N, '#495057', 2); } c.globalAlpha = 1;
    },
    concrete(c, N, r) {
      c.fillStyle = '#9ea4aa'; c.fillRect(0, 0, N, N);
      for (let i = 0; i < 1500; i++) { c.fillStyle = r() < 0.5 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'; c.fillRect(r() * N, r() * N, 2, 2); }
      for (let i = 0; i < 3; i++) { c.globalAlpha = 0.15; blob(c, r() * N, r() * N, 20 + r() * 40, 8, 0.3, i * 9, '#3d3d3d', null); } c.globalAlpha = 1;
      c.strokeStyle = 'rgba(0,0,0,0.15)'; c.lineWidth = 2; c.strokeRect(0, 0, N, N);
    },
    grass(c, N, r) {
      c.fillStyle = '#6cc66a'; c.fillRect(0, 0, N, N);
      for (let i = 0; i < 500; i++) { const x = r() * N, y = r() * N; line(c, x, y, x + (r() - 0.5) * 6, y - 6 - r() * 6, r() < 0.5 ? '#5bb15a' : '#84d682', 2); }
      for (let i = 0; i < 12; i++) circ(c, r() * N, r() * N, 3, r() < 0.5 ? '#fff' : '#ffd43b', null);
    },
    asphalt(c, N, r) {
      c.fillStyle = '#4a4f55'; c.fillRect(0, 0, N, N);
      for (let i = 0; i < 1600; i++) { c.fillStyle = r() < 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.1)'; c.fillRect(r() * N, r() * N, 2, 2); }
    },
    sidewalk(c, N, r) {
      const s = N / 4;
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { c.fillStyle = (i * 3 + j) % 3 ? '#c9c9c9' : '#bfbfbf'; c.fillRect(i * s, j * s, s, s); }
      c.strokeStyle = '#9a9a9a'; c.lineWidth = 3;
      for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(i * s, 0); c.lineTo(i * s, N); c.stroke(); c.beginPath(); c.moveTo(0, i * s); c.lineTo(N, i * s); c.stroke(); }
    },
    sewer(c, N, r) {
      c.fillStyle = '#2b2f36'; c.fillRect(0, 0, N, N);
      const bh = N / 8;
      for (let row = 0; row < 8; row++) {
        const off = row % 2 ? N / 8 : 0;
        for (let k = -1; k < 4; k++) { c.fillStyle = U.shade('#3f444d', (r() - 0.5) * 0.2); c.fillRect(off + k * N / 4 + 3, row * bh + 3, N / 4 - 6, bh - 6); }
      }
      for (let i = 0; i < 10; i++) { c.globalAlpha = 0.25; blob(c, r() * N, r() * N, 8 + r() * 18, 7, 0.3, i, '#5c940d', null); } c.globalAlpha = 1;
    },
    dirt(c, N, r) {
      c.fillStyle = '#b8a272'; c.fillRect(0, 0, N, N);
      for (let i = 0; i < 25; i++) { c.globalAlpha = 0.12; blob(c, r() * N, r() * N, 15 + r() * 40, 8, 0.35, i, r() < 0.5 ? '#8a7448' : '#d6c08f', null); }
      c.globalAlpha = 1;
      for (let i = 0; i < 60; i++) circ(c, r() * N, r() * N, 1.5 + r() * 3, '#8f7c55', null);
      c.globalAlpha = 0.15; for (let k = 0; k < 2; k++) { const y = r() * N; for (let x = 0; x < N; x += 14) c.fillStyle = '#5c4d30', c.fillRect(x, y + Math.sin(x * 0.01) * 10, 8, 4); } c.globalAlpha = 1;
    },
    ocean(c, N, r) {
      c.fillStyle = '#1971c2'; c.fillRect(0, 0, N, N);
      c.strokeStyle = 'rgba(165,216,255,0.22)'; c.lineWidth = 3;
      for (let i = 0; i < 26; i++) { c.beginPath(); const x = r() * N, y = r() * N; c.moveTo(x, y); c.bezierCurveTo(x + 30, y - 20, x + 50, y + 25, x + 80 + r() * 40, y + (r() - 0.5) * 40); c.stroke(); }
      for (let i = 0; i < 30; i++) circ(c, r() * N, r() * N, 2, 'rgba(255,255,255,0.15)', null);
    },
    seabed(c, N, r) {
      c.fillStyle = '#0b4f8a'; c.fillRect(0, 0, N, N);
      for (let i = 0; i < 20; i++) { c.globalAlpha = 0.1; blob(c, r() * N, r() * N, 20 + r() * 40, 8, 0.3, i, '#063a68', null); } c.globalAlpha = 1;
    },
    volcrock(c, N, r) {
      c.fillStyle = '#4a3f38'; c.fillRect(0, 0, N, N);
      for (let i = 0; i < 18; i++) { c.globalAlpha = 0.15; blob(c, r() * N, r() * N, 20 + r() * 50, 8, 0.35, i, r() < 0.5 ? '#2e2622' : '#6b5a4e', null); } c.globalAlpha = 1;
      c.lineCap = 'round';
      for (let i = 0; i < 8; i++) { let x = r() * N, y = r() * N; c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (r() - 0.5) * 60; y += (r() - 0.5) * 60; c.lineTo(x, y); } c.lineWidth = 3; c.strokeStyle = 'rgba(255,120,0,0.25)'; c.stroke(); }
    },
    metal(c, N, r) {
      const s = N / 2;
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
        c.fillStyle = (i + j) % 2 ? '#3d3a52' : '#36334a'; c.fillRect(i * s, j * s, s, s);
        c.strokeStyle = '#25233a'; c.lineWidth = 4; c.strokeRect(i * s + 2, j * s + 2, s - 4, s - 4);
        for (const [x, y] of [[12, 12], [s - 12, 12], [12, s - 12], [s - 12, s - 12]]) circ(c, i * s + x, j * s + y, 4, '#5a567a', null);
      }
      c.globalAlpha = 0.2; line(c, 0, N / 2, N, N / 2, '#b197fc', 3); c.globalAlpha = 1;
    },
    ice(c, N, r) {
      c.fillStyle = '#d0ebff'; c.fillRect(0, 0, N, N);
      for (let i = 0; i < 20; i++) line(c, r() * N, r() * N, r() * N, r() * N, 'rgba(255,255,255,0.6)', 2);
    },
  },

  tile(name) {
    if (this.tiles[name]) return this.tiles[name];
    const N = 512, cv = document.createElement('canvas'); cv.width = cv.height = N;
    const c = cv.getContext('2d'); c.lineJoin = 'round'; c.lineCap = 'round';
    this.tileDefs[name](c, N, U.rng(name.length * 977 + 13));
    this.tiles[name] = cv;
    return cv;
  },
  pattern(ctx, name) {
    if (!this.pats[name]) this.pats[name] = ctx.createPattern(this.tile(name), 'repeat');
    return this.pats[name];
  },
  // Заливка прямоугольника мира паттерном. T — размер тайла в мировых единицах.
  // При сильном отдалении тайл автоматически укрупняется (без ряби).
  fillPattern(ctx, name, T, x, y, w, h, zoom, alpha = 1) {
    const pat = this.pattern(ctx, name);
    let px = T * zoom, k = 1;
    while (px * k < 90) k *= 4;
    const eff = T * k;
    pat.setTransform(new DOMMatrix().scale(eff / 512));
    ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = pat; ctx.fillRect(x, y, w, h); ctx.restore();
  },

  // Декор пола из данных уровня
  drawFloor(ctx, items, view, zoom, t) {
    for (const d of items) {
      if (d.bb && (d.bb.x > view.x + view.w || d.bb.x + d.bb.w < view.x || d.bb.y > view.y + view.h || d.bb.y + d.bb.h < view.y)) continue;
      ctx.save();
      if (d.a !== undefined) ctx.globalAlpha = d.a;
      switch (d.k) {
        case 'rect':
          if (d.pat) { ctx.beginPath(); ctx.rect(d.x, d.y, d.w, d.h); ctx.clip(); this.fillPattern(ctx, d.pat, d.T || 400, d.x, d.y, d.w, d.h, zoom); }
          else { ctx.fillStyle = d.c; ctx.fillRect(d.x, d.y, d.w, d.h); }
          if (d.stroke) { ctx.strokeStyle = d.stroke; ctx.lineWidth = d.sw || 4; ctx.strokeRect(d.x, d.y, d.w, d.h); }
          break;
        case 'circ':
          ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, TAU);
          if (d.pat) { ctx.save(); ctx.clip(); this.fillPattern(ctx, d.pat, d.T || 400, d.x - d.r, d.y - d.r, d.r * 2, d.r * 2, zoom); ctx.restore(); }
          else if (d.grad) { const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r); d.grad.forEach((s, i) => g.addColorStop(i / (d.grad.length - 1), s)); ctx.fillStyle = g; ctx.fill(); }
          else { ctx.fillStyle = d.c; ctx.fill(); }
          if (d.stroke) { ctx.strokeStyle = d.stroke; ctx.lineWidth = d.sw || 4; ctx.stroke(); }
          break;
        case 'poly':
          ctx.beginPath(); ctx.moveTo(d.pts[0], d.pts[1]);
          for (let i = 2; i < d.pts.length; i += 2) ctx.lineTo(d.pts[i], d.pts[i + 1]);
          ctx.closePath();
          if (d.pat) { ctx.save(); ctx.clip(); this.fillPattern(ctx, d.pat, d.T || 400, d.bb.x, d.bb.y, d.bb.w, d.bb.h, zoom); ctx.restore(); }
          else { ctx.fillStyle = d.c; ctx.fill(); }
          if (d.stroke) { ctx.strokeStyle = d.stroke; ctx.lineWidth = d.sw || 6; ctx.lineJoin = 'round'; ctx.stroke(); }
          break;
        case 'path': // дороги/реки — толстые линии
          ctx.beginPath(); ctx.moveTo(d.pts[0], d.pts[1]);
          for (let i = 2; i < d.pts.length; i += 2) ctx.lineTo(d.pts[i], d.pts[i + 1]);
          ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          if (d.edge) { ctx.lineWidth = d.w + d.edgeW * 2; ctx.strokeStyle = d.edge; ctx.stroke(); }
          ctx.lineWidth = d.w; ctx.strokeStyle = d.c; ctx.stroke();
          if (d.dash) { ctx.setLineDash([d.w * 0.6, d.w * 0.6]); ctx.lineDashOffset = d.flow ? -t * d.flow : 0; ctx.lineWidth = d.w * 0.06; ctx.strokeStyle = d.dash; ctx.stroke(); ctx.setLineDash([]); }
          break;
        case 'text':
          ctx.fillStyle = d.c; ctx.font = `900 ${d.size}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(d.text, d.x, d.y);
          break;
        case 'stripes': { // предупреждающая разметка
          ctx.beginPath(); ctx.rect(d.x, d.y, d.w, d.h); ctx.clip();
          ctx.fillStyle = d.c1 || '#ffd43b'; ctx.fillRect(d.x, d.y, d.w, d.h);
          ctx.fillStyle = d.c2 || '#212529';
          const s = d.s || 40;
          for (let x = d.x - d.h; x < d.x + d.w + d.h; x += s * 2) { ctx.beginPath(); ctx.moveTo(x, d.y); ctx.lineTo(x + s, d.y); ctx.lineTo(x + s + d.h, d.y + d.h); ctx.lineTo(x + d.h, d.y + d.h); ctx.closePath(); ctx.fill(); }
          break;
        }
      }
      ctx.restore();
    }
  },

  // Звёздное небо (экранное, с параллаксом)
  stars(ctx, W, H, camx, camy, zoom, t, count = 260) {
    if (!this._stars) { const r = U.rng(4242); this._stars = []; for (let i = 0; i < 400; i++) this._stars.push([r(), r(), r() * 0.8 + 0.2, r()]); }
    for (let i = 0; i < Math.min(count, this._stars.length); i++) {
      const [sx, sy, d, ph] = this._stars[i];
      const par = 0.02 * d;
      let x = ((sx * W * 2 - camx * zoom * par) % W + W) % W;
      let y = ((sy * H * 2 - camy * zoom * par) % H + H) % H;
      const a = 0.4 + 0.6 * Math.abs(Math.sin(t * (0.5 + ph) + ph * 10));
      ctx.globalAlpha = a; ctx.fillStyle = ph > 0.8 ? '#ffd8a8' : ph > 0.6 ? '#a5d8ff' : '#fff';
      const s = d * 2.2; ctx.fillRect(x, y, s, s);
    }
    ctx.globalAlpha = 1;
  },

  // ============================================================
  //  Фоны панелей комиксов: (ctx, x, y, w, h, t)
  // ============================================================
  panel: {
    plain(c, x, y, w, h, t, col = '#ffe066') {
      c.fillStyle = col; c.fillRect(x, y, w, h); BG.halftone(c, x, y, w, h, U.shade(col, -0.15));
    },
    sunburst(c, x, y, w, h, t, col = '#ffd43b') {
      c.fillStyle = col; c.fillRect(x, y, w, h);
      const cx = x + w / 2, cy = y + h / 2, R = Math.hypot(w, h);
      c.fillStyle = U.shade(col, 0.35);
      for (let i = 0; i < 18; i++) { const a = t * 0.3 + (i / 18) * TAU; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); c.lineTo(cx + Math.cos(a + TAU / 36) * R, cy + Math.sin(a + TAU / 36) * R); c.closePath(); c.fill(); }
    },
    danger(c, x, y, w, h, t) { BG.panel.sunburst(c, x, y, w, h, t, '#ff6b6b'); },
    evil(c, x, y, w, h, t) { BG.panel.sunburst(c, x, y, w, h, t * 0.5, '#7048e8'); },
    building(c, x, y, w, h, t) { // НИИ ночью с молниями
      const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#0b0d2e'); g.addColorStop(1, '#3b2a6b'); c.fillStyle = g; c.fillRect(x, y, w, h);
      BG.skyStars(c, x, y, w, h * 0.6, t);
      circ(c, x + w * 0.85, y + h * 0.2, h * 0.09, '#fff3bf', null);
      const flash = Math.sin(t * 1.3) > 0.97;
      if (flash) { c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(x, y, w, h); poly(c, [x + w * 0.2, y, x + w * 0.24, y + h * 0.2, x + w * 0.21, y + h * 0.2, x + w * 0.26, y + h * 0.45], null, '#fff', 4, true); }
      const bx = x + w * 0.25, bw = w * 0.5, by = y + h * 0.35, bh = h * 0.65;
      rect(c, bx, by, bw, bh, 4, '#2d3047', OL, 3);
      poly(c, [bx - 10, by, bx + bw / 2, by - h * 0.12, bx + bw + 10, by], '#3d405b');
      c.beginPath(); c.arc(bx + bw / 2, by - h * 0.12, h * 0.07, Math.PI, 0); fs(c, '#adb5bd', OL, 3);
      for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) { const lit = (Math.sin(i * 7 + j * 3 + Math.floor(t * 0.7)) > 0); rect(c, bx + 14 + i * (bw - 28) / 6, by + 18 + j * (bh - 40) / 4, (bw - 28) / 6 - 8, (bh - 40) / 4 - 12, 2, lit ? '#ffe066' : '#1b1d2e', OL, 1.5); }
      rect(c, bx + bw * 0.2, by - 6, bw * 0.6, h * 0.07, 3, '#e03131', OL, 2);
      c.fillStyle = '#fff'; c.font = `900 ${h * 0.045}px sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('НИИ «МОЗГОПРАВ»', bx + bw / 2, by - 6 + h * 0.035);
      c.fillStyle = '#1b1d2e'; c.fillRect(x, y + h * 0.95, w, h * 0.05);
    },
    lab(c, x, y, w, h, t, night = false) {
      c.fillStyle = night ? '#1f2440' : '#dbe4ff'; c.fillRect(x, y, w, h);
      c.fillStyle = night ? '#171b33' : '#bac8ff'; c.fillRect(x, y + h * 0.72, w, h * 0.28);
      for (let k = 0; k < 2; k++) {
        const sy = y + h * (0.22 + k * 0.22);
        rect(c, x + w * 0.05, sy, w * 0.9, 8, 2, night ? '#5c4a3a' : '#a0693e', OL, 2);
        for (let i = 0; i < 9; i++) {
          const fx = x + w * 0.08 + i * w * 0.1, col = ['#ff6b6b', '#51cf66', '#339af0', '#fcc419', '#cc5de8'][(i + k) % 5];
          const fh = h * 0.08 + (i % 3) * h * 0.02;
          rect(c, fx, sy - fh, w * 0.04, fh, 4, U.rgba('#e7f5ff', 0.6), OL, 2);
          rect(c, fx + 2, sy - fh * 0.55, w * 0.04 - 4, fh * 0.55 - 2, 3, col, null);
          if ((i + k) % 3 === 0) circ(c, fx + w * 0.02, sy - fh - 6 - ((t * 30 + i * 13) % 20), 3, U.rgba(col, 0.6), null);
        }
      }
      rect(c, x + w * 0.1, y + h * 0.72, w * 0.8, h * 0.04, 2, night ? '#495057' : '#adb5bd', OL, 2);
      if (night) { c.fillStyle = 'rgba(0,0,30,0.25)'; c.fillRect(x, y, w, h); }
    },
    labnight(c, x, y, w, h, t) { BG.panel.lab(c, x, y, w, h, t, true); },
    fridge(c, x, y, w, h, t) {
      BG.panel.lab(c, x, y, w, h, t, true);
      const fx = x + w * 0.55, fw = w * 0.35, fy = y + h * 0.15, fh = h * 0.8;
      rect(c, fx, fy, fw, fh, 10, '#e9ecef', OL, 3);
      rect(c, fx + 8, fy + 8, fw - 16, fh - 16, 6, '#fff9db', OL, 2);
      c.save(); c.globalAlpha = 0.35 + 0.1 * Math.sin(t * 3); const g = c.createRadialGradient(fx + fw / 2, fy + fh / 2, 10, fx + fw / 2, fy + fh / 2, fw); g.addColorStop(0, '#fff3bf'); g.addColorStop(1, 'rgba(255,243,191,0)'); c.fillStyle = g; c.fillRect(x, y, w, h); c.restore();
      for (let i = 1; i < 4; i++) line(c, fx + 10, fy + i * fh / 4, fx + fw - 10, fy + i * fh / 4, '#adb5bd', 3);
    },
    microscope(c, x, y, w, h, t) {
      c.fillStyle = '#111'; c.fillRect(x, y, w, h);
      const cx = x + w / 2, cy = y + h / 2, R = Math.min(w, h) * 0.45;
      c.save(); c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.clip();
      c.fillStyle = '#f3d27a'; c.fillRect(x, y, w, h);
      for (let i = 0; i < 14; i++) { const a = i * 2.4 + t * 0.2, d = R * (0.3 + (i % 5) * 0.14); circ(c, cx + Math.cos(a) * d, cy + Math.sin(a) * d, R * 0.04, '#7bd389', OL, 1.5); }
      const g = c.createRadialGradient(cx, cy, R * 0.6, cx, cy, R); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.6)'); c.fillStyle = g; c.fillRect(x, y, w, h);
      c.restore();
      circ(c, cx, cy, R, null, '#333', 8);
    },
    corridor(c, x, y, w, h, t) {
      c.fillStyle = '#e9ecef'; c.fillRect(x, y, w, h);
      const vx = x + w / 2, vy = y + h * 0.45;
      c.fillStyle = '#ced4da'; poly(c, [x, y + h, x + w, y + h, vx + w * 0.1, vy + h * 0.1, vx - w * 0.1, vy + h * 0.1], '#ced4da', null);
      c.fillStyle = '#f8f9fa'; poly(c, [x, y, x + w, y, vx + w * 0.1, vy - h * 0.1, vx - w * 0.1, vy - h * 0.1], '#f1f3f5', null);
      rect(c, vx - w * 0.1, vy - h * 0.1, w * 0.2, h * 0.2, 0, '#adb5bd', OL, 2);
      for (let i = 0; i < 4; i++) { const k = i / 4; line(c, x + k * w * 0.4, y + h * (1 - k * 0.45), x + k * w * 0.4, y + k * h * 0.45, U.rgba(OL, 0.25), 2); line(c, x + w - k * w * 0.4, y + h * (1 - k * 0.45), x + w - k * w * 0.4, y + k * h * 0.45, U.rgba(OL, 0.25), 2); }
      const blink = Math.sin(t * 6) > 0;
      circ(c, vx, y + h * 0.08, h * 0.03, blink ? '#ff6b6b' : '#862e2e', OL, 2);
    },
    workshop(c, x, y, w, h, t) {
      c.fillStyle = '#868e96'; c.fillRect(x, y, w, h);
      c.fillStyle = '#5c636a'; c.fillRect(x, y + h * 0.7, w, h * 0.3);
      BG.drawFloor(c, [{ k: 'stripes', x: x, y: y + h * 0.68, w: w, h: h * 0.04, s: h * 0.04 }], { x: -1e9, y: -1e9, w: 2e9, h: 2e9 }, 1, t);
      for (let i = 0; i < 3; i++) { c.save(); c.translate(x + w * (0.2 + i * 0.3), y + h * 0.3); c.rotate(t * (i % 2 ? 1 : -1)); S.gear(c, i); c.restore(); }
    },
    city(c, x, y, w, h, t, night = false) {
      const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, night ? '#0b1033' : '#74c0fc'); g.addColorStop(1, night ? '#4c2a85' : '#d0ebff'); c.fillStyle = g; c.fillRect(x, y, w, h);
      if (night) BG.skyStars(c, x, y, w, h * 0.5, t);
      const r = U.rng(99);
      for (let layer = 0; layer < 2; layer++) {
        let bx = x - 10;
        while (bx < x + w) {
          const bw = w * (0.08 + r() * 0.08), bh = h * (0.3 + r() * 0.4) * (layer ? 0.75 : 1);
          const col = layer ? (night ? '#2b2d42' : '#91a7ff') : (night ? '#1b1d2e' : '#5c7cfa');
          rect(c, bx, y + h - bh, bw, bh, 2, col, OL, 2);
          for (let i = 0; i < 3; i++) for (let j = 0; j < Math.floor(bh / 26); j++) if (r() < 0.6) c.fillStyle = night ? '#ffe066' : '#e7f5ff', c.fillRect(bx + 6 + i * (bw - 12) / 3, y + h - bh + 10 + j * 26, (bw - 12) / 3 - 6, 12);
          bx += bw + 4;
        }
      }
      c.fillStyle = '#343a40'; c.fillRect(x, y + h * 0.92, w, h * 0.08);
    },
    citynight(c, x, y, w, h, t) { BG.panel.city(c, x, y, w, h, t, true); },
    sewer(c, x, y, w, h, t) {
      c.fillStyle = '#1b1e24'; c.fillRect(x, y, w, h);
      c.save(); c.beginPath(); c.ellipse(x + w / 2, y + h * 0.55, w * 0.48, h * 0.55, 0, 0, TAU); c.clip();
      c.fillStyle = '#2b2f36'; c.fillRect(x, y, w, h);
      for (let i = 0; i < 10; i++) for (let j = 0; j < 8; j++) rect(c, x + i * w / 10 + (j % 2) * w / 20, y + j * h / 8, w / 10 - 4, h / 8 - 4, 2, '#3a3f47', null);
      c.fillStyle = '#4c6b2e'; c.fillRect(x, y + h * 0.75, w, h * 0.25);
      for (let i = 0; i < 6; i++) ell(c, x + ((i * w / 5 + t * 40) % (w + 40)) - 20, y + h * 0.8, 20, 4, 0, U.rgba('#94d82d', 0.4), null);
      c.restore();
    },
    base(c, x, y, w, h, t) {
      const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#ffc078'); g.addColorStop(1, '#ffe8cc'); c.fillStyle = g; c.fillRect(x, y, w, h);
      c.fillStyle = '#b8a272'; c.fillRect(x, y + h * 0.7, w, h * 0.3);
      for (let i = 0; i < 6; i++) { const fx = x + i * w / 5; line(c, fx, y + h * 0.55, fx, y + h * 0.72, OL, 3); }
      c.strokeStyle = OL; c.lineWidth = 1.5; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(x, y + h * (0.57 + k * 0.04)); c.lineTo(x + w, y + h * (0.57 + k * 0.04)); c.stroke(); }
      poly(c, [x + w * 0.7, y + h * 0.7, x + w * 0.78, y + h * 0.5, x + w * 0.86, y + h * 0.7], '#6b8e23');
    },
    ocean(c, x, y, w, h, t) {
      const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#4dabf7'); g.addColorStop(1, '#0b3d75'); c.fillStyle = g; c.fillRect(x, y, w, h);
      c.save(); c.globalAlpha = 0.18; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(x + i * w / 5 + Math.sin(t + i) * 20, y); c.lineTo(x + i * w / 5 + 60 + Math.sin(t + i) * 20, y); c.lineTo(x + i * w / 5 - 40, y + h); c.lineTo(x + i * w / 5 - 80, y + h); c.closePath(); c.fillStyle = '#fff'; c.fill(); } c.restore();
      for (let i = 0; i < 12; i++) circ(c, x + ((i * 97) % w), y + h - ((t * 40 + i * 53) % h), 3 + (i % 3), U.rgba('#fff', 0.4), null);
    },
    beach(c, x, y, w, h, t) {
      const g = c.createLinearGradient(0, y, 0, y + h * 0.5); g.addColorStop(0, '#74c0fc'); g.addColorStop(1, '#d0ebff'); c.fillStyle = g; c.fillRect(x, y, w, h);
      circ(c, x + w * 0.8, y + h * 0.18, h * 0.1, '#ffe066', null);
      c.fillStyle = '#1c7ed6'; c.fillRect(x, y + h * 0.45, w, h * 0.2);
      c.beginPath(); c.moveTo(x, y + h * 0.65); for (let i = 0; i <= 20; i++) c.lineTo(x + i * w / 20, y + h * 0.62 + Math.sin(i + t * 2) * 5); c.lineTo(x + w, y + h); c.lineTo(x, y + h); c.closePath(); c.fillStyle = '#ffe8a3'; c.fill();
    },
    volcano(c, x, y, w, h, t) {
      const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#3b0d0d'); g.addColorStop(1, '#ff8c42'); c.fillStyle = g; c.fillRect(x, y, w, h);
      poly(c, [x + w * 0.1, y + h, x + w * 0.42, y + h * 0.3, x + w * 0.58, y + h * 0.3, x + w * 0.9, y + h], '#4a3f38');
      ell(c, x + w * 0.5, y + h * 0.3, w * 0.08, h * 0.03, 0, '#ffd43b', OL, 2);
      for (let i = 0; i < 8; i++) { const k = (t * 0.6 + i / 8) % 1; circ(c, x + w * 0.5 + Math.sin(i * 3) * w * 0.15 * k, y + h * 0.3 - k * h * 0.3 + k * k * h * 0.4, 6 * (1 - k) + 2, '#ff6b00', null); }
      c.save(); c.globalAlpha = 0.5; for (let i = 0; i < 4; i++) circ(c, x + w * 0.5 + Math.sin(t + i) * 20, y + h * 0.15 - i * 20 - (t * 10 % 20), 20 + i * 8, '#495057', null); c.restore();
    },
    earth(c, x, y, w, h, t) {
      c.fillStyle = '#05061a'; c.fillRect(x, y, w, h); BG.skyStars(c, x, y, w, h, t);
      const R = h * 0.95; c.save(); c.translate(x + w / 2, y + h * 1.3); c.scale(R / 46, R / 46); S.earthp(c); c.restore();
    },
    orbit(c, x, y, w, h, t) {
      c.fillStyle = '#05061a'; c.fillRect(x, y, w, h); BG.skyStars(c, x, y, w, h, t);
      const R = h * 0.35; c.save(); c.translate(x + w * 0.8, y + h * 0.75); c.scale(R / 46, R / 46); c.rotate(t * 0.05); S.earthp(c); c.restore();
    },
    space(c, x, y, w, h, t) {
      const g = c.createRadialGradient(x + w * 0.3, y + h * 0.4, 0, x + w * 0.3, y + h * 0.4, w); g.addColorStop(0, '#3b1d6b'); g.addColorStop(0.5, '#120c33'); g.addColorStop(1, '#05061a'); c.fillStyle = g; c.fillRect(x, y, w, h);
      BG.skyStars(c, x, y, w, h, t);
    },
    sun(c, x, y, w, h, t) {
      BG.panel.space(c, x, y, w, h, t);
      const R = h * 0.5, cx = x + w * 0.85, cy = y + h * 0.5;
      const g = c.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.5); g.addColorStop(0, '#fff3bf'); g.addColorStop(0.4, '#ffd43b'); g.addColorStop(0.7, 'rgba(255,146,43,0.6)'); g.addColorStop(1, 'rgba(255,107,0,0)'); c.fillStyle = g; c.fillRect(x, y, w, h);
    },
    lair(c, x, y, w, h, t) { // логово Молгелевича
      c.fillStyle = '#1a1033'; c.fillRect(x, y, w, h);
      for (let i = 0; i < 4; i++) {
        const sx = x + w * (0.08 + i * 0.23), sy = y + h * 0.12, sw = w * 0.18, sh = h * 0.28;
        rect(c, sx, sy, sw, sh, 4, '#0b2b26', '#495057', 4);
        c.save(); c.beginPath(); c.rect(sx, sy, sw, sh); c.clip();
        c.strokeStyle = '#69db7c'; c.lineWidth = 2; c.beginPath();
        for (let k = 0; k <= 20; k++) { const px = sx + k * sw / 20, py = sy + sh / 2 + Math.sin(k * 0.8 + t * 3 + i) * sh * 0.3 * (i % 2 ? 1 : 0.5); k ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke();
        if (i === 1) { c.fillStyle = 'rgba(155,92,255,0.6)'; circ(c, sx + sw / 2, sy + sh / 2, sh * 0.3 * (1 + 0.1 * Math.sin(t * 4)), '#9b5cff', null); }
        c.restore();
      }
      for (let i = 0; i < 3; i++) { const tx = x + w * (0.15 + i * 0.35), ty = y + h * 0.55; rect(c, tx, ty, w * 0.06, h * 0.4, 8, U.rgba('#b2f2bb', 0.35), OL, 3); c.fillStyle = U.rgba('#69db7c', 0.6); c.fillRect(tx + 4, ty + h * 0.15, w * 0.06 - 8, h * 0.25 - 4); circ(c, tx + w * 0.03, ty + h * 0.35 - ((t * 25 + i * 30) % (h * 0.2)), 4, '#d3f9d8', null); }
      c.fillStyle = 'rgba(155,92,255,0.12)'; c.fillRect(x, y, w, h);
    },
    launch(c, x, y, w, h, t) {
      const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#ff8787'); g.addColorStop(1, '#ffd8a8'); c.fillStyle = g; c.fillRect(x, y, w, h);
      c.fillStyle = '#c2a878'; c.fillRect(x, y + h * 0.82, w, h * 0.18);
      for (let i = 0; i < 3; i++) {
        const rx = x + w * (0.55 + i * 0.13), ry = y + h * 0.82;
        rect(c, rx - 8, ry - h * 0.4, 16, h * 0.4, 6, '#f8f9fa', OL, 2);
        poly(c, [rx - 8, ry - h * 0.4, rx, ry - h * 0.5, rx + 8, ry - h * 0.4], '#e03131');
        poly(c, [rx - 8, ry - 10, rx - 16, ry, rx - 8, ry], '#e03131'); poly(c, [rx + 8, ry - 10, rx + 16, ry, rx + 8, ry], '#e03131');
        c.save(); c.translate(rx, ry - h * 0.32); c.rotate(0.3); poly(c, [-10, 0, 0, -8, 10, 0, 0, 8], '#ff8fab', OL, 1.5); c.restore(); // бантик
      }
    },
    cafeteria(c, x, y, w, h, t) {
      c.fillStyle = '#fff3bf'; c.fillRect(x, y, w, h);
      for (let i = 0; i < 12; i++) rect(c, x + i * w / 12, y, w / 24, h * 0.6, 0, '#ffe8a3', null);
      c.fillStyle = '#e8590c'; c.fillRect(x, y + h * 0.6, w, h * 0.4);
      for (let i = 0; i < 20; i++) for (let j = 0; j < 4; j++) if ((i + j) % 2) c.fillStyle = '#fd7e14', c.fillRect(x + i * w / 20, y + h * 0.6 + j * h * 0.1, w / 20, h * 0.1);
      for (let i = 0; i < 10; i++) { const k = (i * 0.137 + t * 0.05) % 1; U.starPath(c, x + w * ((i * 0.31) % 1), y + h * k * 0.6, 4, 6, 2.5); fs(c, PAL.bright[i % 7], null); }
    },
    speed(c, x, y, w, h, t, col = '#fff') {
      c.fillStyle = col; c.fillRect(x, y, w, h);
      const cx = x + w / 2, cy = y + h / 2;
      c.strokeStyle = 'rgba(0,0,0,0.25)';
      for (let i = 0; i < 60; i++) { const a = (i / 60) * TAU + Math.sin(i * 7) * 0.05, r0 = Math.min(w, h) * (0.32 + 0.1 * Math.sin(i * 3 + t * 8)); c.lineWidth = 1 + (i % 3); c.beginPath(); c.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); c.lineTo(cx + Math.cos(a) * w, cy + Math.sin(a) * w); c.stroke(); }
    },
    station(c, x, y, w, h, t) {
      BG.panel.space(c, x, y, w, h, t);
      const cx = x + w * 0.5, cy = y + h * 0.55, R = h * 0.42;
      c.save(); c.translate(cx, cy); c.scale(R / 46, R / 46); c.rotate(Math.sin(t * 0.3) * 0.05); S.brainbot(c); c.restore();
      c.save(); c.globalAlpha = 0.4 + 0.2 * Math.sin(t * 3); circ(c, cx, cy, R * 1.15, null, '#be4bdb', 6); c.restore();
    },
  },

  skyStars(c, x, y, w, h, t) {
    const r = U.rng(7);
    for (let i = 0; i < 60; i++) { const a = 0.4 + 0.6 * Math.abs(Math.sin(t * (0.6 + r()) + i)); c.globalAlpha = a; c.fillStyle = '#fff'; const s = 1 + r() * 2.2; c.fillRect(x + r() * w, y + r() * h, s, s); }
    c.globalAlpha = 1;
  },
  halftone(c, x, y, w, h, col) {
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.fillStyle = col;
    const s = 14;
    for (let i = 0; i * s < w + s; i++) for (let j = 0; j * s < h + s; j++) {
      const k = (j / (h / s));
      const r = 1 + k * 3.2;
      c.beginPath(); c.arc(x + i * s + (j % 2) * s / 2, y + j * s, r, 0, TAU); c.fill();
    }
    c.restore();
  },
};
