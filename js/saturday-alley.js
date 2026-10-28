/* Saturday — Alley, the Saturday alien. The scannable mark: an elongated alien head with glossy
   gold-rimmed almond eyes, a hologram-teal rim glow and the gold Saturn ring.
   One place for the name: change CREATURE_NAME and every page that uses data-alley-name follows. */
(() => {
  const CREATURE_NAME = 'Alley';
  const CREATURE_TITLE = 'The Saturday Alien';

  /* svg({ id, cls, shadow, base, holo }) -> markup string. viewBox 0 0 400 480.
     Groups: .al-ring-back / .al-ring (Saturn ring behind / in front of the head), .al-head,
     .al-blink (eyes), .al-glint (eye highlights), .al-glint-star, .al-board (hologram pad under the head). */
  function svg(o = {}) {
    const p = (o.id || 'al') + '-';
    const u = n => `url(#${p}${n})`;
    const HEAD = 'M200 50C288 50 342 110 342 196C342 266 300 320 254 368C236 390 218 406 200 406C182 406 164 390 146 368C100 320 58 266 58 196C58 110 112 50 200 50Z';
    const EYE = 'M-62 0C-42 -38 34 -40 62 0C38 36 -40 38 -62 0Z';
    const EYE_IN = 'M-53 0C-36 -31 28 -33 53 0C31 30 -34 31 -53 0Z';
    const eye = (x, y, r, flip) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(1.1)"><g class="al-blink">
        <path d="${EYE}" fill="#05070f"/>
        <path d="${EYE}" fill="none" stroke="${u('gold')}" stroke-width="7"/>
        <path d="${EYE_IN}" fill="${u('eye')}"/>
        <path d="M-50 -6C-34 -26 10 -30 36 -18" fill="none" stroke="#8FE3E0" stroke-width="2" opacity=".55" stroke-linecap="round"/>
        <ellipse class="al-glint" cx="${flip ? 18 : -18}" cy="-12" rx="17" ry="7" fill="#fff" opacity=".92" transform="rotate(${flip ? 14 : -14})"/>
        <circle class="al-glint" cx="${flip ? -26 : 26}" cy="10" r="4.2" fill="#C9FFFB" opacity=".9"/>
      </g></g>`;
    const ring = (front) => `<g transform="rotate(-12 200 122)">
        ${front ? `<g clip-path="url(#${p}front)">` : `<g clip-path="url(#${p}back)">`}
          <ellipse cx="200" cy="126" rx="182" ry="34" fill="none" stroke="#05070f" stroke-width="15"/>
          <ellipse cx="200" cy="122" rx="182" ry="34" fill="none" stroke="${u('gold')}" stroke-width="10"/>
          <ellipse cx="200" cy="122" rx="182" ry="34" fill="none" stroke="#FFF6D6" stroke-width="2" stroke-dasharray="70 400" stroke-dashoffset="${front ? -40 : -300}" opacity=".95"/>
          <ellipse cx="200" cy="122" rx="166" ry="27" fill="none" stroke="#8FE3E0" stroke-width="1.6" opacity=".55"/>
        </g></g>`;
    return `<svg class="${o.cls || 'alley'}" viewBox="0 0 400 480" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${CREATURE_NAME}, ${CREATURE_TITLE.replace(/^The /, "the ")}">
  <defs>
    <radialGradient id="${p}skin" cx=".38" cy=".24" r=".9"><stop offset="0" stop-color="#3a5aa8"/><stop offset=".3" stop-color="#1d2d68"/><stop offset=".7" stop-color="#111a42"/><stop offset="1" stop-color="#090f2a"/></radialGradient>
    <linearGradient id="${p}chrome" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".22" stop-color="#C9FFFB" stop-opacity=".18"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <linearGradient id="${p}rim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3D58A"/><stop offset=".45" stop-color="#D4A84B"/><stop offset=".75" stop-color="#8FE3E0"/><stop offset="1" stop-color="#C9FFFB"/></linearGradient>
    <linearGradient id="${p}gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF0BF"/><stop offset=".3" stop-color="#F3D58A"/><stop offset=".65" stop-color="#D4A84B"/><stop offset="1" stop-color="#9a6a17"/></linearGradient>
    <radialGradient id="${p}eye" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#2b3766"/><stop offset=".35" stop-color="#0b0f22"/><stop offset="1" stop-color="#000"/></radialGradient>
    <radialGradient id="${p}pad" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#E8FBFA" stop-opacity=".95"/><stop offset=".35" stop-color="#8FE3E0" stop-opacity=".7"/><stop offset="1" stop-color="#8FE3E0" stop-opacity="0"/></radialGradient>
    <linearGradient id="${p}beam" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#8FE3E0" stop-opacity=".45"/><stop offset="1" stop-color="#8FE3E0" stop-opacity="0"/></linearGradient>
    <filter id="${p}glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9"/></filter>
    <clipPath id="${p}headclip"><path d="${HEAD}"/></clipPath>
    <clipPath id="${p}back" clipPathUnits="userSpaceOnUse"><rect x="-100" y="-200" width="600" height="322"/></clipPath>
    <clipPath id="${p}front" clipPathUnits="userSpaceOnUse"><rect x="-100" y="122" width="600" height="300"/></clipPath>
  </defs>
  <g class="al-all">
  ${o.base === false ? '' : `<g class="al-board">
    <path d="M150 452 L250 452 L232 360 L168 360 Z" fill="${u('beam')}" opacity=".7"/>
    <ellipse cx="200" cy="452" rx="92" ry="16" fill="${u('pad')}"/>
    <ellipse cx="200" cy="452" rx="70" ry="10" fill="none" stroke="#C9FFFB" stroke-width="2" opacity=".8"/>
  </g>`}
  <g class="al-ring-back">${ring(false)}</g>
  <g class="al-head">
    <path d="${HEAD}" fill="#8FE3E0" opacity=".5" filter="url(#${p}glow)"/>
    <path d="${HEAD}" fill="${u('skin')}" stroke="#05070f" stroke-width="12" stroke-linejoin="round"/>
    <g clip-path="url(#${p}headclip)">
      <path d="${HEAD}" fill="${u('chrome')}"/>
      <path d="M118 118C146 82 196 70 236 76" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity=".28"/>
      <path d="M332 190C330 262 290 318 238 372" fill="none" stroke="#8FE3E0" stroke-width="7" stroke-linecap="round" opacity=".5"/>
      <g fill="none" stroke="#8FE3E0" stroke-width="1.6" opacity=".35" stroke-linecap="round">
        
        <path d="M200 178V196"/><circle cx="200" cy="174" r="3"/>
      </g>
    </g>
    <path d="${HEAD}" fill="none" stroke="${u('rim')}" stroke-width="3.2" stroke-linejoin="round" transform="translate(200 227) scale(.955) translate(-200 -227)" opacity=".9"/>
    <g class="al-eyes">${eye(134, 250, 31, false)}${eye(266, 250, -31, true)}</g>
    <g fill="#05070f"><path d="M191 318q3 -5 5 0z"/><path d="M204 318q2 -5 5 0z"/></g>
  </g>
  <g class="al-ring">${ring(true)}
    <g class="al-glint-star" transform="translate(354 132)"><path d="M0 -16 L3 -3 L16 0 L3 3 L0 16 L-3 3 L-16 0 L-3 -3 Z" fill="#FFF6D6"/></g>
  </g>
  </g>
</svg>`;
  }
  const api = { NAME: CREATURE_NAME, TITLE: CREATURE_TITLE, svg };
  if (typeof window !== 'undefined') {
    window.SaturdayAlley = api;
    const fill = () => document.querySelectorAll('[data-alley-name]').forEach(el => { el.textContent = CREATURE_NAME; });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fill); else fill();
  }
  if (typeof module !== 'undefined') module.exports = api;
})();
