/* Saturday homepage (t127): three signals (tap-to-scan), unlock, surf hum, share badge, unboxing. No libraries. */
(() => {
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KEY = 'saturday-signals-v1', SKEY = 'saturday-sound';
  const IDS = ['tee', 'cap', 'sticker'];
  const ls = { get: k => { try { return localStorage.getItem(k); } catch (_) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (_) {} } };
  let found = []; try { found = JSON.parse(ls.get(KEY) || '[]').filter(x => IDS.includes(x)); } catch (_) {}
  const save = () => ls.set(KEY, JSON.stringify(found));
  const cards = [...document.querySelectorAll('.sig-card')];
  const nEl = document.getElementById('sig-n'), fill = document.getElementById('sig-fill');
  const unlock = document.getElementById('unlocked');
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const vib = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (_) {} };

  /* a real tag can open index.html?signal=tee|cap|sticker and count as found */
  const qs = new URLSearchParams(location.search).get('signal');
  if (qs && IDS.includes(qs) && !found.includes(qs)) { found.push(qs); save(); }

  const render = (justUnlocked) => {
    cards.forEach(c => { const on = found.includes(c.dataset.sig); c.classList.toggle('done', on); c.setAttribute('aria-pressed', String(on)); });
    if (nEl) nEl.textContent = found.length;
    if (fill) fill.style.width = (found.length / 3 * 100) + '%';
    if (unlock && found.length >= 3) {
      unlock.classList.add('open');
      if (justUnlocked) setTimeout(() => { unlock.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', block: 'start' }); unlock.focus({ preventScroll: true }); }, 350);
    }
  };

  /* ---------- surf hum (Web Audio, generated, no audio file) ---------- */
  const tg = document.getElementById('sound-tg');
  let ac = null, master = null, wantOn = ls.get(SKEY) !== 'off', playing = false;
  const buildHum = () => {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    ac = new AC(); master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
    const len = ac.sampleRate * 4, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
    let last = 0; for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.2; } // brown-ish noise
    const noise = ac.createBufferSource(); noise.buffer = buf; noise.loop = true;
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; lp.Q.value = 0.4;
    const swell = ac.createGain(); swell.gain.value = 0.6;
    const lfo = ac.createOscillator(); lfo.frequency.value = 0.09; const lfoG = ac.createGain(); lfoG.gain.value = 0.35; lfo.connect(lfoG); lfoG.connect(swell.gain);
    noise.connect(lp); lp.connect(swell); swell.connect(master);
    const osc = ac.createOscillator(); osc.type = 'sine'; osc.frequency.value = 55; const og = ac.createGain(); og.gain.value = 0.18; osc.connect(og); og.connect(master);
    noise.start(); lfo.start(); osc.start();
    return true;
  };
  const fade = (to, s) => { if (!ac) return; const g = master.gain, now = ac.currentTime; g.cancelScheduledValues(now); g.setValueAtTime(g.value, now); g.linearRampToValueAtTime(to, now + s); };
  const humOn = async () => { if (!ac && !buildHum()) return; try { await ac.resume(); } catch (_) {} fade(0.05, 2.5); playing = true; window.__satAudio = ac.state; };
  const humOff = () => { if (!ac) return; fade(0, 0.8); playing = false; setTimeout(() => { if (!playing && ac) ac.suspend().catch(() => {}); }, 900); };
  const syncTg = () => { if (!tg) return; tg.hidden = false; tg.setAttribute('aria-pressed', String(!wantOn)); tg.querySelector('.sound-l').textContent = wantOn ? 'Sound on' : 'Sound off'; tg.setAttribute('aria-label', wantOn ? 'Mute the surf sound' : 'Turn the surf sound on'); };
  if (tg) {
    tg.addEventListener('click', () => { wantOn = !wantOn; ls.set(SKEY, wantOn ? 'on' : 'off'); syncTg(); if (wantOn) humOn(); else humOff(); });
    syncTg();
  }
  document.addEventListener('visibilitychange', () => { if (!ac) return; if (document.hidden) { fade(0, 0.3); ac.suspend().catch(() => {}); } else if (wantOn && playing) { ac.resume().then(() => fade(0.05, 1.5)).catch(() => {}); } });

  /* ---------- tap to scan ---------- */
  cards.forEach(c => c.addEventListener('click', async () => {
    syncTg();
    if (wantOn && !playing) humOn(); // first tap is the user gesture iOS needs
    const id = c.dataset.sig; if (found.includes(id) || c.classList.contains('busy')) return;
    c.classList.add('busy'); vib(15);
    await wait(reduce() ? 250 : 1200);
    c.classList.remove('busy'); found.push(id); save(); vib([20, 40, 20]);
    if (!reduce()) { c.classList.add('flash'); setTimeout(() => c.classList.remove('flash'), 750); }
    render(found.length === 3);
  }));
  const skip = document.getElementById('sig-skip');
  if (skip) skip.addEventListener('click', () => { if (!unlock) return; unlock.classList.add('open'); unlock.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', block: 'start' }); unlock.focus({ preventScroll: true }); });
  const reset = document.getElementById('sig-reset');
  if (reset) reset.addEventListener('click', () => { found = []; save(); unlock.classList.remove('open'); render(); document.getElementById('signals').scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth' }); });
  render(false);
  if (location.hash === '#unlocked' && unlock) unlock.classList.add('open');

  /* ---------- share badge ---------- */
  const shareBtn = document.getElementById('badge-share'), msg = document.getElementById('badge-msg'), cv = document.getElementById('badge-cv'), prev = document.getElementById('badge-prev');
  const loadImg = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  async function makeBadge() {
    const x = cv.getContext('2d'), W = 1080;
    try { await document.fonts.ready; } catch (_) {}
    const g = x.createRadialGradient(W / 2, W * .38, 40, W / 2, W / 2, W * .75); g.addColorStop(0, '#1d2a55'); g.addColorStop(1, '#0B1020');
    x.fillStyle = g; x.fillRect(0, 0, W, W);
    x.strokeStyle = 'rgba(143,227,224,.35)'; x.lineWidth = 3; x.setLineDash([14, 12]); x.strokeRect(40, 40, W - 80, W - 80); x.setLineDash([]);
    // gold ring + teal orbit
    x.save(); x.translate(W / 2, 400);
    x.lineWidth = 16; x.strokeStyle = '#D4A84B'; x.beginPath(); x.arc(0, 0, 150, 0, 6.283); x.stroke();
    x.rotate(-0.24); x.lineWidth = 7; x.strokeStyle = '#8FE3E0'; x.beginPath(); x.ellipse(0, 0, 250, 52, 0, 0, 6.283); x.stroke();
    x.restore();
    x.fillStyle = '#F3D58A'; x.font = '700 150px "Pirata One", serif'; x.textAlign = 'center'; x.fillText('3/3', W / 2, 452);
    try { const wm = await loadImg('assets/saturday-wordmark-gold.svg'); const w = 560, h = w * (wm.naturalHeight || 265) / (wm.naturalWidth || 820); x.drawImage(wm, (W - w) / 2, 640, w, h); } catch (_) { x.font = '120px "Pirata One", serif'; x.fillText('Saturday', W / 2, 760); }
    x.fillStyle = '#E8FBFA'; x.font = '600 54px "Space Grotesk", system-ui, sans-serif'; x.fillText('I found 3 of 3 signals', W / 2, 860);
    x.fillStyle = '#8FE3E0'; x.font = '500 34px "Space Grotesk", system-ui, sans-serif'; x.fillText('saturdayforthewin.com', W / 2, 960);
    return new Promise(r => cv.toBlob(r, 'image/png'));
  }
  if (shareBtn && cv) shareBtn.addEventListener('click', async () => {
    msg.textContent = 'Making your badge…';
    const blob = await makeBadge(); if (!blob) { msg.textContent = 'Couldn’t make the badge on this browser.'; return; }
    const url = 'https://saturdayforthewin.com/';
    prev.src = URL.createObjectURL(blob); prev.alt = 'Your badge: I found 3 of 3 signals, Saturday, saturdayforthewin.com'; prev.hidden = false;
    const file = new File([blob], 'saturday-3-of-3-signals.png', { type: 'image/png' });
    const data = { files: [file], title: 'Saturday · 3 of 3 signals', text: 'I found 3 of 3 Saturday signals.', url };
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share(data); msg.textContent = 'Shared. Nice.'; return; } catch (e) { if (e && e.name === 'AbortError') { msg.textContent = ''; return; } }
    }
    const a = document.createElement('a'); a.href = prev.src; a.download = file.name; document.body.appendChild(a); a.click(); a.remove();
    let copied = false; try { await navigator.clipboard.writeText(url); copied = true; } catch (_) {}
    msg.textContent = copied ? 'Badge downloaded and link copied.' : 'Badge downloaded. Link: saturdayforthewin.com';
  });

  /* ---------- unboxing on scroll ---------- */
  const stage = document.querySelector('.ub-stage'), track = document.querySelector('.ub-track');
  if (stage && track) {
    if (reduce()) { stage.style.setProperty('--p', 1); return; }
    let on = false, raf = 0;
    const upd = () => { raf = 0; const r = track.getBoundingClientRect(), span = r.height - innerHeight; const p = span > 0 ? Math.min(1, Math.max(0, -r.top / (span * .8))) : 1; stage.style.setProperty('--p', p.toFixed(3)); };
    const onS = () => { if (!raf) raf = requestAnimationFrame(upd); };
    new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && !on) { on = true; addEventListener('scroll', onS, { passive: true }); upd(); } else if (!e.isIntersecting && on) { on = false; removeEventListener('scroll', onS); } })).observe(track);
  }
})();
