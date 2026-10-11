/* chapters/ds-a.js: Device Software, part A.
   Entries: cuda-programming-model, streaming-assembler, parallel-thread-execution, compute-capability.
   Every CSS class here is prefixed "dsa-". */
(function () {
  'use strict';

  GG.css(`
/* ── shared ── */
.dsa-w { position: relative; min-width: 0; }
.dsa-svg { display: block; width: 100%; height: auto; overflow: visible; -webkit-tap-highlight-color: transparent; }
.dsa-svg text { pointer-events: none; }
.dsa-hit { cursor: pointer; }
.dsa-hit:focus { outline: none; }
.dsa-ring { fill: none; stroke: none; pointer-events: none; }
.dsa-ring.on { stroke: var(--accent); stroke-width: 2; }
.dsa-tag { display: inline-block; font: 600 9.5px/1 var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 5px 2px; border-radius: 4px; border: 1px solid var(--line-2); color: var(--ink-3); vertical-align: 0.15em; white-space: nowrap; }
.dsa-tag.beyond { color: var(--host); border-color: rgba(184, 164, 255, 0.45); }
.dsa-legend { display: flex; flex-wrap: wrap; gap: 6px 16px; margin-top: 10px; font: 500 11px/1.4 var(--font-mono); color: var(--ink-2); }
.dsa-legend span { display: inline-flex; align-items: center; gap: 7px; }
.dsa-legend i { width: 11px; height: 11px; border-radius: 3px; flex: none; display: inline-block; }
.dsa-k { font: 500 10px/1.3 var(--font-mono); letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-3); }
.entry-body .dsa-wrapcode :not(pre) > code, .entry-body code.dsa-wc { white-space: normal; overflow-wrap: anywhere; }
.dsa-say { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: -4px; }
.dsa-say b.dsa-k { font-weight: 500; }
.dsa-say span { font: 500 13px/1 var(--font-mono); padding: 7px 10px 6px; border-radius: 999px; border: 1px solid var(--line-2); background: var(--surface); color: var(--ink); }
.dsa-say span small { color: var(--ink-3); font-size: 11px; margin-left: 6px; }

/* ── three meanings of CUDA ── */
.dsa-mean { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.dsa-mcard { display: flex; flex-direction: column; gap: 6px; text-align: left; cursor: pointer; border: 1px solid var(--line-2); background: rgba(8, 9, 14, 0.55); border-radius: 12px; padding: 10px 12px 12px; color: var(--ink-2); font: 13px/1.45 var(--font-body); transition: border-color .2s, box-shadow .2s, background .2s; }
.dsa-mcard:hover { border-color: var(--ink-3); }
.dsa-mcard[aria-pressed="true"] { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-a); background: rgba(24, 26, 38, 0.92); }
.dsa-mcard svg { width: 100%; max-width: 230px; height: auto; display: block; margin: 2px auto 4px; }
.dsa-mcard b { font: 600 12px var(--font-mono); color: var(--ink); letter-spacing: 0.02em; }
.dsa-mcard em { font-style: normal; font: 500 10px var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-3); }
.dsa-mcard[aria-pressed="true"] em { color: var(--accent); }
@media (max-width: 720px) { .dsa-mean { grid-template-columns: minmax(0, 1fr); } .dsa-mcard svg { max-width: 250px; } }

/* ── memory latency strip ── */
.dsa-lat { margin-top: 12px; border: 1px solid var(--line); border-radius: 10px; padding: 10px 12px; background: rgba(8, 9, 14, 0.5); display: grid; gap: 6px; }
.dsa-lat[hidden] { display: none; }
.dsa-lat-row { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1.4fr) minmax(0, 1fr); gap: 10px; align-items: center; font: 500 11.5px/1.3 var(--font-mono); color: var(--ink-2); }
.dsa-lat-row > span:first-child { color: var(--ink); }
.dsa-lat-bar { position: relative; height: 10px; border-radius: 3px; background: var(--surface-2); display: block; }
.dsa-lat-bar i { display: block; height: 100%; border-radius: 3px; opacity: 0.8; }
.dsa-lat-bar b.dsa-lat-ref { position: absolute; top: -3px; bottom: -3px; width: 0; border-left: 1.5px dashed var(--core); }
.dsa-lat-axis { position: relative; height: 16px; display: block; }
.dsa-lat-axis i.dsa-lat-ref { position: absolute; bottom: 0; height: 7px; width: 0; border-left: 1.5px dashed var(--core); }
.dsa-lat-axis em { position: absolute; bottom: 5px; transform: translateX(6px); font: 500 10.5px/1 var(--font-mono); font-style: normal; color: var(--core); white-space: nowrap; }
.dsa-lat-refrow > span:first-child { color: var(--core) !important; }
.dsa-lat-note { font: 12px/1.45 var(--font-body); color: var(--ink-3); }
@media (max-width: 720px) { .dsa-lat-row { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); } .dsa-lat-row > span:first-child { grid-column: 1 / -1; } }

/* ── barrier simulator ── */
.dsa-bar-code { margin-top: 10px; }
.dsa-bar-code .code pre { font-size: 12.5px; }

/* ── three spellings ── */
.dsa-sp { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; }
.dsa-sp-rows { display: grid; gap: 4px; }
.dsa-sp-row { display: grid; grid-template-columns: minmax(150px, 1.1fr) repeat(3, minmax(0, 1fr)); gap: 8px; align-items: center; text-align: left; cursor: pointer; border: 1px solid var(--line); background: rgba(8, 9, 14, 0.5); border-radius: 10px; padding: 8px 10px; color: var(--ink-2); font: 13px/1.35 var(--font-body); transition: border-color .2s, background .2s; }
.dsa-sp-row:hover { border-color: var(--ink-3); }
.dsa-sp-row[aria-pressed="true"] { border-color: var(--accent); background: rgba(24, 26, 38, 0.92); }
.dsa-sp-row.head { cursor: default; background: transparent; border-color: transparent; padding-top: 0; padding-bottom: 0; }
.dsa-sp-row .c { font: 500 12.5px/1.35 var(--font-mono); color: var(--ink); white-space: nowrap; min-width: 0; }
.dsa-sp-row .c small { white-space: normal; }
.dsa-sp-lh { margin-top: 4px; }
.dsa-sp-row .c.ptx { color: #ffd88a; }
.dsa-sp-row .c.sass { color: #52dba4; }
.dsa-sp-row .c small { display: block; color: var(--ink-3); font-size: 10.5px; }
.dsa-sp-three { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.dsa-sp-pane { border: 1px solid var(--line); border-radius: 10px; background: #090a10; overflow: hidden; min-width: 0; }
.dsa-sp-pane > div:first-child { padding: 6px 10px; border-bottom: 1px solid var(--line); background: var(--surface); }
.dsa-sp-pane pre { margin: 0; padding: 8px 10px; font: 12px/1.7 var(--font-mono); color: #d4d7e6; overflow-x: auto; white-space: pre; scrollbar-width: thin; }
.dsa-tk { border-radius: 4px; padding: 1px 2px; transition: background .2s, color .2s, box-shadow .2s; }
.dsa-tk.on { background: var(--accent-a); color: #fff; box-shadow: 0 0 0 1px var(--accent); }
@media (max-width: 720px) {
  .dsa-sp-row { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .dsa-sp-row > .lab { grid-column: 1 / -1; color: var(--ink); }
  .dsa-sp-three { grid-template-columns: minmax(0, 1fr); }
  .dsa-sp-row .c { font-size: 10.5px; }
}
`);

  /* ───────────── helpers ───────────── */
  const el = GG.el;
  const esc = GG.esc;
  const fmt = GG.fmt;
  const TERMS = {};
  (window.GG_TERMS || []).forEach((t) => { TERMS[t.id] = t; });
  const canHover = !!(window.matchMedia && matchMedia('(hover: hover)').matches);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* Cross-link HTML, already decorated (so it also works in content shown after boot). */
  function T(id, text) {
    const t = TERMS[id];
    const color = t ? (GG.SECTIONS[t.section] || GG.SECTIONS.intro).color : 'var(--accent)';
    return `<a data-term="${id}" href="#${id}" class="term" style="--c:${color}">${text == null ? (t ? esc(t.name) : id) : text}</a>`;
  }
  const X = (href, text) => `<a href="${href}" class="ext" target="_blank" rel="noopener noreferrer">${text}</a>`;

  /* cb(width) whenever el's content width changes. */
  function onWidth(node, cb) {
    let last = -1;
    const run = (w) => { w = Math.floor(w); if (w > 0 && Math.abs(w - last) >= 1) { last = w; cb(w); } };
    GG.resize(node, (r) => run(r.width));
    requestAnimationFrame(() => run(node.getBoundingClientRect().width));
  }

  /* Run a figure builder; if it throws, keep the prose and show an error box. */
  function guard(parent, label, fn) {
    try { return fn(); } catch (e) {
      console.error('[ds-a] ' + label + ' failed', e);
      if (parent) parent.insertAdjacentHTML('beforeend', `<div class="entry-error">${esc(label)} could not be drawn: ${esc(e && e.message)}</div>`);
      return null;
    }
  }

  /* SVG helpers. Every shape gets explicit colours via inline style (tokens). */
  function S(tag, attrs, parent) { return GG.svg(tag, attrs, parent); }
  function svgRoot(parent, w, h, label) {
    const s = S('svg', { viewBox: `0 0 ${w} ${h}`, class: 'dsa-svg', role: 'img', 'aria-label': label });
    parent.appendChild(s);
    return s;
  }
  function tx(p, x, y, str, o) {
    o = o || {};
    let st = `fill:${o.fill || 'var(--ink-2)'};font-family:${o.font || 'var(--font-mono)'};font-size:${o.size || 11}px;`;
    if (o.weight) st += `font-weight:${o.weight};`;
    if (o.ls) st += `letter-spacing:${o.ls};`;
    if (o.style) st += o.style;
    const t = S('text', { x, y, style: st, 'text-anchor': o.anchor || 'start', 'dominant-baseline': o.base || null, class: o.cls || null, opacity: o.op == null ? null : o.op }, p);
    t.textContent = str;
    return t;
  }
  function rect(p, x, y, w, h, o) {
    o = o || {};
    let st = `fill:${o.fill || 'none'};stroke:${o.stroke || 'none'};stroke-width:${o.sw == null ? 1 : o.sw};`;
    if (o.dash) st += `stroke-dasharray:${o.dash};`;
    if (o.style) st += o.style;
    return S('rect', { x, y, width: Math.max(0, w), height: Math.max(0, h), rx: o.rx == null ? 4 : o.rx, style: st, class: o.cls || null, opacity: o.op == null ? null : o.op }, p);
  }
  function line(p, x1, y1, x2, y2, o) {
    o = o || {};
    let st = `stroke:${o.stroke || 'var(--line-2)'};stroke-width:${o.sw || 1};fill:none;`;
    if (o.dash) st += `stroke-dasharray:${o.dash};`;
    return S('line', { x1, y1, x2, y2, style: st, class: o.cls || null, 'marker-end': o.marker || null }, p);
  }
  function path(p, d, o) {
    o = o || {};
    let st = `stroke:${o.stroke || 'none'};stroke-width:${o.sw || 1};fill:${o.fill || 'none'};`;
    if (o.dash) st += `stroke-dasharray:${o.dash};`;
    if (o.style) st += o.style;
    return S('path', { d, style: st, class: o.cls || null, opacity: o.op == null ? null : o.op }, p);
  }
  /* small filled arrow head at (x, y) pointing in direction (dx, dy) */
  function head(p, x, y, dx, dy, color, size) {
    const s = size || 6, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
    const bx = x - ux * s, by = y - uy * s;
    return path(p, `M${x},${y} L${bx - uy * s * 0.55},${by + ux * s * 0.55} L${bx + uy * s * 0.55},${by - ux * s * 0.55} Z`, { fill: color });
  }
  /* make an SVG group behave like a button */
  function hit(g, label, onAct) {
    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'button');
    g.setAttribute('aria-label', label);
    g.classList.add('dsa-hit');
    g.addEventListener('click', onAct);
    g.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      // onAct usually redraws the whole SVG: refocus the button with the same label in the new drawing
      const host = g.closest('.dsa-w');
      onAct(e);
      if (!g.isConnected && host) { const n = [...host.querySelectorAll('.dsa-hit')].find((x) => x.getAttribute('aria-label') === label); if (n) n.focus(); }
    });
    /* focus ring: a rect laid over the group's box, appended last to the SVG so neighbours never cover it */
    let ring = null;
    g.addEventListener('focus', () => {
      const svg = g.ownerSVGElement;
      if (!svg || !g.matches(':focus-visible')) return;
      const b = g.getBBox();
      ring = S('rect', { x: b.x - 2.5, y: b.y - 2.5, width: b.width + 5, height: b.height + 5, rx: 5, class: 'dsa-ring on' }, svg);
    });
    g.addEventListener('blur', () => { if (ring) { ring.remove(); ring = null; } });
  }
  function mulberry(seed) {
    let a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  /* strand: a wavy vertical/horizontal thread, the weaving motif */
  function strandPath(x0, y0, len, amp, waves, horizontal) {
    const n = 24;
    let d = '';
    for (let i = 0; i <= n; i++) {
      const u = i / n, w = Math.sin(u * waves * Math.PI * 2) * amp;
      const x = horizontal ? x0 + u * len : x0 + w, y = horizontal ? y0 + w : y0 + u * len;
      d += (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1);
    }
    return d;
  }

  const LINDHOLM = 'https://www.cs.cmu.edu/afs/cs/academic/class/15869-f11/www/readings/lindholm08_tesla.pdf';
  const CPG_SCALABLE = 'https://docs.nvidia.com/cuda/cuda-c-programming-guide/#a-scalable-programming-model';
  const REFRESHER = 'https://developer.nvidia.com/blog/cuda-refresher-cuda-programming-model/';
  const CPG_MODEL = 'https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#programming-model';
  const CPG = 'https://docs.nvidia.com/cuda/cuda-c-programming-guide/';
  const GODBOLT = 'https://godbolt.org/z/5r9ej3zjW';
  const CC_TARGET = 'https://docs.nvidia.com/cuda/parallel-thread-execution/#ptx-module-directives-target';

  /* ═════════════════════════════ CUDA (Programming Model) ═════════════════════════════ */

  /* Fig: the three things called CUDA */
  function threeMeanings(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Three things called “CUDA”', hint: canHover ? 'click a meaning' : 'tap a meaning', wide: true,
      caption: 'One acronym, Compute Unified Device Architecture, three referents. When this site says “the CUDA programming model” it means the middle one: the abstract machine a programmer writes against. The other two have their own entries.',
    });
    const M = [
      { k: 'arch', name: 'Device architecture', em: 'hardware', term: 'cuda-device-architecture',
        why: `<b>CUDA as hardware.</b> A ${T('cuda-device-architecture', 'high-level device architecture')}: GPUs built from many general-purpose ${T('streaming-multiprocessor', 'Streaming Multiprocessors')} instead of a fixed graphics pipeline. Used like this in a sentence: “the H100 is a CUDA GPU.”` },
      { k: 'model', name: 'Programming model', em: 'this entry', term: 'cuda-programming-model',
        why: `<b>CUDA as a way of thinking.</b> A parallel programming model for architectures with that design: threads grouped into blocks and grids, a matching hierarchy of memories, and barriers. Used like this: “write it in CUDA style, one thread per output element.”` },
      { k: 'platform', name: 'Software platform', em: 'software', term: 'cuda-software-platform',
        why: `<b>CUDA as software.</b> A ${T('cuda-software-platform', 'software platform')} that extends high-level languages like C with that programming model: compilers, libraries, drivers and tools. Used like this: “upgrade to CUDA 12.” (Toolkit version numbers, a different numbering from ${T('compute-capability', 'compute capability')}.)` },
    ];
    const grid = el('div', { class: 'dsa-mean' });
    f.stage.append(grid);
    const cards = M.map((m) => {
      const b = el('button', { type: 'button', class: 'dsa-mcard', 'aria-pressed': 'false' });
      const s = S('svg', { viewBox: '0 0 190 96', role: 'img', 'aria-label': m.name + ' illustration' });
      drawMeaning(s, m.k);
      b.append(s, el('em', { text: m.em }), el('b', { text: m.name }), el('span', { text: m.k === 'arch' ? 'The chip design.' : m.k === 'model' ? 'The abstractions you program against.' : 'The languages, libraries and tools.' }));
      b.addEventListener('click', () => pick(m.k));
      grid.append(b);
      return b;
    });
    function pick(k) {
      M.forEach((m, i) => cards[i].setAttribute('aria-pressed', String(m.k === k)));
      f.setWhy(M.find((m) => m.k === k).why);
    }
    pick('model');
  }
  function drawMeaning(s, k) {
    /* Every drawing carries its own labels (10 px in a 190-wide viewBox, drawn at up to 230-250 px). */
    if (k === 'arch') {
      rect(s, 22, 3, 146, 90, { fill: 'rgba(255,255,255,0.03)', stroke: 'var(--ink-3)', rx: 6 });
      for (let i = 0; i < 4; i++) {
        const x = 29 + i * 34.5;
        rect(s, x, 9, 30, 52, { fill: 'rgba(255,255,255,0.03)', stroke: 'var(--line-2)', rx: 3 });
        tx(s, x + 15, 20, 'SM', { anchor: 'middle', size: 9.5, weight: 600, fill: 'var(--ink-2)' });
        for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) rect(s, x + 5 + c * 11, 25 + r * 11, 9, 8, { fill: 'rgba(69,212,155,0.6)', rx: 1.5 });
      }
      rect(s, 29, 67, 132, 20, { fill: 'rgba(111,166,255,0.3)', stroke: 'var(--memory)', rx: 3 });
      tx(s, 95, 81, 'GPU RAM', { anchor: 'middle', size: 10, weight: 600, fill: 'var(--ink)' });
      for (let i = 0; i < 6; i++) { line(s, 22, 12 + i * 14, 16, 12 + i * 14, { stroke: 'var(--ink-3)' }); line(s, 168, 12 + i * 14, 174, 12 + i * 14, { stroke: 'var(--ink-3)' }); }
    } else if (k === 'model') {
      for (let b = 0; b < 3; b++) {
        const x = 8 + b * 60;
        rect(s, x, 3, 54, 90, { fill: 'rgba(255,255,255,0.025)', stroke: 'var(--line-2)', dash: '4 3', rx: 5 });
        rect(s, x + 4, 8, 46, 15, { fill: 'rgba(111,166,255,0.3)', stroke: 'rgba(111,166,255,0.7)', rx: 2 });
        tx(s, x + 27, 19, 'shared', { anchor: 'middle', size: 9, fill: 'var(--ink)' });
        for (let t = 0; t < 5; t++) path(s, strandPath(x + 11 + t * 8, 28, 44, 2, 2.2, false), { stroke: 'var(--ink-2)', sw: 1.2 });
        tx(s, x + 27, 87, 'block', { anchor: 'middle', size: 10, weight: 600, fill: 'var(--ink-2)' });
      }
    } else {
      const L = ['Applications', 'Libraries', 'Runtime · Driver API', 'nvcc · PTX · SASS'];
      L.forEach((l, i) => { rect(s, 14, 3 + i * 23, 162, 19, { fill: 'rgba(184,164,255,0.18)', stroke: 'rgba(184,164,255,0.6)', rx: 3 }); tx(s, 95, 16.5 + i * 23, l, { anchor: 'middle', size: 10.5, fill: 'var(--ink)' }); });
    }
  }

  /* Fig: the modelMap component, both hierarchies */
  function mapFigure(host, ctx) {
    const f = ctx.figure(host, {
      title: 'The two hierarchies and the hardware under them', hint: canHover ? 'hover or click a level' : 'tap a level', wide: true,
      caption: `Left: the abstract thread-group and memory hierarchies of the CUDA programming model. Right: the matching hardware implementing those abstractions. Amber connectors read “runs on”, blue ones “lives in”. Modified from diagrams in NVIDIA’s <a href="${REFRESHER}">CUDA Refresher: The CUDA Programming Model</a> and the NVIDIA <a href="${CPG_MODEL}">CUDA C++ Programming Guide</a>, as in the glossary. The thread-level registers and the SM’s register file are our addition: the glossary’s figure starts at shared memory.`,
    });
    const MM = GG.components.modelMap;
    const host2 = el('div');
    f.stage.append(host2);
    let names = 'cuda', base = null, map = null;
    const GROUPS = {
      none: null,
      exec: ['thread', 'block', 'grid'],
      mem: ['registers', 'shared', 'global'],
    };
    const WHY = {
      none: 'Two hierarchies side by side. Hover or tap any level to see what implements it; the buttons above light a whole hierarchy.',
      exec: () => names === 'ptx'
        ? `<b>Abstraction 1, the hierarchy of thread groups.</b> ${T('thread', 'Threads')} are grouped into ${T('cooperative-thread-array', 'cooperative thread arrays (CTAs)')}, and CTAs into a grid of CTAs. Each level lands on a bigger piece of hardware: a core, a ${T('streaming-multiprocessor', 'Streaming Multiprocessor')}, the whole GPU.`
        : `<b>Abstraction 1, the hierarchy of thread groups.</b> ${T('thread', 'Threads')} are grouped into ${T('thread-block', 'blocks')}, and blocks into a ${T('thread-block-grid', 'grid')}. Each level lands on a bigger piece of hardware: a core, a ${T('streaming-multiprocessor', 'Streaming Multiprocessor')}, the whole GPU.`,
      mem: () => names === 'ptx'
        ? `<b>Abstraction 2, the hierarchy of memories.</b> Each level of the thread hierarchy has a memory of its own: ${T('registers', 'registers')} (<code>.reg</code>), private to one thread; ${T('shared-memory', 'shared memory')} (<code>.shared</code>), shared by the threads of one CTA and living in the SM’s ${T('l1-data-cache', 'L1 data cache')}; ${T('global-memory', 'global memory')} (<code>.global</code>), visible to the whole grid of CTAs and living in ${T('gpu-ram', 'GPU RAM')}. Shared and global memory are where threads communicate.`
        : `<b>Abstraction 2, the hierarchy of memories.</b> Each level of the thread hierarchy has a memory of its own: ${T('registers', 'registers')}, private to one thread; ${T('shared-memory', 'shared memory')}, shared by the threads of one block and living in the SM’s ${T('l1-data-cache', 'L1 data cache')}; ${T('global-memory', 'global memory')}, visible to the whole grid and living in ${T('gpu-ram', 'GPU RAM')}. Shared and global memory are where threads communicate.`,
    };
    const why = (k) => (typeof WHY[k] === 'function' ? WHY[k]() : WHY[k]);
    function levelWhy(key) {
      const L = MM.LEVELS_BY[key];
      if (!L) return '';
      const P = MM.LEVELS_BY[L.pair];
      const sw = L.side === 'software' ? L : P, hw = L.side === 'software' ? P : L;
      const swName = names === 'ptx' && sw.ptxName ? sw.ptxName : sw.name;
      const swTerm = names === 'ptx' && sw.ptxTerm ? sw.ptxTerm : sw.term;
      const verb = sw.kind === 'exec' ? (sw.key === 'grid' ? 'runs across' : 'runs on') : 'lives in';
      const desc = names === 'ptx' && sw.ptxDesc ? sw.ptxDesc : sw.desc;
      return `<b>${T(swTerm, esc(swName))}</b> ${verb} <b>${T(hw.term, esc(hw.name))}</b>. ${esc(desc)}`;
    }
    function build() {
      if (map) map.destroy();
      map = MM(host2, { names, caption: false, animate: false, highlight: GROUPS[base || 'none'] || undefined });
      map.on('hover', (e) => { if (e && e.key) f.setWhy(levelWhy(e.key)); else restore(); });
      map.on('select', (e) => { if (e.key) f.setWhy(levelWhy(e.key)); else { if (GROUPS[base]) map.highlight(GROUPS[base]); restore(); } });
    }
    function restore() {
      const k = map.keys();
      if (k.length === 1 || (k.length === 2 && MM.PAIRS[k[0]] === k[1])) f.setWhy(levelWhy(k[0]));
      else f.setWhy(why(base || 'none'));
    }
    /* Rough access cost per memory level, shown with the "Memories" state (beyond the glossary). */
    const lat = el('div', { class: 'dsa-lat', role: 'img', 'aria-label': 'Approximate access cost on a log scale, compared with one arithmetic instruction of a few cycles: registers are read as part of the instruction; shared memory takes tens of cycles; global memory hundreds of cycles.' });
    const LAT = [
      ['registers', 'read as part of the instruction', 0],
      ['shared memory (L1)', 'tens of cycles', 25],
      ['global memory (GPU RAM)', 'hundreds of cycles', 500],
    ];
    const logX = (c) => (c ? (Math.log10(c) / 3 * 100) : 1.5).toFixed(1);
    const FFMA_C = 4; // one arithmetic instruction, a few cycles: the reference the glossary compares against
    lat.innerHTML = `<div class="dsa-k">Access cost, roughly, in clock cycles (log scale) <span class="dsa-tag beyond">beyond the glossary</span></div>` +
      `<div class="dsa-lat-row dsa-lat-refrow"><span>reference: one arithmetic instruction (e.g. FFMA)</span><span class="dsa-lat-axis"><i class="dsa-lat-ref" style="left:${logX(FFMA_C)}%"></i><em style="left:${logX(FFMA_C)}%">a few cycles</em></span><span></span></div>` +
      LAT.map(([n, d, c]) => `<div class="dsa-lat-row"><span>${esc(n)}</span><span class="dsa-lat-bar"><i style="width:${logX(c)}%;background:var(--memory)"></i><b class="dsa-lat-ref" style="left:${logX(FFMA_C)}%"></b></span><span>${esc(d)}</span></div>`).join('') +
      `<div class="dsa-lat-note">The dashed tick in every bar is the cost of one arithmetic instruction. Log scale, orders of magnitude only; exact numbers vary by GPU. Registers cost nothing extra, shared memory sits within an order of magnitude of the instruction tick, and global memory is far beyond it: that is what “nearly as fast as executing an instruction” means.</div>`;
    f.stage.append(lat);
    const showLat = () => { lat.hidden = base !== 'mem'; };
    const seg = GG.ui.seg(f.controls, { label: 'Light up', value: 'exec', options: [{ value: 'none', label: 'Nothing' }, { value: 'exec', label: 'Thread groups' }, { value: 'mem', label: 'Memories' }], onChange: (v) => { base = v; showLat(); if (GROUPS[v]) map.highlight(GROUPS[v]); else map.clear(); f.setWhy(why(v)); } });
    GG.ui.seg(f.controls, { label: 'Names', value: 'cuda', options: [{ value: 'cuda', label: 'CUDA C++', title: 'thread, thread block, kernel grid' }, { value: 'ptx', label: 'PTX / SASS', title: 'thread, cooperative thread array, grid of CTAs' }], onChange: (v) => { names = v; build(); restore(); } });
    base = seg.get();
    showLat();
    build();
    f.setWhy(why(base));
    return f;
  }

  /* Fig: barrier synchronization, threads racing to a __syncthreads() */
  function barrierSim(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Abstraction 3: a barrier', hint: 'press play · toggle the barrier', wide: true,
      caption: 'Eight threads of one block, each moving left to right at its own speed. Each writes one slot of shared memory (a blue line flashes up to the slot it fills), then reads its neighbour’s slot: a green line if the neighbour had already written it, a red one if not, in which case the thread read whatever stale value was left in that slot. A barrier (amber) holds every thread until all of them have arrived, so no read can overtake the write it depends on; an amber dot marks each thread that had to wait. Turn the barrier off to see the race. Speeds are random, and a real block has many more threads. Think of each lane as standing for one warp of the block: the 32 threads of a warp mostly advance together, so the threads that race are usually in different warps.',
    });
    const N = 8;
    const P_WRITE = 0.3, P_BAR = 0.5, P_READ = 0.72, P_END = 0.97;
    const st = { barrier: true, seed: 21, pos: [], speed: [], written: [], read: [], waited: [], released: false, t: 0, done: false };
    const wrap = el('div', { class: 'dsa-w' });
    f.stage.append(wrap);
    const codeHost = el('div', { class: 'dsa-bar-code' });
    f.stage.append(codeHost);
    const code = GG.code(codeHost, {
      lang: 'cuda', langLabel: 'cuda · illustrative', lineNumbers: false, copy: false,
      code: `// one slot per thread
__shared__ float s[8];
// phase 1: write my slot
s[threadIdx.x] = produce(threadIdx.x);
// barrier: wait for the whole block
__syncthreads();
// phase 2: read my neighbour's slot
float v = s[(threadIdx.x + 1) % 8];`,
    });
    const L_WRITE = [3, 4], L_BAR = [5, 6], L_READ = [7, 8];
    let W = 0, svg, R = {};
    function speeds() {
      const rnd = mulberry(st.seed);
      // about a third of the threads are stragglers, the rest run fast
      st.speed = Array.from({ length: N }, () => (rnd() < 0.35 ? 0.035 + rnd() * 0.025 : 0.1 + rnd() * 0.15));
      // make sure there is at least one straggler, so the race can show without the barrier
      if (!st.speed.some((v) => v < 0.07)) st.speed[Math.floor(rnd() * N)] = 0.035 + rnd() * 0.025;
    }
    function reset() {
      st.pos = new Array(N).fill(0.02); st.written = new Array(N).fill(false); st.read = new Array(N).fill(null); st.waited = new Array(N).fill(false);
      st.released = false; st.done = false;
    }
    /* run the whole simulation to its end at once (reduced motion, or "Jump to end") */
    function finish() { let k = 0; while (!st.done && k++ < 20000) step(0.02); }
    speeds(); reset();
    function draw() {
      wrap.innerHTML = '';
      const narrow = W < 560;
      const labW = narrow ? 44 : 70;
      const top = narrow ? 64 : 56;
      const laneH = narrow ? 24 : 26;
      const H = top + N * laneH + (narrow ? 44 : 34);
      svg = svgRoot(wrap, W, H, 'Eight threads approach a barrier; shared memory slots above them');
      const x0 = labW, x1 = W - 22;
      const X = (p) => x0 + p * (x1 - x0);
      R = { X, laneH, top, narrow };
      // shared memory strip
      const smW = Math.min(W - labW - 8, narrow ? 260 : 360);
      const smX = narrow ? labW : X(P_WRITE) - 20;
      tx(svg, narrow ? 0 : smX - 8, 18, 'shared memory  s[ ]', { anchor: narrow ? 'start' : 'end', size: 10, fill: 'var(--memory)' });
      R.slots = [];
      const slotY = narrow ? 22 : 4;
      for (let i = 0; i < N; i++) {
        const w = smW / N;
        const g = S('g', {}, svg);
        const r = rect(g, smX + i * w + 1, slotY, w - 2, 20, { fill: 'rgba(111,166,255,0.06)', stroke: 'rgba(111,166,255,0.45)', rx: 3 });
        const t = tx(g, smX + i * w + w / 2, slotY + 14, 's[' + i + ']', { anchor: 'middle', size: 9.5, fill: 'var(--ink-3)' });
        R.slots.push({ r, t, cx: smX + i * w + w / 2, by: slotY + 20, ty: slotY + 31 });
      }
      // links from a thread to the slot it writes or reads (drawn under the lanes' dots)
      R.links = S('g', {}, svg);
      // phase markers
      const markY0 = top - 10, markY1 = top + N * laneH;
      line(svg, X(P_WRITE), markY0, X(P_WRITE), markY1, { stroke: 'rgba(111,166,255,0.5)', dash: '2 4' });
      line(svg, X(P_READ), markY0, X(P_READ), markY1, { stroke: 'rgba(111,166,255,0.5)', dash: '2 4' });
      R.bar = rect(svg, X(P_BAR) - 3, markY0, 6, markY1 - markY0, { fill: 'var(--control)', rx: 2 });
      R.barLab = tx(svg, X(P_BAR), markY1 + (narrow ? 30 : 16), '__syncthreads()', { anchor: 'middle', size: 10, fill: 'var(--control)' });
      tx(svg, X(P_WRITE), markY1 + 16, narrow ? 'write' : 'write s[i]', { anchor: 'middle', size: 10, fill: 'var(--memory)' });
      tx(svg, X(P_READ), markY1 + 16, narrow ? 'read' : 'read s[i+1]', { anchor: 'middle', size: 10, fill: 'var(--memory)' });
      R.lanes = [];
      for (let i = 0; i < N; i++) {
        const y = top + i * laneH + laneH / 2;
        tx(svg, labW - 8, y + 4, (narrow ? 't' : 'thread ') + i, { anchor: 'end', size: 10, fill: 'var(--ink-3)' });
        line(svg, x0, y, x1, y, { stroke: 'var(--line)', sw: 1 });
        const trail = path(svg, '', { stroke: 'var(--ink-2)', sw: 1.4 });
        const dot = S('circle', { cx: X(0), cy: y, r: 6, style: 'fill:var(--core);stroke:var(--bg);stroke-width:1.5' }, svg);
        const mark = tx(svg, W - 2, y + 4, '', { size: 12, weight: 700, anchor: 'end' });
        const wl = line(R.links, 0, 0, 0, 0, { stroke: 'var(--memory)', sw: 1.6 });
        const rl = line(R.links, 0, 0, 0, 0, { stroke: 'var(--core)', sw: 1.6 });
        wl.style.opacity = 0; rl.style.opacity = 0;
        // an amber dot on the barrier line once this thread has had to wait there
        const wm = S('circle', { cx: X(P_BAR), cy: y, r: 3.2, style: 'fill:var(--control);stroke:var(--bg);stroke-width:1.2;opacity:0' }, svg);
        R.lanes.push({ y, trail, dot, mark, wl, rl, wm });
      }
      // slot tags last, so the red read lines never cover them
      R.slots.forEach((sl) => { sl.tag = tx(svg, sl.cx, sl.ty, '', { anchor: 'middle', size: 9.5, weight: 700, fill: 'var(--danger)', style: 'paint-order:stroke;stroke:var(--bg);stroke-width:3px;' }); });
      paint();
    }
    const FLASH = 0.09; // how long (in track units) a write/read link stays visible
    function link(ln, x1, y1, sl, op, color) {
      ln.setAttribute('x1', x1.toFixed(1)); ln.setAttribute('y1', y1.toFixed(1));
      ln.setAttribute('x2', sl.cx.toFixed(1)); ln.setAttribute('y2', sl.by.toFixed(1));
      ln.style.stroke = color; ln.style.opacity = String(op);
    }
    function paint() {
      if (!svg) return;
      const { X } = R;
      R.slots.forEach((s) => { s.tag.textContent = ''; s.r.style.stroke = 'rgba(111,166,255,0.45)'; s.r.style.strokeWidth = 1; });
      for (let i = 0; i < N; i++) {
        const L = R.lanes[i], p = st.pos[i];
        // write link: flashes when the thread crosses the write line
        const dw = p - P_WRITE;
        if (st.written[i] && dw < FLASH) link(L.wl, X(P_WRITE), L.y, R.slots[i], 1 - dw / FLASH, 'var(--memory)');
        else L.wl.style.opacity = 0;
        // read link: green flash if the neighbour had written its slot, red and persistent if not (a stale read)
        const nb = (i + 1) % N, dr = p - P_READ;
        if (st.read[i] === false) {
          link(L.rl, X(P_READ), L.y, R.slots[nb], 0.95, 'var(--danger)');
          R.slots[nb].tag.textContent = 'stale!';
          R.slots[nb].r.style.stroke = 'var(--danger)'; R.slots[nb].r.style.strokeWidth = 2;
        } else if (st.read[i] === true && dr < FLASH) link(L.rl, X(P_READ), L.y, R.slots[nb], 1 - dr / FLASH, 'var(--core)');
        else L.rl.style.opacity = 0;
        L.wm.style.opacity = st.barrier && st.waited[i] ? 1 : 0;
        L.dot.setAttribute('cx', X(p).toFixed(1));
        L.trail.setAttribute('d', strandPath(X(0.02), L.y, Math.max(0, X(p) - X(0.02)), 2.2, Math.max(0.5, p * 10), true));
        const waiting = st.barrier && !st.released && p >= P_BAR - 0.001 && p < P_READ;
        const stale = st.read[i] === false;
        L.dot.style.fill = stale ? 'var(--danger)' : waiting ? 'var(--control)' : st.read[i] ? 'var(--core)' : 'var(--core)';
        L.mark.textContent = st.read[i] === true ? '✓' : st.read[i] === false ? '✗' : '';
        L.mark.style.fill = st.read[i] === false ? 'var(--danger)' : 'var(--core)';
        const s = R.slots[i];
        s.r.style.fill = st.written[i] ? 'rgba(111,166,255,0.42)' : 'rgba(111,166,255,0.06)';
        s.t.style.fill = st.written[i] ? '#fff' : 'var(--ink-3)';
      }
      R.bar.style.opacity = st.barrier ? 1 : 0.12;
      R.barLab.style.opacity = st.barrier ? 1 : 0.35;
      R.barLab.textContent = st.barrier ? '__syncthreads()' : 'no barrier';
      stats();
    }
    const sWait = GG.ui.stat(f.readouts, { label: 'waiting', value: '0', tone: 'control' });
    const sOk = GG.ui.stat(f.readouts, { label: 'correct reads', value: '0', tone: 'core' });
    const sBad = GG.ui.stat(f.readouts, { label: 'stale reads', value: '0', tone: 'danger' });
    function stats() {
      const waiting = st.barrier && !st.released ? st.pos.filter((p) => p >= P_BAR - 0.001).length : 0;
      const ok = st.read.filter((r) => r === true).length, bad = st.read.filter((r) => r === false).length;
      sWait.set(st.barrier ? (st.released ? 'released' : waiting + ' / ' + N) : '—');
      sOk.set(ok + ' / ' + N); sBad.set(String(bad), bad ? 'danger' : null);
      code.clear();
      const anyBefore = st.pos.some((p) => p < P_WRITE);
      if (st.done) { const who = st.read.map((r, i) => (r === false ? `thread ${i} read s[${(i + 1) % N}] before thread ${(i + 1) % N} wrote it` : null)).filter(Boolean);
        f.setWhy(bad ? `<b>${bad} of ${N} reads ${bad === 1 ? 'was' : 'were'} stale:</b> ${who.join('; ')}. Without the barrier, a fast thread reached its read while its neighbour was still on the way to its write, so it read whatever old value was left in that slot. Nothing crashed: the program just computed the wrong thing, silently. That is a race.` : (st.barrier ? `<b>All ${N} reads saw the right value.</b> The barrier held the ${st.waited.filter(Boolean).length} early arrivals (amber dots) until the slowest thread had written its slot. Barriers are how a thread group coordinates execution. Turn the barrier off to see the same speeds race.` : `<b>All reads happened to be correct this time.</b> Without a barrier, correctness depends on luck in timing. Press “New speeds” and play again.`)); code.highlight(L_READ, bad ? 'control' : 'core'); return; }
      if (st.barrier && !st.released && waiting > 0) { f.setWhy(`<b>${waiting} of ${N} threads ${waiting === 1 ? 'is' : 'are'} waiting at the barrier.</b> Whoever arrives first just stops. Nobody passes until the last thread of the block has arrived${anyBefore ? ', and some have not even written their slot yet' : ''}.`); code.highlight(L_BAR, 'control'); return; }
      if (st.pos.every((p) => p <= 0.021)) { f.setWhy('Eight threads of one block are about to run the code below. Press play.'); return; }
      f.setWhy(st.barrier ? 'Threads run independently, at different speeds, until something makes them wait.' : (bad ? `<b>No barrier: ${bad} stale read${bad === 1 ? '' : 's'} so far.</b> A red line marks each read that reached a slot before its owner had written it, so it got an old value.` : '<b>No barrier.</b> Each thread runs straight through. Watch the fast threads reach the read line before the slow one has written.'));
      code.highlight(anyBefore ? L_WRITE : L_READ);
    }
    function step(dt) {
      const all = st.pos.every((p) => p >= P_BAR - 0.001);
      if (st.barrier && !st.released && all) st.released = true;
      for (let i = 0; i < N; i++) {
        if (st.barrier && !st.released && st.pos[i] >= P_BAR - 0.001) st.waited[i] = true; // stuck at the barrier for a step
        let p = st.pos[i] + st.speed[i] * dt * 4;
        if (st.barrier && !st.released && p > P_BAR) p = P_BAR;
        if (p > P_END) p = P_END;
        if (!st.written[i] && p >= P_WRITE) st.written[i] = true;
        if (st.read[i] == null && p >= P_READ) st.read[i] = st.written[(i + 1) % N];
        st.pos[i] = p;
      }
      if (st.pos.every((p) => p >= P_END)) { st.done = true; }
    }
    const anim = GG.anim(f.stage, (t, dt) => {
      if (st.done) { anim.stop(); play.sync(); return; }
      step(dt);
      paint();
    }, { autostart: false });
    const play = GG.ui.playButton(f.controls, anim, { onToggle: (on) => { if (on && st.done) { reset(); paint(); } } });
    // under reduced motion every change shows the finished run; otherwise it waits for Play
    const settle = () => { if (GG.reducedMotion) finish(); paint(); };
    GG.ui.button(f.controls, { label: 'Jump to end', icon: 'next', onClick: () => { anim.stop(); play.sync(); finish(); paint(); } });
    GG.ui.button(f.controls, { label: 'Reset', icon: 'reset', onClick: () => { anim.stop(); play.sync(); reset(); paint(); } });
    GG.ui.button(f.controls, { label: 'New speeds', onClick: () => { st.seed = (st.seed * 31 + 11) % 100003; speeds(); reset(); settle(); } });
    GG.ui.toggle(f.controls, { label: 'Barrier', value: true, onChange: (v) => { st.barrier = v; reset(); settle(); } });
    if (GG.reducedMotion) finish();
    onWidth(wrap, (w) => { W = w; draw(); });
    if (!GG.reducedMotion) GG.onVisible(f.stage, () => { if (!anim.running && !st.done && st.pos.every((p) => p <= 0.021)) { anim.start(); play.sync(); } }, { once: true });
  }

  /* Fig: wave scheduling of blocks onto SMs */
  function waveSim(host, ctx) {
    const f = ctx.figure(host, {
      title: 'One program, two GPUs: blocks scheduled in waves', hint: 'drag the sliders · press play', wide: true,
      caption: `Redrawn from the glossary’s wave-scheduling figure (modified there from the <a href="${CPG}">CUDA Programming Guide</a>). As in the original, with one block per SM GPU A puts block 3 on SM 0 and block 2 on SM 1 in the second wave: which block lands on which SM, and in what order, is up to the hardware. The same simplifications as the original: every block takes the same time, and each SM runs one block at a time, so a “wave” is one block per SM. Raise “blocks per SM” to let each SM hold several blocks at once, as real SMs do: a thin green outline then groups the blocks one SM holds during one wave. Time runs downwards; the amber line is now.`,
    });
    const st = { n: 8, a: 2, b: 4, k: 1, shuffle: false };
    const wrap = el('div', { class: 'dsa-w' });
    f.stage.append(wrap);
    let W = 0, svg = null, G = [], tNow = null;
    const waves = (nSM, k) => Math.ceil(st.n / (nSM * k));
    /* gi 0 = GPU A, 1 = GPU B. Unshuffled, GPU A swaps blocks 2 and 3 as the glossary's figure does. */
    function order(gi) {
      const o = Array.from({ length: st.n }, (_, i) => i);
      if (st.shuffle) { const r = mulberry(st.n * 97 + st.a * 13 + st.b * 7 + st.k + gi * 5003); for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; } }
      else if (gi === 0 && st.n >= 4 && st.k === 1) { o[2] = 3; o[3] = 2; }
      return o;
    }
    function chipLabel(i, w) { return w >= 60 ? 'Block ' + i : w >= 26 ? 'B' + i : String(i); }
    function draw() {
      wrap.innerHTML = '';
      const narrow = W < 700;
      const wA = waves(st.a, st.k), wB = waves(st.b, st.k), wMax = Math.max(wA, wB);
      // program box
      const perRow = narrow ? Math.min(8, st.n) : Math.min(8, st.n);
      const progW = Math.min(W, narrow ? W : 660);
      const progX = (W - progW) / 2;
      const pcW = (progW - 24 - (perRow - 1) * 6) / perRow;
      const pRows = Math.ceil(st.n / perRow);
      const pcH = 22;
      const progH = 30 + pRows * (pcH + 6) + 6;
      const gap = 40;
      const panelW = narrow ? W : (W - 24) / 2;
      // several blocks per SM: side by side if there is room, otherwise stacked inside the SM's column
      const minSub = Math.min(...[st.a, st.b].map((nS) => ((panelW - 72) / nS - 4) / st.k));
      const stack = st.k > 1 && minSub < 24;
      let rowH = clamp(Math.floor(300 / wMax), 20, 34);
      if (stack) rowH = Math.max(rowH, st.k * 15 + 8);
      const smH = 24;
      const panelH = (nS, nw) => 32 + smH + 14 + nw * rowH + 12;
      const hA = panelH(st.a, narrow ? wA : wMax), hB = panelH(st.b, narrow ? wB : wMax);
      const H = progH + gap + (narrow ? hA + 18 + hB : Math.max(hA, hB)) + 4;
      svg = svgRoot(wrap, W, H, `A CUDA program of ${st.n} blocks scheduled onto a GPU with ${st.a} SMs in ${wA} waves and onto a GPU with ${st.b} SMs in ${wB} waves`);
      rect(svg, progX + 0.5, 0.5, progW - 1, progH - 1, { fill: 'rgba(255,255,255,0.02)', stroke: 'var(--line-2)', dash: '5 4', rx: 8 });
      tx(svg, progX + 12, 19, 'CUDA program · ' + st.n + (st.n === 1 ? ' block' : ' blocks'), { size: 11.5, fill: 'var(--ink)' });
      for (let i = 0; i < st.n; i++) {
        const r = Math.floor(i / perRow), c = i % perRow;
        const x = progX + 12 + c * (pcW + 6), y = 30 + r * (pcH + 6);
        rect(svg, x, y, pcW, pcH, { fill: 'var(--surface-3)', stroke: 'var(--ink-3)', rx: 4 });
        tx(svg, x + pcW / 2, y + 15, chipLabel(i, pcW), { anchor: 'middle', size: 10.5, fill: 'var(--ink)' });
      }
      G = [];
      [[st.a, wA, 'A'], [st.b, wB, 'B']].forEach(([nS, nw, name], gi) => {
        const ord = order(gi);
        const px = narrow ? 0 : gi * (panelW + 24);
        const py = progH + gap + (narrow && gi ? hA + 18 : 0);
        // arrow from program
        const ax = narrow ? (gi ? W * 0.68 : W * 0.32) : px + panelW / 2;
        const sx = progX + progW * (gi ? 0.62 : 0.38);
        const midY = progH + gap * 0.5;
        if (!narrow || gi === 0) {
          path(svg, `M${sx},${progH} V${midY} H${ax} V${py - 4}`, { stroke: 'var(--control)', sw: 1.2 });
          head(svg, ax, py - 1, 0, 1, 'var(--control)', 6);
        } else {
          path(svg, `M${sx},${progH} V${midY} H${W - 6} V${py - 4}`, { stroke: 'var(--control)', sw: 1.2, dash: '4 3' });
          head(svg, W - 6, py - 1, 0, 1, 'var(--control)', 6);
        }
        const ph = gi ? hB : hA;
        rect(svg, px + 0.5, py + 0.5, panelW - 1, ph - 1, { fill: 'rgba(255,255,255,0.02)', stroke: 'var(--line-2)', dash: '5 4', rx: 8 });
        const title = tx(svg, px + 12, py + 20, `GPU ${name} · ${nS} SM${nS === 1 ? '' : 's'}` + (st.k > 1 ? (narrow ? ` · ${st.k} blocks/SM` : ` · ${st.k} resident blocks per SM`) : ''), { size: 11.5, fill: 'var(--ink)' });
        const doneLab = tx(svg, px + panelW - 12, py + 20, '', { size: 11, anchor: 'end', fill: 'var(--core)' });
        const labW = 60;
        const gx = px + labW, gw = panelW - labW - 12;
        const colW = gw / nS;
        const smY = py + 32;
        for (let s = 0; s < nS; s++) {
          rect(svg, gx + s * colW + 2, smY, colW - 4, smH, { fill: 'rgba(69,212,155,0.08)', stroke: 'rgba(69,212,155,0.55)', rx: 4 });
          tx(svg, gx + s * colW + colW / 2, smY + 16, colW >= 44 ? 'SM ' + s : String(s), { anchor: 'middle', size: 10.5, fill: 'var(--ink)' });
        }
        const wy0 = smY + smH + 14;
        // time arrow
        line(svg, px + 9, wy0, px + 9, wy0 + nw * rowH - 2, { stroke: 'var(--control)', sw: 1.2 });
        head(svg, px + 9, wy0 + nw * rowH + 2, 0, 1, 'var(--control)', 6);
        tx(svg, px + 4, wy0 - 3, 'time ↓', { size: 9, fill: 'var(--control)' });
        const rowsG = [];
        for (let w = 0; w < nw; w++) {
          const y = wy0 + w * rowH;
          const rr = rect(svg, gx, y + 1, gw, rowH - 3, { fill: 'rgba(255,255,255,0.015)', stroke: 'var(--line)', dash: '4 3', rx: 4 });
          const lt = tx(svg, px + labW - 6, y + rowH / 2 + 3.5, rowH >= 24 ? 'wave ' + (w + 1) : 'w' + (w + 1), { anchor: 'end', size: 9.5, fill: 'var(--ink-3)' });
          rowsG.push({ rr, lt });
        }
        // with several resident blocks per SM, outline what each SM holds in each wave
        if (st.k > 1) for (let w = 0; w < nw; w++) for (let sm = 0; sm < nS; sm++) rect(svg, gx + sm * colW + 1.5, wy0 + w * rowH + 2, colW - 3, rowH - 5, { fill: 'none', stroke: 'rgba(69,212,155,0.45)', rx: 3 });
        const now = line(svg, gx - 4, wy0, gx + gw + 2, wy0, { stroke: 'var(--control)', sw: 2 });
        const chips = [];
        const cap = nS * st.k;
        const cw = stack ? colW - 4 : (colW - 4) / st.k;
        const chH = stack ? (rowH - 7) / st.k : rowH - 7;
        for (let j = 0; j < st.n; j++) {
          const w = Math.floor(j / cap), slot = j % cap, sm = Math.floor(slot / st.k), sub = slot % st.k;
          const x = gx + sm * colW + 2 + (stack ? 0 : sub * cw), y = wy0 + w * rowH + 3 + (stack ? sub * chH : 0);
          const g = S('g', {}, svg);
          const r = rect(g, x + 1, y + (stack ? 0.5 : 0), cw - 2, chH - (stack ? 1 : 0), { fill: 'var(--surface-3)', stroke: 'var(--ink-3)', rx: stack ? 2 : 3 });
          // stacked chips are short: number only, kept at 10 px
          const lab = stack ? String(ord[j]) : chH >= 12 ? chipLabel(ord[j], cw - 2) : '';
          const t = tx(g, x + cw / 2, y + chH / 2 + 3.5, lab, { anchor: 'middle', size: 10, fill: 'var(--ink)' });
          g.setAttribute('aria-label', 'Block ' + ord[j]);
          chips.push({ g, r, t, w, state: '' });
        }
        G.push({ chips, rowsG, now, wy0, rowH, nw, gx, gw, doneLab, title });
      });
      paint();
    }
    function setState(c, s) {
      if (c.state === s) return;
      c.state = s;
      if (s === 'run') { c.r.style.fill = 'rgba(69,212,155,0.32)'; c.r.style.stroke = 'var(--core)'; c.g.style.opacity = 1; c.t.style.fill = '#fff'; }
      else if (s === 'done') { c.r.style.fill = 'rgba(69,212,155,0.08)'; c.r.style.stroke = 'rgba(69,212,155,0.45)'; c.g.style.opacity = 0.55; c.t.style.fill = 'var(--ink-2)'; }
      else if (s === 'wait') { c.r.style.fill = 'transparent'; c.r.style.stroke = 'var(--line-2)'; c.g.style.opacity = 0.5; c.t.style.fill = 'var(--ink-3)'; }
      else { c.r.style.fill = 'var(--surface-3)'; c.r.style.stroke = 'var(--ink-3)'; c.g.style.opacity = 1; c.t.style.fill = 'var(--ink)'; }
    }
    function paint() {
      G.forEach((g) => {
        if (tNow == null) {
          g.chips.forEach((c) => setState(c, 'static'));
          g.now.style.opacity = 0;
          g.doneLab.textContent = g.nw + (g.nw === 1 ? ' wave' : ' waves');
          g.doneLab.style.fill = 'var(--ink-2)';
          return;
        }
        const t = tNow;
        g.chips.forEach((c) => setState(c, t < 0 ? 'wait' : c.w < Math.floor(t) || t >= g.nw ? 'done' : c.w === Math.floor(t) ? 'run' : 'wait'));
        const y = g.wy0 + clamp(t, 0, g.nw) * g.rowH - 1;
        g.now.setAttribute('y1', y.toFixed(1)); g.now.setAttribute('y2', y.toFixed(1));
        g.now.style.opacity = t >= 0 && t < g.nw ? 1 : 0;
        if (t >= g.nw) { g.doneLab.textContent = 'done · ' + g.nw + (g.nw === 1 ? ' wave' : ' waves'); g.doneLab.style.fill = 'var(--core)'; }
        else if (t >= 0) { g.doneLab.textContent = 'wave ' + (Math.floor(t) + 1) + ' of ' + g.nw; g.doneLab.style.fill = 'var(--control)'; }
        else { g.doneLab.textContent = 'launching'; g.doneLab.style.fill = 'var(--ink-3)'; }
      });
    }
    const sA = GG.ui.stat(f.readouts, { label: 'waves on A', value: '', tone: 'control' });
    const sB = GG.ui.stat(f.readouts, { label: 'waves on B', value: '', tone: 'control' });
    const sX = GG.ui.stat(f.readouts, { label: 'B vs A', value: '', tone: 'core' });
    const sT = GG.ui.stat(f.readouts, { label: 'busy in B’s last wave', value: '' });
    function update() {
      const wA = waves(st.a, st.k), wB = waves(st.b, st.k);
      const capA = st.a * st.k, capB = st.b * st.k;
      const lastB = st.n - (wB - 1) * capB, lastA = st.n - (wA - 1) * capA;
      sA.set(String(wA)); sB.set(String(wB));
      const ratio = wA / wB;
      sX.set(ratio === 1 ? 'same time' : ratio > 1 ? fmt.sig(ratio, 3) + '× faster' : fmt.sig(1 / ratio, 3) + '× slower', ratio > 1 ? 'core' : ratio < 1 ? 'danger' : null);
      sT.set(lastB + ' / ' + capB + ' slots', lastB < capB ? 'danger' : 'core');
      const per = st.k === 1 ? 'one block per SM at a time' : st.k + ' blocks per SM at a time';
      const pl = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');
      let why = `<b>${pl(st.n, 'block')}</b> on <b>${pl(st.a, 'SM')}</b> ${st.n === 1 ? 'takes' : 'take'} <b>${pl(wA, 'wave')}</b>; on <b>${pl(st.b, 'SM')}</b>, <b>${pl(wB, 'wave')}</b> (${per}). `;
      if (st.a === st.b) why += 'The two GPUs are the same size, so they need the same number of waves.';
      else if (ratio > 1) why += `Same program, no code change: ${wB} step${wB === 1 ? '' : 's'} instead of ${wA} on the bigger GPU, ${ratio === 2 ? 'half as many' : fmt.sig(ratio, 3) + '× as fast'}.`;
      else if (ratio < 1) why += `GPU B is the smaller one here, so it needs more steps.`;
      else if (st.n <= Math.min(capA, capB)) why += `There ${st.n === 1 ? 'is only 1 block' : `are only ${st.n} blocks`}, so both GPUs fit the whole program in one wave and the bigger GPU’s extra SMs sit idle: a program must expose enough blocks to benefit from a bigger GPU.`;
      else why += `Both need the same number of waves: the bigger GPU’s extra SMs just sit idle in the last, partly empty wave, so it finishes no sooner.`;
      if (lastB < capB && ratio !== 1 && st.n > capB) why += ` B’s last wave runs only ${lastB} of ${capB} slots, the rest idle.`;
      if (st.shuffle) why += ' Block order is shuffled: the result is the same, because blocks cannot depend on each other’s order.';
      f.setWhy(why);
    }
    const rebuild = () => { update(); if (W) draw(); };
    GG.ui.slider(f.controls, { label: 'Blocks in the program', min: 1, max: 24, value: st.n, onInput: (v) => { st.n = v; rebuild(); } });
    GG.ui.slider(f.controls, { label: 'SMs on GPU A', min: 1, max: 8, value: st.a, onInput: (v) => { st.a = v; rebuild(); } });
    GG.ui.slider(f.controls, { label: 'SMs on GPU B', min: 1, max: 8, value: st.b, onInput: (v) => { st.b = v; rebuild(); } });
    GG.ui.slider(f.controls, { label: 'Blocks per SM at once', min: 1, max: 4, value: st.k, onInput: (v) => { st.k = v; rebuild(); } });
    GG.ui.toggle(f.controls, { label: 'Shuffle block order', value: false, onChange: (v) => { st.shuffle = v; rebuild(); } });
    const SPEED = 1.1;
    const anim = GG.anim(f.stage, (t) => {
      const wMax = Math.max(waves(st.a, st.k), waves(st.b, st.k));
      tNow = t * SPEED - 0.7;
      if (tNow > wMax + 0.6) { tNow = null; anim.stop(); anim.reset(); playBtn.sync(); }
      paint();
    }, { autostart: false });
    const playBtn = GG.ui.playButton(f.controls, anim, { onToggle: (on) => { if (on && tNow == null) anim.reset(); } });
    update();
    onWidth(wrap, (w) => { W = w; draw(); });
    if (!GG.reducedMotion) GG.onVisible(f.stage, () => { anim.reset(); anim.start(); playBtn.sync(); }, { once: true });
  }

  /* Fig: what threads can share inside a block, and what blocks can share with each other */
  function blocksFigure(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Inside a block, and between blocks', hint: 'pick what to try · toggle a cluster', wide: true,
      caption: `Two blocks of one grid, each with its own shared memory (blue strip, one slot per thread) and its own barrier (amber), above the global memory both can reach. Green arrows work; a red one does not. Thread block clusters, distributed shared memory and <code>cluster.sync()</code> are beyond the glossary (compute capability 9.0 and later, per NVIDIA’s <a href="${CPG}">CUDA C++ Programming Guide</a>).`,
    });
    const st = { k: 'in', cluster: false };
    let W = 0;
    const wrap = el('div', { class: 'dsa-w' });
    f.stage.append(wrap);
    const sOk = GG.ui.stat(f.readouts, { label: 'works?', value: '' });
    const sVia = GG.ui.stat(f.readouts, { label: 'through', value: '' });
    const WHY = {
      in: () => '<b>Inside a block, threads cooperate freely.</b> Thread 0 writes its slot of the block’s shared memory, the block waits at <code>__syncthreads()</code>, and thread 3 then reads the value. Every thread of block 0 sees the same shared memory and the same barrier.' + (st.cluster ? ' (The cluster changes nothing here.)' : ''),
      smem: () => (st.cluster
        ? '<b>With a thread block cluster, it can.</b> Blocks launched as one cluster run at the same time on SMs of one GPU Processing Cluster, and can read and write each other’s shared memory, which NVIDIA calls <em>distributed shared memory</em>. Here a thread of block 1 reads slot 1 of block 0.'
        : '<b>Block 1 cannot see block 0’s shared memory.</b> Each block gets its own shared memory, in the L1 of whichever SM runs it: maybe a different SM, maybe the same SM at a different time. No address in block 1 reaches it.'),
      bar: () => (st.cluster
        ? '<b>A cluster has a barrier of its own.</b> <code>cluster.sync()</code> (from cooperative groups) holds every thread of every block in the cluster until all have arrived; the amber line now spans both blocks. (A cooperative launch can likewise give a whole grid a barrier, by guaranteeing that all its blocks are resident at once.)'
        : '<b>A block’s barrier waits only for its own threads.</b> Three of block 0’s threads stand at <code>__syncthreads()</code> waiting for the fourth. Block 1’s threads never stop for them, and block 1 may not even have started yet: there is no barrier across ordinary blocks.'),
      glob: () => '<b>Between blocks, global memory is the meeting point.</b> Any block can read and write it, and atomic operations such as <code>atomicAdd</code> let many blocks update one value safely: here each block adds 1 to <code>count</code>. What blocks cannot safely do is wait for each other. If block 1 spun in a loop until block 0 had written, it could wait forever, because block 0 may not be running yet. That is why blocks can run in any order, on any number of SMs.' + (st.cluster ? ' (The cluster changes nothing here.)' : ''),
    };
    function draw() {
      if (!W) return;
      wrap.innerHTML = '';
      const narrow = W < 560;
      const gap = narrow ? 14 : 48, bw = (W - gap) / 2;
      const y0 = 22, PH = 156, gy = y0 + PH + 34, gh = 38, H = gy + gh + 4;
      const s = svgRoot(wrap, W, H, 'Two thread blocks, each with its own shared memory and barrier, above global memory');
      const sel = st.k;
      const ok = sel === 'in' || sel === 'glob' || st.cluster;
      // cluster outline
      if (st.cluster) {
        rect(s, 0.5, 2, W - 1, PH + y0 + 4, { fill: 'rgba(255,255,255,0.015)', stroke: 'var(--ink-2)', dash: '6 4', rx: 10 });
        tx(s, 10, 15, 'thread block cluster', { size: 10, weight: 600, fill: 'var(--ink-2)' });
      }
      const T = [];
      const barY = y0 + 102;
      [0, 1].forEach((b) => {
        const px = b * (bw + gap);
        rect(s, px + (st.cluster ? 6 : 0.5), y0, bw - (st.cluster ? 12 : 1), PH, { fill: 'rgba(255,255,255,0.025)', stroke: 'var(--line-2)', dash: '5 4', rx: 8 });
        tx(s, px + 14, y0 + 17, 'block ' + b, { size: 11, weight: 600, fill: 'var(--ink)' });
        // shared memory with one slot per thread
        const sx = px + 12, sw = bw - 24, sy = y0 + 26, sh = 26;
        rect(s, sx, sy, sw, sh, { fill: 'rgba(111,166,255,0.12)', stroke: 'var(--memory)', rx: 4 });
        if (!narrow) tx(s, sx + sw - 6, y0 + 17, 'its own shared memory', { anchor: 'end', size: 9.5, fill: 'var(--memory)' });
        const slots = [];
        for (let i = 0; i < 4; i++) {
          const cw = sw / 4, cx = sx + i * cw + cw / 2;
          const filled = (b === 0 && i === 0 && (sel === 'in')) || (b === 0 && i === 1 && sel === 'smem');
          rect(s, sx + i * cw + 3, sy + 4, cw - 6, sh - 8, { fill: filled ? 'rgba(111,166,255,0.45)' : 'rgba(111,166,255,0.06)', stroke: 'rgba(111,166,255,0.45)', rx: 3 });
          tx(s, cx, sy + 17, 's[' + i + ']', { anchor: 'middle', size: 10, fill: filled ? '#fff' : 'var(--ink-3)' });
          slots.push({ cx, by: sy + sh - 2, ty: sy + 4 });
        }
        // barrier line: per block, or one line across the cluster
        if (!st.cluster) {
          line(s, px + 10, barY, px + bw - 10, barY, { stroke: 'var(--control)', sw: sel === 'bar' ? 3 : 1.6, dash: sel === 'bar' ? null : '5 4' });
          tx(s, px + 12, barY + 14, narrow ? 'barrier' : '__syncthreads()', { size: 10, fill: 'var(--control)', style: 'paint-order:stroke;stroke:var(--bg);stroke-width:4px;' });
        }
        const thr = [];
        for (let i = 0; i < 4; i++) {
          const x = px + bw * (0.17 + 0.22 * i);
          // where each thread is in the "bar" snapshot
          let yy = y0 + 140, col = 'var(--core)';
          if (sel === 'bar') {
            const held = st.cluster || b === 0;
            if (held) { yy = i === 2 && b === 0 ? barY - 26 : barY - 7; col = i === 2 && b === 0 ? 'var(--core)' : 'var(--control)'; }
            else yy = y0 + 140;
          }
          path(s, strandPath(x, y0 + 60, Math.max(4, yy - y0 - 60), 2.2, 2, false), { stroke: 'var(--ink-2)', sw: 1.3 });
          S('circle', { cx: x, cy: yy, r: 5.5, style: `fill:${col};stroke:var(--bg);stroke-width:1.5` }, s);
          tx(s, x, y0 + PH - 3, 't' + i, { anchor: 'middle', size: 9.5, fill: 'var(--ink-3)' });
          thr.push({ x, y: y0 + 60, yy });
        }
        T.push({ px, slots, thr });
      });
      if (st.cluster) {
        line(s, 10, barY, W - 10, barY, { stroke: 'var(--control)', sw: sel === 'bar' ? 3 : 1.6, dash: sel === 'bar' ? null : '5 4' });
        tx(s, W / 2, barY + 14, 'cluster.sync()', { anchor: 'middle', size: 10, fill: 'var(--control)', style: 'paint-order:stroke;stroke:var(--bg);stroke-width:4px;' });
      }
      // global memory with an atomic counter
      rect(s, 0.5, gy, W - 1, gh, { fill: 'rgba(111,166,255,0.16)', stroke: 'var(--memory)', rx: 6 });
      tx(s, 12, gy + 23, narrow ? 'global memory' : 'global memory (GPU RAM), seen by every block', { size: 10.5, weight: 600, fill: 'var(--memory)' });
      const cx = W * (narrow ? 0.72 : 0.62), cw = narrow ? 84 : 110;
      rect(s, cx - cw / 2, gy + 7, cw, gh - 14, { fill: sel === 'glob' ? 'rgba(111,166,255,0.45)' : 'rgba(111,166,255,0.08)', stroke: 'var(--memory)', rx: 4 });
      tx(s, cx, gy + 23, 'count = ' + (sel === 'glob' ? 2 : 0), { anchor: 'middle', size: 10.5, weight: 600, fill: '#fff' });
      // arrows for the chosen attempt
      const good = 'var(--core)', bad = 'var(--danger)';
      const arrow = (x1, y1, x2, y2, c, bend, lab, labX, labY, anchor) => {
        const mx = (x1 + x2) / 2 + (bend || 0), my = (y1 + y2) / 2;
        path(s, `M${x1},${y1} Q${mx},${my} ${x2},${y2}`, { stroke: c, sw: 2, dash: c === bad ? '5 4' : null });
        head(s, x2, y2, x2 - mx, y2 - my, c, 7);
        if (lab) tx(s, labX, labY, lab, { anchor: anchor || 'middle', size: 10, weight: 600, fill: c, style: 'paint-order:stroke;stroke:var(--bg);stroke-width:3px;' });
      };
      const B0 = T[0], B1 = T[1];
      if (sel === 'in') {
        // 1: thread 0 writes s[0] before the barrier; 2: thread 3 reads it after the barrier
        const s0 = B0.slots[0], t0 = B0.thr[0], t3 = B0.thr[3];
        path(s, `M${t0.x},${y0 + 90} C${t0.x},${y0 + 72} ${s0.cx - 6},${s0.by + 24} ${s0.cx - 6},${s0.by + 3}`, { stroke: good, sw: 2 });
        head(s, s0.cx - 6, s0.by + 2, 0, -1, good, 7);
        path(s, `M${s0.cx + 6},${s0.by + 3} C${s0.cx + 6},${s0.by + 44} ${t3.x},${y0 + 96} ${t3.x},${y0 + 121}`, { stroke: good, sw: 2 });
        head(s, t3.x, y0 + 124, 0, 1, good, 7);
        const hl = 'paint-order:stroke;stroke:var(--bg);stroke-width:4px;';
        tx(s, t0.x + 7, y0 + 92, narrow ? '1' : '1 write', { size: 10, weight: 700, fill: good, style: hl });
        tx(s, t3.x - 7, y0 + 124, narrow ? '2' : '2 read, after the barrier', { anchor: 'end', size: 10, weight: 700, fill: good, style: hl });
      } else if (sel === 'smem') {
        const c = st.cluster ? good : bad;
        const x1 = B1.thr[0].x, y1 = B1.thr[0].y - 2, x2 = B0.slots[1].cx, y2 = B0.slots[1].by + 2;
        path(s, `M${x1},${y1} C${x1},${y0 + 84} ${x2},${y0 + 84} ${x2},${y2}`, { stroke: c, sw: 2, dash: st.cluster ? null : '5 4' });
        head(s, x2, y2, 0, -1, c, 7);
        const mxp = (x1 + x2) / 2, myp = y0 + 74;
        if (!st.cluster) { S('circle', { cx: mxp, cy: myp, r: 9, style: 'fill:var(--bg);stroke:var(--danger);stroke-width:1.6' }, s); tx(s, mxp, myp + 4.5, '✗', { anchor: 'middle', size: 12, weight: 700, fill: 'var(--danger)' }); }
        else tx(s, mxp, myp - 4, 'distributed shared memory', { anchor: 'middle', size: 10, weight: 600, fill: good, style: 'paint-order:stroke;stroke:var(--bg);stroke-width:3px;' });
      } else if (sel === 'glob') {
        arrow(B0.thr[1].x, y0 + PH + 2, cx - cw / 2 + 8, gy + 6, good, -20, '', 0, 0);
        arrow(B1.thr[2].x, y0 + PH + 2, cx + cw / 2 - 8, gy + 6, good, 20, '', 0, 0);
        tx(s, W / 2, y0 + PH + 22, 'atomicAdd(&count, 1)', { anchor: 'middle', size: 10, weight: 600, fill: good, style: 'paint-order:stroke;stroke:var(--bg);stroke-width:3px;' });
      } else if (sel === 'bar' && !st.cluster) {
        tx(s, B1.px + 14, barY - 12, narrow ? 'not held' : 'not held by block 0’s barrier', { size: 10, weight: 600, fill: bad, style: 'paint-order:stroke;stroke:var(--bg);stroke-width:4px;' });
      }
      sOk.set(ok ? 'yes' : 'no', ok ? 'core' : 'danger');
      sVia.set(sel === 'in' ? 'shared memory + barrier' : sel === 'glob' ? 'global memory, atomics' : sel === 'smem' ? (st.cluster ? 'distributed shared memory' : 'nothing') : (st.cluster ? 'cluster barrier' : 'nothing'));
      f.setWhy(WHY[sel]());
    }
    GG.ui.seg(f.controls, { label: 'Try', value: st.k, options: [
      { value: 'in', label: 'share inside a block' },
      { value: 'smem', label: 'read the other block’s shared memory' },
      { value: 'bar', label: 'one barrier for both' },
      { value: 'glob', label: 'meet in global memory' },
    ], onChange: (v) => { st.k = v; draw(); } });
    GG.ui.toggle(f.controls, { label: 'Thread block cluster (9.0+)', value: false, onChange: (v) => { st.cluster = v; draw(); } });
    onWidth(wrap, (w) => { W = w; draw(); });
  }

  /* Fig: one concept, three spellings (CUDA C++, PTX, SASS) */
  function spellings(host, ctx) {
    const f = ctx.figure(host, {
      title: 'One concept, three spellings', hint: canHover ? 'hover or click a row' : 'tap a row', wide: true,
      caption: 'How a few programming-model concepts are written at each level. The glossary gives the thread-block ↔ cooperative-thread-array correspondence; the other spellings and the listings are our addition. The listings are real compiler output, abridged: two small kernels of ours compiled by NVCC 13.2 with <code>-arch=sm_90 -O3</code> on Godbolt. The first computes the classic global index; the second writes shared memory, waits at a barrier, and reads a neighbour’s slot.',
    });
    const ROWS = [
      { k: 'cta', set: 'idx', lab: 'A group of threads that can coordinate', c: 'thread block', p: 'CTA <small>cooperative thread array</small>', s: 'CTA', why: `The ${T('thread-block', 'thread block')} of CUDA C++ is called a ${T('cooperative-thread-array', 'cooperative thread array')} (CTA) in PTX and SASS. Same thing, different name: the level of the ${T('thread-hierarchy', 'thread hierarchy')} that runs on one SM and shares one shared memory.` },
      { k: 'bid', set: 'idx', lab: 'Which block am I in?', c: 'blockIdx.x', p: '%ctaid.x', s: 'SR_CTAID.X', why: '<b>The block index.</b> <code>blockIdx</code> in CUDA C++, the special register <code>%ctaid</code> (CTA id) in PTX, <code>SR_CTAID</code> in SASS. Here the compiler copies it out with <code>S2UR</code> into a uniform register, the very instruction the SASS entry uses as its example; <code>S2R</code> would copy it into an ordinary per-thread register.' },
      { k: 'tid', set: 'idx', lab: 'Which thread am I, inside it?', c: 'threadIdx.x', p: '%tid.x', s: 'SR_TID.X', why: '<b>The thread index within its block.</b> Every thread runs the same code; this value is what makes each one work on different data. It differs from thread to thread, so SASS copies it with <code>S2R</code> into a per-thread register.' },
      { k: 'dim', set: 'idx', lab: 'How many threads per block?', c: 'blockDim.x', p: '%ntid.x', s: 'c[0x0][RZ] <small>constant bank 0, offset 0</small>', why: '<b>The block size.</b> <code>%ntid</code> is a special register in PTX. In SASS the value is loaded (<code>LDC</code>) from the kernel’s constant bank 0 at offset 0, written <code>c[0x0][RZ]</code> (<code>RZ</code> is the register that always reads zero). The driver fills that bank in at launch.' },
      { k: 'bar', set: 'bar', lab: 'Wait for the whole block', c: '__syncthreads()', p: 'bar.sync 0;', s: 'BAR.SYNC', why: '<b>The barrier,</b> abstraction number three. One function call in CUDA C++, one instruction in PTX (<code>bar.sync 0</code>, barrier number 0) and one in SASS (<code>BAR.SYNC</code>, printed with a <code>.DEFER_BLOCKING</code> modifier by this compiler).' },
      { k: 'shm', set: 'bar', lab: 'Memory the block shares', c: '__shared__', p: '.shared <small>ld.shared / st.shared</small>', s: 'LDS / STS', why: `<b>${T('shared-memory', 'Shared memory')}.</b> A variable qualifier in CUDA C++, a state space in PTX (stores <code>st.shared</code>, loads <code>ld.shared</code>), and dedicated store (<code>STS</code>) and load (<code>LDS</code>) instructions in SASS.` },
    ];
    const box = el('div', { class: 'dsa-sp' });
    f.stage.append(box);
    const rows = el('div', { class: 'dsa-sp-rows' });
    box.append(rows);
    rows.insertAdjacentHTML('beforeend', `<div class="dsa-sp-row head"><span class="lab dsa-k">concept</span><span class="dsa-k">CUDA C++</span><span class="dsa-k">PTX</span><span class="dsa-k">SASS</span></div>`);
    const btns = ROWS.map((r) => {
      const b = el('button', { type: 'button', class: 'dsa-sp-row', 'aria-pressed': 'false' });
      b.innerHTML = `<span class="lab">${esc(r.lab)}</span><span class="c">${esc(r.c)}</span><span class="c ptx">${r.p}</span><span class="c sass">${r.s}</span>`;
      b.addEventListener('click', () => pick(r.k));
      if (canHover) b.addEventListener('mouseenter', () => pick(r.k));
      rows.append(b);
      return b;
    });
    const tk = (k, s) => `<span class="dsa-tk" data-k="${k}">${esc(s)}</span>`;
    const SETS = {
      idx: { title: 'kernel 1 · the global index', panes: [
        ['CUDA C++', `int i = ${tk('bid', 'blockIdx.x')}
      * ${tk('dim', 'blockDim.x')}
      + ${tk('tid', 'threadIdx.x')};`],
        ['PTX', `mov.u32 %r1, ${tk('bid', '%ctaid.x')};
mov.u32 %r2, ${tk('dim', '%ntid.x')};
mov.u32 %r3, ${tk('tid', '%tid.x')};
mad.lo.s32 %r4, %r1, %r2, %r3;`],
        ['SASS · sm_90', `S2R R0, ${tk('tid', 'SR_TID.X')} ;
S2UR UR4, ${tk('bid', 'SR_CTAID.X')} ;
LDC R5, ${tk('dim', 'c[0x0][RZ]')} ;
IMAD R5, R5, UR4, R0 ;`],
      ] },
      bar: { title: 'kernel 2 · write, wait, read a neighbour', panes: [
        ['CUDA C++', `${tk('shm', '__shared__')} float s[256];
s[threadIdx.x] = x[threadIdx.x];
${tk('bar', '__syncthreads()')};
x[threadIdx.x] = s[threadIdx.x ^ 1];`],
        ['PTX', `${tk('shm', 'st.shared')}.f32 [%r4], %f1;
${tk('bar', 'bar.sync 0;')}
xor.b32 %r5, %r2, 4;
add.s32 %r6, %r3, %r5;
${tk('shm', 'ld.shared')}.f32 %f2, [%r6];`],
        ['SASS · sm_90', `${tk('shm', 'STS')} [R5+UR4], R0 ;
${tk('bar', 'BAR.SYNC')}.DEFER_BLOCKING 0x0 ;
${tk('shm', 'LDS')} R7, [R4+UR4] ;`],
      ] },
    };
    const listHead = el('div', { class: 'dsa-k dsa-sp-lh' });
    const three = el('div', { class: 'dsa-sp-three' });
    box.append(listHead, three);
    let curSet = null;
    function showSet(k) {
      if (curSet === k) return;
      curSet = k;
      listHead.textContent = 'Listing: ' + SETS[k].title;
      three.innerHTML = '';
      SETS[k].panes.forEach(([h, src]) => {
        const p = el('div', { class: 'dsa-sp-pane' });
        p.innerHTML = `<div class="dsa-k">${h}</div><pre>${src}</pre>`;
        three.append(p);
      });
    }
    function pick(k) {
      const r = ROWS.find((x) => x.k === k);
      showSet(r.set);
      ROWS.forEach((x, i) => btns[i].setAttribute('aria-pressed', String(x.k === k)));
      three.querySelectorAll('.dsa-tk').forEach((s) => s.classList.toggle('on', s.getAttribute('data-k') === k));
      f.setWhy(r.why + (['bid', 'tid', 'dim'].includes(k) ? ' Its three spellings are lit in the listings: the classic “which element is mine?” line, <code>i = blockIdx.x * blockDim.x + threadIdx.x</code>.' : k === 'bar' || k === 'shm' ? ' Lit in the second listing: each thread stores to shared memory, the block waits at the barrier, then each thread loads its neighbour’s value.' : ''));
    }
    pick('cta');
  }

  GG.entry('cuda-programming-model', {
    render(body, ctx) {
      const s = ctx.html(body, `
<p>A <em>programming model</em> is the imaginary machine a programmer writes code for: which things can run at the same time, where data can live, and how the parts can wait for each other. Hardware may differ wildly underneath, so long as it honours that contract.</p>
<h3>Three things called CUDA</h3>
<p>CUDA stands for <strong>C</strong>ompute <strong>U</strong>nified <strong>D</strong>evice <strong>A</strong>rchitecture. Depending on the context, “CUDA” can refer to multiple distinct things: a ${T('cuda-device-architecture', 'high-level device architecture')}, a parallel programming model for architectures with that design, or a ${T('cuda-software-platform', 'software platform')} that extends high-level languages like C to add that programming model. Pick one in Fig. 1.</p>
<div data-slot="mean" class="wide"></div>
${GG.noteHTML('history', `<p>The vision for CUDA is laid out in the ${X(LINDHOLM, 'Lindholm et al., 2008')} white paper (Erik Lindholm, John Nickolls, Stuart Oberman and John Montrym, “NVIDIA Tesla: A Unified Graphics and Computing Architecture”, IEEE Micro). The glossary highly recommends it: it is the original source for many claims, diagrams, and even specific turns of phrase in NVIDIA’s documentation. If a sentence in the CUDA docs sounds familiar, it may well be from here.</p>`)}
<p>Here, we focus on the CUDA <em>programming model</em>.</p>
<h3>Three key abstractions</h3>
<p>Per the ${X(CPG_SCALABLE, 'NVIDIA CUDA C++ Programming Guide')}, there are three key abstractions in the CUDA programming model:</p>
<ol>
<li><strong>${T('thread-hierarchy', 'Hierarchy of thread groups')}.</strong> Programs are executed in ${T('thread', 'threads')} but can make reference to groups of threads in a nested hierarchy, from ${T('thread-block', 'blocks')} to ${T('thread-block-grid', 'grids')}. A thread is one sequential stream of instructions; a block is a team of threads; a grid is all the blocks of one ${T('kernel', 'kernel')} launch.</li>
<li><strong>${T('memory-hierarchy', 'Hierarchy of memories')}.</strong> Thread groups at each level of the hierarchy have access to a memory resource for communication within the group. Accessing the ${T('shared-memory', 'lowest layer')} of the memory hierarchy should be ${T('l1-data-cache', 'nearly as fast as executing an instruction')}. That lowest shared layer is shared memory, which a block’s threads use to talk to each other. (A thread’s own ${T('registers', 'registers')} are even closer. They are private to the thread, though the threads of one ${T('warp', 'warp')} can trade register values directly with warp-shuffle instructions such as <code>__shfl_sync</code>.)</li>
<li><strong>Barrier synchronization.</strong> Thread groups can coordinate execution by means of barriers: a point in the program that no thread of the group passes until every thread of the group has reached it.</li>
</ol>
<p>The hierarchies of execution and memory and their mapping onto ${T('device-hardware', 'device hardware')} are summarized in Fig. 2. A thread runs on a ${T('cuda-core', 'core')}, a block on one ${T('streaming-multiprocessor', 'Streaming Multiprocessor')}, a grid across the whole GPU; each level’s memory sits in the matching piece of hardware.</p>
<div data-slot="map" class="wide"></div>
<p>The third abstraction is about time, not space, so it gets its own figure. Fig. 3 shows why a block needs a barrier at all.</p>
<div data-slot="bar" class="wide"></div>
<h3>Programs that get faster on their own</h3>
<p>Together, these three abstractions encourage the expression of programs in a way that scales transparently as GPU devices scale in their parallel execution resources.</p>
${GG.noteHTML('quote', `<p>Put provocatively: this programming model prevents programmers from writing programs for NVIDIA’s ${T('cuda-device-architecture', 'CUDA-architected')} GPUs that fail to get faster when the program’s user buys a new NVIDIA GPU.</p>`)}
<p>How? For example, each ${T('thread-block', 'thread block')} in a CUDA program can coordinate tightly, but coordination between blocks is limited. Inside a block, threads share one shared memory and can wait at a barrier (<code>__syncthreads()</code>). Across blocks, by default, there is neither: blocks see each other only through global memory, for example with atomic operations. (Opt-in exceptions exist, such as Hopper’s thread block clusters, whose blocks can share memory and a barrier, and cooperative launches with a grid-wide barrier, and they come with constraints on scheduling.) This ensures blocks capture parallelizable components of the program and can be scheduled in any order. In the terminology of computer architecture, the programmer “exposes” this parallelism to the compiler and hardware: by cutting the work into independent blocks, they declare up front which pieces are free to run side by side, and leave it to the machine to decide how many actually do. Fig. 4 tries each way two blocks might cooperate.</p>
<div data-slot="blocks" class="wide"></div>
<p>When the program is executed on a new GPU that has more scheduling units (specifically, more ${T('streaming-multiprocessor', 'Streaming Multiprocessors')}), more of these blocks can be executed in parallel. Fig. 5 runs the glossary’s example: a CUDA program with eight blocks runs in four sequential steps (waves) on a GPU with two SMs, but in half as many steps on one with twice as many SMs.</p>
<div data-slot="wave" class="wide"></div>
${GG.noteHTML('beyond', `<p><b>Real SMs hold more than one block.</b> The figure’s “one block per SM” is a teaching simplification. An H100 SM can hold up to 32 blocks and 64 ${T('warp', 'warps')} (2,048 threads) at once, as long as their registers and shared memory fit; how full it gets is its ${T('occupancy', 'occupancy')}. A wave is then “SMs × resident blocks per SM” blocks. Practitioners call the partly empty last wave the <em>tail effect</em> or <em>wave quantization</em>: with 133 equal blocks on 132 SMs that hold one block each, the second wave runs one block while 131 SMs idle.</p>`)}
<h3>How the model reaches the hardware</h3>
<p>The CUDA programming model abstractions are made available to programmers as extensions to high-level CPU programming languages, like the ${T('cuda-c', 'CUDA C++ extension of C++')}. The programming model is implemented in software by an instruction set architecture ${T('parallel-thread-execution', '(Parallel Thread eXecution, or PTX)')} and a low-level assembly language ${T('streaming-assembler', '(Streaming Assembler, or SASS)')}. For example, the ${T('thread-block', 'thread block')} level of the ${T('thread-hierarchy', 'thread hierarchy')} is implemented via ${T('cooperative-thread-array', 'cooperative thread arrays')} in these languages. Fig. 6 lines up a few concepts across the three levels.</p>
<div data-slot="spell" class="wide"></div>
<div data-slot="read"></div>`);
      guard(s.mean, 'Three meanings', () => threeMeanings(s.mean, ctx));
      guard(s.map, 'Programming model map', () => mapFigure(s.map, ctx));
      guard(s.bar, 'Barrier simulator', () => barrierSim(s.bar, ctx));
      guard(s.blocks, 'Between blocks', () => blocksFigure(s.blocks, ctx));
      guard(s.wave, 'Wave scheduling', () => waveSim(s.wave, ctx));
      guard(s.spell, 'Three spellings', () => spellings(s.spell, ctx));
      ctx.reading(s.read, [
        { href: LINDHOLM, label: 'Lindholm, Nickolls, Oberman & Montrym, “NVIDIA Tesla: A Unified Graphics and Computing Architecture” (IEEE Micro, 2008)', note: 'the white paper behind CUDA’s vision and vocabulary' },
        { href: CPG_SCALABLE, label: 'CUDA C++ Programming Guide: A Scalable Programming Model', note: 'the three key abstractions' },
        { href: REFRESHER, label: 'NVIDIA Developer Blog: CUDA Refresher, The CUDA Programming Model', note: 'source of the hierarchy diagram' },
        { href: CPG_MODEL, label: 'CUDA C++ Programming Guide: Programming Model', note: 'threads, blocks, grids and memories in detail' },
        { href: CPG, label: 'CUDA C++ Programming Guide', note: 'source of the wave-scheduling diagram' },
      ]);
    },
  });


  /* ═════════════════════════════ Streaming ASSembler (SASS) ═════════════════════════════ */

  GG.css(`
.dsa-lad { display: grid; gap: 0; position: relative; padding-left: 30px; }
.dsa-rail { position: absolute; left: 9px; border: 2px solid var(--control); border-right: 0; border-radius: 8px 0 0 8px; pointer-events: none; }
.dsa-rail::after { content: ""; position: absolute; right: -2px; bottom: -6px; border: 5px solid transparent; border-left: 7px solid var(--control); border-right: 0; }
.dsa-lrow { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); gap: 14px; align-items: stretch; }
.dsa-lcard { text-align: left; cursor: pointer; border: 1px solid var(--line-2); background: rgba(8, 9, 14, 0.6); border-radius: 12px; padding: 9px 12px 10px; color: var(--ink-2); font: 13px/1.4 var(--font-body); transition: border-color .2s, box-shadow .2s; min-width: 0; }
.dsa-lcard:hover { border-color: var(--ink-3); }
.dsa-lcard[aria-pressed="true"] { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-a); }
.dsa-lcard .h { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; flex-wrap: wrap; }
.dsa-lcard .h b { font: 600 13px var(--font-mono); color: var(--ink); }
.dsa-lcard .samp { display: block; margin-top: 6px; font: 500 12.5px/1.5 var(--font-mono); color: #d4d7e6; background: #090a10; border: 1px solid var(--line); border-radius: 7px; padding: 5px 8px; overflow-x: auto; white-space: pre; scrollbar-width: thin; }
.dsa-lcard.sass { border-color: rgba(69, 212, 155, 0.55); }
.dsa-lcard.sass[aria-pressed="true"] { border-color: var(--accent); }
.dsa-bits { display: grid; grid-template-columns: repeat(64, minmax(0, 1fr)); gap: 1.5px; margin-top: 7px; }
.dsa-bits i { height: 10px; border-radius: 1px; background: var(--surface-3); display: block; min-width: 0; }
@media (max-width: 720px) { .dsa-bits { grid-template-columns: repeat(32, minmax(0, 1fr)); } }
.dsa-bits i.on { background: var(--ink-3); }
.dsa-lens { display: flex; gap: 9px; align-items: flex-start; border: 1px dashed var(--line-2); border-radius: 12px; padding: 9px 12px; font-size: 13.5px; line-height: 1.5; color: var(--ink-2); min-width: 0; }
.dsa-lens b { color: var(--ink); font-weight: 600; }
.dsa-dot { width: 11px; height: 11px; border-radius: 50%; flex: none; margin-top: 4px; border: 1.5px solid var(--ink-2); box-sizing: border-box; }
.dsa-dot.good { background: var(--ink-2); } .dsa-dot.meh { background: linear-gradient(90deg, var(--ink-2) 50%, transparent 50%); } .dsa-dot.bad, .dsa-dot.info { background: transparent; }
.dsa-larrow { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); gap: 14px; }
.dsa-larrow > div { display: flex; align-items: center; gap: 8px; padding: 3px 0 3px 22px; font: 500 11px/1.3 var(--font-mono); color: var(--control); }
.dsa-larrow > div::before { content: "↓"; font-size: 15px; color: var(--control); flex: none; }
.dsa-larrow > div.dsa-la-skip { padding-left: 0; margin-left: -21px; }
.dsa-larrow > div.dsa-la-skip::before { content: ""; width: 26px; border-top: 2px solid var(--control); }
.dsa-larrow > div.dsa-la-up::before { content: "↑"; color: var(--ink-2); }
.dsa-larrow > div.dsa-la-up { color: var(--ink-2); }
.dsa-larrow > div:empty::before { content: none; }
.dsa-badge { font: 600 9.5px/1 var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 6px 2px; border-radius: 4px; white-space: nowrap; }
.dsa-badge.read { color: var(--core); border: 1px solid rgba(69, 212, 155, 0.5); }
.dsa-badge.noread { color: var(--ink-3); border: 1px solid var(--line-2); }
@media (max-width: 720px) { .dsa-lrow, .dsa-larrow { grid-template-columns: minmax(0, 1fr); gap: 6px; } .dsa-larrow > div:last-child { display: none; } }

.dsa-ins { display: flex; flex-wrap: wrap; gap: 6px 4px; align-items: flex-end; justify-content: center; padding: 6px 0 2px; }
.dsa-tok { display: inline-flex; flex-direction: column; align-items: center; gap: 4px; border: 1px solid var(--line-2); background: var(--surface-2); border-radius: 8px; padding: 6px 9px 5px; cursor: pointer; color: var(--ink); font: 600 22px/1.1 var(--font-mono); transition: border-color .2s, background .2s, box-shadow .2s; }
.dsa-tok small { font: 500 9.5px/1 var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-3); }
.dsa-tok:hover { border-color: var(--ink-3); }
.dsa-tok[aria-pressed="true"] { border-color: var(--accent); background: var(--accent-a); box-shadow: 0 0 0 2px var(--accent-a); }
.dsa-tok.op { color: #52dba4; } .dsa-tok.reg { color: #7fb0ff; } .dsa-tok.num { color: #ffb28a; } .dsa-tok.pun { color: #8c91ab; } .dsa-tok.sr { color: #a9c8ff; }
.dsa-tok .lt { display: inline-flex; gap: 1px; }
.dsa-tok .lt span { padding: 0 1px; border-radius: 3px; }
.dsa-tok .lt span.k { text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 4px; }
.dsa-exp { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin: 10px 0 4px; min-height: 30px; }
.dsa-exp span { font: 500 12.5px/1 var(--font-mono); color: var(--ink-2); padding: 7px 9px 6px; border-radius: 7px; border: 1px solid var(--line); background: #090a10; }
.dsa-exp span b { color: var(--accent-2); font-weight: 700; }
.dsa-exp span.dsa-exp-alt { flex-basis: 100%; text-align: center; border-style: dashed; color: var(--ink-3); background: transparent; }
@media (max-width: 720px) { .dsa-tok { font-size: 16px; padding: 5px 6px 4px; } .dsa-tok small { font-size: 8.5px; } }

.dsa-gb { display: grid; gap: 10px; }
.dsa-gb-pane { border: 1px solid var(--line); border-radius: 10px; background: #090a10; padding: 6px 0 8px; min-width: 0; overflow-x: auto; scrollbar-width: thin; }
.dsa-gb-pane > .dsa-k { padding: 2px 10px 6px; }
.dsa-gb-two { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.dsa-gb-ln { display: flex; gap: 8px; width: 100%; text-align: left; font: 500 12px/1.65 var(--font-mono); color: #d4d7e6; background: transparent; border: 0; border-left: 2px solid transparent; padding: 0 10px 0 8px; white-space: pre; transition: background .15s; }
button.dsa-gb-ln { cursor: pointer; }
button.dsa-gb-ln:hover { background: rgba(255,255,255,0.04); }
.dsa-gb-ln .g { flex: none; width: 1.4em; text-align: right; color: var(--ink-3); }
.dsa-gb-ln.on, .dsa-gb-ln[aria-pressed="true"] { background: var(--accent-a); border-left-color: var(--accent); }
.dsa-gb-ln.on .g, .dsa-gb-ln[aria-pressed="true"] .g { color: var(--accent-2); }
@media (max-width: 720px) { .dsa-gb-two { grid-template-columns: minmax(0, 1fr); } .dsa-gb-ln { font-size: 11px; }
  .dsa-gb-cpp .dsa-gb-ln .t { white-space: pre-wrap; min-width: 0; padding-left: 6ch; text-indent: -6ch; } }
.dsa-gb-ln.xref { box-shadow: inset 0 0 0 1px var(--accent); }
.dsa-doc { display: grid; gap: 10px; }
.dsa-dpair { border: 1px solid var(--line); border-radius: 10px; background: #090a10; padding: 6px 0 8px; min-width: 0; overflow-x: auto; scrollbar-width: thin; }
.dsa-dpair > .dsa-k { padding: 2px 10px 6px; }
.dsa-dpair .dsa-gb-ln .g { width: 3.4em; text-align: left; }
.dsa-dgrid { display: grid; gap: 6px; }
.dsa-dhead, .dsa-drow { display: grid; grid-template-columns: 128px minmax(0, 1fr) minmax(0, 1fr); gap: 14px; align-items: start; }
.dsa-dhead { padding: 0 13px; }
.dsa-dhead > span { font: 500 10px/1.3 var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-3); }
.dsa-dhead > span b { color: var(--ink); font-weight: 600; letter-spacing: 0.02em; text-transform: none; font-size: 12px; }
.dsa-drow { text-align: left; cursor: pointer; border: 1px solid var(--line); background: rgba(8, 9, 14, 0.5); border-radius: 10px; padding: 10px 12px; color: var(--ink-2); font: 13px/1.45 var(--font-body); transition: border-color .2s; }
.dsa-drow:hover { border-color: var(--ink-3); }
.dsa-drow[aria-pressed="true"] { border-color: var(--accent); }
.dsa-drow > b { font: 600 12px/1.45 var(--font-mono); color: var(--ink); letter-spacing: 0.04em; }
.dsa-dc { display: grid; gap: 5px; min-width: 0; }
.dsa-dc .v { color: var(--ink); overflow-wrap: anywhere; }
.dsa-dc .v code { font-size: 12px; }
.dsa-dc .st { font: 600 10.5px/1.2 var(--font-mono); letter-spacing: 0.04em; }
.dsa-dc .st.good { color: var(--core); } .dsa-dc .st.bad { color: var(--danger); } .dsa-dc .st.meh { color: var(--control); } .dsa-dc .st.na { color: var(--ink-3); }
.dsa-word { position: relative; min-height: 24px; margin-top: 2px; padding: 4px; border-radius: 4px; display: flex; align-items: center; justify-content: center; text-align: center; font: 500 10.5px/1.3 var(--font-mono); color: var(--ink-2); }
.dsa-word > span { position: relative; padding: 1px 6px; border-radius: 3px; background: var(--bg); }
.dsa-qbits { background: repeating-linear-gradient(135deg, var(--surface-3) 0 2px, transparent 2px 4px); outline: 1px solid var(--line-2); outline-offset: -1px; }
@media (max-width: 720px) {
  .dsa-dhead, .dsa-drow { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 6px 12px; }
  .dsa-dhead { padding: 0 11px; } .dsa-dhead > :first-child { display: none; }
  .dsa-drow > b { grid-column: 1 / -1; }
}
`);

  const SASS_LINKS = {
    so: 'https://stackoverflow.com/questions/9798258/what-is-sass-short-for',
    gameworks: 'https://docs.nvidia.com/gameworks/content/developertools/desktop/ptx_sass_assembly_debugging.htm',
    talk: 'https://www.youtube.com/watch?v=we3i5VuoPWk',
    binutils: 'https://docs.nvidia.com/cuda/cuda-binary-utilities/index.html#instruction-set-ref',
    maxas: 'https://github.com/NervanaSystems/maxas',
    lovelace: 'https://kuterdinel.com/nv_isa_sm89/',
  };

  /* Fig: the ladder from CUDA C++ to bits, seen through several lenses */
  function sassLadder(host, ctx) {
    const f = ctx.figure(host, {
      title: 'From source to silicon: where SASS sits', hint: canHover ? 'pick a lens · click a level' : 'pick a lens · tap a level', wide: true,
      caption: 'One multiply-add at four levels. The PTX and SASS lines are the glossary’s own examples; the C++ line is ours, a statement that could compile to them. The binary row is drawn as 128 unlabelled bits, the size of one instruction word on Hopper, on purpose: the encoding is undocumented. The arrows follow what the tools do (see the note below): <code>ptxas</code> compiles PTX directly into machine code (the bracket on the left runs from PTX to the binary, past the SASS text), and SASS is the readable form of those bits, printed from them by a disassembler (the upward arrow). Filled dot: good news for a human reader; half-filled: possible, with effort; empty: closed.',
    });
    const L = [
      { k: 'cpp', name: 'CUDA C++', sample: 'x = x * y + 1.5f;', read: true },
      { k: 'ptx', name: 'PTX', sample: 'fma.rn.f32 %f5, %f4, %f3, 0f3FC00000;', read: true },
      { k: 'sass', name: 'SASS', sample: 'FFMA R0, R7, R0, 1.5 ;', read: true },
      { k: 'bin', name: 'Binary machine code', sample: null, read: false },
    ];
    /* What the tools actually do (see the "during execution" note): ptxas turns PTX straight into machine code,
       and the SASS text is what a disassembler prints from those bits. */
    const ARROWS = [
      ['down', 'nvcc compiles C++ to PTX'],
      ['skip', 'ptxas compiles PTX straight to machine code: inside nvcc ahead of time, or inside the driver just in time'],
      ['up', 'cuobjdump -sass / nvdisasm print SASS from the binary: the same instructions, as text'],
    ];
    const LENS = {
      read: { label: 'Readable?', rows: [
        ['good', '<b>Yes.</b> Written for people.'],
        ['good', '<b>Yes.</b> Assembly-like text for a virtual machine.'],
        ['meh', '<b>Yes, just.</b> The lowest-level format in which human-readable code can be written.'],
        ['bad', '<b>No.</b> Bits for the Streaming Multiprocessor to decode.'],
      ] },
      write: { label: 'Who writes it?', rows: [
        ['good', '<b>Most CUDA programmers.</b>'],
        ['meh', '<b>Mostly compilers.</b> People write in-line PTX at the cutting edge of performance.'],
        ['bad', '<b>The compiler.</b> Writing this “GPU assembler” by hand is very uncommon, even more so than for CPUs.'],
        ['bad', '<b>Only tools.</b>'],
      ] },
      view: { label: 'Who reads it?', rows: [
        ['good', '<b>Everyone</b> working on the kernel.'],
        ['meh', '<b>People checking the compiler’s work</b>, often side by side with C++ and SASS on Godbolt.'],
        ['good', '<b>Performance engineers, often.</b> Reading compiler-generated SASS while profiling and tuning is common, especially for the highest-performance kernels.'],
        ['bad', '<b>The hardware.</b> People see it only through a disassembler, as SASS.'],
      ] },
      ver: { label: 'Tied to', rows: [
        ['good', '<b>The language</b>, and the CUDA Toolkit that compiles it.'],
        ['good', '<b>A compute capability</b> (a virtual architecture, e.g. <code>compute_90</code>). Runs on that and newer GPUs, except architecture-specific PTX such as <code>compute_90a</code>, which runs only on that exact one.'],
        ['bad', '<b>One SM architecture</b>, e.g. <code>sm_90a</code> for Hopper. SASS is versioned and tied to it; a plain <code>sm_XY</code> build also loads on later minor versions of the same major version.'],
        ['bad', '<b>The same SM architecture</b>, as bits.'],
      ] },
      docs: { label: 'Documented?', rows: [
        ['good', '<b>Thoroughly</b>, in the CUDA C++ Programming Guide.'],
        ['good', '<b>Thoroughly</b>, in NVIDIA’s PTX ISA reference.'],
        ['meh', '<b>Very lightly.</b> Instructions are listed, but their semantics are not defined.'],
        ['bad', '<b>Not at all.</b> The text-to-bits mapping is reverse-engineered in certain cases only.'],
      ] },
    };
    const WHY = {
      cpp: `<b>CUDA C++</b>: ${T('cuda-c', 'C++ with CUDA extensions')}. ${T('nvcc', 'nvcc')}, the NVIDIA CUDA Compiler Driver, turns it into PTX and SASS.`,
      ptx: `<b>${T('parallel-thread-execution', 'PTX')}</b>: an intermediate representation for a virtual GPU. It is one of the formats output by nvcc, alongside SASS, and can be compiled to SASS later, by the driver, for GPUs that did not exist yet.`,
      sass: `<b>SASS</b>: the assembly format for programs running on NVIDIA GPUs, and the lowest level a human can still read and write. Versioned and tied to one ${T('streaming-multiprocessor-architecture', 'SM architecture')}; see also ${T('compute-capability', 'Compute Capability')}.`,
      bin: '<b>Binary machine code</b>: the glossary says SASS is converted to device-specific binary microcodes during execution. In practice the bits are produced by the assembler, <code>ptxas</code>: ahead of time when nvcc compiles, or at load time when the driver JIT-compiles PTX. Either way, no public specification of these bits exists; one Hopper instruction is 128 of them.',
    };
    let lens = 'read', sel = 'sass';
    const lad = el('div', { class: 'dsa-lad' });
    f.stage.append(lad);
    const lensEls = [], cards = [];
    L.forEach((l, i) => {
      const row = el('div', { class: 'dsa-lrow' });
      const c = el('button', { type: 'button', class: 'dsa-lcard' + (l.k === 'sass' ? ' sass' : ''), 'aria-pressed': 'false' });
      let inner = `<span class="h"><b>${esc(l.name)}</b><span class="dsa-badge ${l.read ? 'read' : 'noread'}">${l.k === 'sass' ? 'lowest human-readable' : l.read ? 'human-readable' : 'not human-readable'}</span></span>`;
      if (l.sample) inner += `<span class="samp">${GG.highlightLine(l.sample, l.k === 'cpp' ? 'cpp' : l.k)}</span>`;
      else {
        const r = mulberry(89);
        inner += '<span class="dsa-bits" role="img" aria-label="128 unlabelled bits, one instruction word">' + Array.from({ length: 128 }, () => `<i class="${r() > 0.5 ? 'on' : ''}"></i>`).join('') + '</span>';
      }
      c.innerHTML = inner;
      c.addEventListener('click', () => { sel = l.k; paint(); });
      const ln = el('div', { class: 'dsa-lens' });
      row.append(c, ln);
      lad.append(row);
      cards.push(c); lensEls.push(ln);
      if (i < L.length - 1) {
        const a = el('div', { class: 'dsa-larrow' });
        a.append(el('div', { class: 'dsa-la-' + ARROWS[i][0], text: ARROWS[i][1] }), el('div'));
        lad.append(a);
      }
    });
    /* The ptxas bracket: leaves the PTX card, passes beside the SASS card, enters the binary card. */
    const rail = el('div', { class: 'dsa-rail', 'aria-hidden': 'true' });
    lad.append(rail);
    function placeRail() {
      const o = lad.getBoundingClientRect(), p = cards[1].getBoundingClientRect(), b = cards[3].getBoundingClientRect();
      const top = p.top + p.height / 2 - o.top, bot = b.top + b.height / 2 - o.top;
      Object.assign(rail.style, { top: top + 'px', height: Math.max(0, bot - top) + 'px', width: Math.max(0, p.left - o.left - 9) + 'px' });
    }
    if (window.ResizeObserver) new ResizeObserver(placeRail).observe(lad);
    function paint() {
      const Ls = LENS[lens];
      L.forEach((l, i) => {
        cards[i].setAttribute('aria-pressed', String(l.k === sel));
        const [tone, html] = Ls.rows[i];
        lensEls[i].innerHTML = `<i class="dsa-dot ${tone}"></i><span><span class="dsa-k">${esc(Ls.label)}</span><br>${html}</span>`;
      });
      f.setWhy(WHY[sel]);
      placeRail();
    }
    GG.ui.seg(f.controls, { label: 'Lens', value: lens, options: Object.keys(LENS).map((k) => ({ value: k, label: LENS[k].label })), onChange: (v) => { lens = v; paint(); } });
    paint();
  }

  /* FP32 fused multiply-add with a single rounding, as FFMA does it.
     a × b of two FP32 values is exact in a double (24 + 24 significant bits). The double sum s = p + c can
     be off from the exact sum by e (TwoSum gives e exactly). Rounding s to FP32 then gives the correctly
     rounded result unless s sits exactly halfway between two FP32 values, where e decides the tie. */
  const f32dv = new DataView(new ArrayBuffer(4));
  function nextToward32(r, t) { // the FP32 neighbour of FP32 value r in the direction of t
    if (r === 0) return t > 0 ? 1.401298464324817e-45 : -1.401298464324817e-45;
    f32dv.setFloat32(0, r);
    const b = f32dv.getUint32(0) + (((t > r) === (r > 0)) ? 1 : -1);
    f32dv.setUint32(0, b >>> 0);
    return f32dv.getFloat32(0);
  }
  function fma32(a, b, c) {
    const p = a * b, s = p + c, bb = s - p, e = (p - (s - bb)) + (c - bb);
    const r = Math.fround(s);
    if (e === 0 || r === s || !isFinite(s) || Number.isNaN(e)) return r;
    const o = nextToward32(r, s);
    if (Math.abs(o - s) !== Math.abs(r - s)) return r; // no tie: s rounds the same way the exact sum does
    return (e > 0) === (o > r) ? o : r;
  }

  /* Fig: anatomy of the glossary's two SASS instructions */
  function sassAnatomy(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Anatomy of two SM90a instructions', hint: canHover ? 'click any token' : 'tap any token', wide: true,
      caption: 'The two example instructions from the glossary, for the SM90a architecture of Hopper GPUs. Destination operands come first. Below each, a sketch of what the instruction does: blue boxes hold bits (registers; the special register, set by hardware, has a dashed outline), green marks arithmetic. The FFMA arithmetic is exact FP32: one rounding of a × b + 1.5, as the hardware does it. Uniform registers, the S2R comparison and NVIDIA’s reading of the FFMA letters are context we added.',
    });
    const INS = {
      ffma: {
        toks: [
          { t: 'FFMA', c: 'op', role: 'opcode', letters: [['F', 'FP32'], ['F', 'Fused'], ['M', 'Multiply'], ['A', 'Add']], alt: 'glossary’s reading: Fused Floating point Multiply Add',
            why: '<b>FFMA</b>: a 32-bit floating-point fused multiply-add, a multiply and an add done as one operation and rounded once at the end. The glossary spells it <b>F</b>used <b>F</b>loating point <b>M</b>ultiply <b>A</b>dd; NVIDIA’s instruction table calls it “FP32 Fused Multiply and Add”: the same four letters, with the leading F naming the type, as in <code>FADD</code> (FP32 Add) and <code>FMUL</code> (FP32 Multiply). <code>DFMA</code> is the FP64 version, <code>HFMA2</code> the paired-FP16 one.' },
          { t: 'R0', c: 'reg', role: 'destination', why: '<b>R0</b>, the destination: <b>R</b>egister 0, where the result is stored. As in Intel-syntax x86 assembly, the destination is written first.' },
          { t: ',', c: 'pun', role: '', why: 'Commas separate operands.' },
          { t: 'R7', c: 'reg', role: 'source a', why: '<b>R7</b>: the contents of <b>R</b>egister 7, the first factor.' },
          { t: ',', c: 'pun', role: '', why: 'Commas separate operands.' },
          { t: 'R0', c: 'reg', role: 'source b', why: '<b>R0</b> again, now as the second factor. The instruction reads R0’s old value, then overwrites it with the result: press “Execute FFMA” twice and watch it change.' },
          { t: ',', c: 'pun', role: '', why: 'Commas separate operands.' },
          { t: '1.5', c: 'num', role: 'immediate', why: '<b>1.5</b>: an immediate, a constant written into the instruction itself rather than read from a register. It is added to the product.' },
          { t: ';', c: 'pun', role: 'end', why: 'The semicolon ends the instruction.' },
        ],
      },
      s2ur: {
        toks: [
          { t: 'S2UR', c: 'op', role: 'opcode', letters: [['S', 'Special register'], ['2', 'to'], ['UR', 'Uniform Register']],
            why: '<b>S2UR</b>: <b>S</b>pecial register <b>to</b> <b>U</b>niform <b>R</b>egister, a copy from one kind of register into another.' },
          { t: 'UR4', c: 'reg', role: 'destination', why: '<b>UR4</b>: <b>U</b>niform <b>R</b>egister 4, the destination. A uniform register holds one value for the whole warp, not one per thread.' },
          { t: ',', c: 'pun', role: '', why: 'Commas separate operands.' },
          { t: 'SR_CTAID.X', c: 'sr', role: 'source', letters: [['SR', 'Special Register'], ['CTA', 'Cooperative Thread Array'], ['ID', 'InDex'], ['.X', 'x axis']],
            why: `<b>SR_CTAID.X</b>: the <b>X</b> value of the ${T('cooperative-thread-array', 'Cooperative Thread Array')}’s <b>I</b>n<b>D</b>ex, held in a <b>S</b>pecial <b>R</b>egister. A CTA is what SASS calls a ${T('thread-block', 'thread block')}; this is <code>blockIdx.x</code> in CUDA C++.` },
          { t: ';', c: 'pun', role: 'end', why: 'The semicolon ends the instruction.' },
        ],
      },
    };
    let which = 'ffma', selTok = 0;
    /* last: the run just executed {a, b, res, n}, shown until an input changes; null shows the next run */
    const st = { r7: 3, r0: 2, r0start: 2, cta: 2, lanes: false, runs: 0, last: null };
    const top = el('div');
    const exp = el('div', { class: 'dsa-exp', 'aria-live': 'polite' });
    const pic = el('div', { class: 'dsa-w' });
    f.stage.append(top, exp, pic);
    const ctl = el('div', { style: 'display:contents' });
    f.controls.append(ctl);
    const sR7 = GG.ui.stat(f.readouts, { label: '', value: '' });
    const sR0 = GG.ui.stat(f.readouts, { label: '', value: '' });
    const sRes = GG.ui.stat(f.readouts, { label: '', value: '', tone: 'core' });
    let W = 0;
    function buildToks() {
      top.innerHTML = '';
      const row = el('div', { class: 'dsa-ins', role: 'group', 'aria-label': 'Instruction tokens' });
      INS[which].toks.forEach((tk, i) => {
        const b = el('button', { type: 'button', class: 'dsa-tok ' + tk.c, 'aria-pressed': String(i === selTok), 'aria-label': tk.t + (tk.role ? ', ' + tk.role : '') });
        if (tk.letters) b.innerHTML = `<span class="lt">${tk.letters.map((l) => `<span class="k">${esc(l[0])}</span>`).join('')}</span>`;
        else b.append(el('span', { text: tk.t }));
        b.append(el('small', { text: tk.role || ' ' }));
        if (tk.t === 'SR_CTAID.X') b.firstChild.innerHTML = '<span class="k">SR</span>_<span class="k">CTA</span><span class="k">ID</span><span class="k">.X</span>';
        // update the pressed state in place: rebuilding the row would drop keyboard focus
        b.addEventListener('click', () => { selTok = i; row.querySelectorAll('.dsa-tok').forEach((x, j) => x.setAttribute('aria-pressed', String(j === i))); explain(); });
        row.append(b);
      });
      top.append(row);
    }
    function explain() {
      const tk = INS[which].toks[selTok];
      exp.innerHTML = tk.letters ? tk.letters.map((l) => `<span><b>${esc(l[0])}</b> ${esc(l[1])}</span>`).join('') + (tk.alt ? `<span class="dsa-exp-alt">${esc(tk.alt)}</span>` : '') : `<span>${esc(tk.t)} · ${esc(tk.role || 'punctuation')}</span>`;
      f.setWhy(tk.why);
      draw();
    }
    function buildControls() {
      ctl.innerHTML = '';
      if (which === 'ffma') {
        GG.ui.slider(ctl, { label: 'R7 holds', min: -4, max: 4, step: 0.5, value: st.r7, format: (v) => fmt.fixed(v, 1), onInput: (v) => { st.r7 = v; st.r0 = st.r0start; st.runs = 0; st.last = null; draw(); } });
        GG.ui.slider(ctl, { label: 'R0 starts at', min: -4, max: 4, step: 0.5, value: st.r0start, format: (v) => fmt.fixed(v, 1), onInput: (v) => { st.r0start = v; st.r0 = v; st.runs = 0; st.last = null; draw(); } });
        GG.ui.button(ctl, { label: 'Execute FFMA', icon: 'play', primary: true, onClick: execute });
        GG.ui.button(ctl, { label: 'Reset', icon: 'reset', onClick: () => { st.r7 = 3; st.r0 = 2; st.r0start = 2; st.runs = 0; st.last = null; buildControls(); explain(); } });
      } else {
        GG.ui.slider(ctl, { label: 'This warp’s CTA (blockIdx.x)', min: 0, max: 5, value: st.cta, onInput: (v) => { st.cta = v; draw(); } });
        GG.ui.toggle(ctl, { label: 'Compare S2R R0, SR_TID.X', value: st.lanes, onChange: (v) => { st.lanes = v; if (v) { draw(); f.setWhy('<b>Compare: <code>S2R R0, SR_TID.X</code>.</b> The thread index differs from thread to thread, so <code>S2R</code> copies it into an ordinary register, <code>R0</code>, separately in each of the 32 threads: 32 register boxes, where <code>S2UR</code> needed one uniform register for the whole warp.'); } else explain(); } });
      }
    }
    function execute() {
      const a = st.r7, b = st.r0, res = fma32(a, b, 1.5);
      st.r0 = res; st.runs++;
      st.last = { a, b, res, n: st.runs };
      draw();
      f.setWhy(`<b>Run ${st.runs}:</b> FFMA read R7 = ${nice(a)} and the old R0 = ${nice(b)}, computed ${nice(a)} × ${nice(b)} + 1.5 = <b>${nice(res)}</b> (rounded once, to FP32) and wrote it back to R0. R0 now holds ${nice(res)}; the next run will read it as factor b and give ${nice(fma32(a, res, 1.5))}.`);
      if (!GG.reducedMotion) { flashAnim.reset(); flashAnim.start(); }
    }
    const nice = (v) => (Number.isNaN(v) ? 'NaN' : !isFinite(v) ? (v > 0 ? '+inf' : '−inf') : Math.abs(v) >= 1e6 ? v.toExponential(3) : fmt.sig(v, 7));
    /* short form for the product label between the two circles on phones: at most about 6 characters */
    const short = (v) => (Number.isNaN(v) ? 'NaN' : !isFinite(v) ? (v > 0 ? '+inf' : '−inf') : Math.abs(v) >= 1e4 ? v.toExponential(1).replace('e+', 'e') : String(Number(v.toPrecision(4))));
    function draw() {
      if (!W) return;
      pic.innerHTML = '';
      R.back = null; R.dot = null;
      if (which === 'ffma') drawFFMA(); else drawS2UR();
    }
    function drawFFMA() {
      const narrow = W < 560;
      const L = st.last; // showing the run that just happened?
      const a = L ? L.a : st.r7, b = L ? L.b : st.r0;
      const res = L ? L.res : fma32(st.r7, st.r0, 1.5), prod = a * b;
      const H = narrow ? 258 : 248;
      const s = svgRoot(pic, W, H, L
        ? `FFMA run ${L.n}: R0 = ${nice(a)} × ${nice(b)} + 1.5 = ${nice(res)}, written back to R0`
        : `FFMA dataflow: next run computes R7 × R0 + 1.5 = ${nice(a)} × ${nice(b)} + 1.5 = ${nice(res)}`);
      const rfW = Math.min(W - 24, 640), rx = (W - rfW) / 2 + 4, ry = 22;
      tx(s, rx, 12, 'register file (this thread’s slice)', { size: 10, fill: 'var(--memory)' });
      const hiTok = INS.ffma.toks[selTok];
      // phones: R0, R1…R6 folded into one cell, R7, so the two live registers get room for their values
      const cells = narrow ? [{ lab: 'R0', i: 0, w: 0.38 }, { lab: 'R1 … R6', i: -1, w: 0.24 }, { lab: 'R7', i: 7, w: 0.38 }]
        : Array.from({ length: 8 }, (_, i) => ({ lab: 'R' + i, i, w: 1 / 8 }));
      const vals = { 0: st.r0, 7: st.r7 };
      const ctr = {};
      let cx0 = rx;
      cells.forEach((c) => {
        const cw = rfW * c.w, used = c.i === 0 || c.i === 7;
        const lit = (hiTok.t === 'R0' && c.i === 0) || (hiTok.t === 'R7' && c.i === 7);
        const fresh = L && c.i === 0; // just written
        rect(s, cx0 + 2, ry, cw - 4, 40, { fill: fresh ? 'rgba(69,212,155,0.2)' : used ? 'rgba(111,166,255,0.2)' : 'rgba(111,166,255,0.05)', stroke: lit ? 'var(--accent)' : fresh ? 'var(--core)' : used ? 'var(--memory)' : 'rgba(111,166,255,0.3)', sw: lit || fresh ? 2 : 1 });
        tx(s, cx0 + cw / 2, ry + 15, c.lab + (fresh ? ' · new' : ''), { anchor: 'middle', size: 10, fill: used ? 'var(--ink)' : 'var(--ink-3)' });
        tx(s, cx0 + cw / 2, ry + 33, used ? nice(vals[c.i]) : '·', { anchor: 'middle', size: 13, weight: 600, fill: used ? '#fff' : 'var(--ink-3)' });
        ctr[c.i] = cx0 + cw / 2;
        cx0 += cw;
      });
      const c0 = ctr[0], c7 = ctr[7];
      const mx = W / 2 - (narrow ? 44 : 70), my = ry + 104, ax = W / 2 + (narrow ? 36 : 70), ay = my;
      const opLit = hiTok.c === 'op';
      const srcA = (hiTok.t === 'R7') ? 'var(--accent)' : 'var(--memory)';
      const srcB = (hiTok.t === 'R0' && selTok === 5) ? 'var(--accent)' : 'var(--memory)';
      path(s, `M${c7},${ry + 40} C${c7},${my} ${mx + 60},${my - 30} ${mx + 12},${my - 11}`, { stroke: srcA, sw: 1.5 });
      head(s, mx + 11, my - 11, -1, 0.5, srcA, 6);
      path(s, `M${c0},${ry + 40} C${c0},${my} ${mx - 60},${my - 30} ${mx - 12},${my - 11}`, { stroke: srcB, sw: 1.5 });
      head(s, mx - 11, my - 11, 1, 0.5, srcB, 6);
      const lh = 'paint-order:stroke;stroke:var(--bg);stroke-width:4px;';
      tx(s, c7 - 10, ry + (narrow ? 72 : 58), 'a = R7 = ' + nice(a), { size: 10, fill: 'var(--memory)', anchor: 'end', style: lh });
      tx(s, c0 + 10, ry + 58, (L ? 'b = old R0 = ' : 'b = R0 = ') + nice(b), { size: 10, fill: 'var(--memory)', style: lh });
      S('circle', { cx: mx, cy: my, r: 16, style: `fill:rgba(69,212,155,${opLit ? 0.35 : 0.15});stroke:var(--core);stroke-width:${opLit ? 2 : 1.2}` }, s);
      tx(s, mx, my + 6, '×', { anchor: 'middle', size: 18, fill: '#fff' });
      line(s, mx + 16, my, ax - 19, ay, { stroke: 'var(--core)', sw: 1.5 });
      head(s, ax - 16, ay, 1, 0, 'var(--core)', 6);
      tx(s, (mx + ax) / 2, my + 24, narrow ? short(prod) : nice(prod), { anchor: 'middle', size: narrow ? 9.5 : 10.5, fill: 'var(--ink-2)', style: 'paint-order:stroke;stroke:var(--bg);stroke-width:3px;' });
      S('circle', { cx: ax, cy: ay, r: 16, style: `fill:rgba(69,212,155,${opLit ? 0.35 : 0.15});stroke:var(--core);stroke-width:${opLit ? 2 : 1.2}` }, s);
      tx(s, ax, ay + 6, '+', { anchor: 'middle', size: 18, fill: '#fff' });
      const immLit = hiTok.t === '1.5';
      const ix = ax + 28;
      rect(s, ix, ay - 11, 44, 22, { fill: 'rgba(255,178,138,0.12)', stroke: immLit ? 'var(--accent)' : 'rgba(255,178,138,0.6)', sw: immLit ? 2 : 1, rx: 5 });
      tx(s, ix + 22, ay + 4, '1.5', { anchor: 'middle', size: 12, weight: 600, fill: '#ffb28a' });
      tx(s, ix + 22, ay + 25, 'immediate', { size: 9.5, fill: 'var(--ink-3)', anchor: 'middle' });
      line(s, ix, ay, ax + 20, ay, { stroke: '#ffb28a', sw: 1.2 });
      head(s, ax + 17, ay, -1, 0, '#ffb28a', 5);
      const resStr = nice(res);
      const rbW = Math.max(narrow ? 76 : 96, resStr.length * 8 + 18), rby = ay + 40;
      line(s, ax, ay + 16, ax, rby - 4, { stroke: 'var(--core)', sw: 1.5 });
      head(s, ax, rby - 1, 0, 1, 'var(--core)', 6);
      const dLit = hiTok.t === 'R0' && selTok === 1;
      rect(s, ax - rbW / 2, rby, rbW, 30, { fill: 'rgba(69,212,155,0.16)', stroke: dLit ? 'var(--accent)' : 'var(--core)', sw: dLit ? 2 : 1.2, rx: 5 });
      tx(s, ax, rby + 20, resStr, { anchor: 'middle', size: 13, weight: 700, fill: '#fff' });
      tx(s, ax + rbW / 2 + 6, rby + 19, L ? 'written' : 'next result', { size: 9.5, fill: 'var(--core)' });
      const lx = rx - 7;
      const backC = dLit ? 'var(--accent)' : 'var(--core)';
      const back = path(s, `M${ax - rbW / 2},${rby + 15} H${lx} V${ry + 20} H${rx - 2}`, { stroke: backC, sw: L ? 2.2 : 1.4, dash: L ? null : '5 4', op: L ? 1 : 0.7 });
      head(s, rx + 1, ry + 20, 1, 0, backC, 6);
      tx(s, lx + 8, rby + 10, L ? (narrow ? 'written back to R0' : 'written back to R0, the destination') : (narrow ? 'will write back to R0' : 'will write back to R0, the destination'), { size: 9.5, fill: 'var(--core)' });
      R.back = back;
      R.dot = S('circle', { r: 4.5, cx: -20, cy: -20, style: 'fill:var(--core);stroke:#fff;stroke-width:1.2;opacity:0' }, s);
      const lead = L ? `run ${L.n}:` : 'next run:';
      if (narrow) {
        tx(s, W / 2, H - 22, `${lead} R0 ← R7 × R0 + 1.5`, { anchor: 'middle', size: 10.5, fill: 'var(--ink)' });
        tx(s, W / 2, H - 7, `= ${nice(a)} × ${nice(b)} + 1.5 = ${nice(res)}`, { anchor: 'middle', size: 10.5, fill: 'var(--ink)' });
      } else tx(s, W / 2, H - 8, `${lead} R0 ← R7 × R0 + 1.5 = ${nice(a)} × ${nice(b)} + 1.5 = ${nice(res)}`, { anchor: 'middle', size: 12, fill: 'var(--ink)' });
      sR7.el.querySelector('i').textContent = 'R7'; sR7.set(nice(st.r7), 'memory');
      sR0.el.querySelector('i').textContent = st.runs ? `R0 now (after ${st.runs} run${st.runs === 1 ? '' : 's'})` : 'R0 now'; sR0.set(nice(st.r0), 'memory');
      sRes.el.querySelector('i').textContent = 'next result'; sRes.set(nice(fma32(st.r7, st.r0, 1.5)), 'core');
      sRes.el.title = 'What the next FFMA would write to R0, rounded once to a 32-bit float';
    }
    const R = {};
    /* after Execute: a token travels the write-back path into R0 */
    const flashAnim = GG.anim(f.stage, (t) => {
      const p = R.back, d = R.dot;
      if (!p || !d) { flashAnim.stop(); return; }
      const u = Math.min(1, t / 0.9), Lp = p.getTotalLength(), pt = p.getPointAtLength(Lp * u);
      d.setAttribute('cx', pt.x.toFixed(1)); d.setAttribute('cy', pt.y.toFixed(1));
      d.style.opacity = u < 1 ? 1 : 0;
      if (u >= 1) flashAnim.stop();
    }, { autostart: false });
    function drawS2UR() {
      const narrow = W < 560;
      const cmp = st.lanes; // comparing with S2R R0, SR_TID.X
      const nC = 6;
      const H = narrow ? 330 : 286;
      const s = svgRoot(pic, W, H, cmp
        ? 'S2R copies each thread’s own index from SR_TID.X into its own register R0: 32 registers for 32 threads'
        : `S2UR copies CTA index ${st.cta} from special register SR_CTAID.X into uniform register UR4, one register read by all 32 threads`);
      const gW = Math.min(W - 10, 600), gx = (W - gW) / 2, cW = gW / nC;
      tx(s, gx, 12, 'the grid: CTAs along x', { size: 10, fill: 'var(--ink-3)' });
      for (let i = 0; i < nC; i++) {
        const on = i === st.cta;
        rect(s, gx + i * cW + 2, 20, cW - 4, 30, { fill: on ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)', stroke: on ? 'var(--ink)' : 'var(--line-2)', dash: on ? null : '4 3', rx: 5 });
        tx(s, gx + i * cW + cW / 2, 39, (cW > 70 ? 'CTA ' : '') + i, { anchor: 'middle', size: 11, fill: on ? '#fff' : 'var(--ink-3)' });
      }
      const cx = gx + st.cta * cW + cW / 2;
      const tok = INS.s2ur.toks[selTok];
      const bw = narrow ? 118 : 160, gapH = narrow ? Math.max(30, (W - 16 - 2 * bw) / 2) : 70, srX = W / 2 - gapH - bw, srY = 82;
      const srLit = !cmp && tok.c === 'sr';
      if (!cmp) path(s, `M${cx},50 C${cx},66 ${srX + bw / 2},64 ${srX + bw / 2},${srY - 2}`, { stroke: 'var(--line-2)', sw: 1, dash: '3 3' });
      rect(s, srX, srY, bw, 40, { fill: 'rgba(111,166,255,0.1)', stroke: srLit ? 'var(--accent)' : 'var(--memory)', sw: srLit ? 2 : 1.4, dash: srLit ? null : '4 3', rx: 6 });
      tx(s, srX + bw / 2, srY + 15, cmp ? 'SR_TID.X' : 'SR_CTAID.X', { anchor: 'middle', size: 10.5, fill: 'var(--memory)' });
      tx(s, srX + bw / 2, srY + 32, cmp ? '0 … 31' : String(st.cta), { anchor: 'middle', size: 14, weight: 700, fill: '#fff' });
      tx(s, srX + bw / 2, srY + 54, cmp ? 'special register,' : 'special register:', { anchor: 'middle', size: 9.5, fill: 'var(--ink-3)' });
      tx(s, srX + bw / 2, srY + 67, cmp ? 'different in each thread' : (narrow ? 'read-only, set by HW' : 'read-only, set by hardware'), { anchor: 'middle', size: 9.5, fill: 'var(--ink-3)' });
      const urX = W / 2 + gapH, urLit = !cmp && tok.t === 'UR4';
      const opLit = !cmp && tok.c === 'op';
      line(s, srX + bw, srY + 20, urX - 8, srY + 20, { stroke: opLit ? 'var(--accent)' : 'var(--core)', sw: opLit ? 2.4 : 1.6 });
      head(s, urX - 2, srY + 20, 1, 0, opLit ? 'var(--accent)' : 'var(--core)', 7);
      tx(s, (srX + bw + urX) / 2, srY + 12, cmp ? 'S2R' : 'S2UR', { anchor: 'middle', size: 10.5, weight: 600, fill: '#52dba4' });
      // lanes
      const ly = srY + (narrow ? 136 : 122), lanes = 32, lw = Math.min(W - 10, 820), lx = (W - lw) / 2;
      const perRow = narrow ? 16 : 32, lcw = lw / perRow, lh = 24;
      const laneXY = (i) => { const r = Math.floor(i / perRow), c = i % perRow; return { x: lx + c * lcw, y: ly + r * (lh + 6) }; };
      if (!cmp) {
        // one uniform register; 32 thin lines from it to 32 threads, which hold no copy of their own
        rect(s, urX, srY, bw, 40, { fill: 'rgba(111,166,255,0.24)', stroke: urLit ? 'var(--accent)' : 'var(--memory)', sw: urLit ? 2.4 : 1.6, rx: 6 });
        tx(s, urX + bw / 2, srY + 15, 'UR4', { anchor: 'middle', size: 10.5, fill: 'var(--memory)' });
        tx(s, urX + bw / 2, srY + 32, String(st.cta), { anchor: 'middle', size: 14, weight: 700, fill: '#fff' });
        tx(s, urX + bw / 2, srY + 54, 'uniform register:', { anchor: 'middle', size: 9.5, fill: 'var(--ink-3)' });
        tx(s, urX + bw / 2, srY + 67, 'one for the warp', { anchor: 'middle', size: 9.5, fill: 'var(--ink-3)' });
        const fx = urX + bw / 2, fy = srY + 74;
        for (let i = 0; i < lanes; i++) {
          const { x, y } = laneXY(i);
          line(s, fx, fy, x + lcw / 2, y + 3, { stroke: 'rgba(111,166,255,0.38)', sw: 0.8 });
        }
        for (let i = 0; i < lanes; i++) {
          const { x, y } = laneXY(i);
          path(s, strandPath(x + lcw / 2, y + 3, lh - 4, 1.6, 1.2, false), { stroke: 'var(--ink-2)', sw: 1.2 });
          S('circle', { cx: x + lcw / 2, cy: y + 3, r: 2.6, style: 'fill:var(--memory)' }, s);
        }
      } else {
        // 32 per-thread copies, each a register of its own
        rect(s, urX, srY, bw, 40, { fill: 'rgba(111,166,255,0.1)', stroke: 'var(--memory)', sw: 1.2, dash: '2 3', rx: 6 });
        tx(s, urX + bw / 2, srY + 15, 'R0', { anchor: 'middle', size: 10.5, fill: 'var(--memory)' });
        tx(s, urX + bw / 2, srY + 32, '× 32', { anchor: 'middle', size: 14, weight: 700, fill: '#fff' });
        tx(s, urX + bw / 2, srY + 54, 'an ordinary register', { anchor: 'middle', size: 9.5, fill: 'var(--ink-3)' });
        tx(s, urX + bw / 2, srY + 67, 'in every thread', { anchor: 'middle', size: 9.5, fill: 'var(--ink-3)' });
        for (let i = 0; i < lanes; i++) {
          const { x, y } = laneXY(i);
          rect(s, x + 1, y, lcw - 2, lh, { fill: 'rgba(111,166,255,0.22)', stroke: 'rgba(111,166,255,0.75)', rx: 3 });
          tx(s, x + lcw / 2, y + 16, String(i), { anchor: 'middle', size: lcw < 22 ? 9.5 : 10.5, fill: 'var(--ink)' });
        }
      }
      const hdr = cmp ? ['S2R R0, SR_TID.X: 32 register boxes,', 'one R0 in each of the 32 threads'] : ['the 32 threads of the warp: 1 register box,', 'every thread reads the one UR4'];
      const halo = 'paint-order:stroke;stroke:var(--bg);stroke-width:4px;';
      if (narrow) { tx(s, lx, ly - 30, hdr[0], { size: 10, fill: 'var(--memory)', style: halo }); tx(s, lx, ly - 17, hdr[1], { size: 10, fill: 'var(--memory)', style: halo }); }
      else tx(s, lx, ly - 22, hdr.join(' '), { size: 10, fill: 'var(--memory)', style: halo });
      const by = ly + (narrow ? 2 : 1) * (lh + 6) + 14;
      const msg = cmp ? ['The thread index differs from thread to thread,', 'so each thread needs its own register R0.'] : ['The CTA index is the same for every thread of the warp,', 'so one uniform register is enough.'];
      if (narrow) { tx(s, lx, by, msg[0], { size: 10, fill: 'var(--ink-3)' }); tx(s, lx, by + 13, msg[1], { size: 10, fill: 'var(--ink-3)' }); }
      else tx(s, lx, by, msg[0] + ' ' + msg[1], { size: 10, fill: 'var(--ink-3)' });
      sR7.el.querySelector('i').textContent = cmp ? 'SR_TID.X' : 'SR_CTAID.X'; sR7.set(cmp ? '0 … 31' : String(st.cta), 'memory');
      sR0.el.querySelector('i').textContent = cmp ? 'R0 after' : 'UR4 after'; sR0.set(cmp ? 'its own index' : String(st.cta), 'memory');
      sRes.el.querySelector('i').textContent = 'register boxes'; sRes.set(cmp ? '32 (one per thread)' : '1 (for 32 threads)', 'memory');
      sRes.el.title = '';
    }
    GG.ui.seg(f.controls, { label: 'Instruction', value: which, options: [{ value: 'ffma', label: 'FFMA R0, R7, R0, 1.5 ;' }, { value: 's2ur', label: 'S2UR UR4, SR_CTAID.X ;' }], onChange: (v) => { which = v; selTok = 0; buildToks(); buildControls(); explain(); } });
    f.controls.append(ctl);
    buildToks(); buildControls();
    onWidth(pic, (w) => { W = w; draw(); });
    explain();
  }

  /* Fig: one small kernel, compiled for real, line by line (Godbolt-style source mapping) */
  function sassGodbolt(host, ctx, xref) {
    const f = ctx.figure(host, {
      title: 'Source, PTX and SASS, line by line', hint: canHover ? 'hover or click a C++ line' : 'tap a C++ line', wide: true,
      caption: `Real output of NVCC 13.2 with <code>-arch=sm_90 -O3</code>, compiled on ${X(GODBOLT.replace(/\/z\/.*/, ''), 'Godbolt')} for a three-line kernel of ours; the trailing branch-to-self and <code>NOP</code> padding are left out. The small number before each PTX and SASS line is the C++ line it came from, as Godbolt maps it. The glossary’s ${X(GODBOLT, 'own Godbolt link')} compares two naive SGEMM kernels side by side, <code>sgemm_global_mem_coalesce</code> and <code>sgemm_global_mem_uncoalesced</code>, compiled by NVCC 11.7 for <code>compute_86</code>/<code>sm_86</code>: they differ only in which thread index picks the row and which the column, which decides whether a warp’s loads are ${T('memory-coalescing', 'coalesced')}.`,
    });
    const CPP = [
      '__global__ void axpb(float* x, float y) {',
      '    int i = blockIdx.x * blockDim.x + threadIdx.x;',
      '    x[i] = x[i] * y + 1.5f;',
      '}',
    ];
    const PTX = [
      [1, 'ld.param.u64 %rd1, [_Z4axpbPff_param_0];'],
      [1, 'ld.param.f32 %f1, [_Z4axpbPff_param_1];'],
      [2, 'cvta.to.global.u64 %rd2, %rd1;'],
      [2, 'mov.u32 %r1, %ctaid.x;'],
      [2, 'mov.u32 %r2, %ntid.x;'],
      [2, 'mov.u32 %r3, %tid.x;'],
      [2, 'mad.lo.s32 %r4, %r1, %r2, %r3;'],
      [3, 'mul.wide.s32 %rd3, %r4, 4;'],
      [3, 'add.s64 %rd4, %rd2, %rd3;'],
      [3, 'ld.global.f32 %f2, [%rd4];'],
      [3, 'fma.rn.f32 %f3, %f2, %f1, 0f3FC00000;'],
      [3, 'st.global.f32 [%rd4], %f3;'],
      [4, 'ret;'],
    ];
    const SASS = [
      [1, 'LDC R1, c[0x0][0x28] ;'],
      [2, 'S2R R0, SR_TID.X ;'],
      [2, 'S2UR UR4, SR_CTAID.X ;'],
      [2, 'LDC R5, c[0x0][RZ] ;'],
      [3, 'LDC.64 R2, c[0x0][0x210] ;'],
      [2, 'IMAD R5, R5, UR4, R0 ;'],
      [2, 'ULDC.64 UR4, c[0x0][0x208] ;'],
      [3, 'IMAD.WIDE R2, R5, 0x4, R2 ;'],
      [3, 'LDC R5, c[0x0][0x218] ;'],
      [3, 'LDG.E R0, desc[UR4][R2.64] ;'],
      [3, 'FFMA R5, R0, R5, 1.5 ;'],
      [3, 'STG.E desc[UR4][R2.64], R5 ;'],
      [4, 'EXIT ;'],
    ];
    const WHY = {
      1: '<b>Line 1, the kernel’s signature.</b> The parameters <code>x</code> and <code>y</code> arrive through the parameter state space in PTX (<code>ld.param</code>, with the C++ name mangled to <code>_Z4axpbPff</code>) and through constant bank 0 in SASS. The SASS line here sets up the stack pointer <code>R1</code>, also from the constant bank.',
      2: '<b>Line 2, “which element is mine?”</b> PTX copies the three special registers with the glossary’s own three <code>mov.u32</code> lines, then one <code>mad.lo.s32</code> (multiply-add on integers). In SASS the CTA index goes to a uniform register with <code>S2UR UR4, SR_CTAID.X</code>, the glossary’s second example instruction, while the thread index needs a per-thread register (<code>S2R</code>).',
      3: '<b>Line 3, the arithmetic.</b> A global load, one fused multiply-add, a global store. The PTX <code>fma.rn.f32</code> adds <code>0f3FC00000</code> and the SASS <code>FFMA</code> adds <code>1.5</code>: the same constant, the same kind of instruction as the glossary’s two examples. The SASS for lines 2 and 3 is interleaved: the compiler reorders instructions, for example starting line 3’s constant-bank load before line 2’s arithmetic is done.',
      4: '<b>Line 4, the end.</b> <code>ret</code> in PTX, <code>EXIT</code> in SASS.',
    };
    let sel = 3;
    const box = el('div', { class: 'dsa-gb' });
    f.stage.append(box);
    const cpp = el('div', { class: 'dsa-gb-pane dsa-gb-cpp' });
    cpp.append(el('div', { class: 'dsa-k', text: 'CUDA C++ · source' }));
    const cppLines = CPP.map((c, i) => {
      const b = el('button', { type: 'button', class: 'dsa-gb-ln', 'aria-pressed': 'false', 'aria-label': 'C++ line ' + (i + 1) });
      b.innerHTML = `<span class="g">${i + 1}</span><span class="t">${GG.highlightLine(c, 'cuda')}</span>`;
      b.addEventListener('click', () => pick(i + 1));
      if (canHover) b.addEventListener('mouseenter', () => pick(i + 1));
      cpp.append(b);
      return b;
    });
    const two = el('div', { class: 'dsa-gb-two' });
    const mk = (title, rows, lang) => {
      const p = el('div', { class: 'dsa-gb-pane' });
      p.append(el('div', { class: 'dsa-k', text: title }));
      const els = rows.map(([src, t]) => {
        const d = el('div', { class: 'dsa-gb-ln', 'data-src': String(src) });
        d.innerHTML = `<span class="g">${src}</span><span class="t">${GG.highlightLine(t, lang)}</span>`;
        p.append(d);
        return d;
      });
      two.append(p);
      return els;
    };
    const ptxEls = mk('PTX', PTX, 'ptx');
    const sassEls = mk('SASS · sm_90', SASS, 'sass');
    box.append(cpp, two);
    const sP = GG.ui.stat(f.readouts, { label: 'PTX lines', value: '', tone: 'memory' });
    const sS = GG.ui.stat(f.readouts, { label: 'SASS lines', value: '', tone: 'core' });
    function pick(k) {
      sel = k;
      cppLines.forEach((b, i) => b.setAttribute('aria-pressed', String(i + 1 === k)));
      [...ptxEls, ...sassEls].forEach((d) => d.classList.toggle('on', d.getAttribute('data-src') === String(k)));
      sP.set(PTX.filter((r) => r[0] === k).length + ' of ' + PTX.length);
      sS.set(SASS.filter((r) => r[0] === k).length + ' of ' + SASS.length);
      f.setWhy(WHY[k]);
    }
    pick(sel);
    /* Fig. 4 points at a PTX line and the SASS line it became; null clears the mark */
    if (xref) xref.mark = (pi, si) => {
      ptxEls.forEach((d, i) => d.classList.toggle('xref', i === pi));
      sassEls.forEach((d, i) => d.classList.toggle('xref', i === si));
    };
  }

  /* Fig: what is and is not documented, a PTX instruction against the SASS it compiled to */
  function sassDocs(host, ctx, xref) {
    const f = ctx.figure(host, {
      title: 'What you can find out: PTX against SASS', hint: canHover ? 'pick an instruction · hover or click a row' : 'pick an instruction · tap a row', wide: true,
      caption: 'Each instruction pair is taken from the compiled kernel of Fig. 3: a PTX instruction and the SASS instruction it became. On the left, what the PTX ISA reference publishes; on the right, how much NVIDIA publishes for SASS. The hatched bar is the 128-bit word of one Hopper instruction, none of its bits documented. The PTX column and the instruction-word size are context we added, the size from the reverse-engineering work.',
    });
    const ENC = {
      ptx: ['none to learn: PTX is text, which <code>ptxas</code> or the driver compiles to SASS', 'na', 'not applicable'],
      sass: ['<span class="dsa-word dsa-qbits" role="img" aria-label="one 128-bit instruction word whose layout NVIDIA does not publish"><span>128-bit word · layout unpublished</span></span>', 'meh', 'reverse-engineered'],
    };
    const SEM_SASS = ['not published', 'bad', 'not defined · inferred'];
    const INS = {
      ffma: { label: 'FFMA', line: 3, pi: 10, si: 10, ptxName: 'fma.rn.f32', sassName: 'FFMA',
        ptx: 'fma.rn.f32 %f3, %f2, %f1, 0f3FC00000;', sass: 'FFMA R5, R0, R5, 1.5 ;',
        name: [['<code>fma</code>: fused multiply-add, here on <code>.f32</code> values', 'good', 'documented'], ['<code>FFMA</code>: “FP32 Fused Multiply and Add”', 'good', 'listed, one line']],
        sem: [['<code>d = a × b + c</code>: product and sum kept exact, then rounded once', 'good', 'documented'], SEM_SASS],
        mod: [['rounding <code>.rn .rz .rm .rp</code>, <code>.ftz</code>, <code>.sat</code>', 'good', 'documented'], ['which modifiers FFMA accepts is not published', 'bad', 'not published']] },
      imad: { label: 'IMAD', line: 2, pi: 6, si: 5, ptxName: 'mad.lo.s32', sassName: 'IMAD',
        ptx: 'mad.lo.s32 %r4, %r1, %r2, %r3;', sass: 'IMAD R5, R5, UR4, R0 ;',
        name: [['<code>mad</code>: integer multiply-add, here keeping the low half', 'good', 'documented'], ['<code>IMAD</code>: “Integer Multiply And Add”', 'good', 'listed, one line']],
        sem: [['<code>d</code> = low 32 bits of <code>a × b</code>, plus <code>c</code>', 'good', 'documented'], SEM_SASS],
        mod: [['<code>.hi .lo .wide</code> pick the part of the product; <code>.sat</code>', 'good', 'documented'], ['Fig. 3 also has <code>IMAD.WIDE</code>; no suffix is explained', 'bad', 'not published']] },
      ldg: { label: 'LDG', line: 3, pi: 9, si: 9, ptxName: 'ld.global.f32', sassName: 'LDG.E',
        ptx: 'ld.global.f32 %f2, [%rd4];', sass: 'LDG.E R0, desc[UR4][R2.64] ;',
        name: [['<code>ld</code>: load, here from the <code>.global</code> state space', 'good', 'documented'], ['<code>LDG</code>: “Load from Global Memory”', 'good', 'listed, one line']],
        sem: [['load <code>d</code> from address <code>a</code>, under PTX’s memory consistency model', 'good', 'documented'], SEM_SASS],
        mod: [['state spaces, cache operators such as <code>.ca .cg .cs</code>, vectors <code>.v2 .v4</code>', 'good', 'documented'], ['<code>.E</code> and <code>desc[UR4]</code> are not explained', 'bad', 'not published']] },
    };
    const FIELDS = [
      { k: 'name', h: 'Its name' },
      { k: 'sem', h: 'What it does, exactly' },
      { k: 'mod', h: 'Its modifiers' },
      { k: 'enc', h: 'How it is encoded' },
    ];
    let which = 'ffma', field = 'sem';
    const box = el('div', { class: 'dsa-doc' });
    f.stage.append(box);
    const pair = el('div', { class: 'dsa-dpair' });
    const pairK = el('div', { class: 'dsa-k' });
    const lnP = el('div', { class: 'dsa-gb-ln' }), lnS = el('div', { class: 'dsa-gb-ln' });
    pair.append(pairK, lnP, lnS);
    const grid = el('div', { class: 'dsa-dgrid' });
    const head = el('div', { class: 'dsa-dhead', 'aria-hidden': 'true' });
    const hP = el('span'), hS = el('span');
    head.append(el('span', { text: '' }), hP, hS);
    grid.append(head);
    const rows = FIELDS.map((fd) => {
      const b = el('button', { type: 'button', class: 'dsa-drow', 'aria-pressed': 'false' });
      const cP = el('span', { class: 'dsa-dc' }), cS = el('span', { class: 'dsa-dc' });
      b.append(el('b', { text: fd.h }), cP, cS);
      b.addEventListener('click', () => pick(fd.k));
      b.addEventListener('focus', () => mark(true));
      b.addEventListener('blur', () => mark(false));
      if (canHover) { b.addEventListener('mouseenter', () => { pick(fd.k); mark(true); }); b.addEventListener('mouseleave', () => mark(false)); }
      grid.append(b);
      return { fd, b, cP, cS };
    });
    box.append(pair, grid);
    const cell = (c) => `<span class="v">${c[0]}</span><span class="st ${c[1]}">${esc(c[2])}</span>`;
    /* while the reader points at a row, outline the same two lines in Fig. 3 */
    function mark(on) { if (xref && xref.mark) xref.mark(on ? INS[which].pi : -1, on ? INS[which].si : -1); }
    function fill() {
      const I = INS[which];
      pairK.textContent = `from Fig. 3 · C++ line ${I.line}`;
      lnP.innerHTML = `<span class="g">PTX</span><span class="t">${GG.highlightLine(I.ptx, 'ptx')}</span>`;
      lnS.innerHTML = `<span class="g">SASS</span><span class="t">${GG.highlightLine(I.sass, 'sass')}</span>`;
      hP.innerHTML = `PTX ISA · <b>${esc(I.ptxName)}</b>`;
      hS.innerHTML = `SASS · <b>${esc(I.sassName)}</b>`;
      rows.forEach((r) => {
        const pr = r.fd.k === 'enc' ? [ENC.ptx, ENC.sass] : I[r.fd.k];
        r.cP.innerHTML = cell(pr[0]);
        r.cS.innerHTML = cell(pr[1]);
        r.b.setAttribute('aria-label', `${r.fd.h}. PTX ${I.ptxName}: ${pr[0][2]}. SASS ${I.sassName}: ${pr[1][2]}.`);
      });
    }
    function why() {
      const I = INS[which];
      if (field === 'name') return `<b>Both are named.</b> The ${X(PTX_LINKS.docs, 'PTX ISA reference')} gives <code>${esc(I.ptxName.split('.')[0])}</code> its own section: syntax, description, semantics, notes, and which PTX versions and targets support it. For SASS, the ${X(SASS_LINKS.binutils, 'documentation for NVIDIA’s CUDA binary utilities')} has a table of SASS instructions per architecture family, each with a one-line description. That is where you find out what a mnemonic like ${esc(I.label)} stands for.`;
      if (field === 'sem') return `<b>Documented for PTX, not defined for SASS.</b> The PTX reference states what <code>${esc(I.ptxName)}</code> computes. The semantics of the listed SASS instructions are not specified anywhere official. People infer them from the PTX that produced them (here, the PTX line above <code>${esc(I.sass)}</code>, both taken from Fig. 3), from experiments, and from talks like Arun Demeure’s.`;
      if (field === 'mod') return `<b>Modifiers.</b> Every PTX modifier is listed with its meaning in the instruction’s section of the PTX reference. The suffixes that turn up in disassembled SASS, such as <code>.E</code> and <code>.WIDE</code> in Fig. 3, have no published meaning; what they do is inferred like the rest of SASS’s semantics.`;
      return `<b>Entirely undocumented, but reverse-engineered in certain cases:</b> the mapping from ASCII assembler to binary opcodes and operands has been worked out for ${X(SASS_LINKS.maxas, 'Maxwell')} (the maxas assembler) and ${X(SASS_LINKS.lovelace, 'Lovelace')} (the SM89 instruction-set notes). Beyond the glossary: such work found 64-bit instructions with a control word for every three on Maxwell and Pascal, and 128-bit instructions that carry their own control bits from Volta on, which is the size drawn here for Hopper. Which bits hold the opcode, the registers and the immediate is known only from that reverse engineering. PTX has no binary encoding to learn: it is text, compiled to SASS by <code>ptxas</code> at build time or by the driver at load time.`;
    }
    function pick(k) {
      field = k;
      rows.forEach((r) => r.b.setAttribute('aria-pressed', String(r.fd.k === k)));
      f.setWhy(why());
    }
    GG.ui.seg(f.controls, { label: 'Instruction', value: which, options: Object.keys(INS).map((k) => ({ value: k, label: INS[k].label, title: `${INS[k].ptxName} → ${INS[k].sassName}` })), onChange: (v) => { which = v; fill(); pick(field); } });
    fill();
    pick(field);
  }

  GG.entry('streaming-assembler', {
    render(body, ctx) {
      const s = ctx.html(body, `
<p>The name expands as ${X(SASS_LINKS.so, 'Streaming ASSembler')}, with the capitals giving the letters of SASS. An <em>assembly format</em> is the textual spelling of a processor’s native instructions, one line per instruction, close enough to the bits that each line maps to one machine instruction. SASS is the lowest-level format in which human-readable code can be written.</p>
<p>It is one of the formats output by <code>nvcc</code>, the ${T('nvcc', 'NVIDIA CUDA Compiler Driver')}, alongside ${T('parallel-thread-execution', 'PTX')}. It is converted to device-specific binary microcodes during execution. Fig. 1 places it between PTX above and raw bits below, and lets you compare the levels through several lenses.</p>
<div data-slot="ladder" class="wide"></div>
${GG.noteHTML('aside', `<p><b>Why “Streaming”?</b> NVIDIA never spells it out. Presumably, the “Streaming” in “Streaming Assembler” refers to the ${T('streaming-multiprocessor', 'Streaming Multiprocessors')} which the assembly language programs. The ${X(SASS_LINKS.so, 'Stack Overflow thread “What is SASS short for?”')} is where the expansion is usually sourced.</p>`)}
${GG.noteHTML('check', '<p><b>When does SASS become bits?</b> The glossary says SASS “is converted to device-specific binary microcodes during execution”. That wording is loose. In practice the binary is produced before the kernel runs: at compile time by the assembler <code>ptxas</code> (which nvcc runs), or at load time when the driver JIT-compiles PTX with the same kind of compiler. Either way the binary goes into a <em>cubin</em>, and nothing is translated while the kernel executes. The SASS text you read is usually produced the other way around, by disassembling those bits with tools such as <code>cuobjdump -sass</code> or <code>nvdisasm</code>.</p>', 'Checked: “during execution”')}
<h3>One architecture at a time</h3>
<p>SASS is versioned and tied to a specific NVIDIA GPU ${T('streaming-multiprocessor-architecture', 'SM architecture')}. See also ${T('compute-capability', 'Compute Capability')}. SASS built for one SM architecture loads only on GPUs with the same major version and an equal or higher minor version (SASS for <code>sm_80</code> runs on 8.0, 8.6 and 8.9, but not on 7.5 or 9.0), and SASS for an <code>a</code> architecture such as <code>sm_90a</code> only on that exact architecture. That is why code that must run on future GPUs also ships as PTX; Fig. 2 of ${T('compute-capability', 'Compute Capability')} draws the full table. Architecture names look like <code>SM90a</code>: <code>9</code> and <code>0</code> are the major and minor version (Hopper is 9.0), and the <code>a</code> marks architecture-specific features that only this exact architecture is promised to have.</p>
<h3>Reading two instructions</h3>
<p>Some exemplary instructions in SASS for the SM90a architecture of Hopper GPUs:</p>
<ul>
<li><code>FFMA R0, R7, R0, 1.5 ;</code> performs a <code>F</code>used <code>F</code>loating point <code>M</code>ultiply <code>A</code>dd that multiplies the contents of <code>R</code>egister 7 and <code>R</code>egister 0, adds <code>1.5</code>, and stores the result in <code>R</code>egister 0. “Fused” means the multiply and the add happen as one step with a single rounding at the end, which is both faster and more accurate than two separate instructions.</li>
<li><code>S2UR UR4, SR_CTAID.X ;</code> copies the <code>X</code> value of the ${T('cooperative-thread-array', 'Cooperative Thread Array')}’s <code>I</code>n<code>D</code>ex from its <code>S</code>pecial <code>R</code>egister to <code>U</code>niform <code>R</code>egister 4. Special registers are read-only values the hardware provides to each thread, such as which block it belongs to.</li>
</ul>
${GG.noteHTML('check', `<p><b>The letters of FFMA.</b> NVIDIA’s ${X(SASS_LINKS.binutils, 'instruction table')} expands <code>FFMA</code> as “FP32 Fused Multiply and Add”. Read that way, the first F is a type prefix, the one <code>FADD</code> (“FP32 Add”) and <code>FMUL</code> (“FP32 Multiply”) share, as <code>D</code> is for <code>DFMA</code> (“FP64 Fused Multiply Add”) and <code>H</code> for <code>HFMA2</code> (FP16), and <code>FMA</code> is the operation. The glossary’s “Fused Floating point Multiply Add” uses the same four letters with the two Fs swapped; both say the same thing, a single-precision fused multiply-add.</p>`, 'Checked: the letters of FFMA')}
<p>Take them apart in Fig. 2. Every token is a button; the picture underneath shows what the instruction does to the ${T('registers', 'registers')}.</p>
<div data-slot="anat" class="wide"></div>
${GG.noteHTML('beyond', `<p><b>Uniform registers.</b> Since the Turing generation, SMs have a small <em>uniform datapath</em> with its own registers (<code>UR0</code>, <code>UR1</code>, …). A value that is the same for every thread of a ${T('warp', 'warp')}, like the CTA index, a loop counter or a base address, can live there once instead of 32 times, which saves space in the per-thread ${T('register-file', 'register file')} and work on the main datapath. The ordinary <code>S2R</code> instruction instead copies a special register into a per-thread register <code>R</code>, as for the thread index <code>SR_TID.X</code>.</p>`)}
<h3>Who reads and writes SASS</h3>
<p>Even more so than for CPUs, writing this “GPU assembler” by hand is very uncommon. Viewing compiler-generated SASS while profiling and editing high-level ${T('cuda-c', 'CUDA C/C++')} code or in-line ${T('parallel-thread-execution', 'PTX')} is ${X(SASS_LINKS.gameworks, 'more common')}, especially in the production of the highest-performance kernels: the SASS is the ground truth of what the GPU will run, so it shows whether the compiler did what you hoped (used the fused instruction, kept values in registers, unrolled the loop).</p>
<p>Viewing ${T('cuda-c', 'CUDA C/C++')}, SASS, and ${T('parallel-thread-execution', 'PTX')} together is supported on ${X(GODBOLT, 'Godbolt')}, the Compiler Explorer, which marks each source line and the instructions it became. Fig. 3 does the same for a tiny kernel compiled for Hopper; both of the glossary’s example instructions turn up in it. For more detail on SASS with a focus on performance debugging workflows, see ${X(SASS_LINKS.talk, 'this talk')} from Arun Demeure.</p>
<div data-slot="gb" class="wide"></div>
<h3>Very lightly documented</h3>
<p>SASS is <em>very</em> lightly documented. The instructions are listed in the ${X(SASS_LINKS.binutils, 'documentation for NVIDIA’s CUDA binary utilities')}, the ${T('cuda-binary-utilities', 'tools')} that disassemble GPU binaries, but their semantics are not defined. The mapping from ASCII assembler to binary opcodes and operands is entirely undocumented, but it has been reverse-engineered in certain cases (${X(SASS_LINKS.maxas, 'Maxwell')}, ${X(SASS_LINKS.lovelace, 'Lovelace')}).</p>
<div data-slot="docs" class="wide"></div>
<div data-slot="read"></div>`);
      guard(s.ladder, 'SASS ladder', () => sassLadder(s.ladder, ctx));
      guard(s.anat, 'Instruction anatomy', () => sassAnatomy(s.anat, ctx));
      const xref = {};
      guard(s.gb, 'Line-by-line listing', () => sassGodbolt(s.gb, ctx, xref));
      guard(s.docs, 'Documentation', () => sassDocs(s.docs, ctx, xref));
      ctx.reading(s.read, [
        { href: SASS_LINKS.so, label: 'Stack Overflow: What is SASS short for?', note: 'the source of the expansion' },
        { href: SASS_LINKS.gameworks, label: 'NVIDIA Nsight: PTX and SASS assembly debugging', note: 'viewing SASS while developing' },
        { href: GODBOLT, label: 'Godbolt (Compiler Explorer): CUDA C++, PTX and SASS side by side', note: 'the glossary’s example: coalesced vs uncoalesced naive SGEMM, NVCC 11.7, sm_86' },
        { href: SASS_LINKS.talk, label: 'Arun Demeure: a talk on SASS for performance debugging', note: 'workflows for reading SASS' },
        { href: SASS_LINKS.binutils, label: 'CUDA Binary Utilities: instruction set reference', note: 'the list of SASS instructions per architecture' },
        { href: SASS_LINKS.maxas, label: 'maxas (Nervana Systems)', note: 'an assembler for Maxwell, from reverse-engineered encodings' },
        { href: SASS_LINKS.lovelace, label: 'nv_isa_sm89: the SM89 (Lovelace) instruction set, reverse-engineered', note: 'encodings for Ada Lovelace GPUs' },
      ]);
    },
  });


  /* ═════════════════════════════ Parallel Thread eXecution (PTX) ═════════════════════════════ */

  GG.css(`
.dsa-bitsrow { display: grid; grid-template-columns: repeat(32, minmax(0, 1fr)); gap: 2px; }
.dsa-bitsrow > .dsa-bit { grid-column: var(--c); grid-row: 1; }
.dsa-bitsrow > .dsa-bl { grid-row: 2; font: 500 10px/1.2 var(--font-mono); letter-spacing: 0.06em; text-transform: uppercase; border-top: 2px solid; padding-top: 4px; margin-bottom: 2px; text-align: center; white-space: nowrap; overflow: visible; }
.dsa-bl.s { grid-column: 1 / 2; color: var(--special); border-color: var(--special); }
.dsa-bl.e { grid-column: 2 / 10; color: var(--control); border-color: var(--control); }
.dsa-bl.m1 { grid-column: 10 / 33; color: var(--memory); border-color: var(--memory); }
.dsa-bl.m2 { display: none; color: var(--memory); border-color: var(--memory); }
.dsa-bit { height: 34px; border: 1px solid var(--line-2); border-radius: 4px; background: var(--surface-2); color: var(--ink-2); font: 600 13px/1 var(--font-mono); cursor: pointer; padding: 0; transition: background .15s, color .15s; }
.dsa-bit.s { border-color: rgba(238, 116, 207, 0.55); }
.dsa-bit.e { border-color: rgba(255, 198, 92, 0.55); }
.dsa-bit.m { border-color: rgba(111, 166, 255, 0.5); }
.dsa-bit.s.on { background: rgba(238, 116, 207, 0.55); color: #fff; }
.dsa-bit.e.on { background: rgba(255, 198, 92, 0.55); color: #1d1405; }
.dsa-bit.m.on { background: rgba(111, 166, 255, 0.5); color: #fff; }
.dsa-bit:hover { filter: brightness(1.25); }
.dsa-hexrow { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px; margin-bottom: 12px; }
.dsa-hexrow label { font: 500 10.5px var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-3); display: inline-flex; align-items: center; gap: 8px; }
.dsa-hexrow .pre { font: 600 15px var(--font-mono); color: var(--ink-3); }
.dsa-in { height: 34px; border-radius: 8px; border: 1px solid var(--line-2); background: var(--bg-2); color: var(--ink); font: 600 15px var(--font-mono); padding: 0 10px; width: 132px; letter-spacing: 0.04em; }
.dsa-in:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-a); }
.dsa-in.bad { border-color: var(--danger); }
.dsa-in.dec { width: 170px; }
.dsa-formula { margin-top: 14px; padding: 10px 12px; border: 1px solid var(--line); border-radius: 10px; background: #090a10; font: 500 13.5px/1.7 var(--font-mono); color: var(--ink); overflow-x: auto; white-space: nowrap; scrollbar-width: thin; }
.dsa-formula .s { color: var(--special); } .dsa-formula .e { color: var(--control); } .dsa-formula .m { color: var(--memory); }
.dsa-formula .dim { color: var(--ink-3); }
.dsa-exact { margin-top: 6px; font: 500 12px/1.5 var(--font-mono); color: var(--ink-2); overflow-wrap: anywhere; }
.dsa-exact b { color: var(--ink); font-weight: 600; }
@media (max-width: 720px) {
  .dsa-formula { white-space: normal; }
  .dsa-bitsrow { grid-template-columns: repeat(16, minmax(0, 1fr)); }
  .dsa-bitsrow > .dsa-bit { grid-column: var(--cn); grid-row: var(--rn); }
  .dsa-bit { height: 30px; font-size: 11.5px; }
  .dsa-bl.s { grid-column: 1 / 2; letter-spacing: 0; font-size: 9px; }
  .dsa-bl.m1 { grid-column: 10 / 17; }
  .dsa-bl.m2 { display: block; grid-row: 4; grid-column: 1 / 17; }
}
.dsa-cmp td:first-child { font-family: var(--font-mono); font-size: 12px; color: var(--ink-3); white-space: nowrap; }
`);

  const PTX_LINKS = {
    x86: 'https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html',
    arm: 'https://developer.arm.com/documentation/ddi0487/latest/',
    sparc: 'https://www.gaisler.com/doc/sparcv8.pdf',
    ir: 'https://en.wikipedia.org/wiki/Intermediate_representation',
    waist: 'https://www.oilshell.org/blog/2022/02/diagrams.html',
    ieee: 'https://en.wikipedia.org/wiki/IEEE_754',
    model: 'https://docs.nvidia.com/cuda/parallel-thread-execution/#ptx-machine-model',
    docs: 'https://docs.nvidia.com/cuda/parallel-thread-execution/',
    fa3: 'https://arxiv.org/abs/2407.08608',
    machete: 'https://youtu.be/-4ZkpQ7agXM',
    inline: 'https://docs.nvidia.com/cuda/inline-ptx-assembly/',
  };

  /* GPU generations used by the PTX and compute-capability figures. */
  const GPUS = [
    { cc: '7.0', v: 70, arch: 'Volta', ex: 'V100' },
    { cc: '7.5', v: 75, arch: 'Turing', ex: 'T4' },
    { cc: '8.0', v: 80, arch: 'Ampere', ex: 'A100' },
    { cc: '8.6', v: 86, arch: 'Ampere', ex: 'A10 · RTX 3090' },
    { cc: '8.9', v: 89, arch: 'Ada Lovelace', ex: 'L4 · L40S' },
    { cc: '9.0', v: 90, arch: 'Hopper', ex: 'H100 · H200' },
    { cc: '10.0', v: 100, arch: 'Blackwell', ex: 'B200' },
    { cc: '10.3', v: 103, arch: 'Blackwell', ex: 'B300' },
    { cc: '11.0', v: 110, arch: 'Blackwell', ex: 'Jetson Thor' },
    { cc: '12.0', v: 120, arch: 'Blackwell', ex: 'RTX 5090' },
    { cc: '12.1', v: 121, arch: 'Blackwell', ex: 'DGX Spark' },
  ];
  const ccName = (v) => Math.floor(v / 10) + '.' + (v % 10);

  /* Fig: PTX as a narrow waist */
  function narrowWaist(host, ctx) {
    const f = ctx.figure(host, {
      title: 'PTX, the narrow waist', hint: 'pick the PTX target · toggle the waist', wide: true,
      caption: `Many producers above, many GPUs below, one format in between. The driver on each machine JIT-compiles the PTX into SASS for its own GPU, if the GPU’s compute capability is at least the PTX target. The exception is architecture-specific PTX such as <code>compute_90a</code>, which runs only on that exact compute capability (see the Compute Capability entry). Building for <code>compute_70</code> (Volta) needs CUDA 12.x or older: CUDA 13 dropped offline compilation below compute capability 7.5. Turn on “Without PTX” to see what the waist saves: every producer would need its own translator for every GPU. The producers named (NVRTC, Triton via LLVM) and the example GPUs are our additions. After the <a href="${PTX_LINKS.waist}">“narrow waist”</a> idea from networking and systems design.`,
    });
    const PROD = [
      { k: 'nvcc', name: 'nvcc', sub: 'CUDA C++', term: 'nvcc' },
      { k: 'nvrtc', name: 'NVRTC', sub: 'C++ at run time', term: 'nvrtc' },
      { k: 'asm', name: 'in-line PTX', sub: 'by hand', term: null },
      { k: 'llvm', name: 'Triton · LLVM', sub: 'other compilers', term: null },
    ];
    const G = GPUS.filter((g) => [70, 75, 80, 86, 89, 90, 100, 120].includes(g.v)).concat([{ cc: '?', v: 999, arch: 'not built yet', ex: 'a future GPU' }]);
    let target = 80, archA = false, W = 0, svg = null, R = null, noWaist = false;
    const wrap = el('div', { class: 'dsa-w' });
    f.stage.append(wrap);
    const runs = (g) => (archA ? g.v === target : g.v >= target);
    const tName = () => 'compute_' + target + (archA ? 'a' : '');
    // opaque fills (the tint of each box over the page background), so packets passing behind stay hidden
    const FILL = { prod: '#1e1c2b', waist: '#26231d', jit: '#211d17', ok: '#10201c', no: '#1a1117', neutral: '#16171f' };
    const CYCLES = 2, SPEED = 0.22; // packets run two full trips after each change, then stop
    function draw() {
      wrap.innerHTML = '';
      const narrow = W < 640;
      const cols = narrow ? 3 : G.length;
      const gRows = Math.ceil(G.length / cols);
      const pW = narrow ? (W - 6) / 2 : Math.min(170, (W - 30) / PROD.length);
      const pRows = narrow ? 2 : 1;
      const py = 6, ph = 40;
      const pTotal = pRows * (ph + 8);
      const waistY = pTotal + (narrow ? 70 : 84), waistW = 120, waistH = 40;
      const jitY = waistY + waistH + 28;
      const gy = jitY + 44, gW = (W - 4) / cols, gH = 62;
      const H = gy + gRows * (gH + 8) + 2;
      svg = svgRoot(wrap, W, H, noWaist
        ? `Without a common format: ${PROD.length} producers each need a translator for each of ${G.length} GPUs, ${PROD.length * G.length} in all`
        : `PTX narrow waist: four producers above, nine GPUs below; PTX for ${tName()} runs on ${G.filter(runs).length} of them`);
      R = { packets: [], prods: [], gpus: [] };
      const cx = W / 2;
      const pLeft = narrow ? 3 : (W - PROD.length * pW) / 2, pRight = W - pLeft;
      const funnel = path(svg, `M${pLeft},${pTotal + 6} C${pLeft},${waistY - 20} ${cx - waistW / 2},${waistY - 30} ${cx - waistW / 2},${waistY} L${cx - waistW / 2},${waistY + waistH} C${cx - waistW / 2},${jitY + 10} 2,${gy - 30} 2,${gy - 6} L${W - 2},${gy - 6} C${W - 2},${gy - 30} ${cx + waistW / 2},${jitY + 10} ${cx + waistW / 2},${waistY + waistH} L${cx + waistW / 2},${waistY} C${cx + waistW / 2},${waistY - 30} ${pRight},${waistY - 20} ${pRight},${pTotal + 6} Z`, { fill: 'rgba(255,255,255,0.025)', stroke: 'var(--line)', sw: 1 });
      // the packet layer and the 36-translator tangle sit under the boxes
      const pg = S('g', {}, svg);
      const tangle = S('g', {}, svg);
      PROD.forEach((p, i) => {
        const r = narrow ? Math.floor(i / 2) : 0, c = narrow ? i % 2 : i;
        const x = pLeft + c * pW + 3, y = py + r * (ph + 8);
        R.prods.push({ x: x + (pW - 6) / 2, y: y + ph, bx: x, by: y });
      });
      G.forEach((g, i) => {
        const r = Math.floor(i / cols), c = i % cols;
        const x = 2 + c * gW, y = gy + r * (gH + 8);
        R.gpus.push({ x: x + gW / 2, y, bx: x + 2, ok: runs(g), g, row: r });
      });
      // without a waist: one translator per (producer, GPU) pair
      if (noWaist) {
        funnel.style.opacity = 0.25;
        R.prods.forEach((P) => R.gpus.forEach((Q) => line(tangle, P.x, P.y, Q.x, Q.y, { stroke: 'rgba(255,91,110,0.32)', sw: 1 })));
      }
      R.prods.forEach((P, i) => {
        const p = PROD[i];
        rect(svg, P.bx, P.by, pW - 6, ph, { fill: FILL.prod, stroke: 'rgba(184,164,255,0.6)', rx: 6 });
        tx(svg, P.x, P.by + 17, p.name, { anchor: 'middle', size: 11.5, weight: 600, fill: 'var(--ink)' });
        tx(svg, P.x, P.by + 31, p.sub, { anchor: 'middle', size: 9.5, fill: 'var(--ink-3)' });
      });
      tx(svg, cx, pTotal + 22, noWaist ? `${PROD.length} × ${G.length} = ${PROD.length * G.length} translators` : 'producers: programmers and compilers', { anchor: 'middle', size: 9.5, fill: noWaist ? 'var(--danger)' : 'var(--ink-3)', style: 'paint-order:stroke;stroke:var(--bg);stroke-width:3px;' });
      const wg = S('g', { opacity: noWaist ? 0.2 : 1 }, svg);
      rect(wg, cx - waistW / 2, waistY, waistW, waistH, { fill: FILL.waist, stroke: '#ffd88a', sw: 1.4, rx: 8 });
      tx(wg, cx, waistY + 18, 'PTX', { anchor: 'middle', size: 14, weight: 700, fill: '#ffd88a' });
      tx(wg, cx, waistY + 33, tName(), { anchor: 'middle', size: 10.5, fill: 'var(--ink)' });
      tx(wg, cx + waistW / 2 + 10, waistY + 24, narrow ? '' : 'one virtual ISA', { size: 10, fill: 'var(--ink-3)' });
      rect(wg, cx - 90, jitY, 180, 26, { fill: FILL.jit, stroke: 'rgba(255,198,92,0.6)', rx: 6 });
      tx(wg, cx, jitY + 17, 'driver JIT → SASS', { anchor: 'middle', size: 10.5, fill: 'var(--control)' });
      R.waist = { x: cx, y: waistY + waistH / 2 };
      R.jit = { x: cx, y: jitY + 26 };
      R.gridTop = gy - 4;
      R.gpus.forEach((Q) => {
        const g = Q.g, ok = Q.ok, fut = g.v === 999;
        // without a waist the boxes are neutral: the question is cost (red), not whether it runs
        Q.box = rect(svg, Q.bx, Q.y, gW - 4, gH, { fill: noWaist ? FILL.neutral : ok ? FILL.ok : FILL.no, stroke: noWaist ? 'var(--line-2)' : ok ? 'var(--core)' : 'rgba(255,91,110,0.5)', dash: fut ? '4 3' : null, rx: 6 });
        tx(svg, Q.x, Q.y + 16, fut ? 'CC ?' : 'CC ' + g.cc, { anchor: 'middle', size: 11, weight: 600, fill: 'var(--ink)' });
        tx(svg, Q.x, Q.y + 30, g.ex, { anchor: 'middle', size: gW < 100 ? 8.5 : 9.5, fill: 'var(--ink-2)' });
        const lab = noWaist ? (fut ? 'needs 4 new ones' : '4 translators') : Q.ok ? (fut ? 'runs, via JIT' : 'JIT → sm_' + g.v + (archA ? 'a' : '')) : g.v < target ? 'too old' : 'not ' + ccName(target);
        tx(svg, Q.x, Q.y + 49, lab, { anchor: 'middle', size: gW < 100 ? 8.5 : 9.5, weight: 600, fill: noWaist ? 'var(--danger)' : Q.ok ? 'var(--core)' : 'var(--danger)' });
      });
      if (!noWaist) for (let i = 0; i < 14; i++) R.packets.push({ c: S('circle', { r: 3.4, cx: -10, cy: -10, style: 'fill:#ffd88a;opacity:0' }, pg), ph: i / 14, p: i % PROD.length, g: i });
      paint(anim ? anim.time : 0);
      stats();
    }
    /* Packets: producer → waist → JIT box, then straight down to the top edge of the GPU grid above
       the target's column, where they fade; the target box lights up instead of being crossed. */
    function paint(t) {
      if (!R) return;
      const ok = R.gpus.filter((g) => g.ok);
      const live = anim && anim.running;
      const glow = new Set();
      R.packets.forEach((k) => {
        if (!live || !ok.length) { k.c.style.opacity = 0; return; }
        const u = ((t * SPEED + k.ph) % 1 + 1) % 1;
        const P = R.prods[k.p];
        let x, y, op = 1;
        if (u < 0.45) { const v = u / 0.45; x = P.x + (R.waist.x - P.x) * v; y = P.y + (R.waist.y - P.y) * v; }
        else if (u < 0.6) { const v = (u - 0.45) / 0.15; x = R.waist.x; y = R.waist.y + (R.jit.y - R.waist.y) * v; }
        else {
          const g = ok[k.g % ok.length]; const v = (u - 0.6) / 0.4;
          x = R.jit.x + (g.x - R.jit.x) * v; y = R.jit.y + (R.gridTop - R.jit.y) * v;
          if (v > 0.8) { op = (1 - v) / 0.2; glow.add(g); }
        }
        k.c.setAttribute('cx', x.toFixed(1)); k.c.setAttribute('cy', y.toFixed(1));
        k.c.style.fill = u < 0.6 ? '#ffd88a' : 'var(--core)';
        k.c.style.opacity = String(op);
      });
      if (!noWaist) R.gpus.forEach((g) => { if (g.ok && g.box) g.box.style.strokeWidth = glow.has(g) ? 2.6 : 1; });
    }
    const sRun = GG.ui.stat(f.readouts, { label: 'GPUs that can run it', value: '', tone: 'core' });
    const sCnt = GG.ui.stat(f.readouts, { label: 'translators: waist vs none', value: '' });
    function stats() {
      const n = G.filter(runs).length;
      sRun.set(noWaist ? '—' : n + ' / ' + G.length);
      sCnt.set(`${PROD.length} + ${G.length} = ${PROD.length + G.length} vs ${PROD.length} × ${G.length} = ${PROD.length * G.length}`, noWaist ? 'danger' : null);
      const old = G.filter((g) => !runs(g)).map((g) => g.cc);
      if (noWaist) { f.setWhy(`<b>Without a narrow waist</b>, each of the ${PROD.length} producers would need its own translator for each of the ${G.length} GPUs: ${PROD.length} × ${G.length} = <b>${PROD.length * G.length}</b> red lines, and a new GPU would need ${PROD.length} new ones. With PTX in the middle it is ${PROD.length} + ${G.length} = <b>${PROD.length + G.length}</b>: each producer emits PTX once, and each GPU’s driver translates PTX once.`); return; }
      if (archA) { f.setWhy(`<b>compute_${target}a</b> is <em>architecture-specific</em> PTX. It may use features such as <code>wgmma</code> that only compute capability ${ccName(target)} is promised to have, so it is not forward-compatible: only the ${ccName(target)} machine (green) can JIT-compile and run it, and newer GPUs, including the future one, cannot. The forward-compatible narrow waist is plain PTX.`); return; }
      f.setWhy(`PTX built for <b>compute_${target}</b> needs compute capability <b>${ccName(target)}</b> or higher. The driver on each of the ${n} green machines, including one for a GPU that does not exist yet, compiles it into SASS for its own SM architecture. ${old.length ? `The ${old.length} older GPU${old.length === 1 ? '' : 's'} (CC ${old.join(', ')}) lack${old.length === 1 ? 's' : ''} features the code may use.` : 'Every GPU here can run it.'} With the waist, ${PROD.length} producers and ${G.length} GPUs need ${PROD.length + G.length} translators, not ${PROD.length * G.length}.${target === 70 ? ' (To build for compute_70 today you need CUDA 12.x or older: CUDA 13 can no longer target Volta.)' : ''}`);
    }
    let anim = null;
    const replay = () => { if (GG.reducedMotion || noWaist) { paint(0); return; } anim.reset(); anim.start(); play.sync(); };
    const tSeg = GG.ui.seg(f.controls, { label: 'PTX target', value: '80', options: ['70', '75', '80', '86', '89', '90', '90a', '100', '120'].map((v) => ({ value: v, label: 'compute_' + v, title: v === '90a' ? 'architecture-specific: Hopper only' : null })), onChange: (v) => { target = parseInt(v, 10); archA = /a$/.test(v); draw(); replay(); } });
    tSeg.el.classList.add('dsa-seg-dis');
    let play = null;
    const syncNoWaist = () => {
      tSeg.el.querySelectorAll('button').forEach((b) => { b.disabled = noWaist; });
      tSeg.el.style.opacity = noWaist ? 0.5 : '';
      if (play) { play.disabled = noWaist; play.style.opacity = noWaist ? 0.4 : ''; }
    };
    GG.ui.toggle(f.controls, { label: 'Without PTX', value: false, onChange: (v) => { noWaist = v; if (v) { anim.stop(); play.sync(); } syncNoWaist(); draw(); replay(); } });
    anim = GG.anim(f.stage, (t) => {
      paint(t);
      if (t * SPEED > CYCLES) { anim.stop(); paint(t); play.sync(); }
    }, { autostart: false });
    play = GG.ui.playButton(f.controls, anim, { onToggle: (on) => { if (on && (anim.time * SPEED > CYCLES || noWaist)) { if (noWaist) { anim.stop(); play.sync(); return; } anim.reset(); } paint(anim.time); } });
    syncNoWaist();
    onWidth(wrap, (w) => { W = w; draw(); });
    if (!GG.reducedMotion) GG.onVisible(f.stage, () => replay(), { once: true });
  }

  /* Fig: .reg .f32 %f<N>; registers per thread, per warp, and how many warps fit in one SM's register file */
  function regFigure(host, ctx) {
    const f = ctx.figure(host, {
      title: '.reg .f32 %f<N>;: from one thread to the register file', hint: 'drag N', wide: true,
      caption: 'Top: the registers one thread declares. Middle: the same registers for all 32 threads of a warp. Bottom: an H100 SM’s 65,536 32-bit registers (four sub-partitions of 16,384), drawn as 256 allocation units of 256 registers, one or two rows per sub-partition; blocks of colour are warps, and each warp’s registers stay in one sub-partition. This assumes each PTX register becomes one physical register. In reality <code>ptxas</code> decides the count (see the note below), and the hardware hands registers to a warp in whole units of 256 (compute capability 9.0, as in NVIDIA’s occupancy calculator). Up to 64 warps can be resident on the SM whatever their registers. “Warps that fit” assumes these <code>.f32</code> registers are the kernel’s only ones: a real kernel also declares integer and 64-bit registers (<code>%r</code>, <code>%rd</code>), which come out of the same budget. Bar heights in the middle row grow with log₂ N.',
    });
    let N = 7, W = 0;
    const UNIT = 256, FILE = 65536, MAXW = 64, UNITS = FILE / UNIT; // 256 units
    const wrap = el('div', { class: 'dsa-w' });
    f.stage.append(wrap);
    const sT = GG.ui.stat(f.readouts, { label: 'declared per thread', value: '', tone: 'memory' });
    const sW = GG.ui.stat(f.readouts, { label: 'declared per warp', value: '', tone: 'memory' });
    const sA = GG.ui.stat(f.readouts, { label: 'allocated per warp', value: '', tone: 'memory' });
    const sF = GG.ui.stat(f.readouts, { label: 'warps that fit (f32 only)', title: 'if these .f32 registers were all the kernel declared', value: '' });
    function draw() {
      wrap.innerHTML = '';
      const narrow = W < 560;
      const perWarp = N * 32, units = Math.ceil(perWarp / UNIT), alloc = units * UNIT;
      // a warp's registers live in one of the four sub-partitions' files (64 units each)
      const byRegs = 4 * Math.floor(UNITS / 4 / units), fit = Math.min(MAXW, byRegs);
      // ── one thread
      const chips = Math.min(N, 16);
      const perRow = narrow ? 8 : 16;
      const cw = N <= 16 ? Math.min(64, (W - 4) / Math.min(chips, perRow)) : 0;
      const cRows = N <= 16 ? Math.ceil(chips / perRow) : 1;
      const th = 34, ty = 22;
      const topH = N <= 16 ? cRows * (th + 6) : 30;
      // ── one warp
      const wy = ty + topH + (narrow ? 44 : 32);
      const lcols = narrow ? 16 : 32, lrows = 32 / lcols;
      // bar height grows with log2 N, so the warp row keeps changing all the way to 255
      const lw = (W - 60) / lcols, colH = Math.round((narrow ? 6 : 8) + (narrow ? 3.6 : 6.5) * Math.log2(N));
      const warpH = lrows * (colH + 14);
      // ── the register file
      const fy = wy + warpH + 34;
      const ucols = narrow ? 32 : 64, urows = UNITS / ucols; // 8 or 4 rows
      const fw = W - 4, uw = fw / ucols, uh = narrow ? 12 : 14;
      const H = fy + urows * (uh + 2) + 3 * 4 + (narrow ? 34 : 20);
      const s = svgRoot(wrap, W, H, `${N} registers per thread, ${perWarp} per warp, allocated as ${alloc}; ${fit} warps fit in one SM's register file`);
      tx(s, 0, 12, N === 1 ? 'one thread: %f<1> declares %f0' : `one thread: %f<${N}> declares %f0 … %f${N - 1}, 32 bits each`, { size: 10.5, fill: 'var(--ink-2)' });
      if (N <= 16) {
        const rowW = cw * Math.min(chips, perRow), x0 = (W - rowW) / 2;
        for (let i = 0; i < N; i++) {
          const r = Math.floor(i / perRow), c = i % perRow;
          const x = x0 + c * cw, y = ty + r * (th + 6);
          rect(s, x + 2, y, cw - 4, th, { fill: 'rgba(111,166,255,0.2)', stroke: 'var(--memory)', rx: 4 });
          tx(s, x + cw / 2, y + (cw >= 40 ? 15 : 21), '%f' + i, { anchor: 'middle', size: cw < 40 ? 10 : 11, weight: 600, fill: '#fff' });
          if (cw >= 40) tx(s, x + cw / 2, y + 28, '32 bit', { anchor: 'middle', size: 10, fill: 'var(--ink-3)' });
        }
      } else {
        const bw = W - 4;
        rect(s, 2, ty, bw, 22, { fill: 'rgba(111,166,255,0.2)', stroke: 'var(--memory)', rx: 4 });
        for (let i = 1; i < N; i++) { const x = 2 + (bw * i) / N; line(s, x, ty + 2, x, ty + 20, { stroke: 'rgba(111,166,255,0.45)', sw: Math.min(1, bw / N / 2) }); }
        tx(s, W / 2, ty + 15, `${N} registers`, { anchor: 'middle', size: 11, weight: 600, fill: '#fff', style: 'paint-order:stroke;stroke:#16203a;stroke-width:4px;' });
      }
      // warp
      const wl = narrow ? [`one warp: 32 threads × ${N} = ${fmt.int(perWarp)} registers,`, `rounded up to ${units} unit${units === 1 ? '' : 's'} of 256 = ${fmt.int(alloc)}`] : [`one warp: 32 threads × ${N} = ${fmt.int(perWarp)} registers, rounded up to ${units} unit${units === 1 ? '' : 's'} of 256 = ${fmt.int(alloc)}`];
      wl.forEach((t, k) => tx(s, 0, wy - 14 + (k - wl.length + 1) * 13, t, { size: 10.5, fill: 'var(--ink-2)' }));
      for (let r = 0; r < lrows; r++) {
        const y = wy + r * (colH + 14);
        for (let c = 0; c < lcols; c++) {
          const lane = r * lcols + c, x = 56 + c * lw;
          rect(s, x + 1, y, lw - 2, colH, { fill: 'rgba(111,166,255,0.45)', rx: 1 });
          if (c % 4 === 0) tx(s, x + lw / 2, y + colH + 11, String(lane), { anchor: 'middle', size: 10, fill: 'var(--ink-3)' });
        }
        tx(s, 50, y + colH / 2 + 3, lrows === 2 ? (r ? '16–31' : '0–15') : 'lanes', { anchor: 'end', size: 10, fill: 'var(--ink-3)' });
      }
      // register file
      tx(s, 0, fy - 10, narrow ? `SM register file: room for ${fit} such warp${fit === 1 ? '' : 's'}` : `one SM’s register file, 65,536 registers in 256 units: room for ${fit} warp${fit === 1 ? '' : 's'} with ${N} register${N === 1 ? '' : 's'} per thread`, { size: 10.5, fill: 'var(--ink-2)' });
      // warps are spread over the four sub-partitions (rows of the drawing are grouped by sub-partition)
      const perSub = UNITS / 4, rowsPerSub = urows / 4;
      const owner = new Array(UNITS).fill(-1);
      const subNext = [0, 0, 0, 0];
      for (let w = 0; w < fit; w++) {
        const sp = w % 4;
        if (subNext[sp] + units > perSub) continue;
        for (let u = 0; u < units; u++) owner[sp * perSub + subNext[sp] + u] = w;
        subNext[sp] += units;
      }
      for (let u = 0; u < UNITS; u++) {
        const r = Math.floor(u / ucols), c = u % ucols;
        const sub = Math.floor(r / rowsPerSub);
        const x = 2 + c * uw, y = fy + r * (uh + 2) + sub * 4;
        const w = owner[u];
        const mine = w === 0, used = w >= 0;
        rect(s, x + 0.5, y, uw - 1, uh, { fill: mine ? 'var(--memory)' : used ? (w % 2 ? 'rgba(111,166,255,0.32)' : 'rgba(111,166,255,0.22)') : 'rgba(255,255,255,0.03)', stroke: mine ? '#fff' : used ? 'rgba(111,166,255,0.5)' : 'var(--line)', sw: mine ? 0.8 : 0.5, rx: 1.5 });
      }
      const ly = fy + urows * (uh + 2) + 12 + 12;
      const free = UNITS - fit * units;
      const legend = [['var(--memory)', 'this warp'], ['rgba(111,166,255,0.3)', 'other warps'], ['rgba(255,255,255,0.06)', `free (${free} unit${free === 1 ? '' : 's'})`]];
      let lx = 2;
      legend.forEach(([c, t]) => { rect(s, lx, ly - 8, 10, 10, { fill: c, stroke: 'var(--line-2)', rx: 2 }); tx(s, lx + 14, ly + 1, t, { size: 9.5, fill: 'var(--ink-3)' }); lx += 22 + t.length * 5.8; });
      if (narrow) tx(s, 2, ly + 16, byRegs > MAXW ? `the cap of ${MAXW} resident warps binds first` : byRegs === MAXW ? `registers and the ${MAXW}-warp cap run out together` : `registers run out below the ${MAXW}-warp cap`, { size: 10, fill: 'var(--ink-3)' });
      sT.set(String(N)); sW.set(fmt.int(perWarp)); sA.set(fmt.int(alloc) + ' (' + fmt.bytes(alloc * 4, 1) + ')');
      sF.set(fit + ' / ' + MAXW, fit < MAXW ? null : 'core');
      f.setWhy(`<code>%f&lt;${N}&gt;</code> declares <b>${N}</b> register${N === 1 ? '' : 's'}${N > 1 ? ` named <code>%f0</code> to <code>%f${N - 1}</code>` : ''}, each holding one 32-bit float (<code>.f32</code>). Every thread gets its own set, so a warp needs <b>${fmt.int(perWarp)}</b>${alloc !== perWarp ? `, which the SM rounds up to <b>${fmt.int(alloc)}</b> (${units} × 256)` : ` (exactly ${units} unit${units === 1 ? '' : 's'} of 256)`}, ${fmt.bytes(alloc * 4, 1)} of its register file. ` +
        (byRegs > MAXW ? `Registers would leave room for ${byRegs} such warps, but an SM holds at most ${MAXW}, so here the warp limit binds, not the register file.` : byRegs === MAXW ? `Exactly <b>${MAXW}</b> such warps fit (${MAXW / 4} per sub-partition): the register file and the ${MAXW}-warp cap run out at the same time. ${units * 8 > N ? `Up to ${units * 8} registers per thread would still keep all ${MAXW}.` : `One more register per thread would cost warps: ${N + 1} per thread leaves room for ${4 * Math.floor(UNITS / 4 / Math.ceil((N + 1) * 32 / UNIT))}.`}` : `Only <b>${fit}</b> such warps fit in the 65,536 registers (${fit / 4} in each sub-partition’s 16,384), fewer than the ${MAXW} the SM could otherwise hold: more registers per thread, fewer warps at once.`) + ' (If these were all the kernel’s registers.)' +
        (N === 7 ? ' N = 7 is the glossary’s example.' : '') + (N === 255 ? ' 255 is the most registers one thread can have.' : ''));
    }
    const slider = GG.ui.slider(f.controls, { label: 'N in %f<N>', min: 1, max: 255, value: N, log: true, step: 1, format: (v) => (v === 7 ? '7 (glossary)' : String(v)), onInput: (v) => { N = clamp(Math.round(v), 1, 255); draw(); } });
    [7, 32, 40, 128, 255].forEach((v) => GG.ui.button(f.controls, { label: 'N = ' + v, onClick: () => { N = v; slider.set(v); draw(); } }));
    onWidth(wrap, (w) => { W = w; draw(); });
  }

  /* Fig: IEEE 754 single-precision decoder for 0f3FC00000 */
  function floatDecoder(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Decode 0f3FC00000: IEEE 754 single precision', hint: 'edit the hex · toggle bits · type a number', wide: true,
      caption: 'A PTX float literal <code>0fXXXXXXXX</code> is the 32-bit pattern of an IEEE 754 single-precision number, written as eight hex digits (<code>0d</code> plus sixteen digits is the 64-bit equivalent). Pink: sign. Amber: 8-bit exponent, stored with a bias of 127. Blue: 23-bit fraction, with an implicit leading 1 for normal numbers.',
    });
    let bits = 0x3FC00000 >>> 0;
    const dv = new DataView(new ArrayBuffer(4));
    const box = el('div');
    f.stage.append(box);
    const row = el('div', { class: 'dsa-hexrow' });
    const hexIn = el('input', { class: 'dsa-in', type: 'text', value: '3FC00000', maxlength: '8', spellcheck: 'false', autocomplete: 'off', 'aria-label': 'Hex bit pattern, 8 digits' });
    const decIn = el('input', { class: 'dsa-in dec', type: 'text', value: '1.5', spellcheck: 'false', autocomplete: 'off', 'aria-label': 'Decimal value to encode', inputmode: 'decimal' });
    const l1 = el('label', {}, 'PTX literal', el('span', { class: 'pre', text: '0f' }), hexIn);
    const l2 = el('label', {}, 'or a number', decIn);
    row.append(l1, l2);
    const bitRow = el('div', { class: 'dsa-bitsrow', role: 'group', 'aria-label': '32 bits: 1 sign bit, 8 exponent bits, 23 fraction bits' });
    const bitBtns = [];
    for (let i = 31; i >= 0; i--) {
      const k = i === 31 ? 's' : i >= 23 ? 'e' : 'm';
      const d = 31 - i; // position from the left
      const b = el('button', { type: 'button', class: 'dsa-bit ' + k, title: `bit ${i} (${k === 's' ? 'sign' : k === 'e' ? 'exponent' : 'fraction'})`, 'aria-label': `bit ${i}, ${k === 's' ? 'sign' : k === 'e' ? 'exponent' : 'fraction'}`, style: `--c:${d + 1};--cn:${(d % 16) + 1};--rn:${d < 16 ? 1 : 3}` });
      b.addEventListener('click', () => { bits = (bits ^ (1 << i)) >>> 0; sync('bits'); });
      bitRow.append(b);
      bitBtns[i] = b;
    }
    bitRow.insertAdjacentHTML('beforeend', '<span class="dsa-bl s" aria-hidden="true">sign</span><span class="dsa-bl e" aria-hidden="true">exponent · 8 bits</span><span class="dsa-bl m1" aria-hidden="true">fraction · 23 bits</span><span class="dsa-bl m2" aria-hidden="true">fraction, continued</span>');
    const formula = el('div', { class: 'dsa-formula' });
    const exact = el('div', { class: 'dsa-exact' });
    box.append(row, bitRow, formula, exact);
    const sS = GG.ui.stat(f.readouts, { label: 'sign', value: '', tone: 'special' });
    const sE = GG.ui.stat(f.readouts, { label: 'exponent', value: '', tone: 'control' });
    const sM = GG.ui.stat(f.readouts, { label: 'significand', value: '', tone: 'memory' });
    const sV = GG.ui.stat(f.readouts, { label: 'value', value: '' });
    function exactDecimal(m, k) { // exact decimal string of m × 2^k (m ≥ 0 integer)
      let n = BigInt(m);
      if (k >= 0) return (n << BigInt(k)).toString();
      const d = -k;
      const str = (n * (5n ** BigInt(d))).toString().padStart(d + 1, '0');
      let out = str.slice(0, str.length - d) + '.' + str.slice(str.length - d);
      out = out.replace(/0+$/, '').replace(/\.$/, '');
      return out;
    }
    const fv = (v) => (v !== 0 && (Math.abs(v) < 1e-4 || Math.abs(v) >= 1e9) ? v.toExponential(6).replace(/\.?0+e/, 'e') : fmt.sig(v, 9));
    const hex8 = (b) => b.toString(16).toUpperCase().padStart(8, '0');
    function sync(from) {
      dv.setUint32(0, bits);
      const v = dv.getFloat32(0);
      const s = bits >>> 31, e = (bits >>> 23) & 0xff, m = bits & 0x7fffff;
      bitBtns.forEach((b, i) => { const on = (bits >>> i) & 1; b.classList.toggle('on', !!on); b.textContent = String(on); b.setAttribute('aria-pressed', String(!!on)); });
      if (from !== 'hex') { hexIn.value = hex8(bits); hexIn.classList.remove('bad'); }
      if (from !== 'dec') { decIn.value = Number.isNaN(v) ? 'NaN' : !isFinite(v) ? (v > 0 ? 'Infinity' : '-Infinity') : Object.is(v, -0) ? '-0' : String(Number(v.toPrecision(9))); decIn.classList.remove('bad'); }
      const sgn = s ? '−' : '+';
      // the exact significand (at most 23 decimals), cut after 9 decimals with an ellipsis, never rounded,
      // so 0.1's 1.60000002384… does not pass for an exact 1.6, and a normal significand never reads as 2
      let sigStr = exactDecimal(e === 0 ? m : m + 8388608, -23);
      if (!sigStr.includes('.')) sigStr += '.0';
      const [ip, fp] = sigStr.split('.');
      sigStr = fp.length > 9 ? ip + '.' + fp.slice(0, 9) + '…' : sigStr;
      let kind, html, ex = '';
      if (e === 255) {
        kind = m ? 'NaN' : 'infinity';
        html = `<span class="e">exponent all ones</span> <span class="dim">→</span> ${m ? '<span class="m">fraction ≠ 0</span> <span class="dim">→</span> NaN, not a number' : `<span class="m">fraction 0</span> <span class="dim">→</span> ${sgn}∞`}`;
      } else if (e === 0) {
        kind = m ? 'subnormal' : 'zero';
        html = `(−1)<sup class="s">${s}</sup> × 2<sup class="e">1 − 127</sup> × <span class="m">(0 + ${fmt.int(m)} / 2<sup>23</sup>)</span> <span class="dim">=</span> ${m ? fv(v) : sgn + '0'}`;
        ex = m ? exactDecimal(m, -149) : '0';
      } else {
        kind = 'normal';
        html = `(−1)<sup class="s">${s}</sup> × 2<sup class="e">${e} − 127</sup> × <span class="m">(1 + ${fmt.int(m)} / 2<sup>23</sup>)</span> <span class="dim">=</span> ${s ? '−' : ''}2<sup class="e">${e - 127}</sup> × <span class="m">${sigStr}</span>`;
        ex = exactDecimal(m + 8388608, e - 150);
      }
      formula.innerHTML = html;
      exact.innerHTML = ex ? `exact value: <b>${s ? '−' : ''}${ex}</b>` : '';
      sS.set(s ? '1 (−)' : '0 (+)');
      sE.set(e === 0 || e === 255 ? `${e} (${kind})` : `${e} → 2^${e - 127}`);
      sM.set(e === 255 ? '—' : (e === 0 ? '0.f = ' : '1.f = ') + sigStr);
      sM.el.title = e === 255 ? '' : `exactly ${e === 0 ? m : m + 8388608} / 2^23`;
      sV.set(Number.isNaN(v) ? 'NaN' : !isFinite(v) ? (v > 0 ? '+∞' : '−∞') : Object.is(v, -0) ? '−0' : fv(v));
      const is15 = bits === 0x3FC00000;
      f.setWhy(is15
        ? '<b>0x3FC00000 is 1.5.</b> Sign 0 (positive). Exponent bits <code>01111111</code> = 127, minus the bias of 127, gives 2<sup>0</sup> = 1. Fraction <code>100…0</code> = 0.5, so the significand is 1 + 0.5 = 1.5. Value: 1 × 1.5 = <b>1.5</b>, the constant the <code>fma</code> adds.'
        : `<b>0x${hex8(bits)}</b> is ${kind === 'normal' ? 'a <b>normal</b> number' : kind === 'subnormal' ? 'a <b>subnormal</b> number' : kind === 'zero' ? `a <b>zero</b> (${s ? '−0' : '+0'})` : kind === 'infinity' ? `an <b>infinity</b> (${s ? '−∞' : '+∞'})` : 'a <b>NaN</b> (not a number)'}${kind === 'normal' || kind === 'subnormal' ? `: <b>${Number(v.toPrecision(9))}</b>` : ''}. ${kind === 'normal' ? `Exponent ${e} − 127 = ${e - 127}, significand 1 + fraction.` : kind === 'subnormal' ? 'With an all-zero exponent the implicit 1 becomes 0, which lets tiny numbers fade gradually to zero.' : kind === 'zero' ? 'All exponent and fraction bits are 0. (The sign bit still distinguishes +0 from −0.)' : kind === 'infinity' ? 'All exponent bits set and a zero fraction encode infinity.' : 'All exponent bits set and a non-zero fraction encode NaN.'}${!is15 ? ' Press “1.5” to go back to the glossary’s constant.' : ''}`);
    }
    hexIn.addEventListener('input', () => {
      const t = hexIn.value.trim().replace(/^0[fFxX]/, '');
      if (/^[0-9a-fA-F]{1,8}$/.test(t)) { bits = parseInt(t, 16) >>> 0; hexIn.classList.remove('bad'); sync('hex'); } else hexIn.classList.add('bad');
    });
    hexIn.addEventListener('blur', () => { hexIn.value = hex8(bits); hexIn.classList.remove('bad'); });
    decIn.addEventListener('input', () => {
      const t = decIn.value.trim().replace(/−/g, '-');
      const v = /^[-+]?(inf|infinity)$/i.test(t) ? (t.startsWith('-') ? -Infinity : Infinity) : /^nan$/i.test(t) ? NaN : t === '' || isNaN(Number(t)) ? null : Number(t);
      if (v === null) { decIn.classList.add('bad'); return; }
      dv.setFloat32(0, v); bits = dv.getUint32(0) >>> 0; decIn.classList.remove('bad'); sync('dec');
    });
    decIn.addEventListener('blur', () => sync('bits'));
    const PRE = [['1.5', 0x3FC00000], ['1.0', 0x3F800000], ['−2.0', 0xC0000000], ['0.1', 0x3DCCCCCD], ['π', 0x40490FDB], ['+∞', 0x7F800000], ['NaN', 0x7FC00000], ['tiniest', 0x00000001]];
    PRE.forEach(([l, b]) => GG.ui.button(f.controls, { label: l, onClick: () => { bits = b >>> 0; sync('bits'); } }));
    sync('bits');
  }

  /* Fig: the four PTX rounding modes */
  function roundingFigure(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Where .rn sends a result that falls between two floats', hint: 'drag the exact result · pick a mode', wide: true,
      caption: 'The two ticks are neighbouring single-precision floats, 1 and 1 + 2<sup>−23</sup> (or their negatives). An exact product-plus-sum usually lands between two such neighbours, and the rounding mode picks one. <code>.rn</code> is the glossary’s IEEE 754 “round even”, the default; the other three PTX modifiers are context we added.',
    });
    const st = { u: 0.3, neg: false, mode: 'rn' };
    let W = 0;
    const wrap = el('div', { class: 'dsa-w' });
    f.stage.append(wrap);
    const MODES = {
      rn: { name: '.rn', full: 'round to nearest, ties to even' },
      rz: { name: '.rz', full: 'round towards zero' },
      rm: { name: '.rm', full: 'round towards −∞' },
      rp: { name: '.rp', full: 'round towards +∞' },
    };
    // result in units of the gap: 0 → |a| = 1 (fraction 0, even), 1 → |b| = 1 + 2^-23 (fraction 1, odd)
    function pickMag(mode) {
      const u = st.u;
      if (u === 0 || u === 1) return u; // the exact result is itself a float: every mode stores it unchanged
      if (mode === 'rn') return u < 0.5 ? 0 : u > 0.5 ? 1 : 0; // tie → even fraction, which is 1.0
      if (mode === 'rz') return 0;
      if (mode === 'rm') return st.neg ? 1 : 0; // towards −∞: more negative magnitude when negative
      return st.neg ? 0 : 1; // rp
    }
    const ULP = Math.pow(2, -23);
    const val = (m) => (st.neg ? -1 : 1) * (1 + m * ULP);
    function draw() {
      wrap.innerHTML = '';
      const narrow = W < 560;
      const H = 196;
      const s = svgRoot(wrap, W, H, 'Number line between two neighbouring floats, with the exact result and the four rounding choices');
      const padX = narrow ? 56 : 90, y = 70;
      const xa = st.neg ? W - padX : padX, xb = st.neg ? padX : W - padX; // magnitude 1 at xa, 1+ulp at xb; negative line flips
      const X = (m) => xa + (xb - xa) * m;
      line(s, 10, y, W - 10, y, { stroke: 'var(--ink-3)', sw: 1.2 });
      head(s, W - 6, y, 1, 0, 'var(--ink-3)', 6);
      tx(s, W - 8, y - 26, st.neg ? 'towards 0 and +∞ →' : 'towards +∞ →', { anchor: 'end', size: 9.5, fill: 'var(--ink-3)' });
      [[0, st.neg ? '−1' : '1', narrow ? 'last bit 0, even' : 'fraction …000 (even)'], [1, st.neg ? '−1.00000011920928955078125' : '1.00000011920928955078125', narrow ? 'last bit 1, odd' : 'fraction …001 (odd)']].forEach(([m, lab, sub]) => {
        const x = X(m);
        line(s, x, y - 14, x, y + 14, { stroke: 'var(--ink)', sw: 2 });
        tx(s, x, y + 30, narrow && m ? (st.neg ? '−(1 + 2⁻²³)' : '1 + 2⁻²³') : lab, { anchor: 'middle', size: 10, fill: 'var(--ink)' });
        tx(s, x, y + 43, sub, { anchor: 'middle', size: 8.5, fill: 'var(--ink-3)' });
      });
      line(s, X(0.5), y - 8, X(0.5), y + 8, { stroke: 'var(--ink-3)', dash: '2 2' });
      tx(s, X(0.5), y + 22, 'halfway', { anchor: 'middle', size: 8.5, fill: 'var(--ink-3)' });
      const xe = X(st.u);
      // the exact result: an ink diamond (data, not UI, so not the accent colour)
      path(s, `M${xe},${y - 7} L${xe + 7},${y} L${xe},${y + 7} L${xe - 7},${y} Z`, { fill: 'var(--ink)', stroke: 'var(--bg)', sw: 2 });
      tx(s, xe, y - 16, st.u === 0 || st.u === 1 ? 'exact, already a float' : 'exact result', { anchor: st.u === 0 ? (st.neg ? 'end' : 'start') : st.u === 1 ? (st.neg ? 'start' : 'end') : 'middle', size: 9.5, fill: 'var(--ink)', weight: 600 });
      // one arrow per mode, stacked below: the picked mode in ink at full weight, the other three ink-3 dashed
      Object.keys(MODES).forEach((k, i) => {
        const m = pickMag(k), xt = X(m), yy = 132 + i * 16;
        const on = k === st.mode, c = on ? 'var(--ink)' : 'var(--ink-3)';
        if (Math.abs(xt - xe) > 2) {
          path(s, `M${xe},${yy} H${xt + (xt > xe ? -6 : 6)}`, { stroke: c, sw: on ? 2.4 : 1.2, dash: on ? null : '4 3' });
          head(s, xt, yy, xt > xe ? 1 : -1, 0, c, on ? 7 : 5);
        } else S('circle', { cx: xt, cy: yy, r: on ? 4 : 3, style: `fill:${c}` }, s);
        tx(s, xt < xe - 2 ? xe + 8 : xe - 8, yy + 3.5, MODES[k].name, { anchor: xt < xe - 2 ? 'start' : 'end', size: on ? 11 : 9.5, weight: on ? 700 : 500, fill: c });
      });
      const m = pickMag(st.mode);
      const exactStr = (st.neg ? '−' : '') + '(1 + ' + fmt.sig(st.u, 3) + ' × 2⁻²³)';
      const exactFloat = st.u === 0 || st.u === 1;
      f.setWhy(`Exact result <b>${exactStr}</b>. <b>${MODES[st.mode].name}</b> (${MODES[st.mode].full}) stores <b>${val(m) < 0 ? '−' : ''}${m ? '1.00000011920928955078125' : '1'}</b>.` + (exactFloat ? ' The exact result is itself representable as a float, so no rounding is needed: every mode stores it as is.' : st.mode === 'rn' && st.u === 0.5 ? ' A tie: exactly halfway, so “round even” picks the neighbour whose last fraction bit is 0.' : st.mode === 'rn' ? ' The nearer neighbour wins; only exact ties look at evenness.' : ''));
    }
    GG.ui.seg(f.controls, { label: 'Mode', value: st.mode, options: Object.keys(MODES).map((k) => ({ value: k, label: MODES[k].name, title: MODES[k].full })), onChange: (v) => { st.mode = v; draw(); } });
    GG.ui.slider(f.controls, { label: 'Exact result (share of the gap)', min: 0, max: 1, step: 0.05, value: st.u, format: (v) => fmt.fixed(v, 2), onInput: (v) => { st.u = Math.round(v * 100) / 100; draw(); } });
    GG.ui.toggle(f.controls, { label: 'Negative result', value: false, onChange: (v) => { st.neg = v; draw(); } });
    onWidth(wrap, (w) => { W = w; draw(); });
  }

  /* Fig: the three mov.u32 lines, which thread am I? */
  function movFigure(host, ctx) {
    const f = ctx.figure(host, {
      title: 'mov.u32 %r1, %ctaid.x; and friends: which thread am I?', hint: canHover ? 'drag the sliders or click a thread' : 'drag the sliders or tap a thread', wide: true,
      caption: 'Six CTAs (rows) of <code>%ntid.x</code> threads each. The selected thread copies its CTA index, the CTA size and its own index into <code>%r1</code>, <code>%r2</code> and <code>%r3</code>. The number in each cell is the global index <code>%r1 × %r2 + %r3</code>, which a following <code>mad.lo.s32</code> instruction typically computes (our addition).',
    });
    const st = { cta: 2, ntid: 8, tid: 5 };
    const NC = 6;
    let W = 0;
    const wrap = el('div', { class: 'dsa-w' });
    f.stage.append(wrap);
    const s1 = GG.ui.stat(f.readouts, { label: '%r1 ← %ctaid.x', value: '', tone: 'memory' });
    const s2 = GG.ui.stat(f.readouts, { label: '%r2 ← %ntid.x', value: '', tone: 'memory' });
    const s3 = GG.ui.stat(f.readouts, { label: '%r3 ← %tid.x', value: '', tone: 'memory' });
    const s4 = GG.ui.stat(f.readouts, { label: 'global index', value: '', tone: 'accent' });
    let tidSl;
    function draw() {
      wrap.innerHTML = '';
      const labW = W < 560 ? 56 : 84;
      // keep cells at least 30 px wide: on phones a CTA of more than 8 threads wraps onto two lines
      const perLine = (W - labW - 4) / st.ntid >= 30 ? st.ntid : Math.ceil(st.ntid / Math.ceil(st.ntid / Math.max(1, Math.floor((W - labW - 4) / 30))));
      const lines = Math.ceil(st.ntid / perLine);
      const cw = Math.min(56, (W - labW - 4) / perLine), rh = lines > 1 ? 26 : 30, lg = 3;
      const ctaH = lines * rh + (lines - 1) * lg;
      const H = 22 + NC * (ctaH + 8) + 4;
      const s = svgRoot(wrap, W, H, `CTA ${st.cta}, thread ${st.tid} of ${st.ntid}: global index ${st.cta * st.ntid + st.tid}`);
      tx(s, labW, 12, '%tid.x →', { size: 10, fill: 'var(--ink-3)' });
      for (let c = 0; c < NC; c++) {
        const y = 22 + c * (ctaH + 8);
        const onRow = c === st.cta;
        tx(s, labW - 8, y + rh / 2 + 4, (W < 560 ? 'cta ' : '%ctaid.x ') + c, { anchor: 'end', size: 10, fill: onRow ? 'var(--ink)' : 'var(--ink-3)', weight: onRow ? 600 : null });
        rect(s, labW - 2, y - 2, cw * perLine + 4, ctaH + 4, { fill: 'none', stroke: onRow ? 'var(--ink-2)' : 'var(--line)', dash: onRow ? null : '4 3', rx: 5 });
        for (let t = 0; t < st.ntid; t++) {
          const on = onRow && t === st.tid;
          const g = S('g', {}, s);
          const lnI = Math.floor(t / perLine), x = labW + (t % perLine) * cw, yy = y + lnI * (rh + lg);
          rect(g, x + 1, yy, cw - 2, rh, { fill: on ? 'var(--accent)' : onRow ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)', stroke: on ? 'var(--accent)' : 'var(--line-2)', rx: 3 });
          tx(g, x + cw / 2, yy + rh / 2 + 4, String(c * st.ntid + t), { anchor: 'middle', size: 10, fill: on ? 'var(--on-accent)' : 'var(--ink-2)', weight: on ? 700 : null });
          hit(g, `CTA ${c}, thread ${t}`, () => { st.cta = c; st.tid = t; ctaSl.set(c); tidSl.set(t); draw(); });
        }
      }
      const i = st.cta * st.ntid + st.tid;
      s1.set(String(st.cta)); s2.set(String(st.ntid)); s3.set(String(st.tid)); s4.set(String(i));
      f.setWhy(`This thread runs the same three instructions as every other thread, but reads different values: <code>%ctaid.x</code> = <b>${st.cta}</b> (its cooperative thread array’s index), <code>%ntid.x</code> = <b>${st.ntid}</b> (threads per CTA, the same for all), <code>%tid.x</code> = <b>${st.tid}</b> (its index within the CTA). Together: element <b>${st.cta} × ${st.ntid} + ${st.tid} = ${i}</b> is the one it works on.`);
    }
    const ctaSl = GG.ui.slider(f.controls, { label: '%ctaid.x', min: 0, max: NC - 1, value: st.cta, onInput: (v) => { st.cta = v; draw(); } });
    /* with a CTA of one thread, %tid.x can only be 0: keep a visible track, disable the slider and say so */
    function syncTid() {
      const one = st.ntid === 1;
      tidSl.input.max = String(Math.max(1, st.ntid - 1));
      tidSl.input.disabled = one;
      tidSl.el.style.opacity = one ? 0.55 : '';
      tidSl.set(st.tid);
    }
    GG.ui.slider(f.controls, { label: '%ntid.x (CTA size)', min: 1, max: 16, value: st.ntid, onInput: (v) => { st.ntid = v; if (st.tid >= v) { st.tid = v - 1; } syncTid(); draw(); } });
    tidSl = GG.ui.slider(f.controls, { label: '%tid.x', min: 0, max: 15, value: st.tid, format: (v) => (st.ntid === 1 ? '0 (the only thread)' : String(v)), onInput: (v) => { st.tid = Math.min(v, st.ntid - 1); draw(); } });
    syncTid();
    onWidth(wrap, (w) => { W = w; draw(); });
  }

  /* Fig: the PTX machine model, one instruction unit for many processors */
  function machineModel(host, ctx) {
    const f = ctx.figure(host, {
      title: 'The PTX machine model', hint: 'step through the program · switch the names', wide: true,
      caption: `Redrawn from the glossary’s figure, modified there from the <a href="${PTX_LINKS.model}">PTX documentation</a>. Each multiprocessor has one instruction unit, M processors with private registers, a shared memory (double arrows: each processor reads and writes it), and read-only constant and texture caches filled from device memory; each processor also reaches device memory directly. Here M = 4 for illustration (the original draws Processor 1, Processor 2, …, Processor M). The nine-instruction program is ours: it uses the glossary’s <code>mov</code> and <code>fma</code> lines, stores each result in shared memory, waits at a barrier, then reads a neighbour’s result. “Hardware names” relabels the parts with what implements them on an NVIDIA GPU (our addition).`,
    });
    const M = 4;
    const PROG = [
      { c: 'mov.u32 %r3, %tid.x;', why: 'Every processor runs <code>mov</code>, but each reads its own thread index: the private registers now differ (0, 1, 2, 3).' },
      { c: 'cvt.rn.f32.u32 %f4, %r3;', why: 'Convert that integer into a 32-bit float, still per processor.' },
      { c: 'mov.f32 %f3, 0f40000000;', why: 'Load the constant 2.0 (bit pattern <code>0x40000000</code>) into <code>%f3</code>: the same value everywhere.' },
      { c: 'fma.rn.f32 %f5, %f4, %f3, 0f3FC00000;', why: 'The glossary’s FMA: <code>%f5 = %f4 × %f3 + 1.5</code>. One instruction, four different results, because the inputs in the private registers differ.' },
      { c: 'shl.b32 %r4, %r3, 2;', why: 'Shift left by 2, i.e. multiply by 4: a byte offset for slot <code>%r3</code> of 4-byte floats.' },
      { c: 'st.shared.f32 [%r4], %f5;', why: 'Each processor writes its result into its own slot of <b>shared memory</b>, which all processors of the multiprocessor can see.' },
      { c: 'bar.sync 0;', why: 'A barrier (the amber line): no thread of the CTA goes on until all of them have arrived, so every store is done. Here the four processors already move in step, because one instruction unit drives them all; in a real CTA of many warps, the warps that arrive early wait at this line. After it, any thread may safely read any other thread’s slot.' },
      { c: 'xor.b32 %r5, %r4, 4;', why: 'Flip bit 2 of the byte offset: the address of the neighbouring slot. Threads 0 and 1 become partners, and so do threads 2 and 3.' },
      { c: 'ld.shared.f32 %f6, [%r5];', why: 'Each processor loads its partner’s result from shared memory into its own <code>%f6</code>. Coordination through shared memory, different results through private registers: exactly the two mechanisms the glossary names.' },
    ];
    const BAR_STEP = 6;
    let pc = -1, W = 0, flash = 0, stepper = null, hw = false;
    const wrap = el('div', { class: 'dsa-w' });
    f.stage.append(wrap);
    const KEYS = ['r3', 'f4', 'f3', 'f5', 'r4', 'r5', 'f6'];
    const val5 = (p) => p * 2 + 1.5;
    function regsAt(p, step) {
      const r = {};
      KEYS.forEach((k) => { r[k] = null; });
      if (step >= 0) r.r3 = p;
      if (step >= 1) r.f4 = p;
      if (step >= 2) r.f3 = 2;
      if (step >= 3) r.f5 = val5(p);
      if (step >= 4) r.r4 = p * 4;
      if (step >= 7) r.r5 = (p ^ 1) * 4;
      if (step >= 8) r.f6 = val5(p ^ 1);
      return r;
    }
    /* PTX names, or the hardware that implements each part (beyond the glossary, except SM and warp) */
    const NM = () => (hw
      ? { mp: (k) => 'SM ' + k, mp1: 'SM 1 · Streaming Multiprocessor', iu: 'Warp scheduler', iuSub: 'H100: one per sub-partition', proc: (p) => 'Lane ' + (p === M - 1 ? 31 : p), procShort: 'Lane', procNum: (p) => String(p === M - 1 ? 31 : p), sh: 'Shared Memory · in the L1 data cache', shShort: 'Shared Mem. · L1', dev: 'GPU RAM · global memory', group: 'one warp: 32 lanes (threads), one instruction at a time' }
      : { mp: (k) => 'Multiprocessor ' + k, mp1: 'Multiprocessor 1', iu: 'Instruction Unit', iuSub: 'one per multiprocessor', proc: (p) => 'Processor ' + (p === M - 1 ? 'M' : p + 1), procShort: 'Processor', procNum: (p) => (p === M - 1 ? 'M' : String(p + 1)), sh: 'Shared Memory', shShort: 'Shared Memory', dev: 'Device Memory', group: '' });
    const PROC_FILL = '#181a24', PROC_FLASH = '#13241d', PROC_BAR = '#241f14', MP_FILL = '#10111a';
    let R = null;
    function draw() {
      wrap.innerHTML = '';
      const narrow = W < 640;
      const N = NM();
      const devX = 0, devY = 0, off = narrow ? 13 : 18;
      const mpX = devX + 12 + off * 2, mpY = devY + 30 + off * 2;
      const mpW = W - mpX - 12;
      /* Wide: shared memory on top, processors in a row with the instruction unit at their right (as in the
         original). Narrow: instruction unit on top, its bus running down a channel at the left edge, then
         shared memory, then the processors, so no store/load line has to pass the instruction unit. */
      const chW = narrow ? 14 : 0; // bus channel at the left (narrow only)
      const areaX = mpX + 12 + chW;
      const iuW = narrow ? mpW - 24 : 170, iuH0 = narrow ? 50 : 0;
      const iuYn = mpY + 28;
      const shY = narrow ? iuYn + iuH0 + 14 : mpY + 34, shH = 34;
      const prY = shY + shH + (narrow ? 30 : 34);
      const pcols = M, prows = 1;
      const prAreaW = narrow ? mpW - 24 - chW : mpW - 24 - iuW - 14;
      const gp = narrow ? 6 : 12, eg = narrow ? 0 : 44; // gap between processors; extra gap for the ellipsis
      const pw = (prAreaW - gp * (pcols - 1) - eg) / pcols, prH = narrow ? 150 : 136;
      const cacheY = prY + prows * (prH + 10) + 18, cH = 26;
      const mpH = cacheY + 2 * (cH + 6) + 10 - mpY;
      const devH = mpY + mpH + 14 - devY;
      const memY = devH + 34, memH = 40;
      const H = memY + memH + 4;
      const s = svgRoot(wrap, W, H, 'PTX machine model: a device of N multiprocessors, each with shared memory, M processors with registers, an instruction unit, constant and texture caches, above device memory');
      rect(s, devX + 0.5, devY + 0.5, W - 1, devH, { fill: 'rgba(255,255,255,0.02)', stroke: 'var(--line-2)', rx: 8 });
      tx(s, devX + 12, devY + 19, hw ? 'GPU (device)' : 'Device', { size: 12, weight: 600, fill: 'var(--ink)' });
      [[N.mp('N'), 2], [N.mp(2), 1]].forEach(([lab, k]) => {
        const y = mpY - off * k;
        rect(s, mpX + off * k, y, mpW - off * k, 40, { fill: 'var(--bg-2)', stroke: 'var(--line-2)', rx: 6 });
        tx(s, mpX + off * k + 10, y + (narrow ? 10 : 13), lab, { size: narrow ? 9 : 10, fill: 'var(--ink-3)' });
      });
      rect(s, mpX, mpY, mpW, mpH, { fill: MP_FILL, stroke: 'var(--ink-3)', rx: 6 });
      tx(s, mpX + 10, mpY + 18, N.mp1, { size: 11.5, weight: 600, fill: 'var(--ink)' });
      // shared memory
      const shX = areaX, shW = prAreaW;
      rect(s, shX, shY, shW, shH, { fill: 'rgba(111,166,255,0.14)', stroke: 'var(--memory)', rx: 5 });
      R = { slots: [], procs: [], bus: [] };
      const slW = Math.min(64, (shW - (narrow ? 112 : 150)) / M);
      tx(s, shX + 8, shY + 21, narrow ? N.shShort : N.sh, { size: narrow ? 9.5 : 10, fill: 'var(--memory)' });
      for (let p = 0; p < M; p++) {
        const x = shX + shW - 8 - (M - p) * slW;
        const r = rect(s, x + 2, shY + 6, slW - 4, shH - 12, { fill: 'rgba(111,166,255,0.08)', stroke: 'rgba(111,166,255,0.45)', rx: 3 });
        const t = tx(s, x + slW / 2, shY + shH / 2 + 4, '·', { anchor: 'middle', size: 10.5, weight: 600, fill: 'var(--ink-3)' });
        R.slots.push({ r, t, cx: x + slW / 2, by: shY + shH - 6 });
      }
      // links between processors and shared-memory slots (store / load), under the other boxes
      R.links = S('g', {}, s);
      // instruction unit
      const iuX = narrow ? mpX + 12 : mpX + mpW - 12 - iuW, iuY = narrow ? iuYn : prY, iuH = narrow ? iuH0 : prH;
      rect(s, iuX, iuY, iuW, iuH, { fill: '#221e16', stroke: 'var(--control)', rx: 6 });
      tx(s, narrow ? iuX + 10 : iuX + iuW / 2, iuY + (narrow ? 17 : 18), N.iu, { anchor: narrow ? 'start' : 'middle', size: 11, weight: 600, fill: 'var(--control)' });
      if (narrow) tx(s, iuX + iuW - 10, iuY + 17, N.iuSub, { anchor: 'end', size: 9, fill: 'var(--ink-3)' });
      R.iu = tx(s, iuX + iuW / 2, iuY + (narrow ? 38 : iuH / 2 + 4), '', { anchor: 'middle', size: narrow ? 10.5 : 9.5, fill: 'var(--ink)' });
      R.iu2 = tx(s, iuX + iuW / 2, iuY + (narrow ? 52 : iuH / 2 + 18), '', { anchor: 'middle', size: 9.5, fill: 'var(--ink)' });
      if (!narrow) tx(s, iuX + iuW / 2, iuY + iuH - 10, N.iuSub, { anchor: 'middle', size: 9, fill: 'var(--ink-3)' });
      // processor positions
      const pos = [];
      for (let p = 0; p < M; p++) {
        const x = areaX + p * (pw + gp) + (!narrow && p === M - 1 ? eg : 0), y = prY;
        pos.push({ x, y, w: pw });
      }
      // the instruction bus: drawn behind the (opaque) processors, so it shows only in the gaps
      const busY = prY + 22 + (prH - 22) / 2 - 5;
      if (narrow) {
        R.bus.push(rect(s, mpX + 12 + 2, iuY + iuH, 8, busY + 10 - iuY - iuH, { fill: 'rgba(255,198,92,0.3)', rx: 2 }));
        R.bus.push(rect(s, mpX + 12 + 2, busY, prAreaW + chW - 2, 10, { fill: 'rgba(255,198,92,0.3)', rx: 2 }));
      } else R.bus.push(rect(s, areaX, busY, iuX - areaX, 10, { fill: 'rgba(255,198,92,0.3)', rx: 2 }));
      if (!narrow) { const ex = pos[M - 2].x + pw + (gp + eg) / 2; [-9, 0, 9].forEach((d) => S('circle', { cx: ex + d, cy: busY + 5, r: 2.4, style: 'fill:var(--ink-2)' }, s)); }
      // a warp bracket over the processors (hardware names)
      if (N.group && !narrow) tx(s, shX + shW, mpY + 18, 'the lanes below: ' + N.group, { anchor: 'end', size: 9.5, fill: 'var(--ink-2)' });
      // processors
      pos.forEach((P, p) => {
        const { x, y, w } = P;
        rect(s, x, y, w, 22, { fill: '#17213a', stroke: 'var(--memory)', rx: 4 });
        tx(s, x + (narrow ? 5 : 8), y + 15, 'Registers', { size: narrow ? 9 : 9.5, fill: 'var(--memory)' });
        const box = rect(s, x, y + 22, w, prH - 22, { fill: PROC_FILL, stroke: 'var(--ink-3)', rx: 4 });
        if (narrow) { tx(s, x + 5, y + 37, N.procShort, { size: 9, fill: 'var(--ink-2)' }); tx(s, x + 5, y + 51, N.procNum(p), { size: 11, weight: 600, fill: 'var(--ink)' }); }
        else tx(s, x + 8, y + 40, N.proc(p), { size: 10.5, weight: 600, fill: 'var(--ink)' });
        const rv = KEYS.map((k, j) => (narrow
          ? tx(s, x + 5, y + 66 + j * 12.5, '', { size: 9.5, fill: 'var(--ink-2)' })
          : tx(s, x + 8 + (j < 4 ? 0 : w / 2), y + 60 + (j % 4) * 16, '', { size: 9.5, fill: 'var(--ink-2)' })));
        R.procs.push({ box, rv, x, y, w, top: y });
        // shared memory <-> processor: a double arrow, as in the original
        {
          const lx = x + w * 0.85;
          line(s, lx, shY + shH + 7, lx, y - 7, { stroke: 'var(--ink-3)', sw: 1 });
          head(s, lx, shY + shH + 2, 0, -1, 'var(--ink-3)', 5);
          head(s, lx, y - 2, 0, 1, 'var(--ink-3)', 5);
        }
        // to device memory (both ways) and up from the two read-only caches
        const ax = x + w * 0.25;
        line(s, ax, y + prH + 6, ax, memY - 6, { stroke: 'var(--ink-3)', sw: 1 });
        head(s, ax, memY - 2, 0, 1, 'var(--ink-3)', 5);
        head(s, ax, y + prH + 1, 0, -1, 'var(--ink-3)', 5);
        line(s, ax + 10, cacheY + cH + 8, ax + 10, y + prH + 6, { stroke: 'var(--ink-3)', sw: 1 });
        head(s, ax + 10, y + prH + 2, 0, -1, 'var(--ink-3)', 5);
        line(s, ax + 20, cacheY + 2, ax + 20, y + prH + 6, { stroke: 'var(--ink-3)', sw: 1 });
        head(s, ax + 20, y + prH + 2, 0, -1, 'var(--ink-3)', 5);
      });
      // the barrier, shown on the bar.sync step
      R.bar = S('g', { opacity: 0 }, s);
      const bx0 = pos[0].x - 4, bx1 = pos[M - 1].x + pw + 4, by = prY + prH + 2;
      rect(R.bar, bx0, by - 2, bx1 - bx0, 4, { fill: 'var(--control)', rx: 2 });
      tx(R.bar, bx0 + 4, by + 13, narrow ? 'bar.sync 0: all arrived' : 'bar.sync 0: every thread has arrived; all go on together', { size: 9.5, weight: 600, fill: 'var(--control)', style: 'paint-order:stroke;stroke:' + MP_FILL + ';stroke-width:4px;' });
      R.lk = R.procs.map(() => { const l = line(R.links, 0, 0, 0, 0, { stroke: 'var(--memory)', sw: 1.6 }); l.style.opacity = 0; return l; });
      R.lkHead = S('g', {}, s);
      const cX = areaX - chW, cW = mpW - 24;
      const halo = 'paint-order:stroke;stroke:#141826;stroke-width:5px;stroke-linejoin:round;';
      rect(s, cX, cacheY, cW, cH, { fill: 'rgba(111,166,255,0.1)', stroke: 'rgba(111,166,255,0.6)', rx: 4 });
      tx(s, cX + cW - 8, cacheY + 17, 'Constant Cache · read-only', { anchor: 'end', size: 10, fill: 'var(--memory)', style: halo });
      rect(s, cX, cacheY + cH + 6, cW, cH, { fill: 'rgba(111,166,255,0.1)', stroke: 'rgba(111,166,255,0.6)', rx: 4 });
      tx(s, cX + cW - 8, cacheY + cH + 23, 'Texture Cache · read-only', { anchor: 'end', size: 10, fill: 'var(--memory)', style: halo });
      // device memory fills both caches: one arrow to each, as in the original
      // (phones: in the free strip at the left, clear of the processors' own arrows)
      const fx = narrow ? cX + 11 : cX + cW - 30, fx2 = narrow ? cX + 4 : fx - 12;
      line(s, fx, memY - 4, fx, cacheY + 2 * cH + 10, { stroke: 'var(--ink-3)', sw: 1 });
      head(s, fx, cacheY + 2 * cH + 7, 0, -1, 'var(--ink-3)', 5);
      line(s, fx2, memY - 4, fx2, cacheY + cH + 4, { stroke: 'var(--ink-3)', sw: 1 });
      head(s, fx2, cacheY + cH + 1, 0, -1, 'var(--ink-3)', 5);
      rect(s, 0.5, memY, W - 1, memH, { fill: 'rgba(111,166,255,0.16)', stroke: 'var(--memory)', rx: 6 });
      tx(s, 12, memY + 24, N.dev, { size: 11.5, weight: 600, fill: 'var(--memory)' });
      paint();
    }
    const nice = (v) => (v == null ? '·' : String(v));
    function paint() {
      if (!R) return;
      const ins = pc >= 0 ? PROG[pc].c : 'idle';
      const narrow = W < 640;
      if (!narrow && ins.length > 22) { const cut = ins.indexOf(' '); R.iu.textContent = ins.slice(0, cut); R.iu2.textContent = ins.slice(cut + 1); }
      else { R.iu.textContent = ins; R.iu2.textContent = ''; }
      R.iu.style.fill = pc >= 0 ? '#fff' : 'var(--ink-3)';
      const on = pc >= 0 && flash > 0;
      const atBar = pc === BAR_STEP;
      R.procs.forEach((P, p) => {
        const v = regsAt(p, pc);
        P.rv.forEach((t, j) => {
          const k = KEYS[j];
          t.textContent = '%' + k + ' ' + nice(v[k]);
          t.style.fill = v[k] == null ? 'var(--ink-3)' : 'var(--ink)';
        });
        P.box.style.stroke = atBar ? 'var(--control)' : on ? 'var(--core)' : 'var(--ink-3)';
        P.box.style.fill = atBar ? PROC_BAR : on ? PROC_FLASH : PROC_FILL;
      });
      R.bar.setAttribute('opacity', atBar ? 1 : 0);
      R.bus.forEach((b) => { b.style.fill = on ? 'rgba(255,198,92,0.85)' : 'rgba(255,198,92,0.28)'; });
      R.slots.forEach((sl, p) => {
        const filled = pc >= 5;
        sl.r.style.fill = filled ? 'rgba(111,166,255,0.42)' : 'rgba(111,166,255,0.08)';
        sl.t.textContent = filled ? String(val5(p)) : '·';
        sl.t.style.fill = filled ? '#fff' : 'var(--ink-3)';
      });
      // store: processor p → its own slot; load: partner's slot → processor p
      R.lkHead.innerHTML = '';
      R.procs.forEach((P, p) => {
        const ln = R.lk[p];
        const mode = pc === 5 ? 'st' : pc === 8 ? 'ld' : null;
        if (!mode) { ln.style.opacity = 0; return; }
        const sl = R.slots[mode === 'st' ? p : p ^ 1];
        const px = P.x + P.w * 0.6, py = P.top;
        ln.setAttribute('x1', sl.cx.toFixed(1)); ln.setAttribute('y1', sl.by.toFixed(1));
        ln.setAttribute('x2', px.toFixed(1)); ln.setAttribute('y2', py.toFixed(1));
        ln.style.opacity = 0.9;
        const [hx, hy, dx, dy] = mode === 'st' ? [sl.cx, sl.by, sl.cx - px, sl.by - py] : [px, py, px - sl.cx, py - sl.by];
        head(R.lkHead, hx, hy, dx, dy, 'var(--memory)', 6);
        if (mode === 'st') S('circle', { cx: px, cy: py, r: 2.6, style: 'fill:var(--memory)' }, R.lkHead);
        else S('circle', { cx: sl.cx, cy: sl.by, r: 2.6, style: 'fill:var(--memory)' }, R.lkHead);
      });
      const names = hw ? ' <span class="dsa-k">hardware names:</span> the multiprocessor is a Streaming Multiprocessor, the instruction unit a warp scheduler, and the processors driven by one instruction are the lanes of a warp.' : '';
      if (pc < 0) f.setWhy('One <b>instruction unit</b> (amber) feeds every processor of the multiprocessor. Step through a tiny program to see the same instruction produce different results in each processor’s private registers.' + names);
      else f.setWhy(`<b>Instruction ${pc + 1} of ${PROG.length}:</b> <code>${esc(PROG[pc].c)}</code> is sent to all ${M} processors at once. ${PROG[pc].why}` + names);
      if (stepper) { const o = stepper.el.querySelector('output'); if (o) o.textContent = pc < 0 ? 'start' : `instruction ${pc + 1} / ${PROG.length}`; }
    }
    const flashAnim = GG.anim(f.stage, (t) => { flash = t < 0.7 ? 1 : 0; paint(); if (t > 0.75) flashAnim.stop(); }, { autostart: false });
    stepper = GG.ui.stepper(f.controls, { label: 'Instruction', steps: [{ label: 'start' }].concat(PROG.map((p) => ({ label: p.c }))), autoplay: 1400, onStep: (i) => { pc = i - 1; flash = pc >= 0 ? 1 : 0; paint(); if (pc >= 0 && !GG.reducedMotion) { flashAnim.reset(); flashAnim.start(); } } });
    GG.ui.seg(f.controls, { label: 'Names', value: 'ptx', options: [{ value: 'ptx', label: 'PTX model' }, { value: 'hw', label: 'Hardware names' }], onChange: (v) => { hw = v === 'hw'; draw(); } });
    onWidth(wrap, (w) => { W = w; draw(); });
  }

  GG.entry('parallel-thread-execution', {
    render(body, ctx) {
      const s = ctx.html(body, `
<p>An <em>intermediate representation</em> (IR) is a language that compilers translate into, and out of, on the way from source code to machine code: lower-level than C++, but not yet tied to one chip. PTX is one of the formats output by <code>nvcc</code>, the ${T('nvcc', 'NVIDIA CUDA Compiler Driver')}. It is pronounced “pee-tecks” by many NVIDIA engineers and “pee-tee-ecks” by everyone else.</p>
<div class="dsa-say" aria-hidden="true"><b class="dsa-k">Pronounced</b><span>“pee-tecks”<small>many NVIDIA engineers</small></span><span>“pee-tee-ecks”<small>everyone else</small></span></div>
<h3>A virtual machine, and an instruction set</h3>
<p>NVIDIA documentation refers to PTX as both a “virtual machine” and an “instruction set architecture”. An <em>instruction set architecture</em> (ISA) is the contract between software and a processor: the instructions, registers and memory model a program may rely on. A <em>virtual machine</em> here means a machine that exists only on paper, as a specification.</p>
<p>From the programmer’s perspective, PTX is an instruction set for programming against a virtual machine model. Programmers or compilers producing PTX can be confident their program will run with the same semantics on many distinct physical machines, including machines that do not yet exist. In this way, it is also similar to CPU instruction set architectures like ${X(PTX_LINKS.x86, 'x86_64')}, ${X(PTX_LINKS.arm, 'aarch64')}, or ${X(PTX_LINKS.sparc, 'SPARC')}.</p>
<p>Unlike those ISAs, PTX is very much an ${X(PTX_LINKS.ir, 'intermediate representation')}, like LLVM-IR. The PTX components of a ${T('cuda-binary-utilities', 'CUDA binary')} will be just-in-time (JIT) compiled by the host ${T('nvidia-gpu-drivers', 'CUDA Drivers')} into device-specific ${T('streaming-assembler', 'SASS')} for execution. <em>Just-in-time</em> means at run time, on the machine that runs the program, right before the code is needed.</p>
<div data-slot="cmp"></div>
<h3>Forward-compatible: the narrow waist</h3>
<p>In the case of NVIDIA GPUs, PTX is forward-compatible: GPUs with a matching or higher ${T('compute-capability', 'compute capability')} version will be able to run the program, thanks to this mechanism of JIT compilation. In this way, PTX is a ${X(PTX_LINKS.waist, '“narrow waist”')} that separates the worlds of hardware and software. Pick a PTX target in Fig. 1 and see which GPUs can run it.</p>
${GG.noteHTML('warn', `<p><b>One exception.</b> Since Hopper there is also <em>architecture-specific</em> PTX, built for targets such as <code>compute_90a</code>. Features like <code>wgmma</code>, met below, are only available there, and such PTX is not forward-compatible: <code>compute_90a</code> code runs only on compute capability 9.0. (Blackwell added <em>family-specific</em> <code>f</code> targets as well, which carry over to later minor versions but not to the next major version.) Pick <code>compute_90a</code> in Fig. 1, and see ${T('compute-capability', 'Compute Capability')} for the full rules.</p>`)}
<div data-slot="waist" class="wide"></div>
${GG.noteHTML('intuition', '<p>Picture an hourglass. Everything above the waist (languages, compilers, hand-written code) only has to produce PTX. Everything below (each GPU generation, and the driver that knows it) only has to consume PTX. Neither side needs to know about the other, so either can change freely: with 4 producers and 9 GPUs, that is 4 + 9 = 13 translators instead of 4 × 9 = 36. The same shape explains why IP is the waist of the internet.</p>')}
<h3>Reading PTX, line by line</h3>
<p>Some exemplary PTX:</p>
<div data-slot="c1"></div>
<p>This is a compiler directive for the PTX-to-${T('streaming-assembler', 'SASS')} compiler indicating that this kernel consumes seven 32-bit floating point ${T('registers', 'registers')}. Registers are dynamically allocated to groups of ${T('thread', 'threads')} (${T('warp', 'warps')}) from the ${T('streaming-multiprocessor', 'SM')}’s ${T('register-file', 'register file')}. The angle-bracket syntax <code>%f&lt;7&gt;</code> is shorthand for seven registers named <code>%f0</code> through <code>%f6</code>.</p>
<div data-slot="regs" class="wide"></div>
${GG.noteHTML('beyond', '<p>PTX registers are <em>virtual</em>: a PTX program may declare as many as it likes. When the PTX is compiled to SASS (by <code>ptxas</code> ahead of time, or by the driver just in time), the register allocator maps them onto the real registers of the target architecture, reusing physical registers whose values are dead, and spilling to memory if there are not enough. So the SASS kernel’s register count can differ from the PTX declarations.</p>')}
<div data-slot="c2"></div>
<p>This applies a fused multiply-add (<code>fma</code>) operation to multiply the contents of registers <code>f3</code> and <code>f4</code> and add the constant <code>0f3FC00000</code>, storing the result in <code>f5</code>. All numbers are in 32 bit floating point representation. The <code>rn</code> suffix for the FMA operation sets the floating point rounding mode to ${X(PTX_LINKS.ieee, 'IEEE 754 “round even”')} (the default). Read token by token: <code>fma</code> the operation, <code>.rn</code> the rounding mode, <code>.f32</code> the type, then the destination <code>%f5</code> first and the sources after it. It is the same kind of operation as the SASS <code>FFMA R0, R7, R0, 1.5</code> in the ${T('streaming-assembler', 'SASS')} entry, an FP32 fused multiply-add with the immediate 1.5 (the glossary does not say one was compiled from the other): <code>0f3FC00000</code> is how PTX writes 1.5. Check it in Fig. 3.</p>
<div data-slot="ieee" class="wide"></div>
<p>A float can only hold certain values, so the exact result of a multiply-add usually falls between two of them. The rounding mode decides which neighbour is stored. “Fused” means this happens once, after both the multiply and the add, instead of after each.</p>
<div data-slot="round" class="wide"></div>
<div data-slot="c3"></div>
<p>These three lines <code>mov</code>e the <code>x</code>-axis values of the <code>c</code>ooperative <code>t</code>hread <code>a</code>rray <code>i</code>n<code>d</code>ex, the cooperative thread array dimension index (<code>ntid</code>), and the <code>t</code>hread <code>i</code>n<code>d</code>ex into three <code>u32</code> registers <code>r1</code> - <code>r3</code>. <code>u32</code> means unsigned 32-bit integer; the names starting with <code>%</code> on the right are special registers the hardware fills in for each thread.</p>
<div data-slot="mov" class="wide"></div>
<h3>The PTX machine model</h3>
<p>The PTX programming model exposes multiple levels of parallelism to the programmer. These levels map directly onto the hardware through the PTX machine model, diagrammed in Fig. 6.</p>
<div data-slot="model" class="wide"></div>
<p>Notably, in this machine model there is a single instruction unit for multiple processors. While each processor runs one ${T('thread', 'thread')}, those threads must execute the same instructions, hence <em>parallel</em> thread execution, or PTX. They coordinate with each other through ${T('shared-memory', 'shared memory')} and effect different results by means of private ${T('registers', 'registers')}. In the hardware, the multiprocessor is a ${T('streaming-multiprocessor', 'Streaming Multiprocessor')} and the group of threads fed by one instruction is a ${T('warp', 'warp')}.</p>
<h3>Versions and documentation</h3>
<p>The documentation for the latest version of PTX is available from NVIDIA ${X(PTX_LINKS.docs, 'here')}. The instruction sets of PTX are versioned with a number called the “${T('compute-capability', 'compute capability')}”, which is synonymous with “minimum supported ${T('streaming-multiprocessor-architecture', 'Streaming Multiprocessor architecture')} version”. PTX for compute capability 9.0 needs an SM of architecture version 9.0 or later underneath it.</p>
${GG.noteHTML('beyond', `<p><b>Two version numbers in one PTX file.</b> Strictly, a PTX module carries two numbers. Its <code>.target</code> directive (for example <code>.target sm_90</code>) names the compute capability it needs, and decides which GPUs can run it; that is the number the glossary means here. (Inside a PTX file the target is spelled <code>sm_90</code>, even though nvcc calls the same virtual architecture <code>compute_90</code> and reserves <code>sm_90</code> for SASS; see ${T('compute-capability', 'Compute Capability')}.) Its <code>.version</code> directive (for example <code>.version 8.5</code>) is the version of the PTX ISA itself, which grows with each CUDA Toolkit release, and decides which drivers can JIT-compile it: a driver older than the toolkit that wrote the PTX refuses it (the CUDA error <code>CUDA_ERROR_UNSUPPORTED_PTX_VERSION</code>). See the ${X(CC_TARGET, '.target directive')} in the PTX documentation.</p>`)}
<h3>Writing PTX by hand</h3>
<p>Writing in-line PTX by hand is uncommon outside of the cutting edge of performance, similar to writing in-line <code>x86_64</code> assembly, as is done in high-performance vectorized query operators in analytical databases and in performance-sensitive sections of operating system kernels. At time of writing in September of 2025, in-line PTX is the only way to take advantage of some Hopper-specific hardware features like the <code>wgmma</code> and <code>tma</code> instructions, as in ${X(PTX_LINKS.fa3, 'Flash Attention 3')} or in the ${X(PTX_LINKS.machete, 'Machete w4a16 kernels')}. (<code>wgmma</code> is the ${T('warpgroup', 'warpgroup')}-level matrix multiply-accumulate that drives Hopper’s ${T('tensor-core', 'Tensor Cores')}; <code>tma</code> refers to the ${T('tensor-memory-accelerator', 'Tensor Memory Accelerator')}’s bulk copies. In the PTX instruction set they are spelled <code>wgmma.mma_async</code> and <code>cp.async.bulk.tensor</code>; no instruction is literally named <code>tma</code>. <code>wgmma</code> needs the architecture-specific target <code>sm_90a</code>, so such kernels run only on Hopper and are not forward-compatible, as the note above explains. “w4a16” means 4-bit weights with 16-bit activations.)</p>
<div data-slot="inl"></div>
<p>Viewing ${T('cuda-c', 'CUDA C/C++')}, ${T('streaming-assembler', 'SASS')}, and ${T('parallel-thread-execution', 'PTX')} together is supported on ${X(GODBOLT, 'Godbolt')}. See the ${X(PTX_LINKS.inline, 'NVIDIA “Inline PTX Assembly in CUDA” guide')} for details.</p>
<div data-slot="read"></div>`);
      s.cmp.innerHTML = GG.tableHTML(`<thead><tr><th></th><th>x86_64 · aarch64 · SPARC</th><th>PTX</th><th>LLVM-IR</th></tr></thead><tbody>
<tr><td>what it is</td><td>CPU instruction set architectures</td><td>a virtual ISA that is really an IR</td><td>a compiler’s intermediate representation</td></tr>
<tr><td>one program, many machines</td><td>yes, including future CPUs of the family</td><td>yes, including future GPUs</td><td>one IR, many compiler back ends</td></tr>
<tr><td>run directly by hardware</td><td>yes</td><td>no: compiled to SASS first, ahead of time or JIT</td><td>no: compiled to a target ISA first</td></tr>
<tr><td>registers <span class="dsa-tag beyond">beyond</span></td><td>a fixed set (e.g. 16 general-purpose on x86_64, 31 on aarch64)</td><td>declared freely, e.g. <code>%f&lt;7&gt;</code>; real allocation happens later</td><td>unlimited virtual values</td></tr>
</tbody>`);
      s.cmp.classList.add('dsa-cmp');
      ctx.code(s.c1, { lang: 'ptx', code: '.reg .f32 %f<7>;', lineNumbers: false, notes: { 1: '<code>.reg</code> declares registers (the register state space). <code>.f32</code>: each holds a 32-bit float. <code>%f&lt;7&gt;</code>: seven of them, <code>%f0</code> … <code>%f6</code>. The <code>;</code> ends the statement.' }, noteDefault: 'Hover or tap the line.' });
      ctx.code(s.c2, { lang: 'ptx', code: 'fma.rn.f32 %f5, %f4, %f3, 0f3FC00000;', lineNumbers: false, notes: { 1: '<code>fma</code> fused multiply-add · <code>.rn</code> round to nearest even · <code>.f32</code> 32-bit floats · <code>%f5</code> destination · <code>%f4</code>, <code>%f3</code> the factors · <code>0f3FC00000</code> the addend, 1.5, as a hex bit pattern.' }, noteDefault: 'Hover or tap the line.' });
      ctx.code(s.c3, { lang: 'ptx', code: 'mov.u32 %r1, %ctaid.x;\nmov.u32 %r2, %ntid.x;\nmov.u32 %r3, %tid.x;', lineNumbers: false, notes: {
        1: '<code>%ctaid.x</code>: which cooperative thread array (CTA, the PTX name for a thread block) this thread belongs to, along x. CUDA C++ calls it <code>blockIdx.x</code>.',
        2: '<code>%ntid.x</code>: how many threads each CTA has along x (the CTA’s dimension). CUDA C++: <code>blockDim.x</code>.',
        3: '<code>%tid.x</code>: this thread’s index within its CTA, along x. CUDA C++: <code>threadIdx.x</code>.' } });
      guard(s.waist, 'Narrow waist', () => narrowWaist(s.waist, ctx));
      guard(s.regs, 'Registers', () => regFigure(s.regs, ctx));
      guard(s.ieee, 'Float decoder', () => floatDecoder(s.ieee, ctx));
      guard(s.round, 'Rounding modes', () => roundingFigure(s.round, ctx));
      guard(s.mov, 'Thread indices', () => movFigure(s.mov, ctx));
      guard(s.model, 'Machine model', () => machineModel(s.model, ctx));
      ctx.html(s.inl, `<h4>In-line PTX, in one line <span class="dsa-tag beyond">our example</span></h4>`);
      ctx.code(s.inl, { lang: 'cuda', langLabel: 'cuda · in-line ptx', code: `__device__ unsigned int lane_id() {
    unsigned int lane;
    asm("mov.u32 %0, %%laneid;" : "=r"(lane));
    return lane;
}`, notes: {
        3: '<code>asm(...)</code> pastes one PTX instruction into the compiled kernel. <code>%0</code> is the first operand, bound by <code>"=r"(lane)</code> to a 32-bit register written by the instruction; <code>%%laneid</code> is the special register <code>%laneid</code> (the thread’s position within its warp, 0–31), with <code>%%</code> escaping the percent sign.' } });
      ctx.reading(s.read, [
        { href: PTX_LINKS.docs, label: 'NVIDIA: Parallel Thread Execution ISA', note: 'the PTX documentation' },
        { href: PTX_LINKS.model, label: 'PTX ISA: the PTX machine model', note: 'source of the machine-model figure' },
        { href: PTX_LINKS.inline, label: 'NVIDIA: Inline PTX Assembly in CUDA', note: 'how to write asm() statements' },
        { href: PTX_LINKS.waist, label: 'Oil Shell blog: diagrams of narrow waists', note: 'the narrow-waist idea' },
        { href: PTX_LINKS.ir, label: 'Wikipedia: Intermediate representation' },
        { href: PTX_LINKS.ieee, label: 'Wikipedia: IEEE 754', note: 'floating-point formats and rounding' },
        { href: PTX_LINKS.x86, label: 'Intel 64 and IA-32 Architectures Software Developer Manuals', note: 'x86_64' },
        { href: PTX_LINKS.arm, label: 'Arm Architecture Reference Manual for A-profile', note: 'aarch64' },
        { href: PTX_LINKS.sparc, label: 'The SPARC Architecture Manual, Version 8' },
        { href: PTX_LINKS.fa3, label: 'Shah et al., FlashAttention-3 (2024)', note: 'uses wgmma and TMA via in-line PTX' },
        { href: PTX_LINKS.machete, label: 'Machete: w4a16 mixed-input GEMM kernels for Hopper (talk)' },
        { href: GODBOLT, label: 'Godbolt: CUDA C++, PTX and SASS side by side' },
      ]);
    },
  });


  /* ═════════════════════════════ Compute Capability ═════════════════════════════ */

  GG.css(`
.dsa-on-wrap { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; }
.dsa-devs { display: grid; grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); gap: 6px; }
.dsa-dev { border: 1px solid var(--line); border-radius: 10px; padding: 7px 9px 8px; background: rgba(8, 9, 14, 0.55); font: 500 11px/1.35 var(--font-mono); color: var(--ink-3); transition: border-color .2s, background .2s; min-width: 0; }
.dsa-dev b { display: flex; justify-content: space-between; gap: 6px; font: 700 14px/1.2 var(--font-mono); color: var(--ink-2); }
.dsa-dev b i { font-style: normal; font-size: 12px; }
.dsa-dev span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsa-dev.ok { border-color: rgba(69, 212, 155, 0.6); background: rgba(69, 212, 155, 0.08); }
.dsa-dev.ok b { color: var(--ink); } .dsa-dev.ok b i { color: var(--core); }
.dsa-dev.no b i { color: var(--danger); }
.dsa-dev.self { box-shadow: 0 0 0 2px var(--accent); }
@media (max-width: 720px) { .dsa-devs { grid-template-columns: repeat(3, minmax(0, 1fr)); } .dsa-dev { padding: 6px 7px; font-size: 10px; } .dsa-dev b { font-size: 12.5px; } }
.dsa-feats { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; align-items: center; }
.dsa-feats > .dsa-k { flex-basis: 100%; }
.dsa-feat { display: inline-flex; align-items: center; gap: 6px; font: 500 11.5px/1.3 var(--font-mono); padding: 5px 9px 4px; border-radius: 999px; border: 1px solid var(--line-2); }
.dsa-feat i { font-style: normal; font-weight: 700; }
.dsa-feat.y { color: var(--ink); border-color: rgba(69, 212, 155, 0.55); background: rgba(69, 212, 155, 0.08); } .dsa-feat.y i { color: var(--core); }
.dsa-feat.n { color: var(--ink-3); } .dsa-feat.n i { color: var(--danger); }
.dsa-mx-n { display: flex; align-items: flex-start; }
.dsa-mx-l { flex: none; }
.dsa-mx-r { flex: 1 1 auto; min-width: 0; padding-bottom: 6px; }
.dsa-mx-r:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.dsa-mx-r.more-r { -webkit-mask-image: linear-gradient(90deg, #000 calc(100% - 40px), transparent); mask-image: linear-gradient(90deg, #000 calc(100% - 40px), transparent); }
.dsa-mx-r.more-l { -webkit-mask-image: linear-gradient(90deg, transparent, #000 32px); mask-image: linear-gradient(90deg, transparent, #000 32px); }
.dsa-mx-r.more-l.more-r { -webkit-mask-image: linear-gradient(90deg, transparent, #000 32px, #000 calc(100% - 40px), transparent); mask-image: linear-gradient(90deg, transparent, #000 32px, #000 calc(100% - 40px), transparent); }
.dsa-mx-hint { display: flex; justify-content: space-between; gap: 8px; min-height: 16px; margin: 0 0 4px; font: 600 10.5px/16px var(--font-mono); color: var(--ink-2); }
.dsa-seg-dis button[disabled] { opacity: 0.3; cursor: not-allowed; }
.dsa-ld { display: grid; grid-template-columns: minmax(0, 1fr) 28px minmax(0, 1.5fr); gap: 10px; align-items: start; }
.dsa-ld-fat { border: 1px dashed var(--line-2); border-radius: 12px; padding: 10px; display: grid; gap: 8px; background: rgba(8, 9, 14, 0.5); }
.dsa-ld-chip { border: 1px solid var(--line-2); border-radius: 9px; padding: 8px 10px; display: grid; gap: 3px; opacity: 0.55; transition: opacity .2s, box-shadow .2s; }
.dsa-ld-chip b { font: 700 13px var(--font-mono); }
.dsa-ld-chip span { font: 12px/1.35 var(--font-body); color: var(--ink-2); }
.dsa-ld-chip.sass { border-color: rgba(69, 212, 155, 0.6); background: rgba(69, 212, 155, 0.08); } .dsa-ld-chip.sass b { color: var(--core); }
.dsa-ld-chip.ptx { border-color: rgba(255, 198, 92, 0.6); background: rgba(255, 198, 92, 0.07); } .dsa-ld-chip.ptx b { color: var(--control); }
.dsa-ld-chip.used { opacity: 1; box-shadow: 0 0 0 2px var(--accent); }
.dsa-ld-arrow { align-self: center; text-align: center; font: 600 20px var(--font-mono); color: var(--ink-3); }
.dsa-ld-steps { display: grid; gap: 6px; }
.dsa-ld-gpu { font: 12.5px/1.4 var(--font-body); color: var(--ink-2); padding: 2px 2px 4px; }
.dsa-ld-gpu b { font: 700 13px var(--font-mono); color: var(--ink); }
.dsa-ld-step { display: grid; grid-template-columns: 26px minmax(0, 1fr); gap: 8px; border: 1px solid var(--line); border-radius: 10px; padding: 8px 10px; font: 13px/1.45 var(--font-body); color: var(--ink-2); }
.dsa-ld-step > b { width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; font: 700 11px var(--font-mono); border: 1.5px solid var(--line-2); color: var(--ink-3); }
.dsa-ld-step .a { margin-top: 3px; color: var(--ink); }
.dsa-ld-step.dsa-ld-skip { opacity: 0.45; }
.dsa-ld-jit { display: grid; grid-template-columns: 22px minmax(0, 1fr); gap: 6px; align-items: center; }
.dsa-ld-jit > i { font: 600 16px/1 var(--font-mono); color: var(--control); font-style: normal; text-align: center; }
.dsa-ld-chip.jitted { opacity: 1; border-style: dashed; border-color: var(--core); background: rgba(69, 212, 155, 0.06); box-shadow: 0 0 0 2px var(--accent); }
.dsa-ld-chip.jitted b { color: var(--core); }
@media (prefers-reduced-motion: no-preference) { .dsa-ld-chip.jitted { animation: dsa-ld-in .6s ease-out both; } @keyframes dsa-ld-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } } }
.dsa-ld-step.yes { border-color: var(--core); } .dsa-ld-step.yes > b { border-color: var(--core); color: var(--core); }
.dsa-ld-step.no > b { border-color: var(--ink-3); }
.dsa-ld-step.err { border-color: var(--danger); } .dsa-ld-step.err > b { border-color: var(--danger); color: var(--danger); } .dsa-ld-step.err .a { color: var(--danger); }
@media (max-width: 720px) { .dsa-ld { grid-template-columns: minmax(0, 1fr); } .dsa-ld-arrow { transform: rotate(90deg); } }
`);

  const CC_LINKS = {
    onion: 'https://docs.nvidia.com/cuda/parallel-thread-execution/#ptx-module-directives-target',
    semver: 'https://semver.org/',
    virt: 'https://docs.nvidia.com/cuda/cuda-compiler-driver-nvcc/index.html#virtual-architectures',
    cpg: 'https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html',
    cpgCC: 'https://docs.nvidia.com/cuda/cuda-programming-guide/05-appendices/compute-capabilities.html',
  };
  const major = (v) => Math.floor(v / 10);
  /* Can code for target tv with suffix suf run on a device of compute capability dv?
     Plain: dv ≥ tv. a: only dv = tv. f: same major version and dv ≥ tv. */
  function ptxRuns(tv, suf, dv) {
    if (suf === 'a') return dv === tv;
    if (suf === 'f') return major(dv) === major(tv) && dv >= tv;
    return dv >= tv;
  }
  /* SASS (cubin) for sm_XY: same major, minor ≥ Y; a: exact; f: same family rule. */
  function sassRuns(tv, suf, dv) {
    if (suf === 'a') return dv === tv;
    return major(dv) === major(tv) && dv >= tv;
  }

  /* Fig: the onion model and its two kinds of exceptions */
  function onionFigure(host, ctx) {
    const f = ctx.figure(host, {
      title: 'The onion: which GPUs can run this PTX?', hint: 'pick a version and a suffix', wide: true,
      caption: `Each ring is the feature set of one compute capability; every newer ring wraps all older ones, so code that needs a ring runs on that ring and everything outside it. Wedges are the exceptions: a hatched wedge for <code>a</code> features, which belong to one ring only, and a dotted wedge for <code>f</code> features, which belong to the rings of one major version. Exact rules for <code>a</code> and <code>f</code>, and the example GPUs, are from NVIDIA’s <a href="${CC_LINKS.cpgCC}">Programming Guide</a>, beyond the glossary.`,
    });
    const st = { v: 80, suf: '' };
    let W = 0;
    const box = el('div', { class: 'dsa-on-wrap' });
    const wrap = el('div', { class: 'dsa-w' });
    const devs = el('div', { class: 'dsa-devs' });
    box.append(wrap, devs);
    f.stage.append(box);
    const devEls = GPUS.map((g) => {
      const d = el('div', { class: 'dsa-dev' });
      d.innerHTML = `<b><span>${g.cc}</span><i></i></b><span>${esc(g.arch)}</span><span>${esc(g.ex)}</span>`;
      devs.append(d);
      return d;
    });
    const tname = () => 'compute_' + st.v + st.suf;
    function draw() {
      wrap.innerHTML = '';
      const narrow = W < 640;
      const n = GPUS.length;
      const rMax = Math.min(narrow ? W / 2 - 6 : 300, 300), r0 = narrow ? 16 : 26, step = (rMax - r0) / n;
      const H = rMax + 30;
      const cx = W / 2, cy = rMax + 6;
      const s = svgRoot(wrap, W, H, `Onion of ${n} compute capabilities; ${tname()} runs on ${GPUS.filter((g) => ptxRuns(st.v, st.suf, g.v)).length}`);
      const arc = (r) => `M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy}`;
      const band = (ri, ro, a0, a1) => { // a in degrees, 180 = left, 0 = right (upper half)
        const p = (r, a) => [cx + r * Math.cos(a * Math.PI / 180), cy - r * Math.sin(a * Math.PI / 180)];
        const [x1, y1] = p(ro, a0), [x2, y2] = p(ro, a1), [x3, y3] = p(ri, a1), [x4, y4] = p(ri, a0);
        const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
        return `M${x1},${y1} A${ro},${ro} 0 ${large} 0 ${x2},${y2} L${x3},${y3} A${ri},${ri} 0 ${large} 1 ${x4},${y4} Z`;
      };
      // rings, outermost first so inner ones paint on top
      for (let i = n - 1; i >= 0; i--) {
        const g = GPUS[i], ro = r0 + (i + 1) * step;
        const ok = ptxRuns(st.v, st.suf, g.v);
        const isT = g.v === st.v;
        path(s, band(ro - step, ro, 0, 180), { fill: ok ? `rgba(69,212,155,${0.16 + 0.025 * i})` : 'rgba(255,255,255,0.025)', stroke: ok ? 'rgba(69,212,155,0.55)' : 'var(--line-2)', sw: 1 });
        if (isT) path(s, arc(ro), { stroke: 'var(--accent)', sw: 2 });
      }
      path(s, `${arc(r0)} Z`, { fill: 'var(--bg-2)', stroke: 'var(--line-2)' });
      // exception wedges
      if (st.suf) {
        const i0 = GPUS.findIndex((g) => g.v === st.v);
        let i1 = i0;
        if (st.suf === 'f') while (i1 + 1 < n && major(GPUS[i1 + 1].v) === major(st.v)) i1++;
        const ri = r0 + i0 * step, ro = r0 + (i1 + 1) * step;
        const defs = S('defs', {}, s);
        const pid = GG.uid('dsa-pat');
        const pat = S('pattern', { id: pid, width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: st.suf === 'a' ? 'rotate(45)' : null }, defs);
        rect(pat, 0, 0, 6, 6, { fill: 'var(--bg)', rx: 0 });
        if (st.suf === 'a') rect(pat, 0, 0, 2.2, 6, { fill: 'var(--ink-2)', rx: 0 });
        else S('circle', { cx: 3, cy: 3, r: 1.2, style: 'fill:var(--ink-2)' }, pat);
        path(s, band(ri, ro, 128, 172), { fill: `url(#${pid})`, stroke: 'var(--ink)', sw: 1.4, dash: st.suf === 'f' ? '4 3' : null });
        const am = 150 * Math.PI / 180, rm = (ri + ro) / 2;
        const lx = cx + rm * Math.cos(am), ly = cy - rm * Math.sin(am);
        const lab = st.suf === 'a' ? ccName(st.v) + 'a features' : ccName(st.v) + 'f family';
        rect(s, lx - lab.length * 3.1 - 5, ly - 9, lab.length * 6.2 + 10, 16, { fill: 'var(--bg)', stroke: 'var(--ink)', rx: 4 });
        tx(s, lx, ly + 3, lab, { anchor: 'middle', size: 10, weight: 600, fill: 'var(--ink)' });
      }
      // ring labels along a ray
      const th = (narrow ? 90 : 62) * Math.PI / 180; // straight up on phones, where the rings are thin
      for (let i = 0; i < n; i++) {
        const g = GPUS[i], rc = r0 + (i + 0.5) * step;
        const x = cx + rc * Math.cos(th), y = cy - rc * Math.sin(th);
        const ok = ptxRuns(st.v, st.suf, g.v), isT = g.v === st.v;
        tx(s, x, y + 3.5, g.cc, { anchor: 'middle', size: narrow ? 9.5 : 10, weight: isT ? 700 : 500, fill: isT ? 'var(--accent)' : ok ? '#fff' : 'var(--ink-3)', style: 'paint-order:stroke;stroke:var(--bg);stroke-width:3px;' });
      }
      tx(s, cx, cy + 18, 'oldest feature set at the centre · newer GPUs wrap older ones', { anchor: 'middle', size: narrow ? 9 : 10, fill: 'var(--ink-3)' });
    }
    const sRun = GG.ui.stat(f.readouts, { label: 'runs on', value: '', tone: 'core' });
    const sRule = GG.ui.stat(f.readouts, { label: 'rule', value: '' });
    function update() {
      const ok = GPUS.filter((g) => ptxRuns(st.v, st.suf, g.v));
      devEls.forEach((d, i) => {
        const g = GPUS[i], r = ptxRuns(st.v, st.suf, g.v);
        d.className = 'dsa-dev ' + (r ? 'ok' : 'no') + (g.v === st.v ? ' self' : '');
        d.querySelector('i').textContent = r ? '✓' : '✗';
      });
      sRun.set(ok.length + ' of ' + GPUS.length + ' versions shown');
      sRule.set(st.suf === 'a' ? 'exactly ' + ccName(st.v) : st.suf === 'f' ? `${major(st.v)}.x, ≥ ${ccName(st.v)}` : '≥ ' + ccName(st.v));
      const nm = `<code>${tname()}</code>`;
      let why;
      if (!st.suf) why = `${nm} is plain onion-model PTX. It runs on compute capability <b>${ccName(st.v)}</b> and every later version, across minor <em>and</em> major versions: ${ok.map((g) => g.cc).join(', ')}. ${GPUS.length - ok.length ? 'Older GPUs lack features it may use.' : ''}`;
      else if (st.suf === 'a') why = `${nm} may use architecture-specific features${st.v === 90 ? ', like Hopper’s <code>wgmma</code>,' : ' of compute capability ' + ccName(st.v) + ','} that deviate from the onion model. Their future compatibility is not guaranteed, even within a major version: in practice it runs only on compute capability <b>${ccName(st.v)}</b> itself.`;
      else why = `${nm} may use family-specific features, which also deviate from the onion model but are closer to SemVer: compatible across minor versions, not across major versions. Here: ${ok.map((g) => g.cc).join(', ')}, but not ${GPUS.filter((g) => g.v > st.v && !ok.includes(g)).map((g) => g.cc).join(', ') || 'anything newer'}.`;
      if (st.v === 70) why += ' (Compiling for 7.0 needs CUDA 12.x or older: CUDA 13 dropped offline compilation for Volta.)';
      f.setWhy(why);
    }
    const verSeg = GG.ui.seg(f.controls, { label: 'Compute capability', value: st.v, options: GPUS.map((g) => ({ value: g.v, label: g.cc, title: g.arch + ' · ' + g.ex })), onChange: (v) => { st.v = v; if ((st.suf === 'a' && v < 90) || (st.suf === 'f' && v < 100)) { st.suf = ''; sufSeg.set('', false); } syncSuf(); update(); draw(); } });
    const sufSeg = GG.ui.seg(f.controls, { label: 'Suffix', value: '', options: [{ value: '', label: 'none', title: 'onion model' }, { value: 'a', label: 'a', title: 'architecture-specific (from 9.0, Hopper)' }, { value: 'f', label: 'f', title: 'family-specific (from 10.0, Blackwell)' }], onChange: (v) => { st.suf = v; update(); draw(); } });
    sufSeg.el.classList.add('dsa-seg-dis');
    function syncSuf() {
      sufSeg.el.querySelectorAll('button').forEach((b) => {
        const v = b.getAttribute('data-value');
        b.disabled = (v === 'a' && st.v < 90) || (v === 'f' && st.v < 100);
        if (b.disabled) b.title = v === 'a' ? 'a targets exist from 9.0 (Hopper) on' : 'f targets exist from 10.0 (Blackwell) on';
      });
    }
    void verSeg;
    syncSuf(); update();
    onWidth(wrap, (w) => { W = w; draw(); });
  }

  /* Fig: the full compatibility matrix, for PTX, SASS, or a whole -arch=sm_XY build */
  function ccMatrix(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Compatibility matrix: targets × GPUs', hint: canHover ? 'switch the code kind · hover a cell' : 'switch the code kind · tap a cell', wide: true,
      caption: 'Rows: compilation targets. Columns: GPU compute capabilities. S: SASS loads as is (green). J: the driver JIT-compiles PTX (amber). PTX follows the onion model (plus the a and f exceptions). SASS, compiled for one physical architecture, runs only on the same major version with an equal or higher minor version, and a-suffixed SASS only on that exact version. The SASS rules and the nvcc shorthand are from NVIDIA’s Programming Guide and nvcc documentation, beyond the glossary. † Building for 7.0 (Volta) needs CUDA 12.x or older: CUDA 13 dropped offline compilation below compute capability 7.5. On phones the cells scroll sideways.',
    });
    const ROWS_ALL = [[70, ''], [75, ''], [80, ''], [86, ''], [89, ''], [90, ''], [90, 'a'], [100, ''], [100, 'a'], [100, 'f'], [103, 'f'], [110, 'f'], [120, ''], [120, 'a'], [120, 'f']];
    let mode = 'ptx', W = 0, sel = null;
    const wrap = el('div', { class: 'dsa-w' });
    f.stage.append(wrap);
    const rows = () => (mode === 'both' ? ROWS_ALL.filter((r) => !r[1]) : ROWS_ALL);
    const rowName = (r) => (mode === 'ptx' ? 'compute_' : mode === 'sass' ? 'sm_' : '-arch=sm_') + r[0] + r[1];
    function cell(r, g) {
      if (mode === 'ptx') return ptxRuns(r[0], r[1], g.v) ? (g.v === r[0] ? 'jit' : 'jit') : '';
      if (mode === 'sass') return sassRuns(r[0], r[1], g.v) ? 'sass' : '';
      return sassRuns(r[0], r[1], g.v) ? 'sass' : ptxRuns(r[0], r[1], g.v) ? 'jit' : '';
    }
    const explain = (r, g) => explainCell(r, g) + (r[0] === 70 ? ' (Building for 7.0 at all needs CUDA 12.x or older: CUDA 13 can no longer target Volta.)' : '');
    function explainCell(r, g) {
      const c = cell(r, g), t = `<code>${rowName(r)}</code>`;
      const dv = `compute capability <b>${g.cc}</b> (${esc(g.ex)})`;
      if (mode === 'both') {
        if (c === 'sass') return `${t} embeds <code>sm_${r[0]}</code> SASS and <code>compute_${r[0]}</code> PTX. On ${dv} the SASS loads as is: same major version, minor version at least ${r[0] % 10}.`;
        if (c === 'jit') return `${t}: the <code>sm_${r[0]}</code> SASS cannot load on ${dv} (a different major version), but the embedded <code>compute_${r[0]}</code> PTX can be JIT-compiled by the driver into SASS for it.`;
        return `${t}: neither the <code>sm_${r[0]}</code> SASS nor the <code>compute_${r[0]}</code> PTX can run on ${dv}, which is older than ${ccName(r[0])}.`;
      }
      if (mode === 'sass') {
        if (c) return `${t} SASS runs on ${dv}${r[1] === 'a' ? ': architecture-specific code, this exact architecture only' : ': same major version, equal or higher minor version'}.`;
        return `${t} SASS cannot run on ${dv}: ${r[1] === 'a' ? 'a-suffixed code runs only on ' + ccName(r[0]) : major(g.v) !== major(r[0]) ? 'SASS does not cross major versions' : 'its minor version is lower'}.`;
      }
      if (c) return `${t} PTX can be JIT-compiled for ${dv}.${r[1] === 'f' ? ' Same family (major version).' : r[1] === 'a' ? ' This exact compute capability.' : ' Onion model: any equal or later version.'}`;
      return `${t} PTX cannot run on ${dv}: ${r[1] === 'a' ? 'architecture-specific code is only for ' + ccName(r[0]) : r[1] === 'f' && g.v > r[0] ? 'family-specific code does not cross into another major version' : 'the GPU is older than the target'}.`;
    }
    let cellsRef = [];
    const SHORT = { 70: 'V100', 75: 'T4', 80: 'A100', 86: 'A10', 89: 'L4', 90: 'H100', 100: 'B200', 103: 'B300', 110: 'Thor', 120: 'RTX 5090', 121: 'DGX Spark' };
    function draw() {
      wrap.innerHTML = '';
      const narrow = W < 640;
      const R = rows();
      /* Phones: row labels in their own fixed column, the cells in a horizontally scrolling strip with
         40 px columns, so every header, GPU name and letter keeps a readable size. */
      const labW = narrow ? 104 : 132, headH = narrow ? 42 : 40;
      const cw = narrow ? 44 : (W - labW - 2) / GPUS.length, ch = narrow ? 26 : 24;
      const H = headH + R.length * ch + 4;
      let sL, sC, offX;
      if (narrow) {
        const box = el('div', { class: 'dsa-mx-n' });
        const left = el('div', { class: 'dsa-mx-l' });
        const right = el('div', { class: 'scroll-x dsa-mx-r', tabindex: '0', 'aria-label': 'Matrix cells, scroll sideways for newer GPUs' });
        box.append(left, right);
        wrap.append(box);
        sL = svgRoot(left, labW, H, 'Compilation targets');
        const cW = cw * GPUS.length + 2;
        sC = svgRoot(right, cW, H, 'Compatibility matrix of compilation targets and GPU compute capabilities');
        sC.style.width = cW + 'px'; sC.style.maxWidth = 'none';
        left.style.width = labW + 'px';
        offX = 0;
      } else {
        sL = sC = svgRoot(wrap, W, H, 'Compatibility matrix of compilation targets and GPU compute capabilities');
        offX = labW;
      }
      GPUS.forEach((g, j) => {
        const x = offX + j * cw + cw / 2;
        tx(sC, x, 15, g.cc + (g.v === 70 ? '†' : ''), { anchor: 'middle', size: 11, weight: 600, fill: 'var(--ink)' });
        const nm = narrow ? SHORT[g.v] : g.ex.split(' · ')[0];
        const parts = narrow && nm.includes(' ') ? nm.split(' ') : [nm];
        parts.forEach((pt, k) => tx(sC, x, 28 + k * 10, pt, { anchor: 'middle', size: 9, fill: 'var(--ink-3)' }));
      });
      tx(sL, 0, headH - 8, mode === 'ptx' ? 'PTX target' : mode === 'sass' ? 'SASS target' : 'nvcc flag', { size: 10, fill: 'var(--ink-3)' });
      cellsRef = [];
      R.forEach((r, i) => {
        const y = headH + i * ch;
        const lg = S('g', {}, sL);
        const on = sel && sel[0] === i;
        rect(lg, 0, y + 1, labW - 6, ch - 2, { fill: on ? 'var(--accent-a)' : 'transparent', rx: 4 });
        tx(lg, 4, y + ch / 2 + 4, rowName(r) + (r[0] === 70 ? '†' : ''), { size: narrow ? 10.5 : 11, weight: r[1] ? 700 : 500, fill: r[1] ? '#fff' : 'var(--ink)' });
        hit(lg, rowName(r), () => { const j = GPUS.findIndex((g) => g.v === r[0]); sel = [i, j < 0 ? 0 : j]; draw(); });
        GPUS.forEach((g, j) => {
          const c = cell(r, g);
          const x = offX + j * cw;
          const sl = sel && sel[0] === i && sel[1] === j;
          const g2 = S('g', {}, sC);
          rect(g2, x + 1.5, y + 1.5, cw - 3, ch - 3, { fill: c === 'sass' ? 'rgba(69,212,155,0.55)' : c === 'jit' ? 'rgba(255,198,92,0.42)' : 'rgba(255,255,255,0.03)', stroke: sl ? 'var(--accent)' : c ? 'transparent' : 'var(--line)', sw: sl ? 2 : 1, rx: 3 });
          if (c) tx(g2, x + cw / 2, y + ch / 2 + 4, c === 'sass' ? 'S' : 'J', { anchor: 'middle', size: 10.5, weight: 700, fill: c === 'sass' ? '#062016' : '#2a1d05' });
          g2.style.cursor = 'pointer';
          const show = () => { sel = [i, j]; f.setWhy(explain(r, g)); cellsRef.forEach((o) => { o.r.style.stroke = o.c ? 'transparent' : 'var(--line)'; o.r.style.strokeWidth = 1; }); const me = cellsRef[i * GPUS.length + j]; if (me) { me.r.style.stroke = 'var(--accent)'; me.r.style.strokeWidth = 2; } };
          g2.addEventListener('click', show);
          if (canHover) g2.addEventListener('mouseenter', show);
          cellsRef.push({ r: g2.firstChild, c });
        });
      });
      if (sel && R[sel[0]]) f.setWhy(explain(R[sel[0]], GPUS[sel[1]]));
      if (narrow) stripCues(cw);
    }
    /* Phones: bring the selected cell's column into view (the strip would otherwise open on 7.0–8.9),
       and say how many GPU columns are hidden on each side, with a fade on that edge. */
    function stripCues(cw) {
      const right = wrap.querySelector('.dsa-mx-r');
      if (!right) return;
      const hint = el('div', { class: 'dsa-mx-hint', 'aria-hidden': 'true' });
      const hl = el('span'), hr = el('span');
      hint.append(hl, hr);
      hint.style.marginLeft = right.offsetLeft + 'px';
      wrap.prepend(hint);
      const sync = () => {
        const max = right.scrollWidth - right.clientWidth;
        const nl = Math.round(right.scrollLeft / cw), nr = Math.round((max - right.scrollLeft) / cw);
        right.classList.toggle('more-l', right.scrollLeft > 2);
        right.classList.toggle('more-r', right.scrollLeft < max - 2);
        hl.textContent = `← ${nl} older`; hl.style.visibility = nl < 1 ? 'hidden' : '';
        hr.textContent = `${nr} newer →`; hr.style.visibility = nr < 1 ? 'hidden' : '';
      };
      right.addEventListener('scroll', sync, { passive: true });
      if (sel) right.scrollLeft = Math.max(0, sel[1] * cw + cw / 2 - right.clientWidth / 2);
      sync();
    }
    const sS = GG.ui.stat(f.readouts, { label: 'S · SASS loads as is', value: '', tone: 'core' });
    const sJ = GG.ui.stat(f.readouts, { label: 'J · PTX, driver JITs', value: '', tone: 'control' });
    function counts() {
      let a = 0, b = 0;
      rows().forEach((r) => GPUS.forEach((g) => { const c = cell(r, g); if (c === 'sass') a++; else if (c === 'jit') b++; }));
      sS.set(mode === 'ptx' ? '—' : a + ' cells'); sJ.set(mode === 'sass' ? '—' : b + ' cells');
    }
    GG.ui.seg(f.controls, { label: 'Code kind', value: mode, options: [{ value: 'ptx', label: 'PTX · compute_XY', title: 'virtual GPU architecture' }, { value: 'sass', label: 'SASS · sm_XY', title: 'physical GPU architecture' }, { value: 'both', label: 'nvcc -arch=sm_XY', title: 'SASS plus PTX' }], onChange: (v) => { mode = v; sel = mode === 'both' ? [5, 6] : [5, 6]; counts(); draw(); } });
    sel = [5, 6]; // compute_90 on 10.0
    counts();
    onWidth(wrap, (w) => { W = w; draw(); });
  }

  /* Fig: what a compute capability tells you, version by version.
     Numbers: NVIDIA CUDA Programming Guide (CUDA 13.x), Compute Capabilities appendix, "technical
     specifications" and "feature availability" tables. wgmma: PTX ISA (requires sm_90a). */
  const SPEC_V = [
    { cc: '7.5', g: '7.x', ex: 'T4', warps: 32, blocks: 16, smem: 64, smemB: 64, fp8: false, fp4: false },
    { cc: '8.0', g: '8.x', ex: 'A100', warps: 64, blocks: 32, smem: 164, smemB: 163, fp8: false, fp4: false },
    { cc: '8.6', g: '8.x', ex: 'A10 · RTX 3090', warps: 48, blocks: 16, smem: 100, smemB: 99, fp8: false, fp4: false },
    { cc: '8.7', g: '8.x', ex: 'Jetson Orin', warps: 48, blocks: 16, smem: 164, smemB: 163, fp8: false, fp4: false },
    { cc: '8.9', g: '8.x', ex: 'L4 · L40S', warps: 48, blocks: 24, smem: 100, smemB: 99, fp8: true, fp4: false },
    { cc: '9.0', g: '9.0', ex: 'H100 · H200', warps: 64, blocks: 32, smem: 228, smemB: 227, fp8: true, fp4: false },
    { cc: '10.0', g: '10.x', ex: 'B200', warps: 64, blocks: 32, smem: 228, smemB: 227, fp8: true, fp4: true },
    { cc: '10.3', g: '10.x', ex: 'B300', warps: 64, blocks: 32, smem: 228, smemB: 227, fp8: true, fp4: true },
    { cc: '10.7', g: '10.x', ex: '', warps: 32, blocks: 16, smem: 328, smemB: 327, fp8: true, fp4: true },
    { cc: '11.0', g: '11.0', ex: 'Jetson Thor', warps: 48, blocks: 24, smem: 228, smemB: 227, fp8: true, fp4: true },
    { cc: '12.x', g: '12.x', ex: 'RTX 5090 · DGX Spark', warps: 48, blocks: 24, smem: 100, smemB: 99, fp8: true, fp4: true },
  ];
  function specFigure(host, ctx) {
    const f = ctx.figure(host, {
      title: 'What a compute capability tells you', hint: 'pick a version · or click a bar', wide: true,
      caption: `Limits and features per compute capability, from the tables in NVIDIA’s <a href="${CC_LINKS.cpgCC}">CUDA Programming Guide</a> (CUDA 13.x, which starts at 7.5; Volta’s 7.0 is no longer listed). Each row draws the value for every version, so you can see where it changes; the selected version is lit. Shared memory is the largest carve-out of the SM’s unified L1 data cache, in KB. Not drawn because they do not change across these versions: 64K 32-bit registers per SM, 1,024 threads per block, 255 registers per thread, warps of 32 threads. The <code>wgmma</code> row is from the PTX ISA. Example GPUs are ours.`,
    });
    let si = 5, W = 0;
    const wrap = el('div', { class: 'dsa-w' });
    const feats = el('div', { class: 'dsa-feats' });
    f.stage.append(wrap, feats);
    const ROWS = [
      { k: 'warps', label: 'max resident warps per SM', fmtv: (v) => `${v} (${fmt.int(v * 32)} threads)`, tone: 'control' },
      { k: 'blocks', label: 'max resident blocks per SM', fmtv: (v) => String(v), tone: 'control' },
      { k: 'smem', label: 'max shared memory per SM', fmtv: (v) => v + ' KB', tone: 'memory' },
      { k: 'smemB', label: 'max shared memory per block', fmtv: (v) => v + ' KB', tone: 'memory' },
    ];
    const FEATS = [
      { label: 'bfloat16 arithmetic', has: (v) => v.g !== '7.x' },
      { label: 'hardware memcpy_async · split arrive/wait barriers', has: (v) => v.g !== '7.x' },
      { label: 'FP8 Tensor Core inputs', has: (v) => v.fp8 },
      { label: 'thread block clusters · distributed shared memory', has: (v) => !['7.x', '8.x'].includes(v.g) },
      { label: 'Tensor Memory Accelerator (TMA)', has: (v) => !['7.x', '8.x'].includes(v.g) },
      { label: 'FP4 Tensor Core inputs', has: (v) => v.fp4 },
      { label: 'wgmma (PTX), only with the 9.0a target', has: (v) => v.cc === '9.0' },
    ];
    const pick = (i) => { si = clamp(i, 0, SPEC_V.length - 1); seg.set(si, false); draw(); };
    function draw() {
      if (!W) return;
      wrap.innerHTML = '';
      const narrow = W < 560;
      const n = SPEC_V.length, labW = narrow ? 0 : 230;
      const bx = labW, bw = (W - labW) / n, rowH = narrow ? 74 : 62, barH = narrow ? 34 : 34;
      const H = ROWS.length * rowH + 30;
      const v = SPEC_V[si];
      const s = svgRoot(wrap, W, H, `Compute capability ${v.cc}: ` + ROWS.map((r) => `${r.label} ${r.fmtv(v[r.k])}`).join(', '));
      ROWS.forEach((r, ri) => {
        const y0 = ri * rowH, max = Math.max(...SPEC_V.map((x) => x[r.k]));
        const ty = narrow ? y0 + 12 : y0 + rowH / 2 - 2;
        tx(s, 0, ty, r.label, { size: 10.5, fill: 'var(--ink-2)' });
        tx(s, narrow ? W : 0, narrow ? ty : ty + 16, r.fmtv(v[r.k]), { anchor: narrow ? 'end' : 'start', size: 13, weight: 700, fill: `var(--${r.tone})` });
        const base = y0 + rowH - 10;
        line(s, bx, base + 0.5, W, base + 0.5, { stroke: 'var(--line-2)' });
        SPEC_V.forEach((x, j) => {
          const h = Math.max(2, (x[r.k] / max) * barH), on = j === si;
          const prevDiff = j > 0 && SPEC_V[j - 1][r.k] !== x[r.k];
          const g = S('g', {}, s);
          rect(g, bx + j * bw + 3, base - h, bw - 6, h, { fill: on ? `var(--${r.tone})` : `rgba(255,255,255,${prevDiff ? 0.2 : 0.11})`, rx: 2 });
          rect(g, bx + j * bw, y0 + (narrow ? 18 : 4), bw, base - y0 - (narrow ? 18 : 4), { fill: 'transparent', rx: 0 });
          if (on || !narrow) tx(g, bx + j * bw + bw / 2, base - h - 4, String(x[r.k]), { anchor: 'middle', size: 9.5, weight: on ? 700 : 500, fill: on ? '#fff' : 'var(--ink-3)' });
          g.style.cursor = 'pointer';
          g.addEventListener('click', () => pick(j));
        });
      });
      // version axis
      const ay = ROWS.length * rowH + 14;
      SPEC_V.forEach((x, j) => tx(s, bx + j * bw + bw / 2, ay, x.cc, { anchor: 'middle', size: narrow ? 9.5 : 10.5, weight: j === si ? 700 : 500, fill: j === si ? 'var(--accent)' : 'var(--ink-3)' }));
      feats.innerHTML = `<div class="dsa-k">features of compute capability ${v.cc}</div>` + FEATS.map((ft) => { const h = ft.has(v); return `<span class="dsa-feat ${h ? 'y' : 'n'}"><i aria-hidden="true">${h ? '✓' : '✗'}</i>${esc(ft.label)}<span class="visually-hidden">${h ? ': yes' : ': no'}</span></span>`; }).join('');
      const prev = si > 0 ? SPEC_V[si - 1] : null;
      const ch = prev ? ROWS.filter((r) => prev[r.k] !== v[r.k]).map((r) => `${r.label.replace('max ', '')} ${prev[r.k] < v[r.k] ? 'up' : 'down'} from ${r.fmtv(prev[r.k])} to ${r.fmtv(v[r.k])}`) : [];
      const fNew = prev ? FEATS.filter((ft) => ft.has(v) && !ft.has(prev)).map((ft) => ft.label.split(' · ')[0]) : [];
      const fGone = prev ? FEATS.filter((ft) => !ft.has(v) && ft.has(prev)).map((ft) => ft.label.split(' · ')[0]) : [];
      f.setWhy(`<b>Compute capability ${v.cc}</b>${v.ex ? ` (${esc(v.ex)})` : ''}: up to ${v.warps} warps (${fmt.int(v.warps * 32)} threads) and ${v.blocks} blocks resident per SM, ${v.smem} KB of shared memory per SM and ${v.smemB} KB per block, 64K registers. ` +
        (prev ? (ch.length ? `Compared with ${prev.cc}: ${ch.join('; ')}.` : `The same limits as ${prev.cc}.`) + (fNew.length ? ` New here: ${fNew.join(', ')}.` : '') + (fGone.length ? ` Not here: ${fGone.join(', ')}.` : '') : 'The oldest version in NVIDIA’s current table.') +
        (v.cc === '9.0' ? ' These are the H100 numbers used across this site.' : ''));
    }
    const seg = GG.ui.seg(f.controls, { label: 'Compute capability', value: si, options: SPEC_V.map((x, i) => ({ value: i, label: x.cc, title: x.ex || null })), onChange: (i) => pick(i) });
    onWidth(wrap, (w) => { W = w; draw(); });
  }

  /* Fig: one -arch=sm_XY build, one GPU: what the driver does at load time */
  function loadFigure(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Fat binary meets GPU: what loads?', hint: 'pick a build and a GPU', wide: true,
      caption: `Left: what <code>nvcc -arch=sm_XY</code> puts in the executable’s <em>fat binary</em>, SASS for the physical architecture <code>sm_XY</code> and PTX for the virtual architecture <code>compute_XY</code>; when the PTX is used, the SASS the driver compiles from it appears below (dashed). Right: the checks made when the program loads its kernels on a GPU, top to bottom; the path taken is lit, skipped steps are faded. Building <code>sm_70</code> needs CUDA 12.x or older (CUDA 13 dropped Volta). The rules are the ones of Fig. 2; the error text is the CUDA runtime’s. Beyond the glossary, from NVIDIA’s nvcc documentation and Programming Guide.`,
    });
    const BUILDS = [70, 75, 80, 86, 89, 90, 100, 120].map((v) => [v, '']).concat([[90, 'a']]);
    const st = { b: 2, g: 5 }; // -arch=sm_80 on an H100 (9.0): SASS can't load, PTX JITs
    const box = el('div', { class: 'dsa-ld' });
    f.stage.append(box);
    function render() {
      const [tv, suf] = BUILDS[st.b], g = GPUS[st.g];
      const sOk = sassRuns(tv, suf, g.v), pOk = ptxRuns(tv, suf, g.v);
      const tname = tv + suf;
      const out = sOk ? 'sass' : pOk ? 'jit' : 'err';
      const step = (n, on, q, yes, no, res) => `<div class="dsa-ld-step ${on}"><b>${n}</b><div><div class="q">${q}</div><div class="a">${res}</div></div></div>`;
      box.innerHTML = `
<div class="dsa-ld-fat"><div class="dsa-k">fat binary · nvcc -arch=sm_${tname}</div>
  <div class="dsa-ld-chip sass ${out === 'sass' ? 'used' : ''}"><b>sm_${tname}</b><span>SASS · machine code for SM ${ccName(tv)}${suf}</span></div>
  <div class="dsa-ld-chip ptx ${out === 'jit' ? 'used' : ''}"><b>compute_${tname}</b><span>${suf === 'a' ? `PTX · only for CC ${ccName(tv)} exactly (architecture-specific)` : `PTX · for any GPU of CC ≥ ${ccName(tv)}`}</span></div>
  ${out === 'jit' ? `<div class="dsa-ld-jit"><i aria-hidden="true">↓</i><span class="dsa-k">driver JIT, at load time</span></div>
  <div class="dsa-ld-chip jitted"><b>sm_${g.v}</b><span>SASS for this GPU, JIT-compiled from the PTX and kept in the driver’s JIT cache for the next run. Not part of the file.</span></div>` : ''}
</div>
<div class="dsa-ld-arrow" aria-hidden="true">→</div>
<div class="dsa-ld-steps">
  <div class="dsa-ld-gpu"><span class="dsa-k">GPU</span> <b>CC ${g.cc}</b> · ${esc(g.arch)} · ${esc(g.ex)}</div>
  ${step(1, sOk ? 'yes' : 'no', `Is there SASS this GPU can load? <code>sm_${tname}</code>: ${suf === 'a' ? 'needs exactly ' + ccName(tv) : `needs major ${major(tv)}, minor ≥ ${tv % 10}`}.`, '', '', sOk ? 'Yes: the driver loads the SASS as is. Fastest start.' : `No: ${suf === 'a' ? 'a-suffixed SASS runs only on ' + ccName(tv) : major(g.v) !== major(tv) ? 'different major version' : 'lower minor version'}.`)}
  ${step(2, sOk ? 'dsa-ld-skip' : pOk ? 'yes' : 'no', `Otherwise, is there PTX it can compile? <code>compute_${tname}</code>: ${suf === 'a' ? 'needs exactly ' + ccName(tv) : 'needs CC ≥ ' + ccName(tv)}.`, '', '', sOk ? 'Not needed.' : pOk ? `Yes: the driver JIT-compiles the PTX into SASS for sm_${g.v} (once; drivers cache the result).` : 'No: the GPU is ' + (g.v < tv ? 'older than the target.' : 'not the exact architecture.'))}
  ${step(3, out === 'err' ? 'err' : 'dsa-ld-skip', 'Otherwise: no usable code.', '', '', out === 'err' ? 'The launch fails with “no kernel image is available for execution on the device”.' : 'Not reached.')}
</div>`;
      sRes.set(out === 'sass' ? 'SASS loads' : out === 'jit' ? 'PTX, JIT-compiled' : 'error', out === 'sass' ? 'core' : out === 'jit' ? 'control' : 'danger');
      f.setWhy(out === 'sass'
        ? `<b>sm_${tname}</b> SASS loads directly on compute capability ${g.cc}: ${suf === 'a' ? 'the exact architecture it was built for' : `same major version (${major(tv)}), minor ${g.v % 10} ≥ ${tv % 10}`}. The embedded PTX is never used here.`
        : out === 'jit'
          ? `The SASS cannot load on ${g.cc}, but the PTX can be compiled for it: the driver JIT-compiles <code>compute_${tname}</code> into SASS for ${g.cc} at load time. This is how a build from years ago runs on a GPU that did not exist then, as long as the PTX was shipped.`
          : `Neither part fits: CC ${g.cc} ${g.v < tv ? `is older than ${ccName(tv)}` : `is not ${ccName(tv)}, the only target of an a-suffixed build`}. To support it, build for it too (nvcc accepts several <code style="white-space:nowrap">-gencode</code> targets in one fat binary).`);
      if (tv === 70) f.why.insertAdjacentHTML('beforeend', ' (An <code>sm_70</code> build needs CUDA 12.x or older: CUDA 13 can no longer target Volta.)');
    }
    GG.ui.seg(f.controls, { label: 'nvcc -arch=', value: st.b, options: BUILDS.map(([v, x], i) => ({ value: i, label: 'sm_' + v + x })), onChange: (v) => { st.b = v; render(); } });
    GG.ui.seg(f.controls, { label: 'GPU', value: st.g, options: GPUS.map((g, i) => ({ value: i, label: g.cc, title: g.arch + ' · ' + g.ex })), onChange: (v) => { st.g = v; render(); } });
    const sRes = GG.ui.stat(f.readouts, { label: 'at load time', value: '' });
    render();
  }

  GG.entry('compute-capability', {
    render(body, ctx) {
      const s = ctx.html(body, `
<p>Not every instruction in the ${T('parallel-thread-execution', 'Parallel Thread Execution')} instruction set works on every physical GPU. A newer GPU may have instructions an older one lacks, like Hopper’s warpgroup matrix multiplies. The versioning system used to abstract away details of physical GPUs from the instruction set and ${T('nvcc', 'compiler')} is called “Compute Capability”.</p>
<h3>Major and minor</h3>
<p>Most compute capability version numbers have two components: a major version and a minor version. (A GPU’s own compute capability is always just major.minor: an H100 reports 9.0. The letter suffixes below, as in <code>9.0a</code> or <code>10.0f</code>, belong to compilation targets, and select extra, less portable feature sets on such GPUs.) In 9.0, the H100’s compute capability, 9 is the major version and 0 the minor version. The major version usually changes with a new GPU architecture generation, and the minor version marks smaller steps within one, but not always: Ada Lovelace (8.9) shares major version 8 with Ampere (8.0, 8.6), and Blackwell spans 10.x, 11.0 and 12.x. (Compute capability is not the CUDA Toolkit version: CUDA 12 and CUDA 13 both compile for compute capability 9.0.)</p>
<p>NVIDIA promises forward compatibility (old ${T('parallel-thread-execution', 'PTX')} code runs on new GPUs) across both major and minor versions following the ${X(CC_LINKS.onion, 'onion layer')} model. Each new version wraps the previous one like a layer of an onion: it keeps every feature of the versions inside it and adds some of its own. Code that needs a layer runs on that layer and on every layer outside it. Fig. 1 draws the onion.</p>
<div data-slot="onion" class="wide"></div>
<h3>Two exceptions: a and f</h3>
<p>With Hopper, NVIDIA introduced an additional version suffix, the <code>a</code> in <code>9.0a</code>, which includes features that deviate from the onion model: their future compatibility is not guaranteed, even within major versions. Pick <b>9.0</b> and <b>a</b> in Fig. 1: the hatched wedge belongs to one ring only. Some of the Hopper features that, per the ${T('parallel-thread-execution', 'PTX')} entry, needed in-line PTX at the time of writing are <code>a</code>-only, like <code>wgmma</code>; the TMA’s bulk tensor copies (<code>cp.async.bulk.tensor</code>), by contrast, work on plain 9.0.</p>
<p>With Blackwell, NVIDIA introduced yet another version suffix, the <code>f</code> in <code>10.0f</code>, which also deviates from the onion model, and is closer to ${X(CC_LINKS.semver, 'SemVer')}: compatibility is guaranteed across minor versions but not major versions. Semantic Versioning numbers releases MAJOR.MINOR.PATCH and promises that a minor bump adds features without breaking anything, while a major bump may break things. So code built for <code>10.0f</code> keeps working on the 10.x GPUs at or after 10.0, and makes no promise for 11.0 or 12.0.</p>
${GG.noteHTML('beyond', `<p><b>The exact rules today.</b> NVIDIA’s ${X(CC_LINKS.cpgCC, 'Programming Guide')} (CUDA 13.x) is stricter than “not guaranteed”: code compiled for an <code>a</code> target such as <code>compute_90a</code> runs only on devices of exactly that compute capability. For <code>f</code> targets it lists the members of each family: <code>compute_100f</code> runs on 10.0 and 10.3 (and newer 10.x parts), <code>compute_103f</code> on 10.3 and up within 10.x, <code>compute_110f</code> on 11.0, <code>compute_120f</code> on 12.0 and 12.1, <code>compute_121f</code> on 12.1. A family target’s feature set is a superset of the plain target’s. Figs. 1 and 2 follow these rules.</p>`)}
<h3>Virtual and physical architectures</h3>
<p>Target compute capabilities for ${T('parallel-thread-execution', 'PTX')} compilation can be specified when invoking <code>nvcc</code>, the ${T('nvcc', 'NVIDIA CUDA Compiler Driver')}. By default, the compiler will also generate optimized ${T('streaming-assembler', 'SASS')} for the matching ${T('streaming-multiprocessor-architecture', 'Streaming Multiprocessor (SM) architecture')}. The ${X(CC_LINKS.virt, 'documentation')} for ${T('nvcc', '<code>nvcc</code>')} refers to compute capability as a “virtual GPU architecture”, in contrast to the “physical GPU architecture” expressed by the ${T('streaming-multiprocessor', 'SM')} version. The two are spelled alike: <code>compute_90</code> is the virtual architecture, PTX for compute capability 9.0; <code>sm_90</code> is the physical one, SASS for SM architecture 9.0.</p>
<div data-slot="cmd"></div>
<p>The two kinds of code age differently. PTX can be compiled again, later, for whatever GPU is present; SASS is already machine code for one SM architecture. Switch between them in Fig. 2.</p>
<div data-slot="mx" class="wide"></div>
<p>Which of the two does a GPU actually use? When a program loads its kernels, the driver looks in the executable’s fat binary for SASS it can load as is, and falls back to JIT-compiling the PTX. Fig. 3 follows one build onto one GPU.</p>
<div data-slot="ld" class="wide"></div>
<h3>What a compute capability tells you</h3>
<p>The technical specifications for each compute capability version can be found in the ${X(CC_LINKS.cpg, 'Compute Capability section of the NVIDIA CUDA C Programming Guide')}. A compute capability is more than a version label: it fixes how many warps and blocks an SM can hold, how much shared memory a block can get, and which features exist at all. Fig. 4 walks through the versions.</p>
<div data-slot="nums" class="wide"></div>
<div data-slot="read"></div>`);
      guard(s.onion, 'Onion model', () => onionFigure(s.onion, ctx));
      ctx.code(s.cmd, { lang: 'shell', langLabel: 'shell · beyond the glossary', caption: 'from NVIDIA’s nvcc documentation', code: `nvcc -arch=sm_90 x.cu
# is shorthand for
nvcc --gpu-architecture=compute_90 --gpu-code=sm_90,compute_90 x.cu`, notes: {
        1: '<code>-arch=sm_90</code>: the everyday way to ask for Hopper.',
        3: '<code>--gpu-architecture=compute_90</code> picks the <b>virtual</b> architecture the PTX is written for. <code>--gpu-code=sm_90,compute_90</code> embeds SASS for the <b>physical</b> architecture sm_90, which loads directly on 9.0 GPUs, plus the PTX itself, which the driver can JIT-compile for later GPUs.' }, noteDefault: 'Hover or tap a line. The nvcc entry has a full fat-binary builder.' });
      guard(s.mx, 'Compatibility matrix', () => ccMatrix(s.mx, ctx));
      guard(s.ld, 'Load-time decision', () => loadFigure(s.ld, ctx));
      guard(s.nums, 'Specifications', () => specFigure(s.nums, ctx));
      ctx.reading(s.read, [
        { href: CC_LINKS.onion, label: 'PTX ISA: the .target directive', note: 'the onion layer model of PTX versions' },
        { href: CC_LINKS.semver, label: 'Semantic Versioning 2.0.0', note: 'MAJOR.MINOR.PATCH' },
        { href: CC_LINKS.virt, label: 'nvcc documentation: virtual architectures', note: '“virtual” vs “physical” GPU architectures' },
        { href: CC_LINKS.cpg, label: 'CUDA C Programming Guide', note: 'the Compute Capability section and per-version specifications' },
        { href: CC_LINKS.cpgCC, label: 'CUDA Programming Guide: Compute Capabilities (appendix)', note: 'architecture- and family-specific targets (beyond the glossary)' },
      ]);
    },
  });

})();
