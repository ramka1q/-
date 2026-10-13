'use strict';
// ============================================================
//  БОССЫ: Пылесос-9000 (Даня), Т-Димон (Дима),
//  Мозг-Станция и Мега-Мех профессора Молгелевича
// ============================================================

// ---------------- Пылесос-9000 ----------------
BEH.boss_vacuum = (it, dt, L) => {
  const P = L.P, D = it.data;
  D.st = D.st || 'sleep';
  D.t = (D.t || 0) + dt;
  D.hitCd = Math.max(0, (D.hitCd || 0) - dt);
  D.brush = (D.brush || 0) + dt * (D.st === 'charge' ? 30 : 12);
  if (D.st === 'sleep') { if (L.flags.bossStart) { D.st = 'roam'; D.t = 0; it.showBar = true; } return; }
  if (D.st === 'dead') return;
  const toP = U.angle(it.x, it.y, P.x, P.y);
  it.hz = D.st === 'stun' ? 0 : D.st === 'charge' ? 0.13 : 0.06;
  if (D.st === 'roam') {
    it.heading += U.clamp(U.angDiff(it.heading, toP), -1.3 * dt, 1.3 * dt);
    const s = it.r * (it.hp <= 1 ? 1.2 : 0.85);
    L.moveActor(it, Math.cos(it.heading) * s, Math.sin(it.heading) * s, dt);
    // всасывание
    const d = U.dist(it.x, it.y, P.x, P.y), len = it.r * 4.5;
    const da = Math.abs(U.angDiff(it.heading, toP));
    D.suck = d < len && da < 0.7;
    if (D.suck && P.dashT <= 0) { const f = P.r * BASE_SPD * 0.55 * (1 - d / len); L.pushX -= Math.cos(toP) * f; L.pushY -= Math.sin(toP) * f; }
    for (const o of L.items) if (!o.dead && !o.boss && o.r < it.r * 0.25 && U.dist(it.x, it.y, o.x, o.y) < len && Math.abs(U.angDiff(it.heading, U.angle(it.x, it.y, o.x, o.y))) < 0.7) {
      const a = U.angle(o.x, o.y, it.x, it.y); o.x += Math.cos(a) * it.r * 2 * dt; o.y += Math.sin(a) * it.r * 2 * dt;
      if (U.dist(o.x, o.y, it.x, it.y) < it.r) { o.dead = true; L.part('smoke', o.x, o.y, 0, 0, o.r, 'rgba(120,120,120,0.5)', 0.5); }
    }
    if (D.t > (it.hp <= 1 ? 3 : 4.5)) { D.st = 'aim'; D.t = 0; it.say = { text: U.pick(['ВТЯГИВАЮ!', 'ЦЕЛЬ: НИКИТА', 'БЗЗЗЗЗ!', 'ПЫЛЬ ОБНАРУЖЕНА']), t: 1.5 }; Sound.play('warn'); }
  } else if (D.st === 'aim') {
    it.heading += U.clamp(U.angDiff(it.heading, toP), -3 * dt, 3 * dt);
    if (D.t > 0.9) { D.st = 'charge'; D.t = 0; Sound.play('dash'); }
  } else if (D.st === 'charge') {
    const s = it.r * 5.2;
    const hit = L.moveActor(it, Math.cos(it.heading) * s, Math.sin(it.heading) * s, dt);
    let pillar = false;
    for (const o of L.items) if (o.pillar && U.dist(it.x, it.y, o.x, o.y) < it.r + o.r) { pillar = true; const a = U.angle(o.x, o.y, it.x, it.y); it.x = o.x + Math.cos(a) * (it.r + o.r); it.y = o.y + Math.sin(a) * (it.r + o.r); }
    if (hit || pillar) {
      D.st = 'stun'; D.t = 0; L.cam.shake = 18; Sound.play('boom');
      L.burst(it.x + Math.cos(it.heading) * it.r, it.y + Math.sin(it.heading) * it.r, 20, '#ffd43b', it.r * 3, it.r * 0.08);
      L.toast('Пылесос оглушён! Бей рывком!', '#ffd43b', 2);
    } else if (D.t > 2.4) { D.st = 'roam'; D.t = 0; }
  } else if (D.st === 'stun') {
    if (D.t > 2.8) { D.st = 'roam'; D.t = 0; }
  }
};
function vacuumHit(L, it) {
  const D = it.data;
  if (D.st !== 'stun' || D.hitCd > 0) return;
  D.hitCd = 1; it.hp--;
  L.cam.shake = 20; Sound.play('bosshit');
  L.burst(it.x, it.y, 30, '#adb5bd', it.r * 3, it.r * 0.12, 1);
  for (let i = 0; i < 6; i++) L.part('smoke', it.x, it.y, (Math.random() - 0.5) * it.r * 3, (Math.random() - 0.5) * it.r * 3, it.r * 0.4, 'rgba(110,110,110,0.6)', 1.2);
  if (it.hp <= 0) {
    D.st = 'dead'; Sound.play('boom');
    for (let i = 0; i < 26; i++) { const a = Math.random() * TAU, d = Math.random() * it.r * 1.5; L.spawn(U.pick(['vacpart', 'bolt', 'gear', 'chip', 'spring', 'battery']), it.x + Math.cos(a) * d, it.y + Math.sin(a) * d, L.P.r * U.rand(0.35, 0.8), { v: U.randInt(0, 3) }); }
    it.dead = true; L.flag('vacuumDead');
    L.radio('danya', 'Мой Пылесос-9000! Я собирал его три года… и два дня.', 'sad');
  } else { D.st = 'roam'; D.t = 0; L.toast('Попадание! Осталось: ' + it.hp, '#ff922b', 1.6); if (it.hp === 1) L.radio('danya', 'Режим ТУРБО! Пылесос, не подведи!', 'angry'); }
}
Draws.vacuum = (ctx, it, t, z, L) => {
  const D = it.data, r = it.r;
  ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.heading || 0);
  if (D.suck) { ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = '#e7f5ff'; ctx.beginPath(); ctx.moveTo(r * 0.8, 0); ctx.arc(0, 0, r * 4.5, -0.7, 0.7); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 0.5; for (let i = 0; i < 6; i++) { const k = ((t * 1.5 + i / 6) % 1); const d = r * 4.5 * (1 - k); line(ctx, d, -d * 0.4 * (i % 3 - 1), d - r * 0.3, -d * 0.4 * (i % 3 - 1) * 0.9, '#fff', r * 0.03); } ctx.restore(); }
  ctx.save(); ctx.globalAlpha = 0.3; circ(ctx, r * 0.08, r * 0.1, r * 1.02, '#000', null); ctx.restore();
  // мешок сзади
  const bagGlow = D.st === 'stun';
  ell(ctx, -r * 0.95, 0, r * 0.38, r * 0.5, 0, bagGlow ? (Math.sin(t * 12) > 0 ? '#ff6b6b' : '#ffa8a8') : '#868e96', OL, r * 0.05);
  // корпус
  circ(ctx, 0, 0, r, rg(ctx, 0, 0, r, ['#ffe066', '#fcc419', '#e67700']), OL, r * 0.05);
  circ(ctx, 0, 0, r * 0.72, '#343a40', OL, r * 0.03);
  ctx.beginPath(); ctx.arc(0, 0, r * 1.02, -0.9, 0.9); ctx.lineWidth = r * 0.12; ctx.strokeStyle = '#212529'; ctx.stroke();
  // щётки
  for (const s of [-1, 1]) { ctx.save(); ctx.translate(r * 0.7, s * r * 0.55); ctx.rotate(D.brush * s); for (let i = 0; i < 6; i++) { ctx.rotate(TAU / 6); line(ctx, 0, 0, r * 0.32, 0, '#adb5bd', r * 0.04); } circ(ctx, 0, 0, r * 0.08, '#495057', null); ctx.restore(); }
  // глаза-диоды
  const red = D.st === 'aim' || D.st === 'charge';
  for (const s of [-1, 1]) { circ(ctx, r * 0.42, s * r * 0.22, r * 0.12, red ? (Math.sin(t * 30) > 0 ? '#ff3b3b' : '#ffa8a8') : '#69db7c', OL, r * 0.03); }
  ctx.rotate(Math.PI / 2);
  ctx.fillStyle = '#ffd43b'; ctx.font = `900 ${r * 0.2}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('ДАНЯ-9000', 0, r * 0.15);
  ctx.restore();
  if (D.st === 'stun') for (let i = 0; i < 5; i++) { const a = t * 3 + i * TAU / 5; ctx.save(); ctx.translate(it.x + Math.cos(a) * r * 0.7, it.y + Math.sin(a) * r * 0.7); U.starPath(ctx, 0, 0, 5, r * 0.12, r * 0.05); fs(ctx, '#ffd43b', OL, r * 0.02); ctx.restore(); }
};

// ---------------- Т-ДИМОН ----------------
BEH.boss_tank = (it, dt, L) => {
  const P = L.P, D = it.data;
  D.st = D.st || 'sleep';
  if (D.st === 'sleep') { if (L.flags.bossStart) { D.st = 'fight'; it.showBar = true; L.radio('dima', 'Т-Димон, огонь! Никита, сдавайся по-хорошему!', 'angry'); } return; }
  if (D.st === 'dead') { if (Math.random() < 0.3) L.part('smoke', it.x + (Math.random() - 0.5) * it.r, it.y + (Math.random() - 0.5) * it.r, 0, -it.r * 0.5, it.r * 0.3, 'rgba(60,60,60,0.5)', 1.5); return; }
  const toP = U.angle(it.x, it.y, P.x, P.y);
  D.tur = D.tur === undefined ? toP : D.tur + U.clamp(U.angDiff(D.tur, toP), -1.5 * dt, 1.5 * dt);
  const d = U.dist(it.x, it.y, P.x, P.y);
  const rage = it.hp <= 2;
  // движение: держит дистанцию
  it.heading += U.clamp(U.angDiff(it.heading, toP + (d < it.r * 4 ? Math.PI : 0)), -0.6 * dt, 0.6 * dt);
  const s = it.r * (rage ? 0.6 : 0.4);
  if (d > it.r * 3) L.moveActor(it, Math.cos(it.heading) * s, Math.sin(it.heading) * s, dt);
  D.track = (D.track || 0) + dt * s * 0.05;
  // стрельба
  D.cd = (D.cd === undefined ? 2 : D.cd) - dt;
  if (D.cd <= 0) {
    D.cd = rage ? 2.2 : 3;
    const n = rage ? 3 : 1;
    for (let i = 0; i < n; i++) {
      const lead = 0.9;
      const tx = P.x + P.vx * lead + (i - (n - 1) / 2) * P.r * 3, ty = P.y + P.vy * lead + (i - (n - 1) / 2) * P.r * 1.5;
      L.warn(tx, ty, P.r * 1.8, 1.3, (L2, w) => {
        Sound.play('boom'); L2.cam.shake = Math.max(L2.cam.shake, 10);
        L2.burst(w.x, w.y, 18, '#ff922b', w.r * 2, w.r * 0.2);
        for (let k = 0; k < 4; k++) L2.part('smoke', w.x, w.y, (Math.random() - 0.5) * w.r * 2, (Math.random() - 0.5) * w.r * 2, w.r * 0.5, 'rgba(70,70,70,0.5)', 1);
        if (U.dist(w.x, w.y, L2.P.x, L2.P.y) < w.r + L2.P.r * 0.5) L2.hurt(0.12, w.x, w.y, 'shell');
      }, '#ff4d4d');
    }
    Sound.play('shoot'); D.recoil = 1;
  }
  D.ncd = (D.ncd === undefined ? 5 : D.ncd) - dt;
  if (rage && D.ncd <= 0) { D.ncd = 4; L.shoot(it.x + Math.cos(D.tur) * it.r * 1.2, it.y + Math.sin(D.tur) * it.r * 1.2, D.tur, P.r * 8, { k: 'net', r: P.r * 0.5, eff: 'stun', hz: 0, life: 3 }); }
  D.recoil = Math.max(0, (D.recoil || 0) - dt * 3);
  if (!it.say && Math.random() < dt * 0.12) it.say = { text: U.pick(['Огонь!', 'Никита, это для твоего же блага!', 'Т-Димон непобедим!', 'Перезарядка!', 'Где мои баки?!']), t: 2 };
};
function tankFuelEaten(L) {
  const B = L.byId.tank; if (!B || B.dead) return;
  B.hp--; L.cam.shake = 16; Sound.play('bosshit');
  L.burst(B.x, B.y, 20, '#ff922b', B.r * 2, B.r * 0.08);
  if (B.hp <= 0) {
    B.data.st = 'dead'; B.hz = 0; B.alwaysEat = true; B.noEat = false; B.showBar = false;
    L.toast('Т-ДИМОН ЗАГЛОХ! Съешь его!', '#ffd43b', 3); L.radio('dima', 'Топливо кончилось… Т-Димон, нет!', 'sad');
    B.mm = '#ffd43b';
  } else L.radio('dima', ['Эй! Это мой бак!', 'Только не второй бак!', 'Последний бак не трогай!'][3 - B.hp] || 'Эй!', 'shock');
}
Draws.tank = (ctx, it, t, z, L) => {
  const D = it.data, r = it.r;
  ctx.save(); ctx.translate(it.x, it.y);
  ctx.save(); ctx.globalAlpha = 0.3; rect(ctx, -r * 1.05 + r * 0.1, -r * 0.8 + r * 0.1, r * 2.1, r * 1.6, r * 0.15, '#000', null); ctx.restore();
  ctx.rotate(it.heading || 0);
  // гусеницы
  for (const s of [-1, 1]) {
    rect(ctx, -r * 1.05, s * r * 0.62 - r * 0.2, r * 2.1, r * 0.4, r * 0.15, '#212529', OL, r * 0.03);
    for (let i = 0; i < 12; i++) { const x = -r + ((i / 12 * r * 2 + (D.track || 0) * r * 0.5) % (r * 2)); line(ctx, x, s * r * 0.62 - r * 0.18, x, s * r * 0.62 + r * 0.18, '#495057', r * 0.04); }
  }
  rect(ctx, -r * 0.9, -r * 0.5, r * 1.8, r, r * 0.12, lg(ctx, 0, -r * 0.5, 0, r * 0.5, ['#7a8c48', '#5c6b38', '#3e4a24']), OL, r * 0.04);
  [[-0.5, -0.2, 0.18], [0.3, 0.25, 0.15], [0.55, -0.25, 0.12]].forEach(([x, y, s]) => circ(ctx, x * r, y * r, s * r, '#3e4a24', null));
  ctx.fillStyle = '#ffd43b'; ctx.font = `900 ${r * 0.18}px ${FONT}`; ctx.textAlign = 'center'; ctx.save(); ctx.rotate(Math.PI / 2); ctx.fillText('Т-ДИМОН', 0, r * 0.65); ctx.restore();
  ctx.rotate(-(it.heading || 0)); ctx.rotate(D.tur || 0);
  rect(ctx, r * 0.2 - (D.recoil || 0) * r * 0.15, -r * 0.1, r * 1.1, r * 0.2, r * 0.05, '#4a572d', OL, r * 0.03);
  circ(ctx, 0, 0, r * 0.42, '#5c6b38', OL, r * 0.04);
  ctx.restore();
  if (r * z > 10) Chars.portrait(ctx, 'dima', it.x, it.y, r * 0.26, { expr: D.st === 'dead' ? 'sad' : 'angry', t, talking: !!it.say });
  if (D.st === 'dead') { ctx.save(); ctx.globalAlpha = 0.4 + 0.3 * Math.sin(t * 6); circ(ctx, it.x, it.y, r * 1.2, null, '#ffd43b', r * 0.05); ctx.restore(); }
};

// ---------------- МОЗГ-СТАНЦИЯ МОЛГЕЛЕВИЧА ----------------
BEH.boss_mol = (it, dt, L) => {
  const P = L.P, D = it.data;
  D.ph = D.ph || 0;   // 0 — щит, 1 — мех, 2 — ярость, 3 — повержен
  D.t = (D.t || 0) + dt;
  D.hitCd = Math.max(0, (D.hitCd || 0) - dt);
  const C = L.W / 2;
  const toP = U.angle(it.x, it.y, P.x, P.y);
  const d = U.dist(it.x, it.y, P.x, P.y);
  if (D.ph === 0) {
    it.hz = 0.1; it.showBar = true;
    // вращающиеся лазеры заданы в уровне. Миньоны:
    D.spawn = (D.spawn === undefined ? 4 : D.spawn) - dt;
    if (D.spawn <= 0) { D.spawn = 5; const a = Math.random() * TAU; const mr = U.clamp(P.r * U.rand(0.6, 1.4), 15, 200); L.spawn('brainbot', it.x + Math.cos(a) * it.r * 1.2, it.y + Math.sin(a) * it.r * 1.2, mr, { always: true }); }
    const gens = L.items.filter(o => o.tag === 'gen' && !o.dead).length;
    it.hp = gens; it.maxHp = 4; it.phaseText = 'Фаза 1: съешь генераторы щита (' + (4 - gens) + '/4)';
    if (gens === 0) {
      D.ph = 1; D.t = 0; D.st = 'move'; it.hp = 5; it.maxHp = 5; it.r = 230; L.needSort = true;
      for (const l of L.lasers) l.on = false;
      L.cam.shake = 25; Sound.play('boom');
      L.radio('molgelevich', 'Щиты?! Ничего! Мой Мега-Мех раздавит тебя! АКТИВАЦИЯ!', 'evil');
      L.toast('ФАЗА 2: МЕГА-МЕХ', '#e599f7', 3);
      L.flag('phase2');
    }
    return;
  }
  if (D.ph === 1 || D.ph === 2) {
    const rage = D.ph === 2;
    D.st = D.st || 'move';
    it.phaseText = rage ? 'Фаза 3: ЯРОСТЬ — заставь его врезаться в край и бей рывком!' : 'Фаза 2: жди перегрева (купол светится) и бей рывком!';
    it.hz = (D.st === 'overheat' || D.st === 'stuck') ? 0 : 0.1;
    if (D.st === 'move') {
      const want = rage ? 0 : it.r * 3.5;
      const s = it.r * (rage ? 1.6 : 0.7);
      const k = d > want ? 1 : -0.6;
      it.heading = toP;
      L.moveActor(it, Math.cos(toP) * s * k, Math.sin(toP) * s * k, dt);
      if (!rage && D.t > 4) { D.st = 'barrage'; D.t = 0; D.shots = 0; }
      if (rage && D.t > 2.5) { D.st = 'aim'; D.t = 0; Sound.play('warn'); }
    } else if (D.st === 'barrage') {
      D.cd = (D.cd || 0) - dt;
      if (D.cd <= 0) {
        D.cd = 0.45; D.shots++;
        const n = 10;
        for (let i = 0; i < n; i++) { const a = i / n * TAU + D.shots * 0.3; L.shoot(it.x + Math.cos(a) * it.r, it.y + Math.sin(a) * it.r, a, P.r * 5, { k: 'wave', r: P.r * 0.45, hz: 0.08, edible: false, life: 5 }); }
        if (D.shots % 2 === 0) L.shoot(it.x, it.y, toP, P.r * 4, { k: 'missile', r: P.r * 0.4, hz: 0.1, homing: 1.4, life: 6, col: '#e599f7', edible: false });
        Sound.play('laser');
      }
      if (D.shots >= 6) { D.st = 'overheat'; D.t = 0; L.toast('ПЕРЕГРЕВ! Бей рывком в купол!', '#ffd43b', 2); Sound.play('alarm'); }
    } else if (D.st === 'overheat') {
      if (Math.random() < 0.4) L.part('smoke', it.x + (Math.random() - 0.5) * it.r, it.y + (Math.random() - 0.5) * it.r, 0, -it.r * 0.3, it.r * 0.25, 'rgba(255,200,100,0.4)', 1);
      if (D.t > 3.2) { D.st = 'move'; D.t = 0; }
    } else if (D.st === 'aim') {
      it.heading += U.clamp(U.angDiff(it.heading, toP), -2.5 * dt, 2.5 * dt);
      if (D.t > 0.8) { D.st = 'charge'; D.t = 0; Sound.play('dash'); }
    } else if (D.st === 'charge') {
      const s = it.r * 4.2;
      it.x += Math.cos(it.heading) * s * dt; it.y += Math.sin(it.heading) * s * dt;
      const ringR = L.data.ringR || L.W / 2;
      if (U.dist(it.x, it.y, C, C) > ringR - it.r) {
        const a = U.angle(C, C, it.x, it.y); it.x = C + Math.cos(a) * (ringR - it.r); it.y = C + Math.sin(a) * (ringR - it.r);
        D.st = 'stuck'; D.t = 0; L.cam.shake = 22; Sound.play('boom'); L.toast('Мех застрял! Рывок!', '#ffd43b', 1.6);
      } else if (D.t > 2.5) { D.st = 'move'; D.t = 0; }
    } else if (D.st === 'stuck') {
      if (D.t > 2.4) { D.st = 'move'; D.t = 0; }
    }
    // реплики
    if (!it.say && Math.random() < dt * 0.1) it.say = { text: U.pick(rage ? ['Я ГЕНИЙ!!!', 'Стой смирно!', 'Мой мозг больше твоего желудка!', 'АААРГХ!'] : ['Мой IQ — 300!', 'Ты — всего лишь эксперимент!', 'Кирилл, предатель!', 'Сыворотка — моя!']), t: 2.2 };
    return;
  }
};
function molHit(L, it) {
  const D = it.data;
  if (D.hitCd > 0) return;
  if (!((D.ph === 1 && D.st === 'overheat') || (D.ph === 2 && D.st === 'stuck'))) return;
  D.hitCd = 1.2; it.hp--;
  L.cam.shake = 24; Sound.play('bosshit');
  L.burst(it.x, it.y, 40, '#e599f7', it.r * 3, it.r * 0.1, 1);
  if (it.hp <= 0) {
    if (D.ph === 1) {
      D.ph = 2; D.st = 'move'; D.t = 0; it.hp = 3; it.maxHp = 3;
      L.radio('molgelevich', 'ДОВОЛЬНО! Режим ЯРОСТИ! Арена сжимается!', 'crazy');
      L.toast('ФАЗА 3: ЯРОСТЬ', '#ff6b6b', 3); L.flag('phase3');
    } else {
      D.ph = 3; D.st = 'down'; it.hz = 0; it.alwaysEat = true; it.noEat = false; it.showBar = false; it.beh = null;
      L.radio('molgelevich', 'Нет-нет-нет! Я же гений… Можно хотя бы печеньку?', 'sad');
      L.toast('Молгелевич повержен! СЪЕШЬ МЕХ!', '#69db7c', 3.5);
      it.mm = '#69db7c';
    }
  } else { D.st = 'move'; D.t = 0; L.toast('Попадание! Осталось: ' + it.hp, '#ff922b', 1.4); }
}
Draws.molboss = (ctx, it, t, z, L) => {
  const D = it.data, r = it.r;
  const ph = D.ph || 0;
  ctx.save(); ctx.translate(it.x, it.y);
  if (ph === 0) {
    // ядро станции со щитом
    const sh = 1 + Math.sin(t * 3) * 0.02;
    ctx.save(); ctx.globalAlpha = 0.25 + 0.1 * Math.sin(t * 5); circ(ctx, 0, 0, r * 1.25 * sh, '#be4bdb', '#e599f7', r * 0.03); ctx.restore();
    for (let i = 0; i < 8; i++) { ctx.save(); ctx.rotate(i * TAU / 8 + t * 0.2); rect(ctx, r * 0.75, -r * 0.08, r * 0.35, r * 0.16, r * 0.04, '#495057', OL, r * 0.02); circ(ctx, r * 1.1, 0, r * 0.06, '#ff4d4d', null); ctx.restore(); }
    circ(ctx, 0, 0, r * 0.85, rg(ctx, 0, 0, r * 0.85, ['#6c757d', '#343a40', '#1b1b25']), OL, r * 0.03);
  } else {
    // мех: ноги-щупальца
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * TAU + Math.sin(t * 4 + i) * 0.15;
      ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(Math.cos(a + 0.3) * r * 0.9, Math.sin(a + 0.3) * r * 0.9, Math.cos(a) * r * 1.3, Math.sin(a) * r * 1.3);
      ctx.lineWidth = r * 0.16; ctx.strokeStyle = OL; ctx.stroke(); ctx.lineWidth = r * 0.11; ctx.strokeStyle = '#5f3dc4'; ctx.stroke();
      circ(ctx, Math.cos(a) * r * 1.3, Math.sin(a) * r * 1.3, r * 0.12, '#343a40', OL, r * 0.03);
    }
    circ(ctx, 0, 0, r * 0.9, rg(ctx, 0, 0, r * 0.9, ['#9775fa', '#5f3dc4', '#2b1a6b']), OL, r * 0.04);
    const hot = (ph === 1 && D.st === 'overheat') || (ph === 2 && D.st === 'stuck');
    if (hot) { ctx.save(); ctx.globalAlpha = 0.4 + 0.3 * Math.sin(t * 20); circ(ctx, 0, 0, r * 0.8, '#ff922b', null); ctx.restore(); }
    if (D.st === 'aim' || D.st === 'charge') { ctx.save(); ctx.globalAlpha = 0.5; circ(ctx, 0, 0, r * 1.05, null, '#ff4d4d', r * 0.06); ctx.restore(); }
  }
  // стеклянный купол с мозгом и профессором
  const dr = r * (ph === 0 ? 0.62 : 0.6);
  circ(ctx, 0, 0, dr, U.rgba('#e7f5ff', 0.35), OL, r * 0.03);
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, dr, 0, TAU); ctx.clip();
  blob(ctx, 0, -dr * 0.35, dr * 0.55, 12, 0.08, 3, '#ff8fab', '#c2255c', r * 0.015);
  ctx.strokeStyle = '#c2255c'; ctx.lineWidth = r * 0.012;
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(-dr * 0.25 + i * dr * 0.17, -dr * 0.4, dr * 0.12, 0, Math.PI * 1.3); ctx.stroke(); }
  if (r * z > 30) Chars.draw(ctx, 'molgelevich', { x: 0, y: dr * 0.95, scale: dr / 70, t, expr: ph === 3 ? 'sad' : D.st === 'overheat' || D.st === 'stuck' ? 'shock' : 'evil', pose: ph === 3 ? 'facepalm' : 'point', talking: !!it.say, acc: false });
  ctx.restore();
  hl(ctx, -dr * 0.4, -dr * 0.5, dr * 0.3, dr * 0.12, 0.6);
  ctx.restore();
};
