/* Saturday prices: the ONE place to change them (Australian dollars, GST included).
   Checkout is NOT connected yet, so nothing on the site takes payment. Every "buy" action is the
   pre-order list (the existing encrypted sign-up form). When checkout is wired, add a checkout URL per product
   here and switch the buttons in the pages. Any element with data-price="<id>" shows that product's price.
   Prices are also written into the HTML as a no-JS fallback. */
window.SATURDAY_PRICES = {
  currency: 'A$',
  products: {
      "tee-alley": {
          "name": "Alley Tee",
          "price": 59
      },
      "tee-001": {
          "name": "001 Tee",
          "price": 59
      },
      "tee-001-qr": {
          "name": "001 QR Tee",
          "price": 59
      },
      "logo-tee": {
          "name": "Logo Tee",
          "price": 49
      },
      "logo-hoodie": {
          "name": "Logo Hoodie",
          "price": 99
      },
      "hat-alley-dad-cap": {
          "name": "Alley Dad Cap",
          "price": 55
      },
      "hat-001-snapback": {
          "name": "001 Snapback",
          "price": 59
      },
      "hat-holo-bucket": {
          "name": "Holo Bucket Hat",
          "price": 69
      },
      "hat-signal-beanie": {
          "name": "Signal Beanie",
          "price": 45
      },
      "hemp-trucker": {
          "name": "Hemp Trucker",
          "price": 59
      },
      "stickers-holo-pack": {
          "name": "Holo Sticker Pack",
          "price": 12
      },
      "tote": {
          "name": "Canvas Tote",
          "price": 45
      },
      "beach-towel": {
          "name": "Surf-to-Snow Towel",
          "price": 79
      },
      "toy-holo-alley": {
          "name": "Holo Alley",
          "price": 24
      },
      "toy-tux-alley": {
          "name": "Tux Alley",
          "price": 24
      },
      "toy-night-signal": {
          "name": "Night Signal",
          "price": 24
      },
      "toy-admiral": {
          "name": "Admiral E. Bird",
          "price": 24
      },
      "toy-ozzie": {
          "name": "King Ozzie",
          "price": 24
      },
      "keyring-alley": {
          "name": "Alley Keyring",
          "price": 17
      },
      "pin-buzz": {
          "name": "Buzz Pin",
          "price": 15
      },
      "bundle-alley-holo": {
          "name": "Alley Tee + Holo Alley",
          "price": 79,
          "items": [
              "tee-alley",
              "toy-holo-alley"
          ]
      },
      "bundle-001-tux": {
          "name": "001 Tee + Tux Alley",
          "price": 79,
          "items": [
              "tee-001",
              "toy-tux-alley"
          ]
      },
      "bundle-001qr-night": {
          "name": "001 QR Tee + Night Signal",
          "price": 79,
          "items": [
              "tee-001-qr",
              "toy-night-signal"
          ]
      },
      "bundle-b1": {
          "name": "Signal 001 Tee + Alley",
          "price": 79,
          "separate": 83
      },
      "bundle-b2": {
          "name": "Signal Starter",
          "price": 69,
          "separate": 78
      },
      "bundle-b3": {
          "name": "Surf-to-Snow",
          "price": 159,
          "separate": 182
      },
      "bundle-b4": {
          "name": "Crew Gift Box",
          "price": 149,
          "separate": 182
      },
      "bundle-b5": {
          "name": "Signal 002 Peak Pack",
          "price": 119,
          "separate": 136
      },
      "bundle-b6": {
          "name": "Beach-to-Peak Towel Pack",
          "price": 105,
          "separate": 115
      },
      "bundle-b7": {
          "name": "Saturday Ring Trio",
          "price": 85,
          "separate": 99
      }
  }
};
(() => {
  const C = window.SATURDAY_PRICES, P = C.products, money = n => C.currency + n;
  const sep = id => P[id].separate || (P[id].items || []).reduce((s, k) => s + P[k].price, 0);
  const from = pre => Math.min(...Object.keys(P).filter(k => k.startsWith(pre)).map(k => P[k].price));
  document.querySelectorAll('[data-price]').forEach(el => { const p = P[el.dataset.price]; if (p) el.textContent = money(p.price); });
  document.querySelectorAll('[data-price-from]').forEach(el => { el.textContent = 'From ' + money(from(el.dataset.priceFrom)); });
  document.querySelectorAll('[data-price-separate]').forEach(el => { const id = el.dataset.priceSeparate; if (P[id]) el.textContent = money(sep(id)); });
  document.querySelectorAll('[data-price-save]').forEach(el => { const id = el.dataset.priceSave; if (P[id]) el.textContent = money(sep(id) - P[id].price); });
})();
