/* ================= LINGUA: calabrese (com'è il gioco) oppure tutto in italiano ================= */
const isIt = () => !!(typeof P !== 'undefined' && P && P.lang === 'it');
const IT = {
  // salumificio
  'Si calaru i parenti i Torinu, mi servi cocchi cosa bona!': 'Sono arrivati i parenti da Torino, mi serve qualcosa di buono!',
  'Stasira aiu invitati a casa, dammi u megghiu chi ndai!': 'Stasera ho ospiti a casa, dammi il meglio che hai!',
  'Na ’nduja bella piccanti, mi raccumandu!': 'Una ’nduja bella piccante, mi raccomando!',
  'Comu sempri, u solitu!': 'Come sempre, il solito!',
  'Faciti prestu ca a casa m’aspetta a mugghieri!': 'Fate presto che a casa mi aspetta mia moglie!',
  'Aia la miseria, chi profumu ca c’è ccà!': 'Accidenti, che profumo che c’è qui!',
  'Mi servi pe na festa i paisi!': 'Mi serve per una festa di paese!',
  'U meu niputi veni i Torinu, vogghiu fari bella figura!': 'Mio nipote viene da Torino, voglio fare bella figura!',
  'Dumani è a festa du santu, aiu a fari i panini pe tutti!': 'Domani è la festa del santo, devo fare i panini per tutti!',
  'Na soppressata comu si faciva na vota!': 'Una soppressata come si faceva una volta!',
  'Ieri mi fici na partita a scupa, oji mi mangiu nu bellu paninu!': 'Ieri ho fatto una partita a scopa, oggi mi mangio un bel panino!',
  'Veni a signora Rusina pe pranzu, e idda è precisa!': 'Viene la signora Rosina a pranzo, e lei è precisa!',
  // clan
  'Forza ca stasira vincimu!': 'Forza che stasera vinciamo!',
  'Cu mi faci na partita a scupa?': 'Chi mi fa una partita a scopa?',
  'Aia la miseria, fici tri scupi i filu!': 'Accidenti, ho fatto tre scope di fila!',
  'Mòviti ca scurau!': 'Muoviti, che si è fatto buio!',
  'Chi bellu stu mazzu, cu u fici?': 'Che bello questo mazzo, chi l’ha fatto?',
  'U bergamottu meu è quasi maturu.': 'Il mio bergamotto è quasi maturo.',
  'Oji a briscula non mi vaji bona pe nenti.': 'Oggi a briscola non mi va bene per niente.',
  'Jamu ca mancanu picca scupi pe l’obiettivu!': 'Dai che mancano poche scope per l’obiettivo!',
  'Cu apriu u bauli d’oru?': 'Chi ha aperto il baule d’oro?',
  'Ieri mi fici na bella partita a trissetti.': 'Ieri ho fatto una bella partita a tressette.',
  'Si calaru i parenti i Torinu, stasira iocu picca.': 'Sono arrivati i parenti da Torino, stasera gioco poco.',
  'Cocchiunu mi presta nu pocu i fenu pe i pecuri?': 'Qualcuno mi presta un po’ di fieno per le pecore?',
  'Bravi a tutti, bona sirata!': 'Bravi tutti, buona serata!',
  'Bravu!': 'Bravo!', 'Veru è!': 'È vero!', 'Jamu!': 'Andiamo!', 'Va beni.': 'Va bene.', 'Stasira ci sugnu.': 'Stasera ci sono.',
  'Aia la miseria!': 'Accidenti!', 'Pijja chistu!': 'Prendi questo!', 'Ahah, sì forti!': 'Ahah, sei forte!',
  // frasi veloci online
  'Bella iocata!': 'Bella giocata!', 'Bonu, bonu!': 'Bene, bene!', 'Ti fici a festa!': 'Ti ho fatto la festa!',
  // telaio
  'Mi sposa a figghia, mi servi u corredu!': 'Si sposa mia figlia, mi serve il corredo!',
  'Faci friddu supra a Sila, fammi na cosa carda!': 'Fa freddo sulla Sila, fammi una cosa calda!',
  'Pa’ festa da Madonna vogghiu na cosa nova!': 'Per la festa della Madonna voglio una cosa nuova!',
  'Fa friddu ’ncapu a Sila, fammi na cosa calda!': 'Fa freddo sulla Sila, fammi una cosa calda!',
  'Pe’ la festa da Madonna vogghiu na cosa nova!': 'Per la festa della Madonna voglio una cosa nuova!',
  'A me nonna u tessiva ’nto telaru, fammilu comu a idda!': 'Mia nonna lo tesseva al telaio, fammelo come lei!',
  'Arrivanu i parenti i Torinu, vogghiu fari bella figura!': 'Arrivano i parenti da Torino, voglio fare bella figura!',
  'Mi raccumandu, ca è nu rigalu!': 'Mi raccomando, che è un regalo!',
  'Comu i faciva me matri, chi mani ch’aviva!': 'Come li faceva mia madre, che mani che aveva!',
  'Benvenutu ’nta me casa! Portami a lana: a filamu, a tingimu e a tessimu ’nsemi.': 'Benvenuto a casa mia! Portami la lana: la filiamo, la tingiamo e la tessiamo insieme.',
  // la gatta
  'Miaaau! Mi porti nu tagliere?': 'Miaaau! Mi porti un tagliere?',
  'Sentu adduri i sarsizzu… miau!': 'Sento odore di salsiccia… miao!',
  'Rrrr… u tagliere è pe mmia, veru?': 'Rrrr… il tagliere è per me, vero?',
  'Miau! Aspettu ccà supra u tavulu.': 'Miao! Aspetto qui sopra il tavolo.',
  'Nu pocu i capocollo e nu pocu i ’nduja… miaaau!': 'Un po’ di capocollo e un po’ di ’nduja… miaaau!',
  'Rrrr rrrr… grazii! Mo mi fazzu na urata i sonnu.': 'Rrrr rrrr… grazie! Ora mi faccio un’ora di sonno.',
  // morra
  'Iocu a morra di quandu era picciriddu…': 'Gioco a morra da quando ero bambino…',
  'Ti leggiu ’nta l’occhi, compà!': 'Ti leggo negli occhi, compare!',
  'A morra ’nto paisi nu mi batti nuddu!': 'A morra in paese non mi batte nessuno!',
  'Sanaa! Punto tuo!': 'Dieci! Punto tuo!', 'Sanaa!': 'Dieci!',
  // nome ed energia
  'Sugnu u Signor ’Nduja. Prima di giocare, dimmi: comu ti chiami?': 'Sono il Signor ’Nduja. Prima di giocare, dimmi: come ti chiami?',
  'Chistu è u nomi meu!': 'Questo è il mio nome!',
  'Chistu nomi nun si po’ diri! Scegline n’atru.': 'Questo nome non si può dire! Scegline un altro.',
  'Almeno 3 lettere, compà!': 'Almeno 3 lettere!',
  'Chistu nomi è già pigghiatu! Provane n’atru, o pigghia unu di chisti:': 'Questo nome è già preso! Provane un altro, o prendi uno di questi:',
  'Vuoi cambiare nome? Scrivi chiddu novu e controllo che nun l’havi nuddu.': 'Vuoi cambiare nome? Scrivi quello nuovo e controllo che non ce l’abbia nessuno.',
  'Si stancu mortu, compà! Pe jocari n’atra partita ti servi l’energia.': 'Sei stanco morto! Per giocare un’altra partita ti serve l’energia.',
  // varie
  'Mòviti… a restare! Un’altra partita?': 'Muoviti… a restare! Un’altra partita?',
  'C’è sempri na pecora nira!': 'C’è sempre una pecora nera!',
  'C’è sempri na pecora nira': 'C’è sempre una pecora nera',
  '“C’è sempri na pecora nira!”': '“C’è sempre una pecora nera!”',
};
const IT_SUB = [[/c’è sempri na pecora nira/gi, (m) => (m[0] === 'C' ? 'C' : 'c') + '’è sempre una pecora nera'], [/Mòviti ca scurau/g, 'Muoviti, che si è fatto buio']];
function tr(s) {
  if (!isIt() || typeof s !== 'string') return s;
  if (IT[s]) return IT[s];
  let t = s; for (const [r, v] of IT_SUB) t = t.replace(r, v);
  return t;
}
/* richieste dei clienti: se una frase vecchia non è nel dizionario, in italiano se ne usa una equivalente */
function trLine(s, list) {
  if (!isIt()) return s;
  if (IT[s]) return IT[s];
  let h = 0; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const alt = list && list.length ? list[h % list.length] : s;
  return IT[alt] || tr(s);
}
/* scegli tra due frasi: tr2('in dialetto', 'in italiano') */
const tr2 = (cal, it) => (isIt() ? it : cal);
const MORRA_IT = { 2: 'Due!', 3: 'Tre!', 4: 'Quattro!', 5: 'Cinque!', 6: 'Sei!', 7: 'Sette!', 8: 'Otto!', 9: 'Nove!', 10: 'Dieci!' };
const mNum = (n) => (isIt() ? MORRA_IT[n] : MORRA_NUM[n]);

/* nomi fissi (badge, obiettivi): si ricordano in dialetto e si traducono quando serve */
function applyLang() {
  const fix = (arr) => { if (!arr) return; for (const o of arr) { if (o.nameCal === undefined) o.nameCal = o.name; o.name = tr(o.nameCal); if (o.line !== undefined) { if (o.lineCal === undefined) o.lineCal = o.line; o.line = tr(o.lineCal); } } };
  try { fix(BADGES); } catch (e) { /* niente */ }
  try { fix(MORRA_GOALS); } catch (e) { /* niente */ }
  try { fix(MORRA_FOES); } catch (e) { /* niente */ }
  try { if (typeof EXIT_LINES !== 'undefined') { if (!EXIT_LINES.cal) EXIT_LINES.cal = EXIT_LINES.slice(); EXIT_LINES.cal.forEach((l, i) => { EXIT_LINES[i] = tr(l); }); } } catch (e) { /* niente */ }
}
function setLang(l) {
  P.lang = l; P.langAsked = true; save(); applyLang();
  if (typeof renderHome === 'function' && view === 'vHome') renderHome();
}
/* alla prima apertura, prima del nome */
function langFirst(cb) {
  if (P.langAsked) return false;
  overlay('<div class="langwin"><div class="nicknd">' + NDUJA_SVG + '</div><h2>Comu parramu? <small>Come parliamo?</small></h2>' +
    '<button class="langbtn cal" id="lgCal"><b>Calabrese</b><span>I personaggi parlano in dialetto, come in paese: “Pijja chistu!”</span></button>' +
    '<button class="langbtn it" id="lgIt"><b>Italiano</b><span>Tutto il gioco in italiano: “Prendi questo!”</span></button>' +
    '<p class="pgnote">Puoi cambiarla quando vuoi da ⚙ Impostazioni.</p></div>');
  const pick = (l) => { setLang(l); $('layer').innerHTML = ''; fx('take'); if (cb) cb(); };
  $('lgCal').onclick = () => pick('cal');
  $('lgIt').onclick = () => pick('it');
  return true;
}
