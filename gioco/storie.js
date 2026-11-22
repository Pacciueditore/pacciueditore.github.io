const STORIES = {
  mare: {
    t: 'Il pesce spada dello Stretto',
    p: [
      "Ogni primavera, tra maggio e luglio, il pesce spada attraversa lo Stretto di Messina. A Scilla e a Bagnara lo aspettano da secoli con la feluca, una barca strana e bellissima: ha un albero altissimo per avvistare il pesce e una passerella lunga quanto la barca stessa, da cui si lancia la fiocina.",
      "Per i paesi della Costa Viola il pesce spada non era solo cibo: era la stagione, la festa, il lavoro di tutta la famiglia. Per questo è diventato il simbolo del seme Mare.",
    ],
  },
  montagna: {
    t: 'Il pino laricio della Sila',
    p: [
      "Sull'altopiano della Sila crescono i pini larici, alberi dritti come colonne che possono superare i quaranta metri. Alcuni hanno più di trecento anni.",
      "Già i Romani salivano fin qui per il legname e per la pece ricavata dalla resina, con cui si rendevano impermeabili le navi. Per chi viveva in montagna il bosco dava tutto: legna per l'inverno, travi per le case, ombra per le greggi d'estate.",
    ],
  },
  campagna: {
    t: "Il ramo d'ulivo",
    p: [
      "La Calabria è una delle terre d'Italia con più ulivi. Nella Piana di Gioia Tauro ci sono alberi secolari alti come case, con tronchi contorti che sembrano scolpiti.",
      "L'olio era ricchezza, medicina e luce per le lampade. Quando una famiglia aveva olio a sufficienza per tutto l'anno, si diceva che la casa era a posto. Nel nostro mazzo l'ulivo fa da seme dei denari: chi ne prende di più guadagna un punto.",
    ],
  },
  bottega: {
    t: 'La zampogna',
    p: [
      "La zampogna è lo strumento dei pastori: un otre di pelle di capra che fa da polmone e canne di legno tornite a mano. Il suonatore soffia nell'otre e le canne suonano insieme, una per la melodia e le altre per l'accompagnamento.",
      "In Calabria il suo suono è legato al Natale, quando i suonatori scendevano dai paesi di montagna per la novena. Costruirne una richiedeva mesi di lavoro: per questo è il simbolo della Bottega.",
    ],
  },
  pastaia: {
    t: 'La pastaia',
    p: [
      "Prima della pasta comprata in negozio, la pasta si faceva in casa: farina di grano duro, acqua e mani esperte. Nel Vibonese la pastaia arrotolava piccoli pezzi d'impasto attorno a un ferretto sottile e li sfilava con un colpo secco: nascevano i fileja.",
      "Il ferretto, nelle case più povere, era lo stelo secco di una pianta. La domenica la pastaia preparava la pasta per tutta la settimana, e le figlie imparavano guardandola.",
    ],
  },
  rammendatrice: {
    t: 'La rammendatrice di reti',
    p: [
      "Quando le barche rientravano, le reti erano spesso strappate dalle rocce o dai pesci grossi. Toccava alle donne dei paesi di mare ripararle, sedute sulla spiaggia o davanti alla porta di casa.",
      "Lavoravano con un ago di legno piatto, ripassando maglia per maglia, e intanto parlavano, cantavano e sorvegliavano i bambini. Una rete ben rammendata poteva durare anni: senza di loro, il giorno dopo nessuno sarebbe uscito a pescare.",
    ],
  },
  pescatore: {
    t: 'Il pescatore di neonata',
    p: [
      "In inverno, lungo le coste calabresi, si pescava la neonata: i pesci appena nati di sarde e alici, così piccoli e trasparenti da sembrare una pasta. Si prendevano vicino alla riva con reti a maglia finissima.",
      "Con la neonata, sale e tanto peperoncino si preparava la rosamarina, chiamata anche il caviale dei poveri. Oggi questa pesca è vietata dalle norme europee per proteggere i pesci giovani: il pescatore della carta racconta un mestiere che non c'è più.",
      "Nella carta torna dalla spiaggia in groppa al suo asino: dal fianco pende il sacco di rete ancora gocciolante e nella cesta luccica la neonata appena pescata, pronta per essere salata e condita col peperoncino.",
    ],
  },
  tessitrice: {
    t: 'La tessitrice di Longobucco',
    p: [
      "A Longobucco, nel cuore della Sila, si tesse a mano da secoli. Sui telai di legno le donne creavano coperte e tappeti con disegni geometrici dai colori forti, tramandati di madre in figlia.",
      "Ogni ragazza preparava così il proprio corredo, e una coperta ben fatta poteva accompagnare una famiglia per generazioni. Ancora oggi alcune botteghe del paese tengono vivi quei telai e quei disegni.",
    ],
  },
  contadino: {
    t: 'Il contadino',
    p: [
      "Prima dei trattori, la terra si apriva con l'aratro di legno tirato dai buoi. Il contadino camminava dietro, una mano sul manico e l'altra sul pungolo, seguendo il solco dall'alba al tramonto.",
      "In autunno si arava e si seminava il grano, d'estate si mieteva a mano. Il bue era il bene più prezioso della casa: si curava come un membro della famiglia, perché senza di lui non c'era raccolto.",
    ],
  },
  raccoglitrice: {
    t: 'La raccoglitrice di olive',
    p: [
      "Da novembre a febbraio, nei grandi uliveti, lavoravano le raccoglitrici. Spesso erano donne giovani che partivano all'alba dai paesi e raccoglievano le olive cadute a terra, una per una, chine per ore.",
      "Portavano le ceste in equilibrio sulla testa e riempivano il grembiule. Era un lavoro duro e pagato poco, ma anche un momento di compagnia: tra i filari nascevano canti, amicizie e, a volte, matrimoni.",
    ],
  },
  pastore: {
    t: 'Il pastore della Sila',
    p: [
      "Per secoli i pastori calabresi hanno seguito le stagioni: d'estate salivano con le greggi sui pascoli freschi della Sila, d'inverno scendevano verso le pianure vicino al mare. Questo viaggio si chiama transumanza.",
      "Il pastore passava mesi lontano da casa, con il bastone, il gilet di pelle di pecora e il mulo carico. Dal latte delle sue pecore e capre nascevano ricotta, pecorino e caciocavallo.",
    ],
  },
  impagliatore: {
    t: "L'impagliatore di sedie",
    p: [
      "L'impagliatore girava di paese in paese con l'asino carico di paglia e di sedie da riparare. Arrivato in piazza, gridava il suo mestiere e le donne gli portavano le sedie con la seduta sfondata.",
      "Intrecciava paglia ritorta e giunchi a mano, con gesti veloci e precisi, e in poche ore la sedia tornava come nuova. Nelle case di una volta niente si buttava: si aggiustava, e c'era sempre qualcuno capace di farlo.",
    ],
  },
  lanzaturi: {
    t: 'Il lanzaturi',
    p: [
      "Sulla feluca, il lanzaturi era l'uomo più importante dopo la vedetta. Stava in piedi in fondo alla lunga passerella, sospeso sull'acqua, con la fiocina pronta in mano.",
      "Quando la vedetta gridava l'avvistamento, aveva un solo colpo a disposizione: servivano occhio, forza e sangue freddo. I pescatori dello Stretto raccontano che il pesce spada viaggia in coppia, e che il compagno resta vicino a quello catturato. È per questo che il lanzaturi è il re del Mare.",
    ],
  },
  casaro: {
    t: 'Il casaro',
    p: [
      "Nelle malghe della Sila, il casaro scaldava il latte nella caldaia di rame sul fuoco di legna e rompeva la cagliata con un lungo bastone. Poi la pasta veniva filata a mano nell'acqua calda e modellata a forma di pera.",
      "Le forme si legavano a due a due con una corda e si appendevano a cavallo di una trave per stagionare: da qui il nome caciocavallo. Con il siero avanzato faceva la ricotta, ancora calda, per tutta la famiglia.",
    ],
  },
  massaro: {
    t: 'Il massaro',
    p: [
      "Il massaro era il capo della masseria, la grande casa di campagna con le stalle, i magazzini e spesso il frantoio. Conosceva ogni campo, decideva quando seminare e quando raccogliere, e dava lavoro a braccianti e raccoglitrici.",
      "Alla cintura portava le chiavi dei magazzini e nel gilet l'orologio con la catena: segni di rispetto. Quando parlava, tutta la masseria ascoltava. Per questo è il re della Campagna.",
    ],
  },
  zampognaro: {
    t: 'Il mastro zampognaro',
    p: [
      "Costruire una zampogna è un'arte che pochi conoscono. Il mastro sceglieva il legno giusto, lo lasciava stagionare per anni, poi lo tornava e lo forava a mano fino a trovare il suono perfetto. Ogni canna doveva accordarsi con le altre.",
      "I suoi strumenti accompagnavano le feste, le processioni e soprattutto il Natale. Si dice che un buon zampognaro riconoscesse dal suono la mano del mastro che aveva fatto la zampogna. È il re della Bottega e l'ultima icona da sbloccare.",
    ],
  },
};
