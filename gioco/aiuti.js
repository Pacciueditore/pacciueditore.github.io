/* ================= AIUTI: avvisi in home, regalo di Bergo, partita col Signor ’Nduja, inviti, volume ================= */
if (!P.firstAt) { P.firstAt = Date.now(); }
const dayKey = (t) => { const d = new Date(t || Date.now()); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

/* ---------- 1. online: se non c'è nessuno, il Signor ’Nduja propone una partita ---------- */
const BOT_WAIT = 25000;
function olBotOffer() {
  if (view !== 'vOnline' || !OL.waiting || !OL.waiting.pub) return;
  if (!OL.waiting.t) OL.waiting.t = Date.now();
  const card = document.querySelector('#onlineBox .olcard.wait');
  if (!card || card.querySelector('.olbot') || Date.now() - OL.waiting.t < BOT_WAIT) return;
  card.insertAdjacentHTML('beforeend', '<div class="olbot"><span class="olbotnd">' + NDUJA_SVG + '</span><div><b>Signor ’Nduja</b><p>' + tr2('Nun c’è nuddu pe’ mo, compà. Jocamu nui dui, intantu?', 'Per ora non c’è nessuno. Intanto giochiamo noi due?') + '</p>' +
    '<button class="btn take small" data-olbot="1">Gioca col Signor ’Nduja</button><small>Se arriva qualcuno mentre giochi, lo trovi la prossima volta. Le partite contro il computer non contano nella classifica online.</small></div></div>');
}
setInterval(olBotOffer, 1000);
document.addEventListener('click', (e) => {
  if (!e.target.closest('[data-olbot]')) return;
  let g = (OL.waiting && OL.waiting.game) || OL.game; if (g === 'scopa4') g = 'scopa';
  stopWaiting(true);
  if (typeof track === 'function') track('online_bot', { game: g });
  if (g === 'morra') go('vMorra'); else startGame(g);
});

/* ---------- 3. il regalo di ogni giorno (lo porta Bergo) ---------- */
const DAILY = [{ c: 50 }, { c: 80 }, { c: 120 }, { c: 160, en: 3 }, { c: 220 }, { c: 300 }, { c: 400, chest: true, en: 5 }];
function dailyState() {
  const D = P.daily || { last: '', s: 0 }, today = dayKey(), yest = dayKey(Date.now() - 864e5);
  if (D.last === today) return { due: false, day: D.s };
  const next = D.last === yest ? (D.s % 7) + 1 : 1;
  return { due: true, day: next, lost: D.last && D.last !== yest && D.s > 1 };
}
function dailyWindow(done) {
  const st = dailyState(); if (!st.due) { if (done) done(); return; }
  const cell = (r, i) => '<div class="dgday' + (i + 1 < st.day ? ' got' : i + 1 === st.day ? ' now' : '') + (r.chest ? ' big' : '') + '"><small>Giorno ' + (i + 1) + '</small>' + (r.chest ? '<span class="dgch">' + chestSVG('argento') + '</span>' : '<i class="ico coin"></i>') + '<b>' + r.c + '</b>' + (r.en ? '<em>+' + r.en + '⚡</em>' : '') + (i + 1 < st.day ? '<span class="dgok">✓</span>' : '') + '</div>';
  overlay('<div class="dgwin"><div class="dghead"><span class="dgbergo">' + BERGO_SVG + '</span><div class="nickbub"><b>Bergo</b><span>' + (st.lost ? tr2('Eh, ieri nun si vinutu! Ricuminciamu d’u primu jornu.', 'Ieri non sei passato! Si ricomincia dal primo giorno.') : tr2('U rigalu d’oji! Veni ogni jornu e u settimu c’è nu bauli!', 'Il regalo di oggi! Torna ogni giorno: il settimo c’è un baule!')) + '</span></div></div>' +
    '<div class="dggrid">' + DAILY.map(cell).join('') + '</div><button class="btn take" id="dgGet">Prendi il regalo</button></div>');
  $('dgGet').onclick = () => {
    const r = DAILY[st.day - 1], E = eco();
    P.daily = { last: dayKey(), s: st.day };
    E.carlini += r.c;
    let note = '+' + r.c + ' carlini';
    if (r.en && typeof energyAdd === 'function') { energyAdd(r.en); note += ' · +' + r.en + ' energia'; }
    if (r.chest) {
      if (E.chests.length < SLOTS) { E.chests.push({ id: 'c' + Date.now().toString(36), grade: 'argento', start: null, end: null, sped: false }); note += ' · un baule d’argento'; }
      else { E.carlini += 200; note += ' · +200 (bauli pieni)'; }
    }
    save(); fx('big'); flash(note); $('layer').innerHTML = '';
    if (typeof renderHome === 'function' && view === 'vHome') renderHome();
    if (typeof track === 'function') track('daily_gift', { day: st.day });
    if (typeof notifAsk === 'function') notifAsk(done); else if (done) done();
  };
}

/* ---------- 2. avvisi in home uno alla volta (prima il nome, poi il paese dopo la prima partita, poi il regalo) ---------- */
let homeQBusy = false;
function homeQueue() {
  if (homeQBusy || view !== 'vHome' || ND.open || $('layer').innerHTML || document.querySelector('.splash')) return;
  if (!P.langAsked || !P.nick || (typeof NICK_OPEN !== 'undefined' && NICK_OPEN)) return;
  if (!ndSeen('home')) return;
  const free = () => { homeQBusy = false; };
  if (!P.paeseAsked && (P.xp || 0) > 0 && typeof paeseFirst === 'function') { homeQBusy = true; paeseFirst(free); return; }
  if (dailyState().due) { homeQBusy = true; dailyWindow(free); return; }
}
setInterval(homeQueue, 1500);

/* ---------- 7. invita un amico ---------- */
const INV_REWARD = 300, INV_MAX = 20, INV_DAYS = 14;
const STORE_URL = 'https://play.google.com/store/apps/details?id=it.scopacalabrese.app';
async function invShare() {
  const txt = tr2('Jocamu a Scopa Calabrese! Scarica u jocu e quandu ti chiedi u codici invitu scrivi: ', 'Giochiamo a Scopa Calabrese! Scarica il gioco e come codice invito scrivi: ') + P.nick + ' — ' + STORE_URL;
  const SH = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Share;
  try {
    if (SH && SH.share) { await SH.share({ title: 'Scopa Calabrese', text: txt, dialogTitle: 'Invita un amico' }); return; }
    if (navigator.share) { await navigator.share({ text: txt }); return; }
  } catch (e) { return; }
  try { await navigator.clipboard.writeText(txt); flash('Messaggio copiato: incollalo dove vuoi'); } catch (e) { flash('Codice invito: ' + P.nick); }
}
async function invOnlineReady() {
  if (!(window.FB && typeof ONLINE_OK === 'function' && ONLINE_OK())) return false;
  if (!OL.ready) { try { await withTimeout(Promise.resolve(olInit()), 8000); } catch (e) { /* niente */ } }
  return !!(OL.ready && OL.uid);
}
async function invUse(code) {
  const key = nickKey(code);
  if (!key || key.length < 3) return 'Scrivi il nome di chi ti ha invitato.';
  if (key === P.nickKey) return 'Non puoi invitare te stesso!';
  if (!(await invOnlineReady())) return 'Serve la connessione a internet (e l’app sul telefono).';
  try {
    const nd = await withTimeout(FB.getDoc(FB.doc(OL.db, 'names', key)), 10000);
    if (!nd.exists()) return 'Nessun giocatore si chiama “' + code + '”.';
    if (nd.data().uid === OL.uid) return 'Non puoi invitare te stesso!';
    await withTimeout(FB.setDoc(FB.doc(OL.db, 'inviti', key, 'amici', OL.uid), { at: FB.serverTimestamp() }), 10000);
  } catch (e) { return 'Non sono riuscito a usare il codice. Riprova più tardi.'; }
  P.invBy = key; eco().carlini += INV_REWARD; save(); fx('big'); flash('+' + INV_REWARD + ' carlini dal tuo invito!');
  if (typeof track === 'function') track('invite_used', {});
  return '';
}
async function invCheck() {
  if (!P.nickKey || !P.nickOk || !(await invOnlineReady())) return;
  try {
    const snap = await withTimeout(FB.getDocs(FB.collection(OL.db, 'inviti', P.nickKey, 'amici')), 10000);
    const n = Math.min(INV_MAX, snap.size), got = P.invGot || 0;
    P.invN = snap.size;
    if (n > got) { const k = n - got; P.invGot = n; eco().carlini += k * INV_REWARD; save(); fx('big'); flash((k === 1 ? 'Un amico è arrivato' : k + ' amici sono arrivati') + ' col tuo invito: +' + k * INV_REWARD + ' carlini!'); if (typeof renderRes === 'function') renderRes(); }
    else save();
    if (view === 'vProfile' && $('invBox')) invRender();
  } catch (e) { /* riprova la prossima volta */ }
}
setTimeout(invCheck, 15000); setInterval(invCheck, 10 * MIN);
function invRender() {
  const b = $('invBox'); if (!b) return;
  const canUse = !P.invBy && Date.now() - P.firstAt < INV_DAYS * 864e5;
  b.innerHTML = '<h3>Invita i tuoi amici</h3><p>Quando un amico scarica il gioco e scrive il tuo nome come codice invito, ricevete <b>' + INV_REWARD + ' carlini a testa</b>. Vale fino a ' + INV_MAX + ' amici.</p>' +
    '<div class="invcode"><span><small>Il tuo codice</small><b>' + esc(P.nick || '—') + '</b></span><button class="btn take small" data-inv="share"' + (P.nick ? '' : ' disabled') + '>Invita</button></div>' +
    (P.invN ? '<p class="invn">Amici arrivati col tuo invito: <b>' + P.invN + '</b></p>' : '') +
    (canUse ? '<form class="field" id="invForm"><label for="invIn" hidden>Codice invito</label><input id="invIn" maxlength="16" placeholder="Codice di chi ti ha invitato" autocomplete="off"><button class="btn" type="submit">Usa</button></form><small class="inverr" id="invErr"></small>' : P.invBy ? '<p class="invn">Hai già usato un codice invito.</p>' : '');
}
(() => {
  const oldRP = renderProfile;
  renderProfile = function () {
    oldRP.apply(this, arguments);
    let b = $('invBox');
    if (!b) {
      b = document.createElement('div'); b.id = 'invBox'; b.className = 'invbox';
      const anchor = $('pzProf') || $('nickIn').parentNode; anchor.parentNode.insertBefore(b, anchor.nextSibling);
      b.addEventListener('click', (e) => { if (e.target.closest('[data-inv="share"]')) invShare(); });
      b.addEventListener('submit', async (e) => {
        e.preventDefault(); const v = $('invIn').value.trim(), btn = b.querySelector('#invForm .btn');
        btn.disabled = true; $('invErr').textContent = 'Controllo…';
        const err = await invUse(v);
        if (err) { $('invErr').textContent = err; btn.disabled = false; } else invRender();
      });
    }
    invRender();
  };
})();

/* ---------- 10. volume separato: musica, effetti e voci ---------- */
try { AUDIO.vol = Math.max(0, Math.min(1, parseFloat(localStorage.getItem('scopa-vol-fx') || '1'))); } catch (e) { AUDIO.vol = 1; }
try { MUSIC.vol = Math.max(0, Math.min(1, parseFloat(localStorage.getItem('scopa-vol-mus') || '1'))); } catch (e) { MUSIC.vol = 1; }
if (isNaN(AUDIO.vol)) AUDIO.vol = 1; if (isNaN(MUSIC.vol)) MUSIC.vol = 1;
function fxDest() {
  if (!actx._fx) { actx._fx = actx.createGain(); actx._fx.connect(actx.destination); }
  actx._fx.gain.value = AUDIO.vol;
  return actx._fx;
}
try {
  if (window.speechSynthesis) { const sp = speechSynthesis.speak.bind(speechSynthesis); speechSynthesis.speak = (u) => { try { u.volume = AUDIO.vol; } catch (e) { /* niente */ } if (AUDIO.vol > 0.02) sp(u); }; }
} catch (e) { /* niente */ }
function volSliders() {
  return '<div class="volbox"><label><span>🎵 Musica</span><input type="range" min="0" max="100" step="5" id="volMus" value="' + Math.round(MUSIC.vol * 100) + '"><b id="volMusV">' + Math.round(MUSIC.vol * 100) + '%</b></label>' +
    '<label><span>🔔 Effetti e voci</span><input type="range" min="0" max="100" step="5" id="volFx" value="' + Math.round(AUDIO.vol * 100) + '"><b id="volFxV">' + Math.round(AUDIO.vol * 100) + '%</b></label></div>';
}
document.addEventListener('input', (e) => {
  if (e.target.id === 'volMus') { MUSIC.vol = e.target.value / 100; $('volMusV').textContent = e.target.value + '%'; try { localStorage.setItem('scopa-vol-mus', String(MUSIC.vol)); } catch (er) { /* niente */ } }
  if (e.target.id === 'volFx') { AUDIO.vol = e.target.value / 100; $('volFxV').textContent = e.target.value + '%'; try { localStorage.setItem('scopa-vol-fx', String(AUDIO.vol)); } catch (er) { /* niente */ } }
});
document.addEventListener('change', (e) => { if (e.target.id === 'volFx') fx('take'); });

/* ================= AVVISO DI NUOVA VERSIONE =================
   In Firebase, nel documento config/app, il campo "latest" dice l'ultimo codice di versione uscito
   (lo stesso numero di versionCode). Se l'app installata è più vecchia, il Signor ’Nduja avvisa. */
async function updCheck() {
  if (!(window.FB && typeof NATIVE === 'function' && NATIVE())) return;
  const A = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
  if (!A || !A.getInfo) return;
  if (!OL.ready) { try { await withTimeout(Promise.resolve(olInit()), 12000); } catch (e) { /* niente */ } }
  if (!OL.ready) return;
  let cur = 0, cfg = null;
  try {
    const info = await A.getInfo(); cur = parseInt(info.build, 10) || 0;
    const s = await withTimeout(FB.getDoc(FB.doc(OL.db, 'config', 'app')), 10000);
    cfg = s.exists() ? s.data() : null;
  } catch (e) { return; }
  const latest = cfg ? parseInt(cfg.latest, 10) || 0 : 0;
  if (!cur || !latest || latest <= cur) return;
  const day = new Date().toDateString();
  if (P.updSeen === latest + '|' + day && !cfg.force) return;
  let tries = 0;
  const show = () => {
    if (view !== 'vHome' || $('layer').innerHTML || (typeof ND !== 'undefined' && ND.open)) { if (++tries < 40) setTimeout(show, 3000); return; }
    P.updSeen = latest + '|' + day; save();
    overlay('<div class="nickwin"><div class="nicknd">' + NDUJA_SVG + '</div><div class="nickbub"><b>Signor ’Nduja</b><span>' + tr2('Compà, niscìu na versioni nova i Scopa Calabrese! Aggiorna ca ci sunnu cosi novi.', 'È uscita una nuova versione di Scopa Calabrese! Aggiorna per avere le novità.') + '</span></div></div>' +
      (cfg.msg ? '<p class="updmsg">' + esc(String(cfg.msg)).slice(0, 300) + '</p>' : '') +
      '<button class="btn take" id="updGo">Aggiorna ora</button>' + (cfg.force ? '' : '<button class="btn alt" id="updNo">Più tardi</button>'));
    $('updGo').onclick = () => {
      if (typeof track === 'function') track('update_click', { from: cur, to: latest });
      try { window.location.href = 'market://details?id=it.scopacalabrese.app'; } catch (e) { try { window.open(STORE_URL, '_blank'); } catch (er) { /* niente */ } }
    };
    if ($('updNo')) $('updNo').onclick = () => { $('layer').innerHTML = ''; };
  };
  show();
}
setTimeout(() => { updCheck(); }, 7000);
