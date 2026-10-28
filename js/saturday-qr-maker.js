/* Saturday QR maker UI: everything happens in the browser, nothing is uploaded. */
(() => {
  const $ = s => document.querySelector(s);
  const url = $('#qrUrl'), out = $('#qrOut'), msg = $('#qrMsg'), mark = $('#qrMark'), cap = $('#qrUrlShown');
  if (!url || !window.SaturdayQR) return;
  // A link handed over from the homepage QR teaser (?url=...&style=...) pre-fills the maker. Nothing leaves the browser.
  const qs = new URLSearchParams(location.search), handed = (qs.get('url') || '').trim().slice(0, 900);
  url.value = handed || SaturdayQR.DEFAULT_URL;
  const handedStyle = document.querySelector('input[name="qrStyle"][value="' + (qs.get('style') || '').replace(/[^a-z]/g, '') + '"]');
  if (handedStyle) handedStyle.checked = true;
  const style = () => (document.querySelector('input[name="qrStyle"]:checked') || {}).value || 'holo';
  let current = '';
  const slug = () => 'saturday-qr-' + style();
  const draw = () => {
    const v = url.value.trim();
    if (!v) { msg.textContent = 'Type a link (or any text) to make a code.'; return; }
    if (v.length > 900) { msg.textContent = 'That is a lot of text for one QR. Keep it under 900 characters.'; return; }
    try { current = SaturdayQR.svg(v, { style: style(), mark: mark.checked }); out.innerHTML = current; cap.textContent = v; msg.textContent = ''; }
    catch (e) { msg.textContent = 'Could not make that one. Try a shorter link.'; }
  };
  const save = (blob, name) => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); };
  url.addEventListener('input', draw); mark.addEventListener('change', draw);
  document.querySelectorAll('input[name="qrStyle"]').forEach(r => r.addEventListener('change', draw));
  $('#qrReset').addEventListener('click', () => { url.value = SaturdayQR.DEFAULT_URL; draw(); });
  $('#qrSvg').addEventListener('click', () => { draw(); save(new Blob([current], { type: 'image/svg+xml' }), slug() + '.svg'); });
  $('#qrPng').addEventListener('click', async () => { draw(); const c = await SaturdayQR.toCanvas(current, 1600); c.toBlob(b => save(b, slug() + '.png'), 'image/png'); });
  $('#qrSheet').addEventListener('click', async () => { draw(); msg.textContent = 'Printing press warming up…'; const c = await SaturdayQR.sheet(current); c.toBlob(b => { save(b, slug() + '-sticker-sheet-a4.png'); msg.textContent = 'Sticker sheet saved. Print at 100% on A4.'; }, 'image/png'); });
  draw();
  window.__saturdayQRMaker = { draw, get svg() { return current; } };
})();
