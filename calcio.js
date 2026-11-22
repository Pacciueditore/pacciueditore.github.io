/* ================= U PALLUNI: il calcio a punta di dito =================
   Pedine rotonde come nel calcio da tavolo: a turno tiri una pedina tirando indietro il dito (come una fionda).
   Vince chi segna 3 gol; se dopo 10 tiri a testa nessuno ci arriva, vince chi è avanti (o è pareggio).
   Campionato contro le squadre calabresi, amichevoli e partite online.
   La fisica usa solo + - * / e radice quadrata: con lo stesso tiro due telefoni fanno esattamente gli stessi movimenti. */
const CZ_W = 360, CZ_H = 560, CZ_GW = 116, CZ_GD = 26, CZ_R = 20, CZ_BR = 11, CZ_POST = 4;
const CZ_GOALS = 3, CZ_SHOTS = 10, CZ_MAXV = 17, CZ_DRAG = 105, CZ_N = 11;
/* le squadre: solo il nome della città e i colori della maglia, niente stemmi né nomi ufficiali */
const CZ_TEAMS = {
  reggio: { n: 'Reggio', a: '#7A1430', b: '#FFFFFF', pat: 'plain', gk: '#1A1A1A', s: 'RC' },
  catanzaro: { n: 'Catanzaro', a: '#F2C200', b: '#C8102E', pat: 'half', gk: '#2E7D32', s: 'CZ' },
  cosenza: { n: 'Cosenza', a: '#C8102E', b: '#1D3E8F', pat: 'stripes', gk: '#F2C200', s: 'CS' },
  lamezia: { n: 'Lamezia', a: '#FFFFFF', b: '#1E8C45', pat: 'hoops', gk: '#6A3FA0', s: 'LT' },
  crotone: { n: 'Crotone', a: '#1D4E9E', b: '#C8102E', pat: 'stripes', gk: '#F2C200', s: 'KR' },
  vibo: { n: 'Vibo Valentia', a: '#C8102E', b: '#1D4E9E', pat: 'sash', gk: '#2E7D32', s: 'VV' },
  tropea: { n: 'Tropea', a: '#FFFFFF', b: '#2A8FD6', pat: 'sash', gk: '#1A1A1A', s: 'TR' },
  ardore: { n: 'Ardore', a: '#2E7D32', b: '#F2C200', pat: 'hoops', gk: '#C8102E', s: 'AR' },
  siderno: { n: 'Siderno', a: '#7FC7EA', b: '#FFFFFF', pat: 'stripes', gk: '#C8102E', s: 'SI' },
  locri: { n: 'Locri', a: '#7A1430', b: '#F2C200', pat: 'half', gk: '#1D3E8F', s: 'LO' },
  gioia: { n: 'Gioia Tauro', a: '#6A3FA0', b: '#FFFFFF', pat: 'plain', gk: '#F2C200', s: 'GT' },
  rossano: { n: 'Rossano', a: '#1A1A1A', b: '#C8102E', pat: 'stripes', gk: '#2A8FD6', s: 'RO' },
};
const CZ_BIG = ['reggio', 'catanzaro', 'cosenza', 'lamezia'];
const CZ_PAESI = ['crotone', 'vibo', 'tropea', 'ardore', 'siderno', 'locri', 'gioia', 'rossano'];
const CZ_TIFO_LINE = {
  reggio: 'Amaranto! Lo Stretto è tutto tuo, e pure il profumo del bergamotto.',
  catanzaro: 'Giallorossi! Le aquile volano alte sopra i Tre Colli.',
  cosenza: 'Rossoblù! I lupi della Sila non mollano mai.',
  lamezia: 'Biancoverdi! Dalla piana di Lamezia, con orgoglio.',
};
if (typeof RULES !== 'undefined') {
  RULES.calcio = ['U Palluni! Il calcio da tavolo dei bar calabresi, ma con il dito: ogni pedina è un giocatore.', 'Tocca una tua pedina e tira indietro il dito, come una fionda: più tiri, più forte parte. Lascia e la pedina va dalla parte opposta.', 'Si tira a turno, una pedina alla volta. Colpisci il pallone e mandalo nella porta di sopra: quella di sotto è la tua, difendila!', {"b": "E se tiro il pallone fino a Messina?"}, {"n": "Bergo, il campo ha le sponde: rimbalza e torna indietro. Come te quando ti scacciano dal bar.", "mad": true}, 'Vince chi segna 3 gol. Se dopo dieci tiri a testa nessuno ci arriva, vince chi è avanti, altrimenti è pareggio.', 'Nel Campionato parti dalla Terza Categoria, contro i paesini, e sali: Seconda, Prima, Promozione, Eccellenza, fino alla Serie D con Reggio, Vibo, Lamezia e Locri. I primi due salgono, gli ultimi due scendono!', 'Puoi giocare anche online, contro una persona vera o sfidando un amico.'];
}

/* ---------- campo e fisica ---------- */
const CZ_FORM = [[0.5, 0.925], [0.25, 0.79], [0.75, 0.79], [0.33, 0.62], [0.67, 0.62]];
function czStartPos(f0, f1) {
  const a = [];
  for (const [fx, fy] of (f0 || CZ_FORM)) a.push(Math.round(fx * CZ_W * 100) / 100, Math.round(fy * CZ_H * 100) / 100);
  for (const [fx, fy] of (f1 || CZ_FORM)) a.push(Math.round((1 - fx) * CZ_W * 100) / 100, Math.round((1 - fy) * CZ_H * 100) / 100);
  a.push(CZ_W / 2, CZ_H / 2);
  return a;
}
function czState(pos) {
  const S = { x: new Float64Array(CZ_N), y: new Float64Array(CZ_N), vx: new Float64Array(CZ_N), vy: new Float64Array(CZ_N), r: new Float64Array(CZ_N), m: new Float64Array(CZ_N), goal: -1, after: 0, frames: 0, hits: 0, post: 0 };
  for (let i = 0; i < CZ_N; i++) { S.x[i] = pos[i * 2]; S.y[i] = pos[i * 2 + 1]; S.r[i] = i === 10 ? CZ_BR : CZ_R; S.m[i] = i === 10 ? 0.45 : 1; }
  return S;
}
const czPosOf = (S) => { const a = []; for (let i = 0; i < CZ_N; i++) a.push(Math.round(S.x[i] * 100) / 100, Math.round(S.y[i] * 100) / 100); return a; };
const CZ_G0 = CZ_W / 2 - CZ_GW / 2, CZ_G1 = CZ_W / 2 + CZ_GW / 2;
const CZ_POSTS = [[CZ_G0, 0], [CZ_G1, 0], [CZ_G0, CZ_H], [CZ_G1, CZ_H]];
function czWall(S, i) {
  const r = S.r[i], WE = 0.78;
  let x = S.x[i], y = S.y[i];
  if (x < r) { x = r; S.vx[i] = -S.vx[i] * WE; }
  if (x > CZ_W - r) { x = CZ_W - r; S.vx[i] = -S.vx[i] * WE; }
  const inMouth = x > CZ_G0 && x < CZ_G1;
  // porta di sopra
  if (y < r) {
    if (!inMouth && y > -r) { y = r; S.vy[i] = -S.vy[i] * WE; }
    else if (y < 0 || inMouth) {
      if (y < 0) { if (x < CZ_G0 + r) { x = CZ_G0 + r; S.vx[i] = -S.vx[i] * WE; } if (x > CZ_G1 - r) { x = CZ_G1 - r; S.vx[i] = -S.vx[i] * WE; } }
      if (y < -CZ_GD + r) { y = -CZ_GD + r; S.vy[i] = -S.vy[i] * 0.35; S.vx[i] *= 0.6; }
    }
  }
  // porta di sotto
  if (y > CZ_H - r) {
    if (!inMouth && y < CZ_H + r) { y = CZ_H - r; S.vy[i] = -S.vy[i] * WE; }
    else if (y > CZ_H || inMouth) {
      if (y > CZ_H) { if (x < CZ_G0 + r) { x = CZ_G0 + r; S.vx[i] = -S.vx[i] * WE; } if (x > CZ_G1 - r) { x = CZ_G1 - r; S.vx[i] = -S.vx[i] * WE; } }
      if (y > CZ_H + CZ_GD - r) { y = CZ_H + CZ_GD - r; S.vy[i] = -S.vy[i] * 0.35; S.vx[i] *= 0.6; }
    }
  }
  // pali
  for (let k = 0; k < 4; k++) {
    const dx = x - CZ_POSTS[k][0], dy = y - CZ_POSTS[k][1], rr = r + CZ_POST, d2 = dx * dx + dy * dy;
    if (d2 < rr * rr && d2 > 1e-9) {
      const d = Math.sqrt(d2), nx = dx / d, ny = dy / d;
      x = CZ_POSTS[k][0] + nx * rr; y = CZ_POSTS[k][1] + ny * rr;
      const vn = S.vx[i] * nx + S.vy[i] * ny;
      if (vn < 0) { S.vx[i] -= 1.8 * vn * nx; S.vy[i] -= 1.8 * vn * ny; if (i === 10) S.post++; }
    }
  }
  S.x[i] = x; S.y[i] = y;
}
function czStep(S) {
  const SUB = 4, E = 0.9;
  for (let s = 0; s < SUB; s++) {
    for (let i = 0; i < CZ_N; i++) { if (S.vx[i] || S.vy[i]) { S.x[i] += S.vx[i] / SUB; S.y[i] += S.vy[i] / SUB; } }
    for (let i = 0; i < CZ_N; i++) for (let j = i + 1; j < CZ_N; j++) {
      const dx = S.x[j] - S.x[i], dy = S.y[j] - S.y[i], rr = S.r[i] + S.r[j], d2 = dx * dx + dy * dy;
      if (d2 >= rr * rr || d2 < 1e-9) continue;
      const d = Math.sqrt(d2), nx = dx / d, ny = dy / d, ov = rr - d;
      const ii = 1 / S.m[i], ij = 1 / S.m[j], it = ii + ij;
      S.x[i] -= nx * ov * ii / it; S.y[i] -= ny * ov * ii / it; S.x[j] += nx * ov * ij / it; S.y[j] += ny * ov * ij / it;
      const rv = (S.vx[j] - S.vx[i]) * nx + (S.vy[j] - S.vy[i]) * ny;
      if (rv < 0) {
        const jm = -(1 + E) * rv / it;
        S.vx[i] -= jm * ii * nx; S.vy[i] -= jm * ii * ny; S.vx[j] += jm * ij * nx; S.vy[j] += jm * ij * ny;
        if (i === 10 || j === 10) { S.hits++; S.lt = i === 10 ? j : i; S.tm |= 1 << S.lt; }
      }
    }
    for (let i = 0; i < CZ_N; i++) czWall(S, i);
  }
  let moving = false;
  for (let i = 0; i < CZ_N; i++) {
    const f = i === 10 ? 0.984 : 0.972;
    S.vx[i] *= f; S.vy[i] *= f;
    if (S.vx[i] * S.vx[i] + S.vy[i] * S.vy[i] < 0.0036) { S.vx[i] = 0; S.vy[i] = 0; } else moving = true;
  }
  S.frames++;
  if (S.goal < 0) { if (S.y[10] + CZ_BR < 0) S.goal = 0; else if (S.y[10] - CZ_BR > CZ_H) S.goal = 1; }
  else S.after++;
  return moving && S.frames < 900 && !(S.goal >= 0 && S.after > 50);
}
function czShoot(S, sh) {
  // ogni tiro riparte da zero: prima il conteggio dei fotogrammi restava quello dei tiri precedenti
  // e dopo qualche tiro la pedina si fermava subito (il blocco che si vedeva contro il computer)
  S.frames = 0; S.after = 0; S.goal = -1; S.hits = 0; S.post = 0; S.lt = -1; S.tm = 0;
  if (sh) { S.vx[sh.i] = sh.vx; S.vy[sh.i] = sh.vy; }
}
/* tutto il tiro in una volta (per il computer e per l'online) */
function czRun(pos, sh, maxF) {
  const S = czState(pos); czShoot(S, sh);
  let k = 0; while (czStep(S) && k++ < (maxF || 2000)) { /* avanti */ }
  return S;
}
const czRound3 = (v) => Math.round(v * 1000) / 1000;
function czShotVec(i, ang, pow) { const v = CZ_MAXV * Math.max(0.12, Math.min(1, pow)); return { i, vx: czRound3(Math.cos(ang) * v), vy: czRound3(Math.sin(ang) * v) }; }

/* ---------- il computer ---------- */
function czAI(pos, team, skill, excl) {
  const B = 10, bx = pos[20], by = pos[21], up = team === 0;
  const gy = up ? -20 : CZ_H + 20, myGy = up ? CZ_H : 0;
  const cands = [];
  for (let k = 0; k < 5; k++) {
    const i = team * 5 + k, x = pos[i * 2], y = pos[i * 2 + 1];
    if (excl != null && i === excl) continue;
    for (const gxo of [-0.3, 0, 0.3]) {
      const gx = CZ_W / 2 + gxo * CZ_GW;
      let dx = gx - bx, dy = gy - by; const dl = Math.sqrt(dx * dx + dy * dy) || 1; dx /= dl; dy /= dl;
      const tx = bx - dx * (CZ_R + CZ_BR - 2), ty = by - dy * (CZ_R + CZ_BR - 2);
      const base = Math.atan2(ty - y, tx - x);
      for (const da of (gxo === 0 ? [-0.05, 0, 0.05] : [0])) for (const p of [0.6, 0.85, 1]) cands.push(czShotVec(i, base + da, p));
    }
    const dir = Math.atan2(by - y, bx - x);
    cands.push(czShotVec(i, dir, 0.7), czShotVec(i, dir, 1));
  }
  const scored = [];
  for (const c of cands) {
    const S = czRun(pos, c, 420);
    let sc = 0;
    if (S.goal === team) sc += 2000; else if (S.goal === 1 - team) sc -= 3000;
    const ey = S.y[B], ex = S.x[B];
    sc += (up ? by - ey : ey - by) * 1.2;
    const own = Math.abs(ey - myGy), cx = Math.abs(ex - CZ_W / 2);
    if (own < 150 && cx < 90) sc -= (150 - own) * 2.2;
    if (S.hits === 0) sc -= 120;
    // un difensore che resta vicino alla propria porta conta
    let guard = 0; for (let k = 0; k < 5; k++) { const yy = S.y[team * 5 + k]; if (Math.abs(yy - myGy) < 120) guard = 1; }
    sc += guard * 40 + Math.random() * (1 - skill) * 260;
    scored.push([sc, c]);
  }
  scored.sort((a, b) => b[0] - a[0]);
  const top = 1 + Math.floor((1 - skill) * 7 * Math.random());
  const best = scored[Math.min(scored.length - 1, top - 1)][1];
  // un po' di mano tremante per le squadre più deboli
  const n = (1 - skill) * 0.16, a = Math.atan2(best.vy, best.vx) + (Math.random() - 0.5) * n, v = Math.sqrt(best.vx * best.vx + best.vy * best.vy) * (1 - Math.random() * (1 - skill) * 0.15);
  return { i: best.i, vx: czRound3(Math.cos(a) * v), vy: czRound3(Math.sin(a) * v) };
}

/* ---------- squadre: anche quella del tuo paese ---------- */
function czTeam(id) {
  if (CZ_TEAMS[id]) return CZ_TEAMS[id];
  if (id && id.startsWith('tw:')) {
    const n = id.slice(3); let h = 7; for (const ch of n) h = (h * 33 + ch.charCodeAt(0)) >>> 0;
    const pal = [['#C8102E', '#FFFFFF'], ['#1D4E9E', '#FFFFFF'], ['#2E7D32', '#FFFFFF'], ['#F2C200', '#1D3E8F'], ['#7A1430', '#F2C200'], ['#1A1A1A', '#FFFFFF'], ['#2A8FD6', '#FFFFFF'], ['#E0662B', '#1A1A1A'], ['#6A3FA0', '#FFFFFF'], ['#0E7C7B', '#F2C200'], ['#FFFFFF', '#C8102E'], ['#8C2B2B', '#2A8FD6']][h % 12];
    const ini = n.replace(/[’']/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !/^(di|del|della|San|Sant)$/i.test(w));
    return { n, a: pal[0], b: pal[1], pat: ['plain', 'stripes', 'hoops', 'sash', 'half'][(h >> 4) % 5], gk: '#1A1A1A', s: ((ini[0] || n)[0] + ((ini[1] || ini[0] || n)[ini[1] ? 0 : 1] || '')).toUpperCase() };
  }
  if (id === 'paese') {
    let n = 'Il tuo paese';
    try { if (P.paese && typeof PZ_BY !== 'undefined' && PZ_BY[P.paese]) n = (PZ_BY[P.paese] || { n: P.paese }).n; } catch (e) { /* niente */ }
    let h = 0; for (const ch of n) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const pal = [['#E0662B', '#1A1A1A'], ['#2A8FD6', '#F2C200'], ['#2E7D32', '#FFFFFF'], ['#6A3FA0', '#F2C200'], ['#C8102E', '#FFFFFF'], ['#0E7C7B', '#FFFFFF']][h % 6];
    return { n, a: pal[0], b: pal[1], pat: ['plain', 'stripes', 'hoops', 'sash'][(h >> 3) % 4], gk: '#1A1A1A', s: n.replace(/[^A-Za-zÀ-ú]/g, '').slice(0, 2).toUpperCase() || 'MP' };
  }
  return CZ_TEAMS.reggio;
}
function czShield(id, sz) {
  // l'id del ritaglio non può avere spazi o apostrofi ("Belmonte Calabro"): altrimenti lo stemma esce quadrato
  let hh = 5; for (const ch of String(id)) hh = (hh * 31 + ch.charCodeAt(0)) >>> 0;
  const t = czTeam(id), w = sz || 34, cid = 'czs' + hh.toString(36) + '_' + w;
  let pat = '';
  if (t.pat === 'stripes') pat = '<rect x="10" y="0" width="7" height="44" fill="' + t.b + '"/><rect x="23" y="0" width="7" height="44" fill="' + t.b + '"/>';
  if (t.pat === 'half') pat = '<rect x="20" y="0" width="20" height="44" fill="' + t.b + '"/>';
  if (t.pat === 'hoops') pat = '<rect x="0" y="12" width="40" height="7" fill="' + t.b + '"/><rect x="0" y="26" width="40" height="7" fill="' + t.b + '"/>';
  if (t.pat === 'sash') pat = '<path d="M0 6 L8 0 L40 34 L40 44 L32 44 L0 12 Z" fill="' + t.b + '"/>';
  if (t.pat === 'plain') pat = '<rect x="0" y="0" width="40" height="7" fill="' + t.b + '"/>';
  return '<svg class="czsh" viewBox="0 0 40 46" width="' + w + '" height="' + Math.round(w * 1.15) + '" aria-hidden="true"><defs><clipPath id="' + cid + '"><path d="M3 3 H37 V22 C37 34 28 41 20 44 C12 41 3 34 3 22 Z"/></clipPath></defs><g clip-path="url(#' + cid + ')"><rect width="40" height="46" fill="' + t.a + '"/>' + pat + '</g><path d="M3 3 H37 V22 C37 34 28 41 20 44 C12 41 3 34 3 22 Z" fill="none" stroke="#1A1A1A" stroke-width="2.5"/><text x="20" y="27" text-anchor="middle" font-size="12" font-weight="800" font-family="sans-serif" fill="' + (t.a === '#FFFFFF' || t.a === '#F2C200' || t.a === '#7FC7EA' ? '#1A1A1A' : '#FFFFFF') + '" stroke="' + (t.a === '#FFFFFF' || t.a === '#F2C200' || t.a === '#7FC7EA' ? '#FFFFFF' : '#1A1A1A') + '" stroke-width="0.6" paint-order="stroke">' + t.s + '</text></svg>';
}

/* ---------- le categorie: si parte dal basso e si sale fino alla Serie D ---------- */
/* solo nomi di paesi; categorie e composizione dei gironi sono inventate per il gioco */
const CZ_DIVS = [
  { n: 'Terza Categoria', s: '3ª', base: 0.40, t: ['Acquaformosa', 'Acquappesa', 'Aieta', 'Albi', 'Albidona', 'Alessandria del Carretto', 'Altilia', 'Amaroni', 'Amato', 'Andali', 'Antonimina', 'Argusto', 'Bagaladi', 'Belcastro', 'Belmonte Calabro', 'Belsito', 'Benestare', 'Bianchi', 'Bocchigliero', 'Bova', 'Brognaturo', 'Bruzzano', 'Buonvicino', 'Calanna', 'Caloveto', 'Camini', 'Campana', 'Candidoni', 'Canna', 'Capistrano', 'Caraffa del Bianco', 'Caraffa di Catanzaro', 'Cardeto', 'Cardinale', 'Careri', 'Carfizzi', 'Carlopoli', 'Carpanzano', 'Casignana', 'Castelsilano', 'Castroregio', 'Cellara', 'Cenadi', 'Centrache', 'Cerchiara di Calabria', 'Cerva', 'Cervicati', 'Cerzeto', 'Cicala', 'Ciminà', 'Civita', 'Cleto', 'Colosimi', 'Conflenti', 'Cosoleto', 'Cropalati', 'Dasà', 'Dinami', 'Domanico', 'Falconara Albanese', 'Falerna Marina', 'Figline Vegliaturo', 'Filandari', 'Filogaso', 'Firmo', 'Fiumara', 'Fossato Serralta', 'Francica', 'Frascineto', 'Gagliato', 'Giffone', 'Grisolia', 'Isca Marina', 'Jacurso', 'Laganadi', 'Laino Borgo', 'Laino Castello', 'Lappano', 'Lazzaro', 'Magisano', 'Maierà', 'Maierato', 'Malito', 'Malvito', 'Mangone', 'Marcedusa', 'Marina di San Lorenzo', 'Marina di Sant’Ilario', 'Maropati', 'Martirano', 'Martirano Lombardo', 'Marzi', 'Melicuccà', 'Miglierina', 'Molochio', 'Monasterace Marina', 'Mongiana', 'Mongrassano', 'Montauro', 'Motta Santa Lucia', 'Mottafollone', 'Nardodipace', 'Natile', 'Nocara', 'Olivadi', 'Orsomarso', 'Palermiti', 'Palizzi', 'Palizzi Marina', 'Pallagorio', 'Paludi', 'Panettieri', 'Papasidero', 'Parenti', 'Paterno Calabro', 'Pazzano', 'Pedivigliano', 'Pentone', 'Petrizzi', 'Piane Crati', 'Pietrafitta', 'Pizzoni', 'Plataci', 'Platania', 'Platì', 'Polia', 'Portigliola', 'Riace Marina', 'Roccaforte del Greco', 'Roghudi', 'Rota Greca', 'Saline Joniche', 'Samo', 'San Basile', 'San Benedetto Ullano', 'San Cosmo Albanese', 'San Costantino Calabro', 'San Donato di Ninea', 'San Floro', 'San Giorgio Albanese', 'San Gregorio d’Ippona', 'San Lorenzo Bellizzi', 'San Mango d’Aquino', 'San Martino di Finita', 'San Mauro Marchesato', 'San Nicola Arcella', 'San Nicola dell’Alto', 'San Pietro Apostolo', 'San Pietro di Caridà', 'San Pietro in Amantea', 'San Procopio', 'San Roberto', 'San Sostene', 'San Sosti', 'San Vincenzo La Costa', 'San Vito sullo Ionio', 'Sangineto', 'Santa Caterina Albanese', 'Santa Caterina dello Ionio Marina', 'Santa Cristina d’Aspromonte', 'Santa Domenica Talao', 'Sant’Agata', 'Sant’Agata di Esaro', 'Sant’Alessio in Aspromonte', 'Sant’Andrea Ionio Marina', 'Sant’Ilario', 'Santo Stefano di Rogliano', 'Santo Stefano in Aspromonte', 'Savelli', 'Scala Coeli', 'Scido', 'Scigliano', 'Sellia', 'Serra d’Aiello', 'Serrata', 'Simbario', 'Sorbo San Basile', 'Soveria Simeri', 'Spadola', 'Staiti', 'Stalettì', 'Terranova Sappo Minulio', 'Terravecchia', 'Torre di Ruggiero', 'Torre Melissa', 'Torretta di Crucoli', 'Umbriatico', 'Vaccarizzo Albanese', 'Vallefiorita', 'Vallelonga', 'Vazzano', 'Zaccanopoli', 'Zagarise', 'Zumpano', 'Zungri'] },
  { n: 'Seconda Categoria', s: '2ª', base: 0.48, t: ['Acquaro', 'Africo', 'Agnana', 'Anoia', 'Aprigliano', 'Ardore Marina', 'Arena', 'Badolato Marina', 'Belvedere di Spinello', 'Bianco', 'Bivongi', 'Bonifati', 'Bova Marina', 'Caccuri', 'Calopezzati', 'Canolo', 'Carolei', 'Casabona', 'Castiglione Cosentino', 'Caulonia Marina', 'Celico', 'Cerenzia', 'Cessaniti', 'Condofuri', 'Condofuri Marina', 'Cortale', 'Crucoli', 'Davoli Marina', 'Delianuova', 'Dipignano', 'Drapia', 'Fabrizia', 'Fagnano Castello', 'Feroleto Antico', 'Feroleto della Chiesa', 'Ferruzzano', 'Francavilla Marittima', 'Galatro', 'Gasperina', 'Gerace', 'Gerocarne', 'Gimigliano', 'Grotteria', 'Guardavalle', 'Guardavalle Marina', 'Ionadi', 'Isca sullo Ionio', 'Joppolo', 'Lago', 'Limbadi', 'Longobucco', 'Lungro', 'Mammola', 'Mandatoriccio', 'Marano Marchesato', 'Marano Principato', 'Marcellinara', 'Martone', 'Melicucco', 'Montebello Jonico', 'Montegiordano', 'Montepaone', 'Montepaone Lido', 'Monterosso Calabro', 'Motta San Giovanni', 'Oppido Mamertina', 'Oriolo', 'Parghelia', 'Petronà', 'Pianopoli', 'Pietrapaola', 'Placanica', 'Riace', 'Roccabernarda', 'Rose', 'Rovito', 'San Calogero', 'San Demetrio Corone', 'San Fili', 'San Giorgio Morgeto', 'San Giovanni di Gerace', 'San Lorenzo', 'San Lorenzo del Vallo', 'San Nicola da Crissa', 'San Pietro a Maida', 'San Pietro in Guarano', 'Santa Caterina dello Ionio', 'Santa Maria del Cedro', 'Santa Sofia d’Epiro', 'Sant’Andrea dello Ionio', 'Sant’Eufemia d’Aspromonte', 'Saracena', 'Satriano', 'Scandale', 'Seminara', 'Serrastretta', 'Sersale', 'Settingiano', 'Sinopoli', 'Sorianello', 'Spezzano della Sila', 'Spilinga', 'Squillace Lido', 'Stignano', 'Terranova da Sibari', 'Varapodio', 'Verbicaro', 'Verzino', 'Villapiana Lido', 'Zambrone'] },
  { n: 'Prima Categoria', s: '1ª', base: 0.56, t: ['Aiello Calabro', 'Altomonte', 'Amendolara', 'Ardore', 'Badolato', 'Borgia', 'Botricello', 'Brancaleone', 'Briatico', 'Campo Calabro', 'Cariati', 'Castrolibero', 'Caulonia', 'Cinquefrondi', 'Cotronei', 'Cropani', 'Curinga', 'Davoli', 'Decollatura', 'Falerna', 'Filadelfia', 'Fiumefreddo Bruzio', 'Francavilla Angitola', 'Gioiosa Ionica', 'Girifalco', 'Gizzeria', 'Grimaldi', 'Guardia Piemontese', 'Lattarico', 'Laureana di Borrello', 'Longobardi', 'Maida', 'Marina di Gioiosa', 'Melissa', 'Mesoraca', 'Mileto', 'Mirto Crosia', 'Monasterace', 'Morano Calabro', 'Mormanno', 'Nicotera', 'Petilia Policastro', 'Ricadi', 'Rizziconi', 'Rocca di Neto', 'Rocca Imperiale', 'Roccella', 'Roggiano Gravina', 'Rombiolo', 'Roseto Capo Spulico', 'San Ferdinando', 'Santa Severina', 'Sant’Onofrio', 'Serra San Bruno', 'Simeri Crichi', 'Soverato', 'Spezzano Albanese', 'Squillace', 'Stefanaconi', 'Stilo', 'Strongoli', 'Tarsia', 'Taverna', 'Tiriolo', 'Torano Castello', 'Tortora', 'Villapiana'] },
  { n: 'Promozione', s: 'PR', base: 0.63, t: ['Bagnara', 'Belvedere Marittimo', 'Bisignano', 'Bovalino', 'Casali del Manco', 'Cerisano', 'Cetraro', 'Chiaravalle Centrale', 'Cirò', 'Cutro', 'Diamante', 'Fuscaldo', 'Luzzi', 'Melito', 'Mendicino', 'Nocera Terinese', 'Palmi', 'Polistena', 'Rogliano', 'Rosarno', 'San Lucido', 'San Marco Argentano', 'Scilla', 'Sellia Marina', 'Soveria Mannelli', 'Taurianova', 'Tropea', 'Villa San Giovanni'] },
  { n: 'Eccellenza', s: 'EC', base: 0.71, t: ['Acri', 'Amantea', 'Cassano all’Ionio', 'Cirò Marina', 'Cittanova', 'Corigliano', 'Gioia Tauro', 'Isola di Capo Rizzuto', 'Montalto Uffugo', 'Paola', 'Pizzo', 'Praia a Mare', 'Rossano', 'San Giovanni in Fiore', 'Scalea', 'Siderno', 'Soriano', 'Trebisacce'] },
  { n: 'Serie D', s: 'D', base: 0.80, t: ['Castrovillari', 'Catanzaro', 'Cosenza', 'Crotone', 'Lamezia', 'Locri', 'Reggio', 'Rende', 'San Luca', 'Vibo Valentia'] },
];
const CZ_UP = 2, CZ_DOWN = 2;
const czTeamId = (name) => { for (const [id, tm] of Object.entries(CZ_TEAMS)) if (tm.n === name) return id; return 'tw:' + name; };

/* ---------- cerca una squadra per nome (senza badare ad accenti e apostrofi) ---------- */
const czNorm = (n) => String(n).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’'`.-]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
function czSearch(q, extra) {
  q = czNorm(q); if (!q) return [];
  const out = [], seen = new Set();
  const add = (id, lab) => { if (seen.has(id)) return; seen.add(id); out.push([id, lab]); };
  for (const id of CZ_BIG.concat(CZ_PAESI)) if (czNorm(czTeam(id).n).includes(q)) add(id, CZ_BIG.includes(id) ? 'Forte' : 'Di paese');
  CZ_DIVS.forEach((d) => d.t.forEach((n) => { if (czNorm(n).includes(q)) add(czTeamId(n), d.n); }));
  if (extra) for (const [id, lab] of extra) if (czNorm(czTeam(id).n).includes(q)) add(id, lab);
  out.sort((a, b) => (czNorm(czTeam(a[0]).n).startsWith(q) ? 0 : 1) - (czNorm(czTeam(b[0]).n).startsWith(q) ? 0 : 1));
  return out.slice(0, 60);
}
/* ---------- dati del giocatore ---------- */
function czData() {
  if (!P.calcio) P.calcio = { tifo: '', team: '', w: 0, d: 0, l: 0, gf: 0, gs: 0, cups: 0, season: 1, camp: null };
  return P.calcio;
}
const myCzTeam = () => { const c = czData(); return c.team || c.tifo || 'reggio'; };

/* ---------- campionato ---------- */
function czLeagueTeams(season) {
  const k = ((season - 1) * 4) % CZ_PAESI.length, pz = CZ_PAESI.concat(CZ_PAESI).slice(k, k + 4);
  let hasPaese = false; try { hasPaese = !!(P.paese && typeof PZ_BY !== 'undefined' && PZ_BY[P.paese]); } catch (e) { /* niente */ }
  if (hasPaese) { const pn = czTeam('paese').n; const same = pz.findIndex((x) => CZ_TEAMS[x].n === pn); if (same < 0) pz[3] = 'paese'; }
  return CZ_BIG.concat(pz);
}
function czNewCamp() {
  const C = czData(), me = myCzTeam();
  if (C.div == null) C.div = 0;
  const D = CZ_DIVS[C.div], myName = czTeam(me).n;
  const pool = D.t.filter((n) => n !== myName).sort(() => Math.random() - 0.5).slice(0, 7);
  const teams = [me].concat(pool.map(czTeamId));
  // calendario all'italiana (metodo del cerchio): 7 giornate
  const arr = teams.slice().sort(() => Math.random() - 0.5), n = arr.length, rounds = [];
  for (let r = 0; r < n - 1; r++) {
    const m = [];
    for (let i = 0; i < n / 2; i++) { const a = arr[i], b = arr[n - 1 - i]; m.push(r % 2 ? [b, a] : [a, b]); }
    rounds.push(m);
    arr.splice(1, 0, arr.pop());
  }
  const table = {}; for (const t of teams) table[t] = { g: 0, w: 0, d: 0, l: 0, gf: 0, gs: 0, pt: 0 };
  const str = {}; for (const id of teams) str[id] = Math.min(0.95, D.base + (Math.random() - 0.5) * 0.1 + Math.floor((C.season - 1) / 6) * 0.02);
  C.camp = { teams, me, rounds, round: 0, table, last: [], done: false, season: C.season, div: C.div, str };
  save();
}
const czStrength = (id, season) => { const Cm = P.calcio && P.calcio.camp; if (Cm && Cm.str && Cm.str[id] != null) return Cm.str[id]; return Math.min(0.95, (CZ_BIG.includes(id) ? 0.72 : id === 'paese' ? 0.6 : 0.55) + ((season || 1) - 1) * 0.04); };
/* com'è finita la stagione: promossi, retrocessi o salvi */
function czOutcome(Cm) {
  const pos = czSorted(Cm).indexOf(Cm.me) + 1, div = Cm.div == null ? -1 : Cm.div, n = Cm.teams.length;
  if (div < 0) return { pos, k: 'old' };
  if (pos <= CZ_UP && div < CZ_DIVS.length - 1) return { pos, k: 'up', champ: pos === 1 };
  if (pos === 1 && div === CZ_DIVS.length - 1) return { pos, k: 'top', champ: true };
  if (pos > n - CZ_DOWN && div > 0) return { pos, k: 'down' };
  return { pos, k: 'stay', champ: pos === 1 };
}
function czSimGoals(a, b, season) {
  const sa = czStrength(a, season), sb = czStrength(b, season);
  const g = (s, o) => { let n = 0; for (let k = 0; k < 6; k++) if (Math.random() < 0.18 + (s - o) * 0.35) n++; return Math.min(3, n); };
  let x = g(sa, sb), y = g(sb, sa);
  if (x === 3 && y === 3) y = 2;
  return [x, y];
}
function czTableAdd(T, a, b, ga, gb) {
  const A = T[a], B = T[b];
  A.g++; B.g++; A.gf += ga; A.gs += gb; B.gf += gb; B.gs += ga;
  if (ga > gb) { A.w++; B.l++; A.pt += 3; } else if (gb > ga) { B.w++; A.l++; B.pt += 3; } else { A.d++; B.d++; A.pt++; B.pt++; }
}
const czSorted = (C) => C.teams.slice().sort((x, y) => { const a = C.table[x], b = C.table[y]; return b.pt - a.pt || (b.gf - b.gs) - (a.gf - a.gs) || b.gf - a.gf || x.localeCompare(y); });
function czNextMatch() { const C = czData().camp; if (!C || C.done) return null; return C.rounds[C.round].find((m) => m.includes(C.me)); }
/* finita la partita del giocatore: si giocano anche le altre della giornata */
function czCampResult(myG, oppG) {
  const C = czData().camp, m = czNextMatch(); if (!m) return;
  const home = m[0] === C.me;
  C.last = [];
  for (const [a, b] of C.rounds[C.round]) {
    let ga, gb;
    if (a === C.me || b === C.me) { ga = home ? myG : oppG; gb = home ? oppG : myG; } else [ga, gb] = czSimGoals(a, b, C.season);
    czTableAdd(C.table, a, b, ga, gb); C.last.push([a, b, ga, gb]);
  }
  C.round++;
  if (C.round >= C.rounds.length) C.done = true;
  save();
}

/* ---------- stato della schermata ---------- */
const CZ = { screen: 'menu', m: null, raf: 0, cv: null, aim: null };
function czBusy() { return view === 'vCalcio' && CZ.m && !CZ.m.over; }

/* ---------- disegno ---------- */
function czCanvasFit() {
  const cv = CZ.cv; if (!cv) return;
  const wrap = cv.parentNode, bw = wrap.clientWidth, bh = wrap.clientHeight;
  const LW = CZ_W + 24, LH = CZ_H + 2 * CZ_GD + 24;
  const sc = Math.max(0.3, Math.min(bw / LW, bh / LH));
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  cv.style.width = Math.round(LW * sc) + 'px'; cv.style.height = Math.round(LH * sc) + 'px';
  cv.width = Math.round(LW * sc * dpr); cv.height = Math.round(LH * sc * dpr);
  CZ.sc = sc * dpr; CZ.css = sc;
}
function czPat(ctx, t, x, y, r, main) {
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = main; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.fillStyle = t.b;
  if (t.pat === 'stripes') for (let k = -2; k <= 2; k += 2) ctx.fillRect(x + k * r * 0.33 - r * 0.15, y - r, r * 0.3, r * 2);
  if (t.pat === 'half') ctx.fillRect(x, y - r, r, r * 2);
  if (t.pat === 'hoops') for (let k = -1; k <= 1; k += 2) ctx.fillRect(x - r, y + k * r * 0.42 - r * 0.16, r * 2, r * 0.32);
  if (t.pat === 'sash') { ctx.translate(x, y); ctx.rotate(-0.8); ctx.fillRect(-r, -r * 0.2, r * 2, r * 0.4); }
  ctx.restore();
}
function czDrawDisc(ctx, x, y, t, gk, sel, flip, mine, dir) {
  const r = CZ_R;
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(x + 2.5, y + 3.5, r, r * 0.92, 0, 0, Math.PI * 2); ctx.fill();
  if (sel) { ctx.strokeStyle = '#FFE14D'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, r + 5, 0, Math.PI * 2); ctx.stroke(); }
  // base della pedina, come nel calcio da tavolo
  ctx.fillStyle = '#1A1A1A'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  const base = gk ? t.gk : t.a;
  ctx.fillStyle = base; ctx.beginPath(); ctx.arc(x, y, r - 2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(x, y, r - 4.5, 0, Math.PI * 2); ctx.stroke();
  // il giocatore visto dall'alto: spalle con la maglia, braccia e testa
  const d = dir != null ? dir : (flip ? 1 : -1); // verso dove guarda: la porta da attaccare (in basso per la squadra di sopra)
  ctx.save(); ctx.translate(x, y);
  const sw = r * 0.74, sh = r * 0.36;
  ctx.fillStyle = '#E0B48A'; ctx.strokeStyle = '#1A1A1A'; ctx.lineWidth = 1.2;
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * sw * 0.98, d * 3.5, 3.2, 4.6, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  ctx.beginPath(); ctx.ellipse(0, 0, sw, sh, 0, 0, Math.PI * 2); ctx.fillStyle = '#1A1A1A'; ctx.fill();
  if (gk) { ctx.beginPath(); ctx.ellipse(0, 0, sw - 1.4, sh - 1.4, 0, 0, Math.PI * 2); ctx.fillStyle = t.gk; ctx.fill(); }
  else { ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, sw - 1.4, sh - 1.4, 0, 0, Math.PI * 2); ctx.clip(); czPat(ctx, t.pat === 'plain' ? { pat: 'hoops', b: t.b } : t, 0, 0, sw, t.a); ctx.restore(); }
  ctx.beginPath(); ctx.arc(0, d * 0.8, r * 0.3, 0, Math.PI * 2); ctx.fillStyle = '#E0B48A'; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -d * 0.6, r * 0.27, 0, Math.PI * 2); ctx.fillStyle = '#3A2414'; ctx.fill();
  ctx.restore();
  if (mine) { ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(x, y + (flip ? -1 : 1) * (r - 2.6), 2, 0, Math.PI * 2); ctx.fill(); }
}
function czDrawBall(ctx, x, y) {
  const r = CZ_BR;
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(x + 2, y + 3, r, r * 0.9, 0, 0, Math.PI * 2); ctx.fill();
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, 1, x, y, r);
  g.addColorStop(0, '#FFFFFF'); g.addColorStop(1, '#C9CED6');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 1.5; ctx.strokeStyle = '#1A1A1A'; ctx.stroke();
  ctx.fillStyle = '#1A1A1A'; ctx.beginPath();
  for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + k * Math.PI * 2 / 5; ctx[k ? 'lineTo' : 'moveTo'](x + Math.cos(a) * r * 0.38, y + Math.sin(a) * r * 0.38); }
  ctx.closePath(); ctx.fill();
}
/* maglie troppo simili (amaranto e rosso, per esempio): la seconda squadra gioca con i colori invertiti */
function czClash(c1, c2) {
  const h = (c) => [1, 3, 5].map((k) => parseInt(c.slice(k, k + 2), 16));
  const a = h(c1), b = h(c2);
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2) < 140;
}
function czDraw() {
  const cv = CZ.cv, M = CZ.m; if (!cv || !M) return;
  const ctx = cv.getContext('2d'), S = M.S, flip = M.flip;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#1F5A2E'; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.setTransform(CZ.sc, 0, 0, CZ.sc, 0, 0);
  ctx.translate(12, 12 + CZ_GD);
  if (flip) { ctx.translate(CZ_W, CZ_H); ctx.rotate(Math.PI); }
  // prato a strisce
  for (let k = 0; k < 10; k++) { ctx.fillStyle = k % 2 ? '#3E9B4F' : '#46A857'; ctx.fillRect(0, k * CZ_H / 10, CZ_W, CZ_H / 10 + 0.5); }
  // reti
  const net = (y0, h) => { ctx.fillStyle = '#E8EEF2'; ctx.fillRect(CZ_G0, y0, CZ_GW, h); ctx.strokeStyle = 'rgba(80,90,100,0.45)'; ctx.lineWidth = 1; for (let xx = CZ_G0; xx <= CZ_G1; xx += 8) { ctx.beginPath(); ctx.moveTo(xx, y0); ctx.lineTo(xx, y0 + h); ctx.stroke(); } for (let yy = 0; yy <= Math.abs(h); yy += 8) { ctx.beginPath(); ctx.moveTo(CZ_G0, y0 + Math.sign(h) * yy); ctx.lineTo(CZ_G1, y0 + Math.sign(h) * yy); ctx.stroke(); } ctx.strokeStyle = '#1A1A1A'; ctx.lineWidth = 2.5; ctx.strokeRect(CZ_G0, Math.min(y0, y0 + h), CZ_GW, Math.abs(h)); };
  net(-CZ_GD, CZ_GD); net(CZ_H, CZ_GD);
  // righe del campo
  ctx.strokeStyle = 'rgba(255,255,255,0.92)'; ctx.lineWidth = 2.5;
  ctx.strokeRect(1.5, 1.5, CZ_W - 3, CZ_H - 3);
  ctx.beginPath(); ctx.moveTo(0, CZ_H / 2); ctx.lineTo(CZ_W, CZ_H / 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(CZ_W / 2, CZ_H / 2, 52, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(CZ_W / 2, CZ_H / 2, 3, 0, Math.PI * 2); ctx.fill();
  for (const top of [true, false]) {
    const y = top ? 0 : CZ_H, s = top ? 1 : -1;
    ctx.strokeRect(CZ_W / 2 - 100, y, 200, s * 92); ctx.strokeRect(CZ_W / 2 - 52, y, 104, s * 36);
    ctx.beginPath(); ctx.arc(CZ_W / 2, y + s * 92, 34, top ? 0.25 : Math.PI + 0.25, top ? Math.PI - 0.25 : 2 * Math.PI - 0.25); ctx.stroke();
    ctx.beginPath(); ctx.arc(CZ_W / 2, y + s * 66, 2.6, 0, Math.PI * 2); ctx.fill();
  }
  // pali
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#1A1A1A'; ctx.lineWidth = 1.5;
  for (const [px, py] of CZ_POSTS) { ctx.beginPath(); ctx.arc(px, py, CZ_POST, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  // mira
  const A = CZ.aim;
  if (A && A.pow > 0.04) {
    const i = A.i, x = S.x[i], y = S.y[i], len = 30 + A.pow * 120;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.setLineDash([6, 7]); ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + A.dx * (len + 140), y + A.dy * (len + 140)); ctx.stroke(); ctx.setLineDash([]);
    const col = A.pow < 0.5 ? '#FFE14D' : A.pow < 0.85 ? '#FF9A3C' : '#FF4D3C';
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x + A.dx * (CZ_R + 2), y + A.dy * (CZ_R + 2)); ctx.lineTo(x + A.dx * (CZ_R + len), y + A.dy * (CZ_R + len)); ctx.stroke();
    const hx = x + A.dx * (CZ_R + len + 12), hy = y + A.dy * (CZ_R + len + 12);
    ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx - A.dx * 16 - A.dy * 10, hy - A.dy * 16 + A.dx * 10); ctx.lineTo(hx - A.dx * 16 + A.dy * 10, hy - A.dy * 16 - A.dx * 10); ctx.closePath(); ctx.fill();
    ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.arc(x, y, CZ_R + 10, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = col; ctx.beginPath(); ctx.arc(x, y, CZ_R + 10, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * A.pow); ctx.stroke();
    ctx.restore();
  }
  const T = [czTeam(M.teams[0]), czTeam(M.teams[1])];
  if (czClash(T[0].a, T[1].a)) T[1] = Object.assign({}, T[1], { a: T[1].b, b: T[1].a });
  const canSel = czMyTurn() && !M.anim;
  for (let i = 0; i < 10; i++) { const tm = i < 5 ? 0 : 1; czDrawDisc(ctx, S.x[i], S.y[i], T[tm], i % 5 === 0, A ? A.i === i : (canSel && tm === M.me && CZ.pulse && (M.ctrl == null || ((M.mine || M.steal) && i === M.ctrl) || (M.mine && M.cede))), flip, tm === M.me, tm === 0 ? -1 : 1); }
  if (M.ctrl != null) {
    // la tua pedina nella carriera: anello dorato e stella
    const x = S.x[M.ctrl], y = S.y[M.ctrl];
    ctx.save(); ctx.strokeStyle = '#FFD23F'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, CZ_R + 1.5, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#FFD23F'; ctx.strokeStyle = '#1A1A1A'; ctx.lineWidth = 1.2; ctx.beginPath();
    for (let k = 0; k < 10; k++) { const rr = k % 2 ? 3 : 7, an = -Math.PI / 2 + k * Math.PI / 5; ctx[k ? 'lineTo' : 'moveTo'](x + Math.cos(an) * rr, y + (flip ? 1 : -1) * (CZ_R + 9) + Math.sin(an) * rr * (flip ? -1 : 1)); }
    ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  }
  czDrawBall(ctx, S.x[10], S.y[10]);
}
const czMyTurn = () => { const M = CZ.m; return !!M && !M.over && M.turn === M.me; };

/* ---------- partita ---------- */
function czMatchStart(o) {
  const myT = o.myTeam || myCzTeam(); let opT = o.oppTeam;
  if (opT === myT) opT = CZ_BIG.find((x) => x !== myT);
  const form = o.me === 1 ? [o.oppForm || null, o.form || null] : [o.form || null, o.oppForm || null];
  CZ.m = { S: czState(o.pos || czStartPos(form[0], form[1])), form, ctrl: o.ctrl != null ? (o.me || 0) * 5 + o.ctrl : null, alt: !!o.alt, mine: true, pw: o.pw || 1, mateSkill: o.mateSkill || o.skill || 0.6, ns: o.shots || CZ_SHOTS, ko: !!o.ko, tourFoe: o.tourFoe || null, rate: !!o.rate, onShot: o.onShot || null, car: o.car || null, teams: o.me === 1 ? [opT, myT] : [myT, opT], me: o.me || 0, flip: o.me === 1, turn: o.turn || 0, sc: [0, 0], shots: [0, 0], mode: o.mode, skill: o.skill || 0.6, anim: false, over: false, online: !!o.online, names: o.names || [czTeam(myT).n, czTeam(opT).n], msg: '' };
  CZ.aim = null; CZ.screen = 'match';
  czRender();
  if (!CZ.m.online && CZ.m.turn !== CZ.m.me) setTimeout(czAITurn, 900);
  else if (CZ.m.alt) czMineOrMate(true);
}
/* carriera da giocatore: quando tocca alla tua squadra, una volta tiri tu e una volta un compagno */
function czMineOrMate(first) {
  const M = CZ.m; if (!M || !M.alt || M.over || M.turn !== M.me) return;
  if (!first) M.mine = !M.mine;
  // tocca al compagno, ma se la palla è nella metà avversaria puoi tirare tu al posto suo
  M.steal = !M.mine && czBallAttack(M);
  M.cede = M.mine && czTooForward(M);
  const tok = M.mt = (M.mt || 0) + 1;
  czHUD(); czDraw();
  if (!M.mine) setTimeout(() => czMateTurn(tok), M.steal ? 2800 : 800);
}
// sei troppo avanti e la palla è nella tua metà: puoi far tirare un compagno messo meglio
const czTooForward = (M) => M.ctrl != null && (M.me === 0 ? M.S.y[10] > CZ_H * 0.5 && M.S.y[M.ctrl] < M.S.y[10] - 110 : M.S.y[10] < CZ_H * 0.5 && M.S.y[M.ctrl] > M.S.y[10] + 110);
const czBallAttack = (M) => (M.me === 0 ? M.S.y[10] < CZ_H * 0.45 : M.S.y[10] > CZ_H * 0.55);
function czMateTurn(tok) {
  const M = CZ.m; if (!M || M.over || M.turn !== M.me || M.mine || view !== 'vCalcio' || (tok != null && tok !== M.mt) || M.anim || CZ.aim) return;
  M.steal = false; M.msg = 'Tira un compagno…'; czHUD();
  setTimeout(() => {
    if (CZ.m !== M || M.over || M.anim || (tok != null && tok !== M.mt)) return;
    const sh = czAI(czPosOf(M.S), M.me, M.mateSkill, M.ctrl);
    M.msg = ''; const p = M.turn;
    czAnimate(sh, () => czAfterShot(p));
  }, 350);
}
function czHUD() {
  const M = CZ.m, h = $('czHud'); if (!h || !M) return;
  const me = M.me, op = 1 - me;
  const dots = (p) => '<span class="czdots">' + Array.from({ length: M.ns || CZ_SHOTS }, (_, k) => '<i class="' + (k < M.shots[p] ? 'u' : '') + '"></i>').join('') + '</span>';
  h.innerHTML = '<div class="czside' + (M.turn === op && !M.over ? ' turn' : '') + '">' + czShield(M.teams[op], 30) + '<span><b>' + esc(M.names[op]) + '</b>' + dots(op) + '</span></div>' +
    '<div class="czscore"><b>' + M.sc[op] + '</b><i>–</i><b>' + M.sc[me] + '</b><small>a ' + CZ_GOALS + ' gol</small></div>' +
    '<div class="czside me' + (M.turn === me && !M.over ? ' turn' : '') + '">' + czShield(M.teams[me], 30) + '<span><b>' + esc(M.names[me]) + '</b>' + dots(me) + '</span></div>';
  const t = $('czMsg');
  if (t) t.innerHTML = (M.car && typeof crHudExtra === 'function' ? crHudExtra(M) + ' ' : '') + (M.over ? 'Partita finita' : M.anim ? (M.msg || '…') : (M.turn === me ? (M.ctrl != null ? (M.mine ? (M.cede ? '<em>Sei troppo avanti!</em> Tira tu o tocca un compagno messo meglio.' : '<em>Tocca a te!</em> Tira la tua pedina, quella con la stella.') : M.steal ? '<em>Palla in attacco!</em> Puoi tirare tu al posto del compagno.' : 'Tocca a un compagno…') : '<em>Tocca a te!</em> Tira indietro una tua pedina e lascia.') : 'Tocca a ' + esc(M.names[op]) + '…') + (M.online ? ' <span class="oltimer" id="olTimer"></span>' : ''));
}
function czAnimate(sh, done) {
  const M = CZ.m; M.anim = true; CZ.aim = null;
  M.b0 = [M.S.x[10], M.S.y[10]]; M.lastSh = sh.i;
  czShoot(M.S, sh); fx('card');
  let lastHits = 0, lastPost = 0, goalSeen = false;
  const loop = () => {
    if (CZ.m !== M) return;
    const go = czStep(M.S);
    if (M.S.hits > lastHits) { lastHits = M.S.hits; }
    if (M.S.post > lastPost) { lastPost = M.S.post; fx('take'); }
    if (M.S.goal >= 0 && !goalSeen) { goalSeen = true; czGoalFlash(M.S.goal); }
    czDraw();
    if (go) CZ.raf = requestAnimationFrame(loop);
    else { M.anim = false; done(M.S); }
  };
  czHUD();
  CZ.raf = requestAnimationFrame(loop);
}
function czGoalFlash(team) {
  const M = CZ.m, mine = team === M.me, t = czTeam(M.teams[team]);
  fx('big');
  const el = document.createElement('div'); el.className = 'czgol' + (mine ? ' mine' : '');
  el.style.setProperty('--a', t.a); el.style.setProperty('--b', t.b);
  el.innerHTML = '<b>GOOOL!</b><small>' + esc(M.names[team]) + '</small>';
  const box = $('czField'); if (box) box.appendChild(el); setTimeout(() => el.remove(), 1900);
  try { if (navigator.vibrate) navigator.vibrate(mine ? [60, 40, 120] : 40); } catch (e) { /* niente */ }
}
/* dopo un tiro (contro il computer) */
function czAfterShot(p) {
  const M = CZ.m, S = M.S;
  M.shots[p]++;
  if (M.onShot) { try { M.onShot(M, p, S); } catch (e) { /* niente */ } }
  if (S.goal >= 0) {
    M.sc[S.goal]++;
    const pos = czStartPos(M.form && M.form[0], M.form && M.form[1]); const N = czState(pos); M.S = N;
    M.turn = 1 - S.goal; // batte il calcio d'inizio chi ha preso gol
  } else M.turn = 1 - p;
  // partite a eliminazione (tornei, coppe): in parità si va ai supplementari, chi segna vince
  const ns = M.ns || CZ_SHOTS;
  if (M.ko && M.shots[0] >= ns && M.shots[1] >= ns && M.sc[0] === M.sc[1]) { M.ns = ns + 3; M.golden = true; flash('Supplementari! Chi segna vince'); }
  const ns2 = M.ns || CZ_SHOTS;
  if (M.sc[0] >= CZ_GOALS || M.sc[1] >= CZ_GOALS || (M.golden && S.goal >= 0) || (M.shots[0] >= ns2 && M.shots[1] >= ns2)) { czEnd(); return; }
  czDraw(); czHUD();
  if (M.turn !== M.me) setTimeout(czAITurn, 700);
  else if (M.alt) czMineOrMate();
}
function czAITurn() {
  const M = CZ.m; if (!M || M.over || M.online || M.turn === M.me || view !== 'vCalcio') return;
  M.msg = esc(M.names[M.turn]) + ' prende la mira…'; czHUD();
  setTimeout(() => {
    if (CZ.m !== M || M.over) return;
    const sh = czAI(czPosOf(M.S), M.turn, M.skill);
    M.msg = ''; const p = M.turn;
    czAnimate(sh, () => czAfterShot(p));
  }, 350);
}
function czEnd() {
  const M = CZ.m; M.over = true; czHUD(); czDraw();
  if (M.mode === 'car' && typeof crMatchEnd === 'function') { crMatchEnd(M); return; }
  if (M.mode === 'tour') { czTourEnd(M); return; }
  const me = M.me, a = M.sc[me], b = M.sc[1 - me], won = a > b, tie = a === b;
  const C = czData();
  if (won) C.w++; else if (tie) C.d++; else C.l++;
  C.gf += a; C.gs += b;
  let xp = won ? 110 : tie ? 50 : 25, coins = won ? 60 : tie ? 25 : 10, extra = '';
  if (M.mode === 'camp') {
    czCampResult(a, b);
    const Cm = C.camp;
    extra = '<p class="pgnote">Giornata ' + Cm.round + ' di ' + Cm.rounds.length + ' giocata. Sei ' + (czSorted(Cm).indexOf(Cm.me) + 1) + '° in classifica.</p>';
  }
  eco().carlini += coins;
  gainXp(xp);
  const chest = grantChest(won);
  if (typeof track === 'function') track('game_end', { game: 'calcio', won });
  save();
  setTimeout(() => {
    overlay('<div class="czend"><div class="czendt">' + czShield(M.teams[me], 44) + '<span><b>' + a + '</b><i>–</i><b>' + b + '</b></span>' + czShield(M.teams[1 - me], 44) + '</div><h2>' + (won ? 'Hai vinto!' : tie ? 'Pareggio!' : 'Ha vinto ' + esc(M.names[1 - me])) + '</h2>' + extra +
      '<div class="gain"><div class="xp">+' + xp + ' XP · <i class="ico coin"></i>' + coins + '</div>' + chest + '</div>' +
      '<button class="btn" id="czNext">' + (M.mode === 'camp' ? (C.camp.done ? 'Vedi la classifica finale' : 'Vai alla classifica') : 'Un’altra partita') + '</button><button class="btn alt" id="czOut">Menu del Palluni</button></div>');
    $('czNext').onclick = () => { $('layer').innerHTML = ''; CZ.m = null; CZ.screen = M.mode === 'camp' ? 'camp' : 'pick'; czRender(); };
    $('czOut').onclick = () => { $('layer').innerHTML = ''; CZ.m = null; CZ.screen = 'menu'; czRender(); };
  }, 900);
}

/* ---------- tocco: si tira la pedina all'indietro come una fionda ---------- */
function czPt(e) {
  const cv = CZ.cv, r = cv.getBoundingClientRect(), M = CZ.m;
  let x = (e.clientX - r.left) / CZ.css - 12, y = (e.clientY - r.top) / CZ.css - 12 - CZ_GD;
  if (M && M.flip) { x = CZ_W - x; y = CZ_H - y; }
  return { x, y };
}
function czDown(e) {
  const M = CZ.m; if (!M || M.anim || !czMyTurn() || (M.online && !czOnlineCanShoot())) return;
  if (M.ctrl != null && !M.mine && !M.steal) return;
  const p = czPt(e); let best = -1, bd = (CZ_R * 1.9) ** 2;
  for (let k = 0; k < 5; k++) { const i = M.me * 5 + k; if (M.ctrl != null && i !== M.ctrl && !(M.mine && M.cede)) continue; const dx = M.S.x[i] - p.x, dy = M.S.y[i] - p.y, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = i; } }
  if (best < 0) return;
  e.preventDefault();
  CZ.aim = { i: best, sx: p.x, sy: p.y, dx: 0, dy: -1, pow: 0 };
  try { CZ.cv.setPointerCapture(e.pointerId); } catch (er) { /* niente */ }
  czDraw();
}
function czMove(e) {
  const A = CZ.aim, M = CZ.m; if (!A || !M) return;
  const p = czPt(e), x = M.S.x[A.i], y = M.S.y[A.i];
  let dx = x - p.x, dy = y - p.y; const d = Math.sqrt(dx * dx + dy * dy);
  if (d < 4) { A.pow = 0; czDraw(); return; }
  dx /= d; dy /= d;
  A.dx = dx; A.dy = dy; A.pow = Math.min(1, Math.max(0, (d - CZ_R * 0.4) / CZ_DRAG));
  czDraw();
}
function czUp() {
  const A = CZ.aim, M = CZ.m; if (!A || !M) return;
  CZ.aim = null;
  if (A.pow < 0.07) { czDraw(); if (M.steal) { const tk = M.mt; setTimeout(() => czMateTurn(tk), 1500); } return; }
  const ang = Math.atan2(A.dy, A.dx), sh = czShotVec(A.i, ang, A.pow);
  if (M.pw && M.pw !== 1 && !M.online) { sh.vx = czRound3(sh.vx * M.pw); sh.vy = czRound3(sh.vy * M.pw); }
  if (M.online) { czOnlineShoot(sh); return; }
  if (M.steal) { M.steal = false; M.mine = true; M.mt = (M.mt || 0) + 1; flash('Ci penso io!'); }
  const p = M.turn;
  czAnimate(sh, () => czAfterShot(p));
}

/* ---------- schermate ---------- */
function czPickTifo(done) {
  overlay('<div class="nickwin"><div class="nicknd">' + NDUJA_SVG + '</div><div class="nickbub"><b>Signor ’Nduja</b><span>' + tr2('E tu, pi quali squadra fai u tifu?', 'E tu, per quale squadra fai il tifo?') + '</span></div></div><div class="cztifo">' + CZ_BIG.map((id) => '<button data-tifo="' + id + '">' + czShield(id, 40) + '<b>' + CZ_TEAMS[id].n + '</b></button>').join('') + '</div><button class="btn ghost small" data-tifo="">Nessuna, tifo per il mio paese</button>');
  $('layer').querySelectorAll('[data-tifo]').forEach((b) => {
    b.onclick = () => {
      const C = czData(), id = b.dataset.tifo;
      C.tifo = id || 'paese'; C.team = id || (P.paese ? 'paese' : 'reggio'); save();
      const line = id ? CZ_TIFO_LINE[id] : 'Bravo! Il campanile prima di tutto.';
      overlay('<div class="nickwin"><div class="nicknd">' + NDUJA_SVG + '</div><div class="nickbub"><b>Signor ’Nduja</b><span>' + line + ' Allora giochi con la maglia ' + (id ? 'di ' + CZ_TEAMS[id].n : 'del tuo paese') + '. Puoi cambiare squadra quando vuoi.</span></div></div>' + czShield(C.team, 64) + '<button class="btn take" id="czTOk">Forza ' + esc(czTeam(C.team).n) + '!</button>');
      fx('big');
      $('czTOk').onclick = () => { $('layer').innerHTML = ''; if (done) done(); };
    };
  });
}
function czRender() {
  const box = $('czBox'); if (!box) return;
  cancelAnimationFrame(CZ.raf);
  const C = czData(), me = myCzTeam();
  $('vCalcio').classList.toggle('czplaying', CZ.screen === 'match');
  if (CZ.screen === 'match' && CZ.m) {
    box.innerHTML = '<div class="czhud" id="czHud"></div><div class="czfield" id="czField"><canvas id="czCv" aria-label="Campo di calcio"></canvas></div><div class="czmsg" id="czMsg"></div>' + (CZ.m.online ? '<div class="emotes">' + EMOTES.map((t, k) => '<button class="emo" data-czemo="' + k + '">' + tr(t) + '</button>').join('') + '</div><button class="btn small take" id="olClaim" data-czclaim="1" hidden>L’avversario non risponde: vinci a tavolino</button>' : '');
    CZ.cv = $('czCv');
    CZ.cv.addEventListener('pointerdown', czDown);
    CZ.cv.addEventListener('pointermove', czMove);
    CZ.cv.addEventListener('pointerup', czUp);
    CZ.cv.addEventListener('pointercancel', () => { CZ.aim = null; czDraw(); });
    requestAnimationFrame(() => { czCanvasFit(); czDraw(); });
    czHUD();
    return;
  }
  if (CZ.screen === 'camp') { czRenderCamp(box); return; }
  if (CZ.screen.startsWith('car') && typeof crRender === 'function') { crRender(box); return; }
  if (CZ.screen === 'pick' || CZ.screen === 'team') {
    // tutte le squadre: le quattro grandi, i paesi storici e poi categoria per categoria; in alto si cerca per nome
    const pk = CZ.screen === 'pick', tab = CZ.ptab == null ? -1 : CZ.ptab;
    const tabs = '<div class="crdivs czdtabs"><button data-czptab="-1" aria-pressed="' + (tab < 0) + '">★</button>' + CZ_DIVS.map((d, k) => '<button data-czptab="' + k + '" aria-pressed="' + (tab === k) + '">' + d.s + '</button>').join('') + '</div>';
    const item = (id, sub) => pk
      ? '<button data-czopp="' + esc(id) + '">' + czShield(id, 36) + '<b>' + esc(czTeam(id).n) + '</b><small>' + esc(sub) + '</small></button>'
      : '<button data-czteam="' + esc(id) + '" aria-pressed="' + (id === me) + '">' + czShield(id, 36) + '<b>' + esc(czTeam(id).n) + '</b>' + (id === C.tifo ? '<small>il tuo tifo</small>' : sub ? '<small>' + esc(sub) + '</small>' : '') + '</button>';
    const list = () => {
      const q = CZ.q || '';
      if (q.trim()) {
        const r = czSearch(q, !pk && P.paese ? [['paese', 'il tuo paese']] : null).filter(([id]) => !pk || id !== me);
        return '<p class="pgnote">' + (r.length ? r.length + (r.length === 1 ? ' squadra trovata' : ' squadre trovate') : 'Nessuna squadra con questo nome') + '</p><div class="czteams">' + r.map(([id, lab]) => item(id, lab)).join('') + '</div>';
      }
      let ids = tab < 0 ? CZ_BIG.concat(CZ_PAESI).concat(!pk && P.paese ? ['paese'] : []) : CZ_DIVS[tab].t.map(czTeamId);
      if (pk) ids = ids.filter((x) => x !== me);
      const lab = tab < 0 ? 'Le squadre storiche' : CZ_DIVS[tab].n + ' · ' + CZ_DIVS[tab].t.length + ' paesi';
      return '<p class="pgnote">' + lab + '</p><div class="czteams">' + ids.map((id) => item(id, tab < 0 ? (pk ? (CZ_BIG.includes(id) ? 'Forte' : 'Di paese') : '') : CZ_DIVS[tab].s)).join('') + '</div>';
    };
    box.innerHTML = '<button class="czback" data-cz="menu">◀ Indietro</button><h3 class="czh">' + (pk ? 'Amichevole: scegli l’avversario' : 'Con quale maglia giochi?') + '</h3><label class="czsearch"><span aria-hidden="true">🔍</span><input id="czQ" type="search" placeholder="Cerca un paese o una squadra" autocomplete="off" value="' + esc(CZ.q || '') + '"></label>' + tabs + '<div id="czList">' + list() + '</div>' + (pk ? '' : '<p class="pgnote">La squadra che scegli vale per le amichevoli, l’online e il prossimo campionato.</p>');
    $('czQ').addEventListener('input', (e) => { CZ.q = e.target.value; $('czList').innerHTML = list(); });
    return;
  }
  // menu principale
  const nm = czNextMatch(), Cm = C.camp;
  box.innerHTML = '<div class="czhero"><div class="czhbg" aria-hidden="true"></div><div class="czhball" aria-hidden="true"></div><h3>U Palluni</h3><p>Il calcio a punta di dito</p><button class="czmyteam" data-cz="team">' + czShield(me, 46) + '<span><small>La tua squadra</small><b>' + esc(czTeam(me).n) + '</b><em>cambia ▸</em></span></button></div>' +
    '<div class="czmodes"><button class="czmode camp" data-cz="camp"><span class="czmi">🏆</span><b>Campionato</b><small>' + (Cm && !Cm.done ? (Cm.div != null ? CZ_DIVS[Cm.div].n + ' · ' : 'Stagione ' + Cm.season + ' · ') + 'giornata ' + (Cm.round + 1) + ' di ' + Cm.rounds.length : CZ_DIVS[C.div || 0].n + ': sali fino alla Serie D') + '</small>' + (nm ? '<span class="czvs">' + czShield(nm[0], 22) + '<i>vs</i>' + czShield(nm[1], 22) + '</span>' : '') + '</button>' +
    (typeof crMenuBtn === 'function' ? crMenuBtn() : '') +
    '<button class="czmode" data-cz="pick"><span class="czmi">⚽</span><b>Amichevole</b><small>Contro la squadra che vuoi</small></button>' +
    '<button class="czmode ol" data-cz="online"><span class="czmi">🌐</span><b>Online</b><small>Contro una persona vera o sfida un amico</small></button></div>' +
    '<div class="czstats"><span><b>' + C.w + '</b>vinte</span><span><b>' + C.d + '</b>pari</span><span><b>' + C.l + '</b>perse</span><span><b>' + C.gf + '</b>gol fatti</span><span><b>' + C.cups + '</b>scudetti</span></div>';
}
function czRenderCamp(box) {
  const C = czData();
  if (!C.camp) czNewCamp();
  const Cm = C.camp, srt = czSorted(Cm), nm = czNextMatch();
  const dv = Cm.div == null ? -1 : Cm.div, nT = Cm.teams.length;
  let h = '<button class="czback" data-cz="menu">◀ Indietro</button><h3 class="czh">' + (dv >= 0 ? CZ_DIVS[dv].n : 'Campionato calabrese') + ' · Stagione ' + Cm.season + '</h3>';
  if (dv >= 0) h += '<div class="czladder">' + CZ_DIVS.map((D, k) => '<span class="' + (k === dv ? 'cur' : k < dv ? 'past' : '') + '"><b>' + D.s + '</b><small>' + D.n.replace(' Categoria', '') + '</small></span>').join('<i>›</i>') + '</div><p class="czlegend"><span class="up">▲ primi ' + CZ_UP + ' salgono</span>' + (dv > 0 ? '<span class="down">▼ ultimi ' + CZ_DOWN + ' scendono</span>' : '<span>dalla Terza non si scende</span>') + '</p>';
  if (nm) h += '<div class="cznext"><small>Giornata ' + (Cm.round + 1) + ' di ' + Cm.rounds.length + '</small><div class="cznm">' + czShield(nm[0], 40) + '<b>' + esc(czTeam(nm[0]).n) + '</b><i>vs</i><b>' + esc(czTeam(nm[1]).n) + '</b>' + czShield(nm[1], 40) + '</div><button class="btn take" data-cz="play">Gioca la partita</button></div>';
  else {
    const O = czOutcome(Cm), pos = O.pos;
    const nx = O.k === 'up' ? CZ_DIVS[dv + 1].n : O.k === 'down' ? CZ_DIVS[dv - 1].n : dv >= 0 ? CZ_DIVS[dv].n : '';
    const ttl = O.k === 'top' ? 'Campioni di Serie D!' : O.k === 'up' ? (O.champ ? 'Campioni e promossi!' : 'Promossi!') : O.k === 'down' ? 'Retrocessi…' : O.champ ? 'Campione di Calabria!' : 'Stagione finita: ' + pos + '° posto';
    const txt = O.k === 'top' ? 'Hai vinto la Serie D: il paese è in festa e la squadra sbarca tra i professionisti! Resti in D per difendere il titolo.' : O.k === 'up' ? 'La prossima stagione si gioca in ' + nx + '!' : O.k === 'down' ? 'Si scende in ' + nx + '. Testa alta: si risale subito!' : O.k === 'stay' ? 'Salvi: anche l’anno prossimo in ' + nx + '.' : '';
    h += '<div class="cznext done ' + O.k + '"><div class="czcup">' + (O.k === 'top' ? '🏆' : O.k === 'up' ? '⬆️' : O.k === 'down' ? '⬇️' : pos === 1 ? '🏆' : '⚽') + '</div><h3>' + ttl + '</h3><p>' + txt + '</p>' + (Cm.paid ? '' : '<button class="btn take" data-cz="prize">Ritira il premio</button>') + '<button class="btn" data-cz="newseason">Nuova stagione</button></div>';
  }
  h += '<table class="cztable"><thead><tr><th></th><th>Squadra</th><th>G</th><th>V</th><th>N</th><th>P</th><th>DR</th><th>Pt</th></tr></thead><tbody>' + srt.map((id, k) => { const r = Cm.table[id]; return '<tr class="' + (id === Cm.me ? 'me ' : '') + (dv >= 0 && k < CZ_UP && dv < CZ_DIVS.length - 1 ? 'up' : dv > 0 && k >= nT - CZ_DOWN ? 'down' : '') + '"><td>' + (k + 1) + '</td><td class="czt">' + czShield(id, 18) + esc(czTeam(id).n) + '</td><td>' + r.g + '</td><td>' + r.w + '</td><td>' + r.d + '</td><td>' + r.l + '</td><td>' + (r.gf - r.gs > 0 ? '+' : '') + (r.gf - r.gs) + '</td><td><b>' + r.pt + '</b></td></tr>'; }).join('') + '</tbody></table>';
  if (Cm.last && Cm.last.length) h += '<h4 class="czsub">Risultati della giornata ' + Cm.round + '</h4><div class="czres">' + Cm.last.map(([a, b, ga, gb]) => '<div class="' + (a === Cm.me || b === Cm.me ? 'me' : '') + '"><span>' + esc(czTeam(a).n) + '</span><b>' + ga + ' – ' + gb + '</b><span>' + esc(czTeam(b).n) + '</span></div>').join('') + '</div>';
  h += '<p class="pgnote">Vittoria 3 punti, pareggio 1. Più sali di categoria, più gli avversari sono forti e più ricchi sono i premi. Vincere il girone vale un baule d’oro.</p>' + (P.calcio.troph && P.calcio.troph.length ? '<div class="cztroph"><small>Bacheca</small>' + P.calcio.troph.map((x) => '<span>🏆 ' + esc(x) + '</span>').join('') + '</div>' : '');
  box.innerHTML = h;
}
function czClick(e) {
  if (typeof crClick === 'function' && crClick(e)) return;
  const t = e.target;
  const b = t.closest('[data-cz]');
  if (b) {
    const a = b.dataset.cz;
    if (a === 'menu' || a === 'camp' || a === 'pick' || a === 'team') { CZ.screen = a; czRender(); return; }
    if (a === 'online') { OL.game = 'calcio'; go('vOnline'); return; }
    if (a === 'play') {
      const nm = czNextMatch(); if (!nm) return;
      const C = czData(), opp = nm[0] === C.camp.me ? nm[1] : nm[0];
      const run = () => czMatchStart({ mode: 'camp', myTeam: C.camp.me, oppTeam: opp, skill: czStrength(opp, C.camp.season) });
      typeof energyGate === 'function' ? energyGate(run) : run();
      return;
    }
    if (a === 'prize') {
      const C = czData(), Cm = C.camp; if (Cm.paid) return;
      const O = czOutcome(Cm), pos = O.pos, dv = Cm.div == null ? 2 : Cm.div;
      const coins = (pos === 1 ? 300 : O.k === 'up' ? 220 : O.k === 'down' ? 40 : 100) + dv * 80;
      Cm.paid = true; eco().carlini += coins;
      let ch = '';
      if (pos === 1 && Cm.div != null) { C.troph = C.troph || []; C.troph.push(CZ_DIVS[dv].n + ' ' + Cm.season); }
      if (pos === 1) { C.cups++; const E = eco(); if (E.chests.length < SLOTS) { E.chests.push({ id: 'c' + Date.now().toString(36), grade: 'oro', start: null, end: null, sped: false }); ch = '<div class="chestnote"><span class="chmini">' + chestSVG('oro') + '</span>E un <b>baule d’oro</b>!</div>'; } if (!P.titles) P.titles = []; if (!P.titles.includes('Campione del Palluni')) P.titles.push('Campione del Palluni'); }
      save(); fx('big');
      overlay('<h2>' + (pos === 1 ? 'Primi in classifica!' : O.k === 'up' ? 'Premio promozione' : 'Premio di fine stagione') + '</h2><p><i class="ico coin"></i> <b>' + coins + ' carlini</b></p>' + ch + '<button class="btn" id="czPOk">Evviva!</button>');
      $('czPOk').onclick = () => { $('layer').innerHTML = ''; czRender(); };
      return;
    }
    if (a === 'newseason') {
      const C = czData(), O = C.camp ? czOutcome(C.camp) : { k: 'stay' };
      if (C.camp && C.camp.div != null) { if (O.k === 'up') C.div = C.camp.div + 1; else if (O.k === 'down') C.div = C.camp.div - 1; else C.div = C.camp.div; }
      if (C.div == null) C.div = 0;
      C.season++; C.camp = null; czNewCamp(); czRender();
      if (O.k === 'up') { fx('big'); flash('Benvenuti in ' + CZ_DIVS[C.div].n + '!'); }
      return;
    }
  }
  const pt = t.closest('[data-czptab]'); if (pt) { CZ.ptab = +pt.dataset.czptab; CZ.q = ''; czRender(); return; }
  const o = t.closest('[data-czopp]');
  if (o) { const id = o.dataset.czopp, dv = CZ_DIVS.findIndex((d) => d.t.includes(czTeam(id).n)), run = () => czMatchStart({ mode: 'friendly', oppTeam: id, skill: dv >= 0 && !CZ_BIG.includes(id) ? CZ_DIVS[dv].base + 0.05 : czStrength(id, 1) + 0.05 }); typeof energyGate === 'function' ? energyGate(run) : run(); return; }
  const tm = t.closest('[data-czteam]');
  if (tm) { const C = czData(); C.team = tm.dataset.czteam; if (C.camp && !C.camp.done && C.camp.round === 0) { C.camp = null; } save(); flash('Forza ' + czTeam(C.team).n + '!'); CZ.screen = 'menu'; czRender(); return; }
  const em = t.closest('[data-czemo]'); if (em && typeof sendEmote === 'function') { sendEmote(+em.dataset.czemo); return; }
  if (t.closest('[data-czclaim]') && typeof claimWin === 'function') claimWin();
}
function czQuit() {
  const M = CZ.m;
  if (!M || M.over || CZ.screen !== 'match') { CZ.m = null; CZ.screen = 'menu'; go('vHome'); return; }
  if (M.online) { overlay('<h2>Lasci la partita?</h2><p>Se esci adesso la partita la vince l’avversario.</p><button class="btn" id="czQY">Esco</button><button class="btn alt" id="czQN">Resto</button>'); $('czQY').onclick = () => { $('layer').innerHTML = ''; olLeave(); CZ.m = null; CZ.screen = 'menu'; go('vOnline'); }; $('czQN').onclick = () => { $('layer').innerHTML = ''; }; return; }
  if (M.mode === 'car' && typeof crQuit === 'function') { crQuit(M); return; }
  if (M.mode === 'tour') { overlay('<h2>Lasci la partita?</h2><p>Vale come una sconfitta: esci dal torneo.</p><button class="btn" id="czQY">Esco</button><button class="btn alt" id="czQN">Resto</button>'); $('czQY').onclick = () => { $('layer').innerHTML = ''; cancelAnimationFrame(CZ.raf); CZ.m = null; window.TOUR_FIGHT = null; if (typeof tourResult === 'function') tourResult(false); CZ.screen = 'menu'; TOUR_TAB = 'cpu'; go('vTornei'); }; $('czQN').onclick = () => { $('layer').innerHTML = ''; }; return; }
  overlay('<h2>Lasci la partita?</h2><p>' + (M.mode === 'camp' ? 'In campionato vale come una sconfitta 3 a 0.' : 'Questa amichevole non conta.') + '</p><button class="btn" id="czQY">Esco</button><button class="btn alt" id="czQN">Resto</button>');
  $('czQY').onclick = () => { $('layer').innerHTML = ''; cancelAnimationFrame(CZ.raf); if (M.mode === 'camp') { czCampResult(0, 3); const C = czData(); C.l++; C.gs += 3; save(); } CZ.m = null; CZ.screen = M.mode === 'camp' ? 'camp' : 'menu'; czRender(); };
  $('czQN').onclick = () => { $('layer').innerHTML = ''; };
}
function czOpen() {
  const C = czData();
  const after = () => { if (!C.tifo) czPickTifo(() => czRender()); };
  if (!ndSeen('calcio')) showNduja('calcio', after); else after();
  czRender();
}
/* la scheda nella pagina delle avventure */
function czCard() {
  const C = czData();
  return '<button class="advc av av-calcio" data-go="vCalcio"><span class="avspr czcardpic">' + czShield(myCzTeam(), 30) + '<span class="czcball"></span></span><b>U Palluni</b><small>' + (C.tifo ? 'Forza ' + esc(czTeam(myCzTeam()).n) + '! ' + (C.camp && !C.camp.done ? 'Giornata ' + (C.camp.round + 1) + ' del campionato' : 'Il campionato calabrese ti aspetta') : 'Il calcio a punta di dito: Reggio, Catanzaro, Cosenza, Lamezia e i paesi') + '</small>' + (C.w + C.d + C.l === 0 ? '<span class="cznew">Nuovo!</span>' : '') + '</button>';
}

/* ---------- online ---------- */
/* stato nella stanza: cz = { pos: [x0,y0,...] (22 numeri), sc: [0,0], sh: [0,0], from: [...] } */
function czDeal(st) {
  st.cz = { pos: czStartPos(), sc: [0, 0], sh: [0, 0], from: null };
  st.total = [0, 0];
  st.turn = 1 - st.dealer;
}
function applyCalcio(st, p, shot) {
  const z = st.cz, from = z.pos.slice();
  const S = czRun(from, shot);
  let goal = S.goal;
  z.from = from; z.sh = [z.sh[0] + (p === 0 ? 1 : 0), z.sh[1] + (p === 1 ? 1 : 0)];
  if (goal >= 0) { z.sc = [z.sc[0] + (goal === 0 ? 1 : 0), z.sc[1] + (goal === 1 ? 1 : 0)]; z.pos = czStartPos(); st.turn = 1 - goal; }
  else { z.pos = czPosOf(S); st.turn = 1 - p; }
  st.total = z.sc.slice();
  st.lastMove = { p, n: (st.lastMove ? st.lastMove.n : 0) + 1, shot: shot || null, goal, card: '', took: [] };
  if (z.sc[0] >= CZ_GOALS || z.sc[1] >= CZ_GOALS || (z.sh[0] >= CZ_SHOTS && z.sh[1] >= CZ_SHOTS)) {
    st.status = 'done'; st.endReason = 'punti'; st.winner = z.sc[0] > z.sc[1] ? 0 : z.sc[1] > z.sc[0] ? 1 : 2;
  }
  return st;
}
function czOnlineCanShoot() { const d = OL.room; return !!(d && d.status === 'playing' && d.turn === meIdx() && !OL.busy && !CZ.m.anim); }
function czOnlineView() {
  const d = OL.room;
  const me = meIdx(), cteam = (d && d.cteam) || ['reggio', 'catanzaro'];
  let t0 = cteam[0] || 'reggio', t1 = cteam[1] || 'catanzaro';
  if (t1 === t0) t1 = CZ_BIG.find((x) => x !== t0);
  CZ.screen = 'match';
  CZ.m = { S: czState(d && d.cz ? d.cz.pos : czStartPos()), teams: [t0, t1], me, flip: me === 1, turn: d ? d.turn : 0, sc: d && d.cz ? d.cz.sc.slice() : [0, 0], shots: d && d.cz ? d.cz.sh.slice() : [0, 0], mode: 'online', anim: false, over: false, online: true, names: d ? d.names.slice(0, 2) : ['', ''], msg: '', ready: !!(d && d.cz && me >= 0) };
  if (view !== 'vCalcio') go('vCalcio');
  czRender();
}
/* chiamata da renderOnlineGame */
function czOnlineRender(d) {
  if (!CZ.m || !CZ.m.online || view !== 'vCalcio' || !CZ.m.ready || CZ.m.me !== meIdx()) { czOnlineView(); return; }
  if (!CZ.m.anim) czOnlineSync(d);
}
function czOnlineSync(d) {
  const M = CZ.m; if (!M || !M.online || !d.cz) return;
  M.turn = d.turn; M.sc = d.cz.sc.slice(); M.shots = d.cz.sh.slice(); M.names = d.names.slice(0, 2);
  if (!M.anim) { M.S = czState(d.cz.pos); czDraw(); }
  czHUD();
}
/* un tiro arrivato dalla stanza: si rifà lo stesso tiro, poi si allinea con le posizioni salvate */
function czOnlineMove(d, prev) {
  const M = CZ.m, m = d.lastMove;
  if (!M || !M.online || !m) return;
  if (OL.czLocal === m.n) { OL.czLocal = null; if (!M.anim) czOnlineSync(d); else OL.czAfter = d; return; }
  if (!m.shot) { flash(m.p === meIdx() ? 'Tempo scaduto!' : 'L’avversario ha saltato il tiro'); czOnlineSync(d); return; }
  M.S = czState(d.cz.from || (prev && prev.cz ? prev.cz.pos : d.cz.pos));
  OL.animating = true;
  czAnimate(m.shot, () => { OL.animating = false; czOnlineSync(OL.room || d); if (OL.endPending) { OL.endPending = false; endOnline(); } });
}
async function czOnlineShoot(sh) {
  const M = CZ.m; if (OL.busy) return;
  OL.busy = true;
  const d0 = OL.room, n = (d0.lastMove ? d0.lastMove.n : 0) + 1;
  OL.czLocal = n; OL.animating = true; OL.czAfter = null;
  czAnimate(sh, () => { OL.animating = false; const d = OL.czAfter || OL.room; OL.czAfter = null; if (d) czOnlineSync(d); if (OL.endPending) { OL.endPending = false; endOnline(); } });
  try { await czSend(sh); }
  catch (e) { OL.czLocal = null; flash(e.message === 'turno' ? 'Non è il tuo turno' : 'Errore di rete'); cancelAnimationFrame(CZ.raf); M.anim = false; OL.animating = false; if (OL.room) czOnlineSync(OL.room); }
  OL.busy = false;
}
async function czSend(sh) {
  const ref = FB.doc(OL.db, 'rooms', OL.rid), me = meIdx();
  await FB.runTransaction(OL.db, async (tx) => {
    const s = await tx.get(ref); const d = s.data();
    if (!d || d.status !== 'playing' || d.turn !== me) throw new Error('turno');
    const st = cloneState(d);
    applyCalcio(st, me, sh);
    tx.update(ref, Object.assign(st, { v: d.v + 1, lastMoveAt: FB.serverTimestamp() }));
  });
}
function czTick(d, me, el) {
  const t = $('olTimer');
  if (t) { const left = Math.max(0, Math.ceil((TURN_MS - el) / 1000)); t.textContent = left + 's'; t.classList.toggle('low', left <= 10); }
  if (d.turn === me && el > TURN_MS && !OL.busy && !OL.animating && !(CZ.m && CZ.m.anim)) { OL.busy = true; czSend(null).catch(() => {}).then(() => { OL.busy = false; }); }
  const cl = $('olClaim'); if (cl) cl.hidden = !(d.turn !== me && el > CLAIM_MS && Date.now() - tms(d.lastMoveAt) > CLAIM_MS + 2000);
}

/* ---------- la schermata nel gioco ---------- */
(() => {
  if (!$('vCalcio')) {
    const s = document.createElement('section'); s.className = 'view'; s.id = 'vCalcio'; s.hidden = true;
    s.innerHTML = '<div class="topbar"><h2>U Palluni</h2><span class="tbr"><button class="btn ghost small" id="czRules">Regole</button><button class="btn ghost small" id="czHome">Menu</button></span></div><div class="czbox" id="czBox"></div>';
    $('vHome').parentNode.insertBefore(s, $('vHome').nextSibling);
    s.addEventListener('click', czClick);
    $('czRules').onclick = () => { if (!ND.open) showNduja(/^car/.test(CZ.screen) || (CZ.m && CZ.m.car) ? 'carriera' : 'calcio'); };
    $('czHome').onclick = czQuit;
    window.addEventListener('resize', () => { if (view === 'vCalcio' && CZ.screen === 'match') { czCanvasFit(); czDraw(); } });
    setInterval(() => { if (view === 'vCalcio' && CZ.m && !CZ.m.anim && czMyTurn()) { CZ.pulse = !CZ.pulse; if (!CZ.aim) czDraw(); } }, 600);
  }
  const oldGo = go;
  go = function (v) {
    oldGo(v);
    $('vCalcio').hidden = v !== 'vCalcio';
    if (v === 'vCalcio' && !(CZ.m && CZ.m.online && !CZ.m.over && OL.rid)) { if (!CZ.m || CZ.m.over || CZ.m.online) { CZ.m = null; if (CZ.screen === 'match') CZ.screen = 'menu'; } czOpen(); }
  };
})();

/* ---------- torneo contro il computer: la Coppa du Palluni ---------- */
function czTourStart(foe, r) {
  const run = () => {
    go('vCalcio');
    const opp = czTeamId(foe.t);
    czMatchStart({ mode: 'tour', oppTeam: opp, skill: 0.5 + r * 0.14, ko: true, tourFoe: foe.n });
    CZ.screen = 'match';
  };
  run();   // le partite del torneo non consumano energia, come quelle a carte
}
function czTourEnd(M) {
  const me = M.me, a = M.sc[me], b = M.sc[1 - me], won = a > b;
  window.TOUR_FIGHT = null;
  const msg = typeof tourResult === 'function' ? tourResult(won) : '';
  const xp = won ? 110 : 25, coins = won ? 60 : 10;
  eco().carlini += coins; gainXp(xp);
  const C = czData(); if (won) C.w++; else C.l++; C.gf += a; C.gs += b;
  if (typeof track === 'function') track('game_end', { game: 'calcio', won, tour: 1 });
  save();
  setTimeout(() => {
    overlay('<div class="czend"><div class="czendt">' + czShield(M.teams[me], 44) + '<span><b>' + a + '</b><i>–</i><b>' + b + '</b></span>' + czShield(M.teams[1 - me], 44) + '</div><h2>' + (won ? 'Vittoria!' : 'Sconfitta') + '</h2>' + (M.golden ? '<p class="pgnote">Decisa ai supplementari</p>' : '') + '<p>🏆 ' + esc(msg) + '</p><div class="gain"><div class="xp">+' + xp + ' XP · <i class="ico coin"></i>' + coins + '</div></div><button class="btn" id="czOut">Torna al torneo</button></div>');
    $('czOut').onclick = () => { $('layer').innerHTML = ''; CZ.m = null; CZ.screen = 'menu'; TOUR_TAB = 'cpu'; go('vTornei'); };
  }, 900);
}
