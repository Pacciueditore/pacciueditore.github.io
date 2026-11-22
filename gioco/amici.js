/* ================= AMICI: richieste di amicizia, chi è online, sfide dirette =================
   friends/{uidA_uidB}: users [a, b] (in ordine), from, to, names{uid: nome}, avs{uid: icona}, status (pending|ok), at
   chal/{to_from}: to, from, n, av, game, rid, at — la sfida a un amico (stanza online privata)
   "Online" = il profilo in players/ è stato aggiornato negli ultimi 3 minuti */
const FR = { list: [], unsub: null, chalUnsub: null, pres: {}, presAt: 0, err: '', busy: false, chals: [], seenChal: {}, wait: null, game: 'scopa' };
const FR_GAMES = { scopa: 'Scopa', briscola: 'Briscola', tressette: 'Tressette', sette: 'Sette e mezzo', morra: 'Morra', calcio: 'U Palluni', casa: 'A Casa da Figghia' };
const frGL = (g) => (g === 'calcio' ? 'U Palluni' : g === 'casa' ? 'A Casa da Figghia' : (FR_GAMES[g] || 'carte').toLowerCase());
const FR_GICON = { scopa: '🃏', briscola: '🂡', tressette: '♣️', sette: '7½', morra: '✊', calcio: '⚽', casa: '🏠' };
const FR_ONLINE_MS = 3 * 60000, FR_CHAL_MS = 2 * 60000;
const frT = (t) => (typeof t === 'number' ? t : tms(t));
const frOn = () => !!(window.FB && typeof ONLINE_OK === 'function' && ONLINE_OK());
const frPid = (a, b) => [a, b].sort().join('_');
const frOther = (f) => (f.users[0] === OL.uid ? f.users[1] : f.users[0]);
const frName = (f, u) => (FR.pres[u] && FR.pres[u].name) || (f.names || {})[u] || 'Amico';
const frAv = (f, u) => (FR.pres[u] && FR.pres[u].av) || (f.avs || {})[u] || 'mare';
const frIsOnline = (u) => { const p = FR.pres[u]; return !!(p && p.at && Date.now() - frT(p.at) < FR_ONLINE_MS); };
function frSeen(u) {
  const p = FR.pres[u]; if (!p || !p.at) return 'non ancora visto';
  const m = (Date.now() - frT(p.at)) / 60000;
  if (m < 3) return 'online ora';
  if (m < 60) return 'visto ' + Math.round(m) + ' min fa';
  if (m < 1440) return 'visto ' + Math.round(m / 60) + (Math.round(m / 60) === 1 ? ' ora fa' : ' ore fa');
  return 'visto ' + Math.round(m / 1440) + (Math.round(m / 1440) === 1 ? ' giorno fa' : ' giorni fa');
}
const frOk = () => FR.list.filter((f) => f.status === 'ok');
const frIn = () => FR.list.filter((f) => f.status === 'pending' && f.to === OL.uid);
const frOut = () => FR.list.filter((f) => f.status === 'pending' && f.from === OL.uid);
async function frReady() {
  if (!frOn()) return false;
  if (!OL.ready) { try { await withTimeout(Promise.resolve(olInit()), 10000); } catch (e) { /* niente */ } }
  return !!OL.ready;
}

/* ---------- ascolto: lista amici e sfide ricevute ---------- */
function frStart() {
  if (!OL.ready || FR.unsub) return;
  FR.unsub = FB.onSnapshot(FB.query(FB.collection(OL.db, 'friends'), FB.where('users', 'array-contains', OL.uid)), (s) => {
    FR.list = s.docs.map((d) => Object.assign({ id: d.id }, d.data()));
    frPresence(true);
    frRefresh();
  }, () => { FR.unsub = null; });
  FR.chalUnsub = FB.onSnapshot(FB.query(FB.collection(OL.db, 'chal'), FB.where('to', '==', OL.uid)), (s) => {
    FR.chals = s.docs.map((d) => Object.assign({ id: d.id }, d.data())).filter((c) => Date.now() - frT(c.at) < FR_CHAL_MS);
    frChalShow();
  }, () => { FR.chalUnsub = null; });
}
async function frPresence(force) {
  const ids = frOk().map(frOther);
  frWatch(ids);
  if (!ids.length || (!force && Date.now() - FR.presAt < 45000)) return;
  FR.presAt = Date.now();
  await Promise.all(ids.filter((u) => !FR.presLive || !FR.presLive[u]).map(async (u) => { try { const s = await withTimeout(FB.getDoc(FB.doc(OL.db, 'players', u)), 8000); if (s.exists()) FR.pres[u] = s.data(); } catch (e) { /* niente */ } }));
  frRefresh();
}
/* ascolto in diretta del profilo di ogni amico: quando entra nel gioco il suo profilo si aggiorna e arriva l'avviso */
function frWatch(ids) {
  FR.presUn = FR.presUn || {}; FR.presLive = FR.presLive || {};
  for (const u of Object.keys(FR.presUn)) if (!ids.includes(u)) { try { FR.presUn[u](); } catch (e) { /* niente */ } delete FR.presUn[u]; delete FR.presLive[u]; }
  for (const u of ids.slice(0, 40)) {
    if (FR.presUn[u]) continue;
    FR.presUn[u] = FB.onSnapshot(FB.doc(OL.db, 'players', u), (s) => {
      if (!s.exists()) return;
      const was = frIsOnline(u), first = !FR.presLive[u];
      FR.pres[u] = s.data(); FR.presLive[u] = true;
      if (!first && !was && frIsOnline(u)) frNotifyOnline(u);
      frRefresh();
    }, () => { delete FR.presUn[u]; delete FR.presLive[u]; });
  }
}
/* ---------- avvisi: striscia in alto nel gioco, notifica del telefono se l'app è in secondo piano ---------- */
const frNotifOn = () => P.frNotif !== false;
function frSysNotif(title, body) {
  const L = typeof LN === 'function' ? LN() : null;
  if (!L || P.notif !== true || !document.hidden) return false;
  try { L.schedule({ notifications: [{ id: 130 + Math.floor(Math.random() * 60), title, body, schedule: { at: new Date(Date.now() + 1000), allowWhileIdle: true } }] }).catch(() => {}); } catch (e) { /* niente */ }
  return true;
}
function frToast(o) {
  let box = $('frToasts');
  if (!box) { box = document.createElement('div'); box.id = 'frToasts'; box.className = 'frtoasts'; box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
  if (o.key) { const old = box.querySelector('[data-key="' + o.key + '"]'); if (old) old.remove(); }
  const el = document.createElement('div');
  el.className = 'frtoast' + (o.kind ? ' ' + o.kind : ''); if (o.key) el.dataset.key = o.key;
  el.innerHTML = '<span class="ftav"><img src="' + (AVIMG[o.av] || AVIMG.mare) + '" alt=""><i>' + (o.icon || '') + '</i></span><span class="fttx"><b>' + o.title + '</b><small>' + o.body + '</small></span><span class="ftbt">' + (o.btns || []).map((b, i) => '<button class="' + (b.cls || '') + '" data-i="' + i + '">' + b.t + '</button>').join('') + '</span><button class="ftx" aria-label="Chiudi">✕</button>';
  const close = () => { el.classList.add('out'); setTimeout(() => el.remove(), 300); };
  el.querySelector('.ftx').onclick = close;
  el.querySelectorAll('.ftbt button').forEach((b) => { b.onclick = () => { const fn = o.btns[+b.dataset.i].fn; if (fn && fn(el) === false) return; close(); }; });
  box.appendChild(el);
  while (box.children.length > 3) box.firstChild.remove();
  const ms = o.ms || 7000;
  if (ms > 0) el._t = setTimeout(close, ms);
  return el;
}
function frNotifyOnline(u) {
  if (!frNotifOn()) return;
  FR.onSeen = FR.onSeen || {};
  if (Date.now() - (FR.onSeen[u] || 0) < 20 * 60000) return; // non più di un avviso ogni 20 minuti per amico
  FR.onSeen[u] = Date.now();
  const f = FR.list.find((x) => x.id === frPid(OL.uid, u)); if (!f) return;
  const nm = frName(f, u);
  if (frSysNotif(nm + ' è online 🟢', isIt() ? 'Entra e sfidalo a una partita!' : 'Trasi e sfidalu a na partita!')) return;
  const busy = OL.rid || FR.wait;
  fx('card');
  frToast({ key: 'on-' + u, kind: 'on', av: frAv(f, u), icon: '🟢', title: esc(nm) + ' è online', body: 'Sfidalo a ' + frGL(FR.game) + '!', btns: busy ? [] : [{ t: 'Sfida', cls: 'go', fn: () => { frChallenge(u, FR.game); } }] });
}
function frRefresh() {
  if (view === 'vAmici' && !FR.wait) frRender();
  frStrip();
  const n = frIn().length, b = $('frHomeBadge');
  if (b) { b.textContent = n || ''; b.hidden = !n; }
}
/* il proprio profilo si aggiorna ogni due minuti: così gli amici ti vedono online */
setInterval(() => {
  if (!frOn()) return;
  if (OL.ready && !FR.unsub) frStart();
  if (OL.ready && !document.hidden && Date.now() - (FR.beat || 0) > 110000) { FR.beat = Date.now(); olSaveProfile(); }
  if (OL.ready && view === 'vAmici') frPresence(false);
  frChalShow();
}, 5000);
document.addEventListener('visibilitychange', () => { if (!document.hidden && OL.ready) { FR.beat = Date.now(); olSaveProfile(); frPresence(true); } });

/* ---------- richieste ---------- */
async function frAdd(nick) {
  const v = nickClean(nick), key = nickKey(v);
  FR.err = '';
  if (key.length < 3) { FR.err = 'Scrivi il nome esatto del tuo amico.'; frRender(); return; }
  if (key === P.nickKey || key === nickKey(P.nick || '')) { FR.err = 'Questo sei tu!'; frRender(); return; }
  if (FR.busy) return; FR.busy = true;
  try {
    const s = await withTimeout(FB.getDoc(FB.doc(OL.db, 'names', key)), 10000);
    if (!s.exists()) { FR.err = 'Nessun giocatore si chiama “' + v + '”. Controlla come l’ha scritto.'; }
    else {
      const u = s.data().uid, pid = frPid(OL.uid, u), old = FR.list.find((f) => f.id === pid);
      if (u === OL.uid) FR.err = 'Questo sei tu!';
      else if (old && old.status === 'ok') FR.err = 'Siete già amici.';
      else if (old && old.from === OL.uid) FR.err = 'Hai già mandato la richiesta: aspetta che accetti.';
      else if (old) { await frAccept(old); FR.busy = false; return; }
      else {
        await withTimeout(FB.setDoc(FB.doc(OL.db, 'friends', pid), { users: [OL.uid, u].sort(), from: OL.uid, to: u, names: { [OL.uid]: myName(), [u]: s.data().display || v }, avs: { [OL.uid]: P.av || 'mare' }, status: 'pending', at: FB.serverTimestamp() }), 10000);
        flash('Richiesta mandata!'); fx('take');
        if ($('frNick')) $('frNick').value = '';
        if (typeof track === 'function') track('friend_request', {});
      }
    }
  } catch (e) { FR.err = olErrText(e); }
  FR.busy = false; frRender();
}
async function frAccept(f) {
  try { await withTimeout(FB.updateDoc(FB.doc(OL.db, 'friends', f.id), { status: 'ok', ['names.' + OL.uid]: myName(), ['avs.' + OL.uid]: P.av || 'mare' }), 10000); flash('Ora siete amici!'); fx('big'); }
  catch (e) { flash('Non riesco, riprova'); }
}
async function frDelete(f) { try { await withTimeout(FB.deleteDoc(FB.doc(OL.db, 'friends', f.id)), 10000); } catch (e) { flash('Non riesco, riprova'); } }

/* ---------- sfide ---------- */
async function frChallenge(u, game) {
  if (FR.wait) return;
  const f = FR.list.find((x) => x.id === frPid(OL.uid, u)); if (!f || f.status !== 'ok') return;
  let rid;
  try {
    const ref = FB.doc(FB.collection(OL.db, 'rooms'));
    await withTimeout(FB.setDoc(ref, { game, public: false, code: genCode(), friend: true, status: 'waiting', players: [OL.uid, ''], names: [myName(), ''], avs: [P.av, ''], lvs: [levelOf(P.xp), 0], towns: [myTown(), ''], createdAt: FB.serverTimestamp(), ping: FB.serverTimestamp(), v: 0 }), 15000);
    rid = ref.id;
    await withTimeout(FB.setDoc(FB.doc(OL.db, 'chal', u + '_' + OL.uid), { to: u, from: OL.uid, n: myName(), av: P.av || 'mare', game, rid, at: FB.serverTimestamp() }), 15000);
  } catch (e) { flash('Non riesco a mandare la sfida'); return; }
  if (typeof track === 'function') track('friend_challenge', { game });
  const roomRef = FB.doc(OL.db, 'rooms', rid), chalRef = FB.doc(OL.db, 'chal', u + '_' + OL.uid);
  const W = FR.wait = { rid };
  const stop = (enter, r) => {
    clearInterval(W.ping); clearTimeout(W.to); if (W.un) W.un(); FR.wait = null;
    if (!enter) { FB.deleteDoc(chalRef).catch(() => {}); FB.deleteDoc(roomRef).catch(() => {}); }
    $('layer').innerHTML = '';
    if (enter) enterRoom(rid, r.game); else frRender();
  };
  overlay('<div class="ftwait"><div class="spinner"></div><h2>Sfida mandata!</h2><p>Aspetto che <b>' + esc(frName(f, u)) + '</b> accetti la sfida a ' + frGL(game) + '…</p><button class="btn alt" id="frWaitNo">Annulla la sfida</button></div>');
  W.ping = setInterval(() => FB.updateDoc(roomRef, { ping: FB.serverTimestamp() }).catch(() => {}), 15000);
  W.un = FB.onSnapshot(roomRef, (s) => { const r = s.data(); if (r && r.status === 'playing') { FB.deleteDoc(chalRef).catch(() => {}); stop(true, r); } }, () => {});
  W.to = setTimeout(() => { if (FR.wait === W) { stop(false); flash('Non ha risposto: riprova più tardi'); } }, FR_CHAL_MS);
  $('frWaitNo').onclick = () => stop(false);
}
/* una sfida ricevuta: se sei libero si apre la finestra; se stai giocando arriva una striscia in alto;
   se l'app è in secondo piano arriva la notifica del telefono */
function frChalShow() {
  FR.toasted = FR.toasted || {}; FR.sysNot = FR.sysNot || {};
  for (const x of FR.chals) {
    const k = x.id + (x.rid || '');
    if (FR.seenChal[k] || Date.now() - frT(x.at) >= FR_CHAL_MS) continue;
    if (document.hidden) { if (!FR.sysNot[k]) { FR.sysNot[k] = 1; frSysNotif((x.n || 'Un amico') + ' ti sfida! ⚔️', 'Una partita a ' + frGL(x.game) + ', adesso. Hai 2 minuti per accettare.'); } continue; }
    const inOnline = !!(OL.rid && OL.room && OL.room.status === 'playing');
    const busy = $('layer').innerHTML || (typeof ND !== 'undefined' && ND.open) || OL.rid || FR.wait || (G && !G.over && view === 'vGame') || $('bgLayer') || (typeof czBusy === 'function' && czBusy()) || (typeof caBusy === 'function' && caBusy());
    if (!busy) { frChalPopup(x); return; }
    if (FR.toasted[k]) continue;
    FR.toasted[k] = 1;
    fx('big');
    const left = Math.max(10, Math.round((FR_CHAL_MS - (Date.now() - frT(x.at))) / 1000));
    frToast({ key: 'ch-' + x.id, kind: 'chal', av: x.av, icon: '⚔️', ms: left * 1000, title: esc(x.n || 'Un amico') + ' ti sfida!', body: 'A ' + frGL(x.game) + (inOnline ? ' · finisci la partita e poi accetta' : ''),
      btns: [{ t: 'Accetta', cls: 'go', fn: (el) => {
        if (OL.rid && OL.room && OL.room.status === 'playing') { flash('Finisci prima questa partita'); return false; }
        if (OL.rid) { $('layer').innerHTML = ''; olLeave(); }
        $('layer').innerHTML = ''; if (typeof ND !== 'undefined' && ND.open) closeNduja();
        clearTimeout(timer); G = null; if (typeof CZ !== 'undefined' && CZ.m && !CZ.m.online) { cancelAnimationFrame(CZ.raf); CZ.m = null; CZ.screen = 'menu'; } if (typeof CA !== 'undefined' && CA.m && !CA.m.online) { cancelAnimationFrame(CA.raf); CA.m = null; CA.screen = 'menu'; } frChalAccept(x);
      } }, { t: 'No', cls: 'no', fn: () => { FR.seenChal[k] = 1; FB.deleteDoc(FB.doc(OL.db, 'chal', x.id)).catch(() => {}); } }] });
  }
}
function frChalPopup(c) {
  FR.seenChal[c.id + (c.rid || '')] = 1;
  const tb = $('frToasts') && $('frToasts').querySelector('[data-key="ch-' + c.id + '"]'); if (tb) tb.remove();
  fx('big');
  overlay('<div class="frchal"><div class="frchav"><img src="' + (AVIMG[c.av] || AVIMG.mare) + '" alt=""><span>' + (FR_GICON[c.game] || '⚔️') + '</span></div><small class="frchk">Sfida da un amico</small><h2>' + esc(c.n || 'Un amico') + ' ti sfida!</h2><p>Una partita a <b>' + frGL(c.game) + '</b>, adesso. Accetti?</p><div class="frchtime"><i id="frchBar"></i></div><button class="btn take" id="frcYes">Accetto la sfida</button><button class="btn alt" id="frcNo">Non ora</button></div>');
  const ref = FB.doc(OL.db, 'chal', c.id);
  const bar = () => { const b = $('frchBar'); if (!b) return; const left = FR_CHAL_MS - (Date.now() - frT(c.at)); b.style.width = Math.max(0, left / FR_CHAL_MS * 100) + '%'; if (left <= 0) { $('layer').innerHTML = ''; flash('La sfida è scaduta'); return; } setTimeout(bar, 500); };
  bar();
  $('frcNo').onclick = () => { $('layer').innerHTML = ''; FB.deleteDoc(ref).catch(() => {}); };
  $('frcYes').onclick = () => { $('layer').innerHTML = ''; frChalAccept(c); };
}
async function frChalAccept(c) {
  FR.seenChal[c.id + (c.rid || '')] = 1;
  FB.deleteDoc(FB.doc(OL.db, 'chal', c.id)).catch(() => {});
  try { const ok = await joinRoom(c.rid); if (!ok) flash('La sfida non è più valida'); } catch (e) { flash('Non riesco a entrare, riprova'); }
}

/* ---------- schermata ---------- */
async function frRender() {
  const box = $('amiciBox'); if (!box) return;
  if (!frOn()) { box.innerHTML = '<div class="pzempty"><span>👥</span><p>Gli amici funzionano nell’app per Android, con internet.</p></div>'; return; }
  if (!OL.ready) { box.innerHTML = '<div class="clanempty"><div class="spinner"></div><p>Mi collego…</p></div>'; if (await frReady()) { frStart(); frRender(); } else box.innerHTML = '<div class="clanempty"><p>' + esc(OL.err || 'Non riesco a collegarmi.') + '</p><button class="btn" data-frretry="1">Riprova</button></div>'; return; }
  frStart();
  const ok = frOk().map((f) => ({ f, u: frOther(f) })).sort((a, b) => (frIsOnline(b.u) - frIsOnline(a.u)) || ((FR.pres[b.u] ? frT(FR.pres[b.u].at) : 0) - (FR.pres[a.u] ? frT(FR.pres[a.u].at) : 0)));
  const onl = ok.filter((x) => frIsOnline(x.u)), inc = frIn(), out = frOut();
  const av = (k) => AVIMG[k] || AVIMG.mare;
  let h = '<div class="fahero"><div class="fahbg" aria-hidden="true"></div><span class="faav on"><img src="' + av(P.av) + '" alt=""><i></i></span><div class="fame"><small>Il tuo nome da amico</small><b>' + esc(myName()) + '</b><span class="fachips"><em>👥 ' + ok.length + (ok.length === 1 ? ' amico' : ' amici') + '</em><em class="g">● ' + onl.length + ' online</em>' + (inc.length ? '<em class="y">✉ ' + inc.length + '</em>' : '') + '</span></div><button class="fashare" data-frshare="1" aria-label="Manda il tuo nome agli amici"><span>📤</span><small>Invia</small></button></div>';
  h += '<form class="faadd" id="frAddF"><span class="faic" aria-hidden="true">🔎</span><label for="frNick" hidden>Nome dell’amico</label><input id="frNick" maxlength="16" placeholder="Scrivi il nome esatto di un amico" autocomplete="off"><button type="submit"' + (FR.busy ? ' disabled' : '') + '>Aggiungi</button></form>';
  if (FR.err) h += '<p class="faerr">' + esc(FR.err) + '</p>';
  if (inc.length) h += '<div class="fasec"><h4>✉ Richieste per te</h4>' + inc.map((f) => { const u = frOther(f); return '<div class="fareq"><img src="' + av(frAv(f, u)) + '" alt=""><span class="nm"><b>' + esc(frName(f, u)) + '</b><small>vuole essere tuo amico</small></span><button class="fabtn ok" data-fracc="' + f.id + '">Accetta</button><button class="fabtn no" data-frdel="' + f.id + '" aria-label="Rifiuta">✕</button></div>'; }).join('') + '</div>';
  if (ok.length) {
    h += '<div class="fasec"><h4>Si gioca a</h4><div class="fagames">' + Object.keys(FR_GAMES).map((g) => '<button data-frg="' + g + '" aria-pressed="' + (FR.game === g) + '"><span>' + FR_GICON[g] + '</span>' + FR_GAMES[g] + '</button>').join('') + '</div></div>';
    if (onl.length) h += '<div class="fasec"><h4><i class="fapulse"></i> Online ora</h4><div class="faonl">' + onl.map(({ f, u }) => '<button class="faon" data-frch="' + u + '"><span class="faav on big"><img src="' + av(frAv(f, u)) + '" alt=""><i></i></span><b>' + esc(frName(f, u)) + '</b><span class="fasf">⚔️ Sfida</span></button>').join('') + '</div></div>';
    h += '<div class="fasec"><h4>I tuoi amici</h4><div class="falist">' + ok.map(({ f, u }) => {
      const on = frIsOnline(u), p = FR.pres[u] || {};
      return '<div class="farow' + (on ? ' on' : '') + '"><span class="faav' + (on ? ' on' : '') + '"><img src="' + av(frAv(f, u)) + '" alt=""><i></i></span><span class="nm"><b>' + esc(frName(f, u)) + '</b><small class="st">' + frSeen(u) + '</small><span class="fatags">' + (p.lv ? '<em>Liv. ' + p.lv + '</em>' : '') + (p.town ? '<em>📍 ' + esc(p.town) + '</em>' : '') + '</span></span><button class="fach' + (on ? ' hot' : '') + '" data-frch="' + u + '"' + (on ? '' : ' title="Non è online: la sfida aspetta 2 minuti"') + '><span>⚔️</span>Sfida</button><button class="fadel" data-frdel="' + f.id + '" aria-label="Togli dagli amici">⋯</button></div>';
    }).join('') + '</div></div>';
  } else h += '<div class="faempty"><div class="faemnd">' + (typeof NDUJA_SVG !== 'undefined' ? NDUJA_SVG : '') + '</div><div class="faembub"><b>Signor ’Nduja</b><span>A tavola da soli non si gioca! Scrivi qui sopra il nome di un amico, o premi “Invia” e mandagli il tuo.</span></div></div>';
  if (out.length) h += '<div class="fasec"><h4>Richieste mandate</h4>' + out.map((f) => { const u = frOther(f); return '<div class="fareq out"><img src="' + av(frAv(f, u)) + '" alt=""><span class="nm"><b>' + esc(frName(f, u)) + '</b><small>aspetto che accetti…</small></span><button class="fabtn no" data-frdel="' + f.id + '" aria-label="Annulla la richiesta">✕</button></div>'; }).join('') + '</div>';
  h += '<label class="fanot"><span>🔔</span><span><b>Avvisami</b><small>quando un amico entra nel gioco o ti sfida</small></span><input type="checkbox" id="frNotif"' + (frNotifOn() ? ' checked' : '') + '><i class="fasw" aria-hidden="true"></i></label>';
  box.innerHTML = h;
}
/* striscia degli amici nella sala online */
function frStrip() {
  const box = $('onlineBox'); if (!box || view !== 'vOnline' || !OL.ready) return;
  let s = $('frStrip');
  if (!s) { const hero = box.querySelector('.olhero'); if (!hero) return; s = document.createElement('button'); s.id = 'frStrip'; s.className = 'frstrip'; s.dataset.go = 'vAmici'; hero.after(s); }
  const ok = frOk(), on = ok.filter((f) => frIsOnline(frOther(f))), inc = frIn().length;
  const faces = (on.length ? on : ok).slice(0, 3).map((f) => '<img src="' + (AVIMG[frAv(f, frOther(f))] || AVIMG.mare) + '" alt="">').join('');
  s.innerHTML = '<span class="frsic">' + (faces || '👥') + '</span><span><b>Amici' + (on.length ? ' <i class="frsdot"></i>' : '') + '</b><small>' + (ok.length ? (on.length ? on.length + ' online ora: sfidali!' : ok.length + (ok.length === 1 ? ' amico' : ' amici') + ', nessuno online') : 'Aggiungi i tuoi amici e sfidali') + '</small></span>' + (inc ? '<i class="shbadge red">' + inc + '</i>' : '') + '<span class="advgo">▶</span>';
}
function frClick(e) {
  const t = e.target;
  if (t.closest('[data-frretry]')) { frRender(); return; }
  const a = t.closest('[data-fracc]'); if (a) { const f = FR.list.find((x) => x.id === a.dataset.fracc); if (f) frAccept(f); return; }
  const d = t.closest('[data-frdel]');
  if (d) {
    const f = FR.list.find((x) => x.id === d.dataset.frdel); if (!f) return;
    if (f.status !== 'ok') { frDelete(f); return; }
    overlay('<h2>Togliere ' + esc(frName(f, frOther(f))) + ' dagli amici?</h2><p>Potrete sempre ritornare amici con una nuova richiesta.</p><button class="btn" id="frdYes">Togli</button><button class="btn alt" id="frdNo">No</button>');
    $('frdYes').onclick = () => { $('layer').innerHTML = ''; frDelete(f); }; $('frdNo').onclick = () => { $('layer').innerHTML = ''; };
    return;
  }
  if (t.id === 'frNotif') { P.frNotif = t.checked; save(); flash(t.checked ? 'Ti avviso io!' : 'Avvisi degli amici spenti'); if (t.checked && typeof notifSet === 'function' && P.notif !== true && typeof LN === 'function' && LN()) notifSet(true); return; }
  const g = t.closest('[data-frg]'); if (g) { FR.game = g.dataset.frg; frRender(); return; }
  const c = t.closest('[data-frch]'); if (c) { frChallenge(c.dataset.frch, FR.game); return; }
  if (t.closest('[data-frshare]')) {
    const txt = 'Aggiungimi su Scopa Calabrese! Il mio nome è: ' + myName() + (typeof STORE_URL !== 'undefined' ? ' — ' + STORE_URL : '');
    const SH = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Share;
    try { if (SH && SH.share) SH.share({ title: 'Scopa Calabrese', text: txt }).catch(() => {}); else if (navigator.share) navigator.share({ text: txt }).catch(() => {}); else if (navigator.clipboard) { navigator.clipboard.writeText(txt); flash('Copiato'); } } catch (er) { /* niente */ }
  }
}
(() => {
  if (!$('vAmici')) {
    const s = document.createElement('section'); s.className = 'view'; s.id = 'vAmici'; s.hidden = true;
    s.innerHTML = '<div class="topbar"><h2>Amici</h2><span class="tbr"><button class="btn ghost small" data-go="vOnline">Online</button><button class="btn ghost small" data-go="vHome">Menu</button></span></div><div class="sheetv" id="amiciBox"></div>';
    $('vHome').parentNode.insertBefore(s, $('vHome').nextSibling);
    s.addEventListener('click', frClick);
    s.addEventListener('submit', (e) => { if (e.target.id === 'frAddF') { e.preventDefault(); frAdd($('frNick').value); } });
  }
  const oldGo = go;
  go = function (v) {
    oldGo(v);
    $('vAmici').hidden = v !== 'vAmici';
    if (v === 'vAmici') { FR.err = ''; frRender(); frPresence(true); }
  };
  const oldRO = renderOnline;
  renderOnline = async function () { const r = await oldRO.apply(this, arguments); frStrip(); return r; };
})();
