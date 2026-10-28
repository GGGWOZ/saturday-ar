/* Saturday Free Drop experience: kinetic type, pinned scroll sequence, foil flip cards,
   sticker toy with PNG export, live QR teaser and the Starter Pack unboxing.
   Vanilla JS, each part initialises lazily when it nears the viewport. No tracking, no network calls. */
(() => {
  const root = document.querySelector('[data-fx]');
  if (!root) return;
  const RM = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  const reduced = () => RM.matches;
  const $ = (s, el = root) => el.querySelector(s);
  const $$ = (s, el = root) => Array.from(el.querySelectorAll(s));
  const lazy = (el, fn, margin = '300px') => {
    if (!el) return;
    if (!('IntersectionObserver' in window)) return fn(el);
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); fn(el); } }, { rootMargin: margin });
    io.observe(el);
  };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* 1. Kinetic split-letter headline */
  const head = $('.fx-head');
  if (reduced() || !('IntersectionObserver' in window)) root.classList.add('fx-in');
  else { const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { root.classList.add('fx-in'); io.disconnect(); } }, { threshold: .25 }); io.observe(head); }

  /* 2. Pinned scroll sequence: CSS scroll-timeline when supported, otherwise rAF driven by scroll while visible */
  lazy($('[data-fx-seq]'), el => {
    if (reduced()) return; // CSS shows the finished scene, unpinned
    if (window.CSS && CSS.supports && CSS.supports('animation-timeline: view()')) { el.classList.add('fx-css'); return; }
    let visible = false, raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect(), range = r.height - innerHeight;
      el.style.setProperty('--p', (range > 0 ? clamp(-r.top / range, 0, 1) : 1).toFixed(4));
    };
    const tick = () => { if (visible && !raf) raf = requestAnimationFrame(update); };
    new IntersectionObserver(es => { visible = es[0].isIntersecting; tick(); }).observe(el);
    addEventListener('scroll', tick, { passive: true });
    addEventListener('resize', tick);
    update();
  }, '600px');

  /* 3. Cursor-reactive tilt + foil, flip to reveal on hover (fine pointers) or tap/Enter */
  lazy($('[data-fx-cards]'), wrap => {
    $$('.fx-card', wrap).forEach(card => {
      const front = $('.fx-front', card), back = $('.fx-back', card), close = $('.fx-close', card), take = $('.fx-back a', card);
      let dwell = 0, raf = 0, pending = null, pinned = false;
      const set = (open, focus) => {
        card.classList.toggle('open', open);
        front.setAttribute('aria-expanded', String(open));
        back.inert = !open; front.inert = open;
        if (focus) (open ? take : front).focus({ preventScroll: true });
      };
      // A click or tap pins the card open until "Flip back"; hover alone unveils it while the mouse stays.
      front.addEventListener('click', e => { pinned = true; clearTimeout(dwell); set(true, e.detail === 0); });
      close.addEventListener('click', () => { pinned = false; set(false, true); });
      card.addEventListener('keydown', e => { if (e.key === 'Escape' && card.classList.contains('open')) { pinned = false; set(false, true); } });
      // Mouse and pen get hover-to-unveil and tilt; touch uses tap (the click above).
      card.addEventListener('pointerenter', e => { if (e.pointerType === 'touch') return; clearTimeout(dwell); dwell = setTimeout(() => set(true, false), 420); });
      card.addEventListener('pointerleave', e => {
        if (e.pointerType === 'touch') return;
        clearTimeout(dwell); cancelAnimationFrame(raf); raf = 0;
        card.classList.remove('tilting');
        card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg');
        if (!pinned && !card.contains(document.activeElement)) set(false, false);
      });
      if (reduced()) return;
      card.addEventListener('pointermove', e => {
        if (e.pointerType === 'touch') return;
        pending = e;
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          const r = card.getBoundingClientRect(), x = (pending.clientX - r.left) / r.width, y = (pending.clientY - r.top) / r.height;
          card.classList.add('tilting');
          card.style.setProperty('--rx', ((.5 - y) * 14).toFixed(2) + 'deg');
          card.style.setProperty('--ry', ((x - .5) * 18).toFixed(2) + 'deg');
          card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
          card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        });
      });
    });
  });

  /* 4. Sticker toy: drag or click-to-place, keyboard accessible, PNG export via canvas */
  lazy($('[data-fx-toy]'), toy => {
    const stage = $('.toy-stage', toy), layer = $('.toy-layer', toy), baseImg = $('.toy-base', toy), help = $('#toy-help', toy) || $('.toy-help', toy);
    const picks = $$('.toy-pick', toy), tools = $$('.toy-tools [data-act]', toy);
    const NAMES = { surfboard: 'surfboard', laptop: 'laptop', phone: 'phone' };
    let base = 'surfboard', pick = null, sel = null, uid = 0;
    const items = [];
    const say = t => { help.textContent = t; };
    const label = btn => btn.getAttribute('aria-label');
    const choosePick = btn => {
      pick = (pick === btn) ? null : btn;
      picks.forEach(b => b.setAttribute('aria-pressed', String(b === pick)));
      say(pick ? label(pick) + ' selected. Click the ' + NAMES[base] + ' (or press Enter on it) to stick it.' : 'Pick a sticker to start.');
    };
    const refreshTools = () => tools.forEach(b => { if (['rotL', 'rotR', 'up', 'down', 'del'].includes(b.dataset.act)) b.disabled = !sel; else if (b.dataset.act === 'clear') b.disabled = !items.length; });
    const render = it => {
      it.el.style.left = (it.x * 100) + '%'; it.el.style.top = (it.y * 100) + '%';
      it.el.style.width = (it.w * 100) + '%';
      it.el.style.setProperty('--r', it.r + 'deg'); it.el.style.setProperty('--sc', it.sc);
    };
    const select = it => {
      sel = it;
      items.forEach(i => i.el.classList.toggle('sel', i === it));
      refreshTools();
    };
    const place = (btn, x, y, focus) => {
      if (items.length >= 40) { say('That board is full. Remove a few first.'); return; }
      const el = document.createElement('button');
      el.type = 'button'; el.className = 'toy-placed';
      el.setAttribute('aria-label', label(btn) + ' on the ' + NAMES[base] + '. Arrow keys move it, [ and ] rotate, minus and plus resize, Delete removes.');
      const img = btn.querySelector('img').cloneNode(); img.alt = ''; el.appendChild(img);
      const it = { id: ++uid, s: btn.dataset.s, x: clamp(x, .04, .96), y: clamp(y, .04, .96), w: parseFloat(btn.dataset.w) || .28, r: Math.round(Math.random() * 30 - 15), sc: 1, el };
      items.push(it); render(it); layer.appendChild(el); select(it); bindPlaced(it);
      if (focus) el.focus({ preventScroll: true });
      say(label(btn) + ' stuck on. ' + items.length + (items.length === 1 ? ' sticker' : ' stickers') + ' on the board.');
    };
    const remove = it => {
      if (!it) return;
      it.el.remove(); items.splice(items.indexOf(it), 1);
      select(items[items.length - 1] || null);
      say('Sticker removed.');
      (sel ? sel.el : stage).focus({ preventScroll: true });
    };
    const nudge = (it, k) => {
      if (!it) return;
      if (k === 'rotL') it.r -= 10; if (k === 'rotR') it.r += 10;
      if (k === 'up') it.sc = Math.min(2.4, +(it.sc + .1).toFixed(2)); if (k === 'down') it.sc = Math.max(.4, +(it.sc - .1).toFixed(2));
      render(it);
    };
    const frac = e => { const r = stage.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height, r]; };
    function bindPlaced(it) {
      let drag = null;
      it.el.addEventListener('pointerdown', e => {
        e.stopPropagation(); select(it);
        const [fx, fy] = frac(e); drag = { dx: it.x - fx, dy: it.y - fy };
        it.el.setPointerCapture(e.pointerId);
      });
      it.el.addEventListener('pointermove', e => { if (!drag) return; const [fx, fy] = frac(e); it.x = clamp(fx + drag.dx, 0, 1); it.y = clamp(fy + drag.dy, 0, 1); render(it); });
      const end = () => { drag = null; };
      it.el.addEventListener('pointerup', end); it.el.addEventListener('pointercancel', end);
      it.el.addEventListener('focus', () => select(it));
      it.el.addEventListener('keydown', e => {
        const step = e.shiftKey ? .05 : .01, k = e.key;
        if (k.startsWith('Arrow')) {
          e.preventDefault();
          if (k === 'ArrowLeft') it.x -= step; if (k === 'ArrowRight') it.x += step;
          if (k === 'ArrowUp') it.y -= step; if (k === 'ArrowDown') it.y += step;
          it.x = clamp(it.x, 0, 1); it.y = clamp(it.y, 0, 1); render(it);
        } else if (k === '[' || (k.toLowerCase() === 'r' && e.shiftKey)) { e.preventDefault(); nudge(it, 'rotL'); }
        else if (k === ']' || k.toLowerCase() === 'r') { e.preventDefault(); nudge(it, 'rotR'); }
        else if (k === '+' || k === '=') { e.preventDefault(); nudge(it, 'up'); }
        else if (k === '-' || k === '_') { e.preventDefault(); nudge(it, 'down'); }
        else if (k === 'Delete' || k === 'Backspace') { e.preventDefault(); remove(it); }
        else if (k === 'Escape') { e.preventDefault(); stage.focus(); }
      });
    }
    // Palette: click/Enter selects, dragging a sticker drops it straight onto the board.
    picks.forEach(btn => {
      let start = null, ghost = null, dragged = false;
      btn.addEventListener('click', () => { if (dragged) { dragged = false; return; } choosePick(btn); });
      btn.addEventListener('pointerdown', e => { if (e.button) return; start = [e.clientX, e.clientY]; dragged = false; btn.setPointerCapture(e.pointerId); });
      btn.addEventListener('pointermove', e => {
        if (!start) return;
        if (!ghost && Math.hypot(e.clientX - start[0], e.clientY - start[1]) > 6) {
          ghost = btn.querySelector('img').cloneNode(); ghost.className = 'toy-ghost'; ghost.alt = ''; document.body.appendChild(ghost); dragged = true;
        }
        if (ghost) { ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px'; }
      });
      const end = e => {
        if (ghost) {
          ghost.remove(); ghost = null;
          const [fx, fy, r] = frac(e);
          if (e.type === 'pointerup' && fx >= 0 && fx <= 1 && fy >= 0 && fy <= 1 && r.width) place(btn, fx, fy, false);
          else say('Drop it on the ' + NAMES[base] + ' to stick it.');
        }
        start = null;
      };
      btn.addEventListener('pointerup', end); btn.addEventListener('pointercancel', end);
    });
    stage.addEventListener('pointerdown', e => {
      if (e.target.closest('.toy-placed')) return;
      const [fx, fy] = frac(e);
      if (pick) place(pick, fx, fy, false);
      else { select(null); say('Pick a sticker first, then click where you want it.'); }
    });
    stage.addEventListener('keydown', e => {
      if (e.target !== stage) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (pick) place(pick, .5 + (Math.random() - .5) * .2, .5 + (Math.random() - .5) * .2, true);
        else say('Pick a sticker first, then press Enter here to stick it in the middle.');
      }
    });
    $$('.toy-bases [data-base]', toy).forEach(b => b.addEventListener('click', () => {
      base = b.dataset.base;
      $$('.toy-bases [data-base]', toy).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      baseImg.src = 'assets/free/toy/saturday-toy-' + base + '.svg';
      say('Now stickering the ' + NAMES[base] + '.');
    }));
    tools.forEach(b => b.addEventListener('click', () => {
      const k = b.dataset.act;
      if (k === 'export') return exportBoard();
      if (k === 'clear') { items.splice(0).forEach(i => i.el.remove()); select(null); say('Board cleared.'); return; }
      if (k === 'del') return remove(sel);
      nudge(sel, k);
    }));
    const exportBtn = $('[data-act="export"]', toy);
    exportBtn.addEventListener('click', () => exportBoard());
    refreshTools();

    const loadImg = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
    const W = 1200, H = 1500;
    async function draw() {
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      const x = c.getContext('2d');
      const g = x.createRadialGradient(W / 2, H * .38, 60, W / 2, H * .5, H * .8);
      g.addColorStop(0, '#1a2650'); g.addColorStop(1, '#0B1020');
      x.fillStyle = g; x.fillRect(0, 0, W, H);
      const [b, mark] = await Promise.all([loadImg(baseImg.src), loadImg('assets/saturday-wordmark-gold.svg').catch(() => null)]);
      x.drawImage(b, 0, 0, W, H);
      for (const it of items) {
        const img = it.el.querySelector('img');
        if (!img.complete || !img.naturalWidth) await new Promise(r => { img.onload = img.onerror = r; });
        const w = it.w * it.sc * W, h = w * (img.naturalHeight / img.naturalWidth);
        x.save(); x.translate(it.x * W, it.y * H); x.rotate(it.r * Math.PI / 180);
        x.shadowColor = 'rgba(0,0,0,.4)'; x.shadowBlur = 14; x.shadowOffsetY = 6;
        x.drawImage(img, -w / 2, -h / 2, w, h); x.restore();
      }
      if (mark) { const mw = 200, mh = mw * (mark.naturalHeight / mark.naturalWidth || .3); x.globalAlpha = .85; x.drawImage(mark, W - mw - 40, H - mh - 34, mw, mh); x.globalAlpha = 1; }
      x.fillStyle = 'rgba(244,236,216,.55)'; x.font = '600 22px "Space Grotesk", system-ui, sans-serif'; x.fillText('STICK IT ANYWHERE', 40, H - 44);
      return c;
    }
    async function exportBoard() {
      if (!items.length) { say('Stick something on first, then download.'); return; }
      say('Pressing your board…');
      try {
        const c = await draw();
        c.toBlob(blob => {
          const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'saturday-board-' + base + '.png';
          document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 800);
          say('Saved saturday-board-' + base + '.png (' + Math.round(blob.size / 1024) + ' KB).');
        }, 'image/png');
      } catch (e) { say('Could not make the PNG in this browser. Try another one.'); }
    }
    window.SaturdayFX = Object.assign(window.SaturdayFX || {}, { boardDataURL: async () => (await draw()).toDataURL('image/png'), boardCount: () => items.length });
  });

  /* 5. Live mini QR teaser */
  lazy($('[data-fx-qrt]'), box => {
    const input = $('.qrt-input', box), stage = $('.qrt-stage', box), layers = [$('.qrt-a', box), $('.qrt-b', box)];
    const styleBtn = $('[data-qrt-style]', box), link = $('[data-qrt-link]', box), baseHref = link.getAttribute('href');
    const ORDER = ['holo', 'navy', 'gold', 'teal'];
    let style = 'holo', showing = 0, t = 0, last = '';
    const loadScript = src => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
    const ready = window.SaturdayQR ? Promise.resolve() : (window.qrcode ? Promise.resolve() : loadScript('vendor/qrcode-generator/qrcode.js')).then(() => window.SaturdayQR || loadScript('js/saturday-qr.js'));
    const value = () => (input.value.trim() || window.SaturdayQR.DEFAULT_URL).slice(0, 900);
    const draw = force => {
      const v = value();
      if (!force && v + style === last) return;
      last = v + style;
      let svg;
      try { svg = window.SaturdayQR.svg(v, { style, mark: true }); } catch (e) { return; }
      const img = new Image(); img.alt = ''; img.width = img.height = 280; img.decoding = 'async';
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      const next = 1 - showing;
      layers[next].replaceChildren(img);
      stage.classList.toggle('swap', next === 1); showing = next;
      stage.setAttribute('aria-label', 'QR code preview for ' + v);
      if (!reduced()) { stage.classList.remove('scan'); void stage.offsetWidth; stage.classList.add('scan'); }
      const q = '?url=' + encodeURIComponent(v) + '&style=' + style;
      link.setAttribute('href', baseHref.startsWith('#') ? baseHref : baseHref.replace('#', q + '#'));
    };
    ready.then(() => {
      if (!window.SaturdayQR) return;
      draw(true);
      input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => draw(false), 140); });
      styleBtn.addEventListener('click', () => {
        style = ORDER[(ORDER.indexOf(style) + 1) % ORDER.length];
        styleBtn.textContent = 'Style: ' + window.SaturdayQR.STYLES[style].name; draw(true);
      });
      // On the Free Drop page the full maker is right here: hand the link over without a reload.
      link.addEventListener('click', () => {
        const full = document.getElementById('qrUrl');
        if (!full) return;
        full.value = value(); const r = document.querySelector('input[name="qrStyle"][value="' + style + '"]'); if (r) r.checked = true;
        full.dispatchEvent(new Event('input', { bubbles: true }));
      });
    }).catch(() => { stage.setAttribute('aria-label', 'QR preview could not load'); });
  });

  /* 6. Starter Pack unboxing */
  lazy($('[data-fx-pack]'), pack => {
    const box = $('.pack-box', pack), cta = $('.pack-cta', pack), fan = $('.pack-fan', pack), word = $('.pack-base b', pack), dl = $('.pack-cta a', pack);
    let timer = 0;
    fan.setAttribute('aria-hidden', 'true');
    const open = kb => {
      if (pack.classList.contains('open')) { (kb ? dl : box).focus({ preventScroll: true }); return; }
      pack.classList.add('open'); box.setAttribute('aria-expanded', 'true'); fan.removeAttribute('aria-hidden'); word.textContent = 'Inside ↑';
      if (!reduced()) { pack.classList.add('burst'); setTimeout(() => pack.classList.remove('burst'), 1200); }
      clearTimeout(timer);
      timer = setTimeout(() => { cta.hidden = false; if (kb) dl.focus({ preventScroll: true }); }, reduced() ? 0 : 700);
    };
    box.addEventListener('click', e => open(e.detail === 0));
    $('[data-repack]', pack).addEventListener('click', () => {
      clearTimeout(timer);
      pack.classList.remove('open', 'burst'); box.setAttribute('aria-expanded', 'false'); fan.setAttribute('aria-hidden', 'true'); word.textContent = 'Open me';
      cta.hidden = true; box.focus({ preventScroll: true });
    });
  });
})();
