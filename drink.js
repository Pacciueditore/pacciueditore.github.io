/* ================= BERGODRINK: la fabbrica delle bibite al bergamotto ================= */
const DK_ST = {
  lava: { n: 'Lava', e: '💧', miss: 'Non lavata!', extra: 'Già lavata!' },
  spremi: { n: 'Spremi', e: '🍋', miss: 'Non spremuta!', extra: 'Spremuta due volte!' },
  zucchero: { n: 'Zucchero', e: '🍬', miss: 'Senza zucchero!', extra: 'Questa va senza zucchero!' },
  gas: { n: 'Gas', e: '🫧', miss: 'Poco gas!', extra: 'Troppo gas!' },
  tappa: { n: 'Tappa', e: '🍾', miss: 'Senza tappo!', extra: 'Già tappata!' },
};
const DK_RECIPES = [
  { id: 'classico', n: 'Classico', need: { lava: 1, spremi: 1, gas: 1, tappa: 1 }, price: 22, unlock: 0, col: '#2E7D4F', tag: '🫧' },
  { id: 'liscio', n: 'Spremuta liscia', need: { lava: 1, spremi: 1, tappa: 1 }, price: 18, unlock: 0, col: '#C8562E', tag: 'NO 🫧' },
  { id: 'extra', n: 'Extra frizzante', need: { lava: 1, spremi: 1, gas: 2, tappa: 1 }, price: 30, unlock: 5, col: '#2F5D8A', tag: '🫧🫧' },
  { id: 'dolce', n: 'Dolce', need: { lava: 1, spremi: 1, zucchero: 1, gas: 1, tappa: 1 }, price: 36, unlock: 12, col: '#8E3B6E', tag: '🍬🫧' },
];
const DK_LINES = [
  ['Mi sicca a gola, dammi na BergoDrink bella frisca!', 'Ho la gola secca, dammi una BergoDrink bella fresca!'],
  ['Pa’ festa d’u paisi ndi servinu assai!', 'Per la festa del paese ne servono tante!'],
  ['Mi raccumandu, comu a facivanu na vota!', 'Mi raccomando, come la facevano una volta!'],
  ['Stasira vennu l’amici, vogghiu fari bella figura!', 'Stasera vengono gli amici, voglio fare bella figura!'],
  ['Cu stu caddu ci voli propriu!', 'Con questo caldo ci vuole proprio!'],
  ['U bergamottu è sulu d’i nostri parti, u sapivi?', 'Il bergamotto cresce solo dalle nostre parti, lo sapevi?'],
];
const DK_ANGRY = [['Chista è acqua lorda! Vogghiu i sordi arretu!', 'Questa è acqua sporca! Rivoglio i soldi!'], ['Ma chi mi dasti? Rimborsu, subitu!', 'Ma cosa mi hai dato? Rimborso, subito!'], ['Mancu u porcu s’a vivi! Ridammi i sordi!', 'Nemmeno il maiale la beve! Ridammi i soldi!']];
const DK_HAPPY = [['Bona! Chista sì ch’è BergoDrink!', 'Buona! Questa sì che è BergoDrink!'], ['Fridda e frizzanti, bravu!', 'Fresca e frizzante, bravo!'], ['Tornu dumani pe’ n’atra cassa!', 'Torno domani per un’altra cassa!']];
const dl = (p) => (isIt() ? p[1] : p[0]);
const DK_EN_MS = 4 * MIN, DK_EN_VIDEO = 10, DK_PER = 2, DK_BASE = 10;
const DK_ZONE = 27, DK_PERF = 10, DK_GAP = 195;
let DK = null, dkRaf = 0;

function dkState() {
  const E = eco();
  if (E.bergamotti === undefined) E.bergamotti = E.harvests ? 12 : 0;
  if (!E.drink) E.drink = { en: DK_BASE, enMax: DK_BASE, enAt: Date.now(), orders: [], made: 0, bad: 0, done: 0, perfect: 0, refunds: 0, slow: 0, v: 2 };
  const D = E.drink;
  if (D.v !== 2) { D.v = 2; D.enMax = DK_BASE; D.en = Math.min(D.en, DK_BASE); D.slow = D.slow || 0; D.orders = []; }
  dkRegen(D);
  while (D.orders.length < 3) D.orders.push(dkOrder(D));
  return D;
}
function dkRegen(D) {
  const now = Date.now();
  if (D.en >= D.enMax) { D.enAt = now; return; }
  const n = Math.floor((now - D.enAt) / DK_EN_MS);
  if (n > 0) { D.en = Math.min(D.enMax, D.en + n); D.enAt += n * DK_EN_MS; if (D.en >= D.enMax) D.enAt = now; }
}
const dkOpen = (D) => DK_RECIPES.filter((r) => (D.done || 0) >= r.unlock);
function dkOrder(D) {
  const open = dkOpen(D), q = Math.min(5, 3 + Math.floor(Math.random() * (1 + Math.min(2, Math.floor((D.done || 0) / 10)))));
  const main = open[Math.floor(Math.random() * open.length)], items = [];
  for (let i = 0; i < q; i++) items.push(open.length > 1 && Math.random() < 0.2 ? open[Math.floor(Math.random() * open.length)].id : main.id);
  return { id: Math.random().toString(36).slice(2, 8), items, who: CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)], line: Math.floor(Math.random() * DK_LINES.length) };
}
const dkRec = (id) => DK_RECIPES.find((r) => r.id === id);
const dkValue = (o) => o.items.reduce((s, id) => s + dkRec(id).price, 0);
const dkUnlocked = () => (eco().harvests || 0) > 0;
const dkSugar = (D) => (D.done || 0) >= DK_RECIPES[3].unlock;

/* ---------- piccole bottiglie per i menu ---------- */
function dkBottle(st) {
  const liq = st.bad ? '#6E5A2E' : st.sugar ? '#EFA83C' : '#E9C93C';
  let s = '<svg viewBox="0 0 60 80" class="dkitem" aria-hidden="true"><path d="M23 4 h14 v12 q0 4 5 9 q4 5 4 12 v34 q0 5 -5 5 h-22 q-5 0 -5 -5 v-34 q0 -7 4 -12 q5 -5 5 -9z" fill="rgba(220,240,235,0.6)" stroke="#1A1A1A" stroke-width="2"/>';
  if (st.juice) s += '<path d="M16 38 h28 v33 q0 3 -3 3 h-22 q-3 0 -3 -3z" fill="' + liq + '"/>';
  if (st.bubbles && !st.bad) for (let i = 0; i < 3 + st.bubbles * 3; i++) s += '<circle cx="' + (19 + (i * 7) % 22) + '" cy="' + (68 - ((i * 11) % 28)) + '" r="' + (1 + (i % 3) * 0.6) + '" fill="#fff" opacity="0.85"/>';
  if (st.cap) s += '<rect x="21" y="1" width="18" height="7" rx="2" fill="' + (st.capc || '#C0392B') + '" stroke="#1A1A1A" stroke-width="1.6"/><rect x="15" y="44" width="30" height="16" rx="3" fill="' + (st.lab || '#2E7D4F') + '" stroke="#1A1A1A" stroke-width="1.4"/><text x="30" y="55.5" text-anchor="middle" font-size="8" font-weight="800" fill="#FFF3C4" font-family="Alegreya, Georgia, serif">BERGO</text>';
  if (st.bad) s += '<path d="M14 30 q-4 -6 0 -12 M30 28 q-4 -6 0 -12 M46 30 q-4 -6 0 -12" fill="none" stroke="#6E8A3A" stroke-width="2" stroke-linecap="round"/>';
  return s + '</svg>';
}
const dkRecBottle = (r) => dkBottle({ juice: 1, cap: 1, bubbles: r.need.gas || 0, sugar: !!r.need.zucchero, lab: r.col });
function dkFactorySVG() {
  return '<svg viewBox="0 0 340 120" class="dkfac" aria-hidden="true"><defs><linearGradient id="dkfs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FD0F0"/><stop offset="1" stop-color="#F7E6C4"/></linearGradient></defs><rect width="340" height="120" fill="url(#dkfs)"/>' +
    '<path d="M0 92 Q60 70 120 86 T240 80 T340 88 V120 H0Z" fill="#7FB24F" stroke="#1A1A1A" stroke-width="1.5"/>' +
    [30, 64, 280, 312].map((x, i) => '<g transform="translate(' + x + ' ' + (82 - i % 2 * 4) + ')"><rect x="-2" y="0" width="4" height="12" fill="#6B4424"/><circle r="11" cy="-4" fill="#4E8A3A" stroke="#1A1A1A" stroke-width="1.3"/><circle cx="-4" cy="-6" r="2.4" fill="#E9D23E"/><circle cx="4" cy="-1" r="2.4" fill="#E9D23E"/><circle cx="2" cy="-9" r="2.2" fill="#E9D23E"/></g>').join('') +
    '<rect x="92" y="38" width="156" height="66" fill="#F3E3C0" stroke="#1A1A1A" stroke-width="2"/><path d="M86 40 L170 14 L254 40Z" fill="#C8562E" stroke="#1A1A1A" stroke-width="2" stroke-linejoin="round"/>' +
    '<rect x="206" y="6" width="14" height="26" fill="#A98B6A" stroke="#1A1A1A" stroke-width="1.6"/><circle cx="214" cy="0" r="5" fill="#fff" opacity="0.8"/><circle cx="222" cy="-6" r="6" fill="#fff" opacity="0.6"/>' +
    '<rect x="108" y="46" width="124" height="18" rx="4" fill="#2E7D4F" stroke="#1A1A1A" stroke-width="1.6"/><text x="170" y="59.5" text-anchor="middle" font-size="12" font-weight="800" fill="#FFF3C4" font-family="Alegreya SC, Georgia, serif" letter-spacing="1">BERGODRINK</text>' +
    '<rect x="154" y="74" width="32" height="30" fill="#6B4424" stroke="#1A1A1A" stroke-width="1.6"/><rect x="108" y="72" width="26" height="18" fill="#8FD0F0" stroke="#1A1A1A" stroke-width="1.6"/><rect x="206" y="72" width="26" height="18" fill="#8FD0F0" stroke="#1A1A1A" stroke-width="1.6"/></svg>';
}

/* ---------- la scheda ---------- */
function dkEnHTML(D) {
  const full = D.en >= D.enMax, nextIn = full ? 'piena' : '+1 tra ' + fmtTime(DK_EN_MS - (Date.now() - D.enAt));
  return '<span class="mgen' + (D.en <= 2 ? ' low' : '') + '">' + boltSVG() + '<b>' + D.en + '<i>/' + D.enMax + '</i></b><small>' + nextIn + '</small></span>' +
    '<button class="mgvid" data-dk="video"' + (full ? ' disabled' : '') + ' aria-label="Guarda un video per ' + DK_EN_VIDEO + ' energia"><span class="mgplay">▶</span>+' + DK_EN_VIDEO + '</button>';
}
function renderDrink(soft) {
  const box = $('drinkBox'); if (!box) return;
  if (!dkUnlocked()) {
    box.innerHTML = '<div class="dkbanner">' + dkFactorySVG() + '</div><div class="lmlock"><span class="dklockb">' + BERGO_SVG + '</span><div><b>La fabbrica di BergoDrink</b><p>Fai crescere l’albero e raccogli i bergamotti per la prima volta: Bergo ti aspetta per aprire la fabbrica delle bibite frizzanti!</p></div></div>';
    return;
  }
  if (DK) return;
  const D = dkState(), E = eco();
  if (soft && box.querySelector('.dkbar')) { box.querySelector('.mgenw').innerHTML = dkEnHTML(D); return; }
  let h = '<div class="mgtop mgbar dkbar"><span class="mgenw">' + dkEnHTML(D) + '</span><span class="mgsold" title="Bergamotti"><b>🍋 ' + E.bergamotti + '</b><small>bergamotti</small></span></div>';
  h += '<div class="dkbanner">' + dkFactorySVG() + (D.done ? '<span class="dkstat">' + D.done + ' ordini · ' + D.made + ' bottiglie · ⭐ ' + (D.perfect || 0) + '</span>' : '') + '</div>';
  if (!D.done) h += '<div class="lmhead slim"><span class="dkhb">' + BERGO_SVG + '</span><div class="lmbub"><b>Bergo</b><span>' + tr2('Benvinutu ’nta me fabbrica! Ogni macchina fa u so travagghiu: toccala quandu a buttigghia passa sutta. E guarda u bigliettu: ’a liscia nun voli u gas!', 'Benvenuto nella mia fabbrica! Ogni macchina fa il suo lavoro: toccala quando la bottiglia le passa sotto. E guarda il biglietto: la liscia non vuole il gas!') + '</span></div></div>';
  h += '<h4 class="lmh">Gli ordini</h4><div class="dkorders">' + D.orders.map((o) => {
    const q = o.items.length, ok = E.bergamotti >= q * DK_PER && D.en >= q;
    const cnt = {}; o.items.forEach((id) => { cnt[id] = (cnt[id] || 0) + 1; });
    return '<div class="dkorder' + (ok ? ' ok' : '') + '"><img class="lmwho" src="' + AVIMG[o.who] + '" alt=""><div class="dkoinfo"><span class="dkmix">' + Object.keys(cnt).map((id) => { const r = dkRec(id); return '<span class="dkmixi"><span class="dkmb">' + dkRecBottle(r) + '</span><b>' + cnt[id] + '×</b><small>' + r.n + '</small></span>'; }).join('') + '</span><small class="say">' + dl(DK_LINES[o.line % DK_LINES.length]) + '</small><small class="dkcost">🍋 ' + q * DK_PER + ' · ⚡ ' + q + '</small></div>' +
      '<div class="lmbtns"><button class="btn small ' + (ok ? 'take' : 'ghost') + '" data-dk="go" data-id="' + o.id + '"' + (ok ? '' : ' disabled') + '>' + (ok ? 'Produci' : E.bergamotti < q * DK_PER ? 'Pochi bergamotti' : 'Poca energia') + '<small>' + dkValue(o) + ' carlini</small></button><button class="lmskip" data-dk="skip" data-id="' + o.id + '" aria-label="Cambia cliente">↻</button></div></div>';
  }).join('') + '</div>';
  h += '<div class="mgsec"><h3>Le ricette <small>' + dkOpen(D).length + ' su ' + DK_RECIPES.length + '</small></h3><div class="dkrec">' + DK_RECIPES.map((r) => { const lock = D.done < r.unlock; return '<div class="dkrc' + (lock ? ' lock' : '') + '"><span class="dkrb">' + (lock ? '🔒' : dkRecBottle(r)) + '</span><b>' + r.n + ' <em class="dktagm" style="--tc:' + r.col + '">' + r.tag + '</em></b><small>' + (lock ? 'Dopo ' + r.unlock + ' ordini' : Object.keys(DK_ST).filter((s) => r.need[s]).map((s) => DK_ST[s].e + (r.need[s] > 1 ? '×' + r.need[s] : '')).join(' ') + ' · ' + r.price + ' carlini') + '</small></div>'; }).join('') + '</div></div>';
  h += '<div class="mgsec"><h3>Migliora la fabbrica</h3><div class="mgup"><button class="mgupc" data-dk="buy"' + (E.carlini >= 60 ? '' : ' disabled') + '><span class="mgupi">🍋</span><span><b>6 bergamotti dal mercato</b><small>Se l’albero non è ancora pronto</small></span><em>60 🪙</em></button>' +
    (D.slow < 2 ? '<button class="mgupc" data-dk="slow"' + (E.carlini >= [300, 800][D.slow] ? '' : ' disabled') + '><span class="mgupi">⚙️</span><span><b>Motore più dolce · liv. ' + (D.slow + 1) + '</b><small>Il nastro va più piano del 10%</small></span><em>' + [300, 800][D.slow] + ' 🪙</em></button>' : '<span class="mgupc done"><span class="mgupi">⚙️</span><span><b>Motore al massimo</b></span></span>') +
    (D.enMax < 20 ? '<button class="mgupc" data-dk="max"' + (E.carlini >= 40 * D.enMax ? '' : ' disabled') + '><span class="mgupi">⚡</span><span><b>Più energia</b><small>Il massimo sale di 2</small></span><em>' + 40 * D.enMax + ' 🪙</em></button>' : '') + '</div>' +
    '<small class="hint">Ogni raccolto dell’albero dà ' + (12 * (E.helpers.raccoglitrice ? 2 : 1)) + ' bergamotti. Ogni bottiglia ne usa 2.' + (D.refunds ? ' Rimborsi fatti: ' + D.refunds + '.' : '') + '</small></div>';
  box.innerHTML = h;
}

/* ---------- la catena di montaggio ---------- */
function dkStations(D) { const L = ['lava', 'spremi']; if (dkSugar(D)) L.push('zucchero'); L.push('gas', 'tappa'); return L.map((k, i, a) => ({ k, x: (i + 0.5) * 360 / a.length, anim: 0, jam: 0 })); }
function dkStart(id) {
  const D = dkState(), E = eco(), o = D.orders.find((x) => x.id === id); if (!o) return;
  const q = o.items.length;
  if (E.bergamotti < q * DK_PER || D.en < q) return;
  E.bergamotti -= q * DK_PER; if (D.en >= D.enMax) D.enAt = Date.now(); D.en -= q; save();
  const speed = Math.min(46, 26 + (D.done || 0) * 0.6) * (1 - 0.1 * (D.slow || 0));
  const st = dkStations(D);
  DK = { o, D, st, v: speed, t: 0, last: performance.now(), over: false, combo: 0, best: 0, fx: [], parts: [], pops: [], crate: [], bergo: { mood: 0, t: 0 },
    bottles: o.items.map((r, i) => ({ r, x: -30 - i * DK_GAP, acts: {}, perf: true, bad: '', done: false, passed: {} })) };
  if ((D.done || 0) >= 8 && Math.random() < 0.3) { const cand = st.filter((s) => s.k !== 'lava'); DK.jamAt = 2.5 + Math.random() * Math.max(1, (q * DK_GAP + 360) / speed - 6); DK.jamSt = cand[Math.floor(Math.random() * cand.length)].k; }
  $('drinkBox').innerHTML = '<div class="dkline"><div class="dkhead"><span class="dkcl"><img src="' + AVIMG[o.who] + '" alt=""><b>' + whoN(o.who).replace(/^(il|la|lo) /, '').replace(/^./, (c) => c.toUpperCase()) + '</b></span><span class="dkprog" id="dkProg"></span></div>' +
    '<div class="dkarena"><canvas id="dkCv" aria-label="La catena di montaggio di BergoDrink"></canvas></div>' +
    '<div class="dkbtns" style="--n:' + st.length + '">' + st.map((s) => '<button class="dkbtn" data-dkb="' + s.k + '"><span>' + DK_ST[s.k].e + '</span>' + DK_ST[s.k].n + '</button>').join('') + '</div>' +
    '<div class="dkfoot"><span class="dkleg">' + dkOpen(D).filter((r) => o.items.includes(r.id)).map((r) => '<span><em class="dktagm" style="--tc:' + r.col + '">' + r.tag + '</em> ' + r.n + '</span>').join('') + '</span><button class="btn ghost small" data-dk="quit">Ferma</button></div></div>';
  DK.G = dkGeo(); dkProg();
  if (!dkRaf) { DK.last = performance.now(); dkRaf = requestAnimationFrame(dkLoop); }
}
function dkProg() { const p = $('dkProg'); if (!p || !DK) return; p.innerHTML = DK.bottles.map((b) => '<i class="' + (b.done ? (b.bad ? 'no' : b.perf ? 'pf' : 'ok') : '') + '"></i>').join('') + (DK.combo > 1 ? '<b class="dkcombo">x' + DK.combo + '</b>' : ''); }
function dkPop(x, y, text, cls) { DK.pops.push({ x, y, text, cls: cls || '', t: 0 }); }
function dkBurst(x, y, n, col, vy) { for (let i = 0; i < n; i++) DK.parts.push({ x, y, vx: (Math.random() - 0.5) * 70, vy: (vy || -40) * (0.5 + Math.random()), r: 1.2 + Math.random() * 2, c: col, life: 0.6 + Math.random() * 0.4, g: 160 }); }
function dkSpoil(b, why) { if (b.bad) return; b.bad = why; b.perf = false; DK.combo = 0; fx('sad'); dkPop(b.x, DK.G.belt - 70, why, 'bad'); DK.bergo.mood = -1; DK.bergo.t = 1.2; try { if (navigator.vibrate) navigator.vibrate(90); } catch (e) { /* niente */ } }
function dkPress(k) {
  if (!DK || DK.over) return;
  const s = DK.st.find((x) => x.k === k); if (!s) return;
  if (s.jam > 0) { s.jam--; s.anim = 0.25; fx('card'); dkBurst(s.x, DK.G.mBot, 4, '#9AA3A8', -30); if (!s.jam) { dkPop(s.x, DK.G.mBot - 24, 'Riparata!', 'good'); fx('take'); } else dkPop(s.x, DK.G.mBot - 24, 'Ancora ' + s.jam + '!', 'warn'); return; }
  s.anim = 0.35;
  const b = DK.bottles.filter((x) => !x.done && Math.abs(x.x - s.x) <= DK_ZONE).sort((a, c) => Math.abs(a.x - s.x) - Math.abs(c.x - s.x))[0];
  dkStationFx(s);
  if (!b) { DK.combo = 0; dkPop(s.x, DK.G.belt - 54, 'A vuoto', 'warn'); fx('card'); dkProg(); return; }
  const need = dkRec(b.r).need[k] || 0;
  b.acts[k] = (b.acts[k] || 0) + 1;
  if (b.bad) { fx('card'); return; }
  // un tocco in più su un passaggio già fatto non rovina la bottiglia: si perde solo il "perfetto"
  if (b.acts[k] > need && need) { b.acts[k] = need; b.perf = false; DK.combo = 0; dkPop(s.x, DK.G.belt - 54, 'Già fatto!', 'warn'); fx('card'); dkProg(); return; }
  if (b.acts[k] > need) { dkSpoil(b, need ? DK_ST[k].extra : (k === 'gas' ? 'Questa va senza gas!' : DK_ST[k].extra)); dkProg(); return; }
  // l'ordine conta: non si spreme una bottiglia non lavata e non si tappa prima del gas
  const order = DK.st.map((x) => x.k), idx = order.indexOf(k);
  for (const prev of order.slice(0, idx)) if ((dkRec(b.r).need[prev] || 0) > (b.acts[prev] || 0)) { dkSpoil(b, DK_ST[prev].miss); dkProg(); return; }
  const d = Math.abs(b.x - s.x);
  if (d > DK_PERF) b.perf = false;
  DK.combo++; DK.best = Math.max(DK.best, DK.combo);
  dkPop(s.x, DK.G.belt - 58, d <= DK_PERF ? 'Perfetto!' : 'Bene', d <= DK_PERF ? 'perf' : 'good');
  fx(k === 'tappa' ? 'take' : 'card');
  dkProg();
}
function dkStationFx(s) {
  const G = DK.G, x = s.x, y = G.mBot;
  if (s.k === 'lava') dkBurst(x, y + 6, 12, '#7FD3F5', 30);
  if (s.k === 'spremi') dkBurst(x, y + 16, 10, '#F2D33C', -60);
  if (s.k === 'zucchero') dkBurst(x, y + 4, 14, '#FFFFFF', 40);
  if (s.k === 'gas') { for (let i = 0; i < 6; i++) DK.parts.push({ x: x + (Math.random() - 0.5) * 10, y: y + 10, vx: (Math.random() - 0.5) * 30, vy: -20 - Math.random() * 20, r: 3 + Math.random() * 4, c: 'rgba(255,255,255,0.8)', life: 0.7, g: -20, puff: 1 }); }
  if (s.k === 'tappa') dkBurst(x, y + 14, 6, '#F2C94C', -50);
}
function dkLoop(now) {
  dkRaf = 0;
  if (!DK || DK.over || !$('dkCv')) return;
  const dt = Math.min(0.05, (now - DK.last) / 1000); DK.last = now; DK.t += dt;
  dkStep(dt); dkDraw();
  dkRaf = requestAnimationFrame(dkLoop);
}
function dkStep(dt) {
  const G = DK.G || dkGeo(); DK.G = G;
  for (const s of DK.st) { s.anim = Math.max(0, s.anim - dt); }
  if (DK.jamAt && DK.t >= DK.jamAt && !DK.jammed) { DK.jammed = true; const s = DK.st.find((x) => x.k === DK.jamSt); s.jam = 3; fx('sad'); dkPop(s.x, G.mBot - 30, 'Inceppata! Tocca 3 volte', 'bad'); }
  for (const b of DK.bottles) {
    if (b.done) continue;
    b.x += DK.v * dt;
    for (const s of DK.st) {
      if (!b.passed[s.k] && b.x > s.x + DK_ZONE) {
        b.passed[s.k] = true;
        const need = dkRec(b.r).need[s.k] || 0;
        if ((b.acts[s.k] || 0) < need) dkSpoil(b, s.jam ? 'Macchina inceppata!' : DK_ST[s.k].miss);
      }
    }
    if (b.x > 380) {
      b.done = true;
      if (!b.bad) { DK.bergo.mood = b.perf ? 2 : 1; DK.bergo.t = 0.8; if (b.perf) fx('take'); }
      DK.crate.push(b); dkProg();
    }
  }
  DK.parts = DK.parts.filter((p) => (p.life -= dt) > 0);
  for (const p of DK.parts) { p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
  DK.pops = DK.pops.filter((p) => (p.t += dt) < 1.1);
  if (DK.bergo.t > 0) DK.bergo.t -= dt;
  if (DK.bottles.every((b) => b.done) && !DK.ending) { DK.ending = true; setTimeout(dkEnd, 700); }
}
function dkGeo() {
  const c = $('dkCv'); const w = c ? c.clientWidth || 360 : 360, h = c ? c.clientHeight || 300 : 300;
  const H = 360 * h / w, belt = H - 40;
  return { W: 360, H, belt, mTop: 26, mBot: Math.max(96, belt - 118) };
}
/* ---------- disegno ---------- */
let DK_BERGO_IMG = null;
function dkBergoImg() {
  if (DK_BERGO_IMG) return DK_BERGO_IMG;
  try { DK_BERGO_IMG = new Image(); DK_BERGO_IMG.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(BERGO_SVG.trim().replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')); } catch (e) { DK_BERGO_IMG = null; }
  return DK_BERGO_IMG;
}
const rr2 = (x, a, b, w, h, r) => { x.beginPath(); if (x.roundRect) x.roundRect(a, b, w, h, r); else x.rect(a, b, w, h); };
function metal(x, x0, y0, x1, c0, c1) { const g = x.createLinearGradient(x0, y0, x1, y0); g.addColorStop(0, c0); g.addColorStop(0.45, c1); g.addColorStop(1, c0); return g; }
function dkDraw() {
  const c = $('dkCv'); if (!c) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1), cw = c.clientWidth, ch = c.clientHeight; if (!cw || !ch) return;
  if (c.width !== Math.round(cw * dpr) || c.height !== Math.round(ch * dpr)) { c.width = Math.round(cw * dpr); c.height = Math.round(ch * dpr); DK.G = dkGeo(); }
  const x = c.getContext('2d'), s = cw / 360 * dpr, G = DK.G || dkGeo(), t = DK.t;
  x.setTransform(s, 0, 0, s, 0, 0); x.lineJoin = 'round'; x.lineCap = 'round';
  const { W, H, belt } = G;
  // muro: intonaco caldo e piastrelle
  const wall = x.createLinearGradient(0, 0, 0, belt); wall.addColorStop(0, '#F6E7C8'); wall.addColorStop(1, '#EAD3A6'); x.fillStyle = wall; x.fillRect(0, 0, W, H);
  const ty = belt - 34;
  for (let i = 0; i < 24; i++) for (let j = 0; j < 3; j++) { x.fillStyle = (i + j) % 2 ? '#FFFFFF' : '#CFE6D6'; x.fillRect(i * 15, ty + j * 11, 15, 11); }
  x.strokeStyle = 'rgba(46,125,79,0.35)'; x.lineWidth = 0.6; for (let i = 0; i < 24; i++) { x.beginPath(); x.moveTo(i * 15, ty); x.lineTo(i * 15, belt); x.stroke(); }
  // finestra sul bergamotteto
  x.fillStyle = '#8FD0F0'; rr2(x, 278, 8, 70, 46, 4); x.fill(); x.save(); rr2(x, 278, 8, 70, 46, 4); x.clip();
  x.fillStyle = '#7FB24F'; x.beginPath(); x.moveTo(278, 44); x.quadraticCurveTo(300, 34, 320, 42); x.quadraticCurveTo(336, 36, 348, 40); x.lineTo(348, 54); x.lineTo(278, 54); x.fill();
  for (let i = 0; i < 4; i++) { const tx = 288 + i * 17; x.fillStyle = '#4E8A3A'; x.beginPath(); x.arc(tx, 38 - (i % 2) * 3, 7, 0, 7); x.fill(); x.fillStyle = '#E9D23E'; x.beginPath(); x.arc(tx - 2, 36, 1.6, 0, 7); x.arc(tx + 3, 39, 1.6, 0, 7); x.fill(); }
  x.restore(); x.strokeStyle = '#6B4424'; x.lineWidth = 3; rr2(x, 278, 8, 70, 46, 4); x.stroke(); x.lineWidth = 2; x.beginPath(); x.moveTo(313, 8); x.lineTo(313, 54); x.moveTo(278, 31); x.lineTo(348, 31); x.stroke();
  // manifesto d'epoca
  x.fillStyle = '#2E7D4F'; rr2(x, 10, 8, 52, 42, 3); x.fill(); x.strokeStyle = '#1A1A1A'; x.lineWidth = 1.4; x.stroke();
  const bi = dkBergoImg(); if (bi && bi.complete && bi.naturalWidth) x.drawImage(bi, 22, 10, 28, 32);
  x.fillStyle = '#FFF3C4'; x.font = '800 7px Alegreya, Georgia, serif'; x.textAlign = 'center'; x.fillText('DAL 1926', 36, 47);
  // tubi di rame tra le macchine
  x.strokeStyle = '#B87333'; x.lineWidth = 5; x.beginPath(); x.moveTo(0, 18); x.lineTo(W, 18); x.stroke(); x.strokeStyle = '#E3A26B'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(0, 16.5); x.lineTo(W, 16.5); x.stroke();
  // macchine
  for (const st of DK.st) dkMachine(x, G, st, t);
  // nastro
  x.fillStyle = '#5A5A5A'; for (const lx of [24, W - 24]) { x.fillRect(lx - 3, belt + 10, 6, H - belt); }
  const bg = x.createLinearGradient(0, belt, 0, belt + 14); bg.addColorStop(0, '#4A4A4A'); bg.addColorStop(1, '#2A2A2A'); x.fillStyle = bg; rr2(x, -6, belt, W + 12, 14, 7); x.fill();
  x.strokeStyle = '#6A6A6A'; x.lineWidth = 1; const off = (t * DK.v) % 14; for (let i = -14; i < W + 14; i += 14) { x.beginPath(); x.moveTo(i + off, belt + 2); x.lineTo(i + off - 3, belt + 12); x.stroke(); }
  for (let i = 0; i < 13; i++) { const rx = 10 + i * 28; x.fillStyle = '#9AA3A8'; x.beginPath(); x.arc(rx, belt + 18, 5, 0, 7); x.fill(); x.strokeStyle = '#1A1A1A'; x.lineWidth = 1; x.stroke(); const a = t * DK.v / 5; x.beginPath(); x.moveTo(rx, belt + 18); x.lineTo(rx + Math.cos(a) * 4, belt + 18 + Math.sin(a) * 4); x.stroke(); }
  // zone delle macchine sul nastro
  for (const st of DK.st) { x.fillStyle = st.jam ? 'rgba(192,57,43,0.35)' : 'rgba(242,201,76,0.28)'; x.fillRect(st.x - DK_ZONE, belt - 2, DK_ZONE * 2, 3); x.fillStyle = st.jam ? '#C0392B' : '#F2C94C'; x.fillRect(st.x - 1.5, belt - 4, 3, 5); }
  // cassa delle bottiglie pronte
  const cx0 = W - 2; x.save(); x.globalAlpha = 0.9; x.restore();
  // bottiglie
  for (const b of DK.bottles) if (!b.done && b.x > -40) dkBottleCv(x, b, b.x, belt, t);
  // particelle
  for (const p of DK.parts) { x.globalAlpha = Math.min(1, p.life * 2); x.fillStyle = p.c; x.beginPath(); x.arc(p.x, p.y, p.r, 0, 7); x.fill(); }
  x.globalAlpha = 1;
  // Bergo che fa il tifo
  if (bi && bi.complete && bi.naturalWidth) { const m = DK.bergo.t > 0 ? DK.bergo.mood : 0, jy = m > 0 ? -Math.abs(Math.sin(t * 14)) * 8 : 0, sh = m < 0 ? Math.sin(t * 30) * 2 : 0; x.drawImage(bi, 4 + sh, H - 44 + jy, 30, 36); if (m < 0) { x.font = '700 14px sans-serif'; x.fillText('💢', 36, H - 36); } if (m === 2) { x.font = '700 12px sans-serif'; x.fillText('✨', 38, H - 38 + jy); } }
  // scritte
  for (const p of DK.pops) {
    const k = p.t / 1.1; x.globalAlpha = k < 0.7 ? 1 : (1 - k) / 0.3;
    x.font = '800 ' + (p.cls === 'perf' ? 14 : 12) + 'px Alegreya, Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    const tw = x.measureText(p.text).width + 16, yy = p.y - k * 16;
    x.fillStyle = p.cls === 'perf' ? '#F2C94C' : p.cls === 'good' ? '#3E9B4F' : p.cls === 'bad' ? '#C0392B' : 'rgba(30,30,30,0.75)';
    rr2(x, p.x - tw / 2, yy - 10, tw, 20, 10); x.fill(); x.strokeStyle = '#1A1A1A'; x.lineWidth = 1.2; x.stroke();
    x.fillStyle = p.cls === 'perf' ? '#1A1A1A' : '#FFFFFF'; x.fillText(p.text, p.x, yy + 0.5);
    x.globalAlpha = 1; x.textBaseline = 'alphabetic';
  }
}
function dkMachine(x, G, st, t) {
  const { mTop, mBot } = G, cx = st.x, w = 54, push = st.anim > 0 ? Math.sin(Math.min(1, st.anim / 0.35) * Math.PI) * 14 : 0, jam = st.jam > 0;
  x.save(); if (jam) x.translate(Math.sin(t * 40) * 1.2, 0);
  x.strokeStyle = '#1A1A1A'; x.lineWidth = 1.6;
  // tubo che scende dal soffitto
  const bodyH = Math.min(78, mBot - mTop - 22), top = mBot - 18 - bodyH;
  x.fillStyle = '#B87333'; x.fillRect(cx - 3, 18, 6, top - 14); x.strokeRect(cx - 3, 18, 6, top - 14);
  if (st.k === 'lava') {
    x.fillStyle = metal(x, cx - w / 2, 0, cx + w / 2, '#5FA8D3', '#BFE6F7'); rr2(x, cx - w / 2 + 4, top, w - 8, bodyH, 8); x.fill(); x.stroke();
    x.fillStyle = 'rgba(255,255,255,0.6)'; for (let i = 0; i < 3; i++) { x.beginPath(); x.arc(cx - 8 + i * 8, top + 14 + Math.sin(t * 3 + i) * 3, 3, 0, 7); x.fill(); }
    x.fillStyle = '#2F5D8A'; x.font = '800 9px Alegreya, Georgia, serif'; x.textAlign = 'center'; x.fillText('ACQUA', cx, top + bodyH - 8);
  } else if (st.k === 'spremi') {
    x.fillStyle = metal(x, cx - w / 2, 0, cx + w / 2, '#3E8A4A', '#8BCB7E'); rr2(x, cx - w / 2 + 2, top, w - 4, bodyH, 6); x.fill(); x.stroke();
    x.fillStyle = '#E9D23E'; x.beginPath(); x.arc(cx, top + bodyH / 2 - 2, 10, 0, 7); x.fill(); x.stroke(); x.strokeStyle = '#B8A72A'; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; x.beginPath(); x.moveTo(cx, top + bodyH / 2 - 2); x.lineTo(cx + Math.cos(a) * 9, top + bodyH / 2 - 2 + Math.sin(a) * 9); x.stroke(); }
    x.strokeStyle = '#1A1A1A';
  } else if (st.k === 'zucchero') {
    x.fillStyle = metal(x, cx - w / 2, 0, cx + w / 2, '#C9B9D8', '#F4EEF8'); x.beginPath(); x.moveTo(cx - w / 2 + 2, top); x.lineTo(cx + w / 2 - 2, top); x.lineTo(cx + 8, top + bodyH); x.lineTo(cx - 8, top + bodyH); x.closePath(); x.fill(); x.stroke();
    x.fillStyle = '#FFFFFF'; x.beginPath(); x.moveTo(cx - 18, top + 6); x.lineTo(cx + 18, top + 6); x.lineTo(cx + 12, top + 16); x.lineTo(cx - 12, top + 16); x.fill();
    x.fillStyle = '#8E3B6E'; x.font = '800 8px Alegreya, Georgia, serif'; x.textAlign = 'center'; x.fillText('ZUCCHERO', cx, top + 28);
  } else if (st.k === 'gas') {
    x.fillStyle = metal(x, cx - 14, 0, cx + 14, '#8E9CA4', '#E4ECF0'); rr2(x, cx - 14, top - 2, 28, bodyH + 2, 12); x.fill(); x.stroke();
    x.fillStyle = '#C0392B'; x.beginPath(); x.arc(cx, top + 10, 6, 0, 7); x.fill(); x.stroke();
    x.fillStyle = '#fff'; x.beginPath(); x.arc(cx + 16, top + 22, 8, 0, 7); x.fill(); x.stroke();
    const ang = -2.2 + (st.anim > 0 ? 2.6 : 0.6 + Math.sin(t * 2) * 0.15); x.strokeStyle = '#C0392B'; x.lineWidth = 1.6; x.beginPath(); x.moveTo(cx + 16, top + 22); x.lineTo(cx + 16 + Math.cos(ang) * 6, top + 22 + Math.sin(ang) * 6); x.stroke(); x.strokeStyle = '#1A1A1A';
    x.fillStyle = '#2A2A2A'; x.font = '800 8px Alegreya, Georgia, serif'; x.textAlign = 'center'; x.fillText('CO₂', cx, top + bodyH - 6);
  } else {
    x.fillStyle = metal(x, cx - w / 2, 0, cx + w / 2, '#B23A2E', '#E8806E'); rr2(x, cx - w / 2 + 4, top, w - 8, bodyH, 6); x.fill(); x.stroke();
    x.fillStyle = '#F2C94C'; for (let i = 0; i < 3; i++) { rr2(x, cx - 14 + i * 10, top + 8, 7, 5, 1.5); x.fill(); x.stroke(); }
    x.fillStyle = '#FFF3C4'; x.font = '800 8px Alegreya, Georgia, serif'; x.textAlign = 'center'; x.fillText('TAPPI', cx, top + bodyH - 8);
  }
  // pistone che scende sulla bottiglia
  x.fillStyle = metal(x, cx - 5, 0, cx + 5, '#6E7C84', '#C9D2D8'); x.fillRect(cx - 4, top + bodyH, 8, 12 + push); x.strokeRect(cx - 4, top + bodyH, 8, 12 + push);
  x.fillStyle = '#3A3A3A'; rr2(x, cx - 9, top + bodyH + 10 + push, 18, 6, 2); x.fill(); x.stroke();
  if (jam) { x.fillStyle = 'rgba(192,57,43,' + (0.35 + 0.25 * Math.sin(t * 12)) + ')'; rr2(x, cx - w / 2, top - 4, w, bodyH + 8, 8); x.fill(); x.font = '900 16px sans-serif'; x.textAlign = 'center'; x.fillText('⚠️', cx, top - 8); x.fillStyle = 'rgba(80,80,80,0.5)'; x.beginPath(); x.arc(cx + 10, top - 6 - (t * 20) % 14, 4, 0, 7); x.fill(); }
  x.restore();
}
function dkBottleCv(x, b, bx, belt, t) {
  const r = dkRec(b.r), a = b.acts, washed = (a.lava || 0) > 0, pressed = (a.spremi || 0) > 0, gas = a.gas || 0, sugar = (a.zucchero || 0) > 0, cap = (a.tappa || 0) > 0;
  x.save(); x.translate(bx, belt); x.scale(1.25, 1.25);
  if (b.bad) x.translate(Math.sin(t * 25) * 0.8, 0);
  // biglietto con la ricetta
  x.fillStyle = '#FFFDF6'; x.strokeStyle = '#1A1A1A'; x.lineWidth = 1; rr2(x, -16, -76, 32, 15, 3); x.fill(); x.stroke();
  x.fillStyle = r.col; x.fillRect(-16, -76, 4, 15);
  x.font = '700 8px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#1A1A1A';
  x.fillText(r.id === 'liscio' ? '🚫🫧' : r.tag, 2, -68.5); x.textBaseline = 'alphabetic';
  x.strokeStyle = 'rgba(0,0,0,0.4)'; x.beginPath(); x.moveTo(0, -61); x.lineTo(0, -54); x.stroke();
  if (!pressed) {
    // cestino con due bergamotti
    x.fillStyle = '#B98A52'; x.strokeStyle = '#1A1A1A'; x.lineWidth = 1.3; x.beginPath(); x.moveTo(-15, -14); x.lineTo(15, -14); x.lineTo(12, 0); x.lineTo(-12, 0); x.closePath(); x.fill(); x.stroke();
    x.strokeStyle = '#8A6040'; x.beginPath(); x.moveTo(-13, -8); x.lineTo(13, -8); x.stroke();
    for (const [fx0, fy0, rr] of [[-6, -20, 8], [6, -19, 7.5]]) { const g = x.createRadialGradient(fx0 - 2, fy0 - 3, 1, fx0, fy0, rr); g.addColorStop(0, washed ? '#F8F27A' : '#E8E05A'); g.addColorStop(1, washed ? '#C9C23A' : '#A9A53A'); x.fillStyle = g; x.strokeStyle = '#1A1A1A'; x.lineWidth = 1.2; x.beginPath(); x.arc(fx0, fy0, rr, 0, 7); x.fill(); x.stroke(); }
    x.fillStyle = '#5E9A48'; x.beginPath(); x.ellipse(1, -29, 5, 2.4, -0.5, 0, 7); x.fill();
    if (washed) { x.fillStyle = 'rgba(127,211,245,0.95)'; for (const [dx, dy] of [[-12, -26], [12, -24], [0, -10]]) { x.beginPath(); x.moveTo(dx, dy - 3); x.quadraticCurveTo(dx + 2.4, dy + 1, dx, dy + 2); x.quadraticCurveTo(dx - 2.4, dy + 1, dx, dy - 3); x.fill(); } x.fillStyle = 'rgba(255,255,255,0.9)'; x.beginPath(); x.arc(-8, -23, 1.6, 0, 7); x.arc(4, -22, 1.4, 0, 7); x.fill(); }
  } else {
    // bottiglia di vetro
    const liq = b.bad ? '#6E5A2E' : sugar ? '#F0A63A' : '#EBCB3A';
    x.beginPath(); x.moveTo(-5, -50); x.lineTo(5, -50); x.lineTo(5, -40); x.quadraticCurveTo(11, -34, 11, -26); x.lineTo(11, -3); x.quadraticCurveTo(11, 0, 8, 0); x.lineTo(-8, 0); x.quadraticCurveTo(-11, 0, -11, -3); x.lineTo(-11, -26); x.quadraticCurveTo(-11, -34, -5, -40); x.closePath();
    x.fillStyle = 'rgba(210,240,232,0.55)'; x.fill();
    x.save(); x.clip(); x.fillStyle = liq; x.fillRect(-12, -28 + Math.sin(t * 6 + bx) * 0.6, 24, 30);
    if (!b.bad) for (let i = 0; i < gas * 5; i++) { const by = -2 - ((t * 22 + i * 7.3) % 26); x.fillStyle = 'rgba(255,255,255,0.85)'; x.beginPath(); x.arc(-7 + (i * 5.3) % 14, by, 0.9 + (i % 3) * 0.4, 0, 7); x.fill(); }
    x.fillStyle = 'rgba(255,255,255,0.35)'; x.fillRect(-8, -36, 3, 32);
    x.restore();
    x.strokeStyle = '#1A1A1A'; x.lineWidth = 1.3; x.stroke();
    if (cap) { x.fillStyle = r.col; rr2(x, -10, -24, 20, 11, 2); x.fill(); x.stroke(); x.fillStyle = '#FFF3C4'; x.font = '800 5.5px Alegreya, Georgia, serif'; x.textAlign = 'center'; x.fillText('BERGO', 0, -16.5); x.fillStyle = '#C0392B'; rr2(x, -6, -54, 12, 5, 1.5); x.fill(); x.stroke(); }
    if (b.bad) { x.strokeStyle = '#6E8A3A'; x.lineWidth = 1.6; for (const dx of [-8, 0, 8]) { x.beginPath(); x.moveTo(dx, -54); x.quadraticCurveTo(dx - 3, -60, dx, -66); x.stroke(); } const fx0 = Math.sin(t * 7) * 10, fy0 = -58 + Math.cos(t * 9) * 4; x.fillStyle = '#1A1A1A'; x.beginPath(); x.arc(fx0, fy0, 1.6, 0, 7); x.fill(); }
  }
  if (b.bad) { x.strokeStyle = '#C0392B'; x.lineWidth = 3; x.beginPath(); x.moveTo(-9, -46); x.lineTo(9, -30); x.moveTo(9, -46); x.lineTo(-9, -30); x.stroke(); }
  x.restore();
}
function dkEnd() {
  if (!DK) return;
  const D = dkState(), E = eco(), o = DK.o, bots = DK.bottles;
  const good = bots.filter((b) => !b.bad), bad = bots.filter((b) => b.bad), perf = good.filter((b) => b.perf).length, all = !bad.length;
  const base = good.reduce((s, b) => s + dkRec(b.r).price, 0);
  const tip = all ? Math.round(base * 0.1) + perf * 3 : 0, refund = bad.reduce((s, b) => s + Math.round(dkRec(b.r).price / 2), 0);
  const pay = Math.max(0, base + tip - refund);
  E.carlini += pay; D.done++; D.made += good.length; D.bad += bad.length; D.perfect = (D.perfect || 0) + perf; if (bad.length) D.refunds++;
  D.orders = D.orders.filter((x) => x.id !== o.id); D.orders.push(dkOrder(D));
  const xp = good.length * 3 + perf * 2 + (all ? 10 : 0); gainXp(xp);
  const fresh = DK_RECIPES.filter((x) => x.unlock === D.done);
  const stars = all ? (perf === bots.length ? 3 : 2) : good.length ? 1 : 0;
  save(); DK.over = true; const best = DK.best; DK = null;
  fx(all ? 'big' : 'sad'); if (stars === 3) say('bella', 0);
  const why = {}; bad.forEach((b) => { why[b.bad] = (why[b.bad] || 0) + 1; });
  overlay('<div class="dkres"><img class="dkwho' + (all ? '' : ' mad') + '" src="' + AVIMG[o.who] + '" alt=""><div class="nickbub"><b>' + whoN(o.who).replace(/^(il|la|lo) /, '').replace(/^./, (c) => c.toUpperCase()) + '</b><span>' + dl((all ? DK_HAPPY : DK_ANGRY)[Math.floor(Math.random() * 3)]) + '</span></div></div>' +
    '<p class="pcstars">' + '★'.repeat(stars) + '☆'.repeat(3 - stars) + '</p>' +
    '<div class="dkcrate big">' + bots.map((b) => { const r = dkRec(b.r); return '<span class="' + (b.bad ? 'no' : '') + '">' + (b.bad ? dkBottle({ juice: 1, bad: 1, cap: 1 }) : dkRecBottle(r)) + '</span>'; }).join('') + '</div>' +
    (bad.length ? '<p class="dkwhy">' + Object.keys(why).map((k) => why[k] + ' × ' + k).join(' · ') + '</p>' : '') +
    '<table class="dktab"><tr><td>Bottiglie buone</td><td>' + good.length + '</td><td>+' + base + '</td></tr>' + (tip ? '<tr><td>Mancia' + (perf ? ' (' + perf + ' perfette)' : '') + '</td><td></td><td>+' + tip + '</td></tr>' : '') + (refund ? '<tr class="no"><td>Rimborso per ' + bad.length + (bad.length === 1 ? ' bibita guasta' : ' bibite guaste') + '</td><td></td><td>−' + refund + '</td></tr>' : '') + '<tr class="tot"><td>Totale</td><td></td><td>' + pay + ' carlini</td></tr></table>' +
    '<div class="gain"><div class="xp">+' + xp + ' XP' + (best > 4 ? ' · combo migliore x' + best : '') + '</div>' + (fresh.length ? '<div class="unl"><div>Nuova ricetta: ' + fresh.map((x) => x.n).join(', ') + (fresh.some((x) => x.id === 'dolce') ? ' · arriva la macchina dello zucchero!' : '') + '</div></div>' : '') + '</div>' +
    '<button class="btn take" id="dkOk">Torna alla fabbrica</button>');
  $('dkOk').onclick = () => { $('layer').innerHTML = ''; renderDrink(); renderRes(); };
  if (typeof track === 'function') track('drink_order', { good: good.length, bad: bad.length });
}
function dkQuit() {
  if (!DK) return;
  const D = dkState(), E = eco(), left = DK.bottles.filter((b) => b.x < 0 && !b.done).length;
  E.bergamotti += left * DK_PER; D.en = Math.min(D.enMax + DK_EN_VIDEO, D.en + left);
  DK.over = true; DK = null; save(); renderDrink();
}

async function drinkClick(e) {
  const b = e.target.closest('[data-dk]'); if (!b || b.disabled) return;
  const a = b.dataset.dk, D = dkState(), E = eco();
  if (a === 'go') { dkStart(b.dataset.id); return; }
  if (a === 'quit') { dkQuit(); return; }
  if (a === 'skip') { D.orders = D.orders.filter((x) => x.id !== b.dataset.id); dkState(); }
  if (a === 'buy' && E.carlini >= 60) { E.carlini -= 60; E.bergamotti += 6; fx('take'); flash('+6 bergamotti'); }
  if (a === 'slow' && D.slow < 2 && E.carlini >= [300, 800][D.slow]) { E.carlini -= [300, 800][D.slow]; D.slow++; fx('big'); flash('Il nastro va più piano'); }
  if (a === 'max' && E.carlini >= 40 * D.enMax) { E.carlini -= 40 * D.enMax; D.enMax += 2; D.en += 2; fx('big'); }
  if (a === 'video') { const got = await showRewardedAd(); if (got) { dkRegen(D); D.en = Math.min(D.enMax + DK_EN_VIDEO, D.en + DK_EN_VIDEO); flash('+' + DK_EN_VIDEO + ' energia'); } }
  save(); renderDrink(); renderRes();
}
/* i pulsanti delle macchine rispondono al tocco, senza aspettare il click */
document.addEventListener('pointerdown', (e) => { const p = e.target.closest && e.target.closest('[data-dkb]'); if (!p) return; e.preventDefault(); p.classList.add('down'); dkPress(p.dataset.dkb); });
document.addEventListener('pointerup', () => { document.querySelectorAll('.dkbtn.down').forEach((x) => x.classList.remove('down')); });

/* ---------- aggancio al Paese e al raccolto ---------- */
(() => {
  const tabs = $('paeseTabs');
  if (tabs && !tabs.querySelector('[data-pt="drink"]')) {
    const b = document.createElement('button'); b.setAttribute('role', 'tab'); b.dataset.pt = 'drink'; b.setAttribute('aria-selected', 'false'); b.textContent = 'BergoDrink';
    const help = tabs.querySelector('[data-pt="help"]'); tabs.insertBefore(b, help);
    const d = document.createElement('div'); d.id = 'pDrink'; d.hidden = true; d.innerHTML = '<div id="drinkBox"></div>';
    $('pHelp').after(d);
    d.addEventListener('click', drinkClick);
  }
  PAESE_RULES.drink = 'bergodrink';
  PT_ICON.drink = () => dkBottle({ juice: 1, cap: 1, bubbles: 1 });
  PT_LABEL.drink = 'Bergo­Drink'; PT_LABEL.help = 'Botte­ghe';
  const oldBadge = ptBadge;
  ptBadge = function (k) {
    if (k !== 'drink') return oldBadge(k);
    try { if (!dkUnlocked()) return ''; const D = dkState(), E = eco(); return D.orders.filter((o) => E.bergamotti >= o.items.length * DK_PER && D.en >= o.items.length).length || ''; } catch (e) { return ''; }
  };
  const oldDeco = decoratePaeseTabs;
  decoratePaeseTabs = function () {
    oldDeco();
    const tabs = $('paeseTabs'), b = tabs && tabs.querySelector('[data-pt="drink"]'), help = tabs && tabs.querySelector('[data-pt="help"]');
    if (b && help && b.nextElementSibling !== help) tabs.insertBefore(b, help);
    if (b) { const lock = !dkUnlocked(); b.classList.toggle('locked', lock); b.querySelector('.ptl').textContent = PT_LABEL.drink + (lock ? ' 🔒' : ''); if (lock) b.querySelector('.ptb').hidden = true; }
  };
  const oldRP = renderPaese;
  renderPaese = function () {
    if (paeseTab !== 'drink' && DK) dkQuit();
    oldRP.apply(this, arguments);
    $('pDrink').hidden = paeseTab !== 'drink';
    if (paeseTab === 'drink') renderDrink();
  };
  const oldGo = go;
  go = function (v) { if (v !== 'vPaese' && DK) dkQuit(); oldGo(v); };
  setInterval(() => { if (view === 'vPaese' && paeseTab === 'drink' && !DK && !ND.open) renderDrink(true); }, 1000);
  // il raccolto dell'albero ora dà anche i bergamotti per la fabbrica
  $('treeBox').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tree="harvest"]'); if (!b) return;
    const E = eco(), first = !E.harvests;
    if (treeStage(E.tree.g) !== 6) return;
    setTimeout(() => {
      if (E.bergamotti === undefined) E.bergamotti = 0;
      const n = 12 * (E.helpers.raccoglitrice ? 2 : 1); E.bergamotti += n; save();
      flash('+' + n + ' bergamotti per BergoDrink');
      if (first) setTimeout(() => { overlay('<div class="nickwin"><div class="nicknd">' + BERGO_SVG + '</div><div class="nickbub"><b>Bergo</b><span>' + tr2('Sti bergamotti su ttenticati. Mo i trasformamu ’nta na cosa fiina!', 'Questi bergamotti sono una meraviglia. Ora li trasformiamo in una cosa raffinata!') + '</span></div></div><button class="btn take" id="dkGo">Vai alla fabbrica</button><button class="btn alt" id="dkLater">Dopo</button>'); $('dkGo').onclick = () => { $('layer').innerHTML = ''; paeseTab = 'drink'; renderPaese(); }; $('dkLater').onclick = () => { $('layer').innerHTML = ''; }; }, 1200);
    }, 0);
  }, true);
})();
