/* =========================================================================
 *  art.js  —  ВСЯ графіка намальована в коді (жодних картинок).
 *  Нікіта-монстр, вчені-персонажі та "їжа" для кожного рівня.
 *  Кожна функція малює об'єкт по центру (x, y), вписаний у радіус r.
 * ========================================================================= */

const Art = (() => {

  /* ---------- маленькі примітиви ------------------------------------- */
  function shadow(ctx, x, y, rx, ry, alpha = 0.25) {
    ctx.save();
    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
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

  /* =================================================================== *
   *  НІКІТА — головний монстр, що все їсть
   * =================================================================== */
  // opts: { dir, chomp(0..1), wobble(time), img(HTMLImageElement|null), hue }
  function nikita(ctx, x, y, r, opts = {}) {
    const dir = opts.dir || 0;
    const t = opts.wobble || 0;
    const chomp = opts.chomp || 0;
    const hue = opts.hue ?? 280;
    const img = opts.img && opts.img.complete && opts.img.naturalWidth ? opts.img : null;

    ctx.save();
    ctx.translate(x, y);

    shadow(ctx, 0, r * 0.78, r * 0.95, r * 0.30, 0.28);

    // --- гелеподібне тіло (хвилясте коло) ---
    const N = 28;
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * TAU;
      const wob = 1
        + 0.055 * Math.sin(a * 3 + t * 2.2)
        + 0.04 * Math.sin(a * 5 - t * 1.7)
        + 0.03 * Math.sin(a * 8 + t * 3.1);
      const rr = r * wob;
      const px = Math.cos(a) * rr, py = Math.sin(a) * rr;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.closePath();

    const g = ctx.createRadialGradient(-r * 0.3, -r * 0.4, r * 0.2, 0, 0, r * 1.15);
    g.addColorStop(0, hsl(hue, 85, 68));
    g.addColorStop(0.6, hsl(hue, 80, 52));
    g.addColorStop(1, hsl(hue + 10, 75, 32));
    ctx.fillStyle = g;
    ctx.fill();

    // обідок
    ctx.lineWidth = r * 0.045;
    ctx.strokeStyle = hsl(hue + 15, 70, 24);
    ctx.stroke();

    // глянцеві відблиски
    ctx.fillStyle = 'rgba(255,255,255,0.30)';
    circle(ctx, -r * 0.35, -r * 0.42, r * 0.18); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    circle(ctx, -r * 0.12, -r * 0.55, r * 0.09); ctx.fill();

    // якщо є фото — вписуємо обличчя у верхню частину блоба
    if (img) {
      ctx.save();
      circle(ctx, 0, -r * 0.05, r * 0.66);
      ctx.clip();
      const s = r * 1.5;
      ctx.drawImage(img, -s / 2, -r * 0.05 - s / 2, s, s);
      ctx.restore();
      ctx.lineWidth = r * 0.05;
      ctx.strokeStyle = hsl(hue + 10, 70, 30);
      circle(ctx, 0, -r * 0.05, r * 0.66); ctx.stroke();
    }

    // --- очі (дивляться у напрямку руху) ---
    const eyeY = img ? -r * 0.62 : -r * 0.2;
    const eyeDX = Math.cos(dir) * r * 0.10;
    const eyeDY = Math.sin(dir) * r * 0.10;
    for (const sx of [-1, 1]) {
      const ex = sx * r * 0.34, ey = eyeY;
      ctx.fillStyle = '#fff';
      circle(ctx, ex, ey, r * 0.21); ctx.fill();
      ctx.fillStyle = '#1a1320';
      circle(ctx, ex + eyeDX, ey + eyeDY, r * 0.10); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      circle(ctx, ex + eyeDX - r * 0.03, ey + eyeDY - r * 0.03, r * 0.035); ctx.fill();
    }

    // --- величезна паща з зубами (внизу, відкривається при поїданні) ---
    const mouthY = img ? r * 0.36 : r * 0.34;
    const open = (0.18 + chomp * 0.55) * r;
    ctx.save();
    ctx.translate(0, mouthY);
    // темна паща
    ctx.fillStyle = '#2a0d1a';
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.5, open, 0, 0, TAU);
    ctx.fill();
    // язик
    ctx.fillStyle = '#e0436b';
    ctx.beginPath();
    ctx.ellipse(0, open * 0.45, r * 0.34, open * 0.5, 0, 0, TAU);
    ctx.fill();
    // зуби
    ctx.fillStyle = '#fff';
    const teeth = 7;
    for (let i = 0; i < teeth; i++) {
      const tx = lerp(-r * 0.44, r * 0.44, i / (teeth - 1));
      // верхні
      ctx.beginPath();
      ctx.moveTo(tx - r * 0.05, -open);
      ctx.lineTo(tx + r * 0.05, -open);
      ctx.lineTo(tx, -open + r * 0.16);
      ctx.closePath(); ctx.fill();
      // нижні
      ctx.beginPath();
      ctx.moveTo(tx - r * 0.05, open);
      ctx.lineTo(tx + r * 0.05, open);
      ctx.lineTo(tx, open - r * 0.16);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();

    ctx.restore();
  }

  /* =================================================================== *
   *  БАЗОВА ЛЮДИНА-ВЧЕНИЙ (білбордний спрайт)
   *  def: { skin, hair, hairStyle, coat, shirt, glasses, mustache, beard,
   *         helmet, brain, apron, cap, browColor, name }
   *  state: { t, panic(0..1), facing }
   * =================================================================== */
  function human(ctx, x, y, r, def, state = {}) {
    const t = state.t || 0;
    const panic = clamp(state.panic || 0, 0, 1);
    const H = r * 2.4;                 // повна висота
    const bob = Math.sin(t * 3 + (def._ph || 0)) * r * 0.05 * (1 - panic)
              + (panic ? Math.sin(t * 26) * r * 0.06 : 0);
    const headR = r * 0.62;
    const shoulderY = -r * 0.05;
    const headCY = -r * 0.78 + bob;

    ctx.save();
    ctx.translate(x, y + bob * 0.2);

    shadow(ctx, 0, r * 1.18, r * 0.8, r * 0.24, 0.25);

    // ноги
    ctx.strokeStyle = '#2b2f3a';
    ctx.lineWidth = r * 0.18;
    ctx.lineCap = 'round';
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(sx * r * 0.22, r * 0.55);
      ctx.lineTo(sx * r * 0.26, r * 1.12);
      ctx.stroke();
    }
    // взуття
    ctx.fillStyle = '#15171d';
    for (const sx of [-1, 1]) { roundRect(ctx, sx * r * 0.26 - r * 0.16, r * 1.05, r * 0.34, r * 0.18, r * 0.08); ctx.fill(); }

    // --- руки (махають при паніці) ---
    const armSwing = panic ? Math.sin(t * 22) * 0.9 : Math.sin(t * 3 + 1) * 0.18;
    ctx.strokeStyle = def.coat;
    ctx.lineWidth = r * 0.22;
    for (const sx of [-1, 1]) {
      const a = -Math.PI / 2 + sx * (0.5 + (panic ? 1.1 : 0) + armSwing * sx);
      const hx = sx * r * 0.42, hy = shoulderY + r * 0.15;
      const ex = hx + Math.cos(a) * r * 0.7, ey = hy + Math.sin(a) * r * 0.7;
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.fillStyle = def.skin; circle(ctx, ex, ey, r * 0.13); ctx.fill();
      ctx.strokeStyle = def.coat;
    }

    // --- тулуб: халат вченого ---
    ctx.fillStyle = def.coat;
    roundRect(ctx, -r * 0.5, shoulderY, r, r * 1.15, r * 0.22); ctx.fill();
    // тінь халата
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    roundRect(ctx, -r * 0.5, shoulderY, r * 0.5, r * 1.15, r * 0.22); ctx.fill();
    // комір + сорочка
    ctx.fillStyle = def.shirt;
    ctx.beginPath();
    ctx.moveTo(-r * 0.18, shoulderY);
    ctx.lineTo(0, shoulderY + r * 0.5);
    ctx.lineTo(r * 0.18, shoulderY);
    ctx.closePath(); ctx.fill();
    // ґудзики / лінія застібки
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = r * 0.03;
    ctx.beginPath(); ctx.moveTo(0, shoulderY + r * 0.5); ctx.lineTo(0, shoulderY + r * 1.1); ctx.stroke();

    // фартух няні
    if (def.apron) {
      ctx.fillStyle = def.apron;
      roundRect(ctx, -r * 0.3, shoulderY + r * 0.35, r * 0.6, r * 0.8, r * 0.1); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = r * 0.03;
      ctx.strokeRect(-r * 0.24, shoulderY + r * 0.45, r * 0.48, r * 0.6);
    }

    // бейдж "вчений"
    ctx.fillStyle = '#e9eef5';
    roundRect(ctx, r * 0.16, shoulderY + r * 0.34, r * 0.22, r * 0.16, r * 0.03); ctx.fill();
    ctx.fillStyle = def.shirt;
    ctx.fillRect(r * 0.19, shoulderY + r * 0.37, r * 0.16, r * 0.04);

    // --- шия ---
    ctx.fillStyle = def.skin;
    roundRect(ctx, -r * 0.14, headCY + headR * 0.7, r * 0.28, r * 0.3, r * 0.06); ctx.fill();

    // --- голова ---
    // (у Молгелевича — велика "розумна" голова)
    const hr = headR * (def.brain ? 1.18 : 1);
    ctx.fillStyle = def.skin;
    circle(ctx, 0, headCY, hr); ctx.fill();
    // легка тінь знизу обличчя
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.beginPath(); ctx.ellipse(0, headCY + hr * 0.4, hr * 0.9, hr * 0.5, 0, 0, Math.PI); ctx.fill();

    // вуха
    ctx.fillStyle = def.skin;
    for (const sx of [-1, 1]) { circle(ctx, sx * hr, headCY + hr * 0.05, hr * 0.18); ctx.fill(); }

    // --- зачіска ---
    drawHair(ctx, headCY, hr, def);

    // мозок, що світиться (геній Молгелевич)
    if (def.brain) {
      ctx.save();
      ctx.translate(0, headCY - hr * 0.55);
      const pg = ctx.createRadialGradient(0, 0, 1, 0, 0, hr * 0.9);
      pg.addColorStop(0, 'rgba(255,150,200,0.9)');
      pg.addColorStop(1, 'rgba(255,90,160,0.0)');
      ctx.fillStyle = pg; circle(ctx, 0, 0, hr * 0.9); ctx.fill();
      ctx.fillStyle = '#ff9ecb';
      ctx.beginPath();
      ctx.ellipse(-hr * 0.22, 0, hr * 0.3, hr * 0.34, 0, 0, TAU);
      ctx.ellipse(hr * 0.22, 0, hr * 0.3, hr * 0.34, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = '#d65b97'; ctx.lineWidth = hr * 0.04;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc((i < 2 ? -1 : 1) * hr * 0.22, 0, hr * (0.1 + 0.07 * (i % 2)), 0, Math.PI);
        ctx.stroke();
      }
      ctx.restore();
    }

    // --- обличчя ---
    drawFace(ctx, headCY, hr, def, t, panic);

    // окуляри
    if (def.glasses) {
      ctx.strokeStyle = def.glasses === true ? '#222' : def.glasses;
      ctx.lineWidth = hr * 0.07;
      ctx.fillStyle = 'rgba(180,220,255,0.25)';
      for (const sx of [-1, 1]) {
        circle(ctx, sx * hr * 0.36, headCY - hr * 0.02, hr * 0.27);
        ctx.fill(); ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(-hr * 0.12, headCY - hr * 0.02);
      ctx.lineTo(hr * 0.12, headCY - hr * 0.02); ctx.stroke();
      // дужки
      ctx.beginPath(); ctx.moveTo(-hr * 0.62, headCY - hr * 0.05); ctx.lineTo(-hr * 0.9, headCY - hr * 0.1);
      ctx.moveTo(hr * 0.62, headCY - hr * 0.05); ctx.lineTo(hr * 0.9, headCY - hr * 0.1); ctx.stroke();
    }

    // вуса
    if (def.mustache) {
      ctx.fillStyle = def.mustache === true ? def.hair : def.mustache;
      ctx.beginPath();
      ctx.moveTo(0, headCY + hr * 0.42);
      ctx.quadraticCurveTo(-hr * 0.45, headCY + hr * 0.28, -hr * 0.55, headCY + hr * 0.5);
      ctx.quadraticCurveTo(-hr * 0.35, headCY + hr * 0.5, 0, headCY + hr * 0.5);
      ctx.quadraticCurveTo(hr * 0.35, headCY + hr * 0.5, hr * 0.55, headCY + hr * 0.5);
      ctx.quadraticCurveTo(hr * 0.45, headCY + hr * 0.28, 0, headCY + hr * 0.42);
      ctx.fill();
    }
    // борода
    if (def.beard) {
      ctx.fillStyle = def.hair;
      ctx.beginPath();
      ctx.moveTo(-hr * 0.6, headCY + hr * 0.1);
      ctx.quadraticCurveTo(-hr * 0.5, headCY + hr * 1.05, 0, headCY + hr * 1.1);
      ctx.quadraticCurveTo(hr * 0.5, headCY + hr * 1.05, hr * 0.6, headCY + hr * 0.1);
      ctx.quadraticCurveTo(0, headCY + hr * 0.55, -hr * 0.6, headCY + hr * 0.1);
      ctx.fill();
    }

    // шолом Кирила
    if (def.helmet) {
      ctx.fillStyle = def.helmet;
      ctx.beginPath();
      ctx.arc(0, headCY, hr * 1.12, Math.PI * 1.04, Math.PI * 1.96);
      ctx.lineTo(hr * 1.05, headCY - hr * 0.1);
      ctx.lineTo(-hr * 1.05, headCY - hr * 0.1);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.beginPath(); ctx.arc(-hr * 0.3, headCY - hr * 0.3, hr * 0.7, Math.PI * 1.1, Math.PI * 1.5); ctx.lineWidth = hr * 0.12; ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.stroke();
      // зірочка/стрічка на шоломі
      ctx.fillStyle = '#ffd84d';
      star(ctx, 0, headCY - hr * 0.7, 5, hr * 0.2, hr * 0.09, -Math.PI / 2); ctx.fill();
    }

    // чепчик няні
    if (def.cap) {
      ctx.fillStyle = def.cap;
      ctx.beginPath();
      ctx.ellipse(0, headCY - hr * 0.75, hr * 0.7, hr * 0.35, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#e74c6f';
      circle(ctx, 0, headCY - hr * 0.95, hr * 0.12); ctx.fill();
    }

    // краплі поту при паніці
    if (panic > 0.3) {
      ctx.fillStyle = 'rgba(120,200,255,0.85)';
      const sw = (Math.sin(t * 8) * 0.5 + 0.5);
      circle(ctx, hr * 0.7, headCY - hr * 0.1 + sw * r * 0.3, hr * 0.12 * sw); ctx.fill();
    }

    ctx.restore();
  }

  function drawHair(ctx, cy, hr, def) {
    ctx.fillStyle = def.hair;
    switch (def.hairStyle) {
      case 'bald': break;
      case 'short':
        ctx.beginPath();
        ctx.arc(0, cy, hr * 1.02, Math.PI * 1.08, Math.PI * 1.92);
        ctx.quadraticCurveTo(hr * 0.9, cy - hr * 0.2, hr * 0.7, cy - hr * 0.55);
        ctx.quadraticCurveTo(0, cy - hr * 1.05, -hr * 0.7, cy - hr * 0.55);
        ctx.quadraticCurveTo(-hr * 0.9, cy - hr * 0.2, -hr * 1.02, cy - hr * 0.1);
        ctx.fill();
        break;
      case 'spiky':
        ctx.beginPath();
        for (let i = 0; i <= 10; i++) {
          const a = Math.PI + (i / 10) * Math.PI;
          const sp = i % 2 ? 1.32 : 1.0;
          ctx.lineTo(Math.cos(a) * hr * 1.02, cy + Math.sin(a) * hr * sp);
        }
        ctx.lineTo(hr, cy); ctx.lineTo(-hr, cy);
        ctx.fill();
        break;
      case 'curly':
        for (let i = 0; i < 9; i++) {
          const a = Math.PI + (i / 8) * Math.PI;
          circle(ctx, Math.cos(a) * hr * 0.92, cy + Math.sin(a) * hr * 0.92, hr * 0.3); ctx.fill();
        }
        break;
      case 'flat':
        ctx.beginPath();
        ctx.arc(0, cy, hr * 1.02, Math.PI, TAU);
        ctx.fill();
        ctx.fillRect(-hr * 1.02, cy - hr * 0.1, hr * 2.04, hr * 0.18);
        break;
      case 'sidepart':
        ctx.beginPath();
        ctx.arc(0, cy, hr * 1.02, Math.PI * 1.05, Math.PI * 1.95);
        ctx.quadraticCurveTo(hr * 0.6, cy - hr * 0.6, -hr * 0.2, cy - hr * 0.7);
        ctx.quadraticCurveTo(-hr * 0.9, cy - hr * 0.7, -hr * 1.0, cy - hr * 0.1);
        ctx.fill();
        break;
      case 'long': // няня — довге волосся з боків
        ctx.beginPath();
        ctx.arc(0, cy, hr * 1.05, Math.PI * 0.92, Math.PI * 2.08);
        ctx.lineTo(hr * 0.9, cy + hr * 0.9);
        ctx.quadraticCurveTo(hr * 0.4, cy + hr * 0.4, 0, cy + hr * 0.5);
        ctx.quadraticCurveTo(-hr * 0.4, cy + hr * 0.4, -hr * 0.9, cy + hr * 0.9);
        ctx.fill();
        break;
      default:
        ctx.beginPath(); ctx.arc(0, cy, hr * 1.02, Math.PI, TAU); ctx.fill();
    }
  }

  function drawFace(ctx, cy, hr, def, t, panic) {
    const blink = (Math.sin(t * 1.3 + (def._ph || 0)) > 0.97) ? 0.15 : 1;
    const eyeY = cy - hr * 0.02;
    const eyeX = hr * 0.36;
    const wide = panic; // перелякані великі очі
    // очі
    for (const sx of [-1, 1]) {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(sx * eyeX, eyeY, hr * (0.18 + wide * 0.05), hr * (0.2 + wide * 0.06) * blink, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#23303a';
      const look = panic ? Math.sin(t * 18) * hr * 0.05 : Math.sin(t * 0.7) * hr * 0.04;
      circle(ctx, sx * eyeX + look, eyeY + (panic ? -hr * 0.03 : 0), hr * 0.09 * blink + hr * 0.02); ctx.fill();
    }
    // брови
    ctx.strokeStyle = def.brow || def.hair;
    ctx.lineWidth = hr * 0.08;
    ctx.lineCap = 'round';
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      const by = eyeY - hr * (0.28 + panic * 0.12);
      ctx.moveTo(sx * eyeX - hr * 0.16, by + (panic ? sx * hr * 0.1 : 0));
      ctx.lineTo(sx * eyeX + hr * 0.16, by - (panic ? sx * hr * 0.06 : 0));
      ctx.stroke();
    }
    // ніс
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = hr * 0.05;
    ctx.beginPath();
    ctx.moveTo(0, eyeY + hr * 0.1); ctx.lineTo(hr * 0.06, eyeY + hr * 0.3); ctx.lineTo(-hr * 0.05, eyeY + hr * 0.33);
    ctx.stroke();
    // рот
    ctx.strokeStyle = '#9a4b4b';
    ctx.lineWidth = hr * 0.06;
    ctx.beginPath();
    const my = cy + hr * 0.5;
    if (panic > 0.4) {
      // переляканий "О"
      ctx.fillStyle = '#7a2a36';
      ctx.ellipse(0, my, hr * 0.18, hr * 0.24, 0, 0, TAU); ctx.fill();
    } else {
      ctx.moveTo(-hr * 0.22, my);
      ctx.quadraticCurveTo(0, my + hr * 0.18 * (def.smile ?? 1), hr * 0.22, my);
      ctx.stroke();
    }
  }

  /* =================================================================== *
   *  Визначення персонажів-вчених
   * =================================================================== */
  const CHARS = {
    egor: { name: 'Єгор', skin: '#f0c39b', hair: '#5a3a22', hairStyle: 'short',
            coat: '#f4f6fb', shirt: '#3b7dd8', glasses: true, smile: 1, _ph: 0.0 },
    danya: { name: 'Даня', skin: '#f3cda6', hair: '#caa23a', hairStyle: 'spiky',
             coat: '#eef3f7', shirt: '#e0556b', smile: 1.2, _ph: 1.2 },
    pilipyuk: { name: 'Пилипюк', skin: '#e9b489', hair: '#3a2a1c', hairStyle: 'sidepart',
                coat: '#f4f6fb', shirt: '#2fae72', mustache: true, beard: false, smile: 0.8, _ph: 2.1 },
    dima: { name: 'Діма', skin: '#f0c094', hair: '#1d1d24', hairStyle: 'flat',
            coat: '#eef2f8', shirt: '#8a55d6', glasses: '#444', smile: 0.9, _ph: 3.0 },
    kirill: { name: 'Кирило', skin: '#f2c39a', hair: '#7a5230', hairStyle: 'short',
              coat: '#f6f8fc', shirt: '#f2a93b', helmet: '#4db6e8', smile: 1.6, brow: '#7a5230', _ph: 0.6 },
    natasha: { name: 'Наташа', skin: '#f6cda8', hair: '#8a4b2a', hairStyle: 'long',
               coat: '#ffffff', shirt: '#d44f86', apron: '#f7c7d8', cap: '#ffffff', smile: 1.1, _ph: 1.7 },
    molgelevich: { name: 'Молгелевич', skin: '#dfe7c0', hair: '#dddddd', hairStyle: 'bald',
                   coat: '#2a2f3e', shirt: '#9b5de5', glasses: '#9b5de5', brain: true,
                   beard: false, smile: -0.6, brow: '#777', _ph: 2.6 },
  };

  function character(ctx, key, x, y, r, state) {
    human(ctx, x, y, r, CHARS[key], state);
  }

  /* =================================================================== *
   *  "ЇЖА" — об'єкти різних рівнів (намальовані примітивами)
   *  prop(ctx, x, y, r, type, seed, t)
   * =================================================================== */
  function prop(ctx, x, y, r, type, seed = 0, t = 0) {
    ctx.save();
    ctx.translate(x, y);
    const rot = Math.sin(t * 0.5 + seed) * 0.05;
    ctx.rotate(rot);
    (PROPS[type] || PROPS.atom)(ctx, r, seed, t);
    ctx.restore();
  }

  const PROPS = {
    /* --- рівень 1: лабораторія / мікросвіт --- */
    microbe(ctx, r, s) {
      shadow(ctx, 0, r * 0.7, r * 0.8, r * 0.25, 0.15);
      ctx.fillStyle = hsl(120 + s * 40 % 80, 60, 55);
      ctx.beginPath(); ctx.ellipse(0, 0, r * 0.8, r * 0.6, s, 0, TAU); ctx.fill();
      ctx.strokeStyle = hsl(120, 60, 35); ctx.lineWidth = r * 0.06;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU;
        ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.5);
        ctx.lineTo(Math.cos(a) * r * 1.0, Math.sin(a) * r * 0.8); ctx.stroke();
      }
      ctx.fillStyle = hsl(120, 60, 30);
      circle(ctx, -r * 0.2, 0, r * 0.18); ctx.fill();
      circle(ctx, r * 0.25, r * 0.15, r * 0.12); ctx.fill();
    },
    atom(ctx, r, s, t) {
      ctx.strokeStyle = hsl(200 + s * 60 % 100, 80, 60); ctx.lineWidth = r * 0.07;
      for (let i = 0; i < 3; i++) {
        ctx.save(); ctx.rotate(i * Math.PI / 3 + t);
        ctx.beginPath(); ctx.ellipse(0, 0, r * 0.9, r * 0.35, 0, 0, TAU); ctx.stroke();
        ctx.restore();
      }
      ctx.fillStyle = hsl(50, 90, 60); circle(ctx, 0, 0, r * 0.28); ctx.fill();
    },
    pill(ctx, r, s) {
      shadow(ctx, 0, r * 0.6, r * 0.7, r * 0.2, 0.15);
      ctx.save(); ctx.rotate(s);
      roundRect(ctx, -r * 0.7, -r * 0.3, r * 1.4, r * 0.6, r * 0.3);
      ctx.fillStyle = '#fff'; ctx.fill();
      ctx.fillStyle = pick3(s, '#e8554e', '#4e8be8', '#4ec07a');
      ctx.save(); roundRect(ctx, -r * 0.7, -r * 0.3, r * 0.7, r * 0.6, r * 0.3); ctx.clip(); ctx.fillRect(-r * 0.7, -r * 0.3, r * 0.7, r * 0.6); ctx.restore();
      ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = r * 0.04; roundRect(ctx, -r * 0.7, -r * 0.3, r * 1.4, r * 0.6, r * 0.3); ctx.stroke();
      ctx.restore();
    },
    beaker(ctx, r, s) {
      shadow(ctx, 0, r * 0.85, r * 0.6, r * 0.18, 0.18);
      ctx.fillStyle = 'rgba(220,235,245,0.85)';
      ctx.beginPath();
      ctx.moveTo(-r * 0.25, -r * 0.8); ctx.lineTo(-r * 0.25, -r * 0.1);
      ctx.lineTo(-r * 0.6, r * 0.7); ctx.lineTo(r * 0.6, r * 0.7);
      ctx.lineTo(r * 0.25, -r * 0.1); ctx.lineTo(r * 0.25, -r * 0.8); ctx.closePath();
      ctx.fill();
      ctx.fillStyle = pick3(s, '#46d39a', '#e0556b', '#4e8be8');
      ctx.beginPath();
      ctx.moveTo(-r * 0.48, r * 0.25); ctx.lineTo(-r * 0.6, r * 0.7);
      ctx.lineTo(r * 0.6, r * 0.7); ctx.lineTo(r * 0.48, r * 0.25); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(120,150,170,0.9)'; ctx.lineWidth = r * 0.05;
      ctx.beginPath();
      ctx.moveTo(-r * 0.25, -r * 0.8); ctx.lineTo(-r * 0.25, -r * 0.1); ctx.lineTo(-r * 0.6, r * 0.7);
      ctx.lineTo(r * 0.6, r * 0.7); ctx.lineTo(r * 0.25, -r * 0.1); ctx.lineTo(r * 0.25, -r * 0.8); ctx.stroke();
    },
    mouse(ctx, r, s, t) {
      shadow(ctx, 0, r * 0.5, r * 0.7, r * 0.2, 0.18);
      ctx.fillStyle = '#b9bcc6';
      ctx.beginPath(); ctx.ellipse(0, 0, r * 0.8, r * 0.55, 0, 0, TAU); ctx.fill();
      circle(ctx, r * 0.55, -r * 0.2, r * 0.35); ctx.fill(); // голова
      ctx.fillStyle = '#e7a6c4'; circle(ctx, r * 0.4, -r * 0.55, r * 0.18); circle(ctx, r * 0.75, -r * 0.5, r * 0.18); ctx.fill();
      ctx.fillStyle = '#222'; circle(ctx, r * 0.7, -r * 0.22, r * 0.06); ctx.fill();
      ctx.strokeStyle = '#b9bcc6'; ctx.lineWidth = r * 0.06;
      ctx.beginPath(); ctx.moveTo(-r * 0.7, r * 0.1);
      ctx.quadraticCurveTo(-r * 1.2, Math.sin(t * 5 + s) * r * 0.3, -r * 1.3, -r * 0.2); ctx.stroke();
    },

    /* --- рівень 2: кабінет / квартира --- */
    book(ctx, r, s) {
      shadow(ctx, 0, r * 0.7, r * 0.7, r * 0.2, 0.2);
      ctx.save(); ctx.rotate((s % 1 - 0.5) * 0.4);
      ctx.fillStyle = pick3(s, '#c0392b', '#2c6fbb', '#27895a');
      roundRect(ctx, -r * 0.65, -r * 0.5, r * 1.3, r, r * 0.06); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(r * 0.5, -r * 0.5, r * 0.12, r);
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = r * 0.03;
      ctx.strokeRect(-r * 0.5, -r * 0.35, r * 0.9, r * 0.7);
      ctx.restore();
    },
    mug(ctx, r, s) {
      shadow(ctx, 0, r * 0.7, r * 0.6, r * 0.18, 0.2);
      ctx.fillStyle = pick3(s, '#ee7d3a', '#3aa0ee', '#8e44ad');
      roundRect(ctx, -r * 0.5, -r * 0.5, r, r, r * 0.12); ctx.fill();
      ctx.strokeStyle = pick3(s, '#ee7d3a', '#3aa0ee', '#8e44ad'); ctx.lineWidth = r * 0.12;
      ctx.beginPath(); ctx.arc(r * 0.55, 0, r * 0.28, -Math.PI / 2, Math.PI / 2); ctx.stroke();
      ctx.fillStyle = '#5b3a25'; ctx.beginPath(); ctx.ellipse(0, -r * 0.4, r * 0.42, r * 0.14, 0, 0, TAU); ctx.fill();
    },
    laptop(ctx, r, s, t) {
      shadow(ctx, 0, r * 0.55, r * 0.9, r * 0.2, 0.22);
      ctx.fillStyle = '#3a3f4b';
      roundRect(ctx, -r * 0.8, -r * 0.7, r * 1.6, r, r * 0.06); ctx.fill();
      ctx.fillStyle = hsl((t * 60 + s * 100) % 360, 70, 55);
      ctx.fillRect(-r * 0.7, -r * 0.6, r * 1.4, r * 0.8);
      ctx.fillStyle = '#c9ccd6';
      ctx.beginPath();
      ctx.moveTo(-r * 0.95, r * 0.55); ctx.lineTo(r * 0.95, r * 0.55);
      ctx.lineTo(r * 0.8, r * 0.3); ctx.lineTo(-r * 0.8, r * 0.3); ctx.closePath(); ctx.fill();
    },
    chair(ctx, r) {
      shadow(ctx, 0, r * 0.9, r * 0.6, r * 0.18, 0.2);
      ctx.fillStyle = '#7a5a3a';
      ctx.fillRect(-r * 0.45, -r * 0.9, r * 0.18, r * 1.8);
      roundRect(ctx, -r * 0.5, -r * 0.95, r * 0.7, r * 0.7, r * 0.08); ctx.fill();
      roundRect(ctx, -r * 0.5, r * 0.0, r * 0.95, r * 0.22, r * 0.05); ctx.fill();
      ctx.fillRect(r * 0.3, r * 0.2, r * 0.12, r * 0.7);
      ctx.fillRect(-r * 0.45, r * 0.2, r * 0.12, r * 0.7);
    },
    plant(ctx, r, s, t) {
      shadow(ctx, 0, r * 0.85, r * 0.5, r * 0.16, 0.2);
      ctx.fillStyle = '#c8743a';
      ctx.beginPath(); ctx.moveTo(-r * 0.4, r * 0.3); ctx.lineTo(r * 0.4, r * 0.3);
      ctx.lineTo(r * 0.3, r * 0.85); ctx.lineTo(-r * 0.3, r * 0.85); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#2f9e57';
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 2 + (i - 2.5) * 0.4 + Math.sin(t + s + i) * 0.05;
        ctx.save(); ctx.translate(0, r * 0.2); ctx.rotate(a);
        ctx.beginPath(); ctx.ellipse(0, -r * 0.5, r * 0.16, r * 0.55, 0, 0, TAU); ctx.fill();
        ctx.restore();
      }
    },

    /* --- рівень 3: вулиця / місто --- */
    car(ctx, r, s) {
      shadow(ctx, 0, r * 0.55, r * 1.0, r * 0.22, 0.25);
      const col = pick3(s, '#e84d4d', '#4d7de8', '#f0b22e');
      ctx.fillStyle = col;
      roundRect(ctx, -r, -r * 0.25, r * 2, r * 0.6, r * 0.18); ctx.fill();
      roundRect(ctx, -r * 0.55, -r * 0.6, r * 1.1, r * 0.45, r * 0.16); ctx.fill();
      ctx.fillStyle = 'rgba(180,225,255,0.85)';
      roundRect(ctx, -r * 0.45, -r * 0.55, r * 0.9, r * 0.32, r * 0.08); ctx.fill();
      ctx.fillStyle = '#1c1c22';
      circle(ctx, -r * 0.55, r * 0.32, r * 0.26); circle(ctx, r * 0.55, r * 0.32, r * 0.26); ctx.fill();
      ctx.fillStyle = '#cfd3da';
      circle(ctx, -r * 0.55, r * 0.32, r * 0.1); circle(ctx, r * 0.55, r * 0.32, r * 0.1); ctx.fill();
      ctx.fillStyle = '#ffe9a8'; circle(ctx, r * 0.92, -r * 0.05, r * 0.08); ctx.fill();
    },
    tree(ctx, r, s, t) {
      shadow(ctx, 0, r * 0.85, r * 0.7, r * 0.2, 0.25);
      ctx.fillStyle = '#7a4a26';
      ctx.fillRect(-r * 0.12, -r * 0.1, r * 0.24, r * 0.95);
      ctx.fillStyle = '#2f8e4e';
      const sway = Math.sin(t * 1.2 + s) * r * 0.05;
      circle(ctx, sway, -r * 0.45, r * 0.6); ctx.fill();
      circle(ctx, -r * 0.4 + sway, -r * 0.2, r * 0.42); ctx.fill();
      circle(ctx, r * 0.4 + sway, -r * 0.2, r * 0.42); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      circle(ctx, -r * 0.2 + sway, -r * 0.6, r * 0.25); ctx.fill();
    },
    hydrant(ctx, r) {
      shadow(ctx, 0, r * 0.75, r * 0.5, r * 0.15, 0.2);
      ctx.fillStyle = '#d23a3a';
      roundRect(ctx, -r * 0.35, -r * 0.5, r * 0.7, r * 1.1, r * 0.18); ctx.fill();
      circle(ctx, 0, -r * 0.5, r * 0.35); ctx.fill();
      ctx.fillStyle = '#a82a2a'; circle(ctx, -r * 0.5, -r * 0.1, r * 0.18); circle(ctx, r * 0.5, -r * 0.1, r * 0.18); ctx.fill();
      ctx.fillStyle = '#ffd84d'; circle(ctx, 0, -r * 0.5, r * 0.14); ctx.fill();
    },
    bench(ctx, r) {
      shadow(ctx, 0, r * 0.7, r * 0.9, r * 0.18, 0.2);
      ctx.fillStyle = '#3f7a4a';
      for (let i = 0; i < 3; i++) ctx.fillRect(-r * 0.9, -r * 0.4 + i * r * 0.22, r * 1.8, r * 0.14);
      ctx.fillStyle = '#555'; ctx.fillRect(-r * 0.8, r * 0.1, r * 0.12, r * 0.5); ctx.fillRect(r * 0.7, r * 0.1, r * 0.12, r * 0.5);
    },
    person(ctx, r, s, t) {
      // випадковий перехожий
      const c = pick3(s, '#d35400', '#16a085', '#2980b9');
      human(ctx, 0, 0, r * 0.5, {
        skin: '#eebd92', hair: pick3(s + 1, '#3a2a1c', '#caa23a', '#1d1d24'),
        hairStyle: pick3(s, 'short', 'spiky', 'flat'), coat: c, shirt: '#fff', smile: 1, _ph: s
      }, { t: t + s, panic: 0.2 });
    },

    /* --- рівень 4-5: мегамісто / континент --- */
    building(ctx, r, s, t) {
      shadow(ctx, 0, r * 0.95, r * 0.8, r * 0.18, 0.3);
      const col = pick3(s, '#6b7a8f', '#8f7a6b', '#7a6b8f');
      ctx.fillStyle = col;
      roundRect(ctx, -r * 0.6, -r, r * 1.2, r * 1.95, r * 0.04); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(-r * 0.6, -r, r * 0.25, r * 1.95);
      // вікна
      for (let yy = -0.85; yy < 0.85; yy += 0.28) {
        for (let xx = -0.4; xx <= 0.4; xx += 0.28) {
          const lit = hash2((xx * 100) | 0, (yy * 100 + s * 50) | 0) > 0.55;
          ctx.fillStyle = lit ? hsl(48, 90, 70) : 'rgba(40,50,65,0.8)';
          ctx.fillRect(xx * r - r * 0.09, yy * r - r * 0.09, r * 0.18, r * 0.22);
        }
      }
      ctx.fillStyle = col; roundRect(ctx, -r * 0.7, -r * 1.12, r * 1.4, r * 0.18, r * 0.04); ctx.fill();
    },
    tower(ctx, r, s) {
      shadow(ctx, 0, r * 0.95, r * 0.6, r * 0.16, 0.3);
      ctx.fillStyle = '#9aa7b5';
      ctx.beginPath();
      ctx.moveTo(-r * 0.5, r * 0.95); ctx.lineTo(-r * 0.18, -r * 0.9);
      ctx.lineTo(r * 0.18, -r * 0.9); ctx.lineTo(r * 0.5, r * 0.95); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = r * 0.03;
      for (let i = 0; i < 5; i++) { const y = -0.8 + i * 0.35; ctx.beginPath(); ctx.moveTo(-r * (0.5 - i * 0.06), y * r); ctx.lineTo(r * (0.5 - i * 0.06), y * r); ctx.stroke(); }
      ctx.fillStyle = '#e74c3c'; circle(ctx, 0, -r * 0.95, r * 0.07); ctx.fill();
    },
    house(ctx, r, s) {
      shadow(ctx, 0, r * 0.85, r * 0.8, r * 0.18, 0.25);
      ctx.fillStyle = pick3(s, '#e8d6b3', '#d6e8c0', '#e8c0c8');
      ctx.fillRect(-r * 0.6, -r * 0.1, r * 1.2, r * 0.95);
      ctx.fillStyle = pick3(s, '#b5462f', '#2f6bb5', '#7a4ab5');
      ctx.beginPath(); ctx.moveTo(-r * 0.75, -r * 0.1); ctx.lineTo(0, -r * 0.8); ctx.lineTo(r * 0.75, -r * 0.1); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#6b4a2a'; ctx.fillRect(-r * 0.15, r * 0.35, r * 0.3, r * 0.5);
      ctx.fillStyle = '#9ad0f0'; ctx.fillRect(-r * 0.45, r * 0.05, r * 0.22, r * 0.22); ctx.fillRect(r * 0.23, r * 0.05, r * 0.22, r * 0.22);
    },
    cloud(ctx, r, s, t) {
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      const o = Math.sin(t + s) * r * 0.05;
      circle(ctx, -r * 0.4, o, r * 0.5); circle(ctx, r * 0.4, -o, r * 0.5);
      circle(ctx, 0, -r * 0.25, r * 0.6); circle(ctx, 0, r * 0.1, r * 0.55); ctx.fill();
    },
    satellite(ctx, r, s, t) {
      ctx.save(); ctx.rotate(t * 0.3 + s);
      ctx.fillStyle = '#cfd6e0'; roundRect(ctx, -r * 0.25, -r * 0.25, r * 0.5, r * 0.5, r * 0.06); ctx.fill();
      ctx.fillStyle = '#2b3a8f'; ctx.fillRect(-r * 0.95, -r * 0.2, r * 0.55, r * 0.4); ctx.fillRect(r * 0.4, -r * 0.2, r * 0.55, r * 0.4);
      ctx.strokeStyle = '#8893a5'; ctx.lineWidth = r * 0.04;
      ctx.strokeRect(-r * 0.95, -r * 0.2, r * 0.55, r * 0.4); ctx.strokeRect(r * 0.4, -r * 0.2, r * 0.55, r * 0.4);
      ctx.restore();
    },
    planet(ctx, r, s, t) {
      const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.2, 0, 0, r);
      g.addColorStop(0, hsl(200 + s * 80 % 120, 60, 60));
      g.addColorStop(1, hsl(220 + s * 60 % 120, 60, 30));
      ctx.fillStyle = g; circle(ctx, 0, 0, r); ctx.fill();
      ctx.fillStyle = 'rgba(80,200,120,0.5)';
      circle(ctx, -r * 0.3, r * 0.2, r * 0.3); circle(ctx, r * 0.35, -r * 0.25, r * 0.22); ctx.fill();
      ctx.save(); ctx.rotate(-0.5 + Math.sin(t * 0.2) * 0.05);
      ctx.strokeStyle = 'rgba(255,230,180,0.7)'; ctx.lineWidth = r * 0.08;
      ctx.beginPath(); ctx.ellipse(0, 0, r * 1.5, r * 0.4, 0, 0, TAU); ctx.stroke();
      ctx.restore();
    },
    star(ctx, r, s, t) {
      ctx.fillStyle = hsl(50, 90, 65);
      star(ctx, 0, 0, 5, r, r * 0.45, t * 0.5 + s); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.6)'; circle(ctx, 0, 0, r * 0.25); ctx.fill();
    },
  };

  function pick3(s, a, b, c) { const i = Math.abs((s * 9973) | 0) % 3; return i === 0 ? a : i === 1 ? b : c; }

  /* ----------------------- частинки поїдання ------------------------- */
  function sparkle(ctx, x, y, r, hue, a) {
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = hsl(hue, 90, 65);
    star(ctx, x, y, 4, r, r * 0.4, 0); ctx.fill();
    ctx.restore();
  }

  return { nikita, character, human, prop, CHARS, PROPS, sparkle, shadow, roundRect, circle, star };
})();
