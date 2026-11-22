/* ================= U BORGU: rimetti in piedi il paese abbandonato =================
   Visto dall'alto (isometrico). Si costruiscono stradine, mura, torri, case, municipio, chiesa, fontana, forno, frantoio...
   I carlini investiti restano: ogni edificio produce col tempo, anche ad app chiusa. I lavori durano tempo vero;
   un video facoltativo li finisce subito. Gli edifici che producono devono toccare una stradina. */

let BG_N = 16;   // lato del terreno: si allarga comprando terra (16 → 20 → 24 → 28)
const BG_TW = 64, BG_TH = 32;
// allargamenti: lato nuovo, costo in carlini, paesani che servono
const BG_EXP = [{ n: 20, c: 4000, pop: 30 }, { n: 24, c: 12000, pop: 70 }, { n: 28, c: 30000, pop: 120 }];
const BG = { cv: null, ctx: null, cam: { x: 0, y: 220, z: 1 }, sel: null, place: null, move: null, sheet: null, tab: 'strade', t: 0, raf: 0, spr: {}, walkers: [], birds: [], pops: [], ptr: new Map(), drag: null, dpr: 1, w: 0, h: 0, ground: null, gkey: '', last: 0, msg: '' };
const bgIso = (x, y) => [(x - y) * BG_TW / 2, (x + y) * BG_TH / 2];

/* ---------- catalogo ---------- */
// c = costo, t = minuti di lavoro, p = carlini all'ora, pop = paesani, b = bellezza, need = requisiti
const BG_CAT = {
  strada: { n: 'Stradina', g: 'strade', w: 1, d: 1, c: 5, t: 0, d1: 'Ciottoli di fiume. Gli edifici che producono devono toccare una stradina.' },
  mura: { n: 'Mura', g: 'strade', w: 1, d: 1, c: 15, t: 0, b: 1, d1: 'Pietra su pietra: si uniscono da sole ai pezzi vicini.' },
  torre: { n: 'Torre', g: 'strade', w: 1, d: 1, c: 120, t: 5, b: 6, d1: 'Torre di guardia con i merli, si attacca alle mura.' },
  porta: { n: 'Porta del borgo', g: 'strade', w: 1, d: 1, c: 150, t: 10, b: 8, d1: 'L’ingresso ad arco nelle mura.', one: true },
  casa: { n: 'Casa', g: 'case', w: 1, d: 1, c: 150, t: 5, p: 6, pop: 3, d1: 'Due piani, persiane verdi e gerani al balcone.' },
  palazzo: { n: 'Palazzo signorile', g: 'case', w: 2, d: 2, c: 3000, t: 120, p: 110, pop: 10, b: 10, need: { pop: 40, mun: 2 }, d1: 'Tre piani, portale in pietra e stemma di famiglia.' },
  municipio: { n: 'Municipio', g: 'monumenti', w: 2, d: 2, c: 800, t: 30, p: 20, b: 12, one: true, d1: 'Il cuore del borgo: il suo livello sblocca i livelli degli altri edifici.' },
  chiesa: { n: 'Chiesa', g: 'monumenti', w: 2, d: 2, c: 2500, t: 240, b: 45, one: true, need: { pop: 25, mun: 1 }, d1: 'Con il campanile: porta turisti e tanta bellezza.' },
  fontana: { n: 'Fontana', g: 'decoro', w: 1, d: 1, c: 200, t: 10, b: 10, d1: 'Acqua fresca di montagna in pietra lavorata.' },
  piazza: { n: 'Piazza', g: 'decoro', w: 2, d: 2, c: 500, t: 20, b: 25, need: { pop: 10 }, d1: 'Lastricata, con panchine, lampioni e un albero al centro.' },
  forno: { n: 'Forno', g: 'botteghe', w: 1, d: 1, c: 350, t: 15, p: 20, need: { pop: 6 }, d1: 'Forno a legna con la cupola: pane caldo ogni mattina.' },
  bottega: { n: 'Bottega', g: 'botteghe', w: 1, d: 1, c: 400, t: 20, p: 24, need: { pop: 9 }, d1: 'Tenda a strisce e cassette di frutta davanti.' },
  osteria: { n: 'Osteria', g: 'botteghe', w: 1, d: 1, c: 600, t: 30, p: 34, b: 4, need: { pop: 15 }, d1: 'Pergolato con la vite e i tavolini fuori.' },
  frantoio: { n: 'Frantoio', g: 'botteghe', w: 2, d: 2, c: 1500, t: 90, p: 85, need: { pop: 20, mun: 1 }, d1: 'La macina di pietra per l’olio. Ogni ulivo vicino aggiunge produzione.' },
  ulivo: { n: 'Ulivo', g: 'decoro', w: 1, d: 1, c: 30, t: 0, b: 2, d1: 'Ulivo secolare. Vicino al frantoio rende di più.' },
  cipresso: { n: 'Cipresso', g: 'decoro', w: 1, d: 1, c: 25, t: 0, b: 2, d1: 'Slanciato e verde scuro.' },
  orto: { n: 'Orto', g: 'decoro', w: 1, d: 1, c: 60, t: 2, p: 3, d1: 'Pomodori, peperoncini e la staccionata.' },
  giardino: { n: 'Giardino fiorito', g: 'decoro', w: 1, d: 1, c: 80, t: 2, b: 5, d1: 'Bouganville, rose e un vaso di basilico.' },
  edicola: { n: 'Edicola votiva', g: 'decoro', w: 1, d: 1, c: 100, t: 5, b: 6, d1: 'La Madonnina con i fiori freschi.' },
  lampione: { n: 'Lampione', g: 'decoro', w: 1, d: 1, c: 40, t: 0, b: 2, d1: 'Si accende quando fa sera.' },
};
// 1.3.9: tutto costa il triplo e un rudere costa almeno 250 carlini da restaurare
const BG_CMUL = 3, BG_RUIN_MIN = 250;
for (const k in BG_CAT) BG_CAT[k].c *= BG_CMUL;
const BG_TABS = [['strade', 'Strade'], ['case', 'Case'], ['botteghe', 'Botteghe'], ['monumenti', 'Monumenti'], ['decoro', 'Decoro']];
const BG_PROD = ['casa', 'palazzo', 'municipio', 'forno', 'bottega', 'osteria', 'frantoio', 'orto'];
const BG_LVM = [1, 1.6, 2.4], BG_LVC = [1, 2, 4];   // produzione e costo per livello
const BG_CAP_H = 6;                                 // ore di produzione che si accumulano
const BG_TITLES = [[0, 'Borgo abbandonato'], [10, 'Contrada'], [30, 'Borgo'], [60, 'Paese'], [100, 'Paese fiorente'], [160, 'Perla della Calabria']];
const BG_MASTRI = 2;

/* ---------- stato ---------- */
function bgData() {
  if (!P.borgo) P.borgo = bgNewMap();
  const n = P.borgo.size || 16; if (n !== BG_N) { BG_N = n; BG.gi = null; BG.ground = null; }
  return P.borgo;
}
function bgRng(seed) { let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function bgNewMap() {
  // il borgo abbandonato: qualche rudere, un pezzo di mura crollate, la vecchia stradina, ulivi e sassi
  const B = { v: 1, size: 16, seed: Math.floor(Math.random() * 1e9), nid: 1, b: [], made: Date.now(), tips: 0 };
  const add = (k, x, y, extra) => B.b.push(Object.assign({ id: B.nid++, k, x, y, lv: 1, st: 'ok', at: Date.now(), last: Date.now() }, extra || {}));
  for (let i = 3; i <= 12; i++) add('strada', i, 8);
  for (let j = 4; j <= 12; j++) if (j !== 8) add('strada', 8, j);
  [[6, 7], [7, 7], [9, 7], [10, 9], [6, 9], [9, 9], [11, 7], [5, 9]].forEach(([x, y]) => add('casa', x, y, { st: 'ruin' }));
  add('chiesa', 9, 4, { st: 'ruin' });
  [[2, 3], [3, 3], [4, 3], [2, 4], [2, 5], [13, 12], [12, 13], [13, 11]].forEach(([x, y]) => add('mura', x, y, { st: 'ruin' }));
  [[1, 9], [2, 11], [3, 13], [12, 2], [14, 5], [13, 3], [4, 14], [14, 14], [1, 1], [11, 14]].forEach(([x, y]) => add('ulivo', x, y));
  [[5, 12], [11, 11], [4, 6], [12, 6], [6, 13]].forEach(([x, y]) => add('sasso', x, y));
  return B;
}
const BG_VIRT = { pztree: { n: 'Piazza', w: 2, d: 2 }, pzlamp: { n: 'Piazza', w: 1, d: 1 } };
const bgDef = (k) => BG_CAT[k] || BG_VIRT[k] || { n: 'Sassi', w: 1, d: 1, c: 10 };
function bgAt(x, y) {
  if (!P.borgo) return null;
  if (!BG.gi || BG.giB !== P.borgo || BG.giN !== P.borgo.b.length || BG.giS !== BG_N) { // indice delle caselle: si rifà quando cambia il borgo
    BG.gi = new Array(BG_N * BG_N).fill(null); BG.giB = P.borgo; BG.giN = P.borgo.b.length; BG.giS = BG_N;
    for (const o of P.borgo.b) { const D = bgDef(o.k); for (let i = o.x; i < o.x + D.w; i++) for (let j = o.y; j < o.y + D.d; j++) if (bgIn(i, j)) BG.gi[j * BG_N + i] = o; }
  }
  if (bgIn(x, y)) return BG.gi[y * BG_N + x];
  return bgAt0(x, y);
}
function bgAt0(x, y) { for (const o of P.borgo.b) { const D = bgDef(o.k); if (x >= o.x && x < o.x + D.w && y >= o.y && y < o.y + D.d) return o; } return null; }
const bgIn = (x, y) => x >= 0 && y >= 0 && x < BG_N && y < BG_N;
function bgFree(x, y, w, d) { for (let i = x; i < x + w; i++) for (let j = y; j < y + d; j++) if (!bgIn(i, j) || bgAt(i, j)) return false; return true; }
const bgIs = (x, y, ks) => { const o = bgAt(x, y); return !!o && ks.includes(o.k) && o.st !== 'ruin'; };
function bgRoadNear(o) {
  const D = bgDef(o.k);
  for (let i = o.x - 1; i <= o.x + D.w; i++) for (let j = o.y - 1; j <= o.y + D.d; j++) {
    const edge = (i === o.x - 1 || i === o.x + D.w) !== (j === o.y - 1 || j === o.y + D.d);
    if (edge && bgIs(i, j, ['strada', 'piazza', 'porta'])) return true;
  }
  return false;
}
function bgStats() {
  if (BG.sc && BG.sc.t === BG.t) return BG.sc.v;
  const B = bgData(); let pop = 0, bel = 0, mun = 0;
  for (const o of B.b) { if (o.st !== 'ok') continue; const D = bgDef(o.k); pop += (D.pop || 0) * (o.k === 'casa' || o.k === 'palazzo' ? o.lv : 1); bel += (D.b || 0) * o.lv; if (o.k === 'municipio') mun = o.lv; }
  let ti = BG_TITLES[0][1]; for (const [n, t] of BG_TITLES) if (pop >= n) ti = t;
  const v = { pop, bel, mun, title: ti, bonus: Math.min(0.5, bel / 400) }; BG.sc = { t: BG.t, v }; BG.rc = new Map();
  return v;
}
function bgRate(o) {
  bgStats(); if (BG.rc.has(o)) return BG.rc.get(o);
  const v = bgRate0(o); BG.rc.set(o, v); return v;
}
function bgRate0(o) {
  const D = bgDef(o.k); if (!D.p || o.st !== 'ok' || !bgRoadNear(o)) return 0;
  let p = D.p * BG_LVM[o.lv - 1];
  if (o.k === 'frantoio') { let n = 0; for (let i = o.x - 2; i < o.x + 4; i++) for (let j = o.y - 2; j < o.y + 4; j++) if (bgIs(i, j, ['ulivo'])) n++; p *= 1 + Math.min(10, n) * 0.06; }
  return p * BG_PMUL * (1 + bgStats().bonus + (bgFesta() ? 0.2 : 0));
}
const BG_PMUL = 0.6;   // 1.3.9: il borgo rende meno: ricostruirlo è un investimento lungo
function bgStored(o, now) { const r = bgRate(o); if (!r) return 0; const h = Math.min(BG_CAP_H, ((now || Date.now()) - (o.last || Date.now())) / 3600e3); return Math.floor(r * h); }
function bgBusy() { return bgData().b.filter((o) => o.st === 'build' || o.st === 'up').length; }
function bgTick() {
  // i lavori finiti diventano edifici veri
  const B = bgData(), now = Date.now(); let ch = false;
  for (const o of B.b) if ((o.st === 'build' || o.st === 'up') && now >= o.end) { if (o.st === 'up') o.lv++; o.st = 'ok'; o.last = now; ch = true; bgPop(o, '✔ Finito!', 'ok'); if (typeof fx === 'function') fx('take'); }
  if (ch) { BG.sc = null; bgSpriteNear(); save(); bgHud(); }
}

/* ---------- colori e disegno ---------- */
function bgShade(hex, f) { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; if (f < 1) { r *= f; g *= f; b *= f; } else { r += (255 - r) * (f - 1); g += (255 - g) * (f - 1); b += (255 - b) * (f - 1); } return 'rgb(' + Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b) + ')'; }
const BG_WALLC = ['#EAD3A6', '#F2E6CC', '#E9BFA8', '#F5EFE3', '#DCC39A', '#EFD9B0', '#E3C7B5'];
const BG_INK = '#3A2A1C';
/* contesto di disegno: P(x,y,z) in tile relative all'angolo in alto dell'impronta */
function bgPen(ctx, ax, ay) {
  const P = (x, y, z) => [ax + (x - y) * BG_TW / 2, ay + (x + y) * BG_TH / 2 - (z || 0)];
  const poly = (pts, fill, stroke, lw) => { ctx.beginPath(); pts.forEach((p, k) => (k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); } };
  const qL = (x1, x2, Y, z1, z2) => [P(x1, Y, z1), P(x2, Y, z1), P(x2, Y, z2), P(x1, Y, z2)];     // faccia davanti a sinistra
  const qR = (y1, y2, X, z1, z2) => [P(X, y1, z1), P(X, y2, z1), P(X, y2, z2), P(X, y1, z2)];     // faccia davanti a destra
  const box = (x0, y0, w, d, z0, h, col, o) => {
    o = o || {};
    poly(qL(x0, x0 + w, y0 + d, z0, z0 + h), o.l || bgShade(col, 1), BG_INK, 1);
    poly(qR(y0 + d, y0, x0 + w, z0, z0 + h), o.r || bgShade(col, 0.78), BG_INK, 1);
    if (!o.noTop) poly([P(x0, y0, z0 + h), P(x0 + w, y0, z0 + h), P(x0 + w, y0 + d, z0 + h), P(x0, y0 + d, z0 + h)], o.t || bgShade(col, 1.08), BG_INK, 1);
  };
  // tetto a due falde con il colmo parallelo alla faccia sinistra
  const roof = (x0, y0, w, d, z, rh, col, ov) => {
    ov = ov == null ? 0.08 : ov;
    const xa = x0 - ov, xb = x0 + w + ov, ya = y0 - ov, yb = y0 + d + ov, ym = y0 + d / 2;
    poly([P(xa, ya, z), P(xb, ya, z), P(xb, ym, z + rh), P(xa, ym, z + rh)], bgShade(col, 0.8), BG_INK, 1);           // falda dietro
    poly([P(x0 + w, y0, z), P(x0 + w, y0 + d, z), P(x0 + w, ym, z + rh)], null, null);
    poly([P(xb, ya, z), P(xb, yb, z), P(xb, ym, z + rh)], bgShade(col, 0.66), BG_INK, 1);                             // timpano
    poly([P(xa, yb, z), P(xb, yb, z), P(xb, ym, z + rh), P(xa, ym, z + rh)], bgShade(col, 1.02), BG_INK, 1);          // falda davanti
    // file di coppi
    ctx.save(); ctx.strokeStyle = 'rgba(80,25,10,0.35)'; ctx.lineWidth = 0.8;
    const n = Math.max(3, Math.round((xb - xa) * 7));
    for (let k = 1; k < n; k++) { const x = xa + (xb - xa) * k / n; const a = P(x, yb, z), b = P(x, ym, z + rh); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
    for (let k = 1; k < 4; k++) { const t = k / 4, a = P(xa, yb + (ym - yb) * t, z + rh * t), b = P(xb, yb + (ym - yb) * t, z + rh * t); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
    ctx.restore();
    const r1 = P(xa, ym, z + rh), r2 = P(xb, ym, z + rh); ctx.strokeStyle = bgShade(col, 0.55); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(r1[0], r1[1]); ctx.lineTo(r2[0], r2[1]); ctx.stroke();
  };
  // finestra con persiane verdi sulla faccia sinistra (L) o destra (R)
  const win = (side, a, F, z, ww, wh, o) => {
    o = o || {};
    const q = side === 'L' ? (u1, u2, z1, z2) => qL(u1, u2, F, z1, z2) : (u1, u2, z1, z2) => qR(u1, u2, F, z1, z2);
    poly(q(a - 0.012, a + ww + 0.012, z - 1.5, z + wh + 1.5), '#F7F1E4', BG_INK, 0.8);
    poly(q(a, a + ww, z, z + wh), o.lit ? '#FFD36B' : '#2D3440', null);
    if (o.lit) { ctx.save(); ctx.globalAlpha = 0.35; poly(q(a - 0.03, a + ww + 0.03, z - 3, z + wh + 3), '#FFE08A'); ctx.restore(); }
    if (!o.noShut) { const sc = o.sc || '#3E7D4F', sw = ww * 0.55; poly(q(a - sw - 0.01, a - 0.012, z, z + wh), sc, BG_INK, 0.7); poly(q(a + ww + 0.012, a + ww + sw + 0.01, z, z + wh), sc, BG_INK, 0.7); }
    if (o.flowers) { poly(q(a - 0.03, a + ww + 0.03, z - 4, z - 1), '#6A4A2E', BG_INK, 0.6); ctx.fillStyle = '#E8334A'; for (let k = 0; k < 4; k++) { const p = side === 'L' ? P(a + ww * (k + 0.5) / 4, F, z - 1) : P(F, a + ww * (k + 0.5) / 4, z - 1); ctx.beginPath(); ctx.arc(p[0], p[1] - 1.5, 1.6, 0, 7); ctx.fill(); } ctx.fillStyle = '#3C8A3C'; }
  };
  const door = (side, a, F, ww, wh, col, arch) => {
    const pts = [], pt = (u, z) => (side === 'L' ? P(u, F, z) : P(F, u, z));
    pts.push(pt(a, 0), pt(a + ww, 0));
    if (arch) { for (let k = 0; k <= 10; k++) { const t = k / 10 * Math.PI; pts.push(pt(a + ww / 2 + Math.cos(t) * ww / 2, wh + Math.sin(t) * (ww * 26))); } } else pts.push(pt(a + ww, wh), pt(a, wh));
    poly(pts, col || '#6B3E22', BG_INK, 1);
    const k1 = pt(a + ww * 0.78, wh * 0.45); ctx.fillStyle = '#E8C45A'; ctx.beginPath(); ctx.arc(k1[0], k1[1], 1.2, 0, 7); ctx.fill();
  };
  const circ = (x, y, z, r, fill, stroke) => { const c = P(x, y, z); ctx.beginPath(); ctx.ellipse(c[0], c[1], r, r * 0.5, 0, 0, Math.PI * 2); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); } };
  return { P, poly, qL, qR, box, roof, win, door, circ, ctx };
}

/* alberi e cespugli (si usano in tanti posti) */
function bgTree(pen, x, y, kind, s) {
  const { P, ctx, poly } = pen; s = s || 1;
  const b = P(x, y, 0);
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.ellipse(b[0] + 3, b[1] + 1, 12 * s, 5 * s, 0, 0, 7); ctx.fill();
  if (kind === 'cipresso') {
    ctx.fillStyle = '#5A3B22'; ctx.fillRect(b[0] - 1.5, b[1] - 6 * s, 3, 6 * s);
    ctx.beginPath(); ctx.moveTo(b[0], b[1] - 46 * s); ctx.quadraticCurveTo(b[0] + 9 * s, b[1] - 22 * s, b[0] + 5 * s, b[1] - 5 * s); ctx.lineTo(b[0] - 5 * s, b[1] - 5 * s); ctx.quadraticCurveTo(b[0] - 9 * s, b[1] - 22 * s, b[0], b[1] - 46 * s);
    const g = ctx.createLinearGradient(b[0] - 8, 0, b[0] + 8, 0); g.addColorStop(0, '#2F6B3A'); g.addColorStop(1, '#173D22'); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = BG_INK; ctx.lineWidth = 0.8; ctx.stroke();
    return;
  }
  // ulivo: tronco nodoso e chioma grigio-verde a ciuffi
  ctx.strokeStyle = '#5B4330'; ctx.lineWidth = 3.4 * s; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(b[0], b[1]); ctx.bezierCurveTo(b[0] - 4 * s, b[1] - 8 * s, b[0] + 5 * s, b[1] - 12 * s, b[0] + 1, b[1] - 18 * s); ctx.stroke();
  ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.moveTo(b[0] + 1, b[1] - 14 * s); ctx.lineTo(b[0] - 7 * s, b[1] - 20 * s); ctx.stroke();
  const blobs = [[-9, -24, 9], [3, -28, 10], [10, -21, 8], [-3, -19, 8], [-12, -17, 6], [7, -15, 6]];
  for (const [dx, dy, r] of blobs) { ctx.beginPath(); ctx.arc(b[0] + dx * s, b[1] + dy * s, r * s, 0, 7); ctx.fillStyle = '#7F9A6A'; ctx.fill(); ctx.strokeStyle = 'rgba(40,50,30,0.6)'; ctx.lineWidth = 0.8; ctx.stroke(); }
  for (const [dx, dy, r] of blobs) { ctx.beginPath(); ctx.arc(b[0] + (dx - 2) * s, b[1] + (dy - 2) * s, r * 0.55 * s, 0, 7); ctx.fillStyle = '#A3B88E'; ctx.fill(); }
  ctx.fillStyle = '#2E3A22'; for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.arc(b[0] + (k * 7 % 18 - 9) * s, b[1] + (-14 - k * 5 % 14) * s, 1.1, 0, 7); ctx.fill(); }
}

/* ---------- gli edifici: ogni funzione disegna nello spazio dell'impronta ---------- */
const BG_DRAW = {
  casa(pen, o, R, opt) {
    const { box, roof, win, door, P, ctx, poly } = pen, col = BG_WALLC[Math.floor(R() * BG_WALLC.length)], lv = o.lv, H = lv >= 3 ? 52 : 40;
    const sc = R() < 0.7 ? '#3E7D4F' : '#2F5E8C', fl = lv >= 2;
    box(0.12, 0.12, 0.76, 0.76, 0, H, col);
    // zoccolo in pietra
    poly(pen.qL(0.12, 0.88, 0.88, 0, 5), '#B9A27C', BG_INK, 0.6); poly(pen.qR(0.88, 0.12, 0.88, 0, 5), '#9A8565', BG_INK, 0.6);
    door('L', 0.42, 0.88, 0.16, 15, '#6B3E22', R() < 0.5);
    win('L', 0.2, 0.88, 7, 0.12, 9, { sc, lit: opt.night && R() < 0.7 });
    win('R', 0.3, 0.88, 7, 0.14, 9, { sc, lit: opt.night && R() < 0.6 });
    win('L', 0.25, 0.88, 22, 0.12, 10, { sc, flowers: fl, lit: opt.night && R() < 0.5 });
    win('L', 0.62, 0.88, 22, 0.12, 10, { sc, flowers: fl && R() < 0.6 });
    win('R', 0.35, 0.88, 22, 0.14, 10, { sc, flowers: fl && R() < 0.5, lit: opt.night && R() < 0.4 });
    if (lv >= 3) { win('L', 0.25, 0.88, 36, 0.12, 9, { sc, flowers: true }); win('L', 0.62, 0.88, 36, 0.12, 9, { sc }); win('R', 0.35, 0.88, 36, 0.14, 9, { sc, flowers: true }); }
    if (fl) { // balcone in ferro battuto
      const z = 20; poly([P(0.2, 0.88, z), P(0.78, 0.88, z), P(0.78, 0.98, z), P(0.2, 0.98, z)], '#8A7C6A', BG_INK, 0.7);
      ctx.strokeStyle = '#2A2A2A'; ctx.lineWidth = 0.8; for (let k = 0; k <= 8; k++) { const a = P(0.2 + k * 0.0725, 0.98, z), b = P(0.2 + k * 0.0725, 0.98, z + 6); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
      const a = P(0.2, 0.98, z + 6), b = P(0.78, 0.98, z + 6); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    roof(0.12, 0.12, 0.76, 0.76, H, 14, '#B4533A');
    // comignolo
    box(0.62, 0.3, 0.1, 0.1, H + 4, 12, '#D9C3A0');
    if (R() < 0.5) { const p = P(0.3, 0.88, 1); ctx.fillStyle = '#7A4A2A'; ctx.fillRect(p[0] - 3, p[1] - 6, 6, 6); ctx.fillStyle = '#3F8F3F'; ctx.beginPath(); ctx.arc(p[0], p[1] - 8, 4, 0, 7); ctx.fill(); ctx.fillStyle = '#E8334A'; ctx.beginPath(); ctx.arc(p[0] + 1, p[1] - 10, 1.5, 0, 7); ctx.fill(); }
  },
  ruin(pen, o, R) {
    const { poly, qL, qR, P, ctx } = pen, col = '#CDBB98';
    const h1 = 18 + R() * 14, h2 = 10 + R() * 18;
    // muri crollati a zig-zag, niente tetto, erbacce e calcinacci
    const L = [P(0.12, 0.88, 0)]; for (let k = 0; k <= 6; k++) L.push(P(0.12 + 0.76 * k / 6, 0.88, (k % 2 ? h1 : h1 - 9) * (1 - k / 9))); L.push(P(0.88, 0.88, 0));
    poly(L, bgShade(col, 1), BG_INK, 1);
    const Rr = [P(0.88, 0.88, 0)]; for (let k = 0; k <= 6; k++) Rr.push(P(0.88, 0.88 - 0.76 * k / 6, (k % 2 ? h2 : h2 + 7) * (1 - k / 12))); Rr.push(P(0.88, 0.12, 0));
    poly(Rr, bgShade(col, 0.76), BG_INK, 1);
    poly(qL(0.4, 0.56, 0.88, 0, 12), '#2D2A26'); // vano vuoto
    ctx.fillStyle = '#9C8C70'; for (let k = 0; k < 9; k++) { const p = P(0.2 + R() * 0.8, 0.9 + R() * 0.15, 0); ctx.beginPath(); ctx.ellipse(p[0], p[1], 2.5 + R() * 2, 1.6, 0, 0, 7); ctx.fill(); }
    ctx.fillStyle = '#5E8A3A'; for (let k = 0; k < 7; k++) { const p = P(0.12 + R() * 0.8, 0.86 + R() * 0.2, 0); ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0] - 2, p[1] - 6); ctx.lineTo(p[0] + 1, p[1] - 3); ctx.lineTo(p[0] + 3, p[1] - 7); ctx.lineTo(p[0] + 3, p[1]); ctx.fill(); }
  },
  palazzo(pen, o, R, opt) {
    const { box, roof, win, door, P, ctx, poly } = pen, col = ['#E7C9A0', '#EDDCC0', '#E2B9A0'][Math.floor(R() * 3)], H = 64 + (o.lv - 1) * 8;
    box(0.2, 0.2, 1.6, 1.6, 0, H, col);
    poly(pen.qL(0.2, 1.8, 1.8, 0, 8), '#B39B78', BG_INK, 0.7); poly(pen.qR(1.8, 0.2, 1.8, 0, 8), '#968262', BG_INK, 0.7);
    // cornici marcapiano
    for (const z of [22, 42]) { poly(pen.qL(0.2, 1.8, 1.8, z, z + 2), '#C9B48F'); poly(pen.qR(1.8, 0.2, 1.8, z, z + 2), '#A8946E'); }
    door('L', 0.86, 1.8, 0.28, 18, '#5A3220', true);
    poly(pen.qL(0.8, 1.2, 1.8, 0, 2), '#A89272');
    for (const a of [0.32, 0.56, 1.3, 1.54]) win('L', a, 1.8, 7, 0.12, 10, { lit: opt.night && R() < 0.6, sc: '#3E6E4F' });
    for (const a of [0.32, 0.56, 0.94, 1.3, 1.54]) { win('L', a, 1.8, 26, 0.12, 12, { flowers: o.lv >= 2, lit: opt.night && R() < 0.5, sc: '#3E6E4F' }); win('L', a, 1.8, 46, 0.12, 11, { lit: opt.night && R() < 0.4, sc: '#3E6E4F' }); }
    for (const a of [0.4, 0.8, 1.2]) { win('R', a, 1.8, 26, 0.14, 12, { sc: '#3E6E4F', lit: opt.night && R() < 0.4 }); win('R', a, 1.8, 46, 0.14, 11, { sc: '#3E6E4F' }); win('R', a, 1.8, 7, 0.14, 10, { sc: '#3E6E4F' }); }
    // balcone lungo e stemma
    const z = 24; poly([P(0.82, 1.8, z), P(1.18, 1.8, z), P(1.18, 1.95, z), P(0.82, 1.95, z)], '#9A8A74', BG_INK, 0.8);
    ctx.strokeStyle = '#222'; ctx.lineWidth = 0.9; for (let k = 0; k <= 6; k++) { const a = P(0.82 + k * 0.06, 1.95, z), b = P(0.82 + k * 0.06, 1.95, z + 7); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
    const s = P(1, 1.8, H - 9); ctx.fillStyle = '#C9A13B'; ctx.beginPath(); ctx.moveTo(s[0] - 5, s[1] - 5); ctx.lineTo(s[0] + 5, s[1] - 2.5); ctx.lineTo(s[0] + 5, s[1] + 3); ctx.lineTo(s[0], s[1] + 6); ctx.lineTo(s[0] - 5, s[1] + 1); ctx.closePath(); ctx.fill(); ctx.strokeStyle = BG_INK; ctx.stroke();
    roof(0.2, 0.2, 1.6, 1.6, H, 20, '#A84C35');
    box(0.5, 0.5, 0.14, 0.14, H + 6, 14, '#D9C3A0'); box(1.4, 0.6, 0.14, 0.14, H + 6, 14, '#D9C3A0');
  },
  municipio(pen, o, R, opt) {
    const { box, win, door, P, ctx, poly } = pen, col = '#F0DDB8', H = 56 + (o.lv - 1) * 6;
    box(0.15, 0.15, 1.7, 1.7, 0, H, col);
    poly(pen.qL(0.15, 1.85, 1.85, 0, 10), '#C8B48E', BG_INK, 0.7); poly(pen.qR(1.85, 0.15, 1.85, 0, 10), '#A8946E', BG_INK, 0.7);
    // portico con colonne
    for (let k = 0; k < 5; k++) { const a = 0.35 + k * 0.32; door('L', a, 1.85, 0.16, 14, '#3A2A20', true); }
    poly(pen.qL(0.15, 1.85, 1.85, 28, 31), '#D8C29C');
    for (const a of [0.32, 0.64, 1.2, 1.52]) win('L', a, 1.85, 36, 0.14, 12, { noShut: true, lit: opt.night });
    for (const a of [0.4, 0.9, 1.4]) win('R', a, 1.85, 36, 0.16, 12, { noShut: true, lit: opt.night && R() < 0.5 }), win('R', a, 1.85, 12, 0.16, 11, { noShut: true });
    // balcone delle bandiere
    const z = 32; poly([P(0.8, 1.85, z), P(1.2, 1.85, z), P(1.2, 2.0, z), P(0.8, 2.0, z)], '#C9B48F', BG_INK, 0.8);
    win('L', 0.92, 1.85, 35, 0.16, 15, { noShut: true, lit: opt.night });
    // tetto a padiglione
    const z2 = H, c = P(1, 1, H + 22);
    poly([P(0.08, 0.08, z2), P(1.92, 0.08, z2), c], '#94442F', BG_INK, 1);
    poly([P(1.92, 0.08, z2), P(1.92, 1.92, z2), c], '#8A3E2A', BG_INK, 1);
    poly([P(0.08, 1.92, z2), P(1.92, 1.92, z2), c], '#B4533A', BG_INK, 1);
    // torretta dell'orologio
    box(0.82, 0.82, 0.36, 0.36, H + 8, 22, '#F0DDB8');
    const ck = P(1.0, 1.18, H + 20); ctx.fillStyle = '#FFFDF4'; ctx.beginPath(); ctx.ellipse(ck[0] - 5, ck[1] - 2, 4.5, 5, 0, 0, 7); ctx.fill(); ctx.strokeStyle = BG_INK; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ck[0] - 5, ck[1] - 2); ctx.lineTo(ck[0] - 5, ck[1] - 6); ctx.moveTo(ck[0] - 5, ck[1] - 2); ctx.lineTo(ck[0] - 2.5, ck[1] - 1); ctx.stroke();
    const tp = P(1, 1, H + 30); poly([P(0.78, 0.78, H + 30), P(1.22, 0.78, H + 30), tp.map((v, k) => v - (k ? 12 : 0))], '#7E3626', BG_INK, 0.8);
    poly([P(1.22, 0.78, H + 30), P(1.22, 1.22, H + 30), [tp[0], tp[1] - 12]], '#6E2E20', BG_INK, 0.8);
    poly([P(0.78, 1.22, H + 30), P(1.22, 1.22, H + 30), [tp[0], tp[1] - 12]], '#9C4430', BG_INK, 0.8);
    // insegna
    const sg = P(0.5, 1.85, 22), sg2 = P(1.5, 1.85, 22); ctx.save(); ctx.fillStyle = '#2E4A7A'; poly([sg, sg2, [sg2[0], sg2[1] - 6], [sg[0], sg[1] - 6]], '#2E4A7A', BG_INK, 0.6);
    ctx.fillStyle = '#FFF'; ctx.font = 'bold 6px sans-serif'; ctx.textAlign = 'center'; ctx.translate((sg[0] + sg2[0]) / 2, (sg[1] + sg2[1]) / 2 - 1.5); ctx.transform(1, 0.5, 0, 1, 0, 0); ctx.fillText('MUNICIPIO', 0, 0); ctx.restore();
  },
  chiesa(pen, o, R, opt) {
    const { box, roof, win, door, P, ctx, poly } = pen, col = '#EFE3C8', H = 46;
    // campanile dietro a destra
    box(1.35, 0.15, 0.5, 0.5, 0, 92, '#E6D6B4');
    for (const z of [30, 60]) { poly(pen.qL(1.35, 1.85, 0.65, z, z + 2), '#CDBB98'); poly(pen.qR(0.65, 0.15, 1.85, z, z + 2), '#B09E7C'); }
    door('L', 1.5, 0.65, 0.2, 66, '#1F1A16', true); door('R', 0.3, 1.85, 0.2, 66, '#1F1A16', true);
    // la campana
    const bc = P(1.6, 0.65, 70); ctx.fillStyle = '#C9A13B'; ctx.beginPath(); ctx.moveTo(bc[0] - 3, bc[1] + 5); ctx.quadraticCurveTo(bc[0] - 3, bc[1] - 2, bc[0], bc[1] - 2); ctx.quadraticCurveTo(bc[0] + 3, bc[1] - 2, bc[0] + 3, bc[1] + 5); ctx.closePath(); ctx.fill();
    const tp = P(1.6, 0.4, 92 + 26); poly([P(1.3, 0.1, 92), P(1.9, 0.1, 92), tp], '#7E3626', BG_INK, 0.8); poly([P(1.9, 0.1, 92), P(1.9, 0.7, 92), tp], '#6E2E20', BG_INK, 0.8); poly([P(1.3, 0.7, 92), P(1.9, 0.7, 92), tp], '#A84C35', BG_INK, 0.8);
    ctx.strokeStyle = '#3A2A1C'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(tp[0], tp[1]); ctx.lineTo(tp[0], tp[1] - 10); ctx.moveTo(tp[0] - 3.5, tp[1] - 7); ctx.lineTo(tp[0] + 3.5, tp[1] - 7); ctx.stroke();
    // navata
    box(0.15, 0.55, 1.3, 1.3, 0, H, col);
    poly(pen.qL(0.15, 1.45, 1.85, 0, 6), '#C8B48E', BG_INK, 0.6);
    door('L', 0.63, 1.85, 0.34, 22, '#5A3220', true);
    // rosone e finestre ad arco
    const rc = P(0.8, 1.85, 36); ctx.fillStyle = opt.night ? '#FFC870' : '#4C6FA8'; ctx.beginPath(); ctx.ellipse(rc[0], rc[1], 6, 6.5, 0, 0, 7); ctx.fill(); ctx.strokeStyle = BG_INK; ctx.stroke();
    ctx.strokeStyle = '#F2E6CC'; ctx.lineWidth = 0.8; for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; ctx.beginPath(); ctx.moveTo(rc[0], rc[1]); ctx.lineTo(rc[0] + Math.cos(a) * 6, rc[1] + Math.sin(a) * 6.5); ctx.stroke(); }
    for (const a of [0.8, 1.3]) door('R', a, 1.45, 0.12, 20, opt.night ? '#FFC870' : '#4C6FA8', true);
    // facciata a capanna sopra la porta
    poly([P(0.15, 1.85, H), P(1.45, 1.85, H), P(0.8, 1.85, H + 18)], bgShade(col, 1.03), BG_INK, 1);
    roof(0.15, 0.55, 1.3, 1.3, H, 18, '#A84C35', 0.04);
    const cr = P(0.8, 1.85, H + 18); ctx.strokeStyle = '#3A2A1C'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(cr[0], cr[1]); ctx.lineTo(cr[0], cr[1] - 9); ctx.moveTo(cr[0] - 3, cr[1] - 6); ctx.lineTo(cr[0] + 3, cr[1] - 6); ctx.stroke();
    // scalinata
    for (let k = 0; k < 3; k++) poly([P(0.55 - k * 0.03, 1.85 + k * 0.05, 4 - k * 1.5), P(1.05 + k * 0.03, 1.85 + k * 0.05, 4 - k * 1.5), P(1.05 + k * 0.03, 1.9 + k * 0.05, 4 - k * 1.5), P(0.55 - k * 0.03, 1.9 + k * 0.05, 4 - k * 1.5)], '#D8C8A8', BG_INK, 0.5);
  },
  chiesaRuin(pen, o, R) {
    const { poly, qL, qR, P, ctx } = pen, col = '#D2C3A2';
    poly([P(1.35, 0.65, 0), P(1.85, 0.65, 0), P(1.85, 0.65, 40), P(1.6, 0.65, 52), P(1.35, 0.65, 34)], bgShade(col, 1), BG_INK, 1);
    poly([P(1.85, 0.65, 0), P(1.85, 0.15, 0), P(1.85, 0.15, 30), P(1.85, 0.4, 48), P(1.85, 0.65, 40)], bgShade(col, 0.76), BG_INK, 1);
    const L = [P(0.15, 1.85, 0)]; for (let k = 0; k <= 8; k++) L.push(P(0.15 + 1.3 * k / 8, 1.85, [30, 22, 34, 18, 26, 14, 20, 10, 16][k])); L.push(P(1.45, 1.85, 0)); poly(L, col, BG_INK, 1);
    const Rr = [P(1.45, 1.85, 0)]; for (let k = 0; k <= 6; k++) Rr.push(P(1.45, 1.85 - 1.3 * k / 6, [16, 24, 12, 20, 9, 14, 6][k])); Rr.push(P(1.45, 0.55, 0)); poly(Rr, bgShade(col, 0.76), BG_INK, 1);
    pen.door('L', 0.63, 1.85, 0.34, 18, '#2D2A26', true);
    ctx.fillStyle = '#9C8C70'; for (let k = 0; k < 16; k++) { const p = P(0.2 + R() * 1.6, 1.88 + R() * 0.12, 0); ctx.beginPath(); ctx.ellipse(p[0], p[1], 3 + R() * 2, 1.8, 0, 0, 7); ctx.fill(); }
    ctx.fillStyle = '#5E8A3A'; for (let k = 0; k < 12; k++) { const p = P(0.15 + R() * 1.7, 1.8 + R() * 0.2, 0); ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0] - 2, p[1] - 7); ctx.lineTo(p[0] + 3, p[1]); ctx.fill(); }
  },
  fontana(pen, o, R, opt) {
    const { circ, P, ctx, box } = pen;
    // vasca rotonda in pietra con l'acqua che si muove (l'acqua animata si disegna a parte)
    for (let z = 0; z < 8; z += 1) circ(0.5, 0.5, z, 24, z === 7 ? '#D8C8A8' : '#BBA884');
    circ(0.5, 0.5, 8, 24, null, BG_INK);
    circ(0.5, 0.5, 8, 20, '#4F9FCF', BG_INK);
    circ(0.5, 0.5, 8, 14, '#77BEE6');
    box(0.44, 0.44, 0.12, 0.12, 8, 18, '#D8C8A8');
    circ(0.5, 0.5, 26, 9, '#C9B691', BG_INK); circ(0.5, 0.5, 27, 6, '#77BEE6');
  },
  forno(pen, o, R, opt) {
    const { box, roof, win, door, P, ctx, poly } = pen, col = '#EAD7B0';
    // la casa del fornaio, dietro
    box(0.1, 0.1, 0.56, 0.62, 0, 30, col);
    door('L', 0.16, 0.72, 0.16, 14, '#6B3E22', true);
    win('L', 0.42, 0.72, 13, 0.13, 8, { lit: opt.night });
    win('R', 0.32, 0.66, 13, 0.16, 8, { lit: opt.night });
    // insegna "PANE"
    poly([P(0.15, 0.72, 28), P(0.58, 0.72, 28), P(0.58, 0.72, 22.5), P(0.15, 0.72, 22.5)], '#5A3A1E', BG_INK, 1);
    { const m = P(0.365, 0.72, 25.2); ctx.save(); ctx.translate(m[0], m[1]); ctx.transform(1, 0.5, 0, 1, 0, 0); ctx.fillStyle = '#F3E2B5'; ctx.font = 'bold 5px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('PANE', 0, 0); ctx.restore(); }
    roof(0.1, 0.1, 0.56, 0.62, 30, 10, '#B4533A');
    box(0.24, 0.3, 0.08, 0.08, 34, 9, '#B79A72');   // comignolo sul tetto
    // il forno a legna, davanti a destra: basamento di pietra e cupola
    box(0.64, 0.46, 0.3, 0.44, 0, 7, '#A08C74');
    const c = P(0.79, 0.68, 7), rx = 12, ry = 6, rh = 13;
    const g = ctx.createRadialGradient(c[0] - 4, c[1] - rh + 3, 1, c[0], c[1] - 4, 18); g.addColorStop(0, '#E9CFA6'); g.addColorStop(0.6, '#C49A6C'); g.addColorStop(1, '#94704A');
    ctx.beginPath(); ctx.moveTo(c[0] - rx, c[1]); ctx.ellipse(c[0], c[1], rx, rh, 0, Math.PI, Math.PI * 2); ctx.ellipse(c[0], c[1], rx, ry, 0, 0, Math.PI); ctx.closePath();
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = BG_INK; ctx.lineWidth = 1; ctx.stroke();
    // file di mattoni sulla cupola
    ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(90,50,25,0.35)'; ctx.lineWidth = 0.7;
    for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.ellipse(c[0], c[1] - rh * k / 4.2, rx * Math.cos(k / 4.2 * 1.25), ry * 0.8, 0, 0, Math.PI); ctx.stroke(); }
    ctx.restore();
    // bocca del forno, verso chi guarda
    const m = [c[0] - 4.5, c[1] + 4.4];
    ctx.beginPath(); ctx.moveTo(m[0] - 4.2, m[1]); ctx.ellipse(m[0], m[1], 4.2, 5.4, 0, Math.PI, Math.PI * 2); ctx.closePath();
    ctx.fillStyle = '#7D5A3C'; ctx.fill(); ctx.strokeStyle = BG_INK; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(m[0] - 2.9, m[1]); ctx.ellipse(m[0], m[1], 2.9, 3.9, 0, Math.PI, Math.PI * 2); ctx.closePath();
    const fg = ctx.createRadialGradient(m[0], m[1] - 1, 0.5, m[0], m[1] - 1, 4); fg.addColorStop(0, opt.night ? '#FFE08A' : '#FFB347'); fg.addColorStop(1, opt.night ? '#E2551E' : '#3A1E10');
    ctx.fillStyle = fg; ctx.fill();
    box(0.765, 0.655, 0.06, 0.06, 7 + rh - 1, 6, '#8C7A64');   // canna fumaria sulla cupola
    // legna accatastata e pagnotte sul banchetto
    const w = P(0.42, 0.95, 0);
    for (let r = 0; r < 2; r++) for (let k = 0; k < 3 - r; k++) { const x0 = w[0] + k * 4.6 + r * 2.3, y0 = w[1] - 3 - r * 3.8; ctx.fillStyle = '#7A5230'; ctx.beginPath(); ctx.ellipse(x0 - 3, y0 - 1.5, 2.3, 2.3, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#C8955A'; ctx.strokeStyle = BG_INK; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.ellipse(x0, y0, 2.3, 2.3, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.strokeStyle = 'rgba(90,50,25,0.6)'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.arc(x0, y0, 1.1, 0, 7); ctx.stroke(); }
    box(0.14, 0.78, 0.2, 0.1, 0, 5, '#7A5230');
    for (const [u, v] of [[0.19, 0.82], [0.27, 0.84]]) { const b = P(u, v, 5); ctx.fillStyle = '#D9984A'; ctx.strokeStyle = BG_INK; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.ellipse(b[0], b[1] - 1.5, 3.4, 2, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.strokeStyle = 'rgba(255,240,200,0.7)'; ctx.beginPath(); ctx.moveTo(b[0] - 1.5, b[1] - 2.5); ctx.lineTo(b[0] + 1.5, b[1] - 1.8); ctx.stroke(); }
  },
  bottega(pen, o, R, opt) {
    const { box, roof, win, door, P, ctx, poly } = pen, col = BG_WALLC[Math.floor(R() * BG_WALLC.length)], H = 38;
    box(0.12, 0.12, 0.76, 0.76, 0, H, col);
    poly(pen.qL(0.18, 0.82, 0.88, 2, 16), opt.night ? '#FFD36B' : '#3A3F4A', BG_INK, 0.8);
    door('L', 0.44, 0.88, 0.14, 14, '#7A4A2A');
    win('L', 0.3, 0.88, 24, 0.12, 9, { lit: opt.night }); win('L', 0.6, 0.88, 24, 0.12, 9, { flowers: o.lv >= 2 }); win('R', 0.4, 0.88, 22, 0.14, 10);
    // tenda a strisce
    const cols = ['#C8102E', '#FFF6E8'];
    for (let k = 0; k < 8; k++) poly([P(0.16 + k * 0.085, 0.88, 19), P(0.16 + (k + 1) * 0.085, 0.88, 19), P(0.16 + (k + 1) * 0.085, 1.04, 12), P(0.16 + k * 0.085, 1.04, 12)], cols[k % 2], BG_INK, 0.5);
    // insegna e cassette di frutta
    const s1 = P(0.25, 0.88, 32), s2 = P(0.75, 0.88, 32); poly([s1, s2, [s2[0], s2[1] - 6], [s1[0], s1[1] - 6]], '#2E5A3A', BG_INK, 0.6);
    for (let k = 0; k < 3; k++) { const c = P(0.22 + k * 0.22, 1.08, 0); ctx.fillStyle = '#9A6A3A'; ctx.fillRect(c[0] - 5, c[1] - 6, 10, 5); ctx.strokeStyle = BG_INK; ctx.lineWidth = 0.6; ctx.strokeRect(c[0] - 5, c[1] - 6, 10, 5); ctx.fillStyle = ['#E8334A', '#F2A23A', '#7DB43C'][k]; for (let q = 0; q < 4; q++) { ctx.beginPath(); ctx.arc(c[0] - 3 + q * 2, c[1] - 7, 1.6, 0, 7); ctx.fill(); } }
    roof(0.12, 0.12, 0.76, 0.76, H, 12, '#B4533A');
  },
  osteria(pen, o, R, opt) {
    const { box, roof, win, door, P, ctx, poly } = pen, col = '#EBCB9A', H = 36;
    box(0.1, 0.1, 0.62, 0.62, 0, H, col);
    door('L', 0.3, 0.72, 0.16, 14, '#6B3E22', true); win('L', 0.52, 0.72, 6, 0.12, 9, { lit: opt.night }); win('R', 0.35, 0.72, 6, 0.14, 9, { lit: opt.night }); win('L', 0.3, 0.72, 22, 0.12, 9, { flowers: true });
    roof(0.1, 0.1, 0.62, 0.62, H, 11, '#B4533A');
    // pergolato con la vite e tavolini
    ctx.strokeStyle = '#5B4330'; ctx.lineWidth = 1.6;
    for (const [x, y] of [[0.15, 0.95], [0.95, 0.95], [0.95, 0.2]]) { const a = P(x, y, 0), b = P(x, y, 22); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
    ctx.fillStyle = 'rgba(70,120,50,0.85)'; poly([P(0.15, 0.72, 22), P(0.95, 0.72, 22), P(0.95, 0.95, 22), P(0.15, 0.95, 22)], 'rgba(78,128,56,0.9)', '#2E4A22', 0.6); poly([P(0.72, 0.2, 22), P(0.95, 0.2, 22), P(0.95, 0.95, 22), P(0.72, 0.95, 22)], 'rgba(78,128,56,0.9)', '#2E4A22', 0.6);
    ctx.fillStyle = '#5A2A6A'; for (let k = 0; k < 6; k++) { const p = P(0.25 + k * 0.12, 0.84, 21); ctx.beginPath(); ctx.arc(p[0], p[1] + 2, 1.6, 0, 7); ctx.fill(); }
    for (const [x, y] of [[0.4, 0.86], [0.85, 0.5]]) { const t = P(x, y, 7); ctx.fillStyle = '#F7F1E4'; ctx.beginPath(); ctx.ellipse(t[0], t[1], 6, 3, 0, 0, 7); ctx.fill(); ctx.strokeStyle = '#C8102E'; ctx.lineWidth = 0.8; ctx.stroke(); ctx.strokeStyle = '#5B4330'; ctx.beginPath(); ctx.moveTo(t[0], t[1]); ctx.lineTo(t[0], t[1] + 7); ctx.stroke(); }
    if (opt.night) { const l = P(0.55, 0.95, 20); ctx.fillStyle = 'rgba(255,214,107,0.9)'; ctx.beginPath(); ctx.arc(l[0], l[1], 2.2, 0, 7); ctx.fill(); }
  },
  frantoio(pen, o, R, opt) {
    const { box, roof, win, door, P, ctx, poly, circ } = pen, col = '#D9C49C', H = 40;
    box(0.15, 0.15, 1.1, 1.0, 0, H, col);
    door('L', 0.45, 1.15, 0.36, 22, '#5A3220', true);
    win('R', 0.4, 1.25, 20, 0.16, 10, { lit: opt.night }); win('R', 0.75, 1.25, 20, 0.16, 10);
    roof(0.15, 0.15, 1.1, 1.0, H, 16, '#A84C35');
    // cortile con la macina di pietra e le giare
    poly([P(0.15, 1.25, 0), P(1.85, 1.25, 0), P(1.85, 1.85, 0), P(0.15, 1.85, 0)], '#CBB592', BG_INK, 0.5);
    poly([P(1.3, 0.15, 0), P(1.85, 0.15, 0), P(1.85, 1.25, 0), P(1.3, 1.25, 0)], '#CBB592', BG_INK, 0.5);
    for (let z = 0; z < 6; z++) circ(1.3, 1.5, z, 18, '#A49A8C'); circ(1.3, 1.5, 6, 18, '#BDB4A6', BG_INK); circ(1.3, 1.5, 6, 6, '#8A8174');
    const m = P(1.3, 1.5, 6); ctx.fillStyle = '#9C9386'; ctx.fillRect(m[0] - 2, m[1] - 18, 4, 12); poly([[m[0] - 9, m[1] - 14], [m[0] + 9, m[1] - 10], [m[0] + 9, m[1] - 2], [m[0] - 9, m[1] - 6]], '#B0A79A', BG_INK, 0.8);
    for (let k = 0; k < 4; k++) { const g = P(0.35 + k * 0.18, 1.7, 0); ctx.fillStyle = '#B5653E'; ctx.beginPath(); ctx.ellipse(g[0], g[1] - 6, 4, 6, 0, 0, 7); ctx.fill(); ctx.strokeStyle = BG_INK; ctx.lineWidth = 0.6; ctx.stroke(); ctx.fillStyle = '#8A4A2A'; ctx.fillRect(g[0] - 2, g[1] - 13, 4, 2); }
    for (const [x, y] of [[1.6, 0.4], [1.6, 0.85]]) { const b = P(x, y, 0); ctx.fillStyle = '#7A4E2A'; ctx.beginPath(); ctx.ellipse(b[0], b[1] - 6, 5, 7, 0, 0, 7); ctx.fill(); ctx.strokeStyle = '#3A2A1C'; ctx.stroke(); ctx.strokeStyle = '#2A2A2A'; ctx.beginPath(); ctx.moveTo(b[0] - 5, b[1] - 9); ctx.lineTo(b[0] + 5, b[1] - 9); ctx.moveTo(b[0] - 5, b[1] - 3); ctx.lineTo(b[0] + 5, b[1] - 3); ctx.stroke(); }
  },
  piazza(pen, o, R, opt) {
    const { P, ctx } = pen, m = (bgPzInfo().side[o.id] || '1111');
    const q = [P(0, 0, 0), P(2, 0, 0), P(2, 2, 0), P(0, 2, 0)];
    ctx.beginPath(); q.forEach((p, k) => (k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.fillStyle = '#D9CBB0'; ctx.fill();
    ctx.strokeStyle = 'rgba(120,100,70,0.35)'; ctx.lineWidth = 0.7;
    for (let k = 1; k < 8; k++) { let a = P(k / 4, 0, 0), b = P(k / 4, 2, 0); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); a = P(0, k / 4, 0); b = P(2, k / 4, 0); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
    // cordolo di pietra solo dove la piazza finisce
    const sides = [[[0, 0], [2, 0], [0, 0.12]], [[2, 0], [2, 2], [-0.12, 0]], [[0, 2], [2, 2], [0, -0.12]], [[0, 0], [0, 2], [0.12, 0]]];
    sides.forEach(([a, b, d], k) => {
      if (m[k] !== '1') return;
      const p1 = P(a[0], a[1], 0), p2 = P(b[0], b[1], 0), p3 = P(b[0] + d[0], b[1] + d[1], 0), p4 = P(a[0] + d[0], a[1] + d[1], 0);
      ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.lineTo(p3[0], p3[1]); ctx.lineTo(p4[0], p4[1]); ctx.closePath(); ctx.fillStyle = '#BFAE8E'; ctx.fill();
      ctx.strokeStyle = BG_INK; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke();
    });
  },
  pztree(pen, o, R, opt) {
    const { poly, P, ctx, circ } = pen, big = o.big;
    if (big) poly([P(0.45, 0.45, 0), P(1.55, 0.45, 0), P(1.55, 1.55, 0), P(0.45, 1.55, 0)], '#C9B38E', '#8A7656', 1);
    else poly([P(0.6, 0.6, 0), P(1.4, 0.6, 0), P(1.4, 1.4, 0), P(0.6, 1.4, 0)], '#C9B38E', '#8A7656', 1);
    const r = big ? 19 : 15;
    for (let z = 0; z < 4; z++) circ(1, 1, z, r, '#B9A27C'); circ(1, 1, 4, r, '#A08A64', BG_INK); circ(1, 1, 4, r - 4, '#6A4A2E');
    bgTree(pen, 1, 1, 'ulivo', big ? 1.55 : 1.25);
    if (o.bench) for (const [x, y, rot] of [[0.3, 1.0, 0], [1.7, 1.0, 0], [1.0, 1.75, 1]]) { const a = P(x - (rot ? 0.18 : 0), y - (rot ? 0 : 0.18), 5), b = P(x + (rot ? 0.18 : 0), y + (rot ? 0 : 0.18), 5); ctx.strokeStyle = '#6B4A2E'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
  },
  pzlamp(pen, o, R, opt) {
    const { P, ctx } = pen, a = P(0.5, 0.5, 0), b = P(0.5, 0.5, 26);
    ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.beginPath(); ctx.ellipse(a[0] + 2, a[1], 4, 1.6, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = '#2A2A2A'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    ctx.fillStyle = opt.night ? '#FFE08A' : '#E8E2D0'; ctx.beginPath(); ctx.arc(b[0], b[1], 2.8, 0, 7); ctx.fill(); ctx.strokeStyle = BG_INK; ctx.lineWidth = 0.6; ctx.stroke();
  },
  edicola(pen, o, R, opt) {
    const { box, P, ctx, poly } = pen;
    box(0.35, 0.35, 0.3, 0.3, 0, 24, '#E8DCC2');
    poly(pen.qL(0.4, 0.6, 0.65, 8, 20), '#2E4A8C', BG_INK, 0.6);
    const m = P(0.5, 0.65, 10); ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.moveTo(m[0], m[1] - 9); ctx.lineTo(m[0] + 2.5, m[1]); ctx.lineTo(m[0] - 2.5, m[1]); ctx.fill(); ctx.fillStyle = '#7FB4E8'; ctx.beginPath(); ctx.arc(m[0], m[1] - 9, 1.8, 0, 7); ctx.fill();
    poly([P(0.3, 0.3, 24), P(0.7, 0.3, 24), P(0.7, 0.7, 24), P(0.3, 0.7, 24)], '#B4533A', BG_INK, 0.6);
    ctx.fillStyle = '#E8334A'; for (let k = 0; k < 5; k++) { const p = P(0.38 + k * 0.06, 0.72, 2); ctx.beginPath(); ctx.arc(p[0], p[1], 1.6, 0, 7); ctx.fill(); }
    if (opt.night) { const c = P(0.5, 0.66, 4); ctx.fillStyle = 'rgba(255,190,90,0.9)'; ctx.beginPath(); ctx.arc(c[0], c[1], 1.6, 0, 7); ctx.fill(); }
  },
  lampione(pen, o, R, opt) {
    const { P, ctx } = pen, a = P(0.5, 0.5, 0), b = P(0.5, 0.5, 32);
    ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.beginPath(); ctx.ellipse(a[0] + 2, a[1], 5, 2, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = '#2A2A2A'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.beginPath(); ctx.moveTo(b[0], b[1]); ctx.quadraticCurveTo(b[0] + 6, b[1] - 4, b[0] + 8, b[1] + 1); ctx.stroke();
    ctx.fillStyle = opt.night ? '#FFE08A' : '#EDE6D2'; ctx.beginPath(); ctx.moveTo(b[0] + 5, b[1] + 1); ctx.lineTo(b[0] + 11, b[1] + 1); ctx.lineTo(b[0] + 9.5, b[1] + 6); ctx.lineTo(b[0] + 6.5, b[1] + 6); ctx.closePath(); ctx.fill(); ctx.strokeStyle = BG_INK; ctx.lineWidth = 0.7; ctx.stroke();
  },
  orto(pen, o, R, opt) {
    const { poly, P, ctx } = pen;
    poly([P(0.08, 0.08, 0), P(0.92, 0.08, 0), P(0.92, 0.92, 0), P(0.08, 0.92, 0)], '#7A5536', BG_INK, 0.6);
    for (let k = 0; k < 4; k++) { const y = 0.2 + k * 0.2; poly([P(0.12, y - 0.05, 0), P(0.88, y - 0.05, 0), P(0.88, y + 0.05, 0), P(0.12, y + 0.05, 0)], '#5E3E26'); for (let q = 0; q < 5; q++) { const p = P(0.2 + q * 0.16, y, 0); ctx.fillStyle = '#4E8E3A'; ctx.beginPath(); ctx.arc(p[0], p[1] - 3, 3, 0, 7); ctx.fill(); if ((q + k) % 2 === 0) { ctx.fillStyle = k % 2 ? '#E03A2A' : '#E8334A'; ctx.beginPath(); ctx.arc(p[0] + 1, p[1] - 4, 1.4, 0, 7); ctx.fill(); } } }
    ctx.strokeStyle = '#8A6A44'; ctx.lineWidth = 1.2;
    for (let k = 0; k <= 6; k++) { const a = P(0.08 + k * 0.14, 0.92, 0), b = P(0.08 + k * 0.14, 0.92, 8); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); const c = P(0.92, 0.08 + k * 0.14, 0), d = P(0.92, 0.08 + k * 0.14, 8); ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.stroke(); }
    for (const z of [3, 7]) { let a = P(0.08, 0.92, z), b = P(0.92, 0.92, z); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); a = P(0.92, 0.92, z); b = P(0.92, 0.08, z); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
  },
  giardino(pen, o, R, opt) {
    const { poly, P, ctx } = pen;
    poly([P(0.1, 0.1, 0), P(0.9, 0.1, 0), P(0.9, 0.9, 0), P(0.1, 0.9, 0)], '#7DB05A', '#4E7A36', 0.6);
    const fl = ['#E8334A', '#F2A6C8', '#FFFFFF', '#F2C94C', '#B04AA8'];
    for (let k = 0; k < 7; k++) { const p = P(0.2 + R() * 0.6, 0.2 + R() * 0.6, 0); ctx.fillStyle = '#3F7A34'; ctx.beginPath(); ctx.arc(p[0], p[1] - 4, 5, 0, 7); ctx.fill(); ctx.fillStyle = fl[k % 5]; for (let q = 0; q < 5; q++) { ctx.beginPath(); ctx.arc(p[0] + Math.cos(q * 1.3) * 3, p[1] - 5 + Math.sin(q * 1.3) * 2, 1.4, 0, 7); ctx.fill(); } }
    const v = P(0.75, 0.8, 0); ctx.fillStyle = '#B5653E'; ctx.fillRect(v[0] - 3, v[1] - 6, 6, 6); ctx.fillStyle = '#4E9A3A'; ctx.beginPath(); ctx.arc(v[0], v[1] - 8, 3.5, 0, 7); ctx.fill();
    // arco di bouganville
    ctx.strokeStyle = '#5B4330'; ctx.lineWidth = 1.4; const a = P(0.15, 0.85, 0), b = P(0.15, 0.85, 18); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    ctx.fillStyle = '#C2338A'; for (let k = 0; k < 9; k++) { ctx.beginPath(); ctx.arc(b[0] + (k % 3) * 3 - 3, b[1] + Math.floor(k / 3) * 3, 2, 0, 7); ctx.fill(); }
  },
  sasso(pen, o, R) {
    const { P, ctx } = pen;
    for (let k = 0; k < 3; k++) { const p = P(0.3 + R() * 0.4, 0.3 + R() * 0.4, 0); const r = 6 + R() * 6; const g = ctx.createRadialGradient(p[0] - r / 3, p[1] - r, 1, p[0], p[1] - r / 2, r * 1.3); g.addColorStop(0, '#C8C2B6'); g.addColorStop(1, '#7C766C'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(p[0], p[1] - r / 2, r, r * 0.65, 0, 0, 7); ctx.fill(); ctx.strokeStyle = BG_INK; ctx.lineWidth = 0.7; ctx.stroke(); }
    ctx.fillStyle = '#6E9A44'; for (let k = 0; k < 5; k++) { const p = P(0.2 + R() * 0.6, 0.6 + R() * 0.3, 0); ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0] - 1.5, p[1] - 5); ctx.lineTo(p[0] + 2, p[1]); ctx.fill(); }
  },
};
/* mura, torri e porta: si collegano ai pezzi vicini */
function bgWallLinks(o) { const L = (x, y) => bgIs(x, y, ['mura', 'torre', 'porta']) || (bgAt(x, y) && bgAt(x, y).k === 'mura'); return { n: L(o.x, o.y - 1), s: L(o.x, o.y + 1), w: L(o.x - 1, o.y), e: L(o.x + 1, o.y) }; }
function bgDrawWall(pen, o, links, ruin) {
  const { box, P, ctx } = pen, col = '#CDB78F', H = ruin ? 14 : 24, T = 0.26, c0 = 0.5 - T / 2;
  const merli = (x0, y0, w, d, z) => { const L = Math.max(w, d), n = Math.max(2, Math.round(L / 0.11)); for (let k = 0; k < n; k += 2) { const t = k / n; if (w > d) box(x0 + t * w, y0 + d * 0.15, w / n, d * 0.7, z, 4, col); else box(x0 + w * 0.15, y0 + t * d, w * 0.7, d / n, z, 4, col); } };
  // i pezzi dietro prima di quelli davanti
  if (links.n) box(c0, 0, T, c0, 0, H, col, { r: bgShade(col, 0.74) });
  if (links.w) box(0, c0, c0, T, 0, H, col);
  box(c0, c0, T, T, 0, H + 2, col);
  if (links.e) box(c0 + T, c0, 1 - c0 - T, T, 0, H, col);
  if (links.s) box(c0, c0 + T, T, 1 - c0 - T, 0, H, col, { r: bgShade(col, 0.74) });
  if (!ruin) { if (links.n) merli(c0, 0, T, c0, H); if (links.w) merli(0, c0, c0, T, H); if (links.e) merli(c0 + T, c0, 1 - c0 - T, T, H); if (links.s) merli(c0, c0 + T, T, 1 - c0 - T, H); }
  // pietre in vista
  ctx.strokeStyle = 'rgba(90,70,40,0.35)'; ctx.lineWidth = 0.6;
  for (let z = 6; z < H; z += 6) { const a = P(c0, c0 + T, z), b = P(c0 + T, c0 + T, z); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
  if (ruin) { ctx.fillStyle = '#9C8C70'; for (let k = 0; k < 5; k++) { const p = P(0.3 + Math.random() * 0.5, 0.6 + Math.random() * 0.3, 0); ctx.beginPath(); ctx.ellipse(p[0], p[1], 3, 1.6, 0, 0, 7); ctx.fill(); } }
}
function bgDrawTower(pen, o, links) {
  const { box, P, ctx } = pen, col = '#C9B289', H = 58;
  bgDrawWall(pen, o, links, false);
  box(0.2, 0.2, 0.6, 0.6, 0, H, col);
  for (let k = 0; k < 4; k++) { box(0.2 + k * 0.15, 0.68, 0.08, 0.12, H, 7, col); box(0.68, 0.2 + k * 0.15, 0.12, 0.08, H, 7, col); }
  pen.door('L', 0.44, 0.8, 0.1, 10, '#1F1A16', true); pen.door('R', 0.45, 0.8, 0.1, 10, '#1F1A16', true);
  pen.door('L', 0.44, 0.8, 0.08, 1, '#1F1A16');
  ctx.strokeStyle = 'rgba(90,70,40,0.35)'; ctx.lineWidth = 0.6; for (let z = 8; z < H; z += 8) { const a = P(0.2, 0.8, z), b = P(0.8, 0.8, z), c = P(0.8, 0.2, z); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.stroke(); }
}
function bgDrawGate(pen, o, links) {
  const { box, P, ctx, poly } = pen, col = '#C9B289', H = 40;
  const alongX = links.w || links.e || !(links.n || links.s);
  if (alongX) { box(0, 0.3, 0.3, 0.4, 0, H, col); box(0.7, 0.3, 0.3, 0.4, 0, H, col); box(0, 0.3, 1, 0.4, H - 12, 12, col); pen.door('L', 0.3, 0.7, 0.4, 14, '#2A2018', true); for (let k = 0; k < 5; k++) box(k * 0.22, 0.6, 0.11, 0.1, H, 6, col); }
  else { box(0.3, 0, 0.4, 0.3, 0, H, col); box(0.3, 0.7, 0.4, 0.3, 0, H, col); box(0.3, 0, 0.4, 1, H - 12, 12, col); pen.door('R', 0.3, 0.7, 0.4, 14, '#2A2018', true); for (let k = 0; k < 5; k++) box(0.6, k * 0.22, 0.1, 0.11, H, 6, col); }
  const s = P(0.5, alongX ? 0.7 : 0.5, H - 6); ctx.fillStyle = '#C9A13B'; ctx.beginPath(); ctx.arc(s[0], s[1], 3, 0, 7); ctx.fill();
}
/* cantiere: impalcature di legno intorno alla sagoma */
function bgDrawSite(pen, o, D, prog) {
  const { box, P, ctx, poly } = pen, w = D.w - 0.2, d = D.d - 0.2, h = 18 + 30 * prog * (D.w > 1 ? 1.4 : 1);
  poly([P(0.05, 0.05, 0), P(D.w - 0.05, 0.05, 0), P(D.w - 0.05, D.d - 0.05, 0), P(0.05, D.d - 0.05, 0)], '#B8A07A', BG_INK, 0.5);
  box(0.1, 0.1, w, d, 0, Math.max(4, h * 0.7), '#D9C7A6');
  ctx.strokeStyle = '#8A6038'; ctx.lineWidth = 1.4;
  const posts = [[0.08, D.d - 0.08], [D.w - 0.08, D.d - 0.08], [D.w - 0.08, 0.08], [D.w / 2, D.d - 0.08]];
  for (const [x, y] of posts) { const a = P(x, y, 0), b = P(x, y, h + 8); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
  for (let z = 10; z < h + 8; z += 12) { let a = P(0.08, D.d - 0.08, z), b = P(D.w - 0.08, D.d - 0.08, z), c = P(D.w - 0.08, 0.08, z); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.stroke(); }
  const a = P(0.08, D.d - 0.08, 0), b = P(D.w / 2, D.d - 0.08, h); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
  // mattoni e secchio
  const m = P(D.w * 0.7, D.d + 0.05, 0); ctx.fillStyle = '#B4533A'; for (let k = 0; k < 6; k++) ctx.fillRect(m[0] - 8 + (k % 3) * 5, m[1] - 4 - Math.floor(k / 3) * 3, 4.5, 2.5);
  ctx.fillStyle = '#E8C45A'; ctx.beginPath(); ctx.moveTo(m[0] + 10, m[1] - 6); ctx.lineTo(m[0] + 16, m[1] - 6); ctx.lineTo(m[0] + 15, m[1]); ctx.lineTo(m[0] + 11, m[1]); ctx.fill();
}
/* stradina: ciottoli, con il bordo dove finisce */
function bgDrawRoad(pen, o) {
  const { poly, P, ctx } = pen;
  poly([P(0, 0, 0), P(1, 0, 0), P(1, 1, 0), P(0, 1, 0)], '#CDBD9C', null);
  const R = bgRng(7 + (o.k === 'strada' ? 3 : 0));
  for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) { const p = P((i + 0.5 + (R() - 0.5) * 0.3) / 6, (j + 0.5 + (R() - 0.5) * 0.3) / 6, 0); ctx.fillStyle = ['#BFAE8C', '#D8C9AA', '#B3A280', '#C9B996'][Math.floor(R() * 4)]; ctx.beginPath(); ctx.ellipse(p[0], p[1], 3.6, 1.9, 0, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(90,72,48,0.35)'; ctx.lineWidth = 0.5; ctx.stroke(); }
  const L = (x, y) => bgIs(x, y, ['strada', 'piazza', 'porta']);
  ctx.strokeStyle = '#8F7C5C'; ctx.lineWidth = 1.6;
  const ed = (a, b) => { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); };
  if (!L(o.x, o.y - 1)) ed(P(0, 0, 0), P(1, 0, 0)); if (!L(o.x + 1, o.y)) ed(P(1, 0, 0), P(1, 1, 0)); if (!L(o.x, o.y + 1)) ed(P(1, 1, 0), P(0, 1, 0)); if (!L(o.x - 1, o.y)) ed(P(0, 1, 0), P(0, 0, 0));
}

/* ---------- disegni in memoria (si rifanno solo se cambia qualcosa) ---------- */
const BG_HMAX = { casa: 90, palazzo: 120, municipio: 130, chiesa: 150, torre: 80, porta: 60, mura: 40, forno: 60, bottega: 70, osteria: 70, frantoio: 80, piazza: 20, pztree: 70, pzlamp: 40, ulivo: 50, cipresso: 60, orto: 20, giardino: 30, edicola: 40, lampione: 45, fontana: 40, strada: 4, sasso: 25 };
const BG_SHARED = ['strada', 'mura', 'torre', 'porta', 'ulivo', 'cipresso', 'lampione', 'orto', 'fontana', 'edicola', 'pztree', 'pzlamp'];
const BG_VARIANT = ['casa', 'bottega', 'giardino', 'sasso', 'osteria', 'forno'];   // 8 stili che si ripetono: meno memoria
const bgVar = (o) => (BG_VARIANT.includes(o.k) ? o.id % 8 : o.id);
function bgSpriteKey(o, night, extra) { return [o.k, BG_SHARED.includes(o.k) && o.id ? 's' : 'v' + bgVar(o), o.lv, o.st, night ? 1 : 0, extra || ''].join('|'); }
function bgSprite(o, night) {
  const D = bgDef(o.k), s = BG.scale;
  let links = null, extra = '';
  if (['mura', 'torre', 'porta'].includes(o.k)) { links = bgWallLinks(o); extra = (links.n ? 'n' : '') + (links.s ? 's' : '') + (links.w ? 'w' : '') + (links.e ? 'e' : ''); }
  if (o.k === 'strada') { const L = (x, y) => (bgIs(x, y, ['strada', 'piazza', 'porta']) ? 1 : 0); extra = '' + L(o.x, o.y - 1) + L(o.x + 1, o.y) + L(o.x, o.y + 1) + L(o.x - 1, o.y); }
  if (o.k === 'piazza') extra = bgPzInfo().side[o.id] || '1111';
  if (o.k === 'pztree') extra = (o.big ? 'B' : 'b') + (o.bench ? 'p' : '');
  const key = bgSpriteKey(o, night && o.k !== 'strada', extra) + '|' + s;
  if (BG.spr[key]) return BG.spr[key];
  const hm = BG_HMAX[o.k] || 80, pad = 14;
  const w = (D.w + D.d) * BG_TW / 2 + pad * 2, h = (D.w + D.d) * BG_TH / 2 + hm + pad * 2;
  const cv = document.createElement('canvas'); cv.width = Math.ceil(w * s); cv.height = Math.ceil(h * s);
  const ctx = cv.getContext('2d'); ctx.scale(s, s); ctx.lineJoin = 'round';
  const ax = D.d * BG_TW / 2 + pad, ay = hm + pad, pen = bgPen(ctx, ax, ay), R = bgRng(bgVar(o) * 7919 + ((P.borgo ? P.borgo.seed : 7) % 1000));
  const opt = { night };
  if (o.st === 'build' || o.st === 'up') bgDrawSite(pen, o, D, 0.5);
  else if (o.k === 'strada') bgDrawRoad(pen, o);
  else if (o.k === 'mura') bgDrawWall(pen, o, links, o.st === 'ruin');
  else if (o.k === 'torre') bgDrawTower(pen, o, links);
  else if (o.k === 'porta') bgDrawGate(pen, o, links);
  else if (o.k === 'ulivo' || o.k === 'cipresso') bgTree(pen, 0.5, 0.5, o.k, o.k === 'ulivo' ? 1.05 : 1);
  else if (o.st === 'ruin') (o.k === 'chiesa' ? BG_DRAW.chiesaRuin : BG_DRAW.ruin)(pen, o, R, opt);
  else if (BG_DRAW[o.k]) BG_DRAW[o.k](pen, o, R, opt);
  // si taglia via il bordo vuoto: meno pixel da disegnare a ogni fotogramma
  let S = { cv, ox: ax, oy: ay, w, h };
  try {
    const W = cv.width, H = cv.height, d = ctx.getImageData(0, 0, W, H).data; let x0 = W, y0 = H, x1 = -1, y1 = -1;
    for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) if (d[(y * W + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 > 0) {
      x0 = Math.max(0, x0 - 3); y0 = Math.max(0, y0 - 3); x1 = Math.min(W - 1, x1 + 3); y1 = Math.min(H - 1, y1 + 3);
      const c2 = document.createElement('canvas'); c2.width = x1 - x0 + 1; c2.height = y1 - y0 + 1; c2.getContext('2d').drawImage(cv, -x0, -y0);
      S = { cv: c2, ox: ax - x0 / s, oy: ay - y0 / s, w: c2.width / s, h: c2.height / s };
    }
  } catch (e) { /* niente */ }
  BG.spr[key] = S;
  return S;
}
function bgSpriteClear() { for (const k of Object.keys(BG.spr)) bgDropSprite(k); BG.spr = {}; }
function bgDropSprite(k) { const S = BG.spr[k]; if (S && S.tex) { try { S.tex.destroy(true); } catch (e) { /* niente */ } } delete BG.spr[k]; }

/* ---------- terreno e paesaggio (un'immagine sola, rifatta quando cambia lo zoom) ---------- */
function bgGround(night) {
  const s = Math.min(BG.scale, 1.5), key = s + '|' + (night ? 1 : 0) + '|' + BG_N;
  if (BG.ground && BG.gkey === key) return BG.ground;
  const W = BG_N * BG_TW + 900, H = BG_N * BG_TH + 700, ox = W / 2, oy = 330;
  const cv = document.createElement('canvas'); cv.width = Math.ceil(W * s); cv.height = Math.ceil(H * s);
  const ctx = cv.getContext('2d'); ctx.scale(s, s);
  const P = (x, y, z) => [ox + (x - y) * BG_TW / 2, oy + (x + y) * BG_TH / 2 - (z || 0)];
  // valle intorno: colline lontane, mare, campi
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, night ? '#20304A' : '#9FD2EA'); g.addColorStop(0.18, night ? '#2B3D52' : '#CBE7F0'); g.addColorStop(0.2, night ? '#1E3A4A' : '#5FA3C4'); g.addColorStop(0.34, night ? '#24424A' : '#7DB9CF'); g.addColorStop(0.36, night ? '#2E4430' : '#9DBB72'); g.addColorStop(1, night ? '#24361F' : '#6E9A4A');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = night ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.35)'; for (let k = 0; k < 30; k++) { ctx.fillRect(Math.random() * W, H * 0.2 + Math.random() * H * 0.14, 10 + Math.random() * 26, 1.2); }
  // colline e boschi della valle
  const R = bgRng(bgData().seed);
  for (let k = 0; k < 9; k++) { const x = R() * W, y = H * 0.36 + R() * H * 0.12, r = 120 + R() * 160; ctx.fillStyle = night ? 'rgba(40,70,40,0.6)' : ['#8DB064', '#84A85C', '#97B86E'][k % 3]; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.32, 0, Math.PI, 0); ctx.fill(); }
  for (let k = 0; k < 160; k++) { const x = R() * W, y = H * 0.4 + R() * H * 0.6; ctx.fillStyle = night ? 'rgba(20,40,20,0.7)' : ['#5E8A44', '#6D9A50', '#4F7A3A'][k % 3]; ctx.beginPath(); ctx.arc(x, y, 4 + R() * 6, 0, 7); ctx.fill(); }
  // la collina: fianchi di roccia sotto il pianoro
  const T = P(0, 0), Rt = P(BG_N, 0), B = P(BG_N, BG_N), L = P(0, BG_N), drop = 70;
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(B[0], B[1] + drop + 30, BG_N * BG_TW * 0.6, 60, 0, 0, 7); ctx.fill();
  const rock = (a, b, c1, c2) => { const gg = ctx.createLinearGradient(0, a[1], 0, a[1] + drop); gg.addColorStop(0, c1); gg.addColorStop(1, c2); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(b[0], b[1] + drop); ctx.lineTo(a[0], a[1] + drop); ctx.closePath(); ctx.fillStyle = gg; ctx.fill(); ctx.strokeStyle = BG_INK; ctx.lineWidth = 1; ctx.stroke(); };
  rock(L, B, night ? '#6A5A44' : '#B49A72', night ? '#3E3428' : '#7C6648');
  rock(B, Rt, night ? '#584A38' : '#9A8260', night ? '#342C22' : '#6A5640');
  ctx.strokeStyle = 'rgba(60,40,20,0.35)'; ctx.lineWidth = 1;
  for (let k = 1; k < 5; k++) { const dy = drop * k / 5 + (k % 2) * 4; ctx.beginPath(); ctx.moveTo(L[0], L[1] + dy); ctx.lineTo(B[0], B[1] + dy); ctx.lineTo(Rt[0], Rt[1] + dy); ctx.stroke(); }
  for (let k = 0; k < 40; k++) { const t = R(), side = R() < 0.5; const a = side ? [L[0] + (B[0] - L[0]) * t, L[1] + (B[1] - L[1]) * t] : [B[0] + (Rt[0] - B[0]) * t, B[1] + (Rt[1] - B[1]) * t]; ctx.fillStyle = night ? '#2E4428' : '#5E8A3A'; ctx.beginPath(); ctx.arc(a[0], a[1] + 4 + R() * drop * 0.8, 3 + R() * 4, 0, 7); ctx.fill(); }
  // il pianoro d'erba, a caselle con piccole differenze
  for (let i = 0; i < BG_N; i++) for (let j = 0; j < BG_N; j++) {
    const v = R(), c = night ? ['#3E5A2E', '#425F31', '#3A552B'] : ['#93BC5E', '#9CC466', '#8AB456', '#A2C86C'];
    ctx.beginPath(); const a = P(i, j), b = P(i + 1, j), c2 = P(i + 1, j + 1), d = P(i, j + 1); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c2[0], c2[1]); ctx.lineTo(d[0], d[1]); ctx.closePath();
    ctx.fillStyle = c[Math.floor(v * c.length)]; ctx.fill();
    for (let q = 0; q < 3; q++) { const p = P(i + R(), j + R()); ctx.strokeStyle = night ? 'rgba(20,40,10,0.5)' : 'rgba(60,110,30,0.55)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0] - 1, p[1] - 3); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0] + 1.5, p[1] - 3); ctx.stroke(); }
    if (R() < 0.12) { const p = P(i + R(), j + R()); ctx.fillStyle = ['#FFFFFF', '#F2C94C', '#E8A0C8'][Math.floor(R() * 3)]; ctx.beginPath(); ctx.arc(p[0], p[1], 1.3, 0, 7); ctx.fill(); }
  }
  ctx.strokeStyle = BG_INK; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(T[0], T[1]); ctx.lineTo(Rt[0], Rt[1]); ctx.lineTo(B[0], B[1]); ctx.lineTo(L[0], L[1]); ctx.closePath(); ctx.stroke();
  BG.ground = { cv, ox, oy, W, H, s }; BG.gkey = key;
  return BG.ground;
}

/* ---------- telecamera e disegno della scena ---------- */
const bgNight = () => { const h = new Date().getHours(); return h >= 20 || h < 6; };
function bgFit() {
  const cv = BG.cv; if (!cv) return;
  const r = cv.parentNode.getBoundingClientRect(); BG.dpr = Math.min(2.5, window.devicePixelRatio || 1);
  BG.w = r.width; BG.h = r.height; cv.width = Math.round(r.width * BG.dpr); cv.height = Math.round(r.height * BG.dpr);
  cv.style.width = r.width + 'px'; cv.style.height = r.height + 'px';
  if (BGX.app) { try { BGX.app.resize(); } catch (e) { /* niente */ } }
  if (!BG.camSet) { BG.cam.z = Math.max(0.6, Math.min(1.3, r.width / 470)); BG.cam.x = 0; BG.cam.y = BG_N * BG_TH / 2 - 30; BG.camSet = true; }
  bgScale();
}
function bgScale() { const s = BG.px ? Math.max(1.5, Math.min(2.25, Math.round(BG.dpr * 1.2 * 4) / 4)) : Math.max(0.75, Math.min(4, Math.round(BG.cam.z * BG.dpr * 4) / 4)); if (s !== BG.scale) { BG.scale = s; bgSpriteClear(); BG.ground = null; } }
const bgW2S = (wx, wy) => [(wx - BG.cam.x) * BG.cam.z + BG.w / 2, (wy - BG.cam.y) * BG.cam.z + BG.h / 2];
const bgS2W = (sx, sy) => [(sx - BG.w / 2) / BG.cam.z + BG.cam.x, (sy - BG.h / 2) / BG.cam.z + BG.cam.y];
function bgS2T(sx, sy) { const [wx, wy] = bgS2W(sx, sy); const a = wy / (BG_TH / 2), b = wx / (BG_TW / 2); return [Math.floor((a + b) / 2), Math.floor((a - b) / 2)]; }
function bgClampCam() { const m = BG_N * BG_TW / 2; BG.cam.x = Math.max(-m, Math.min(m, BG.cam.x)); BG.cam.y = Math.max(-40, Math.min(BG_N * BG_TH + 40, BG.cam.y)); BG.cam.z = Math.max(0.45, Math.min(2.6, BG.cam.z)); }
const BG_FLAT = ['strada', 'piazza', 'orto', 'giardino'];
function bgDraw() {
  const c = BG.ctx, z = BG.cam.z, night = bgNight(); if (!c) return;
  c.setTransform(BG.dpr, 0, 0, BG.dpr, 0, 0);
  if (BG.px) c.clearRect(0, 0, BG.w, BG.h);
  const G = bgGround(BG.px ? false : night), g0 = bgW2S(-G.ox, -G.oy);
  if (!BG.px) { c.fillStyle = night ? '#20304A' : '#9FD2EA'; c.fillRect(0, 0, BG.w, BG.h); }
  if (!BG.px) { // solo il pezzo di terreno che si vede
    const sx = Math.max(0, -g0[0] / z), sy = Math.max(0, -g0[1] / z), sw = Math.min(G.W - sx, BG.w / z), sh = Math.min(G.H - sy, BG.h / z);
    if (sw > 0 && sh > 0) c.drawImage(G.cv, sx * G.s, sy * G.s, sw * G.s, sh * G.s, g0[0] + sx * z, g0[1] + sy * z, sw * z, sh * z);
  }
  const B = bgData(), list = [], now = Date.now();
  BG.hits = [];
  for (const o of B.b) list.push({ o, d: o.x + o.y + bgDef(o.k).w + bgDef(o.k).d, flat: BG_FLAT.includes(o.k) && o.st === 'ok' });
  for (const o of bgPzInfo().deco) list.push({ o, d: o.dep, flat: false });
  for (const w of BG.walkers) list.push({ w, d: w.x + w.y + 1.0 });
  list.sort((a, b) => (b.flat - a.flat) || (a.d - b.d));
  // griglia quando si costruisce
  if (BG.place || BG.move) { c.strokeStyle = 'rgba(255,255,255,0.22)'; c.lineWidth = 1; for (let k = 0; k <= BG_N; k++) { let a = bgW2S(...bgIso(k, 0)), b = bgW2S(...bgIso(k, BG_N)); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); a = bgW2S(...bgIso(0, k)); b = bgW2S(...bgIso(BG_N, k)); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); } }
  for (const it of list) {
    if (it.w) { bgDrawWalker(c, it.w); continue; }
    const o = it.o, D = bgDef(o.k), p = bgW2S(...bgIso(o.x, o.y));
    if (p[0] < -200 * z || p[0] > BG.w + 200 * z || p[1] < -60 * z || p[1] > BG.h + 200 * z) continue;
    const S = bgSprite(o, night), dx = p[0] - S.ox * z, dy = p[1] - S.oy * z;
    if (!BG.px) c.drawImage(S.cv, dx, dy, S.w * z, S.h * z);
    if (!it.flat && o.k !== 'strada' && !o.virt) BG.hits.push({ o, x: dx, y: dy, w: S.w * z, h: S.h * z });
  }
  // cose che si muovono sopra gli edifici
  for (const o of B.b) {
    const D = bgDef(o.k), top = bgW2S(...bgIso(o.x + D.w / 2, o.y + D.d / 2));
    if (o.st === 'ok' && o.k === 'fontana') bgWater(c, o);
    if (o.st === 'ok' && (o.k === 'forno' || (o.k === 'casa' && o.id % 3 === 0) || o.k === 'palazzo' || o.k === 'osteria')) bgSmoke(c, o);
    if (o.st === 'ok' && o.k === 'municipio') bgFlags(c, o);
    if (o.st === 'build' || o.st === 'up') {
      const pr = Math.max(0, Math.min(1, (now - o.at) / Math.max(1, o.end - o.at))), y = top[1] - 70 * z;
      c.fillStyle = 'rgba(26,26,26,0.85)'; bgRR(c, top[0] - 34, y - 9, 68, 18, 9); c.fill();
      c.fillStyle = '#F2C94C'; bgRR(c, top[0] - 32, y - 7, 64 * pr, 14, 7); c.fill();
      c.fillStyle = '#fff'; c.font = 'bold 11px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('🔨 ' + bgFmt(o.end - now), top[0], y + 0.5);
    } else if (bgRate(o) > 0) {
      const st = bgStored(o, now), cap = bgRate(o) * BG_CAP_H;
      if (st >= Math.max(5, cap * 0.08)) {
        const y = top[1] - (BG_HMAX[o.k] || 60) * 0.75 * z - 6 + Math.sin(BG.t / 18 + o.id) * 3, full = st >= cap - 1;
        c.fillStyle = full ? '#FFE16B' : '#FFF8E6'; c.strokeStyle = '#1A1A1A'; c.lineWidth = 2; bgRR(c, top[0] - 24, y - 12, 48, 24, 12); c.fill(); c.stroke();
        c.fillStyle = '#2A2218'; c.font = 'bold 12px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('🪙' + st, top[0], y + 1);
        BG.hits.unshift({ coin: o, x: top[0] - 28, y: y - 16, w: 56, h: 32 });
      }
    }
  }
  if (!BG.px) for (const b of BG.birds) bgDrawBird(c, b);
  // selezione e posizionamento
  if (BG.sel) bgOutline(c, BG.sel.x, BG.sel.y, bgDef(BG.sel.k).w, bgDef(BG.sel.k).d, '#FFE14D');
  if (BG.place && BG.place.x != null) {
    const D = bgDef(BG.place.k), ok = bgFree(BG.place.x, BG.place.y, D.w, D.d);
    c.save(); c.globalAlpha = 0.75; const tmp = { id: 0, k: BG.place.k, x: BG.place.x, y: BG.place.y, lv: 1, st: 'ok' }; const S = bgSprite(tmp, false), p = bgW2S(...bgIso(tmp.x, tmp.y)); c.drawImage(S.cv, p[0] - S.ox * z, p[1] - S.oy * z, S.w * z, S.h * z); c.restore();
    bgOutline(c, BG.place.x, BG.place.y, D.w, D.d, ok ? '#5CE07A' : '#FF5A4A', true);
  }
  if (BG.move) {
    const m = BG.move, o = m.o, D = bgDef(o.k);
    bgOutline(c, o.x, o.y, D.w, D.d, '#FFE14D');
    if (m.x != null) {
      const ok = bgFreeFor(o, m.x, m.y);
      c.save(); c.globalAlpha = 0.75; const tmp = Object.assign({}, o, { x: m.x, y: m.y }); const S = bgSprite(tmp, false), p = bgW2S(...bgIso(m.x, m.y)); c.drawImage(S.cv, p[0] - S.ox * z, p[1] - S.oy * z, S.w * z, S.h * z); c.restore();
      bgOutline(c, m.x, m.y, D.w, D.d, ok ? '#5CE07A' : '#FF5A4A', true);
    }
  }
  if (night && !BG.px) { c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = '#7F8CC0'; c.fillRect(0, 0, BG.w, BG.h); c.restore(); bgGlows(c); }
  // scritte che salgono
  BG.pops = BG.pops.filter((p) => p.t-- > 0);
  for (const p of BG.pops) { const s = bgW2S(p.wx, p.wy - (60 - p.t) * 0.8); c.globalAlpha = Math.min(1, p.t / 20); c.font = 'bold 15px sans-serif'; c.textAlign = 'center'; c.lineWidth = 4; c.strokeStyle = '#1A1A1A'; c.strokeText(p.s, s[0], s[1]); c.fillStyle = p.c === 'ok' ? '#9EF0A8' : '#FFE16B'; c.fillText(p.s, s[0], s[1]); c.globalAlpha = 1; }
}
function bgRR(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function bgOutline(c, x, y, w, d, col, fill) {
  const p = [bgIso(x, y), bgIso(x + w, y), bgIso(x + w, y + d), bgIso(x, y + d)].map((q) => bgW2S(q[0], q[1]));
  c.beginPath(); p.forEach((q, k) => (k ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); c.closePath();
  if (fill) { c.fillStyle = col === '#5CE07A' ? 'rgba(92,224,122,0.25)' : 'rgba(255,90,74,0.3)'; c.fill(); }
  c.strokeStyle = col; c.lineWidth = 2.5; c.setLineDash([6, 4]); c.lineDashOffset = -BG.t / 2; c.stroke(); c.setLineDash([]);
}
function bgFmt(ms) { ms = Math.max(0, ms); const s = Math.ceil(ms / 1000); if (s < 60) return s + 's'; const m = Math.floor(s / 60); if (m < 60) return m + 'm' + (s % 60 ? ' ' + (s % 60) + 's' : ''); return Math.floor(m / 60) + 'h' + (m % 60 ? ' ' + (m % 60) + 'm' : ''); }
function bgPop(o, s, c) { const D = bgDef(o.k), w = bgIso(o.x + D.w / 2, o.y + D.d / 2); BG.pops.push({ wx: w[0], wy: w[1] - 40, s, c, t: 60 }); }

/* acqua, fumo, bandiere, luci */
function bgWater(c, o) {
  const z = BG.cam.z, w = bgIso(o.x + 0.5, o.y + 0.5), p = bgW2S(w[0], w[1] - 27), t = BG.t;
  c.strokeStyle = 'rgba(200,235,255,0.9)'; c.lineWidth = 1.4 * z;
  for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 + t / 40, r = 8 * z; c.beginPath(); c.moveTo(p[0], p[1] - 4 * z); c.quadraticCurveTo(p[0] + Math.cos(a) * r, p[1] - 12 * z, p[0] + Math.cos(a) * r * 1.6, p[1] + 10 * z + Math.sin(a) * r * 0.5); c.stroke(); }
  const q = bgW2S(w[0], w[1] - 8); for (let k = 0; k < 3; k++) { const r = ((t / 2 + k * 20) % 60) / 60; c.strokeStyle = 'rgba(255,255,255,' + (0.6 * (1 - r)) + ')'; c.beginPath(); c.ellipse(q[0], q[1], 18 * z * r + 3, 9 * z * r + 1.5, 0, 0, 7); c.stroke(); }
}
function bgSmoke(c, o) {
  const z = BG.cam.z, D = bgDef(o.k), base = o.k === 'forno' ? bgIso(o.x + 0.795, o.y + 0.685) : bgIso(o.x + 0.67, o.y + 0.35), hz = o.k === 'forno' ? 26 : o.k === 'palazzo' ? 96 : o.k === 'osteria' ? 52 : 64;
  for (let k = 0; k < 5; k++) { const ph = ((BG.t + k * 24 + o.id * 13) % 120) / 120; const p = bgW2S(base[0] + ph * 14 + Math.sin(ph * 6 + o.id) * 3, base[1] - hz - ph * 40); c.fillStyle = 'rgba(235,235,235,' + (0.55 * (1 - ph)) + ')'; c.beginPath(); c.arc(p[0], p[1], (3 + ph * 7) * z, 0, 7); c.fill(); }
}
function bgFlags(c, o) {
  const z = BG.cam.z, p = bgW2S(...bgIso(o.x + 1.0, o.y + 2.0)), top = [p[0] + 4 * z, p[1] - 58 * z], t = BG.t / 8;
  const fl = (x, y, cols) => { c.strokeStyle = '#3A2A1C'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 22 * z); c.stroke(); for (let k = 0; k < 3; k++) { c.fillStyle = cols[k]; c.beginPath(); const x0 = x + k * 5 * z, x1 = x + (k + 1) * 5 * z; c.moveTo(x0, y - 22 * z + Math.sin(t + k) * 1.5); c.lineTo(x1, y - 22 * z + Math.sin(t + k + 1) * 1.5); c.lineTo(x1, y - 12 * z + Math.sin(t + k + 1) * 1.5); c.lineTo(x0, y - 12 * z + Math.sin(t + k) * 1.5); c.fill(); } };
  fl(top[0] - 10 * z, top[1], ['#2E8B57', '#FFFFFF', '#C8102E']);
  fl(top[0] + 8 * z, top[1] + 4 * z, ['#1D4E9E', '#F2C94C', '#1D4E9E']);
}
function bgGlowImg() {
  if (BG.glow) return BG.glow;
  const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,200,100,1)'); gr.addColorStop(1, 'rgba(255,200,100,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return (BG.glow = cv);
}
function bgGlows(c) {
  c.save(); c.globalCompositeOperation = 'lighter'; const gi = bgGlowImg();
  for (const o of bgData().b) {
    if (o.st !== 'ok') continue;
    const add = (x, y, z, r, a) => { const q = bgIso(x, y), p = bgW2S(q[0], q[1] - z), rr = r * BG.cam.z; if (p[0] < -rr || p[1] < -rr || p[0] > BG.w + rr || p[1] > BG.h + rr) return; c.globalAlpha = a; c.drawImage(gi, p[0] - rr, p[1] - rr, rr * 2, rr * 2); };
    if (o.k === 'lampione') add(o.x + 0.62, o.y + 0.5, 30, 22, 0.4);
    else if (o.k === 'forno') add(o.x + 0.74, o.y + 0.86, 6, 12, 0.25);
    else if (['casa', 'palazzo', 'municipio', 'bottega', 'osteria', 'chiesa'].includes(o.k)) { const D = bgDef(o.k); add(o.x + D.w * 0.45, o.y + D.d * 0.95, 12, 14, 0.16); }
  }
  for (const o of bgPzInfo().deco) if (o.k === 'pzlamp') { const q = bgIso(o.x + 0.5, o.y + 0.5), p = bgW2S(q[0], q[1] - 26), rr = 18 * BG.cam.z; c.globalAlpha = 0.35; c.drawImage(gi, p[0] - rr, p[1] - rr, rr * 2, rr * 2); }
  c.globalAlpha = 1; c.restore();
}

/* ---------- paesani, turisti, gatti e uccelli ---------- */
const BG_SHIRTS = ['#C8102E', '#2E5A9E', '#3E8A4F', '#E8A33A', '#7A4E9E', '#F2EFE6', '#2A2A2A', '#B05A2A'];
function bgRoads() { return bgData().b.filter((o) => (o.k === 'strada' || o.k === 'piazza' || o.k === 'porta') && o.st === 'ok'); }
function bgSpawn() {
  const S = bgStats(), roads = bgRoads(); if (!roads.length) { BG.walkers = []; return; }
  const want = Math.min(16, 1 + Math.floor(S.pop / 3)) + (bgData().b.some((o) => o.k === 'chiesa' && o.st === 'ok') && S.bel >= 30 ? 2 : 0) + (bgFesta() ? 5 : 0);
  while (BG.walkers.length < want) {
    const r = roads[Math.floor(Math.random() * roads.length)], tour = BG.walkers.length >= want - (bgFesta() ? 7 : 2) && (S.bel >= 30 || bgFesta()) && Math.random() < 0.7;
    const cat = !tour && Math.random() < 0.12;
    BG.walkers.push({ x: r.x + 0.5, y: r.y + 0.5, tx: r.x, ty: r.y, kind: cat ? 'cat' : tour ? 'tour' : 'p', col: BG_SHIRTS[Math.floor(Math.random() * BG_SHIRTS.length)], sp: 0.008 + Math.random() * 0.008, ph: Math.random() * 6, old: Math.random() < 0.3, tip: 0 });
  }
  BG.walkers.length = want;
  if (BG.birds.length < 4) for (let k = BG.birds.length; k < 4; k++) BG.birds.push({ x: -400 + Math.random() * 300, y: -60 - Math.random() * 120, v: 0.4 + Math.random() * 0.4, ph: Math.random() * 6 });
}
function bgStepWalkers() {
  for (const w of BG.walkers) {
    const cx = w.tx + 0.5, cy = w.ty + 0.5, dx = cx - w.x, dy = cy - w.y, d = Math.hypot(dx, dy);
    if (d < 0.03) {
      const opts = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, b]) => [w.tx + a, w.ty + b]).filter(([x, y]) => bgIs(x, y, ['strada', 'piazza', 'porta']) || (bgAt(x, y) && bgAt(x, y).k === 'piazza'));
      const fw = opts.filter(([x, y]) => !(x === w.px && y === w.py));
      const pick = (fw.length ? fw : opts)[Math.floor(Math.random() * (fw.length || opts.length || 1))];
      if (pick) { w.px = w.tx; w.py = w.ty; w.tx = pick[0]; w.ty = pick[1]; }
      if (w.kind === 'tour' && Math.random() < (bgFesta() ? 0.014 : 0.004) && !w.tip) w.tip = 1;
    } else { w.x += dx / d * w.sp; w.y += dy / d * w.sp; }
    w.ph += 0.25;
  }
  for (const b of BG.birds) { b.x += b.v; b.ph += 0.18; if (b.x > 700) { b.x = -500; b.y = -60 - Math.random() * 140; } }
}
function bgDrawWalker(c, w) {
  const z = BG.cam.z, p = bgW2S(...bgIso(w.x, w.y)), x = p[0], y = p[1], s = z;
  if (BG.px) { if (w.tip === 1) bgTipBubble(c, w, x, y, s); return; }
  c.fillStyle = 'rgba(0,0,0,0.22)'; c.beginPath(); c.ellipse(x, y, 4 * s, 2 * s, 0, 0, 7); c.fill();
  if (w.kind === 'cat') { c.fillStyle = '#6A6A6A'; c.beginPath(); c.ellipse(x, y - 3 * s, 4 * s, 2.4 * s, 0, 0, 7); c.fill(); c.beginPath(); c.arc(x + 3.5 * s, y - 5 * s, 2 * s, 0, 7); c.fill(); c.strokeStyle = '#6A6A6A'; c.lineWidth = 1.2 * s; c.beginPath(); c.moveTo(x - 4 * s, y - 3 * s); c.quadraticCurveTo(x - 7 * s, y - 9 * s, x - 5 * s, y - 10 * s); c.stroke(); return; }
  const leg = Math.sin(w.ph) * 2 * s;
  c.strokeStyle = '#2A2A2A'; c.lineWidth = 1.6 * s; c.beginPath(); c.moveTo(x - 1 * s, y - 5 * s); c.lineTo(x - 1 * s + leg, y); c.moveTo(x + 1 * s, y - 5 * s); c.lineTo(x + 1 * s - leg, y); c.stroke();
  c.fillStyle = w.old ? '#2A2A2A' : w.col; bgRR(c, x - 3 * s, y - 13 * s, 6 * s, 9 * s, 2 * s); c.fill();
  c.fillStyle = '#E8B98C'; c.beginPath(); c.arc(x, y - 16 * s, 2.8 * s, 0, 7); c.fill();
  if (w.kind === 'tour') { c.fillStyle = '#F2EFE6'; c.beginPath(); c.ellipse(x, y - 18 * s, 5 * s, 1.6 * s, 0, 0, 7); c.fill(); c.fillRect(x - 2.5 * s, y - 21 * s, 5 * s, 3 * s); c.fillStyle = '#2A2A2A'; c.fillRect(x + 2 * s, y - 11 * s, 3 * s, 2.4 * s); }
  else if (w.old) { c.fillStyle = '#3A3A3A'; c.beginPath(); c.arc(x, y - 17 * s, 2.9 * s, Math.PI, 0); c.fill(); }
  else { c.fillStyle = ['#3A2414', '#1A1A1A', '#8A5A2A'][w.ph | 0 ? 0 : 1]; c.beginPath(); c.arc(x, y - 17 * s, 2.8 * s, Math.PI, 0); c.fill(); }
  if (w.tip === 1) bgTipBubble(c, w, x, y, s);
}
function bgTipBubble(c, w, x, y, s) {
  { c.fillStyle = '#FFE16B'; c.strokeStyle = '#1A1A1A'; c.lineWidth = 1.5; c.beginPath(); c.arc(x, y - 30 * s, 8, 0, 7); c.fill(); c.stroke(); c.fillStyle = '#2A2218'; c.font = 'bold 10px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('🪙', x, y - 30 * s); BG.hits.unshift({ tip: w, x: x - 14, y: y - 30 * s - 14, w: 28, h: 28 }); }
}
function bgDrawBird(c, b) {
  const p = bgW2S(b.x, b.y), z = BG.cam.z, f = Math.sin(b.ph) * 3 * z;
  c.strokeStyle = 'rgba(40,40,40,0.8)'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(p[0] - 6 * z, p[1] - f); c.quadraticCurveTo(p[0] - 2 * z, p[1] - 3 * z, p[0], p[1]); c.quadraticCurveTo(p[0] + 2 * z, p[1] - 3 * z, p[0] + 6 * z, p[1] - f); c.stroke();
}

/* ---------- azioni ---------- */
function bgLock(k) {
  const D = BG_CAT[k], S = bgStats(), B = bgData();
  if (D.one && B.b.some((o) => o.k === k && o.st !== 'ruin')) return 'Ne puoi avere uno solo';
  if (D.need) { if (D.need.pop && S.pop < D.need.pop) return 'Servono ' + D.need.pop + ' paesani'; if (D.need.mun && S.mun < D.need.mun) return 'Serve il municipio di livello ' + D.need.mun; }
  return '';
}
function bgPlace(k, x, y) {
  const D = BG_CAT[k], B = bgData(), E = eco();
  if (!bgFree(x, y, D.w, D.d)) { flash(bgNextExp() && bgFreeCount() < BG_N * BG_N * 0.18 ? 'Non c’è posto: allarga il terreno con 🗺️' : 'Qui non c’è posto'); return false; }
  const lk = bgLock(k); if (lk) { flash(lk); return false; }
  if (E.carlini < D.c) { flash('Non hai abbastanza carlini'); return false; }
  if (D.t > 0 && bgBusy() >= BG_MASTRI) { flash('I mastri sono tutti al lavoro'); return false; }
  E.carlini -= D.c;
  const now = Date.now(), o = { id: B.nid++, k, x, y, lv: 1, st: D.t > 0 ? 'build' : 'ok', at: now, end: now + D.t * 60000, last: now };
  B.b.push(o); bgSpriteNear(o); save(); fx('take'); bgPop(o, '-' + D.c + ' 🪙'); bgHud();
  if (typeof track === 'function') track('borgo_build', { k });
  return true;
}
// 1.3.12: piazze vicine = una piazza grande. Per ogni pezzo: quali lati sono esterni; per ogni gruppo: un albero grande e quattro lampioni agli angoli
function bgPzInfo() {
  const B = bgData(), L = B.b.filter((o) => o.k === 'piazza' && o.st === 'ok');
  const sig = BG_N + ':' + L.map((o) => o.id + ',' + o.x + ',' + o.y).join(';');
  if (BG.pz && BG.pz.sig === sig) return BG.pz;
  const T = new Map(); L.forEach((o) => { for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) T.set((o.x + i) + ',' + (o.y + j), o); });
  const isT = (x, y) => T.has(x + ',' + y), side = {}, deco = [];
  for (const o of L) {
    const ext = (pts) => (pts.every(([x, y]) => isT(x, y)) ? '0' : '1');
    side[o.id] = ext([[o.x, o.y - 1], [o.x + 1, o.y - 1]]) + ext([[o.x + 2, o.y], [o.x + 2, o.y + 1]]) + ext([[o.x, o.y + 2], [o.x + 1, o.y + 2]]) + ext([[o.x - 1, o.y], [o.x - 1, o.y + 1]]);
  }
  // gruppi di pezzi che si toccano
  const seen = new Set();
  for (const o of L) {
    if (seen.has(o.id)) continue;
    const G = [], st = [o]; seen.add(o.id);
    while (st.length) {
      const a = st.pop(); G.push(a);
      for (let i = -1; i <= 2; i++) for (let j = -1; j <= 2; j++) { if ((i === -1 || i === 2) && (j === -1 || j === 2)) continue; const b = T.get((a.x + i) + ',' + (a.y + j)); if (b && !seen.has(b.id)) { seen.add(b.id); st.push(b); } }
    }
    const gid = Math.min(...G.map((g) => g.id));
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    G.forEach((g) => { x0 = Math.min(x0, g.x); y0 = Math.min(y0, g.y); x1 = Math.max(x1, g.x + 2); y1 = Math.max(y1, g.y + 2); });
    const tree = (px, py, big, bench, k) => deco.push({ id: 'pzT' + gid + '_' + k, k: 'pztree', x: px - 1, y: py - 1, lv: 1, st: 'ok', virt: 1, big, bench, dep: px + py + 1 });
    const lamp = (lx, ly, k) => { if (isT(Math.floor(lx), Math.floor(ly))) deco.push({ id: 'pzL' + gid + '_' + k, k: 'pzlamp', x: lx - 0.5, y: ly - 0.5, lv: 1, st: 'ok', virt: 1, dep: lx + ly + 0.5 }); };
    if (G.length === 1) tree(o.x + 1, o.y + 1, false, true, 0);
    else {
      // albero grande al centro della piazza (o del pezzo più vicino al centro)
      let cx = Math.round((x0 + x1) / 2), cy = Math.round((y0 + y1) / 2);
      if (!(isT(cx - 1, cy - 1) && isT(cx, cy - 1) && isT(cx - 1, cy) && isT(cx, cy))) { const n = G.slice().sort((a, b) => Math.hypot(a.x + 1 - (x0 + x1) / 2, a.y + 1 - (y0 + y1) / 2) - Math.hypot(b.x + 1 - (x0 + x1) / 2, b.y + 1 - (y0 + y1) / 2))[0]; cx = n.x + 1; cy = n.y + 1; }
      tree(cx, cy, true, true, 0);
      if (G.length >= 6) { let k = 1; for (const [px, py] of [[x0 + 1, y0 + 1], [x1 - 1, y0 + 1], [x0 + 1, y1 - 1], [x1 - 1, y1 - 1]]) if (Math.abs(px - cx) + Math.abs(py - cy) >= 3 && isT(px - 1, py - 1) && isT(px, py)) tree(px, py, false, false, k++); }
    }
    lamp(x0 + 0.2, y0 + 0.2, 0); lamp(x1 - 0.2, y0 + 0.2, 1); lamp(x0 + 0.2, y1 - 0.2, 2); lamp(x1 - 0.2, y1 - 0.2, 3);
  }
  return (BG.pz = { sig, side, deco });
}
function bgSpriteNear() {
  BG.sc = null; // mura e stradine cambiano forma quando arriva un vicino: si ridisegnano
  for (const key of Object.keys(BG.spr)) if (/^(mura|torre|porta|strada)\|/.test(key)) bgDropSprite(key);
}
// 1.3.9: spostare un edificio (gratis) invece di demolirlo
function bgFreeFor(o, x, y) {
  const D = bgDef(o.k);
  for (let i = x; i < x + D.w; i++) for (let j = y; j < y + D.d; j++) { if (!bgIn(i, j)) return false; const a = bgAt(i, j); if (a && a !== o) return false; }
  return true;
}
function bgName(o) { return o.st === 'ruin' ? (o.k === 'chiesa' ? 'Chiesa diroccata' : o.k === 'mura' ? 'Mura crollate' : 'Rudere') : bgDef(o.k).n; }
function bgMoveDo() {
  const m = BG.move; if (!m || m.x == null) return;
  if (!bgFreeFor(m.o, m.x, m.y)) { flash('Qui non c’è posto'); return; }
  const o = m.o; o.x = m.x; o.y = m.y; BG.move = null; BG.gi = null; BG.sel = o;
  bgSpriteNear(o); save(); fx('take'); BG.pops.push({ wx: bgIso(o.x, o.y)[0], wy: bgIso(o.x, o.y)[1] - 20, s: 'Spostato!', c: 'ok', t: 50 }); bgHud(); bgPanel();
  if (typeof track === 'function') track('borgo_move', { k: o.k });
}
function bgRuinCost(o) { return Math.max(BG_RUIN_MIN, Math.round(bgDef(o.k).c * (o.k === 'mura' ? 0.5 : 0.8))); }
function bgRestore(o) {
  const D = bgDef(o.k), E = eco(), cost = bgRuinCost(o);
  if (E.carlini < cost) { flash('Non hai abbastanza carlini'); return; }
  const lk = o.k === 'chiesa' ? bgLock('chiesa') : ''; if (lk && lk !== 'Ne puoi avere uno solo') { flash(lk); return; }
  const t = Math.round(D.t * 0.5);
  if (t > 0 && bgBusy() >= BG_MASTRI) { flash('I mastri sono tutti al lavoro'); return; }
  E.carlini -= cost; const now = Date.now();
  if (t > 0) { o.st = 'build'; o.at = now; o.end = now + t * 60000; } else { o.st = 'ok'; o.last = now; }
  bgSpriteNear(); save(); fx('take'); bgPop(o, '-' + cost + ' 🪙'); bgHud(); bgPanel();
}
function bgUpgrade(o) {
  const D = bgDef(o.k), S = bgStats(), E = eco();
  if (o.lv >= 3) return;
  const need = o.k === 'municipio' ? (o.lv === 1 ? 20 : 60) : 0;
  if (o.k === 'municipio' ? S.pop < need : S.mun < o.lv + 1) { flash(o.k === 'municipio' ? 'Servono ' + need + ' paesani' : 'Prima migliora il municipio al livello ' + (o.lv + 1)); return; }
  const cost = D.c * BG_LVC[o.lv], t = Math.max(1, (D.t || 2) * (o.lv + 1));
  if (E.carlini < cost) { flash('Non hai abbastanza carlini'); return; }
  if (bgBusy() >= BG_MASTRI) { flash('I mastri sono tutti al lavoro'); return; }
  bgCollect(o, true);
  E.carlini -= cost; const now = Date.now(); o.st = 'up'; o.at = now; o.end = now + t * 60000;
  save(); fx('take'); bgPop(o, '-' + cost + ' 🪙'); bgHud(); bgPanel();
}
function bgCollect(o, quiet) {
  const n = bgStored(o); o.last = Date.now();
  if (n > 0) { eco().carlini += n; if (!quiet) { bgPop(o, '+' + n + ' 🪙'); fx('take'); } }
  save(); bgHud(); return n;
}
function bgCollectAll() {
  let tot = 0; for (const o of bgData().b) if (bgRate(o) > 0) tot += bgCollect(o, true);
  if (tot) { flash('+' + tot + ' carlini dal borgo'); fx('big'); } else flash('Ancora niente da raccogliere');
  bgHud(); bgPanel();
}
function bgSpeed(o) {
  if (typeof showRewardedAd !== 'function') return;
  showRewardedAd().then((ok) => { if (!ok) return; o.end = Date.now(); bgTick(); bgPanel(); if (typeof track === 'function') track('borgo_video', { k: o.k }); });
}
function bgRemove(o) {
  overlay('<h2>' + (o.k === 'sasso' ? 'Togli i sassi?' : 'Demolisci ' + bgDef(o.k).n.toLowerCase() + '?') + '</h2><p>' + (o.k === 'sasso' ? 'Costa 10 carlini.' : 'I carlini spesi non tornano indietro.') + '</p><button class="btn" id="bgRY">' + (o.k === 'sasso' ? 'Togli' : 'Demolisci') + '</button><button class="btn alt" id="bgRN">Annulla</button>');
  $('bgRY').onclick = () => { $('layer').innerHTML = ''; if (o.k === 'sasso') { if (eco().carlini < 10) { flash('Non hai abbastanza carlini'); return; } eco().carlini -= 10; } const B = bgData(); B.b = B.b.filter((x) => x !== o); BG.gi = null; BG.sel = null; bgSpriteNear(); save(); bgHud(); bgPanel(); };
  $('bgRN').onclick = () => { $('layer').innerHTML = ''; };
}


/* ---------- allargare il terreno ---------- */
function bgFreeCount() { let n = 0; for (let i = 0; i < BG_N; i++) for (let j = 0; j < BG_N; j++) if (!bgAt(i, j)) n++; return n; }
function bgNextExp() { const B = bgData(); return BG_EXP.find((e) => e.n > (B.size || 16)) || null; }
function bgExpandAsk() {
  const E = bgNextExp(); if (!E) { flash('Il terreno è già al massimo'); return; }
  const S = bgStats(), lk = S.pop < E.pop ? 'Servono ' + E.pop + ' paesani (ora ' + S.pop + ')' : eco().carlini < E.c ? 'Ti mancano ' + (E.c - eco().carlini) + ' carlini' : '';
  overlay('<div class="bgexp"><h2>🗺️ Allarga il borgo</h2><p>Compri la terra tutta intorno: il terreno passa da <b>' + BG_N + '×' + BG_N + '</b> a <b>' + E.n + '×' + E.n + '</b> caselle, con ' + (E.n * E.n - BG_N * BG_N) + ' caselle nuove per costruire.</p><p class="bgexpc"><i class="ico coin"></i> <b>' + E.c + '</b> carlini · 👥 ' + E.pop + ' paesani</p>' + (lk ? '<p class="bgwarn">' + lk + '</p>' : '') + '<button class="btn take" id="bgEY"' + (lk ? ' disabled' : '') + '>Compra la terra</button><button class="btn alt" id="bgEN">Non ora</button></div>');
  $('bgEN').onclick = () => { $('layer').innerHTML = ''; };
  $('bgEY').onclick = () => { $('layer').innerHTML = ''; bgExpand(); };
}
function bgExpand() {
  const B = bgData(), E = bgNextExp(); if (!E) return;
  if (bgStats().pop < E.pop || eco().carlini < E.c) return;
  eco().carlini -= E.c;
  const d = (E.n - (B.size || 16)) / 2;
  // il borgo resta al centro: si sposta tutto di mezzo anello
  for (const o of B.b) { o.x += d; o.y += d; }
  B.size = E.n; BG_N = E.n; BG.gi = null; BG.ground = null; bgSpriteClear();
  // la terra nuova: qualche ulivo, un cipresso e dei sassi da togliere
  const R = bgRng(B.seed + E.n), now = Date.now();
  for (let k = 0; k < E.n * 1.2; k++) {
    const side = Math.floor(R() * 4), t = Math.floor(R() * E.n), r = Math.floor(R() * d);
    const x = side === 0 ? t : side === 1 ? E.n - 1 - r : side === 2 ? t : r, y = side === 0 ? r : side === 1 ? t : side === 2 ? E.n - 1 - r : t;
    if (!bgAt(x, y)) B.b.push({ id: B.nid++, k: R() < 0.45 ? 'sasso' : R() < 0.8 ? 'ulivo' : 'cipresso', x, y, lv: 1, st: 'ok', at: now, last: now });
    BG.gi = null;
  }
  BG.walkers.forEach((w) => { w.x += d; w.y += d; w.tx += d; w.ty += d; if (w.px != null) { w.px += d; w.py += d; } });
  BG.cam.y += d * BG_TH; BG.sel = null;
  save(); fx('big'); flash('Il borgo è più grande: ' + E.n + '×' + E.n + '!'); bgHud(); bgPanel();
  if (typeof track === 'function') track('borgo_expand', { n: E.n });
}
/* ---------- interfaccia ---------- */
function bgSetH(el, html) { if (el.__h !== html) { el.__h = html; el.innerHTML = html; } }   // riscrive solo se cambia: i tocchi non si perdono
function bgHud() {
  BG.sc = null;
  const h = $('bgHud'); if (!h) return;
  const S = bgStats(); let tot = 0; for (const o of bgData().b) tot += bgStored(o);
  bgSetH(h, '<span class="bgch"><i class="ico coin"></i><b>' + eco().carlini + '</b></span><span class="bgch">👥 <b>' + S.pop + '</b></span><span class="bgch">🌸 <b>' + S.bel + '</b></span><span class="bgch">🔨 <b>' + bgBusy() + '/' + BG_MASTRI + '</b></span><span class="bgtitle">' + S.title + '</span>');
  const bar = $('bgBar'); if (!bar) return;
  if (BG.move) {
    const m = BG.move, ok = m.x != null && bgFreeFor(m.o, m.x, m.y);
    bgSetH(bar, '<span class="bgplace">Tocca dove spostare: <b>' + bgName(m.o) + '</b></span>' + (m.x != null ? '<button class="btn small take" data-bg="mvok"' + (ok ? '' : ' disabled') + '>✔ Sposta qui</button>' : '') + '<button class="btn small ghost" data-bg="mvcancel">Annulla</button>');
  } else if (BG.place) {
    const D = BG_CAT[BG.place.k], paint = !D.t && D.w === 1;
    bgSetH(bar, '<span class="bgplace">' + (paint ? 'Tocca il terreno per mettere: <b>' + D.n + '</b> (' + D.c + ' 🪙)' : 'Tocca dove costruire: <b>' + D.n + '</b>') + '</span>' + (!paint && BG.place.x != null ? '<button class="btn small take" data-bg="ok">✔ Costruisci</button>' : '') + '<button class="btn small ghost" data-bg="cancel">' + (paint ? 'Fine' : '✖ Annulla') + '</button>');
  } else { const ex = bgNextExp(), full = ex && bgFreeCount() < BG_N * BG_N * 0.18; bgSetH(bar, '<button class="btn take" data-bg="build">🔨 Costruisci</button><button class="btn" data-bg="collect">🪙 Raccogli' + (tot ? ' +' + tot : '') + '</button>' + (ex ? '<button class="btn' + (full ? ' take bgpulse' : '') + '" data-bg="expand" aria-label="Allarga il terreno">🗺️' + (full ? ' Allarga' : '') + '</button>' : '')); }
}
function bgPanel() {
  const el = $('bgPanel'); if (!el) return;
  const o = BG.sel; if (!o || BG.place || BG.move) { el.hidden = true; return; }
  const D = bgDef(o.k), now = Date.now(); el.hidden = false;
  let h = '<button class="bgx" data-bg="close" aria-label="Chiudi">✖</button><b class="bgpn">' + (o.st === 'ruin' ? (o.k === 'chiesa' ? 'Chiesa diroccata' : o.k === 'mura' ? 'Mura crollate' : 'Rudere') : D.n) + (o.st === 'ok' && D.c ? ' <span class="bglv">' + '★'.repeat(o.lv) + '☆'.repeat(3 - o.lv) + '</span>' : '') + '</b>';
  if (o.k === 'sasso') h += '<p>Sassi e sterpaglie: liberali per costruire.</p><button class="btn small" data-bg="remove">Togli i sassi · 10 🪙</button>';
  else if (o.st === 'ruin') { const c = bgRuinCost(o); h += '<p>Era ' + (o.k === 'chiesa' ? 'la chiesa del borgo' : o.k === 'mura' ? 'un pezzo delle vecchie mura' : 'la casa di qualcuno') + '. Restaurala e torna a vivere.</p><button class="btn small take" data-bg="restore">🔨 Restaura · ' + c + ' 🪙</button>'; }
  else if (o.st === 'build' || o.st === 'up') {
    const pr = Math.max(0, Math.min(1, (now - o.at) / Math.max(1, o.end - o.at)));
    h += '<p>' + (o.st === 'up' ? 'I mastri stanno migliorando l’edificio.' : 'Cantiere aperto: i mastri sono al lavoro.') + '</p><div class="bgprog"><i style="width:' + Math.round(pr * 100) + '%"></i><span>' + bgFmt(o.end - now) + '</span></div><button class="btn small take" data-bg="speed">▶ Finisci subito guardando un video</button>';
  } else {
    h += '<p>' + D.d1 + '</p>';
    const r = bgRate(o);
    if (D.p) h += r ? '<p class="bgok">Produce <b>' + Math.round(r) + ' 🪙 all’ora</b> · tiene fino a ' + Math.round(r * BG_CAP_H) + '</p><button class="btn small" data-bg="col">Raccogli ' + bgStored(o) + ' 🪙</button>' : '<p class="bgwarn">Non produce: serve una stradina accanto.</p>';
    if (o.k === 'chiesa') { const B = bgData(); h += bgFesta() ? '<p class="bgok">🎆 Festa in corso: <b>' + bgFmt(B.festa - now) + '</b> · guadagni +20% e tanti turisti</p>' : B.festaNext && now < B.festaNext ? '<p>🎆 Prossima festa del santo tra ' + bgFmt(B.festaNext - now) + '</p>' : '<button class="btn small take" data-bg="festa">🎆 Organizza la festa del santo · ' + BG_FESTA_C + ' 🪙</button><p class="pgnote">10 minuti di luminarie e fuochi d’artificio, più turisti con le mance e guadagni +20%.</p>'; }
    if (D.pop) h += '<p>👥 Ci abitano ' + D.pop * o.lv + ' paesani</p>';
    if (D.b) h += '<p>🌸 Bellezza +' + D.b * o.lv + '</p>';
    if (D.c >= 100 && o.lv < 3 && !['torre', 'porta', 'edicola', 'fontana'].includes(o.k)) h += '<button class="btn small take" data-bg="up">⬆ Migliora · ' + D.c * BG_LVC[o.lv] + ' 🪙 · ' + bgFmt(Math.max(1, (D.t || 2) * (o.lv + 1)) * 60000) + '</button>';
    h += '<button class="btn small ghost" data-bg="remove">Demolisci</button>';
  }
  h += '<button class="btn small" data-bg="move">✋ Sposta</button>';
  el.innerHTML = h;
}
const BG_THUMB = {};
function bgThumb(k) {
  if (BG_THUMB[k]) return BG_THUMB[k];
  const D = BG_CAT[k], o = { id: 77, k, x: 40, y: 40, lv: k === 'casa' ? 2 : 1, st: 'ok' }, os = BG.scale; BG.scale = 1.5;
  const S = bgSprite(o, false); BG.scale = os;
  const cv = document.createElement('canvas'), sz = 96; cv.width = sz; cv.height = sz; const c = cv.getContext('2d');
  const k2 = Math.min(sz / S.w, sz / S.h) * 0.95; c.drawImage(S.cv, (sz - S.w * k2) / 2, (sz - S.h * k2) / 2, S.w * k2, S.h * k2);
  for (const key of Object.keys(BG.spr)) if (key.split('|')[1] === 'v77' || key.split('|')[1] === 'v5') bgDropSprite(key);
  return (BG_THUMB[k] = cv.toDataURL());
}
function bgSheet() {
  const el = $('bgSheet'); if (!el) return;
  const bar = $('bgBar'); if (bar) bar.hidden = !!BG.sheet;
  if (!BG.sheet) { el.hidden = true; return; }
  el.hidden = false;
  const items = Object.keys(BG_CAT).filter((k) => BG_CAT[k].g === BG.tab), E = eco();
  el.innerHTML = '<div class="bgsh"><b>Costruisci</b><button class="bgx" data-bg="shclose" aria-label="Chiudi">✖</button></div><div class="bgtabs">' + BG_TABS.map(([k, n]) => '<button data-bgtab="' + k + '" aria-pressed="' + (BG.tab === k) + '">' + n + '</button>').join('') + '</div><div class="bgitems">' +
    items.map((k) => { const D = BG_CAT[k], lk = bgLock(k), poor = E.carlini < D.c; return '<button class="bgit' + (lk ? ' lock' : poor ? ' poor' : '') + '" data-bgk="' + k + '"><img src="' + bgThumb(k) + '" alt=""><b>' + D.n + '</b><small>' + (D.p ? '🪙 ' + Math.max(1, Math.round(D.p * BG_PMUL)) + '/ora' : D.b ? '🌸 +' + D.b : D.pop ? '👥 +' + D.pop : '') + (D.w > 1 ? ' · 2×2' : '') + (D.t ? ' · ⏱ ' + bgFmt(D.t * 60000) : '') + '</small><span class="bgcost">' + (lk ? '🔒 ' + lk : '<i class="ico coin"></i>' + D.c) + '</span></button>'; }).join('') + '</div>';
}
function bgClick(e) {
  const t = e.target, b = t.closest('[data-bg]');
  if (b) {
    const a = b.dataset.bg, o = BG.sel;
    if (a === 'build') { BG.sheet = true; BG.sel = null; bgPanel(); bgSheet(); }
    else if (a === 'shclose') { BG.sheet = false; bgSheet(); }
    else if (a === 'collect') bgCollectAll();
    else if (a === 'expand') bgExpandAsk();
    else if (a === 'festa') bgFestaStart();
    else if (a === 'cancel') { BG.place = null; bgHud(); }
    else if (a === 'ok') { const p = BG.place; if (p && p.x != null && bgPlace(p.k, p.x, p.y)) { BG.place = null; bgHud(); } }
    else if (a === 'close') { BG.sel = null; bgPanel(); }
    else if (a === 'restore' && o) bgRestore(o);
    else if (a === 'up' && o) bgUpgrade(o);
    else if (a === 'col' && o) { bgCollect(o); bgPanel(); }
    else if (a === 'speed' && o) bgSpeed(o);
    else if (a === 'remove' && o) bgRemove(o);
    else if (a === 'move' && o) { BG.move = { o, x: null, y: null }; BG.sel = null; bgPanel(); bgHud(); }
    else if (a === 'mvcancel') { BG.move = null; bgHud(); }
    else if (a === 'mvok') bgMoveDo();
    return;
  }
  const tb = t.closest('[data-bgtab]'); if (tb) { BG.tab = tb.dataset.bgtab; bgSheet(); return; }
  const it = t.closest('[data-bgk]');
  if (it) {
    const k = it.dataset.bgk, lk = bgLock(k); if (lk) { flash(lk); return; }
    if (eco().carlini < BG_CAT[k].c) { flash('Non hai abbastanza carlini'); return; }
    BG.place = { k, x: null, y: null }; BG.sheet = false; bgSheet(); bgHud(); return;
  }
}
function bgTap(sx, sy) {
  if (BG.move) {
    const [i, j] = bgS2T(sx, sy), D = bgDef(BG.move.o.k);
    if (!bgIn(i, j)) return;
    BG.move.x = Math.max(0, Math.min(i, BG_N - D.w)); BG.move.y = Math.max(0, Math.min(j, BG_N - D.d));
    if (!bgFreeFor(BG.move.o, BG.move.x, BG.move.y)) flash('Qui non c’è posto');
    bgHud(); return;
  }
  if (BG.place) {
    const [i, j] = bgS2T(sx, sy), D = BG_CAT[BG.place.k];
    if (!bgIn(i, j)) return;
    if (!D.t && D.w === 1) { bgPlace(BG.place.k, i, j); return; }   // stradine, mura, alberi: si mettono subito
    BG.place.x = Math.min(i, BG_N - D.w); BG.place.y = Math.min(j, BG_N - D.d); bgHud(); return;
  }
  for (const h of BG.hits) {
    if (sx < h.x || sx > h.x + h.w || sy < h.y || sy > h.y + h.h) continue;
    if (h.coin) { bgCollect(h.coin); bgPanel(); return; }
    if (h.tip) { h.tip.tip = 2; const n = 3 + Math.floor(Math.random() * 6); eco().carlini += n; bgData().tips = (bgData().tips || 0) + n; save(); BG.pops.push({ wx: bgIso(h.tip.x, h.tip.y)[0], wy: bgIso(h.tip.x, h.tip.y)[1] - 30, s: '+' + n + ' 🪙 mancia', c: 'c', t: 60 }); fx('take'); bgHud(); return; }
  }
  const [i, j] = bgS2T(sx, sy), at = bgIn(i, j) ? bgAt(i, j) : null;
  // gli edifici alti: se tocchi la parte alta, prendi il più vicino davanti
  let pick = at && at.k !== 'strada' ? at : null;
  if (!pick) for (let k = BG.hits.length - 1; k >= 0; k--) { const h = BG.hits[k]; if (h.o && sx >= h.x + h.w * 0.15 && sx <= h.x + h.w * 0.85 && sy >= h.y + h.h * 0.15 && sy <= h.y + h.h * 0.8) { pick = h.o; break; } }
  if (!pick && at) pick = at;
  BG.sel = pick || null; bgPanel();
}
function bgBindInput() {
  const cv = BG.cv;
  cv.addEventListener('pointerdown', (e) => { cv.setPointerCapture(e.pointerId); BG.ptr.set(e.pointerId, { x: e.offsetX, y: e.offsetY, sx: e.offsetX, sy: e.offsetY }); BG.moved = false; if (BG.ptr.size === 2) { const [a, b] = [...BG.ptr.values()]; BG.pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: BG.cam.z }; } });
  cv.addEventListener('pointermove', (e) => {
    const p = BG.ptr.get(e.pointerId); if (!p) return;
    const dx = e.offsetX - p.x, dy = e.offsetY - p.y; p.x = e.offsetX; p.y = e.offsetY;
    if (Math.hypot(p.x - p.sx, p.y - p.sy) > 7) BG.moved = true;
    if (BG.ptr.size === 2 && BG.pinch) { const [a, b] = [...BG.ptr.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); BG.cam.z = BG.pinch.z * d / Math.max(10, BG.pinch.d); bgClampCam(); bgScale(); return; }
    if (BG.moved) { BG.cam.x -= dx / BG.cam.z; BG.cam.y -= dy / BG.cam.z; bgClampCam(); }
  });
  const up = (e) => { const p = BG.ptr.get(e.pointerId); BG.ptr.delete(e.pointerId); if (BG.ptr.size < 2) BG.pinch = null; if (p && !BG.moved && BG.ptr.size === 0) bgTap(e.offsetX, e.offsetY); };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', (e) => { BG.ptr.delete(e.pointerId); BG.pinch = null; });
  cv.addEventListener('wheel', (e) => { e.preventDefault(); BG.cam.z *= e.deltaY < 0 ? 1.1 : 0.9; bgClampCam(); bgScale(); }, { passive: false });
}
function bgLoop() {
  if (view !== 'vBorgo') return;
  BG.t++;
  if (BG.t % 30 === 0) { bgTick(); if (BG.t % 60 === 0) { bgSpawn(); bgHud(); if (BG.sel && (BG.sel.st === 'build' || BG.sel.st === 'up' || bgRate(BG.sel))) bgPanel(); } }
  bgStepWalkers(); if (BGX.on) bgPixiDraw(); bgDraw();
  BG.raf = requestAnimationFrame(bgLoop);
}
function bgOpen() {
  BG.move = null;
  bgData(); if (!BG.cv) return;
  if (!BGX.app && !BGX.failed && typeof PIXI !== 'undefined') bgPixiInit().then(() => { if (BGX.app) { BGX.app.resize(); bgFit(); } });
  requestAnimationFrame(() => { bgFit(); bgTick(); bgSpawn(); bgHud(); bgPanel(); bgSheet(); cancelAnimationFrame(BG.raf); BG.raf = requestAnimationFrame(bgLoop); });
  if (typeof ndSeen === 'function' && !ndSeen('borgo')) setTimeout(() => showNduja('borgo'), 400);
  // quanto ha prodotto mentre eri via
  let tot = 0; for (const o of bgData().b) tot += bgStored(o);
  if (tot >= 30) setTimeout(() => flash('Il borgo ha prodotto ' + tot + ' carlini: raccoglili!'), 600);
}
function bgCard() {
  const S = P.borgo ? bgStats() : { pop: 0, title: 'Borgo abbandonato' };
  return '<button class="advc av av-borgo" data-go="vBorgo"><span class="avspr bgcardpic"><span class="bgcardh" style="background-image:url(' + bgThumb('chiesa') + ')"></span></span><b>U Borgu</b><small>' + (P.borgo ? S.title + ' · ' + S.pop + ' paesani' : 'Rimetti in piedi il paese abbandonato') + '</small><span class="advnew">Nuovo!</span></button>';
}
if (typeof RULES !== 'undefined') RULES.borgo = [
  'Benvenuto a U Borgu! Questo paese sulla collina è stato abbandonato tanti anni fa. Tocca a te farlo rinascere.',
  'Tocca un rudere per restaurarlo: costa almeno 250 carlini. Con «Costruisci» fai stradine, mura, case, botteghe, la chiesa e il municipio.',
  'Le case portano paesani, le botteghe, il forno e il frantoio producono carlini ogni ora, anche quando l’app è chiusa. Ma devono toccare una stradina!',
  'I carlini si accumulano fino a 6 ore: torna a raccoglierli toccando le monetine sopra gli edifici. Fontane, piazze, giardini e la chiesa danno bellezza: più bellezza, più guadagni e più turisti con le mance.',
  'Quando il terreno è pieno puoi comprare la terra intorno con il pulsante 🗺️: il borgo diventa più grande, fino a 28 caselle per lato.',
  'Con la chiesa puoi organizzare la festa del santo: luminarie, fuochi d’artificio, più turisti e guadagni più alti per dieci minuti.',
  'I lavori durano un po’ di tempo vero e hai due mastri. Se hai fretta, un video li finisce subito. Trascina per muoverti, due dita per lo zoom.',
];

/* ---------- la schermata nel gioco ---------- */
(() => {
  if (!$('vBorgo')) {
    const s = document.createElement('section'); s.className = 'view'; s.id = 'vBorgo'; s.hidden = true;
    s.innerHTML = '<div class="topbar"><h2>U Borgu</h2><span class="tbr"><button class="btn ghost small" id="bgRules">Regole</button><button class="btn ghost small" id="bgHome">Menu</button></span></div>' +
      '<div class="bgwrap"><canvas id="bgCv"></canvas><div class="bghud" id="bgHud"></div><div class="bgpanel" id="bgPanel" hidden></div><div class="bgsheet" id="bgSheet" hidden></div><div class="bgbar" id="bgBar"></div></div>';
    $('vHome').parentNode.insertBefore(s, $('vHome').nextSibling);
    s.addEventListener('click', bgClick);
    $('bgRules').onclick = () => { if (!ND.open) showNduja('borgo'); };
    $('bgHome').onclick = () => go('vHome');
    BG.cv = $('bgCv'); BG.ctx = BG.cv.getContext('2d');
    bgBindInput();
    window.addEventListener('resize', () => { if (view === 'vBorgo') bgFit(); });
  }
  const oldGo = go;
  go = function (v) {
    oldGo(v);
    $('vBorgo').hidden = v !== 'vBorgo';
    if (v !== 'vBorgo') cancelAnimationFrame(BG.raf);
    else bgOpen();
  };
})();

/* ================= U BORGU con PixiJS (WebGL) =================
   La scheda grafica disegna terreno, edifici, ombre, mare, cielo, nuvole, pioggia, luci e fuochi della festa.
   Il canvas 2D di sopra resta per i tocchi e per monetine, barre e scritte. Senza WebGL si torna al disegno normale. */
const BGX = { on: false, app: null, map: new Map(), walk: new Map(), fw: [], lum: [], drops: [], clouds: [], stars: [] };
const bgHour = () => { const d = new Date(); return d.getHours() + d.getMinutes() / 60; };
function bgSunLight(h) { // 0 = notte, 1 = pieno giorno
  if (h < 5.5 || h > 20.5) return 0; if (h < 7) return (h - 5.5) / 1.5; if (h > 19) return (20.5 - h) / 1.5; return 1;
}
function bgTintFor(h, rain, festa) {
  const mix = (a, b, t) => { const ar = a >> 16, ag = (a >> 8) & 255, ab = a & 255, br = b >> 16, bg = (b >> 8) & 255, bb = b & 255; return (Math.round(ar + (br - ar) * t) << 16) | (Math.round(ag + (bg - ag) * t) << 8) | Math.round(ab + (bb - ab) * t); };
  let c;
  if (h < 5) c = 0x5A68B0; else if (h < 6.5) c = mix(0x5A68B0, 0xFFC09A, (h - 5) / 1.5); else if (h < 8) c = mix(0xFFC09A, 0xFFFFFF, (h - 6.5) / 1.5);
  else if (h < 17.5) c = 0xFFFFFF; else if (h < 19.3) c = mix(0xFFFFFF, 0xFFA870, (h - 17.5) / 1.8); else if (h < 20.5) c = mix(0xFFA870, 0x5A68B0, (h - 19.3) / 1.2); else c = 0x5A68B0;
  if (rain) c = mix(c, 0x9098A8, 0.45);
  if (festa) c = mix(c, 0x8C84D0, 0.35);
  return c;
}
function bgRainNow() { // pioggia: alcuni giorni, per qualche ora (uguale per tutti nello stesso giorno)
  const d = new Date(), k = d.getFullYear() * 400 + d.getMonth() * 32 + d.getDate(); const r = bgRng(k * 9301)();
  if (r > 0.22) return false; const st = 8 + Math.floor(r * 40) % 10, h = bgHour(); return h >= st && h < st + 2.5;
}
const bgFesta = () => { const B = P.borgo; return !!(B && B.festa && Date.now() < B.festa); };
function bgTexOf(S) { if (!S.tex) S.tex = PIXI.Texture.from(S.cv); return S.tex; }
function bgCanvasTex(w, h, draw) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); return PIXI.Texture.from(cv); }
async function bgPixiInit() {
  if (BGX.app || BGX.failed || typeof PIXI === 'undefined') return;
  try {
    const wrap = BG.cv.parentNode, app = new PIXI.Application();
    await app.init({ backgroundAlpha: 0, antialias: true, resolution: Math.min(2.5, window.devicePixelRatio || 1), autoDensity: true, resizeTo: wrap, preference: 'webgl', powerPreference: 'low-power' });
    app.canvas.className = 'bgpx'; wrap.insertBefore(app.canvas, BG.cv);
    app.ticker.stop();   // si disegna dal ciclo del gioco, non da Pixi
    const L = (name, parent) => { const c = new PIXI.Container(); c.label = name; (parent || app.stage).addChild(c); return c; };
    BGX.app = app;
    BGX.sky = L('cielo');
    BGX.world = L('mondo');
    BGX.ground = new PIXI.Sprite(); BGX.world.addChild(BGX.ground);
    BGX.sea = L('mare', BGX.world); BGX.cshadow = L('ombre nuvole', BGX.world); BGX.shadows = L('ombre', BGX.world);
    BGX.objs = L('edifici', BGX.world); BGX.objs.sortableChildren = true;
    BGX.tint = new PIXI.Graphics(); BGX.tint.blendMode = 'multiply'; app.stage.addChild(BGX.tint);
    BGX.lights = L('luci'); BGX.lights.blendMode = 'add';
    BGX.top = L('sopra'); // nuvole, fuochi
    BGX.rain = new PIXI.Graphics(); app.stage.addChild(BGX.rain);
    // texture fatte a mano
    BGX.glowT = PIXI.Texture.from(bgGlowImg());
    BGX.dotT = bgCanvasTex(16, 16, (c) => { const g = c.createRadialGradient(8, 8, 0, 8, 8, 8); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,0.8)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 16, 16); });
    BGX.waveT = bgCanvasTex(256, 64, (c, w, h) => { c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 1.5; for (let k = 0; k < 14; k++) { const y = Math.random() * h, x = Math.random() * w, l = 10 + Math.random() * 30; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + l / 2, y - 2, x + l, y); c.stroke(); } });
    BGX.cloudT = bgCanvasTex(256, 128, (c) => { c.fillStyle = '#fff'; for (const [x, y, r] of [[70, 80, 40], [120, 60, 52], [175, 78, 40], [100, 92, 34], [150, 95, 34]]) { const g = c.createRadialGradient(x, y, r * 0.3, x, y, r); g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); } });
    BGX.cshT = bgCanvasTex(128, 64, (c) => { const g = c.createRadialGradient(64, 32, 4, 64, 32, 60); g.addColorStop(0, 'rgba(0,0,0,0.5)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.scale(1, 0.5); c.beginPath(); c.arc(64, 64, 60, 0, 7); c.fill(); });
    // il mare che si muove e i riflessi del sole
    BGX.waves = new PIXI.TilingSprite({ texture: BGX.waveT, width: 3000, height: 100 }); BGX.waves.alpha = 0.45; BGX.sea.addChild(BGX.waves);
    BGX.glit = []; for (let k = 0; k < 46; k++) { const d = new PIXI.Sprite(BGX.dotT); d.anchor.set(0.5); d.blendMode = 'add'; d.ph = Math.random() * 6; d.ox = (Math.random() - 0.5) * 340; d.oy = Math.random(); BGX.sea.addChild(d); BGX.glit.push(d); }
    BGX.sun = new PIXI.Sprite(BGX.glowT); BGX.sun.anchor.set(0.5); BGX.sun.blendMode = 'add'; BGX.sky.addChild(BGX.sun);
    BGX.sunDisc = new PIXI.Graphics(); BGX.sky.addChild(BGX.sunDisc);
    for (let k = 0; k < 60; k++) { const st = new PIXI.Sprite(BGX.dotT); st.anchor.set(0.5); st.scale.set(0.12 + Math.random() * 0.2); st.blendMode = 'add'; st.ph = Math.random() * 6; st.rx = Math.random(); st.ry = Math.random(); BGX.sky.addChild(st); BGX.stars.push(st); }
    for (let k = 0; k < 6; k++) { const cl = new PIXI.Sprite(BGX.cloudT); cl.anchor.set(0.5); cl.alpha = 0.85; cl.wx = -900 + Math.random() * 1800; cl.wy = -260 + Math.random() * 260; cl.v = 0.08 + Math.random() * 0.12; cl.sc = 0.8 + Math.random() * 0.8; const sh = new PIXI.Sprite(BGX.cshT); sh.anchor.set(0.5); BGX.cshadow.addChild(sh); BGX.top.addChild(cl); BGX.clouds.push({ cl, sh }); }
    BGX.birds = new PIXI.Graphics(); BGX.top.addChild(BGX.birds);
    BGX.fwG = new PIXI.Container(); BGX.fwG.blendMode = 'add'; BGX.top.addChild(BGX.fwG);
    BGX.on = true; BG.px = true; BG.ground = null; bgScale(); bgSpriteClear();
  } catch (e) { BGX.failed = true; BG.px = false; if (BGX.app) { try { BGX.app.destroy(true); } catch (er) { /* niente */ } } BGX.app = null; }
}
function bgPixiDraw() {
  if (!BGX.on) return;
  const app = BGX.app, z = BG.cam.z, W = BG.w, H = BG.h, h = bgHour(), sun = bgSunLight(h), night = bgNight(), rain = bgRainNow(), festa = bgFesta(), t = BG.t;
  const wx = W / 2 - BG.cam.x * z, wy = H / 2 - BG.cam.y * z;
  for (const L of [BGX.world, BGX.lights, BGX.top]) { L.position.set(wx, wy); L.scale.set(z); }
  // terreno
  const G = bgGround(false);
  if (BGX.gk !== BG.gkey) { BGX.gk = BG.gkey; if (BGX.gtex) BGX.gtex.destroy(true); BGX.gtex = PIXI.Texture.from(G.cv); BGX.ground.texture = BGX.gtex; BGX.ground.position.set(-G.ox, -G.oy); BGX.ground.scale.set(1 / G.s); }
  // mare: onde che scorrono e riflessi sotto il sole
  const seaY0 = -G.oy + G.H * 0.2, seaY1 = -G.oy + G.H * 0.34;
  const seaBot = Math.min(seaY1, -12); BGX.waves.position.set(-G.ox, seaY0); BGX.waves.width = G.W; BGX.waves.height = Math.max(4, seaBot - seaY0); BGX.waves.tilePosition.x = t * 0.25; BGX.waves.tilePosition.y = Math.sin(t / 90) * 4;
  const sunX = -G.ox + G.W * (0.15 + 0.7 * Math.max(0, Math.min(1, (h - 6) / 14)));
  for (const d of BGX.glit) { const tw = 0.5 + 0.5 * Math.sin(t / 7 + d.ph * 3); d.position.set(sunX + d.ox * (0.6 + d.oy), seaY0 + 4 + d.oy * (seaBot - seaY0 - 6)); d.alpha = (night ? 0.12 : 0.75) * tw * tw * (rain ? 0.2 : 1); d.scale.set((0.1 + d.oy * 0.16) * (0.6 + tw * 0.5), (0.05 + d.oy * 0.06)); d.tint = h > 17 && h < 20 ? 0xFFB070 : 0xFFFFFF; }
  // cielo: sole che gira, stelle di notte
  BGX.sky.position.set(0, 0);
  const sxS = W * (0.08 + 0.84 * Math.max(0, Math.min(1, (h - 6) / 14))), syS = H * 0.08 + Math.abs(h - 13) * H * 0.012 + wy * 0.05;
  BGX.sun.position.set(sxS, syS); BGX.sun.scale.set(3.2); BGX.sun.alpha = sun * (rain ? 0.2 : 0.9); BGX.sun.tint = h > 17 ? 0xFF9A50 : 0xFFE6A0;
  BGX.sunDisc.clear(); if (sun > 0.05 && !rain) BGX.sunDisc.circle(sxS, syS, 18).fill({ color: h > 17.5 ? 0xFFB060 : 0xFFF2C0, alpha: sun });
  for (const st of BGX.stars) { st.position.set(st.rx * W, st.ry * H * 0.32); st.alpha = (1 - sun) * (0.4 + 0.6 * Math.abs(Math.sin(t / 40 + st.ph))) * (rain ? 0 : 1); }
  // edifici e ombre (le ombre girano con il sole)
  const B = bgData(), seen = new Set(), shK = (h - 13) / 6, shA = 0.24 * sun * (rain ? 0.3 : 1);
  for (const o of B.b.concat(bgPzInfo().deco)) {
    seen.add(o.id);
    const D = bgDef(o.k), S = bgSprite(o, night), flat = BG_FLAT.includes(o.k) && o.st === 'ok';
    let e = BGX.map.get(o.id);
    if (!e) { e = { sp: new PIXI.Sprite(), sh: null }; BGX.objs.addChild(e.sp); BGX.map.set(o.id, e); }
    if (e.S !== S) { e.S = S; e.sp.texture = bgTexOf(S); if (e.sh) e.sh.texture = e.sp.texture; }
    const p = bgIso(o.x, o.y), s = BG.scale;
    e.sp.position.set(p[0] - S.ox, p[1] - S.oy); e.sp.scale.set(1 / s);
    e.sp.zIndex = flat ? -100000 + o.x + o.y : (o.virt ? o.dep : o.x + o.y + D.w + D.d) * 10;
    const wantSh = !flat && o.k !== 'strada' && o.k !== 'sasso' && o.k !== 'pzlamp';
    if (wantSh && !e.sh) { e.sh = new PIXI.Sprite(e.sp.texture); e.sh.tint = 0x000000; BGX.shadows.addChild(e.sh); }
    if (e.sh) {
      const bx = (D.w - D.d) * BG_TW / 4, by = (D.w + D.d) * BG_TH / 4;
      e.sh.pivot.set((S.ox + bx) * s, (S.oy + by) * s); const c = bgIso(o.x + D.w / 2, o.y + D.d / 2);
      e.sh.position.set(c[0], c[1]); e.sh.scale.set(1 / s, 0.42 / s); e.sh.skew.set(shK, 0); e.sh.alpha = shA;
    }
  }
  for (const [id, e] of BGX.map) if (!seen.has(id)) { e.sp.destroy(); if (e.sh) e.sh.destroy(); BGX.map.delete(id); }
  // paesani
  const ws = new Set();
  for (const w of BG.walkers) {
    let g = BGX.walk.get(w); if (!g) { g = new PIXI.Graphics(); BGX.objs.addChild(g); BGX.walk.set(w, g); }
    ws.add(w); bgPixiWalker(g, w);
  }
  for (const [w, g] of BGX.walk) if (!ws.has(w)) { g.destroy(); BGX.walk.delete(w); }
  // uccelli
  BGX.birds.clear(); if (sun > 0.2) for (const b of BG.birds) { const f = Math.sin(b.ph) * 3; BGX.birds.moveTo(b.x - 6, b.y - f).quadraticCurveTo(b.x - 2, b.y - 3, b.x, b.y).quadraticCurveTo(b.x + 2, b.y - 3, b.x + 6, b.y - f); } BGX.birds.stroke({ width: 1.3, color: 0x282828, alpha: 0.8 });
  // nuvole e le loro ombre sul terreno
  for (const c of BGX.clouds) { c.cl.wx += c.v * (rain ? 2 : 1); if (c.cl.wx > 1000) c.cl.wx = -1000; c.cl.position.set(c.cl.wx, c.cl.wy); c.cl.scale.set(c.cl.sc * 1.3); c.cl.alpha = rain ? 0.95 : 0.6 + sun * 0.25; c.cl.tint = rain ? 0x9AA0AC : night ? 0x7A84A8 : 0xFFFFFF; c.sh.position.set(c.cl.wx + 60, c.cl.wy + 300); c.sh.scale.set(c.cl.sc * 2.2); c.sh.alpha = sun * 0.9; }
  // colore della luce: alba, giorno, tramonto, sera
  BGX.tint.clear().rect(0, 0, W, H).fill(bgTintFor(h, rain, festa));
  // luci di sera: lampioni, finestre, luminarie della festa
  const dark = Math.max(1 - sun, festa ? 0.6 : 0, rain ? 0.3 : 0);
  bgPixiLights(dark, festa);
  // fuochi d'artificio
  bgPixiFireworks(festa);
  // pioggia
  BGX.rain.clear();
  if (rain) { for (let k = 0; k < 140; k++) { const d = BGX.drops[k] || (BGX.drops[k] = { x: Math.random() * W, y: Math.random() * H, v: 7 + Math.random() * 5 }); d.y += d.v; d.x -= d.v * 0.25; if (d.y > H) { d.y = -10; d.x = Math.random() * (W + 60); } BGX.rain.moveTo(d.x, d.y).lineTo(d.x + 3, d.y - 12); } BGX.rain.stroke({ width: 1.2, color: 0xD8E4F0, alpha: 0.55 }); }
  app.render();
}
function bgPixiWalker(g, w) {
  const p = bgIso(w.x, w.y), x = p[0], y = p[1]; g.clear(); g.zIndex = (w.x + w.y + 1) * 10;
  g.ellipse(x, y, 4, 2).fill({ color: 0x000000, alpha: 0.22 });
  if (w.kind === 'cat') { g.ellipse(x, y - 3, 4, 2.4).fill(0x6A6A6A); g.circle(x + 3.5, y - 5, 2).fill(0x6A6A6A); g.beginPath().moveTo(x - 4, y - 3).quadraticCurveTo(x - 7, y - 9, x - 5, y - 10).stroke({ width: 1.2, color: 0x6A6A6A }); return; }
  const leg = Math.sin(w.ph) * 2, col = parseInt((w.old ? '#2A2A2A' : w.col).slice(1), 16);
  g.beginPath().moveTo(x - 1, y - 5).lineTo(x - 1 + leg, y).moveTo(x + 1, y - 5).lineTo(x + 1 - leg, y).stroke({ width: 1.6, color: 0x2A2A2A });
  g.roundRect(x - 3, y - 13, 6, 9, 2).fill(col);
  g.circle(x, y - 16, 2.8).fill(0xE8B98C);
  if (w.kind === 'tour') { g.ellipse(x, y - 18, 5, 1.6).fill(0xF2EFE6); g.rect(x - 2.5, y - 21, 5, 3).fill(0xF2EFE6); g.rect(x + 2, y - 11, 3, 2.4).fill(0x2A2A2A); }
  else g.moveTo(x - 2.85, y - 17).arc(x, y - 17, 2.85, Math.PI, 0).closePath().fill(w.old ? 0x9A9A9A : 0x3A2414);
}
function bgPixiLights(dark, festa) {
  const L = BGX.lights; let k = 0;
  const put = (x, y, z, r, a, tint) => { let s = L.children[k++]; if (!s) { s = new PIXI.Sprite(BGX.glowT); s.anchor.set(0.5); L.addChild(s); } const q = bgIso(x, y); s.position.set(q[0], q[1] - z); s.scale.set(r / 32); s.alpha = a; s.tint = tint || 0xFFC864; s.visible = true; };
  if (dark > 0.05) for (const o of bgData().b) {
    if (o.st !== 'ok') continue; const D = bgDef(o.k);
    if (o.k === 'lampione') put(o.x + 0.62, o.y + 0.5, 30, 22, 0.5 * dark);
    else if (['casa', 'palazzo', 'municipio', 'bottega', 'osteria', 'chiesa', 'forno', 'frantoio'].includes(o.k)) put(o.x + D.w * 0.45, o.y + D.d * 0.95, 12, 12 + D.w * 4, 0.22 * dark);
    else if (o.k === 'edicola') put(o.x + 0.5, o.y + 0.66, 6, 9, 0.45 * dark, 0xFFAA50);
  }
  if (dark > 0.05) for (const o of bgPzInfo().deco) if (o.k === 'pzlamp') put(o.x + 0.5, o.y + 0.5, 26, 18, 0.45 * dark);
  // luminarie della festa lungo le stradine: lampadine colorate che si accendono a turno
  if (festa) { const cols = [0xFF4040, 0xFFE040, 0x40C0FF, 0x60FF80, 0xFF60D0]; let n = 0; for (const o of bgData().b) { if (o.k !== 'strada' || o.st !== 'ok') continue; for (let q = 0; q < 4; q++) { const on = ((BG.t >> 3) + n) % 3 !== 0; put(o.x + 0.15 + q * 0.23, o.y + 0.5, 20 + Math.sin(q * 1.4) * 2, 9, on ? 0.95 : 0.25, cols[n % 5]); n++; } if (n > 400) break; } }
  for (; k < L.children.length; k++) L.children[k].visible = false;
}
function bgPixiFireworks(festa) {
  const C = BGX.fwG;
  if (festa && BG.t % 50 === 0) {   // un nuovo fuoco
    const cx = (Math.random() - 0.5) * BG_N * BG_TW * 0.6, cy = BG_N * BG_TH * (0.2 + Math.random() * 0.5) - 160 - Math.random() * 80, col = [0xFF5050, 0xFFE060, 0x60C8FF, 0x80FF90, 0xFF70E0, 0xFFFFFF][Math.floor(Math.random() * 6)];
    for (let k = 0; k < 46; k++) { const a = k / 46 * Math.PI * 2, v = 1.6 + Math.random() * 1.4; let s = BGX.fw.find((f) => !f.live); if (!s) { const sp = new PIXI.Sprite(BGX.dotT); sp.anchor.set(0.5); C.addChild(sp); s = { sp }; BGX.fw.push(s); } Object.assign(s, { live: true, x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 70 + Math.random() * 20 }); s.sp.tint = col; s.sp.visible = true; }
    if (typeof fx === 'function' && Math.random() < 0.3) fx('card');
  }
  for (const f of BGX.fw) { if (!f.live) continue; f.x += f.vx; f.y += f.vy; f.vy += 0.035; f.vx *= 0.985; f.life--; f.sp.position.set(f.x, f.y); f.sp.alpha = Math.min(1, f.life / 40); f.sp.scale.set(0.16 + f.life / 420); if (f.life <= 0) { f.live = false; f.sp.visible = false; } }
}
/* la festa del santo: 10 minuti di luminarie, fuochi, più turisti e +20% di guadagni */
const BG_FESTA_MIN = 10, BG_FESTA_C = 300, BG_FESTA_CD = 6 * 3600e3;
function bgFestaStart() {
  const B = bgData(), now = Date.now();
  if (!B.b.some((o) => o.k === 'chiesa' && o.st === 'ok')) { flash('Serve la chiesa per la festa del santo'); return; }
  if (B.festaNext && now < B.festaNext) { flash('La prossima festa tra ' + bgFmt(B.festaNext - now)); return; }
  if (eco().carlini < BG_FESTA_C) { flash('Non hai abbastanza carlini'); return; }
  eco().carlini -= BG_FESTA_C; B.festa = now + BG_FESTA_MIN * 60000; B.festaNext = now + BG_FESTA_CD; save();
  flash('🎆 Festa del santo! Luminarie, fuochi e turisti per ' + BG_FESTA_MIN + ' minuti'); fx('big'); bgSpawn(); bgHud(); bgPanel();
  if (typeof track === 'function') track('borgo_festa', {});
}
