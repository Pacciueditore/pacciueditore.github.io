/* ================= NOTIFICHE: avvisi sul telefono quando c'è qualcosa di pronto ================= */
const LN = () => (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) || null;
const NOTIF_IDS = [101, 102, 103, 104, 105, 106, 107];
function notifPlan() {
  const now = Date.now(), out = [], E = eco();
  const add = (id, at, title, body) => { if (at && at > now + 60000 && at < now + 3 * 864e5) out.push({ id, title, body, schedule: { at: new Date(at), allowWhileIdle: true } }); };
  const it = isIt();
  // regalo di domani
  const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(12, 30, 0, 0);
  add(101, d.getTime(), 'Il regalo di Bergo', it ? 'Il regalo di oggi ti aspetta: non perdere la serie!' : 'U rigalu d’oji t’aspetta: nun perdiri a serie!');
  // energia delle partite piena
  if (typeof en === 'function') { const e = en(); if (e.n < EN_MAX) add(102, e.at + (EN_MAX - e.n) * EN_MS, 'Energia piena ⚡', it ? 'Sei di nuovo pieno di energia: vieni a fare una partita!' : 'Si chinu d’energia: veni a fari na partita!'); }
  // fieno pronto
  const S = E.sheep;
  if (S && S.plots) { const t = S.plots.filter((p) => p.t).map((p) => p.t + SH.HAY); if (t.length) add(103, Math.min(...t), 'Il fieno è pronto 🌾', it ? 'Il campo è maturo: raccogli il fieno per le pecore.' : 'U campu è maturu: cogghi u fenu pe’ i pecuri.'); }
  // le pecore stanno per ammalarsi dalla fame
  if (S && S.flock && S.flock.length && typeof SH !== 'undefined' && SH.SICK) { const t = S.flock.filter((x) => !x.sick).map((x) => x.fedUntil + SH.SICK - HOUR); if (t.length) add(107, Math.min(...t), 'Le pecore hanno fame 🐑', it ? 'Dai il fieno alle pecore, o si ammalano e passa il veterinario!' : 'Duna u fenu ê pecuri, sinnò s’ammalanu e passa u veterinariu!'); }
  // la gatta torna nel salumificio
  const M = E.merge;
  if (M && M.cat && !M.cat.until && M.cat.next) add(104, M.cat.next, 'La gatta è tornata 🐱', it ? 'È sul tavolo del salumificio e vuole un tagliere!' : 'È supra u tavulu d’u salumificiu e voli nu tagghieri!');
  // energia del salumificio piena
  if (M && M.energy < M.energyMax) add(105, M.energyAt + (M.energyMax - M.energy) * ENERGY_MS, 'Il salumificio è pronto', it ? 'Il macellaio ha riposato: l’energia è piena.' : 'U chiancheri si riposau: l’energia è china.');
  // baule pronto
  const ch = (E.chests || []).filter((c) => c.end && c.end > now).map((c) => c.end);
  if (ch.length) add(106, Math.min(...ch), 'Un baule è pronto 🎁', it ? 'Il tuo baule si è aperto: vieni a vedere cosa c’è dentro!' : 'U bauli s’apriu: veni a vidiri chi c’è intra!');
  return out;
}
/* quando l'app va in secondo piano le chiamate partono subito, senza aspettare risposte:
   a schermo spento Android può fermare il codice prima che le risposte arrivino */
function notifSchedule() {
  const L = LN(); if (!L || P.notif !== true) return;
  try {
    const list = notifPlan(), ids = list.map((n) => n.id);
    const gone = NOTIF_IDS.filter((id) => !ids.includes(id)).map((id) => ({ id }));
    if (gone.length) L.cancel({ notifications: gone }).catch(() => {});
    if (list.length) L.schedule({ notifications: list }).catch(() => {});
  } catch (e) { /* niente */ }
}
function notifClear() { const L = LN(); if (!L) return; try { L.cancel({ notifications: NOTIF_IDS.map((id) => ({ id })) }).catch(() => {}); } catch (e) { /* niente */ } }
async function notifTest() {
  const L = LN(); if (!L) { flash('Notifiche non disponibili'); return; }
  const ok = P.notif === true || (await notifSet(true));
  if (!ok) { overlay('<h2>Notifiche bloccate</h2><p>Il telefono non permette le notifiche a Scopa Calabrese. Apri <b>Impostazioni del telefono → App → Scopa Calabrese → Notifiche</b> e attivale.</p><button class="btn" id="ntOk">Ho capito</button>'); $('ntOk').onclick = () => { $('layer').innerHTML = ''; }; return; }
  try { await L.schedule({ notifications: [{ id: 199, title: 'Scopa Calabrese', body: isIt() ? 'Le notifiche funzionano!' : 'I notifichi funzionanu, compà!', schedule: { at: new Date(Date.now() + 10000), allowWhileIdle: true } }] }); } catch (e) { flash('Errore: ' + (e && e.message || e)); return; }
  overlay('<h2>Prova partita</h2><p>Tra 10 secondi arriva una notifica di prova. Esci dall’app (tasto Home) e aspetta.</p><p class="pznote">Se non arriva: nelle impostazioni del telefono, alla voce <b>Batteria</b> di Scopa Calabrese, scegli “Nessuna restrizione” o “Consenti attività in background”.</p><button class="btn" id="ntOk">Va bene</button>');
  $('ntOk').onclick = () => { $('layer').innerHTML = ''; };
}
async function notifSet(on) {
  const L = LN();
  if (!on) { P.notif = false; save(); notifClear(); return false; }
  if (!L) { P.notif = false; return false; }
  try {
    let p = await L.checkPermissions();
    if (p.display !== 'granted') p = await L.requestPermissions();
    P.notif = p.display === 'granted';
  } catch (e) { P.notif = false; }
  save();
  return P.notif;
}
/* la prima volta: il Signor ’Nduja chiede se avvisare */
function notifAsk(done) {
  if (P.notif !== undefined || !LN()) { if (done) done(); return; }
  overlay('<div class="nickwin"><div class="nicknd">' + NDUJA_SVG + '</div><div class="nickbub"><b>Signor ’Nduja</b><span>' + tr2('Vo’ chi ti chiamu quandu u fenu è prontu, a gatta torna o u rigalu t’aspetta?', 'Vuoi che ti avvisi quando il fieno è pronto, la gatta torna o il regalo ti aspetta?') + '</span></div></div>' +
    '<button class="btn take" id="nfYes">Sì, avvisami</button><button class="btn alt" id="nfNo">No, grazie</button><small class="pznote">Puoi cambiare idea nelle Impostazioni.</small>');
  $('nfYes').onclick = async () => { $('layer').innerHTML = ''; const ok = await notifSet(true); flash(ok ? 'Ti avviso io!' : 'Notifiche non permesse dal telefono'); if (done) done(); };
  $('nfNo').onclick = () => { $('layer').innerHTML = ''; P.notif = false; save(); if (done) done(); };
}
(() => {
  const A = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
  if (A && A.addListener) A.addListener('appStateChange', (s) => { if (s.isActive) notifClear(); else notifSchedule(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) notifSchedule(); else notifClear(); });
})();
