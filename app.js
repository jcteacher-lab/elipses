'use strict';

/* ============================================================
   1. UTILIDADES
   ============================================================ */
const EPS = 1e-9;
const clean = v => Math.round(v * 1e9) / 1e9;

function fmt(n, dec = 3) {
  if (!isFinite(n)) return '∞';
  if (Math.abs(n) < 1e-10) n = 0;
  return String(Number(n.toFixed(dec)));
}
const sgn = n => fmt(n).replace(/^-/, '−');
const pt = p => `(${fmt(p.x)}, ${fmt(p.y)})`;
const joinPts = (pts, sep = ' &nbsp;y&nbsp; ') => pts.map(pt).join(sep);

function niceStep(span, target) {
  const raw = span / target;
  if (!isFinite(raw) || raw <= 0) return 1;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / mag;
  const s = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return s * mag;
}

function decimalsFor(step) {
  const s = String(step);
  const m = s.match(/e-(\d+)/i);
  if (m) return parseInt(m[1], 10);
  const i = s.indexOf('.');
  return i < 0 ? 0 : s.length - i - 1;
}

/* ============================================================
   2. PARSER ALGEBRAICO
   ------------------------------------------------------------
   Convierte cualquier ecuación polinómica en x, y de grado 2
   (canónica o general) y completa cuadrados:
     A·x² + B·y² + C·x + D·y + F = 0
   Soporta paréntesis, potencias, coeficientes, fracciones
   (x^2/25, 1/2), multiplicación implícita (4x^2) y orden libre.
   ============================================================ */
const poly = {
  num: c => ({ '0,0': c }),
  add(p, q, s = 1) {
    const r = { ...p };
    for (const k in q) r[k] = (r[k] || 0) + s * q[k];
    return r;
  },
  mul(p, q) {
    const r = {};
    for (const a in p) for (const b in q) {
      const [i, j] = a.split(',').map(Number);
      const [k, l] = b.split(',').map(Number);
      const key = `${i + k},${j + l}`;
      r[key] = (r[key] || 0) + p[a] * q[b];
    }
    return r;
  },
  isConst: p => Object.keys(p).every(k => k === '0,0' || Math.abs(p[k]) < 1e-12)
};

function parsePolynomial(src) {
  let pos = 0;
  const peek = () => src[pos];
  const fail = msg => { throw new Error(msg); };

  function expr() {
    let p = term();
    while (peek() === '+' || peek() === '-') {
      const op = src[pos++];
      p = poly.add(p, term(), op === '+' ? 1 : -1);
    }
    return p;
  }

  function term() {
    let p = unary();
    for (;;) {
      const c = peek();
      if (c === '*') { pos++; p = poly.mul(p, unary()); }
      else if (c === '/') {
        pos++;
        const d = unary();
        if (!poly.isConst(d) || Math.abs(d['0,0'] || 0) < 1e-12) fail('Solo se puede dividir entre un número distinto de cero.');
        p = poly.mul(p, poly.num(1 / d['0,0']));
      }
      else if (c !== undefined && /[\dxy(.]/.test(c)) p = poly.mul(p, unary());   // multiplicación implícita
      else return p;
    }
  }

  function unary() {
    if (peek() === '-') { pos++; return poly.mul(poly.num(-1), unary()); }
    if (peek() === '+') { pos++; return unary(); }
    return power();
  }

  function power() {
    let base = atom();
    if (peek() === '^') {
      pos++;
      const m = src.slice(pos).match(/^\d+/);
      if (!m) fail('El exponente debe ser un entero positivo, por ejemplo x^2.');
      pos += m[0].length;
      const n = parseInt(m[0], 10);
      if (n > 4) fail('Exponente demasiado grande.');
      let r = poly.num(1);
      for (let i = 0; i < n; i++) r = poly.mul(r, base);
      base = r;
    }
    return base;
  }

  function atom() {
    const c = peek();
    if (c === 'x') { pos++; return { '1,0': 1 }; }
    if (c === 'y') { pos++; return { '0,1': 1 }; }
    if (c === '(') {
      pos++;
      const p = expr();
      if (peek() !== ')') fail('Falta cerrar un paréntesis.');
      pos++;
      return p;
    }
    const m = src.slice(pos).match(/^(\d+\.?\d*|\.\d+)/);
    if (m) { pos += m[0].length; return poly.num(parseFloat(m[0])); }
    return fail(c === undefined ? 'La expresión está incompleta.' : `Carácter no reconocido: "${c}".`);
  }

  const p = expr();
  if (pos < src.length) fail(`Carácter no reconocido: "${src[pos]}".`);
  return p;
}

function parseEllipse(raw) {
  const s = String(raw ?? '').toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[−–—]/g, '-')
    .replace(/²/g, '^2')
    .replace(/[∗·×]/g, '*')
    .replace(/,/g, '.');
  if (!s) throw new Error('Escribe una ecuación. Ejemplo: (x-2)^2/16+(y-1)^2/9=1');

  const sides = s.split('=');
  if (sides.length !== 2 || !sides[0] || !sides[1]) throw new Error('La ecuación debe tener exactamente un signo "=".');

  const p = poly.add(parsePolynomial(sides[0]), parsePolynomial(sides[1]), -1);
  const co = k => p[k] || 0;

  const allowed = new Set(['2,0', '0,2', '1,0', '0,1', '0,0']);
  for (const k in p) {
    if (!allowed.has(k) && Math.abs(p[k]) > 1e-12) {
      throw new Error('Solo se admiten los términos x², y², x, y y constantes (sin xy ni grados mayores).');
    }
  }

  let A = co('2,0'), B = co('0,2'), C = co('1,0'), D = co('0,1'), F = co('0,0');
  if (Math.abs(A) < 1e-12 || Math.abs(B) < 1e-12) throw new Error('Deben aparecer un término en x² y otro en y².');
  if (A * B < 0) throw new Error('Los coeficientes de x² y y² tienen signos opuestos: eso es una hipérbola, no una elipse.');
  if (A < 0) { A = -A; B = -B; C = -C; D = -D; F = -F; }

  // A(x−h)² + B(y−k)² = R
  const h = -C / (2 * A);
  const k = -D / (2 * B);
  const R = (C * C) / (4 * A) + (D * D) / (4 * B) - F;
  if (R <= 1e-12) throw new Error('El lado derecho resulta ≤ 0: no existe una elipse real con esos datos.');

  return { h: clean(h), k: clean(k), a: clean(Math.sqrt(R / A)), b: clean(Math.sqrt(R / B)) };
}

function eqText(h, k, a, b) {
  const part = (v, name) => Math.abs(v) < EPS
    ? `${name}²`
    : `(${name} ${v > 0 ? '− ' + fmt(v) : '+ ' + fmt(-v)})²`;
  const frac = (p, s) => (Math.abs(s - 1) < EPS ? p : `${p}/${fmt(s * s)}`);
  return `${frac(part(h, 'x'), a)} + ${frac(part(k, 'y'), b)} = 1`;
}

/* ============================================================
   3. ESTADO Y DOM
   ============================================================ */
const COLORS = {
  ellipse: '#1769aa', vertex: '#c62828', covertex: '#8b5cf6',
  focus: '#d97706', latus: '#f59e0b', directrix: '#94a3b8', center: '#172b4d'
};
const MARGIN = { l: 58, r: 16, t: 16, b: 32 };

let E = { h: 2, k: 1, a: 4, b: 3 };               // a, b = semiejes
const view = { xmin: -4, xmax: 8, ymin: -4, ymax: 6, autoFit: true };

const $ = id => document.getElementById(id);
const eqInput = $('eq'), xminInp = $('xmin'), xmaxInp = $('xmax'), errorBox = $('error');
const sliders = { h: $('hs'), k: $('ks'), a: $('as'), b: $('bs') };
const outputs = { h: $('hv'), k: $('kv'), a: $('av'), b: $('bv'), a2: $('a2v'), b2: $('b2v') };
const canvas = $('graph');
const ctx = canvas.getContext('2d');

/** Área de trazado (en px CSS) para un lienzo de w×h. */
const plotArea = (w, h) => ({
  L: MARGIN.l, R: w - MARGIN.r, T: MARGIN.t, B: h - MARGIN.b,
  pw: w - MARGIN.l - MARGIN.r, ph: h - MARGIN.t - MARGIN.b
});

function showError(msg) {
  errorBox.textContent = msg || '';
  errorBox.hidden = !msg;
}

function syncRangeInputs() {
  xminInp.value = Number(view.xmin.toFixed(2));
  xmaxInp.value = Number(view.xmax.toFixed(2));
}

function syncSliders() {
  for (const key of ['h', 'k', 'a', 'b']) {
    const sl = sliders[key];
    const v = E[key];
    if (v > parseFloat(sl.max)) sl.max = String(Math.ceil(v + 1));
    if ((key === 'h' || key === 'k') && v < parseFloat(sl.min)) sl.min = String(Math.floor(v - 1));
    sl.value = v;
    outputs[key].textContent = fmt(v);
  }
  outputs.a2.textContent = fmt(E.a * E.a);
  outputs.b2.textContent = fmt(E.b * E.b);
}

/* ============================================================
   4. GEOMETRÍA DERIVADA
   ============================================================ */
function geom() {
  const { h, k, a, b } = E;
  const horizontal = a >= b;
  const major = Math.max(a, b);
  const minor = Math.min(a, b);
  const c = Math.sqrt(Math.max(0, major * major - minor * minor));
  const e = major > 0 ? c / major : 0;
  const isCircle = c < EPS;
  const lrHalf = major > 0 ? (minor * minor) / major : 0;

  // Par de puntos simétricos respecto al centro sobre el eje mayor o menor
  const along = (d) => horizontal ? [{ x: h - d, y: k }, { x: h + d, y: k }] : [{ x: h, y: k - d }, { x: h, y: k + d }];
  const across = (d) => horizontal ? [{ x: h, y: k - d }, { x: h, y: k + d }] : [{ x: h - d, y: k }, { x: h + d, y: k }];

  const foci = along(c);
  const verts = along(major);
  const covs = across(minor);
  const latus = foci.map(f => across(lrHalf).map(p => ({ x: p.x - h + f.x, y: p.y - k + f.y })));

  let directrices = [];
  if (!isCircle) {
    const d = (major * major) / c;
    directrices = horizontal
      ? [{ axis: 'v', val: h - d }, { axis: 'v', val: h + d }]
      : [{ axis: 'h', val: k - d }, { axis: 'h', val: k + d }];
  }

  return { h, k, a, b, major, minor, c, e, isCircle, horizontal, foci, verts, covs, lrHalf, latus, directrices };
}

/* ============================================================
   5. VISTA (auto-encuadre 1:1, zoom, desplazamiento)
   ============================================================ */
function aspectRatio() {
  const rect = canvas.getBoundingClientRect();
  return Math.max(100, rect.width - MARGIN.l - MARGIN.r) / Math.max(100, rect.height - MARGIN.t - MARGIN.b);
}

function autoFitView() {
  const { h, k, a, b } = E;
  const pad = 1.2;
  const halfW = Math.max(a * pad, 1);
  const halfH = Math.max(b * pad, 1);
  const aspect = aspectRatio();
  const viewW = Math.max(2 * halfW, 2 * halfH * aspect);
  const viewH = viewW / aspect;
  Object.assign(view, { xmin: h - viewW / 2, xmax: h + viewW / 2, ymin: k - viewH / 2, ymax: k + viewH / 2 });
  syncRangeInputs();
}

/* ============================================================
   6. DIBUJO
   ============================================================ */
let drawQueued = false;
function scheduleDraw() {
  if (drawQueued) return;
  drawQueued = true;
  requestAnimationFrame(() => { drawQueued = false; draw(); });
}

function dot(x, y, r, color, ring = 2) {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = ring; ctx.stroke();
}

function line(x1, y1, x2, y2) {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
}

function draw() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const W = Math.max(320, Math.round(rect.width));
  const H = Math.max(260, Math.round(rect.height));
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  if (view.autoFit) autoFitView();

  const { L, R, T, B, pw, ph } = plotArea(W, H);
  const { xmin, xmax, ymin, ymax } = view;
  const sx = x => L + (x - xmin) / (xmax - xmin) * pw;
  const sy = y => B - (y - ymin) / (ymax - ymin) * ph;
  const inView = p => p.x >= xmin && p.x <= xmax && p.y >= ymin && p.y <= ymax;

  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fbfcfe'; ctx.fillRect(L, T, pw, ph);

  /* Rejilla */
  const xstep = niceStep(xmax - xmin, 10), ystep = niceStep(ymax - ymin, 8);
  const dx = decimalsFor(xstep), dy = decimalsFor(ystep);
  const ix0 = Math.ceil(xmin / xstep), ix1 = Math.floor(xmax / xstep);
  const iy0 = Math.ceil(ymin / ystep), iy1 = Math.floor(ymax / ystep);

  ctx.lineWidth = 1; ctx.strokeStyle = '#e6ebf2';
  for (let i = ix0; i <= ix1; i++) line(sx(i * xstep), T, sx(i * xstep), B);
  for (let j = iy0; j <= iy1; j++) line(L, sy(j * ystep), R, sy(j * ystep));

  /* Ejes */
  ctx.strokeStyle = '#65758b'; ctx.lineWidth = 1.6;
  const showYAxis = xmin <= 0 && xmax >= 0, showXAxis = ymin <= 0 && ymax >= 0;
  if (showYAxis) line(sx(0), T, sx(0), B);
  if (showXAxis) line(L, sy(0), R, sy(0));

  /* Números de los ejes */
  ctx.font = '11px Arial, sans-serif'; ctx.fillStyle = '#5b6b7c';
  ctx.textAlign = 'center';
  for (let i = ix0; i <= ix1; i++) {
    const x = i * xstep;
    if (Math.abs(x) > EPS) ctx.fillText(x.toFixed(dx), sx(x), B + 15);
  }
  ctx.textAlign = 'right';
  for (let j = iy0; j <= iy1; j++) {
    const y = j * ystep;
    if (Math.abs(y) > EPS) ctx.fillText(y.toFixed(dy), L - 6, sy(y) + 4);
  }
  if (showXAxis && showYAxis) ctx.fillText('0', sx(0) - 6, sy(0) + 14);

  const { h, k, a, b, isCircle, foci, verts, covs, latus, directrices } = geom();

  ctx.save();
  ctx.beginPath(); ctx.rect(L, T, pw, ph); ctx.clip();

  /* Directrices */
  ctx.setLineDash([6, 5]); ctx.strokeStyle = COLORS.directrix; ctx.lineWidth = 1.4;
  directrices.forEach(d => {
    if (d.axis === 'v') line(sx(d.val), T, sx(d.val), B);
    else line(L, sy(d.val), R, sy(d.val));
  });

  /* Ejes mayor y menor */
  ctx.strokeStyle = COLORS.covertex; ctx.lineWidth = 1.8; ctx.setLineDash([5, 4]);
  [verts, covs].forEach(([p, q]) => line(sx(p.x), sy(p.y), sx(q.x), sy(q.y)));
  ctx.setLineDash([]);

  /* Lado recto en cada foco */
  ctx.strokeStyle = COLORS.latus; ctx.lineWidth = 3;
  latus.forEach(([p, q]) => line(sx(p.x), sy(p.y), sx(q.x), sy(q.y)));

  /* Elipse */
  ctx.strokeStyle = COLORS.ellipse; ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 360; i++) {
    const t = i * Math.PI / 180;
    const px = sx(h + a * Math.cos(t)), py = sy(k + b * Math.sin(t));
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath(); ctx.stroke();

  /* Puntos notables */
  covs.forEach(p => dot(sx(p.x), sy(p.y), 5, COLORS.covertex, 1.5));
  verts.forEach(p => dot(sx(p.x), sy(p.y), 6.5, COLORS.vertex));
  latus.flat().forEach(p => dot(sx(p.x), sy(p.y), 4, COLORS.latus, 1.4));
  foci.forEach(f => dot(sx(f.x), sy(f.y), 6, COLORS.focus));
  dot(sx(h), sy(k), 6, COLORS.center);

  ctx.restore();

  /* Etiquetas */
  function label(text, x, y, color) {
    ctx.font = 'bold 12px Arial, sans-serif';
    const w = ctx.measureText(text).width;
    const lx = Math.min(Math.max(x, L + 2), R - w - 4);
    const ly = Math.min(Math.max(y, T + 14), B - 2);
    ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.fillRect(lx - 4, ly - 13, w + 8, 17);
    ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.strokeRect(lx - 4, ly - 13, w + 8, 17);
    ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.fillText(text, lx, ly);
  }

  label(`C${pt({ x: h, y: k })}`, sx(h) + 10, sy(k) - 10, COLORS.center);
  if (!isCircle) {
    foci.filter(inView).forEach(f => {
      const i = foci.indexOf(f);
      label(`F${i + 1}${pt(f)}`, sx(f.x) + 10, sy(f.y) + (i === 0 ? 20 : -20), COLORS.focus);
    });
  }
  verts.forEach((v, i) => inView(v) && label(`V${i + 1}`, sx(v.x) + 8, sy(v.y) - 8, COLORS.vertex));
  covs.forEach((v, i) => inView(v) && label(`B${i + 1}`, sx(v.x) + 8, sy(v.y) + 16, COLORS.covertex));
  directrices.forEach(d => {
    if (d.axis === 'v' && d.val >= xmin && d.val <= xmax) label(`x = ${fmt(d.val)}`, sx(d.val) + 6, T + 30, COLORS.directrix);
    if (d.axis === 'h' && d.val >= ymin && d.val <= ymax) label(`y = ${fmt(d.val)}`, L + 6, sy(d.val) - 8, COLORS.directrix);
  });

  ctx.textAlign = 'left'; ctx.font = 'bold 13px Arial, sans-serif'; ctx.fillStyle = COLORS.ellipse;
  ctx.fillText('Elipse', R - 60, T + 18);
}

/* ============================================================
   7. PANELES DE RESULTADOS
   ============================================================ */
function translationText(v, axis) {
  const [pos, neg, zero] = axis === 'x'
    ? ['DERECHA', 'IZQUIERDA', 'no hay desplazamiento horizontal: el centro está sobre el eje Y.']
    : ['ARRIBA', 'ABAJO', 'no hay desplazamiento vertical: el centro está sobre el eje X.'];
  if (Math.abs(v) < EPS) return zero;
  return v > 0
    ? `el centro se desplaza <b>${fmt(v)} unidades hacia ${pos}</b> (${axis} − ${fmt(v)}).`
    : `el centro se desplaza <b>${fmt(-v)} unidades hacia ${neg}</b> (${axis} + ${fmt(-v)}).`;
}

function renderPanels() {
  const { h, k, a, b, major, minor, c, e, isCircle, horizontal, foci, verts, covs, lrHalf, latus, directrices } = geom();
  const orientation = isCircle ? 'Circunferencia' : horizontal ? 'Mayor horizontal' : 'Mayor vertical';
  const lrText = latus.flat().map(pt).join('<br>');

  $('formula').textContent = eqText(h, k, a, b);

  $('explanation').innerHTML = `
    <div class="good"><b>Identificación:</b> h = ${sgn(h)} &nbsp;·&nbsp; k = ${sgn(k)} &nbsp;·&nbsp; a = ${sgn(a)} &nbsp;·&nbsp; b = ${sgn(b)}
      &nbsp;→&nbsp; C(${fmt(h)}, ${fmt(k)})</div>
    <div class="ident">
      <span class="pill">(x − h)²/a² + (y − k)²/b² = 1</span>
      <span class="pill">${orientation}</span>
    </div>
    <p>Comparando con la forma canónica, se obtiene <b>h = ${sgn(h)}</b> y <b>k = ${sgn(k)}</b>, y los semiejes son <b>a = ${fmt(a)}</b> y <b>b = ${fmt(b)}</b>.</p>
    <p><b>Traslación horizontal.</b> ${translationText(h, 'x')}</p>
    <p><b>Traslación vertical.</b> ${translationText(k, 'y')}</p>
    <p><b>Orientación.</b> Se trata de una ${isCircle ? 'circunferencia (a = b)' : `elipse de eje mayor <b>${horizontal ? 'horizontal' : 'vertical'}</b>`}.
       El <b>semieje mayor mide ${fmt(major)}</b> y el <b>semieje menor mide ${fmt(minor)}</b>.</p>`;

  const card = (title, body, wide = false) => `<div class="card${wide ? ' card-wide' : ''}"><b>${title}</b>${body}</div>`;
  $('cards').innerHTML = [
    card('Centro', `C(${fmt(h)}, ${fmt(k)})`),
    card('Orientación', orientation),
    card('Semieje mayor', `${fmt(major)} u.`),
    card('Semieje menor', `${fmt(minor)} u.`),
    card('Distancia focal c', `${fmt(c)} u.`),
    card('Excentricidad e = c/a', fmt(e)),
    card('Focos', isCircle ? `Único en C(${fmt(h)}, ${fmt(k)})` : joinPts(foci)),
    card('Vértices (eje mayor)', joinPts(verts)),
    card('Covértices (eje menor)', joinPts(covs)),
    card('Lado recto (cada foco)', `${fmt(2 * lrHalf)} u.`),
    card('Extremos del lado recto', lrText, true)
  ].join('');

  const dirsTxt = isCircle
    ? 'Al ser una circunferencia (c = 0), no existen directrices finitas.'
    : directrices.map(d => `<b>${d.axis === 'v' ? 'x' : 'y'} = ${fmt(d.val)}</b>`).join(' &nbsp;·&nbsp; ');
  const eccNote = isCircle
    ? 'Al ser e = 0, la elipse degenera en circunferencia.'
    : e < 0.5 ? 'Valor pequeño → elipse cercana a una circunferencia.' : 'Valor alto → elipse alargada.';

  $('geometry').innerHTML = `
    <p><b>Relación fundamental:</b> c² = a² − b² = ${fmt(major * major)} − ${fmt(minor * minor)} = ${fmt(c * c)}, por lo que <b>c = ${fmt(c)}</b>.</p>
    <p><b>Excentricidad:</b> e = c/a = ${fmt(c)} / ${fmt(major)} = <b>${fmt(e)}</b>. ${eccNote}</p>
    <p><b>Lado recto:</b> es la cuerda perpendicular al eje mayor que pasa por cada foco.
       Su longitud es 2b²/a = 2·${fmt(minor * minor)}/${fmt(major)} = <b>${fmt(2 * lrHalf)}</b> u.</p>
    <p><b>Extremos del lado recto:</b><br>${lrText}</p>
    <p><b>Directrices</b> (distancia a²/c desde el centro): ${dirsTxt}</p>
    <p class="small">Propiedad focal: cada punto de la elipse cumple d(P,F₁) + d(P,F₂) = 2a = ${fmt(2 * major)}.</p>`;

  /* Tabla paramétrica */
  const rows = [];
  for (let deg = 0; deg < 360; deg += 30) {
    const t = deg * Math.PI / 180;
    const isVertex = deg === 0 || deg === 180;
    const isCovertex = deg === 90 || deg === 270;
    rows.push(`<tr${isVertex || isCovertex ? ' class="highlight"' : ''}>
      <td>${deg}°</td><td>${fmt(h + a * Math.cos(t))}</td><td>${fmt(k + b * Math.sin(t))}</td>
      <td>${isVertex ? 'vértice' : isCovertex ? 'covértice' : ''}</td></tr>`);
  }
  $('table').innerHTML =
    `<thead><tr><th>θ (°)</th><th>x = h + a·cos θ</th><th>y = k + b·sin θ</th><th>Punto</th></tr></thead><tbody>${rows.join('')}</tbody>`;
}

function render() {
  renderPanels();
  draw();
}

/* ============================================================
   8. ACCIONES
   ============================================================ */
function analyze() {
  try {
    E = parseEllipse(eqInput.value);
  } catch (err) {
    showError(err.message);
    return;
  }
  showError('');
  syncSliders();
  view.autoFit = true;
  render();
}

function updateFromSliders() {
  E = {
    h: parseFloat(sliders.h.value),
    k: parseFloat(sliders.k.value),
    a: Math.max(0.1, parseFloat(sliders.a.value)),
    b: Math.max(0.1, parseFloat(sliders.b.value))
  };
  showError('');
  syncSliders();
  eqInput.value = eqText(E.h, E.k, E.a, E.b);
  view.autoFit = true;
  render();
}

function applyXRange() {
  let xmin = parseFloat(xminInp.value), xmax = parseFloat(xmaxInp.value);
  if (!isFinite(xmin)) xmin = -10;
  if (!isFinite(xmax)) xmax = 10;
  if (xmax <= xmin) { xmax = xmin + 1; xmaxInp.value = xmax; }

  const height = (xmax - xmin) / aspectRatio();
  Object.assign(view, { xmin, xmax, ymin: E.k - height / 2, ymax: E.k + height / 2, autoFit: false });
  draw();
}

/* ============================================================
   9. EVENTOS
   ============================================================ */
$('analyze').addEventListener('click', analyze);
$('refit').addEventListener('click', () => { view.autoFit = true; render(); });
eqInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); analyze(); } });
Object.values(sliders).forEach(s => s.addEventListener('input', updateFromSliders));
xminInp.addEventListener('change', applyXRange);
xmaxInp.addEventListener('change', applyXRange);

/* Zoom con la rueda (centrado en el cursor) */
canvas.addEventListener('wheel', e => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const { L, R, T, B } = plotArea(rect.width, rect.height);
  const px = Math.min(Math.max(e.clientX - rect.left, L), R);
  const py = Math.min(Math.max(e.clientY - rect.top, T), B);
  const xData = view.xmin + (px - L) / (R - L) * (view.xmax - view.xmin);
  const yData = view.ymax - (py - T) / (B - T) * (view.ymax - view.ymin);

  const f = e.deltaY > 0 ? 1.12 : 1 / 1.12;
  view.xmin = xData - (xData - view.xmin) * f;
  view.xmax = xData + (view.xmax - xData) * f;
  view.ymin = yData - (yData - view.ymin) * f;
  view.ymax = yData + (view.ymax - yData) * f;
  view.autoFit = false;
  syncRangeInputs();
  scheduleDraw();
}, { passive: false });

/* Desplazamiento (ratón y táctil mediante Pointer Events) */
let drag = null;
canvas.addEventListener('pointerdown', e => {
  drag = { x: e.clientX, y: e.clientY, v: { ...view } };
  canvas.setPointerCapture(e.pointerId);
  canvas.classList.add('dragging');
});
canvas.addEventListener('pointermove', e => {
  if (!drag) return;
  const rect = canvas.getBoundingClientRect();
  const { pw, ph } = plotArea(rect.width, rect.height);
  const dx = (e.clientX - drag.x) / pw * (drag.v.xmax - drag.v.xmin);
  const dy = (e.clientY - drag.y) / ph * (drag.v.ymax - drag.v.ymin);
  Object.assign(view, {
    xmin: drag.v.xmin - dx, xmax: drag.v.xmax - dx,
    ymin: drag.v.ymin + dy, ymax: drag.v.ymax + dy, autoFit: false
  });
  syncRangeInputs();
  scheduleDraw();
});
const endDrag = () => { drag = null; canvas.classList.remove('dragging'); };
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);

let resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(scheduleDraw, 80);
});

/* ============================================================
   10. ARRANQUE
   ============================================================ */
syncSliders();
analyze();
