/* ================= musica: un brano originale per ogni gioco =================
   Tutto suonato dal vivo con WebAudio (niente file audio). Ogni brano ha la sua melodia,
   i suoi accordi, il suo strumento e il suo ritmo. Cambia da solo quando cambi gioco. */
// note: "A4" = La sotto il Do centrale+1, "-" = tieni la nota, "." = pausa. Le battute si separano con |
const NB = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function mParse(t) {
  if (t === '-') return -1; if (t === '.') return 0;
  const m = /^([A-G])(#|b)?(\d)$/.exec(t); if (!m) return 0;
  return NB[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (+m[3] + 1) * 12;
}
function mChord(name) {
  const m = /^([A-G])(#|b)?(m)?$/.exec(name), pc = (NB[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + 12) % 12;
  const tones = [0, m[3] ? 3 : 4, 7].map((i) => { let n = 55 + ((pc + i - 55) % 12 + 12) % 12; return n; });
  const root = 36 + ((pc - 36) % 12 + 12) % 12;
  return { tones: tones.sort((a, b) => a - b), root, fifth: root + 7 };
}
function mSong(o) {
  if (typeof o.mel === 'string') o.bars = o.mel.trim().split('|').map((b) => b.trim().split(/\s+/).map(mParse));
  o.ch = o.chords.trim().split(/\s+/).map(mChord);
  o.sd = 60 / o.spm;
  return o;
}
const SONGS = {
  // il menu: la tarantella di sempre (La minore, 6/8)
  home: mSong({ n: 'Tarantella du Pacciu', m: 6, spm: 336, lead: 'reed', perc: 'tamb', drone: [45, 52], comp: 'block',
    bars: [
      [76, 74, 72, 71, 72, 74], [76, -1, 72, 69, -1, 0], [71, 72, 74, 76, 74, 72], [71, -1, 68, 64, -1, 0],
      [69, 72, 76, 81, 76, 72], [74, 76, 77, 76, 74, 72], [71, 74, 72, 71, 69, 68], [69, -1, -1, 0, 76, 77],
      [77, 76, 74, 77, -1, 74], [76, 74, 72, 76, -1, 72], [74, 72, 71, 72, 71, 68], [69, -1, 72, 76, -1, 77],
      [77, 74, 77, 81, -1, 77], [76, 72, 76, 81, -1, 76], [74, 72, 71, 68, 71, 74], [72, 71, 68, 69, -1, 0]],
    chords: 'Am Am E E Am Am E Am Dm Am E Am Dm Am E Am' }),
  // scopa: serenata col mandolino (Re minore, 3/4)
  scopa: mSong({ n: 'Serenata da Scupa', m: 6, spm: 200, lead: 'mando', perc: 'soft', comp: 'arp',
    mel: `A4 - D5 - F5 E5 | D5 - - - A4 . | C#5 - E5 - G5 F5 | E5 - - - . . |
          F5 - A5 - G5 F5 | E5 D5 C#5 - D5 E5 | Bb4 - D5 - G5 F5 | E5 - - - . . |
          A5 - F5 - C5 A4 | G4 - C5 - E5 G5 | F5 E5 D5 - A4 D5 | C#5 - - - . . |
          Bb5 - G5 - D5 Bb4 | A4 D5 F5 - A5 F5 | E5 - C#5 - A4 C#5 | D5 - - - . .`,
    chords: 'Dm Dm A A Dm Dm Gm A F C Dm A Gm Dm A Dm' }),
  // briscola: polka di paese (Sol maggiore, 2/4)
  briscola: mSong({ n: 'Polka da Briscula', m: 4, spm: 240, lead: 'accord', perc: 'wood', comp: 'block',
    mel: `B4 D5 G5 D5 | B4 - G4 . | A4 C5 F#5 C5 | A4 - F#4 . |
          G4 B4 D5 G5 | F#5 E5 D5 B4 | E5 G5 E5 C5 | D5 - A4 . |
          B4 D5 G5 D5 | B4 - G4 . | A4 C5 F#5 A5 | G5 F#5 E5 D5 |
          E5 - C5 E5 | F#5 E5 D5 C5 | B4 D5 A4 F#4 | G4 - . .`,
    chords: 'G G D D G G C D G G D D C D G G' }),
  // sette e mezzo: valzerino allegro (Fa maggiore, 3/4)
  sette: mSong({ n: 'Valzer du Setti e Menzu', m: 3, spm: 168, lead: 'box', perc: 'none', comp: 'block',
    mel: `A4 C5 F5 | A5 - F5 | G5 E5 C5 | G4 - . | Bb4 C5 E5 | G5 - E5 | F5 A5 C6 | A5 - . |
          D5 F5 Bb5 | D6 - Bb5 | A5 F5 C5 | A4 - C5 | E5 G5 Bb5 | G5 E5 C5 | F5 C5 A4 | F4 - .`,
    chords: 'F F C C C C F F Bb Bb F F C C F F' }),
  // tressette: il minuetto del nonno (Mi minore, 3/4)
  tressette: mSong({ n: 'Minuettu du Nannu', m: 6, spm: 168, lead: 'flute', perc: 'none', comp: 'arp',
    mel: `E5 - G5 - B5 A5 | G5 - E5 - - . | F#5 - A5 - D#5 F#5 | B4 - - - . . |
          G5 F#5 E5 - B4 E5 | G5 - B5 - A5 G5 | E5 - A5 - C6 B5 | A5 - F#5 - D#5 . |
          E5 - G5 - C6 G5 | D5 - G5 - B5 G5 | C6 B5 A5 - E5 A5 | F#5 - - - D#5 . |
          E5 - B4 - E5 G5 | A5 - C6 - B5 A5 | F#5 - A5 - D#5 F#5 | E5 - - - . .`,
    chords: 'Em Em B B Em Em Am B C G Am B Em Am B Em' }),
  // solitario: carillon tranquillo (Do maggiore, 4/4)
  solitario: mSong({ n: 'Carillon da Sula', m: 8, spm: 168, lead: 'box', perc: 'none', comp: 'arp',
    mel: `E5 - G5 - C6 - G5 . | A5 - E5 - C5 - E5 . | F5 - A5 - C6 - A5 G5 | G5 - - - D5 - . . |
          E5 G5 C6 G5 E5 - C5 . | C5 E5 A5 E5 C5 - A4 . | B4 D5 G5 D5 F5 - D5 . | C5 - - - . - . .`,
    chords: 'C Am F G C Am G C' }),
  // morra: tarantella indiavolata (Re minore, 6/8 veloce)
  morra: mSong({ n: 'A Morra Arrabbiata', m: 6, spm: 414, lead: 'reed', perc: 'tamb', drone: [38, 45], comp: 'block',
    mel: `D5 F5 A5 F5 D5 F5 | A5 G5 F5 E5 D5 . | C#5 E5 A5 E5 C#5 E5 | G5 F5 E5 D5 C#5 . |
          D5 E5 F5 G5 A5 Bb5 | A5 F5 D5 A4 D5 . | E5 F5 E5 D5 C#5 A4 | D5 - - D5 . . |
          G5 Bb5 D6 Bb5 G5 Bb5 | A5 F5 D5 F5 A5 . | E5 G5 A5 G5 E5 C#5 | D5 F5 D5 A4 D5 . |
          Bb5 A5 G5 F5 E5 D5 | F5 E5 D5 C#5 D5 . | E5 C#5 A4 C#5 E5 G5 | F5 - D5 - . .`,
    chords: 'Dm Dm A A Dm Dm A Dm Gm Dm A Dm Gm Dm A Dm' }),
  // pesca: barcarola del mare (Fa maggiore, 6/8 lenta)
  pesca: mSong({ n: 'Barcarola du Mari', m: 6, spm: 180, lead: 'flute', perc: 'sea', comp: 'arp',
    mel: `C5 - A4 C5 - F5 | A5 - - G5 - F5 | E5 - G5 - - E5 | C5 - - - . . |
          D5 - F5 Bb5 - A5 | A5 - F5 C5 - A4 | G4 - C5 E5 - G5 | F5 - - - . . |
          F5 - D5 A5 - F5 | E5 - C5 A5 - E5 | D5 - F5 Bb5 - D6 | C6 - - G5 . . |
          A5 - C6 A5 - F5 | F5 - D5 Bb4 - D5 | E5 - G5 - C5 E5 | F5 - - - . .`,
    chords: 'F F C C Bb F C F Dm Am Bb C F Bb C F' }),
  // il paese, le pecore e il telaio: pastorale con la zampogna (Sol maggiore, 6/8)
  paese: mSong({ n: 'Pastorali da Zampogna', m: 6, spm: 240, lead: 'ciaram', perc: 'soft', drone: [43, 50], comp: 'none',
    mel: `D5 - B4 D5 - G5 | G5 F#5 E5 D5 - . | C5 - A4 C5 - F#5 | E5 D5 C5 B4 - . |
          B4 C5 D5 G5 - D5 | E5 - C5 G4 - C5 | A4 B4 C5 D5 - F#4 | G4 - - - . . |
          B5 - G5 D5 - G5 | B5 A5 G5 F#5 - G5 | A5 - F#5 D5 - F#5 | A5 G5 F#5 E5 - D5 |
          E5 - G5 C6 - G5 | D5 - G5 B5 - G5 | F#5 E5 D5 C5 - A4 | G4 - - - . .`,
    chords: 'G G D D G C D G G G D D C G D G' }),
  // BergoDrink: la fabbrica allegra (Do maggiore, 2/4)
  drink: mSong({ n: 'U Bùggiu da Fabbrica', m: 4, spm: 264, lead: 'square', perc: 'wood', comp: 'block',
    mel: `C5 E5 G5 E5 | C6 - G5 . | B4 D5 G5 D5 | B5 - G5 . |
          E5 G5 C6 G5 | E5 - C5 E5 | F5 A5 C6 A5 | G5 - D5 . |
          A5 - E5 A5 | C6 B5 A5 E5 | G5 - E5 G5 | B5 A5 G5 E5 |
          F5 A5 C6 A5 | G5 B5 D6 B5 | C6 G5 E5 G5 | C6 - . .`,
    chords: 'C C G G C C F G Am Am Em Em F G C C' }),
  // salumificio: mazurka con la fisarmonica (Re maggiore, 3/4)
  sal: mSong({ n: 'Mazurka du Salumificiu', m: 3, spm: 150, lead: 'accord', perc: 'none', comp: 'block',
    mel: `F#5 - A5 | D6 A5 F#5 | E5 - A5 | C#6 A5 E5 | G5 F#5 E5 | C#5 - E5 | D5 F#5 A5 | D6 - . |
          B5 - G5 | D5 G5 B5 | A5 F#5 D5 | F#5 - A5 | G5 E5 C#5 | E5 C#5 A4 | D5 F#5 A5 | D5 - .`,
    chords: 'D D A A A A D D G G D D A A D D' }),
  // Casa da Figghia: valzer dolce (La maggiore, 3/4)
  figghia: mSong({ n: 'Valzer da Figghia', m: 6, spm: 192, lead: 'mando', perc: 'none', comp: 'arp',
    mel: `E5 - A5 - C#6 B5 | A5 - E5 - - . | D5 - E5 - G#5 B5 | B5 - - - G#5 . |
          C#5 - E5 - A5 C#6 | B5 A5 G#5 - A5 . | F#5 - A5 - D6 C#6 | B5 - - - . . |
          C#6 - A5 - F#5 A5 | C#6 B5 A5 - F#5 . | D6 - A5 - F#5 A5 | B5 A5 F#5 - D5 . |
          C#6 - A5 - E5 A5 | B5 - G#5 - E5 G#5 | A5 - E5 - C#5 E5 | A5 - - - . .`,
    chords: 'A A E E A A D E F#m F#m D D A E A A' }),
  // U Palluni: marcia da stadio (Si bemolle, 2/4)
  calcio: mSong({ n: 'Marcia du Palluni', m: 4, spm: 232, lead: 'brass', perc: 'snare', comp: 'block',
    mel: `F4 Bb4 D5 F5 | Bb5 - F5 . | C5 F5 A5 C6 | A5 - F5 . |
          Eb5 D5 C5 A4 | C5 - F5 . | D5 F5 Bb5 F5 | D5 - Bb4 . |
          G5 - Eb5 G5 | Bb5 - G5 . | F5 - D5 F5 | Bb5 - F5 . |
          A5 G5 F5 Eb5 | C5 D5 Eb5 A4 | Bb4 D5 F5 D5 | Bb4 - . .`,
    chords: 'Bb Bb F F F F Bb Bb Eb Eb Bb Bb F F Bb Bb' }),
  // U Borgu: aria solenne del paese che rinasce (Mi bemolle, 4/4 lenta)
  borgo: mSong({ n: 'U Borgu Rinasci', m: 8, spm: 144, lead: 'flute', perc: 'bell', comp: 'arp', drone: [39],
    mel: `G5 - - - Bb5 - G5 - | F5 - - - D5 - Bb4 - | C5 - Eb5 - G5 - Eb5 - | Ab5 - - - G5 - F5 - |
          Eb5 - G5 - Bb5 - Eb6 - | D6 - - - Bb5 - F5 - | C6 - Ab5 - Eb5 - C5 - | D5 - - - . - . - |
          Eb5 - G5 - C6 - G5 - | D5 - G5 - Bb5 - G5 - | C6 - Ab5 - Eb5 - Ab5 - | G5 - - - Eb5 - . - |
          Ab5 - C6 - Eb6 - C6 - | F5 - Bb5 - D6 - Bb5 - | G5 - F5 - Eb5 - Bb4 - | Eb5 - - - - - . -`,
    chords: 'Eb Bb Cm Ab Eb Bb Ab Bb Cm Gm Ab Eb Ab Bb Eb Eb' }),
  // Conquista, tornei e partite online: marcia eroica (Do minore, 2/4)
  conquista: mSong({ n: 'A Conquista da Calabria', m: 4, spm: 224, lead: 'brass', perc: 'snare', comp: 'block',
    mel: `C5 - G4 C5 | Eb5 - D5 C5 | D5 - B4 G4 | G5 - D5 . |
          Eb5 - C5 Eb5 | G5 - F5 Eb5 | Ab5 G5 F5 Eb5 | D5 - B4 . |
          C5 Eb5 Ab5 Eb5 | C6 - Ab5 . | Bb5 G5 Eb5 G5 | Bb5 - G5 . |
          Ab5 G5 F5 C5 | B4 D5 G5 F5 | Eb5 D5 C5 G4 | C5 - . .`,
    chords: 'Cm Cm G G Cm Cm Ab G Ab Ab Eb Eb Fm G Cm Cm' }),
};
const MUSIC = { on: true, playing: false, step: 0, next: 0, iv: null, master: null, drone: null, key: 'home', sw: 0 };
try { MUSIC.on = localStorage.getItem('scopa-calabrese-musica') !== 'no'; } catch (e) { /* default on */ }
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

// quale brano va suonato adesso
function musicKey() {
  try {
    const v = typeof view !== 'undefined' ? view : 'vHome';
    if (v === 'vGame') { const k = typeof currentKind !== 'undefined' ? currentKind : ''; return SONGS[k] ? k : 'scopa'; }
    if (v === 'vMorra') return 'morra';
    if (v === 'vPesca') return 'pesca';
    if (v === 'vCalcio') return 'calcio';
    if (v === 'vBorgo') return 'borgo';
    if (v === 'vCasa') return 'figghia';
    if (v === 'vPaese') { const t = typeof paeseTab !== 'undefined' ? paeseTab : ''; return t === 'drink' ? 'drink' : t === 'sal' ? 'sal' : 'paese'; }
    if (v === 'vConq' || v === 'vTornei' || v === 'vOnline' || v === 'vClan') return 'conquista';
  } catch (e) { /* prima che il gioco sia pronto */ }
  return 'home';
}

function mNote(freq, t, dur, type, vol, filt, atk) {
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = type; o.frequency.value = freq;
  let node = o;
  if (filt) { const f = actx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = filt; o.connect(f); node = f; }
  const a = atk || 0.015;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + a);
  g.gain.exponentialRampToValueAtTime(vol * 0.6, t + Math.max(a + 0.01, dur * 0.5));
  g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(a + 0.02, dur));
  node.connect(g).connect(MUSIC.master);
  o.start(t); o.stop(t + dur + 0.05);
  return o;
}
function mVibrato(o, t, end, rate, depth) {
  const lfo = actx.createOscillator(), lg = actx.createGain(); lfo.frequency.value = rate; lg.gain.value = depth;
  lfo.connect(lg).connect(o.frequency); lfo.start(t); lfo.stop(end);
}
function mNoise(t, len, hp, vol, bp) {
  const n = Math.floor(actx.sampleRate * len), buf = actx.createBuffer(1, n, actx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
  const s = actx.createBufferSource(), f = actx.createBiquadFilter(), g = actx.createGain();
  f.type = bp ? 'bandpass' : 'highpass'; f.frequency.value = hp; g.gain.value = vol;
  s.buffer = buf; s.connect(f).connect(g).connect(MUSIC.master); s.start(t);
}
function mKick(t, vol) {
  const o = actx.createOscillator(), g = actx.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(55, t + 0.12);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16); o.connect(g).connect(MUSIC.master); o.start(t); o.stop(t + 0.2);
}

// lo strumento che canta la melodia
function mLead(S, n, t, len) {
  const f = mtof(n), dur = S.sd * len * 0.95;
  switch (S.lead) {
    case 'mando': { // mandolino: pizzico, e tremolo sulle note lunghe
      const k = len > 1 ? Math.round(len * 2) : 1, d = dur / k;
      for (let i = 0; i < k; i++) { mNote(f, t + i * d, d * 0.9, 'triangle', i ? 0.06 : 0.08); mNote(f * 2, t + i * d, d * 0.5, 'square', 0.008, 3000); }
      break;
    }
    case 'box': // carillon: campanella che si spegne
      mNote(f * 2, t, Math.min(1.2, dur + 0.5), 'sine', 0.08); mNote(f * 4, t, 0.25, 'sine', 0.015);
      break;
    case 'flute': { const o = mNote(f, t, dur, 'sine', 0.085, 0, 0.05); mNote(f * 2, t, dur, 'sine', 0.01, 0, 0.05); if (len > 1) mVibrato(o, t + 0.12, t + dur, 5, 3); break; }
    case 'accord': { [-6, 6].forEach((c) => mNote(f * Math.pow(2, c / 1200), t, dur, 'sawtooth', 0.03, 1500, 0.02)); break; }
    case 'brass': { const o = mNote(f, t, dur, 'sawtooth', 0.05, 1700, 0.03); if (len > 2) mVibrato(o, t + 0.15, t + dur, 5, 2); break; }
    case 'ciaram': { const o = mNote(f, t, dur, 'square', 0.035, 1900, 0.02); if (len > 1) mVibrato(o, t + 0.08, t + dur, 6, 5); break; }
    case 'square': mNote(f, t, dur * 0.8, 'square', 0.03, 2600); break;
    default: { // zampogna/ciaramella della tarantella
      const o = mNote(f, t, dur, 'sawtooth', 0.05, 2200);
      if (len > 1) mVibrato(o, t + 0.08, t + S.sd * len, 5.5, 4);
    }
  }
}
// basso, accordi e percussioni secondo il tempo del brano
function mStep(i, t) {
  const S = SONGS[MUSIC.key] || SONGS.home, M = S.m, bars = S.bars;
  const bar = Math.floor(i / M) % bars.length, pos = i % M, ch = S.ch[bar % S.ch.length];
  const n = bars[bar][pos];
  if (n > 0) { let len = 1; while (pos + len < M && bars[bar][pos + len] === -1) len++; mLead(S, n, t, len); }
  const half = M === 3 ? -1 : M / 2, soft = S.lead === 'box' || S.lead === 'flute';
  if (pos === 0) mNote(mtof(ch.root), t, S.sd * (M === 3 ? 1.5 : 1.8), 'triangle', soft ? 0.12 : 0.16);
  else if (pos === half) mNote(mtof(ch.fifth), t, S.sd * 1.8, 'triangle', soft ? 0.1 : 0.13);
  else if (S.comp === 'block') ch.tones.forEach((m) => mNote(mtof(m), t, S.sd * 0.7, 'square', M === 3 ? 0.014 : 0.012, 1600));
  else if (S.comp === 'arp') mNote(mtof(ch.tones[(pos - 1) % 3] + (S.lead === 'box' ? 12 : 0)), t, S.sd * 1.6, 'triangle', 0.035, 2000);
  const acc = pos === 0 || pos === half;
  switch (S.perc) {
    case 'tamb': mNoise(t, 0.05, 6500, acc ? 0.22 : 0.09); if (acc) mKick(t, 0.25); break;
    case 'snare': if (pos === 0) mKick(t, 0.3); else if (pos === half) mNoise(t, 0.12, 1800, 0.18, true); else mNoise(t, 0.03, 8000, 0.04); break;
    case 'wood': if (pos % 2 === 0) mNote(pos === 0 ? 1100 : 1500, t, 0.04, 'sine', pos === 0 ? 0.08 : 0.05); break;
    case 'soft': if (acc) mNoise(t, 0.04, 7500, 0.05); break;
    case 'bell': if (pos === 0 && bar % 2 === 0) { mNote(mtof(ch.root + 36), t, 1.6, 'sine', 0.02); } break;
    case 'sea': if (pos === 0 && bar % 2 === 0) mNoise(t, S.sd * M * 1.6, 600, 0.05, true); break;
    default: break;
  }
}
function mDrone(S) {
  if (MUSIC.drone) { const dr = MUSIC.drone; MUSIC.drone = null; dr.forEach((o) => { try { o.stop(actx.currentTime + 0.05); } catch (e) { /* ignore */ } }); }
  if (!S.drone) return;
  MUSIC.drone = S.drone.map((m) => {
    const o = actx.createOscillator(), f = actx.createBiquadFilter(), g = actx.createGain();
    o.type = 'sawtooth'; o.frequency.value = mtof(m); f.type = 'lowpass'; f.frequency.value = 700; g.gain.value = S.drone.length > 1 ? 0.035 : 0.03;
    o.connect(f).connect(g).connect(MUSIC.master); o.start();
    return o;
  });
}
function mTick() {
  if (!MUSIC.playing) return;
  const now = actx.currentTime, want = musicKey();
  // cambio brano: abbasso, cambio, rialzo
  if (want !== MUSIC.key && !MUSIC.sw) { MUSIC.sw = now + 0.45; MUSIC.master.gain.setTargetAtTime(0.0001, now, 0.1); }
  if (MUSIC.sw) {
    if (now < MUSIC.sw) return;
    MUSIC.sw = 0; MUSIC.key = musicKey(); MUSIC.step = 0; MUSIC.next = now + 0.05; mDrone(SONGS[MUSIC.key]);
  }
  const speaking = (() => { try { return window.speechSynthesis && speechSynthesis.speaking; } catch (e) { return false; } })();
  MUSIC.master.gain.setTargetAtTime(Math.max(0.0001, (speaking ? 0.06 : 0.16) * (MUSIC.vol === undefined ? 1 : MUSIC.vol)), now, 0.2);
  const S = SONGS[MUSIC.key] || SONGS.home;
  if (MUSIC.next < now - 0.5) MUSIC.next = now + 0.05;   // dopo una pausa lunga non recupera tutte le note
  while (MUSIC.next < now + 0.25) {
    mStep(MUSIC.step, MUSIC.next);
    MUSIC.step++;
    MUSIC.next += S.sd;
  }
}
function musicStart() {
  if (!MUSIC.on || MUSIC.playing) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    MUSIC.master = actx.createGain();
    MUSIC.master.gain.value = 0.0001;
    MUSIC.master.connect(actx.destination);
    MUSIC.key = musicKey(); MUSIC.sw = 0;
    mDrone(SONGS[MUSIC.key]);
    MUSIC.playing = true;
    MUSIC.step = 0;
    MUSIC.next = actx.currentTime + 0.1;
    MUSIC.iv = setInterval(mTick, 60);
  } catch (e) { MUSIC.playing = false; }
}
function musicStop() {
  if (!MUSIC.playing) return;
  MUSIC.playing = false;
  clearInterval(MUSIC.iv);
  try {
    const m = MUSIC.master, dr = MUSIC.drone || [];
    MUSIC.drone = null;
    m.gain.setTargetAtTime(0.0001, actx.currentTime, 0.15);
    setTimeout(() => { dr.forEach((o) => { try { o.stop(); } catch (e) { /* ignore */ } }); m.disconnect(); }, 600);
  } catch (e) { /* ignore */ }
}
function syncMusicBtns() {
  document.querySelectorAll('.musicBtn').forEach((b) => { b.setAttribute('aria-pressed', String(MUSIC.on)); b.textContent = MUSIC.on ? 'Musica sì' : 'Musica no'; });
}
document.addEventListener('click', (e) => {
  const mb = e.target.closest('.musicBtn');
  if (mb) {
    MUSIC.on = !MUSIC.on;
    try { localStorage.setItem('scopa-calabrese-musica', MUSIC.on ? 'si' : 'no'); } catch (err) { /* ignore */ }
    if (MUSIC.on) musicStart(); else musicStop();
    syncMusicBtns();
    return;
  }
  if (MUSIC.on && !MUSIC.playing) musicStart();
}, true);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) musicStop();
});
