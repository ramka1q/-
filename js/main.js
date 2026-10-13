'use strict';
// ============================================================
//  ГЛАВНЫЙ ЦИКЛ, состояния игры, ввод, сохранения, фото
// ============================================================
const SAVE_KEY = 'nikita_eats_all_v1';
const DEV = /[?&]dev=1/.test(location.search);

const Game = {
  canvas: null, ctx: null, sw: 0, sh: 0, dpr: 1,
  state: 'loading', t: 0, last: 0, world: null, levelIdx: 0, result: null,
  input: { mx: -100, my: -100, wx: 0, wy: 0, mouse: false, touch: false, kx: 0, ky: 0, dash: false, showMap: true, sw: 800, sh: 600 },
  keys: {},
  save: null,

  // ---------- сохранения ----------
  defaults() { return { unlocked: 0, best: {}, settings: { mute: false, music: 0.5, sfx: 0.7, map: true }, photoData: null, crop: { x: 0, y: 0, s: 1 } }; },
  loadSave() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (e) { s = null; }
    this.save = Object.assign(this.defaults(), s || {});
    this.save.settings = Object.assign(this.defaults().settings, this.save.settings || {});
  },
  store() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.save)); } catch (e) { /* приватный режим — без сохранений */ } },

  // ---------- фото Никиты ----------
  loadAssetPhoto() {
    const names = ['assets/nikita.png', 'assets/nikita.jpg', 'assets/nikita.jpeg', 'assets/nikita.webp', 'assets/nikita.PNG', 'assets/nikita.JPG', 'assets/nikita.JPEG', 'assets/Nikita.jpg', 'assets/Nikita.png'];
    const tryNext = (i) => {
      if (i >= names.length || this.save.photoData) return;
      const img = new Image();
      img.onload = () => { if (!this.save.photoData) Chars.setPhoto(img, this.save.crop || { x: 0, y: 0, s: 1 }); };
      img.onerror = () => tryNext(i + 1);
      img.src = names[i];
    };
    tryNext(0);
  },
  loadPhoto() {
    if (this.save.photoData) {
      const img = new Image();
      img.onload = () => Chars.setPhoto(img, this.save.crop || { x: 0, y: 0, s: 1 });
      img.src = this.save.photoData;
    } else this.loadAssetPhoto();
  },
  onPhotoFile(file) {
    if (!file) return;
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => {
        // уменьшаем, чтобы влезло в сохранение
        const M = 640, k = Math.min(1, M / Math.max(img.width, img.height));
        const cv = document.createElement('canvas'); cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        const data = cv.toDataURL('image/jpeg', 0.88);
        const img2 = new Image();
        img2.onload = () => { Chars.setPhoto(img2, { x: 0, y: 0, s: 1 }); this.pendingPhoto = data; };
        img2.src = data;
      };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  },
  savePhoto() {
    if (this.pendingPhoto) { this.save.photoData = this.pendingPhoto; this.pendingPhoto = null; }
    this.save.crop = Object.assign({}, Chars.crop);
    this.store();
  },

  // ---------- состояния ----------
  go(state) {
    this.state = state;
    if (['menu', 'levels', 'photo', 'help'].includes(state)) Sound.playMusic('menu');
    if (state === 'credits') { this.creditsT0 = this.t; Sound.playMusic('ending'); }
    this.world = state === 'pause' ? this.world : (state === 'menu' || state === 'levels' ? null : this.world);
  },
  startLevel(i) {
    this.levelIdx = i;
    this.state = 'comic';
    Sound.playMusic('comic');
    Comic.start(COMIC_FOR[i], () => this.playLevel(i));
  },
  playLevel(i) {
    this.levelIdx = i;
    try { this.world = new World(LEVELS[i]); }
    catch (e) { console.error(e); this.state = 'menu'; return; }
    this.state = 'play';
    Sound.playMusic(LEVELS[i].music);
  },
  pause() { if (this.state === 'play') { this.state = 'pause'; Sound.play('click'); } },
  resume() { if (this.state === 'pause') { this.state = 'play'; this.last = performance.now(); } },
  toggleFullscreen() {
    if (window.nikitaFullscreen) { window.nikitaFullscreen(); return; } // Windows-версия (EXE)
    const d = document, el = d.documentElement;
    try {
      if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
      else (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
    } catch (e) { /* iPhone: используй «На экран Домой» */ }
  },
  toggleMute() { this.save.settings.mute = !this.save.settings.mute; Sound.setMuted(this.save.settings.mute); this.store(); },
  finishLevel(win) {
    const L = this.world, i = this.levelIdx, def = LEVELS[i];
    const m = def.medals || [120, 240];
    const medal = L.time <= m[0] ? 0 : L.time <= m[1] ? 1 : 2;
    let record = false;
    if (win) {
      const b = this.save.best[def.id];
      if (!b || medal < b.medal || (medal === b.medal && L.time < b.time) || L.score > b.score) {
        record = !!b;
        this.save.best[def.id] = { time: b ? Math.min(b.time, L.time) : L.time, medal: b ? Math.min(b.medal, medal) : medal, score: Math.max(b ? b.score : 0, L.score) };
      }
      this.save.unlocked = Math.max(this.save.unlocked, Math.min(LEVELS.length - 1, i + 1));
      if (i === LEVELS.length - 1) this.save.finished = true;
      this.store();
    }
    this.result = { win, idx: i, name: def.name, time: L.time, score: L.score, eaten: L.stats.eaten, size: L.sizeText(L.P.r), medal, record, t0: this.t, final: i === LEVELS.length - 1 };
    this.state = 'results';
  },
  next() {
    const i = this.result.idx;
    if (i >= LEVELS.length - 1) {
      this.state = 'comic'; Sound.playMusic('ending');
      Comic.start('ending', () => this.go('credits'));
    } else this.startLevel(i + 1);
  },

  // ---------- запуск ----------
  init() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    this.loadSave();
    Sound.muted = this.save.settings.mute;
    Sound.musicVol = this.save.settings.music; Sound.sfxVol = this.save.settings.sfx;
    this.loadPhoto();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.bindInput();
    const fontsReady = (document.fonts && document.fonts.load) ? Promise.race([
      Promise.all([document.fonts.load('900 20px Rubik'), document.fonts.load('700 20px Rubik'), document.fonts.load('400 20px Neucha')]),
      new Promise(r => setTimeout(r, 2500)),
    ]).catch(() => { }) : Promise.resolve();
    fontsReady.then(() => {
      const m = location.search.match(/[?&]level=(\d+)/);
      if (m) this.playLevel(U.clamp(+m[1], 0, LEVELS.length - 1));
      else this.go('menu');
    });
    this.last = performance.now();
    requestAnimationFrame(ts => this.frame(ts));
    window.Game = this;
  },
  resize() {
    this.sw = window.innerWidth; this.sh = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const coarse = window.matchMedia && matchMedia('(pointer: coarse)').matches;
    const maxPx = coarse ? 2.4e6 : 4.5e6; // телефоны: меньше пикселей — плавнее
    if (this.sw * this.sh * dpr * dpr > maxPx) dpr = Math.sqrt(maxPx / (this.sw * this.sh));
    this.dpr = Math.max(1, dpr);
    this.canvas.width = Math.round(this.sw * this.dpr); this.canvas.height = Math.round(this.sh * this.dpr);
    this.canvas.style.width = this.sw + 'px'; this.canvas.style.height = this.sh + 'px';
  },

  frame(ts) {
    requestAnimationFrame(t2 => this.frame(t2));
    let dt = Math.min(0.05, Math.max(0, (ts - this.last) / 1000));
    this.last = ts;
    this.t += dt;
    const ctx = this.ctx, sw = this.sw, sh = this.sh;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    UI.begin();
    const inp = this.input;
    inp.sw = sw; inp.sh = sh;
    // клавиатура
    inp.kx = (this.keys.ArrowRight || this.keys.KeyD ? 1 : 0) - (this.keys.ArrowLeft || this.keys.KeyA ? 1 : 0);
    inp.ky = (this.keys.ArrowDown || this.keys.KeyS ? 1 : 0) - (this.keys.ArrowUp || this.keys.KeyW ? 1 : 0);
    try {
      switch (this.state) {
        case 'loading': ctx.fillStyle = '#14102b'; ctx.fillRect(0, 0, sw, sh); HUD.text(ctx, 'Загрузка…', sw / 2, sh / 2, 30, '#fff', 'center'); break;
        case 'menu': UI.menu(ctx, sw, sh, this.t); break;
        case 'levels': UI.levels(ctx, sw, sh, this.t); break;
        case 'photo': UI.photo(ctx, sw, sh, this.t); break;
        case 'help': UI.help(ctx, sw, sh, this.t); break;
        case 'credits': UI.credits(ctx, sw, sh, this.t); break;
        case 'comic': Comic.update(dt); Comic.draw(ctx, sw, sh, this.t); break;
        case 'play': {
          const L = this.world;
          const z = L.cam.zoom || 1;
          inp.wx = L.cam.x + (inp.mx - sw / 2) / z; inp.wy = L.cam.y + (inp.my - sh / 2) / z;
          const steps = dt > 1 / 50 ? 2 : 1;
          for (let s = 0; s < steps; s++) { L.update(dt / steps, inp); inp.dash = false; }
          L.render(ctx, sw, sh, this.t);
          HUD.draw(ctx, L, sw, sh, this.t, inp);
          if (inp.touch) this.drawTouchButtons(ctx, sw, sh);
          if (L.won && L.endT > 3) this.finishLevel(true);
          else if (L.failed && L.endT > 2.4) this.finishLevel(false);
          break;
        }
        case 'pause': this.world.render(ctx, sw, sh, this.t); HUD.draw(ctx, this.world, sw, sh, this.t, inp); UI.pause(ctx, sw, sh, this.t); break;
        case 'results': UI.results(ctx, sw, sh, this.t); break;
      }
    } catch (e) {
      console.error(e);
      if (!this.errShown) { this.errShown = true; }
    }
    inp.dash = false;
    this.canvas.style.cursor = this.state === 'play' ? 'none' : (UI.hover ? 'pointer' : 'default');
  },

  drawTouchButtons(ctx, sw, sh) {
    const r = Math.max(30, Math.min(sw, sh) * 0.085);
    const mm = (sw < 700 ? 110 : 170) * U.clamp(Math.min(sw, sh) / 800, 0.7, 1.4);
    const x = sw - r * 1.3, y = sh - mm - r * 1.6 - 20;
    this.touchDash = { x, y, r };
    ctx.save(); ctx.globalAlpha = 0.55; circ(ctx, x, y, r, '#9b5cff', '#fff', 3); ctx.restore();
    HUD.text(ctx, '⚡', x, y + r * 0.3, r * 0.9, '#fff', 'center', null);
    const px = x, py = y - r * 2.1;
    this.touchPause = { x: px, y: py, r: r * 0.55 };
    ctx.save(); ctx.globalAlpha = 0.5; circ(ctx, px, py, r * 0.55, '#495057', '#fff', 2); ctx.restore();
    HUD.text(ctx, 'II', px, py + r * 0.2, r * 0.5, '#fff', 'center', null);
  },

  // ---------- ввод ----------
  bindInput() {
    const c = this.canvas, inp = this.input;
    const pos = (e) => { const r = c.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    let lastTap = 0, drag = null;
    c.addEventListener('contextmenu', e => e.preventDefault());
    c.addEventListener('pointerdown', e => {
      Sound.init();
      const [x, y] = pos(e);
      inp.mx = x; inp.my = y; inp.mouse = true;
      inp.touch = e.pointerType === 'touch';
      if (this.state === 'play') {
        if (e.button === 2) { inp.dash = true; return; }
        if (inp.touch) {
          if (this.touchDash && U.dist(x, y, this.touchDash.x, this.touchDash.y) < this.touchDash.r) { inp.dash = true; inp.mx = this.world.cam ? inp.mx : x; return; }
          if (this.touchPause && U.dist(x, y, this.touchPause.x, this.touchPause.y) < this.touchPause.r * 1.3) { this.pause(); return; }
          const now = performance.now(); if (now - lastTap < 280) inp.dash = true; lastTap = now;
        }
        return;
      }
      if (this.state === 'comic') {
        const s = Comic.skipRect;
        if (s && x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) Comic.skip(); else Comic.click();
        return;
      }
      if (this.state === 'photo' && UI.photoArea && U.dist(x, y, UI.photoArea.x, UI.photoArea.y) < UI.photoArea.r && Chars.photo) { drag = { x, y, cx: Chars.crop.x, cy: Chars.crop.y }; return; }
      // обновим hover и кликнем
      UI.clickAt(x, y);
    });
    c.addEventListener('pointermove', e => {
      const [x, y] = pos(e);
      if (e.pointerType === 'touch' && this.state === 'play' && this.touchDash && U.dist(x, y, this.touchDash.x, this.touchDash.y) < this.touchDash.r) return;
      inp.mx = x; inp.my = y; inp.mouse = true;
      if (drag) { const R = UI.photoArea.r * 2; Chars.crop.x = drag.cx + (x - drag.x) / R; Chars.crop.y = drag.cy + (y - drag.y) / R; Chars.renderPhoto(); }
    });
    window.addEventListener('pointerup', () => { drag = null; });
    c.addEventListener('wheel', e => {
      if (this.state === 'photo' && Chars.photo) { e.preventDefault(); Chars.crop.s = U.clamp(Chars.crop.s * (e.deltaY < 0 ? 1.08 : 1 / 1.08), 0.5, 5); Chars.renderPhoto(); }
    }, { passive: false });
    window.addEventListener('keydown', e => {
      Sound.init();
      this.keys[e.code] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
      if (e.repeat) return;
      if (e.code === 'F11' && window.nikitaFullscreen) { e.preventDefault(); this.toggleFullscreen(); return; }
      const st = this.state;
      if (st === 'play') {
        if (e.code === 'Space' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') inp.dash = true;
        if (e.code === 'Escape' || e.code === 'KeyP') this.pause();
        if (e.code === 'KeyM') inp.showMap = !inp.showMap;
        if (DEV && e.code === 'KeyG') { this.world.P.r *= 1.25; }
        if (DEV && e.code === 'KeyK') { this.world.win(); }
        if (DEV && e.code === 'KeyF') { for (const k in this.world.flags) this.world.flags[k] = true; }
      } else if (st === 'pause') {
        if (e.code === 'Escape' || e.code === 'KeyP') this.resume();
      } else if (st === 'comic') {
        if (e.code === 'Escape') Comic.skip();
        if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowRight') Comic.click();
      } else if (st === 'results') {
        if (e.code === 'Enter' || e.code === 'Space') { if (this.result.win) this.next(); else this.playLevel(this.result.idx); }
        if (e.code === 'Escape') this.go('menu');
      } else if (st === 'menu') {
        if (e.code === 'Enter' || e.code === 'Space') this.startLevel(Math.min(this.save.unlocked, LEVELS.length - 1));
      } else if (e.code === 'Escape') this.go('menu');
    });
    window.addEventListener('keyup', e => { this.keys[e.code] = false; });
    window.addEventListener('blur', () => { this.keys = {}; if (this.state === 'play') this.pause(); });
    document.getElementById('photoInput').addEventListener('change', e => { this.onPhotoFile(e.target.files[0]); e.target.value = ''; });
  },
};

window.addEventListener('load', () => {
  Game.init();
  // офлайн-режим и установка на телефон (работает, когда игра открыта по http/https)
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !window.NIKITA_SINGLE) navigator.serviceWorker.register('sw.js').catch(() => { });
});
