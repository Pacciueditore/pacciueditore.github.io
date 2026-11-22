/* ================= TRESSETTE a due ================= */
/* il buongioco, come lo insegna il nonno: appena date le 10 carte, tre assi, tre tre, tre due
   oppure Asso, 2 e 3 dello stesso seme valgono 3 punti ciascuno, e le combinazioni si sommano */
const TR_FLASH_MS = 3000; // quanto resta scoperta la carta pescata dall'avversario
function trBuonGioco(ids) {
  const cs = ids.map((x) => (typeof x === 'string' ? cardOf(x) : x)), out = [];
  for (const [v, nm] of [[1, 'assi'], [3, 'tre'], [2, 'due']]) { const h = cs.filter((c) => c.v === v); if (h.length >= 3) out.push({ t: (h.length === 4 ? 'Quattro ' : 'Tre ') + nm, ids: h.map((c) => c.id) }); }
  for (const s of SUITS) { const h = [1, 2, 3].map((v) => cs.find((c) => c.s === s && c.v === v)); if (h.every(Boolean)) out.push({ t: 'Asso, 2 e 3 di ' + SUIT_NAME[s], ids: h.map((c) => c.id) }); }
  return out;
}
/* la carta pescata in primo piano: si ingrandisce al centro, poi vola nella mano di chi l'ha pescata */
function trShowDraw(mine, his, hisName, done) {
  const old = $('trDraw'); if (old) old.remove();
  const el = document.createElement('div'); el.id = 'trDraw'; el.className = 'trdraw';
  const cd = (c, who, k) => '<div class="trdc ' + k + '"><small>' + who + '</small><div class="card">' + img(typeof c === 'string' ? cardOf(c) : c) + '</div></div>';
  el.innerHTML = '<p>Si mostra la carta pescata</p><div class="trdrow">' + cd(his, esc(hisName) + ' pesca', 'his') + cd(mine, 'Tu peschi', 'mine') + '</div>';
  document.body.appendChild(el); fx('card');
  const fly = (sel, tgt) => {
    const c = el.querySelector(sel + ' .card'), t = $(tgt); if (!c || !t) return;
    const a = c.getBoundingClientRect(), b = t.getBoundingClientRect();
    const s = Math.max(0.25, Math.min(1, (b.height * 0.9) / a.height));
    c.style.transition = 'transform 0.55s cubic-bezier(.5,0,.4,1), opacity 0.55s';
    c.style.transform = 'translate(' + (b.left + b.width / 2 - (a.left + a.width / 2)) + 'px,' + (b.top + b.height / 2 - (a.top + a.height / 2)) + 'px) scale(' + s + ')';
  };
  setTimeout(() => { el.classList.add('go'); fly('.his', 'opp'); fly('.mine', 'hand'); }, 1700);
  setTimeout(() => { el.remove(); if (done) done(); }, 2300);
}
const TR_BG_WORD = ['', 'Buongioco', 'Doppio buongioco', 'Triplo buongioco', 'Quattro buongiochi', 'Cinque buongiochi'];
const trBgTitle = (n) => (TR_BG_WORD[n] || n + ' buongiochi') + '! ' + n * 3 + ' punti';
function trBgSpeak(n, who) { try { if (typeof ndSpeak === 'function') ndSpeak((who ? who + ': ' : '') + trBgTitle(n).replace('!', ',')); } catch (e) { /* niente */ } }
function trBgHTML(who, list) {
  return '<div class="bgg"><b>' + who + ' <span class="bggtot">' + trBgTitle(list.length) + '</span></b> ' + list.map((x) => '<div class="bggrow"><span>' + x.t + ' <em>+3</em></span><span class="bggc">' + x.ids.map((id) => '<img src="' + IMG[id] + '" alt="' + cname(cardOf(id)) + '">').join('') + '</span></div>').join('') + '</div>';
}
const Tressette = (() => {
  const RANK = { 3: 10, 2: 9, 1: 8, 10: 7, 9: 6, 8: 5, 7: 4, 6: 3, 5: 2, 4: 1 };
  const th = (c) => (c.v === 1 ? 3 : (c.v === 2 || c.v === 3 || c.v >= 8) ? 1 : 0); // punti in terzi
  const fmtTh = (t) => { const i = Math.floor(t / 3), r = t % 3; return (i ? String(i) : (r ? '' : '0')) + (r ? (i ? ' e ' : '') + r + '/3' : ''); };
  let R;
  function start() {
    R = { bgGame: [0, 0], total: [0, 0], handNo: 0, dealer: 1, over: false, bergoUsed: false, peek: 0, xpMult: 1 };
    G = R; R.onHand = onHand; R.onAct = () => {}; R.render = () => render();
    hand();
  }
  function hand() {
    const deck = newDeck();
    Object.assign(R, { deck, hands: [deck.splice(0, 10), deck.splice(0, 10)], trick: [], won: [[], []], last: null, leader: 1 - R.dealer, phase: 'play', win: null, drawn: null, flash: null });
    R.handNo++;
    R.msg = 'Mano ' + R.handNo + '. ' + (R.leader === 0 ? 'Inizi tu.' : 'Inizia il computer.');
    const bg = [trBuonGioco(R.hands[0]), trBuonGioco(R.hands[1])];
    R.bgHand = [0, 0];
    render();
    if (bg[0].length || bg[1].length) {
      R.phase = 'busy';
      R.total[0] += bg[0].length * 3; R.total[1] += bg[1].length * 3;
      R.bgHand = [bg[0].length, bg[1].length]; R.bgGame = [(R.bgGame || [0, 0])[0] + bg[0].length, (R.bgGame || [0, 0])[1] + bg[1].length];
      setTimeout(() => {
        if (G !== R) return;
        fx('big');
        if (bg[0].length) trBgSpeak(bg[0].length); else trBgSpeak(bg[1].length, 'Il computer');
        overlay('<h2>' + (bg[0].length ? trBgTitle(bg[0].length) : 'Buongioco del computer!') + '</h2><p>Appena date le carte si guardano le combinazioni: un buongioco vale 3 punti, due 6, tre 9 e così via.</p>' + (bg[0].length ? trBgHTML('Tu:', bg[0]) : '') + (bg[1].length ? trBgHTML('Il computer:', bg[1]) : '') + '<p class="pgnote">Partita: ' + R.total[0] + ' a ' + R.total[1] + '</p><button class="btn" id="bgOk">Si gioca!</button>');
        $('bgOk').onclick = () => { $('layer').innerHTML = ''; R.phase = 'play'; render(); if (R.leader === 1) schedule(ai, 700); };
      }, 600);
      return;
    }
    if (R.leader === 1) schedule(ai, 1000);
  }
  const turn = () => (R.trick.length === 0 ? R.leader : 1 - R.leader);
  function legal(p) {
    const h = R.hands[p];
    if (!R.trick.length) return h;
    const s = R.trick[0].c.s;
    const same = h.filter((c) => c.s === s);
    return same.length ? same : h;
  }
  function play(p, c) {
    R.hands[p] = R.hands[p].filter((x) => x.id !== c.id);
    R.trick.push({ p, c });
    fx('card');
    R.drawn = null;
    R.msg = (p === 0 ? 'Hai giocato ' : 'Il computer gioca ') + cname(c) + '.';
    if (R.trick.length === 2) {
      const [a, b] = R.trick;
      const w = b.c.s === a.c.s && RANK[b.c.v] > RANK[a.c.v] ? b.p : a.p;
      const got = th(a.c) + th(b.c);
      R.phase = 'busy'; R.win = w;
      R.msg = (w === 0 ? 'Prendi tu' : 'Prende il computer') + (got ? ': ' + fmtTh(got) + ' punti.' : ', solo cartine.');
      if (w === 0 && got >= 4 && !R.bergoUsed) {
        R.bergoUsed = true; PAUSE.on = true;
        setTimeout(() => showBergo('tressette', (id, bis) => { if (id === 'peek') R.peek += bis ? 3 : 4; if (id === 'pt') R.total[0]++; if (id === 'xp') R.xpMult = bis ? 3 : 2; }), 1500);
      } else if (got >= 3) say(w === 0 ? 'bella' : 'cpuBig', w); else fx('take');
      render();
      schedule(() => {
        R.won[w].push(a.c, b.c);
        R.last = w;
        if (R.peek > 0) R.peek--;
        if (R.deck.length) {
          const mine = R.deck.shift(), his = R.deck.shift();
          if (w === 0) { R.hands[0].push(mine); R.hands[1].push(his); R.drawn = [mine, his]; }
          else { R.hands[1].push(mine); R.hands[0].push(his); R.drawn = [his, mine]; }
        }
        R.trick = []; R.leader = w; R.win = null;
        if (!R.hands[0].length && !R.hands[1].length) { end(); return; }
        const go = () => {
          R.phase = 'play';
          R.msg = R.drawn ? 'Hai pescato ' + cname(R.drawn[0]) + '. Ricordati la carta del computer: tra poco si nasconde!' : 'Mazzo finito: ora si gioca a carte chiuse.';
          render();
          if (turn() === 1) schedule(ai, 900);
        };
        if (!R.drawn) { go(); return; }
        // le carte pescate vengono in primo piano, si mostrano all'avversario e poi si posano;
        // quella del computer resta scoperta pochi secondi e poi si nasconde: bisogna ricordarsela
        R.phase = 'busy'; R.msg = 'Si pesca e si mostra la carta…'; render();
        trShowDraw(R.drawn[0], R.drawn[1], 'Il computer', () => {
          if (G !== R) return;
          R.flash = { id: R.drawn[1].id, until: Date.now() + TR_FLASH_MS };
          setTimeout(() => { if (G === R) render(); }, TR_FLASH_MS + 60);
          go();
        });
      }, 1300);
    } else {
      render();
      if (turn() === 1) schedule(ai, 900);
    }
  }
  function ai() {
    if (G !== R || R.phase !== 'play' || turn() !== 1) return;
    const opts = legal(1);
    let pick;
    if (!R.trick.length) {
      const bySuit = {};
      for (const c of R.hands[1]) (bySuit[c.s] = bySuit[c.s] || []).push(c);
      // con 3 e 2 dello stesso seme si può partire forte
      for (const s in bySuit) {
        const vs = bySuit[s].map((c) => c.v);
        if (vs.includes(3) && vs.includes(2)) { pick = bySuit[s].find((c) => c.v === 3); break; }
      }
      if (!pick) {
        const longest = Object.values(bySuit).sort((a, b) => b.length - a.length)[0];
        pick = longest.slice().sort((x, y) => th(x) * 3 + RANK[x.v] * 0.2 - (th(y) * 3 + RANK[y.v] * 0.2))[0];
      }
    } else {
      const a = R.trick[0].c;
      const winners = opts.filter((c) => c.s === a.s && RANK[c.v] > RANK[a.v]).sort((x, y) => RANK[x.v] - RANK[y.v]);
      const trickTh = th(a);
      if (winners.length && (trickTh > 0 || th(winners[0]) > 0 || winners[0].v === 3 || winners[0].v === 2)) pick = winners[0];
      else if (winners.length && !R.deck.length) pick = winners[0];
      else pick = opts.slice().sort((x, y) => th(x) * 3 + RANK[x.v] * 0.2 - (th(y) * 3 + RANK[y.v] * 0.2))[0];
    }
    play(1, pick);
  }
  function end() {
    const t = [R.won[0].reduce((s, c) => s + th(c), 0), R.won[1].reduce((s, c) => s + th(c), 0)];
    t[R.last] += 3; // ultima presa
    const pt = [Math.floor(t[0] / 3), Math.floor(t[1] / 3)];
    R.total[0] += pt[0]; R.total[1] += pt[1];
    const over = (R.total[0] >= 21 || R.total[1] >= 21) && R.total[0] !== R.total[1];
    R.phase = 'end';
    render();
    const assi = (p) => R.won[p].filter((c) => c.v === 1).length;
    const table = '<table><thead><tr><th>Voce</th><th>Tu</th><th>CPU</th></tr></thead><tbody>' +
      '<tr><td>Assi</td><td>' + assi(0) + '</td><td>' + assi(1) + '</td></tr>' +
      '<tr><td>Figure, 2 e 3<small>un terzo di punto ciascuna</small></td><td>' + R.won[0].filter((c) => th(c) === 1).length + '</td><td>' + R.won[1].filter((c) => th(c) === 1).length + '</td></tr>' +
      '<tr><td>Ultima presa</td><td>' + (R.last === 0 ? '<span class="pt">1</span>' : '–') + '</td><td>' + (R.last === 1 ? '<span class="pt">1</span>' : '–') + '</td></tr>' +
      (R.bgHand && (R.bgHand[0] || R.bgHand[1]) ? '<tr class="bgrow"><td>Buongioco<small>3 punti ciascuno, già contati nel totale</small></td><td>' + (R.bgHand[0] ? '<span class="pt">+' + R.bgHand[0] * 3 + '</span>' : '–') + '</td><td>' + (R.bgHand[1] ? '<span class="pt">+' + R.bgHand[1] * 3 + '</span>' : '–') + '</td></tr>' : '') +
      '<tr><td>Punti della mano</td><td><span class="pt">' + pt[0] + '</span><small>' + fmtTh(t[0]) + '</small></td><td><span class="pt">' + pt[1] + '</span><small>' + fmtTh(t[1]) + '</small></td></tr></tbody>' +
      '<tfoot><tr><td>Totale partita</td><td>' + R.total[0] + '</td><td>' + R.total[1] + '</td></tr></tfoot></table>';
    let head, gain = '', btn;
    if (over) {
      R.over = true;
      const won = R.total[0] > R.total[1];
      setTimeout(() => say(won ? 'win' : 'lose', won ? 0 : 1), 200);
      const bgG = R.bgGame || [0, 0];
      head = '<h2>' + (won ? 'Hai vinto a tressette!' : 'Vince il computer') + '</h2><p>Finale ' + R.total[0] + ' a ' + R.total[1] + '.</p>' + (bgG[0] || bgG[1] ? '<p class="bgsum">Buongiochi nella partita: tu <b>' + bgG[0] + '</b> (' + bgG[0] * 3 + ' punti) · computer <b>' + bgG[1] + '</b> (' + bgG[1] * 3 + ' punti)</p>' : '');
      gain = award('tressette', won, 0, null, [R.total[0] + ' punti'], R.xpMult);
      btn = '<button class="btn" id="nb">Nuova partita</button><button class="btn alt" id="mb">Menu</button>';
    } else {
      head = '<h2>Fine mano</h2><p>Si arriva a 21. Le frazioni di punto si perdono a fine mano.</p>';
      btn = '<button class="btn" id="nb">Prossima mano</button>';
    }
    overlay(head + table + gain + btn + '<details><summary>Come si conta</summary><ul><li>Asso: un punto. Tre, Due, Re, Cavallo e Donna: un terzo di punto.</li><li>L’ultima presa vale un punto.</li><li>Ordine di forza: 3, 2, Asso, Re, Cavallo, Donna, 7, 6, 5, 4.</li><li>Devi rispondere al seme, se puoi.</li><li>La carta pescata si mostra all’avversario per pochi secondi, poi si nasconde: bisogna ricordarsela.</li><li>Buongioco: tre assi, tre tre, tre due oppure Asso, 2 e 3 dello stesso seme in mano all’inizio valgono 3 punti ciascuno, e si sommano.</li></ul></details>');
    $('nb').onclick = () => { $('layer').innerHTML = ''; if (R.over) energyGate(start); else { R.dealer = 1 - R.dealer; hand(); } };
    if ($('mb')) $('mb').onclick = () => { $('layer').innerHTML = ''; G = null; go('vHome'); };
  }
  function onHand(i) {
    if (R.phase !== 'play' || turn() !== 0) return;
    const c = R.hands[0][i];
    if (!legal(0).includes(c)) { R.msg = 'Devi rispondere a ' + SUIT_NAME[R.trick[0].c.s] + '.'; render(); return; }
    play(0, c);
  }
  function render() {
    setScore(R.total[0], R.total[1], 'a 21');
    $('opp').innerHTML = R.peek > 0
      ? R.hands[1].map((c) => '<div class="card">' + img(c) + '</div>').join('') + '<span class="side bonusTag">Occhio di Bergo · ' + R.peek + '</span>'
      : R.hands[1].map((c) => (R.flash && R.flash.id === c.id && Date.now() < R.flash.until ? '<div class="card seen new" title="Carta pescata: ricordatela!">' + img(c) + '</div>' : back())).join('');
    $('oppSide').innerHTML = 'Prese <strong>' + R.won[1].length / 2 + '</strong>';
    $('youSide').innerHTML = 'Prese <strong>' + R.won[0].length / 2 + '</strong>';
    $('deckBox').innerHTML = (R.deck.length ? back() : '') + '<span class="side">Mazzo <strong>' + R.deck.length + '</strong></span>';
    const slot = (p) => {
      const t = R.trick.find((x) => x.p === p);
      return '<div class="slot">' + (t ? '<div class="card' + (R.win === p ? ' win' : '') + '">' + img(t.c) + '</div>' : '<div class="ghostcard"></div>') + (p === 0 ? 'Tu' : 'Computer') + '</div>';
    };
    $('table').innerHTML = '<div class="trick">' + slot(1) + slot(0) + '</div>';
    const my = R.phase === 'play' && turn() === 0;
    const ok = my ? legal(0) : [];
    // carte in mano ordinate per seme e poi per forza (3, 2, Asso, Re ... 4)
    R.hands[0].sort((a, b) => SUITS.indexOf(a.s) - SUITS.indexOf(b.s) || RANK[b.v] - RANK[a.v]);
    const nu = R.drawn ? R.drawn[0] : null;
    $('hand').innerHTML = R.hands[0].map((c, i) =>
      '<button class="card small10' + (c === nu ? ' new' : '') + '" data-i="' + i + '" ' + (my && ok.includes(c) ? '' : 'disabled') + '>' + img(c) + '</button>'
    ).join('');
    $('bar').innerHTML = '<div class="msg">' + R.msg + (my ? ' <em>Tocca a te.</em>' : '') + '</div>';
    idle(my);
  }
  return { start };
})();
