'use strict';
// ============================================================
//  Звук: всё синтезируется WebAudio — ни одного файла
// ============================================================
const Sound = {
  ctx: null, master: null, sfxGain: null, musicGain: null, noiseBuf: null,
  musicVol: 0.5, sfxVol: 0.7, muted: false,
  theme: null, step: 0, nextTime: 0, timer: null, lastPlay: {},

  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 1;
    this.master.connect(this.ctx.destination);
    // лёгкий компрессор, чтобы ничего не хрипело
    const comp = this.ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4;
    comp.connect(this.master);
    this.sfxGain = this.ctx.createGain(); this.sfxGain.gain.value = this.sfxVol; this.sfxGain.connect(comp);
    this.musicGain = this.ctx.createGain(); this.musicGain.gain.value = this.musicVol * 0.55; this.musicGain.connect(comp);
    const len = this.ctx.sampleRate * 1.5;
    this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    if (this.pendingTheme) { const t = this.pendingTheme; this.pendingTheme = null; this.playMusic(t); }
  },

  setMuted(m) { this.muted = m; if (this.master) this.master.gain.value = m ? 0 : 1; },
  setMusicVol(v) { this.musicVol = v; if (this.musicGain) this.musicGain.gain.value = v * 0.55; },
  setSfxVol(v) { this.sfxVol = v; if (this.sfxGain) this.sfxGain.gain.value = v; },

  // ---------- примитивы ----------
  tone(freq, dur, type = 'square', vol = 0.2, slideTo = 0, delay = 0, dest = null, attack = 0.005) {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(dest || this.sfxGain);
    o.start(t0); o.stop(t0 + dur + 0.02);
  },
  noise(dur, vol = 0.2, freq = 2000, type = 'lowpass', delay = 0, freqTo = 0, dest = null, q = 1) {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime + delay;
    const s = this.ctx.createBufferSource(); s.buffer = this.noiseBuf;
    const f = this.ctx.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t0); f.Q.value = q;
    if (freqTo) f.frequency.exponentialRampToValueAtTime(freqTo, t0 + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(f); f.connect(g); g.connect(dest || this.sfxGain);
    s.start(t0, Math.random() * 0.5); s.stop(t0 + dur + 0.02);
  },

  // Ограничитель частоты: одинаковые звуки не чаще, чем раз в minGap сек
  gate(name, minGap) {
    const now = performance.now() / 1000;
    if (this.lastPlay[name] && now - this.lastPlay[name] < minGap) return false;
    this.lastPlay[name] = now; return true;
  },

  play(name, p = 0) {
    if (!this.ctx || this.muted) return;
    const r = Math.random;
    switch (name) {
      case 'eat': { // p — относительный размер съеденного 0..1
        if (!this.gate('eat', 0.035)) return;
        const base = 520 - p * 300 + r() * 120;
        this.tone(base, 0.09, 'square', 0.09, base * 1.9);
        this.noise(0.05, 0.08, 1800, 'bandpass');
        break;
      }
      case 'bigeat':
        this.tone(160, 0.25, 'sawtooth', 0.14, 60);
        this.noise(0.22, 0.25, 900, 'lowpass', 0, 200);
        this.tone(300, 0.12, 'square', 0.08, 700, 0.05);
        break;
      case 'grow': [0, 4, 7, 12].forEach((s, i) => this.tone(440 * Math.pow(2, s / 12), 0.12, 'triangle', 0.12, 0, i * 0.05)); break;
      case 'hurt':
        if (!this.gate('hurt', 0.15)) return;
        this.tone(380, 0.3, 'sawtooth', 0.16, 90); this.noise(0.18, 0.18, 1200); break;
      case 'dash': this.noise(0.25, 0.18, 400, 'bandpass', 0, 3000, null, 2); this.tone(200, 0.15, 'sine', 0.08, 500); break;
      case 'power': [0, 5, 9, 12, 17, 21].forEach((s, i) => this.tone(600 * Math.pow(2, s / 12), 0.1, 'square', 0.06, 0, i * 0.04)); break;
      case 'key': this.tone(880, 0.12, 'triangle', 0.18); this.tone(1320, 0.3, 'triangle', 0.16, 0, 0.1); break;
      case 'door': this.tone(110, 0.5, 'sawtooth', 0.12, 55); this.noise(0.5, 0.12, 400, 'lowpass', 0, 120); break;
      case 'click': this.tone(1200, 0.04, 'square', 0.06); break;
      case 'button': this.tone(660, 0.07, 'square', 0.1); this.tone(990, 0.1, 'square', 0.08, 0, 0.06); break;
      case 'bonk': if (!this.gate('bonk', 0.25)) return; this.tone(140, 0.12, 'sine', 0.18, 70); break;
      case 'laser': if (!this.gate('laser', 0.08)) return; this.tone(1800, 0.15, 'sawtooth', 0.06, 200); break;
      case 'shoot': if (!this.gate('shoot', 0.06)) return; this.tone(900, 0.12, 'square', 0.07, 250); break;
      case 'splash': this.noise(0.35, 0.2, 1500, 'lowpass', 0, 300); this.tone(300, 0.1, 'sine', 0.1, 900); break;
      case 'boom':
        this.noise(0.8, 0.45, 1200, 'lowpass', 0, 60); this.tone(90, 0.6, 'sine', 0.35, 30); break;
      case 'win':
        [0, 4, 7, 12, 7, 12, 16, 19].forEach((s, i) => this.tone(392 * Math.pow(2, s / 12), 0.18, i < 4 ? 'square' : 'triangle', 0.1, 0, i * 0.09));
        break;
      case 'lose': [7, 5, 3, 0].forEach((s, i) => this.tone(330 * Math.pow(2, s / 12), 0.28, 'sawtooth', 0.09, 0, i * 0.2)); break;
      case 'page': this.noise(0.28, 0.12, 3000, 'highpass', 0, 800); break;
      case 'type': if (!this.gate('type', 0.045)) return; this.tone(700 + r() * 300, 0.025, 'square', 0.025); break;
      case 'alarm': this.tone(700, 0.25, 'square', 0.08, 1100); this.tone(1100, 0.25, 'square', 0.08, 700, 0.25); break;
      case 'bosshit': this.noise(0.4, 0.35, 2000, 'lowpass', 0, 100); this.tone(70, 0.4, 'square', 0.2, 35); this.tone(1400, 0.2, 'sawtooth', 0.06, 300); break;
      case 'chime': [0, 7, 12].forEach((s, i) => this.tone(784 * Math.pow(2, s / 12), 0.35, 'sine', 0.12, 0, i * 0.08)); break;
      case 'stun': [0, 3, 0, 3].forEach((s, i) => this.tone(500 * Math.pow(2, s / 12), 0.08, 'square', 0.07, 0, i * 0.07)); break;
      case 'freeze': this.tone(2000, 0.4, 'sine', 0.08, 600); this.noise(0.3, 0.1, 6000, 'highpass'); break;
      case 'teleport': this.tone(300, 0.35, 'sine', 0.12, 1800); this.tone(450, 0.35, 'triangle', 0.08, 2400, 0.05); break;
      case 'select': this.tone(520, 0.06, 'square', 0.08); this.tone(780, 0.08, 'square', 0.07, 0, 0.05); break;
      case 'crunch': this.noise(0.18, 0.3, 700, 'lowpass', 0, 150); this.tone(120, 0.12, 'square', 0.1, 60); break;
      case 'warn': if (!this.gate('warn', 0.3)) return; this.tone(440, 0.12, 'square', 0.06); break;
      case 'pop': this.tone(300, 0.08, 'sine', 0.15, 900); break;
    }
  },

  // ============================================================
  //  Музыка: процедурный секвенсор (у каждой главы своя тема)
  // ============================================================
  themes: {
    menu:    { bpm: 112, root: 60, scale: [0, 2, 4, 5, 7, 9, 11], chords: [0, 5, 3, 4], lead: 'square', bass: 'triangle', seed: 7, drums: 'pop', swing: 0 },
    lab:     { bpm: 122, root: 57, scale: [0, 2, 3, 5, 7, 8, 10], chords: [0, 5, 2, 6], lead: 'square', bass: 'square', seed: 21, drums: 'pop', swing: 0.1 },
    city:    { bpm: 116, root: 53, scale: [0, 2, 4, 5, 7, 9, 10], chords: [0, 3, 4, 3], lead: 'sawtooth', bass: 'square', seed: 33, drums: 'funk', swing: 0.15 },
    dark:    { bpm: 88, root: 50, scale: [0, 2, 3, 5, 7, 8, 10], chords: [0, 5, 6, 4], lead: 'triangle', bass: 'sawtooth', seed: 44, drums: 'sparse', swing: 0 },
    base:    { bpm: 132, root: 52, scale: [0, 2, 3, 5, 7, 8, 10], chords: [0, 0, 5, 6], lead: 'sawtooth', bass: 'sawtooth', seed: 55, drums: 'march', swing: 0 },
    ocean:   { bpm: 98, root: 52, scale: [0, 2, 3, 5, 7, 9, 10], chords: [0, 3, 6, 4], lead: 'triangle', bass: 'triangle', seed: 66, drums: 'soft', swing: 0.1 },
    volcano: { bpm: 140, root: 48, scale: [0, 1, 3, 5, 7, 8, 10], chords: [0, 1, 0, 6], lead: 'sawtooth', bass: 'square', seed: 77, drums: 'rock', swing: 0 },
    earth:   { bpm: 120, root: 55, scale: [0, 2, 4, 5, 7, 9, 11], chords: [0, 4, 5, 3], lead: 'square', bass: 'triangle', seed: 88, drums: 'pop', swing: 0 },
    space:   { bpm: 92, root: 47, scale: [0, 2, 3, 5, 7, 8, 10], chords: [0, 5, 3, 6], lead: 'sine', bass: 'triangle', seed: 99, drums: 'soft', swing: 0 },
    boss:    { bpm: 156, root: 52, scale: [0, 1, 3, 5, 7, 8, 11], chords: [0, 5, 6, 4], lead: 'sawtooth', bass: 'sawtooth', seed: 111, drums: 'rock', swing: 0 },
    comic:   { bpm: 100, root: 55, scale: [0, 2, 4, 5, 7, 9, 11], chords: [0, 3, 5, 4], lead: 'triangle', bass: 'triangle', seed: 123, drums: 'soft', swing: 0.1 },
    ending:  { bpm: 104, root: 60, scale: [0, 2, 4, 5, 7, 9, 11], chords: [0, 5, 3, 4], lead: 'triangle', bass: 'square', seed: 140, drums: 'pop', swing: 0.08 },
  },

  buildPatterns(th) {
    const rnd = U.rng(th.seed);
    const sc = th.scale;
    const deg = d => { const o = Math.floor(d / 7); return sc[((d % 7) + 7) % 7] + 12 * o; };
    th.mel = []; th.bassP = [];
    for (let bar = 0; bar < 4; bar++) {
      const c = th.chords[bar];
      const chordTones = [c, c + 2, c + 4, c + 7];
      const bars = [];
      let last = c + 7;
      for (let s = 0; s < 16; s++) {
        let note = null;
        const strong = s % 4 === 0;
        if (strong ? rnd() < 0.85 : rnd() < 0.45) {
          if (strong) last = rnd.pick(chordTones) + 7;
          else last = last + rnd.pick([-2, -1, 1, 2, 0]);
          last = U.clamp(last, c + 2, c + 14);
          note = deg(last);
        }
        bars.push(note);
      }
      // вторая половина — вариация первой (запоминающийся мотив)
      if (bar % 2 === 1) for (let s = 0; s < 8; s++) bars[s] = th.mel[bar - 1][s] !== null ? th.mel[bar - 1][s] + (deg(c) - deg(th.chords[bar - 1])) : null;
      th.mel.push(bars);
      // бас: тоника / квинта / октава (в ступенях лада)
      th.bassP.push([0, null, 4, null, 0, null, 0, 4, 0, null, 4, null, 0, 7, 4, null].map(v => (v === null ? null : deg(c + v))));
    }
    th.built = true;
  },

  playMusic(name) {
    if (!this.ctx) { this.pendingTheme = name; return; }
    if (this.theme && this.theme.name === name) return;
    const th = this.themes[name];
    if (!th) return;
    th.name = name;
    if (!th.built) this.buildPatterns(th);
    this.theme = th; this.step = 0;
    this.nextTime = this.ctx.currentTime + 0.1;
    if (!this.timer) this.timer = setInterval(() => this.schedule(), 25);
  },
  stopMusic() { this.theme = null; },

  schedule() {
    if (!this.ctx || !this.theme) return;
    const th = this.theme;
    const stepDur = 60 / th.bpm / 4;
    while (this.nextTime < this.ctx.currentTime + 0.12) {
      const s = this.step % 16, bar = Math.floor(this.step / 16) % 4;
      let t = this.nextTime + (s % 2 ? th.swing * stepDur : 0);
      const delay = Math.max(0, t - this.ctx.currentTime);
      const midi = n => 440 * Math.pow(2, (th.root + n - 69) / 12);
      const mg = this.musicGain;
      const m = th.mel[bar][s];
      if (m !== null) this.tone(midi(m + 12), stepDur * 1.6, th.lead, th.lead === 'sawtooth' ? 0.05 : th.lead === 'sine' ? 0.12 : 0.07, 0, delay, mg);
      const b = th.bassP[bar][s];
      if (b !== null && (th.drums !== 'sparse' || s % 4 === 0)) this.tone(midi(b - 12), stepDur * 1.8, th.bass, th.bass === 'sawtooth' ? 0.07 : 0.11, 0, delay, mg);
      if (s === 0) { // пэд-аккорд
        const c = th.chords[bar];
        [0, 2, 4].forEach(k => {
          const d = c + k, o = Math.floor(d / 7);
          const n = th.scale[d % 7] + 12 * o;
          this.tone(midi(n), stepDur * 15, 'triangle', 0.025, 0, delay, mg, 0.3);
        });
      }
      this.drum(th.drums, s, delay);
      this.nextTime += stepDur; this.step++;
    }
  },

  drum(style, s, delay) {
    const mg = this.musicGain;
    const kick = () => this.tone(150, 0.16, 'sine', 0.35, 40, delay, mg);
    const snare = () => { this.noise(0.12, 0.16, 2500, 'bandpass', delay, 0, mg); this.tone(220, 0.06, 'triangle', 0.08, 120, delay, mg); };
    const hat = (v = 0.05) => this.noise(0.03, v, 8000, 'highpass', delay, 0, mg);
    switch (style) {
      case 'pop': if (s % 8 === 0) kick(); if (s % 8 === 4) snare(); if (s % 2 === 0) hat(); break;
      case 'funk': if (s === 0 || s === 6 || s === 10) kick(); if (s % 8 === 4) snare(); hat(s % 2 ? 0.025 : 0.05); break;
      case 'rock': if (s % 4 === 0) kick(); if (s % 8 === 4) snare(); if (s % 2 === 0) hat(0.06); break;
      case 'march': if (s % 4 === 0) kick(); if (s === 4 || s === 12 || s === 14) snare(); if (s % 2 === 0) hat(0.04); break;
      case 'soft': if (s === 0 || s === 10) kick(); if (s % 4 === 2) hat(0.03); break;
      case 'sparse': if (s === 0) kick(); if (s === 8) hat(0.04); break;
    }
  },
};
