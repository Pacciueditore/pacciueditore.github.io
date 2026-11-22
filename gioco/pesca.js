/* ================= LA PESCA ================= */
const FISH = [
  { id: 'alice', n: 'Alice', e: '🐟', r: 1, kg: [0.02, 0.05], v: 4, pull: 0.2, c: ['#3E7E8E', '#E4EEF3'], len: 16, long: 1.15, tall: 0.75, stripe: '#D7E9F0', f: 'Piccola e argentata, nuota in grandi banchi: fritta o sotto sale è una festa.' },
  { id: 'sarda', n: 'Sarda', e: '🐟', r: 1, kg: [0.05, 0.12], v: 5, pull: 0.25, c: ['#2F5F86', '#DDE8EE'], len: 18, spots: '#1E3A55', f: 'Con le sarde e il peperoncino si fa la sardella, la “rosamarina” dei giorni nostri.' },
  { id: 'cefalo', n: 'Cefalo', e: '🐟', r: 1, kg: [0.3, 1.5], v: 10, pull: 0.35, c: ['#5D6B72', '#D4DADB'], len: 26, lines: 'rgba(50,60,66,0.55)', long: 1.1, f: 'Si avvicina alle foci dei fiumi ed è furbo: guarda l’esca prima di abboccare.' },
  { id: 'orata', n: 'Orata', e: '🐠', r: 2, kg: [0.3, 2], v: 18, pull: 0.45, c: ['#7D8C96', '#E8ECEC'], len: 26, tall: 1.5, gold: 1, f: 'Ha una striscia dorata tra gli occhi: per questo si chiama così.' },
  { id: 'sarago', n: 'Sarago', e: '🐠', r: 2, kg: [0.2, 1.2], v: 14, pull: 0.45, c: ['#8A9196', '#E6E6E0'], len: 24, tall: 1.45, bands: 1, tailSpot: 1, f: 'Vive tra gli scogli e tira forte appena sente l’amo.' },
  { id: 'spigola', n: 'Spigola', e: '🐟', r: 2, kg: [0.5, 4], v: 22, pull: 0.5, c: ['#56656E', '#E2E6E6'], len: 32, long: 1.12, gillSpot: 1, fin: '#4B5860', f: 'Da noi la chiamano anche “lupo di mare”: caccia di notte vicino alla riva.' },
  { id: 'polpo', n: 'Polpo', e: '🐙', r: 2, kg: [0.5, 3], v: 20, pull: 0.55, c: ['#B8553E', '#E9A487'], len: 26, shape: 'polpo', f: 'Si nasconde nelle tane tra gli scogli e si attacca con tutti e otto i tentacoli.' },
  { id: 'totano', n: 'Totano', e: '🦑', r: 3, kg: [0.3, 1.5], v: 26, pull: 0.55, c: ['#C9745A', '#F1C6B2'], len: 32, shape: 'totano', f: 'Si pesca di notte con la luce, che lo attira in superficie.' },
  { id: 'ricciola', n: 'Ricciola', e: '🐟', r: 3, kg: [3, 20], v: 40, pull: 0.7, c: ['#4F6E78', '#E9EDE6'], len: 44, stripe: '#E5C04A', long: 1.1, tailC: '#E5C04A', f: 'Velocissima e potente: quando abbocca, la canna si piega fino all’acqua.' },
  { id: 'tonno', n: 'Tonno rosso', e: '🐟', r: 4, kg: [30, 150], v: 90, pull: 0.85, c: ['#1E3550', '#D6DEE4'], len: 62, tall: 1.35, finlets: 1, fin: '#26405E', tailC: '#1E3550', dorsal2: '#E5C04A', f: 'Il gigante del Mediterraneo: un tempo a Pizzo c’era una tonnara famosa.' },
  { id: 'spada', n: 'Pesce spada', e: '', r: 5, kg: [40, 180], v: 150, pull: 0.95, c: ['#33405E', '#C9D2DD'], len: 70, shape: 'spada', f: 'Il re dello Stretto, simbolo del seme Mare: a Scilla e Bagnara lo aspettano ogni primavera.' },
  { id: 'sgombro', n: 'Sgombro', e: '🐟', r: 1, kg: [0.1, 0.6], v: 7, pull: 0.3, c: ['#1F6E70', '#E8EEF0'], len: 22, long: 1.1, tall: 0.85, waves: '#0F3A3C', f: 'Corre in branchi velocissimi: le strisce sul dorso sembrano le onde del mare.' },
  { id: 'triglia', n: 'Triglia', e: '🐟', r: 2, kg: [0.05, 0.4], v: 9, pull: 0.3, c: ['#C8463C', '#F6D3C4'], len: 18, barbels: 1, stripe: '#EDB64A', fin: '#D9705C', f: 'Rossa con due baffetti sotto la bocca: li usa per cercare il cibo nella sabbia.' },
  { id: 'aguglia', n: 'Aguglia', e: '🐟', r: 2, kg: [0.1, 0.8], v: 12, pull: 0.4, c: ['#2E7D5B', '#E3F0EA'], len: 30, long: 1.7, tall: 0.55, beak: 1, f: 'Lunga e sottile, col becco a spillo: quando abbocca salta fuori dall’acqua.' },
  { id: 'seppia', n: 'Seppia', e: '🦑', r: 2, kg: [0.2, 1.5], v: 18, pull: 0.5, c: ['#8C6D52', '#EBD9C2'], len: 24, shape: 'seppia', f: 'Quando ha paura spruzza l’inchiostro e sparisce: col suo nero si fa la pasta più buona.' },
  { id: 'scorfano', n: 'Scorfano', e: '🐟', r: 2, kg: [0.2, 1.5], v: 16, pull: 0.5, c: ['#B3402E', '#F0B49A'], len: 22, tall: 1.3, spines: 1, blotch: '#6E1F17', bigmouth: 1, fin: '#C2553E', f: 'Rosso e spinoso, si mimetizza tra gli scogli: è il re della zuppa di pesce. Attento alle spine!' },
  { id: 'dentice', n: 'Dentice', e: '🐟', r: 3, kg: [1, 8], v: 32, pull: 0.6, c: ['#C27474', '#F4E0DC'], len: 36, tall: 1.3, dots: '#5BA7E0', fin: '#B86A6A', f: 'Ha denti robusti e puntini azzurri sul dorso: un pesce da re.' },
  { id: 'murena', n: 'Murena', e: '🐍', r: 3, kg: [0.5, 6], v: 30, pull: 0.65, c: ['#4A3A22', '#D8C46A'], len: 40, shape: 'murena', f: 'Esce dalla tana a bocca aperta: sembra cattiva, ma vuole solo respirare.' },
  { id: 'lampuga', n: 'Lampuga', e: '🐟', r: 3, kg: [2, 15], v: 38, pull: 0.7, c: ['#2F8F5A', '#F0D84A'], len: 46, long: 1.15, crest: 1, fin: '#2D7FB8', tailC: '#E9C43A', dots: '#1D5FA0', f: 'Verde e oro, cambia colore quando esce dall’acqua: arriva in autunno con le correnti.' },
  { id: 'cernia', n: 'Cernia', e: '🐟', r: 3, kg: [2, 25], v: 45, pull: 0.75, c: ['#6B4A2E', '#C9A985'], len: 44, tall: 1.4, blotch: '#3F2A18', bigmouth: 1, f: 'Vive nelle tane profonde e può diventare enorme: per tirarla su ci vuole forza.' },
  { id: 'boga', n: 'Boga', e: '', r: 1, kg: [0.05, 0.3], v: 4, pull: 0.25, c: ['#7E8F5A', '#EEF0DE'], len: 18, long: 1.1, tall: 0.8, lines: 'rgba(214,180,60,0.85)', f: 'Gira in grandi branchi vicino a riva: ha le righe dorate sui fianchi e gli occhi grandi.' },
  { id: 'ghiozzo', n: 'Ghiozzo', e: '', r: 1, kg: [0.03, 0.2], v: 3, pull: 0.2, c: ['#8A7354', '#E6D8BE'], len: 15, tall: 1.05, blotch: '#4E3A22', bigmouth: 1, fin: '#9A8262', f: 'Piccolo e testone, sta appoggiato sul fondo e scatta via quando ti avvicini.' },
  { id: 'mormora', n: 'Mormora', e: '', r: 2, kg: [0.1, 0.8], v: 10, pull: 0.35, c: ['#B9BCB4', '#F2F2EC'], len: 22, tall: 1.15, bands2: 1, f: 'Argentata con tante strisce scure: cerca vermetti nella sabbia dove si rompono le onde.' },
  { id: 'sogliola', n: 'Sogliola', e: '', r: 2, kg: [0.2, 1.2], v: 16, pull: 0.4, c: ['#9B7F5C', '#D9C5A2'], len: 24, shape: 'sogliola', f: 'Piatta piatta, con tutti e due gli occhi dalla stessa parte: si nasconde sotto la sabbia.' },
  { id: 'donzella', n: 'Donzella', e: '', r: 1, kg: [0.02, 0.1], v: 3, pull: 0.2, c: ['#3E8F6E', '#F2D9A8'], len: 16, long: 1.15, tall: 0.75, stripe: '#E8743A', fin: '#4AA6C8', f: 'Il pesce più colorato degli scogli: verde, arancio e azzurro, sembra dipinto.' },
  { id: 'castagnola', n: 'Castagnola', e: '', r: 1, kg: [0.02, 0.08], v: 3, pull: 0.2, c: ['#3A3428', '#6E6250'], len: 14, tall: 1.35, fin: '#2E2A22', f: 'Piccola e scura come una castagna: da giovane invece è di un blu elettrico.' },
  { id: 'grongo', n: 'Grongo', e: '', r: 2, kg: [1, 15], v: 22, pull: 0.65, c: ['#5E6670', '#C9CED2'], len: 40, shape: 'murena', nodots: 1, f: 'Il cugino grigio della murena: forte come un toro, quando abbocca non molla più.' },
  { id: 'aragosta', n: 'Aragosta', e: '', r: 3, kg: [0.5, 3], v: 60, pull: 0.55, c: ['#B5452B', '#E9A260'], len: 26, shape: 'aragosta', f: 'Corazzata e con le antenne lunghissime: è il tesoro degli scogli di Scilla.' },
  { id: 'palamita', n: 'Palamita', e: '', r: 2, kg: [1, 6], v: 20, pull: 0.6, c: ['#2C4F78', '#E3E9EE'], len: 38, long: 1.1, oblique: '#1B3150', finlets: 1, f: 'Una piccola tonnina con le righe storte sul dorso: corre velocissima a pelo d’acqua.' },
  { id: 'volante', n: 'Pesce volante', e: '', r: 2, kg: [0.2, 0.8], v: 14, pull: 0.35, c: ['#2F5E9A', '#E6EEF5'], len: 22, long: 1.1, tall: 0.8, wings: 1, f: 'Apre le pinne come ali e plana sopra le onde per scappare dai predatori.' },
  { id: 'alalunga', n: 'Alalunga', e: '', r: 3, kg: [5, 30], v: 55, pull: 0.8, c: ['#253C58', '#DCE3E9'], len: 52, tall: 1.3, finlets: 1, longPec: 1, fin: '#2E4766', f: 'Il tonno dalle pinne lunghe come ali: la sua carne bianca è la più pregiata.' },
  { id: 'corvina', n: 'Corvina', e: '', r: 2, kg: [1, 8], v: 24, pull: 0.55, c: ['#6B5A3A', '#D8C49A'], len: 36, tall: 1.2, fin: '#3A2E1E', tailC: '#2E2418', f: 'Bruna e dorata, di notte “canta”: fa un rumore come un tamburo sott’acqua.' },
  { id: 'balestra', n: 'Pesce balestra', e: '', r: 2, kg: [0.5, 2.5], v: 18, pull: 0.5, c: ['#7A8590', '#C9D0D6'], len: 26, tall: 1.55, lines: 'rgba(70,130,200,0.7)', spines: 1, f: 'Ha una spina sul dorso che blocca come una balestra: così si incastra tra gli scogli.' },
  { id: 'razza', n: 'Razza', e: '', r: 2, kg: [1, 10], v: 22, pull: 0.6, c: ['#8C7458', '#E8DCC6'], len: 30, shape: 'razza', f: 'Vola sul fondo come un aquilone: piatta, con le ali larghe e la coda sottile.' },
  { id: 'sanpietro', n: 'Pesce San Pietro', e: '', r: 3, kg: [0.5, 3], v: 40, pull: 0.5, c: ['#9C9078', '#E4DCC8'], len: 30, tall: 1.9, ocellus: 1, spines: 1, fin: '#A89A7C', f: 'Ha una macchia nera sul fianco: dicono che sia l’impronta del dito di San Pietro.' },
  { id: 'luna', n: 'Pesce luna', e: '', r: 5, kg: [50, 300], v: 200, pull: 0.9, c: ['#7D8A96', '#D9E0E6'], len: 70, shape: 'luna', f: 'Un gigante gentile che prende il sole a galla: vederlo, dicono i pescatori, porta fortuna.' },
  { id: 'scarpa', n: 'Scarpa vecchia', e: '👢', r: 1, kg: [0.4, 0.8], v: 0, pull: 0.1, c: ['#5B3B22', '#8A6040'], len: 20, shape: 'scarpa', junk: true, f: 'Qualcuno l’ha persa in spiaggia… almeno non scappa!' },
];
const SPOTS = [
  { id: 'tropea', n: 'Spiaggia di Tropea', lv: 1, w: { alice: 22, sarda: 18, sgombro: 14, boga: 14, cefalo: 13, ghiozzo: 10, mormora: 9, triglia: 9, spigola: 7, sogliola: 6, scarpa: 7 }, d: 'Acqua bassa e sabbia bianca: pesci piccoli e tanti.' },
  { id: 'scilla', n: 'Scogli di Scilla', lv: 4, w: { sarago: 18, orata: 15, donzella: 15, castagnola: 14, polpo: 12, scorfano: 12, seppia: 10, grongo: 7, murena: 6, aragosta: 4, scarpa: 4 }, d: 'Tra gli scogli di Chianalea: polpi, saraghi e murene nelle tane.' },
  { id: 'stretto', n: 'In feluca sullo Stretto', lv: 8, w: { totano: 20, ricciola: 18, aguglia: 16, palamita: 16, volante: 12, alalunga: 9, tonno: 10, spada: 5, scarpa: 3 }, d: 'Correnti forti e pesci grossi: il regno del pesce spada.' },
  { id: 'vaticano', n: 'Secche di Capo Vaticano', lv: 12, w: { dentice: 18, lampuga: 16, cernia: 14, corvina: 14, balestra: 12, razza: 10, sanpietro: 8, luna: 3, scarpa: 3 }, d: 'Fondali profondi e misteriosi: cernie, dentici e, chissà, il pesce luna.' },
];
// 1.3.10: ogni posto ha i suoi pesci; il posto dopo si apre quando li hai presi tutti (i leggendari non servono)
const spotFish = (sp) => Object.keys(sp.w).map((id) => FISH.find((f) => f.id === id)).filter((f) => f && !f.junk);
const spotNeed = (sp) => spotFish(sp).filter((f) => f.r < 4);
function spotProg(Q, sp) { const need = spotNeed(sp); return [need.filter((f) => Q.album[f.id]).length, need.length]; }
function spotOpen(Q, sp) {
  const i = SPOTS.indexOf(sp); if (i <= 0) return true;
  if (!Q.open) Q.open = SPOTS.filter((x) => levelOf(P.xp) >= x.lv).map((x) => x.id);   // chi li aveva già aperti col livello se li tiene
  if (Q.open.includes(sp.id)) return true;
  const [a, b] = spotProg(Q, SPOTS[i - 1]); return a >= b;
}
const RODS = [
  { id: 'bambu', n: 'Canna di bambù', e: '🎋', price: 0, zone: 0, snap: 1, power: 0.85, rare: 0, d: 'Quella del nonno: leggera, ma non lancia lontano.' },
  { id: 'vetro', n: 'Canna in vetroresina', e: '🎣', price: 300, zone: 0.05, snap: 1.15, power: 0.95, rare: 0.15, d: 'Zona verde più larga, filo più resistente, lanci più lunghi.' },
  { id: 'traina', n: 'Canna da traina', e: '🔱', price: 900, zone: 0.09, snap: 1.3, power: 1, rare: 0.3, d: 'Per i giganti dello Stretto: regge i tonni e arriva lontanissimo.' },
];
const BAITS = [
  { id: 'verme', n: 'Verme', e: '🪱', price: 0, rare: 0, d: 'Ricresce da solo col tempo.' },
  { id: 'gambero', n: 'Gamberetto', e: '🦐', price: 10, rare: 0.35, d: 'Piace a orate, spigole e saraghi: più pesci buoni.' },
  { id: 'calamaro', n: 'Calamaretto', e: '🦑', price: 25, rare: 0.8, d: 'L’esca dei grandi: tonni e pesci spada non resistono.' },
];
const ESCHE_MAX = 10, ESCA_MS = 8 * MIN, ESCA_PRICE = 15;
const PZ = { weak: 0.6, red: 0.92, gold: 0.77, goldW: 0.035 };
let PS = null, psRaf = 0;
function pesca() {
  if (!P.pesca) P.pesca = { esche: ESCHE_MAX, last: Date.now(), album: {}, total: 0, cesta: [], best: null, spot: 'tropea' };
  const Q = P.pesca, now = Date.now();
  if (!Q.rods) { Q.rods = ['bambu']; Q.rod = 'bambu'; Q.bait = 'verme'; Q.baits = { gambero: 0, calamaro: 0 }; Q.perfect = 0; Q.casts = 0; }
  if (Q.esche < ESCHE_MAX) { const n = Math.floor((now - Q.last) / ESCA_MS); if (n > 0) { Q.esche = Math.min(ESCHE_MAX, Q.esche + n); Q.last += n * ESCA_MS; } }
  if (Q.esche >= ESCHE_MAX) Q.last = now;
  return Q;
}
const rodOf = (Q) => RODS.find((r) => r.id === Q.rod) || RODS[0];
const baitOf = (Q) => BAITS.find((b) => b.id === Q.bait) || BAITS[0];
const baitLeft = (Q, id) => (id || Q.bait) === 'verme' ? Q.esche : (Q.baits[id || Q.bait] || 0);
// 1.3.10: ogni pesce ha il suo disegno, fatto con lo stesso pennello del gioco
// articolo giusto: un tonno, uno scorfano, una sarda, un’orata
const FISH_FEM = ['alice', 'sarda', 'orata', 'spigola', 'ricciola', 'triglia', 'aguglia', 'seppia', 'murena', 'lampuga', 'cernia', 'scarpa', 'boga', 'mormora', 'sogliola', 'donzella', 'castagnola', 'aragosta', 'palamita', 'alalunga', 'corvina', 'razza'];
function fishArt(f) { const n = f.n.toLowerCase(); if (FISH_FEM.includes(f.id)) return /^[aeiou]/.test(n) ? 'un’' : 'una '; return /^(s[^aeiou]|z|gn|ps|x|y)/.test(n) ? 'uno ' : 'un '; }
const FISH_PIC = {};
function fishPic(f) {
  if (FISH_PIC[f.id]) return FISH_PIC[f.id];
  const W = 380, H = 260, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const x = cv.getContext('2d');
  drawFishShape(x, f, W / 2, H / 2, 4, 1, 0.7, false);
  const d = x.getImageData(0, 0, W, H).data; let x0 = W, y0 = H, x1 = 0, y1 = 0;
  for (let y = 0; y < H; y++) for (let i = 0; i < W; i++) if (d[(y * W + i) * 4 + 3] > 10) { if (i < x0) x0 = i; if (i > x1) x1 = i; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 < x0) return '';
  const pad = 6, bw = x1 - x0 + 1 + pad * 2, bh = y1 - y0 + 1 + pad * 2, OW = 200, OH = 120, out = document.createElement('canvas'); out.width = OW; out.height = OH;
  const k = Math.min(OW / bw, OH / bh); out.getContext('2d').drawImage(cv, x0 - pad, y0 - pad, bw, bh, (OW - bw * k) / 2, (OH - bh * k) / 2, bw * k, bh * k);
  return (FISH_PIC[f.id] = out.toDataURL());
}
const fishImg = (f, big) => '<img class="fimg' + (big ? ' big' : '') + '" src="' + fishPic(f) + '" alt="">';
const STARS = (r) => '★'.repeat(Math.min(r, 5));
const fmtKg = (k) => k < 1 ? Math.round(k * 1000) + ' g' : (Math.round(k * 10) / 10).toString().replace('.', ',') + ' kg';
const clamp01 = (x) => Math.max(0, Math.min(1, x));

/* ---------- suoni del mare ---------- */
function psSound(kind) {
  if (!AUDIO.on) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const noise = (dur, freq, gain, type) => {
      const n = Math.floor(actx.sampleRate * dur), buf = actx.createBuffer(1, n, actx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
      const s = actx.createBufferSource(), f = actx.createBiquadFilter(), g = actx.createGain();
      f.type = type || 'lowpass'; f.frequency.value = freq; g.gain.value = gain;
      s.buffer = buf; s.connect(f).connect(g).connect((typeof fxDest === 'function' ? fxDest() : actx.destination)); s.start();
    };
    if (kind === 'whoosh') noise(0.35, 1400, 0.35, 'bandpass');
    else if (kind === 'splash') noise(0.5, 900, 0.6);
    else if (kind === 'tic') tone(1200, 0, 0.04, 'square', 0.05);
    else if (kind === 'snap') { noise(0.12, 3000, 0.5, 'highpass'); tone(220, 0.05, 0.3, 'sawtooth', 0.08); }
    else if (kind === 'hook') { tone(500, 0, 0.08, 'triangle', 0.2); tone(1000, 0.06, 0.12, 'triangle', 0.18); }
    else if (kind === 'perfect') [784, 988, 1319].forEach((f, i) => tone(f, i * 0.06, 0.16, 'triangle', 0.14));
  } catch (e) { /* niente audio */ }
}
const buzz = (p) => { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) { /* niente */ } };

/* ---------- scelta del pesce: lancio, esca e canna contano ---------- */
function pickFish(spot, bonus, bait, tangle) {
  const w = SPOTS.find((x) => x.id === spot).w, ids = Object.keys(w), k = 1 + bonus * 0.7;
  const ww = ids.map((id) => {
    const f = FISH.find((x) => x.id === id);
    if (f.junk) return w[id] * (tangle ? 4 : Math.max(0.15, 1 - bonus * 0.6));
    let x = w[id] * Math.pow(k, f.r - 1);
    if (bait === 'calamaro') { if (id === 'spada') x *= 2; if (id === 'tonno' || id === 'totano') x *= 1.5; }
    if (bait === 'gambero' && (id === 'orata' || id === 'spigola' || id === 'sarago')) x *= 1.6;
    return x;
  });
  let r = Math.random() * ww.reduce((t, x) => t + x, 0);
  for (let i = 0; i < ids.length; i++) { if ((r -= ww[i]) < 0) return FISH.find((f) => f.id === ids[i]); }
  return FISH[0];
}
function rollKg(f, bonus) {
  const e = 1.6 - 0.8 * Math.min(1, bonus / 2);
  return f.kg[0] + Math.pow(Math.random(), e) * (f.kg[1] - f.kg[0]);
}

/* ---------- schermata a riva ---------- */
function renderPesca() {
  const box = $('pescaBox'), Q = pesca(), L = levelOf(P.xp);
  { const cur = SPOTS.find((x) => x.id === Q.spot); if (!cur || !spotOpen(Q, cur)) Q.spot = 'tropea'; }
  if (PS) { if (!$('pcv')) buildArena(); setCtl(); return; }
  stopLoop();
  const seen = Object.keys(Q.album).length, cesta = Q.cesta.reduce((t, c) => t + c.v, 0), C = eco().carlini;
  const nextE = Q.esche < ESCHE_MAX ? Math.max(0, ESCA_MS - (Date.now() - Q.last)) : 0;
  const rod = rodOf(Q), can = baitLeft(Q) > 0;
  let h = '<div class="pstats"><span>' + rod.e + ' <b>' + rod.n + '</b></span><span>🧺 <b>' + Q.cesta.length + '</b> pesci</span><span>🎯 <b>' + (Q.perfect || 0) + '</b> lanci perfetti</span></div>' +
    '<h3>Dove peschi?</h3><div class="pspots">' + SPOTS.map((sp, i) => { const lock = !spotOpen(Q, sp), [a, b] = spotProg(Q, sp), pv = SPOTS[i - 1], pp = pv ? spotProg(Q, pv) : [0, 0]; return '<button class="pspot' + (Q.spot === sp.id ? ' on' : '') + '" data-pspot="' + sp.id + '"' + (lock ? ' disabled' : '') + '><b>' + sp.n + (lock ? '' : ' <em class="pspc' + (a >= b ? ' ok' : '') + '">🐟 ' + a + '/' + b + '</em>') + '</b><small>' + (lock ? '🔒 Pesca tutti i pesci di ' + pv.n.replace(/^(Spiaggia di |Scogli di |In feluca sullo |Secche di )/, '') + ' per aprirlo (' + pp[0] + '/' + pp[1] + ')' : sp.d) + '</small></button>'; }).join('') + '</div>' +
    '<h3>Esca</h3><div class="pbaits">' + BAITS.map((b) => { const n = baitLeft(Q, b.id); return '<button class="pbait' + (Q.bait === b.id ? ' on' : '') + '" data-pbait="' + b.id + '"><span>' + b.e + '</span><b>' + b.n + '</b><small>' + (b.id === 'verme' ? n + '/' + ESCHE_MAX + (nextE ? ' · +1 tra ' + Math.ceil(nextE / 60000) + '′' : '') : '× ' + n) + '</small></button>'; }).join('') + '</div>' +
    '<button class="btn take pgo" data-pgo="1"' + (can ? '' : ' disabled') + '>🎣 Vai a pescare</button>' +
    (can ? '' : '<p class="pnote">' + (Q.bait === 'verme' ? 'I vermi sono finiti: aspetta che ricrescano, compra delle esche in bottega o scegli un’altra esca.' : 'Non hai più ' + baitOf(Q).n.toLowerCase() + ': comprane in bottega o usa i vermi.') + '</p>') +
    (Q.cesta.length ? '<div class="pcesta"><div><b>La tua cesta</b><small>' + Q.cesta.slice(0, 24).map((c) => '<img class="fmini" src="' + fishPic(FISH.find((f) => f.id === c.id) || FISH[0]) + '" alt="">').join('') + (Q.cesta.length > 24 ? ' …' : '') + '</small></div><button class="btn small take" data-psell="1">Vendi in pescheria +' + cesta + '</button></div>' : '') +
    '<h3>Bottega del pescatore</h3><div class="pshop">' +
    RODS.map((r) => { const own = Q.rods.includes(r.id), on = Q.rod === r.id; return '<div class="pitem' + (on ? ' on' : '') + '"><span class="pie">' + r.e + '</span><span><b>' + r.n + '</b><small>' + r.d + '</small></span>' + (on ? '<em>In mano</em>' : own ? '<button class="btn small" data-prod="' + r.id + '">Usa</button>' : '<button class="btn small take" data-prodbuy="' + r.id + '"' + (C >= r.price ? '' : ' disabled') + '>' + r.price + ' 🪙</button>') + '</div>'; }).join('') +
    BAITS.filter((b) => b.price).map((b) => '<div class="pitem"><span class="pie">' + b.e + '</span><span><b>3 ' + (b.id === 'gambero' ? 'gamberetti' : 'calamaretti') + '</b><small>' + b.d + '</small></span><button class="btn small take" data-pbaitbuy="' + b.id + '"' + (C >= b.price * 3 ? '' : ' disabled') + '>' + b.price * 3 + ' 🪙</button></div>').join('') +
    '<div class="pitem"><span class="pie">🪱</span><span><b>5 vermi</b><small>Se non vuoi aspettare che ricrescano.</small></span><button class="btn small take" data-pbuy="1"' + (C >= ESCA_PRICE * 5 ? '' : ' disabled') + '>' + ESCA_PRICE * 5 + ' 🪙</button></div></div>' +
    '<h3 class="alh">Album dei pesci · ' + seen + '/' + FISH.length + '</h3>' + SPOTS.concat([{ id: 'altro', n: 'Sorprese del mare', w: { scarpa: 1 } }]).map((sp) => { const list = sp.id === 'altro' ? FISH.filter((f) => f.junk) : spotFish(sp); const pr = sp.id === 'altro' ? null : spotProg(Q, sp); return '<h4 class="alsp">' + sp.n + (pr ? ' <em' + (pr[0] >= pr[1] ? ' class="ok"' : '') + '>' + pr[0] + '/' + pr[1] + (pr[0] >= pr[1] ? ' ✓' : '') + '</em>' : '') + '</h4><div class="album">' + list.map((f) => { const a = Q.album[f.id]; return '<button class="acard' + (a ? '' : ' unseen') + ' r' + Math.min(f.r, 4) + '" data-pfish="' + f.id + '"' + (a ? '' : ' disabled') + '><span class="ae">' + (a ? fishImg(f) : '?') + '</span><b>' + (a ? f.n : '???') + '</b><small>' + (a ? 'record ' + fmtKg(a.max) : STARS(f.r)) + '</small></button>'; }).join('') + '</div>'; }).join('') +
    '<h3>Obiettivi della pesca</h3><div class="mgoals">' + PESCA_GOALS.map((g) => { const [a, b] = g.prog(Q), done = a >= b; return '<div class="mgoal' + (done ? ' done' : '') + '"><img src="' + AVIMG[g.icon] + '" alt=""><span><b>' + g.name + '</b><small>' + g.need + '</small>' + (done ? '' : '<i class="pbar"><b style="width:' + Math.round(a / b * 100) + '%"></b></i>') + '</span><em>' + (done ? '✓' : a + '/' + b) + '</em></div>'; }).join('') + '</div>';
  box.innerHTML = h;
}

/* ---------- sessione di pesca ---------- */
function newSession() {
  const Q = pesca();
  PS = { spot: Q.spot, phase: 'aim', t0: performance.now(), last: performance.now(), time: 0, parts: [], ripples: [], toast: null, rodA: -0.95, rodV: 0, bend: 0, swing: 0 };
  const amb = ({ tropea: ['triglia', 'sarda', 'sgombro'], scilla: ['sarago', 'scorfano', 'orata'], stretto: ['ricciola', 'lampuga', 'aguglia'], vaticano: ['cernia', 'dentice', 'murena'] }[Q.spot] || ['triglia', 'sarda', 'orata']).map((id) => Math.max(0, FISH.findIndex((f) => f.id === id)));
  PS.ambient = Array.from({ length: 5 }, (_, i) => ({ x: Math.random() * 360, d: Math.random(), s: 0.55 + Math.random() * 0.4, v: (Math.random() < 0.5 ? -1 : 1) * (7 + Math.random() * 10), ph: Math.random() * 6, sp: i === 0 ? 0 : amb[i % 3], school: i === 0 }));
  PS.bubbles = [];
}
function startFishing() { const Q = pesca(); if (!baitLeft(Q)) return; newSession(); renderPesca(); startLoop(); }
function buildArena() {
  const sp = SPOTS.find((x) => x.id === PS.spot);
  $('pescaBox').innerHTML = '<div class="parena" id="parena"><canvas id="pcv" aria-label="Il mare di ' + sp.n + '"></canvas><div class="pspotname">' + sp.n + '</div></div>' +
    '<button class="btn take pbig" id="pbig"></button>' +
    '<div class="prow"><span id="pbaitInfo"></span><button class="btn ghost small" data-pstop="1">Torna a riva</button></div>';
}
function setCtl() {
  const b = $('pbig'), Q = pesca(); if (!b || !PS) return;
  const ph = PS.phase, left = baitLeft(Q);
  b.textContent = ph === 'aim' ? (left ? 'Tieni premuto per caricare il lancio' : 'Esche finite') : ph === 'charge' ? 'Lascia nel verde!' : ph === 'fly' ? 'Vola…' : ph === 'wait' ? 'Aspetta che abbocchi…' : ph === 'bite' ? 'FERRA!' : ph === 'reel' ? 'Tieni premuto per tirare' : '…';
  b.disabled = ph === 'aim' && !left;
  b.className = 'btn take pbig' + (ph === 'bite' ? ' hot' : ph === 'wait' || ph === 'fly' ? ' calm' : '');
  const bi = $('pbaitInfo'), bt = baitOf(Q);
  if (bi) bi.innerHTML = rodOf(Q).e + ' ' + bt.e + ' ' + bt.n + ' <b>' + left + '</b>' + (ph === 'aim' ? ' · <button class="plink" data-pswap="1">cambia esca</button>' : '');
}
function setPhase(ph) { PS.phase = ph; PS.pt = PS.time; setCtl(); }
function toast(text, cls) { if (PS) PS.toast = { text, cls: cls || '', t: PS.time }; }

/* geometria (coordinate logiche: larghezza 360) */
function geo() {
  const c = $('pcv'); const w = c ? c.clientWidth || 360 : 360, h = c ? c.clientHeight || 420 : 420;
  const H = 360 * h / w, wy = Math.round(H * 0.37), by = H - 22;
  const base = PS.spot === 'stretto' || PS.spot === 'vaticano' ? { x: 46, y: wy - 30 } : PS.spot === 'scilla' ? { x: 40, y: wy - 26 } : { x: 38, y: wy - 18 };
  return { W: 360, H, wy, by, base, pier: base.x + 14 };
}
const surf = (x, t, wy) => wy + 2.4 * Math.sin(x * 0.045 + t * 1.6) + 1.4 * Math.sin(x * 0.11 - t * 2.3);
function rodTip(G) { const L = 140, a = PS.rodA + PS.bend * 0.55; return { x: G.base.x + Math.cos(a) * L, y: G.base.y + Math.sin(a) * L, a }; }

/* ---------- input ---------- */
function psPress() {
  if (!PS) return;
  const Q = pesca(), ph = PS.phase;
  if (ph === 'aim') { if (!baitLeft(Q)) return; setPhase('charge'); PS.chargeT = PS.time; return; }
  if (ph === 'wait') { scare(); return; }
  if (ph === 'bite') { hook(); return; }
  if (ph === 'reel') PS.hold = true;
}
function psRelease() {
  if (!PS) return;
  if (PS.phase === 'charge') cast();
  else if (PS.phase === 'reel') PS.hold = false;
}
function meterVal() { const t = (PS.time - PS.chargeT) * 0.8; const k = t % 2; return k < 1 ? k : 2 - k; }
function zones(Q) { const z = rodOf(Q).zone; return { g0: PZ.weak - z, g1: PZ.red, gc: PZ.gold, gw: PZ.goldW + z * 0.35 }; }
function cast() {
  const Q = pesca(), rod = rodOf(Q), Z = zones(Q), p = meterVal(), bait = Q.bait;
  if (bait === 'verme') { Q.esche--; if (Q.esche === ESCHE_MAX - 1) Q.last = Date.now(); } else Q.baits[bait]--;
  Q.casts = (Q.casts || 0) + 1;
  let q, dist;
  if (p > Z.g1) { q = 'tangle'; dist = 0.12; }
  else if (p < Z.g0) { q = 'weak'; dist = 0.1 + p / Z.g0 * 0.3; }
  else { q = Math.abs(p - Z.gc) <= Z.gw ? 'perfect' : 'good'; dist = 0.5 + (p - Z.g0) / (Z.g1 - Z.g0) * 0.5 + (q === 'perfect' ? 0.15 : 0); }
  dist = Math.min(1, dist) * rod.power;
  if (q === 'perfect') Q.perfect = (Q.perfect || 0) + 1;
  save();
  const bonus = q === 'tangle' ? 0 : dist * 0.6 + (q === 'perfect' ? 0.6 : q === 'good' ? 0.25 : 0) + baitOf(Q).rare + rod.rare;
  PS.q = q; PS.dist = dist; PS.bonus = bonus; PS.bait = bait; PS.power = p;
  PS.fish = pickFish(PS.spot, bonus, bait, q === 'tangle');
  PS.kg = rollKg(PS.fish, bonus);
  const G = geo(), tip = rodTip(G);
  PS.castX = G.pier + 40 + dist * (G.W - G.pier - 84);
  PS.from = { x: tip.x, y: tip.y };
  PS.flyDur = 0.55 + dist * 0.45;
  PS.swing = 1; psSound('whoosh');
  setPhase('fly');
}
function landed() {
  const G = geo(), q = PS.q, m = Math.round(8 + PS.dist * 52);
  PS.bob = { x: PS.castX, y: surf(PS.castX, PS.time, G.wy) };
  PS.hookY = G.wy + 30 + PS.dist * (G.by - G.wy - 70);
  PS.sink = 0;
  splash(PS.castX, G.wy, 14); psSound('splash');
  toast(q === 'perfect' ? 'PERFETTO! ' + m + ' m' : q === 'good' ? 'Buon lancio · ' + m + ' m' : q === 'weak' ? 'Lancio debole · ' + m + ' m' : 'Parrucca! Filo aggrovigliato', q);
  if (q === 'perfect') { psSound('perfect'); buzz(30); }
  // il pesce arriva
  const f = PS.fish, waitT = Math.max(1.6, 2.2 + Math.random() * 4 - PS.bonus * 0.5);
  PS.biteAt = PS.time + waitT;
  PS.nibbles = []; const nn = Math.floor(Math.random() * 3);
  for (let i = 0; i < nn; i++) PS.nibbles.push(PS.time + 0.9 + Math.random() * (waitT - 1.2));
  const side = Math.random() < 0.5 ? -1 : 1;
  PS.shadow = { x0: PS.castX + side * (60 + Math.random() * 60), y0: PS.hookY + (Math.random() * 40 - 10), size: fishSize(f, PS.kg) };
  PS.decoys = Array.from({ length: 2 }, () => ({ x: Math.random() * 360, y: PS.hookY + (Math.random() * 60 - 30), v: (Math.random() < 0.5 ? -1 : 1) * (10 + Math.random() * 14), s: 0.5 + Math.random() * 0.4 }));
  setPhase('wait');
}
function fishSize(f, kg) { const k = (kg - f.kg[0]) / ((f.kg[1] - f.kg[0]) || 1); return f.len * (0.8 + k * 0.45) / 30; }
function scare() {
  const nib = PS.nibbles && PS.nibbles.some((t) => Math.abs(PS.time - t) < 0.5);
  miss(nib ? 'Era solo un assaggio! Hai tirato su l’amo vuoto.' : 'Troppo presto! Hai spaventato i pesci.');
}
function hook() {
  const k = (PS.time - PS.pt) / PS.biteWin, r = 50 * (1 - k) + 4, diff = Math.abs(r - 16);
  const f = PS.fish, rod = rodOf(pesca());
  PS.hq = diff <= 6 ? 'perfect' : diff <= 18 ? 'good' : 'weak';
  const w = 0.4 - f.pull * 0.16 + rod.zone;
  Object.assign(PS, { hooked: true, T: 0.3, L: PS.hq === 'perfect' ? 0.88 : PS.hq === 'weak' ? 1.04 : 1, S: PS.hq === 'perfect' ? 0.72 : PS.hq === 'weak' ? 1.1 : 1, zone: [0.56 - w / 2, 0.56 + w / 2], hold: false, slack: 0, run: 0, warn: 0, nextRun: 1.6 + Math.random() * 2, fx: PS.bob.x, fy: PS.hookY });
  toast(PS.hq === 'perfect' ? 'Ferrata perfetta!' : PS.hq === 'good' ? 'Ferrato!' : 'Ferrata debole…', PS.hq === 'perfect' ? 'perfect' : PS.hq === 'good' ? 'good' : 'weak');
  psSound('hook'); buzz(PS.hq === 'perfect' ? [30, 30, 30] : 40);
  splash(PS.bob.x, geo().wy, 8);
  setPhase('reel');
}
function miss(msg) {
  PS.msg = msg; fx('sad'); setPhase('miss'); PS.hold = false;
  setTimeout(() => { if (PS && PS.phase === 'miss') { const Q = pesca(); if (baitLeft(Q)) { const keep = { ambient: PS.ambient }; newSession(); Object.assign(PS, keep); setCtl(); } else { PS = null; renderPesca(); } } }, 1900);
}

/* ---------- logica per fotogramma ---------- */
function step(dt) {
  const G = geo(), ph = PS.phase, t = PS.time;
  // canna: molla verso l'angolo desiderato
  let target = -0.95;
  if (ph === 'charge') target = -1.72 - Math.sin(t * 9) * 0.02;
  else if (ph === 'reel') target = -0.8 - (PS.hold ? 0.18 : 0);
  if (PS.swing > 0) { PS.swing -= dt * 3.2; target = -0.45; }
  PS.rodV += ((target - PS.rodA) * 70 - PS.rodV * 11) * dt; PS.rodA += PS.rodV * dt;
  const wantBend = ph === 'reel' ? Math.min(1.2, PS.T) * 0.9 : ph === 'bite' ? 0.35 : 0;
  PS.bend += (wantBend - PS.bend) * Math.min(1, dt * 8);
  // particelle
  PS.parts = PS.parts.filter((p) => (p.life -= dt) > 0);
  for (const p of PS.parts) { p.vy += 260 * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
  PS.ripples = PS.ripples.filter((r) => (r.life -= dt) > 0);
  if (Math.random() < dt * 2.5) PS.bubbles.push({ x: Math.random() * 360, y: G.by, v: 12 + Math.random() * 18, r: 1 + Math.random() * 2 });
  PS.bubbles = PS.bubbles.filter((b) => (b.y -= b.v * dt) > G.wy + 4);
  for (const a of PS.ambient) { a.x += a.v * dt; if (a.x < -30) a.x = 390; if (a.x > 390) a.x = -30; }
  if (ph === 'fly') {
    const k = (t - PS.pt) / PS.flyDur;
    if (k >= 1) landed();
  } else if (ph === 'wait') {
    PS.sink = Math.min(1, PS.sink + dt * 1.4);
    if (PS.decoys) for (const d of PS.decoys) d.x += d.v * dt;
    for (const n of PS.nibbles) if (n <= t && n > t - dt) { psSound('tic'); PS.ripples.push({ x: PS.bob.x, y: G.wy, life: 0.8 }); }
    if (t >= PS.biteAt) {
      const f = PS.fish; PS.biteWin = f.r >= 5 ? 0.72 : f.r >= 4 ? 0.82 : f.r >= 3 ? 0.95 : 1.1;
      buzz([60, 40, 60]); fx('take'); splash(PS.bob.x, G.wy, 6);
      setPhase('bite');
    }
  } else if (ph === 'bite') {
    if (t - PS.pt > PS.biteWin) miss('Troppo tardi: si è mangiato l’esca ed è scappato!');
  } else if (ph === 'reel') reelStep(dt, G);
}
function reelStep(dt, G) {
  const f = PS.fish, rod = rodOf(pesca()), pull = f.pull;
  if (!f.junk) {
    if (PS.run > 0) { PS.run -= dt; if (PS.run <= 0) PS.nextRun = (2.2 + Math.random() * 3) / (0.5 + pull); }
    else if (PS.warn > 0) { PS.warn -= dt; if (PS.warn <= 0) { PS.run = 0.6 + pull * 1.1 + Math.random() * 0.5; buzz(80); } }
    else if (PS.S > 0.08) { PS.nextRun -= dt; if (PS.nextRun <= 0) { PS.warn = 0.5; toast('Scappa! Molla il filo!', 'warn'); } }
  }
  const tired = 0.4 + 0.6 * Math.max(0, Math.min(1, PS.S));
  const force = (PS.run > 0 ? pull * 1.25 : pull * 0.22 * (0.6 + 0.4 * Math.sin(PS.time * 3.1))) * tired;
  if (PS.hold) PS.T += ((0.7 + force * 1.3) / rod.snap) * dt; else PS.T -= (0.85 - force * 0.6) * dt;
  PS.T = Math.max(0, Math.min(1.05, PS.T));
  const inZ = PS.T >= PS.zone[0] && PS.T <= PS.zone[1];
  if (inZ) { PS.L -= (0.17 - pull * 0.075) * (1 + (1 - Math.max(0, PS.S)) * 0.9) * dt; PS.S = Math.max(0, PS.S - (0.1 + 0.05 * (1 - pull)) * dt); }
  else if (PS.T > PS.zone[1]) PS.L -= 0.07 * dt;
  else PS.L += (PS.run > 0 ? 0.13 * pull : 0.015) * dt;
  if (PS.run > 0 && PS.hold) PS.L += 0.04 * dt;
  if (PS.T < 0.06 && PS.run <= 0) PS.slack += dt; else PS.slack = 0;
  // posizione del pesce
  const depth = PS.hookY - G.wy, k = clamp01(PS.L);
  const tx = G.pier + 18 + k * (PS.castX - G.pier - 18) + (PS.run > 0 ? Math.sin(PS.time * 11) * 10 : Math.sin(PS.time * 2.2) * 5);
  const ty = G.wy + 14 + depth * (0.25 + 0.75 * k) + Math.sin(PS.time * 1.7) * 6;
  PS.fx += (tx - PS.fx) * Math.min(1, dt * 4); PS.fy += (ty - PS.fy) * Math.min(1, dt * 4);
  if (Math.random() < dt * (PS.run > 0 ? 18 : 4)) PS.bubbles.push({ x: PS.fx, y: PS.fy, v: 25, r: 1.5 });
  if (PS.T >= 1) { psSound('snap'); buzz(200); return miss('Hai tirato troppo: il filo si è spezzato!'); }
  if (PS.slack > 1.8) return miss('Filo troppo lento: ' + (f.junk ? 'la scarpa è tornata a fondo!' : 'il pesce si è sganciato!'));
  if (PS.L > 1.2) return miss('Si è portato via tutto il filo!');
  if (PS.L <= 0) caught();
}
function splash(x, y, n) {
  for (let i = 0; i < n; i++) PS.parts.push({ x, y, vx: (Math.random() - 0.5) * 120, vy: -60 - Math.random() * 110, life: 0.5 + Math.random() * 0.4, r: 1.5 + Math.random() * 2 });
  PS.ripples.push({ x, y, life: 1.2 }, { x, y, life: 0.9 });
}

/* ---------- disegno ---------- */
const SKY = { tropea: ['#4FA9E3', '#A6DBF3', '#FCEBC8'], scilla: ['#5AA3DC', '#B0DAEE', '#F7E2C3'], stretto: ['#4C8CC8', '#A4CAE6', '#F2E2CC'], vaticano: ['#3F86C4', '#9FCBEA', '#FBE3BE'] };
const PFONT = 'Alegreya, "Palatino Linotype", Georgia, serif';
const rrect = (x, a, b, w, h, r) => { x.beginPath(); if (x.roundRect) x.roundRect(a, b, w, h, r); else x.rect(a, b, w, h); };
function pcCloud(x, cx, cy, k) {
  x.fillStyle = 'rgba(255,255,255,0.96)';
  x.beginPath(); x.arc(cx, cy, 8 * k, 0, 7); x.arc(cx + 10 * k, cy - 6 * k, 11 * k, 0, 7); x.arc(cx + 23 * k, cy - 2 * k, 9 * k, 0, 7); x.arc(cx + 33 * k, cy + 2 * k, 6 * k, 0, 7); x.rect(cx, cy, 33 * k, 8 * k); x.fill();
  x.fillStyle = 'rgba(150,185,215,0.35)'; x.beginPath(); x.ellipse(cx + 16 * k, cy + 7 * k, 19 * k, 3 * k, 0, 0, 7); x.fill();
}
function drawSky(x, G, t) {
  const { W, wy } = G, c = SKY[PS.spot] || SKY.tropea;
  const sk = x.createLinearGradient(0, 0, 0, wy); sk.addColorStop(0, c[0]); sk.addColorStop(0.62, c[1]); sk.addColorStop(1, c[2]);
  x.fillStyle = sk; x.fillRect(0, 0, W, wy + 6);
  const sg = x.createRadialGradient(298, 34, 4, 298, 34, 80); sg.addColorStop(0, 'rgba(255,244,190,0.95)'); sg.addColorStop(0.22, 'rgba(255,232,150,0.5)'); sg.addColorStop(1, 'rgba(255,232,150,0)');
  x.fillStyle = sg; x.fillRect(210, 0, 160, 120);
  x.fillStyle = '#FFE47A'; x.beginPath(); x.arc(298, 34, 13, 0, 7); x.fill();
  for (let i = 0; i < 4; i++) { const cx = ((i * 115 + t * (2.5 + i * 1.3)) % (W + 140)) - 80; pcCloud(x, cx, 22 + (i % 2) * 20 + i * 2, 0.75 + (i % 3) * 0.22); }
  // colline lontane nella foschia
  const hz = PS.spot === 'stretto' || PS.spot === 'vaticano' ? ['rgba(118,138,172,0.5)', 'rgba(96,120,150,0.55)'] : ['rgba(120,160,150,0.38)', 'rgba(92,138,118,0.45)'];
  [[18, 0.018, 0], [9, 0.04, 2]].forEach(([hh, fq, ph], j) => {
    x.fillStyle = hz[j]; x.beginPath(); x.moveTo(0, wy);
    for (let i = 0; i <= W; i += 12) x.lineTo(i, wy - hh - 9 * Math.sin(i * fq + ph) - 4 * Math.sin(i * fq * 3.1 + ph));
    x.lineTo(W, wy); x.closePath(); x.fill();
  });
  for (let k = 0; k < 2; k++) {
    const gx = ((t * (20 + k * 7) + k * 170) % (W + 200)) - 100, gy = 50 + k * 13 + Math.sin(t * 0.7 + k) * 8, fl = Math.sin(t * 8 + k * 2) * 3;
    x.strokeStyle = '#2A2A2A'; x.lineWidth = 1.5; x.lineCap = 'round'; x.beginPath(); x.moveTo(gx - 7, gy - fl); x.quadraticCurveTo(gx - 3, gy - 4, gx, gy); x.quadraticCurveTo(gx + 3, gy - 4, gx + 7, gy - fl); x.stroke();
  }
}
function drawLand(x, G) {
  const { wy } = G, t = PS.time; x.lineJoin = 'round'; x.lineWidth = 1.4; x.strokeStyle = '#1A1A1A';
  if (PS.spot === 'tropea') {
    // lo scoglio di Santa Maria dell'Isola
    const rk = x.createLinearGradient(0, wy - 72, 0, wy); rk.addColorStop(0, '#E2C08A'); rk.addColorStop(1, '#B98E58');
    x.fillStyle = rk; x.beginPath(); x.moveTo(222, wy); x.lineTo(232, wy - 34); x.quadraticCurveTo(236, wy - 62, 252, wy - 66); x.lineTo(306, wy - 68); x.quadraticCurveTo(324, wy - 60, 326, wy - 30); x.lineTo(338, wy); x.closePath(); x.fill(); x.stroke();
    x.strokeStyle = 'rgba(90,60,30,0.35)'; x.lineWidth = 1; for (let i = 0; i < 7; i++) { const sx = 240 + i * 12; x.beginPath(); x.moveTo(sx, wy - 58 + (i % 2) * 6); x.lineTo(sx - 3, wy - 10); x.stroke(); }
    x.fillStyle = '#5E9A48'; x.strokeStyle = '#1A1A1A'; x.lineWidth = 1.2;
    x.beginPath(); x.moveTo(248, wy - 64); for (let i = 0; i <= 6; i++) x.quadraticCurveTo(252 + i * 9, wy - 74 - (i % 2) * 4, 256 + i * 9, wy - 66); x.lineTo(310, wy - 66); x.closePath(); x.fill(); x.stroke();
    // il santuario
    x.fillStyle = '#FBF7EC'; x.fillRect(262, wy - 90, 30, 22); x.strokeRect(262, wy - 90, 30, 22);
    x.beginPath(); x.moveTo(259, wy - 90); x.lineTo(277, wy - 101); x.lineTo(295, wy - 90); x.closePath(); x.fillStyle = '#E3D9C4'; x.fill(); x.stroke();
    x.fillStyle = '#FBF7EC'; x.fillRect(292, wy - 104, 10, 36); x.strokeRect(292, wy - 104, 10, 36);
    x.fillStyle = '#C8562E'; x.beginPath(); x.arc(297, wy - 104, 5, Math.PI, 0); x.fill(); x.stroke();
    x.fillStyle = '#3A2A1A'; x.beginPath(); x.arc(277, wy - 74, 3.5, Math.PI, 0); x.rect(273.5, wy - 74, 7, 6); x.fill();
    x.beginPath(); x.arc(297, wy - 96, 2, 0, 7); x.fill();
    x.strokeStyle = '#8A6A40'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(250, wy - 2); x.lineTo(262, wy - 22); x.lineTo(252, wy - 40); x.lineTo(264, wy - 62); x.stroke();
  } else if (PS.spot === 'scilla') {
    // il promontorio con il castello Ruffo e le case di Chianalea
    const rk = x.createLinearGradient(0, wy - 70, 0, wy); rk.addColorStop(0, '#A8977A'); rk.addColorStop(1, '#776A55');
    x.fillStyle = rk; x.beginPath(); x.moveTo(196, wy); x.quadraticCurveTo(212, wy - 50, 248, wy - 60); x.lineTo(318, wy - 62); x.quadraticCurveTo(350, wy - 50, 362, wy - 30); x.lineTo(362, wy); x.closePath(); x.fill(); x.stroke();
    x.fillStyle = '#E2D2AE';
    x.fillRect(244, wy - 88, 66, 28); x.strokeRect(244, wy - 88, 66, 28);
    for (let i = 0; i < 7; i++) { x.fillRect(244 + i * 10, wy - 93, 6, 5); x.strokeRect(244 + i * 10, wy - 93, 6, 5); }
    x.fillRect(298, wy - 106, 18, 46); x.strokeRect(298, wy - 106, 18, 46);
    for (let i = 0; i < 3; i++) { x.fillRect(298 + i * 6.5, wy - 111, 4.5, 5); x.strokeRect(298 + i * 6.5, wy - 111, 4.5, 5); }
    x.fillStyle = '#3A2E22'; for (let i = 0; i < 4; i++) x.fillRect(252 + i * 12, wy - 80, 4, 7); x.fillRect(304, wy - 96, 5, 8);
    const hc = ['#F2D7A6', '#E8A88A', '#F6F1E4', '#D9C27A', '#E9B9A0'];
    for (let i = 0; i < 9; i++) { const hx = 198 + i * 14, hh = 12 + (i % 3) * 4; x.fillStyle = hc[i % 5]; x.fillRect(hx, wy - hh, 13, hh); x.strokeRect(hx, wy - hh, 13, hh); x.fillStyle = '#2E5C8A'; x.fillRect(hx + 4, wy - hh + 3, 4, 4); }
  } else if (PS.spot === 'vaticano') {
    // Stromboli all'orizzonte che fuma
    x.fillStyle = 'rgba(120,132,160,0.75)'; x.beginPath(); x.moveTo(128, wy); x.lineTo(162, wy - 24); x.lineTo(169, wy - 24); x.lineTo(204, wy); x.closePath(); x.fill();
    x.fillStyle = 'rgba(235,235,240,0.6)'; for (let i = 0; i < 5; i++) { x.beginPath(); x.arc(167 + i * 6 + Math.sin(t * 0.4 + i) * 2, wy - 29 - i * 6, 2.5 + i * 1.4, 0, 7); x.fill(); }
    // il capo con la scogliera di granito e il faro
    const rk = x.createLinearGradient(0, wy - 64, 0, wy); rk.addColorStop(0, '#C9B9A0'); rk.addColorStop(1, '#8F7F68');
    x.fillStyle = rk; x.beginPath(); x.moveTo(210, wy); x.quadraticCurveTo(232, wy - 40, 262, wy - 54); x.lineTo(330, wy - 60); x.quadraticCurveTo(356, wy - 56, 364, wy - 44); x.lineTo(364, wy); x.closePath(); x.fill(); x.stroke();
    x.strokeStyle = 'rgba(70,55,40,0.35)'; x.lineWidth = 1; for (let i = 0; i < 6; i++) { const sx = 236 + i * 20; x.beginPath(); x.moveTo(sx, wy - 46 + (i % 2) * 5); x.lineTo(sx - 6, wy - 6); x.stroke(); }
    x.fillStyle = '#6F9A52'; x.strokeStyle = '#1A1A1A'; x.lineWidth = 1.2;
    x.beginPath(); x.moveTo(258, wy - 53); for (let i = 0; i <= 8; i++) x.quadraticCurveTo(262 + i * 10, wy - 64 - (i % 2) * 4, 266 + i * 10, wy - 56); x.lineTo(350, wy - 55); x.closePath(); x.fill(); x.stroke();
    // casetta del guardiano e faro bianco
    x.fillStyle = '#F6F1E4'; x.fillRect(282, wy - 74, 26, 16); x.strokeRect(282, wy - 74, 26, 16);
    x.fillStyle = '#C8562E'; x.beginPath(); x.moveTo(279, wy - 74); x.lineTo(295, wy - 82); x.lineTo(311, wy - 74); x.closePath(); x.fill(); x.stroke();
    x.fillStyle = '#FBF8EE'; x.beginPath(); x.moveTo(314, wy - 58); x.lineTo(317, wy - 98); x.lineTo(327, wy - 98); x.lineTo(330, wy - 58); x.closePath(); x.fill(); x.stroke();
    x.fillStyle = '#3A3A3A'; x.fillRect(315, wy - 104, 14, 6); x.strokeRect(315, wy - 104, 14, 6);
    const lg = 0.55 + 0.45 * Math.sin(t * 2); x.fillStyle = 'rgba(255,226,120,' + lg + ')'; x.fillRect(317, wy - 103, 10, 4);
    x.fillStyle = '#B83A2A'; x.beginPath(); x.moveTo(314, wy - 104); x.lineTo(322, wy - 111); x.lineTo(330, wy - 104); x.closePath(); x.fill(); x.stroke();
    x.fillStyle = '#2E5C8A'; x.fillRect(288, wy - 70, 4, 5); x.fillRect(298, wy - 70, 4, 5);
  } else {
    // la costa siciliana, l'Etna e una feluca
    x.fillStyle = 'rgba(214,228,240,0.9)'; x.beginPath(); x.moveTo(250, wy - 18); x.lineTo(310, wy - 66); x.lineTo(320, wy - 64); x.lineTo(372, wy - 20); x.closePath(); x.fill();
    x.fillStyle = 'rgba(255,255,255,0.95)'; x.beginPath(); x.moveTo(298, wy - 56); x.lineTo(310, wy - 66); x.lineTo(320, wy - 64); x.lineTo(332, wy - 54); x.quadraticCurveTo(315, wy - 50, 298, wy - 56); x.fill();
    x.fillStyle = 'rgba(240,240,240,0.55)'; for (let i = 0; i < 4; i++) { x.beginPath(); x.arc(316 + i * 9 + Math.sin(t * 0.5 + i) * 2, wy - 72 - i * 8, 5 + i * 2, 0, 7); x.fill(); }
    x.fillStyle = '#8FA39A'; x.beginPath(); x.moveTo(140, wy); x.lineTo(176, wy - 18); x.lineTo(214, wy - 30); x.lineTo(250, wy - 20); x.lineTo(290, wy - 26); x.lineTo(362, wy - 10); x.lineTo(362, wy); x.closePath(); x.fill(); x.stroke();
    x.fillStyle = '#F6F2E6'; for (let i = 0; i < 12; i++) { x.fillRect(190 + i * 9, wy - 10 - (i % 3) * 3, 5, 5); }
    const fxp = 118 + Math.sin(t * 0.2) * 16, fy = wy - 2;
    x.fillStyle = '#2F4F6E'; x.beginPath(); x.moveTo(fxp - 18, fy); x.lineTo(fxp + 16, fy); x.lineTo(fxp + 10, fy + 5); x.lineTo(fxp - 14, fy + 5); x.closePath(); x.fill(); x.stroke();
    x.strokeStyle = '#3A3A3A'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(fxp, fy); x.lineTo(fxp, fy - 34); x.moveTo(fxp - 5, fy - 30); x.lineTo(fxp + 5, fy - 30); x.moveTo(fxp + 16, fy - 1); x.lineTo(fxp + 44, fy - 4); x.stroke();
  }
}
function drawSea(x, G, t) {
  const { W, H, wy, by } = G;
  const sea = x.createLinearGradient(0, wy, 0, H); sea.addColorStop(0, '#5CC6EA'); sea.addColorStop(0.1, '#35A3D5'); sea.addColorStop(0.55, '#196895'); sea.addColorStop(1, '#0A3758');
  x.fillStyle = sea; x.beginPath(); x.moveTo(0, H);
  for (let i = 0; i <= W; i += 5) x.lineTo(i, surf(i, t, wy));
  x.lineTo(W, H); x.closePath(); x.fill();
  // luce che entra dall'alto
  x.save(); x.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 5; i++) {
    const rx = 30 + i * 78 + Math.sin(t * 0.35 + i * 1.7) * 18, g = x.createLinearGradient(0, wy, 0, by);
    g.addColorStop(0, 'rgba(180,235,255,0.11)'); g.addColorStop(1, 'rgba(180,235,255,0)');
    x.fillStyle = g; x.beginPath(); x.moveTo(rx, wy); x.lineTo(rx + 22, wy); x.lineTo(rx + 52, by); x.lineTo(rx + 10, by); x.closePath(); x.fill();
  }
  x.strokeStyle = 'rgba(200,245,255,0.16)'; x.lineWidth = 1.3;
  for (let r = 0; r < 3; r++) { const yy = wy + 14 + r * 13; x.beginPath(); for (let i = 0; i <= W; i += 8) { const v = yy + 2.5 * Math.sin(i * 0.09 + t * (1.2 + r * 0.3) + r * 2) ; i ? x.lineTo(i, v) : x.moveTo(i, v); } x.stroke(); }
  x.restore();
  // fondale
  const sd = x.createLinearGradient(0, by - 10, 0, H); sd.addColorStop(0, PS.spot === 'tropea' ? '#EBD6A2' : '#C9B58C'); sd.addColorStop(1, PS.spot === 'tropea' ? '#C9A86C' : '#9C875E');
  x.fillStyle = sd; x.beginPath(); x.moveTo(0, H);
  for (let i = 0; i <= W; i += 10) x.lineTo(i, by + Math.sin(i * 0.03) * 5 + Math.sin(i * 0.11) * 2);
  x.lineTo(W, H); x.closePath(); x.fill();
  x.fillStyle = 'rgba(120,90,50,0.25)'; for (let i = 0; i < 14; i++) { x.beginPath(); x.ellipse(20 + i * 25 + (i % 3) * 5, by + 8 + (i % 4) * 3, 2 + (i % 2), 1.3, 0, 0, 7); x.fill(); }
  // scogli con i ricci di mare
  const rocks = PS.spot === 'tropea' ? [[236, 9], [300, 14], [160, 6]] : [[110, 12], [236, 16], [306, 20], [170, 8]];
  for (const [rx, rr] of rocks) {
    const g = x.createLinearGradient(0, by - rr, 0, by + 2); g.addColorStop(0, '#8A867C'); g.addColorStop(1, '#55524A');
    x.fillStyle = g; x.strokeStyle = '#2E2C26'; x.lineWidth = 1.2; x.beginPath(); x.ellipse(rx, by + 2, rr * 1.5, rr, 0, Math.PI, 0); x.closePath(); x.fill(); x.stroke();
    if (rr > 10) { x.strokeStyle = '#2A1630'; x.lineWidth = 0.9; const ux = rx - rr * 0.4, uy = by - rr * 0.55; for (let a = 0; a < 12; a++) { const an = a / 12 * Math.PI * 2; x.beginPath(); x.moveTo(ux, uy); x.lineTo(ux + Math.cos(an) * 4.5, uy + Math.sin(an) * 4.5); x.stroke(); } x.fillStyle = '#3A1E42'; x.beginPath(); x.arc(ux, uy, 2.6, 0, 7); x.fill(); }
  }
  // posidonia
  x.lineCap = 'round';
  for (let i = 0; i < 11; i++) {
    const sx = 70 + i * 27 + (i % 3) * 6, hgt = 22 + (i % 4) * 9, sw = Math.sin(t * 1.2 + i) * 6;
    x.strokeStyle = i % 2 ? '#3C8A45' : '#58A852'; x.lineWidth = 3.2;
    x.beginPath(); x.moveTo(sx, by + 3); x.quadraticCurveTo(sx + sw * 0.6, by - hgt / 2, sx + sw, by - hgt); x.stroke();
    x.lineWidth = 2.2; x.beginPath(); x.moveTo(sx + 4, by + 3); x.quadraticCurveTo(sx + 4 + sw * 0.4, by - hgt * 0.35, sx + 6 + sw * 0.8, by - hgt * 0.7); x.stroke();
  }
  // stella marina e conchiglia
  const star = (sx, sy, r, col) => { x.fillStyle = col; x.strokeStyle = '#7A2E14'; x.lineWidth = 1; x.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rad = k % 2 ? r * 0.42 : r; x.lineTo(sx + Math.cos(a) * rad, sy + Math.sin(a) * rad); } x.closePath(); x.fill(); x.stroke(); };
  star(196, by + 8, 6, '#F08A3C'); if (PS.spot !== 'tropea') star(60, by + 10, 5, '#E8604A');
  x.fillStyle = '#F6E3D0'; x.strokeStyle = '#9A7A5A'; x.lineWidth = 0.9; x.beginPath(); x.moveTo(272, by + 12); x.arc(272, by + 12, 5, Math.PI, 0); x.closePath(); x.fill(); x.stroke();
  for (let k = -3; k <= 3; k++) { x.beginPath(); x.moveTo(272, by + 12); x.lineTo(272 + k * 1.5, by + 7.5); x.stroke(); }
}
function drawSurface(x, G, t) {
  const { W, wy } = G;
  x.strokeStyle = 'rgba(255,255,255,0.75)'; x.lineWidth = 1.6; x.beginPath();
  for (let i = 0; i <= W; i += 5) { const v = surf(i, t, wy); i ? x.lineTo(i, v) : x.moveTo(i, v); } x.stroke();
  x.strokeStyle = 'rgba(255,255,255,0.45)'; x.lineWidth = 1.2;
  for (let i = 0; i < 8; i++) { const sx = ((i * 53 + t * 9) % (W + 40)) - 20, sy = surf(sx, t, wy) + 5 + (i % 3) * 5; x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx + 9 + (i % 2) * 5, sy); x.stroke(); }
  for (let i = 0; i < 9; i++) { const sx = 90 + i * 31, a = Math.max(0, Math.sin(t * 2.2 + i * 1.9)); if (a < 0.6) continue; const sy = surf(sx, t, wy) - 1, r = (a - 0.6) * 9; x.fillStyle = 'rgba(255,255,240,' + (a - 0.4) + ')'; x.beginPath(); x.moveTo(sx, sy - r); x.lineTo(sx + r * 0.3, sy); x.lineTo(sx, sy + r); x.lineTo(sx - r * 0.3, sy); x.closePath(); x.fill(); x.beginPath(); x.moveTo(sx - r, sy); x.lineTo(sx, sy + r * 0.3); x.lineTo(sx + r, sy); x.lineTo(sx, sy - r * 0.3); x.closePath(); x.fill(); }
}
function drawFore(x, G) {
  const { wy, by, base } = G; x.lineWidth = 1.6; x.strokeStyle = '#1A1A1A'; x.lineJoin = 'round';
  if (PS.spot === 'tropea') {
    for (const px of [10, 46]) { const g = x.createLinearGradient(px, 0, px + 8, 0); g.addColorStop(0, '#7A5434'); g.addColorStop(1, '#4E331E'); x.fillStyle = g; x.fillRect(px, base.y + 10, 8, by - base.y); x.strokeRect(px, base.y + 10, 8, by - base.y); x.fillStyle = 'rgba(60,120,70,0.5)'; x.fillRect(px, wy + 4, 8, 10); }
    const pl = x.createLinearGradient(0, base.y + 3, 0, base.y + 14); pl.addColorStop(0, '#A87A4E'); pl.addColorStop(1, '#7A5434');
    x.fillStyle = pl; x.fillRect(-4, base.y + 3, 72, 10); x.strokeRect(-4, base.y + 3, 72, 10);
    x.strokeStyle = '#5A3A20'; x.lineWidth = 1; for (let i = 6; i < 68; i += 10) { x.beginPath(); x.moveTo(i, base.y + 3); x.lineTo(i, base.y + 13); x.stroke(); }
  } else if (PS.spot === 'scilla') {
    const g = x.createLinearGradient(0, base.y, 70, by); g.addColorStop(0, '#9A8F7E'); g.addColorStop(1, '#5E574C');
    x.fillStyle = g;
    x.beginPath(); x.moveTo(-4, by + 30); x.lineTo(-4, base.y + 2); x.quadraticCurveTo(20, base.y - 6, 54, base.y + 6); x.quadraticCurveTo(72, wy + 20, 64, by - 10); x.quadraticCurveTo(50, by + 10, 40, by + 30); x.closePath(); x.fill(); x.stroke();
    x.strokeStyle = 'rgba(0,0,0,0.25)'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(14, base.y + 20); x.lineTo(30, base.y + 50); x.moveTo(44, wy + 30); x.lineTo(36, wy + 70); x.stroke();
    x.fillStyle = 'rgba(70,130,80,0.55)'; x.beginPath(); x.ellipse(50, wy + 8, 12, 4, 0.4, 0, 7); x.fill();
  } else {
    const g = x.createLinearGradient(0, base.y + 6, 0, wy + 30); g.addColorStop(0, '#3E6A8E'); g.addColorStop(1, '#264A66');
    x.fillStyle = g; x.beginPath(); x.moveTo(-6, base.y + 6); x.lineTo(80, base.y + 6); x.quadraticCurveTo(78, wy + 22, 56, wy + 30); x.lineTo(-6, wy + 30); x.closePath(); x.fill(); x.stroke();
    x.fillStyle = '#F2EEE2'; x.fillRect(-6, base.y + 6, 86, 5); x.fillStyle = '#C0392B'; x.fillRect(-6, base.y + 14, 84, 3);
  }
  // il pescatore, con la coppola e la maglia a righe
  const fx0 = base.x - 18, fy0 = base.y + 4;
  x.save(); x.translate(fx0, fy0); x.scale(1.25, 1.25);
  x.lineWidth = 1.2; x.strokeStyle = '#1A1A1A';
  x.fillStyle = '#2E3E58'; rrect(x, -6, -19, 5, 19, 2); x.fill(); x.stroke(); rrect(x, 1, -19, 5, 19, 2); x.fill(); x.stroke();
  x.fillStyle = '#3A2A1E'; rrect(x, -7, -3, 7, 4, 1.5); x.fill(); rrect(x, 0, -3, 7, 4, 1.5); x.fill();
  x.fillStyle = '#F6F2E6'; rrect(x, -8, -40, 16, 23, 5); x.fill(); x.stroke();
  x.save(); rrect(x, -8, -40, 16, 23, 5); x.clip(); x.fillStyle = '#2E5C8A'; for (let i = 0; i < 5; i++) x.fillRect(-8, -37 + i * 4.6, 16, 2); x.restore();
  x.fillStyle = '#E8B48A'; x.beginPath(); x.arc(0, -47, 7, 0, 7); x.fill(); x.stroke();
  x.fillStyle = '#6E6A66'; x.beginPath(); x.arc(-1, -45, 6, 0.2, Math.PI - 0.2); x.fill();
  x.fillStyle = '#E8B48A'; x.beginPath(); x.arc(0, -47.5, 5.6, Math.PI + 0.3, -0.3); x.fill();
  x.fillStyle = '#4E4234'; x.beginPath(); x.moveTo(-8, -50); x.quadraticCurveTo(0, -58, 8, -51); x.lineTo(12, -50); x.lineTo(-8, -49); x.closePath(); x.fill(); x.stroke();
  x.fillStyle = '#1A1A1A'; x.beginPath(); x.arc(3, -47.5, 1, 0, 7); x.fill();
  x.restore();
  x.strokeStyle = '#E8B48A'; x.lineWidth = 4; x.lineCap = 'round'; x.beginPath(); x.moveTo(fx0 + 6, fy0 - 42); x.lineTo(base.x + 6, base.y - 6); x.stroke();
  // il secchio
  if (PS.spot !== 'scilla') { const sx = fx0 - 16, sy = fy0; x.fillStyle = '#9AA3A8'; x.strokeStyle = '#1A1A1A'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(sx - 6, sy - 12); x.lineTo(sx + 6, sy - 12); x.lineTo(sx + 5, sy); x.lineTo(sx - 5, sy); x.closePath(); x.fill(); x.stroke(); x.beginPath(); x.arc(sx, sy - 12, 6, Math.PI, 0); x.stroke(); }
}
function draw() {
  const c = $('pcv'); if (!c) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1), cw = c.clientWidth, ch = c.clientHeight;
  if (!cw || !ch) return;
  if (c.width !== Math.round(cw * dpr) || c.height !== Math.round(ch * dpr)) { c.width = Math.round(cw * dpr); c.height = Math.round(ch * dpr); }
  const x = c.getContext('2d'), s = cw / 360 * dpr, G = geo(), t = PS.time, { W, H, wy, by } = G;
  x.setTransform(s, 0, 0, s, 0, 0);
  drawSky(x, G, t);
  drawLand(x, G);
  drawSea(x, G, t);
  // pesci di passaggio: un banco di alici e qualche pesce colorato
  for (const a of PS.ambient) {
    const f = FISH[a.sp || 0], yy = wy + 22 + a.d * (by - wy - 46);
    x.globalAlpha = 0.85;
    if (a.school) { for (let k = 0; k < 6; k++) drawFishShape(x, f, a.x + (k % 3) * 9 * (a.v > 0 ? -1 : 1), yy + Math.floor(k / 3) * 6 + (k % 2) * 3, a.s * 0.55, a.v > 0 ? 1 : -1, t * 10 + a.ph + k, false); }
    else drawFishShape(x, f, a.x, yy, a.s, a.v > 0 ? 1 : -1, t * 9 + a.ph, false);
  }
  x.globalAlpha = 1;
  x.strokeStyle = 'rgba(255,255,255,0.6)'; x.lineWidth = 1;
  for (const b of PS.bubbles) { x.beginPath(); x.arc(b.x + Math.sin(b.y * 0.1) * 2, b.y, b.r, 0, 7); x.stroke(); }
  drawSurface(x, G, t);
  drawFore(x, G);
  drawAction(x, G);
  drawRod(x, G);
  // schizzi e cerchi
  x.fillStyle = 'rgba(235,248,255,0.95)';
  for (const p of PS.parts) { x.beginPath(); x.arc(p.x, p.y, p.r, 0, 7); x.fill(); }
  for (const r of PS.ripples) { const k = 1 - r.life / 1.2; x.strokeStyle = 'rgba(255,255,255,' + (r.life * 0.6) + ')'; x.lineWidth = 1.4; x.beginPath(); x.ellipse(r.x, r.y + 1, 6 + k * 30, 2 + k * 6, 0, 0, 7); x.stroke(); }
  drawHud(x, G);
}
function drawRod(x, G) {
  const b = G.base, tip = rodTip(G), a0 = PS.rodA;
  const mid = { x: b.x + Math.cos(a0) * 80, y: b.y + Math.sin(a0) * 80 };
  x.lineCap = 'round';
  x.strokeStyle = '#1A1A1A'; x.lineWidth = 5.2; x.beginPath(); x.moveTo(b.x, b.y); x.quadraticCurveTo(mid.x, mid.y, tip.x, tip.y); x.stroke();
  x.strokeStyle = pesca().rod === 'bambu' ? '#C9A45A' : pesca().rod === 'vetro' ? '#2F6FA0' : '#B23A2E'; x.lineWidth = 3; x.beginPath(); x.moveTo(b.x, b.y); x.quadraticCurveTo(mid.x, mid.y, tip.x, tip.y); x.stroke();
  // mulinello
  const rx = b.x + Math.cos(a0) * 16, ry = b.y + Math.sin(a0) * 16 + 7;
  x.fillStyle = '#9AA3A8'; x.strokeStyle = '#1A1A1A'; x.lineWidth = 1.4; x.beginPath(); x.arc(rx, ry, 6, 0, 7); x.fill(); x.stroke();
  const sp = PS.phase === 'reel' && PS.hold ? PS.time * 20 : 0;
  x.beginPath(); x.moveTo(rx, ry); x.lineTo(rx + Math.cos(sp) * 6, ry + Math.sin(sp) * 6); x.stroke();
  // filo
  const ph = PS.phase; x.strokeStyle = 'rgba(255,255,255,0.9)'; x.lineWidth = 1;
  if (ph === 'fly') {
    const k = clamp01((PS.time - PS.pt) / PS.flyDur), lx = PS.from.x + (PS.castX - PS.from.x) * k, ly = PS.from.y + (G.wy - PS.from.y) * k - Math.sin(Math.PI * k) * (40 + PS.dist * 90);
    x.beginPath(); x.moveTo(tip.x, tip.y); x.quadraticCurveTo((tip.x + lx) / 2, Math.min(tip.y, ly) - 10, lx, ly); x.stroke();
    drawBobber(x, lx, ly, 0);
  } else if (ph === 'wait' || ph === 'bite' || (ph === 'miss' && PS.bob && !PS.hooked)) {
    const bob = PS.bob; x.beginPath(); x.moveTo(tip.x, tip.y); x.quadraticCurveTo((tip.x + bob.x) / 2, bob.y - 6, bob.x, bob.y - 4); x.stroke();
  } else if (ph === 'reel' || (ph === 'miss' && PS.hooked)) {
    if (ph === 'reel') { const sag = (1 - Math.min(1, PS.T)) * 50; x.strokeStyle = PS.T > PS.zone[1] ? 'rgba(255,190,170,0.95)' : 'rgba(255,255,255,0.9)'; x.beginPath(); x.moveTo(tip.x, tip.y); x.quadraticCurveTo((tip.x + PS.fx) / 2, Math.max(tip.y, PS.fy) - 20 + sag, PS.fx, PS.fy); x.stroke(); }
  }
}
function drawBobber(x, bx, by, dip) {
  x.save(); x.translate(bx, by + dip); x.strokeStyle = '#1A1A1A'; x.lineWidth = 1.2;
  x.fillStyle = '#E8473A'; x.beginPath(); x.ellipse(0, -3, 4.5, 5.5, 0, Math.PI, 0); x.fill(); x.stroke();
  x.fillStyle = '#FFFFFF'; x.beginPath(); x.ellipse(0, -3, 4.5, 5.5, 0, 0, Math.PI); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(0, -8.5); x.lineTo(0, -13); x.stroke(); x.restore();
}
function drawAction(x, G) {
  const ph = PS.phase, t = PS.time;
  if (ph === 'wait' || ph === 'bite' || (ph === 'miss' && PS.bob && !PS.hooked)) {
    const bob = PS.bob; bob.y = surf(bob.x, t, G.wy);
    // amo e filo sott'acqua
    const hy = G.wy + (PS.hookY - G.wy) * (PS.sink || 0);
    x.strokeStyle = 'rgba(255,255,255,0.45)'; x.lineWidth = 0.8; x.beginPath(); x.moveTo(bob.x, bob.y); x.lineTo(bob.x, hy); x.stroke();
    x.font = '11px serif'; x.textAlign = 'center'; x.fillText(BAITS.find((b) => b.id === PS.bait).e, bob.x, hy + 5);
    // ombre dei pesci
    if (ph !== 'miss') {
      for (const d of PS.decoys || []) { x.globalAlpha = 0.28; drawFishShape(x, FISH[1], d.x, d.y, d.s, d.v > 0 ? 1 : -1, t * 8, true, '#0A2234'); }
      const sh = PS.shadow, k = ph === 'bite' ? 1 : clamp01((t - PS.pt) / Math.max(0.1, PS.biteAt - PS.pt));
      const e = 1 - Math.pow(1 - k, 2), sx = sh.x0 + (bob.x - sh.x0) * e, sy = sh.y0 + (PS.hookY - sh.y0) * e;
      x.globalAlpha = 0.25 + 0.2 * k; drawFishShape(x, PS.fish, sx + (sh.x0 < bob.x ? -12 : 12) * sh.size, sy, sh.size, sh.x0 < bob.x ? 1 : -1, t * 6, true, '#0A2234'); x.globalAlpha = 1;
    }
    let dip = Math.sin(t * 2.4) * 1.2;
    if (ph === 'wait') for (const n of PS.nibbles) if (t > n && t < n + 0.35) dip += Math.sin((t - n) / 0.35 * Math.PI) * 4;
    if (ph === 'bite') dip = 7 + Math.sin(t * 30) * 2;
    drawBobber(x, bob.x, bob.y, dip);
    if (ph === 'wait') for (const n of PS.nibbles) if (t > n && t < n + 0.5) { x.fillStyle = '#FFFFFF'; x.font = 'italic 700 11px ' + '' + PFONT; x.fillText('tic…', bob.x + 14, bob.y - 14); }
    if (ph === 'bite') {
      const k = (t - PS.pt) / PS.biteWin, r = 50 * (1 - k) + 4;
      x.setLineDash([4, 3]); x.strokeStyle = '#FFE27A'; x.lineWidth = 2.5; x.beginPath(); x.arc(bob.x, bob.y - 2, 16, 0, 7); x.stroke(); x.setLineDash([]);
      const near = Math.abs(r - 16) <= 6;
      x.strokeStyle = near ? '#7CFF8A' : '#FFFFFF'; x.lineWidth = near ? 4 : 3; x.beginPath(); x.arc(bob.x, bob.y - 2, r, 0, 7); x.stroke();
      x.fillStyle = '#FFE27A'; x.strokeStyle = '#7A1E12'; x.lineWidth = 3; x.font = '900 28px ' + PFONT; x.textAlign = 'center';
      x.strokeText('!', bob.x, bob.y - 26); x.fillText('!', bob.x, bob.y - 26);
    }
  }
  if (ph === 'reel' || (ph === 'miss' && PS.hooked)) {
    if (ph === 'miss') x.globalAlpha = 0.4;
    const f = PS.fish, dir = PS.fx < PS.castX - 4 && PS.run <= 0 ? -1 : 1;
    drawFishShape(x, f, PS.fx, PS.fy, fishSize(f, PS.kg), PS.run > 0 ? 1 : dir, t * (PS.run > 0 ? 26 : 10), false);
    x.globalAlpha = 1;
    if (PS.warn > 0 || PS.run > 0) { x.fillStyle = PS.run > 0 ? '#FF6B5A' : '#FFE27A'; x.strokeStyle = '#1A1A1A'; x.lineWidth = 3; x.font = '900 20px ' + PFONT; x.textAlign = 'center'; x.strokeText('!!', PS.fx, PS.fy - 18 - fishSize(f, PS.kg) * 8); x.fillText('!!', PS.fx, PS.fy - 18 - fishSize(f, PS.kg) * 8); }
  }
}
function drawFishShape(x, f, cx, cy, s, dir, wig, shadow, col) {
  x.save(); x.translate(cx, cy); x.scale(dir * s, s);
  const c1 = shadow ? (col || '#0A2234') : f.c[0], c2 = shadow ? (col || '#0A2234') : f.c[1], tail = Math.sin(wig) * 0.25;
  const OL = shadow ? 0 : 1.2 / s;
  x.lineWidth = OL; x.strokeStyle = '#1A1A1A';
  const st = () => { if (!shadow) x.stroke(); };
  const eye = (ex, ey, r) => { if (shadow) return; x.fillStyle = '#fff'; x.strokeStyle = '#1A1A1A'; x.lineWidth = 0.6; x.beginPath(); x.arc(ex, ey, r, 0, 7); x.fill(); x.stroke(); x.fillStyle = '#1A1A1A'; x.beginPath(); x.arc(ex + r * 0.2, ey, r * 0.55, 0, 7); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(ex + r * 0.4, ey - r * 0.25, r * 0.2, 0, 7); x.fill(); x.lineWidth = OL; };
  if (f.shape === 'polpo') {
    x.fillStyle = c1;
    for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(-6 + i * 2.4, 2); x.quadraticCurveTo(-8 + i * 3 + Math.sin(wig + i) * 4, 12, -12 + i * 4.8 + Math.sin(wig * 0.7 + i) * 3, 18); x.lineWidth = 2.4; x.strokeStyle = c1; x.stroke(); }
    x.lineWidth = OL; x.strokeStyle = '#1A1A1A';
    x.beginPath(); x.ellipse(0, -4, 10, 9, 0, 0, 7); x.fill(); st();
    if (!shadow) { x.fillStyle = 'rgba(255,255,255,0.25)'; for (const [a, b] of [[-4, -8], [-1, -10], [3, -9], [-5, -4]]) { x.beginPath(); x.arc(a, b, 1.1, 0, 7); x.fill(); } }
    eye(4, -2, 2.4);
  } else if (f.shape === 'totano') {
    x.fillStyle = c1;
    x.beginPath(); x.moveTo(-18, 0); x.lineTo(-24, -6 + tail * 4); x.lineTo(-24, 6 + tail * 4); x.closePath(); x.fill(); st();
    x.beginPath(); x.ellipse(-4, 0, 15, 5, 0, 0, 7); x.fill(); st();
    if (!shadow) { x.fillStyle = 'rgba(120,40,20,0.35)'; for (let k = -14; k < 8; k += 3.2) { x.beginPath(); x.arc(k, -1.5 + (k % 2), 0.9, 0, 7); x.fill(); } }
    x.strokeStyle = c2; x.lineWidth = 1.6; for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(10, -2 + i * 1.4); x.lineTo(20 + Math.sin(wig + i) * 2, -4 + i * 2.6); x.stroke(); }
    x.lineWidth = OL; eye(8, -1, 1.8);
  } else if (f.shape === 'seppia') {
    x.strokeStyle = c1; x.lineWidth = 1.7;
    for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(9, -2 + i); x.lineTo(16 + Math.sin(wig + i) * 1.5, -3 + i * 1.6); x.stroke(); }
    x.lineWidth = OL; x.strokeStyle = '#1A1A1A';
    x.fillStyle = shadow ? c1 : c2; x.beginPath(); x.ellipse(-2, 0, 14 + Math.sin(wig) * 0.6, 7.6, 0, 0, 7); x.fill(); st();
    x.fillStyle = c1; x.beginPath(); x.ellipse(-2, 0, 12, 5.6, 0, 0, 7); x.fill(); st();
    if (!shadow) {
      x.save(); x.beginPath(); x.ellipse(-2, 0, 12, 5.6, 0, 0, 7); x.clip();
      x.strokeStyle = 'rgba(40,24,12,0.55)'; x.lineWidth = 0.9;
      for (let k = -13; k < 10; k += 2.6) { x.beginPath(); x.moveTo(k, -6); x.quadraticCurveTo(k + 1.6, -3, k, 0); x.quadraticCurveTo(k - 1.6, 3, k, 6); x.stroke(); }
      x.fillStyle = 'rgba(255,255,255,0.25)'; x.beginPath(); x.ellipse(-3, -2.4, 9, 1.4, 0, 0, 7); x.fill();
      x.restore();
    }
    eye(8, -1.3, 1.9);
  } else if (f.shape === 'murena') {
    const L = 34, pts = []; for (let i = 0; i <= 24; i++) { const u = i / 24; pts.push([L / 2 - u * L, Math.sin(u * 5.5 + wig) * 3.2 * u]); }
    const path = () => { x.beginPath(); pts.forEach((p, k) => (k ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]))); };
    x.lineCap = 'round'; x.lineJoin = 'round';
    if (!shadow) { x.strokeStyle = '#1A1A1A'; x.lineWidth = 8.2; path(); x.stroke(); }
    x.strokeStyle = c1; x.lineWidth = 7; path(); x.stroke();
    if (!shadow) {
      x.fillStyle = c2; if (!f.nodots) pts.forEach((p, k) => { if (k > 1 && k % 2 === 0) { x.beginPath(); x.arc(p[0] + 0.6, p[1] - 1.2 + (k % 4 ? 1.8 : 0), 0.9, 0, 7); x.fill(); } });
      x.strokeStyle = 'rgba(255,255,255,0.25)'; x.lineWidth = 1.2; x.beginPath(); pts.forEach((p, k) => (k ? x.lineTo(p[0], p[1] - 2) : x.moveTo(p[0], p[1] - 2))); x.stroke();
      x.strokeStyle = '#1A1A1A'; x.lineWidth = 0.8; x.beginPath(); x.moveTo(L / 2 + 3.2, 0.4); x.lineTo(L / 2 - 1.5, 1.6); x.lineTo(L / 2 + 3, 2.6); x.stroke();
    }
    x.lineCap = 'butt'; x.lineJoin = 'miter'; x.lineWidth = OL; eye(L / 2 - 0.6, -1.4, 1.5);
  } else if (f.shape === 'sogliola') {
    x.fillStyle = shadow ? c1 : (f.fin || '#7E6446');
    x.beginPath(); x.ellipse(0, 0, 17, 8.6, 0, 0, 7); x.fill(); st();
    x.beginPath(); x.moveTo(-16, 0); x.lineTo(-23, -4 + tail * 4); x.quadraticCurveTo(-21, tail * 3, -23, 4 + tail * 4); x.closePath(); x.fill(); st();
    let g = c1; if (!shadow) { g = x.createLinearGradient(0, -7, 0, 7); g.addColorStop(0, c1); g.addColorStop(1, c2); }
    x.fillStyle = g; x.beginPath(); x.ellipse(1, 0, 14.5, 6.4, 0, 0, 7); x.fill(); st();
    if (!shadow) {
      x.save(); x.beginPath(); x.ellipse(1, 0, 14.5, 6.4, 0, 0, 7); x.clip(); x.fillStyle = 'rgba(70,50,30,0.35)';
      for (let i = 0; i < 12; i++) { x.beginPath(); x.arc(12 - ((i * 7.1) % 26), -5 + ((i * 3.3) % 10), 0.9 + (i % 3) * 0.4, 0, 7); x.fill(); } x.restore();
      x.strokeStyle = 'rgba(0,0,0,0.25)'; x.lineWidth = 0.5; for (let k = -14; k < 16; k += 2.4) { x.beginPath(); x.moveTo(k, -6.5); x.lineTo(k + 0.5, -8.2); x.moveTo(k, 6.5); x.lineTo(k + 0.5, 8.2); x.stroke(); }
    }
    x.lineWidth = OL; eye(11, -2, 1.3); eye(9.4, -4.6, 1.3);
  } else if (f.shape === 'aragosta') {
    x.strokeStyle = shadow ? c1 : '#7A2A1A'; x.lineWidth = 0.9;
    for (const sgn of [-1, 1]) { x.beginPath(); x.moveTo(13, -1); x.quadraticCurveTo(24, -6 * sgn - 3, 34 + Math.sin(wig + sgn) * 2, -10 * sgn - 4); x.stroke(); }
    x.lineWidth = 1.2; for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(6 - i * 3.5, 3); x.lineTo(5 - i * 3.5 + Math.sin(wig * 2 + i) * 1.2, 8); x.stroke(); }
    x.lineWidth = OL; x.strokeStyle = '#1A1A1A';
    x.fillStyle = c1;
    x.beginPath(); x.moveTo(-15, 0); x.lineTo(-22, -5 + tail * 3); x.lineTo(-20, 0); x.lineTo(-22, 5 + tail * 3); x.closePath(); x.fill(); st();
    for (let i = 0; i < 5; i++) { x.beginPath(); x.ellipse(-2.5 - i * 3, 0.4, 2.6, 3.9 - i * 0.3, 0, 0, 7); x.fill(); st(); }
    let g = c1; if (!shadow) { g = x.createLinearGradient(0, -5, 0, 5); g.addColorStop(0, c1); g.addColorStop(1, c2); }
    x.fillStyle = g; x.beginPath(); x.ellipse(6.5, 0, 7.5, 4.6, 0, 0, 7); x.fill(); st();
    if (!shadow) { x.fillStyle = 'rgba(255,220,150,0.6)'; for (const [a, b] of [[4, -2], [8, -1.5], [6, 1.6], [10, 0.5]]) { x.beginPath(); x.arc(a, b, 0.7, 0, 7); x.fill(); } x.strokeStyle = '#7A2A1A'; x.lineWidth = 0.6; x.beginPath(); x.moveTo(13, -2); x.lineTo(16, -4); x.moveTo(13, 1); x.lineTo(16, 3); x.stroke(); }
    x.lineWidth = OL; eye(11.5, -2.6, 1.2);
  } else if (f.shape === 'razza') {
    const fl = Math.sin(wig) * 2.2;
    x.strokeStyle = shadow ? c1 : '#5A4632'; x.lineWidth = 1.1; x.beginPath(); x.moveTo(-8, 0); x.quadraticCurveTo(-18, 1 + tail * 3, -28, tail * 6); x.stroke();
    x.lineWidth = OL; x.strokeStyle = '#1A1A1A';
    let g = c1; if (!shadow) { g = x.createRadialGradient(2, 0, 1, 0, 0, 16); g.addColorStop(0, c2); g.addColorStop(0.5, c1); g.addColorStop(1, c1); }
    x.fillStyle = g; x.beginPath(); x.moveTo(14, 0); x.quadraticCurveTo(6, -4, 0, -12 - fl); x.quadraticCurveTo(-6, -6, -9, 0); x.quadraticCurveTo(-6, 6, 0, 12 + fl); x.quadraticCurveTo(6, 4, 14, 0); x.closePath(); x.fill(); st();
    if (!shadow) { x.fillStyle = 'rgba(60,40,20,0.35)'; for (const [a, b] of [[-2, -6], [1, 5], [4, -2], [-4, 3], [-1, 0]]) { x.beginPath(); x.arc(a, b, 1.1, 0, 7); x.fill(); } x.fillStyle = 'rgba(255,255,255,0.25)'; x.beginPath(); x.ellipse(3, -1.5, 6, 1.6, 0, 0, 7); x.fill(); }
    eye(8, -2.2, 1.2); eye(8, 2.2, 1.2);
  } else if (f.shape === 'luna') {
    const R = 12;
    x.fillStyle = c1;
    x.beginPath(); x.moveTo(-5, -R * 0.75); x.quadraticCurveTo(-9 + tail * 3, -R - 6, -8 + tail * 4, -R - 11); x.quadraticCurveTo(-1, -R - 4, 1, -R * 0.82); x.closePath(); x.fill(); st();
    x.beginPath(); x.moveTo(-5, R * 0.75); x.quadraticCurveTo(-9 - tail * 3, R + 6, -8 - tail * 4, R + 11); x.quadraticCurveTo(-1, R + 4, 1, R * 0.82); x.closePath(); x.fill(); st();
    x.beginPath(); x.moveTo(-R + 2, -R * 0.62); x.bezierCurveTo(-R - 5, -R * 0.4, -R - 5, R * 0.4, -R + 2, R * 0.62); x.closePath(); x.fill(); st();
    let g = c1; if (!shadow) { g = x.createLinearGradient(0, -R, 0, R); g.addColorStop(0, c1); g.addColorStop(0.55, c2); g.addColorStop(1, '#FFFFFF'); }
    x.fillStyle = g; x.beginPath(); x.ellipse(0, 0, R, R * 0.9, 0, 0, 7); x.fill(); st();
    if (!shadow) {
      x.fillStyle = 'rgba(255,255,255,0.28)'; for (const [a, b, r] of [[-5, -3, 2], [-1, 4, 1.6], [3, -6, 1.3], [-6, 5, 1.2], [1, 0, 1.1]]) { x.beginPath(); x.arc(a, b, r, 0, 7); x.fill(); }
      x.fillStyle = 'rgba(0,0,0,0.12)'; x.beginPath(); x.moveTo(R - 7, 1); x.quadraticCurveTo(R - 10, 4, R - 11, 2); x.closePath(); x.fill();
      x.strokeStyle = '#1A1A1A'; x.lineWidth = 0.7; x.beginPath(); x.arc(R - 0.4, 1.2, 1, 0, 7); x.stroke();
    }
    x.lineWidth = OL; eye(R - 4.5, -2.2, 2);
  } else if (f.shape === 'scarpa') {
    x.fillStyle = c1; x.beginPath(); x.moveTo(-8, -12); x.lineTo(0, -12); x.lineTo(1, 0); x.lineTo(12, 2); x.quadraticCurveTo(14, 7, 10, 8); x.lineTo(-9, 8); x.closePath(); x.fill(); st();
    if (!shadow) { x.fillStyle = c2; x.fillRect(-9, 6, 22, 2.5); x.strokeStyle = '#E8DCC0'; x.lineWidth = 0.7; for (let k = 0; k < 4; k++) { x.beginPath(); x.moveTo(-3 + k * 1.6, -9 + k * 2.4); x.lineTo(1 + k * 1.6, -8 + k * 2.4); x.stroke(); } x.fillStyle = 'rgba(80,140,60,0.7)'; x.beginPath(); x.ellipse(-6, 7, 2.5, 1, 0.3, 0, 7); x.fill(); }
  } else {
    const len = 16 * (f.long || 1), tall = 5.6 * (f.tall || 1);
    const fc = shadow ? c1 : (f.fin || f.c[0]), tc = shadow ? c1 : (f.tailC || fc);
    const body = () => { x.beginPath(); x.moveTo(len + 1, 0.6); x.bezierCurveTo(len * 0.7, -tall * 1.2, -len * 0.45, -tall * 1.12, -len, -tall * 0.22); x.lineTo(-len, tall * 0.22); x.bezierCurveTo(-len * 0.45, tall * 1.08, len * 0.7, tall * 1.12, len + 1, 0.6); x.closePath(); };
    // coda a forbice
    x.fillStyle = tc;
    x.beginPath(); x.moveTo(-len + 2, 0); x.quadraticCurveTo(-len - 5, -tall * 0.4 + tail * 4, -len - 9, -tall * 1.15 + tail * 7 - 1); x.quadraticCurveTo(-len - 6, tail * 3, -len - 9, tall * 1.15 + tail * 7 + 1); x.quadraticCurveTo(-len - 5, tall * 0.4 + tail * 4, -len + 2, 0); x.closePath(); x.fill(); st();
    // pinne dorsali
    x.fillStyle = fc;
    if (f.spines) { x.beginPath(); x.moveTo(len * 0.55, -tall * 0.85); for (let k = 0; k <= 9; k++) { const px = len * 0.55 - k * (len * 1.25 / 9); x.lineTo(px - 0.8, -tall - (k % 2 ? 2 : 6.5)); x.lineTo(px - 1.6, -tall * 0.9); } x.closePath(); x.fill(); st(); }
    else if (f.crest) { x.beginPath(); x.moveTo(len * 0.62, -tall * 0.95); x.quadraticCurveTo(0, -tall - 6, -len + 3, -tall * 0.45); x.lineTo(-len + 4, -tall * 0.2); x.closePath(); x.fill(); st(); }
    else { x.beginPath(); x.moveTo(-7, -tall * 0.9); x.quadraticCurveTo(-1, -tall - 6, 7, -tall * 0.85); x.closePath(); x.fill(); st(); }
    if (f.dorsal2 && !shadow) { x.fillStyle = f.dorsal2; x.beginPath(); x.moveTo(-len * 0.45, -tall * 0.8); x.quadraticCurveTo(-len * 0.55, -tall - 4, -len * 0.62, -tall * 0.6); x.closePath(); x.fill(); st(); x.beginPath(); x.moveTo(-len * 0.45, tall * 0.8); x.quadraticCurveTo(-len * 0.55, tall + 4, -len * 0.62, tall * 0.6); x.closePath(); x.fill(); st(); x.fillStyle = fc; }
    x.beginPath(); x.moveTo(-6, tall * 0.85); x.quadraticCurveTo(-2, tall + 3.5, 3, tall * 0.85); x.closePath(); x.fill(); st();
    if (f.shape === 'spada') { x.fillStyle = c1; x.beginPath(); x.moveTo(len - 1, -1.2); x.lineTo(len + 24, -0.2); x.lineTo(len - 1, 1.6); x.closePath(); x.fill(); st(); x.beginPath(); x.moveTo(-3, -tall * 0.9); x.quadraticCurveTo(0, -tall - 12, 8, -tall * 0.85); x.closePath(); x.fill(); st(); }
    if (f.beak) { x.fillStyle = c1; x.beginPath(); x.moveTo(len - 0.5, -0.7); x.lineTo(len + 13, 0.2); x.lineTo(len - 0.5, 1.4); x.closePath(); x.fill(); st(); }
    let g = c1;
    if (!shadow) { g = x.createLinearGradient(0, -tall, 0, tall); g.addColorStop(0, c1); g.addColorStop(0.45, c1); g.addColorStop(0.62, c2); g.addColorStop(1, '#FFFFFF'); }
    x.fillStyle = g; body(); x.fill(); st();
    if (!shadow) {
      x.save(); body(); x.clip();
      if (f.blotch) { x.fillStyle = f.blotch; x.globalAlpha = 0.45; for (let i = 0; i < 11; i++) { const px = len * 0.8 - ((i * 7.7) % (len * 1.8)), py = -tall * 0.7 + ((i * 4.3) % (tall * 1.3)); x.beginPath(); x.ellipse(px, py, 1.6 + (i % 3) * 0.8, 1.2 + (i % 2) * 0.7, i, 0, 7); x.fill(); } x.globalAlpha = 1; }
      if (f.waves) { x.strokeStyle = f.waves; x.lineWidth = 0.9; for (let k = 0; k < 7; k++) { const x0 = -len + 3 + k * (len * 1.6 / 7); x.beginPath(); x.moveTo(x0, -tall); x.lineTo(x0 + 1.4, -tall * 0.75); x.lineTo(x0 - 0.6, -tall * 0.5); x.lineTo(x0 + 1, -tall * 0.22); x.stroke(); } }
      if (f.lines) { x.strokeStyle = f.lines; x.lineWidth = 0.55; for (const ly of [-0.55, -0.3, -0.05, 0.2]) { x.beginPath(); x.moveTo(-len, tall * ly); x.lineTo(len, tall * ly + 0.4); x.stroke(); } }
      if (f.stripe) { x.fillStyle = f.stripe; x.fillRect(-len, -1.6, len * 2, 2.2); }
      if (f.spots) { x.fillStyle = f.spots; for (let k = 0; k < 6; k++) { x.beginPath(); x.arc(len * 0.35 - k * len * 0.2, -tall * 0.3 + (k % 2) * 0.6, 1.05, 0, 7); x.fill(); } }
      if (f.dots) { x.fillStyle = f.dots; for (let i = 0; i < 16; i++) { const px = len * 0.75 - ((i * 7.3) % (len * 1.7)), py = -tall * 0.8 + ((i * 3.7) % (tall * 0.75)); x.beginPath(); x.arc(px, py, 0.65, 0, 7); x.fill(); } }
      if (f.bands2) { x.fillStyle = 'rgba(40,40,40,0.5)'; for (let k = 0; k < 10; k++) x.fillRect(len * 0.65 - k * len * 0.17, -tall, 1.1, tall * 2); }
      if (f.oblique) { x.strokeStyle = f.oblique; x.lineWidth = 1; for (let k = 0; k < 8; k++) { const x0 = len * 0.6 - k * len * 0.2; x.beginPath(); x.moveTo(x0, -tall); x.lineTo(x0 - len * 0.22, -tall * 0.2); x.stroke(); } }
      if (f.ocellus) { x.fillStyle = '#F2E2A0'; x.beginPath(); x.arc(-1, 0, 3.4, 0, 7); x.fill(); x.fillStyle = '#1A1A1A'; x.beginPath(); x.arc(-1, 0, 2.5, 0, 7); x.fill(); }
      if (f.bands) { x.fillStyle = 'rgba(30,30,30,0.55)'; for (const bx of [-8, -1, 6]) x.fillRect(bx, -tall, 2.4, tall * 2); }
      if (f.tailSpot) { x.fillStyle = '#1A1A1A'; x.beginPath(); x.ellipse(-len + 2.5, 0, 2, tall * 0.35, 0, 0, 7); x.fill(); }
      if (f.finlets) { x.fillStyle = '#E5C04A'; for (let i = 0; i < 4; i++) { x.fillRect(-len + 2 + i * 2.6, -tall * 0.5, 1.4, 1.4); x.fillRect(-len + 2 + i * 2.6, tall * 0.42, 1.4, 1.4); } }
      x.fillStyle = 'rgba(255,255,255,0.35)'; x.beginPath(); x.ellipse(1, -tall * 0.45, len * 0.62, tall * 0.18, 0, 0, 7); x.fill();
      x.strokeStyle = 'rgba(0,0,0,0.18)'; x.lineWidth = 0.6; for (let i = -len * 0.55; i < len * 0.5; i += 3.2) { x.beginPath(); x.arc(i, -tall * 0.15, 2.2, -1.1, 1.1); x.stroke(); }
      x.restore();
      if (f.gold) { x.strokeStyle = '#F2C94C'; x.lineWidth = 2; x.beginPath(); x.moveTo(len - 6.5, -tall * 0.75); x.quadraticCurveTo(len - 5, -tall * 0.4, len - 6.5, -tall * 0.05); x.stroke(); }
      if (f.gillSpot) { x.fillStyle = 'rgba(20,20,20,0.75)'; x.beginPath(); x.ellipse(len - 9.5, -tall * 0.35, 1.1, 1.5, 0, 0, 7); x.fill(); }
      if (f.wings) { x.fillStyle = 'rgba(120,170,230,0.55)'; x.strokeStyle = 'rgba(30,60,100,0.7)'; x.lineWidth = 0.7; const fl = Math.sin(wig) * 2; x.beginPath(); x.moveTo(len - 10, 0); x.lineTo(-len * 0.5, -tall - 9 - fl); x.lineTo(-len * 0.25, -tall * 0.2); x.closePath(); x.fill(); x.stroke(); for (let k = 1; k < 4; k++) { x.beginPath(); x.moveTo(len - 10, 0); x.lineTo(-len * 0.5 + k * 4, -tall - 9 - fl + k * 2.5); x.stroke(); } }
      if (f.longPec) { x.fillStyle = f.fin || '#2E4766'; x.strokeStyle = '#1A1A1A'; x.lineWidth = 0.7; x.beginPath(); x.moveTo(len - 12, 0.5); x.quadraticCurveTo(0, 3, -len * 0.45, 1.5 + tail * 2); x.quadraticCurveTo(0, 0.5, len - 12, -1); x.closePath(); x.fill(); x.stroke(); }
      // pinna pettorale, branchia, occhio e bocca
      x.fillStyle = 'rgba(255,255,255,0.45)'; x.strokeStyle = 'rgba(0,0,0,0.35)'; x.lineWidth = 0.7;
      x.beginPath(); x.moveTo(len - 11, 1.5); x.quadraticCurveTo(len - 17, 4 + tail * 3, len - 18, 1 + tail * 2); x.closePath(); x.fill(); x.stroke();
      x.beginPath(); x.arc(len - 8, 0.4, tall * 0.62, -1.1, 1.1); x.stroke();
      eye(len - 4.4, -1.5, 2.3);
      x.strokeStyle = 'rgba(0,0,0,0.5)'; x.lineWidth = f.bigmouth ? 0.9 : 0.7; x.beginPath(); x.moveTo(len + 0.6, 1); x.lineTo(f.bigmouth ? len - 4.5 : len - 2, f.bigmouth ? 2.4 : 1.6); x.stroke();
      if (f.barbels) { x.strokeStyle = '#F0D9A0'; x.lineWidth = 0.6; for (const o of [0, 1.4]) { x.beginPath(); x.moveTo(len - 1 - o, 2); x.quadraticCurveTo(len - o, 4.5, len - 2 - o + tail * 2, 6.5); x.stroke(); } }
    }
  }
  x.restore();
}
function hudBar(x, x0, y0, w, h) { x.fillStyle = 'rgba(14,30,44,0.6)'; rrect(x, x0 - 4, y0 - 4, w + 8, h + 8, (h + 8) / 2); x.fill(); }
function drawHud(x, G) {
  const ph = PS.phase, t = PS.time, Q = pesca();
  x.textAlign = 'center'; x.textBaseline = 'alphabetic';
  if (ph === 'aim' || ph === 'charge') {
    const Z = zones(Q), x0 = 40, w = 280, y0 = 14, h = 18;
    hudBar(x, x0, y0, w, h); x.save(); rrect(x, x0, y0, w, h, h / 2); x.clip();
    x.fillStyle = '#9DB2C0'; x.fillRect(x0, y0, w * Z.g0, h);
    x.fillStyle = '#5FC25A'; x.fillRect(x0 + w * Z.g0, y0, w * (Z.g1 - Z.g0), h);
    x.fillStyle = '#F2C94C'; x.fillRect(x0 + w * (Z.gc - Z.gw), y0, w * Z.gw * 2, h);
    x.fillStyle = '#D9483B'; x.fillRect(x0 + w * Z.g1, y0, w * (1 - Z.g1), h);
    x.restore(); x.strokeStyle = '#1A1A1A'; x.lineWidth = 1.5; rrect(x, x0, y0, w, h, h / 2); x.stroke();
    x.font = '800 9px ' + PFONT; x.fillStyle = '#1A1A1A'; x.fillText('PERFETTO', x0 + w * Z.gc, y0 + 12.5);
    if (ph === 'charge') {
      const p = meterVal(), nx = x0 + w * p;
      x.fillStyle = '#FFFFFF'; x.strokeStyle = '#1A1A1A'; x.lineWidth = 1.5;
      x.beginPath(); x.moveTo(nx, y0 + h + 1); x.lineTo(nx - 6, y0 + h + 10); x.lineTo(nx + 6, y0 + h + 10); x.closePath(); x.fill(); x.stroke();
      x.fillRect(nx - 1.5, y0 - 3, 3, h + 6); x.strokeRect(nx - 1.5, y0 - 3, 3, h + 6);
    } else {
      x.font = '700 13px ' + PFONT; x.fillStyle = '#fff'; x.strokeStyle = 'rgba(0,0,0,0.6)'; x.lineWidth = 3;
      const msg = baitLeft(Q) ? 'Tieni premuto e lascia nel verde' : 'Esche finite';
      const mw = x.measureText(msg).width + 22; x.fillStyle = 'rgba(14,30,44,0.7)'; rrect(x, 180 - mw / 2, y0 + h + 9, mw, 20, 10); x.fill(); x.fillStyle = '#fff'; x.fillText(msg, 180, y0 + h + 23.5);
    }
  }
  if (ph === 'reel') {
    const x0 = 40, w = 280, y0 = 14, h = 16;
    hudBar(x, x0, y0, w, h); x.save(); rrect(x, x0, y0, w, h, h / 2); x.clip();
    x.fillStyle = '#E6DED0'; x.fillRect(x0, y0, w, h);
    x.fillStyle = '#8BC97E'; x.fillRect(x0 + w * PS.zone[0], y0, w * (PS.zone[1] - PS.zone[0]), h);
    x.fillStyle = '#E8A39A'; x.fillRect(x0 + w * 0.88, y0, w * 0.12, h);
    x.restore(); x.strokeStyle = '#1A1A1A'; x.lineWidth = 1.5; rrect(x, x0, y0, w, h, h / 2); x.stroke();
    const inZ = PS.T >= PS.zone[0] && PS.T <= PS.zone[1], nx = x0 + w * Math.min(1, PS.T);
    x.fillStyle = inZ ? '#1A1A1A' : PS.T > PS.zone[1] ? '#C0392B' : '#6A6A6A'; x.fillRect(nx - 3, y0 - 3, 6, h + 6);
    x.font = '800 9px ' + PFONT; x.fillStyle = '#2A2218'; x.textAlign = 'left'; x.fillText('TENSIONE', x0 + 5, y0 + 10.5);
    // filo da recuperare e forza del pesce
    const y1 = y0 + h + 9; hudBar(x, x0, y1, w, 7);
    x.fillStyle = '#2B3A44'; x.fillRect(x0, y1, w, 7); x.fillStyle = '#5CC0E8'; x.fillRect(x0, y1, w * clamp01(1 - PS.L), 7);
    x.fillStyle = '#fff'; x.strokeStyle = 'rgba(20,28,36,0.85)'; x.lineWidth = 3; x.font = '800 10px ' + PFONT; x.textAlign = 'left'; x.strokeText('Recupero', x0, y1 + 19); x.fillText('Recupero', x0, y1 + 19);
    const ft = 'Forza del pesce ' + (PS.fish.junk ? '—' : Math.max(0, Math.round(PS.S * 100)) + '%');
    x.textAlign = 'right'; x.strokeText(ft, x0 + w, y1 + 19); x.fillText(ft, x0 + w, y1 + 19);
    x.textAlign = 'center';
  }
  if (PS.toast && t - PS.toast.t < 1.8) {
    const k = (t - PS.toast.t) / 1.8, cls = PS.toast.cls;
    x.globalAlpha = k < 0.8 ? 1 : (1 - k) * 5;
    const yy = G.wy - 34 - k * 12, sc = 1 + Math.max(0, 0.22 - k) * 1.5;
    x.save(); x.translate(180, yy); x.scale(sc, sc);
    x.font = '800 ' + (cls === 'perfect' ? 18 : 15) + 'px ' + PFONT; x.textAlign = 'center'; x.textBaseline = 'middle';
    const tw = x.measureText(PS.toast.text).width + 26, th = cls === 'perfect' ? 32 : 28;
    x.fillStyle = cls === 'perfect' ? '#F2C94C' : cls === 'good' ? '#3E9B4F' : cls === 'warn' ? '#C0392B' : 'rgba(14,30,44,0.85)';
    x.strokeStyle = '#1A1A1A'; x.lineWidth = 2; rrect(x, -tw / 2, -th / 2, tw, th, th / 2); x.fill(); x.stroke();
    x.fillStyle = cls === 'perfect' ? '#1A1A1A' : '#FFFFFF'; x.fillText(PS.toast.text, 0, 1);
    x.restore(); x.globalAlpha = 1; x.textBaseline = 'alphabetic';
  }
  if (ph === 'miss' && PS.msg) {
    x.font = '800 14px ' + PFONT; const lines = wrapText(x, PS.msg, 280);
    const bh = lines.length * 18 + 14; x.fillStyle = 'rgba(14,30,44,0.85)'; x.strokeStyle = '#1A1A1A'; x.lineWidth = 2; rrect(x, 30, G.wy - 70, 300, bh, 12); x.fill(); x.stroke();
    x.fillStyle = '#fff'; lines.forEach((l, i) => x.fillText(l, 180, G.wy - 70 + 22 + i * 18));
  }
}
function wrapText(x, s, w) { const out = []; let cur = ''; for (const word of s.split(' ')) { const tr = cur ? cur + ' ' + word : word; if (x.measureText(tr).width > w && cur) { out.push(cur); cur = word; } else cur = tr; } if (cur) out.push(cur); return out; }

/* ---------- ciclo ---------- */
function loop(now) {
  if (!PS || view !== 'vPesca') { psRaf = 0; return; }
  const dt = Math.min(0.05, (now - PS.last) / 1000); PS.last = now; PS.time += dt;
  if (!$('layer').innerHTML || PS.phase !== 'caught') step(dt);
  if (!PS) { psRaf = 0; return; }
  draw();
  psRaf = requestAnimationFrame(loop);
}
function startLoop() { if (!psRaf && PS) { PS.last = performance.now(); psRaf = requestAnimationFrame(loop); } }
function stopLoop() { if (psRaf) cancelAnimationFrame(psRaf); psRaf = 0; }

/* ---------- pescato! ---------- */
function caught() {
  const f = PS.fish, Q = pesca(), kg = PS.kg;
  setPhase('caught');
  const v = Math.max(f.junk ? 0 : 1, Math.round(f.v * (0.6 + (kg - f.kg[0]) / (f.kg[1] - f.kg[0] || 1) * 0.8)));
  const before = new Set(PESCA_GOALS.filter((g) => { const [a, b] = g.prog(Q); return a >= b; }).map((g) => g.id));
  const openBefore = SPOTS.filter((x) => spotOpen(Q, x)).map((x) => x.id);
  const isNew = !Q.album[f.id], rec = Q.album[f.id] && kg > Q.album[f.id].max;
  Q.album[f.id] = { n: (Q.album[f.id] ? Q.album[f.id].n : 0) + 1, max: Math.max(kg, Q.album[f.id] ? Q.album[f.id].max : 0) };
  if (!f.junk) { Q.total++; Q.cesta.push({ id: f.id, kg, v }); if (!Q.best || kg > Q.best.kg) Q.best = { id: f.id, kg }; }
  const xp = f.junk ? 1 : 3 + f.r * 4 + (isNew ? 10 : 0) + (PS.q === 'perfect' ? 2 : 0);
  gainXp(xp);
  const fresh = PESCA_GOALS.filter((g) => { const [a, b] = g.prog(Q); return a >= b && !before.has(g.id); });
  const newSpot = SPOTS.find((x) => !openBefore.includes(x.id) && spotOpen(Q, x));
  if (newSpot) { if (!Q.open.includes(newSpot.id)) Q.open.push(newSpot.id); setTimeout(() => flash('🗺️ Si apre: ' + newSpot.n + '!'), 1600); if (typeof track === 'function') track('pesca_spot_open', { spot: newSpot.id }); }
  if (fresh.length) gainXp(25 * fresh.length);
  let chest = '';
  if (f.r >= 3 && Math.random() < (f.r >= 5 ? 1 : f.r === 4 ? 0.6 : 0.25)) chest = pescaChest(f.r);
  save();
  if (typeof track === 'function') track('fish_caught', { fish: f.id, rarity: f.r, cast: PS.q });
  splash(PS.fx, geo().wy, 18); psSound('splash');
  fx('big'); if (f.r >= 4) say('bella', 0);
  const castTxt = { perfect: 'Lancio perfetto', good: 'Buon lancio', weak: 'Lancio debole', tangle: 'Lancio aggrovigliato' }[PS.q];
  const left = baitLeft(Q);
  overlay('<div class="pcatch"><div class="pcfish">' + fishImg(f, true) + '</div><h2>' + (f.junk ? 'Hai pescato… una scarpa!' : f.id === 'spada' ? 'Il re dello Stretto!' : 'Hai pescato ' + fishArt(f) + f.n.toLowerCase() + '!') + '</h2>' +
    '<p class="pckg">' + fmtKg(kg) + (isNew ? ' · <b>Nuovo nell’album!</b>' : rec ? ' · <b>Nuovo record!</b>' : '') + '</p><p class="pcstars">' + (f.junk ? '' : STARS(f.r)) + '</p>' +
    '<p class="pccast">' + castTxt + ' · ' + Math.round(8 + PS.dist * 52) + ' m · ferrata ' + ({ perfect: 'perfetta', good: 'buona', weak: 'debole' })[PS.hq] + '</p><p>' + f.f + '</p>' +
    '<div class="gain"><div class="xp">+' + xp + ' XP' + (f.junk ? '' : ' · vale ' + v + ' carlini') + '</div>' + chest +
    (fresh.length ? '<div class="unl">' + fresh.map((g) => '<div><img src="' + AVIMG[g.icon] + '" alt="">Obiettivo: ' + g.name + '</div>').join('') + '</div><div style="font-size:14px;color:#5A4C3A">+' + 25 * fresh.length + ' XP per gli obiettivi</div>' : '') + '</div></div>' +
    '<button class="btn" id="pcAgain"' + (left ? '' : ' disabled') + '>' + (left ? 'Lancia di nuovo (' + baitOf(Q).e + ' ' + left + ')' : 'Esche finite') + '</button><button class="btn alt" id="pcBack">Torna a riva</button>');
  /* per 3 secondi i pulsanti sono bloccati: così un tocco per sbaglio non chiude il riquadro prima di leggere */
  const ag = $('pcAgain'), bk = $('pcBack'), agOn = !ag.disabled, agTxt = ag.textContent;
  ag.disabled = true; bk.disabled = true;
  const bar = document.createElement('div'); bar.className = 'pcwait'; bar.innerHTML = '<i></i>';
  ag.parentNode.insertBefore(bar, ag);
  requestAnimationFrame(() => { bar.firstChild.style.width = '100%'; });
  let sec = 3;
  const tick = () => {
    if (!document.body.contains(ag)) return;
    if (sec > 0) { ag.textContent = agTxt + ' · ' + sec; sec--; setTimeout(tick, 1000); return; }
    ag.textContent = agTxt; ag.disabled = !agOn; bk.disabled = false; bar.remove();
  };
  tick();
  ag.onclick = () => { if (ag.disabled) return; $('layer').innerHTML = ''; const keep = { ambient: PS.ambient }; newSession(); Object.assign(PS, keep); setCtl(); startLoop(); };
  bk.onclick = () => { if (bk.disabled) return; $('layer').innerHTML = ''; PS = null; renderPesca(); };
}
function pescaChest(r) {
  const E = eco();
  if (E.chests.length >= SLOTS) return '<div class="chestnote">I tuoi bauli sono pieni: aprine uno per fare spazio.</div>';
  const grade = r >= 5 ? 'oro' : r === 4 ? (Math.random() < 0.5 ? 'oro' : 'argento') : (Math.random() < 0.6 ? 'rame' : 'argento');
  E.chests.push({ id: 'c' + Date.now().toString(36), grade, start: null, end: null, sped: false });
  return '<div class="chestnote"><span class="chmini">' + chestSVG(grade) + '</span>Dentro la rete c’era un <b>' + GRADES[grade].name.toLowerCase() + '</b>!</div>';
}
const PESCA_GOALS = [
  { id: 'p1', name: 'Primo pesce', need: 'Pesca il tuo primo pesce', icon: 'pescatore', prog: (Q) => [Math.min(Q.total, 1), 1] },
  { id: 'perf', name: 'Mano d’oro', need: 'Fai 10 lanci perfetti', icon: 'pescatore', prog: (Q) => [Math.min(Q.perfect || 0, 10), 10] },
  { id: 'p25', name: 'Cesta piena', need: 'Pesca 25 pesci', icon: 'rammendatrice', prog: (Q) => [Math.min(Q.total, 25), 25] },
  { id: 'polpo', name: 'Otto braccia', need: 'Pesca un polpo', icon: 'pescatore', prog: (Q) => [Q.album.polpo ? 1 : 0, 1] },
  { id: 'tonno', name: 'Come alla tonnara', need: 'Pesca un tonno rosso', icon: 'lanzaturi', prog: (Q) => [Q.album.tonno ? 1 : 0, 1] },
  { id: 'spada', name: 'Il re dello Stretto', need: 'Pesca un pesce spada', icon: 'lanzaturi', prog: (Q) => [Q.album.spada ? 1 : 0, 1] },
  { id: 'luna', name: 'Il gigante gentile', need: 'Pesca un pesce luna', icon: 'pescatore', prog: (Q) => [Q.album.luna ? 1 : 0, 1] },
  { id: 'album', name: 'Album completo', need: 'Pesca tutte le specie, scarpa compresa', icon: 'rammendatrice', prog: (Q) => [Object.keys(Q.album).length, FISH.length] },
  { id: 'p100', name: 'Lupo di mare', need: 'Pesca 100 pesci', icon: 'lanzaturi', prog: (Q) => [Math.min(Q.total, 100), 100] },
];

/* ---------- tocchi e pressioni ---------- */
$('pescaBox').addEventListener('click', (e) => {
  const Q = pesca(), C = () => eco().carlini;
  const sp = e.target.closest('[data-pspot]'); if (sp && !sp.disabled) { Q.spot = sp.dataset.pspot; save(); renderPesca(); return; }
  const bt = e.target.closest('[data-pbait]'); if (bt) { Q.bait = bt.dataset.pbait; save(); renderPesca(); return; }
  if (e.target.closest('[data-pswap]')) { if (PS && PS.phase === 'aim') { const ids = BAITS.map((b) => b.id); for (let i = 1; i <= ids.length; i++) { const nx = ids[(ids.indexOf(Q.bait) + i) % ids.length]; if (baitLeft(Q, nx)) { Q.bait = nx; break; } } save(); setCtl(); } return; }
  if (e.target.closest('[data-pgo]')) { startFishing(); return; }
  if (e.target.closest('[data-pbuy]')) { const c = ESCA_PRICE * 5; if (C() >= c) { eco().carlini -= c; Q.esche += 5; save(); flash('+5 vermi'); renderPesca(); renderRes(); } return; }
  const bb = e.target.closest('[data-pbaitbuy]'); if (bb) { const b = BAITS.find((x) => x.id === bb.dataset.pbaitbuy), c = b.price * 3; if (C() >= c) { eco().carlini -= c; Q.baits[b.id] = (Q.baits[b.id] || 0) + 3; Q.bait = b.id; save(); fx('take'); flash('+3 ' + b.e); renderPesca(); renderRes(); } return; }
  const rb = e.target.closest('[data-prodbuy]'); if (rb) { const r = RODS.find((x) => x.id === rb.dataset.prodbuy); if (C() >= r.price && !Q.rods.includes(r.id)) { eco().carlini -= r.price; Q.rods.push(r.id); Q.rod = r.id; save(); fx('big'); flash(r.e + ' ' + r.n + '!'); renderPesca(); renderRes(); } return; }
  const ru = e.target.closest('[data-prod]'); if (ru) { Q.rod = ru.dataset.prod; save(); renderPesca(); return; }
  if (e.target.closest('[data-psell]')) { const v = Q.cesta.reduce((t, c) => t + c.v, 0); eco().carlini += v; Q.cesta = []; save(); fx('take'); flash('+' + v + ' carlini'); say('settebello', 0); renderPesca(); renderRes(); return; }
  if (e.target.closest('[data-pstop]')) { PS = null; renderPesca(); return; }
  const pf = e.target.closest('[data-pfish]');
  if (pf) { const f = FISH.find((x) => x.id === pf.dataset.pfish), a = Q.album[f.id]; overlay('<div class="find big"><span class="ae">' + fishImg(f, true) + '</span><h2>' + f.n + '</h2><p>' + f.f + '</p><small>' + STARS(f.r) + ' · pescato ' + a.n + (a.n === 1 ? ' volta' : ' volte') + ' · record ' + fmtKg(a.max) + '</small></div><button class="btn" id="pfOk">Chiudi</button>'); $('pfOk').onclick = () => { $('layer').innerHTML = ''; }; return; }
});
$('pescaBox').addEventListener('pointerdown', (e) => {
  if (!PS || !e.target.closest('#pbig, #parena') || e.button > 0) return;
  e.preventDefault(); psPress();
});
document.addEventListener('pointerup', psRelease);
document.addEventListener('pointercancel', psRelease);
$('pescaBox').addEventListener('contextmenu', (e) => { if (PS) e.preventDefault(); });
document.addEventListener('keydown', (e) => { if (view !== 'vPesca' || !PS || e.code !== 'Space' || $('layer').innerHTML) return; e.preventDefault(); if (!e.repeat) psPress(); });
document.addEventListener('keyup', (e) => { if (e.code === 'Space' && view === 'vPesca') psRelease(); });
(() => { const oldGo = go; go = function (v) { if (v !== 'vPesca' && PS) { stopLoop(); PS = null; } oldGo(v); if (v === 'vPesca') { renderPesca(); if (!ndSeen('pesca') && !ND.open) setTimeout(() => { if (view === 'vPesca' && !ND.open) showNduja('pesca'); }, 350); } }; })();
setInterval(() => { if (view === 'vPesca' && !PS && !$('layer').innerHTML && Date.now() % 30000 < 1000) renderPesca(); }, 1000);
