/* ============================================================================================
   Saturday for the Win: CHECKOUT CONFIG. The ONE file George edits to switch payments on.
   ============================================================================================
   Until `enabled` is true AND the chosen provider has a real ID/link for a product + size,
   the site does NOT take payment: every Buy button falls back to "Pre-order: join the list".

   Prices shown on the site live in js/saturday-prices.js (A$, GST included). Make sure the
   prices you set in Shopify / Stripe match them (tees A$59, sets A$115).

   OPTION A (recommended, George already has a Shopify store): Shopify cart permalinks.
     No API token needed. A multi-item cart on this site is sent to Shopify checkout as
     https://<domain>/cart/<variantId>:<qty>,<variantId>:<qty>
     1. Shopify admin > Products: create the 3 tees + 3 sets, option "Size" = S, M, L, XL, XXL,
        prices A$59 / A$115, status Active, available on the "Online Store" sales channel.
     2. Settings > Payments: set up Shopify Payments (or another gateway) yourself.
     3. Pick a paid plan and remove the storefront password (Online Store > Preferences),
        otherwise checkout links stop at the password page.
     4. Copy each variant's numeric ID: open the product, click a size variant, the URL ends
        in /variants/<NUMBER>. Paste below in place of 'TODO'.
     5. Set provider: 'shopify', enabled: true. Commit + push. Test one order end to end.

   OPTION B: Stripe Payment Links (one link per product + size, no backend needed).
     1. Stripe Dashboard > Payment Links > New: one link per product/size (e.g. "Alley Tee - M",
        A$59). Turn on "Let customers adjust quantity", "Collect customers' addresses"
        (shipping, Australia), and set the after-payment redirect to
        https://saturdayforthewin.com/cart.html?paid=1
     2. Paste each https://buy.stripe.com/... URL below in place of 'TODO'.
     3. Set provider: 'stripe', enabled: true. Note: a Stripe link pays for ONE product per
        checkout, so a cart with several different items shows one "Pay" button per item.

   Testing without payments: open any page with ?checkout=preview to see the cart flow.
   Preview mode never sends anyone to a payment page.
   ============================================================================================ */
window.SATURDAY_CHECKOUT = {
  enabled: false,            // TODO(George): set to true once the provider below is fully set up
  provider: 'shopify',       // 'shopify' | 'stripe'
  sizes: ['S', 'M', 'L', 'XL', 'XXL'],   // TODO(George): confirm the size run with the blank supplier

  shopify: {
    domain: 'n0vavm-p8.myshopify.com',   // TODO(George): confirm (or the new "Saturday for the Win" store's xxxx.myshopify.com)
    variants: {                          // numeric variant IDs per size
      'tee-alley':   { S: 'TODO', M: 'TODO', L: 'TODO', XL: 'TODO', XXL: 'TODO' },
      'tee-admiral': { S: 'TODO', M: 'TODO', L: 'TODO', XL: 'TODO', XXL: 'TODO' },
      'tee-ozzie':   { S: 'TODO', M: 'TODO', L: 'TODO', XL: 'TODO', XXL: 'TODO' },
      'set-alley':   { S: 'TODO', M: 'TODO', L: 'TODO', XL: 'TODO', XXL: 'TODO' },
      'set-admiral': { S: 'TODO', M: 'TODO', L: 'TODO', XL: 'TODO', XXL: 'TODO' },
      'set-ozzie':   { S: 'TODO', M: 'TODO', L: 'TODO', XL: 'TODO', XXL: 'TODO' }
    }
  },

  stripe: {
    links: {                             // https://buy.stripe.com/... per size
      'tee-alley':   { S: 'TODO', M: 'TODO', L: 'TODO', XL: 'TODO', XXL: 'TODO' },
      'tee-admiral': { S: 'TODO', M: 'TODO', L: 'TODO', XL: 'TODO', XXL: 'TODO' },
      'tee-ozzie':   { S: 'TODO', M: 'TODO', L: 'TODO', XL: 'TODO', XXL: 'TODO' },
      'set-alley':   { S: 'TODO', M: 'TODO', L: 'TODO', XL: 'TODO', XXL: 'TODO' },
      'set-admiral': { S: 'TODO', M: 'TODO', L: 'TODO', XL: 'TODO', XXL: 'TODO' },
      'set-ozzie':   { S: 'TODO', M: 'TODO', L: 'TODO', XL: 'TODO', XXL: 'TODO' }
    }
  }
};
