/* ================= IL NOME DEL GIOCATORE: lo chiede il Signor ’Nduja, ed è unico ================= */
const NICK_BAD = ['cazz', 'stronz', 'merd', 'puttan', 'vaffanc', 'fanculo', 'coglion', 'minchi', 'porcodio', 'diocan', 'zoccol', 'ricchion', 'bastard', 'froci', 'negr'];
const nickClean = (n) => String(n || '').trim().replace(/\s+/g, ' ');
const nickKey = (n) => nickClean(n).toLowerCase();
function nickCheck(n) {
  n = nickClean(n);
  if (n.length < 3) return 'Almeno 3 lettere, compà!';
  if (n.length > 16) return 'Massimo 16 caratteri.';
  if (!/^[\p{L}\p{N} _.'-]+$/u.test(n)) return 'Usa solo lettere, numeri, spazi e . _ - \'';
  if (!/[\p{L}\p{N}]/u.test(n) || /^__.*__$/.test(n)) return 'Mettici almeno una lettera.';
  const k = nickKey(n).replace(/[^a-z]/g, '');
  if (NICK_BAD.some((w) => k.includes(w))) return 'Chistu nomi nun si po’ diri! Scegline n’atru.';
  if (/^(giocatore|computer|cpu|admin|moderatore|signor ?.?nduja|nduja|bergo|pacciu.*)$/i.test(n)) return 'Questo nome è riservato.';
  return '';
}
/* prenota il nome sul server: 'ok', 'taken', 'offline' oppure 'local' (anteprima senza server) */
async function nickReserve(n) {
  n = nickClean(n); const key = nickKey(n);
  if (!window.FB || typeof ONLINE_OK !== 'function' || !ONLINE_OK()) return 'local';
  if (!OL.ready) { try { await withTimeout(Promise.resolve(olInit()), 8000); } catch (e) { /* niente */ } }
  if (!OL.ready || !OL.uid) return 'offline';
  const ref = FB.doc(OL.db, 'names', key);
  try {
    const r = await withTimeout(FB.runTransaction(OL.db, async (tx) => {
      const s = await tx.get(ref);
      if (s.exists() && s.data().uid !== OL.uid) return 'taken';
      if (!s.exists()) tx.set(ref, { uid: OL.uid, display: n, at: FB.serverTimestamp() });
      return 'ok';
    }), 10000);
    if (r === 'ok' && P.nickKey && P.nickKey !== key) FB.deleteDoc(FB.doc(OL.db, 'names', P.nickKey)).catch(() => {});
    return r;
  } catch (e) { return /permission/i.test((e && e.code) || '') ? 'taken' : 'offline'; }
}
function nickApply(n, r) {
  n = nickClean(n); P.nickAuto = false;
  P.nick = n; P.nickKey = nickKey(n); P.nickOk = r === 'ok' || r === 'local'; P.nickPending = r === 'offline';
  save();
  if (typeof renderHome === 'function' && view === 'vHome') renderHome();
  if (view === 'vProfile' && typeof renderProfile === 'function') renderProfile();
  if (OL.ready && typeof olSaveProfile === 'function') olSaveProfile();
}
function nickSuggest(n) {
  const b = nickClean(n).slice(0, 12), out = new Set();
  const extra = ['CZ', 'RC', 'KR', 'VV', 'CS', 'Calabro', 'u Grandi', 'da Sila'];
  while (out.size < 3) { const x = Math.random() < 0.5 ? b + ' ' + (10 + Math.floor(Math.random() * 89)) : b + ' ' + extra[Math.floor(Math.random() * extra.length)]; if (x.length <= 16) out.add(x); else out.add(b.slice(0, 11) + ' ' + (10 + Math.floor(Math.random() * 89))); }
  return [...out];
}
let NICK_OPEN = false;
function nickWindow(opts, done) {
  NICK_OPEN = true;
  overlay('<div class="nickwin"><div class="nicknd">' + NDUJA_SVG + '</div><div class="nickbub"><b>Signor ’Nduja</b><span id="nickSay">' + tr(opts.msg || 'Sugnu u Signor ’Nduja. Prima di giocare, dimmi: comu ti chiami?') + '</span></div></div>' +
    '<form id="nickF" class="nickform" novalidate><label for="nickNew">Il tuo nome nel gioco</label><input id="nickNew" maxlength="16" autocomplete="off" autocapitalize="words" spellcheck="false" placeholder="Es. U Zampugnaru" value="' + esc(opts.value || '') + '">' +
    '<small>Lo vedranno gli altri giocatori online e nelle classifiche: deve essere solo tuo.</small><p class="nickerr" id="nickErr" role="alert"></p><div class="nicksug" id="nickSug"></div>' +
    '<button class="btn take" type="submit" id="nickGo">' + tr('Chistu è u nomi meu!') + '</button></form>' + (opts.cancel ? '<button class="btn alt" id="nickNo">Annulla</button>' : ''));
  const inp = $('nickNew');
  setTimeout(() => { try { inp.focus(); } catch (e) { /* niente */ } }, 80);
  const say = (t) => { $('nickSay').textContent = t; };
  if ($('nickNo')) $('nickNo').onclick = () => { NICK_OPEN = false; $('layer').innerHTML = ''; };
  inp.oninput = () => { $('nickErr').textContent = ''; };
  $('nickSug').onclick = (e) => { const b = e.target.closest('[data-sug]'); if (b) { inp.value = b.dataset.sug; $('nickErr').textContent = ''; inp.focus(); } };
  $('nickF').onsubmit = async (e) => {
    e.preventDefault();
    const v = nickClean(inp.value), err = nickCheck(v);
    $('nickSug').innerHTML = '';
    if (err) { $('nickErr').textContent = tr(err); return; }
    if (P.nickOk && nickKey(v) === P.nickKey) { NICK_OPEN = false; $('layer').innerHTML = ''; if (done) done(); return; }
    const go = $('nickGo'); go.disabled = true; go.textContent = 'Controllo che sia libero…';
    const r = await nickReserve(v);
    if (!$('nickGo')) return;
    go.disabled = false; go.textContent = tr('Chistu è u nomi meu!');
    if (r === 'taken') {
      $('nickErr').textContent = '“' + v + '” è già di un altro giocatore.';
      say(tr('Chistu nomi è già pigghiatu! Provane n’atru, o pigghia unu di chisti:'));
      $('nickSug').innerHTML = nickSuggest(v).map((s) => '<button type="button" class="chipbtn" data-sug="' + esc(s) + '">' + esc(s) + '</button>').join('');
      fx('sad'); return;
    }
    nickApply(v, r);
    NICK_OPEN = false; $('layer').innerHTML = '';
    flash(r === 'offline' ? 'Piacere, ' + v + '! Lo controllo appena sei online.' : 'Piacere, ' + v + '!');
    fx('take');
    if (done) done();
  };
}
/* alla prima apertura: ritorna true se ha aperto la finestra (e poi chiama cb) */
function nickFirst(cb) {
  if (P.nick && (P.nickOk || P.nickPending || P.nickKey === undefined)) return false;
  nickWindow({}, cb);
  return true;
}
function nickChange(v) {
  v = nickClean(v);
  if (nickKey(v) === P.nickKey && P.nickOk) { flash('È già il tuo nome'); return; }
  nickWindow({ value: v, cancel: true, msg: 'Vuoi cambiare nome? Scrivi chiddu novu e controllo che nun l’havi nuddu.' });
}
/* controllo in sottofondo: i nomi scelti offline (o dei vecchi giocatori) vengono prenotati appena c'è internet */
let nickBusy = false;
setInterval(async () => {
  if (nickBusy || NICK_OPEN || !P.nick || P.nickOk || !window.FB || typeof ONLINE_OK !== 'function' || !ONLINE_OK() || !OL.ready) return;
  nickBusy = true;
  const r = await nickReserve(P.nick);
  nickBusy = false;
  if (r === 'ok') { P.nickOk = true; P.nickPending = false; P.nickKey = nickKey(P.nick); save(); }
  else if (r === 'taken' && P.nickAuto) { autoNick(true); }
  else if (r === 'taken' && !$('layer').innerHTML && view !== 'vGame') {
    P.nickPending = false; save();
    nickWindow({ msg: tr2('Mentre eri lontanu, qualcunu s’ha pigghiatu “' + P.nick + '”. Scegline n’atru, compà!', 'Mentre eri via, qualcuno ha preso “' + P.nick + '”. Scegline un altro!') });
  }
}, 6000);

/* chi non ha scelto un nome non si chiama più solo "Giocatore": riceve un numero tutto suo */
function autoNick(force) {
  if (P.nick && !force) return;
  P.nick = 'Giocatore ' + (1000 + Math.floor(Math.random() * 9000));
  P.nickAuto = true; P.nickKey = nickKey(P.nick); P.nickOk = false; P.nickPending = true;
  save();
  if (typeof renderHome === 'function' && view === 'vHome') { try { renderHome(); } catch (e) { /* niente */ } }
}
try { if (P.nickAsked || P.langAsked) autoNick(); } catch (e) { /* niente */ }
