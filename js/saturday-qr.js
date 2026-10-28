/* Saturday QR — fully client-side. Uses vendored qrcode-generator (MIT, vendor/qrcode-generator/qrcode.js).
   SaturdayQR.svg(url, {style, mark}) returns a standalone SVG string (EC level H). */
(function () {
  // Default target: the live Saturday AR Experience. Change here if the AR URL ever moves.
  var DEFAULT_URL = 'https://saturdayforthewin.com/ar/';
  var MARK = "<defs>\n<linearGradient id=\"qm-sg\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#F3D58A\"/><stop offset=\".45\" stop-color=\"#D4A84B\"/><stop offset=\".75\" stop-color=\"#8FE3E0\"/><stop offset=\"1\" stop-color=\"#C9FFFB\"/></linearGradient>\n<linearGradient id=\"qm-se\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"#8FE3E0\"/><stop offset=\"1\" stop-color=\"#E8FBFA\"/></linearGradient>\n<filter id=\"qm-glow\" x=\"-30%\" y=\"-30%\" width=\"160%\" height=\"160%\"><feGaussianBlur stdDeviation=\"3.2\" result=\"b\"/><feMerge><feMergeNode in=\"b\"/><feMergeNode in=\"SourceGraphic\"/></feMerge></filter>\n</defs>\n<g fill=\"none\" stroke=\"url(#qm-sg)\" stroke-width=\"3.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" filter=\"url(#qm-glow)\">\n<ellipse cx=\"100\" cy=\"74\" rx=\"78\" ry=\"13\" transform=\"rotate(-12 100 74)\" stroke-width=\"1.6\" stroke-dasharray=\"120 18\" opacity=\".7\"/>\n<path fill=\"#0B1020\" d=\"M100 14C138 14 160 44 160 82C160 116 136 144 116 166C110 173 105 177 100 177C95 177 90 173 84 166C64 144 40 116 40 82C40 44 62 14 100 14Z\"/>\n<path d=\"M23.7 90.2A78 13 -12 0 0 176.3 57.8\" stroke-width=\"1.6\" stroke-dasharray=\"120 18\" opacity=\".7\"/>\n<path d=\"M93 177L91 196M107 177L109 196\"/>\n<path d=\"M91 196C70 199 54 206 46 230M109 196C130 199 146 206 154 230\"/>\n</g>\n<g fill=\"url(#qm-se)\" filter=\"url(#qm-glow)\" opacity=\".95\">\n<path d=\"M58 98C68 86 88 88 94 110C82 117 64 113 58 98Z\"/>\n<path d=\"M142 98C132 86 112 88 106 110C118 117 136 113 142 98Z\"/>\n</g>\n<circle cx=\"100\" cy=\"6\" r=\"1.6\" fill=\"#F3D58A\"/>";
  // Dark modules on a light ground in every style, so phone cameras read it reliably.
  var STYLES = {
    navy:  { name: 'Navy',     bg: '#f4ecd8', fg: '#0B1020', eye: '#0B1020', eyeIn: '#0B1020', frame: '#0B1020' },
    gold:  { name: 'Gold',     bg: '#f7efd9', fg: '#0B1020', eye: '#0B1020', eyeIn: '#7a5a14', frame: '#D4A84B' },
    teal:  { name: 'Teal',     bg: '#eefaf9', fg: '#0B1020', eye: '#0B1020', eyeIn: '#0f5560', frame: '#8FE3E0' },
    holo:  { name: 'Hologram', bg: '#f4ecd8', fg: 'url(#sq-holo)', eye: '#0B1020', eyeIn: 'url(#sq-holo)', frame: 'url(#sq-frame)' }
  };

  function matrix(url) {
    var q = qrcode(0, 'H');
    qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
    q.addData(url, 'Byte'); q.make();
    var n = q.getModuleCount(), m = [];
    for (var r = 0; r < n; r++) { m.push([]); for (var c = 0; c < n; c++) m[r].push(q.isDark(r, c)); }
    return m;
  }
  function svg(url, opts) {
    opts = opts || {};
    var st = STYLES[opts.style] || STYLES.holo, mark = opts.mark !== false;
    var m = matrix(url || DEFAULT_URL), n = m.length, Q = 4, S = n + Q * 2, out = [];
    var isEye = function (r, c) { return (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7); };
    var hole = mark ? Math.round(n * 0.24) | 1 : 0, h0 = (n - hole) / 2, h1 = h0 + hole;
    var inHole = function (r, c) { return mark && r >= h0 - 0.5 && r < h1 && c >= h0 - 0.5 && c < h1; };
    var d = '';
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) {
      if (!m[r][c] || isEye(r, c) || inHole(r, c)) continue;
      var x = c + Q, y = r + Q;
      d += 'M' + x + ' ' + (y + .22) + 'a.22 .22 0 0 1 .22-.22h.56a.22 .22 0 0 1 .22.22v.56a.22 .22 0 0 1-.22.22h-.56a.22 .22 0 0 1-.22-.22z';
    }
    out.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + S + ' ' + S + '" width="1024" height="1024" shape-rendering="geometricPrecision">');
    out.push('<title>Saturday QR: ' + esc(url) + '</title>');
    out.push('<defs><linearGradient id="sq-holo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0B1020"/><stop offset=".45" stop-color="#0f4a55"/><stop offset=".75" stop-color="#1c2f66"/><stop offset="1" stop-color="#7a5a14"/></linearGradient>' +
      '<linearGradient id="sq-frame" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8FE3E0"/><stop offset=".5" stop-color="#D4A84B"/><stop offset="1" stop-color="#8FE3E0"/></linearGradient></defs>');
    out.push('<rect width="' + S + '" height="' + S + '" rx="' + (S * .06) + '" fill="' + st.bg + '"/>');
    out.push('<rect x=".6" y=".6" width="' + (S - 1.2) + '" height="' + (S - 1.2) + '" rx="' + (S * .055) + '" fill="none" stroke="' + st.frame + '" stroke-width=".9"/>');
    out.push('<path d="' + d + '" fill="' + st.fg + '"/>');
    [[0, 0], [0, n - 7], [n - 7, 0]].forEach(function (p) {
      var x = p[1] + Q, y = p[0] + Q;
      out.push('<path fill-rule="evenodd" fill="' + st.eye + '" d="M' + (x + 1.6) + ' ' + y + 'h3.8a1.6 1.6 0 0 1 1.6 1.6v3.8a1.6 1.6 0 0 1-1.6 1.6h-3.8a1.6 1.6 0 0 1-1.6-1.6v-3.8a1.6 1.6 0 0 1 1.6-1.6zM' + (x + 1.9) + ' ' + (y + 1) + 'a.9 .9 0 0 0-.9.9v3.2a.9 .9 0 0 0 .9.9h3.2a.9 .9 0 0 0 .9-.9v-3.2a.9 .9 0 0 0-.9-.9z"/>');
      out.push('<rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="3" height="3" rx=".8" fill="' + st.eyeIn + '"/>');
    });
    if (mark) {
      var mx = h0 + Q, sz = hole;
      out.push('<rect x="' + (mx - .2) + '" y="' + (mx - .2) + '" width="' + (sz + .4) + '" height="' + (sz + .4) + '" rx="' + (sz * .22) + '" fill="#0B1020"/>');
      var sc = (sz * .86) / 262, ox = mx + (sz - 240 * sc) / 2 + 20 * sc, oy = mx + (sz - 262 * sc) / 2 + 16 * sc;
      out.push('<g transform="translate(' + ox.toFixed(3) + ' ' + oy.toFixed(3) + ') scale(' + sc.toFixed(5) + ')">' + MARK + '</g>');
    }
    out.push('</svg>');
    return out.join('');
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function toCanvas(svgStr, px) {
    return new Promise(function (res, rej) {
      var img = new Image();
      img.onload = function () { var c = document.createElement('canvas'); c.width = c.height = px; var x = c.getContext('2d'); x.drawImage(img, 0, 0, px, px); res(c); };
      img.onerror = rej;
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr);
    });
  }
  function loadImg(src) { return new Promise(function (res, rej) { var i = new Image(); i.onload = function () { res(i); }; i.onerror = rej; i.src = src; }); }
  // A4 @300dpi printable sheet: 3 x 4 die-cut style QR stickers with caption
  function sheet(svgStr, opts) {
    opts = opts || {};
    var W = 2480, H = 3508, cols = 3, rows = 4, pad = 150, gap = 70;
    var cw = (W - pad * 2 - gap * (cols - 1)) / cols, ch = (H - pad * 2 - 160 - gap * (rows - 1)) / rows;
    var qsz = Math.round(Math.min(cw * .74, ch - 240));
    return Promise.all([toCanvas(svgStr, qsz), loadImg(opts.wordmark || 'assets/saturday-wordmark-gold.svg').catch(function () { return null; })]).then(function (r) {
      var qr = r[0], wm = r[1], c = document.createElement('canvas'); c.width = W; c.height = H; var x = c.getContext('2d');
      x.fillStyle = '#ffffff'; x.fillRect(0, 0, W, H);
      x.fillStyle = '#0B1020'; x.font = '600 34px "Space Grotesk", sans-serif'; x.textAlign = 'center';
      x.fillText('SATURDAY · QR STICKER SHEET · A4 · cut along the dashed lines', W / 2, 100);
      for (var i = 0; i < cols * rows; i++) {
        var cx = pad + (i % cols) * (cw + gap), cy = 160 + pad + Math.floor(i / cols) * (ch + gap);
        x.save(); x.setLineDash([14, 12]); x.strokeStyle = '#9aa3b8'; x.lineWidth = 3; round(x, cx - 12, cy - 12, cw + 24, ch + 24, 60); x.stroke(); x.restore();
        x.fillStyle = '#0B1020'; round(x, cx, cy, cw, ch, 48); x.fill();
        x.strokeStyle = '#D4A84B'; x.lineWidth = 8; round(x, cx + 14, cy + 14, cw - 28, ch - 28, 38); x.stroke();
        var qs = qr.width; x.drawImage(qr, cx + (cw - qs) / 2, cy + 40, qs, qs);
        if (wm) { var wh = 92, ww = wh * ((wm.naturalWidth || 3184) / (wm.naturalHeight || 1030)); x.drawImage(wm, cx + (cw - ww) / 2, cy + 40 + qs + 18, ww, wh); }
        x.fillStyle = '#8FE3E0'; x.font = '700 26px "Space Grotesk", sans-serif'; x.fillText((opts.caption || 'SCAN · SUMMON THE HOLOGRAM').toUpperCase(), cx + cw / 2, cy + ch - 40);
      }
      return c;
    });
  }
  function round(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
  window.SaturdayQR = { DEFAULT_URL: DEFAULT_URL, STYLES: STYLES, svg: svg, toCanvas: toCanvas, sheet: sheet };
})();
