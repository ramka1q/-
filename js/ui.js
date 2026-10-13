'use strict';
// ============================================================
//  ИНТЕРФЕЙС: главное меню, выбор уровня, фото Никиты, помощь,
//  пауза, результаты, титры. Кнопки рисуются на canvas.
// ============================================================
const LEVEL_ICONS = ['coccus', 'flask', 'keycard', 'gear', 'car', 'rat', 'minitank', 'fish', 'volcano', 'earthp', 'saturn', 'brainbot'];
const LEVEL_ICON_V = [0, 1, 'yellow', 1, 0, 0, 0, 0, 0, 0, 0, 0];
const COMIC_FOR = ['intro', 'table', 'corridors', 'workshop', 'city', 'sewer', 'base', 'ocean', 'volcano', 'earth', 'space', 'final'];

const UI = {
  buttons: [], hover: null,
  btn(ctx, id, x, y, w, h, label, o = {}) {
    const hov = Game.input.mx >= x && Game.input.mx <= x + w && Game.input.my >= y && Game.input.my <= y + h;
    if (hov && !o.disabled) this.hover = id;
    const k = hov && !o.disabled ? 1.05 : 1;
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2); ctx.scale(k, k);
    const col = o.disabled ? '#495057' : (o.col || '#9b5cff');
    rect(ctx, -w / 2, -h / 2 + 5, w, h, h * 0.3, U.shade(col, -0.45), null);
    rect(ctx, -w / 2, -h / 2, w, h, h * 0.3, lg(ctx, 0, -h / 2, 0, h / 2, [U.shade(col, 0.25), col]), OL, 3);
    HUD.text(ctx, label, 0, h * 0.13, (o.fs || h * 0.42), o.disabled ? '#aaa' : '#fff', 'center');
    ctx.restore();
    this.buttons.push({ id, x, y, w, h, disabled: o.disabled, cb: o.cb });
  },
  clickAt(x, y) {
    for (let i = this.buttons.length - 1; i >= 0; i--) {
      const b = this.buttons[i];
      if (!b.disabled && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) { Sound.play('select'); if (b.cb) b.cb(); return true; }
    }
    return false;
  },
  begin() { this.buttons = []; this.hover = null; },

  // ---------------- главное меню ----------------
  menu(ctx, sw, sh, t) {
    const g = ctx.createRadialGradient(sw * 0.35, sh * 0.45, 0, sw * 0.5, sh * 0.5, Math.max(sw, sh));
    g.addColorStop(0, '#5b2a9e'); g.addColorStop(0.6, '#24124a'); g.addColorStop(1, '#0d0820');
    ctx.fillStyle = g; ctx.fillRect(0, 0, sw, sh);
    BG.skyStars(ctx, 0, 0, sw, sh, t);
    const sc = Math.min(sw, sh) / 800;
    // летящая в рот еда
    const nx = sw * (sw > sh ? 0.3 : 0.5), ny = sh * (sw > sh ? 0.55 : 0.42), nr = Math.min(sw, sh) * 0.17;
    const foods = ['donut', 'pizza', 'car', 'fish', 'building', 'earthp', 'flask', 'gear', 'shawarma', 'saturn', 'coccus', 'tree', 'bus', 'microscope'];
    let chomp = 0;
    for (let i = 0; i < 9; i++) {
      const ph = (t * 0.22 + i / 9) % 1;
      const sx = sw * 1.1, sy = sh * (0.1 + ((i * 0.37) % 0.8));
      const x = U.lerp(sx, nx, U.ease.inQuad(ph)), y = U.lerp(sy, ny + nr * 0.4, U.ease.inQuad(ph));
      const s = nr * 0.28 * (1 - ph * 0.7);
      if (ph > 0.9) chomp = Math.max(chomp, (ph - 0.9) * 10);
      Sprites.draw(ctx, foods[(i + Math.floor(t * 0.22 + i / 9)) % foods.length], i % 4, x, y, s, t * (i % 2 ? 1 : -1), 1);
    }
    Chars.nikita(ctx, nx, ny + Math.sin(t * 2) * nr * 0.05, nr, { t, chomp: Math.max(chomp, Math.abs(Math.sin(t * 3)) * 0.3), dir: 0, speed: 0.2 });
    // заголовок
    const tx = sw > sh ? sw * 0.68 : sw * 0.5, ty = sh * (sw > sh ? 0.2 : 0.1);
    const title = 'НИКИТА';
    const fsz = Math.min(sw * (sw > sh ? 0.075 : 0.14), 96 * sc * 1.3);
    ctx.font = `900 ${fsz}px ${FONT}`;
    let total = ctx.measureText(title).width, cx = tx - total / 2;
    for (let i = 0; i < title.length; i++) {
      const ch = title[i], w = ctx.measureText(ch).width;
      ctx.save(); ctx.translate(cx + w / 2, ty + Math.sin(t * 3 + i * 0.6) * fsz * 0.06); ctx.rotate(Math.sin(t * 2 + i) * 0.06);
      HUD.text(ctx, ch, 0, 0, fsz, ['#ff6bd6', '#ffd43b', '#69db7c', '#4dabf7', '#ff922b', '#b197fc'][i % 6], 'center');
      ctx.restore();
      cx += w;
    }
    HUD.text(ctx, 'ЕСТ ВСЁ', tx, ty + fsz * 0.85, fsz * 0.55, '#fff', 'center');
    HUD.text(ctx, 'Учёные НИИ «Мозгоправ» против бесконечного аппетита', tx, ty + fsz * 1.3, Math.max(12, fsz * 0.17), '#d0bfff', 'center', OL, 700);
    // кнопки
    const bw = Math.min(320 * sc * 1.1, sw * 0.8), bh = Math.max(44, 58 * sc);
    const bx = tx - bw / 2;
    let by = ty + fsz * 1.65;
    if (sw <= sh) by = sh * 0.66;
    const save = Game.save;
    const cont = save.unlocked > 0;
    this.btn(ctx, 'play', bx, by, bw, bh, cont ? '▶ Продолжить' : '▶ Играть', { col: '#ff6bd6', cb: () => Game.startLevel(Math.min(save.unlocked, LEVELS.length - 1)) });
    by += bh * 1.22;
    this.btn(ctx, 'levels', bx, by, bw, bh, '🗺 Выбор уровня', { col: '#4dabf7', cb: () => Game.go('levels') });
    by += bh * 1.22;
    this.btn(ctx, 'photo', bx, by, bw * 0.48, bh, '📷 Фото', { col: '#20c997', fs: bh * 0.36, cb: () => Game.go('photo') });
    this.btn(ctx, 'help', bx + bw * 0.52, by, bw * 0.48, bh, '❓ Как играть', { col: '#ff922b', fs: bh * 0.32, cb: () => Game.go('help') });
    by += bh * 1.22;
    this.btn(ctx, 'sound', bx, by, bw * 0.48, bh * 0.8, Game.save.settings.mute ? '🔇 Звук' : '🔊 Звук', { col: '#868e96', fs: bh * 0.3, cb: () => Game.toggleMute() });
    this.btn(ctx, 'credits', bx + bw * 0.52, by, bw * 0.48, bh * 0.8, '🎬 Титры', { col: '#868e96', fs: bh * 0.3, cb: () => Game.go('credits') });
    // учёные внизу
    if (sw > sh) {
      const who = ['egor', 'danya', 'pylypyuk', 'dima', 'kirill', 'natasha', 'molgelevich'];
      const sp = sw * 0.09;
      who.forEach((w, i) => {
        const x = sw * 0.06 + i * sp * 0.62 + (i > 5 ? sp * 0.2 : 0), y = sh * 0.98;
        Chars.draw(ctx, w, { x, y, scale: sh * 0.0016 * (w === 'molgelevich' ? 1.1 : 1), t: t + i, expr: w === 'molgelevich' ? 'evil' : w === 'kirill' ? 'crazy' : 'determined', pose: i % 2 ? 'point' : 'stand', flip: false });
      });
    }
    if (!Chars.photoCanvas) HUD.text(ctx, '💡 Вставь фото Никиты: кнопка «Фото» или файл assets/nikita.jpg', sw / 2, sh - 10, Math.max(11, 13 * sc), '#ffe066', 'center', OL, 700);
  },

  // ---------------- выбор уровня ----------------
  levels(ctx, sw, sh, t) {
    const g = ctx.createLinearGradient(0, 0, 0, sh); g.addColorStop(0, '#1b1440'); g.addColorStop(1, '#3b1d6b'); ctx.fillStyle = g; ctx.fillRect(0, 0, sw, sh);
    BG.skyStars(ctx, 0, 0, sw, sh, t);
    const sc = Math.min(sw, sh) / 800;
    HUD.text(ctx, 'КАРТА ПОХОЖДЕНИЙ НИКИТЫ', sw / 2, 52 * sc, 36 * sc, '#ffd43b', 'center');
    const n = LEVELS.length;
    const cols = sw > sh ? 6 : 3, rows = Math.ceil(n / cols);
    const mx = sw * 0.08, my = 100 * sc, aw = sw - mx * 2, ah = sh - my - 110 * sc;
    const pos = [];
    for (let i = 0; i < n; i++) {
      const row = Math.floor(i / cols), c = row % 2 ? cols - 1 - (i % cols) : i % cols;
      pos.push([mx + (c + 0.5) * aw / cols, my + (row + 0.5) * ah / rows]);
    }
    // дорожка
    ctx.save(); ctx.setLineDash([12, 10]); ctx.lineDashOffset = -t * 30; ctx.lineWidth = 6 * sc; ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath(); pos.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); ctx.restore();
    const R = Math.min(aw / cols, ah / rows) * 0.3;
    let chap = '';
    for (let i = 0; i < n; i++) {
      const L = LEVELS[i], [x, y] = pos[i];
      const locked = i > Game.save.unlocked;
      const best = Game.save.best[L.id];
      const hov = !locked && U.dist(Game.input.mx, Game.input.my, x, y) < R * 1.1;
      const k = hov ? 1.1 + Math.sin(t * 8) * 0.02 : 1;
      ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
      if (L.chapter !== chap) { chap = L.chapter; }
      const medalCol = best ? ['#ffd43b', '#dee2e6', '#e8a35a'][best.medal] : null;
      circ(ctx, 0, 6, R, 'rgba(0,0,0,0.35)', null);
      circ(ctx, 0, 0, R, locked ? '#343a40' : rg(ctx, 0, 0, R, ['#b197fc', '#7048e8', '#3b1d8f']), medalCol || OL, medalCol ? R * 0.12 : 3);
      if (!locked) Sprites.draw(ctx, LEVEL_ICONS[i], LEVEL_ICON_V[i], 0, -R * 0.05, R * 0.6, Math.sin(t * 2 + i) * 0.15, 1);
      else HUD.text(ctx, '🔒', 0, R * 0.25, R * 0.7, '#fff', 'center', null);
      HUD.text(ctx, String(i + 1), -R * 0.75, -R * 0.6, R * 0.38, '#ffd43b', 'center');
      ctx.restore();
      HUD.text(ctx, L.name, x, y + R + 18 * sc, Math.max(11, 15 * sc), locked ? '#777' : '#fff', 'center', OL, 800);
      if (best) HUD.text(ctx, '⏱ ' + U.formatTime(best.time) + '  ★ ' + best.score.toLocaleString('ru-RU'), x, y + R + 36 * sc, Math.max(10, 12 * sc), '#d0bfff', 'center', OL, 700);
      this.buttons.push({ id: 'lv' + i, x: x - R, y: y - R, w: R * 2, h: R * 2, disabled: locked, cb: () => Game.startLevel(i) });
      if (hov) {
        ctx.save();
        const tw = Math.min(380 * sc, sw * 0.8);
        const tx = U.clamp(x - tw / 2, 10, sw - tw - 10), ty = y - R - 90 * sc < 70 * sc ? y + R + 50 * sc : y - R - 90 * sc;
        rect(ctx, tx, ty, tw, 70 * sc, 12, 'rgba(20,18,40,0.92)', '#ffd43b', 2);
        HUD.text(ctx, L.chapter, tx + 12, ty + 22 * sc, 12 * sc, '#ffd43b', 'left', null, 800);
        ctx.font = `700 ${12 * sc}px ${FONT}`;
        U.wrapText(ctx, L.desc, tw - 24).slice(0, 2).forEach((ln, j) => HUD.text(ctx, ln, tx + 12, ty + (42 + j * 16) * sc, 12 * sc, '#fff', 'left', null, 700));
        ctx.restore();
      }
    }
    const bh = Math.max(40, 50 * sc);
    this.btn(ctx, 'back', 20 * sc, sh - bh - 20 * sc, 200 * sc, bh, '◀ Меню', { col: '#868e96', cb: () => Game.go('menu') });
    if (Game.save.unlocked < LEVELS.length - 1) this.btn(ctx, 'unlockall', sw - 240 * sc, sh - bh - 20 * sc, 220 * sc, bh, '🔓 Открыть все', { col: '#495057', fs: bh * 0.32, cb: () => { Game.save.unlocked = LEVELS.length - 1; Game.store(); } });
  },

  // ---------------- фото Никиты ----------------
  photo(ctx, sw, sh, t) {
    const g = ctx.createLinearGradient(0, 0, sw, sh); g.addColorStop(0, '#0b3d3a'); g.addColorStop(1, '#14102b'); ctx.fillStyle = g; ctx.fillRect(0, 0, sw, sh);
    const sc = Math.min(sw, sh) / 800;
    HUD.text(ctx, 'ЛИЦО НИКИТЫ', sw / 2, 56 * sc, 38 * sc, '#69db7c', 'center');
    const R = Math.min(sw, sh) * 0.22;
    const cx = sw / 2, cy = sh * 0.42;
    // превью: слизень и голова
    Chars.nikita(ctx, cx - R * 1.6, cy, R * 0.75, { t, chomp: Math.abs(Math.sin(t * 2)) * 0.5 });
    circ(ctx, cx + R * 0.3, cy, R + 6, '#fff', null);
    ctx.save(); ctx.beginPath(); ctx.arc(cx + R * 0.3, cy, R, 0, TAU); ctx.clip();
    if (Chars.photo) {
      const img = Chars.photo, iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
      const base = (R * 2) / Math.min(iw, ih) * Chars.crop.s;
      const w = iw * base, h = ih * base;
      ctx.drawImage(img, cx + R * 0.3 - w / 2 + Chars.crop.x * R * 2, cy - h / 2 + Chars.crop.y * R * 2, w, h);
    } else { Chars.face(ctx, cx + R * 0.3, cy, R, 'happy', t); }
    ctx.restore();
    circ(ctx, cx + R * 0.3, cy, R, null, OL, 5);
    Chars.draw(ctx, 'nikita', { x: cx + R * 1.95, y: cy + R, scale: R * 0.016, t, expr: 'happy', pose: 'wave' });
    this.photoArea = { x: cx + R * 0.3, y: cy, r: R };
    const fsz = Math.max(12, 15 * sc);
    const lines = Chars.photo ? ['Тяни фото мышкой/пальцем, чтобы сдвинуть. Колёсико или кнопки +/− — масштаб.'] : ['Фото ещё нет. Загрузи его кнопкой ниже —', 'или положи файл в папку игры: assets/nikita.jpg (или .png)'];
    lines.forEach((l, i) => HUD.text(ctx, l, sw / 2, cy + R + 40 * sc + i * fsz * 1.4, fsz, '#fff', 'center', OL, 700));
    const bh = Math.max(42, 52 * sc), bw = Math.min(260 * sc, sw * 0.42);
    const by = sh - bh * 2.6;
    this.btn(ctx, 'upload', sw / 2 - bw - 10, by, bw, bh, '📁 Загрузить фото', { col: '#20c997', fs: bh * 0.34, cb: () => document.getElementById('photoInput').click() });
    this.btn(ctx, 'zin', sw / 2 + 10, by, bh, bh, '+', { col: '#4dabf7', cb: () => { Chars.crop.s = Math.min(5, Chars.crop.s * 1.12); Chars.renderPhoto(); } });
    this.btn(ctx, 'zout', sw / 2 + 20 + bh, by, bh, bh, '−', { col: '#4dabf7', cb: () => { Chars.crop.s = Math.max(0.5, Chars.crop.s / 1.12); Chars.renderPhoto(); } });
    this.btn(ctx, 'reset', sw / 2 + 30 + bh * 2, by, bh * 1.8, bh, 'Сброс', { col: '#868e96', fs: bh * 0.32, cb: () => { Chars.crop = { x: 0, y: 0, s: 1 }; Chars.renderPhoto(); } });
    this.btn(ctx, 'save', sw / 2 - bw - 10, by + bh * 1.25, bw, bh, '✔ Готово', { col: '#9b5cff', cb: () => { Game.savePhoto(); Game.go('menu'); } });
    if (Game.save.photoData) this.btn(ctx, 'del', sw / 2 + 10, by + bh * 1.25, bw, bh, '🗑 Убрать фото', { col: '#c92a2a', fs: bh * 0.32, cb: () => { Game.save.photoData = null; Game.store(); Chars.photo = null; Chars.photoCanvas = null; Game.loadAssetPhoto(); } });
  },

  // ---------------- помощь ----------------
  help(ctx, sw, sh, t) {
    ctx.fillStyle = '#16122e'; ctx.fillRect(0, 0, sw, sh);
    const sc = Math.min(sw, sh) / 800;
    HUD.text(ctx, 'КАК ИГРАТЬ', sw / 2, 52 * sc, 36 * sc, '#ffd43b', 'center');
    const items = [
      ['🖱', 'Мышь — Никита ползёт за курсором. Можно и WASD / стрелки. На телефоне — веди пальцем.'],
      ['⚡', 'ПРОБЕЛ, Shift или правая кнопка мыши — РЫВОК (двойной тап на телефоне). Разбивает треснувшие стены и бьёт боссов.'],
      ['😋', 'Ешь всё, что МЕНЬШЕ тебя. Чем больше съел — тем больше стал. Большие предметы сначала не по зубам.'],
      ['💥', 'Шипы, лазеры, лава, сетки и укусы уменьшают Никиту. Ранят на минимальном размере — растёт шкала поимки!'],
      ['🗝', 'Головоломки: ключ-карты и двери, лужи краски и цветные барьеры, кнопки, плиты и ящики, вентили, код «Саймон», крио-кнопки, прожекторы.'],
      ['🌶', 'Бонусы: перец — скорость, магнит — еда летит к тебе, щит — защита, гриб — рост, пирожок от Наташи.'],
      ['🏅', 'Медали за время: золото, серебро, бронза. Комбо за быстрое поедание дают больше очков.'],
      ['⌨', 'Esc / P — пауза. M — мини-карта. Между уровнями — комиксы (клик — дальше, Esc — пропустить).'],
    ];
    const fsz = Math.max(12, Math.min(17 * sc, sw * 0.022));
    let y = 100 * sc;
    const x = Math.max(20, sw * 0.12), w = sw - x * 2;
    ctx.font = `700 ${fsz}px ${FONT}`;
    for (const [ic, tx] of items) {
      const lines = U.wrapText(ctx, tx, w - fsz * 3);
      HUD.text(ctx, ic, x, y + fsz, fsz * 1.6, '#fff', 'left', null, 400);
      lines.forEach((l, i) => HUD.text(ctx, l, x + fsz * 2.6, y + fsz * 0.9 + i * fsz * 1.35, fsz, '#fff', 'left', null, 700));
      y += Math.max(fsz * 2.2, lines.length * fsz * 1.35 + fsz * 0.9);
    }
    const bh = Math.max(40, 50 * sc);
    this.btn(ctx, 'back', sw / 2 - 110 * sc, sh - bh - 20 * sc, 220 * sc, bh, '◀ Понятно!', { col: '#9b5cff', cb: () => Game.go('menu') });
  },

  // ---------------- пауза ----------------
  pause(ctx, sw, sh, t) {
    ctx.fillStyle = 'rgba(10,8,25,0.86)'; ctx.fillRect(0, 0, sw, sh);
    const sc = Math.min(sw, sh) / 800;
    HUD.text(ctx, 'ПАУЗА', sw / 2, sh * 0.25, 54 * sc, '#ffd43b', 'center');
    const L = Game.world;
    if (L) {
      const objs = L.objectives.map(o => (o.done ? '✔ ' : '• ') + o.text).join('   ');
      HUD.text(ctx, L.def.name + ' — ' + objs, sw / 2, sh * 0.25 + 40 * sc, Math.max(12, 15 * sc), '#fff', 'center', OL, 700);
    }
    const bw = Math.min(300 * sc, sw * 0.7), bh = Math.max(44, 54 * sc);
    let y = sh * 0.38;
    this.btn(ctx, 'resume', sw / 2 - bw / 2, y, bw, bh, '▶ Продолжить', { col: '#ff6bd6', cb: () => Game.resume() }); y += bh * 1.25;
    this.btn(ctx, 'restart', sw / 2 - bw / 2, y, bw, bh, '↻ Заново', { col: '#4dabf7', cb: () => Game.playLevel(Game.levelIdx) }); y += bh * 1.25;
    this.btn(ctx, 'mute', sw / 2 - bw / 2, y, bw, bh, Game.save.settings.mute ? '🔇 Звук выкл' : '🔊 Звук вкл', { col: '#868e96', cb: () => Game.toggleMute() }); y += bh * 1.25;
    this.btn(ctx, 'tomenu', sw / 2 - bw / 2, y, bw, bh, '⌂ В меню', { col: '#495057', cb: () => Game.go('menu') });
  },

  // ---------------- результаты ----------------
  results(ctx, sw, sh, t) {
    const R = Game.result;
    const g = ctx.createRadialGradient(sw / 2, sh * 0.4, 0, sw / 2, sh / 2, Math.max(sw, sh) * 0.7);
    g.addColorStop(0, R.win ? '#5b2a9e' : '#5e1a1a'); g.addColorStop(1, '#0d0820'); ctx.fillStyle = g; ctx.fillRect(0, 0, sw, sh);
    BG.panel.sunburst(ctx, 0, 0, 0, 0, t);
    const sc = Math.min(sw, sh) / 800;
    const lt = t - R.t0;
    if (R.win) {
      // лучи
      ctx.save(); ctx.globalAlpha = 0.12; ctx.translate(sw / 2, sh * 0.32);
      for (let i = 0; i < 16; i++) { ctx.rotate(TAU / 16); poly(ctx, [0, 0, -40 * sc, -sh, 40 * sc, -sh], '#ffd43b', null); }
      ctx.restore();
      ctx.save(); ctx.translate(sw / 2, sh * 0.32); ctx.rotate(t * 0.3);
      ctx.restore();
      const k = U.ease.outElastic(U.clamp(lt / 1.2, 0, 1));
      ctx.save(); ctx.translate(sw / 2, sh * 0.13); ctx.scale(k, k);
      HUD.text(ctx, R.final ? 'ПОБЕДА!' : 'УРОВЕНЬ ПРОЙДЕН!', 0, 0, 44 * sc, '#ffd43b', 'center');
      ctx.restore();
      HUD.text(ctx, R.name, sw / 2, sh * 0.13 + 34 * sc, 18 * sc, '#d0bfff', 'center', OL, 700);
      // медаль
      const mk = U.ease.outBack(U.clamp((lt - 0.4) / 0.6, 0, 1));
      const mcol = ['#ffd43b', '#dee2e6', '#e8a35a'][R.medal];
      const mname = ['ЗОЛОТО', 'СЕРЕБРО', 'БРОНЗА'][R.medal];
      ctx.save(); ctx.translate(sw / 2, sh * 0.34); ctx.scale(mk, mk); ctx.rotate(Math.sin(t * 2) * 0.05);
      poly(ctx, [-30 * sc, -70 * sc, -10 * sc, -20 * sc, 10 * sc, -20 * sc, 30 * sc, -70 * sc], '#e03131');
      circ(ctx, 0, 0, 62 * sc, rg(ctx, 0, 0, 62 * sc, [U.shade(mcol, 0.5), mcol, U.shade(mcol, -0.35)]), OL, 4);
      U.starPath(ctx, 0, 0, 5, 36 * sc, 16 * sc); fs(ctx, U.shade(mcol, 0.35), U.shade(mcol, -0.4), 3);
      ctx.restore();
      HUD.text(ctx, mname, sw / 2, sh * 0.34 + 90 * sc, 24 * sc, mcol, 'center');
      const rows = [['Время', U.formatTime(R.time)], ['Очки', R.score.toLocaleString('ru-RU')], ['Съедено', R.eaten + ' шт.'], ['Размер', R.size]];
      rows.forEach(([a, b], i) => {
        const y = sh * 0.56 + i * 30 * sc;
        const a2 = U.clamp((lt - 0.8 - i * 0.15) * 3, 0, 1);
        ctx.save(); ctx.globalAlpha = a2;
        HUD.text(ctx, a, sw / 2 - 10, y, 20 * sc, '#d0bfff', 'right', OL, 700);
        HUD.text(ctx, b, sw / 2 + 10, y, 20 * sc, '#fff', 'left');
        ctx.restore();
      });
      if (R.record && lt > 1.6) HUD.text(ctx, '★ НОВЫЙ РЕКОРД! ★', sw / 2, sh * 0.56 - 30 * sc, 18 * sc * (1 + Math.sin(t * 8) * 0.05), '#ff6bd6', 'center');
      Chars.nikita(ctx, sw * 0.18, sh * 0.62, Math.min(sw, sh) * 0.12, { t, chomp: Math.abs(Math.sin(t * 4)), dir: 0 });
      const host = LEVELS[R.idx].host;
      if (sw > 700) Chars.draw(ctx, host, { x: sw * 0.83, y: sh * 0.85, scale: sh * 0.0035, t, expr: host === 'molgelevich' ? 'sad' : 'shock', pose: 'scared', flip: true });
    } else {
      const k = U.ease.outBack(U.clamp(lt / 0.8, 0, 1));
      ctx.save(); ctx.translate(sw / 2, sh * 0.25); ctx.scale(k, k);
      HUD.text(ctx, 'НИКИТУ ПОЙМАЛИ!', 0, 0, 44 * sc, '#ff6b6b', 'center');
      ctx.restore();
      HUD.text(ctx, 'Но ни одна банка не удержит голодного Никиту. Попробуй ещё раз!', sw / 2, sh * 0.25 + 40 * sc, 16 * sc, '#fff', 'center', OL, 700);
      Chars.nikita(ctx, sw / 2, sh * 0.47, Math.min(sw, sh) * 0.12, { t, hurt: Math.sin(t * 4) > 0.8, stun: true });
      ctx.save(); ctx.globalAlpha = 0.45; rect(ctx, sw / 2 - Math.min(sw, sh) * 0.16, sh * 0.47 - Math.min(sw, sh) * 0.18, Math.min(sw, sh) * 0.32, Math.min(sw, sh) * 0.32, 20, '#a5d8ff', '#fff', 4); ctx.restore();
    }
    const bw = Math.min(240 * sc, sw * 0.28), bh = Math.max(44, 54 * sc), y = sh - bh - 34 * sc;
    if (lt > 0.8) {
      if (R.win) {
        this.btn(ctx, 'next', sw / 2 + bw * 0.55, y, bw, bh, R.final ? 'Финал ▶' : 'Дальше ▶', { col: '#ff6bd6', cb: () => Game.next() });
        this.btn(ctx, 'retry', sw / 2 - bw * 0.5, y, bw, bh, '↻ Ещё раз', { col: '#4dabf7', fs: bh * 0.36, cb: () => Game.playLevel(R.idx) });
        this.btn(ctx, 'menu', sw / 2 - bw * 1.55, y, bw, bh, '⌂ Меню', { col: '#495057', cb: () => Game.go('menu') });
      } else {
        this.btn(ctx, 'retry', sw / 2 + 10, y, bw, bh, '↻ Заново', { col: '#ff6bd6', cb: () => Game.playLevel(R.idx) });
        this.btn(ctx, 'menu', sw / 2 - bw - 10, y, bw, bh, '⌂ Меню', { col: '#495057', cb: () => Game.go('menu') });
      }
    }
  },

  // ---------------- титры ----------------
  credits(ctx, sw, sh, t) {
    const lt = t - (Game.creditsT0 || 0);
    ctx.fillStyle = '#0d0820'; ctx.fillRect(0, 0, sw, sh);
    BG.skyStars(ctx, 0, 0, sw, sh, t);
    const sc = Math.min(sw, sh) / 800;
    const lines = [
      ['НИКИТА ЕСТ ВСЁ', 44, '#ffd43b'], ['', 20], ['В РОЛЯХ', 22, '#b197fc'], ['', 10],
      ['Никита — голодный стажёр', 20, '#fff', 'nikita'], ['Егор — глава лаборатории', 20, '#fff', 'egor'], ['Даня — инженер-робототехник', 20, '#fff', 'danya'],
      ['Пилипюк — химик и его усы', 20, '#fff', 'pylypyuk'], ['Дима — охрана, пилот и танкист', 20, '#fff', 'dima'], ['Кирилл — гений в своём мире', 20, '#fff', 'kirill'],
      ['Наташа — няня Кирилла, святой человек', 20, '#fff', 'natasha'], ['Проф. Молгелевич — злой гений (тоже с причудами)', 20, '#fff', 'molgelevich'],
      ['', 20], ['12 уровней · 3 босса · 13 комиксов', 20, '#69db7c'], ['Вся графика, музыка и звуки — нарисованы и сыграны кодом', 16, '#d0bfff'],
      ['', 20], ['Ни один учёный не пострадал. Их всех выплюнули.', 16, '#ffa8a8'], ['', 30], ['Спасибо за игру!', 30, '#ff6bd6'],
    ];
    let y = sh + 40 - lt * 45 * sc;
    for (const [s, size, col, who] of lines) {
      if (who && y > -100 && y < sh + 100) { Chars.portrait(ctx, who, sw / 2 - Math.min(sw * 0.35, 330 * sc), y - size * sc * 0.4, 26 * sc, { expr: who === 'molgelevich' ? 'evil' : 'happy', t }); }
      if (s) HUD.text(ctx, s, sw / 2, y, size * sc, col, 'center', OL, 800);
      y += (size + 22) * sc * (who ? 1.6 : 1);
    }
    if (y < -50) Game.creditsT0 = t;
    const bh = Math.max(40, 50 * sc);
    this.btn(ctx, 'back', 20 * sc, sh - bh - 20 * sc, 200 * sc, bh, '◀ Меню', { col: '#868e96', cb: () => Game.go('menu') });
  },
};
