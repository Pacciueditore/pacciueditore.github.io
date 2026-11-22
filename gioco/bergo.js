/* ================= Bergo, il bergamotto ================= */
const BERGO_SVG = `
<svg class="bgsvg" viewBox="0 0 130 170" role="img" aria-label="Bergo il bergamotto">
  <g class="bg-feet">
    <path d="M52 140 L49 152" stroke="#1A1A1A" stroke-width="4" stroke-linecap="round"/>
    <path d="M78 140 L81 152" stroke="#1A1A1A" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="44" cy="156" rx="10" ry="5.5" fill="#C8262E" stroke="#1A1A1A" stroke-width="2"/>
    <ellipse cx="86" cy="156" rx="10" ry="5.5" fill="#C8262E" stroke="#1A1A1A" stroke-width="2"/>
  </g>
  <g class="bg-arm-l"><path d="M22 96 Q8 86 10 70" fill="none" stroke="#1A1A1A" stroke-width="4" stroke-linecap="round"/><circle cx="10" cy="68" r="5.5" fill="#F4EBD8" stroke="#1A1A1A" stroke-width="2"/></g>
  <g class="bg-arm-r"><path d="M108 96 Q122 104 120 116" fill="none" stroke="#1A1A1A" stroke-width="4" stroke-linecap="round"/><circle cx="120" cy="118" r="5.5" fill="#F4EBD8" stroke="#1A1A1A" stroke-width="2"/></g>
  <g class="bg-body">
    <path d="M65 40 C95 40 112 62 112 92 C112 124 92 144 65 144 C38 144 18 124 18 92 C18 62 35 40 65 40 Z" fill="#E3D23B" stroke="#1A1A1A" stroke-width="3"/>
    <path d="M30 78 C34 58 50 48 66 47" fill="none" stroke="#F6EC8A" stroke-width="7" stroke-linecap="round" opacity="0.8"/>
    <path d="M96 120 C86 134 72 138 60 138" fill="none" stroke="#B9B02A" stroke-width="6" stroke-linecap="round" opacity="0.6"/>
    <g fill="#C9BC2C" opacity="0.7"><circle cx="38" cy="110" r="1.6"/><circle cx="48" cy="124" r="1.4"/><circle cx="92" cy="104" r="1.6"/><circle cx="84" cy="62" r="1.3"/><circle cx="100" cy="86" r="1.4"/><circle cx="30" cy="94" r="1.3"/><circle cx="74" cy="130" r="1.4"/></g>
    <path d="M65 41 Q63 30 67 24" fill="none" stroke="#6B4A2E" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M67 28 Q84 14 100 22 Q86 36 67 28 Z" fill="#3A7D44" stroke="#1A1A1A" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M70 28 Q84 22 96 23" fill="none" stroke="#24502C" stroke-width="1.5"/>
    <path d="M43 66 Q51 60 58 65" fill="none" stroke="#1A1A1A" stroke-width="3" stroke-linecap="round"/>
    <path d="M73 61 Q81 54 89 58" fill="none" stroke="#1A1A1A" stroke-width="3" stroke-linecap="round"/>
    <g class="bg-eyes">
      <ellipse cx="51" cy="78" rx="9" ry="10" fill="#fff" stroke="#1A1A1A" stroke-width="2.5"/>
      <ellipse cx="80" cy="76" rx="9" ry="11" fill="#fff" stroke="#1A1A1A" stroke-width="2.5"/>
      <circle cx="54" cy="80" r="4.2" fill="#1A1A1A"/><circle cx="83" cy="78" r="4.2" fill="#1A1A1A"/>
      <circle cx="55.3" cy="78.5" r="1.3" fill="#fff"/><circle cx="84.3" cy="76.5" r="1.3" fill="#fff"/>
    </g>
    <circle cx="38" cy="98" r="5.5" fill="#F0A35A" opacity="0.75"/><circle cx="94" cy="96" r="5.5" fill="#F0A35A" opacity="0.75"/>
    <g class="bg-mouth">
      <path d="M46 100 Q66 124 88 98 Q66 108 46 100 Z" fill="#7A1E14" stroke="#1A1A1A" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M52 103 Q66 109 82 101 L81 105 Q66 112 53 106 Z" fill="#fff"/>
      <path d="M58 112 Q66 117 74 111 Q66 114 58 112 Z" fill="#E8735E"/>
    </g>
  </g>
</svg>`;

const BERGO = { used: false };

function bergoSpeak(text, done) {
  if (!AUDIO.on) { if (done) done(); return; }
  try {
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'it-IT'; if (itVoice) u.voice = itVoice;
    u.rate = 1.15; u.pitch = 1.7;
    speechSynthesis.speak(u);
  } catch (e) { /* speech not available */ }
}

const BONUS = {
  scopa: [
    { id: 'peek', t: 'Occhio di Bergo', d: 'Fino alla fine di questa smazzata vedi le carte del computer.' },
    { id: 'pt', t: 'Spremuta di punti', d: 'Un punto in più subito nel punteggio della partita.' },
    { id: 'xp', t: 'Doppio profumo', d: 'A fine partita i punti esperienza raddoppiano.' },
  ],
  briscola: [
    { id: 'peek', t: 'Occhio di Bergo', d: 'Per le prossime 3 mani vedi le carte del computer.' },
    { id: 'pt', t: 'Spremuta di punti', d: 'Dieci punti in più nel conto finale della partita.' },
    { id: 'xp', t: 'Doppio profumo', d: 'A fine partita i punti esperienza raddoppiano.' },
  ],
  sette: [
    { id: 'peek', t: 'Occhio di Bergo', d: 'Nella prossima mano vedi la carta in cima al mazzo prima di decidere.' },
    { id: 'pt', t: 'Spremuta di punti', d: 'Una mano vinta in più nel punteggio.' },
    { id: 'xp', t: 'Doppio profumo', d: 'A fine partita i punti esperienza raddoppiano.' },
  ],
};
BONUS.tressette = [
  { id: 'peek', t: 'Occhio di Bergo', d: 'Per le prossime 3 mani vedi le carte del computer.' },
  { id: 'pt', t: 'Spremuta di punti', d: 'Un punto in più nel totale della partita.' },
  { id: 'xp', t: 'Doppio profumo', d: 'A fine partita i punti esperienza raddoppiano.' },
];
const BERGO_HELLO = {
  tressette: 'Che presa! Al circolo ne parleranno per una settimana. Ecco il regalo di Bergo, scegli tu:',
  scopa: 'Due scope di fila? Che profumo di vittoria! Sono Bergo e ti porto un regalo. Scegli tu:',
  briscola: 'Che colpo grosso! Una mano così merita un regalo di Bergo. Scegli tu:',
  sette: 'Sette e mezzo! Più preciso di un bergamotto di Reggio. Ecco il regalo di Bergo, scegli tu:',
};

/* Video con premio. Nel prototipo è simulato; nell'app vera (Capacitor + AdMob)
   basta definire window.REWARDED_AD_PROVIDER = () => Promise<boolean>. */
/* se AdMob non ha video da mostrare (app nuova, niente rete, account in revisione) il premio si regala, al massimo 3 volte al giorno */
/* quando non c'è un video, Bergo regala il premio lui (3 volte al giorno).
   La finestra sta sopra a tutto: anche sopra il riquadro di Bergo e alle altre finestre già aperte */
function noAdGift() {
  return new Promise((resolve) => {
    const d = new Date(), day = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    if (!P.noAd || P.noAd.d !== day) P.noAd = { d: day, n: 0 };
    const ok = P.noAd.n < 3;
    if (ok) { P.noAd.n++; save(); }
    const el = document.createElement('div');
    el.className = 'overlay noadlayer'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
    el.innerHTML = '<div class="sheet"><div class="nickwin"><div class="nicknd">' + BERGO_SVG + '</div><div class="nickbub"><b>Bergo</b><span>' + (ok ? (typeof tr2 === 'function' ? tr2('Mo nun c’è nuddu video. Pe’ sta vota t’u rigalu iu!', 'Adesso non ci sono video. Per questa volta te lo regalo io!') : 'Adesso non ci sono video. Per questa volta te lo regalo io!') : 'Adesso non ci sono video disponibili. Riprova più tardi!') + '</span></div></div><button class="btn take naok">' + (ok ? 'Grazie, Bergo!' : 'Va bene') + '</button></div>';
    document.body.appendChild(el);
    const b = el.querySelector('.naok');
    setTimeout(() => b.focus(), 50);
    b.onclick = () => { el.remove(); resolve(ok); };
  });
}
function showRewardedAd() {
  if (typeof window.REWARDED_AD_PROVIDER === 'function') {
    let pr; try { pr = Promise.resolve(window.REWARDED_AD_PROVIDER()).catch(() => 'noad'); } catch (e) { pr = Promise.resolve('noad'); }
    return pr.then((r) => (r === 'noad' ? noAdGift() : !!r));
  }
  return new Promise((resolve) => {
    const wasMusic = MUSIC.playing;
    if (wasMusic) musicStop();
    const el = document.createElement('div');
    el.className = 'adlayer';
    el.innerHTML = '<div class="adbox" role="dialog" aria-modal="true" aria-labelledby="adT"><div class="adtag">Spot</div>' +
      '<div class="adscreen"><div class="adbergo">' + BERGO_SVG + '</div><b id="adT">Qui andrà il video pubblicitario</b>' +
      '<small>Nell’app vera questo spazio mostrerà un breve video di AdMob. In questa prova è simulato.</small></div>' +
      '<div class="adbar"><i id="adFill"></i></div><div class="adrow"><span id="adCount">5</span>' +
      '<button class="btn ghost small" id="adSkip">Salta e perdi il premio</button><button class="btn take small" id="adOk" disabled>Ritira il premio</button></div></div>';
    document.body.appendChild(el);
    let left = 5;
    const fill = el.querySelector('#adFill');
    requestAnimationFrame(() => { fill.style.width = '100%'; });
    const iv = setInterval(() => {
      left--;
      el.querySelector('#adCount').textContent = left > 0 ? String(left) : 'Fatto';
      if (left <= 0) { clearInterval(iv); const ok = el.querySelector('#adOk'); ok.disabled = false; ok.focus(); }
    }, 1000);
    const done = (got) => {
      clearInterval(iv);
      el.remove();
      if (wasMusic && MUSIC.on) musicStart();
      resolve(got);
    };
    el.querySelector('#adSkip').onclick = () => done(false);
    el.querySelector('#adOk').onclick = () => done(true);
  });
}

function showBergo(kind, apply, onClose) {
  PAUSE.on = true;
  idleReset();
  const opts = BONUS[kind];
  const el = document.createElement('div');
  el.className = 'ndlayer';
  el.id = 'bgLayer';
  el.innerHTML = '<div class="bgdlg" role="dialog" aria-modal="true" aria-labelledby="bgText">' +
    '<div class="ndbubble bergo"><div class="ndname">Bergo il bergamotto</div><p id="bgText"></p>' +
    '<div class="bgopts">' + opts.map((o) => '<button class="bgopt" data-b="' + o.id + '"><b>' + o.t + '</b><span>' + o.d + '</span></button>').join('') + '</div>' +
    '<div class="bgdouble" hidden><button class="btn take" id="bgWatch">Guarda un video e raddoppia</button><button class="btn ghost small" id="bgNo">No grazie</button></div></div>' +
    '<div class="bgguy">' + BERGO_SVG + '</div></div>';
  document.body.appendChild(el);
  $('bgText').textContent = BERGO_HELLO[kind];
  bergoSpeak(BERGO_HELLO[kind]);
  fx('big');
  const close = (line) => {
    $('bgText').textContent = line;
    bergoSpeak(line);
    el.querySelector('.bgdouble').hidden = true;
    setTimeout(() => {
      try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (err) { /* ignore */ }
      el.classList.add('bye');
      setTimeout(() => el.remove(), 350);
      PAUSE.on = !!PAUSE.user;
      if (onClose) onClose();
      if (PAUSE.pending && !PAUSE.user) { const fn = PAUSE.pending; PAUSE.pending = null; setTimeout(fn, 300); }
      if (G && G.render) G.render();
    }, 1700);
  };
  let chosen = null;
  el.querySelector('.bgopts').addEventListener('click', (e) => {
    const b = e.target.closest('[data-b]');
    if (!b || chosen) return;
    chosen = opts.find((x) => x.id === b.dataset.b);
    el.querySelectorAll('.bgopt').forEach((x) => { x.disabled = true; });
    b.classList.add('on');
    apply(chosen.id, false);
    const line = chosen.t + '! Ottima scelta. Vuoi che te lo raddoppio? Guarda un breve video e ci penso io.';
    $('bgText').textContent = line;
    bergoSpeak('Ottima scelta! Vuoi raddoppiarlo? Guarda un breve video!');
    const d = el.querySelector('.bgdouble');
    d.hidden = false;
    setTimeout(() => $('bgWatch').focus(), 60);
  });
  el.addEventListener('click', async (e) => {
    if (e.target.closest('#bgNo')) { close('Va bene! Ci vediamo alla prossima bella giocata.'); return; }
    if (e.target.closest('#bgWatch')) {
      el.querySelector('.bgdouble').hidden = true;
      const got = await showRewardedAd();
      if (got) { apply(chosen.id, true); fx('big'); close('Raddoppiato! ' + BONUS_BIS[chosen.id] + ' Profumo doppio, vittoria doppia!'); }
      else close('Peccato, niente raddoppio. Il primo regalo però resta tuo!');
    }
  });
  setTimeout(() => { const f = el.querySelector('.bgopt'); if (f) f.focus(); }, 80);
}
const BONUS_BIS = {
  peek: 'Ti lascio sbirciare il doppio del tempo.',
  pt: 'Ti ho spremuto altri punti.',
  xp: 'I punti esperienza ora sono il triplo.',
};
