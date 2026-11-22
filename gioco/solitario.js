/* ================= SOLITARIO: Scarta i Re (devi trovare tu il posto giusto) ================= */
const Solitario = (() => {
  let L, tick = null;
  const AIUTI = 3;
  const secs = () => Math.floor(((L.end || Date.now()) - L.t0) / 1000);
  const fmtT = (s) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  function start() {
    const deck = newDeck();
    const grid = {};
    let k = 0;
    for (const s of SUITS) for (let v = 1; v <= 9; v++) grid[s + '-' + v] = { card: deck[k++], up: false };
    L = { grid, stock: deck.slice(36), kings: [], cur: null, over: false, phase: 'play', t0: Date.now(), end: 0,
      errors: 0, hints: AIUTI, hintOn: false, usedHints: 0, combo: 0, bestCombo: 0, lastOk: 0, miss: null };
    G = L; L.onHand = () => {}; L.onAct = onAct; L.render = () => render();
    L.cur = L.stock.shift();
    L.msg = 'Guarda la carta in mano e tocca tu il suo posto: riga del seme, colonna del numero.';
    if (L.cur.v === 10) handleKing();
    clearInterval(tick);
    tick = setInterval(() => { if (G !== L || L.phase !== 'play') { clearInterval(tick); return; } const t = $('solT'); if (t) t.textContent = fmtT(secs()); }, 1000);
    render();
  }
  function handleKing() {
    L.kings.push(L.cur);
    fx('sad');
    if (L.kings.length === 4 || !L.stock.length) { L.cur = null; finish(); return; }
    L.msg = 'È uscito ' + cname(L.cur) + ': i Re non hanno posto, va da parte. Ecco la prossima carta del mazzetto.';
    L.cur = L.stock.shift();
    if (L.cur.v === 10) handleKing();
  }
  function why(id) {
    const [s, v] = id.split('-');
    if (s !== L.cur.s && +v !== L.cur.v) return 'Né seme né numero: ' + SUIT_NAME[s] + ' ' + short({ v: +v }) + '.';
    if (s !== L.cur.s) return 'Numero giusto, ma quella è la riga ' + SUIT_NAME[s] + '.';
    return 'Riga giusta, ma quella è la colonna del ' + short({ v: +v }) + '.';
  }
  function tap(id) {
    if (!L.cur || L.phase !== 'play') return;
    if (id !== L.cur.id) {
      L.errors++; L.combo = 0; L.miss = id;
      fx('sad');
      L.msg = 'Lì no! ' + why(id);
      render();
      setTimeout(() => { if (L.miss === id) { L.miss = null; const el = document.querySelector('[data-cell="' + id + '"]'); if (el) el.classList.remove('miss'); } }, 450);
      return;
    }
    const now = Date.now();
    L.combo = now - L.lastOk < 4000 ? L.combo + 1 : 1;
    L.bestCombo = Math.max(L.bestCombo, L.combo);
    L.lastOk = now;
    const slot = L.grid[id];
    const under = slot.card;
    slot.card = L.cur; slot.up = true;
    fx('card');
    L.msg = (L.combo >= 3 ? 'Serie da ' + L.combo + '! ' : '') + 'Messo ' + cname(L.cur) + '. Sotto c’era ' + cname(under) + '.';
    L.cur = under; L.hintOn = false;
    if (L.cur.v === 10) handleKing();
    render();
  }
  function stars() { return L.errors === 0 && L.usedHints === 0 ? 3 : L.errors <= 3 && L.usedHints <= 1 ? 2 : 1; }
  function finish() {
    L.phase = 'end'; L.over = true; L.end = Date.now();
    const down = Object.values(L.grid).filter((x) => !x.up);
    down.forEach((x) => { x.up = true; x.wasDown = true; });
    const won = down.length === 0;
    const st = stars(), placed = 36 - down.length;
    render();
    if (won) say('win', 0);
    const bonus = st * 10 + Math.min(L.bestCombo, 10) * 2;
    const lines = [placed + ' carte su 36 al loro posto', 'Tempo ' + fmtT(secs()), L.errors ? L.errors + (L.errors === 1 ? ' errore' : ' errori') : 'nessun errore', 'Serie migliore ' + L.bestCombo];
    if (L.usedHints) lines.push(L.usedHints + (L.usedHints === 1 ? ' aiuto usato' : ' aiuti usati'));
    const gain = award('solitario', won, bonus, null, lines);
    const starHtml = '<div class="solstars" aria-label="' + st + ' stelle su 3">' + [1, 2, 3].map((i) => '<span' + (i <= st ? ' class="on"' : '') + '>★</span>').join('') + '</div>';
    setTimeout(() => {
      overlay('<h2>' + (won ? 'Solitario riuscito!' : 'Sono usciti tutti i Re') + '</h2>' + starHtml + '<p>' +
        (won ? 'Tutte le 36 carte sono al loro posto. A questo solitario si vince di rado!' : 'Restavano ' + down.length + ' carte coperte, ora le vedi girate e segnate.') +
        ' Le stelle dipendono da te: senza errori e senza aiuti ne prendi tre.</p>' + gain +
        '<button class="btn" id="nb">Rigioca</button><button class="btn alt" id="mb">Menu</button>');
      $('nb').onclick = () => { $('layer').innerHTML = ''; energyGate(start); };
      $('mb').onclick = () => { $('layer').innerHTML = ''; G = null; go('vHome'); };
    }, 1400);
  }
  function onAct(act, k, el) {
    if (act === 'cell') tap(el.dataset.cell);
    if (act === 'hint' && L.hints > 0 && !L.hintOn && L.cur && L.phase === 'play') { L.hints--; L.usedHints++; L.hintOn = true; L.msg = 'Bergo ti mostra il posto giusto.'; render(); }
  }
  function render() {
    const up = Object.values(L.grid).filter((x) => x.up && !x.wasDown).length;
    $('gScore').innerHTML = '<div><b>' + up + '/36</b><small>Al posto</small></div><div><b id="solT">' + fmtT(secs()) + '</b><small>Tempo</small></div><div><b>' + L.errors + '</b><small>Errori</small></div>';
    $('opp').innerHTML = '<span class="side">Re usciti</span>' + L.kings.map((c) => '<div class="card mini">' + img(c) + '</div>').join('') + Array.from({ length: 4 - L.kings.length }, () => '<div class="ghostcard mini"></div>').join('');
    $('oppSide').innerHTML = 'Mazzetto <strong>' + L.stock.length + '</strong>';
    $('deckBox').innerHTML = '';
    $('youSide').innerHTML = '';
    const target = L.cur && L.hintOn ? L.cur.id : null;
    const play = L.phase === 'play';
    let g = '<div class="sgrid" role="grid">';
    g += '<div class="sh"></div>' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map((v) => '<div class="sh">' + (v === 1 ? 'A' : v === 8 ? 'D' : v === 9 ? 'C' : v) + '</div>').join('');
    for (const s of SUITS) {
      g += '<div class="sh suit"><img src="' + AVIMG[s] + '" alt="' + SUIT_NAME[s] + '"></div>';
      for (let v = 1; v <= 9; v++) {
        const id = s + '-' + v, x = L.grid[id];
        const cls = 'scell' + (id === target ? ' target' : '') + (x.wasDown ? ' wrong' : '') + (L.miss === id ? ' miss' : '');
        const inner = x.up ? '<img src="' + IMG[x.card.id] + '" alt="' + cname(x.card) + '">' : '';
        g += play ? '<button class="' + cls + (x.up ? '' : ' back') + '" data-act="cell" data-cell="' + id + '" aria-label="' + SUIT_NAME[s] + ' ' + short({ v }) + '">' + inner + '</button>'
          : '<div class="' + cls + (x.up ? '' : ' back') + '">' + inner + '</div>';
      }
    }
    g += '</div>';
    $('table').innerHTML = g;
    $('hand').innerHTML = '';
    let bar = '<div class="msg" style="width:100%">' + L.msg + '</div>';
    if (L.cur) bar += '<div class="curcard"><span class="side">In mano</span><div class="card mini">' + img(L.cur) + '</div><span class="curname">' + cname(L.cur) + '</span></div>';
    if (play) bar += '<button class="btn ghost" data-act="hint"' + (L.hints && !L.hintOn ? '' : ' disabled') + '>Aiuto di Bergo (' + L.hints + ')</button>' + (L.combo >= 2 ? '<span class="side bonusTag">Serie ' + L.combo + '</span>' : '');
    $('bar').innerHTML = bar;
  }
  return { start };
})();
