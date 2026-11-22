/* ================= LA MORRA CALABRESE ================= */
const MORRA_TO = 5, MORRA_MS = 4000;
const MORRA_NUM = { 2: 'Dui!', 3: 'Triii triii!', 4: 'Quattru quattruhh!', 5: 'Cincu ciauu!', 6: 'Sei pollooo!', 7: 'Setti!', 8: 'Ottu!', 9: 'Novi!', 10: 'Sanaa!' };
const MORRA_FOES = [
  { id: 'pastore', name: 'Il Pastore', lv: 'Facile', skill: 0.25, line: 'Iocu a morra di quandu era picciriddu…' },
  { id: 'zampognaro', name: 'Lo Zampognaro', lv: 'Medio', skill: 0.5, line: 'Ti leggiu ’nta l’occhi, compà!' },
  { id: 'massaro', name: 'Il Massaro', lv: 'Difficile', skill: 0.75, line: 'A morra ’nto paisi nu mi batti nuddu!' },
];
let MR = null;
function morraStats() {
  if (!P.morra) P.morra = { w: 0, l: 0 };
  const m = P.morra; for (const [k, v] of Object.entries({ beat: [0, 0, 0], sana: 0, capp: 0, run: 0, pts: 0 })) if (m[k] === undefined) m[k] = Array.isArray(v) ? v.slice() : v;
  return m;
}
/* obiettivi della morra: sono anche badge del profilo */
const MORRA_GOALS = [
  { id: 'm1', name: 'Prima morra', need: 'Vinci la tua prima partita a morra', icon: 'pastore', ok: (m) => m.w >= 1, prog: (m) => [Math.min(m.w, 1), 1] },
  { id: 'msana', name: 'Sanaa!', need: 'Fai punto gridando dieci', icon: 'zampognaro', ok: (m) => m.sana >= 1, prog: (m) => [Math.min(m.sana, 1), 1] },
  { id: 'mrun', name: 'Mano calda', need: 'Fai 4 punti di fila in una partita', icon: 'casaro', ok: (m) => m.run >= 4, prog: (m) => [Math.min(m.run, 4), 4] },
  { id: 'mall', name: 'Tutti battuti', need: 'Batti il Pastore, lo Zampognaro e il Massaro', icon: 'massaro', ok: (m) => m.beat.every((x) => x > 0), prog: (m) => [m.beat.filter((x) => x > 0).length, 3] },
  { id: 'mcapp', name: 'Cappotto a morra', need: 'Vinci 5 a 0', icon: 'lanzaturi', ok: (m) => m.capp >= 1, prog: (m) => [Math.min(m.capp, 1), 1] },
  { id: 'mpts', name: 'Cento punti', need: 'Fai 100 punti a morra in tutto', icon: 'pescatore', ok: (m) => m.pts >= 100, prog: (m) => [Math.min(m.pts, 100), 100] },
  { id: 'mre', name: 'Re della morra', need: 'Vinci 25 partite a morra', icon: 'massaro', ok: (m) => m.w >= 25, prog: (m) => [Math.min(m.w, 25), 25] },
];
/* baule della morra: più è difficile l'avversario, più è prezioso */
function morraChest(won, foe, capp) {
  const E = eco();
  if (!won && Math.random() > 0.3) return '';
  if (E.chests.length >= SLOTS) return '<div class="chestnote">I tuoi bauli sono pieni: aprine uno per fare spazio.</div>';
  let grade = 'legno';
  if (won) grade = capp ? 'oro' : foe === 2 ? (Math.random() < 0.35 ? 'oro' : 'argento') : foe === 1 ? (Math.random() < 0.6 ? 'rame' : 'argento') : (Math.random() < 0.6 ? 'legno' : 'rame');
  E.chests.push({ id: 'c' + Date.now().toString(36), grade, start: null, end: null, sped: false });
  return '<div class="chestnote"><span class="chmini">' + chestSVG(grade) + '</span>Hai trovato un <b>' + GRADES[grade].name.toLowerCase() + '</b>! Lo trovi nella sezione Bauli.</div>';
}
function handSVG(n, foe) {
  // mano stilizzata: n dita alzate (1 = solo l'indice, 5 = mano aperta)
  const up = [[false, true, false, false, false], [false, true, true, false, false], [false, true, true, true, false], [false, true, true, true, true], [true, true, true, true, true]][Math.max(1, Math.min(5, n)) - 1];
  const skin = foe ? '#D9A47A' : '#F0C29A', line = '#1A1A1A';
  const fx = [14, 30, 44, 58, 72], fl = [30, 46, 50, 46, 38];
  let f = '';
  up.forEach((u, i) => {
    if (i === 0) { f += u ? '<rect x="4" y="52" width="14" height="34" rx="7" transform="rotate(-38 11 78)" fill="' + skin + '" stroke="' + line + '" stroke-width="2.5"/>' : '<rect x="12" y="64" width="14" height="22" rx="7" transform="rotate(-20 19 75)" fill="' + skin + '" stroke="' + line + '" stroke-width="2.5"/>'; return; }
    const h = u ? fl[i] : 12, y = 62 - h;
    f += '<rect x="' + (fx[i] - 6) + '" y="' + y + '" width="13" height="' + (h + 12) + '" rx="6.5" fill="' + skin + '" stroke="' + line + '" stroke-width="2.5"/>';
    if (!u) f += '<path d="M' + (fx[i] - 4) + ' ' + (y + 6) + ' h9" stroke="' + line + '" stroke-width="1.5" opacity="0.5"/>';
  });
  return '<svg viewBox="-16 -4 112 126" class="mhand" aria-label="' + n + ' dita">' + f +
    '<path d="M18 60 Q16 104 34 112 L62 112 Q80 104 80 60 Z" fill="' + skin + '" stroke="' + line + '" stroke-width="2.5" stroke-linejoin="round"/>' +
    '<rect x="26" y="108" width="44" height="12" fill="' + (foe ? '#6B4424' : '#2F6FA0') + '" stroke="' + line + '" stroke-width="2"/></svg>';
}
function renderMorra() {
  const box = $('morraBox'), st = morraStats();
  if (!MR) {
    box.innerHTML = '<div class="mintro"><div class="mhands">' + handSVG(2, true) + handSVG(5, false) + '</div><p>Due giocatori buttano la mano nello stesso momento e gridano un numero: chi indovina la <b>somma delle dita</b> fa il punto. Si gioca a <b>' + MORRA_TO + '</b>.</p></div>' +
      '<h3>Scegli l’avversario</h3><div class="mfoes">' + MORRA_FOES.map((f, i) => '<button class="mfoe" data-mfoe="' + i + '"><img src="' + SPRITE[f.id] + '" alt=""><b>' + f.name + '</b><small>' + f.lv + '</small></button>').join('') + '</div>' +
      '<p class="pgnote">Le tue partite a morra: ' + st.w + ' vinte · ' + st.l + ' perse. Vincendo trovi bauli: più forte è l’avversario, più prezioso è il baule. Con il cappotto, 5 a 0, è sempre d’oro!</p>' +
      '<h3>Obiettivi della morra</h3><div class="mgoals">' + MORRA_GOALS.map((g) => { const [a, b] = g.prog(st), done = g.ok(st); return '<div class="mgoal' + (done ? ' done' : '') + '"><img src="' + AVIMG[g.icon] + '" alt=""><span><b>' + g.name + '</b><small>' + g.need + '</small>' + (done ? '' : '<i class="pbar"><b style="width:' + Math.round(a / b * 100) + '%"></b></i>') + '</span><em>' + (done ? '✓' : a + '/' + b) + '</em></div>'; }).join('') + '</div>';
    return;
  }
  const f = MORRA_FOES[MR.foe];
  let h = '<div class="mscore"><div><b>' + MR.pts[0] + '</b><small>Tu</small></div><span>a ' + MORRA_TO + '</span><div><b>' + MR.pts[1] + '</b><small>' + f.name.replace(/^(Il|Lo|La) /, '') + '</small></div></div>' +
    '<div class="marena" id="marena"><div class="mside foe"><img class="mfoeimg" src="' + SPRITE[f.id] + '" alt=""><div class="mhandbox" id="mhFoe">' + (MR.reveal ? handSVG(MR.reveal.cf, true) : handSVG(5, true)) + '</div>' + (MR.reveal ? '<div class="mcall foe">' + mNum(MR.reveal.cc) + '</div>' : '') + '</div>' +
    '<div class="mmid" id="mmid">' + (MR.reveal ? '<b class="msum">' + (MR.reveal.cf + MR.reveal.pf) + '</b><small>' + MR.reveal.text + '</small>' : '<div class="mtimer"><i id="mbar"></i></div><small>' + (MR.phase === 'choose' ? 'Scegli dita e numero!' : '') + '</small>') + '</div>' +
    '<div class="mside me"><div class="mhandbox" id="mhMe">' + (MR.reveal ? handSVG(MR.reveal.pf, false) : handSVG(MR.pf || 5, false)) + '</div>' + (MR.reveal ? '<div class="mcall me">' + mNum(MR.reveal.pc) + '</div>' : '') + '</div></div>';
  if (MR.phase === 'choose') {
    h += '<div class="mpick"><span>Le tue dita</span><div class="mrow">' + [1, 2, 3, 4, 5].map((n) => '<button class="mbtn' + (MR.pf === n ? ' on' : '') + '" data-mf="' + n + '">' + n + '</button>').join('') + '</div>' +
      '<span>Cosa gridi</span><div class="mrow calls">' + [2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => '<button class="mbtn' + (MR.pc === n ? ' on' : '') + '" data-mc="' + n + '"' + (MR.pf && (n < MR.pf + 1 || n > MR.pf + 5) ? ' disabled' : '') + '>' + n + '</button>').join('') + '</div></div>';
  } else if (MR.phase === 'end') {
    h += '';
  } else h += '<div class="mpick wait"><small>' + (MR.msg || '') + '</small></div>';
  h += '<button class="btn ghost small mquit" data-mq="1">Lascia la partita</button>';
  box.innerHTML = h;
  if (MR.phase === 'choose') morraBar();
}
function morraBar() {
  const b = $('mbar'); if (!b) return;
  const left = Math.max(0, MR.deadline - Date.now());
  b.style.transition = 'none'; b.style.width = (left / MORRA_MS * 100) + '%';
  void b.offsetWidth;
  b.style.transition = 'width ' + left + 'ms linear'; b.style.width = '0%';
}
function morraStart(i) {
  const m0 = morraStats();
  MR = { before: new Set(MORRA_GOALS.filter((g) => g.ok(m0)).map((g) => g.id)), run: 0, foe: i, pts: [0, 0], hist: [], phase: 'choose', pf: 0, pc: 0, reveal: null, round: 0 };
  morraRound(true);
}
function morraRound(first) {
  MR.phase = 'choose'; MR.pf = 0; MR.pc = 0; MR.reveal = null; MR.round++;
  MR.deadline = Date.now() + MORRA_MS;
  clearTimeout(MR.t); MR.t = setTimeout(morraResolve, MORRA_MS);
  renderMorra();
  if (first) { const f = MORRA_FOES[MR.foe]; setTimeout(() => flash(f.line), 200); }
}
function cpuMove() {
  const f = MORRA_FOES[MR.foe], cf = 1 + Math.floor(Math.random() * 5);
  // indovina le tue dita guardando le tue abitudini
  let guess = 1 + Math.floor(Math.random() * 5);
  if (MR.hist.length >= 2 && Math.random() < f.skill) {
    const cnt = [0, 1, 1, 1, 1, 1];
    MR.hist.slice(-12).forEach((x, k, a) => { cnt[x] += 1 + k / a.length; });
    const last = MR.hist[MR.hist.length - 1];
    if (Math.random() < 0.3) cnt[last] *= 0.5; // pensa che cambierai
    guess = cnt.indexOf(Math.max(...cnt.slice(1)));
  }
  return { cf, cc: cf + guess };
}
function morraSpeak(t) {
  if (!AUDIO.on || !window.speechSynthesis) return;
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'it-IT'; if (itVoice) u.voice = itVoice; u.rate = 1.2; u.pitch = 1.1; speechSynthesis.speak(u); } catch (e) { /* niente */ }
}
function morraResolve() {
  if (!MR || MR.phase !== 'choose') return;
  clearTimeout(MR.t);
  if (!MR.pf) MR.pf = 1 + Math.floor(Math.random() * 5);
  if (!MR.pc) MR.pc = MR.pf + 1 + Math.floor(Math.random() * 5);
  const c = cpuMove(), sum = MR.pf + c.cf;
  MR.hist.push(MR.pf);
  const me = MR.pc === sum, cpu = c.cc === sum;
  let text;
  const ms = morraStats();
  if (me && !cpu) { MR.pts[0]++; MR.run = (MR.run || 0) + 1; ms.run = Math.max(ms.run, MR.run); ms.pts++; if (MR.pc === 10) ms.sana++; text = MR.pc === 10 ? tr('Sanaa! Punto tuo!') : 'Punto tuo!'; }
  else if (cpu && !me) { MR.run = 0; MR.pts[1]++; text = 'Punto a ' + MORRA_FOES[MR.foe].name.replace(/^(Il|Lo|La) /, '') + '!'; }
  else if (me && cpu) text = 'Tutti e due! Si ributta.';
  else text = 'Nessuno! Si ributta.';
  MR.phase = 'shake'; MR.reveal = null; MR.msg = 'Mo… rra!';
  renderMorra();
  const a = $('marena'); if (a) { a.classList.remove('shake'); void a.offsetWidth; a.classList.add('shake'); }
  morraSpeak(mNum(MR.pc));
  setTimeout(() => {
    MR.phase = 'reveal'; MR.reveal = { pf: MR.pf, pc: MR.pc, cf: c.cf, cc: c.cc, text };
    renderMorra();
    if (me && !cpu) { fx('take'); if (MR.pts[0] % 3 === 0) say('bella', 0); }
    else if (cpu && !me) fx('sad'); else fx('card');
    setTimeout(() => morraSpeak(mNum(c.cc)), 350);
    if (MR.pts[0] >= MORRA_TO || MR.pts[1] >= MORRA_TO) setTimeout(morraEnd, 1600);
    else setTimeout(() => { if (MR && MR.phase === 'reveal') morraRound(false); }, 1900);
  }, 750);
}
function morraEnd() {
  const won = MR.pts[0] > MR.pts[1], st = morraStats(), f = MORRA_FOES[MR.foe];
  const before = MR.before || new Set();
  const capp = won && MR.pts[1] === 0;
  if (won) { st.w++; st.beat[MR.foe]++; if (capp) st.capp++; } else st.l++;
  const fresh = MORRA_GOALS.filter((g) => g.ok(st) && !before.has(g.id));
  MR.phase = 'end';
  const xp = won ? 40 + 20 * MR.foe : 10, c = won ? 20 + 15 * MR.foe : 0;
  gainXp(xp); eco().carlini += c;
  const chest = morraChest(won, MR.foe, capp);
  const goalHtml = fresh.length ? '<div class="unl">' + fresh.map((g) => '<div><img src="' + AVIMG[g.icon] + '" alt="">Obiettivo: ' + g.name + '</div>').join('') + '</div>' : '';
  if (fresh.length) { gainXp(25 * fresh.length); setTimeout(() => flash('Obiettivo!'), 400); }
  save();
  if (typeof track === 'function') track('game_end', { game: 'morra', won: won ? 1 : 0 });
  say(won ? 'win' : 'lose', won ? 0 : 1);
  overlay('<h2>' + (capp ? 'Cappotto! 5 a 0!' : won ? 'Hai vinto a morra!' : 'Ha vinto ' + f.name.toLowerCase()) + '</h2><p>Finale ' + MR.pts[0] + ' a ' + MR.pts[1] + '.</p>' +
    '<div class="gain"><div class="xp">+' + xp + ' XP' + (c ? ' · +' + c + ' carlini' : '') + '</div>' + chest + goalHtml + (fresh.length ? '<div style="font-size:14px;color:#5A4C3A">+' + 25 * fresh.length + ' XP per gli obiettivi</div>' : '') + '</div>' +
    '<button class="btn" id="mAgain">Rivincita</button><button class="btn alt" id="mOther">Cambia avversario</button>');
  $('mAgain').onclick = () => { $('layer').innerHTML = ''; morraStart(MR.foe); };
  $('mOther').onclick = () => { $('layer').innerHTML = ''; MR = null; renderMorra(); };
}
$('morraBox').addEventListener('click', (e) => {
  const fo = e.target.closest('[data-mfoe]'); if (fo) { morraStart(+fo.dataset.mfoe); return; }
  if (e.target.closest('[data-mq]')) { clearTimeout(MR && MR.t); MR = null; renderMorra(); return; }
  if (!MR || MR.phase !== 'choose') return;
  const fb = e.target.closest('[data-mf]');
  if (fb) { MR.pf = +fb.dataset.mf; if (MR.pc && (MR.pc < MR.pf + 1 || MR.pc > MR.pf + 5)) MR.pc = 0; fx('card'); }
  const cb = e.target.closest('[data-mc]');
  if (cb && !cb.disabled) { MR.pc = +cb.dataset.mc; fx('card'); }
  if (MR.pf && MR.pc) { morraResolve(); return; }
  const left = MR.deadline; renderMorra(); MR.deadline = left; morraBar();
});
(() => { const oldGo = go; go = function (v) { if (v !== 'vMorra' && MR) { clearTimeout(MR.t); MR = null; } oldGo(v); if (v === 'vMorra') { renderMorra(); if (!ndSeen('morra') && !ND.open) setTimeout(() => { if (view === 'vMorra' && !ND.open) showNduja('morra'); }, 350); } }; })();
