/* ================= IL PAESE: LE PECORE DEL PASTORE ================= */
const SH = {
  ADULT: 15 * MIN,       // un agnello diventa adulto
  WOOL: 30 * MIN,        // la lana ricresce (solo se la pecora è sazia)
  FED: 3 * HOUR,         // un fieno sfama una pecora per 3 ore
  HAY: 6 * HOUR,         // il fieno cresce nel campo in 6 ore
  HAY_YIELD: 8,
  HAY_BUY: { n: 3, c: 25 }, // 3 balle al mercato
  SICK: 8 * HOUR,        // dopo 8 ore di fame la pecora si ammala
  MED: 40,               // la medicina costa 40 carlini
  VET_EVERY: 6 * HOUR,   // ogni tanto passa il veterinario per un controllo
  FINE: 30,              // multa per ogni pecora malata trovata dal veterinario
  PREG: 10 * MIN,        // attesa dell'agnellino
  WOLF_EVERY: 40 * MIN,  // quando non ci sei, ogni tanto passa un lupo
  CAP: [4, 7, 10, 13],
  PRICE: { b: 12, g: 20, n: 30 },
  BUY: { f: 80, m: 100 },
  PLOT_COST: 100, PLOT_MAX: 6,
};
const FENCES = [
  { name: 'Nessun recinto', desc: 'Le pecore pascolano libere: i lupi fanno festa.', risk: 0.5, block: 0 },
  { name: 'Staccionata di legno', desc: 'Pali di castagno: ferma qualche lupo.', risk: 0.25, block: 0.5, cost: 150 },
  { name: 'Muretto a secco', desc: 'Pietre messe a mano, come in Aspromonte.', risk: 0.1, block: 0.8, cost: 400 },
  { name: 'Recinto con il cane pastore', desc: 'Il cane abbaia e i lupi girano al largo.', risk: 0.02, block: 1, cost: 900 },
];
/* dopo il recinto più sicuro: nuovi pascoli per un gregge più grande */
const PASTURES = [
  { name: 'Il pascolo della collina', desc: 'Un prato in più dietro la casa del pastore.', add: 4, cost: 1500, perk: 'Più posto e un campo di fieno in più.' },
  { name: 'L’ovile di pietra', desc: 'Le pecore dormono al riparo e al caldo.', add: 5, cost: 2500, perk: 'Gli agnelli diventano adulti in metà tempo.' },
  { name: 'I pascoli della Sila', desc: 'Erba alta e aria fresca tra i pini larici.', add: 6, cost: 4000, perk: 'La lana ricresce più in fretta.' },
  { name: 'La transumanza in Aspromonte', desc: 'D’estate il gregge sale in montagna con il pastore.', add: 7, cost: 6000, perk: 'A volte nascono due gemelli!' },
];
const SELL_PRICE = { b: 50, g: 80, n: 130 };
const pastN = () => ((eco().sheep || {}).past || 0);
const adultMs = () => (pastN() >= 2 ? SH.ADULT / 2 : SH.ADULT);
const woolMs = () => (pastN() >= 3 ? SH.WOOL / 1.35 : SH.WOOL);
const plotMax = () => SH.PLOT_MAX + pastN();
const COLN = { b: 'bianca', g: 'grigia', n: 'nera' };
const COLM = { b: 'bianco', g: 'grigio', n: 'nero' };
const LANAN = { b: 'bianca', g: 'grigia', n: 'nera' };
const SHEEP_NAMES = { f: ['Bianchina', 'Rosina', 'Nerina', 'Concettina', 'Peppina', 'Teresina', 'Filomena', 'Carmela', 'Mimma', 'Assuntina', 'Lucia', 'Nunziata', 'Grazia', 'Totuccia'], m: ['Ciccio', 'Totò', 'Peppe', 'Saro', 'Mimmo', 'Nino', 'Turi', 'Micu', 'Rocco', 'Ntoni', 'Cola', 'Bruno'] };
const GENE = { bb: { b: 0.85, g: 0.15, n: 0 }, bg: { b: 0.45, g: 0.45, n: 0.1 }, bn: { b: 0.2, g: 0.6, n: 0.2 }, gg: { b: 0.25, g: 0.5, n: 0.25 }, gn: { b: 0.1, g: 0.45, n: 0.45 }, nn: { b: 0, g: 0.15, n: 0.85 } };
const geneOf = (a, b) => GENE[[a, b].sort((x, y) => 'bgn'.indexOf(x) - 'bgn'.indexOf(y)).join('')];

function sheepState() {
  const E = eco();
  if (!E.sheep) {
    const now = Date.now();
    E.sheep = {
      flock: [
        { id: 's1', n: 'Bianchina', c: 'b', m: false, born: now - HOUR, wool: 60, fedUntil: now + SH.FED, preg: null },
        { id: 's2', n: 'Ciccio', c: 'b', m: true, born: now - HOUR, wool: 40, fedUntil: now + SH.FED, preg: null },
      ],
      fence: 0, hay: 6, plots: [{ t: null }, { t: null }], lana: { b: 0, g: 0, n: 0 },
      last: now, wolfLast: now, log: ['Il pastore ti affida due pecore: Bianchina e Ciccio.'], seq: 3, wolf: null,
    };
  }
  return E.sheep;
}
const isAdult = (s, now) => now - s.born >= adultMs();
const isFed = (s, now) => s.fedUntil > now;
const SH_EN_MAX = 3, SH_EN_MS = 20 * MIN, SH_EN_VIDEO = 3;
function shEn(S) {
  if (!S.en) S.en = { n: SH_EN_MAX, at: Date.now() };
  const E = S.en, now = Date.now();
  if (E.n < SH_EN_MAX) { const k = Math.floor((now - E.at) / SH_EN_MS); if (k > 0) { E.n = Math.min(SH_EN_MAX, E.n + k); E.at += k * SH_EN_MS; } }
  if (E.n >= SH_EN_MAX) E.at = now;
  return E;
}
function shEnHTML(S) {
  const e = shEn(S), full = e.n >= SH_EN_MAX;
  return '<div class="shen"><span class="mgen' + (e.n ? '' : ' low') + '"><span class="shheart">♥</span><b>' + e.n + '<i>/' + SH_EN_MAX + '</i></b><small>' + (full ? 'piena' : '+1 tra ' + fmtTime(SH_EN_MS - (Date.now() - e.at))) + '</small></span><button class="mgvid" data-sh="envideo"' + (full ? ' disabled' : '') + '><span class="mgplay">▶</span>+' + SH_EN_VIDEO + '</button><small class="shenl">Ogni accoppiamento usa un cuore.</small></div>';
}
function shLog(S, t) { S.log.unshift(t); S.log = S.log.slice(0, 6); }
function cap(S) { let c = SH.CAP[S.fence]; for (let i = 0; i < (S.past || 0); i++) c += PASTURES[i].add; return c; }
function used(S) { return S.flock.length + S.flock.filter((s) => s.preg).length; }

/* avanza il tempo: lana, agnelli, lupi mentre non c'eri */
function sheepTick(now) {
  const S = sheepState(), E = eco();
  if (S.wolf && !(view === 'vPaese' && paeseTab === 'sheep')) S.wolf = null;
  /* chi aveva le pecore affamate da giorni prima di questo aggiornamento ha due ore di tempo */
  if (!S.sickV) { S.sickV = 1; for (const s of S.flock) if (!isFed(s, now)) s.fedUntil = Math.max(s.fedUntil, now - SH.SICK + 2 * HOUR); S.vetLast = now; }
  /* troppa fame: la pecora si ammala */
  for (const s of S.flock) {
    if (!s.sick && !isFed(s, now) && now - s.fedUntil >= SH.SICK) {
      s.sick = s.fedUntil + SH.SICK;
      shLog(S, s.n + ' si è ammalat' + (s.m ? 'o' : 'a') + ': ha avuto troppa fame. Comprale la medicina!');
      if (view === 'vPaese' && paeseTab === 'sheep') { flash(s.n + ' sta male!'); fx('sad'); }
    }
  }
  const dt = Math.max(0, now - S.last);
  if (dt > 0) {
    for (const s of S.flock) {
      if (!isAdult(s, now) || s.sick) continue;
      // la lana cresce solo per il tempo in cui la pecora era sazia
      const fedTime = Math.max(0, Math.min(now, s.fedUntil) - Math.max(S.last, s.born + adultMs()));
      s.wool = Math.min(100, s.wool + (fedTime / woolMs()) * 100);
    }
    S.last = now;
  }
  for (const s of S.flock.slice()) {
    if (s.preg && s.preg.due <= now) {
      const sex = Math.random() < 0.5 ? 'f' : 'm';
      const names = SHEEP_NAMES[sex];
      const lamb = { id: 's' + (S.seq++), n: names[Math.floor(Math.random() * names.length)], c: s.preg.c, m: sex === 'm', born: s.preg.due, wool: 0, fedUntil: s.preg.due + 30 * MIN, preg: null };
      s.preg = null;
      S.flock.push(lamb);
      if (pastN() >= 4 && Math.random() < 0.18 && used(S) < cap(S)) { const sx2 = Math.random() < 0.5 ? 'f' : 'm', nm2 = SHEEP_NAMES[sx2]; S.flock.push({ id: 's' + (S.seq++), n: nm2[Math.floor(Math.random() * nm2.length)], c: lamb.c, m: sx2 === 'm', born: lamb.born, wool: 0, fedUntil: lamb.fedUntil, preg: null }); shLog(S, 'Due gemelli! È nato anche un fratellino per ' + lamb.n + '.'); }
      shLog(S, 'È nato ' + (lamb.m ? 'un agnellino ' + COLM[lamb.c] : 'un’agnellina ' + COLN[lamb.c]) + ': si chiama ' + lamb.n + '!');
      gainXp(8);
      if (lamb.c === 'n') { P.blackSheep = (P.blackSheep || 0) + 1; if (P.blackSheep === 1) { P.blackSheepShown = false; shLog(S, tr('C’è sempri na pecora nira!')); } }
      if (view === 'vPaese' && paeseTab === 'sheep' && !(lamb.c === 'n' && P.blackSheep === 1)) flash(lamb.c === 'n' ? 'Agnello nero!' : 'Agnellino!');
    }
  }
  // lupi quando non guardi
  let n = 0;
  while (now - S.wolfLast >= SH.WOLF_EVERY && n < 3) {
    S.wolfLast += SH.WOLF_EVERY; n++;
    const risk = FENCES[S.fence].risk * (E.helpers.pastore ? 0.5 : 1);
    if (S.flock.length > 2 && Math.random() < risk) eatSheep(S, 'Di notte è passato il lupo');
  }
  if (now - S.wolfLast >= SH.WOLF_EVERY) S.wolfLast = now;
  /* il veterinario passa per un controllo: se trova pecore malate fa la multa */
  if (!S.vetLast) S.vetLast = now;
  let v = 0;
  while (now - S.vetLast >= SH.VET_EVERY && v < 2) {
    S.vetLast += SH.VET_EVERY; v++;
    const at = S.vetLast, sick = S.flock.filter((s) => s.sick && s.sick <= at).length;
    if (sick) {
      const fine = Math.min(E.carlini, sick * SH.FINE);
      E.carlini -= fine;
      shLog(S, 'È passato il veterinario per un controllo: ' + sick + (sick === 1 ? ' pecora malata' : ' pecore malate') + '. Multa di ' + fine + ' carlini!');
      S.vetNote = { n: sick, fine, seen: false };
    } else if (S.flock.length >= 4 && Math.random() < 0.5) shLog(S, 'È passato il veterinario: il gregge è sano. Complimenti al pastore!');
  }
  if (now - S.vetLast >= SH.VET_EVERY) S.vetLast = now;
}
function eatSheep(S, why) {
  if (S.flock.length <= 2) return null;
  const lambs = S.flock.filter((s) => !isAdult(s, Date.now()));
  const pool = lambs.length ? lambs : S.flock;
  const v = pool[Math.floor(Math.random() * pool.length)];
  S.flock = S.flock.filter((s) => s !== v);
  shLog(S, why + ' e si è portato via ' + v.n + '. Rinforza il recinto!');
  return v;
}

/* ---------- disegni ---------- */
const WOOLC = { b: '#F4EFE3', g: '#A7A39C', n: '#3B3633' };
function sheepSVG(s, now, size) {
  const lamb = !isAdult(s, now);
  const k = lamb ? 0.68 : 1;
  const fluff = lamb ? 0.85 : 0.72 + (s.wool / 100) * 0.38;
  const col = WOOLC[s.c], line = '#1A1A1A';
  const face = s.c === 'n' ? '#1E1A18' : '#2A2420';
  let b = '';
  const R = 9 * fluff;
  for (const [dx, dy] of [[-10, 0], [-3, -5], [5, -5], [11, 0], [4, 5], [-5, 5], [0, 0]]) b += '<circle cx="' + (30 + dx * fluff) + '" cy="' + (26 + dy * fluff) + '" r="' + R + '" fill="' + col + '" stroke="' + line + '" stroke-width="1.6"/>';
  let fill = '';
  for (const [dx, dy] of [[-10, 0], [-3, -5], [5, -5], [11, 0], [4, 5], [-5, 5], [0, 0]]) fill += '<circle cx="' + (30 + dx * fluff) + '" cy="' + (26 + dy * fluff) + '" r="' + (R - 1.4) + '" fill="' + col + '"/>';
  const horns = s.m && !lamb ? '<path d="M45 14 q-6 -6 -9 1 q3 5 7 1" fill="none" stroke="#B48A55" stroke-width="3" stroke-linecap="round"/><path d="M52 14 q6 -6 9 1 q-3 5 -7 1" fill="none" stroke="#B48A55" stroke-width="3" stroke-linecap="round"/>' : '';
  return '<svg viewBox="0 0 64 48" width="' + Math.round(size * k) + '" height="' + Math.round(size * k * 0.75) + '" aria-hidden="true">' +
    '<ellipse cx="32" cy="45" rx="20" ry="3" fill="#000" opacity="0.18"/>' +
    '<g stroke="' + line + '" stroke-width="2.2" stroke-linecap="round"><path d="M21 33 v10"/><path d="M27 34 v10"/><path d="M36 34 v10"/><path d="M42 33 v10"/></g>' +
    b + fill +
    '<ellipse cx="48.5" cy="21" rx="7" ry="8.5" fill="' + face + '" stroke="' + line + '" stroke-width="1.4"/>' +
    '<ellipse cx="42" cy="17" rx="4" ry="2" fill="' + face + '" transform="rotate(-25 42 17)"/><ellipse cx="55" cy="17" rx="4" ry="2" fill="' + face + '" transform="rotate(25 55 17)"/>' +
    '<circle cx="46" cy="20" r="1.5" fill="#fff"/><circle cx="51" cy="20" r="1.5" fill="#fff"/><circle cx="46.3" cy="20.3" r="0.7" fill="#000"/><circle cx="51.3" cy="20.3" r="0.7" fill="#000"/>' +
    horns + (s.preg ? '<text x="30" y="12" font-size="10" text-anchor="middle">♥</text>' : '') + (s.sick ? '<g class="sicksp"><circle cx="18" cy="10" r="6.5" fill="#fff" stroke="#1A1A1A" stroke-width="1.2"/><path d="M18 6 v8 M14 10 h8" stroke="#C0392B" stroke-width="2.4" stroke-linecap="round"/></g>' : '') + '</svg>';
}
const WOLF_SVG = '<svg viewBox="0 0 70 50" width="70" height="50" aria-hidden="true"><ellipse cx="34" cy="47" rx="24" ry="3" fill="#000" opacity="0.2"/><g stroke="#1A1A1A" stroke-width="2.2" stroke-linecap="round"><path d="M22 32 v13"/><path d="M28 33 v12"/><path d="M42 33 v12"/><path d="M48 32 v13"/></g><path d="M14 26 q-10 -4 -12 -14 q8 6 14 8z" fill="#6E6A66" stroke="#1A1A1A" stroke-width="1.6"/><ellipse cx="34" cy="28" rx="20" ry="9" fill="#7C7873" stroke="#1A1A1A" stroke-width="1.8"/><path d="M48 22 l8 -12 l3 10 l7 3 l-6 6 l-10 1z" fill="#7C7873" stroke="#1A1A1A" stroke-width="1.8" stroke-linejoin="round"/><path d="M52 14 l2 -6 l3 6" fill="#5A5652" stroke="#1A1A1A" stroke-width="1.4"/><circle cx="57" cy="19" r="1.4" fill="#F2C94C"/><path d="M60 26 l4 0" stroke="#fff" stroke-width="1.6"/></svg>';
function hashPos(id, i) { let h = 7; for (const c of id + i) h = (h * 31 + c.charCodeAt(0)) >>> 0; return (h % 1000) / 1000; }
function fenceSVG(lvl) {
  if (lvl === 0) return '';
  if (lvl === 1) { let p = ''; for (let x = 14; x <= 286; x += 22) p += '<rect x="' + (x - 2) + '" y="86" width="4" height="22" fill="#8A5A32" stroke="#1A1A1A" stroke-width="1"/>'; return '<g><path d="M12 92 H288 M12 100 H288" stroke="#8A5A32" stroke-width="3"/>' + p + '</g>'; }
  if (lvl === 2) { let s = ''; for (let x = 10; x < 290; x += 16) s += '<ellipse cx="' + (x + 8) + '" cy="' + (100 + (x % 32 ? 0 : 1)) + '" rx="9" ry="5" fill="#B9AF9F" stroke="#1A1A1A" stroke-width="1"/><ellipse cx="' + (x + 16) + '" cy="93" rx="8" ry="4.5" fill="#A89E8E" stroke="#1A1A1A" stroke-width="1"/>'; return '<g>' + s + '</g>'; }
  let p = ''; for (let x = 14; x <= 286; x += 22) p += '<rect x="' + (x - 2) + '" y="84" width="4" height="24" fill="#8A5A32" stroke="#1A1A1A" stroke-width="1"/>';
  return '<g><path d="M12 90 H288 M12 97 H288 M12 104 H288" stroke="#8A5A32" stroke-width="3"/>' + p + '</g>' +
    '<g transform="translate(250 136)"><ellipse cx="14" cy="18" rx="13" ry="2.5" fill="#000" opacity="0.2"/><path d="M4 8 q10 -6 20 0 v8 h-20z" fill="#F4EFE3" stroke="#1A1A1A" stroke-width="1.4"/><circle cx="25" cy="6" r="5.5" fill="#3B3633" stroke="#1A1A1A" stroke-width="1.2"/><path d="M27 2 l3 -4 l1 5" fill="#3B3633"/><circle cx="26.5" cy="5" r="0.9" fill="#fff"/><path d="M2 8 q-4 -4 -2 -8" stroke="#1A1A1A" stroke-width="2" fill="none"/></g>';
}
function sheepScene(S, now) {
  let h = '<svg viewBox="0 0 300 180" class="sheepsvg" aria-hidden="true"><defs><linearGradient id="shsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A9D8EE"/><stop offset="1" stop-color="#F5E7C4"/></linearGradient></defs>' +
    '<rect width="300" height="180" fill="url(#shsky)"/>' +
    '<path d="M0 70 Q50 40 110 62 Q170 30 230 58 Q270 46 300 60 V180 H0Z" fill="#8FB46A" stroke="#1A1A1A" stroke-width="1.5"/>' +
    '<path d="M0 86 Q80 74 160 84 Q240 76 300 86 V180 H0Z" fill="#A6CC74" stroke="#1A1A1A" stroke-width="1.5"/>' +
    '<g stroke="#7FA457" stroke-width="2" stroke-linecap="round"><path d="M30 150 l2 -7 M34 150 l-1 -8"/><path d="M200 170 l2 -7 M204 170 l-1 -8"/><path d="M120 128 l2 -7 M124 128 l-1 -8"/></g>' +
    '<g transform="translate(18 40)"><rect x="0" y="12" width="34" height="22" fill="#E9DEC6" stroke="#1A1A1A" stroke-width="1.4"/><path d="M-4 14 L17 0 L38 14Z" fill="#B5552F" stroke="#1A1A1A" stroke-width="1.4"/><rect x="13" y="20" width="9" height="14" fill="#6B4424"/></g>' +
    ((S.past || 0) >= 3 ? '<path d="M150 62 L190 22 L215 44 L240 18 L290 60Z" fill="#7E9A6A" stroke="#1A1A1A" stroke-width="1.4" opacity="0.9"/><path d="M232 26 L240 18 L248 26Z" fill="#fff"/>' : '') +
    ((S.past || 0) >= 2 ? '<g transform="translate(232 60)"><rect x="0" y="8" width="52" height="24" fill="#B9AE98" stroke="#1A1A1A" stroke-width="1.4"/><path d="M-4 10 L26 -4 L56 10Z" fill="#8A6040" stroke="#1A1A1A" stroke-width="1.4"/><rect x="20" y="16" width="12" height="16" fill="#4A3424"/><path d="M4 14 h8 M40 22 h8 M8 26 h10" stroke="#8C8270" stroke-width="1.5"/></g>' : '') +
    fenceSVG(S.fence) + '</svg>';
  const big = S.flock.length > 15, cols = big ? 7 : 5, rows = Math.ceil(S.flock.length / cols), step = Math.min(11, 33 / Math.max(1, rows - 1)), size = big ? (S.flock.length > 24 ? 44 : 52) : 66;
  const placed = S.flock.map((s, i) => {
    const row = Math.floor(i / cols), col = i % cols;
    return { s, x: 10 + col * (big ? 12.5 : 18) + (row % 2) * (big ? 5 : 8) + (hashPos(s.id, 1) - 0.5) * 6, y: 60 + row * step + (hashPos(s.id, 2) - 0.5) * 5 };
  }).sort((a, b) => a.y - b.y);
  for (const { s, x, y } of placed) {
    h += '<button class="shp' + (hashPos(s.id, 3) > 0.5 ? ' flip' : '') + '" data-sh="baa" aria-label="' + s.n + '" style="left:' + x.toFixed(1) + '%;top:' + y.toFixed(1) + '%;animation-delay:-' + (hashPos(s.id, 4) * 3).toFixed(2) + 's">' + sheepSVG(s, now, size) + '</button>';
  }
  if (S.wolf) h += '<button class="wolfbtn" data-sh="wolf" aria-label="Scaccia il lupo!">' + WOLF_SVG + '<span>Toccalo!</span></button>';
  return h;
}

/* ---------- interfaccia ---------- */
let shSel = { f: '', m: '' }, shTab = 'gregge';
function sheepKey(S, now) {
  return [S.flock.map((s) => s.id + (isAdult(s, now) ? 'A' : 'L') + (isFed(s, now) ? 'F' : 'H') + (s.wool >= 100 ? 'W' : '') + (s.preg ? 'P' : '') + (s.sick ? 'S' : '')).join(','), S.hay, S.fence, S.plots.map((p) => (p.t ? (now - p.t >= SH.HAY ? 'R' : 'G') : 'E')).join(''), S.lana.b, S.lana.g, S.lana.n, !!S.wolf, eco().carlini, S.log[0], shEn(S).n, shTab === 'agnelli' ? Math.floor(Date.now() / 1000) : 0].join('|');
}
let shLastKey = '';
function renderSheep(soft) {
  const now = Date.now();
  sheepTick(now);
  if (P.blackSheep && P.blackSheepShown === false && !ND.open && !$('layer').innerHTML) showBlackSheep();
  { const S0 = sheepState(); if (S0.vetNote && !S0.vetNote.seen && !ND.open && !$('layer').innerHTML) showVet(S0); }
  const S = sheepState(), E = eco();
  const key = sheepKey(S, now);
  // mentre si sta scegliendo la pecora o il montone dal menu a tendina non si ridisegna la schermata, altrimenti il menu si chiude
  const picking = soft && document.activeElement && document.activeElement.tagName === 'SELECT' && $('pSheep').contains(document.activeElement);
  if (soft && (key === shLastKey || picking)) { softSheep(S, now); return; }
  shLastKey = key;
  const hungry = S.flock.filter((s) => !isFed(s, now));
  const ready = S.flock.filter((s) => isAdult(s, now) && s.wool >= 100);
  const lanaTot = S.lana.b + S.lana.g + S.lana.n;
  const lanaVal = S.lana.b * SH.PRICE.b + S.lana.g * SH.PRICE.g + S.lana.n * SH.PRICE.n;
  const ewes = S.flock.filter((s) => !s.m && isAdult(s, now) && !s.preg && isFed(s, now) && !s.sick);
  const rams = S.flock.filter((s) => s.m && isAdult(s, now) && isFed(s, now) && !s.sick);
  const sickL = S.flock.filter((s) => s.sick);
  if (!ewes.some((s) => s.id === shSel.f)) shSel.f = ewes[0] ? ewes[0].id : '';
  if (!rams.some((s) => s.id === shSel.m)) shSel.m = rams[0] ? rams[0].id : '';
  const fe = S.flock.find((s) => s.id === shSel.f), ra = S.flock.find((s) => s.id === shSel.m);
  const full = used(S) >= cap(S);
  const ripe = S.plots.filter((p) => p.t && now - p.t >= SH.HAY).length;
  const canBreed = !!(fe && ra && !full && shEn(S).n > 0);
  const tab = (k, t, badge, cls) => '<button role="tab" aria-selected="' + (shTab === k) + '" data-shtab="' + k + '">' + t + (badge ? '<i class="shbadge ' + (cls || '') + '">' + badge + '</i>' : '') + '</button>';
  /* barra in alto: sempre visibile */
  let h = '<div class="shbar"><span class="shst" title="Pecore nel recinto"><b>' + S.flock.length + '<i>/' + cap(S) + '</i></b><small>pecore</small></span>' +
    '<span class="shst" title="Fieno"><b>' + S.hay + '</b><small>fieno</small></span>' +
    '<span class="shst shlana" title="Lana"><span><i class="wl wl-b"></i>' + S.lana.b + '<i class="wl wl-g"></i>' + S.lana.g + '<i class="wl wl-n"></i>' + S.lana.n + '</span><small>lana</small></span>' +
    '<button class="shsellbtn" data-sh="sell"' + (lanaTot ? '' : ' disabled') + '>Vendi' + (lanaTot ? '<b>+' + lanaVal + '</b>' : '<b>lana</b>') + '</button></div>';
  h += '<div class="shscene">' + sheepScene(S, now) + '</div>';
  h += '<div class="shact"><button class="shbig" data-sh="feed"' + (hungry.length && S.hay ? '' : ' disabled') + '><span>🌾</span>Dai il fieno' + (hungry.length ? '<i>' + Math.min(hungry.length, S.hay) + '</i>' : '') + '</button>' +
    '<button class="shbig" data-sh="shear"' + (ready.length ? '' : ' disabled') + '><span>✂️</span>Tosa' + (ready.length ? '<i>' + ready.length + '</i>' : '') + '</button></div>';
  if (hungry.length && !S.hay) h += '<p class="shwarn">Hai finito il fieno: raccoglilo nel campo o compralo al mercato. Le pecore che restano troppo senza mangiare si ammalano!</p>';
  if (sickL.length) h += '<div class="shsick"><span class="shsico">🩺</span><span><b>' + sickL.length + (sickL.length === 1 ? ' pecora malata' : ' pecore malate') + '</b><small>Senza medicina non fanno lana né agnelli, e se passa il veterinario sono ' + SH.FINE + ' carlini di multa ciascuna.</small></span><button class="btn small take" data-sh="cureall"' + (E.carlini >= SH.MED ? '' : ' disabled') + '>Medicina<small>' + SH.MED + (sickL.length > 1 ? ' l’una' : '') + '</small></button></div>';
  if (S.log[0]) h += '<div class="shlog"><div class="new">' + S.log[0] + '</div></div>';
  h += '<div class="olgames shtabs" role="tablist">' + tab('gregge', 'Gregge', (hungry.length + sickL.length) || '', 'red') + tab('campo', 'Campo', ripe || '') + tab('agnelli', 'Agnelli', canBreed ? '♥' : '') + tab('recinto', 'Recinto') + '</div>';
  if (shTab === 'gregge') {
    h += '<div class="flock">' + S.flock.map((s) => {
      const ad = isAdult(s, now), fed = isFed(s, now);
      const st = s.sick ? 'Malat' + (s.m ? 'o' : 'a') + '!' + (fed ? '' : ' E ha fame') : !ad ? 'Agnell' + (s.m ? 'o' : 'a') : s.preg ? 'Aspetta un agnello' : fed ? 'Sazi' + (s.m ? 'o' : 'a') : 'Ha fame!';
      return '<div class="sheepc' + (fed ? '' : ' hungry') + (s.sick ? ' sick' : '') + (ad && s.wool >= 100 ? ' woolr' : '') + '"><span class="sic">' + sheepSVG(s, now, 40) + '</span><span class="sinfo"><b>' + s.n + (s.m ? ' ♂' : ' ♀') + '</b><small>' + st + '</small></span>' +
        '<span class="sbars">' + (ad ? '<i class="pbar wool"><b data-wool="' + s.id + '" style="width:' + Math.round(s.wool) + '%"></b></i>' : '<i class="pbar"><b data-grow="' + s.id + '" style="width:' + Math.round(Math.min(1, (now - s.born) / adultMs()) * 100) + '%"></b></i>') +
        (s.preg ? '<i class="pbar preg"><b data-preg="' + s.id + '" style="width:' + Math.round((1 - (s.preg.due - now) / SH.PREG) * 100) + '%"></b></i>' : '') + '</span>' +
        '<span class="sbtns">' + (s.sick ? '<button class="btn small take" data-sh="cure" data-id="' + s.id + '"' + (E.carlini >= SH.MED ? '' : ' disabled') + '>Cura · ' + SH.MED + '</button>' : ad && s.wool >= 100 ? '<button class="btn small take" data-sh="shear1" data-id="' + s.id + '">Tosa</button>' : '<small class="wtxt" data-woolt="' + s.id + '">' + (!ad ? 'Cresce…' : fed ? 'Lana ' + Math.floor(s.wool) + '%' : 'Senza fieno') + '</small>') +
        (S.flock.length > 2 && !s.preg ? '<button class="shsell" data-sh="sellq" data-id="' + s.id + '" aria-label="Vendi ' + s.n + '">Vendi</button>' : '') + '</span></div>';
    }).join('') + '</div>';
  }
  if (shTab === 'campo') {
    h += '<p class="shp-p">Il fieno cresce in 6 ore e ogni campo dà ' + SH.HAY_YIELD + ' balle. Una balla sfama una pecora per 3 ore.</p><div class="plots">' + S.plots.map((p, i) => {
      if (!p.t) return '<button class="plot empty" data-sh="plant" data-i="' + i + '"><span class="pl">＋</span>Pianta</button>';
      const pr = Math.min(1, (now - p.t) / SH.HAY);
      if (pr >= 1) return '<button class="plot ripe" data-sh="reap" data-i="' + i + '">' + haySVG(1) + 'Raccogli</button>';
      return '<div class="plot grow">' + haySVG(pr) + '<i class="pbar"><b data-hay="' + i + '" style="width:' + Math.round(pr * 100) + '%"></b></i><small data-hayt="' + i + '">' + fmtLeft(SH.HAY - (now - p.t)) + '</small></div>';
    }).join('') + (S.plots.length < plotMax() ? '<button class="plot buy" data-sh="plot"' + (E.carlini >= SH.PLOT_COST ? '' : ' disabled') + '><span class="pl">＋</span>Nuovo campo<small>' + SH.PLOT_COST + ' carlini</small></button>' : '') + '</div>' +
      '<button class="btn small shhaybuy" data-sh="buyhay"' + (E.carlini >= SH.HAY_BUY.c ? '' : ' disabled') + '>🌾 Compra ' + SH.HAY_BUY.n + ' balle di fieno al mercato<small>' + SH.HAY_BUY.c + ' carlini</small></button>';
  }
  if (shTab === 'agnelli') {
    const odds = fe && ra ? geneOf(fe.c, ra.c) : null;
    h += shEnHTML(S) + (full ? '<p class="shwarn">Il recinto è pieno: allargalo o vendi qualche pecora per avere altri agnelli.</p>' : '<p class="shp-p">Scegli una pecora e un montone adulti e sazi. La lana nera è la più rara e vale di più.</p>') +
      '<div class="breed"><label>Pecora<select id="shF">' + (ewes.length ? ewes.map((s) => '<option value="' + s.id + '"' + (s.id === shSel.f ? ' selected' : '') + '>' + s.n + ' (' + COLN[s.c] + ')</option>').join('') : '<option value="">Nessuna pronta</option>') + '</select></label>' +
      '<span class="heart" aria-hidden="true">♥</span><label>Montone<select id="shM">' + (rams.length ? rams.map((s) => '<option value="' + s.id + '"' + (s.id === shSel.m ? ' selected' : '') + '>' + s.n + ' (' + COLM[s.c] + ')</option>').join('') : '<option value="">Nessuno pronto</option>') + '</select></label></div>' +
      (odds ? '<div class="odds">Agnello: ' + ['b', 'g', 'n'].filter((c) => odds[c] > 0).map((c) => '<span><i class="wl wl-' + c + '"></i>' + Math.round(odds[c] * 100) + '% ' + COLM[c] + '</span>').join('') + '</div>' : '') +
      '<button class="btn take shfull" data-sh="breed"' + (canBreed ? '' : ' disabled') + '>' + (fe && ra && !full && !shEn(S).n ? 'Niente cuori: aspetta o guarda un video' : '♥ Fai accoppiare') + '</button>' +
      '<h4>Il mercato</h4><div class="market"><button class="btn small" data-sh="buyf"' + (E.carlini >= SH.BUY.f && !full ? '' : ' disabled') + '>Pecora bianca<small>' + SH.BUY.f + ' carlini</small></button><button class="btn small" data-sh="buym"' + (E.carlini >= SH.BUY.m && !full ? '' : ' disabled') + '>Montone bianco<small>' + SH.BUY.m + ' carlini</small></button></div>' +
      '<p class="shp-p">Al mercato ci sono solo pecore bianche: grigie e nere nascono dagli incroci. Lana: bianca ' + SH.PRICE.b + ', grigia ' + SH.PRICE.g + ', nera ' + SH.PRICE.n + ' carlini.</p>';
  }
  if (shTab === 'recinto') {
    const nf = FENCES[S.fence + 1];
    h += '<div class="fencebox"><div><b>' + FENCES[S.fence].name + '</b><small>' + FENCES[S.fence].desc + ' Fino a ' + cap(S) + ' pecore.' + (E.helpers.pastore ? ' Il pastore fa la guardia: metà dei lupi in meno.' : '') + '</small></div>' +
      (nf ? '<button class="btn small take" data-sh="fence"' + (E.carlini >= nf.cost ? '' : ' disabled') + '>' + nf.name + '<small>' + nf.cost + ' carlini · fino a ' + SH.CAP[S.fence + 1] + ' pecore</small></button>' : '<span class="maxed">Il recinto più sicuro del paese!</span>') + '</div>';
    if (!nf) {
      const past = S.past || 0, np = PASTURES[past];
      h += '<h4>I pascoli</h4><div class="pastures">' + PASTURES.map((pp, i) => '<div class="pastc' + (i < past ? ' own' : i === past ? ' next' : ' lock') + '"><span class="pastn">' + (i < past ? '✓' : i + 1) + '</span><span><b>' + pp.name + '</b><small>' + pp.desc + ' +' + pp.add + ' posti. ' + pp.perk + '</small></span>' +
        (i === past ? '<button class="btn small take" data-sh="past"' + (E.carlini >= pp.cost ? '' : ' disabled') + '>' + pp.cost + '</button>' : '') + '</div>').join('') + '</div>' +
        (np ? '' : '<p class="maxed">Il gregge più grande della Calabria: ' + cap(S) + ' pecore!</p>');
    } else h += '<p class="shp-p">Con il recinto al massimo si sbloccano i pascoli e il telaio della tessitrice.</p>';
  }
  $('sheepBox').innerHTML = h;
  renderRes();
}
function haySVG(p) {
  const hgt = 6 + p * 20, col = p >= 1 ? '#D9B44A' : '#7FB24F';
  let s = '<svg viewBox="0 0 40 30" width="40" height="30" aria-hidden="true"><rect x="2" y="24" width="36" height="5" rx="2" fill="#7A5230"/>';
  for (let i = 0; i < 7; i++) s += '<path d="M' + (6 + i * 4.6) + ' 25 q' + (i % 2 ? 2 : -2) + ' ' + (-hgt / 2) + ' 0 ' + (-hgt) + '" stroke="' + col + '" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
  return s + '</svg>';
}
function fmtLeft(ms) { const s = Math.max(0, Math.ceil(ms / 1000)); if (s >= 3600) return Math.floor(s / 3600) + 'h ' + String(Math.floor((s % 3600) / 60)).padStart(2, '0') + 'm'; return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function softSheep(S, now) {
  const box = $('sheepBox');
  S.plots.forEach((p, i) => { if (!p.t) return; const b = box.querySelector('[data-hay="' + i + '"]'), t = box.querySelector('[data-hayt="' + i + '"]'); if (b) b.style.width = Math.round(Math.min(1, (now - p.t) / SH.HAY) * 100) + '%'; if (t) t.textContent = fmtLeft(SH.HAY - (now - p.t)); });
  for (const s of S.flock) {
    const w = box.querySelector('[data-wool="' + s.id + '"]'); if (w) w.style.width = Math.round(s.wool) + '%';
    const wt = box.querySelector('[data-woolt="' + s.id + '"]'); if (wt && isFed(s, now)) wt.textContent = 'Lana ' + Math.floor(s.wool) + '%';
    const g = box.querySelector('[data-grow="' + s.id + '"]'); if (g) g.style.width = Math.round(Math.min(1, (now - s.born) / adultMs()) * 100) + '%';
    const pr = box.querySelector('[data-preg="' + s.id + '"]'); if (pr && s.preg) pr.style.width = Math.round((1 - (s.preg.due - now) / SH.PREG) * 100) + '%';
  }
}
/* il lupo quando stai guardando */
function sheepLive() {
  const S = sheepState(), E = eco(), now = Date.now();
  if (S.wolf) {
    if (now > S.wolf.until) {
      S.wolf = null;
      const blocked = Math.random() < FENCES[S.fence].block;
      if (blocked) shLog(S, 'Il lupo ha provato a entrare, ma il recinto ha tenuto.');
      else if (!eatSheep(S, 'Il lupo è entrato')) shLog(S, 'Il lupo ha girato intorno e se n’è andato.');
      else fx('sad');
      save(); renderSheep();
    }
    return;
  }
  if (S.fence >= 3 || S.flock.length < 3) return;
  const chance = (1 / 100) * (E.helpers.pastore ? 0.5 : 1);
  if (Math.random() < chance) { S.wolf = { until: now + 5000 }; fx('sad'); renderSheep(); }
}
$('sheepBox').addEventListener('change', (e) => {
  if (e.target.id === 'shF') shSel.f = e.target.value;
  if (e.target.id === 'shM') shSel.m = e.target.value;
  shLastKey = ''; renderSheep();
});
$('sheepBox').addEventListener('click', (e) => {
  const tb = e.target.closest('[data-shtab]'); if (tb) { shTab = tb.dataset.shtab; shLastKey = ''; renderSheep(); return; }
  const b = e.target.closest('[data-sh]');
  if (!b || b.disabled) return;
  if (b.dataset.sh === 'baa') {
    b.classList.remove('baa'); void b.offsetWidth; b.classList.add('baa');
    const bub = document.createElement('span'); bub.className = 'baabub'; bub.textContent = ['Bèèè!', 'Mèèè!', 'Bèè bèè!'][Math.floor(Math.random() * 3)];
    b.appendChild(bub); setTimeout(() => bub.remove(), 900); fx('card');
    return;
  }
  const S = sheepState(), E = eco(), now = Date.now(), a = b.dataset.sh;
  sheepTick(now);
  if (a === 'wolf' && S.wolf) { S.wolf = null; gainXp(3); E.carlini += 10; shLog(S, 'Hai scacciato il lupo! Il paese ti regala 10 carlini.'); flash('Via, lupo!'); fx('take'); }
  if (a === 'feed') { for (const s of S.flock) { if (!S.hay) break; if (!isFed(s, now)) { S.hay--; s.fedUntil = now + SH.FED; } } fx('take'); }
  if (a === 'shear' || a === 'shear1') {
    let n = 0;
    for (const s of S.flock) if ((a === 'shear' || s.id === b.dataset.id) && isAdult(s, now) && s.wool >= 100) { s.wool = 0; S.lana[s.c]++; n++; }
    if (n) { gainXp(2 * n); fx('card'); flash('+' + n + ' lana'); }
  }
  if (a === 'sell') {
    const v = S.lana.b * SH.PRICE.b + S.lana.g * SH.PRICE.g + S.lana.n * SH.PRICE.n;
    const tot = S.lana.b + S.lana.g + S.lana.n;
    E.carlini += v; gainXp(Math.ceil(tot / 2)); S.lana = { b: 0, g: 0, n: 0 };
    shLog(S, 'Hai venduto ' + tot + ' matasse di lana per ' + v + ' carlini.'); flash('+' + v + ' carlini'); say('settebello', 0);
  }
  if (a === 'past') { const pp = PASTURES[S.past || 0]; if (pp && E.carlini >= pp.cost && S.fence >= FENCES.length - 1) { E.carlini -= pp.cost; S.past = (S.past || 0) + 1; shLog(S, 'Hai preso ' + pp.name.charAt(0).toLowerCase() + pp.name.slice(1) + '! Ora ci stanno ' + cap(S) + ' pecore.'); flash('Nuovo pascolo!'); fx('big'); gainXp(30); } }
  if (a === 'sellq') {
    const sh = S.flock.find((x) => x.id === b.dataset.id); if (!sh || S.flock.length <= 2) return;
    const v = Math.round(SELL_PRICE[sh.c] * (isAdult(sh, now) ? 1 : 0.5) * (sh.sick ? 0.5 : 1));
    overlay('<div class="bsart">' + sheepSVG(sh, now, 110) + '</div><h2>Vendere ' + sh.n + '?</h2><p>Al mercato ti danno <b>' + v + ' carlini</b> per ' + (sh.m ? 'il montone ' + COLM[sh.c] : 'la pecora ' + COLN[sh.c]) + (isAdult(sh, now) ? '' : ' (è ancora piccol' + (sh.m ? 'o' : 'a') + ', vale la metà)') + '. Così fai posto per altri agnelli.</p><button class="btn take" id="ssYes">Vendi per ' + v + ' carlini</button><button class="btn alt" id="ssNo">Tienila</button>');
    $('ssNo').onclick = () => { $('layer').innerHTML = ''; };
    $('ssYes').onclick = () => { $('layer').innerHTML = ''; const S2 = sheepState(); if (S2.flock.length <= 2) return; S2.flock = S2.flock.filter((x) => x.id !== sh.id); eco().carlini += v; shLog(S2, 'Hai venduto ' + sh.n + ' al mercato per ' + v + ' carlini.'); flash('+' + v + ' carlini'); fx('take'); save(); shLastKey = ''; renderSheep(); renderRes(); };
    return;
  }
  if (a === 'envideo') { showRewardedAd().then((got) => { if (!got) return; const S2 = sheepState(), e2 = shEn(S2); e2.n = Math.min(SH_EN_MAX + SH_EN_VIDEO, e2.n + SH_EN_VIDEO); flash('+' + SH_EN_VIDEO + ' cuori'); save(); shLastKey = ''; renderSheep(); }); return; }
  if (a === 'plant') { S.plots[+b.dataset.i].t = now; fx('card'); }
  if (a === 'buyhay' && E.carlini >= SH.HAY_BUY.c) { E.carlini -= SH.HAY_BUY.c; S.hay += SH.HAY_BUY.n; flash('+' + SH.HAY_BUY.n + ' fieno'); fx('take'); }
  if (a === 'cure' || a === 'cureall') {
    let n = 0;
    for (const s of S.flock) { if (!s.sick || (a === 'cure' && s.id !== b.dataset.id)) continue; if (E.carlini < SH.MED) break; E.carlini -= SH.MED; s.sick = null; if (!isFed(s, now) && S.hay) { S.hay--; s.fedUntil = now + SH.FED; } n++; }
    if (n) { shLog(S, n === 1 ? 'Hai dato la medicina: la pecora è guarita!' : 'Hai dato la medicina a ' + n + ' pecore: sono guarite!'); flash('Guarit' + (n === 1 ? 'a' : 'e') + '!'); fx('take'); gainXp(n); }
  }
  if (a === 'reap') { S.plots[+b.dataset.i].t = null; S.hay += SH.HAY_YIELD; flash('+' + SH.HAY_YIELD + ' fieno'); fx('take'); }
  if (a === 'plot' && E.carlini >= SH.PLOT_COST && S.plots.length < plotMax()) { E.carlini -= SH.PLOT_COST; S.plots.push({ t: null }); }
  if (a === 'fence') { const nf = FENCES[S.fence + 1]; if (nf && E.carlini >= nf.cost) { E.carlini -= nf.cost; S.fence++; shLog(S, 'Hai costruito: ' + nf.name.toLowerCase() + '.'); flash(nf.name + '!'); } }
  if ((a === 'buyf' || a === 'buym') && used(S) < cap(S)) {
    const m = a === 'buym', price = m ? SH.BUY.m : SH.BUY.f;
    if (E.carlini >= price) {
      E.carlini -= price;
      const names = SHEEP_NAMES[m ? 'm' : 'f'];
      const s = { id: 's' + (S.seq++), n: names[Math.floor(Math.random() * names.length)], c: 'b', m, born: now - SH.ADULT, wool: 20, fedUntil: now + SH.FED, preg: null };
      S.flock.push(s); shLog(S, 'Al mercato hai comprato ' + (m ? 'il montone ' : 'la pecora ') + s.n + '.');
    }
  }
  if (a === 'breed') {
    const fe = S.flock.find((s) => s.id === shSel.f), ra = S.flock.find((s) => s.id === shSel.m);
    const en = shEn(S);
    if (fe && ra && used(S) < cap(S) && en.n > 0) {
      if (en.n >= SH_EN_MAX) en.at = now; en.n--;
      const g = geneOf(fe.c, ra.c);
      let r = Math.random(), c = 'b';
      for (const k of ['b', 'g', 'n']) { if ((r -= g[k]) < 0) { c = k; break; } }
      fe.preg = { due: now + SH.PREG, c };
      shLog(S, fe.n + ' e ' + ra.n + ' aspettano un agnellino: arriva tra 10 minuti.');
      flash('♥'); fx('take');
    }
  }
  save(); shLastKey = ''; renderSheep();
});

/* la prima pecora nera: il detto calabrese */
function showBlackSheep() {
  P.blackSheepShown = true; save();
  const S = sheepState(), now = Date.now();
  const s = S.flock.slice().reverse().find((x) => x.c === 'n') || { id: 'x', n: '', c: 'n', m: false, born: now - SH.ADULT, wool: 100, preg: null };
  gainXp(30);
  say('settebello', 0);
  overlay('<div class="blacksheep"><div class="bsart">' + sheepSVG(Object.assign({}, s, { born: now - SH.ADULT, wool: 100, preg: null }), now, 150) + '</div>' +
    '<p class="bskick">' + (s.m ? 'È nato il primo montoncino nero' : 'È nata la prima pecora nera') + (s.n ? ': ' + s.n : '') + '!</p>' +
    '<h2 class="bsdetto">' + tr('“C’è sempri na pecora nira!”') + '</h2>' +
    '<p>Un detto calabrese: c’è sempre qualcuno che non è d’accordo, o che fa di tutto per non accettare quello che decide la maggioranza. Nel gregge come in famiglia… e al tavolo da gioco!</p>' +
    '<p class="bsbadge"><img src="' + AVIMG.pastore + '" alt=""><span>Obiettivo sbloccato: <b>' + tr('C’è sempri na pecora nira') + '</b> · +30 XP</span></p>' +
    '<p class="pgnote">La sua lana è la più preziosa del mercato: 30 carlini a matassa.</p><button class="btn" id="bsOk">Bella!</button></div>');
  $('bsOk').onclick = () => { $('layer').innerHTML = ''; };
}

/* la visita del veterinario: si vede quando torni dalle pecore */
function showVet(S) {
  const v = S.vetNote; v.seen = true; save();
  overlay('<div class="vetwin"><div class="vetic" aria-hidden="true">🩺</div><h2>Il veterinario</h2><p>' + tr2('Sugnu passatu pe’ nu cuntrollu e aju truvatu ', 'Sono passato per un controllo e ho trovato ') + '<b>' + v.n + (v.n === 1 ? ' pecora malata' : ' pecore malate') + '</b>. ' + tr2('Ti tocca a murta: ', 'Ti tocca la multa: ') + '<b>' + v.fine + ' carlini</b>.</p><p class="pznote">Dai il fieno in tempo e cura subito le pecore malate con la medicina.</p><button class="btn take" id="vetOk">Ho capito</button></div>');
  $('vetOk').onclick = () => { $('layer').innerHTML = ''; };
}
