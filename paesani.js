/* ================= I PAESANI: la mappa della Calabria con i giocatori di ogni paese ================= */
const PZ_BY = {}; PZD.items.forEach((c) => { PZ_BY[c.id] = c; });
PZD.fraz.forEach((f) => { f.p = PZ_BY[f.of].p; PZ_BY[f.id] = f; });
const PROV_N = { CS: 'Cosenza', CZ: 'Catanzaro', KR: 'Crotone', VV: 'Vibo Valentia', RC: 'Reggio Calabria' };
const pzNorm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’'`]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
PZD.items.forEach((c) => { c.k = pzNorm(c.n); }); PZD.fraz.forEach((f) => { f.k = pzNorm(f.n); });
const pzName = (id) => { const x = PZ_BY[id]; if (!x) return ''; return x.of ? x.n + ' (' + PZ_BY[x.of].n + ')' : x.n; };
const PZS = { stats: {}, at: 0, loading: false, tab: 'map', sel: null, s: 1, tx: 0, ty: 0, err: '' };

/* ---------- server: contatori per paese (solo numeri, mai chi è di dove) ---------- */
const pzOnline = () => !!(window.FB && typeof ONLINE_OK === 'function' && ONLINE_OK());
async function pzBump(id, field, by) {
  if (!id || !pzOnline()) return false;
  if (!OL.ready) { try { await withTimeout(Promise.resolve(olInit()), 8000); } catch (e) { /* niente */ } }
  if (!OL.ready) return false;
  try { await withTimeout(FB.setDoc(FB.doc(OL.db, 'paesi', id), { [field]: FB.increment(by) }, { merge: true }), 10000); return true; } catch (e) { return false; }
}
async function pzSync() {
  const q = P.paeseSync; if (!q || PZS.syncing) return;
  PZS.syncing = true;
  let ok = true;
  if (q.rem) ok = await pzBump(q.rem, 'n', -1);
  if (ok && q.add) { ok = await pzBump(q.add, 'n', 1); if (ok) q.rem = null; }
  if (ok) { P.paeseSync = null; save(); PZS.at = 0; }
  PZS.syncing = false;
}
function paeseSet(id) {
  const old = P.paeseCounted || null;
  P.paese = id; P.paeseAsked = true;
  if (old !== id) { P.paeseSync = { add: id, rem: (P.paeseSync && P.paeseSync.rem !== undefined && !P.paeseCounted) ? P.paeseSync.rem : old }; P.paeseCounted = id; }
  save(); pzSync();
  if (typeof track === 'function') track('paese_set', { prov: id ? PZ_BY[id].p : 'none' });
}
async function pzLoad(force) {
  if (!pzOnline()) return;
  if (PZS.loading || (!force && Date.now() - PZS.at < 5 * MIN)) return;
  PZS.loading = true; PZS.err = '';
  try {
    if (!OL.ready) await withTimeout(Promise.resolve(olInit()), 8000);
    const snap = await withTimeout(FB.getDocs(FB.collection(OL.db, 'paesi')), 12000);
    const st = {}; snap.docs.forEach((d) => { const v = d.data(); st[d.id] = { n: Math.max(0, v.n || 0), w: Math.max(0, v.w || 0) }; });
    PZS.stats = st; PZS.at = Date.now();
  } catch (e) { PZS.err = 'Classifica non disponibile: controlla la connessione.'; }
  PZS.loading = false;
  if (view === 'vPaesani') renderPaesani();
}
const pzN = (id) => (PZS.stats[id] ? PZS.stats[id].n : 0);
const pzW = (id) => (PZS.stats[id] ? PZS.stats[id].w : 0);
/* per le proporzioni: le frazioni contano insieme al loro comune */
function pzComuneTot(c) { let n = pzN(c.id); PZD.fraz.forEach((f) => { if (f.of === c.id) n += pzN(f.id); }); return n; }

/* ---------- scegliere il paese (alla prima apertura e dal profilo) ---------- */
function paeseWindow(opts, done) {
  overlay('<div class="nickwin"><div class="nicknd">' + NDUJA_SVG + '</div><div class="nickbub"><b>Signor ’Nduja</b><span>' + tr2('E di quali paisi si? Mi servi pe’ a classifica d’i paisi: vidimu quali paisi avi chiù jocaturi e chiù vittorie!', 'E di che paese sei? Serve per la classifica dei paesi: vediamo quale paese ha più giocatori e più vittorie!') + '</span></div></div>' +
    '<p class="pznote">Non usiamo la posizione del telefono: scegli tu il paese dall’elenco, e sul server conta solo il numero di giocatori di ogni paese, mai chi sei. Puoi cambiarlo quando vuoi dal Profilo.</p>' +
    '<label class="pzlab" for="pzIn">Cerca il tuo paese</label><input id="pzIn" class="pzin" placeholder="Es. Tropea, Scilla, Pizzo…" autocomplete="off" spellcheck="false"><div class="pzres" id="pzRes"></div>' +
    '<label class="pzfuori"><input type="checkbox" id="pzFuori"' + (P.paeseFuori ? ' checked' : '') + '> Vivo fuori dalla Calabria, ma questo è il mio paese</label>' +
    '<button class="btn alt" id="pzSkip">' + (opts.change ? 'Annulla' : 'Salta, lo scelgo dopo') + '</button>');
  const inp = $('pzIn'), res = $('pzRes');
  const draw = () => {
    const q = pzNorm(inp.value);
    if (q.length < 2) { res.innerHTML = '<small class="pzhint">Scrivi almeno due lettere. Ci sono tutti i 404 comuni e anche le frazioni più grandi del loro comune.</small>'; return; }
    const all = PZD.items.concat(PZD.fraz);
    const hit = all.filter((x) => x.k.startsWith(q)).concat(all.filter((x) => !x.k.startsWith(q) && x.k.includes(q))).slice(0, 8);
    res.innerHTML = hit.length ? hit.map((x) => '<button class="pzhit" data-pz="' + x.id + '"><b>' + esc(x.n) + '</b><small>' + (x.of ? (x.t || 'frazione') + ' di ' + esc(PZ_BY[x.of].n) + ' · ' : '') + PROV_N[x.p] + '</small></button>').join('') : '<small class="pzhint">Nessun paese trovato: prova a scriverlo in un altro modo.</small>';
  };
  inp.oninput = draw; draw();
  setTimeout(() => { try { inp.focus(); } catch (e) { /* niente */ } }, 80);
  res.onclick = (e) => {
    const b = e.target.closest('[data-pz]'); if (!b) return;
    P.paeseFuori = $('pzFuori').checked;
    paeseSet(b.dataset.pz);
    $('layer').innerHTML = ''; fx('take'); flash(tr2('Forza ', 'Forza ') + PZ_BY[b.dataset.pz].n + '!');
    if (view === 'vPaesani') renderPaesani();
    if (done) done();
  };
  $('pzSkip').onclick = () => { if (!opts.change) { P.paeseAsked = true; save(); } $('layer').innerHTML = ''; if (done) done(); };
}
function paeseFirst(cb) { if (P.paeseAsked) return false; paeseWindow({}, cb); return true; }

/* ---------- la schermata ---------- */
function pzColor(n, max) {
  if (!n) return '#EFE6D2';
  const k = Math.min(1, Math.log(1 + n) / Math.log(1 + Math.max(3, max)));
  const a = [246, 210, 140], b = [192, 57, 43];
  return 'rgb(' + a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(',') + ')';
}
function pzMapSVG() {
  const max = Math.max(0, ...PZD.items.map((c) => pzN(c.id)));
  let s = '<svg class="pzsvg" id="pzSvg" viewBox="0 0 540 950" aria-label="Mappa dei paesi della Calabria"><rect x="-2000" y="-2000" width="5000" height="5000" fill="#8FCBE6"/><g id="pzG">';
  s += PZD.items.map((c) => '<path class="pzc' + (P.paese === c.id || (PZ_BY[P.paese] && PZ_BY[P.paese].of === c.id) ? ' mine' : '') + (PZS.sel === c.id ? ' sel' : '') + '" data-c="' + c.id + '" d="' + c.d + '" fill="' + pzColor(pzN(c.id), max) + '"/>').join('');
  s += PZD.prov.map((p) => '<path class="pzp" d="' + p.d + '"/>').join('');
  s += PZD.fraz.map((f) => '<circle class="pzf' + (P.paese === f.id ? ' mine' : '') + '" data-c="' + f.id + '" cx="' + f.x + '" cy="' + f.y + '" r="3.2"/>').join('');
  s += PZD.items.map((c) => '<text class="pzt' + (c.pop >= 9000 ? ' big' : c.pop >= 3000 ? ' mid' : '') + '" x="' + c.x + '" y="' + c.y + '">' + esc(c.n) + '</text>').join('');
  s += PZD.fraz.map((f) => '<text class="pzt fr" x="' + (f.x + 5) + '" y="' + (f.y + 2) + '">' + esc(f.n) + '</text>').join('');
  s += [['CS', 230, 230], ['KR', 455, 400], ['CZ', 300, 560], ['VV', 140, 660], ['RC', 120, 820]].map(([p, x, y]) => '<text class="pzprov" x="' + x + '" y="' + y + '">' + PROV_N[p] + '</text>').join('');
  if (P.paese && PZ_BY[P.paese]) { const m = PZ_BY[P.paese]; s += '<g class="pzpin" transform="translate(' + m.x + ' ' + m.y + ')"><path d="M0 0 C-7 -10 -9 -14 -9 -18 A9 9 0 1 1 9 -18 C9 -14 7 -10 0 0Z" fill="#E5B83F" stroke="#1A1A1A" stroke-width="1.5"/><circle cx="0" cy="-18" r="3.5" fill="#1A1A1A"/></g>'; }
  return s + '</g></svg>';
}
function pzRank(kind) {
  if (kind === 'n') return PZD.items.concat(PZD.fraz).map((x) => ({ id: x.id, v: pzN(x.id) })).filter((x) => x.v > 0).sort((a, b) => b.v - a.v);
  if (kind === 'w') return PZD.items.concat(PZD.fraz).map((x) => ({ id: x.id, v: pzW(x.id) })).filter((x) => x.v > 0).sort((a, b) => b.v - a.v);
  return PZD.items.map((c) => { const n = pzComuneTot(c); return { id: c.id, v: n ? n / Math.max(50, c.pop) * 1000 : 0, n }; }).filter((x) => x.n > 0).sort((a, b) => b.v - a.v);
}
function pzInfo(id) {
  const x = PZ_BY[id]; if (!x) return '';
  const rn = pzRank('n').findIndex((r) => r.id === id), mine = P.paese === id;
  const fr = x.of ? [] : PZD.fraz.filter((f) => f.of === id);
  return '<div class="pzinfo"><button class="pzx" data-pzx="1" aria-label="Chiudi">×</button><b>' + esc(x.n) + '</b><small>' + (x.of ? 'Frazione di ' + esc(PZ_BY[x.of].n) + ' · ' : '') + 'Provincia di ' + PROV_N[x.p] + (x.pop ? ' · ' + x.pop.toLocaleString('it-IT') + ' abitanti' : '') + '</small>' +
    '<div class="pznums"><span><b>' + pzN(id) + '</b>giocatori</span><span><b>' + pzW(id) + '</b>vittorie online</span><span><b>' + (rn >= 0 ? rn + 1 + 'º' : '–') + '</b>in classifica</span></div>' +
    (fr.length ? '<div class="pzfr">' + fr.map((f) => '<button data-pzsel="' + f.id + '">' + esc(f.n) + ' · ' + pzN(f.id) + '</button>').join('') + '</div>' : '') +
    (mine ? '<em class="pzmine">★ È il tuo paese</em>' : '<button class="btn small take" data-pzset="' + id + '">È il mio paese</button>') + '</div>';
}
const PROV_C = { CS: '#3E7CB1', CZ: '#C0392B', KR: '#D68A1E', VV: '#2E8B57', RC: '#7A4E9E' };
function pzMini(id) {
  const m = id && PZ_BY[id];
  return '<svg viewBox="20 20 500 910" class="pzmini" aria-hidden="true">' + PZD.prov.map((p) => '<path d="' + p.d + '" class="' + (m && m.p === p.p ? 'on' : '') + '"/>').join('') +
    (m ? '<circle cx="' + m.x + '" cy="' + m.y + '" r="34" class="pzmring"/><circle cx="' + m.x + '" cy="' + m.y + '" r="15" class="pzmdot"/>' : '') + '</svg>';
}
function pzProvTag(id) { const p = PZ_BY[id] && PZ_BY[id].p; return p ? '<i class="pzpt" style="--pc:' + PROV_C[p] + '">' + PROV_N[p] + '</i>' : ''; }
function pzPodium(rows, fmt, unit) {
  const me = rows.findIndex((x) => x.id === P.paese || (rows.kind === 'p' && PZ_BY[P.paese] && PZ_BY[P.paese].of === x.id));
  if (!rows.length) return '<div class="pzempty"><span>🏁</span><p>' + (pzOnline() ? 'Ancora nessun paese in classifica: gioca e porta il tuo in cima!' : 'Le classifiche si vedono nell’app sul telefono.') + '</p></div>';
  const top = rows.slice(0, 3), order = [1, 0, 2].filter((i) => top[i]);
  let h = '<div class="pzpod">' + order.map((i) => { const x = top[i]; return '<button class="pzpodc p' + (i + 1) + (i === me ? ' me' : '') + '" data-pzsel="' + x.id + '"><span class="pzmed">' + ['🥇', '🥈', '🥉'][i] + '</span><b>' + esc(pzName(x.id)) + '</b>' + pzProvTag(x.id) + '<span class="pzpv">' + fmt(x) + '<small>' + unit + '</small></span><span class="pzbase">' + (i + 1) + '</span></button>'; }).join('') + '</div>';
  const rest = rows.slice(3, 15);
  if (rest.length || me >= 15) h += '<ol class="olrank pzrank" start="4">' + rest.map((x, i) => '<li class="' + (i + 3 === me ? 'me' : '') + '" data-pzsel="' + x.id + '"><span class="pos">' + (i + 4) + '</span><span class="nm">' + esc(pzName(x.id)) + pzProvTag(x.id) + '</span><b>' + fmt(x) + '</b></li>').join('') +
    (me >= 15 ? '<li class="me" data-pzsel="' + rows[me].id + '"><span class="pos">' + (me + 1) + '</span><span class="nm">' + esc(pzName(rows[me].id)) + pzProvTag(rows[me].id) + '</span><b>' + fmt(rows[me]) + '</b></li>' : '') + '</ol>';
  return h;
}
function renderPaesani() {
  const box = $('paesaniBox'); if (!box) return;
  pzLoad();
  const my = P.paese && PZ_BY[P.paese];
  const rn = my ? pzRank('n').findIndex((r) => r.id === P.paese) : -1;
  let h = '<div class="pzhero' + (my ? '' : ' none') + '">' + pzMini(my ? P.paese : null) + '<div class="pzhtxt">' +
    (my ? '<small class="pzkick">Il mio paese' + (P.paeseFuori ? ' · fuori sede' : '') + '</small><b class="pzhname">' + esc(pzName(P.paese)) + '</b>' + pzProvTag(P.paese) +
      '<div class="pzchips"><span><b>' + pzN(P.paese) + '</b>giocatori</span><span><b>' + pzW(P.paese) + '</b>vittorie</span><span><b>' + (rn >= 0 ? rn + 1 + 'º' : '–') + '</b>posto</span></div>'
      : '<small class="pzkick">I Paesani</small><b class="pzhname">Da dove giochi?</b><p>Scegli il tuo paese e portalo in cima alla Calabria.</p>') +
    '</div><button class="btn small ' + (my ? 'ghost' : 'take') + ' pzhbtn" data-pzch="1">' + (my ? 'Cambia' : 'Scegli') + '</button></div>';
  h += '<div class="pztabs2" role="tablist">' + [['map', '🗺️', 'Mappa'], ['sfida', '⚔️', 'Sfida'], ['rank', '📊', 'Classifiche']].map(([k, ic, l]) => '<button role="tab" aria-selected="' + (PZS.tab === k) + '" data-pzt="' + k + '"><span>' + ic + '</span>' + l + '</button>').join('') + '</div>';
  if (!pzOnline()) h += '<p class="pznote">I numeri veri dei paesi arrivano dal server nell’app per Android: qui nell’anteprima la mappa è vuota.</p>';
  else if (PZS.err) h += '<p class="pznote">' + PZS.err + '</p>';
  else if (PZS.loading && !PZS.at) h += '<p class="pznote">Carico i paesi…</p>';
  if (PZS.tab === 'map') {
    h += '<div class="pzmap" id="pzMap">' + pzMapSVG() + '<div class="pzzoom"><button data-pzz="1" aria-label="Ingrandisci">+</button><button data-pzz="-1" aria-label="Rimpicciolisci">−</button><button data-pzz="0" aria-label="Tutta la Calabria">⤢</button></div>' + (PZS.sel ? pzInfo(PZS.sel) : '<div class="pzhelp">Allarga con due dita per vedere i nomi dei paesi. Tocca un paese per vedere i suoi giocatori.</div>') + '</div>' +
      '<div class="pzleg"><span>Meno giocatori</span><i></i><span>Più giocatori</span></div>';
  } else if (PZS.tab === 'sfida') {
    h += pzWkHTML(); pzWkLoad();
  } else {
    const rk = PZS.rk || 'n';
    h += '<div class="pzseg" role="tablist">' + [['n', 'Giocatori'], ['w', 'Vittorie'], ['p', 'Per abitanti']].map(([k, l]) => '<button role="tab" aria-selected="' + (rk === k) + '" data-pzrk="' + k + '">' + l + '</button>').join('') + '</div>';
    const rows = pzRank(rk); rows.kind = rk;
    if (rk === 'p') h += '<p class="pznote">Giocatori ogni mille abitanti: così anche un paesino può battere le città. Le frazioni contano insieme al loro comune.</p>';
    h += pzPodium(rows, rk === 'p' ? (x) => (Math.round(x.v * 10) / 10).toString().replace('.', ',') : (x) => x.v, rk === 'n' ? 'giocatori' : rk === 'w' ? 'vittorie' : '‰');
  }
  box.innerHTML = h;
  if (PZS.tab === 'map') pzApply();
}
/* ---------- zoom e trascinamento della mappa ---------- */
function pzApply() {
  const g = $('pzG'), svg = $('pzSvg'); if (!g || !svg) return;
  g.setAttribute('transform', 'translate(' + PZS.tx + ' ' + PZS.ty + ') scale(' + PZS.s + ')');
  svg.style.setProperty('--s', PZS.s);
  svg.classList.toggle('z2', PZS.s >= 2.2); svg.classList.toggle('z4', PZS.s >= 4);
}
function pzClamp() {
  PZS.s = Math.max(1, Math.min(10, PZS.s));
  PZS.tx = Math.min(80, Math.max(540 - 540 * PZS.s - 80, PZS.tx));
  PZS.ty = Math.min(80, Math.max(950 - 950 * PZS.s - 80, PZS.ty));
}
function pzZoomAt(f, cx, cy) { const ns = Math.max(1, Math.min(10, PZS.s * f)); const k = ns / PZS.s; PZS.tx = cx - (cx - PZS.tx) * k; PZS.ty = cy - (cy - PZS.ty) * k; PZS.s = ns; pzClamp(); pzApply(); }
function pzPt(e) { const svg = $('pzSvg'), r = svg.getBoundingClientRect(); const sc = Math.max(540 / r.width, 950 / r.height); const ox = (r.width * sc - 540) / 2, oy = (r.height * sc - 950) / 2; return { x: (e.clientX - r.left) * sc - ox, y: (e.clientY - r.top) * sc - oy }; }
const PZP = new Map(); let pzMoved = 0, pzPinch = null;
document.addEventListener('pointerdown', (e) => { if (!e.target.closest || !e.target.closest('#pzSvg')) return; PZP.set(e.pointerId, pzPt(e)); pzMoved = 0; if (PZP.size === 2) { const [a, b] = [...PZP.values()]; pzPinch = { d: Math.hypot(a.x - b.x, a.y - b.y), s: PZS.s }; } });
document.addEventListener('pointermove', (e) => {
  if (!PZP.has(e.pointerId)) return;
  const p = pzPt(e), o = PZP.get(e.pointerId);
  if (PZP.size === 1) { const dx = p.x - o.x, dy = p.y - o.y; pzMoved += Math.abs(dx) + Math.abs(dy); PZS.tx += dx; PZS.ty += dy; pzClamp(); pzApply(); PZP.set(e.pointerId, p); }
  else if (PZP.size === 2 && pzPinch) { PZP.set(e.pointerId, p); const [a, b] = [...PZP.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); pzMoved = 99; pzZoomAt((pzPinch.s * d / pzPinch.d) / PZS.s, (a.x + b.x) / 2, (a.y + b.y) / 2); }
});
const pzUp = (e) => { PZP.delete(e.pointerId); if (PZP.size < 2) pzPinch = null; };
document.addEventListener('pointerup', pzUp); document.addEventListener('pointercancel', pzUp);
document.addEventListener('wheel', (e) => { if (!e.target.closest || !e.target.closest('#pzSvg')) return; e.preventDefault(); const p = pzPt(e); pzZoomAt(e.deltaY < 0 ? 1.25 : 0.8, p.x, p.y); }, { passive: false });
function paesaniClick(e) {
  if (e.target.closest('[data-wkprize]')) { pzWkPrize(); return; }
  const t = e.target.closest('[data-pzt]'); if (t) { PZS.tab = t.dataset.pzt; renderPaesani(); return; }
  const rk = e.target.closest('[data-pzrk]'); if (rk) { PZS.rk = rk.dataset.pzrk; renderPaesani(); return; }
  if (e.target.closest('[data-pzch]')) { paeseWindow({ change: !!P.paese }); return; }
  const z = e.target.closest('[data-pzz]'); if (z) { const k = +z.dataset.pzz; if (!k) { PZS.s = 1; PZS.tx = 0; PZS.ty = 0; pzApply(); } else pzZoomAt(k > 0 ? 1.6 : 0.62, 270, 475); return; }
  if (e.target.closest('[data-pzx]')) { PZS.sel = null; renderPaesani(); return; }
  const st = e.target.closest('[data-pzset]'); if (st) { paeseSet(st.dataset.pzset); fx('take'); flash('Forza ' + PZ_BY[st.dataset.pzset].n + '!'); renderPaesani(); return; }
  const s2 = e.target.closest('[data-pzsel]'); if (s2) { PZS.sel = s2.dataset.pzsel; PZS.tab = 'map'; const x = PZ_BY[PZS.sel]; PZS.s = 4; PZS.tx = 270 - x.x * 4; PZS.ty = 380 - x.y * 4; pzClamp(); renderPaesani(); return; }
  const c = e.target.closest('[data-c]'); if (c && pzMoved < 8) { PZS.sel = c.dataset.c; renderPaesani(); }
}

/* ---------- aggancio: schermata, avventure, prima apertura, vittorie online ---------- */
(() => {
  if (!$('vPaesani')) {
    const s = document.createElement('section'); s.className = 'view'; s.id = 'vPaesani'; s.hidden = true;
    s.innerHTML = '<div class="topbar"><h2>I Paesani</h2><span class="tbr"><button class="btn ghost small" id="paesaniRules">Regole</button><button class="btn ghost small" data-go="vHome">Menu</button></span></div><div class="sheetv" id="paesaniBox"></div>';
    $('vHome').parentNode.insertBefore(s, $('vHome').nextSibling);
    s.addEventListener('click', paesaniClick);
    $('paesaniRules').addEventListener('click', () => { if (!ND.open) showNduja('paesani'); });
  }
  const oldGo = go;
  go = function (v) {
    oldGo(v);
    $('vPaesani').hidden = v !== 'vPaesani';
    if (v === 'vPaesani') { renderPaesani(); pzLoad(true); if (!ndSeen('paesani') && !ND.open) setTimeout(() => { if (view === 'vPaesani' && !ND.open) showNduja('paesani'); }, 400); }
  };
  const oldEnd = endOnline;
  endOnline = function () { const d = OL.room, won = !OL.ended && d && d.winner === (typeof myT === 'function' ? myT() : meIdx()); try { return oldEnd.apply(this, arguments); } finally { if (won && P.paese) { pzBump(P.paese, 'w', 1); pzWkBump(P.paese); } } };
  setInterval(() => { if (P.paeseSync && pzOnline() && OL.ready) pzSync(); }, 8000);
})();
/* il paese anche nel Profilo */
(() => {
  const oldRP = renderProfile;
  renderProfile = function () {
    oldRP.apply(this, arguments);
    let b = $('pzProf');
    if (!b) { b = document.createElement('div'); b.id = 'pzProf'; b.className = 'pzprof'; const anchor = $('nickIn').parentNode; anchor.parentNode.insertBefore(b, anchor.nextSibling); b.addEventListener('click', (e) => { if (e.target.closest('[data-pzch]')) paeseWindow({ change: !!P.paese }, () => renderProfile()); else if (e.target.closest('[data-pzgo]')) go('vPaesani'); }); }
    b.innerHTML = '<span><small>Il mio paese</small><b>' + (P.paese ? esc(pzName(P.paese)) : 'Non scelto') + '</b></span><button class="btn small ghost" data-pzch="1">' + (P.paese ? 'Cambia' : 'Scegli') + '</button><button class="btn small ghost" data-pzgo="1">Mappa</button>';
  };
})();
function pzSilhouette() { return '<svg viewBox="0 0 540 950" class="pzsil">' + PZD.prov.map((p) => '<path d="' + p.d + '"/>').join('') + '</svg>'; }

/* ---------- la sfida della settimana tra paesi ---------- */
const pzDay = (t) => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const wkStart = (t) => { const d = new Date(t || Date.now()); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getTime(); };
const wkId = (t) => pzDay(wkStart(t));
const PZW = { cur: { id: '', st: {}, at: 0 }, last: { id: '', st: {}, at: 0 }, loading: false };
async function pzWkBump(id) {
  if (!id || !pzOnline() || !OL.ready) return;
  try { await withTimeout(FB.setDoc(FB.doc(OL.db, 'settimane', wkId(), 'paesi', id), { w: FB.increment(1) }, { merge: true }), 10000); PZW.cur.at = 0; } catch (e) { /* niente */ }
}
async function pzWkLoad(force) {
  if (!pzOnline() || PZW.loading) return;
  const cid = wkId(), lid = wkId(wkStart() - 3 * 864e5);
  if (!force && PZW.cur.id === cid && Date.now() - PZW.cur.at < 3 * MIN) return;
  PZW.loading = true;
  try {
    if (!OL.ready) await withTimeout(Promise.resolve(olInit()), 8000);
    const get = async (wid) => { const s = await withTimeout(FB.getDocs(FB.collection(OL.db, 'settimane', wid, 'paesi')), 12000); const o = {}; s.docs.forEach((d) => { o[d.id] = Math.max(0, d.data().w || 0); }); return o; };
    PZW.cur = { id: cid, st: await get(cid), at: Date.now() };
    if (PZW.last.id !== lid) PZW.last = { id: lid, st: await get(lid), at: Date.now() };
  } catch (e) { /* niente */ }
  PZW.loading = false;
  if (view === 'vPaesani' && PZS.tab === 'sfida') renderPaesani();
}
function pzWkWinners(st) { const v = Math.max(0, ...Object.values(st)); return v > 0 ? Object.keys(st).filter((k) => st[k] === v) : []; }
function pzWkHTML() {
  const end = wkStart() + 7 * 864e5, left = end - Date.now(), dd = Math.floor(left / 864e5), hh = Math.floor((left % 864e5) / HOUR);
  const lw = PZW.last.id ? pzWkWinners(PZW.last.st) : [], mineWon = P.paese && lw.includes(P.paese), claimed = P.wkPrize === PZW.last.id;
  const r = Object.keys(PZW.cur.st).map((id) => ({ id, v: PZW.cur.st[id] })).filter((x) => PZ_BY[x.id] && x.v > 0).sort((a, b) => b.v - a.v);
  let h = '<div class="wkhead"><span class="wkcup">🏆</span><div><b>Sfida della settimana</b><small>Vince il paese con più vittorie online da lunedì a domenica. Ai suoi giocatori va un <b>baule d’oro</b>.</small></div><span class="wkleft"><b>' + (dd ? dd + 'g ' : '') + hh + 'h</b><small>alla fine</small></span></div>';
  if (lw.length) h += '<div class="wklast' + (mineWon ? ' mine' : '') + '"><span>👑</span><div><small>La settimana scorsa ha vinto</small><b>' + lw.map((id) => esc(pzName(id))).join(', ') + '</b><small>' + PZW.last.st[lw[0]] + ' vittorie</small></div>' + (mineWon ? (claimed ? '<em>Premio ritirato ✓</em>' : '<button class="btn take small" data-wkprize="1">Ritira il premio</button>') : '') + '</div>';
  h += pzPodium(r, (x) => x.v, 'vittorie');
  if (!P.paese) h += '<p class="pznote">Scegli il tuo paese per partecipare alla sfida.</p>';
  return h;
}
function pzWkPrize() {
  const lw = pzWkWinners(PZW.last.st);
  if (!P.paese || !lw.includes(P.paese) || P.wkPrize === PZW.last.id) return;
  const E = eco(); P.wkPrize = PZW.last.id;
  if (E.chests.length < SLOTS) { E.chests.push({ id: 'c' + Date.now().toString(36), grade: 'oro', start: null, end: null, sped: false }); flash('Un baule d’oro per ' + (PZ_BY[P.paese] || { n: P.paese }).n + '!'); }
  else { E.carlini += 600; flash('+600 carlini (bauli pieni)'); }
  save(); fx('big'); renderPaesani();
  if (typeof track === 'function') track('week_prize', {});
}
