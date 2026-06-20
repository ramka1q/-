/* =========================================================================
 *  story.js  —  сценарії анімованих коміксів для всіх 15 рівнів.
 *  Ключі переходів: t12, t23, ... t1415 (після рівня i → i+1).
 * ========================================================================= */

const Scenes = {
  lab(ctx, w, h, t) {
    ctx.fillStyle = '#1b2a3a'; ctx.fillRect(0, h * 0.72, w, h * 0.28);
    ctx.fillStyle = '#24384c';
    for (let s = 0; s < 3; s++) { const y = h * (0.18 + s * 0.16); ctx.fillRect(w * 0.04, y, w * 0.22, 8); for (let i = 0; i < 4; i++) { const x = w * (0.05 + i * 0.05); ctx.fillStyle = ['#46d39a', '#e0556b', '#4e8be8', '#ffd84d'][(i + s) % 4]; ctx.globalAlpha = 0.85; Art.roundRect(ctx, x, y - 18, 14, 18, 4); ctx.fill(); ctx.globalAlpha = 1; ctx.fillStyle = '#24384c'; } }
    ctx.fillStyle = '#2c2540'; Art.roundRect(ctx, w * 0.76, h * 0.18, w * 0.18, h * 0.5, 16); ctx.fill();
    const glow = 0.5 + 0.5 * Math.sin(t * 3); ctx.fillStyle = `rgba(160,90,220,${0.4 + glow * 0.4})`; Art.circle(ctx, w * 0.85, h * 0.36, 34 + glow * 6); ctx.fill();
  },
  blood(ctx, w, h, t) {
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#5a0d1a'); g.addColorStop(1, '#1a0307'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 16; i++) { const x = (hash2(i, 1) * w + t * 20) % w; const y = hash2(i, 2) * h; ctx.fillStyle = 'rgba(255,90,120,0.4)'; Art.circle(ctx, x, y, 10 + hash2(i, 3) * 20); ctx.fill(); ctx.fillStyle = 'rgba(150,10,30,0.5)'; Art.circle(ctx, x, y, 5 + hash2(i, 3) * 8); ctx.fill(); }
  },
  dark(ctx, w, h, t) {
    ctx.fillStyle = '#0a0c12'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#161a24'; ctx.fillRect(0, h * 0.78, w, h * 0.22);
    for (let i = 0; i < 10; i++) { const x = hash2(i, 5) * w; ctx.fillStyle = `rgba(120,200,255,${0.2 + 0.2 * Math.sin(t * 3 + i)})`; Art.circle(ctx, x, h * 0.4 + hash2(i, 6) * h * 0.3, 2); ctx.fill(); }
  },
  street(ctx, w, h) {
    ctx.fillStyle = '#3a4654'; ctx.fillRect(0, h * 0.66, w, h * 0.34);
    const cols = ['#26303f', '#2d3a4c', '#222b39']; let x = 0, i = 0;
    while (x < w) { const bw = w * (0.08 + (i % 3) * 0.03), bh = h * (0.22 + ((i * 37) % 20) / 100); ctx.fillStyle = cols[i % 3]; ctx.fillRect(x, h * 0.66 - bh, bw - 6, bh); ctx.fillStyle = 'rgba(255,220,120,0.5)'; for (let wy = 0; wy < 4; wy++) for (let wx = 0; wx < 2; wx++) if ((i + wy + wx) % 2) ctx.fillRect(x + 8 + wx * bw * 0.45, h * 0.66 - bh + 12 + wy * bh * 0.22, bw * 0.28, bh * 0.12); x += bw; i++; }
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 4; ctx.setLineDash([20, 18]); ctx.beginPath(); ctx.moveTo(0, h * 0.86); ctx.lineTo(w, h * 0.86); ctx.stroke(); ctx.setLineDash([]);
  },
  city(ctx, w, h, t) {
    ctx.fillStyle = '#0e1730'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) { const x = hash2(i, 1) * w, y = hash2(i, 2) * h; const tw = 0.5 + 0.5 * Math.sin(t * 3 + i); ctx.fillStyle = `rgba(255,220,140,${0.3 + tw * 0.5})`; ctx.fillRect(x, y, 3, 3); }
    ctx.fillStyle = '#1a2545'; for (let i = 0; i < 7; i++) { const bx = w * (0.05 + i * 0.13), bh = h * (0.3 + hash2(i, 9) * 0.4); ctx.fillRect(bx, h - bh, w * 0.1, bh); }
  },
  sky(ctx, w, h, t) {
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#9fd0f5'); g.addColorStop(1, '#5b9bd6'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 5; i++) { const cx = ((i * 0.27 * w + t * 14) % (w + 200)) - 100, cy = h * (0.15 + (i % 3) * 0.12); ctx.save(); ctx.translate(cx, cy); Art.PROPS.cloud(ctx, 40, i, t); ctx.restore(); }
    ctx.fillStyle = '#5b9a55'; ctx.beginPath(); ctx.ellipse(w / 2, h * 1.25, w * 0.8, h * 0.4, 0, 0, TAU); ctx.fill();
  },
  battle(ctx, w, h, t) {
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#5a5238'); g.addColorStop(1, '#1a160a'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#3a3420'; ctx.fillRect(0, h * 0.72, w, h * 0.28);
    for (let i = 0; i < 4; i++) { const x = w * (0.15 + i * 0.22); const fl = 0.3 + 0.7 * Math.abs(Math.sin(t * 2 + i)); ctx.fillStyle = `rgba(255,${120 + fl * 100},40,${0.3 * fl})`; Art.circle(ctx, x, h * 0.5, 40 + fl * 30); ctx.fill(); }
    ctx.fillStyle = '#26261c'; for (let i = 0; i < 3; i++) ctx.fillRect(w * (0.2 + i * 0.3), h * 0.66, w * 0.12, h * 0.08);
  },
  alien(ctx, w, h, t) {
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0d2a1a'); g.addColorStop(1, '#02100a'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 80; i++) { const x = hash2(i, 3) * w, y = hash2(i, 7) * h; ctx.fillStyle = `rgba(150,255,190,${0.3 + 0.5 * Math.sin(t * 2 + i)})`; ctx.fillRect(x, y, 2, 2); }
    for (let i = 0; i < 3; i++) { const x = ((i * 0.4 * w + t * 30) % (w + 200)) - 100; ctx.save(); ctx.translate(x, h * (0.2 + i * 0.12)); Art.CREATURES.ufo.draw(ctx, 26, { t }); ctx.restore(); }
  },
  arena(ctx, w, h, t) {
    const g = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * 0.7); g.addColorStop(0, '#3a0810'); g.addColorStop(1, '#070103'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = `rgba(255,90,120,${0.2 + 0.1 * Math.sin(t * 3)})`; ctx.lineWidth = 2;
    for (let r = 60; r < w; r += 70) { ctx.beginPath(); ctx.arc(w / 2, h / 2, r, 0, TAU); ctx.stroke(); }
  },
};

/* короткий "перехід": один кадр з підписом, акторами та (опц.) реплікою */
function beat(o) {
  return Object.assign({ dur: 4.2, dots: 'rgba(255,255,255,0.05)' }, o);
}
function ate(name) { return name + ' зник у пащі. Нікіта побільшав.'; }

const STORY = {
  intro: [
    beat({ dur: 5, bg: ['#22344a', '#0b1521'], scene: Scenes.lab, caption: 'Науковий інститут. Лабораторія № 7.',
      actors: [{ char: 'molgelevich', x: 0.5, y: 0.66, r: 0.2, enter: 'rise', delay: 0.2 }, { char: 'egor', x: 0.24, y: 0.7, r: 0.14, enter: 'left', delay: 0.5 }, { char: 'danya', x: 0.76, y: 0.7, r: 0.14, enter: 'right', delay: 0.5, flip: true }],
      bubbles: [{ text: 'Я створив ідеальний організм. Він їсть... ЕТ-ТО ВСЕ!', who: 'molgelevich', x: 0.5, y: 0.2, from: { x: 0.5, y: 0.5 }, delay: 1, w: 0.5 }] }),
    beat({ dur: 4.5, bg: ['#2a1c3a', '#0e0818'], scene: Scenes.lab, rays: true, caption: 'А в пробірці заворушилось...',
      actors: [{ char: 'nikita', x: 0.5, y: 0.55, r: 0.13, enter: 'pop', delay: 0.2, chomp: 0.8 }, { char: 'egor', x: 0.2, y: 0.72, r: 0.13, enter: 'fade', delay: 0.3, panic: 0.6 }],
      sfx: [{ text: 'ХРУМ!', x: 0.66, y: 0.4, at: 1.2, color: '#7CFFB2', rot: 0.1 }],
      bubbles: [{ text: 'Воно зжерло пробірку!', who: 'egor', x: 0.26, y: 0.26, from: { x: 0.2, y: 0.6 }, delay: 1.4, w: 0.36 }] }),
    beat({ dur: 4.5, bg: ['#3a0d1a', '#0a0306'], fx: ['shake'], rays: true, flashAt: 0.3, caption: 'НІКІТА ВИРВАВСЯ НА ВОЛЮ!',
      actors: [{ char: 'nikita', x: 0.5, y: 0.55, r: 0.26, enter: 'pop', chomp: 1 }],
      sfx: [{ text: 'БУ-БУМ!', x: 0.5, y: 0.28, at: 0.2, size: 0.14, color: '#ffd84d', rot: -0.1 }] }),
    beat({ dur: 5, bg: ['#1a2740', '#070b14'], scene: Scenes.lab, caption: 'Усі науковці присягнули його зупинити. Усі 15.',
      actors: [{ char: 'molgelevich', x: 0.5, y: 0.64, r: 0.18, enter: 'drop', delay: 0.2 }, { char: 'egor', x: 0.16, y: 0.74, r: 0.12, enter: 'left', delay: 0.5 }, { char: 'danya', x: 0.32, y: 0.78, r: 0.12, enter: 'left', delay: 0.6 }, { char: 'pilipyuk', x: 0.68, y: 0.78, r: 0.12, enter: 'right', delay: 0.6, flip: true }, { char: 'dima', x: 0.84, y: 0.74, r: 0.12, enter: 'right', delay: 0.5, flip: true }],
      bubbles: [{ text: 'Зупинити його! За БУДЬ-ЯКУ ціну!', who: 'molgelevich', x: 0.5, y: 0.2, from: { x: 0.5, y: 0.48 }, delay: 1.2, shout: true, w: 0.42 }] }),
  ],

  t12: [beat({ bg: ['#4a0d18', '#1a0307'], scene: Scenes.blood, caption: ate('Супербактерія'),
    actors: [{ char: 'nikita', x: 0.6, y: 0.55, r: 0.2, enter: 'left', chomp: 0.7 }, { char: 'virusboss', x: 0.22, y: 0.6, r: 0.13, enter: 'fade', delay: 0.4, panic: 0.5 }],
    sfx: [{ text: 'ГЛИТЬ!', x: 0.5, y: 0.3, at: 0.5, color: '#b388ff' }],
    bubbles: [{ text: 'Бактерії не спинили? Тоді ми, віруси!', who: 'molgelevich', x: 0.26, y: 0.24, from: { x: 0.22, y: 0.55 }, delay: 1, w: 0.4 }] })],
  t23: [beat({ bg: ['#2a1040', '#0a0418'], scene: Scenes.blood, caption: ate('Вірус-Альфа') + ' Попереду — течія чашки Петрі.',
    actors: [{ char: 'nikita', x: 0.5, y: 0.55, r: 0.22, enter: 'pop', chomp: 0.8 }, { char: 'spore', x: 0.8, y: 0.5, r: 0.12, enter: 'right', delay: 0.4 }] })],
  t34: [beat({ bg: ['#0d3a3a', '#03161a'], scene: Scenes.dark, caption: 'Спору проковтнуто. Нікіта провалюється під підлогу — у темряву.',
    actors: [{ char: 'nikita', x: 0.5, y: 0.55, r: 0.2, enter: 'drop', chomp: 0.5 }, { char: 'rat', x: 0.78, y: 0.62, r: 0.12, enter: 'fade', delay: 0.6 }],
    sfx: [{ text: '...піщ?', x: 0.78, y: 0.4, at: 1.2, color: '#aaffcc', size: 0.05 }] })],
  t45: [beat({ bg: ['#14161f', '#050608'], scene: Scenes.dark, caption: ate('Пацюк') + ' Час вибиратися назовні.',
    actors: [{ char: 'nikita', x: 0.45, y: 0.55, r: 0.2, enter: 'left', chomp: 0.7 }, { char: 'guard', x: 0.76, y: 0.66, r: 0.14, enter: 'right', delay: 0.4, panic: 0.4 }],
    bubbles: [{ text: 'Стій! Сюди не можна!', who: 'guard', x: 0.76, y: 0.26, from: { x: 0.76, y: 0.54 }, delay: 0.9, w: 0.32 }] })],
  t56: [beat({ bg: ['#16324a', '#06121e'], scene: Scenes.lab, rays: true, caption: 'Охоронця зжер, стіну прогриз — Нікіта НАЗОВНІ! І вже з кота завбільшки.',
    actors: [{ char: 'nikita', x: 0.62, y: 0.55, r: 0.22, enter: 'pop', chomp: 0.9 }, { char: 'egor', x: 0.22, y: 0.7, r: 0.15, enter: 'left', delay: 0.4, panic: 0.6 }],
    bubbles: [{ text: 'Він... виріс?! Асистенти, КОЛБИ!', who: 'egor', x: 0.26, y: 0.24, from: { x: 0.22, y: 0.58 }, delay: 1, w: 0.4 }] })],
  t67: [beat({ bg: ['#3a2f1a', '#140f08'], scene: Scenes.lab, caption: ate('Єгор'),
    actors: [{ char: 'nikita', x: 0.6, y: 0.55, r: 0.2, enter: 'left', chomp: 0.7 }, { char: 'danya', x: 0.24, y: 0.7, r: 0.15, enter: 'fade', delay: 0.4, panic: 0.7 }],
    bubbles: [{ text: 'Підлогу залив реактивом — слизько! Послизнися, гадe!', who: 'danya', x: 0.27, y: 0.24, from: { x: 0.24, y: 0.58 }, delay: 1, w: 0.42 }] })],
  t78: [beat({ bg: ['#4a6a8a', '#23415c'], scene: Scenes.street, rays: true, caption: ate('Даня') + ' Нікіта виповзає на вулицю.',
    actors: [{ char: 'pilipyuk', x: 0.28, y: 0.72, r: 0.16, enter: 'left', delay: 0.2 }, { char: 'nikita', x: 0.74, y: 0.58, r: 0.2, enter: 'right', delay: 0.4, chomp: 0.6 }],
    bubbles: [{ text: 'Я викличу всі авто міста! Розчави його!', who: 'pilipyuk', x: 0.3, y: 0.24, from: { x: 0.28, y: 0.6 }, delay: 0.9, w: 0.4 }] })],
  t89: [beat({ bg: ['#3a4452', '#1a2028'], scene: Scenes.street, caption: ate('Пилипюк') + ' Насувається густий туман.',
    actors: [{ char: 'nikita', x: 0.5, y: 0.55, r: 0.22, enter: 'pop', chomp: 0.7 }, { char: 'dima', x: 0.8, y: 0.66, r: 0.14, enter: 'fade', delay: 0.5, panic: 0.5 }] })],
  t910: [beat({ bg: ['#7db0e0', '#3a6aa0'], scene: Scenes.sky, caption: ate('Діма') + ' Останні в місті — Кирило і няня Наташа.',
    actors: [{ char: 'natasha', x: 0.32, y: 0.72, r: 0.15, enter: 'left', delay: 0.2 }, { char: 'kirill', x: 0.48, y: 0.74, r: 0.14, enter: 'rise', delay: 0.5 }, { char: 'nikita', x: 0.8, y: 0.5, r: 0.2, enter: 'right', delay: 0.6, chomp: 0.7 }],
    bubbles: [{ text: 'Кириле, я підніму щит! Тримайся!', who: 'natasha', x: 0.26, y: 0.22, from: { x: 0.32, y: 0.6 }, delay: 0.9, w: 0.36 }, { text: 'Наташ, а він мене зʼїсть гарно?', who: 'kirill', x: 0.58, y: 0.28, from: { x: 0.48, y: 0.62 }, delay: 2.3, w: 0.38 }] })],
  t1011: [beat({ bg: ['#1a0b33', '#05010f'], scene: Scenes.city, rays: true, caption: 'Щит Наташі впав. Кирила зжерто. Лишився геній — Молгелевич.',
    actors: [{ char: 'molgelevich', x: 0.5, y: 0.6, r: 0.22, enter: 'drop', delay: 0.2 }],
    bubbles: [{ text: 'Дилетанти. Я зігну сам ПРОСТІР проти нього.', who: 'molgelevich', x: 0.5, y: 0.22, from: { x: 0.5, y: 0.45 }, delay: 1, w: 0.5, shout: true }] })],
  t1112: [beat({ bg: ['#243b6e', '#0c1428'], scene: Scenes.city, fx: ['shake'], caption: ate('Молгелевич') + ' Тепер Нікіта більший за будинки.',
    actors: [{ char: 'nikita', x: 0.5, y: 0.52, r: 0.3, enter: 'pop', chomp: 0.9 }],
    sfx: [{ text: 'ХРЯСЬ!', x: 0.74, y: 0.7, at: 0.5, color: '#ffd84d', size: 0.1 }] })],
  t1213: [beat({ bg: ['#3a3a22', '#14140a'], scene: Scenes.battle, rays: true, caption: 'Квартал зрівняно. Назустріч виходить АРМІЯ.',
    actors: [{ char: 'general', x: 0.3, y: 0.7, r: 0.16, enter: 'left', delay: 0.2 }, { char: 'nikita', x: 0.74, y: 0.5, r: 0.26, enter: 'right', delay: 0.4, chomp: 0.8 }],
    bubbles: [{ text: 'Усі танки — ВОГОНЬ! Не дамо йому пройти!', who: 'general', x: 0.3, y: 0.24, from: { x: 0.3, y: 0.58 }, delay: 0.9, w: 0.42 }] })],
  t1314: [beat({ bg: ['#0d2a1a', '#02100a'], scene: Scenes.alien, rays: true, caption: 'Армію зметено. Та з неба спускаються ПРИБУЛЬЦІ.',
    actors: [{ char: 'nikita', x: 0.5, y: 0.55, r: 0.26, enter: 'pop', chomp: 0.8 }, { char: 'mothership', x: 0.5, y: 0.2, r: 0.16, enter: 'drop', delay: 0.5 }],
    sfx: [{ text: 'ВЖЖЖ...', x: 0.5, y: 0.34, at: 1, color: '#7CFFB2', size: 0.07 }] })],
  t1415: [
    beat({ dur: 5, bg: ['#26060d', '#070103'], scene: Scenes.arena, rays: true, caption: 'Матку прибульців проковтнуто. Лишився ОДИН. Той, хто все спланував.',
      actors: [{ char: 'david', x: 0.5, y: 0.58, r: 0.24, enter: 'fade', delay: 0.4 }],
      sfx: [{ text: '...', x: 0.5, y: 0.25, at: 1.5, color: '#ff4d6d', size: 0.07 }],
      bubbles: [{ text: 'Молгелевич був лише розминкою. Я — ДАВІД. І я готувався.', who: 'david', x: 0.5, y: 0.22, from: { x: 0.5, y: 0.42 }, delay: 1, w: 0.52, shout: true }] }),
    beat({ dur: 4.5, bg: ['#2a0810', '#08010a'], scene: Scenes.arena, fx: ['shake'], shakeAt: 0.5, caption: 'Щит. І робот-охоронець. Це буде НЕ просто.',
      actors: [{ char: 'david', x: 0.3, y: 0.6, r: 0.2, enter: 'left' }, { char: 'robot', x: 0.55, y: 0.62, r: 0.16, enter: 'drop', delay: 0.4 }, { char: 'nikita', x: 0.82, y: 0.5, r: 0.24, enter: 'right', delay: 0.6, chomp: 1 }],
      sfx: [{ text: 'ФІНАЛ!', x: 0.5, y: 0.3, at: 0.6, size: 0.12, color: '#ffd84d', rot: -0.08 }] }),
  ],

  ending: [
    beat({ dur: 5, bg: ['#26060d', '#070103'], scene: Scenes.arena, rays: true, flashAt: 0.2, caption: 'Давіда зжерто. Зупиняти Нікіту більше нікому.',
      actors: [{ char: 'nikita', x: 0.5, y: 0.55, r: 0.3, enter: 'pop', chomp: 0.9, hue: 295 }],
      sfx: [{ text: 'ХРУМ!', x: 0.72, y: 0.34, at: 0.6, color: '#7CFFB2', size: 0.11 }] }),
    beat({ dur: 6, bg: ['#0b0620', '#020008'], scene: Scenes.arena, caption: 'Зʼївши генія, Нікіта став РОЗУМНІШИМ і ШВИДШИМ...',
      actors: [{ char: 'nikita', x: 0.5, y: 0.52, r: 0.28, enter: 'fade', chomp: 0.3 }],
      bubbles: [{ text: 'Тепер я все розумію. І хто... НАСТУПНИЙ?', who: 'nikita', x: 0.5, y: 0.2, from: { x: 0.5, y: 0.45 }, delay: 1.4, w: 0.42, shout: true }],
      sfx: [{ text: 'КІНЕЦЬ?', x: 0.78, y: 0.8, at: 3, color: '#ffd84d', size: 0.06, rot: 0.1, life: 3 }] }),
  ],

  // запасний перехід, якщо ключ відсутній
  generic(i) {
    return [beat({ caption: 'Рівень ' + (i + 1) + ' пройдено. Нікіта стає ще більшим...', bg: ['#2a1245', '#0a0414'],
      actors: [{ char: 'nikita', x: 0.5, y: 0.55, r: 0.24, enter: 'pop', chomp: 0.8 }] })];
  },
};
