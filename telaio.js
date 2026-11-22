/* ================= IL TELAIO DELLA TESSITRICE: filare, tingere e tessere la lana delle pecore ================= */
const YARN = {
  b: { n: 'bianco', c: '#F4EFE3' }, g: { n: 'grigio', c: '#A7A39C' }, n: { n: 'nero', c: '#3B3633' },
  r: { n: 'rosso', c: '#B3312A', dye: 'Robbia', price: 12, d: 'la radice che tinge di rosso' },
  y: { n: 'giallo', c: '#E5B83F', dye: 'Ginestra', price: 8, d: 'i fiori gialli delle colline calabresi' },
  u: { n: 'blu', c: '#2F5D8A', dye: 'Guado', price: 18, d: 'le foglie che danno il blu' },
};
const DYES = ['y', 'r', 'u'];
const WEAVES = [
  { id: 'sciarpa', n: 'Sciarpa a righe', need: 0, rows: ['nnnnn', 'bbbbb', 'ggggg', 'bbbbb', 'nnnnn', 'bbbbb'], f: 'Calda e semplice: la prima cosa che si impara al telaio.' },
  { id: 'coperta', n: 'Coperta a quadri', need: 2, rows: ['bbggbb', 'bbggbb', 'ggnngg', 'ggnngg', 'bbggbb', 'bbggbb'], f: 'Nelle case di montagna non mancava mai, piegata ai piedi del letto.' },
  { id: 'vancale', n: 'Vancale di Tiriolo', need: 4, rows: ['nnnnnn', 'rrrrrr', 'nnnnnn', 'nryyrn', 'nnnnnn', 'rrrrrr', 'nnnnnn', 'nnnnnn'], f: 'Lo scialle nero e rosso delle donne di Tiriolo, tessuto a mano da secoli.' },
  { id: 'tappeto', n: 'Tappeto di San Giovanni in Fiore', need: 8, rows: ['nnnrnnn', 'nnryrnn', 'nryuyrn', 'ryuuuyr', 'nryuyrn', 'nnryrnn', 'nnnrnnn'], f: 'I tappeti della Sila con i rombi colorati: ogni famiglia aveva il suo disegno.' },
  { id: 'copriletto', n: 'Copriletto di Longobucco', need: 14, rows: ['uuuuuuuu', 'ubbbbbbu', 'ubuuuubu', 'ubuyyubu', 'ubuyyubu', 'ubuuuubu', 'ubbbbbbu', 'uuuuuuuu'], f: 'A Longobucco si tesse ancora come una volta: il copriletto era il pezzo più bello del corredo.' },
];
const LOOM_LINES = ['Mi sposa a figghia, mi servi u corredu!', 'Faci friddu supra a Sila, fammi na cosa carda!', 'Pa’ festa da Madonna vogghiu na cosa nova!', 'A me nonna u tessiva ’nto telaru, fammilu comu a idda!', 'Arrivanu i parenti i Torinu, vogghiu fari bella figura!', 'Mi raccumandu, ca è nu rigalu!', 'Comu i faciva me matri, chi mani ch’aviva!'];
const WHO_N = { rammendatrice: 'la rammendatrice', pescatore: 'il pescatore', lanzaturi: 'il lanzaturi', tessitrice: 'la tessitrice', pastore: 'il pastore', casaro: 'il casaro', raccoglitrice: 'la raccoglitrice', contadino: 'il contadino', massaro: 'il massaro', impagliatore: 'l’impagliatore', zampognaro: 'lo zampognaro', pastaia: 'la pastaia' };
const whoN = (k) => WHO_N[k] || k;
const PER_GOM = 3; // celle tessute con un gomitolo
let LM = null, loomSel = 'b', loomTab = 'fila';
function loomState() {
  const E = eco();
  if (!E.loom) E.loom = { gom: { b: 0, g: 0, n: 0, r: 0, y: 0, u: 0 }, made: {}, total: 0, perfect: 0, spun: 0, orders: [] };
  const L = E.loom;
  for (const o of L.orders) { if (o.line === 'Fa friddu ’ncapu a Sila, fammi na cosa calda!') o.line = LOOM_LINES[1]; if (o.line === 'Pe’ la festa da Madonna vogghiu na cosa nova!') o.line = LOOM_LINES[2]; }
  const open = WEAVES.filter((w) => L.total >= w.need);
  while (L.orders.length < 3) L.orders.push(loomOrder(open));
  return L;
}
function loomOrder(open) {
  const w = open[Math.random() < 0.45 ? open.length - 1 : Math.floor(Math.random() * open.length)];
  return { id: Math.random().toString(36).slice(2, 8), w: w.id, who: CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)], line: LOOM_LINES[Math.floor(Math.random() * LOOM_LINES.length)] };
}
const loomUnlocked = () => sheepState().fence >= FENCES.length - 1;
function weaveNeed(w) {
  const cnt = {};
  for (const r of w.rows) for (const ch of r) cnt[ch] = (cnt[ch] || 0) + 1;
  const need = {}; for (const k in cnt) need[k] = Math.ceil(cnt[k] / PER_GOM);
  return need;
}
function weavePrice(w) {
  // vale molto più della lana venduta grezza: lana + tinta, per il lavoro della tessitrice
  const need = weaveNeed(w); let v = 0;
  for (const k in need) v += need[k] * ((YARN[k].dye ? SH.PRICE.b : SH.PRICE[k]) / 3 + (YARN[k].dye ? YARN[k].price / 3 : 0));
  return Math.round(v * 2.2 + 10);
}
function weaveSVG(rows, size, done) {
  const h = rows.length, wd = rows[0].length, c = 12;
  let s = '<svg viewBox="-2 -8 ' + (wd * c + 4) + ' ' + (h * c + 16) + '" width="' + size + '" aria-hidden="true">';
  for (let x = 0; x < wd * 2; x++) { s += '<path d="M' + (x * c / 2 + 3) + ' -7 v7 M' + (x * c / 2 + 3) + ' ' + (h * c) + ' v7" stroke="#C9B98F" stroke-width="1.4"/>'; }
  rows.forEach((r, y) => [...r].forEach((ch, x) => {
    const col = ch === '.' ? '#E8E0CF' : YARN[ch].c;
    s += '<rect x="' + x * c + '" y="' + y * c + '" width="' + c + '" height="' + c + '" fill="' + col + '"/>';
    if (ch !== '.') s += '<path d="M' + x * c + ' ' + (y * c + 4) + ' h' + c + ' M' + x * c + ' ' + (y * c + 8) + ' h' + c + '" stroke="rgba(0,0,0,0.12)" stroke-width="1"/>';
  }));
  s += '<rect x="0" y="0" width="' + wd * c + '" height="' + h * c + '" fill="none" stroke="#1A1A1A" stroke-width="1.5"/>';
  if (done) s += '';
  return s + '</svg>';
}
const yarnDot = (k, n) => '<span class="ydot" style="--yc:' + YARN[k].c + '"></span>' + (n !== undefined ? '<b>' + n + '</b>' : '');

/* ---------- la scheda del telaio ---------- */
function renderLoom() {
  const box = $('loomBox'); if (!box) return;
  if (!loomUnlocked()) {
    box.innerHTML = '<div class="lmlock"><img src="' + SPRITE.tessitrice + '" alt=""><div><b>La tessitrice ti aspetta</b><p>Quando avrai il recinto più sicuro del paese, con il cane pastore, la tessitrice di Longobucco ti insegnerà a filare, tingere e tessere la lana delle tue pecore.</p></div></div>';
    return;
  }
  if (LM) { renderWeave(); return; }
  const L = loomState(), S = sheepState(), C = eco().carlini;
  const lanaTot = S.lana.b + S.lana.g + S.lana.n;
  const tab = (k, t, badge) => '<button role="tab" aria-selected="' + (loomTab === k) + '" data-lmtab="' + k + '">' + t + (badge ? '<i class="shbadge">' + badge + '</i>' : '') + '</button>';
  /* barra in alto: gomitoli e lana sempre in vista */
  let h = '<div class="lmbar"><div class="lmbgom">' + Object.keys(YARN).map((k) => '<span>' + yarnDot(k, L.gom[k]) + '</span>').join('') + '</div>' +
    '<span class="shst"><b>' + lanaTot + '</b><small>matasse</small></span></div>';
  if (!L.total) h += '<div class="lmhead slim"><img src="' + SPRITE.tessitrice + '" alt=""><div class="lmbub"><b>La tessitrice</b><span>' + tr('Benvenutu ’nta me casa! Portami a lana: a filamu, a tingimu e a tessimu ’nsemi.') + '</span></div></div>';
  /* gli ordini del paese: la cosa principale */
  const readyN = L.orders.filter((o) => { const need = weaveNeed(WEAVES.find((x) => x.id === o.w)); return Object.keys(need).every((k) => L.gom[k] >= need[k]); }).length;
  h += '<h4 class="lmh">Gli ordini del paese' + (readyN ? ' <i class="shbadge">' + readyN + '</i>' : '') + '</h4><div class="lmorders">' + L.orders.map((o) => {
    const w = WEAVES.find((x) => x.id === o.w), need = weaveNeed(w), ok = Object.keys(need).every((k) => L.gom[k] >= need[k]);
    return '<div class="lmorder' + (ok ? ' ok' : '') + '"><div class="lmpat">' + weaveSVG(w.rows, 56) + '</div><div class="lminfo"><b><img class="lmwho" src="' + AVIMG[o.who] + '" alt="">' + w.n + '</b><small class="say">' + trLine(o.line, LOOM_LINES) + '</small><span class="lmneed">' + Object.keys(need).map((k) => '<span class="' + (L.gom[k] >= need[k] ? '' : 'miss') + '">' + yarnDot(k, need[k]) + '</span>').join('') + '</span></div>' +
      '<div class="lmbtns"><button class="btn small ' + (ok ? 'take' : 'ghost') + '" data-lm="weave" data-id="' + o.id + '"' + (ok ? '' : ' disabled') + '>' + (ok ? 'Tessi' : 'Servono gomitoli') + '<small>' + weavePrice(w) + ' carlini</small></button><button class="lmskip" data-lm="skip" data-id="' + o.id + '" aria-label="Cambia cliente">↻</button></div></div>';
  }).join('') + '</div>';
  h += '<div class="olgames shtabs lmtabs" role="tablist">' + tab('fila', 'Filatoio', lanaTot || '') + tab('tingi', 'Tintoria', L.gom.b >= 3 ? '✓' : '') + tab('corredo', 'Corredo') + '</div>';
  if (loomTab === 'fila') {
    h += '<p class="shp-p">Ogni matassa diventa 3 gomitoli. Se fili tu la ruota con il ritmo giusto, ne escono 4.</p><div class="lmspin">' +
      ['b', 'g', 'n'].map((k) => '<div class="lmrow"><span>' + yarnDot(k) + 'Lana ' + LANAN[k] + ' <b>' + S.lana[k] + '</b></span><button class="btn small take" data-lm="spin" data-k="' + k + '"' + (S.lana[k] ? '' : ' disabled') + '>Fila (4)</button></div>').join('') +
      '</div><button class="btn small lmall" data-lm="spinall"' + (lanaTot ? '' : ' disabled') + '>Fila tutto in fretta · 3 gomitoli a matassa</button>' +
      (lanaTot ? '' : '<p class="shp-p">Non hai lana: tosa le pecore e torna qui.</p>');
  }
  if (loomTab === 'tingi') {
    h += '<p class="shp-p">Tingi i gomitoli bianchi con le piante, 3 alla volta. Hai <b>' + L.gom.b + '</b> gomitoli bianchi.</p><div class="lmdye">' +
      DYES.map((k) => '<button class="lmdyeb" data-lm="dye" data-k="' + k + '"' + (L.gom.b >= 3 && C >= YARN[k].price ? '' : ' disabled') + '>' + yarnDot(k) + '<b>' + YARN[k].dye + '</b><small>' + YARN[k].n + ' · ' + YARN[k].price + ' carlini</small></button>').join('') + '</div>';
  }
  if (loomTab === 'corredo') {
    h += '<h4 class="lmh">Il corredo · ' + WEAVES.filter((w) => L.made[w.id]).length + '/' + WEAVES.length + '</h4><div class="lmalbum">' + WEAVES.map((w) => { const n = L.made[w.id] || 0, lock = L.total < w.need; return '<div class="lmcard' + (n ? '' : ' unseen') + '">' + (lock ? '<span class="lmlk">🔒</span>' : weaveSVG(w.rows, 54)) + '<b>' + w.n + '</b><small>' + (lock ? 'Dopo ' + w.need + ' lavori' : n ? 'tessuto ' + n + (n === 1 ? ' volta' : ' volte') : 'da tessere') + '</small></div>'; }).join('') + '</div>';
    h += '<h4 class="lmh">Obiettivi</h4><div class="mgoals">' + LOOM_GOALS.map((g) => { const [a, b] = g.prog(L), done = a >= b; return '<div class="mgoal' + (done ? ' done' : '') + '"><img src="' + AVIMG[g.icon] + '" alt=""><span><b>' + g.name + '</b><small>' + g.need + '</small>' + (done ? '' : '<i class="pbar"><b style="width:' + Math.round(a / b * 100) + '%"></b></i>') + '</span><em>' + (done ? '✓' : a + '/' + b) + '</em></div>'; }).join('') + '</div>';
  }
  box.innerHTML = h;
  renderRes();
}
const LOOM_GOALS = [
  { id: 'l1', name: 'Il primo filo', need: 'Tessi il tuo primo lavoro', icon: 'tessitrice', prog: (L) => [Math.min(L.total, 1), 1] },
  { id: 'lperf', name: 'Mani d’oro', need: 'Tessi un lavoro senza nessun errore', icon: 'rammendatrice', prog: (L) => [Math.min(L.perfect, 1), 1] },
  { id: 'lspin', name: 'La ruota gira', need: 'Fila 60 gomitoli', icon: 'tessitrice', prog: (L) => [Math.min(L.spun, 60), 60] },
  { id: 'ltap', name: 'Tappeto della Sila', need: 'Tessi un tappeto di San Giovanni in Fiore', icon: 'pastore', prog: (L) => [L.made.tappeto ? 1 : 0, 1] },
  { id: 'lcorr', name: 'Il corredo completo', need: 'Tessi tutti e cinque i lavori', icon: 'tessitrice', prog: (L) => [WEAVES.filter((w) => L.made[w.id]).length, WEAVES.length] },
  { id: 'l25', name: 'Maestra tessitrice', need: 'Tessi 25 lavori', icon: 'rammendatrice', prog: (L) => [Math.min(L.total, 25), 25] },
];

/* ---------- il filatoio: tieni la ruota nel ritmo giusto ---------- */
function spinGame(k) {
  const S = sheepState(); if (!S.lana[k]) return;
  overlay('<h2>Il filatoio</h2><p>Tieni premuto per far girare la ruota: la lancetta deve restare nel <b>verde</b>. Se vai troppo piano il filo si spezza, troppo forte si ingarbuglia.</p>' +
    '<div class="spwheel"><svg viewBox="0 0 120 120" id="spW" aria-hidden="true"><circle cx="60" cy="60" r="52" fill="none" stroke="#6B4A2E" stroke-width="6"/><circle cx="60" cy="60" r="8" fill="#6B4A2E"/>' + [0, 1, 2, 3, 4, 5].map((i) => '<path d="M60 60 L' + (60 + 50 * Math.cos(i * Math.PI / 3)).toFixed(1) + ' ' + (60 + 50 * Math.sin(i * Math.PI / 3)).toFixed(1) + '" stroke="#8A6040" stroke-width="4"/>').join('') + '</svg><div class="spyarn" style="--yc:' + YARN[k].c + '"><i id="spY"></i></div></div>' +
    '<div class="spmeter"><div class="spzone"></div><i id="spN"></i></div><div class="spprog"><i id="spP"></i></div><p class="spmsg" id="spMsg">Pronto?</p>' +
    '<button class="btn take spbig" id="spGo">Tieni premuto per filare</button><button class="btn alt" id="spNo">Lascia stare</button>');
  const st = { v: 0, p: 0, inZ: 0, t: 0, hold: false, last: performance.now(), over: false, rot: 0 };
  const btn = $('spGo');
  const down = (e) => { e.preventDefault(); st.hold = true; };
  const up = () => { st.hold = false; };
  btn.addEventListener('pointerdown', down); document.addEventListener('pointerup', up); document.addEventListener('pointercancel', up);
  $('spNo').onclick = () => { st.over = true; cleanup(); $('layer').innerHTML = ''; };
  const cleanup = () => { document.removeEventListener('pointerup', up); document.removeEventListener('pointercancel', up); };
  const finish = (good) => {
    st.over = true; cleanup();
    const L = loomState(), n = good ? 4 : 3;
    S.lana[k]--; L.gom[k] += n; L.spun += n; gainXp(good ? 4 : 2); save();
    fx(good ? 'big' : 'take');
    overlay('<h2>' + (good ? 'Filo perfetto!' : 'Filato!') + '</h2><p>Dalla matassa ' + LANAN[k] + ' sono usciti <b>' + n + ' gomitoli</b>' + (good ? ': la tessitrice è contenta!' : '. Con un ritmo più regolare ne escono 4.') + '</p><div class="lmgom big">' + yarnDot(k, '+' + n) + '</div>' +
      (S.lana[k] ? '<button class="btn take" id="spAgain">Fila un’altra matassa ' + LANAN[k] + ' (' + S.lana[k] + ')</button>' : '') + '<button class="btn alt" id="spOk">Fatto</button>');
    if ($('spAgain')) $('spAgain').onclick = () => spinGame(k);
    $('spOk').onclick = () => { $('layer').innerHTML = ''; renderLoom(); };
  };
  const loop = (now) => {
    if (st.over || !$('spN')) return;
    const dt = Math.min(0.05, (now - st.last) / 1000); st.last = now; st.t += dt;
    st.v += (st.hold ? 0.9 : -0.75) * dt; st.v = Math.max(0, Math.min(1, st.v));
    const inZ = st.v >= 0.45 && st.v <= 0.75;
    if (inZ) { st.p += dt / 3; st.inZ += dt; }
    st.rot += st.v * 900 * dt;
    $('spN').style.left = (st.v * 100) + '%'; $('spN').className = inZ ? 'ok' : st.v > 0.75 ? 'hi' : '';
    $('spP').style.width = Math.min(100, st.p * 100) + '%';
    $('spW').style.transform = 'rotate(' + st.rot + 'deg)';
    $('spY').style.transform = 'scale(' + (0.6 + Math.min(1, st.p) * 0.5) + ')';
    $('spMsg').textContent = !st.t || st.v < 0.05 ? 'Gira la ruota!' : inZ ? 'Così! Continua…' : st.v > 0.75 ? 'Troppo forte, si ingarbuglia!' : 'Più veloce, sennò si spezza!';
    if (st.p >= 1) { finish(st.inZ / st.t >= 0.62); return; }
    if (st.t > 9) { finish(false); return; }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

/* ---------- il telaio: tessi riga per riga seguendo il disegno ---------- */
function startWeave(oid) {
  const L = loomState(), o = L.orders.find((x) => x.id === oid); if (!o) return;
  const w = WEAVES.find((x) => x.id === o.w), need = weaveNeed(w);
  if (!Object.keys(need).every((k) => L.gom[k] >= need[k])) return;
  for (const k in need) L.gom[k] -= need[k];
  save();
  const colors = [...new Set(w.rows.join(''))];
  LM = { o, w, need, row: w.rows.length - 1, grid: w.rows.map((r) => '.'.repeat(r.length).split('')), errors: 0, colors, beat: 0 };
  loomSel = colors[0];
  fx('card'); renderLoom();
}
function renderWeave() {
  const box = $('loomBox'), { w, grid, row } = LM, wd = w.rows[0].length, h = w.rows.length;
  const done = row < 0;
  let s = '<div class="wvtop"><div class="wvpat"><small>Il disegno</small>' + weaveSVG(w.rows, 92) + '</div><div class="wvinfo"><b>' + w.n + '</b><small>Per ' + whoN(LM.o.who) + ' · riga ' + Math.min(h, h - row) + ' di ' + h + '</small><small>Errori: <b>' + LM.errors + '</b></small></div></div>';
  s += '<div class="wvloom" style="--w:' + wd + '"><div class="wvbeam"></div><div class="wvgrid" id="wvGrid">';
  for (let y = 0; y < h; y++) {
    s += '<div class="wvrow' + (y === row ? ' cur' : y > row ? ' woven' : '') + '" data-y="' + y + '">';
    for (let x = 0; x < wd; x++) {
      const ch = grid[y][x], fill = ch !== '.' ? ' style="--yc:' + YARN[ch].c + '"' : '';
      s += '<button class="wvcell' + (ch !== '.' ? ' f' : '') + (y > row && ch !== w.rows[y][x] ? ' bad' : '') + '" data-x="' + x + '" data-y="' + y + '"' + fill + (y === row ? '' : ' tabindex="-1"') + ' aria-label="Riga ' + (y + 1) + ' colonna ' + (x + 1) + '"></button>';
    }
    s += (y === row ? '<span class="wvshuttle" aria-hidden="true"></span>' : '') + '</div>';
  }
  s += '</div><div class="wvbeam bot"></div></div>';
  if (!done) {
    s += '<div class="wvpal">' + LM.colors.map((k) => '<button class="wvcol' + (loomSel === k ? ' on' : '') + '" data-lm="col" data-k="' + k + '" style="--yc:' + YARN[k].c + '" aria-label="Filo ' + YARN[k].n + '"></button>').join('') + '<button class="btn small ghost" data-lm="fillrow">Tutta la riga</button></div>' +
      '<p class="shp-p">Scegli il filo, poi tocca o trascina sulle caselle della riga con la navetta. Quando la riga è uguale al disegno, batti il pettine.</p>' +
      '<button class="btn take wvbeat" data-lm="beat"' + (grid[row].includes('.') ? ' disabled' : '') + '>Batti il pettine ▲</button><button class="btn ghost small" data-lm="quit">Smetti (riprendi i gomitoli)</button>';
  }
  box.innerHTML = s;
}
function paintCell(x, y) {
  if (!LM || y !== LM.row || LM.grid[y][x] === loomSel) return;
  LM.grid[y][x] = loomSel;
  const c = document.querySelector('.wvcell[data-x="' + x + '"][data-y="' + y + '"]');
  if (c) { c.classList.add('f'); c.style.setProperty('--yc', YARN[loomSel].c); c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); }
  const b = document.querySelector('[data-lm="beat"]'); if (b) b.disabled = LM.grid[LM.row].includes('.');
}
function beatRow() {
  const { w, grid } = LM, y = LM.row;
  if (grid[y].includes('.')) return;
  const bad = grid[y].reduce((t, ch, x) => t + (ch !== w.rows[y][x] ? 1 : 0), 0);
  LM.errors += bad;
  fx(bad ? 'sad' : 'card');
  const r = document.querySelector('.wvrow.cur'); if (r) { r.classList.add('beaten'); }
  if (bad) flash(bad === 1 ? 'Un filo sbagliato!' : bad + ' fili sbagliati!');
  setTimeout(() => { LM.row--; if (LM.row < 0) weaveDone(); else renderWeave(); }, 260);
}
function weaveDone() {
  const L = loomState(), { w, o } = LM, cells = w.rows.join('').length;
  const acc = 1 - LM.errors / cells, stars = acc >= 1 ? 3 : acc >= 0.9 ? 2 : 1;
  const before = new Set(LOOM_GOALS.filter((g) => { const [a, b] = g.prog(L); return a >= b; }).map((g) => g.id));
  const v = Math.round(weavePrice(w) * [0, 0.75, 1, 1.25][stars]);
  L.total++; L.made[w.id] = (L.made[w.id] || 0) + 1; if (stars === 3) L.perfect++;
  L.orders = L.orders.filter((x) => x.id !== o.id);
  eco().carlini += v;
  const xp = 8 + WEAVES.indexOf(w) * 6 + stars * 3; gainXp(xp);
  const fresh = LOOM_GOALS.filter((g) => { const [a, b] = g.prog(L); return a >= b && !before.has(g.id); });
  if (fresh.length) gainXp(25 * fresh.length);
  let chest = '';
  const wi = WEAVES.indexOf(w);
  if (wi >= 3 && stars >= 2 && Math.random() < (stars === 3 ? 0.7 : 0.35)) chest = pescaChest(wi + 1).replace('Dentro la rete c’era', 'Per ringraziarti ti regalano');
  const unlocked = WEAVES.filter((x) => x.need === L.total);
  loomState(); save();
  if (typeof track === 'function') track('weave_done', { item: w.id, stars });
  const woven = LM.grid.map((r) => r.join(''));
  LM = null;
  fx('big'); if (stars === 3) say('bella', 0);
  overlay('<div class="pcatch"><div class="pcfish">' + weaveSVG(woven, 150) + '</div><h2>' + w.n + '!</h2><p class="pcstars">' + '★'.repeat(stars) + '☆'.repeat(3 - stars) + '</p><p>' + (stars === 3 ? 'Nemmeno un filo fuori posto: ' : stars === 2 ? 'Quasi perfetto: ' : 'Qualche filo storto, ma ') + whoN(o.who).replace(/^./, (c) => c.toUpperCase()) + ' è content' + (/^la /.test(whoN(o.who)) ? 'a' : 'o') + '. ' + w.f + '</p>' +
    '<div class="gain"><div class="xp">+' + v + ' carlini · +' + xp + ' XP</div>' + chest + (unlocked.length ? '<div class="unl"><div>Nuovo lavoro: ' + unlocked.map((x) => x.n).join(', ') + '</div></div>' : '') +
    (fresh.length ? '<div class="unl">' + fresh.map((g) => '<div><img src="' + AVIMG[g.icon] + '" alt="">Obiettivo: ' + g.name + '</div>').join('') + '</div>' : '') + '</div></div><button class="btn" id="wvOk">Torna al telaio</button>');
  $('wvOk').onclick = () => { $('layer').innerHTML = ''; renderLoom(); renderRes(); };
}

/* ---------- tocchi ---------- */
let wvDrag = false;
function wvAt(e) { const el = document.elementFromPoint(e.clientX, e.clientY); return el && el.closest('.wvcell'); }
document.addEventListener('pointerdown', (e) => { const c = e.target.closest && e.target.closest('#loomBox .wvcell'); if (!c || !LM) return; wvDrag = true; e.preventDefault(); paintCell(+c.dataset.x, +c.dataset.y); });
document.addEventListener('pointermove', (e) => { if (!wvDrag || !LM) return; const c = wvAt(e); if (c) paintCell(+c.dataset.x, +c.dataset.y); });
document.addEventListener('pointerup', () => { wvDrag = false; });
function loomClick(e) {
  const tb = e.target.closest('[data-lmtab]'); if (tb) { loomTab = tb.dataset.lmtab; renderLoom(); return; }
  const b = e.target.closest('[data-lm]'); if (!b || b.disabled) return;
  const a = b.dataset.lm, L = loomState(), S = sheepState(), E = eco();
  if (a === 'spin') { spinGame(b.dataset.k); return; }
  if (a === 'spinall') { let n = 0; for (const k of ['b', 'g', 'n']) { n += S.lana[k]; L.gom[k] += S.lana[k] * 3; L.spun += S.lana[k] * 3; S.lana[k] = 0; } gainXp(n); fx('take'); flash('+' + n * 3 + ' gomitoli'); }
  if (a === 'dye') { const k = b.dataset.k; if (L.gom.b >= 3 && E.carlini >= YARN[k].price) { L.gom.b -= 3; L.gom[k] += 3; E.carlini -= YARN[k].price; fx('card'); flash('+3 gomitoli ' + YARN[k].n); } }
  if (a === 'skip') { const i = L.orders.findIndex((x) => x.id === b.dataset.id); if (i >= 0) L.orders.splice(i, 1); loomState(); }
  if (a === 'weave') { startWeave(b.dataset.id); return; }
  if (a === 'col') { loomSel = b.dataset.k; document.querySelectorAll('.wvcol').forEach((x) => x.classList.toggle('on', x.dataset.k === loomSel)); return; }
  if (a === 'fillrow') { if (LM) for (let x = 0; x < LM.grid[LM.row].length; x++) paintCell(x, LM.row); return; }
  if (a === 'beat') { beatRow(); return; }
  if (a === 'quit') { if (LM) { for (const k in LM.need) L.gom[k] += LM.need[k]; LM = null; } }
  save(); renderLoom(); renderRes();
}

/* ---------- aggancio al Paese ---------- */
(() => {
  const tabs = $('paeseTabs');
  if (tabs && !tabs.querySelector('[data-pt="loom"]')) {
    const b = document.createElement('button'); b.setAttribute('role', 'tab'); b.dataset.pt = 'loom'; b.setAttribute('aria-selected', 'false'); b.textContent = 'Telaio';
    tabs.appendChild(b);
    const d = document.createElement('div'); d.id = 'pLoom'; d.hidden = true;
    d.innerHTML = '<div id="loomBox"></div>';
    $('pHelp').after(d);
    d.addEventListener('click', loomClick);
  }
  PAESE_RULES.loom = 'telaio';
  const oldRP = renderPaese;
  renderPaese = function () {
    oldRP.apply(this, arguments);
    $('pLoom').hidden = paeseTab !== 'loom';
    if (paeseTab === 'loom') renderLoom();
  };
  // dalle pecore: quando il recinto è al massimo, un invito ad andare dalla tessitrice
  const oldRS = renderSheep;
  renderSheep = function (soft) {
    oldRS.apply(this, arguments);
    const box = $('sheepBox');
    if (box && loomUnlocked() && !box.querySelector('.lminvite')) {
      const S = sheepState(), tot = S.lana.b + S.lana.g + S.lana.n;
      const bar = box.querySelector('.shbar'); (bar ? bar : box).insertAdjacentHTML(bar ? 'afterend' : 'afterbegin', '<button class="lminvite" data-loomgo="1"><img src="' + AVIMG.tessitrice + '" alt=""><span><b>Porta la lana alla tessitrice</b><small>' + (tot ? 'Hai ' + tot + ' matasse: al telaio valgono molto di più!' : 'Fila, tingi e tessi la lana delle tue pecore.') + '</small></span><em>›</em></button>');
    }
  };
  $('sheepBox').addEventListener('click', (e) => { if (e.target.closest('[data-loomgo]')) { paeseTab = 'loom'; renderPaese(); } });
})();

/* ---------- le schede del Paese: piastrelle colorate con icona e avvisi ---------- */
const PT_ICON = {
  tree: () => '<span class="pti-bergo">' + BERGO_SVG + '</span>',
  sal: () => itemSVG(7),
  sheep: () => sheepSVG({ id: 'pt', c: 'b', m: false, born: 0, wool: 100, preg: null, fedUntil: Infinity }, Date.now(), 44),
  loom: () => '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="22" cy="26" r="15" fill="#2F5D8A" stroke="#1A1A1A" stroke-width="2.2"/><path d="M10 20 Q22 14 34 22 M8 28 Q22 22 36 30 M12 35 Q22 30 32 37 M16 13 Q20 26 18 40 M26 12 Q30 26 26 41" fill="none" stroke="#8FB6DE" stroke-width="1.8"/><path d="M34 34 Q42 36 44 44" fill="none" stroke="#2F5D8A" stroke-width="2.4" stroke-linecap="round"/><path d="M30 6 L44 20" stroke="#C9A45A" stroke-width="3" stroke-linecap="round"/><circle cx="44" cy="20" r="1.8" fill="#1A1A1A"/></svg>',
  help: () => '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="7" y="20" width="34" height="22" fill="#E9DEC6" stroke="#1A1A1A" stroke-width="2"/><rect x="19" y="28" width="10" height="14" fill="#6B4424" stroke="#1A1A1A" stroke-width="1.6"/><path d="M4 20 L9 8 H39 L44 20 Z" fill="#C8562E" stroke="#1A1A1A" stroke-width="2" stroke-linejoin="round"/><path d="M14 8 L12 20 M24 8 V20 M34 8 L36 20" stroke="#F4E1C8" stroke-width="3"/><rect x="10" y="25" width="6" height="6" fill="#8FC0E0" stroke="#1A1A1A" stroke-width="1.4"/><rect x="32" y="25" width="6" height="6" fill="#8FC0E0" stroke="#1A1A1A" stroke-width="1.4"/></svg>',
};
const PT_LABEL = { tree: 'Albero', sal: 'Salumi\u00ADficio', sheep: 'Pecore', loom: 'Telaio', help: 'Botteghe' };
function ptBadge(k) {
  try {
    const E = eco(), now = Date.now();
    if (k === 'tree') return treeStage(E.tree.g) === 6 ? '!' : '';
    if (k === 'sal') { const M = MG(); const n = M.orders.filter((o) => canFill(M, o)).length + (typeof catState === 'function' && catState().until && M.cells.includes(MAXL) ? 1 : 0); return n || ''; }
    if (k === 'sheep') { const S = sheepState(); if (S.wolf) return '!'; const n = S.flock.filter((s) => isAdult(s, now) && s.wool >= 100).length; return n || (S.hay && S.flock.some((s) => !isFed(s, now)) ? '!' : ''); }
    if (k === 'loom') { if (!loomUnlocked()) return ''; const L = loomState(); return L.orders.filter((o) => { const need = weaveNeed(WEAVES.find((w) => w.id === o.w)); return Object.keys(need).every((c) => L.gom[c] >= need[c]); }).length || ''; }
    if (k === 'help') return (typeof pastoreStock === 'function' && pastoreStock() > 0) || Object.keys(E.shops || {}).some((s) => { try { return shopStock(s) > 0; } catch (e) { return false; } }) ? '!' : '';
  } catch (e) { return ''; }
  return '';
}
function decoratePaeseTabs() {
  const tabs = $('paeseTabs'); if (!tabs) return;
  tabs.classList.add('ptiles');
  const loom = tabs.querySelector('[data-pt="loom"]'), help = tabs.querySelector('[data-pt="help"]');
  if (loom && help && loom.nextElementSibling !== help) tabs.insertBefore(loom, help);
  for (const b of tabs.querySelectorAll('[data-pt]')) {
    const k = b.dataset.pt, lock = k === 'loom' && !loomUnlocked(), badge = ptBadge(k);
    b.className = 'ptile pt-' + k + (lock ? ' locked' : '');
    if (!b.querySelector('.pti')) b.innerHTML = '<span class="pti">' + PT_ICON[k]() + '</span><span class="ptl">' + PT_LABEL[k] + '</span><i class="ptb" hidden></i>';
    const bb = b.querySelector('.ptb'); bb.hidden = !badge || lock; bb.textContent = badge;
    b.querySelector('.ptl').textContent = PT_LABEL[k] + (lock ? ' 🔒' : '');
  }
}
(() => {
  const oldRP2 = renderPaese;
  renderPaese = function () { oldRP2.apply(this, arguments); decoratePaeseTabs(); };
  setInterval(() => { if (view === 'vPaese') decoratePaeseTabs(); }, 2000);
})();
