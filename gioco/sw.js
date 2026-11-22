const CACHE = 'scopa-964bd32f81';
const FILES = ["aiuti.js", "alegreya-400-italic.woff2", "alegreya-400.woff2", "alegreya-500.woff2", "alegreya-700.woff2", "alegreya-sc-700.woff2", "alegreya-sc-800.woff2", "amici.js", "anim.js", "apertura.webp", "app-01.js", "app-02.js", "app-03.js", "bergo.js", "borgo.js", "calcio.js", "carriera.js", "casa.js", "cloud.js", "conquista.js", "data-apertura.js", "data-carte.js", "data-copertina.js", "data-icone.js", "data-personaggi.js", "drink.js", "energia.js", "firebase.js", "gatta.js", "icona-180.png", "icona-192.png", "icona-512.png", "index.html", "ingrandisci.js", "legale.js", "lingua.js", "manifest.json", "mazzo.js", "morra.js", "musica.js", "nickname.js", "notifiche.js", "online.js", "paesani.js", "paese.js", "paesi-data.js", "pass.js", "pecore.js", "pesca.js", "pixi.min.js", "sfida.js", "signor-nduja.js", "social.js", "solitario.js", "storie.js", "style.css", "telaio.js", "tornei.js", "tressette.js", "web.js"];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./'].concat(FILES))).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((r) => r || fetch(e.request)));
});
