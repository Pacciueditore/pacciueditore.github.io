/* ================= CLAN, NEGOZIO DEL MAZZO, GOOGLE PLAY GIOCHI =================
   I clan sono veri, sul server (Firestore): li fondano i giocatori e ci si entra cercando il nome.
   Google Play Giochi è simulato nel browser; nell'app Android si collega con window.PLAY_GAMES_PROVIDER. */

/* ---------- negozio: il mazzo vero ---------- */
const DECK_SHOP = {
  url: '',        // link al negozio online quando sarà pronto, es. 'https://www.tuonegozio.it/scopa-calabrese'
  price: '',      // es. '14,90 €'
};
function renderShop() {
  const fan = ['mare-8', 'campagna-7', 'bottega-10', 'montagna-9', 'mare-1'];
  const btn = DECK_SHOP.url
    ? '<a class="btn take shopbuy" href="' + DECK_SHOP.url + '" target="_blank" rel="noopener">Compra il mazzo</a>'
    : '<button class="btn take shopbuy" disabled>Presto in vendita</button>';
  $('shopBox').innerHTML =
    '<div class="shopfan" aria-hidden="true">' + fan.map((id, i) => '<img src="' + IMG[id] + '" alt="" style="--i:' + (i - 2) + '">').join('') + '</div>' +
    '<h3>Scopa Calabrese, il mazzo da gioco</h3>' +
    '<p class="shopprice">' + (DECK_SHOP.price || 'Prezzo in arrivo') + '</p>' +
    '<p>Le stesse carte dell’app, stampate per giocare al bar, in famiglia o in spiaggia. Quaranta carte con i mestieri di Calabria e i quattro semi: Mare, Montagna, Campagna e Bottega.</p>' +
    '<ul class="shoplist"><li>40 carte nel formato classico delle carte napoletane</li><li>Figure illustrate: dalla rammendatrice allo zampognaro</li><li>Scatolina con il Signor ’Nduja e Bergo</li><li>Libretto con le regole di scopa, briscola, sette e mezzo e tressette, e le storie dei mestieri</li></ul>' +
    btn +
    '<button class="btn ghost shopall" data-go="vMazzo">Guarda tutte le 40 carte</button>' +
    (navigator.share ? '<button class="btn ghost shopall" id="shopShare">Consiglialo a un amico</button>' : '') +
    (DECK_SHOP.url ? '' : '<p class="shopnote">Il negozio online non è ancora aperto: quando lo sarà, da qui si arriverà direttamente alla pagina del mazzo.</p>');
  const sh = $('shopShare');
  if (sh) sh.onclick = () => { navigator.share({ title: 'Scopa Calabrese', text: 'Il mazzo di carte con i mestieri di Calabria!', url: DECK_SHOP.url || undefined }).catch(() => {}); };
}

/* ---------- Google Play Giochi ---------- */
function pg() { if (!P.pg) P.pg = { on: false, name: '' }; return P.pg; }
function renderPlayGames() {
  const G2 = pg();
  const real = !!window.PLAY_GAMES_PROVIDER;
  let h = '<div class="pgcard"><div class="pghead"><span class="pglogo" aria-hidden="true">▶</span><div><b>Google Play Giochi</b><small>' + (G2.on ? 'Collegato come ' + G2.name : 'Non collegato') + '</small></div></div>';
  if (!G2.on) {
    h += '<p>Collegati per salvare i progressi sul tuo account Google, sbloccare gli obiettivi di Google Play e comparire nella classifica mondiale.</p>' +
      '<button class="btn" id="pgIn">Accedi con Play Giochi</button>';
  } else {
    const got = BADGES.filter((b) => b.ok(P)).length;
    h += '<div class="pgstats"><div><b>' + got + '/' + BADGES.length + '</b><small>obiettivi</small></div><div><b>' + levelOf(P.xp) + '</b><small>livello</small></div><div><b>Sì</b><small>salvataggio cloud</small></div></div>' +
      '<div class="pgbtns"><button class="btn small" id="pgAch">Obiettivi</button><button class="btn small" id="pgRank">Classifica</button><button class="btn ghost small" id="pgOut">Scollega</button></div>';
  }
  if (!real) h += '<p class="pgnote">Anteprima: il collegamento vero funzionerà quando l’app sarà registrata su Google Play Console.</p>';
  $('pgBox').innerHTML = h + '</div>';
}
$('pgBox').addEventListener('click', async (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  const G2 = pg();
  if (b.id === 'pgIn') {
    b.disabled = true; b.textContent = 'Collegamento…';
    try {
      const r = window.PLAY_GAMES_PROVIDER ? await window.PLAY_GAMES_PROVIDER.signIn() : await new Promise((ok) => setTimeout(() => ok({ name: P.nick || 'Giocatore' }), 900));
      G2.on = true; G2.name = (r && r.name) || P.nick || 'Giocatore';
      save(); flash('Collegato!');
      if (window.PLAY_GAMES_PROVIDER) BADGES.filter((x) => x.ok(P)).forEach((x) => window.PLAY_GAMES_PROVIDER.unlock(x.id));
    } catch (err) { flash('Accesso non riuscito'); }
    renderPlayGames();
  }
  if (b.id === 'pgOut') { G2.on = false; save(); renderPlayGames(); }
  if (b.id === 'pgRank') { if (window.PLAY_GAMES_PROVIDER) window.PLAY_GAMES_PROVIDER.showLeaderboard(); else go('vRank'); }
  if (b.id === 'pgAch') {
    if (window.PLAY_GAMES_PROVIDER) { window.PLAY_GAMES_PROVIDER.showAchievements(); return; }
    overlay('<h2>Obiettivi di Google Play</h2><div class="pgach">' + BADGES.map((x) => '<div class="' + (x.ok(P) ? 'on' : '') + '"><img src="' + AVIMG[x.icon] + '" alt=""><span><b>' + x.name + '</b><small>' + x.need + '</small></span><i>' + (x.ok(P) ? '✓' : '') + '</i></div>').join('') + '</div><button class="btn" id="pgOk">Chiudi</button>');
    $('pgOk').onclick = () => { $('layer').innerHTML = ''; };
  }
});

/* ---------- CLAN (veri, sul server) ----------
   clans/{id}: name, low, motto, emb, owner, members[], mem{uid:{n,av,lv,w,wk}}, n, pts, wpts, wk, at
   clans/{id}/chat/{msg}: uid, n, av, k (frase pronta), at — niente testo libero */
const CLAN_MAX = 30;
const CLAN_EMBS = ['mare', 'montagna', 'campagna', 'bottega', 'pescatore', 'pastore', 'massaro', 'zampognaro'];
const CLAN_PHRASES = ['Bonasira a tutti!', 'Forza ca stasira vincimu!', 'Cu mi faci na partita a scupa?', 'Cu mi faci na briscula?', 'Criu na stanza online, trasiti!', 'Aia la miseria, fici tri scupi i filu!', 'Mòviti ca scurau!', 'Bravu!', 'Veru è!', 'Jamu!', 'Stasira ci sugnu.', 'Oji non pozzu, dumani sì.', 'Mancanu picca punti pe u bauli!', 'Ccà si ioca e si scherza.', 'Benvenutu nt’o clan!', 'Grazzi!', 'Ahah, sì forti!', 'Pijja chistu!', 'U bergamottu meu è maturu.', 'Bona notti, a dumani!'];
const CLAN_GOALS = [
  { t: 300, prize: 'rame' },
  { t: 1000, prize: 'argento' },
  { t: 2500, prize: 'oro' },
];
const CL = { doc: null, unsub: null, chatUnsub: null, chat: [], list: null, q: '', busy: false, err: '' };
let clanTab = 'membri';
const clanWk = () => wkId(Date.now());
const clanOnline = () => !!(window.FB && typeof ONLINE_OK === 'function' && ONLINE_OK());
const clanSlug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’'`]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30);
const clanMe = () => ({ n: myName(), av: P.av || 'mare', lv: levelOf(P.xp) });
const clanWpts = (c) => (c && c.wk === clanWk() ? c.wpts || 0 : 0);
/* i clan di prova delle versioni vecchie non esistono sul server: si tolgono */
function clanFix() { if (P.clan && (P.clan.joined !== undefined || P.clan.custom !== undefined)) { P.clan = null; save(); } }
try { clanFix(); } catch (e) { /* niente */ }
async function clanReady() {
  if (!clanOnline()) return false;
  if (!OL.ready) { try { await withTimeout(Promise.resolve(olInit()), 9000); } catch (e) { /* niente */ } }
  return !!OL.ready;
}
function clanRef(id) { return FB.doc(OL.db, 'clans', id); }
function clanSay(text) { const b = $('clanBox'); if (b) b.innerHTML = '<div class="clanempty"><div class="spinner"></div><p>' + text + '</p></div>'; }

/* ---------- vista principale ---------- */
async function renderClan() {
  clanStopChat(); clanFix();
  if (!clanOnline()) {
    $('clanBox').innerHTML = '<div class="clanhero"><img src="' + AVIMG.zampognaro + '" alt=""><div><h3>I clan</h3><p>Fonda un clan con i tuoi amici o entra in quello di qualcun altro cercando il nome. I punti di tutti si sommano e insieme si aprono i bauli della settimana.</p></div></div><p class="pgnote">I clan funzionano nell’app per Android, con internet.</p>';
    return;
  }
  clanSay('Mi collego al clan…');
  if (!(await clanReady())) { $('clanBox').innerHTML = '<div class="clanempty"><p>' + esc(OL.err || 'Non riesco a collegarmi. Controlla internet e riprova.') + '</p><button class="btn" id="clanRetry">Riprova</button></div>'; return; }
  if (P.clan && P.clan.id) {
    try {
      const s = await withTimeout(FB.getDoc(clanRef(P.clan.id)), 10000);
      const d = s.exists() ? s.data() : null;
      if (!d || !(d.members || []).includes(OL.uid)) { P.clan = null; save(); flash('Non sei più nel clan'); }
      else { CL.doc = Object.assign({ id: P.clan.id }, d); clanKeepLocal(); clanFlush(); renderClanIn(); clanWatch(); return; }
    } catch (e) { $('clanBox').innerHTML = '<div class="clanempty"><p>Non riesco a caricare il clan. Controlla internet e riprova.</p><button class="btn" id="clanRetry">Riprova</button></div>'; return; }
  }
  renderClanList();
}
function clanKeepLocal() {
  const d = CL.doc; if (!d) return;
  const C = P.clan || (P.clan = { id: d.id, claimed: {} });
  C.name = d.name; C.emb = d.emb; C.motto = d.motto || ''; if (!C.claimed) C.claimed = {};
  save();
}
function clanWatch() {
  if (CL.unsub) { try { CL.unsub(); } catch (e) { /* niente */ } }
  if (!P.clan) return;
  CL.unsub = FB.onSnapshot(clanRef(P.clan.id), (s) => {
    if (!s.exists()) { CL.doc = null; return; }
    CL.doc = Object.assign({ id: s.id }, s.data());
    if (view === 'vClan' && $('clanIn')) { clanHeadUpdate(); if (clanTab !== 'chat') renderClanTab(); }
  }, () => {});
}

/* ---------- dentro il clan ---------- */
function clanHeadHTML() {
  const d = CL.doc, w = clanWpts(d);
  const next = CLAN_GOALS.find((g) => w < g.t), top = next ? next.t : CLAN_GOALS[CLAN_GOALS.length - 1].t;
  return '<div class="clanbanner"><div class="clanemb"><img src="' + AVIMG[d.emb] + '" alt=""></div><div class="clanbt"><h3>' + esc(d.name) + '</h3>' + (d.motto ? '<em>“' + esc(d.motto) + '”</em>' : '') +
    '<div class="clanstats"><span><b>' + d.n + '</b>/' + CLAN_MAX + ' membri</span><span><b>' + w + '</b> punti settimana</span></div></div></div>' +
    '<div class="clangoalbar"><div class="xpbar"><i style="width:' + Math.min(100, Math.round(w / top * 100)) + '%"></i>' + CLAN_GOALS.map((g) => '<s style="left:' + Math.round(g.t / top * 100) + '%" class="' + (w >= g.t ? 'on' : '') + '"></s>').join('') + '</div><small>' + (next ? 'Prossimo baule a ' + next.t + ' punti: ' + GRADES[next.prize].name.toLowerCase() : 'Tutti i bauli della settimana sbloccati!') + '</small></div>';
}
function clanHeadUpdate() { const h = $('clanHead'); if (h && CL.doc) h.innerHTML = clanHeadHTML(); }
function renderClanIn() {
  const tabs = [['membri', 'Membri'], ['chat', 'Chat'], ['bauli', 'Bauli'], ['classifica', 'Classifica']];
  $('clanBox').innerHTML = '<div id="clanIn"><div id="clanHead">' + clanHeadHTML() + '</div>' +
    '<div class="clantabs" role="tablist">' + tabs.map(([k, l]) => '<button role="tab" aria-selected="' + (clanTab === k) + '" data-ctab="' + k + '">' + l + '</button>').join('') + '</div><div id="clanBody"></div>' +
    '<div class="clanfoot"><button class="btn ghost small" id="clanShare">Invita un amico</button><button class="btn ghost small" id="clanLeave">Esci dal clan</button></div></div>';
  renderClanTab();
}
function renderClanTab() {
  const body = $('clanBody'), d = CL.doc; if (!body || !d) return;
  if (clanTab !== 'chat') clanStopChat();
  const wk = clanWk();
  if (clanTab === 'membri') {
    const rows = (d.members || []).map((u) => Object.assign({ u }, (d.mem || {})[u] || { n: '?', av: 'mare', lv: 1 })).map((m) => Object.assign(m, { w: m.wk === wk ? m.w || 0 : 0 })).sort((a, b) => b.w - a.w || (b.lv || 0) - (a.lv || 0));
    body.innerHTML = '<p class="clanhint">Ogni partita che giochi porta punti al clan: <b>10</b> se vinci, <b>2</b> se perdi.</p><ol class="clanmem">' +
      rows.map((m, i) => '<li class="' + (m.u === OL.uid ? 'me' : '') + '"><span class="pos">' + (i + 1) + '</span><img src="' + (AVIMG[m.av] || AVIMG.mare) + '" alt=""><span class="nm">' + esc(m.n) + (m.u === d.owner ? ' <i class="clancap" title="Fondatore">👑</i>' : '') + '<small>Livello ' + (m.lv || 1) + '</small></span><b>' + m.w + '<small>punti</small></b></li>').join('') + '</ol>' +
      '<div class="clantip"><span>🃏</span><p>Vuoi sfidare un compagno? Crea una stanza online e mandagli il codice nella chat.</p><button class="btn small" data-go="vOnline">Gioca online</button></div>';
  }
  if (clanTab === 'chat') {
    body.innerHTML = '<div class="chatlist" id="chatList"><p class="clanhint">Caricamento…</p></div><p class="clanhint">Tocca una frase per mandarla al clan:</p><div class="chatpick">' +
      CLAN_PHRASES.map((t, k) => '<button data-say="' + k + '">' + esc(t) + '</button>').join('') + '</div>';
    clanStartChat();
  }
  if (clanTab === 'bauli') {
    const w = clanWpts(d), got = (P.clan.claimed || {})[wk] || [];
    body.innerHTML = '<p class="clanhint">Bauli della settimana: si sbloccano con i punti di tutto il clan e ognuno ritira il suo. Si ricomincia ogni lunedì.</p>' + CLAN_GOALS.map((g, i) => {
      const ok = w >= g.t, taken = got.includes(i);
      return '<div class="clanchest ' + (ok ? 'ok' : '') + '"><span class="ccimg" style="--c1:' + GRADES[g.prize].c1 + ';--c2:' + GRADES[g.prize].c2 + '"></span><span><b>' + GRADES[g.prize].name + '</b><small>' + Math.min(w, g.t) + ' / ' + g.t + ' punti del clan</small></span>' +
        (ok ? '<button class="btn small take" data-claim="' + i + '"' + (taken ? ' disabled' : '') + '>' + (taken ? 'Ritirato' : 'Ritira') + '</button>' : '<em>🔒</em>') + '</div>';
    }).join('');
  }
  if (clanTab === 'classifica') {
    body.innerHTML = '<p class="clanhint">Caricamento…</p>';
    clanTopList().then((list) => {
      if (clanTab !== 'classifica' || !$('clanBody')) return;
      if (!list) { $('clanBody').innerHTML = '<p class="clanhint">Non riesco a caricare la classifica.</p>'; return; }
      if (!list.some((c) => c.id === d.id)) list.push(d);
      list.sort((a, b) => clanWpts(b) - clanWpts(a));
      $('clanBody').innerHTML = '<p class="clanhint">I clan più forti di questa settimana.</p><ol class="clanrank">' +
        list.slice(0, 30).map((c, i) => '<li class="' + (c.id === d.id ? 'me' : '') + '"><span class="pos">' + (i + 1) + '</span><img src="' + (AVIMG[c.emb] || AVIMG.mare) + '" alt=""><span class="nm">' + esc(c.name) + '<small>' + c.n + ' membri</small></span><b>' + clanWpts(c) + '</b></li>').join('') + '</ol>';
    });
  }
}
async function clanTopList() {
  try {
    const s = await withTimeout(FB.getDocs(FB.query(FB.collection(OL.db, 'clans'), FB.where('wk', '==', clanWk()), FB.limit(60))), 10000);
    return s.docs.map((x) => Object.assign({ id: x.id }, x.data()));
  } catch (e) { return null; }
}

/* ---------- chat con frasi pronte ---------- */
function clanStartChat() {
  clanStopChat();
  if (!P.clan) return;
  CL.chatUnsub = FB.onSnapshot(FB.query(FB.collection(OL.db, 'clans', P.clan.id, 'chat'), FB.orderBy('at', 'desc'), FB.limit(40)), (s) => {
    CL.chat = s.docs.map((x) => x.data()).reverse();
    const L = $('chatList'); if (!L) return;
    L.innerHTML = CL.chat.length ? CL.chat.map(chatRow).join('') : '<p class="clanhint">Ancora nessun messaggio: saluta per primo!</p>';
    L.scrollTop = L.scrollHeight;
  }, () => { const L = $('chatList'); if (L) L.innerHTML = '<p class="clanhint">Non riesco a caricare la chat.</p>'; });
}
function clanStopChat() { if (CL.chatUnsub) { try { CL.chatUnsub(); } catch (e) { /* niente */ } CL.chatUnsub = null; } }
function chatRow(m) {
  const me = m.uid === OL.uid, t = CLAN_PHRASES[m.k] || '…';
  return '<div class="msgrow' + (me ? ' me' : '') + '"><img src="' + (AVIMG[m.av] || AVIMG.mare) + '" alt=""><div><b>' + esc(m.n || '?') + '</b><span>' + esc(tr(t)) + '</span></div></div>';
}
async function clanSayPhrase(k, auto) {
  if (!P.clan || CL.busy) return;
  const now = Date.now();
  if (!auto) { if (CL.lastSay && now - CL.lastSay < 2500) { flash('Piano piano!'); return; } CL.lastSay = now; }
  const me = clanMe();
  try { await withTimeout(FB.setDoc(FB.doc(FB.collection(OL.db, 'clans', P.clan.id, 'chat')), { uid: OL.uid, n: me.n, av: me.av, k, at: FB.serverTimestamp() }), 10000); } catch (e) { flash('Messaggio non inviato'); }
}

/* ---------- cercare, entrare, fondare ---------- */
function renderClanList() {
  CL.doc = null;
  $('clanBox').innerHTML = '<div class="clanhero"><img src="' + AVIMG.zampognaro + '" alt=""><div><h3>Trova il tuo clan</h3><p>Entra nel clan dei tuoi amici cercando il nome, oppure fondane uno tu. I punti di tutti si sommano e insieme si aprono i bauli della settimana.</p></div></div>' +
    '<form class="clansearch" id="clanSearch"><label for="clanQ" hidden>Nome del clan</label><input id="clanQ" maxlength="24" placeholder="Cerca un clan per nome…" autocomplete="off" value="' + esc(CL.q) + '"><button class="btn" type="submit">Cerca</button></form>' +
    '<div id="clanRes"><p class="clanhint">Caricamento…</p></div>' +
    '<details class="clannewbox"' + (CL.openNew ? ' open' : '') + '><summary>➕ Fonda un nuovo clan</summary><form class="clannew" id="clanNew"><label for="clanName">Nome del clan</label><input id="clanName" maxlength="24" placeholder="Es. I Briganti di Gerace" autocomplete="off" required>' +
    '<label for="clanMotto">Motto <small>(facoltativo)</small></label><input id="clanMotto" maxlength="50" placeholder="Es. Chi vince paga il caffè" autocomplete="off">' +
    '<span class="lab">Stemma</span><div class="embs">' + CLAN_EMBS.map((e, i) => '<label><input type="radio" name="emb" value="' + e + '"' + (i === 0 ? ' checked' : '') + '><img src="' + AVIMG[e] + '" alt="' + e + '"></label>').join('') + '</div>' +
    '<small class="pznote" id="clanNewErr"></small><button class="btn" type="submit">Fonda il clan</button></form></details>';
  clanSearch(CL.q);
}
async function clanSearch(q) {
  CL.q = q;
  const box = $('clanRes'); if (!box) return;
  let list = null, low = q.trim().toLowerCase();
  try {
    if (low) {
      const s = await withTimeout(FB.getDocs(FB.query(FB.collection(OL.db, 'clans'), FB.orderBy('low'), FB.where('low', '>=', low), FB.where('low', '<=', low + ''), FB.limit(20))), 10000);
      list = s.docs.map((x) => Object.assign({ id: x.id }, x.data()));
    } else {
      list = await clanTopList();
      if (list) list.sort((a, b) => clanWpts(b) - clanWpts(a));
    }
  } catch (e) { list = null; }
  if (!$('clanRes')) return;
  if (!list) { $('clanRes').innerHTML = '<p class="clanhint">Non riesco a cercare. Controlla internet.</p>'; return; }
  if (!list.length) {
    $('clanRes').innerHTML = low ? '<p class="clanhint">Nessun clan si chiama così. Controlla il nome o fondalo tu!</p>' : '<p class="clanhint">Questa settimana non ha ancora giocato nessun clan. Cerca il nome del clan dei tuoi amici o fondane uno.</p>';
    return;
  }
  $('clanRes').innerHTML = (low ? '' : '<h4 class="clansub">Clan attivi questa settimana</h4>') + '<div class="clanlist">' + list.slice(0, 20).map((c) => {
    const full = (c.n || 0) >= CLAN_MAX;
    return '<div class="clanrow"><img src="' + (AVIMG[c.emb] || AVIMG.mare) + '" alt=""><span><b>' + esc(c.name) + '</b><small>' + c.n + '/' + CLAN_MAX + ' membri · ' + clanWpts(c) + ' punti</small>' + (c.motto ? '<em>' + esc(c.motto) + '</em>' : '') + '</span><button class="btn small" data-join="' + esc(c.id) + '"' + (full ? ' disabled' : '') + '>' + (full ? 'Pieno' : 'Entra') + '</button></div>';
  }).join('') + '</div>';
}
async function clanJoin(id) {
  if (CL.busy) return; CL.busy = true;
  const me = clanMe();
  try {
    await FB.runTransaction(OL.db, async (tx) => {
      const ref = clanRef(id), s = await tx.get(ref);
      if (!s.exists()) throw new Error('nonce');
      const d = s.data();
      if ((d.members || []).includes(OL.uid)) return;
      if (d.n >= CLAN_MAX) throw new Error('pieno');
      tx.update(ref, { members: d.members.concat([OL.uid]), n: d.n + 1, mem: Object.assign({}, d.mem, { [OL.uid]: Object.assign(me, { w: 0, wk: clanWk() }) }) });
    });
    P.clan = { id, claimed: {} }; save(); clanTab = 'membri';
    flash('Benvenuto nel clan!');
    setTimeout(() => clanSayPhrase(0, true), 600);
    renderClan();
  } catch (e) { flash(e.message === 'pieno' ? 'Il clan è pieno' : e.message === 'nonce' ? 'Il clan non esiste più' : 'Non riesco a entrare, riprova'); }
  CL.busy = false;
}
async function clanCreate(name, motto, emb) {
  const err = $('clanNewErr'), id = clanSlug(name);
  if (name.length < 3 || id.length < 3) { if (err) err.textContent = 'Il nome deve avere almeno 3 lettere.'; return; }
  const bad = (t) => { const k = t.toLowerCase().normalize('NFD').replace(/[^a-z]/g, ''); return typeof NICK_BAD !== 'undefined' && NICK_BAD.some((w) => k.includes(w)); };
  if (bad(name) || (motto && bad(motto))) { if (err) err.textContent = 'Scegli parole più gentili.'; return; }
  if (CL.busy) return; CL.busy = true;
  const me = clanMe(), wk = clanWk();
  try {
    await FB.runTransaction(OL.db, async (tx) => {
      const ref = clanRef(id), s = await tx.get(ref);
      if (s.exists()) throw new Error('preso');
      tx.set(ref, { name, low: name.toLowerCase(), motto, emb, owner: OL.uid, members: [OL.uid], mem: { [OL.uid]: Object.assign(me, { w: 0, wk }) }, n: 1, pts: 0, wpts: 0, wk, at: FB.serverTimestamp() });
    });
    P.clan = { id, claimed: {} }; save(); clanTab = 'membri'; CL.openNew = false;
    flash('Clan fondato!');
    renderClan();
  } catch (e) { if (err) err.textContent = e.message === 'preso' ? 'Esiste già un clan con questo nome: cercalo ed entra, o scegline un altro.' : 'Non riesco a fondare il clan, riprova.'; }
  CL.busy = false;
}
async function clanLeave() {
  if (!P.clan || CL.busy) return; CL.busy = true;
  const id = P.clan.id;
  try {
    await FB.runTransaction(OL.db, async (tx) => {
      const ref = clanRef(id), s = await tx.get(ref);
      if (!s.exists()) return;
      const d = s.data();
      if (!(d.members || []).includes(OL.uid)) return;
      if (d.n <= 1) { tx.delete(ref); return; }
      const members = d.members.filter((u) => u !== OL.uid), mem = Object.assign({}, d.mem); delete mem[OL.uid];
      const upd = { members, mem, n: d.n - 1 };
      if (d.owner === OL.uid) upd.owner = members[0];
      tx.update(ref, upd);
    });
    if (CL.unsub) { try { CL.unsub(); } catch (e) { /* niente */ } CL.unsub = null; }
    P.clan = null; P.clanQ = 0; save(); renderClan();
  } catch (e) { flash('Non riesco a uscire, riprova'); }
  CL.busy = false;
}

/* ---------- punti al clan ---------- */
async function clanFlush() {
  const q = Math.min(50, P.clanQ || 0);
  if (!P.clan || q <= 0 || CL.flushing || !clanOnline()) return;
  CL.flushing = true;
  try {
    if (await clanReady()) {
      const me = clanMe(), wk = clanWk();
      await FB.runTransaction(OL.db, async (tx) => {
        const ref = clanRef(P.clan.id), s = await tx.get(ref);
        if (!s.exists() || !(s.data().members || []).includes(OL.uid)) throw new Error('fuori');
        const d = s.data(), mine = (d.mem || {})[OL.uid] || {};
        const w = mine.wk === wk ? (mine.w || 0) + q : q;
        tx.update(ref, { pts: (d.pts || 0) + q, wpts: d.wk === wk ? (d.wpts || 0) + q : q, wk, mem: Object.assign({}, d.mem, { [OL.uid]: Object.assign(me, { w, wk }) }) });
      });
      P.clanQ = Math.max(0, (P.clanQ || 0) - q); save();
      if (P.clanQ > 0) setTimeout(clanFlush, 1500);
    }
  } catch (e) { if (e && e.message === 'fuori') { P.clan = null; P.clanQ = 0; save(); } }
  CL.flushing = false;
}
/* chiamata da award(): punti al clan */
function clanOnAward(game, won) {
  window.CLAN_FIGHT = null; clanFix();
  if (!P.clan) return [];
  const pts = won ? 10 : 2;
  P.clanQ = (P.clanQ || 0) + pts; save();
  setTimeout(clanFlush, 800);
  return ['+' + pts + ' punti al clan'];
}

/* ---------- tocchi e moduli ---------- */
$('clanBox').addEventListener('click', (e) => {
  if (e.target.id === 'clanRetry') { renderClan(); return; }
  const j = e.target.closest('[data-join]');
  if (j && !j.disabled) { clanJoin(j.dataset.join); return; }
  const t = e.target.closest('[data-ctab]');
  if (t) { clanTab = t.dataset.ctab; $('clanBox').querySelectorAll('[data-ctab]').forEach((x) => x.setAttribute('aria-selected', x === t)); renderClanTab(); return; }
  const sy = e.target.closest('[data-say]');
  if (sy) { clanSayPhrase(+sy.dataset.say); return; }
  const c = e.target.closest('[data-claim]');
  if (c && !c.disabled) {
    const i = +c.dataset.claim, g = CLAN_GOALS[i], wk = clanWk(), E = eco();
    if (clanWpts(CL.doc) < g.t) return;
    if (E.chests.length >= SLOTS) { flash('Bauli pieni!'); return; }
    const C = P.clan; if (!C.claimed) C.claimed = {};
    for (const k of Object.keys(C.claimed)) if (k !== wk) delete C.claimed[k];
    const got = C.claimed[wk] || (C.claimed[wk] = []);
    if (got.includes(i)) return;
    got.push(i);
    E.chests.push({ id: 'c' + Date.now().toString(36), grade: g.prize, start: null, end: null, sped: false });
    save(); renderClanTab(); flash(GRADES[g.prize].name + '!');
    return;
  }
  if (e.target.id === 'clanShare' && CL.doc) {
    const text = 'Entra nel mio clan su Scopa Calabrese! Cerca: ' + CL.doc.name;
    try {
      const Sh = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Share;
      if (Sh) Sh.share({ title: 'Scopa Calabrese', text, url: typeof STORE_URL !== 'undefined' ? STORE_URL : undefined }).catch(() => {});
      else if (navigator.share) navigator.share({ title: 'Scopa Calabrese', text }).catch(() => {});
      else if (navigator.clipboard) { navigator.clipboard.writeText(text); flash('Copiato!'); }
    } catch (er) { /* niente */ }
    return;
  }
  if (e.target.id === 'clanLeave') {
    const last = CL.doc && CL.doc.n <= 1;
    overlay('<h2>Uscire dal clan?</h2><p>' + (last ? 'Sei l’ultimo rimasto: se esci il clan viene chiuso.' : 'I punti che hai portato restano al clan.') + '</p><button class="btn" id="clYes">Esci</button><button class="btn alt" id="clNo">Resta</button>');
    $('clYes').onclick = () => { $('layer').innerHTML = ''; clanLeave(); };
    $('clNo').onclick = () => { $('layer').innerHTML = ''; };
  }
});
$('clanBox').addEventListener('submit', (e) => {
  e.preventDefault();
  if (e.target.id === 'clanSearch') { clanSearch($('clanQ').value); return; }
  if (e.target.id !== 'clanNew') return;
  const name = $('clanName').value.replace(/\s+/g, ' ').trim().slice(0, 24);
  const motto = $('clanMotto').value.replace(/\s+/g, ' ').trim().slice(0, 50);
  const emb = (e.target.querySelector('input[name="emb"]:checked') || {}).value || 'mare';
  CL.openNew = true;
  clanCreate(name, motto, emb);
});
$('clanBox').addEventListener('toggle', (e) => { if (e.target.classList && e.target.classList.contains('clannewbox')) CL.openNew = e.target.open; }, true);
/* quando si esce dalla schermata dei clan si chiudono gli ascolti */
document.addEventListener('visibilitychange', () => { if (!document.hidden && P.clanQ) clanFlush(); });
