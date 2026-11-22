/* ================= U PALLUNI: la carriera =================
   Due carriere:
   - GIOCATORE: crei il tuo calciatore (nome, età, ruolo, numero, squadra). In partita muovi solo la tua pedina
     (quella con la stella), i compagni tirano da soli a turni alterni. Voto in pagella in tempo reale.
     Si cresce, si invecchia, a fine stagione arrivano le offerte: anche dalla Germania, dall'Australia, dagli Stati Uniti...
     Con un buon rendimento arriva la chiamata della Nazionale. A 34 anni ci si può ritirare, a 38 si smette.
   - ALLENATORE: scegli la panchina, il modulo e i rinforzi. La società ti dà un obiettivo:
     se lo manchi la fiducia scende e puoi essere esonerato; se lo centri ti cercano club più grandi, anche all'estero.
   Nomi: solo città e paesi, maglie inventate. */

if (typeof RULES !== 'undefined') {
  RULES.carriera = [
    'La carriera! Puoi farla da giocatore o da allenatore.',
    'Da giocatore muovi solo la tua pedina, quella con la stella. Quando tocca alla tua squadra, una volta tiri tu e una volta un compagno.',
    'Il voto in pagella cambia mentre giochi: sale con gol, assist, salvataggi e bei tiri, scende con tiri a vuoto, palle perse e gol subiti.',
    'Più voti alti prendi, più cresce la tua valutazione. A fine stagione il procuratore ti porta le offerte: anche dalla Germania, dall’Australia o dall’Inghilterra!',
    'Se sei troppo avanti e la palla è nella tua metà campo, puoi far tirare un compagno messo meglio: basta toccarlo. E se la palla è in attacco puoi tirare tu anche quando toccherebbe a un compagno.',
    'Arrivi primo o secondo in una Serie A importante? La stagione dopo giochi la Coppa d’Europa. Terzo o quarto, la Coppa Continentale. Partite secche: in parità ci sono i supplementari.',
    'Con lo stipendio compri casa e macchina. Se ti fidanzi, curala: l’umore della fidanzata cambia il tuo voto di partenza. Poi magari matrimonio e figli! Ogni due stagioni compi un anno.',
    'Da allenatore giochi con tutta la squadra, scegli il modulo e compri i rinforzi. Ma attento alla fiducia della società: se scende a zero, sei esonerato.',
  ];
}
/* ---------- campionati ---------- */
const CR_LIST = [];
CZ_DIVS.forEach((D, k) => CR_LIST.push({ id: 'cal' + k, n: D.n, pz: 'Calabria', fl: '🇮🇹', base: D.base, t: D.t }));
CR_LIST.push(
  { id: 'itC', n: 'Serie C', pz: 'Italia', fl: '🇮🇹', base: 0.84, t: ['Messina', 'Trapani', 'Potenza', 'Salerno', 'Foggia', 'Taranto', 'Avellino', 'Benevento', 'Monopoli', 'Siracusa', 'Picerno', 'Latina', 'Matera', 'Caserta', 'Altamura', 'Andria', 'Barletta', 'Torre del Greco', 'Cerignola', 'Giugliano'] },
  { id: 'itB', n: 'Serie B', pz: 'Italia', fl: '🇮🇹', base: 0.88, t: ['Bari', 'Palermo', 'Pescara', 'Catania', 'Modena', 'Cesena', 'Brescia', 'Padova', 'Ascoli', 'Perugia', 'Cagliari', 'Venezia', 'Spezia', 'Pisa', 'Cremona', 'Carrara', 'Mantova', 'Frosinone', 'Empoli', 'Sassari'] },
  { id: 'itA', n: 'Serie A', pz: 'Italia', fl: '🇮🇹', base: 0.93, t: ['Milano', 'Torino', 'Roma', 'Napoli', 'Firenze', 'Bologna', 'Genova', 'Bergamo', 'Verona', 'Udine', 'Lecce', 'Como', 'Parma', 'Monza', 'Sassuolo', 'Reggio Emilia'] },
  { id: 'ger3', n: 'Serie C tedesca', pz: 'Germania', fl: '🇩🇪', base: 0.83, t: ['Dresda', 'Essen', 'Saarbrücken', 'Aquisgrana', 'Osnabrück', 'Mannheim', 'Ingolstadt', 'Wiesbaden', 'Bielefeld', 'Duisburg', 'Ulm', 'Münster', 'Erfurt', 'Jena', 'Cottbus'] },
  { id: 'ger2', n: 'Serie B tedesca', pz: 'Germania', fl: '🇩🇪', base: 0.87, t: ['Amburgo', 'Hannover', 'Norimberga', 'Düsseldorf', 'Kaiserslautern', 'Karlsruhe', 'Rostock', 'Magdeburgo', 'Paderborn', 'Darmstadt', 'Bochum', 'Kiel', 'Fürth', 'Braunschweig'] },
  { id: 'ger', n: 'Serie A tedesca', pz: 'Germania', fl: '🇩🇪', base: 0.93, t: ['Monaco', 'Dortmund', 'Berlino', 'Colonia', 'Francoforte', 'Stoccarda', 'Brema', 'Lipsia', 'Gelsenkirchen', 'Friburgo', 'Wolfsburg', 'Mönchengladbach', 'Leverkusen', 'Augusta', 'Magonza'] },
  { id: 'eng3', n: 'Serie C inglese', pz: 'Inghilterra', fl: '🏴', base: 0.84, t: ['Bolton', 'Wigan', 'Reading', 'Portsmouth', 'Oxford', 'Cambridge', 'Plymouth', 'Exeter', 'Barnsley', 'Lincoln', 'Peterborough', 'Northampton', 'Wycombe', 'Blackpool'] },
  { id: 'eng2', n: 'Serie B inglese', pz: 'Inghilterra', fl: '🏴', base: 0.88, t: ['Norwich', 'Middlesbrough', 'Sunderland', 'Coventry', 'Bristol', 'Derby', 'Stoke', 'Hull', 'Ipswich', 'Swansea', 'Cardiff', 'Watford', 'Preston', 'Blackburn'] },
  { id: 'eng', n: 'Serie A inglese', pz: 'Inghilterra', fl: '🏴', base: 0.95, t: ['Londra', 'Manchester', 'Liverpool', 'Birmingham', 'Leeds', 'Newcastle', 'Sheffield', 'Brighton', 'Southampton', 'Nottingham', 'Leicester', 'Bournemouth'] },
  { id: 'esp2', n: 'Serie B spagnola', pz: 'Spagna', fl: '🇪🇸', base: 0.88, t: ['Oviedo', 'Gijón', 'Santander', 'Cadice', 'Almería', 'Elche', 'Huesca', 'Burgos', 'Cordova', 'Valladolid', 'Tenerife', 'Las Palmas', 'La Coruña', 'Leganés'] },
  { id: 'esp', n: 'Serie A spagnola', pz: 'Spagna', fl: '🇪🇸', base: 0.94, t: ['Madrid', 'Barcellona', 'Siviglia', 'Valencia', 'Bilbao', 'Malaga', 'Vigo', 'Saragozza', 'Pamplona', 'Granada', 'San Sebastián', 'Villarreal', 'Getafe', 'Palma'] },
  { id: 'fra2', n: 'Serie B francese', pz: 'Francia', fl: '🇫🇷', base: 0.86, t: ['Saint-Étienne', 'Le Havre', 'Metz', 'Caen', 'Amiens', 'Grenoble', 'Auxerre', 'Digione', 'Angers', 'Lorient', 'Bastia', 'Ajaccio', 'Nîmes', 'Guingamp'] },
  { id: 'fra', n: 'Serie A francese', pz: 'Francia', fl: '🇫🇷', base: 0.91, t: ['Parigi', 'Marsiglia', 'Lione', 'Lilla', 'Nizza', 'Rennes', 'Nantes', 'Bordeaux', 'Tolosa', 'Strasburgo', 'Montpellier', 'Lens', 'Reims', 'Brest'] },
  { id: 'por', n: 'Serie A portoghese', pz: 'Portogallo', fl: '🇵🇹', base: 0.88, t: ['Lisbona', 'Porto', 'Braga', 'Guimarães', 'Coimbra', 'Funchal', 'Faro', 'Setúbal', 'Aveiro', 'Vizela', 'Famalicão', 'Chaves', 'Estoril', 'Arouca'] },
  { id: 'ned', n: 'Serie A olandese', pz: 'Olanda', fl: '🇳🇱', base: 0.88, t: ['Amsterdam', 'Rotterdam', 'Eindhoven', 'L’Aia', 'Utrecht', 'Groninga', 'Alkmaar', 'Arnhem', 'Nimega', 'Enschede', 'Heerenveen', 'Zwolle', 'Breda', 'Tilburg'] },
  { id: 'aus2', n: 'Serie B australiana', pz: 'Australia', fl: '🇦🇺', base: 0.78, t: ['Sunshine Coast', 'Bendigo', 'Launceston', 'Toowoomba', 'Mackay', 'Rockhampton', 'Bunbury', 'Albury', 'Wagga Wagga', 'Mildura', 'Bathurst', 'Shepparton'] },
  { id: 'aus', n: 'Serie A australiana', pz: 'Australia', fl: '🇦🇺', base: 0.83, t: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Canberra', 'Wollongong', 'Geelong', 'Darwin', 'Hobart', 'Townsville', 'Cairns', 'Ballarat'] },
  { id: 'usa2', n: 'Serie B americana', pz: 'Stati Uniti', fl: '🇺🇸', base: 0.80, t: ['Phoenix', 'Detroit', 'Las Vegas', 'Pittsburgh', 'Sacramento', 'Tampa', 'Louisville', 'Memphis', 'El Paso', 'Tulsa', 'Charleston', 'Indianapolis', 'Albuquerque', 'Orlando'] },
  { id: 'usa', n: 'Serie A americana', pz: 'Stati Uniti', fl: '🇺🇸', base: 0.86, t: ['New York', 'Los Angeles', 'Miami', 'Chicago', 'Seattle', 'Atlanta', 'Dallas', 'Boston', 'Denver', 'Houston', 'Columbus', 'Portland', 'San Diego', 'Nashville'] },
  { id: 'bra', n: 'Serie A brasiliana', pz: 'Brasile', fl: '🇧🇷', base: 0.89, t: ['Rio de Janeiro', 'San Paolo', 'Belo Horizonte', 'Porto Alegre', 'Salvador', 'Recife', 'Fortaleza', 'Curitiba', 'Santos', 'Goiânia', 'Belém', 'Manaus', 'Florianópolis', 'Natal'] },
  { id: 'arg', n: 'Serie A argentina', pz: 'Argentina', fl: '🇦🇷', base: 0.88, t: ['Buenos Aires', 'Rosario', 'Córdoba', 'La Plata', 'Mendoza', 'Santa Fe', 'Tucumán', 'Mar del Plata', 'Avellaneda', 'Bahía Blanca', 'Salta', 'Paraná', 'Quilmes', 'Lanús'] },
);
const crLg = (id) => CR_LIST.find((l) => l.id === id) || CR_LIST[0];
/* chi sale e chi scende: [sotto, sopra] */
const CR_UD = { itC: ['cal5', 'itB'], itB: ['itC', 'itA'], itA: ['itB', null], ger3: [null, 'ger2'], ger2: ['ger3', 'ger'], ger: ['ger2', null], eng3: [null, 'eng2'], eng2: ['eng3', 'eng'], eng: ['eng2', null], esp2: [null, 'esp'], esp: ['esp2', null], fra2: [null, 'fra'], fra: ['fra2', null], aus2: [null, 'aus'], aus: ['aus2', null], usa2: [null, 'usa'], usa: ['usa2', null] };
CZ_DIVS.forEach((D, k) => { CR_UD['cal' + k] = [k ? 'cal' + (k - 1) : null, k < CZ_DIVS.length - 1 ? 'cal' + (k + 1) : 'itC']; });
const CR_UP = 2, CR_DOWN = 2;

/* nazionali (solo colori, niente stemmi) */
Object.assign(CZ_TEAMS, {
  naz_ita: { n: 'Italia', a: '#1D4E9E', b: '#FFFFFF', pat: 'plain', gk: '#2E7D32', s: 'IT' },
  naz_ger: { n: 'Germania', a: '#FFFFFF', b: '#1A1A1A', pat: 'hoops', gk: '#2E7D32', s: 'DE' },
  naz_fra: { n: 'Francia', a: '#1D3E8F', b: '#FFFFFF', pat: 'plain', gk: '#F2C200', s: 'FR' },
  naz_esp: { n: 'Spagna', a: '#C8102E', b: '#F2C200', pat: 'plain', gk: '#1A1A1A', s: 'ES' },
  naz_eng: { n: 'Inghilterra', a: '#FFFFFF', b: '#1D3E8F', pat: 'plain', gk: '#F2C200', s: 'EN' },
  naz_bra: { n: 'Brasile', a: '#F2C200', b: '#2E7D32', pat: 'hoops', gk: '#1D3E8F', s: 'BR' },
  naz_arg: { n: 'Argentina', a: '#7FC7EA', b: '#FFFFFF', pat: 'stripes', gk: '#1A1A1A', s: 'AR' },
  naz_por: { n: 'Portogallo', a: '#8C1C2B', b: '#2E7D32', pat: 'half', gk: '#F2C200', s: 'PT' },
});
const CR_NAZ = ['naz_ger', 'naz_fra', 'naz_esp', 'naz_eng', 'naz_bra', 'naz_arg', 'naz_por'];

/* moduli dell'allenatore: posizioni di partenza (portiere, poi le altre quattro) */
const CR_FORMS = {
  '2-2': { n: '2-2 Equilibrato', d: 'Due dietro e due avanti', f: [[0.5, 0.925], [0.25, 0.79], [0.75, 0.79], [0.33, 0.62], [0.67, 0.62]] },
  '3-1': { n: '3-1 Catenaccio', d: 'Tre difensori: si soffre ma si chiude', f: [[0.5, 0.925], [0.2, 0.8], [0.5, 0.77], [0.8, 0.8], [0.5, 0.6]] },
  '1-3': { n: '1-3 Tutti all’attacco', d: 'Tre punte: tanti gol, fatti e presi', f: [[0.5, 0.925], [0.5, 0.79], [0.2, 0.61], [0.5, 0.57], [0.8, 0.61]] },
};

/* ---------- utilità ---------- */
const crRnd = (a, b) => a + Math.random() * (b - a);
const crPick = (a) => a[Math.floor(Math.random() * a.length)];
const crClamp = (v, a, b) => Math.max(a, Math.min(b, v));
function crMoney(n) {
  n = Math.round(n);
  if (n >= 1e6) return '€ ' + (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace('.', ',') + ' mln';
  if (n >= 1e4) return '€ ' + Math.round(n / 1000) + ' mila';
  return '€ ' + n.toLocaleString('it-IT');
}
const crData = () => P.car || null;
const crRole = (r) => (r === 'att' ? 'Attaccante' : 'Difensore');
function crValue(C) {
  const af = C.age <= 23 ? 1.3 : C.age <= 28 ? 1 : C.age <= 31 ? 0.6 : 0.3;
  return Math.max(5000, Math.pow(C.ovr / 100, 12) * 120e6 * af);
}
const crWage = (lgId, ovr) => Math.round((150 + Math.pow(crLg(lgId).base, 12) * 600000) * (ovr ? Math.max(0.6, ovr / 80) : 1) / 10) * 10;
const crStartOvr = (age) => Math.round((age <= 16 ? 49 : age <= 24 ? 49 + (age - 16) * 1.6 : age <= 32 ? 62 : 62 - (age - 32) * 1.5) * 10) / 10;
const crAgeRate = (age) => (age <= 19 ? 5 : age <= 22 ? 3.5 : age <= 26 ? 1.5 : age <= 29 ? 0.5 : age <= 31 ? -1 : age <= 33 ? -2.5 : -4);

/* ---------- il campionato della carriera ---------- */
function crNewLeague(C) {
  const L0 = crLg(C.lg), myName = czTeam(C.club).n;
  const pool = L0.t.filter((n) => n !== myName).sort(() => Math.random() - 0.5).slice(0, 7);
  const teams = [C.club].concat(pool.map(czTeamId));
  const arr = teams.slice().sort(() => Math.random() - 0.5), n = arr.length, rounds = [];
  for (let r = 0; r < n - 1; r++) {
    const m = [];
    for (let i = 0; i < n / 2; i++) { const a = arr[i], b = arr[n - 1 - i]; m.push(r % 2 ? [b, a] : [a, b]); }
    rounds.push(m); arr.splice(1, 0, arr.pop());
  }
  const table = {}, str = {};
  for (const t of teams) { table[t] = { g: 0, w: 0, d: 0, l: 0, gf: 0, gs: 0, pt: 0 }; str[t] = crClamp(L0.base + crRnd(-0.06, 0.06), 0.3, 0.97); }
  if (C.cstr == null) C.cstr = crClamp(L0.base + crRnd(-0.04, 0.03), 0.3, 0.97);
  str[C.club] = C.cstr;
  C.L = { id: C.lg, teams, me: C.club, rounds, round: 0, table, str, last: [], done: false, season: C.season };
  if (C.mode === 'all') C.obj = crObjective(C);
  C.st = { pres: 0, gol: 0, ass: 0, vs: 0, mvp: 0, votes: [] };
  C.offers = null; C.mk = null; C.fired = false;
  save();
}
function crNext(C) { const L = C && C.L; if (!L || L.done) return null; return L.rounds[L.round].find((m) => m.includes(L.me)); }
function crSim(L, a, b) {
  const sa = L.str[a], sb = L.str[b];
  const g = (s, o) => { let n = 0; for (let k = 0; k < 6; k++) if (Math.random() < 0.18 + (s - o) * 0.35) n++; return Math.min(3, n); };
  let x = g(sa, sb), y = g(sb, sa); if (x === 3 && y === 3) y = 2;
  return [x, y];
}
function crResult(C, myG, oppG) {
  const L = C.L, m = crNext(C); if (!m) return;
  const home = m[0] === L.me; L.last = [];
  for (const [a, b] of L.rounds[L.round]) {
    let ga, gb;
    if (a === L.me || b === L.me) { ga = home ? myG : oppG; gb = home ? oppG : myG; } else [ga, gb] = crSim(L, a, b);
    czTableAdd(L.table, a, b, ga, gb); L.last.push([a, b, ga, gb]);
  }
  L.round++;
  if (L.round >= L.rounds.length) L.done = true;
  save();
}
function crOutcome(C) {
  const L = C.L, pos = czSorted(L).indexOf(L.me) + 1, ud = CR_UD[L.id] || [null, null], n = L.teams.length;
  if (pos <= CR_UP && ud[1]) return { pos, k: 'up', to: ud[1], champ: pos === 1 };
  if (pos > n - CR_DOWN && ud[0]) return { pos, k: 'down', to: ud[0] };
  return { pos, k: 'stay', to: L.id, champ: pos === 1 };
}

/* ---------- obiettivo della società (allenatore) ---------- */
function crObjective(C) {
  const L = C.L, ord = L.teams.slice().sort((a, b) => L.str[b] - L.str[a]), k = ord.indexOf(L.me);
  if (k <= 1) return { pos: 1, t: 'Vincere il campionato' };
  if (k <= 3) return { pos: 3, t: 'Arrivare tra le prime 3' };
  return { pos: L.teams.length - CR_DOWN, t: 'Salvezza: evitare gli ultimi due posti' };
}
const crBudget = (C) => Math.round((Math.pow(crLg(C.lg).base, 6) * 3e6 + (C.rep || 0) * 1500) / 100) * 100;

/* ---------- nomi per il mercato dell'allenatore ---------- */
const CR_NOMI_IT = ['Totò', 'Peppe', 'Ciccio', 'Nino', 'Rocco', 'Saverio', 'Mimmo', 'Franco', 'Gianni', 'Enzo', 'Pasquale', 'Vincenzo', 'Bruno', 'Carmelo', 'Domenico', 'Antonio'];
const CR_COGN_IT = ['Ferraro', 'Romeo', 'Strangio', 'Morabito', 'Scopelliti', 'Iaria', 'Carbone', 'Barbaro', 'Fazzari', 'Siclari', 'Mittica', 'Minniti', 'Sergi', 'Tripodi', 'Laganà', 'Zappia'];
const CR_NOMI_EX = ['Lukas', 'Jonas', 'Liam', 'Jack', 'Diego', 'Mateo', 'Kevin', 'Noah', 'Yusuf', 'Ivan', 'Pablo', 'Leon', 'Oscar', 'Hugo', 'Tomás', 'Ethan'];
const CR_COGN_EX = ['Müller', 'Smith', 'García', 'Novak', 'Kowalski', 'Silva', 'Jensen', 'Brown', 'Peters', 'Moreno', 'Schmidt', 'Walker', 'Fernández', 'Kovač', 'Taylor', 'Wagner'];
function crMarket(C) {
  const L0 = crLg(C.lg), ita = L0.pz === 'Calabria' || L0.pz === 'Italia', B = crBudget(C), out = [];
  for (let k = 0; k < 3; k++) {
    const ovr = Math.round(L0.base * 100 + crRnd(-2, 9));
    const boost = crClamp(0.012 + (ovr - L0.base * 100) * 0.0022, 0.008, 0.032);
    out.push({ n: (ita ? crPick(CR_NOMI_IT) + ' ' + crPick(CR_COGN_IT) : crPick(CR_NOMI_EX) + ' ' + crPick(CR_COGN_EX)), r: crPick(['Portiere', 'Difensore', 'Centrocampista', 'Attaccante']), ovr, boost, price: Math.round(B * (0.22 + boost * 14) / 100) * 100, age: Math.round(crRnd(19, 33)) });
  }
  return out;
}

/* ---------- offerte ---------- */
function crClubFrom(lgId, not) { const L0 = crLg(lgId); return czTeamId(crPick(L0.t.filter((n) => n !== (not ? czTeam(not).n : '')))); }
function crOffersPlayer(C, avg) {
  const target = C.ovr / 100 + (avg - 6.5) * 0.03, cur = crLg(C.lg).base;
  let pool = CR_LIST.filter((l) => l.base <= target + 0.04 && l.base >= Math.min(cur, target) - 0.05);
  if (!pool.length) pool = [crLg(C.lg)].concat(CR_UD[C.lg] && CR_UD[C.lg][0] ? [crLg(CR_UD[C.lg][0])] : []);
  pool.sort((a, b) => b.base - a.base);
  const picks = [], used = new Set();
  const add = (l) => { if (!l || used.has(l.id) || picks.length >= 3) return; used.add(l.id); picks.push(l); };
  if (C.age >= 32) add(pool.find((l) => l.id === 'usa' || l.id === 'aus'));
  const foreign = pool.filter((l) => l.pz !== 'Calabria' && l.pz !== 'Italia');
  if (foreign.length && (target >= 0.8 || Math.random() < 0.3)) add(crPick(foreign.slice(0, 4)));
  add(pool[0]);
  for (const l of pool.slice(0, 5).sort(() => Math.random() - 0.5)) add(l);
  return picks.map((l) => { const club = crClubFrom(l.id, C.club); return { lg: l.id, club, wage: crWage(l.id, C.ovr), years: C.age >= 31 ? 1 : crPick([2, 3, 4]) }; });
}
function crOffersCoach(C, fired, met) {
  const cur = crLg(C.lg).base, rep = (C.rep || 0) / 100;
  let lo, hi;
  if (fired) { lo = cur - 0.16; hi = cur - 0.01; } else if (met) { lo = cur + 0.01; hi = cur + 0.06 + rep * 0.08; } else { lo = cur - 0.08; hi = cur + 0.01; }
  let pool = CR_LIST.filter((l) => l.base >= lo && l.base <= hi && l.id !== C.lg);
  if (!pool.length) pool = CR_LIST.filter((l) => Math.abs(l.base - cur) < 0.1);
  const out = [], used = new Set();
  for (const l of pool.sort(() => Math.random() - 0.5)) { if (out.length >= (fired ? 2 : 3) || used.has(l.id)) continue; used.add(l.id); out.push({ lg: l.id, club: crClubFrom(l.id, C.club) }); }
  if (fired && out.length < 2) out.push({ lg: C.lg, club: crClubFrom(C.lg, C.club) });
  return out;
}

/* ---------- voto in tempo reale (giocatore) ---------- */
function crOnShot(M, p, S) {
  const R = M.car; if (!R || !M.rate) return;
  const me = M.me, D = M.ctrl, up = me === 0, b0 = M.b0 || [S.x[10], S.y[10]];
  const prog = up ? b0[1] - S.y[10] : S.y[10] - b0[1];
  const ownY = up ? CZ_H : 0, dOwn0 = Math.abs(b0[1] - ownY);
  const touched = !!(S.tm & (1 << D)), lastMine = S.lt >= 0 && Math.floor(S.lt / 5) === me;
  let d = 0, why = '';
  if (p === me && M.lastSh === D) {
    if (!touched) { d = -0.1; why = 'Tiro a vuoto'; }
    else if (S.goal === me) { d = 1.0; why = 'GOL!'; R.g++; }
    else if (S.goal === 1 - me) { d = -1.0; why = 'Autogol…'; }
    else {
      if (S.post) { d += 0.2; why = 'Palo!'; }
      if (R.role === 'dif' && dOwn0 < CZ_H * 0.45 && prog > 90) { d += 0.3; why = why || 'Salvataggio!'; }
      else if (prog > 140) { d += 0.25; why = why || 'Che giocata!'; }
      else if (prog > 60) { d += 0.12; why = why || 'Bel tiro'; }
      else if (prog < -90) { d -= 0.15; why = why || 'Palla persa'; }
    }
    R.myLast = touched && S.goal < 0 && lastMine;
  } else if (p === me) {
    if (S.goal === me && R.myLast) { d += 0.5; why = 'Assist!'; R.a++; }
    if (S.tm) R.myLast = false;
  } else {
    if (S.goal === 1 - me) { d -= R.role === 'dif' ? 0.35 : 0.2; why = 'Gol subito'; }
    if (S.tm) R.myLast = false;
  }
  if (d) crVoto(M, d, why);
}
function crVoto(M, d, why) {
  const R = M.car; R.v = crClamp(R.v + d, 3, 10);
  const b = $('crVotoB'); if (b) { b.textContent = R.v.toFixed(1); b.parentNode.className = 'crvoto ' + crVcls(R.v) + ' bump'; }
  const box = $('czField');
  if (box) { const el = document.createElement('div'); el.className = 'crpop ' + (d > 0 ? 'good' : 'bad'); el.innerHTML = '<b>' + (d > 0 ? '+' : '') + d.toFixed(1).replace('.', ',') + '</b> ' + esc(why); box.appendChild(el); setTimeout(() => el.remove(), 1700); }
}
const crVcls = (v) => (v >= 7.5 ? 'top' : v >= 6 ? 'ok' : 'low');
function crHudExtra(M) {
  const R = M.car; if (!R) return '';
  if (R.coach) return '<span class="crvoto ok">Fiducia <b>' + Math.round(crData().trust) + '%</b></span>';
  return '<span class="crvoto ' + crVcls(R.v) + '">Voto <b id="crVotoB">' + R.v.toFixed(1) + '</b></span>';
}
function crPagella(v) {
  if (v >= 9) return tr2('Mancu Maradona! U paisi ti porta in trionfu.', 'Nemmeno Maradona! Il paese ti porta in trionfo.');
  if (v >= 8) return tr2('U megghiu in campu, senza discussioni!', 'Il migliore in campo, senza discussioni!');
  if (v >= 7) return tr2('Bella partita, u mister è cuntentu.', 'Bella partita, il mister è contento.');
  if (v >= 6) return tr2('Sufficienti: facisti u toi.', 'Sufficiente: hai fatto il tuo.');
  if (v >= 5) return tr2('Accussì accussì, si po’ fari i cchiù.', 'Così così, si può fare di più.');
  return tr2('Jornata storta… dumani si riparti.', 'Giornata storta… domani si riparte.');
}

/* ---------- partite ---------- */
function crPlay(nat) {
  const C = crData(); if (!C) return;
  let opp, myT, skill, mate;
  const euro = !nat && crEuroNow(C);
  if (nat) { myT = 'naz_ita'; opp = C.natOpp || crPick(CR_NAZ); skill = 0.9; mate = 0.92; }
  else if (euro) { myT = C.L.me; opp = C.euro.opp; skill = C.euro.str; mate = C.L.str[myT]; }
  else { const nm = crNext(C); if (!nm) return; myT = C.L.me; opp = nm[0] === myT ? nm[1] : nm[0]; skill = C.L.str[opp]; mate = C.L.str[myT]; }
  const ko = !!euro;
  const run = () => {
    if (C.mode === 'gio') {
      const v0 = crClamp(6 + crMoodBonus(C) + ((C.life && C.life.form) || 0), 5.5, 6.6); if (C.life) C.life.form = 0;
      czMatchStart({ mode: 'car', myTeam: myT, oppTeam: opp, skill, mateSkill: mate, ctrl: C.role === 'att' ? 3 : 1, alt: true, shots: 12, ko, pw: 0.82 + C.ovr * 0.003, rate: true, onShot: crOnShot, car: { v: v0, g: 0, a: 0, role: C.role, myLast: false, nat: !!nat, euro: !!euro, opp } });
      if (CZ.m) czMineOrMate(true);
    } else {
      czMatchStart({ mode: 'car', myTeam: myT, oppTeam: opp, skill, ko, pw: 0.9 + C.cstr * 0.12, form: CR_FORMS[C.form || '2-2'].f, car: { coach: true, euro: !!euro, opp } });
    }
    CZ.screen = 'match';
  };
  typeof energyGate === 'function' ? energyGate(run) : run();
}
function crMatchEnd(M) {
  const C = crData(), R = M.car, me = M.me, a = M.sc[me], b = M.sc[1 - me], won = a > b, tie = a === b;
  let html = '', xp = won ? 110 : tie ? 50 : 25, coins = won ? 60 : tie ? 25 : 10;
  if (!R.coach) {
    R.v = crClamp(R.v + (won ? 0.3 : tie ? 0 : -0.25), 3, 10);
    const v = Math.round(R.v * 2) / 2, old = C.ovr;
    if (R.nat) { C.nat = C.nat || { caps: 0, gol: 0 }; C.nat.caps++; C.nat.gol += R.g; C.natDone = C.season; C.natOpp = null; }
    else {
      if (R.euro) html += crEuroResult(C, a, b, M); else crResult(C, a, b);
      C.st.pres++; C.st.gol += R.g; C.st.ass += R.a; C.st.vs += v; C.st.votes.push(v); if (v >= 8) C.st.mvp++;
    }
    C.ovr = Math.round(crClamp(C.ovr + (v - 6.2) * 0.5 + crAgeRate(C.age) / 14, 40, 97) * 10) / 10;
    coins += R.g * 15 + R.a * 8; xp += Math.round((v - 6) * 20);
    const dO = C.ovr - old;
    html = '<div class="crpag"><div class="crvbig ' + crVcls(v) + '">' + v.toFixed(1).replace('.', ',') + '</div><div><small>Pagella di ' + esc(C.name) + '</small><p>' + crPagella(v) + '</p></div></div>' +
      '<div class="crline"><span>⚽ <b>' + R.g + '</b> gol</span><span>🎯 <b>' + R.a + '</b> assist</span><span>⭐ Valutazione <b>' + Math.round(C.ovr) + '</b> <em class="' + (dO >= 0 ? 'up' : 'dn') + '">' + (dO >= 0 ? '+' : '') + dO.toFixed(1).replace('.', ',') + '</em></span></div>' +
      (R.nat ? '<p class="pgnote">Presenze in Nazionale: ' + C.nat.caps + ' · gol: ' + C.nat.gol + '</p>' : '') + html;
    html += crLifeAfterMatch(C, won, v);
  } else {
    let eh = '';
    if (R.euro) { eh = crEuroResult(C, a, b, M); if (won) C.trust = Math.min(100, C.trust + 6); } else crResult(C, a, b);
    const exp = (C.L.str[C.L.me] - C.L.str[R.opp]) * 20;
    const dT = won ? 8 - exp * 0.5 : tie ? 1 - exp * 0.4 : -8 - exp * 0.5;
    C.trust = Math.round(crClamp(C.trust + dT, 0, 100));
    C.st.pres++;
    html = eh + '<div class="crline"><span>Fiducia della società <b>' + C.trust + '%</b> <em class="' + (dT >= 0 ? 'up' : 'dn') + '">' + (dT >= 0 ? '+' : '') + Math.round(dT) + '</em></span><span>Obiettivo: ' + esc(C.obj.t) + '</span></div>';
    if (C.trust <= 0 && !C.L.done) { C.fired = true; C.offers = crOffersCoach(C, true); (C.hist = C.hist || []).push({ s: C.season, age: C.age, club: C.club, lg: C.lg, pos: czSorted(C.L).indexOf(C.L.me) + 1, obj: C.obj.t + ' (esonerato)', met: false }); html += '<p class="crwarn">La società ha perso la pazienza: sei esonerato.</p>'; }
  }
  eco().carlini += Math.max(5, coins); gainXp(Math.max(10, xp));
  const chest = grantChest(won);
  if (typeof track === 'function') track('game_end', { game: 'calcio', won, car: C.mode });
  save();
  setTimeout(() => {
    overlay('<div class="czend"><div class="czendt">' + czShield(M.teams[me], 44) + '<span><b>' + a + '</b><i>–</i><b>' + b + '</b></span>' + czShield(M.teams[1 - me], 44) + '</div><h2>' + (won ? 'Vittoria!' : tie ? 'Pareggio' : 'Sconfitta') + '</h2>' + html +
      '<div class="gain"><div class="xp">+' + Math.max(10, xp) + ' XP · <i class="ico coin"></i>' + Math.max(5, coins) + '</div>' + chest + '</div><button class="btn" id="czOut">Continua la carriera</button></div>');
    $('czOut').onclick = () => { $('layer').innerHTML = ''; CZ.m = null; CZ.screen = 'car'; czRender(); };
  }, 900);
}
function crQuit(M) {
  const R = M.car;
  overlay('<h2>Lasci la partita?</h2><p>' + (R.coach ? 'Vale come una sconfitta 3 a 0 e la società non la prende bene.' : 'Vale come una sconfitta 3 a 0 e in pagella prendi 4.') + '</p><button class="btn" id="czQY">Esco</button><button class="btn alt" id="czQN">Resto</button>');
  $('czQY').onclick = () => {
    $('layer').innerHTML = ''; cancelAnimationFrame(CZ.raf);
    const C = crData();
    if (R.euro) crEuroResult(C, 0, 3, M); else if (!R.nat) crResult(C, 0, 3);
    if (R.coach) { C.trust = Math.max(0, C.trust - 12); C.st.pres++; if (C.trust <= 0 && !C.L.done) { C.fired = true; C.offers = crOffersCoach(C, true); } }
    else if (!R.nat) { C.st.pres++; C.st.vs += 4; C.st.votes.push(4); C.ovr = Math.max(40, Math.round((C.ovr - 1) * 10) / 10); }
    save(); CZ.m = null; CZ.screen = 'car'; czRender();
  };
  $('czQN').onclick = () => { $('layer').innerHTML = ''; };
}

/* ---------- fine stagione ---------- */
function crSeasonClose(C) {
  // chiude la stagione una sola volta: trofei, storico, obiettivo, offerte
  const L = C.L; if (!L || !L.done || C.closed === C.season) return;
  const O = crOutcome(C), avg = C.st.pres ? C.st.vs / C.st.pres : 6;
  C.closed = C.season; C.troph = C.troph || []; C.hist = C.hist || []; C.awards = C.awards || [];
  if (O.champ) C.troph.push(crLg(L.id).n + ' ' + C.season);
  C.lastO = O;
  C.euroQ = CR_TOPL.includes(L.id) && O.pos <= 4 ? { cup: O.pos <= 2 ? 'eur' : 'con', club: C.club } : null;
  if (C.mode === 'gio') {
    if (avg >= 7.3 && C.st.pres >= 5) C.awards.push('Miglior giocatore · ' + crLg(L.id).n + ' ' + C.season);
    if (avg >= 7.8 && C.ovr >= 85) C.awards.push('Bergamotto d’Oro ' + C.season);
    C.hist.push({ s: C.season, age: C.age, club: C.club, lg: L.id, pos: O.pos, pres: C.st.pres, gol: C.st.gol, ass: C.st.ass, avg: Math.round(avg * 10) / 10 });
    C.tot = C.tot || { pres: 0, gol: 0, ass: 0 }; C.tot.pres += C.st.pres; C.tot.gol += C.st.gol; C.tot.ass += C.st.ass;
    C.offers = C.age >= 38 ? [] : crOffersPlayer(C, avg);
    C.natCall = C.ovr >= 78 && avg >= 6.9 && C.natDone !== C.season;
    if (C.natCall) C.natOpp = crPick(CR_NAZ);
  } else {
    const met = O.pos <= C.obj.pos;
    C.lastMet = met;
    C.trust = Math.round(crClamp(C.trust + (met ? 22 : -32), 0, 100));
    C.rep = Math.round(crClamp((C.rep || 20) + (met ? 9 : -6) + (O.champ ? 6 : 0), 0, 100));
    if (C.trust < 15) C.fired = true;
    C.hist.push({ s: C.season, age: C.age, club: C.club, lg: L.id, pos: O.pos, obj: C.obj.t, met });
    C.offers = crOffersCoach(C, C.fired, met);
  }
  save();
}
/* passa alla stagione dopo: con la stessa squadra (to = null) o con la nuova (offerta) */
function crNewSeason(C, off) {
  const O = C.lastO || { k: 'stay', to: C.lg };
  if (off) {
    C.club = off.club; C.lg = off.lg; C.cstr = null;
    if (C.mode === 'gio') C.wage = off.wage;
    if (C.mode === 'all') { C.trust = 55; C.form = C.form || '2-2'; }
  } else {
    if (C.mode === 'all' && C.fired) return;
    const oldB = crLg(C.lg).base; C.lg = O.to || C.lg;
    const nb = crLg(C.lg).base;
    if (C.cstr != null) C.cstr = crClamp(C.cstr + (nb - oldB) * 0.75, 0.3, 0.97);
    if (C.mode === 'all') C.trust = Math.max(40, C.trust);
  }
  C.season++;
  C.sy = (C.sy || 0) + 1; if (C.sy >= 2) { C.sy = 0; C.age++; }   // un anno di età ogni due stagioni
  if (C.mode === 'gio') crLifeNewSeason(C);
  crNewLeague(C);
  crEuroStart(C, !!off);
  if (C.mode === 'all') { C.budget = crBudget(C); save(); }
}

/* ---------- schermate ---------- */
const CR = { tmp: null, dv: 0 };
function crMenuBtn() {
  const C = crData();
  let sub = 'Da giocatore o da allenatore, fino all’estero';
  if (C && !C.retired) sub = (C.mode === 'gio' ? esc(C.name) + ' · ' + C.age + ' anni · ' : 'Mister ' + esc(C.name) + ' · ') + esc(czTeam(C.club).n);
  return '<button class="czmode car" data-cr="hub"><span class="czmi">🌟</span><b>Carriera</b><small>' + sub + '</small><span class="crnew">Nuovo!</span></button>';
}
function crTeamList() {
  const q = CR.q || '', sel = CR.tmp && CR.tmp.club;
  const btn = (id, sub) => '<button data-crclub="' + esc(id) + '" aria-pressed="' + (sel === id) + '">' + czShield(id, 32) + '<b>' + esc(czTeam(id).n) + '</b>' + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</button>';
  if (q.trim()) {
    // solo squadre calabresi: si parte da una delle categorie (la ricerca include le storiche, che stanno in Serie D o nella loro categoria)
    const r = czSearch(q).filter(([id]) => crDivOf(id) >= 0);
    return '<p class="pgnote">' + (r.length ? r.length + (r.length === 1 ? ' squadra trovata' : ' squadre trovate') : 'Nessuna squadra con questo nome') + '</p><div class="czteams crteams">' + r.map(([id]) => btn(id, CZ_DIVS[crDivOf(id)].n)).join('') + '</div>';
  }
  const D = CZ_DIVS[CR.dv];
  return '<p class="pgnote">' + D.n + ' · ' + D.t.length + ' paesi' + (CR.dv <= 1 ? ': si parte dal basso, avversari più facili.' : CR.dv >= 4 ? ': avversari forti fin da subito.' : '.') + '</p><div class="czteams crteams">' + D.t.map((n) => btn(czTeamId(n))).join('') + '</div>';
}
const crDivOf = (id) => { const n = czTeam(id).n; return CZ_DIVS.findIndex((d) => d.t.includes(n)); };
function crTeamPicker() {
  return '<label class="czsearch"><span aria-hidden="true">🔍</span><input id="crQ" type="search" placeholder="Cerca il tuo paese" autocomplete="off" value="' + esc(CR.q || '') + '"></label><div class="crdivs">' + CZ_DIVS.map((d, k) => '<button data-crdv="' + k + '" aria-pressed="' + (k === CR.dv && !(CR.q || '').trim()) + '">' + d.s + '</button>').join('') + '</div><div id="crList">' + crTeamList() + '</div>';
}
function crRender(box) {
  const C = crData();
  if (CZ.screen === 'carnew') { box.innerHTML = crNewHTML(); const qi = $('crQ'); if (qi) qi.addEventListener('input', (e) => { CR.q = e.target.value; $('crList').innerHTML = crTeamList(); document.querySelectorAll('[data-crdv]').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.crdv === CR.dv && !CR.q.trim()))); }); return; }
  if (CZ.screen === 'carhist') { box.innerHTML = crHistHTML(C); return; }
  if (CZ.screen === 'carvita' && C && C.mode === 'gio') { box.innerHTML = crVitaHTML(C); return; }
  if (CZ.screen === 'carbuy' && C && C.mode === 'all') { box.innerHTML = crBuyHTML(C); return; }
  if (CZ.screen === 'car' && typeof ndSeen === 'function' && !ndSeen('carriera') && !ND.open) setTimeout(() => showNduja('carriera'), 300);
  if (!C) {
    box.innerHTML = '<button class="czback" data-cz="menu">◀ Indietro</button><h3 class="czh">La tua carriera</h3>' +
      '<div class="crchoose"><button class="crbig gio" data-crnew="gio"><span>⚽</span><b>Carriera da giocatore</b><small>Crea il tuo calciatore, muovi solo la tua pedina, prendi il voto in pagella e fatti comprare da squadre sempre più grandi, anche in Germania, Spagna o Australia.</small></button>' +
      '<button class="crbig all" data-crnew="all"><span>📋</span><b>Carriera da allenatore</b><small>Scegli la panchina, il modulo e i rinforzi. Centra l’obiettivo della società o rischi l’esonero.</small></button></div>';
    return;
  }
  if (C.retired) { box.innerHTML = crRetiredHTML(C); return; }
  if (!C.L) crNewLeague(C);
  if (C.L.done) crSeasonClose(C);
  box.innerHTML = C.mode === 'gio' ? crHubPlayer(C) : crHubCoach(C);
}
function crNewHTML() {
  const T = CR.tmp || (CR.tmp = { mode: 'gio', name: (P.nick || '').slice(0, 18), age: 17, role: 'att', num: 10, club: null, cage: 40 });
  const gio = T.mode === 'gio';
  let h = '<button class="czback" data-cr="hub">◀ Indietro</button><h3 class="czh">' + (gio ? 'Crea il tuo calciatore' : 'Crea il tuo allenatore') + '</h3><div class="crform">';
  h += '<label>Nome<input id="crName" maxlength="18" value="' + esc(T.name) + '" placeholder="Es. Ntoni Scopelliti"></label>';
  if (gio) {
    h += '<label>Età (da 15 a 40 anni)<input id="crAge" type="number" inputmode="numeric" min="15" max="40" value="' + T.age + '"></label><p class="pgnote">Più sei giovane, più cresci in fretta. Chi parte più grande è già più forte ma ha meno anni di carriera.</p>';
    h += '<div class="crfl">Ruolo</div><div class="crchips"><button data-crrole="att" aria-pressed="' + (T.role === 'att') + '">⚽ Attaccante</button><button data-crrole="dif" aria-pressed="' + (T.role === 'dif') + '">🛡️ Difensore</button></div>';
    h += '<p class="pgnote">' + (T.role === 'att' ? 'L’attaccante parte avanti: il voto sale con gol, assist e tiri verso la porta.' : 'Il difensore parte dietro: il voto sale con i salvataggi e scende di più se la squadra prende gol.') + '</p>';
    h += '<label>Numero di maglia<input id="crNum" type="number" min="1" max="99" value="' + T.num + '"></label>';
  } else {
    h += '<label>Età (da 25 a 75 anni)<input id="crAge" type="number" inputmode="numeric" min="25" max="75" value="' + T.cage + '"></label>';
  }
  h += '<div class="crfl">Squadra</div>' + crTeamPicker() + '</div><button class="btn take" data-cr="create"' + (T.club ? '' : ' disabled') + '>' + (T.club ? 'Inizia con ' + esc(czTeam(T.club).n) : 'Scegli una squadra') + '</button>';
  return h;
}
function crHeader(C) {
  const L0 = crLg(C.lg);
  if (C.mode === 'gio') {
    return '<div class="crhead"><div class="crav">' + czShield(C.club, 48) + '<span class="crnum">' + C.num + '</span></div><div class="crwho"><b>' + esc(C.name) + '</b><small>' + crRole(C.role) + ' · ' + C.age + ' anni · ' + esc(czTeam(C.club).n) + '</small><small>' + L0.fl + ' ' + esc(L0.n) + '</small></div><div class="crovr"><b>' + Math.round(C.ovr) + '</b><small>valutazione</small></div></div>' +
      '<div class="crline"><span>Valore <b>' + crMoney(crValue(C)) + '</b></span><span>Ingaggio <b>' + crMoney(C.wage || crWage(C.lg, C.ovr)) + '</b>/mese</span></div>';
  }
  const tcls = C.trust >= 60 ? 'ok' : C.trust >= 30 ? 'mid' : 'low';
  return '<div class="crhead"><div class="crav">' + czShield(C.club, 48) + '</div><div class="crwho"><b>Mister ' + esc(C.name) + '</b><small>' + esc(czTeam(C.club).n) + ' · ' + C.age + ' anni</small><small>' + L0.fl + ' ' + esc(L0.n) + '</small></div><div class="crovr"><b>' + Math.round(C.cstr * 100) + '</b><small>forza squadra</small></div></div>' +
    '<div class="crtrust"><small>Fiducia della società</small><div class="crbar ' + tcls + '"><i style="width:' + C.trust + '%"></i></div><b>' + C.trust + '%</b></div>' +
    '<div class="crline"><span>🎯 <b>' + esc(C.obj ? C.obj.t : '') + '</b></span><span>Budget <b>' + crMoney(C.budget || 0) + '</b></span></div>';
}
function crTable(C) {
  const L = C.L, srt = czSorted(L), n = L.teams.length, ud = CR_UD[L.id] || [null, null];
  return '<table class="cztable"><thead><tr><th></th><th>Squadra</th><th>G</th><th>V</th><th>N</th><th>P</th><th>DR</th><th>Pt</th></tr></thead><tbody>' + srt.map((id, k) => { const r = L.table[id]; return '<tr class="' + (id === L.me ? 'me ' : '') + (ud[1] && k < CR_UP ? 'up' : ud[0] && k >= n - CR_DOWN ? 'down' : '') + '"><td>' + (k + 1) + '</td><td class="czt">' + czShield(id, 18) + esc(czTeam(id).n) + '</td><td>' + r.g + '</td><td>' + r.w + '</td><td>' + r.d + '</td><td>' + r.l + '</td><td>' + (r.gf - r.gs) + '</td><td><b>' + r.pt + '</b></td></tr>'; }).join('') + '</tbody></table>' +
    (L.last && L.last.length ? '<h4 class="czsub">Risultati della giornata ' + L.round + '</h4><div class="czres">' + L.last.map(([a, b, ga, gb]) => '<div class="' + (a === L.me || b === L.me ? 'me' : '') + '"><span>' + esc(czTeam(a).n) + '</span><b>' + ga + ' – ' + gb + '</b><span>' + esc(czTeam(b).n) + '</span></div>').join('') + '</div>' : '');
}
function crNextCard(C, label) {
  if (crEuroNow(C)) return crEuroCard(C);
  const nm = crNext(C); if (!nm) return '';
  return '<div class="cznext"><small>' + esc(crLg(C.lg).n) + ' · Stagione ' + C.season + ' · Giornata ' + (C.L.round + 1) + ' di ' + C.L.rounds.length + '</small><div class="cznm">' + czShield(nm[0], 40) + '<b>' + esc(czTeam(nm[0]).n) + '</b><i>vs</i><b>' + esc(czTeam(nm[1]).n) + '</b>' + czShield(nm[1], 40) + '</div>' + (label ? '<p class="pgnote">' + label + '</p>' : '') + '<button class="btn take" data-cr="play">Gioca la partita</button></div>';
}
function crOfferCards(C) {
  if (!C.offers || !C.offers.length) return '';
  return '<div class="croffers">' + C.offers.map((o, k) => { const L0 = crLg(o.lg); return '<div class="croffer"><div class="crofh">' + czShield(o.club, 40) + '<span><b>' + esc(czTeam(o.club).n) + '</b><small>' + L0.fl + ' ' + esc(L0.n) + '</small></span></div>' + (C.mode === 'gio' ? '<p>Ingaggio <b>' + crMoney(o.wage) + '</b>/mese · contratto ' + o.years + (o.years > 1 ? ' anni' : ' anno') + '</p>' : '<p>Forza della rosa circa <b>' + Math.round(L0.base * 100) + '</b> · budget ' + crMoney(Math.pow(L0.base, 6) * 3e6) + '</p>') + '<button class="btn small take" data-croff="' + k + '">Accetta</button></div>'; }).join('') + '</div>';
}
function crHubPlayer(C) {
  let h = '<button class="czback" data-cz="menu">◀ Indietro</button>' + crHeader(C) + crEuroBar(C);
  const S = C.st, avg = S.pres ? (S.vs / S.pres) : 0;
  if (C.natCall && C.natDone !== C.season) {
    const o = czTeam(C.natOpp);
    h += '<div class="cznext crnat"><small>Convocazione</small><h3>🇮🇹 Sei stato convocato in Nazionale!</h3><div class="cznm">' + czShield('naz_ita', 40) + '<b>Italia</b><i>vs</i><b>' + esc(o.n) + '</b>' + czShield(C.natOpp, 40) + '</div><button class="btn take" data-cr="nat">Gioca con la Nazionale</button></div>';
  }
  if (!C.L.done) h += crNextCard(C, 'Titolare con la maglia n° ' + C.num + '. Muovi solo la pedina con la stella: i compagni tirano a turno.');
  else {
    const O = C.lastO || crOutcome(C), L0 = crLg(C.L.id);
    const ttl = O.k === 'up' ? (O.champ ? 'Campioni e promossi!' : 'Promossi!') : O.k === 'down' ? 'Retrocessi…' : O.champ ? 'Campioni!' : 'Stagione finita: ' + O.pos + '° posto';
    h += '<div class="cznext done ' + O.k + '"><div class="czcup">' + (O.champ ? '🏆' : O.k === 'up' ? '⬆️' : O.k === 'down' ? '⬇️' : '⚽') + '</div><h3>' + ttl + '</h3><p>' + esc(L0.n) + ' · media voto <b>' + avg.toFixed(2).replace('.', ',') + '</b> · ' + S.gol + ' gol · ' + S.ass + ' assist</p>';
    if (C.age >= 38) h += '<p>A 38 anni è ora di appendere le scarpe al chiodo.</p><button class="btn take" data-cr="retire">Fine della carriera</button></div>';
    else {
      h += '<p class="crproc"><b>Il procuratore:</b> ' + (C.offers && C.offers.length ? tr2('Ti cercanu sti squadri. Chi facimu?', 'Ti cercano queste squadre. Che facciamo?') : tr2('Pi ora nuddu ti cerca. Restamu e facimu vidiri chi sapimu fari!', 'Per ora non ti cerca nessuno. Restiamo e facciamo vedere cosa sappiamo fare!')) + '</p>' + crOfferCards(C) +
        '<button class="btn" data-cr="stay">Resta a ' + esc(czTeam(C.club).n) + (O.k === 'up' ? ' (sale in ' + esc(crLg(O.to).n) + ')' : O.k === 'down' ? ' (scende in ' + esc(crLg(O.to).n) + ')' : '') + '</button>' + (C.age >= 34 ? '<button class="btn ghost" data-cr="retire">Ritirati</button>' : '') + '</div>';
    }
  }
  h += crLifeCard(C);
  h += '<div class="czstats"><span><b>' + S.pres + '</b>presenze</span><span><b>' + S.gol + '</b>gol</span><span><b>' + S.ass + '</b>assist</span><span><b>' + (S.pres ? avg.toFixed(1).replace('.', ',') : '–') + '</b>media voto</span><span><b>' + S.mvp + '</b>migliore in campo</span></div>';
  if (S.votes.length) h += '<div class="crvotes"><small>Ultimi voti</small>' + S.votes.slice(-7).map((v) => '<span class="' + crVcls(v) + '">' + v.toFixed(1).replace('.', ',') + '</span>').join('') + '</div>';
  h += crTable(C) + '<div class="crbtns"><button class="btn small ghost" data-cr="hist">📜 Storia della carriera</button><button class="btn small ghost" data-cr="reset">Nuova carriera</button></div>';
  return h;
}
function crHubCoach(C) {
  if (C.budget == null) { C.budget = crBudget(C); save(); }
  let h = '<button class="czback" data-cz="menu">◀ Indietro</button>' + crHeader(C) + crEuroBar(C);
  if (C.fired) {
    h += '<div class="cznext done down"><div class="czcup">📉</div><h3>Esonerato!</h3><p>La società ha scelto un altro allenatore. Ma il telefono squilla: qualcuno ti vuole.</p>' + crOfferCards(C) + '</div>';
    h += crTable(C) + '<div class="crbtns"><button class="btn small ghost" data-cr="hist">📜 Storia della carriera</button><button class="btn small ghost" data-cr="reset">Nuova carriera</button></div>';
    return h;
  }
  if (!C.L.done) {
    h += '<div class="crfl">Modulo</div><div class="crchips crforms">' + Object.entries(CR_FORMS).map(([k, f]) => '<button data-crform="' + k + '" aria-pressed="' + ((C.form || '2-2') === k) + '"><b>' + f.n + '</b><small>' + f.d + '</small></button>').join('') + '</div>';
    h += crNextCard(C, 'Giochi tu con tutte le pedine. I rinforzi del mercato rendono i tuoi tiri più forti.');
    h += '<button class="btn" data-cr="buy">🛒 Mercato: compra rinforzi</button>';
  } else {
    const O = C.lastO || crOutcome(C), met = C.lastMet;
    h += '<div class="cznext done ' + (met ? 'up' : 'down') + '"><div class="czcup">' + (O.champ ? '🏆' : met ? '✅' : '❌') + '</div><h3>' + (met ? 'Obiettivo centrato!' : 'Obiettivo mancato') + '</h3><p>' + O.pos + '° posto. Obiettivo: ' + esc(C.obj.t) + '.' + (O.k === 'up' ? ' La squadra sale in ' + esc(crLg(O.to).n) + '!' : O.k === 'down' ? ' La squadra scende in ' + esc(crLg(O.to).n) + '.' : '') + '</p>';
    if (C.fired) h += '<p class="crwarn">La società non ti conferma.</p>';
    h += (C.offers && C.offers.length ? '<p class="crproc"><b>Offerte per te:</b></p>' + crOfferCards(C) : '') + (C.fired ? '' : '<button class="btn" data-cr="stay">Resta a ' + esc(czTeam(C.club).n) + '</button>') + '</div>';
  }
  h += crTable(C) + '<div class="crbtns"><button class="btn small ghost" data-cr="hist">📜 Storia della carriera</button><button class="btn small ghost" data-cr="reset">Nuova carriera</button></div>';
  return h;
}
function crBuyHTML(C) {
  if (!C.mk) { C.mk = crMarket(C); save(); }
  return '<button class="czback" data-cr="hub">◀ Indietro</button><h3 class="czh">Mercato</h3><p class="crline"><span>Budget <b>' + crMoney(C.budget) + '</b></span><span>Forza squadra <b>' + Math.round(C.cstr * 100) + '</b></span></p><div class="croffers">' +
    C.mk.map((p, k) => '<div class="croffer' + (p.bought ? ' sold' : '') + '"><div class="crofh"><span class="crpl">' + p.ovr + '</span><span><b>' + esc(p.n) + '</b><small>' + p.r + ' · ' + p.age + ' anni</small></span></div><p>Forza squadra <b>+' + Math.round(p.boost * 100) + '</b> · prezzo <b>' + crMoney(p.price) + '</b></p>' + (p.bought ? '<p><b>Acquistato!</b></p>' : '<button class="btn small take" data-crbuy="' + k + '"' + (p.price > C.budget ? ' disabled' : '') + '>' + (p.price > C.budget ? 'Budget insufficiente' : 'Compra') + '</button>') + '</div>').join('') +
    '</div><p class="pgnote">Il budget si rinnova a ogni stagione e cresce con la reputazione. A fine stagione arrivano giocatori nuovi.</p>';
}
function crHistHTML(C) {
  if (!C) return '<button class="czback" data-cr="hub">◀ Indietro</button>';
  const rows = (C.hist || []).slice().reverse();
  let h = '<button class="czback" data-cr="hub">◀ Indietro</button><h3 class="czh">Storia di ' + (C.mode === 'all' ? 'Mister ' : '') + esc(C.name) + '</h3>';
  if (C.mode === 'gio') {
    const T = C.tot || { pres: 0, gol: 0, ass: 0 };
    h += '<div class="czstats"><span><b>' + (T.pres + C.st.pres) + '</b>presenze</span><span><b>' + (T.gol + C.st.gol) + '</b>gol</span><span><b>' + (T.ass + C.st.ass) + '</b>assist</span><span><b>' + (C.nat ? C.nat.caps : 0) + '</b>in Nazionale</span><span><b>' + (C.troph || []).length + '</b>trofei</span></div>';
    h += '<table class="cztable crhist"><thead><tr><th>Stag.</th><th>Squadra</th><th>Pres</th><th>Gol</th><th>Ass</th><th>Media</th></tr></thead><tbody>' + rows.map((r) => '<tr><td>' + r.s + '<br><small>' + r.age + ' a.</small></td><td class="czt">' + czShield(r.club, 18) + esc(czTeam(r.club).n) + '<br><small>' + crLg(r.lg).fl + ' ' + esc(crLg(r.lg).n) + '</small></td><td>' + r.pres + '</td><td>' + r.gol + '</td><td>' + r.ass + '</td><td><b>' + String(r.avg).replace('.', ',') + '</b></td></tr>').join('') + '</tbody></table>';
  } else {
    h += '<table class="cztable crhist"><thead><tr><th>Stag.</th><th>Squadra</th><th>Pos.</th><th>Obiettivo</th></tr></thead><tbody>' + rows.map((r) => '<tr><td>' + r.s + '</td><td class="czt">' + czShield(r.club, 18) + esc(czTeam(r.club).n) + '<br><small>' + crLg(r.lg).fl + ' ' + esc(crLg(r.lg).n) + '</small></td><td>' + r.pos + '°</td><td>' + (r.met ? '✅' : '❌') + ' <small>' + esc(r.obj) + '</small></td></tr>').join('') + '</tbody></table>';
  }
  if (!rows.length) h += '<p class="pgnote">La storia si scrive a fine stagione.</p>';
  const tro = (C.troph || []).concat(C.awards || []);
  if (tro.length) h += '<div class="cztroph"><small>Bacheca</small>' + tro.map((x) => '<span>🏆 ' + esc(x) + '</span>').join('') + '</div>';
  return h;
}
function crRetiredHTML(C) {
  const T = C.tot || { pres: 0, gol: 0, ass: 0 };
  return '<button class="czback" data-cz="menu">◀ Indietro</button><div class="cznext done up"><div class="czcup">👟</div><h3>' + esc(C.name) + ' si ritira</h3><p>' + T.pres + ' presenze, ' + T.gol + ' gol, ' + T.ass + ' assist' + (C.nat && C.nat.caps ? ', ' + C.nat.caps + ' presenze in Nazionale' : '') + '. ' + ((C.troph || []).length ? (C.troph.length + ' trofei vinti.') : '') + '</p>' + (C.life ? '<p>' + crCasa(C.life).ico + ' ' + crCasa(C.life).n + (C.life.sposi && C.life.fid ? ' · 💍 sposato con ' + esc(C.life.fid.n) : '') + (C.life.figli.length ? ' · 👶 ' + C.life.figli.map((b) => esc(b.n)).join(', ') : '') + ' · 💶 ' + crMoney(C.life.soldi) + '</p>' : '') + '<p>' + tr2('U paisi non si scorda i tia!', 'Il paese non ti dimenticherà!') + '</p><button class="btn take" data-cr="reset">Nuova carriera</button><button class="btn ghost" data-cr="hist">📜 Storia della carriera</button></div>';
}

/* ---------- tocchi ---------- */
function crClick(e) {
  const t = e.target;
  const b = t.closest('[data-cr]');
  const keepName = () => { const n = $('crName'), u = $('crNum'), g = $('crAge'); if (CR.tmp) { if (n) CR.tmp.name = n.value; if (u) CR.tmp.num = crClamp(parseInt(u.value, 10) || 10, 1, 99); if (g) { const v = parseInt(g.value, 10); if (CR.tmp.mode === 'gio') CR.tmp.age = crClamp(v || 17, 15, 40); else CR.tmp.cage = crClamp(v || 40, 25, 75); } } };
  if (b) {
    const a = b.dataset.cr, C = crData();
    if (a === 'hub') { CZ.screen = 'car'; czRender(); return true; }
    if (a === 'play') { crPlay(false); return true; }
    if (a === 'nat') { crPlay(true); return true; }
    if (a === 'hist') { CZ.screen = 'carhist'; czRender(); return true; }
    if (a === 'buy') { CZ.screen = 'carbuy'; czRender(); return true; }
    if (a === 'vita') { CZ.screen = 'carvita'; czRender(); return true; }
    if (a === 'stay') { crNewSeason(C, null); fx('card'); czRender(); return true; }
    if (a === 'retire') {
      overlay('<h2>Appendi le scarpe al chiodo?</h2><p>La carriera di ' + esc(C.name) + ' finisce qui.</p><button class="btn" id="crRY">Sì, mi ritiro</button><button class="btn alt" id="crRN">Non ancora</button>');
      $('crRY').onclick = () => { $('layer').innerHTML = ''; if (!C.L.done) { C.tot = C.tot || { pres: 0, gol: 0, ass: 0 }; C.tot.pres += C.st.pres; C.tot.gol += C.st.gol; C.tot.ass += C.st.ass; C.st = { pres: 0, gol: 0, ass: 0, vs: 0, mvp: 0, votes: [] }; } C.retired = true; save(); fx('big'); czRender(); };
      $('crRN').onclick = () => { $('layer').innerHTML = ''; };
      return true;
    }
    if (a === 'reset') {
      overlay('<h2>Nuova carriera?</h2><p>Quella di adesso viene cancellata.</p><button class="btn" id="crXY">Sì, ricomincio</button><button class="btn alt" id="crXN">No</button>');
      $('crXY').onclick = () => { $('layer').innerHTML = ''; P.car = null; CR.tmp = null; save(); CZ.screen = 'car'; czRender(); };
      $('crXN').onclick = () => { $('layer').innerHTML = ''; };
      return true;
    }
    if (a === 'create') {
      keepName();
      const T = CR.tmp; if (!T || !T.club) return true;
      const name = (T.name || '').trim().slice(0, 18) || (T.mode === 'gio' ? 'Ntoni' : 'Peppe');
      if (typeof NICK_BAD !== 'undefined' && typeof nickKey === 'function') { const k = nickKey(name).replace(/[^a-z]/g, ''); if (NICK_BAD.some((w) => k.includes(w))) { flash('Chistu nomi nun si po’ diri! Scegline n’atru.'); return true; } }
      const lg = 'cal' + CR.dv;
      P.car = T.mode === 'gio'
        ? { mode: 'gio', name, age: T.age, role: T.role, num: T.num, ovr: crStartOvr(T.age), club: T.club, lg, season: 1, troph: [], hist: [], awards: [], tot: { pres: 0, gol: 0, ass: 0 }, nat: { caps: 0, gol: 0 } }
        : { mode: 'all', name, age: T.cage, club: T.club, lg, season: 1, form: '2-2', trust: 60, rep: 20, troph: [], hist: [] };
      P.car.wage = crWage(lg, P.car.ovr);
      crNewLeague(P.car);
      if (P.car.mode === 'all') { P.car.budget = crBudget(P.car); save(); }
      CR.tmp = null; CR.q = ''; fx('big'); CZ.screen = 'car'; czRender();
      flash(P.car.mode === 'gio' ? 'Benvenuto a ' + czTeam(P.car.club).n + '!' : 'Mister ' + name + ', la panchina è tua!');
      return true;
    }
  }
  const nw = t.closest('[data-crnew]');
  if (nw) { CR.tmp = null; crNewHTML(); CR.tmp.mode = nw.dataset.crnew; CZ.screen = 'carnew'; czRender(); return true; }
  const dv = t.closest('[data-crdv]'); if (dv) { keepName(); CR.dv = +dv.dataset.crdv; CR.q = ''; if (CR.tmp) CR.tmp.club = null; czRender(); return true; }
  const cl = t.closest('[data-crclub]'); if (cl) { keepName(); CR.tmp.club = cl.dataset.crclub; const k = crDivOf(CR.tmp.club); if (k >= 0) CR.dv = k; czRender(); return true; }
  const ag = t.closest('[data-crage]'); if (ag) { keepName(); CR.tmp.age = +ag.dataset.crage; czRender(); return true; }
  const cg = t.closest('[data-crcage]'); if (cg) { keepName(); CR.tmp.cage = +cg.dataset.crcage; czRender(); return true; }
  const rl = t.closest('[data-crrole]'); if (rl) { keepName(); CR.tmp.role = rl.dataset.crrole; if (CR.tmp.num === 10 || CR.tmp.num === 5) CR.tmp.num = CR.tmp.role === 'att' ? 10 : 5; czRender(); return true; }
  const fm = t.closest('[data-crform]'); if (fm) { const C = crData(); C.form = fm.dataset.crform; save(); czRender(); return true; }
  const of = t.closest('[data-croff]');
  if (of) {
    const C = crData(), o = C.offers[+of.dataset.croff]; if (!o) return true;
    const L0 = crLg(o.lg), oldPz = crLg(C.lg).pz;
    crNewSeason(C, o); C.fired = false;
    if (C.mode === 'gio') crLifeMove(C, oldPz);
    if (C.mode === 'all') { C.budget = crBudget(C); save(); }
    fx('big'); czRender();
    flash((C.mode === 'gio' ? 'Firmato con ' : 'Nuova panchina: ') + czTeam(o.club).n + ' ' + L0.fl);
    return true;
  }
  const ev = t.closest('[data-crev]'); if (ev) { crLifeChoose(crData(), +ev.dataset.crev); czRender(); return true; }
  const bl = t.closest('[data-crbuyl]'); if (bl) { const [kd, k] = bl.dataset.crbuyl.split(':'); crLifeBuy(crData(), kd, k); czRender(); return true; }
  const by = t.closest('[data-crbuy]');
  if (by) {
    const C = crData(), p = C.mk[+by.dataset.crbuy]; if (!p || p.bought || p.price > C.budget) return true;
    C.budget -= p.price; p.bought = true; C.cstr = crClamp(C.cstr + p.boost, 0.3, 0.97); if (C.L && C.L.str) C.L.str[C.club] = C.cstr;
    save(); fx('take'); flash(p.n + ' è dei tuoi!'); czRender();
    return true;
  }
  return false;
}

/* ================= coppe europee =================
   Chi arriva 1° o 2° in una delle serie A maggiori gioca la Coppa d'Europa la stagione dopo, 3° e 4° la Coppa Continentale.
   Tre turni a eliminazione diretta (quarti, semifinale, finale) dentro la stagione, dopo la 2ª, la 4ª e la 6ª giornata. */
const CR_TOPL = ['itA', 'ger', 'eng', 'esp', 'fra', 'por', 'ned'];
const CR_CUPS = { eur: { n: 'Coppa d’Europa', ico: '🏆', add: 0.02, prize: 400 }, con: { n: 'Coppa Continentale', ico: '🥈', add: -0.01, prize: 200 } };
const CR_KO = ['Quarti di finale', 'Semifinale', 'Finale'];
function crEuroOpp(C, cup) {
  const mine = crLg(C.lg).pz, used = (C.euro && C.euro.res || []).map((r) => r[0]);
  const lgs = CR_TOPL.map(crLg).filter((l) => l.pz !== mine);
  let L0, club, k = 0;
  do { L0 = crPick(lgs); club = czTeamId(crPick(L0.t)); k++; } while ((used.includes(club) || club === C.club) && k < 20);
  return { opp: club, str: crClamp(L0.base + CR_CUPS[cup].add + crRnd(-0.02, 0.03), 0.6, 0.98) };
}
function crEuroStart(C, moved) {
  const q = C.euroQ; C.euroQ = null; C.euro = null;
  let cup = q && q.club === C.club ? q.cup : null;
  // chi cambia squadra e va in una grande di serie A a volte trova la coppa già conquistata
  if (!cup && moved && CR_TOPL.includes(C.lg) && Math.random() < 0.45) cup = Math.random() < 0.5 ? 'eur' : 'con';
  if (!cup) return;
  C.euro = Object.assign({ cup, r: 0, alive: true, at: [2, 4, 6], res: [] }, crEuroOpp(C, cup));
  save();
}
const crEuroNow = (C) => { const E = C && C.euro; return !!(E && E.alive && E.r < 3 && C.L && C.L.round >= E.at[E.r]); };
function crEuroResult(C, a, b, M) {
  const E = C.euro; if (!E) return '';
  const K = CR_CUPS[E.cup], won = a > b, stage = CR_KO[E.r];
  E.res.push([E.opp, a, b, E.r]);
  let h;
  if (!won) { E.alive = false; h = '<p class="crcup out">' + K.ico + ' ' + K.n + ': eliminati in ' + stage.toLowerCase() + '.</p>'; }
  else if (E.r === 2) {
    E.alive = false; E.r = 3; (C.troph = C.troph || []).push(K.n + ' ' + C.season);
    eco().carlini += K.prize; gainXp(150);
    h = '<p class="crcup win">' + K.ico + ' Avete vinto la ' + K.n + '! +' + K.prize + ' carlini</p>';
    if (typeof fx === 'function') fx('big');
  } else {
    E.r++; Object.assign(E, crEuroOpp(C, E.cup));
    h = '<p class="crcup">' + K.ico + ' ' + K.n + ': passate il turno! Prossimo: ' + CR_KO[E.r].toLowerCase() + ' contro ' + esc(czTeam(E.opp).n) + '.</p>';
  }
  save();
  return h;
}
function crEuroCard(C) {
  const E = C.euro, K = CR_CUPS[E.cup], my = C.L.me;
  return '<div class="cznext crcupcard"><small>' + K.ico + ' ' + K.n + ' · ' + CR_KO[E.r] + '</small><div class="cznm">' + czShield(my, 40) + '<b>' + esc(czTeam(my).n) + '</b><i>vs</i><b>' + esc(czTeam(E.opp).n) + '</b>' + czShield(E.opp, 40) + '</div><p class="pgnote">Partita secca: in parità si va ai supplementari, chi segna vince.</p><button class="btn take" data-cr="play">Gioca la partita di coppa</button></div>';
}
function crEuroBar(C) {
  const E = C.euro; if (!E) return '';
  const K = CR_CUPS[E.cup];
  return '<div class="crcupbar"><b>' + K.ico + ' ' + K.n + '</b>' + CR_KO.map((n, k) => { const r = E.res.find((x) => x[3] === k); const st = r ? (r[1] > r[2] ? 'ok' : 'ko') : (E.alive && k === E.r ? 'now' : ''); return '<span class="' + st + '">' + n.replace(' di finale', '') + (r ? ' ' + r[1] + '–' + r[2] : '') + '</span>'; }).join('') + '</div>';
}

/* ================= vita privata (carriera da giocatore) =================
   L'ingaggio si mette da parte partita dopo partita. Con i soldi si compra casa e macchina.
   La fidanzata ha un umore: dipende dalle scelte, e l'umore cambia un po' il voto di partenza in campo. */
const CR_CASE = [
  { k: 'gen', n: 'Casa dei genitori', p: 0, ico: '🏠', d: 'Mamma cucina, ma la privacy è poca.', com: 0 },
  { k: 'aff', n: 'Monolocale in affitto', p: 1500, rent: true, ico: '🏢', d: 'Affitto a stagione: finalmente da solo!', com: 1 },
  { k: 'paese', n: 'Casa al paese', p: 70000, ico: '🏡', d: 'Con l’orto e la vista sulle montagne.', com: 2 },
  { k: 'citta', n: 'Appartamento in città', p: 220000, ico: '🏙️', d: 'Vicino allo stadio e ai negozi.', com: 3 },
  { k: 'mare', n: 'Villa al mare', p: 750000, ico: '🏖️', d: 'Terrazza sul mare, cene d’estate.', com: 4 },
  { k: 'attico', n: 'Attico di lusso', p: 2500000, ico: '🌆', d: 'Vetrate e vista su tutta la città.', com: 5 },
  { k: 'castello', n: 'Villa con piscina', p: 9000000, ico: '🏰', d: 'Da vero campione: piscina, campo e giardino.', com: 6 },
];
const CR_AUTO = [
  { k: 'panda', n: 'Utilitaria usata', p: 6000, ico: '🚗' }, { k: 'golf', n: 'Berlina', p: 28000, ico: '🚙' },
  { k: 'suv', n: 'SUV', p: 65000, ico: '🚐' }, { k: 'sport', n: 'Sportiva', p: 220000, ico: '🏎️' }, { k: 'super', n: 'Supercar', p: 650000, ico: '🚀' },
];
const CR_LEI = ['Maria', 'Giusy', 'Francesca', 'Ilaria', 'Chiara', 'Martina', 'Rosa', 'Angela', 'Carmela', 'Sara', 'Federica', 'Noemi', 'Antonella', 'Valentina'];
const CR_DOVE = ['al bar del paese', 'alla festa del santo patrono', 'in palestra', 'al lido', 'a una cena con gli amici', 'all’uscita dallo stadio'];
const CR_BIMBI = { m: ['Antonio', 'Giuseppe', 'Francesco', 'Domenico', 'Rocco', 'Salvatore', 'Bruno', 'Nicola'], f: ['Maria', 'Caterina', 'Rosa', 'Giulia', 'Sofia', 'Aurora', 'Teresa', 'Anna'] };
function crLife(C) {
  if (!C.life) C.life = { soldi: 0, casa: 'gen', auto: '', fid: null, sposi: false, figli: [], ev: null, log: [], form: 0 };
  return C.life;
}
const crCasa = (L) => CR_CASE.find((c) => c.k === L.casa) || CR_CASE[0];
const crAutoOf = (L) => CR_AUTO.find((a) => a.k === L.auto);
function crMoodBonus(C) { const L = C.life; if (!L || !L.fid) return 0; return crClamp((L.fid.u - 50) / 250, -0.2, 0.2); }
const crMoodEmo = (u) => (u >= 80 ? '😍' : u >= 60 ? '😊' : u >= 40 ? '😐' : u >= 20 ? '😟' : '😠');
function crLog(L, t) { L.log.unshift('Stag. ' + (crData() ? crData().season : '') + ' · ' + t); L.log = L.log.slice(0, 12); }
/* scelte possibili: ognuna ha costo in euro, effetto sull'umore (u) e a volte sulla forma della partita dopo */
function crLifeEvent(C) {
  const L = crLife(C), f = L.fid, w = C.wage || 200, pool = [];
  if (!f) {
    const n = crPick(CR_LEI), dove = crPick(CR_DOVE);
    return { id: 'meet', t: '💘 Hai conosciuto ' + n + ' ' + dove + '. Vi piacete!', n, ch: [{ t: 'Le chiedo di uscire', u: 0, set: 'fid' }, { t: 'Adesso penso solo al pallone', form: 0.15 }] };
  }
  const cena = Math.max(60, Math.round(w * 0.04));
  pool.push({ id: 'cena', t: '🍝 ' + f.n + ' vuole uscire a cena stasera.', ch: [{ t: 'Ristorante elegante', c: cena * 3, u: 10 }, { t: 'Pizza al paese', c: 30, u: 5 }, { t: 'Resto a casa a riposare', u: -6, form: 0.2 }] });
  pool.push({ id: 'pranzo', t: '👵 Pranzo della domenica dai genitori di ' + f.n + '.', ch: [{ t: 'Vado, e porto i dolci', c: 25, u: 8 }, { t: 'Salto: ho allenamento', u: -6, form: 0.15 }] });
  if (f.m >= 6) pool.push({ id: 'anniv', t: '💐 È il vostro anniversario!', ch: [{ t: 'Le regalo un gioiello', c: Math.max(500, Math.round(w * 0.6)), u: 15 }, { t: 'Fiori e un biglietto', c: 40, u: 6 }, { t: 'Me ne scordo…', u: -15 }] });
  pool.push({ id: 'vac', t: '✈️ ' + f.n + ' sogna una vacanza.', ch: [{ t: 'Viaggio a Parigi', c: 3000, u: 14 }, { t: 'Weekend a Tropea', c: 400, u: 8 }, { t: 'Niente vacanze: mi alleno', u: -10, form: 0.3 }] });
  if (C.ovr >= 72) pool.push({ id: 'gelosia', t: '📸 Ti ha visto sui social a fare foto con le tifose…', ch: [{ t: 'Le spiego con calma', u: -2 }, { t: 'Le faccio una sorpresa', c: 300, u: 5 }, { t: 'Mi arrabbio pure io', u: -12 }] });
  if (L.casa !== 'gen' && !f.conv) pool.push({ id: 'conv', t: '🏠 ' + f.n + ' ti chiede se può venire a vivere da te.', ch: [{ t: 'Sì, vieni!', u: 15, set: 'conv' }, { t: 'È ancora presto', u: -6 }] });
  if (f.conv && !L.sposi && f.u >= 72 && f.m >= 14) pool.push({ id: 'prop', t: '💍 Forse è il momento giusto per chiederle di sposarti…', ch: [{ t: 'Le chiedo di sposarmi', c: 15000, u: 20, set: 'sposi' }, { t: 'Aspetto ancora un po’', u: -4 }] });
  if (L.sposi && L.figli.length < 4 && f.u >= 55) { const sx = Math.random() < 0.5 ? 'm' : 'f', nn = CR_BIMBI[sx].slice().sort(() => Math.random() - 0.5).slice(0, 3); pool.push({ id: 'bimbo', t: (sx === 'm' ? '👶 Aspettate un maschietto!' : '👶 Aspettate una femminuccia!') + ' Come lo chiamate?', ch: nn.map((x) => ({ t: x, u: 10, set: 'figlio', nome: x, sx })) }); }
  return crPick(pool);
}
function crLifeAfterMatch(C, won, v) {
  const L = crLife(C);
  const pay = Math.round((C.wage || crWage(C.lg, C.ovr)) * 6 / 7);   // circa sei mesi di stipendio a stagione
  L.soldi += pay;
  let h = '<p class="crlife">💶 Stipendio: +' + crMoney(pay) + ' · in banca ' + crMoney(L.soldi) + '</p>';
  if (L.fid) {
    const f = L.fid; f.m++;
    f.u = Math.round(crClamp(f.u - (crCasa(L).com >= 2 ? 1 : 2) + (won ? 1 : 0) + (v >= 8 ? 1 : 0), 0, 100));
    if (f.u <= 8 && !L.sposi) { crLog(L, f.n + ' ti ha lasciato.'); h += '<p class="crwarn">💔 ' + esc(f.n) + ' ti ha lasciato. Era troppo trascurata.</p>'; L.fid = null; L.ev = null; }
  }
  if (!L.ev && Math.random() < (L.fid ? 0.38 : 0.14)) { L.ev = crLifeEvent(C); h += '<p class="crlife ev">📬 ' + L.ev.t + ' <b>Scegli nella Vita privata.</b></p>'; }
  return h;
}
function crLifeNewSeason(C) {
  const L = crLife(C);
  if (L.casa === 'aff') { if (L.soldi >= 1500) { L.soldi -= 1500; } else { L.casa = 'gen'; crLog(L, 'Niente soldi per l’affitto: torni dai genitori.'); } }
  L.figli.forEach((b) => { b.s = (b.s || 0) + 1; });
}
function crLifeChoose(C, k) {
  const L = crLife(C), ev = L.ev; if (!ev) return;
  const ch = ev.ch[k]; if (!ch) return;
  if (ch.c && L.soldi < ch.c) { flash('Non hai abbastanza soldi'); return; }
  if (ch.set === 'sposi' && L.casa === 'gen') { flash('Prima serve una casa tutta vostra'); return; }
  if (ch.c) L.soldi -= ch.c;
  if (ch.form) L.form = (L.form || 0) + ch.form;
  if (ch.set === 'fid') { L.fid = { n: ev.n, u: 62, m: 0, conv: false }; crLog(L, 'Ti sei fidanzato con ' + ev.n + '.'); }
  else if (ch.set === 'conv') { L.fid.conv = true; crLog(L, L.fid.n + ' viene a vivere con te.'); }
  else if (ch.set === 'sposi') { L.sposi = true; crLog(L, 'Ti sei sposato con ' + L.fid.n + '! Festa grande in paese.'); if (typeof fx === 'function') fx('big'); }
  else if (ch.set === 'figlio') { L.figli.push({ n: ch.nome, sx: ch.sx, s: 0 }); crLog(L, 'È nato ' + (ch.sx === 'm' ? 'il piccolo ' : 'la piccola ') + ch.nome + '!'); if (typeof fx === 'function') fx('big'); }
  else if (ev.id !== 'meet') crLog(L, ch.t + '.');
  if (L.fid && ch.u) L.fid.u = Math.round(crClamp(L.fid.u + ch.u, 0, 100));
  L.ev = null; save();
}
function crLifeBuy(C, kind, k) {
  const L = crLife(C), list = kind === 'casa' ? CR_CASE : CR_AUTO, it = list.find((x) => x.k === k); if (!it) return;
  const cost = it.p;
  if (L.soldi < cost) { flash('Non hai abbastanza soldi'); return; }
  L.soldi -= it.rent ? 0 : cost; if (it.rent) L.soldi -= cost;
  if (kind === 'casa') { L.casa = k; crLog(L, (it.rent ? 'Hai preso in affitto: ' : 'Hai comprato: ') + it.n + '.'); if (L.fid) L.fid.u = Math.min(100, L.fid.u + 6 + it.com); }
  else { L.auto = k; crLog(L, 'Hai comprato: ' + it.n + '.'); if (L.fid) L.fid.u = Math.min(100, L.fid.u + 4); }
  fx('take'); save();
}
/* il trasferimento all'estero con la fidanzata (non ancora sposati) */
function crLifeMove(C, oldPz) {
  const L = crLife(C); if (!L.fid || L.sposi) return;
  if (crLg(C.lg).pz === oldPz) return;
  L.ev = { id: 'move', t: '🧳 Ti trasferisci in ' + crLg(C.lg).pz + '. ' + L.fid.n + ' è indecisa…', ch: [{ t: 'Partiamo insieme', c: 800, u: 6 }, { t: 'Vado da solo: ci vediamo quando posso', u: -22 }] };
}
function crLifeCard(C) {
  const L = crLife(C), ca = crCasa(L), au = crAutoOf(L), f = L.fid;
  return '<div class="crlifecard"><div class="crlh"><b>🏡 Vita privata</b><span>💶 ' + crMoney(L.soldi) + '</span></div><div class="crlrow"><span>' + ca.ico + ' ' + ca.n + '</span>' + (au ? '<span>' + au.ico + ' ' + au.n + '</span>' : '') + '</div>' +
    (f ? '<div class="crlrow"><span>' + (L.sposi ? '💍 Sposato con ' : '❤️ ') + esc(f.n) + '</span><span class="crmood">' + crMoodEmo(f.u) + ' umore <b>' + f.u + '</b></span>' + (L.figli.length ? '<span>👶 ' + L.figli.map((b) => esc(b.n)).join(', ') + '</span>' : '') + '</div><div class="crbar ' + (f.u >= 60 ? 'ok' : f.u >= 30 ? 'mid' : 'low') + '"><i style="width:' + f.u + '%"></i></div>' : '<div class="crlrow"><span>💭 Single</span></div>') +
    (L.ev ? '<p class="crlife ev">📬 ' + L.ev.t + '</p>' : '') + '<button class="btn small" data-cr="vita">' + (L.ev ? 'Fai la tua scelta' : 'Apri la vita privata') + '</button></div>';
}
function crVitaHTML(C) {
  const L = crLife(C), ca = crCasa(L), f = L.fid;
  let h = '<button class="czback" data-cr="hub">◀ Indietro</button><h3 class="czh">La vita di ' + esc(C.name) + '</h3><div class="crline"><span>💶 In banca <b>' + crMoney(L.soldi) + '</b></span><span>Stipendio <b>' + crMoney(C.wage || crWage(C.lg, C.ovr)) + '</b>/mese</span></div>';
  if (L.ev) h += '<div class="cznext crevent"><p>' + L.ev.t + '</p><div class="crevch">' + L.ev.ch.map((c, k) => '<button class="btn small' + (c.c && c.c > L.soldi ? ' ghost' : '') + '" data-crev="' + k + '">' + esc(c.t) + (c.c ? '<small>' + crMoney(c.c) + '</small>' : '') + '</button>').join('') + '</div></div>';
  h += '<div class="crlifecard">' + (f ? '<div class="crlrow"><span>' + (L.sposi ? '💍 Sposato con ' : '❤️ Fidanzato con ') + esc(f.n) + '</span><span class="crmood">' + crMoodEmo(f.u) + ' umore <b>' + f.u + '</b></span></div><div class="crbar ' + (f.u >= 60 ? 'ok' : f.u >= 30 ? 'mid' : 'low') + '"><i style="width:' + f.u + '%"></i></div><p class="pgnote">Se l’umore è alto parti in campo con un voto più alto (fino a +0,2), se è basso parti più giù. Sotto 10, se non siete sposati, ti lascia.</p>' : '<p class="pgnote">Sei single. Prima o poi qualcuno ti farà battere il cuore…</p>') +
    (L.figli.length ? '<div class="crlrow">' + L.figli.map((b) => '<span>' + (b.sx === 'm' ? '👦 ' : '👧 ') + esc(b.n) + '</span>').join('') + '</div>' : '') + '</div>';
  h += '<h4 class="czsub">La casa</h4><div class="crshop">' + CR_CASE.map((x) => { const own = L.casa === x.k; return '<div class="crshopi' + (own ? ' own' : '') + '"><span class="crsi">' + x.ico + '</span><div><b>' + x.n + '</b><small>' + x.d + '</small></div>' + (own ? '<em>Ci abiti</em>' : x.k === 'gen' ? '<button class="btn small ghost" data-crbuyl="casa:gen">Torna</button>' : '<button class="btn small' + (L.soldi < x.p ? ' ghost' : ' take') + '" data-crbuyl="casa:' + x.k + '">' + crMoney(x.p) + (x.rent ? '/stag.' : '') + '</button>') + '</div>'; }).join('') + '</div>';
  h += '<h4 class="czsub">La macchina</h4><div class="crshop">' + CR_AUTO.map((x) => { const own = L.auto === x.k; return '<div class="crshopi' + (own ? ' own' : '') + '"><span class="crsi">' + x.ico + '</span><div><b>' + x.n + '</b></div>' + (own ? '<em>È tua</em>' : '<button class="btn small' + (L.soldi < x.p ? ' ghost' : ' take') + '" data-crbuyl="auto:' + x.k + '">' + crMoney(x.p) + '</button>') + '</div>'; }).join('') + '</div>';
  if (L.log.length) h += '<h4 class="czsub">Diario</h4><ul class="crlog">' + L.log.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>';
  return h;
}
