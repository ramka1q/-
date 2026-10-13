'use strict';
// ============================================================
//  КОМИКСЫ: движок анимированных страниц + весь сюжет
// ============================================================
const CFONT = 'Neucha, "Comic Sans MS", Rubik, sans-serif';

// раскладки панелей (доли страницы)
const LAY = {
  one: [[0, 0, 1, 1]],
  two: [[0, 0, 0.5, 1], [0.5, 0, 0.5, 1]],
  topWide: [[0, 0, 1, 0.5], [0, 0.5, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5]],
  botWide: [[0, 0, 0.5, 0.5], [0.5, 0, 0.5, 0.5], [0, 0.5, 1, 0.5]],
  four: [[0, 0, 0.5, 0.5], [0.5, 0, 0.5, 0.5], [0, 0.5, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5]],
  three: [[0, 0, 0.34, 1], [0.34, 0, 0.33, 1], [0.67, 0, 0.33, 1]],
  bigLeft: [[0, 0, 0.6, 1], [0.6, 0, 0.4, 0.5], [0.6, 0.5, 0.4, 0.5]],
};
const page = (lay, panels) => ({ panels: panels.map((p, i) => Object.assign({ rect: LAY[lay][i] }, p)) });
const A = (who, x, y, o = {}) => Object.assign({ who, x, y }, o);
const NK = (x, y, s, o = {}) => Object.assign({ who: 'blob', x, y, s }, o);
const B = (text, bx, by, ax, ay, o = {}) => Object.assign({ text, bx, by, ax, ay }, o);
const CAP = (text, o = {}) => Object.assign({ text, type: 'caption' }, o);
const TITLE = (title, sub, tip, bg = 'sunburst', col) => ({ bg, bgCol: col, title, sub, tip });

const COMICS = {
  intro: [
    page('topWide', [
      { bg: 'building', enter: 'fade', bubbles: [CAP('Секретный НИИ «Мозгоправ». Здесь работают лучшие (и самые странные) учёные страны.', { bx: 0.03, by: 0.05, w: 0.5 })] },
      { bg: 'lab', enter: 'left', actors: [A('egor', 0.2, 0.95, { s: 0.85, expr: 'determined', pose: 'point' }), A('danya', 0.5, 0.95, { s: 0.8, expr: 'happy', anim: 'bob' }), A('pylypyuk', 0.8, 0.95, { s: 0.8, expr: 'smug', flip: true })],
        bubbles: [CAP('Егор — глава лаборатории. Даня — инженер. Пилипюк — химик (и его усы).', { bx: 0.03, by: 0.04, w: 0.94 }), B('Коллеги, за работу!', 0.3, 0.33, 0.22, 0.42, { a: 0 })] },
      { bg: 'lab', enter: 'right', actors: [A('dima', 0.2, 0.95, { s: 0.85, expr: 'determined' }), A('kirill', 0.52, 0.95, { s: 0.78, expr: 'crazy', pose: 'armsUp', anim: 'jump' }), A('natasha', 0.8, 0.95, { s: 0.8, expr: 'tired', flip: true })],
        bubbles: [CAP('Дима — охрана. Кирилл — гений в своём мире. Наташа — его няня. Святой человек.', { bx: 0.03, by: 0.04, w: 0.94 }), B('Я пилот вертолёта!', 0.45, 0.3, 0.52, 0.42, { a: 1 }), B('Кирюша, это шапка с пропеллером. Не вертолёт.', 0.74, 0.55, 0.8, 0.45, { a: 2, w: 0.42 })] },
    ]),
    page('botWide', [
      { bg: 'lair', enter: 'zoom', actors: [A('molgelevich', 0.35, 0.95, { s: 0.9, expr: 'evil', pose: 'hold', accName: 'flask' })], props: [{ glow: '#69db7c', x: 0.42, y: 0.5, s: 0.15 }],
        bubbles: [B('Сыворотка «Бесконечный Аппетит»… Наконец-то! Ха-ха-ха!', 0.68, 0.25, 0.42, 0.25, { a: 0, w: 0.55 })] },
      { bg: 'lab', enter: 'right', actors: [A('kirill', 0.35, 0.95, { s: 0.9, expr: 'crazy', pose: 'hold' })], props: [{ spr: 'flask', v: 1, x: 0.62, y: 0.55, s: 0.17 }, { text: 'КОМПОТ', x: 0.62, y: 0.62, size: 0.06, col: '#fff', bg: '#e03131', rot: -0.15 }],
        bubbles: [B('Хи-хи! Теперь это компотик!', 0.35, 0.18, 0.35, 0.3, { a: 0 }), B('Кирюша, отойди от холодильника!', 0.72, 0.85, 1.0, 0.95, { type: 'shout', w: 0.42 })] },
      { bg: 'fridge', enter: 'bottom', actors: [A('nikita', 0.35, 0.95, { s: 0.9, expr: 'happy', pose: 'grab' })], props: [{ spr: 'flask', v: 1, x: 0.72, y: 0.55, s: 0.07 }],
        bubbles: [CAP('Тем же вечером. Стажёр Никита снова задержался на работе.', { bx: 0.02, by: 0.05, w: 0.45 }), B('Я сейчас умру от голода… О! КОМПОТ!', 0.3, 0.3, 0.37, 0.4, { a: 0, w: 0.35 })] },
    ]),
    page('topWide', [
      { bg: 'evil', enter: 'zoom', fx: ['flash', 'sparkle'], actors: [A('nikita', 0.5, 0.95, { s: 0.85, expr: 'happy', pose: 'hold', accName: 'flask', anim: 'shake' })], bubbles: [B('Глык-глык-глык…', 0.75, 0.3, 0.55, 0.35, { a: 0 })] },
      { bg: 'speed', enter: 'left', actors: [A('nikita', 0.5, 0.95, { s: 0.85, expr: 'shock', pose: 'scared', anim: 'shrink' })], bubbles: [B('Ой… Я что, УМЕНЬШАЮСЬ?!', 0.5, 0.2, 0.5, 0.5, { type: 'shout', a: 0, w: 0.7 })] },
      { bg: 'microscope', enter: 'right', actors: [NK(0.5, 0.55, 0.13, { anim: 'bob', chomp: true })], bubbles: [B('ЕДА! КРУГОМ ЕДА!', 0.5, 0.15, 0.5, 0.45, { type: 'shout', w: 0.6 }), CAP('Глава 1. Чашка Петри', { bx: 0.03, by: 0.85, w: 0.6 })] },
    ]),
  ],
  table: [
    page('two', [
      { bg: 'lab', enter: 'left', actors: [A('egor', 0.4, 0.95, { s: 0.85, expr: 'shock', pose: 'scared' })], props: [{ spr: 'microscope', x: 0.78, y: 0.7, s: 0.2 }], bubbles: [B('Вся культура бактерий… СЪЕДЕНА?!', 0.45, 0.17, 0.4, 0.3, { type: 'shout', a: 0, w: 0.75 })] },
      { bg: 'microscope', enter: 'right', actors: [NK(0.5, 0.55, 0.2, { anim: 'bob', chomp: true })], bubbles: [B('Привет, Егор! А добавка есть?', 0.5, 0.14, 0.5, 0.4, { w: 0.7 })] },
    ]),
    page('botWide', [
      { bg: 'lab', enter: 'left', actors: [A('pylypyuk', 0.4, 0.95, { s: 0.9, expr: 'smug', pose: 'think' })], bubbles: [B('Не волнуйтесь, коллега. Мой стол — неприступная крепость!', 0.55, 0.2, 0.42, 0.3, { a: 0, w: 0.8 })] },
      { bg: 'lab', enter: 'right', actors: [A('egor', 0.3, 0.95, { s: 0.85, expr: 'tired' }), A('pylypyuk', 0.75, 0.95, { s: 0.85, expr: 'shock', flip: true, anim: 'shake' })], bubbles: [B('Он уже ползёт к вам.', 0.3, 0.2, 0.3, 0.3, { a: 0, w: 0.5 }), B('Что, УЖЕ?!', 0.75, 0.35, 0.75, 0.32, { type: 'shout', a: 1, w: 0.4 })] },
      TITLE('Стол Пилипюка', 'Глава 1-2', 'Наступай в лужи краски: барьер пропускает Никиту только своего цвета!', 'sunburst', '#ff8787'),
    ]),
  ],
  corridors: [
    page('topWide', [
      { bg: 'lab', enter: 'zoom', actors: [A('pylypyuk', 0.3, 0.95, { s: 0.85, expr: 'sad' }), NK(0.75, 0.6, 0.28, { anim: 'bob', chomp: true })], props: [{ spr: 'sandwich', x: 0.6, y: 0.85, s: 0.06, anim: 'float' }], bubbles: [B('Он съел мой микроскоп… и мой бутерброд…', 0.3, 0.15, 0.3, 0.28, { a: 0, w: 0.45 })] },
      { bg: 'corridor', enter: 'left', actors: [A('kirill', 0.3, 0.95, { s: 0.85, expr: 'crazy', pose: 'armsUp', anim: 'jump' }), A('natasha', 0.72, 0.95, { s: 0.85, expr: 'tired', flip: true })], bubbles: [B('Никита — пёсик! Можно я его поглажу?', 0.3, 0.13, 0.3, 0.25, { a: 0, w: 0.55 }), B('Нельзя, Кирюша. Он ест всё подряд.', 0.7, 0.4, 0.72, 0.3, { a: 1, w: 0.5 })] },
      { bg: 'corridor', enter: 'right', actors: [A('egor', 0.3, 0.95, { s: 0.85, expr: 'determined', pose: 'point' }), A('kirill', 0.78, 0.95, { s: 0.75, expr: 'smug', flip: true })], props: [{ spr: 'keycard', v: 'red', x: 0.9, y: 0.55, s: 0.05, anim: 'float' }, { spr: 'keycard', v: 'blue', x: 0.66, y: 0.5, s: 0.05, anim: 'float' }],
        bubbles: [B('Запереть все двери! Ключ-карты — спрятать!', 0.3, 0.13, 0.3, 0.25, { a: 0, w: 0.55 }), B('Я спрятал! В разных комнатах. Хи-хи.', 0.72, 0.4, 0.78, 0.33, { a: 1, type: 'whisper', w: 0.48 })] },
    ]),
    page('one', [TITLE('Коридоры НИИ', 'Глава 1-3', 'Ищи ключ-карты. Кирилл жмёт на кнопки — следи за лазерами. Не трогай Наташу, если съел Кирилла!', 'sunburst', '#74c0fc')]),
  ],
  workshop: [
    page('topWide', [
      { bg: 'corridor', enter: 'left', actors: [A('natasha', 0.3, 0.95, { s: 0.85, expr: 'angry', pose: 'point' }), A('kirill', 0.72, 0.95, { s: 0.8, expr: 'happy', flip: true, anim: 'bob' })], bubbles: [B('Кирюша! Ты рассказал ему код от заначки?!', 0.3, 0.15, 0.3, 0.27, { a: 0, w: 0.5, type: 'shout' }), B('Он сам угадал! Почти.', 0.75, 0.35, 0.72, 0.3, { a: 1, w: 0.35 })] },
      { bg: 'workshop', enter: 'bottom', actors: [A('danya', 0.28, 0.95, { s: 0.85, expr: 'smug', pose: 'point' })], props: [{ item: 'vacuum', x: 0.72, y: 0.62, s: 0.26 }], bubbles: [B('Встречайте: ПЫЛЕСОС-9000! Втягивает всё. Даже Никиту.', 0.4, 0.14, 0.28, 0.27, { a: 0, w: 0.75 })] },
      { bg: 'workshop', enter: 'right', actors: [NK(0.5, 0.6, 0.25, { anim: 'bob', chomp: true })], bubbles: [B('Пылесос? Звучит вкусно.', 0.5, 0.15, 0.5, 0.35, { w: 0.6 })] },
    ]),
    page('one', [TITLE('Мастерская Дани', 'Глава 1-4', 'Толкай ящики на кнопки в полу. Пылесос глохнет, когда врезается в колонны — тогда бей РЫВКОМ!', 'sunburst', '#ffa94d')]),
  ],
  city: [
    page('four', [
      { bg: 'workshop', enter: 'zoom', fx: ['boom', 'shake'], props: [{ spr: 'gear', x: 0.3, y: 0.4, s: 0.08, anim: 'fly', dx: -1, dy: -0.6 }, { spr: 'bolt', x: 0.6, y: 0.5, s: 0.06, anim: 'fly', dx: 1, dy: -0.4 }, { spr: 'vacpart', x: 0.5, y: 0.5, s: 0.1, anim: 'fly', dx: 0.3, dy: -1 }, { spr: 'spring', x: 0.4, y: 0.6, s: 0.06, anim: 'fly', dx: -0.8, dy: 0.5 }],
        actors: [A('danya', 0.8, 0.95, { s: 0.6, expr: 'sad', flip: true })], bubbles: [B('Мой малыш…', 0.75, 0.25, 0.8, 0.45, { a: 0, w: 0.35 })] },
      { bg: 'citynight', enter: 'right', fx: ['shake'], actors: [NK(0.5, 0.62, 0.28, { anim: 'jump', chomp: true })], props: [{ spr: 'rock', x: 0.2, y: 0.4, s: 0.05, anim: 'fly', dx: -1, dy: -1 }, { spr: 'rock', x: 0.8, y: 0.3, s: 0.04, anim: 'fly', dx: 1, dy: -1 }], bubbles: [B('СВОБОДА!', 0.5, 0.15, 0.5, 0.35, { type: 'shout', w: 0.5 })] },
      { bg: 'citynight', enter: 'left', props: [{ item: 'jeep', x: 0.5, y: 0.62, s: 0.3 }], bubbles: [B('Спокойно. Я его поймаю. Я ловил даже голубей.', 0.5, 0.15, 0.5, 0.42, { w: 0.8 })] },
      { bg: 'lair', enter: 'fade', actors: [A('molgelevich', 0.5, 0.95, { s: 0.85, expr: 'evil', pose: 'think' })], bubbles: [B('Пусть растёт… пусть растёт…', 0.5, 0.13, 0.5, 0.25, { type: 'whisper', a: 0, w: 0.7 })] },
    ]),
    page('one', [TITLE('Город', 'Глава 2', 'Машины опасны, пока ты меньше их. Дима стреляет сетками — уворачивайся! Река сносит течением.', 'sunburst', '#69db7c')]),
  ],
  sewer: [
    page('topWide', [
      { bg: 'city', enter: 'left', actors: [A('dima', 0.35, 0.95, { s: 0.85, expr: 'sad', pose: 'shrug' })], bubbles: [B('Он съел мой джип. И автобус. И мэрию. Мэр очень расстроен.', 0.62, 0.2, 0.4, 0.28, { a: 0, w: 0.5 })] },
      { bg: 'citynight', enter: 'bottom', actors: [NK(0.5, 0.7, 0.2, { anim: 'bob', chomp: true })], props: [{ disk: '#343a40', x: 0.5, y: 0.82, s: 0.22 }], bubbles: [B('Тут пахнет… интересно.', 0.5, 0.15, 0.5, 0.5, { w: 0.6 })] },
      { bg: 'sewer', enter: 'right', actors: [A('danya', 0.3, 0.95, { s: 0.85, expr: 'determined', pose: 'point' })], props: [{ item: 'drone', x: 0.72, y: 0.35, s: 0.08, anim: 'float' }, { item: 'drone', x: 0.85, y: 0.6, s: 0.07, anim: 'float' }], bubbles: [B('Мои дроны-прожекторы найдут его в темноте!', 0.35, 0.14, 0.3, 0.27, { a: 0, w: 0.6 })] },
    ]),
    page('one', [TITLE('Канализация', 'Глава 2-2', 'Темно! Держись подальше от лучей дронов, пока ты меньше их. Крути вентили, чтобы остановить течение.', 'sunburst', '#94d82d')]),
  ],
  base: [
    page('topWide', [
      { bg: 'sewer', enter: 'left', actors: [A('egor', 0.4, 0.95, { s: 0.85, expr: 'tired' })], props: [{ item: 'drone', x: 0.75, y: 0.8, s: 0.08, rot: 2 }], bubbles: [B('Дроны съедены. Отступаем на военную базу. Дима подготовил… аргумент.', 0.62, 0.18, 0.42, 0.28, { a: 0, w: 0.55 })] },
      { bg: 'base', enter: 'bottom', props: [{ item: 'tank', x: 0.5, y: 0.6, s: 0.32 }], bubbles: [B('Знакомьтесь — Т-ДИМОН! Лучший танк, который можно собрать в гараже из мечты.', 0.5, 0.13, 0.5, 0.45, { w: 0.85 })] },
      { bg: 'base', enter: 'right', actors: [A('kirill', 0.3, 0.95, { s: 0.8, expr: 'crazy', pose: 'armsUp', anim: 'jump' }), A('natasha', 0.72, 0.95, { s: 0.85, expr: 'angry', flip: true })], bubbles: [B('А можно мне порулить?', 0.3, 0.15, 0.3, 0.27, { a: 0, w: 0.45 }), B('НЕТ.', 0.72, 0.3, 0.72, 0.3, { a: 1, type: 'shout', w: 0.25 })] },
    ]),
    page('one', [TITLE('Военная база', 'Глава 2-3', 'Обходи лучи прожекторов и мины. Т-Димон неуязвим — но без топлива никуда! Съешь 4 бака.', 'sunburst', '#c2a878')]),
  ],
  ocean: [
    page('topWide', [
      { bg: 'base', enter: 'zoom', fx: ['smoke'], actors: [A('dima', 0.5, 0.95, { s: 0.85, expr: 'sad' })], bubbles: [B('Т-Димон… он был слишком хорош для этого мира.', 0.5, 0.15, 0.5, 0.25, { a: 0, w: 0.5 })] },
      { bg: 'beach', enter: 'left', actors: [NK(0.5, 0.62, 0.3, { anim: 'bob', chomp: true })], bubbles: [B('Хочу рыбки.', 0.5, 0.13, 0.5, 0.3, { w: 0.4 })] },
      { bg: 'ocean', enter: 'right', props: [{ item: 'sub', x: 0.5, y: 0.6, s: 0.3 }], bubbles: [B('Океан — моя стихия. Торпеды с антиаппетитином готовы!', 0.5, 0.15, 0.5, 0.45, { w: 0.85 })] },
    ]),
    page('one', [TITLE('Океан', 'Глава 3 · Весь мир', 'Течения сносят, водовороты переносят. Медузы жалятся, акулы кусаются — пока ты меньше.', 'sunburst', '#4dabf7')]),
  ],
  volcano: [
    page('topWide', [
      { bg: 'beach', enter: 'left', actors: [A('egor', 0.5, 0.95, { s: 0.85, expr: 'tired', anim: 'shake' })], bubbles: [B('Я… в порядке. Всё в порядке. Меня просто выплюнули на пляж.', 0.5, 0.15, 0.5, 0.25, { a: 0, w: 0.6 })] },
      { bg: 'volcano', enter: 'bottom', actors: [A('pylypyuk', 0.35, 0.95, { s: 0.85, expr: 'smug', pose: 'point' })], props: [{ item: 'turret', x: 0.75, y: 0.75, s: 0.12 }], bubbles: [B('На вулкане мой криогенератор заморозит его навечно!', 0.45, 0.13, 0.35, 0.27, { a: 0, w: 0.7 })] },
      { bg: 'lair', enter: 'right', actors: [A('molgelevich', 0.3, 0.95, { s: 0.85, expr: 'evil', pose: 'think' }), A('pylypyuk', 0.78, 0.95, { s: 0.55, expr: 'normal', flip: true })], bubbles: [B('Пилипюк, заманите его к вулкану. Мне нужны данные.', 0.35, 0.13, 0.3, 0.25, { a: 0, w: 0.55, type: 'whisper' }), B('Так точно, профессор…', 0.75, 0.5, 0.78, 0.55, { a: 1, w: 0.38 })] },
    ]),
    page('one', [TITLE('Остров-вулкан', 'Глава 3-2', 'Лава обжигает. Ищи броды у берега или жми синие крио-кнопки, чтобы заморозить реку.', 'sunburst', '#ff922b')]),
  ],
  earth: [
    page('topWide', [
      { bg: 'earth', enter: 'zoom', actors: [NK(0.5, 0.45, 0.32, { anim: 'bob', chomp: true })], bubbles: [B('Я съел вулкан. Я съел… остров. Что там дальше?', 0.5, 0.1, 0.5, 0.2, { w: 0.6 })] },
      { bg: 'launch', enter: 'left', actors: [A('kirill', 0.25, 0.95, { s: 0.8, expr: 'crazy', pose: 'armsUp', anim: 'jump' }), A('natasha', 0.55, 0.95, { s: 0.8, expr: 'tired' })], bubbles: [B('Я запущу ракеты! С бантиками!', 0.25, 0.13, 0.25, 0.27, { a: 0, w: 0.45 }), B('Это… правда хорошая идея?', 0.6, 0.35, 0.55, 0.3, { a: 1, w: 0.42 }), B('Это наша ЕДИНСТВЕННАЯ идея.', 0.7, 0.8, 1.0, 0.95, { w: 0.5, type: 'radio' })] },
      { bg: 'evil', enter: 'right', fx: ['shake'], actors: [A('molgelevich', 0.5, 0.95, { s: 0.9, expr: 'crazy', pose: 'armsUp' })], bubbles: [B('Когда он съест Землю, его энергия аппетита станет МОЕЙ! МУА-ХА-ХА!', 0.5, 0.15, 0.5, 0.25, { a: 0, w: 0.85, type: 'shout' })] },
    ]),
    page('one', [TITLE('Планета Земля', 'Глава 3-3', 'Ешь города, леса и горы. Ракеты Кирилла самонаводятся! Наташа иногда устраивает ему тихий час.', 'sunburst', '#38d9a9')]),
  ],
  space: [
    page('topWide', [
      { bg: 'orbit', enter: 'zoom', actors: [NK(0.35, 0.5, 0.3, { anim: 'float', chomp: true })], props: [{ spr: 'moon', v: 0, x: 0.72, y: 0.4, s: 0.06, anim: 'float' }], bubbles: [B('Я немного перекусил.', 0.35, 0.1, 0.35, 0.2, { w: 0.45 })] },
      { bg: 'space', enter: 'left', actors: [A('danya', 0.3, 0.95, { s: 0.85, expr: 'shock' }), A('egor', 0.72, 0.95, { s: 0.85, expr: 'tired', pose: 'facepalm', flip: true })], bubbles: [B('Мы на орбите. Земля… внутри Никиты. Буквально.', 0.35, 0.13, 0.3, 0.27, { a: 0, w: 0.55 })] },
      { bg: 'space', enter: 'right', actors: [A('kirill', 0.3, 0.95, { s: 0.8, expr: 'normal' }), A('natasha', 0.72, 0.95, { s: 0.85, expr: 'shock', flip: true })], bubbles: [B('Наташа, а профессор сказал, что всё идёт по плану…', 0.3, 0.13, 0.3, 0.27, { a: 0, w: 0.55, type: 'whisper' }), B('ЧТО?..', 0.72, 0.4, 0.72, 0.3, { a: 1, type: 'shout', w: 0.25 })] },
    ]),
    page('one', [TITLE('Солнечная система', 'Глава 4 · Космос', 'Планеты притягивают. Лазерные спутники Дани стреляют. Солнце обжигает — пока ты не станешь больше его!', 'sun', '#ffd43b')]),
  ],
  final: [
    page('topWide', [
      { bg: 'lair', enter: 'zoom', actors: [A('molgelevich', 0.25, 0.95, { s: 0.9, expr: 'evil', pose: 'point' })], bubbles: [B('Браво, Никита! Сыворотку создал Я! Этикетку «КОМПОТ»… ну, это Кирилл. Но всё остальное — Я!', 0.62, 0.2, 0.3, 0.27, { a: 0, w: 0.65 })] },
      { bg: 'space', enter: 'left', actors: [A('egor', 0.2, 0.95, { s: 0.75, expr: 'shock' }), A('danya', 0.45, 0.95, { s: 0.7, expr: 'shock' }), A('pylypyuk', 0.65, 0.95, { s: 0.7, expr: 'shock' }), A('dima', 0.86, 0.95, { s: 0.75, expr: 'shock', flip: true })], bubbles: [B('Профессор?! Вы всё это подстроили?!', 0.4, 0.13, 0.2, 0.3, { a: 0, type: 'shout', w: 0.65 })] },
      { bg: 'evil', enter: 'right', fx: ['shake'], actors: [A('molgelevich', 0.5, 0.95, { s: 0.9, expr: 'crazy', pose: 'armsUp' })], bubbles: [B('Моя Мозг-Станция выкачает из него аппетит — и я съем ВСЮ ВСЕЛЕННУЮ!', 0.5, 0.15, 0.5, 0.25, { a: 0, type: 'shout', w: 0.85 })] },
    ]),
    page('botWide', [
      { bg: 'space', enter: 'left', actors: [A('kirill', 0.35, 0.95, { s: 0.85, expr: 'determined', pose: 'point' })], bubbles: [B('Никита хороший. А вы — нет.', 0.6, 0.2, 0.38, 0.27, { a: 0, w: 0.55 })] },
      { bg: 'space', enter: 'right', actors: [A('natasha', 0.4, 0.95, { s: 0.85, expr: 'happy', pose: 'wave' })], bubbles: [B('Кирюша прав. Впервые в жизни… и это прекрасно. Никита, лови пирожки!', 0.55, 0.18, 0.4, 0.27, { a: 0, w: 0.7 })] },
      { bg: 'sunburst', bgCol: '#ffd43b', enter: 'zoom', fx: ['sparkle'], actors: [A('egor', 0.12, 0.95, { s: 0.85, expr: 'determined', pose: 'armsUp' }), A('danya', 0.27, 0.95, { s: 0.8, expr: 'happy', pose: 'armsUp' }), A('pylypyuk', 0.42, 0.95, { s: 0.8, expr: 'happy', pose: 'armsUp' }), A('dima', 0.58, 0.95, { s: 0.85, expr: 'determined', pose: 'armsUp' }), A('kirill', 0.73, 0.95, { s: 0.75, expr: 'happy', pose: 'jump', anim: 'jump' }), A('natasha', 0.88, 0.95, { s: 0.8, expr: 'happy', pose: 'armsUp' })],
        bubbles: [B('Команда! Помогаем Никите!', 0.5, 0.14, 0.12, 0.25, { a: 0, type: 'shout', w: 0.5 })] },
    ]),
    page('one', [TITLE('Мозг-Станция', 'ФИНАЛ', 'Фаза 1: съешь 4 генератора щита. Фаза 2: бей РЫВКОМ в перегретый купол. Фаза 3: заставь Мех врезаться в край арены!', 'evil')]),
  ],
  ending: [
    page('two', [
      { bg: 'space', enter: 'zoom', fx: ['boom', 'flash', 'shake'], bubbles: [CAP('Мозг-Станция взорвалась фейерверком из пирожков.', { bx: 0.04, by: 0.06, w: 0.8 })], props: [{ spr: 'pw_pie', x: 0.3, y: 0.4, s: 0.07, anim: 'fly', dx: -1, dy: -0.5 }, { spr: 'pw_pie', x: 0.6, y: 0.5, s: 0.08, anim: 'fly', dx: 1, dy: -0.8 }, { spr: 'scrap', x: 0.5, y: 0.6, s: 0.06, anim: 'fly', dx: 0.2, dy: 1 }] },
      { bg: 'space', enter: 'right', actors: [A('molgelevich', 0.5, 0.7, { s: 0.55, expr: 'sad', pose: 'shrug', anim: 'float' })], props: [{ spr: 'ufo', x: 0.5, y: 0.72, s: 0.22, anim: 'float' }], bubbles: [B('Я ещё вернусь! …А можно мне хотя бы печеньку?', 0.5, 0.15, 0.5, 0.35, { a: 0, w: 0.75 })] },
    ]),
    page('topWide', [
      { bg: 'space', enter: 'zoom', fx: ['sparkle'], actors: [NK(0.35, 0.55, 0.3, { anim: 'bob', chomp: true })], props: [{ glow: '#69db7c', x: 0.65, y: 0.45, s: 0.08 }, { spr: 'flask', v: 1, x: 0.65, y: 0.45, s: 0.07, anim: 'float' }], bubbles: [CAP('В ядре станции нашёлся антидот!', { bx: 0.6, by: 0.75, w: 0.36 }), B('Ик!', 0.35, 0.12, 0.35, 0.25, { w: 0.2 })] },
      { bg: 'speed', bgCol: '#e7f5ff', enter: 'left', actors: [NK(0.3, 0.55, 0.22, { anim: 'shake', chomp: true })], props: [{ spr: 'earthp', x: 0.5, y: 0.5, s: 0.08, anim: 'fly', dx: 1, dy: -0.3 }, { spr: 'jupiter', x: 0.5, y: 0.6, s: 0.1, anim: 'fly', dx: 1.2, dy: 0.4 }, { spr: 'building', x: 0.5, y: 0.4, s: 0.05, anim: 'fly', dx: 0.8, dy: -0.8 }, { spr: 'microscope', x: 0.5, y: 0.55, s: 0.05, anim: 'fly', dx: 1, dy: 0.9 }], bubbles: [B('БУЭЭЭЭ!', 0.25, 0.15, 0.3, 0.35, { type: 'shout', w: 0.35 })] },
      { bg: 'lab', enter: 'right', actors: [A('nikita', 0.5, 0.95, { s: 0.85, expr: 'happy', pose: 'armsUp', anim: 'jump' })], bubbles: [CAP('Всё вернулось на место. Почти. Плутон решил остаться внутри.', { bx: 0.03, by: 0.04, w: 0.94 }), B('Я… снова я!', 0.5, 0.3, 0.5, 0.35, { a: 0, w: 0.4 })] },
    ]),
    page('topWide', [
      { bg: 'cafeteria', enter: 'zoom', fx: ['confetti'], actors: [A('egor', 0.1, 0.95, { s: 0.8, expr: 'smug' }), A('danya', 0.24, 0.95, { s: 0.75, expr: 'happy' }), A('nikita', 0.4, 0.95, { s: 0.8, expr: 'happy', pose: 'hold', accName: 'pizza' }), A('kirill', 0.56, 0.95, { s: 0.7, expr: 'happy', pose: 'armsUp', anim: 'jump' }), A('natasha', 0.7, 0.95, { s: 0.75, expr: 'happy' }), A('pylypyuk', 0.83, 0.95, { s: 0.75, expr: 'happy', pose: 'hold', accName: 'pizza' }), A('dima', 0.95, 0.95, { s: 0.8, expr: 'happy', flip: true })],
        bubbles: [B('Никита, больше никаких компотов.', 0.18, 0.13, 0.1, 0.25, { a: 0, w: 0.35 }), B('Конечно… А добавка есть?', 0.5, 0.35, 0.4, 0.27, { a: 2, w: 0.35 }), B('Пёсик вернулся!', 0.75, 0.15, 0.56, 0.3, { a: 3, w: 0.3 })] },
      { bg: 'cafeteria', enter: 'left', actors: [A('molgelevich', 0.4, 0.95, { s: 0.85, expr: 'sad', pose: 'hold', accName: 'pie' })], bubbles: [CAP('Профессор Молгелевич теперь работает поваром в школьной столовой. Порции — маленькие.', { bx: 0.04, by: 0.05, w: 0.92 })] },
      { bg: 'sunburst', bgCol: '#ff8fab', enter: 'zoom', fx: ['sparkle', 'confetti'], title: 'КОНЕЦ', sub: 'Спасибо за игру!', tip: 'Попробуй собрать все золотые медали ⭐', actors: [NK(0.85, 0.75, 0.15, { anim: 'jump', chomp: true })] },
    ]),
  ],
};

// ============================================================
//  Движок комиксов
// ============================================================
const Comic = {
  pages: null, pi: 0, t: 0, onDone: null, trans: 0, prevPage: null, lastChars: 0,
  start(id, onDone) {
    this.pages = COMICS[id] || [];
    this.pi = 0; this.t = 0; this.onDone = onDone; this.trans = 0; this.prevPage = null;
    if (!this.pages.length) { onDone && onDone(); return; }
    this.schedule(this.pages[0]);
  },
  schedule(pg) {
    let t = 0.25;
    for (const p of pg.panels) {
      p._at = t;
      let bt = t + 0.5;
      for (const b of (p.bubbles || [])) { b._at = bt + (b.d || 0); b._dur = b.text.length / 42; bt = b._at + b._dur + 0.4; }
      if (p.title) { bt = t + 1.4; }
      p._done = Math.max(bt, t + 0.9);
      t = p._done + 0.1;
    }
    pg._end = t;
  },
  click() {
    if (!this.pages) return;
    const pg = this.pages[this.pi];
    if (this.trans > 0) return;
    if (this.t < pg._end - 0.05) {
      const next = pg.panels.find(p => p._at > this.t + 0.01);
      const cur = pg.panels.filter(p => p._at <= this.t).pop();
      if (cur && this.t < cur._done - 0.05) this.t = cur._done;
      else this.t = next ? next._at : pg._end;
      Sound.play('click');
      return;
    }
    this.nextPage();
  },
  nextPage() {
    Sound.play('page');
    if (this.pi + 1 >= this.pages.length) { const cb = this.onDone; this.pages = null; cb && cb(); return; }
    this.prevPage = { pg: this.pages[this.pi], t: this.t };
    this.pi++; this.t = 0; this.trans = 1;
    this.schedule(this.pages[this.pi]);
  },
  skip() { Sound.play('page'); const cb = this.onDone; this.pages = null; cb && cb(); },
  update(dt) {
    if (!this.pages) return;
    if (this.trans > 0) { this.trans = Math.max(0, this.trans - dt * 1.8); if (this.trans > 0.5) return; }
    this.t += dt;
  },

  pageRect(sw, sh) {
    const m = Math.min(sw, sh) * 0.04;
    let w = sw - m * 2, h = sh - m * 2 - 30;
    const asp = 16 / 10;
    if (w / h > asp) w = h * asp; else h = w / asp;
    return { x: (sw - w) / 2, y: (sh - h) / 2 - 10, w, h };
  },
  draw(ctx, sw, sh, gt) {
    // фон «стол с бумагой»
    const g = ctx.createLinearGradient(0, 0, sw, sh); g.addColorStop(0, '#2b1d4a'); g.addColorStop(1, '#14102b'); ctx.fillStyle = g; ctx.fillRect(0, 0, sw, sh);
    BG.skyStars(ctx, 0, 0, sw, sh, gt);
    if (!this.pages) return;
    const R = this.pageRect(sw, sh);
    const tr = this.trans;
    if (this.prevPage && tr > 0) {
      const k = U.ease.inCubic(1 - tr);
      ctx.save(); ctx.translate(R.x + R.w / 2, R.y + R.h / 2); ctx.rotate(-k * 0.5); ctx.scale(1 - k * 0.4, 1 - k * 0.4); ctx.translate(-k * sw * 0.8, k * sh * 0.2); ctx.globalAlpha = 1 - k;
      this.drawPage(ctx, this.prevPage.pg, { x: -R.w / 2, y: -R.h / 2, w: R.w, h: R.h }, this.prevPage.t, gt);
      ctx.restore();
    }
    if (tr < 0.6) {
      const k = U.ease.outBack(U.clamp(1 - tr / 0.6, 0, 1));
      ctx.save(); ctx.translate(R.x + R.w / 2, R.y + R.h / 2); ctx.rotate((1 - k) * 0.25); ctx.scale(0.7 + k * 0.3, 0.7 + k * 0.3); ctx.translate((1 - k) * sw * 0.5, 0); ctx.globalAlpha = U.clamp(k * 1.5, 0, 1);
      this.drawPage(ctx, this.pages[this.pi], { x: -R.w / 2, y: -R.h / 2, w: R.w, h: R.h }, this.t, gt);
      ctx.restore();
    }
    // подсказки
    const pg = this.pages[this.pi];
    const fs = U.clamp(sh * 0.022, 12, 18);
    ctx.save();
    if (this.t >= pg._end && tr === 0) {
      const a = 0.6 + 0.4 * Math.sin(gt * 5);
      ctx.globalAlpha = a;
      HUD.text(ctx, (this.pi + 1 >= this.pages.length ? 'Играть ▶' : 'Дальше ▶') + '  (клик / пробел)', R.x + R.w, R.y + R.h + fs * 1.6, fs * 1.15, '#ffe066', 'right');
    }
    ctx.globalAlpha = 0.8;
    HUD.text(ctx, 'Пропустить ⏭ (Esc)', R.x, R.y + R.h + fs * 1.6, fs, '#b8b5ff', 'left', OL, 700);
    HUD.text(ctx, (this.pi + 1) + ' / ' + this.pages.length, R.x + R.w / 2, R.y + R.h + fs * 1.6, fs, '#b8b5ff', 'center', OL, 700);
    ctx.restore();
    this.skipRect = { x: R.x, y: R.y + R.h + fs * 0.3, w: 200, h: fs * 2 };
    // звук печати
    let chars = 0;
    for (const p of pg.panels) for (const b of (p.bubbles || [])) chars += U.clamp(Math.floor((this.t - b._at) * 42), 0, b.text.length);
    if (chars > this.lastChars && Math.random() < 0.5) Sound.play('type');
    this.lastChars = chars;
  },

  drawPage(ctx, pg, R, t, gt) {
    // бумага
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
    ctx.fillStyle = '#fdf6e3'; ctx.fillRect(R.x - 12, R.y - 12, R.w + 24, R.h + 24);
    ctx.restore();
    const gut = Math.min(R.w, R.h) * 0.018;
    pg.panels.forEach(p => {
      if (t < p._at) return;
      const k = U.clamp((t - p._at) / 0.5, 0, 1);
      const [px, py, pw, ph] = p.rect;
      const r = { x: R.x + px * R.w + gut / 2, y: R.y + py * R.h + gut / 2, w: pw * R.w - gut, h: ph * R.h - gut };
      this.drawPanel(ctx, p, r, t - p._at, k, gt);
    });
  },

  drawPanel(ctx, p, r, lt, k, gt) {
    ctx.save();
    const e = U.ease.outBack(k);
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
    switch (p.enter || 'zoom') {
      case 'left': ctx.translate(-(1 - e) * r.w * 0.6, 0); break;
      case 'right': ctx.translate((1 - e) * r.w * 0.6, 0); break;
      case 'top': ctx.translate(0, -(1 - e) * r.h * 0.6); break;
      case 'bottom': ctx.translate(0, (1 - e) * r.h * 0.6); break;
      case 'zoom': ctx.translate(cx, cy); ctx.scale(0.3 + 0.7 * e, 0.3 + 0.7 * e); ctx.rotate((1 - e) * 0.2); ctx.translate(-cx, -cy); break;
      case 'fade': break;
    }
    ctx.globalAlpha = U.clamp(k * 2, 0, 1);
    let shake = 0;
    if (p.fx && p.fx.includes('shake')) shake = Math.max(0, 1 - lt * 0.8) * r.h * 0.02 + r.h * 0.003;
    if (shake) ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    // тень и рамка
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 8; ctx.shadowOffsetX = 4; ctx.shadowOffsetY = 4; ctx.fillStyle = '#fff'; ctx.fillRect(r.x, r.y, r.w, r.h); ctx.restore();
    ctx.save();
    ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.clip();
    // лёгкий «кен бёрнс»
    const kb = 1 + Math.min(lt, 12) * 0.004;
    ctx.translate(cx, cy); ctx.scale(kb, kb); ctx.translate(-cx, -cy);
    const bgf = BG.panel[p.bg || 'plain'] || BG.panel.plain;
    bgf(ctx, r.x, r.y, r.w, r.h, gt + lt, p.bgCol);
    if (p.fx && p.fx.includes('boom')) { const s = Math.min(1, lt * 2.5); ctx.save(); ctx.translate(cx, cy); ctx.rotate(lt * 0.5); U.starPath(ctx, 0, 0, 14, r.h * 0.45 * s, r.h * 0.25 * s); fs(ctx, '#ffd43b', OL, 4); U.starPath(ctx, 0, 0, 12, r.h * 0.28 * s, r.h * 0.15 * s); fs(ctx, '#ff6b00', null); ctx.restore(); }
    if (p.fx && p.fx.includes('smoke')) { for (let i = 0; i < 6; i++) { const kk = ((lt * 0.2 + i / 6) % 1); ctx.save(); ctx.globalAlpha = 0.4 * (1 - kk); circ(ctx, r.x + r.w * (0.2 + i * 0.12), r.y + r.h * (0.8 - kk * 0.7), r.h * (0.08 + kk * 0.1), '#495057', null); ctx.restore(); } }
    // реквизит
    for (const pr of (p.props || [])) this.drawProp(ctx, pr, r, lt, gt);
    // персонажи
    (p.actors || []).forEach((a, i) => this.drawActor(ctx, a, i, p, r, lt, gt));
    // заголовок главы
    if (p.title) this.drawTitle(ctx, p, r, lt, gt);
    // эффекты
    if (p.fx) {
      if (p.fx.includes('sparkle')) for (let i = 0; i < 14; i++) { const ph = (gt * 1.5 + i * 0.37) % 1; const x = r.x + r.w * ((i * 0.618) % 1), y = r.y + r.h * ((i * 0.381 + 0.1) % 1); ctx.save(); ctx.globalAlpha = Math.sin(ph * Math.PI); ctx.translate(x, y); ctx.rotate(gt); U.starPath(ctx, 0, 0, 4, r.h * 0.03, r.h * 0.008); fs(ctx, '#fff', null); ctx.restore(); }
      if (p.fx.includes('confetti')) for (let i = 0; i < 30; i++) { const y = r.y + ((gt * 0.15 * r.h + i * 47) % r.h); const x = r.x + r.w * ((i * 0.618) % 1) + Math.sin(gt * 2 + i) * 10; ctx.save(); ctx.translate(x, y); ctx.rotate(gt * 3 + i); ctx.fillStyle = PAL.bright[i % 7]; ctx.fillRect(-4, -2, 8, 4); ctx.restore(); }
      if (p.fx.includes('flash')) { const a = Math.max(0, 1 - lt * 1.5); if (a > 0) { ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fillRect(r.x, r.y, r.w, r.h); } }
    }
    ctx.restore();
    // пузыри поверх (без клипа — могут выходить за край)
    for (const b of (p.bubbles || [])) this.drawBubble(ctx, b, p, r, lt + p._at, gt);
    ctx.lineWidth = Math.max(3, r.h * 0.012); ctx.strokeStyle = OL; ctx.strokeRect(r.x, r.y, r.w, r.h);
    ctx.restore();
  },

  animOffset(o, r, lt, gt, idx) {
    const d = { x: 0, y: 0, s: 1, rot: 0 };
    const at = lt - (o.d || 0);
    switch (o.anim) {
      case 'bob': d.y = Math.sin(gt * 3 + idx) * r.h * 0.012; break;
      case 'jump': d.y = -Math.abs(Math.sin(gt * 5 + idx)) * r.h * 0.05; break;
      case 'shake': d.x = (Math.random() - 0.5) * r.h * 0.012; d.y = (Math.random() - 0.5) * r.h * 0.006; break;
      case 'float': d.y = Math.sin(gt * 1.5 + idx) * r.h * 0.02; d.rot = Math.sin(gt + idx) * 0.08; break;
      case 'grow': d.s = U.ease.outElastic(U.clamp(at / 1, 0, 1)); break;
      case 'shrink': d.s = 1 - 0.75 * U.ease.inOutCubic(U.clamp(at / 2.2, 0, 1)); break;
      case 'spin': d.rot = gt * 3; break;
      case 'fly': { const k = U.clamp(at / 2.5, 0, 1); d.x = (o.dx || 1) * r.w * 0.45 * U.ease.outCubic(k); d.y = (o.dy || 0) * r.h * 0.45 * U.ease.outCubic(k); d.rot = at * 4; break; }
      case 'slideL': d.x = -(1 - U.ease.outBack(U.clamp(at / 0.6, 0, 1))) * r.w * 0.7; break;
      case 'slideR': d.x = (1 - U.ease.outBack(U.clamp(at / 0.6, 0, 1))) * r.w * 0.7; break;
    }
    return d;
  },
  drawActor(ctx, a, i, p, r, lt, gt) {
    const d = this.animOffset(a, r, lt, gt, i);
    const x = r.x + a.x * r.w + d.x, y = r.y + a.y * r.h + d.y;
    let talking = false;
    for (const b of (p.bubbles || [])) if (b.a === i && lt + p._at >= b._at && lt + p._at < b._at + b._dur) talking = true;
    if (a.who === 'blob') {
      const rr = a.s * r.h * d.s;
      ctx.save(); ctx.translate(x, y); ctx.rotate(d.rot);
      Chars.nikita(ctx, 0, 0, rr, { t: gt, chomp: a.chomp ? Math.abs(Math.sin(gt * 4)) : 0, dir: 0, speed: 0 });
      ctx.restore();
      return;
    }
    const sc = r.h * 0.72 * (a.s || 1) / 100 * d.s;
    ctx.save(); ctx.translate(x, y); ctx.rotate(d.rot);
    Chars.draw(ctx, a.who, { x: 0, y: 0, scale: sc, t: gt + i * 1.3, pose: a.pose || 'stand', expr: a.expr || 'normal', flip: a.flip, talking, accName: a.accName, blush: a.blush });
    ctx.restore();
  },
  drawProp(ctx, pr, r, lt, gt) {
    const d = this.animOffset(pr, r, lt, gt, 3);
    const x = r.x + pr.x * r.w + d.x, y = r.y + pr.y * r.h + d.y, s = pr.s * r.h * d.s;
    ctx.save();
    if (pr.glow) { const g = ctx.createRadialGradient(x, y, 0, x, y, s * 2.5); g.addColorStop(0, U.rgba(pr.glow, 0.8)); g.addColorStop(1, U.rgba(pr.glow, 0)); ctx.fillStyle = g; ctx.fillRect(x - s * 3, y - s * 3, s * 6, s * 6); }
    if (pr.disk) { ell(ctx, x, y, s, s * 0.35, 0, pr.disk, OL, 3); }
    if (pr.spr) Sprites.draw(ctx, pr.spr, pr.v || 0, x, y, s, (pr.rot || 0) + d.rot, 1);
    if (pr.item) {
      const fake = { x, y, r: s, rot: pr.rot || 0, heading: pr.rot !== undefined ? pr.rot : -Math.PI / 2, data: { st: 'roam', brush: gt * 10, tur: -Math.PI / 2 + Math.sin(gt) * 0.3, aim: Math.sin(gt) }, cone: { a: Math.PI / 2 + Math.sin(gt) * 0.5, w: 0.4, len: s * 4 }, uid: 1 };
      const fakeL = { canEat: () => false, flags: {} };
      if (pr.item === 'vacuum') Draws.vacuum(ctx, fake, gt, 1, fakeL);
      if (pr.item === 'tank') { fake.heading = 0; Draws.tank(ctx, fake, gt, 1, fakeL); }
      if (pr.item === 'jeep') Draws.jeep(ctx, Object.assign(fake, { rot: 0 }), gt, 1);
      if (pr.item === 'sub') Draws.sub(ctx, Object.assign(fake, { rot: Math.sin(gt) * 0.1 }), gt, 1);
      if (pr.item === 'drone') Draws.drone(ctx, fake, gt, 1, fakeL);
      if (pr.item === 'turret') Draws.turret(ctx, Object.assign(fake, { col: '#1864ab', col2: '#74c0fc', eye: '#e7f5ff' }), gt, 1);
    }
    if (pr.text) {
      const fsz = pr.size * r.h;
      ctx.translate(x, y); ctx.rotate(pr.rot || 0);
      ctx.font = `900 ${fsz}px ${FONT}`;
      if (pr.bg) { const w = ctx.measureText(pr.text).width + fsz * 0.6; rect(ctx, -w / 2, -fsz * 0.7, w, fsz * 1.3, fsz * 0.2, pr.bg, OL, 2); }
      HUD.text(ctx, pr.text, 0, 0, fsz, pr.col || '#fff', 'center', null, 900, 'middle');
    }
    ctx.restore();
  },
  drawTitle(ctx, p, r, lt, gt) {
    const k = U.ease.outElastic(U.clamp(lt / 1.2, 0, 1));
    const cx = r.x + r.w / 2, cy = r.y + r.h * 0.42;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k); ctx.rotate(Math.sin(gt * 2) * 0.02);
    const big = Math.min(r.h * 0.17, r.w * 0.09);
    if (p.sub) HUD.text(ctx, p.sub, 0, -big * 0.95, big * 0.42, '#fff', 'center', OL, 900);
    HUD.text(ctx, p.title, 0, big * 0.35, big, '#fff', 'center', OL, 900);
    ctx.restore();
    if (p.tip) {
      const a = U.clamp((lt - 0.8) * 2, 0, 1);
      ctx.save(); ctx.globalAlpha = a;
      const fsz = Math.max(13, r.h * 0.05);
      ctx.font = `700 ${fsz}px ${CFONT}`;
      const lines = U.wrapText(ctx, '💡 ' + p.tip, r.w * 0.75);
      const bh = lines.length * fsz * 1.3 + fsz;
      rect(ctx, cx - r.w * 0.4, r.y + r.h * 0.66, r.w * 0.8, bh, fsz * 0.6, 'rgba(255,255,255,0.92)', OL, 3);
      ctx.fillStyle = OL; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      lines.forEach((l, i) => ctx.fillText(l, cx, r.y + r.h * 0.66 + fsz * 0.5 + i * fsz * 1.3));
      ctx.restore();
    }
  },
  drawBubble(ctx, b, p, r, t, gt) {
    if (t < b._at) return;
    const lt = t - b._at;
    const n = U.clamp(Math.floor(lt * 42), 0, b.text.length);
    const pop = U.ease.outBack(U.clamp(lt / 0.25, 0, 1));
    const fsz = U.clamp(r.h * (b.type === 'caption' ? 0.058 : 0.068), 12, 28);
    const font = b.type === 'caption' ? `700 ${fsz}px ${FONT}` : `${b.type === 'shout' ? 900 : 700} ${fsz * (b.type === 'shout' ? 1.1 : 1)}px ${CFONT}`;
    ctx.save();
    ctx.font = font;
    const maxW = (b.w || 0.45) * r.w;
    const lines = U.wrapText(ctx, b.text, maxW - fsz * 1.2);
    const tw = Math.min(maxW, Math.max(...lines.map(l => ctx.measureText(l).width)) + fsz * 1.4);
    const th = lines.length * fsz * 1.22 + fsz * 0.9;
    let bx, by;
    if (b.type === 'caption') { bx = r.x + (b.bx || 0.03) * r.w; by = r.y + (b.by || 0.04) * r.h; }
    else { bx = r.x + b.bx * r.w - tw / 2; by = r.y + b.by * r.h - th / 2; }
    bx = U.clamp(bx, r.x - r.w * 0.02, r.x + r.w - tw + r.w * 0.02);
    const ax = r.x + (b.ax !== undefined ? b.ax : b.bx) * r.w, ay = r.y + (b.ay !== undefined ? b.ay : b.by + 0.15) * r.h;
    const ccx = bx + tw / 2, ccy = by + th / 2;
    ctx.translate(ccx, ccy); ctx.scale(pop, pop); ctx.translate(-ccx, -ccy);
    const lw = Math.max(2, fsz * 0.12);
    if (b.type === 'caption') {
      rect(ctx, bx, by, tw, th, 4, '#fff3a3', OL, lw);
    } else if (b.type === 'shout') {
      ctx.beginPath();
      const N = 22;
      for (let i = 0; i <= N; i++) { const a = i / N * TAU; const rr = i % 2 ? 1.0 : 1.22; const px = ccx + Math.cos(a) * tw * 0.6 * rr, py = ccy + Math.sin(a) * th * 0.68 * rr; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.closePath(); fs(ctx, '#fff', OL, lw);
      this.tail(ctx, ccx, ccy, ax, ay, tw, th, lw, '#fff');
    } else if (b.type === 'thought') {
      blob(ctx, ccx, ccy, Math.max(tw, th) * 0.6, 12, 0.08, 1, '#fff', OL, lw);
    } else {
      if (b.type === 'radio') { rect(ctx, bx, by, tw, th, fsz * 0.3, '#e7f5ff', OL, lw); }
      else rect(ctx, bx, by, tw, th, fsz * 0.8, '#fff', OL, lw);
      if (b.type === 'whisper') { ctx.save(); ctx.setLineDash([lw * 2, lw * 2]); ctx.strokeStyle = '#868e96'; ctx.lineWidth = lw * 0.6; U.roundRect(ctx, bx + lw * 2, by + lw * 2, tw - lw * 4, th - lw * 4, fsz * 0.6); ctx.stroke(); ctx.restore(); }
      if (b.type !== 'radio') this.tail(ctx, ccx, ccy, ax, ay, tw, th, lw, '#fff');
      else HUD.text(ctx, '📻', bx + tw - fsz * 0.2, by + fsz * 0.2, fsz * 0.8, '#000', 'right', null, 400);
    }
    ctx.fillStyle = OL; ctx.textAlign = b.type === 'caption' ? 'left' : 'center'; ctx.textBaseline = 'top';
    ctx.font = font;
    let left = n;
    lines.forEach((l, i) => {
      const part = l.slice(0, Math.max(0, left)); left -= l.length + 1;
      const x = b.type === 'caption' ? bx + fsz * 0.6 : ccx;
      ctx.fillText(part, x, by + fsz * 0.45 + i * fsz * 1.22);
    });
    ctx.restore();
  },
  tail(ctx, cx, cy, ax, ay, tw, th, lw, col) {
    const dx = ax - cx, dy = ay - cy;
    const d = Math.hypot(dx, dy);
    if (d < Math.min(tw, th) * 0.55) return;
    const a = Math.atan2(dy, dx);
    // точка выхода из пузыря
    const ex = cx + Math.cos(a) * tw * 0.35, ey = cy + Math.sin(a) * th * 0.35;
    const w = Math.min(tw, th) * 0.18;
    const px = -Math.sin(a) * w, py = Math.cos(a) * w;
    const tx = ax - Math.cos(a) * th * 0.1, ty = ay - Math.sin(a) * th * 0.1;
    ctx.beginPath(); ctx.moveTo(ex + px, ey + py); ctx.quadraticCurveTo((ex + tx) / 2 + px * 0.3, (ey + ty) / 2 + py * 0.3, tx, ty); ctx.lineTo(ex - px, ey - py); ctx.closePath();
    fs(ctx, col, OL, lw);
    // закрываем шов
    ctx.beginPath(); ctx.moveTo(ex + px * 0.85, ey + py * 0.85); ctx.lineTo(ex - px * 0.85, ey - py * 0.85); ctx.lineWidth = lw * 1.6; ctx.strokeStyle = col; ctx.stroke();
  },
};
