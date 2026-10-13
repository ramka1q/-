'use strict';
// ============================================================
//  Персонажи: учёные НИИ «Мозгоправ» и сам Никита.
//  Все нарисованы кодом. Рамка: ноги в (0,0), рост ~100.
// ============================================================
const CH = {
  egor: { name: 'Егор', role: 'Глава лаборатории', skin: '#ffd7b5', hair: '#3b2a1a', hairStyle: 'spiky', coat: '#f8f9fa', shirt: '#4dabf7', pants: '#343a40', glasses: 'rect', acc: 'tablet', h: 1.05, color: '#4dabf7' },
  danya: { name: 'Даня', role: 'Инженер-робототехник', skin: '#ffe0c7', hair: '#d9480f', hairStyle: 'curly', coat: '#ff922b', shirt: '#f8f9fa', pants: '#495057', goggles: true, freckles: true, acc: 'wrench', h: 1.0, color: '#ff922b' },
  pylypyuk: { name: 'Пилипюк', role: 'Химик', skin: '#f1c27d', hair: '#adb5bd', hairStyle: 'bald', mustache: '#868e96', coat: '#f8f9fa', shirt: '#e9ecef', bow: '#e03131', glasses: 'round', acc: 'flask', belly: true, h: 0.98, color: '#51cf66' },
  dima: { name: 'Дима', role: 'Охрана и пилот', skin: '#e0ac69', hair: '#e8c35c', hairStyle: 'buzz', cap: '#2b8a3e', coat: '#3e4a24', shirt: '#5c6b38', pants: '#3e4a24', shades: true, acc: 'netgun', h: 1.08, wide: true, color: '#82c91e' },
  kirill: { name: 'Кирилл', role: 'Гений в своём мире', skin: '#ffe0c7', hair: '#6b3e1f', hairStyle: 'messy', propeller: true, coat: '#f8f9fa', shirt: '#ffd43b', pants: '#5c7cfa', bigEyes: true, acc: 'lollipop', h: 0.92, color: '#ffd43b', crooked: true },
  natasha: { name: 'Наташа', role: 'Няня Кирилла', skin: '#ffd7b5', hair: '#7b4a26', hairStyle: 'bun', coat: null, dress: '#9775fa', apron: '#fff', pants: null, acc: 'bag', lashes: true, h: 0.97, color: '#9775fa' },
  molgelevich: { name: 'Молгелевич', role: 'Директор НИИ. Злой гений', skin: '#f1c27d', hair: '#f1f3f5', hairStyle: 'wild', coat: '#5f3dc4', shirt: '#212529', pants: '#212529', cape: '#862e9c', monocle: true, acc: 'remote', bigHead: true, h: 1.1, color: '#be4bdb' },
  nikita: { name: 'Никита', role: 'Голодный стажёр', skin: '#ffd7b5', hair: '#2b1d14', hairStyle: 'short', coat: null, hoodie: '#7048e8', pants: '#343a40', acc: null, h: 1.0, color: '#9775fa' },
};

const Chars = {
  photo: null,        // исходная картинка
  photoCanvas: null,  // круглая обрезка 256x256
  crop: { x: 0, y: 0, s: 1 },

  // ---------- фото Никиты ----------
  setPhoto(img, crop) {
    this.photo = img;
    if (crop) this.crop = crop;
    this.renderPhoto();
  },
  renderPhoto() {
    if (!this.photo) { this.photoCanvas = null; return; }
    const N = 256, cv = document.createElement('canvas'); cv.width = cv.height = N;
    const c = cv.getContext('2d');
    c.beginPath(); c.arc(N / 2, N / 2, N / 2, 0, TAU); c.clip();
    const img = this.photo, iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    const base = N / Math.min(iw, ih) * this.crop.s;
    const w = iw * base, h = ih * base;
    c.drawImage(img, N / 2 - w / 2 + this.crop.x * N, N / 2 - h / 2 + this.crop.y * N, w, h);
    this.photoCanvas = cv;
  },
  // Круглое лицо Никиты (фото или нарисованное)
  face(c, x, y, r, expr = 'happy', t = 0) {
    if (this.photoCanvas) {
      c.drawImage(this.photoCanvas, x - r, y - r, r * 2, r * 2);
      circ(c, x, y, r, null, OL, Math.max(1.5, r * 0.08));
      return;
    }
    // нарисованный Никита
    const sp = CH.nikita;
    circ(c, x, y, r, rg(c, x, y, r, [U.shade(sp.skin, 0.3), sp.skin, U.shade(sp.skin, -0.2)]), OL, Math.max(1.5, r * 0.08));
    c.save(); c.beginPath(); c.arc(x, y, r, 0, TAU); c.clip();
    c.beginPath(); c.moveTo(x - r * 1.1, y - r * 0.15);
    for (let i = 0; i <= 8; i++) c.lineTo(x - r + i * r / 4, y - r * (i % 2 ? 0.5 : 0.32));
    c.lineTo(x + r * 1.1, y - r * 0.15); c.lineTo(x + r, y - r * 1.2); c.lineTo(x - r, y - r * 1.2); c.closePath();
    c.fillStyle = sp.hair; c.fill(); c.restore();
    this.drawFace(c, x, y + r * 0.12, r / 20, expr, t, {});
  },

  // ---------- общий рисовальщик ----------
  draw(c, who, o = {}) {
    const sp = CH[who] || CH.egor;
    const t = o.t || 0, s = (o.scale || 1) * sp.h;
    c.save();
    c.translate(o.x || 0, o.y || 0);
    if (o.flip) c.scale(-1, 1);
    c.scale(s, s);
    c.lineJoin = 'round'; c.lineCap = 'round';
    const pose = o.pose || 'stand', expr = o.expr || 'normal';
    const breathe = Math.sin(t * 2.2) * 1.2;
    const sw = Math.sin(t * 12);
    // тень
    c.save(); c.globalAlpha = 0.18; ell(c, 0, 0, 26, 6, 0, '#000', null); c.restore();
    // ноги
    const legCol = sp.pants || sp.skin;
    let lA = 0, rA = 0;
    if (pose === 'run') { lA = sw * 0.6; rA = -sw * 0.6; }
    if (pose === 'jump') { lA = -0.4; rA = 0.4; }
    this.leg(c, -8, -20, lA, legCol, sp);
    this.leg(c, 8, -20, rA, legCol, sp);
    c.translate(0, breathe * 0.3 + (pose === 'run' ? Math.abs(sw) * -3 : 0));
    // плащ сзади
    if (sp.cape) { poly(c, [-18, -54, 18, -54, 30, -6, -30, -6], sp.cape); }
    // руки: позиции кистей
    const hands = this.hands(pose, t);
    const sh = sp.wide ? 18 : 15;
    // задняя рука (левая)
    this.arm(c, -sh, -50, hands[0], hands[1], sp);
    // туловище
    this.body(c, sp, breathe);
    // голова
    const hy = -74 + breathe * 0.4;
    this.head(c, who, sp, hy, expr, t, o);
    // передняя рука (правая) + предмет
    this.arm(c, sh, -50, hands[2], hands[3], sp);
    if (o.acc !== false) this.accessory(c, o.accName || sp.acc, hands[2], hands[3], t);
    c.restore();
  },

  hands(pose, t) {
    const w = Math.sin(t * 10);
    switch (pose) {
      case 'point': return [-22, -24, 46, -56];
      case 'armsUp': return [-30, -92 + w * 3, 30, -92 - w * 3];
      case 'run': return [-24 + Math.sin(t * 12) * 10, -32, 24 - Math.sin(t * 12) * 10, -32];
      case 'think': return [-20, -24, 6, -62];
      case 'hold': return [-12, -36, 12, -36];
      case 'wave': return [-22, -24, 34, -84 + w * 8];
      case 'facepalm': return [-22, -24, 2, -76];
      case 'shrug': return [-36, -54, 36, -54];
      case 'jump': return [-32, -88, 32, -88];
      case 'scared': return [-14, -64, 14, -64];
      case 'grab': return [-40, -50, 40, -50];
      default: return [-22, -24 + w * 0.5, 22, -24 - w * 0.5];
    }
  },
  leg(c, x, y, a, col, sp) {
    const fx = x + Math.sin(a) * 20, fy = y + Math.cos(a) * 20;
    line(c, x, y, fx, fy, OL, 10); line(c, x, y, fx, fy, col, 7);
    ell(c, fx + 3, fy, 7, 4, 0, sp.shoes || '#212529', OL, 2);
  },
  arm(c, x, y, hx, hy, sp) {
    const sleeve = sp.coat || sp.hoodie || sp.dress || sp.shirt;
    const mx = (x + hx) / 2 + (hx > x ? 4 : -4), my = (y + hy) / 2 + 4;
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(mx, my, hx, hy); c.lineWidth = 11; c.strokeStyle = OL; c.stroke();
    c.lineWidth = 8; c.strokeStyle = sleeve; c.stroke();
    circ(c, hx, hy, 4.5, sp.skin, OL, 2);
  },
  body(c, sp, breathe) {
    const w = sp.wide ? 20 : sp.belly ? 19 : 16;
    if (sp.dress) { // Наташа
      poly(c, [-14, -54, 14, -54, 24, -16, -24, -16], sp.dress);
      poly(c, [-10, -46, 10, -46, 15, -18, -15, -18], sp.apron, OL, 2);
      circ(c, 0, -32, 3, '#ff8787', null);
      return;
    }
    if (sp.hoodie) {
      rect(c, -w, -56, w * 2, 40, 10, sp.hoodie);
      rect(c, -9, -36, 18, 10, 4, U.shade(sp.hoodie, -0.15), OL, 2);
      line(c, -4, -54, -5, -44, '#fff', 2); line(c, 4, -54, 5, -44, '#fff', 2);
      return;
    }
    rect(c, -w + 3, -55, (w - 3) * 2, 38, 8, sp.shirt);
    if (sp.coat) {
      // халат/жилет с отворотами
      poly(c, [-w, -56, -4, -56, -2, -40, -6, -16, -w - 2, -16], sp.coat);
      poly(c, [w, -56, 4, -56, 2, -40, 6, -16, w + 2, -16], sp.coat);
      if (sp.coat === '#f8f9fa') { rect(c, -w + 3, -36, 8, 6, 1, null, U.rgba(OL, 0.4), 1.5); circ(c, 7, -30, 1.5, OL, null); circ(c, 7, -24, 1.5, OL, null); }
      if (sp.crooked) { circ(c, 6, -44, 2, '#e03131', null); circ(c, 7, -36, 2, '#4dabf7', null); circ(c, 5, -22, 2, '#51cf66', null); }
    }
    if (sp.belly) ell(c, 0, -30, 12, 12, 0, U.rgba('#fff', 0.15), null);
    if (sp.bow) { poly(c, [0, -54, -8, -58, -8, -50], sp.bow, OL, 1.5); poly(c, [0, -54, 8, -58, 8, -50], sp.bow, OL, 1.5); circ(c, 0, -54, 2, sp.bow, OL, 1); }
  },
  head(c, who, sp, hy, expr, t, o) {
    const R = sp.bigHead ? 23 : 20;
    // волосы сзади
    if (sp.hairStyle === 'wild') {
      for (let i = 0; i < 14; i++) {
        const a = Math.PI + (i / 13) * Math.PI * 1.2 - 0.1 * Math.PI;
        const l = R + 12 + Math.sin(i * 2.3 + t * 3) * 3;
        poly(c, [Math.cos(a - 0.25) * R * 0.9, hy + Math.sin(a - 0.25) * R * 0.9, Math.cos(a) * l, hy + Math.sin(a) * l, Math.cos(a + 0.25) * R * 0.9, hy + Math.sin(a + 0.25) * R * 0.9], sp.hair, OL, 2);
      }
    }
    if (sp.hairStyle === 'bun') circ(c, 0, hy - R - 4, 9, sp.hair);
    if (sp.hairStyle === 'curly') for (let i = 0; i < 9; i++) { const a = Math.PI + (i / 8) * Math.PI; circ(c, Math.cos(a) * R, hy + Math.sin(a) * R * 0.95, 8, sp.hair); }
    if (sp.hairStyle === 'messy') for (let i = 0; i < 7; i++) { const a = Math.PI * 1.05 + (i / 6) * Math.PI * 0.9; poly(c, [Math.cos(a - 0.3) * R, hy + Math.sin(a - 0.3) * R, Math.cos(a) * (R + 9 + (i % 2) * 4), hy + Math.sin(a) * (R + 9 + (i % 2) * 4), Math.cos(a + 0.3) * R, hy + Math.sin(a + 0.3) * R], sp.hair, OL, 2); }
    // лицо Никиты-человека — фото
    if (who === 'nikita' && this.photoCanvas && o.photo !== false) {
      this.face(c, 0, hy, R + 2, expr, t);
      return;
    }
    // уши + голова
    circ(c, -R, hy + 2, 5, sp.skin); circ(c, R, hy + 2, 5, sp.skin);
    circ(c, 0, hy, R, rg(c, 0, hy, R, [U.shade(sp.skin, 0.25), sp.skin, U.shade(sp.skin, -0.15)]));
    // волосы спереди
    const hairCap = (h) => { c.beginPath(); c.arc(0, hy, R, Math.PI * 1.02, Math.PI * 1.98); c.quadraticCurveTo(0, hy - R * h, -R * 0.98, hy - R * 0.2); c.closePath(); fs(c, sp.hair, OL, 2.5); };
    switch (sp.hairStyle) {
      case 'spiky':
        hairCap(0.4);
        for (let i = 0; i < 6; i++) { const x = -R * 0.8 + i * R * 0.32; poly(c, [x - 5, hy - R * 0.7, x + 2, hy - R - 9 - (i % 2) * 4, x + 7, hy - R * 0.7], sp.hair, OL, 2); }
        break;
      case 'curly': hairCap(0.3); for (let i = 0; i < 5; i++) circ(c, -R * 0.6 + i * R * 0.3, hy - R * 0.75, 6, sp.hair, OL, 2); break;
      case 'bald':
        circ(c, -R * 0.88, hy - 4, 8, sp.hair); circ(c, R * 0.88, hy - 4, 8, sp.hair);
        hl(c, -6, hy - R * 0.6, 7, 3, 0.6);
        break;
      case 'buzz': c.beginPath(); c.arc(0, hy, R, Math.PI * 1.05, Math.PI * 1.95); c.quadraticCurveTo(0, hy - R * 0.55, -R * 0.95, hy - R * 0.3); c.closePath(); fs(c, sp.hair, null); break;
      case 'messy': hairCap(0.3); break;
      case 'bun': hairCap(0.35); break;
      case 'wild': hairCap(0.15); break;
      case 'short': hairCap(0.35); break;
    }
    if (sp.cap) { // кепка задом наперёд
      c.beginPath(); c.arc(0, hy - 4, R + 1, Math.PI, 0); c.closePath(); fs(c, sp.cap, OL, 2.5);
      rect(c, -R - 8, hy - 8, 14, 6, 3, U.shade(sp.cap, -0.2));
    }
    if (sp.propeller) { // шапочка с пропеллером
      c.beginPath(); c.arc(0, hy - R * 0.55, R * 0.8, Math.PI, 0); c.closePath(); fs(c, '#e03131', OL, 2);
      c.beginPath(); c.arc(0, hy - R * 0.55, R * 0.8, Math.PI, Math.PI * 1.33); c.lineTo(0, hy - R * 0.55); c.closePath(); fs(c, '#ffd43b', null);
      c.beginPath(); c.arc(0, hy - R * 0.55, R * 0.8, Math.PI * 1.66, 0); c.lineTo(0, hy - R * 0.55); c.closePath(); fs(c, '#4dabf7', null);
      line(c, 0, hy - R * 1.35, 0, hy - R * 1.6, OL, 2);
      const pa = t * 14;
      const pw = Math.abs(Math.cos(pa)) * 16 + 2;
      ell(c, 0, hy - R * 1.65, pw, 3, 0, '#51cf66', OL, 1.5);
    }
    if (sp.goggles) { rect(c, -R * 0.85, hy - R * 0.72, R * 1.7, 7, 3, '#495057', OL, 2); circ(c, -7, hy - R * 0.6, 5, '#a5d8ff', OL, 2); circ(c, 7, hy - R * 0.6, 5, '#a5d8ff', OL, 2); }
    this.drawFace(c, 0, hy, 1, expr, t, sp, o);
    if (sp.freckles) for (const s of [-1, 1]) for (let i = 0; i < 3; i++) circ(c, s * (10 + i * 2), hy + 6 + (i % 2) * 2, 1, '#c0703c', null);
    if (sp.glasses === 'rect') { rect(c, -14, hy - 6, 11, 9, 2, U.rgba('#e7f5ff', 0.35), OL, 2); rect(c, 3, hy - 6, 11, 9, 2, U.rgba('#e7f5ff', 0.35), OL, 2); line(c, -3, hy - 2, 3, hy - 2, OL, 2); }
    if (sp.glasses === 'round') { circ(c, -7, hy - 1, 6, U.rgba('#e7f5ff', 0.3), OL, 2); circ(c, 7, hy - 1, 6, U.rgba('#e7f5ff', 0.3), OL, 2); line(c, -1, hy - 1, 1, hy - 1, OL, 2); }
    if (sp.shades && expr !== 'shock') { rect(c, -15, hy - 6, 12, 7, 3, '#212529', OL, 1.5); rect(c, 3, hy - 6, 12, 7, 3, '#212529', OL, 1.5); line(c, -3, hy - 4, 3, hy - 4, OL, 2); line(c, -10, hy - 5, -7, hy - 3, U.rgba('#fff', 0.6), 1.5); }
    if (sp.monocle) { circ(c, 8, hy - 2, 7, U.rgba('#fff3bf', 0.35), '#f59f00', 2.5); line(c, 14, hy + 2, 18, hy + 20, '#f59f00', 1.5); }
    if (sp.mustache) {
      c.beginPath(); c.moveTo(0, hy + 7);
      c.quadraticCurveTo(-8, hy + 3, -16, hy + 10); c.quadraticCurveTo(-8, hy + 13, 0, hy + 10);
      c.quadraticCurveTo(8, hy + 13, 16, hy + 10); c.quadraticCurveTo(8, hy + 3, 0, hy + 7); fs(c, sp.mustache, OL, 2);
    }
  },
  // Лицо: глаза, брови, рот по эмоции. k — масштаб
  drawFace(c, x, y, k, expr, t, sp, o = {}) {
    const blink = (t % 3.7) < 0.12 && expr !== 'shock';
    const er = (sp && sp.bigEyes ? 5.2 : 4) * k;
    const ex = 7 * k, ey = y - 1 * k;
    const talk = o.talking ? Math.abs(Math.sin(t * 14)) : 0;
    c.lineCap = 'round';
    const eye = (sx, h = 1, look = 0) => {
      if (blink) { line(c, sx - er, ey, sx + er, ey, OL, 2 * k); return; }
      ell(c, sx, ey, er, er * 1.15 * h, 0, '#fff', OL, 1.5 * k);
      circ(c, sx + look * k, ey + 0.5 * k, er * 0.55, OL, null);
      circ(c, sx + look * k + er * 0.2, ey - er * 0.2, er * 0.2, '#fff', null);
    };
    const brow = (sx, a, dy = 0) => { c.save(); c.translate(sx, ey - er * 1.7 + dy * k); c.rotate(a); line(c, -4.5 * k, 0, 4.5 * k, 0, OL, 2.2 * k); c.restore(); };
    const mouthO = (w, h) => ell(c, x, y + 11 * k, w * k, h * k, 0, '#5c1a1a', OL, 1.5 * k);
    switch (expr) {
      case 'happy':
        if (!blink) { c.beginPath(); c.arc(x - ex, ey + 1 * k, er * 0.9, Math.PI * 1.1, Math.PI * 1.9); c.lineWidth = 2.2 * k; c.strokeStyle = OL; c.stroke(); c.beginPath(); c.arc(x + ex, ey + 1 * k, er * 0.9, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
        else { eye(x - ex); eye(x + ex); }
        c.beginPath(); c.arc(x, y + 6 * k, 6 * k, 0.1 * Math.PI, 0.9 * Math.PI); c.closePath(); fs(c, '#5c1a1a', OL, 1.8 * k);
        break;
      case 'angry':
        eye(x - ex, 0.8); eye(x + ex, 0.8); brow(x - ex, 0.45, 1); brow(x + ex, -0.45, 1);
        if (talk > 0.3) mouthO(5, 2 + talk * 3); else { c.beginPath(); c.arc(x, y + 14 * k, 5 * k, 1.15 * Math.PI, 1.85 * Math.PI); c.lineWidth = 2 * k; c.strokeStyle = OL; c.stroke(); }
        break;
      case 'shock':
        ell(c, x - ex, ey, er * 1.2, er * 1.4, 0, '#fff', OL, 1.5 * k); ell(c, x + ex, ey, er * 1.2, er * 1.4, 0, '#fff', OL, 1.5 * k);
        circ(c, x - ex, ey, er * 0.35, OL, null); circ(c, x + ex, ey, er * 0.35, OL, null);
        brow(x - ex, -0.25, -2); brow(x + ex, 0.25, -2);
        mouthO(4, 5 + talk * 1.5);
        break;
      case 'sad':
        eye(x - ex, 0.9); eye(x + ex, 0.9); brow(x - ex, -0.35); brow(x + ex, 0.35);
        c.beginPath(); c.arc(x, y + 14 * k, 5 * k, 1.2 * Math.PI, 1.8 * Math.PI); c.lineWidth = 2 * k; c.strokeStyle = OL; c.stroke();
        circ(c, x - ex - 2 * k, ey + 7 * k, 1.8 * k, '#74c0fc', null);
        break;
      case 'smug':
        eye(x - ex, 0.6, 1); eye(x + ex, 0.6, 1); brow(x - ex, 0.1); brow(x + ex, -0.3, -1);
        c.beginPath(); c.moveTo(x - 5 * k, y + 9 * k); c.quadraticCurveTo(x + 2 * k, y + 12 * k, x + 7 * k, y + 7 * k); c.lineWidth = 2 * k; c.strokeStyle = OL; c.stroke();
        break;
      case 'crazy':
        ell(c, x - ex, ey, er * 1.3, er * 1.3, 0, '#fff', OL, 1.5 * k); circ(c, x - ex + Math.sin(t * 5) * 1.5 * k, ey + Math.cos(t * 5) * 1.5 * k, er * 0.5, OL, null);
        ell(c, x + ex, ey, er * 0.8, er * 0.8, 0, '#fff', OL, 1.5 * k); circ(c, x + ex - Math.sin(t * 7) * k, ey, er * 0.4, OL, null);
        c.beginPath(); c.arc(x, y + 7 * k, 7 * k, 0.05 * Math.PI, 0.95 * Math.PI); c.closePath(); fs(c, '#5c1a1a', OL, 1.8 * k);
        ell(c, x + 2 * k, y + 12 * k, 3 * k, 2.5 * k, 0, '#ff8787', null);
        break;
      case 'evil':
        eye(x - ex, 0.7, 1); eye(x + ex, 0.7, 1); brow(x - ex, 0.55, 1); brow(x + ex, -0.55, 1);
        c.beginPath(); c.moveTo(x - 9 * k, y + 7 * k); c.quadraticCurveTo(x, y + 16 * k + talk * 3 * k, x + 9 * k, y + 7 * k); c.closePath(); fs(c, '#5c1a1a', OL, 1.8 * k);
        rect(c, x - 6 * k, y + 7 * k, 12 * k, 2.5 * k, 1, '#fff', null);
        break;
      case 'tired':
        line(c, x - ex - er, ey + 1 * k, x - ex + er, ey + 1 * k, OL, 2 * k); line(c, x + ex - er, ey + 1 * k, x + ex + er, ey + 1 * k, OL, 2 * k);
        c.beginPath(); c.arc(x - ex, ey + 3 * k, er, 0.2, Math.PI - 0.2); c.lineWidth = 1.2 * k; c.strokeStyle = U.rgba('#7048e8', 0.5); c.stroke();
        c.beginPath(); c.arc(x + ex, ey + 3 * k, er, 0.2, Math.PI - 0.2); c.stroke();
        if (talk > 0.3) mouthO(4, 1.5 + talk * 2.5); else line(c, x - 4 * k, y + 11 * k, x + 4 * k, y + 11 * k, OL, 2 * k);
        break;
      case 'determined':
        eye(x - ex, 0.85); eye(x + ex, 0.85); brow(x - ex, 0.25, 1); brow(x + ex, -0.25, 1);
        if (talk > 0.3) mouthO(5, 2 + talk * 3); else line(c, x - 5 * k, y + 11 * k, x + 5 * k, y + 10 * k, OL, 2.2 * k);
        break;
      default: // normal
        eye(x - ex); eye(x + ex); brow(x - ex, 0.05); brow(x + ex, -0.05);
        if (talk > 0.2) mouthO(4, 1.5 + talk * 3);
        else { c.beginPath(); c.arc(x, y + 7 * k, 5 * k, 0.2 * Math.PI, 0.8 * Math.PI); c.lineWidth = 2 * k; c.strokeStyle = OL; c.stroke(); }
    }
    if (sp && sp.lashes && !blink) { for (const s of [-1, 1]) { line(c, x + s * ex + s * er * 0.8, ey - er * 0.8, x + s * ex + s * er * 1.4, ey - er * 1.3, OL, 1.5 * k); } }
    if (o && o.blush) { c.save(); c.globalAlpha = 0.35; ell(c, x - 12 * k, y + 6 * k, 4 * k, 2.5 * k, 0, '#ff6b6b', null); ell(c, x + 12 * k, y + 6 * k, 4 * k, 2.5 * k, 0, '#ff6b6b', null); c.restore(); }
  },
  accessory(c, acc, hx, hy, t) {
    if (!acc) return;
    c.save(); c.translate(hx, hy);
    switch (acc) {
      case 'tablet': c.rotate(-0.2); rect(c, -2, -16, 20, 26, 3, '#343a40'); rect(c, 1, -13, 14, 20, 2, '#4dabf7', null); line(c, 3, -8, 12, -8, '#fff', 1.5); line(c, 3, -3, 10, -3, '#fff', 1.5); break;
      case 'wrench': c.rotate(-0.8); rect(c, -3, -28, 6, 30, 3, '#adb5bd'); c.beginPath(); c.arc(0, -30, 7, 0.5, TAU - 0.5 + Math.PI); fs(c, '#ced4da', OL, 2); break;
      case 'flask': c.rotate(0.15); poly(c, [-3, -26, 3, -26, 3, -16, 12, 2, -12, 2, -3, -16], U.rgba('#e7f5ff', 0.6)); poly(c, [-8, -6, 8, -6, 12, 2, -12, 2], '#51cf66', null); poly(c, [-3, -26, 3, -26, 3, -16, 12, 2, -12, 2, -3, -16], null, OL, 2); circ(c, 2, -30 - (t * 20 % 10), 2, U.rgba('#51cf66', 0.6), null); break;
      case 'netgun': c.rotate(-0.1); rect(c, -4, -6, 30, 10, 3, '#495057'); rect(c, 22, -9, 10, 16, 3, '#2b8a3e'); rect(c, -2, 2, 7, 10, 2, '#343a40'); break;
      case 'lollipop': line(c, 0, 0, 0, -20, '#fff', 3); circ(c, 0, -28, 9, '#ff8fab'); c.beginPath(); for (let i = 0; i < 20; i++) { const a = i * 0.6, r = i * 0.45; i ? c.lineTo(Math.cos(a) * r, -28 + Math.sin(a) * r) : c.moveTo(0, -28); } c.lineWidth = 2; c.strokeStyle = '#fff'; c.stroke(); break;
      case 'bag': rect(c, -10, -2, 20, 16, 4, '#c2255c'); c.beginPath(); c.arc(0, -2, 6, Math.PI, 0); c.lineWidth = 2.5; c.strokeStyle = OL; c.stroke(); break;
      case 'remote': c.rotate(-0.3); rect(c, -4, -18, 10, 22, 3, '#212529'); circ(c, 1, -12, 3, '#e03131', null); circ(c, 1, -4, 2, '#51cf66', null); break;
      case 'broom': c.rotate(0.5); line(c, 0, 20, 0, -40, '#8b5e34', 4); poly(c, [-9, 20, 9, 20, 13, 38, -13, 38], '#e8c35c'); break;
      case 'pizza': c.rotate(-0.3); poly(c, [0, 0, -14, -26, 14, -26], '#ffd43b'); rect(c, -15, -30, 30, 6, 3, '#d9822b'); circ(c, -2, -16, 3, '#e03131', null); break;
      case 'pie': ell(c, 0, -6, 12, 7, 0, '#f4a742'); break;
    }
    c.restore();
  },

  // Портрет (голова в круге) — для HUD и комиксов
  portrait(c, who, cx, cy, R, o = {}) {
    c.save();
    c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.closePath();
    c.fillStyle = o.bg || (CH[who] ? U.shade(CH[who].color, 0.55) : '#eee'); c.fill();
    c.clip();
    const sc = R / 30;
    this.draw(c, who, Object.assign({ x: cx, y: cy + 74 * sc * (CH[who] ? CH[who].h : 1) + R * 0.05, scale: sc, acc: false }, o));
    c.restore();
    circ(c, cx, cy, R, null, OL, Math.max(2, R * 0.08));
  },

  // ============================================================
  //  НИКИТА-СУЩЕСТВО: голодный слизень с лицом Никиты
  // ============================================================
  // o: t, chomp(0..1), dir(рад), speed(0..1), tint(цвет краски), hurt, stun, shield, dash
  nikita(c, x, y, r, o = {}) {
    const t = o.t || 0;
    const base = o.tint || '#9b5cff';
    c.save(); c.translate(x, y);
    // ауры
    if (o.shield) { c.save(); c.globalAlpha = 0.35 + Math.sin(t * 6) * 0.1; circ(c, 0, 0, r * 1.35, U.rgba('#74c0fc', 0.4), '#4dabf7', r * 0.06); c.restore(); }
    if (o.dash) { c.save(); c.globalAlpha = 0.25; for (let i = 1; i <= 3; i++) { blob(c, -Math.cos(o.dir) * r * 0.5 * i, -Math.sin(o.dir) * r * 0.5 * i, r * (1 - i * 0.15), 12, 0.1, i, base, null); } c.restore(); }
    // сжатие/растяжение по направлению движения
    const st = 1 + (o.speed || 0) * 0.12 + (o.chomp || 0) * 0.08;
    c.save();
    c.rotate(o.dir || 0); c.scale(st, 1 / st); c.rotate(-(o.dir || 0));
    // тень
    c.save(); c.globalAlpha = 0.22; ell(c, r * 0.08, r * 0.15, r * 1.05, r * 0.95, 0, '#000', null); c.restore();
    // тело — волнистый слизень
    c.beginPath();
    const N = 28;
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * TAU;
      const wob = 1 + 0.06 * Math.sin(a * 5 + t * 4) + 0.04 * Math.sin(a * 3 - t * 3) + (o.chomp || 0) * 0.05 * Math.sin(a * 8);
      const px = Math.cos(a) * r * wob, py = Math.sin(a) * r * wob;
      i ? c.lineTo(px, py) : c.moveTo(px, py);
    }
    c.closePath();
    const g = c.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.1);
    g.addColorStop(0, U.shade(base, 0.5)); g.addColorStop(0.55, base); g.addColorStop(1, U.shade(base, -0.45));
    c.fillStyle = o.hurt ? '#ff4d4d' : g; c.fill();
    c.lineWidth = Math.max(1.5, r * 0.07); c.strokeStyle = U.shade(base, -0.65); c.stroke();
    // пузырьки внутри
    c.globalAlpha = 0.35;
    for (let i = 0; i < 5; i++) { const a = i * 1.7 + t * 0.6, d = r * (0.55 + 0.25 * Math.sin(i + t)); circ(c, Math.cos(a) * d, Math.sin(a) * d, r * (0.05 + (i % 3) * 0.025), '#fff', null); }
    c.globalAlpha = 1;
    hl(c, -r * 0.45, -r * 0.55, r * 0.28, r * 0.13, 0.5);
    c.restore();
    // рот (открывается при поедании)
    const ch = o.chomp || 0;
    const mw = r * 0.5, mh = r * (0.06 + ch * 0.32);
    const my = r * 0.5;
    c.beginPath(); c.ellipse(0, my, mw, mh, 0, 0, TAU); c.fillStyle = '#3a0820'; c.fill();
    c.lineWidth = Math.max(1, r * 0.05); c.strokeStyle = OL; c.stroke();
    if (ch > 0.15) {
      c.save(); c.beginPath(); c.ellipse(0, my, mw, mh, 0, 0, TAU); c.clip();
      ell(c, 0, my + mh * 0.7, mw * 0.55, mh * 0.5, 0, '#ff6b8a', null);
      c.fillStyle = '#fff';
      for (let i = -2; i <= 2; i++) { poly(c, [i * mw * 0.32 - mw * 0.12, my - mh, i * mw * 0.32 + mw * 0.12, my - mh, i * mw * 0.32, my - mh + mh * 0.45], '#fff', null); }
      c.restore();
    }
    // лицо
    const fr = r * 0.52;
    const fy = -r * 0.12 + Math.sin(t * 3) * r * 0.02;
    this.face(c, 0, fy, fr, o.hurt ? 'shock' : ch > 0.3 ? 'happy' : 'happy', t);
    if (o.stun) { // звёздочки
      for (let i = 0; i < 4; i++) { const a = t * 4 + i * TAU / 4; c.save(); c.translate(Math.cos(a) * r * 0.8, fy - fr * 1.1 + Math.sin(a) * r * 0.2); U.starPath(c, 0, 0, 5, r * 0.14, r * 0.06); fs(c, '#ffd43b', OL, 1.5); c.restore(); }
    }
    c.restore();
  },
};
