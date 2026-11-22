/* ================= CONQUISTA LA CALABRIA =================
   Tre parti insieme: 1) battaglia con i personaggi del mazzo, 2) sfida a carte con il difensore,
   3) costruisci la bottega e le difese nel paese conquistato. I briganti provano a riprenderseli. */
const TOWNS = [
  { id: 'tropea', name: 'Tropea', boss: 'raccoglitrice', game: 'scopa', lv: 1, x: 86, y: 224, desc: 'La città sulla rupe, con la cipolla rossa e il mare più bello.' },
  { id: 'pizzo', name: 'Pizzo', boss: 'pastaia', game: 'briscola', lv: 3, x: 130, y: 178, desc: 'Il castello sul mare e il tartufo gelato in piazza.' },
  { id: 'bagnara', name: 'Bagnara', boss: 'lanzaturi', game: 'tressette', lv: 5, x: 106, y: 300, desc: 'La patria del pesce spada e delle feluche.' },
  { id: 'scilla', name: 'Scilla', boss: 'rammendatrice', game: 'scopa', lv: 8, x: 78, y: 354, desc: 'Chianalea, le case sull’acqua e le reti stese al sole.' },
  { id: 'reggio', name: 'Reggio', boss: 'impagliatore', game: 'briscola', lv: 11, x: 98, y: 422, desc: 'Il lungomare più bello d’Italia e i Bronzi di Riace.' },
  { id: 'locri', name: 'Locri', boss: 'tessitrice', game: 'tressette', lv: 14, x: 218, y: 382, desc: 'L’antica Locri Epizefiri, città della Magna Grecia sullo Ionio.' },
  { id: 'gerace', name: 'Gerace', boss: 'zampognaro', game: 'scopa', lv: 18, x: 194, y: 330, desc: 'Il borgo delle cento chiese, arroccato sopra Locri.' },
  { id: 'sila', name: 'La Sila', boss: 'casaro', game: 'briscola', lv: 22, x: 206, y: 116, desc: 'Boschi di pini larici, laghi e caciocavallo.' },
  { id: 'cosenza', name: 'Cosenza', boss: 'massaro', game: 'tressette', lv: 26, x: 150, y: 80, desc: 'La città dei bruzi, tra il Crati e il Busento.' },
];
const ASPRO = { x: 150, y: 372, after: 2 }; // si apre dopo Bagnara
const UNIT_INFO = {
  contadino: { suit: 'campagna', r: 9 }, pescatore: { suit: 'mare', r: 9 }, pastore: { suit: 'montagna', r: 9 },
  raccoglitrice: { suit: 'campagna', r: 8 }, pastaia: { suit: 'bottega', r: 8 }, rammendatrice: { suit: 'mare', r: 8 }, lanzaturi: { suit: 'mare', r: 10 },
  tessitrice: { suit: 'montagna', r: 8 }, zampognaro: { suit: 'bottega', r: 10 }, casaro: { suit: 'montagna', r: 10 }, impagliatore: { suit: 'bottega', r: 9 }, massaro: { suit: 'campagna', r: 10 },
};
const UNIT_NAME = { contadino: 'Contadino', pescatore: 'Pescatore', pastore: 'Pastore', raccoglitrice: 'Raccoglitrice', pastaia: 'Pastaia', rammendatrice: 'Rammendatrice', lanzaturi: 'Lanzaturi', tessitrice: 'Tessitrice', zampognaro: 'Zampognaro', casaro: 'Casaro', impagliatore: 'Impagliatore', massaro: 'Massaro' };
const BASE = { 8: { hp: 80, atk: 11 }, 9: { hp: 92, atk: 14 }, 10: { hp: 115, atk: 16 } };
const SUIT_POWER = {
  mare: { pass: '25% di colpire due volte', spec: 'Fiocinata: colpisce tutti i nemici' },
  montagna: { pass: 'subisce un quarto di danni in meno', spec: 'Muro di pietra: la squadra si ripara per due turni' },
  campagna: { pass: 'cura un po’ la squadra dopo ogni tua mossa', spec: 'Raccolto: cura molto tutta la squadra' },
  bottega: { pass: '20% di colpo critico', spec: 'Tarantella: colpo forte e il nemico salta il turno' },
};
const BOTT_NAME = { raccoglitrice: 'Frantoio', pastaia: 'Pastificio', rammendatrice: 'Bottega delle reti', lanzaturi: 'Pescheria', tessitrice: 'Telaio', zampognaro: 'Bottega delle zampogne', casaro: 'Caseificio', impagliatore: 'Sediaro', massaro: 'Masseria' };
const FORT_NAME = ['Nessuna difesa', 'Palizzata', 'Mura', 'Torre di guardia'];
const BRIG_RISK = [0.3, 0.17, 0.08, 0.02];
const BRIG_EVERY = 6 * HOUR;
const statsAt = (id, lvl) => { const b = BASE[UNIT_INFO[id].r]; return { hp: Math.round(b.hp * (1 + 0.13 * (lvl - 1))), atk: Math.round(b.atk * (1 + 0.11 * (lvl - 1))) }; };
const trainCost = (lvl) => Math.round(25 * Math.pow(lvl, 1.7));
const MAX_UL = 40;

function conq() {
  if (!P.conq) {
    P.conq = { season: 1, q: TOWNS.map((t, i) => ({ stage: i === 0 ? 'battle' : 'locked', had: false, bott: 0, fort: 0, last: Date.now(), brig: false })),
      units: { contadino: 1, pescatore: 1, pastore: 1 }, squad: ['contadino', 'pescatore', 'pastore'], lastBrig: Date.now(), log: ['Il viaggio comincia da Tropea. Tre amici sono con te: il contadino, il pescatore e il pastore.'], kings: 0,
      aspro: { seen: {}, exp: null } };
  }
  return P.conq;
}
const lvOf = (i) => TOWNS[i].lv + (conq().season - 1) * 6 + (conq().q[i].brig ? 2 : 0);
function cLog(t) { const C = conq(); C.log.unshift(t); C.log = C.log.slice(0, 6); }
function conqTick() {
  const C = conq(), now = Date.now();
  let n = 0;
  while (now - C.lastBrig >= BRIG_EVERY && n < 2) {
    C.lastBrig += BRIG_EVERY; n++;
    const owned = C.q.map((q, i) => i).filter((i) => C.q[i].stage === 'owned');
    if (!owned.length) continue;
    const i = owned[Math.floor(Math.random() * owned.length)];
    if (Math.random() < BRIG_RISK[C.q[i].fort]) {
      collectTown(i);
      C.q[i].stage = 'battle'; C.q[i].brig = true;
      cLog('I briganti hanno occupato ' + TOWNS[i].name + '! Riprenditela.');
    }
  }
  if (now - C.lastBrig >= BRIG_EVERY) C.lastBrig = now;
}
const prodRate = (i) => 10 * (i + 1) * conq().q[i].bott * conq().season; // carlini l'ora
function townStock(i) { const q = conq().q[i]; if (q.stage !== 'owned' || !q.bott) return 0; return Math.floor(Math.min(8 * HOUR, Date.now() - q.last) / HOUR * prodRate(i)); }
function collectTown(i) { const n = townStock(i), q = conq().q[i]; if (n) eco().carlini += n; q.last = Date.now(); return n; }
const asproBonus = () => Object.keys(conq().aspro.seen).length * 0.02; // ogni animale scoperto: +2% forza

/* ---------- mappa ---------- */
let conqSel = 0, conqView = 'map';
const CAL_PATH = 'M100 10 L196 8 L222 50 L246 92 L272 132 L254 150 L226 176 L206 206 L230 246 L234 296 L226 352 L202 410 L162 458 L120 450 L86 418 L66 372 L80 320 L100 270 L98 240 L74 220 L98 192 L94 150 L88 104 L80 58 Z';
function renderConq() {
  conqTick();
  const C = conq();
  if (BT && BT.over && !$('layer').innerHTML) { BT = null; conqView = 'map'; }
  if (conqView === 'battle' && !BT) conqView = 'map';
  if (conqView === 'battle' && BT) { renderBattle(); return; }
  if (conqView === 'aspro') { renderAspro(); return; }
  if (conqView === 'squad') { renderSquad(); return; }
  const owned = C.q.filter((q) => q.stage === 'owned').length;
  let map = '<div class="cmap"><svg viewBox="0 0 300 480" aria-hidden="true"><defs><linearGradient id="csea" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7DB7D8"/><stop offset="1" stop-color="#3E8CC4"/></linearGradient></defs>' +
    '<rect width="300" height="480" fill="url(#csea)"/>' +
    '<g opacity="0.35" stroke="#fff" stroke-width="1" fill="none"><path d="M20 120 q10 -4 20 0 t20 0"/><path d="M240 280 q10 -4 20 0 t20 0"/><path d="M30 300 q10 -4 20 0 t20 0"/><path d="M250 60 q10 -4 20 0 t20 0"/></g>' +
    '<text x="10" y="300" font-size="11" fill="#E8F4FA" font-style="italic">Mar Tirreno</text><text x="232" y="230" font-size="11" fill="#E8F4FA" font-style="italic">Mar Ionio</text>' +
    '<path d="' + CAL_PATH + '" fill="#B9CF8A" stroke="#1A1A1A" stroke-width="2.5" stroke-linejoin="round"/>' +
    '<path d="M150 40 Q180 90 200 120 M130 330 Q150 370 170 400" stroke="#8FAE63" stroke-width="16" stroke-linecap="round" fill="none" opacity="0.7"/>' +
    '<path d="' + TOWNS.map((t, i) => (i ? 'L' : 'M') + t.x + ' ' + t.y).join(' ') + '" stroke="#6B4424" stroke-width="2" stroke-dasharray="4 4" fill="none"/>' +
    '<text x="12" y="462" font-size="10" fill="#E8F4FA">⬋ Sicilia</text></svg>';
  TOWNS.forEach((t, i) => {
    const q = C.q[i];
    const cls = 'cnode ' + q.stage + (q.brig ? ' brig' : '') + (conqSel === i ? ' sel' : '');
    map += '<button class="' + cls + '" data-town="' + i + '" style="left:' + (t.x / 3) + '%;top:' + (t.y / 4.8) + '%" aria-label="' + t.name + '"><img src="' + AVIMG[t.boss] + '" alt=""><span>' + t.name + '</span></button>';
  });
  const aOpen = C.q[ASPRO.after].had;
  map += '<button class="cnode aspro' + (aOpen ? '' : ' locked') + '" data-aspro="1" style="left:' + (ASPRO.x / 3) + '%;top:' + (ASPRO.y / 4.8) + '%" aria-label="Aspromonte"><b>⛰</b><span>Aspromonte</span></button></div>';
  let h = '<div class="chead"><div><b>' + (C.kings ? 'Re della Calabria · stagione ' + C.season : 'Stagione ' + C.season) + '</b><small>' + owned + ' paesi su ' + TOWNS.length + ' · forza degli animali +' + Math.round(asproBonus() * 100) + '%</small></div><button class="btn small" data-c="squad">La squadra</button></div>' + map;
  h += townPanel(conqSel);
  h += '<div class="shlog">' + C.log.slice(0, 3).map((l, i) => '<div' + (i ? '' : ' class="new"') + '>' + l + '</div>').join('') + '</div>';
  const total = C.q.reduce((s, q, i) => s + townStock(i), 0);
  if (total) h += '<button class="btn take" data-c="collectall">Ritira tutto dalle botteghe (+' + total + ' carlini)</button>';
  if (C.q[TOWNS.length - 1].stage === 'owned' && C.q.every((q) => q.stage === 'owned')) h += '<div class="season"><b>Tutta la Calabria è tua!</b><p>Inizia una nuova stagione: i paesi tornano da conquistare, più forti, e le botteghe rendono di più.</p><button class="btn" data-c="season">Nuova stagione</button></div>';
  $('conqBox').innerHTML = h;
  renderRes();
}
function townPanel(i) {
  const C = conq(), t = TOWNS[i], q = C.q[i], L = lvOf(i);
  let h = '<div class="tpanel"><div class="tphead"><img src="' + AVIMG[t.boss] + '" alt=""><div><h3>' + t.name + '</h3><small>' + t.desc + '</small></div></div>';
  if (q.stage === 'locked') return h + '<p class="pgnote">Prima conquista ' + TOWNS[i - 1].name + '.</p></div>';
  if (q.stage === 'battle') {
    h += '<p>' + (q.brig ? 'I <b>briganti</b> hanno occupato il paese. Battili e poi sfida il loro capo a ' + GAMES[t.game].toLowerCase() + '.' : 'Difensore: <b>' + UNIT_NAME[t.boss] + '</b> e la sua squadra. Battili in battaglia, poi vinci la sfida a ' + GAMES[t.game].toLowerCase() + '.') + '</p>' +
      '<div class="tpstats"><span>Livello nemici <b>' + L + '</b></span><span>La tua squadra <b>' + squadPower() + '</b></span></div>' +
      '<button class="btn take" data-c="fight">Alla battaglia!</button>';
  }
  if (q.stage === 'cards') h += '<p>Hai vinto la battaglia! Ora ' + (q.brig ? 'il capo dei briganti' : '<b>' + UNIT_NAME[t.boss] + '</b>') + ' ti sfida a <b>' + GAMES[t.game].toLowerCase() + '</b>: vinci e il paese è tuo.</p><button class="btn take" data-c="cards">Sfida a ' + GAMES[t.game].toLowerCase() + '</button>';
  if (q.stage === 'owned') {
    const st = townStock(i), bn = BOTT_NAME[t.boss];
    h += '<div class="build"><div><b>' + bn + (q.bott ? ' · livello ' + q.bott : '') + '</b><small>' + (q.bott ? 'Rende ' + prodRate(i) + ' carlini l’ora (al massimo 8 ore).' : 'Costruiscila: ti fa guadagnare carlini anche quando non giochi.') + '</small></div>' +
      (q.bott < 5 ? '<button class="btn small" data-c="bott"' + (eco().carlini >= bottCost(i) ? '' : ' disabled') + '>' + (q.bott ? 'Migliora' : 'Costruisci') + '<small>' + bottCost(i) + ' carlini</small></button>' : '<span class="maxed">Al massimo!</span>') + '</div>' +
      (st ? '<button class="btn small take" data-c="collect">Ritira ' + st + ' carlini</button>' : '') +
      '<div class="build"><div><b>' + FORT_NAME[q.fort] + '</b><small>I briganti attaccano ogni tanto: più difese hai, meno ci riescono.</small></div>' +
      (q.fort < 3 ? '<button class="btn small" data-c="fort"' + (eco().carlini >= fortCost(i) ? '' : ' disabled') + '>' + FORT_NAME[q.fort + 1] + '<small>' + fortCost(i) + ' carlini</small></button>' : '<span class="maxed">Inespugnabile!</span>') + '</div>';
  }
  return h + '</div>';
}
const bottCost = (i) => 120 * (i + 1) * (conq().q[i].bott + 1);
const fortCost = (i) => 200 * (i + 1) * (conq().q[i].fort + 1);
function squadPower() { const C = conq(); return C.squad.reduce((s, id) => s + (C.units[id] || 1), 0); }

/* ---------- la squadra ---------- */
function renderSquad() {
  const C = conq(), E = eco();
  let h = '<div class="chead"><div><b>La squadra</b><small>Scegli fino a 3 personaggi e allenali con i carlini. I difensori dei paesi conquistati si uniscono a te.</small></div><button class="btn small ghost" data-c="map">Mappa</button></div><div class="units">';
  for (const id of Object.keys(C.units)) {
    const L = C.units[id], s = statsAt(id, L), inS = C.squad.includes(id), suit = UNIT_INFO[id].suit;
    h += '<div class="unit' + (inS ? ' in' : '') + '"><img class="usprite" src="' + SPRITE[id] + '" alt=""><div class="uinfo"><b>' + UNIT_NAME[id] + ' <small>liv. ' + L + '</small></b><small><img class="usuit" src="' + AVIMG[suit] + '" alt="">' + SUIT_NAME[suit] + ': ' + SUIT_POWER[suit].pass + '</small><small class="usp">' + SPECIALS[id].e[0] + ' <b>' + SPECIALS[id].n + '</b>: ' + SPECIALS[id].d + '</small><small>Vita ' + s.hp + ' · Forza ' + s.atk + '</small></div>' +
      '<div class="ubtns"><button class="btn small' + (inS ? ' take' : ' ghost') + '" data-c="pick" data-u="' + id + '">' + (inS ? 'In squadra' : 'Scegli') + '</button>' +
      (L < MAX_UL ? '<button class="btn small" data-c="train" data-u="' + id + '"' + (E.carlini >= trainCost(L) ? '' : ' disabled') + '>Allena<small>' + trainCost(L) + '</small></button>' : '') + '</div></div>';
  }
  h += '</div><p class="pgnote">Ogni personaggio ha la sua mossa speciale, che si carica attaccando. Anche i capi nemici hanno la loro: attento quando arriva!</p>';
  $('conqBox').innerHTML = h;
  renderRes();
}

/* ---------- battaglia: personaggi in piedi, scenari dei paesi, mosse speciali ---------- */
const SPECIALS = {
  contadino: { n: 'Raccolto dell’orto', t: 'heal', v: 0.3, e: ['🍅', '🫑', '🥕'], k: 'heal', d: 'pomodori e peperoni curano tutta la squadra' },
  raccoglitrice: { n: 'Cascata di olive', t: 'all', v: 0.8, e: ['🫒'], k: 'roll', d: 'una valanga di olive rotola su tutti i nemici' },
  massaro: { n: 'Bastonata del massaro', t: 'single', v: 2.3, e: ['🪵'], k: 'fly', d: 'un colpo potentissimo su un nemico' },
  pescatore: { n: 'Rete a strascico', t: 'all', v: 0.75, e: ['🐟', '🐠'], k: 'rain', d: 'una pioggia di pesci su tutti i nemici' },
  rammendatrice: { n: 'Rete rammendata', t: 'shield', v: 0, e: ['🕸️'], k: 'shield', d: 'la rete protegge la squadra: danni dimezzati per due turni' },
  lanzaturi: { n: 'Fiocinata', t: 'single', v: 2.5, e: ['🔱'], k: 'fly', d: 'la fiocina colpisce un nemico con forza enorme' },
  pastore: { n: 'Gregge in carica', t: 'all', v: 0.85, e: ['🐑', '🐏'], k: 'run', d: 'il gregge travolge tutti i nemici' },
  tessitrice: { n: 'Telaio fatato', t: 'shield', v: 0.15, e: ['🧶'], k: 'shield', d: 'protegge la squadra e la cura un po’' },
  casaro: { n: 'Ricotta bollente', t: 'weaken', v: 0.6, e: ['🧀', '♨️'], k: 'rain', d: 'colpisce tutti e i nemici perdono forza per due turni' },
  pastaia: { n: 'Pioggia di fileja', t: 'stun', v: 1.1, e: ['🍝'], k: 'rain', d: 'la pasta impiccia i nemici, che saltano il turno' },
  impagliatore: { n: 'Sedie volanti', t: 'all', v: 0.8, e: ['🪑'], k: 'fly', d: 'sedie impagliate volano su tutti i nemici' },
  zampognaro: { n: 'Tarantella', t: 'stun', v: 1.3, e: ['🎶', '🎵'], k: 'notes', d: 'la zampogna fa ballare i nemici, che saltano il turno' },
};
let BT = null;
function mkUnit(id, lvl, side, boss) {
  const s = statsAt(id, lvl), k = side === 0 ? 1 + asproBonus() : 1;
  const hp = Math.round(s.hp * (boss ? 1.3 : 1) * k);
  return { id, side, lvl, suit: UNIT_INFO[id].suit, r: UNIT_INFO[id].r, max: hp, hp, atk: Math.round(s.atk * k * (boss ? 1.1 : 1)), boss: !!boss, name: (boss && side === 1 && conq().q[BT_town].brig ? 'Capo brigante' : UNIT_NAME[id]) };
}
let BT_town = 0;
function startBattle(i) {
  const C = conq(), t = TOWNS[i], L = lvOf(i);
  BT_town = i;
  const others = Object.keys(UNIT_INFO).filter((x) => x !== t.boss);
  const pick = () => others.splice(Math.floor(Math.random() * others.length), 1)[0];
  BT = { town: i, mine: C.squad.map((id) => mkUnit(id, C.units[id], 0)), foe: [], sel: 0, meter: 0, turn: 0, shield: 0, foeShield: 0, weakFoe: 0, weakMine: 0, stun: false, pstun: false, busy: false, msg: 'Tocca un tuo personaggio, poi il nemico da colpire.', over: null };
  BT.foe = [mkUnit(pick(), Math.max(1, L - 1), 1), mkUnit(t.boss, L, 1, true), mkUnit(pick(), Math.max(1, L - 1), 1)];
  conqView = 'battle'; renderConq();
}
/* scenari */
function sky(c1, c2) { return '<defs><linearGradient id="bsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></linearGradient><linearGradient id="bsea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3E9AD0"/><stop offset="1" stop-color="#1F6FA3"/></linearGradient></defs><rect width="360" height="300" fill="url(#bsky)"/>'; }
const SUN = '<circle cx="300" cy="44" r="20" fill="#F7D44C" opacity="0.95"/>';
const CLOUDS = '<g fill="#fff" opacity="0.9"><ellipse cx="70" cy="40" rx="26" ry="9"/><ellipse cx="88" cy="34" rx="16" ry="9"/><ellipse cx="200" cy="26" rx="18" ry="6"/></g>';
function sea(y) { return '<rect x="0" y="' + y + '" width="360" height="' + (300 - y) + '" fill="url(#bsea)"/><g stroke="#BFE3F5" stroke-width="2" fill="none" opacity="0.7"><path d="M20 ' + (y + 14) + ' q8 -4 16 0 t16 0"/><path d="M150 ' + (y + 26) + ' q8 -4 16 0 t16 0"/><path d="M260 ' + (y + 10) + ' q8 -4 16 0 t16 0"/><path d="M90 ' + (y + 40) + ' q8 -4 16 0 t16 0"/></g>'; }
function ground(c1, c2) { return '<path d="M0 196 Q90 184 180 192 Q270 182 360 194 V300 H0Z" fill="' + c1 + '" stroke="#1A1A1A" stroke-width="1.5"/><path d="M0 250 Q120 240 240 248 Q300 244 360 250 V300 H0Z" fill="' + c2 + '"/>'; }
const houses = (x, y, n, s) => Array.from({ length: n }, (_, i) => { const hx = x + i * 14 * s, hy = y - (i % 3) * 5 * s; return '<rect x="' + hx + '" y="' + hy + '" width="' + 12 * s + '" height="' + 10 * s + '" fill="' + ['#F4EBDD', '#F2D6A8', '#E9C9A0', '#FBF6EA'][i % 4] + '" stroke="#1A1A1A" stroke-width="0.8"/><path d="M' + (hx - 1) + ' ' + hy + ' L' + (hx + 6 * s) + ' ' + (hy - 5 * s) + ' L' + (hx + 13 * s) + ' ' + hy + 'Z" fill="#C8562E" stroke="#1A1A1A" stroke-width="0.8"/>'; }).join('');
const SCENES = {
  tropea: () => sky('#8FD0F0', '#E8F4F8') + SUN + CLOUDS + sea(118) +
    '<path d="M40 150 Q50 100 80 92 Q110 96 118 150Z" fill="#C9A77A" stroke="#1A1A1A" stroke-width="1.5"/><rect x="66" y="74" width="22" height="18" fill="#FBF6EA" stroke="#1A1A1A"/><path d="M64 74 L77 64 L90 74Z" fill="#C8562E" stroke="#1A1A1A"/><rect x="84" y="64" width="6" height="12" fill="#FBF6EA" stroke="#1A1A1A"/>' +
    '<path d="M250 118 Q280 80 360 76 V130 H250Z" fill="#B99368" stroke="#1A1A1A" stroke-width="1.5"/>' + houses(268, 84, 6, 1) +
    '<path d="M0 196 Q90 186 180 194 Q270 184 360 196 V300 H0Z" fill="#EAD7A6" stroke="#1A1A1A" stroke-width="1.5"/><path d="M0 255 Q140 246 360 256 V300 H0Z" fill="#DCC48E"/>',
  pizzo: () => sky('#9AD3EE', '#F3EAD0') + SUN + CLOUDS + sea(126) +
    '<path d="M200 128 Q230 70 300 66 Q340 70 360 90 V140 H200Z" fill="#B99A6E" stroke="#1A1A1A" stroke-width="1.5"/>' +
    '<g stroke="#1A1A1A" stroke-width="1.2" fill="#D9C7A3"><rect x="236" y="44" width="56" height="30"/><rect x="226" y="30" width="18" height="44"/><rect x="284" y="34" width="18" height="40"/><path d="M226 30 h4 v-5 h4 v5 h4 v-5 h4 v5 h2" fill="none"/></g>' + houses(150, 116, 4, 1) + ground('#C9B98A', '#B9A977'),
  bagnara: () => sky('#87C9EC', '#E9F2F4') + SUN + CLOUDS + sea(110) +
    '<g transform="translate(150 118)"><path d="M-60 12 L60 12 L48 26 L-48 26Z" fill="#6E4A2C" stroke="#1A1A1A" stroke-width="1.4"/><path d="M0 12 V-70" stroke="#5A3A20" stroke-width="3"/><path d="M-8 -66 h16 v8 h-16z" fill="#8A5A32" stroke="#1A1A1A"/><path d="M60 14 L118 6" stroke="#5A3A20" stroke-width="3"/><circle cx="2" cy="-74" r="3" fill="#1A1A1A"/></g>' +
    '<path d="M0 90 Q40 60 90 80 L90 120 H0Z" fill="#7FA35B" stroke="#1A1A1A" stroke-width="1.2"/>' + houses(8, 96, 5, 0.9) + ground('#BFAE88', '#A99A76'),
  scilla: () => sky('#8CCBEE', '#F0EBDA') + SUN + CLOUDS + sea(120) +
    '<path d="M240 124 Q250 70 300 60 Q340 66 350 124Z" fill="#9E8A6A" stroke="#1A1A1A" stroke-width="1.5"/><g fill="#D2C3A2" stroke="#1A1A1A" stroke-width="1.2"><rect x="270" y="36" width="50" height="26"/><rect x="262" y="26" width="14" height="36"/><path d="M262 26 h3 v-4 h4 v4 h3 v-4 h4 v4" fill="none"/></g>' +
    '<g>' + houses(20, 112, 9, 1.1) + '</g><path d="M10 124 H190" stroke="#1A1A1A" stroke-width="1"/>' + ground('#C7B794', '#B3A27F'),
  reggio: () => sky('#8DCDF0', '#F6EBD3') + SUN + sea(130) +
    '<path d="M0 132 L40 118 L90 124 L150 96 L178 80 L200 92 L260 118 L360 126 V136 H0Z" fill="#8E9E8A" stroke="#1A1A1A" stroke-width="1.2" opacity="0.9"/><path d="M166 88 L178 80 L190 88Z" fill="#fff"/><g fill="#ddd" opacity="0.8"><ellipse cx="184" cy="66" rx="10" ry="5"/><ellipse cx="196" cy="56" rx="12" ry="6"/></g>' +
    '<g stroke="#1A1A1A" stroke-width="1.2"><path d="M40 196 Q44 160 42 130" stroke="#7A5230" stroke-width="5" fill="none"/><path d="M42 130 q-24 -4 -30 10 M42 130 q24 -6 30 8 M42 130 q-14 -16 -28 -14 M42 130 q16 -16 30 -10" stroke="#3E7D3E" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M320 196 Q324 166 322 140" stroke="#7A5230" stroke-width="5" fill="none"/><path d="M322 140 q-24 -4 -30 10 M322 140 q24 -6 30 8 M322 140 q-14 -16 -28 -14" stroke="#3E7D3E" stroke-width="5" fill="none" stroke-linecap="round"/></g>' + ground('#D8C9A6', '#C9B78F'),
  locri: () => sky('#9FD6F2', '#F5E9C8') + SUN + CLOUDS + sea(132) +
    '<path d="M0 140 Q120 124 360 136 V160 H0Z" fill="#C8B58A"/>' +
    '<g fill="#F0E6CF" stroke="#1A1A1A" stroke-width="1.2"><rect x="110" y="70" width="150" height="10"/><path d="M104 70 L185 44 L266 70Z"/>' + [118, 142, 166, 190, 214, 238].map((x, i) => '<rect x="' + x + '" y="80" width="10" height="' + (i === 4 ? 30 : 64) + '"/>').join('') + '<rect x="100" y="144" width="170" height="8"/></g><g fill="#E6DBC2" stroke="#1A1A1A" stroke-width="1"><rect x="40" y="150" width="20" height="8" transform="rotate(-8 50 154)"/><rect x="290" y="146" width="12" height="40"/></g>' + ground('#D1BF92', '#BFAD80'),
  gerace: () => sky('#9CCFEA', '#F2E7CF') + SUN + CLOUDS +
    '<path d="M0 150 Q80 90 170 70 Q260 90 360 150 V200 H0Z" fill="#8FA86A" stroke="#1A1A1A" stroke-width="1.5"/>' +
    '<g>' + houses(110, 76, 9, 1) + '</g><g fill="#E9DCC0" stroke="#1A1A1A" stroke-width="1"><rect x="150" y="44" width="10" height="28"/><path d="M148 44 L155 34 L162 44Z" fill="#C8562E"/><rect x="200" y="50" width="22" height="20"/><path d="M200 50 a11 11 0 0 1 22 0" fill="#B9A27A"/><rect x="120" y="54" width="8" height="20"/><path d="M118 54 L124 46 L130 54Z" fill="#C8562E"/></g>' + ground('#A9BF7A', '#93AA66'),
  sila: () => sky('#A6D6EE', '#EAF2E2') + CLOUDS +
    '<path d="M0 120 L60 70 L110 100 L170 60 L230 96 L290 66 L360 104 V140 H0Z" fill="#5E7F55" stroke="#1A1A1A" stroke-width="1.3"/><ellipse cx="180" cy="160" rx="120" ry="16" fill="#5AA2C8" stroke="#1A1A1A" stroke-width="1.2"/>' +
    [14, 40, 70, 280, 306, 334].map((x, i) => '<g transform="translate(' + x + ' ' + (190 - (i % 2) * 8) + ')"><rect x="-2" y="-8" width="4" height="12" fill="#6B4424"/><path d="M0 -60 L14 -8 H-14Z" fill="#2F5D34" stroke="#1A1A1A" stroke-width="1"/><path d="M0 -72 L10 -36 H-10Z" fill="#3A6E3E" stroke="#1A1A1A" stroke-width="1"/></g>').join('') + ground('#7FA25E', '#6C8F4E'),
  cosenza: () => sky('#9DCDEA', '#F1E5CC') + SUN + CLOUDS +
    '<path d="M0 140 Q90 70 180 80 Q270 70 360 140 V200 H0Z" fill="#9BB070" stroke="#1A1A1A" stroke-width="1.5"/>' +
    '<g fill="#D8C7A0" stroke="#1A1A1A" stroke-width="1.1"><rect x="160" y="56" width="50" height="24"/><rect x="152" y="46" width="14" height="34"/><rect x="204" y="48" width="14" height="32"/></g>' + houses(80, 104, 14, 1) + '<path d="M0 182 Q120 170 200 178 Q280 186 360 176" stroke="#4E95C0" stroke-width="7" fill="none"/>' + ground('#B6B98A', '#A2A677'),
};
function sceneSVG(i) { return '<svg class="bscene" viewBox="0 0 360 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + (SCENES[TOWNS[i].id] || SCENES.tropea)() + '</svg>'; }
const SLOT_X = [18, 50, 82];
function fighterHTML(u, i, side) {
  const dead = u.hp <= 0, sel = side === 0 && BT.sel === i && !dead;
  const brig = side === 1 && conq().q[BT.town].brig;
  return '<button class="stander s' + side + (dead ? ' dead' : '') + (sel ? ' sel' : '') + (u.boss ? ' boss' : '') + (brig ? ' brigand' : '') + '" data-f="' + side + '-' + i + '" style="left:' + SLOT_X[i] + '%"' + (dead ? ' disabled' : '') + ' aria-label="' + u.name + '">' +
    '<span class="plate"><b>' + u.name + '</b><small>liv. ' + u.lvl + '</small><i class="hpbar"><em style="width:' + Math.max(0, Math.round(u.hp / u.max * 100)) + '%"></em></i><small class="hpn">' + Math.max(0, u.hp) + '/' + u.max + '</small></span>' +
    '<span class="body"><img src="' + SPRITE[u.id] + '" alt="" draggable="false"></span><span class="feet"></span></button>';
}
function renderBattle() {
  const t = TOWNS[BT.town], me = BT.mine[BT.sel], sp = me ? SPECIALS[me.id] : null;
  let h = '<div class="chead"><div><b>Battaglia a ' + t.name + '</b><small>' + (conq().q[BT.town].brig ? 'Contro i briganti' : 'Contro la squadra di ' + UNIT_NAME[t.boss]) + '</small></div><button class="btn small ghost" data-c="flee">Ritirati</button></div>' +
    '<div class="arena2" id="arena">' + sceneSVG(BT.town) + '<div class="frow2 foe">' + BT.foe.map((u, i) => fighterHTML(u, i, 1)).join('') + '</div><div class="frow2 mine">' + BT.mine.map((u, i) => fighterHTML(u, i, 0)).join('') + '</div><div class="bmsg2" id="bmsg">' + BT.msg + '</div></div>';
  const ready = BT.meter >= 3 && me && me.hp > 0;
  h += '<div class="bact"><div class="meter" aria-label="Mossa speciale">' + [0, 1, 2].map((k) => '<i class="' + (k < BT.meter ? 'on' : '') + '"></i>').join('') + '</div>' +
    '<button class="btn take spbtn' + (ready ? ' ready' : '') + '" data-c="special"' + (ready && !BT.busy ? '' : ' disabled') + '>' + (sp ? sp.e[0] + ' ' + sp.n : 'Mossa speciale') + '</button></div>' +
    (sp ? '<p class="pgnote">' + me.name + ': ' + sp.n + ', ' + sp.d + '.' + (BT.meter < 3 ? ' Si carica attaccando.' : '') + '</p>' : '');
  $('conqBox').innerHTML = h;
}
const alive = (arr) => arr.filter((u) => u.hp > 0);
function fEl(u) { const arr = u.side === 0 ? BT.mine : BT.foe; return $('conqBox').querySelector('[data-f="' + u.side + '-' + arr.indexOf(u) + '"]'); }
function floatAt(el, text, cls) {
  if (!el) return;
  const r = (el.querySelector('.body') || el).getBoundingClientRect(), f = document.createElement('div');
  f.className = 'floaty dmg ' + (cls || ''); f.textContent = text;
  f.style.left = (r.left + r.width / 2) + 'px'; f.style.top = (r.top + r.height * 0.3) + 'px';
  document.body.appendChild(f); setTimeout(() => f.remove(), 1100);
}
function anim(el, cls) { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
function centerIn(el, box) { const r = (el.querySelector('.body') || el).getBoundingClientRect(), b = box.getBoundingClientRect(); return { x: r.left - b.left + r.width / 2, y: r.top - b.top + r.height / 2, w: r.width, h: r.height }; }
/* proiettili delle mosse speciali */
function throwFx(fromU, toUs, sp) {
  const box = $('arena'); if (!box) return 600;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return 200;
  const from = centerIn(fEl(fromU), box);
  const mk = (txt, x, y, size) => { const s = document.createElement('span'); s.className = 'proj'; s.textContent = txt; s.style.left = x + 'px'; s.style.top = y + 'px'; s.style.fontSize = (size || 30) + 'px'; box.appendChild(s); return s; };
  let longest = 700;
  toUs.forEach((u, ti) => {
    const to = centerIn(fEl(u), box);
    const n = sp.k === 'fly' ? 1 : sp.k === 'shield' ? 1 : 4;
    for (let k = 0; k < n; k++) {
      const em = sp.e[k % sp.e.length], delay = ti * 90 + k * 110;
      let el, frames, dur = 700;
      if (sp.k === 'roll') { el = mk(em, from.x, from.y + from.h * 0.3, 26); const dx = to.x - from.x + (k - 1.5) * 14, dy = to.y + to.h * 0.25 - from.y - from.h * 0.3; frames = [{ transform: 'translate(-50%,-50%) translate(0,0) rotate(0)' }, { transform: 'translate(-50%,-50%) translate(' + dx * 0.5 + 'px,' + (dy * 0.5 - 20) + 'px) rotate(360deg)', offset: 0.5 }, { transform: 'translate(-50%,-50%) translate(' + dx + 'px,' + dy + 'px) rotate(900deg)', opacity: 0.2 }]; dur = 800; }
      else if (sp.k === 'rain') { const sx = to.x + (k - 1.5) * 18; el = mk(em, sx, -30, 28); frames = [{ transform: 'translate(-50%,-50%) translateY(0) rotate(0)', opacity: 1 }, { transform: 'translate(-50%,-50%) translateY(' + (to.y + 30) + 'px) rotate(' + (k % 2 ? 200 : -200) + 'deg)', opacity: 0.3 }]; dur = 750; }
      else if (sp.k === 'run') { const y = to.y + to.h * 0.25 + (k % 2) * 12; el = mk(em, -40, y, 32); const w = box.clientWidth + 80; frames = [{ transform: 'translate(-50%,-50%) translateX(0) scaleX(-1)' }, { transform: 'translate(-50%,-50%) translateX(' + w * 0.5 + 'px) translateY(-10px) scaleX(-1)', offset: 0.5 }, { transform: 'translate(-50%,-50%) translateX(' + w + 'px) scaleX(-1)' }]; dur = 900; if (ti > 0) { el.remove(); continue; } }
      else if (sp.k === 'notes') { el = mk(em, from.x, from.y, 26); const dx = to.x - from.x, dy = to.y - from.y; frames = [{ transform: 'translate(-50%,-50%) translate(0,0)' }, { transform: 'translate(-50%,-50%) translate(' + (dx * 0.33 + 20) + 'px,' + dy * 0.33 + 'px)', offset: 0.33 }, { transform: 'translate(-50%,-50%) translate(' + (dx * 0.66 - 20) + 'px,' + dy * 0.66 + 'px)', offset: 0.66 }, { transform: 'translate(-50%,-50%) translate(' + dx + 'px,' + dy + 'px) scale(1.4)', opacity: 0.2 }]; dur = 900; }
      else if (sp.k === 'heal') { el = mk(em, to.x + (k - 1.5) * 16, to.y + to.h * 0.4, 24); frames = [{ transform: 'translate(-50%,-50%) translateY(0) scale(0.5)', opacity: 0 }, { transform: 'translate(-50%,-50%) translateY(-30px) scale(1.1)', opacity: 1, offset: 0.4 }, { transform: 'translate(-50%,-50%) translateY(-70px) scale(0.8)', opacity: 0 }]; dur = 900; }
      else if (sp.k === 'shield') { el = mk(em, to.x, to.y, 64); el.classList.add('shieldfx'); frames = [{ transform: 'translate(-50%,-50%) scale(0.2)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1.3)', opacity: 0.9, offset: 0.5 }, { transform: 'translate(-50%,-50%) scale(1.1)', opacity: 0 }]; dur = 1000; }
      else { el = mk(em, from.x, from.y, 34); const dx = to.x - from.x, dy = to.y - from.y; frames = [{ transform: 'translate(-50%,-50%) translate(0,0) rotate(0)' }, { transform: 'translate(-50%,-50%) translate(' + dx * 0.5 + 'px,' + (dy * 0.5 - 40) + 'px) rotate(' + (sp.t === 'single' ? 0 : 360) + 'deg) scale(1.3)', offset: 0.5 }, { transform: 'translate(-50%,-50%) translate(' + dx + 'px,' + dy + 'px) rotate(' + (sp.t === 'single' ? 0 : 720) + 'deg)', opacity: 0.4 }]; dur = 650; }
      const a = el.animate(frames, { duration: dur, delay, easing: 'ease-in', fill: 'both' });
      a.onfinish = () => el.remove();
      longest = Math.max(longest, dur + delay);
    }
  });
  return longest;
}
function hit(att, tgt, mult) {
  let d = att.atk * (0.85 + Math.random() * 0.3) * (mult || 1), crit = false;
  if ((att.side === 1 && BT.weakFoe > 0) || (att.side === 0 && BT.weakMine > 0)) d *= 0.7;
  if (att.suit === 'bottega' && Math.random() < 0.2) { d *= 1.8; crit = true; }
  if (tgt.suit === 'montagna') d *= 0.75;
  if (tgt.side === 0 && BT.shield > 0) d *= 0.5;
  if (tgt.side === 1 && BT.foeShield > 0) d *= 0.5;
  d = Math.max(1, Math.round(d));
  tgt.hp = Math.max(0, tgt.hp - d);
  return { d, crit };
}
function strike(att, tgt, mult) {
  const r = hit(att, tgt, mult);
  let total = r.d, txt = '-' + r.d + (r.crit ? '!' : '');
  if (att.suit === 'mare' && tgt.hp > 0 && Math.random() < 0.25) { const r2 = hit(att, tgt, 0.5 * (mult || 1)); total += r2.d; txt += ' -' + r2.d; }
  return { total, txt, crit: r.crit };
}
function campagnaHeal(team) {
  for (const u of alive(team)) if (u.suit === 'campagna') { const k = u.r === 8 ? 0.05 : 0.03; for (const v of alive(team)) v.hp = Math.min(v.max, v.hp + Math.round(v.max * k)); }
}
function syncBars() {
  for (const u of BT.mine.concat(BT.foe)) {
    const el = fEl(u); if (!el) continue;
    el.querySelector('.hpbar em').style.width = Math.round(u.hp / u.max * 100) + '%';
    el.querySelector('.hpn').textContent = u.hp + '/' + u.max;
    if (u.hp <= 0 && !el.classList.contains('dead')) { el.classList.add('dead'); el.disabled = true; }
  }
  const m = $('bmsg'); if (m) m.textContent = BT.msg;
}
function playerAttack(ti) {
  if (BT.busy || BT.over) return;
  const me = BT.mine[BT.sel], tgt = BT.foe[ti];
  if (!me || me.hp <= 0 || !tgt || tgt.hp <= 0) return;
  BT.busy = true;
  anim(fEl(me), 'lunge');
  setTimeout(() => {
    const r = strike(me, tgt);
    anim(fEl(tgt), 'hurt'); floatAt(fEl(tgt), r.txt, r.crit ? 'crit' : '');
    fx(r.crit ? 'big' : 'card');
    BT.msg = me.name + ' colpisce ' + tgt.name + ' (' + r.total + ')' + (tgt.hp <= 0 ? ': fuori combattimento!' : '.');
    BT.meter = Math.min(3, BT.meter + 1);
    campagnaHeal(BT.mine);
    afterPlayer();
  }, 260);
}
/* applica una mossa speciale (vale per te e per il capo nemico) */
function doSpecial(att, done) {
  const sp = SPECIALS[att.id], mineSide = att.side === 0;
  const allies = alive(mineSide ? BT.mine : BT.foe), foes = alive(mineSide ? BT.foe : BT.mine);
  anim(fEl(att), 'cast'); fx('big');
  const banner = document.createElement('div'); banner.className = 'spbanner' + (mineSide ? '' : ' foe'); banner.textContent = sp.e[0] + ' ' + sp.n + '!';
  $('arena') && $('arena').appendChild(banner); setTimeout(() => banner.remove(), 1500);
  let targets = foes;
  if (sp.t === 'single' || sp.t === 'stun') targets = [foes.slice().sort((a, b) => (b.boss - a.boss) || (a.hp - b.hp))[0]].filter(Boolean);
  if (sp.t === 'heal' || sp.t === 'shield') targets = allies;
  const wait = throwFx(att, targets, sp);
  setTimeout(() => {
    if (sp.t === 'all' || sp.t === 'weaken') for (const u of targets) { const r = strike(att, u, sp.v); anim(fEl(u), 'hurt'); floatAt(fEl(u), r.txt); }
    if (sp.t === 'single' || sp.t === 'stun') for (const u of targets) { const r = strike(att, u, sp.v); anim(fEl(u), 'hurt'); floatAt(fEl(u), r.txt, 'crit'); }
    if (sp.t === 'heal') for (const u of targets) { const g = Math.round(u.max * sp.v); u.hp = Math.min(u.max, u.hp + g); floatAt(fEl(u), '+' + g, 'heal'); }
    if (sp.t === 'shield') { if (mineSide) BT.shield = 2; else BT.foeShield = 2; for (const u of targets) { anim(fEl(u), 'shielded'); if (sp.v) { const g = Math.round(u.max * sp.v); u.hp = Math.min(u.max, u.hp + g); floatAt(fEl(u), '+' + g, 'heal'); } } }
    if (sp.t === 'weaken') { if (mineSide) BT.weakFoe = 2; else BT.weakMine = 2; }
    if (sp.t === 'stun') { if (mineSide) BT.stun = true; else BT.pstun = true; }
    const who = att.name;
    BT.msg = sp.n + '! ' + who + ': ' + sp.d + '.';
    done();
  }, Math.min(wait, 1100));
}
function special() {
  if (BT.busy || BT.over || BT.meter < 3) return;
  const me = BT.mine[BT.sel]; if (!me || me.hp <= 0) return;
  BT.busy = true; BT.meter = 0;
  doSpecial(me, afterPlayer);
}
function afterPlayer() {
  syncBars();
  if (!alive(BT.foe).length) { setTimeout(() => endBattle(true), 700); return; }
  setTimeout(enemyTurn, 700);
}
function enemyTurn() {
  if (BT.stun) { BT.stun = false; BT.msg = 'I nemici sono impicciati e saltano il turno!'; BT.busy = false; nextSel(); renderBattle(); return; }
  BT.turn++;
  const foes = alive(BT.foe), mine = alive(BT.mine);
  const boss = foes.find((u) => u.boss);
  if (boss && BT.turn % 4 === 0) { doSpecial(boss, finishEnemy); return; }
  const att = foes[Math.floor(Math.random() * foes.length)];
  const tgt = Math.random() < 0.6 ? mine.slice().sort((a, b) => a.hp - b.hp)[0] : mine[Math.floor(Math.random() * mine.length)];
  anim(fEl(att), 'lunge');
  setTimeout(() => {
    const r = strike(att, tgt); anim(fEl(tgt), 'hurt'); floatAt(fEl(tgt), r.txt, r.crit ? 'crit' : ''); fx('sad');
    BT.msg = att.name + ' colpisce ' + tgt.name + ' (' + r.total + ')' + (tgt.hp <= 0 ? ': è fuori combattimento!' : '.');
    finishEnemy();
  }, 260);
}
function finishEnemy() {
  if (BT.shield > 0) BT.shield--;
  if (BT.foeShield > 0) BT.foeShield--;
  if (BT.weakFoe > 0) BT.weakFoe--;
  if (BT.weakMine > 0) BT.weakMine--;
  campagnaHeal(BT.foe);
  syncBars();
  if (!alive(BT.mine).length) { setTimeout(() => endBattle(false), 700); return; }
  if (BT.pstun) { BT.pstun = false; BT.msg += ' La tua squadra è impicciata: i nemici attaccano ancora!'; syncBars(); setTimeout(enemyTurn, 1100); return; }
  nextSel();
  setTimeout(() => { if (!BT) return; BT.busy = false; renderBattle(); }, 450);
}
function nextSel() { if (!BT.mine[BT.sel] || BT.mine[BT.sel].hp <= 0) { const i = BT.mine.findIndex((u) => u.hp > 0); if (i >= 0) BT.sel = i; } }

function endBattle(won) {
  const C = conq(), i = BT.town, t = TOWNS[i];
  BT.over = won ? 'win' : 'lose';
  let html;
  if (won) {
    C.q[i].stage = 'cards';
    const c = 40 * (i + 1) * C.season; eco().carlini += c;
    const x = gainXp(20 + 5 * i);
    for (const u of BT.mine) if (C.units[u.id] < lvOf(i)) C.units[u.id]++;
    cLog('Hai vinto la battaglia di ' + t.name + '. Ora la sfida a carte!');
    say('bella', 0);
    html = '<h2>Battaglia vinta!</h2><p>' + (C.q[i].brig ? 'I briganti scappano' : 'La squadra di ' + UNIT_NAME[t.boss] + ' si arrende') + ', ma per prendere ' + t.name + ' devi ancora vincere la sfida a <b>' + GAMES[t.game].toLowerCase() + '</b>.</p>' +
      '<div class="gain"><div class="xp">+' + c + ' carlini</div><div style="font-size:14px;color:#5A4C3A">I personaggi più deboli del nemico salgono di un livello.</div></div>' +
      '<button class="btn" id="btGo">Sfida a ' + GAMES[t.game].toLowerCase() + '</button><button class="btn alt" id="btMap">Più tardi</button>';
  } else {
    gainXp(5);
    cLog('Sconfitta a ' + t.name + '. Allena la squadra e riprova.');
    say('lose', 1);
    html = '<h2>Ritirata!</h2><p>' + t.name + ' resiste. Allena i tuoi personaggi con i carlini, cambia squadra o esplora l’Aspromonte: ogni animale scoperto rende la squadra più forte.</p><button class="btn" id="btSquad">La squadra</button><button class="btn alt" id="btMap">Mappa</button>';
  }
  save();
  setTimeout(() => {
    overlay(html);
    const close = (v) => { $('layer').innerHTML = ''; BT = null; conqView = v; renderConq(); };
    if ($('btGo')) $('btGo').onclick = () => { $('layer').innerHTML = ''; BT = null; conqView = 'map'; startCards(i); };
    if ($('btMap')) $('btMap').onclick = () => close('map');
    if ($('btSquad')) $('btSquad').onclick = () => close('squad');
  }, 300);
}
function startCards(i) {
  const t = TOWNS[i], q = conq().q[i];
  window.CONQ_FIGHT = { town: i, name: q.brig ? 'Capo brigante' : UNIT_NAME[t.boss] };
  startGame(t.game);
}
/* chiamata da award() a fine partita */
function conqOnAward(game, won) {
  const cf = window.CONQ_FIGHT; window.CONQ_FIGHT = null;
  if (!cf) return [];
  const C = conq(), i = cf.town, t = TOWNS[i], q = C.q[i];
  if (!won) { cLog(cf.name + ' ti ha battuto a ' + GAMES[t.game].toLowerCase() + '. Riprova la sfida!'); return ['Sfida persa: ' + t.name + ' resiste']; }
  const wasBrig = q.brig;
  q.stage = 'owned'; q.had = true; q.brig = false; q.last = Date.now();
  if (!wasBrig && !C.units[t.boss]) { C.units[t.boss] = Math.max(1, lvOf(i) - 2); }
  if (i + 1 < TOWNS.length && C.q[i + 1].stage === 'locked') C.q[i + 1].stage = 'battle';
  if (i === TOWNS.length - 1 && C.q.every((x) => x.stage === 'owned')) C.kings++;
  cLog(wasBrig ? 'Hai ripreso ' + t.name + ' ai briganti!' : 'Hai conquistato ' + t.name + '! ' + UNIT_NAME[t.boss] + ' si unisce alla tua squadra.');
  conqSel = Math.min(TOWNS.length - 1, i + 1);
  return [wasBrig ? 'Hai ripreso ' + t.name : 'Hai conquistato ' + t.name + '!', wasBrig ? '' : UNIT_NAME[t.boss] + ' entra in squadra'].filter(Boolean);
}

/* ---------- Aspromonte: alla scoperta degli animali ---------- */
const ANIMALS = [
  { id: 'volpe', n: 'Volpe', e: '🦊', rar: 1, f: 'Furba e curiosa, si avvicina ai paesi di notte in cerca di cibo.' },
  { id: 'cinghiale', n: 'Cinghiale', e: '🐗', rar: 1, f: 'Scava il terreno del bosco con il muso in cerca di radici e ghiande.' },
  { id: 'ghiro', n: 'Ghiro', e: '🐭', rar: 1, f: 'Dorme per tutto l’inverno nei tronchi cavi dei faggi e dei castagni.' },
  { id: 'scoiattolo', n: 'Scoiattolo meridionale', e: '🐿️', rar: 2, f: 'Ha il pelo scurissimo con la pancia bianca: vive solo nel Sud Italia.' },
  { id: 'tasso', n: 'Tasso', e: '🦡', rar: 2, f: 'Scava lunghe tane sotterranee e esce al tramonto.' },
  { id: 'istrice', n: 'Istrice', e: '🦔', rar: 2, f: 'Quando si spaventa alza gli aculei e li fa vibrare.' },
  { id: 'salamandra', n: 'Salamandra pezzata', e: '🦎', rar: 2, f: 'Nera a macchie gialle, si vede nei boschi umidi dopo la pioggia.' },
  { id: 'picchio', n: 'Picchio nero', e: '🐦', rar: 3, f: 'Il picchio più grande d’Europa: il suo tamburellare si sente da lontano.' },
  { id: 'gufo', n: 'Gufo reale', e: '🦉', rar: 3, f: 'Il rapace notturno più grande, con due ciuffi di piume sulla testa.' },
  { id: 'gatto', n: 'Gatto selvatico', e: '🐈', rar: 3, f: 'Sembra un gatto di casa, ma è più robusto e ha la coda ad anelli neri.' },
  { id: 'capriolo', n: 'Capriolo', e: '🦌', rar: 3, f: 'Era sparito da queste montagne ed è stato riportato nel parco.' },
  { id: 'falco', n: 'Falco pellegrino', e: '🪶', rar: 3, f: 'In picchiata è l’animale più veloce del mondo.' },
  { id: 'aquila', n: 'Aquila reale', e: '🦅', rar: 4, f: 'Fa il nido sulle pareti di roccia più alte dell’Aspromonte.' },
  { id: 'driomio', n: 'Driomio', e: '🐁', rar: 4, f: 'Un piccolo roditore dalla mascherina nera: qui vive una sottospecie che porta il nome dell’Aspromonte.' },
  { id: 'lupo', n: 'Lupo appenninico', e: '🐺', rar: 4, f: 'Il re del bosco: è tornato a vivere sull’Aspromonte, ma si fa vedere pochissimo.' },
];
const PATHS = [
  { id: 'gambarie', n: 'Gambarie', d: 'Una passeggiata tra i faggi', t: 15 * MIN, finds: 1, rar: 2 },
  { id: 'cascate', n: 'Cascate Maesano', d: 'Sentiero tra le acque', t: HOUR, finds: 2, rar: 3 },
  { id: 'montalto', n: 'Montalto', d: 'Fino alla vetta più alta', t: 4 * HOUR, finds: 3, rar: 4 },
];
function renderAspro() {
  const A = conq().aspro, now = Date.now();
  const seen = Object.keys(A.seen).length;
  let h = '<div class="chead"><div><b>Aspromonte</b><small>Esplora i sentieri e scopri gli animali di questa terra. Ogni animale nuovo rende la squadra più forte del 2%.</small></div><button class="btn small ghost" data-c="map">Mappa</button></div>' +
    '<div class="aspscene" aria-hidden="true">' + aspScene() + '</div>';
  if (A.exp) {
    const p = PATHS.find((x) => x.id === A.exp.path), left = A.exp.end - now;
    h += '<div class="expbox"><b>In cammino verso ' + p.n + '</b>' + (left > 0 ? '<i class="pbar"><b style="width:' + Math.round((1 - left / p.t) * 100) + '%"></b></i><small>Torni tra ' + fmtLeft(left) + '</small>' : '<button class="btn take" data-c="expdone">Guarda cosa hai visto!</button>') + '</div>';
  } else {
    h += '<div class="paths">' + PATHS.map((p) => '<button class="pathc" data-c="exp" data-p="' + p.id + '"><b>' + p.n + '</b><small>' + p.d + '</small><small>' + (p.t >= HOUR ? p.t / HOUR + (p.t === HOUR ? ' ora' : ' ore') : p.t / MIN + ' minuti') + ' · fino a ' + p.finds + (p.finds === 1 ? ' animale' : ' animali') + '</small></button>').join('') + '</div>';
  }
  h += '<h4 class="alh">Il tuo album · ' + seen + '/' + ANIMALS.length + '</h4><div class="album">' + ANIMALS.map((a) => {
    const s = A.seen[a.id];
    return '<button class="acard' + (s ? '' : ' unseen') + ' r' + a.rar + '" data-c="animal" data-a="' + a.id + '"' + (s ? '' : ' disabled') + '><span class="ae">' + (s ? a.e : '?') + '</span><b>' + (s ? a.n : '???') + '</b>' + (s ? '<small>visto ' + s + (s === 1 ? ' volta' : ' volte') + '</small>' : '<small>' + '★'.repeat(a.rar) + '</small>') + '</button>';
  }).join('') + '</div>';
  if (seen === ANIMALS.length) h += '<p class="maxed">Album completo! Sei un vero amico dell’Aspromonte.</p>';
  $('conqBox').innerHTML = h;
}
function aspScene() {
  return '<svg viewBox="0 0 300 120"><defs><linearGradient id="asky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9FD3EE"/><stop offset="1" stop-color="#E9F1D9"/></linearGradient></defs><rect width="300" height="120" fill="url(#asky)"/>' +
    '<path d="M0 90 L50 40 L80 62 L130 18 L170 58 L210 30 L260 66 L300 44 V120 H0Z" fill="#6E8F5A" stroke="#1A1A1A" stroke-width="1.5"/>' +
    '<path d="M118 30 L130 18 L142 30 L136 28 L130 32 L124 28Z" fill="#fff"/>' +
    '<path d="M0 104 Q60 86 120 100 Q190 84 300 98 V120 H0Z" fill="#4E7A3E" stroke="#1A1A1A" stroke-width="1.5"/>' +
    [20, 44, 70, 210, 236, 262, 286].map((x, i) => '<g transform="translate(' + x + ' ' + (98 - (i % 2) * 4) + ')"><path d="M0 -26 L9 0 H-9Z" fill="#2F5D34" stroke="#1A1A1A" stroke-width="1"/><path d="M0 -36 L7 -16 H-7Z" fill="#3A6E3E" stroke="#1A1A1A" stroke-width="1"/><rect x="-1.5" y="0" width="3" height="6" fill="#6B4424"/></g>').join('') +
    '<path d="M196 40 q4 -3 8 0 q4 -3 8 0" stroke="#1A1A1A" stroke-width="1.5" fill="none"/></svg>';
}
function finishExp() {
  const A = conq().aspro, p = PATHS.find((x) => x.id === A.exp.path);
  const found = [];
  for (let k = 0; k < p.finds; k++) {
    if (Math.random() < 0.25 && k > 0) continue;
    const pool = ANIMALS.filter((a) => a.rar <= p.rar);
    const w = pool.map((a) => (a.rar === 1 ? 10 : a.rar === 2 ? 6 : a.rar === 3 ? 3 : 1) * (A.seen[a.id] ? 1 : 1.6));
    let r = Math.random() * w.reduce((s, x) => s + x, 0), pick = pool[0];
    for (let j = 0; j < pool.length; j++) { if ((r -= w[j]) < 0) { pick = pool[j]; break; } }
    found.push(pick);
  }
  A.exp = null;
  const news = [];
  for (const a of found) { if (!A.seen[a.id]) news.push(a); A.seen[a.id] = (A.seen[a.id] || 0) + 1; }
  const c = 20 * p.finds; eco().carlini += c; gainXp(5 * p.finds + 10 * news.length);
  save();
  overlay('<h2>Di ritorno da ' + p.n + '</h2><div class="finds">' + found.map((a) => '<div class="find' + (news.includes(a) ? ' new' : '') + '"><span class="ae">' + a.e + '</span><b>' + a.n + '</b>' + (news.includes(a) ? '<em>Nuovo!</em>' : '') + '<small>' + a.f + '</small></div>').join('') + '</div>' +
    '<div class="gain"><div class="xp">+' + c + ' carlini</div>' + (news.length ? '<div style="font-size:14px;color:#5A4C3A">La squadra diventa più forte: +' + news.length * 2 + '% vita e forza</div>' : '') + '</div><button class="btn" id="expOk">Bello!</button>');
  $('expOk').onclick = () => { $('layer').innerHTML = ''; renderConq(); };
}

/* ---------- tocchi ---------- */
$('conqBox').addEventListener('click', (e) => {
  const C = conq(), E = eco();
  const town = e.target.closest('[data-town]');
  if (town) { conqSel = +town.dataset.town; renderConq(); return; }
  const as = e.target.closest('[data-aspro]');
  if (as) { if (C.q[ASPRO.after].had) { conqView = 'aspro'; renderConq(); } else flash('Prima Bagnara!'); return; }
  const f = e.target.closest('[data-f]');
  if (f && BT && !f.disabled) {
    const [side, i] = f.dataset.f.split('-').map(Number);
    if (side === 0) { BT.sel = i; renderBattle(); } else playerAttack(i);
    return;
  }
  const b = e.target.closest('[data-c]');
  if (!b || b.disabled) return;
  const c = b.dataset.c, i = conqSel;
  if (c === 'squad') { conqView = 'squad'; }
  if (c === 'map') { conqView = 'map'; }
  if (c === 'fight') { if (C.squad.length) { startBattle(i); return; } flash('Scegli la squadra!'); conqView = 'squad'; }
  if (c === 'flee') { BT = null; conqView = 'map'; cLog('Ti sei ritirato da ' + TOWNS[i].name + '.'); }
  if (c === 'special') { special(); return; }
  if (c === 'cards') { startCards(i); return; }
  if (c === 'bott' && E.carlini >= bottCost(i) && C.q[i].bott < 5) { collectTown(i); E.carlini -= bottCost(i); C.q[i].bott++; fx('big'); flash('Costruito!'); }
  if (c === 'fort' && E.carlini >= fortCost(i) && C.q[i].fort < 3) { E.carlini -= fortCost(i); C.q[i].fort++; fx('big'); flash('Difese!'); }
  if (c === 'collect') { const n = collectTown(i); if (n) { fx('take'); flash('+' + n + ' carlini'); } }
  if (c === 'collectall') { let n = 0; C.q.forEach((q, k) => { n += collectTown(k); }); if (n) { fx('take'); flash('+' + n + ' carlini'); } }
  if (c === 'pick') { const u = b.dataset.u; if (C.squad.includes(u)) C.squad = C.squad.filter((x) => x !== u); else if (C.squad.length < 3) C.squad.push(u); else flash('Massimo 3!'); }
  if (c === 'train') { const u = b.dataset.u, L = C.units[u]; if (E.carlini >= trainCost(L) && L < MAX_UL) { E.carlini -= trainCost(L); C.units[u]++; fx('take'); flash(UNIT_NAME[u] + ' liv. ' + C.units[u]); } }
  if (c === 'season') { C.season++; C.q.forEach((q, k) => { q.stage = k === 0 ? 'battle' : 'locked'; q.brig = false; q.had = q.had; }); conqSel = 0; cLog('Comincia la stagione ' + C.season + ': i paesi si sono rinforzati!'); }
  if (c === 'exp') { const p = PATHS.find((x) => x.id === b.dataset.p); C.aspro.exp = { path: p.id, end: Date.now() + p.t }; fx('card'); }
  if (c === 'expdone') { finishExp(); return; }
  if (c === 'animal') { const a = ANIMALS.find((x) => x.id === b.dataset.a); overlay('<div class="find big"><span class="ae">' + a.e + '</span><h2>' + a.n + '</h2><p>' + a.f + '</p><small>' + '★'.repeat(a.rar) + ' · visto ' + C.aspro.seen[a.id] + (C.aspro.seen[a.id] === 1 ? ' volta' : ' volte') + '</small></div><button class="btn" id="anOk">Chiudi</button>'); $('anOk').onclick = () => { $('layer').innerHTML = ''; }; return; }
  save(); renderConq();
});

setInterval(() => {
  if (view !== 'vConq' || ND.open || $('layer').innerHTML) return;
  if (conqView === 'aspro' && conq().aspro.exp) renderConq();
  if (conqView === 'map' && Date.now() % 30000 < 1000) renderConq();
}, 1000);
