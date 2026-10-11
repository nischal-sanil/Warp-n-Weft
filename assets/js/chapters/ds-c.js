/* chapters/ds-c.js: Device Software, part C.
   Entries: thread-block, thread-block-grid, thread-hierarchy, memory-hierarchy, registers,
   shared-memory, global-memory, cuda-tile-programming-model.
   Every CSS class here is prefixed "dsc-". */
(function () {
  'use strict';

  GG.css(`
/* ── shared ── */
.dsc-w { position: relative; min-width: 0; }
.dsc-svg { display: block; width: 100%; height: auto; overflow: visible; -webkit-tap-highlight-color: transparent; }
.dsc-svg text { pointer-events: none; }
.dsc-svg .dsc-hit { cursor: pointer; }
.dsc-svg:focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; border-radius: 6px; }
.dsc-legend { display: flex; flex-wrap: wrap; gap: 6px 16px; margin-top: 10px; font: 500 11px/1.4 var(--font-mono); color: var(--ink-2); }
.dsc-legend span { display: inline-flex; align-items: center; gap: 7px; }
.dsc-legend i { width: 11px; height: 11px; border-radius: 3px; flex: none; display: inline-block; }
.dsc-sw-core { background: var(--core); }
.dsc-sw-core-a { background: var(--core-a); box-shadow: inset 0 0 0 1px rgba(69, 212, 155, 0.7); }
.dsc-sw-memory { background: var(--memory); }
.dsc-sw-memory-a { background: var(--memory-a); box-shadow: inset 0 0 0 1px rgba(111, 166, 255, 0.7); }
.dsc-sw-control { background: var(--control); }
.dsc-sw-danger { background: var(--danger-a); box-shadow: inset 0 0 0 1px rgba(255, 91, 110, 0.8); }
.dsc-sw-idle { background: transparent; box-shadow: inset 0 0 0 1px var(--line-2); }
.dsc-sw-accent { background: var(--accent); }
.dsc-sw-host { background: var(--host); }
.dsc-sw-special { background: var(--special); }
.dsc-sw-ink { background: var(--ink-2); }
.dsc-sw-rel { background: transparent; box-shadow: inset 0 0 0 2px var(--accent-2); }
.dsc-sw-hatch { background: repeating-linear-gradient(135deg, rgba(111, 166, 255, 0.55) 0 2px, transparent 2px 5px); box-shadow: inset 0 0 0 1px var(--memory); }
.dsc-sw-res { background: #3b4157; box-shadow: inset 0 0 0 1px var(--ink-3); }
.dsc-sw-ctrl-d { background: transparent; box-shadow: inset 0 0 0 1px var(--control); background-image: repeating-linear-gradient(90deg, rgba(255, 198, 92, 0.25) 0 3px, transparent 3px 5px); }
.dsc-k { font: 500 10px/1.3 var(--font-mono); letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-3); }
.entry-body .dsc-wc, .entry-body.dsc-body :not(pre) > code { white-space: normal; overflow-wrap: anywhere; }
.dsc-panel { border: 1px solid var(--line); border-radius: 12px; background: rgba(8, 9, 14, 0.5); padding: 10px 12px 12px; min-width: 0; }
.dsc-panel-h { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; flex-wrap: wrap; margin-bottom: 6px; }
.dsc-panel-h b { font: 600 12px var(--font-mono); color: var(--ink); }
.dsc-panel-h span { font: 500 11px var(--font-mono); color: var(--ink-3); }
.dsc-formula { font: 500 12.5px/1.7 var(--font-mono); color: var(--ink-2); white-space: pre-wrap; overflow-wrap: anywhere; }
.dsc-formula b { color: var(--ink); font-weight: 600; }
.dsc-formula .v { color: var(--accent-2); }
.dsc-formula .m { color: var(--memory); }
.dsc-formula .c { color: var(--core); }
.dsc-formula .r { color: var(--danger); }
.dsc-formula .a { color: var(--control); }
.dsc-formula .d { color: var(--ink-3); }
.dsc-row { display: flex; flex-wrap: wrap; gap: 8px 12px; align-items: center; }
.dsc-status { font: 600 11px/1 var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; padding: 5px 7px 4px; border-radius: 6px; border: 1px solid var(--line-2); color: var(--ink-2); white-space: nowrap; }
.dsc-status.ok { color: var(--core); border-color: rgba(69, 212, 155, 0.5); background: var(--core-a); }
.dsc-status.bad { color: var(--danger); border-color: rgba(255, 91, 110, 0.55); background: var(--danger-a); }
.dsc-status.wait { color: var(--control); border-color: rgba(255, 198, 92, 0.5); background: var(--control-a); }
.dsc-two { display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; align-items: start; }
@media (max-width: 520px) { .dsc-formula { font-size: 11.5px; } }
@media (min-width: 900px) { .dsc-two.split { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); } }
.dsc-facts { margin: 12px 0 0; padding: 0; list-style: none; display: grid; gap: 6px; font-size: 13.5px; line-height: 1.5; color: var(--ink-2); }
.dsc-facts li { display: flex; gap: 9px; align-items: baseline; }
.dsc-facts li::before { content: ""; width: 7px; height: 7px; border-radius: 2px; background: var(--fc, var(--ink-3)); flex: none; transform: translateY(-1px); }
.dsc-facts b { color: var(--ink); font-weight: 600; }
.dsc-facts code, .fig-why code, .dsc-panel code { font-size: 0.88em; padding: 0.08em 0.35em; border-radius: 4px; background: var(--surface-3); color: var(--ink); white-space: normal; overflow-wrap: anywhere; }
.dsc-scode pre { max-height: 360px; overflow-y: auto; }
.dsc-codegrid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; }
@media (min-width: 860px) { .dsc-codegrid.two { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); } }
.dsc-codegrid .code pre { font-size: 12.4px; }
.dsc-chips { display: flex; flex-wrap: wrap; gap: 4px; }
.dsc-chip { font: 500 11px/1 var(--font-mono); padding: 4px 6px 3px; border-radius: 5px; border: 1px solid rgba(111, 166, 255, 0.35); color: #bcd3ff; background: rgba(111, 166, 255, 0.07); transition: background 0.2s, border-color 0.2s, color 0.2s, opacity 0.2s; }
.dsc-chip.on { background: rgba(111, 166, 255, 0.34); border-color: var(--memory); color: #fff; }
.dsc-chip.dim { opacity: 0.45; }
.dsc-chip.was { background: rgba(111, 166, 255, 0.16); border-color: rgba(111, 166, 255, 0.6); color: #d3e3ff; }
@media (prefers-reduced-motion: reduce) { .dsc-svg * { transition: none !important; } }
`);

  /* ───────────── helpers ───────────── */
  const el = GG.el;
  const esc = GG.esc;
  const fmt = GG.fmt;
  const TERMS = {};
  (window.GG_TERMS || []).forEach((t) => { TERMS[t.id] = t; });
  /* Cross-link HTML, already decorated (so it also works in content shown after boot). */
  function T(id, text) {
    const t = TERMS[id];
    const color = t ? (GG.SECTIONS[t.section] || GG.SECTIONS.intro).color : 'var(--accent)';
    return `<a data-term="${id}" href="#${id}" class="term" style="--c:${color}">${text == null ? (t ? esc(t.name) : id) : text}</a>`;
  }
  const S = (tag, attrs, parent) => GG.svg(tag, attrs, parent);
  /* SVG text. gg.css sets .fig svg text { fill }, which beats presentation attributes: pass colour as style. */
  function Tx(parent, x, y, text, o) {
    o = o || {};
    const st = [];
    st.push('fill:' + (o.fill || 'var(--ink-2)'));
    /* phones: no SVG label below 10 px (svgEl marks drawings narrower than 480 user units) */
    const sv = parent && (parent.ownerSVGElement || parent);
    const size = o.size && sv && sv._small ? Math.max(10, o.size) : o.size;
    if (size) st.push('font-size:' + size + 'px');
    if (o.weight) st.push('font-weight:' + o.weight);
    if (o.family) st.push('font-family:' + o.family);
    if (o.ls) st.push('letter-spacing:' + o.ls);
    if (o.opacity != null) st.push('opacity:' + o.opacity);
    if (o.halo) st.push('paint-order:stroke;stroke:var(--bg);stroke-width:3.5px;stroke-linejoin:round');
    const t = S('text', { x: r2(x), y: r2(y), 'text-anchor': o.anchor || 'start', class: o.cls || null, style: st.join(';') }, parent);
    t.textContent = text;
    return t;
  }
  const r2 = (v) => Math.round(v * 100) / 100;
  /* rough width of a mono label, honouring the phone font floor */
  const textW = (txt, size, small) => String(txt).length * (small ? Math.max(10, size) : size) * 0.62;
  function R(parent, x, y, w, h, o) {
    o = o || {};
    return S('rect', { x: r2(x), y: r2(y), width: r2(Math.max(0, w)), height: r2(Math.max(0, h)), rx: o.rx == null ? 3 : o.rx,
      fill: o.fill || 'none', stroke: o.stroke || 'none', 'stroke-width': o.sw || (o.stroke ? 1 : null),
      'stroke-dasharray': o.dash || null, opacity: o.opacity == null ? null : o.opacity, class: o.cls || null }, parent);
  }
  function L(parent, x1, y1, x2, y2, o) {
    o = o || {};
    return S('line', { x1: r2(x1), y1: r2(y1), x2: r2(x2), y2: r2(y2), stroke: o.stroke || 'var(--line-2)', 'stroke-width': o.sw || 1,
      'stroke-dasharray': o.dash || null, opacity: o.opacity == null ? null : o.opacity, 'stroke-linecap': o.cap || null, class: o.cls || null }, parent);
  }
  function P(parent, d, o) {
    o = o || {};
    return S('path', { d, fill: o.fill || 'none', stroke: o.stroke || 'none', 'stroke-width': o.sw || null, 'stroke-dasharray': o.dash || null,
      opacity: o.opacity == null ? null : o.opacity, 'stroke-linecap': o.cap || 'round', 'stroke-linejoin': 'round', class: o.cls || null,
      'marker-end': o.marker || null }, parent);
  }
  /* A wavy vertical strand (a thread), from (x, y0) down to y0 + len, with a small arrowhead. */
  function strand(parent, x, y0, len, o) {
    o = o || {};
    const A = o.amp == null ? 2.4 : o.amp, wl = o.wl || 10, ph = o.phase || 0;
    const Ls = len - 4, n = Math.max(8, Math.round(Ls / 2));
    let d = '';
    for (let i = 0; i <= n; i++) {
      const s = (i / n) * Ls, u = s / Ls;
      let e = Math.min(1, u / 0.18, (1 - u) / 0.2);
      e = e <= 0 ? 0 : e * e * (3 - 2 * e);
      d += (i ? 'L' : 'M') + r2(x + A * e * Math.sin((2 * Math.PI * s) / wl - ph)) + ' ' + r2(y0 + s);
    }
    const g = S('g', { class: o.cls || null }, parent);
    P(g, d, { stroke: o.stroke || 'var(--ink-2)', sw: o.sw || 1.3, opacity: o.opacity });
    if (o.head !== false) {
      const y1 = y0 + len, hw = o.hw || 2.8;
      P(g, `M${r2(x - hw)} ${r2(y1 - 5)}L${r2(x + hw)} ${r2(y1 - 5)}L${r2(x)} ${r2(y1)}Z`, { fill: o.stroke || 'var(--ink-2)', opacity: o.opacity });
    }
    return g;
  }
  function svgEl(host, W, H, label, o) {
    o = o || {};
    const s = S('svg', { class: 'dsc-svg' + (o.cls ? ' ' + o.cls : ''), viewBox: `0 0 ${Math.round(W)} ${Math.round(H)}`, role: o.role || 'img', 'aria-label': label || null });
    if (o.focusable) { s.setAttribute('tabindex', '0'); s.setAttribute('data-keys', ''); }
    s._small = W < 480;
    host.appendChild(s);
    return s;
  }
  function clear(n) { while (n && n.firstChild) n.removeChild(n.firstChild); }
  /* Run a figure builder; if it throws, keep the prose and show an error box. */
  function guard(parent, label, fn) {
    try { return fn(); } catch (e) {
      console.error('[ds-c] ' + label + ' failed', e);
      if (parent) parent.insertAdjacentHTML('beforeend', `<div class="entry-error">${esc(label)} could not be drawn: ${esc(e && e.message)}</div>`);
      return null;
    }
  }
  /* cb(width) whenever el's content width changes. */
  function onWidth(node, cb) {
    let last = -1;
    const run = (w) => { w = Math.floor(w); if (w > 0 && Math.abs(w - last) >= 1) { last = w; try { cb(w); } catch (e) { console.error('[ds-c] draw failed', e); } } };
    GG.resize(node, (r) => run(r.width));
    requestAnimationFrame(() => run(node.getBoundingClientRect().width));
  }
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffled(arr, r) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const range = (n) => Array.from({ length: n }, (_, i) => i);
  function legend(parent, items) {
    const d = el('div', { class: 'dsc-legend', html: items.map(([cls, label]) => `<span><i class="${cls}"></i>${label}</span>`).join('') });
    parent.append(d);
    return d;
  }
  /* motion toggle, labelled so it is never confused with a stepper's Play. toggle() flips the motion and returns whether it now runs. */
  function motionBtn(parent, on, toggle, title) {
    const lab = (v) => (v ? 'Pause motion' : 'Start motion');
    const b = GG.ui.button(parent, { label: lab(on), icon: on ? 'pause' : 'play', title, onClick: () => { const v = toggle(); b.setLabel(lab(v), v ? 'pause' : 'play'); } });
    return b;
  }
  /* point in SVG user units from a pointer event */
  function svgPoint(svg, e) {
    const r = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    const sx = vb && vb.width ? vb.width / r.width : 1, sy = vb && vb.height ? vb.height / r.height : 1;
    return [(e.clientX - r.left) * sx, (e.clientY - r.top) * sy];
  }
  const REFRESHER = { href: 'https://developer.nvidia.com/blog/cuda-refresher-cuda-programming-model/', label: 'NVIDIA: CUDA Refresher, The CUDA Programming Model', note: 'one source of the glossary’s thread/block/grid diagram' };
  const CPG = { href: 'https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#programming-model', label: 'NVIDIA CUDA C++ Programming Guide: Programming Model', note: 'the other source of that diagram (NVIDIA has since restructured the guide, so this link now opens its new table of contents)' };
  const CPG124 = 'https://docs.nvidia.com/cuda/archive/12.4.0/cuda-c-programming-guide/index.html';
  const CPG_LIMITS = { href: CPG124 + '#features-and-technical-specifications', label: 'CUDA C++ Programming Guide 12.4 (archived): Compute Capabilities', note: 'beyond the glossary: the per-device limits quoted here' };
  /* Hopper latencies (H800, GH100), Luo et al., arXiv:2402.13499 v1, Table IV; the hw-a/hw-c figures use the same table */
  const LUO24 = 'https://arxiv.org/abs/2402.13499';
  const CPG_CLUSTERS = { href: CPG124 + '#thread-block-clusters', label: 'CUDA C++ Programming Guide 12.4 (archived): Thread Block Clusters', note: 'beyond the glossary: clusters and distributed shared memory in detail' };

  /* ───────────── the programming-model map, wrapped with an entry-specific "why" ───────────── */
  const MAP_SENT = {
    thread: (p) => [p ? 'A thread' : 'A CUDA thread', 'runs on a', 'core'],
    registers: () => ['Registers', 'live in a slice of the SM’s', 'regfile'],
    block: (p) => [p ? 'A cooperative thread array (CTA)' : 'A thread block', 'is scheduled onto a single', 'sm'],
    shared: () => ['Shared memory', 'lives in the SM’s', 'l1'],
    grid: (p) => [p ? 'A grid of CTAs' : 'A thread block grid', 'runs across all the SMs of the', 'gpu'],
    global: () => ['Global memory', 'lives in', 'ram'],
  };
  function mapFig(slot, ctx, o) {
    const MM = GG.components.modelMap;
    const f = ctx.figure(slot, { title: o.title, hint: o.hint || 'hover, tap or Tab into a level', wide: true, caption: o.caption });
    const host = el('div', { class: 'dsc-w' });
    f.stage.append(host);
    if (!MM) { host.innerHTML = '<p class="c-dim">The programming-model diagram is unavailable.</p>'; return { f }; }
    const LBY = MM.LEVELS_BY;
    const st = { keys: o.highlight, names: o.names || 'cuda', why: o.why };
    let map = null;
    const nameOf = (l) => (st.names === 'ptx' && l.ptxName ? l.ptxName : l.name);
    const termOf = (l) => (st.names === 'ptx' && l.ptxTerm ? l.ptxTerm : l.term);
    function levelWhy(k) {
      const l = LBY[k];
      const sw = l.side === 'software' ? l : LBY[l.pair];
      const [subj, verb, hwKey] = MAP_SENT[sw.key](st.names === 'ptx');
      const hw = LBY[hwKey];
      const d = st.names === 'ptx' && l.ptxDesc ? l.ptxDesc : l.desc;
      return `${T(termOf(sw), esc(subj))} ${verb} ${T(termOf(hw), esc(nameOf(hw)))}. ${esc(d)}`;
    }
    const whyNow = () => (typeof st.why === 'function' ? st.why() : st.why);
    function build() {
      if (map) map.destroy();
      map = MM(host, { highlight: st.keys, names: st.names, caption: false, ariaLabel: o.ariaLabel });
      map.on('hover', (e) => f.setWhy(e ? levelWhy(e.key) : whyNow()));
      map.on('select', (e) => {
        if (!e.key) map.highlight(st.keys);
        f.setWhy(e.key ? levelWhy(e.key) : whyNow());
      });
      f.setWhy(whyNow());
    }
    build();
    return {
      f,
      get map() { return map; },
      set(keys, why) { st.keys = keys; if (why !== undefined) st.why = why; if (map) map.highlight(keys); f.setWhy(whyNow()); },
      setNames(n) { st.names = n; build(); },
    };
  }

  /* ═════════════════════════════ Thread Block ═════════════════════════════ */

  GG.css(`
.dsc-bs-note { font: 500 11.5px/1.5 var(--font-mono); color: var(--ink-3); margin-top: 8px; }
.dsc-ord-top { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 14px; margin-bottom: 8px; }
.dsc-ord-top .dsc-formula { font-size: 12px; }
`);

  /* Fig: block size → warps */
  function blockSizeFig(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Threads per block, packed into warps',
      hint: 'drag the slider · hover or tap a thread',
      wide: true,
      caption: 'The full 32 × 32 chart is the largest block current devices allow: 32 warps × 32 lanes = 1,024 threads. Threads fill warps in order of their index (threads 0 to 31 form warp 0, 32 to 63 form warp 1, and so on). A block whose size is not a multiple of 32 still occupies a whole last warp, and the lanes without a thread idle whenever that warp runs.',
    });
    const wrap = el('div', { class: 'dsc-w' });
    f.stage.append(wrap);
    const host = el('div');
    wrap.append(host);
    legend(wrap, [['dsc-sw-core', 'a thread (an active lane)'], ['dsc-sw-danger', 'idle lane in a partly filled warp'], ['dsc-sw-idle', 'unused: room for more warps, up to 1,024 threads']]);
    const st = { n: 100, hover: -1 };
    const sl = GG.ui.slider(f.controls, { label: 'Threads per block', min: 1, max: 1024, value: st.n, format: (v) => fmt.int(v), onInput: (v) => { st.n = v; preset.set(null); redraw(); } });
    const preset = GG.ui.seg(f.controls, { label: 'Try', value: st.n, options: [32, 100, 128, 256, 1000, 1024].map((v) => ({ value: v, label: fmt.int(v) })), onChange: (v) => { st.n = v; sl.set(v); redraw(); } });
    const sWarps = GG.ui.stat(f.readouts, { label: 'warps', tone: 'core' });
    const sLast = GG.ui.stat(f.readouts, { label: 'last warp', tone: 'core' });
    const sIdle = GG.ui.stat(f.readouts, { label: 'idle lanes' });
    const sUse = GG.ui.stat(f.readouts, { label: 'lanes used' });
    let W = 0, geo = null, svg = null;

    function layout(w) {
      const cols = w >= 620 ? 2 : 1;
      const labW = 30, gap = 26, headH = 16;
      const colW = (w - (cols - 1) * gap) / cols;
      const cw = Math.min(15, (colW - labW) / 32);
      const ch = Math.min(cw, 12);
      const rowH = ch + (cols === 2 ? 4 : 3);
      const rows = 32 / cols;
      return { cols, labW, gap, colW, cw, ch, rowH, rows, headH, H: headH + rows * rowH + 2 };
    }
    function cellXY(t) {
      const w = Math.floor(t / 32), l = t % 32;
      const c = Math.floor(w / geo.rows), r = w % geo.rows;
      const x0 = c * (geo.colW + geo.gap) + geo.labW;
      return [x0 + l * geo.cw, geo.headH + r * geo.rowH, w, l];
    }
    function draw(w) {
      W = w;
      geo = layout(w);
      clear(host);
      svg = svgEl(host, W, geo.H, 'A thread block drawn as up to 32 warps of 32 lanes each. Active threads, idle lanes and unused warp slots are shaded differently.');
      const n = st.n, warps = Math.ceil(n / 32);
      for (let c = 0; c < geo.cols; c++) {
        const x0 = c * (geo.colW + geo.gap) + geo.labW;
        [0, 8, 16, 24, 31].forEach((l) => Tx(svg, x0 + l * geo.cw + geo.cw / 2, 10, String(l), { size: 9, fill: 'var(--ink-3)', anchor: 'middle' }));
        if (c === 0) Tx(svg, 0, 10, 'lane', { size: 9, fill: 'var(--ink-3)' });
      }
      const hw = st.hover >= 0 && st.hover < n ? Math.floor(st.hover / 32) : -1;
      for (let wi = 0; wi < 32; wi++) {
        const [xa, y] = cellXY(wi * 32);
        const used = wi < warps;
        const partial = used && wi === warps - 1 && n % 32 !== 0;
        Tx(svg, xa - 5, y + geo.ch - 1.5, 'w' + wi, { size: 9, anchor: 'end', fill: partial ? 'var(--danger)' : used ? 'var(--ink-2)' : 'var(--ink-3)', opacity: used ? 1 : 0.6 });
        if (wi === hw) R(svg, xa - 2, y - 2, geo.cw * 32 + 3, geo.ch + 4, { stroke: 'var(--accent)', sw: 1.2, rx: 3 });
        for (let l = 0; l < 32; l++) {
          const t = wi * 32 + l, x = xa + l * geo.cw;
          const pad = geo.cw > 9 ? 1.2 : 0.9;
          if (t < n) R(svg, x + pad / 2, y, geo.cw - pad, geo.ch, { rx: 1.5, fill: t === st.hover ? 'var(--accent)' : 'var(--core)', opacity: t === st.hover ? 1 : 0.82 });
          else if (used) R(svg, x + pad / 2 + 0.5, y + 0.5, geo.cw - pad - 1, geo.ch - 1, { rx: 1.5, fill: 'var(--danger-a)', stroke: 'var(--danger)', sw: 0.8, opacity: 0.95 });
          else R(svg, x + pad / 2 + 0.5, y + 0.5, geo.cw - pad - 1, geo.ch - 1, { rx: 1.5, stroke: 'var(--line-2)', sw: 0.7, opacity: 0.8 });
        }
      }
      svg.addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch') onMove(e); });
      svg.addEventListener('click', onMove);
      svg.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch' && st.hover !== -1) { st.hover = -1; draw(W); why(); } });
    }
    function onMove(e) {
      const [px, py] = svgPoint(svg, e);
      let hit = -1;
      for (let c = 0; c < geo.cols; c++) {
        const x0 = c * (geo.colW + geo.gap) + geo.labW;
        if (px < x0 || px > x0 + 32 * geo.cw) continue;
        const r = Math.floor((py - geo.headH) / geo.rowH);
        if (r < 0 || r >= geo.rows) continue;
        const l = Math.floor((px - x0) / geo.cw);
        hit = (c * geo.rows + r) * 32 + l;
      }
      if (hit >= st.n) hit = -1;
      if (hit !== st.hover) { st.hover = hit; draw(W); why(); }
    }
    function why() {
      const n = st.n, warps = Math.ceil(n / 32), last = n - (warps - 1) * 32, idle = warps * 32 - n;
      if (st.hover >= 0) {
        const w = Math.floor(st.hover / 32), l = st.hover % 32;
        f.setWhy(`Thread <b>${st.hover}</b> is lane <b>${l}</b> of warp <b>${w}</b>: warp ${w} holds threads ${w * 32} to ${Math.min(n, w * 32 + 32) - 1}. The warp scheduler issues one instruction for all of a warp’s lanes at once.`);
        return;
      }
      if (idle === 0) {
        f.setWhy(`<b>${fmt.int(n)} threads</b> make exactly <b>${warps} warp${warps > 1 ? 's' : ''}</b>, so every lane has a thread.${n === 1024 ? ' This is the largest block current devices allow.' : ''}`);
      } else {
        f.setWhy(`<b>${fmt.int(n)} thread${n > 1 ? 's' : ''}</b> need${n > 1 ? '' : 's'} <b>${warps} warp${warps > 1 ? 's' : ''}</b>. ${warps > 1 ? 'The last one' : 'Its single warp'} holds only ${last} thread${last > 1 ? 's' : ''}, so ${idle} of its 32 lanes idle whenever it runs: ${fmt.pct(idle / (warps * 32), 1)} of the block’s lanes do no work. Rounding up to ${fmt.int(warps * 32)} threads would fill them.`);
      }
    }
    function redraw() {
      const n = st.n, warps = Math.ceil(n / 32), last = n - (warps - 1) * 32, idle = warps * 32 - n;
      sWarps.set(warps);
      sLast.set(last + ' / 32', idle ? 'danger' : 'core');
      sIdle.set(idle, idle ? 'danger' : null);
      sUse.set(fmt.pct(n / (warps * 32), 1));
      if (W) draw(W);
      why();
    }
    onWidth(host, (w) => draw(w));
    redraw();
  }

  /* Fig: any execution order must be valid */
  function orderFig(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Blocks in any order: same answer, or a bug',
      hint: 'pick a kernel and a schedule · new order · play',
      wide: true,
      caption: 'Eight blocks, each doing three steps: read its inputs, compute, write its output. A schedule is one legal order of those 24 steps; the only rule is that each block’s own steps stay in order. The top rows show when each step happens (time runs left to right), the rows below show memory after the schedule (during Play, memory so far). The dependent kernel is a deliberate counter-example: block b reads out[b−1], a value another block writes. Its curves run from the write of out[b−1] down to the read that needs it (arrowhead); green means the write came first, red dashed with a ✕ means the read came first and saw a stale 0.',
    });
    const wrap = el('div', { class: 'dsc-w' });
    f.stage.append(wrap);
    const top = el('div', { class: 'dsc-ord-top' });
    const code = el('div', { class: 'dsc-formula' });
    const status = el('span', { class: 'dsc-status' });
    top.append(code, status);
    wrap.append(top);
    const host = el('div');
    wrap.append(host);
    const leg = legend(wrap, []);
    const setLegend = () => {
      const items = [['dsc-sw-memory-a', 'read inputs'], ['dsc-sw-core-a', 'compute'], ['dsc-sw-memory', 'write output'], ['dsc-sw-danger', 'read a value too early (stale)']];
      if (st.kernel === 'dep') items.push(['dsc-sw-core', 'curve: out[b−1] was written before the read']);
      leg.innerHTML = items.map(([c, l]) => `<span><i class="${c}"></i>${l}</span>`).join('');
    };

    const IN = [3, 1, 4, 1, 5, 9, 2, 6];
    const NB = 8;
    const st = { kernel: 'indep', sched: 'shuffle', seed: 7, events: [], t: Infinity, tries: 0, good: 0, playing: false };
    const kSeg = GG.ui.seg(f.controls, { label: 'Kernel', value: st.kernel, options: [
      { value: 'indep', label: 'independent', title: 'out[b] = 2 × in[b]' },
      { value: 'dep', label: 'dependent', title: 'out[b] = out[b−1] + in[b]' },
    ], onChange: (v) => { st.kernel = v; st.tries = 0; st.good = 0; setLegend(); make(false); } });
    const sSeg = GG.ui.seg(f.controls, { label: 'Schedule', value: st.sched, options: [
      { value: 'serial', label: 'serial, 0→7' },
      { value: 'shuffle', label: 'serial, shuffled' },
      { value: 'inter', label: 'interleaved' },
      { value: 'par', label: 'all at once' },
    ], onChange: (v) => { st.sched = v; make(false); } });
    const btnRow = el('div', { class: 'dsc-row' });
    f.controls.append(btnRow);
    GG.ui.button(btnRow, { label: 'New order', icon: 'reset', onClick: () => { st.seed = (st.seed * 7919 + 13) % 100003; make(false); } });
    const playBtn = GG.ui.button(btnRow, { label: 'Play', icon: 'play', onClick: () => play() });
    const sTries = GG.ui.stat(f.readouts, { label: 'schedules run' });
    const sGood = GG.ui.stat(f.readouts, { label: 'same result', tone: 'core' });
    const sStale = GG.ui.stat(f.readouts, { label: 'stale reads' });
    kSeg.el.title = 'Which kernel the eight blocks run';

    function schedule() {
      const r = rng(st.seed * 31 + (st.sched === 'inter' ? 5 : 0));
      const ev = [];
      if (st.sched === 'serial' || st.sched === 'shuffle') {
        const order = st.sched === 'serial' ? range(NB) : shuffled(range(NB), r);
        order.forEach((b, pos) => { for (let s = 0; s < 3; s++) ev.push({ b, s, t: pos * 3 + s }); });
      } else if (st.sched === 'inter') {
        const left = range(NB).map(() => 0);
        for (let t = 0; t < NB * 3; t++) {
          const cand = range(NB).filter((b) => left[b] < 3);
          // weight by remaining steps so every interleaving is about equally likely
          let tot = cand.reduce((a, b) => a + (3 - left[b]), 0), pick = r() * tot, b = cand[0];
          for (const c of cand) { pick -= 3 - left[c]; if (pick <= 0) { b = c; break; } }
          ev.push({ b, s: left[b], t });
          left[b]++;
        }
      } else {
        for (let b = 0; b < NB; b++) for (let s = 0; s < 3; s++) ev.push({ b, s, t: s });
      }
      return ev;
    }
    function expected() {
      if (st.kernel === 'indep') return IN.map((x) => 2 * x);
      let acc = 0;
      return IN.map((x) => (acc += x));
    }
    /* simulate the schedule up to (and including) time tMax */
    function simulate(tMax) {
      const out = range(NB).map(() => 0);
      const written = range(NB).map(() => false);
      const reg = range(NB).map(() => null);
      const stale = range(NB).map(() => false);
      const writeT = range(NB).map(() => Infinity);
      st.events.forEach((e) => { if (e.s === 2) writeT[e.b] = e.t; });
      const evs = st.events.filter((e) => e.t <= tMax).sort((a, b) => a.t - b.t || a.s - b.s);
      for (const e of evs) {
        if (e.s === 0) {
          const prev = st.kernel === 'dep' && e.b > 0 ? out[e.b - 1] : 0;
          reg[e.b] = { x: IN[e.b], prev };
          if (st.kernel === 'dep' && e.b > 0 && writeT[e.b - 1] > e.t) stale[e.b] = true;
        } else if (e.s === 1) {
          reg[e.b].val = st.kernel === 'indep' ? 2 * reg[e.b].x : reg[e.b].prev + reg[e.b].x;
        } else {
          out[e.b] = reg[e.b].val;
          written[e.b] = true;
        }
      }
      return { out, written, stale, writeT, reg };
    }
    function make(silent) {
      st.events = schedule();
      st.t = Infinity;
      if (anim) anim.stop();
      st.playing = false;
      playBtn.setLabel('Play', 'play');
      const fin = simulate(Infinity);
      const exp = expected();
      const ok = fin.out.every((v, i) => v === exp[i]);
      if (!silent) { st.tries++; if (ok) st.good++; }
      render();
    }
    let W = 0;
    const readT = () => { const r = range(NB).map(() => Infinity); st.events.forEach((e) => { if (e.s === 0) r[e.b] = e.t; }); return r; };
    function render() {
      const playing = st.t !== Infinity;
      const fin = simulate(Infinity);
      const now = simulate(st.t);
      const exp = expected();
      const rt = readT();
      const nWrong = fin.out.filter((v, i) => v !== exp[i]).length;
      const nStale = fin.stale.filter(Boolean).length;
      const staleNow = fin.stale.filter((x, b) => x && rt[b] <= st.t).length;
      code.innerHTML = st.kernel === 'indep'
        ? '<span class="d">each block b:</span> <b>out[b]</b> = 2 × <b>in[b]</b>'
        : '<span class="d">each block b:</span> <b>out[b]</b> = <span class="r">out[b−1]</span> + <b>in[b]</b>';
      const lucky = st.kernel === 'dep' && !nWrong;
      if (playing) {
        status.className = 'dsc-status ' + (staleNow ? 'bad' : 'wait');
        status.textContent = staleNow ? `running · ${staleNow} stale read${staleNow > 1 ? 's' : ''} so far` : 'running';
      } else {
        status.className = 'dsc-status ' + (nWrong ? 'bad' : lucky ? 'wait' : 'ok');
        status.textContent = nWrong ? `${nWrong} of 8 outputs wrong` : lucky ? 'right by luck' : 'correct result';
      }
      sTries.set(st.tries);
      sGood.el.querySelector('i').textContent = st.kernel === 'dep' ? 'right by luck' : 'same result';
      sGood.set(`${st.good} / ${st.tries}`, st.kernel === 'dep' ? (st.good ? 'control' : null) : st.good === st.tries ? 'core' : 'danger');
      sStale.set(playing ? staleNow : nStale, (playing ? staleNow : nStale) ? 'danger' : null);
      if (W) draw(W, now, fin, exp);
      if (playing) f.setWhy(narrate(st.t, now, exp));
      else whyText(nWrong, nStale, fin);
    }
    /* what happens at time tt, during Play */
    function narrate(tt, now, exp) {
      if (tt < 0) return 'Play: the schedule runs one time step at a time. Watch the memory rows fill in.';
      const evs = st.events.filter((e) => e.t === tt);
      const dep = st.kernel === 'dep';
      const head = `<b>Time ${tt + 1} of ${Math.max(...st.events.map((e) => e.t)) + 1}.</b> `;
      if (!evs.length) return head;
      if (evs.length > 1) {
        const s0 = evs[0].s;
        if (s0 === 0) return head + (dep ? 'All eight blocks read at once. Blocks 1 to 7 read <code>out[b−1]</code> before any block has written it, so every one of them gets a stale 0.' : 'All eight blocks read their own input at once.');
        if (s0 === 1) return head + 'All eight blocks compute at once.';
        return head + 'All eight blocks write their outputs at once.';
      }
      const e = evs[0], b = e.b, r = now.reg[b];
      if (e.s === 0) {
        if (!dep) return head + `B${b} reads <code>in[${b}]</code> = ${IN[b]}.`;
        if (b === 0) return head + `B0 reads <code>in[0]</code> = ${IN[0]}. It has no left neighbour, so it starts from 0.`;
        const ready = now.writeT[b - 1] < tt;
        return head + (ready ? `B${b} reads <code>out[${b - 1}]</code> = ${r.prev}: B${b - 1} has already written it.` : `B${b} reads <code>out[${b - 1}]</code> = 0: <b>B${b - 1} has not written yet</b>, so this read is stale.`);
      }
      if (e.s === 1) return head + (dep ? `B${b} computes ${r.prev} + ${r.x} = ${r.val}.` : `B${b} computes 2 × ${r.x} = ${r.val}.`);
      return head + `B${b} writes <code>out[${b}]</code> = ${r.val}${r.val !== exp[b] ? ` (the right value is ${exp[b]})` : ''}.`;
    }
    function whyText(nWrong, nStale, fin) {
      const schedName = { serial: 'blocks one at a time, in index order', shuffle: 'blocks one at a time, in a shuffled order', inter: 'steps of different blocks interleaved', par: 'every block at once' }[st.sched];
      if (st.kernel === 'indep') {
        f.setWhy(`Schedule: ${schedName}. Each block reads only its own input and writes only its own output, so <b>no order can change the result</b>. Try every schedule, and New order as often as you like: it always comes out the same.`);
        return;
      }
      if (!nWrong) {
        f.setWhy(`Schedule: ${schedName}. Here the running total comes out right, because every block happened to run after its left neighbour. The programming model does not promise this order, so the kernel is still wrong: switch to any other schedule.`);
        return;
      }
      const first = fin.stale.findIndex(Boolean);
      if (first < 1) { f.setWhy(`Schedule: ${schedName}. <b>${nWrong} of 8 outputs are wrong.</b>`); return; }
      f.setWhy(`Schedule: ${schedName}. Block ${first} read out[${first - 1}] before block ${first - 1} had written it, so it started from a stale 0. <b>${nWrong} of 8 outputs are wrong</b>, and a different order breaks different ones. A block must never assume another block has already run, or wait for one that may not have started. Pass such results to a second kernel launch, use a pattern that does not depend on order (atomics plus a memory fence, as in a “last block” reduction), or opt in to a cooperative launch.`);
    }
    function draw(w, now, fin, exp) {
      clear(host);
      const labW = 30;
      const NT = 24;
      const cw = Math.min(30, Math.floor((w - labW - 4) / NT));
      const ch = Math.min(20, Math.max(12, cw - 4));
      const rowH = ch + 4;
      const gridW = NT * cw;
      const memTop = 18 + NB * rowH + 30;
      const mcw = Math.min(56, Math.floor((w - 70) / NB));
      const mch = 24;
      const H = memTop + 3 * (mch + 8) + 4;
      const root = svgEl(host, w, H, 'Schedule of eight blocks over time, and the resulting memory.');
      const contentW = Math.max(labW + gridW, 66 + NB * mcw - 5);
      const svg = S('g', { transform: `translate(${r2(Math.max(0, (w - contentW) / 2))},0)` }, root);
      // time axis
      Tx(svg, labW, 10, 'time →', { size: 9.5, fill: 'var(--ink-3)' });
      if (st.t !== Infinity) {
        const px = labW + (Math.min(st.t, NT - 1) + 1) * cw;
        L(svg, px, 14, px, 18 + NB * rowH, { stroke: 'var(--accent)', sw: 1.5 });
      }
      const cells = {};
      const rt = readT();
      const staleSeen = (b) => fin.stale[b] && rt[b] <= st.t;
      for (let b = 0; b < NB; b++) {
        const y = 18 + b * rowH;
        Tx(svg, labW - 6, y + ch - 3.5, 'B' + b, { size: 10, anchor: 'end', fill: staleSeen(b) ? 'var(--danger)' : 'var(--ink-2)' });
        R(svg, labW, y, gridW, ch, { fill: 'rgba(255,255,255,0.02)', rx: 3 });
      }
      for (const e of st.events) {
        const x = labW + e.t * cw + 1, y = 18 + e.b * rowH;
        const future = e.t > st.t;
        const kind = e.s === 0 ? 'read' : e.s === 1 ? 'compute' : 'write';
        const staleRead = e.s === 0 && staleSeen(e.b);
        const fill = kind === 'read' ? 'var(--memory-a)' : kind === 'compute' ? 'var(--core-a)' : 'var(--memory)';
        const stroke = staleRead ? 'var(--danger)' : kind === 'compute' ? 'var(--core)' : 'var(--memory)';
        R(svg, x, y, cw - 2, ch, { fill: staleRead ? 'var(--danger-a)' : fill, stroke, sw: staleRead ? 1.6 : 1, rx: 3, opacity: future ? 0.18 : 1 });
        if (cw >= 17) Tx(svg, x + (cw - 2) / 2, y + ch / 2 + 3.5, kind === 'read' ? 'R' : kind === 'compute' ? (st.kernel === 'indep' ? '×2' : '+') : 'W', { size: 9.5, anchor: 'middle', weight: 600, fill: kind === 'write' ? '#0b1220' : staleRead ? 'var(--danger)' : 'var(--ink)', opacity: future ? 0.3 : 1 });
        cells[e.b + ':' + e.s] = [x, y];
      }
      // dependency arrows for the dependent kernel: W of b−1 → R of b
      if (st.kernel === 'dep') {
        for (let b = 1; b < NB; b++) {
          const w0 = cells[(b - 1) + ':2'], r1 = cells[b + ':0'];
          if (!w0 || !r1) continue;
          const happened = rt[b] <= st.t;
          const bad = fin.stale[b] && happened;
          const col = !happened ? 'var(--ink-3)' : bad ? 'var(--danger)' : 'var(--core)';
          const x1 = w0[0] + (cw - 2) / 2, y1 = w0[1] + ch, x2 = r1[0] + (cw - 2) / 2, y2 = r1[1];
          const midY = (y1 + y2) / 2;
          P(svg, `M${r2(x1)} ${r2(y1)}C${r2(x1)} ${r2(midY)} ${r2(x2)} ${r2(midY)} ${r2(x2)} ${r2(y2)}`, { stroke: col, sw: 1.2, dash: bad || !happened ? '3 3' : null, opacity: happened ? 0.9 : 0.45 });
          // arrowhead at the read that needs the value
          P(svg, `M${r2(x2 - 3.2)} ${r2(y2 - 5)}L${r2(x2)} ${r2(y2 + 0.5)}L${r2(x2 + 3.2)} ${r2(y2 - 5)}Z`, { fill: col, opacity: happened ? 1 : 0.45 });
          if (bad) Tx(svg, x2 - 5, y2 - 1, '✕', { size: 9, anchor: 'end', fill: 'var(--danger)', weight: 700, halo: true });
        }
      }
      // memory rows
      const rows = [['in', IN, null], ['out', now.out, now.written], [st.kernel === 'dep' ? 'correct' : 'expected', exp, null]];
      rows.forEach(([name, vals, written], ri) => {
        const y = memTop + ri * (mch + 8);
        Tx(svg, 0, y + mch / 2 + 4, name, { size: 10.5, fill: ri === 2 ? 'var(--ink-3)' : 'var(--ink-2)' });
        for (let b = 0; b < NB; b++) {
          const x = 66 + b * mcw;
          const wrong = ri === 1 && written[b] && vals[b] !== exp[b];
          const done = ri !== 1 || written[b];
          R(svg, x, y, mcw - 5, mch, { rx: 4, fill: ri === 1 ? (wrong ? 'var(--danger-a)' : done ? 'var(--memory-a)' : 'rgba(255,255,255,0.03)') : 'rgba(255,255,255,0.03)', stroke: wrong ? 'var(--danger)' : ri === 1 ? 'var(--memory)' : 'var(--line-2)', sw: 1, opacity: ri === 2 ? 0.7 : 1 });
          Tx(svg, x + (mcw - 5) / 2, y + mch / 2 + 4.5, done ? String(vals[b]) : '0', { size: 12, anchor: 'middle', weight: 600, fill: wrong ? 'var(--danger)' : ri === 1 && !done ? 'var(--ink-3)' : ri === 2 ? 'var(--ink-3)' : 'var(--ink)' });
          if (ri === 0) Tx(svg, x + (mcw - 5) / 2, memTop - 8, '[' + b + ']', { size: 9, anchor: 'middle', fill: 'var(--ink-3)' });
        }
      });
    }
    let anim = null;
    function play() {
      if (st.playing) { st.playing = false; if (anim) anim.stop(); playBtn.setLabel('Play', 'play'); st.t = Infinity; render(); return; }
      st.playing = true;
      playBtn.setLabel('Stop', 'pause');
      if (!anim) {
        anim = GG.anim(wrap, (t) => {
          if (!st.playing) { anim.stop(); return; }
          const Tend = Math.max(...st.events.map((e) => e.t));
          const step = Math.floor(t / 0.28) - 1;
          if (step > Tend + 2) { anim.stop(); st.playing = false; playBtn.setLabel('Play', 'play'); st.t = Infinity; render(); return; }
          const tt = Math.min(step, Tend);
          if (tt !== st.t) { st.t = tt; render(); }
        }, { autostart: false });
      }
      anim.reset();
      st.t = -1;
      render();
      anim.start();
    }
    onWidth(host, (w) => { W = w; render(); });
    setLegend();
    make(false);
  }

  /* Fig: threads of one block cooperate through shared memory and a barrier; another block cannot see it */
  function coopFig(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Inside a block: shared memory and a barrier',
      hint: 'step through · switch the barrier off',
      wide: true,
      caption: 'Two blocks of four threads run <code>s[t] = in[i]; __syncthreads(); out[i] = s[(t + 1) % 4];</code>: each thread writes one slot of its block’s shared memory <code>s</code> (top row), then reads its right-hand neighbour’s slot into its output <code>out[i]</code> (bottom row). A slot nobody has written yet holds whatever was there before (undefined), drawn as “?”. With the barrier off, the figure plays one legal timing in which threads 1 and 3 are slow to write: dashed arrows are writes still in flight. In an ordinary launch the crossed arrow between the blocks is a path that does not exist: neither block can see the other’s <code>s</code> (thread block clusters, an opt-in feature of compute capability 9.0, are the exception; see Thread Hierarchy).',
    });
    const wrap = el('div', { class: 'dsc-w' });
    f.stage.append(wrap);
    const top = el('div', { class: 'dsc-ord-top' });
    const code = el('div', { class: 'dsc-formula' });
    const status = el('span', { class: 'dsc-status' });
    top.append(code, status);
    wrap.append(top);
    const host = el('div');
    wrap.append(host);
    legend(wrap, [['dsc-sw-memory', 'write to shared memory (dashed: still in flight)'], ['dsc-sw-core', 'read of a value that was ready'], ['dsc-sw-control', 'barrier'], ['dsc-sw-danger', 'read too early: undefined value']]);
    const IN = [[3, 1, 4, 1], [5, 9, 2, 6]];
    const SLOW = [1, 3], FAST = [0, 2];
    const nb = (t) => (t + 1) % 4;
    const st = { bar: true, k: 2 };
    const stepHost = el('div');
    f.controls.append(stepHost);
    GG.ui.toggle(f.controls, { label: 'barrier (__syncthreads)', value: true, onChange: (v) => { st.bar = v; build(v ? 2 : 1); } });
    const sStale = GG.ui.stat(f.readouts, { label: 'reads too early' });
    const sOk = GG.ui.stat(f.readouts, { label: 'correct reads', tone: 'core' });
    let W = 0, stepper = null;
    /* Each step: per thread t (same in both blocks): slot filled?, write arrow ('solid' | 'dashed' | 'late' | null),
       read {from, stale, now} or null; plus barrier, label, why. */
    const W_ALL = (kind) => [0, 1, 2, 3].map(() => kind);
    const READ = (t, now) => ({ from: nb(t), stale: false, now });
    function steps() {
      if (st.bar) return [
        { label: 'write', filled: [1, 1, 1, 1], wr: W_ALL('solid'), reads: [null, null, null, null], status: 'writing',
          why: 'Each thread writes its value into its own slot of <b>its block’s</b> ' + T('shared-memory', 'shared memory') + '. Block 0 and block 1 each have a separate <code>s</code>: same name, different memory.' },
        { label: 'barrier', filled: [1, 1, 1, 1], wr: W_ALL(null), reads: [null, null, null, null], barrier: true, status: 'waiting at barrier',
          why: 'The barrier: no thread of a block goes past <code>__syncthreads()</code> until all four threads of <b>that block</b> have arrived, so every slot of its <code>s</code> is written. Block 0’s barrier does not wait for block 1, and could not: the blocks may not even run at the same time.' },
        { label: 'read', filled: [1, 1, 1, 1], wr: W_ALL(null), reads: [0, 1, 2, 3].map((t) => READ(t, true)), status: 'done',
          why: 'Every thread reads its neighbour’s slot and gets the right value (green): thread 0 reads <code>s[1]</code>, thread 3 wraps round to <code>s[0]</code>. This is block-level cooperation: a shared workspace plus a barrier, available only to threads of the same block. Neither block can read the other’s <code>s</code>.' },
      ];
      return [
        { label: 'write starts', filled: [1, 0, 1, 0], wr: ['solid', 'dashed', 'solid', 'dashed'], reads: [null, null, null, null], status: 'writing',
          why: 'Each thread starts writing its slot. Threads 1 and 3 of each block are slower: their writes are still in flight (dashed) and their slots still show “?”. Perfectly legal, since nothing says the threads of a block move in step.' },
        { label: 'early reads', filled: [1, 0, 1, 0], wr: [null, 'dashed', null, 'dashed'], reads: [{ from: 1, stale: true, now: true }, null, { from: 3, stale: true, now: true }, null], status: 'reading too early',
          why: 'No barrier, so threads 0 and 2 go straight on to the read. Thread 0 reads <code>s[1]</code> and thread 2 reads <code>s[3]</code> (red arrows) while threads 1 and 3 are still writing them: both get whatever the memory held before, an undefined value.' },
        { label: 'late writes land', filled: [1, 1, 1, 1], wr: [null, 'late', null, 'late'], reads: [{ from: 1, stale: true }, null, { from: 3, stale: true }, null], status: 'late writes',
          why: 'The slow writes land: slots 1 and 3 now hold 1 and 1 (block 0) and 9 and 6 (block 1). Too late: threads 0 and 2 have already copied the old contents into their outputs, and nothing re-reads them.' },
        { label: 'late reads', filled: [1, 1, 1, 1], wr: W_ALL(null), reads: [{ from: 1, stale: true }, READ(1, true), { from: 3, stale: true }, READ(3, true)], status: 'done',
          why: 'Threads 1 and 3 read <code>s[2]</code> and <code>s[0]</code>, which were written long ago, and get the right values (green). End result: <b>4 of 8 reads were too early</b>, and a different timing would break different ones. The barrier is what makes the cooperation safe.' },
      ];
    }
    let ST = [];
    function draw(w) {
      W = w;
      clear(host);
      const S0 = ST[st.k];
      const narrow = w < 600;
      const labW = narrow ? 46 : 92;
      const gap = 30, bw = (w - labW - gap) / 2;
      const cw = Math.min(54, (bw - 16) / 4);
      // on phones the thread labels sit above the strands, so everything moves down a little
      const dy = narrow ? 12 : 0;
      const thY = 26 + dy, thL = 30, sY = 74 + dy, sH = 26, barY = 118 + dy, rY = 134 + dy, rH = 26;
      const H = rY + rH + 8;
      const svg = svgEl(host, w, H, 'Two thread blocks, each with four threads and a four-slot shared memory, writing and then reading neighbouring slots. Step: ' + S0.label + '.');
      const bx0 = (b) => labW + b * (bw + gap);
      const cx = (b, t) => bx0(b) + 8 + (bw - 16 - 4 * cw) / 2 + t * cw + cw / 2;
      // row labels
      const rowLab = (y, a, b2, col) => { Tx(svg, 0, y, a, { size: 10, fill: col, weight: 600 }); if (b2) Tx(svg, 0, y + 12, b2, { size: 9, fill: 'var(--ink-3)' }); };
      rowLab(thY + 14, narrow ? 'thread' : 'threads', null, 'var(--ink-2)');
      rowLab(sY + 11, 's[ ]', narrow ? 'shared' : 'shared memory', 'var(--memory)');
      rowLab(rY + 11, 'out[i]', narrow ? 'read' : 'value read', 'var(--ink)');
      for (let b = 0; b < 2; b++) {
        const x0 = bx0(b);
        R(svg, x0, 0, bw, H - 2, { rx: 8, fill: 'rgba(255,255,255,0.02)', stroke: 'var(--ink-3)', sw: 1.1 });
        Tx(svg, x0 + 9, 15, 'block ' + b, { size: 10.5, fill: 'var(--ink)', weight: 600 });
        Tx(svg, x0 + bw - 9, 15, bw > 150 ? 'its own s[4]' : 's[4]', { size: 9.5, anchor: 'end', fill: 'var(--memory)' });
        for (let t = 0; t < 4; t++) {
          const x = cx(b, t);
          const wr = S0.wr[t];
          strand(svg, x, thY, thL, { amp: 1.8, wl: 9, phase: t * 0.7 + b, sw: 1.3, stroke: 'var(--ink-2)', hw: 2.4 });
          if (narrow) Tx(svg, x, thY - 3, 't' + t, { size: 9, anchor: 'middle', fill: 'var(--ink-3)' });
          else Tx(svg, x + cw / 2 - 3, thY + 10, 't' + t, { size: 9, anchor: 'end', fill: 'var(--ink-3)' });
          // shared slot
          const filled = !!S0.filled[t];
          const hot = wr === 'solid' || wr === 'late';
          R(svg, x - cw / 2 + 3, sY, cw - 6, sH, { rx: 4, fill: filled ? (hot ? 'rgba(111,166,255,0.45)' : 'var(--memory-a)') : 'rgba(255,255,255,0.02)', stroke: 'var(--memory)', sw: hot ? 1.5 : 1, dash: filled ? null : '3 3' });
          Tx(svg, x, sY + sH / 2 + 4, filled ? String(IN[b][t]) : '?', { size: 11.5, anchor: 'middle', weight: 600, fill: filled ? 'var(--ink)' : 'var(--ink-3)' });
          if (wr) {
            const dashed = wr === 'dashed';
            P(svg, `M${r2(x)} ${thY + thL + 1}V${sY - 2}`, { stroke: 'var(--memory)', sw: 1.5, dash: dashed ? '3 3' : null, opacity: dashed ? 0.7 : 1 });
            if (!dashed) P(svg, `M${r2(x - 3.5)} ${sY - 7}L${r2(x)} ${sY - 1}L${r2(x + 3.5)} ${sY - 7}`, { stroke: 'var(--memory)', sw: 1.5 });
            if (wr === 'late') Tx(svg, x + 5, sY - 9, 'late', { size: 8.5, fill: 'var(--danger)', halo: true });
          }
          // read result
          const rd = S0.reads[t];
          const col = rd ? (rd.stale ? 'var(--danger)' : 'var(--core)') : 'var(--line-2)';
          R(svg, x - cw / 2 + 3, rY, cw - 6, rH, { rx: 4, fill: rd ? (rd.stale ? 'var(--danger-a)' : 'var(--core-a)') : 'rgba(255,255,255,0.02)', stroke: col, sw: rd && rd.now ? 1.5 : 1, dash: rd ? null : '3 3' });
          Tx(svg, x, rY + rH / 2 + 4, rd ? (rd.stale ? '?' : String(IN[b][rd.from])) : '', { size: 11.5, anchor: 'middle', weight: 600, fill: rd ? (rd.stale ? 'var(--danger)' : 'var(--ink)') : 'var(--ink-3)' });
          if (rd && rd.now) {
            const fx = cx(b, rd.from);
            P(svg, `M${r2(fx)} ${sY + sH + 1}C${r2(fx)} ${r2(sY + sH + 18)} ${r2(x)} ${r2(rY - 18)} ${r2(x)} ${rY - 2}`, { stroke: col, sw: 1.5, opacity: 0.95 });
            P(svg, `M${r2(x - 3.5)} ${rY - 7}L${r2(x)} ${rY - 1}L${r2(x + 3.5)} ${rY - 7}`, { stroke: col, sw: 1.5 });
          }
        }
        if (S0.barrier) {
          L(svg, x0 + 6, barY, x0 + bw - 6, barY, { stroke: 'var(--control)', sw: 1.8, dash: '6 4' });
          Tx(svg, x0 + bw / 2, barY - 3, '__syncthreads()', { size: 9, anchor: 'middle', fill: 'var(--control)' });
        }
      }
      // no path between the blocks
      const ax0 = bx0(0) + bw - 2, ax1 = bx0(1) + 2, ay = sY + sH / 2;
      P(svg, `M${r2(ax0)} ${ay}H${r2(ax1)}`, { stroke: 'var(--danger)', sw: 1.2, dash: '3 3', opacity: 0.8 });
      const mx = bx0(0) + bw + gap / 2;
      L(svg, mx - 5, ay - 5, mx + 5, ay + 5, { stroke: 'var(--danger)', sw: 1.6 });
      L(svg, mx - 5, ay + 5, mx + 5, ay - 5, { stroke: 'var(--danger)', sw: 1.6 });
    }
    function show(k) {
      st.k = k;
      const S0 = ST[k];
      code.innerHTML = st.bar
        ? '<span class="d">each thread t:</span> s[t] = in[i]; <span class="a">__syncthreads();</span> out[i] = s[(t + 1) % 4];'
        : '<span class="d">each thread t:</span> s[t] = in[i]; <span class="r">/* no barrier */</span> out[i] = s[(t + 1) % 4];';
      const reads = S0.reads.filter(Boolean);
      const stale = 2 * reads.filter((r) => r.stale).length, okN = 2 * (reads.length - reads.filter((r) => r.stale).length);
      const done = k === ST.length - 1;
      status.className = 'dsc-status ' + (done ? (stale ? 'bad' : 'ok') : stale ? 'bad' : S0.barrier ? 'wait' : '');
      status.textContent = done ? (stale ? `${stale} of 8 reads too early` : 'every read correct') : S0.status;
      sStale.set(reads.length ? stale : '—', stale ? 'danger' : null);
      sOk.set(reads.length ? `${okN} / 8` : '—');
      if (W) draw(W);
      f.setWhy(S0.why);
    }
    function build(start) {
      ST = steps();
      if (stepper) stepper.stop();
      clear(stepHost);
      stepper = GG.ui.stepper(stepHost, { label: 'Step', steps: ST, onStep: show, autoplay: 1800, start: Math.min(start, ST.length - 1) });
    }
    build(2);
    onWidth(host, (w) => draw(w));
  }

  GG.entry('thread-block', {
    render(body, ctx) {
      body.classList.add('dsc-body');
      const s = ctx.html(body, `
<p>A <strong>thread block</strong> is a level of the ${T('cuda-programming-model', 'CUDA programming model’s')} ${T('thread-hierarchy', 'thread hierarchy')}: below a ${T('thread-block-grid', 'grid')}, above a ${T('thread', 'thread')}. It is a team of threads that the GPU guarantees will run together, on one ${T('streaming-multiprocessor', 'Streaming Multiprocessor (SM)')}, and it is the team size at which threads are allowed to cooperate.</p>
<div data-slot="map" class="wide"></div>
<p>The thread block is the programming model’s <em>abstract</em> equivalent of the <em>concrete</em> ${T('cooperative-thread-array', 'cooperative thread arrays (CTAs)')} of ${T('parallel-thread-execution', 'PTX')} and ${T('streaming-assembler', 'SASS')}. “Abstract” here means the idea as a programmer writing ${T('cuda-c', 'CUDA C++')} meets it; “concrete” means the object the compiler and hardware actually handle once that code is translated to PTX and then to SASS. They are the same group of threads under two names, which is why Fig. 1 can switch between them.</p>

<h3>The smallest unit of coordination</h3>
<p>Blocks are the smallest unit of thread coordination that the CUDA programming model exposes to programmers. Inside a block, threads can share data through the block’s ${T('shared-memory', 'shared memory')} and can wait for each other at barriers (in CUDA C++, <code>__syncthreads()</code>: no thread of the block continues past it until every thread of the block has reached it). In an ordinary launch there is no such tool between blocks. (The one exception is opt-in: on ${T('compute-capability', 'compute capability')} 9.0 GPUs such as the H100, blocks can be grouped into a <em>cluster</em> that runs on one ${T('graphics-processing-cluster', 'GPU Processing Cluster')} and shares a cluster-wide barrier and distributed shared memory; see ${T('thread-hierarchy', 'Thread Hierarchy')}.) That boundary is what makes a block a <em>unit</em>: the threads inside it can be written as a team, the blocks outside it must be written as strangers. Fig. 2 shows both halves.</p>
<div data-slot="coop" class="wide"></div>
${GG.noteHTML('beyond', '<p><b>What about warps?</b> A block is carved into ' + T('warp', 'warps') + ' of 32 threads, and CUDA C++ does also expose coordination below the block: warp-level primitives such as <code>__shfl_sync</code>, which exchanges register values between the lanes of a warp, and <code>__syncwarp</code>, a barrier for one warp, plus Cooperative Groups tiles (<code>thread_block_tile</code>) for smaller groups of a block’s threads. These are real coordination tools. The glossary’s statement refers to the classic thread, block and grid hierarchy, in which the block is the smallest level that comes with its own shared memory and barrier.</p>')}

<h3>Blocks must not depend on each other’s order</h3>
<p>Blocks must execute independently, so that <em>any</em> execution order for blocks is valid: from fully serial, in any order, to every possible interleaving. The GPU makes no promise about which block starts first, which runs alongside which, or which finishes last. A correct kernel gives the same result under all of them. Fig. 3 lets you try: the independent kernel survives every schedule you throw at it; the dependent one, where each block reads its neighbour’s output, breaks under almost all of them, and even its one lucky order is not a promise.</p>
<div data-slot="order" class="wide"></div>
<p>This rule is the price of scalability. Because no block may wait for another, the hardware can run the blocks of a grid one at a time on a GPU with a single SM, or all at once on a GPU with enough SMs, without changing the answer. The same program then runs faster on a bigger GPU (see ${T('thread-block-grid', 'Thread Block Grid')} for the same grid on GPUs of different sizes).</p>
${GG.noteHTML('quote', '<p>“Thread blocks are required to execute independently: It must be possible to execute them in any order, in parallel or in series.”</p><p style="font-size:14px;color:var(--ink-2)">NVIDIA’s <a href="' + CPG124 + '#thread-hierarchy">CUDA C++ Programming Guide</a> (quoted from the CUDA 12.4 edition; the restructured current guide words it as “it be possible to execute thread blocks in any order, in parallel or in series”). The glossary’s wording follows it.</p>', 'From NVIDIA’s guide')}

<h3>From one launch to many warps</h3>
<p>A single CUDA ${T('kernel', 'kernel')} launch produces one or more thread blocks, in the form of a ${T('thread-block-grid', 'thread block grid')}, and each block contains one or more ${T('warp', 'warps')}. The size of a block is chosen by the programmer at launch, as the second number in the triple chevrons: <code class="dsc-wc">kernel&lt;&lt;&lt;blocks, threadsPerBlock&gt;&gt;&gt;(…)</code>.</p>
<p>Blocks can be arbitrarily sized, up to a limit of <strong>1,024 threads</strong> on current devices, but they are typically a multiple of the warp size, <strong>32</strong> on current devices. The reason is in Fig. 4: the hardware schedules whole warps, so a block of 100 threads is really four warps, one of them mostly empty.</p>
<div data-slot="size" class="wide"></div>
<div data-slot="nums"></div>
${GG.noteHTML('beyond', '<p><b>Blocks can have shape.</b> The block size is really a <code>dim3</code>: up to three dimensions, <code>blockDim.x</code> × <code>blockDim.y</code> × <code>blockDim.z</code>, with x and y at most 1,024, z at most 64, and the product at most 1,024 threads. The shape only changes how threads are <em>numbered</em>; for grouping into warps, threads are ordered by a linear index in which x varies fastest, then y, then z. The ' + T('thread-block-grid', 'Thread Block Grid') + ' entry lets you build 1-, 2- and 3-D launches and click any thread.</p>')}
<div data-slot="read"></div>`);

      guard(s.map, 'Programming model map', () => {
        let names = 'cuda';
        const m = mapFig(s.map, ctx, {
          title: 'The thread block in the CUDA programming model',
          highlight: ['block', 'shared'],
          caption: 'Redrawn after the glossary’s figure, itself modified from NVIDIA’s CUDA Refresher and CUDA C++ Programming Guide. Left: thread blocks are the middle level of the thread hierarchy, with shared memory as their memory. Right: a thread block executes on a single Streaming Multiprocessor, whose L1 data cache holds that shared memory. Switch the names to see the PTX/SASS view of the same diagram.',
          why: () => (names === 'ptx'
            ? 'In PTX and SASS the same group of threads is a <b>cooperative thread array (CTA)</b>. It is still scheduled onto exactly one SM, where it can use that SM’s shared memory (in the L1 data cache) and barriers.'
            : 'Lit: a <b>thread block</b> and the <b>Streaming Multiprocessor</b> it runs on. All of a block’s threads live on that one SM, which is what lets them share its L1 data cache (as shared memory) and wait for each other at barriers.'),
        });
        GG.ui.seg(m.f.controls, { label: 'Names', value: 'cuda', options: [{ value: 'cuda', label: 'CUDA C++' }, { value: 'ptx', label: 'PTX / SASS' }], onChange: (v) => { names = v; m.setNames(v); } });
        return m;
      });
      guard(s.coop, 'Block cooperation figure', () => coopFig(s.coop, ctx));
      guard(s.order, 'Execution order demo', () => orderFig(s.order, ctx));
      guard(s.size, 'Block size figure', () => blockSizeFig(s.size, ctx));
      ctx.numbers(s.nums, [
        { value: '1,024', label: 'maximum threads per block on current devices', tone: 'core' },
        { value: '32', label: 'threads per warp: the unit the hardware schedules' },
        { value: '32', label: 'so at most 32 warps per block (1,024 ÷ 32)' },
        { value: '64', label: 'warps (2,048 threads) an H100 SM can hold at once, from up to 32 blocks', tone: 'control' },
      ]);
      ctx.reading(s.read, [REFRESHER, CPG, CPG_LIMITS]);
    },
  });


  /* ═════════════════════════════ Thread Block Grid ═════════════════════════════ */

  GG.css(`
.dsc-gb-info { display: grid; grid-template-columns: minmax(0, 1fr); gap: 10px; margin-top: 12px; }
@media (min-width: 880px) { .dsc-gb-info { grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); } }
.dsc-gb-sl { display: flex; flex-wrap: wrap; gap: 10px 16px; flex: 1 1 100%; }
.dsc-gb-sl .slider { flex: 1 1 150px; min-width: 130px; }
.dsc-gb-launch { font: 500 12.5px/1.6 var(--font-mono); color: var(--ink); background: #090a10; border: 1px solid var(--line); border-radius: 8px; padding: 7px 10px; white-space: pre-wrap; overflow-wrap: anywhere; }
.dsc-nw { white-space: nowrap; }
.dsc-gb-host { overflow-x: auto; overflow-y: hidden; -webkit-overflow-scrolling: touch; }
.dsc-gb-host svg.dsc-svg { overflow: hidden; }
.dsc-gb-launch .k { color: var(--control); }
`);

  /* Fig: grid builder / index explorer */
  function gridBuilderFig(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Build a launch, then click any thread',
      hint: 'set the dimensions · click a thread · arrow keys move',
      wide: true,
      caption: 'Every cell is one thread; heavy outlines group the threads of one block. In 1-D the blocks are laid end to end and wrap onto new lines only to fit the page. In 3-D each panel is one z-slice of the grid, so a block with blockDim.z = 2 spans two neighbouring panels. The numbers are computed from your settings with the same arithmetic a kernel does.',
    });
    const wrap = el('div', { class: 'dsc-w' });
    f.stage.append(wrap);
    const host = el('div');
    wrap.append(host);
    host.className = 'dsc-gb-host';
    const keyNote = el('div', { class: 'dsc-bs-note' });
    wrap.append(keyNote);
    const gbLeg = legend(wrap, []);
    const info = el('div', { class: 'dsc-gb-info' });
    const pF = el('div', { class: 'dsc-panel' });
    const pL = el('div', { class: 'dsc-panel' });
    info.append(pF, pL);
    wrap.append(info);

    const PRESET = {
      1: { g: [4, 1, 1], b: [8, 1, 1], sb: [2, 0, 0], st: [3, 0, 0] },
      2: { g: [3, 2, 1], b: [4, 4, 1], sb: [1, 1, 0], st: [2, 1, 0] },
      3: { g: [2, 2, 2], b: [4, 2, 2], sb: [1, 0, 1], st: [3, 1, 1] },
    };
    const LIM = { 1: { g: [8, 1, 1], b: [32, 1, 1] }, 2: { g: [4, 4, 1], b: [8, 8, 1] }, 3: { g: [3, 2, 2], b: [4, 4, 2] } };
    const st = { d: 1, g: [4, 1, 1], b: [8, 1, 1], sb: [2, 0, 0], st: [3, 0, 0], hov: null };
    GG.ui.seg(f.controls, { label: 'Dimensions', value: 1, options: [{ value: 1, label: '1-D' }, { value: 2, label: '2-D' }, { value: 3, label: '3-D' }], onChange: (v) => setDims(v) });
    const slHost = el('div', { class: 'dsc-gb-sl' });
    f.controls.append(slHost);
    const sBlocks = GG.ui.stat(f.readouts, { label: 'blocks' });
    const sTpb = GG.ui.stat(f.readouts, { label: 'threads / block' });
    const sTot = GG.ui.stat(f.readouts, { label: 'threads', tone: 'core' });
    const sWpb = GG.ui.stat(f.readouts, { label: 'warps / block' });

    function setDims(d) {
      st.d = d;
      const p = PRESET[d];
      st.g = p.g.slice(); st.b = p.b.slice(); st.sb = p.sb.slice(); st.st = p.st.slice(); st.hov = null;
      buildSliders();
      update();
    }
    function buildSliders() {
      clear(slHost);
      const ax = ['x', 'y', 'z'];
      const lim = LIM[st.d];
      for (let k = 0; k < st.d; k++) {
        GG.ui.slider(slHost, { label: 'gridDim.' + ax[k], min: 1, max: lim.g[k], value: st.g[k], onInput: (v) => { st.g[k] = v; fixSel(); update(); } });
      }
      for (let k = 0; k < st.d; k++) {
        GG.ui.slider(slHost, { label: 'blockDim.' + ax[k], min: 1, max: lim.b[k], value: st.b[k], onInput: (v) => { st.b[k] = v; fixSel(); update(); } });
      }
    }
    function fixSel() {
      for (let k = 0; k < 3; k++) { st.sb[k] = clamp(st.sb[k], 0, st.g[k] - 1); st.st[k] = clamp(st.st[k], 0, st.b[k] - 1); }
    }
    const glob = (bI, tI) => [0, 1, 2].map((k) => bI[k] * st.b[k] + tI[k]);
    const dimsW = () => [0, 1, 2].map((k) => st.g[k] * st.b[k]);
    let W = 0, cells = [], svg = null;

    function draw(w) {
      W = w;
      clear(host);
      cells = [];
      const [GX, GY, GZ] = st.g, [BX, BY, BZ] = st.b;
      const cur = st.hov || { b: st.sb, t: st.st };
      const curG = glob(cur.b, cur.t);
      const tLin = (t) => t[0] + t[1] * BX + t[2] * BX * BY;
      const curWarp = Math.floor(tLin(cur.t) / 32);
      let H = 0;
      const items = [];
      if (st.d === 1) {
        const cs = clamp(Math.floor((w - 2) / BX), 14, 26);
        const bg = 10, bw = BX * cs;
        const per = Math.max(1, Math.floor((w + bg) / (bw + bg)));
        const lineH = 16 + cs + (cs >= 18 ? 14 : 4) + 10;
        for (let bx = 0; bx < GX; bx++) {
          const li = Math.floor(bx / per), pi = bx % per;
          const x0 = pi * (bw + bg), y0 = li * lineH;
          items.push({ kind: 'label', x: x0, y: y0 + 11, text: (cs * BX >= 96 ? 'blockIdx.x = ' : 'b') + bx, on: bx === cur.b[0] });
          items.push({ kind: 'block', x: x0 - 1.5, y: y0 + 15, w: bw + 3, h: cs + 3, on: bx === cur.b[0] });
          for (let tx = 0; tx < BX; tx++) {
            items.push({ kind: 'cell', x: x0 + tx * cs, y: y0 + 16.5, s: cs, b: [bx, 0, 0], t: [tx, 0, 0], txt: cs >= 16 ? String(tx) : '', sub: cs >= 18 ? String(bx * BX + tx) : '' });
          }
        }
        H = Math.ceil(GX / per) * lineH;
      } else {
        const cols = GX * BX, rows = GY * BY, slices = st.d === 3 ? GZ * BZ : 1;
        const gap = 5, sgap = 22, left = 26, top = 30;
        // fit slices side by side when possible, else wrap
        let cs = 26, perRow = slices;
        const sliceW = (c) => cols * c + (GX - 1) * gap;
        for (;;) {
          perRow = Math.max(1, Math.min(slices, Math.floor((w - left + sgap) / (sliceW(cs) + sgap))));
          if (perRow === slices || cs <= 11) break;
          if (perRow >= 1 && cs <= 16) break;
          cs -= 1;
        }
        cs = Math.min(cs, Math.floor((w - left - (perRow - 1) * sgap - (GX - 1) * gap * perRow) / (cols * perRow)));
        cs = clamp(cs, 14, 26);
        const sW = sliceW(cs), sH = rows * cs + (GY - 1) * gap;
        const slRows = Math.ceil(slices / perRow);
        for (let z = 0; z < slices; z++) {
          const ox = left + (z % perRow) * (sW + sgap), oy = top + Math.floor(z / perRow) * (sH + top + 8);
          const bz = Math.floor(z / BZ), tz = z % BZ;
          if (st.d === 3) items.push({ kind: 'label', x: ox, y: oy - 18, text: sW < 190 ? `z = ${z}` : `z = ${z}  (blockIdx.z ${bz}, threadIdx.z ${tz})`, on: z === curG[2], small: sW < 150 });
          // column/row index labels
          for (let c = 0; c < cols; c++) if (cs >= 15 || c % BX === 0) items.push({ kind: 'idx', x: ox + c * cs + Math.floor(c / BX) * gap + cs / 2, y: oy - 5, text: String(c), anchor: 'middle', on: c === curG[0] });
          if (z % perRow === 0) for (let r = 0; r < rows; r++) if (cs >= 13 || r % BY === 0) items.push({ kind: 'idx', x: ox - 6, y: oy + r * cs + Math.floor(r / BY) * gap + cs / 2 + 3.5, text: String(r), anchor: 'end', on: r === curG[1] });
          for (let by = 0; by < GY; by++) for (let bx = 0; bx < GX; bx++) {
            const bxX = ox + bx * (BX * cs + gap), byY = oy + by * (BY * cs + gap);
            const on = bx === cur.b[0] && by === cur.b[1] && bz === cur.b[2];
            items.push({ kind: 'block', x: bxX - 1.5, y: byY - 1.5, w: BX * cs + 3, h: BY * cs + 3, on });
            for (let ty = 0; ty < BY; ty++) for (let tx = 0; tx < BX; tx++) {
              const g = [bx * BX + tx, by * BY + ty, z];
              const i = (g[2] * rows + g[1]) * cols + g[0];
              items.push({ kind: 'cell', x: bxX + tx * cs, y: byY + ty * cs, s: cs, b: [bx, by, bz], t: [tx, ty, tz], txt: cs >= 22 ? String(i) : '', sub: '' });
            }
          }
        }
        H = top + slRows * (sH + top + 8) - top;
      }
      // contents never shrink below 14 px cells (a tap target); on phones a large launch scrolls sideways instead
      let cw0 = w;
      for (const it of items) if (it.kind === 'block' || it.kind === 'cell') cw0 = Math.max(cw0, Math.ceil(it.x + (it.w || it.s) + 3));
      svg = svgEl(host, cw0, Math.max(40, H), 'The threads of the launch, grouped into blocks. The selected thread is highlighted.', { focusable: true, role: 'group' });
      svg._small = w < 480;
      if (cw0 > w) { svg.style.width = cw0 + 'px'; svg.style.maxWidth = 'none'; }
      svg.setAttribute('aria-label', 'Thread grid. Arrow keys move the selected thread.');
      const same = (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
      for (const it of items) {
        if (it.kind === 'label') Tx(svg, it.x, it.y, it.text, { size: it.small ? 9 : 10.5, fill: it.on ? 'var(--accent)' : 'var(--ink-2)', weight: it.on ? 600 : 500 });
        else if (it.kind === 'idx') Tx(svg, it.x, it.y, it.text, { size: 9, anchor: it.anchor, fill: it.on ? 'var(--accent)' : 'var(--ink-3)' });
        else if (it.kind === 'block') R(svg, it.x, it.y, it.w, it.h, { rx: 4, stroke: it.on ? 'var(--accent)' : 'var(--ink-3)', sw: it.on ? 1.8 : 1.1, fill: it.on ? 'rgba(255,138,91,0.05)' : 'rgba(255,255,255,0.02)' });
      }
      for (const it of items) {
        if (it.kind !== 'cell') continue;
        const selB = same(it.b, cur.b), sel = selB && same(it.t, cur.t);
        const warpMate = selB && !sel && Math.floor(tLin(it.t) / 32) === curWarp && BX * BY * BZ > 32;
        const pad = it.s >= 14 ? 1.5 : 1;
        R(svg, it.x + pad, it.y + pad, it.s - 2 * pad, it.s - 2 * pad, { rx: 2.5, fill: sel ? 'var(--accent)' : selB ? (warpMate ? 'rgba(69,212,155,0.32)' : 'rgba(69,212,155,0.18)') : 'rgba(69,212,155,0.08)', stroke: sel ? 'var(--accent)' : 'rgba(69,212,155,0.45)', sw: 0.8 });
        if (it.txt) Tx(svg, it.x + it.s / 2, it.y + it.s / 2 + 3.5, it.txt, { size: it.s >= 22 ? 9.5 : 9, anchor: 'middle', weight: sel ? 700 : 500, fill: sel ? 'var(--on-accent)' : 'var(--ink)' });
        if (it.sub) Tx(svg, it.x + it.s / 2, it.y + it.s + 11, it.sub, { size: 8.5, anchor: 'middle', fill: sel ? 'var(--accent)' : 'var(--ink-3)' });
        cells.push(it);
      }
      const tpbN = BX * BY * BZ;
      gbLeg.innerHTML = [['dsc-sw-accent', 'the selected thread'], ['dsc-sw-core-a', 'the other threads of its block'], ...(tpbN > 32 ? [['dsc-sw-core', 'brighter: the rest of its warp (32 threads in linear order)']] : [])].map(([c, l]) => `<span><i class="${c}"></i>${l}</span>`).join('') + (cw0 > w ? '<span>scroll sideways for the rest of the launch →</span>' : '');
      keyNote.textContent = st.d === 1 ? (items.find((x) => x.kind === 'cell' && x.sub) ? 'In each cell: threadIdx.x. Under it: the global index i.' : 'In each cell: threadIdx.x.') : st.d === 2 ? (items.find((x) => x.kind === 'cell' && x.txt) ? 'Axis labels: global column (top) and row (left). In each cell: the linear index i.' : 'Axis labels: global column (top) and row (left).') : `Axis labels: global x (top) and y (left). One panel per global z: panel z belongs to blockIdx.z = ⌊z / ${BZ}⌋ and has threadIdx.z = z mod ${BZ}.`;
      svg.addEventListener('pointermove', (e) => { const c = hit(e); if (c && (!st.hov || !same(st.hov.b, c.b) || !same(st.hov.t, c.t))) { st.hov = { b: c.b, t: c.t }; update(); } });
      svg.addEventListener('pointerleave', () => { if (st.hov) { st.hov = null; update(); } });
      svg.addEventListener('click', (e) => { const c = hit(e); if (c) { st.sb = c.b.slice(); st.st = c.t.slice(); st.hov = null; update(); } });
      svg.addEventListener('keydown', onKey);
    }
    function hit(e) {
      const [px, py] = svgPoint(svg, e);
      let best = null, bd = 1e9;
      for (const c of cells) {
        const cx = c.x + c.s / 2, cy = c.y + c.s / 2;
        const d = Math.max(Math.abs(px - cx), Math.abs(py - cy));
        if (d < bd) { bd = d; best = c; }
      }
      return best && bd <= best.s * 0.75 ? best : null;
    }
    function onKey(e) {
      const g = glob(st.sb, st.st), D = dimsW();
      let k = -1, dv = 0;
      if (e.key === 'ArrowRight') { k = 0; dv = 1; } else if (e.key === 'ArrowLeft') { k = 0; dv = -1; }
      else if (e.key === 'ArrowDown' && st.d > 1) { k = 1; dv = 1; } else if (e.key === 'ArrowUp' && st.d > 1) { k = 1; dv = -1; }
      else if (e.key === 'PageDown' && st.d > 2) { k = 2; dv = 1; } else if (e.key === 'PageUp' && st.d > 2) { k = 2; dv = -1; }
      if (k < 0) return;
      e.preventDefault();
      g[k] = clamp(g[k] + dv, 0, D[k] - 1);
      for (let q = 0; q < 3; q++) { st.sb[q] = Math.floor(g[q] / st.b[q]); st.st[q] = g[q] % st.b[q]; }
      update();
      requestAnimationFrame(() => svg && svg.focus());
    }
    function update() {
      const [GX, GY, GZ] = st.g, [BX, BY, BZ] = st.b;
      const cur = st.hov || { b: st.sb, t: st.st };
      const g = glob(cur.b, cur.t), D = dimsW();
      const tpb = BX * BY * BZ, nb = GX * GY * GZ;
      sBlocks.set(fmt.int(nb));
      sTpb.set(fmt.int(tpb));
      sTot.set(fmt.int(nb * tpb));
      sWpb.set(Math.ceil(tpb / 32));
      const v = (x) => `<span class="v dsc-nw">${x}</span>`;
      const [bx, by, bz] = cur.b, [tx, ty, tz] = cur.t;
      let fx = '';
      const t3 = (a) => st.d === 1 ? String(a[0]) : `<span class="dsc-nw">${st.d === 2 ? `(${a[0]}, ${a[1]})` : `(${a[0]}, ${a[1]}, ${a[2]})`}</span>`;
      fx += `<span class="d">blockIdx </span> = ${v(t3(cur.b))}   <span class="d">threadIdx</span> = ${v(t3(cur.t))}\n`;
      fx += `<span class="d">blockDim </span> = ${t3(st.b)}   <span class="d">gridDim  </span> = ${t3(st.g)}\n\n`;
      let iLin;
      if (st.d === 1) {
        iLin = g[0];
        fx += `<b>i</b> = blockIdx.x * blockDim.x + threadIdx.x\n  = ${v(bx)} * ${BX} + ${v(tx)}\n  = <b>${g[0]}</b>`;
      } else {
        const X = st.d === 3 ? 'x  ' : 'col', Y = st.d === 3 ? 'y  ' : 'row';
        fx += `<b>${X}</b> = blockIdx.x * blockDim.x + threadIdx.x\n    = ${v(bx)} * ${BX} + ${v(tx)} = <b>${g[0]}</b>\n`;
        fx += `<b>${Y}</b> = blockIdx.y * blockDim.y + threadIdx.y\n    = ${v(by)} * ${BY} + ${v(ty)} = <b>${g[1]}</b>\n`;
        if (st.d === 3) {
          fx += `<b>z  </b> = blockIdx.z * blockDim.z + threadIdx.z\n    = ${v(bz)} * ${BZ} + ${v(tz)} = <b>${g[2]}</b>\n`;
          iLin = (g[2] * D[1] + g[1]) * D[0] + g[0];
          fx += `<b>i  </b> = (z * ${D[1]} + y) * ${D[0]} + x\n    = (${g[2]} * ${D[1]} + ${g[1]}) * ${D[0]} + ${g[0]} = <b>${iLin}</b>`;
        } else {
          iLin = g[1] * D[0] + g[0];
          fx += `<b>i  </b> = row * (gridDim.x * blockDim.x) + col\n    = ${g[1]} * ${D[0]} + ${g[0]} = <b>${iLin}</b>`;
        }
      }
      const tl = tx + ty * BX + tz * BX * BY;
      pF.innerHTML = `<div class="dsc-panel-h"><b>${st.hov ? 'Hovered' : 'Selected'} thread</b><span>built-in variables → its index</span></div><div class="dsc-formula">${fx}</div>`;
      const launch = st.d === 1 ? `kernel<span class="k">&lt;&lt;&lt;</span>${GX}, ${BX}<span class="k">&gt;&gt;&gt;</span>(…);`
        : `kernel<span class="k">&lt;&lt;&lt;</span><span class="dsc-nw">dim3(${st.g.slice(0, st.d).join(', ')}),</span> <span class="dsc-nw">dim3(${st.b.slice(0, st.d).join(', ')})<span class="k">&gt;&gt;&gt;</span>(…);</span>`;
      pL.innerHTML = `<div class="dsc-panel-h"><b>The launch</b><span>${fmt.int(nb)} × ${fmt.int(tpb)} = ${fmt.int(nb * tpb)} threads</span></div><div class="dsc-gb-launch">${launch}</div>` +
        `<div class="dsc-formula" style="margin-top:8px"><span class="d">its position inside the block:</span>\nt = ${st.d === 1 ? 'threadIdx.x' : st.d === 2 ? 'threadIdx.x + threadIdx.y * blockDim.x' : 'threadIdx.x\n  + threadIdx.y * blockDim.x\n  + threadIdx.z * blockDim.x * blockDim.y'}\n  = <b>${tl}</b>, <span class="d">so lane</span> <b>${tl % 32}</b> <span class="d">of warp</span> <b>${Math.floor(tl / 32)}</b></div>`;
      if (W) draw(W);
      if (st.d === 1) f.setWhy(`Thread ${tx} of block ${bx} is element <b>${g[0]}</b> of the grid: block ${bx} starts at ${bx} × ${BX} = ${bx * BX}, and this thread is ${tx} further along. A kernel uses exactly this number to pick its array element, as in <code>c[i] = a[i] + b[i]</code>.`);
      else if (st.d === 2) f.setWhy(`Thread ${t3(cur.t)} of block ${t3(cur.b)} owns <b>row ${g[1]}, column ${g[0]}</b> of ${/^(8|11|18)/.test(String(D[1])) ? 'an' : 'a'} ${D[1]} × ${D[0]} array: the same two lines of arithmetic that open the glossary’s ${T('kernel', 'matrix multiplication kernel')}.`);
      else f.setWhy(`Thread ${t3(cur.t)} of block ${t3(cur.b)} owns <b>element (${g[0]}, ${g[1]}, ${g[2]})</b> of ${/^(8|11|18)/.test(String(D[0])) ? 'an' : 'a'} ${D[0]} × ${D[1]} × ${D[2]} volume. Three-dimensional grids suit volumes such as simulation meshes; the arithmetic is the same, once per axis.`);
    }
    onWidth(host, (w) => draw(w));
    buildSliders();
    update();
  }

  /* Fig: the same grid on GPUs with more or fewer SMs */
  function smScaleFig(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'One grid, GPUs of different sizes',
      hint: 'change the SM count · play',
      wide: true,
      caption: `A model, not a measurement. The grid stays the same and the GPU changes: from one SM, which runs the blocks fully sequentially, to enough SMs to run them fully in parallel. Each SM runs one block at a time here, and each block takes one time unit unless the timing is made unpredictable. The horizontal scale is fixed so that one SM, doing all the work alone, fills the width: more SMs finish the same grid sooner. Real SMs can hold several blocks at once (up to 32 on an H100, resources permitting). For the opposite view, one fixed 132-SM GPU and the SMs a partly filled last wave leaves idle, see ${T('streaming-multiprocessor-utilization', 'SM Utilization')} Fig.&nbsp;1.`,
    });
    const wrap = el('div', { class: 'dsc-w' });
    f.stage.append(wrap);
    const host = el('div');
    wrap.append(host);
    legend(wrap, [['dsc-sw-core', 'block running'], ['dsc-sw-core-a', 'block finished'], ['dsc-sw-idle', 'not started yet']]);
    const st = { sms: 4, nb: 12, jitter: false, seed: 3, t: Infinity };
    GG.ui.slider(f.controls, { label: 'SMs on the GPU', min: 1, max: 16, value: st.sms, onInput: (v) => { st.sms = v; update(); } });
    GG.ui.slider(f.controls, { label: 'Blocks in the grid', min: 1, max: 32, value: st.nb, onInput: (v) => { st.nb = v; update(); } });
    const row = el('div', { class: 'dsc-row' });
    f.controls.append(row);
    GG.ui.toggle(row, { label: 'unpredictable timing', value: false, onChange: (v) => { st.jitter = v; update(); } });
    GG.ui.button(row, { label: 'Run again', icon: 'reset', onClick: () => { st.seed = (st.seed * 48271) % 2147483647; update(); } });
    const playBtn = GG.ui.button(row, { label: 'Play', icon: 'play', onClick: () => play() });
    const sTime = GG.ui.stat(f.readouts, { label: 'time', tone: 'core' });
    const sSpeed = GG.ui.stat(f.readouts, { label: 'speed-up' });
    const sAtOnce = GG.ui.stat(f.readouts, { label: 'at once' });
    const sWaves = GG.ui.stat(f.readouts, { label: 'waves' });
    let sched = null, W = 0;
    function compute() {
      const r = rng(st.seed);
      const d = range(st.nb).map(() => (st.jitter ? 0.55 + 0.9 * r() : 1));
      const order = st.jitter ? shuffled(range(st.nb), r) : range(st.nb);
      const free = range(st.sms).map(() => 0);
      const blocks = [];
      for (const b of order) {
        let sm = 0;
        for (let k = 1; k < st.sms; k++) if (free[k] < free[sm] - 1e-9) sm = k;
        blocks.push({ b, sm, s: free[sm], e: free[sm] + d[b] });
        free[sm] += d[b];
      }
      const total = d.reduce((a, x) => a + x, 0);
      const span = Math.max(...blocks.map((x) => x.e));
      return { blocks, total, span, order };
    }
    function draw(w) {
      W = w;
      clear(host);
      const labW = 46, rowH = st.sms > 10 ? 17 : 22, top = 6;
      const plotW = w - labW - 8;
      const H = top + st.sms * rowH + 26;
      const svg = svgEl(host, w, H, `Timeline of ${st.nb} blocks on ${st.sms} SMs.`);
      const k = plotW / sched.total;
      for (let m = 0; m < st.sms; m++) {
        const y = top + m * rowH;
        Tx(svg, labW - 8, y + rowH / 2 + 3.5, 'SM ' + m, { size: 10, anchor: 'end', fill: 'var(--ink-2)' });
        R(svg, labW, y + 1, plotW, rowH - 2, { fill: 'rgba(255,255,255,0.025)', rx: 3 });
      }
      for (const x of sched.blocks) {
        const y = top + x.sm * rowH + 2.5;
        const bw = (x.e - x.s) * k - 2;
        const state = st.t === Infinity ? 'done' : st.t >= x.e ? 'done' : st.t >= x.s ? 'run' : 'wait';
        R(svg, labW + x.s * k + 1, y, bw, rowH - 5, { rx: 3, fill: state === 'run' ? 'var(--core)' : state === 'done' ? 'var(--core-a)' : 'none', stroke: state === 'wait' ? 'var(--line-2)' : 'var(--core)', sw: 1 });
        if (bw >= 18) Tx(svg, labW + x.s * k + 1 + bw / 2, y + (rowH - 5) / 2 + 3.5, String(x.b), { size: rowH > 18 ? 10 : 9, anchor: 'middle', weight: 600, fill: state === 'run' ? '#07140e' : 'var(--ink)' });
      }
      // axis
      const ay = top + st.sms * rowH + 4;
      L(svg, labW, ay, labW + plotW, ay, { stroke: 'var(--line-2)' });
      const step = sched.total <= 10 ? 1 : sched.total <= 20 ? 2 : 4;
      for (let u = 0; u <= sched.total + 1e-9; u += step) {
        L(svg, labW + u * k, ay, labW + u * k, ay + 4, { stroke: 'var(--ink-3)' });
        Tx(svg, labW + u * k, ay + 15, String(u), { size: 9, anchor: 'middle', fill: 'var(--ink-3)' });
      }
      Tx(svg, labW - 8, ay + 15, 'time', { size: 9, anchor: 'end', fill: 'var(--ink-3)' });
      // finish marker
      const fx = labW + sched.span * k;
      L(svg, fx, top, fx, ay, { stroke: 'var(--accent)', sw: 1.4, dash: '3 3' });
      if (sched.span < sched.total - 1e-9) Tx(svg, fx + 5, ay - 5, 'grid done', { size: 9, fill: 'var(--accent)' });
      if (st.t !== Infinity) L(svg, labW + Math.min(st.t, sched.span) * k, top, labW + Math.min(st.t, sched.span) * k, ay, { stroke: 'var(--ink)', sw: 1.2 });
    }
    function update() {
      sched = compute();
      const waves = Math.ceil(st.nb / st.sms);
      const fmtU = (u) => (st.jitter ? GG.fmt.fixed(u, 2) : fmt.int(u));
      sTime.set(fmtU(sched.span) + ' u');
      const speed = +(sched.total / sched.span).toFixed(2);
      const units = (u) => `${fmtU(u)} time unit${Math.abs(u - 1) < 1e-9 ? '' : 's'}`;
      sSpeed.set(speed + '×');
      sAtOnce.set(Math.min(st.sms, st.nb));
      sWaves.set(st.jitter ? '—' : waves);
      if (W) draw(W);
      let w;
      if (st.sms === 1) w = st.nb === 1 ? `One SM runs the single block: ${units(sched.span)}.` : `One SM runs the ${st.nb} blocks <b>fully sequentially</b>, one after another: ${units(sched.span)}.`;
      else if (st.sms >= st.nb) w = `With at least as many SMs as blocks, every block runs at the same time: <b>fully in parallel</b>. The grid takes as long as its slowest block, ${units(sched.span)}.`;
      else {
        w = `${st.sms} SMs share ${st.nb} blocks${st.jitter ? '' : ` in ${waves} waves`}: ${units(sched.span)}, ${speed}× faster than one SM.`;
        if (!st.jitter && st.nb % st.sms) w += ` The last wave has only ${st.nb % st.sms} of them, so ${st.sms - (st.nb % st.sms)} SMs sit idle while it runs: the cost ${T('streaming-multiprocessor-utilization', 'SM Utilization')} measures.`;
      }
      if (st.jitter) w += ` With unpredictable timing, the order in which blocks start (${sched.order.slice(0, 6).join(', ')}${st.nb > 6 ? ', …' : ''}) and the SM each lands on change from run to run. A correct kernel does not care.`;
      f.setWhy(w);
    }
    let anim = null;
    function play() {
      if (anim && anim.running) { anim.stop(); st.t = Infinity; playBtn.setLabel('Play', 'play'); update(); return; }
      if (!anim) anim = GG.anim(wrap, (t) => {
        const tt = t * 1.6 * Math.max(1, sched.span / 6);
        if (tt > sched.span + 0.4) { anim.stop(); st.t = Infinity; playBtn.setLabel('Play', 'play'); if (W) draw(W); return; }
        st.t = tt;
        if (W) draw(W);
      }, { autostart: false });
      anim.reset();
      st.t = 0;
      playBtn.setLabel('Stop', 'pause');
      anim.start();
    }
    onWidth(host, (w) => draw(w));
    update();
  }

  GG.entry('thread-block-grid', {
    render(body, ctx) {
      body.classList.add('dsc-body');
      const s = ctx.html(body, `
<p>When a CUDA ${T('kernel', 'kernel')} is launched, it creates a collection of ${T('thread', 'threads')} known as a <strong>thread block grid</strong>, or simply the grid. The grid is every thread of that one launch, and it is the highest level of the thread hierarchy of the ${T('cuda-programming-model', 'CUDA programming model')}. Grids can be one-, two- or three-dimensional, and they are made up of ${T('thread-block', 'thread blocks')}: the grid is an array of blocks, and each block is an array of threads.</p>
<div data-slot="map" class="wide"></div>
<p>The matching level of the ${T('memory-hierarchy', 'memory hierarchy')} is the ${T('global-memory', 'global memory')}. Every thread of the grid can read and write it, which makes it the grid’s shared workspace: the kernel’s inputs arrive there, its outputs leave from there, and in an ordinary launch it is the only writable memory that threads in different blocks have in common. (Read-only constant memory is also grid-wide, and on ${T('compute-capability', 'compute capability')} 9.0 GPUs such as the H100 the blocks of a thread block cluster add distributed shared memory: see ${T('graphics-processing-cluster', 'GPU Processing Cluster')} and ${T('thread-hierarchy', 'Thread Hierarchy')}.)</p>

<h3>Shape and indices</h3>
<p>The launch fixes two shapes: <code>gridDim</code>, how many blocks along x, y and z, and <code>blockDim</code>, how many threads per block along each axis. Inside the kernel every thread can read both, plus its own position: <code>blockIdx</code>, which block it is in, and <code>threadIdx</code>, where it sits within that block. From those four built-in variables a thread computes which piece of the data is its own. Build a launch in Fig. 2 and click around.</p>
<div data-slot="builder" class="wide"></div>
<p>A one-dimensional grid suits a vector: thread <code>i = blockIdx.x * blockDim.x + threadIdx.x</code> handles element <code>i</code>. A two-dimensional grid suits a matrix or an image, with a row and a column per thread. A three-dimensional grid suits a volume. The dimensionality is only a numbering convenience: however it is shaped, a grid of <em>N</em> blocks of <em>M</em> threads is <em>N</em> × <em>M</em> threads.</p>
${GG.noteHTML('beyond', '<p><b>How big can a grid be?</b> Per NVIDIA’s programming guide: <code>gridDim.x</code> can be up to 2<sup>31</sup> − 1 blocks, <code>gridDim.y</code> and <code>gridDim.z</code> up to 65,535 each. Blocks are capped at 1,024 threads. So one launch can describe far more threads than any GPU can run at once; the hardware simply works through the blocks as SMs free up.</p>')}

<h3>Blocks are independent</h3>
<p>Thread blocks are effectively independent units of computation. They execute <em>concurrently</em>: their lifetimes may overlap, and nothing fixes the order in which they run. At one extreme, a GPU with a single ${T('streaming-multiprocessor', 'Streaming Multiprocessor')} runs them <strong>fully sequentially</strong>. At the other, a GPU with enough resources to hold them all runs them <strong>fully in parallel</strong>. Everything in between is possible too, and a correct kernel produces the same result on all of them.</p>
<div data-slot="scale" class="wide"></div>
<p>That is the whole bargain of the grid. The programmer promises that blocks will never wait for each other (see ${T('thread-block', 'Thread Block')} for what goes wrong when they do). In return the same program runs on any GPU, and runs faster on one with more SMs, without being rewritten. An H100 SXM has 132 SMs.</p>
<div data-slot="nums"></div>
<div data-slot="read"></div>`);

      guard(s.map, 'Programming model map', () => mapFig(s.map, ctx, {
        title: 'The grid in the CUDA programming model',
        highlight: ['grid', 'global'],
        caption: 'Redrawn after the glossary’s figure, itself modified from NVIDIA’s CUDA Refresher and CUDA C++ Programming Guide. Left: thread block grids are the highest level of the thread hierarchy, with global memory as their memory. Right: they map onto multiple Streaming Multiprocessors, at the scale of the whole GPU.',
        why: 'Lit: the <b>grid</b>, which runs across all the SMs of the <b>GPU</b>, and its level of the memory hierarchy, <b>global memory</b>, which lives in <b>GPU RAM</b>. Each block of the grid lands on some SM; which one, and when, is up to the hardware.',
      }));
      guard(s.builder, 'Grid builder', () => gridBuilderFig(s.builder, ctx));
      guard(s.scale, 'SM scaling figure', () => smScaleFig(s.scale, ctx));
      ctx.numbers(s.nums, [
        { value: '1–3', label: 'dimensions a grid (and a block) can have' },
        { value: '2³¹ − 1', label: 'maximum blocks along x (65,535 along y and z)' },
        { value: '1,024', label: 'maximum threads per block', tone: 'core' },
        { value: '132', label: 'SMs on an H100 SXM for those blocks to run on', tone: 'control' },
      ]);
      ctx.reading(s.read, [REFRESHER, CPG, CPG_LIMITS]);
    },
  });


  /* ═════════════════════════════ Thread Hierarchy ═════════════════════════════ */

  GG.css(`
.dsc-zoom { display: grid; grid-template-columns: minmax(0, 1fr); gap: 6px; align-items: center; }
.dsc-zoom.wide { grid-template-columns: minmax(0, 1fr) 74px minmax(0, 1fr); gap: 0; }
.dsc-zoom-p { border: 1px solid var(--line); border-radius: 12px; background: rgba(8, 9, 14, 0.45); padding: 6px; min-width: 0; }
.dsc-zoom-p .dsc-k { padding: 2px 4px 4px; display: flex; justify-content: space-between; gap: 8px; }
.dsc-zoom-p svg { display: block; width: 100%; height: auto; overflow: hidden; }
.dsc-zoom-a { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; font: 500 10.5px/1.25 var(--font-mono); color: var(--control); text-align: center; padding: 4px 0; }
.dsc-zoom-a svg { width: 44px; height: 14px; }
.dsc-zoom:not(.wide) .dsc-zoom-a { flex-direction: row; }
.dsc-zoom:not(.wide) .dsc-zoom-a svg { width: 14px; height: 26px; }
.dsc-scene { transition: transform 0.6s cubic-bezier(0.2, 0.7, 0.2, 1), opacity 0.45s ease; }
.dsc-scene .dsc-hit:hover rect.dsc-tile { stroke: var(--accent); }
`);

  /* Fig: zoom through the hierarchy, software and hardware side by side */
  function zoomFig(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Zoom: grid → block → thread, and what each runs on',
      hint: 'pick a level · click a block or thread to zoom in (or Tab in, arrows, Enter) · step the instructions',
      wide: true,
      caption: 'Left, the programming model; right, the hardware that level maps onto. The drawing is schematic: a real grid can have millions of threads and an H100 SXM has 132 SMs. At the thread level only two of a sub-partition’s pipes are drawn: its 32 FP32 lanes, which form the FMA pipe (it also runs integer multiply-adds, <code>IMAD</code>), and its 8 Load/Store Units, which handle loads, stores and special-register reads (<code>S2R</code>), following the pipe descriptions in NVIDIA’s Nsight Compute profiling guide. The instructions are an abridged form of the SASS that NVCC 13.2 produces for the <code>c[i] = a[i] + b[i]</code> kernel listed in the Registers entry; the constant-bank loads (<code>LDC</code>, <code>ULDC</code>), the block-index read (<code>S2UR</code>) and the address arithmetic (<code>IMAD.WIDE</code>) are left out.',
    });
    const wrap = el('div', { class: 'dsc-w' });
    f.stage.append(wrap);
    const box = el('div', { class: 'dsc-zoom' });
    const pS = el('div', { class: 'dsc-zoom-p' });
    const pH = el('div', { class: 'dsc-zoom-p' });
    const arrow = el('div', { class: 'dsc-zoom-a' });
    const hS = el('div', { class: 'dsc-k' }), hH = el('div', { class: 'dsc-k' });
    pS.append(hS); pH.append(hH);
    const VW = 340, VH = 284;
    const svS = S('svg', { viewBox: `0 0 ${VW} ${VH}`, role: 'group', class: 'dsc-svg', tabindex: '0', 'data-keys': '' }, pS);
    const svH = S('svg', { viewBox: `0 0 ${VW} ${VH}`, role: 'img', class: 'dsc-svg' }, pH);
    box.append(pS, arrow, pH);
    wrap.append(box);
    const facts = el('ul', { class: 'dsc-facts' });
    wrap.append(facts);
    const st = { lvl: 0, blk: [1, 1], thr: 5, ty: 0, pc: 4, seed: 5 };
    const lvSeg = GG.ui.seg(f.controls, { label: 'Zoom level', value: 0, options: [{ value: 0, label: 'grid ↔ GPU' }, { value: 1, label: 'block ↔ SM' }, { value: 2, label: 'thread ↔ core' }], onChange: (v) => go(v) });
    const btns = el('div', { class: 'dsc-row' });
    f.controls.append(btns);
    const bOut = GG.ui.button(btns, { label: 'Zoom out', onClick: () => go(st.lvl - 1) });
    const bIn = GG.ui.button(btns, { label: 'Zoom in', primary: true, onClick: () => go(st.lvl + 1) });
    const bNew = GG.ui.button(btns, { label: 'New launch', icon: 'reset', onClick: () => { st.seed++; perm = shuffled(range(12), rng(st.seed * 977)); st.fresh = true; render(false, 0); st.fresh = false; } });
    bNew.title = 'Launch the grid again: blocks may land on different SMs';
    const stepWrap = el('div');
    f.controls.append(stepWrap);
    let stepper = null;
    const SASS = ['S2R R0, SR_TID.X', 'IMAD R9, R9, UR4, R0', 'LDG.E R2, desc[UR4][R2.64]', 'LDG.E R5, desc[UR4][R4.64]', 'FADD R9, R2, R5', 'STG.E desc[UR4][R6.64], R9', 'EXIT'];
    const TILE = { x0: 14, y0: 30, cols: 4, rows: 3, gap: 9, w: 0, h: 0 };
    TILE.w = (VW - 28 - (TILE.cols - 1) * TILE.gap) / TILE.cols;
    TILE.h = (198 - 30 - (TILE.rows - 1) * TILE.gap) / TILE.rows;
    let perm = shuffled(range(12), rng(st.seed * 977));
    const smOf = (bx, by) => perm[by * 4 + bx];

    function head(g, text) { Tx(g, 12, 17, text, { size: 9.5, fill: 'var(--ink-3)', ls: '0.12em' }); }
    function memBar(g, x, y, w, h, label, on) {
      R(g, x, y, w, h, { rx: 3, fill: on ? 'rgba(111,166,255,0.3)' : 'rgba(111,166,255,0.13)', stroke: on ? 'var(--memory)' : 'rgba(111,166,255,0.6)', sw: on ? 1.4 : 1 });
      Tx(g, x + w / 2, y + h / 2 + 3.6, label, { size: 9.5, anchor: 'middle', fill: '#d3e3ff' });
    }
    function coreBar(g, x, y, w, h, on) { R(g, x, y, w, h, { rx: 1.5, fill: on ? 'var(--core)' : 'rgba(69,212,155,0.5)', stroke: 'var(--core)', sw: on ? 1 : 0.6 }); }

    /* ── software scenes ── */
    function swGrid(g) {
      head(g, 'GRID · gridDim = (4, 3)');
      for (let by = 0; by < 3; by++) for (let bx = 0; bx < 4; bx++) {
        const x = TILE.x0 + bx * (TILE.w + TILE.gap), y = TILE.y0 + by * (TILE.h + TILE.gap);
        const on = bx === st.blk[0] && by === st.blk[1];
        const hit = S('g', { class: 'dsc-hit', 'data-b': bx + ',' + by }, g);
        R(hit, x, y, TILE.w, TILE.h, { rx: 4, fill: on ? 'rgba(255,138,91,0.08)' : 'rgba(255,255,255,0.03)', stroke: on ? 'var(--accent)' : 'var(--line-2)', sw: on ? 1.6 : 1, dash: on ? null : '4 3', cls: 'dsc-tile' });
        Tx(hit, x + 5, y + 11, `(${bx},${by})`, { size: 8.5, fill: on ? 'var(--accent)' : 'var(--ink-3)' });
        for (let k = 0; k < 6; k++) strand(hit, x + 9 + k * ((TILE.w - 18) / 5), y + 17, TILE.h - 22, { amp: 1.4, wl: 7, phase: bx + by + k * 0.4, sw: 0.9, stroke: on ? '#fff' : 'var(--ink-3)', hw: 1.8 });
      }
      memBar(g, 14, 210, VW - 28, 24, 'Global Memory', false);
      Tx(g, VW / 2, 262, 'click a block to zoom in', { size: 9.5, anchor: 'middle', fill: 'var(--ink-3)' });
      return centerOfBlock();
    }
    function centerOfBlock() { return [TILE.x0 + st.blk[0] * (TILE.w + TILE.gap) + TILE.w / 2, TILE.y0 + st.blk[1] * (TILE.h + TILE.gap) + TILE.h / 2]; }
    const THR = { x0: 22, sp: (VW - 44) / 31, rows: [[70, 64], [162, 64]] };
    function swBlock(g) {
      head(g, `BLOCK (${st.blk[0]}, ${st.blk[1]}) · blockDim = (32, 2)`);
      R(g, 8, 26, VW - 16, 222, { rx: 6, fill: 'rgba(255,255,255,0.02)', stroke: 'var(--ink-3)', sw: 1.2 });
      memBar(g, 16, 34, VW - 32, 20, 'Shared Memory', true);
      THR.rows.forEach(([y0, len], wy) => {
        Tx(g, 16, y0 - 5, `threadIdx.y = ${wy} · warp ${wy}`, { size: 8.5, fill: 'var(--ink-3)' });
        for (let tx = 0; tx < 32; tx++) {
          const on = wy === st.ty && tx === st.thr;
          const x = THR.x0 + tx * THR.sp;
          const hit = S('g', { class: 'dsc-hit', 'data-t': tx + ',' + wy }, g);
          R(hit, x - THR.sp / 2, y0, THR.sp, len, { fill: 'transparent', rx: 0 });
          strand(hit, x, y0, len, { amp: 1.6, wl: 8, phase: tx * 0.5 + wy, sw: on ? 1.8 : 1, stroke: on ? 'var(--accent)' : 'var(--ink-2)', hw: 2 });
        }
        const by = y0 + len * 0.52;
        L(g, 14, by, VW - 14, by, { stroke: 'var(--control)', sw: 1.3, dash: '5 3' });
      });
      const lby = THR.rows[0][0] + THR.rows[0][1] * 0.52;
      R(g, VW - 104, lby - 15, 92, 13, { rx: 3, fill: '#0e0f17', stroke: 'rgba(255,198,92,0.5)', sw: 0.8 });
      Tx(g, VW - 58, lby - 5.5, '__syncthreads()', { size: 8.5, anchor: 'middle', fill: 'var(--control)' });
      const sx = THR.x0 + st.thr * THR.sp, row = THR.rows[st.ty];
      Tx(g, clamp(sx, 40, VW - 40), row[0] + row[1] + 12, `threadIdx (${st.thr}, ${st.ty})`, { size: 9, anchor: 'middle', fill: 'var(--accent)' });
      Tx(g, VW / 2, 266, 'click a thread to zoom in', { size: 9.5, anchor: 'middle', fill: 'var(--ink-3)' });
      return [sx, row[0] + row[1] / 2];
    }
    let pcEls = [];
    function swThread(g) {
      head(g, `THREAD (${st.thr}, ${st.ty}) OF BLOCK (${st.blk[0]}, ${st.blk[1]})`);
      strand(g, 30, 32, 222, { amp: 4, wl: 22, phase: 0.5, sw: 2.2, stroke: 'var(--accent)', hw: 4 });
      pcEls = [];
      SASS.forEach((ins, k) => {
        const y = 44 + k * 26;
        const row = S('g', null, g);
        row.setAttribute('class', 'dsc-hit');
        row.setAttribute('data-pc', String(k));
        const bg = R(row, 52, y - 13, VW - 62, 20, { rx: 4, fill: 'rgba(255,255,255,0.03)' });
        const tick = L(row, 34, y - 3, 50, y - 3, { stroke: 'var(--line-2)', sw: 1 });
        const t = Tx(row, 60, y + 1, ins, { size: 10, fill: 'var(--ink-2)' });
        pcEls.push({ bg, tick, t });
      });
      Tx(g, 52, 262, 'its registers: R0 R2 R4–R6 R9 … · click a line', { size: 9.5, fill: 'var(--memory)' });
      paintPC();
      return [30, 140];
    }
    function paintPC() {
      pcEls.forEach((p, k) => {
        const on = k === st.pc;
        p.bg.setAttribute('fill', on ? 'rgba(69,212,155,0.16)' : 'rgba(255,255,255,0.03)');
        p.bg.setAttribute('stroke', on ? 'var(--core)' : 'none');
        p.tick.setAttribute('stroke', on ? 'var(--core)' : 'var(--line-2)');
        p.t.style.fill = on ? 'var(--ink)' : 'var(--ink-2)';
      });
      if (stepper) stepper.go(st.pc, true);
      if (!tokenT) return;
      const u = unitOf(st.pc);
      tokenT.textContent = SASS[st.pc];
      issueT.textContent = ISSUE[u];
      laneEls.forEach((b, k) => {
        const me = k === st.thr;
        b.setAttribute('fill', u === 'fma' ? (me ? 'var(--accent)' : 'var(--core)') : 'rgba(69,212,155,0.12)');
        b.setAttribute('stroke', u === 'fma' ? (me ? 'var(--accent)' : 'var(--core)') : 'rgba(69,212,155,0.4)');
      });
      ldstEls.forEach((b) => {
        b.setAttribute('fill', u === 'lsu' ? 'var(--special)' : 'rgba(255,111,180,0.1)');
        b.setAttribute('stroke', u === 'lsu' ? 'var(--special)' : 'rgba(255,111,180,0.4)');
      });
      ldstOut.setAttribute('opacity', u === 'lsu' ? 1 : 0.25);
      fmaLab.style.fill = u === 'fma' ? 'var(--core)' : 'var(--ink-3)';
      lsuLab.style.fill = u === 'lsu' ? 'var(--special)' : 'var(--ink-3)';
      laneLab.textContent = u === 'fma' ? `lane ${st.thr}: this thread’s FP32 lane` : u === 'lsu' ? `thread ${st.thr}’s request goes to the LD/ST units` : 'no unit: the thread has finished';
      laneLab.style.fill = u === 'none' ? 'var(--ink-3)' : u === 'fma' ? 'var(--accent)' : 'var(--special)';
      if (st.lvl === 2) f.setWhy(WHY_PC[u](SASS[st.pc]));
    }
    const unitOf = (pc) => { const op = SASS[pc].split(' ')[0]; return op === 'FADD' || op === 'IMAD' ? 'fma' : op === 'EXIT' ? 'none' : 'lsu'; };
    const ISSUE = { fma: 'FMA pipe: the 32 FP32 lanes, one per thread of the warp', lsu: 'Load/Store pipe: 8 LD/ST units serve the warp’s 32 threads', none: 'EXIT: nothing left to execute' };
    const WHY_PC = {
      fma: (ins) => `<code>${esc(ins)}</code>: the ${T('warp-scheduler', 'warp scheduler')} issues this one instruction for the whole ${T('warp', 'warp')}, and each thread’s share runs on its own lane of the FMA pipe: the 32 FP32 ${T('cuda-core', 'CUDA Cores')}. ${ins.startsWith('IMAD') ? 'Integer multiply-adds run on this pipe too, according to NVIDIA’s Nsight Compute documentation.' : 'This is the kernel’s actual arithmetic.'}`,
      lsu: (ins) => `<code>${esc(ins)}</code>: ${ins.startsWith('S2R') ? 'a special-register read, here of the thread’s index, <code>threadIdx.x</code>. Nsight Compute lists it among the instructions the Load/Store pipe issues. (The block’s index, the same for every thread of the warp, goes to a uniform register through <code>S2UR</code>, left out of this abridged list.)' : 'a memory instruction. The ' + T('load-store-unit', 'Load/Store Units') + ' take the 32 threads’ addresses and send the requests on to the memory system.'} No FP32 lane is busy for this thread right now: which ${T('core', 'pipe')} runs a thread’s work changes instruction by instruction.`,
      none: () => '<code>EXIT</code>: the thread has finished its stream of instructions, and no pipe does any work for it. When all of a block’s threads have exited, the block leaves its SM.',
    };

    /* ── hardware scenes ── */
    function hwGPU(g) {
      head(g, 'GPU · 12 of an H100 SXM’s 132 SMs');
      const selSM = smOf(st.blk[0], st.blk[1]);
      const blockOn = []; perm.forEach((k, i) => { blockOn[k] = [i % 4, Math.floor(i / 4)]; });
      for (let k = 0; k < 12; k++) {
        const cx = k % 4, cy = Math.floor(k / 4);
        const x = TILE.x0 + cx * (TILE.w + TILE.gap), y = TILE.y0 + cy * (TILE.h + TILE.gap);
        const on = k === selSM;
        R(g, x, y, TILE.w, TILE.h, { rx: 4, fill: on ? 'rgba(255,138,91,0.08)' : 'var(--surface-2)', stroke: on ? 'var(--accent)' : 'var(--line-2)', sw: on ? 1.6 : 1 });
        R(g, x + 5, y + 5, TILE.w - 10, 5, { rx: 1.5, fill: 'rgba(111,166,255,0.45)' });
        for (let c = 0; c < 5; c++) coreBar(g, x + 8 + c * ((TILE.w - 22) / 4), y + 15, 6, TILE.h - 21, on);
        Tx(g, x + TILE.w - 4, y + TILE.h - 4, 'SM', { size: 8, anchor: 'end', fill: on ? 'var(--accent)' : 'var(--ink-3)' });
      }
      // which block this launch put on each SM, as numbered on the grid side
      const tags = S('g', null, g);
      for (let k = 0; k < 12; k++) {
        const x = TILE.x0 + (k % 4) * (TILE.w + TILE.gap), y = TILE.y0 + Math.floor(k / 4) * (TILE.h + TILE.gap);
        const on = k === selSM;
        const [bx, by] = blockOn[k];
        R(tags, x + 3, y + 12, 34, 14, { rx: 3, fill: on ? 'var(--accent)' : 'rgba(11,12,18,0.85)', stroke: on ? 'var(--accent)' : 'var(--line-2)', sw: 0.8 });
        Tx(tags, x + 20, y + 22.5, `(${bx},${by})`, { size: 9, anchor: 'middle', weight: 600, fill: on ? 'var(--on-accent)' : 'var(--ink)' });
      }
      if (st.fresh && !GG.reducedMotion) {
        tags.style.opacity = '0';
        setTimeout(() => { tags.style.transition = 'opacity 0.5s ease'; tags.style.opacity = '1'; }, 40);
      }
      memBar(g, 14, 210, VW - 28, 24, 'GPU RAM', false);
      Tx(g, VW / 2, 252, 'tag: the block each SM got in this launch', { size: 9.5, anchor: 'middle', fill: 'var(--ink-3)' });
      Tx(g, VW / 2, 266, 'New launch: the blocks land elsewhere', { size: 9, anchor: 'middle', fill: 'var(--ink-3)' });
      const k = selSM;
      return [TILE.x0 + (k % 4) * (TILE.w + TILE.gap) + TILE.w / 2, TILE.y0 + Math.floor(k / 4) * (TILE.h + TILE.gap) + TILE.h / 2];
    }
    function hwSM(g) {
      head(g, 'STREAMING MULTIPROCESSOR');
      R(g, 8, 26, VW - 16, 222, { rx: 6, fill: 'rgba(255,138,91,0.04)', stroke: 'var(--accent)', sw: 1.4 });
      const spW = (VW - 16 - 8 * 3) / 2, spH = 84;
      let c0 = [0, 0];
      for (let k = 0; k < 4; k++) {
        const x = 16 + (k % 2) * (spW + 8), y = 34 + Math.floor(k / 2) * (spH + 8);
        const has = k < 2;
        R(g, x, y, spW, spH, { rx: 4, fill: 'var(--surface-2)', stroke: 'var(--line-2)' });
        R(g, x + 5, y + 5, spW - 10, 13, { rx: 2, fill: 'rgba(255,198,92,0.16)', stroke: 'var(--control)', sw: 0.9 });
        Tx(g, x + spW / 2, y + 14.5, 'Warp Scheduler', { size: 8.5, anchor: 'middle', fill: '#ffe2a8' });
        R(g, x + 5, y + 22, spW - 10, 11, { rx: 2, fill: 'rgba(111,166,255,0.18)', stroke: 'rgba(111,166,255,0.7)', sw: 0.8 });
        Tx(g, x + spW / 2, y + 30.5, 'Register File', { size: 8, anchor: 'middle', fill: '#d3e3ff' });
        for (let c = 0; c < 8; c++) coreBar(g, x + 7 + c * ((spW - 20) / 7), y + 38, 6, spH - 44, has);
        if (has) {
          R(g, x + spW - 44, y + spH - 15, 40, 12, { rx: 3, fill: 'var(--control)' });
          Tx(g, x + spW - 24, y + spH - 6, 'warp ' + k, { size: 8.5, anchor: 'middle', fill: '#1d1405', weight: 600 });
        }
        if (k === 0) c0 = [x + spW / 2, y + spH / 2];
      }
      memBar(g, 16, 218, VW - 32, 22, 'L1 Data Cache · holds Shared Memory', true);
      Tx(g, VW / 2, 264, 'two sub-partitions busy: one warp each', { size: 9, anchor: 'middle', fill: 'var(--ink-3)' });
      Tx(g, VW / 2, 277, 'each warp is handled by one of four warp schedulers', { size: 9, anchor: 'middle', fill: 'var(--ink-3)' });
      return c0;
    }
    let tokenT = null, issueT = null, laneEls = [], ldstEls = [], ldstOut = null, fmaLab = null, lsuLab = null, laneLab = null;
    function hwCore(g) {
      head(g, 'ONE SUB-PARTITION · WARP SCHEDULER → PIPES');
      R(g, 70, 26, VW - 140, 24, { rx: 4, fill: 'rgba(255,198,92,0.16)', stroke: 'var(--control)' });
      Tx(g, VW / 2, 42, 'Warp Scheduler: picks warp ' + st.ty, { size: 10, anchor: 'middle', fill: '#ffe2a8' });
      P(g, `M${VW / 2} 52V66`, { stroke: 'var(--control)', sw: 1.5 });
      P(g, `M${VW / 2 - 4} 61L${VW / 2} 68L${VW / 2 + 4} 61`, { stroke: 'var(--control)', sw: 1.5 });
      R(g, 60, 70, VW - 120, 22, { rx: 11, fill: 'var(--surface-3)', stroke: 'var(--line-2)' });
      tokenT = Tx(g, VW / 2, 85, SASS[st.pc], { size: 10, anchor: 'middle', fill: 'var(--ink)' });
      issueT = Tx(g, VW / 2, 108, '', { size: 8.5, anchor: 'middle', fill: 'var(--ink-3)' });
      fmaLab = Tx(g, 20, 126, 'FMA PIPE · 32 FP32 LANES', { size: 8.5, fill: 'var(--core)', ls: '0.08em' });
      const lw = (VW - 40) / 16;
      laneEls = [];
      for (let r = 0; r < 2; r++) for (let c = 0; c < 16; c++) {
        const x = 20 + c * lw, y = 132 + r * 34;
        laneEls.push(R(g, x + 2, y, lw - 4, 28, { rx: 2, fill: 'var(--core)', stroke: 'var(--core)', sw: 0.8 }));
      }
      lsuLab = Tx(g, 20, 214, 'LOAD/STORE · 8 UNITS', { size: 8.5, fill: 'var(--special)', ls: '0.08em' });
      const uw = 24;
      ldstEls = range(8).map((k) => R(g, 20 + k * (uw + 3), 220, uw, 18, { rx: 2, fill: 'var(--special)', stroke: 'var(--special)', sw: 0.8 }));
      ldstOut = S('g', null, g);
      const ox = 20 + 8 * (uw + 3) + 4;
      P(ldstOut, `M${ox} 229H${ox + 22}`, { stroke: 'var(--special)', sw: 1.4 });
      P(ldstOut, `M${ox + 17} 225L${ox + 23} 229L${ox + 17} 233`, { stroke: 'var(--special)', sw: 1.4 });
      Tx(ldstOut, ox + 27, 232.5, 'to memory', { size: 9, fill: 'var(--special)' });
      const lx = 20 + (st.thr % 16) * lw + lw / 2, ly = 132 + Math.floor(st.thr / 16) * 34;
      laneLab = Tx(g, VW / 2, 262, '', { size: 9.5, anchor: 'middle', fill: 'var(--accent)' });
      paintPC();
      return [lx, ly + 14];
    }
    const SW = [swGrid, swBlock, swThread], HW = [hwGPU, hwSM, hwCore];
    const NAMES = [['Programming model · grid', 'Hardware · GPU'], ['Programming model · block', 'Hardware · SM'], ['Programming model · thread', 'Hardware · core']];
    const VERB = ['runs across the whole', 'is scheduled onto one', 'runs on a'];
    const FACTS = [
      [['control', 'Blocks of a grid run <b>concurrently, in no guaranteed order</b>, anywhere from fully serial to fully parallel. Programs must work under any interleaving.'],
        ['danger', 'Blocks are strictly limited in how they coordinate: they <b>cannot synchronize with barriers</b>.'],
        ['accent', 'Each block has a unique, index-based identifier, <code>blockIdx</code>, used to pick its share of the arrays.'],
        ['core', 'The grid uses all the SMs available on the device.']],
      [['accent', 'Each thread has a unique, index-based identifier within its block, <code>threadIdx</code>, used to pick its elements.'],
        ['core', 'All threads of a block are <b>scheduled simultaneously onto the same SM</b>.'],
        ['memory', 'They can coordinate through <b>shared memory</b>, which lives in that SM’s L1 data cache.'],
        ['control', 'They can synchronize with <b>barriers</b> (<code>__syncthreads()</code>). In PTX and SASS a block is a cooperative thread array (CTA).']],
      [['ink', 'Like a thread of execution on a CPU, a CUDA thread executes a <b>stream of instructions</b>.'],
        ['core', 'The hardware that carries out arithmetic and logic instructions is called <b>cores</b>, or sometimes <b>“pipes”</b>.'],
        ['control', 'Threads are <b>selected for execution by the warp scheduler</b>, a warp of 32 at a time.'],
        ['memory', 'The values a thread works on live in its own <b>registers</b>.']],
    ];
    const WHY = [
      `The whole ${T('thread-block-grid', 'grid')} (left) spreads over the whole GPU (right): every SM is tagged with the block it received. Each block lands on some ${T('streaming-multiprocessor', 'SM')}, and which one, and when, is up to the hardware: press New launch and the tags reshuffle.`,
      `One ${T('thread-block', 'block')} (left) is placed on one SM (right) and stays there. Its 64 threads form two ${T('warp', 'warps')}, which the SM’s ${T('warp-scheduler', 'warp schedulers')} run; its shared memory is a slice of that SM’s ${T('l1-data-cache', 'L1 data cache')}.`,
      `One ${T('thread', 'thread')} (left) is a stream of instructions. Each time the warp scheduler issues its warp’s next instruction, this thread’s share of the work goes to the ${T('core', 'pipe')} that executes that instruction.`,
    ];
    const ARROW_SVG = (horiz) => horiz
      ? '<svg viewBox="0 0 44 14" aria-hidden="true"><path d="M2 7H38" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M34 2L41 7L34 12" stroke="currentColor" stroke-width="1.6" fill="none"/></svg>'
      : '<svg viewBox="0 0 14 26" aria-hidden="true"><path d="M7 2V20" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M2 16L7 23L12 16" stroke="currentColor" stroke-width="1.6" fill="none"/></svg>';
    let cur = { s: null, h: null, oS: [VW / 2, VH / 2], oH: [VW / 2, VH / 2] }, horiz = false;
    function scene(lvl) {
      const gS = S('g', { class: 'dsc-scene' }, svS);
      const gH = S('g', { class: 'dsc-scene' }, svH);
      const oS = SW[lvl](gS), oH = HW[lvl](gH);
      return { s: gS, h: gH, oS, oH };
    }
    function render(animate, dir) {
      const next = scene(st.lvl);
      svS.setAttribute('aria-label', 'Programming model: ' + NAMES[st.lvl][0]);
      svH.setAttribute('aria-label', 'Hardware: ' + NAMES[st.lvl][1]);
      const old = cur;
      cur = next;
      const doAnim = animate && !GG.reducedMotion && old.s;
      if (doAnim) {
        const setup = (g, o, sc, op) => { g.style.transition = 'none'; g.style.transformOrigin = `${r2(o[0])}px ${r2(o[1])}px`; g.style.transform = `scale(${sc})`; g.style.opacity = op; };
        const inO = dir > 0 ? [VW / 2, VH / 2] : null;
        setup(next.s, dir > 0 ? inO : next.oS, dir > 0 ? 0.35 : 2.8, 0);
        setup(next.h, dir > 0 ? inO : next.oH, dir > 0 ? 0.35 : 2.8, 0);
        void svS.getBoundingClientRect();
        [[old.s, old.oS], [old.h, old.oH]].forEach(([g, o]) => {
          g.style.transition = '';
          g.style.transformOrigin = dir > 0 ? `${r2(o[0])}px ${r2(o[1])}px` : `${VW / 2}px ${VH / 2}px`;
          g.style.transform = `scale(${dir > 0 ? 2.8 : 0.35})`;
          g.style.opacity = 0;
          setTimeout(() => g.remove(), 650);
        });
        requestAnimationFrame(() => [next.s, next.h].forEach((g) => { g.style.transition = ''; g.style.transform = 'scale(1)'; g.style.opacity = 1; }));
      } else if (old.s) { old.s.remove(); old.h.remove(); }
      hS.innerHTML = `<span>${NAMES[st.lvl][0]}</span>`;
      hH.innerHTML = `<span>${NAMES[st.lvl][1]}</span>`;
      arrow.innerHTML = ARROW_SVG(horiz) + `<span>${VERB[st.lvl]}</span>`;
      facts.innerHTML = FACTS[st.lvl].map(([c, h]) => `<li style="--fc:var(--${c === 'ink' ? 'ink-2' : c})"><span>${h}</span></li>`).join('');
      lvSeg.set(st.lvl);
      bOut.disabled = st.lvl === 0;
      bIn.disabled = st.lvl === 2;
      bNew.hidden = st.lvl !== 0;
      stepWrap.hidden = st.lvl !== 2;
      if (st.lvl !== 2 && stepper) stepper.stop();
      f.setWhy(WHY[st.lvl]);
      if (st.lvl === 2) paintPC();
    }
    function go(l) {
      l = clamp(l, 0, 2);
      if (l === st.lvl) return;
      const dir = l > st.lvl ? 1 : -1;
      if (l === 0 && st.lvl > 0) { st.seed++; perm = shuffled(range(12), rng(st.seed * 977)); }
      st.lvl = l;
      render(true, dir);
    }
    svS.addEventListener('click', (e) => {
      const g = e.target.closest && e.target.closest('.dsc-hit');
      if (!g) return;
      if (st.lvl === 0 && g.dataset.b) { st.blk = g.dataset.b.split(',').map(Number); go(1); }
      else if (st.lvl === 1 && g.dataset.t) { const [tx, ty] = g.dataset.t.split(',').map(Number); st.thr = tx; st.ty = ty; go(2); }
      else if (st.lvl === 2 && g.dataset.pc) { st.pc = +g.dataset.pc; paintPC(); }
    });
    svS.addEventListener('keydown', (e) => {
      const k = e.key;
      if (k === 'Enter' || k === ' ') { if (st.lvl < 2) { e.preventDefault(); go(st.lvl + 1); } return; }
      if (k === 'Escape' || k === 'Backspace') { if (st.lvl > 0) { e.preventDefault(); go(st.lvl - 1); } return; }
      const mv = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] }[k];
      if (!mv) return;
      e.preventDefault();
      if (st.lvl === 0) { st.blk = [clamp(st.blk[0] + mv[0], 0, 3), clamp(st.blk[1] + mv[1], 0, 2)]; render(false, 0); }
      else if (st.lvl === 1) { st.thr = clamp(st.thr + mv[0], 0, 31); st.ty = clamp(st.ty + mv[1], 0, 1); render(false, 0); }
      else { st.pc = clamp(st.pc + mv[1] + mv[0], 0, SASS.length - 1); paintPC(); }
    });
    stepper = GG.ui.stepper(stepWrap, { label: 'Instruction (SASS)', steps: SASS.map((s) => ({ label: s })), onStep: (k) => { st.pc = k; paintPC(); }, autoplay: 1300, start: st.pc });
    let small = null;
    onWidth(wrap, (w) => {
      const h = w >= 600;
      const sm = (h ? (w - 74) / 2 : w) - 14 < 480;
      if (h !== horiz || sm !== small || !cur.s) { horiz = h; small = sm; svS._small = svH._small = sm; box.classList.toggle('wide', h); render(false, 0); }
    });
    render(false, 0);
  }

  /* Fig: barriers inside a block work; across blocks they cannot */
  function barrierFig(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'A barrier inside a block, and one across blocks',
      hint: 'choose the barrier and the GPU size · replay or step',
      wide: true,
      caption: 'A simulation of four blocks of four threads, with one block per SM at a time. Each thread runs at its own pace toward the barrier (the dashed amber line), waits there if others have not arrived, and then continues to the end. A block leaves its SM only when all of its threads are done; the next block in the queue then takes the SM.',
    });
    const wrap = el('div', { class: 'dsc-w' });
    f.stage.append(wrap);
    const top = el('div', { class: 'dsc-ord-top' });
    const status = el('span', { class: 'dsc-status' });
    const lbl = el('span', { class: 'dsc-formula' });
    top.append(lbl, status);
    wrap.append(top);
    const host = el('div');
    wrap.append(host);
    legend(wrap, [['dsc-sw-ink', 'thread running'], ['dsc-sw-control', 'waiting at the barrier'], ['dsc-sw-core', 'thread finished'], ['dsc-sw-idle', 'block waiting for a free SM']]);
    const st = { mode: 'block', sms: 2 };
    GG.ui.seg(f.controls, { label: 'Barrier', value: 'block', options: [{ value: 'block', label: 'within each block' }, { value: 'grid', label: 'across the whole grid' }], onChange: (v) => { st.mode = v; reset(); } });
    GG.ui.seg(f.controls, { label: 'SMs', value: 2, options: [{ value: 2, label: '2 SMs' }, { value: 4, label: '4 SMs' }], onChange: (v) => { st.sms = v; reset(); } });
    const btnRow = el('div', { class: 'dsc-row' });
    f.controls.append(btnRow);
    const replay = GG.ui.button(btnRow, { label: 'Replay', icon: 'reset', onClick: () => reset() });
    const stepB = GG.ui.button(btnRow, { label: 'Step', icon: 'next', onClick: () => stepEvent() });
    stepB.title = 'Advance to the next event: a thread reaches the barrier, a block is released, finishes or starts';
    const sDone = GG.ui.stat(f.readouts, { label: 'blocks finished', tone: 'core' });
    const sWait = GG.ui.stat(f.readouts, { label: 'threads waiting', tone: 'control' });
    const SPEED = [[0.3, 0.22, 0.27, 0.17], [0.2, 0.32, 0.24, 0.28], [0.26, 0.19, 0.31, 0.23], [0.21, 0.29, 0.18, 0.33]];
    const BAR = 0.55;
    let sim = null, W = 0, svg = null, parts = null;
    function fresh() {
      sim = { t: 0, blocks: range(4).map((b) => ({ b, status: 'queue', sm: -1, p: [0, 0, 0, 0], rel: false, doneAt: 0 })), free: range(st.sms).map(() => 0), dead: false, deadT: 0, finished: false };
      for (let m = 0; m < st.sms; m++) { sim.blocks[m].status = 'run'; sim.blocks[m].sm = m; }
    }
    const waitingNow = () => sim.blocks.filter((b) => b.status === 'run' && !b.rel).reduce((a, b) => a + b.p.filter((x) => x >= BAR - 1e-9).length, 0);
    /* with reduced motion, jump to a telling moment: in block mode, threads waiting at their block's barrier;
       in grid mode, the outcome (deadlock, or finished on 4 SMs). Step walks on from there. */
    function reset() {
      fresh();
      if (GG.reducedMotion) {
        if (st.mode === 'block') { for (let i = 0; i < 4000 && waitingNow() < 3 && !sim.finished; i++) step(0.02); }
        else { for (let i = 0; i < 4000 && !sim.dead && !sim.finished; i++) step(0.02); }
      }
      else if (anim) { anim.reset(); anim.start(); }
      build();
      paint();
    }
    const sig = () => sim.blocks.map((b) => b.status + b.sm + (b.rel ? 'r' : '') + b.p.filter((x) => x >= BAR - 1e-9).length + b.p.filter((x) => x >= 1 - 1e-9).length).join('|') + (sim.dead ? 'D' : '') + (sim.finished ? 'F' : '');
    function stepEvent() {
      if (anim) anim.stop();
      if (sim.dead || sim.finished) fresh();
      const s0 = sig();
      for (let i = 0; i < 4000 && sig() === s0 && !sim.dead && !sim.finished; i++) step(0.02);
      paint();
    }
    function step(dt) {
      if (sim.dead || sim.finished) return;
      sim.t += dt;
      const run = sim.blocks.filter((b) => b.status === 'run');
      for (const b of run) {
        for (let j = 0; j < 4; j++) {
          const target = b.rel ? 1 : BAR;
          b.p[j] = Math.min(target, b.p[j] + SPEED[b.b][j] * dt);
        }
      }
      if (st.mode === 'block') {
        for (const b of run) if (!b.rel && b.p.every((x) => x >= BAR - 1e-9)) b.rel = true;
      } else {
        const all = sim.blocks.every((b) => b.status !== 'queue' && (b.status === 'done' || b.p.every((x) => x >= BAR - 1e-9)));
        if (all) sim.blocks.forEach((b) => { b.rel = true; });
      }
      for (const b of run) {
        if (b.p.every((x) => x >= 1 - 1e-9)) { b.status = 'done'; b.doneAt = sim.t; sim.free[b.sm] = sim.t + 0.45; }
      }
      // schedule queued blocks onto SMs that have been free for a moment
      for (let m = 0; m < st.sms; m++) {
        const busy = sim.blocks.some((b) => b.status === 'run' && b.sm === m);
        if (busy || sim.t < sim.free[m]) continue;
        const q = sim.blocks.find((b) => b.status === 'queue');
        if (!q) continue;
        q.status = 'run'; q.sm = m;
      }
      if (sim.blocks.every((b) => b.status === 'done')) sim.finished = true;
      const q = sim.blocks.some((b) => b.status === 'queue');
      const stuck = sim.blocks.filter((b) => b.status === 'run').every((b) => !b.rel && b.p.every((x) => x >= BAR - 1e-9));
      if (st.mode === 'grid' && q && stuck && sim.blocks.filter((b) => b.status === 'run').length === st.sms) {
        sim.deadT += dt;
        if (sim.deadT > 1.2) sim.dead = true;
      }
    }
    function geom(w) {
      const qW = w < 480 ? 64 : 92, gap = 12;
      const x0 = qW + gap + 58, x1 = w - 14;
      const rowH = 70, top = 24;
      return { qW, x0, x1, rowH, top, H: top + st.sms * (rowH + 10) + (st.mode === 'grid' ? 24 : 6) };
    }
    function build() {
      if (!W) return;
      clear(host);
      const G = geom(W);
      svg = svgEl(host, W, G.H, 'Simulation of four blocks on ' + st.sms + ' SMs with a barrier.');
      parts = { rows: [], q: [], G };
      Tx(svg, 0, 13, 'queue', { size: 9.5, fill: 'var(--ink-3)', ls: '0.1em' });
      Tx(svg, G.qW + 12, 13, 'SMs', { size: 9.5, fill: 'var(--ink-3)', ls: '0.1em' });
      const bx = G.x0 + BAR * (G.x1 - G.x0);
      for (let m = 0; m < st.sms; m++) {
        const y = G.top + m * (G.rowH + 10);
        R(svg, G.qW + 12, y, W - G.qW - 12, G.rowH, { rx: 8, fill: 'rgba(255,255,255,0.02)', stroke: 'var(--line-2)' });
        Tx(svg, G.qW + 22, y + 16, 'SM ' + m, { size: 10, fill: 'var(--ink-2)', weight: 600 });
        const bl = Tx(svg, G.qW + 22, y + 31, '', { size: 9.5, fill: 'var(--ink-3)' });
        const tracks = [];
        for (let j = 0; j < 4; j++) {
          const ty = y + 14 + j * 13.5;
          L(svg, G.x0, ty, G.x1, ty, { stroke: 'var(--line)', sw: 1 });
          const trail = L(svg, G.x0, ty, G.x0, ty, { stroke: 'var(--ink-2)', sw: 2, cap: 'round' });
          const dot = S('circle', { cx: G.x0, cy: ty, r: 4, fill: 'var(--ink)' }, svg);
          tracks.push({ ty, trail, dot });
        }
        if (st.mode === 'block') L(svg, bx, y + 6, bx, y + G.rowH - 6, { stroke: 'var(--control)', sw: 1.5, dash: '4 3' });
        const doneT = Tx(svg, W - 20, y + 16, '', { size: 9.5, anchor: 'end', fill: 'var(--core)', weight: 600 });
        parts.rows.push({ bl, tracks, doneT });
      }
      if (st.mode === 'grid') {
        L(svg, bx, G.top - 4, bx, G.top + st.sms * (G.rowH + 10) - 6, { stroke: 'var(--control)', sw: 2, dash: '5 3' });
        Tx(svg, bx, G.top - 8, 'grid-wide barrier', { size: 9, anchor: 'middle', fill: 'var(--control)' });
      } else Tx(svg, bx, G.top - 8, 'barrier in each block', { size: 9, anchor: 'middle', fill: 'var(--control)' });
      for (let b = 0; b < 4; b++) {
        const y = G.top + b * 24;
        const r = R(svg, 0, y, G.qW - 4, 19, { rx: 4, fill: 'none', stroke: 'var(--line-2)', dash: '3 3' });
        const t = Tx(svg, (G.qW - 4) / 2, y + 13, 'block ' + b, { size: 9.5, anchor: 'middle', fill: 'var(--ink-2)' });
        parts.q.push({ r, t });
      }
      parts.dead = Tx(svg, W / 2, G.H - 6, '', { size: 11, anchor: 'middle', fill: 'var(--danger)', weight: 700 });
    }
    function paint() {
      if (!parts) return;
      const G = parts.G;
      const byS = {};
      sim.blocks.forEach((b) => { if (b.status === 'run') byS[b.sm] = b; });
      for (let m = 0; m < st.sms; m++) {
        const row = parts.rows[m], b = byS[m];
        row.bl.textContent = b ? 'block ' + b.b : '';
        const last = sim.blocks.filter((x) => x.status === 'done' && x.sm === m).sort((a, c) => c.doneAt - a.doneAt)[0];
        row.doneT.textContent = !b && last ? `block ${last.b} done` : '';
        // an empty SM keeps a faint ghost of the block that last finished there: four completed tracks
        const ghost = !b && last;
        row.tracks.forEach((tr, j) => {
          const p = b ? b.p[j] : ghost ? 1 : 0;
          const x = G.x0 + p * (G.x1 - G.x0);
          tr.trail.setAttribute('x2', r2(x));
          const waiting = b && !b.rel && p >= BAR - 1e-9;
          tr.dot.setAttribute('cx', r2(x));
          tr.dot.setAttribute('fill', ghost ? 'var(--core)' : !b ? 'var(--line-2)' : p >= 1 - 1e-9 ? 'var(--core)' : waiting ? 'var(--control)' : 'var(--ink)');
          tr.dot.setAttribute('r', waiting ? 4.8 : 4);
          tr.dot.setAttribute('opacity', ghost ? 0.55 : 1);
          tr.trail.setAttribute('stroke', b ? 'var(--ink-2)' : ghost ? 'var(--core)' : 'none');
          tr.trail.setAttribute('opacity', ghost ? 0.3 : 1);
        });
      }
      sim.blocks.forEach((b, k) => {
        const q = parts.q[k];
        const inQ = b.status === 'queue';
        q.r.setAttribute('stroke', inQ ? 'var(--ink-3)' : b.status === 'done' ? 'var(--core)' : 'var(--line)');
        q.r.setAttribute('fill', b.status === 'done' ? 'var(--core-a)' : 'none');
        q.t.style.fill = inQ ? 'var(--ink)' : b.status === 'done' ? 'var(--core)' : 'var(--ink-3)';
        const nar = G.qW < 80;
        q.t.textContent = (nar ? 'B' : 'block ') + b.b + (b.status === 'run' ? (nar ? ' → SM' : ' → SM ') + b.sm : b.status === 'done' ? ' ✓' : '');
      });
      parts.dead.textContent = sim.dead ? (W < 520 ? 'DEADLOCK: hangs forever' : 'DEADLOCK: the program would hang here forever') : '';
      const nDone = sim.blocks.filter((b) => b.status === 'done').length;
      const nWait = waitingNow();
      sDone.set(nDone + ' / 4');
      sWait.set(nWait);
      lbl.innerHTML = st.mode === 'block' ? '<span class="d">each block:</span> work; <span class="a">__syncthreads()</span>; work' : '<span class="d">every thread of the grid:</span> work; <span class="r">wait for all 16 threads</span>; work';
      status.className = 'dsc-status ' + (sim.dead ? 'bad' : sim.finished ? 'ok' : nWait ? 'wait' : '');
      status.textContent = sim.dead ? 'deadlock' : sim.finished ? 'all blocks finished' : nWait ? 'waiting at barrier' : 'running';
      let w;
      if (sim.dead) w = `<b>Deadlock.</b> Blocks ${sim.blocks.filter((b) => b.status === 'run').map((b) => b.b).join(' and ')} wait at the barrier for blocks ${sim.blocks.filter((b) => b.status === 'queue').map((b) => b.b).join(' and ')}, which can only start once an SM frees up. Neither SM ever will. This is why blocks of a grid cannot synchronize with barriers.`;
      else if (sim.finished && st.mode === 'grid') w = `It finished, but only because this GPU has enough SMs to hold all four blocks at once. On a smaller GPU the same code hangs (switch to 2 SMs), and CUDA programs must be valid from fully serial to fully parallel.`;
      else if (sim.finished) w = `All four blocks finished (the faint green tracks are the last block each SM ran). A barrier inside a block only ever waits for threads of that same block, which are all running on the same SM at the same time, so it always completes, whatever the number of SMs.`;
      else if (st.mode === 'block') w = `Early threads wait at their block’s barrier (amber) until the last thread <em>of the same block</em> arrives; then all four move on. Blocks in the queue wait for an SM, not for each other.`;
      else w = `Every thread must now wait for all 16 threads of the grid. Blocks that are running reach the barrier and stop there, still holding their SMs${st.sms < 4 ? '. Watch what happens to the blocks in the queue.' : '.'}`;
      f.setWhy(w);
    }
    const anim = GG.anim(wrap, (t, dt) => {
      if (!sim || !parts) return;
      if (sim.dead || sim.finished) { paint(); anim.stop(); return; }
      step(Math.min(dt, 0.05));
      paint();
    });
    replay.title = 'Run the simulation again from the start';
    onWidth(host, (w) => { W = w; build(); paint(); });
    reset();
  }

  /* Fig: the SM floorplan, the warp scheduler issuing to different pipes */
  function pipesFig(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'The warp scheduler issues to the pipes',
      hint: 'choose a kind of instruction · hover any unit',
      wide: true,
      caption: 'One of the four sub-partitions of an H100 SM (the same floorplan as the Streaming Multiprocessor entry). The dots trace an instruction from the warp scheduler and dispatch unit to the units that execute it. Hover or tap any block for its name and counts.',
    });
    if (!GG.components.sm) { f.stage.innerHTML = '<p class="c-dim">The SM diagram is unavailable.</p>'; return; }
    const UNITS = {
      fp32: ['FP32', 'Floating-point adds and multiplies, like <code>FADD</code> and <code>FFMA</code>, go to the <b>FP32 units</b>: 32 per sub-partition, so a whole warp’s worth of lanes.'],
      int32: ['INT32', 'Most integer and logic instructions, such as adds, comparisons, shifts and bitwise logic (<code>IADD3</code>, <code>ISETP</code>, <code>SHF</code>, <code>LOP3</code>), go to the <b>16 INT32 units</b> of the sub-partition. Integer multiplies and multiply-adds (<code>IMUL</code>, <code>IMAD</code>) are the exception: they run on the FP32/FMA pipe, as Fig. 2 shows.'],
      fp64: ['FP64', 'Double-precision arithmetic goes to the <b>16 FP64 units</b>.'],
      tensor: ['Tensor Core', 'Matrix multiply-accumulate instructions, like <code>HMMA</code>, go to the sub-partition’s <b>Tensor Core</b>.'],
      ldst: ['LD/ST', 'Loads and stores, like <code>LDG</code> and <code>STG</code>, go to the <b>8 Load/Store Units</b>, which talk to the memory system.'],
      sfu: ['SFU', 'Transcendental functions, such as sine, cosine and reciprocal square root, go to the <b>Special Function Unit</b>.'],
    };
    const sm = GG.components.sm(f.stage, { focus: 'sub', highlight: ['scheduler', 'dispatch', 'fp32'], showCounts: true, maxHeight: '72vh' });
    let stop = null, moving = !GG.reducedMotion;
    const set = (k) => {
      try { if (stop) stop(); } catch (e) { /* ignore */ }
      sm.highlight(['scheduler', 'dispatch', k]);
      stop = sm.flow('dispatch', k, { color: 'control', dots: 4 });
      if (stop) { if (moving && stop.play) stop.play(); else if (!moving && stop.pause) stop.pause(); }
      f.setWhy(`${UNITS[k][1]} The warp scheduler picks one warp that is ready and issues its next instruction; which ${T('core', 'pipe')} it goes to depends on the instruction. Profilers report how busy each one is as ${T('pipe-utilization', 'pipe utilization')}.`);
    };
    GG.ui.seg(f.controls, { label: 'Instruction goes to', value: 'fp32', options: Object.keys(UNITS).map((k) => ({ value: k, label: UNITS[k][0] })), onChange: set });
    motionBtn(f.controls, moving, () => {
      moving = !moving;
      if (stop) { if (moving && stop.play) stop.play(); else if (!moving && stop.pause) stop.pause(); }
      return moving;
    }, 'Start or stop the dots moving from the dispatch unit to the pipe');
    set('fp32');
  }

  GG.entry('thread-hierarchy', {
    render(body, ctx) {
      body.classList.add('dsc-body');
      const s = ctx.html(body, `
<p>The <strong>thread hierarchy</strong> is a key abstraction of the ${T('cuda-programming-model', 'CUDA programming model')}, alongside the ${T('memory-hierarchy', 'memory hierarchy')}. It organizes the execution of a parallel program across three nested levels, from individual threads up to entire GPU devices: ${T('thread', 'threads')} are grouped into ${T('thread-block', 'thread blocks')}, and blocks into a ${T('thread-block-grid', 'thread block grid')}. Each level maps onto a level of the ${T('device-hardware', 'GPU hardware')}. Fig. 1 redraws the glossary’s picture of all three levels and their hardware at once; Fig. 2 zooms through them one at a time.</p>
<div data-slot="map" class="wide"></div>
<div data-slot="zoom" class="wide"></div>

<h3>Threads: the lowest level</h3>
<p>At the lowest level are individual ${T('thread', 'threads')}. Like a thread of execution on a CPU, each CUDA thread executes a stream of instructions, one after another. The hardware resources that actually carry out arithmetic and logic instructions are called ${T('core', 'cores')}, or sometimes “pipes”, as in a pipeline that instructions flow through. Threads do not pick their own moment to run: they are selected for execution by the ${T('warp-scheduler', 'Warp Scheduler')}, which works in ${T('warp', 'warps')} of 32 threads and sends each instruction to the pipe that can execute it (Fig. 4).</p>

<h3>Blocks: the intermediate level</h3>
<p>The intermediate level consists of ${T('thread-block', 'thread blocks')}, which are also known as ${T('cooperative-thread-array', 'cooperative thread arrays')} in ${T('parallel-thread-execution', 'PTX')} and ${T('streaming-assembler', 'SASS')}. Each thread has a unique identifier within its thread block, <code>threadIdx</code>. These identifiers are index-based (0, 1, 2 … along each axis) to support easy assignment of work to threads based on indices into input or output arrays: thread 7 takes element 7.</p>
<p>All threads within a block are scheduled simultaneously onto the same ${T('streaming-multiprocessor', 'Streaming Multiprocessor (SM)')}. Because they are all there together, they can coordinate through ${T('shared-memory', 'shared memory')} and synchronize with barriers: a barrier is a line in the program that no thread of the block passes until every thread of the block has reached it.</p>

<h3>Grids: the highest level</h3>
<p>At the highest level, multiple blocks are organized into a ${T('thread-block-grid', 'thread block grid')} that spans the entire GPU. Blocks are strictly limited in their coordination and communication. Blocks within a grid execute concurrently with respect to each other, with no guaranteed execution order, so ${T('cuda-programming-model', 'CUDA programs')} must be written so that any interleaving of blocks is valid, from fully serial to fully parallel. That means blocks cannot, for instance, synchronize with barriers. Fig. 3 shows why: a barrier across blocks waits for blocks that may not have started, and may never be able to.</p>
<div data-slot="barrier" class="wide"></div>
<p>Like threads, each block has a unique, index-based identifier, <code>blockIdx</code>, to support assignment of work based on array index. Combining the two identifiers gives every thread in the grid its own element: <code>blockIdx.x * blockDim.x + threadIdx.x</code> (explore it in ${T('thread-block-grid', 'Thread Block Grid')}).</p>
<h3>A fourth level, on newer GPUs: clusters</h3>
<p>The glossary describes one more level in its ${T('graphics-processing-cluster', 'GPU Processing Cluster (GPC)')} entry, and leaves it out elsewhere. Since the introduction of ${T('compute-capability', 'compute capability')} 9.0 GPUs like the H100, the thread hierarchy can have an additional layer between block and grid: a <em>cluster</em> of thread blocks that are scheduled onto the same GPC, just as the threads of a block are scheduled onto the same SM. A cluster has its own level of the ${T('memory-hierarchy', 'memory hierarchy')}, <em>distributed shared memory</em>: the shared memories of all the cluster’s blocks, taken together. Clusters are opt-in; a launch that does not ask for them follows the three-level rules above.</p>
${GG.noteHTML('beyond', '<p><b>Clusters in practice, and one more exception.</b> Per NVIDIA’s programming guide, a cluster holds up to 8 blocks portably (some GPUs allow more), its threads can synchronize with a cluster-wide barrier (<code>cluster.sync()</code> in Cooperative Groups), and they can read, write and perform atomics on any address in the cluster’s distributed shared memory. Separately, a <em>cooperative launch</em> (<code>cudaLaunchCooperativeKernel</code>) lets all threads of a grid synchronize with <code>grid.sync()</code>, but only if the grid is small enough for every block to be resident at once, which is exactly the condition Fig. 3 shows failing. Ordinary launches still follow the glossary’s rule.</p>')}

<h3>How the hierarchy maps onto the hardware</h3>
<p>This hierarchy maps directly onto the ${T('device-hardware', 'GPU hardware')}: threads execute on individual ${T('core', 'cores')} (for most arithmetic, ${T('cuda-core', 'CUDA Cores')}), thread blocks are scheduled onto ${T('streaming-multiprocessor', 'SMs')}, and grids utilize all available SMs on the device.</p>
<div data-slot="pipes" class="wide"></div>
${GG.tableHTML(`<thead><tr><th>Level</th><th>Identifier</th><th>Runs on</th><th>Coordinates through</th></tr></thead><tbody>
<tr><td>Thread</td><td><code>threadIdx</code> (within its block)</td><td>a core (“pipe”), chosen instruction by instruction</td><td>its own ${T('registers', 'registers')} (plus warp shuffles within its warp, and warp-wide Tensor Core instructions)</td></tr>
<tr><td>Thread block (CTA)</td><td><code>blockIdx</code> (within the grid)</td><td>one SM, for its whole life</td><td>${T('shared-memory', 'shared memory')} and barriers</td></tr>
<tr><td>Cluster (optional, compute capability 9.0+)</td><td>its rank in the cluster</td><td>the SMs of one GPC</td><td>distributed shared memory and a cluster barrier</td></tr>
<tr><td>Grid</td><td>one per ${T('kernel', 'kernel')} launch</td><td>every SM of the GPU</td><td>${T('global-memory', 'global memory')} and atomics; no barriers in an ordinary launch (cooperative launches aside)</td></tr></tbody>`)}
<div data-slot="read"></div>`);

      guard(s.map, 'Programming model map', () => mapFig(s.map, ctx, {
        title: 'The thread hierarchy and the hardware it maps onto',
        highlight: ['thread', 'block', 'grid'],
        caption: 'Redrawn after the glossary’s figure. The thread hierarchy of the CUDA programming model spans from individual threads to thread blocks to thread block grids (left), mapping onto the hardware from CUDA Cores to Streaming Multiprocessors to the entire GPU (right). Modified from diagrams in NVIDIA’s <a href="https://developer.nvidia.com/blog/cuda-refresher-cuda-programming-model/">CUDA Refresher: The CUDA Programming Model</a> and the NVIDIA <a href="https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#programming-model">CUDA C++ Programming Guide</a>.',
        why: 'Lit: all three levels of the <b>thread hierarchy</b> and the hardware each one runs on. A <b>thread</b> runs on a core, a <b>thread block</b> is scheduled onto one <b>Streaming Multiprocessor</b>, and a <b>grid</b> runs across all the SMs of the <b>GPU</b>. Hover or tap a level to read its pair.',
      }));
      guard(s.zoom, 'Zoom figure', () => zoomFig(s.zoom, ctx));
      guard(s.barrier, 'Barrier simulation', () => barrierFig(s.barrier, ctx));
      guard(s.pipes, 'Pipes figure', () => pipesFig(s.pipes, ctx));
      ctx.reading(s.read, [REFRESHER, CPG, CPG_CLUSTERS]);
    },
  });


  /* ═════════════════════════════ Memory Hierarchy ═════════════════════════════ */

  GG.css(`
.dsc-vis { display: grid; grid-template-columns: minmax(0, 1fr); gap: 6px; margin-top: 10px; }
@media (min-width: 720px) { .dsc-vis { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.dsc-vis > div { border: 1px solid var(--line); border-radius: 10px; padding: 8px 10px; background: rgba(8, 9, 14, 0.5); font-size: 13px; line-height: 1.45; color: var(--ink-2); }
.dsc-vis b { display: block; font: 600 11px/1.3 var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--memory); margin-bottom: 3px; }
.dsc-lanes { display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 3px; max-width: 360px; }
.dsc-lanes button { height: 26px; border-radius: 6px; border: 1px solid var(--line-2); background: var(--surface-2); color: var(--ink-2); font: 500 11px var(--font-mono); cursor: pointer; padding: 0; }
.dsc-lanes button:hover { border-color: var(--ink-3); color: var(--ink); }
.dsc-lanes button.need { box-shadow: inset 0 0 0 2px var(--accent-2); color: var(--ink); }
.dsc-lanes button[aria-pressed="true"] { background: var(--accent); border-color: var(--accent); color: var(--on-accent); font-weight: 700; }
.dsc-mma-top { display: flex; flex-wrap: wrap; gap: 12px 20px; align-items: flex-start; margin-bottom: 10px; }
.dsc-mma-top .dsc-formula { flex: 1 1 260px; }
`);

  /* Fig: who can see what, and where two threads meet */
  function visibilityFig(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Who can see what, and where two threads meet',
      hint: 'click a thread · switch to partner and click another · arrow keys move',
      wide: true,
      caption: 'A small grid: a few blocks of a few threads each. Every thread has registers, every block has shared memory, and the whole grid has global memory. Thin blue lines run from the selected thread (copper) to each memory it can read and write; crossed-out memories exist but are invisible to it. The partner thread (dashed, light copper) shows where two threads meet: the lowest level of the hierarchy that both can reach, drawn with both threads’ connectors. This is an ordinary launch, without thread block clusters.',
    });
    const wrap = el('div', { class: 'dsc-w' });
    f.stage.append(wrap);
    const host = el('div');
    wrap.append(host);
    const vis = el('div', { class: 'dsc-vis' });
    wrap.append(vis);
    const st = { a: { b: 1, t: 2 }, p: { b: 1, t: 4 }, pick: 'a' };
    let W = 0, nB = 3, nT = 6, svg = null, hits = [];
    const pickSeg = GG.ui.seg(f.controls, { label: 'Click picks', value: 'a', options: [{ value: 'a', label: 'the thread' }, { value: 'p', label: 'its partner' }], onChange: (v) => { st.pick = v; } });
    const btnRow = el('div', { class: 'dsc-row' });
    f.controls.append(btnRow);
    GG.ui.button(btnRow, { label: 'Partner in same block', onClick: () => { st.p = { b: st.a.b, t: (st.a.t + 2) % nT }; draw(W); } });
    GG.ui.button(btnRow, { label: 'Partner in another block', onClick: () => { st.p = { b: (st.a.b + 1) % nB, t: st.a.t }; draw(W); } });
    const sMeet = GG.ui.stat(f.readouts, { label: 'they meet in', tone: 'memory' });
    const sTool = GG.ui.stat(f.readouts, { label: 'to coordinate', tone: 'control' });
    const sHidden = GG.ui.stat(f.readouts, { label: 'invisible to the thread' });
    const meetOf = () => (st.a.b === st.p.b ? (st.a.t === st.p.t ? 'reg' : 'shared') : 'global');
    function draw(w) {
      if (!w) return;
      W = w;
      nB = w >= 560 ? 3 : 2;
      nT = w >= 560 ? 6 : 4;
      for (const q of [st.a, st.p]) { q.b = Math.min(q.b, nB - 1); q.t = Math.min(q.t, nT - 1); }
      clear(host);
      hits = [];
      const meet = meetOf();
      const gap = 14, bw = (w - (nB - 1) * gap) / nB;
      const top = 20, bh = 150, gy = top + bh + 30, gh = 28;
      svg = svgEl(host, w, gy + gh + 22, 'Blocks of threads with their registers, shared memory and global memory. The selected thread’s reachable memories are highlighted, and the memory where it meets its partner.', { focusable: true, role: 'group' });
      // global memory
      const gMeet = meet === 'global';
      R(svg, 0, gy, w, gh, { rx: 5, fill: gMeet ? 'rgba(111,166,255,0.42)' : 'rgba(111,166,255,0.26)', stroke: gMeet ? '#fff' : 'var(--memory)', sw: gMeet ? 1.8 : 1.4 });
      Tx(svg, w / 2, gy + gh / 2 + 4, w < 480 ? 'Global Memory · every thread' : 'Global Memory · every thread of the grid', { size: 11, anchor: 'middle', fill: '#fff', weight: 500 });
      const pos = {};
      const shY = top + 10, shH = 20;
      for (let b = 0; b < nB; b++) {
        const x0 = b * (bw + gap);
        const mine = b === st.a.b;
        const shMeet = meet === 'shared' && mine;
        Tx(svg, x0 + 2, top - 6, 'block ' + b, { size: 10, fill: mine ? 'var(--ink)' : 'var(--ink-3)', weight: mine ? 600 : 500 });
        R(svg, x0, top, bw, bh, { rx: 6, fill: mine ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.015)', stroke: mine ? 'var(--ink-2)' : 'var(--line-2)', dash: mine ? null : '5 4', sw: mine ? 1.3 : 1 });
        R(svg, x0 + 8, shY, bw - 16, shH, { rx: 3, fill: shMeet ? 'rgba(111,166,255,0.5)' : mine ? 'rgba(111,166,255,0.3)' : 'rgba(111,166,255,0.06)', stroke: shMeet ? '#fff' : mine ? 'var(--memory)' : 'rgba(111,166,255,0.35)', sw: shMeet ? 1.8 : mine ? 1.4 : 1 });
        Tx(svg, x0 + bw / 2, shY + shH / 2 + 3.8, mine ? (shMeet && bw >= 200 ? 'Shared Memory · they meet here' : 'Shared Memory') : bw < 230 ? 'not visible' : 'Shared Memory · not visible', { size: bw < 170 ? 9 : 10, anchor: 'middle', fill: mine ? '#fff' : 'var(--ink-3)' });
        if (!mine) {
          L(svg, x0 + 12, shY + 4, x0 + 26, shY + shH - 4, { stroke: 'var(--danger)', sw: 1.2, opacity: 0.7 });
          L(svg, x0 + 12, shY + shH - 4, x0 + 26, shY + 4, { stroke: 'var(--danger)', sw: 1.2, opacity: 0.7 });
        }
        // threads, inset so every register chip stays inside its block
        const sp0 = (bw - 24) / (nT - 1);
        const cw = Math.min(26, sp0 - 6);
        const sp = (bw - 24 - cw) / (nT - 1);
        for (let t = 0; t < nT; t++) {
          const x = x0 + 12 + cw / 2 + t * sp;
          const me = mine && t === st.a.t;
          const pa = b === st.p.b && t === st.p.t && !me;
          const g = S('g', { class: 'dsc-hit' }, svg);
          R(g, x - sp / 2, top + 36, sp, bh - 38, { fill: 'transparent', rx: 0 });
          strand(g, x, top + 44, 62, { amp: 2, wl: 10, phase: t * 0.7 + b, sw: me || pa ? 2 : 1.2, stroke: me ? 'var(--accent)' : pa ? 'var(--accent-2)' : 'var(--ink-2)', hw: 2.6 });
          if (pa) R(g, x - sp / 2 + 3, top + 38, sp - 6, 76, { rx: 4, stroke: 'var(--accent-2)', sw: 1, dash: '3 3' });
          const cy = top + 116;
          R(g, x - cw / 2, cy, cw, 14, { rx: 2.5, fill: me ? 'var(--memory)' : 'rgba(111,166,255,0.1)', stroke: me ? 'var(--memory)' : 'rgba(111,166,255,0.4)', sw: 1 });
          if (!me) L(g, x - cw / 2 + 3, cy + 11, x + cw / 2 - 3, cy + 3, { stroke: 'var(--danger)', sw: 1, opacity: 0.55 });
          Tx(g, x, top + 142, 't' + t, { size: 9, anchor: 'middle', fill: me ? 'var(--accent)' : pa ? 'var(--accent-2)' : 'var(--ink-3)', weight: me || pa ? 600 : 500 });
          hits.push({ b, t, x, y0: top + 36, y1: top + bh });
          pos[b + ':' + t] = { x, cy };
        }
      }
      // the selected thread's reach: up to its shared memory, down to global, and its own registers
      const A = pos[st.a.b + ':' + st.a.t], Pp = pos[st.p.b + ':' + st.p.t];
      const up = (x, col, sw, dash) => { P(svg, `M${r2(x)} ${top + 44}V${shY + shH + 2}`, { stroke: col, sw, dash }); P(svg, `M${r2(x - 3)} ${shY + shH + 7}L${r2(x)} ${shY + shH + 2}L${r2(x + 3)} ${shY + shH + 7}`, { stroke: col, sw }); };
      const down = (x, cy, col, sw, dash) => { P(svg, `M${r2(x)} ${cy + 14}V${gy - 2}`, { stroke: col, sw, dash }); P(svg, `M${r2(x - 3)} ${gy - 7}L${r2(x)} ${gy - 2}L${r2(x + 3)} ${gy - 7}`, { stroke: col, sw }); };
      up(A.x + 6, 'var(--memory)', 1.1);
      down(A.x + 6, A.cy, 'var(--memory)', 1.1);
      const leftSide = A.x + 90 > w;
      Tx(svg, leftSide ? A.x - 4 : A.x + 12, top + bh + 14, 'its registers ↑', { size: 9, fill: 'var(--memory)', anchor: leftSide ? 'end' : 'start' });
      // where the two meet: both threads' connectors to that memory
      if (meet === 'shared') {
        up(A.x, 'var(--accent)', 1.8);
        up(Pp.x, 'var(--accent-2)', 1.8, '4 3');
      } else if (meet === 'global') {
        down(A.x, A.cy, 'var(--accent)', 1.8);
        down(Pp.x, Pp.cy, 'var(--accent-2)', 1.8, '4 3');
        const xa = Math.min(A.x, Pp.x), xb = Math.max(A.x, Pp.x);
        L(svg, xa, gy + gh + 6, xb, gy + gh + 6, { stroke: 'var(--accent-2)', sw: 1.6 });
        L(svg, xa, gy + gh + 2, xa, gy + gh + 10, { stroke: 'var(--accent-2)', sw: 1.6 });
        L(svg, xb, gy + gh + 2, xb, gy + gh + 10, { stroke: 'var(--accent-2)', sw: 1.6 });
        Tx(svg, clamp((xa + xb) / 2, 60, w - 60), gy + gh + 19, 'they meet only here', { size: 9.5, anchor: 'middle', fill: 'var(--accent-2)', weight: 600 });
      }
      svg.addEventListener('click', (e) => {
        const [px, py] = svgPoint(svg, e);
        let best = null, bd = 1e9;
        for (const h of hits) { if (py < h.y0 - 10 || py > h.y1 + 10) continue; const d = Math.abs(px - h.x); if (d < bd) { bd = d; best = h; } }
        if (!best || bd >= 40) return;
        const which = e.shiftKey ? 'p' : st.pick;
        st[which] = { b: best.b, t: best.t };
        draw(W);
      });
      svg.addEventListener('keydown', (e) => {
        const tot = nB * nT, q = st[st.pick];
        let k = q.b * nT + q.t;
        if (e.key === 'ArrowRight') k = Math.min(tot - 1, k + 1); else if (e.key === 'ArrowLeft') k = Math.max(0, k - 1);
        else if (e.key === 'p' || e.key === 'P') { st.pick = st.pick === 'a' ? 'p' : 'a'; pickSeg.set(st.pick); e.preventDefault(); return; }
        else return;
        e.preventDefault();
        st[st.pick] = { b: Math.floor(k / nT), t: k % nT };
        draw(W);
        requestAnimationFrame(() => svg && svg.focus());
      });
      update();
    }
    function update() {
      const others = nB * nT - 1, meet = meetOf();
      const a = st.a, p = st.p;
      sMeet.set(meet === 'reg' ? 'its own registers' : meet === 'shared' ? `block ${a.b}’s shared memory` : 'global memory only');
      sTool.set(meet === 'reg' ? 'nothing needed' : meet === 'shared' ? 'a barrier' : 'atomics');
      sHidden.set(`${others} reg sets · ${nB - 1} shared`);
      vis.innerHTML = `<div><b>Registers</b>Its own, and no one else’s: the other ${others} threads’ registers are invisible to thread ${a.t} of block ${a.b}.</div>` +
        `<div><b>Shared memory</b>Block ${a.b}’s, which it shares with the ${nT - 1} other threads of its block. The other ${nB - 1} block${nB > 2 ? 's’' : '’s'} shared memory is out of reach.</div>` +
        `<div><b>Global memory</b>The grid’s, shared with all ${nB * nT} threads of every block, and it outlives the kernel.</div>`;
      const reach = `Thread ${a.t} of block ${a.b} can reach exactly three memories, one per level of the ${T('thread-hierarchy', 'thread hierarchy')}: its own ${T('registers', 'registers')}, its block’s ${T('shared-memory', 'shared memory')} and the grid’s ${T('global-memory', 'global memory')}. `;
      if (meet === 'reg') f.setWhy(reach + 'The partner is the same thread, so there is nothing to share: pick another partner.');
      else if (meet === 'shared') f.setWhy(reach + `Its partner, thread ${p.t}, is in the <b>same block</b>, so they meet in block ${a.b}’s fast <b>shared memory</b>, and a barrier (<code>__syncthreads()</code>) tells them when a value is ready.`);
      else f.setWhy(reach + `Its partner, thread ${p.t} of block ${p.b}, is in <b>another block</b>: each can see only its own block’s shared memory, so in an ordinary launch the lowest level they share is <b>global memory</b>. There is no barrier between blocks, so atomics are their tool.`);
    }
    onWidth(host, (w) => draw(w));
    update();
  }

  /* Fig: who decides what stays on chip: a hardware cache vs shared memory filled by the kernel */
  function placeFig(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Who decides what stays on chip',
      hint: 'switch the memory · change the cache size',
      wide: true,
      caption: 'One thread reads values of an array <code>A</code> in global memory, in the order shown along the top. Through a hardware cache, which values stay on chip is decided by the cache’s own replacement policy; it is drawn here as a tiny least-recently-used (LRU) cache, a stand-in for the real L1 policy, which NVIDIA does not document. The code cannot see or steer it. Through shared memory, the kernel itself copies <code>A[0..3]</code> in (one trip each), waits at a barrier, and then every read is served on chip.',
    });
    const wrap = el('div', { class: 'dsc-w' });
    f.stage.append(wrap);
    const top = el('div', { class: 'dsc-ord-top' });
    const code = el('div', { class: 'dsc-formula' });
    top.append(code);
    wrap.append(top);
    const host = el('div');
    wrap.append(host);
    legend(wrap, [['dsc-sw-memory', 'served on chip'], ['dsc-sw-danger', 'trip to GPU RAM (a miss)'], ['dsc-sw-control', 'placement chosen by the code']]);
    const SEQ = [0, 1, 2, 0, 3, 1, 0, 2];
    const st = { mode: 'l1', lines: 3 };
    GG.ui.seg(f.controls, { label: 'Reads go through', value: 'l1', options: [{ value: 'l1', label: 'L1 cache (hardware decides)' }, { value: 'sh', label: 'shared memory (your code decides)' }], onChange: (v) => { st.mode = v; update(); } });
    const lines = GG.ui.slider(f.controls, { label: 'Cache lines (stand-in)', min: 1, max: 4, value: st.lines, onInput: (v) => { st.lines = v; update(); } });
    const sTrips = GG.ui.stat(f.readouts, { label: 'trips to GPU RAM' });
    const sOn = GG.ui.stat(f.readouts, { label: 'reads served on chip', tone: 'memory' });
    const sWho = GG.ui.stat(f.readouts, { label: 'placement decided by' });
    function simulate() {
      const cols = [];
      if (st.mode === 'l1') {
        let cache = [];
        for (const a of SEQ) {
          const hit = cache.includes(a);
          cache = cache.filter((x) => x !== a);
          cache.push(a);
          if (cache.length > st.lines) cache.shift();
          cols.push({ read: 'A[' + a + ']', from: hit ? 'L1 hit' : 'RAM', hit, slots: cache.map((x) => 'A' + x), cap: st.lines, by: 'hardware' });
        }
      } else {
        cols.push({ read: 'copy', sub: 'A[0..3] → s', from: '4 trips', hit: false, copy: true, slots: ['A0', 'A1', 'A2', 'A3'], cap: 4, by: 'your code' });
        for (const a of SEQ) cols.push({ read: 's[' + a + ']', from: 'shared', hit: true, slots: ['A0', 'A1', 'A2', 'A3'], cap: 4, by: 'your code', mark: a });
      }
      return cols;
    }
    let W = 0;
    function draw(w) {
      W = w;
      clear(host);
      const cols = simulate();
      const lab = w >= 640 ? 118 : 0;
      const n = cols.length, gap = 4;
      const cw = (w - lab - (n - 1) * gap) / n;
      const sm = cw < 46;
      const y1 = lab ? 4 : 16, rh = 26;
      const ys = y1 + rh + (lab ? 14 : 28), slotH = 14;
      const y3 = ys + 4 * (slotH + 2) + (lab ? 12 : 26);
      const y4 = y3 + rh + (lab ? 8 : 22);
      const H = y4 + 20;
      const svg = svgEl(host, w, H, 'A sequence of reads, what is kept on chip after each, and where each read is served from.');
      const rows = [[y1, 'the thread reads'], [ys, 'on chip afterwards'], [y3, 'served from'], [y4, 'placement chosen by']];
      rows.forEach(([y, t]) => { if (lab) Tx(svg, 0, y + 15, t, { size: 9.5, fill: 'var(--ink-3)' }); else Tx(svg, 0, y - 6, t, { size: 9, fill: 'var(--ink-3)' }); });
      cols.forEach((c, k) => {
        const x = lab + k * (cw + gap), cx = x + cw / 2;
        R(svg, x, y1, cw, rh, { rx: 4, fill: c.copy ? 'var(--control-a)' : 'rgba(255,255,255,0.03)', stroke: c.copy ? 'var(--control)' : 'var(--line-2)' });
        Tx(svg, cx, y1 + (c.sub && !sm ? 11 : 17), c.read, { size: sm ? 8.5 : 10, anchor: 'middle', fill: c.copy ? '#ffe2a8' : 'var(--ink)', weight: 600 });
        if (c.sub && !sm) Tx(svg, cx, y1 + 22, c.sub, { size: 8, anchor: 'middle', fill: '#ffe2a8' });
        for (let q = 0; q < c.cap; q++) {
          const v = c.slots[q];
          const yy = ys + q * (slotH + 2);
          const isNew = v && (c.read === 'A[' + v.slice(1) + ']' || c.mark === +v.slice(1));
          R(svg, x + 2, yy, cw - 4, slotH, { rx: 2, fill: v ? (isNew ? 'rgba(111,166,255,0.45)' : 'var(--memory-a)') : 'none', stroke: v ? 'var(--memory)' : 'var(--line-2)', sw: 0.8, dash: v ? null : '2 2' });
          if (v) Tx(svg, cx, yy + 10.5, v, { size: 8.5, anchor: 'middle', fill: 'var(--ink)' });
        }
        R(svg, x, y3, cw, rh, { rx: 4, fill: c.hit ? 'var(--memory-a)' : 'var(--danger-a)', stroke: c.hit ? 'var(--memory)' : 'var(--danger)' });
        Tx(svg, cx, y3 + 17, sm ? (c.hit ? (c.from === 'shared' ? 's' : 'hit') : c.copy ? '4×RAM' : 'RAM') : c.from, { size: sm ? 8.5 : 9.5, anchor: 'middle', weight: 600, fill: c.hit ? 'var(--ink)' : 'var(--danger)' });
        Tx(svg, cx, y4 + 12, sm ? (c.by === 'hardware' ? 'hw' : 'code') : c.by, { size: 9, anchor: 'middle', fill: c.by === 'hardware' ? 'var(--ink-3)' : 'var(--control)', weight: c.by === 'hardware' ? 500 : 600 });
      });
    }
    function update() {
      const cols = simulate();
      const trips = st.mode === 'l1' ? cols.filter((c) => !c.hit).length : 4;
      const on = cols.filter((c) => c.hit).length;
      lines.el.style.opacity = st.mode === 'l1' ? '' : '0.45';
      lines.input.disabled = st.mode !== 'l1';
      code.innerHTML = st.mode === 'l1'
        ? '<span class="d">each read:</span> x = A[k];  <span class="d">// the code never says what stays on chip</span>'
        : '<span class="a">s[t] = A[t]; __syncthreads();</span>  <span class="d">then each read:</span> x = s[k];';
      sTrips.set(trips, trips > 4 ? 'danger' : null);
      sOn.set(`${on} of ${SEQ.length}`);
      sWho.set(st.mode === 'l1' ? 'the hardware' : 'the kernel', st.mode === 'l1' ? null : 'control');
      if (W) draw(W);
      f.setWhy(st.mode === 'l1'
        ? `Through a cache, the hardware decides what to keep. With ${st.lines} line${st.lines > 1 ? 's' : ''} in this stand-in, ${on} of ${SEQ.length} reads hit and ${trips} go out to ${T('gpu-ram', 'GPU RAM')}. Change the cache size and the hits change, yet the code is the same: it cannot see or control the placement.`
        : `With ${T('shared-memory', 'shared memory')}, the kernel decides: it copies the four values it will need (4 trips to GPU RAM), waits at a barrier, and then all ${SEQ.length} reads are served on chip from <code>s</code>, every time. This explicit placement is what “managed by the programmer” means.`);
    }
    onWidth(host, (w) => draw(w));
    update();
  }

  /* Fig: the Tensor Core exception, fragments of one mma.sync spread over the warp */
  function mmaFig(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'One Tensor Core instruction, 32 threads’ registers',
      hint: 'pick a lane · tap or hover a matrix element · arrow keys move',
      wide: true,
      caption: 'The matrices of one <code>mma.sync.aligned.m16n8k16.row.col.f32.bf16.bf16.f32</code> (D = A × B + C, with A 16 × 16, B 16 × 8, and C and D 16 × 8). Each small square is one element; the lit ones are held in the registers of the selected lane. Layout from NVIDIA’s PTX ISA documentation (“Matrix Fragments for mma.m16n8k16 with floating point type”), with groupID = laneid >> 2 and threadID_in_group = laneid % 4.',
    });
    const wrap = el('div', { class: 'dsc-w' });
    f.stage.append(wrap);
    const topRow = el('div', { class: 'dsc-mma-top' });
    const lanes = el('div', { class: 'dsc-lanes', role: 'group', 'aria-label': 'Lane of the warp' });
    const info = el('div', { class: 'dsc-formula' });
    const lp = el('div');
    lp.append(el('div', { class: 'dsc-k', text: 'lane (thread) of the warp', style: 'margin-bottom:6px' }), lanes);
    topRow.append(lp, info);
    wrap.append(topRow);
    const host = el('div');
    wrap.append(host);
    legend(wrap, [['dsc-sw-memory', 'held by the selected lane'], ['dsc-sw-accent', 'the element you picked'], ['dsc-sw-memory-a', 'held by the other 31 lanes'], ['dsc-sw-rel', 'the elements it is computed with (their lanes are outlined above)']]);
    const st = { lane: 13, hov: null, sel: null };
    const laneBtns = range(32).map((l) => {
      const b = el('button', { type: 'button', 'aria-pressed': 'false', title: 'lane ' + l }, String(l));
      b.addEventListener('click', () => { st.lane = l; st.hov = null; st.sel = null; update(); });
      lanes.append(b);
      return b;
    });
    // fragment layout (PTX ISA, mma.m16n8k16, .bf16 inputs, .f32 accumulators)
    function fragA(l) {
      const g = l >> 2, q = l % 4, out = [];
      for (let i = 0; i < 8; i++) out.push({ i, r: (i < 2 || (i >= 4 && i < 6)) ? g : g + 8, c: q * 2 + (i & 1) + (i >= 4 ? 8 : 0), reg: '%r' + (1 + (i >> 1)) });
      return out;
    }
    function fragB(l) {
      const g = l >> 2, q = l % 4, out = [];
      for (let i = 0; i < 4; i++) out.push({ i, r: q * 2 + (i & 1) + (i >= 2 ? 8 : 0), c: g, reg: '%r' + (5 + (i >> 1)) });
      return out;
    }
    function fragD(l) {
      const g = l >> 2, q = l % 4, out = [];
      for (let i = 0; i < 4; i++) out.push({ i, r: g + (i >= 2 ? 8 : 0), c: q * 2 + (i & 1), reg: '%f' + (1 + i) });
      return out;
    }
    // reverse maps: element → {lane, i, reg}
    const own = { A: {}, B: {}, D: {} };
    for (let l = 0; l < 32; l++) {
      fragA(l).forEach((e) => { own.A[e.r + ',' + e.c] = { l, i: e.i, reg: e.reg }; });
      fragB(l).forEach((e) => { own.B[e.r + ',' + e.c] = { l, i: e.i, reg: e.reg }; });
      fragD(l).forEach((e) => { own.D[e.r + ',' + e.c] = { l, i: e.i, reg: e.reg }; });
    }
    /* the elements a picked element is computed with: D[r][c] = sum over k of A[r][k] * B[k][c] (+ C[r][c]) */
    function related(E) {
      const rel = { A: new Set(), B: new Set(), D: new Set() };
      if (!E) return rel;
      if (E.m === 'D') for (let k = 0; k < 16; k++) { rel.A.add(E.r + ',' + k); rel.B.add(k + ',' + E.c); }
      else if (E.m === 'A') for (let c = 0; c < 8; c++) { rel.D.add(E.r + ',' + c); rel.B.add(E.c + ',' + c); }
      else for (let r = 0; r < 16; r++) { rel.A.add(r + ',' + E.r); rel.D.add(r + ',' + E.c); }
      return rel;
    }
    const lanesOf = (m, set) => [...new Set([...set].map((k) => own[m][k].l))].sort((a, b) => a - b);
    function laneList(ls) {
      const out = [];
      for (let i = 0; i < ls.length;) {
        let j = i;
        while (j + 1 < ls.length && ls[j + 1] === ls[j] + 1) j++;
        out.push(j > i ? `${ls[i]}–${ls[j]}` : String(ls[i]));
        i = j + 1;
      }
      return out.join(', ');
    }
    let W = 0, svg = null, cells = [];
    function draw(w) {
      W = w;
      clear(host);
      cells = [];
      const narrow = w < 560;
      const lab = 16;
      const REL = related(st.hov || st.sel);
      let cs, pos;
      if (!narrow) {
        cs = clamp(Math.floor((w - 2 * 44 - 10) / 32), 9, 18);
        const tot = 32 * cs + 2 * 44;
        const x0 = (w - tot) / 2;
        pos = { A: [x0, lab + 6], B: [x0 + 16 * cs + 44, lab + 6], D: [x0 + 24 * cs + 88, lab + 6] };
      } else {
        cs = clamp(Math.floor((w - 24) / 17), 8, 18);
        const x0 = (w - 16 * cs) / 2, gapBD = cs, xB = (w - 16 * cs - gapBD) / 2;
        pos = { A: [x0, lab + 6], B: [xB, lab + 6 + 16 * cs + 30], D: [xB + 8 * cs + gapBD, lab + 6 + 16 * cs + 30] };
      }
      const H = (narrow ? pos.B[1] + 16 * cs : lab + 6 + 16 * cs) + 8;
      svg = svgEl(host, w, H, 'The A, B and D matrices of one mma.sync instruction, with the elements held by the selected lane highlighted. Arrow keys move the selected element.', { focusable: true, role: 'group' });
      const sets = [['A', 16, 16, 'A · 16 × 16 · bf16', fragA], ['B', 16, 8, 'B · 16 × 8 · bf16', fragB], ['D', 16, 8, 'C, D · 16 × 8 · f32', fragD]];
      const mineSet = { A: fragA(st.lane), B: fragB(st.lane), D: fragD(st.lane) };
      const curE = st.hov || st.sel;
      const hovKey = curE ? curE.m + ':' + curE.r + ',' + curE.c : null;
      for (const [m, rows, cols, title] of sets) {
        const [x0, y0] = pos[m];
        Tx(svg, x0, y0 - 7, title, { size: 10, fill: 'var(--ink-2)' });
        const mine = {};
        mineSet[m].forEach((e) => { mine[e.r + ',' + e.c] = e; });
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
          const k = r + ',' + c, me = mine[k];
          const isHov = hovKey === m + ':' + k;
          const rel = REL[m].has(k);
          R(svg, x0 + c * cs + 0.5, y0 + r * cs + 0.5, cs - 1, cs - 1, { rx: 1.5, fill: isHov ? 'var(--accent)' : me ? 'var(--memory)' : rel ? 'rgba(255,183,140,0.16)' : 'rgba(111,166,255,0.1)', stroke: rel && !isHov ? 'var(--accent-2)' : me ? 'none' : 'rgba(111,166,255,0.22)', sw: rel ? 1.1 : 0.6 });
          if (me && cs >= 15) Tx(svg, x0 + c * cs + cs / 2, y0 + r * cs + cs / 2 + 3, (m === 'A' ? 'a' : m === 'B' ? 'b' : 'c') + me.i, { size: 8, anchor: 'middle', fill: '#0b1220', weight: 600 });
          cells.push({ m, r, c, x: x0 + c * cs, y: y0 + r * cs, s: cs });
        }
        // row/col guides every 4
        for (let r = 0; r <= rows; r += 8) L(svg, x0, y0 + r * cs, x0 + cols * cs, y0 + r * cs, { stroke: 'var(--line-2)', sw: 1 });
        for (let c = 0; c <= cols; c += 8) L(svg, x0 + c * cs, y0, x0 + c * cs, y0 + rows * cs, { stroke: 'var(--line-2)', sw: 1 });
      }
      if (!narrow) {
        Tx(svg, pos.B[0] - 22, pos.A[1] + 8 * cs + 5, '×', { size: 16, anchor: 'middle', fill: 'var(--ink-2)' });
        Tx(svg, pos.D[0] - 22, pos.A[1] + 8 * cs + 5, '→', { size: 14, anchor: 'middle', fill: 'var(--ink-2)' });
      }
      const cellAt = (e) => { const [px, py] = svgPoint(svg, e); return cells.find((q) => px >= q.x && px < q.x + q.s && py >= q.y && py < q.y + q.s); };
      svg.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch') return;
        const c = cellAt(e);
        const key = c ? c.m + ':' + c.r + ',' + c.c : null;
        const cur = st.hov ? st.hov.m + ':' + st.hov.r + ',' + st.hov.c : null;
        if (key !== cur) {
          st.hov = c ? { m: c.m, r: c.r, c: c.c } : null;
          if (c) st.lane = own[c.m][c.r + ',' + c.c].l;
          else if (st.sel) st.lane = own[st.sel.m][st.sel.r + ',' + st.sel.c].l;
          update();
        }
      });
      svg.addEventListener('click', (e) => {
        const c = cellAt(e);
        if (!c) return;
        st.sel = { m: c.m, r: c.r, c: c.c }; st.hov = null;
        st.lane = own[c.m][c.r + ',' + c.c].l;
        update();
      });
      svg.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch' && st.hov) { st.hov = null; if (st.sel) st.lane = own[st.sel.m][st.sel.r + ',' + st.sel.c].l; update(); } });
      svg.addEventListener('keydown', (e) => {
        const mv = { ArrowRight: [0, 1], ArrowLeft: [0, -1], ArrowDown: [1, 0], ArrowUp: [-1, 0] }[e.key];
        if (!mv) return;
        e.preventDefault();
        const DIM = { A: [16, 16], B: [16, 8], D: [16, 8] }, ORD = ['A', 'B', 'D'];
        const s0 = st.sel || { m: 'A', r: 0, c: -1 };
        let { m, r, c } = s0;
        r += mv[0]; c += mv[1];
        const mi = ORD.indexOf(m);
        if (c >= DIM[m][1] && mi < 2) { m = ORD[mi + 1]; c = 0; }
        else if (c < 0 && mi > 0) { m = ORD[mi - 1]; c = DIM[m][1] - 1; }
        r = clamp(r, 0, DIM[m][0] - 1); c = clamp(c, 0, DIM[m][1] - 1);
        st.sel = { m, r, c }; st.hov = null;
        st.lane = own[m][r + ',' + c].l;
        update();
        requestAnimationFrame(() => svg && svg.focus());
      });
    }
    function update() {
      const l = st.lane, g = l >> 2, q = l % 4;
      const E0 = st.hov || st.sel, REL = related(E0);
      const need = new Set([...lanesOf('A', REL.A), ...lanesOf('B', REL.B), ...lanesOf('D', REL.D)]);
      laneBtns.forEach((b, k) => { b.setAttribute('aria-pressed', String(k === l)); b.classList.toggle('need', need.has(k) && k !== l); });
      info.innerHTML = `<b>lane ${l}</b> <span class="d">groupID =</span> ${l} >> 2 = <b>${g}</b>  <span class="d">threadID_in_group =</span> ${l} % 4 = <b>${q}</b>\n` +
        `<span class="m">%r1–%r4</span> <span class="d">hold 8 of A:</span> rows ${g} and ${g + 8}, columns ${q * 2}, ${q * 2 + 1}, ${q * 2 + 8}, ${q * 2 + 9}\n` +
        `<span class="m">%r5–%r6</span> <span class="d">hold 4 of B:</span> rows ${q * 2}, ${q * 2 + 1}, ${q * 2 + 8}, ${q * 2 + 9} of column ${g}\n` +
        `<span class="m">%f1–%f4</span> <span class="d">hold 4 of C/D:</span> rows ${g} and ${g + 8}, columns ${q * 2}, ${q * 2 + 1}`;
      if (W) draw(W);
      const E = st.hov || st.sel;
      if (E) {
        const o = own[E.m][E.r + ',' + E.c];
        const name = E.m === 'D' ? 'C/D' : E.m;
        const held = `${name}[${E.r}][${E.c}] is held by <b>lane ${o.l}</b>, as its element ${(E.m === 'A' ? 'a' : E.m === 'B' ? 'b' : 'c') + o.i} in register <code>${o.reg}</code>. `;
        let more;
        if (E.m === 'D') more = `To compute it, the Tensor Core needs row ${E.r} of A, held by <b>lanes ${laneList(lanesOf('A', REL.A))}</b>, and column ${E.c} of B, held by <b>lanes ${laneList(lanesOf('B', REL.B))}</b> (outlined): 16 products whose operands sit in the registers of ${new Set([...lanesOf('A', REL.A), ...lanesOf('B', REL.B)]).size} different threads.`;
        else if (E.m === 'A') more = `It is multiplied by row ${E.c} of B (lanes ${laneList(lanesOf('B', REL.B))}) and feeds row ${E.r} of D (lanes ${laneList(lanesOf('D', REL.D))}), all outlined.`;
        else more = `It is multiplied by column ${E.r} of A (lanes ${laneList(lanesOf('A', REL.A))}) and feeds column ${E.c} of D (lanes ${laneList(lanesOf('D', REL.D))}), all outlined.`;
        f.setWhy(held + more + ' No single thread holds what one element needs, so the instruction must read every lane’s registers.');
      } else {
        f.setWhy(`Lane ${l} holds 8 elements of A, 4 of B and 4 of C/D (the same registers carry C in and D out): a scattered 16 of the 512 distinct matrix elements in play. Only the warp’s 32 threads together hold whole matrices, so the instruction must read and write <b>every lane’s registers at once</b>: registers are no longer private to one ${T('thread', 'thread')}.`);
      }
    }
    onWidth(host, (w) => draw(w));
    update();
  }

  /* Fig: data reuse through shared memory, as in the tiled matmul of the Kernel entry */
  function reuseFig(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Load once into shared memory, use many times',
      hint: 'change the tile width · step or play through k · hover a thread',
      wide: true,
      caption: 'One phase (one value of <code>m</code>) of the tiled matrix multiplication in the Kernel entry, for a block of T × T threads with <code>TILE_WIDTH</code> = T. Bottom right: the block’s output tile, one cell per thread, each accumulating <code>c_output</code>. Left: the shared tile <code>As</code> (T × T values of A); top: <code>Bs</code> (T × T values of B). Step 0: every thread copies one element of A and one of B from global memory, 2T² loads in all. Then, for each k, every thread reads <code>As[ty][k]</code> and <code>Bs[k][tx]</code> from shared memory and does one multiply-add (FMA): column k of <code>As</code> is reused by the T threads of each row, row k of <code>Bs</code> by the T threads of each column. Counts assume FP32 values of 4 bytes and ignore the hardware caches.',
    });
    const wrap = el('div', { class: 'dsc-w' });
    f.stage.append(wrap);
    const host = el('div');
    wrap.append(host);
    legend(wrap, [['dsc-sw-memory', 'value in shared memory (bright: read at this k)'], ['dsc-sw-core', 'a thread doing its FMA (shade: how much of c_output is summed)'], ['dsc-sw-accent', 'the thread you point at'], ['dsc-sw-rel', 'the row of As and column of Bs it reads']]);
    const st = { T: 16, s: 3, sel: [2, 5] };
    const tSeg = GG.ui.seg(f.controls, { label: 'Tile width T', value: 16, options: [1, 2, 4, 8, 16, 32].map((v) => ({ value: v, label: String(v) })), onChange: (v) => { st.T = v; st.s = Math.min(st.s, v); st.sel = [Math.min(st.sel[0], v - 1), Math.min(st.sel[1], v - 1)]; sStep.el.remove(); sStep = mkStep(); update(); } });
    tSeg.el.title = 'TILE_WIDTH: the block is T × T threads';
    const stepHost = el('div', { class: 'dsc-row' });
    f.controls.append(stepHost);
    const mkStep = () => GG.ui.slider(stepHost, { label: 'Step', min: 0, max: st.T, value: st.s, format: (v) => (v === 0 ? 'load tiles' : `k = ${v - 1}`), onInput: (v) => { st.s = v; stopPlay(); update(); } });
    let sStep = mkStep();
    const playBtn = GG.ui.button(f.controls, { label: 'Play', icon: 'play', onClick: () => togglePlay() });
    const sTh = GG.ui.stat(f.readouts, { label: 'threads / block' });
    const sSm = GG.ui.stat(f.readouts, { label: 'shared / block', tone: 'memory' });
    const sGl = GG.ui.stat(f.readouts, { label: 'global loads', tone: 'memory' });
    const sNo = GG.ui.stat(f.readouts, { label: 'without shared memory' });
    const sFma = GG.ui.stat(f.readouts, { label: 'FMAs so far', tone: 'core' });
    const sFl = GG.ui.stat(f.readouts, { label: 'FLOPs per global load', tone: 'core' });
    let W = 0, svg = null, G = null;
    function draw(w) {
      if (!w) return;
      W = w;
      clear(host);
      const T = st.T, s = st.s, kk = s - 1;
      const g = 30, padT = 18;
      const side = Math.min(w, 560);
      const cs = clamp(Math.floor((side - g - 8) / (2 * T)), 3, 26);
      const tw = T * cs;
      // the empty top-left quadrant holds the global memory box, so give it room even for tiny tiles
      const colW = Math.max(tw, 132), rowH = Math.max(tw, 74);
      const x0 = Math.max(0, (w - (colW + g + tw)) / 2), y0 = padT;
      const ax = x0 + colW - tw, ay = y0 + rowH + g, bx = x0 + colW + g, by = y0 + rowH - tw, cx = bx, cy = ay;
      const H = cy + tw + 26;
      G = { cs, cx, cy, T };
      svg = svgEl(host, w, H, `Tiled matrix multiplication with ${T} × ${T} threads: the shared tiles As and Bs and the output tile.`, { focusable: true, role: 'group' });
      const small = svg._small;
      const [sr, sc] = st.sel;
      // global memory, in the empty quadrant
      const gw = Math.min(colW - 8, 150), gx = x0 + (colW - gw) / 2, gy0 = y0 + Math.max(0, rowH / 2 - 30);
      R(svg, gx, gy0, gw, 40, { rx: 6, fill: 'rgba(111,166,255,0.1)', stroke: 'rgba(111,166,255,0.55)' });
      Tx(svg, gx + gw / 2, gy0 + 16, 'global memory', { size: 9.5, anchor: 'middle', fill: '#d3e3ff' });
      Tx(svg, gx + gw / 2, gy0 + 30, 'A and B (GPU RAM)', { size: 9, anchor: 'middle', fill: 'var(--ink-3)' });
      const loadCol = s === 0 ? 'var(--memory)' : 'rgba(111,166,255,0.35)';
      const arrow = (x1, y1, x2, y2) => {
        P(svg, `M${r2(x1)} ${r2(y1)}L${r2(x2)} ${r2(y2)}`, { stroke: loadCol, sw: s === 0 ? 1.8 : 1.1, dash: s === 0 ? null : '3 3' });
        const a = Math.atan2(y2 - y1, x2 - x1), hl = 6;
        P(svg, `M${r2(x2 - hl * Math.cos(a - 0.45))} ${r2(y2 - hl * Math.sin(a - 0.45))}L${r2(x2)} ${r2(y2)}L${r2(x2 - hl * Math.cos(a + 0.45))} ${r2(y2 - hl * Math.sin(a + 0.45))}`, { stroke: loadCol, sw: s === 0 ? 1.8 : 1.1 });
      };
      arrow(gx + gw / 2, gy0 + 42, ax + tw / 2, ay - 4);
      arrow(gx + gw + 2, gy0 + 20, bx - 4, by + tw / 2);
      if (s === 0 && !small) Tx(svg, gx + gw / 2, gy0 + 56, `${fmt.int(2 * T * T)} loads`, { size: 9.5, anchor: 'middle', fill: 'var(--memory)', weight: 600 });
      // tile labels
      Tx(svg, ax, ay - 7, small && T > 8 ? 'As' : 'As · shared', { size: 9.5, fill: 'var(--memory)', weight: 600 });
      Tx(svg, bx, by - 6, small && T > 8 ? 'Bs' : 'Bs · shared', { size: 9.5, fill: 'var(--memory)', weight: 600 });
      const bl = T > 1 ? (small ? `block: ${T} × ${T} threads` : `the block: ${T} × ${T} threads, one output each`) : 'the block: one thread';
      const blW = textW(bl, 9.5, small) / 2 + 4;
      Tx(svg, clamp(cx + tw / 2, blW, w - blW), cy + tw + 15, bl, { size: 9.5, anchor: 'middle', fill: 'var(--core)' });
      const pad = cs >= 8 ? 1 : 0.5;
      // As: rows = ty, columns = k. Bs: rows = k, columns = tx.
      for (let r = 0; r < T; r++) for (let k = 0; k < T; k++) {
        const hotA = s > 0 && k === kk, relA = r === sr;
        R(svg, ax + k * cs + pad / 2, ay + r * cs + pad / 2, cs - pad, cs - pad, { rx: cs > 6 ? 1.5 : 0.5, fill: hotA ? (relA ? '#fff' : 'rgba(111,166,255,0.95)') : s === 0 ? 'rgba(111,166,255,0.45)' : 'rgba(111,166,255,0.2)', stroke: relA ? 'var(--accent-2)' : 'none', sw: relA ? 1 : 0 });
        const hotB = s > 0 && r === kk, relB = k === sc;
        R(svg, bx + k * cs + pad / 2, by + r * cs + pad / 2, cs - pad, cs - pad, { rx: cs > 6 ? 1.5 : 0.5, fill: hotB ? (relB ? '#fff' : 'rgba(111,166,255,0.95)') : s === 0 ? 'rgba(111,166,255,0.45)' : 'rgba(111,166,255,0.2)', stroke: relB ? 'var(--accent-2)' : 'none', sw: relB ? 1 : 0 });
      }
      // the output tile: every thread does one FMA at each k
      const frac = s / T;
      for (let r = 0; r < T; r++) for (let c = 0; c < T; c++) {
        const me = r === sr && c === sc;
        R(svg, cx + c * cs + pad / 2, cy + r * cs + pad / 2, cs - pad, cs - pad, { rx: cs > 6 ? 1.5 : 0.5, fill: me ? 'var(--accent)' : s === 0 ? 'rgba(69,212,155,0.06)' : `rgba(69,212,155,${(0.14 + 0.6 * frac).toFixed(3)})`, stroke: s > 0 && !me ? 'var(--core)' : 'none', sw: s > 0 ? 0.6 : 0 });
      }
      // the selected thread's reads at this k
      if (s > 0) {
        const ya = ay + sr * cs + cs / 2, xa = ax + kk * cs + cs / 2, xb = bx + sc * cs + cs / 2, yb = by + kk * cs + cs / 2;
        const xm = cx + sc * cs + cs / 2, ym = cy + sr * cs + cs / 2;
        P(svg, `M${r2(xa)} ${r2(ya)}H${r2(xm)}`, { stroke: 'var(--accent-2)', sw: 1.2, dash: '3 2', opacity: 0.9 });
        P(svg, `M${r2(xb)} ${r2(yb)}V${r2(ym)}`, { stroke: 'var(--accent-2)', sw: 1.2, dash: '3 2', opacity: 0.9 });
      }
      svg.addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch') pick(e); });
      svg.addEventListener('click', pick);
      svg.addEventListener('keydown', (e) => {
        const mv = { ArrowRight: [0, 1], ArrowLeft: [0, -1], ArrowDown: [1, 0], ArrowUp: [-1, 0] }[e.key];
        if (!mv) return;
        e.preventDefault();
        st.sel = [clamp(st.sel[0] + mv[0], 0, st.T - 1), clamp(st.sel[1] + mv[1], 0, st.T - 1)];
        update();
        requestAnimationFrame(() => svg && svg.focus());
      });
    }
    function pick(e) {
      const [px, py] = svgPoint(svg, e);
      const c = Math.floor((px - G.cx) / G.cs), r = Math.floor((py - G.cy) / G.cs);
      if (r < 0 || c < 0 || r >= G.T || c >= G.T) return;
      if (r !== st.sel[0] || c !== st.sel[1]) { st.sel = [r, c]; update(); }
    }
    function update() {
      const T = st.T, s = st.s, k = Math.max(0, s), kk = s - 1;
      const loads = 2 * T * T, fmas = T * T * k;
      sTh.set(fmt.int(T * T) + (T * T > 1024 ? ' (too many)' : ''), T * T > 1024 ? 'danger' : null);
      sSm.set(fmt.bytes(8 * T * T));
      sGl.set(fmt.int(loads));
      sNo.set(fmt.int(2 * fmas) + ' loads');
      sFma.set(fmt.int(fmas));
      sFl.set(s === 0 ? '0' : GG.fmt.sig((2 * fmas) / loads, 3));
      if (W) draw(W);
      const [r, c] = st.sel;
      if (s === 0) f.setWhy(`<b>Load the tiles.</b> Each of the ${fmt.int(T * T)} threads copies one element of A into <code>As</code> and one of B into <code>Bs</code>: <b>${fmt.int(loads)} global loads</b>, the only trips to ${T_('gpu-ram', 'GPU RAM')} in this phase. Then a barrier (<code>__syncthreads()</code>), so that both tiles are complete before anyone reads them.`);
      else {
        const done = s === T;
        f.setWhy(`<b>k = ${kk}.</b> Every thread reads <code>As[ty][${kk}]</code> and <code>Bs[${kk}][tx]</code> from shared memory and does one FMA: column ${kk} of <code>As</code> serves the ${T} threads of each row, row ${kk} of <code>Bs</code> the ${T} threads of each column. Thread (${r}, ${c}) has now summed ${k} of its ${T} products. So far ${fmt.int(fmas)} FMAs (${fmt.int(2 * fmas)} FLOPs) from ${fmt.int(loads)} global loads; without shared memory every FMA would need its own 2 loads, ${fmt.int(2 * fmas)} in all.` +
          (done ? ` At the end of the phase that is <b>${T} FLOP${T > 1 ? 's' : ''} per global load</b> (${GG.fmt.sig(T / 4, 3)} FLOPs per byte), a ${T}× cut in global traffic${T === 16 ? ', exactly the tiled kernel’s “16 multiplies and 16 adds per pair of loads”' : ''}${T === 32 ? '; but 32 × 32 = 1,024 threads is already the most a block may have' : ''}.` : ' Step on to the end of the phase.'));
      }
    }
    const T_ = (id, txt) => T(id, txt);
    /* play through the k steps of one phase */
    let anim = null, acc = 0;
    function stopPlay() { if (anim && anim.running) { anim.stop(); playBtn.setLabel('Play', 'play'); } }
    function togglePlay() {
      if (anim && anim.running) { stopPlay(); return; }
      if (!anim) anim = GG.anim(wrap, (t, dt) => {
        acc += dt;
        const per = Math.max(0.14, 4.8 / (st.T + 1));
        if (acc < per) return;
        acc = 0;
        if (st.s >= st.T) { stopPlay(); return; }
        st.s++;
        sStep.set(st.s);
        update();
      }, { autostart: false });
      if (st.s >= st.T) { st.s = 0; sStep.set(0); update(); }
      acc = 0;
      anim.start();
      playBtn.setLabel('Pause', 'pause');
    }
    onWidth(host, (w) => draw(w));
    update();
  }

  const MMA_PTX = 'mma.sync.aligned.m16n8k16.row.col.f32.bf16.bf16.f32 {%f1,%f2,%f3,%f4}, {%r1,%r2,%r3,%r4}, {%r5,%r6}, {%f1,%f2,%f3,%f4};';
  const MMA_SASS = 'HMMA.16816.F32.BF16 R12, R4, R8, R12 ;';

  GG.entry('memory-hierarchy', {
    render(body, ctx) {
      body.classList.add('dsc-body');
      const s = ctx.html(body, `
<p>As part of the ${T('cuda-programming-model', 'CUDA programming model')}, each level of the ${T('thread-hierarchy', 'thread hierarchy')} has access to a distinct block of memory that is shared by all ${T('thread', 'threads')} in a group at that level: a <strong>memory hierarchy</strong>. A thread has its registers, a ${T('thread-block', 'block')} has its shared memory, and a ${T('thread-block-grid', 'grid')} has global memory. Each is visible exactly to its own group.</p>
<p>This memory can be used for coordination and communication, and it is <em>managed by the programmer</em>, not by the hardware or a runtime. On a CPU, a cache decides by itself what to keep close to the core; your program just reads addresses. In CUDA the kernel decides what goes into shared memory: it declares it, copies data into it, and chooses when to write results back to global memory.</p>
${GG.noteHTML('beyond', '<p><b>How far “managed by the programmer” goes.</b> It is exactly true of shared memory, and of what a program keeps in global memory and when it moves it. It is not true of every level: registers are allocated by the compiler (<code>ptxas</code>), not by hand (see ' + T('registers', 'Registers') + '), and global memory accesses still pass through the hardware-managed ' + T('l1-data-cache', 'L1') + ' and L2 caches, which decide for themselves what to keep.</p>')}
<div data-slot="map" class="wide"></div>
<p>Fig. 2 makes the contrast concrete: the same handful of reads, once through a cache that decides for itself what to keep, and once through shared memory that the kernel fills on purpose.</p>
<div data-slot="place" class="wide"></div>
<p>Put the other way round: the level of the hierarchy at which two threads meet decides how they can talk. Two threads of the same block can share a value in shared memory, and use a barrier to know when it is ready; in an ordinary launch, two threads of different blocks can only meet in global memory, where atomics are their tool. Pick a thread and a partner in Fig. 3 and see where they meet.</p>
<div data-slot="vis" class="wide"></div>

<h3>The grid’s memory: global memory, in GPU RAM</h3>
<p>For a ${T('thread-block-grid', 'thread block grid')}, that shared memory is in the ${T('gpu-ram', 'GPU’s RAM')} and is known as the ${T('global-memory', 'global memory')}. Access to it can be coordinated with atomic operations (a read, modify and write of one memory word done as one indivisible step, so that concurrent updates cannot overwrite each other) and with barriers, but execution order across thread blocks is indeterminate: no block can count on another having run first. Barriers only hold within a block.</p>

<h3>A thread’s memory: registers, in the register file</h3>
<p>For a single ${T('thread', 'thread')}, the memory is a chunk of the ${T('streaming-multiprocessor', 'Streaming Multiprocessor’s (SM’s)')} ${T('register-file', 'register file')}. According to the original semantics of the CUDA programming model, this memory is private to its thread. But certain instructions added to ${T('parallel-thread-execution', 'PTX')} and ${T('streaming-assembler', 'SASS')} to target matrix multiplication on ${T('tensor-core', 'Tensor Cores')} share inputs and outputs across threads: one instruction, executed by a whole ${T('warp', 'warp')}, takes its operands from the registers of all 32 threads. Fig. 4 shows exactly which thread holds which piece.</p>
<div data-slot="mma" class="wide"></div>
<div data-slot="mmacode"></div>
${GG.noteHTML('beyond', '<p><b>Reading the two instructions.</b> In the PTX, each thread names its own registers: four 32-bit registers <code>%r1</code>–<code>%r4</code> for its 8 bf16 values of A (two 16-bit values packed per register), two for its 4 values of B, and four floats <code>%f1</code>–<code>%f4</code> for C and D (here the same registers, so D overwrites C). <code>.sync.aligned</code> means all 32 threads of the warp must execute it together. <code>ptxas</code> lowers it to a single SASS <code>HMMA.16816.F32.BF16</code> instruction, whose operands are again per-thread registers: a group of four consecutive registers for D, four for A, two for B and four for C. The register numbers in the SASS line shown are illustrative; the compiler picks them. (Blackwell’s <code>tcgen05.mma</code> goes further and takes operands from shared memory and tensor memory rather than registers; see ' + T('tensor-memory', 'Tensor Memory') + '.)</p>')}

<h3>A block’s memory: shared memory, in the L1 data cache</h3>
<p>In between, the ${T('shared-memory', 'shared memory')} for the ${T('thread-block', 'thread block')} level of the thread hierarchy is stored in the ${T('l1-data-cache', 'L1 data cache')} of each ${T('streaming-multiprocessor', 'SM')}. Careful management of this cache is key to the art of designing ${T('perf', 'high-performance')} CUDA ${T('kernel', 'kernels')}: for example, loading data into it so as to support the <a data-term="arithmetic-intensity">maximum number of arithmetic operations before new data is loaded</a>. Fig. 5 steps through one phase of the tiled matrix multiplication from the ${T('kernel', 'Kernel')} entry: two tiles are loaded once, and every value in them is then used by a whole row or column of threads.</p>
<div data-slot="reuse" class="wide"></div>
${GG.tableHTML(`<thead><tr><th>Thread level</th><th>Its memory</th><th>Lives in (hardware)</th><th>Visible to</th><th>Coordinate with</th></tr></thead><tbody>
<tr><td>${T('thread', 'Thread')}</td><td>${T('registers', 'Registers')}</td><td>the SM’s ${T('register-file', 'register file')}</td><td>that thread (except Tensor Core instructions)</td><td>nothing needed</td></tr>
<tr><td>${T('thread-block', 'Thread block')}</td><td>${T('shared-memory', 'Shared memory')}</td><td>the SM’s ${T('l1-data-cache', 'L1 data cache')}</td><td>the block’s threads</td><td>barriers (<code>__syncthreads()</code>)</td></tr>
<tr><td>${T('thread-block-grid', 'Grid')}</td><td>${T('global-memory', 'Global memory')}</td><td>${T('gpu-ram', 'GPU RAM')}</td><td>every thread, and the host through copies</td><td>atomics; barriers only within a block</td></tr></tbody>`)}
<p>The glossary adds one more level in its ${T('graphics-processing-cluster', 'GPU Processing Cluster')} entry, and leaves it out elsewhere. On ${T('compute-capability', 'compute capability')} 9.0 GPUs like the H100, blocks can be grouped into a <em>cluster</em> scheduled onto one GPC, and a cluster has its own level of the memory hierarchy, <strong>distributed shared memory</strong>: the shared memories of its blocks, taken together. That is the exception to “different blocks only meet in global memory”: blocks of one cluster can meet in each other’s shared memory. See ${T('thread-hierarchy', 'Thread Hierarchy')} for how clusters fit into the thread hierarchy.</p>
${GG.noteHTML('beyond', '<p><b>Other memory spaces.</b> NVIDIA’s programming guide names a few more: <em>local memory</em>, private to a thread but physically in device memory (it is where spilled registers go; see ' + T('registers', 'Registers') + '), read-only <em>constant</em> and <em>texture</em> memory, and, on compute capability 9.0 and later, the <em>distributed shared memory</em> of a thread block cluster, in which a cluster’s threads can read, write and perform atomics on the shared memory of every block in the cluster. The three levels above are the ones that line up with the classic thread hierarchy, which is the glossary’s point.</p>')}
<div data-slot="read"></div>`);

      guard(s.map, 'Programming model map', () => {
        const WHY = {
          all: 'Lit: the three memories of the hierarchy and where each lives. <b>Registers</b> in the SM’s register file, <b>shared memory</b> in the SM’s L1 data cache, <b>global memory</b> in GPU RAM. The figure in this entry’s source lights up shared and global memory, the two levels a programmer manages most directly.',
          registers: 'Lit: <b>registers</b>, one thread’s private storage, in a slice of the SM’s <b>register file</b>: the fastest and smallest level.',
          shared: 'Lit: <b>shared memory</b>, one block’s workspace, in the SM’s <b>L1 data cache</b>: small, fast, shared by the threads of one block.',
          global: 'Lit: <b>global memory</b>, the grid’s workspace, in <b>GPU RAM</b>: large, slower, reachable by every thread.',
        };
        const KEYS = { all: ['registers', 'shared', 'global'], registers: 'registers', shared: 'shared', global: 'global' };
        const m = mapFig(s.map, ctx, {
          title: 'The memory hierarchy mapped onto the hardware',
          highlight: ['shared', 'global'],
          caption: 'Redrawn after the glossary’s figure, itself modified from NVIDIA’s CUDA Refresher and CUDA C++ Programming Guide. Shared memory and global memory are two levels of the memory hierarchy in the CUDA programming model (left), mapping onto the L1 data cache and GPU RAM, respectively (right). Registers, the third level, live in the register file.',
          why: 'Lit, as in the glossary’s figure: <b>shared memory</b>, which lives in the SM’s <b>L1 data cache</b>, and <b>global memory</b>, which lives in <b>GPU RAM</b>. Pick a level to light its pair alone.',
        });
        GG.ui.seg(m.f.controls, { label: 'Light up', value: 'sg', options: [{ value: 'sg', label: 'shared + global' }, { value: 'all', label: 'all three' }, { value: 'registers', label: 'registers' }, { value: 'shared', label: 'shared' }, { value: 'global', label: 'global' }],
          onChange: (v) => m.set(v === 'sg' ? ['shared', 'global'] : KEYS[v], v === 'sg' ? 'Lit, as in the glossary’s figure: <b>shared memory</b>, which lives in the SM’s <b>L1 data cache</b>, and <b>global memory</b>, which lives in <b>GPU RAM</b>. Pick a level to light its pair alone.' : WHY[v]) });
        return m;
      });
      guard(s.place, 'Placement figure', () => placeFig(s.place, ctx));
      guard(s.vis, 'Visibility explorer', () => visibilityFig(s.vis, ctx));
      guard(s.mma, 'MMA fragments', () => mmaFig(s.mma, ctx));
      guard(s.mmacode, 'MMA code', () => {
        const g = el('div', { class: 'dsc-codegrid' });
        s.mmacode.append(g);
        ctx.code(g, { lang: 'ptx', code: MMA_PTX, caption: 'PTX: each thread lists its own registers', lineNumbers: false });
        ctx.code(g, { lang: 'sass', code: MMA_SASS, caption: 'SASS: one HMMA (register numbers illustrative)', lineNumbers: false });
      });
      guard(s.reuse, 'Reuse figure', () => reuseFig(s.reuse, ctx));
      ctx.reading(s.read, [REFRESHER, CPG, CPG_CLUSTERS,
        { href: 'https://docs.nvidia.com/cuda/parallel-thread-execution/', label: 'NVIDIA PTX ISA', note: 'beyond the glossary: the “Matrix Fragments for mma.m16n8k16” layouts behind Fig. 4' },
      ]);
    },
  });


  /* ═════════════════════════════ Registers ═════════════════════════════ */

  GG.css(`
.dsc-spill-note { font: 500 11px/1.45 var(--font-mono); color: var(--ink-3); margin-top: 6px; }
.dsc-rp-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; }
@media (min-width: 900px) { .dsc-rp-grid { grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr); } }
.dsc-rp-grid .code { margin: 0; }
.dsc-rp-grid .code pre { font-size: 12px; }
.dsc-regs { display: flex; flex-wrap: wrap; gap: 6px 10px; align-items: center; margin-top: 10px; min-height: 26px; }
.dsc-regs .dsc-k { margin-right: 4px; }
.dsc-occ-legend { margin-top: 6px; }
`);

  /* Fig: a thread with more live values than registers spills to local memory in GPU RAM */
  function spillFig(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Spilling: when the values do not fit',
      hint: 'set the two sliders · play',
      wide: true,
      caption: 'One thread walks through its live values in a loop, using each one on a CUDA Core in turn. Values that have a register make a short trip. Values that do not are spilled: they live in local memory, a per-thread area of GPU RAM, and must be loaded into a register (SASS <code>LDL</code>, PTX <code>ld.local</code>) before each use and stored back (<code>STL</code>, <code>st.local</code>) after. The counts assume every value is updated on every pass, so each spilled value needs both trips; a value that is only read needs just the <code>LDL</code>, so the counts are an upper bound. Trip times in the animation show the order of magnitude, not exact cycle counts.',
    });
    const wrap = el('div', { class: 'dsc-w' });
    f.stage.append(wrap);
    const host = el('div');
    wrap.append(host);
    legend(wrap, [['dsc-sw-memory', 'value held in a register'], ['dsc-sw-danger', 'spilled value, in GPU RAM'], ['dsc-sw-core', 'value being used by a core'], ['dsc-sw-idle', 'register left free']]);
    const st = { need: 20, budget: 16, cur: 0, phase: 0 };
    GG.ui.slider(f.controls, { label: 'Live values the code needs', min: 4, max: 40, value: st.need, onInput: (v) => { st.need = v; st.cur = 0; st.phase = 0; update(); } });
    GG.ui.slider(f.controls, { label: 'Registers allowed', min: 4, max: 40, value: st.budget, onInput: (v) => { st.budget = v; st.cur = 0; st.phase = 0; update(); } });
    const sIn = GG.ui.stat(f.readouts, { label: 'in registers', tone: 'memory' });
    const sSp = GG.ui.stat(f.readouts, { label: 'spilled' });
    const sTrips = GG.ui.stat(f.readouts, { label: 'trips to RAM / loop (up to)' });
    const sBytes = GG.ui.stat(f.readouts, { label: 'extra bytes / warp / loop (up to)' });
    let W = 0, G = null, chip = null, chipT = null, cellEls = [], arrows = null;

    function layout(w) {
      const per = w >= 700 ? 20 : w >= 480 ? 10 : 8;
      const cw = Math.min(40, (w - 28) / per), ch = 24;
      const rfRows = Math.max(1, Math.ceil(st.budget / per));
      const ramRows = Math.max(1, Math.ceil((st.need - st.budget) / per));
      const rfY = 24, rfH = 32 + rfRows * (ch + 5);
      const coreY = rfY + rfH + 34, coreH = 26;
      const ramY = coreY + coreH + 58;
      const ramH = 32 + ramRows * (ch + 5);
      return { per, cw, ch, rfY, rfH, coreY, coreH, ramY, ramH, H: ramY + ramH + 4, x0: 14 + ((w - 28) - per * cw) / 2 };
    }
    function cellPos(kind, k) {
      const r = Math.floor(k / G.per), c = k % G.per;
      const y0 = kind === 'rf' ? G.rfY : G.ramY;
      return [G.x0 + c * G.cw, y0 + 26 + r * (G.ch + 5)];
    }
    function homeOf(v) { return v < st.budget ? ['rf', v] : ['ram', v - st.budget]; }
    function draw(w) {
      W = w;
      G = layout(w);
      clear(host);
      cellEls = [];
      const svg = svgEl(host, w, G.H, `A thread’s ${st.need} live values: ${Math.min(st.need, st.budget)} in registers, ${Math.max(0, st.need - st.budget)} spilled to GPU RAM.`);
      // register file
      R(svg, 0, G.rfY, w, G.rfH, { rx: 8, fill: 'rgba(111,166,255,0.07)', stroke: 'rgba(111,166,255,0.55)' });
      Tx(svg, 12, G.rfY + 16, w >= 560 ? 'REGISTER FILE (on the SM) · this thread’s registers' : 'REGISTER FILE · on the SM', { size: 9.5, fill: '#d3e3ff', ls: '0.08em' });
      // core
      R(svg, 0, G.coreY, w, G.coreH, { rx: 6, fill: 'rgba(69,212,155,0.12)', stroke: 'var(--core)' });
      Tx(svg, 12, G.coreY + G.coreH / 2 + 3.5, 'CUDA Core: uses one value at a time', { size: 9.5, fill: 'var(--core)' });
      // RAM
      R(svg, 0, G.ramY, w, G.ramH, { rx: 8, fill: 'rgba(255,91,110,0.04)', stroke: 'rgba(255,91,110,0.45)', dash: '5 4' });
      Tx(svg, 12, G.ramY + 16, w >= 560 ? 'GPU RAM (off the SM) · local memory for spills' : 'GPU RAM · off the SM', { size: 9.5, fill: '#ffb3bd', ls: '0.08em' });
      const lim = 40;
      for (let k = 0; k < lim; k++) {
        const [x, y] = cellPos('rf', k);
        const has = k < st.budget;
        const used = has && k < st.need;
        if (!has) { cellEls.push(null); continue; }
        const r = R(svg, x + 2, y, G.cw - 4, G.ch, { rx: 4, fill: used ? 'var(--memory-a)' : 'none', stroke: used ? 'var(--memory)' : 'var(--line-2)', sw: 1 });
        const t = Tx(svg, x + G.cw / 2, y + G.ch / 2 + 3.5, used ? 'v' + k : 'R' + k, { size: G.cw < 26 ? 8.5 : 9.5, anchor: 'middle', fill: used ? 'var(--ink)' : 'var(--ink-3)' });
        cellEls.push({ r, t, kind: 'rf' });
      }
      const nSp = Math.max(0, st.need - st.budget);
      const spEls = [];
      for (let k = 0; k < nSp; k++) {
        const [x, y] = cellPos('ram', k);
        const r = R(svg, x + 2, y, G.cw - 4, G.ch, { rx: 4, fill: 'var(--danger-a)', stroke: 'var(--danger)', sw: 1 });
        const t = Tx(svg, x + G.cw / 2, y + G.ch / 2 + 3.5, 'v' + (st.budget + k), { size: G.cw < 26 ? 8.5 : 9.5, anchor: 'middle', fill: '#ffd0d6' });
        spEls.push({ r, t, kind: 'ram' });
      }
      cellEls.spilled = spEls;
      if (!nSp) Tx(svg, w / 2, G.ramY + 26 + G.ch / 2 + 3.5, 'empty: nothing spilled', { size: 10, anchor: 'middle', fill: 'var(--ink-3)' });
      // LDL / STL arrows between RAM and the core, drawn at x = 0 and moved beside the spilled value in use
      arrows = S('g', { opacity: 0 }, svg);
      const ay0 = G.coreY + G.coreH, ay1 = G.ramY, my = (ay0 + ay1) / 2 + 4;
      P(arrows, `M-5 ${ay1 - 4}V${ay0 + 6}`, { stroke: 'var(--danger)', sw: 1.4 });
      P(arrows, `M-9 ${ay0 + 11}L-5 ${ay0 + 4}L-1 ${ay0 + 11}`, { stroke: 'var(--danger)', sw: 1.4 });
      arrows._ldl = Tx(arrows, -11, my, 'LDL', { size: 10, anchor: 'end', fill: 'var(--danger)', weight: 600 });
      const bx = G.cw + 1;
      P(arrows, `M${r2(bx)} ${ay0 + 4}V${ay1 - 6}`, { stroke: 'var(--danger)', sw: 1.4, dash: '4 3' });
      P(arrows, `M${r2(bx - 4)} ${ay1 - 11}L${r2(bx)} ${ay1 - 4}L${r2(bx + 4)} ${ay1 - 11}`, { stroke: 'var(--danger)', sw: 1.4 });
      arrows._stl = Tx(arrows, bx + 6, my, 'STL', { size: 10, fill: 'var(--danger)', weight: 600 });
      arrows._bx = bx;
      // the moving value
      chip = R(svg, -100, -100, G.cw - 4, G.ch, { rx: 4, fill: 'var(--core)', stroke: '#fff', sw: 1 });
      chipT = Tx(svg, -100, -100, '', { size: 9.5, anchor: 'middle', fill: '#07140e', weight: 700 });
      paintChip();
    }
    const TRIP_REG = 0.32, TRIP_RAM = 1.9;
    function tripLen(v) { return v < st.budget ? TRIP_REG : TRIP_RAM; }
    function paintChip() {
      if (!G || !chip) return;
      const v = Math.min(st.cur, st.need - 1);
      const [kind, k] = homeOf(v);
      const [hx, hy] = cellPos(kind, k);
      const cx = hx + 2, coreTop = G.coreY + 1;
      const p = st.phase;
      // 0..0.42 go, 0.42..0.58 at the core, 0.58..1 back
      let y;
      if (p < 0.42) y = hy + (coreTop - hy) * ease(p / 0.42);
      else if (p < 0.58) y = coreTop;
      else y = coreTop + (hy - coreTop) * ease((p - 0.58) / 0.42);
      chip.setAttribute('x', r2(cx)); chip.setAttribute('y', r2(y));
      chipT.setAttribute('x', r2(cx + (G.cw - 4) / 2)); chipT.setAttribute('y', r2(y + G.ch / 2 + 3.5));
      chipT.textContent = 'v' + v;
      const hiCore = p >= 0.42 && p < 0.58;
      chip.setAttribute('fill', hiCore ? 'var(--core)' : kind === 'ram' ? 'var(--danger)' : 'var(--memory)');
      if (arrows) {
        const spilled = kind === 'ram';
        arrows.setAttribute('transform', `translate(${r2(cx)},0)`);
        // keep both labels inside the drawing near its edges
        const leftRoom = cx > 40, rightRoom = cx + arrows._bx + 36 < W;
        arrows._ldl.setAttribute('x', leftRoom ? -11 : r2(arrows._bx + 36));
        arrows._ldl.setAttribute('text-anchor', leftRoom ? 'end' : 'start');
        arrows._stl.setAttribute('x', rightRoom ? r2(arrows._bx + 6) : -11);
        arrows._stl.setAttribute('text-anchor', rightRoom ? 'start' : 'end');
        arrows.setAttribute('opacity', spilled ? (p < 0.42 || p >= 0.58 ? 1 : 0.5) : 0);
      }
    }
    const ease = (u) => u * u * (3 - 2 * u);
    function update() {
      const inR = Math.min(st.need, st.budget), sp = Math.max(0, st.need - st.budget);
      sIn.set(`${inR} of ${st.need}`);
      sSp.set(sp, sp ? 'danger' : null);
      sTrips.set(2 * sp, sp ? 'danger' : null);
      sBytes.set(fmt.int(sp * 8 * 32) + ' B', sp ? 'danger' : null);
      // paused (or reduced motion): show a meaningful frame, the first spilled value on its way up
      if (!anim || !anim.running) { st.cur = sp ? st.budget : 0; st.phase = sp ? 0.25 : 0.5; }
      if (W) draw(W);
      if (!sp) f.setWhy(`All ${st.need} live values fit in the ${st.budget} registers this thread may use${st.budget > st.need ? `, with ${st.budget - st.need} to spare` : ''}. Every use is a short trip from the ${T('register-file', 'register file')} to a core and back, and the loop never touches ${T('gpu-ram', 'GPU RAM')}.`);
      else f.setWhy(`Only ${st.budget} of the ${st.need} live values have a register. The other <b>${sp} spill</b> to ${T('global-memory', 'global memory')} in ${T('gpu-ram', 'GPU RAM')}: if the loop updates each of them on every pass, it loads each one (<code>LDL</code>) and stores it back (<code>STL</code>), ${2 * sp} slow trips per thread, or ${fmt.int(sp * 8 * 32)} extra bytes for a ${T('warp', 'warp')} of 32 threads at 4 bytes a value. That is the “substantial performance penalty”.`);
    }
    const anim = GG.anim(wrap, (t, dt) => {
      if (!G) return;
      st.phase += dt / tripLen(Math.min(st.cur, st.need - 1));
      if (st.phase >= 1) { st.phase = 0; st.cur = (st.cur + 1) % st.need; }
      paintChip();
    });
    const play = GG.ui.playButton(f.controls, anim);
    play.title = 'Run the loop over the live values';
    onWidth(host, (w) => draw(w));
    update();
  }

  const ADD_CU = `__global__ void add(const float* a,
                    const float* b, float* c) {
  int i = blockIdx.x * blockDim.x + threadIdx.x;
  c[i] = a[i] + b[i];
}`;
  const ADD_PTX = `.visible .entry _Z3addPKfS0_Pf(
    .param .u64 _Z3addPKfS0_Pf_param_0,
    .param .u64 _Z3addPKfS0_Pf_param_1,
    .param .u64 _Z3addPKfS0_Pf_param_2
)
{
    .reg .f32   %f<4>;
    .reg .b32   %r<5>;
    .reg .b64   %rd<11>;

    ld.param.u64    %rd1, [_Z3addPKfS0_Pf_param_0];
    ld.param.u64    %rd2, [_Z3addPKfS0_Pf_param_1];
    ld.param.u64    %rd3, [_Z3addPKfS0_Pf_param_2];
    cvta.to.global.u64  %rd4, %rd3;
    cvta.to.global.u64  %rd5, %rd2;
    cvta.to.global.u64  %rd6, %rd1;
    mov.u32     %r1, %ctaid.x;
    mov.u32     %r2, %ntid.x;
    mov.u32     %r3, %tid.x;
    mad.lo.s32  %r4, %r1, %r2, %r3;
    mul.wide.s32    %rd7, %r4, 4;
    add.s64     %rd8, %rd6, %rd7;
    ld.global.f32   %f1, [%rd8];
    add.s64     %rd9, %rd5, %rd7;
    ld.global.f32   %f2, [%rd9];
    add.f32     %f3, %f1, %f2;
    add.s64     %rd10, %rd4, %rd7;
    st.global.f32   [%rd10], %f3;
    ret;
}`;
  /* PTX and SASS: real output of NVCC 13.2.0, -arch=sm_90 -O3, on Godbolt (Compiler Explorer); the trailing
     branch-to-self and NOP padding are left out of the SASS, as in the Streaming Assembler entry. */
  const ADD_SASS = `LDC R1, c[0x0][0x28] ;
S2R R0, SR_TID.X ;
S2UR UR4, SR_CTAID.X ;
LDC R9, c[0x0][RZ] ;
LDC.64 R2, c[0x0][0x210] ;
LDC.64 R4, c[0x0][0x218] ;
IMAD R9, R9, UR4, R0 ;
ULDC.64 UR4, c[0x0][0x208] ;
LDC.64 R6, c[0x0][0x220] ;
IMAD.WIDE R2, R9, 0x4, R2 ;
LDG.E R2, desc[UR4][R2.64] ;
IMAD.WIDE R4, R9, 0x4, R4 ;
LDG.E R5, desc[UR4][R4.64] ;
IMAD.WIDE R6, R9, 0x4, R6 ;
FADD R9, R2, R5 ;
STG.E desc[UR4][R6.64], R9 ;
EXIT ;`;

  /* Fig: the same kernel in CUDA C++ (no registers), PTX (virtual registers) and SASS (physical registers) */
  function ptxRegsFig(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Where the registers appear',
      hint: 'step through the kernel · hover a SASS line',
      wide: true,
      caption: 'A vector-add kernel in CUDA C++, which never names a register, and the PTX and SASS that NVCC 13.2 produces for it with <code>-arch=sm_90 -O3</code> (an H100), compiled on Godbolt, the toolchain the ' + T('streaming-assembler', 'Streaming Assembler') + ' and ' + T('cuda-programming-model', 'CUDA Programming Model') + ' entries also use. The trailing branch-to-self and <code>NOP</code> padding of the SASS are left out; other compiler versions choose other register numbers and orders. Each step lights one line of C++ and the PTX and SASS lines that implement it. The strip under the C++ holds every register the PTX declares, 4 + 5 + 11 = 20: bright for the registers the current step writes, pale for those written earlier. <code>%f0</code>, <code>%r0</code> and <code>%rd0</code> are declared but never used, because <code>nvcc</code> numbers from 1. The strip under the PTX shows where <code>ptxas</code> put each virtual register in this SASS listing: in a per-thread register (<code>R</code>), in a uniform register shared by the whole warp (<code>UR</code>), or nowhere, because the instruction that wrote it was folded into another.',
    });
    const grid = el('div', { class: 'dsc-rp-grid' });
    f.stage.append(grid);
    const left = el('div'), right = el('div');
    grid.append(left, right);
    const cu = ctx.code(left, { lang: 'cuda', code: ADD_CU, caption: 'CUDA C++: no registers in sight' });
    const regsBox = el('div', { class: 'dsc-regs' });
    left.append(regsBox);
    const ptx = ctx.code(right, { lang: 'ptx', code: ADD_PTX, caption: 'PTX: every value lives in a named, virtual register', wide: false });
    ptx.el.classList.add('dsc-scode');
    const grid2 = el('div', { class: 'dsc-rp-grid', style: 'margin-top:12px' });
    f.stage.append(grid2);
    const left2 = el('div'), right2 = el('div');
    grid2.append(left2, right2);
    const sass = ctx.code(left2, {
      lang: 'sass', code: ADD_SASS, caption: 'SASS for sm_90: physical registers R0, R1 …',
      notes: {
        1: '<code>LDC</code> loads <code>R1</code>, the stack pointer, from the constant bank, as at the start of most kernels.',
        2: '<code>S2R</code> copies the special register <code>SR_TID.X</code> (<code>threadIdx.x</code>) into the thread’s own register <code>R0</code>.',
        3: '<code>S2UR</code> copies <code>SR_CTAID.X</code> (<code>blockIdx.x</code>, the index of the CTA) into a <em>uniform</em> register, <code>UR4</code>: one copy for the whole warp, because every thread of a block has the same <code>blockIdx</code>.',
        4: '<code>blockDim.x</code>, from the kernel’s constant bank at offset 0 (written <code>c[0x0][RZ]</code>; <code>RZ</code> always reads zero), into <code>R9</code>.',
        5: 'The pointer <code>a</code>, a kernel argument in the constant bank, into the 64-bit register pair <code>R2</code>:<code>R3</code>.',
        6: 'The pointer <code>b</code>, into the pair <code>R4</code>:<code>R5</code>.',
        7: '<code>i = blockIdx.x * blockDim.x + threadIdx.x</code> in one integer multiply-add: <code>R9 = R9 × UR4 + R0</code>. From here on <code>R9</code> holds <code>i</code>.',
        8: 'The uniform pair <code>UR4</code>:<code>UR5</code> now holds the descriptor used for global memory accesses. <code>UR4</code>’s old value, <code>blockIdx.x</code>, is no longer needed.',
        9: 'The pointer <code>c</code>, into the pair <code>R6</code>:<code>R7</code>.',
        10: 'The address of <code>a[i]</code>: <code>i × 4</code> plus the pointer <code>a</code>, overwriting the pointer in <code>R2</code>:<code>R3</code>.',
        11: '<code>LDG</code>: load <code>a[i]</code> from global memory into <code>R2</code>.',
        12: 'The address of <code>b[i]</code>, in <code>R4</code>:<code>R5</code>.',
        13: 'Load <code>b[i]</code> into <code>R5</code>.',
        14: 'The address of <code>c[i]</code>, in <code>R6</code>:<code>R7</code>.',
        15: 'The arithmetic: <code>R9 = R2 + R5</code>, on the FP32 pipe. <code>i</code> is no longer needed, so its register <code>R9</code> takes the sum.',
        16: '<code>STG</code>: store <code>R9</code> to <code>c[i]</code> in global memory.',
      },
      noteDefault: 'Hover or tap a marked line to read its registers. <code>R</code> = per-thread register, <code>UR</code> = uniform register, <code>SR_</code> = special register, <code>c[bank][offset]</code> = constant memory, <code>RZ</code> = the zero register.',
    });
    sass.el.classList.add('dsc-scode');
    const mapBox = el('div', { class: 'dsc-panel' });
    right2.append(mapBox);
    const C = (v) => ({ v, p: v === 'folded' ? 'folded' : 'reg' });
    const M = (pairs) => pairs.map(([a, b]) => Object.assign({ a }, C(b)));
    const STEPS = [
      { label: 'declare', cu: [1, 2], ptx: [7, 8, 9], sass: [1], regs: [], map: [],
        why: 'PTX first <b>declares</b> its registers by type: <code>.reg .f32 %f&lt;4&gt;</code> makes four 32-bit floats <code>%f0</code>–<code>%f3</code>, then come five 32-bit integer registers and eleven 64-bit registers. These are <em>virtual</em> registers, as many as the compiler likes. SASS declares nothing: <code>ptxas</code> has already chosen the physical registers, and the listing simply starts by setting up <code>R1</code> as the stack pointer.' },
      { label: 'arguments', cu: [1, 2], ptx: [11, 12, 13, 14, 15, 16], sass: [5, 6, 9], regs: ['%rd1', '%rd2', '%rd3', '%rd4', '%rd5', '%rd6'],
        map: M([['%rd1', 'R2:R3'], ['%rd2', 'R4:R5'], ['%rd3', 'R6:R7'], ['%rd4', 'R6:R7'], ['%rd5', 'R4:R5'], ['%rd6', 'R2:R3']]),
        why: 'The three pointer arguments <code>a</code>, <code>b</code> and <code>c</code> are loaded from the parameter space into 64-bit registers, then converted to addresses in the global state space (<code>cvta.to.global</code>). In this SASS each pointer takes one <code>LDC.64</code> from the kernel’s constant bank (<code>c[0x0][0x210]</code>, <code>0x218</code>, <code>0x220</code>) into a register pair, and the conversion takes no instruction at all, so <code>%rd1</code> and <code>%rd6</code> end up in the same pair, <code>R2</code>:<code>R3</code>.' },
      { label: 'index', cu: [3], ptx: [17, 18, 19, 20], sass: [2, 3, 4, 7], regs: ['%r1', '%r2', '%r3', '%r4'],
        map: M([['%r1', 'UR4'], ['%r2', 'R9'], ['%r3', 'R0'], ['%r4', 'R9']]),
        why: '<code>int i = blockIdx.x * blockDim.x + threadIdx.x</code> becomes three copies from special registers (<code>%ctaid.x</code>, <code>%ntid.x</code>, <code>%tid.x</code>) and one multiply-add. In SASS <code>blockIdx.x</code> goes to a uniform register, <code>UR4</code>, since it is the same for every thread of the warp, and <code>blockDim.x</code> comes from the constant bank. In C++, <code>i</code> is a variable; in PTX it is virtual register <code>%r4</code>; in SASS it is physical register <code>R9</code>, the same one that held <code>blockDim.x</code>, because <code>ptxas</code> reuses a register as soon as its old value is dead.' },
      { label: 'load', cu: [4], ptx: [21, 22, 23, 24, 25], sass: [8, 10, 11, 12, 13], regs: ['%rd7', '%rd8', '%f1', '%rd9', '%f2'],
        map: M([['%rd7', 'folded'], ['%rd8', 'R2:R3'], ['%f1', 'R2'], ['%rd9', 'R4:R5'], ['%f2', 'R5']]),
        why: '<code>a[i]</code> and <code>b[i]</code>: the index is scaled by 4 bytes per float into <code>%rd7</code>, added to each base address, and the two values are loaded from global memory into <code>%f1</code> and <code>%f2</code>. In SASS the scaling and the add are one <code>IMAD.WIDE</code> each, so <code>%rd7</code> never exists, and the loaded values land in <code>R2</code> and <code>R5</code>, overwriting halves of the address pairs that pointed at them.' },
      { label: 'add', cu: [4], ptx: [26], sass: [15], regs: ['%f3'], map: M([['%f3', 'R9']]),
        why: 'The addition itself is one instruction, register to register: <code>%f3 = %f1 + %f2</code>, which is <code>FADD R9, R2, R5</code> in SASS, written into <code>R9</code> because <code>i</code> is no longer needed. This is the only line that does the kernel’s actual arithmetic.' },
      { label: 'store', cu: [4], ptx: [27, 28, 29], sass: [14, 16, 17], regs: ['%rd10'], map: M([['%rd10', 'R6:R7']]),
        why: 'The result is stored to <code>c[i]</code>: one more address in <code>%rd10</code> (in SASS, the pair <code>R6</code>:<code>R7</code>, which held the pointer <code>c</code>), then <code>st.global</code> / <code>STG</code> writes it to global memory, and the thread returns (<code>EXIT</code>).' },
    ];
    const chip = (m, cls) => `<span class="dsc-chip ${cls}"${m.p === 'folded' ? ' style="opacity:0.75;border-style:dashed"' : ''}>${m.a} → ${m.p === 'folded' ? 'no register' : m.v}</span>`;
    function scrollTo(code, n) {
      const ln = code.line(n);
      if (!ln || !ln.parentElement) return;
      const pre = ln.parentElement;
      const top = ln.getBoundingClientRect().top - pre.getBoundingClientRect().top + pre.scrollTop;
      if (top < pre.scrollTop + 10 || top > pre.scrollTop + pre.clientHeight - 60) pre.scrollTop = Math.max(0, top - 40);
    }
    function show(k) {
      const s = STEPS[k];
      cu.clear(); ptx.clear(); sass.clear();
      cu.highlight(s.cu, 'memory');
      ptx.highlight(s.ptx, 'memory');
      sass.highlight(s.sass, 'memory');
      scrollTo(ptx, s.ptx[0]);
      scrollTo(sass, s.sass[0]);
      const before = new Set(STEPS.slice(0, k).flatMap((x) => x.regs));
      const now = new Set(s.regs);
      const groups = [['%f', 4], ['%r', 5], ['%rd', 11]];
      regsBox.innerHTML = `<span class="dsc-k">${k === 0 ? 'registers declared' : 'registers written'}</span>` + groups.map(([p, n]) => '<span class="dsc-chips">' + range(n).map((i) => {
        const r = p + i;
        const cls = now.has(r) ? 'on' : before.has(r) ? 'was' : i === 0 ? 'dim' : '';
        return `<span class="dsc-chip ${cls}" title="${r}${i === 0 ? ': declared, never used' : ''}">${r}</span>`;
      }).join('') + '</span>').join('');
      const earlier = STEPS.slice(0, k).flatMap((x) => x.map);
      mapBox.innerHTML = `<div class="dsc-panel-h"><b>ptxas: virtual → physical</b><span>in this listing</span></div>` +
        `<div class="dsc-chips">${earlier.map((m) => chip(m, 'was')).join('')}${s.map.map((m) => chip(m, 'on')).join('')}${!earlier.length && !s.map.length ? '<span class="dsc-k">no registers written yet</span>' : ''}</div>` +
        `<p class="dsc-spill-note">20 virtual registers declared; the SASS uses 9 per-thread physical ones (<code>R0</code>–<code>R7</code>, <code>R9</code>) plus the uniform pair <code>UR4</code>:<code>UR5</code>. Several virtual registers share a physical one over time (<code>%r2</code>, <code>%r4</code> and <code>%f3</code> all become <code>R9</code>); one disappears into a combined instruction.</p>`;
      f.setWhy(s.why);
    }
    GG.ui.stepper(f.controls, { label: 'Step', steps: STEPS, onStep: show, autoplay: 2800 });
    const sR = GG.ui.stat(f.readouts, { label: 'PTX registers declared', value: '4 + 5 + 11 = 20', tone: 'memory' });
    sR.el.title = '%f<4>, %r<5>, %rd<11>';
    GG.ui.stat(f.readouts, { label: 'SASS registers used', value: '9 R + UR4:UR5', tone: 'memory' });
  }

  /* Fig: registers per thread vs blocks per SM (occupancy) */
  function regBudgetFig(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'The register budget decides how many blocks fit',
      hint: 'drag registers per thread · pick a block size',
      wide: true,
      caption: 'An H100 SM’s register file: 65,536 32-bit registers, split evenly over its four sub-partitions (16,384 each, one column each here). Registers are handed out per warp, rounded up to 256 at a time (8 per thread), and a warp’s registers sit in one sub-partition. Each coloured slab is one resident warp, shaded by block. When the chosen count is below what the code needs, a dashed strip beside each column shows the same sub-partition at the needed count, so the blocks lost or gained can be counted. The limits modelled are registers, 64 warps and 32 blocks per SM; a real kernel can also be limited by its shared memory.',
    });
    const wrap = el('div', { class: 'dsc-w' });
    f.stage.append(wrap);
    const host = el('div');
    wrap.append(host);
    legend(wrap, [['dsc-sw-memory', 'registers of a resident warp (shade = block)'], ['dsc-sw-idle', 'registers left unused'], ['dsc-sw-rel', 'dashed strip: the same sub-partition at the register count the code needs (shown when it spills)']]).classList.add('dsc-occ-legend');
    const st = { regs: 64, tpb: 256, need: 64 };
    GG.ui.slider(f.controls, { label: 'Registers per thread', min: 16, max: 255, value: st.regs, onInput: (v) => { st.regs = v; update(); } });
    GG.ui.seg(f.controls, { label: 'Threads per block', value: st.tpb, options: [128, 256, 512, 1024].map((v) => ({ value: v, label: fmt.int(v) })), onChange: (v) => { st.tpb = v; update(); } });
    GG.ui.seg(f.controls, { label: 'The code needs', value: st.need, options: [32, 64, 128].map((v) => ({ value: v, label: v + ' regs' })), onChange: (v) => { st.need = v; update(); } });
    const sRpw = GG.ui.stat(f.readouts, { label: 'registers / warp' });
    const sBlk = GG.ui.stat(f.readouts, { label: 'blocks / SM', tone: 'core' });
    const sWarps = GG.ui.stat(f.readouts, { label: 'resident warps' });
    const sOcc = GG.ui.stat(f.readouts, { label: 'occupancy', tone: 'core' });
    const sSpill = GG.ui.stat(f.readouts, { label: 'spilled / thread' });
    function calc(regs) {
      if (regs == null) regs = st.regs;
      const rpw = Math.ceil((regs * 32) / 256) * 256;
      const perSP = Math.min(16, Math.floor(16384 / rpw));
      const wpb = st.tpb / 32;
      const byRegs = Math.floor((perSP * 4) / wpb);
      const byWarps = Math.floor(64 / wpb);
      const blocks = Math.min(byRegs, byWarps, 32);
      const limit = blocks === byRegs && byRegs < byWarps ? 'registers' : 'warps';
      return { rpw, perSP, wpb, byRegs, byWarps, blocks, warps: blocks * wpb, limit, spill: Math.max(0, st.need - regs) };
    }
    let W = 0;
    function draw(w) {
      W = w;
      clear(host);
      const c = calc();
      const colGap = w >= 600 ? 18 : 8, top = 22, H = 260;
      const colW = (w - 3 * colGap) / 4;
      const svg = svgEl(host, w, top + H + 24, `Register file of one SM with ${c.warps} resident warps from ${c.blocks} blocks.`);
      const shades = ['rgba(111,166,255,0.62)', 'rgba(111,166,255,0.34)'];
      // with a spill, each column gets a narrow second strip: the same sub-partition at the register count the code needs
      const ghost = c.spill && c.blocks ? calc(st.need) : null;
      const gW = ghost ? Math.max(22, Math.round(colW * 0.3)) : 0, gGap = ghost ? 4 : 0;
      const mW = colW - gW - gGap;
      for (let sp = 0; sp < 4; sp++) {
        const x = sp * (colW + colGap);
        Tx(svg, x, 13, w >= 600 ? `sub-partition ${sp} · 16,384 regs` : `SP ${sp}`, { size: 9.5, fill: 'var(--ink-3)' });
        const drawCol = (cc, x0, cw, isGhost) => {
          R(svg, x0, top, cw, H, { rx: 5, fill: 'rgba(255,255,255,0.02)', stroke: isGhost ? 'var(--accent)' : 'var(--line-2)', dash: isGhost ? '4 3' : null, sw: isGhost ? 1 : null });
          // warps of this sub-partition: global warp index g with g % 4 === sp, in block order
          const mine = range(cc.warps).filter((g) => g % 4 === sp);
          const hh = (cc.rpw / 16384) * H;
          mine.forEach((g, k) => {
            const b = Math.floor(g / cc.wpb);
            const y = top + k * hh;
            R(svg, x0 + 2, y + 1, cw - 4, Math.max(1, hh - 1.5), { rx: 2, fill: isGhost ? (b % 2 ? 'rgba(255,183,140,0.12)' : 'rgba(255,183,140,0.28)') : shades[b % 2], stroke: isGhost ? 'var(--accent-2)' : 'var(--memory)', sw: 0.6, dash: isGhost ? '3 2' : null });
            if (isGhost) { if (hh >= 13 && cw >= 22) Tx(svg, x0 + cw / 2, y + hh / 2 + 3.2, 'b' + b, { size: 8.5, anchor: 'middle', fill: '#ffd9c2', weight: 600 }); }
            else if (hh >= 13 && cw >= 120) Tx(svg, x0 + cw / 2, y + hh / 2 + 3.5, `block ${b} · warp ${g % cc.wpb}`, { size: hh >= 16 ? 9.5 : 8.5, anchor: 'middle', fill: '#0b1220', weight: 600 });
            else if (hh >= 11 && cw >= 44) Tx(svg, x0 + cw / 2, y + hh / 2 + 3.2, `b${b}·w${g % cc.wpb}`, { size: 8.5, anchor: 'middle', fill: '#0b1220', weight: 600 });
          });
          const used = mine.length * hh;
          if (!isGhost && used < H - 2) {
            const free = 16384 - mine.length * cc.rpw;
            R(svg, x0 + 2, top + used + 1, cw - 4, H - used - 2, { rx: 2, fill: 'none', stroke: 'var(--line-2)', dash: '3 3' });
            if (H - used > 16) Tx(svg, x0 + cw / 2, top + used + (H - used) / 2 + 3.5, cw >= 90 ? fmt.int(free) + ' unused' : fmt.int(free), { size: 9, anchor: 'middle', fill: 'var(--ink-3)' });
          }
        };
        drawCol(c, x, mW, false);
        if (ghost) drawCol(ghost, x + mW + gGap, gW, true);
      }
      if (ghost) {
        const occN = fmt.pct(ghost.warps / 64, Number.isInteger((ghost.warps * 100) / 64) ? 0 : 1);
        Tx(svg, w, top + H + 17, w >= 600 ? `dashed strips: at ${st.need} regs, ${ghost.blocks} block${ghost.blocks === 1 ? '' : 's'} · ${occN}` : `dashed: ${st.need} regs, ${ghost.blocks} blk`, { size: 9.5, anchor: 'end', fill: 'var(--accent-2)' });
      }
      if (w < 560) Tx(svg, 0, top + H + 17, `1 slab = ${fmt.int(c.rpw)} regs`, { size: 9.5, fill: 'var(--ink-3)' });
      else Tx(svg, 0, top + H + 17, `each slab = 1 warp = ${fmt.int(c.rpw)} registers (${st.regs} per thread${c.rpw / 32 !== st.regs ? `, rounded up to ${c.rpw / 32}` : ''} × 32 threads)`, { size: 9.5, fill: 'var(--ink-3)' });
    }
    function update() {
      const c = calc();
      sRpw.set(fmt.int(c.rpw));
      sBlk.set(c.blocks ? c.blocks : 'none', c.blocks ? 'core' : 'danger');
      sWarps.set(`${c.warps} / 64`);
      const occ = fmt.pct(c.warps / 64, Number.isInteger((c.warps * 100) / 64) ? 0 : 1);
      sOcc.set(occ, c.blocks ? 'core' : 'danger');
      sSpill.set(c.spill ? c.spill + ' values' : '0', c.spill ? 'danger' : null);
      if (W) draw(W);
      let w;
      if (!c.blocks) w = `At ${st.regs} registers per thread, one block of ${fmt.int(st.tpb)} threads would need more registers than the SM has room for (${c.perSP * 4} warps fit, the block has ${c.wpb}). The launch fails with “too many resources requested for launch”.`;
      else if (c.limit === 'registers') w = `At ${st.regs} registers per thread, each warp takes ${fmt.int(c.rpw)} registers, so a sub-partition holds ${c.perSP} warps and the SM holds <b>${c.blocks} block${c.blocks > 1 ? 's' : ''} of ${fmt.int(st.tpb)} threads</b>: ${c.warps} of 64 warps, ${occ} ${T('occupancy', 'occupancy')}. Registers are the limit; fewer per thread would let more blocks in.`;
      else w = `At ${st.regs} registers per thread, registers are not the limit: <b>${c.blocks} block${c.blocks > 1 ? 's' : ''} of ${fmt.int(st.tpb)} threads</b> fill all ${c.warps} of the SM’s 64 warp slots, ${fmt.pct(c.warps / 64)} ${T('occupancy', 'occupancy')}.`;
      if (c.spill && c.blocks) {
        const cn = calc(st.need);
        const occN = fmt.pct(cn.warps / 64, Number.isInteger((cn.warps * 100) / 64) ? 0 : 1);
        w += ` But the code needs ${st.need} registers, so ${T('nvcc', '<code>ptxas</code>')} must <b>spill ${c.spill} values</b> per thread to GPU RAM (${T('register-pressure', 'register pressure')}). `;
        w += c.warps > cn.warps
          ? `That buys higher occupancy: ${c.blocks} blocks and ${occ} instead of ${cn.blocks} block${cn.blocks === 1 ? '' : 's'} and ${occN} at ${st.need} registers (count the slabs in the dashed strips), paid for with slower memory traffic.`
          : `And occupancy is no higher than at ${st.need} registers (the dashed strips hold ${cn.blocks} block${cn.blocks === 1 ? '' : 's'} too, ${occN}): the spill costs memory traffic and buys nothing.`;
      }
      f.setWhy(w);
    }
    onWidth(host, (w) => draw(w));
    update();
  }

  GG.entry('registers', {
    render(body, ctx) {
      body.classList.add('dsc-body');
      const s = ctx.html(body, `
<p>At the lowest level of the ${T('memory-hierarchy', 'memory hierarchy')} are the <strong>registers</strong>, which store information manipulated by a single ${T('thread', 'thread')}. A register is a tiny named slot, 32 bits wide, right next to the arithmetic units: the operands of nearly every instruction come from registers and the results go back into them. When a thread adds two numbers, both numbers and the sum are in its registers.</p>
<div data-slot="map" class="wide"></div>

<h3>Where they live, and where they go when they do not fit</h3>
<p>The values in registers are generally stored in the ${T('register-file', 'register file')} of the ${T('streaming-multiprocessor', 'Streaming Multiprocessor (SM)')}, a block of fast on-chip memory. On an H100 that is 65,536 registers per SM (256 KiB), split into four 16,384-register files, one per sub-partition. Every thread resident on the SM has its own slice.</p>
<div data-slot="nums"></div>
<p>But they can also <strong>spill</strong> to the ${T('global-memory', 'global memory')} in the ${T('gpu-ram', 'GPU RAM')}, at a substantial performance penalty. A spill happens when a thread needs more values at once than it has registers: the compiler parks some of them in memory and fetches them back when they are needed. The register file is on the SM; GPU RAM is off the chip, far slower to reach and shared by every SM. Fig. 2 shows the round trips.</p>
<div data-slot="spill" class="wide"></div>
${GG.noteHTML('beyond', '<p><b>“Local memory”.</b> NVIDIA calls the memory that spilled registers go to <em>local memory</em>: private to one thread, like a register, but physically in device memory, the same GPU RAM that holds global memory. Accesses to it are cached in the SM’s L1 data cache and the L2 cache, so a spill that hits in cache costs much less than one that goes all the way to DRAM. It still costs instructions and cache space that the kernel would rather spend elsewhere, and <code>nvcc -Xptxas -v</code> reports a kernel’s “bytes spill stores” and “bytes spill loads” at compile time.</p>')}

<h3>Invisible in CUDA C++, everywhere in PTX</h3>
<p>As when programming CPUs, these registers are not directly manipulated by high-level languages like ${T('cuda-c', 'CUDA C')}. A C++ programmer writes variables, and the compiler decides which register holds each one, when, and for how long. Registers are only visible to a lower-level language, here ${T('parallel-thread-execution', 'Parallel Thread Execution (PTX)')}. The ${T('streaming-assembler', 'SASS')} that runs on the hardware names registers too, but different ones: PTX’s registers are virtual and unlimited, while SASS uses the SM’s physical registers <code>R0</code>, <code>R1</code> and so on. Fig. 3 puts a three-line kernel next to its PTX and next to the SASS the compiler produced for an H100 (<code>sm_90</code>), and shows where each virtual register ended up.</p>
<div data-slot="ptx" class="wide"></div>

<h3>Managed by the compiler, for occupancy</h3>
<p>Registers are typically managed by a compiler like <code>ptxas</code>, the PTX-to-SASS assembler that ${T('nvcc', 'nvcc')} runs. Among the compiler’s goals is to <strong>limit the register space used by each thread</strong>, so that more ${T('thread-block', 'thread blocks')} can be simultaneously scheduled into a single ${T('streaming-multiprocessor', 'SM')}, increasing ${T('occupancy', 'occupancy')}. The register file is a fixed size, and every resident thread takes its slice, so registers per thread and threads per SM pull against each other. Fig. 4 lets you feel the trade: fewer registers per thread fit more blocks, until the code no longer fits in its registers and starts to spill (the subject of ${T('register-pressure', 'Register Pressure')}).</p>
<div data-slot="budget" class="wide"></div>
${GG.noteHTML('beyond', '<p><b>Steering the compiler.</b> A thread can use at most 255 registers on current GPUs. Programmers can cap the count for a whole file with <code>nvcc --maxrregcount=N</code>, or per kernel with <code>__launch_bounds__(maxThreadsPerBlock, minBlocksPerSM)</code>, which tells <code>ptxas</code> how many threads it must be able to fit and lets it pick the register budget to match.</p>')}

<h3>Documentation</h3>
<p>The registers used in the ${T('parallel-thread-execution', 'PTX')} instruction set architecture are documented in the <a href="https://docs.nvidia.com/cuda/parallel-thread-execution/#register-state-space">PTX ISA’s section on the register state space</a>. The registers used in ${T('streaming-assembler', 'SASS')} are not, to the glossary authors’ knowledge, documented. What is known about them comes from reading compiler output, as in the SASS listing in Fig. 3.</p>
<div data-slot="names"></div>
<div data-slot="read"></div>`);

      guard(s.map, 'Programming model map', () => {
        let names = 'cuda';
        const m = mapFig(s.map, ctx, {
          title: 'Registers in the CUDA programming model',
          highlight: 'registers',
          caption: 'Redrawn after the glossary’s figure, itself modified from NVIDIA’s CUDA Refresher and CUDA C++ Programming Guide. Registers are the memory of the memory hierarchy associated with individual threads (left), and they live in the SM’s register file (right). Switch to the PTX names to see the state-space spelling, <code>.reg</code>.',
          why: () => (names === 'ptx'
            ? 'In PTX, registers form the <code>.reg</code> state space: fast storage private to each thread. Lit: registers and the <b>register file</b> they live in.'
            : 'Lit: <b>registers</b>, the memory of a single thread, and the SM’s <b>register file</b> that holds them. They are the smallest and fastest level of the memory hierarchy.'),
        });
        GG.ui.seg(m.f.controls, { label: 'Names', value: 'cuda', options: [{ value: 'cuda', label: 'CUDA C++' }, { value: 'ptx', label: 'PTX' }], onChange: (v) => { names = v; m.setNames(v); } });
        return m;
      });
      ctx.numbers(s.nums, [
        { value: '32 bits', label: 'width of one register', tone: 'memory' },
        { value: '65,536', label: 'registers per H100 SM (256 KiB)', tone: 'memory' },
        { value: '16,384', label: 'per sub-partition, for that sub-partition’s warps' },
        { value: '255', label: 'most registers one thread can use', tone: 'control' },
      ]);
      guard(s.spill, 'Spill figure', () => spillFig(s.spill, ctx));
      guard(s.ptx, 'PTX registers figure', () => ptxRegsFig(s.ptx, ctx));
      guard(s.budget, 'Register budget figure', () => regBudgetFig(s.budget, ctx));
      s.names.innerHTML = GG.tableHTML(`<thead><tr><th>Kind</th><th>In PTX</th><th>In SASS</th></tr></thead><tbody>
<tr><td>general-purpose, 32-bit</td><td><code>%r0</code>, <code>%r1</code> … (declared with <code>.reg .b32</code>, <code>.u32</code>, <code>.s32</code>)</td><td><code>R0</code> … <code>R254</code>, and <code>RZ</code>, which always reads as zero</td></tr>
<tr><td>floating point</td><td><code>%f0</code>, <code>%f1</code> … (<code>.reg .f32</code>); <code>%fd</code> for <code>.f64</code></td><td>the same <code>R</code> registers (a 64-bit value takes a pair)</td></tr>
<tr><td>64-bit (addresses)</td><td><code>%rd0</code> … (<code>.reg .b64</code>)</td><td>a register pair, written <code>R2.64</code></td></tr>
<tr><td>predicates (true/false)</td><td><code>%p0</code> … (<code>.reg .pred</code>)</td><td><code>P0</code> … <code>P6</code>, and <code>PT</code> (always true)</td></tr>
<tr><td>one value per warp</td><td>none</td><td>uniform registers <code>UR0</code> …, and <code>URZ</code></td></tr>
<tr><td>read-only built-ins</td><td>special registers <code>%tid</code>, <code>%ntid</code>, <code>%ctaid</code>, <code>%laneid</code> …</td><td><code>SR_TID.X</code>, <code>SR_CTAID.X</code> …, read with <code>S2R</code> / <code>S2UR</code></td></tr></tbody>`) +
        GG.noteHTML('beyond', '<p>The PTX column follows NVIDIA’s PTX ISA. The <code>%r</code>, <code>%f</code>, <code>%rd</code> and <code>%p</code> prefixes are the conventions <code>nvcc</code> uses in its output; PTX itself lets a programmer name registers freely. The SASS column is what disassemblers such as ' + T('cuda-binary-utilities', '<code>cuobjdump</code> and <code>nvdisasm</code>') + ' print, not a specification.</p>');
      ctx.reading(s.read, [
        { href: 'https://docs.nvidia.com/cuda/parallel-thread-execution/#register-state-space', label: 'NVIDIA PTX ISA: Register State Space', note: 'the documentation the glossary points to' },
        REFRESHER, CPG, CPG_LIMITS,
      ]);
    },
  });


  /* ═════════════════════════════ Shared Memory ═════════════════════════════ */

  GG.css(`
.dsc-rec { display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; align-items: start; }
@media (min-width: 900px) { .dsc-rec.wide { grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); } }
.dsc-rec .code { margin: 0; }
.dsc-rec .code pre { font-size: 12px; }
@media (max-width: 600px) { .dsc-rec .code .ln { white-space: pre-wrap; overflow-wrap: anywhere; padding-left: 4.3em; text-indent: -4.3em; } }
.dsc-rec-tog { display: flex; flex-wrap: wrap; gap: 8px 18px; }
.dsc-cv { margin-top: 14px; }

`);

  /* Fig: the typical kernel, step by step: global → shared → compute (+ barriers) → global (+ atomics) */
  function recipeFig(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'The typical kernel, one step at a time',
      hint: 'step through · switch barriers and atomics off',
      wide: true,
      caption: 'A toy kernel launched as <code>block_sum&lt;&lt;&lt;2, 4&gt;&gt;&gt;(in, total)</code>: two blocks of four threads add up eight numbers. Each block has its own four-slot shared memory <code>s</code>; global memory holds the inputs and the grand total. The comments number the recipe’s steps; the barriers are its step 3, synchronizing in the middle of step 2. Blue arrows are memory traffic, green arrows are arithmetic on a CUDA Core, red marks a value read too early or an update lost. A slot nobody has written yet holds undefined contents, shown as “?”. With barriers off, the figure plays out one legal timing in which threads 1 and 3 of each block are slow; with atomics off, both blocks update the total at the same moment.',
    });
    const box = el('div', { class: 'dsc-rec' });
    f.stage.append(box);
    const left = el('div', { class: 'dsc-w' }), right = el('div');
    box.append(left, right);
    const host = el('div');
    left.append(host);
    legend(left, [['dsc-sw-memory', 'memory traffic'], ['dsc-sw-core', 'arithmetic on a core'], ['dsc-sw-control', 'barrier'], ['dsc-sw-danger', 'stale read or lost update']]);
    const IN = [3, 1, 4, 1, 5, 9, 2, 6];
    const st = { bar: true, atom: true, k: 0 };
    const tog = el('div', { class: 'dsc-rec-tog' });
    f.controls.append(tog);
    GG.ui.toggle(tog, { label: 'barriers (__syncthreads)', value: true, onChange: (v) => { st.bar = v; rebuild(); } });
    GG.ui.toggle(tog, { label: 'atomics (atomicAdd)', value: true, onChange: (v) => { st.atom = v; rebuild(); } });
    const sTot = GG.ui.stat(f.readouts, { label: 'total', tone: 'memory' });
    GG.ui.stat(f.readouts, { label: 'correct total', value: '31' });
    const sStat = GG.ui.stat(f.readouts, { label: 'status' });
    let code = null;
    function codeText() {
      const sync = st.bar ? '  __syncthreads();               // barrier: all of s loaded' : '  // __syncthreads();  (removed)';
      const sync2 = st.bar ? '  __syncthreads();               // barrier: s[2] is ready' : '  // __syncthreads();  (removed)';
      return `__global__ void block_sum(const float* in, float* total) {
  __shared__ float s[4];         // one per block
  int t = threadIdx.x;
  int i = blockIdx.x * blockDim.x + t;
  s[t] = in[i];                  // 1. load
${sync}
  if (t % 2 == 0) s[t] += s[t + 1];  // 2. compute
${sync2}
  if (t == 0) s[0] += s[2];          // 2. compute
${st.atom ? '  if (t == 0) atomicAdd(total, s[0]);  // 4. write' : '  if (t == 0) *total += s[0];  // 4. write, unsafely'}
}`;
    }
    /* Build the list of states. Each: {label, lines, s:[[4],[4]], filled:[[4],[4]], total, arrows:[[from,to,kind]], barrier, why, regs} */
    function steps() {
      const out = [];
      const s = [[0, 0, 0, 0], [0, 0, 0, 0]];
      const fl = [[false, false, false, false], [false, false, false, false]];
      const staleSet = new Set();
      const snap = (o) => out.push(Object.assign({ s: s.map((r) => r.slice()), filled: fl.map((r) => r.slice()), stale: new Set(staleSet), total: o.total == null ? 0 : o.total, arrows: [], barrier: false }, o));
      snap({ label: 'launch', lines: [1, 2, 3, 4], why: 'Two blocks of four threads start. Each block gets its own <b>shared memory</b>, here four slots <code>s[0..3]</code>, not yet written: their contents are undefined (“?”). The eight inputs and the total live in <b>global memory</b>, where every thread of the grid can reach them.' });
      // 1. load
      const slow = st.bar ? [] : [1, 3];
      const loadArrows = [];
      for (let b = 0; b < 2; b++) for (let k = 0; k < 4; k++) {
        loadArrows.push(['g' + (b * 4 + k), 's' + b + k, slow.includes(k) ? 'pending' : 'memory']);
        if (!slow.includes(k)) { s[b][k] = IN[b * 4 + k]; fl[b][k] = true; }
      }
      snap({ label: 'load', lines: [5], arrows: loadArrows, why: st.bar
        ? '<b>Step 1, load.</b> Each thread copies one element from global memory into its slot of the block’s shared memory: <code>s[t] = in[i]</code>. This is the slow trip, made once.'
        : '<b>Step 1, load.</b> Each thread starts copying its element into shared memory. Threads 1 and 3 of each block are slower (their loads are still in flight, dashed), which is perfectly legal: nothing says threads progress in step.' });
      if (st.bar) {
        snap({ label: 'barrier', lines: [6], barrier: true, why: '<b>Barrier</b> (the recipe’s step 3, synchronizing during the computation). <code>__syncthreads()</code>: no thread of a block goes on until all four have arrived, so every slot of <code>s</code> is filled before anyone reads a neighbour’s value.' });
      } else {
        snap({ label: 'no barrier', lines: [6], arrows: loadArrows.filter((a) => a[2] === 'pending'), why: '<b>No barrier.</b> With the <code>__syncthreads()</code> removed, threads 0 and 2 race ahead while threads 1 and 3 are still loading.' });
      }
      // 2. compute round 1
      const c1 = [];
      for (let b = 0; b < 2; b++) for (const k of [0, 2]) {
        const stale = !fl[b][k + 1];
        c1.push(['s' + b + (k + 1), 's' + b + k, stale ? 'danger' : 'core']);
        s[b][k] += stale ? 0 : s[b][k + 1];
        if (stale) staleSet.add(b + ':' + k);
      }
      snap({ label: 'compute', lines: [7], arrows: c1, why: st.bar
        ? `<b>Step 2, compute.</b> Threads 0 and 2 each add their neighbour’s value on a CUDA Core, reading it from fast shared memory: block 0 now holds ${s[0][0]} and ${s[0][2]}, block 1 ${s[1][0]} and ${s[1][2]}. In a real kernel this step is long, with many reads of the same data, often on Tensor Cores.`
        : `<b>Step 2, compute, too early.</b> Threads 0 and 2 read <code>s[1]</code> and <code>s[3]</code> before threads 1 and 3 have written them, so they add whatever those slots held before (red). Shared memory starts out undefined, not zeroed; here it happens to hold 0, so block 0 keeps ${s[0][0]} and ${s[0][2]} where it should have 4 and 5. With other leftovers the result would be just as wrong, differently.` });
      if (st.bar) {
        snap({ label: 'barrier', lines: [8], barrier: true, why: '<b>Barrier again.</b> Thread 0 is about to read <code>s[2]</code>, which thread 2 just wrote, so the block waits once more. Barriers can appear as often as the computation needs them.' });
      } else {
        const late = [];
        for (let b = 0; b < 2; b++) for (const k of [1, 3]) { s[b][k] = IN[b * 4 + k]; fl[b][k] = true; late.push(['g' + (b * 4 + k), 's' + b + k, 'memory']); }
        snap({ label: 'late loads', lines: [8], arrows: late, why: '<b>The slow loads land</b>, too late: the values they bring were already needed.' });
      }
      const c2 = [];
      for (let b = 0; b < 2; b++) { c2.push(['s' + b + 2, 's' + b + 0, st.bar ? 'core' : 'core']); s[b][0] += s[b][2]; }
      const p0 = s[0][0], p1 = s[1][0];
      snap({ label: 'compute', lines: [9], arrows: c2, why: `<b>Still step 2.</b> Thread 0 of each block adds <code>s[2]</code> into <code>s[0]</code>: block 0’s partial sum is <b>${p0}</b>, block 1’s is <b>${p1}</b>${st.bar ? ' (3 + 1 + 4 + 1 and 5 + 9 + 2 + 6).' : ', where 9 and 22 were right.'}` });
      // 4. write back
      if (st.atom) {
        snap({ label: 'atomic 1', lines: [10], total: p0, arrows: [['s00', 'gT', 'memory']], why: `<b>Step 4, write back.</b> Block 0’s thread 0 does <code>atomicAdd(total, ${p0})</code>: read, add and write as one indivisible step. The total is now ${p0}.` });
        snap({ label: 'atomic 2', lines: [10], total: p0 + p1, arrows: [['s10', 'gT', 'memory']], why: `Block 1’s atomic add lands after block 0’s: the total is <b>${p0 + p1}</b>${p0 + p1 === 31 ? ', correct' : `, but it should be 31: the stale reads earlier already broke the partial sums`}. The two blocks could have gone in either order; atomics make the order not matter.` });
      } else {
        snap({ label: 'both read', lines: [10], total: 0, arrows: [['gT', 't00', 'danger'], ['gT', 't10', 'danger']], why: `<b>Step 4, unsafely.</b> <code>*total += s[0]</code> is three steps: read, add, write. Both blocks’ thread 0 read the total at the same moment, and both see 0.` });
        snap({ label: 'both write', lines: [10], total: p1, arrows: [['t00', 'gT', 'danger'], ['t10', 'gT', 'memory']], why: `Block 0 writes 0 + ${p0} = ${p0}, then block 1 writes 0 + ${p1} = ${p1} over it. The total ends at <b>${p1}</b>: block 0’s update is lost. Blocks of a grid run in no guaranteed order, so the only safe way for them to share a total is an atomic.` });
      }
      return out;
    }
    let ST = [], W = 0, G = null, stepper = null, dots = [];
    function geo(w) {
      const gap = 14, bw = (w - gap) / 2;
      const cw = Math.min(46, (bw - 20) / 4);
      const bx = (b) => b * (bw + gap);
      const cx = (b, k) => bx(b) + 10 + (bw - 20 - 4 * cw) / 2 + k * cw + cw / 2;
      const shY = 34, shH = 26, thY = 92, thL = 40, Hb = 162;
      const gY = Hb + 34, gH = 26, tY = gY + gH + 44;
      return { gap, bw, cw, bx, cx, shY, shH, thY, thL, Hb, gY, gH, tY, H: tY + 40 };
    }
    function anchor(ref, side) {
      const g = G;
      if (ref === 'gT') return [W / 2, side === 'top' ? g.tY : g.tY + 26];
      if (ref[0] === 'g') { const i = +ref.slice(1), b = Math.floor(i / 4), k = i % 4; return [g.cx(b, k), side === 'top' ? g.gY : g.gY + g.gH]; }
      if (ref[0] === 's') { const b = +ref[1], k = +ref[2]; return [g.cx(b, k), side === 'top' ? g.shY : g.shY + g.shH]; }
      if (ref[0] === 't') { const b = +ref[1], k = +ref[2]; return [g.cx(b, k), side === 'top' ? g.thY : g.thY + g.thL]; }
      return [0, 0];
    }
    function arrowPath(a, b2) {
      const [from, to] = [a, b2];
      const fy = anchor(from, 'top')[1], ty = anchor(to, 'top')[1];
      const down = ty > fy;
      const p = anchor(from, down ? 'bottom' : 'top'), q = anchor(to, down ? 'top' : 'bottom');
      if (from[0] === 's' && to[0] === 's') {
        // sideways within the shared row: arc over the top
        const y = G.shY - 2;
        return `M${r2(p[0])} ${y}C${r2(p[0])} ${y - 18} ${r2(q[0])} ${y - 18} ${r2(q[0])} ${y}`;
      }
      const my = (p[1] + q[1]) / 2;
      return `M${r2(p[0])} ${r2(p[1])}C${r2(p[0])} ${r2(my)} ${r2(q[0])} ${r2(my)} ${r2(q[0])} ${r2(q[1])}`;
    }
    function draw(w) {
      W = w;
      G = geo(w);
      clear(host);
      dots = [];
      const S0 = ST[st.k];
      const svg = svgEl(host, w, G.H, 'Two thread blocks with their shared memory and threads, above global memory. ' + (S0 ? S0.label : ''));
      const active = new Set();
      S0.arrows.forEach(([a, b]) => { [a, b].forEach((r) => { if (r[0] === 't' || r[0] === 's') active.add(r.slice(1)); }); });
      for (let b = 0; b < 2; b++) {
        const x0 = G.bx(b);
        R(svg, x0, 0, G.bw, G.Hb, { rx: 8, fill: 'rgba(255,255,255,0.02)', stroke: 'var(--ink-3)', sw: 1.1 });
        Tx(svg, x0 + 10, 16, 'block ' + b, { size: 10.5, fill: 'var(--ink)', weight: 600 });
        Tx(svg, x0 + G.bw - 10, 16, 'shared s[4]', { size: 9.5, anchor: 'end', fill: 'var(--memory)' });
        for (let k = 0; k < 4; k++) {
          const cx = G.cx(b, k), x = cx - G.cw / 2 + 2;
          const filled = S0.filled[b][k];
          const hot = S0.arrows.some(([a, c]) => c === 's' + b + k);
          R(svg, x, G.shY, G.cw - 4, G.shH, { rx: 4, fill: filled ? (hot ? 'rgba(111,166,255,0.45)' : 'var(--memory-a)') : 'rgba(255,255,255,0.02)', stroke: hot ? '#fff' : 'var(--memory)', sw: hot ? 1.4 : 1, dash: filled ? null : '3 3' });
          const bad = S0.stale.has(b + ':' + k);
          if (bad) R(svg, x - 2, G.shY - 2, G.cw, G.shH + 4, { rx: 5, stroke: 'var(--danger)', sw: 1.6 });
          Tx(svg, cx, G.shY + G.shH / 2 + 4, filled ? String(S0.s[b][k]) : '?', { size: 11.5, anchor: 'middle', weight: 600, fill: bad ? 'var(--danger)' : filled ? 'var(--ink)' : 'var(--ink-3)' });
          // thread
          const isCore = S0.arrows.some(([a, c, kind]) => (c === 's' + b + k && (kind === 'core' || kind === 'danger') && a[0] === 's'));
          const isT = S0.arrows.some(([a, c]) => a === 't' + b + k || c === 't' + b + k);
          const col = isCore ? 'var(--core)' : isT ? 'var(--ink)' : 'var(--ink-2)';
          strand(svg, cx, G.thY, G.thL, { amp: 2, wl: 10, phase: k * 0.7 + b, sw: isCore || isT ? 1.9 : 1.2, stroke: col, hw: 2.6 });
          if (isCore) Tx(svg, cx + 9, G.thY + G.thL / 2 + 4, '+', { size: 13, weight: 700, fill: 'var(--core)' });
          Tx(svg, cx, G.thY + G.thL + 14, 't' + k, { size: 9.5, anchor: 'middle', fill: 'var(--ink-3)' });
        }
        if (S0.barrier) {
          const by = G.thY + G.thL + 26;
          L(svg, x0 + 6, by, x0 + G.bw - 6, by, { stroke: 'var(--control)', sw: 1.8, dash: '6 4' });
          Tx(svg, x0 + G.bw / 2, by + 12, '__syncthreads()', { size: 9.5, anchor: 'middle', fill: 'var(--control)' });
        }
      }
      // global memory
      R(svg, 0, G.gY - 18, w, G.tY + 34 - (G.gY - 18), { rx: 8, fill: 'rgba(111,166,255,0.04)', stroke: 'rgba(111,166,255,0.4)' });
      Tx(svg, 10, G.gY - 5, 'GLOBAL MEMORY · in[0..7] and total', { size: 9.5, fill: '#d3e3ff', ls: '0.08em' });
      for (let i = 0; i < 8; i++) {
        const b = Math.floor(i / 4), k = i % 4, cx = G.cx(b, k);
        R(svg, cx - G.cw / 2 + 2, G.gY, G.cw - 4, G.gH, { rx: 4, fill: 'rgba(111,166,255,0.18)', stroke: 'rgba(111,166,255,0.6)' });
        Tx(svg, cx, G.gY + G.gH / 2 + 4, String(IN[i]), { size: 11.5, anchor: 'middle', weight: 600, fill: 'var(--ink)' });
      }
      const tw = 92;
      const totHot = S0.arrows.some(([a, c]) => c === 'gT');
      const wrong = st.k === ST.length - 1 && S0.total !== 31;
      R(svg, w / 2 - tw / 2, G.tY, tw, 26, { rx: 5, fill: wrong ? 'var(--danger-a)' : totHot ? 'rgba(111,166,255,0.45)' : 'rgba(111,166,255,0.18)', stroke: wrong ? 'var(--danger)' : totHot ? '#fff' : 'var(--memory)', sw: 1.3 });
      Tx(svg, w / 2, G.tY + 17.5, 'total = ' + S0.total, { size: 11.5, anchor: 'middle', weight: 700, fill: wrong ? 'var(--danger)' : 'var(--ink)' });
      // arrows
      const colors = { memory: 'var(--memory)', core: 'var(--core)', danger: 'var(--danger)', pending: 'var(--memory)' };
      for (const [a, b, kind] of S0.arrows) {
        const d = arrowPath(a, b);
        const pth = P(svg, d, { stroke: colors[kind], sw: 1.6, dash: kind === 'pending' ? '4 4' : null, opacity: kind === 'pending' ? 0.6 : 0.95 });
        const q = anchor(b, 'top');
        const fromY = anchor(a, 'top')[1];
        const down = q[1] > fromY;
        const tip = a[0] === 's' && b[0] === 's' ? [q[0], G.shY - 2] : anchor(b, down ? 'top' : 'bottom');
        const dir = a[0] === 's' && b[0] === 's' ? 1 : down ? 1 : -1;
        if (kind !== 'pending') P(svg, `M${r2(tip[0] - 4)} ${r2(tip[1] - 6 * dir)}L${r2(tip[0])} ${r2(tip[1])}L${r2(tip[0] + 4)} ${r2(tip[1] - 6 * dir)}`, { stroke: colors[kind], sw: 1.6 });
        const dot = S('circle', { r: 3.2, fill: colors[kind], cx: -50, cy: -50 }, svg);
        let len = 0;
        try { len = pth.getTotalLength(); } catch (e) { len = 0; }
        dots.push({ pth, dot, len, pending: kind === 'pending' });
      }
      paintDots(GG.reducedMotion ? 0.6 : (anim ? (anim.time % 1.4) / 1.4 : 0.6));
    }
    function paintDots(u) {
      for (const d of dots) {
        if (!d.len) continue;
        const uu = d.pending ? Math.min(u, 0.45) : u;
        const p = d.pth.getPointAtLength(uu * d.len);
        d.dot.setAttribute('cx', r2(p.x)); d.dot.setAttribute('cy', r2(p.y));
      }
    }
    const anim = GG.anim(left, (t) => { if (dots.length) paintDots((t % 1.4) / 1.4); });
    motionBtn(f.controls, anim.running, () => anim.toggle(), 'Start or stop the dots moving along the arrows (the stepper’s Play steps the kernel)');
    function show(k) {
      st.k = k;
      const S0 = ST[k];
      if (code) { code.clear(); code.highlight(S0.lines, S0.arrows.some((a) => a[2] === 'danger') ? null : 'memory'); }
      const last = k === ST.length - 1;
      sTot.set(S0.total, last ? (S0.total === 31 ? 'core' : 'danger') : 'memory');
      sStat.set(last ? (S0.total === 31 ? 'correct' : 'wrong') : 'running', last ? (S0.total === 31 ? 'core' : 'danger') : null);
      if (W) draw(W);
      f.setWhy(S0.why);
    }
    const stepHost = el('div');
    f.controls.insertBefore(stepHost, tog);
    function rebuild() {
      ST = steps();
      clear(right);
      code = ctx.code(right, { lang: 'cuda', code: codeText(), caption: st.bar && st.atom ? 'the recipe, in CUDA C++' : 'the recipe, with ' + [!st.bar && 'barriers', !st.atom && 'atomics'].filter(Boolean).join(' and ') + ' removed' });
      const k = stepper ? Math.min(stepper.get(), ST.length - 1) : 0;
      if (stepper) stepper.stop();
      clear(stepHost);
      stepper = GG.ui.stepper(stepHost, { label: 'Step', steps: ST, onStep: show, autoplay: 2400, start: k });
      show(k);
    }
    onWidth(left, (w) => { W = w; if (ST.length) draw(W); });
    rebuild();
    box.classList.add('wide');
  }

  /* Fig: much smaller, much faster */
  function smallFastFig(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Much smaller, much faster',
      hint: 'switch between capacity, bandwidth and latency',
      wide: true,
      caption: `H100 SXM figures. Capacity: up to 228 KiB of shared memory per SM, on each of 132 SMs, against 80 GiB of global memory (areas to scale, with the corner that holds the shared memory magnified in the inset; NVIDIA’s documents write “KB” for these 1,024-byte units). Bandwidth: each SM’s shared memory can serve 32 banks × 4 bytes = 128 bytes per clock, so 132 SMs at 1.98 GHz move about 33.5 TB/s, against 3.35 TB/s for HBM3 global memory (lengths to scale). These are peak rates; the bandwidth arithmetic is ours. Latency: pointer-chasing microbenchmarks by <a href="${LUO24}">Luo et al. (2024)</a> on an H800, a Hopper GPU built on the same GH100 chip as the H100, measured 29.0 clock cycles for a shared memory load and 478.8 cycles for a global memory load from an array larger than the L2 cache, so that it goes to DRAM (Table IV; lengths to scale). The ${T('gpu-ram', 'GPU RAM')} and ${T('streaming-multiprocessor', 'Streaming Multiprocessor')} entries use the same measurements.`,
    });
    const host = el('div', { class: 'dsc-w' });
    f.stage.append(host);
    const st = { mode: 'cap' };
    GG.ui.seg(f.controls, { label: 'Compare', value: 'cap', options: [{ value: 'cap', label: 'capacity' }, { value: 'bw', label: 'bandwidth' }, { value: 'lat', label: 'latency' }], onChange: (v) => { st.mode = v; update(); } });
    const sA = GG.ui.stat(f.readouts, { label: '', tone: 'memory' });
    const sB = GG.ui.stat(f.readouts, { label: '' });
    const sR = GG.ui.stat(f.readouts, { label: 'ratio' });
    const SH_KIB = 228 * 132; // KiB
    const GL_KIB = 80 * 1024 * 1024;
    const SH_BW = 128 * 132 * 1.98e9; // B/s
    const GL_BW = 3.35e12;
    const LAT_SH = 29, LAT_GL = 478.8; // H800 (GH100) P-chase, Luo et al. 2024, Table IV
    let W = 0;
    function draw(w) {
      W = w;
      clear(host);
      if (st.mode === 'cap') {
        const side = Math.min(300, w - 40);
        const H = side + 70;
        const svg = svgEl(host, w, H, 'Area comparison: all shared memory of an H100 against its global memory, with the corner that holds it magnified ten times.');
        const x0 = (w - side) / 2, y0 = 26;
        R(svg, x0, y0, side, side, { rx: 4, fill: 'rgba(111,166,255,0.14)', stroke: 'var(--memory)' });
        Tx(svg, x0 + side / 2, 16, 'global memory · 80 GiB', { size: 10.5, anchor: 'middle', fill: '#d3e3ff' });
        const s2 = side * Math.sqrt(SH_KIB / GL_KIB);
        R(svg, x0 + 6, y0 + 6, s2, s2, { rx: 0.5, fill: '#fff' });
        // magnifier: a 16 px window on the corner, drawn M times larger in the lower right
        const M = side >= 240 ? 10 : 8, zs = 16, I = zs * M;
        const sx = x0 - 2, sy = y0 - 2, ix = x0 + side - I - 14, iy = y0 + side - I - 14;
        L(svg, sx + zs, sy, ix + I, iy, { stroke: 'var(--ink-3)', dash: '3 3' });
        L(svg, sx, sy + zs, ix, iy + I, { stroke: 'var(--ink-3)', dash: '3 3' });
        R(svg, sx, sy, zs, zs, { rx: 1, stroke: 'var(--ink-2)', dash: '2 2' });
        R(svg, ix, iy, I, I, { rx: 3, fill: 'var(--bg-2)', stroke: 'var(--ink-2)' });
        const a = ix + 2 * M, b = iy + 2 * M, rr = 4 * M;
        P(svg, `M${r2(a)} ${r2(iy + I)} L${r2(a)} ${r2(b + rr)} A${rr} ${rr} 0 0 1 ${r2(a + rr)} ${r2(b)} L${r2(ix + I)} ${r2(b)} L${r2(ix + I)} ${r2(iy + I)} Z`, { fill: 'rgba(111,166,255,0.14)' });
        P(svg, `M${r2(a)} ${r2(iy + I)} L${r2(a)} ${r2(b + rr)} A${rr} ${rr} 0 0 1 ${r2(a + rr)} ${r2(b)} L${r2(ix + I)} ${r2(b)}`, { stroke: 'var(--memory)', sw: 1.2 });
        R(svg, ix + 8 * M, iy + 8 * M, s2 * M, s2 * M, { rx: 1, fill: '#fff' });
        Tx(svg, ix + I - 6, iy + 13, '×' + M, { size: 10, anchor: 'end', fill: 'var(--ink-2)', weight: 600 });
        Tx(svg, w / 2, y0 + side + 20, 'white: every SM’s shared memory, ≈ 29.4 MiB', { size: 10, anchor: 'middle', fill: 'var(--ink)' });
        Tx(svg, w / 2, y0 + side + 36, `(132 × 228 KiB, a square ${GG.fmt.fixed(s2, 1)} px wide)`, { size: 9.5, anchor: 'middle', fill: 'var(--ink-3)' });
      } else if (st.mode === 'lat') {
        const lab = w >= 480 ? 128 : 96, bw = w - lab - 10, H = 132;
        const svg = svgEl(host, w, H, 'Bar comparison of measured shared memory and uncached global memory latency on a Hopper GPU, 29 against 478.8 clock cycles.');
        const k = bw / LAT_GL;
        [['shared memory', LAT_SH, 'rgba(111,166,255,0.75)', `${LAT_SH} cycles (on the SM)`], ['global memory', LAT_GL, 'rgba(111,166,255,0.3)', w >= 480 ? `${LAT_GL} cycles (off-chip DRAM, uncached)` : `${LAT_GL} cycles (DRAM)`]].forEach(([n, v, c, t], i) => {
          const y = 20 + i * 48;
          Tx(svg, 0, y + 19, n, { size: w >= 480 ? 11 : 10, fill: 'var(--ink-2)' });
          R(svg, lab, y, Math.max(3, v * k), 28, { rx: 3, fill: c, stroke: 'var(--memory)' });
          const inside = v * k > 220;
          Tx(svg, inside ? lab + v * k - 8 : lab + v * k + 8, y + 18.5, t, { size: w >= 480 ? 11 : 10, anchor: inside ? 'end' : 'start', weight: 600, fill: inside ? '#0b1220' : 'var(--ink)' });
        });
        Tx(svg, lab, H - 6, w >= 480 ? 'clock cycles for one access (shorter is faster)' : 'cycles per access', { size: 9.5, fill: 'var(--ink-3)' });
      } else {
        const lab = 128, bw = w - lab - 10, H = 120;
        const svg = svgEl(host, w, H, 'Bar comparison of shared memory and global memory bandwidth.');
        const k = bw / SH_BW;
        [['shared memory', SH_BW, 'rgba(111,166,255,0.75)', '≈ 33.5 TB/s'], ['global memory', GL_BW, 'rgba(111,166,255,0.3)', '3.35 TB/s']].forEach(([n, v, c, t], i) => {
          const y = 20 + i * 48;
          Tx(svg, 0, y + 19, n, { size: 11, fill: 'var(--ink-2)' });
          R(svg, lab, y, v * k, 28, { rx: 4, fill: c, stroke: 'var(--memory)' });
          const inside = v * k > 110;
          Tx(svg, inside ? lab + v * k - 8 : lab + v * k + 8, y + 18.5, t, { size: 11, anchor: inside ? 'end' : 'start', weight: 600, fill: inside ? '#0b1220' : 'var(--ink)' });
        });
      }
    }
    function update() {
      if (st.mode === 'cap') {
        sA.el.querySelector('i').textContent = 'shared, whole GPU';
        sA.set('≈ ' + GG.fmt.fixed(SH_KIB / 1024, 1) + ' MiB');
        sB.el.querySelector('i').textContent = 'global';
        sB.set('80 GiB');
        sR.set('≈ ' + fmt.int(GL_KIB / SH_KIB) + '× smaller');
        f.setWhy(`All the shared memory on the GPU together, ${fmt.int(SH_KIB)} KiB, is about <b>1/${fmt.int(GL_KIB / SH_KIB)}</b> of global memory. One block sees only its own SM’s share, at most 227 KiB: small enough that a kernel must choose carefully what to keep there.`);
      } else if (st.mode === 'lat') {
        sA.el.querySelector('i').textContent = 'shared latency';
        sA.set(LAT_SH + ' cycles');
        sB.el.querySelector('i').textContent = 'global, uncached';
        sB.set(LAT_GL + ' cycles');
        sR.set('≈ ' + fmt.int(LAT_GL / LAT_SH) + '× lower');
        f.setWhy(`Latency is the wait for one access to come back. Shared memory is on-chip SRAM, a short hop from the Load/Store Units; an uncached global memory access travels off the chip to DRAM and back. Measured on a Hopper GPU, that is about <b>${LAT_SH} against ${LAT_GL} clock cycles</b>, roughly ${fmt.int(LAT_GL / LAT_SH)}× (for a shared access without ${T('bank-conflict', 'bank conflicts')}). Hits in the L2 cache, at a few hundred cycles, shrink the gap for global memory.`);
      } else {
        sA.el.querySelector('i').textContent = 'shared, whole GPU';
        sA.set('≈ ' + GG.fmt.fixed(SH_BW / 1e12, 1) + ' TB/s');
        sB.el.querySelector('i').textContent = 'global';
        sB.set('3.35 TB/s');
        sR.set('≈ ' + GG.fmt.fixed(SH_BW / GL_BW, 1) + '× faster');
        f.setWhy(`128 bytes per clock per SM × 132 SMs × 1.98 GHz ≈ <b>${GG.fmt.fixed(SH_BW / 1e12, 1)} TB/s</b> of shared memory bandwidth, about ${GG.fmt.fixed(SH_BW / GL_BW, 0)}× global memory’s 3.35 TB/s. Latency improves too: switch to latency.`);
      }
      if (W) draw(W);
    }
    onWidth(host, (w) => draw(w));
    update();
  }

  /* Fig: shared memory inside the SM's L1 data cache, with the carveout */
  function carveFig(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Shared memory lives in the SM’s L1 data cache',
      hint: 'hover the SM · set the preferred carveout and the per-block need',
      wide: true,
      caption: 'Top: an H100 SM, with the 256 KiB L1 data cache / shared memory lit and loads and stores flowing to it from the Load/Store Units of the four sub-partitions. Bottom: how that 256 KiB is split between shared memory and ordinary L1 cache, with one slice per resident block. A kernel states a <em>preferred</em> carveout (<code>cudaFuncAttributePreferredSharedMemoryCarveout</code>); it is only a hint, and the driver can choose a different split if the kernel needs one to run. The split points (0, 8, 16, 32, 64, 100, 132, 164, 196 or 228 KiB) are from NVIDIA’s CUDA C++ Programming Guide for compute capability 9.0. The 1 KiB per block is the shared memory the CUDA driver reserves for each resident block (the device attribute <code>cudaDevAttrReservedSharedMemoryPerBlock</code>), which NVIDIA’s occupancy calculator counts too; it is also why one block may use at most 227 of the 228 KiB. NVIDIA’s documentation writes these 1,024-byte units as “KB”. The ' + T('l1-data-cache', 'L1 Data Cache') + ' entry works through the same budget with the smallest carveout that fits; this figure starts from that choice (196 KiB for blocks of 48 KiB) and lets you state a different preference.',
    });
    let flowStop = null, moving = !GG.reducedMotion;
    if (GG.components.sm) {
      const sm = GG.components.sm(f.stage, { highlight: ['l1d', 'ldst'], maxHeight: '46vh' });
      try { flowStop = sm.flow('ldst', 'l1d', { color: 'memory', dots: 4 }); } catch (e) { /* static drawing only */ }
    }
    const cv = el('div', { class: 'dsc-cv' });
    f.stage.append(cv);
    cv.append(el('div', { class: 'dsc-k', text: 'the 256 KiB of one SM', style: 'margin-bottom:6px' }));
    const host = el('div');
    cv.append(host);
    legend(cv, [['dsc-sw-memory', 'shared memory: one slice per resident block'], ['dsc-sw-res', 'the 1 KiB the driver reserves per block'], ['dsc-sw-hatch', 'carved out for shared memory but unused'], ['dsc-sw-memory-a', 'ordinary L1 cache'], ['dsc-sw-danger', 'a block that does not fit the preferred split']]);
    const CARVE = [0, 8, 16, 32, 64, 100, 132, 164, 196, 228];
    const st = { ci: 8, per: 48 };
    GG.ui.slider(f.controls, { label: 'Preferred carveout', min: 0, max: CARVE.length - 1, value: st.ci, format: (i) => CARVE[i] + ' KiB', onInput: (v) => { st.ci = v; update(); } });
    GG.ui.slider(f.controls, { label: 'Shared memory per block', min: 0, max: 227, value: st.per, format: (v) => v + ' KiB', onInput: (v) => { st.per = v; update(); } });
    const sSh = GG.ui.stat(f.readouts, { label: 'shared memory', tone: 'memory' });
    const sL1 = GG.ui.stat(f.readouts, { label: 'L1 cache' });
    const sBl = GG.ui.stat(f.readouts, { label: 'blocks that fit', tone: 'core' });
    if (flowStop) {
      motionBtn(f.controls, moving, () => {
        moving = !moving;
        if (moving && flowStop.play) flowStop.play(); else if (!moving && flowStop.pause) flowStop.pause();
        return moving;
      }, 'Start or stop the loads and stores flowing in the SM drawing');
    }
    let W = 0;
    function calc() {
      const c = CARVE[st.ci], need = st.per + 1;
      const fits = need <= c;
      const fit = fits ? Math.min(32, Math.floor(c / need)) : 0;
      const fitMax = Math.min(32, Math.floor(228 / need));
      return { c, l1: 256 - c, need, fits, fit, fitMax };
    }
    function draw(w) {
      W = w;
      clear(host);
      const x = calc();
      const k = (w - 2) / 256, bh = 34, H = bh + 22;
      const svg = svgEl(host, w, H, `${x.c} KiB shared memory and ${x.l1} KiB L1 cache in one SM.`);
      const pat = S('pattern', { id: 'dsc-hatch', width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, S('defs', null, svg));
      S('rect', { width: 2.2, height: 6, fill: 'rgba(111,166,255,0.55)' }, pat);
      R(svg, 1, 0, 256 * k, bh, { rx: 6, fill: 'var(--memory-a)', stroke: 'var(--line-2)' });
      const l1Lab = [`L1 cache ${x.l1} KiB`, `L1 ${x.l1} KiB`, 'L1'].find((t) => textW(t, 10.5, svg._small) < x.l1 * k - 8);
      if (l1Lab) Tx(svg, 1 + x.c * k + (x.l1 * k) / 2, bh / 2 + 4, l1Lab, { size: 10.5, anchor: 'middle', fill: '#d3e3ff', weight: 600 });
      if (x.c > 0) R(svg, 1, 0, x.c * k, bh, { rx: 6, fill: 'rgba(111,166,255,0.2)', stroke: 'var(--memory)', sw: 1.2 });
      if (x.fits) {
        for (let b = 0; b < x.fit; b++) {
          const bw = x.need * k;
          R(svg, 1 + b * bw + 1, 3, Math.max(1, bw - 2), bh - 6, { rx: 2.5, fill: b % 2 ? 'rgba(111,166,255,0.5)' : 'rgba(111,166,255,0.75)' });
          // the 1 KiB the driver reserves for this block, at the end of its slice
          const rs = R(svg, 1 + (b + 1) * bw - Math.max(1.5, k) - 1, 3, Math.max(1.5, k), bh - 6, { rx: 0.5, fill: '#3b4157' });
          S('title', null, rs).textContent = 'block ' + b + ': 1 KiB reserved by the driver';
          if (bw >= 34) Tx(svg, 1 + b * bw + bw / 2, bh / 2 + 4, 'b' + b, { size: 9.5, anchor: 'middle', fill: '#0b1220', weight: 600 });
        }
        // the rest of the carveout: shared memory nobody uses, which the L1 cache cannot use either
        const u0 = x.fit * x.need, u1 = x.c;
        if (u1 - u0 > 0.5) {
          R(svg, 1 + u0 * k + 1, 3, (u1 - u0) * k - 2, bh - 6, { rx: 2.5, fill: 'url(#dsc-hatch)', stroke: 'var(--memory)', sw: 0.8, dash: '3 2' });
          if ((u1 - u0) * k > 70) Tx(svg, 1 + ((u0 + u1) / 2) * k, bh / 2 + 4, (u1 - u0) * k > 120 ? `unused ${u1 - u0} KiB` : 'unused', { size: 9.5, anchor: 'middle', fill: '#d3e3ff', weight: 600, halo: true });
        }
      } else {
        const bw = x.need * k;
        R(svg, 1, 3, bw, bh - 6, { rx: 2.5, fill: 'var(--danger-a)', stroke: 'var(--danger)', sw: 1.4, dash: '4 3' });
        Tx(svg, Math.min(1 + bw + 6, w - 4), bh / 2 + 4, bw + 150 < w ? `needs ${x.need} KiB` : '', { size: 10, fill: 'var(--danger)', weight: 600 });
      }
      // preferred split marker and scale
      L(svg, 1 + x.c * k, -2, 1 + x.c * k, bh + 4, { stroke: 'var(--accent)', sw: 1.6 });
      [0, 64, 128, 192, 256].forEach((v) => Tx(svg, clamp(1 + v * k, 6, w - 6), bh + 16, v === 256 ? '256 KiB' : String(v), { size: 9, anchor: v === 0 ? 'start' : v === 256 ? 'end' : 'middle', fill: 'var(--ink-3)' }));
    }
    function update() {
      const x = calc();
      sSh.set(x.c + ' KiB');
      sL1.set(x.l1 + ' KiB');
      sBl.set(x.fits ? x.fit : 'up to ' + x.fitMax, x.fits ? 'core' : 'control');
      if (W) draw(W);
      let w = `With a preferred ${x.c} KiB of shared memory, the remaining ${x.l1} KiB of the same SRAM works as an ordinary L1 cache. `;
      const blk = st.per === 0 ? 'Even a block that declares no shared memory has 1 KiB reserved for it by the system, so it takes 1 KiB' : `Each block needs ${st.per} KiB plus the 1 KiB the system reserves, ${x.need} KiB in all`;
      const unused = x.fits ? x.c - x.fit * x.need : 0;
      if (x.fits) w += `${blk}: <b>${x.fit}</b> fit at a time${x.fit === 32 ? ', the per-SM maximum of 32 blocks' : ''}${unused > 0 ? `, leaving ${unused} KiB of the carveout unused (hatched)` : ''}. Shared memory is a budget, like registers, that limits how many blocks share an SM.`;
      else w += `${blk}, more than the preferred split. The carveout is only a hint, so the driver overrides it and chooses a larger split to run the kernel; even at the maximum of 228 KiB, <b>up to ${x.fitMax}</b> such block${x.fitMax === 1 ? '' : 's'} can fit.`;
      f.setWhy(w);
    }
    onWidth(host, (w) => draw(w));
    update();
  }

  GG.entry('shared-memory', {
    render(body, ctx) {
      body.classList.add('dsc-body');
      const s = ctx.html(body, `
<p><strong>Shared memory</strong> is the level of the ${T('memory-hierarchy', 'memory hierarchy')} corresponding to the ${T('thread-block', 'thread block')} level of the ${T('thread-hierarchy', 'thread hierarchy')} in the ${T('cuda-programming-model', 'CUDA programming model')}. Every block gets its own shared memory when it starts; all of the block’s ${T('thread', 'threads')} can read and write it, no thread outside the block can see it, and it disappears when the block finishes.</p>
<div data-slot="map" class="wide"></div>
<p>It is generally expected to be <strong>much smaller but much faster</strong>, in both throughput and latency, than the ${T('global-memory', 'global memory')}. Fig. 2 puts numbers on all three for a Hopper GPU: capacity, throughput (bandwidth) and latency.</p>
<div data-slot="sf" class="wide"></div>
${GG.noteHTML('check', '<p><b>Not 100×, any more.</b> A widely quoted rule of thumb, from NVIDIA’s 2013 article “Using Shared Memory in CUDA C/C++”, says shared memory latency is roughly 100× lower than uncached global memory latency. That article was written about GPUs of compute capability 1.x to 3.x (up to Kepler). Microbenchmarks of Hopper (<a href="' + LUO24 + '">Luo et al., 2024</a>) measure 29.0 cycles for a shared memory load and 478.8 cycles for a global memory load that goes to DRAM, so on an H100-class GPU the gap is about 478.8 ÷ 29.0 ≈ 17×. The same authors’ expanded study (<a href="https://arxiv.org/abs/2501.12084">Luo et al., 2025</a>), with a different pointer-chase setup, reports 656 cycles for global memory, about 23×. Either way the gap is 17 to 23×, not 100. Fig. 2 draws the 2024 numbers, which the ' + T('gpu-ram', 'GPU RAM') + ' entry also uses; its note sets the same load against the L1 cache.</p>')}

<h3>The shape of a typical kernel</h3>
<p>Small and fast suggests a way of working, and a fairly typical ${T('kernel', 'kernel')} therefore looks something like this:</p>
<ol>
<li><b>load</b> data from ${T('global-memory', 'global memory')} into shared memory;</li>
<li><b>compute</b>: perform a number of arithmetic operations on that data via the ${T('cuda-core', 'CUDA Cores')} and ${T('tensor-core', 'Tensor Cores')};</li>
<li>optionally, <b>synchronize</b> ${T('thread', 'threads')} within a ${T('thread-block', 'thread block')} by means of barriers while performing those operations;</li>
<li><b>write</b> data back into ${T('global-memory', 'global memory')}, optionally preventing races across ${T('thread-block', 'thread blocks')} by means of atomics.</li>
</ol>
<p>The slow trip to global memory is made once, the fast shared copy is read many times. Fig. 3 runs the whole recipe on a toy kernel and lets you remove the two optional safety devices to see what each one is for. Barriers protect threads <em>of one block</em> from each other; atomics protect <em>different blocks</em> from each other, because blocks cannot wait for one another (see ${T('thread-block', 'Thread Block')}). Each device also has a figure of its own: Thread Block Fig. 2 isolates the barrier, and ${T('global-memory', 'Global Memory')} Fig. 3 the atomic.</p>
<div data-slot="recipe" class="wide"></div>
${GG.noteHTML('intuition', '<p>Think of global memory as a warehouse across town and shared memory as the workbench in one workshop. A crew (a block) fetches what it needs in one trip, works at the bench as long as it can, calls “everyone stop” (a barrier) whenever someone needs a part a teammate is still shaping, and ships the result back. Other crews have their own benches and cannot see this one; if two crews add to the same tally at the warehouse, they had better each add in one indivisible stroke that no one can interrupt (an atomic), or one crew’s addition will overwrite the other’s.</p>')}
${GG.noteHTML('beyond', '<p><b>Why “many reads” matters.</b> The payoff of the recipe is ' + T('arithmetic-intensity', 'arithmetic intensity') + ': the more operations a kernel performs per byte fetched from global memory, the less it is limited by ' + T('memory-bandwidth', 'memory bandwidth') + '. The Memory Hierarchy entry shows how a tile in shared memory, reused by T threads, cuts global loads T-fold. Shared memory has its own trap, ' + T('bank-conflict', 'bank conflicts') + ', when several threads of a warp access different addresses in the same one of its 32 banks at once (threads that read the same 32-bit word get it by broadcast, without a conflict).</p>')}

<h3>Where it lives</h3>
<p>Shared memory is stored in the ${T('l1-data-cache', 'L1 data cache')} of the GPU’s ${T('streaming-multiprocessor', 'Streaming Multiprocessor (SM)')}. That is why a block must run on one SM: its shared memory is a physical piece of that SM. It is also why shared memory is fast: it is on-chip SRAM (static RAM, the fast kind of memory that caches are built from), a short hop from the ${T('load-store-unit', 'Load/Store Units')}, while global memory is off-chip DRAM.</p>
<div data-slot="carve" class="wide"></div>
${GG.noteHTML('beyond', '<p><b>Getting data in.</b> Step 1 of the recipe is usually written as ordinary loads and stores, as in Fig. 3. Since Ampere, <code>cp.async</code> copies from global to shared memory without passing through registers, and Hopper’s ' + T('tensor-memory-accelerator', 'Tensor Memory Accelerator') + ' copies whole tiles in the background while the threads compute. In CUDA C++, a static shared array is declared with <code>__shared__</code>; more than 48 KiB per block requires dynamic shared memory and an explicit opt-in (<code>cudaFuncSetAttribute</code>).</p>')}
<div data-slot="read"></div>`);

      guard(s.map, 'Programming model map', () => {
        const WHY = {
          shared: 'Lit: <b>shared memory</b>, the memory of one thread block, and the SM’s <b>L1 data cache</b> that holds it.',
          both: 'Lit: the <b>thread block</b> with its <b>shared memory</b> (left, centre), and the <b>SM</b> it runs on, whose <b>L1 data cache</b> holds that shared memory (right).',
        };
        const m = mapFig(s.map, ctx, {
          title: 'Shared memory in the CUDA programming model',
          highlight: ['shared'],
          caption: 'Redrawn after the glossary’s figure, itself modified from NVIDIA’s CUDA Refresher and CUDA C++ Programming Guide. Shared memory is the abstract memory associated with the thread block level (left, centre) of the CUDA thread group hierarchy (left), and it is stored in the SM’s L1 data cache (right).',
          why: WHY.shared,
        });
        GG.ui.seg(m.f.controls, { label: 'Light up', value: 'shared', options: [{ value: 'shared', label: 'shared memory' }, { value: 'both', label: 'with its block' }], onChange: (v) => m.set(v === 'both' ? ['block', 'shared'] : ['shared'], WHY[v]) });
        return m;
      });
      guard(s.sf, 'Size and speed figure', () => smallFastFig(s.sf, ctx));
      guard(s.recipe, 'Kernel recipe figure', () => recipeFig(s.recipe, ctx));
      guard(s.carve, 'Carveout figure', () => carveFig(s.carve, ctx));
      ctx.reading(s.read, [REFRESHER, CPG,
        { href: CPG124 + '#shared-memory', label: 'CUDA C++ Programming Guide 12.4 (archived): Shared Memory', note: 'beyond the glossary: a worked tiled matrix multiplication' },
        CPG_LIMITS,
        { href: LUO24, label: 'Luo, Fan, Li, Du, Wang and Chu, “Benchmarking and Dissecting the Nvidia Hopper GPU Architecture” (2024)', note: 'beyond the glossary: the measured latencies drawn in Fig. 2 (Table IV)' },
        { href: 'https://arxiv.org/abs/2501.12084', label: 'Luo et al., “Dissecting the NVIDIA Hopper Architecture through Microbenchmarking and Multiple Level Analysis” (2025)', note: 'beyond the glossary: the same group’s expanded study, which measures 656 cycles for global memory' },
        { href: 'https://developer.nvidia.com/blog/using-shared-memory-cuda-cc/', label: 'NVIDIA: Using Shared Memory in CUDA C/C++ (2013)', note: 'beyond the glossary: the older “roughly 100× lower latency” rule of thumb, written for Kepler-era GPUs' },
      ]);
    },
  });


  /* ═════════════════════════════ Global Memory ═════════════════════════════ */

  GG.css(`
.dsc-gm-alloc { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; align-items: start; }
@media (min-width: 900px) { .dsc-gm-alloc { grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr); } }
.dsc-gm-alloc .code { margin: 0; }
.dsc-kw { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; align-items: start; }
@media (min-width: 900px) { .dsc-kw { grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr); } }
.dsc-kw .code { margin: 0; }
.dsc-kw .code pre { font-size: 12px; }
`);

  /* Fig: global in scope and lifetime */
  function lifetimeFig(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Global in scope and in lifetime',
      hint: 'drag the time cursor',
      wide: true,
      caption: 'One program, from start to exit. The host allocates a buffer <code>x</code> in global memory, copies data in, launches two kernels one after the other, copies the result out and frees the buffer. Dotted ticks are accesses to <code>x</code>: lavender for the host’s copies, blue for the kernels’ threads (bright while the cursor is on them). Each kernel’s grid runs as blocks that come and go on the SMs (here up to three at a time); a block’s shared memory and its threads’ registers exist only while that block runs. The buffer outlives all of them.',
    });
    const host = el('div', { class: 'dsc-w' });
    f.stage.append(host);
    legend(host.parentNode, [['dsc-sw-host', 'host (CPU) action'], ['dsc-sw-memory', 'global memory buffer x'], ['dsc-sw-core', 'a kernel’s grid running'], ['dsc-sw-memory-a', 'one block’s shared memory and registers']]);
    const EV = [
      { t: 3, name: 'cudaMalloc(&x)', short: 'cudaMalloc' },
      { t: 7, t1: 15, name: 'copy in', short: 'copy in' },
      { t: 19, t1: 43, name: 'kernel A<<<6, …>>>(x)', short: 'kernel A', k: 'A' },
      { t: 51, t1: 75, name: 'kernel B<<<6, …>>>(x)', short: 'kernel B', k: 'B' },
      { t: 79, t1: 87, name: 'copy out', short: 'copy out' },
      { t: 92, name: 'cudaFree(x)', short: 'cudaFree' },
    ];
    // blocks: 6 per kernel on 3 SMs, two waves with slightly different durations
    const DUR = { A: [10.5, 11.5, 11], B: [11, 10.5, 11.5] };
    const BLOCKS = [];
    ['A', 'B'].forEach((k) => {
      const e = EV.find((x) => x.k === k);
      for (let lane = 0; lane < 3; lane++) {
        const d = DUR[k][lane];
        BLOCKS.push({ k, b: lane, lane, s: e.t + 0.5, e: e.t + 0.5 + d });
        BLOCKS.push({ k, b: lane + 3, lane, s: e.t + 1 + d, e: Math.min(e.t1 - 0.5, e.t + 1 + 2 * d) });
      }
    });
    const st = { t: 47 };
    GG.ui.slider(f.controls, { label: 'Time', min: 0, max: 100, value: st.t, format: (v) => phaseName(v), onInput: (v) => { st.t = v; update(); } });
    const sG = GG.ui.stat(f.readouts, { label: 'global memory x', tone: 'memory' });
    const sS = GG.ui.stat(f.readouts, { label: 'blocks alive (shared mem)' });
    const sWho = GG.ui.stat(f.readouts, { label: 'who can reach x' });
    function phaseName(t) {
      if (t < 3) return 'before allocation';
      for (let i = EV.length - 1; i >= 0; i--) {
        const e = EV[i];
        if (e.t1 != null && t >= e.t && t <= e.t1) return e.short;
      }
      if (t >= 92) return 'after cudaFree';
      if (t > 43 && t < 51) return 'between kernels';
      return 'host code';
    }
    let W = 0, svg = null, cursor = null, curT = null;
    function draw(w) {
      W = w;
      clear(host);
      const lab = w >= 600 ? 132 : 70, x0 = lab, x1 = w - 8;
      const X = (t) => x0 + ((x1 - x0) * t) / 100;
      const rows = { host: 22, glob: 70, grid: 108, lanes: 138 };
      const H = rows.lanes + 3 * 18 + 30;
      svg = svgEl(host, w, H, 'Timeline of a program: global memory lives from cudaMalloc to cudaFree, blocks and their shared memory live only while they run.');
      const narrow = w < 600;
      Tx(svg, 0, rows.host + 4, narrow ? 'host' : 'host (CPU)', { size: 10, fill: 'var(--host)' });
      Tx(svg, 0, rows.glob + 4, narrow ? 'global x' : 'global memory x', { size: 10, fill: 'var(--memory)' });
      Tx(svg, 0, rows.grid + 4, narrow ? 'grids' : 'kernel grids', { size: 10, fill: 'var(--core)' });
      Tx(svg, 0, rows.lanes + 14, narrow ? 'blocks' : 'blocks on SMs', { size: 10, fill: '#bcd3ff' });
      if (!narrow) Tx(svg, 0, rows.lanes + 28, '(shared + regs)', { size: 9, fill: 'var(--ink-3)' });
      L(svg, x0, rows.host, x1, rows.host, { stroke: 'var(--line-2)' });
      EV.forEach((e, i) => {
        if (e.t1 == null) {
          S('circle', { cx: X(e.t), cy: rows.host, r: 4, fill: 'var(--host)' }, svg);
          Tx(svg, X(e.t) + (i === 0 ? -4 : 4), rows.host + 16, narrow ? e.short : e.name, { size: 9, anchor: i === 0 ? 'start' : 'end', fill: 'var(--host)' });
        } else {
          R(svg, X(e.t), rows.host - 5, X(e.t1) - X(e.t), 10, { rx: 3, fill: e.k ? 'rgba(181,160,255,0.18)' : 'rgba(181,160,255,0.35)', stroke: 'var(--host)', sw: 0.8 });
          const label = narrow ? (e.k ? e.k : e.short.replace('copy ', '')) : e.name;
          Tx(svg, (X(e.t) + X(e.t1)) / 2, rows.host - 9, label, { size: 9, anchor: 'middle', fill: 'var(--host)' });
        }
      });
      // the host's copies fill and drain x: lavender ticks between the copy bars and the buffer
      EV.filter((e) => !e.k && e.t1 != null).forEach((e) => {
        const g = S('g', { class: 'dsc-copy', 'data-t0': e.t, 'data-t1': e.t1 }, svg);
        const into = e.short === 'copy in';
        for (let u = 0; u < 3; u++) {
          const tx = X(e.t + 1.5 + u * ((e.t1 - e.t - 3) / 2));
          const y1 = rows.host + 6, y2 = rows.glob - 11;
          L(g, tx, y1, tx, y2, { stroke: 'var(--host)', sw: 1.1, dash: '2 2' });
          const ty = into ? y2 : y1, d = into ? -4 : 4;
          P(g, `M${r2(tx - 3)} ${r2(ty + d)}L${r2(tx)} ${r2(ty)}L${r2(tx + 3)} ${r2(ty + d)}`, { stroke: 'var(--host)', sw: 1.1 });
        }
      });
      // global buffer
      R(svg, X(3), rows.glob - 10, X(92) - X(3), 20, { rx: 4, fill: 'var(--memory-a)', stroke: 'var(--memory)', sw: 1.2 });
      Tx(svg, X(3) + 8, rows.glob + 4, narrow ? 'x' : 'x lives here the whole time', { size: 9.5, fill: '#d3e3ff' });
      // grids
      EV.filter((e) => e.k).forEach((e) => {
        R(svg, X(e.t), rows.grid - 9, X(e.t1) - X(e.t), 18, { rx: 4, fill: 'var(--core-a)', stroke: 'var(--core)' });
        Tx(svg, (X(e.t) + X(e.t1)) / 2, rows.grid + 4, narrow ? e.k : 'grid of kernel ' + e.k, { size: 9.5, anchor: 'middle', fill: 'var(--core)' });
        // reads/writes of x: small ticks between grid and buffer
        const kg = S('g', { class: 'dsc-copy', 'data-t0': e.t, 'data-t1': e.t1 }, svg);
        for (let u = 0; u < 5; u++) { const tx = X(e.t + 3 + u * 5); L(kg, tx, rows.glob + 11, tx, rows.grid - 10, { stroke: 'var(--memory)', sw: 1, dash: '2 2' }); }
      });
      BLOCKS.forEach((b) => {
        const y = rows.lanes + b.lane * 18;
        R(svg, X(b.s), y, X(b.e) - X(b.s), 14, { rx: 3, fill: 'rgba(111,166,255,0.16)', stroke: 'rgba(111,166,255,0.6)', sw: 0.8, cls: 'dsc-blk' });
        if (X(b.e) - X(b.s) > 34) Tx(svg, (X(b.s) + X(b.e)) / 2, y + 10.5, `${b.k}${b.b}`, { size: 8.5, anchor: 'middle', fill: '#d3e3ff' });
      });
      cursor = L(svg, X(st.t), 6, X(st.t), H - 16, { stroke: 'var(--accent)', sw: 1.6 });
      curT = Tx(svg, X(st.t), H - 4, '', { size: 9.5, anchor: 'middle', fill: 'var(--accent)' });
      svg._X = X;
      paintCursor();
    }
    function paintCursor() {
      if (!svg) return;
      const X = svg._X, x = X(st.t);
      cursor.setAttribute('x1', r2(x)); cursor.setAttribute('x2', r2(x));
      curT.setAttribute('x', r2(clamp(x, 60, W - 60)));
      curT.textContent = phaseName(st.t);
      svg.querySelectorAll('.dsc-copy').forEach((g) => {
        const on = st.t >= +g.getAttribute('data-t0') && st.t <= +g.getAttribute('data-t1');
        g.setAttribute('opacity', on ? 1 : 0.35);
      });
      svg.querySelectorAll('.dsc-blk').forEach((r, i) => {
        const b = BLOCKS[i];
        const on = st.t >= b.s && st.t <= b.e;
        r.setAttribute('fill', on ? 'rgba(111,166,255,0.5)' : 'rgba(111,166,255,0.12)');
      });
    }
    function update() {
      const t = st.t;
      const alive = t >= 3 && t < 92;
      const live = BLOCKS.filter((b) => t >= b.s && t <= b.e);
      const kern = EV.find((e) => e.k && t >= e.t && t <= e.t1);
      sG.set(alive ? 'allocated' : t < 3 ? 'not yet' : 'freed', alive ? 'memory' : null);
      sS.set(live.length ? live.map((b) => b.k + b.b).join(', ') : 'none', live.length ? 'memory' : null);
      sWho.set(!alive ? 'nobody' : kern ? 'every thread of grid ' + kern.k : 'host, via copies', alive ? 'core' : null);
      if (W) paintCursor();
      let w;
      if (t < 3) w = 'The program has started but nothing is allocated yet: no global memory buffer exists.';
      else if (t >= 92) w = '<code>cudaFree(x)</code> has released the buffer. Its lifetime, from allocation to here, spanned both kernels and every block of them.';
      else if (kern) w = `Kernel ${kern.k} is running. <b>Every thread of its grid</b>, in every block, on every SM, can read and write <code>x</code>. Right now ${live.length ? 'blocks ' + live.map((b) => b.k + b.b).join(', ') + ' are' : 'no blocks are'} alive, each with its own shared memory, which vanishes when the block ends${kern.k === 'B' ? '. Kernel B finds kernel A’s results waiting in x' : ''}.`;
      else if (t > 43 && t < 51) w = 'Between the two kernels. No thread exists, so there are no registers and no shared memory anywhere, but <b>x still holds kernel A’s results</b>: global memory is how one kernel hands data to the next.';
      else if (t >= 7 && t <= 15) w = 'The host copies input data from CPU memory into <code>x</code> (the lavender arrows down into the buffer). The host cannot read or write global memory directly in this model; it copies to and from it.';
      else if (t >= 79 && t <= 87) w = 'The host copies the final results out of <code>x</code> into CPU memory (the lavender arrows up out of the buffer).';
      else w = `${t < 7 ? '<code>cudaMalloc</code> has just reserved x in GPU RAM. ' : ''}The host is running ordinary code. The buffer x exists, untouched, waiting for the next kernel or copy.`;
      f.setWhy(w);
    }
    onWidth(host, (w) => draw(w));
    update();
  }

  /* Fig: many threads update one counter, with and without atomics */
  function atomicFig(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'One counter, many threads, with and without atomics',
      hint: 'switch the update · change the thread count · new timing',
      wide: true,
      caption: 'The staircase on top is the counter’s value in global memory over time: each counted increment steps it up; a stale store leaves it flat or pushes it back down. Each row below is one thread, from several blocks (shaded), adding 1 to that single counter. A plain <code>*count += 1</code> is three steps: load the value, add, store it back; the bar runs from the load to the store. A thread whose store overwrites a value that already included another thread’s +1 erases it, and that increment is lost (red). <code>atomicAdd</code> does the read, add and write as one indivisible step at one instant (dot), so nothing is lost, in any order. Timings are random but the arithmetic is exact.',
    });
    const wrap = el('div', { class: 'dsc-w' });
    f.stage.append(wrap);
    const top = el('div', { class: 'dsc-ord-top' });
    const code = el('div', { class: 'dsc-formula' });
    const status = el('span', { class: 'dsc-status' });
    top.append(code, status);
    wrap.append(top);
    const host = el('div');
    wrap.append(host);
    legend(wrap, [['dsc-sw-memory', 'increment counted (it reached the counter)'], ['dsc-sw-danger', 'increment lost (overwritten)']]);
    const st = { mode: 'plain', n: 16, seed: 11 };
    GG.ui.seg(f.controls, { label: 'Each thread does', value: 'plain', options: [{ value: 'plain', label: '*count += 1' }, { value: 'atomic', label: 'atomicAdd(count, 1)' }], onChange: (v) => { st.mode = v; update(); } });
    GG.ui.slider(f.controls, { label: 'Threads', min: 4, max: 64, value: st.n, onInput: (v) => { st.n = v; update(); } });
    GG.ui.button(f.controls, { label: 'New timing', icon: 'reset', onClick: () => { st.seed = (st.seed * 1103515245 + 12345) % 2147483647; update(); } });
    const sFinal = GG.ui.stat(f.readouts, { label: 'final count', tone: 'memory' });
    const sExp = GG.ui.stat(f.readouts, { label: 'expected' });
    const sLost = GG.ui.stat(f.readouts, { label: 'lost' });
    function sim() {
      const r = rng(st.seed);
      const T = 100, d = 9;
      const th = range(st.n).map((i) => { const t0 = r() * (T - d); return { i, blk: Math.floor(i / 8), r: t0, w: t0 + d * (0.6 + 0.8 * r()), a: t0 + d / 2 }; });
      if (st.mode === 'atomic') {
        const ev = th.slice().sort((a, b) => a.a - b.a);
        ev.forEach((x, k) => { x.saw = k; x.lost = false; });
        return { th, final: st.n, T };
      }
      const evs = [];
      th.forEach((x) => { evs.push({ t: x.r, x, kind: 'r' }); evs.push({ t: x.w, x, kind: 'w' }); });
      evs.sort((a, b) => a.t - b.t || (a.kind === 'w' ? -1 : 1));
      let val = 0, set = new Set();
      for (const e of evs) {
        if (e.kind === 'r') { e.x.saw = val; e.x.seen = new Set(set); }
        else { val = e.x.saw + 1; set = new Set(e.x.seen); set.add(e.x.i); }
      }
      th.forEach((x) => { x.lost = !set.has(x.i); });
      return { th, final: val, T };
    }
    let W = 0;
    function draw(w, R0) {
      clear(host);
      const small = w < 480;
      const lab = small ? 54 : 44, rowH = st.n > 40 ? 6 : st.n > 24 ? 9 : 13, stH = 64, top = 16 + stH + 14;
      const H = top + st.n * rowH + 22;
      const svg = svgEl(host, w, H, `${st.n} threads incrementing one counter, ${R0.final} increments survive.`);
      const X = (t) => lab + ((w - lab - 8) * t) / R0.T;
      Tx(svg, lab, 10, 'time →', { size: 9.5, fill: 'var(--ink-3)' });
      // the counter's value over time
      const sy0 = 16, Y = (v) => sy0 + stH - (stH * v) / st.n;
      R(svg, lab, sy0, w - lab - 8, stH, { rx: 3, fill: 'rgba(111,166,255,0.04)', stroke: 'var(--line)' });
      L(svg, lab, Y(st.n), w - 8, Y(st.n), { stroke: 'var(--ink-2)', sw: 1, dash: '3 3', opacity: 0.6 });
      Tx(svg, lab - 6, Y(st.n) + 3.5, String(st.n), { size: 9, anchor: 'end', fill: 'var(--ink-2)' });
      Tx(svg, lab - 6, Y(0) + 3.5, '0', { size: 9, anchor: 'end', fill: 'var(--ink-3)' });
      Tx(svg, lab + 6, sy0 + 12, 'counter in global memory', { size: 9, fill: '#d3e3ff' });
      const evs = (st.mode === 'atomic' ? R0.th.map((x) => ({ t: x.a, v: x.saw + 1, lost: false })) : R0.th.map((x) => ({ t: x.w, v: x.saw + 1, lost: x.lost }))).sort((a, b) => a.t - b.t);
      let d = `M${r2(X(0))} ${r2(Y(0))}`, v = 0;
      const drops = [];
      for (const e of evs) { d += `H${r2(X(e.t))}V${r2(Y(e.v))}`; if (e.v <= v) drops.push(e); v = e.v; }
      d += `H${r2(X(R0.T))}`;
      P(svg, d, { stroke: 'var(--memory)', sw: 1.6 });
      drops.forEach((e) => S('circle', { cx: r2(X(e.t)), cy: r2(Y(e.v)), r: 3, fill: 'var(--danger)' }, svg));
      const shades = ['rgba(255,255,255,0.035)', 'rgba(255,255,255,0.0)'];
      R0.th.forEach((x) => {
        const y = top + x.i * rowH;
        R(svg, lab, y, w - lab - 8, rowH - 1, { rx: 1, fill: shades[x.blk % 2] });
        if (x.i % 8 === 0) Tx(svg, lab - 6, y + Math.min(rowH, 10) - 1, 'block ' + x.blk, { size: 9, anchor: 'end', fill: 'var(--ink-3)' });
        const col = x.lost ? 'var(--danger)' : 'var(--memory)';
        if (st.mode === 'atomic') {
          S('circle', { cx: r2(X(x.a)), cy: r2(y + (rowH - 1) / 2), r: Math.max(2, Math.min(4.5, rowH / 2 - 0.5)), fill: col }, svg);
        } else {
          R(svg, X(x.r), y + 1, X(x.w) - X(x.r), Math.max(2, rowH - 3), { rx: 2, fill: x.lost ? 'var(--danger-a)' : 'var(--memory-a)', stroke: col, sw: 0.8 });
          if (rowH >= 13) {
            const txt = w < 600 ? `${x.saw}→${x.saw + 1}` : `read ${x.saw}, wrote ${x.saw + 1}`;
            const tw = textW(txt, 8.5, small);
            const right = X(x.w) + 4 + tw <= w - 4, left = X(x.r) - 4 - tw >= lab;
            if (right || left) Tx(svg, right ? X(x.w) + 4 : X(x.r) - 4, y + rowH - 3.5, txt, { size: 8.5, anchor: right ? 'start' : 'end', fill: x.lost ? 'var(--danger)' : 'var(--ink-3)' });
          }
        }
      });
      Tx(svg, w - 8, H - 6, `counter after all threads: ${R0.final}`, { size: 10, anchor: 'end', weight: 600, fill: R0.final === st.n ? 'var(--ink)' : 'var(--danger)' });
    }
    function update() {
      const R0 = sim();
      const lost = st.n - R0.final;
      code.innerHTML = st.mode === 'plain'
        ? '<span class="d">each thread:</span> <span class="r">*count += 1</span>; <span class="d">// load, add 1, store</span>'
        : '<span class="d">each thread:</span> <b>atomicAdd(count, 1)</b>; <span class="d">// one indivisible step</span>';
      const luck = !lost && st.mode === 'plain';
      status.className = 'dsc-status ' + (lost ? 'bad' : luck ? 'wait' : 'ok');
      status.textContent = lost ? `${lost} increment${lost > 1 ? 's' : ''} lost` : luck ? 'right by luck' : 'every increment counted';
      sFinal.set(R0.final, lost ? 'danger' : 'memory');
      sExp.set(st.n);
      sLost.set(lost, lost ? 'danger' : null);
      W = host.getBoundingClientRect().width || W;
      if (W) draw(W, R0);
      f.setWhy(st.mode === 'plain'
        ? (lost ? `${st.n} threads each added 1, but the counter ends at <b>${R0.final}</b>. Whenever two threads’ load-to-store windows overlap, both read the same old value and the later store wipes out the earlier one. Blocks run in no guaranteed order, so the damage changes with every run: try New timing.` : `This time no windows overlapped, so the count is right, by luck. Try more threads or New timing: nothing in the programming model prevents the overlap.`)
        : `With <code>atomicAdd</code>, the hardware performs each read-add-write as one indivisible operation on the counter in global memory. The ${st.n} updates happen in some order, a different one each run, and the counter always ends at <b>${st.n}</b>.`);
    }
    onWidth(host, (w) => { W = w; update(); });
    update();
  }

  /* Fig: allocated from the host through the Runtime API or the Driver API */
  function allocFig(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Global memory is allocated from the host',
      hint: 'choose an API · send the call',
      wide: true,
      caption: 'The CUDA Toolkit stack (as in the CUDA Software Platform entry). A host program asks for global memory through the CUDA Runtime API’s <code>cudaMalloc</code>, which calls into the CUDA Driver API, or calls the Driver API’s <code>cuMemAlloc</code> directly; the driver reserves the space in the GPU’s RAM and hands back a device address.',
    });
    const grid = el('div', { class: 'dsc-gm-alloc' });
    f.stage.append(grid);
    const left = el('div'), right = el('div');
    grid.append(left, right);
    if (!GG.components.toolkit) { left.innerHTML = '<p class="c-dim">The toolkit diagram is unavailable.</p>'; }
    const tk = GG.components.toolkit ? GG.components.toolkit(left, { files: true, caption: false, highlight: ['apps', 'runtime', 'driver-api', 'driver', 'gpu'] }) : null;
    const CODE = {
      runtime: { lang: 'cuda', cap: 'CUDA Runtime API', code: `float* x;
// reserve n floats of global memory
cudaMalloc(&x, n * sizeof(float));
// ... launch kernels that use x ...
cudaFree(x);` },
      driver: { lang: 'cuda', cap: 'CUDA Driver API', code: `CUdeviceptr x;
// the same, one layer lower
cuMemAlloc(&x, n * sizeof(float));
// ... launch kernels that use x ...
cuMemFree(x);` },
    };
    const st = { api: 'runtime' };
    function show() {
      clear(right);
      const c = CODE[st.api];
      ctx.code(right, { lang: c.lang, code: c.code, caption: c.cap, lineNumbers: false });
      right.append(el('p', { class: 'dsc-spill-note', html: st.api === 'runtime' ? '<code>cudaMalloc</code> writes a device address into <code>x</code>. The host can pass it to kernels and copy functions, but must not dereference it: the memory is on the GPU.' : '<code>CUdeviceptr</code> is an integer type that holds a device address. The Runtime API is built on these Driver API calls.' }));
      f.setWhy(st.api === 'runtime'
        ? `Most programs allocate with ${T('cuda-runtime-api', 'CUDA Runtime API')} calls like <code>cudaMalloc</code>; the runtime passes the request down to the ${T('cuda-driver-api', 'CUDA Driver API')} and the ${T('nvidia-gpu-drivers', 'GPU driver')}, which carve out the space in ${T('gpu-ram', 'GPU RAM')}.`
        : `Programs that use the ${T('cuda-driver-api', 'CUDA Driver API')} directly call <code>cuMemAlloc</code>, skipping the runtime layer. Either way the memory is reserved in ${T('gpu-ram', 'GPU RAM')} and is global memory to every kernel the program launches.`);
    }
    function send() {
      if (!tk) return;
      if (st.api === 'runtime') tk.call('app-runtime-driver-gpu', { tags: { apps: 'cudaMalloc(&x, …)', runtime: 'cudaMalloc', 'driver-api': 'cuMemAlloc', driver: 'reserve memory', gpu: 'x in GPU RAM' } });
      else tk.call('app-driver-gpu', { tags: { apps: 'cuMemAlloc(&x, …)', 'driver-api': 'cuMemAlloc', driver: 'reserve memory', gpu: 'x in GPU RAM' } });
    }
    GG.ui.seg(f.controls, { label: 'Allocate with', value: 'runtime', options: [{ value: 'runtime', label: 'Runtime API' }, { value: 'driver', label: 'Driver API' }], onChange: (v) => { st.api = v; if (tk) tk.showPath(v === 'runtime' ? 'app-runtime-driver-gpu' : 'app-driver-gpu'); show(); } });
    GG.ui.button(f.controls, { label: 'Send the call', icon: 'play', onClick: send });
    if (tk) tk.showPath('app-runtime-driver-gpu');
    show();
    GG.decorate(f.root);
  }

  const SCALE_SRC = `__global__ void scale(float* x, float a, int n) {
  int i = blockIdx.x * blockDim.x + threadIdx.x;
  if (i < n) x[i] = a * x[i];
}

int main() {
  int n = 1 << 20;
  float* x;
  cudaMalloc(&x, n * sizeof(float));
  scale<<<n / 256, 256>>>(x, 2.0f, n);
  cudaDeviceSynchronize();
  cudaFree(x);
}`;

  /* Fig: two meanings of "global" */
  function keywordFig(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Two different things called “global”',
      hint: 'pick a meaning · hover the code',
      wide: true,
      caption: 'A complete little CUDA C++ program. <code>__global__</code> marks <code>scale</code> as a kernel: a function the host launches and the device runs. Global memory is where <code>x</code> points: GPU RAM, allocated with <code>cudaMalloc</code>. The two meanings are unrelated, which is the trouble.',
    });
    const grid = el('div', { class: 'dsc-kw' });
    f.stage.append(grid);
    const left = el('div'), right = el('div', { class: 'dsc-w' });
    grid.append(left, right);
    const cd = ctx.code(left, { lang: 'cuda', code: SCALE_SRC, caption: 'scale.cu',
      notes: {
        1: '<b>The keyword.</b> <code>__global__</code> says: this function is a kernel. It is <em>called</em> from the host and <em>runs</em> on the device. It says nothing about memory.',
        2: 'Each thread computes its own index, as in every SIMT kernel.',
        3: '<b>The memory.</b> <code>x[i]</code> reads and writes global memory: <code>x</code> points into GPU RAM, and every thread of the grid can reach it.',
        9: '<b>The memory.</b> <code>cudaMalloc</code> allocates <code>n</code> floats of global memory and stores their device address in <code>x</code>.',
        10: '<b>The keyword at work.</b> The host launches the <code>__global__</code> function with the triple chevrons: 4,096 blocks of 256 threads, one thread per element.',
        11: 'The host waits for the kernel to finish.',
        12: '<b>The memory.</b> Global memory lives until it is freed (or the program ends).',
      },
      noteDefault: 'Hover or tap a marked line.' });
    const st = { m: 'kw' };
    GG.ui.seg(f.controls, { label: 'Show', value: 'kw', options: [{ value: 'kw', label: '__global__ (keyword)' }, { value: 'mem', label: 'global memory' }, { value: 'both', label: 'both' }], onChange: (v) => { st.m = v; paint(); } });
    let W = 0;
    function drawPic(w) {
      W = w;
      clear(right);
      const H = 250;
      const svg = svgEl(right, w, H, 'Host and device: the __global__ function is launched by the host and runs on the device; global memory sits in GPU RAM.');
      const kw = st.m !== 'mem', mem = st.m !== 'kw';
      // host
      R(svg, 0, 0, w, 72, { rx: 8, fill: 'rgba(181,160,255,0.08)', stroke: 'var(--host)' });
      Tx(svg, 10, 16, 'HOST · CPU', { size: 9.5, fill: 'var(--host)', ls: '0.1em' });
      R(svg, 10, 26, w * 0.52, 34, { rx: 5, fill: kw ? 'rgba(255,198,92,0.16)' : 'rgba(255,255,255,0.03)', stroke: kw ? 'var(--control)' : 'var(--line-2)' });
      Tx(svg, 18, 47, 'main(): scale<<<…>>>(x, …)', { size: 10, fill: kw ? '#ffe2a8' : 'var(--ink-3)' });
      R(svg, w * 0.52 + 20, 26, w * 0.48 - 30, 34, { rx: 5, fill: 'rgba(255,255,255,0.03)', stroke: mem ? 'var(--memory)' : 'var(--line-2)', dash: '3 3' });
      Tx(svg, w * 0.52 + 28, 41, 'x = 0x7f…', { size: 10, fill: mem ? '#d3e3ff' : 'var(--ink-3)' });
      Tx(svg, w * 0.52 + 28, 54, 'a device address', { size: 8.5, fill: 'var(--ink-3)' });
      // device
      R(svg, 0, 100, w, 150, { rx: 8, fill: 'rgba(69,212,155,0.04)', stroke: 'var(--line-2)' });
      Tx(svg, 10, 116, 'DEVICE · GPU', { size: 9.5, fill: 'var(--core)', ls: '0.1em' });
      R(svg, 10, 126, w - 20, 44, { rx: 5, fill: kw ? 'rgba(69,212,155,0.14)' : 'rgba(255,255,255,0.03)', stroke: kw ? 'var(--core)' : 'var(--line-2)' });
      Tx(svg, 18, 144, '__global__ scale runs here', { size: 10, fill: kw ? 'var(--core)' : 'var(--ink-3)' });
      for (let k = 0; k < Math.floor((w - 40) / 12); k++) strand(svg, 22 + k * 12, 150, 16, { amp: 1.2, wl: 6, phase: k, sw: 0.9, stroke: kw ? 'var(--core)' : 'var(--ink-3)', hw: 1.6, opacity: 0.8 });
      R(svg, 10, 186, w - 20, 52, { rx: 5, fill: mem ? 'rgba(111,166,255,0.22)' : 'rgba(255,255,255,0.03)', stroke: mem ? 'var(--memory)' : 'var(--line-2)' });
      Tx(svg, 18, 203, 'GPU RAM · global memory', { size: 10, fill: mem ? '#d3e3ff' : 'var(--ink-3)' });
      for (let k = 0; k < Math.floor((w - 40) / 14); k++) R(svg, 18 + k * 14, 212, 11, 16, { rx: 2, fill: mem ? 'var(--memory)' : 'var(--line-2)', opacity: mem ? 0.75 : 0.5 });
      if (kw) {
        const ax = Math.max(w * 0.3, 130);
        P(svg, `M${r2(ax)} 62V122`, { stroke: 'var(--control)', sw: 1.6 });
        P(svg, `M${r2(ax - 4)} 116L${r2(ax)} 123L${r2(ax + 4)} 116`, { stroke: 'var(--control)', sw: 1.6 });
        Tx(svg, ax + 8, 92, 'launch', { size: 9.5, fill: 'var(--control)' });
      }
      if (mem) {
        P(svg, `M${r2(w * 0.76)} 62V183`, { stroke: 'var(--memory)', sw: 1.4, dash: '4 3' });
        P(svg, `M${r2(w * 0.76 - 4)} 177L${r2(w * 0.76)} 184L${r2(w * 0.76 + 4)} 177`, { stroke: 'var(--memory)', sw: 1.4 });
        Tx(svg, w * 0.76 + 8, 92, 'points to', { size: 9.5, fill: 'var(--memory)' });
      }
    }
    function paint() {
      cd.clear();
      if (st.m !== 'mem') cd.highlight([1, 10], 'control');
      if (st.m !== 'kw') cd.highlight([3, 9, 12], 'memory');
      if (W) drawPic(W);
      f.setWhy(st.m === 'kw'
        ? '<code>__global__</code> annotates a function that is launched on the <b>host</b> but runs on the <b>device</b>: a ' + T('kernel', 'kernel') + '. It is a statement about <em>where code is called from and where it runs</em>.'
        : st.m === 'mem'
          ? 'Global memory is a place: the top level of the memory hierarchy, in ' + T('gpu-ram', 'GPU RAM') + ', <b>only on the device</b>. The host holds an address of it in <code>x</code>, but reaches the data only through API calls and copies.'
          : 'Both at once: the <code>__global__</code> function (amber) runs on the device and works on global memory (blue). Same word, two unrelated ideas, a few lines apart.');
    }
    onWidth(right, (w) => drawPic(w));
    paint();
  }

  GG.entry('global-memory', {
    render(body, ctx) {
      body.classList.add('dsc-body');
      const s = ctx.html(body, `
<p>As part of the ${T('cuda-programming-model', 'CUDA programming model')}, each level of the ${T('thread-hierarchy', 'thread hierarchy')} has access to matching memory from the ${T('memory-hierarchy', 'memory hierarchy')}. This memory can be used for coordination and communication, and it is managed by the programmer, not by the hardware or a runtime: the program decides what to put where, and when.</p>
<p>The highest level of that memory hierarchy is the <strong>global memory</strong>. It is the memory of the ${T('thread-block-grid', 'thread block grid')}, the top level of the thread hierarchy.</p>
<div data-slot="map" class="wide"></div>

<h3>Global in scope and in lifetime</h3>
<p>Global memory is global in two senses. In <b>scope</b>: it is accessible by every ${T('thread', 'thread')} in a ${T('thread-block-grid', 'thread block grid')}, whichever block it is in and whichever SM that block runs on. In <b>lifetime</b>: it lasts as long as the execution of the program, not just one kernel. Registers come and go with their thread, shared memory with its block; a buffer in global memory, once allocated, stays until the program frees it or exits. That is what lets one kernel leave results for the next. Drag through a program’s life in Fig. 2.</p>
<div data-slot="life" class="wide"></div>

<h3>Synchronizing access</h3>
<p>Access to data structures in the global memory can be synchronized across all accessors using atomic instructions, as with CPU memory. An atomic instruction, such as CUDA C++’s <code>atomicAdd</code>, reads a value, modifies it and writes it back as one indivisible step, so no other thread’s update can slip in between. Without it, two threads that update the same location at about the same time can both read the old value, and one update vanishes (Fig. 3).</p>
<div data-slot="atomic" class="wide"></div>
<p>Within a ${T('cooperative-thread-array', 'cooperative thread array')}, access can be more tightly synchronized, for example with barriers: the threads of one block can all write their part of a global array, wait at <code>__syncthreads()</code>, and then safely read each other’s parts. Across blocks there is no such barrier (see ${T('thread-hierarchy', 'Thread Hierarchy')}), so atomics are the tool that works at the scale of the whole grid.</p>
${GG.noteHTML('beyond', '<p><b>Visibility, not just atomicity.</b> Atomics guarantee that each read-modify-write is indivisible, not that other memory traffic is ordered around it. When one thread publishes data for threads in other blocks, CUDA C++ adds memory fences such as <code>__threadfence()</code> to make the writes visible in order. The CUDA C++ Programming Guide’s memory-model chapters cover the details.</p>')}

<h3>Where it lives, and who allocates it</h3>
<p>This level of the ${T('memory-hierarchy', 'memory hierarchy')} is typically implemented in the ${T('gpu-ram', 'GPU’s RAM')}, the large off-chip DRAM (80 GiB of HBM3 on an H100 SXM), and it is allocated from the host using a memory allocator provided by the ${T('cuda-driver-api', 'CUDA Driver API')} or the ${T('cuda-runtime-api', 'CUDA Runtime API')}.</p>
<div data-slot="alloc" class="wide"></div>

<h3>For maximum developer confusion</h3>
<p>The terminology “global” unfortunately collides with the <code>__global__</code> keyword in ${T('cuda-c', 'CUDA C/C++')}, which annotates functions that are launched on the host but run on the device (${T('kernel', 'kernels')}), whereas global memory is only on the device. A <code>__global__</code> function is not global memory and has nothing to do with it; the word means two unrelated things. Fig. 5 lights each one in a short program.</p>
<div data-slot="kw" class="wide"></div>
${GG.noteHTML('quote', '<p>Early CUDA architect Nicholas Wilt wryly notes that this choice was made “for maximum developer confusion” in his <a href="https://www.cudahandbook.com/"><em>CUDA Handbook</em></a>.</p>', 'From the glossary')}
${GG.noteHTML('beyond', '<p><b>The other “globals”.</b> In ' + T('parallel-thread-execution', 'PTX') + ', the word is used for the memory: global memory is the <code>.global</code> state space, read and written with <code>ld.global</code> and <code>st.global</code> (as in the Registers entry’s listing). In CUDA C++, a variable declared <code>__device__</code> at file scope also lives in global memory, which makes the naming no less confusing.</p>')}
<div data-slot="read"></div>`);

      guard(s.map, 'Programming model map', () => {
        const WHY = {
          global: 'Lit: <b>global memory</b>, the highest level of the memory hierarchy, and <b>GPU RAM</b>, where it is stored.',
          grid: 'Lit: the <b>grid</b> and its memory, <b>global memory</b> (left), with the <b>GPU</b> and its <b>GPU RAM</b> that implement them (right). Every block of the grid, on every SM, reaches the same global memory.',
        };
        const m = mapFig(s.map, ctx, {
          title: 'Global memory in the CUDA programming model',
          highlight: ['global'],
          caption: 'Redrawn after the glossary’s figure, itself modified from NVIDIA’s CUDA Refresher and CUDA C++ Programming Guide. Global memory is the highest level of the memory hierarchy in the CUDA programming model. It is stored in the GPU RAM.',
          why: WHY.global,
        });
        GG.ui.seg(m.f.controls, { label: 'Light up', value: 'global', options: [{ value: 'global', label: 'global memory' }, { value: 'grid', label: 'with its grid' }], onChange: (v) => m.set(v === 'grid' ? ['grid', 'global'] : ['global'], WHY[v]) });
        return m;
      });
      guard(s.life, 'Lifetime figure', () => lifetimeFig(s.life, ctx));
      guard(s.atomic, 'Atomics figure', () => atomicFig(s.atomic, ctx));
      guard(s.alloc, 'Allocation figure', () => allocFig(s.alloc, ctx));
      guard(s.kw, 'Keyword figure', () => keywordFig(s.kw, ctx));
      ctx.reading(s.read, [
        { href: 'https://www.cudahandbook.com/', label: 'Nicholas Wilt, The CUDA Handbook', note: 'source of “for maximum developer confusion”' },
        REFRESHER, CPG,
      ]);
    },
  });


  /* ═════════════════════════════ CUDA Tile programming model ═════════════════════════════ */

  GG.css(`
.dsc-sp { display: grid; grid-template-columns: minmax(0, 1fr); gap: 10px; margin-top: 10px; }
@media (min-width: 760px) { .dsc-sp { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); } }
.dsc-sp .dsc-panel-h b.simt { color: var(--ink); }
.dsc-tabs-code .code { margin: 0; }
.dsc-tabs-code .code pre { font-size: 12.2px; }
.dsc-tabs-code .tabs-panel { padding-top: 10px; }
.dsc-share { margin-top: 12px; }
.dsc-share-bar { display: flex; height: 30px; border-radius: 7px; overflow: hidden; border: 1px solid var(--line-2); }
.dsc-share-bar > div { display: flex; align-items: center; padding: 0 8px; font: 600 11px var(--font-mono); white-space: nowrap; overflow: hidden; }
.dsc-share-t { background: var(--core); color: #07140e; }
.dsc-share-c { background: rgba(69, 212, 155, 0.22); color: var(--core); justify-content: center; padding: 0 !important; }
`);

  /* Fig: the same vector add, SIMT vs Tile */
  function simtTileFig(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'One vector add, two programming models',
      hint: 'hover or tap an element · change the block size',
      wide: true,
      caption: 'Top: the SIMT model. The program is written for one thread; every element of the vector gets its own thread, which computes its own index and offsets flat pointers by it. Bottom: the Tile model, where each tile block is drawn as one thick thread. The program is written for one tile block, a single thread of execution that loads, adds and stores a whole tile; the compiler decides how hardware threads share that work. Both launch a grid: of thread blocks in one case, of tile blocks in the other.',
    });
    const wrap = el('div', { class: 'dsc-w' });
    f.stage.append(wrap);
    const host = el('div');
    wrap.append(host);
    const sp = el('div', { class: 'dsc-sp' });
    const pS = el('div', { class: 'dsc-panel' }), pT = el('div', { class: 'dsc-panel' });
    sp.append(pS, pT);
    wrap.append(sp);
    const st = { bs: 16, e: 21, n: 64 };
    GG.ui.seg(f.controls, { label: 'Block size / tile size', value: 16, options: [8, 16, 32].map((v) => ({ value: v, label: String(v) })), onChange: (v) => { st.bs = v; update(); } });
    const sThreads = GG.ui.stat(f.readouts, { label: 'SIMT: threads' });
    const sTiles = GG.ui.stat(f.readouts, { label: 'Tile: tile blocks' });
    let W = 0, svg = null, G = null;
    function draw(w) {
      W = w;
      st.n = w >= 600 ? 64 : 32;
      st.e = Math.min(st.e, st.n - 1);
      clear(host);
      const lab = w >= 600 ? 62 : 0;
      const cw = (w - lab) / st.n;
      const topY = lab ? 14 : 26, thrY = topY + 18, thrL = 40, memY = thrY + thrL + 12, memH = 22, tileY = memY + memH + (lab ? 22 : 34), tileL = 40;
      const H = tileY + tileL + 36;
      G = { lab, cw, memY, memH };
      svg = svgEl(host, w, H, 'A vector, handled by one thread per element above (SIMT) and by one tile block per tile below (Tile).', { focusable: true, role: 'group' });
      const nb = st.n / st.bs, eb = Math.floor(st.e / st.bs), et = st.e % st.bs;
      if (lab) {
        Tx(svg, 0, thrY + 18, 'SIMT', { size: 11, weight: 700, fill: 'var(--ink)' });
        Tx(svg, 0, thrY + 31, 'threads', { size: 9, fill: 'var(--ink-3)' });
        Tx(svg, 0, memY + 15, 'memory', { size: 9.5, fill: 'var(--memory)' });
        Tx(svg, 0, tileY + 18, 'Tile', { size: 11, weight: 700, fill: 'var(--ink)' });
        Tx(svg, 0, tileY + 31, 'tile blocks', { size: 9, fill: 'var(--ink-3)' });
      } else {
        Tx(svg, 0, 12, 'SIMT: one thread per element', { size: 9.5, fill: 'var(--ink-2)' });
      }
      for (let b = 0; b < nb; b++) {
        const x0 = lab + b * st.bs * cw;
        const on = b === eb;
        // SIMT block outline + threads
        R(svg, x0 + 1, topY, st.bs * cw - 2, thrY + thrL - topY + 2, { rx: 4, fill: on ? 'rgba(255,255,255,0.04)' : 'none', stroke: on ? 'var(--ink-2)' : 'var(--line-2)', dash: on ? null : '3 3' });
        if (st.bs * cw > 60) Tx(svg, x0 + 5, topY + 11, 'block ' + b, { size: 8.5, fill: on ? 'var(--ink)' : 'var(--ink-3)' });
        for (let t = 0; t < st.bs; t++) {
          const i = b * st.bs + t, x = lab + (i + 0.5) * cw;
          const me = i === st.e;
          strand(svg, x, thrY, thrL, { amp: Math.min(1.8, cw / 4), wl: 8, phase: i * 0.6, sw: me ? 1.8 : 0.9, stroke: me ? 'var(--accent)' : 'var(--ink-2)', hw: Math.min(2.4, cw / 3), opacity: me ? 1 : 0.8 });
        }
        // Tile block: one thick thread over its whole tile
        const tx = x0 + (st.bs * cw) / 2;
        R(svg, x0 + 1, tileY - 6, st.bs * cw - 2, tileL + 12, { rx: 6, fill: on ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.015)', stroke: on ? 'var(--accent)' : 'var(--line-2)', sw: on ? 1.4 : 1 });
        strand(svg, tx, tileY, tileL - 4, { amp: 3, wl: 16, phase: b, sw: on ? 3.2 : 2.6, stroke: on ? 'var(--accent)' : 'var(--ink-2)', hw: 4 });
        Tx(svg, tx, tileY + tileL + 20, st.bs * cw > 50 ? 'pid = ' + b : String(b), { size: 9, anchor: 'middle', fill: on ? 'var(--accent)' : 'var(--ink-3)' });
        // bracket from tile block up to its tile
        P(svg, `M${r2(x0 + 3)} ${memY + memH + 10}V${memY + memH + 4}H${r2(x0 + st.bs * cw - 3)}V${memY + memH + 10}`, { stroke: on ? 'var(--accent)' : 'var(--ink-3)', sw: 1.2 });
      }
      for (let i = 0; i < st.n; i++) {
        const x = lab + i * cw, me = i === st.e, inT = Math.floor(i / st.bs) === eb;
        R(svg, x + 0.6, G.memY, cw - 1.2, G.memH, { rx: 2, fill: me ? 'var(--accent)' : inT ? 'rgba(111,166,255,0.45)' : 'rgba(111,166,255,0.16)', stroke: 'rgba(111,166,255,0.5)', sw: 0.5 });
        if (cw >= 14) Tx(svg, x + cw / 2, G.memY + G.memH / 2 + 3.5, String(i), { size: cw >= 17 ? 8.5 : 7.5, anchor: 'middle', fill: me ? 'var(--on-accent)' : 'var(--ink)' });
      }
      if (!lab) Tx(svg, 0, tileY - 9, 'Tile: one tile block per tile', { size: 9.5, fill: 'var(--ink-2)' });
      svg.addEventListener('pointermove', pick);
      svg.addEventListener('click', pick);
      svg.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        st.e = clamp(st.e + (e.key === 'ArrowRight' ? 1 : -1), 0, st.n - 1);
        update();
        requestAnimationFrame(() => svg && svg.focus());
      });
      sThreads.set(st.n + ' threads');
      sTiles.set(nb + ' tile block' + (nb > 1 ? 's' : ''));
    }
    function pick(e) {
      const [px] = svgPoint(svg, e);
      const i = Math.floor((px - G.lab) / G.cw);
      if (i >= 0 && i < st.n && i !== st.e) { st.e = i; update(); }
    }
    function update() {
      if (W) draw(W);
      const eb = Math.floor(st.e / st.bs), et = st.e % st.bs, nb = st.n / st.bs;
      pS.innerHTML = `<div class="dsc-panel-h"><b>SIMT · thread ${et} of block ${eb}</b><span>one of ${st.n} threads</span></div><div class="dsc-formula"><span class="d">i = blockIdx.x * blockDim.x + threadIdx.x</span>\n  = ${eb} * ${st.bs} + ${et} = <b>${st.e}</b>\n<span class="d">c[i] = a[i] + b[i]</span>  <span class="d">// flat pointer + i</span>\n<span class="d">touches</span> <b>1</b> <span class="d">element:</span> <span class="v">${st.e}</span></div>`;
      pT.innerHTML = `<div class="dsc-panel-h"><b>Tile · tile block pid = ${eb}</b><span>one of ${nb}</span></div><div class="dsc-formula"><span class="d">ct.load(a, index=(pid,), shape=(${st.bs},))</span>\n<span class="d">ct.store(c, index=(pid, ), tile=result)</span>\n<span class="d">touches</span> <b>${st.bs}</b> <span class="d">elements:</span> <span class="m">${eb * st.bs}…${eb * st.bs + st.bs - 1}</span>\n<span class="d">element ${st.e} is never named on its own</span></div>`;
      f.setWhy(`Element <b>${st.e}</b>. In SIMT it belongs to <b>thread ${et} of block ${eb}</b>, which works out that number for itself and handles that one element. In the Tile model it is part of the tile of <b>tile block ${eb}</b>, a single thread of execution that loads, adds and stores all ${st.bs} elements at once; which hardware ${T('thread', 'threads')} do the work is the compiler’s choice.`);
    }
    onWidth(host, (w) => draw(w));
    update();
  }

  const TILE_SIMT_SRC = `__global__ void vector_add(const float* a, const float* b,
                           float* c, int n) {
  int i = blockIdx.x * blockDim.x + threadIdx.x;  // my element
  if (i < n) c[i] = a[i] + b[i];                  // one element
}

// launch: one thread per element, 16 per block
vector_add<<<(n + 15) / 16, 16>>>(a, b, c, n);`;
  const TILE_PY_SRC = `import cupy as cp
import numpy as np
import cuda.tile as ct

@ct.kernel
def vector_add(a, b, c, tile_size: ct.Constant[int]):
    # Get the 1D pid
    pid = ct.bid(0)

    # Load input tiles
    a_tile = ct.load(a, index=(pid,), shape=(tile_size,))
    b_tile = ct.load(b, index=(pid,), shape=(tile_size,))

    # Perform elementwise addition
    result = a_tile + b_tile

    # Store result
    ct.store(c, index=(pid, ), tile=result)`;
  const TILE_PY_LAUNCH = `    vector_size = 2**12
    tile_size = 2**4
    grid = (ct.cdiv(vector_size, tile_size), 1, 1)

    # ... create a, b, c with CuPy ...

    # Launch kernel
    ct.launch(cp.cuda.get_current_stream(),
              grid,  # 1D grid of processors
              vector_add,
              (a, b, c, tile_size))`;
  const TILE_BASIC_SRC = `10 REM Vector Add: C = A + B
20 INPUT N, A(), B()
30 DIM A(N), B(N), C(N)
40 TILE A(128), B(128), C(128)
50 LET C(BID) = A(BID) + B(BID)
60 OUTPUT C
70 END`;
  const TILE_RS_SRC = `#[cutile::module]
mod kernel {
    use cutile::core::*;

    #[cutile::entry()]
    fn add<const B: i32>(
        z: &mut Tensor<f32, { [B] }>,
        x: &Tensor<f32, { [-1] }>,
        y: &Tensor<f32, { [-1] }>,
    ) {
        let tx = x.load_like(z);
        let ty = y.load_like(z);
        z.store(tx + ty);
    }
}`;

  /* Fig: the "U" in CUDA, then and now */
  function substrateFig(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'The “U” in CUDA: a unified substrate, and what changed',
      hint: 'pick an era',
      wide: true,
      caption: 'Schematic, after the glossary’s G71 and G80 figures (Device Hardware: CUDA Device Architecture). G71 (2006) had 8 vertex shaders and 24 fragment shaders, two kinds of specialized processor. G80 (2006, the GeForce 8800) replaced them with 16 identical SMs of 8 cores each. An H100 SXM has 132 identical SMs, but inside each one the Tensor Cores now supply most of the arithmetic. The bandwidth bar compares dense BF16 Tensor Core throughput (989 TFLOPS) with FP32 CUDA Core throughput (66.9 TFLOPS), the two headline rates; other number formats shift the split but not the picture.',
    });
    const wrap = el('div', { class: 'dsc-w' });
    f.stage.append(wrap);
    const host = el('div');
    wrap.append(host);
    const share = el('div', { class: 'dsc-share' });
    wrap.append(share);
    const st = { era: 'h100' };
    GG.ui.seg(f.controls, { label: 'Era', value: st.era, options: [{ value: 'g71', label: 'before CUDA · G71' }, { value: 'g80', label: 'CUDA · G80' }, { value: 'h100', label: 'today · H100' }], onChange: (v) => { st.era = v; update(); } });
    const sA = GG.ui.stat(f.readouts, { label: 'kinds of processor' });
    const sB = GG.ui.stat(f.readouts, { label: 'programmed as', tone: 'core' });
    let W = 0;
    function box(svg, x, y, w, h, label, kind, o) {
      o = o || {};
      // both G71 shader kinds are specialized processors (pink); vertex boxes are drawn with square corners, fragment boxes rounded
      const c = { v: ['rgba(255,111,180,0.24)', 'var(--special)', '#ffc4e1'], fr: ['rgba(255,111,180,0.1)', 'rgba(255,111,180,0.7)', '#ffc4e1'], sm: ['var(--surface-2)', 'var(--line-2)', 'var(--ink-2)'] }[kind];
      R(svg, x, y, w, h, { rx: kind === 'fr' ? 8 : kind === 'v' ? 0.5 : 3, fill: c[0], stroke: c[1], sw: 1 });
      if (label) Tx(svg, x + w / 2, y + h / 2 + 3.2, label, { size: o.size || 8.5, anchor: 'middle', fill: c[2] });
    }
    function draw(w) {
      W = w;
      clear(host);
      if (st.era === 'g71') {
        const H = 200;
        const svg = svgEl(host, w, H, 'G71: eight vertex shaders feeding twenty-four fragment shaders.');
        const vw = Math.min(64, (w - 7 * 6) / 8), vx = (w - (8 * vw + 7 * 6)) / 2;
        Tx(svg, w / 2, 12, 'vertex shaders: transform the corners of triangles', { size: 9.5, anchor: 'middle', fill: 'var(--special)' });
        for (let k = 0; k < 8; k++) box(svg, vx + k * (vw + 6), 20, vw, 30, vw >= 40 ? 'Vertex' : 'V', 'v');
        P(svg, `M${w / 2} 56V78`, { stroke: 'var(--ink-3)', sw: 1.4 });
        P(svg, `M${w / 2 - 4} 72L${w / 2} 79L${w / 2 + 4} 72`, { stroke: 'var(--ink-3)', sw: 1.4 });
        Tx(svg, w / 2 + 8, 72, 'cull / clip / setup', { size: 9, fill: 'var(--ink-3)' });
        const fw = Math.min(64, (w - 11 * 4) / 12), fx = (w - (12 * fw + 11 * 4)) / 2;
        Tx(svg, w / 2, 96, 'fragment shaders: colour the pixels', { size: 9.5, anchor: 'middle', fill: 'var(--special)' });
        for (let r = 0; r < 2; r++) for (let k = 0; k < 12; k++) box(svg, fx + k * (fw + 4), 104 + r * 34, fw, 30, fw >= 48 ? 'Fragment' : 'F', 'fr');
        Tx(svg, w / 2, 192, w >= 600 ? 'two kinds of hardware, two kinds of program, a ratio fixed in silicon' : 'two kinds of hardware, two kinds of program', { size: 9.5, anchor: 'middle', fill: 'var(--ink-3)' });
      } else if (st.era === 'g80') {
        const cols = w >= 600 ? 8 : 4, rows = 16 / cols;
        const gap = 8, sw = (w - (cols - 1) * gap) / cols, sh = 52;
        const H = rows * (sh + gap) + 24;
        const svg = svgEl(host, w, H, 'G80: sixteen identical streaming multiprocessors of eight cores each.');
        for (let k = 0; k < 16; k++) {
          const x = (k % cols) * (sw + gap), y = Math.floor(k / cols) * (sh + gap);
          box(svg, x, y, sw, sh, '', 'sm');
          Tx(svg, x + 5, y + 11, 'SM', { size: 8.5, fill: 'var(--ink-3)' });
          const cwid = (sw - 12) / 8;
          for (let c = 0; c < 8; c++) R(svg, x + 6 + c * cwid + 1, y + 16, cwid - 2, sh - 22, { rx: 1.5, fill: 'rgba(69,212,155,0.6)', stroke: 'var(--core)', sw: 0.5 });
        }
        Tx(svg, w / 2, H - 6, w >= 600 ? 'one kind of processor, repeated: vertex, geometry and pixel work all run on the same SMs' : 'one kind of processor, repeated 16 times', { size: 9.5, anchor: 'middle', fill: 'var(--ink-3)' });
      } else {
        const cols = w >= 900 ? 22 : w >= 600 ? 12 : 11, n = 132, rows = Math.ceil(n / cols);
        const gap = 4, sw = (w - (cols - 1) * gap) / cols, sh = Math.max(22, Math.min(30, sw * 0.62));
        const H = rows * (sh + gap) + 22;
        const svg = svgEl(host, w, H, 'H100: 132 identical SMs, each with CUDA Cores and Tensor Cores.');
        for (let k = 0; k < n; k++) {
          const x = (k % cols) * (sw + gap), y = Math.floor(k / cols) * (sh + gap);
          box(svg, x, y, sw, sh, '', 'sm');
          const inner = sw - 6;
          // 4 thin CUDA-core bars and a big Tensor Core block per SM (schematic)
          for (let c = 0; c < 4; c++) R(svg, x + 3 + c * (inner * 0.09), y + 4, inner * 0.07, sh - 8, { rx: 1, fill: 'rgba(69,212,155,0.45)' });
          R(svg, x + 3 + inner * 0.4, y + 4, inner * 0.6, sh - 8, { rx: 2, fill: 'var(--core)', stroke: '#b5f5da', sw: 0.6 });
        }
        Tx(svg, w / 2, H - 6, w >= 600 ? 'still identical SMs, but each one has two very different kinds of core inside' : '132 identical SMs, two kinds of core in each', { size: 9.5, anchor: 'middle', fill: 'var(--ink-3)' });
      }
    }
    function update() {
      if (W) draw(W);
      if (st.era === 'h100') {
        const t = 989, c = 66.9, p = t / (t + c);
        share.innerHTML = `<div class="dsc-k" style="margin-bottom:6px">H100 SXM arithmetic bandwidth</div><div class="dsc-share-bar" role="img" aria-label="Tensor Cores ${GG.fmt.fixed(p * 100, 1)} percent, CUDA Cores ${GG.fmt.fixed((1 - p) * 100, 1)} percent"><div class="dsc-share-t" style="flex-basis:${(p * 100).toFixed(2)}%">${W >= 600 ? 'Tensor Cores · 989 TFLOPS · ' : 'Tensor Cores · '}${GG.fmt.fixed(p * 100, 1)}%</div><div class="dsc-share-c" style="flex-basis:${((1 - p) * 100).toFixed(2)}%">${W >= 600 ? GG.fmt.fixed((1 - p) * 100, 1) + '%' : ''}</div></div><div class="dsc-legend"><span><i class="dsc-sw-core"></i>Tensor Cores (dense BF16): 989 TFLOPS, matrix multiply only</span><span><i class="dsc-sw-core-a"></i>CUDA Cores (FP32): 66.9 TFLOPS · ${GG.fmt.fixed((1 - p) * 100, 1)}%, anything</span></div>`;
        sA.set('1 kind of SM, 2 kinds of core');
        sB.set('SIMT + Tensor Core asynchrony', 'control');
        f.setWhy(`The SMs are still identical, so the substrate is still “unified”. But ${GG.fmt.fixed(p * 100, 1)}% of the ${T('arithmetic-bandwidth', 'arithmetic bandwidth')}, ${GG.fmt.fixed(t / c, 1)}× the CUDA Cores’ rate, is in the ${T('tensor-core', 'Tensor Cores')}, which only multiply matrices and are driven very differently from the rest of the SM. A model built around many identical threads on identical cores no longer matches where the work happens.`);
      } else if (st.era === 'g80') {
        share.innerHTML = '';
        sA.set('1');
        sB.set('one SIMT program', 'core');
        f.setWhy(`The unified design: homogeneous ${T('streaming-multiprocessor', 'SMs')} with homogeneous ${T('cuda-core', 'CUDA Cores')} implement the majority of operations. One kind of hardware invites one way of programming it: write a program for one ${T('thread', 'thread')}, launch it on many. That is the ${T('cuda-programming-model', 'SIMT programming model')}.`);
      } else {
        share.innerHTML = '';
        sA.set('2 (+ fixed units)');
        sB.set('separate shader programs', 'special');
        f.setWhy('Before CUDA, the device comprised specialized cores, programmed heterogeneously: vertex programs ran on vertex shaders, fragment programs on fragment shaders. Software had to fit a fixed pipeline, and hardware designers had to guess the ratio between its stages.');
      }
    }
    onWidth(host, (w) => { W = w; update(); });
    update();
  }

  /* Fig: warp-level latency hiding vs thread-level asynchrony on Tensor Cores vs the Tile model */
  function asyncFig(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Two kinds of asynchrony',
      hint: 'pick a style',
      wide: true,
      caption: 'Schematic timelines, not cycle counts. SIMT: six warps, each issuing an instruction and then waiting a few time units for memory; the warp scheduler fills every slot from whichever warp is ready. Tensor Cores: one thread drives the work by asking the copy engine (the Tensor Memory Accelerator) for tiles, queueing asynchronous matrix multiply-accumulates (MMAs) and waiting on barriers, while three tile buffers in shared memory let the next copy overlap the current MMA. On Blackwell a single thread issues <code>tcgen05.mma</code> as drawn; on Hopper the <code>wgmma</code> instructions are issued by a warpgroup of 128 threads. Tile model: the same schedule, with the programmer writing only <code>ct.load</code>, <code>ct.mma</code> and <code>ct.store</code>.',
    });
    const wrap = el('div', { class: 'dsc-w' });
    f.stage.append(wrap);
    const top = el('div', { class: 'dsc-ord-top' });
    const code = el('div', { class: 'dsc-formula' });
    top.append(code);
    wrap.append(top);
    const host = el('div');
    wrap.append(host);
    const leg = legend(wrap, []);
    const setLegend = () => {
      const items = st.mode === 'warp'
        ? [['dsc-sw-control', 'instruction issued'], ['dsc-sw-memory-a', 'waiting for memory']]
        : [['dsc-sw-control', 'instruction issued'], ['dsc-sw-ctrl-d', 'waiting on a barrier'], ['dsc-sw-special', 'copy engine (TMA)'], ['dsc-sw-core', 'Tensor Core MMA'], ['dsc-sw-memory-a', 'tile held in a shared-memory buffer']];
      leg.innerHTML = items.map(([c, l]) => `<span><i class="${c}"></i>${l}</span>`).join('');
    };
    const st = { mode: 'warp' };
    GG.ui.seg(f.controls, { label: 'Style', value: 'warp', options: [{ value: 'warp', label: 'SIMT: many warps' }, { value: 'thread', label: 'Tensor Cores: one thread, async' }, { value: 'tile', label: 'Tile model' }], onChange: (v) => { st.mode = v; setLegend(); update(); } });
    const sA = GG.ui.stat(f.readouts, { label: '' });
    const sB = GG.ui.stat(f.readouts, { label: '' });
    const TT = 27, LAT = 5, NW = 6;
    function warpSched() {
      const ready = range(NW).map(() => 0), last = range(NW).map(() => -1), issues = [];
      for (let t = 0; t < TT; t++) {
        const cand = range(NW).filter((k) => ready[k] <= t);
        if (!cand.length) continue;
        cand.sort((a, b) => last[a] - last[b] || a - b);
        const k = cand[0];
        issues.push({ k, t });
        last[k] = t; ready[k] = t + 1 + LAT;
      }
      return issues;
    }
    const TH = {
      issue: [[0, 'copy 0', 'ct.load'], [1, 'copy 1', 'ct.load'], [4.5, 'mma 0', 'ct.mma'], [5.5, 'copy 2', 'ct.load'], [8.5, 'mma 1', 'ct.mma'], [12.5, 'mma 2', 'ct.mma'], [23, 'store', 'ct.store']],
      wait: [[2, 4.5], [6.5, 8.5], [9.5, 12.5], [13.5, 23]],
      tma: [[0.5, 4.5, 'tile 0'], [4.5, 8.5, 'tile 1'], [8.5, 12.5, 'tile 2'], [23.5, 26.5, 'store']],
      tc: [[4.5, 11, 'MMA 0'], [11, 17, 'MMA 1'], [17, 23, 'MMA 2']],
      buf: [[0.5, 11, 'tile 0'], [4.5, 17, 'tile 1'], [8.5, 23, 'tile 2']],
    };
    let W = 0;
    function draw(w) {
      W = w;
      clear(host);
      const lab = w >= 600 ? 104 : 70, x1 = w - 6, rowH = 22, topY = st.mode === 'warp' ? 18 : 44;
      const X = (t) => lab + ((x1 - lab) * t) / TT;
      const rows = st.mode === 'warp' ? ['scheduler'].concat(range(NW).map((k) => 'warp ' + k)) : [st.mode === 'tile' ? 'tile block' : 'thread 0', 'TMA', 'Tensor Core', 'smem buf 0', 'smem buf 1', 'smem buf 2'];
      const H = topY + rows.length * rowH + 24;
      const svg = svgEl(host, w, H, st.mode === 'warp' ? 'Timeline of six warps sharing one warp scheduler.' : 'Timeline of one thread driving the TMA and a Tensor Core asynchronously.');
      Tx(svg, st.mode === 'warp' ? lab : 0, 11, 'time →', { size: 9.5, fill: 'var(--ink-3)' });
      const ry = (i) => topY + i * rowH;
      rows.forEach((r, i) => {
        R(svg, lab, ry(i) + 2, x1 - lab, rowH - 4, { rx: 3, fill: 'rgba(255,255,255,0.025)' });
        Tx(svg, lab - 6, ry(i) + rowH / 2 + 3.5, w < 600 ? r.replace('smem buf', 'buf').replace('Tensor Core', 'Tensor C.').replace('scheduler', 'sched.') : r, { size: 9.5, anchor: 'end', fill: i === 0 ? 'var(--control)' : 'var(--ink-2)' });
      });
      const bar = (i, t0, t1, o) => {
        const x = X(t0), wd = Math.max(2, X(t1) - X(t0) - 1);
        R(svg, x, ry(i) + 4, wd, rowH - 8, { rx: 2.5, fill: o.fill, stroke: o.stroke || 'none', sw: o.stroke ? 1 : null, dash: o.dash || null });
        if (o.label && wd >= textW(o.label, 8.5, svg._small) + 6) Tx(svg, x + wd / 2, ry(i) + rowH / 2 + 3.3, o.label, { size: 8.5, anchor: 'middle', fill: o.ink || 'var(--ink)', weight: 600 });
      };
      if (st.mode === 'warp') {
        for (const { k, t } of warpSched()) {
          bar(0, t, t + 1, { fill: 'var(--control)', label: 'w' + k, ink: '#1d1405' });
          bar(1 + k, t, t + 1, { fill: 'var(--control)' });
          bar(1 + k, t + 1, Math.min(TT, t + 1 + LAT), { fill: 'var(--memory-a)', stroke: 'rgba(111,166,255,0.5)', label: 'wait', ink: '#d3e3ff' });
        }
      } else {
        const tile = st.mode === 'tile';
        TH.wait.forEach(([a, b]) => bar(0, a, b, { fill: 'rgba(255,198,92,0.08)', stroke: 'rgba(255,198,92,0.6)', dash: '3 2', label: 'wait', ink: 'var(--control)' }));
        TH.issue.forEach(([t, l, tl]) => bar(0, t, t + 0.9, { fill: 'var(--control)' }));
        TH.tma.forEach(([a, b, l]) => bar(1, a, b, { fill: 'var(--special)', label: l, ink: '#2a0718' }));
        TH.tc.forEach(([a, b, l]) => bar(2, a, b, { fill: 'var(--core)', label: l, ink: '#07140e' }));
        TH.buf.forEach(([a, b, l], k) => bar(3 + k, a, b, { fill: 'var(--memory-a)', stroke: 'rgba(111,166,255,0.6)', label: l, ink: '#d3e3ff' }));
        // issue labels above the thread row, alternating heights so they do not collide
        const SHORT = tile ? ['ld', 'ld', 'mma', 'ld', 'mma', 'mma', 'st'] : ['c0', 'c1', 'm0', 'c2', 'm1', 'm2', 'st'];
        TH.issue.forEach(([t, l, tl], k) => {
          const txt = w < 600 ? SHORT[k] : tile ? tl : l;
          const y = k % 2 ? topY - 4 : topY - 17;
          L(svg, X(t) + 1, y + 2, X(t) + 1, topY + 4, { stroke: 'var(--control)', sw: 0.8, opacity: 0.6 });
          Tx(svg, X(t) + 3, y, txt, { size: 8.5, fill: 'var(--control)' });
        });
      }
      // time ticks
      const ay = topY + rows.length * rowH + 4;
      L(svg, lab, ay, x1, ay, { stroke: 'var(--line-2)' });
      for (let u = 0; u <= TT; u += 3) Tx(svg, X(u), ay + 13, String(u), { size: 8.5, anchor: 'middle', fill: 'var(--ink-3)' });
    }
    function update() {
      if (st.mode === 'warp') {
        const iss = warpSched().length;
        code.innerHTML = '<span class="d">each warp, a simple synchronous program:</span> x = load(...); <span class="d">// wait</span> y = f(x); ...';
        sA.el.querySelector('i').textContent = 'scheduler busy';
        sA.set(fmt.pct(iss / TT), 'control');
        sB.el.querySelector('i').textContent = 'warps in flight';
        sB.set(NW);
        f.setWhy(`Each ${T('warp', 'warp')} issues an instruction and then waits ${LAT} time units for memory. On its own it would sit idle most of the time, but the ${T('warp-scheduler', 'warp scheduler')} switches to another warp that is ready, so the scheduler row is busy ${fmt.pct(iss / TT)} of the time. This is the warp-level latency hiding the rest of the SM is built for: many simple threads, no explicit asynchrony in the program.`);
      } else {
        const waitT = TH.wait.reduce((a, [x, y]) => a + y - x, 0);
        const tcT = TH.tc.reduce((a, [x, y]) => a + y - x, 0);
        sA.el.querySelector('i').textContent = st.mode === 'tile' ? 'tile block waiting' : 'issuing thread waiting';
        sA.set(fmt.pct(waitT / TT), 'control');
        sB.el.querySelector('i').textContent = 'Tensor Core busy';
        sB.set(fmt.pct(tcT / TT), 'core');
        if (st.mode === 'thread') {
          code.innerHTML = '<span class="d">one thread:</span> <span class="a">start copy(tile k)</span>; <span class="a">wait(barrier)</span>; <span class="a">start mma(tile k)</span>; ... <span class="a">wait</span>; store';
          f.setWhy(`One thread drives the ${T('tensor-core', 'Tensor Core')}: it starts copies of tiles into shared memory, queues asynchronous MMAs, and waits on barriers (dashed) to learn when data has arrived or results are done. The real work runs on the other rows, overlapped: the copy of tile 2 runs while MMA 0 computes. Writing this schedule thread by thread, with its buffers and barriers, is what the SIMT model makes awkward.`);
        } else {
          code.innerHTML = '<span class="d">tile block:</span> <span class="c">for k: a = ct.load(...); b = ct.load(...); acc = ct.mma(a, b, acc)</span>; <span class="c">ct.store(..., tile=acc)</span>';
          f.setWhy(`The same timeline, but in the Tile model the programmer writes only tile operations: <code>ct.load</code>, <code>ct.mma</code> and <code>ct.store</code> on whole tiles. Choosing the copies, the shared memory buffers, the barriers and the overlap becomes the compiler’s job, which is the point of programming the Tensor Core era in tiles.`);
        }
      }
      if (W) draw(W);
    }
    onWidth(host, (w) => draw(w));
    setLegend();
    update();
  }

  /* Fig: structured pointers: pointer + shape + stride, and a tile load; versus a tile of arbitrary pointers */
  function structPtrFig(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'A structured pointer: pointer + shape + stride',
      hint: 'pick a layout · click a tile · hover an element',
      wide: true,
      caption: 'A 6 × 8 array of floats: its logical shape (numbers are memory offsets), and the same 48 elements in memory order, starting at the base pointer (labels are row, column). The stride says how far apart in memory neighbouring elements are along each axis: the arrows step one column right and one row down from the element in focus, and the matching arcs in the memory strip show the same two steps as offsets. A plain pointer knows only the start; a structured pointer also carries shape and stride, which lets a tile load be written as “tile (i, j) of shape (2, 4)” and lets the compiler plan the memory accesses. The third layout drops the structure: the tile is 8 separate pointers into the same row-major array, the fully general but opaque path that Tile IR also allows.',
    });
    const wrap = el('div', { class: 'dsc-w' });
    f.stage.append(wrap);
    const host = el('div');
    wrap.append(host);
    const info = el('div', { class: 'dsc-sp' });
    const pA = el('div', { class: 'dsc-panel' }), pB = el('div', { class: 'dsc-panel' });
    info.append(pA, pB);
    wrap.append(info);
    const RW = 6, CL = 8, TR = 2, TC = 4;
    const GATHER = [21, 3, 38, 14, 44, 9, 30, 27]; // the 8 pointers of the gather tile, as offsets from a
    const st = { lay: 'row', ti: 1, tj: 1, hov: null };
    GG.ui.seg(f.controls, { label: 'Layout', value: 'row', options: [{ value: 'row', label: 'row-major · stride (8, 1)' }, { value: 'col', label: 'column-major · stride (1, 6)' }, { value: 'gather', label: 'tile of pointers (gather)' }], onChange: (v) => { st.lay = v; st.hov = null; update(); } });
    const sRuns = GG.ui.stat(f.readouts, { label: 'contiguous runs in the tile', tone: 'memory' });
    const sSpan = GG.ui.stat(f.readouts, { label: 'memory span of the tile' });
    const stride = () => (st.lay === 'col' ? [1, RW] : [CL, 1]);
    const off = (r, c) => { const s = stride(); return r * s[0] + c * s[1]; };
    const inTile = (r, c) => Math.floor(r / TR) === st.ti && Math.floor(c / TC) === st.tj;
    const gathered = new Set(GATHER);
    let W = 0, svg = null, cells = [];
    function arrowHead(x, y, ang, col) {
      const hl = 5;
      P(svg, `M${r2(x - hl * Math.cos(ang - 0.5))} ${r2(y - hl * Math.sin(ang - 0.5))}L${r2(x)} ${r2(y)}L${r2(x - hl * Math.cos(ang + 0.5))} ${r2(y - hl * Math.sin(ang + 0.5))}`, { stroke: col, sw: 1.5 });
    }
    function draw(w) {
      W = w;
      clear(host);
      cells = [];
      const gather = st.lay === 'gather';
      const narrow = w < 640;
      const cs = narrow ? Math.min(34, (w - 30) / CL) : Math.min(36, (w * 0.42) / CL);
      const gx = 22, gy = 32;
      const gridW = CL * cs, gridH = RW * cs;
      const mx = narrow ? 0 : gx + gridW + 40;
      const my = narrow ? gy + gridH + 44 : gy + 14;
      const mper = narrow ? 12 : 16;
      const mw = narrow ? (w - 4) / mper : Math.min(36, (w - mx - 4) / mper);
      const rowGap = 22;
      const mRows = Math.ceil(48 / mper);
      const H = Math.max(gy + gridH + 18, my + mRows * (mw + rowGap) + 4);
      svg = svgEl(host, w, H, gather ? 'A tile of eight separate pointers into a 6 by 8 array, and where each one points in memory.' : 'A 6 by 8 array, its memory order, and the selected tile highlighted in both, with the strides drawn as arrows.', { focusable: true, role: 'group' });
      const memXY = (o) => [mx + (o % mper) * mw, my + Math.floor(o / mper) * (mw + rowGap)];
      const at = {};
      if (!gather) for (let r = 0; r < RW; r++) for (let c = 0; c < CL; c++) at[off(r, c)] = [r, c];
      else for (let r = 0; r < RW; r++) for (let c = 0; c < CL; c++) at[r * CL + c] = [r, c];
      const hovOff = !gather && st.hov ? off(st.hov[0], st.hov[1]) : -1;
      if (!gather) {
        Tx(svg, gx, 12, 'logical view: shape (6, 8)', { size: 9.5, fill: 'var(--ink-3)' });
        for (let c = 0; c < CL; c++) Tx(svg, gx + c * cs + cs / 2, gy - 3, String(c), { size: 8.5, anchor: 'middle', fill: 'var(--ink-3)' });
        for (let r = 0; r < RW; r++) Tx(svg, gx - 6, gy + r * cs + cs / 2 + 3, String(r), { size: 8.5, anchor: 'end', fill: 'var(--ink-3)' });
        for (let r = 0; r < RW; r++) for (let c = 0; c < CL; c++) {
          const t = inTile(r, c), o = off(r, c), h = o === hovOff;
          R(svg, gx + c * cs + 1, gy + r * cs + 1, cs - 2, cs - 2, { rx: 3, fill: h ? 'var(--accent)' : t ? 'var(--memory)' : 'rgba(111,166,255,0.14)', stroke: t ? '#fff' : 'rgba(111,166,255,0.45)', sw: t ? 1 : 0.8 });
          Tx(svg, gx + c * cs + cs / 2, gy + r * cs + cs / 2 + 3.5, String(o), { size: cs >= 30 ? 9.5 : 8.5, anchor: 'middle', fill: h ? 'var(--on-accent)' : t ? '#0b1220' : 'var(--ink-2)', weight: t ? 600 : 500 });
          cells.push({ x: gx + c * cs, y: gy + r * cs, s: cs, r, c });
        }
        for (let r = 0; r <= RW; r += TR) L(svg, gx, gy + r * cs, gx + gridW, gy + r * cs, { stroke: 'var(--ink-3)', sw: 1.2 });
        for (let c = 0; c <= CL; c += TC) L(svg, gx + c * cs, gy, gx + c * cs, gy + gridH, { stroke: 'var(--ink-3)', sw: 1.2 });
      } else {
        // the tile is just 8 pointers, drawn as a 2 × 4 box of addresses
        Tx(svg, gx, 12, 'a tile of 8 pointers: no shape, no stride', { size: 9.5, fill: 'var(--ink-3)' });
        const pw = Math.min(cs * 2, (gridW) / TC), ph = Math.min(cs, 34);
        const curves = S('g', null, svg), boxes = S('g', null, svg);
        GATHER.forEach((o, k) => {
          const r = Math.floor(k / TC), c = k % TC;
          const x = gx + c * pw, y = gy + r * (ph + 6);
          R(boxes, x + 2, y, pw - 4, ph, { rx: 4, fill: '#2a1d18', stroke: 'var(--accent-2)', sw: 1 });
          Tx(boxes, x + pw / 2, y + ph / 2 + 3.5, 'a+' + o, { size: 9.5, anchor: 'middle', fill: 'var(--ink)', weight: 600 });
          const [tx, ty] = memXY(o);
          const sx = x + pw / 2, sy = y + ph;
          const ex = tx + mw / 2, ey = ty - 1;
          const midY = narrow ? (sy + ey) / 2 : Math.min(sy, ey) - 0;
          P(curves, narrow ? `M${r2(sx)} ${r2(sy)}C${r2(sx)} ${r2(midY)} ${r2(ex)} ${r2(midY)} ${r2(ex)} ${r2(ey)}` : `M${r2(x + pw / 2)} ${r2(y + ph / 2)}C${r2(mx - 10)} ${r2(y + ph / 2)} ${r2(ex)} ${r2(ey - 20)} ${r2(ex)} ${r2(ey)}`, { stroke: 'var(--accent-2)', sw: 1, opacity: 0.75 });
          arrowHead(ex, ey, Math.PI / 2, 'var(--accent-2)');
        });
        Tx(svg, gx, gy + 2 * (ph + 6) + 14, 'each element is addressed on its own', { size: 9, fill: 'var(--ink-3)' });
      }
      // memory strip
      Tx(svg, mx, my - 26, 'memory order: base pointer + offset', { size: 9.5, fill: 'var(--ink-3)' });
      const ticks = [];
      for (let o = 0; o < 48; o++) {
        const [r, c] = at[o];
        const [x, y] = memXY(o);
        const t = gather ? gathered.has(o) : inTile(r, c), h = o === hovOff;
        R(svg, x + 1, y, mw - 2, mw - 2, { rx: 2.5, fill: h ? 'var(--accent)' : t ? (gather ? 'rgba(255,183,140,0.55)' : 'var(--memory)') : 'rgba(111,166,255,0.14)', stroke: t ? '#fff' : 'rgba(111,166,255,0.45)', sw: t ? 1 : 0.8 });
        if (mw >= 22) Tx(svg, x + mw / 2, y + mw / 2 + 2.5, `${r},${c}`, { size: 8, anchor: 'middle', fill: h ? 'var(--on-accent)' : t ? '#0b1220' : 'var(--ink-3)' });
        if (o % 4 === 0) ticks.push({ o, x: x + 2, y: y + mw + 8, t: Tx(svg, x + 2, y + mw + 8, '+' + o, { size: 8, fill: 'var(--ink-3)' }) });
      }
      // the strides, drawn from the element in focus (hovered, or the tile's first element)
      if (!gather) {
        const [fr, fc] = st.hov || [st.ti * TR, st.tj * TC];
        const s = stride(), o0 = off(fr, fc);
        const col = 'var(--accent-2)';
        const cxy = (r, c) => [gx + c * cs + cs / 2, gy + r * cs + cs / 2];
        const [ax, ay] = cxy(fr, fc);
        const steps = [], arcs = [];
        if (fc + 1 < CL) steps.push({ to: [fr, fc + 1], d: s[1], axis: 'column' });
        if (fr + 1 < RW) steps.push({ to: [fr + 1, fc], d: s[0], axis: 'row' });
        steps.forEach((q) => {
          const [bx, by] = cxy(q.to[0], q.to[1]);
          const horiz = q.axis === 'column';
          const x1 = horiz ? ax + cs * 0.22 : ax, y1 = horiz ? ay : ay + cs * 0.22, x2 = horiz ? bx - cs * 0.22 : bx, y2 = horiz ? by : by - cs * 0.22;
          L(svg, x1, y1, x2, y2, { stroke: col, sw: 1.8 });
          arrowHead(x2, y2, horiz ? 0 : Math.PI / 2, col);
          Tx(svg, horiz ? (x1 + x2) / 2 : x1 + 5, horiz ? y1 - 5 : (y1 + y2) / 2 + 3, '+' + q.d, { size: 10, anchor: horiz ? 'middle' : 'start', fill: col, weight: 700, halo: true });
          // the same step in the memory strip
          const [p0x, p0y] = memXY(o0), [p1x, p1y] = memXY(o0 + q.d);
          const sx = p0x + mw / 2, ex = p1x + mw / 2;
          let sy, c1, c2, lx, ly;
          const ey = p1y - 1;
          if (p1y > p0y) {
            // the step wraps onto the next strip row: leave the source cell's bottom, cross the gap, enter the target's top
            sy = p0y + mw - 1;
            const gy2 = (sy + ey) / 2 + 2;
            c1 = gy2; c2 = gy2;
            lx = (sx + ex) / 2; ly = gy2 + 3.5;
          } else {
            sy = p0y - 1;
            const cy = Math.min(sy, ey) - (8 + Math.min(10, Math.abs(ex - sx) / 10));
            c1 = cy; c2 = cy;
            lx = (sx + ex) / 2; ly = cy + 1;
          }
          const pth = P(svg, `M${r2(sx)} ${r2(sy)}C${r2(sx)} ${r2(c1)} ${r2(ex)} ${r2(c2)} ${r2(ex)} ${r2(ey)}`, { stroke: col, sw: 1.4 });
          arrowHead(ex, ey, Math.PI / 2, col);
          const lab = Tx(svg, lx, ly, '+' + q.d, { size: 9.5, anchor: 'middle', fill: col, weight: 700, halo: true });
          arcs.push({ pth, lab, lx, ly, txt: '+' + q.d });
        });
        // offset ticks that an arc or its label would run over are dropped; the hovered offset is in the panel anyway
        const fs = svg._small ? 10 : 8, ls = svg._small ? 10 : 9.5;
        const near = (tk, px, py, pad) => px >= tk.x - pad && px <= tk.x + textW(tk.t.textContent, fs, svg._small) + pad && py >= tk.y - fs * 0.8 - pad && py <= tk.y + 2 + pad;
        ticks.forEach((tk) => {
          const hitArc = arcs.some((a) => {
            const hw = textW(a.txt, ls, svg._small) / 2 + 2;
            const lHit = [[a.lx - hw, a.ly], [a.lx + hw, a.ly], [a.lx - hw, a.ly - ls * 0.8], [a.lx + hw, a.ly - ls * 0.8], [a.lx, a.ly - ls * 0.4]].some(([px, py]) => near(tk, px, py, 1));
            if (lHit) return true;
            const len = a.pth.getTotalLength ? a.pth.getTotalLength() : 0;
            for (let k = 0; k <= 24 && len; k++) { const p = a.pth.getPointAtLength((k / 24) * len); if (near(tk, p.x, p.y, 0.5)) return true; }
            return false;
          });
          if (hitArc) tk.t.remove();
        });
      }
      svg.addEventListener('pointermove', (e) => { if (gather) return; const c = hit(e); const k = c ? [c.r, c.c] : null; if (String(k) !== String(st.hov)) { st.hov = k; update(); } });
      svg.addEventListener('pointerleave', () => { if (st.hov) { st.hov = null; update(); } });
      svg.addEventListener('click', (e) => { if (gather) return; const c = hit(e); if (c) { st.ti = Math.floor(c.r / TR); st.tj = Math.floor(c.c / TC); update(); } });
      svg.addEventListener('keydown', (e) => {
        const mv = { ArrowRight: [0, 1], ArrowLeft: [0, -1], ArrowDown: [1, 0], ArrowUp: [-1, 0] }[e.key];
        if (!mv || gather) return;
        e.preventDefault();
        st.ti = clamp(st.ti + mv[0], 0, RW / TR - 1); st.tj = clamp(st.tj + mv[1], 0, CL / TC - 1);
        update();
        requestAnimationFrame(() => svg && svg.focus());
      });
    }
    function hit(e) {
      const [px, py] = svgPoint(svg, e);
      return cells.find((q) => px >= q.x && px < q.x + q.s && py >= q.y && py < q.y + q.s) || null;
    }
    function update() {
      if (W) draw(W);
      const gather = st.lay === 'gather';
      const offs = [];
      if (gather) offs.push(...GATHER);
      else for (let r = 0; r < TR; r++) for (let c = 0; c < TC; c++) offs.push(off(st.ti * TR + r, st.tj * TC + c));
      offs.sort((a, b) => a - b);
      let runs = 1;
      for (let k = 1; k < offs.length; k++) if (offs[k] !== offs[k - 1] + 1) runs++;
      sRuns.set(`${runs} × ${8 / runs} element${8 / runs === 1 ? '' : 's'}`, gather ? 'danger' : 'memory');
      sSpan.set(`offsets ${offs[0]}–${offs[offs.length - 1]}`);
      if (gather) {
        pA.innerHTML = `<div class="dsc-panel-h"><b>a tile of pointers</b><span>no structure attached</span></div><div class="dsc-formula">pointers = <span class="m">a</span> + [${GATHER.join(', ')}]\n<span class="d">// 8 addresses, each computed on its own</span>\n<span class="d">// no shape, no stride: nothing says how they relate</span></div>`;
        pB.innerHTML = `<div class="dsc-panel-h"><b>a gather load</b><span>through those pointers</span></div><div class="dsc-formula"><span class="r">load(pointers)</span>  <span class="d">// fully general</span>\n<span class="d">the compiler sees</span> <b>8</b> <span class="d">unrelated addresses, so in the worst case</span>\n<span class="d">every element is a separate memory operation</span></div>`;
        f.setWhy(`Here the tile is just 8 pointers into the array. That is fully general, and Tile IR allows it for scatter/gather-style access, but it “obscures regular memory structure from both the reader and the compiler”: these 8 elements form <b>${runs} separate run${runs === 1 ? '' : 's'}</b>, and nothing in the program says so in advance. Switch back to a strided layout to hand the compiler the pattern.`);
        return;
      }
      const s = stride();
      const [fr, fc] = st.hov || [st.ti * TR, st.tj * TC];
      pA.innerHTML = `<div class="dsc-panel-h"><b>the structured pointer</b><span>what a tile load sees: in cuTile Python the array argument, in Tile IR a tensor view built from a base pointer</span></div><div class="dsc-formula">pointer = <span class="m">a</span>  <span class="d">// where element (0, 0) is</span>\nshape   = <b>(6, 8)</b>  <span class="d">// extent along each axis</span>\nstride  = <b>(${s[0]}, ${s[1]})</b>  <span class="d">// step in memory per axis</span>\n<span class="d">offset(r, c) = r × ${s[0]} + c × ${s[1]}</span>\n<span class="d">offset(${fr}, ${fc}) =</span> ${fr} × ${s[0]} + ${fc} × ${s[1]} = <span class="v">${off(fr, fc)}</span></div>`;
      pB.innerHTML = `<div class="dsc-panel-h"><b>a tile load</b><span>and its CuTe spelling</span></div><div class="dsc-formula"><span class="c">ct.load(a, index=(${st.ti}, ${st.tj}), shape=(2, 4))</span>\n<span class="d">tile (${st.ti}, ${st.tj}) = rows ${st.ti * TR}–${st.ti * TR + 1}, columns ${st.tj * TC}–${st.tj * TC + 3}</span>\n\n<span class="d">CuTe Layout (shape : stride):</span>\n<b>(6,8):(${s[0]},${s[1]})</b>  <span class="d">for the whole array</span></div>`;
      f.setWhy(st.hov
        ? `Element (${fr}, ${fc}) sits at offset <b>${off(fr, fc)}</b> from the base pointer: ${fr} × ${s[0]} + ${fc} × ${s[1]}. One column to the right is <b>+${s[1]}</b> in memory, one row down is <b>+${s[0]}</b> (the arrows and arcs). The shape says where the array ends; the stride says how its axes are laid out in memory.`
        : `Tile (${st.ti}, ${st.tj}) is ${runs === 1 ? 'one contiguous run' : runs + ' separate runs'} in memory with ${st.lay === 'row' ? 'row-major' : 'column-major'} strides (${s[0]}, ${s[1]}): one column right is +${s[1]}, one row down is +${s[0]}. The tile-kernel asks for the tile by index and shape; the stride, carried by the structured pointer, tells the compiler where its elements really are, much as a ${T('cute', 'CuTe')} <code>Layout</code> does.`);
    }
    onWidth(host, (w) => draw(w));
    update();
  }

  GG.entry('cuda-tile-programming-model', {
    render(body, ctx) {
      body.classList.add('dsc-body');
      const s = ctx.html(body, `
<p>The <strong>CUDA Tile programming model</strong> is a tile-based programming model targeting NVIDIA GPUs. A <em>tile</em> is a fixed-size chunk of an array, such as 16 consecutive elements of a vector or a 64 × 64 block of a matrix. In this model a program says what to do with whole tiles, and the compiler works out what each hardware thread does.</p>

<h3>The model it sits beside: “CUDA SIMT”</h3>
<p>The traditional ${T('cuda-programming-model', 'CUDA programming model')} exposes a ${T('thread-hierarchy', 'hierarchy of threads')} and a ${T('memory-hierarchy', 'hierarchy of memories')} to user programs that receive pointers and execute concurrently to mutate memory relative to those pointers. The same instructions are issued to multiple ${T('thread', 'threads')} in parallel, and so this programming model is a “single-instruction, multiple thread” (<b>SIMT</b>) programming model. This is the programming model used in, for instance, ${T('cuda-c', 'CUDA C/C++')} and the ${T('parallel-thread-execution', 'PTX')} IR (intermediate representation: the language a compiler translates through on its way to machine code) used by pre-CUDA-Tile programs targeting NVIDIA GPUs.</p>
<p>Fig. 1 shows the difference on the simplest possible program, adding two vectors.</p>
<div data-slot="side" class="wide"></div>

<h3>Built for a unified substrate</h3>
<p>The SIMT programming model is defined for a ${T('cuda-device-architecture', '“unified” hardware substrate')}, the “U” in “CUDA” (CUDA stands for <em>Compute Unified Device Architecture</em>). That is, homogeneous ${T('streaming-multiprocessor', 'Streaming Multiprocessors (SMs)')} with homogeneous ${T('cuda-core', 'CUDA Cores')} implement the majority of operations, rather than the device comprising specialized cores, programmed heterogeneously, as was generically the case in graphics programming before CUDA. When every core is alike, “write the program for one thread and run it on all of them” is the natural model.</p>
<div data-slot="eras" class="wide"></div>

<h3>Why SIMT now fits poorly</h3>
<p>This programming model is a poor fit for GPUs of the latest ${T('streaming-multiprocessor-architecture', 'SM architectures')}, where the vast majority of ${T('arithmetic-bandwidth', 'arithmetic bandwidth')} is in the ${T('tensor-core', 'Tensor Cores')} (on an H100, over 93% by the headline figures in Fig. 2). The Tensor Cores can only perform matrix multiplications and must be programmed with ${T('thread', 'thread')}-level instructions and asynchrony, rather than the ${T('warp', 'warp')}-level asynchrony used to program the rest of the hardware. (The H100 numbers show the bandwidth split. The thread-level instruction style is that of the newest architecture, Blackwell, where a single thread issues <code>tcgen05.mma</code>; Hopper, the H100’s architecture, sits in between, with matrix instructions issued by a whole ${T('warpgroup', 'warpgroup')} of 128 threads. Both are explicitly asynchronous.)</p>
<p>In plain terms: the rest of the SM hides latency by having many ${T('warp', 'warps')} in flight and switching between them, so each thread’s program can be simple and synchronous. Feeding Tensor Cores instead means a few threads launching large asynchronous matrix operations, moving tiles between memories in the background, and waiting for them explicitly. Expressing that one scalar thread at a time is awkward. Expressing it as operations on tiles is natural, and lets the compiler generate the low-level orchestration. Fig. 3 draws the two styles side by side.</p>
<div data-slot="async" class="wide"></div>
${GG.noteHTML('beyond', '<p><b>What “thread-level instructions and asynchrony” look like.</b> The glossary’s “thread-level” describes the latest architecture. On Blackwell, a single thread issues <code>tcgen05.mma</code>, which runs asynchronously on operands in shared memory and ' + T('tensor-memory', 'tensor memory') + '; the program later waits on a barrier to learn that it has finished. Hopper sat in between: its asynchronous <code>wgmma</code> matrix instructions are issued collectively by a ' + T('warpgroup', 'warpgroup') + ' of 128 threads (four warps, coarser than one warp, not finer), while the ' + T('tensor-memory-accelerator', 'Tensor Memory Accelerator') + ' copies tiles into shared memory in the background. In both cases the work is explicitly asynchronous, which does not fit the picture of 32 threads executing the same instruction in lockstep.</p>')}

<h3>Tile-kernels, tile blocks and structured pointers</h3>
<p>In the CUDA Tile programming model, programs are expressed at the level of <b><i>tile-kernels</i></b>, which are instances of the program that run concurrently across a grid of <b><i>tile blocks</i></b>, each of which is a <b>single thread of execution</b>. A tile block plays the role a ${T('thread-block', 'thread block')} plays in SIMT, but the programmer writes it as one sequential program over tiles, never as many cooperating threads.</p>
<p>Tile-kernels operate, in the happy path, on <b><i>structured pointers</i></b>, which combine a pointer with information about an array: its total extent (<b>shape</b>) and its access patterns (<b>stride</b>). Note the similarity to the ${T('cute', 'CuTe')} type system for <code>Layout</code>s and <code>Tensor</code>s: a CuTe <code>Layout</code> is likewise a shape paired with a stride, and a CuTe <code>Tensor</code> is a pointer paired with a <code>Layout</code>.</p>
<p>“In the happy path” means the common, well-optimised case. Tile IR, where a structured pointer is called a <em>tensor view</em>, also lets a kernel work from plain pointers: it can build a tile of arbitrary pointers and load through it, for scatter/gather-style access. Its documentation warns that this is fully general but “obscures regular memory structure from both the reader and the compiler”, so in the worst case every element becomes a separate memory operation. A tensor view instead hands the compiler the shape and stride, and with them the access pattern. Where the structure comes from depends on the layer. In Tile IR, kernels typically receive plain base pointers as parameters and build their tensor views from them (with <code>cuda_tile.make_tensor_view</code>). In cuTile Python, a kernel receives arrays, which already carry their shape and strides, and <code>ct.load</code> reads tiles from them directly. Fig. 4 shows the structure itself, whichever layer supplies it, and what is lost without it.</p>
<div data-slot="ptr" class="wide"></div>
${GG.noteHTML('quote', '<p>Tile IR’s documentation puts it this way: the basic unit of execution is “a <em>tile-block</em>, which expresses the computation performed by a single logical tile thread operating over a multi-dimensional tile of data”, and “the mapping of both the grid and individual tile threads to the underlying hardware’s threads is abstracted away from the programming model and is handled by the compiler.”</p>', 'From NVIDIA’s Tile IR documentation')}

<h3>Languages and an IR</h3>
<p>As with traditional “CUDA SIMT” in CUDA C/C++ and PTX IR, this programming model is shared between high-level languages and an intermediate representation, here <a href="https://docs.nvidia.com/cuda/tile-ir/latest/sections/prog_model.html">Tile IR</a>. The CUDA Tile programming model is currently available via <a href="https://docs.nvidia.com/cuda/cutile-python/quickstart.html">cuTile Python</a>. It is also available, albeit in experimental form, via ${T('cutile-basic', 'cuTile BASIC')} and <a href="https://github.com/nvlabs/cutile-rs">cuTile Rust</a>. Here is the same vector add in each, next to its SIMT version:</p>
<div data-slot="codes"></div>
<p>The three tile versions share a shape: load tiles, compute on tiles, store tiles. Python and BASIC name the tile block’s index (<code>ct.bid(0)</code>, <code>BID</code>); Rust gets it implicitly, because <code>load_like</code> loads the part of the input that matches the output tile <code>z</code>. None of the three mentions <code>threadIdx</code>, a warp, or which element a thread owns, unlike the SIMT version, whose first line is exactly that.</p>

<h3>New, and unsettled</h3>
<p>At the time of the glossary’s writing, in mid-2026, the CUDA Tile programming model is new, and to what extent it will replace the existing “CUDA SIMT” programming model is as yet unclear. SIMT remains the model of CUDA C++, PTX and nearly all existing kernels, and of everything else in this part of the glossary.</p>
<div data-slot="read"></div>`);

      guard(s.side, 'SIMT vs Tile figure', () => simtTileFig(s.side, ctx));
      guard(s.eras, 'Substrate figure', () => substrateFig(s.eras, ctx));
      guard(s.async, 'Asynchrony figure', () => asyncFig(s.async, ctx));
      guard(s.ptr, 'Structured pointer figure', () => structPtrFig(s.ptr, ctx));
      guard(s.codes, 'Code tabs', () => {
        const wrapT = el('div', { class: 'dsc-tabs-code' });
        s.codes.append(wrapT);
        GG.ui.tabs(wrapT, { value: 'py', tabs: [
          { id: 'simt', label: 'SIMT · CUDA C++', render: (p) => ctx.code(p, { lang: 'cuda', code: TILE_SIMT_SRC, caption: 'the classic way: one thread per element (our example)',
            notes: { 3: 'Each thread computes the index of its own element.', 4: 'Flat pointers, offset by the thread’s index; the bounds check is the programmer’s job.', 8: 'The launch fixes the thread block size, 16, and how many blocks cover n elements.' } }) },
          { id: 'py', label: 'cuTile Python', render: (p) => {
            ctx.code(p, { lang: 'python', code: TILE_PY_SRC, caption: 'the kernel, from NVIDIA’s cuTile Python quickstart',
              notes: { 5: '<code>@ct.kernel</code> marks a tile-kernel.', 6: '<code>tile_size</code> is a compile-time constant: tile shapes must be known to the compiler.', 8: '<code>ct.bid(0)</code>: the index of this tile block along axis 0, the counterpart of <code>blockIdx.x</code>.', 11: 'Load the tile with tile index <code>pid</code> and shape <code>(tile_size,)</code>: elements <code>pid × tile_size</code> up to the next tile.', 15: 'Whole tiles are added at once; no thread indices appear.', 18: 'Store the result tile into <code>c</code> at the same tile index.' } });
            ctx.code(p, { lang: 'python', code: TILE_PY_LAUNCH, caption: 'launching it (from the quickstart’s test function, abridged)', lineNumbers: false,
              notes: { 3: '2<sup>12</sup> / 2<sup>4</sup> = 4,096 / 16 = <b>256 tile blocks</b>, one per tile: a 1-D grid.', 8: '<code>ct.launch</code> takes a CUDA stream, the grid, the kernel and its arguments.' } });
          } },
          { id: 'basic', label: 'cuTile BASIC', render: (p) => ctx.code(p, { lang: 'basic', code: TILE_BASIC_SRC, caption: 'from the glossary’s cuTile BASIC entry', lineNumbers: false,
            notes: { 4: '<code>TILE</code> sets the tile shapes: 128 elements per tile.', 5: '<code>BID</code> is the tile block index: one statement adds a whole tile.' } }) },
          { id: 'rust', label: 'cuTile Rust', render: (p) => ctx.code(p, { lang: 'text', langLabel: 'rust', code: TILE_RS_SRC, caption: 'from the cutile-rs README (experimental)',
            notes: { 7: 'The output <code>z</code> is a tensor of compile-time shape <code>[B]</code>: one tile.', 8: '<code>[-1]</code>: the inputs’ extent is only known at run time.', 11: 'Load the part of <code>x</code> that matches <code>z</code>’s tile.', 13: 'Add whole tiles and store.' } }) },
        ] });
      });
      ctx.reading(s.read, [
        { href: 'https://docs.nvidia.com/cuda/tile-ir/latest/sections/prog_model.html', label: 'NVIDIA Tile IR: Programming Model', note: 'tile kernels, tile blocks, tensor views' },
        { href: 'https://docs.nvidia.com/cuda/cutile-python/quickstart.html', label: 'cuTile Python quickstart', note: 'the vector-add kernel shown above' },
        { href: 'https://github.com/nvlabs/cutile-rs', label: 'cuTile Rust (nvlabs/cutile-rs)', note: 'experimental' },
      ]);
    },
  });

})();
