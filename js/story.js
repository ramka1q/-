/* =========================================================================
 *  story.js  —  сценарії коміксів: вступ, переходи між рівнями, фінал.
 *  Кожен сценарій = масив сцен (beats) для рушія Comics.
 * ========================================================================= */

/* ---- намальовані фони для коміксів ---- */
const Scenes = {
  lab(ctx, w, h, t) {
    // підлога
    ctx.fillStyle = '#1b2a3a'; ctx.fillRect(0, h * 0.72, w, h * 0.28);
    // полиці з колбами
    ctx.fillStyle = '#24384c';
    for (let s = 0; s < 3; s++) {
      const y = h * (0.18 + s * 0.16);
      ctx.fillRect(w * 0.04, y, w * 0.22, 8);
      for (let i = 0; i < 4; i++) {
        const x = w * (0.05 + i * 0.05);
        ctx.fillStyle = ['#46d39a', '#e0556b', '#4e8be8', '#ffd84d'][(i + s) % 4];
        ctx.globalAlpha = 0.85; Art.roundRect(ctx, x, y - 18, 14, 18, 4); ctx.fill(); ctx.globalAlpha = 1;
        ctx.fillStyle = '#24384c';
      }
    }
    // велика установка-реактор справа
    ctx.fillStyle = '#2c2540';
    Art.roundRect(ctx, w * 0.76, h * 0.18, w * 0.18, h * 0.5, 16); ctx.fill();
    const glow = 0.5 + 0.5 * Math.sin(t * 3);
    ctx.fillStyle = `rgba(160,90,220,${0.4 + glow * 0.4})`;
    Art.circle(ctx, w * 0.85, h * 0.36, 34 + glow * 6); ctx.fill();
  },
  street(ctx, w, h) {
    ctx.fillStyle = '#3a4654'; ctx.fillRect(0, h * 0.66, w, h * 0.34);
    // силуети будинків
    const cols = ['#26303f', '#2d3a4c', '#222b39'];
    let x = 0, i = 0;
    while (x < w) {
      const bw = w * (0.08 + (i % 3) * 0.03);
      const bh = h * (0.22 + ((i * 37) % 20) / 100);
      ctx.fillStyle = cols[i % 3];
      ctx.fillRect(x, h * 0.66 - bh, bw - 6, bh);
      ctx.fillStyle = 'rgba(255,220,120,0.5)';
      for (let wy = 0; wy < 4; wy++) for (let wx = 0; wx < 2; wx++)
        if ((i + wy + wx) % 2) ctx.fillRect(x + 8 + wx * bw * 0.45, h * 0.66 - bh + 12 + wy * bh * 0.22, bw * 0.28, bh * 0.12);
      x += bw; i++;
    }
    // дорожня розмітка
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 4; ctx.setLineDash([20, 18]);
    ctx.beginPath(); ctx.moveTo(0, h * 0.86); ctx.lineTo(w, h * 0.86); ctx.stroke(); ctx.setLineDash([]);
  },
  city(ctx, w, h, t) {
    // нічне місто згори
    ctx.fillStyle = '#0e1730'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) {
      const x = (hash2(i, 1) * w), y = (hash2(i, 2) * h);
      const tw = 0.5 + 0.5 * Math.sin(t * 3 + i);
      ctx.fillStyle = `rgba(255,220,140,${0.3 + tw * 0.5})`;
      ctx.fillRect(x, y, 3, 3);
    }
    ctx.fillStyle = '#1a2545';
    for (let i = 0; i < 7; i++) {
      const bx = w * (0.05 + i * 0.13);
      const bh = h * (0.3 + (hash2(i, 9)) * 0.4);
      ctx.fillRect(bx, h - bh, w * 0.1, bh);
    }
  },
  sky(ctx, w, h, t) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#9fd0f5'); g.addColorStop(1, '#5b9bd6');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 5; i++) {
      const cx = ((i * 0.27 * w + t * 14) % (w + 200)) - 100;
      const cy = h * (0.15 + (i % 3) * 0.12);
      ctx.save(); ctx.translate(cx, cy); Art.PROPS.cloud(ctx, 40, i, t); ctx.restore();
    }
    // земля-континент знизу
    ctx.fillStyle = '#5b9a55'; ctx.beginPath();
    ctx.ellipse(w / 2, h * 1.25, w * 0.8, h * 0.4, 0, 0, TAU); ctx.fill();
  },
  space(ctx, w, h, t) {
    ctx.fillStyle = '#05010f'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 120; i++) {
      const x = hash2(i, 3) * w, y = hash2(i, 7) * h;
      const tw = 0.4 + 0.6 * Math.sin(t * 2 + i * 1.7);
      ctx.fillStyle = `rgba(255,255,255,${tw})`;
      ctx.fillRect(x, y, 2, 2);
    }
    // туманність
    const g = ctx.createRadialGradient(w * 0.7, h * 0.3, 10, w * 0.7, h * 0.3, w * 0.5);
    g.addColorStop(0, 'rgba(150,80,220,0.35)'); g.addColorStop(1, 'rgba(150,80,220,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.save(); ctx.translate(w * 0.2, h * 0.7); Art.PROPS.planet(ctx, 60, 2, t); ctx.restore();
  },
};

/* ---- сценарії ---- */
const STORY = {

  /* ВСТУП */
  intro: [
    {
      dur: 5, bg: ['#22344a', '#0b1521'], scene: Scenes.lab, dots: 'rgba(120,200,255,0.05)',
      caption: 'Науковий інститут. Лабораторія № 7.',
      actors: [
        { char: 'molgelevich', x: 0.5, y: 0.66, r: 0.2, enter: 'rise', delay: 0.2 },
        { char: 'egor', x: 0.24, y: 0.7, r: 0.15, enter: 'left', delay: 0.5 },
        { char: 'danya', x: 0.76, y: 0.7, r: 0.15, enter: 'right', delay: 0.5, flip: true },
      ],
      bubbles: [
        { text: 'Колеги! Я створив ідеальний організм. Він їсть... ЕТ-ТО ВСЕ!', who: 'molgelevich', x: 0.5, y: 0.2, from: { x: 0.5, y: 0.5 }, delay: 1.0, w: 0.5 },
      ],
    },
    {
      dur: 4.5, bg: ['#2a1c3a', '#0e0818'], scene: Scenes.lab, rays: true,
      caption: 'А в пробірці заворушилось...',
      actors: [
        { char: 'nikita', x: 0.5, y: 0.55, r: 0.13, enter: 'pop', delay: 0.2, chomp: 0.8 },
        { char: 'egor', x: 0.2, y: 0.72, r: 0.14, enter: 'fade', delay: 0.3, panic: 0.6 },
      ],
      sfx: [{ text: 'ХРУМ!', x: 0.66, y: 0.4, at: 1.2, color: '#7CFFB2', rot: 0.1 }],
      bubbles: [
        { text: 'Молгелевич... воно зжерло пробірку!', who: 'egor', x: 0.26, y: 0.26, from: { x: 0.2, y: 0.6 }, delay: 1.4, w: 0.4 },
      ],
    },
    {
      dur: 4.5, bg: ['#3a0d1a', '#0a0306'], fx: ['shake'], rays: true, flashAt: 0.3,
      caption: 'НІКІТА ВИРВАВСЯ НА ВОЛЮ!',
      actors: [
        { char: 'nikita', x: 0.5, y: 0.55, r: 0.26, enter: 'pop', delay: 0.0, chomp: 1 },
      ],
      sfx: [
        { text: 'БУ-БУМ!', x: 0.5, y: 0.28, at: 0.2, size: 0.14, color: '#ffd84d', rot: -0.1 },
        { text: 'АААА!', x: 0.82, y: 0.7, at: 0.6, color: '#ff6b8a', rot: 0.2, size: 0.08 },
      ],
    },
    {
      dur: 5, bg: ['#1a2740', '#070b14'], scene: Scenes.lab, dots: 'rgba(255,255,255,0.04)',
      caption: 'Усі науковці інституту присягнули його зупинити.',
      actors: [
        { char: 'molgelevich', x: 0.5, y: 0.64, r: 0.2, enter: 'drop', delay: 0.2 },
        { char: 'egor', x: 0.18, y: 0.74, r: 0.13, enter: 'left', delay: 0.5 },
        { char: 'danya', x: 0.34, y: 0.78, r: 0.13, enter: 'left', delay: 0.7 },
        { char: 'pilipyuk', x: 0.66, y: 0.78, r: 0.13, enter: 'right', delay: 0.7, flip: true },
        { char: 'dima', x: 0.82, y: 0.74, r: 0.13, enter: 'right', delay: 0.5, flip: true },
      ],
      bubbles: [
        { text: 'Зупинити його! За БУДЬ-ЯКУ ціну!', who: 'molgelevich', x: 0.5, y: 0.2, from: { x: 0.5, y: 0.48 }, delay: 1.2, shout: true, w: 0.42 },
      ],
    },
  ],

  /* 1 -> 2 (з'їдено Єгора) */
  t12: [
    {
      dur: 4.5, bg: ['#3a2f4a', '#160f22'], scene: Scenes.lab, dots: 'rgba(255,210,160,0.05)',
      caption: 'Єгор зник у пащі. Нікіта побільшав.',
      actors: [
        { char: 'nikita', x: 0.62, y: 0.55, r: 0.2, enter: 'left', delay: 0.1, chomp: 0.7 },
        { char: 'danya', x: 0.22, y: 0.72, r: 0.15, enter: 'fade', delay: 0.4, panic: 0.8 },
      ],
      sfx: [{ text: 'ГЛИТЬ!', x: 0.5, y: 0.3, at: 0.5, color: '#b388ff' }],
      bubbles: [
        { text: 'Він зжер Єгора?! Тепер моя черга його спинити!', who: 'danya', x: 0.26, y: 0.24, from: { x: 0.22, y: 0.6 }, delay: 1.0, w: 0.42 },
      ],
    },
  ],

  /* 2 -> 3 (з'їдено Даню) */
  t23: [
    {
      dur: 4.5, bg: ['#5a86b0', '#27405c'], scene: Scenes.street, rays: true,
      caption: 'Нікіта виповз на вулицю. Назустріч — Пилипюк.',
      actors: [
        { char: 'pilipyuk', x: 0.3, y: 0.72, r: 0.17, enter: 'left', delay: 0.2 },
        { char: 'nikita', x: 0.74, y: 0.6, r: 0.18, enter: 'right', delay: 0.4, chomp: 0.6 },
      ],
      bubbles: [
        { text: 'Стій, слизька твар-р-рюко! Я тебе зупиню!', who: 'pilipyuk', x: 0.3, y: 0.24, from: { x: 0.3, y: 0.6 }, delay: 0.9, w: 0.4 },
        { text: '(хрум-хрум)', who: 'nikita', x: 0.78, y: 0.3, from: { x: 0.74, y: 0.5 }, delay: 2.2, think: true, w: 0.22, size: 0.026 },
      ],
    },
  ],

  /* 3 -> 4 (з'їдено Пилипюка) */
  t34: [
    {
      dur: 4.5, bg: ['#243b6e', '#0c1428'], scene: Scenes.city, dots: 'rgba(150,180,255,0.05)',
      caption: 'Вулиця замала. Нікіта дивиться на ціле місто.',
      actors: [
        { char: 'dima', x: 0.24, y: 0.74, r: 0.16, enter: 'rise', delay: 0.2, panic: 0.5 },
        { char: 'nikita', x: 0.72, y: 0.55, r: 0.24, enter: 'pop', delay: 0.4, chomp: 0.8 },
      ],
      sfx: [{ text: 'О НІ...', x: 0.5, y: 0.3, at: 1.0, color: '#ff6b8a', size: 0.08 }],
      bubbles: [
        { text: 'Він уже з будинок завбільшки! Евакуація!', who: 'dima', x: 0.26, y: 0.24, from: { x: 0.24, y: 0.62 }, delay: 0.9, w: 0.42 },
      ],
    },
  ],

  /* 4 -> 5 (з'їдено Діму) — Кирило і няня Наташа */
  t45: [
    {
      dur: 5, bg: ['#7db0e0', '#3a6aa0'], scene: Scenes.sky, dots: 'rgba(255,255,255,0.05)',
      caption: 'Останні захисники: Кирило і його няня Наташа.',
      actors: [
        { char: 'natasha', x: 0.34, y: 0.72, r: 0.16, enter: 'left', delay: 0.2 },
        { char: 'kirill', x: 0.5, y: 0.74, r: 0.15, enter: 'rise', delay: 0.5 },
        { char: 'nikita', x: 0.8, y: 0.5, r: 0.22, enter: 'right', delay: 0.6, chomp: 0.7 },
      ],
      bubbles: [
        { text: 'Кириле, тримайся за руку і не відпускай!', who: 'natasha', x: 0.26, y: 0.22, from: { x: 0.34, y: 0.6 }, delay: 0.9, w: 0.38 },
        { text: 'Наташ, а можна його погладити? Він гарненький...', who: 'kirill', x: 0.6, y: 0.28, from: { x: 0.5, y: 0.62 }, delay: 2.3, w: 0.4 },
      ],
    },
  ],

  /* 5 -> 6 (з'їдено Кирила і Наташу) — поява фінального боса */
  t56: [
    {
      dur: 5, bg: ['#1a0b33', '#05010f'], scene: Scenes.space, rays: true, dots: 'rgba(180,140,255,0.06)',
      caption: 'Орбітальна станція. Залишився лише ОДИН геній.',
      actors: [
        { char: 'molgelevich', x: 0.5, y: 0.6, r: 0.26, enter: 'drop', delay: 0.2 },
      ],
      sfx: [{ text: '!', x: 0.5, y: 0.2, at: 1.5, color: '#9b5de5', size: 0.06 }],
      bubbles: [
        { text: 'Усі провалились. Доведеться мені... ОСОБИСТО.', who: 'molgelevich', x: 0.5, y: 0.22, from: { x: 0.5, y: 0.45 }, delay: 1.0, w: 0.5, shout: true },
      ],
    },
    {
      dur: 4.5, bg: ['#2a0b3a', '#08010f'], scene: Scenes.space, fx: ['shake'], shakeAt: 0.4,
      caption: 'Я розумніший за всіх. Навіть за Кирила!',
      actors: [
        { char: 'molgelevich', x: 0.35, y: 0.62, r: 0.22, enter: 'fade', delay: 0.1 },
        { char: 'nikita', x: 0.74, y: 0.52, r: 0.26, enter: 'right', delay: 0.3, chomp: 1, hue: 290 },
      ],
      sfx: [{ text: 'ФІНАЛ!', x: 0.5, y: 0.32, at: 0.5, size: 0.13, color: '#ffd84d', rot: -0.08 }],
    },
  ],

  /* ФІНАЛ (перемога) */
  ending: [
    {
      dur: 5, bg: ['#1a0b33', '#05010f'], scene: Scenes.space, rays: true, flashAt: 0.2,
      caption: 'Молгелевич з\'їдений. Зупиняти Нікіту більше нікому.',
      actors: [
        { char: 'nikita', x: 0.5, y: 0.55, r: 0.32, enter: 'pop', delay: 0.1, chomp: 0.9, img: true },
      ],
      sfx: [{ text: 'ХРУМ!', x: 0.72, y: 0.34, at: 0.6, color: '#7CFFB2', size: 0.11 }],
    },
    {
      dur: 6, bg: ['#0b0620', '#020008'], scene: Scenes.space, dots: 'rgba(180,140,255,0.05)',
      caption: 'Нікіта оглянув Всесвіт...',
      actors: [
        { char: 'nikita', x: 0.5, y: 0.52, r: 0.3, enter: 'fade', delay: 0.2, chomp: 0.3 },
      ],
      bubbles: [
        { text: 'Смачно. А хто... НАСТУПНИЙ?', who: 'nikita', x: 0.5, y: 0.2, from: { x: 0.5, y: 0.45 }, delay: 1.4, w: 0.4, shout: true },
      ],
      sfx: [{ text: 'КІНЕЦЬ?', x: 0.78, y: 0.8, at: 3.0, color: '#ffd84d', size: 0.06, rot: 0.1, life: 3 }],
    },
  ],
};
