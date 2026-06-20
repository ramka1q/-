/* =========================================================================
 *  levels.js  —  15 рівнів, у кожного СВОЯ механіка.
 *  Розміри підібрані РЕАЛІСТИЧНО в межах рівня: люди — як люди, танки —
 *  як танки. Масштаб теми росте від мікробів до прибульців, але кожен
 *  рівень самодостатній (Нікіта починає з потрібного для цього рівня розміру).
 *
 *  Поля рівня:
 *   mechanic   — ключ механіки (game.js реалізує поведінку)
 *   world      — розмір світу (квадрат)
 *   startR/bossR — розмір Нікіти на старті / розмір боса (ціль)
 *   spawns     — пасивна "їжа" (об'єкти)
 *   enemies    — вороги (переслідують/стріляють/шкодять)
 *   boss       — ключ персонажа (human у Art.CHARS або creature у Art.CREATURES)
 *   bossCfg    — { shield, summon, shoot, sidekick }
 *   env        — { flow, gravity, dark, fog, slippery, traffic }
 *   scale      — підпис масштабу для HUD (атмосфера)
 * ========================================================================= */

const LEVELS = [
  /* ---------- ФАЗА A: МІКРОСВІТ ---------- */
  {
    id: 1, name: 'РІВЕНЬ 1 — КРОВОТІК', subtitle: 'Нікіта прокинувся серед бактерій',
    mechanic: 'split', scale: '5 мкм', hue: 285,
    sky: ['#4a0d18', '#1a0307'], floor: '#3a0a12', grid: 'rgba(255,120,120,0.06)',
    world: 3600, startR: 7, bossR: 26,
    spawns: [
      { type: 'microbe', count: 130, rMin: 4, rMax: 11 },
      { type: 'cell', count: 70, rMin: 8, rMax: 16 },
      { type: 'atom', count: 40, rMin: 5, rMax: 9 },
    ],
    enemies: [],
    boss: 'superbug', bossCfg: {},
    env: {},
    tips: 'Їж бактерії. Якщо їх не їсти — вони РОЗМНОЖУЮТЬСЯ! ПКМ/Shift — ривок.',
  },
  {
    id: 2, name: 'РІВЕНЬ 2 — ВІРУСНА ЗОНА', subtitle: 'Заражені віруси полюють на тебе',
    mechanic: 'hunt', scale: '20 мкм', hue: 285,
    sky: ['#2a1040', '#0a0418'], floor: '#1c0a30', grid: 'rgba(180,120,255,0.06)',
    world: 4000, startR: 9, bossR: 30,
    spawns: [
      { type: 'microbe', count: 80, rMin: 5, rMax: 12 },
      { type: 'cell', count: 50, rMin: 10, rMax: 18 },
    ],
    enemies: [{ kind: 'virus', count: 14, rMin: 10, rMax: 18, chase: true, contact: 0.07 }],
    boss: 'virusboss', bossCfg: { shoot: { rate: 1.6, shrink: 0.08 } },
    env: {},
    tips: 'Віруси женуться й кусають (зменшують). Ухиляйся ривком, рости й проковтни їх.',
  },
  {
    id: 3, name: 'РІВЕНЬ 3 — ЧАШКА ПЕТРІ', subtitle: 'Течія тягне все по колу',
    mechanic: 'current', scale: '0.1 мм', hue: 285,
    sky: ['#0d3a3a', '#03161a'], floor: '#0a2e30', grid: 'rgba(120,255,230,0.06)',
    world: 4200, startR: 11, bossR: 34,
    spawns: [
      { type: 'spore', count: 80, rMin: 8, rMax: 18 },
      { type: 'microbe', count: 60, rMin: 6, rMax: 12 },
      { type: 'cell', count: 40, rMin: 12, rMax: 22 },
    ],
    enemies: [{ kind: 'virus', count: 8, rMin: 12, rMax: 20, chase: true, contact: 0.06 }],
    boss: 'spore', bossCfg: {},
    env: { flow: 'swirl' },
    tips: 'Течія зносить тебе й їжу. Враховуй потік, щоб догнати спору-боса.',
  },

  /* ---------- ФАЗА B: УСЕРЕДИНІ БУДІВЛІ ---------- */
  {
    id: 4, name: 'РІВЕНЬ 4 — ТЕМНА ПІДЛОГА', subtitle: 'Ти комаха під підлогою лабораторії',
    mechanic: 'dark', scale: '2 мм', hue: 285,
    sky: ['#14161f', '#050608'], floor: '#161a24', grid: 'rgba(255,255,255,0.03)',
    world: 4200, startR: 9, bossR: 40,
    spawns: [
      { type: 'crumb', count: 90, rMin: 5, rMax: 14 },
      { type: 'screw', count: 50, rMin: 8, rMax: 16 },
      { type: 'pill', count: 40, rMin: 12, rMax: 22 },
    ],
    enemies: [{ kind: 'rat', count: 6, rMin: 22, rMax: 30, chase: true, contact: 0.08, edibleBonus: true }],
    boss: 'rat', bossCfg: {},
    env: { dark: 320 },
    tips: 'Видно лише навколо тебе. У темряві нишпорять пацюки — бережись.',
  },
  {
    id: 5, name: 'РІВЕНЬ 5 — ВТЕЧА З БУДІВЛІ', subtitle: 'Прогризи собі вихід назовні',
    mechanic: 'breakout', scale: '1 см', hue: 285,
    sky: ['#2a2230', '#0e0a14'], floor: '#3a2f26', grid: 'rgba(255,220,180,0.05)',
    world: 4400, startR: 12, bossR: 46,
    spawns: [
      { type: 'book', count: 50, rMin: 14, rMax: 26 },
      { type: 'mug', count: 44, rMin: 12, rMax: 22 },
      { type: 'crumb', count: 50, rMin: 6, rMax: 12 },
      { type: 'wall', count: 28, rMin: 30, rMax: 48 },
    ],
    enemies: [{ kind: 'guard_drone', count: 5, rMin: 16, rMax: 22, chase: true, shoot: { rate: 2.2, shrink: 0.05 } }],
    boss: 'guard', bossCfg: { shoot: { rate: 1.8, shrink: 0.06 } },
    env: {},
    tips: 'Спершу замалий для стін — рости на дрібному, тоді прогризай стіни й охоронця.',
  },

  /* ---------- ФАЗА C: ВЧЕНІ (людський масштаб) ---------- */
  {
    id: 6, name: 'РІВЕНЬ 6 — ЛАБОРАТОРІЯ', subtitle: 'Єгор та асистенти кидають колби',
    mechanic: 'throwers', scale: 'людина ~1.8 м', hue: 285,
    sky: ['#16324a', '#06121e'], floor: '#15324a', grid: 'rgba(90,180,220,0.06)',
    world: 4600, startR: 16, bossR: 58,
    spawns: [
      { type: 'beaker', count: 46, rMin: 16, rMax: 28 },
      { type: 'mug', count: 40, rMin: 14, rMax: 24 },
      { type: 'chair', count: 30, rMin: 34, rMax: 50 },
      { type: 'laptop', count: 26, rMin: 26, rMax: 40 },
    ],
    enemies: [{ kind: 'assistant', count: 6, rMin: 40, rMax: 48, flee: true, shoot: { rate: 1.9, shrink: 0.05 }, edibleBonus: true }],
    boss: 'egor', bossCfg: { shoot: { rate: 1.5, shrink: 0.06 } },
    env: {},
    tips: 'Тепер ти розміром із кота й ростеш до людини. Асистенти жбурляють колби!',
  },
  {
    id: 7, name: 'РІВЕНЬ 7 — КАБІНЕТ', subtitle: 'Розлита хімія — підлога слизька',
    mechanic: 'slippery', scale: 'кімната', hue: 285,
    sky: ['#3a2f1a', '#140f08'], floor: '#5a4a2e', grid: 'rgba(255,230,160,0.05)',
    world: 4800, startR: 18, bossR: 60,
    spawns: [
      { type: 'book', count: 50, rMin: 16, rMax: 28 },
      { type: 'mug', count: 40, rMin: 14, rMax: 24 },
      { type: 'plant', count: 28, rMin: 26, rMax: 44 },
      { type: 'chair', count: 26, rMin: 40, rMax: 58 },
    ],
    enemies: [{ kind: 'assistant', count: 5, rMin: 42, rMax: 50, flee: true, shoot: { rate: 1.8, shrink: 0.05 }, edibleBonus: true }],
    boss: 'danya', bossCfg: { shoot: { rate: 1.4, shrink: 0.05 } },
    env: { slippery: 0.55 },
    tips: 'Слизько! Нікіту заносить. Гальмуй заздалегідь і лови Даню.',
  },
  {
    id: 8, name: 'РІВЕНЬ 8 — ВУЛИЦЯ', subtitle: 'Машини мчать і збивають',
    mechanic: 'traffic', scale: 'вулиця', hue: 285,
    sky: ['#4a6a8a', '#23415c'], floor: '#48535e', grid: 'rgba(255,255,255,0.05)',
    world: 5200, startR: 22, bossR: 72,
    spawns: [
      { type: 'hydrant', count: 28, rMin: 18, rMax: 28 },
      { type: 'bench', count: 26, rMin: 24, rMax: 36 },
      { type: 'tree', count: 34, rMin: 34, rMax: 54 },
      { type: 'person', count: 26, rMin: 30, rMax: 42 },
    ],
    enemies: [{ kind: 'car', count: 16, rMin: 40, rMax: 60, moving: true, contact: 0.07, edibleBonus: true }],
    boss: 'pilipyuk', bossCfg: { shoot: { rate: 1.4, shrink: 0.05 } },
    env: { traffic: true },
    tips: 'Авто їздять самі й збивають. Лякай пішоходів, рости — і їж машини цілком.',
  },
  {
    id: 9, name: 'РІВЕНЬ 9 — РАЙОН У ТУМАНІ', subtitle: 'Видимість майже нульова',
    mechanic: 'fog', scale: 'квартал', hue: 285,
    sky: ['#3a4452', '#1a2028'], floor: '#3e4a44', grid: 'rgba(255,255,255,0.04)',
    world: 5400, startR: 26, bossR: 84,
    spawns: [
      { type: 'car', count: 30, rMin: 24, rMax: 38 },
      { type: 'tree', count: 30, rMin: 26, rMax: 44 },
      { type: 'house', count: 24, rMin: 50, rMax: 74 },
      { type: 'person', count: 20, rMin: 24, rMax: 34 },
    ],
    enemies: [{ kind: 'guard_drone', count: 7, rMin: 22, rMax: 30, chase: true, shoot: { rate: 2.0, shrink: 0.05 } }],
    boss: 'dima', bossCfg: { shoot: { rate: 1.5, shrink: 0.06 } },
    env: { fog: true },
    tips: 'Туман ховає все. Орієнтуйся на стрілку до боса вгорі екрана.',
  },
  {
    id: 10, name: 'РІВЕНЬ 10 — МІСТО', subtitle: 'Наташа прикриває Кирила щитом',
    mechanic: 'guarded', scale: 'місто', hue: 285,
    sky: ['#7db0e0', '#3a6aa0'], floor: '#5b9a55', grid: 'rgba(255,255,255,0.06)',
    world: 5600, startR: 30, bossR: 92,
    spawns: [
      { type: 'house', count: 30, rMin: 30, rMax: 48 },
      { type: 'tree', count: 30, rMin: 22, rMax: 36 },
      { type: 'car', count: 26, rMin: 24, rMax: 36 },
      { type: 'building', count: 22, rMin: 60, rMax: 88 },
    ],
    enemies: [{ kind: 'guard_drone', count: 6, rMin: 24, rMax: 32, chase: true, shoot: { rate: 1.9, shrink: 0.05 } }],
    boss: 'kirill', bossCfg: { sidekick: 'natasha', shield: true },
    env: {},
    tips: 'Наташа тримає щит навколо Кирила. Зайди збоку або продавлюй ривком.',
  },
  {
    id: 11, name: 'РІВЕНЬ 11 — ДАХ ІНСТИТУТУ', subtitle: 'Молгелевич гне простір гравітацією',
    mechanic: 'gravity', scale: 'мегаполіс', hue: 290,
    sky: ['#1a0b33', '#05010f'], floor: '#11091f', grid: 'rgba(180,140,255,0.05)',
    world: 5800, startR: 34, bossR: 104,
    spawns: [
      { type: 'building', count: 30, rMin: 40, rMax: 70 },
      { type: 'satellite', count: 22, rMin: 18, rMax: 30 },
      { type: 'car', count: 24, rMin: 18, rMax: 28 },
      { type: 'house', count: 20, rMin: 30, rMax: 46 },
    ],
    enemies: [{ kind: 'drone', count: 8, rMin: 20, rMax: 28, chase: true, shoot: { rate: 1.8, shrink: 0.05 } }],
    boss: 'molgelevich', bossCfg: { shoot: { rate: 1.1, shrink: 0.08 } },
    env: { gravity: 3 },
    tips: 'Гравітаційні колодязі засмоктують. Тримайся подалі й проковтни генія.',
  },

  /* ---------- ФАЗА D: ПОЖИРАННЯ МІСТА ---------- */
  {
    id: 12, name: 'РІВЕНЬ 12 — ЗНИЩ КВАРТАЛ', subtitle: 'Тепер ти більший за будинки',
    mechanic: 'devour', scale: 'район з висоти', hue: 290,
    sky: ['#243b6e', '#0c1428'], floor: '#2a3450', grid: 'rgba(150,180,255,0.05)',
    world: 6200, startR: 40, bossR: 130,
    spawns: [
      { type: 'car', count: 40, rMin: 16, rMax: 26 },
      { type: 'house', count: 36, rMin: 34, rMax: 52 },
      { type: 'building', count: 40, rMin: 56, rMax: 92 },
      { type: 'tower', count: 18, rMin: 80, rMax: 110 },
    ],
    enemies: [{ kind: 'turret', count: 10, rMin: 26, rMax: 34, shoot: { rate: 1.6, shrink: 0.05 } }],
    boss: 'colossus', bossCfg: { shoot: { rate: 1.3, shrink: 0.06 } },
    env: {},
    tips: 'Ковтай цілі будинки. На дахах — зенітні турелі, вони стріляють.',
  },

  /* ---------- ФАЗА E: АРМІЯ І ПРИБУЛЬЦІ ---------- */
  {
    id: 13, name: 'РІВЕНЬ 13 — АРМІЯ', subtitle: 'Танки відкривають вогонь',
    mechanic: 'tanks', scale: 'поле бою', hue: 290,
    sky: ['#3a3a22', '#14140a'], floor: '#4a4a2e', grid: 'rgba(255,255,180,0.04)',
    world: 6400, startR: 44, bossR: 140,
    spawns: [
      { type: 'building', count: 24, rMin: 30, rMax: 52 },
      { type: 'sandbag', count: 30, rMin: 16, rMax: 26 },
      { type: 'house', count: 20, rMin: 28, rMax: 44 },
    ],
    enemies: [
      { kind: 'soldier', count: 14, rMin: 18, rMax: 24, chase: true, shoot: { rate: 2.4, shrink: 0.03 }, edibleBonus: true },
      { kind: 'tank', count: 8, rMin: 44, rMax: 56, chase: true, shoot: { rate: 1.5, shrink: 0.09 }, hp: 3, edibleBonus: true },
    ],
    boss: 'tankboss', bossCfg: { shoot: { rate: 0.9, shrink: 0.1 }, summon: { kind: 'soldier', every: 3.5, max: 6 } },
    env: {},
    tips: 'Танки б\'ють боляче (важкі снаряди). Ривком ухиляйся, дави піхоту, ковтай танки.',
  },
  {
    id: 14, name: 'РІВЕНЬ 14 — ВТОРГНЕННЯ', subtitle: 'Прибульці телепортуються та тягнуть променем',
    mechanic: 'aliens', scale: 'небо', hue: 150,
    sky: ['#0d2a1a', '#02100a'], floor: '#0a1f16', grid: 'rgba(120,255,180,0.05)',
    world: 6800, startR: 48, bossR: 150,
    spawns: [
      { type: 'building', count: 20, rMin: 28, rMax: 48 },
      { type: 'satellite', count: 26, rMin: 18, rMax: 30 },
      { type: 'star', count: 40, rMin: 10, rMax: 18 },
    ],
    enemies: [
      { kind: 'ufo', count: 10, rMin: 30, rMax: 42, chase: true, shoot: { rate: 1.7, shrink: 0.06 }, blink: true, edibleBonus: true },
      { kind: 'alien', count: 8, rMin: 24, rMax: 32, chase: true, contact: 0.06, edibleBonus: true },
    ],
    boss: 'mothership', bossCfg: { shoot: { rate: 1.0, shrink: 0.08 }, summon: { kind: 'ufo', every: 3, max: 5 }, beam: true },
    env: {},
    tips: 'НЛО телепортуються, матка тягне тебе променем і кличе дронів. Не дай себе оточити.',
  },

  /* ---------- ФАЗА F: ФІНАЛ ---------- */
  {
    id: 15, name: 'ФІНАЛ — ДАВІД', subtitle: 'Розумніший за всіх. І він готувався.',
    mechanic: 'david', scale: 'арена', hue: 295,
    sky: ['#26060d', '#070103'], floor: '#1a0408', grid: 'rgba(255,90,120,0.05)',
    world: 5200, startR: 30, bossR: 110,
    spawns: [
      { type: 'satellite', count: 18, rMin: 16, rMax: 26 },
      { type: 'building', count: 16, rMin: 24, rMax: 40 },
      { type: 'star', count: 36, rMin: 10, rMax: 16 },
      { type: 'crumb', count: 40, rMin: 8, rMax: 16 },
    ],
    enemies: [],
    boss: 'david', bossCfg: {
      shield: true, shoot: { rate: 1.0, shrink: 0.09 },
      summon: { kind: 'robot', every: 6, max: 1, guardian: true },
    },
    env: { gravity: 2 },
    tips: 'Давід під щитом і кличе РОБОТА-охоронця. Знищ робота, продави щит ривком — і кусай Давіда.',
  },
];

/* рівні складності (множники застосовує game.js) */
const DIFFICULTIES = {
  easy:   { key: 'easy',   name: 'ЛЕГКО',     grow: 1.35, enemySpeed: 0.8,  shootRate: 0.7, shrink: 0.65, bossSpeed: 0.85, stamina: 1.4, color: '#7CFFB2' },
  normal: { key: 'normal', name: 'НОРМАЛЬНО', grow: 1.0,  enemySpeed: 1.0,  shootRate: 1.0, shrink: 1.0,  bossSpeed: 1.0,  stamina: 1.0, color: '#ffd84d' },
  hard:   { key: 'hard',   name: 'СКЛАДНО',   grow: 0.78, enemySpeed: 1.25, shootRate: 1.4, shrink: 1.4,  bossSpeed: 1.2,  stamina: 0.8, color: '#ff6b8a' },
};
