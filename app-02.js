/* Scopa Calabrese – codice principale, parte 2 */
/* ================= profile, levels, unlocks ================= */
const AVATARS = [
  { id: 'mare', label: 'Pesce spada', lv: 1 },
  { id: 'montagna', label: 'Pino laricio', lv: 1 },
  { id: 'campagna', label: "Ramo d'ulivo", lv: 2 },
  { id: 'bottega', label: 'Zampogna', lv: 2 },
  { id: 'pastaia', label: 'Pastaia', lv: 3 },
  { id: 'rammendatrice', label: 'Rammendatrice', lv: 4 },
  { id: 'pescatore', label: 'Pescatore', lv: 5 },
  { id: 'tessitrice', label: 'Tessitrice', lv: 6 },
  { id: 'contadino', label: 'Contadino', lv: 7 },
  { id: 'raccoglitrice', label: 'Raccoglitrice', lv: 8 },
  { id: 'pastore', label: 'Pastore', lv: 9 },
  { id: 'impagliatore', label: 'Impagliatore', lv: 10 },
  { id: 'lanzaturi', label: 'Lanzaturi', lv: 12 },
  { id: 'casaro', label: 'Casaro', lv: 14 },
  { id: 'massaro', label: 'Massaro', lv: 16 },
  { id: 'zampognaro', label: 'Zampognaro', lv: 20 },
];
const xpFor = (L) => 50 * (L - 1) * (L + 2);
function levelOf(xp) { let L = 1; while (xp >= xpFor(L + 1)) L++; return L; }
const GAMES = { scopa: 'Scopa', briscola: 'Briscola', sette: 'Sette e mezzo', tressette: 'Tressette', solitario: 'Scarta i Re' };
const DAY = 86400000;

function defaultProfile() {
  return {
    v: 1, xp: 0, nick: '', av: 'mare', since: Date.now(),
    games: { scopa: { w: 0, l: 0 }, briscola: { w: 0, l: 0 }, sette: { w: 0, l: 0 }, tressette: { w: 0, l: 0 }, solitario: { w: 0, l: 0 } },
    scope: 0, settebelli: 0, reali: 0, cappotti: 0, streak: 0, best: 0,
  };
}
const wins = (P) => P.games.scopa.w + P.games.briscola.w + P.games.sette.w + P.games.tressette.w + P.games.solitario.w;
const fixGames = (p) => { p.games = Object.assign(defaultProfile().games, p.games || {}); return p; };
const days = (P) => Math.floor((Date.now() - P.since) / DAY);

const BADGES = [
  { id: 'prima', name: 'Prima vittoria', need: 'Vinci una partita', icon: 'mare', ok: (P) => wins(P) >= 1 },
  { id: 'coppa', name: 'Campione di Calabria', need: 'Vinci la Coppa Calabria nei Tornei', icon: 'zampognaro', ok: (P) => !!(P.troph && P.troph.coppa) },
  { id: 'tutti', name: 'Tuttofare', need: 'Vinci a scopa, briscola, sette e mezzo e tressette', icon: 'bottega', ok: (P) => P.games.scopa.w && P.games.briscola.w && P.games.sette.w && P.games.tressette.w },
  { id: 'tres', name: 'Re del circolo', need: 'Vinci 10 partite a tressette', icon: 'massaro', ok: (P) => P.games.tressette.w >= 10 },
  { id: 'paz', name: 'Santa pazienza', need: 'Riesci il solitario Scarta i Re', icon: 'raccoglitrice', ok: (P) => P.games.solitario.w >= 1 },
  { id: 'calabria', name: 'Re della Calabria', need: 'Conquista tutti i paesi, da Tropea a Cosenza', icon: 'massaro', ok: (P) => !!(P.conq && P.conq.kings >= 1) },
  { id: 'aspro', name: 'Amico dell’Aspromonte', need: 'Scopri tutti gli animali dell’Aspromonte', icon: 'pastore', ok: (P) => !!(P.conq && Object.keys(P.conq.aspro.seen).length >= 15) },
  { id: 'morra1', name: 'Prima morra', need: 'Vinci la tua prima partita a morra', icon: 'pastore', ok: (P) => !!(P.morra && P.morra.w >= 1) },
  { id: 'morrasana', name: 'Sanaa!', need: 'A morra, fai punto gridando dieci', icon: 'zampognaro', ok: (P) => !!(P.morra && P.morra.sana >= 1) },
  { id: 'morraall', name: 'Tutti battuti', need: 'A morra, batti Pastore, Zampognaro e Massaro', icon: 'massaro', ok: (P) => !!(P.morra && P.morra.beat && P.morra.beat.every((x) => x > 0)) },
  { id: 'morracapp', name: 'Cappotto a morra', need: 'Vinci a morra 5 a 0', icon: 'lanzaturi', ok: (P) => !!(P.morra && P.morra.capp >= 1) },
  { id: 'morrare', name: 'Re della morra', need: 'Vinci 25 partite a morra', icon: 'massaro', ok: (P) => !!(P.morra && P.morra.w >= 25) },
  { id: 'pesca1', name: 'Primo pesce', need: 'Pesca il tuo primo pesce', icon: 'pescatore', ok: (P) => !!(P.pesca && P.pesca.total >= 1) },
  { id: 'pescaspada', name: 'Il re dello Stretto', need: 'Pesca un pesce spada', icon: 'lanzaturi', ok: (P) => !!(P.pesca && P.pesca.album.spada) },
  { id: 'pesca100', name: 'Lupo di mare', need: 'Pesca 100 pesci', icon: 'rammendatrice', ok: (P) => !!(P.pesca && P.pesca.total >= 100) },
  { id: 'pecora', name: 'C’è sempri na pecora nira', need: 'Fai nascere la prima pecora nera', icon: 'pastore', ok: (P) => (P.blackSheep || 0) >= 1 },
  { id: 'scope', name: 'Scopatore', need: 'Fai 25 scope', icon: 'pastaia', ok: (P) => P.scope >= 25 },
  { id: 'sette', name: "Settebello d'oro", need: 'Prendi 10 settebelli', icon: 'campagna', ok: (P) => P.settebelli >= 10 },
  { id: 'bris', name: 'Re della briscola', need: 'Vinci 10 partite a briscola', icon: 'lanzaturi', ok: (P) => P.games.briscola.w >= 10 },
  { id: 'capp', name: 'Cappotto', need: 'Vinci a briscola con almeno 100 punti', icon: 'pescatore', ok: (P) => P.cappotti >= 1 },
  { id: 'reale', name: 'Sette e mezzo reale', need: 'Fai sette e mezzo con due carte', icon: 'massaro', ok: (P) => P.reali >= 1 },
  { id: 'serie3', name: 'Tre di fila', need: 'Vinci 3 partite di fila', icon: 'contadino', ok: (P) => P.best >= 3 },
  { id: 'serie7', name: 'Imbattibile', need: 'Vinci 7 partite di fila', icon: 'casaro', ok: (P) => P.best >= 7 },
  { id: 'cento', name: 'Cento vittorie', need: 'Vinci 100 partite', icon: 'zampognaro', ok: (P) => wins(P) >= 100 },
  { id: 'lv5', name: 'Apprendista', need: 'Arriva al livello 5', icon: 'tessitrice', ok: (P) => levelOf(P.xp) >= 5 },
  { id: 'lv10', name: 'Mastro', need: 'Arriva al livello 10', icon: 'impagliatore', ok: (P) => levelOf(P.xp) >= 10 },
  { id: 'lv20', name: 'Leggenda', need: 'Arriva al livello 20', icon: 'zampognaro', ok: (P) => levelOf(P.xp) >= 20 },
  { id: 'mese', name: 'Un mese a tavola', need: 'Gioca da 30 giorni', icon: 'montagna', ok: (P) => days(P) >= 30 },
  { id: 'anno', name: 'Un anno a tavola', need: 'Gioca da un anno', icon: 'raccoglitrice', ok: (P) => days(P) >= 365 },
  { id: 'tre', name: 'Tre anni a tavola', need: 'Gioca da tre anni', icon: 'pastore', ok: (P) => days(P) >= 1095 },
  { id: 'cinque', name: 'Veterano', need: 'Gioca da cinque anni', icon: 'rammendatrice', ok: (P) => days(P) >= 1826 },
];

let P = defaultProfile();
const cloud = { db: null, user: null, uid: null, canWrite: true, players: [], q: Promise.resolve() };

function loadLocal() {
  try {
    const raw = localStorage.getItem('scopa-calabrese-profilo');
    if (raw) P = fixGames(Object.assign(defaultProfile(), JSON.parse(raw)));
  } catch (e) { /* storage unavailable */ }
}
function publicRow() {
  return {
    xp: P.xp, lv: levelOf(P.xp), nick: P.nick.slice(0, 20), av: P.av,
    w: { scopa: P.games.scopa.w, briscola: P.games.briscola.w, sette: P.games.sette.w, tressette: P.games.tressette.w, solitario: P.games.solitario.w },
    wins: wins(P), badges: BADGES.filter((b) => b.ok(P)).length, since: P.since, t: Date.now(),
  };
}
function save() {
  try { localStorage.setItem('scopa-calabrese-profilo', JSON.stringify(P)); } catch (e) { /* ignore */ }
  if (!cloud.db || !cloud.uid) return;
  const snap = JSON.parse(JSON.stringify(P));
  const row = publicRow();
  cloud.q = cloud.q.then(async () => {
    try { await cloud.db.doc('data/users/' + cloud.uid + '/profilo').set(snap); } catch (e) { /* private save failed, local copy kept */ }
    if (!cloud.canWrite) return;
    try { await cloud.db.doc('players/' + cloud.uid).set(row); }
    catch (e) { if (e && e.code === 'invalid_argument') cloud.canWrite = false; renderRank(); }
  });
}

async function initCloud() {
  if (!window.claude || !window.claude.use) return;
  try {
    const [user, db] = await Promise.all([window.claude.use('user'), window.claude.use('db')]);
    cloud.user = user;
    cloud.db = db;
    cloud.uid = user ? await user.id() : null;
    if (user) { const c = await user.can('data.write'); if (c === false) cloud.canWrite = false; }
    if (db && cloud.uid) {
      let needSave = false;
      try {
        const s = await db.doc('data/users/' + cloud.uid + '/profilo').get();
        if (s.exists) {
          const remote = fixGames(Object.assign(defaultProfile(), JSON.parse(JSON.stringify(s.data()))));
          if (remote.xp > P.xp) P = JSON.parse(JSON.stringify(remote));
          else if (remote.xp < P.xp || remote.nick !== P.nick) needSave = true;
          if (remote.since < P.since) P.since = remote.since;
        } else needSave = true;
      } catch (e) { /* keep local */ }
      if (!P.nick && user) { const me = await user.me(); if (me.name) { P.nick = me.name.split(' ')[0].slice(0, 20); needSave = true; } }
      if (needSave) save();
      else { try { localStorage.setItem('scopa-calabrese-profilo', JSON.stringify(P)); } catch (e) { /* ignore */ } }
    }
    if (db) {
      db.collection('players').orderBy('xp', 'desc').limit(200).onSnapshot(
        (snap) => { cloud.players = snap.docs.map((d) => ({ id: d.id, ...d.data() })); renderRank(); },
        () => { cloud.players = []; renderRank(); }
      );
    }
    renderHome();
  } catch (e) { /* offline mode */ }
}

/* ================= navigation & menu screens ================= */
let view = 'vHome';
function go(v) {
  if (v === 'vHome' && window.CONQ_RETURN) { window.CONQ_RETURN = false; v = 'vConq'; }
  view = v;
  if (v !== 'vGame') idleReset();
  for (const id of ['vHome', 'vProfile', 'vBadges', 'vRank', 'vGame', 'vChests', 'vPaese', 'vMazzo', 'vClan', 'vShop', 'vConq', 'vLegal', 'vOnline', 'vMorra', 'vPesca']) $(id).hidden = id !== v;
  if (v === 'vChests') { renderChests(); if (!ndSeen('bauli') && !ND.open) setTimeout(() => { if (view === 'vChests' && !ND.open) showNduja('bauli'); }, 350); }
  if (v === 'vPaese') renderPaese();
  if (v === 'vHome') renderHome();
  if (v === 'vProfile') renderProfile();
  if (v === 'vBadges') renderBadges();
  if (v === 'vRank') renderRank();
  if (v === 'vMazzo') renderMazzo();
  if (v === 'vClan') renderClan();
  if (v === 'vShop') renderShop();
  if (v === 'vProfile') renderPlayGames();
  if (v === 'vLegal') renderLegal();
  if (v === 'vConq') { renderConq(); if (!ndSeen('conquista') && !ND.open) setTimeout(() => { if (view === 'vConq' && !ND.open) showNduja('conquista'); }, 350); }
  if (v !== 'vGame') { window.CLAN_FIGHT = null; window.CONQ_FIGHT = null; window.TOUR_FIGHT = null; }
  if (v !== 'vClan' && typeof clanStopChat === 'function') clanStopChat();
}
document.addEventListener('click', (e) => {
  const g = e.target.closest('[data-go]');
  if (g) go(g.dataset.go);
});

const avSpr = (k) => (typeof SPRITE !== 'undefined' && SPRITE[k]) || AVIMG[k];
function renderHome() {
  const L = levelOf(P.xp), a = xpFor(L), b = xpFor(L + 1);
  $('homeAv').innerHTML = '<img src="' + AVIMG[P.av] + '" alt="">';
  $('homeNick').textContent = P.nick || 'Giocatore';
  $('homeXpBar').style.width = Math.min(100, ((P.xp - a) / (b - a)) * 100) + '%';
  $('homeLv').innerHTML = 'Livello <strong>' + L + '</strong> · ' + BADGES.filter((x) => x.ok(P)).length + ' badge';
  $('homeCoins').innerHTML = '<i class="ico coin"></i><b>' + eco().carlini + '</b>';
  const t = [['scopa', 'campagna-7'], ['briscola', 'bottega-10'], ['sette', 'mare-7'], ['tressette', 'montagna-3'], ['solitario', 'mare-10']];
  $('tiles').innerHTML = t.map(([g, c], i) =>
    '<button class="tile' + (i < 2 ? ' big' : '') + '" data-game="' + g + '"><img src="' + IMG[c] + '" alt=""><span class="tt"><b>' + GAMES[g] + '</b><small>' + P.games[g].w + ' vinte · ' + P.games[g].l + ' perse</small></span></button>'
  ).join('');
  const C = P.conq, owned = C ? C.q.filter((q) => q.stage === 'owned').length : 0;
  const ready = readyChests(), E = eco();
  const S = E.sheep;
  $('gameBox').innerHTML =
    (typeof bgCard === 'function' ? bgCard() : '') +
    (typeof czCard === 'function' ? czCard() : '') +
    (typeof caCard === 'function' ? caCard() : '') +
    '<button class="advc av av-morra" data-go="vMorra"><span class="avspr avhands">' + (typeof handSVG === 'function' ? handSVG(2, true) + handSVG(5, false) : '✊🖐') + '</span><b>La Morra</b><small>' + (P.morra ? P.morra.w + ' vinte' : 'Il gioco delle dita') + '</small></button>' +
    '<button class="advc av av-pesca" data-go="vPesca"><span class="avspr"><img src="' + avSpr('pescatore') + '" alt=""></span><b>La Pesca</b><small>' + (P.pesca ? P.pesca.total + ' pesci pescati' : 'Dal mare di Tropea allo Stretto') + '</small></button>';
  $('advBox').innerHTML =
    '<button class="advc conq" data-go="vConq"><span class="advfaces">' + ['raccoglitrice', 'lanzaturi', 'massaro'].map((x) => '<img src="' + AVIMG[x] + '" alt="">').join('') + '</span><span class="advt"><b>Conquista la Calabria</b><small>' + (C ? owned + ' paesi su 9 · ' + (C.kings ? 'Re della Calabria' : 'stagione ' + C.season) : 'Da Tropea a Cosenza, paese dopo paese') + '</small></span><span class="advgo">▶</span></button>' +
    '<button class="advc av av-paese" data-go="vPaese"><span class="avspr"><img src="' + avSpr('contadino') + '" alt=""></span><b>Il Paese</b><small>' + treeName() + (S ? ' · ' + S.flock.length + ' pecore' : '') + '</small></button>' +
    '<button class="advc av av-bauli" data-go="vChests"><span class="avspr avchest">' + chestSVG('oro') + '</span><b>Bauli</b><small>' + (ready ? ready + (ready === 1 ? ' pronto da aprire' : ' pronti da aprire') : E.chests.length + ' su 4') + '</small><span class="pill" id="chestBadge"' + (ready ? '' : ' hidden') + '>' + ready + '</span></button>' +
    (typeof pzSilhouette === 'function' ? '<button class="advc av av-paesani" data-go="vPaesani"><span class="avspr">' + pzSilhouette() + '</span><b>I Paesani</b><small>' + (P.paese ? 'Forza ' + esc((PZ_BY[P.paese] || { n: P.paese }).n) + '! La classifica dei paesi' : 'La mappa della Calabria e la classifica dei paesi') + '</small></button>' : '') +
    '<button class="advc av av-mazzo" data-go="vShop"><span class="avspr avcards"><img src="' + IMG['montagna-8'] + '" alt=""><img src="' + IMG['campagna-7'] + '" alt=""><img src="' + IMG['mare-10'] + '" alt=""></span><b>Il mazzo vero</b><small>Le carte da stampare</small></button>';
  $('onlBox').innerHTML =
    '<button class="advc av av-clan" data-go="vClan"><span class="avspr"><img src="' + avSpr(P.clan && P.clan.emb ? P.clan.emb : 'zampognaro') + '" alt=""></span><b>Clan</b><small>' + (P.clan && P.clan.name ? esc(P.clan.name) : 'Gioca insieme agli altri') + '</small></button>';
  homeHello();
  advAlert();
  if ($('copyYear')) $('copyYear').textContent = LEGAL.year;
  const nextAv = AVATARS.find((x) => x.lv > L);
  $('homeNote').textContent = nextAv ? 'Al livello ' + nextAv.lv + ' sblocchi l’icona ' + nextAv.label + '.' : 'Hai sbloccato tutte le icone.';
}
/* il saluto in alto e le cose da fare oggi */
const HOME_PROV = [['Cu’ nesci arrinesci.', 'Chi esce di casa riesce nella vita.'], ['Megghiu n’ovu oji ca na gaddina domani.', 'Meglio un uovo oggi che una gallina domani.'], ['A lingua non avi ossu ma rumpi l’ossa.', 'La lingua non ha ossa ma rompe le ossa.'], ['Cu’ sparti avi a megghiu parti.', 'Chi divide si tiene la parte migliore.'], ['Acqua passata non macina mulinu.', 'Acqua passata non macina più.'], ['Cu’ joca sulu non si sciarria mai.', 'Chi gioca da solo non litiga mai.'], ['A carta c’arriva, c’arriva.', 'La carta buona prima o poi arriva.']];
function homeTodo() {
  const L = [], E = eco(), now = Date.now();
  try { if (typeof dailyState === 'function' && dailyState().due) L.push({ ic: '🎁', t: 'Il regalo di Bergo ti aspetta', act: 'daily', hot: 1 }); } catch (e) { /* niente */ }
  const rc = readyChests(); if (rc) L.push({ ic: '🧰', t: rc === 1 ? 'Un baule è pronto da aprire' : rc + ' bauli pronti da aprire', go: 'vChests', hot: 1 });
  try {
    const S = E.sheep;
    if (S && S.flock && S.flock.length) {
      const sick = S.flock.filter((s) => s.sick).length, hungry = typeof isFed === 'function' ? S.flock.filter((s) => !s.sick && !isFed(s, now)).length : 0, ripe = (S.plots || []).filter((pl) => pl.t && now - pl.t >= SH.HAY).length;
      if (sick) L.push({ ic: '🐑', t: sick === 1 ? 'Una pecora è malata!' : sick + ' pecore sono malate!', act: 'sheep', hot: 1 });
      else if (hungry) L.push({ ic: '🐑', t: hungry === 1 ? 'Una pecora ha fame' : hungry + ' pecore hanno fame', act: 'sheep' });
      else if (ripe) L.push({ ic: '🌾', t: 'Il fieno è pronto da raccogliere', act: 'sheep' });
    }
  } catch (e) { /* niente */ }
  try { if (typeof frIn === 'function' && typeof FR !== 'undefined' && frIn().length) L.push({ ic: '👥', t: frIn().length === 1 ? 'Una richiesta di amicizia' : frIn().length + ' richieste di amicizia', go: 'vAmici', hot: 1 }); } catch (e) { /* niente */ }
  try { if (typeof passTodo === 'function' && passTodo()) L.push({ ic: '🎟️', t: 'Premi del Pass da ritirare', go: 'vPass' }); } catch (e) { /* niente */ }
  try { if (P.calcio && P.calcio.camp && typeof czNextMatch === 'function') { const m = czNextMatch(); if (m) L.push({ ic: '⚽', t: 'Campionato: ' + czTeam(m[0]).n + ' – ' + czTeam(m[1]).n, go: 'vCalcio' }); } } catch (e) { /* niente */ }
  try { if (P.casa && P.casa.lv < 5 && typeof CA_FOLK !== 'undefined' && P.casa.w + P.casa.l + P.casa.d > 0) L.push({ ic: '🏠', t: 'Sfida ' + CA_FOLK[P.casa.lv].n + ' a ' + CA_TOWN[CA_FOLK[P.casa.lv].id].town, go: 'vCasa' }); } catch (e) { /* niente */ }
  return L;
}
function homeHello() {
  const el = $('homeHello'); if (!el) return;
  const h = new Date().getHours();
  const greet = h < 5 ? tr2('Bonanotti', 'Buonanotte') : h < 13 ? tr2('Bongiornu', 'Buongiorno') : h < 18 ? tr2('Bon pomeriggiu', 'Buon pomeriggio') : tr2('Bonasira', 'Buonasera');
  const pv = HOME_PROV[Math.floor(Date.now() / 864e5) % HOME_PROV.length];
  const todo = homeTodo(), show = todo.slice(0, 3);
  el.innerHTML = '<div class="hhtop"><button class="hhnd" data-hact="nd" aria-label="Chiedi al Signor ’Nduja">' + (typeof NDUJA_SVG !== 'undefined' ? NDUJA_SVG : '') + '</button><div class="hhtx"><small>' + greet + ',</small><b>' + esc(P.nick || 'paesano') + '!</b><span class="hhpv" title="' + esc(pv[1]) + '">«' + pv[0] + '» <i>' + pv[1] + '</i></span></div></div>' + (typeof dsfHTML === 'function' ? dsfHTML() : '') +
    (show.length ? '<div class="hhtodo"><small>Da fare' + (todo.length > 3 ? ' · altre ' + (todo.length - 3) : '') + '</small>' + show.map((x) => '<button class="' + (x.hot ? 'hot' : '') + '"' + (x.go ? ' data-go="' + x.go + '"' : ' data-hact="' + x.act + '"') + '><span>' + x.ic + '</span><b>' + esc(x.t) + '</b><i>›</i></button>').join('') + '</div>' : '<div class="hhtodo none"><span>✨</span>Tutto a posto! Fatti una partita a carte.</div>');
  homePills();
}
function homePills() {
  const gp = $('gamePill'); if (gp) { const nw = (!P.casa || P.casa.w + P.casa.l + P.casa.d === 0) || (!P.calcio || P.calcio.w + P.calcio.d + P.calcio.l === 0); gp.hidden = !nw; gp.textContent = '!'; }
  const op = $('onlPill'); if (op) { let n = 0; try { if (typeof frIn === 'function' && typeof FR !== 'undefined') n += frIn().length; if (typeof passTodo === 'function') n += passTodo() ? 1 : 0; } catch (e) { /* niente */ } op.hidden = !n; op.textContent = n; }
  const on = $('onlNow'); if (on) { let k = 0; try { if (typeof FR !== 'undefined' && typeof frOk === 'function') k = frOk().filter((f) => frIsOnline(frOther(f))).length; } catch (e) { /* niente */ } on.textContent = k ? '🟢 ' + k + (k === 1 ? ' amico online' : ' amici online') : ''; }
}
$('homeHello').addEventListener('click', (e) => {
  const b = e.target.closest('[data-hact]'); if (!b) return;
  const a = b.dataset.hact;
  if (a === 'nd') { if (!ND.open) showNduja('home'); return; }
  if (a === 'daily' && typeof dailyWindow === 'function') { dailyWindow(() => { renderHome(); }); return; }
  if (a === 'sheep') { paeseTab = 'sheep'; go('vPaese'); return; }
  if (a === 'dsfclaim') { dsfClaim(); return; }
  if (a === 'dsfgo') { dsfGo(); return; }
});
setInterval(() => { if (view === 'vHome' && !$('layer').innerHTML) homeHello(); }, 20000);
/* due pagine del menu: Carte e Avventure */
(() => {
  const box = $('hpages'), tabs = document.querySelectorAll('.htabs [data-hp]');
  const setTab = (i) => { tabs.forEach((b) => b.setAttribute('aria-selected', String(+b.dataset.hp === i))); if (i === 2 && view === 'vHome' && !ndSeen('avventure') && !ND.open) setTimeout(() => { if (view === 'vHome' && !ND.open && !ndSeen('avventure')) showNduja('avventure'); }, 400); };
  $('advRules').addEventListener('click', () => { if (!ND.open) showNduja('avventure'); });
  tabs.forEach((b) => b.addEventListener('click', () => { const i = +b.dataset.hp; box.scrollTo({ left: i * box.clientWidth, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); setTab(i); }));
  let tm = null;
  box.addEventListener('scroll', () => { clearTimeout(tm); tm = setTimeout(() => setTab(Math.round(box.scrollLeft / Math.max(1, box.clientWidth))), 60); }, { passive: true });
  window.addEventListener('resize', () => { const i = [...tabs].findIndex((b) => b.getAttribute('aria-selected') === 'true'); box.scrollLeft = Math.max(0, i) * box.clientWidth; });
})();
function advAlert() {
  const n = readyChests(), C = P.conq;
  const brig = C ? C.q.some((q) => q.brig && q.had) : false;
  const ready = C ? C.q.some((q, i) => q.stage === 'owned' && townStock(i) > 0) : false;
  const p = $('advPill'); if (!p) return;
  const k = n + (brig ? 1 : 0);
  p.hidden = !(k || ready); p.textContent = k || '!';
}
function treeName() { const E = eco(); return TREE_STAGES[treeStage(E.tree.g)].name; }
$('pescaRules').addEventListener('click', () => { if (!ND.open) showNduja('pesca'); });
$('morraRules').addEventListener('click', () => { if (!ND.open) showNduja('morra'); });
$('homeGear').addEventListener('click', () => {
  overlay('<h2>Impostazioni</h2><div class="setlist"><button class="btn musicBtn" aria-pressed="' + MUSIC.on + '">' + (MUSIC.on ? 'Musica sì' : 'Musica no') + '</button><button class="btn" id="setVoice">' + (AUDIO.on ? 'Voce sì' : 'Voce no') + '</button>' + (typeof volSliders === 'function' ? volSliders() : '') + (typeof LN === 'function' && LN() ? '<button class="btn ghost" id="setNotif">Notifiche: ' + (P.notif ? 'sì' : 'no') + '</button><button class="btn ghost" id="setNtest">Prova una notifica</button>' : '') + '<button class="btn ghost" id="setNd">Rivedi la guida del Signor ’Nduja</button><button class="btn ghost" id="setLang">Lingua: ' + (isIt() ? 'Italiano' : 'Calabrese') + '</button><button class="btn ghost" id="setLegal">Note legali e privacy</button>' + (window.AD_PRIVACY ? '<button class="btn ghost" id="setAds">Preferenze sulla pubblicità</button>' : '') + '</div><p class="copy">© ' + LEGAL.year + ' ' + LEGAL.owner + ' · Tutti i diritti riservati · versione ' + LEGAL.version + '</p><button class="btn alt" id="setOk">Chiudi</button>');
  $('setVoice').onclick = () => { $('audioBtn').click(); $('setVoice').textContent = AUDIO.on ? 'Voce sì' : 'Voce no'; };
  $('setNd').onclick = () => { $('layer').innerHTML = ''; showNduja('home'); };
  if ($('setNtest')) $('setNtest').onclick = () => { $('layer').innerHTML = ''; notifTest(); };
  if ($('setNotif')) $('setNotif').onclick = async () => { const ok = await notifSet(!P.notif); $('setNotif').textContent = 'Notifiche: ' + (ok ? 'sì' : 'no'); if (!ok && P.notif === false) flash('Notifiche spente'); };
  $('setOk').onclick = () => { $('layer').innerHTML = ''; };
  $('setLegal').onclick = () => { $('layer').innerHTML = ''; go('vLegal'); };
  $('setLang').onclick = () => { setLang(isIt() ? 'cal' : 'it'); $('setLang').textContent = 'Lingua: ' + (isIt() ? 'Italiano' : 'Calabrese'); flash(isIt() ? 'Ora il gioco è in italiano' : 'Mo u jocu parra calabrisi!'); };
  if ($('setAds')) $('setAds').onclick = async () => { $('layer').innerHTML = ''; try { await window.AD_PRIVACY(); } catch (e) { overlay('<h2>Preferenze sulla pubblicità</h2><p>Questa finestra si attiva quando le pubblicità sono pronte: dopo la verifica dell’account e la pubblicazione dell’app sul Play Store. Per ora non ti stiamo mostrando pubblicità personalizzate.</p><button class="btn" id="adpOk">Ho capito</button>'); $('adpOk').onclick = () => { $('layer').innerHTML = ''; }; } };
});
$('homeProf').addEventListener('click', () => go('vProfile'));
$('tiles').addEventListener('click', (e) => { const t = e.target.closest('[data-game]'); if (t) startGame(t.dataset.game); });

function renderProfile() {
  const L = levelOf(P.xp);
  $('nickIn').value = P.nick;
  $('avGrid').innerHTML = AVATARS.map((a) => {
    const locked = a.lv > L;
    return '<button class="av' + (P.av === a.id ? ' on' : '') + '" data-av="' + a.id + '"' + (locked ? ' disabled' : '') +
      ' aria-pressed="' + (P.av === a.id) + '"><span class="c" data-lv="Liv. ' + a.lv + '"><img src="' + AVIMG[a.id] + '" alt=""></span>' + a.label + '</button>';
  }).join('');
  $('storyBox').innerHTML = storyHTML(P.av, 'La tua icona');
  const g = P.games;
  $('stats').innerHTML = [
    [wins(P), 'vittorie'], [P.best, 'serie migliore'], [days(P), 'giorni a tavola'],
    [g.scopa.w + '–' + g.scopa.l, 'scopa'], [g.briscola.w + '–' + g.briscola.l, 'briscola'], [g.sette.w + '–' + g.sette.l, 'sette e mezzo'],
    [g.tressette.w + '–' + g.tressette.l, 'tressette'], [g.solitario.w + '–' + g.solitario.l, 'solitari'], [P.cappotti, 'cappotti'],
    [P.scope, 'scope'], [P.settebelli, 'settebelli'], [P.reali, 'sette e mezzo reali'],
  ].map(([v, l]) => '<div><b>' + v + '</b><small>' + l + '</small></div>').join('');
}
$('avGrid').addEventListener('click', (e) => {
  const b = e.target.closest('[data-av]');
  if (!b || b.disabled) return;
  P.av = b.dataset.av; save(); renderProfile();
});
$('nickForm').addEventListener('submit', (e) => {
  e.preventDefault();
  if (typeof nickChange === 'function') { nickChange($('nickIn').value); return; }
  P.nick = $('nickIn').value.trim().slice(0, 20);
  save(); renderProfile();
  flash('Salvato');
});

function storyHTML(id, kicker) {
  const s = STORIES[id];
  if (!s) return '';
  return '<article class="story"><img src="' + AVIMG[id] + '" alt=""><div><small>' + kicker + '</small><h4>' + s.t + '</h4>' + s.p.map((x) => '<p>' + x + '</p>').join('') + '</div></article>';
}

function renderBadges() {
  $('badgeList').innerHTML = BADGES.map((b) => {
    const on = b.ok(P);
    return '<div class="badge' + (on ? '' : ' off') + '"><div class="medal"><img src="' + AVIMG[b.icon] + '" alt=""></div><div><b>' + b.name + '</b><small>' + (on ? 'Ottenuto' : b.need) + '</small></div></div>';
  }).join('');
}

let rankKey = 'xp';
$('rankTabs').addEventListener('click', (e) => {
  const b = e.target.closest('[data-k]');
  if (!b) return;
  rankKey = b.dataset.k;
  for (const t of $('rankTabs').children) t.setAttribute('aria-selected', String(t === b));
  renderRank();
});
async function renderRank() {
  if (view !== 'vRank') return;
  const note = $('rankNote'), body = $('rankBody');
  if (!cloud.db) {
    note.textContent = 'La classifica condivisa non è disponibile in questa visualizzazione. Qui sotto trovi solo i tuoi risultati.';
  } else if (!cloud.canWrite) {
    note.textContent = 'Puoi vedere la classifica ma non entrarci: chiedi a chi ha condiviso la pagina di darti il permesso di partecipare.';
  } else {
    note.textContent = 'Tutti i giocatori che hanno accesso a questa pagina.';
  }
  let rows = cloud.players.slice();
  if (!rows.length || !cloud.uid) rows = [{ id: cloud.uid || 'me', ...publicRow() }];
  else if (!rows.some((r) => r.id === cloud.uid) && cloud.uid) rows.push({ id: cloud.uid, ...publicRow() });
  const val = (r) => (rankKey === 'xp' ? r.xp || 0 : (r.w && r.w[rankKey]) || 0);
  rows.sort((a, b) => val(b) - val(a) || (b.xp || 0) - (a.xp || 0));
  rows = rows.slice(0, 100);
  let names = {};
  const needNames = rows.filter((r) => !r.nick && r.id !== 'me').map((r) => r.id);
  if (cloud.user && needNames.length) { try { names = await cloud.user.profiles(needNames); } catch (e) { names = {}; } }
  if (view !== 'vRank') return;
  body.innerHTML = rows.map((r, i) => {
    const me = r.id === cloud.uid || r.id === 'me';
    const nm = r.nick || (names[r.id] && names[r.id].name) || 'Giocatore';
    const av = AVIMG[r.av] || AVIMG.mare;
    const v = rankKey === 'xp' ? 'Liv. ' + levelOf(r.xp || 0) : val(r) + ' vinte';
    return '<tr class="' + (me ? 'me' : '') + '"><td class="r">' + (i + 1) + '</td><td class="n"><div><img src="' + av + '" alt=""><span>' + esc(nm) + (me ? ' (tu)' : '') + '</span></div></td><td class="v">' + v + '</td></tr>';
  }).join('');
}

/* ================= rewards ================= */
function award(game, won, bonus, extra, lines, mult) {
  const before = levelOf(P.xp);
  const badgesBefore = new Set(BADGES.filter((b) => b.ok(P)).map((b) => b.id));
  const gained = ((won ? { scopa: 120, briscola: 90, sette: 70, tressette: 100, solitario: 80 }[game] : { scopa: 30, briscola: 25, sette: 20, tressette: 25, solitario: 10 }[game]) + bonus) * (mult || 1);
  P.xp += gained;
  P.games[game][won ? 'w' : 'l']++;
  if (game !== 'solitario') { if (won) { P.streak++; P.best = Math.max(P.best, P.streak); } else P.streak = 0; }
  if (extra) extra(P);
  const after = levelOf(P.xp);
  const newAv = AVATARS.filter((a) => a.lv > before && a.lv <= after);
  const newBadges = BADGES.filter((b) => b.ok(P) && !badgesBefore.has(b.id));
  const chestHtml = grantChest(won);
  save();
  let html = '<div class="gain"><div class="xp">+' + gained + ' XP</div>' + chestHtml;
  lines = (lines || []).concat(conqOnAward(game, won), clanOnAward(game, won), typeof tourOnAward === 'function' ? tourOnAward(game, won) : []);
  if (mult > 1) lines = lines.concat('Doppio profumo di Bergo: XP x2');
  if (lines && lines.length) html += '<div style="font-size:14px;color:#5A4C3A">' + lines.join(' · ') + '</div>';
  if (after > before) html += '<div class="lvup">Sei salito al livello ' + after + '!</div>';
  if (newAv.length) html += newAv.map((a) => storyHTML(a.id, 'Nuova icona sbloccata')).join('');
  if (newBadges.length) html += '<div class="unl">' + newBadges.map((b) => '<div><img src="' + AVIMG[b.icon] + '" alt="">Badge: ' + b.name + '</div>').join('') + '</div>';
  html += '</div>';
  if (after > before) setTimeout(() => flash('Livello ' + after + '!'), 300);
  return html;
}

/* ================= game shell ================= */
let G = null;
function startGame(kind) {
  if (!GAMES[kind]) { flash('Questo gioco non è disponibile'); return; }
  clearTimeout(timer);
  $('layer').innerHTML = '';
  go('vGame');
  window.CONQ_RETURN = !!window.CONQ_FIGHT;
  $('gTitle').textContent = GAMES[kind] + (window.CONQ_FIGHT ? ' · per ' + TOWNS[window.CONQ_FIGHT.town].name : window.CLAN_FIGHT ? ' · sfida con ' + window.CLAN_FIGHT.name : window.TOUR_FIGHT ? ' · ' + ['quarti', 'semifinale', 'finale'][window.TOUR_FIGHT.round] : '');
  currentKind = kind;
  const run = () => { $('table').style.removeProperty('--n'); $('hand').className = 'hand'; $('opp').className = kind === 'tressette' ? 'opp many' : 'opp'; if (kind === 'scopa') Scopa.start(); if (kind === 'briscola') Briscola.start(); if (kind === 'sette') { $('hand').className = 'hand none'; Sette.start(); } if (kind === 'tressette') { $('hand').className = 'hand many'; Tressette.start(); } if (kind === 'solitario') { $('hand').className = 'hand none'; Solitario.start(); } };
  PAUSE.pending = null; PAUSE.user = false; PAUSE.on = false;
  $('quitBtn').textContent = 'Pausa';
  if (!ndSeen(kind)) {
    G = null;
    $('opp').innerHTML = ''; $('table').innerHTML = ''; $('hand').innerHTML = ''; $('bar').innerHTML = ''; $('deckBox').innerHTML = ''; $('oppSide').innerHTML = ''; $('youSide').innerHTML = ''; $('gScore').innerHTML = '';
    showNduja(kind, run);
  } else run();
}
let currentKind = null;
$('rulesBtn').addEventListener('click', () => { if (currentKind && !ND.open) showNduja(currentKind); });
$('ndHome').addEventListener('click', () => { if (!ND.open) showNduja('home'); });
$('homeVoice').addEventListener('click', () => $('audioBtn').click());
$('audioBtn').addEventListener('click', () => {
  AUDIO.on = !AUDIO.on;
  try { localStorage.setItem('scopa-calabrese-audio', AUDIO.on ? 'si' : 'no'); } catch (e) { /* ignore */ }
  if (!AUDIO.on) { try { speechSynthesis.cancel(); } catch (e) { /* ignore */ } }
  syncAudioBtn();
});
syncAudioBtn();
/* pausa delle partite contro il computer: le mosse in coda aspettano finché non riprendi */
function pauseGame() {
  if (!G || G.over || G.online || view !== 'vGame' || PAUSE.user) return;
  PAUSE.user = true; PAUSE.on = true; idleReset();
  try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) { /* niente */ }
  overlay('<div class="pausewin"><div class="pauseico" aria-hidden="true"><i></i><i></i></div><h2>Partita in pausa</h2><p>Le carte restano sul tavolo: nessuno le tocca finché non torni.</p>' +
    '<button class="btn take" id="qNo">▶ Riprendi</button><button class="btn alt" id="qYes">Esci dalla partita</button><small class="pznote">Una partita lasciata a metà non dà punti esperienza e non conta nelle statistiche.</small></div>');
  $('qNo').onclick = resumeGame;
  $('qYes').onclick = () => { PAUSE.user = false; PAUSE.on = false; PAUSE.pending = null; idleReset(); clearTimeout(timer); G = null; $('layer').innerHTML = ''; go('vHome'); };
}
function resumeGame() {
  $('layer').innerHTML = '';
  PAUSE.user = false;
  if (!$('bgLayer')) {
    PAUSE.on = false;
    if (PAUSE.pending) { const fn = PAUSE.pending; PAUSE.pending = null; setTimeout(fn, 250); }
  }
  if (G && G.render) G.render();
}
document.addEventListener('visibilitychange', () => { if (document.hidden && G && !G.over && !G.online && view === 'vGame' && !$('layer').innerHTML) pauseGame(); });
$('quitBtn').addEventListener('click', () => {
  if (G && !G.over && !G.online) { pauseGame(); return; }
  if (G && !G.over) {
    $('layer').innerHTML = '<div class="overlay" role="dialog" aria-modal="true"><div class="sheet"><h2>Lasci la partita?</h2><p>' + (G.online ? 'È una partita online: se esci, vince il tuo avversario.' : 'Una partita lasciata a metà non dà punti esperienza e non conta nelle statistiche.') + '</p><button class="btn" id="qYes">Torna al menu</button><button class="btn alt" id="qNo">Continua a giocare</button></div></div>';
    $('qYes').onclick = () => { idleReset(); clearTimeout(timer); G = null; $('layer').innerHTML = ''; go('vHome'); };
    $('qNo').onclick = () => { $('layer').innerHTML = ''; };
  } else { clearTimeout(timer); G = null; $('layer').innerHTML = ''; go('vHome'); }
});
function overlay(html) {
  $('layer').innerHTML = '<div class="overlay" role="dialog" aria-modal="true"><div class="sheet">' + html + '</div></div>';
  const b = $('layer').querySelector('.btn');
  if (b) setTimeout(() => b.focus(), 50);
}
function setScore(a, b, label) {
  $('gScore').innerHTML = '<div><b>' + a + '</b><small>Tu</small></div><div><b>' + b + '</b><small>CPU</small></div>' + (label ? '<div style="border:none;background:none;justify-content:center;color:var(--muted);font-size:12px;min-width:0">' + label + '</div>' : '');
}
function handButtons(cards, enabled, sel) {
  $('hand').innerHTML = cards.map((c, i) =>
    '<button class="card' + (sel === i ? ' sel' : '') + '" data-i="' + i + '" ' + (enabled ? '' : 'disabled') + ' aria-pressed="' + (sel === i) + '">' + img(c) + '</button>'
  ).join('');
}
$('hand').addEventListener('click', (e) => {
  const b = e.target.closest('button.card');
  if (!b || b.disabled || !G || !G.onHand) return;
  idleReset();
  G.onHand(Number(b.dataset.i));
});
for (const id of ['table', 'hand']) $(id).addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]');
  if (!b || b.disabled || !G || !G.onAct) return;
  idleReset();
  G.onAct(b.dataset.act, b.dataset.k, b);
});
$('bar').addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]');
  if (!b || b.disabled || !G || !G.onAct) return;
  idleReset();
  G.onAct(b.dataset.act, b.dataset.k, b);
});

/* ================= SCOPA ================= */
const Scopa = (() => {
  const PRIM = { 7: 21, 6: 18, 1: 16, 5: 15, 4: 14, 3: 13, 2: 12, 8: 10, 9: 10, 10: 10 };
  const isSB = (c) => c.s === 'campagna' && c.v === 7;
  let S;
  function captures(card, table) {
    const singles = table.filter((t) => t.v === card.v);
    if (singles.length) return singles.map((t) => [t]);
    const out = [], n = table.length;
    for (let m = 1; m < 1 << n; m++) {
      let sum = 0, cnt = 0; const set = [];
      for (let i = 0; i < n; i++) if (m & (1 << i)) { sum += table[i].v; cnt++; set.push(table[i]); }
      if (cnt >= 2 && sum === card.v) out.push(set);
    }
    return out;
  }
  function start() {
    S = { total: [0, 0], dealer: 1, handNo: 0, totScope: 0, totSB: 0, over: false, bergoUsed: false, lastMyScopa: false, xpMult: 1, peek: false };
    G = S; S.render = () => render();
    S.onHand = onHand; S.onAct = onAct;
    hand();
  }
  function hand() {
    let deck, table;
    do { deck = newDeck(); table = deck.splice(0, 4); } while (table.filter((c) => c.v === 10).length >= 3);
    S.peek = !!S.peekNext; S.peekNext = false;
    Object.assign(S, { deck, table, hands: [deck.splice(0, 3), deck.splice(0, 3)], caps: [[], []], scope: [0, 0], lastCap: null, turn: 1 - S.dealer, phase: 'play', sel: null, anim: null });
    S.handNo++;
    S.msg = S.turn === 0 ? 'Smazzata ' + S.handNo + '. Tocca a te.' : 'Smazzata ' + S.handNo + '. Inizia il computer.';
    render();
    if (S.turn === 1) schedule(ai, 1000);
  }
  function play(p, card, cap) {
    S.hands[p] = S.hands[p].filter((c) => c.id !== card.id);
    S.sel = null;
    fx('card');
    if (cap && cap.length) {
      S.phase = 'busy'; S.anim = { card, cap }; S.table.push(card);
      S.msg = (p === 0 ? 'Con ' + cname(card) + ' prendi ' : 'Il computer gioca ' + cname(card) + ' e prende ') + cap.map(short).join(' + ') + '.';
      render();
      schedule(() => {
        const ids = new Set(cap.map((c) => c.id).concat(card.id));
        S.table = S.table.filter((c) => !ids.has(c.id));
        S.caps[p].push(card, ...cap); S.lastCap = p; S.anim = null;
        const last = !S.deck.length && !S.hands[0].length && !S.hands[1].length;
        fx('take');
        if (!S.table.length && !last) {
          S.scope[p]++;
          say(p === 0 ? 'scopa' : 'cpuScopa', p);
          if (p === 0) {
            if (S.lastMyScopa && !S.bergoUsed) {
              S.bergoUsed = true; PAUSE.on = true;
              setTimeout(() => showBergo('scopa', (id, bis) => { if (id === 'peek') { S.peek = true; if (bis) S.peekNext = true; } if (id === 'pt') S.total[0]++; if (id === 'xp') S.xpMult = bis ? 3 : 2; render(); }), 1500);
            }
            S.lastMyScopa = true;
          }
          S.msg = p === 0 ? '<em>Scopa!</em> Hai pulito il tavolo.' : 'Il computer fa <em>scopa</em>.';
        } else if (cap.concat(card).some(isSB)) {
          if (p === 0) S.lastMyScopa = false;
          say(p === 0 ? 'settebello' : 'cpuBig', p);
        } else if (p === 0 && cap.length >= 3) {
          S.lastMyScopa = false;
          say('bella', 0);
        } else if (p === 0) S.lastMyScopa = false;
        next(p);
      }, 900);
    } else {
      S.table.push(card);
      if (p === 0) S.lastMyScopa = false;
      S.msg = (p === 0 ? 'Hai calato ' : 'Il computer cala ') + cname(card) + '.';
      next(p);
    }
  }
  function next(p) {
    if (!S.hands[0].length && !S.hands[1].length) {
      if (S.deck.length) S.hands = [S.deck.splice(0, 3), S.deck.splice(0, 3)];
      else { end(); return; }
    }
    S.turn = 1 - p; S.phase = 'play';
    render();
    if (S.turn === 1) schedule(ai, 1100);
  }
  function ai() {
    if (G !== S || S.phase !== 'play' || S.turn !== 1) return;
    const hand = S.hands[1];
    const last = !S.deck.length && hand.length === 1 && !S.hands[0].length;
    let best = null;
    for (const c of hand) {
      const opts = captures(c, S.table);
      if (opts.length) {
        for (const o of opts) {
          let v = 2 + o.length;
          for (const x of o.concat(c)) { if (x.s === 'campagna') v += 1.5; if (x.v === 7) v += 2.5; if (x.v === 6) v += 0.8; if (isSB(x)) v += 12; }
          const rest = S.table.filter((t) => !o.includes(t));
          if (!rest.length && !last) v += 14;
          const sum = rest.reduce((a, t) => a + t.v, 0);
          if (rest.length && sum <= 10) v -= 4;
          if (!best || v > best.v) best = { v, c, o };
        }
      } else {
        let v = -c.v * 0.15;
        if (c.v === 7) v -= 3; if (isSB(c)) v -= 10; if (c.s === 'campagna') v -= 0.8;
        if (S.table.reduce((a, t) => a + t.v, 0) + c.v <= 10) v -= 5;
        if (!best || v > best.v) best = { v, c, o: null };
      }
    }
    play(1, best.c, best.o);
  }
  function score() {
    if (S.table.length && S.lastCap !== null) { S.caps[S.lastCap].push(...S.table); S.table = []; }
    const [a, b] = S.caps, rows = [], pt = [0, 0];
    const cmp = (x, y) => (x > y ? 0 : y > x ? 1 : -1);
    const add = (label, va, vb, w, note) => { if (w >= 0) pt[w]++; rows.push({ label, va, vb, w, note }); };
    add('Carte', a.length, b.length, cmp(a.length, b.length));
    const da = a.filter((c) => c.s === 'campagna').length, db = b.filter((c) => c.s === 'campagna').length;
    add('Ulivi', da, db, cmp(da, db), 'seme di Campagna');
    const sb = a.some(isSB) ? 0 : 1;
    add('Settebello', sb === 0 ? '✓' : '–', sb === 1 ? '✓' : '–', sb);
    const prim = (caps) => { let t = 0; for (const s of SUITS) { const vals = caps.filter((c) => c.s === s).map((c) => PRIM[c.v]); if (!vals.length) return 0; t += Math.max(...vals); } return t; };
    const pa = prim(a), pb = prim(b);
    add('Primiera', pa || '–', pb || '–', cmp(pa, pb));
    rows.push({ label: 'Scope', va: S.scope[0], vb: S.scope[1], w: -2 });
    pt[0] += S.scope[0]; pt[1] += S.scope[1];
    return { rows, pt, sb };
  }
  function end() {
    const leftover = S.table.length, lastWho = S.lastCap;
    const r = score();
    S.total[0] += r.pt[0]; S.total[1] += r.pt[1];
    S.totScope += S.scope[0]; if (r.sb === 0) S.totSB++;
    const over = (S.total[0] >= 11 || S.total[1] >= 11) && S.total[0] !== S.total[1];
    S.phase = 'end'; S.msg = 'Smazzata finita.';
    render();
    const cell = (v, win) => (win ? '<span class="pt">' + v + '</span>' : v);
    const rows = r.rows.map((x) => '<tr><td>' + x.label + (x.note ? '<small>' + x.note + '</small>' : '') + '</td><td>' + cell(x.va, x.w === 0 || (x.w === -2 && x.va > 0)) + '</td><td>' + cell(x.vb, x.w === 1 || (x.w === -2 && x.vb > 0)) + '</td></tr>').join('');
    let head, gain = '', btn;
    if (over) {
      S.over = true;
      const won = S.total[0] > S.total[1];
      say(won ? 'win' : 'lose', won ? 0 : 1);
      head = '<h2>' + (won ? 'Hai vinto la partita!' : 'Vince il computer') + '</h2><p>Finale ' + S.total[0] + ' a ' + S.total[1] + '.</p>';
      const bonus = S.totScope * 10 + S.totSB * 15;
      const sc = S.totScope, sbn = S.totSB;
      gain = award('scopa', won, bonus, (p) => { p.scope += sc; p.settebelli += sbn; }, [sc + ' scope', sbn + ' settebelli'], S.xpMult);
      btn = '<button class="btn" id="nb">Nuova partita</button><button class="btn alt" id="mb">Menu</button>';
    } else {
      head = '<h2>Fine smazzata</h2><p>' + (leftover && lastWho !== null ? 'Le ' + leftover + ' carte rimaste vanno a ' + (lastWho === 0 ? 'te' : 'chi ha preso per ultimo, il computer') + '. ' : '') + 'Punti: tu ' + r.pt[0] + ', computer ' + r.pt[1] + '.</p>';
      btn = '<button class="btn" id="nb">Prossima smazzata</button>';
    }
    overlay(head + '<table><thead><tr><th>Voce</th><th>Tu</th><th>CPU</th></tr></thead><tbody>' + rows + '</tbody><tfoot><tr><td>Totale partita</td><td>' + S.total[0] + '</td><td>' + S.total[1] + '</td></tr></tfoot></table>' + gain + btn +
      '<details><summary>Come si conta</summary><ul><li><b>Carte</b>: chi ne ha prese di più (oltre 20).</li><li><b>Ulivi</b>: chi ha più carte di Campagna, il seme che fa da denari.</li><li><b>Settebello</b>: il 7 di Campagna.</li><li><b>Primiera</b>: la carta migliore per seme (7 = 21, 6 = 18, Asso = 16, 5 = 15, 4 = 14, 3 = 13, 2 = 12, figure = 10).</li><li><b>Scope</b>: un punto ciascuna. Si vince a 11.</li></ul></details>');
    $('nb').onclick = () => { $('layer').innerHTML = ''; if (S.over) energyGate(start); else { S.dealer = 1 - S.dealer; hand(); } };
    if ($('mb')) $('mb').onclick = () => { $('layer').innerHTML = ''; G = null; go('vHome'); };
  }
  function onHand(i) { if (S.turn !== 0 || S.phase !== 'play') return; S.sel = S.sel === i ? null : i; render(); }
  function onAct(act, k) {
    if (S.turn !== 0 || S.phase !== 'play' || S.sel === null) return;
    const card = S.hands[0][S.sel];
    if (act === 'cancel') { S.sel = null; render(); }
    else if (act === 'drop') play(0, card, null);
    else if (act === 'take') play(0, card, captures(card, S.table)[Number(k)]);
  }
  function render() {
    setScore(S.total[0], S.total[1], 'a 11');
    $('opp').innerHTML = S.peek ? S.hands[1].map((c) => '<div class="card">' + img(c) + '</div>').join('') + '<span class="side bonusTag">Occhio di Bergo</span>' : S.hands[1].map(back).join('');
    const side = (p) => 'Prese <strong>' + S.caps[p].length + '</strong>' + (S.scope[p] ? ' · Scope <span class="pip">' + S.scope[p] + '</span>' : '');
    $('oppSide').innerHTML = side(1);
    $('youSide').innerHTML = side(0);
    $('deckBox').innerHTML = back() + '<span class="side">Mazzo <strong>' + S.deck.length + '</strong></span>';
    const my = S.turn === 0 && S.phase === 'play';
    const sel = S.sel !== null ? S.hands[0][S.sel] : null;
    const opts = sel ? captures(sel, S.table) : [];
    const hint = new Set(opts.flat().map((c) => c.id));
    const taking = S.anim ? new Set(S.anim.cap.map((c) => c.id)) : new Set();
    const played = S.anim ? S.anim.card.id : null;
    $('table').innerHTML = S.table.length ? S.table.map((c) => '<div class="card' + (c.id === played ? ' played' : taking.has(c.id) ? ' taking' : hint.has(c.id) ? ' hint' : '') + '">' + img(c) + '</div>').join('') : '<div class="empty">Tavolo vuoto</div>';
    fitTable();
    handButtons(S.hands[0], my, S.sel);
    let bar;
    if (my && sel) {
      bar = opts.length ? opts.map((o, k) => '<button class="btn take" data-act="take" data-k="' + k + '">Prendi ' + o.map(short).join(' + ') + '</button>').join('') : '<button class="btn" data-act="drop">Cala ' + cname(sel) + '</button>';
      bar += '<button class="btn ghost" data-act="cancel">Annulla</button>';
    } else bar = '<div class="msg">' + S.msg + (my && S.msg.indexOf('Tocca') < 0 ? ' Tocca a te.' : '') + '</div>';
    $('bar').innerHTML = bar;
    idle(my);
  }
  return { start };
})();

/* ================= BRISCOLA ================= */
const Briscola = (() => {
  const RANK = { 1: 10, 3: 9, 10: 8, 9: 7, 8: 6, 7: 5, 6: 4, 5: 3, 4: 2, 2: 1 };
  const PTS = { 1: 11, 3: 10, 10: 4, 9: 3, 8: 2 };
  const pts = (c) => PTS[c.v] || 0;
  let B;
  function start() {
    const deck = newDeck();
    const hands = [deck.splice(0, 3), deck.splice(0, 3)];
    const bris = deck.shift();
    deck.push(bris);
    B = { deck, bris, hands, trick: [], won: [[], []], leader: Math.random() < 0.5 ? 0 : 1, phase: 'play', over: false, msg: '', bergoUsed: false, peek: 0, bonusPts: 0, xpMult: 1 };
    G = B; B.onHand = onHand; B.onAct = () => {}; B.render = () => render();
    B.msg = 'La briscola è ' + SUIT_NAME[bris.s] + '. ' + (B.leader === 0 ? 'Inizi tu.' : 'Inizia il computer.');
    render();
    if (B.leader === 1) schedule(ai, 1000);
  }
  const turn = () => (B.trick.length === 0 ? B.leader : 1 - B.leader);
  function beats(a, b) { // does b beat a (a led)?
    if (b.s === a.s) return RANK[b.v] > RANK[a.v];
    return b.s === B.bris.s;
  }
  function play(p, c) {
    B.hands[p] = B.hands[p].filter((x) => x.id !== c.id);
    fx('card');
    B.trick.push({ p, c });
    B.msg = (p === 0 ? 'Hai giocato ' : 'Il computer gioca ') + cname(c) + '.';
    if (B.trick.length === 2) {
      const [a, b] = B.trick;
      const w = beats(a.c, b.c) ? b.p : a.p;
      const got = pts(a.c) + pts(b.c);
      B.phase = 'busy'; B.win = w;
      if (w === 0 && got >= 15 && !B.bergoUsed) {
        B.bergoUsed = true; PAUSE.on = true;
        setTimeout(() => showBergo('briscola', (id, bis) => { if (id === 'peek') B.peek += bis ? 3 : 4; if (id === 'pt') B.bonusPts += 10; if (id === 'xp') B.xpMult = bis ? 3 : 2; }), 1500);
      }
      if (got >= 10) say(w === 0 ? 'bella' : 'cpuBig', w); else fx('take');
      B.msg = w === 0 ? 'Prendi tu.' : 'Prende il computer.';
      render();
      schedule(() => {
        B.won[w].push(a.c, b.c);
        if (B.deck.length) { B.hands[w].push(B.deck.shift()); B.hands[1 - w].push(B.deck.shift()); }
        B.trick = []; B.leader = w; B.win = null;
        if (B.peek > 0 && !PAUSE.on) B.peek--;
        if (!B.hands[0].length && !B.hands[1].length) { end(); return; }
        B.phase = 'play';
        render();
        if (turn() === 1) schedule(ai, 900);
      }, 1300);
    } else {
      render();
      if (turn() === 1) schedule(ai, 900);
    }
  }
  function cost(c) { return pts(c) * 2 + (c.s === B.bris.s ? 9 + RANK[c.v] : 0) + RANK[c.v] * 0.1; }
  function ai() {
    if (G !== B || B.phase !== 'play' || turn() !== 1) return;
    const h = B.hands[1];
    let pick;
    if (!B.trick.length) {
      pick = h.slice().sort((x, y) => cost(x) - cost(y))[0];
    } else {
      const a = B.trick[0].c;
      const winners = h.filter((c) => beats(a, c));
      const sameSuit = winners.filter((c) => c.s === a.s && c.s !== B.bris.s).sort((x, y) => RANK[y.v] - RANK[x.v]);
      const brisW = winners.filter((c) => c.s === B.bris.s).sort((x, y) => cost(x) - cost(y));
      if (sameSuit.length) pick = sameSuit[0];
      else if (brisW.length && (pts(a) >= 10 || (pts(a) >= 2 && pts(brisW[0]) === 0) || (!B.deck.length && pts(a) > 0))) pick = brisW[0];
      else pick = h.slice().sort((x, y) => cost(x) - cost(y))[0];
    }
    play(1, pick);
  }
  function end() {
    const a0 = B.won[0].reduce((s, c) => s + pts(c), 0), b = 120 - a0, a = a0 + B.bonusPts;
    B.over = true; B.phase = 'end';
    render();
    let head;
    if (a === b) {
      head = '<h2>Pareggio</h2><p>60 a 60: nessuno vince. La partita non conta nelle statistiche.</p>';
      overlay(head + '<button class="btn" id="nb">Rivincita</button><button class="btn alt" id="mb">Menu</button>');
    } else {
      const won = a > b;
      setTimeout(() => say(won ? 'win' : 'lose', won ? 0 : 1), 200);
      head = '<h2>' + (won ? 'Hai vinto!' : 'Vince il computer') + '</h2><p>Hai fatto ' + a + ' punti su 120' + (a >= 100 ? ': un cappotto!' : '.') + '</p>';
      const bonus = won && a >= 91 ? 20 : 0;
      const gain = award('briscola', won, bonus, (p) => { if (a0 >= 100) p.cappotti++; }, [a0 + ' punti' + (B.bonusPts ? ' + ' + B.bonusPts + ' di Bergo' : '')], B.xpMult);
      overlay(head + '<table><thead><tr><th>Punti</th><th>Tu</th><th>CPU</th></tr></thead><tbody><tr><td>Totale</td><td><span class="' + (won ? 'pt' : '') + '">' + a + '</span></td><td><span class="' + (won ? '' : 'pt') + '">' + b + '</span></td></tr><tr><td>Carte prese</td><td>' + B.won[0].length + '</td><td>' + B.won[1].length + '</td></tr></tbody></table>' + gain +
        '<button class="btn" id="nb">Nuova partita</button><button class="btn alt" id="mb">Menu</button>' +
        '<details><summary>Come si conta</summary><ul><li>Asso 11, Tre 10, Re 4, Cavallo 3, Donna 2, le altre zero.</li><li>Vince chi supera 60 punti su 120.</li><li>La briscola batte gli altri semi; a parità di seme vince la carta più alta (Asso, Tre, Re, Cavallo, Donna, 7…2).</li></ul></details>');
    }
    $('nb').onclick = () => { $('layer').innerHTML = ''; energyGate(start); };
    $('mb').onclick = () => { $('layer').innerHTML = ''; G = null; go('vHome'); };
  }
  function onHand(i) { if (B.phase !== 'play' || turn() !== 0) return; play(0, B.hands[0][i]); }
  function render() {
    const tp = (p) => B.won[p].length;
    setScore(tp(0), tp(1), 'carte');
    $('opp').innerHTML = B.peek > 0 ? B.hands[1].map((c) => '<div class="card">' + img(c) + '</div>').join('') + '<span class="side bonusTag">Occhio di Bergo · ' + B.peek + '</span>' : B.hands[1].map(back).join('');
    $('oppSide').innerHTML = 'Briscola <strong>' + SUIT_NAME[B.bris.s] + '</strong>';
    $('youSide').innerHTML = 'Punti visibili a fine partita';
    $('deckBox').innerHTML = (B.deck.length ? back() + '<img class="bris" src="' + IMG[B.bris.id] + '" alt="Briscola: ' + cname(B.bris) + '">' : '') + '<span class="side">Mazzo <strong>' + B.deck.length + '</strong></span>';
    const slot = (p) => {
      const t = B.trick.find((x) => x.p === p);
      return '<div class="slot">' + (t ? '<div class="card' + (B.win === p ? ' win' : '') + '">' + img(t.c) + '</div>' : '<div class="ghostcard"></div>') + (p === 0 ? 'Tu' : 'Computer') + '</div>';
    };
    $('table').innerHTML = '<div class="trick">' + slot(1) + slot(0) + '</div>';
    const my = B.phase === 'play' && turn() === 0;
    handButtons(B.hands[0], my, null);
    $('bar').innerHTML = '<div class="msg">' + B.msg + (my ? ' <em>Tocca a te.</em>' : '') + '</div>';
    idle(my);
  }
  return { start };
})();

/* ================= SETTE E MEZZO ================= */
const Sette = (() => {
  const isMatta = (c) => c.s === 'campagna' && c.v === 10;
  const val = (c) => (c.v >= 8 ? 0.5 : c.v);
  function total(cards) {
    let base = 0, matte = 0;
    for (const c of cards) { if (isMatta(c)) matte++; else base += val(c); }
    if (!matte) return base;
    let best = base + 0.5;
    for (let v = 7; v >= 0.5; v -= 0.5) { if (Number.isInteger(v) || v === 0.5) { if (base + v <= 7.5) { best = base + v; break; } } }
    return best;
  }
  const fmt = (n) => (n % 1 ? String(Math.floor(n)).replace(/^0$/, '') + (Math.floor(n) ? ' e mezzo' : 'mezzo') : String(n));
  const reale = (cards) => cards.length === 2 && total(cards) === 7.5 && cards.some((c) => c.v === 7 && !isMatta(c));
  let T;
  function start() {
    T = { score: [0, 0], round: 0, reali: 0, over: false, bergoUsed: false, peekNext: false, peekNow: false, xpMult: 1 };
    G = T; T.onHand = () => {}; T.onAct = onAct; T.render = () => render();
    round();
  }
  function round() {
    T.deck = newDeck(); T.you = [T.deck.shift()]; T.cpu = []; T.phase = 'you'; T.round++;
    T.peekNow = (T.peekLeft || 0) > 0; if (T.peekNow) T.peekLeft--;
    T.msg = 'Mano ' + T.round + '. Chiedi carta o stai.';
    render();
  }
  function onAct(act) {
    if (act === 'next') { $('layer').innerHTML = ''; round(); return; }
    if (T.phase !== 'you') return;
    if (act === 'hit') {
      T.you.push(T.deck.shift());
      fx('card');
      const t = total(T.you);
      if (t > 7.5) { T.msg = 'Hai fatto ' + fmt(t) + ': <em>sballato</em>.'; say('sballo', 1); finish(1); return; }
      if (t === 7.5) { T.msg = 'Sette e mezzo!'; say(reale(T.you) ? 'reale' : 'sette', 0); render(); schedule(dealer, 700); T.phase = 'cpu'; return; }
      T.msg = 'Hai ' + fmt(t) + '.';
      render();
    } else if (act === 'stay') {
      T.phase = 'cpu';
      T.msg = 'Stai con ' + fmt(total(T.you)) + '. Gioca il banco.';
      render();
      schedule(dealer, 800);
    }
  }
  function dealer() {
    if (G !== T || T.phase !== 'cpu') return;
    const t = total(T.cpu);
    const y0 = total(T.you);
    if (T.cpu.length === 0 || t < y0) {
      T.cpu.push(T.deck.shift());
      fx('card');
      const nt = total(T.cpu);
      T.msg = 'Il banco ha ' + fmt(nt) + '.';
      render();
      if (nt > 7.5) { T.msg = 'Il banco fa ' + fmt(nt) + ' e <em>sballa</em>.'; say('bancoSballa', 0); finish(0); return; }
      schedule(dealer, 900);
    } else {
      T.msg = 'Il banco sta con ' + fmt(t) + ' contro il tuo ' + fmt(y0) + '. A parità vince il banco.';
      finish(y0 > t ? 0 : 1);
    }
  }
  function finish(w) {
    T.phase = 'done';
    T.score[w]++;
    if (w === 0 && reale(T.you)) T.reali++;
    fx(w === 0 ? 'take' : 'sad');
    render();
    if (w === 0 && total(T.you) === 7.5 && !T.bergoUsed) {
      T.bergoUsed = true; PAUSE.on = true; render();
      setTimeout(() => showBergo('sette', (id) => { if (id === 'peek') T.peekLeft = (T.peekLeft || 0) + 1; if (id === 'pt') T.score[0]++; if (id === 'xp') T.xpMult = T.xpMult === 2 ? 3 : 2; render(); }, () => setTimeout(checkOver, 200)), 1400);
      return;
    }
    checkOver();
  }
  function checkOver() {
    if (T.over) return;
    if (T.score[0] >= 5 || T.score[1] >= 5) {
      T.over = true;
      const won = T.score[0] > T.score[1];
      const r = T.reali;
      setTimeout(() => say(won ? 'win' : 'lose', won ? 0 : 1), 2600);
      const gain = award('sette', won, r * 10, (p) => { p.reali += r; }, [T.score[0] + ' mani vinte', r + ' reali'], T.xpMult);
      render();
      setTimeout(() => {
        overlay('<h2>' + (won ? 'Hai battuto il banco!' : 'Vince il banco') + '</h2><p>Mani vinte: tu ' + T.score[0] + ', banco ' + T.score[1] + '.</p>' + gain +
          '<button class="btn" id="nb">Nuova partita</button><button class="btn alt" id="mb">Menu</button>' +
          '<details><summary>Regole</summary><ul><li>Le carte da 1 a 7 valgono il loro numero, le figure mezzo punto.</li><li>Il Re di Campagna è la matta: vale quello che ti serve.</li><li>Chi supera 7 e mezzo sballa. A parità vince il banco.</li><li>Sette e mezzo con un 7 e una figura è reale e vale punti esperienza extra.</li><li>Vince chi arriva per primo a 5 mani.</li></ul></details>');
        $('nb').onclick = () => { $('layer').innerHTML = ''; energyGate(start); };
        $('mb').onclick = () => { $('layer').innerHTML = ''; G = null; go('vHome'); };
      }, 1200);
    }
  }
  function render() {
    setScore(T.score[0], T.score[1], 'a 5');
    const showCpu = T.phase !== 'you';
    $('opp').innerHTML = T.cpu.length ? T.cpu.map((c) => '<div class="card">' + img(c) + '</div>').join('') : '<span class="side">Il banco aspetta</span>';
    $('oppSide').innerHTML = T.cpu.length ? 'Banco <span class="tot">' + fmt(total(T.cpu)) + '</span>' : 'Banco';
    $('deckBox').innerHTML = back() + '<span class="side">Mano <strong>' + T.round + '</strong></span>';
    $('youSide').innerHTML = 'Tu <span class="tot">' + fmt(total(T.you)) + '</span>';
    $('table').style.setProperty('--n', T.you.length);
    $('table').innerHTML = T.you.map((c) => '<div class="card big">' + img(c) + '</div>').join('') + (T.you.some(isMatta) ? '<div class="lab">Il Re di Campagna è la matta: vale quello che ti conviene.</div>' : '') + (T.peekNow && T.phase === 'you' && T.deck.length ? '<div class="lab"><span class="bonusTag">Occhio di Bergo:</span> la prossima carta è ' + cname(T.deck[0]) + '.</div>' : '');
    $('hand').innerHTML = '';
    let bar = '<div class="msg" style="width:100%">' + T.msg + '</div>';
    if (T.phase === 'you') bar += '<button class="btn take" data-act="hit">Carta</button><button class="btn" data-act="stay">Sto</button>';
    if (T.phase === 'done' && !T.over && !PAUSE.on) bar += '<button class="btn" data-act="next">Prossima mano</button>';
    $('bar').innerHTML = bar;
    idle(T.phase === 'you' && !T.over);
    void showCpu;
  }
  return { start };
})();
