// saturday-ar-experience.js — Saturday AR Experience
  // Set this to the live Shopify product URL (e.g. https://YOURSTORE.com/products/hologram-hemp-shirt)
  const SHOP_URL = '';
  const shop = document.getElementById('shop');
  if (SHOP_URL) shop.href = SHOP_URL; else { shop.textContent = 'Shop · coming soon'; shop.removeAttribute('href'); shop.style.opacity = .55; }
  const mv = document.getElementById('mv');
  mv.addEventListener('load', async () => {
    await new Promise(r => setTimeout(r, 300));
    if (!mv.canActivateAR) document.body.classList.add('no-ar');
  });
  mv.addEventListener('ar-status', e => { if (e.detail.status === 'failed') document.body.classList.add('no-ar'); });
