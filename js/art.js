/* =========================================================================
 *  art.js  —  ВСЯ графіка в коді (без картинок), покращена версія.
 *  Нікіта-монстр, люди-вчені/військові, істоти-боси, вороги та "їжа".
 *  Art.figure(ctx, key, x, y, r, state) малює будь-кого за ключем:
 *    спочатку CHARS (люди), потім CREATURES (істоти/техніка), потім PROPS.
 * ========================================================================= */

const Art = (() => {

  /* ----------------------------- примітиви --------------------------- */
  function shadow(ctx, x, y, rx, ry, alpha = 0.25) {
    ctx.save();
    const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry));
    g.addColorStop(0, `rgba(0,0,0,${alpha})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.fill();
    ctx.restore();
  }
  function roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }
  function circle(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); }
  function star(ctx, x, y, spikes, outer, inner, rot = 0) {
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const rr = i % 2 ? inner : outer;
      const a = rot + (i / (spikes * 2)) * TAU;
      const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.closePath();
  }
  // хвилясте коло (гель/мембрана)
  function blob(ctx, r, t, amp = 0.06, n = 24, sd = 0) {
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * TAU;
      const w = 1 + amp * Math.sin(a * 3 + t * 2 + sd) + amp * 0.6 * Math.sin(a * 5 - t * 1.5);
      const px = Math.cos(a) * r * w, py = Math.sin(a) * r * w;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.closePath();
  }
  function eyes(ctx, ex, ey, er, look = 0, lookY = 0, angry = 0) {
    for (const sx of [-1, 1]) {
      ctx.fillStyle = '#fff';
      circle(ctx, sx * ex, ey, er); ctx.fill();
      ctx.fillStyle = '#1a1320';
      circle(ctx, sx * ex + look, ey + lookY, er * 0.5); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      circle(ctx, sx * ex + look - er * 0.2, ey + lookY - er * 0.2, er * 0.18); ctx.fill();
      if (angry) {
        ctx.strokeStyle = '#000'; ctx.lineWidth = er * 0.3; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(sx * ex - er, ey - er * 1.1);
        ctx.lineTo(sx * ex + er * 0.4, ey - er * 0.5); ctx.stroke();
      }
    }
  }

  /* =================================================================== *
   *  НІКІТА
   * =================================================================== */
  function nikita(ctx, x, y, r, opts = {}) {
    const dir = opts.dir || 0;
    const t = opts.wobble || 0;
    const chomp = opts.chomp || 0;
    const hue = opts.hue ?? 285;
    const smart = opts.smart || 0;     // після Давіда — окуляри/аура «розуму»
    const img = opts.img && opts.img.complete && opts.img.naturalWidth ? opts.img : null;

    ctx.save();
    ctx.translate(x, y);

    // зовнішня аура
    ctx.save();
    const aura = ctx.createRadialGradient(0, 0, r * 0.7, 0, 0, r * 1.5);
    aura.addColorStop(0, hsl(hue, 90, 60, 0.0));
    aura.addColorStop(0.7, hsl(hue, 90, 60, 0.18 + 0.08 * Math.sin(t * 3)));
    aura.addColorStop(1, hsl(hue, 90, 60, 0));
    ctx.fillStyle = aura; circle(ctx, 0, 0, r * 1.5); ctx.fill();
    ctx.restore();

    shadow(ctx, 0, r * 0.85, r * 1.0, r * 0.32, 0.3);

    // тіло
    blob(ctx, r, t, 0.07);
    const g = ctx.createRadialGradient(-r * 0.3, -r * 0.4, r * 0.15, 0, 0, r * 1.2);
    g.addColorStop(0, hsl(hue, 90, 72)); g.addColorStop(0.55, hsl(hue, 82, 54));
    g.addColorStop(1, hsl(hue + 12, 78, 30));
    ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = r * 0.05; ctx.strokeStyle = hsl(hue + 15, 70, 22); ctx.stroke();

    // внутрішнє світіння
    ctx.save(); blob(ctx, r * 0.92, t, 0.07); ctx.clip();
    const inner = ctx.createRadialGradient(0, r * 0.3, r * 0.1, 0, r * 0.3, r);
    inner.addColorStop(0, hsl(hue, 100, 70, 0.5)); inner.addColorStop(1, hsl(hue, 100, 70, 0));
    ctx.fillStyle = inner; ctx.fillRect(-r, -r, r * 2, r * 2); ctx.restore();

    // глянець
    ctx.fillStyle = 'rgba(255,255,255,0.32)';
    circle(ctx, -r * 0.34, -r * 0.42, r * 0.17); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    circle(ctx, -r * 0.1, -r * 0.55, r * 0.08); ctx.fill();

    // фото-обличчя
    if (img) {
      ctx.save(); circle(ctx, 0, -r * 0.05, r * 0.64); ctx.clip();
      const s = r * 1.5; ctx.drawImage(img, -s / 2, -r * 0.05 - s / 2, s, s); ctx.restore();
      ctx.lineWidth = r * 0.05; ctx.strokeStyle = hsl(hue + 10, 70, 30);
      circle(ctx, 0, -r * 0.05, r * 0.64); ctx.stroke();
    }

    // очі
    const eyeY = img ? -r * 0.62 : -r * 0.18;
    eyes(ctx, r * 0.34, eyeY, r * 0.2, Math.cos(dir) * r * 0.08, Math.sin(dir) * r * 0.08);

    // окуляри «розуму» після Давіда
    if (smart > 0) {
      ctx.strokeStyle = `rgba(220,240,255,${smart})`; ctx.lineWidth = r * 0.05;
      for (const sx of [-1, 1]) { circle(ctx, sx * r * 0.34, eyeY, r * 0.26); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(-r * 0.08, eyeY); ctx.lineTo(r * 0.08, eyeY); ctx.stroke();
    }

    // паща
    const mouthY = img ? r * 0.38 : r * 0.34;
    const open = (0.18 + chomp * 0.55) * r;
    ctx.save(); ctx.translate(0, mouthY);
    ctx.fillStyle = '#2a0d1a';
    ctx.beginPath(); ctx.ellipse(0, 0, r * 0.5, open, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#e0436b';
    ctx.beginPath(); ctx.ellipse(0, open * 0.45, r * 0.34, open * 0.5, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#fff';
    const teeth = 7;
    for (let i = 0; i < teeth; i++) {
      const tx = lerp(-r * 0.44, r * 0.44, i / (teeth - 1));
      ctx.beginPath(); ctx.moveTo(tx - r * 0.05, -open); ctx.lineTo(tx + r * 0.05, -open); ctx.lineTo(tx, -open + r * 0.16); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(tx - r * 0.05, open); ctx.lineTo(tx + r * 0.05, open); ctx.lineTo(tx, open - r * 0.16); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    ctx.restore();
  }

  /* =================================================================== *
   *  ЛЮДИНА (білбордний спрайт) — підтримує багато аксесуарів
   * =================================================================== */
  function human(ctx, x, y, r, def, state = {}) {
    const t = state.t || 0;
    const panic = clamp(state.panic || 0, 0, 1);
    const bob = Math.sin(t * 3 + (def._ph || 0)) * r * 0.05 * (1 - panic) + (panic ? Math.sin(t * 26) * r * 0.06 : 0);
    const headR = r * 0.62;
    const shoulderY = -r * 0.05;
    const headCY = -r * 0.78 + bob;

    ctx.save();
    ctx.translate(x, y + bob * 0.2);
    shadow(ctx, 0, r * 1.2, r * 0.85, r * 0.26, 0.28);

    // ноги
    ctx.strokeStyle = def.pants || '#2b2f3a'; ctx.lineWidth = r * 0.18; ctx.lineCap = 'round';
    for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * r * 0.22, r * 0.55); ctx.lineTo(sx * r * 0.26, r * 1.12); ctx.stroke(); }
    ctx.fillStyle = '#15171d';
    for (const sx of [-1, 1]) { roundRect(ctx, sx * r * 0.26 - r * 0.16, r * 1.05, r * 0.34, r * 0.18, r * 0.08); ctx.fill(); }

    // руки
    const armSwing = panic ? Math.sin(t * 22) * 0.9 : Math.sin(t * 3 + 1) * 0.18;
    ctx.strokeStyle = def.coat; ctx.lineWidth = r * 0.22;
    for (const sx of [-1, 1]) {
      const a = -Math.PI / 2 + sx * (0.5 + (panic ? 1.1 : 0) + armSwing * sx);
      const hx = sx * r * 0.42, hy = shoulderY + r * 0.15;
      const ex = hx + Math.cos(a) * r * 0.7, ey = hy + Math.sin(a) * r * 0.7;
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.fillStyle = def.skin; circle(ctx, ex, ey, r * 0.13); ctx.fill();
      ctx.strokeStyle = def.coat;
    }

    // тулуб
    const bodyGrad = ctx.createLinearGradient(-r * 0.5, 0, r * 0.5, 0);
    bodyGrad.addColorStop(0, shade(def.coat, -18)); bodyGrad.addColorStop(0.5, def.coat); bodyGrad.addColorStop(1, shade(def.coat, -10));
    ctx.fillStyle = bodyGrad;
    roundRect(ctx, -r * 0.5, shoulderY, r, r * 1.15, r * 0.22); ctx.fill();
    if (def.camo) { // камуфляжні плями
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      for (let i = 0; i < 6; i++) { circle(ctx, rand(-r * 0.4, r * 0.4), shoulderY + rand(0.1, 1.0) * r, r * 0.12); ctx.fill(); }
    }
    // комір/сорочка
    ctx.fillStyle = def.shirt;
    ctx.beginPath(); ctx.moveTo(-r * 0.18, shoulderY); ctx.lineTo(0, shoulderY + r * 0.5); ctx.lineTo(r * 0.18, shoulderY); ctx.closePath(); ctx.fill();
    if (def.tie) { ctx.fillStyle = def.tie; ctx.beginPath(); ctx.moveTo(0, shoulderY + r * 0.18); ctx.lineTo(r * 0.08, shoulderY + r * 0.36); ctx.lineTo(0, shoulderY + r * 0.8); ctx.lineTo(-r * 0.08, shoulderY + r * 0.36); ctx.closePath(); ctx.fill(); }
    ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = r * 0.03;
    ctx.beginPath(); ctx.moveTo(0, shoulderY + r * 0.5); ctx.lineTo(0, shoulderY + r * 1.1); ctx.stroke();

    if (def.apron) { ctx.fillStyle = def.apron; roundRect(ctx, -r * 0.3, shoulderY + r * 0.35, r * 0.6, r * 0.8, r * 0.1); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = r * 0.03; ctx.strokeRect(-r * 0.24, shoulderY + r * 0.45, r * 0.48, r * 0.6); }
    if (def.epaulettes) { ctx.fillStyle = '#ffd84d'; roundRect(ctx, -r * 0.52, shoulderY + r * 0.02, r * 0.2, r * 0.1, r * 0.03); roundRect(ctx, r * 0.32, shoulderY + r * 0.02, r * 0.2, r * 0.1, r * 0.03); ctx.fill(); }
    if (def.medals) { for (let i = 0; i < 3; i++) { ctx.fillStyle = ['#e0556b', '#ffd84d', '#4e8be8'][i]; circle(ctx, -r * 0.3 + i * r * 0.14, shoulderY + r * 0.4, r * 0.05); ctx.fill(); } }

    // бейдж
    ctx.fillStyle = '#e9eef5'; roundRect(ctx, r * 0.16, shoulderY + r * 0.34, r * 0.22, r * 0.16, r * 0.03); ctx.fill();
    ctx.fillStyle = def.shirt; ctx.fillRect(r * 0.19, shoulderY + r * 0.37, r * 0.16, r * 0.04);

    // шия
    ctx.fillStyle = def.skin; roundRect(ctx, -r * 0.14, headCY + headR * 0.7, r * 0.28, r * 0.3, r * 0.06); ctx.fill();

    // голова
    const hr = headR * (def.brain ? 1.18 : 1);
    const skinG = ctx.createRadialGradient(-hr * 0.2, headCY - hr * 0.2, hr * 0.2, 0, headCY, hr);
    skinG.addColorStop(0, shade(def.skin, 12)); skinG.addColorStop(1, def.skin);
    ctx.fillStyle = skinG; circle(ctx, 0, headCY, hr); ctx.fill();
    ctx.fillStyle = def.skin; for (const sx of [-1, 1]) { circle(ctx, sx * hr, headCY + hr * 0.05, hr * 0.18); ctx.fill(); }

    drawHair(ctx, headCY, hr, def);
    if (def.brain) drawBrain(ctx, headCY, hr, t);
    drawFace(ctx, headCY, hr, def, t, panic);

    if (def.glasses) drawGlasses(ctx, headCY, hr, def.glasses);
    if (def.visor) { // високотех. візор Давіда
      ctx.fillStyle = 'rgba(20,30,50,0.85)';
      roundRect(ctx, -hr * 0.7, headCY - hr * 0.2, hr * 1.4, hr * 0.42, hr * 0.2); ctx.fill();
      const vg = ctx.createLinearGradient(-hr * 0.7, 0, hr * 0.7, 0);
      vg.addColorStop(0, def.visor); vg.addColorStop(0.5, '#fff'); vg.addColorStop(1, def.visor);
      ctx.globalAlpha = 0.5 + 0.3 * Math.sin(t * 4); ctx.fillStyle = vg;
      roundRect(ctx, -hr * 0.62, headCY - hr * 0.12, hr * 1.24, hr * 0.2, hr * 0.1); ctx.fill(); ctx.globalAlpha = 1;
    }
    if (def.mustache) drawMustache(ctx, headCY, hr, def);
    if (def.beard) { ctx.fillStyle = def.hair; ctx.beginPath(); ctx.moveTo(-hr * 0.6, headCY + hr * 0.1); ctx.quadraticCurveTo(-hr * 0.5, headCY + hr * 1.05, 0, headCY + hr * 1.1); ctx.quadraticCurveTo(hr * 0.5, headCY + hr * 1.05, hr * 0.6, headCY + hr * 0.1); ctx.quadraticCurveTo(0, headCY + hr * 0.55, -hr * 0.6, headCY + hr * 0.1); ctx.fill(); }
    if (def.helmet) drawHelmet(ctx, headCY, hr, def.helmet, def.helmetStar);
    if (def.peakCap) drawPeakCap(ctx, headCY, hr, def.peakCap, def.capBadge);
    if (def.cap) { ctx.fillStyle = def.cap; ctx.beginPath(); ctx.ellipse(0, headCY - hr * 0.75, hr * 0.7, hr * 0.35, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#e74c6f'; circle(ctx, 0, headCY - hr * 0.95, hr * 0.12); ctx.fill(); }

    if (panic > 0.3) { ctx.fillStyle = 'rgba(120,200,255,0.85)'; const sw = (Math.sin(t * 8) * 0.5 + 0.5); circle(ctx, hr * 0.7, headCY - hr * 0.1 + sw * r * 0.3, hr * 0.12 * sw); ctx.fill(); }
    ctx.restore();
  }

  function drawBrain(ctx, cy, hr, t) {
    ctx.save(); ctx.translate(0, cy - hr * 0.55);
    const pg = ctx.createRadialGradient(0, 0, 1, 0, 0, hr * 0.9);
    pg.addColorStop(0, 'rgba(255,150,200,0.9)'); pg.addColorStop(1, 'rgba(255,90,160,0)');
    ctx.fillStyle = pg; circle(ctx, 0, 0, hr * 0.9 + Math.sin(t * 3) * hr * 0.05); ctx.fill();
    ctx.fillStyle = '#ff9ecb';
    ctx.beginPath(); ctx.ellipse(-hr * 0.22, 0, hr * 0.3, hr * 0.34, 0, 0, TAU); ctx.ellipse(hr * 0.22, 0, hr * 0.3, hr * 0.34, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#d65b97'; ctx.lineWidth = hr * 0.04;
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc((i < 2 ? -1 : 1) * hr * 0.22, 0, hr * (0.1 + 0.07 * (i % 2)), 0, Math.PI); ctx.stroke(); }
    ctx.restore();
  }
  function drawGlasses(ctx, cy, hr, color) {
    ctx.strokeStyle = color === true ? '#222' : color; ctx.lineWidth = hr * 0.07; ctx.fillStyle = 'rgba(180,220,255,0.25)';
    for (const sx of [-1, 1]) { circle(ctx, sx * hr * 0.36, cy - hr * 0.02, hr * 0.27); ctx.fill(); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(-hr * 0.12, cy - hr * 0.02); ctx.lineTo(hr * 0.12, cy - hr * 0.02); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-hr * 0.62, cy - hr * 0.05); ctx.lineTo(-hr * 0.9, cy - hr * 0.1); ctx.moveTo(hr * 0.62, cy - hr * 0.05); ctx.lineTo(hr * 0.9, cy - hr * 0.1); ctx.stroke();
  }
  function drawMustache(ctx, cy, hr, def) {
    ctx.fillStyle = def.mustache === true ? def.hair : def.mustache;
    ctx.beginPath(); ctx.moveTo(0, cy + hr * 0.42);
    ctx.quadraticCurveTo(-hr * 0.45, cy + hr * 0.28, -hr * 0.55, cy + hr * 0.5);
    ctx.quadraticCurveTo(-hr * 0.35, cy + hr * 0.5, 0, cy + hr * 0.5);
    ctx.quadraticCurveTo(hr * 0.35, cy + hr * 0.5, hr * 0.55, cy + hr * 0.5);
    ctx.quadraticCurveTo(hr * 0.45, cy + hr * 0.28, 0, cy + hr * 0.42); ctx.fill();
  }
  function drawHelmet(ctx, cy, hr, color, withStar) {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(0, cy, hr * 1.12, Math.PI * 1.02, Math.PI * 1.98);
    ctx.lineTo(hr * 1.1, cy - hr * 0.06); ctx.lineTo(-hr * 1.1, cy - hr * 0.06); ctx.closePath(); ctx.fill();
    ctx.fillStyle = shade(color, -25); ctx.fillRect(-hr * 1.12, cy - hr * 0.12, hr * 2.24, hr * 0.1);
    if (withStar) { ctx.fillStyle = '#ffd84d'; star(ctx, 0, cy - hr * 0.7, 5, hr * 0.2, hr * 0.09, -Math.PI / 2); ctx.fill(); }
  }
  function drawPeakCap(ctx, cy, hr, color, badge) {
    ctx.fillStyle = shade(color, -10); // козирок
    ctx.beginPath(); ctx.ellipse(0, cy - hr * 0.45, hr * 1.05, hr * 0.28, 0, 0, Math.PI); ctx.fill();
    ctx.fillStyle = color; // тулія
    ctx.beginPath(); ctx.arc(0, cy - hr * 0.5, hr * 0.95, Math.PI, TAU); ctx.fill();
    ctx.fillRect(-hr * 0.95, cy - hr * 0.55, hr * 1.9, hr * 0.12);
    ctx.fillStyle = badge || '#ffd84d'; circle(ctx, 0, cy - hr * 0.75, hr * 0.14); ctx.fill();
  }
  function drawHair(ctx, cy, hr, def) {
    ctx.fillStyle = def.hair;
    switch (def.hairStyle) {
      case 'bald': break;
      case 'short': ctx.beginPath(); ctx.arc(0, cy, hr * 1.02, Math.PI * 1.08, Math.PI * 1.92); ctx.quadraticCurveTo(hr * 0.9, cy - hr * 0.2, hr * 0.7, cy - hr * 0.55); ctx.quadraticCurveTo(0, cy - hr * 1.05, -hr * 0.7, cy - hr * 0.55); ctx.quadraticCurveTo(-hr * 0.9, cy - hr * 0.2, -hr * 1.02, cy - hr * 0.1); ctx.fill(); break;
      case 'spiky': ctx.beginPath(); for (let i = 0; i <= 10; i++) { const a = Math.PI + (i / 10) * Math.PI; const sp = i % 2 ? 1.32 : 1.0; ctx.lineTo(Math.cos(a) * hr * 1.02, cy + Math.sin(a) * hr * sp); } ctx.lineTo(hr, cy); ctx.lineTo(-hr, cy); ctx.fill(); break;
      case 'curly': for (let i = 0; i < 9; i++) { const a = Math.PI + (i / 8) * Math.PI; circle(ctx, Math.cos(a) * hr * 0.92, cy + Math.sin(a) * hr * 0.92, hr * 0.3); ctx.fill(); } break;
      case 'flat': ctx.beginPath(); ctx.arc(0, cy, hr * 1.02, Math.PI, TAU); ctx.fill(); ctx.fillRect(-hr * 1.02, cy - hr * 0.1, hr * 2.04, hr * 0.18); break;
      case 'slick': ctx.beginPath(); ctx.arc(0, cy, hr * 1.02, Math.PI * 1.02, Math.PI * 1.98); ctx.quadraticCurveTo(hr * 0.9, cy - hr * 0.75, 0, cy - hr * 0.82); ctx.quadraticCurveTo(-hr * 0.5, cy - hr * 0.85, -hr * 1.0, cy - hr * 0.2); ctx.fill(); ctx.strokeStyle = shade(def.hair, 20); ctx.lineWidth = hr * 0.05; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-hr * 0.7 + i * hr * 0.2, cy - hr * 0.5); ctx.quadraticCurveTo(0, cy - hr * 0.9, hr * 0.85, cy - hr * 0.4); ctx.stroke(); } break;
      case 'sidepart': ctx.beginPath(); ctx.arc(0, cy, hr * 1.02, Math.PI * 1.05, Math.PI * 1.95); ctx.quadraticCurveTo(hr * 0.6, cy - hr * 0.6, -hr * 0.2, cy - hr * 0.7); ctx.quadraticCurveTo(-hr * 0.9, cy - hr * 0.7, -hr * 1.0, cy - hr * 0.1); ctx.fill(); break;
      case 'long': ctx.beginPath(); ctx.arc(0, cy, hr * 1.05, Math.PI * 0.92, Math.PI * 2.08); ctx.lineTo(hr * 0.9, cy + hr * 0.9); ctx.quadraticCurveTo(hr * 0.4, cy + hr * 0.4, 0, cy + hr * 0.5); ctx.quadraticCurveTo(-hr * 0.4, cy + hr * 0.4, -hr * 0.9, cy + hr * 0.9); ctx.fill(); break;
      default: ctx.beginPath(); ctx.arc(0, cy, hr * 1.02, Math.PI, TAU); ctx.fill();
    }
  }
  function drawFace(ctx, cy, hr, def, t, panic) {
    const blink = (Math.sin(t * 1.3 + (def._ph || 0)) > 0.97) ? 0.15 : 1;
    const eyeY = cy - hr * 0.02, eyeX = hr * 0.36, wide = panic;
    for (const sx of [-1, 1]) {
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(sx * eyeX, eyeY, hr * (0.18 + wide * 0.05), hr * (0.2 + wide * 0.06) * blink, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#23303a'; const look = panic ? Math.sin(t * 18) * hr * 0.05 : Math.sin(t * 0.7) * hr * 0.04;
      circle(ctx, sx * eyeX + look, eyeY + (panic ? -hr * 0.03 : 0), hr * 0.09 * blink + hr * 0.02); ctx.fill();
    }
    ctx.strokeStyle = def.brow || def.hair; ctx.lineWidth = hr * 0.08; ctx.lineCap = 'round';
    for (const sx of [-1, 1]) { ctx.beginPath(); const by = eyeY - hr * (0.28 + panic * 0.12); ctx.moveTo(sx * eyeX - hr * 0.16, by + (panic ? sx * hr * 0.1 : 0)); ctx.lineTo(sx * eyeX + hr * 0.16, by - (panic ? sx * hr * 0.06 : 0)); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = hr * 0.05; ctx.beginPath(); ctx.moveTo(0, eyeY + hr * 0.1); ctx.lineTo(hr * 0.06, eyeY + hr * 0.3); ctx.lineTo(-hr * 0.05, eyeY + hr * 0.33); ctx.stroke();
    const my = cy + hr * 0.5;
    if (panic > 0.4) { ctx.fillStyle = '#7a2a36'; ctx.beginPath(); ctx.ellipse(0, my, hr * 0.18, hr * 0.24, 0, 0, TAU); ctx.fill(); }
    else { ctx.strokeStyle = '#9a4b4b'; ctx.lineWidth = hr * 0.06; ctx.beginPath(); ctx.moveTo(-hr * 0.22, my); ctx.quadraticCurveTo(0, my + hr * 0.18 * (def.smile ?? 1), hr * 0.22, my); ctx.stroke(); }
  }

  /* =================================================================== *
   *  Персонажі-люди
   * =================================================================== */
  const CHARS = {
    egor: { name: 'Єгор', skin: '#f0c39b', hair: '#5a3a22', hairStyle: 'short', coat: '#f4f6fb', shirt: '#3b7dd8', glasses: true, smile: 1, _ph: 0.0 },
    danya: { name: 'Даня', skin: '#f3cda6', hair: '#caa23a', hairStyle: 'spiky', coat: '#eef3f7', shirt: '#e0556b', smile: 1.2, _ph: 1.2 },
    pilipyuk: { name: 'Пилипюк', skin: '#e9b489', hair: '#3a2a1c', hairStyle: 'sidepart', coat: '#f4f6fb', shirt: '#2fae72', mustache: true, smile: 0.8, _ph: 2.1 },
    dima: { name: 'Діма', skin: '#f0c094', hair: '#1d1d24', hairStyle: 'flat', coat: '#eef2f8', shirt: '#8a55d6', glasses: '#444', smile: 0.9, _ph: 3.0 },
    kirill: { name: 'Кирило', skin: '#f2c39a', hair: '#7a5230', hairStyle: 'short', coat: '#f6f8fc', shirt: '#f2a93b', helmet: '#4db6e8', helmetStar: true, smile: 1.6, brow: '#7a5230', _ph: 0.6 },
    natasha: { name: 'Наташа', skin: '#f6cda8', hair: '#8a4b2a', hairStyle: 'long', coat: '#ffffff', shirt: '#d44f86', apron: '#f7c7d8', cap: '#ffffff', smile: 1.1, _ph: 1.7 },
    molgelevich: { name: 'Молгелевич', skin: '#dfe7c0', hair: '#dddddd', hairStyle: 'bald', coat: '#2a2f3e', shirt: '#9b5de5', glasses: '#9b5de5', brain: true, smile: -0.6, brow: '#777', _ph: 2.6 },
    // нові
    guard: { name: 'Охоронець', skin: '#e7b58a', hair: '#26201a', hairStyle: 'short', coat: '#2d3550', shirt: '#1c2238', pants: '#1c2238', peakCap: '#222a40', capBadge: '#ffd84d', tie: '#11151f', smile: -0.2, brow: '#26201a', _ph: 0.9 },
    assistant: { name: 'Асистент', skin: '#f0c49a', hair: '#4a3424', hairStyle: 'curly', coat: '#eef3f7', shirt: '#46b39a', glasses: true, smile: 0.6, _ph: 1.4 },
    soldier: { name: 'Солдат', skin: '#dcae84', hair: '#2a2018', hairStyle: 'short', coat: '#5a6a3a', shirt: '#465230', pants: '#3c4628', helmet: '#4a5530', camo: true, smile: -0.3, brow: '#2a2018', _ph: 0.3 },
    general: { name: 'Генерал', skin: '#e0b488', hair: '#cfcfcf', hairStyle: 'short', coat: '#4a5238', shirt: '#3a4230', peakCap: '#3a4230', capBadge: '#ffd84d', mustache: '#cfcfcf', medals: true, epaulettes: true, smile: -0.5, brow: '#aaa', _ph: 2.2 },
    david: { name: 'Давід', skin: '#e9c39a', hair: '#1a1a22', hairStyle: 'slick', coat: '#181a26', shirt: '#0e0f18', tie: '#c0392b', visor: '#ff4d6d', smile: -0.7, brow: '#1a1a22', _ph: 1.1 },
  };

  /* =================================================================== *
   *  ІСТОТИ та ТЕХНІКА (боси й вороги)  draw(ctx, r, state)
   * =================================================================== */
  function germBody(ctx, r, t, baseHue, sat = 60) {
    blob(ctx, r, t, 0.08, 26);
    const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.2, 0, 0, r * 1.1);
    g.addColorStop(0, hsl(baseHue, sat, 62)); g.addColorStop(1, hsl(baseHue, sat, 34));
    ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = r * 0.05; ctx.strokeStyle = hsl(baseHue, sat, 24); ctx.stroke();
  }
  const CREATURES = {
    superbug: { name: 'Супербактерія', draw(ctx, r, st) {
      const t = st.t || 0;
      ctx.strokeStyle = hsl(120, 50, 40); ctx.lineWidth = r * 0.06; ctx.lineCap = 'round';
      for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); ctx.lineTo(Math.cos(a) * r * (1.35 + 0.1 * Math.sin(t * 4 + i)), Math.sin(a) * r * (1.35 + 0.1 * Math.cos(t * 4 + i))); ctx.stroke(); }
      germBody(ctx, r, t, 110, 55);
      ctx.fillStyle = hsl(110, 50, 28); for (let i = 0; i < 5; i++) { circle(ctx, rand(-r * 0.4, r * 0.4), rand(-r * 0.3, r * 0.4), r * 0.1); ctx.fill(); }
      eyes(ctx, r * 0.3, -r * 0.15, r * 0.18, 0, 0, st.panic > 0.4 ? 0 : 1);
      ctx.fillStyle = '#3a0d18'; ctx.beginPath(); ctx.ellipse(0, r * 0.35, r * 0.3, r * 0.16 + (st.panic || 0) * r * 0.1, 0, 0, TAU); ctx.fill();
    }},
    virusboss: { name: 'Вірус-Альфа', draw(ctx, r, st) { virusShape(ctx, r, st, 282, true); } },
    virus:     { name: 'Вірус',       draw(ctx, r, st) { virusShape(ctx, r, st, 150, false); } },
    spore: { name: 'Спора-Гігант', draw(ctx, r, st) {
      const t = st.t || 0;
      ctx.strokeStyle = 'rgba(180,255,230,0.5)'; ctx.lineWidth = r * 0.03;
      for (let i = 0; i < 18; i++) { const a = (i / 18) * TAU + t * 0.2; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.9); ctx.lineTo(Math.cos(a) * r * 1.3, Math.sin(a) * r * 1.3); ctx.stroke(); }
      germBody(ctx, r, t, 165, 45);
      ctx.fillStyle = hsl(165, 45, 30); circle(ctx, 0, 0, r * 0.45); ctx.fill();
      eyes(ctx, r * 0.26, -r * 0.05, r * 0.16, Math.sin(t) * r * 0.05);
    }},
    rat: { name: 'Пацюк', draw(ctx, r, st) {
      const t = st.t || 0;
      shadow(ctx, 0, r * 0.55, r * 0.9, r * 0.22, 0.25);
      ctx.strokeStyle = '#9a8a86'; ctx.lineWidth = r * 0.08; ctx.beginPath(); ctx.moveTo(-r * 0.8, r * 0.2); ctx.quadraticCurveTo(-r * 1.5, Math.sin(t * 5) * r * 0.3, -r * 1.6, -r * 0.2); ctx.stroke();
      ctx.fillStyle = '#7d7470'; ctx.beginPath(); ctx.ellipse(0, 0, r * 0.85, r * 0.6, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(r * 0.7, -r * 0.15, r * 0.45, r * 0.4, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#e7a6c4'; circle(ctx, r * 0.55, -r * 0.55, r * 0.2); circle(ctx, r * 0.95, -r * 0.45, r * 0.2); ctx.fill();
      ctx.fillStyle = '#1a1320'; circle(ctx, r * 0.95, -r * 0.12, r * 0.08); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.fillRect(r * 1.05, r * 0.0, r * 0.18, r * 0.12);
      eyes(ctx, r * 0.18, -r * 0.18, r * 0.1, 0, 0, 1); // зум зміщено праворуч приблизно
    }},
    colossus: { name: 'Хмарочос-Колос', draw(ctx, r, st) {
      const t = st.t || 0;
      shadow(ctx, 0, r * 1.0, r * 0.9, r * 0.2, 0.35);
      ctx.fillStyle = '#5b6577'; roundRect(ctx, -r * 0.62, -r, r * 1.24, r * 2, r * 0.05); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(-r * 0.62, -r, r * 0.3, r * 2);
      for (let yy = -0.8; yy < 0.85; yy += 0.26) for (let xx = -0.4; xx <= 0.4; xx += 0.27) { ctx.fillStyle = hash2((xx * 99) | 0, ((yy * 99) | 0)) > 0.5 ? hsl(48, 90, 70) : 'rgba(30,38,52,0.9)'; ctx.fillRect(xx * r - r * 0.09, yy * r - r * 0.09, r * 0.18, r * 0.22); }
      // світні очі-вікна та паща-вхід
      ctx.fillStyle = '#ff5a6e'; const gl = 0.6 + 0.4 * Math.sin(t * 4);
      ctx.globalAlpha = gl; circle(ctx, -r * 0.22, -r * 0.4, r * 0.12); circle(ctx, r * 0.22, -r * 0.4, r * 0.12); ctx.fill(); ctx.globalAlpha = 1;
      ctx.fillStyle = '#1a0306'; roundRect(ctx, -r * 0.3, r * 0.4, r * 0.6, r * 0.5 + (st.panic || 0) * r * 0.2, r * 0.06); ctx.fill();
      ctx.fillStyle = '#fff'; for (let i = 0; i < 5; i++) { const xx = -r * 0.26 + i * r * 0.13; ctx.beginPath(); ctx.moveTo(xx, r * 0.4); ctx.lineTo(xx + r * 0.06, r * 0.4); ctx.lineTo(xx + r * 0.03, r * 0.55); ctx.closePath(); ctx.fill(); }
    }},
    tankboss: { name: 'Левіафан', draw(ctx, r, st) { tankShape(ctx, r, st, true); } },
    tank:     { name: 'Танк',     draw(ctx, r, st) { tankShape(ctx, r, st, false); } },
    mothership: { name: 'Матка прибульців', draw(ctx, r, st) {
      const t = st.t || 0;
      shadow(ctx, 0, r * 0.7, r * 1.1, r * 0.25, 0.3);
      // промінь
      if (st.beam) { ctx.save(); ctx.globalAlpha = 0.18 + 0.06 * Math.sin(t * 6); ctx.fillStyle = '#9CFFB2'; ctx.beginPath(); ctx.moveTo(-r * 0.3, r * 0.2); ctx.lineTo(r * 0.3, r * 0.2); ctx.lineTo(r * 1.1, r * 3); ctx.lineTo(-r * 1.1, r * 3); ctx.closePath(); ctx.fill(); ctx.restore(); }
      ctx.fillStyle = '#3a4f5a'; ctx.beginPath(); ctx.ellipse(0, r * 0.1, r * 1.2, r * 0.42, 0, 0, TAU); ctx.fill();
      const dome = ctx.createRadialGradient(-r * 0.2, -r * 0.3, r * 0.1, 0, 0, r * 0.7);
      dome.addColorStop(0, 'rgba(170,255,210,0.95)'); dome.addColorStop(1, 'rgba(40,120,90,0.9)');
      ctx.fillStyle = dome; ctx.beginPath(); ctx.ellipse(0, -r * 0.15, r * 0.65, r * 0.55, 0, Math.PI, TAU); ctx.fill();
      for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU + t; ctx.fillStyle = hsl((t * 120 + i * 40) % 360, 90, 60); circle(ctx, Math.cos(a) * r, r * 0.1 + Math.sin(a) * r * 0.32, r * 0.08); ctx.fill(); }
      ctx.fillStyle = '#0a1a14'; eyes(ctx, r * 0.22, -r * 0.2, r * 0.12, 0, 0, st.panic > 0.4 ? 0 : 1);
    }},
    ufo: { name: 'НЛО', draw(ctx, r, st) {
      const t = st.t || 0;
      ctx.fillStyle = '#3a4f5a'; ctx.beginPath(); ctx.ellipse(0, r * 0.1, r, r * 0.4, 0, 0, TAU); ctx.fill();
      const dome = ctx.createRadialGradient(0, -r * 0.2, r * 0.05, 0, 0, r * 0.5);
      dome.addColorStop(0, 'rgba(180,255,220,0.95)'); dome.addColorStop(1, 'rgba(40,120,90,0.8)');
      ctx.fillStyle = dome; ctx.beginPath(); ctx.ellipse(0, -r * 0.1, r * 0.5, r * 0.45, 0, Math.PI, TAU); ctx.fill();
      for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU + t * 2; ctx.fillStyle = hsl((t * 200 + i * 60) % 360, 90, 60); circle(ctx, Math.cos(a) * r * 0.8, r * 0.1 + Math.sin(a) * r * 0.28, r * 0.07); ctx.fill(); }
    }},
    alien: { name: 'Прибулець', draw(ctx, r, st) {
      const t = st.t || 0;
      shadow(ctx, 0, r * 0.9, r * 0.5, r * 0.16, 0.2);
      ctx.strokeStyle = '#5fae6e'; ctx.lineWidth = r * 0.12; ctx.lineCap = 'round';
      for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * r * 0.2, r * 0.3); ctx.lineTo(sx * r * 0.3, r * 0.9); ctx.stroke(); }
      ctx.fillStyle = '#6cc47e'; roundRect(ctx, -r * 0.3, -r * 0.1, r * 0.6, r * 0.6, r * 0.2); ctx.fill();
      const hg = ctx.createRadialGradient(-r * 0.15, -r * 0.6, r * 0.1, 0, -r * 0.45, r * 0.7);
      hg.addColorStop(0, '#9ee3a8'); hg.addColorStop(1, '#4f9e5e');
      ctx.fillStyle = hg; ctx.beginPath(); ctx.ellipse(0, -r * 0.45, r * 0.55, r * 0.7, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#0a0a12'; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx * r * 0.22, -r * 0.45, r * 0.16, r * 0.28, sx * 0.4, 0, TAU); ctx.fill(); }
      ctx.fillStyle = 'rgba(255,255,255,0.8)'; circle(ctx, -r * 0.26, -r * 0.55, r * 0.05); circle(ctx, r * 0.18, -r * 0.55, r * 0.05); ctx.fill();
    }},
    robot: { name: 'Робот-охоронець', draw(ctx, r, st) {
      const t = st.t || 0;
      shadow(ctx, 0, r * 1.0, r * 0.8, r * 0.2, 0.3);
      ctx.strokeStyle = '#566'; ctx.lineWidth = r * 0.16;
      for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * r * 0.3, r * 0.4); ctx.lineTo(sx * r * 0.34, r * 1.0); ctx.stroke(); }
      // корпус
      const bg = ctx.createLinearGradient(-r * 0.5, 0, r * 0.5, 0);
      bg.addColorStop(0, '#8a93a6'); bg.addColorStop(0.5, '#c3ccda'); bg.addColorStop(1, '#7d869a');
      ctx.fillStyle = bg; roundRect(ctx, -r * 0.55, -r * 0.4, r * 1.1, r * 1.0, r * 0.16); ctx.fill();
      ctx.strokeStyle = '#3a4150'; ctx.lineWidth = r * 0.04; roundRect(ctx, -r * 0.55, -r * 0.4, r * 1.1, r * 1.0, r * 0.16); ctx.stroke();
      // ядро
      ctx.fillStyle = hsl((t * 120) % 360, 90, 60); circle(ctx, 0, r * 0.1, r * 0.18); ctx.fill();
      // руки-гармати
      ctx.strokeStyle = '#7d869a'; ctx.lineWidth = r * 0.18;
      for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * r * 0.5, -r * 0.2); ctx.lineTo(sx * r * 0.85, r * 0.1); ctx.stroke(); ctx.fillStyle = '#3a4150'; circle(ctx, sx * r * 0.9, r * 0.12, r * 0.12); ctx.fill(); }
      // голова
      ctx.fillStyle = '#aab3c4'; roundRect(ctx, -r * 0.3, -r * 0.78, r * 0.6, r * 0.42, r * 0.1); ctx.fill();
      ctx.fillStyle = '#10131c'; roundRect(ctx, -r * 0.22, -r * 0.7, r * 0.44, r * 0.24, r * 0.06); ctx.fill();
      ctx.fillStyle = '#ff4d6d'; const ew = 0.5 + 0.5 * Math.sin(t * 5); circle(ctx, -r * 0.1, -r * 0.58, r * 0.05 + ew * r * 0.02); circle(ctx, r * 0.1, -r * 0.58, r * 0.05 + ew * r * 0.02); ctx.fill();
      ctx.strokeStyle = '#888'; ctx.lineWidth = r * 0.03; ctx.beginPath(); ctx.moveTo(0, -r * 0.78); ctx.lineTo(0, -r * 0.95); ctx.stroke(); ctx.fillStyle = '#ffd84d'; circle(ctx, 0, -r * 0.98, r * 0.05); ctx.fill();
    }},
    drone: { name: 'Дрон', draw(ctx, r, st) { droneShape(ctx, r, st, '#4e8be8'); } },
    guard_drone: { name: 'Сек’юриті-дрон', draw(ctx, r, st) { droneShape(ctx, r, st, '#e0556b'); } },
    turret: { name: 'Турель', draw(ctx, r, st) {
      const t = st.t || 0;
      shadow(ctx, 0, r * 0.7, r * 0.8, r * 0.2, 0.25);
      ctx.fillStyle = '#4a5560'; roundRect(ctx, -r * 0.7, r * 0.1, r * 1.4, r * 0.5, r * 0.1); ctx.fill();
      ctx.fillStyle = '#5a6570'; circle(ctx, 0, 0, r * 0.5); ctx.fill();
      const aim = st.aim || -Math.PI / 2;
      ctx.save(); ctx.rotate(aim + Math.PI / 2);
      ctx.fillStyle = '#3a4450'; roundRect(ctx, -r * 0.12, -r * 0.9, r * 0.24, r * 0.9, r * 0.05); ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#ff5a6e'; circle(ctx, 0, 0, r * 0.14); ctx.fill();
    }},
  };

  function virusShape(ctx, r, st, hue, boss) {
    const t = st.t || 0;
    const spikes = boss ? 14 : 10;
    ctx.fillStyle = hsl(hue, 65, 45);
    for (let i = 0; i < spikes; i++) {
      const a = (i / spikes) * TAU + t * 0.3;
      ctx.save(); ctx.rotate(a);
      ctx.beginPath(); ctx.moveTo(-r * 0.1, r * 0.85); ctx.lineTo(r * 0.1, r * 0.85); ctx.lineTo(0, r * 1.35); ctx.closePath(); ctx.fill();
      ctx.fillStyle = hsl(hue, 70, 60); circle(ctx, 0, r * 1.35, r * 0.1); ctx.fill();
      ctx.fillStyle = hsl(hue, 65, 45);
      ctx.restore();
    }
    germBody(ctx, r, t, hue, 60);
    eyes(ctx, r * 0.28, -r * 0.1, r * 0.16, Math.sin(t * 2) * r * 0.05, 0, 1);
    ctx.fillStyle = '#1a0510'; ctx.beginPath();
    ctx.moveTo(-r * 0.3, r * 0.35); ctx.quadraticCurveTo(0, r * 0.2, r * 0.3, r * 0.35); ctx.quadraticCurveTo(0, r * 0.55 + (st.panic || 0) * r * 0.2, -r * 0.3, r * 0.35); ctx.fill();
    if (boss) { ctx.fillStyle = '#ffd84d'; star(ctx, 0, -r * 0.62, 5, r * 0.18, r * 0.08, -Math.PI / 2); ctx.fill(); }
  }
  function tankShape(ctx, r, st, boss) {
    const t = st.t || 0;
    shadow(ctx, 0, r * 0.6, r * 1.05, r * 0.24, 0.3);
    const base = boss ? '#4a4a30' : '#5a6a3a';
    // гусениці
    ctx.fillStyle = '#26261c'; roundRect(ctx, -r * 1.05, r * 0.15, r * 2.1, r * 0.45, r * 0.12); ctx.fill();
    ctx.fillStyle = '#3a3a2c'; for (let i = -4; i <= 4; i++) { circle(ctx, i * r * 0.24, r * 0.38, r * 0.12); ctx.fill(); }
    // корпус
    const bg = ctx.createLinearGradient(0, -r * 0.4, 0, r * 0.2);
    bg.addColorStop(0, shade(base, 14)); bg.addColorStop(1, shade(base, -14));
    ctx.fillStyle = bg; roundRect(ctx, -r * 0.95, -r * 0.25, r * 1.9, r * 0.55, r * 0.1); ctx.fill();
    // башта
    ctx.fillStyle = shade(base, 6); roundRect(ctx, -r * 0.5, -r * 0.6, r, r * 0.5, r * 0.14); ctx.fill();
    // дуло(а)
    const aim = st.aim ?? 0;
    ctx.save(); ctx.translate(0, -r * 0.36); ctx.rotate(aim);
    ctx.fillStyle = '#2a2a20'; roundRect(ctx, 0, -r * 0.08, r * (boss ? 1.5 : 1.2), r * 0.16, r * 0.04); ctx.fill();
    if (boss) { roundRect(ctx, 0, -r * 0.28, r * 1.3, r * 0.13, r * 0.04); roundRect(ctx, 0, r * 0.15, r * 1.3, r * 0.13, r * 0.04); ctx.fill(); }
    ctx.restore();
    if (boss) { ctx.fillStyle = '#ff5a6e'; const gl = 0.5 + 0.5 * Math.sin(t * 4); ctx.globalAlpha = gl; circle(ctx, 0, -r * 0.42, r * 0.1); ctx.fill(); ctx.globalAlpha = 1; ctx.fillStyle = '#ffd84d'; star(ctx, 0, -r * 0.7, 5, r * 0.14, r * 0.06, -Math.PI / 2); ctx.fill(); }
  }
  function droneShape(ctx, r, st, col) {
    const t = st.t || 0;
    ctx.strokeStyle = '#445'; ctx.lineWidth = r * 0.08;
    for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(sx * r * 0.9, -r * 0.5); ctx.stroke(); ctx.save(); ctx.translate(sx * r * 0.9, -r * 0.5); ctx.scale(1, 0.3); ctx.fillStyle = 'rgba(200,220,255,0.5)'; circle(ctx, 0, 0, r * 0.5 * (0.9 + 0.1 * Math.sin(t * 40))); ctx.fill(); ctx.restore(); }
    ctx.fillStyle = col; roundRect(ctx, -r * 0.35, -r * 0.25, r * 0.7, r * 0.5, r * 0.12); ctx.fill();
    ctx.fillStyle = '#10131c'; circle(ctx, 0, r * 0.05, r * 0.16); ctx.fill();
    ctx.fillStyle = '#ff4d6d'; circle(ctx, 0, r * 0.05, r * 0.07); ctx.fill();
    ctx.fillStyle = '#333'; roundRect(ctx, -r * 0.1, r * 0.2, r * 0.2, r * 0.3, r * 0.04); ctx.fill();
  }

  function shade(hex, amt) {
    if (typeof hex !== 'string' || hex[0] !== '#') return hex;
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    r = clamp(r + amt, 0, 255); g = clamp(g + amt, 0, 255); b = clamp(b + amt, 0, 255);
    return rgba(r, g, b, 1);
  }

  /* =================================================================== *
   *  "ЇЖА" — пасивні об'єкти
   * =================================================================== */
  function prop(ctx, x, y, r, type, seed = 0, t = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 0.5 + seed) * 0.05);
    (PROPS[type] || PROPS.atom)(ctx, r, seed, t); ctx.restore();
  }
  function pick3(s, a, b, c) { const i = Math.abs((s * 9973) | 0) % 3; return i === 0 ? a : i === 1 ? b : c; }

  const PROPS = {
    microbe(ctx, r, s) { shadow(ctx, 0, r * 0.7, r * 0.8, r * 0.25, 0.12); ctx.fillStyle = hsl((120 + s * 40) % 80 + 80, 60, 55); ctx.beginPath(); ctx.ellipse(0, 0, r * 0.8, r * 0.6, s, 0, TAU); ctx.fill(); ctx.strokeStyle = hsl(120, 60, 35); ctx.lineWidth = r * 0.06; for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.5); ctx.lineTo(Math.cos(a) * r * 1.0, Math.sin(a) * r * 0.8); ctx.stroke(); } ctx.fillStyle = hsl(120, 60, 30); circle(ctx, -r * 0.2, 0, r * 0.18); ctx.fill(); },
    cell(ctx, r, s) { const g = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.1, 0, 0, r); g.addColorStop(0, 'rgba(255,120,150,0.85)'); g.addColorStop(1, 'rgba(190,40,70,0.85)'); ctx.fillStyle = g; circle(ctx, 0, 0, r * 0.9); ctx.fill(); ctx.fillStyle = 'rgba(120,10,30,0.8)'; circle(ctx, r * 0.1, r * 0.05, r * 0.32); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.25)'; circle(ctx, -r * 0.3, -r * 0.3, r * 0.18); ctx.fill(); },
    atom(ctx, r, s, t) { ctx.strokeStyle = hsl((200 + s * 60) % 100 + 200, 80, 60); ctx.lineWidth = r * 0.07; for (let i = 0; i < 3; i++) { ctx.save(); ctx.rotate(i * Math.PI / 3 + t); ctx.beginPath(); ctx.ellipse(0, 0, r * 0.9, r * 0.35, 0, 0, TAU); ctx.stroke(); ctx.restore(); } ctx.fillStyle = hsl(50, 90, 60); circle(ctx, 0, 0, r * 0.28); ctx.fill(); },
    spore(ctx, r, s, t) { shadow(ctx, 0, r * 0.7, r * 0.6, r * 0.2, 0.12); ctx.strokeStyle = 'rgba(150,230,200,0.6)'; ctx.lineWidth = r * 0.04; for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.7); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); ctx.stroke(); } ctx.fillStyle = hsl(165, 45, 55); circle(ctx, 0, 0, r * 0.7); ctx.fill(); ctx.fillStyle = hsl(165, 45, 38); circle(ctx, 0, 0, r * 0.3); ctx.fill(); },
    crumb(ctx, r, s) { shadow(ctx, 0, r * 0.6, r * 0.6, r * 0.16, 0.18); ctx.fillStyle = pick3(s, '#caa15a', '#b5793a', '#9a6a32'); ctx.beginPath(); for (let i = 0; i < 7; i++) { const a = (i / 7) * TAU; const rr = r * (0.6 + 0.4 * hash2(i, (s * 10) | 0)); ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); },
    screw(ctx, r, s) { shadow(ctx, 0, r * 0.6, r * 0.4, r * 0.14, 0.2); ctx.save(); ctx.rotate(s); ctx.fillStyle = '#9aa3ad'; roundRect(ctx, -r * 0.18, -r * 0.2, r * 0.36, r * 0.9, r * 0.05); ctx.fill(); ctx.beginPath(); ctx.moveTo(-r * 0.18, r * 0.7); ctx.lineTo(r * 0.18, r * 0.7); ctx.lineTo(0, r); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#c3ccd6'; circle(ctx, 0, -r * 0.4, r * 0.5); ctx.fill(); ctx.strokeStyle = '#6a737d'; ctx.lineWidth = r * 0.08; ctx.beginPath(); ctx.moveTo(-r * 0.3, -r * 0.4); ctx.lineTo(r * 0.3, -r * 0.4); ctx.stroke(); ctx.restore(); },
    wall(ctx, r, s) { shadow(ctx, 0, r * 0.95, r * 0.8, r * 0.16, 0.25); ctx.fillStyle = '#9a5a44'; roundRect(ctx, -r * 0.8, -r, r * 1.6, r * 2, r * 0.05); ctx.fill(); ctx.strokeStyle = '#6e3e2e'; ctx.lineWidth = r * 0.04; for (let yy = -0.8; yy < 1; yy += 0.3) { const off = (Math.round((yy + 1) / 0.3) % 2) ? r * 0.3 : 0; ctx.beginPath(); ctx.moveTo(-r * 0.8, yy * r); ctx.lineTo(r * 0.8, yy * r); ctx.stroke(); for (let xx = -0.8; xx < 0.8; xx += 0.6) { ctx.beginPath(); ctx.moveTo(xx * r + off, yy * r); ctx.lineTo(xx * r + off, (yy + 0.3) * r); ctx.stroke(); } } },
    sandbag(ctx, r, s) { shadow(ctx, 0, r * 0.7, r * 0.8, r * 0.18, 0.22); for (let row = 0; row < 2; row++) for (let i = -1; i <= 1; i++) { ctx.fillStyle = pick3(s + i, '#a99a6a', '#8f8157', '#b5a674'); roundRect(ctx, i * r * 0.5 - r * 0.3 + (row ? r * 0.25 : 0), row * r * 0.4 - r * 0.1, r * 0.6, r * 0.42, r * 0.14); ctx.fill(); } },
    pill(ctx, r, s) { shadow(ctx, 0, r * 0.6, r * 0.7, r * 0.2, 0.15); ctx.save(); ctx.rotate(s); roundRect(ctx, -r * 0.7, -r * 0.3, r * 1.4, r * 0.6, r * 0.3); ctx.fillStyle = '#fff'; ctx.fill(); ctx.fillStyle = pick3(s, '#e8554e', '#4e8be8', '#4ec07a'); ctx.save(); roundRect(ctx, -r * 0.7, -r * 0.3, r * 0.7, r * 0.6, r * 0.3); ctx.clip(); ctx.fillRect(-r * 0.7, -r * 0.3, r * 0.7, r * 0.6); ctx.restore(); ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = r * 0.04; roundRect(ctx, -r * 0.7, -r * 0.3, r * 1.4, r * 0.6, r * 0.3); ctx.stroke(); ctx.restore(); },
    beaker(ctx, r, s) { shadow(ctx, 0, r * 0.85, r * 0.6, r * 0.18, 0.18); ctx.fillStyle = 'rgba(220,235,245,0.85)'; ctx.beginPath(); ctx.moveTo(-r * 0.25, -r * 0.8); ctx.lineTo(-r * 0.25, -r * 0.1); ctx.lineTo(-r * 0.6, r * 0.7); ctx.lineTo(r * 0.6, r * 0.7); ctx.lineTo(r * 0.25, -r * 0.1); ctx.lineTo(r * 0.25, -r * 0.8); ctx.closePath(); ctx.fill(); ctx.fillStyle = pick3(s, '#46d39a', '#e0556b', '#4e8be8'); ctx.beginPath(); ctx.moveTo(-r * 0.48, r * 0.25); ctx.lineTo(-r * 0.6, r * 0.7); ctx.lineTo(r * 0.6, r * 0.7); ctx.lineTo(r * 0.48, r * 0.25); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(120,150,170,0.9)'; ctx.lineWidth = r * 0.05; ctx.beginPath(); ctx.moveTo(-r * 0.25, -r * 0.8); ctx.lineTo(-r * 0.25, -r * 0.1); ctx.lineTo(-r * 0.6, r * 0.7); ctx.lineTo(r * 0.6, r * 0.7); ctx.lineTo(r * 0.25, -r * 0.1); ctx.lineTo(r * 0.25, -r * 0.8); ctx.stroke(); },
    mouse(ctx, r, s, t) { shadow(ctx, 0, r * 0.5, r * 0.7, r * 0.2, 0.18); ctx.fillStyle = '#b9bcc6'; ctx.beginPath(); ctx.ellipse(0, 0, r * 0.8, r * 0.55, 0, 0, TAU); ctx.fill(); circle(ctx, r * 0.55, -r * 0.2, r * 0.35); ctx.fill(); ctx.fillStyle = '#e7a6c4'; circle(ctx, r * 0.4, -r * 0.55, r * 0.18); circle(ctx, r * 0.75, -r * 0.5, r * 0.18); ctx.fill(); ctx.fillStyle = '#222'; circle(ctx, r * 0.7, -r * 0.22, r * 0.06); ctx.fill(); ctx.strokeStyle = '#b9bcc6'; ctx.lineWidth = r * 0.06; ctx.beginPath(); ctx.moveTo(-r * 0.7, r * 0.1); ctx.quadraticCurveTo(-r * 1.2, Math.sin(t * 5 + s) * r * 0.3, -r * 1.3, -r * 0.2); ctx.stroke(); },
    book(ctx, r, s) { shadow(ctx, 0, r * 0.7, r * 0.7, r * 0.2, 0.2); ctx.save(); ctx.rotate((s % 1 - 0.5) * 0.4); ctx.fillStyle = pick3(s, '#c0392b', '#2c6fbb', '#27895a'); roundRect(ctx, -r * 0.65, -r * 0.5, r * 1.3, r, r * 0.06); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(r * 0.5, -r * 0.5, r * 0.12, r); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = r * 0.03; ctx.strokeRect(-r * 0.5, -r * 0.35, r * 0.9, r * 0.7); ctx.restore(); },
    mug(ctx, r, s) { shadow(ctx, 0, r * 0.7, r * 0.6, r * 0.18, 0.2); ctx.fillStyle = pick3(s, '#ee7d3a', '#3aa0ee', '#8e44ad'); roundRect(ctx, -r * 0.5, -r * 0.5, r, r, r * 0.12); ctx.fill(); ctx.strokeStyle = pick3(s, '#ee7d3a', '#3aa0ee', '#8e44ad'); ctx.lineWidth = r * 0.12; ctx.beginPath(); ctx.arc(r * 0.55, 0, r * 0.28, -Math.PI / 2, Math.PI / 2); ctx.stroke(); ctx.fillStyle = '#5b3a25'; ctx.beginPath(); ctx.ellipse(0, -r * 0.4, r * 0.42, r * 0.14, 0, 0, TAU); ctx.fill(); },
    laptop(ctx, r, s, t) { shadow(ctx, 0, r * 0.55, r * 0.9, r * 0.2, 0.22); ctx.fillStyle = '#3a3f4b'; roundRect(ctx, -r * 0.8, -r * 0.7, r * 1.6, r, r * 0.06); ctx.fill(); ctx.fillStyle = hsl((t * 60 + s * 100) % 360, 70, 55); ctx.fillRect(-r * 0.7, -r * 0.6, r * 1.4, r * 0.8); ctx.fillStyle = '#c9ccd6'; ctx.beginPath(); ctx.moveTo(-r * 0.95, r * 0.55); ctx.lineTo(r * 0.95, r * 0.55); ctx.lineTo(r * 0.8, r * 0.3); ctx.lineTo(-r * 0.8, r * 0.3); ctx.closePath(); ctx.fill(); },
    chair(ctx, r) { shadow(ctx, 0, r * 0.9, r * 0.6, r * 0.18, 0.2); ctx.fillStyle = '#7a5a3a'; ctx.fillRect(-r * 0.45, -r * 0.9, r * 0.18, r * 1.8); roundRect(ctx, -r * 0.5, -r * 0.95, r * 0.7, r * 0.7, r * 0.08); ctx.fill(); roundRect(ctx, -r * 0.5, r * 0.0, r * 0.95, r * 0.22, r * 0.05); ctx.fill(); ctx.fillRect(r * 0.3, r * 0.2, r * 0.12, r * 0.7); ctx.fillRect(-r * 0.45, r * 0.2, r * 0.12, r * 0.7); },
    plant(ctx, r, s, t) { shadow(ctx, 0, r * 0.85, r * 0.5, r * 0.16, 0.2); ctx.fillStyle = '#c8743a'; ctx.beginPath(); ctx.moveTo(-r * 0.4, r * 0.3); ctx.lineTo(r * 0.4, r * 0.3); ctx.lineTo(r * 0.3, r * 0.85); ctx.lineTo(-r * 0.3, r * 0.85); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#2f9e57'; for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.4 + Math.sin(t + s + i) * 0.05; ctx.save(); ctx.translate(0, r * 0.2); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(0, -r * 0.5, r * 0.16, r * 0.55, 0, 0, TAU); ctx.fill(); ctx.restore(); } },
    car(ctx, r, s) { shadow(ctx, 0, r * 0.55, r * 1.0, r * 0.22, 0.25); const col = pick3(s, '#e84d4d', '#4d7de8', '#f0b22e'); ctx.fillStyle = col; roundRect(ctx, -r, -r * 0.25, r * 2, r * 0.6, r * 0.18); ctx.fill(); roundRect(ctx, -r * 0.55, -r * 0.6, r * 1.1, r * 0.45, r * 0.16); ctx.fill(); ctx.fillStyle = 'rgba(180,225,255,0.85)'; roundRect(ctx, -r * 0.45, -r * 0.55, r * 0.9, r * 0.32, r * 0.08); ctx.fill(); ctx.fillStyle = '#1c1c22'; circle(ctx, -r * 0.55, r * 0.32, r * 0.26); circle(ctx, r * 0.55, r * 0.32, r * 0.26); ctx.fill(); ctx.fillStyle = '#cfd3da'; circle(ctx, -r * 0.55, r * 0.32, r * 0.1); circle(ctx, r * 0.55, r * 0.32, r * 0.1); ctx.fill(); ctx.fillStyle = '#ffe9a8'; circle(ctx, r * 0.92, -r * 0.05, r * 0.08); ctx.fill(); },
    tree(ctx, r, s, t) { shadow(ctx, 0, r * 0.85, r * 0.7, r * 0.2, 0.25); ctx.fillStyle = '#7a4a26'; ctx.fillRect(-r * 0.12, -r * 0.1, r * 0.24, r * 0.95); ctx.fillStyle = '#2f8e4e'; const sway = Math.sin(t * 1.2 + s) * r * 0.05; circle(ctx, sway, -r * 0.45, r * 0.6); ctx.fill(); circle(ctx, -r * 0.4 + sway, -r * 0.2, r * 0.42); ctx.fill(); circle(ctx, r * 0.4 + sway, -r * 0.2, r * 0.42); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.12)'; circle(ctx, -r * 0.2 + sway, -r * 0.6, r * 0.25); ctx.fill(); },
    hydrant(ctx, r) { shadow(ctx, 0, r * 0.75, r * 0.5, r * 0.15, 0.2); ctx.fillStyle = '#d23a3a'; roundRect(ctx, -r * 0.35, -r * 0.5, r * 0.7, r * 1.1, r * 0.18); ctx.fill(); circle(ctx, 0, -r * 0.5, r * 0.35); ctx.fill(); ctx.fillStyle = '#a82a2a'; circle(ctx, -r * 0.5, -r * 0.1, r * 0.18); circle(ctx, r * 0.5, -r * 0.1, r * 0.18); ctx.fill(); ctx.fillStyle = '#ffd84d'; circle(ctx, 0, -r * 0.5, r * 0.14); ctx.fill(); },
    bench(ctx, r) { shadow(ctx, 0, r * 0.7, r * 0.9, r * 0.18, 0.2); ctx.fillStyle = '#3f7a4a'; for (let i = 0; i < 3; i++) ctx.fillRect(-r * 0.9, -r * 0.4 + i * r * 0.22, r * 1.8, r * 0.14); ctx.fillStyle = '#555'; ctx.fillRect(-r * 0.8, r * 0.1, r * 0.12, r * 0.5); ctx.fillRect(r * 0.7, r * 0.1, r * 0.12, r * 0.5); },
    person(ctx, r, s, t) { const c = pick3(s, '#d35400', '#16a085', '#2980b9'); human(ctx, 0, 0, r * 0.5, { skin: '#eebd92', hair: pick3(s + 1, '#3a2a1c', '#caa23a', '#1d1d24'), hairStyle: pick3(s, 'short', 'spiky', 'flat'), coat: c, shirt: '#fff', smile: 1, _ph: s }, { t: t + s, panic: 0.25 }); },
    building(ctx, r, s) { shadow(ctx, 0, r * 0.95, r * 0.8, r * 0.18, 0.3); const col = pick3(s, '#6b7a8f', '#8f7a6b', '#7a6b8f'); ctx.fillStyle = col; roundRect(ctx, -r * 0.6, -r, r * 1.2, r * 1.95, r * 0.04); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(-r * 0.6, -r, r * 0.25, r * 1.95); for (let yy = -0.85; yy < 0.85; yy += 0.28) for (let xx = -0.4; xx <= 0.4; xx += 0.28) { const lit = hash2((xx * 100) | 0, (yy * 100 + s * 50) | 0) > 0.55; ctx.fillStyle = lit ? hsl(48, 90, 70) : 'rgba(40,50,65,0.8)'; ctx.fillRect(xx * r - r * 0.09, yy * r - r * 0.09, r * 0.18, r * 0.22); } ctx.fillStyle = col; roundRect(ctx, -r * 0.7, -r * 1.12, r * 1.4, r * 0.18, r * 0.04); ctx.fill(); },
    tower(ctx, r, s) { shadow(ctx, 0, r * 0.95, r * 0.6, r * 0.16, 0.3); ctx.fillStyle = '#9aa7b5'; ctx.beginPath(); ctx.moveTo(-r * 0.5, r * 0.95); ctx.lineTo(-r * 0.18, -r * 0.9); ctx.lineTo(r * 0.18, -r * 0.9); ctx.lineTo(r * 0.5, r * 0.95); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = r * 0.03; for (let i = 0; i < 5; i++) { const y = -0.8 + i * 0.35; ctx.beginPath(); ctx.moveTo(-r * (0.5 - i * 0.06), y * r); ctx.lineTo(r * (0.5 - i * 0.06), y * r); ctx.stroke(); } ctx.fillStyle = '#e74c3c'; circle(ctx, 0, -r * 0.95, r * 0.07); ctx.fill(); },
    house(ctx, r, s) { shadow(ctx, 0, r * 0.85, r * 0.8, r * 0.18, 0.25); ctx.fillStyle = pick3(s, '#e8d6b3', '#d6e8c0', '#e8c0c8'); ctx.fillRect(-r * 0.6, -r * 0.1, r * 1.2, r * 0.95); ctx.fillStyle = pick3(s, '#b5462f', '#2f6bb5', '#7a4ab5'); ctx.beginPath(); ctx.moveTo(-r * 0.75, -r * 0.1); ctx.lineTo(0, -r * 0.8); ctx.lineTo(r * 0.75, -r * 0.1); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#6b4a2a'; ctx.fillRect(-r * 0.15, r * 0.35, r * 0.3, r * 0.5); ctx.fillStyle = '#9ad0f0'; ctx.fillRect(-r * 0.45, r * 0.05, r * 0.22, r * 0.22); ctx.fillRect(r * 0.23, r * 0.05, r * 0.22, r * 0.22); },
    cloud(ctx, r, s, t) { ctx.fillStyle = 'rgba(255,255,255,0.92)'; const o = Math.sin(t + s) * r * 0.05; circle(ctx, -r * 0.4, o, r * 0.5); circle(ctx, r * 0.4, -o, r * 0.5); circle(ctx, 0, -r * 0.25, r * 0.6); circle(ctx, 0, r * 0.1, r * 0.55); ctx.fill(); },
    satellite(ctx, r, s, t) { ctx.save(); ctx.rotate(t * 0.3 + s); ctx.fillStyle = '#cfd6e0'; roundRect(ctx, -r * 0.25, -r * 0.25, r * 0.5, r * 0.5, r * 0.06); ctx.fill(); ctx.fillStyle = '#2b3a8f'; ctx.fillRect(-r * 0.95, -r * 0.2, r * 0.55, r * 0.4); ctx.fillRect(r * 0.4, -r * 0.2, r * 0.55, r * 0.4); ctx.strokeStyle = '#8893a5'; ctx.lineWidth = r * 0.04; ctx.strokeRect(-r * 0.95, -r * 0.2, r * 0.55, r * 0.4); ctx.strokeRect(r * 0.4, -r * 0.2, r * 0.55, r * 0.4); ctx.restore(); },
    planet(ctx, r, s, t) { const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.2, 0, 0, r); g.addColorStop(0, hsl((200 + s * 80) % 120 + 200, 60, 60)); g.addColorStop(1, hsl((220 + s * 60) % 120 + 220, 60, 30)); ctx.fillStyle = g; circle(ctx, 0, 0, r); ctx.fill(); ctx.fillStyle = 'rgba(80,200,120,0.5)'; circle(ctx, -r * 0.3, r * 0.2, r * 0.3); circle(ctx, r * 0.35, -r * 0.25, r * 0.22); ctx.fill(); ctx.save(); ctx.rotate(-0.5 + Math.sin(t * 0.2) * 0.05); ctx.strokeStyle = 'rgba(255,230,180,0.7)'; ctx.lineWidth = r * 0.08; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.5, r * 0.4, 0, 0, TAU); ctx.stroke(); ctx.restore(); },
    star(ctx, r, s, t) { ctx.fillStyle = hsl(50, 90, 65); star(ctx, 0, 0, 5, r, r * 0.45, t * 0.5 + s); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.6)'; circle(ctx, 0, 0, r * 0.25); ctx.fill(); },
  };

  /* ----------------------- частинки ---------------------------------- */
  function sparkle(ctx, x, y, r, hue, a, kind) {
    ctx.save(); ctx.globalAlpha = a;
    if (kind === 'goo') { ctx.fillStyle = hsl(hue, 80, 55); blob(ctx, r, x + y, 0.2, 8, x); ctx.translate(x, y); circle(ctx, 0, 0, r); ctx.fill(); }
    else { ctx.fillStyle = hsl(hue, 90, 65); star(ctx, x, y, 4, r, r * 0.4, 0); ctx.fill(); }
    ctx.restore();
  }

  /* ----------------------- диспетчер --------------------------------- */
  function figure(ctx, key, x, y, r, state = {}) {
    if (CHARS[key]) { human(ctx, x, y, r, CHARS[key], state); return; }
    ctx.save(); ctx.translate(x, y);
    if (CREATURES[key]) CREATURES[key].draw(ctx, r, state);
    else if (PROPS[key]) { ctx.rotate(Math.sin((state.t || 0) * 0.5 + (state.seed || 0)) * 0.04); PROPS[key](ctx, r, state.seed || 0, state.t || 0); }
    else { germBody(ctx, r, state.t || 0, 285, 70); eyes(ctx, r * 0.3, -r * 0.1, r * 0.18); }
    ctx.restore();
  }
  function nameOf(key) { return (CHARS[key] && CHARS[key].name) || (CREATURES[key] && CREATURES[key].name) || key; }

  return {
    nikita, human, character: figure, figure, prop, sparkle, nameOf,
    CHARS, CREATURES, PROPS, shadow, roundRect, circle, star, blob, shade,
  };
})();
