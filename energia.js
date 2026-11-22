/* ================= ENERGIA PER LE PARTITE A CARTE ================= */
const EN_MAX = 10, EN_MS = 12 * MIN, EN_VIDEO = 5, EN_PRICE = 200;
function en() {
  if (!P.en) P.en = { n: EN_MAX, at: Date.now() };
  const E = P.en, now = Date.now();
  if (E.n < EN_MAX) { const k = Math.floor((now - E.at) / EN_MS); if (k > 0) { E.n = Math.min(EN_MAX, E.n + k); E.at += k * EN_MS; } }
  if (E.n >= EN_MAX) E.at = now;
  return E;
}
const enNext = () => (en().n >= EN_MAX ? 0 : Math.max(0, EN_MS - (Date.now() - P.en.at)));
const enFree = () => !!(window.CONQ_FIGHT || window.CLAN_FIGHT || window.TOUR_FIGHT);
const enHas = () => enFree() || en().n > 0;
function energyUse() {
  const E = en(); if (E.n <= 0) return false;
  if (E.n === EN_MAX) E.at = Date.now();
  E.n--; save(); renderEnergy(); return true;
}
function energyGate(cb) { if (enFree() || energyUse()) return cb(); energyOverlay(cb); }
function energyAdd(n) { const E = en(); E.n = Math.min(EN_MAX + EN_VIDEO, E.n + n); save(); renderEnergy(); }
function energyOverlay(cb) {
  const E = en(), empty = E.n <= 0, C = eco().carlini;
  overlay('<div class="enwin"><div class="ennd">' + NDUJA_SVG + '</div><div class="enbub"><b>Signor ’Nduja</b><span>' + (empty ? tr('Si stancu mortu, compà! Pe jocari n’atra partita ti servi l’energia.') : 'Ogni partita (carte, U Palluni, A Casa da Figghia) usa un fulmine d’energia. Quando finisci, riposa o guarda un video.') + '</span></div></div>' +
    '<div class="enbig"><b>⚡ ' + E.n + '</b><span>/' + EN_MAX + '</span></div><p class="ennote" id="enNext">' + (E.n < EN_MAX ? '+1 ogni 12 minuti · il prossimo tra ' + fmtTime(enNext()) : 'Energia piena!') + '</p>' +
    '<button class="btn take" id="enVid">▶ Guarda un video: +' + EN_VIDEO + ' ⚡</button>' +
    '<button class="btn" id="enBuy"' + (C >= EN_PRICE ? '' : ' disabled') + '>Usa ' + EN_PRICE + ' carlini: +' + EN_VIDEO + ' ⚡</button>' +
    '<button class="btn alt" id="enNo">' + (empty ? 'Aspetto' : 'Chiudi') + '</button>' +
    '<p class="pgnote">Le avventure, la conquista e le sfide del clan non usano energia. Quando sali di livello l’energia si ricarica tutta.</p>');
  const after = () => { $('layer').innerHTML = ''; if (cb) energyGate(cb); };
  $('enNo').onclick = () => { $('layer').innerHTML = ''; };
  $('enVid').onclick = async () => {
    $('enVid').disabled = true;
    const got = await showRewardedAd();
    if (got) { energyAdd(EN_VIDEO); flash('+' + EN_VIDEO + ' energia'); if (typeof track === 'function') track('energy_video', {}); after(); }
    else { $('enVid').disabled = false; flash('Video non disponibile ora'); }
  };
  $('enBuy').onclick = () => { if (eco().carlini < EN_PRICE) return; eco().carlini -= EN_PRICE; energyAdd(EN_VIDEO); renderRes(); flash('+' + EN_VIDEO + ' energia'); after(); };
}
/* energia anche in alto nelle schermate di U Palluni e A Casa da Figghia: si tocca per ricaricare */
function renderGameEnergy() {
  for (const [v, before] of [['vCalcio', 'czRules'], ['vCasa', 'caRules']]) {
    const sec = $(v); if (!sec) continue;
    let el = sec.querySelector('.genergy');
    if (!el) { const r = $(before); if (!r) continue; el = document.createElement('button'); el.className = 'btn ghost small genergy'; el.setAttribute('aria-label', 'Energia: tocca per ricaricare'); r.before(el); el.onclick = () => energyOverlay(null); }
    const E = en();
    el.innerHTML = '⚡<b>' + E.n + '</b>' + (E.n < EN_MAX ? '<small>+</small>' : '');
    el.classList.toggle('low', E.n <= 2);
  }
}
function renderEnergy() {
  try { renderGameEnergy(); } catch (e) { /* niente */ }
  let el = $('homeEnergy');
  if (!el) { const c = $('homeCoins'); if (!c) return; el = document.createElement('button'); el.id = 'homeEnergy'; el.className = 'hcoins hen'; el.setAttribute('aria-label', 'Energia per le partite'); c.after(el); el.onclick = () => energyOverlay(null); }
  const E = en();
  el.innerHTML = '<b>⚡' + E.n + '</b>' + (E.n < EN_MAX ? '<small>' + fmtTime(enNext()).replace(/ \d+s$/, '') + '</small>' : '');
  el.classList.toggle('low', E.n <= 2);
}
(() => {
  const oldSG = startGame;
  startGame = function (kind) { const a = arguments, t = this; if (enFree()) return oldSG.apply(t, a); energyGate(() => oldSG.apply(t, a)); };
  const oldRH = renderHome;
  renderHome = function () { oldRH.apply(this, arguments); renderEnergy(); };
  const oldER = enterRoom;
  enterRoom = function () { energyUse(); return oldER.apply(this, arguments); };
  const oldXp = gainXp;
  gainXp = function () { const b = levelOf(P.xp); const r = oldXp.apply(this, arguments); if (levelOf(P.xp) > b && en().n < EN_MAX) { P.en.n = EN_MAX; P.en.at = Date.now(); save(); renderEnergy(); } return r; };
  const oldAw = award;
  award = function () { const b = levelOf(P.xp); const r = oldAw.apply(this, arguments); if (levelOf(P.xp) > b && en().n < EN_MAX) { P.en.n = EN_MAX; P.en.at = Date.now(); save(); } return r; };
  setInterval(() => { if (view === 'vHome') renderEnergy(); else if (view === 'vCalcio' || view === 'vCasa') renderGameEnergy(); const n = $('enNext'); if (n) n.textContent = en().n < EN_MAX ? '+1 ogni 12 minuti · il prossimo tra ' + fmtTime(enNext()) : 'Energia piena!'; }, 1000);
  renderEnergy();
})();
