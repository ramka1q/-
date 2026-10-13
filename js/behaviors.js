'use strict';
// ============================================================
//  Типы предметов, поведения существ, отрисовка зон/триггеров/
//  снарядов, головоломки, фоны уровней
// ============================================================

// ---------- типы предметов (значения по умолчанию) ----------
const TYPES = {
  // микромир
  coccus: { beh: 'drift', spd: 0.25, vN: 4 }, bacillus: { beh: 'wander', spd: 0.7, vN: 4, rotMode: 'dir' },
  spirillum: { beh: 'wander', spd: 1.1, vN: 3, rotMode: 'dir' }, amoeba: { beh: 'wander', spd: 0.35, vN: 3, wob: true },
  virus: { beh: 'wander', spd: 0.5, hz: 0.07, vN: 3, spin: 0.6 }, diatom: { vN: 3 }, pollen: { vN: 3, spin: 0.15 },
  dust: { vN: 3 }, crumb: { vN: 3 }, sugar: { rotMode: 'tilt' }, hair: { vN: 4 },
  tardigrade: { beh: 'chase', spd: 0.85, hz: 0.08, vN: 3, rotMode: 'dir', aggro: 9 },
  phage: { beh: 'chase', spd: 1.2, hz: 0.1, rotMode: 'dir', aggro: 10 },
  paramecium: { beh: 'flee', spd: 1.4, vN: 3, rotMode: 'dir' }, yeast: { vN: 3, beh: 'drift', spd: 0.15 },
  droplet: { rotMode: 'none' }, algae: { vN: 3, beh: 'drift', spd: 0.2 },
  // стол
  paperclip: { vN: 4 }, pill: { vN: 4 }, screw: {}, pencap: { vN: 4 }, pencil: { vN: 4 }, eraser: { vN: 3 },
  testtube: { vN: 4 }, flask: { vN: 5, rotMode: 'tilt' }, beaker: { vN: 4, rotMode: 'tilt' }, petridish: {},
  microscope: { rotMode: 'none' }, notebook: { vN: 4 }, mug: { vN: 4 }, labmouse: { beh: 'flee', spd: 1.7, rotMode: 'dir' },
  cockroach: { beh: 'chase', spd: 1.5, hz: 0.06, rotMode: 'dir', aggro: 8 }, magnifier: {}, ruler: {},
  calculator: { rotMode: 'tilt' }, sandwich: { rotMode: 'tilt' }, donut: { vN: 4 }, stapler: {}, coin: { vN: 3 },
  stickynote: { vN: 4 }, book: { vN: 8 }, lamp: { rotMode: 'none' }, rack: { rotMode: 'none' },
  // коридоры
  wrapper: { vN: 7 }, cup: { rotMode: 'tilt' }, chair: {}, plant: { vN: 3 }, extinguisher: { rotMode: 'tilt' },
  cooler: { rotMode: 'none' }, trashbin: {}, vending: { rotMode: 'none' }, desk: { rotMode: 'none' }, computer: { rotMode: 'none' },
  papers: {}, keycard: { rotMode: 'none' }, cactus: { rotMode: 'none' }, clock: {}, cardbox: { rotMode: 'tilt' }, phone: { vN: 3 },
  printer: { rotMode: 'none' }, sofa: { vN: 3, rotMode: 'none' }, banana: {},
  // мастерская
  bolt: {}, nut: {}, gear: { vN: 4 }, spring: {}, battery: {}, chip: {}, wrench: {}, toolbox: { rotMode: 'tilt' },
  drill: { rotMode: 'tilt' }, minibot: { vN: 4, beh: 'flee', spd: 1.3, rotMode: 'none' }, crate: { rotMode: 'none' },
  barrel: { vN: 4 }, tire: {}, oilcan: { rotMode: 'tilt' }, screwdriver: {}, vacpart: { vN: 3 },
  // город
  leaf: { vN: 4 }, can: { vN: 4 }, pigeon: { beh: 'flee', spd: 1.8, rotMode: 'dir' }, cat: { vN: 4, beh: 'wander', spd: 0.7, rotMode: 'none' },
  dog: { vN: 4, beh: 'chase', spd: 1.4, hz: 0.05, rotMode: 'none', aggro: 7 }, person: { vN: 24, beh: 'flee', spd: 1.1, rotMode: 'none' },
  bike: { rotMode: 'none' }, bench: {}, hydrant: {}, mailbox: { rotMode: 'none' }, streettrash: {},
  car: { vN: 8, rotMode: 'dir' }, bus: { vN: 3, rotMode: 'dir' }, truck: { vN: 6, rotMode: 'dir' }, tree: { vN: 4 },
  kiosk: { rotMode: 'none' }, house: { vN: 5, rotMode: 'none' }, building: { vN: 5, rotMode: 'none' }, fountain: {},
  streetlamp: {}, shawarma: {}, icecart: { rotMode: 'none' }, umbrella: { vN: 7 }, scooter: {}, pizza: {},
  // канализация
  rat: { beh: 'flee', spd: 1.6, rotMode: 'dir' }, slime: { vN: 3, beh: 'wander', spd: 0.3, rotMode: 'none' },
  garbagebag: { rotMode: 'tilt' }, duck: { rotMode: 'tilt', beh: 'drift', spd: 0.2 }, ring: { rotMode: 'tilt' },
  mushroom: { vN: 3, rotMode: 'none', light: 3.5 }, croc: { beh: 'chase', spd: 1.15, hz: 0.12, rotMode: 'dir', aggro: 6 },
  bone: {}, sock: { vN: 7 }, boot: {}, bottle: { vN: 3 }, pipejunk: {},
  // база
  sandbag: {}, ammobox: {}, jeep: { rotMode: 'dir' }, tent: { rotMode: 'none' }, guard: { vN: 5, beh: 'flee', spd: 1.2, rotMode: 'none' },
  heli: { rotMode: 'dir' }, fueltank: { rotMode: 'none' }, radar: { rotMode: 'none' }, minitank: { beh: 'chase', spd: 0.6, hz: 0.08, rotMode: 'dir', aggro: 8 },
  cone: {}, porta: { rotMode: 'none' }, flag: { rotMode: 'none' }, watchtower: {},
  // океан
  plankton: { vN: 3, beh: 'drift', spd: 0.3 }, shrimp: { beh: 'flee', spd: 1.3, rotMode: 'dir' },
  fish: { vN: 6, beh: 'flee', spd: 1.5, rotMode: 'dir' }, jelly: { vN: 3, beh: 'drift', spd: 0.25, hz: 0.07, rotMode: 'none' },
  puffer: { beh: 'wander', spd: 0.5, hz: 0.09, rotMode: 'none' }, octopus: { vN: 3, beh: 'chase', spd: 1.0, hz: 0.07, aggro: 7 },
  shark: { beh: 'chase', spd: 1.45, hz: 0.1, rotMode: 'dir', aggro: 9 }, turtle: { beh: 'wander', spd: 0.4, rotMode: 'dir' },
  boat: { vN: 3, beh: 'wander', spd: 0.6, rotMode: 'dir' }, ship: { vN: 5, beh: 'wander', spd: 0.3, rotMode: 'dir' },
  buoy: {}, oilrig: { rotMode: 'none' }, iceberg: { beh: 'drift', spd: 0.05 }, island: { vN: 6 },
  whale: { beh: 'wander', spd: 0.35, rotMode: 'dir' }, starfish: { vN: 3 }, crab: { beh: 'wander', spd: 0.6, rotMode: 'none' },
  coral: { vN: 4, rotMode: 'none' }, chest: { rotMode: 'none' }, mine: { hz: 0.12, rotMode: 'none' }, dolphin: { beh: 'flee', spd: 1.8, rotMode: 'dir' },
  // вулкан
  rock: { vN: 3 }, crystal: { vN: 4, rotMode: 'none' }, goat: { beh: 'flee', spd: 1.3, rotMode: 'none' }, palm: {},
  hut: {}, boulder: {}, dino: { vN: 3, beh: 'chase', spd: 1.2, hz: 0.09, rotMode: 'none', aggro: 8 }, egg: { vN: 3, rotMode: 'tilt' },
  lavarock: { light: 2.5 }, tiki: { rotMode: 'none' }, coconut: {}, bush: { vN: 3 }, volcano: { rotMode: 'none' },
  // Земля
  city: { vN: 8 }, megacity: { vN: 6 }, mountain: { vN: 2, rotMode: 'none' }, forest: { vN: 6 },
  plane: { beh: 'flee', spd: 2.0, rotMode: 'dir' }, cloud: { solid: false, noEat: true, beh: 'drift', spd: 0.1, layer: 5 },
  eiffel: { rotMode: 'none' }, pyramid: { rotMode: 'none' }, liberty: { rotMode: 'none' }, tvtower: { rotMode: 'none' },
  windmill: { rotMode: 'none' }, lighthouse: { rotMode: 'none' }, stadium: {}, ferris: { rotMode: 'none' }, launchpad: {},
  // космос
  asteroid: { vN: 3, beh: 'drift', spd: 0.15, spin: 0.3 }, comet: { beh: 'drift', spd: 1.2, rotMode: 'dir' },
  satellite: { beh: 'drift', spd: 0.2, spin: 0.2 }, junk: { vN: 3, beh: 'drift', spd: 0.25, spin: 0.5 },
  astronaut: { beh: 'flee', spd: 0.9, spin: 0.3 }, ufo: { beh: 'chase', spd: 1.3, hz: 0.08, rotMode: 'none', aggro: 9 },
  station: { spin: 0.05 }, moon: { vN: 4 },
  mercury: { rotMode: 'none' }, venus: { rotMode: 'none' }, earthp: { rotMode: 'none' }, mars: { rotMode: 'none' },
  jupiter: { rotMode: 'none' }, saturn: { rotMode: 'none' }, uranus: { rotMode: 'none' }, neptune: { rotMode: 'none' }, pluto: { rotMode: 'none' },
  // финал
  scrap: { vN: 4, beh: 'drift', spd: 0.15, spin: 0.4 }, brainbot: { beh: 'chase', spd: 1.3, hz: 0.07, rotMode: 'none', aggro: 12 },
  generator: { rotMode: 'none', noMag: true },
  // бонусы
  pw_speed: {}, pw_magnet: {}, pw_shield: {}, pw_grow: {}, pw_time: {}, pw_pie: {},
};

// ---------- поведения ----------
const BEH = {
  drift(it, dt, L) {
    const s = it.spd * it.r;
    if (L.moveActor(it, Math.cos(it.heading) * s, Math.sin(it.heading) * s, dt)) it.heading += Math.PI * (0.6 + Math.random() * 0.8);
    if (it.rotMode === 'dir') it.rot = it.heading;
  },
  wander(it, dt, L) {
    it.heading += U.noise1(L.time * 0.6 + it.uid * 7.3) * dt * 2.2;
    const s = it.spd * it.r;
    if (L.moveActor(it, Math.cos(it.heading) * s, Math.sin(it.heading) * s, dt)) it.heading += Math.PI * (0.6 + Math.random() * 0.8);
    if (it.rotMode === 'dir') it.rot = it.heading;
  },
  flee(it, dt, L) {
    const P = L.P;
    const d = U.dist(it.x, it.y, P.x, P.y);
    if (d < Math.max(P.r * 6, it.r * 8) && L.canEat(it)) {
      const away = U.angle(P.x, P.y, it.x, it.y);
      it.heading += U.angDiff(it.heading, away + U.noise1(L.time + it.uid) * 0.6) * Math.min(1, dt * 6);
      const s = it.spd * it.r * 1.15;
      if (L.moveActor(it, Math.cos(it.heading) * s, Math.sin(it.heading) * s, dt)) it.heading += (Math.random() - 0.5) * 2.5;
      if (it.rotMode === 'dir') it.rot = it.heading;
      if (it.panic && !it.say && Math.random() < dt * 0.3) it.say = { text: U.pick(it.panic), t: 1.6 };
    } else { const sp = it.spd; it.spd = sp * 0.35; BEH.wander(it, dt, L); it.spd = sp; }
  },
  chase(it, dt, L) {
    const P = L.P;
    const d = U.dist(it.x, it.y, P.x, P.y);
    const canEat = L.canEat(it);
    if (!canEat && d < (it.aggro || 8) * it.r + P.r * 4) {
      const to = U.angle(it.x, it.y, P.x, P.y);
      it.heading += U.angDiff(it.heading, to) * Math.min(1, dt * 4);
      const s = it.spd * it.r;
      L.moveActor(it, Math.cos(it.heading) * s, Math.sin(it.heading) * s, dt);
      if (it.rotMode === 'dir') it.rot = it.heading;
      if (it.taunt && !it.say && Math.random() < dt * 0.15) it.say = { text: U.pick(it.taunt), t: 2 };
    } else if (canEat && d < P.r * 6) BEH.flee(it, dt, L);
    else { const sp = it.spd; it.spd = sp * 0.4; BEH.wander(it, dt, L); it.spd = sp; }
  },
  patrol(it, dt, L) {
    const path = it.path; if (!path) return;
    const i = it.data.pi || 0, [tx, ty] = path[i % path.length];
    const a = U.angle(it.x, it.y, tx, ty), d = U.dist(it.x, it.y, tx, ty);
    const s = it.spd * it.r * (L.flags.alarm && it.alarmSpd ? it.alarmSpd : 1);
    it.x += Math.cos(a) * Math.min(s * dt, d); it.y += Math.sin(a) * Math.min(s * dt, d);
    if (d < s * dt + 1) it.data.pi = (i + 1) % path.length;
    if (it.rotMode === 'dir') it.rot += U.angDiff(it.rot, a) * Math.min(1, dt * 5);
    it.heading = a;
    if (it.cone) BEH.coneCheck(it, dt, L, a);
    if (it.hz && !L.canEat(it)) { /* урон через касание обрабатывает playerVsItems */ }
  },
  traffic(it, dt, L) { // машины: едут по маршруту, если Никита большой — объезжают нет: просто едут
    BEH.patrol(it, dt, L);
  },
  orbit(it, dt, L) {
    const o = it.orbit;
    let cx = o.cx, cy = o.cy;
    if (o.parent) { const p = L.byId[o.parent]; if (p && !p.dead) { cx = p.x; cy = p.y; } else { it.beh = 'drift'; return; } }
    o.a += o.w * dt;
    it.x = cx + Math.cos(o.a) * o.R; it.y = cy + Math.sin(o.a) * o.R;
    if (it.rotMode === 'dir') it.rot = o.a + Math.PI / 2 * Math.sign(o.w);
  },
  turret(it, dt, L) {
    const P = L.P;
    const d = U.dist(it.x, it.y, P.x, P.y);
    const a = U.angle(it.x, it.y, P.x, P.y);
    it.data.aim = it.data.aim === undefined ? a : it.data.aim + U.angDiff(it.data.aim, a) * Math.min(1, dt * 3);
    it.data.cd = (it.data.cd || it.rate * Math.random()) - dt;
    if (d < (it.range || 900) && !L.canEat(it) && it.data.cd <= 0 && !it.data.off) {
      it.data.cd = it.rate || 2.5;
      const sh = it.shot || {};
      const r = sh.r || Math.max(4, P.r * 0.35);
      L.shoot(it.x + Math.cos(it.data.aim) * it.r, it.y + Math.sin(it.data.aim) * it.r, it.data.aim + (Math.random() - 0.5) * (sh.spread || 0.1), sh.speed || P.r * 9, Object.assign({ r, life: 3 }, sh, { r }));
      Sound.play('shoot');
    }
  },
  // Учёный в мире: держит дистанцию, стреляет, убегает если Никита большой
  sci(it, dt, L) {
    const P = L.P;
    const d = U.dist(it.x, it.y, P.x, P.y);
    const canEat = L.canEat(it);
    it.data.t = (it.data.t || 0) + dt;
    let vx = 0, vy = 0;
    const s = it.spd * it.r;
    if (canEat) {
      if (d < P.r * 8) { const a = U.angle(P.x, P.y, it.x, it.y); vx = Math.cos(a) * s * 1.2; vy = Math.sin(a) * s * 1.2; it.pose = 'run'; it.expr = 'shock'; if (!it.say && Math.random() < dt * 0.5) it.say = { text: U.pick(it.scared || ['Аааа!', 'Никита, нет!', 'Я невкусный!']), t: 1.8 }; }
      else { it.pose = 'stand'; it.expr = 'shock'; }
    } else {
      const want = it.keep || 7;
      if (d < (it.range || 1200)) {
        const a = U.angle(it.x, it.y, P.x, P.y);
        const k = d > want * it.r ? 1 : d < want * it.r * 0.6 ? -1 : 0;
        vx = Math.cos(a) * s * k; vy = Math.sin(a) * s * k;
        it.pose = k ? 'run' : 'point'; it.expr = it.angry || 'determined';
        it.data.cd = (it.data.cd === undefined ? 2 : it.data.cd) - dt;
        if (it.shot && it.data.cd <= 0 && d < want * it.r * 1.8) {
          it.data.cd = it.rate || 3;
          const sh = it.shot; const r = sh.r || Math.max(4, P.r * 0.45);
          L.shoot(it.x, it.y - it.r * 0.3, a, sh.speed || P.r * 8, Object.assign({}, sh, { r, life: 3 }));
          Sound.play('shoot');
        }
        if (!it.say && it.lines && Math.random() < dt * 0.12) it.say = { text: U.pick(it.lines), t: 2.6 };
      } else { it.heading += U.noise1(L.time + it.uid) * dt; vx = Math.cos(it.heading) * s * 0.3; vy = Math.sin(it.heading) * s * 0.3; it.pose = 'stand'; it.expr = 'normal'; }
    }
    if (L.moveActor(it, vx, vy, dt)) it.heading += 1.5;
    if (Math.abs(vx) > 1) it.flip = vx < 0;
    if (it.rotMode === 'dir' && Math.hypot(vx, vy) > 1) it.rot += U.angDiff(it.rot, Math.atan2(vy, vx)) * Math.min(1, dt * 4);
  },
  kirill(it, dt, L) {
    it.data.ct = (it.data.ct || 0) - dt;
    if (it.data.ct <= 0) { it.data.ct = 0.5 + Math.random() * 1.2; it.heading = Math.random() * TAU; }
    const s = it.spd * it.r * (it.data.free ? 1.6 : 1);
    if (L.canEat(it) && U.dist(it.x, it.y, L.P.x, L.P.y) < L.P.r * 6) { const a = U.angle(L.P.x, L.P.y, it.x, it.y); it.heading = a; it.expr = 'shock'; }
    else it.expr = 'crazy';
    if (L.moveActor(it, Math.cos(it.heading) * s, Math.sin(it.heading) * s, dt)) it.heading += Math.PI;
    it.flip = Math.cos(it.heading) < 0; it.pose = Math.sin(L.time * 3) > 0.6 ? 'armsUp' : 'run';
    it.data.press = (it.data.press === undefined ? 5 : it.data.press) - dt;
    if (it.data.press <= 0) { it.data.press = (it.data.free ? 3 : 6) + Math.random() * 4; if (L.def.events && L.def.events.kirillPress) L.def.events.kirillPress(L, it); }
    if (!it.say && Math.random() < dt * 0.2) it.say = { text: U.pick(it.lines || ['Пёсик!']), t: 2.4 };
  },
  natasha(it, dt, L) {
    const k = L.byId.kirill;
    const P = L.P;
    it.data.rage = Math.max(0, (it.data.rage || 0) - dt);
    let tx, ty, s = it.spd * it.r;
    if (it.data.rage > 0 && !L.canEat(it)) { tx = P.x; ty = P.y; s *= 1.5; it.expr = 'angry'; it.pose = 'run'; it.hz = 0.12; it.accName = 'broom'; }
    else if (k && !k.dead) { tx = k.x - Math.cos(k.heading) * k.r * 2; ty = k.y - Math.sin(k.heading) * k.r * 2; it.expr = 'tired'; it.pose = 'run'; it.hz = 0; it.accName = 'bag'; if (!it.say && Math.random() < dt * 0.15) it.say = { text: U.pick(it.lines), t: 2.4 }; }
    else { tx = it.x; ty = it.y; it.pose = 'stand'; }
    if (L.canEat(it) && U.dist(it.x, it.y, P.x, P.y) < P.r * 6) { const a = U.angle(P.x, P.y, it.x, it.y); tx = it.x + Math.cos(a) * 100; ty = it.y + Math.sin(a) * 100; it.expr = 'shock'; }
    const d = U.dist(it.x, it.y, tx, ty);
    if (d > it.r * 0.5) { const a = U.angle(it.x, it.y, tx, ty); L.moveActor(it, Math.cos(a) * Math.min(s, d * 3), Math.sin(a) * Math.min(s, d * 3), dt); it.flip = Math.cos(a) < 0; }
    else it.pose = 'stand';
  },
  // Горелка: огонь включается и выключается
  burner(it, dt, L) {
    it.data.t = (it.data.t || it.phase || 0) + dt;
    const cyc = (it.on || 2) + (it.off || 1.5);
    it.data.lit = (it.data.t % cyc) < (it.on || 2);
    it.hz = it.data.lit ? 0.1 : 0;
    it.solid = true;
  },
  geyser(it, dt, L) {
    it.data.t = (it.data.t || it.phase || 0) + dt;
    const cyc = it.cyc || 5;
    const ph = it.data.t % cyc;
    it.data.state = ph < cyc - 1.6 ? 0 : ph < cyc - 0.8 ? 1 : 2;
    if (it.data.state === 2) {
      const P = L.P;
      if (U.dist(it.x, it.y, P.x, P.y) < it.r * 2.6 + P.r && !(P.r > it.r * 3)) L.hurt(0.1, it.x, it.y, 'geyser');
      if (Math.random() < 0.5) L.part('smoke', it.x + (Math.random() - 0.5) * it.r, it.y + (Math.random() - 0.5) * it.r, (Math.random() - 0.5) * it.r * 3, (Math.random() - 0.5) * it.r * 3, it.r * 0.6, it.lava ? 'rgba(255,120,0,0.5)' : 'rgba(255,255,255,0.5)', 0.8);
    }
  },
  // Дрон-прожектор (стелс)
  drone(it, dt, L) {
    it.cone.a = it.heading + Math.sin(L.time * 1.2 + it.uid) * 0.5;
    if (L.flags.alarm > 0 && !L.canEat(it)) {
      const P = L.P, a = U.angle(it.x, it.y, P.x, P.y);
      const s = it.spd * it.r * 1.4;
      L.moveActor(it, Math.cos(a) * s, Math.sin(a) * s, dt);
      it.heading = a; it.cone.a = a;
      it.data.cd = (it.data.cd || 1) - dt;
      if (it.data.cd <= 0 && U.dist(it.x, it.y, P.x, P.y) < it.cone.len) { it.data.cd = 1.8; L.shoot(it.x, it.y, a, P.r * 7, { k: 'net', r: P.r * 0.4, eff: 'stun', hz: 0, col: '#fff', stunT: 1.2 }); Sound.play('shoot'); }
    } else if (it.path) BEH.patrol(it, dt, L);
    if (L.flags.alarm <= 0) BEH.coneCheck(it, dt, L, it.cone.a);
  },
  coneCheck(it, dt, L, a) {
    const P = L.P;
    if (!it.cone || L.canEat(it)) return;
    const d = U.dist(it.x, it.y, P.x, P.y);
    if (d > it.cone.len + P.r) return;
    const da = Math.abs(U.angDiff(it.cone.a, U.angle(it.x, it.y, P.x, P.y)));
    if (da < it.cone.w + Math.atan2(P.r, d)) {
      if (!(L.flags.alarm > 0)) { L.toast('ТРЕВОГА! Тебя заметили!', '#ff6b6b', 2); Sound.play('alarm'); if (L.def.onAlarm) L.def.onAlarm(L, it); }
      L.flags.alarm = 5;
    }
  },
  spinner(it, dt, L) { it.rot += (it.spinSpd || 1) * dt; },
  searchlight(it, dt, L) {
    it.cone.a = it.base + Math.sin(L.time * (it.sweepSpd || 0.6) + it.uid) * (it.sweep || 1.2);
    if (!(L.flags.alarm > 0)) BEH.coneCheck(it, dt, L, it.cone.a);
  },
  orbitTurret(it, dt, L) { BEH.orbit(it, dt, L); if (it.beh === 'orbitTurret') BEH.turret(it, dt, L); },
  follow(it, dt, L) {
    const f = L.byId[it.target]; if (!f || f.dead) { it.beh = 'wander'; return; }
    const d = U.dist(it.x, it.y, f.x, f.y);
    if (d > (it.dist || f.r * 2)) { const a = U.angle(it.x, it.y, f.x, f.y); L.moveActor(it, Math.cos(a) * it.spd * it.r, Math.sin(a) * it.spd * it.r, dt); if (it.rotMode === 'dir') it.rot = a; }
  },
  // Гравитационный колодец (планеты): притягивает Никиту
  grav(it, dt, L) {
    const P = L.P;
    if (L.canEat(it)) return;
    const d = U.dist(it.x, it.y, P.x, P.y);
    const R = it.r * (it.gravR || 5);
    if (d < R && d > it.r) { const f = (1 - d / R) * P.r * BASE_SPD * (it.gstr || 0.5); L.pushX += (it.x - P.x) / d * f; L.pushY += (it.y - P.y) / d * f; }
  },
};

// ---------- особые отрисовки предметов ----------
const Draws = {
  sci(ctx, it, t, z, L) {
    if (it.r * z < 2) { circ(ctx, it.x, it.y, it.r, CH[it.who] ? CH[it.who].color : '#fff', null); return; }
    Chars.draw(ctx, it.who, { x: it.x, y: it.y + it.r * 0.95, scale: it.r / 52, t: t + it.uid, pose: it.pose || 'stand', expr: it.expr || 'normal', flip: it.flip, accName: it.accName, talking: !!it.say });
    if (it.hz && !L.canEat(it)) { ctx.save(); ctx.globalAlpha = 0.25 + 0.15 * Math.sin(t * 8); circ(ctx, it.x, it.y, it.r * 1.1, null, '#ff4d4d', it.r * 0.06); ctx.restore(); }
  },
  burner(ctx, it, t, z) {
    Sprites.draw(ctx, 'burner', 0, it.x, it.y, it.r, 0, z);
    if (it.data.lit) {
      const r = it.r;
      for (let i = 0; i < 3; i++) {
        const fl = 1 + Math.sin(t * 20 + i * 2) * 0.12;
        ctx.save(); ctx.globalAlpha = 0.7 - i * 0.15;
        circ(ctx, it.x + Math.sin(t * 9 + i) * r * 0.05, it.y - r * 0.1 * i, r * (0.75 - i * 0.18) * fl, ['#4dabf7', '#ffd43b', '#ff6b00'][i], null);
        ctx.restore();
      }
      ctx.save(); ctx.globalAlpha = 0.2; circ(ctx, it.x, it.y, it.r * 1.6, '#ff922b', null); ctx.restore();
    } else {
      const k = it.data.t % ((it.on || 2) + (it.off || 1.5)) - (it.on || 2);
      if (k > (it.off || 1.5) - 0.5) { ctx.save(); ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 40); circ(ctx, it.x, it.y, it.r * 0.3, '#4dabf7', null); ctx.restore(); }
    }
  },
  geyser(ctx, it, t, z) {
    const st = it.data.state || 0;
    circ(ctx, it.x, it.y, it.r, it.lava ? '#3d2b1f' : '#5c5048', OL, it.r * 0.1);
    circ(ctx, it.x, it.y, it.r * 0.6, it.lava ? '#ff6b00' : '#74c0fc', null);
    if (st >= 1) { ctx.save(); ctx.globalAlpha = st === 1 ? 0.3 + 0.3 * Math.sin(t * 30) : 0.5; circ(ctx, it.x, it.y, it.r * 2.6, it.lava ? '#ff6b00' : '#e7f5ff', st === 1 ? null : '#fff', it.r * 0.1); ctx.restore(); }
    if (st === 2) { for (let i = 0; i < 6; i++) { const a = t * 5 + i; circ(ctx, it.x + Math.cos(a) * it.r * 1.4, it.y + Math.sin(a) * it.r * 1.4, it.r * 0.6, it.lava ? '#ffd43b' : '#fff', null); } }
  },
  drone(ctx, it, t, z, L) {
    const c = it.cone;
    ctx.save(); ctx.globalAlpha = L.flags.alarm > 0 ? 0.28 : 0.16;
    ctx.fillStyle = L.flags.alarm > 0 ? '#ff4d4d' : '#fff3bf';
    ctx.beginPath(); ctx.moveTo(it.x, it.y); ctx.arc(it.x, it.y, c.len, c.a - c.w, c.a + c.w); ctx.closePath(); ctx.fill();
    ctx.restore();
    const r = it.r;
    for (let i = 0; i < 4; i++) { const a = i * TAU / 4 + Math.PI / 4; line(ctx, it.x, it.y, it.x + Math.cos(a) * r, it.y + Math.sin(a) * r, OL, r * 0.18); ctx.save(); ctx.globalAlpha = 0.5; circ(ctx, it.x + Math.cos(a) * r, it.y + Math.sin(a) * r, r * 0.42, '#adb5bd', null); ctx.restore(); }
    circ(ctx, it.x, it.y, r * 0.5, '#ff922b', OL, r * 0.08);
    circ(ctx, it.x + Math.cos(c.a) * r * 0.25, it.y + Math.sin(c.a) * r * 0.25, r * 0.2, L.flags.alarm > 0 ? '#ff4d4d' : '#fff3bf', OL, r * 0.05);
  },
  turret(ctx, it, t, z) {
    const r = it.r, a = it.data.aim || 0;
    circ(ctx, it.x, it.y, r, it.col || '#495057', OL, r * 0.1);
    ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(a);
    rect(ctx, 0, -r * 0.22, r * 1.3, r * 0.44, r * 0.1, it.col2 || '#868e96', OL, r * 0.08);
    ctx.restore();
    circ(ctx, it.x, it.y, r * 0.55, it.col2 || '#868e96', OL, r * 0.08);
    circ(ctx, it.x, it.y, r * 0.2, it.eye || '#ff4d4d', null);
  },
  jeep(ctx, it, t, z) { // джип Димы
    Sprites.draw(ctx, 'jeep', 0, it.x, it.y, it.r, it.rot, z);
    if (it.r * z > 6) Chars.portrait(ctx, 'dima', it.x, it.y - it.r * 0.1, it.r * 0.42, { expr: it.expr || 'determined', t });
  },
  sub(ctx, it, t, z) { // подлодка Егора
    ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.rot);
    const r = it.r;
    ell(ctx, 0, 0, r, r * 0.45, 0, lg(ctx, 0, -r * 0.45, 0, r * 0.45, ['#ffe066', '#fab005', '#e67700']), OL, r * 0.06);
    rect(ctx, -r * 0.2, -r * 0.2, r * 0.45, r * 0.4, r * 0.1, '#fab005', OL, r * 0.05);
    for (let i = 0; i < 3; i++) circ(ctx, -r * 0.5 + i * r * 0.35, r * 0.05, r * 0.1, '#a5d8ff', OL, r * 0.04);
    ctx.save(); ctx.rotate(t * 10); for (let i = 0; i < 3; i++) { ctx.rotate(TAU / 3); ell(ctx, -r * 1.05, 0, r * 0.06, r * 0.2, 0, '#868e96', OL, r * 0.03); } ctx.restore();
    ctx.restore();
    if (it.r * z > 8) Chars.portrait(ctx, 'egor', it.x, it.y, it.r * 0.28, { expr: it.expr || 'determined', t });
  },
  searchlight(ctx, it, t, z, L) {
    const c = it.cone;
    ctx.save(); ctx.globalAlpha = L.flags.alarm > 0 ? 0.3 : 0.18; ctx.fillStyle = L.flags.alarm > 0 ? '#ff4d4d' : '#fff3bf';
    ctx.beginPath(); ctx.moveTo(it.x, it.y); ctx.arc(it.x, it.y, c.len, c.a - c.w, c.a + c.w); ctx.closePath(); ctx.fill(); ctx.restore();
    Sprites.draw(ctx, 'watchtower', 0, it.x, it.y, it.r, c.a, z);
  },
  lasersat(ctx, it, t, z) {
    Sprites.draw(ctx, 'satellite', 0, it.x, it.y, it.r, it.rot, z);
    ctx.save(); ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 6 + it.uid); circ(ctx, it.x, it.y, it.r * 0.25, '#ff3b3b', null); ctx.restore();
  },
  sun(ctx, it, t, z, L) {
    const r = it.r;
    const g = ctx.createRadialGradient(it.x, it.y, r * 0.3, it.x, it.y, r * 2.2);
    g.addColorStop(0, 'rgba(255,243,191,1)'); g.addColorStop(0.45, 'rgba(255,212,59,0.9)'); g.addColorStop(0.6, 'rgba(255,146,43,0.35)'); g.addColorStop(1, 'rgba(255,107,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(it.x, it.y, r * 2.2, 0, TAU); ctx.fill();
    ctx.beginPath();
    for (let i = 0; i <= 60; i++) { const a = i / 60 * TAU; const rr = r * (1 + 0.04 * Math.sin(a * 9 + t * 3) + 0.03 * Math.sin(a * 5 - t * 2)); i ? ctx.lineTo(it.x + Math.cos(a) * rr, it.y + Math.sin(a) * rr) : ctx.moveTo(it.x + Math.cos(a) * rr, it.y + Math.sin(a) * rr); }
    ctx.closePath(); ctx.fillStyle = rg(ctx, it.x, it.y, r, ['#fffbe6', '#ffd43b', '#ff922b']); ctx.fill();
    if (r * z > 20) { eyes(ctx, it.x, it.y - r * 0.1, r * 0.25, r * 0.12, L.canEat(it) ? 2 : 1); ctx.beginPath(); ctx.arc(it.x, it.y + r * 0.2, r * 0.25, 0.1 * Math.PI, 0.9 * Math.PI); ctx.lineWidth = r * 0.04; ctx.strokeStyle = OL; ctx.stroke(); }
  },
};

// ---------- зоны ----------
const ZoneDraw = {
  current(ctx, z, zm, t) {
    ctx.save();
    if (z.shape === 'circ') { ctx.beginPath(); ctx.arc(z.x, z.y, z.r, 0, TAU); ctx.clip(); } else { ctx.beginPath(); ctx.rect(z.x, z.y, z.w, z.h); ctx.clip(); }
    const bx = z.shape === 'circ' ? z.x - z.r : z.x, by = z.shape === 'circ' ? z.y - z.r : z.y, bw = z.shape === 'circ' ? z.r * 2 : z.w, bh = z.shape === 'circ' ? z.r * 2 : z.h;
    ctx.fillStyle = z.col || 'rgba(116,192,252,0.18)'; ctx.fillRect(bx, by, bw, bh);
    const s = z.step || Math.max(60, Math.min(bw, bh) * 0.25);
    const off = (t * s * 1.2) % s;
    ctx.strokeStyle = z.arrow || 'rgba(255,255,255,0.45)'; ctx.lineWidth = s * 0.08;
    const a = Math.atan2(z.dy, z.dx);
    ctx.translate(bx + bw / 2, by + bh / 2); ctx.rotate(a);
    const R = Math.hypot(bw, bh) / 2;
    for (let x = -R - s + off; x < R + s; x += s) for (let y = -R; y < R; y += s) { ctx.beginPath(); ctx.moveTo(x - s * 0.2, y - s * 0.2); ctx.lineTo(x + s * 0.1, y); ctx.lineTo(x - s * 0.2, y + s * 0.2); ctx.stroke(); }
    ctx.restore();
  },
  conveyor(ctx, z, zm, t) {
    ctx.save(); ctx.beginPath(); ctx.rect(z.x, z.y, z.w, z.h); ctx.clip();
    ctx.fillStyle = '#343a40'; ctx.fillRect(z.x, z.y, z.w, z.h);
    const horiz = Math.abs(z.dx) > Math.abs(z.dy);
    const s = (horiz ? z.h : z.w) * 0.6;
    const dir = horiz ? Math.sign(z.dx) : Math.sign(z.dy);
    const off = ((t * s * 1.5 * dir) % s + s) % s;
    ctx.strokeStyle = '#ffd43b'; ctx.lineWidth = s * 0.15;
    if (horiz) for (let x = z.x - s + off; x < z.x + z.w + s; x += s) { ctx.beginPath(); ctx.moveTo(x - dir * s * 0.25, z.y + z.h * 0.25); ctx.lineTo(x + dir * s * 0.1, z.y + z.h / 2); ctx.lineTo(x - dir * s * 0.25, z.y + z.h * 0.75); ctx.stroke(); }
    else for (let y = z.y - s + off; y < z.y + z.h + s; y += s) { ctx.beginPath(); ctx.moveTo(z.x + z.w * 0.25, y - dir * s * 0.25); ctx.lineTo(z.x + z.w / 2, y + dir * s * 0.1); ctx.lineTo(z.x + z.w * 0.75, y - dir * s * 0.25); ctx.stroke(); }
    ctx.restore();
    ctx.strokeStyle = '#212529'; ctx.lineWidth = Math.min(z.w, z.h) * 0.06; ctx.strokeRect(z.x, z.y, z.w, z.h);
  },
  ice(ctx, z, zm, t) {
    ctx.save(); ctx.globalAlpha = 0.75;
    if (z.shape === 'circ') { ctx.beginPath(); ctx.arc(z.x, z.y, z.r, 0, TAU); ctx.clip(); BG.fillPattern(ctx, 'ice', 300, z.x - z.r, z.y - z.r, z.r * 2, z.r * 2, zm); }
    else { ctx.beginPath(); ctx.rect(z.x, z.y, z.w, z.h); ctx.clip(); BG.fillPattern(ctx, 'ice', 300, z.x, z.y, z.w, z.h, zm); }
    ctx.restore();
  },
  slow(ctx, z, zm, t) {
    ctx.save(); ctx.globalAlpha = 0.7;
    const col = z.col || '#94d82d';
    if (z.shape === 'circ') { blob(ctx, z.x, z.y, z.r, 12, 0.1, z.x, col, U.shade(col, -0.3), z.r * 0.05); for (let i = 0; i < 4; i++) circ(ctx, z.x + Math.cos(i * 1.7 + t) * z.r * 0.5, z.y + Math.sin(i * 2.3) * z.r * 0.5, z.r * 0.08 * (1 + Math.sin(t * 3 + i) * 0.5), U.shade(col, 0.4), null); }
    else { ctx.fillStyle = col; ctx.fillRect(z.x, z.y, z.w, z.h); }
    ctx.restore();
  },
  paint(ctx, z, zm, t) {
    const col = PAINT[z.color];
    blob(ctx, z.x, z.y, z.r, 11, 0.16, z.x * 0.01, col, U.shade(col, -0.4), z.r * 0.06);
    for (let i = 0; i < 6; i++) { const a = i * 1.05 + 0.3; circ(ctx, z.x + Math.cos(a) * z.r * 1.15, z.y + Math.sin(a) * z.r * 1.15, z.r * 0.1, col, null); }
    hl(ctx, z.x - z.r * 0.3, z.y - z.r * 0.3, z.r * 0.3, z.r * 0.12, 0.45);
    // ведро
    const bx = z.x + z.r * 0.8, by = z.y - z.r * 0.8, br = z.r * 0.35;
    poly(ctx, [bx - br, by - br, bx + br, by - br, bx + br * 0.8, by + br, bx - br * 0.8, by + br], '#dee2e6', OL, br * 0.12);
    rect(ctx, bx - br, by - br * 0.3, br * 2, br * 0.5, br * 0.1, col, null);
  },
  lava(ctx, z, zm, t) {
    ctx.save();
    if (z.shape === 'circ') { ctx.beginPath(); ctx.arc(z.x, z.y, z.r, 0, TAU); } else { ctx.beginPath(); ctx.rect(z.x, z.y, z.w, z.h); }
    ctx.clip();
    const bx = z.shape === 'circ' ? z.x - z.r : z.x, by = z.shape === 'circ' ? z.y - z.r : z.y, bw = z.shape === 'circ' ? z.r * 2 : z.w, bh = z.shape === 'circ' ? z.r * 2 : z.h;
    if (z.frozen) {
      BG.fillPattern(ctx, 'ice', 300, bx, by, bw, bh, zm);
      ctx.fillStyle = 'rgba(255,107,0,0.15)'; ctx.fillRect(bx, by, bw, bh);
    } else {
      const g = ctx.createLinearGradient(bx, by, bx + bw, by + bh); g.addColorStop(0, '#ff6b00'); g.addColorStop(0.5, '#ffd43b'); g.addColorStop(1, '#ff3b00'); ctx.fillStyle = g; ctx.fillRect(bx, by, bw, bh);
      const s = Math.max(60, Math.min(bw, bh) * 0.3);
      for (let x = bx; x < bx + bw; x += s) for (let y = by; y < by + bh; y += s) {
        const k = ((x * 13 + y * 7) % 100) / 100;
        const ph = (t * 0.6 + k * 5) % 1;
        ctx.globalAlpha = 1 - ph; circ(ctx, x + s * k, y + s * ((k * 3) % 1), s * 0.18 * ph + 2, '#fff3bf', '#ff8c00', s * 0.03);
      }
      ctx.globalAlpha = 0.25; ctx.fillStyle = '#7a1f00';
      for (let x = bx; x < bx + bw; x += s * 1.3) { ctx.beginPath(); ctx.ellipse(x + Math.sin(t + x) * s * 0.2, by + bh / 2 + Math.cos(t * 0.7 + x) * bh * 0.3, s * 0.4, s * 0.12, 0.4, 0, TAU); ctx.fill(); }
    }
    ctx.restore();
  },
  hazard(ctx, z, zm, t) {
    const col = z.col || '#3bc9db';
    const k = z.life !== undefined && z.maxLife ? z.life / z.maxLife : 1;
    ctx.save(); ctx.globalAlpha = 0.55 * Math.min(1, k * 3);
    if (z.shape === 'circ') { blob(ctx, z.x, z.y, z.r, 12, 0.12, z.x * 0.03, col, U.shade(col, -0.35), z.r * 0.05); ctx.globalAlpha *= 0.6; circ(ctx, z.x, z.y, z.r * (0.6 + 0.3 * Math.sin(t * 4)), null, '#fff', z.r * 0.04); }
    else { ctx.fillStyle = col; ctx.fillRect(z.x, z.y, z.w, z.h); }
    ctx.restore();
  },
  vortex(ctx, z, zm, t) {
    ctx.save(); ctx.globalAlpha = 0.6;
    for (let i = 0; i < 5; i++) { ctx.beginPath(); for (let k = 0; k <= 40; k++) { const a = k * 0.25 + i * TAU / 5 - t * 2, d = z.r * (1 - k / 40); k ? ctx.lineTo(z.x + Math.cos(a) * d, z.y + Math.sin(a) * d) : ctx.moveTo(z.x + Math.cos(a) * d, z.y + Math.sin(a) * d); } ctx.lineWidth = z.r * 0.04; ctx.strokeStyle = i % 2 ? '#a5d8ff' : '#fff'; ctx.stroke(); }
    circ(ctx, z.x, z.y, z.r * 0.15, '#0b3d75', null);
    ctx.restore();
  },
  water(ctx, z, zm, t) { // декоративная вода
    ctx.save(); ctx.beginPath(); ctx.rect(z.x, z.y, z.w, z.h); ctx.clip(); BG.fillPattern(ctx, 'ocean', 600, z.x, z.y, z.w, z.h, zm); ctx.restore();
  },
};

// ---------- триггеры ----------
const TrigDraw = {
  button(ctx, tr, z, t) {
    const r = tr.r, col = tr.col || '#e03131';
    circ(ctx, tr.x, tr.y, r, '#495057', OL, r * 0.1);
    const press = tr.flashT > 0 ? 0.6 : 1;
    if (tr.flashT > 0) tr.flashT -= 1 / 60;
    circ(ctx, tr.x, tr.y - r * 0.1 * press, r * 0.7, tr.pressed ? U.shade(col, 0.3) : col, OL, r * 0.08);
    hl(ctx, tr.x - r * 0.2, tr.y - r * 0.35, r * 0.25, r * 0.1, 0.5);
    if (tr.minR) { ctx.fillStyle = '#fff'; ctx.font = `900 ${r * 0.5}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('⚖', tr.x, tr.y); }
  },
  plate(ctx, tr, z, t) {
    const r = tr.r;
    rect(ctx, tr.x - r, tr.y - r, r * 2, r * 2, r * 0.2, tr.active ? '#69db7c' : '#868e96', OL, r * 0.08);
    rect(ctx, tr.x - r * 0.75, tr.y - r * 0.75, r * 1.5, r * 1.5, r * 0.15, tr.active ? '#b2f2bb' : '#adb5bd', null);
    ctx.save(); ctx.globalAlpha = tr.active ? 0.9 : 0.5;
    for (let i = 0; i < 4; i++) { ctx.save(); ctx.translate(tr.x, tr.y); ctx.rotate(i * Math.PI / 2); poly(ctx, [-r * 0.2, -r * 0.65, r * 0.2, -r * 0.65, 0, -r * 0.4], OL, null); ctx.restore(); }
    ctx.restore();
  },
  hold(ctx, tr, z, t) { // вентиль
    const r = tr.r;
    circ(ctx, tr.x, tr.y, r, tr.done ? '#2b8a3e' : '#495057', OL, r * 0.08);
    ctx.save(); ctx.translate(tr.x, tr.y); ctx.rotate((tr.p || 0) * TAU * 2 + (tr.done ? 0 : 0));
    circ(ctx, 0, 0, r * 0.65, null, tr.col || '#e03131', r * 0.15);
    for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); line(ctx, 0, 0, r * 0.65, 0, tr.col || '#e03131', r * 0.12); }
    ctx.restore();
    if (!tr.done && tr.p > 0) { ctx.beginPath(); ctx.arc(tr.x, tr.y, r * 1.15, -Math.PI / 2, -Math.PI / 2 + tr.p * TAU); ctx.lineWidth = r * 0.15; ctx.strokeStyle = '#ffd43b'; ctx.stroke(); }
  },
  sign(ctx, tr, z, t) {
    if (tr.hidden || tr.invisible) return;
    const r = tr.r * 0.25;
    ctx.save(); ctx.globalAlpha = tr.shown ? 0.4 : 0.9;
    circ(ctx, tr.x, tr.y + Math.sin(t * 3) * r * 0.2, r, '#ffd43b', OL, r * 0.12);
    ctx.fillStyle = OL; ctx.font = `900 ${r * 1.3}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', tr.x, tr.y + Math.sin(t * 3) * r * 0.2 + r * 0.05);
    ctx.restore();
  },
  portal(ctx, tr, z, t) {
    const col = tr.col || '#b197fc';
    ctx.save();
    for (let i = 0; i < 3; i++) { ctx.globalAlpha = 0.5 - i * 0.12; circ(ctx, tr.x, tr.y, tr.r * (1 - i * 0.25), null, col, tr.r * 0.12); }
    ctx.globalAlpha = 0.8;
    for (let i = 0; i < 6; i++) { const a = t * 3 + i * TAU / 6; circ(ctx, tr.x + Math.cos(a) * tr.r * 0.7, tr.y + Math.sin(a) * tr.r * 0.7, tr.r * 0.08, '#fff', null); }
    circ(ctx, tr.x, tr.y, tr.r * 0.3, U.rgba(col, 0.7), null);
    ctx.restore();
  },
  simon(ctx, tr, z, t) {
    const lit = tr.lit;
    // консоль
    rect(ctx, tr.x - tr.r, tr.y - tr.r * 0.6, tr.r * 2, tr.r * 1.2, tr.r * 0.2, '#343a40', OL, tr.r * 0.06);
    rect(ctx, tr.x - tr.r * 0.8, tr.y - tr.r * 0.45, tr.r * 1.6, tr.r * 0.5, tr.r * 0.1, tr.state === 'done' ? '#69db7c' : '#1864ab', null);
    ctx.fillStyle = '#fff'; ctx.font = `900 ${tr.r * 0.25}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(tr.state === 'done' ? 'ОТКРЫТО' : tr.state === 'input' ? (tr.step + '/' + tr.seq.length) : 'ПОВТОРИ', tr.x, tr.y - tr.r * 0.2);
    for (let i = 0; i < tr.pads.length; i++) {
      const p = tr.pads[i];
      const on = lit === i || (tr.pressT && tr.pressI === i && tr.pressT > 0);
      ctx.save();
      if (on) { ctx.globalAlpha = 0.5; circ(ctx, p.x, p.y, p.r * 1.5, p.col, null); ctx.globalAlpha = 1; }
      rect(ctx, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2, p.r * 0.3, on ? U.shade(p.col, 0.45) : U.shade(p.col, -0.35), OL, p.r * 0.08);
      ctx.restore();
    }
  },
};

// ---------- снаряды ----------
const ProjDraw = {
  net(ctx, p, z, t) {
    circ(ctx, p.x, p.y, p.r, U.rgba('#fff', 0.25), '#e8c35c', p.r * 0.12);
    ctx.save(); ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU); ctx.clip(); ctx.strokeStyle = '#e8c35c'; ctx.lineWidth = p.r * 0.08;
    for (let i = -2; i <= 2; i++) { line(ctx, p.x + i * p.r * 0.4 - p.r, p.y - p.r, p.x + i * p.r * 0.4 + p.r, p.y + p.r, '#e8c35c', p.r * 0.08); line(ctx, p.x + i * p.r * 0.4 + p.r, p.y - p.r, p.x + i * p.r * 0.4 - p.r, p.y + p.r, '#e8c35c', p.r * 0.08); }
    ctx.restore();
  },
  drop(ctx, p, z, t) { Sprites.draw(ctx, 'droplet', 0, p.x, p.y, p.r, 0, z); },
  flask(ctx, p, z, t) { Sprites.draw(ctx, 'flask', p.v || 1, p.x, p.y, p.r, p.t * 8, z); },
  freeze(ctx, p, z, t) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Math.atan2(p.vy, p.vx)); poly(ctx, [p.r * 1.6, 0, 0, -p.r * 0.6, -p.r, 0, 0, p.r * 0.6], '#a5d8ff', '#1864ab', p.r * 0.12); ctx.restore(); },
  missile(ctx, p, z, t) {
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Math.atan2(p.vy, p.vx));
    const r = p.r;
    circ(ctx, -r * 1.3, 0, r * (0.5 + Math.random() * 0.3), '#ff922b', null);
    rect(ctx, -r, -r * 0.35, r * 2, r * 0.7, r * 0.3, p.col || '#f8f9fa', OL, r * 0.1);
    poly(ctx, [r, -r * 0.35, r * 1.6, 0, r, r * 0.35], '#e03131', OL, r * 0.1);
    poly(ctx, [-r, -r * 0.35, -r * 1.3, -r * 0.8, -r * 0.5, -r * 0.35], '#e03131', OL, r * 0.08); poly(ctx, [-r, r * 0.35, -r * 1.3, r * 0.8, -r * 0.5, r * 0.35], '#e03131', OL, r * 0.08);
    if (p.bow) { poly(ctx, [0, 0, -r * 0.4, -r * 0.5, -r * 0.4, r * 0.5], '#ff8fab', OL, r * 0.06); poly(ctx, [0, 0, r * 0.4, -r * 0.5, r * 0.4, r * 0.5], '#ff8fab', OL, r * 0.06); }
    ctx.restore();
  },
  torpedo(ctx, p, z, t) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Math.atan2(p.vy, p.vx)); rect(ctx, -p.r * 1.4, -p.r * 0.4, p.r * 2.8, p.r * 0.8, p.r * 0.4, '#495057', OL, p.r * 0.1); circ(ctx, p.r * 1.2, 0, p.r * 0.3, '#ff6b6b', null); ctx.restore(); },
  shell(ctx, p, z, t) { circ(ctx, p.x, p.y, p.r, '#343a40', OL, p.r * 0.15); hl(ctx, p.x - p.r * 0.3, p.y - p.r * 0.3, p.r * 0.3, p.r * 0.15, 0.4); },
  wave(ctx, p, z, t) { ctx.save(); ctx.globalAlpha = 0.8; circ(ctx, p.x, p.y, p.r, U.rgba('#be4bdb', 0.3), '#e599f7', p.r * 0.15); circ(ctx, p.x, p.y, p.r * 0.5, null, '#fff', p.r * 0.08); ctx.restore(); },
  lava(ctx, p, z, t) { circ(ctx, p.x, p.y, p.r * 1.4, U.rgba('#ff6b00', 0.3), null); Sprites.draw(ctx, 'lavarock', 0, p.x, p.y, p.r, p.t * 4, z); },
  toy(ctx, p, z, t) { Sprites.draw(ctx, p.spr || 'duck', 0, p.x, p.y, p.r, p.t * 6, z); },
  ink(ctx, p, z, t) { ctx.save(); ctx.globalAlpha = 0.85; blob(ctx, p.x, p.y, p.r, 8, 0.25, p.t * 3, '#212529', null); ctx.restore(); },
  bolt(ctx, p, z, t) { ctx.save(); ctx.globalAlpha = 0.5; circ(ctx, p.x, p.y, p.r * 1.8, p.col || '#ff3b3b', null); ctx.globalAlpha = 1; circ(ctx, p.x, p.y, p.r, '#fff', p.col || '#ff3b3b', p.r * 0.3); ctx.restore(); },
  ball(ctx, p, z, t) { circ(ctx, p.x, p.y, p.r, p.col || '#fff', OL, p.r * 0.15); },
  spr(ctx, p, z, t) { Sprites.draw(ctx, p.spr, p.v || 0, p.x, p.y, p.r, p.t * 5, z); },
};

// ---------- головоломки ----------
const Puzzles = {
  simonUpdate(L, tr, dt) {
    const P = L.P;
    tr.state = tr.state || 'idle';
    tr.pressT = Math.max(0, (tr.pressT || 0) - dt);
    const nearConsole = U.dist(P.x, P.y, tr.x, tr.y) < tr.r * 3;
    if (tr.state === 'idle') { if (nearConsole) { tr.state = 'show'; tr.si = 0; tr.st = 0.8; tr.lit = -1; if (tr.onStart) tr.onStart(L, tr); } return; }
    if (tr.state === 'show') {
      tr.st -= dt;
      if (tr.st <= 0) {
        if (tr.lit >= 0) { tr.lit = -1; tr.st = 0.25; tr.si++; }
        else if (tr.si < tr.seq.length) { tr.lit = tr.seq[tr.si]; tr.st = 0.6; Sound.tone(300 + tr.lit * 120, 0.4, 'square', 0.1); }
        else { tr.state = 'input'; tr.step = 0; tr.lit = -1; L.toast('Повтори порядок: наступай на цветные плиты!', '#ffe066', 2.5); }
      }
      return;
    }
    if (tr.state === 'input') {
      for (let i = 0; i < tr.pads.length; i++) {
        const p = tr.pads[i];
        const on = U.dist(P.x, P.y, p.x, p.y) < p.r * 0.9;
        if (on && !p.inside) {
          tr.pressI = i; tr.pressT = 0.3;
          if (tr.seq[tr.step] === i) {
            tr.step++; Sound.tone(300 + i * 120, 0.25, 'square', 0.12);
            if (tr.step >= tr.seq.length) { tr.state = 'done'; Sound.play('chime'); L.fire(tr.act, tr); if (tr.onDone) tr.onDone(L, tr); }
          } else {
            Sound.play('alarm'); L.toast('Неправильно! Смотри ещё раз.', '#ff6b6b', 2);
            tr.state = 'show'; tr.si = 0; tr.st = 1.2; tr.lit = -1;
            if (tr.onFail) tr.onFail(L, tr);
          }
        }
        p.inside = on;
      }
    }
  },
};

// ---------- фоны уровней ----------
// Положение экрана относительно круглого мира: 'inside' | 'outside' | 'edge'
function circleView(v, cx, cy, R) {
  const far = Math.max(U.dist2(v.x, v.y, cx, cy), U.dist2(v.x + v.w, v.y, cx, cy), U.dist2(v.x, v.y + v.h, cx, cy), U.dist2(v.x + v.w, v.y + v.h, cx, cy));
  if (far < R * R) return 'inside';
  const nx = U.clamp(cx, v.x, v.x + v.w), ny = U.clamp(cy, v.y, v.y + v.h);
  if (U.dist2(nx, ny, cx, cy) > R * R) return 'outside';
  return 'edge';
}
function circleWorld(ctx, L, v, z, fillInside, outsideCol, rimFn) {
  const R = L.W / 2, st = circleView(v, R, R, R);
  if (st !== 'outside') fillInside(Math.max(0, v.x), Math.max(0, v.y), Math.min(v.x + v.w, L.W) - Math.max(0, v.x), Math.min(v.y + v.h, L.H) - Math.max(0, v.y));
  if (st === 'inside') return;
  if (outsideCol) { ctx.save(); ctx.beginPath(); ctx.rect(v.x, v.y, v.w, v.h); ctx.arc(R, R, R, 0, TAU, true); ctx.fillStyle = outsideCol; ctx.fill('evenodd'); ctx.restore(); }
  if (rimFn) rimFn(R);
}
const LevelBG = {
  plain(ctx, L, v) { ctx.fillStyle = '#20232a'; ctx.fillRect(v.x, v.y, v.w, v.h); },
  rectPat(name, T, outside) {
    return (ctx, L, v, z) => {
      ctx.fillStyle = outside; ctx.fillRect(v.x, v.y, v.w, v.h);
      const x0 = Math.max(0, v.x), y0 = Math.max(0, v.y), x1 = Math.min(L.W, v.x + v.w), y1 = Math.min(L.H, v.y + v.h);
      if (x1 > x0 && y1 > y0) BG.fillPattern(ctx, name, T, x0, y0, x1 - x0, y1 - y0, z);
      ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 10 / z; ctx.strokeRect(0, 0, L.W, L.H);
    };
  },
  dish(ctx, L, v, z, t) {
    circleWorld(ctx, L, v, z, (x, y, w, h) => {
      BG.fillPattern(ctx, 'agar', 700, x, y, w, h, z);
      const R = L.W / 2;
      if (circleView(v, R, R, R * 0.6) !== 'inside') { const g = ctx.createRadialGradient(R, R, R * 0.6, R, R, R); g.addColorStop(0, 'rgba(160,110,20,0)'); g.addColorStop(1, 'rgba(160,110,20,0.35)'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h); }
    }, '#1f1d33', R => { ctx.beginPath(); ctx.arc(R, R, R, 0, TAU); ctx.lineWidth = R * 0.03; ctx.strokeStyle = 'rgba(200,230,255,0.6)'; ctx.stroke(); ctx.lineWidth = R * 0.008; ctx.strokeStyle = '#fff'; ctx.stroke(); });
  },
  space: {
    screen(ctx, L, sw, sh, t) {
      ctx.fillStyle = '#0b0a22'; ctx.fillRect(0, 0, sw, sh);
      BG.stars(ctx, sw, sh, L.cam.x, L.cam.y, L.cam.zoom, t, 300);
    },
    world(ctx, L, v, z, t) {
      if (L.def.world.shape === 'circle') { const R = L.W / 2; if (circleView(v, R, R, R) === 'edge') { ctx.beginPath(); ctx.arc(R, R, R, 0, TAU); ctx.lineWidth = 6 / z; ctx.strokeStyle = 'rgba(190,75,219,0.5)'; ctx.stroke(); } }
    },
  },
  station: {
    screen(ctx, L, sw, sh, t) { LevelBG.space.screen(ctx, L, sw, sh, t); },
    world(ctx, L, v, z, t) {
      circleWorld(ctx, L, v, z, (x, y, w, h) => BG.fillPattern(ctx, 'metal', 600, x, y, w, h, z), null, R => { ctx.beginPath(); ctx.arc(R, R, R, 0, TAU); ctx.lineWidth = R * 0.02; ctx.strokeStyle = '#be4bdb'; ctx.stroke(); });
    },
  },
};
LevelBG.table = LevelBG.rectPat('wood', 600, '#2b2118');
LevelBG.office = LevelBG.rectPat('floortiles', 260, '#1d1f26');
LevelBG.workshop = LevelBG.rectPat('concrete', 900, '#1d1f26');
LevelBG.city = LevelBG.rectPat('grass', 700, '#1d2b1d');
LevelBG.sewer = LevelBG.rectPat('sewer', 500, '#0d0f12');
LevelBG.base = LevelBG.rectPat('dirt', 900, '#2b2418');
LevelBG.ocean = LevelBG.rectPat('ocean', 1400, '#06233f');
LevelBG.volcano = LevelBG.rectPat('volcrock', 1000, '#1a120e');
LevelBG.earth = LevelBG.rectPat('ocean', 3000, '#06233f');
