const CACHE = 'scopa-9649c84f20';
const FILES = ["css/style.css", "fonts/alegreya-400-italic.woff2", "fonts/alegreya-400.woff2", "fonts/alegreya-500.woff2", "fonts/alegreya-700.woff2", "fonts/alegreya-sc-700.woff2", "fonts/alegreya-sc-800.woff2", "img/apertura.webp", "img/icone/icona-180.png", "img/icone/icona-192.png", "img/icone/icona-512.png", "index.html", "js/aiuti.js", "js/amici.js", "js/anim.js", "js/app-01.js", "js/app-02.js", "js/app-03.js", "js/bergo.js", "js/borgo.js", "js/calcio.js", "js/carriera.js", "js/casa.js", "js/cloud.js", "js/conquista.js", "js/data-apertura.js", "js/data-carte.js", "js/data-copertina.js", "js/data-icone.js", "js/data-personaggi.js", "js/drink.js", "js/energia.js", "js/firebase.js", "js/gatta.js", "js/ingrandisci.js", "js/legale.js", "js/lingua.js", "js/mazzo.js", "js/morra.js", "js/musica.js", "js/nickname.js", "js/notifiche.js", "js/online.js", "js/paesani.js", "js/paese.js", "js/paesi-data.js", "js/pass.js", "js/pecore.js", "js/pesca.js", "js/pixi.min.js", "js/sfida.js", "js/signor-nduja.js", "js/social.js", "js/solitario.js", "js/storie.js", "js/telaio.js", "js/tornei.js", "js/tressette.js", "js/web.js", "manifest.json"];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./'].concat(FILES))).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((r) => r || fetch(e.request)));
});
