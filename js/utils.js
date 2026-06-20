/* =========================================================================
 *  utils.js  —  математика, рандом, easing, маленькі помічники
 *  Все максимально незалежне, щоб користуватись з будь-якого модуля.
 * ========================================================================= */

const TAU = Math.PI * 2;

function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }
function lerp(a, b, t) { return a + (b - a) * t; }
function invLerp(a, b, v) { return (v - a) / (b - a); }
function rand(min, max) { return min + Math.random() * (max - min); }
function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }
function chance(p) { return Math.random() < p; }

function dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }
function dist2(ax, ay, bx, by) { const dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; }
function angleTo(ax, ay, bx, by) { return Math.atan2(by - ay, bx - ax); }

// рух значення `cur` до `target` із кроком `step` (без перельоту)
function approach(cur, target, step) {
  if (cur < target) return Math.min(cur + step, target);
  if (cur > target) return Math.max(cur - step, target);
  return cur;
}

// плавне експоненційне згладжування (frame-rate independent-ish)
function damp(cur, target, smoothing, dt) {
  return lerp(cur, target, 1 - Math.pow(smoothing, dt));
}

/* ----------------------------- Easing -------------------------------- */
const Ease = {
  linear: t => t,
  inQuad: t => t * t,
  outQuad: t => 1 - (1 - t) * (1 - t),
  inOutQuad: t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  outCubic: t => 1 - Math.pow(1 - t, 3),
  inOutCubic: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outBack: t => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  outElastic: t => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  outBounce: t => {
    const n1 = 7.5625, d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
  inOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
};

/* --------------------------- Кольори --------------------------------- */
function hsl(h, s, l, a = 1) { return `hsla(${h}, ${s}%, ${l}%, ${a})`; }
function rgba(r, g, b, a = 1) { return `rgba(${r|0}, ${g|0}, ${b|0}, ${a})`; }

// мікс двох hex-кольорів (#rrggbb) за t
function mixHex(c1, c2, t) {
  const a = parseInt(c1.slice(1), 16), b = parseInt(c2.slice(1), 16);
  const r = lerp((a >> 16) & 255, (b >> 16) & 255, t);
  const g = lerp((a >> 8) & 255, (b >> 8) & 255, t);
  const bl = lerp(a & 255, b & 255, t);
  return rgba(r, g, bl, 1);
}

/* --------------------- Площа / маса блоба ---------------------------- */
// Нікіта росте за масою: площа кола ~ r^2.
function areaOf(r) { return Math.PI * r * r; }
function radiusFromArea(a) { return Math.sqrt(a / Math.PI); }

/* ----------------------- Простий таймер ------------------------------ */
class Timer {
  constructor(duration) { this.duration = duration; this.t = 0; this.done = false; }
  reset(duration) { if (duration != null) this.duration = duration; this.t = 0; this.done = false; }
  // повертає прогрес 0..1
  update(dt) {
    if (this.done) return 1;
    this.t += dt;
    if (this.t >= this.duration) { this.t = this.duration; this.done = true; }
    return this.duration <= 0 ? 1 : this.t / this.duration;
  }
  get progress() { return this.duration <= 0 ? 1 : clamp(this.t / this.duration, 0, 1); }
}

/* ---------------- Детермінований шум (для тла) ----------------------- */
function hash2(x, y) {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967295;
}
