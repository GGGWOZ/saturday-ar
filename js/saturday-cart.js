/* Saturday for the Win: sizes, cart and checkout hand-off. No backend: the cart lives in localStorage and checkout
   is handed to the provider set in js/saturday-checkout-config.js (Shopify cart permalink or Stripe Payment Links).
   Until that file is configured, nothing here takes or pretends to take payment: buy buttons become
   "Pre-order: join the list". Preview the cart flow with ?checkout=preview (never sends anyone to a payment page). */
(() => {
  const CFG = window.SATURDAY_CHECKOUT || {}, PR = (window.SATURDAY_PRICES || { products: {} }), P = PR.products, CUR = PR.currency || 'A$';
  const SIZES = CFG.sizes || ['S', 'M', 'L', 'XL', 'XXL'];
  const SELL = ['tee-alley', 'tee-admiral', 'tee-ozzie', 'set-alley', 'set-admiral', 'set-ozzie'];
  const IMG = { 'tee-alley': 'saturday-alley-tee-white', 'tee-admiral': 'saturday-admiral-e-bird-tee-white', 'tee-ozzie': 'saturday-king-ozzie-tee-white' };
  const img = id => 'assets/shop/' + (IMG[id] || IMG['tee-' + id.split('-')[1]]) + '.webp';
  const page = id => 'tee-' + id.split('-')[1] + '.html';
  const KEY = 'sftw-cart-v1';
  let preview = false;
  try { if (/[?&]checkout=preview\b/.test(location.search)) sessionStorage.setItem('sftw-preview', '1'); if (/[?&]checkout=off\b/.test(location.search)) sessionStorage.removeItem('sftw-preview'); preview = sessionStorage.getItem('sftw-preview') === '1'; } catch (_) {}
  const prov = CFG.provider;
  const ok = v => typeof v === 'string' && v && !/^TODO/i.test(v);
  const ref = (id, size) => {
    if (!CFG.enabled) return null;
    if (prov === 'shopify') { const v = (((CFG.shopify || {}).variants || {})[id] || {})[size]; return ok(v) && /^\d+$/.test(v) && ok((CFG.shopify || {}).domain) ? v : null; }
    if (prov === 'stripe') { const v = (((CFG.stripe || {}).links || {})[id] || {})[size]; return ok(v) && /^https:\/\/(buy|checkout)\.stripe\.com\//.test(v) ? v : null; }
    return null;
  };
  const live = id => SIZES.some(s => ref(id, s));            // product purchasable in at least one size
  const anyLive = SELL.some(live);
  const cartOn = anyLive || preview;
  const money = n => CUR + (Math.round(n * 100) / 100).toString();
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const load = () => { try { const c = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(c) ? c.filter(l => P[l.id] && SIZES.includes(l.size) && l.qty > 0) : []; } catch (_) { return []; } };
  const save = c => { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (_) {} render(); };
  const add = (id, size, qty) => { const c = load(), l = c.find(x => x.id === id && x.size === size); if (l) l.qty = Math.min(20, l.qty + qty); else c.push({ id, size, qty }); save(c); };
  const count = () => load().reduce((s, l) => s + l.qty, 0);
  const listHref = document.getElementById('wl') ? '#list' : 'index.html#list';
  document.querySelectorAll('[data-when-off]').forEach(e => { e.hidden = anyLive; });
  document.querySelectorAll('[data-when-live]').forEach(e => { e.hidden = !anyLive; });
  window.SATURDAY_CART = { load, add, live, ref, preview, anyLive };

  /* header cart link */
  const nav = document.querySelector('#nav .wrap');
  let cl;
  if (nav) {
    cl = document.createElement('a'); cl.className = 'cart-link'; cl.href = 'cart.html';
    cl.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 7h12l-1 13H7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg><span class="sr">Cart, </span><b data-cart-count>0</b><span class="sr"> items</span>';
    const ghost = nav.querySelector('.btn-ghost'); nav.insertBefore(cl, ghost || null);
  }

  /* buy boxes: <div class="buy" data-buy="tee-alley"> (no-JS fallback content inside is replaced) */
  document.querySelectorAll('[data-buy]').forEach((box, bi) => {
    const id = box.dataset.buy; if (!P[id]) return;
    const isLive = live(id), canCart = isLive || preview;
    const name = 'sz-' + id + '-' + bi;
    box.classList.add('buy-on');
    box.innerHTML =
      '<fieldset class="sizes"><legend>Size' + (id.startsWith('set') ? ' (tee)' : '') + ' <a class="size-guide" href="policies.html#sizes">Size notes</a></legend>' +
      SIZES.map((s, i) => '<label class="sz"><input type="radio" name="' + name + '" value="' + s + '"' + (i === 2 ? ' checked' : '') + '><span>' + s + '</span></label>').join('') + '</fieldset>' +
      (canCart
        ? '<div class="buy-row"><label class="qty"><span class="sr">Quantity</span><button type="button" data-q="-1" aria-label="One less">−</button><input type="number" min="1" max="20" value="1" inputmode="numeric" aria-label="Quantity"><button type="button" data-q="1" aria-label="One more">+</button></label>' +
          '<button class="btn btn-holo" type="button" data-add>Add to cart · ' + money(P[id].price) + '</button></div>' +
          '<p class="buy-note" role="status" aria-live="polite">' + (isLive ? 'Secure checkout is handled by ' + (prov === 'shopify' ? 'Shopify' : 'Stripe') + '. You’ll see the final total, delivery cost and terms before you pay.' : '<b>Preview only.</b> Payment isn’t connected, so checkout can’t be completed yet.') + '</p>'
        : '<div class="buy-row"><a class="btn btn-holo" href="' + listHref + '" data-preorder>Pre-order: join the list</a></div>' +
          '<p class="buy-note"><b>Checkout isn’t open yet, and no payment is taken here.</b> Sizes run S to XXL. Join the free list and we’ll email you when the ' + esc(P[id].name) + ' goes on sale.</p>');
    const q = box.querySelector('input[type=number]');
    box.querySelectorAll('[data-q]').forEach(b => b.addEventListener('click', () => { q.value = Math.max(1, Math.min(20, (+q.value || 1) + +b.dataset.q)); }));
    const a = box.querySelector('[data-add]');
    if (a) a.addEventListener('click', () => {
      const size = (box.querySelector('input[name="' + name + '"]:checked') || {}).value;
      add(id, size, Math.max(1, Math.min(20, +q.value || 1)));
      const n = box.querySelector('.buy-note');
      n.innerHTML = 'Added: ' + esc(P[id].name) + ', size ' + esc(size) + '. <a href="cart.html">View cart and check out →</a>';
    });
  });

  /* cart page */
  const cv = document.getElementById('cart');
  const checkout = c => {
    if (!anyLive) return;
    if (prov === 'shopify') {
      const items = c.map(l => ref(l.id, l.size) + ':' + l.qty);
      location.href = 'https://' + CFG.shopify.domain.replace(/^https?:\/\//, '').replace(/\/$/, '') + '/cart/' + items.join(',');
    }
  };
  function render() {
    const n = count();
    document.querySelectorAll('[data-cart-count]').forEach(el => { el.textContent = n; });
    if (cl) cl.hidden = !(cartOn || n);
    if (!cv) return;
    const c = load();
    if (/[?&]paid=1\b/.test(location.search) && c.length) { try { localStorage.removeItem(KEY); } catch (_) {} history.replaceState(null, '', 'cart.html'); cv.innerHTML = '<p class="cart-empty"><b>Thanks for your order.</b> Your receipt comes from the payment provider by email.</p>'; return; }
    if (!c.length) { cv.innerHTML = '<p class="cart-empty">Your cart is empty. <a href="shop.html">Pick a tee in the Kit Room →</a></p>'; return; }
    const tot = c.reduce((s, l) => s + P[l.id].price * l.qty, 0);
    const unbuyable = c.filter(l => !ref(l.id, l.size));
    let foot;
    if (!anyLive) foot = '<button class="btn btn-holo" type="button" disabled>Checkout isn’t open yet</button><a class="btn btn-ghost" href="#list">Pre-order: join the list</a><p class="fine">' + (preview ? '<b>Preview mode.</b> ' : '') + 'Payment isn’t connected, so nothing can be paid for here. Join the free list and we’ll email you when checkout opens.</p>';
    else if (prov === 'stripe') foot = (c.length === 1 && ref(c[0].id, c[0].size)
        ? '<a class="btn btn-holo" href="' + esc(ref(c[0].id, c[0].size)) + '">Check out securely (Stripe)</a>' + (c[0].qty > 1 ? '<p class="fine">Set the quantity to ' + c[0].qty + ' on the Stripe page.</p>' : '')
        : '<p class="fine">Stripe takes one product per checkout, so each item has its own Pay button above.</p>') + '<p class="fine">You’ll see the final total, delivery cost and terms before you pay.</p>';
    else foot = (unbuyable.length ? '<p class="fine err">Some items aren’t on sale yet. Remove them to check out.</p>' : '') + '<button class="btn btn-holo" type="button" data-checkout' + (unbuyable.length ? ' disabled' : '') + '>Check out securely (Shopify)</button><p class="fine">You’ll see the final total, delivery cost and terms on the Shopify checkout before you pay.</p>';
    cv.innerHTML = '<ul class="cart-lines">' + c.map((l, i) => {
      const r = ref(l.id, l.size);
      return '<li><a href="' + page(l.id) + '"><img src="' + img(l.id) + '" alt="" width="90" height="120"></a><div class="cl-tx"><b>' + esc(P[l.id].name) + '</b><span>Size ' + esc(l.size) + ' · ' + money(P[l.id].price) + ' each</span>' +
        (P[l.id].items ? '<small>Tee + Alley Dad Cap + Holo Sticker Pack</small>' : '') +
        (prov === 'stripe' && anyLive && c.length > 1 && r ? '<a class="btn btn-sm btn-holo" href="' + esc(r) + '">Pay for this item</a>' : '') + '</div>' +
        '<div class="qty"><button type="button" data-l="' + i + '" data-d="-1" aria-label="One less">−</button><output>' + l.qty + '</output><button type="button" data-l="' + i + '" data-d="1" aria-label="One more">+</button></div>' +
        '<span class="cl-pr">' + money(P[l.id].price * l.qty) + '</span><button class="linkish" type="button" data-rm="' + i + '">Remove</button></li>';
    }).join('') + '</ul><div class="cart-tot"><span>Subtotal (A$, GST included)</span><b>' + money(tot) + '</b></div><p class="fine">Delivery is calculated at checkout.</p><div class="cart-foot">' + foot + '</div>';
    cv.querySelectorAll('[data-d]').forEach(b => b.addEventListener('click', () => { const c2 = load(), l = c2[+b.dataset.l]; l.qty = Math.max(0, Math.min(20, l.qty + +b.dataset.d)); save(c2.filter(x => x.qty > 0)); }));
    cv.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => { const c2 = load(); c2.splice(+b.dataset.rm, 1); save(c2); }));
    const co = cv.querySelector('[data-checkout]'); if (co) co.addEventListener('click', () => checkout(load()));
  }
  render();
  addEventListener('storage', e => { if (e.key === KEY) render(); });
})();
