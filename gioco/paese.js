/* ================= IL PAESE: bauli, albero di Bergo, salumificio, botteghe ================= */
const MIN = 60000, HOUR = 3600000;
const GRADES = {
  legno: { name: 'Baule di legno', time: 15 * MIN, c1: '#9B6A3C', c2: '#6B4424', band: '#3E2A18', odds: 50, xp: [20, 40], acqua: [2, 3], concime: [0, 1], carlini: [20, 40], tessera: 0 },
  rame: { name: 'Baule di rame', time: HOUR, c1: '#C9733A', c2: '#8E4A22', band: '#5A2E14', odds: 30, xp: [50, 80], acqua: [4, 6], concime: [1, 2], carlini: [60, 100], tessera: 0.08 },
  argento: { name: 'Baule d’argento', time: 3 * HOUR, c1: '#C9CED6', c2: '#8C949E', band: '#4E555E', odds: 15, xp: [120, 180], acqua: [8, 10], concime: [3, 4], carlini: [150, 250], tessera: 0.35 },
  oro: { name: 'Baule d’oro', time: 8 * HOUR, c1: '#F2C94C', c2: '#B8862B', band: '#6E4E12', odds: 5, xp: [300, 400], acqua: [14, 16], concime: [6, 8], carlini: [400, 600], tessera: 1 },
};
const SLOTS = 4;
const HELPERS = [
  { id: 'contadino', name: 'Il contadino', job: 'Zappa la terra attorno all’albero: ogni annaffiata vale di più.', cost: 300 },
  { id: 'pastore', name: 'Il pastore', job: 'Porta il concime delle sue pecore: uno ogni 2 ore.', cost: 500 },
  { id: 'raccoglitrice', name: 'La raccoglitrice', job: 'Raccoglie i bergamotti: il raccolto vale il doppio.', cost: 600 },
  { id: 'pastaia', name: 'La pastaia', job: 'Aiuta al salumificio: a volte prepara una coscia in più.', cost: 400 },
  { id: 'impagliatore', name: 'L’impagliatore', job: 'Apre la bottega delle sedie: guadagna carlini anche quando non giochi.', cost: 800 },
  { id: 'tessitrice', name: 'La tessitrice', job: 'Apre la bottega dei tappeti: guadagna più carlini delle sedie.', cost: 1200 },
];
const TREE_STAGES = [
  { g: 0, name: 'Seme' }, { g: 10, name: 'Germoglio' }, { g: 30, name: 'Piantina' }, { g: 60, name: 'Alberello' },
  { g: 100, name: 'Albero' }, { g: 150, name: 'Albero in fiore' }, { g: 220, name: 'Albero carico di bergamotti' },
];
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const fmtTime = (ms) => {
  if (ms <= 0) return 'pronto';
  const s = Math.ceil(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  return h ? h + 'h ' + String(m).padStart(2, '0') + 'm' : m ? m + 'm ' + String(r).padStart(2, '0') + 's' : r + 's';
};

function defaultEco() {
  const now = Date.now();
  return {
    carlini: 50, acqua: 3, concime: 1, chests: [{ id: 'c0', grade: 'legno', start: null, end: null, sped: false }],
    tree: { g: 0 }, helpers: {}, tessere: 0, harvests: 0, salBest: 0,
    shops: { sedie: { lvl: 1, last: now }, tappeti: { lvl: 1, last: now } }, pastoreLast: now,
  };
}
function eco() {
  if (!P.eco) P.eco = defaultEco();
  const d = defaultEco();
  for (const k of Object.keys(d)) if (P.eco[k] === undefined) P.eco[k] = d[k];
  return P.eco;
}

/* ---------- xp senza partita ---------- */
function gainXp(n) {
  const before = levelOf(P.xp);
  P.xp += n;
  const after = levelOf(P.xp);
  if (after > before) setTimeout(() => flash('Livello ' + after + '!'), 300);
  return AVATARS.filter((a) => a.lv > before && a.lv <= after);
}

/* ---------- bauli ---------- */
function rollGrade() {
  let r = Math.random() * 100;
  for (const [k, g] of Object.entries(GRADES)) { if ((r -= g.odds) < 0) return k; }
  return 'legno';
}
function grantChest(won) {
  const E = eco();
  if (!won && Math.random() > 0.25) return '';
  if (E.chests.length >= SLOTS) return '<div class="chestnote">I tuoi bauli sono pieni: aprine uno per fare spazio.</div>';
  const grade = won ? rollGrade() : 'legno';
  E.chests.push({ id: 'c' + Date.now().toString(36), grade, start: null, end: null, sped: false });
  return '<div class="chestnote"><span class="chmini">' + chestSVG(grade) + '</span>Hai trovato un <b>' + GRADES[grade].name.toLowerCase() + '</b>! Lo trovi nella sezione Bauli.</div>';
}
function chestSVG(grade, open) {
  const g = GRADES[grade];
  return '<svg viewBox="0 0 120 100" class="chestsvg' + (open ? ' open' : '') + '" aria-hidden="true">' +
    '<ellipse cx="60" cy="94" rx="48" ry="5" fill="#000" opacity="0.25"/>' +
    '<rect x="14" y="44" width="92" height="48" rx="6" fill="' + g.c2 + '" stroke="#1A1A1A" stroke-width="3"/>' +
    '<rect x="14" y="44" width="92" height="12" fill="' + g.c1 + '" stroke="#1A1A1A" stroke-width="3"/>' +
    '<rect x="30" y="44" width="8" height="48" fill="' + g.band + '"/><rect x="82" y="44" width="8" height="48" fill="' + g.band + '"/>' +
    '<g class="lid"><path d="M14 46 L14 30 Q14 10 60 10 Q106 10 106 30 L106 46 Z" fill="' + g.c1 + '" stroke="#1A1A1A" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M30 46 L30 14 M38 46 L38 12 M82 46 L82 12 M90 46 L90 14" stroke="' + g.band + '" stroke-width="4"/>' +
    '<path d="M22 24 Q60 6 98 24" fill="none" stroke="#fff" stroke-opacity="0.35" stroke-width="3"/></g>' +
    '<rect x="51" y="38" width="18" height="22" rx="3" fill="#F2C94C" stroke="#1A1A1A" stroke-width="2.5"/><circle cx="60" cy="48" r="3" fill="#1A1A1A"/>' +
    '</svg>';
}
function chestReward(grade) {
  const g = GRADES[grade];
  const r = { xp: rnd(...g.xp), acqua: rnd(...g.acqua), concime: rnd(...g.concime), carlini: rnd(...g.carlini), tessera: Math.random() < g.tessera ? 1 : 0 };
  const E = eco();
  E.acqua += r.acqua; E.concime += r.concime; E.carlini += r.carlini; E.tessere += r.tessera;
  r.newAv = gainXp(r.xp);
  return r;
}
let chestTimer = null;
let chestKey = '';
function renderChests(soft) {
  const E = eco(); chestQueueTick(E); const now = Date.now();
  const S = scrigno(), key = E.chests.map((c) => c.id + (c.end ? (c.end <= now ? 'r' : 'u') : c.queued ? 'q' : 'n') + (c.sped ? 's' : '')).join() + '|' + S.n + S.done;
  if (soft && key === chestKey) {
    E.chests.forEach((c, i) => { const el = document.querySelector('#chestGrid .chest:nth-child(' + (i + 1) + ') .tm'); if (el && c.end) el.textContent = fmtTime(c.end - now); });
    const dn = document.querySelector('#chestVideo .chvdone'); if (dn) { const mid = new Date(); mid.setHours(24, 0, 0, 0); dn.textContent = 'Fatto! Torna fra ' + fmtTime(mid - now); }
    return;
  }
  chestKey = key;
  const busy = E.chests.some((c) => c.end && c.end > now);
  let html = '';
  for (let i = 0; i < SLOTS; i++) {
    const c = E.chests[i];
    if (!c) { html += '<div class="chest empty"><span>Posto libero</span><small>Vinci una partita per trovare un baule</small></div>'; continue; }
    const inside = '<small class="chin">' + GRADES[c.grade].carlini[0] + '–' + GRADES[c.grade].carlini[1] + ' carlini</small>';
    const g = GRADES[c.grade];
    const ready = c.end && c.end <= now;
    const running = c.end && c.end > now;
    let act;
    if (ready) act = '<button class="btn take small" data-chest="open" data-i="' + i + '">Apri</button>';
    else if (running) act = '<span class="tm">' + fmtTime(c.end - now) + '</span>' + (c.sped ? '' : '<button class="btn ghost small" data-chest="speed" data-i="' + i + '">Video: dimezza</button>');
    else if (c.queued) act = '<small>In coda: si apre dopo l’altro</small><button class="btn ghost small" data-chest="unqueue" data-i="' + i + '">Togli dalla coda</button>';
    else act = busy ? '<button class="btn ghost small" data-chest="queue" data-i="' + i + '">Metti in coda · ' + fmtTime(g.time) + '</button>' : '<button class="btn small" data-chest="start" data-i="' + i + '">Sblocca · ' + fmtTime(g.time) + '</button>';
    html += '<div class="chest g-' + c.grade + (ready ? ' ready' : '') + (c.queued ? ' queued' : '') + '"><div class="chpic">' + chestSVG(c.grade) + '</div><b>' + g.name + '</b>' + inside + act + '</div>';
  }
  $('chestGrid').innerHTML = html;
  const nr = E.chests.filter((c) => c.end && c.end <= now).length;
  $('chestAll').innerHTML = nr >= 2 ? '<button class="btn take" data-chall="1">Apri tutti i bauli pronti (' + nr + ')</button>' : '';
  $('chestVideo').innerHTML = scrignoHTML();
  $('chestInfo').innerHTML = Object.entries(GRADES).map(([k, g]) => '<li><span class="chmini">' + chestSVG(k) + '</span><b>' + g.name + '</b> · si apre in ' + fmtTime(g.time) + ' · ' + g.carlini[0] + '–' + g.carlini[1] + ' carlini, ' + g.acqua[0] + '–' + g.acqua[1] + ' acqua, ' + g.concime[0] + '–' + g.concime[1] + ' concime, ' + g.xp[0] + '–' + g.xp[1] + ' XP' + (g.tessera ? (g.tessera === 1 ? ', una tessera aiutante' : ', a volte una tessera aiutante') : '') + '</li>').join('');
  renderRes();
}
function readyChests() { const E = eco(); chestQueueTick(E); const now = Date.now(); return E.chests.filter((c) => c.end && c.end <= now).length; }
/* 1.3.12: bauli in coda: quando finisce quello che si sta aprendo, parte da solo il prossimo (anche a gioco chiuso) */
function chestQueueTick(E) {
  let changed = false;
  for (;;) {
    const now = Date.now(), running = E.chests.find((c) => c.end && c.end > now);
    if (running) break;
    const q = E.chests.filter((c) => c.queued && !c.end).sort((a, b) => a.queued - b.queued)[0];
    if (!q) break;
    const lastEnd = Math.max(0, ...E.chests.filter((c) => c.end).map((c) => c.end));
    const st = Math.max(q.queued, Math.min(now, lastEnd || now));
    q.start = st; q.end = st + GRADES[q.grade].time; delete q.queued; changed = true;
  }
  if (changed) save();
}
/* 1.3.12: u scrignu d'u Signor 'Nduja: 3 video = 1000 carlini, una volta al giorno */
const SCRIGNO_N = 3, SCRIGNO_C = 1000;
const scrDay = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
function scrigno() { const E = eco(); if (!E.scrigno || E.scrigno.d !== scrDay()) E.scrigno = { d: scrDay(), n: 0, done: false }; return E.scrigno; }
function scrignoHTML() {
  const S = scrigno(), dots = Array.from({ length: SCRIGNO_N }, (_, k) => '<i class="' + (k < S.n ? 'on' : '') + '"></i>').join('');
  const mid = new Date(); mid.setHours(24, 0, 0, 0);
  const act = S.done ? '<span class="chvdone">Fatto! Torna fra ' + fmtTime(mid - Date.now()) + '</span>' : '<button class="btn take small" data-chv="1">▶ Guarda il video ' + (S.n + 1) + ' di ' + SCRIGNO_N + '</button>';
  return '<div class="chvid' + (S.done ? ' done' : '') + '"><div class="chvpic">' + chestSVG('oro', S.done) + '</div><div class="chvtx"><b>U scrignu d’u Signor ’Nduja</b><small>Guarda ' + SCRIGNO_N + ' video e vinci <b>' + SCRIGNO_C.toLocaleString('it-IT') + ' carlini</b>. Si rinnova ogni giorno.</small><div class="chvdots">' + dots + '</div>' + act + '</div></div>';
}
async function scrignoWatch() {
  const S = scrigno(); if (S.done) return;
  const got = await showRewardedAd();
  if (!got) { renderChests(); return; }
  S.n++;
  if (S.n >= SCRIGNO_N) {
    S.done = true; eco().carlini += SCRIGNO_C; save(); fx('big');
    if (typeof track === 'function') track('scrigno_done', {});
    $('layer').innerHTML = '<div class="overlay" role="dialog" aria-modal="true"><div class="sheet chestopen"><div class="bigchest">' + chestSVG('oro', true) + '<div class="sparks"></div></div><h2>U scrignu è tuo!</h2><div class="loot"><div><b>+' + SCRIGNO_C.toLocaleString('it-IT') + '</b><small>carlini</small></div></div><p>Torna domani per un altro scrigno.</p><button class="btn" id="chOk">Bello!</button></div></div>';
    $('chOk').onclick = () => { $('layer').innerHTML = ''; renderChests(); };
  } else { save(); flash('Video ' + S.n + ' di ' + SCRIGNO_N + '!'); }
  renderChests();
}
$('chestVideo').addEventListener('click', (e) => { if (e.target.closest('[data-chv]')) scrignoWatch(); });
function openAllChests() {
  const E = eco(), now = Date.now(), ready = E.chests.filter((c) => c.end && c.end <= now);
  if (!ready.length) return;
  const tot = { carlini: 0, acqua: 0, concime: 0, xp: 0, tessera: 0 }, av = [];
  for (const c of ready) { E.chests.splice(E.chests.indexOf(c), 1); const r = chestReward(c.grade); for (const k of Object.keys(tot)) tot[k] += r[k] || 0; av.push(...r.newAv); }
  chestQueueTick(E); save(); fx('big');
  $('layer').innerHTML = '<div class="overlay" role="dialog" aria-modal="true"><div class="sheet chestopen"><div class="bigchest">' + chestSVG(ready[0].grade, true) + '<div class="sparks"></div></div>' +
    '<h2>' + ready.length + ' bauli aperti!</h2><div class="loot"><div><b>+' + tot.carlini + '</b><small>carlini</small></div><div><b>+' + tot.acqua + '</b><small>acqua</small></div><div><b>+' + tot.concime + '</b><small>concime</small></div><div><b>+' + tot.xp + '</b><small>XP</small></div>' +
    (tot.tessera ? '<div class="tess"><b>+' + tot.tessera + '</b><small>tessere aiutante</small></div>' : '') + '</div>' + av.map((a) => storyHTML(a.id, 'Nuova icona sbloccata')).join('') + '<button class="btn" id="chOk">Bello!</button></div></div>';
  $('chOk').onclick = () => { $('layer').innerHTML = ''; renderChests(); };
}
$('chestAll').addEventListener('click', (e) => { if (e.target.closest('[data-chall]')) openAllChests(); });
$('chestGrid').addEventListener('click', async (e) => {
  const b = e.target.closest('[data-chest]');
  if (!b) return;
  const E = eco(), i = Number(b.dataset.i), c = E.chests[i], now = Date.now();
  if (!c) return;
  if (b.dataset.chest === 'start' && !E.chests.some((x) => x.end && x.end > now)) { c.start = now; c.end = now + GRADES[c.grade].time; save(); renderChests(); }
  if (b.dataset.chest === 'queue' && !c.end) { c.queued = now; save(); flash('In coda!'); renderChests(); }
  if (b.dataset.chest === 'unqueue') { delete c.queued; save(); renderChests(); }
  if (b.dataset.chest === 'speed' && !c.sped) {
    const got = await showRewardedAd();
    if (got) { c.sped = true; c.end = Date.now() + Math.max(0, (c.end - Date.now()) / 2); save(); flash('Tempo dimezzato'); }
    renderChests();
  }
  if (b.dataset.chest === 'open' && c.end && c.end <= now) {
    E.chests.splice(i, 1);
    const r = chestReward(c.grade);
    chestQueueTick(E); save();
    fx('big');
    $('layer').innerHTML = '<div class="overlay" role="dialog" aria-modal="true"><div class="sheet chestopen"><div class="bigchest">' + chestSVG(c.grade, true) + '<div class="sparks"></div></div>' +
      '<h2>' + GRADES[c.grade].name + '</h2><div class="loot">' +
      '<div><b>+' + r.carlini + '</b><small>carlini</small></div><div><b>+' + r.acqua + '</b><small>acqua</small></div><div><b>+' + r.concime + '</b><small>concime</small></div><div><b>+' + r.xp + '</b><small>XP</small></div>' +
      (r.tessera ? '<div class="tess"><b>+1</b><small>tessera aiutante</small></div>' : '') + '</div>' +
      (r.newAv.length ? r.newAv.map((a) => storyHTML(a.id, 'Nuova icona sbloccata')).join('') : '') +
      '<button class="btn" id="chOk">Bello!</button></div></div>';
    $('chOk').onclick = () => { $('layer').innerHTML = ''; renderChests(); };
    setTimeout(() => $('chOk').focus(), 50);
  }
});

/* ---------- risorse ---------- */
function renderRes() {
  const E = eco();
  const html = '<span><i class="ico coin"></i><b>' + E.carlini + '</b> carlini</span><span><i class="ico water"></i><b>' + E.acqua + '</b> acqua</span><span><i class="ico dung"></i><b>' + E.concime + '</b> concime</span>' + (E.tessere ? '<span><i class="ico card"></i><b>' + E.tessere + '</b> tessere</span>' : '');
  document.querySelectorAll('.resbar').forEach((el) => { el.innerHTML = html; });
}

/* ---------- albero di bergamotto ---------- */
function treeStage(g) { let s = 0; TREE_STAGES.forEach((t, i) => { if (g >= t.g) s = i; }); return s; }
function seeded(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function leafCluster(cx, cy, r, n, rand, cols) {
  let s = '<circle cx="' + cx + '" cy="' + cy + '" r="' + r * 0.92 + '" fill="' + cols[0] + '" stroke="#1A1A1A" stroke-width="2.2"/>';
  for (let i = 0; i < n; i++) {
    const a = rand() * Math.PI * 2, d = Math.sqrt(rand()) * r * 0.85;
    const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.9;
    const rot = rand() * 180, L = 6 + rand() * 5;
    const c = cols[1 + Math.floor(rand() * (cols.length - 1))];
    s += '<ellipse cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="' + L.toFixed(1) + '" ry="' + (L * 0.42).toFixed(1) + '" transform="rotate(' + rot.toFixed(0) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')" fill="' + c + '"/>';
  }
  // bordo frastagliato di foglie sul contorno
  for (let i = 0; i < Math.round(n / 3); i++) {
    const a = (i / Math.round(n / 3)) * Math.PI * 2 + rand() * 0.3;
    const x = cx + Math.cos(a) * r * 0.92, y = cy + Math.sin(a) * r * 0.92 * 0.95;
    s += '<ellipse cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="7" ry="3.2" transform="rotate(' + (a * 57.3 + 90).toFixed(0) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')" fill="' + cols[1] + '" stroke="#1A1A1A" stroke-width="1.2"/>';
  }
  return s;
}
function bergamot(x, y, k) {
  return '<g class="frutto"><path d="M' + x + ' ' + (y - 10 * k) + ' q' + 4 * k + ' ' + (-6 * k) + ' ' + 9 * k + ' ' + (-5 * k) + ' q' + (-3 * k) + ' ' + 5 * k + ' ' + (-9 * k) + ' ' + 5 * k + 'z" fill="#3A7D44" stroke="#1A1A1A" stroke-width="1.2"/>' +
    '<circle cx="' + x + '" cy="' + y + '" r="' + 9 * k + '" fill="#E3D23B" stroke="#1A1A1A" stroke-width="2"/>' +
    '<circle cx="' + (x - 3 * k) + '" cy="' + (y - 3 * k) + '" r="' + 2.8 * k + '" fill="#F8F1A0"/>' +
    '<circle cx="' + (x + 3 * k) + '" cy="' + (y + 4 * k) + '" r="' + 1.2 * k + '" fill="#B9B02A"/></g>';
}
function zagara(x, y) {
  let s = '<g class="fiore">';
  for (let i = 0; i < 5; i++) { const a = i * 72; s += '<ellipse cx="' + x + '" cy="' + (y - 4) + '" rx="2.4" ry="4.2" transform="rotate(' + a + ' ' + x + ' ' + y + ')" fill="#fff" stroke="#1A1A1A" stroke-width="0.8"/>'; }
  return s + '<circle cx="' + x + '" cy="' + y + '" r="1.8" fill="#F2C94C"/></g>';
}
function sceneBG(stage) {
  return '<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9FD3EE"/><stop offset="0.7" stop-color="#F5E7C4"/></linearGradient>' +
    '<linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3E8CC4"/><stop offset="1" stop-color="#2E6FA0"/></linearGradient></defs>' +
    '<rect width="300" height="260" fill="url(#sky)"/>' +
    '<g class="sole"><circle cx="252" cy="44" r="20" fill="#F7D44C" stroke="#E5A82A" stroke-width="2"/>' +
    Array.from({ length: 10 }, (_, i) => { const a = i * 36 * Math.PI / 180; return '<path d="M' + (252 + Math.cos(a) * 26).toFixed(1) + ' ' + (44 + Math.sin(a) * 26).toFixed(1) + ' L' + (252 + Math.cos(a) * 34).toFixed(1) + ' ' + (44 + Math.sin(a) * 34).toFixed(1) + '" stroke="#F2C94C" stroke-width="3" stroke-linecap="round"/>'; }).join('') + '</g>' +
    '<g class="nuvola"><ellipse cx="60" cy="38" rx="22" ry="9" fill="#fff"/><ellipse cx="76" cy="33" rx="14" ry="9" fill="#fff"/><ellipse cx="46" cy="34" rx="11" ry="7" fill="#fff"/></g>' +
    '<g class="nuvola n2"><ellipse cx="170" cy="24" rx="16" ry="6" fill="#fff" opacity="0.9"/><ellipse cx="181" cy="20" rx="10" ry="6" fill="#fff" opacity="0.9"/></g>' +
    '<rect x="0" y="118" width="300" height="22" fill="url(#sea)"/>' +
    '<path d="M196 118 Q214 104 232 110 Q248 100 266 108 Q286 102 300 110 L300 118 Z" fill="#7FA3B8"/>' +
    '<path d="M0 128 Q40 108 90 120 Q140 100 190 124 Q240 112 300 126 L300 160 L0 160 Z" fill="#7DAA5A" stroke="#1A1A1A" stroke-width="1.5"/>' +
    '<g stroke="#1A1A1A" stroke-width="1"><rect x="34" y="112" width="12" height="9" fill="#FBF6EA"/><path d="M32 113 L40 106 L48 113 Z" fill="#C8562E"/><rect x="50" y="115" width="9" height="7" fill="#FBF6EA"/><path d="M48 116 L54.5 110 L61 116 Z" fill="#C8562E"/><rect x="24" y="117" width="8" height="6" fill="#FBF6EA"/><path d="M22 118 L28 113 L34 118 Z" fill="#C8562E"/></g>' +
    '<path d="M0 150 Q70 136 150 146 Q230 136 300 148 L300 260 L0 260 Z" fill="#9BC46A" stroke="#1A1A1A" stroke-width="2"/>' +
    '<g fill="none" stroke="#6E9A48" stroke-width="2" stroke-linecap="round"><path d="M20 190 l3 -8 M24 190 l-2 -9 M28 191 l4 -7"/><path d="M262 200 l3 -8 M266 200 l-2 -9 M270 201 l4 -7"/><path d="M200 236 l3 -8 M204 236 l-2 -9"/><path d="M60 240 l3 -8 M64 240 l-2 -9"/></g>' +
    '<g stroke="#1A1A1A" stroke-width="1.5"><path d="M228 176 h56 v10 h-56 z M232 166 v28 M248 166 v28 M264 166 v28 M280 166 v28" fill="#B07A44"/></g>' +
    '<g stroke="#1A1A1A" stroke-width="1.4" fill="#BFB6A4"><ellipse cx="14" cy="214" rx="12" ry="7"/><ellipse cx="34" cy="216" rx="10" ry="6"/><ellipse cx="24" cy="206" rx="10" ry="6"/></g>' +
    (stage >= 2 ? '<g>' + [[40, 228, '#E8735E'], [250, 222, '#F2C94C'], [214, 246, '#fff']].map(([x, y, c]) => '<circle cx="' + x + '" cy="' + y + '" r="3.5" fill="' + c + '" stroke="#1A1A1A" stroke-width="1"/>').join('') + '</g>' : '');
}
function treeSVG(stage) {
  const rand = seeded(1234 + stage);
  let s = '<svg viewBox="0 0 300 260" class="treesvg" aria-hidden="true">' + sceneBG(stage);
  s += '<ellipse cx="150" cy="226" rx="70" ry="13" fill="#7A5230" stroke="#1A1A1A" stroke-width="2"/><ellipse cx="150" cy="223" rx="60" ry="8" fill="#9C6B3E"/>';
  if (stage === 0) {
    s += '<path d="M138 222 Q150 208 162 222 Z" fill="#8A5E38" stroke="#1A1A1A" stroke-width="2"/><ellipse class="seme" cx="150" cy="212" rx="6" ry="4" fill="#E2C48A" stroke="#1A1A1A" stroke-width="1.8"/>' +
      '<g><path d="M186 224 L186 196" stroke="#6B4A2E" stroke-width="4"/><rect x="168" y="184" width="40" height="18" rx="3" fill="#C8955A" stroke="#1A1A1A" stroke-width="2"/><text x="188" y="197" text-anchor="middle" font-family="Alegreya SC, serif" font-weight="800" font-size="10" fill="#2A2218">BERGO</text></g>';
    return s + '</svg>';
  }
  if (stage === 1) {
    s += '<g class="chioma"><path d="M150 224 Q149 210 150 196" stroke="#5E9E55" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<path d="M150 200 Q134 186 126 196 Q138 206 150 200 Z" fill="#6FA85E" stroke="#1A1A1A" stroke-width="2"/><path d="M150 196 Q164 180 174 190 Q162 202 150 196 Z" fill="#5E9E55" stroke="#1A1A1A" stroke-width="2"/>' +
      '<path d="M150 197 Q148 186 152 180 Q156 188 150 197 Z" fill="#8CC07A" stroke="#1A1A1A" stroke-width="1.5"/></g>';
    return s + '</svg>';
  }
  const H = [0, 0, 56, 84, 104, 110, 112][stage], top = 224 - H;
  const tw = [0, 0, 4, 7, 10, 11, 12][stage];
  // radici e tronco
  s += '<path d="M' + (150 - tw - 8) + ' 226 Q' + (150 - tw) + ' 220 ' + (150 - tw) + ' 212 L' + (150 - tw * 0.6) + ' ' + top + ' L' + (150 + tw * 0.6) + ' ' + top + ' L' + (150 + tw) + ' 212 Q' + (150 + tw) + ' 220 ' + (150 + tw + 9) + ' 226 Z" fill="#7A4E2A" stroke="#1A1A1A" stroke-width="2.5" stroke-linejoin="round"/>';
  if (stage >= 3) s += '<g fill="none" stroke="#5A3A1E" stroke-width="1.4" stroke-linecap="round"><path d="M' + (150 - tw * 0.4) + ' 210 q3 -10 0 -22"/><path d="M' + (150 + tw * 0.3) + ' 200 q-3 -12 1 -24"/></g>';
  const cols = ['#2B6435', '#3E8445', '#4F9A50', '#2F7038', '#64AE5C'];
  const R = [0, 0, 26, 40, 52, 56, 58][stage];
  const cy = top - R * 0.45;
  if (stage >= 3) {
    s += '<g fill="none" stroke="#7A4E2A" stroke-width="' + Math.max(3, tw * 0.5) + '" stroke-linecap="round"><path d="M150 ' + (top + 14) + ' Q' + (150 - R * 0.6) + ' ' + (top - 2) + ' ' + (150 - R * 0.9) + ' ' + (cy + R * 0.1) + '"/><path d="M150 ' + (top + 10) + ' Q' + (150 + R * 0.55) + ' ' + (top - 4) + ' ' + (150 + R * 0.92) + ' ' + (cy + R * 0.05) + '"/></g>';
  }
  s += '<g class="chioma">';
  const clusters = stage === 2 ? [[0, 0, 1]] : [[-0.62, 0.18, 0.62], [0.62, 0.15, 0.62], [0, -0.35, 0.72], [-0.32, -0.62, 0.48], [0.36, -0.6, 0.5], [0, 0.12, 0.7]];
  for (const [dx, dy, k] of clusters) s += leafCluster(150 + dx * R, cy + dy * R, R * k, Math.round(18 * k * (stage >= 4 ? 1.6 : 1.2)), rand, cols);
  const spots = [[-38, -6], [26, -30], [40, 8], [-14, -44], [-46, 16], [10, 12], [30, -12], [-24, 22], [-4, -20], [48, -16], [-34, -28], [18, 26]];
  if (stage === 5) s += spots.map(([x, y]) => zagara(150 + x * R / 56, cy + y * R / 56)).join('');
  if (stage === 6) s += spots.map(([x, y], i) => bergamot(150 + x * R / 56, cy + y * R / 56 + 4, i % 3 === 0 ? 1.1 : 0.95)).join('');
  s += '</g>';
  if (stage >= 5) s += '<g class="farfalla"><path d="M0 0 q-7 -9 -11 -2 q4 6 11 2 q7 -9 11 -2 q-4 6 -11 2" fill="#F2A65A" stroke="#1A1A1A" stroke-width="1.2"/><path d="M0 -3 v6" stroke="#1A1A1A" stroke-width="1.6"/></g>';
  return s + '</svg>';
}
function helperFigs() {
  const E = eco();
  const H = [['contadino', 'zappa', 'left:4%;bottom:6%'], ['pastore', 'porta il concime', 'right:4%;bottom:6%'], ['raccoglitrice', 'raccoglie', 'left:4%;bottom:34%']];
  return H.filter(([id]) => E.helpers[id]).map(([id, t, pos]) => '<div class="tfig" style="' + pos + '"><img src="' + AVIMG[id] + '" alt=""><span>' + t + '</span></div>').join('');
}
let treeFx = null;
function renderTree() {
  const E = eco();
  const st = treeStage(E.tree.g), next = TREE_STAGES[st + 1];
  const pct = next ? Math.round(((E.tree.g - TREE_STAGES[st].g) / (next.g - TREE_STAGES[st].g)) * 100) : 100;
  const drops = treeFx === 'water' ? '<div class="drops">' + Array.from({ length: 9 }, (_, i) => '<i style="left:' + (38 + i * 3) + '%;animation-delay:' + (i % 3) * 0.12 + 's"></i>').join('') + '</div>' : '';
  const dung = treeFx === 'dung' ? '<div class="sparkle"></div>' : '';
  $('treeBox').innerHTML = '<div class="treepic">' + treeSVG(st) + drops + dung + helperFigs() + '<div class="treebergo">' + BERGO_SVG + '</div></div>' +
    '<div class="treeinfo"><b>' + TREE_STAGES[st].name + '</b><div class="xpbar"><i style="width:' + pct + '%"></i></div><small>' + (next ? 'Crescita ' + E.tree.g + ' / ' + next.g + ' per diventare ' + next.name.toLowerCase() : 'Pronto per il raccolto!') + '</small>' +
    '<div class="treebtns"><button class="btn small" data-tree="water"' + (E.acqua ? '' : ' disabled') + '>Annaffia (1 acqua)</button><button class="btn small" data-tree="dung"' + (E.concime ? '' : ' disabled') + '>Concima (1 concime)</button>' +
    (st === 6 ? '<button class="btn take small" data-tree="harvest">Raccogli i bergamotti</button>' : '') + '</div>' +
    '<small class="hint">' + (E.helpers.contadino ? 'Il contadino zappa la terra: ogni annaffiata vale 5 invece di 3. ' : '') + (E.helpers.raccoglitrice ? 'La raccoglitrice raddoppia il raccolto. ' : '') + (E.harvests ? 'Raccolti fatti: ' + E.harvests + '.' : '') + '</small></div>';
  if (treeFx) { const k = treeFx; setTimeout(() => { if (treeFx === k) treeFx = null; }, 900); }
}
$('treeBox').addEventListener('click', (e) => {
  const pic = e.target.closest('.treesvg');
  if (pic) { pic.classList.remove('shake'); void pic.getBoundingClientRect(); pic.classList.add('shake'); fx('card'); return; }
  const b = e.target.closest('[data-tree]');
  if (!b || b.disabled) return;
  const E = eco();
  const st = treeStage(E.tree.g);
  if (b.dataset.tree === 'water' && E.acqua > 0 && st < 6) { treeFx = 'water'; E.acqua--; E.tree.g += E.helpers.contadino ? 5 : 3; fx('take'); }
  else if (b.dataset.tree === 'dung' && E.concime > 0 && st < 6) { treeFx = 'dung'; E.concime--; E.tree.g += 8; fx('take'); }
  else if (b.dataset.tree === 'harvest' && st === 6) {
    const c = 120 * (E.helpers.raccoglitrice ? 2 : 1);
    E.carlini += c; E.tree.g = TREE_STAGES[4].g; E.harvests++;
    gainXp(60);
    say('settebello', 0);
    flash('+' + c + ' carlini');
  } else if (st === 6) { flash('Prima raccogli!'); }
  const nst = treeStage(E.tree.g);
  if (nst > st && nst < 6) flash(TREE_STAGES[nst].name + '!');
  if (nst === 6 && st < 6) flash('Bergamotti maturi!');
  save(); renderTree(); renderRes();
});

/* ---------- aiutanti e botteghe ---------- */
const SHOP = { sedie: { name: 'Bottega delle sedie', helper: 'impagliatore', rate: 30, cost: 200 }, tappeti: { name: 'Bottega dei tappeti', helper: 'tessitrice', rate: 60, cost: 400 } };
function shopStock(k) { const E = eco(), s = E.shops[k], r = SHOP[k].rate * s.lvl; return Math.floor(Math.min(8, (Date.now() - s.last) / HOUR) * r); }
function pastoreStock() { const E = eco(); return Math.min(6, Math.floor((Date.now() - E.pastoreLast) / (2 * HOUR))); }
function renderHelpers() {
  const E = eco();
  $('helperList').innerHTML = HELPERS.map((h) => {
    const own = !!E.helpers[h.id];
    let extra = '';
    if (own && h.id === 'pastore') { const n = pastoreStock(); extra = '<button class="btn small take" data-help="dung"' + (n ? '' : ' disabled') + '>Raccogli concime (' + n + ')</button>'; }
    if (own && (h.id === 'impagliatore' || h.id === 'tessitrice')) {
      const k = h.id === 'impagliatore' ? 'sedie' : 'tappeti', s = E.shops[k], n = shopStock(k);
      extra = '<div class="shoprow"><span>' + SHOP[k].name + ' · livello ' + s.lvl + ' · ' + SHOP[k].rate * s.lvl + ' carlini l’ora</span>' +
        '<button class="btn small take" data-help="collect" data-k="' + k + '"' + (n ? '' : ' disabled') + '>Incassa ' + n + '</button>' +
        (s.lvl < 5 ? '<button class="btn small" data-help="up" data-k="' + k + '"' + (E.carlini >= SHOP[k].cost * s.lvl ? '' : ' disabled') + '>Migliora · ' + SHOP[k].cost * s.lvl + '</button>' : '<small>Livello massimo</small>') + '</div>';
    }
    const buy = own ? '<span class="own">Al lavoro</span>' :
      (E.tessere ? '<button class="btn small take" data-help="card" data-k="' + h.id + '">Usa una tessera</button>' : '') +
      '<button class="btn small" data-help="buy" data-k="' + h.id + '"' + (E.carlini >= h.cost ? '' : ' disabled') + '>Assumi · ' + h.cost + ' carlini</button>';
    return '<div class="helper' + (own ? ' on' : '') + '"><img src="' + AVIMG[h.id] + '" alt=""><div><b>' + h.name + '</b><small>' + h.job + '</small><div class="hbtns">' + buy + extra + '</div></div></div>';
  }).join('');
}
$('helperList').addEventListener('click', (e) => {
  const b = e.target.closest('[data-help]');
  if (!b || b.disabled) return;
  const E = eco(), k = b.dataset.k;
  if (b.dataset.help === 'buy') { const h = HELPERS.find((x) => x.id === k); if (E.carlini >= h.cost) { E.carlini -= h.cost; E.helpers[k] = true; if (k === 'pastore') E.pastoreLast = Date.now(); if (SHOP[k === 'impagliatore' ? 'sedie' : 'tappeti'] && (k === 'impagliatore' || k === 'tessitrice')) E.shops[k === 'impagliatore' ? 'sedie' : 'tappeti'].last = Date.now(); flash('Benvenuto!'); } }
  if (b.dataset.help === 'card' && E.tessere > 0) { E.tessere--; E.helpers[k] = true; if (k === 'pastore') E.pastoreLast = Date.now(); if (k === 'impagliatore') E.shops.sedie.last = Date.now(); if (k === 'tessitrice') E.shops.tappeti.last = Date.now(); flash('Benvenuto!'); }
  if (b.dataset.help === 'dung') { const n = pastoreStock(); E.concime += n; E.pastoreLast += n * 2 * HOUR; if (Date.now() - E.pastoreLast > 12 * HOUR) E.pastoreLast = Date.now(); flash('+' + n + ' concime'); }
  if (b.dataset.help === 'collect') { const n = shopStock(k); E.carlini += n; E.shops[k].last = Date.now(); fx('take'); flash('+' + n + ' carlini'); }
  if (b.dataset.help === 'up') { const c = SHOP[k].cost * E.shops[k].lvl; if (E.carlini >= c && E.shops[k].lvl < 5) { E.carlini -= c; E.shops[k].lvl++; fx('big'); } }
  save(); renderHelpers(); renderRes();
});

const CUSTOMERS = ['rammendatrice', 'pescatore', 'lanzaturi', 'tessitrice', 'pastore', 'casaro', 'raccoglitrice', 'contadino', 'massaro', 'impagliatore', 'zampognaro'];
/* ---------- salumificio: griglia da unire ---------- */
const COLS = 6, ROWS = 7;
const CHAIN = [
  null,
  { name: 'Coscia di maiale', price: 3 },
  { name: 'Carne macinata', price: 7 },
  { name: 'Salsiccia cruda', price: 15 },
  { name: 'Salsiccia stagionata', price: 32 },
  { name: 'Soppressata', price: 65 },
  { name: 'Capocollo', price: 130 },
  { name: '’Nduja', price: 260 },
  { name: 'Tagliere calabrese', price: 520 },
];
const MAXL = CHAIN.length - 1;
/* i formaggi del casaro: codici da 101 a 108 */
const CHEESE = [
  { name: 'Secchio di latte', price: 4 }, { name: 'Giuncata', price: 9 }, { name: 'Ricotta', price: 18 }, { name: 'Ricotta affumicata', price: 36 },
  { name: 'Provola silana', price: 70 }, { name: 'Butirro', price: 140 }, { name: 'Pecorino crotonese', price: 280 }, { name: 'Caciocavallo silano', price: 560 },
];
CHEESE.forEach((c, i) => { CHAIN[101 + i] = c; });
const MAXC = 108;
/* 1.3.10: il forno della nonna, pane e dolci calabresi: codici da 201 a 208 */
const BREAD = [
  { name: 'Spiga di grano', price: 4 }, { name: 'Sacco di farina', price: 9 }, { name: 'Impasto', price: 18 }, { name: 'Pane di casa', price: 36 },
  { name: 'Pitta calabrese', price: 72 }, { name: 'Zeppole', price: 145 }, { name: 'Pitta ’mpigliata', price: 290 }, { name: 'Cesto della festa', price: 580 },
];
BREAD.forEach((c, i) => { CHAIN[201 + i] = c; });
const MAXF = 208, BREAD_AT = 104;   // si apre con la ricotta affumicata
const isCheese = (v) => typeof v === 'number' && v > 100 && v < 200;
const isBread = (v) => typeof v === 'number' && v > 200;
const mgLv = (v) => (v > 200 ? v - 200 : v > 100 ? v - 100 : v);
const isGen = (v) => v === 'G' || v === 'C' || v === 'F';
const BREAD_LINES = ['Nu pani caudu caudu, comu chiddu d’a nonna!', 'Pe Natali mi servinu i zeppuli!', 'A pitta ’mpigliata è a festa d’a casa!', 'Nu pezzu i pitta e nu pocu i ’nduja, e sugnu cuntentu!', 'U furnu a ligna faci u pani chiù bonu d’u mundu!'];
if (typeof IT !== 'undefined') Object.assign(IT, { 'Nu pani caudu caudu, comu chiddu d’a nonna!': 'Un pane caldo caldo, come quello della nonna!', 'Pe Natali mi servinu i zeppuli!': 'Per Natale mi servono le zeppole!', 'A pitta ’mpigliata è a festa d’a casa!': 'La pitta ’mpigliata è la festa della casa!', 'Nu pezzu i pitta e nu pocu i ’nduja, e sugnu cuntentu!': 'Un pezzo di pitta e un po’ di ’nduja, e sono contento!', 'U furnu a ligna faci u pani chiù bonu d’u mundu!': 'Il forno a legna fa il pane più buono del mondo!' });
const CHEESE_LINES = ['Na soppressata e nu caciocavallo pe stasira!', 'A ricotta frisca è a megghiu cosa d’u mundu!', 'Pe’ a pasta ci voli nu bellu pecorinu!', 'U casaru d’u paisi è bravu, ma u toi è megghiu!', 'Nu pezzu i provola e nu bicchieri i vinu, e sugnu felici!'];
const FESTA_LINE = 'È a festa d’u paisi: mi servi u tagghieri chiù riccu chi ndai!';
if (typeof IT !== 'undefined') Object.assign(IT, { 'Na soppressata e nu caciocavallo pe stasira!': 'Una soppressata e un caciocavallo per stasera!', 'A ricotta frisca è a megghiu cosa d’u mundu!': 'La ricotta fresca è la cosa più buona del mondo!', 'Pe’ a pasta ci voli nu bellu pecorinu!': 'Per la pasta ci vuole un bel pecorino!', 'U casaru d’u paisi è bravu, ma u toi è megghiu!': 'Il casaro del paese è bravo, ma il tuo è più bravo!', 'Nu pezzu i provola e nu bicchieri i vinu, e sugnu felici!': 'Un pezzo di provola e un bicchiere di vino, e sono felice!', [FESTA_LINE]: 'È la festa del paese: mi serve il tagliere più ricco che hai!' });
const GEN_CELL = 3 * COLS + 2; // al centro della griglia
const ENERGY_MS = 90000;
const ROW_COST = [0, 0, 0, 0, 0, 400, 1200];
const ORDER_LINES2 = ['Si calaru i parenti i Torinu, mi servi cocchi cosa bona!', 'Stasira aiu invitati a casa, dammi u megghiu chi ndai!', 'Na ’nduja bella piccanti, mi raccumandu!', 'Comu sempri, u solitu!', 'Faciti prestu ca a casa m’aspetta a mugghieri!', 'Aia la miseria, chi profumu ca c’è ccà!', 'Mi servi pe na festa i paisi!', 'U meu niputi veni i Torinu, vogghiu fari bella figura!', 'Dumani è a festa du santu, aiu a fari i panini pe tutti!', 'Na soppressata comu si faciva na vota!', 'Ieri mi fici na partita a scupa, oji mi mangiu nu bellu paninu!', 'Veni a signora Rusina pe pranzu, e idda è precisa!'];

function itemSVG(l) {
  if (l > 200) return breadSVG(l);
  if (l > 100) return cheeseSVG(l);
  const S = '<svg viewBox="0 0 60 60" class="itsvg" aria-hidden="true">';
  const st = 'stroke="#1A1A1A" stroke-width="2.4" stroke-linejoin="round"';
  switch (l) {
    case 1: return S + '<path d="M14 20 Q22 6 38 12 Q52 18 48 34 Q44 48 30 50 Q16 50 14 38 Z" fill="#E9A39A" ' + st + '/><path d="M20 24 Q30 18 40 24" fill="none" stroke="#F7D2C8" stroke-width="3"/><path d="M40 44 L50 54" stroke="#1A1A1A" stroke-width="7" stroke-linecap="round"/><path d="M40 44 L50 54" stroke="#F3EBD8" stroke-width="4" stroke-linecap="round"/><circle cx="51" cy="55" r="3.5" fill="#F3EBD8" stroke="#1A1A1A" stroke-width="1.8"/></svg>';
    case 2: return S + '<path d="M8 32 H52 Q50 50 30 50 Q10 50 8 32 Z" fill="#3E6FA8" ' + st + '/><path d="M12 32 Q14 20 22 22 Q26 14 34 18 Q42 16 44 24 Q50 24 48 32 Z" fill="#E07F78" ' + st + '/><g fill="#B84E48"><circle cx="20" cy="27" r="1.6"/><circle cx="28" cy="23" r="1.6"/><circle cx="36" cy="26" r="1.6"/><circle cx="42" cy="29" r="1.4"/><circle cx="25" cy="29" r="1.4"/></g><path d="M12 38 H48" stroke="#9CC0E6" stroke-width="2"/></svg>';
    case 3: return S + '<g fill="#EC9C94" ' + st + '><ellipse cx="16" cy="32" rx="11" ry="9"/><ellipse cx="34" cy="30" rx="10" ry="9"/><ellipse cx="49" cy="33" rx="8" ry="8"/></g><path d="M25 26 L25 36 M43 26 L43 38" stroke="#F3EBD8" stroke-width="2.5"/><g fill="#fff" opacity="0.6"><circle cx="12" cy="29" r="2"/><circle cx="31" cy="27" r="2"/></g></svg>';
    case 4: return S + '<path d="M8 10 H52" stroke="#6B4A2E" stroke-width="3" stroke-linecap="round"/><g fill="#9A2E26" ' + st + '><path d="M16 12 Q10 30 16 50 Q22 50 22 32 Q22 16 16 12 Z"/><path d="M30 12 Q24 28 30 46 Q36 46 36 30 Q36 16 30 12 Z"/><path d="M44 12 Q38 30 44 52 Q50 52 50 32 Q50 16 44 12 Z"/></g><path d="M16 10 V14 M30 10 V14 M44 10 V14" stroke="#E2C48A" stroke-width="2.5"/><g fill="#F0C9B8"><circle cx="17" cy="30" r="1.4"/><circle cx="31" cy="26" r="1.4"/><circle cx="45" cy="34" r="1.4"/></g></svg>';
    case 5: return S + '<ellipse cx="30" cy="34" rx="22" ry="15" fill="#6E1C18" ' + st + '/><g fill="#F4E1C8"><circle cx="20" cy="30" r="2.2"/><circle cx="30" cy="38" r="2.2"/><circle cx="39" cy="29" r="2.2"/><circle cx="25" cy="42" r="1.8"/><circle cx="43" cy="39" r="1.8"/><circle cx="15" cy="37" r="1.6"/></g><path d="M8 34 H52 M20 21 L18 47 M40 21 L42 47" stroke="#E2C48A" stroke-width="1.6" opacity="0.8"/><path d="M28 19 Q30 10 34 12" fill="none" stroke="#E2C48A" stroke-width="2.4"/></svg>';
    case 6: return S + '<rect x="8" y="20" width="44" height="26" rx="13" fill="#A9443A" ' + st + '/><ellipse cx="46" cy="33" rx="6" ry="13" fill="#D9786A" ' + st + '/><path d="M44 26 Q50 32 44 40" fill="none" stroke="#F6D7CC" stroke-width="2"/><path d="M14 26 Q22 30 18 40 M28 22 Q34 30 30 44" fill="none" stroke="#F0C9B8" stroke-width="2.2"/><path d="M8 33 H40" stroke="#E2C48A" stroke-width="1.5" stroke-dasharray="3 3"/></svg>';
    case 7: return S + '<path d="M30 10 C46 10 52 22 52 34 C52 48 42 54 30 54 C18 54 8 48 8 34 C8 22 14 10 30 10 Z" fill="#B3312A" ' + st + '/><path d="M14 20 L48 52 M46 20 L12 52 M8 34 H52 M20 12 L44 54 M40 12 L16 54" stroke="#F1DDB0" stroke-width="1.4" opacity="0.7"/><path d="M26 10 Q30 2 34 10" fill="none" stroke="#E2C48A" stroke-width="2.6"/><circle cx="22" cy="28" r="4" fill="#CF4B36" opacity="0.8"/></svg>';
    case 8: return S + '<path d="M4 40 H50 Q56 40 56 46 Q56 52 50 52 H4 Z" fill="#B07A44" ' + st + '/><circle cx="56" cy="46" r="2" fill="#1A1A1A"/><ellipse cx="17" cy="34" rx="11" ry="8" fill="#6E1C18" stroke="#1A1A1A" stroke-width="2"/><g fill="#F4E1C8"><circle cx="13" cy="33" r="1.4"/><circle cx="19" cy="36" r="1.4"/><circle cx="21" cy="31" r="1.2"/></g><path d="M30 18 C40 18 44 26 44 32 C44 40 38 42 32 42 C26 42 22 40 22 32 C22 26 24 18 30 18 Z" fill="#B3312A" stroke="#1A1A1A" stroke-width="2"/><path d="M26 22 L40 40 M38 22 L24 40" stroke="#F1DDB0" stroke-width="1.2" opacity="0.7"/><g fill="#C8262E" stroke="#1A1A1A" stroke-width="1.5"><path d="M44 36 Q50 24 54 20 Q52 30 46 38 Z"/><path d="M38 30 Q42 16 48 12 Q46 24 40 32 Z"/></g><path d="M48 12 L50 9 M54 20 L56 17" stroke="#3A7D44" stroke-width="2"/></svg>';
  }
  return S + '</svg>';
}
function cheeseSVG(l) {
  const S = '<svg viewBox="0 0 60 60" class="itsvg" aria-hidden="true">', st = 'stroke="#1A1A1A" stroke-width="2.4" stroke-linejoin="round"';
  const weave = (y0, y1, x0, x1, c) => { let s = ''; for (let y = y0; y < y1; y += 4) s += '<path d="M' + x0 + ' ' + y + ' H' + x1 + '" stroke="' + c + '" stroke-width="1.2"/>'; for (let x = x0 + 3; x < x1; x += 5) s += '<path d="M' + x + ' ' + y0 + ' V' + y1 + '" stroke="' + c + '" stroke-width="1" opacity="0.6"/>'; return s; };
  switch (l) {
    case 101: return S + '<path d="M12 18 H48 L44 52 H16 Z" fill="#B9C2C8" ' + st + '/><ellipse cx="30" cy="18" rx="18" ry="5" fill="#FFFFFF" ' + st + '/><path d="M14 30 H46" stroke="#8E9CA4" stroke-width="2"/><path d="M12 18 Q30 -4 48 18" fill="none" stroke="#1A1A1A" stroke-width="2"/><path d="M22 16 q4 -2 8 0" stroke="#E8EEF2" stroke-width="2" fill="none"/></svg>';
    case 102: return S + '<path d="M10 34 H50 L46 50 H14 Z" fill="#9AA85A" ' + st + '/>' + weave(36, 50, 13, 47, '#6E7A3A') + '<path d="M12 34 Q14 16 30 16 Q46 16 48 34 Z" fill="#FBF8EE" ' + st + '/><path d="M18 26 Q30 22 42 26" stroke="#E4DECB" stroke-width="2" fill="none"/></svg>';
    case 103: return S + '<path d="M12 38 H48 L44 52 H16 Z" fill="#C9A86C" ' + st + '/>' + weave(40, 52, 15, 45, '#9A7A44') + '<path d="M12 38 Q12 12 30 12 Q48 12 48 38 Z" fill="#FFFFFF" ' + st + '/><g fill="#E6E0D2"><circle cx="22" cy="24" r="1.6"/><circle cx="30" cy="20" r="1.6"/><circle cx="38" cy="26" r="1.6"/><circle cx="26" cy="31" r="1.4"/><circle cx="36" cy="33" r="1.4"/></g></svg>';
    case 104: return S + '<path d="M12 38 Q12 12 30 12 Q48 12 48 38 Q48 50 30 50 Q12 50 12 38 Z" fill="#C98A44" ' + st + '/><path d="M14 38 Q14 18 30 16 Q22 26 22 40 Z" fill="#E2B070" opacity="0.7"/><path d="M18 24 Q30 20 42 26 M16 34 Q30 30 44 36" stroke="#9A5E26" stroke-width="1.6" fill="none"/><path d="M38 8 q-4 -4 0 -8 M44 10 q-4 -4 0 -8" stroke="#9AA3A8" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>';
    case 105: return S + '<path d="M30 14 C40 14 46 26 46 36 C46 48 38 54 30 54 C22 54 14 48 14 36 C14 26 20 14 30 14 Z" fill="#F3DE9A" ' + st + '/><path d="M26 14 Q30 6 34 14" fill="#F3DE9A" ' + st + '/><path d="M24 10 H36" stroke="#C8562E" stroke-width="3" stroke-linecap="round"/><path d="M20 30 Q26 26 30 32" stroke="#FFF6D4" stroke-width="2.4" fill="none"/></svg>';
    case 106: return S + '<path d="M30 14 C42 14 48 26 48 36 C48 48 40 54 30 54 C20 54 12 48 12 36 C12 26 18 14 30 14 Z" fill="#F6EBC8" ' + st + '/><path d="M26 14 Q30 6 34 14" fill="#F6EBC8" ' + st + '/><path d="M24 10 H36" stroke="#6B4424" stroke-width="3" stroke-linecap="round"/><path d="M30 54 V24" stroke="#1A1A1A" stroke-width="1.6"/><path d="M30 30 C36 30 38 36 38 40 C38 46 34 48 30 48 Z" fill="#F2C94C" stroke="#1A1A1A" stroke-width="1.6"/></svg>';
    case 107: return S + '<path d="M8 30 Q8 22 30 22 Q52 22 52 30 V42 Q52 50 30 50 Q8 50 8 42 Z" fill="#D9B46E" ' + st + '/><ellipse cx="30" cy="30" rx="22" ry="8" fill="#F1E1B4" ' + st + '/>' + weave(36, 48, 11, 49, '#A57E3E') + '<path d="M30 30 L48 26 L52 30 Z" fill="#FBF3D8" stroke="#1A1A1A" stroke-width="1.4"/></svg>';
    case 108: return S + '<path d="M8 6 H52" stroke="#6B4A2E" stroke-width="3" stroke-linecap="round"/><path d="M20 6 V14 M40 6 V14" stroke="#C9A45A" stroke-width="2"/><g fill="#E8B84A" ' + st + '><path d="M20 14 C27 14 30 22 30 28 C30 30 28 32 26 33 C32 36 34 42 34 46 C34 53 27 56 20 56 C13 56 6 53 6 46 C6 42 8 36 14 33 C12 32 10 30 10 28 C10 22 13 14 20 14 Z"/><path d="M40 14 C47 14 50 22 50 28 C50 30 48 32 46 33 C52 36 54 42 54 46 C54 53 47 56 40 56 C33 56 26 53 26 46 C26 42 28 36 34 33 C32 32 30 30 30 28 C30 22 33 14 40 14 Z"/></g><path d="M12 44 Q18 40 22 46 M32 44 Q38 40 42 46" stroke="#F8DA8A" stroke-width="2" fill="none"/></svg>';
  }
  return S + '</svg>';
}
function breadSVG(l) {
  const S = '<svg viewBox="0 0 60 60" class="itsvg" aria-hidden="true">', st = 'stroke="#1A1A1A" stroke-width="2.4" stroke-linejoin="round"';
  const weave = (y0, y1, x0, x1, c) => { let o = ''; for (let y = y0; y < y1; y += 4) o += '<path d="M' + x0 + ' ' + y + ' H' + x1 + '" stroke="' + c + '" stroke-width="1.2"/>'; for (let x = x0 + 3; x < x1; x += 5) o += '<path d="M' + x + ' ' + y0 + ' V' + y1 + '" stroke="' + c + '" stroke-width="1.2"/>'; return o; };
  switch (l) {
    case 201: { let g = ''; for (let i = 0; i < 5; i++) { const y = 14 + i * 7; g += '<ellipse cx="25" cy="' + y + '" rx="4" ry="6" transform="rotate(-30 25 ' + y + ')" fill="#E8B84A" ' + st + '/><ellipse cx="35" cy="' + y + '" rx="4" ry="6" transform="rotate(30 35 ' + y + ')" fill="#E8B84A" ' + st + '/>'; }
      return S + '<path d="M30 56 V12" stroke="#B8862E" stroke-width="3" stroke-linecap="round"/>' + g + '<ellipse cx="30" cy="10" rx="3.5" ry="6" fill="#E8B84A" ' + st + '/><path d="M30 4 V-2 M24 8 L20 2 M36 8 L40 2" stroke="#C9973C" stroke-width="1.5"/></svg>'; }
    case 202: return S + '<path d="M14 22 Q12 52 18 54 H42 Q48 52 46 22 Z" fill="#EFE6D2" ' + st + '/><path d="M16 22 Q30 14 44 22 L40 14 Q30 8 20 14 Z" fill="#E2D6BC" ' + st + '/><path d="M20 16 Q30 20 40 16" stroke="#8A6A3A" stroke-width="3" fill="none"/><text x="30" y="42" text-anchor="middle" font-size="8" font-weight="700" font-family="sans-serif" fill="#8A6A3A">FARINA</text><circle cx="46" cy="12" r="3" fill="#fff" opacity="0.8"/><circle cx="50" cy="18" r="2" fill="#fff" opacity="0.7"/></svg>';
    case 203: return S + '<path d="M6 34 H54 Q52 54 30 54 Q8 54 6 34 Z" fill="#A8743E" ' + st + '/><path d="M10 34 Q12 16 30 16 Q48 16 50 34 Z" fill="#F4E3C0" ' + st + '/><path d="M18 26 Q26 22 34 24" stroke="#FFF6E2" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M8 40 H52" stroke="#7A5230" stroke-width="1.5"/></svg>';
    case 204: return S + '<ellipse cx="30" cy="36" rx="24" ry="16" fill="#C98A44" ' + st + '/><path d="M8 34 Q30 14 52 34" fill="#D9A05A" stroke="none"/><path d="M18 28 L26 40 M28 24 L36 38 M38 26 L44 36" stroke="#F0D29A" stroke-width="3" stroke-linecap="round"/><ellipse cx="30" cy="36" rx="24" ry="16" fill="none" ' + st + '/></svg>';
    case 205: return S + '<ellipse cx="30" cy="34" rx="25" ry="15" fill="#D9A05A" ' + st + '/><ellipse cx="30" cy="32" rx="9" ry="5" fill="#FFF8E8" ' + st + '/><path d="M12 30 Q16 22 24 21 M40 21 Q48 24 50 32" stroke="#F3D7A0" stroke-width="2.4" fill="none" stroke-linecap="round"/><g fill="#A8662C"><circle cx="16" cy="38" r="1.3"/><circle cx="44" cy="40" r="1.3"/><circle cx="24" cy="44" r="1.2"/><circle cx="38" cy="25" r="1.2"/></g></svg>';
    case 206: return S + '<ellipse cx="30" cy="44" rx="26" ry="9" fill="#E9EEF2" ' + st + '/>' + [[18, 36], [42, 36], [30, 28]].map(([cx, cy]) => '<ellipse cx="' + cx + '" cy="' + cy + '" rx="11" ry="7" fill="#D99A4A" ' + st + '/><ellipse cx="' + cx + '" cy="' + (cy - 1) + '" rx="4" ry="2.4" fill="#7A3E1A" stroke="#1A1A1A" stroke-width="1.6"/><circle cx="' + cx + '" cy="' + (cy - 1.5) + '" r="1.6" fill="#B3202A"/>').join('') + '<g fill="#fff"><circle cx="14" cy="34" r="0.9"/><circle cx="22" cy="38" r="0.9"/><circle cx="38" cy="33" r="0.9"/><circle cx="46" cy="38" r="0.9"/><circle cx="27" cy="26" r="0.9"/><circle cx="34" cy="30" r="0.9"/></g></svg>';
    case 207: { let r = ''; for (const [cx, cy] of [[30, 33], [19, 28], [41, 28], [19, 40], [41, 40], [30, 21], [30, 45]]) r += '<circle cx="' + cx + '" cy="' + cy + '" r="6" fill="#C8792E" stroke="#1A1A1A" stroke-width="1.6"/><path d="M' + (cx - 3) + ' ' + cy + ' A3 3 0 1 1 ' + cx + ' ' + (cy + 3) + ' A1.8 1.8 0 1 1 ' + (cx + 1) + ' ' + (cy - 0.5) + '" fill="none" stroke="#7A3E14" stroke-width="1.2"/>';
      return S + '<ellipse cx="30" cy="34" rx="25" ry="20" fill="#E0A85A" ' + st + '/>' + r + '<path d="M10 26 Q30 8 50 26" stroke="#F6D27A" stroke-width="2" fill="none" opacity="0.8"/><g fill="#5A2E14"><circle cx="25" cy="34" r="1.2"/><circle cx="36" cy="35" r="1.2"/><circle cx="30" cy="27" r="1.2"/></g></svg>'; }
    case 208: return S + '<path d="M14 28 Q14 4 30 4 Q46 4 46 28" fill="none" stroke="#8A5A30" stroke-width="3"/><circle cx="21" cy="24" r="7" fill="#C98A44" ' + st + '/><ellipse cx="38" cy="24" rx="8" ry="6" fill="#D9A05A" ' + st + '/><ellipse cx="38" cy="23" rx="3" ry="2" fill="#FFF8E8" stroke="#1A1A1A" stroke-width="1.4"/><rect x="26" y="16" width="9" height="12" rx="2" fill="#5A2E14" stroke="#1A1A1A" stroke-width="1.6" transform="rotate(12 30 22)"/><path d="M8 28 H52 L46 54 H14 Z" fill="#B07A44" ' + st + '/>' + weave(31, 53, 12, 48, '#7A5230') + '<path d="M8 28 H52" ' + st + '/><circle cx="12" cy="30" r="3" fill="#C0392B" stroke="#1A1A1A" stroke-width="1.4"/></svg>';
  }
  return S + '</svg>';
}
function genFSVG() {
  return '<svg viewBox="0 0 60 60" class="itsvg" aria-hidden="true"><ellipse cx="30" cy="55" rx="24" ry="4" fill="#000" opacity="0.2"/><rect x="6" y="40" width="48" height="13" rx="2" fill="#9C8A74" stroke="#1A1A1A" stroke-width="2.4"/><path d="M8 41 Q8 10 30 10 Q52 10 52 41 Z" fill="#C49A6C" stroke="#1A1A1A" stroke-width="2.4" stroke-linejoin="round"/>' +
    '<path d="M14 30 Q30 20 46 30 M11 37 Q30 28 49 37" stroke="#9A6E44" stroke-width="1.4" fill="none"/><path d="M20 41 Q20 26 30 26 Q40 26 40 41 Z" fill="#3A1E10" stroke="#1A1A1A" stroke-width="2"/><path d="M24 41 Q26 32 30 30 Q34 34 36 41 Z" fill="#FF9A3C"/><path d="M27 41 Q29 35 30 34 Q32 37 33 41 Z" fill="#FFE08A"/><rect x="36" y="2" width="7" height="10" fill="#8C7A64" stroke="#1A1A1A" stroke-width="2"/></svg>';
}
function genCSVG() {
  return '<svg viewBox="0 0 60 60" class="itsvg" aria-hidden="true"><ellipse cx="30" cy="54" rx="22" ry="4" fill="#000" opacity="0.2"/><path d="M8 26 H52 L48 50 Q30 56 12 50 Z" fill="#C87533" stroke="#1A1A1A" stroke-width="2.4" stroke-linejoin="round"/><ellipse cx="30" cy="26" rx="22" ry="6" fill="#FFFFFF" stroke="#1A1A1A" stroke-width="2.4"/><path d="M14 36 Q30 40 46 36" stroke="#E3A26B" stroke-width="2" fill="none"/><path d="M40 24 L50 6" stroke="#6B4424" stroke-width="3" stroke-linecap="round"/><ellipse cx="38" cy="25" rx="5" ry="2" fill="#E6E0D2" stroke="#1A1A1A" stroke-width="1.4"/><path d="M20 18 q-3 -5 0 -10 M28 16 q-3 -5 0 -10" stroke="#9AA3A8" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>';
}
function genSVG() {
  return '<svg viewBox="0 0 60 60" class="itsvg" aria-hidden="true"><ellipse cx="30" cy="52" rx="24" ry="5" fill="#000" opacity="0.2"/><rect x="8" y="26" width="44" height="24" rx="5" fill="#8A5A30" stroke="#1A1A1A" stroke-width="2.4"/><ellipse cx="30" cy="26" rx="22" ry="7" fill="#C8955A" stroke="#1A1A1A" stroke-width="2.4"/><path d="M14 26 Q30 31 46 26" fill="none" stroke="#A9773E" stroke-width="1.5"/>' +
    '<g transform="rotate(-25 30 18)"><rect x="24" y="2" width="22" height="16" rx="2" fill="#C9CED6" stroke="#1A1A1A" stroke-width="2.2"/><rect x="14" y="7" width="12" height="6" rx="2" fill="#4A2E1A" stroke="#1A1A1A" stroke-width="2"/><circle cx="41" cy="7" r="1.8" fill="#1A1A1A"/></g></svg>';
}
function boltSVG() { return '<svg viewBox="0 0 20 20" class="bolt" aria-hidden="true"><path d="M11 1 L3 11 H9 L7 19 L16 8 H10 Z" fill="#F2C94C" stroke="#1A1A1A" stroke-width="1.6" stroke-linejoin="round"/></svg>'; }

function defaultMerge() {
  const cells = Array(COLS * ROWS).fill(0);
  for (let r = 5; r < ROWS; r++) for (let c = 0; c < COLS; c++) cells[r * COLS + c] = -1;
  cells[GEN_CELL] = 'G';
  [1, 1, 2].forEach((l, i) => { cells[[0, 5, 12][i]] = l; });
  return { cells, energy: 20, energyMax: 20, energyAt: Date.now(), genLvl: 1, best: 1, orders: [], sold: 0 };
}
function MG() {
  const E = eco();
  if (!E.merge) E.merge = defaultMerge();
  const M = E.merge;
  if (M.best >= MAXL && !M.cheese) cheeseUnlock(M);
  if (M.cheese && !M.cells.includes('C')) placeCheeseGen(M);
  if (M.cheese && (M.bestC || 0) >= BREAD_AT && !M.bread) breadUnlock(M);
  if (M.bread && !M.cells.includes('F')) placeBreadGen(M);
  while (M.orders.length < 3) M.orders.push(newOrder(M));
  return M;
}
function regen(M) {
  const now = Date.now();
  if (M.energy >= M.energyMax) { M.energyAt = now; return; }
  const n = Math.floor((now - M.energyAt) / ENERGY_MS);
  if (n > 0) { M.energy = Math.min(M.energyMax, M.energy + n); M.energyAt += n * ENERGY_MS; if (M.energy >= M.energyMax) M.energyAt = now; }
}
function placeCheeseGen(M) {
  const at = GEN_CELL + 1;
  if (M.cells[at] === 0) { M.cells[at] = 'C'; return true; }
  const e = nearestEmpty(M, at); if (e < 0) return false;
  if (typeof M.cells[at] === 'number' && M.cells[at] > 0) { M.cells[e] = M.cells[at]; M.cells[at] = 'C'; } else M.cells[e] = 'C';
  return true;
}
function placeBreadGen(M) {
  const at = GEN_CELL - 1;
  if (M.cells[at] === 0) { M.cells[at] = 'F'; return true; }
  const e = nearestEmpty(M, at); if (e < 0) return false;
  if (typeof M.cells[at] === 'number' && M.cells[at] > 0) { M.cells[e] = M.cells[at]; M.cells[at] = 'F'; } else M.cells[e] = 'F';
  return true;
}
function breadUnlock(M) {
  M.bread = true; M.bestF = M.bestF || 201; placeBreadGen(M);
  setTimeout(() => {
    if (!$('layer').innerHTML) {
      overlay('<div class="nickwin"><div class="nicknd"><img src="' + (AVIMG.rammendatrice || AVIMG.casaro) + '" alt="" style="width:100%;border-radius:50%"></div><div class="nickbub"><b>La nonna</b><span>' + tr2('Figghiu meu, salumi e formaggi senza pani nun si ponnu mangiari! Ti portu u furnu meu.', 'Figlio mio, salumi e formaggi senza pane non si possono mangiare! Ti porto il mio forno.') + '</span></div></div>' +
        '<p>Sulla griglia c’è il <b>forno della nonna</b>: toccalo per avere una spiga di grano. Unisci i pezzi uguali per fare farina, impasto, pane, pitta, zeppole… fino al <b>cesto della festa</b>. I clienti ora chiedono anche pane e dolci!</p><button class="btn take" id="frOk">Andiamo a infornare!</button>');
      $('frOk').onclick = () => { $('layer').innerHTML = ''; if (view === 'vPaese') renderMerge(); };
    }
  }, 900);
  if (typeof track === 'function') track('merge_bread_unlock', {});
  save();
}
function genTapF() {
  const M = MG();
  regen(M);
  if (M.energy <= 0) { mgEmptyPop(); return; }
  const from = M.cells.indexOf('F'), at = nearestEmpty(M, from);
  if (at < 0) { flash('Griglia piena!'); return; }
  M.energy--;
  M.cells[at] = Math.random() < (M.genLvl - 1) * 0.12 ? 202 : 201;
  mFlash = [at];
  fx('card'); save(); renderMerge();
}
function cheeseUnlock(M) {
  M.cheese = true; M.bestC = M.bestC || 101; placeCheeseGen(M);
  setTimeout(() => {
    if (!$('layer').innerHTML) {
      overlay('<div class="nickwin"><div class="nicknd"><img src="' + AVIMG.casaro + '" alt="" style="width:100%;border-radius:50%"></div><div class="nickbub"><b>Il casaro</b><span>' + tr2('Bravu! Cu stu tagghieri si fattu u megghiu salumificiu d’u paisi. Mo ti portu u me caccavu: facimu puru i formaggi!', 'Bravo! Con questo tagliere hai fatto il salumificio migliore del paese. Ora ti porto il mio paiolo: facciamo anche i formaggi!') + '</span></div></div>' +
        '<p>Sulla griglia c’è il <b>paiolo del casaro</b>: toccalo per avere un secchio di latte. Unisci i pezzi uguali per fare giuncata, ricotta, provola… fino al <b>caciocavallo silano</b>. I clienti ora chiedono anche i formaggi, e pagano bene!</p><button class="btn take" id="chOk">Facciamo i formaggi!</button>');
      $('chOk').onclick = () => { $('layer').innerHTML = ''; if (view === 'vPaese') renderMerge(); };
    }
  }, 900);
  save();
}
function newOrder(M) {
  if (M.cheese) {
    const topC = Math.min(MAXC, Math.max(102, (M.bestC || 101) + 1)), lc = () => rnd(Math.max(101, Math.min(topC - 2, 102)), topC);
    const top0 = Math.min(MAXL, Math.max(2, M.best + 1)), ls = () => rnd(Math.max(1, Math.min(top0 - 2, 2)), top0);
    const who = CUSTOMERS[rnd(0, CUSTOMERS.length - 1)], id = Math.random().toString(36).slice(2, 8), r = Math.random();
    if ((M.bestC || 0) >= MAXC - 1 && r < 0.1) return { id, who, items: [MAXL, MAXC], festa: true, line: FESTA_LINE };
    if (r < 0.45) return { id, who, items: (Math.random() < 0.3 ? [lc(), lc()] : [lc()]).sort((a, b) => a - b), line: CHEESE_LINES[rnd(0, CHEESE_LINES.length - 1)] };
    if (r < 0.65) return { id, who, items: [ls(), lc()], line: ORDER_LINES2[rnd(0, ORDER_LINES2.length - 1)] };
    if (M.bread && r < 0.9) {
      const topF = Math.min(MAXF, Math.max(202, (M.bestF || 201) + 1)), lf = () => rnd(Math.max(201, Math.min(topF - 2, 202)), topF);
      if ((M.bestF || 0) >= MAXF - 1 && r < 0.7) return { id, who, items: [lc(), lf()].sort((a, b) => a - b), line: BREAD_LINES[rnd(0, BREAD_LINES.length - 1)] };
      return { id, who, items: (Math.random() < 0.3 ? [lf(), lf()] : [lf()]).sort((a, b) => a - b), line: BREAD_LINES[rnd(0, BREAD_LINES.length - 1)] };
    }
  }
  const top = Math.min(MAXL, Math.max(2, M.best + 1));
  const lv = () => rnd(Math.max(1, Math.min(top - 2, 2)), top);
  const items = Math.random() < 0.3 ? [lv(), lv()] : [lv()];
  const who = CUSTOMERS[rnd(0, CUSTOMERS.length - 1)];
  return { id: Math.random().toString(36).slice(2, 8), who, items: items.sort((a, b) => a - b), line: ORDER_LINES2[rnd(0, ORDER_LINES2.length - 1)] };
}
function orderValue(o) { const v = o.items.reduce((s, l) => s + CHAIN[l].price, 0); return o.festa ? Math.round(v * 1.5) : v; }
function canFill(M, o) {
  const need = {};
  o.items.forEach((l) => { need[l] = (need[l] || 0) + 1; });
  return Object.entries(need).every(([l, n]) => M.cells.filter((x) => x === Number(l)).length >= n);
}
let mSel = null, mFlash = null;
function nearestEmpty(M, from) {
  const fr = Math.floor(from / COLS), fc = from % COLS;
  let best = -1, bd = 1e9;
  M.cells.forEach((v, i) => { if (v === 0) { const d = Math.abs(Math.floor(i / COLS) - fr) + Math.abs((i % COLS) - fc); if (d < bd) { bd = d; best = i; } } });
  return best;
}
function genTap() {
  const M = MG();
  regen(M);
  if (M.energy <= 0) { mgEmptyPop(); return; }
  const at = nearestEmpty(M, GEN_CELL);
  if (at < 0) { flash('Griglia piena!'); return; }
  M.energy--;
  const lvl = Math.random() < (M.genLvl - 1) * 0.12 ? 2 : 1;
  M.cells[at] = lvl;
  mFlash = [at];
  if (eco().helpers.pastaia && Math.random() < 0.2) { const at2 = nearestEmpty(M, GEN_CELL); if (at2 >= 0) { M.cells[at2] = 1; mFlash.push(at2); } }
  fx('card');
  save(); renderMerge();
}
function genTapC() {
  const M = MG();
  regen(M);
  if (M.energy <= 0) { mgEmptyPop(); return; }
  const from = M.cells.indexOf('C'), at = nearestEmpty(M, from);
  if (at < 0) { flash('Griglia piena!'); return; }
  M.energy--;
  M.cells[at] = Math.random() < (M.genLvl - 1) * 0.12 ? 102 : 101;
  mFlash = [at];
  // con le pecore il casaro a volte ha latte di pecora in più
  const S = eco().sheep;
  if (S && S.flock && S.flock.some((s) => !s.m) && Math.random() < 0.25) { const at2 = nearestEmpty(M, from); if (at2 >= 0) { M.cells[at2] = 101; mFlash.push(at2); flash('Latte di pecora in più!'); } }
  fx('card'); save(); renderMerge();
}
function moveItem(a, b) {
  const M = MG();
  if (a === b) return;
  const va = M.cells[a], vb = M.cells[b];
  if (typeof va !== 'number' || va <= 0 || vb === -1 || isGen(vb)) return;
  if (vb === va && va !== MAXL && va !== MAXC && va !== MAXF) {
    M.cells[b] = va + 1; M.cells[a] = 0;
    mFlash = [b];
    if (isBread(va)) { if (va + 1 > (M.bestF || 201)) { M.bestF = va + 1; flash('Nuovo: ' + CHAIN[va + 1].name + '!'); gainXp(12 * mgLv(va + 1)); } else gainXp(mgLv(va)); }
    else if (isCheese(va)) { if (va + 1 > (M.bestC || 101)) { M.bestC = va + 1; flash('Nuovo: ' + CHAIN[va + 1].name + '!'); gainXp(12 * mgLv(va + 1)); } else gainXp(mgLv(va)); }
    else if (va + 1 > M.best) { M.best = va + 1; flash('Nuovo: ' + CHAIN[va + 1].name + '!'); gainXp(10 * (va + 1)); }
    else gainXp(va);
    fx('take');
  } else if (vb === 0) { M.cells[b] = va; M.cells[a] = 0; }
  else { M.cells[b] = va; M.cells[a] = vb; }
  save(); renderMerge();
}
function sellOrder(id) {
  const M = MG(), o = M.orders.find((x) => x.id === id);
  if (!o || !canFill(M, o)) return;
  for (const l of o.items) { const i = M.cells.findIndex((x) => x === l); M.cells[i] = 0; }
  const v = orderValue(o);
  const E = eco();
  E.carlini += v; M.sold++;
  gainXp(Math.max(2, Math.round(v / 10)));
  M.orders = M.orders.filter((x) => x !== o);
  M.orders.push(newOrder(M));
  fx('big');
  flash('+' + v + ' carlini');
  save(); renderMerge(); renderRes();
}
function mgEnHTML(M) {
  const full = M.energy >= M.energyMax;
  const nextIn = full ? 'piena' : '+1 tra ' + fmtTime(ENERGY_MS - (Date.now() - M.energyAt));
  return '<span class="mgen' + (M.energy <= 2 ? ' low' : '') + '">' + boltSVG() + '<b>' + M.energy + '<i>/' + M.energyMax + '</i></b><small>' + nextIn + '</small></span>' +
    '<button class="mgvid" data-up="video"' + (full ? ' disabled' : '') + ' aria-label="Guarda un video per 10 energia"><span class="mgplay">▶</span>+10</button>';
}
function renderMerge(soft) {
  const M = MG();
  regen(M);
  const box = $('salBox');
  if (soft && box.querySelector('.mgtop')) { box.querySelector('.mgtop .mgenw').innerHTML = mgEnHTML(M); return; }
  const E = eco();
  /* barra in alto: energia (con il video subito accanto) e vendite */
  let h = '<div class="mgtop mgbar"><span class="mgenw">' + mgEnHTML(M) + '</span><span class="mgsold" title="Ordini venduti"><b>' + M.sold + '</b><small>venduti</small></span></div>';
  /* gli ordini dei clienti */
  h += '<div class="mgorders">' + M.orders.map((o) => {
    const ok = canFill(M, o);
    return '<div class="mgorder' + (ok ? ' ok' : '') + (o.items.length > 1 ? ' two' : '') + (o.festa ? ' festa' : '') + '">' + (o.festa ? '<span class="mgfesta">🎉 Festa ×1,5</span>' : '') + '<div class="mgwho"><img src="' + AVIMG[o.who] + '" alt=""><div class="mgwant">' + o.items.map((l) => '<span title="' + CHAIN[l].name + '">' + itemSVG(l) + '</span>').join('') + '</div></div>' +
      '<small class="say">' + trLine(o.line, ORDER_LINES2) + '</small>' +
      '<button class="btn small ' + (ok ? 'take' : 'ghost') + '" data-sell="' + o.id + '"' + (ok ? '' : ' disabled') + '>' + (ok ? 'Vendi ' : '') + orderValue(o) + ' <span class="cn">🪙</span></button></div>';
  }).join('') + '</div>';
  /* la griglia */
  h += '<div class="mggrid" id="mgGrid" style="--cols:' + COLS + '">';
  M.cells.forEach((v, i) => {
    const cls = 'mgcell' + (v === -1 ? ' locked' : '') + (isGen(v) ? ' gen' + (v === 'C' ? ' genc' : v === 'F' ? ' genf' : '') + (M.energy <= 0 ? ' empty' : '') : '') + (isCheese(v) ? ' ch' : isBread(v) ? ' br' : '') + (mSel === i ? ' sel' : '') + (mFlash && mFlash.includes(i) ? ' pop' : '');
    let inner = '';
    if (v === 'G') inner = genSVG() + '<span class="lv">' + boltSVG() + '</span>';
    else if (v === 'C') inner = genCSVG() + '<span class="lv">' + boltSVG() + '</span>';
    else if (v === 'F') inner = genFSVG() + '<span class="lv">' + boltSVG() + '</span>';
    else if (v > 0) inner = itemSVG(v) + '<span class="lv">' + mgLv(v) + '</span>';
    else if (v === -1) inner = '<span class="lock"></span>';
    h += '<button class="' + cls + '" data-cell="' + i + '" aria-label="' + (v === 'G' ? 'Banco del macellaio: crea una coscia' : v === 'C' ? 'Paiolo del casaro: crea un secchio di latte' : v === 'F' ? 'Forno della nonna: crea una spiga di grano' : v > 0 ? CHAIN[v].name : v === -1 ? 'Spazio chiuso' : 'Casella vuota') + '">' + inner + '</button>';
  });
  h += '</div>';
  const sel = mSel !== null && M.cells[mSel] > 0 ? CHAIN[M.cells[mSel]].name + ' (livello ' + mgLv(M.cells[mSel]) + ')' : '';
  if (sel) h += '<p class="mghelp sel">Hai preso <b>' + sel + '</b>: tocca un pezzo uguale per unirli, o una casella vuota per spostarlo.</p>';
  else if (M.sold < 5) h += '<p class="mghelp">Tocca il <b>banco del macellaio</b> per avere una coscia, poi unisci due pezzi uguali (trascinandoli o toccandoli) per fare il salume successivo.</p>';
  /* la scala dei salumi, in una riga */
  h += '<div class="mgsec"><h3>I salumi <small>' + M.best + ' su ' + MAXL + ' scoperti</small></h3><div class="mgchain">' + CHAIN.slice(1, MAXL + 1).map((c, i) => '<span class="' + (i + 1 <= M.best ? '' : 'unk') + '"><em>' + (i + 1) + '</em>' + itemSVG(i + 1) + '<small>' + (i + 1 <= M.best ? c.name : '?') + '</small></span>').join('') + '</div></div>';
  if (M.cheese) { const bc = (M.bestC || 101) - 100; h += '<div class="mgsec"><h3>I formaggi del casaro <small>' + bc + ' su 8 scoperti</small></h3><div class="mgchain">' + CHEESE.map((c, k) => '<span class="' + (k + 1 <= bc ? '' : 'unk') + '"><em>' + (k + 1) + '</em>' + cheeseSVG(101 + k) + '<small>' + (k + 1 <= bc ? c.name : '?') + '</small></span>').join('') + '</div></div>'; }
  if (M.bread) { const bf = (M.bestF || 201) - 200; h += '<div class="mgsec"><h3>Il forno della nonna <small>' + bf + ' su 8 scoperti</small></h3><div class="mgchain">' + BREAD.map((c, k) => '<span class="' + (k + 1 <= bf ? '' : 'unk') + '"><em>' + (k + 1) + '</em>' + breadSVG(201 + k) + '<small>' + (k + 1 <= bf ? c.name : '?') + '</small></span>').join('') + '</div></div>'; }
  /* migliorie */
  const nextRow = M.cells.findIndex((x) => x === -1);
  const rowN = nextRow >= 0 ? Math.floor(nextRow / COLS) : -1;
  const up = (k, ic, t, d, cost, can) => '<button class="mgupc" data-up="' + k + '"' + (can ? '' : ' disabled') + '><span class="mgupi">' + ic + '</span><span><b>' + t + '</b><small>' + d + '</small></span><em>' + cost + ' 🪙</em></button>';
  h += '<div class="mgsec"><h3>Amplia il salumificio</h3><div class="mgup">' +
    (rowN > 0 ? up('row', '🪵', 'Nuova fila di banconi', 'Sei caselle in più', ROW_COST[rowN], E.carlini >= ROW_COST[rowN]) : '<span class="mgupc done"><span class="mgupi">🪵</span><span><b>Banconi al completo</b></span></span>') +
    (M.genLvl < 4 ? up('gen', '🔪', 'Coltello affilato · liv. ' + (M.genLvl + 1), 'A volte dà subito carne macinata', 350 * M.genLvl, E.carlini >= 350 * M.genLvl) : '<span class="mgupc done"><span class="mgupi">🔪</span><span><b>Coltello al massimo</b></span></span>') +
    (M.energyMax < 40 ? up('max', '⚡', 'Più energia', 'Il massimo sale di 5', 25 * M.energyMax, E.carlini >= 25 * M.energyMax) : '<span class="mgupc done"><span class="mgupi">⚡</span><span><b>Energia al massimo</b></span></span>') +
    '</div>' + (E.helpers.pastaia ? '<small class="hint">La pastaia a volte prepara una coscia in più.</small>' : '') + '</div>';
  box.innerHTML = h;
  if (mFlash) setTimeout(() => { mFlash = null; }, 400);
}
/* energia finita: subito la scelta tra video e attesa */
function mgEmptyPop() {
  const M = MG(); regen(M);
  overlay('<div class="mgpop">' + boltSVG() + '<h2>Energia finita</h2><p>Il macellaio si riposa. Torna 1 energia ogni minuto e mezzo (prossima tra <b>' + fmtTime(ENERGY_MS - (Date.now() - M.energyAt)) + '</b>), oppure guarda un video.</p>' +
    '<button class="btn take" id="mgPopVid">▶ Guarda un video: +10 energia</button><button class="btn alt" id="mgPopNo">Aspetto</button></div>');
  $('mgPopNo').onclick = () => { $('layer').innerHTML = ''; };
  $('mgPopVid').onclick = async () => { $('layer').innerHTML = ''; const got = await showRewardedAd(); if (got) { regen(M); M.energy = Math.min(M.energyMax + 10, M.energy + 10); flash('+10 energia'); save(); renderMerge(); } };
}
let mDrag = null;
$('salBox').addEventListener('pointerdown', (e) => {
  const c = e.target.closest('[data-cell]');
  if (!c) return;
  mDrag = { from: Number(c.dataset.cell), x: e.clientX, y: e.clientY, moved: false };
});
$('salBox').addEventListener('pointermove', (e) => {
  if (!mDrag) return;
  if (Math.abs(e.clientX - mDrag.x) + Math.abs(e.clientY - mDrag.y) > 12) mDrag.moved = true;
});
$('salBox').addEventListener('pointerup', (e) => {
  if (!mDrag) return;
  const d = mDrag; mDrag = null;
  const M = MG();
  if (d.moved) {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const t = el && el.closest('[data-cell]');
    if (t && typeof M.cells[d.from] === 'number' && M.cells[d.from] > 0) { mSel = null; moveItem(d.from, Number(t.dataset.cell)); }
    return;
  }
  const i = d.from, v = M.cells[i];
  if (v === 'G') { mSel = null; genTap(); return; }
  if (v === 'C') { mSel = null; genTapC(); return; }
  if (v === 'F') { mSel = null; genTapF(); return; }
  if (v === -1) return;
  if (mSel === null) { if (v > 0) { mSel = i; renderMerge(); } return; }
  if (mSel === i) { mSel = null; renderMerge(); return; }
  const from = mSel; mSel = null;
  moveItem(from, i);
});
$('salBox').addEventListener('click', async (e) => {
  const s = e.target.closest('[data-sell]');
  if (s && !s.disabled) { sellOrder(s.dataset.sell); return; }
  const u = e.target.closest('[data-up]');
  if (!u || u.disabled) return;
  const M = MG(), E = eco();
  if (u.dataset.up === 'row') { const nr = M.cells.findIndex((x) => x === -1), r = Math.floor(nr / COLS); if (E.carlini >= ROW_COST[r]) { E.carlini -= ROW_COST[r]; for (let c = 0; c < COLS; c++) M.cells[r * COLS + c] = 0; fx('big'); flash('Nuovi banconi!'); } }
  if (u.dataset.up === 'gen') { const c = 350 * M.genLvl; if (E.carlini >= c) { E.carlini -= c; M.genLvl++; fx('big'); } }
  if (u.dataset.up === 'max') { const c = 25 * M.energyMax; if (E.carlini >= c) { E.carlini -= c; M.energyMax += 5; M.energy += 5; fx('big'); } }
  if (u.dataset.up === 'video') { const got = await showRewardedAd(); if (got) { regen(M); M.energy = Math.min(M.energyMax + 10, M.energy + 10); flash('+10 energia'); } }
  save(); renderMerge(); renderRes();
});

/* ---------- navigazione del paese ---------- */
let paeseTab = 'tree';
$('paeseTabs').addEventListener('click', (e) => {
  const b = e.target.closest('[data-pt]');
  if (!b) return;
  paeseTab = b.dataset.pt;
  renderPaese();
});
const PAESE_RULES = { tree: 'albero', sal: 'salumificio', sheep: 'pecore', help: 'botteghe' };
$('conqRules').addEventListener('click', () => { if (!ND.open) showNduja('conquista'); });
$('chestRules').addEventListener('click', () => { if (!ND.open) showNduja('bauli'); });
$('paeseRules').addEventListener('click', () => { if (!ND.open) showNduja(PAESE_RULES[paeseTab]); });
function renderPaese() {
  for (const t of $('paeseTabs').children) t.setAttribute('aria-selected', String(t.dataset.pt === paeseTab));
  $('pTree').hidden = paeseTab !== 'tree';
  $('pSal').hidden = paeseTab !== 'sal';
  $('pHelp').hidden = paeseTab !== 'help';
  $('pSheep').hidden = paeseTab !== 'sheep';
  const rk = PAESE_RULES[paeseTab];
  if (rk && !ndSeen(rk) && !ND.open) setTimeout(() => { if (view === 'vPaese' && !ND.open) showNduja(rk); }, 350);
  if (paeseTab === 'tree') renderTree();
  if (paeseTab === 'sal') renderMerge();
  if (paeseTab === 'help') renderHelpers();
  if (paeseTab === 'sheep') renderSheep();
  renderRes();
}
setInterval(() => {
  if (view === 'vChests') renderChests(true);
  if (view === 'vPaese' && paeseTab === 'sal') renderMerge(true);
  if (view === 'vPaese' && paeseTab === 'sheep' && !ND.open) { sheepLive(); renderSheep(true); }
  if (view === 'vPaese' && paeseTab === 'help' && Date.now() % 20000 < 1000) renderHelpers();
  if (view === 'vHome') { const n = readyChests(); const b = $('chestBadge'); if (b) { b.textContent = n; b.hidden = !n; } if (typeof advAlert === 'function') advAlert(); }
}, 1000);
