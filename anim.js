/* ================= ANIMAZIONI: carte che volano, numeri che saltano, gioco più vivo ================= */
const ANIM = (() => {
  const reduce = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  const AREAS = ['opp', 'table', 'hand', 'deckBox', 'bar'];
  let prev = new Map(), prevSides = { you: '', opp: '' }, prevWin = null, pending = false, hold = 0;
  const EASE = 'cubic-bezier(.2,.8,.25,1)';
  const rectOf = (el) => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
  const visible = (r) => r.w > 2 && r.h > 2;
  function collect() {
    const m = new Map();
    for (const id of AREAS) {
      const box = $(id);
      if (!box) continue;
      box.querySelectorAll('img').forEach((im) => {
        if (!im.src || im.closest('.sh, .suit')) return;
        const r = rectOf(im);
        if (!visible(r)) return;
        let k = im.src, n = 0;
        while (m.has(k + '#' + n)) n++;
        m.set(k + '#' + n, { el: im, r, area: id });
      });
    }
    return m;
  }
  function centerRect(el, w, h) { const r = rectOf(el); return { x: r.x + r.w / 2 - w / 2, y: r.y + r.h / 2 - h / 2, w, h }; }
  function sideTarget() {
    const you = ($('youSide') || {}).textContent || '', opp = ($('oppSide') || {}).textContent || '';
    let t = null;
    if (you !== prevSides.you && prevSides.you) t = 'youSide';
    else if (opp !== prevSides.opp && prevSides.opp) t = 'oppSide';
    else if (prevWin) t = prevWin;
    prevSides = { you, opp };
    return t;
  }
  function flyFrom(el, from, delay, flip) {
    const to = rectOf(el);
    if (!visible(to)) return;
    const dx = from.x - to.x, dy = from.y - to.y, sx = from.w / to.w || 1, sy = from.h / to.h || 1;
    if (Math.abs(dx) < 3 && Math.abs(dy) < 3 && Math.abs(sx - 1) < 0.03) return;
    el.style.transformOrigin = '0 0';
    const start = 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')';
    const frames = flip
      ? [{ transform: start + ' rotate(-8deg)', opacity: 0.6 }, { transform: 'translate(' + dx / 2 + 'px,' + (dy / 2 - 20) + 'px) scale(' + (sx + 1) / 2 * 0.05 + ',' + (sy + 1) / 2 + ')', offset: 0.45 }, { transform: 'translate(' + dx / 4 + 'px,' + (dy / 4 - 8) + 'px) scale(1.06)', offset: 0.75 }, { transform: 'none', opacity: 1 }]
      : [{ transform: start }, { transform: 'translate(' + dx * 0.15 + 'px,' + (dy * 0.15 - 10) + 'px) scale(1.05)', offset: 0.7 }, { transform: 'none' }];
    const a = el.animate(frames, { duration: flip ? 520 : 380, delay: delay || 0, easing: EASE, fill: 'backwards' });
    a.onfinish = () => { el.style.transformOrigin = ''; };
  }
  function ghost(src, from, targetId, delay) {
    const g = document.createElement('img');
    g.src = src; g.className = 'cardghost';
    Object.assign(g.style, { left: from.x + 'px', top: from.y + 'px', width: from.w + 'px', height: from.h + 'px' });
    document.body.appendChild(g);
    const tEl = targetId && $(targetId);
    let tx = 0, ty = -60, sc = 0.6;
    if (tEl) { const t = rectOf(tEl); tx = t.x + Math.min(t.w, 60) / 2 - (from.x + from.w / 2); ty = t.y + t.h / 2 - (from.y + from.h / 2); sc = 0.32; }
    const a = g.animate([
      { transform: 'none', opacity: 1 },
      { transform: 'translate(' + tx * 0.3 + 'px,' + (ty * 0.3 - 26) + 'px) rotate(' + (tx > 0 ? 10 : -10) + 'deg) scale(1.05)', opacity: 1, offset: 0.35 },
      { transform: 'translate(' + tx + 'px,' + ty + 'px) rotate(' + (tx > 0 ? 25 : -25) + 'deg) scale(' + sc + ')', opacity: 0.15 },
    ], { duration: 560, delay: delay || 0, easing: 'cubic-bezier(.5,0,.6,1)', fill: 'both' });
    a.onfinish = () => { g.remove(); if (tEl) bump(tEl); };
  }
  function bump(el) { if (!el) return; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); setTimeout(() => el.classList.remove('bump'), 450); }
  function process() {
    pending = false;
    const game = $('vGame');
    if (!game || game.hidden) { prev = new Map(); prevSides = { you: '', opp: '' }; prevWin = null; return; }
    const now = collect();
    if (reduce() || Date.now() < hold) { prev = now; prevSides = { you: ($('youSide') || {}).textContent || '', opp: ($('oppSide') || {}).textContent || '' }; prevWin = null; return; }
    const fresh = prev.size === 0;
    const target = sideTarget();
    const oppHasBacks = !!($('opp') && $('opp').querySelector('.back'));
    let iHand = 0, iTable = 0;
    for (const [k, cur] of now) {
      const p = prev.get(k);
      if (p) { flyFrom(cur.el, p.r, 0, false); continue; }
      // carta nuova: da dove arriva?
      const w = cur.r.w, h = cur.r.h;
      if (cur.area === 'hand' || (cur.area === 'bar' && cur.el.closest('.curcard'))) {
        const src = $('deckBox') && $('deckBox').querySelector('.back') ? $('deckBox') : $('table');
        flyFrom(cur.el, centerRect(src, w * 0.6, h * 0.6), fresh ? 60 * iHand++ : 80, false);
      } else if (cur.area === 'table') {
        if (fresh) { flyFrom(cur.el, centerRect($('deckBox').querySelector('.back') ? $('deckBox') : $('table'), w * 0.6, h * 0.6), 300 + 70 * iTable++, false); continue; }
        const src = oppHasBacks ? $('opp') : ($('deckBox').querySelector('.back') ? $('deckBox') : $('opp'));
        flyFrom(cur.el, centerRect(src, w * 0.5, h * 0.5), 0, true);
      } else if (cur.area === 'opp' && !fresh) {
        flyFrom(cur.el, centerRect($('deckBox'), w * 0.6, h * 0.6), 0, false);
      }
    }
    // carte sparite dal tavolo: volano da chi le ha prese
    if (!fresh) {
      let i = 0;
      for (const [k, p] of prev) {
        if (now.has(k) || p.area !== 'table') continue;
        const src = k.slice(0, k.lastIndexOf('#'));
        ghost(src, p.r, target || 'deckBox', 40 * i++);
      }
    }
    // chi sta vincendo la mano adesso (briscola, tressette)
    const w = $('table') && $('table').querySelector('.slot .card.win');
    prevWin = w ? (/Tu/.test(w.parentElement.textContent) ? 'youSide' : 'oppSide') : null;
    prev = now;
  }
  const schedule = () => { if (!pending) { pending = true; requestAnimationFrame(() => requestAnimationFrame(process)); } };
  // Un osservatore registra i cambiamenti del tavolo; prima di ogni cambiamento le posizioni sono già in memoria.
  const obs = new MutationObserver(schedule);
  for (const id of AREAS) { const el = $(id); if (el) obs.observe(el, { childList: true, subtree: true }); }
  window.addEventListener('resize', () => { prev = collect(); });

  /* numeri del punteggio che saltano */
  let lastScore = '';
  const sObs = new MutationObserver(() => {
    const t = $('gScore').textContent;
    if (lastScore && t !== lastScore) $('gScore').querySelectorAll('b').forEach((b) => bump(b));
    lastScore = t;
  });
  if ($('gScore')) sObs.observe($('gScore'), { childList: true, subtree: true, characterData: true });

  /* numerini "+10" che volano dal punto in cui hai toccato */
  let lastTap = { x: 0, y: 0, t: 0 };
  document.addEventListener('pointerdown', (e) => { lastTap = { x: e.clientX, y: e.clientY, t: Date.now() }; }, true);
  function floaty(text) {
    if (reduce() || Date.now() - lastTap.t > 2500) return;
    const f = document.createElement('div');
    f.className = 'floaty'; f.textContent = text;
    f.style.left = lastTap.x + 'px'; f.style.top = lastTap.y + 'px';
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 1100);
  }
  return { bump, floaty, reset: () => { prev = new Map(); }, quiet: (ms) => { hold = Date.now() + (ms || 250); }, reduced: reduce };
})();

/* flash con numerino volante per le ricompense */
const _flash = flash;
flash = function (text) { if (/^\+\d/.test(text) || /^\+/.test(text)) ANIM.floaty(text); _flash(text); };

/* barra delle risorse: le cifre saltano quando cambiano */
(() => {
  const old = renderRes;
  let last = null;
  renderRes = function () {
    const E = eco();
    const cur = [E.carlini, E.acqua, E.concime, E.tessere];
    old();
    if (last) document.querySelectorAll('.resbar').forEach((bar) => {
      bar.querySelectorAll('span').forEach((s, i) => { if (cur[i] !== last[i]) { ANIM.bump(s); if (cur[i] > last[i]) s.classList.add('up'); else s.classList.add('down'); setTimeout(() => s.classList.remove('up', 'down'), 600); } });
    });
    last = cur;
  };
})();

/* gli schermi entrano con un piccolo movimento */
(() => {
  const oldGo = go;
  go = function (v) { oldGo(v); const el = $(v); if (el) { el.classList.remove('viewin'); void el.offsetWidth; el.classList.add('viewin'); } };
})();
