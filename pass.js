/* ================= PASS DELLA STAGIONE =================
   Ogni mese una stagione nuova: 30 livelli, si sale giocando e con le sfide del giorno.
   Premi gratis per tutti; il Pass d'oro (si compra con i carlini) aggiunge un secondo premio a ogni livello. */
const PASS_LV = 30, PASS_STEP = 100, PASS_GOLD = 1500;
const PASS_MONTHS = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
const PASS_NAMES = ['della Befana', 'di Carnevale', 'di San Giuseppe', 'della Pasqua', 'delle Rose', 'di San Giovanni', 'del Mare', 'di Ferragosto', 'della Vendemmia', 'delle Castagne', 'di San Martino', 'del Presepe'];
/* punti per ogni cosa che fai */
const PASS_PTS = { win: 25, lose: 10, olwin: 40, ollose: 15, fish_caught: 8, drink_order: 15, weave_done: 20, mg_sell: 10, daily_gift: 20, tour_end: 30 };
/* le sfide del giorno: 3 a caso, ognuna vale 60 punti */
const PASS_MISSIONS = [
  { id: 'play3', t: 'Gioca 3 partite a carte', n: 3, ev: 'game' },
  { id: 'win2', t: 'Vinci 2 partite a carte', n: 2, ev: 'win' },
  { id: 'scopa1', t: 'Vinci una partita a scopa', n: 1, ev: 'win_scopa' },
  { id: 'bris1', t: 'Vinci una partita a briscola', n: 1, ev: 'win_briscola' },
  { id: 'online1', t: 'Gioca una partita online', n: 1, ev: 'ol' },
  { id: 'olwin1', t: 'Vinci una partita online', n: 1, ev: 'olwin' },
  { id: 'tour1', t: 'Gioca un torneo', n: 1, ev: 'tour_join' },
  { id: 'fish3', t: 'Pesca 3 pesci', n: 3, ev: 'fish_caught', need: () => typeof pesca === 'function' && pesca().total > 0 },
  { id: 'drink1', t: 'Completa un ordine di BergoDrink', n: 1, ev: 'drink_order', need: () => !!(eco().drink && eco().drink.done) },
  { id: 'sell2', t: 'Vendi 2 ordini al salumificio', n: 2, ev: 'mg_sell', need: () => !!(eco().merge && eco().merge.sold) },
  { id: 'weave1', t: 'Tessi qualcosa al telaio', n: 1, ev: 'weave_done', need: () => !!(eco().loom && eco().loom.total) },
];
const PASS_MISSION_PTS = 60;
const passSeason = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); };
const passDay = () => new Date().toDateString();
function passState() {
  const s = passSeason();
  if (!P.pass || P.pass.s !== s) P.pass = { s, pp: 0, gold: false, cf: [], cg: [], day: '', ms: [] };
  const T = P.pass;
  if (T.day !== passDay()) {
    const pool = PASS_MISSIONS.filter((m) => !m.need || (() => { try { return m.need(); } catch (e) { return false; } })()).sort(() => Math.random() - 0.5);
    T.day = passDay(); T.ms = pool.slice(0, 3).map((m) => ({ id: m.id, c: 0, ok: false }));
  }
  return T;
}
const passLv = (T) => Math.min(PASS_LV, Math.floor(T.pp / PASS_STEP));
function passReward(lv, gold) {
  if (lv === PASS_LV && gold) return { chest: 'oro', c: 500, title: 'Campione della stagione' };
  if (lv % 5 === 0) return gold ? { chest: lv >= 15 ? 'oro' : 'argento', c: 100 + lv * 5 } : { chest: lv >= 20 ? 'oro' : lv >= 10 ? 'argento' : 'rame' };
  return { c: gold ? 80 + lv * 6 : 40 + lv * 4 };
}
const passRewTxt = (r) => [r.chest ? GRADES[r.chest].name : '', r.c ? r.c + ' 🪙' : '', r.title ? '“' + r.title + '”' : ''].filter(Boolean).join(' + ');
function passGive(r) {
  const E = eco();
  if (r.c) E.carlini += r.c;
  if (r.chest) { if (E.chests.length < SLOTS) E.chests.push({ id: 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), grade: r.chest, start: null, end: null, sped: false }); else E.carlini += r.chest === 'oro' ? 500 : r.chest === 'argento' ? 200 : 80; }
  if (r.title) { if (!P.titles) P.titles = []; if (!P.titles.includes(r.title + ' · ' + PASS_MONTHS[new Date().getMonth()])) P.titles.push(r.title + ' · ' + PASS_MONTHS[new Date().getMonth()]); }
}
/* aggiunge punti e, se si sale di livello, lo dice */
function passAdd(pts) {
  if (!pts) return;
  const T = passState(), before = passLv(T);
  T.pp = Math.min(PASS_LV * PASS_STEP, T.pp + pts);
  const after = passLv(T);
  save();
  if (after > before) setTimeout(() => { flash('Pass: livello ' + after + '!'); fx('big'); }, 900);
  passBadge();
}
function passEvent(ev, extra) {
  const T = passState();
  let changed = false;
  for (const m of T.ms) {
    const d = PASS_MISSIONS.find((x) => x.id === m.id); if (!d || m.c >= d.n) continue;
    if (d.ev === ev || (extra && extra.includes(d.ev))) { m.c++; changed = true; if (m.c >= d.n) setTimeout(() => flash('Missione del Pass completata!'), 1600); }
  }
  if (changed) { save(); passBadge(); }
}
/* aggancio agli eventi che il gioco già registra */
(() => {
  const oldTrack = track;
  track = function (name, params) {
    try {
      const p = params || {};
      if (name === 'game_end') { const g = p.game || ''; passAdd(p.won ? PASS_PTS.win : PASS_PTS.lose); passEvent('game', p.won ? ['win', 'win_' + g] : null); }
      else if (PASS_PTS[name]) { passAdd(PASS_PTS[name]); passEvent(name); }
      else if (name === 'tour_join') passEvent('tour_join');
    } catch (e) { /* niente */ }
    return oldTrack.apply(this, arguments);
  };
  if (typeof endOnline === 'function') {
    const oldEnd = endOnline;
    endOnline = function () {
      const d = OL.room, done = OL.ended;
      const r = oldEnd.apply(this, arguments);
      try {
        if (d && !done && !d.bot) {
          const me = typeof myT === 'function' ? myT() : meIdx(), won = d.winner === me;
          passAdd(won ? PASS_PTS.olwin : PASS_PTS.ollose); passEvent('ol', won ? ['olwin'] : null);
        }
      } catch (e) { /* niente */ }
      return r;
    };
  }
  if (typeof sellOrder === 'function') {
    const oldSell = sellOrder;
    sellOrder = function (id) {
      const M = MG(), before = M.sold;
      const r = oldSell.apply(this, arguments);
      try { if (MG().sold > before) { passAdd(PASS_PTS.mg_sell); passEvent('mg_sell'); } } catch (e) { /* niente */ }
      return r;
    };
  }
})();
function passTodo() {
  const T = passState(), lv = passLv(T);
  let n = 0;
  for (let i = 1; i <= lv; i++) { if (!T.cf.includes(i)) n++; if (T.gold && !T.cg.includes(i)) n++; }
  n += T.ms.filter((m) => { const d = PASS_MISSIONS.find((x) => x.id === m.id); return d && m.c >= d.n && !m.ok; }).length;
  return n;
}
function passBadge() {
  const b = $('passHomeBadge'), T = passState();
  if (b) { const n = passTodo(); b.textContent = n || ''; b.hidden = !n; }
  const l = $('passHomeLv'); if (l) l.textContent = 'Livello ' + passLv(T) + ' di ' + PASS_LV;
}
function passDaysLeft() { const d = new Date(), end = new Date(d.getFullYear(), d.getMonth() + 1, 1); return Math.max(1, Math.ceil((end - d) / 864e5)); }

/* ---------- schermata ---------- */
function renderPass() {
  const box = $('passBox'); if (!box) return;
  const T = passState(), lv = passLv(T), mo = new Date().getMonth(), inLv = T.pp - lv * PASS_STEP, maxed = lv >= PASS_LV;
  let h = '<div class="pshero"><div class="pslv"><small>Livello</small><b>' + lv + '</b></div><div class="psht"><small>Stagione ' + PASS_NAMES[mo] + '</small><b>Pass di ' + PASS_MONTHS[mo] + '</b>' +
    '<div class="psbar"><i style="width:' + (maxed ? 100 : Math.round(inLv / PASS_STEP * 100)) + '%"></i></div><span>' + (maxed ? 'Hai finito il pass: complimenti!' : inLv + ' / ' + PASS_STEP + ' punti per il livello ' + (lv + 1)) + ' · finisce tra ' + passDaysLeft() + ' giorni</span></div></div>';
  if (!T.gold) h += '<div class="psgold"><span class="psgi">👑</span><div><b>Pass d’oro</b><small>Un secondo premio a ogni livello: più carlini, bauli d’oro e il titolo di “Campione della stagione” al livello 30. Prendi anche i premi dei livelli già fatti.</small></div><button class="btn take small" data-psgold="1"' + (eco().carlini >= PASS_GOLD ? '' : ' disabled') + '>' + PASS_GOLD + ' 🪙</button></div>';
  h += '<h4 class="clansub">Missioni di oggi <small>· ' + PASS_MISSION_PTS + ' punti l’una</small></h4><div class="psms">' + T.ms.map((m, i) => {
    const d = PASS_MISSIONS.find((x) => x.id === m.id); if (!d) return '';
    const done = m.c >= d.n;
    return '<div class="psm' + (m.ok ? ' ok' : done ? ' done' : '') + '"><span class="psmc">' + (m.ok ? '✓' : Math.min(m.c, d.n) + '/' + d.n) + '</span><span class="psmt">' + d.t + '<i style="width:' + Math.round(Math.min(1, m.c / d.n) * 100) + '%"></i></span>' + (m.ok ? '<em>Fatto</em>' : '<button class="btn small' + (done ? ' take' : '') + '" data-psm="' + i + '"' + (done ? '' : ' disabled') + '>+' + PASS_MISSION_PTS + '</button>') + '</div>';
  }).join('') + '</div><p class="pznote">Punti anche giocando: ' + PASS_PTS.win + ' per ogni vittoria a carte, ' + PASS_PTS.olwin + ' online, e qualcosa per pesca, salumificio, BergoDrink e telaio. Domani arrivano sfide nuove.</p>';
  h += '<div class="pstrack"><div class="psthead"><span></span><b>Gratis</b><b class="g">👑 Oro</b></div>';
  for (let i = 1; i <= PASS_LV; i++) {
    const rf = passReward(i, false), rg = passReward(i, true), got = i <= lv;
    const cell = (r, kind) => {
      const taken = (kind === 'f' ? T.cf : T.cg).includes(i), lock = kind === 'g' && !T.gold;
      const can = got && !taken && !lock;
      return '<button class="psrew ' + kind + (taken ? ' taken' : can ? ' can' : '') + (lock ? ' lock' : '') + '" data-psr="' + kind + i + '"' + (can ? '' : ' disabled') + '>' + (r.chest ? '<span class="pschest">' + chestSVG(r.chest) + '</span>' : '<span class="pscoin">🪙</span>') + '<small>' + passRewTxt(r) + '</small>' + (taken ? '<em>✓</em>' : lock ? '<em>🔒</em>' : '') + '</button>';
    };
    h += '<div class="psrow' + (got ? ' got' : '') + (i === lv + 1 ? ' next' : '') + '"><span class="psn">' + i + '</span>' + cell(rf, 'f') + cell(rg, 'g') + '</div>';
  }
  h += '</div>';
  if (P.titles && P.titles.length) h += '<h4 class="clansub">I tuoi titoli</h4><div class="pstitles">' + P.titles.map((t) => '<span>👑 ' + esc(t) + '</span>').join('') + '</div>';
  box.innerHTML = h;
  passBadge();
}
function passClick(e) {
  const T = passState();
  if (e.target.closest('[data-psgold]')) {
    const E = eco(); if (T.gold || E.carlini < PASS_GOLD) return;
    overlay('<h2>Prendere il Pass d’oro?</h2><p>Costa <b>' + PASS_GOLD + ' carlini</b> e vale fino alla fine di ' + PASS_MONTHS[new Date().getMonth()].toLowerCase() + '. Il mese prossimo inizia una stagione nuova.</p><button class="btn take" id="psgYes">Prendo il Pass d’oro</button><button class="btn alt" id="psgNo">Non ora</button>');
    $('psgNo').onclick = () => { $('layer').innerHTML = ''; };
    $('psgYes').onclick = () => { $('layer').innerHTML = ''; const E2 = eco(); if (E2.carlini < PASS_GOLD) return; E2.carlini -= PASS_GOLD; T.gold = true; save(); fx('big'); flash('Pass d’oro!'); renderPass(); if (typeof renderRes === 'function') renderRes(); if (typeof track === 'function') track('pass_gold', {}); };
    return;
  }
  const m = e.target.closest('[data-psm]');
  if (m && !m.disabled) { const x = T.ms[+m.dataset.psm], d = x && PASS_MISSIONS.find((y) => y.id === x.id); if (!x || x.ok || x.c < d.n) return; x.ok = true; passAdd(PASS_MISSION_PTS); fx('take'); renderPass(); return; }
  const r = e.target.closest('[data-psr]');
  if (r && !r.disabled) {
    const kind = r.dataset.psr[0], i = +r.dataset.psr.slice(1), list = kind === 'f' ? T.cf : T.cg;
    if (i > passLv(T) || list.includes(i) || (kind === 'g' && !T.gold)) return;
    list.push(i); passGive(passReward(i, kind === 'g')); save(); fx('take'); flash(passRewTxt(passReward(i, kind === 'g')));
    renderPass(); if (typeof renderRes === 'function') renderRes();
  }
}
(() => {
  if (!$('vPass')) {
    const s = document.createElement('section'); s.className = 'view'; s.id = 'vPass'; s.hidden = true;
    s.innerHTML = '<div class="topbar"><h2>Pass</h2><span class="tbr"><button class="btn ghost small" id="passRules">Regole</button><button class="btn ghost small" data-go="vHome">Menu</button></span></div><div class="sheetv" id="passBox"></div>';
    $('vHome').parentNode.insertBefore(s, $('vHome').nextSibling);
    s.addEventListener('click', passClick);
    $('passRules').addEventListener('click', () => { if (!ND.open) showNduja('pass'); });
  }
  const oldGo = go;
  go = function (v) {
    oldGo(v);
    $('vPass').hidden = v !== 'vPass';
    if (v === 'vPass') { renderPass(); if (!ndSeen('pass') && !ND.open) setTimeout(() => { if (view === 'vPass' && !ND.open) showNduja('pass'); }, 400); }
    if (v === 'vHome') passBadge();
  };
  try { passBadge(); } catch (e) { /* niente */ }
})();
