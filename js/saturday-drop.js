/* Saturday drop date: the ONE place to change it.
   Set to an ISO date with the Brisbane offset (+10:00), or null if no date is confirmed.
   null      -> shows "Drop 001: date announced soon" (no countdown)
   future    -> live days / hrs / mins / secs countdown to that exact moment (never resets or loops)
   past      -> "Drop 001 is here — pre-orders open" (checkout still not connected: pre-order list)
   No stock counts, ever. Confirmed by George: 11.11.2026 at 11:11am AEST. */
window.SATURDAY_DROP_DATE = '2026-11-11T11:11:00+10:00';

(() => {
  const box = document.querySelector('[data-cd]'); if (!box) return;
  const q = s => box.querySelector(s);
  const label = q('[data-cd-label]'), title = q('[data-cd-title]'), text = q('[data-cd-text]'), note = q('[data-cd-note]');
  const u = k => q(`[data-u="${k}"]`);
  const iso = window.SATURDAY_DROP_DATE;
  const when = iso ? new Date(iso).getTime() : NaN;
  if (!iso || isNaN(when)) {
    box.dataset.state = 'tba';
    label.textContent = 'Drop 001';
    title.textContent = 'Date announced soon.';
    text.textContent = 'We’ll set the date when it’s locked in. Join the list to hear first.';
    return;
  }
  const pad = n => String(n).padStart(2, '0');
  let t;
  const tick = () => {
    const left = when - Date.now();
    if (left <= 0) {
      clearInterval(t);
      box.dataset.state = 'live';
      label.textContent = 'Drop 001 · 11.11 · 11:11am AEST';
      title.textContent = 'Drop 001 is here — pre-orders open.';
      text.textContent = 'Checkout isn’t connected yet, so pre-orders run through the list: join it and we’ll email you the moment you can order.';
      note.textContent = 'No payment is taken on this site yet.';
      return;
    }
    box.dataset.state = 'count';
    const s = Math.floor(left / 1000);
    u('d').textContent = Math.floor(s / 86400); u('h').textContent = pad(Math.floor(s % 86400 / 3600));
    u('m').textContent = pad(Math.floor(s % 3600 / 60)); u('s').textContent = pad(s % 60);
  };
  tick(); if (box.dataset.state === 'count') t = setInterval(tick, 1000);
})();
