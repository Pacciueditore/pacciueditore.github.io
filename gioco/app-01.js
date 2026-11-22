/* Scopa Calabrese – codice principale, parte 1 */
/* ================= common ================= */
const SUITS = ['mare', 'montagna', 'campagna', 'bottega'];
const SUIT_NAME = { mare: 'Mare', montagna: 'Montagna', campagna: 'Campagna', bottega: 'Bottega' };
const FIGN = { 8: 'la Donna', 9: 'il Cavallo', 10: 'il Re' };
const NUM = { 1: "l'Asso", 2: 'il 2', 3: 'il 3', 4: 'il 4', 5: 'il 5', 6: 'il 6', 7: 'il 7' };
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const cname = (c) => (c.v >= 8 ? FIGN[c.v] : NUM[c.v]) + ' di ' + SUIT_NAME[c.s];
const short = (c) => (c.v === 1 ? 'Asso' : c.v >= 8 ? ({ 8: 'Donna', 9: 'Cavallo', 10: 'Re' })[c.v] : String(c.v));
const img = (c) => '<img src="' + IMG[c.id] + '" alt="' + cname(c) + '" draggable="false">';
/* le carte sul tavolo si rimpiccioliscono quanto serve perché si vedano tutte, senza scorrere */
function fitTable(el) {
  el = el || $('table'); if (!el) return;
  const cards = el.querySelectorAll(':scope > .card'), n = cards.length;
  el.style.removeProperty('--tw');
  if (n < 2) return;
  const cs = getComputedStyle(el), W = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), H = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  if (W <= 0 || H <= 0) return;
  const g = parseFloat(cs.columnGap) || 10, def = cards[0].getBoundingClientRect().width || 80;
  let best = 0;
  for (let c = 1; c <= n; c++) { const r = Math.ceil(n / c), w = Math.min((W - (c - 1) * g) / c, ((H - (r - 1) * g) / r) * 0.6 - 6); if (w > best) best = w; }
  if (best > 0 && best < def) el.style.setProperty('--tw', Math.max(30, Math.floor(best)) + 'px');
}
window.addEventListener('resize', () => { if (view === 'vGame') fitTable(); });
const back = () => '<div class="back" aria-hidden="true"></div>';
let timer = null;
const PAUSE = { on: false, pending: null, user: false };
function schedule(fn, ms) { clearTimeout(timer); timer = setTimeout(() => { if (PAUSE.on) { PAUSE.pending = fn; return; } fn(); }, ms); }
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function newDeck() { const d = []; for (const s of SUITS) for (let v = 1; v <= 10; v++) d.push({ s, v, id: s + '-' + v }); return shuffle(d); }
function flash(text) {
  const el = document.createElement('div');
  el.className = 'flash' + (String(text).length > 11 ? ' long' : ''); el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1300);
}

/* ================= voci in dialetto e suoni ================= */
const LINES = {
  scopa: [{ d: 'Scupa! A facci tua!', it: 'Scopa! Alla faccia tua!' }, { d: 'Aia la miseria, chi scupa!', it: 'Accidenti, che scopa!' }],
  settebello: [{ d: 'Pijja chistu!', it: 'Prendi questo! Il settebello è mio.' }],
  bella: [
    { d: 'Pijja chistu!', it: 'Prendi questo!' },
    { d: 'Mamma mia chi botta!', it: 'Mamma mia, che colpo!' },
    { d: 'Si vidi cu sapi iocari!', it: 'Si vede chi sa giocare!' },
    { d: 'Aia la miseria, chi iocata!', it: 'Accidenti, che giocata!' },
    { d: 'Fici na bella iocata!', it: 'Ho fatto una bella giocata!' },
  ],
  cpuScopa: [
    { d: 'Va curcati!', it: 'Vai a dormire!' },
    { d: 'Scupa! E mo chi fai?', it: 'Scopa! E adesso che fai?' },
  ],
  cpuBig: [
    { d: 'Nenti pe tia!', it: 'Niente per te!' },
    { d: 'Chi cumbinasti?', it: 'Che hai combinato?' },
  ],
  sette: [{ d: 'Sette e menzu!', it: 'Sette e mezzo!' }],
  reale: [{ d: 'Reali! A facci tua!', it: 'Sette e mezzo reale! Alla faccia tua!' }],
  sballo: [{ d: 'Sballasti!', it: 'Hai sballato!' }],
  bancoSballa: [{ d: 'A facci tua, bancu!', it: 'Alla faccia tua, banco!' }],
  win: [{ d: 'Ti fici a festa!', it: 'Ti ho fatto la festa!' }],
  lose: [{ d: 'Sta vota jiu bona a mia!', it: 'Stavolta è andata bene a me!' }],
  lento: [{ d: 'Mòviti ca scurau!', it: 'Muoviti, che si è fatto buio!' }],
  lento2: [{ d: 'Chi fai, dormi?', it: 'Che fai, dormi?' }],
};
const AUDIO = { on: true };
try { AUDIO.on = localStorage.getItem('scopa-calabrese-audio') !== 'no'; } catch (e) { /* default on */ }
let actx = null;
function tone(freq, start, dur, type, vol) {
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, actx.currentTime + start);
  g.gain.exponentialRampToValueAtTime(vol, actx.currentTime + start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + start + dur);
  o.connect(g).connect(typeof fxDest === 'function' ? fxDest() : actx.destination);
  o.start(actx.currentTime + start); o.stop(actx.currentTime + start + dur + 0.02);
}
function fx(kind) {
  if (!AUDIO.on) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    if (kind === 'card') {
      const n = Math.floor(actx.sampleRate * 0.07), buf = actx.createBuffer(1, n, actx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
      const s = actx.createBufferSource(), f = actx.createBiquadFilter(), g = actx.createGain();
      f.type = 'bandpass'; f.frequency.value = 1800; g.gain.value = 0.5;
      s.buffer = buf; s.connect(f).connect(g).connect(typeof fxDest === 'function' ? fxDest() : actx.destination); s.start();
    } else if (kind === 'take') {
      tone(660, 0, 0.12, 'triangle', 0.18); tone(880, 0.08, 0.16, 'triangle', 0.16);
    } else if (kind === 'big') {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.28, 'triangle', 0.16));
    } else if (kind === 'sad') {
      tone(392, 0, 0.25, 'sine', 0.14); tone(311, 0.2, 0.4, 'sine', 0.12);
    }
  } catch (e) { /* audio not available */ }
}
let itVoice = null;
function pickVoice() {
  try {
    const vs = window.speechSynthesis ? speechSynthesis.getVoices() : [];
    itVoice = vs.find((v) => /^it/i.test(v.lang)) || null;
  } catch (e) { itVoice = null; }
}
try { if (window.speechSynthesis) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; } } catch (e) { /* no speech */ }
function say(key, who) {
  const list = LINES[key];
  if (!list) return;
  const line = list[Math.floor(Math.random() * list.length)];
  document.querySelectorAll('.voice').forEach((v) => v.remove());
  const el = document.createElement('div');
  el.className = 'voice' + (who === 1 ? ' cpu' : '');
  el.setAttribute('role', 'status');
  const av = who === 1 ? AVIMG.massaro : AVIMG[P.av];
  el.innerHTML = '<img src="' + av + '" alt=""><div><div class="who"></div><b></b><small></small></div>';
  el.querySelector('.who').textContent = who === 1 ? ((window.CONQ_FIGHT || window.CLAN_FIGHT || window.TOUR_FIGHT || {}).name || 'Computer') : (P.nick || 'Tu');
  el.querySelector('b').textContent = isIt() ? line.it : line.d;
  el.querySelector('small').textContent = isIt() ? '' : line.it;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
  fx(who === 1 ? 'sad' : 'big');
  if (!AUDIO.on) return;
  try {
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(isIt() ? line.it : line.d);
    u.lang = 'it-IT'; if (itVoice) u.voice = itVoice;
    u.rate = who === 1 ? 0.95 : 1.05; u.pitch = who === 1 ? 0.8 : 1.15;
    speechSynthesis.speak(u);
  } catch (e) { /* speech not available */ }
}
const IDLE = { t1: null, t2: null };
function idleReset() { clearTimeout(IDLE.t1); clearTimeout(IDLE.t2); IDLE.t1 = IDLE.t2 = null; }
function idle(active) {
  if (!active || view !== 'vGame') { idleReset(); return; }
  if (IDLE.t1 || IDLE.t2) return;
  IDLE.t1 = setTimeout(() => {
    IDLE.t1 = null;
    say('lento', 1);
    IDLE.t2 = setTimeout(() => { say('lento2', 1); }, 20000);
  }, 15000);
}
function syncAudioBtn() { for (const b of [$('audioBtn'), $('homeVoice')]) { b.setAttribute('aria-pressed', String(AUDIO.on)); b.textContent = AUDIO.on ? 'Voce sì' : 'Voce no'; } }
