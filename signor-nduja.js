/* ================= il Signor 'Nduja ================= */
const NDUJA_SVG = `
<svg class="ndsvg" viewBox="0 0 130 175" role="img" aria-label="Il Signor 'Nduja">
  <defs>
    <clipPath id="ndBody"><path d="M65 30 C94 30 104 58 104 92 C104 132 87 152 65 152 C43 152 26 132 26 92 C26 58 36 30 65 30 Z"/></clipPath>
  </defs>
  <g class="nd-feet">
    <g class="nd-foot nd-l"><path d="M51 148 L49 160" stroke="#1A1A1A" stroke-width="4" stroke-linecap="round"/><ellipse cx="44" cy="163" rx="11" ry="6" fill="#1A1A1A"/><ellipse cx="41" cy="161" rx="4" ry="1.6" fill="#555"/></g>
    <g class="nd-foot nd-r"><path d="M79 148 L81 160" stroke="#1A1A1A" stroke-width="4" stroke-linecap="round"/><ellipse cx="86" cy="163" rx="11" ry="6" fill="#1A1A1A"/><ellipse cx="89" cy="161" rx="4" ry="1.6" fill="#555"/></g>
  </g>
  <g class="nd-body">
    <path d="M65 30 C94 30 104 58 104 92 C104 132 87 152 65 152 C43 152 26 132 26 92 C26 58 36 30 65 30 Z" fill="#B3312A"/>
    <g clip-path="url(#ndBody)">
      <ellipse cx="46" cy="80" rx="14" ry="34" fill="#CF4B36" opacity="0.7"/>
      <ellipse cx="88" cy="110" rx="12" ry="30" fill="#8E2420" opacity="0.5"/>
      <g fill="#E8B48C" opacity="0.85">
        <circle cx="40" cy="118" r="1.8"/><circle cx="52" cy="132" r="1.5"/><circle cx="84" cy="128" r="1.8"/><circle cx="93" cy="96" r="1.5"/>
        <circle cx="36" cy="96" r="1.4"/><circle cx="70" cy="138" r="1.6"/><circle cx="89" cy="70" r="1.3"/><circle cx="57" cy="122" r="1.2"/>
      </g>
      <g stroke="#F1DDB0" stroke-width="1.6" opacity="0.75" fill="none">
        <path d="M10 50 L120 140"/><path d="M10 80 L100 160"/><path d="M30 20 L130 110"/><path d="M60 10 L130 70"/>
        <path d="M120 50 L10 140"/><path d="M120 80 L30 160"/><path d="M100 20 L0 110"/><path d="M70 10 L0 70"/>
      </g>
    </g>
    <path d="M65 30 C94 30 104 58 104 92 C104 132 87 152 65 152 C43 152 26 132 26 92 C26 58 36 30 65 30 Z" fill="none" stroke="#1A1A1A" stroke-width="3"/>
    <path d="M57 31 Q65 22 73 31 Z" fill="#B3312A" stroke="#1A1A1A" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M58 26 Q65 21 72 26" fill="none" stroke="#E2C48A" stroke-width="3"/>
    <path d="M65 23 Q60 12 66 10 Q72 12 65 23" fill="none" stroke="#E2C48A" stroke-width="2.4"/>
    <g class="nd-cap">
      <path d="M38 40 Q46 22 70 22 Q90 23 94 38 Q72 33 38 40 Z" fill="#4A4038" stroke="#1A1A1A" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M90 37 Q104 38 108 44 Q96 45 86 40 Z" fill="#3A322B" stroke="#1A1A1A" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M48 32 Q66 27 86 30" fill="none" stroke="#6A5D50" stroke-width="1.5"/>
    </g>
    <path d="M42 58 Q50 53 57 57" fill="none" stroke="#1A1A1A" stroke-width="3" stroke-linecap="round"/>
    <path d="M73 57 Q80 53 88 58" fill="none" stroke="#1A1A1A" stroke-width="3" stroke-linecap="round"/>
    <g class="nd-eyes">
      <circle cx="50" cy="71" r="10" fill="#fff" stroke="#1A1A1A" stroke-width="2.5"/>
      <circle cx="80" cy="71" r="10" fill="#fff" stroke="#1A1A1A" stroke-width="2.5"/>
      <g class="nd-pupils"><circle cx="52" cy="73" r="4.5" fill="#1A1A1A"/><circle cx="82" cy="73" r="4.5" fill="#1A1A1A"/>
      <circle cx="53.5" cy="71.5" r="1.4" fill="#fff"/><circle cx="83.5" cy="71.5" r="1.4" fill="#fff"/></g>
    </g>
    <circle cx="40" cy="92" r="6" fill="#E8735E" opacity="0.7"/><circle cx="90" cy="92" r="6" fill="#E8735E" opacity="0.7"/>
    <ellipse class="nd-mouth" cx="65" cy="106" rx="7" ry="4" fill="#4A1210" stroke="#1A1A1A" stroke-width="2"/>
    <path d="M65 93 C58 92 52 95 46 92 C44 96 48 100 53 99 C58 98 62 96 65 95 C68 96 72 98 77 99 C82 100 86 96 84 92 C78 95 72 92 65 93 Z" fill="#1A1A1A"/>
  </g>
</svg>`;

const RULES = {
  home: [
    "Bonasira! Sono il Signor ’Nduja, piccante ma simpatico. Ti faccio da guida in questo bar del gioco.",
    "Qui trovi i giochi di carte calabresi, scopa, briscola, tressette, sette e mezzo e scarta i re, e i giochi del paese: U Palluni, A Casa da Figghia, le pecore e la pesca. Ogni partita ti dà punti esperienza.",
    "Le regole te le spiego la prima volta che apri un gioco, e se le scordi c’è il pulsante Regole. Ora vai: fatti la prima scopa!",
  ],
  scopa: [
    "La scopa! Il gioco più calabrese che c’è, dopo il peperoncino. Te la spiego in pochi bocconi.",
    "Il mazzo ha 40 carte in quattro semi: Mare, Montagna, Campagna e Bottega. Dall’Asso al 7 valgono il loro numero, la Donna 8, il Cavallo 9 e il Re 10.",
    "Al tuo turno giochi una carta. Se sul tavolo c’è una carta dello stesso valore, la prendi. Altrimenti puoi prendere più carte che sommate fanno quel valore: un 7 prende un 3 e un 4.",
    "Attento: se c’è la carta uguale devi prendere quella, e se puoi prendere sei obbligato a farlo. Se pulisci tutto il tavolo fai scopa, e ti guadagni un punto.",
    "A fine smazzata si contano i punti: chi ha più carte, chi ha più ulivi, cioè carte di Campagna, chi ha il settebello, chi vince la primiera, più una per ogni scopa. Si vince a 11.",
    "Un trucco: se una carta ti sembra piccola, tienila premuta e si ingrandisce. Quando lasci il dito torna al suo posto, senza giocarla.",
    "Un consiglio da amico: non lasciare sul tavolo carte che sommano 10 o meno, sennò l’avversario fa scopa. E il 7 di Campagna tienilo stretto come una ’nduja a Spilinga!",
  ],
  briscola: [
    "La briscola! Qui conta la testa più delle mani. Ascolta bene.",
    "Dopo aver dato tre carte a testa, se ne gira una e si mette sotto il mazzo: il suo seme è la briscola e batte tutti gli altri.",
    "Chi inizia gioca una carta, l’altro risponde con quella che vuole, anche di un altro seme. Vince la carta più alta dello stesso seme, ma qualsiasi briscola batte un seme diverso. Se rispondi con un altro seme che non è briscola, vince chi ha iniziato.",
    "L’ordine è Asso, Tre, Re, Cavallo, Donna, poi 7, 6, 5, 4 e 2. I punti sono: Asso 11, Tre 10, Re 4, Cavallo 3, Donna 2. Le altre carte valgono zero.",
    "Chi vince la mano pesca per primo e gioca la successiva. Alla fine si contano i punti: su 120, vince chi ne fa più di 60.",
    "Il mio segreto: non sprecare le briscole su mani senza punti, e Asso e Tre giocali quando sei sicuro di non perderli. Pazienza e ’nduja, si vince sempre!",
  ],
  sette: [
    "Sette e mezzo! Il gioco delle feste di Natale, quando tutta la famiglia sta attorno al tavolo.",
    "Dall’Asso al 7 le carte valgono il loro numero, le figure mezzo punto. Il Re di Campagna è la matta: vale quello che ti conviene.",
    "Giochi contro il banco. Hai una carta, poi decidi: Carta per prenderne un’altra, Sto per fermarti. Se superi sette e mezzo, sballi e perdi la mano.",
    "Poi gioca il banco. Vince chi si avvicina di più a sette e mezzo, ma a parità vince il banco. Sette e mezzo fatto con un 7 e una figura è reale: vale punti esperienza in più.",
    "Vince la partita chi arriva per primo a 5 mani. E ricordati: con 5 o 6 in mano, chiedere carta è come mettere troppa ’nduja sul pane… può bruciare!",
  ],
};


(() => {
  const INS = {"home": [2, [{"b": "Psst! E io sono Bergo, il bergamotto di Reggio! Quando giochi molto bene salto fuori con un regalo."}]], "scopa": [3, [{"b": "Oppure prendi tutto il tavolo e scappi! Ahahah!"}, {"n": "Ma quale scappi, Bergo! Si prende solo quello che fa somma. Non confondere il giocatore.", "mad": true}]], "briscola": [2, [{"b": "La briscola dovrebbe essere sempre Campagna: è il seme degli agrumi!"}, {"n": "Sono ulivi, Bergo, non agrumi! E la briscola la decide la carta girata, non tu.", "mad": true}]], "sette": [2, [{"b": "E io quanto valgo? Almeno otto!"}, {"n": "Tu non sei una carta, Bergo! E con otto si sballa.", "mad": true}]]};
  const END = {"scopa": {"b": "Fai due scope di fila e arrivo io con un regalo profumato!"}, "briscola": {"b": "Prendi una mano da 15 punti o più e ti porto un regalo!"}, "sette": {"b": "Vinci una mano con sette e mezzo e arrivo io con un regalo!"}};
  for (const k of Object.keys(INS)) { const [at, items] = INS[k]; RULES[k].splice(at, 0, ...items); }
  for (const k of Object.keys(END)) RULES[k].splice(RULES[k].length - 1, 0, END[k]);
})();


RULES.tressette = ["Il tressette! Il gioco dei nonni al circolo, dove si discute più che al mercato.", "Si gioca in due con 10 carte a testa, le altre restano nel mazzo. Qui non c’è briscola.", "Chi inizia gioca una carta e l’altro deve rispondere con lo stesso seme, se ce l’ha. Vince la carta più forte del seme giocato. Se non hai quel seme butti quello che vuoi, ma non prendi.", {"b": "E se non ho il seme posso mettere un bergamotto?"}, {"n": "No, Bergo! Si butta una carta qualsiasi. I bergamotti restano sull’albero.", "mad": true}, "L’ordine di forza è particolare: 3, 2, Asso, Re, Cavallo, Donna, poi 7, 6, 5 e 4.", "Ora le regole come le spiega il nonno. Dopo ogni presa si pesca: prima chi ha preso, poi l’altro. E appena peschi la carta nuova la devi mostrare all’avversario, ma solo per un momento: poi si nasconde con le altre. Bisogna ricordarsela, come facevano i nonni al circolo!", "Quando il mazzo finisce si gioca a carte chiuse.", "Poi il buongioco! Appena date le dieci carte si guarda la mano: tre assi, tre tre, tre due, oppure Asso, 2 e 3 dello stesso seme. Ogni combinazione vale subito 3 punti.", "Il buongioco si dice ad alta voce! Un buongioco vale 3 punti, due buongiochi 6, tre buongiochi 9, e così via: per esempio tre assi e pure Asso, 2 e 3 dello stesso seme fanno 6 punti. A fine mano e a fine partita il gioco ti ricorda quanti buongiochi avete fatto.", {"b": "Nonno, e il buongioco con tre bergamotti?"}, {"n": "Quello non vale, Bergo. Il nonno ride ma non te lo conta.", "mad": true}, "I punti delle prese: l’Asso vale uno, Tre, Due e figure un terzo, l’ultima presa un punto. Contro il computer si arriva a 21, online a 11. Vale sia contro il computer che online.", {"b": "Prendi una mano che vale più di un punto e arrivo io con il regalo!"}, "Il mio consiglio: ricordati le carte già uscite. Al tressette vince chi ha memoria, come le nonne che si ricordano tutto!"];
RULES.solitario = ["Il solitario Scarta i Re: un gioco di pazienza, perfetto mentre aspetti il caffè.", "Ci sono quattro righe, una per seme, e nove colonne, dall’Asso al Cavallo. Tutte le carte sono coperte. Altre quattro formano il mazzetto.", "Hai in mano una carta: trova tu il suo posto e toccalo. Riga del seme, colonna del numero. Sotto c’è una carta coperta: la prendi e cerchi il suo posto, e così via.", "Se tocchi il posto sbagliato conta come errore. Se sei svelto fai le serie, e se ti perdi Bergo può mostrarti il posto giusto, ma solo tre volte.", {"b": "Posso fare io il quinto Re?"}, {"n": "Bergo, tu non sei neanche una carta! Lascia giocare in pace.", "mad": true}, "Se esce un Re non ha posto: va da parte e prendi la carta successiva del mazzetto. Quando escono tutti e quattro i Re, il gioco finisce.", "Vinci se tutte le 36 carte sono al loro posto, e quello è fortuna. Le stelle invece te le guadagni tu: senza errori e senza aiuti ne prendi tre!"];
RULES.bauli = ["I bauli! Dopo ogni vittoria può capitarti un baule, a volte anche quando perdi. Più vinci, più sono preziosi.", "Ce ne sono quattro: di legno, di rame, d’argento e d’oro. Per aprirli bisogna aspettare: quello di legno un quarto d’ora, quello d’oro otto ore.", {"b": "E dentro ci sono io?"}, {"n": "No Bergo, dentro ci sono punti esperienza, carlini, acqua e concime per il tuo albero. E nei bauli d’argento e d’oro le tessere per assumere gli aiutanti.", "mad": true}, "Puoi tenere al massimo quattro bauli: aprili spesso, sennò quelli nuovi non entrano. Se hai fretta, un video ti fa aprire subito il baule.", "Se un baule si sta già aprendo, mettine un altro in coda: parte da solo appena finisce il primo, anche a gioco chiuso.", "E ogni giorno c’è u scrignu mio: guarda tre video e ti regalo mille carlini!"];
RULES.albero = ["Questo è l’albero di Bergo: parte da un semino e diventa un bergamotto carico di frutti.", "Annaffialo con l’acqua e dagli il concime: li trovi nei bauli. L’acqua lo fa crescere un po’, il concime molto di più.", {"b": "Ehi, quello sono io da piccolo!"}, {"n": "Sì Bergo, e guarda come sei venuto bene. Ora lascia parlare me.", "mad": true}, "Passa dal seme al germoglio, poi alberello, albero, albero in fiore con la zagara bianca, e alla fine si carica di bergamotti.", "Quando è pieno raccogli i bergamotti: guadagni carlini e punti esperienza, e l’albero ricomincia a fruttare. Il contadino fa valere di più ogni annaffiata, la raccoglitrice raddoppia il raccolto."];
RULES.salumificio = ["Il mio salumificio! Qui si lavora il maiale come si faceva una volta.", "Dal banco del macellaio escono le cosce. Trascina una coscia sopra un’altra uguale e diventano carne macinata. Due macinate fanno una salsiccia cruda, due salsicce crude una stagionata, e così via fino al tagliere calabrese.", {"b": "E la ’nduja? Quando arriva la ’nduja?"}, {"n": "Bergo! Non si parla di ’nduja davanti a me, sono timido.", "mad": true}, "In alto arrivano i clienti del paese con le loro ordinazioni. Quando hai quello che chiedono, tocca il cliente e vendi: guadagni carlini.", "Tieni la griglia in ordine: se si riempie non escono più cosce. La pastaia, se la assumi, ogni tanto ti prepara una coscia in più."];
RULES.botteghe = ["Gli aiutanti e le botteghe: i personaggi del mazzo vengono a darti una mano.", "Li assumi con i carlini oppure con le tessere che trovi nei bauli d’argento e d’oro. Ognuno ha il suo mestiere: il contadino zappa, il pastore porta il concime e fa la guardia alle pecore, la raccoglitrice raccoglie i bergamotti.", {"b": "Io lavoro gratis, assumete me!"}, {"n": "Tu non lavori, Bergo, tu mangi la merenda degli altri.", "mad": true}, "L’impagliatore e la tessitrice aprono le botteghe delle sedie e dei tappeti: guadagnano carlini anche quando non giochi. Torna ogni tanto a ritirarli."];
RULES.pecore = ["Le pecore del pastore! Ti affido Bianchina e Ciccio: falle crescere e diventa il pastore più ricco della Sila.", "Pianta il fieno nel campo: dopo sei ore raccogli otto balle, e se ti manca lo trovi anche al mercato. Dai il fieno alle pecore: ognuna resta sazia per tre ore, e solo se è sazia le cresce la lana.", "Quando la lana è piena, tosala e vendi le matasse al mercato. La lana bianca vale poco, la grigia di più, la nera è la più preziosa.", {"b": "Una pecora nera? Allora io sono un bergamotto nero!"}, {"n": "Tu sei solo un bergamotto giallo e chiacchierone. Ascolta, che è importante.", "mad": true}, "Per avere agnelli fai accoppiare una pecora e un montone adulti e sazi. Dai colori dei genitori nasce un agnellino bianco, grigio o nero: mescola i colori per trovare quelli rari. E ricordati: c’è sempri na pecora nira!", "Attenzione ai lupi! Di notte o mentre giochi possono portarti via una pecora. Costruisci il recinto: prima la staccionata, poi il muretto a secco, poi il cane pastore. Più è forte, più pecore ci stanno.", "Se mentre guardi vedi arrivare un lupo, toccalo subito per scacciarlo: il paese ti ringrazia con qualche carlino.", "E non lasciarle troppo a digiuno: dopo otto ore di fame una pecora si ammala. Le serve la medicina, e se passa il veterinario per un controllo e la trova malata… ti fa la multa!"];
RULES.conquista = ["Conquista la Calabria! Parti da Tropea e arriva fino a Cosenza, paese dopo paese, passando per l’Aspromonte.", "Ogni paese è difeso da un personaggio del mazzo con la sua squadra. Prima si combatte: tocca un tuo personaggio e poi il nemico da colpire. Ogni seme ha il suo potere: il Mare colpisce due volte, la Montagna resiste, la Campagna cura, la Bottega fa i colpi critici.", "Ogni personaggio ha la sua mossa speciale: la raccoglitrice fa la cascata di olive, il pastore manda il gregge in carica, il lanzaturi tira la fiocina, la pastaia fa piovere i fileja. Quando la barra è carica, usala!", {"b": "E io? Io che mossa speciale ho?"}, {"n": "Tu rotoli, Bergo. Non è una mossa speciale.", "mad": true}, "Vinta la battaglia, il difensore ti sfida a carte: scopa, briscola o tressette. Vinci e il paese è tuo, e il difensore entra nella tua squadra.", "Nei paesi conquistati costruisci la bottega, che ti dà carlini ogni ora, e le difese: i briganti provano sempre a riprenderseli!", "I nemici diventano sempre più forti: allena la squadra con i carlini ed esplora l’Aspromonte. Ogni animale che scopri rende i tuoi personaggi più forti."];
RULES.avventure = ["Benvenuto nelle avventure! Qui, oltre a giocare a carte, ti costruisci il tuo pezzo di Calabria.", "Conquista la Calabria: vai di paese in paese, da Tropea a Cosenza. Prima combatti con la tua squadra di personaggi del mazzo, poi sfidi il difensore a carte. Ogni paese conquistato ti dà una bottega che guadagna carlini.", "Il Paese: fai crescere l’albero di Bergo, lavora la carne al salumificio, alleva le pecore e assumi gli aiutanti.", {"b": "L’albero di Bergo è la parte più importante, ovviamente!"}, {"n": "Sì Bergo, l’albero è bello. Ma lasciami finire.", "mad": true}, "I Bauli: li trovi vincendo le partite. Dentro ci sono carlini, acqua, concime e punti esperienza. Più aspetti, più sono ricchi.", "Il Clan: entri in una squadra con altri giocatori, chiacchierate, vi sfidate e raggiungete gli obiettivi della settimana insieme.", "Il mazzo vero: qui trovi le carte stampate, da tenere in mano al bar con gli amici. Tutto quello che guadagni nelle avventure ti aiuta anche nelle altre: i carlini servono dappertutto!"];
RULES.morra = ["La morra! Il gioco più rumoroso della Calabria: nelle cantine si sentiva da un capo all’altro del paese.", "Tu e l’avversario buttate la mano nello stesso momento, con un numero di dita da 1 a 5, e gridate un numero da 2 a 10.", "Chi indovina la somma delle dita di tutti e due fa il punto. Se indovinate tutti e due, o nessuno, si ributta. Si vince a 5.", {"b": "E se butto tutte e due le mani?"}, {"n": "Bergo, tu non hai neanche le mani! Hai solo le foglie.", "mad": true}, "Hai pochi secondi: scegli quante dita buttare e cosa gridare. Se non scegli in tempo, la mano parte da sola!", "Il trucco: l’avversario studia le tue abitudini. Il Massaro è il più furbo di tutti, quindi cambia spesso numero e confondilo!"];
RULES.pesca = ["La pesca! Il mare calabrese è pieno di pesci: dalle alici di Tropea al pesce spada dello Stretto.", "Prima il lancio: tieni premuto e guarda la lancetta che va avanti e indietro. Lascia quando è nel verde! Nella striscia d’oro è un lancio perfetto. Nel rosso ti fai la parrucca: il filo si aggroviglia.", "Più lanci lontano, più trovi pesci grossi e rari. Un lancio perfetto vale doppio!", {"b": "E se lancio un bergamotto arriva fino in Sicilia?"}, {"n": "Bergo, tu lanci solo chiacchiere! Lasciami spiegare.", "mad": true}, "Poi aspetta il galleggiante. Se fa solo tic tic è un assaggio: non toccare! Quando va giù e compare il punto esclamativo, ferra quando il cerchio bianco tocca quello d’oro.", "Infine tieni premuto per recuperare: la tensione deve stare nel verde. Quando il pesce scappa e vedi i due punti esclamativi, molla subito, sennò il filo si spezza!", "In bottega trovi canne migliori e esche speciali: col gamberetto vengono orate e spigole, col calamaretto i giganti. Ogni posto ha i suoi pesci: quando li peschi tutti si apre il posto dopo, da Tropea a Scilla, poi lo Stretto e Capo Vaticano. I pesci leggendari non servono per andare avanti, ma l’album completo è un’altra storia!"];
const ND = { open: false, steps: [], i: 0, done: null };
function ndSeen(k) { try { return localStorage.getItem('nduja-' + k) === 'si'; } catch (e) { return false; } }
function ndMark(k) { try { localStorage.setItem('nduja-' + k, 'si'); } catch (e) { /* ignore */ } }
function ndSpeak(text) {
  if (!AUDIO.on) return;
  try {
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/’/g, "'"));
    u.lang = 'it-IT'; if (itVoice) u.voice = itVoice;
    u.rate = 1.05; u.pitch = 1.25;
    const host = document.querySelector('.nd');
    u.onstart = () => host && host.classList.add('talking');
    u.onend = () => host && host.classList.remove('talking');
    speechSynthesis.speak(u);
  } catch (e) { /* speech not available */ }
}
function showNduja(key, done) {
  ND.open = true; ND.steps = RULES[key]; ND.i = 0; ND.done = done || null; ND.key = key;
  PAUSE.on = true;
  idleReset();
  const el = document.createElement('div');
  el.className = 'ndlayer';
  el.id = 'ndLayer';
  el.innerHTML = '<div class="nd" role="dialog" aria-modal="true" aria-labelledby="ndText">' +
    '<div class="ndbubble"><div class="ndname">Il Signor ’Nduja</div><p id="ndText"></p><div class="nddots" id="ndDots"></div>' +
    '<div class="ndbtns"><button class="btn ghost small" id="ndSkip">Salta</button><span></span><button class="btn ghost small" id="ndPrev">Indietro</button><button class="btn take small" id="ndNext">Avanti</button></div></div>' +
    '<div class="ndguy">' + NDUJA_SVG + '</div><div class="ndbergo">' + BERGO_SVG + '</div></div>';
  document.body.appendChild(el);
  $('ndSkip').onclick = closeNduja;
  $('ndPrev').onclick = () => { if (ND.i > 0) { ND.i--; ndStep(); } };
  $('ndNext').onclick = () => { if (ND.i < ND.steps.length - 1) { ND.i++; ndStep(); } else closeNduja(); };
  ndStep();
  setTimeout(() => $('ndNext') && $('ndNext').focus(), 60);
}
const stText = (s) => tr(typeof s === 'string' ? s : s.b || s.n);
function ndStep() {
  const host = document.querySelector('.nd');
  const st = ND.steps[ND.i];
  const isB = typeof st === 'object' && !!st.b;
  $('ndText').textContent = stText(st);
  const bub = document.querySelector('.nd .ndbubble');
  bub.classList.toggle('bergo', isB);
  bub.querySelector('.ndname').textContent = isB ? 'Bergo il bergamotto' : 'Il Signor ’Nduja';
  if (host) {
    host.classList.toggle('bergo-on', ND.steps.slice(0, ND.i + 1).some((s) => typeof s === 'object' && s.b));
    host.classList.toggle('btalk', isB);
    host.classList.remove('mad'); void host.offsetWidth;
    if (st.mad) host.classList.add('mad');
  }
  $('ndDots').innerHTML = ND.steps.map((_, k) => '<i class="' + (k === ND.i ? 'on' : '') + '"></i>').join('');
  $('ndPrev').disabled = ND.i === 0;
  $('ndNext').textContent = ND.i === ND.steps.length - 1 ? 'Ho capito!' : 'Avanti';
  $('ndSkip').hidden = ND.i === ND.steps.length - 1;
  if (host && !isB) { host.classList.remove('hop'); void host.offsetWidth; host.classList.add('hop'); host.classList.add('talking'); }
  if (host && isB) host.classList.remove('talking');
  clearTimeout(ND.tt);
  ND.tt = setTimeout(() => { const h = document.querySelector('.nd'); if (h && !(window.speechSynthesis && speechSynthesis.speaking)) { h.classList.remove('talking'); h.classList.remove('btalk'); } }, Math.min(5000, 1200 + stText(st).length * 25));
  if (isB) bergoSpeak(stText(st)); else ndSpeak(stText(st));
}
function closeNduja() {
  try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) { /* ignore */ }
  ndMark(ND.key);
  const el = $('ndLayer');
  if (el) { el.classList.add('bye'); setTimeout(() => el.remove(), 350); }
  ND.open = false;
  const done = ND.done; ND.done = null;
  PAUSE.on = false;
  if (done) done();
  else if (PAUSE.pending) { const fn = PAUSE.pending; PAUSE.pending = null; setTimeout(fn, 400); }
  if (G && G.render) G.render();
}
RULES.telaio = ["Il telaio della tessitrice di Longobucco! Ora la lana delle tue pecore vale molto di più.", "Primo: il filatoio. Ogni matassa diventa tre gomitoli. Se giri tu la ruota tenendo la lancetta nel verde, ne escono quattro.", "Secondo: la tintoria. Con la ginestra viene il giallo, con la robbia il rosso, con il guado il blu. Ogni tinta colora tre gomitoli bianchi.", {"b": "E col bergamotto viene il verde bergamotto!"}, {"n": "Bergo, col bergamotto ci viene solo il profumo. E pure troppo!", "mad": true}, "Terzo: il telaio. Scegli un ordine della gente del paese, poi tessi riga per riga, dal basso verso l’alto, copiando il disegno. Scegli il filo, tocca le caselle e batti il pettine.", "Meno sbagli, più stelle prendi e più carlini ti danno. Dopo qualche lavoro la tessitrice ti insegna il vancale di Tiriolo, il tappeto di San Giovanni in Fiore e il copriletto di Longobucco."];

RULES.paesani = ["I Paesani! Qui c’è la mappa di tutta la Calabria, paese per paese, e ci sono pure le frazioni che sono più grandi del loro comune.", "Allarga la mappa con due dita: più ti avvicini, più nomi di paesi vedi. Tocca un paese per sapere quanti giocatori ha e quante partite online ha vinto.", "Ogni volta che vinci una partita online contro una persona vera, il tuo paese prende una vittoria.", {"b": "Allora io gioco per Reggio, che c’è il bergamotto!"}, {"n": "Bergo, tu giochi per chi ti dà più zucchero.", "mad": true}, "Nelle classifiche vedi i paesi con più giocatori, con più vittorie e, per essere giusti coi paesini, quelli con più giocatori ogni mille abitanti.", "Non usiamo la posizione del telefono: il paese lo scegli tu, e sul server si contano solo i numeri. Puoi cambiarlo dal Profilo."];

RULES.bergodrink = ["La fabbrica di BergoDrink! Con i bergamotti del tuo albero si fanno le bibite più profumate della Calabria.", "Le bottiglie corrono sul nastro e passano sotto le macchine: acqua, spremitrice, gas e tappatrice. Tocca il pulsante di una macchina proprio quando la bottiglia le passa sotto.", "Guarda il biglietto sopra ogni bottiglia: la spremuta liscia non vuole il gas, l’extra frizzante lo vuole due volte. Se salti una macchina o metti il gas dove non va, la bibita si guasta. Un tocco in più su una macchina già usata invece non fa danni.", {"b": "E io? Io vado dentro la bottiglia!"}, {"n": "Bergo, tu sei la mascotte, non l’ingrediente!", "mad": true}, "Se tocchi proprio al centro fai un colpo perfetto, e il cliente lascia una mancia più grande. Ma se una bibita è guasta, vuole il rimborso!", "Ogni tanto una macchina si inceppa: toccala tre volte per ripararla, prima che passino le bottiglie. Ogni bottiglia usa 2 bergamotti e un fulmine di energia."];

RULES.salumificio.splice(RULES.salumificio.length - 1, 0, "Quando fai il primo tagliere calabrese arriva il casaro con il suo paiolo: dal paiolo esce il latte, e unendo i pezzi fai giuncata, ricotta, provola, butirro, pecorino e caciocavallo. Ogni tanto arriva anche l’ordine della festa, che paga una volta e mezza!");
RULES.salumificio.splice(RULES.salumificio.length - 1, 0, "Quando fai la ricotta affumicata arriva la nonna con il suo forno a legna: dal forno esce la spiga di grano, e unendo i pezzi fai farina, impasto, pane di casa, pitta, zeppole, pitta ’mpigliata e il cesto della festa.");
RULES.tornei = ["I Tornei! Otto giocatori, tre partite: i quarti di finale, la semifinale e la finale. Chi perde torna a casa.", "Paghi l’iscrizione in carlini e affronti i personaggi del mazzo: Turi u Pescaturi, Comare Rosina, Zu Peppe e tutti gli altri.", "Il Torneo del Paese si gioca a scopa, quello della Provincia a briscola. La Coppa Calabria è la più dura: scopa, briscola e la finale a tressette.", {"b": "E se vinco io la Coppa?"}, {"n": "Allora ti porti a casa un baule d’oro, tanti carlini e il titolo di Campione di Calabria. Ma prima devi battere a me… no, a me no, io faccio solo l’arbitro."}, "Le partite del torneo non consumano energia. Attento però: se esci a metà partita sei eliminato!", "Con “Tra amici” invece giocate online tra di voi: uno crea il torneo, manda il codice su WhatsApp e quando siete 4 oppure 8 si parte. Il primo di ogni coppia apre il tavolo e l’altro ci entra."];
RULES.pass = ["Il Pass della stagione! Ogni mese inizia una stagione nuova, con trenta livelli da salire.", "Sali giocando: ogni partita a carte ti dà punti, e ancora di più se vinci online. Anche la pesca, il salumificio, BergoDrink e il telaio ti danno qualcosa.", "Ogni giorno ci sono tre sfide nuove: completale e ritira sessanta punti per ognuna.", "A ogni livello c’è un premio gratis: carlini o un baule. Con il Pass d’oro, che si compra con i carlini, a ogni livello prendi anche un secondo premio, e al trenta diventi Campione della stagione!", {"b": "E se non arrivo al trenta?"}, {"n": "Allora a fine mese ricominci da capo con una stagione nuova. Ma i premi che hai ritirato restano tuoi."}];

/* dorso delle carte: rosso a rombi con il Signor 'Nduja nel medaglione */
const CARD_BACK_SVG = (() => {
  const inner = NDUJA_SVG.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/ class="[^"]*"/g, '');
  let lat = '';
  for (let i = -100; i <= 160; i += 9) lat += '<path d="M' + i + ' 0 L' + (i + 100) + ' 100M' + (i + 100) + ' 0 L' + i + ' 100"/>';
  const dots = [[9, 9], [51, 9], [9, 91], [51, 91]].map(([x, y]) => '<circle cx="' + x + '" cy="' + y + '" r="2.2"/>').join('');
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 100" preserveAspectRatio="none">'
    + '<defs><clipPath id="cbIn"><rect x="4" y="4" width="52" height="92" rx="3"/></clipPath></defs>'
    + '<rect width="60" height="100" fill="#F4EBD8"/>'
    + '<rect x="4" y="4" width="52" height="92" rx="3" fill="#B0222A"/>'
    + '<g clip-path="url(#cbIn)" stroke="#F4EBD8" stroke-opacity="0.22" stroke-width="0.8">' + lat + '</g>'
    + '<rect x="6.5" y="6.5" width="47" height="87" rx="2" fill="none" stroke="#E5B83F" stroke-width="0.9"/>'
    + '<g fill="#E5B83F">' + dots + '</g>'
    + '<ellipse cx="30" cy="50" rx="20" ry="27" fill="#F4EBD8" stroke="#E5B83F" stroke-width="2"/>'
    + '<ellipse cx="30" cy="50" rx="17" ry="24" fill="none" stroke="#B0222A" stroke-width="0.6"/>'
    + '<g transform="translate(13.4 27.5) scale(0.255)">' + inner + '</g>'
    + '</svg>';
})();
try { document.documentElement.style.setProperty('--cardback', 'url("data:image/svg+xml;charset=utf-8,' + encodeURIComponent(CARD_BACK_SVG) + '")'); } catch (e) { /* ignore */ }
