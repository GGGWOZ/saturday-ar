/* Saturday brand site — tiny, dependency-free interactions */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = s => document.querySelector(s);

  /* nav goes solid after the hero */
  const nav = $('#nav');
  const onScroll = () => nav && nav.classList.toggle('solid', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

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

  /* waitlist (front-end only: nothing is sent) */
  const f = $('#wl'), input = $('#email'), msg = $('#wl-msg'), box = $('#list');
  const KEY = 'saturday-waitlist-preview';
  if (f) {
  if (localStorage.getItem(KEY)) box.classList.add('ok');
  f.addEventListener('submit', e => {
    e.preventDefault();
    const val = input.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)) {
      input.setAttribute('aria-invalid', 'true'); msg.className = 'msg err';
      msg.textContent = "That doesn't look like an email address from this planet. Try again?";
      input.focus(); return;
    }
    input.removeAttribute('aria-invalid'); msg.textContent = ''; msg.className = 'msg';
    try { localStorage.setItem(KEY, '1'); } catch (_) {}
    box.classList.add('ok');
  });
  }

  const yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();
})();
