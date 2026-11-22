/* ================= A CASA DA FIGGHIA =================
   Due compari si bisticciano su chi fa la casa più grande per la figlia che si sposa.
   A turno lanciano mattoni, pomodori, ’nduja, caciocavalli e pani verso la casa grezza dell'altro, oppure alzano un piano.
   Vince chi resta con più mattoni dopo 10 turni a testa (o chi butta giù la casa dell'altro).
   Anche qui la fisica usa solo + - * /: con lo stesso lancio due telefoni vedono esattamente la stessa scena. */
const CA_W = 1200, CA_VW = 480, CA_H = 560, CA_GY = 480, CA_CW = 32, CA_CH = 24, CA_COLS = 7, CA_MAXR = 13, CA_TURNS = 10, CA_MS = 1.45;
const CA_X0 = [40, CA_W - 40 - CA_COLS * CA_CW];
const CA_G = 0.25, CA_MAXV = 18.5, CA_DRAG = 120;
const CA_WEAP = {
  mattone: { n: 'Mattone', ic: '🧱', uses: 99, r: 6, g: 1, wind: 1 },
  pomodoro: { n: 'Pomodoro', ic: '🍅', uses: 3, r: 5, g: 0.82, wind: 1.6 },
  nduja: { n: '’Nduja', ic: '🌶️', uses: 2, r: 6, g: 1, wind: 1 },
  cacio: { n: 'Caciocavallo', ic: '🧀', uses: 2, r: 7, g: 1.18, wind: 0.6 },
  pane: { n: 'Pane', ic: '🥖', uses: 2, r: 7, g: 1, wind: 1 },
};
const CA_BUILD_USES = 3;
const CA_DMG = {
  mattone: [[0, 0, 2], [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1]],
  pomodoro: [[0, 0, 1]],
  nduja: [[0, 0, 3], [1, 0, 2], [-1, 0, 2], [0, 1, 2], [0, -1, 2], [1, 1, 1], [-1, 1, 1], [1, -1, 1], [-1, -1, 1], [2, 0, 1], [-2, 0, 1], [0, 2, 1]],
  pane1: [[0, 0, 1]],
  cacio: [[0, 0, 3], [0, -1, 1]],
};
/* i compari: aspetto e forza del computer */
const CA_FOLK = [
  { id: 'ciccio', n: 'Compare Ciccio', town: 'Bovalino', sk: 0.42, rows: 7, cap: '#5B4A3A', vest: '#3F5E3A', shirt: '#F4F1E8', skin: '#E2B48C', mous: true, belly: 1.1 },
  { id: 'toto', n: 'Zi’ Totò', town: 'Siderno', sk: 0.54, rows: 8, cap: '#2F3B4C', vest: '#7A3B2E', shirt: '#EDE6D3', skin: '#D9A57E', mous: true, belly: 1.25, glasses: true },
  { id: 'rocco', n: 'Mastru Rocco', town: 'Locri', sk: 0.64, rows: 8, cap: '#C9C2B2', vest: '#4A6C8C', shirt: '#F4F1E8', skin: '#C98F66', mous: true, belly: 1.0, helmet: true, pill: 3 },
  { id: 'carmela', n: 'Donna Carmela', town: 'Gerace', sk: 0.72, rows: 9, scarf: '#7A1430', dress: '#2E2E4A', skin: '#E6B994', woman: true, belly: 1.05 },
  { id: 'sindaco', n: 'U Sindacu', town: 'Tropea', sk: 0.82, rows: 10, cap: null, vest: '#2A2A2A', shirt: '#FFFFFF', skin: '#E0AE86', mous: true, belly: 1.35, sash: true, bald: true },
];
const CA_FOLK_LINES = {
  ciccio: [['Bovalinu nun si tocca!', 'Bovalino non si tocca!'], ['A me figghia avi u corredu da sei!', 'Mia figlia ha il corredo da sei!']],
  toto: [['Cu st’occhiali ti viju bonu, sai!', 'Con questi occhiali ti vedo bene, sai!'], ['Siderno è a capitali, u sannu tutti!', 'Siderno è la capitale, lo sanno tutti!']],
  rocco: [['Iu i case i fazzu di trent’anni!', 'Io le case le faccio da trent’anni!'], ['Chistu pilastru u fici iu cu i mani mei!', 'Questo pilastro l’ho fatto io con le mie mani!']],
  carmela: [['Ccà cumandu iu, no me maritu!', 'Qui comando io, non mio marito!'], ['A zita mia avi a casa cu a piscina!', 'La sposa mia avrà la casa con la piscina!']],
  sindaco: [['Ti levu u permessu edilizziu!', 'Ti revoco il permesso edilizio!'], ['Iu sugnu u sindacu, a casa chiù randi è a mia pi leggi!', 'Io sono il sindaco, la casa più grande è la mia per legge!']],
};
/* i paesi: ognuno ha il suo panorama, il suo modo di costruire e il suo vento */
const CA_TOWN = {
  ciccio: { town: 'Bovalino', place: 'sul lungomare', scene: 'mare', style: 'rustico', wmax: 2.0, stars: 1, note: 'Casa a rustico classica, vento leggero dal mare.' },
  toto: { town: 'Siderno', place: 'sul corso', scene: 'corso', style: 'intonaco', wmax: 2.6, stars: 2, note: 'I primi piani sono già intonacati, con le persiane verdi.' },
  rocco: { town: 'Locri', place: 'vicino agli scavi greci', scene: 'scavi', style: 'rinforzato', wmax: 3.1, stars: 3, note: 'Mastru Rocco usa cemento armato vero: i pilastri reggono tre colpi.' },
  carmela: { town: 'Gerace', place: 'sotto il borgo antico', scene: 'borgo', style: 'pietra', wmax: 3.6, stars: 4, note: 'Casa di pietra come una volta: ogni muro regge due colpi. Raffiche in collina.' },
  sindaco: { town: 'Tropea', place: 'sulla rupe', scene: 'rupe', style: 'pastello', wmax: 4.4, stars: 5, note: 'Vento forte sul mare e un colpo di ’nduja in più per U Sindacu.' },
};
const CA_SURP = {
  vigile: { ic: '🚓', t: 'Arriva u vigili!', d: 'Controllo dei permessi: chi ha la casa più grande perde un “Alza un piano”.', nd: 'Abuso edilizio! E mo’ chi ci fa la multa?' },
  temporale: { ic: '⛈️', t: 'Temporale!', d: 'Per due turni il vento soffia il doppio.', nd: 'Acqua e ventu! Tiniti forti a coppola!' },
  cimento: { ic: '🚚', t: 'U camiu du cimentu!', d: 'Il camion lascia cemento a tutti e due: un “Alza un piano” in più a testa.', nd: 'Cimentu ’n regalu! Cu’ jusa pigghia!' },
  banda: { ic: '🎺', t: 'Passa a banda!', d: 'Festa in paese: un colpo speciale in regalo a testa.', nd: 'Musica! E pi’ festeggiari, nu colpu in chiù!' },
  processione: { ic: '🕯️', t: 'Passa a processioni', d: 'Tutti zitti e cappello in mano: per questo turno niente vento.', nd: 'Ssst! Cappeddu ’n manu, passa u Santu.' },
};
const CA_ME_LOOK = { cap: '#3A2A1E', vest: '#8C5A2B', shirt: '#F7F3EA', skin: '#E3B38A', mous: true, belly: 1.15 };
const CA_DECOR = [
  { id: 'leoni', n: 'I leoni di gesso al cancello', lv: 0 },
  { id: 'balcone', n: 'Il balcone con la ringhiera', lv: 1 },
  { id: 'parabola', n: 'La parabola sul tetto', lv: 2 },
  { id: 'cancello', n: 'Il cancello dorato', lv: 3 },
  { id: 'colonne', n: 'Le colonne all’ingresso', lv: 4 },
];
/* dialoghi: [dialetto, italiano] */
const CA_LINES = {
  throw: [['Cumpà, a casa toi pari na baracca!', 'Compare, la tua casa sembra una baracca!'], ['A me figghia si marita a giugnu, e tu ancora cu i ferri fora!', 'Mia figlia si sposa a giugno, e tu ancora con i ferri fuori!'], ['Pigghia sta’ mattunata!', 'Prenditi questa mattonata!'], ['Chistu è pi l’onuri da famigghia!', 'Questo è per l’onore della famiglia!'], ['A casa chiù randi du paisi a fazzu iu!', 'La casa più grande del paese la faccio io!'], ['U geometra toi è me cuginu, sacciu tuttu!', 'Il tuo geometra è mio cugino, so tutto!'], ['Senza permessu a facisti, eh?', 'L’hai fatta senza permesso, eh?']],
  hit: [['Ahi! U me pilastru! Chistu u paghi!', 'Ahi! Il mio pilastro! Questo lo paghi!'], ['Madonna mia, a cucina da figghia!', 'Madonna mia, la cucina di mia figlia!'], ['Ma chi si’ pacciu?!', 'Ma sei pazzo?!'], ['Mo’ chiamu u geometra!', 'Adesso chiamo il geometra!'], ['I mattuni costanu, sai?!', 'I mattoni costano, lo sai?!']],
  miss: [['Mancu i gaddini pigghi!', 'Non prendi nemmeno le galline!'], ['Ahahah, chi mira!', 'Ahahah, che mira!'], ['U ventu, u ventu… scusi!', 'Il vento, il vento… scuse!'], ['Jetta, jetta, chi a me casa resta ’ddhà!', 'Tira, tira, la mia casa resta lì!']],
  man: [['Ahiaaa! ’Nta testa no!', 'Ahiaaa! In testa no!'], ['Mi stunasti! Pèrdu u turnu!', 'Mi hai stordito! Perdo il turno!']],
  tomato: [['Tutta a sarsa da nonna mi jettasti!', 'Mi hai tirato tutta la salsa della nonna!']],
  build: [['N’atru pianu! E chista è a mansarda!', 'Un altro piano! E questa è la mansarda!'], ['Cimentu e mattuni: a casa crisci!', 'Cemento e mattoni: la casa cresce!'], ['Pi’ fari dispettu, n’atru pianu!', 'Per fare dispetto, un altro piano!']],
  bride: [['Papà, basta! Mi maritu ’n affittu!', 'Papà, basta! Mi sposo in affitto!'], ['Papààà! U lettu da zita!', 'Papààà! Il letto da sposa!'], ['Mi ndi vaju a Milanu, vui siti pacci!', 'Me ne vado a Milano, siete pazzi!']],
  win: [['Vidisti? A casa chiù randi è a mia!', 'Hai visto? La casa più grande è la mia!']],
};
const caLine = (k) => { const a = CA_LINES[k]; const x = a[Math.floor(Math.random() * a.length)]; return tr2(x[0], x[1]); };
if (typeof RULES !== 'undefined') {
  RULES.casa = ['A Casa da Figghia! Due compari, due figlie da sposare e due case a rustico, con i ferri che spuntano dal tetto. Chi fa la casa più grande?', 'A turno tiri indietro il dito, come una fionda: scegli quanto in alto e quanto forte, e lanci verso la casa dell’altro. Occhio al vento, la bandierina ti dice da dove soffia!', 'Il mattone non finisce mai. Poi hai pochi colpi speciali: il pomodoro vola leggero, la ’nduja esplode, il caciocavallo sfonda i muri, il pane rimbalza.', 'Se colpisci il compare in persona, quello resta stordito e salta il turno. Col pomodoro poi resta tutto sporco di salsa!', 'Invece di tirare puoi anche alzare un piano: tre volte a partita. I muri che restano senza niente sotto vengono giù!', {"b": "E se tiro un mattone a mia suocera?"}, {"n": "Bergo, quella casa è già finita. E poi ti cucina lei la domenica.", "mad": true}, 'Dopo dieci turni a testa vince chi ha più mattoni in piedi. Se butti giù la casa dell’altro, vinci subito. Si gioca contro i compari del paese e anche online, pure sfidando un amico.'];
}

/* ---------- la casa: una griglia di mattoni (tipo*10 + resistenza) ---------- */
/* 11 mattone, 22 pilastro (21 crepato), 31 finestra, 41 porta */
function caNewGrid(rows, style) {
  const g = new Array(CA_COLS * CA_MAXR).fill(0);
  for (let r = 0; r < rows; r++) for (let c = 0; c < CA_COLS; c++) g[r * CA_COLS + c] = caCellFor(c, r, style);
  return g;
}
/* facciata: pilastri ai lati e in mezzo, porta in basso, finestre a file alterne */
const CA_PILL = [0, 3, 6];
function caCellFor(c, r, style) {
  if (CA_PILL.includes(c)) return style === 'rinforzato' ? 23 : 22;
  if (style === 'pietra' && !(r % 2 === 1 && (c === 1 || c === 5)) && !(r % 2 === 0 && r > 0 && c === 4) && !(r === 0 && c === 2)) return 52;
  if (r === 0 && c === 2) return 41;
  if (r % 2 === 1 && (c === 1 || c === 5)) return 31;
  if (r % 2 === 0 && r > 0 && c === 4) return 31;
  return 11;
}
const caCount = (g) => g.reduce((s, v) => s + (v ? 1 : 0), 0);
function caColH(g, c) { let h = 0; for (let r = 0; r < CA_MAXR; r++) if (g[r * CA_COLS + c]) h = r + 1; return h; }
const caFloors = (g) => { let m = 0; for (let c = 0; c < CA_COLS; c++) m = Math.max(m, caColH(g, c)); return m; };
/* i muri senza appoggio vengono giù: ogni colonna si compatta verso terra */
function caCollapse(g) {
  const moves = [];
  for (let c = 0; c < CA_COLS; c++) {
    let w = 0;
    for (let r = 0; r < CA_MAXR; r++) {
      const v = g[r * CA_COLS + c];
      if (!v) continue;
      if (r !== w) { g[w * CA_COLS + c] = v; g[r * CA_COLS + c] = 0; moves.push([c, r, w]); }
      w++;
    }
  }
  return moves;
}
function caDamage(g, c, r, pat, hits) {
  for (const [dc, dr, d] of pat) {
    const cc = c + dc, rr = r + dr;
    if (cc < 0 || cc >= CA_COLS || rr < 0 || rr >= CA_MAXR) continue;
    const k = rr * CA_COLS + cc, v = g[k]; if (!v) continue;
    const t = Math.floor(v / 10), hp = v % 10 - d;
    if (hp <= 0) { g[k] = 0; if (hits) hits.push([cc, rr, t]); } else g[k] = t * 10 + hp;
  }
}
function caBuild(g, style) {
  for (let c = 0; c < CA_COLS; c++) { const h = caColH(g, c); if (h < CA_MAXR) g[h * CA_COLS + c] = caCellFor(c, Math.max(1, h), style); }
}
/* la cisterna blu: sta sulla colonna interna più alta, se la casa ha almeno tre piani */
function caTankPos(g) {
  let best = 1; for (const c of [1, 2, 4, 5]) if (caColH(g, c) >= caColH(g, best)) best = c;
  const hc = caColH(g, best); if (hc < 3) return null;
  return { cx: CA_X0[0] * 0 + best * CA_CW + CA_CW / 2, cy: CA_GY - hc * CA_CH };
}
/* dove sta il compare: sopra il pilastro interno della sua casa */
function caManPos(g, p) {
  const c = p === 0 ? CA_COLS - 1 : 0, h = caColH(g, c);
  return { x: CA_X0[p] + c * CA_CW + CA_CW / 2, y: CA_GY - h * CA_CH };
}
const caHand = (g, p) => { const m = caManPos(g, p); return { x: m.x + (p === 0 ? 10 : -10), y: m.y - 48 }; };

/* ---------- il lancio, tutto calcolato prima: si anima poi lo stesso percorso ---------- */
/* st: { g: [g0, g1], wind } — shot: { w, vx, vy } — torna path, eventi e griglie nuove */
function caSim(g0, g1, wind, p, shot, tk) {
  const G = [g0.slice(), g1.slice()], W = CA_WEAP[shot.w], path = [], ev = [];
  tk = tk || [1, 1];
  const tanks = [0, 1].map((q) => { const tp = tk[q] ? caTankPos(G[q]) : null; return tp ? { x: CA_X0[q] + tp.cx, y: tp.cy } : null; });
  let tank = -1;
  const h = caHand(G[p], p), men = [caManPos(G[0], 0), caManPos(G[1], 1)];
  let x = h.x, y = h.y, vx = shot.vx, vy = shot.vy, bounces = 0, pierce = 0, f = 0, stun = -1, done = false;
  const ax = wind * 0.011 * W.wind, ay = CA_G * W.g, SUB = 3;
  const cellAt = (px, py) => {
    for (let q = 0; q < 2; q++) {
      const c = Math.floor((px - CA_X0[q]) / CA_CW), r = Math.floor((CA_GY - py) / CA_CH);
      if (c >= 0 && c < CA_COLS && r >= 0 && r < CA_MAXR && G[q][r * CA_COLS + c]) return { q, c, r };
    }
    return null;
  };
  while (!done && f < 700) {
    f++;
    vx += ax; vy += ay;
    for (let s = 0; s < SUB && !done; s++) {
      x += vx / SUB; y += vy / SUB;
      // il compare
      for (let q = 0; q < 2; q++) {
        if (q === p && f < 14) continue;
        const m = men[q];
        if (x > m.x - 14 && x < m.x + 14 && y > m.y - 70 && y < m.y + 2) { ev.push({ f, k: 'man', q, x, y }); stun = q; done = true; break; }
      }
      if (done) break;
      for (let q = 0; q < 2 && !done; q++) { const T = tanks[q]; if (T && x > T.x - 10 && x < T.x + 10 && y > T.y - 16 && y < T.y) { ev.push({ f, k: 'tank', q, x, y }); tank = q; done = true; } }
      if (done) break;
      if (y >= CA_GY - W.r * 0.4) {
        // a terra: la ’nduja vicino ai muri fa danno lo stesso
        if (shot.w === 'nduja') for (let q = 0; q < 2; q++) { const c = Math.floor((x - CA_X0[q]) / CA_CW); if (c >= -1 && c <= CA_COLS) { const hits = []; caDamage(G[q], Math.max(0, Math.min(CA_COLS - 1, c)), 0, [[0, 0, 2], [1, 0, 1], [-1, 0, 1], [0, 1, 1]], hits); if (hits.length) ev.push({ f, k: 'cell', q, c, r: 0, hits }); } }
        if (shot.w === 'pane' && bounces === 0) { bounces++; vy = -Math.abs(vy) * 0.5; vx *= 0.7; y = CA_GY - W.r; ev.push({ f, k: 'bounce', x, y }); continue; }
        ev.push({ f, k: 'ground', x, y: CA_GY }); done = true; break;
      }
      if (x < -60 || x > CA_W + 60) { ev.push({ f, k: 'out', x, y }); done = true; break; }
      const hit = cellAt(x + (vx > 0 ? W.r * 0.6 : -W.r * 0.6), y) || cellAt(x, y + W.r * 0.6);
      if (hit) {
        const hits = [];
        if (shot.w === 'pane' && bounces === 0) {
          caDamage(G[hit.q], hit.c, hit.r, CA_DMG.pane1, hits); bounces++;
          ev.push({ f, k: 'cell', q: hit.q, c: hit.c, r: hit.r, hits, x, y });
          vx = -vx * 0.5; vy = -Math.abs(vy) * 0.45; x += vx; y += vy; continue;
        }
        if (shot.w === 'cacio') {
          caDamage(G[hit.q], hit.c, hit.r, CA_DMG.cacio, hits);
          ev.push({ f, k: 'cell', q: hit.q, c: hit.c, r: hit.r, hits, x, y });
          if (!G[hit.q][hit.r * CA_COLS + hit.c] && pierce < 2) { pierce++; vx *= 0.6; vy *= 0.6; continue; }
          done = true; break;
        }
        caDamage(G[hit.q], hit.c, hit.r, CA_DMG[shot.w] || CA_DMG.mattone, hits);
        ev.push({ f, k: 'cell', q: hit.q, c: hit.c, r: hit.r, hits, x, y }); done = true; break;
      }
    }
    path.push(Math.round(x * 10) / 10, Math.round(y * 10) / 10);
  }
  const fall = [caCollapse(G[0]), caCollapse(G[1])];
  return { path, ev, g: G, stun, fall, tank };
}
const caRound3 = (v) => Math.round(v * 1000) / 1000;
function caShotVec(w, ang, pow) { const v = CA_MAXV * Math.max(0.15, Math.min(1, pow)); return { w, vx: caRound3(Math.cos(ang) * v), vy: caRound3(Math.sin(ang) * v) }; }
/* il computer prova tanti lanci e sceglie (le squadre... i compari più bravi sbagliano meno) */
function caAI(g0, g1, wind, p, uses, skill) {
  const opp = 1 - p, G = [g0, g1], dir = p === 0 ? 1 : -1;
  const myN = caCount(G[p]), opN = caCount(G[opp]);
  if (uses.build > 0 && myN < opN - 5 && caFloors(G[p]) < CA_MAXR - 1 && Math.random() < 0.5) return { w: 'build' };
  const avail = Object.keys(CA_WEAP).filter((w) => (uses[w] || 0) > 0);
  let w = 'mattone';
  const r = Math.random();
  if (avail.includes('nduja') && r < 0.28) w = 'nduja'; else if (avail.includes('cacio') && r < 0.48) w = 'cacio'; else if (avail.includes('pane') && r < 0.58) w = 'pane'; else if (avail.includes('pomodoro') && r < 0.68) w = 'pomodoro';
  const cands = [];
  for (let a = 18; a <= 78; a += 4) for (let pw = 0.45; pw <= 1.001; pw += 0.05) {
    const ang = (p === 0 ? -a : -(180 - a)) * Math.PI / 180;
    const sh = caShotVec(w, ang, pw), R = caSim(g0, g1, wind, p, sh, CA.m && CA.m.tank);
    let sc = (opN - caCount(R.g[opp])) * 10 - (myN - caCount(R.g[p])) * 14;
    if (R.stun === opp) sc += 26; if (R.stun === p) sc -= 40; if (R.tank === opp) sc += 18; if (R.tank === p) sc -= 30;
    if (sc <= 0) { const end = R.path.length ? R.path[R.path.length - 2] : 0; const tx = CA_X0[opp] + CA_COLS * CA_CW / 2; sc = -Math.abs(end - tx) / 20; }
    cands.push([sc + Math.random() * (1 - skill) * 18, sh, a, pw]);
  }
  cands.sort((x, y) => y[0] - x[0]);
  const k = Math.min(cands.length - 1, Math.floor(Math.random() * (1 + (1 - skill) * 10)));
  const [, , a, pw] = cands[k];
  const na = a + (Math.random() - 0.5) * (1 - skill) * 9, np = pw * (1 + (Math.random() - 0.5) * (1 - skill) * 0.12);
  void dir;
  return caShotVec(w, (p === 0 ? -na : -(180 - na)) * Math.PI / 180, np);
}

/* ---------- suoni del cantiere, fatti al momento ---------- */
function caSnd(kind) {
  if (typeof AUDIO === 'undefined' || !AUDIO.on) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const A = actx, now = A.currentTime, out = typeof fxDest === 'function' ? fxDest() : A.destination;
    const noise = (dur, f0, f1, q, vol, type) => {
      const n = Math.floor(A.sampleRate * dur), b = A.createBuffer(1, n, A.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
      const s = A.createBufferSource(), f = A.createBiquadFilter(), g = A.createGain();
      f.type = type || 'bandpass'; f.Q.value = q; f.frequency.setValueAtTime(f0, now); f.frequency.exponentialRampToValueAtTime(f1, now + dur);
      g.gain.value = vol; s.buffer = b; s.connect(f).connect(g).connect(out); s.start();
    };
    const tn = (f0, f1, dur, vol, type) => { const o = A.createOscillator(), g = A.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f0, now); o.frequency.exponentialRampToValueAtTime(f1, now + dur); g.gain.setValueAtTime(vol, now); g.gain.exponentialRampToValueAtTime(0.001, now + dur); o.connect(g).connect(out); o.start(); o.stop(now + dur); };
    if (kind === 'whoosh') noise(0.35, 400, 1800, 1.2, 0.35);
    if (kind === 'crash') { noise(0.5, 1200, 200, 0.7, 0.7, 'lowpass'); tn(120, 50, 0.25, 0.35); }
    if (kind === 'thud') { tn(140, 60, 0.18, 0.4); noise(0.12, 600, 200, 0.8, 0.25, 'lowpass'); }
    if (kind === 'splat') { noise(0.18, 2400, 500, 2, 0.45); tn(300, 120, 0.1, 0.2); }
    if (kind === 'boom') { noise(0.9, 900, 60, 0.5, 0.9, 'lowpass'); tn(90, 30, 0.6, 0.5); }
    if (kind === 'bounce') tn(220, 420, 0.12, 0.25, 'triangle');
    if (kind === 'ahi') tn(520, 260, 0.3, 0.2, 'sawtooth');
    if (kind === 'build') { tn(880, 880, 0.08, 0.15, 'square'); setTimeout(() => caSnd('clink'), 140); }
    if (kind === 'clink') tn(1320, 1320, 0.08, 0.12, 'square');
    if (kind === 'cheer') noise(1.2, 900, 1400, 0.4, 0.35);
  } catch (e) { /* niente audio */ }
}
const CA_WDESC = { mattone: 'Il colpo di sempre: non finisce mai.', pomodoro: 'Leggero, vola lontano ma il vento lo sposta. Se prende il compare, gli fa saltare il turno sporco di salsa.', nduja: 'Esplode col fuoco e butta giù un bel pezzo di muro.', cacio: 'Pesante: cade presto, ma sfonda fino a tre blocchi.', pane: 'Rimbalza una volta, poi colpisce di nuovo.', build: 'Invece di tirare, alzi un piano alla tua casa.' };

/* ---------- dati del giocatore ---------- */
function caData() { if (!P.casa) P.casa = { lv: 0, w: 0, l: 0, d: 0, decor: [], best: 0 }; return P.casa; }

/* ---------- stato schermata ---------- */
const CA = { screen: 'menu', m: null, raf: 0, cv: null, aim: null, bg: null, t: 0, parts: [], splats: [], shake: 0 };
function caBusy() { return view === 'vCasa' && CA.m && !CA.m.over; }

/* ---------- lo scenario (disegnato una volta, con tanti dettagli) ---------- */
function caRand(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function caBackground(sc, tod, scene) {
  const c = document.createElement('canvas'); c.width = Math.round(CA_W * sc); c.height = Math.round(CA_H * sc);
  const x = c.getContext('2d'); x.scale(sc, sc);
  const R = caRand(7), W = CA_W;
  tod = tod || 'giorno';
  // il cielo: pomeriggio, tramonto o sera
  let g = x.createLinearGradient(0, 0, 0, CA_GY);
  const SKY = { giorno: ['#5DA9E9', '#A8D8F0', '#FCE3B0', '#F7C98B'], tramonto: ['#3B4A8C', '#C46A7A', '#F59A5B', '#FFC27A'], sera: ['#0B1534', '#1D2E5E', '#3C3F72', '#5A4A6E'] }[tod];
  g.addColorStop(0, SKY[0]); g.addColorStop(0.55, SKY[1]); g.addColorStop(0.85, SKY[2]); g.addColorStop(1, SKY[3]);
  x.fillStyle = g; x.fillRect(0, 0, W, CA_H);
  if (tod === 'sera') { for (let k = 0; k < 120; k++) { x.fillStyle = 'rgba(255,255,255,' + (0.3 + R() * 0.7) + ')'; x.fillRect(R() * W, R() * 250, 1.2, 1.2); } }
  // sole (o luna)
  const sx = W * 0.72, sy = tod === 'tramonto' ? 260 : 96;
  g = x.createRadialGradient(sx, sy, 4, sx, sy, tod === 'sera' ? 50 : 90);
  if (tod === 'sera') { g.addColorStop(0, 'rgba(255,255,235,0.9)'); g.addColorStop(1, 'rgba(255,255,235,0)'); } else { g.addColorStop(0, 'rgba(255,248,210,1)'); g.addColorStop(0.3, tod === 'tramonto' ? 'rgba(255,170,90,0.85)' : 'rgba(255,230,150,0.8)'); g.addColorStop(1, 'rgba(255,220,140,0)'); }
  x.fillStyle = g; x.beginPath(); x.arc(sx, sy, 90, 0, Math.PI * 2); x.fill();
  x.fillStyle = tod === 'sera' ? '#F4F1DC' : tod === 'tramonto' ? '#FFD08A' : '#FFF4C8'; x.beginPath(); x.arc(sx, sy, tod === 'sera' ? 16 : 24, 0, Math.PI * 2); x.fill();
  if (tod === 'sera') { x.fillStyle = 'rgba(200,200,180,0.35)'; for (const [mx, my, mr] of [[-5, -4, 3], [4, 3, 2.4], [3, -6, 1.6]]) { x.beginPath(); x.arc(sx + mx, sy + my, mr, 0, Math.PI * 2); x.fill(); } }
  // mare con i riflessi
  const seaY = 300;
  g = x.createLinearGradient(0, seaY, 0, seaY + 60); g.addColorStop(0, '#2E7FB8'); g.addColorStop(1, '#5FB3D9');
  x.fillStyle = g; x.fillRect(0, seaY, W, 70);
  x.strokeStyle = 'rgba(255,255,255,0.45)'; x.lineWidth = 1;
  for (let k = 0; k < 110; k++) { const yy = seaY + 4 + R() * 60, xx = R() * W, l = 6 + R() * 16; x.beginPath(); x.moveTo(xx, yy); x.lineTo(xx + l, yy); x.stroke(); }
  x.fillStyle = 'rgba(255,240,190,0.55)'; for (let k = 0; k < 14; k++) x.fillRect(sx - 20 + (R() - 0.5) * 40, seaY + 3 + k * 4, 10 + R() * 22, 1.4);
  // lo Stromboli col fumo e un'altra isola lontana
  const isl = (ix, w, h) => { x.fillStyle = '#6E8FA8'; x.beginPath(); x.moveTo(ix - w, seaY); x.lineTo(ix, seaY - h); x.lineTo(ix + w, seaY); x.closePath(); x.fill(); };
  isl(W * 0.5, 30, 28); isl(W * 0.86, 44, 16);
  x.fillStyle = 'rgba(230,230,235,0.7)'; for (let k = 0; k < 5; k++) { x.beginPath(); x.arc(W * 0.5 + 4 + k * 7, seaY - 34 - k * 8, 4 + k * 1.8, 0, Math.PI * 2); x.fill(); }
  // nave da crociera all'orizzonte
  x.fillStyle = '#F4F4F4'; x.fillRect(W * 0.3, seaY - 7, 46, 6); x.fillRect(W * 0.3 + 6, seaY - 11, 32, 4); x.fillStyle = '#C8102E'; x.fillRect(W * 0.3 + 30, seaY - 15, 5, 4);
  // colline
  x.fillStyle = '#7FA06A';
  x.beginPath(); x.moveTo(0, 330);
  for (let k = 0; k <= 6; k++) { const xx = k * W / 6; x.quadraticCurveTo(xx - W / 12, 280 + (k % 2) * 30, xx, 320 + (k % 3) * 8); }
  x.lineTo(W, 400); x.lineTo(0, 400); x.closePath(); x.fill();
  x.fillStyle = '#93B47A';
  x.beginPath(); x.moveTo(0, 360);
  for (let k = 0; k <= 8; k++) { const xx = k * W / 8; x.quadraticCurveTo(xx - W / 16, 326 + (k % 2) * 18, xx, 350 + (k % 2) * 6); }
  x.lineTo(W, 410); x.lineTo(0, 410); x.closePath(); x.fill();
  // paesini arroccati con campanile
  const village = (vx, vy, n) => {
    for (let k = 0; k < n; k++) { const tx = vx + k * 14, ty = vy - Math.abs(k - n / 2) * -1.5, hgt = 12 + R() * 10, wd = 12 + R() * 4; x.fillStyle = ['#F2E3C6', '#EBD3A8', '#F6EEDC', '#E9C9A0'][Math.floor(R() * 4)]; x.fillRect(tx, ty - hgt, wd, hgt); x.fillStyle = '#B5562E'; x.beginPath(); x.moveTo(tx - 1, ty - hgt); x.lineTo(tx + wd / 2, ty - hgt - 5); x.lineTo(tx + wd + 1, ty - hgt); x.fill(); x.fillStyle = 'rgba(60,40,30,0.55)'; x.fillRect(tx + 3, ty - hgt + 4, 2.5, 3.5); x.fillRect(tx + wd - 6, ty - hgt + 4, 2.5, 3.5); }
    const bt = vx + n * 7; x.fillStyle = '#E8D7B5'; x.fillRect(bt, vy - 52, 9, 40); x.fillStyle = '#B5562E'; x.beginPath(); x.moveTo(bt - 2, vy - 52); x.lineTo(bt + 4.5, vy - 64); x.lineTo(bt + 11, vy - 52); x.fill(); x.fillStyle = '#5A3A22'; x.beginPath(); x.arc(bt + 4.5, vy - 44, 2.4, 0, Math.PI * 2); x.fill();
  };
  village(30, 300, 7); village(W * 0.62, 318, 6); village(W - 150, 302, 8);
  // castello sulla collina
  x.fillStyle = '#D9C9A6'; x.fillRect(W * 0.38, 270, 40, 26); for (let k = 0; k < 5; k++) x.fillRect(W * 0.38 + k * 9, 265, 5, 6); x.fillRect(W * 0.38 + 30, 252, 12, 44); for (let k = 0; k < 3; k++) x.fillRect(W * 0.38 + 30 + k * 4.5, 247, 3, 5);
  caScene(x, scene || 'mare', R, W);
  // ulivi
  const olive = (ox, oy, s) => { x.fillStyle = '#6B5136'; x.fillRect(ox - 1.2 * s, oy - 7 * s, 2.4 * s, 7 * s); x.fillStyle = '#5E7A4A'; for (let k = 0; k < 5; k++) { x.beginPath(); x.arc(ox + (R() - 0.5) * 9 * s, oy - 9 * s - R() * 5 * s, (4 + R() * 3) * s, 0, Math.PI * 2); x.fill(); } x.fillStyle = 'rgba(200,215,170,0.5)'; x.beginPath(); x.arc(ox - 2 * s, oy - 12 * s, 2 * s, 0, Math.PI * 2); x.fill(); };
  for (let k = 0; k < 30; k++) olive(10 + k * 40 + R() * 12, 352 + R() * 22, 0.8 + R() * 0.5);
  // pali della luce con i fili
  x.strokeStyle = '#5A4A3A'; x.lineWidth = 2.5;
  const poles = []; for (let k = 0; k <= 6; k++) poles.push([8 + k * (W - 16) / 6, 330 + (k % 2) * 6]);
  for (const [px, py] of poles) { x.beginPath(); x.moveTo(px, py + 70); x.lineTo(px, py); x.stroke(); x.beginPath(); x.moveTo(px - 8, py + 4); x.lineTo(px + 8, py + 4); x.stroke(); }
  x.strokeStyle = 'rgba(40,30,25,0.6)'; x.lineWidth = 0.9;
  for (let k = 0; k < poles.length - 1; k++) for (const o of [-7, 7]) { const [a1, b1] = poles[k], [a2, b2] = poles[k + 1]; x.beginPath(); x.moveTo(a1 + o, b1 + 4); x.quadraticCurveTo((a1 + a2) / 2, Math.max(b1, b2) + 26, a2 + o, b2 + 4); x.stroke(); }
  // terreno
  g = x.createLinearGradient(0, 390, 0, CA_H); g.addColorStop(0, '#C9A06A'); g.addColorStop(0.3, '#B88B55'); g.addColorStop(1, '#8E6A40');
  x.fillStyle = g; x.beginPath(); x.moveTo(0, 410); for (let k = 0; k <= 6; k++) x.lineTo(k * W / 6, 398 + (k % 2) * 8); x.lineTo(W, CA_H); x.lineTo(0, CA_H); x.closePath(); x.fill();
  // la strada di paese in mezzo, con le strisce consumate
  x.fillStyle = '#8A8478'; x.fillRect(W * 0.36, 452, W * 0.28, 24); x.fillStyle = '#6E695F'; x.fillRect(W * 0.36, 452, W * 0.28, 2); x.fillRect(W * 0.36, 474, W * 0.28, 2);
  x.fillStyle = 'rgba(255,255,255,0.65)'; for (let k = 0; k < 9; k++) x.fillRect(W * 0.37 + k * 36, 463, 16, 2);
  for (let k = 0; k < 400; k++) { const gx = R() * W, gy = 408 + R() * (CA_H - 410); x.fillStyle = ['rgba(90,70,45,0.35)', 'rgba(230,210,170,0.35)', 'rgba(120,100,70,0.35)'][k % 3]; x.beginPath(); x.ellipse(gx, gy, 1 + R() * 2.4, 0.8 + R() * 1.4, 0, 0, Math.PI * 2); x.fill(); }
  x.strokeStyle = '#6E8A4A'; x.lineWidth = 1.2;
  for (let k = 0; k < 110; k++) { const gx = R() * W, gy = 404 + R() * 40; for (let j = 0; j < 3; j++) { x.beginPath(); x.moveTo(gx, gy); x.lineTo(gx + (j - 1) * 2.5, gy - 4 - R() * 4); x.stroke(); } }
  // fichi d'India
  const fico = (fx, fy) => { x.fillStyle = '#5E8C4A'; x.strokeStyle = '#3E6A30'; x.lineWidth = 1; const pads = [[0, 0, 8, 11], [-9, -12, 7, 9], [8, -13, 7, 9], [-2, -24, 6, 8]]; for (const [dx, dy, rx, ry] of pads) { x.beginPath(); x.ellipse(fx + dx, fy + dy, rx, ry, dx / 30, 0, Math.PI * 2); x.fill(); x.stroke(); } x.fillStyle = '#E0603A'; for (const [dx, dy] of [[-12, -21], [11, -22], [1, -32], [-4, -8]]) { x.beginPath(); x.ellipse(fx + dx, fy + dy, 2, 2.6, 0, 0, Math.PI * 2); x.fill(); } };
  fico(W * 0.33, 446); fico(W * 0.69, 448);
  // albero di limoni
  const lemon = (lx, ly) => { x.fillStyle = '#6B5136'; x.fillRect(lx - 2.5, ly - 26, 5, 26); x.fillStyle = '#3F7A3A'; for (let k = 0; k < 7; k++) { x.beginPath(); x.arc(lx + (R() - 0.5) * 26, ly - 32 - R() * 16, 9 + R() * 4, 0, Math.PI * 2); x.fill(); } x.fillStyle = '#F2D23C'; for (let k = 0; k < 9; k++) { x.beginPath(); x.ellipse(lx + (R() - 0.5) * 28, ly - 28 - R() * 22, 2.2, 3, 0.4, 0, Math.PI * 2); x.fill(); } };
  lemon(W * 0.42, 448); lemon(W * 0.6, 450);
  // l'Ape a tre ruote parcheggiata, con le cassette di peperoncini
  const ape = (axp, ayp) => { x.fillStyle = '#2A2A2A'; x.beginPath(); x.arc(axp + 6, ayp, 4.5, 0, Math.PI * 2); x.arc(axp + 34, ayp, 4.5, 0, Math.PI * 2); x.fill(); x.fillStyle = '#3E8FC9'; x.beginPath(); x.moveTo(axp, ayp - 4); x.lineTo(axp, ayp - 22); x.quadraticCurveTo(axp + 2, ayp - 26, axp + 10, ayp - 26); x.lineTo(axp + 14, ayp - 26); x.lineTo(axp + 14, ayp - 4); x.closePath(); x.fill(); x.fillStyle = '#BFE3F6'; x.fillRect(axp + 2, ayp - 22, 10, 7); x.fillStyle = '#3E8FC9'; x.fillRect(axp + 14, ayp - 13, 28, 9); x.fillStyle = '#B88A52'; x.fillRect(axp + 16, ayp - 20, 11, 7); x.fillRect(axp + 28, ayp - 20, 11, 7); x.fillStyle = '#D8261E'; for (let k = 0; k < 8; k++) { x.beginPath(); x.arc(axp + 18 + (k % 4) * 6.5 + (k > 3 ? 1 : 0), ayp - 21 - (k > 3 ? 2 : 0), 1.8, 0, Math.PI * 2); x.fill(); } };
  ape(W * 0.47, 470);
  // un cane che dorme all'ombra
  x.fillStyle = '#C89A62'; x.beginPath(); x.ellipse(W * 0.565, 468, 11, 5, 0, 0, Math.PI * 2); x.fill(); x.beginPath(); x.arc(W * 0.565 + 10, 465, 4.5, 0, Math.PI * 2); x.fill(); x.fillStyle = '#8A5A2E'; x.beginPath(); x.ellipse(W * 0.565 + 12, 462, 2, 3, 0.5, 0, Math.PI * 2); x.fill();
  x.fillStyle = '#4A3A2A'; x.font = 'italic 8px sans-serif'; x.fillText('z z', W * 0.565 + 14, 455);
  // muretti a secco di confine
  const muro = (mx, n) => { for (let k = 0; k < n; k++) { x.fillStyle = ['#BDB2A0', '#A89C88', '#CFC5B4'][k % 3]; x.beginPath(); x.ellipse(mx + k * 7.5, 478 - (k % 2) * 3, 5, 3.5, 0, 0, Math.PI * 2); x.fill(); x.strokeStyle = 'rgba(0,0,0,0.25)'; x.lineWidth = 0.6; x.stroke(); } };
  muro(W * 0.27, 12); muro(W * 0.7, 12);
  if (tod !== 'giorno') {
    x.fillStyle = tod === 'sera' ? 'rgba(12,20,60,0.42)' : 'rgba(255,110,60,0.13)'; x.fillRect(0, 250, W, CA_H);
    if (tod === 'sera') {
      // finestre accese nei paesini e lampioni
      const R2 = caRand(11);
      for (const [vx, vy, n] of [[30, 300, 7], [W * 0.62, 318, 6], [W - 150, 302, 8]]) for (let k = 0; k < n; k++) if (R2() < 0.7) { x.fillStyle = '#FFD56A'; x.fillRect(vx + k * 14 + 3, vy - 10 - R2() * 6, 2.5, 3); }
      for (const lx of [W * 0.38, W * 0.5, W * 0.62]) { x.strokeStyle = '#2A2A2A'; x.lineWidth = 2; x.beginPath(); x.moveTo(lx, 452); x.lineTo(lx, 410); x.lineTo(lx + 8, 410); x.stroke(); const lg = x.createRadialGradient(lx + 8, 413, 1, lx + 8, 430, 40); lg.addColorStop(0, 'rgba(255,220,130,0.55)'); lg.addColorStop(1, 'rgba(255,220,130,0)'); x.fillStyle = lg; x.beginPath(); x.arc(lx + 8, 430, 40, 0, Math.PI * 2); x.fill(); x.fillStyle = '#FFE7A0'; x.beginPath(); x.arc(lx + 8, 413, 2.5, 0, Math.PI * 2); x.fill(); }
    }
  }
  return c;
}
/* il panorama di ogni paese, in lontananza tra le due case */
function caScene(x, scene, R, W) {
  const M0 = W * 0.5;
  if (scene === 'mare') {
    // Bovalino: spiaggia col lungomare, palme e ombrelloni
    x.fillStyle = '#EAD7A6'; x.beginPath(); x.moveTo(0, 372); x.bezierCurveTo(W * 0.3, 362, W * 0.7, 368, W, 360); x.lineTo(W, 392); x.lineTo(0, 392); x.closePath(); x.fill();
    x.fillStyle = 'rgba(255,255,255,0.6)'; x.fillRect(0, 368, W, 1.5);
    for (let k = 0; k < 14; k++) { const ux = 120 + k * 72 + R() * 20, cols = [['#E2312A', '#FFFFFF'], ['#2A8FD6', '#FFFFFF'], ['#F2C94C', '#2E7D32']][k % 3]; x.strokeStyle = '#6B5136'; x.lineWidth = 1; x.beginPath(); x.moveTo(ux, 386); x.lineTo(ux, 372); x.stroke(); for (let j = 0; j < 4; j++) { x.fillStyle = cols[j % 2]; x.beginPath(); x.moveTo(ux, 368); x.arc(ux, 372, 8, Math.PI + j * Math.PI / 4, Math.PI + (j + 1) * Math.PI / 4); x.closePath(); x.fill(); } }
    for (let k = 0; k < 9; k++) { const px = 80 + k * 130, py = 392; x.strokeStyle = '#7A5A3A'; x.lineWidth = 2.4; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + 4, py - 18, px + 2, py - 34); x.stroke(); x.strokeStyle = '#3E7A3A'; x.lineWidth = 2; for (let j = 0; j < 6; j++) { const a = j * Math.PI / 3 + 0.3; x.beginPath(); x.moveTo(px + 2, py - 34); x.quadraticCurveTo(px + 2 + Math.cos(a) * 8, py - 40, px + 2 + Math.cos(a) * 13, py - 32 + Math.abs(Math.sin(a)) * 4); x.stroke(); } }
    for (let k = 0; k < 4; k++) { const bx = 200 + k * 230; x.fillStyle = ['#2A8FD6', '#E2312A', '#FFFFFF', '#2E7D32'][k]; x.beginPath(); x.moveTo(bx, 384); x.lineTo(bx + 22, 384); x.lineTo(bx + 18, 390); x.lineTo(bx + 4, 390); x.closePath(); x.fill(); }
  }
  if (scene === 'corso') {
    // Siderno: le palazzine del corso, colorate, con i balconi e la torre dell'orologio
    for (let k = 0; k < 9; k++) { const bx = M0 - 290 + k * 64, bh = 50 + (k * 37) % 40, col = ['#F2D08A', '#F2B8A8', '#E8E2D0', '#BFD8E8', '#F6E2B8'][k % 5]; x.fillStyle = col; x.fillRect(bx, 400 - bh, 56, bh); x.fillStyle = 'rgba(0,0,0,0.12)'; x.fillRect(bx + 50, 400 - bh, 6, bh); for (let f = 0; f < Math.floor(bh / 16); f++) for (let w = 0; w < 3; w++) { const wx = bx + 6 + w * 17, wy = 400 - bh + 6 + f * 16; x.fillStyle = '#3E6A4A'; x.fillRect(wx, wy, 9, 9); x.fillStyle = '#5A3E2A'; x.fillRect(wx + 3.5, wy, 2, 9); } x.fillStyle = '#9A9A9A'; for (let f = 1; f < Math.floor(bh / 16); f++) x.fillRect(bx - 2, 400 - bh + f * 16, 60, 1.6); }
    x.fillStyle = '#E8D7B5'; x.fillRect(M0 - 8, 300, 16, 100); x.fillStyle = '#B5562E'; x.beginPath(); x.moveTo(M0 - 11, 300); x.lineTo(M0, 284); x.lineTo(M0 + 11, 300); x.fill();
    x.fillStyle = '#FFFFFF'; x.beginPath(); x.arc(M0, 312, 5.5, 0, Math.PI * 2); x.fill(); x.strokeStyle = '#1A1A1A'; x.lineWidth = 1; x.stroke(); x.beginPath(); x.moveTo(M0, 312); x.lineTo(M0, 308.5); x.moveTo(M0, 312); x.lineTo(M0 + 3, 313); x.stroke();
  }
  if (scene === 'scavi') {
    // Locri: il tempio greco con le colonne, alcune spezzate
    const tx = M0 - 90;
    x.fillStyle = '#D9CBA8'; x.fillRect(tx - 10, 392, 200, 8); x.fillRect(tx - 4, 386, 188, 6);
    for (let k = 0; k < 8; k++) { const cx = tx + 6 + k * 24, ch = [52, 52, 30, 52, 18, 52, 40, 52][k]; x.fillStyle = '#E8DCC0'; x.fillRect(cx, 386 - ch, 11, ch); x.fillStyle = 'rgba(120,100,70,0.25)'; for (let j = 0; j < 3; j++) x.fillRect(cx + 2 + j * 3.3, 386 - ch, 1, ch); if (ch === 52) { x.fillStyle = '#DCCFB0'; x.fillRect(cx - 2, 386 - ch - 4, 15, 4); } else { x.fillStyle = '#CDBF9E'; x.beginPath(); x.moveTo(cx, 386 - ch); x.lineTo(cx + 5, 386 - ch - 4); x.lineTo(cx + 11, 386 - ch + 1); x.closePath(); x.fill(); } }
    x.fillStyle = '#DCCFB0'; x.fillRect(tx + 2, 326, 76, 6); x.beginPath(); x.moveTo(tx + 2, 326); x.lineTo(tx + 40, 312); x.lineTo(tx + 78, 326); x.closePath(); x.fill();
    for (let k = 0; k < 5; k++) { x.fillStyle = '#D9CBA8'; x.beginPath(); x.ellipse(tx + 210 + k * 18 + R() * 8, 396, 7, 4, 0, 0, Math.PI * 2); x.fill(); x.strokeStyle = 'rgba(120,100,70,0.4)'; x.lineWidth = 0.6; x.stroke(); }
    x.fillStyle = '#5A4A3A'; x.font = 'italic 9px serif'; x.textAlign = 'center'; x.fillText('ΛΟΚΡΟΙ', tx + 90, 408);
  }
  if (scene === 'borgo') {
    // Gerace: la rupe col borgo, la cattedrale e il castello, con la nebbia
    x.fillStyle = '#8A8F7A'; x.beginPath(); x.moveTo(M0 - 260, 400); x.bezierCurveTo(M0 - 200, 300, M0 - 120, 250, M0, 248); x.bezierCurveTo(M0 + 120, 250, M0 + 200, 300, M0 + 260, 400); x.closePath(); x.fill();
    x.fillStyle = '#9A8F78'; x.fillRect(M0 - 160, 252, 320, 8);
    for (let k = 0; k < 18; k++) { const hx = M0 - 150 + k * 17, hh = 12 + R() * 14; x.fillStyle = ['#CDBFA2', '#BFB094', '#D9CCB0'][k % 3]; x.fillRect(hx, 252 - hh, 14, hh); x.fillStyle = '#9A5A3A'; x.beginPath(); x.moveTo(hx - 1, 252 - hh); x.lineTo(hx + 7, 252 - hh - 5); x.lineTo(hx + 15, 252 - hh); x.fill(); x.fillStyle = 'rgba(40,30,20,0.6)'; x.fillRect(hx + 5, 252 - hh + 4, 3, 4); }
    x.fillStyle = '#C9BCA0'; x.fillRect(M0 - 30, 205, 60, 40); x.beginPath(); x.moveTo(M0 - 32, 205); x.lineTo(M0, 188); x.lineTo(M0 + 32, 205); x.fill(); x.fillRect(M0 + 20, 180, 14, 40); x.fillStyle = '#8A5A3A'; x.beginPath(); x.moveTo(M0 + 18, 180); x.lineTo(M0 + 27, 168); x.lineTo(M0 + 36, 180); x.fill(); x.fillStyle = '#3A2A1E'; x.beginPath(); x.arc(M0, 228, 6, Math.PI, 0); x.fill(); x.fillRect(M0 - 6, 228, 12, 17);
    x.fillStyle = '#ADA48C'; x.fillRect(M0 + 110, 222, 46, 30); for (let k = 0; k < 6; k++) x.fillRect(M0 + 110 + k * 8.4, 216, 5, 7); x.fillRect(M0 + 146, 200, 16, 52); for (let k = 0; k < 3; k++) x.fillRect(M0 + 146 + k * 5.6, 194, 3.6, 6);
    x.fillStyle = 'rgba(240,240,245,0.38)'; for (let k = 0; k < 6; k++) { x.beginPath(); x.ellipse(M0 - 260 + k * 110 + R() * 40, 300 + R() * 30, 90, 10, 0, 0, Math.PI * 2); x.fill(); }
  }
  if (scene === 'rupe') {
    // Tropea: lo scoglio col santuario in mezzo al mare e il paese sulla rupe
    x.fillStyle = '#B79F7A'; x.beginPath(); x.moveTo(M0 - 50, 330); x.lineTo(M0 - 40, 276); x.quadraticCurveTo(M0, 258, M0 + 38, 274); x.lineTo(M0 + 52, 330); x.closePath(); x.fill();
    x.fillStyle = '#9C8462'; x.beginPath(); x.moveTo(M0 + 10, 330); x.lineTo(M0 + 20, 285); x.lineTo(M0 + 52, 330); x.closePath(); x.fill();
    x.fillStyle = '#5E8C4A'; x.beginPath(); x.ellipse(M0 - 20, 270, 22, 6, 0, Math.PI, 0); x.fill();
    x.fillStyle = '#F2EEE4'; x.fillRect(M0 - 14, 246, 30, 20); x.beginPath(); x.moveTo(M0 - 16, 246); x.lineTo(M0 + 1, 234); x.lineTo(M0 + 18, 246); x.fill(); x.fillRect(M0 + 12, 232, 9, 20); x.fillStyle = '#C46A3A'; x.beginPath(); x.moveTo(M0 + 11, 232); x.lineTo(M0 + 16.5, 222); x.lineTo(M0 + 22, 232); x.fill(); x.fillStyle = '#3A2A1E'; x.beginPath(); x.arc(M0 + 1, 260, 3.5, Math.PI, 0); x.fill(); x.fillRect(M0 - 2.5, 260, 7, 6);
    x.strokeStyle = '#E8DCC0'; x.lineWidth = 1.2; for (let k = 0; k < 8; k++) { x.beginPath(); x.moveTo(M0 - 34 + k * 3, 300 - k * 4); x.lineTo(M0 - 28 + k * 3, 300 - k * 4); x.stroke(); }
    for (const side of [-1, 1]) { const cx0 = side < 0 ? M0 - 330 : M0 + 160; x.fillStyle = '#C2A57C'; x.beginPath(); x.moveTo(cx0, 400); x.lineTo(cx0 + 6, 300); x.lineTo(cx0 + 164, 296); x.lineTo(cx0 + 170, 400); x.closePath(); x.fill(); for (let k = 0; k < 11; k++) { const hx = cx0 + 6 + k * 15, hh = 10 + R() * 12; x.fillStyle = ['#F2D08A', '#F2B8A8', '#FFFFFF', '#E9C9A0'][k % 4]; x.fillRect(hx, 298 - hh, 13, hh); x.fillStyle = 'rgba(60,40,30,0.5)'; x.fillRect(hx + 4, 298 - hh + 3, 2.5, 3); } }
  }
}
/* la gente del paese sulla strada: fa il tifo quando cade un muro */
function caCrowd(x, t, cheer) {
  const W = CA_W, j = (k) => (cheer ? Math.abs(Math.sin(t * 0.25 + k)) * 6 : 0);
  // la nonna sulla sedia con il ventaglio
  const nx = W * 0.445, ny = 474;
  x.fillStyle = '#7A5230'; x.fillRect(nx - 7, ny - 12, 14, 2); x.fillRect(nx - 7, ny - 12, 2, 12); x.fillRect(nx + 5, ny - 12, 2, 12); x.fillRect(nx + 5, ny - 26, 2, 14);
  x.fillStyle = '#1F1F2A'; x.beginPath(); x.ellipse(nx, ny - 16, 7, 9, 0, 0, Math.PI * 2); x.fill();
  x.fillStyle = '#E2B48C'; x.beginPath(); x.arc(nx, ny - 28, 4.5, 0, Math.PI * 2); x.fill();
  x.fillStyle = '#2A2A2A'; x.beginPath(); x.arc(nx, ny - 30, 5, Math.PI, 0); x.fill(); x.fillRect(nx - 5, ny - 30, 2, 6);
  x.save(); x.translate(nx - 8, ny - 20); x.rotate(Math.sin(t * (cheer ? 0.5 : 0.12)) * 0.5); x.fillStyle = '#C8102E'; x.beginPath(); x.moveTo(0, 0); x.arc(0, 0, 7, -2.4, -0.7); x.closePath(); x.fill(); x.restore();
  // due bambini
  for (const [k, kx, col] of [[0, W * 0.515, '#2A8FD6'], [1, W * 0.532, '#E2B53A']]) {
    const ky = 474 - j(k);
    x.fillStyle = '#3A3530'; x.fillRect(kx - 3, ky - 8, 2.4, 8); x.fillRect(kx + 0.6, ky - 8, 2.4, 8);
    x.fillStyle = col; x.fillRect(kx - 4, ky - 17, 8, 9);
    x.strokeStyle = col; x.lineWidth = 2; x.beginPath(); x.moveTo(kx - 3, ky - 15); x.lineTo(kx - 6, cheer ? ky - 24 : ky - 10); x.moveTo(kx + 3, ky - 15); x.lineTo(kx + 6, cheer ? ky - 24 : ky - 10); x.stroke();
    x.fillStyle = '#E2B48C'; x.beginPath(); x.arc(kx, ky - 21, 4, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#3A2414'; x.beginPath(); x.arc(kx, ky - 22.5, 4, Math.PI, 0); x.fill();
  }
  // il prete con la tonaca che scuote la testa
  const px = W * 0.585, py = 474;
  x.fillStyle = '#141414'; x.beginPath(); x.moveTo(px - 6, py); x.lineTo(px - 4, py - 22); x.lineTo(px + 4, py - 22); x.lineTo(px + 6, py); x.closePath(); x.fill();
  x.fillStyle = '#FFFFFF'; x.fillRect(px - 1.5, py - 22, 3, 2);
  x.fillStyle = '#E0B48A'; x.beginPath(); x.arc(px + (cheer ? Math.sin(t * 0.4) * 1.5 : 0), py - 27, 4.4, 0, Math.PI * 2); x.fill();
  x.fillStyle = '#141414'; x.beginPath(); x.ellipse(px, py - 31, 7, 1.8, 0, 0, Math.PI * 2); x.fill(); x.beginPath(); x.arc(px, py - 31.5, 3.8, Math.PI, 0); x.fill();
  if (cheer) { x.fillStyle = '#fff'; x.font = 'bold 8px sans-serif'; x.textAlign = 'center'; x.fillText('Gesù!', px, py - 38); }
}
/* betoniera, carriola, pila di mattoni: vicino alle case */
function caProps(x, t, flip) {
  x.save();
  // pila di mattoni
  const bx = flip ? CA_X0[1] - 30 : CA_X0[0] + CA_COLS * CA_CW + 8;
  for (let r = 0; r < 4; r++) for (let k = 0; k < 3 - (r > 2 ? 1 : 0); k++) { x.fillStyle = (r + k) % 2 ? '#C1543A' : '#B24A32'; x.fillRect(bx + k * 7 + (r % 2) * 3, CA_GY - 5 - r * 4, 7, 4); x.strokeStyle = 'rgba(60,20,10,0.5)'; x.lineWidth = 0.5; x.strokeRect(bx + k * 7 + (r % 2) * 3, CA_GY - 5 - r * 4, 7, 4); }
  x.restore();
}
function caBetoniera(x, cx, cy, t) {
  x.save(); x.translate(cx, cy);
  x.fillStyle = '#3A3A3A'; x.beginPath(); x.arc(-10, 0, 4, 0, Math.PI * 2); x.arc(10, 0, 4, 0, Math.PI * 2); x.fill();
  x.strokeStyle = '#E86F1C'; x.lineWidth = 2.4; x.beginPath(); x.moveTo(-14, -3); x.lineTo(14, -3); x.moveTo(0, -3); x.lineTo(0, -12); x.stroke();
  x.translate(0, -18); x.rotate(-0.45);
  x.fillStyle = '#F08A24'; x.beginPath(); x.moveTo(-12, -7); x.lineTo(8, -10); x.lineTo(13, -4); x.lineTo(13, 4); x.lineTo(8, 10); x.lineTo(-12, 7); x.closePath(); x.fill();
  x.strokeStyle = '#B85A10'; x.lineWidth = 1;
  for (let k = 0; k < 4; k++) { const o = ((t * 0.08 + k * 5) % 20) - 10; x.beginPath(); x.moveTo(o - 2, -8); x.lineTo(o + 2, 8); x.stroke(); }
  x.fillStyle = '#5A5A5A'; x.beginPath(); x.ellipse(13, 0, 2.5, 4, 0, 0, Math.PI * 2); x.fill();
  x.restore();
}
function caFlag(x, px, py, wind, t) {
  x.strokeStyle = '#4A3A2A'; x.lineWidth = 2; x.beginPath(); x.moveTo(px, py); x.lineTo(px, py - 46); x.stroke();
  const L = 8 + Math.abs(wind) * 6, d = wind >= 0 ? 1 : -1;
  x.fillStyle = '#E23B2E';
  x.beginPath(); x.moveTo(px, py - 46);
  for (let k = 0; k <= 6; k++) { const xx = px + d * L * k / 6, yy = py - 46 + Math.sin(t * 0.15 + k) * (1.5 + (3 - Math.abs(wind)) * 0.8) + (3 - Math.abs(wind)) * k * 0.9; x.lineTo(xx, yy); }
  for (let k = 6; k >= 0; k--) { const xx = px + d * L * k / 6, yy = py - 36 + Math.sin(t * 0.15 + k + 1) * (1.5 + (3 - Math.abs(wind)) * 0.8) + (3 - Math.abs(wind)) * k * 0.9; x.lineTo(xx, yy); }
  x.closePath(); x.fill();
  x.fillStyle = '#FFFFFF'; x.font = 'bold 9px sans-serif'; x.textAlign = 'center'; x.fillText((wind > 0 ? '→ ' : wind < 0 ? '← ' : '') + Math.abs(wind).toFixed(1), px, py - 52);
}

/* ---------- la casa disegnata ---------- */
function caDrawHouse(x, q, g, fallAnim, decor, hurt, style, hasTank) {
  style = style || 'rustico'; if (hasTank === undefined) hasTank = true;
  const x0 = CA_X0[q], HW = CA_COLS * CA_CW, top = caFloors(g), t = CA.t || 0;
  const cellY = (c, r) => { let yy = CA_GY - (r + 1) * CA_CH; if (fallAnim) { const m = fallAnim.get(q + ':' + c + ':' + r); if (m) yy -= m * CA_CH; } return yy; };
  // impalcatura di tubi con le tavole, dietro la casa
  if (top) {
    const sh = CA_GY - top * CA_CH - 10;
    x.strokeStyle = '#8E949A'; x.lineWidth = 1.8;
    for (const sx of [x0 - 9, x0 + HW + 9]) { x.beginPath(); x.moveTo(sx, CA_GY); x.lineTo(sx, sh); x.stroke(); x.beginPath(); x.moveTo(sx - 4, CA_GY); x.lineTo(sx - 4, sh + 6); x.stroke(); }
    for (let r = 2; r <= top; r += 2) { const yy = CA_GY - r * CA_CH + 2; for (const [sx, d] of [[x0 - 13, 1], [x0 + HW + 5, 1]]) { x.fillStyle = '#B08A55'; x.fillRect(sx, yy, 8, 2.5); x.strokeStyle = 'rgba(80,90,100,0.7)'; x.lineWidth = 1; x.beginPath(); x.moveTo(sx, yy + 2); x.lineTo(sx + 8 * d, yy + CA_CH * 2 - 2); x.stroke(); } }
  }
  // le celle (mattoni, pilastri, finestre): disegnate una volta su un'immagine di appoggio e riusate finché la casa non cambia
  const drawCells = (x) => {
  // le celle
  for (let r = 0; r < CA_MAXR; r++) for (let c = 0; c < CA_COLS; c++) {
    const v = g[r * CA_COLS + c]; if (!v) continue;
    const yy = cellY(c, r), xx = x0 + c * CA_CW, tp = Math.floor(v / 10), hp = v % 10;
    const plaster = (style === 'intonaco' && r < 4) || style === 'pastello';
    const pcol = style === 'pastello' ? (q === 0 ? '#F2C08A' : '#F2B8A8') : '#EBC66A';
    if (tp === 2 && plaster) {
      x.fillStyle = pcol; x.fillRect(xx, yy, CA_CW, CA_CH); x.fillStyle = 'rgba(255,255,255,0.25)'; x.fillRect(xx, yy, 3, CA_CH); x.fillStyle = 'rgba(0,0,0,0.1)'; x.fillRect(xx + CA_CW - 3, yy, 3, CA_CH);
      if (hp === 1) { x.strokeStyle = '#6A5A3A'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(xx + 6, yy + 2); x.lineTo(xx + 14, yy + 11); x.lineTo(xx + 10, yy + 20); x.stroke(); }
    } else if (tp === 2) {
      // pilastro: cemento con i segni delle tavole del cassero (più scuro e con le fasce di ferro se rinforzato, di pietra a Gerace)
      const pc = style === 'rinforzato' ? ['#A9A497', '#9A9488', '#7E786C'] : style === 'pietra' ? ['#C2B69C', '#B0A48A', '#968A72'] : ['#CFCAC0', '#BDB7AC', '#9E988D'];
      const gr = x.createLinearGradient(xx, 0, xx + CA_CW, 0); gr.addColorStop(0, pc[0]); gr.addColorStop(0.55, pc[1]); gr.addColorStop(1, pc[2]);
      x.fillStyle = gr; x.fillRect(xx, yy, CA_CW, CA_CH);
      x.strokeStyle = 'rgba(110,100,85,0.35)'; x.lineWidth = 0.7;
      for (let k = 4; k < CA_CH; k += 4.5) { x.beginPath(); x.moveTo(xx + 1, yy + k); x.lineTo(xx + CA_CW - 1, yy + k); x.stroke(); }
      const R = caRand(r * 31 + c * 7 + q * 101); x.fillStyle = 'rgba(90,85,75,0.35)'; for (let k = 0; k < 6; k++) x.fillRect(xx + 2 + R() * (CA_CW - 4), yy + 2 + R() * (CA_CH - 4), 1.3, 1.3);
      if (style === 'rinforzato') { x.fillStyle = '#4A4A50'; x.fillRect(xx, yy + 5, CA_CW, 2.4); x.fillRect(xx, yy + CA_CH - 7, CA_CW, 2.4); x.fillStyle = '#8A8A90'; for (const bx of [4, CA_CW - 6]) { x.beginPath(); x.arc(xx + bx, yy + 6.2, 1, 0, Math.PI * 2); x.arc(xx + bx, yy + CA_CH - 5.8, 1, 0, Math.PI * 2); x.fill(); } if (hp === 2) { x.strokeStyle = '#3A3530'; x.lineWidth = 0.9; x.beginPath(); x.moveTo(xx + 8, yy + 9); x.lineTo(xx + 14, yy + 14); x.stroke(); } }
      if (hp === 1) {
        x.strokeStyle = '#3A3530'; x.lineWidth = 1.3; x.beginPath(); x.moveTo(xx + 6, yy + 1); x.lineTo(xx + 13, yy + 9); x.lineTo(xx + 10, yy + 13); x.lineTo(xx + 19, yy + 21); x.stroke();
        x.fillStyle = '#6E6A62'; x.beginPath(); x.moveTo(xx + 17, yy + 4); x.lineTo(xx + 26, yy + 3); x.lineTo(xx + 25, yy + 12); x.lineTo(xx + 18, yy + 10); x.closePath(); x.fill();
        x.strokeStyle = '#8B4A2A'; x.lineWidth = 1.4; x.beginPath(); x.moveTo(xx + 20, yy + 2); x.lineTo(xx + 20, yy + 12); x.moveTo(xx + 24, yy + 2); x.lineTo(xx + 24, yy + 12); x.stroke();
      }
    } else if (tp === 5) {
      // muro di pietra (Gerace): conci irregolari, crepato se colpito una volta
      x.fillStyle = '#7A6E5A'; x.fillRect(xx, yy, CA_CW, CA_CH);
      const RS = caRand(r * 17 + c * 5 + q * 71); let sy0 = yy + 3;
      while (sy0 < yy + CA_CH - 1) { const sh = 5 + RS() * 3, rowH = Math.min(sh, yy + CA_CH - sy0); let sx0 = xx + (RS() - 0.5) * 6; while (sx0 < xx + CA_CW) { const sw = 8 + RS() * 9, l = Math.max(xx + 0.5, sx0 + 0.6), rg = Math.min(xx + CA_CW - 0.5, sx0 + sw - 0.6); if (rg - l > 1) { x.fillStyle = ['#C9BFA8', '#B9AE98', '#A79C86', '#D3C9B2'][Math.floor(RS() * 4)]; x.fillRect(l, sy0 + 0.6, rg - l, rowH - 1.2); x.fillStyle = 'rgba(255,255,255,0.18)'; x.fillRect(l, sy0 + 0.6, rg - l, 1); } sx0 += sw; } sy0 += sh; }
      if (hp === 1) { x.strokeStyle = '#3A3026'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(xx + 4, yy + 4); x.lineTo(xx + 12, yy + 12); x.lineTo(xx + 9, yy + 17); x.lineTo(xx + 20, yy + 23); x.stroke(); }
    } else if (plaster && tp === 1) {
      // facciata intonacata (Siderno in basso, Tropea tutta color pastello)
      x.fillStyle = pcol; x.fillRect(xx, yy, CA_CW, CA_CH);
      const RS = caRand(r * 13 + c * 3 + q * 57); x.fillStyle = 'rgba(120,90,50,0.12)'; for (let k = 0; k < 6; k++) x.fillRect(xx + RS() * CA_CW, yy + 3 + RS() * (CA_CH - 4), 2, 1);
    } else {
      // tamponatura in mattoni forati arancioni
      x.fillStyle = '#C9B394'; x.fillRect(xx, yy, CA_CW, CA_CH);
      const bh = (CA_CH - 3) / 3, bwd = CA_CW / 2;
      for (let row = 0; row < 3; row++) {
        const off = row % 2 ? -bwd / 2 : 0;
        for (let k = 0; k < 3; k++) {
          const bx = xx + off + k * bwd + 0.7, by = yy + 3 + row * bh + 0.6;
          const l = Math.max(xx + 0.4, bx), rg = Math.min(xx + CA_CW - 0.4, bx + bwd - 1.4); if (rg - l < 1) continue;
          const sd = (r * 13 + c * 7 + row * 5 + k * 3 + q * 11) % 7;
          x.fillStyle = ['#D46A3E', '#C95E36', '#DB7748', '#CF6439', '#C2552F', '#D97046', '#CC6239'][sd];
          x.fillRect(l, by, rg - l, bh - 1.3);
          x.fillStyle = 'rgba(255,205,160,0.35)'; x.fillRect(l, by, rg - l, 0.9);
          x.fillStyle = 'rgba(110,35,15,0.28)'; x.fillRect(l, by + (bh - 1.3) * 0.45, rg - l, 0.7); x.fillRect(l, by + bh - 2.1, rg - l, 0.8);
        }
      }
    }
    if (tp === 3 || tp === 4) {
      if (plaster) { x.fillStyle = pcol; x.fillRect(xx, yy, CA_CW, CA_CH); }
      if (style === 'pietra') { x.fillStyle = '#B9AE98'; x.fillRect(xx, yy, CA_CW, CA_CH); }
      {
        const wx = xx + 6, ww = CA_CW - 12, wy = yy + (tp === 4 ? 4 : 6), wh = tp === 4 ? CA_CH - 4 : CA_CH - 10;
        const ig = x.createLinearGradient(0, wy, 0, wy + wh); ig.addColorStop(0, '#1C1612'); ig.addColorStop(1, '#3A2E24'); x.fillStyle = ig; x.fillRect(wx, wy, ww, wh);
        x.fillStyle = 'rgba(0,0,0,0.3)'; x.fillRect(wx, wy, 2.5, wh);
        x.fillStyle = '#B9B3A7'; x.fillRect(wx - 2, wy - 2.5, ww + 4, 2.5);
        if (tp === 3) { x.fillStyle = '#D7D2C6'; x.fillRect(wx - 3, wy + wh, ww + 6, 2.4); x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(wx - 3, wy + wh + 2.4, ww + 6, 1); }
        if (tp === 3 && style === 'pietra') { x.fillStyle = '#B9AE98'; x.beginPath(); x.moveTo(wx - 1, wy - 3); x.lineTo(wx - 1, wy + 3); x.quadraticCurveTo(wx + ww / 2, wy - 5, wx + ww + 1, wy + 3); x.lineTo(wx + ww + 1, wy - 3); x.closePath(); x.fill(); }
        if (tp === 3 && plaster) { x.fillStyle = '#3E7A4A'; x.fillRect(wx - 6, wy - 1, 5, wh + 1); x.fillRect(wx + ww + 1, wy - 1, 5, wh + 1); x.fillStyle = 'rgba(0,0,0,0.25)'; for (let k = 1; k < wh; k += 2.5) { x.fillRect(wx - 6, wy + k, 5, 0.7); x.fillRect(wx + ww + 1, wy + k, 5, 0.7); } }
        if (tp === 3 && style === 'pastello') { x.strokeStyle = '#2A2A2A'; x.lineWidth = 0.8; x.beginPath(); x.moveTo(wx - 4, wy + wh - 4); x.lineTo(wx + ww + 4, wy + wh - 4); for (let k = 0; k <= 5; k++) { x.moveTo(wx - 4 + k * (ww + 8) / 5, wy + wh - 4); x.lineTo(wx - 4 + k * (ww + 8) / 5, wy + wh + 2); } x.stroke(); x.fillStyle = '#C8502E'; x.fillRect(wx + ww - 3, wy + wh - 8, 4, 4); x.fillStyle = '#E2312A'; for (const [fx2, fy2] of [[0, -1], [2, -2], [3.5, -0.5]]) { x.beginPath(); x.arc(wx + ww - 3 + fx2, wy + wh - 9 + fy2, 1.3, 0, Math.PI * 2); x.fill(); } }
        if (tp === 4) { x.fillStyle = '#9A7448'; for (let k = 0; k < 3; k++) x.fillRect(wx + 0.5, wy + 2 + k * 6, ww - 1, 4); x.strokeStyle = '#5A3E22'; x.lineWidth = 0.8; x.beginPath(); x.moveTo(wx + 1, wy + 3); x.lineTo(wx + ww - 1, wy + wh - 2); x.stroke(); x.fillStyle = '#333'; x.beginPath(); x.arc(wx + ww - 3, wy + wh / 2, 0.9, 0, Math.PI * 2); x.fill(); }
      }
    }
    // trave di cemento sopra ogni fila (il telaio), con l'ombra sotto
    x.fillStyle = '#B8B2A6'; x.fillRect(xx, yy, CA_CW, 3); x.fillStyle = 'rgba(0,0,0,0.18)'; x.fillRect(xx, yy + 3, CA_CW, 1.2);
  }
  // solai che sporgono ai lati, ogni due file
  for (let r = 2; r <= top; r += 2) {
    for (const c of [0, CA_COLS - 1]) { if (caColH(g, c) < r) continue; const yy = CA_GY - r * CA_CH, xx = c === 0 ? x0 - 5 : x0 + HW; x.fillStyle = '#C3BDB1'; x.fillRect(xx, yy - 0.5, 5, 4); x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(xx, yy + 3.5, 5, 1); }
  }
  // ferri d'armatura con i tappi rossi sopra i pilastri
  for (const c of CA_PILL) {
    const h = caColH(g, c); if (!h) continue; const xx = x0 + c * CA_CW, yy = CA_GY - h * CA_CH;
    x.strokeStyle = '#6E3E22'; x.lineWidth = 1.5;
    for (const o of [6, 12, 20, 26]) { const lean = (o - 16) * 0.12; x.beginPath(); x.moveTo(xx + o, yy); x.lineTo(xx + o + lean * 6, yy - 15); x.stroke(); x.fillStyle = '#D8261E'; x.beginPath(); x.arc(xx + o + lean * 6, yy - 15.5, 1.8, 0, Math.PI * 2); x.fill(); }
  }
  };
  const still = !(fallAnim && fallAnim.size);
  if (still && typeof document !== 'undefined') {
    const tf = x.getTransform ? x.getTransform() : null, sc = tf ? Math.round(Math.hypot(tf.a, tf.b) * 100) / 100 : 1;
    const key = sc + '|' + style + '|' + g.join(',');
    const C = CA.hc || (CA.hc = {}); let e = C[q];
    const L = x0 - 30, T = CA_GY - CA_MAXR * CA_CH - 40, W = HW + 60, H = CA_MAXR * CA_CH + 50;
    if (!e || e.key !== key) {
      const cv = (e && e.cv) || document.createElement('canvas');
      cv.width = Math.max(1, Math.ceil(W * sc)); cv.height = Math.max(1, Math.ceil(H * sc));
      const cx = cv.getContext('2d'); cx.setTransform(sc, 0, 0, sc, -L * sc, -T * sc); cx.clearRect(L, T, W, H);
      drawCells(cx); e = C[q] = { key, cv };
    }
    x.drawImage(e.cv, L, T, W, H);
  } else drawCells(x);
  // sul tetto: la cisterna blu, l'antenna e il bucato steso tra i ferri
  if (top >= 3 && !(fallAnim && fallAnim.size)) {
    let best = 1; for (const c of [1, 2, 4, 5]) if (caColH(g, c) >= caColH(g, best)) best = c;
    const hc = caColH(g, best), cx = x0 + best * CA_CW + CA_CW / 2, cy = CA_GY - hc * CA_CH;
    if (hc >= 3 && hasTank) {
      x.fillStyle = '#2F6FB5'; x.beginPath(); x.ellipse(cx, cy - 13, 9, 3, 0, 0, Math.PI * 2); x.fill(); x.fillRect(cx - 9, cy - 13, 18, 12);
      const tg = x.createLinearGradient(cx - 9, 0, cx + 9, 0); tg.addColorStop(0, 'rgba(255,255,255,0.25)'); tg.addColorStop(0.4, 'rgba(255,255,255,0)'); tg.addColorStop(1, 'rgba(0,0,0,0.25)'); x.fillStyle = tg; x.fillRect(cx - 9, cy - 13, 18, 12);
      x.fillStyle = '#245C99'; x.beginPath(); x.ellipse(cx, cy - 1, 9, 2.5, 0, 0, Math.PI); x.fill(); x.fillStyle = '#4A8AD0'; x.beginPath(); x.ellipse(cx, cy - 13, 9, 3, 0, 0, Math.PI * 2); x.fill(); x.fillStyle = '#245C99'; x.beginPath(); x.ellipse(cx, cy - 14, 3.5, 1.3, 0, 0, Math.PI * 2); x.fill();
      x.strokeStyle = '#555'; x.lineWidth = 1; x.beginPath(); x.moveTo(cx - 7, cy - 1); x.lineTo(cx - 7, cy + 1); x.moveTo(cx + 7, cy - 1); x.lineTo(cx + 7, cy + 1); x.stroke();
    }
    const h0 = caColH(g, 0), h4 = caColH(g, CA_COLS - 1);
    if (h0 >= 2 && h4 >= 2) {
      const y0 = CA_GY - h0 * CA_CH - 13, y1 = CA_GY - h4 * CA_CH - 13, xa = x0 + 9, xb = x0 + HW - 9;
      x.strokeStyle = 'rgba(60,60,60,0.8)'; x.lineWidth = 0.7; x.beginPath(); x.moveTo(xa, y0); x.quadraticCurveTo((xa + xb) / 2, Math.max(y0, y1) + 7, xb, y1); x.stroke();
      const cl = ['#FFFFFF', '#E2312A', '#2A8FD6', '#F2C94C', '#FFFFFF'];
      for (let k = 0; k < 5; k++) { const u = (k + 1) / 6, px = xa + (xb - xa) * u, py = y0 + (y1 - y0) * u + Math.sin(u * Math.PI) * 6, sw = Math.sin(t * 0.06 + k) * 1.5; x.fillStyle = cl[k]; x.beginPath(); x.moveTo(px - 3, py); x.lineTo(px + 3, py); x.lineTo(px + 3 + sw, py + (k % 2 ? 9 : 6)); x.lineTo(px - 3 + sw, py + (k % 2 ? 9 : 6)); x.closePath(); x.fill(); x.strokeStyle = 'rgba(0,0,0,0.25)'; x.lineWidth = 0.5; x.stroke(); }
    }
  }
  // la sposa alla finestra più alta, col velo
  let bw = null; for (let r = CA_MAXR - 1; r >= 0 && !bw; r--) for (const c of [1, 4, 5]) if (g[r * CA_COLS + c] === 31) { bw = { c, r }; break; }
  if (bw && !(fallAnim && fallAnim.size)) {
    const xx = x0 + bw.c * CA_CW + CA_CW / 2, yy = CA_GY - (bw.r + 1) * CA_CH + 9;
    x.fillStyle = '#FBFAF6'; x.beginPath(); x.moveTo(xx - 5, yy + 9); x.quadraticCurveTo(xx, yy + 1, xx + 5, yy + 9); x.fill();
    x.fillStyle = 'rgba(255,255,255,0.85)'; x.beginPath(); x.moveTo(xx - 3.5, yy - 3); x.quadraticCurveTo(xx - 7, yy + 4, xx - 6, yy + 9); x.lineTo(xx + 6, yy + 9); x.quadraticCurveTo(xx + 7, yy + 4, xx + 3.5, yy - 3); x.closePath(); x.fill();
    x.fillStyle = '#EBC29C'; x.beginPath(); x.arc(xx, yy + 1, 2.8, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#3A2414'; x.beginPath(); x.arc(xx, yy - 0.3, 3, Math.PI * 1.05, Math.PI * 1.95); x.fill();
    x.fillStyle = '#F2C94C'; x.beginPath(); x.arc(xx, yy - 3, 1, 0, Math.PI * 2); x.fill();
    if (hurt) { x.fillStyle = '#E2312A'; x.font = 'bold 9px sans-serif'; x.textAlign = 'center'; x.fillText('!', xx + 8, yy - 2); }
  }
  if (decor && decor.length) caDrawDecor(x, q, g, decor);
}
function caDrawDecor(x, q, g, decor) {
  const x0 = CA_X0[q], xR = x0 + CA_COLS * CA_CW;
  const has = (k) => decor.includes(k);
  if (has('colonne')) { for (const cx of [x0 + 2 * CA_CW - 3, x0 + 3 * CA_CW + 3]) { x.fillStyle = '#F2EEE4'; x.fillRect(cx - 2.5, CA_GY - CA_CH, 5, CA_CH); x.fillStyle = '#D8D2C2'; x.fillRect(cx - 4, CA_GY - CA_CH - 2, 8, 2.5); x.fillRect(cx - 4, CA_GY - 2, 8, 2); } }
  if (has('leoni')) { for (const [lx, s] of [[x0 - 16, 1], [xR + 16, -1]]) { x.fillStyle = '#EDE7DA'; x.fillRect(lx - 6, CA_GY - 8, 12, 8); x.beginPath(); x.ellipse(lx, CA_GY - 12, 6, 4, 0, 0, Math.PI * 2); x.fill(); x.beginPath(); x.arc(lx + s * 5, CA_GY - 16, 4, 0, Math.PI * 2); x.fill(); x.strokeStyle = '#B8B0A0'; x.lineWidth = 0.8; x.stroke(); x.fillStyle = '#B8B0A0'; x.fillRect(lx + s * 5 - 0.5, CA_GY - 17, 1, 1); } }
  if (has('cancello')) { const gx = q === 0 ? x0 - 30 : xR + 6; x.strokeStyle = '#E2B53A'; x.lineWidth = 1.4; for (let k = 0; k < 5; k++) { x.beginPath(); x.moveTo(gx + k * 6, CA_GY); x.lineTo(gx + k * 6, CA_GY - 18 - (k % 2) * 3); x.stroke(); x.fillStyle = '#F2C94C'; x.beginPath(); x.arc(gx + k * 6, CA_GY - 19 - (k % 2) * 3, 1.4, 0, Math.PI * 2); x.fill(); } x.beginPath(); x.moveTo(gx, CA_GY - 9); x.lineTo(gx + 24, CA_GY - 9); x.stroke(); }
  if (has('balcone')) { const r = Math.min(3, caFloors(g) - 1); if (r >= 1) { const yy = CA_GY - r * CA_CH; x.fillStyle = '#A9A396'; x.fillRect(x0 - 8, yy - 2, CA_COLS * CA_CW + 16, 3); x.strokeStyle = '#3A3A3A'; x.lineWidth = 1; x.beginPath(); x.moveTo(x0 - 8, yy - 11); x.lineTo(xR + 8, yy - 11); x.stroke(); for (let k = 0; k <= 17; k++) { x.beginPath(); x.moveTo(x0 - 8 + k * 8, yy - 2); x.lineTo(x0 - 8 + k * 8, yy - 11); x.stroke(); } x.fillStyle = '#C8502E'; x.fillRect(x0 + 4, yy - 7, 5, 5); x.fillStyle = '#3E8A3A'; x.beginPath(); x.arc(x0 + 6.5, yy - 9, 3.5, 0, Math.PI * 2); x.fill(); } }
  if (has('parabola')) { const c = 2, h = caColH(g, c); if (h) { const xx = x0 + c * CA_CW + CA_CW / 2, yy = CA_GY - h * CA_CH; x.strokeStyle = '#555'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(xx, yy); x.lineTo(xx, yy - 8); x.stroke(); x.fillStyle = '#DADADA'; x.beginPath(); x.ellipse(xx - 2, yy - 12, 4, 7, -0.6, 0, Math.PI * 2); x.fill(); x.strokeStyle = '#999'; x.stroke(); } }
}

/* ---------- i compari disegnati ---------- */
function caDrawMan(x, m, look, facing, pose, t) {
  const OL = '#2A1A10';
  x.save(); x.translate(m.x, m.y); x.scale(facing * CA_MS, CA_MS);
  const bob = pose === 'idle' ? Math.sin(t * 0.08) * 0.7 : pose === 'cheer' ? -Math.abs(Math.sin(t * 0.25)) * 3 : 0;
  const lean = pose === 'throw' ? 0.12 : pose === 'aim' ? -0.1 : pose === 'hit' ? -0.15 : 0;
  x.fillStyle = 'rgba(0,0,0,0.28)'; x.beginPath(); x.ellipse(0, 0, 10, 2.4, 0, 0, Math.PI * 2); x.fill();
  const part = (fill, fn) => { x.beginPath(); fn(); x.fillStyle = fill; x.fill(); x.lineWidth = 1.1; x.strokeStyle = OL; x.stroke(); };
  const limb = (col, x1, y1, x2, y2, x3, y3, w) => { x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = OL; x.lineWidth = w + 2; x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.lineTo(x3, y3); x.stroke(); x.strokeStyle = col; x.lineWidth = w; x.stroke(); };
  // gambe e scarpe
  x.translate(0, bob);
  if (look.woman) {
    part('#2A2420', () => x.ellipse(-3, -1.5, 3.4, 1.8, 0, 0, Math.PI * 2)); part('#2A2420', () => x.ellipse(4, -1.5, 3.4, 1.8, 0, 0, Math.PI * 2));
    limb('#E6B994', -2, -9, -2.5, -5, -3, -2.5, 2.6); limb('#E6B994', 3, -9, 3.5, -5, 4, -2.5, 2.6);
  } else {
    const tr = look.helmet ? '#3E5A7A' : look.sash ? '#26262E' : '#4A4038';
    limb(tr, -2.5, -13, -3, -7, -3, -3, 4.4); limb(tr, 3, -13, 3.5, -7, 4, -3, 4.4);
    part('#1E1A16', () => x.ellipse(-1.5, -1.6, 4.4, 2.1, 0, 0, Math.PI * 2)); part('#1E1A16', () => x.ellipse(5.5, -1.6, 4.4, 2.1, 0, 0, Math.PI * 2));
  }
  x.rotate(lean);
  // braccio dietro
  const skin = look.skin, sleeve = look.woman ? look.dress : look.sash ? '#26262E' : look.shirt;
  const back = pose === 'cheer' ? [-5, -28, -10, -36, -12, -44] : pose === 'hit' ? [-5, -28, -11, -32, -14, -38] : [-5, -28, -8, -21, -6, -15];
  limb(sleeve, back[0], back[1], back[2], back[3], back[4], back[5], 4); part(skin, () => x.arc(back[4], back[5], 2.3, 0, Math.PI * 2));
  // corpo
  const bw = 9 * (look.belly || 1);
  if (look.woman) {
    part(look.dress, () => { x.moveTo(-6, -31); x.quadraticCurveTo(-bw - 1, -20, -9, -7); x.lineTo(10, -7); x.quadraticCurveTo(bw + 2, -20, 7, -31); x.closePath(); });
    part('#F4EFE4', () => { x.moveTo(-3, -24); x.lineTo(6, -24); x.lineTo(8, -8); x.lineTo(-5, -8); x.closePath(); });
    x.strokeStyle = '#C9C2B2'; x.lineWidth = 0.6; for (let k = -16; k < -9; k += 3) { x.beginPath(); x.moveTo(-4, k); x.lineTo(7, k); x.stroke(); }
  } else {
    part(look.shirt, () => x.ellipse(1, -21, bw, 11, 0, 0, Math.PI * 2));
    if (look.sash) {
      part('#26262E', () => { x.moveTo(-bw + 1, -27); x.lineTo(-1, -30); x.lineTo(-1, -11); x.quadraticCurveTo(-bw + 1, -12, -bw + 1, -18); x.closePath(); });
      part('#26262E', () => { x.moveTo(4, -30); x.lineTo(bw + 1, -27); x.quadraticCurveTo(bw + 2, -16, 4, -11); x.closePath(); });
      part('#B4221A', () => { x.moveTo(1, -29); x.lineTo(3, -29); x.lineTo(3.4, -19); x.lineTo(2, -17); x.lineTo(0.6, -19); x.closePath(); });
      x.lineCap = 'butt'; for (const [col, o] of [['#2E9A48', 0], ['#FFFFFF', 2.2], ['#D8322E', 4.4]]) { x.strokeStyle = col; x.lineWidth = 2.2; x.beginPath(); x.moveTo(-6 + o, -30); x.lineTo(7 + o, -12); x.stroke(); }
    } else if (look.helmet) {
      part('#3E5A7A', () => { x.moveTo(-5, -27); x.lineTo(7, -27); x.quadraticCurveTo(bw + 1, -16, 6, -10); x.lineTo(-4, -10); x.quadraticCurveTo(-bw, -16, -5, -27); x.closePath(); });
      x.strokeStyle = '#2E4660'; x.lineWidth = 1.6; x.beginPath(); x.moveTo(-4, -27); x.lineTo(-4, -31); x.moveTo(6, -27); x.lineTo(6, -31); x.stroke();
      part('#F2C200', () => x.rect(-1, -24, 4, 4));
    } else {
      part(look.vest, () => { x.moveTo(-bw + 1.5, -27); x.lineTo(-0.5, -30); x.lineTo(-1, -12); x.quadraticCurveTo(-bw + 1, -13, -bw + 1.5, -20); x.closePath(); });
      part(look.vest, () => { x.moveTo(3.5, -30); x.lineTo(bw + 0.5, -27); x.quadraticCurveTo(bw + 2, -17, 3.5, -11.5); x.closePath(); });
      x.fillStyle = '#E2C27A'; for (const yb of [-25, -20.5, -16]) { x.beginPath(); x.arc(4.6, yb, 0.9, 0, Math.PI * 2); x.fill(); }
      x.fillStyle = '#3A2A1E'; x.fillRect(-bw + 2, -12.6, bw * 2 - 1, 1.6);
    }
  }
  // collo e testa
  const hx = 1.5, hy = -38;
  part(skin, () => x.rect(-1.5, -33, 5, 4));
  part(skin, () => x.ellipse(hx, hy, 8.2, 8.8, 0, 0, Math.PI * 2));
  if (!look.woman) { x.fillStyle = 'rgba(70,45,30,0.15)'; x.beginPath(); x.ellipse(hx + 2.5, hy + 4.5, 5.5, 3.5, 0, 0, Math.PI * 2); x.fill(); }
  part(skin, () => x.ellipse(hx - 6.5, hy + 0.5, 1.8, 2.6, 0, 0, Math.PI * 2));
  x.fillStyle = 'rgba(230,110,90,0.35)'; x.beginPath(); x.arc(hx + 4, hy + 2.5, 2.2, 0, Math.PI * 2); x.fill();
  // occhi e sopracciglia
  const angry = pose === 'aim' || pose === 'throw';
  if (pose === 'hit') { x.strokeStyle = OL; x.lineWidth = 1.2; for (const ex of [hx + 1.5, hx + 5.5]) { x.beginPath(); x.moveTo(ex - 1.4, hy - 3.6); x.lineTo(ex + 1.4, hy - 0.8); x.moveTo(ex + 1.4, hy - 3.6); x.lineTo(ex - 1.4, hy - 0.8); x.stroke(); } }
  else {
    for (const ex of [hx + 1.5, hx + 5.5]) { x.fillStyle = '#FFFFFF'; x.beginPath(); x.ellipse(ex, hy - 2.2, 1.7, 2.1, 0, 0, Math.PI * 2); x.fill(); x.strokeStyle = OL; x.lineWidth = 0.6; x.stroke(); x.fillStyle = '#1A1A1A'; x.beginPath(); x.arc(ex + 0.6, hy - 2, 0.95, 0, Math.PI * 2); x.fill(); }
    x.strokeStyle = look.woman ? '#4A3020' : '#2A1E16'; x.lineWidth = look.woman ? 0.9 : 1.6; x.lineCap = 'round';
    x.beginPath(); x.moveTo(hx - 0.4, hy - (angry ? 5.6 : 5)); x.lineTo(hx + 2.8, hy - (angry ? 4.4 : 5.3)); x.moveTo(hx + 4, hy - (angry ? 4.4 : 5.3)); x.lineTo(hx + 7.4, hy - (angry ? 5.8 : 5)); x.stroke();
  }
  if (look.glasses) { x.strokeStyle = OL; x.lineWidth = 0.7; x.beginPath(); x.arc(hx + 1.5, hy - 2.2, 2.4, 0, Math.PI * 2); x.moveTo(hx + 8, hy - 2.2); x.arc(hx + 5.6, hy - 2.2, 2.4, 0, Math.PI * 2); x.stroke(); }
  // nasone
  part(look.woman ? skin : '#E8A27E', () => x.ellipse(hx + 8, hy + 0.8, 2.8, 2.5, 0.2, 0, Math.PI * 2));
  // bocca
  const open = pose === 'throw' || pose === 'hit' || pose === 'cheer';
  if (open) { part('#5A1A14', () => x.ellipse(hx + 5, hy + 5.3, pose === 'hit' ? 1.6 : 2.6, pose === 'hit' ? 2 : 1.7, 0, 0, Math.PI * 2)); x.fillStyle = '#E86A6A'; x.beginPath(); x.ellipse(hx + 5, hy + 6.2, 1.4, 0.7, 0, 0, Math.PI * 2); x.fill(); }
  else { x.strokeStyle = OL; x.lineWidth = 0.8; x.beginPath(); x.arc(hx + 5, hy + 3.6, 2, 0.3, Math.PI - 0.6); x.stroke(); }
  // baffoni
  if (look.mous) { part(look.bald ? '#5A4A3E' : '#3A2A1E', () => { x.moveTo(hx + 2, hy + 3.6); x.quadraticCurveTo(hx + 5, hy + 1.6, hx + 8, hy + 3.2); x.quadraticCurveTo(hx + 10.5, hy + 3.6, hx + 10.8, hy + 2.2); x.quadraticCurveTo(hx + 10.5, hy + 5.4, hx + 7.5, hy + 4.8); x.quadraticCurveTo(hx + 5, hy + 4.6, hx + 2, hy + 3.6); x.closePath(); }); }
  // cappelli e capelli
  if (look.woman) {
    part(look.scarf, () => { x.moveTo(hx - 8.8, hy + 4); x.quadraticCurveTo(hx - 10, hy - 10, hx + 1, hy - 10.5); x.quadraticCurveTo(hx + 9.5, hy - 10, hx + 9, hy - 3.5); x.lineTo(hx + 6.5, hy - 5); x.quadraticCurveTo(hx, hy - 7.5, hx - 5, hy - 3); x.lineTo(hx - 5.5, hy + 5.5); x.closePath(); });
    x.fillStyle = 'rgba(255,255,255,0.55)'; for (const [dx, dy] of [[-4, -6], [1, -8], [5, -7], [-6, 0], [-2, -3]]) { x.beginPath(); x.arc(hx + dx, hy + dy, 0.8, 0, Math.PI * 2); x.fill(); }
    part(look.scarf, () => { x.moveTo(hx - 6, hy + 5); x.lineTo(hx - 11, hy + 10); x.lineTo(hx - 7.5, hy + 10.5); x.closePath(); });
    x.fillStyle = '#E2B53A'; x.beginPath(); x.arc(hx - 6.5, hy + 4, 1.1, 0, Math.PI * 2); x.fill();
  } else if (look.helmet) {
    part('#F2C200', () => { x.moveTo(hx - 9, hy - 3); x.quadraticCurveTo(hx - 8.5, hy - 13.5, hx + 1, hy - 13.5); x.quadraticCurveTo(hx + 9.5, hy - 13.5, hx + 9.5, hy - 3); x.closePath(); });
    part('#F2C200', () => x.rect(hx - 10, hy - 4, 22, 2.6));
    x.strokeStyle = '#C49A00'; x.lineWidth = 1.4; x.beginPath(); x.moveTo(hx + 0.5, hy - 13); x.lineTo(hx + 0.5, hy - 4.5); x.stroke();
  } else if (look.cap) {
    part(look.cap, () => { x.moveTo(hx - 8.8, hy - 3); x.quadraticCurveTo(hx - 9, hy - 12, hx, hy - 11.5); x.quadraticCurveTo(hx + 8, hy - 11.5, hx + 9, hy - 6); x.lineTo(hx + 13.5, hy - 4.8); x.quadraticCurveTo(hx + 9, hy - 2.6, hx + 4, hy - 4.2); x.lineTo(hx - 8.8, hy - 3); x.closePath(); });
    x.strokeStyle = 'rgba(0,0,0,0.35)'; x.lineWidth = 0.6; x.beginPath(); x.moveTo(hx - 6, hy - 9); x.quadraticCurveTo(hx + 1, hy - 7, hx + 8, hy - 6.4); x.stroke();
    x.fillStyle = '#3A2A1E'; x.beginPath(); x.ellipse(hx - 7.5, hy - 1, 1.6, 2.6, 0, 0, Math.PI * 2); x.fill();
  } else if (look.bald) {
    x.fillStyle = 'rgba(255,255,255,0.5)'; x.beginPath(); x.ellipse(hx + 1, hy - 6.5, 2.5, 1.2, -0.3, 0, Math.PI * 2); x.fill();
    part('#8A7A6A', () => x.ellipse(hx - 6.6, hy - 2, 2.2, 3.6, 0, 0, Math.PI * 2));
  }
  // braccio davanti (quello che tira)
  const fr = pose === 'throw' ? [3, -27, 10, -33, 15, -40] : pose === 'aim' ? [3, -27, -3, -31, -8, -36] : pose === 'cheer' ? [3, -28, 8, -37, 9, -46] : pose === 'hit' ? [3, -27, 10, -30, 14, -36] : [3, -27, 6, -20, 7, -14];
  limb(sleeve, fr[0], fr[1], fr[2], fr[3], fr[4], fr[5], 4.2); part(skin, () => x.arc(fr[4], fr[5], 2.5, 0, Math.PI * 2));
  x.restore();
  if (pose === 'hit') { x.fillStyle = '#FFE14D'; x.strokeStyle = OL; x.lineWidth = 0.6; for (let k = 0; k < 3; k++) { const a = t * 0.15 + k * 2.1, sx = m.x + Math.cos(a) * 13, sy = m.y - 72 + Math.sin(a) * 4; x.beginPath(); for (let j = 0; j < 10; j++) { const rr = j % 2 ? 1.2 : 3, aa = j * Math.PI / 5; x.lineTo(sx + Math.cos(aa) * rr, sy + Math.sin(aa) * rr); } x.closePath(); x.fill(); x.stroke(); } }
}
function caDrawShot(x, w, px, py, t) {
  x.save(); x.translate(px, py); x.rotate(t * 0.25);
  if (w === 'mattone') { x.fillStyle = '#C9573A'; x.fillRect(-7, -4, 14, 8); x.fillStyle = 'rgba(80,20,10,0.6)'; x.fillRect(-4, -1.5, 2.5, 3); x.fillRect(1.5, -1.5, 2.5, 3); x.strokeStyle = '#6A2414'; x.lineWidth = 0.8; x.strokeRect(-7, -4, 14, 8); }
  if (w === 'pomodoro') { x.fillStyle = '#E2312A'; x.beginPath(); x.arc(0, 0, 5.4, 0, Math.PI * 2); x.fill(); x.fillStyle = 'rgba(255,255,255,0.45)'; x.beginPath(); x.arc(-2, -2, 1.5, 0, Math.PI * 2); x.fill(); x.fillStyle = '#3E8A3A'; for (let k = 0; k < 5; k++) { x.beginPath(); x.ellipse(Math.cos(k * 1.26) * 2, -5 + Math.sin(k * 1.26) * 1, 2, 0.8, k * 1.26, 0, Math.PI * 2); x.fill(); } }
  if (w === 'nduja') { x.fillStyle = '#B4221A'; x.beginPath(); x.ellipse(0, 0, 8, 4.4, 0, 0, Math.PI * 2); x.fill(); x.strokeStyle = '#F2E6C8'; x.lineWidth = 0.7; for (let k = -5; k <= 5; k += 3.4) { x.beginPath(); x.moveTo(k, -4); x.lineTo(k + 1, 4); x.stroke(); } x.fillStyle = '#E8D6B0'; x.fillRect(7, -1, 3, 2); }
  if (w === 'cacio') { x.fillStyle = '#F2D58A'; x.beginPath(); x.arc(0, 2, 6.4, 0, Math.PI * 2); x.fill(); x.beginPath(); x.arc(0, -5, 3.4, 0, Math.PI * 2); x.fill(); x.strokeStyle = '#9A7A3A'; x.lineWidth = 1; x.beginPath(); x.moveTo(0, -8); x.lineTo(0, -11); x.stroke(); x.strokeStyle = '#C9A24E'; x.beginPath(); x.arc(0, 2, 6.4, 0, Math.PI * 2); x.stroke(); }
  if (w === 'pane') { x.fillStyle = '#C98A3E'; x.beginPath(); x.ellipse(0, 0, 8, 6.4, 0, 0, Math.PI * 2); x.fill(); x.strokeStyle = '#8A5A22'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(-4, -4); x.lineTo(-1, 3); x.moveTo(1, -5); x.lineTo(4, 2); x.stroke(); x.fillStyle = 'rgba(255,240,200,0.4)'; x.beginPath(); x.ellipse(-2, -2.5, 3, 1.4, -0.4, 0, Math.PI * 2); x.fill(); }
  x.restore();
}

/* ---------- partita ---------- */
function caUses() { const u = {}; for (const k of Object.keys(CA_WEAP)) u[k] = CA_WEAP[k].uses; u.build = CA_BUILD_USES; return u; }
const caNewWind = (mx) => { const m = mx || 3; return Math.round((Math.random() * 2 - 1) * m * 10) / 10; };
function caMatchStart(o) {
  const C = caData(), foe = o.foe || CA_FOLK[0], TW = CA_TOWN[foe.id] || CA_TOWN.ciccio;
  CA.m = {
    g: [caNewGrid(8), caNewGrid(foe.rows || 8, TW.style)], wind: caNewWind(TW.wmax), wmax: TW.wmax, scene: TW.scene, style: ['rustico', TW.style], town: TW, tank: [1, 1], storm: 0, turn: 0, turns: [0, 0], stun: [0, 0], uses: [caUses(), caUses()],
    me: 0, mode: o.mode, lv: o.lv, foe, names: [myName ? myName() : 'Tu', foe.n], looks: [CA_ME_LOOK, foe], decor: [C.decor.slice(), []],
    weap: 'mattone', anim: null, over: false, online: false, pose: ['idle', 'idle'], hurt: [0, 0], start: [0, 0],
    tod: ['giorno', 'giorno', 'tramonto', 'sera'][Math.floor(Math.random() * 4)], trail: [null, null], rubble: [0, 0], texts: [],
  };
  CA.m.start = [caCount(CA.m.g[0]), caCount(CA.m.g[1])];
  if (foe.id === 'sindaco') CA.m.uses[1].nduja++;
  CA.parts = []; CA.splats = []; CA.aim = null; CA.screen = 'match'; CA.cam = null; CA.peek = false;
  caRender();
  setTimeout(() => caNd('Siamo a ' + TW.town + ', ' + TW.place + '! ' + TW.note), 300);
  setTimeout(() => caSay(1, tr2('Cumpà! A casa toi è chiù vasciotta da mia!', 'Compare! La tua casa è più bassa della mia!')), 900);
  setTimeout(() => caSay(0, caLine('throw')), 2200);
  setTimeout(() => caBanner(tr2('Tocca a tia!', 'Tocca a te!'), true), 3200);
}
/* la scritta grande al cambio di turno */
function caBanner(text, mine) {
  const f = $('caField'); if (!f) return;
  const old = f.querySelector('.caban'); if (old) old.remove();
  const el = document.createElement('div'); el.className = 'caban' + (mine ? ' mine' : ''); el.textContent = text;
  f.appendChild(el); setTimeout(() => el.remove(), 1500);
  if (mine && !caData().tut && !(CA.m && CA.m.online && caData().w + caData().l > 0)) caTutorial();
}
/* la prima volta: una mano che fa vedere come si tira */
function caTutorial() {
  const f = $('caField'); if (!f || f.querySelector('.catut')) return;
  const el = document.createElement('div'); el.className = 'catut';
  el.innerHTML = '<span class="catuth">👆</span><span class="catutt">Tieni il dito sul campo, tira indietro e lascia!</span>';
  f.appendChild(el);
}
function caSay(q, text, ms) {
  const f = $('caField'), M = CA.m; if (!f || !M) return;
  f.querySelectorAll('.cabub.q0, .cabub.q1').forEach((o) => o.remove());
  const m = caManPos(M.g[q], q), el = document.createElement('div');
  el.className = 'cabub q' + q; el.textContent = text;
  const cv = CA.cv, ox = cv.offsetLeft, oy = cv.offsetTop;
  el.style.left = (ox + (m.x - (CA.cam || 0)) * CA.css) + 'px'; el.style.top = (oy + (m.y - 82) * CA.css) + 'px';
  f.appendChild(el); CA.bubs = (CA.bubs || []).filter((b) => b.el.isConnected).concat({ el, x: m.x });
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, ms || 2600);
}
function caBrideSay(q) {
  const f = $('caField'), M = CA.m; if (!f || !M) return;
  const el = document.createElement('div'); el.className = 'cabub bride'; el.textContent = caLine('bride');
  const cv = CA.cv, x0 = CA_X0[q] + CA_COLS * CA_CW / 2, y = CA_GY - caFloors(M.g[q]) * CA_CH - 24;
  el.style.left = (cv.offsetLeft + (x0 - (CA.cam || 0)) * CA.css) + 'px'; el.style.top = (cv.offsetTop + y * CA.css) + 'px';
  f.appendChild(el); CA.bubs = (CA.bubs || []).filter((b) => b.el.isConnected).concat({ el, x: x0 }); setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, 2600);
}
function caFit() {
  const cv = CA.cv; if (!cv) return;
  const wrap = cv.parentNode; wrap.style.flex = ''; cv.style.width = '10px'; cv.style.height = '10px';
  const bw = wrap.clientWidth, bh = wrap.clientHeight;
  const sc = Math.max(0.3, Math.min(bw / CA_VW, bh / CA_H));
  const dpr = Math.min(2.5, window.devicePixelRatio || 1);
  cv.style.width = Math.round(CA_VW * sc) + 'px'; cv.style.height = Math.round(CA_H * sc) + 'px';
  cv.width = Math.round(CA_VW * sc * dpr); cv.height = Math.round(CA_H * sc * dpr);
  CA.sc = sc * dpr; CA.css = sc;
  wrap.style.flex = '0 0 ' + (Math.round(CA_H * sc) + 4) + 'px'; // il resto dello spazio va ai pulsanti, tutto centrato
  CA.bg = caBackground(CA.sc, CA.m && CA.m.tod, CA.m && CA.m.scene);
}
function caLoop() {
  cancelAnimationFrame(CA.raf);
  const step = () => { if (view !== 'vCasa' || CA.screen !== 'match' || !CA.m) return; CA.t++; caTickAnim(); caDraw(); CA.raf = requestAnimationFrame(step); };
  CA.raf = requestAnimationFrame(step);
}
function caDraw() {
  const cv = CA.cv, M = CA.m; if (!cv || !M || !CA.bg) return;
  const x = cv.getContext('2d'), t = CA.t;
  x.setTransform(1, 0, 0, 1, 0, 0);
  let sx = 0, sy = 0; if (CA.shake > 0) { sx = (Math.random() - 0.5) * CA.shake * CA.sc; sy = (Math.random() - 0.5) * CA.shake * CA.sc; CA.shake *= 0.86; if (CA.shake < 0.3) CA.shake = 0; }
  caCamera();
  const cam = CA.cam || 0;
  x.drawImage(CA.bg, sx - cam * CA.sc, sy);
  x.setTransform(CA.sc, 0, 0, CA.sc, sx - cam * CA.sc, sy);
  // nuvole e barchetta che si muovono
  x.fillStyle = 'rgba(255,255,255,0.85)';
  for (let k = 0; k < 9; k++) { const cx = ((t * (0.12 + (k % 4) * 0.05) + k * 150) % (CA_W + 120)) - 60, cy = 40 + (k % 4) * 34; for (let j = 0; j < 4; j++) { x.beginPath(); x.arc(cx + j * 11, cy + (j % 2) * -5, 10 + (j % 2) * 4, 0, Math.PI * 2); x.fill(); } }
  const bx = ((t * 0.18) % (CA_W + 60)) - 30;
  for (const bxx of [bx, bx + CA_W / 2]) { const bx = bxx % (CA_W + 60);
  x.fillStyle = '#5A3A22'; x.beginPath(); x.moveTo(bx - 9, 312); x.lineTo(bx + 9, 312); x.lineTo(bx + 6, 316); x.lineTo(bx - 6, 316); x.fill();
  x.fillStyle = '#FFFFFF'; x.beginPath(); x.moveTo(bx, 296); x.lineTo(bx, 311); x.lineTo(bx + 8, 311); x.fill(); }
  // gabbiani
  x.strokeStyle = '#3A3A3A'; x.lineWidth = 1;
  for (let k = 0; k < 5; k++) { const gx = ((t * 0.5 + k * 260) % (CA_W + 40)) - 20, gy = 150 + k * 30 + Math.sin(t * 0.05 + k) * 6, wv = Math.sin(t * 0.25 + k) * 3; x.beginPath(); x.moveTo(gx - 6, gy - wv); x.quadraticCurveTo(gx - 3, gy - 3, gx, gy); x.quadraticCurveTo(gx + 3, gy - 3, gx + 6, gy - wv); x.stroke(); }
  caBetoniera(x, CA_X0[0] + CA_COLS * CA_CW + 60, CA_GY - 2, t); caBetoniera(x, CA_X0[1] - 60, CA_GY - 2, t + 40); caFlag(x, CA_W / 2, CA_GY - 30, M.wind, t);
  caProps(x, t, false); caProps(x, t, true);
  caCrowd(x, t, CA.cheer > t);
  // macerie ai piedi delle case
  for (let q = 0; q < 2; q++) { const n = Math.min(60, M.rubble ? M.rubble[q] : 0), R = caRand(q * 99 + 5); for (let k = 0; k < n; k++) { const side = R() < 0.5 ? -1 : 1, bx = side < 0 ? CA_X0[q] - 4 - R() * 22 : CA_X0[q] + CA_COLS * CA_CW + 4 + R() * 22, by = CA_GY - 1 - R() * Math.min(10, 2 + n / 6); x.fillStyle = R() < 0.25 ? '#A9A396' : (R() < 0.5 ? '#B24A32' : '#C9573A'); x.save(); x.translate(bx, by); x.rotate(R() * 3); x.fillRect(-3, -1.8, 6, 3.6); x.restore(); } }
  // foglie che volano col vento
  for (let k = 0; k < 10; k++) { const sp = 0.5 + Math.abs(M.wind) * 0.9, lx = ((k * 137 + t * sp * (M.wind >= 0 ? 1 : -1)) % CA_W + CA_W) % CA_W, ly = 360 + (k * 23) % 90 + Math.sin(t * 0.05 + k) * 8; x.fillStyle = k % 2 ? '#7A9A4A' : '#B88A3A'; x.save(); x.translate(lx, ly); x.rotate(t * 0.08 + k); x.beginPath(); x.ellipse(0, 0, 2.6, 1.2, 0, 0, Math.PI * 2); x.fill(); x.restore(); }
  // l'ultimo lancio di ciascuno, tratteggiato, per aggiustare la mira
  if (M.trail) for (let q = 0; q < 2; q++) { const tr = M.trail[q]; if (!tr || M.anim) continue; x.fillStyle = q === M.me ? 'rgba(255,255,255,0.55)' : 'rgba(255,170,140,0.35)'; for (let i = 0; i < tr.length; i += 6) { x.beginPath(); x.arc(tr[i], tr[i + 1], 1.6, 0, Math.PI * 2); x.fill(); } }
  // case
  const fa = CA.fallMap || null;
  const sty = M.style || ['rustico', 'rustico'], tk = M.tank || [1, 1];
  caDrawHouse(x, 0, M.g[0], fa, M.decor[0], M.hurt[0] > t, sty[0], !!tk[0]); caDrawHouse(x, 1, M.g[1], fa, M.decor[1], M.hurt[1] > t, sty[1], !!tk[1]);
  caPasser(x, t);
  // macchie di pomodoro
  for (const s of CA.splats) { x.fillStyle = 'rgba(200,30,25,0.8)'; x.beginPath(); for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2, rr = s.r * (0.6 + ((k * 37 + s.seed) % 10) / 14); x.lineTo(s.x + Math.cos(a) * rr, s.y + Math.sin(a) * rr); } x.closePath(); x.fill(); }
  // compari
  for (let q = 0; q < 2; q++) { const m = caManPos(M.g[q], q); caDrawMan(x, m, M.looks[q], q === 0 ? 1 : -1, M.stun[q] && !M.anim ? 'hit' : M.pose[q], t); if (M.sauce && M.sauce[q]) { x.fillStyle = 'rgba(210,30,25,0.85)'; x.beginPath(); x.arc(m.x + 3, m.y - 48, 5, 0, Math.PI * 2); x.fill(); x.beginPath(); x.arc(m.x - 4, m.y - 29, 4, 0, Math.PI * 2); x.fill(); } }
  // mira
  const A = CA.aim;
  if (A && A.pow > 0.04) {
    const h = caHand(M.g[M.me], M.me), sh = caShotVec(M.weap, A.ang, A.pow), W = CA_WEAP[M.weap];
    let px = h.x, py = h.y, vx = sh.vx, vy = sh.vy;
    x.fillStyle = 'rgba(255,255,255,0.9)';
    for (let k = 0; k < 34; k++) { vy += CA_G * W.g; px += vx; py += vy; if (k % 3 === 0) { x.beginPath(); x.arc(px, py, 2.2 - k * 0.04, 0, Math.PI * 2); x.fill(); } }
    const col = A.pow < 0.5 ? '#FFE14D' : A.pow < 0.85 ? '#FF9A3C' : '#FF4D3C';
    x.strokeStyle = 'rgba(0,0,0,0.35)'; x.lineWidth = 6; x.beginPath(); x.arc(h.x, h.y, 16, 0, Math.PI * 2); x.stroke();
    x.strokeStyle = col; x.lineWidth = 4; x.beginPath(); x.arc(h.x, h.y, 16, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * A.pow); x.stroke();
    const deg = Math.round(Math.abs(Math.atan2(-Math.sin(A.ang), Math.abs(Math.cos(A.ang)))) * 180 / Math.PI);
    x.fillStyle = 'rgba(0,0,0,0.55)'; x.fillRect(h.x - 26, h.y - 34, 52, 13);
    x.fillStyle = '#fff'; x.font = 'bold 9px sans-serif'; x.textAlign = 'center'; x.fillText(Math.round(A.pow * 100) + '% · ' + deg + '°', h.x, h.y - 24.5);
  }
  // proiettile in volo, con la scia; se esce dallo schermo in alto una freccia dice dov'è
  if (M.anim && M.anim.k < M.anim.R.path.length) {
    const i = M.anim.k, P0 = M.anim.R.path;
    x.strokeStyle = 'rgba(255,255,255,0.35)'; x.lineWidth = 2; x.beginPath(); for (let j = Math.max(0, i - 24); j <= i; j += 2) x[j === Math.max(0, i - 24) ? 'moveTo' : 'lineTo'](P0[j], P0[j + 1]); x.stroke();
    caDrawShot(x, M.anim.w, P0[i], P0[i + 1], t);
    if (P0[i + 1] < 46) { const ax = P0[i]; x.fillStyle = '#FFE14D'; x.beginPath(); x.moveTo(ax, 48); x.lineTo(ax - 7, 60); x.lineTo(ax + 7, 60); x.closePath(); x.fill(); x.fillStyle = '#fff'; x.font = 'bold 9px sans-serif'; x.textAlign = 'center'; x.fillText(Math.round((CA_GY - P0[i + 1]) / 10) + ' m', ax, 70); }
  }
  // polvere, pezzi di mattone, fuoco
  for (const p of CA.parts) {
    x.globalAlpha = Math.max(0, p.life / p.max);
    if (p.k === 'dust') { x.fillStyle = p.c || '#D9C3A0'; x.beginPath(); x.arc(p.x, p.y, p.r * (1.6 - p.life / p.max), 0, Math.PI * 2); x.fill(); }
    else if (p.k === 'fire') { x.fillStyle = p.life / p.max > 0.5 ? '#FFD23C' : '#E2462A'; x.beginPath(); x.arc(p.x, p.y, p.r, 0, Math.PI * 2); x.fill(); }
    else { x.fillStyle = p.c || '#C9573A'; x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillRect(-p.r, -p.r * 0.6, p.r * 2, p.r * 1.2); x.restore(); }
  }
  x.globalAlpha = 1;
  // scritte che salgono: danni, colpi, mancati
  for (const s of M.texts || []) { x.globalAlpha = Math.min(1, s.life / 25); x.font = 'bold ' + (s.big ? 22 : 15) + 'px sans-serif'; x.textAlign = 'center'; x.lineWidth = 4; x.strokeStyle = 'rgba(0,0,0,0.75)'; const hw = x.measureText(s.txt).width / 2 + 8, tx = Math.max(cam + hw, Math.min(cam + CA_VW - hw, s.x)); x.strokeText(s.txt, tx, s.y); x.fillStyle = s.col; x.fillText(s.txt, tx, s.y); }
  x.globalAlpha = 1;
  if (M.tod === 'sera') { x.fillStyle = 'rgba(10,18,50,0.16)'; x.fillRect(cam, 0, CA_VW, CA_H); }
  if (M.storm > 0) { x.fillStyle = 'rgba(30,40,60,0.22)'; x.fillRect(cam, 0, CA_VW, CA_H); x.strokeStyle = 'rgba(200,215,235,0.55)'; x.lineWidth = 1; const sl = M.wind * 2.2; for (let k = 0; k < 70; k++) { const rx = cam + ((k * 97 + t * 5) % (CA_VW + 40)) - 20, ry = (k * 53 + t * 11) % CA_H; x.beginPath(); x.moveTo(rx, ry); x.lineTo(rx + sl, ry + 10); x.stroke(); } if (t % 180 < 4) { x.fillStyle = 'rgba(255,255,255,0.35)'; x.fillRect(cam, 0, CA_VW, CA_H); } }
  caMiniMap(x, M, cam);
}
/* la mappa piccola in alto: dove sono le case, il proiettile e cosa stai guardando */
function caMiniMap(x, M, cam) {
  x.save(); x.setTransform(CA.sc, 0, 0, CA.sc, 0, 0);
  const mw = 220, mh = 30, mx = (CA_VW - mw) / 2, my = 8, k = mw / CA_W;
  x.fillStyle = 'rgba(20,30,40,0.55)'; x.beginPath(); x.roundRect ? x.roundRect(mx - 4, my - 4, mw + 8, mh + 8, 8) : x.rect(mx - 4, my - 4, mw + 8, mh + 8); x.fill();
  x.fillStyle = 'rgba(150,120,80,0.9)'; x.fillRect(mx, my + mh - 4, mw, 4);
  for (let q = 0; q < 2; q++) { const g = M.g[q]; for (let c = 0; c < CA_COLS; c++) { const h = caColH(g, c); x.fillStyle = q === M.me ? '#F2C94C' : '#E2643F'; x.fillRect(mx + (CA_X0[q] + c * CA_CW) * k, my + mh - 4 - h * 2, CA_CW * k - 0.3, h * 2); } }
  if (M.anim && M.anim.k < M.anim.R.path.length) { const px = M.anim.R.path[M.anim.k], py = M.anim.R.path[M.anim.k + 1]; x.fillStyle = '#FFFFFF'; x.beginPath(); x.arc(mx + px * k, my + Math.max(2, Math.min(mh - 4, (py - 180) * (mh / 320))), 2.2, 0, Math.PI * 2); x.fill(); }
  x.strokeStyle = 'rgba(255,255,255,0.85)'; x.lineWidth = 1.2; x.strokeRect(mx + cam * k, my - 2, CA_VW * k, mh + 4);
  x.restore();
}
/* la telecamera: segue il lancio, poi torna su chi deve tirare */
function caCamera() {
  const M = CA.m; if (!M) return;
  const maxC = CA_W - CA_VW, clamp = (v) => Math.max(0, Math.min(maxC, v));
  const houseC = (q) => clamp(q === 0 ? CA_X0[0] - 20 : CA_X0[1] + CA_COLS * CA_CW + 20 - CA_VW);
  let target, sp = 0.07;
  if (M.anim && M.anim.k < M.anim.R.path.length) { target = clamp(M.anim.R.path[M.anim.k] - CA_VW / 2); sp = 0.16; }
  else if (M.anim) target = CA.cam;
  else if (CA.peek) target = houseC(1 - M.turn);
  else target = houseC(M.turn);
  if (CA.cam == null) CA.cam = target;
  CA.cam += (target - CA.cam) * sp;
  if (Math.abs(target - CA.cam) < 0.3) CA.cam = target;
  for (const b of CA.bubs || []) if (b.el.isConnected) { b.el.style.left = (CA.cv.offsetLeft + (b.x - CA.cam) * CA.css) + 'px'; }
}
function caText(x, y, txt, col, big) { const M = CA.m; if (!M) return; (M.texts = M.texts || []).push({ x, y, txt, col: col || '#FFFFFF', life: 70, big }); }
function caBurst(px, py, kind, n) {
  for (let k = 0; k < n; k++) {
    const a = Math.random() * Math.PI * 2, v = 0.6 + Math.random() * 2.6;
    if (kind === 'brick') CA.parts.push({ k: 'chip', x: px, y: py, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2, r: 1.4 + Math.random() * 2, a: Math.random() * 6, va: (Math.random() - 0.5) * 0.4, life: 50, max: 50, g: 0.18, c: Math.random() < 0.3 ? '#B7B2A8' : '#C9573A' });
    else if (kind === 'fire') CA.parts.push({ k: 'fire', x: px, y: py, vx: Math.cos(a) * v * 1.4, vy: Math.sin(a) * v * 1.4 - 1, r: 3 + Math.random() * 4, life: 26, max: 26, g: -0.04 });
    else if (kind === 'red') CA.parts.push({ k: 'chip', x: px, y: py, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1.5, r: 1.6, a: 0, va: 0, life: 30, max: 30, g: 0.2, c: '#D8261E' });
    else CA.parts.push({ k: 'dust', x: px + (Math.random() - 0.5) * 10, y: py, vx: Math.cos(a) * v * 0.4, vy: -Math.random() * 0.8, r: 4 + Math.random() * 6, life: 40, max: 40, g: 0, c: kind === 'dustg' ? '#CFC6B4' : '#D9C3A0' });
  }
}
function caTickAnim() {
  for (const p of CA.parts) { p.x += p.vx; p.y += p.vy; p.vy += p.g; if (p.va) p.a += p.va; p.life--; if (p.k === 'chip' && p.y > CA_GY) { p.y = CA_GY; p.vy *= -0.3; p.vx *= 0.6; } }
  CA.parts = CA.parts.filter((p) => p.life > 0);
  if (CA.m && CA.m.texts) { for (const s of CA.m.texts) { s.y -= 0.6; s.life--; } CA.m.texts = CA.m.texts.filter((s) => s.life > 0); }
  const M = CA.m, A = M && M.anim;
  if (!A && CA.fallMap) { for (const [k, v] of CA.fallMap) CA.fallMap.set(k, Math.max(0, v - 0.25)); }
  if (!A) return;
  // il proiettile avanza di un fotogramma; gli eventi succedono quando li raggiunge
  A.k += 2;
  const f = A.k / 2;
  for (const e of A.R.ev) if (!e.done && e.f <= f) { e.done = true; caEvent(e, A); }
  if (A.k >= A.R.path.length) {
    if (!A.end) {
      A.end = CA.t;
      // le griglie nuove e i crolli
      M.g = A.R.g.map((g) => g.slice());
      CA.fallMap = new Map(); CA.fallT = 0;
      A.R.fall.forEach((mv, q) => mv.forEach(([c, from, to]) => CA.fallMap.set(q + ':' + c + ':' + to, from - to)));
      if (A.tot) for (let q = 0; q < 2; q++) if (A.tot[q]) { const [px, py] = A.at[q], n = A.tot[q]; caText(px, py - 16, '−' + n + (n === 1 ? ' mattone' : ' mattoni'), q === A.p ? '#FF9A8A' : '#FFE14D', n >= 4); if (q !== A.p && n >= 4) caText(px, py - 44, n >= 7 ? 'CHE BOTTA!' : 'BELLU COLPU!', '#FFFFFF', true); }
      if (CA.fallMap.size) { fx('take'); CA.shake = 6; A.R.fall.forEach((mv, q) => mv.forEach(([c, , to]) => caBurst(CA_X0[q] + c * CA_CW + CA_CW / 2, CA_GY - to * CA_CH, 'dustg', 3))); }
    }
    if (CA.fallMap && CA.fallMap.size) { let any = false; for (const [k, v] of CA.fallMap) { const nv = Math.max(0, v - 0.12); CA.fallMap.set(k, nv); if (nv > 0) any = true; } if (!any) CA.fallMap = null; }
    if (CA.fallMap && !CA.fallMap.size) CA.fallMap = null;
    if (CA.t - A.end > 40 && !CA.fallMap) { M.anim = null; A.done(); }
  }
}
function caEvent(e, A) {
  const M = CA.m, shooter = A.p, w = A.w;
  if (e.k === 'cell') {
    const px = CA_X0[e.q] + e.c * CA_CW + CA_CW / 2, py = CA_GY - e.r * CA_CH - CA_CH / 2;
    if (w === 'nduja') { caBurst(px, py, 'fire', 26); caBurst(px, py, 'dust', 8); CA.shake = 12; caSnd('boom'); }
    else if (w === 'pomodoro') { CA.splats.push({ x: px, y: py, r: 7, seed: Math.floor(Math.random() * 100) }); caBurst(px, py, 'red', 12); caSnd('splat'); }
    else { caBurst(px, py, 'brick', 8 + e.hits.length * 5); caBurst(px, py, 'dust', 6); CA.shake = 4 + e.hits.length * 1.5; caSnd(e.hits.length ? 'crash' : 'thud'); }
    if (e.hits.length) { M.rubble = M.rubble || [0, 0]; M.rubble[e.q] += e.hits.length * 2; if (e.q !== shooter) CA.cheer = CA.t + 90; A.tot = A.tot || [0, 0]; A.tot[e.q] += e.hits.length; A.at = A.at || []; A.at[e.q] = [px, py]; }
    else if (!A.tot) caText(px, py - 14, 'Tum!', '#FFFFFF');
    // le macchie sui mattoni crollati spariscono
    for (const [c, r] of e.hits) CA.splats = CA.splats.filter((s) => !(Math.abs(s.x - (CA_X0[e.q] + c * CA_CW + CA_CW / 2)) < 12 && Math.abs(s.y - (CA_GY - r * CA_CH - CA_CH / 2)) < 9));
    for (const [c, r, t] of e.hits) { const bx = CA_X0[e.q] + c * CA_CW + CA_CW / 2, by = CA_GY - r * CA_CH - CA_CH / 2; for (let k = 0; k < 3; k++) CA.parts.push({ k: 'chip', x: bx, y: by, vx: (Math.random() - 0.5) * 3, vy: -Math.random() * 2, r: 3.4, a: Math.random() * 6, va: (Math.random() - 0.5) * 0.3, life: 70, max: 70, g: 0.2, c: t === 2 ? '#B7B2A8' : '#C9573A' }); }
    if (e.hits.length && e.q !== shooter) { M.hurt[e.q] = CA.t + 120; M.pose[e.q] = 'hit'; setTimeout(() => { if (CA.m === M) M.pose[e.q] = 'idle'; }, 1200); }
  }
  if (e.k === 'ground') { caSnd('thud'); caText(e.x, CA_GY - 20, 'Mancato!', '#DDDDDD'); caBurst(e.x, CA_GY, 'dust', 10); if (w === 'nduja') caBurst(e.x, CA_GY - 4, 'fire', 18); if (w === 'pomodoro') CA.splats.push({ x: e.x, y: CA_GY - 2, r: 6, seed: 3 }); }
  if (e.k === 'tank') {
    for (let k = 0; k < 40; k++) { const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2, v = 1 + Math.random() * 3.5; CA.parts.push({ k: 'chip', x: e.x, y: e.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: 1.5, a: 0, va: 0, life: 60, max: 60, g: 0.15, c: k % 3 ? '#7EC8F0' : '#FFFFFF' }); }
    caSnd('splat'); CA.shake = 5; M.tank = (M.tank || [1, 1]).slice(); M.tank[e.q] = 0;
    caText(e.x, e.y - 30, 'Cisterna bucata!', '#7EC8F0', true); caText(e.x, e.y - 8, 'Senz’acqua: −1 “Alza un piano”', '#FFFFFF');
    setTimeout(() => caNd(e.q === shooter ? 'Ti bucasti a cisterna toa! Senz’acqua u cimentu non si fa!' : 'Ha bucato la cisterna! Senz’acqua niente cemento: un piano in meno da alzare!'), 700);
  }
  if (e.k === 'bounce') { caBurst(e.x, CA_GY, 'dust', 5); caSnd('bounce'); caText(e.x, CA_GY - 20, 'Boing!', '#FFE14D'); }
  if (e.k === 'out') caText(Math.max(20, Math.min(CA_W - 20, e.x)), 200, 'Fuori dal terreno!', '#DDDDDD');
  if (e.k === 'man') { caBurst(e.x, e.y, w === 'pomodoro' ? 'red' : 'brick', 10); caSnd(w === 'pomodoro' ? 'splat' : 'ahi'); CA.shake = 6; CA.cheer = CA.t + 90; caText(e.x, e.y - 30, w === 'pomodoro' ? 'SPLAT! Salta il turno' : 'In testa! Salta il turno', '#FFE14D', true); if (w === 'pomodoro') { M.sauce = M.sauce || [0, 0]; M.sauce[e.q] = 1; } }
}
/* esegue un'azione (anche quella arrivata dall'online), poi chiama done */
function caPlay(p, act, done) {
  const M = CA.m;
  M.pose[p] = 'throw';
  if (act.w === 'skip') { caSay(p, tr2('Aspetta, mi pigghiu nu cafè…', 'Aspetta, mi prendo un caffè…')); setTimeout(done, 900); return; }
  if (act.w === 'build') {
    const g0 = M.g[p], g = g0.slice(); caBuild(g, (M.style || [])[p]); M.g[p] = g; M.uses[p].build--;
    // i mattoni nuovi scendono dall'alto
    CA.fallMap = CA.fallMap || new Map();
    for (let k = 0; k < g.length; k++) if (g[k] && !g0[k]) CA.fallMap.set(p + ':' + (k % CA_COLS) + ':' + Math.floor(k / CA_COLS), 6 + (k % CA_COLS) * 0.8);
    setTimeout(() => { if (CA.fallMap) { for (const [kk] of CA.fallMap) if (kk.startsWith(p + ':')) CA.fallMap.delete(kk); if (!CA.fallMap.size) CA.fallMap = null; } }, 1100);
    caSay(p, caLine('build')); caSnd('build'); caText(CA_X0[p] + CA_COLS * CA_CW / 2, CA_GY - caFloors(g) * CA_CH - 30, '+1 piano!', '#9EF0B0', true);
    for (let c = 0; c < CA_COLS; c++) caBurst(CA_X0[p] + c * CA_CW + CA_CW / 2, CA_GY - caColH(g, c) * CA_CH, 'dustg', 2);
    setTimeout(() => { M.pose[p] = 'cheer'; }, 200);
    setTimeout(() => { M.pose[p] = 'idle'; done({ stun: -1 }); }, 1400);
    return;
  }
  if (CA_WEAP[act.w].uses < 99) M.uses[p][act.w]--;
  const R = caSim(M.g[0], M.g[1], M.wind, p, act, M.tank);
  caSnd('whoosh'); { const tut = $('caField') && $('caField').querySelector('.catut'); if (tut && p === M.me) { tut.remove(); const C = caData(); C.tut = 1; save(); } }
  M.trail = M.trail || [null, null]; M.trail[p] = R.path;
  setTimeout(() => { if (CA.m === M) M.pose[p] = 'idle'; }, 500);
  M.anim = { R, k: 0, w: act.w, p, done: () => {
    const opp = 1 - p;
    if (R.tank >= 0 && !M.online) { M.uses[R.tank].build = Math.max(0, M.uses[R.tank].build - 1); }
    const big = R.ev.reduce((s, e) => s + (e.k === 'cell' && e.q === opp ? e.hits.length : 0), 0);
    if (big >= 6) setTimeout(() => caNd(['Che botta! Mezza casa è venuta giù!', 'Madonna mia, che colpo! I mattoni volano fino a Messina!', 'Bellu colpu, cumpari! Chistu si chiama tirari!'][Math.floor(Math.random() * 3)]), 600);
    const hitOpp = R.ev.some((e) => e.k === 'cell' && e.q === opp && e.hits.length), hitOwn = R.ev.some((e) => e.k === 'cell' && e.q === p && e.hits.length);
    if (R.stun === opp) { caSay(opp, act.w === 'pomodoro' ? caLine('tomato') : caLine('man')); }
    else if (hitOpp) { caSay(opp, caLine('hit')); if (Math.random() < 0.4) setTimeout(() => caBrideSay(opp), 900); }
    else if (hitOwn) caSay(opp, tr2('Ahahah! A casa toi ti scassasti!', 'Ahahah! Ti sei rotto la casa da solo!'));
    else caSay(opp, caLine('miss'));
    done({ stun: R.stun });
  } };
}
function caNextTurn(p, res) {
  const M = CA.m;
  M.turns[p]++;
  if (res && res.stun >= 0) M.stun[res.stun] = 1;
  M.wind = caNewWind(M.wmax) * (M.storm > 0 ? 1.8 : 1); M.wind = Math.round(M.wind * 10) / 10; if (M.storm > 0) M.storm--;
  const n0 = caCount(M.g[0]), n1 = caCount(M.g[1]);
  const tot = M.turns[0] + M.turns[1];
  let surp = null;
  if (tot >= 3 && tot % 3 === 0 && !(M.turns[0] >= CA_TURNS && M.turns[1] >= CA_TURNS) && Math.random() < 0.6) surp = caRollSurprise(M, [n0, n1]);
  if (M.turns[0] === CA_TURNS - 1 && M.turns[1] === CA_TURNS - 1) setTimeout(() => caNd('Ultimo lancio a testa! Chi ha la casa più grande?'), 400);
  if (n0 < 6 || n1 < 6 || (M.turns[0] >= CA_TURNS && M.turns[1] >= CA_TURNS)) { caEnd(); return; }
  let nt = 1 - p;
  if (M.stun[nt]) { M.stun[nt] = 0; M.turns[nt]++; caSay(nt, tr2('Mi gira a testa… salto u turnu!', 'Mi gira la testa… salto il turno!')); if (M.turns[0] >= CA_TURNS && M.turns[1] >= CA_TURNS) { caEnd(); return; } nt = p; }
  if (M.sauce) M.sauce[nt] = 0;
  M.turn = nt; CA.peek = false;
  caHUD();
  const delay = surp ? 2600 : 0;
  if (surp) caSurpriseShow(surp);
  setTimeout(() => { if (CA.m === M && !M.over) caBanner(nt === M.me ? tr2('Tocca a tia!', 'Tocca a te!') : tr2('Tocca a ', 'Tocca a ') + M.names[nt], nt === M.me); }, 300 + delay);
  if (M.turn !== M.me && !M.online) setTimeout(caAITurn, 900 + delay);
}
/* gli imprevisti del paese: cambiano qualcosa per tutti e due (stato M o z, stessi campi) */
function caRollSurprise(S, counts) {
  const keys = Object.keys(CA_SURP), k = keys[Math.floor(Math.random() * keys.length)], ev = { k };
  if (k === 'vigile') { const q = counts[0] === counts[1] ? -1 : counts[0] > counts[1] ? 0 : 1; ev.q = q; if (q >= 0) { const u = Object.assign({}, S.uses[q]); u.build = Math.max(0, u.build - 1); S.uses = q === 0 ? [u, S.uses[1]] : [S.uses[0], u]; } }
  if (k === 'temporale') { S.storm = 2; S.wind = Math.round(Math.max(-5.5, Math.min(5.5, (S.wind || 1) * 1.8)) * 10) / 10; }
  if (k === 'cimento') S.uses = S.uses.map((u) => Object.assign({}, u, { build: u.build + 1 }));
  if (k === 'banda') { const g = ['pomodoro', 'nduja', 'cacio', 'pane'][Math.floor(Math.random() * 4)]; ev.gift = g; S.uses = S.uses.map((u) => Object.assign({}, u, { [g]: (u[g] || 0) + 1 })); }
  if (k === 'processione') S.wind = 0;
  return ev;
}
function caSurpriseShow(ev) {
  const M = CA.m, s = CA_SURP[ev.k]; if (!M || !s) return;
  const f = $('caField'); if (!f) return;
  const el = document.createElement('div'); el.className = 'casurp';
  el.innerHTML = '<span class="casic">' + s.ic + '</span><b>' + s.t + '</b><small>' + s.d + (ev.k === 'vigile' && ev.q >= 0 ? ' Tocca a ' + esc(M.names[ev.q]) + '.' : '') + (ev.gift ? ' Regalo: ' + CA_WEAP[ev.gift].ic + ' ' + CA_WEAP[ev.gift].n + '.' : '') + '</small>';
  f.appendChild(el); setTimeout(() => el.remove(), 2600);
  CA.passer = { k: ev.k, t0: CA.t }; caSnd(ev.k === 'temporale' ? 'boom' : 'cheer');
  setTimeout(() => caNd(s.nd), 900);
  caHUD();
}
/* chi passa sulla strada durante un imprevisto */
function caPasser(x, t) {
  const P0 = CA.passer; if (!P0) return;
  const dt = t - P0.t0; if (dt > 300) { CA.passer = null; return; }
  const cam = CA.cam || 0, px = cam - 80 + dt * ((CA_VW + 160) / 300), py = 470;
  x.save();
  if (P0.k === 'vigile') {
    x.fillStyle = '#FFFFFF'; x.fillRect(px - 22, py - 14, 44, 10); x.fillRect(px - 12, py - 22, 26, 9); x.fillStyle = '#1D4E9E'; x.fillRect(px - 22, py - 9, 44, 3); x.fillStyle = '#BFE3F6'; x.fillRect(px - 9, py - 20, 9, 6); x.fillRect(px + 2, py - 20, 9, 6);
    x.fillStyle = (Math.floor(t / 8) % 2) ? '#2A6FE0' : '#E2312A'; x.fillRect(px - 3, py - 26, 7, 4);
    x.fillStyle = '#1D4E9E'; x.font = 'bold 6px sans-serif'; x.textAlign = 'center'; x.fillText('VIGILI', px, py - 6.5);
    x.fillStyle = '#1A1A1A'; x.beginPath(); x.arc(px - 13, py - 3, 4, 0, Math.PI * 2); x.arc(px + 13, py - 3, 4, 0, Math.PI * 2); x.fill();
  } else if (P0.k === 'cimento') {
    x.fillStyle = '#E86F1C'; x.fillRect(px + 10, py - 22, 16, 16); x.fillStyle = '#BFE3F6'; x.fillRect(px + 18, py - 20, 6, 6);
    x.fillStyle = '#9A9A9A'; x.fillRect(px - 28, py - 9, 54, 4);
    x.save(); x.translate(px - 8, py - 17); x.rotate(-0.15); x.fillStyle = '#F2F2F2'; x.beginPath(); x.ellipse(0, 0, 18, 9, 0, 0, Math.PI * 2); x.fill(); x.strokeStyle = '#E86F1C'; x.lineWidth = 2; for (let k = 0; k < 3; k++) { const o = ((t * 0.6 + k * 12) % 36) - 18; x.beginPath(); x.moveTo(o - 3, -8); x.lineTo(o + 3, 8); x.stroke(); } x.restore();
    x.fillStyle = '#1A1A1A'; for (const wx of [-20, -4, 18]) { x.beginPath(); x.arc(px + wx, py - 3, 4, 0, Math.PI * 2); x.fill(); }
  } else if (P0.k === 'banda' || P0.k === 'processione') {
    const n = P0.k === 'banda' ? 6 : 8;
    for (let k = 0; k < n; k++) {
      const mx = px - k * 16, step = Math.sin(t * 0.3 + k) * 1.5;
      x.fillStyle = P0.k === 'banda' ? '#1D2E6E' : '#2A2A2A'; x.fillRect(mx - 3, py - 16 + step * 0.3, 6, 12); x.fillRect(mx - 3, py - 4, 2.4, 4); x.fillRect(mx + 0.6, py - 4, 2.4, 4);
      x.fillStyle = '#E2B48C'; x.beginPath(); x.arc(mx, py - 19, 3, 0, Math.PI * 2); x.fill();
      if (P0.k === 'banda') { x.fillStyle = '#1D2E6E'; x.fillRect(mx - 3.5, py - 24, 7, 3); x.fillStyle = '#E2B53A'; if (k % 2) { x.beginPath(); x.arc(mx + 5, py - 13, 3, 0, Math.PI * 2); x.fill(); } else x.fillRect(mx + 2, py - 16, 7, 2); }
      else { x.fillStyle = '#FFE7A0'; x.fillRect(mx + 3, py - 18, 1.4, 6); x.fillStyle = 'rgba(255,200,80,0.8)'; x.beginPath(); x.arc(mx + 3.7, py - 19, 1.4, 0, Math.PI * 2); x.fill(); }
    }
    if (P0.k === 'processione') { const sx = px - 40; x.fillStyle = '#7A5230'; x.fillRect(sx - 14, py - 24, 28, 4); x.fillStyle = '#2E5AA8'; x.beginPath(); x.moveTo(sx - 5, py - 24); x.lineTo(sx - 3, py - 40); x.lineTo(sx + 3, py - 40); x.lineTo(sx + 5, py - 24); x.closePath(); x.fill(); x.fillStyle = '#F2E2C8'; x.beginPath(); x.arc(sx, py - 43, 3.5, 0, Math.PI * 2); x.fill(); x.strokeStyle = '#F2C94C'; x.lineWidth = 1; x.beginPath(); x.arc(sx, py - 43, 5.5, 0, Math.PI * 2); x.stroke(); }
    if (P0.k === 'banda') { x.fillStyle = '#FFFFFF'; x.font = 'bold 10px sans-serif'; x.textAlign = 'center'; x.fillText('♪ ♫', px - 40, py - 34 + Math.sin(t * 0.2) * 3); }
  }
  x.restore();
}
/* il Signor ’Nduja fa la telecronaca, in basso a sinistra */
function caNd(text) {
  const f = $('caField'); if (!f || typeof NDUJA_SVG === 'undefined') return;
  const old = f.querySelector('.cand'); if (old) old.remove();
  const el = document.createElement('div'); el.className = 'cand';
  el.innerHTML = '<span class="candf">' + NDUJA_SVG + '</span><span class="candb">' + esc(text) + '</span>';
  f.appendChild(el); setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 350); }, 3600);
}

function caAITurn() {
  const M = CA.m; if (!M || M.over || M.online || M.turn === M.me || view !== 'vCasa') return;
  M.pose[M.turn] = 'aim'; caHUD();
  setTimeout(() => {
    if (CA.m !== M || M.over) return;
    const p = M.turn, act = caAI(M.g[0], M.g[1], M.wind, p, M.uses[p], M.foe.sk);
    if (Math.random() < 0.6 && act.w !== 'build') { const own = M.foe && CA_FOLK_LINES[M.foe.id]; caSay(p, own && Math.random() < 0.5 ? tr2(...own[Math.floor(Math.random() * own.length)]) : caLine('throw')); }
    setTimeout(() => { if (CA.m !== M) return; caPlay(p, act, (res) => caNextTurn(p, res)); }, 500);
  }, 700);
}
function caHUD() {
  const M = CA.m, h = $('caHud'); if (!h || !M) return;
  const n = [caCount(M.g[0]), caCount(M.g[1])];
  const side = (q) => '<div class="caside q' + q + (M.turn === q && !M.over ? ' turn' : '') + '"><b>' + esc(M.names[q]) + (q === M.me ? ' <em>tu</em>' : '') + '</b><span class="cabricks">🧱 ' + n[q] + ' <small>' + caFloors(M.g[q]) + ' piani</small></span><span class="cadots">' + Array.from({ length: CA_TURNS }, (_, k) => '<i class="' + (k < M.turns[q] ? 'u' : '') + '"></i>').join('') + '</span></div>';
  h.innerHTML = side(0) + '<div class="cawind"><small>Vento</small><b>' + (M.wind > 0.05 ? '→' : M.wind < -0.05 ? '←' : '·') + ' ' + Math.abs(M.wind).toFixed(1) + '</b></div>' + side(1) + '<div class="cabar" aria-hidden="true"><i style="width:' + Math.round(n[0] / Math.max(1, n[0] + n[1]) * 100) + '%"></i></div>';
  const ds = $('caDesc'); if (ds) ds.textContent = CA_WDESC[M.weap] || '';
  const my = M.turn === M.me && !M.anim && !M.over && !(M.online && OL.busy);
  const u = M.uses[Math.max(0, M.me)] || caUses();
  const wb = $('caWeap');
  if (wb) wb.innerHTML = Object.keys(CA_WEAP).map((k) => '<button data-caw="' + k + '" aria-pressed="' + (M.weap === k) + '"' + ((u[k] || 0) <= 0 ? ' disabled' : '') + '><span>' + CA_WEAP[k].ic + '</span><b>' + CA_WEAP[k].n + '</b><small>' + (CA_WEAP[k].uses >= 99 ? '∞' : u[k]) + '</small></button>').join('') + '<button class="cabuild" data-caw="build"' + (u.build > 0 && my ? '' : ' disabled') + '><span>🏗️</span><b>Alza un piano</b><small>' + u.build + '</small></button>';
  const pk = $('caPeek'); if (pk) { pk.textContent = CA.peek ? '👀 Torna alla tua casa' : '👀 Guarda la casa dell’altro'; pk.hidden = M.over || !my; }
  const t = $('caMsg');
  if (t) t.innerHTML = M.over ? 'Partita finita' : M.anim ? '…' : my ? '<em>Tocca a te!</em> Tira indietro il dito sul campo e lascia.' : M.turn === M.me ? 'Aspetta…' : 'Tocca a ' + esc(M.names[M.turn]) + '…' + (M.online ? ' <span class="oltimer" id="olTimer"></span>' : '');
  if (M.online) { const tm = $('olTimer'); if (tm) tm.textContent = ''; }
}
function caEnd() {
  const M = CA.m; if (!M || M.over) return; M.over = true; caHUD();
  if (M.online) return;
  const n = [caCount(M.g[0]), caCount(M.g[1])], me = M.me, won = n[me] > n[1 - me], tie = n[me] === n[1 - me];
  const C = caData();
  if (won) C.w++; else if (tie) C.d++; else C.l++;
  C.best = Math.max(C.best || 0, n[me]);
  let xp = won ? 120 : tie ? 50 : 25, coins = won ? 60 + (M.lv || 0) * 20 : tie ? 25 : 10, unlock = '';
  let stars = 0;
  if (won && M.mode === 'camp') { const ratio = n[me] / Math.max(1, M.start[me]); stars = ratio >= 0.85 ? 3 : ratio >= 0.6 ? 2 : 1; C.stars = C.stars || {}; C.stars[M.foe.id] = Math.max(C.stars[M.foe.id] || 0, stars); unlock = '<div class="castars">' + '★★★'.slice(0, stars) + '<i>' + '★★★'.slice(stars) + '</i><small>' + (stars === 3 ? 'Casa quasi intatta!' : stars === 2 ? 'Qualche mattone perso' : 'Vinta per un pelo') + '</small></div>'; }
  if (won && M.mode === 'camp' && M.lv === C.lv && C.lv < CA_FOLK.length) {
    const d = CA_DECOR[C.lv]; if (d && !C.decor.includes(d.id)) { C.decor.push(d.id); unlock += '<div class="caunlock"><b>Sfizio nuovo per la casa!</b><span>' + d.n + '</span></div>'; }
    C.lv++;
  }
  eco().carlini += coins; gainXp(xp);
  const chest = grantChest(won);
  if (typeof track === 'function') track('game_end', { game: 'casa', won });
  save();
  M.pose[me] = won ? 'cheer' : 'hit'; M.pose[1 - me] = won ? 'hit' : 'cheer';
  caSay(won ? me : 1 - me, caLine('win'), 3000);
  caConfetti(won ? me : 1 - me); if (won) caSnd('cheer');
  setTimeout(() => {
    overlay('<div class="caend"><h2>' + (won ? 'La casa più grande è la tua!' : tie ? 'Pari e patta!' : 'Ha vinto ' + esc(M.names[1 - me])) + '</h2><div class="caendn"><span><small>' + esc(M.names[0]) + '</small><b>🧱 ' + n[0] + '</b></span><i>–</i><span><small>' + esc(M.names[1]) + '</small><b>🧱 ' + n[1] + '</b></span></div>' + unlock +
      '<div class="gain"><div class="xp">+' + xp + ' XP · <i class="ico coin"></i>' + coins + '</div>' + chest + '</div><button class="btn" id="caNext">' + (M.mode === 'camp' ? 'Torna ai compari' : 'Un’altra partita') + '</button><button class="btn alt" id="caOut">Menu</button></div>');
    $('caNext').onclick = () => { $('layer').innerHTML = ''; CA.m = null; CA.screen = M.mode === 'camp' ? 'camp' : 'menu'; if (M.mode !== 'camp') { caQuick(); return; } caRender(); };
    $('caOut').onclick = () => { $('layer').innerHTML = ''; CA.m = null; CA.screen = 'menu'; caRender(); };
  }, 1600);
}
/* coriandoli e il bouquet della sposa sulla casa che ha vinto */
function caConfetti(q) {
  const cx = CA_X0[q] + CA_COLS * CA_CW / 2, top = CA_GY - caFloors(CA.m.g[q]) * CA_CH;
  const cols = ['#E2312A', '#F2C94C', '#2A8FD6', '#3E8A3A', '#FFFFFF', '#E86F9A'];
  for (let k = 0; k < 90; k++) CA.parts.push({ k: 'chip', x: cx + (Math.random() - 0.5) * 60, y: top - 20, vx: (Math.random() - 0.5) * 5, vy: -2 - Math.random() * 5, r: 1.6, a: Math.random() * 6, va: (Math.random() - 0.5) * 0.5, life: 120, max: 120, g: 0.08, c: cols[k % cols.length] });
  CA.cheer = CA.t + 200;
  caText(cx, top - 50, '♥ Viva i sposi! ♥', '#FFB0C8', true);
}
function caQuick() { const f = CA_FOLK[Math.floor(Math.random() * CA_FOLK.length)]; const run = () => caMatchStart({ mode: 'quick', foe: f }); typeof energyGate === 'function' ? energyGate(run) : run(); }

/* ---------- tocco: si tira indietro il dito ---------- */
function caPt(e) { const r = CA.cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / CA.css + (CA.cam || 0), y: (e.clientY - r.top) / CA.css }; }
function caCanAct() { const M = CA.m; return M && !M.over && !M.anim && M.turn === M.me && !(M.online && (OL.busy || !caOnlineCanAct())); }
function caDown(e) { if (!caCanAct()) return; e.preventDefault(); if (CA.peek) { CA.peek = false; caHUD(); } const p = caPt(e); CA.aim = { sx: p.x, sy: p.y, ang: 0, pow: 0 }; CA.m.pose[CA.m.me] = 'aim'; try { CA.cv.setPointerCapture(e.pointerId); } catch (er) { /* niente */ } }
function caMove(e) {
  const A = CA.aim; if (!A) return;
  const p = caPt(e), dx = A.sx - p.x, dy = A.sy - p.y, d = Math.sqrt(dx * dx + dy * dy);
  if (d < 6) { A.pow = 0; return; }
  let ang = Math.atan2(dy, dx);
  // si tira sempre verso l'alto
  if (dy > 0) ang = Math.atan2(-0.01, dx);
  A.ang = ang; A.pow = Math.min(1, d / CA_DRAG);
}
function caUp() {
  const A = CA.aim, M = CA.m; if (!A || !M) return;
  CA.aim = null; M.pose[M.me] = 'idle';
  if (A.pow < 0.08) return;
  const act = caShotVec(M.weap, A.ang, A.pow);
  caAct(act);
}
function caAct(act) {
  const M = CA.m;
  if (act.w !== 'build' && CA_WEAP[act.w].uses < 99 && M.uses[M.me][act.w] <= 0) return;
  if (M.online) { caOnlineAct(act); return; }
  const p = M.turn;
  if (Math.random() < 0.4 && act.w !== 'build') caSay(p, caLine('throw'));
  caPlay(p, act, (res) => { if (M.weap !== 'mattone' && M.uses[M.me][M.weap] <= 0) M.weap = 'mattone'; caNextTurn(p, res); });
  caHUD();
}

/* ---------- schermate ---------- */
function caPortrait(look, size) {
  const c = document.createElement('canvas'), s = size || 64, dpr = 2; c.width = s * dpr; c.height = s * dpr;
  const x = c.getContext('2d'); x.scale(dpr * s / 64, dpr * s / 64);
  const g = x.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, '#FCE3B0'); g.addColorStop(1, '#F2B880'); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  x.save(); x.translate(26, 104); x.scale(1.35, 1.35); caDrawMan(x, { x: 0, y: 0 }, look, 1, 'idle', 0); x.restore();
  return c.toDataURL();
}
let CA_PORTRAITS = null;
function caRender() {
  const box = $('caBox'); if (!box) return;
  cancelAnimationFrame(CA.raf);
  const C = caData();
  $('vCasa').classList.toggle('caplaying', CA.screen === 'match');
  if (!CA_PORTRAITS) { CA_PORTRAITS = { me: caPortrait(CA_ME_LOOK) }; for (const f of CA_FOLK) CA_PORTRAITS[f.id] = caPortrait(f); }
  if (CA.screen === 'match' && CA.m) {
    box.innerHTML = '<div class="cahud" id="caHud"></div><div class="cafield" id="caField"><canvas id="caCv" aria-label="I due cantieri"></canvas></div><div class="camsg" id="caMsg"></div><button class="capeek" id="caPeek" data-capeek="1" hidden></button><div class="caweap" id="caWeap"></div><div class="cadesc" id="caDesc"></div>' + (CA.m.online ? '<div class="emotes">' + EMOTES.map((tx, k) => '<button class="emo" data-caemo="' + k + '">' + tr(tx) + '</button>').join('') + '</div><button class="btn small take" id="olClaim" data-caclaim="1" hidden>L’avversario non risponde: vinci a tavolino</button>' : '');
    CA.cv = $('caCv');
    CA.cv.addEventListener('pointerdown', caDown); CA.cv.addEventListener('pointermove', caMove); CA.cv.addEventListener('pointerup', caUp);
    CA.cv.addEventListener('pointercancel', () => { CA.aim = null; });
    requestAnimationFrame(() => { caFit(); caDraw(); caLoop(); });
    caHUD();
    return;
  }
  if (CA.screen === 'camp') {
    box.innerHTML = '<button class="czback" data-ca="menu">◀ Indietro</button><h3 class="czh">I compari del paese</h3><p class="cap">Batti un compare alla volta: a ogni vittoria la tua casa si guadagna uno sfizio nuovo.</p><div class="cafolk">' + CA_FOLK.map((f, k) => {
      const st = k < C.lv ? 'done' : k === C.lv ? 'next' : 'lock', d = CA_DECOR[k];
      const TW = CA_TOWN[f.id], stv = (C.stars || {})[f.id] || 0;
      return '<button class="cafk ' + st + '" data-cafoe="' + k + '"' + (st === 'lock' ? ' disabled' : '') + '><img src="' + CA_PORTRAITS[f.id] + '" alt=""><span><b>' + f.n + (stv ? ' <i class="cafst">' + '★★★'.slice(0, stv) + '<s>' + '★★★'.slice(stv) + '</s></i>' : '') + '</b><small>' + TW.town + ', ' + TW.place + ' · ' + f.rows + ' piani</small><small class="cadiff">Difficoltà <i>' + '●●●●●'.slice(0, TW.stars) + '<s>' + '●●●●●'.slice(TW.stars) + '</s></i> · vento fino a ' + TW.wmax.toFixed(1) + '</small><em>' + (st === 'done' ? '✓ battuto · ' : st === 'lock' ? '🔒 ' : 'Premio: ') + d.n + '</em></span>' + (st === 'next' ? '<i class="cago">Sfida ▶</i>' : st === 'done' ? '<i class="cago alt">Rivincita</i>' : '') + '</button>';
    }).join('') + '</div>';
    return;
  }
  if (CA.screen === 'decor') {
    box.innerHTML = '<button class="czback" data-ca="menu">◀ Indietro</button><h3 class="czh">Gli sfizi della casa</h3><div class="cadecor">' + CA_DECOR.map((d, k) => '<div class="' + (C.decor.includes(d.id) ? 'got' : '') + '"><b>' + (C.decor.includes(d.id) ? '✓' : '🔒') + '</b><span>' + d.n + '<small>' + (C.decor.includes(d.id) ? 'sulla tua casa in ogni partita' : 'batti ' + CA_FOLK[k].n) + '</small></span></div>').join('') + '</div>';
    return;
  }
  box.innerHTML = '<div class="cahero"><canvas id="caHeroCv" aria-hidden="true"></canvas><div class="cahtx"><h3>A Casa da Figghia</h3><p>Chi fa la casa più grande pa’ figghia chi si marita?</p></div></div>' +
    '<div class="czmodes"><button class="czmode camp" data-ca="camp"><span class="czmi">🏠</span><b>Sfida i compari</b><small>' + (C.lv < CA_FOLK.length ? 'Prossimo: ' + CA_FOLK[C.lv].n + ' da ' + CA_FOLK[C.lv].town : 'Li hai battuti tutti! Rivincite libere') + '</small><img class="cafkmini" src="' + CA_PORTRAITS[CA_FOLK[Math.min(C.lv, CA_FOLK.length - 1)].id] + '" alt=""></button>' +
    '<button class="czmode" data-ca="quick"><span class="czmi">🧱</span><b>Partita veloce</b><small>Contro un compare a caso</small></button>' +
    '<button class="czmode ol" data-ca="online"><span class="czmi">🌐</span><b>Online</b><small>Contro una persona o sfida un amico</small></button>' +
    '<button class="czmode deco" data-ca="decor"><span class="czmi">🦁</span><b>Sfizi della casa</b><small>' + C.decor.length + ' di ' + CA_DECOR.length + ' sbloccati</small></button></div>' +
    '<div class="czstats"><span><b>' + C.w + '</b>vinte</span><span><b>' + C.d + '</b>pari</span><span><b>' + C.l + '</b>perse</span><span><b>' + (C.best || 0) + '</b>mattoni record</span><span><b>' + C.lv + '/' + CA_FOLK.length + '</b>compari</span></div>';
  requestAnimationFrame(caHero);
}
/* la scena nel menu: le due case, i compari che litigano */
function caHero() {
  const cv = $('caHeroCv'); if (!cv) return;
  const w = cv.parentNode.clientWidth, h = Math.round(w * 0.62), dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.style.width = w + 'px'; cv.style.height = h + 'px'; cv.width = w * dpr; cv.height = h * dpr;
  const x = cv.getContext('2d');
  // si inquadra il pezzo di campo con le due case vicine al centro (scorciato)
  const vw = 800, sc = w * dpr / vw, vx = (CA_W - vw) / 2, vh = h * dpr / sc, vy = CA_H - vh - 8;
  const g0 = caNewGrid(8), g1 = caNewGrid(7); g1[6 * CA_COLS + 4] = 0; g1[6 * CA_COLS + 5] = 0; g1[3 * CA_COLS + 6] = 21; caCollapse(g1);
  const bg = caBackground(sc);
  x.drawImage(bg, -vx * sc, -vy * sc);
  x.setTransform(sc, 0, 0, sc, -vx * sc, -vy * sc);
  // le case nel menu stanno più vicine: si spostano solo per il disegno
  const shift = [vx + 60 - CA_X0[0], vx + vw - 60 - CA_COLS * CA_CW - CA_X0[1]];
  caFlag(x, CA_W / 2, CA_GY - 30, 1.6, 10);
  x.save(); x.translate(shift[0], 0); caDrawHouse(x, 0, g0, null, caData().decor, false); caDrawMan(x, caManPos(g0, 0), CA_ME_LOOK, 1, 'throw', 0); caBetoniera(x, CA_X0[0] + CA_COLS * CA_CW + 50, CA_GY - 2, 10); x.restore();
  x.save(); x.translate(shift[1], 0); caDrawHouse(x, 1, g1, null, [], true); caDrawMan(x, caManPos(g1, 1), CA_FOLK[0], -1, 'hit', 0); x.restore();
  caDrawShot(x, 'pomodoro', CA_W / 2 - 60, 290, 3); caDrawShot(x, 'mattone', CA_W / 2 + 40, 260, 1);
}
function caClick(e) {
  const t = e.target;
  const b = t.closest('[data-ca]');
  if (b) {
    const a = b.dataset.ca;
    if (a === 'menu' || a === 'camp' || a === 'decor') { CA.screen = a; caRender(); return; }
    if (a === 'quick') { caQuick(); return; }
    if (a === 'online') { OL.game = 'casa'; go('vOnline'); return; }
  }
  const f = t.closest('[data-cafoe]');
  if (f) { const k = +f.dataset.cafoe, run = () => caMatchStart({ mode: 'camp', foe: CA_FOLK[k], lv: k }); typeof energyGate === 'function' ? energyGate(run) : run(); return; }
  const w = t.closest('[data-caw]');
  if (w && CA.m) {
    const k = w.dataset.caw;
    if (k === 'build') { if (caCanAct() && CA.m.uses[CA.m.me].build > 0) caAct({ w: 'build' }); return; }
    CA.m.weap = k; caHUD(); return;
  }
  const em = t.closest('[data-caemo]'); if (em && typeof sendEmote === 'function') { sendEmote(+em.dataset.caemo); return; }
  if (t.closest('[data-capeek]')) { CA.peek = !CA.peek; caHUD(); return; }
  if (t.closest('[data-caclaim]') && typeof claimWin === 'function') claimWin();
}
function caQuit() {
  const M = CA.m;
  if (!M || M.over || CA.screen !== 'match') { CA.m = null; CA.screen = 'menu'; go('vHome'); return; }
  overlay('<h2>Lasci il cantiere?</h2><p>' + (M.online ? 'Se esci adesso la partita la vince l’avversario.' : 'Questa partita non conta.') + '</p><button class="btn" id="caQY">Esco</button><button class="btn alt" id="caQN">Resto</button>');
  $('caQY').onclick = () => { $('layer').innerHTML = ''; cancelAnimationFrame(CA.raf); if (M.online) { olLeave(); CA.m = null; CA.screen = 'menu'; go('vOnline'); return; } CA.m = null; CA.screen = 'menu'; caRender(); };
  $('caQN').onclick = () => { $('layer').innerHTML = ''; };
}
function caOpen() { if (!ndSeen('casa')) showNduja('casa'); caRender(); }
function caCard() {
  const C = caData();
  return '<button class="advc av av-casa" data-go="vCasa"><span class="avspr cacardpic"><span class="cahouse"></span></span><b>A Casa da Figghia</b><small>' + (C.w + C.l + C.d ? C.lv + ' compari battuti su ' + CA_FOLK.length : 'Mattoni, ’nduja e caciocavalli contro il compare') + '</small>' + (C.w + C.d + C.l === 0 ? '<span class="cznew">Nuovo!</span>' : '') + '</button>';
}

/* ---------- online ---------- */
/* stato: ca = { g0, g1, f0, f1 (prima del lancio), wind, uses: [u0, u1], turns: [0,0], stun: [0,0], sauce } */
function caDeal(st) {
  st.ca = { g0: caNewGrid(8), g1: caNewGrid(8), f0: null, f1: null, wind: caNewWind(3), uses: [caUses(), caUses()], turns: [0, 0], stun: [0, 0], tk: [1, 1], storm: 0, sp: null, scene: ['mare', 'corso', 'scavi', 'borgo', 'rupe'][Math.floor(Math.random() * 5)] };
  st.total = [caCount(st.ca.g0), caCount(st.ca.g1)];
  st.turn = 1 - st.dealer;
}
function applyCasa(st, p, act) {
  const z = st.ca;
  z.f0 = z.g0.slice(); z.f1 = z.g1.slice();
  let stun = -1;
  const u = Object.assign({}, z.uses[p]);
  if (act.w === 'build') { if (u.build > 0) { caBuild(p === 0 ? z.g0 : z.g1); u.build--; } }
  else if (act.w !== 'skip') {
    if (CA_WEAP[act.w].uses < 99) u[act.w] = Math.max(0, (u[act.w] || 0) - 1);
    const R = caSim(z.g0, z.g1, z.wind, p, act, z.tk || [1, 1]);
    z.g0 = R.g[0]; z.g1 = R.g[1]; stun = R.stun;
    if (R.tank >= 0) { z.tk = (z.tk || [1, 1]).slice(); z.tk[R.tank] = 0; if (R.tank === p) u.build = Math.max(0, (u.build || 0) - 1); else { const uu = Object.assign({}, z.uses[R.tank]); uu.build = Math.max(0, (uu.build || 0) - 1); z.uses = R.tank === 0 ? [uu, z.uses[1]] : [z.uses[0], uu]; } }
  }
  z.uses = p === 0 ? [u, z.uses[1]] : [z.uses[0], u];
  const turns = z.turns.slice(), stuns = z.stun.slice();
  turns[p]++;
  if (stun >= 0) stuns[stun] = 1;
  const wind0 = z.wind;
  z.wind = Math.round(caNewWind(3) * ((z.storm || 0) > 0 ? 1.8 : 1) * 10) / 10; if (z.storm > 0) z.storm--;
  let nt = 1 - p;
  if (stuns[nt]) { stuns[nt] = 0; turns[nt]++; nt = p; }
  z.turns = turns; z.stun = stuns; st.turn = nt;
  st.total = [caCount(z.g0), caCount(z.g1)];
  const tot = turns[0] + turns[1];
  z.sp = null;
  if (tot >= 3 && tot % 3 === 0 && !(turns[0] >= CA_TURNS && turns[1] >= CA_TURNS) && Math.random() < 0.6) { const ev = caRollSurprise(z, st.total); ev.n = (st.lastMove ? st.lastMove.n : 0) + 1; z.sp = ev; }
  st.lastMove = { p, n: (st.lastMove ? st.lastMove.n : 0) + 1, act, wind: wind0, stun, card: '', took: [] };
  if (st.total[0] < 6 || st.total[1] < 6 || (turns[0] >= CA_TURNS && turns[1] >= CA_TURNS)) {
    st.status = 'done'; st.endReason = 'punti'; st.winner = st.total[0] > st.total[1] ? 0 : st.total[1] > st.total[0] ? 1 : 2;
  }
  return st;
}
function caOnlineCanAct() { const d = OL.room; return !!(d && d.status === 'playing' && d.turn === meIdx()); }
function caOnlineView() {
  const d = OL.room, me = meIdx();
  CA.screen = 'match'; CA.parts = []; CA.splats = []; CA.aim = null; CA.cam = null; CA.peek = false;
  const z = d && d.ca;
  CA.m = { g: z ? [z.g0.slice(), z.g1.slice()] : [caNewGrid(8), caNewGrid(8)], wind: z ? z.wind : 0, turn: d ? d.turn : 0, turns: z ? z.turns.slice() : [0, 0], stun: z ? z.stun.slice() : [0, 0], uses: z ? z.uses.map((u) => Object.assign({}, u)) : [caUses(), caUses()],
    me, mode: 'online', names: d ? d.names.slice(0, 2) : ['', ''], looks: [CA_ME_LOOK, CA_FOLK[0]], decor: [me === 0 ? caData().decor.slice() : [], me === 1 ? caData().decor.slice() : []], weap: 'mattone', anim: null, over: false, online: true, pose: ['idle', 'idle'], hurt: [0, 0], ready: !!(z && me >= 0) };
  const nm = d ? (d.names[1 - Math.max(0, me)] || '') : ''; let hh = 0; for (const ch of nm) hh = (hh * 31 + ch.charCodeAt(0)) >>> 0;
  const oppLook = CA_FOLK[hh % CA_FOLK.length];
  CA.m.looks = me === 1 ? [oppLook, CA_ME_LOOK] : [CA_ME_LOOK, oppLook];
  CA.m.tod = ['giorno', 'tramonto', 'sera'][((d && d.code ? d.code.charCodeAt(0) : 0) + hh) % 3];
  CA.m.scene = (z && z.scene) || 'mare'; CA.m.tank = (z && z.tk) ? z.tk.slice() : [1, 1]; CA.m.storm = (z && z.storm) || 0; CA.m.style = ['rustico', 'rustico']; CA.m.trail = [null, null]; CA.m.rubble = [0, 0]; CA.m.texts = [];
  if (view !== 'vCasa') go('vCasa');
  caRender();
}
function caOnlineRender(d) {
  if (!CA.m || !CA.m.online || view !== 'vCasa' || !CA.m.ready || CA.m.me !== meIdx()) { caOnlineView(); return; }
  if (!CA.m.anim) caOnlineSync(d);
}
function caOnlineSync(d) {
  const M = CA.m; if (!M || !M.online || !d.ca) return;
  const z = d.ca;
  M.g = [z.g0.slice(), z.g1.slice()]; M.wind = z.wind; M.turn = d.turn; M.tank = (z.tk || [1, 1]).slice(); M.storm = z.storm || 0; M.turns = z.turns.slice(); M.stun = z.stun.slice(); M.uses = z.uses.map((u) => Object.assign({}, u)); M.names = d.names.slice(0, 2);
  if (M.weap !== 'mattone' && (M.uses[M.me][M.weap] || 0) <= 0) M.weap = 'mattone';
  caHUD();
}
function caOnlineMove(d, prev) {
  const M = CA.m, m = d.lastMove; if (!M || !M.online || !m) return;
  if (OL.caLocal === m.n) { OL.caLocal = null; if (!M.anim) caOnlineSync(d); else OL.caAfter = d; return; }
  const z = d.ca;
  M.g = [(z.f0 || z.g0).slice(), (z.f1 || z.g1).slice()]; M.wind = m.wind;
  OL.animating = true;
  caPlay(m.p, m.act, () => { OL.animating = false; const dd = OL.room || d; caOnlineSync(dd); if (dd.ca && dd.ca.sp && dd.ca.sp.n === m.n) caSurpriseShow(dd.ca.sp); if (OL.endPending) { OL.endPending = false; endOnline(); } });
}
async function caOnlineAct(act) {
  if (OL.busy) return;
  const M = CA.m, d0 = OL.room, n = (d0.lastMove ? d0.lastMove.n : 0) + 1;
  OL.busy = true; OL.caLocal = n; OL.caAfter = null; OL.animating = true;
  caPlay(M.me, act, () => { OL.animating = false; const d = OL.caAfter || OL.room; OL.caAfter = null; if (d) { caOnlineSync(d); if (d.ca && d.ca.sp && d.lastMove && d.ca.sp.n === d.lastMove.n && d.lastMove.p === M.me) caSurpriseShow(d.ca.sp); } if (OL.endPending) { OL.endPending = false; endOnline(); } });
  caHUD();
  try { await caSend(act); }
  catch (e) { OL.caLocal = null; flash(e.message === 'turno' ? 'Non è il tuo turno' : 'Errore di rete'); M.anim = null; OL.animating = false; if (OL.room) caOnlineSync(OL.room); }
  OL.busy = false;
}
async function caSend(act) {
  const ref = FB.doc(OL.db, 'rooms', OL.rid), me = meIdx();
  await FB.runTransaction(OL.db, async (tx) => {
    const s = await tx.get(ref); const d = s.data();
    if (!d || d.status !== 'playing' || d.turn !== me) throw new Error('turno');
    const st = cloneState(d);
    applyCasa(st, me, act);
    tx.update(ref, Object.assign(st, { v: d.v + 1, lastMoveAt: FB.serverTimestamp() }));
  });
}
function caTick(d, me, el) {
  const t = $('olTimer');
  if (t) { const left = Math.max(0, Math.ceil((TURN_MS - el) / 1000)); t.textContent = left + 's'; t.classList.toggle('low', left <= 10); }
  if (d.turn === me && el > TURN_MS && !OL.busy && !OL.animating && !(CA.m && CA.m.anim)) { OL.busy = true; caSend({ w: 'skip' }).catch(() => {}).then(() => { OL.busy = false; }); }
  const cl = $('olClaim'); if (cl) cl.hidden = !(d.turn !== me && el > CLAIM_MS && Date.now() - tms(d.lastMoveAt) > CLAIM_MS + 2000);
}

/* ---------- la schermata nel gioco ---------- */
(() => {
  if (!$('vCasa')) {
    const s = document.createElement('section'); s.className = 'view'; s.id = 'vCasa'; s.hidden = true;
    s.innerHTML = '<div class="topbar"><h2>A Casa da Figghia</h2><span class="tbr"><button class="btn ghost small" id="caRules">Regole</button><button class="btn ghost small" id="caHome">Menu</button></span></div><div class="czbox cabox" id="caBox"></div>';
    $('vHome').parentNode.insertBefore(s, $('vHome').nextSibling);
    s.addEventListener('click', caClick);
    $('caRules').onclick = () => { if (!ND.open) showNduja('casa'); };
    $('caHome').onclick = caQuit;
    window.addEventListener('resize', () => { if (view === 'vCasa' && CA.screen === 'match') caFit(); });
  }
  const oldGo = go;
  go = function (v) {
    oldGo(v);
    $('vCasa').hidden = v !== 'vCasa';
    if (v !== 'vCasa') cancelAnimationFrame(CA.raf);
    if (v === 'vCasa' && !(CA.m && CA.m.online && !CA.m.over && OL.rid)) { if (!CA.m || CA.m.over || CA.m.online) { CA.m = null; if (CA.screen === 'match') CA.screen = 'menu'; } caOpen(); }
  };
})();
