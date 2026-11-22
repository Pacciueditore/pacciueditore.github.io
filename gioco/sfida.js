/* ================= LA SFIDA DEL GIORNO =================
   Una sola sfida al giorno, uguale per tutti i giocatori (si sceglie dalla data).
   Si vede nel saluto in alto nel menu; finita la sfida si ritira il premio. Più giorni di fila, premio più ricco. */
const DSF_LIST = [
  { id: 'scopa2', ic: '🃏', t: 'Vinci 2 partite a scopa', ev: 'win_scopa', n: 2, c: 150, go: 'scopa' },
  { id: 'bris2', ic: '🂡', t: 'Vinci 2 partite a briscola', ev: 'win_briscola', n: 2, c: 150, go: 'briscola' },
  { id: 'tres1', ic: '♣️', t: 'Vinci una partita a tressette', ev: 'win_tressette', n: 1, c: 180, go: 'tressette' },
  { id: 'sette2', ic: '7½', t: 'Vinci 2 mani a sette e mezzo', ev: 'win_sette', n: 2, c: 150, go: 'sette' },
  { id: 'cards3', ic: '🎴', t: 'Vinci 3 partite a carte, a qualsiasi gioco', ev: 'win_carte', n: 3, c: 200, chest: 'rame', go: 'vHome' },
  { id: 'online1', ic: '🌐', t: 'Vinci una partita online', ev: 'olwin', n: 1, c: 220, chest: 'argento', go: 'vOnline' },
  { id: 'calcio1', ic: '⚽', t: 'Vinci una partita a U Palluni', ev: 'win_calcio', n: 1, c: 180, go: 'vCalcio' },
  { id: 'casa1', ic: '🏠', t: 'Batti un compare ad A Casa da Figghia', ev: 'win_casa', n: 1, c: 200, go: 'vCasa' },
  { id: 'morra2', ic: '✊', t: 'Vinci 2 partite alla morra', ev: 'win_morra', n: 2, c: 150, go: 'vMorra' },
  { id: 'fish4', ic: '🐟', t: 'Pesca 4 pesci', ev: 'fish_caught', n: 4, c: 150, go: 'vPesca' },
  { id: 'play5', ic: '🎲', t: 'Gioca 5 partite, vinte o perse', ev: 'game', n: 5, c: 160, go: 'vHome' },
  { id: 'drink2', ic: '🍋', t: 'Consegna 2 ordini al BergoDrink', ev: 'drink_order', n: 2, c: 170, go: 'vPaese' },
];
const DSF_CARDS = ['scopa', 'scopa4', 'briscola', 'tressette', 'sette', 'solitario'];
function dsfToday() {
  const k = dayKey(); let h = 0; for (const ch of k) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return { k, d: DSF_LIST[h % DSF_LIST.length] };
}
function dsfState() {
  const T = dsfToday();
  if (!P.dsf || P.dsf.day !== T.k) {
    const prev = P.dsf || {}, yest = dayKey(Date.now() - 864e5);
    const streak = prev.paid && prev.day === yest ? (prev.streak || 0) : 0;
    P.dsf = { day: T.k, id: T.d.id, c: 0, paid: false, streak };
  }
  return { S: P.dsf, d: DSF_LIST.find((x) => x.id === P.dsf.id) || T.d };
}
function dsfEvent(evs) {
  const { S, d } = dsfState();
  if (S.paid || S.c >= d.n || !evs.includes(d.ev)) return;
  S.c++; save();
  if (S.c >= d.n) setTimeout(() => { flash('Sfida del giorno fatta! Ritira il premio nel menu'); fx('big'); }, 1800);
  if (typeof homeHello === 'function' && view === 'vHome') homeHello();
}
/* premio: monete, a volte un baule; ogni giorno di fila aggiunge 25 carlini (fino a 7 giorni) */
function dsfClaim() {
  const { S, d } = dsfState(); if (S.paid || S.c < d.n) return;
  S.paid = true; S.streak = (S.streak || 0) + 1;
  const bonus = Math.min(7, S.streak) * 25, E = eco();
  E.carlini += d.c + bonus;
  let ch = '';
  if (d.chest || S.streak % 7 === 0) {
    const g = S.streak % 7 === 0 ? 'oro' : d.chest;
    if (E.chests.length < SLOTS) { E.chests.push({ id: 'c' + Date.now().toString(36), grade: g, start: null, end: null, sped: false }); ch = '<div class="chestnote"><span class="chmini">' + chestSVG(g) + '</span>E un <b>' + GRADES[g].name.toLowerCase() + '</b>!</div>'; }
    else E.carlini += 150;
  }
  if (typeof passAdd === 'function') passAdd(30);
  save(); fx('big');
  overlay('<div class="dsfwin"><div class="dsfic">' + d.ic + '</div><h2>Sfida del giorno vinta!</h2><p>' + esc(d.t) + '</p><p class="dsfrew"><i class="ico coin"></i> <b>' + d.c + '</b>' + (bonus ? ' + <b>' + bonus + '</b> per ' + S.streak + (S.streak === 1 ? ' giorno' : ' giorni di fila') : '') + '</p>' + ch + '<p class="pgnote">Domani c’è una sfida nuova: torna per non perdere i giorni di fila!</p><button class="btn take" id="dsfOk">Evviva!</button></div>');
  $('dsfOk').onclick = () => { $('layer').innerHTML = ''; renderHome(); };
}
function dsfGo() {
  const { d } = dsfState();
  if (d.go.startsWith('v')) { if (d.go === 'vOnline' && typeof OL !== 'undefined') OL.game = 'scopa'; go(d.go); return; }
  startGame(d.go);
}
function dsfLeft() { const n = new Date(), end = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1); const m = Math.max(1, Math.round((end - n) / 60000)); return m >= 60 ? Math.floor(m / 60) + 'h ' + String(m % 60).padStart(2, '0') + 'm' : m + ' min'; }
/* il riquadro dentro il saluto della home */
function dsfHTML() {
  const { S, d } = dsfState(), done = S.c >= d.n, pct = Math.round(Math.min(1, S.c / d.n) * 100);
  const rew = '<i class="ico coin"></i>' + d.c + (d.chest ? ' + ' + (d.chest === 'argento' ? 'baule d’argento' : 'baule di rame') : '');
  return '<div class="dsf' + (S.paid ? ' paid' : done ? ' done' : '') + '"><div class="dsfh"><small>Sfida del giorno' + (S.streak ? ' · 🔥 ' + S.streak + (S.streak === 1 ? ' giorno' : ' giorni') + ' di fila' : '') + '</small><small class="dsft">' + (S.paid ? 'nuova sfida tra ' : 'scade tra ') + dsfLeft() + '</small></div>' +
    '<div class="dsfm"><span class="dsfi">' + d.ic + '</span><span class="dsftx"><b>' + esc(d.t) + '</b><span class="dsfbar"><i style="width:' + pct + '%"></i></span><small>' + Math.min(S.c, d.n) + ' di ' + d.n + ' · premio ' + rew + '</small></span>' +
    (S.paid ? '<span class="dsfok">✓</span>' : done ? '<button class="btn take small" data-hact="dsfclaim">Ritira</button>' : '<button class="btn small" data-hact="dsfgo">Gioca</button>') + '</div></div>';
}
/* si aggancia agli eventi che il gioco già registra */
(() => {
  const oldTrack = track;
  track = function (name, params) {
    try {
      const p = params || {};
      if (name === 'game_end') {
        const g = p.game || '', ev = ['game'];
        if (p.won) { ev.push('win_' + g); if (DSF_CARDS.includes(g)) ev.push('win_carte'); }
        dsfEvent(ev);
      } else if (name === 'fish_caught' || name === 'drink_order') dsfEvent([name]);
    } catch (e) { /* niente */ }
    return oldTrack.apply(this, arguments);
  };
  if (typeof endOnline === 'function') {
    const oldEnd = endOnline;
    endOnline = function () {
      const d = OL.room, done = OL.ended;
      const r = oldEnd.apply(this, arguments);
      try { if (d && !done && !d.bot) { const me = typeof myT === 'function' ? myT() : meIdx(); dsfEvent(d.winner === me ? ['olwin', 'game'] : ['game']); } } catch (e) { /* niente */ }
      return r;
    };
  }
})();
