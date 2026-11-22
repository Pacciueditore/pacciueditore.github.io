/* Scopa Calabrese – codice principale, parte 3 */
/* ================= boot ================= */
loadLocal();
renderHome();
$('ndMini').innerHTML = NDUJA_SVG.replace(/ndBody/g, 'ndBodyMini');
$('coverImg').src = COVER;
syncMusicBtns();
initCloud();
/* ================= TASTO INDIETRO DEL TELEFONO ================= */
const EXIT_LINES = ['Te ne vai già? Il Signor ’Nduja aveva appena scaldato il tavolo!', 'Già te ne vai? Bergo ci resta male…', 'Mòviti… a restare! Un’altra partita?', 'Se te ne vai, chi la fa la scopa?'];
function askExit() {
  const line = EXIT_LINES[Math.floor(Math.random() * EXIT_LINES.length)];
  overlay('<div class="exitask"><div class="exitnd">' + NDUJA_SVG.replace(/ndBody/g, 'ndBodyExit') + '</div><h2>Esci dal gioco?</h2><p>' + line + '</p></div><button class="btn" id="exNo">Resta a giocare</button><button class="btn alt" id="exYes">Esci</button>');
  $('exNo').onclick = () => { $('layer').innerHTML = ''; };
  $('exYes').onclick = () => {
    const A = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
    $('layer').innerHTML = '';
    if (A && A.exitApp) A.exitApp(); else flash('A presto!');
  };
}
function handleBack() {
  if (ND.open) { closeNduja(); return; }
  const pk = document.getElementById('peek'); if (pk && !pk.hidden) { pk.hidden = true; return; }
  const sp = document.querySelector('.splash'); if (sp) { sp.click(); return; }
  if ($('layer').innerHTML) {
    if ($('exNo')) { $('exNo').click(); return; }
    if ($('qNo')) { $('qNo').click(); return; }
    for (const id of ['czQN', 'caQN', 'czOut', 'caOut']) if ($(id)) { $(id).click(); return; }
    $('layer').innerHTML = '';
    if (view === 'vGame' && (!G || G.over || G.phase === 'end' || (G.online && OL.ended))) { if (G && G.online) olLeave(); G = null; go('vHome'); }
    return;
  }
  if (view === 'vGame') { $('quitBtn').click(); return; }
  // U Palluni e A Casa da Figghia: in partita chiede conferma, dalle sotto-schermate torna al menu del gioco
  if (view === 'vBorgo' && typeof BG !== 'undefined') {
    if (BG.move) { BG.move = null; bgHud(); return; }
    if (BG.place) { BG.place = null; bgHud(); return; }
    if (BG.sheet) { BG.sheet = false; bgSheet(); return; }
    if (BG.sel) { BG.sel = null; bgPanel(); return; }
  }
  if (view === 'vCalcio' && typeof CZ !== 'undefined') {
    if (CZ.screen === 'match' && CZ.m && !CZ.m.over) { czQuit(); return; }
    if (/^car./.test(CZ.screen)) { CZ.screen = 'car'; czRender(); return; }
    if (CZ.screen !== 'menu') { CZ.m = null; CZ.screen = 'menu'; czRender(); return; }
  }
  if (view === 'vCasa' && typeof CA !== 'undefined') {
    if (CA.screen === 'match' && CA.m && !CA.m.over) { caQuit(); return; }
    if (CA.screen !== 'menu') { CA.m = null; CA.screen = 'menu'; caRender(); return; }
  }
  if (view === 'vConq' && typeof conqView !== 'undefined' && conqView !== 'map') {
    if (conqView === 'battle' && BT && !BT.over) { BT = null; cLog('Ti sei ritirato dalla battaglia.'); }
    conqView = 'map'; save(); renderConq(); return;
  }
  if (view === 'vHome') {
    const box = $('hpages');
    if (box && box.scrollLeft > 10) { const t0 = document.querySelector('.htabs [data-hp="0"]'); if (t0) t0.click(); return; }
    askExit(); return;
  }
  go('vHome');
}
(() => {
  const A = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
  if (A && A.addListener) A.addListener('backButton', handleBack);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !e.defaultPrevented) handleBack(); });
})();
/* animazione di apertura: Pacciu Editore presenta */
(function splash() {
  const homeGuide0 = () => { if (!ndSeen('home')) setTimeout(() => { if (view === 'vHome' && !ND.open) showNduja('home'); }, 500); };
  const homeNick = () => { if (typeof nickFirst === 'function' && nickFirst(homeGuide0)) return; homeGuide0(); };
  const homeGuide = () => { if (typeof applyLang === 'function') applyLang(); if (typeof langFirst === 'function' && langFirst(homeNick)) return; homeNick(); };
  if (typeof SPLASH_IMG === 'undefined') { homeGuide(); return; }
  // 1.3.9: la schermata è già nella pagina (si vede subito); se manca la creo come prima
  let el = document.getElementById('preSplash');
  if (!el) {
    el = document.createElement('div');
    el.className = 'splash'; el.setAttribute('role', 'img'); el.setAttribute('aria-label', 'Pacciu Editore presenta Scopa Calabrese');
    el.innerHTML = '<div class="spframe"><img src="' + SPLASH_IMG + '" alt=""></div><div class="sppres">presenta</div><div class="sptitle">Scopa <span>Calabrese</span></div><div class="spskip">© ' + LEGAL.year + ' ' + LEGAL.owner + ' · Tocca per saltare</div>';
    document.body.appendChild(el);
  } else { const im = el.querySelector('img'); if (im && (!im.getAttribute('src') || im.getAttribute('src') === 'SPLASHSRC')) im.src = SPLASH_IMG; }
  let gone = false;
  const end = () => { if (gone) return; gone = true; el.classList.add('out'); setTimeout(() => { el.remove(); homeGuide(); }, 500); };
  el.addEventListener('click', end);
  // il tempo conta da quando l'app si è aperta, non da quando il codice ha finito di caricare
  const shown = (window.performance && performance.now) ? performance.now() : 0;
  setTimeout(end, Math.max(1200, (matchMedia('(prefers-reduced-motion: reduce)').matches ? 1800 : 3600) - shown));
})();
