/* ================= IL MAZZO: guida ai semi e alle carte ================= */
const MAZZO = {
  mare: { sym: 'il pesce spada', what: 'Il mare dello Stretto e della Costa Viola.', tip: 'Riconoscilo dalla sagoma lunga con la spada sul muso.', fig: { 8: ['Rammendatrice', 'ripara le reti'], 9: ['Pescatore di neonata', 'sull’asino col sacco di rete e la cesta piena di neonata'], 10: ['Lanzaturi', 'lancia la fiocina'] } },
  montagna: { sym: 'il pino laricio', what: 'I boschi della Sila e dell’Aspromonte.', tip: 'Riconoscilo dall’albero dritto e appuntito, tipo abete.', fig: { 8: ['Tessitrice', 'al telaio'], 9: ['Pastore', 'sull’asino con le pecore'], 10: ['Casaro', 'fa il formaggio'] } },
  campagna: { sym: 'il ramo d’ulivo', what: 'Gli uliveti della Piana. È il seme dei denari.', tip: 'Riconoscilo dalle foglie strette e dalle olive. Conta per i “denari” a scopa e il 7 è il settebello.', fig: { 8: ['Raccoglitrice', 'raccoglie le olive'], 9: ['Contadino', 'ara la terra col toro'], 10: ['Massaro', 'padrone della masseria'] } },
  bottega: { sym: 'la zampogna', what: 'Le botteghe e le feste di paese.', tip: 'Riconoscila dal sacco tondo con le canne che scendono.', fig: { 8: ['Pastaia', 'fa la pasta a mano'], 9: ['Impagliatore', 'con l’asino carico di sedie'], 10: ['Zampognaro', 'suona alle feste'] } },
};
const MZ_NUM = { 1: 'Asso', 2: 'Due', 3: 'Tre', 4: 'Quattro', 5: 'Cinque', 6: 'Sei', 7: 'Sette' };
const MZ_FIG = { 8: 'Donna', 9: 'Cavallo', 10: 'Re' };
const MZ_HY = { Rammendatrice: 'Rammen&shy;datrice', Raccoglitrice: 'Raccogli&shy;trice', Impagliatore: 'Impaglia&shy;tore', Zampognaro: 'Zampo&shy;gnaro', Tessitrice: 'Tessi&shy;trice', Contadino: 'Conta&shy;dino', Lanzaturi: 'Lanza&shy;turi', 'Pescatore di neonata': 'Pesca&shy;tore di neo&shy;nata', Massaro: 'Mas&shy;saro' };
function mzLabel(s, v) { return v >= 8 ? '<b>' + MZ_FIG[v] + '</b>' + (MZ_HY[MAZZO[s].fig[v][0]] || MAZZO[s].fig[v][0]) : '<b>' + MZ_NUM[v] + '</b>' + (s === 'campagna' && v === 7 ? 'Sette&shy;bello' : v === 1 ? '1 simbolo' : v + ' simboli'); }
function renderMazzo() {
  let h = '<div class="mzintro"><p>Il mazzo ha <b>40 carte</b>: quattro semi da dieci carte. Ogni seme è un pezzo di Calabria e ha il suo simbolo. Sulle carte il simbolo è piccolo nell’angolo, quindi qui li vedi grandi. Tocca un seme per saltare alla sua fila, e tocca una carta per ingrandirla.</p>' +
    '<div class="mzlegend">' + SUITS.map((s) => '<button data-mzjump="' + s + '"><img src="' + AVIMG[s] + '" alt="">' + SUIT_NAME[s] + '</button>').join('') + '</div>' +
    '<table class="mzvals"><thead><tr><th>Carte</th><th>Cosa sono</th></tr></thead><tbody>' +
    '<tr><td>Asso … 7</td><td>Il numero di simboli disegnati sulla carta.</td></tr>' +
    '<tr><td>Donna (8)</td><td>Una donna al lavoro con il mestiere del seme.</td></tr>' +
    '<tr><td>Cavallo (9)</td><td>Un uomo con il suo animale da lavoro: l’asino o il toro. Si chiama sempre Cavallo, come nelle carte napoletane.</td></tr>' +
    '<tr><td>Re (10)</td><td>Il mestiere più importante del seme, in piedi.</td></tr>' +
    '</tbody></table>' +
    '<p class="mztip"><b>Da ricordare:</b> Campagna (l’ulivo) fa da denari. Il <b>settebello</b> è il 7 di Campagna. A sette e mezzo il <b>Re di Campagna</b> è la matta.</p></div>';
  for (const s of SUITS) {
    const M = MAZZO[s];
    h += '<section class="mzsuit" id="mz-' + s + '"><div class="mzhead"><img src="' + AVIMG[s] + '" alt=""><div><h3>' + SUIT_NAME[s] + '</h3><p>Simbolo: ' + M.sym + '. ' + M.what + '</p></div></div>' +
      '<p class="mztip">' + M.tip + '</p>' +
      '<div class="mzrow">' + Array.from({ length: 10 }, (_, i) => i + 1).map((v) => '<button data-mzcard="' + s + '-' + v + '"><img src="' + IMG[s + '-' + v] + '" alt="' + cname({ s, v }) + '" loading="lazy" draggable="false"><small>' + mzLabel(s, v) + '</small></button>').join('') + '</div></section>';
  }
  $('mazzoBox').innerHTML = h;
}
$('mazzoBox').addEventListener('click', (e) => {
  const j = e.target.closest('[data-mzjump]');
  if (j) { $('mz-' + j.dataset.mzjump).scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); return; }
  const b = e.target.closest('[data-mzcard]');
  if (!b) return;
  const [s, vs] = b.dataset.mzcard.split('-'), v = +vs, M = MAZZO[s];
  const desc = v >= 8 ? MZ_FIG[v] + ' di ' + SUIT_NAME[s] + ': ' + M.fig[v][0].toLowerCase() + ', ' + M.fig[v][1] + '.' + (v === 9 ? ' Anche senza cavallo, il 9 si chiama sempre Cavallo.' : '') : (s === 'campagna' && v === 7 ? 'Il settebello: vale un punto a scopa da solo.' : v + (v === 1 ? ' simbolo' : ' simboli') + ': ' + M.sym + '.');
  overlay('<div class="mzbig"><img src="' + IMG[s + '-' + v] + '" alt=""><h2>' + cname({ s, v }) + '</h2><p>' + desc + '</p><button class="btn" id="mzok">Chiudi</button></div>');
  $('mzok').onclick = () => { $('layer').innerHTML = ''; };
});
