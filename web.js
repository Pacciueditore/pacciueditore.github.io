/* Versione web (iPhone): niente pubblicità, funziona anche offline. */
(function () {
  window.WEB_APP = true;
  // nessun video: i premi diventano il regalo di Bergo (max 3 al giorno)
  window.REWARDED_AD_PROVIDER = function () { return 'noad'; };
  if ('serviceWorker' in navigator) window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var standalone = window.navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
  function hint() {
    if (!ios || standalone) return;
    try { var t = +localStorage.getItem('web-home-hint') || 0; if (Date.now() - t < 3 * 864e5) return; } catch (e) { /* niente */ }
    var el = document.createElement('div');
    el.className = 'homehint'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Aggiungi alla schermata Home');
    el.innerHTML = '<div class="hhbox"><img src="img/icone/icona-180.png" alt=""><div><b>Mettila sulla schermata Home</b>' +
      '<span>In Safari tocca Condividi <i class="hhshare" aria-hidden="true"></i> (o prima ⋯), poi <b>Aggiungi alla schermata Home</b>. Si apre a schermo intero, come un’app.</span></div>' +
      '<button aria-label="Chiudi">✕</button></div>';
    document.body.appendChild(el);
    el.querySelector('button').onclick = function () { el.remove(); try { localStorage.setItem('web-home-hint', String(Date.now())); } catch (e) { /* niente */ } };
  }
  window.addEventListener('load', function () { setTimeout(hint, 6000); });
})();
