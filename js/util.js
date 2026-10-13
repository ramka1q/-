'use strict';
// ============================================================
//  Утилиты: математика, рандом, easing, цвета, геометрия, текст
// ============================================================
const TAU = Math.PI * 2;

const U = {
  clamp: (v, a, b) => (v < a ? a : v > b ? b : v),
  lerp: (a, b, t) => a + (b - a) * t,
  invLerp: (a, b, v) => (v - a) / (b - a),
  dist: (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay),
  dist2: (ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay; return dx * dx + dy * dy; },
  angle: (ax, ay, bx, by) => Math.atan2(by - ay, bx - ax),
  angDiff(a, b) { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; },
  approach(v, target, step) { return v < target ? Math.min(target, v + step) : Math.max(target, v - step); },
  damp(a, b, k, dt) { return b + (a - b) * Math.exp(-k * dt); },
  sign: v => (v < 0 ? -1 : 1),

  // Детерминированный генератор (mulberry32): карты одинаковые при каждом запуске
  rng(seed) {
    let a = seed >>> 0;
    const f = () => {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    f.range = (lo, hi) => lo + f() * (hi - lo);
    f.int = (lo, hi) => Math.floor(lo + f() * (hi - lo + 1));
    f.pick = arr => arr[Math.floor(f() * arr.length)];
    f.chance = p => f() < p;
    return f;
  },
  rand: (lo, hi) => lo + Math.random() * (hi - lo),
  randInt: (lo, hi) => Math.floor(lo + Math.random() * (hi - lo + 1)),
  pick: arr => arr[Math.floor(Math.random() * arr.length)],

  ease: {
    linear: t => t,
    inQuad: t => t * t,
    outQuad: t => 1 - (1 - t) * (1 - t),
    inCubic: t => t * t * t,
    outCubic: t => 1 - Math.pow(1 - t, 3),
    inOutCubic: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    outBack: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    outElastic: t => (t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (TAU / 3)) + 1),
    outBounce(t) {
      const n1 = 7.5625, d1 = 2.75;
      if (t < 1 / d1) return n1 * t * t;
      if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
      if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    },
  },

  // ---------- цвета ----------
  hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const n = parseInt(hex, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  },
  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(v => U.clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
  },
  // amt > 0 — светлее, < 0 — темнее
  shade(hex, amt) {
    if (!hex || hex[0] !== '#') return hex;
    const [r, g, b] = U.hexToRgb(hex);
    if (amt >= 0) return U.rgbToHex(r + (255 - r) * amt, g + (255 - g) * amt, b + (255 - b) * amt);
    return U.rgbToHex(r * (1 + amt), g * (1 + amt), b * (1 + amt));
  },
  rgba(hex, a) { const [r, g, b] = U.hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; },
  mix(h1, h2, t) {
    const a = U.hexToRgb(h1), b = U.hexToRgb(h2);
    return U.rgbToHex(U.lerp(a[0], b[0], t), U.lerp(a[1], b[1], t), U.lerp(a[2], b[2], t));
  },
  hsl: (h, s, l, a = 1) => `hsla(${h},${s}%,${l}%,${a})`,

  // ---------- геометрия ----------
  // Точка -> отрезок
  segDist(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1, dy = y2 - y1;
    const l2 = dx * dx + dy * dy;
    let t = l2 ? ((px - x1) * dx + (py - y1) * dy) / l2 : 0;
    t = U.clamp(t, 0, 1);
    return Math.hypot(px - (x1 + dx * t), py - (y1 + dy * t));
  },
  // Окружность vs прямоугольник: вектор выталкивания или null
  circleRect(cx, cy, r, x, y, w, h) {
    const nx = U.clamp(cx, x, x + w), ny = U.clamp(cy, y, y + h);
    let dx = cx - nx, dy = cy - ny;
    const d2 = dx * dx + dy * dy;
    if (d2 > r * r) return null;
    if (d2 > 1e-9) {
      const d = Math.sqrt(d2);
      return { nx: dx / d, ny: dy / d, depth: r - d };
    }
    // центр внутри прямоугольника — выталкиваем по ближайшей стороне
    const l = cx - x, rr = x + w - cx, t = cy - y, b = y + h - cy;
    const m = Math.min(l, rr, t, b);
    if (m === l) return { nx: -1, ny: 0, depth: r + l };
    if (m === rr) return { nx: 1, ny: 0, depth: r + rr };
    if (m === t) return { nx: 0, ny: -1, depth: r + t };
    return { nx: 0, ny: 1, depth: r + b };
  },
  rectsOverlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; },
  pointInRect(px, py, x, y, w, h) { return px >= x && px <= x + w && py >= y && py <= y + h; },

  // Гладкий шум для волнистости
  noise1(x) {
    const i = Math.floor(x), f = x - i;
    const h = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
    const u = f * f * (3 - 2 * f);
    return U.lerp(h(i), h(i + 1), u) * 2 - 1;
  },

  // ---------- рисование ----------
  roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  },
  starPath(ctx, cx, cy, spikes, outer, inner, rot = -Math.PI / 2) {
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 ? inner : outer;
      const a = rot + (i * Math.PI) / spikes;
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath();
  },

  // ---------- текст ----------
  wrapText(ctx, text, maxW) {
    const out = [];
    for (const para of String(text).split('\n')) {
      const words = para.split(' ');
      let line = '';
      for (const w of words) {
        const test = line ? line + ' ' + w : w;
        if (ctx.measureText(test).width > maxW && line) { out.push(line); line = w; }
        else line = test;
      }
      out.push(line);
    }
    return out;
  },

  // Размер Никиты в человеческих единицах
  formatSize(m) {
    const f = (v, u) => (v >= 100 ? Math.round(v) : v >= 10 ? v.toFixed(1) : v.toFixed(2)).toString().replace('.', ',') + ' ' + u;
    if (m < 1e-3) return f(m * 1e6, 'мкм');
    if (m < 1e-2) return f(m * 1e3, 'мм');
    if (m < 1) return f(m * 100, 'см');
    if (m < 1000) return f(m, 'м');
    if (m < 1e9) return Math.round(m / 1000).toLocaleString('ru-RU') + ' км';
    return f(m / 1e9, 'млн км');
  },
  formatTime(s) {
    s = Math.max(0, s);
    const m = Math.floor(s / 60), r = Math.floor(s % 60);
    return m + ':' + String(r).padStart(2, '0');
  },
};
