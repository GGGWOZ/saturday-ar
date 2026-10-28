/* 008 option switcher: "008 Full Print" / "008 QR". Deep links: #qr, #full (and #qr-art, #art). */
(() => {
  const btns = [...document.querySelectorAll('.opt[data-pick]')];
  if (!btns.length) return;
  const TITLES = { full: '008 — Hemp Camp Collar Shirt · Saturday', qr: '008 QR — Hemp Camp Collar Shirt · Saturday' };
  const pickFromHash = () => (/^#qr/.test(location.hash) ? 'qr' : 'full');
  const show = (opt, push) => {
    document.querySelectorAll('[data-opt]').forEach(el => { el.hidden = el.dataset.opt !== opt; });
    btns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.pick === opt)));
    document.title = TITLES[opt];
    document.body.dataset.option = opt;
    if (push) history.replaceState(null, '', opt === 'qr' ? '#qr' : '#full');
  };
  btns.forEach(b => b.addEventListener('click', () => show(b.dataset.pick, true)));
  addEventListener('hashchange', () => show(pickFromHash(), false));
  show(pickFromHash(), false);
})();
