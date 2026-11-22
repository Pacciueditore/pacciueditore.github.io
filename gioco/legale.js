/* ================= NOTE LEGALI ================= */
const LEGAL = {
  owner: 'Pacciu Editore', year: 2026, version: '1.3.13',
  email: 'pacciueditore@gmail.com',
  privacyUrl: 'https://pacciueditore.github.io/scopa-calabrese/',
  app: 'Scopa Calabrese',
};
function renderLegal() {
  const L = LEGAL, mail = L.email ? '<a href="mailto:' + L.email + '">' + L.email + '</a>' : '<i>(email di contatto in arrivo)</i>';
  $('legalBox').innerHTML =
    '<h3>Diritto d’autore</h3><p>© ' + L.year + ' ' + L.owner + '. Tutti i diritti riservati.</p>' +
    '<p>' + L.app + ', con il suo codice, il mazzo dei mestieri calabresi, le illustrazioni, i personaggi (tra cui il Signor ’Nduja e Bergo), le storie, i testi, i dialoghi in dialetto, la musica e la grafica, è un’opera protetta dalla legge sul diritto d’autore (L. 22 aprile 1941, n. 633) e dalle norme internazionali.</p>' +
    '<p>È vietato copiare, modificare, decompilare, ridistribuire, vendere o pubblicare, in tutto o in parte, l’app o i suoi contenuti senza il permesso scritto di ' + L.owner + '. Le regole dei giochi tradizionali (scopa, briscola, tressette, sette e mezzo) sono di tutti; il modo in cui sono realizzate in quest’app no.</p>' +
    '<p>I nomi “' + L.app + '” e “' + L.owner + '” e i relativi loghi identificano i prodotti di ' + L.owner + ' e non possono essere usati per altri prodotti.</p>' +
    '<h3>Termini d’uso</h3><ul>' +
    '<li>L’app è gratuita e serve solo per divertimento. Non si gioca con soldi veri e non ci sono vincite in denaro: carlini, bauli e premi esistono solo dentro il gioco e non hanno valore reale.</li>' +
    '<li>Puoi usare l’app sui tuoi dispositivi per uso personale. Non puoi usarla per scopi commerciali o pubblicarne copie.</li>' +
    '<li>Nei clan e nelle funzioni online comportati con rispetto: niente insulti, spam o contenuti offensivi. ' + L.owner + ' può rimuovere messaggi e bloccare chi non rispetta queste regole.</li>' +
    '<li>L’app viene fornita “così com’è”: facciamo del nostro meglio, ma non possiamo garantire che sia sempre priva di errori o disponibile.</li>' +
    '<li>Questi termini possono essere aggiornati con le nuove versioni dell’app.</li></ul>' +
    '<h3>Privacy</h3><ul>' +
    '<li><b>Progressi:</b> livello, carte sbloccate, Paese e conquiste sono salvati sul tuo telefono. Il soprannome che scegli può comparire nelle classifiche.</li>' +
    '<li><b>Pubblicità:</b> l’app mostra video pubblicitari facoltativi tramite Google AdMob. Google può usare identificativi del dispositivo e dati tecnici per mostrare e misurare gli annunci, secondo la propria informativa (policies.google.com/privacy). Puoi limitare gli annunci personalizzati dalle impostazioni del telefono.</li>' +
    '<li><b>Funzioni online:</b> per le partite online e la classifica usiamo Google Firebase, con un identificativo anonimo, il soprannome, l’icona, il livello e i risultati online.</li>' +
    '<li><b>I Paesani:</b> se scegli il tuo paese (è facoltativo), sul server aumentiamo di uno il contatore dei giocatori di quel paese e, quando vinci online, quello delle sue vittorie. Il server conserva solo questi totali per paese, senza collegarli a te. Non usiamo la posizione del telefono.</li>' +
    '<li><b>Clan (facoltativo):</b> se fondi un clan o ci entri, sul server salviamo il nome, il motto e lo stemma del clan, e per ogni membro il soprannome, l’icona, il livello e i punti portati, visibili a tutti. La chat del clan usa solo frasi già pronte: non si può scrivere testo libero. Puoi uscire dal clan quando vuoi; l’ultimo che esce lo chiude.</li>' +
    '<li><b>Torneo tra amici (facoltativo):</b> per i tornei online tra amici salviamo sul server il codice del torneo, il gioco scelto, i soprannomi e le icone dei partecipanti e chi ha vinto ogni partita.</li>' +
    '<li><b>Amici (facoltativo):</b> se mandi o accetti una richiesta di amicizia, sul server salviamo la coppia di amici con i soprannomi e le icone. I tuoi amici vedono il tuo soprannome, il livello, il paese e quando sei stato online l’ultima volta. Le sfide tra amici restano sul server solo finché non vengono accettate o rifiutate.</li>' +
    '<li><b>Inviti e notifiche:</b> se usi il codice invito di un amico, salviamo sul server il suo nome insieme al tuo identificativo anonimo, per dare il premio a entrambi. Le notifiche (fieno pronto, regalo del giorno…) sono preparate dal telefono stesso e non passano da nessun server.</li>' +
    '<li><b>Account Google (facoltativo):</b> se accedi con Google, salviamo nel cloud i tuoi progressi di gioco collegati al tuo account; di Google riceviamo solo nome e indirizzo email, mai la password. Puoi uscire dall’account in qualsiasi momento.</li>' +
    '<li><b>Statistiche:</b> l’app usa Google Analytics per Firebase per sapere in forma aggregata quali giochi e sezioni vengono usati e migliorare il gioco (per esempio: partite iniziate, livelli raggiunti). Non contiene il tuo nome.</li>' +
    '<li>Non vendiamo i tuoi dati e non chiediamo nome, indirizzo o numero di telefono.</li>' +
    '<li>Se hai fatto l’accesso con Google puoi eliminare l’account e tutti i dati nel cloud da <b>Profilo → Account Google → Elimina account e dati dal cloud</b>. I dati sul telefono si cancellano disinstallando l’app o svuotando i suoi dati dalle impostazioni.</li><li>Informativa completa: ' + (L.privacyUrl ? '<a href="' + L.privacyUrl + '" target="_blank" rel="noopener">' + L.privacyUrl + '</a>' : '<i>(link in arrivo)</i>') + '. Per qualsiasi richiesta scrivi a: ' + mail + '.</li></ul>' +
    '<h3>Contatti</h3><p>' + L.owner + ' · Editoria indipendente<br>' + mail + '</p>' +
    '<p class="copy">' + L.app + ' versione ' + L.version + ' · © ' + L.year + ' ' + L.owner + '</p>';
}
