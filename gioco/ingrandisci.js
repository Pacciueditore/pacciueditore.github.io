/* ================= TIENI PREMUTO PER INGRANDIRE LA CARTA ================= */
(() => {
  const pv = document.createElement('div');
  pv.id = 'peek'; pv.hidden = true; pv.setAttribute('aria-hidden', 'true');
  document.body.appendChild(pv);
  let timer = null, shown = false, suppress = false, sx = 0, sy = 0;
  const SEL = '#vGame .card, #vGame .scell, #vMazzo [data-mzcard], .chestloot .card';
  const findImg = (t) => { const c = t.closest && t.closest(SEL); return c ? c.querySelector('img') : null; };
  document.addEventListener('pointerdown', (e) => {
    const im = findImg(e.target);
    if (!im) return;
    sx = e.clientX; sy = e.clientY;
    clearTimeout(timer);
    timer = setTimeout(() => {
      shown = true;
      pv.innerHTML = '<img src="' + im.src + '" alt=""><b>' + (im.alt || '') + '</b>';
      pv.hidden = false;
      try { if (navigator.vibrate) navigator.vibrate(12); } catch (err) { /* niente */ }
    }, 380);
  });
  document.addEventListener('pointermove', (e) => { if (!shown && timer && Math.hypot(e.clientX - sx, e.clientY - sy) > 12) { clearTimeout(timer); timer = null; } });
  const end = () => {
    clearTimeout(timer); timer = null;
    if (shown) { shown = false; pv.hidden = true; suppress = true; setTimeout(() => { suppress = false; }, 400); }
  };
  document.addEventListener('pointerup', end);
  document.addEventListener('pointercancel', end);
  window.addEventListener('blur', end);
  // dopo l'ingrandimento la carta non deve essere giocata
  document.addEventListener('click', (e) => { if (suppress) { e.stopPropagation(); e.preventDefault(); suppress = false; } }, true);
  document.addEventListener('contextmenu', (e) => { if (findImg(e.target)) e.preventDefault(); });
})();
