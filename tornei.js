/* ================= TORNEI: coppe a eliminazione contro i personaggi del mazzo =================
   8 giocatori, tre turni (quarti, semifinale, finale). Le partite degli altri si decidono da sole. */
const TOUR_KINDS = {
  paese: { name: 'Torneo del Paese', sub: 'Tre partite a scopa', games: ['scopa', 'scopa', 'scopa'], fee: 40, lv: 1, ico: '🏅', c1: '#2F6E4A', c2: '#143524', prize: [{ chest: 'argento', c: 150 }, { c: 80 }, { c: 40 }] },
  prov: { name: 'Torneo della Provincia', sub: 'Tre partite a briscola', games: ['briscola', 'briscola', 'briscola'], fee: 100, lv: 4, ico: '🏆', c1: '#3E7CB1', c2: '#1F4466', prize: [{ chest: 'oro', c: 300 }, { chest: 'argento' }, { c: 100 }] },
  palluni: { name: 'Coppa du Palluni', sub: 'Tre partite a U Palluni: in parità si va ai supplementari', games: ['calcio', 'calcio', 'calcio'], fee: 80, lv: 2, ico: '⚽', c1: '#2E8B57', c2: '#14432A', prize: [{ chest: 'oro', c: 250 }, { chest: 'argento' }, { c: 80 }] },
  coppa: { name: 'Coppa Calabria', sub: 'Scopa, poi briscola, la finale a tressette', games: ['scopa', 'briscola', 'tressette'], fee: 250, lv: 8, ico: '👑', c1: '#C9922B', c2: '#6E4E12', prize: [{ chest: 'oro', c: 800 }, { chest: 'oro' }, { c: 250 }] },
};
const TOUR_ROUNDS = ['Quarti di finale', 'Semifinale', 'Finale'];
const TOUR_FOES = [
  { n: 'Turi u Pescaturi', av: 'pescatore', t: 'Scilla' }, { n: 'Comare Rosina', av: 'raccoglitrice', t: 'Reggio Calabria' },
  { n: 'Mastro Ciccio', av: 'impagliatore', t: 'Serra San Bruno' }, { n: 'Zu Peppe', av: 'zampognaro', t: 'San Giovanni in Fiore' },
  { n: 'Donna Carmela', av: 'pastaia', t: 'Tropea' }, { n: 'Ninetta', av: 'tessitrice', t: 'Longobucco' },
  { n: 'Saro u Casaru', av: 'casaro', t: 'Spezzano della Sila' }, { n: 'Micu u Massaru', av: 'massaro', t: 'Locri' },
  { n: 'Mimmo u Lanzaturi', av: 'lanzaturi', t: 'Bagnara Calabra' }, { n: 'Concetta', av: 'rammendatrice', t: 'Gerace' },
  { n: 'Totò u Cuntadinu', av: 'contadino', t: 'Rossano' }, { n: 'Rocco u Pasturi', av: 'pastore', t: 'Delianuova' },
];
let tourPick = null;
const tourFirst = (n) => n.split(' ')[0] === 'Zu' || n.split(' ')[0] === 'Comare' || n.split(' ')[0] === 'Mastro' || n.split(' ')[0] === 'Donna' ? n.split(' ').slice(0, 2).join(' ') : n.split(' ')[0];
function tourWho(s) {
  if (s.f < 0) return { n: P.nick || 'Tu', short: 'Tu', av: P.av || 'mare', t: (typeof PZ_BY !== 'undefined' && P.paese && PZ_BY[P.paese]) ? (PZ_BY[P.paese] || { n: P.paese }).n : '', me: true };
  const f = TOUR_FOES[s.f]; return { n: f.n, short: tourFirst(f.n), av: f.av, t: f.t, me: false };
}
function tourNew(k) {
  const pool = TOUR_FOES.map((_, i) => i).sort(() => Math.random() - 0.5).slice(0, 7);
  const seats = [{ f: -1, sk: 0.5 }].concat(pool.map((f) => ({ f, sk: 0.3 + Math.random() * 0.5 })));
  const me = Math.floor(Math.random() * 8); [seats[0], seats[me]] = [seats[me], seats[0]];
  return { k, at: Date.now(), seats, rounds: [], r: 0, out: false, place: 0, claimed: false, playing: false };
}
const tourAlive = (T, r) => (r === 0 ? T.seats.map((_, i) => i) : T.rounds[r - 1]);
const tourMeSeat = (T) => T.seats.findIndex((s) => s.f < 0);
function tourMyMatch(T) {
  const al = tourAlive(T, T.r), me = tourMeSeat(T), i = al.indexOf(me);
  if (i < 0) return null;
  const j = i % 2 ? i - 1 : i + 1;
  return { me, foe: al[j] };
}
/* le partite degli altri: vince più spesso chi è più forte */
function tourSimRound(T, r, myWin) {
  const al = tourAlive(T, r), me = tourMeSeat(T), w = [];
  for (let i = 0; i < al.length; i += 2) {
    const a = al[i], b = al[i + 1];
    if (a === me || b === me) { w.push(myWin ? me : (a === me ? b : a)); continue; }
    const pa = 0.5 + (T.seats[a].sk - T.seats[b].sk) * 0.7;
    w.push(Math.random() < pa ? a : b);
  }
  T.rounds[r] = w;
}
function tourFinish(T, place) {
  T.out = true; T.place = place;
  for (let r = T.rounds.length; r < 3; r++) tourSimRound(T, r, false);
  if (place === 1) { if (!P.troph) P.troph = {}; P.troph[T.k] = (P.troph[T.k] || 0) + 1; }
}
/* il risultato della mia partita */
function tourResult(won) {
  const T = P.tour; if (!T || T.out) return '';
  T.playing = false;
  tourSimRound(T, T.r, won);
  let msg;
  if (!won) { tourFinish(T, [5, 3, 2][T.r]); msg = T.r === 2 ? 'Finale persa: secondo posto!' : T.r === 1 ? 'Eliminato in semifinale' : 'Eliminato ai quarti'; }
  else if (T.r === 2) { tourFinish(T, 1); msg = 'Hai vinto il ' + TOUR_KINDS[T.k].name + '!'; }
  else { T.r++; msg = 'Passi il turno: ora ' + TOUR_ROUNDS[T.r].toLowerCase() + '!'; }
  save();
  return msg;
}
/* chiamata da award(): solo se la partita era del torneo */
function tourOnAward(game, won) {
  const tf = window.TOUR_FIGHT; window.TOUR_FIGHT = null;
  if (!tf || !P.tour || !P.tour.playing) return [];
  const msg = tourResult(won);
  window.TOUR_RETURN = true;
  setTimeout(() => {
    const nb = $('nb'), mb = $('mb');
    if (nb) nb.hidden = true;
    if (mb) { mb.textContent = 'Torna al torneo'; mb.classList.remove('alt'); }
  }, 0);
  return msg ? ['🏆 ' + msg] : [];
}
function tourPrizeTxt(p) { return [p.chest ? GRADES[p.chest].name.toLowerCase() : '', p.c ? p.c + ' carlini' : ''].filter(Boolean).join(' e '); }
function tourClaim() {
  const T = P.tour; if (!T || !T.out || T.claimed) return;
  const K = TOUR_KINDS[T.k], p = K.prize[{ 1: 0, 2: 1, 3: 2 }[T.place]];
  T.claimed = true;
  if (p) {
    const E = eco();
    if (p.c) E.carlini += p.c;
    if (p.chest) { if (E.chests.length < SLOTS) E.chests.push({ id: 'c' + Date.now().toString(36), grade: p.chest, start: null, end: null, sped: false }); else E.carlini += p.chest === 'oro' ? 500 : 200; }
    fx('big'); flash(T.place === 1 ? 'Campione!' : 'Premio ritirato!');
  }
  save(); renderTornei();
  if (typeof track === 'function') track('tour_end', { kind: T.k, place: T.place });
}

/* ---------- schermata ---------- */
function tourBracket(T) {
  const col = (r) => {
    const al = tourAlive(T, r), win = T.rounds[r] || [];
    let h = '<div class="tbcol"><small>' + ['Quarti', 'Semi', 'Finale'][r] + '</small>';
    for (let i = 0; i < al.length; i += 2) {
      h += '<div class="tbm">' + [al[i], al[i + 1]].map((s) => { const w = tourWho(T.seats[s]), lost = T.rounds[r] && !win.includes(s); return '<span class="tbp' + (w.me ? ' me' : '') + (lost ? ' lost' : '') + '"><img src="' + AVIMG[w.av] + '" alt=""><b>' + esc(w.short) + '</b></span>'; }).join('') + '</div>';
    }
    return h + '</div>';
  };
  let h = '<div class="tbracket">';
  for (let r = 0; r < 3; r++) h += r <= T.rounds.length && (r === 0 || T.rounds[r - 1]) ? col(r) : '<div class="tbcol"><small>' + ['Quarti', 'Semi', 'Finale'][r] + '</small>' + '<div class="tbm"><span class="tbp tbd"><i>?</i></span><span class="tbp tbd"><i>?</i></span></div>'.repeat(r === 1 ? 2 : 1) + '</div>';
  const ch = T.rounds[2] ? tourWho(T.seats[T.rounds[2][0]]) : null;
  h += '<div class="tbcol tbch"><small>Campione</small><div class="tbcup">' + (ch ? '<img src="' + AVIMG[ch.av] + '" alt=""><b>' + esc(ch.short) + '</b>' : '<span>🏆</span>') + '</div></div></div>';
  return h;
}
let TOUR_TAB = 'cpu';
function renderTornei() {
  const box = $('torneiBox'); if (!box) return;
  box.innerHTML = '<div class="ttabs" role="tablist"><button role="tab" aria-selected="' + (TOUR_TAB === 'cpu') + '" data-ttab="cpu"><span>🎴</span>Contro il computer</button><button role="tab" aria-selected="' + (TOUR_TAB === 'amici') + '" data-ttab="amici"><span>🤝</span>Tra amici' + (P.ft && P.ft.code ? ' <i class="tdot"></i>' : '') + '</button></div><div id="tourBody"></div>';
  if (TOUR_TAB === 'amici') ftRender(); else { ftStop(); renderTourCpu(); }
}
function renderTourCpu() {
  const box = $('tourBody'); if (!box) return;
  const T = P.tour, E = eco(), L = levelOf(P.xp);
  if (T && T.playing && !(G && !G.over)) { tourResult(false); flash('Eliminato!'); }
  if (T && !(T.out && T.claimed)) {
    const K = TOUR_KINDS[T.k];
    let h = '<div class="thero" style="--c1:' + K.c1 + ';--c2:' + K.c2 + '"><span class="thico">' + K.ico + '</span><div><b>' + K.name + '</b><small>' + K.sub + '</small></div></div>' + tourBracket(T);
    if (!T.out) {
      const m = tourMyMatch(T), foe = tourWho(T.seats[m.foe]), game = K.games[T.r];
      h += '<div class="tnext"><small>' + TOUR_ROUNDS[T.r] + ' · ' + (GAMES[game] || (game === 'calcio' ? 'U Palluni' : game)) + '</small><div class="tvs"><span class="tvp me"><img src="' + AVIMG[P.av] + '" alt=""><b>' + esc(P.nick || 'Tu') + '</b></span><em>VS</em><span class="tvp"><img src="' + AVIMG[foe.av] + '" alt=""><b>' + esc(foe.n) + '</b><small>da ' + esc(foe.t) + '</small></span></div>' +
        '<button class="btn take" data-tplay="1">Gioca la ' + (T.r === 2 ? 'finale' : 'partita') + '</button><small class="pznote">Le partite del torneo non consumano energia. Se esci a metà partita sei eliminato.</small></div>' +
        '<button class="btn ghost small tquit" data-tquit="1">Ritirati dal torneo</button>';
    } else {
      const p = K.prize[{ 1: 0, 2: 1, 3: 2 }[T.place]];
      h += '<div class="tend p' + T.place + '"><span class="tendic">' + (T.place === 1 ? '🏆' : T.place === 2 ? '🥈' : T.place === 3 ? '🥉' : '🎴') + '</span><b>' + (T.place === 1 ? 'Campione!' : T.place === 2 ? 'Secondo posto' : T.place === 3 ? 'Semifinalista' : 'Fuori ai quarti') + '</b>' +
        '<p>' + (p ? 'Premio: ' + tourPrizeTxt(p) + '.' : 'Stavolta niente premio: riprova, la fortuna gira!') + '</p><button class="btn take" data-tclaim="1">' + (p ? 'Ritira il premio' : 'Chiudi il torneo') + '</button></div>';
    }
    box.innerHTML = h;
    return;
  }
  const tr = P.troph || {};
  let h = '<div class="ttrophy">' + Object.keys(TOUR_KINDS).map((k) => '<span><i>' + TOUR_KINDS[k].ico + '</i><b>' + (tr[k] || 0) + '</b><small>' + TOUR_KINDS[k].name.replace('Torneo della ', '').replace('Torneo del ', '') + '</small></span>').join('') + '</div>';
  h += '<p class="clanhint">Otto giocatori, tre partite: quarti, semifinale e finale. Vinci tutto e porti a casa la coppa.</p>';
  h += Object.keys(TOUR_KINDS).map((k) => {
    const K = TOUR_KINDS[k], lock = L < K.lv, poor = E.carlini < K.fee;
    return '<div class="tcard' + (lock ? ' lock' : '') + '" style="--c1:' + K.c1 + ';--c2:' + K.c2 + '"><div class="tctop"><span class="thico">' + K.ico + '</span><div><b>' + K.name + '</b><small>' + K.sub + '</small></div></div>' +
      '<ul class="tprize"><li><span>🥇</span>' + tourPrizeTxt(K.prize[0]) + '</li><li><span>🥈</span>' + tourPrizeTxt(K.prize[1]) + '</li><li><span>🥉</span>' + tourPrizeTxt(K.prize[2]) + '</li></ul>' +
      (lock ? '<button class="btn" disabled>🔒 Dal livello ' + K.lv + '</button>' : '<button class="btn take" data-tjoin="' + k + '"' + (poor ? ' disabled' : '') + '>Iscriviti · ' + K.fee + ' 🪙</button>') + '</div>';
  }).join('');
  box.innerHTML = h;
}
function tourPlay() {
  const T = P.tour; if (!T || T.out) return;
  const m = tourMyMatch(T), foe = tourWho(T.seats[m.foe]), game = TOUR_KINDS[T.k].games[T.r];
  T.playing = true; save();
  window.TOUR_FIGHT = { name: foe.n, av: foe.av, round: T.r };
  window.TOUR_RETURN = true;
  if (game === 'calcio' && typeof czTourStart === 'function') { czTourStart(foe, T.r); return; }
  startGame(game);
}
function torneiClick(e) {
  const tt = e.target.closest('[data-ttab]'); if (tt) { TOUR_TAB = tt.dataset.ttab; renderTornei(); return; }
  if (TOUR_TAB === 'amici' && ftClick(e)) return;
  const j = e.target.closest('[data-tjoin]');
  if (j && !j.disabled) {
    const K = TOUR_KINDS[j.dataset.tjoin], E = eco();
    if (E.carlini < K.fee) { flash('Non hai abbastanza carlini'); return; }
    E.carlini -= K.fee; P.tour = tourNew(j.dataset.tjoin); save(); fx('take'); renderTornei();
    if (typeof track === 'function') track('tour_join', { kind: j.dataset.tjoin });
    return;
  }
  if (e.target.closest('[data-tplay]')) { tourPlay(); return; }
  if (e.target.closest('[data-tclaim]')) { tourClaim(); return; }
  if (e.target.closest('[data-tquit]')) {
    overlay('<h2>Ritirarti dal torneo?</h2><p>Perdi l’iscrizione e il torneo finisce qui.</p><button class="btn" id="tqYes">Mi ritiro</button><button class="btn alt" id="tqNo">Continuo</button>');
    $('tqYes').onclick = () => { $('layer').innerHTML = ''; const T = P.tour; if (T && !T.out) { tourSimRound(T, T.r, false); tourFinish(T, 5); T.claimed = true; save(); } renderTornei(); };
    $('tqNo').onclick = () => { $('layer').innerHTML = ''; };
  }
}

/* ---------- aggancio ---------- */
(() => {
  if (!$('vTornei')) {
    const s = document.createElement('section'); s.className = 'view'; s.id = 'vTornei'; s.hidden = true;
    s.innerHTML = '<div class="topbar"><h2>Tornei</h2><span class="tbr"><button class="btn ghost small" id="torneiRules">Regole</button><button class="btn ghost small" data-go="vHome">Menu</button></span></div><div class="sheetv" id="torneiBox"></div>';
    $('vHome').parentNode.insertBefore(s, $('vHome').nextSibling);
    s.addEventListener('click', torneiClick);
    $('torneiRules').addEventListener('click', () => { if (!ND.open) showNduja('tornei'); });
  }
  const oldGo = go;
  go = function (v) {
    if (v === 'vHome' && window.TOUR_RETURN) { window.TOUR_RETURN = false; v = 'vTornei'; }
    oldGo(v);
    $('vTornei').hidden = v !== 'vTornei';
    if (v !== 'vTornei' && typeof ftStop === 'function') ftStop();
    if (v === 'vTornei') { renderTornei(); if (!ndSeen('tornei') && !ND.open) setTimeout(() => { if (view === 'vTornei' && !ND.open) showNduja('tornei'); }, 400); }
  };
})();

/* ================= TORNEO TRA AMICI (online, con codice) =================
   tours/{CODICE}: host, size (4|8), game, status (waiting|playing|done), players[], names{}, avs{},
   bracket[] (ordine dei posti), rooms{'turno-partita': id stanza}, res{'turno-partita': uid vincitore}, champ */
const FT_GAMES = { scopa: 'Scopa', briscola: 'Briscola', tressette: 'Tressette', calcio: 'U Palluni' };
const FT = { doc: null, unsub: null, code: '', err: '', busy: false, mk: { game: 'scopa', size: 4 }, waitRoom: null };
const ftOnline = () => !!(window.FB && typeof ONLINE_OK === 'function' && ONLINE_OK());
const ftRounds = (d) => (d.size === 8 ? 3 : 2);
const ftRoundName = (d, r) => (r === ftRounds(d) - 1 ? 'Finale' : r === ftRounds(d) - 2 ? 'Semifinale' : 'Quarti');
function ftAlive(d, r) {
  if (r === 0) return d.bracket || [];
  const prev = ftAlive(d, r - 1), out = [];
  for (let m = 0; m < prev.length / 2; m++) out.push((d.res || {})[(r - 1) + '-' + m] || null);
  return out;
}
function ftCurRound(d) {
  for (let r = 0; r < ftRounds(d); r++) { const al = ftAlive(d, r); for (let m = 0; m < al.length / 2; m++) if (!(d.res || {})[r + '-' + m]) return r; }
  return ftRounds(d);
}
function ftMyMatch(d) {
  const r = ftCurRound(d); if (r >= ftRounds(d)) return null;
  const al = ftAlive(d, r), i = al.indexOf(OL.uid);
  if (i < 0 || al.some((x) => !x)) return null;
  const m = Math.floor(i / 2), key = r + '-' + m;
  if ((d.res || {})[key]) return null;
  return { r, m, key, a: al[m * 2], b: al[m * 2 + 1], first: i % 2 === 0, foe: al[i % 2 ? i - 1 : i + 1] };
}
async function ftReady() {
  if (!ftOnline()) return false;
  if (!OL.ready) { try { await withTimeout(Promise.resolve(olInit()), 9000); } catch (e) { /* niente */ } }
  return !!OL.ready;
}
const ftRef = (code) => FB.doc(OL.db, 'tours', code);
function ftWatch(code) {
  if (FT.unsub && FT.code === code) return;
  ftStop(); FT.code = code;
  FT.unsub = FB.onSnapshot(ftRef(code), (s) => {
    FT.doc = s.exists() ? s.data() : null;
    if (!FT.doc) { P.ft = null; save(); FT.code = ''; }
    if (view === 'vTornei' && TOUR_TAB === 'amici' && !FT.waitRoom) ftRender();
  }, (e) => { FT.err = olErrText(e); if (view === 'vTornei' && TOUR_TAB === 'amici') ftRender(); });
}
function ftStop() { if (FT.unsub) { try { FT.unsub(); } catch (e) { /* niente */ } } FT.unsub = null; FT.code = ''; }
async function ftRender() {
  const box = $('tourBody'); if (!box) return;
  if (!ftOnline()) { box.innerHTML = '<div class="pzempty"><span>🤝</span><p>Il torneo tra amici si gioca online: funziona con internet, nell’app o nella versione per iPhone.</p></div>'; return; }
  if (!OL.ready) { box.innerHTML = '<div class="clanempty"><div class="spinner"></div><p>Mi collego…</p></div>'; if (!(await ftReady())) { box.innerHTML = '<div class="clanempty"><p>' + esc(OL.err || 'Non riesco a collegarmi.') + '</p><button class="btn" data-ftretry="1">Riprova</button></div>'; return; } }
  if (P.ft && P.ft.code) {
    ftWatch(P.ft.code);
    const d = FT.doc;
    if (!d) { box.innerHTML = '<div class="clanempty"><div class="spinner"></div><p>Carico il torneo…</p></div>'; return; }
    box.innerHTML = d.status === 'waiting' ? ftLobbyHTML(d) : ftBracketHTML(d);
    return;
  }
  const mk = FT.mk;
  box.innerHTML = '<div class="fthero"><span>🤝</span><div><b>Torneo tra amici</b><small>Crea un torneo, manda il codice su WhatsApp e sfidatevi online a eliminazione: chi vince la finale è il campione del gruppo.</small></div></div>' +
    '<div class="ftcard"><h4>Crea un torneo</h4><span class="lab">Gioco</span><div class="ftopts">' + Object.keys(FT_GAMES).map((g) => '<button data-ftg="' + g + '" aria-pressed="' + (mk.game === g) + '">' + FT_GAMES[g] + '</button>').join('') + '</div>' +
    '<span class="lab">Giocatori</span><div class="ftopts">' + [4, 8].map((n) => '<button data-fts="' + n + '" aria-pressed="' + (mk.size === n) + '">' + n + ' <small>' + (n === 4 ? 'semifinali e finale' : 'quarti, semi e finale') + '</small></button>').join('') + '</div>' +
    '<button class="btn take" data-ftnew="1"' + (FT.busy ? ' disabled' : '') + '>Crea il torneo</button></div>' +
    '<div class="ftcard"><h4>Hai un codice?</h4><form class="clansearch" id="ftJoin"><label for="ftCode" hidden>Codice del torneo</label><input id="ftCode" maxlength="5" placeholder="Es. K7MQ2" autocomplete="off" autocapitalize="characters" style="text-transform:uppercase"><button class="btn" type="submit">Entra</button></form><small class="pznote" id="ftErr">' + esc(FT.err || '') + '</small></div>';
}
function ftPlayerRow(d, u) { return '<li class="' + (u === OL.uid ? 'me' : '') + '"><img src="' + (AVIMG[(d.avs || {})[u]] || AVIMG.mare) + '" alt=""><span class="nm">' + esc((d.names || {})[u] || '?') + (u === d.host ? ' <i class="clancap">👑</i>' : '') + '</span></li>'; }
function ftLobbyHTML(d) {
  const host = d.host === OL.uid, full = d.players.length >= d.size;
  return '<div class="ftcode"><small>Codice del torneo</small><b>' + esc(d.code) + '</b><span>' + FT_GAMES[d.game] + ' · ' + d.size + ' giocatori</span><button class="btn small" data-ftshare="1">Manda il codice</button></div>' +
    '<h4 class="clansub">Iscritti: ' + d.players.length + ' su ' + d.size + '</h4><ol class="ftplayers">' + d.players.map((u) => ftPlayerRow(d, u)).join('') + Array(Math.max(0, d.size - d.players.length)).fill('<li class="empty"><span class="ftq">?</span><span class="nm">Posto libero</span></li>').join('') + '</ol>' +
    (host ? '<button class="btn take" data-ftstart="1"' + (full ? '' : ' disabled') + '>' + (full ? 'Fai iniziare il torneo' : 'Aspetta che entrino tutti') + '</button>' : '<p class="clanhint">Aspetta che ' + esc((d.names || {})[d.host] || 'chi ha creato il torneo') + ' faccia iniziare il torneo.</p>') +
    '<button class="btn ghost small tquit" data-ftleave="1">' + (host ? 'Annulla il torneo' : 'Esci dal torneo') + '</button>';
}
function ftBracketHTML(d) {
  const R = ftRounds(d), cur = ftCurRound(d), nm = (u) => (u ? esc(((d.names || {})[u] || '?').split(' ')[0]) : '?');
  let h = '<div class="thero" style="--c1:#7A4E9E;--c2:#3E2450"><span class="thico">🤝</span><div><b>Torneo tra amici · ' + esc(d.code) + '</b><small>' + FT_GAMES[d.game] + ' · ' + d.size + ' giocatori</small></div></div>';
  h += '<div class="tbracket ft' + R + '">';
  for (let r = 0; r < R; r++) {
    const al = ftAlive(d, r);
    h += '<div class="tbcol"><small>' + ftRoundName(d, r) + '</small>';
    for (let m = 0; m < al.length / 2; m++) {
      const w = (d.res || {})[r + '-' + m];
      h += '<div class="tbm' + (r === cur && !w ? ' live' : '') + '">' + [al[m * 2], al[m * 2 + 1]].map((u) => '<span class="tbp' + (u === OL.uid ? ' me' : '') + (w && u && w !== u ? ' lost' : '') + (u ? '' : ' tbd') + '">' + (u ? '<img src="' + (AVIMG[(d.avs || {})[u]] || AVIMG.mare) + '" alt=""><b>' + nm(u) + '</b>' : '<i>?</i>') + '</span>').join('') + '</div>';
    }
    h += '</div>';
  }
  const ch = d.champ;
  h += '<div class="tbcol tbch"><small>Campione</small><div class="tbcup">' + (ch ? '<img src="' + (AVIMG[(d.avs || {})[ch]] || AVIMG.mare) + '" alt=""><b>' + nm(ch) + '</b>' : '<span>🏆</span>') + '</div></div></div>';
  if (d.status === 'done' || cur >= R) {
    const me = ch === OL.uid, got = P.ft && P.ft.claimed;
    h += '<div class="tend ' + (me ? 'p1' : '') + '"><span class="tendic">' + (me ? '🏆' : '🎉') + '</span><b>' + (me ? 'Sei il campione!' : 'Ha vinto ' + esc((d.names || {})[ch] || '')) + '</b>' +
      (me ? '<p>' + (ftPrizeToday() && !got ? 'Premio del campione: baule d’argento e 150 carlini (uno al giorno).' : got ? 'Premio ritirato.' : 'Oggi hai già ritirato un premio da campione: domani si ricomincia!') + '</p>' + (ftPrizeToday() && !got ? '<button class="btn take" data-ftprize="1">Ritira il premio</button>' : '') : '<p>Il torneo è finito. Ne fate un altro?</p>') +
      '<button class="btn ghost" data-ftclose="1">Chiudi il torneo</button></div>';
    return h;
  }
  const mm = ftMyMatch(d);
  if (mm) {
    const foe = mm.foe, rid = (d.rooms || {})[mm.key];
    h += '<div class="tnext"><small>' + ftRoundName(d, mm.r) + ' · ' + FT_GAMES[d.game] + '</small><div class="tvs"><span class="tvp me"><img src="' + AVIMG[P.av] + '" alt=""><b>' + esc(P.nick || 'Tu') + '</b></span><em>VS</em><span class="tvp"><img src="' + (AVIMG[(d.avs || {})[foe]] || AVIMG.mare) + '" alt=""><b>' + esc((d.names || {})[foe] || '?') + '</b></span></div>' +
      (Date.now() - ftSeen(mm.key) >= FT_WAIT_MS ? '<button class="btn ghost small ftclaim" data-ftclaim="1">' + esc((d.names || {})[foe] || 'L’avversario') + ' non si presenta? Vinci a tavolino</button>' : '') +
      (mm.first ? (rid ? '<p class="clanhint">Il tavolo è aperto: aspetta che entri ' + esc((d.names || {})[foe] || '') + '.</p><button class="btn take" data-ftopen="1">Torna al tavolo</button>' : '<button class="btn take" data-ftopen="1">Apri il tavolo</button><small class="pznote">Apri il tavolo e l’altro entra dalla sua app.</small>')
        : (rid ? '<button class="btn take" data-ftjoin="' + esc(rid) + '">Entra al tavolo</button><small class="pznote">' + esc((d.names || {})[foe] || '') + ' ti aspetta!</small>' : '<p class="clanhint">Aspetta che ' + esc((d.names || {})[foe] || '') + ' apra il tavolo: il pulsante compare da solo.</p>')) + '</div>';
  } else {
    const alive = ftAlive(d, cur).includes(OL.uid);
    h += '<div class="pzempty"><span>' + (alive ? '⏳' : '👀') + '</span><p>' + (alive ? 'Hai passato il turno! Aspetta che finiscano le altre partite.' : 'Sei fuori dal torneo: guarda come va a finire.') + '</p></div>';
  }
  h += '<button class="btn ghost small tquit" data-ftclose="1">Esci dal torneo</button>';
  return h;
}
function ftPrizeToday() { const t = new Date().toDateString(); return P.ftPrizeDay !== t; }
async function ftCreate() {
  if (FT.busy) return; FT.busy = true; FT.err = '';
  const mk = FT.mk;
  for (let k = 0; k < 4; k++) {
    const code = genCode();
    try {
      await FB.runTransaction(OL.db, async (tx) => {
        const s = await tx.get(ftRef(code)); if (s.exists()) throw new Error('preso');
        tx.set(ftRef(code), { code, host: OL.uid, size: mk.size, game: mk.game, status: 'waiting', players: [OL.uid], names: { [OL.uid]: myName() }, avs: { [OL.uid]: P.av || 'mare' }, bracket: [], rooms: {}, res: {}, champ: '', at: FB.serverTimestamp() });
      });
      P.ft = { code, claimed: false }; save(); FT.busy = false; renderTornei();
      if (typeof track === 'function') track('ft_create', { game: mk.game, size: mk.size });
      return;
    } catch (e) { if (e.message !== 'preso') { FT.err = olErrText(e); break; } }
  }
  FT.busy = false; ftRender();
}
async function ftJoin(code) {
  code = (code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (code.length !== 5) { FT.err = 'Il codice ha 5 caratteri.'; ftRender(); return; }
  if (FT.busy) return; FT.busy = true; FT.err = '';
  try {
    await FB.runTransaction(OL.db, async (tx) => {
      const s = await tx.get(ftRef(code)); if (!s.exists()) throw new Error('nonce');
      const d = s.data();
      if (d.players.includes(OL.uid)) return;
      if (d.status !== 'waiting') throw new Error('iniziato');
      if (d.players.length >= d.size) throw new Error('pieno');
      tx.update(ftRef(code), { players: d.players.concat([OL.uid]), names: Object.assign({}, d.names, { [OL.uid]: myName() }), avs: Object.assign({}, d.avs, { [OL.uid]: P.av || 'mare' }) });
    });
    P.ft = { code, claimed: false }; save(); fx('take');
  } catch (e) { FT.err = { nonce: 'Nessun torneo con questo codice.', iniziato: 'Il torneo è già iniziato.', pieno: 'Il torneo è pieno.' }[e.message] || olErrText(e); }
  FT.busy = false; renderTornei();
}
async function ftStart() {
  const d = FT.doc; if (!d || d.host !== OL.uid || d.players.length < d.size) return;
  const br = d.players.slice().sort(() => Math.random() - 0.5);
  try { await FB.updateDoc(ftRef(d.code), { status: 'playing', bracket: br }); fx('big'); } catch (e) { flash('Non riesco a far iniziare, riprova'); }
}
async function ftLeave() {
  const d = FT.doc, code = P.ft && P.ft.code;
  if (d && code && d.status === 'waiting') {
    try {
      if (d.host === OL.uid) await FB.deleteDoc(ftRef(code));
      else await FB.runTransaction(OL.db, async (tx) => {
        const s = await tx.get(ftRef(code)); if (!s.exists()) return; const x = s.data();
        const names = Object.assign({}, x.names), avs = Object.assign({}, x.avs); delete names[OL.uid]; delete avs[OL.uid];
        tx.update(ftRef(code), { players: x.players.filter((u) => u !== OL.uid), names, avs });
      });
    } catch (e) { /* niente */ }
  }
  ftStop(); FT.doc = null; P.ft = null; save(); renderTornei();
}
/* il primo della coppia apre il tavolo (una stanza online privata), l'altro ci entra */
async function ftOpenTable() {
  const d = FT.doc, mm = d && ftMyMatch(d); if (!mm || !mm.first) return;
  let rid = (d.rooms || {})[mm.key];
  try {
    if (!rid) {
      const ref = FB.doc(FB.collection(OL.db, 'rooms'));
      await withTimeout(FB.setDoc(ref, { game: d.game, public: false, code: genCode(), tour: d.code, tm: mm.key, status: 'waiting', players: [OL.uid, ''], names: [myName(), ''], avs: [P.av, ''], lvs: [levelOf(P.xp), 0], towns: [myTown(), ''], createdAt: FB.serverTimestamp(), ping: FB.serverTimestamp(), v: 0 }), 15000);
      rid = ref.id;
      await withTimeout(FB.updateDoc(ftRef(d.code), { ['rooms.' + mm.key]: rid }), 15000);
    }
  } catch (e) { flash('Non riesco ad aprire il tavolo'); return; }
  ftWaitTable(rid, (d.names || {})[mm.foe] || '');
}
function ftWaitTable(rid, foe) {
  const ref = FB.doc(OL.db, 'rooms', rid);
  FT.waitRoom = rid;
  overlay('<div class="ftwait"><div class="spinner"></div><h2>Tavolo aperto</h2><p>Aspetto che entri <b>' + esc(foe) + '</b>…</p><button class="btn alt" id="ftWaitNo">Torna al tabellone</button></div>');
  const ping = setInterval(() => FB.updateDoc(ref, { ping: FB.serverTimestamp() }).catch(() => {}), 15000);
  const un = FB.onSnapshot(ref, (s) => {
    const r = s.data();
    if (r && r.status === 'playing') { clearInterval(ping); un(); FT.waitRoom = null; $('layer').innerHTML = ''; enterRoom(rid, r.game); }
  }, () => {});
  $('ftWaitNo').onclick = () => { clearInterval(ping); un(); FT.waitRoom = null; $('layer').innerHTML = ''; ftRender(); };
}
async function ftJoinTable(rid) {
  try { const ok = await joinRoom(rid); if (!ok) flash('Il tavolo non è più disponibile'); } catch (e) { flash('Non riesco a entrare, riprova'); }
}
/* fine della partita del torneo: si scrive il vincitore (o si rigioca se è pareggio) */
async function ftReport(d) {
  if (!d || !d.tour || !d.tm) return;
  const w = d.winner === 0 || d.winner === 1 ? d.players[d.winner] : null;
  try {
    await FB.runTransaction(OL.db, async (tx) => {
      const ref = ftRef(d.tour), s = await tx.get(ref); if (!s.exists()) return;
      const t = s.data();
      if ((t.res || {})[d.tm]) return;
      if (!w) { tx.update(ref, { ['rooms.' + d.tm]: '' }); return; }
      const upd = { ['res.' + d.tm]: w };
      if (+d.tm.split('-')[0] === ftRounds(t) - 1) { upd.status = 'done'; upd.champ = w; }
      tx.update(ref, upd);
    });
  } catch (e) { /* lo riscrive l'altro giocatore */ }
}
/* scrive il risultato di una partita del torneo (vittoria a tavolino o ritiro) */
async function ftSetRes(key, w) {
  const code = P.ft && P.ft.code; if (!code) return false;
  try {
    await FB.runTransaction(OL.db, async (tx) => {
      const ref = ftRef(code), s = await tx.get(ref); if (!s.exists()) return;
      const t = s.data(); if ((t.res || {})[key]) return;
      const upd = { ['res.' + key]: w };
      if (+key.split('-')[0] === ftRounds(t) - 1) { upd.status = 'done'; upd.champ = w; }
      tx.update(ref, upd);
    });
    return true;
  } catch (e) { return false; }
}
const FT_WAIT_MS = 5 * 60000;
function ftSeen(key) { if (!P.ft) return Date.now(); if (!P.ft.seen) P.ft.seen = {}; if (!P.ft.seen[key]) { P.ft.seen[key] = Date.now(); save(); } return P.ft.seen[key]; }
async function ftClaim() {
  const d = FT.doc, mm = d && ftMyMatch(d); if (!mm) return;
  if (Date.now() - ftSeen(mm.key) < FT_WAIT_MS) return;
  const rid = (d.rooms || {})[mm.key];
  if (rid) { try { const r = await FB.getDoc(FB.doc(OL.db, 'rooms', rid)); const x = r.exists() ? r.data() : null; if (x && x.status !== 'waiting') { flash('La partita è già iniziata'); return; } } catch (e) { return; } }
  if (await ftSetRes(mm.key, OL.uid)) { flash('Vinci a tavolino'); fx('take'); }
}
(() => {
  const oldEnd = endOnline;
  endOnline = function () {
    const d = OL.room;
    const r = oldEnd.apply(this, arguments);
    if (d && d.tour) {
      ftReport(d);
      setTimeout(() => {
        const a = $('olAgain'), m = $('olMenu');
        const back = () => { $('layer').innerHTML = ''; olLeave(); G = null; TOUR_TAB = 'amici'; go('vTornei'); };
        if (a) { a.textContent = 'Torna al torneo'; a.onclick = back; }
        if (m) m.onclick = back;
      }, 0);
    }
    return r;
  };
})();
function ftShare() {
  const d = FT.doc; if (!d) return;
  const txt = 'Torneo di ' + FT_GAMES[d.game] + ' su Scopa Calabrese! Apri Tornei → Tra amici e scrivi il codice: ' + d.code + ' — ' + (typeof STORE_URL !== 'undefined' ? STORE_URL : '');
  const SH = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Share;
  try {
    if (SH && SH.share) { SH.share({ title: 'Scopa Calabrese', text: txt, dialogTitle: 'Manda il codice' }).catch(() => {}); return; }
    if (navigator.share) { navigator.share({ text: txt }).catch(() => {}); return; }
    if (navigator.clipboard) { navigator.clipboard.writeText(txt); flash('Codice copiato'); }
  } catch (e) { /* niente */ }
}
function ftClick(e) {
  const t = e.target;
  if (t.closest('[data-ftretry]')) { ftRender(); return true; }
  const g = t.closest('[data-ftg]'); if (g) { FT.mk.game = g.dataset.ftg; ftRender(); return true; }
  const sz = t.closest('[data-fts]'); if (sz) { FT.mk.size = +sz.dataset.fts; ftRender(); return true; }
  if (t.closest('[data-ftnew]')) { ftCreate(); return true; }
  if (t.closest('[data-ftshare]')) { ftShare(); return true; }
  if (t.closest('[data-ftstart]')) { ftStart(); return true; }
  if (t.closest('[data-ftleave]')) { overlay('<h2>' + (FT.doc && FT.doc.host === OL.uid ? 'Annullare il torneo?' : 'Uscire dal torneo?') + '</h2><p>' + (FT.doc && FT.doc.host === OL.uid ? 'Il torneo verrà cancellato per tutti.' : 'Lasci il tuo posto libero.') + '</p><button class="btn" id="ftlYes">Sì</button><button class="btn alt" id="ftlNo">No</button>'); $('ftlYes').onclick = () => { $('layer').innerHTML = ''; ftLeave(); }; $('ftlNo').onclick = () => { $('layer').innerHTML = ''; }; return true; }
  if (t.closest('[data-ftopen]')) { ftOpenTable(); return true; }
  if (t.closest('[data-ftclaim]')) { ftClaim(); return true; }
  const j = t.closest('[data-ftjoin]'); if (j) { ftJoinTable(j.dataset.ftjoin); return true; }
  if (t.closest('[data-ftprize]')) {
    const d = FT.doc; if (!d || d.champ !== OL.uid || !ftPrizeToday() || (P.ft && P.ft.claimed)) return true;
    const E = eco(); E.carlini += 150;
    if (E.chests.length < SLOTS) E.chests.push({ id: 'c' + Date.now().toString(36), grade: 'argento', start: null, end: null, sped: false }); else E.carlini += 200;
    P.ftPrizeDay = new Date().toDateString(); P.ft.claimed = true; if (!P.troph) P.troph = {}; P.troph.amici = (P.troph.amici || 0) + 1;
    save(); fx('big'); flash('Campione!'); ftRender(); return true;
  }
  if (t.closest('[data-ftclose]')) {
    const d = FT.doc, done = d && (d.status === 'done' || ftCurRound(d) >= ftRounds(d));
    const fin = async () => { const mm = d && !done ? ftMyMatch(d) : null; if (mm) await ftSetRes(mm.key, mm.foe); ftStop(); FT.doc = null; P.ft = null; save(); renderTornei(); };
    if (done) { fin(); return true; }
    overlay('<h2>Uscire dal torneo?</h2><p>Se hai ancora una partita da giocare, la perdi a tavolino e il tuo avversario passa il turno.</p><button class="btn" id="ftcYes">Esci</button><button class="btn alt" id="ftcNo">Resta</button>');
    $('ftcYes').onclick = () => { $('layer').innerHTML = ''; fin(); }; $('ftcNo').onclick = () => { $('layer').innerHTML = ''; };
    return true;
  }
  return false;
}
document.addEventListener('submit', (e) => { if (e.target && e.target.id === 'ftJoin') { e.preventDefault(); ftJoin($('ftCode').value); } });
setInterval(() => { if (view === 'vTornei' && TOUR_TAB === 'amici' && P.ft && !FT.waitRoom && !$('layer').innerHTML) ftRender(); }, 30000);
