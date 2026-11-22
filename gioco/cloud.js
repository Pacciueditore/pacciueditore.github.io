/* ================= ACCOUNT GOOGLE, SALVATAGGIO NEL CLOUD, STATISTICHE ================= */
const NATIVE = () => !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
/* gioco online: nell'app Android e nella versione web per iPhone (SC_WEB) */
const ONLINE_OK = () => NATIVE() || !!window.SC_WEB;
const CAPP = (n) => (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins[n]) || null;
const ACCT = { busy: false, savedAt: 0, timer: null, err: '' };
const isGoogle = () => !!(OL.user && OL.user.providerData && OL.user.providerData.some((x) => x.providerId === 'google.com'));

/* --- statistiche (Google Analytics per Firebase, solo nell'app) --- */
function track(name, params) {
  const A = CAPP('FirebaseAnalytics'); if (!A) return;
  try { A.logEvent({ name, params: params || {} }).catch(() => {}); } catch (e) { /* niente */ }
}
function trackScreen(v) {
  const A = CAPP('FirebaseAnalytics'); if (!A) return;
  const names = { vHome: 'menu', vGame: 'partita', vPaese: 'paese', vChests: 'bauli', vConq: 'conquista', vClan: 'clan', vShop: 'negozio', vMazzo: 'guida_mazzo', vOnline: 'online', vProfile: 'profilo', vBadges: 'badge', vRank: 'classifica', vLegal: 'note_legali' };
  try { A.setCurrentScreen({ screenName: names[v] || v }).catch(() => {}); } catch (e) { /* niente */ }
}

/* --- salvataggio nel cloud --- */
function cloudPayload() { const c = JSON.parse(JSON.stringify(P)); return { data: JSON.stringify(c), xp: P.xp, lv: levelOf(P.xp), at: FB.serverTimestamp(), v: 1 }; }
async function cloudUpload() {
  if (!OL.ready || !isGoogle() || ACCT.deleting) return;
  try { await FB.setDoc(FB.doc(OL.db, 'saves', OL.uid), cloudPayload()); ACCT.savedAt = Date.now(); ACCT.err = ''; }
  catch (e) { ACCT.err = 'Salvataggio non riuscito. ' + olErrText(e); }
  if (view === 'vProfile') renderAccount();
}
function cloudSoon() { if (!isGoogle()) return; clearTimeout(ACCT.timer); ACCT.timer = setTimeout(cloudUpload, 20000); }
async function cloudDownload() {
  const snap = await FB.getDoc(FB.doc(OL.db, 'saves', OL.uid));
  return snap.exists() ? snap.data() : null;
}
function applyCloud(c) {
  try {
    const d = JSON.parse(c.data);
    Object.keys(P).forEach((k) => delete P[k]);
    Object.assign(P, defaultProfile(), d);
    save(); flash('Progressi recuperati!');
    go('vHome');
  } catch (e) { flash('Salvataggio non valido'); }
}
async function acctAfterLogin() {
  let c = null;
  try { c = await cloudDownload(); } catch (e) { /* nessun salvataggio */ }
  if (c && c.data && (c.xp || 0) !== P.xp) {
    overlay('<h2>Progressi trovati</h2><p>Sul tuo account c’è un salvataggio al <b>livello ' + c.lv + '</b>. Su questo telefono sei al <b>livello ' + levelOf(P.xp) + '</b>.</p><p>Quale vuoi tenere?</p>' +
      '<button class="btn" id="clUse">Usa quello del cloud (liv. ' + c.lv + ')</button><button class="btn alt" id="clKeep">Tieni questo telefono (liv. ' + levelOf(P.xp) + ')</button>');
    $('clUse').onclick = () => { $('layer').innerHTML = ''; applyCloud(c); };
    $('clKeep').onclick = () => { $('layer').innerHTML = ''; cloudUpload(); };
  } else await cloudUpload();
  renderAccount();
}
async function googleLogin() {
  const FA = CAPP('FirebaseAuthentication');
  if (!FA) { flash('Funziona nell’app per Android'); return; }
  ACCT.busy = true; ACCT.err = ''; renderAccount();
  try {
    if (!OL.ready) await olInit();
    if (!OL.ready) throw { code: 'offline' };
    const r = await FA.signInWithGoogle();
    const tok = r && r.credential && r.credential.idToken;
    if (!tok) throw { code: 'annullato' };
    const cred = FB.GoogleAuthProvider.credential(tok);
    try { await FB.linkWithCredential(OL.auth.currentUser, cred); }
    catch (e) {
      if (e && /credential-already-in-use|email-already-in-use|provider-already-linked/.test(e.code || '')) await FB.signInWithCredential(OL.auth, cred);
      else throw e;
    }
    await OL.auth.currentUser.reload().catch(() => {});
    OL.user = OL.auth.currentUser; OL.uid = OL.user.uid;
    track('login', { method: 'google' });
    flash('Benvenuto, ' + ((OL.user.displayName || '').split(' ')[0] || 'amico') + '!');
    await acctAfterLogin();
  } catch (e) {
    const c = (e && (e.code || e.message)) || '';
    ACCT.err = /annull|cancel/i.test(c) ? '' : /offline|network/.test(c) ? 'Nessuna connessione a internet.' : 'Accesso con Google non riuscito. Riprova tra poco.';
  }
  ACCT.busy = false; renderAccount();
}
async function googleLogout() {
  const FA = CAPP('FirebaseAuthentication');
  await cloudUpload();
  try { if (FA) await FA.signOut(); } catch (e) { /* niente */ }
  try { await FB.signOut(OL.auth); } catch (e) { /* niente */ }
  OL.user = null; flash('Sei uscito dall’account');
  renderAccount();
}
function acctOnUser() { if (view === 'vProfile') renderAccount(); }
function renderAccount() {
  const box = $('acctBox'); if (!box) return;
  if (!NATIVE() || !window.FB) { box.innerHTML = '<div class="pgcard"><div class="pghead"><span class="pglogo glogo" aria-hidden="true">G</span><div><b>Account Google</b><small>Disponibile nell’app per Android</small></div></div><p>Nell’app puoi accedere con Google per salvare i progressi nel cloud e ritrovarli su un altro telefono.</p></div>'; return; }
  const g = isGoogle(), u = OL.user;
  let h = '<div class="pgcard"><div class="pghead"><span class="pglogo glogo" aria-hidden="true">G</span><div><b>Account Google</b><small>' + (g ? esc(u.displayName || u.email || 'Collegato') + (u.email && u.displayName ? ' · ' + esc(u.email) : '') : 'Non collegato') + '</small></div></div>';
  if (ACCT.busy) h += '<p>Collegamento in corso…</p>';
  else if (!g) h += '<p>Accedi per <b>salvare i progressi nel cloud</b>: livello, carte, Paese, pecore e conquiste. Se cambi telefono li ritrovi tutti.</p><button class="btn" id="acIn">Accedi con Google</button>';
  else h += '<p>I progressi si salvano da soli nel cloud.' + (ACCT.savedAt ? ' Ultimo salvataggio alle ' + new Date(ACCT.savedAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) + '.' : '') + '</p><div class="pgbtns"><button class="btn small" id="acSave">Salva ora</button><button class="btn ghost small" id="acOut">Esci dall’account</button></div><button class="aclink" id="acDel">Elimina account e dati dal cloud</button>';
  if (ACCT.err) h += '<p class="pgnote" style="color:var(--red)">' + esc(ACCT.err) + '</p>';
  box.innerHTML = h + '</div>';
  if ($('acIn')) $('acIn').onclick = googleLogin;
  if ($('acSave')) $('acSave').onclick = async () => { await cloudUpload(); flash('Salvato!'); };
  if ($('acOut')) $('acOut').onclick = googleLogout;
  if ($('acDel')) $('acDel').onclick = askDeleteAccount;
}
function askDeleteAccount() {
  overlay('<h2>Eliminare l’account?</h2><p>Cancelliamo dal cloud il salvataggio dei tuoi progressi, il tuo nome nella classifica online e il collegamento con il tuo account Google.</p><p>I progressi che hai su <b>questo telefono</b> restano: se vuoi cancellare anche quelli, disinstalla l’app o svuota i suoi dati dalle impostazioni.</p><p class="pgnote">Non si può annullare.</p><button class="btn" id="delYes" style="background:#C0392B;color:#fff">Sì, elimina tutto</button><button class="btn alt" id="delNo">Annulla</button>');
  $('delNo').onclick = () => { $('layer').innerHTML = ''; };
  $('delYes').onclick = async () => { $('delYes').disabled = true; $('delYes').textContent = 'Elimino…'; await deleteAccount(); };
}
async function deleteAccount() {
  const FA = CAPP('FirebaseAuthentication'), u = OL.auth && OL.auth.currentUser;
  if (!u) { $('layer').innerHTML = ''; return; }
  const uid = u.uid;
  try {
    clearTimeout(ACCT.timer); ACCT.deleting = true;
    if (P.clan && typeof clanLeave === 'function') { try { await clanLeave(); } catch (e) { /* niente */ } }
    await FB.deleteDoc(FB.doc(OL.db, 'saves', uid)).catch(() => {});
    await FB.deleteDoc(FB.doc(OL.db, 'players', uid)).catch(() => {});
    if (P.nickKey) await FB.deleteDoc(FB.doc(OL.db, 'names', P.nickKey)).catch(() => {});
    P.nickOk = false; P.nickPending = false; save();
    try { await FB.deleteUser(u); }
    catch (e) {
      if (!/requires-recent-login/.test((e && e.code) || '') || !FA) throw e;
      const r = await FA.signInWithGoogle();
      const tok = r && r.credential && r.credential.idToken; if (!tok) throw { code: 'annullato' };
      await FB.reauthenticateWithCredential(u, FB.GoogleAuthProvider.credential(tok));
      await FB.deleteUser(u);
    }
    try { if (FA) await FA.signOut(); } catch (e) { /* niente */ }
    OL.user = null; OL.ready = false; OL.uid = null;
    track('account_deleted', {});
    $('layer').innerHTML = '';
    overlay('<h2>Account eliminato</h2><p>I tuoi dati nel cloud sono stati cancellati.</p><button class="btn" id="delOk">Va bene</button>');
    $('delOk').onclick = () => { $('layer').innerHTML = ''; };
    setTimeout(() => { olInit(); }, 800);
  } catch (e) {
    $('layer').innerHTML = '';
    ACCT.err = 'Non sono riuscito a eliminare l’account. Riprova, oppure scrivici dalla pagina Note legali.';
  }
  ACCT.deleting = false; renderAccount();
}
/* agganci: salvataggio, schermate, partite */
(() => {
  const oldSave = save;
  save = function () { oldSave(); cloudSoon(); };
  const oldGo = go;
  go = function (v) { oldGo(v); trackScreen(v); if (v === 'vProfile') renderAccount(); };
  const oldStart = startGame;
  startGame = function (kind) { track('game_start', { game: kind, online: window.CONQ_FIGHT ? 'conquista' : window.CLAN_FIGHT ? 'clan' : 'no' }); return oldStart(kind); };
  const oldAward = award;
  award = function (game, won) { const before = levelOf(P.xp); const r = oldAward.apply(this, arguments); track('game_end', { game, won: won ? 1 : 0 }); const after = levelOf(P.xp); if (after > before) track('level_up', { level: after }); return r; };
  document.addEventListener('visibilitychange', () => { if (document.hidden && isGoogle()) cloudUpload(); });
  if (ONLINE_OK() && window.FB) setTimeout(() => { olInit(); track('app_open', { level: levelOf(P.xp) }); }, 1500);
})();
