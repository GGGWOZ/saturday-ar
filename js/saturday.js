/* Saturday brand site — tiny, dependency-free interactions */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = s => document.querySelector(s);

  /* nav goes solid after the hero */
  const nav = $('#nav');
  const onScroll = () => nav && nav.classList.toggle('solid', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* mobile menu: the main nav folds into a toggle under 1100px */
  const navList = nav && nav.querySelector('nav[aria-label="Main"]');
  if (navList) {
    const ul = navList.querySelector('ul'); ul.id = ul.id || 'nav-links';
    const mb = document.createElement('button');
    mb.type = 'button'; mb.className = 'menu-btn'; mb.setAttribute('aria-controls', ul.id); mb.setAttribute('aria-expanded', 'false');
    mb.innerHTML = '<span class="sr">Menu</span><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path class="l1" d="M4 7h16"/><path class="l2" d="M4 12h16"/><path class="l3" d="M4 17h16"/></svg>';
    navList.after(mb);
    const set = open => { nav.classList.toggle('open', open); mb.setAttribute('aria-expanded', String(open)); };
    mb.addEventListener('click', () => set(!nav.classList.contains('open')));
    ul.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { set(false); mb.focus(); } });
    matchMedia('(min-width:1100px)').addEventListener('change', e => { if (e.matches) set(false); });
  }

  /* Shop dropdown (desktop): opens on hover, keyboard focus or the toggle; aria-expanded mirrors the state */
  const sub = nav && nav.querySelector('.has-sub');
  if (sub) {
    const tg = sub.querySelector('.sub-toggle');
    let pinned = false, dismissed = false;
    const sync = () => {
      const open = !dismissed && (pinned || sub.matches(':hover') || sub.matches(':focus-within'));
      sub.classList.toggle('sub-open', open); sub.classList.toggle('sub-dismissed', dismissed); tg.setAttribute('aria-expanded', String(open));
    };
    tg.addEventListener('click', () => { dismissed = false; pinned = !pinned; sync(); });
    sub.addEventListener('mouseenter', () => { dismissed = false; sync(); });
    sub.addEventListener('mouseleave', () => { pinned = false; sync(); });
    sub.addEventListener('focusin', sync);
    sub.addEventListener('focusout', () => setTimeout(() => { if (!sub.matches(':focus-within')) { pinned = false; dismissed = false; } sync(); }, 0));
    sub.addEventListener('keydown', e => {
      if (e.key === 'Escape') { pinned = false; dismissed = true; e.stopPropagation(); const a = sub.querySelector('a'); if (document.activeElement !== a && sub.contains(document.activeElement)) a.focus(); sync(); }
      else if (e.key === 'ArrowDown' && e.target === tg) { e.preventDefault(); dismissed = false; pinned = true; sync(); sub.querySelector('.sub a').focus(); }
    });
  }

  /* star field */
  const c = $('#stars'), ctx = c && c.getContext('2d');
  if (c) {
  let W, H, stars = [], raf;
  const size = () => {
    const d = Math.min(devicePixelRatio || 1, 2);
    W = c.width = innerWidth * d; H = c.height = innerHeight * d;
    const n = Math.round(Math.min(220, innerWidth * innerHeight / 7000));
    stars = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, r: (Math.random() * 1.2 + .3) * d,
      p: Math.random() * 6.28, s: .4 + Math.random() * 1.2, g: Math.random() < .12 }));
  };
  const draw = t => {
    ctx.clearRect(0, 0, W, H);
    const off = reduce ? 0 : scrollY * .15;
    for (const s of stars) {
      const a = reduce ? .7 : .35 + .65 * Math.abs(Math.sin(s.p + t * .001 * s.s));
      ctx.fillStyle = s.g ? `rgba(243,213,138,${a})` : `rgba(232,251,250,${a})`;
      ctx.beginPath(); ctx.arc(s.x, ((s.y - off * s.s) % H + H) % H, s.r, 0, 6.28); ctx.fill();
    }
    if (!reduce) raf = requestAnimationFrame(draw);
  };
  size(); draw(0);
  addEventListener('resize', () => { size(); if (reduce) draw(0); });
  document.addEventListener('visibilitychange', () => { if (reduce) return; if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(draw); });
  }

  /* cursor-reactive glow in the hero */
  const hero = $('.hero');
  if (hero && !reduce && matchMedia('(pointer:fine)').matches) {
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      hero.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  }

  /* reveal on scroll */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.rv').forEach(el => io.observe(el));

  /* colour-field video: play only while visible, never under reduced motion */
  const v = $('#cf');
  if (v && !reduce) {
    new IntersectionObserver(([e]) => { e.isIntersecting ? v.play().catch(() => {}) : v.pause(); }, { threshold: .25 }).observe(v);
  }

  /* hologram: lazy-load the model only when summoned */
  const mv = $('#mv'), stage = $('#stage'), btn = $('#summon'), chips = [...document.querySelectorAll('.chip')];
  const label = $('#spec-label'), status = $('#spec-status');
  if (mv && btn) {
  let live = false, pick = chips[0];
  const load = chip => {
    mv.setAttribute('alt', chip.dataset.alt);
    mv.setAttribute('ios-src', chip.dataset.ios);
    mv.setAttribute('animation-name', chip.dataset.anim);
    mv.setAttribute('camera-orbit', chip.dataset.anim === 'SuaveIdle' ? '25deg 80deg 105%' : '0deg 78deg 118%');
    mv.setAttribute('src', chip.dataset.src);
    status.textContent = '◌ Beaming…';
  };
  mv.addEventListener('load', () => { status.textContent = '● Live'; status.style.color = 'var(--teal)'; if (!reduce) mv.play(); else mv.pause && mv.pause(); });
  btn.addEventListener('click', () => {
    if (!live) { live = true; stage.classList.add('live'); load(pick); btn.querySelector('span').textContent = 'Spin him around'; stage.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); }
    else { mv.setAttribute('camera-orbit', `${(Math.random() * 360) | 0}deg 78deg auto`); }
  });
  chips.forEach(ch => ch.addEventListener('click', () => {
    chips.forEach(x => x.setAttribute('aria-pressed', String(x === ch)));
    pick = ch; label.textContent = ch.dataset.label;
    if (live) load(ch);
  }));
  if (reduce) mv.removeAttribute('auto-rotate');
  }

  /* waitlist: the address is sealed in the browser (RSA-OAEP + AES-GCM) with Saturday's public key, then
     posted to a keyless ntfy.sh relay topic. An hourly job in a private GitHub repo decrypts new sign-ups and
     saves them to subscribers.csv. Only the private key (a GitHub Actions secret) can read an address. */
  const f = $('#wl'), input = $('#email'), msg = $('#wl-msg'), box = $('#list');
  const LIST = { relay: 'https://ntfy.sh/saturday-list-5ea91aee5481c389ed0e111d', key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqXRBk7rSuOmNomhrmLXa35X2InwvRlOUHu12DjvcGCuV367ZBgEKc7ufGZerhLZ/ijtFMSoxuM2nD8tVffVsb8VUKNoHa4MYMj2lGyC8rJrqLMPvyz9iCPpikDaLKSmIVFIo0n1EzC9j6gPvUuafvtHR2/vrwro8iDRVB2WK30GodLqi4pe0AnZBFYmmOv6tPxxJ7R0dmasUfy8WEdFW0syEOyVowmwqi2tJOD4PAA4WPrglanXtUbH1rCeRrEKh1M/rAaffhKH+RkIFWZkSXgDwPNoVhWXXBOwSdQ5X8xuszYwXm+BpL/sC8svhSE7BgFxUsxM8SVqs50y8dwiVyQIDAQAB' };
  const OK_KEY = 'saturday-list-joined';
  if (f && input && box) {
    const btn = f.querySelector('button[type="submit"]'), label = btn ? btn.textContent : '';
    const hp = f.querySelector('input[name="website"]');
    const say = (t, err) => { msg.className = 'msg' + (err ? ' err' : ' ok'); msg.textContent = t; };
    const b64 = buf => { let s = ''; new Uint8Array(buf).forEach(c => { s += String.fromCharCode(c); }); return btoa(s); };
    const seal = async data => {
      const sub = crypto.subtle;
      const pub = await sub.importKey('spki', Uint8Array.from(atob(LIST.key), c => c.charCodeAt(0)), { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt']);
      const k = await sub.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt']);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const ct = await sub.encrypt({ name: 'AES-GCM', iv }, k, new TextEncoder().encode(JSON.stringify(data)));
      const wk = await sub.encrypt({ name: 'RSA-OAEP' }, pub, await sub.exportKey('raw', k));
      return btoa(JSON.stringify({ v: 1, k: b64(wk), iv: b64(iv), ct: b64(ct) }));
    };
    const done = () => { box.classList.add('ok'); try { localStorage.setItem(OK_KEY, '1'); } catch (_) {} };
    f.addEventListener('submit', async e => {
      e.preventDefault();
      const val = input.value.trim();
      if (!/^[^\s@,"]+@[^\s@,"]+\.[^\s@,"]{2,}$/.test(val) || val.length > 254) {
        input.setAttribute('aria-invalid', 'true');
        say("That doesn't look like an email address from this planet. Try again?", true);
        input.focus(); return;
      }
      input.removeAttribute('aria-invalid');
      if (hp && hp.value) { done(); return; }            // bots fill the hidden field; humans never see it
      if (!(window.crypto && crypto.subtle && window.fetch)) { say("This browser can't send the signal securely. Try an up-to-date browser?", true); return; }
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      f.setAttribute('aria-busy', 'true'); say('Sending your signal…');
      const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 15000);
      try {
        const body = await seal({ email: val, src: location.pathname, ts: Date.now() });
        const r = await fetch(LIST.relay, { method: 'POST', body, signal: ctl.signal });
        const j = r.ok ? await r.json().catch(() => null) : null;
        if (!j || !j.id) throw new Error('relay ' + r.status);
        msg.textContent = ''; msg.className = 'msg'; done();
      } catch (err) {
        say(err && err.name === 'AbortError' ? 'The signal timed out. Check your connection and try again.' : "Couldn't reach the ship just now. Your email wasn't saved. Please try again in a minute.", true);
      } finally {
        clearTimeout(t); f.removeAttribute('aria-busy');
        if (btn) { btn.disabled = false; btn.textContent = label; }
      }
    });
  }

  const yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();
})();
