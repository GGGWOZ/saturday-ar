/* Saturday — Scan to Reveal. Tap-to-scan (default) or camera + QR (BarcodeDetector, else vendored jsQR).
   Reveal: teal ripple, Alley (the Saturday alien head) rises out of it on a hologram pad, spins through
   sea foam and snow, the gold ring snaps into orbit with a glint, the eyes catch the light, then idle float
   with blinks. Tap the head for a trick. No tracking, no network calls. */
(() => {
  const A = window.SaturdayAlley; if (!A) return;
  const NAME = A.NAME;
  const stage = document.querySelector('[data-scan]'); if (!stage) return;
  const $ = s => stage.querySelector(s);
  const RM = matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => RM.matches;
  const bg = $('.scan-bg'), cam = $('.scan-cam'), cv = $('.scan-fx'), ctx = cv.getContext('2d');
  const msg = $('.scan-msg'), card = $('.found'), wrap = $('.alley-wrap');
  const btnTap = $('[data-act="tap"]'), btnCam = $('[data-act="camera"]'), btnReveal = $('[data-act="reveal"]'), btnStop = $('[data-act="stop"]');
  const bar = $('.ring .bar');
  const vib = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (_) {} };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const say = t => { msg.textContent = t; };

  /* Alley markup: the alien head mark on a hologram pad */
  wrap.querySelector('.alley-trick').innerHTML = A.svg({ id: 'scan' });
  const svg = wrap.querySelector('svg');
  const rings = [...svg.querySelectorAll('.al-ring,.al-ring-back')], glint = svg.querySelector('.al-glint-star'), board = svg.querySelector('.al-board');
  const headEl = svg.querySelector('.al-head'), eyeGlints = [...svg.querySelectorAll('.al-glint')];
  const blinks = [...svg.querySelectorAll('.al-blink')];
  const eyeFlash = () => eyeGlints.forEach((g, i) => g.animate([{ opacity: .9 }, { opacity: 1, transform: 'scale(1.8)' }, { opacity: .9, transform: 'none' }], { duration: 520, delay: i * 40, easing: 'ease-out' }));

  /* reduced motion: hold the poster frame */
  const syncVideo = () => { if (reduced()) { bg.pause(); } else { const p = bg.play(); p && p.catch(() => {}); } };
  syncVideo(); RM.addEventListener && RM.addEventListener('change', syncVideo);

  /* ---------- canvas fx: ripple + foam/snow particles ---------- */
  let W = 0, H = 0, DPR = 1, parts = [], ripples = [], raf = 0;
  const size = () => { DPR = Math.min(devicePixelRatio || 1, 2); const r = stage.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); };
  size(); addEventListener('resize', size);
  const point = () => { const cs = getComputedStyle(stage); return { x: parseFloat(cs.getPropertyValue('--px')) || W * .5, y: parseFloat(cs.getPropertyValue('--py')) || H * .45 }; };
  const setPoint = (fx, fy) => { stage.style.setProperty('--x', (fx * 100).toFixed(2) + '%'); stage.style.setProperty('--y', (fy * 100).toFixed(2) + '%'); stage.style.setProperty('--px', fx * W); stage.style.setProperty('--py', fy * H); };
  const P0 = { fx: .5, fy: .45 };
  const readP0 = () => { const cs = getComputedStyle(stage); P0.fx = (parseFloat(cs.getPropertyValue('--x0')) || 50) / 100; P0.fy = (parseFloat(cs.getPropertyValue('--y0')) || 45) / 100; };
  readP0();
  setPoint(P0.fx, P0.fy);
  addEventListener('resize', () => { readP0(); if (stage.dataset.state === 'ready') setPoint(P0.fx, P0.fy); });
  const loop = () => {
    ctx.clearRect(0, 0, W, H);
    const now = performance.now();
    ripples = ripples.filter(r => now - r.t0 < r.d);
    for (const r of ripples) {
      const k = (now - r.t0) / r.d, e = 1 - Math.pow(1 - k, 3);
      ctx.save(); ctx.translate(r.x, r.y); ctx.scale(1, .62);
      ctx.beginPath(); ctx.arc(0, 0, 10 + e * r.R, 0, 6.283);
      ctx.strokeStyle = `rgba(143,227,224,${(1 - k) * .9})`; ctx.lineWidth = 3 * (1 - k) + .5; ctx.shadowColor = 'rgba(143,227,224,.9)'; ctx.shadowBlur = 16; ctx.stroke();
      if (r.fill) { const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 10 + e * r.R); g.addColorStop(0, `rgba(232,251,250,${(1 - k) * .55})`); g.addColorStop(1, 'rgba(143,227,224,0)'); ctx.fillStyle = g; ctx.fill(); }
      ctx.restore();
    }
    parts = parts.filter(p => p.life > 0);
    for (const p of parts) {
      p.life -= 1 / 60; p.vy += p.g; p.vx *= p.drag; p.vy *= p.drag; p.x += p.vx + (p.snow ? Math.sin((now / 380) + p.ph) * .35 : 0); p.y += p.vy;
      const a = Math.max(0, Math.min(1, p.life / p.max * 1.6));
      ctx.globalAlpha = a;
      if (p.snow) { ctx.shadowColor = 'rgba(30,80,140,.9)'; ctx.shadowBlur = 4; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill(); if (p.r > 1.8) { ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fillRect(p.x - p.r * 1.8, p.y - .4, p.r * 3.6, .8); ctx.fillRect(p.x - .4, p.y - p.r * 1.8, .8, p.r * 3.6); } ctx.shadowBlur = 0; }
      else if (p.gold) { ctx.fillStyle = '#F3D58A'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill(); }
      else { const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r); g.addColorStop(0, 'rgba(240,255,254,.95)'); g.addColorStop(.45, 'rgba(143,227,224,.8)'); g.addColorStop(1, 'rgba(60,170,190,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
    raf = (parts.length || ripples.length) ? requestAnimationFrame(loop) : 0;
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  const ripple = (x, y, R) => { [0, 160, 340].forEach((d, i) => setTimeout(() => { ripples.push({ x, y, R: R * (1 - i * .12), t0: performance.now(), d: 1100, fill: i === 0 }); kick(); }, d)); };
  const spray = (x, y, n, spread = 1) => {
    for (let i = 0; i < n; i++) {
      const snow = Math.random() < .45, gold = !snow && Math.random() < .08, ang = -Math.PI / 2 + (Math.random() - .5) * 2.4 * spread, sp = 2 + Math.random() * 5.5;
      parts.push({ x: x + (Math.random() - .5) * 40, y, vx: Math.cos(ang) * sp * (snow ? .7 : 1), vy: Math.sin(ang) * sp * (snow ? .8 : 1), g: snow ? .03 : .16, drag: snow ? .985 : .975,
        r: snow ? 1.4 + Math.random() * 2.6 : gold ? 1.4 + Math.random() * 1.4 : 4 + Math.random() * 7, snow, gold, ph: Math.random() * 6, life: snow ? 1.8 + Math.random() : .9 + Math.random() * .6, max: 1.8 });
      parts[parts.length - 1].max = parts[parts.length - 1].life;
    }
    kick();
  };
  const boardPoint = () => { const r = svg.querySelector('.al-board').getBoundingClientRect(), s = stage.getBoundingClientRect(); return { x: r.left - s.left + r.width / 2, y: r.top - s.top + r.height / 2 }; };

  /* ---------- idle: blinks ---------- */
  let blinkT = 0;
  const blink = () => {
    clearTimeout(blinkT);
    if (stage.dataset.state !== 'revealed') return;
    if (!reduced()) blinks.forEach(b => b.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(.08)' }, { transform: 'scaleY(1)' }], { duration: 170, easing: 'ease-in-out' }));
    blinkT = setTimeout(blink, 2400 + Math.random() * 3600);
  };

  /* ---------- the reveal ---------- */
  let busy = false;
  async function reveal() {
    if (busy) return; busy = true;
    stage.dataset.state = 'revealing'; stage.dataset.ring = 'off';
    card.classList.remove('show');
    vib(30);
    const { x, y } = point();
    const pop = wrap.querySelector('.alley-pop'), spin = wrap.querySelector('.alley-spin');
    if (reduced()) {
      pop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, fill: 'both' });
      stage.dataset.ring = 'on';
      await wait(500);
    } else {
      ripple(x, y, Math.min(W, H) * .42);
      await wait(220);
      pop.animate([
        { transform: 'translateY(38%) scale(.08)', opacity: 0, filter: 'brightness(3) saturate(0)' },
        { transform: 'translateY(22%) scale(.4)', opacity: 1, offset: .18 },
        { transform: 'translateY(-16%) scale(1.06)', filter: 'brightness(1.4) saturate(1)', offset: .55 },
        { transform: 'translateY(3%) scale(.98,1.02)', offset: .8 },
        { transform: 'translateY(0) scale(1)', opacity: 1, filter: 'none' }
      ], { duration: 1250, easing: 'cubic-bezier(.25,.8,.3,1)', fill: 'both' });
      spin.animate([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(720deg)' }], { duration: 1000, delay: 160, easing: 'cubic-bezier(.45,0,.2,1)', fill: 'both' });
      let k = 0; const sprayIv = setInterval(() => { const b = boardPoint(); spray(b.x, b.y, 16); if (++k > 7) clearInterval(sprayIv); }, 95);
      await wait(1180);
      const b = boardPoint(); spray(b.x, b.y + 6, 26, .7); vib(12);
      await wait(120);
      /* ring snaps in with a glint */
      stage.dataset.ring = 'on';
      rings.forEach(r => r.animate([{ transform: 'translateY(-60px) scale(1.8)', opacity: 0 }, { transform: 'translateY(4px) scale(.95)', opacity: 1, offset: .7 }, { transform: 'none', opacity: 1 }], { duration: 440, easing: 'cubic-bezier(.3,1.4,.5,1)' }));
      setTimeout(() => glint.animate([{ transform: 'scale(0) rotate(0deg)', opacity: 0 }, { transform: 'scale(2.2) rotate(90deg)', opacity: 1, offset: .4 }, { transform: 'scale(1) rotate(180deg)', opacity: 1 }], { duration: 650, easing: 'ease-out' }), 300);
      await wait(560);
      /* the eyes catch the light */
      eyeFlash();
    }
    stage.dataset.state = 'revealed';
    blinkT = setTimeout(blink, 1600);
    setTimeout(() => { card.classList.add('show'); }, reduced() ? 100 : 700);
    busy = false;
  }

  /* tap Alley: a barrel-roll spin, the ring wobbles, the eyes glint */
  let flipping = false;
  wrap.querySelector('.alley-btn').addEventListener('click', () => {
    if (stage.dataset.state !== 'revealed' || flipping) return;
    flipping = true; vib(15);
    const t = wrap.querySelector('.alley-trick');
    if (reduced()) { t.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-6%)' }, { transform: 'translateY(0)' }], { duration: 400 }).onfinish = () => { flipping = false; }; return; }
    const b0 = boardPoint(); spray(b0.x, b0.y, 14, .8);
    t.animate([{ transform: 'translateY(0) rotateY(0)' }, { transform: 'translateY(-14%) rotateY(180deg)', offset: .45 }, { transform: 'translateY(-10%) rotateY(320deg)', offset: .7 }, { transform: 'translateY(0) rotateY(360deg) scale(1.03,.97)', offset: .9 }, { transform: 'rotateY(360deg)' }], { duration: 900, easing: 'cubic-bezier(.3,.7,.3,1)' });
    rings.forEach(r => r.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-10deg)', offset: .4 }, { transform: 'rotate(6deg)', offset: .75 }, { transform: 'none' }], { duration: 900, easing: 'ease-in-out' }));
    glint.animate([{ transform: 'scale(1) rotate(0deg)' }, { transform: 'scale(2.4) rotate(90deg)', offset: .5 }, { transform: 'scale(1) rotate(180deg)' }], { duration: 700, delay: 500 });
    setTimeout(eyeFlash, 640);
    setTimeout(() => { const b = boardPoint(); spray(b.x, b.y, 22, .6); flipping = false; }, 900);
  });

  /* ---------- scan: tap ---------- */
  async function scanBeat() {
    stage.dataset.state = 'scanning'; say('Scanning…'); vib([10, 60, 10]);
    if (bar) bar.animate([{ strokeDashoffset: 302 }, { strokeDashoffset: 0 }], { duration: reduced() ? 400 : 1200, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
    await wait(reduced() ? 420 : 1220);
    say('');
    await reveal();
  }
  btnTap.addEventListener('click', () => { if (stage.dataset.state === 'ready') { setPoint(P0.fx, P0.fy); scanBeat(); } });

  /* ---------- scan: camera ---------- */
  let stream = null, detTimer = 0, revealTimer = 0, detector = null, jsqrLoading = null;
  const off = document.createElement('canvas'), octx = off.getContext('2d', { willReadFrequently: true });
  const loadJsQR = () => jsqrLoading || (jsqrLoading = new Promise((res, rej) => { if (window.jsQR) return res(); const s = document.createElement('script'); s.src = 'vendor/jsqr/jsQR.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s); }));
  const stopCam = () => { clearTimeout(detTimer); clearTimeout(revealTimer); if (stream) stream.getTracks().forEach(t => t.stop()); stream = null; cam.srcObject = null; cam.hidden = true; stage.dataset.mode = 'video'; btnReveal.hidden = true; syncVideo(); };
  const mapToStage = (bx, by) => { // video pixel -> stage fraction, object-fit: cover
    const vw = cam.videoWidth, vh = cam.videoHeight, s = Math.max(W / vw, H / vh), ox = (W - vw * s) / 2, oy = (H - vh * s) / 2;
    return { fx: Math.min(.85, Math.max(.15, (bx * s + ox) / W)), fy: Math.min(.8, Math.max(.25, (by * s + oy) / H)) };
  };
  const found = (cx, cy) => {
    clearTimeout(detTimer); clearTimeout(revealTimer); btnReveal.hidden = true;
    if (cx != null) { const p = mapToStage(cx, cy); setPoint(p.fx, p.fy); }
    say('Signal found.'); scanBeat();
  };
  const detect = async () => {
    if (!stream || stage.dataset.state !== 'ready') return;
    try {
      if (cam.readyState >= 2) {
        if (detector) {
          const r = await detector.detect(cam);
          if (r && r.length) { const b = r[0].boundingBox; return found(b.x + b.width / 2, b.y + b.height / 2); }
        } else if (window.jsQR) {
          const sc = Math.min(1, 480 / Math.max(cam.videoWidth, cam.videoHeight)); off.width = cam.videoWidth * sc | 0; off.height = cam.videoHeight * sc | 0;
          octx.drawImage(cam, 0, 0, off.width, off.height);
          const d = octx.getImageData(0, 0, off.width, off.height), q = window.jsQR(d.data, off.width, off.height, { inversionAttempts: 'attemptBoth' });
          if (q) { const l = q.location; return found((l.topLeftCorner.x + l.bottomRightCorner.x) / 2 / sc, (l.topLeftCorner.y + l.bottomRightCorner.y) / 2 / sc); }
        }
      }
    } catch (_) {}
    detTimer = setTimeout(detect, 220);
  };
  btnCam.addEventListener('click', async () => {
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) || !isSecureContext) { say('Camera needs a secure (https) connection on a phone or laptop. Tap to scan works anywhere.'); return; }
    say('Asking for the camera…');
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
    } catch (e) {
      stream = null;
      say(e && e.name === 'NotAllowedError' ? `No camera, no stress. Tap to scan and ${NAME} still shows up.` : `Couldn't start the camera here. Tap to scan instead.`);
      return;
    }
    cam.srcObject = stream; cam.hidden = false; stage.dataset.mode = 'camera'; bg.pause();
    try { await cam.play(); } catch (_) {}
    detector = null;
    if ('BarcodeDetector' in window) { try { const f = await window.BarcodeDetector.getSupportedFormats(); if (f.includes('qr_code')) detector = new window.BarcodeDetector({ formats: ['qr_code'] }); } catch (_) {} }
    if (!detector) { try { await loadJsQR(); } catch (_) { say('QR reader failed to load. Use Reveal instead.'); } }
    say('Point at the code on a Saturday tee. Any QR works.');
    revealTimer = setTimeout(() => { if (stream && stage.dataset.state === 'ready') btnReveal.hidden = false; }, 3500);
    detect();
  });
  btnReveal.addEventListener('click', () => found(null, null));
  btnStop.addEventListener('click', () => { stopCam(); say(''); });
  addEventListener('pagehide', stopCam);

  /* ---------- card actions ---------- */
  const reset = () => {
    clearTimeout(blinkT); card.classList.remove('show');
    stage.dataset.state = 'ready'; stage.dataset.ring = 'off';
    wrap.querySelectorAll('.alley-pop,.alley-spin').forEach(el => el.getAnimations().forEach(a => a.cancel()));
    if (bar) bar.getAnimations().forEach(a => a.cancel());
    if (stage.dataset.mode === 'camera' && stream) { say('Point at a code. Any QR works.'); revealTimer = setTimeout(() => { if (stream && stage.dataset.state === 'ready') btnReveal.hidden = false; }, 3500); detect(); }
    else { setPoint(P0.fx, P0.fy); say(''); }
    btnTap.focus({ preventScroll: true });
  };
  $('[data-act="again"]').addEventListener('click', reset);

  const shot = $('[data-act="shot"]');
  if (shot) shot.addEventListener('click', async () => {
    try {
      const c = document.createElement('canvas'), w = 1080, h = 1350; c.width = w; c.height = h; const x = c.getContext('2d');
      const src = stage.dataset.mode === 'camera' && cam.videoWidth ? cam : bg;
      const vw = src.videoWidth || 1280, vh = src.videoHeight || 726, s = Math.max(w / vw, h / vh);
      x.fillStyle = '#0B1020'; x.fillRect(0, 0, w, h);
      x.drawImage(src, (w - vw * s) / 2, (h - vh * s) / 2, vw * s, vh * s);
      const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(11,16,32,.55)'); g.addColorStop(.25, 'rgba(11,16,32,0)'); g.addColorStop(.72, 'rgba(11,16,32,0)'); g.addColorStop(1, 'rgba(11,16,32,.9)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
      const clone = svg.cloneNode(true); clone.setAttribute('width', 400); clone.setAttribute('height', 480);
      const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' }));
      const img = new Image(); await new Promise((r, j) => { img.onload = r; img.onerror = j; img.src = url; });
      x.drawImage(img, w / 2 - 260, h * .43 - 380, 520, 624); URL.revokeObjectURL(url);
      x.textAlign = 'center'; x.fillStyle = '#F3D58A'; x.font = '64px "Pirata One", serif'; x.fillText(`You found ${NAME}`, w / 2, h - 150);
      x.fillStyle = '#8FE3E0'; x.font = '600 24px "Space Grotesk", sans-serif'; x.fillText('THE SATURDAY ALIEN · ORIGINAL 001', w / 2, h - 100);
      x.fillStyle = 'rgba(244,236,216,.7)'; x.font = '500 20px "Space Grotesk", sans-serif'; x.fillText('saturdayforthewin.com/scan', w / 2, h - 60);
      const blob = await new Promise(r => c.toBlob(r, 'image/png'));
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `saturday-${NAME.toLowerCase()}-found.png`; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    } catch (e) { shot.hidden = true; }
  });

  stage.dataset.state = 'ready'; stage.dataset.mode = 'video';
  /* deep link for testing / sharing: scan.html#reveal plays the reveal straight away */
  if (location.hash === '#reveal') setTimeout(() => scanBeat(), 600);
})();
