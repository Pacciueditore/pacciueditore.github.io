/* ================= GIOCO ONLINE (Firebase): scopa tra due persone ================= */
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyD5oeNqhBNoUQZkQVkh23xyFCXh7hkgaNI',
  authDomain: 'scopa-calabrese.firebaseapp.com',
  projectId: 'scopa-calabrese',
  storageBucket: 'scopa-calabrese.firebasestorage.app',
  messagingSenderId: '710124146362',
  appId: '1:710124146362:web:9b085b1453df3b68ebbc83',
};
const EMOTES = ['Pijja chistu!', 'Aia la miseria!', 'Bella iocata!', 'Mòviti ca scurau!', 'Bonu, bonu!', 'Ti fici a festa!'];
const TURN_MS = 30000, CLAIM_MS = 90000, PAUSE_MS = 15000;
const OL = { game: 'scopa', trickShowUntil: 0, ready: false, err: '', uid: null, db: null, room: null, rid: null, unsub: null, sel: null, timer: null, waiting: null, lastEmote: 0, lastSeenMove: null, ended: false };

/* ---------- motore della scopa (puro, senza grafica) ---------- */
const cardOf = (id) => { const [s, v] = id.split('-'); return { s, v: +v, id }; };
const PRIM = { 7: 21, 6: 18, 1: 16, 5: 15, 4: 14, 3: 13, 2: 12, 8: 10, 9: 10, 10: 10 };
function freshDeck() { const d = []; for (const s of SUITS) for (let v = 1; v <= 10; v++) d.push(s + '-' + v); for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [d[i], d[j]] = [d[j], d[i]]; } return d; }
function capOptions(cid, table) {
  const c = cardOf(cid), tb = table.map(cardOf);
  const same = tb.filter((t) => t.v === c.v);
  if (same.length) return same.map((t) => [t.id]);
  const out = [];
  const rec = (i, sum, pick) => { if (sum === c.v && pick.length > 1) { out.push(pick.slice()); return; } if (sum >= c.v || i >= tb.length) return; rec(i + 1, sum + tb[i].v, pick.concat(tb[i].id)); rec(i + 1, sum, pick); };
  rec(0, 0, []);
  return out;
}
function dealHand(st) {
  st.deck = freshDeck();
  st.hand0 = st.deck.splice(0, 3); st.hand1 = st.deck.splice(0, 3); st.table = st.deck.splice(0, 4);
  st.caps0 = []; st.caps1 = []; st.scope = [0, 0]; st.lastTaker = -1;
  st.turn = 1 - st.dealer;
}
function scoreHand(st) {
  const caps = [st.caps0.map(cardOf), st.caps1.map(cardOf)];
  const pts = [0, 0], det = [];
  const cmp = (a, b, label) => { if (a > b) { pts[0]++; det.push(label + ': ' + OL.names(0)); } else if (b > a) { pts[1]++; det.push(label + ': ' + OL.names(1)); } else det.push(label + ': pari'); };
  cmp(caps[0].length, caps[1].length, 'Carte');
  cmp(caps[0].filter((c) => c.s === 'campagna').length, caps[1].filter((c) => c.s === 'campagna').length, 'Ulivi');
  const sb = (p) => caps[p].some((c) => c.id === 'campagna-7');
  if (sb(0)) { pts[0]++; det.push('Settebello: ' + OL.names(0)); } else if (sb(1)) { pts[1]++; det.push('Settebello: ' + OL.names(1)); }
  const prim = (p) => SUITS.reduce((s, su) => { const best = Math.max(0, ...caps[p].filter((c) => c.s === su).map((c) => PRIM[c.v])); return best && s >= 0 ? s + best : -1; }, 0);
  cmp(prim(0), prim(1), 'Primiera');
  pts[0] += st.scope[0]; pts[1] += st.scope[1];
  if (st.scope[0] || st.scope[1]) det.push('Scope: ' + st.scope[0] + ' a ' + st.scope[1]);
  const stats = { c: [caps[0].length, caps[1].length], u: [0, 1].map((p) => caps[p].filter((c) => c.s === 'campagna').length), sb: sb(0) ? 0 : sb(1) ? 1 : -1, pr: [prim(0), prim(1)], sc: st.scope.slice() };
  return { pts, det, stats };
}
/* applica la giocata del giocatore p: carta cid, prende take (array di id) */
function applyMove(st, p, cid, take) {
  const hk = 'hand' + p, ck = 'caps' + p;
  st[hk] = st[hk].filter((x) => x !== cid);
  let scopa = false;
  if (take && take.length) {
    st.table = st.table.filter((x) => !take.includes(x));
    st[ck] = st[ck].concat(cid, take);
    st.lastTaker = p;
    const lastCardOfHand = !st.deck.length && !st.hand0.length && !st.hand1.length;
    if (!st.table.length && !lastCardOfHand) { st.scope[p]++; scopa = true; }
  } else st.table = st.table.concat(cid);
  st.lastMove = { p, card: cid, took: take || [], scopa, n: (st.lastMove ? st.lastMove.n : 0) + 1 };
  st.turn = 1 - p;
  if (!st.hand0.length && !st.hand1.length) {
    if (st.deck.length) { st.hand0 = st.deck.splice(0, 3); st.hand1 = st.deck.splice(0, 3); }
    else {
      st.leftover = st.table.slice();
      if (st.table.length && st.lastTaker >= 0) { st['caps' + st.lastTaker] = st['caps' + st.lastTaker].concat(st.table); st.table = []; }
      const r = scoreHand(st);
      st.total = [st.total[0] + r.pts[0], st.total[1] + r.pts[1]];
      st.handLog = { pts: r.pts, det: r.det, n: st.handNo, st: r.stats, last: st.lastTaker };
      if ((st.total[0] >= 11 || st.total[1] >= 11) && st.total[0] !== st.total[1]) { st.status = 'done'; st.winner = st.total[0] > st.total[1] ? 0 : 1; st.endReason = 'punti'; }
      else { st.handNo++; st.dealer = 1 - st.dealer; st.pause = st.lastMove.n; dealHand(st); }
    }
  }
  return st;
}

/* ---------- scopa in quattro: due coppie, posti 0-2 contro 1-3 ---------- */
const isScopaG = (g) => !g || g === 'scopa' || g === 'scopa4';
const myT = () => { const d = OL.room, me = meIdx(); return d && d.game === 'scopa4' ? me % 2 : me; };
function dealHand4(st) {
  const d = freshDeck();
  for (let p = 0; p < 4; p++) st['hand' + p] = d.splice(0, 9);
  st.table = d.splice(0, 4); st.deck = [];
  st.caps0 = []; st.caps1 = []; st.scope = [0, 0]; st.lastTaker = -1; st.lastSeat = -1;
  st.turn = (st.dealer + 1) % 4;
}
const team4Name = (d, t) => (d && d.names ? d.names[t].split(' ')[0] + ' e ' + d.names[t + 2].split(' ')[0] : 'Squadra ' + (t + 1));
function applyMove4(st, p, cid, take, names) {
  const t = p % 2, hk = 'hand' + p;
  st[hk] = st[hk].filter((x) => x !== cid);
  let scopa = false;
  const allEmpty = () => [0, 1, 2, 3].every((q) => !st['hand' + q].length);
  if (take && take.length) {
    st.table = st.table.filter((x) => !take.includes(x));
    st['caps' + t] = st['caps' + t].concat(cid, take);
    st.lastTaker = t; st.lastSeat = p;
    if (!st.table.length && !allEmpty()) { st.scope[t]++; scopa = true; }
  } else st.table = st.table.concat(cid);
  st.lastMove = { p, card: cid, took: take || [], scopa, n: (st.lastMove ? st.lastMove.n : 0) + 1 };
  st.turn = (p + 1) % 4;
  if (allEmpty()) {
    st.leftover = st.table.slice();
    if (st.table.length && st.lastTaker >= 0) { st['caps' + st.lastTaker] = st['caps' + st.lastTaker].concat(st.table); st.table = []; }
    const old = OL.names; OL.names = (i) => team4Name({ names }, i);
    const r = scoreHand(st); OL.names = old;
    st.total = [st.total[0] + r.pts[0], st.total[1] + r.pts[1]];
    st.handLog = { pts: r.pts, det: r.det, n: st.handNo, st: r.stats, last: st.lastTaker };
    if ((st.total[0] >= 11 || st.total[1] >= 11) && st.total[0] !== st.total[1]) { st.status = 'done'; st.winner = st.total[0] > st.total[1] ? 0 : 1; st.endReason = 'punti'; }
    else { st.handNo++; st.dealer = (st.dealer + 1) % 4; st.pause = st.lastMove.n; dealHand4(st); }
  }
  return st;
}

/* ---------- briscola e tressette (a prese) ---------- */
const BR_RANK = { 1: 10, 3: 9, 10: 8, 9: 7, 8: 6, 7: 5, 6: 4, 5: 3, 4: 2, 2: 1 }, BR_PTS = { 1: 11, 3: 10, 10: 4, 9: 3, 8: 2 };
const TR_RANK = { 3: 10, 2: 9, 1: 8, 10: 7, 9: 6, 8: 5, 7: 4, 6: 3, 5: 2, 4: 1 };
const trTh = (v) => (v === 1 ? 3 : (v === 2 || v === 3 || v >= 8) ? 1 : 0);
const TR_TARGET = 11;
const OL_GAMES = { scopa: 'Scopa', scopa4: 'Scopone', briscola: 'Briscola', tressette: 'Tressette', sette: 'Sette e mezzo', morra: 'Morra', calcio: 'U Palluni', casa: 'A Casa da Figghia' };
const OL_RULE = { scopa: 'fino a 11 punti', scopa4: 'lo scopone: in coppia, 2 contro 2, fino a 11 punti: il compagno è quello di fronte e le prese sono in comune', briscola: 'una partita: vince chi fa più di 60 punti', tressette: 'fino a 11 punti, devi rispondere al seme; la carta pescata si mostra per pochi secondi e c’è il buongioco (3 punti per tre assi, tre tre, tre due o Asso-2-3 dello stesso seme)', sette: 'vince chi arriva a 5 mani; il banco cambia a ogni mano e vince le parità', morra: 'buttate la mano insieme e gridate un numero: chi indovina la somma fa punto, si arriva a 5', calcio: 'calcio a punta di dito: a turno tiri una pedina, vince chi segna 3 gol o chi è avanti dopo 10 tiri a testa', casa: 'a turno lanciate mattoni e caciocavalli sulla casa dell’altro: dopo 10 turni a testa vince chi ha più mattoni in piedi' };
function dealGame(st, game) {
  if (game === 'scopa') { dealHand(st); return; }
  if (game === 'scopa4') { st.dealer = Math.floor(Math.random() * 4); dealHand4(st); return; }
  if (game === 'morra') { st.mo = { r: 1, h: null, o: null, s: null, last: null }; st.turn = 1 - st.dealer; return; }
  if (game === 'sette') { smDeal(st); return; }
  if (game === 'calcio') { czDeal(st); return; }
  if (game === 'casa') { caDeal(st); return; }
  st.deck = freshDeck();
  const n = game === 'tressette' ? 10 : 3;
  st.hand0 = st.deck.splice(0, n); st.hand1 = st.deck.splice(0, n);
  st.caps0 = []; st.caps1 = []; st.trick = []; st.lastTrick = null; st.lastDraw = null; st.table = []; st.scope = [0, 0]; st.lastTaker = -1;
  st.bris = '';
  if (game === 'briscola') { st.bris = st.deck.shift(); st.deck.push(st.bris); }
  st.turn = st.leader = 1 - st.dealer;
  if (game === 'tressette') {
    // le regole del nonno: carte pescate mostrate e buongioco a inizio smazzata
    st.shown0 = []; st.shown1 = [];
    const bg = [trBuonGioco(st.hand0), trBuonGioco(st.hand1)];
    st.bg = (bg[0].length || bg[1].length) ? { n: st.handNo || 1, c: bg } : null;
    st.bgTot = [((st.bgTot || [0, 0])[0]) + bg[0].length, ((st.bgTot || [0, 0])[1]) + bg[1].length];
    if (st.bg) st.total = [(st.total || [0, 0])[0] + bg[0].length * 3, (st.total || [0, 0])[1] + bg[1].length * 3];
  }
}
function legalCards(d, p) {
  const h = d['hand' + p];
  if (d.game !== 'tressette' || !d.trick || !d.trick.length) return h;
  const s0 = cardOf(d.trick[0].c).s, same = h.filter((x) => cardOf(x).s === s0);
  return same.length ? same : h;
}
function applyTrick(st, p, cid, game) {
  st['hand' + p] = st['hand' + p].filter((x) => x !== cid);
  if (st['shown' + p]) st['shown' + p] = st['shown' + p].filter((x) => x !== cid);
  st.trick = (st.trick || []).concat({ p, c: cid });
  st.lastMove = { p, card: cid, took: [], scopa: false, n: (st.lastMove ? st.lastMove.n : 0) + 1 };
  if (st.trick.length < 2) { st.turn = 1 - p; return st; }
  const a = { p: st.trick[0].p, c: cardOf(st.trick[0].c) }, b = { p: st.trick[1].p, c: cardOf(st.trick[1].c) };
  let w;
  if (game === 'briscola') { const bs = cardOf(st.bris).s; w = b.c.s === a.c.s ? (BR_RANK[b.c.v] > BR_RANK[a.c.v] ? b.p : a.p) : (b.c.s === bs ? b.p : a.p); }
  else w = b.c.s === a.c.s && TR_RANK[b.c.v] > TR_RANK[a.c.v] ? b.p : a.p;
  const gained = game === 'briscola' ? (BR_PTS[a.c.v] || 0) + (BR_PTS[b.c.v] || 0) : trTh(a.c.v) + trTh(b.c.v);
  st['caps' + w] = st['caps' + w].concat(a.c.id, b.c.id);
  st.lastTrick = { cards: st.trick, w, g: gained, n: st.lastMove.n };
  st.trick = []; st.lastTaker = w; st.leader = w; st.turn = w; st.lastDraw = null;
  if (st.deck.length) { const d1 = st.deck.shift(), d2 = st.deck.shift(); st['hand' + w].push(d1); st['hand' + (1 - w)].push(d2); st.lastDraw = w === 0 ? [d1, d2] : [d2, d1]; if (game === 'tressette') { st.shown0 = (st.shown0 || []).concat(st.lastDraw[0]); st.shown1 = (st.shown1 || []).concat(st.lastDraw[1]); } }
  if (!st.hand0.length && !st.hand1.length) {
    if (game === 'briscola') {
      const sc = [0, 1].map((q) => st['caps' + q].reduce((t, x) => t + (BR_PTS[cardOf(x).v] || 0), 0));
      st.total = sc; st.handLog = { pts: sc, det: ['Punti: ' + sc[0] + ' a ' + sc[1]], n: st.handNo };
      st.status = 'done'; st.winner = sc[0] > sc[1] ? 0 : sc[1] > sc[0] ? 1 : 2; st.endReason = 'punti';
    } else {
      const th = [0, 1].map((q) => st['caps' + q].reduce((t, x) => t + trTh(cardOf(x).v), 0));
      th[w] += 3;
      const pts = th.map((x) => Math.floor(x / 3));
      st.total = [st.total[0] + pts[0], st.total[1] + pts[1]];
      st.handLog = { pts, det: ['Punti della mano, ultima presa compresa'], n: st.handNo, th, prese: [st.caps0.length / 2, st.caps1.length / 2], last: w, bg: st.bg && st.bg.n === st.handNo ? [st.bg.c[0].length, st.bg.c[1].length] : [0, 0] };
      if ((st.total[0] >= TR_TARGET || st.total[1] >= TR_TARGET) && st.total[0] !== st.total[1]) { st.status = 'done'; st.winner = st.total[0] > st.total[1] ? 0 : 1; st.endReason = 'punti'; }
      else { st.handNo++; st.dealer = 1 - st.dealer; st.pause = st.lastMove.n; dealGame(st, 'tressette'); }
    }
  }
  return st;
}
const STATE_KEYS = ['mo', 'sm', 'smLog', 'deck', 'hand0', 'hand1', 'hand2', 'hand3', 'table', 'caps0', 'caps1', 'scope', 'lastTaker', 'dealer', 'total', 'handNo', 'lastMove', 'handLog', 'status', 'winner', 'endReason', 'turn', 'trick', 'lastTrick', 'lastDraw', 'bris', 'leader', 'shown0', 'shown1', 'bg', 'bgTot', 'cz', 'ca'];
function cloneState(d) { const st = {}; for (const k of STATE_KEYS) if (d[k] !== undefined) st[k] = JSON.parse(JSON.stringify(d[k])); return st; }

/* ---------- collegamento ---------- */
function olInit() {
  if (OL.ready || OL.starting) return OL.starting;
  if (!window.FB) { OL.err = 'Il gioco online funziona nell’app per Android.'; return Promise.resolve(false); }
  OL.starting = new Promise((resolve) => {
    try {
      const app = FB.initializeApp(FIREBASE_CONFIG);
      let auth;
      try { auth = FB.initializeAuth(app, { persistence: [FB.indexedDBLocalPersistence, FB.browserLocalPersistence, FB.inMemoryPersistence] }); } catch (e) { auth = FB.initializeAuth(app, { persistence: FB.inMemoryPersistence }); }
      OL.db = FB.initializeFirestore(app, { experimentalForceLongPolling: true });
      const timeout = setTimeout(() => { if (!OL.ready) { OL.err = 'Non riesco a collegarmi. Controlla internet e riprova.'; resolve(false); } }, 15000);
      OL.auth = auth;
      FB.onAuthStateChanged(auth, (u) => {
        if (u) { OL.uid = u.uid; OL.user = u; OL.ready = true; OL.err = ''; clearTimeout(timeout); olSaveProfile(); resolve(true); if (typeof acctOnUser === 'function') acctOnUser(u); }
        else if (OL.ready) { FB.signInAnonymously(auth).catch(() => {}); }
      });
      const anon = () => FB.signInAnonymously(auth).catch((e) => { OL.err = olErrText(e); clearTimeout(timeout); resolve(false); });
      (auth.authStateReady ? auth.authStateReady() : Promise.resolve()).then(() => { if (!auth.currentUser) anon(); });
    } catch (e) { OL.err = olErrText(e); resolve(false); }
  });
  OL.starting.then(() => { OL.starting = null; if (view === 'vOnline') renderOnline(); });
  return OL.starting;
}
const myName = () => { if (!P.nick && typeof autoNick === 'function') autoNick(); return (P.nick || 'Giocatore').slice(0, 20); };
const myTown = () => { try { return P.paese && typeof PZ_BY !== 'undefined' && PZ_BY[P.paese] ? (PZ_BY[P.paese] || { n: P.paese }).n : ''; } catch (e) { return ''; } };
const OL_ICON = { scopa: '🃏', scopa4: '👥', briscola: '🂡', tressette: '♣️', sette: '7½', morra: '✊', calcio: '⚽', casa: '🏠' };
const OL_PLAYERS = { scopa4: 4 };
function olSaveProfile() {
  if (!OL.ready) return;
  const o = P.online || (P.online = { w: 0, l: 0 });
  FB.setDoc(FB.doc(OL.db, 'players', OL.uid), { name: myName(), av: P.av, lv: levelOf(P.xp), onlineW: o.w, onlineL: o.l, town: myTown(), at: FB.serverTimestamp() }).catch(() => {});
}
OL.names = (i) => (OL.room ? OL.room.names[i] : '');
const meIdx = () => (OL.room ? OL.room.players.indexOf(OL.uid) : -1);
const tms = (t) => (t && t.toMillis ? t.toMillis() : Date.now());
function genCode() { const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 5; i++) s += a[Math.floor(Math.random() * a.length)]; return s; }

/* ---------- stanze ---------- */
/* errore leggibile: dice cosa non va */
function olErrText(e) {
  const c = (e && (e.code || e.message)) || '';
  if (/network|offline|unavailable|failed to fetch/i.test(c)) return 'Niente internet: controlla la connessione e tocca Riprova.';
  if (/timeout|deadline/i.test(c)) return 'Il server ci mette troppo a rispondere. Controlla internet e riprova.';
  if (/permission|unauth/i.test(c)) return 'Il server non accetta la richiesta. Aggiorna l’app dal Play Store e riprova.';
  if (/quota|exhausted|too-many/i.test(c)) return 'Troppi giocatori in questo momento. Riprova tra qualche minuto.';
  if (/not-found|NOT_FOUND/.test(c)) return 'La partita non esiste più. Torna indietro e riprova.';
  return 'Qualcosa non è andato. Riprova tra poco.';
}
const withTimeout = (pr, ms) => Promise.race([pr, new Promise((_, rej) => setTimeout(() => rej({ code: 'timeout' }), ms))]);
async function createRoom(pub) {
  const code = genCode(), ref = FB.doc(FB.collection(OL.db, 'rooms'));
  OL.creating = true; OL.lastErr = ''; renderOnline();
  try {
    const four = OL.game === 'scopa4';
    await withTimeout(FB.setDoc(ref, Object.assign({ game: OL.game, public: pub, code, status: 'waiting', players: four ? [OL.uid, '', '', ''] : [OL.uid, ''], names: four ? [myName(), '', '', ''] : [myName(), ''], avs: four ? [P.av, '', '', ''] : [P.av, ''], lvs: four ? [levelOf(P.xp), 0, 0, 0] : [levelOf(P.xp), 0], towns: four ? [myTown(), '', '', ''] : [myTown(), ''], cteam: [typeof myCzTeam === 'function' ? myCzTeam() : '', ''], createdAt: FB.serverTimestamp(), ping: FB.serverTimestamp(), v: 0 }, four ? { max: 4 } : {})), 15000);
  } catch (e) { OL.creating = false; OL.lastErr = olErrText(e); renderOnline(); return; }
  OL.creating = false;
  OL.waiting = { rid: ref.id, code, pub, game: OL.game };
  OL.waitPing = setInterval(() => FB.updateDoc(ref, { ping: FB.serverTimestamp() }).catch(() => {}), 15000);
  OL.waitUnsub = FB.onSnapshot(ref, (snap) => { const d = snap.data(); if (d && d.status === 'playing') { stopWaiting(false); enterRoom(ref.id, d.game); } else if (d && OL.waiting) { OL.waiting.room = d; ol4Seats(); } });
  renderOnline();
}
function stopWaiting(del) {
  if (!OL.waiting) return;
  clearInterval(OL.waitPing); if (OL.waitUnsub) OL.waitUnsub();
  if (del && OL.waiting.guest) ol4Leave(OL.waiting.rid);
  else if (del) FB.deleteDoc(FB.doc(OL.db, 'rooms', OL.waiting.rid)).catch(() => {});
  OL.waiting = null;
}
async function joinRoom(rid) {
  const ref = FB.doc(OL.db, 'rooms', rid);
  const ok = await FB.runTransaction(OL.db, async (tx) => {
    const s = await tx.get(ref); const d = s.data();
    if (!d || d.status !== 'waiting' || d.players.includes(OL.uid)) return false;
    if (d.max === 4) return ol4JoinTx(tx, ref, d);
    const st = { dealer: Math.random() < 0.5 ? 0 : 1, total: [0, 0], handNo: 1, lastMove: null, handLog: null };
    dealGame(st, d.game || 'scopa');
    OL.joinGame = d.game || 'scopa';
    tx.update(ref, Object.assign(st, { status: 'playing', players: [d.players[0], OL.uid], names: [d.names[0], myName()], avs: [d.avs[0], P.av], lvs: [d.lvs[0], levelOf(P.xp)], towns: [(d.towns || [''])[0] || '', myTown()], cteam: [(d.cteam || [''])[0] || '', typeof myCzTeam === 'function' ? myCzTeam() : ''], v: d.v + 1, lastMoveAt: FB.serverTimestamp(), winner: -1, endReason: '' }));
    return OL.joinGame;
  });
  if (ok === 'wait4') { ol4Wait(rid); return true; }
  if (ok) enterRoom(rid, ok);
  return ok;
}
async function quickMatch() {
  const q = FB.query(FB.collection(OL.db, 'rooms'), FB.where('status', '==', 'waiting'), FB.where('public', '==', true), FB.where('game', '==', OL.game), FB.limit(10));
  const snap = await FB.getDocs(q);
  const now = Date.now();
  const list = snap.docs.filter((d) => !d.data().players.includes(OL.uid) && d.data().players.includes('') && now - tms(d.data().ping) < 40000).sort((a, b) => tms(a.data().createdAt) - tms(b.data().createdAt));
  for (const d of list) { try { if (await joinRoom(d.id)) return; } catch (e) { /* qualcuno è stato più veloce */ } }
  await createRoom(true);
}
async function joinByCode(code) {
  const q = FB.query(FB.collection(OL.db, 'rooms'), FB.where('status', '==', 'waiting'), FB.where('code', '==', code.toUpperCase().trim()), FB.limit(3));
  const snap = await FB.getDocs(q);
  for (const d of snap.docs) { try { if (await joinRoom(d.id)) return true; } catch (e) { /* riprova */ } }
  return false;
}

/* ---------- partita ---------- */
function enterRoom(rid, game) {
  OL.roomGame = game || OL.game || 'scopa';
  OL.rid = rid; OL.room = null; OL.sel = null; OL.ended = false; OL.introShown = null; OL.lastSeenMove = null; OL.lastHandLog = null; OL.animQ = []; OL.animating = false; OL.mLastN = null; OL.smLastN = null; OL.mShowUntil = 0; OL.smShowUntil = 0; OL.mpick = { f: 0, c: 0 }; OL.reali = 0; OL.endSched = false; OL.revealing = null; OL.mRun = 0; OL.viewRoom = null; OL.endPending = false; OL.trickAnim = false;
  const ref = FB.doc(OL.db, 'rooms', rid);
  startOnlineView();
  OL.unsub = FB.onSnapshot(ref, (snap) => {
    const d = snap.data(); if (!d) return;
    const prev = OL.room; OL.room = d;
    /* l'animazione parte alla prima fotografia della stanza già 'in gioco': chi entra per secondo
       può ricevere prima una copia vecchia (ancora 'in attesa') presa dalla memoria del telefono */
    if (d.status === 'playing' && OL.introShown !== rid && !d.lastMove) { OL.introShown = rid; setTimeout(() => olIntro(d), 150); }
    if (!prev && (d.game || 'scopa') !== OL.roomGame) { OL.roomGame = d.game || 'scopa'; startOnlineView(); }
    const handEnd = !!(d.handLog && OL.lastHandLog !== d.handLog.n && prev);
    if (d.lastTrick && prev && (!prev.lastTrick || prev.lastTrick.n !== d.lastTrick.n)) {
      OL.trickShowUntil = Date.now() + 1500; OL.trickAnim = true;
      setTimeout(() => collectTrick(d, () => { OL.trickAnim = false; renderOnlineGame(); if (handEnd && d.status !== 'done') showRoundSummary(d); if (OL.endPending) { OL.endPending = false; endOnline(); } }), 1500);
      onTrick(d);
    }
    if (d.game === 'calcio' && d.lastMove && prev && (!prev.lastMove || prev.lastMove.n !== d.lastMove.n)) czOnlineMove(d, prev);
    else if (d.game === 'casa' && d.lastMove && prev && (!prev.lastMove || prev.lastMove.n !== d.lastMove.n)) caOnlineMove(d, prev);
    else if (d.game === 'casa' || d.game === 'calcio') { /* niente: i lanci si animano solo quando arrivano */ }
    else if (d.lastMove && (!prev || !prev.lastMove || prev.lastMove.n !== d.lastMove.n)) {
      onRemoteMove(d.lastMove, prev);
      if (prev && (d.game || 'scopa') === 'scopa' ) OL.animQ.push({ m: d.lastMove, before: prev, after: d, handEnd });
    }
    if (d.handLog && (!OL.lastHandLog || OL.lastHandLog !== d.handLog.n)) { if (prev) showHandLog(d.handLog); OL.lastHandLog = d.handLog.n; }
    if (d.emote && d.emote.at !== OL.lastEmote) { OL.lastEmote = d.emote.at; if (d.emote.p !== meIdx() && prev) emoteBubble(d.emote.k, 1); }
    if (handEnd && (d.game || 'scopa') === 'tressette' && d.status !== 'done' && !d.lastTrick) setTimeout(() => showRoundSummary(d), 400);
    if (d.game === 'tressette' && d.status === 'playing' && d.bg && OL.bgSeen !== rid + ':' + d.bg.n) { OL.bgSeen = rid + ':' + d.bg.n; const bgd = d; setTimeout(() => olBuonGioco(bgd), prev && !handEnd ? 300 : (prev ? 1200 : 2600)); }
    if (handEnd && d.game === 'scopa4' && d.status !== 'done') setTimeout(() => showRoundSummary(d), 600);
    if (OL.animQ.length && !OL.animating) runAnimQ();
    renderOnlineGame();
    if (d.status === 'done' && !OL.ended) { if (d.game === 'morra' || d.game === 'sette') { if (!OL.endSched) { OL.endSched = true; setTimeout(() => { if (!OL.ended) endOnline(); }, d.endReason === 'punti' ? 2500 : 0); } } else if (OL.animating || OL.trickAnim) OL.endPending = true; else endOnline(); }
  });
  clearInterval(OL.timer);
  OL.timer = setInterval(onlineTick, 1000);
}
function startOnlineView() {
  clearTimeout(timer);
  $('layer').innerHTML = '';
  if ((OL.roomGame || '') === 'casa') { currentKind = 'casa'; G = { online: true, onHand: () => {}, onAct: () => {}, render: renderOnlineGame }; caOnlineView(); return; }
  if ((OL.roomGame || '') === 'calcio') { currentKind = 'calcio'; G = { online: true, onHand: () => {}, onAct: () => {}, render: renderOnlineGame }; czOnlineView(); return; }
  go('vGame');
  $('quitBtn').textContent = 'Menu';
  const g = OL.roomGame || 'scopa';
  currentKind = g;
  $('gTitle').textContent = OL_GAMES[g] + ' online';
  $('table').style.removeProperty('--n'); $('hand').className = g === 'tressette' ? 'hand many' : (g === 'morra' || g === 'sette' ? 'hand none' : 'hand'); $('opp').className = g === 'tressette' ? 'opp many' : 'opp';
  G = { online: true, onHand: olHand, onAct: olAct, render: renderOnlineGame };
  $('table').innerHTML = '<div class="empty">Collegamento alla partita…</div>';
}
const pauseOn = (d) => !!(d && d.pause && d.lastMove && d.pause === d.lastMove.n);
const pauseLeft = (d) => (pauseOn(d) ? Math.max(0, PAUSE_MS - (Date.now() - tms(d.lastMoveAt))) : 0);
function olHand(i) {
  const d = OL.room, me = meIdx();
  if (!d || d.status !== 'playing' || d.turn !== me || OL.busy || OL.animating || pauseLeft(d) > 0) return;
  const cid = d['hand' + me][i];
  if (!isScopaG(d.game)) {
    if (Date.now() < OL.trickShowUntil) return;
    if (!legalCards(d, me).includes(cid)) { flash('Rispondi al seme!'); return; }
    sendMove(cid, []); return;
  }
  const opts = capOptions(cid, d.table);
  if (opts.length <= 1) { sendMove(cid, opts[0] || []); return; }
  OL.sel = { cid, opts }; renderOnlineGame();
}
function olAct(act, k) {
  if (act === 'otake' && OL.sel) { const s = OL.sel; OL.sel = null; sendMove(s.cid, s.opts[+k]); }
  if (act === 'ocancel') { OL.sel = null; renderOnlineGame(); }
  if (act === 'emote') sendEmote(+k);
  if (act === 'claim') claimWin();
  if (act === 'smhit') sendAct('hit');
  if (act === 'smstay') sendAct('stay');
  if (act === 'mf') { OL.mpick.f = +k; if (OL.mpick.c && (OL.mpick.c < OL.mpick.f + 1 || OL.mpick.c > OL.mpick.f + 5)) OL.mpick.c = 0; renderOnlineGame(); }
  if (act === 'mc') { OL.mpick.c = +k; renderOnlineGame(); }
  if (act === 'mgo') morraGo(false);
}
async function sendMove(cid, take) {
  if (OL.busy) return;
  OL.busy = true; OL.sel = null;
  const ref = FB.doc(OL.db, 'rooms', OL.rid), me = meIdx();
  try {
    await FB.runTransaction(OL.db, async (tx) => {
      const s = await tx.get(ref); const d = s.data();
      if (!d || d.status !== 'playing' || d.turn !== me || !d['hand' + me].includes(cid)) throw new Error('turno');
      const st = cloneState(d);
      if (d.game === 'scopa4') applyMove4(st, me, cid, take, d.names);
      else if ((d.game || 'scopa') === 'scopa') applyMove(st, me, cid, take);
      else { if (!legalCards(d, me).includes(cid)) throw new Error('turno'); applyTrick(st, me, cid, d.game); }
      tx.update(ref, Object.assign(st, { v: d.v + 1, lastMoveAt: FB.serverTimestamp() }));
    });
  } catch (e) { if (e.message !== 'turno') flash('Errore di rete'); }
  OL.busy = false;
}
function sendEmote(k) {
  if (!OL.rid || Date.now() - (OL.emoteAt || 0) < 3000) return;
  OL.emoteAt = Date.now();
  FB.updateDoc(FB.doc(OL.db, 'rooms', OL.rid), { emote: { p: meIdx(), k, at: Date.now() } }).catch(() => {});
  emoteBubble(k, 0);
}
function claimWin() {
  const me = meIdx();
  FB.updateDoc(FB.doc(OL.db, 'rooms', OL.rid), { status: 'done', winner: myT(), endReason: 'tempo' }).catch(() => flash('Aspetta ancora un po’'));
}
function resign() {
  if (!OL.rid || !OL.room || OL.room.status !== 'playing') return;
  FB.updateDoc(FB.doc(OL.db, 'rooms', OL.rid), { status: 'done', winner: 1 - myT(), endReason: 'abbandono' }).catch(() => {});
}
function onlineTick() {
  const d = OL.room; if (!d || d.status !== 'playing') return;
  const me = meIdx(), pl = pauseLeft(d), el = Date.now() - tms(d.lastMoveAt) - (pauseOn(d) ? PAUSE_MS : 0);
  if (OL.wasPaused && !pl) { OL.wasPaused = false; renderOnlineGame(); return; }
  if (pl) OL.wasPaused = true;
  const t = $('olTimer');
  if (t) { if (pl) { t.textContent = 'si riparte tra ' + Math.ceil(pl / 1000) + 's'; t.classList.remove('low'); } else { const left = Math.max(0, Math.ceil((TURN_MS - el) / 1000)); t.textContent = left + 's'; t.classList.toggle('low', left <= 10); } }
  if (pl || OL.animating) return;
  if (d.game === 'morra' || d.game === 'sette') { extraTick(d, me, el); return; }
  if (d.game === 'calcio') { czTick(d, me, el); return; }
  if (d.game === 'casa') { caTick(d, me, el); return; }
  if (d.turn === me && el > TURN_MS && !OL.busy) { const h = !isScopaG(d.game) ? legalCards(d, me) : d['hand' + me]; if (h.length) { const cid = h[0]; const o = !isScopaG(d.game) ? [] : capOptions(cid, d.table); sendMove(cid, o[0] || []); flash('Tempo scaduto!'); } }
  if (d.turn === me && el > TURN_MS - 10000 && el < TURN_MS - 9000) say('lento', 1);
  const cl = $('olClaim'); if (cl) cl.hidden = !(d.turn !== me && el > CLAIM_MS && Date.now() - tms(d.lastMoveAt) > CLAIM_MS + 2000);
}
function onRemoteMove(m, prev) {
  if (!prev) return;
  if (OL.room && (OL.room.game === 'morra' || OL.room.game === 'sette' || OL.room.game === 'calcio' || OL.room.game === 'casa')) return;
  const me = meIdx(), who = m.p === me ? 'Tu' : OL.names(m.p);
  const c = cardOf(m.card);
  if (OL.room && !isScopaG(OL.room.game)) { OL.msg = who + (m.p === me ? ' hai giocato ' : ' gioca ') + cname(c) + '.'; fx('card'); return; }
  OL.msg = who + (m.p === me ? ' hai giocato ' : ' gioca ') + cname(c) + (m.took.length ? (m.p === me ? ' e prendi ' : ' e prende ') + m.took.length + (m.took.length === 1 ? ' carta' : ' carte') : '') + '.';
  const mate = OL.room && OL.room.game === 'scopa4' && m.p % 2 === me % 2;
  if (m.scopa) { say(m.p === me || mate ? 'scopa' : 'cpuScopa', m.p === me || mate ? 0 : 1); OL.msg += ' Scopa!'; }
  else if (m.took.includes('campagna-7') || m.card === 'campagna-7' && m.took.length) say(m.p === me ? 'settebello' : 'cpuBig', m.p === me ? 0 : 1);
  else fx(m.took.length ? 'take' : 'card');
}
function onTrick(d) {
  const t = d.lastTrick, me = meIdx(), mine = t.w === me;
  const pts = d.game === 'briscola' ? (t.g ? t.g + ' punti' : 'solo lisci') : (t.g ? fmtThirds(t.g) + ' punti' : 'solo cartine');
  OL.msg = d.game === 'briscola' ? (mine ? 'Prendi tu.' : 'Prende ' + d.names[t.w] + '.') : (mine ? 'Prendi tu: ' : 'Prende ' + d.names[t.w] + ': ') + pts + '.';
  if (d.lastDraw && d.game === 'tressette') {
    OL.msg += ' Hai pescato ' + cname(cardOf(d.lastDraw[me])) + '. Ricordati la carta dell’avversario: si vede solo per poco!';
    // la carta pescata resta scoperta solo per pochi secondi (dopo che la presa è stata raccolta)
    // dopo la presa le carte pescate vengono in primo piano, poi si posano; quella dell'avversario resta scoperta pochi secondi
    const t0 = Date.now() + 1500 + 2300, dr = d.lastDraw.slice(), nm = d.names[1 - me];
    OL.drawFlash = { n: t.n, from: t0, until: t0 + TR_FLASH_MS };
    setTimeout(() => { if (OL.room && OL.room.game === 'tressette' && !OL.ended) trShowDraw(dr[me], dr[1 - me], nm.slice(0, 14), () => {}); }, 1500);
    setTimeout(() => { if (OL.room && OL.room.game === 'tressette') renderOnlineGame(); }, t0 - Date.now() + 40);
    setTimeout(() => { if (OL.room && OL.room.game === 'tressette') renderOnlineGame(); }, t0 - Date.now() + TR_FLASH_MS + 80);
  }
  if (t.g >= (d.game === 'briscola' ? 20 : 4)) say(mine ? 'bella' : 'cpuBig', mine ? 0 : 1); else fx(mine ? 'take' : 'card');
}
const fmtThirds = (t) => { const i = Math.floor(t / 3), r = t % 3; return (i ? String(i) : '') + (r ? (i ? ' e ' : '') + r + '/3' : (i ? '' : '0')); };
/* buongioco online: una striscia in alto che dice chi ha fatto le combinazioni */
function olBuonGioco(d) {
  if (!d.bg || OL.ended) return;
  const me = meIdx(), op = 1 - me, c = d.bg.c;
  const old = $('bgBanner'); if (old) old.remove();
  const el = document.createElement('div'); el.id = 'bgBanner'; el.className = 'bgbanner';
  el.innerHTML = '<h3>' + (c[me].length ? trBgTitle(c[me].length) : 'Buongioco di ' + esc(d.names[op].slice(0, 14)) + '!') + '</h3>' + (c[me].length ? trBgHTML('Tu:', c[me]) : '') + (c[op].length ? trBgHTML(esc(d.names[op].slice(0, 14)) + ':', c[op]) : '') + '<small>Un buongioco vale 3 punti, due 6, tre 9 · tocca per chiudere</small>';
  el.onclick = () => el.remove();
  document.body.appendChild(el); fx('big');
  if (c[me].length) trBgSpeak(c[me].length); else trBgSpeak(c[op].length, d.names[op].slice(0, 14));
  setTimeout(() => { if (el.isConnected) el.remove(); }, 6500);
}
function showHandLog(h) {
  const me = myT();
  OL.msg = 'Fine smazzata: ' + h.pts[me] + ' a ' + h.pts[1 - me] + ' per te. ' + h.det.join(' · ');
}
function emoteBubble(k, who) {
  const b = document.createElement('div');
  b.className = 'emote ' + (who ? 'opp' : 'me'); b.textContent = tr(EMOTES[k] || '');
  document.body.appendChild(b); setTimeout(() => b.remove(), 2600);
  if (who) fx('card');
}
function renderOnlineGame(force) {
  if (OL.animating && !force) return;
  const d = OL.viewRoom || OL.room; if (!d || G === null || !G.online) return;
  if (d.status === 'waiting') return;
  if (d.game === 'calcio') { czOnlineRender(d); return; }
  if (d.game === 'casa') { caOnlineRender(d); return; }
  if (d.game === 'morra') { renderMorraOnline(d); return; }
  if (d.game === 'sette') { renderSetteOnline(d); return; }
  if (d.game === 'scopa4') { renderScopa4(d); return; }
  if (d.game && d.game !== 'scopa') { renderTrickOnline(d); return; }
  const me = meIdx(), op = 1 - me, my = d.status === 'playing' && d.turn === me && !OL.viewRoom && !pauseLeft(d);
  setScore(d.total[me], d.total[op], 'a 11'); const sm = $('gScore').querySelectorAll('small'); if (sm[1]) sm[1].textContent = d.names[op].slice(0, 8);
  $('opp').innerHTML = d['hand' + op].map(back).join('') + '<span class="side olname"><img src="' + AVIMG[d.avs[op]] + '" alt="">' + esc(d.names[op]) + ' · liv. ' + d.lvs[op] + '</span>';
  $('oppSide').innerHTML = 'Prese <strong>' + d['caps' + op].length + '</strong>' + (d.scope[op] ? ' · Scope <span class="pip">' + d.scope[op] + '</span>' : '');
  $('youSide').innerHTML = 'Prese <strong>' + d['caps' + me].length + '</strong>' + (d.scope[me] ? ' · Scope <span class="pip">' + d.scope[me] + '</span>' : '');
  $('deckBox').innerHTML = (d.deck.length ? back() : '') + '<span class="side">Mazzo <strong>' + d.deck.length + '</strong></span>';
  const hint = OL.sel ? new Set(OL.sel.opts.flat()) : new Set();
  $('table').innerHTML = d.table.length ? d.table.map((id) => '<div class="card' + (hint.has(id) ? ' hint' : '') + '">' + img(cardOf(id)) + '</div>').join('') : '<div class="empty">Tavolo vuoto</div>';
  fitTable();
  $('hand').innerHTML = d['hand' + me].map((id, i) => '<button class="card' + (OL.sel && OL.sel.cid === id ? ' sel' : '') + '" data-i="' + i + '"' + (my && !OL.busy ? '' : ' disabled') + '>' + img(cardOf(id)) + '</button>').join('');
  let bar = '<div class="msg">' + (OL.msg ? esc(OL.msg) + ' ' : '') + (d.status === 'playing' ? (my ? '<em>Tocca a te.</em>' : 'Tocca a ' + esc(d.names[op]) + '.') + ' <span class="oltimer" id="olTimer"></span>' : '') + '</div>';
  if (OL.sel) bar += OL.sel.opts.map((o, k) => '<button class="btn small take" data-act="otake" data-k="' + k + '">Prendi ' + o.map((id) => short(cardOf(id))).join(' + ') + '</button>').join('') + '<button class="btn small ghost" data-act="ocancel">Annulla</button>';
  bar += '<div class="emotes">' + EMOTES.map((t, k) => '<button class="emo" data-act="emote" data-k="' + k + '">' + tr(t) + '</button>').join('') + '</div>';
  bar += '<button class="btn small take" id="olClaim" data-act="claim" hidden>L’avversario non risponde: vinci a tavolino</button>';
  $('bar').innerHTML = bar;
  onlineTick();
}
function renderTrickOnline(d) {
  const me = meIdx(), op = 1 - me, showing = (Date.now() < OL.trickShowUntil || OL.trickAnim) && d.lastTrick;
  const my = d.status === 'playing' && d.turn === me && !showing && !pauseLeft(d);
  if (d.game === 'briscola') setScore(d['caps' + me].length / 2, d['caps' + op].length / 2, 'prese');
  else setScore(d.total[me], d.total[op], 'a ' + TR_TARGET);
  const sm = $('gScore').querySelectorAll('small'); if (sm[1]) sm[1].textContent = d.names[op].slice(0, 8);
  const fl = d.game === 'tressette' && d.lastDraw && d.lastTrick && OL.drawFlash && OL.drawFlash.n === d.lastTrick.n && Date.now() >= OL.drawFlash.from && Date.now() < OL.drawFlash.until ? d.lastDraw[op] : null;
  $('opp').innerHTML = d['hand' + op].map((id) => (id === fl ? '<div class="card seen new" title="Carta pescata: ricordatela!">' + img(cardOf(id)) + '</div>' : back())).join('') + '<span class="side olname"><img src="' + AVIMG[d.avs[op]] + '" alt="">' + esc(d.names[op]) + ' · liv. ' + d.lvs[op] + '</span>';
  $('oppSide').innerHTML = d.game === 'briscola' ? 'Briscola <strong>' + SUIT_NAME[cardOf(d.bris).s] + '</strong>' : 'Prese <strong>' + d['caps' + op].length / 2 + '</strong>';
  $('youSide').innerHTML = d.game === 'briscola' ? 'Punti a fine partita' : 'Prese <strong>' + d['caps' + me].length / 2 + '</strong>';
  $('deckBox').innerHTML = (d.deck.length ? back() + (d.game === 'briscola' ? '<img class="bris" src="' + IMG[d.bris] + '" alt="Briscola: ' + cname(cardOf(d.bris)) + '">' : '') : '') + '<span class="side">Mazzo <strong>' + d.deck.length + '</strong></span>';
  const trick = showing ? d.lastTrick.cards : (d.trick || []);
  const slot = (p) => { const t = trick.find((x) => x.p === p); return '<div class="slot">' + (t ? '<div class="card' + (showing && d.lastTrick.w === p ? ' win' : '') + '">' + img(cardOf(t.c)) + '</div>' : '<div class="ghostcard"></div>') + (p === me ? 'Tu' : esc(d.names[p])) + '</div>'; };
  $('table').innerHTML = '<div class="trick">' + slot(op) + slot(me) + '</div>';
  const ok = my ? legalCards(d, me) : [];
  const hand = d['hand' + me].map((id, i) => ({ id, i }));
  if (d.game === 'tressette') hand.sort((a, b) => { const x = cardOf(a.id), y = cardOf(b.id); return SUITS.indexOf(x.s) - SUITS.indexOf(y.s) || TR_RANK[y.v] - TR_RANK[x.v]; });
  $('hand').innerHTML = hand.map(({ id, i }) => '<button class="card' + (d.game === 'tressette' ? ' small10' : '') + (d.lastDraw && d.lastDraw[me] === id ? ' new' : '') + '" data-i="' + i + '"' + (my && !OL.busy && ok.includes(id) ? '' : ' disabled') + '>' + img(cardOf(id)) + '</button>').join('');
  let bar = '<div class="msg">' + (OL.msg ? esc(OL.msg) + ' ' : '') + (d.status === 'playing' && !showing ? (my ? '<em>Tocca a te.</em>' : 'Tocca a ' + esc(d.names[op]) + '.') + ' <span class="oltimer" id="olTimer"></span>' : '') + '</div>';
  bar += '<div class="emotes">' + EMOTES.map((t, k) => '<button class="emo" data-act="emote" data-k="' + k + '">' + tr(t) + '</button>').join('') + '</div>';
  bar += '<button class="btn small take" id="olClaim" data-act="claim" hidden>L’avversario non risponde: vinci a tavolino</button>';
  $('bar').innerHTML = bar;
  onlineTick();
}

/* ---------- sette e mezzo online ---------- */
const smMatta = (c) => c.s === 'campagna' && c.v === 10;
const smVal = (c) => (c.v >= 8 ? 0.5 : c.v);
function smTotal(ids) {
  const cards = ids.map(cardOf); let base = 0, matte = 0;
  for (const c of cards) { if (smMatta(c)) matte++; else base += smVal(c); }
  if (!matte) return base;
  for (let v = 7; v >= 0.5; v -= 0.5) { if ((Number.isInteger(v) || v === 0.5) && base + v + (matte - 1) * 0.5 <= 7.5) return base + v + (matte - 1) * 0.5; }
  return base + matte * 0.5;
}
const smFmt = (n) => (n % 1 ? (Math.floor(n) ? Math.floor(n) + ' e mezzo' : 'mezzo') : String(n));
const smReale = (ids) => ids.length === 2 && smTotal(ids) === 7.5 && ids.map(cardOf).some((c) => c.v === 7 && !smMatta(c));
function smDeal(st) {
  const deck = freshDeck();
  st.sm = { deck, h0: [deck.shift()], h1: [deck.shift()], r: st.sm ? st.sm.r + 1 : 1 };
  st.turn = 1 - st.dealer;
}
function applySette(st, p, act) {
  const S = st.sm, dl = st.dealer, non = 1 - dl;
  st.lastMove = { p, card: '', took: [], scopa: false, n: (st.lastMove ? st.lastMove.n : 0) + 1 };
  const end = (w, why) => {
    st.total[w]++;
    st.smLog = { n: S.r, h0: S.h0.slice(), h1: S.h1.slice(), t: [smTotal(S.h0), smTotal(S.h1)], w, why, dealer: dl };
    if (st.total[w] >= 5) { st.status = 'done'; st.winner = w; st.endReason = 'punti'; return; }
    st.dealer = 1 - dl; smDeal(st);
  };
  let stay = act === 'stay';
  if (act === 'hit') {
    S['h' + p].push(S.deck.shift());
    const t = smTotal(S['h' + p]);
    if (t > 7.5) { end(1 - p, 'sballa'); return st; }
    if (t === 7.5) stay = true;
  }
  if (stay) {
    if (p === non) st.turn = dl;
    else { const tn = smTotal(S['h' + non]), td = smTotal(S['h' + dl]); end(tn > td ? non : dl, tn > td ? 'punti' : tn === td ? 'pari' : 'punti'); }
  }
  return st;
}
function renderSetteOnline(d) {
  const me = meIdx(), op = 1 - me, L = d.smLog;
  if (OL.smLastN === null) OL.smLastN = L ? L.n : 0;
  if (L && OL.smLastN !== L.n) {
    OL.smLastN = L.n;
    {
      OL.smShowUntil = Date.now() + 2600;
      setTimeout(() => renderOnlineGame(), 2650);
      const mine = L.w === me;
      if (mine && smReale(L['h' + me])) OL.reali = (OL.reali || 0) + 1;
      if (L.why === 'sballa') say(mine ? 'bancoSballa' : 'sballo', mine ? 0 : 1); else fx(mine ? 'take' : 'sad');
    }
  }
  const showing = L && Date.now() < OL.smShowUntil;
  const S = d.sm, dl = showing ? L.dealer : d.dealer;
  const src = showing ? L : S, hands = [src.h0, src.h1];
  const my = d.status === 'playing' && d.turn === me && !showing;
  setScore(d.total[me], d.total[op], 'a 5'); const sm = $('gScore').querySelectorAll('small'); if (sm[1]) sm[1].textContent = d.names[op].slice(0, 8);
  const oppCards = hands[op].map((id, i) => (i === 0 && !showing ? '<div class="card">' + back() + '</div>' : '<div class="card">' + img(cardOf(id)) + '</div>')).join('');
  $('opp').innerHTML = oppCards + '<span class="side olname"><img src="' + AVIMG[d.avs[op]] + '" alt="">' + esc(d.names[op]) + (dl === op ? ' · <b>banco</b>' : '') + '</span>';
  $('oppSide').innerHTML = showing ? esc(d.names[op].slice(0, 10)) + ' <span class="tot">' + smFmt(L.t[op]) + '</span>' : (hands[op].length > 1 ? 'Carte <strong>' + hands[op].length + '</strong> (una coperta)' : 'Una carta coperta');
  $('youSide').innerHTML = 'Tu <span class="tot">' + smFmt(smTotal(hands[me])) + '</span>' + (dl === me ? ' · banco' : '');
  $('deckBox').innerHTML = back() + '<span class="side">Mano <strong>' + (showing ? L.n : S.r) + '</strong></span>';
  $('table').style.setProperty('--n', hands[me].length);
  $('table').innerHTML = hands[me].map((id) => '<div class="card big">' + img(cardOf(id)) + '</div>').join('') + (hands[me].map(cardOf).some(smMatta) ? '<div class="lab">Il Re di Campagna è la matta: vale quello che ti conviene.</div>' : '');
  $('hand').innerHTML = '';
  let msg;
  if (showing) {
    const w = L.w === me ? 'Mano tua!' : 'Mano a ' + esc(d.names[op]) + '.';
    const who = (p) => (p === me ? 'Tu' : esc(d.names[op]));
    msg = L.why === 'sballa' ? who(1 - L.w) + ' sballa con ' + smFmt(L.t[1 - L.w]) + '. ' + w : who(me) + ' ' + smFmt(L.t[me]) + ', ' + esc(d.names[op]) + ' ' + smFmt(L.t[op]) + (L.why === 'pari' ? ': a parità vince il banco. ' : '. ') + w;
  } else if (d.status !== 'playing') msg = '';
  else if (my) msg = (dl === me ? 'Sei il banco: ' + esc(d.names[op]) + ' sta con ' + (S['h' + op].length) + ' carte. ' : 'Tocca a te: ') + '<em>carta o sto?</em> <span class="oltimer" id="olTimer"></span>';
  else msg = (d.turn === dl ? esc(d.names[op]) + ' gioca il banco…' : esc(d.names[op]) + ' sta pensando…') + ' <span class="oltimer" id="olTimer"></span>';
  let bar = '<div class="msg" style="width:100%">' + msg + '</div>';
  if (my) bar += '<button class="btn take" data-act="smhit">Carta</button><button class="btn" data-act="smstay">Sto</button>';
  bar += '<div class="emotes">' + EMOTES.map((t, k) => '<button class="emo" data-act="emote" data-k="' + k + '">' + tr(t) + '</button>').join('') + '</div>';
  bar += '<button class="btn small take" id="olClaim" data-act="claim" hidden>L’avversario non risponde: vinci a tavolino</button>';
  $('bar').innerHTML = bar;
  onlineTick();
}

/* ---------- morra online (con mossa nascosta finché anche l'altro non butta) ---------- */
async function olHash(t) {
  try { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)); return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join(''); }
  catch (e) { let h = 2166136261; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return 'f' + (h >>> 0).toString(16); }
}
function applyMorra(st, p, a) {
  const M = st.mo;
  st.lastMove = { p, card: '', took: [], scopa: false, n: (st.lastMove ? st.lastMove.n : 0) + 1 };
  if (a.k === 'commit') { M.h = a.h; M.s = p; st.turn = 1 - p; }
  else if (a.k === 'throw') { M.o = { f: a.f, c: a.c }; st.turn = M.s; }
  else if (a.k === 'reveal') {
    const o = 1 - p, sum = a.f + M.o.f, mine = a.c === sum, theirs = M.o.c === sum;
    const w = mine && !theirs ? p : theirs && !mine ? o : -1;
    if (w >= 0) st.total[w]++;
    const f = [0, 0], c = [0, 0]; f[p] = a.f; c[p] = a.c; f[o] = M.o.f; c[o] = M.o.c;
    st.mo = { r: M.r + 1, h: null, o: null, s: null, last: { n: M.r, f, c, sum, w, salt: a.salt, h: M.h, s: p } };
    st.turn = o;
    if (st.total[0] >= MORRA_TO || st.total[1] >= MORRA_TO) { st.status = 'done'; st.winner = st.total[0] > st.total[1] ? 0 : 1; st.endReason = 'punti'; }
  }
  return st;
}
async function sendAct(a) {
  if (OL.busy) return;
  OL.busy = true;
  const ref = FB.doc(OL.db, 'rooms', OL.rid), me = meIdx();
  try {
    await FB.runTransaction(OL.db, async (tx) => {
      const s = await tx.get(ref); const d = s.data();
      if (!d || d.status !== 'playing' || d.turn !== me) throw new Error('turno');
      const st = cloneState(d);
      if (d.game === 'morra') applyMorra(st, me, a); else applySette(st, me, a);
      tx.update(ref, Object.assign(st, { v: d.v + 1, lastMoveAt: FB.serverTimestamp() }));
    });
  } catch (e) { if (e.message !== 'turno') flash('Errore di rete'); }
  OL.busy = false;
}
const msecKey = () => 'msec-' + OL.rid;
function msecGet(r) { try { const x = JSON.parse(localStorage.getItem(msecKey()) || 'null'); return x && x.r === r ? x : null; } catch (e) { return OL.msec && OL.msec.r === r ? OL.msec : null; } }
function msecSet(x) { OL.msec = x; try { localStorage.setItem(msecKey(), JSON.stringify(x)); } catch (e) { /* niente */ } }
async function morraGo(auto) {
  const d = OL.room, me = meIdx(); if (!d || d.turn !== me || OL.busy || Date.now() < OL.mShowUntil) return;
  let { f, c } = OL.mpick;
  if (!f || !c) { if (!auto) { flash('Scegli dita e numero'); return; } f = f || 1 + Math.floor(Math.random() * 5); c = c && c > f && c <= f + 5 ? c : f + 1 + Math.floor(Math.random() * 5); }
  const M = d.mo;
  if (!M.h) {
    const salt = Math.random().toString(36).slice(2) + Date.now().toString(36);
    const h = await olHash(f + '|' + c + '|' + salt);
    msecSet({ r: M.r, f, c, salt });
    OL.mWait = { f, c };
    await sendAct({ k: 'commit', h });
  } else if (!M.o && M.s !== me) {
    OL.mWait = { f, c };
    await sendAct({ k: 'throw', f, c });
  }
  morraSpeak(mNum(c));
}
function morraAutoReveal(d) {
  const me = meIdx(), M = d.mo;
  if (d.status !== 'playing' || d.turn !== me || !M.o || M.s !== me || OL.busy || OL.revealing === M.r) return;
  OL.revealing = M.r;
  let x = msecGet(M.r);
  if (!x) x = { f: 1 + Math.floor(Math.random() * 5), c: 0, salt: 'perso' }, x.c = x.f + 1 + Math.floor(Math.random() * 5);
  sendAct({ k: 'reveal', f: x.f, c: x.c, salt: x.salt }).then(() => setTimeout(() => { if (OL.revealing === M.r) OL.revealing = null; }, 3000));
}
function renderMorraOnline(d) {
  const me = meIdx(), op = 1 - me, M = d.mo, L = M.last;
  if (OL.mLastN === null) OL.mLastN = L ? L.n : 0;
  if (L && OL.mLastN !== L.n) {
    OL.mLastN = L.n;
    {
      OL.mShowUntil = Date.now() + 2300; OL.mpick = { f: 0, c: 0 }; OL.mWait = null;
      setTimeout(() => renderOnlineGame(), 2350);
      const ms = morraStats();
      if (L.w === me) { ms.pts++; if (L.c[me] === 10) ms.sana++; OL.mRun = (OL.mRun || 0) + 1; ms.run = Math.max(ms.run, OL.mRun); save(); fx('take'); }
      else { OL.mRun = 0; fx(L.w === op ? 'sad' : 'card'); }
      setTimeout(() => morraSpeak(mNum(L.c[op])), 300);
      // controllo: la mossa nascosta corrisponde a quella rivelata?
      if (L.s === op && L.salt !== 'perso') olHash(L.f[op] + '|' + L.c[op] + '|' + L.salt).then((h) => { if (h !== L.h) flash('Attenzione: la mossa dell’avversario non torna!'); });
      requestAnimationFrame(() => { const a = document.querySelector('.olmorra .marena'); if (a) { a.classList.remove('shake'); void a.offsetWidth; a.classList.add('shake'); } });
    }
  }
  const showing = L && Date.now() < OL.mShowUntil;
  setScore(d.total[me], d.total[op], 'a ' + MORRA_TO); const sm = $('gScore').querySelectorAll('small'); if (sm[1]) sm[1].textContent = d.names[op].slice(0, 8);
  $('opp').innerHTML = '<span class="side olname"><img src="' + AVIMG[d.avs[op]] + '" alt="">' + esc(d.names[op]) + ' · liv. ' + d.lvs[op] + '</span>';
  $('oppSide').innerHTML = ''; $('youSide').innerHTML = ''; $('deckBox').innerHTML = '<span class="side">Mano <strong>' + (showing ? L.n : M.r) + '</strong></span>';
  $('hand').innerHTML = '';
  const myTurn = d.status === 'playing' && d.turn === me && !showing;
  const iThrew = !showing && ((M.h && M.s === me) || (M.o && M.s !== me));
  const oppThrew = !showing && ((M.h && M.s === op) || (M.o && M.s === me));
  const handMe = showing ? handSVG(L.f[me], false) : handSVG((iThrew && OL.mWait ? OL.mWait.f : OL.mpick.f) || 5, false);
  const handOp = showing ? handSVG(L.f[op], true) : handSVG(5, true);
  let mid;
  if (showing) { const txt = L.w === me ? (L.c[me] === 10 ? tr('Sanaa! Punto tuo!') : 'Punto tuo!') : L.w === op ? 'Punto a ' + esc(d.names[op]) + '!' : L.w === -1 && L.c[0] === L.sum ? 'Tutti e due! Si ributta.' : 'Nessuno! Si ributta.'; mid = '<b class="msum">' + L.sum + '</b><small>' + txt + '</small>'; }
  else mid = '<small>' + (oppThrew ? esc(d.names[op]) + ' ha già buttato la mano!' : iThrew ? 'Aspetta ' + esc(d.names[op]) + '…' : 'Scegli dita e numero!') + '</small>';
  $('table').style.removeProperty('--n');
  $('table').innerHTML = '<div class="olmorra"><div class="marena"><div class="mside foe"><div class="mhandbox">' + handOp + '</div>' + (showing ? '<div class="mcall foe">' + mNum(L.c[op]) + '</div>' : '') + '</div><div class="mmid">' + mid + '</div><div class="mside me"><div class="mhandbox">' + handMe + '</div>' + (showing ? '<div class="mcall me">' + mNum(L.c[me]) + '</div>' : '') + '</div></div></div>';
  let bar = '';
  const canPick = myTurn && !iThrew && !(M.o && M.s === me);
  if (canPick) {
    const P2 = OL.mpick;
    bar += '<div class="olmpick"><span>Le tue dita</span><div class="mrow">' + [1, 2, 3, 4, 5].map((n) => '<button class="mbtn' + (P2.f === n ? ' on' : '') + '" data-act="mf" data-k="' + n + '">' + n + '</button>').join('') + '</div>' +
      '<span>Cosa gridi</span><div class="mrow calls">' + [2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => '<button class="mbtn' + (P2.c === n ? ' on' : '') + '" data-act="mc" data-k="' + n + '"' + (P2.f && (n < P2.f + 1 || n > P2.f + 5) ? ' disabled' : '') + '>' + n + '</button>').join('') + '</div>' +
      '<button class="btn take" data-act="mgo"' + (P2.f && P2.c ? '' : ' disabled') + '>Mo… rra!</button></div>';
  }
  bar += '<div class="msg">' + (d.status === 'playing' && !showing ? (canPick ? '<em>Tocca a te.</em>' : 'Aspetta…') + ' <span class="oltimer" id="olTimer"></span>' : '') + '</div>';
  bar += '<div class="emotes">' + EMOTES.map((t, k) => '<button class="emo" data-act="emote" data-k="' + k + '">' + tr(t) + '</button>').join('') + '</div>';
  bar += '<button class="btn small take" id="olClaim" data-act="claim" hidden>L’avversario non risponde: vinci a tavolino</button>';
  $('bar').innerHTML = bar;
  onlineTick();
  if (!showing) morraAutoReveal(d);
}
function extraTick(d, me, el) {
  const t = $('olTimer');
  if (t) { const left = Math.max(0, Math.ceil((TURN_MS - el) / 1000)); t.textContent = left + 's'; t.classList.toggle('low', left <= 10); }
  if (d.turn === me && el > TURN_MS && !OL.busy) {
    if (d.game === 'morra') { if (!(d.mo.o && d.mo.s === me)) { morraGo(true); flash('Tempo scaduto!'); } }
    else { sendAct('stay'); flash('Tempo scaduto: stai.'); }
  }
  const cl = $('olClaim'); if (cl) cl.hidden = !(d.turn !== me && el > CLAIM_MS && Date.now() - tms(d.lastMoveAt) > CLAIM_MS + 2000);
}

/* ---------- animazioni delle giocate online ---------- */
const olRect = (el) => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
function olGhost(id, r, back) {
  const g = document.createElement(back ? 'div' : 'img');
  if (back) g.className = 'cardghost olback'; else { g.src = IMG[id]; g.className = 'cardghost'; }
  Object.assign(g.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px', transformOrigin: '50% 50%' });
  document.body.appendChild(g); return g;
}
const olWait = (ms) => new Promise((res) => setTimeout(res, ms));
function olFly(g, from, to, ms, extra) {
  const dx = to.x - from.x, dy = to.y - from.y, sx = to.w / from.w, sy = to.h / from.h;
  const a = g.animate([{ transform: 'none', opacity: 1 }, { transform: 'translate(' + dx * 0.55 + 'px,' + (dy * 0.55 - 30) + 'px) rotate(' + ((extra && extra.rot) || -6) + 'deg) scale(' + (1 + (sx - 1) * 0.6 + 0.08) + ',' + (1 + (sy - 1) * 0.6 + 0.08) + ')', offset: 0.55 }, { transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(' + ((extra && extra.end) || 0) + 'deg) scale(' + sx + ',' + sy + ')', opacity: extra && extra.fade ? 0.2 : 1 }], { duration: ms, easing: 'cubic-bezier(.3,.7,.3,1)', fill: 'forwards' });
  return new Promise((res) => { a.onfinish = res; });
}
function pileRect(p) { const el = $(p === meIdx() ? 'youSide' : 'oppSide'); const r = olRect(el); return { x: r.x + 4, y: r.y + r.h / 2 - 30, w: 36, h: 60 }; }
async function animScopaMove(e) {
  const { m, before: b } = e, me = meIdx(), mine = m.p === me;
  const tableEls = [...$('table').querySelectorAll('.card')];
  const tRect = tableEls.length ? olRect(tableEls[0]) : null;
  let src;
  if (mine) { const i = b['hand' + me].indexOf(m.card), el = $('hand').children[i]; src = el ? olRect(el) : null; if (el) el.style.visibility = 'hidden'; }
  else { const backs = $('opp').querySelectorAll('.back'), el = backs[Math.floor(backs.length / 2)]; src = el ? olRect(el) : null; if (el) el.style.visibility = 'hidden'; }
  const size = tRect || (src && mine ? { w: src.w * 0.82, h: src.h * 0.82 } : { w: 70, h: 117 });
  if (!src) src = { x: innerWidth / 2 - size.w / 2, y: mine ? innerHeight - 160 : 60, w: size.w, h: size.h };
  // dove si appoggia: accanto alla carta da prendere, oppure sul tavolo
  let dest;
  const took = m.took || [], tookEls = took.map((id) => tableEls[b.table.indexOf(id)]).filter(Boolean);
  if (tookEls.length) { const r = olRect(tookEls[0]); dest = { x: r.x + r.w * 0.42, y: r.y + r.h * 0.16, w: r.w, h: r.h }; }
  else if (tableEls.length) { const r = olRect(tableEls[tableEls.length - 1]); dest = { x: Math.min(innerWidth - r.w - 8, r.x + r.w + 8), y: r.y, w: r.w, h: r.h }; }
  else { const r = olRect($('table')); dest = { x: r.x + r.w / 2 - size.w / 2, y: r.y + r.h / 2 - size.h / 2, w: size.w, h: size.h }; }
  const g = olGhost(m.card, src, false);
  await olFly(g, src, dest, 430, { rot: mine ? -8 : 8 });
  fx('card');
  const ghosts = [g];
  if (tookEls.length) {
    tookEls.forEach((el) => el.classList.add('hint'));
    if (m.scopa) { const sb = document.createElement('div'); sb.className = 'olscopa'; sb.textContent = 'SCOPA!'; $('table').appendChild(sb); setTimeout(() => sb.remove(), 1300); }
    await olWait(m.scopa ? 750 : 560);
    const pile = pileRect(m.p);
    const fl = [olFly(g, dest, pile, 480, { rot: mine ? 10 : -10, end: mine ? 18 : -18, fade: true })];
    tookEls.forEach((el, k) => { const r = olRect(el); const gg = olGhost(took[k], r, false); ghosts.push(gg); el.style.visibility = 'hidden'; fl.push(new Promise((res) => setTimeout(() => olFly(gg, r, pile, 480, { rot: mine ? 10 : -10, end: mine ? 18 : -18, fade: true }).then(res), 50 * (k + 1)))); });
    await Promise.all(fl);
    if (typeof ANIM !== 'undefined') ANIM.bump($(mine ? 'youSide' : 'oppSide'));
  } else await olWait(260);
  // fine smazzata: le carte rimaste vanno a chi ha preso per ultimo
  if (e.handEnd && e.after.leftover && e.after.leftover.length && e.after.handLog) {
    const last = e.after.handLog.last, pile = pileRect(last), fl = [];
    const rest = e.after.leftover;
    rest.forEach((id, k) => {
      const el = tableEls[b.table.indexOf(id)];
      const r = el ? olRect(el) : dest;
      if (el) el.style.visibility = 'hidden';
      if (id === m.card && !took.length) { fl.push(olFly(g, dest, pile, 520, { fade: true })); return; }
      const gg = olGhost(id, r, false); ghosts.push(gg);
      fl.push(new Promise((res) => setTimeout(() => olFly(gg, r, pile, 520, { fade: true }).then(res), 60 * k)));
    });
    await olWait(250); await Promise.all(fl);
  }
  return ghosts;
}
async function runAnimQ() {
  OL.animating = true;
  while (OL.animQ.length) {
    const e = OL.animQ.shift();
    let ghosts = [];
    const reduced = typeof ANIM !== 'undefined' && ANIM.reduced && ANIM.reduced();
    if (!reduced && $('table') && !$('vGame').hidden) { try { ghosts = await animScopaMove(e); } catch (er) { /* niente */ } }
    if (typeof ANIM !== 'undefined') ANIM.quiet(300);
    OL.viewRoom = OL.animQ.length ? e.after : null;
    renderOnlineGame(true);
    ghosts.forEach((g) => g.remove());
    if (e.handEnd && e.after.status !== 'done' && !OL.animQ.length) showRoundSummary(e.after);
  }
  OL.viewRoom = null; OL.animating = false;
  renderOnlineGame();
  if (OL.endPending) { OL.endPending = false; endOnline(); }
}
function collectTrick(d, done) {
  const cards = [...$('table').querySelectorAll('.trick .card')], t = d.lastTrick;
  const reduced = typeof ANIM !== 'undefined' && ANIM.reduced && ANIM.reduced();
  if (!t || !cards.length || reduced || $('vGame').hidden) { done(); return; }
  const pile = pileRect(t.w), mine = t.w === meIdx(), gs = [];
  Promise.all(cards.map((el, k) => { const r = olRect(el), im = el.querySelector('img'); const g = olGhost(null, r, false); g.src = im ? im.src : ''; gs.push(g); el.style.visibility = 'hidden'; return new Promise((res) => setTimeout(() => olFly(g, r, pile, 480, { rot: mine ? 10 : -10, end: mine ? 18 : -18, fade: true }).then(res), 70 * k)); }))
    .then(() => { if (typeof ANIM !== 'undefined') { ANIM.quiet(300); ANIM.bump($(mine ? 'youSide' : 'oppSide')); } done(); gs.forEach((g) => g.remove()); });
}

/* ---------- resoconto tra una smazzata e l'altra ---------- */
function summaryHTML(d) {
  const h = d.handLog; if (!h) return '';
  const me = myT(), op = 1 - me, nm = d.game === 'scopa4' ? 'Avversari' : esc(d.names[op].slice(0, 12));
  const row = (label, a, b, win) => '<tr><td>' + label + '</td><td class="' + (win === me ? 'w' : '') + '">' + a + '</td><td class="' + (win === op ? 'w' : '') + '">' + b + '</td></tr>';
  const cmpW = (x, y) => (x[me] > x[op] ? me : x[op] > x[me] ? op : -1);
  let t = '<table class="olsum"><tr><th></th><th>' + (d.game === 'scopa4' ? 'Noi' : 'Tu') + '</th><th>' + nm + '</th></tr>';
  if (h.st) {
    const S = h.st, pr = (v) => (v < 0 ? '—' : v);
    t += row('Carte', S.c[me], S.c[op], cmpW(S.c)) + row('Ulivi', S.u[me], S.u[op], cmpW(S.u)) + row('Settebello', S.sb === me ? '✓' : '', S.sb === op ? '✓' : '', S.sb) + row('Primiera', pr(S.pr[me]), pr(S.pr[op]), cmpW(S.pr)) + row('Scope', S.sc[me], S.sc[op], -1);
  } else if (h.prese) {
    t += row('Prese', h.prese[me], h.prese[op], -1) + row('Punti in terzi', h.th[me], h.th[op], -1) + row('Ultima presa', h.last === me ? '✓' : '', h.last === op ? '✓' : '', h.last);
    if (h.bg && (h.bg[0] || h.bg[1])) t += row('Buongioco (già nel totale)', h.bg[me] ? '+' + h.bg[me] * 3 : '–', h.bg[op] ? '+' + h.bg[op] * 3 : '–', -1);
  }
  t += '<tr class="tot"><td>Punti smazzata</td><td>' + h.pts[me] + '</td><td>' + h.pts[op] + '</td></tr><tr class="tot big"><td>Totale</td><td>' + d.total[me] + '</td><td>' + d.total[op] + '</td></tr></table>';
  return t;
}
function showRoundSummary(d) {
  if (!d || !d.handLog || OL.ended) return;
  const me = myT(), h = d.handLog, a = h.pts[me], b = h.pts[1 - me];
  const target = (d.game || 'scopa') === 'tressette' ? TR_TARGET : 11;
  overlay('<div class="olround"><small>Smazzata ' + (h.n || 1) + ' finita</small><h2>' + (a > b ? 'Bella smazzata!' : a < b ? 'Smazzata all’avversario' : 'Smazzata pari') + '</h2>' + summaryHTML(d) +
    '<p class="pgnote">Si gioca fino a ' + target + ' punti.</p><div class="olcount"><i id="olCountBar"></i></div><p class="olcnum" id="olCountTxt"></p></div><button class="btn" id="olRoundOk">Pronto</button>');
  const ok = $('olRoundOk'); if (ok) ok.onclick = () => { $('layer').innerHTML = ''; };
  const tick = () => {
    const bar = $('olCountBar'), txt = $('olCountTxt');
    if (!bar || !OL.room) return;
    const left = pauseLeft(OL.room);
    bar.style.width = (left / PAUSE_MS * 100) + '%';
    txt.textContent = left > 0 ? 'Prossima smazzata tra ' + Math.ceil(left / 1000) + ' secondi' : 'Si riparte!';
    if (left <= 0) { setTimeout(() => { if ($('olRoundOk')) $('layer').innerHTML = ''; }, 600); return; }
    setTimeout(tick, 250);
  };
  tick();
  if (a > b) fx('big'); else fx('card');
}
function endOnline() {
  OL.ended = true;
  const d = OL.room, four = d.game === 'scopa4', me = myT(), won = d.winner === me, tie = d.winner === 2, game = four ? 'scopa' : (d.game || 'scopa');
  const o = P.online || (P.online = { w: 0, l: 0 });
  if (won) o.w++; else if (!tie) o.l++;
  const why = d.endReason === 'abbandono' ? (won ? 'L’avversario ha abbandonato la partita.' : 'Hai abbandonato la partita.') : d.endReason === 'tempo' ? (won ? 'L’avversario non rispondeva più.' : 'Non hai risposto in tempo.') : 'Finale ' + d.total[me] + ' a ' + d.total[1 - me] + '.';
  setTimeout(() => say(won ? 'win' : 'lose', won ? 0 : 1), 200);
  let gain;
  if (game === 'casa') {
    const C = caData(), a = d.total ? d.total[me] : 0;
    if (won) C.w++; else if (tie) C.d++; else C.l++;
    C.best = Math.max(C.best || 0, a);
    if (CA.m) { CA.m.over = true; caHUD(); }
    const xp = won ? 150 : tie ? 60 : 30, coins = won ? 80 : tie ? 30 : 10; gainXp(xp); eco().carlini += coins;
    gain = '<p class="pgnote">Mattoni in piedi: tu ' + a + ', ' + esc(d.names[1 - me].slice(0, 12)) + ' ' + (d.total ? d.total[1 - me] : 0) + '</p><div class="gain"><div class="xp">+' + xp + ' XP · <i class="ico coin"></i>' + coins + '</div>' + grantChest(won) + '</div>';
    save();
  } else if (game === 'calcio') {
    const C = czData(), a = d.cz ? d.cz.sc[me] : 0, b = d.cz ? d.cz.sc[1 - me] : 0;
    if (won) C.w++; else if (tie) C.d++; else C.l++;
    C.gf += a; C.gs += b;
    if (CZ.m) { CZ.m.over = true; czHUD(); }
    const xp = won ? 150 : tie ? 60 : 30, coins = won ? 80 : tie ? 30 : 10; gainXp(xp); eco().carlini += coins;
    gain = '<div class="gain"><div class="xp">+' + xp + ' XP · <i class="ico coin"></i>' + coins + '</div>' + grantChest(won) + '</div>';
    save();
  } else if (game === 'morra') {
    const ms = morraStats(), capp = won && d.total[1 - me] === 0;
    if (won) ms.w++; else if (!tie) ms.l++;
    if (capp) ms.capp++;
    const xp = won ? 120 : 30; gainXp(xp);
    gain = '<div class="gain"><div class="xp">+' + xp + ' XP</div>' + morraChest(won, 2, capp) + '</div>';
    save();
  } else gain = award(game, won, (won ? 40 : 10) + (game === 'sette' ? (OL.reali || 0) * 10 : 0), game === 'sette' ? (p) => { p.reali += OL.reali || 0; } : null, [four ? 'Scopone online' : OL_GAMES[game] + ' online contro ' + d.names[1 - me]]);
  olSaveProfile();
  const bgT = game === 'tressette' && d.bgTot && (d.bgTot[0] || d.bgTot[1]) ? '<p class="bgsum">Buongiochi nella partita: tu <b>' + d.bgTot[me] + '</b> (' + d.bgTot[me] * 3 + ' punti) · ' + esc(d.names[1 - me].slice(0, 12)) + ' <b>' + d.bgTot[1 - me] + '</b> (' + d.bgTot[1 - me] * 3 + ' punti)</p>' : '';
  gain = bgT + gain;
  overlay('<h2>' + (tie ? 'Pareggio!' : won ? (four ? 'La tua coppia ha vinto!' : 'Hai vinto online!') : four ? 'Hanno vinto ' + esc(team4Name(d, 1 - me)) : 'Ha vinto ' + esc(d.names[1 - me])) + '</h2><p>' + why + '</p>' + (d.endReason === 'punti' && game !== 'briscola' && game !== 'calcio' && game !== 'casa' ? '<p class="pgnote">Ultima smazzata</p>' + summaryHTML(d) : '') + gain +
    '<p class="pgnote">Online: ' + o.w + ' vinte · ' + o.l + ' perse</p><button class="btn" id="olAgain">Nuova partita online</button><button class="btn alt" id="olMenu">Menu</button>');
  $('olAgain').onclick = () => { $('layer').innerHTML = ''; olLeave(); go('vOnline'); };
  $('olMenu').onclick = () => { $('layer').innerHTML = ''; olLeave(); G = null; go('vHome'); };
}
function olLeave() {
  if (OL.unsub) OL.unsub(); OL.unsub = null;
  clearInterval(OL.timer);
  if (OL.room && OL.room.status === 'playing' && !OL.ended) resign();
  OL.room = null; OL.rid = null; OL.msg = '';
}

/* ---------- la sala d'attesa ---------- */
async function renderOnline() {
  const box = $('onlineBox');
  if (!window.FB) { box.innerHTML = '<div class="olcard"><h3>🌐 Gioca online</h3><p>Le partite contro altre persone funzionano nell’app per Android: qui nell’anteprima non c’è il collegamento ai server.</p></div>'; return; }
  if (!OL.ready) {
    box.innerHTML = '<div class="olcard"><h3>🌐 Gioca online</h3><p>' + (OL.err || 'Collegamento in corso…') + '</p>' + (OL.err ? '<button class="btn" data-ol="retry">Riprova</button>' : '') + '</div>';
    if (!OL.err) olInit();
    return;
  }
  const town = myTown(), rec = P.online || { w: 0, l: 0 };
  let h = '<div class="olhero"><img src="' + AVIMG[P.av] + '" alt=""><div><b>' + esc(myName()) + '</b><small>Livello ' + levelOf(P.xp) + (town ? ' · da ' + esc(town) : '') + '</small><span class="olrec"><em>' + (rec.w || 0) + '</em> vinte · <em>' + (rec.l || 0) + '</em> perse</span></div><span class="olok">● online</span></div>';
  if (OL.lastErr) h += '<div class="olcard olerr"><b>Qualcosa non va</b><p>' + esc(OL.lastErr) + '</p></div>';
  if (OL.creating) h += '<div class="olcard wait"><div class="spinner" aria-hidden="true"></div><p>Creo la stanza…</p></div>';
  else if (OL.waiting) {
    h += '<div class="olcard wait"><div class="spinner" aria-hidden="true"></div>' + (OL.waiting.game === 'scopa4' ? '<div id="olSeats"></div>' : '') + (OL.waiting.pub ? '<h3>Cerco un avversario a ' + OL_GAMES[OL.waiting.game || 'scopa'].toLowerCase() + '…</h3><p>Appena qualcuno entra, la partita parte da sola.</p>' : '<h3>Stanza creata · ' + OL_GAMES[OL.waiting.game || 'scopa'] + '</h3><p>Manda questo codice al tuo amico: lo scrive in “Entra con un codice”.</p><div class="olcode">' + OL.waiting.code + '</div>' + (navigator.share ? '<button class="btn small" data-ol="share">Invia il codice</button>' : '')) + '<button class="btn ghost" data-ol="cancel">Annulla</button></div>';
  } else {
    h += '<h3 class="olh">A cosa giochiamo?</h3><div class="olgtiles" role="tablist">' + Object.keys(OL_GAMES).map((g) => '<button role="tab" aria-selected="' + (OL.game === g) + '" data-olg="' + g + '"><span class="olgi">' + OL_ICON[g] + '</span><b>' + OL_GAMES[g] + '</b><small>' + (OL_PLAYERS[g] || 2) + ' giocatori</small></button>').join('') + '</div><p class="olrule">' + OL_RULE[OL.game].charAt(0).toUpperCase() + OL_RULE[OL.game].slice(1) + '.</p>';
    h += '<div class="olgrid"><button class="olbig quick" data-ol="quick"><span>⚡</span><b>Partita veloce</b><small>' + (OL.game === 'scopa4' ? 'Con tre giocatori a caso' : 'Contro un avversario a caso') + '</small></button><button class="olbig" data-ol="room"><span>🤝</span><b>Con gli amici</b><small>Crea una stanza e manda il codice</small></button></div>' +
      '<form class="olcard join" id="olJoin"><label for="olCode"><b>Entra con un codice</b></label><div class="field"><input id="olCode" maxlength="5" placeholder="Es. K7MQ2" autocomplete="off" autocapitalize="characters"><button class="btn" type="submit">Entra</button></div></form>';
  }
  h += '<p class="pgnote">Hai 30 secondi per ogni mossa. Con il codice gli amici entrano nella partita che hai scelto tu.</p><h3 class="olh">🏆 Classifica online</h3><ol class="olrank" id="olRank"><li class="pgnote">Carico…</li></ol>';
  box.innerHTML = h;
  try {
    const snap = await FB.getDocs(FB.query(FB.collection(OL.db, 'players'), FB.orderBy('onlineW', 'desc'), FB.limit(20)));
    const r = $('olRank'); if (!r) return;
    r.innerHTML = snap.docs.length ? snap.docs.map((d, i) => { const p = d.data(); return '<li class="' + (d.id === OL.uid ? 'me' : '') + (i < 3 ? ' top top' + (i + 1) : '') + '"><span class="pos">' + (i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1) + '</span><img src="' + (AVIMG[p.av] || AVIMG.mare) + '" alt=""><span class="nm">' + esc(p.name || 'Giocatore') + '<small>liv. ' + (p.lv || 1) + (p.town ? ' · ' + esc(p.town) : '') + '</small></span><b>' + (p.onlineW || 0) + '<small>vinte</small></b></li>'; }).join('') : '<li class="pgnote">Ancora nessuna partita: sii il primo!</li>';
  } catch (e) { const r = $('olRank'); if (r) r.innerHTML = '<li class="pgnote">Classifica non disponibile.</li>'; }
}
$('onlineBox').addEventListener('click', async (e) => {
  const gb = e.target.closest('[data-olg]'); if (gb) { OL.game = gb.dataset.olg; renderOnline(); return; }
  const b = e.target.closest('[data-ol]'); if (!b || b.disabled) return;
  const a = b.dataset.ol;
  if (a === 'retry') { OL.err = ''; OL.ready = false; renderOnline(); return; }
  if ((a === 'quick' || a === 'room') && typeof enHas === 'function' && !enHas()) { energyOverlay(null); return; }
  b.disabled = true;
  try {
    if (a === 'quick') await quickMatch();
    if (a === 'room') await createRoom(false);
    if (a === 'cancel') { stopWaiting(true); renderOnline(); }
    if (a === 'share') navigator.share({ text: 'Giochiamo a ' + OL_GAMES[OL.waiting.game || "scopa"].toLowerCase() + ' su Scopa Calabrese! Apri il gioco, vai su Gioca online → Entra con un codice e scrivi: ' + OL.waiting.code }).catch(() => {});
  } catch (err) { OL.creating = false; OL.lastErr = olErrText(err); renderOnline(); }
  b.disabled = false;
});
$('onlineBox').addEventListener('submit', async (e) => {
  if (e.target.id !== 'olJoin') return;
  e.preventDefault();
  const c = $('olCode').value.trim(); if (c.length < 4) return;
  if (typeof enHas === 'function' && !enHas()) { energyOverlay(null); return; }
  try { if (!(await joinByCode(c))) flash('Stanza non trovata'); } catch (err) { OL.lastErr = olErrText(err); renderOnline(); }
});
/* uscire dalla partita o dalla sala d'attesa */
(() => {
  const oldGo = go;
  go = function (v) {
    if (v !== 'vGame' && !(v === 'vCalcio' && OL.roomGame === 'calcio') && !(v === 'vCasa' && OL.roomGame === 'casa') && OL.rid) olLeave();
    if (v !== 'vOnline' && OL.waiting) stopWaiting(true);
    oldGo(v);
    if (v === 'vOnline') renderOnline();
  };
})();

/* ---------- scopa in 4: entrare, aspettare, uscire ---------- */
function ol4JoinTx(tx, ref, d) {
  const slot = d.players.indexOf(''); if (slot < 1) return false;
  const players = d.players.slice(), names = d.names.slice(), avs = d.avs.slice(), lvs = d.lvs.slice(), towns = (d.towns || ['', '', '', '']).slice();
  players[slot] = OL.uid; names[slot] = myName(); avs[slot] = P.av; lvs[slot] = levelOf(P.xp); towns[slot] = myTown();
  if (players.includes('')) { tx.update(ref, { players, names, avs, lvs, towns }); return 'wait4'; }
  const st = { total: [0, 0], handNo: 1, lastMove: null, handLog: null };
  dealGame(st, 'scopa4');
  tx.update(ref, Object.assign(st, { status: 'playing', players, names, avs, lvs, towns, v: d.v + 1, lastMoveAt: FB.serverTimestamp(), winner: -1, endReason: '' }));
  return 'scopa4';
}
function ol4Wait(rid) {
  const ref = FB.doc(OL.db, 'rooms', rid);
  OL.waiting = { rid, code: '', pub: true, game: 'scopa4', guest: true };
  OL.waitUnsub = FB.onSnapshot(ref, (snap) => {
    const d = snap.data();
    if (!d || !d.players.includes(OL.uid)) { if (OL.waiting && OL.waiting.rid === rid) { OL.waiting = null; if (OL.waitUnsub) OL.waitUnsub(); flash('La stanza è stata chiusa'); renderOnline(); } return; }
    if (d.status === 'playing') { stopWaiting(false); enterRoom(rid, 'scopa4'); return; }
    OL.waiting.room = d; OL.waiting.code = d.code; OL.waiting.pub = d.public; ol4Seats();
  });
  renderOnline();
}
async function ol4Leave(rid) {
  const ref = FB.doc(OL.db, 'rooms', rid);
  try {
    await FB.runTransaction(OL.db, async (tx) => {
      const s = await tx.get(ref); const d = s.data(); if (!d || d.status !== 'waiting') return;
      const i = d.players.indexOf(OL.uid); if (i < 1) return;
      const players = d.players.slice(), names = d.names.slice(), avs = d.avs.slice(), lvs = d.lvs.slice();
      const towns = (d.towns || ['', '', '', '']).slice(); towns[i] = '';
      players[i] = ''; names[i] = ''; avs[i] = ''; lvs[i] = 0;
      tx.update(ref, { players, names, avs, lvs, towns });
    });
  } catch (e) { /* niente */ }
}
function ol4Seats() {
  const box = $('olSeats'); if (!box || !OL.waiting) return;
  const d = OL.waiting.room, P4 = d ? d.players : [OL.uid, '', '', ''], N = d ? d.names : [myName(), '', '', ''], A = d ? d.avs : [P.av, '', '', ''];
  const n = P4.filter(Boolean).length;
  box.innerHTML = '<p class="ol4n"><b>' + n + '/4</b> giocatori</p><div class="ol4wait">' + [0, 1, 2, 3].map((i) => '<span class="' + (P4[i] ? 'in' : '') + (P4[i] === OL.uid ? ' me' : '') + '">' + (P4[i] ? '<img src="' + (AVIMG[A[i]] || AVIMG.mare) + '" alt="">' + esc(N[i] || '').slice(0, 10) : '<i>?</i>libero') + '<small>' + (i % 2 ? 'Coppia B' : 'Coppia A') + '</small></span>').join('') + '</div>';
}
setInterval(() => { if (view === 'vOnline' && OL.waiting && OL.waiting.game === 'scopa4') ol4Seats(); }, 1500);
function renderScopa4(d) {
  const me = meIdx(), T = me % 2, my = d.status === 'playing' && d.turn === me && !pauseLeft(d);
  setScore(d.total[T], d.total[1 - T], 'a 11');
  const sm = $('gScore').querySelectorAll('small'); if (sm[0]) sm[0].textContent = 'Noi'; if (sm[1]) sm[1].textContent = 'Loro';
  const seat = (i, role) => '<div class="ol4s' + (d.turn === i && d.status === 'playing' ? ' turn' : '') + (role === 'Compagno' ? ' ol4mate' : '') + '"><img src="' + (AVIMG[d.avs[i]] || AVIMG.mare) + '" alt=""><b>' + esc(d.names[i]).slice(0, 10) + '</b><small>' + role + '</small><span class="ol4c">' + d['hand' + i].length + ' 🂠</span></div>';
  $('opp').innerHTML = '<div class="ol4seats">' + seat((me + 1) % 4, 'Avversario') + seat((me + 2) % 4, 'Compagno') + seat((me + 3) % 4, 'Avversario') + '</div>';
  $('oppSide').innerHTML = 'Prese loro <strong>' + d['caps' + (1 - T)].length + '</strong>' + (d.scope[1 - T] ? ' · Scope <span class="pip">' + d.scope[1 - T] + '</span>' : '');
  $('youSide').innerHTML = 'Prese noi <strong>' + d['caps' + T].length + '</strong>' + (d.scope[T] ? ' · Scope <span class="pip">' + d.scope[T] + '</span>' : '');
  $('deckBox').innerHTML = '<span class="side">Smazzata <strong>' + (d.handNo || 1) + '</strong></span>';
  const hint = OL.sel ? new Set(OL.sel.opts.flat()) : new Set(), last = d.lastMove;
  $('table').innerHTML = d.table.length ? d.table.map((id) => '<div class="card' + (hint.has(id) ? ' hint' : last && last.card === id && !last.took.length ? ' played' : '') + '">' + img(cardOf(id)) + '</div>').join('') : '<div class="empty">Tavolo vuoto</div>';
  fitTable();
  $('hand').className = 'hand many';
  $('hand').innerHTML = d['hand' + me].map((id, i) => '<button class="card small10' + (OL.sel && OL.sel.cid === id ? ' sel' : '') + '" data-i="' + i + '"' + (my && !OL.busy ? '' : ' disabled') + '>' + img(cardOf(id)) + '</button>').join('');
  const turnName = d.turn === me ? '' : (d.turn % 2 === T ? 'al tuo compagno ' : 'a ') + esc(d.names[d.turn]);
  let bar = '<div class="msg">' + (OL.msg ? esc(OL.msg) + ' ' : '') + (d.status === 'playing' ? (my ? '<em>Tocca a te.</em>' : 'Tocca ' + turnName + '.') + ' <span class="oltimer" id="olTimer"></span>' : '') + '</div>';
  if (OL.sel) bar += OL.sel.opts.map((o, k) => '<button class="btn small take" data-act="otake" data-k="' + k + '">Prendi ' + o.map((id) => short(cardOf(id))).join(' + ') + '</button>').join('') + '<button class="btn small ghost" data-act="ocancel">Annulla</button>';
  bar += '<div class="emotes">' + EMOTES.map((t, k) => '<button class="emo" data-act="emote" data-k="' + k + '">' + tr(t) + '</button>').join('') + '</div>';
  bar += '<button class="btn small take" id="olClaim" data-act="claim" hidden>Un giocatore non risponde: vinci a tavolino</button>';
  $('bar').innerHTML = bar;
  onlineTick();
}

/* ---------- presentazione: "Si sfidano…" ---------- */
function olIntro(d) {
  if (!d || OL.ended) return;
  const four = d.game === 'scopa4', T = (d.towns || []), me = Math.max(0, (d.players || []).indexOf(OL.uid));
  const card = (i) => '<div class="olvsp' + (i === me ? ' me' : '') + '"><img src="' + (AVIMG[d.avs[i]] || AVIMG.mare) + '" alt=""><b>' + esc(d.names[i] || 'Giocatore') + '</b>' + (T[i] ? '<small>da ' + esc(T[i]) + '</small>' : '') + '</div>';
  const side = (arr, cls) => '<div class="olvsside ' + cls + '">' + arr.map(card).join('') + '</div>';
  const A = four ? [0, 2] : [0], B = four ? [1, 3] : [1];
  const mine = four ? (me % 2 === 0 ? A : B) : [me], other = four ? (me % 2 === 0 ? B : A) : [1 - me];
  const el = document.createElement('div');
  el.className = 'olvs'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Inizia la partita');
  el.innerHTML = '<div class="olvsbg"></div><div class="olvsin"><p class="olvst">' + (four ? 'Si sfidano le coppie' : 'Si sfidano') + '</p>' + side(mine, 'l') + '<div class="olvsx">VS</div>' + side(other, 'r') + '<p class="olvsg">' + OL_GAMES[d.game || 'scopa'] + '</p></div>';
  document.body.appendChild(el);
  fx('big');
  const close = () => { el.classList.add('out'); setTimeout(() => el.remove(), 400); };
  el.addEventListener('click', close);
  setTimeout(close, 3200);
}
