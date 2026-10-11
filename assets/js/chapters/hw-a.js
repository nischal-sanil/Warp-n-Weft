/* chapters/hw-a.js: Device Hardware, part A.
   Entries: cuda-device-architecture, streaming-multiprocessor, core, special-function-unit,
            load-store-unit, warp-scheduler, cuda-core.
   Every CSS class here is prefixed "hwa-". */
(function () {
  'use strict';

  GG.css(`
/* ── shared ── */
.hwa-w { position: relative; min-width: 0; }
.hwa-svg { display: block; width: 100%; height: auto; overflow: visible; }
.hwa-legend { display: flex; flex-wrap: wrap; gap: 6px 16px; margin-top: 10px; font: 500 11px/1.4 var(--font-mono); color: var(--ink-2); }
.hwa-legend span { display: inline-flex; align-items: center; gap: 7px; }
.hwa-legend i { width: 11px; height: 11px; border-radius: 3px; flex: none; display: inline-block; }
.hwa-sw-core { background: var(--core); } .hwa-sw-control { background: var(--control); } .hwa-sw-memory { background: var(--memory); }
.hwa-sw-special { background: var(--special); } .hwa-sw-host { background: var(--host); } .hwa-sw-danger { background: var(--danger); }
.hwa-sw-hatch { background: repeating-linear-gradient(135deg, var(--core) 0 2px, rgba(69, 212, 155, 0.18) 2px 5px); box-shadow: inset 0 0 0 1px var(--core); }
.hwa-sw-stripe { background: repeating-linear-gradient(0deg, var(--core) 0 2px, rgba(69, 212, 155, 0.18) 2px 5px); box-shadow: inset 0 0 0 1px var(--core); }
.hwa-sw-idle { background: var(--danger-a); box-shadow: inset 0 0 0 1px rgba(255, 91, 110, 0.7); }
.hwa-sw-ghost { background: transparent; box-shadow: inset 0 0 0 1.5px var(--ink-3); }
.hwa-sw-corea { background: var(--core-a); box-shadow: inset 0 0 0 1px var(--core); }
.hwa-sw-dots { background: radial-gradient(circle, var(--core) 1.1px, transparent 1.5px) 0 0 / 4px 4px, rgba(69, 212, 155, 0.18); box-shadow: inset 0 0 0 1px var(--core); }
.hwa-sw-fixed { background: var(--surface-3); box-shadow: inset 0 0 0 1px var(--ink-3); }
.hwa-sw-memorya { background: rgba(111, 166, 255, 0.28); box-shadow: inset 0 0 0 1px var(--memory); }
.hwa-sw-ink { background: var(--ink-2); }
.hwa-sw-idlered { background: rgba(255, 91, 110, 0.34); box-shadow: inset 0 0 0 1.5px var(--danger); }
.hwa-tag { display: inline-block; font: 600 9.5px/1 var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 5px 2px; border-radius: 4px; border: 1px solid var(--line-2); color: var(--ink-3); vertical-align: 0.15em; white-space: nowrap; }
.hwa-tag.beyond { color: var(--host); border-color: rgba(184, 164, 255, 0.45); }
.hwa-tag.gl { color: var(--core); border-color: rgba(69, 212, 155, 0.45); }
.hwa-k { font: 500 10px/1.3 var(--font-mono); letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-3); }
.fig-why code, .hwa-panel code { font-size: 0.88em; padding: 0.08em 0.35em; border-radius: 4px; background: var(--surface-3); color: var(--ink); overflow-wrap: anywhere; }
.entry-body.hwa-body :not(pre) > code { white-space: normal; overflow-wrap: anywhere; }
.hwa-panel { border: 1px solid var(--line); border-radius: 12px; background: rgba(8, 9, 14, 0.5); padding: 10px 12px 12px; min-width: 0; }
.hwa-hot { cursor: help; }
.hwa-svg .hwa-dim { opacity: 0.22; transition: opacity 0.3s; }
.hwa-svg .hwa-lit { opacity: 1; transition: opacity 0.3s; }
.hwa-svg g[data-k] { transition: opacity 0.3s; }

/* ── CUDA (Device Architecture) · three meanings, drawn as a stack of layers ── */
.hwa-three { display: grid; grid-template-columns: minmax(0, 1fr); gap: 0; max-width: 760px; margin: 0 auto; }
.hwa-mean {
  display: grid; grid-template-columns: 150px minmax(0, 1fr); grid-template-rows: auto 1fr; column-gap: 16px; row-gap: 4px;
  text-align: left; cursor: pointer; min-width: 0; align-items: start;
  border: 1px solid var(--line-2); border-radius: 12px; background: rgba(8, 9, 14, 0.55); padding: 10px 14px 12px;
  color: var(--ink-2); font: 13.5px/1.5 var(--font-body); transition: border-color 0.2s, box-shadow 0.2s, opacity 0.2s;
}
.hwa-mean:hover { border-color: var(--ink-3); }
.hwa-mean[aria-pressed="true"] { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent), 0 0 0 5px var(--accent-a); background: rgba(20, 22, 34, 0.9); }
.hwa-mean[aria-pressed="false"] { opacity: 0.8; }
.hwa-mean svg { display: block; width: 100%; height: 70px; grid-row: span 2; align-self: center; }
.hwa-mean b { font: 600 12px/1.3 var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink); }
.hwa-mean b em { font-style: normal; color: var(--ink-3); margin-right: 6px; }
.hwa-arr { display: flex; align-items: center; gap: 10px; height: 34px; padding-left: 82px; font: 500 11px/1.2 var(--font-mono); color: var(--ink-3); letter-spacing: 0.04em; }
.hwa-arr i { position: relative; width: 2px; height: 100%; background: var(--ink-3); flex: none; }
.hwa-arr i::after { content: ""; position: absolute; left: -4px; bottom: 0; border: 5px solid transparent; border-top: 7px solid var(--ink-3); border-bottom: 0; }
@media (max-width: 640px) {
  .hwa-mean { grid-template-columns: 88px minmax(0, 1fr); column-gap: 12px; padding: 9px 11px 11px; }
  .hwa-mean svg { height: 58px; }
  .hwa-mean .hwa-ic-word { display: none; }
  .hwa-arr { padding-left: 52px; height: 30px; font-size: 10.5px; }
}

/* ── CUDA (Device Architecture) · utilisation toy ── */
.hwa-ut-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 14px; }
.hwa-ut-row.narrow { grid-template-columns: minmax(0, 1fr); }
`);

  /* ───────────── helpers ───────────── */
  const el = GG.el;
  const esc = GG.esc;
  const fmt = GG.fmt;
  const S = (tag, attrs, parent) => GG.svg(tag, attrs, parent);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const TERMS = {};
  (window.GG_TERMS || []).forEach((t) => { TERMS[t.id] = t; });

  /* Cross-link HTML, already decorated, so it also works in content written after boot (why-lines). */
  function T(id, text) {
    const t = TERMS[id];
    if (!t) console.warn('[hw-a] unknown term', id);
    const color = t ? (GG.SECTIONS[t.section] || GG.SECTIONS.intro).color : 'var(--accent)';
    return `<a data-term="${id}" href="#${id}" class="term" style="--c:${color}">${text == null ? (t ? esc(t.name) : id) : text}</a>`;
  }
  /* External link HTML, already decorated. */
  function X(href, text) { return `<a href="${href}" class="ext" target="_blank" rel="noopener noreferrer">${text}</a>`; }

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
      console.error('[hw-a] ' + label + ' failed', e);
      if (parent) parent.insertAdjacentHTML('beforeend', `<div class="entry-error">${esc(label)} could not be drawn: ${esc(e && e.message)}</div>`);
      return null;
    }
  }

  function svgRoot(host, w, h, label) {
    const svg = S('svg', { class: 'hwa-svg', viewBox: `0 0 ${w} ${h}`, role: 'img', 'aria-label': label });
    host.append(svg);
    return svg;
  }
  /* SVG text. o: {fill, size, weight, anchor, family, ls, cls, rotate} */
  function tx(parent, x, y, text, o = {}) {
    const a = {
      x, y, fill: o.fill || 'var(--ink-2)', 'font-size': o.size || 11, 'font-family': o.family || 'var(--font-mono)',
      'text-anchor': o.anchor || 'start', 'dominant-baseline': o.base || 'middle',
    };
    if (o.weight) a['font-weight'] = o.weight;
    if (o.ls) a['letter-spacing'] = o.ls;
    if (o.cls) a.class = o.cls;
    if (o.rotate) a.transform = `rotate(${o.rotate} ${x} ${y})`;
    if (o.opacity != null) a['fill-opacity'] = o.opacity;
    const t = S('text', a, parent);
    t.textContent = text;
    return t;
  }
  function rect(parent, x, y, w, h, o = {}) {
    return S('rect', { x, y, width: Math.max(0, w), height: Math.max(0, h), rx: o.rx == null ? 3 : o.rx, fill: o.fill || 'none', stroke: o.stroke || 'none', 'stroke-width': o.sw || 1, 'stroke-dasharray': o.dash || null, class: o.cls || null, opacity: o.opacity == null ? null : o.opacity }, parent);
  }
  function line(parent, pts, o = {}) {
    return S('polyline', { points: pts.map((p) => p.join(',')).join(' '), fill: 'none', stroke: o.stroke || 'var(--ink-3)', 'stroke-width': o.sw || 1.2, 'stroke-dasharray': o.dash || null, 'marker-end': o.arrow ? `url(#${o.arrow})` : null, 'stroke-linejoin': 'round', class: o.cls || null }, parent);
  }
  /* <defs> with an arrow head marker, a diagonal hatch and a horizontal stripe pattern; returns their ids. */
  function defs(svg, color) {
    const d = S('defs', {}, svg);
    const id = GG.uid('hwa');
    const m = S('marker', { id: id + '-a', viewBox: '0 0 8 8', refX: 7, refY: 4, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, d);
    S('path', { d: 'M0,0 L8,4 L0,8 z', fill: color || 'var(--ink-3)' }, m);
    const p = S('pattern', { id: id + '-h', width: 5, height: 5, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, d);
    S('rect', { width: 5, height: 5, fill: 'rgba(69, 212, 155, 0.18)' }, p);
    S('rect', { width: 2, height: 5, fill: 'var(--core)' }, p);
    const q = S('pattern', { id: id + '-s', width: 5, height: 5, patternUnits: 'userSpaceOnUse' }, d);
    S('rect', { width: 5, height: 5, fill: 'rgba(69, 212, 155, 0.18)' }, q);
    S('rect', { width: 5, height: 2, fill: 'var(--core)' }, q);
    const o = S('pattern', { id: id + '-d', width: 4, height: 4, patternUnits: 'userSpaceOnUse' }, d);
    S('rect', { width: 4, height: 4, fill: 'rgba(69, 212, 155, 0.18)' }, o);
    S('circle', { cx: 2, cy: 2, r: 1.1, fill: 'var(--core)' }, o);
    return { arrow: id + '-a', hatch: `url(#${id}-h)`, stripe: `url(#${id}-s)`, dots: `url(#${id}-d)`, d };
  }
  function polyLen(pts) { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; }
  function pointAt(pts, d) {
    for (let i = 1; i < pts.length; i++) {
      const s = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      if (d <= s || i === pts.length - 1) { const f = s ? clamp(d / s, 0, 1) : 0; return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f]; }
      d -= s;
    }
    return pts[pts.length - 1];
  }
  /* Packets that travel along polylines (a pool of circles, no per-frame DOM creation). */
  function packets(parent, o = {}) {
    const g = S('g', { 'aria-hidden': 'true' }, parent);
    let routes = [], pool = [], per = o.per || 3;
    const api = {
      g,
      set(rs, color, stroke) {
        routes = rs.map((pts) => ({ pts, L: polyLen(pts) }));
        const need = routes.length * per;
        while (pool.length < need) pool.push(S('circle', { r: o.r || 3.2, fill: 'var(--core)' }, g));
        pool.forEach((c, i) => { c.style.display = i < need ? '' : 'none'; c.setAttribute('fill', color || 'var(--core)'); c.setAttribute('stroke', stroke || 'none'); c.setAttribute('stroke-width', stroke ? 1.2 : 0); });
        api.tick(0);
      },
      tick(t) {
        const speed = o.speed || 140;
        routes.forEach((r, k) => {
          for (let j = 0; j < per; j++) {
            const c = pool[k * per + j];
            const d = ((t * speed + (j / per) * r.L) % r.L + r.L) % r.L;
            const [x, y] = pointAt(r.pts, d);
            c.setAttribute('cx', x.toFixed(1)); c.setAttribute('cy', y.toFixed(1));
            const edge = Math.min(d, r.L - d);
            c.setAttribute('opacity', clamp(edge / 18, 0, 1).toFixed(2));
          }
        });
      },
    };
    return api;
  }
  const P = () => GG.components.sm.byKey;

  /* ═════════════════════════════ CUDA (Device Architecture) ═════════════════════════════ */

  /* Fig: the three things called "CUDA", as layers: what you write, what turns it into work, what runs it */
  function threeMeanings(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Three things called “CUDA”', hint: 'pick a layer', wide: true,
      caption: 'One word, three layers, numbered as in the list above. Programs are written in the programming model; the software platform (compiler, libraries, runtime, driver) turns those programs into work on the device; the device architecture is the hardware design that runs it. Only the hardware is drawn in green, the colour this site uses for compute units.',
    });
    const MEAN = [
      { id: 'model', n: 2, name: 'Programming model', line: 'A parallel programming model for architectures with that design: what programs are written in.',
        why: `<b>CUDA, the programming model</b>: the abstractions programs are written in, for architectures with this design. ${T('thread', 'Threads')} are grouped into ${T('thread-block', 'thread blocks')} and blocks into ${T('thread-block-grid', 'grids')}, with matching levels of memory. See ${T('cuda-programming-model', 'CUDA Programming Model')}.` },
      { id: 'sw', n: 3, name: 'Software platform', line: 'Software that extends high-level languages like C to add that programming model, and gets the programs onto the device.',
        why: `<b>CUDA, the software platform</b>: the compiler, libraries, runtime and drivers that extend high-level languages like C (as ${T('cuda-c', 'CUDA C++')}) to add the programming model, and turn the resulting programs into work on the device. See ${T('cuda-software-platform', 'CUDA Software Platform')}.` },
      { id: 'arch', n: 1, name: 'Device architecture', line: 'A high-level hardware design: many identical, general-purpose processors. The subject of this entry.',
        why: `<b>CUDA, the device architecture</b>, the subject of this entry: GPUs built from many identical ${T('streaming-multiprocessor', 'Streaming Multiprocessors')} that can each run any kind of work, in place of a pipeline of specialised units. The name says it: a <em>compute unified</em> device architecture. It is the bottom layer: everything above ends up as instructions running on it.` },
    ];
    const ARR = ['compiled and launched by', 'runs on'];
    const wrap = el('div', { class: 'hwa-three', role: 'group', 'aria-label': 'Three meanings of CUDA, as a stack of layers' });
    f.stage.append(wrap);
    const btns = MEAN.map((m, i) => {
      const b = el('button', { type: 'button', class: 'hwa-mean' });
      b.append(icon(m.id));
      b.append(el('b', { html: `<em>${m.n}</em>${esc(m.name)}` }), el('span', { text: m.line }));
      b.addEventListener('click', () => pick(m.id));
      wrap.append(b);
      if (i < ARR.length) wrap.append(el('div', { class: 'hwa-arr', 'aria-hidden': 'true' }, el('i'), el('span', { text: ARR[i] })));
      return [m, b];
    });
    function icon(id) {
      const svg = S('svg', { viewBox: '0 0 120 70', 'aria-hidden': 'true', preserveAspectRatio: 'xMidYMid meet' });
      if (id === 'arch') {
        for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) {
          rect(svg, 6 + c * 18.5, 4 + r * 21, 15, 17, { fill: 'var(--core-a)', stroke: 'var(--core)', rx: 2 });
          rect(svg, 9 + c * 18.5, 7 + r * 21, 9, 3, { fill: 'var(--core)', rx: 1, opacity: 0.6 });
        }
      } else if (id === 'model') {
        // a grid of thread blocks, each holding threads (wavy lines): abstractions, drawn in neutral ink
        rect(svg, 4, 3, 112, 64, { stroke: 'var(--ink-3)', rx: 6, dash: '3 3' });
        tx(svg, 9, 11, 'grid', { size: 8.5, fill: 'var(--ink-3)', cls: 'hwa-ic-word' });
        for (let b = 0; b < 3; b++) {
          const x = 12 + b * 35;
          rect(svg, x, 16, 28, 46, { stroke: 'var(--ink-2)', fill: 'rgba(255,255,255,0.04)', rx: 4 });
          for (let s2 = 0; s2 < 4; s2++) {
            const sx = x + 5 + s2 * 6;
            S('path', { d: `M${sx},20 q3,6 0,10 q-3,6 0,10 q3,6 0,10 q-3,5 0,8`, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 1.1, 'stroke-opacity': 0.75 }, svg);
          }
        }
      } else {
        const L = ['CUDA C++', 'libraries', 'runtime', 'driver'];
        L.forEach((t, i) => {
          rect(svg, 12 + i * 4, 3 + i * 16.5, 96 - i * 8, 14, { fill: 'var(--surface-3)', stroke: 'var(--ink-3)', rx: 3 });
          tx(svg, 60, 10.5 + i * 16.5, t, { size: 9.5, anchor: 'middle', fill: 'var(--ink)', cls: 'hwa-ic-word' });
        });
      }
      return svg;
    }
    function pick(id) {
      btns.forEach(([m, b]) => b.setAttribute('aria-pressed', String(m.id === id)));
      f.setWhy(MEAN.find((m) => m.id === id).why);
    }
    pick('arch');
  }

  /* Fig: G71, a fixed-pipeline device architecture */
  function g71Figure(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Before: a fixed pipeline (G71)', hint: 'follow a kind of work · hover a block', wide: true,
      caption: `A diagram of a fixed-pipeline device architecture (G71), redrawn from the glossary’s figure, which it adapted from ${X('https://fabiensanglard.net/cuda/', 'Fabien Sanglard’s blog')}. Note the presence of a separate group of processors for handling fragment and vertex shading. (The glossary’s drawing labels the top box “Vertex Shader Int”; we read it as “Inst”, matching “Fragment Shader Inst”.)`,
    });
    const host = el('div', { class: 'hwa-w' });
    f.stage.append(host);
    const legend = el('div', { class: 'hwa-legend', html: '<span><i class="hwa-sw-hatch"></i>vertex shader processors (VS) and vertex work</span><span><i class="hwa-sw-core"></i>fragment shader processors (FS) and fragment work</span><span><i class="hwa-sw-memory"></i>caches and buffers</span><span><i class="hwa-sw-ghost"></i>fixed-function units, including the 16 output units (ROP)</span>' });
    f.stage.append(legend);
    let mode = 'all', items = [], pk = null, hover = null, Dg = null;
    const DESC = {
      vsi: '<b>Vertex Shader Inst.</b> The front of the vertex stage: it hands vertex work to the vertex shaders below, and to nothing else.',
      vs: '<b>Vertex Shader</b> × 8. Processors that run the vertex shader, the small program that positions each vertex (corner of a triangle). They can only do vertex work.',
      ccs: '<b>Cull / Clip / Setup.</b> Fixed-function hardware: drops triangles that cannot be seen, clips the ones that cross the edge of the screen and sets them up to be turned into fragments.',
      zc: '<b>Z-Cull.</b> Fixed-function hardware that throws away fragments the depth (Z) buffer says are hidden, before they are shaded. The long line feeds it from the Z-Buffer.',
      fsi: '<b>Fragment Shader Inst.</b> The front of the fragment stage: it hands fragment work to the 24 fragment shaders, and to nothing else.',
      fs: '<b>Fragment Shader</b> × 24. Processors that run the fragment shader, which computes the colour of each fragment (a candidate pixel). They can only do fragment work.',
      tex: '<b>L2 Tex.</b> A texture cache shared by the fragment shaders, which read textures (images) while they shade.',
      xbar: '<b>Fragment Crossbar.</b> Routes shaded fragments to the output units.',
      rop: '<b>Output units</b> × 16 (raster operation units, ROPs), the tall blocks standing over the two buffers. Fixed-function hardware that writes each fragment’s depth into the Z-Buffer and its colour into the RGB Buffer.',
      zb: '<b>Z-Buffer.</b> Memory holding the depth of the nearest surface at each pixel.',
      rgb: '<b>RGB Buffer.</b> Memory holding the colour of each pixel: the image.',
    };
    const MODES = {
      vertex: ['vsi', 'vs', 'ccs'],
      fragment: ['zc', 'fsi', 'fs', 'tex', 'xbar', 'rop', 'zb', 'rgb'],
      all: null,
    };
    const statV = GG.ui.stat(f.readouts, { label: 'vertex shaders', value: 8, tone: 'core' });
    const statF = GG.ui.stat(f.readouts, { label: 'fragment shaders', value: 24, tone: 'core' });
    const statS = GG.ui.stat(f.readouts, { label: 'can run this work', value: '—' });
    GG.ui.seg(f.controls, {
      label: 'Follow', value: 'all', onChange: (v) => { mode = v; apply(); },
      options: [{ value: 'vertex', label: 'vertex work' }, { value: 'fragment', label: 'fragment work' }, { value: 'all', label: 'everything' }],
    });
    void statV; void statF;

    function draw(W) {
      host.innerHTML = '';
      items = [];
      const narrow = W < 640;
      const sx = narrow ? 1 : W / 1400;
      const H = narrow ? 560 : Math.round(765 * sx);
      const svg = svgRoot(host, W, H, 'A fixed-pipeline GPU (G71): 8 vertex shader processors, then cull/clip/setup, then 24 fragment shader processors sharing an L2 texture cache, then a fragment crossbar to 16 output units writing a Z-buffer and an RGB buffer. Each group of processors can do only its own stage of work.');
      const D = defs(svg);
      Dg = D;
      const add = (k, g) => { g.setAttribute('data-k', k); g.classList.add('hwa-hot'); items.push({ k, g }); g.addEventListener('mouseenter', () => { hover = k; f.setWhy(DESC[k]); }); g.addEventListener('mouseleave', () => { hover = null; apply(); }); return g; };
      const bar = (k, x, y, w, h, label, o = {}) => {
        const g = add(k, S('g', {}, svg));
        rect(g, x, y, w, h, { fill: o.fill || 'var(--surface-2)', stroke: o.stroke || 'var(--line-2)', rx: 4 });
        if (label) tx(g, o.lx != null ? o.lx : x + w / 2, y + h / 2, label, { anchor: o.anchor || 'middle', size: o.size || (narrow ? 10.5 : 12), fill: o.tfill || 'var(--ink)' });
        return g;
      };
      const cellLab = (g, x, y, w, h, l1, l2, short) => {
        if (w >= 56 && l1) { tx(g, x + w / 2, y + h / 2 - 7, l1, { anchor: 'middle', size: 10.5, fill: 'var(--ink)' }); tx(g, x + w / 2, y + h / 2 + 7, l2, { anchor: 'middle', size: 10.5, fill: 'var(--ink)' }); }
        else tx(g, x + w / 2, y + h / 2, short, { anchor: 'middle', size: 10, fill: 'var(--ink)', weight: 600 });
      };
      const shortLabels = narrow || 1400 * sx * 104 / 1400 < 62;
      if (narrow) {
        const M = 8, cw = W - 2 * M;
        const bw = Math.min(250, cw * 0.72), bx = (W - bw) / 2;
        const cx = W / 2;
        let y = 6;
        bar('vsi', bx, y, bw, 26, 'Vertex Shader Inst');
        line(svg, [[cx, y + 26], [cx, y + 38]]);
        y += 38;
        const vw = (cw - 7 * 4) / 8;
        line(svg, [[M + vw / 2, y], [W - M - vw / 2, y]]);
        const gV = add('vs', S('g', {}, svg));
        for (let i = 0; i < 8; i++) {
          const x = M + i * (vw + 4);
          line(svg, [[x + vw / 2, y], [x + vw / 2, y + 6]]);
          rect(gV, x, y + 6, vw, 34, { fill: D.hatch, stroke: 'var(--core)', rx: 3 });
          cellLab(gV, x, y + 6, vw, 34, '', '', 'VS');
        }
        line(svg, [[M + vw / 2, y + 46], [W - M - vw / 2, y + 46]]);
        line(svg, [[cx, y + 46], [cx, y + 58]]);
        y += 58;
        bar('ccs', bx, y, bw, 26, 'Cull / Clip / Setup', { stroke: 'var(--ink-3)' });
        line(svg, [[cx, y + 26], [cx, y + 38]]);
        y += 38;
        const zw = cw * 0.3;
        bar('fsi', M + zw + 16, y, cw - zw - 16, 26, 'Fragment Shader Inst');
        bar('zc', M + 14, y, zw - 14, 26, 'Z-Cull', { stroke: 'var(--ink-3)' });
        line(svg, [[M + zw, y + 13], [M + zw + 14, y + 13]], { arrow: D.arrow });
        const yZc = y + 13;
        line(svg, [[cx + zw / 2 + 8, y + 26], [cx + zw / 2 + 8, y + 36]]);
        y += 36;
        // 24 fragment shaders: 4 rows of 6, groups of 2 × 2, L2 Tex between rows 2 and 3
        const fw = (cw - 14 - 5 * 4) / 6, fh = 30, gx0 = M + 14;
        line(svg, [[gx0 + fw, y], [gx0 + 5 * (fw + 4) - 4 - fw + fw, y]]);
        const gF = add('fs', S('g', {}, svg));
        const rowsY = [y + 6, y + 6 + fh + 3, y + 6 + 2 * fh + 3 + 24, y + 6 + 3 * fh + 6 + 24];
        for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) {
          const x = gx0 + c * (fw + 4);
          rect(gF, x, rowsY[r], fw, fh, { fill: 'var(--core-a)', stroke: 'var(--core)', rx: 3 });
          cellLab(gF, x, rowsY[r], fw, fh, '', '', 'FS');
        }
        for (let gi = 0; gi < 3; gi++) {
          const gcx = gx0 + gi * 2 * (fw + 4) + fw + 2;
          line(svg, [[gcx, y], [gcx, y + 6]]);
        }
        const gT = add('tex', S('g', {}, svg));
        rect(gT, gx0 - 4, rowsY[1] + fh + 5, cw - 10, 14, { fill: 'var(--memory-a)', stroke: 'var(--memory)', rx: 3 });
        tx(gT, gx0 - 4 + (cw - 10) / 2, rowsY[1] + fh + 12, 'L2 Tex', { anchor: 'middle', size: 9.5, fill: 'var(--memory)' });
        const yb = rowsY[3] + fh + 6;
        line(svg, [[gx0 + fw + 2, yb], [gx0 + 4 * (fw + 4) + fw + 2, yb]]);
        for (let gi = 0; gi < 3; gi++) { const gcx = gx0 + gi * 2 * (fw + 4) + fw + 2; line(svg, [[gcx, yb - 6], [gcx, yb]]); }
        line(svg, [[cx + 7, yb], [cx + 7, yb + 12]]);
        y = yb + 12;
        bar('xbar', bx, y, bw, 26, 'Fragment Crossbar', { stroke: 'var(--ink-3)' });
        line(svg, [[cx, y + 26], [cx, y + 50]]);
        y += 36;
        tx(svg, M + 14, y + 6, 'output units (ROP) × 16', { size: 9, fill: 'var(--ink-2)' });
        y += 14;
        const gZ = add('zb', S('g', {}, svg));
        rect(gZ, M + 14, y + 10, cw - 14, 22, { fill: 'var(--memory-a)', stroke: 'var(--memory)', rx: 3 });
        tx(gZ, M + 18, y + 21, 'Z-Buffer', { size: 9, fill: 'var(--memory)' });
        const gR = add('rgb', S('g', {}, svg));
        rect(gR, M + 14, y + 36, cw - 14, 22, { fill: 'var(--memory-a)', stroke: 'var(--memory)', rx: 3 });
        tx(gR, W - M - 4, y + 47, 'RGB Buffer', { size: 9, fill: 'var(--memory)', anchor: 'end' });
        const gO = add('rop', S('g', {}, svg));
        const ox0 = M + 14 + 56, ox1 = W - M - 66, ow = (ox1 - ox0 - 15 * 2) / 16;
        for (let i = 0; i < 16; i++) rect(gO, ox0 + i * (ow + 2), y + 4, ow, 60, { fill: 'var(--surface-3)', stroke: 'var(--ink-3)', rx: 1.5 });
        line(svg, [[M + 14, y + 21], [M + 2, y + 21], [M + 2, yZc], [M + 12, yZc]], { arrow: D.arrow });
        svg.setAttribute('viewBox', `0 0 ${W} ${y + 74}`);
      } else {
        const X0 = (v) => v * sx, Y0 = (v) => v * sx;
        bar('vsi', X0(568), Y0(30), X0(310), Y0(36), 'Vertex Shader Inst');
        line(svg, [[X0(723), Y0(66)], [X0(723), Y0(91)]]);
        const vx = (i) => 346 + i * 96.3;
        line(svg, [[X0(vx(0) + 41), Y0(91)], [X0(vx(7) + 41), Y0(91)]]);
        line(svg, [[X0(vx(0) + 41), Y0(183)], [X0(vx(7) + 41), Y0(183)]]);
        const gV = add('vs', S('g', {}, svg));
        for (let i = 0; i < 8; i++) {
          line(svg, [[X0(vx(i) + 41), Y0(91)], [X0(vx(i) + 41), Y0(109)]]);
          line(svg, [[X0(vx(i) + 41), Y0(165)], [X0(vx(i) + 41), Y0(183)]]);
          rect(gV, X0(vx(i)), Y0(109), X0(82), Y0(56), { fill: D.hatch, stroke: 'var(--core)', rx: 3 });
          const g2 = S('g', {}, gV);
          rect(g2, X0(vx(i)) + 4, Y0(109) + 6, X0(82) - 8, Y0(56) - 12, { fill: 'rgba(10, 11, 18, 0.82)', rx: 3 });
          cellLab(g2, X0(vx(i)), Y0(109), X0(82), Y0(56), 'Vertex', 'Shader', 'VS');
        }
        line(svg, [[X0(723), Y0(183)], [X0(723), Y0(209)]]);
        bar('ccs', X0(568), Y0(209), X0(312), Y0(36), 'Cull / Clip / Setup', { stroke: 'var(--ink-3)' });
        line(svg, [[X0(723), Y0(245)], [X0(723), Y0(270)]]);
        bar('zc', X0(219), Y0(270), X0(311), Y0(37), 'Z-Cull', { stroke: 'var(--ink-3)' });
        bar('fsi', X0(568), Y0(270), X0(312), Y0(37), 'Fragment Shader Inst');
        line(svg, [[X0(530), Y0(289)], [X0(566), Y0(289)]], { arrow: D.arrow });
        line(svg, [[X0(723), Y0(307)], [X0(723), Y0(340)]]);
        const fx = (c) => 75 + c * 109.4 + (c % 2 ? -5 : 0);
        const fw = 104, fy = [366, 456], fh = 56;
        const gcx = (gi) => X0(fx(gi * 2) + fw);
        line(svg, [[gcx(0), Y0(340)], [gcx(5), Y0(340)]]);
        line(svg, [[gcx(0), Y0(532)], [gcx(5), Y0(532)]]);
        for (let gi = 0; gi < 6; gi++) { line(svg, [[gcx(gi), Y0(340)], [gcx(gi), Y0(366)]]); line(svg, [[gcx(gi), Y0(512)], [gcx(gi), Y0(532)]]); }
        const gT = add('tex', S('g', {}, svg));
        rect(gT, X0(178), Y0(429), X0(1092), Y0(20), { fill: 'var(--memory-a)', stroke: 'var(--memory)', rx: 2 });
        tx(gT, X0(724), Y0(439), 'L2 Tex', { anchor: 'middle', size: 11, fill: 'var(--memory)' });
        const gF = add('fs', S('g', {}, svg));
        for (let r = 0; r < 2; r++) for (let c = 0; c < 12; c++) {
          rect(gF, X0(fx(c)), Y0(fy[r]), X0(fw), Y0(fh), { fill: 'var(--core-a)', stroke: 'var(--core)', rx: 3 });
          cellLab(gF, X0(fx(c)), Y0(fy[r]), X0(fw), Y0(fh), 'Fragment', 'Shader', 'FS');
        }
        line(svg, [[X0(723), Y0(532)], [X0(723), Y0(560)]]);
        bar('xbar', X0(568), Y0(560), X0(312), Y0(37), 'Fragment Crossbar', { stroke: 'var(--ink-3)' });
        line(svg, [[X0(723), Y0(597)], [X0(723), Y0(628)]]);
        const gZ = add('zb', S('g', {}, svg));
        rect(gZ, X0(128), Y0(639), X0(1190), Y0(38), { fill: 'var(--memory-a)', stroke: 'var(--memory)', rx: 2 });
        tx(gZ, X0(136), Y0(658), 'Z-Buffer', { size: 11, fill: 'var(--memory)' });
        const gR = add('rgb', S('g', {}, svg));
        rect(gR, X0(128), Y0(685), X0(1190), Y0(37), { fill: 'var(--memory-a)', stroke: 'var(--memory)', rx: 2 });
        tx(gR, X0(1310), Y0(704), 'RGB Buffer', { size: 11, fill: 'var(--memory)', anchor: 'end' });
        const gO = add('rop', S('g', {}, svg));
        for (let i = 0; i < 16; i++) rect(gO, X0(242 + i * 61.2), Y0(628), X0(54), Y0(96), { fill: 'var(--surface-3)', stroke: 'var(--ink-3)', rx: 2 });
        tx(svg, X0(242), Y0(613), 'output units (ROP) × 16', { size: 11, fill: 'var(--ink-2)' });
        line(svg, [[X0(128), Y0(660)], [X0(46), Y0(660)], [X0(46), Y0(289)], [X0(217), Y0(289)]], { arrow: D.arrow });
      }
      void shortLabels;
      // packets: work entering the selected stage
      pk = packets(svg, { per: 2, r: narrow ? 3.2 : 4.4, speed: narrow ? 70 : 120 });
      apply();
    }
    // fragment packets run down the gap left of each processor and stop at its edge, so they never sit on a label
    function routesFor(m) {
      const out = [];
      const g = (k) => items.filter((it) => it.k === k).map((it) => it.g);
      const centersOf = (k) => {
        const res = [];
        g(k).forEach((gg) => gg.querySelectorAll(':scope > rect').forEach((r) => { const x = +r.getAttribute('x'), y = +r.getAttribute('y'), w = +r.getAttribute('width'), h = +r.getAttribute('height'); res.push([x + w / 2, y + h / 2, y, x]); }));
        return res;
      };
      const src = (k) => { const r = g(k)[0] && g(k)[0].querySelector('rect'); if (!r) return null; return [+r.getAttribute('x') + +r.getAttribute('width') / 2, +r.getAttribute('y') + +r.getAttribute('height')]; };
      if (m === 'vertex') { const s = src('vsi'); if (s) centersOf('vs').forEach((c) => out.push([s, [c[0], c[2] - 4], [c[0], c[2] + 3]])); }
      if (m === 'fragment') { const s = src('fsi'); if (s) centersOf('fs').forEach((c) => out.push([s, [c[3] - 2, s[1] + 8], [c[3] - 2, c[1]], [c[3] + 4, c[1]]])); }
      return out;
    }
    function apply() {
      const set = MODES[mode];
      items.forEach((it) => { it.g.classList.toggle('hwa-dim', !!set && !set.includes(it.k)); });
      if (pk) { if (mode === 'vertex' && Dg) pk.set(routesFor(mode), Dg.hatch, 'var(--core)'); else pk.set(routesFor(mode), 'var(--core)', 'var(--bg)'); }
      if (mode === 'vertex') { statS.set('8 of 32 · 25%', 'danger'); if (!hover) f.setWhy('<b>Vertex work</b> (positioning the corners of triangles) can only run on the <b>8 vertex shaders</b>. While a scene is mostly fragment work, these 8 processors have nothing to do, and the 24 fragment shaders cannot help with vertex work when it piles up.'); }
      else if (mode === 'fragment') { statS.set('24 of 32 · 75%', 'control'); if (!hover) f.setWhy('<b>Fragment work</b> (colouring candidate pixels) can only run on the <b>24 fragment shaders</b>. The split of 8 to 24 was fixed when the chip was designed: a guess at the ratio of vertex to fragment work.'); }
      else { statS.set('its own stage only', null); if (!hover) f.setWhy('Work flows top to bottom through <b>fixed stages</b>, each run by its <b>own kind of hardware</b>: vertex shaders, fixed-function units, fragment shaders, output units. Pick a kind of work to see which processors can run it.'); }
    }
    const anim = GG.anim(f.stage, (t) => { if (pk) pk.tick(t); });
    GG.ui.playButton(f.controls, anim);
    onWidth(host, draw);
  }

  /* Fig: G80, a compute unified device architecture */
  function g80Figure(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'After: a unified architecture (G80)', hint: 'follow a kind of thread · hover a block', wide: true,
      caption: `A diagram of a compute unified device architecture (G80), redrawn from the glossary’s figure, which it modified from ${X('https://www.nvidia.com/content/pdf/fermi_white_papers/p.glaskowsky_nvidia%27s_fermi-the_first_complete_gpu_architecture.pdf', 'Peter Glaskowsky’s 2009 white paper on the Fermi architecture')}. Note the absence of distinct processor types: all meaningful computation occurs in the identical Streaming Multiprocessors in the centre of the diagram (eight blocks, each a Texture/Processor Cluster of two SMs), fed with instructions for vertex, geometry and pixel threads.`,
    });
    const host = el('div', { class: 'hwa-w' });
    f.stage.append(host);
    f.stage.append(el('div', { class: 'hwa-legend', html: '<span><i class="hwa-sw-corea"></i>streaming processors (SP): what NVIDIA later called CUDA Cores</span><span><i class="hwa-sw-special"></i>texture units (TF)</span><span><i class="hwa-sw-fixed"></i>fixed-function units, including the output units (ROP)</span><span><i class="hwa-sw-memory"></i>caches (L1, L2) and frame buffer (FB)</span><span><i class="hwa-sw-control"></i>thread issue and the thread processor</span><span><i class="hwa-sw-host"></i>host</span><span><i class="hwa-sw-hatch"></i>vertex threads</span><span><i class="hwa-sw-stripe"></i>geometry threads</span><span><i class="hwa-sw-dots"></i>pixel threads</span>' }));
    let mode = 'all', items = [], pk = null, D = null, spCells = [], hover = null;
    const DESC = {
      host: '<b>Host.</b> The CPU, sending the GPU its commands and data.',
      ia: '<b>Input Assembler.</b> Gathers vertex data into vertices and hands them on for vertex threads.',
      vtx: '<b>Vtx Thread Issue.</b> Launches vertex threads. They can run on <b>any</b> of the SMs.',
      geom: '<b>Geom Thread Issue.</b> Launches geometry threads onto the <b>same</b> SMs.',
      setup: '<b>Setup / Rstr / ZCull.</b> Fixed-function hardware: sets up triangles, rasterises them into pixels and culls hidden ones by depth.',
      pix: '<b>Pixel Thread Issue.</b> Launches pixel threads onto the <b>same</b> SMs.',
      sm: '<b>The processor array.</b> Eight identical blocks, each a <b>Texture/Processor Cluster (TPC)</b>, as Lindholm et al. call it: two groups of 8 streaming processors (SP), texture units (TF) and an L1 cache. Each group of 8 SPs is one <b>Streaming Multiprocessor</b>, so the array holds 8 TPCs × 2 SMs × 8 SPs = 128 SPs; each SP is what NVIDIA later called a CUDA Core. Every TPC can run vertex, geometry or pixel threads.',
      tp: '<b>Thread Processor.</b> Manages threads across the processor array. Its lines loop back to the geometry and setup stages: work one stage produces on the SMs feeds the next stage.',
      l2: '<b>L2 caches and output units</b>: each grey grid is a group of fixed-function output units (raster operation units, ROPs, as in the G71), paired with an L2 cache in front of each memory partition.',
      fb: '<b>FB</b>, the frame buffer: six partitions of the GPU’s DRAM.',
    };
    const MODES = {
      vtx: { keys: ['host', 'ia', 'vtx', 'sm'], fill: 'hatch', why: '<b>Vertex threads</b> are issued to <b>all 8</b> blocks (TPCs) of the processor array: any streaming processor can position vertices. If a scene has more geometry, more of the array simply works on it.' },
      geom: { keys: ['geom', 'tp', 'sm'], fill: 'stripe', why: '<b>Geometry threads</b> run on the <b>same</b> processors. No new processors were needed for a new kind of shader program, only a new kind of thread (and a unit to issue it, the Geom Thread Issue box).' },
      pix: { keys: ['setup', 'pix', 'tp', 'sm', 'l2', 'fb'], fill: 'dots', why: '<b>Pixel threads</b> run on the <b>same</b> processors too, and their results go out through the L2 caches and output units to the frame buffer. Whatever the mix of work, every processor can take part.' },
      all: { keys: null, fill: 'solid', why: 'The pipeline’s stages are still there (thread issue for vertex, geometry and pixel work), but they all feed the <b>same, identical processors</b> in the centre: 128 streaming processors (SPs), in 16 groups of 8. Each group of 8 is a Streaming Multiprocessor (SM), two SMs share each of the eight blocks (a Texture/Processor Cluster, TPC), and each SP is what NVIDIA later called a CUDA Core. Pick a kind of thread to follow it.' },
    };
    const statN = GG.ui.stat(f.readouts, { label: 'streaming processors', value: '8 TPCs × 2 SMs × 8 SPs = 128', tone: 'core' });
    const statS = GG.ui.stat(f.readouts, { label: 'can run this work', value: '—' });
    void statN;
    GG.ui.seg(f.controls, {
      label: 'Follow', value: 'all', onChange: (v) => { mode = v; apply(); },
      options: [{ value: 'vtx', label: 'vertex threads' }, { value: 'geom', label: 'geometry threads' }, { value: 'pix', label: 'pixel threads' }, { value: 'all', label: 'everything' }],
    });

    function draw(W) {
      host.innerHTML = '';
      items = []; spCells = [];
      const narrow = W < 640;
      const svg = svgRoot(host, W, 600, 'A compute unified GPU (G80): the host feeds an input assembler and vertex, geometry and pixel thread issue units, which all feed the same eight identical blocks of streaming processors with texture units and L1 caches; a thread processor coordinates them; below, six L2 caches and output units in front of six frame buffer partitions.');
      D = defs(svg);
      const add = (k, g) => { g.setAttribute('data-k', k); g.classList.add('hwa-hot'); items.push({ k, g }); g.addEventListener('mouseenter', () => { hover = k; f.setWhy(DESC[k]); }); g.addEventListener('mouseleave', () => { hover = null; apply(); }); return g; };
      const box = (k, x, y, w, h, label, role, o = {}) => {
        const g = add(k, S('g', {}, svg));
        const col = { control: 'var(--control)', host: 'var(--host)', memory: 'var(--memory)', neutral: 'var(--ink-3)' }[role];
        const bg = { control: 'var(--control-a)', host: 'var(--host-a)', memory: 'var(--memory-a)', neutral: 'var(--surface-2)' }[role];
        rect(g, x, y, w, h, { fill: bg, stroke: col, rx: 4 });
        if (label && narrow && !o.rotate && label.length * (o.size || 10) * 0.6 > w - 6 && label.includes(' ')) {
          const words = label.split(' '), half = Math.ceil(words.length / 2);
          tx(g, x + w / 2, y + h / 2 - 6, words.slice(0, half).join(' '), { anchor: 'middle', size: o.size || 10, fill: 'var(--ink)' });
          tx(g, x + w / 2, y + h / 2 + 6, words.slice(half).join(' '), { anchor: 'middle', size: o.size || 10, fill: 'var(--ink)' });
        } else if (label) tx(g, x + w / 2, y + h / 2, label, { anchor: 'middle', size: o.size || (narrow ? 10 : 12), fill: 'var(--ink)', rotate: o.rotate });
        return g;
      };
      const cluster = (g, x, y, w, h, s) => {
        rect(g, x, y, w, h, { fill: 'rgba(16, 18, 28, 0.9)', stroke: 'var(--line-2)', rx: 3 });
        const pad = 5 * s + 1;
        const gw = (w - 3 * pad) / 2;
        const ch = (h * 0.54 - pad) ;
        for (let q = 0; q < 2; q++) {
          const gx = x + pad + q * (gw + pad), gy = y + pad;
          rect(g, gx, gy, gw, ch, { fill: 'none', stroke: 'var(--line-2)', rx: 2 });
          const cw = (gw - 6) / 2, chh = (ch - 6) / 4;
          for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) {
            const cell = rect(g, gx + 2 + c * (cw + 2), gy + 2 + r * (chh + 0.7), cw - 0.5, chh - 1.5, { fill: 'var(--core-a)', stroke: 'var(--core)', rx: 1.5, sw: 0.8 });
            spCells.push(cell);
            if (r === 0 && c === 0 && cw > 14) tx(g, gx + 2 + cw / 2, gy + 2 + chh / 2, 'SP', { anchor: 'middle', size: Math.min(10, chh * 0.6), fill: 'var(--ink)' });
          }
        }
        const ty = y + pad + ch + pad, th = h * 0.27;
        rect(g, x + pad, ty, w - 2 * pad, th, { fill: 'var(--special-a)', stroke: 'var(--special)', rx: 2 });
        const tw = (w - 2 * pad - 5 * 3) / 4;
        for (let i = 0; i < 4; i++) rect(g, x + pad + 3 + i * (tw + 3), ty + 3, tw, th - 6, { fill: 'rgba(238, 116, 207, 0.28)', stroke: 'var(--special)', rx: 1.5, sw: 0.8 });
        if (tw > 12) tx(g, x + pad + 3 + tw / 2, ty + 9, 'TF', { anchor: 'middle', size: Math.min(9.5, tw * 0.5), fill: 'var(--special)' });
        const ly = ty + th + pad * 0.7, lh = y + h - pad * 0.7 - ly;
        rect(g, x + pad, ly, w - 2 * pad, lh, { fill: 'var(--memory-a)', stroke: 'var(--memory)', rx: 2 });
        tx(g, x + w / 2, ly + lh / 2, 'L1', { anchor: 'middle', size: Math.min(11, lh * 0.65), fill: 'var(--memory)' });
      };
      const ropL2 = (k, x, y, w, h) => {
        const g = add(k, S('g', {}, svg));
        const rw = w * 0.56;
        rect(g, x, y, rw, h, { fill: 'var(--surface-3)', stroke: 'var(--ink-3)', rx: 2 });
        for (let r = 0; r < 2; r++) for (let c = 0; c < 8; c++) rect(g, x + 2 + c * ((rw - 4) / 8), y + 2 + r * ((h - 4) / 2), (rw - 4) / 8 - 1, (h - 4) / 2 - 1, { fill: 'none', stroke: 'rgba(160, 166, 190, 0.55)', rx: 0.5, sw: 0.7 });
        rect(g, x + rw + w * 0.08, y, w * 0.36, h, { fill: 'var(--memory-a)', stroke: 'var(--memory)', rx: 2 });
        tx(g, x + rw + w * 0.08 + w * 0.18, y + h / 2, 'L2', { anchor: 'middle', size: narrow ? 10 : 12, fill: 'var(--memory)' });
        return { g, rc: x + rw / 2, lc: x + rw + w * 0.26 };
      };
      if (!narrow) {
        const s = W / 1400, X = (v) => v * s;
        box('host', X(253), X(23), X(242), X(41), 'Host', 'host');
        line(svg, [[X(374), X(64)], [X(374), X(93)]], { arrow: D.arrow });
        box('ia', X(253), X(95), X(242), X(41), 'Input Assembler', 'neutral');
        line(svg, [[X(374), X(136)], [X(374), X(163)]], { arrow: D.arrow });
        box('vtx', X(253), X(165), X(242), X(41), 'Vtx Thread Issue', 'control');
        box('geom', X(545), X(165), X(242), X(41), 'Geom Thread Issue', 'control');
        box('setup', X(838), X(99), X(242), X(41), 'Setup / Rstr / ZCull', 'neutral');
        line(svg, [[X(959), X(140)], [X(959), X(163)]], { arrow: D.arrow });
        box('pix', X(838), X(165), X(242), X(41), 'Pixel Thread Issue', 'control');
        line(svg, [[X(1338), X(243)], [X(1338), X(73)], [X(668), X(73)], [X(668), X(163)]], { arrow: D.arrow });
        line(svg, [[X(959), X(73)], [X(959), X(97)]], { arrow: D.arrow });
        // issue bus
        line(svg, [[X(374), X(206)], [X(374), X(230)]]); line(svg, [[X(666), X(206)], [X(666), X(230)]]); line(svg, [[X(959), X(206)], [X(959), X(230)]]);
        const cx = (i) => 43 + i * 157.3;
        line(svg, [[X(cx(0) + 73), X(230)], [X(cx(7) + 73), X(230)]]);
        const gS = add('sm', S('g', {}, svg));
        for (let i = 0; i < 8; i++) {
          line(svg, [[X(cx(i) + 73), X(230)], [X(cx(i) + 73), X(262)]], { arrow: D.arrow });
          cluster(gS, X(cx(i)), X(264), X(145), X(270), s);
        }
        box('tp', X(1316), X(243), X(42), X(243), 'Thread Processor', 'control', { rotate: -90, size: 12 });
        // interconnect
        const yb = X(553);
        line(svg, [[X(cx(0) + 116), X(534)], [X(cx(0) + 116), yb], [X(1338), yb], [X(1338), X(486)]]);
        for (let i = 1; i < 8; i++) line(svg, [[X(cx(i) + 116), X(534)], [X(cx(i) + 116), yb]]);
        const px = (j) => 43 + j * 222.6;
        const yi = X(585);
        line(svg, [[X(72), X(534)], [X(72), yi], [X(1329), yi]]);
        for (let i = 0; i < 8; i++) line(svg, [[X(cx(i) + 29), X(534)], [X(cx(i) + 29), yi]]);
        for (let j = 0; j < 6; j++) {
          const r = ropL2('l2', X(px(j)), X(628), X(200), X(40));
          line(svg, [[r.rc, yi], [r.rc, X(626)]], { arrow: D.arrow });
          line(svg, [[r.lc, yb + 2], [r.lc, X(626)]], { arrow: D.arrow });
          line(svg, [[r.rc, X(668)], [r.rc, X(699)]], { arrow: D.arrow });
          line(svg, [[r.lc, X(668)], [r.lc, X(699)]], { arrow: D.arrow });
          box('fb', X(px(j)), X(701), X(200), X(42), 'FB', 'memory');
        }
        svg.setAttribute('viewBox', `0 0 ${W} ${Math.round(X(760))}`);
      } else {
        const M = 6, cw = W - 2 * M;
        const tpw = 22, ax = W - M - tpw;
        const bw = (ax - 8 - M - 2 * 6) / 3, c0 = M, c1 = M + bw + 6, c2 = M + 2 * (bw + 6);
        const bh = 30;
        box('host', c0, 2, bw, 28, 'Host', 'host');
        line(svg, [[c0 + bw / 2, 30], [c0 + bw / 2, 38]], { arrow: D.arrow });
        box('ia', c0, 40, bw, bh, 'Input Assembler', 'neutral', { size: 9.5 });
        line(svg, [[c0 + bw / 2, 40 + bh], [c0 + bw / 2, 74]], { arrow: D.arrow });
        box('vtx', c0, 76, bw, bh, 'Vtx Thread Issue', 'control', { size: 9.5 });
        box('geom', c1, 76, bw, bh, 'Geom Thread Issue', 'control', { size: 9.5 });
        box('setup', c2, 40, bw, bh, 'Setup / Rstr / ZCull', 'neutral', { size: 9.5 });
        line(svg, [[c2 + bw / 2, 40 + bh], [c2 + bw / 2, 74]], { arrow: D.arrow });
        box('pix', c2, 76, bw, bh, 'Pixel Thread Issue', 'control', { size: 9.5 });
        line(svg, [[ax + tpw / 2, 130], [ax + tpw / 2, 24], [c1 + bw / 2, 24], [c1 + bw / 2, 74]], { arrow: D.arrow });
        line(svg, [[c2 + bw / 2 - 12, 24], [c2 + bw / 2 - 12, 38]], { arrow: D.arrow });
        const yBus = 118;
        [c0, c1, c2].forEach((c) => line(svg, [[c + bw / 2, 106], [c + bw / 2, yBus]]));
        const aw = ax - 6 - M, kw = (aw - 3 * 5) / 4, kh = 132;
        line(svg, [[M + kw / 2, yBus], [M + 3 * (kw + 5) + kw / 2, yBus]]);
        const gS = add('sm', S('g', {}, svg));
        const rows = [126, 126 + kh + 18];
        line(svg, [[M - 2 + 0, yBus], [M - 2, rows[1] - 8], [M + 3 * (kw + 5) + kw / 2, rows[1] - 8]]);
        for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) {
          const x = M + c * (kw + 5);
          line(svg, [[x + kw / 2, r ? rows[1] - 8 : yBus], [x + kw / 2, rows[r] - 1]], { arrow: D.arrow });
          cluster(gS, x, rows[r], kw, kh, 0.5);
        }
        box('tp', ax, 130, tpw, 2 * kh + 14, 'Thread Processor', 'control', { rotate: -90, size: 10 });
        const yb = rows[1] + kh + 14;
        line(svg, [[M, yb], [ax + tpw / 2, yb], [ax + tpw / 2, 130 + 2 * kh + 14]]);
        for (let c = 0; c < 4; c++) line(svg, [[M + c * (kw + 5) + kw / 2, rows[1] + kh], [M + c * (kw + 5) + kw / 2, yb]]);
        const pw = (cw - 2 * 8) / 3;
        for (let j = 0; j < 6; j++) {
          const x = M + (j % 3) * (pw + 8), y = yb + 18 + Math.floor(j / 3) * 86;
          line(svg, [[x + pw / 2, j < 3 ? yb : yb + 18 + 62], [x + pw / 2, y - 1]], { arrow: D.arrow });
          ropL2('l2', x, y, pw, 26);
          line(svg, [[x + pw / 2, y + 26], [x + pw / 2, y + 34]], { arrow: D.arrow });
          box('fb', x, y + 36, pw, 24, 'FB', 'memory');
        }
        svg.setAttribute('viewBox', `0 0 ${W} ${yb + 18 + 86 + 64}`);
      }
      pk = packets(svg, { per: 2, r: narrow ? 3.2 : 4.4, speed: narrow ? 60 : 110 });
      apply();
    }
    function apply() {
      const m = MODES[mode];
      items.forEach((it) => it.g.classList.toggle('hwa-dim', !!m.keys && !m.keys.includes(it.k)));
      const fill = m.fill === 'hatch' ? D.hatch : m.fill === 'stripe' ? D.stripe : m.fill === 'dots' ? D.dots : 'var(--core-a)';
      spCells.forEach((c) => c.setAttribute('fill', fill));
      statS.set(mode === 'all' ? 'any work' : '128 of 128 · 100%', mode === 'all' ? null : 'core');
      if (!hover) f.setWhy(m.why);
      // packets from the issue unit to every block
      if (pk) {
        const src = { vtx: 'vtx', geom: 'geom', pix: 'pix' }[mode];
        const rs = [];
        if (src) {
          const sb = items.find((it) => it.k === src).g.querySelector('rect');
          const sxm = +sb.getAttribute('x') + +sb.getAttribute('width') / 2, sy = +sb.getAttribute('y') + +sb.getAttribute('height');
          const sm = items.find((it) => it.k === 'sm').g;
          sm.querySelectorAll(':scope > rect').forEach((r) => {
            if (+r.getAttribute('width') < 40) return;
            const cx = +r.getAttribute('x') + +r.getAttribute('width') / 2, top = +r.getAttribute('y');
            if (r.getAttribute('stroke') !== 'var(--line-2)') return;
            rs.push([[sxm, sy], [sxm, sy + (top - sy) * 0.35], [cx, sy + (top - sy) * 0.35], [cx, top + 18]]);
          });
        }
        pk.set(rs, fill, 'var(--core)');
      }
    }
    const anim = GG.anim(f.stage, (t) => { if (pk) pk.tick(t); });
    GG.ui.playButton(f.controls, anim);
    onWidth(host, draw);
  }

  /* Fig: why guessing the load ratio hurts (toy model) */
  function utilToy(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Who sits idle? Fixed split vs unified', hint: 'drag the workload mix', wide: true,
      caption: 'A toy model with 32 identical processors in both chips. On the left they are split 8 : 24 between vertex and fragment work, as in the G71; on the right any processor takes any work, as in the G80. Each frame has the same total work; a processor fills (hatched = vertex, solid = fragment) while it is busy and turns red once it has nothing left to do. The frame ends when the last processor finishes.',
    });
    const host = el('div', { class: 'hwa-w' });
    f.stage.append(host);
    f.stage.append(el('div', { class: 'hwa-legend', html: '<span><i class="hwa-sw-hatch"></i>vertex work</span><span><i class="hwa-sw-core"></i>fragment work</span><span><i class="hwa-sw-idlered"></i>idle: nothing it is allowed to do</span><span><i class="hwa-sw-ink"></i>frame time</span><span><i class="hwa-sw-danger"></i>fixed chip’s extra time</span>' }));
    let v = 0.1, W = 0, units = null, prog = 1;
    const sV = GG.ui.slider(f.controls, { label: 'Vertex work', min: 0, max: 100, step: 1, value: 10, format: (x) => x + '% · fragment ' + (100 - x) + '%', onInput: (x) => { v = x / 100; preset.set(null); update(); } });
    const preset = GG.ui.seg(f.controls, {
      label: 'Scenes', value: null, onChange: (x) => { sV.set(x, false); v = x / 100; update(); },
      options: [{ value: 10, label: 'pixel-heavy' }, { value: 25, label: 'matches 8 : 24' }, { value: 60, label: 'geometry-heavy' }],
    });
    preset.set(10);
    const stF = GG.ui.stat(f.readouts, { label: 'fixed · busy', value: '—' });
    const stU = GG.ui.stat(f.readouts, { label: 'unified · busy', value: '—', tone: 'core' });
    const stT = GG.ui.stat(f.readouts, { label: 'fixed frame time', value: '—' });
    let anim = null, playBtn = null;

    const model = () => {
      const tV = 4 * v, tF = (4 / 3) * (1 - v);
      const Tf = Math.max(tV, tF, 1e-9);
      return { tV, tF, Tf, Tu: 1, uF: 1 / Tf, vBusy: tV / Tf, fBusy: tF / Tf };
    };
    function build(w) {
      W = w;
      host.innerHTML = '';
      const narrow = W < 640;
      const pw = narrow ? W : (W - 24) / 2;
      const panelH = narrow ? 218 : 246;
      const H = narrow ? 2 * panelH + 20 : panelH;
      const svg = svgRoot(host, W, H, 'Two chips with 32 processors each doing one frame of work. The fixed-split chip has 8 vertex-only and 24 fragment-only processors; the unified chip lets any processor do any work.');
      const D = defs(svg);
      units = { fixed: [], uni: [], bars: {} };
      const panel = (ox, oy, kind) => {
        tx(svg, ox, oy + 9, kind === 'fixed' ? 'FIXED PIPELINE · 8 vertex + 24 fragment' : 'UNIFIED · 32 processors, any work', { size: narrow ? 10 : 11, fill: 'var(--ink)', ls: '0.06em' });
        const top = oy + 26, gw = pw;
        const mk = (x, y, w, h, type) => {
          const g = S('g', {}, svg);
          const frame = rect(g, x, y, w, h, { fill: 'rgba(255,255,255,0.03)', stroke: 'var(--line-2)', rx: 3 });
          const fv = rect(g, x + 1, y + h - 1, w - 2, 0, { fill: D.hatch, rx: 1 });
          const ff = rect(g, x + 1, y + h - 1, w - 2, 0, { fill: 'var(--core)', rx: 1, opacity: 0.85 });
          const idle = rect(g, x, y, w, h, { fill: 'rgba(255, 91, 110, 0.34)', stroke: 'var(--danger)', sw: 1.5, rx: 3, opacity: 0 });
          return { x, y, w, h, frame, fv, ff, idle, type };
        };
        if (kind === 'fixed') {
          const cw = (gw - 11 * 4) / 12;
          const vh = narrow ? 34 : 44, fh = narrow ? 34 : 44;
          const vw = cw * 1.25, vx0 = ox + (gw - (8 * vw + 7 * 4)) / 2;
          tx(svg, ox, top + 4, 'vertex', { size: 9.5, fill: 'var(--ink-3)' });
          for (let i = 0; i < 8; i++) units.fixed.push(mk(vx0 + i * (vw + 4), top + 12, vw, vh, 'v'));
          tx(svg, ox, top + vh + 26, 'fragment', { size: 9.5, fill: 'var(--ink-3)' });
          for (let r = 0; r < 2; r++) for (let c = 0; c < 12; c++) units.fixed.push(mk(ox + c * (cw + 4), top + vh + 34 + r * (fh + 4), cw, fh, 'f'));
        } else {
          const gwid = (gw - 3 * 8) / 4, uh = narrow ? 34 : 44;
          tx(svg, ox, top + 4, 'any work', { size: 9.5, fill: 'var(--ink-3)' });
          for (let gi = 0; gi < 8; gi++) {
            const gx = ox + (gi % 4) * (gwid + 8), gy = top + 12 + Math.floor(gi / 4) * (uh + 22);
            rect(svg, gx - 2, gy - 3, gwid + 4, uh + 6, { stroke: 'var(--line)', rx: 4 });
            const uw = (gwid - 3 * 3) / 4;
            for (let k = 0; k < 4; k++) units.uni.push(mk(gx + k * (uw + 3), gy, uw, uh, 'u'));
          }
        }
        // frame-time bar
        const by = oy + panelH - 26;
        tx(svg, ox, by - 9, 'frame time', { size: 9.5, fill: 'var(--ink-3)' });
        const track = rect(svg, ox, by, gw, 8, { fill: 'rgba(255,255,255,0.05)', rx: 4 });
        // ink up to the unified chip's frame time; red for the fixed chip's overrun (drawn first, under the ink's round end)
        const over = rect(svg, ox, by, 0, 8, { fill: 'var(--danger)', rx: 4 });
        const fill = rect(svg, ox, by, 0, 8, { fill: 'var(--ink-2)', rx: 4 });
        const tick1 = S('line', { x1: 0, x2: 0, y1: by - 3, y2: by + 11, stroke: 'var(--ink-2)', 'stroke-width': 1.2, 'stroke-dasharray': '2 2' }, svg);
        const lab = tx(svg, ox + gw, by - 9, '', { size: 10, anchor: 'end', fill: 'var(--ink)' });
        units.bars[kind] = { ox, gw, track, fill, over, tick1, lab };
      };
      panel(0, 0, 'fixed');
      if (narrow) panel(0, panelH + 20, 'uni'); else panel(pw + 24, 0, 'uni');
      paint();
    }
    function paint() {
      if (!units) return;
      const m = model();
      const now = prog * m.Tf; // the fixed chip's frame is never shorter than the unified one's
      const fill = (u, hv, hf) => {
        const ih = u.h - 2;
        hv = ih * clamp(hv, 0, 1); hf = ih * clamp(hf, 0, 1);
        u.fv.setAttribute('height', hv.toFixed(2)); u.fv.setAttribute('y', (u.y + u.h - 1 - hv).toFixed(2));
        u.ff.setAttribute('height', hf.toFixed(2)); u.ff.setAttribute('y', (u.y + u.h - 1 - hv - hf).toFixed(2));
      };
      // fixed: a unit fills while busy; its height at the end = the share of the frame it was busy
      units.fixed.forEach((u) => {
        const end = u.type === 'v' ? m.tV : m.tF;
        const h = Math.min(now, end) / m.Tf;
        if (u.type === 'v') fill(u, h, 0); else fill(u, 0, h);
        u.idle.setAttribute('opacity', now > end + 1e-6 && now <= m.Tf + 1e-6 ? 1 : 0);
      });
      // unified: every unit does its share of vertex work, then fragment work, and is busy all (shorter) frame
      const tu = Math.min(now, m.Tu);
      units.uni.forEach((u) => { fill(u, Math.min(tu, v * m.Tu) / m.Tu, Math.max(0, tu - v * m.Tu) / m.Tu); u.idle.setAttribute('opacity', 0); });
      [['fixed', m.Tf], ['uni', m.Tu]].forEach(([k, Tk]) => {
        const b = units.bars[k];
        b.fill.setAttribute('width', ((Math.min(now, m.Tu) / m.Tf) * b.gw).toFixed(1));
        const xu = b.ox + (m.Tu / m.Tf) * b.gw, ov = Math.max(0, Math.min(now, Tk) - m.Tu) / m.Tf * b.gw;
        b.over.setAttribute('x', (xu - 4).toFixed(1)); b.over.setAttribute('width', ov > 0 ? (ov + 4).toFixed(1) : 0);
        const x1 = b.ox + (Tk / m.Tf) * b.gw;
        b.tick1.setAttribute('x1', x1); b.tick1.setAttribute('x2', x1);
        b.lab.textContent = now >= Tk - 1e-6 ? (k === 'uni' ? 'frame done · 1.00×' : `frame done · ${GG.fmt.fixed(Tk / m.Tu, 2)}×`) : '';
      });
    }
    function update() {
      const m = model();
      stF.set(fmt.pct(m.uF, 0), m.uF < 0.9 ? 'danger' : 'core');
      stU.set('100%', 'core');
      stT.set(GG.fmt.fixed(m.Tf, 2) + '× unified', m.Tf > 1.05 ? 'danger' : 'core');
      const pv = Math.round(v * 100);
      let why;
      if (Math.abs(m.tV - m.tF) < 1e-9) why = `At <b>${pv}% vertex work</b> the mix matches the hardware’s 8 : 24 split exactly, so the fixed pipeline keeps every processor busy, just like the unified one. This is the ratio the hardware engineers had to guess in advance.`;
      else if (m.tV < 1e-9) why = `At <b>0% vertex work</b> the <b>8 vertex shaders</b> have no work at all and sit idle for the whole frame, while the 24 fragment shaders do everything. The fixed chip needs <b>${GG.fmt.fixed(m.Tf, 2)}×</b> as long as the unified chip for the same work (${fmt.pct(m.uF, 0)} of its processors’ time is useful).`;
      else if (m.tF < 1e-9) why = `At <b>100% vertex work</b> the <b>24 fragment shaders</b> have no work at all and sit idle for the whole frame, while the 8 vertex shaders grind through the geometry. The fixed chip needs <b>${GG.fmt.fixed(m.Tf, 2)}×</b> as long as the unified chip (${fmt.pct(m.uF, 0)} of its processors’ time is useful).`;
      else if (m.tV < m.tF) why = `At <b>${pv}% vertex work</b> the <b>8 vertex shaders</b> are busy for only <b>${fmt.pct(m.vBusy, 0)}</b> of the frame and then sit idle, while the fragment shaders finish the frame. The fixed chip needs <b>${GG.fmt.fixed(m.Tf, 2)}×</b> as long as the unified chip for the same work (${fmt.pct(m.uF, 0)} of its processors’ time is useful).`;
      else why = `At <b>${pv}% vertex work</b> the <b>24 fragment shaders</b> are busy for only <b>${fmt.pct(m.fBusy, 0)}</b> of the frame and then sit idle, while the 8 vertex shaders grind through the geometry. The fixed chip needs <b>${GG.fmt.fixed(m.Tf, 2)}×</b> as long as the unified chip (${fmt.pct(m.uF, 0)} of its processors’ time is useful).`;
      f.setWhy(why);
      paint();
    }
    onWidth(host, build);
    anim = GG.anim(f.stage, (t) => {
      const period = 4.2, hold = 1.4;
      const ph = t % (period + hold);
      prog = Math.min(1, ph / period);
      paint();
    });
    if (GG.reducedMotion) prog = 1;
    playBtn = GG.ui.playButton(f.controls, anim, { onToggle: (on) => { if (!on) { prog = 1; paint(); } } });
    void playBtn;
    update();
  }

  GG.entry('cuda-device-architecture', {
    render(body, ctx) {
      body.classList.add('hwa-body');
      const s = ctx.html(body, `
<p><strong>CUDA</strong> stands for <em>Compute Unified Device Architecture</em>. Depending on the context, “CUDA” can refer to multiple distinct things:</p>
<ol>
<li>a high-level <strong>device architecture</strong>, a way of designing GPU hardware (this entry);</li>
<li>a ${T('cuda-programming-model', 'parallel programming model')} for architectures with that design;</li>
<li>a ${T('cuda-software-platform', 'software platform')} that extends high-level languages like C to add that programming model.</li>
</ol>
<div data-slot="three" class="wide"></div>
<p>The vision for CUDA is laid out in the ${X('https://www.cs.cmu.edu/afs/cs/academic/class/15869-f11/www/readings/lindholm08_tesla.pdf', 'Lindholm et al., 2008')} white paper. The glossary highly recommends it: it is the original source for many claims, diagrams and even specific turns of phrase in NVIDIA’s documentation. If a sentence in NVIDIA’s docs sounds oddly familiar after you read it, that is why.</p>
<p>Here we focus on the <em>device architecture</em> part of CUDA. The core feature of a “compute unified device architecture” is <strong>simplicity</strong>, relative to the GPU architectures that came before it.</p>
<h3>Before: a fixed pipeline of specialised units</h3>
<p>Drawing a 3D scene is a pipeline of stages. A <em>vertex shader</em> (a small program run once per vertex, a corner of a triangle) positions the geometry; fixed-function hardware clips and culls triangles and turns them into <em>fragments</em> (candidate pixels); a <em>fragment shader</em> (a program run once per fragment) computes each fragment’s colour; output units write the results to memory.</p>
<p>Prior to the GeForce 8800 and the Tesla data center GPUs it spawned, NVIDIA GPUs were designed with a complex pipeline shader architecture that mapped these software shader stages onto <strong>heterogeneous, specialised hardware units</strong>: one kind of processor for vertex shaders, another kind for fragment shaders. Fig. 2 shows one, the G71.</p>
<div data-slot="g71" class="wide"></div>
<p>This architecture was challenging for the software and hardware sides alike:</p>
<ul>
<li>it required <strong>software engineers</strong> to map their programs onto a fixed pipeline (anything that was not drawing triangles had to be disguised as vertex or fragment work);</li>
<li>it forced <strong>hardware engineers</strong> to guess the load ratios between pipeline steps. The G71 has 8 vertex shader processors and 24 fragment shader processors: its designers had to bet, when the chip was designed, that fragment work would outweigh vertex work about three to one.</li>
</ul>
<h3>After: identical, general-purpose processors</h3>
<p>GPU devices with a unified architecture are much simpler: the hardware units are <strong>entirely uniform</strong>, each capable of a wide array of computations. These units are known as ${T('streaming-multiprocessor', 'Streaming Multiprocessors (SMs)')}, and their main subcomponents are the ${T('cuda-core', 'CUDA Cores')} and (for recent GPUs) the ${T('tensor-core', 'Tensor Cores')}.</p>
<div data-slot="g80" class="wide"></div>
<div data-slot="glz"></div>
<p>The stages of the graphics pipeline still exist in Fig. 3: there is a unit that issues vertex threads, one for geometry threads and one for pixel threads. What changed is where those threads run. They all go to the same processors, so the chip no longer bets on a ratio. Fig. 4 plays out the bet.</p>
<div data-slot="toy" class="wide"></div>
<p>The same uniformity is what made GPUs useful beyond graphics. A processor that can run any vertex, geometry or pixel program can also run a program that is none of those: a matrix multiplication, a physics simulation, the layers of a neural network. Writing such programs directly, without disguising them as graphics, is what the CUDA ${T('cuda-programming-model', 'programming model')} and ${T('cuda-software-platform', 'software platform')} are for.</p>
${GG.noteHTML('beyond', `<p><b>Dates and counts.</b> The G71 powered the GeForce 7900 series of early 2006. The G80 followed in November 2006 as the GeForce 8800 GTX, the first NVIDIA GPU of the architecture Lindholm et al. call Tesla. It has 128 streaming processors: each of the eight blocks of Fig. 3 is a <b>Texture/Processor Cluster (TPC)</b>, Lindholm et al.’s name for two SMs of 8 SPs plus texture units (TF) and an L1 cache (later NVIDIA GPUs still pair SMs into a ${T('texture-processing-cluster', 'Texture Processing Cluster')}, though the texture units have since moved inside the SMs). <b>“Tesla” names two different things</b> on this page: this first unified architecture (G80, 2006), and NVIDIA’s data-center product brand of the time, which later carried other architectures. The Tesla P100 in the reading below is a Pascal GPU, not a Tesla-architecture one. Geometry shaders, the third kind of thread in Fig. 3, arrived in the same generation, and in a unified design they needed no processors of their own.</p>`)}
<h3>Further reading</h3>
<p>For an accessible introduction to the history and design of CUDA hardware architectures, see ${X('https://fabiensanglard.net/cuda/', 'this blog post')} by Fabien Sanglard. It cites its (high-quality) sources, like NVIDIA’s ${X('https://www.nvidia.com/content/pdf/fermi_white_papers/nvidia_fermi_compute_architecture_whitepaper.pdf', 'Fermi Compute Architecture white paper')}. The white paper by ${X('https://www.cs.cmu.edu/afs/cs/academic/class/15869-f11/www/readings/lindholm08_tesla.pdf', 'Lindholm et al. in 2008')} introducing the Tesla architecture is both well-written and thorough. The ${X('https://images.nvidia.com/content/pdf/tesla/whitepaper/pascal-architecture-whitepaper.pdf', 'NVIDIA whitepaper for the Tesla P100')} is less scholarly, but it documents the introduction of a number of features that are critical for today’s large-scale neural network workloads, like NVLink (a fast GPU-to-GPU interconnect) and ${T('gpu-ram', 'on-package high-bandwidth memory')}.</p>
<div data-slot="read"></div>`);
      guard(s.three, 'Three meanings', () => threeMeanings(s.three, ctx));
      guard(s.g71, 'G71 diagram', () => g71Figure(s.g71, ctx));
      guard(s.g80, 'G80 diagram', () => g80Figure(s.g80, ctx));
      guard(s.toy, 'Utilisation toy', () => utilToy(s.toy, ctx));
      ctx.note(s.glz, { type: 'check', html: '<p>The glossary credits this figure to “Peter Glazkowsky’s 2009 white paper”. The paper’s author is <b>Peter N. Glaskowsky</b>, as its own title page and the link’s file name (<code>p.glaskowsky_nvidia\'s_fermi…</code>) show.</p>' });
      ctx.reading(s.read, [
        { href: 'https://www.cs.cmu.edu/afs/cs/academic/class/15869-f11/www/readings/lindholm08_tesla.pdf', label: 'Lindholm, Nickolls, Oberman & Montrym, “NVIDIA Tesla: A Unified Graphics and Computing Architecture” (IEEE Micro, 2008)', note: 'the original vision; the source of many of NVIDIA’s diagrams and phrases' },
        { href: 'https://fabiensanglard.net/cuda/', label: 'Fabien Sanglard, “A history of NVidia Stream Multiprocessor”', note: 'accessible history; source of the G71 figure' },
        { href: 'https://www.nvidia.com/content/pdf/fermi_white_papers/p.glaskowsky_nvidia%27s_fermi-the_first_complete_gpu_architecture.pdf', label: 'Peter N. Glaskowsky, “NVIDIA’s Fermi: The First Complete GPU Computing Architecture” (2009)', note: 'source of the G80 figure' },
        { href: 'https://www.nvidia.com/content/pdf/fermi_white_papers/nvidia_fermi_compute_architecture_whitepaper.pdf', label: 'NVIDIA, Fermi Compute Architecture white paper', note: 'one of Sanglard’s sources' },
        { href: 'https://images.nvidia.com/content/pdf/tesla/whitepaper/pascal-architecture-whitepaper.pdf', label: 'NVIDIA Tesla P100 white paper (Pascal)', note: 'introduces NVLink and on-package HBM' },
      ]);
    },
  });


  /* ═════════════════════════════ Streaming Multiprocessor ═════════════════════════════ */

  GG.css(`
.hwa-cmp { display: grid; gap: 14px; }
.hwa-cmp-row { display: grid; grid-template-columns: 150px minmax(0, 1fr); gap: 6px 14px; align-items: center; }
.hwa-cmp-row .nm { font: 600 12.5px/1.3 var(--font-mono); color: var(--ink); }
.hwa-cmp-row .nm small { display: block; font-weight: 500; font-size: 10.5px; color: var(--ink-3); margin-top: 2px; }
.hwa-cmp-row .eq { font: 500 12.5px/1.45 var(--font-mono); color: var(--ink-2); }
.hwa-cmp-row .eq b { color: var(--ink); font-weight: 600; }
.hwa-bars { display: grid; gap: 4px; }
.hwa-bar { position: relative; height: 18px; border-radius: 5px; background: rgba(255, 255, 255, 0.04); overflow: hidden; }
.hwa-bar i { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 5px; transition: width 0.35s ease; min-width: 2px; }
.hwa-bar span { position: absolute; left: 8px; top: 0; line-height: 18px; font: 600 11px var(--font-mono); color: var(--ink); white-space: nowrap; text-shadow: 0 1px 2px rgba(0,0,0,.8); }
.hwa-bar-l { font: 500 10px/1.2 var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-3); margin-top: 4px; }
@media (max-width: 640px) { .hwa-cmp-row { grid-template-columns: minmax(0, 1fr); } }
.hwa-cvwrap { position: relative; }
.hwa-cvwrap canvas { display: block; }
.hwa-tile-sel { display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); }
.hwa-tile-sel.two { grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); align-items: center; }
`);

  /* Fig: the SM floorplan, coloured by role */
  function smAnchor(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Inside one H100 Streaming Multiprocessor', hint: 'pick a colour · hover or tap any block', wide: true,
      caption: `The internal architecture of an H100 GPU’s Streaming Multiprocessors, redrawn from NVIDIA’s ${X('https://modal-cdn.com/gpu-glossary/gtc22-whitepaper-hopper.pdf', 'H100 white paper')} as modified by the glossary. GPU cores appear in green, other compute units in pink, scheduling units in orange (amber here), and memory in blue.`,
    });
    const sm = GG.components.sm(f.stage, { legend: true, onPart: (key, part) => { if (part) f.setWhy(`<b>${esc(part.name)}</b> · ${esc(part.count)}. ${esc(part.desc)}`); } });
    const V = {
      all: { keys: [], why: `One SM: four identical sub-partitions, each with its own ${T('warp-scheduler', 'warp scheduler')}, ${T('register-file', 'register file')} and execution units, sharing an L1 instruction cache, a ${T('tensor-memory-accelerator', 'Tensor Memory Accelerator')} and a 256 KiB ${T('l1-data-cache', 'L1 data cache')}. An H100 SXM has 132 of these.` },
      cores: { keys: ['cores'], why: `<b>Green: the cores</b>, which do the arithmetic. Per SM: 256 small scalar units (64 INT32, 128 FP32 and 64 FP64), the mixture the glossary groups under ${T('cuda-core', 'CUDA Cores')}, and 4 ${T('tensor-core', 'Tensor Cores')}. NVIDIA’s own “CUDA Core” count is only the 128 FP32 units: 16,896 per H100 SXM.` },
      special: { keys: ['special'], why: `<b>Pink: other compute units.</b> ${T('load-store-unit', 'Load/Store Units')} move data to and from memory, ${T('special-function-unit', 'Special Function Units')} compute functions like <code>exp</code> and <code>sin</code>, and the ${T('tensor-memory-accelerator', 'TMA')} copies whole arrays.` },
      control: { keys: ['control'], why: `<b>Amber: scheduling.</b> Each sub-partition’s ${T('warp-scheduler', 'Warp Scheduler')} picks a warp (32 threads) to run every clock cycle, and its Dispatch Unit sends that warp’s instruction to the execution units: 4 × 32 = 128 threads per clock per SM.` },
      memory: { keys: ['memory'], why: `<b>Blue: memory</b>, the state available for computation. The ${T('register-file', 'register file')} (65,536 × 32-bit registers, 256 KiB per SM), the ${T('l1-data-cache', 'L1 data cache / shared memory')} (256 KiB) and the instruction caches.` },
    };
    GG.ui.seg(f.controls, {
      label: 'Colour', value: 'all', onChange: (v) => { sm.highlight(V[v].keys); f.setWhy(V[v].why); },
      options: [{ value: 'all', label: 'everything' }, { value: 'cores', label: 'cores' }, { value: 'special', label: 'other units' }, { value: 'control', label: 'scheduling' }, { value: 'memory', label: 'memory' }],
    });
    f.setWhy(V.all.why);
  }

  /* Fig: pipelining, branch prediction and speculation (CPU) vs warp switching at a branch (SM). A 4-stage model. */
  function specFigure(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'At a branch: the CPU guesses, the SM switches warps', hint: 'step through the cycles · flip the guess', wide: true,
      caption: `A simplified four-stage pipeline: F (fetch), D (decode), X (execute), W (write back). One instruction enters per cycle, and a branch only knows where it goes at the end of its X stage. <b>CPU core</b> (one thread): it predicts the branch and keeps fetching down the guessed path (hatched: speculative). A right guess costs nothing; a wrong one flushes the guessed instructions (red) and refetches. <b>SM warp scheduler</b>: no prediction and no speculation. A warp that reaches a branch waits for its target (amber), and the scheduler issues another warp’s instruction in that slot. Real pipelines have many more stages, so a CPU’s mispredictions cost more cycles than drawn here. Nsight Compute reports the GPU-side wait as a “branch resolving” stall.`,
    });
    const host = el('div', { class: 'hwa-w' });
    f.stage.append(host);
    f.stage.append(el('div', { class: 'hwa-legend', html: '<span><i class="hwa-sw-corea"></i>instruction in a stage (CPU thread; SM warp A)</span><span><i class="hwa-sw-core"></i>SM warp B</span><span><i class="hwa-sw-hatch"></i>speculative: fetched past an unresolved branch</span><span><i class="hwa-sw-idle"></i>flushed: wasted work</span><span><i class="hwa-sw-control"></i>warp waiting for its branch target</span>' }));
    const NC = 8; // cycles drawn
    let k = 0, right = true, E = null, PW = 0;
    // rows: [label, fetch cycle, kind]; kind: n normal, b branch, s speculative (guessed path), t refetched (correct path)
    const CPU = (ok) => ok
      ? [['add', 1, 'n'], ['mul', 2, 'n'], ['branch', 3, 'b'], ['guess 1', 4, 's'], ['guess 2', 5, 's'], ['next', 6, 'n'], ['next', 7, 'n'], ['next', 8, 'n']]
      : [['add', 1, 'n'], ['mul', 2, 'n'], ['branch', 3, 'b'], ['guess 1', 4, 's'], ['guess 2', 5, 's'], ['target 1', 6, 't'], ['target 2', 7, 't'], ['target 3', 8, 't']];
    const SMR = [['A · add', 1, 'n', 'A'], ['A · mul', 2, 'n', 'A'], ['A · branch', 3, 'b', 'A'], ['B · ld', 4, 'n', 'B'], ['B · add', 5, 'n', 'B'], ['A · target 1', 6, 'n', 'A'], ['A · target 2', 7, 'n', 'A'], ['B · mul', 8, 'n', 'B']];
    const RESOLVE = 5; // the branch fetched on cycle 3 finishes X at the end of cycle 5
    const ST = ['F', 'D', 'X', 'W'];
    const oC = GG.ui.stat(f.readouts, { label: 'CPU · fetch slots wasted', value: '—', tone: 'danger' });
    const oS = GG.ui.stat(f.readouts, { label: 'SM · issue slots wasted', value: '0', tone: 'core' });
    const oK = GG.ui.stat(f.readouts, { label: 'cycle', value: '—' });
    function build(w) {
      host.innerHTML = '';
      const narrow = w < 640;
      const pw = narrow ? w : (w - 28) / 2, lab = narrow ? 74 : 88;
      const cw = (pw - lab) / NC, rh = narrow ? 19 : 21, head = 40;
      const panH = head + 8 * rh + 30;
      const H = narrow ? 2 * panH + 16 : panH;
      const svg = svgRoot(host, w, H, 'Two pipeline diagrams, cycles left to right, one instruction per row. Left: a CPU core predicts a branch and fetches two speculative instructions; they are kept if the guess was right or flushed if it was wrong. Right: an SM warp scheduler issues another warp’s instructions while warp A waits for its branch, so no slot is wasted.');
      const D = defs(svg);
      const panel = (ox, oy, title, col, rows, isCpu) => {
        tx(svg, ox, oy + 9, title, { size: narrow ? 10.5 : 11.5, fill: col, weight: 600, ls: '0.06em' });
        for (let c = 0; c < NC; c++) tx(svg, ox + lab + c * cw + cw / 2, oy + 28, String(c + 1), { size: 9.5, anchor: 'middle', fill: 'var(--ink-3)' });
        tx(svg, ox, oy + 28, 'cycle', { size: 9.5, fill: 'var(--ink-3)' });
        const colHL = rect(svg, ox + lab, oy + 18, cw, 8 * rh + 18, { fill: 'rgba(255,138,91,0.07)', stroke: 'var(--accent)', rx: 3, sw: 1 });
        const out = { rows: [], colHL, ox, oy, isCpu };
        rows.forEach((r, i) => {
          const y = oy + head + i * rh;
          const lt = tx(svg, ox, y + rh / 2, r[0], { size: narrow ? 9.5 : 10.5, fill: 'var(--ink-2)' });
          const cells = ST.map((stg, q) => {
            const c = r[1] - 1 + q;
            if (c >= NC) return null;
            const g = S('g', {}, svg);
            const rr = rect(g, ox + lab + c * cw + 1, y + 1.5, cw - 2, rh - 3, { fill: 'var(--core-a)', stroke: 'var(--core)', rx: 3 });
            const t = tx(g, ox + lab + c * cw + cw / 2, y + rh / 2, stg, { size: narrow ? 9.5 : 10, anchor: 'middle', fill: 'var(--ink)', weight: 600 });
            return { g, rr, t, c };
          });
          // the SM's warp A waits for its branch target: an amber bar on cycles 4..5, in the row of A's next instruction
          let wait = null;
          if (!isCpu && r[0] === 'A · target 1') {
            wait = S('g', {}, svg);
            const yy = y;
            rect(wait, ox + lab + 3 * cw + 1, yy + 1, 2 * cw - 2, rh - 4, { fill: 'var(--control-a)', stroke: 'var(--control)', rx: 3, dash: '3 2' });
            tx(wait, ox + lab + 4 * cw, yy + rh / 2 - 1, narrow ? 'A waits' : 'A waits for target', { size: narrow ? 8.5 : 9.5, anchor: 'middle', fill: 'var(--control)' });
          }
          out.rows.push({ r, lt, cells, wait });
        });
        out.say = tx(svg, ox, oy + head + 8 * rh + 18, '', { size: narrow ? 9.5 : 10.5, fill: 'var(--ink)' });
        return out;
      };
      const pc = panel(0, 0, narrow ? 'CPU CORE · one thread' : 'CPU CORE · one thread, branch prediction', 'var(--host)', CPU(right), true);
      const ps = panel(narrow ? 0 : pw + 28, narrow ? panH + 16 : 0, narrow ? 'SM · warps A and B' : 'SM WARP SCHEDULER · warps A and B', 'var(--control)', SMR, false);
      E = { pc, ps, D, lab, cw };
      paint();
    }
    function paint() {
      if (!E) return;
      const cyc = k; // cycles 1..k are visible (k = 0: nothing yet)
      [E.pc, E.ps].forEach((P) => {
        P.colHL.setAttribute('x', P.ox + E.lab + Math.max(0, cyc - 1) * E.cw);
        P.colHL.style.display = cyc ? '' : 'none';
        P.rows.forEach((row) => {
          const kind = row.r[2];
          const flushed = P.isCpu && !right && kind === 's';
          row.cells.forEach((cl) => {
            if (!cl) return;
            const vis = cl.c < cyc;
            cl.g.style.display = vis ? '' : 'none';
            // speculative cells: hatched until the branch resolves; then confirmed (right) or flushed (wrong)
            const spec = P.isCpu && kind === 's' && cyc <= RESOLVE;
            const dead = flushed && cyc > RESOLVE;
            if (dead && cl.c >= RESOLVE) { cl.g.style.display = 'none'; return; }
            cl.rr.setAttribute('fill', dead ? 'var(--danger-a)' : spec ? E.D.hatch : P.isCpu || row.r[3] === 'A' ? 'var(--core-a)' : 'var(--core)');
            cl.rr.setAttribute('stroke', dead ? 'var(--danger)' : 'var(--core)');
            cl.t.setAttribute('fill', !dead && !P.isCpu && row.r[3] === 'B' ? '#0b0c12' : 'var(--ink)');
            cl.t.textContent = dead ? '✕' : ST[cl.c - (row.r[1] - 1)];
          });
          row.lt.setAttribute('fill', flushed && cyc > RESOLVE ? 'var(--danger)' : 'var(--ink-2)');
          if (row.wait) row.wait.style.display = cyc >= 4 ? '' : 'none';
        });
      });
      const wasted = right ? 0 : 2;
      oC.set(cyc > RESOLVE ? String(wasted) : 'not known yet', cyc > RESOLVE && wasted ? 'danger' : cyc > RESOLVE ? 'core' : null);
      oK.set(cyc ? `${cyc} of ${NC}` : 'start');
      E.pc.say.textContent = cyc <= 3 ? 'one instruction enters per cycle' : cyc <= RESOLVE ? 'guessing past the branch…' : right ? 'guess was right: nothing lost' : 'guess was wrong: 2 instructions flushed';
      E.pc.say.setAttribute('fill', cyc > RESOLVE && !right ? 'var(--danger)' : 'var(--ink)');
      E.ps.say.textContent = cyc <= 3 ? 'one instruction issues per cycle' : cyc <= RESOLVE ? 'A waits; B fills the slots' : 'A resumes: every slot used';
      const W = [
        `Step through the cycles. Both pipelines take one new instruction per cycle and overlap them: while one executes, the next is being decoded and the one after fetched. That is the <b>pipelining</b> both have.`,
        `<b>Cycle 1.</b> Each pipeline fetches its first instruction (F).`,
        `<b>Cycle 2.</b> The first instruction moves on to decode (D) while the second is fetched: two instructions in flight.`,
        `<b>Cycle 3.</b> A <b>branch</b> enters both pipelines. Where it goes is known only after its execute stage (X), at the end of cycle 5.`,
        `<b>Cycle 4.</b> The CPU does not wait: its <b>branch predictor</b> guesses the target and it keeps fetching down that path, <b>speculatively</b> (hatched). The SM has no predictor: warp A cannot issue until it knows its next instruction, so the warp scheduler issues warp <b>B</b>’s instead.`,
        `<b>Cycle 5.</b> The branch executes. The CPU has fetched two guessed instructions; the SM has issued a second instruction from warp B. Neither pipeline has an empty slot.`,
        right
          ? `<b>Cycle 6. The guess was right</b>: the CPU keeps its speculative work and loses nothing. This is the common case, and why every contemporary high-performance CPU predicts and speculates. The SM’s warp A now knows its target and issues again.`
          : `<b>Cycle 6. The guess was wrong</b>: the CPU <b>flushes</b> the two guessed instructions (red) and starts fetching the real target, two slots lost. Real high-performance CPUs have pipelines of a dozen or more stages, so a miss costs more. The SM lost nothing: its slots went to warp B, and warp A resumes now.`,
        `<b>Cycle 7.</b> Both pipelines are full again.`,
        `<b>Cycle 8.</b> Over these 8 cycles the SM issued on every cycle without ever guessing: with enough warps there is almost always one whose next instruction is known and ready. Its control logic can stay simple and small, which leaves area for arithmetic (Fig. 6).`,
      ];
      f.setWhy(W[cyc]);
    }
    const stepper = GG.ui.stepper(f.controls, { label: 'Cycle', steps: Array.from({ length: NC + 1 }, (_, i) => ({ label: i ? 'cycle ' + i : 'start' })), onStep: (i) => { k = i; paint(); }, autoplay: 1500 });
    GG.ui.seg(f.controls, { label: 'CPU’s branch guess', value: true, onChange: (v) => { right = v; if (PW) build(PW); }, options: [{ value: true, label: 'right' }, { value: false, label: 'wrong' }] });
    onWidth(host, (w) => { PW = w; build(w); });
    stepper.go(GG.reducedMotion ? NC : 6);
  }

  /* Fig: CPU vs GPU parallel threads and watts per thread */
  function cpuGpuCalc(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Parallel threads and watts per thread', hint: 'drag any input', wide: true,
      caption: `Opens on the glossary’s comparison: an ${X('https://www.techpowerup.com/cpu-specs/epyc-9965.c3904', 'AMD EPYC 9965')} CPU (192 cores, 2 threads each, 500 W at most) and an H100 SXM GPU (132 SMs, 4 warp schedulers each issuing to 32 threads per clock, 700 W at most). “Parallel” means every one of these threads can make progress on the same clock cycle. Bars are to scale.`,
    });
    const st = { cores: 192, smt: 2, cw: 500, sms: 132, gw: 700 };
    const wrap = el('div', { class: 'hwa-cmp' });
    f.stage.append(wrap);
    const mkRow = (nm, sub) => {
      const r = el('div', { class: 'hwa-cmp-row' });
      const small = el('small', { text: sub });
      r.append(el('div', { class: 'nm' }, nm, small));
      const right = el('div');
      const eq = el('div', { class: 'eq' });
      right.append(eq);
      r.append(right);
      wrap.append(r);
      return { eq, small, sub };
    };
    const rc = mkRow('CPU', 'AMD EPYC 9965'), rg = mkRow('GPU', 'NVIDIA H100 SXM');
    const bars = el('div', { class: 'hwa-bars' });
    const bar = (label, tone) => { const b = el('div', { class: 'hwa-bar' }); const i = el('i', { style: `background:${tone}` }); const sp = el('span'); b.append(i, sp); return { b, i, sp, label }; };
    const bT = [bar('CPU', 'var(--host)'), bar('GPU', 'var(--core)')];
    const bW = [bar('CPU', 'var(--host)'), bar('GPU', 'var(--core)')];
    bars.append(el('div', { class: 'hwa-bar-l', text: 'threads in parallel' }), bT[0].b, bT[1].b, el('div', { class: 'hwa-bar-l', text: 'watts per parallel thread' }), bW[0].b, bW[1].b);
    wrap.append(bars);
    const s1 = GG.ui.slider(f.controls, { label: 'CPU cores', min: 8, max: 256, step: 1, value: st.cores, onInput: (v) => { st.cores = v; upd(); } });
    const s2 = GG.ui.slider(f.controls, { label: 'CPU max power', min: 50, max: 1000, step: 10, value: st.cw, format: (v) => v + ' W', onInput: (v) => { st.cw = v; upd(); } });
    const s3 = GG.ui.slider(f.controls, { label: 'GPU SMs', min: 8, max: 144, step: 1, value: st.sms, onInput: (v) => { st.sms = v; upd(); } });
    const s4 = GG.ui.slider(f.controls, { label: 'GPU max power', min: 100, max: 1500, step: 10, value: st.gw, format: (v) => v + ' W', onInput: (v) => { st.gw = v; upd(); } });
    GG.ui.button(f.controls, { label: 'Glossary’s inputs', icon: 'reset', onClick: () => { st.cores = 192; st.cw = 500; st.sms = 132; st.gw = 700; s1.set(192); s2.set(500); s3.set(132); s4.set(700); upd(); } });
    const oCT = GG.ui.stat(f.readouts, { label: 'CPU W / thread', value: '—', tone: 'host' });
    const oGT = GG.ui.stat(f.readouts, { label: 'GPU W / thread', value: '—', tone: 'core' });
    const oR = GG.ui.stat(f.readouts, { label: 'GPU threads ÷ CPU', value: '—' });
    const oP = GG.ui.stat(f.readouts, { label: 'CPU W/thread ÷ GPU', value: '—' });
    const wfmt = (w) => (w >= 0.1 ? GG.fmt.fixed(w, 2) + ' W' : GG.fmt.fixed(w * 100, 2) + ' cW');
    function upd() {
      const ct = st.cores * st.smt, gt = st.sms * 4 * 32;
      const cwt = st.cw / ct, gwt = st.gw / gt;
      rc.eq.innerHTML = `<b>${fmt.int(st.cores)}</b> cores × <b>${st.smt}</b> threads = <b>${fmt.int(ct)}</b> threads · ${fmt.int(st.cw)} W ÷ ${fmt.int(ct)} = <b>${wfmt(cwt)}</b> per thread`;
      rg.eq.innerHTML = `<b>${fmt.int(st.sms)}</b> SMs × <b>4</b> warp schedulers × <b>32</b> threads = <b>${fmt.int(gt)}</b> threads · ${fmt.int(st.gw)} W ÷ ${fmt.int(gt)} = <b>${wfmt(gwt)}</b> per thread`;
      const mT = Math.max(ct, gt), mW = Math.max(cwt, gwt);
      bT[0].i.style.width = (ct / mT * 100).toFixed(2) + '%'; bT[0].sp.textContent = 'CPU · ' + fmt.int(ct);
      bT[1].i.style.width = (gt / mT * 100).toFixed(2) + '%'; bT[1].sp.textContent = 'GPU · ' + fmt.int(gt);
      bW[0].i.style.width = (cwt / mW * 100).toFixed(2) + '%'; bW[0].sp.textContent = 'CPU · ' + wfmt(cwt);
      bW[1].i.style.width = (gwt / mW * 100).toFixed(2) + '%'; bW[1].sp.textContent = 'GPU · ' + wfmt(gwt);
      oCT.set(wfmt(cwt)); oGT.set(wfmt(gwt));
      oR.set('×' + GG.fmt.sig(gt / ct, 3)); oP.set('×' + GG.fmt.sig(cwt / gwt, 3));
      const glossary = st.cores === 192 && st.cw === 500 && st.sms === 132 && st.gw === 700;
      rc.small.textContent = st.cores === 192 && st.cw === 500 ? rc.sub : 'custom CPU';
      rg.small.textContent = st.sms === 132 && st.gw === 700 ? rg.sub : 'custom GPU';
      f.setWhy(glossary
        ? `The H100 runs <b>${fmt.int(gt)}</b> threads in parallel to the EPYC’s <b>${fmt.int(ct)}</b>: <b>${GG.fmt.sig(gt / ct, 3)}×</b> as many, for only 1.4× the power. Each GPU thread costs about <b>${wfmt(gwt)}</b> (centiwatts: hundredths of a watt), each CPU thread about <b>${wfmt(cwt)}</b>. (The glossary rounds these to “about 5 cW” and “about 1.25 W”; see the check below.) The price: each GPU thread is a far weaker processor.`
        : `With these inputs: <b>${fmt.int(gt)}</b> GPU threads vs <b>${fmt.int(ct)}</b> CPU threads in parallel (<b>${GG.fmt.sig(gt / ct, 3)}×</b>), at <b>${wfmt(gwt)}</b> vs <b>${wfmt(cwt)}</b> per thread.`);
    }
    upd();
  }

  /* Fig: 384 vs 16,896 vs 270,336 threads, one mark per thread; "packed" gathers them into CPU-sized blocks */
  function threadCanvas(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Every thread, drawn', hint: 'pick a count · pack the threads · step a cycle', wide: true,
      caption: 'Top, “per SM”: one mark per thread, all at the same scale. Top left, the 384 threads an AMD EPYC 9965 runs in parallel; below it, an H100 SXM’s SMs, each holding up to 2,048 threads as 64 warps (a warp is a row of 32 marks, two warps per line; phones show the first 24 of the 132 SMs). “Packed” slides the threads together into blocks of 384, the size of the whole CPU, so the counts can be compared by area: 16,896 parallel threads are 44 such blocks, 270,336 resident threads are 704. Bottom: SM 0 magnified, one dot per thread, its 64 warps grouped by the warp scheduler they belong to (each warp belongs to one of the four schedulers, 16 per scheduler at full occupancy; NVIDIA does not document which warp goes where, so we simply draw scheduler q with warps q, q + 4, q + 8, …), with the CPU’s 384 threads at the same dot size. On every clock cycle each scheduler issues to one of its warps (green): 4 × 32 = 128 threads per SM advance in parallel while the other resident warps wait their turn.',
    });
    const box = el('div', { class: 'hwa-cvwrap' });
    f.stage.append(box);
    let mode = 'conc', lay = 'spread', gT = 0, cyc = 0;
    const cv = GG.canvas(box, { height: (w) => curH(w), label: 'One mark per thread: 384 CPU threads, and an H100’s SMs with 2,048 resident threads each, of which 128 per SM are issued each cycle. In the packed layout the same threads are gathered into blocks of 384.' });
    const zbox = el('div', { class: 'hwa-cvwrap', style: 'margin-top:14px' });
    f.stage.append(zbox);
    const cz = GG.canvas(zbox, { height: (w) => zlayout(w).H, label: 'Magnified: SM 0’s 64 warps of 32 threads, one dot per thread, in four columns, one per warp scheduler; one warp per column is issued this cycle. Beside them, the CPU’s 384 threads at the same scale.' });
    const issued = new Uint8Array(132 * 4);
    const mono = () => (getComputedStyle(document.body).getPropertyValue('--font-mono') || 'monospace');
    /* "per SM" layout. Phones draw the first 24 SMs only, so a thread stays at least ~1.3 px wide. */
    function layout(w) {
      const narrow = w < 640;
      const cols = narrow ? 4 : 12, nSM = narrow ? 24 : 132, rows = Math.ceil(nSM / cols), gap = narrow ? 4 : 6;
      const s = (w - (cols - 1) * gap) / (cols * 64);
      const tw = 64 * s, th = 32 * s;
      const top = 6 * s + 34;
      const H = Math.round(top + rows * (th + gap) + (narrow ? 22 : 4));
      return { w, cols, rows, nSM, gap, s, tw, th, top, H, narrow };
    }
    /* "packed" layout: block 0 is the CPU (384 threads = 6 lines of 64); then one block per 384 GPU threads */
    function glayout(w, m) {
      const narrow = w < 640, gap = narrow ? 2 : 3;
      const n = m === 'conc' ? 704 : 44;
      const maxH = narrow ? 540 : 580;
      let sg = layout(w).s, bc = 1, rows = 1, H = 0, gTop = 0;
      for (let it = 0; it < 60; it++) {
        const bw = 64 * sg, bh = 6 * sg;
        bc = Math.max(1, Math.floor((w + gap) / (bw + gap)));
        rows = Math.ceil(n / bc);
        gTop = 18 + bh + 34;
        H = Math.round(gTop + rows * (bh + gap) + 6);
        if (H <= maxH) break;
        sg *= 0.95;
      }
      return { n, sg, bw: 64 * sg, bh: 6 * sg, bc, rows, gap, gTop, H, narrow };
    }
    const curH = (w) => Math.max(lay === 'gather' || gT > 0 ? glayout(w, mode).H : 0, lay === 'spread' || gT < 1 ? layout(w).H : 0);
    function refit() {
      if (!cv.w) return;
      const h = curH(cv.w);
      if (h === cv.h) return;
      cv.h = h;
      cv.canvas.width = Math.round(cv.w * cv.dpr); cv.canvas.height = Math.round(h * cv.dpr);
      cv.canvas.style.height = h + 'px';
      cv.ctx.setTransform(cv.dpr, 0, 0, cv.dpr, 0, 0);
    }
    /* zoom: 4 scheduler columns of 16 warps × 32 dots (2 × 2 on phones), plus the CPU's 384 threads at the same pitch */
    function zlayout(w) {
      const narrow = w < 640;
      const ml = 12, gs = 14, gb = narrow ? 0 : 34;
      const p = narrow ? Math.min(7, (w - ml * 2 - gs) / 64) : Math.min(8, (w - 5 * ml - 3 * gs - gb) / 160);
      const colW = 32 * p, head = 34, blockH = head + 16 * p;
      const blocks = [];
      for (let q = 0; q < 4; q++) {
        const x = narrow ? ml + (q % 2) * (colW + ml + gs) : ml + q * (colW + ml + gs);
        const y = narrow ? 22 + Math.floor(q / 2) * (blockH + 10) : 22;
        blocks.push({ x, y: y + head, hy: y });
      }
      const cpuCols = narrow ? 64 : 32, cpuRows = 384 / cpuCols;
      const cpu = narrow ? { x: ml, y: 22 + 2 * (blockH + 10) + 26, cols: cpuCols, rows: cpuRows }
        : { x: ml + 4 * (colW + ml + gs) - gs + gb, y: 22 + head, cols: cpuCols, rows: cpuRows };
      const H = Math.round(narrow ? cpu.y + cpuRows * p + 34 : 22 + blockH + 34);
      return { w, narrow, p, ml, colW, blocks, cpu, H };
    }
    function pick() { for (let i = 0; i < issued.length; i++) issued[i] = (Math.random() * 16) | 0; }
    pick();
    /* where issued warp j (SM j >> 2, scheduler j & 3) sits in each layout */
    const spreadPos = (L, j) => {
      const k = j >> 2, q = j & 3;
      if (k >= L.nSM) return null;
      const x0 = (k % L.cols) * (L.tw + L.gap), y0 = L.top + Math.floor(k / L.cols) * (L.th + L.gap);
      const wv = issued[j] * 4 + q; // drawn: scheduler q with warps q, q+4, q+8, …
      return { x: x0 + (wv % 2) * 32 * L.s, y: y0 + (wv >> 1) * L.s, w: 32 * L.s, h: L.s };
    };
    const gatherPos = (G, j) => {
      const b = Math.floor(j / 12), m = j % 12;
      const bx = (b % G.bc) * (G.bw + G.gap), by = G.gTop + Math.floor(b / G.bc) * (G.bh + G.gap);
      return { x: bx + (m & 1) * 32 * G.sg, y: by + (m >> 1) * G.sg, w: 32 * G.sg, h: G.sg };
    };
    const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    function drawSpread(c, C, L, alpha, greens) {
      const { s, tw, th, gap, top, cols } = L;
      c.globalAlpha = alpha;
      const cpuOn = mode === 'cpu';
      c.fillStyle = GG.alpha(C.host, cpuOn ? 1 : 0.75);
      for (let r = 0; r < 6; r++) c.fillRect(0, 6 + r * s, 64 * s - 0.25, Math.max(0.6, s - 0.25));
      c.font = `500 ${L.narrow ? 10 : 11}px ${mono()}`;
      c.fillStyle = cpuOn ? C.host : C.ink2;
      c.fillText('◀ CPU · 384 threads in parallel', 64 * s + 10, 6 + 3 * s);
      c.fillStyle = cpuOn ? C.ink3 : C.ink2;
      c.fillText(L.narrow ? 'GPU · SMs 0–23 of 132 · 2,048 threads each' : 'GPU · 132 SMs × 64 warps × 32 threads', 0, top - 14);
      for (let k = 0; k < L.nSM; k++) {
        const x0 = (k % cols) * (tw + gap), y0 = top + Math.floor(k / cols) * (th + gap);
        c.fillStyle = GG.alpha(C.ink2, mode === 'conc' ? 0.34 : mode === 'par' ? 0.07 : 0.05);
        for (let wv = 0; wv < 64; wv++) c.fillRect(x0 + (wv % 2) * 32 * s, y0 + (wv >> 1) * s, 32 * s - 0.4, Math.max(0.5, s - 0.3));
        if (k === 0) { c.strokeStyle = C.accent; c.lineWidth = 1.5; c.strokeRect(x0 - 1.5, y0 - 1.5, tw + 3, th + 3); }
      }
      if (greens && mode !== 'cpu') {
        c.fillStyle = C.core;
        for (let j = 0; j < 132 * 4; j++) { const p = spreadPos(L, j); if (p) c.fillRect(p.x, p.y, p.w - 0.4, Math.max(0.8, p.h - 0.3)); }
      }
      if (L.narrow) { c.fillStyle = C.ink3; c.font = `500 9.5px ${mono()}`; c.fillText('… and 108 more SMs like these (all 132 in “packed”)', 0, L.H - 8); }
      c.globalAlpha = 1;
    }
    function drawGather(c, C, G, alpha, greens) {
      c.globalAlpha = alpha;
      c.font = `500 ${G.narrow ? 10 : 11}px ${mono()}`;
      c.textBaseline = 'middle';
      c.fillStyle = mode === 'cpu' ? C.host : C.ink2;
      c.fillText('CPU · 384 threads in parallel = 1 block', 0, 8);
      c.fillStyle = GG.alpha(C.host, mode === 'cpu' ? 1 : 0.8);
      c.fillRect(0, 18, G.bw, G.bh);
      c.fillStyle = mode === 'cpu' ? C.ink3 : C.ink2;
      c.fillText(mode === 'conc' ? (G.narrow ? 'GPU · 270,336 = 704 blocks · 44 green issue' : 'GPU · 270,336 resident = 704 blocks like it · the 44 green ones issue this cycle')
        : `GPU · 16,896 threads in parallel = 44 blocks like it`, 0, G.gTop - 12);
      for (let b = 0; b < G.n; b++) {
        const bx = (b % G.bc) * (G.bw + G.gap), by = G.gTop + Math.floor(b / G.bc) * (G.bh + G.gap);
        c.fillStyle = b < 44 ? (greens ? GG.alpha(C.core, mode === 'cpu' ? 0.25 : 1) : GG.alpha(C.core, 0.12)) : GG.alpha(C.ink2, 0.34);
        c.fillRect(bx, by, G.bw - 0.5, G.bh - 0.5);
      }
      c.globalAlpha = 1;
    }
    function draw() {
      const c = cv.ctx, C = GG.colors();
      if (!cv.w) return;
      const L = layout(cv.w), G = glayout(cv.w, mode);
      c.clearRect(0, 0, cv.w, cv.h);
      c.textBaseline = 'middle';
      const t = ease(gT);
      if (t <= 0) drawSpread(c, C, L, 1, true);
      else if (t >= 1) drawGather(c, C, G, 1, true);
      else {
        drawSpread(c, C, L, 1 - t, false);
        drawGather(c, C, G, t, false);
        if (mode !== 'cpu') {
          c.fillStyle = C.core;
          for (let j = 0; j < 132 * 4; j++) {
            const a = spreadPos(L, j) || { x: (j % 64) * 4, y: L.H - 4, w: 32 * L.s, h: L.s }, z = gatherPos(G, j);
            c.fillRect(a.x + (z.x - a.x) * t, a.y + (z.y - a.y) * t, a.w + (z.w - a.w) * t, Math.max(0.8, a.h + (z.h - a.h) * t));
          }
        }
      }
      drawZoom();
    }
    function drawZoom() {
      const c = cz.ctx, C = GG.colors();
      if (!cz.w) return;
      const Z = zlayout(cz.w), p = Z.p, d = Math.max(1.6, p - 1.4);
      c.clearRect(0, 0, cz.w, cz.h);
      c.textBaseline = 'middle';
      c.font = `600 ${Z.narrow ? 10 : 11}px ${mono()}`;
      c.fillStyle = C.accent;
      c.fillText(Z.narrow || lay === 'gather' ? 'ZOOM · SM 0, one dot per thread' : 'ZOOM · SM 0 (outlined above), one dot per thread', Z.ml, 9);
      const resA = mode === 'conc' ? 0.5 : mode === 'par' ? 0.16 : 0.12;
      Z.blocks.forEach((b, q) => {
        c.font = `600 ${Z.narrow ? 9.5 : 10.5}px ${mono()}`;
        c.fillStyle = mode === 'cpu' ? C.ink3 : C.control;
        c.fillText(`Warp Scheduler ${q}`, b.x, b.hy + 9);
        c.font = `500 ${Z.narrow ? 9 : 10}px ${mono()}`;
        c.fillStyle = C.ink3;
        c.fillText(Z.narrow ? '16 of its warps' : `its 16 warps (drawn as ${q}, ${q + 4}, …)`, b.x, b.hy + 23);
        const iw = issued[q];
        for (let r = 0; r < 16; r++) {
          const on = r === iw && mode !== 'cpu';
          c.fillStyle = on ? C.core : GG.alpha(C.ink2, resA);
          const y = b.y + r * p;
          for (let t = 0; t < 32; t++) c.fillRect(b.x + t * p, y, d, d);
          if (on) {
            c.fillStyle = C.control;
            c.beginPath(); c.moveTo(b.x - 10, y + d / 2 - 4); c.lineTo(b.x - 3, y + d / 2); c.lineTo(b.x - 10, y + d / 2 + 4); c.closePath(); c.fill();
          }
        }
      });
      const cu = Z.cpu;
      c.font = `600 ${Z.narrow ? 9.5 : 10.5}px ${mono()}`;
      c.fillStyle = C.host;
      c.fillText('CPU · 384 threads', cu.x, cu.y - 25);
      c.font = `500 ${Z.narrow ? 9 : 10}px ${mono()}`;
      c.fillStyle = C.ink3;
      c.fillText('same dot size', cu.x, cu.y - 11);
      c.fillStyle = GG.alpha(C.host, mode === 'cpu' ? 1 : 0.7);
      for (let i = 0; i < 384; i++) c.fillRect(cu.x + (i % cu.cols) * p, cu.y + Math.floor(i / cu.cols) * p, d, d);
      const fy = Z.H - 12;
      c.font = `500 ${Z.narrow ? 9.5 : 10.5}px ${mono()}`;
      c.fillStyle = C.ink2;
      c.fillText(Z.narrow ? 'SM 0: 2,048 resident · 128 issued this cycle' : 'SM 0 alone: 2,048 threads resident (grey), 128 issued this cycle (green, one warp per scheduler)', Z.ml, fy);
    }
    cv.onResize(() => draw());
    cz.onResize(() => drawZoom());
    const sCount = GG.ui.stat(f.readouts, { label: 'threads shown', value: '—' });
    const sX = GG.ui.stat(f.readouts, { label: '× the CPU’s 384', value: '—' });
    const sC = GG.ui.stat(f.readouts, { label: 'clock cycle', value: '0' });
    const WHY = {
      cpu: '<b>384</b> CPU threads: 192 cores × 2 threads each. They are drawn at the same scale as the GPU’s threads: in the overview they fit in a strip smaller than a single SM, and in the zoom they are a fifth of what one SM holds.',
      par: '<b>16,896</b> threads in parallel (green): 132 SMs × 4 warp schedulers × 32 threads. Each of them makes progress on this clock cycle. That is <b>44×</b> the CPU’s 384. In the zoom, each of SM 0’s four schedulers points (amber arrow) at the one warp it issues this cycle. Step a cycle and the schedulers may pick different warps.',
      conc: '<b>270,336</b> concurrent threads (grey): 132 SMs × 2,048, or 64 warps of 32 per SM, all resident at once with their own registers. Only the green ones advance on this cycle; the rest are interleaved over the following cycles. That is <b>704×</b> the CPU’s 384. This is the maximum: an SM has 65,536 registers, so all 2,048 threads fit only if each uses at most 32 of them (65,536 ÷ 2,048); kernels that need more registers per thread keep fewer warps resident (see ' + T('occupancy', 'Occupancy') + ').',
    };
    const WHYG = {
      cpu: 'Packed: the CPU’s <b>384</b> threads are <b>one block</b>. Every other block in this layout holds the same number of threads, so you can count CPUs’ worth of threads.',
      par: 'Packed: the <b>16,896</b> threads the GPU runs in parallel fill <b>44 blocks</b>, each the size of the whole CPU’s 384. The scattered green lines of the per-SM view, gathered: 44× by area.',
      conc: 'Packed: the <b>270,336</b> resident threads fill <b>704 blocks</b> the size of the CPU’s 384; the 44 green blocks are the ones issuing on this cycle. Resident means each thread has its own registers in an SM’s register file, which caps the count: with 65,536 registers per SM, 2,048 threads fit only at 32 registers each or fewer (see ' + T('occupancy', 'Occupancy') + ').',
    };
    const why = () => f.setWhy((lay === 'gather' ? WHYG : WHY)[mode]);
    function setMode(m) {
      mode = m;
      const n = m === 'cpu' ? 384 : m === 'par' ? 132 * 4 * 32 : 132 * 2048;
      sCount.set(fmt.int(n), m === 'cpu' ? 'host' : m === 'par' ? 'core' : null);
      sX.set('×' + fmt.int(n / 384));
      why();
      refit();
      draw();
    }
    let gAnim = 0;
    function setLayout(v) {
      lay = v;
      why();
      cancelAnimationFrame(gAnim);
      const to = v === 'gather' ? 1 : 0;
      if (GG.reducedMotion) { gT = to; refit(); draw(); return; }
      const from = gT, t0 = performance.now(), dur = 900;
      const stepF = (now) => {
        const k = Math.min(1, (now - t0) / dur);
        gT = from + (to - from) * k;
        refit(); draw();
        if (k < 1) gAnim = requestAnimationFrame(stepF);
      };
      gAnim = requestAnimationFrame(stepF);
    }
    GG.ui.seg(f.controls, {
      label: 'Count', value: 'conc', onChange: setMode,
      options: [{ value: 'cpu', label: 'CPU · in parallel' }, { value: 'par', label: 'GPU · in parallel' }, { value: 'conc', label: 'GPU · concurrent' }],
    });
    GG.ui.seg(f.controls, { label: 'Layout', value: 'spread', onChange: setLayout, options: [{ value: 'spread', label: 'per SM' }, { value: 'gather', label: 'packed into CPU-sized blocks' }] });
    const next = () => { cyc++; pick(); sC.set(fmt.int(cyc)); draw(); };
    GG.ui.button(f.controls, { icon: 'next', label: 'Next cycle', onClick: next });
    let acc = 0;
    const anim = GG.anim(box, (t, dt) => { acc += dt; if (acc > 1) { acc = 0; next(); } }, { autostart: false });
    GG.ui.playButton(f.controls, anim);
    setMode('conc');
  }

  /* Fig: latency hiding with the cycles component */
  function smLatency(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Many warps hide latency', hint: 'add warps', wide: true,
      caption: `One warp scheduler with its 16 warp slots (64 per SM ÷ 4 schedulers), over 72 clock cycles. Each warp alternates a quick instruction (FFMA, a fused multiply-add) with a slow one (LDG, a load from GPU RAM) whose result it must wait for. With one warp the scheduler is mostly idle; add warps and, in this model, it soon finds one that is ready on every cycle. Switching costs nothing, so the waits disappear from the schedule. See ${T('latency-hiding', 'latency hiding')}, ${T('warp-execution-state', 'warp execution state')} and ${T('occupancy', 'occupancy')}. “Issue efficiency” is measured over the 72 cycles drawn, which include a start-up burst (every warp is ready on cycle 0); “steady state” is the long-run rate of the same model, warps × instructions per LDG ÷ (instructions per LDG − 1 + latency), capped at 100%.<br><b>Latencies are shrunk to fit.</b> A real load from GPU RAM takes about 480 cycles on a Hopper GPU (Luo et al. measured 478.8 on an H800, ${X('https://arxiv.org/abs/2402.13499', 'arXiv:2402.13499')}). Hiding that with one LDG every second instruction would take about (1 + 480) ÷ 2 ≈ 240 warps per scheduler, far more than the 16 a scheduler can hold, so real kernels also keep several independent loads in flight per warp.`,
    });
    const cy = GG.components.cycles(f, { simulate: { warps: 1, latency: 8, issueEvery: 2, slots: 16, cycles: 72, ops: { long: 'LDG', short: 'FFMA' } }, simControls: true, animate: false });
    const oSt = GG.ui.stat(f.readouts, { label: 'steady state (long run)', value: '—', tone: 'special' });
    const upd = () => {
      const sc = cy && cy.scenario && cy.scenario();
      const m = sc && sc.meta;
      if (!m) return;
      oSt.set(m.warps ? `${GG.fmt.fixed(m.steady * 100, 1)}%` : '—');
    };
    // the component's sliders re-run the simulation on 'input'; this listener on their container runs after them
    f.controls.addEventListener('input', () => requestAnimationFrame(upd));
    upd();
  }

  /* Fig: CPU vs GPU, area for compute, control and cache */
  function areaFigure(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Where the silicon goes', hint: 'pick a kind of hardware', wide: true,
      caption: `GPUs dedicate more of their area to compute (green), and less to control and caching (amber and blue), than CPUs do. Redrawn from the glossary’s figure, which modified a diagram in ${X('https://fabiensanglard.net/cuda', 'Fabien Sanglard’s blog')}, itself likely modified from a diagram in ${X('https://docs.nvidia.com/cuda/cuda-c-programming-guide/', 'the CUDA C Programming Guide')}. A schematic: the shares are of the drawing, not of a real die.`,
    });
    const host = el('div', { class: 'hwa-w' });
    f.stage.append(host);
    f.stage.append(el('div', { class: 'hwa-legend', html: '<span><i class="hwa-sw-core"></i>compute (ALUs)</span><span><i class="hwa-sw-control"></i>control</span><span><i class="hwa-sw-memory"></i>cache</span>' }));
    let hl = 'all', parts = [];
    const area = { cpu: { compute: 0, control: 0, cache: 0 }, gpu: { compute: 0, control: 0, cache: 0 } };
    const rd = {
      cpu: GG.ui.stat(f.readouts, { label: 'CPU · compute', value: '—', tone: 'host' }),
      gpu: GG.ui.stat(f.readouts, { label: 'GPU · compute', value: '—', tone: 'core' }),
    };
    function build(W) {
      host.innerHTML = '';
      parts = [];
      for (const k of ['cpu', 'gpu']) area[k] = { compute: 0, control: 0, cache: 0 };
      const narrow = W < 640;
      const pw = narrow ? W : (W - 30) / 2, ph = pw * 0.68;
      const H = narrow ? 2 * (ph + 30) + 10 : ph + 34;
      const svg = svgRoot(host, W, H, 'Schematic of a CPU and a GPU. The CPU: a large control block, four ALUs and a large cache. The GPU: seven rows, each with a tiny control block, a tiny cache and twelve ALUs.');
      const add = (chip, kind, x, y, w, h, label) => {
        const col = { compute: 'var(--core)', control: 'var(--control)', cache: 'var(--memory)' }[kind];
        const bg = { compute: 'var(--core-a)', control: 'var(--control-a)', cache: 'var(--memory-a)' }[kind];
        const g = S('g', { 'data-k': kind }, svg);
        rect(g, x, y, w, h, { fill: bg, stroke: col, rx: 2 });
        if (label) tx(g, x + w / 2, y + h / 2, label, { anchor: 'middle', size: narrow ? 10 : 12, fill: col, ls: '0.08em' });
        parts.push({ g, kind });
        area[chip][kind] += w * h;
      };
      // CPU (reference geometry 600 × 410)
      const cpu = (ox, oy) => {
        const s = pw / 600;
        rect(svg, ox, oy, pw, 410 * s, { stroke: 'var(--line-2)', fill: 'rgba(255,255,255,0.02)', rx: 4 });
        add('cpu', 'control', ox + 12 * s, oy + 12 * s, 290 * s, 207 * s, 'CONTROL');
        for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) add('cpu', 'compute', ox + (315 + c * 144) * s, oy + (12 + r * 111) * s, 131 * s, 96 * s, 'ALU');
        add('cpu', 'cache', ox + 12 * s, oy + 234 * s, 578 * s, 165 * s, 'CACHE');
        tx(svg, ox + pw / 2, oy + 410 * s + 18, 'CPU', { anchor: 'middle', size: 15, fill: 'var(--ink)', family: 'var(--font-display)', weight: 700, ls: '0.08em' });
      };
      const gpu = (ox, oy) => {
        const s = pw / 731;
        rect(svg, ox, oy, pw, 408 * s, { stroke: 'var(--line-2)', fill: 'rgba(255,255,255,0.02)', rx: 4 });
        for (let r = 0; r < 7; r++) {
          const y = oy + (6 + r * 57) * s;
          add('gpu', 'control', ox + 6 * s, y, 34 * s, 24 * s);
          add('gpu', 'cache', ox + 6 * s, y + 28 * s, 34 * s, 24 * s);
          for (let c = 0; c < 12; c++) add('gpu', 'compute', ox + (46 + c * 56.6) * s, y, 53 * s, 53 * s);
        }
        tx(svg, ox + pw / 2, oy + 408 * s + 18, 'GPU', { anchor: 'middle', size: 15, fill: 'var(--ink)', family: 'var(--font-display)', weight: 700, ls: '0.08em' });
      };
      if (narrow) { cpu(0, 0); gpu(0, ph + 40); } else { cpu(0, 0); gpu(pw + 30, 0); }
      apply();
    }
    const share = (chip, k) => { const a = area[chip]; const t = a.compute + a.control + a.cache; return t ? a[k] / t : 0; };
    function apply() {
      parts.forEach((p) => p.g.classList.toggle('hwa-dim', hl !== 'all' && p.kind !== hl));
      const k = hl === 'all' ? 'compute' : hl;
      const nm = { compute: 'compute', control: 'control', cache: 'cache' }[k];
      rd.cpu.el.querySelector('i').textContent = 'CPU · ' + nm;
      rd.gpu.el.querySelector('i').textContent = 'GPU · ' + nm;
      rd.cpu.set(fmt.pct(share('cpu', k), 0)); rd.gpu.set(fmt.pct(share('gpu', k), 0));
      const W = {
        all: `In this drawing the CPU gives <b>${fmt.pct(share('cpu', 'compute'), 0)}</b> of its area to arithmetic units and the GPU <b>${fmt.pct(share('gpu', 'compute'), 0)}</b>. The rest of the CPU is control logic and cache: the machinery that hides latency for one thread at a time.`,
        compute: `<b>Compute.</b> Four big ALUs on the CPU, 84 small ones on the GPU. Each GPU ALU is weaker, but together they cover <b>${fmt.pct(share('gpu', 'compute'), 0)}</b> of the chip (CPU: <b>${fmt.pct(share('cpu', 'compute'), 0)}</b>).`,
        control: `<b>Control</b>: fetching, decoding, predicting and scheduling instructions. The CPU spends <b>${fmt.pct(share('cpu', 'control'), 0)}</b> of its area on it, including the sophisticated instruction prediction that keeps one thread busy. The GPU’s control is small and shared by many ALUs (<b>${fmt.pct(share('gpu', 'control'), 1)}</b>).`,
        cache: `<b>Cache.</b> The CPU’s large, hardware-managed cache (<b>${fmt.pct(share('cpu', 'cache'), 0)}</b> here) hides memory latency from programmers. The GPU keeps a little cache (<b>${fmt.pct(share('gpu', 'cache'), 1)}</b>) and hides latency by switching between warps instead.`,
      };
      f.setWhy(W[hl]);
    }
    GG.ui.seg(f.controls, {
      label: 'Show', value: 'all', onChange: (v) => { hl = v; apply(); },
      options: [{ value: 'all', label: 'everything' }, { value: 'compute', label: 'compute' }, { value: 'control', label: 'control' }, { value: 'cache', label: 'cache' }],
    });
    onWidth(host, build);
  }

  /* Fig: programmer-expressed caching in a matrix multiplication */
  function tileFigure(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Keep a chunk in cache: tiled matrix multiply', hint: 'change the tile size · play the k-loop', wide: true,
      caption: 'C = A × B for 4,096 × 4,096 matrices of 32-bit floats. The matrices are drawn as a schematic 8 × 8 grid of tiles; the real ones have (4,096 ÷ T)² tiles. To compute one tile of C (copper outline), the program walks along a row of tiles of A and a column of tiles of B (the k-loop, 4,096 ÷ T steps). Each step loads one T × T chunk of A and one of B into the SM’s fast on-chip memory (drawn to a log scale of T) and reuses every loaded value T times (the row of ticks) before moving on. Reads from GPU RAM fall by a factor of T. The traffic counts only these reads of A and B: writing C (4,096² values, 67 MB) costs the same for every T, so it is left out. The bars compare the time to move those reads with the time the arithmetic needs, on a log scale, at the H100 SXM’s 3.35 TB/s and 66.9 TFLOPS (FP32 on CUDA Cores). The compute time is a lower bound. The memory time is a simple model, not a bound: it counts every chunk as a trip to GPU RAM, while in practice the 50 MiB (NVIDIA: 50 MB) L2 cache serves some of these re-reads, so the real memory time can be shorter.',
    });
    const N = 4096, BYTES = 4, BW = 3.35e12, FL = 66.9e12;
    const host = el('div', { class: 'hwa-w' });
    f.stage.append(host);
    let T = 64, k = 0, sub = 1, E = null;
    const G = 8; // tiles drawn per side (schematic)
    const TS = [1, 4, 16, 32, 64, 128];
    GG.ui.seg(f.controls, { label: 'Tile size T (elements per side)', value: 64, options: TS.map((t) => ({ value: t, label: t === 1 ? '1 (no reuse)' : String(t) })), onChange: (v) => { T = v; build(E ? E.W : 0); upd(); } });
    const oK = GG.ui.stat(f.readouts, { label: 'k-steps per C tile', value: '—' });
    const oR = GG.ui.stat(f.readouts, { label: 'traffic into the SMs', value: '—', tone: 'memory' });
    const oM = GG.ui.stat(f.readouts, { label: 'memory time if all from GPU RAM', value: '—' });
    const oC = GG.ui.stat(f.readouts, { label: 'compute time ≥', value: fmtS(2 * N ** 3 / FL), tone: 'core' });
    const oB = GG.ui.stat(f.readouts, { label: 'limit in this model', value: '—' });
    void oC;
    function fmtS(sec) { return sec >= 1 ? GG.fmt.fixed(sec, 2) + ' s' : sec >= 1e-3 ? GG.fmt.sig(sec * 1e3, 3) + ' ms' : GG.fmt.sig(sec * 1e6, 3) + ' µs'; }
    const times = () => { const bytes = (2 * N ** 3 / T) * BYTES; return { bytes, tm: bytes / BW, tc: (2 * N ** 3) / FL }; };
    const TX = (4 * FL) / BW; // tile size where memory time = compute time
    function build(w) {
      if (!w) return;
      host.innerHTML = '';
      const narrow = w < 640;
      const cell = narrow ? Math.floor((w - 24) / (2 * G + 1.5)) : Math.min(24, Math.floor((w * 0.4) / (2 * G + 1)));
      const m = cell * G, gap = Math.round(cell * 0.9);
      const rx = narrow ? 0 : 2 * m + gap + 36, rw = narrow ? w : w - rx;
      const ry = narrow ? 2 * m + gap + 22 : 0;
      const cacheH = 132, reuseH = 54, barsH = 104;
      const H = narrow ? ry + cacheH + reuseH + barsH + 10 : Math.max(2 * m + gap + 22, cacheH + reuseH + barsH + 10);
      const svg = svgRoot(host, w, H, 'Matrices A (left), B (top) and C (bottom right) drawn as 8 × 8 tiles; one tile of C, its row of A tiles and its column of B tiles are outlined; the current pair of chunks is copied into the on-chip cache, where each value is reused T times; bars compare memory time with compute time.');
      const ax = 0, ay = m + gap, bx = m + gap, by = 0, cx = m + gap, cy = m + gap;
      const ti = 2, tj = 5;
      const grid = (x0, y0, lab) => {
        for (let r = 0; r < G; r++) for (let c = 0; c < G; c++) rect(svg, x0 + c * cell, y0 + r * cell, cell - 1.5, cell - 1.5, { fill: 'rgba(111,166,255,0.08)', stroke: 'rgba(111,166,255,0.25)', rx: 1.5 });
        tx(svg, x0 + m / 2, y0 + m / 2, lab, { anchor: 'middle', size: 26, fill: 'var(--ink-3)', family: 'var(--font-display)', weight: 700, opacity: 0.5 });
      };
      grid(ax, ay, 'A'); grid(bx, by, 'B'); grid(cx, cy, 'C');
      tx(svg, 0, 8, 'schematic: 8 × 8 tiles drawn', { size: 9.5, fill: 'var(--ink-3)' });
      tx(svg, 0, 22, `real: ${fmt.int(N / T)} × ${fmt.int(N / T)} tiles`, { size: 9.5, fill: 'var(--ink-2)' });
      rect(svg, ax - 1, ay + ti * cell - 1, m + 0.5, cell + 0.5, { stroke: 'var(--memory)', sw: 1.4, rx: 2 });
      rect(svg, bx + tj * cell - 1, by - 1, cell + 0.5, m + 0.5, { stroke: 'var(--memory)', sw: 1.4, rx: 2 });
      rect(svg, cx + tj * cell - 1, cy + ti * cell - 1, cell + 0.5, cell + 0.5, { stroke: 'var(--accent)', sw: 2, fill: 'var(--memory-a)', rx: 2 });
      const curA = rect(svg, 0, 0, cell - 1.5, cell - 1.5, { fill: 'var(--memory)', rx: 1.5 });
      const curB = rect(svg, 0, 0, cell - 1.5, cell - 1.5, { fill: 'var(--memory)', rx: 1.5 });
      const accC = rect(svg, cx + tj * cell + 2, cy + ti * cell + cell - 3, cell - 5.5, 0, { fill: 'var(--memory)', rx: 1 });
      // cache box with the two chunks, drawn on a log scale of T
      const kx = rx, ky = ry;
      rect(svg, kx, ky, rw, cacheH - 10, { fill: 'var(--memory-a)', stroke: 'var(--memory)', rx: 8 });
      tx(svg, narrow ? kx + 12 : kx + 160, narrow ? ky + 112 : ky + 16, 'SM · on-chip L1 / shared memory', { size: 10.5, fill: 'var(--memory)' });
      const side = 10 + (52 * Math.log2(T)) / 7;
      const kA = { x: kx + 14 + (62 - side) / 2, y: ky + 26 + (62 - side) / 2 }, kB = { x: kx + 84 + (62 - side) / 2, y: kA.y };
      rect(svg, kA.x, kA.y, side, side, { fill: 'var(--memory)', rx: 2 });
      rect(svg, kB.x, kB.y, side, side, { fill: 'var(--memory)', rx: 2 });
      tx(svg, kx + 45, ky + 102, 'A chunk', { anchor: 'middle', size: 9.5, fill: 'var(--memory)' });
      tx(svg, kx + 115, ky + 102, 'B chunk', { anchor: 'middle', size: 9.5, fill: 'var(--memory)' });
      const chunkB = T * T * BYTES;
      const tx0 = kx + 160;
      const kt = tx(svg, tx0, ky + 40, '', { size: narrow ? 10 : 11, fill: 'var(--ink)' });
      const kt2 = tx(svg, tx0, ky + 58, `${T} × ${T} values each, ${GG.fmt.bytes(chunkB, 1)}`, { size: narrow ? 9.5 : 10.5, fill: 'var(--ink-2)' });
      tx(svg, tx0, ky + 76, narrow ? `both: ${GG.fmt.bytes(2 * chunkB, 1)}` : `both: ${GG.fmt.bytes(2 * chunkB, 1)} of up to 228 KB of shared memory (256 KiB L1)`, { size: narrow ? 9.5 : 10.5, fill: 'var(--ink-2)' });
      if (narrow) tx(svg, tx0, ky + 90, 'of ≤ 228 KB shared', { size: 9.5, fill: 'var(--ink-2)' });
      void kt2;
      const Dm = defs(svg, 'var(--memory)');
      const arA = line(svg, [[0, 0], [0, 0]], { stroke: 'var(--memory)', dash: '3 3', arrow: Dm.arrow });
      const arB = line(svg, [[0, 0], [0, 0]], { stroke: 'var(--memory)', dash: '3 3', arrow: Dm.arrow });
      // reuse: one loaded value feeds T multiply-adds
      const uy = ky + cacheH;
      tx(svg, rx, uy + 2, T === 1 ? 'reuse of one loaded value: used once, then fetched again' : `reuse of one loaded value: ${T} multiply-adds`, { size: 10, fill: 'var(--ink-2)' });
      const tw = Math.min(10, (rw - 2) / 128), ticks = [];
      for (let i = 0; i < T; i++) ticks.push(rect(svg, rx + i * tw, uy + 12, Math.max(1, tw - 1), 16, { fill: 'var(--core-a)', rx: 0.8 }));
      const tc = tx(svg, rx + T * tw + 8, uy + 20, '', { size: 10, fill: 'var(--core)' });
      if (T * tw + 70 > rw) tc.setAttribute('x', rx + rw), tc.setAttribute('text-anchor', 'end'), tc.setAttribute('y', uy + 2);
      // log-scale bars: memory time vs compute time
      const gy = uy + reuseH, lo = 0.5e-3, hi = 0.5;
      const bl = narrow ? 60 : 74, bw = rw - bl - 4;
      const xs = (sec) => rx + bl + (Math.log10(clamp(sec, lo, hi) / lo) / Math.log10(hi / lo)) * bw;
      tx(svg, rx, gy + 2, 'time for one 4,096 × 4,096 multiply (log scale)', { size: 10, fill: 'var(--ink-2)' });
      [1e-3, 1e-2, 1e-1].forEach((v) => { S('line', { x1: xs(v), x2: xs(v), y1: gy + 12, y2: gy + 66, stroke: 'var(--line-2)', 'stroke-dasharray': '2 3' }, svg); tx(svg, xs(v), gy + 78, fmtS(v), { size: 9, anchor: 'middle', fill: 'var(--ink-3)' }); });
      const { tm, tc: tcomp } = times();
      tx(svg, rx, gy + 24, 'memory', { size: 10, fill: 'var(--memory)' });
      rect(svg, rx + bl, gy + 15, xs(tm) - rx - bl, 18, { fill: tm > tcomp ? 'var(--memory)' : 'var(--memory-a)', stroke: 'var(--memory)', rx: 3 });
      tx(svg, rx, gy + 50, 'compute', { size: 10, fill: 'var(--core)' });
      rect(svg, rx + bl, gy + 41, xs(tcomp) - rx - bl, 18, { fill: tm > tcomp ? 'var(--core-a)' : 'var(--core)', stroke: 'var(--core)', rx: 3 });
      const lim = Math.max(tm, tcomp);
      S('line', { x1: xs(lim), x2: xs(lim), y1: gy + 10, y2: gy + 64, stroke: 'var(--danger)', 'stroke-width': 1.5 }, svg);
      tx(svg, Math.min(xs(lim) + 5, rx + rw), gy + 92, `limit: ${tm > tcomp ? 'memory' : 'compute'}, ${fmtS(lim)}`, { size: 9.5, fill: 'var(--danger)', anchor: xs(lim) + 120 > rx + rw ? 'end' : 'start' });
      E = { W: w, ky, rx, m, gap, curA, curB, accC, kt, arA, arB, ax, ay, bx, by, cell, ti, tj, kA, kB, side, ticks, tc, narrow };
      paint();
    }
    function paint() {
      if (!E) return;
      const e = E, c = e.cell, steps = N / T;
      const ax = e.ax + k * c, ay = e.ay + e.ti * c, bx = e.bx + e.tj * c, by = e.by + k * c;
      e.curA.setAttribute('x', ax); e.curA.setAttribute('y', ay);
      e.curB.setAttribute('x', bx); e.curB.setAttribute('y', by);
      const h = (c - 5.5) * ((k + 1) / G);
      e.accC.setAttribute('height', h.toFixed(1));
      e.accC.setAttribute('y', (e.ay + e.ti * c + c - 3 - h).toFixed(1));
      const a = Math.round((k * steps) / G) + 1, b = Math.round(((k + 1) * steps) / G);
      e.kt.textContent = e.narrow ? `k-steps ${fmt.int(a)}–${fmt.int(b)} of ${fmt.int(steps)}` : `drawn tile ${k + 1} of 8 = k-steps ${fmt.int(a)}–${fmt.int(b)} of ${fmt.int(steps)}`;
      const lit = Math.max(1, Math.round(sub * T));
      e.ticks.forEach((r, i) => r.setAttribute('fill', i < lit ? 'var(--core)' : 'var(--core-a)'));
      e.tc.textContent = `${fmt.int(lit)} / ${fmt.int(T)}`;
      // routes that end on the chunks inside the cache box and stay clear of its title and of matrix C
      const mx = e.m, xa = ax + c / 2, kAm = e.kA.y + e.side / 2, kBc = e.kB.x + e.side / 2;
      if (e.narrow) {
        e.arA.setAttribute('points', `${xa},${ay + c} ${xa},${e.ky - 8} ${e.kA.x + e.side / 2},${e.ky - 8} ${e.kA.x + e.side / 2},${e.kA.y - 1}`);
        e.arB.setAttribute('points', `${bx + c},${by + c / 2} ${e.W - 4},${by + c / 2} ${e.W - 4},${e.ky - 4} ${kBc},${e.ky - 4} ${kBc},${e.kB.y - 1}`);
      } else {
        const band = mx + e.gap / 2;
        e.arA.setAttribute('points', `${xa},${ay} ${xa},${band} ${e.rx - 10},${band} ${e.rx - 10},${kAm} ${e.kA.x - 1},${kAm}`);
        e.arB.setAttribute('points', `${bx + c},${by + c / 2} ${e.rx - 22},${by + c / 2} ${e.rx - 22},${e.ky + 18} ${kBc},${e.ky + 18} ${kBc},${e.kB.y - 1}`);
      }
    }
    function upd() {
      const { bytes, tm, tc } = times();
      oK.set(fmt.int(N / T));
      oR.set(GG.fmt.si(bytes, 'B', 1));
      oM.set(fmtS(tm), tm > tc ? 'danger' : null);
      oB.set(tm > tc ? 'memory' : 'compute', tm > tc ? 'danger' : 'core');
      f.setWhy(T === 1
        ? `With <b>no reuse</b>, every multiply-add fetches its two inputs into the SM: 2 × 4,096³ reads, <b>${GG.fmt.si(bytes, 'B', 1)}</b>. If all of it came from GPU RAM at 3.35 TB/s, that would take <b>${fmtS(tm)}</b>, ${GG.fmt.fixed(tm / tc, 0)}× longer than the arithmetic needs.`
        : `With <b>${T} × ${T}</b> tiles, each value fetched into the SM is used ${T} times before it is evicted, so reads drop ${T}× to <b>${GG.fmt.si(bytes, 'B', 1)}</b> (<b>${fmtS(tm)}</b> if every chunk came from GPU RAM), and the k-loop has 4,096 ÷ ${T} = ${fmt.int(N / T)} steps. ${tm > tc ? `In this model memory is still the limit: the arithmetic alone needs at least ${fmtS(tc)}. L2 hits would lower the memory time. The bars cross at T ≈ ${GG.fmt.fixed(TX, 0)} (4 bytes × 66.9 TFLOPS ÷ 3.35 TB/s).` : `Now the arithmetic (at least ${fmtS(tc)}) is the limit, not memory: the much higher throughput the glossary promises. In this model memory stopped being the limit above T ≈ ${GG.fmt.fixed(TX, 0)}.`}`);
      paint();
    }
    onWidth(host, build);
    const anim = GG.anim(host, (t) => {
      const per = 1.6, ph = t / per;
      const nk = Math.floor(ph) % G;
      sub = Math.min(1, (ph % 1) / 0.8);
      if (nk !== k) k = nk;
      paint();
    });
    if (GG.reducedMotion) { k = 2; sub = 1; }
    GG.ui.playButton(f.controls, anim);
    upd();
  }

  GG.entry('streaming-multiprocessor', {
    render(body, ctx) {
      body.classList.add('hwa-body');
      const s = ctx.html(body, `
<p>When we ${T('cuda-software-platform', 'program GPUs')}, we produce ${T('streaming-assembler', 'sequences of instructions')} for its Streaming Multiprocessors to carry out. The SM is where a GPU program actually runs: it holds the program’s working data, decides which instruction goes next, and does the arithmetic.</p>
<div data-slot="sm" class="wide"></div>
<h3>Like a CPU core, only simpler</h3>
<p>Streaming Multiprocessors (SMs) of NVIDIA GPUs are roughly analogous to the cores of CPUs. That is, SMs both <strong>execute computations</strong> and <strong>store state</strong> available for computation in registers, with associated caches.</p>
<p>Compared to CPU cores, GPU SMs are simple, weak processors. Execution in SMs is <em>pipelined</em> within an instruction, as in almost all CPUs since the 1990s: each instruction passes through a series of stages (fetch, decode, execute, write back), so several instructions can be in flight at once, each in a different stage. But there is no <em>speculative execution</em> (running instructions before it is certain they are needed, for example past a branch whose direction is not yet known) and no <em>instruction pointer prediction</em> (guessing the address of the next instruction before it is computed, also called branch prediction). Every contemporary high-performance CPU does both.</p>
<div data-slot="tbl"></div>
<p>Why can the SM do without prediction and speculation? Because it has something to do instead of guessing: run another warp. Fig. 2 steps both through the same branch.</p>
<div data-slot="spec" class="wide"></div>
<h3>Many more threads in parallel</h3>
<p>What the SM lacks in sophistication it makes up in numbers: GPU SMs can execute more ${T('thread', 'threads')} in parallel.</p>
<p>For comparison: an ${X('https://www.techpowerup.com/cpu-specs/epyc-9965.c3904', 'AMD EPYC 9965')} CPU draws at most 500 W and has 192 cores, each of which can execute instructions for at most two threads at a time, for a total of <strong>384 threads in parallel</strong>, running at about 1.3 W per thread.</p>
<p>An H100 SXM GPU draws at most 700 W and has 132 SMs, each of which has four ${T('warp-scheduler', 'Warp Schedulers')} that can each issue instructions to 32 threads (aka a ${T('warp', 'warp')}) in parallel per clock cycle, for a total of 128 × 132 = <strong>16,896 parallel threads</strong>, running at about 4 cW (centiwatts, hundredths of a watt) apiece. Note that this is truly parallel: each of those 16,896 threads can make progress with each clock cycle.</p>
<div data-slot="calc" class="wide"></div>
<div data-slot="chk"></div>
<h3>Even more threads concurrently</h3>
<p>GPU SMs also support a large number of <em>concurrent</em> threads: threads of execution whose instructions are <strong>interleaved</strong>. Parallel threads advance on the same cycle; concurrent threads take turns.</p>
<p>A single SM on an H100 can concurrently execute up to 2,048 threads, split across 64 thread groups of 32 threads each (64 warps). With 132 SMs, that’s a total of 132 × 2,048 = <strong>270,336 concurrent threads</strong>, over 250,000.</p>
<div data-slot="cv" class="wide"></div>
<h3>Switching in one cycle hides latency</h3>
<p>CPUs can also run many threads concurrently: the operating system takes turns between them. But switches between ${T('warp', 'warps')} happen at the speed of a <strong>single clock cycle</strong>, over 1000× faster than context switches on a CPU, again powered by the SM’s ${T('warp-scheduler', 'Warp Schedulers')}. (The ${T('warp-scheduler', 'Warp Scheduler')} entry races the two.)</p>
<div data-slot="chk2"></div>
<p>The volume of available warps and the speed of ${T('warp-scheduler', 'warp switches')} help ${T('latency-hiding', 'hide latency')} caused by memory reads, thread synchronization, or other expensive instructions. While one warp waits, another runs, which ensures that the ${T('arithmetic-bandwidth', 'arithmetic bandwidth')} provided by the ${T('cuda-core', 'CUDA Cores')} and ${T('tensor-core', 'Tensor Cores')} is well utilized.</p>
<div data-slot="lat" class="wide"></div>
<h3>The secret: latency hiding, not latency avoidance</h3>
<p>This ${T('latency-hiding', 'latency hiding')} is the secret to GPUs’ strengths. CPUs seek to hide latency from end users and programmers by maintaining <strong>large, hardware-managed caches</strong> (which keep recently used data close, without the programmer asking) and <strong>sophisticated instruction prediction</strong>. This extra hardware limits the fraction of their silicon area, power and heat budgets that CPUs can allocate to computation.</p>
<div data-slot="area" class="wide"></div>
<p>A GPU spends that budget on arithmetic instead, and asks the programmer for help with caching. For programs or functions like <strong>neural network inference</strong> or <strong>sequential database scans</strong>, for which it is relatively straightforward for programmers to ${T('cuda-programming-model', 'express')} the behavior of ${T('l1-data-cache', 'caches')} (e.g. store a chunk of each input matrix and keep it in cache for long enough to compute the related outputs), the result is much higher throughput. Fig. 7 shows that chunk-keeping on a matrix multiplication, the core of neural network inference.</p>
<div data-slot="tile" class="wide"></div>
${GG.noteHTML('intuition', '<p>A CPU core is a brilliant solo performer that never wants to wait: it predicts, speculates and caches so that its one or two threads keep moving. An SM is a conductor with 64 slow players: any one of them may be waiting at any moment, but there is almost always someone ready to play, and the SM never wastes a beat switching between them.</p>')}
<div data-slot="read"></div>`);
      guard(s.sm, 'SM floorplan', () => smAnchor(s.sm, ctx));
      guard(s.spec, 'Branch figure', () => specFigure(s.spec, ctx));
      s.tbl.outerHTML = GG.tableHTML(`<thead><tr><th>Feature</th><th>High-performance CPU core</th><th>GPU SM (H100)</th></tr></thead><tbody>
<tr><td>Executes computations, holds state in registers and caches</td><td>yes</td><td>yes</td></tr>
<tr><td>Pipelined execution within an instruction</td><td>yes (almost all CPUs since the 1990s)</td><td>yes</td></tr>
<tr><td>Speculative execution</td><td>yes</td><td class="c-danger">no</td></tr>
<tr><td>Instruction pointer (branch) prediction</td><td>yes</td><td class="c-danger">no</td></tr>
<tr><td>Threads in parallel (per core / per SM)</td><td class="num">2</td><td class="num c-core">128</td></tr>
<tr><td>Threads resident in hardware at once (per core / per SM)</td><td class="num">2</td><td class="num c-core">2,048</td></tr>
<tr><td>Cost of switching threads</td><td>a CPU context switch: hundreds to thousands of cycles</td><td class="c-core">one clock cycle</td></tr></tbody>`);
      guard(s.calc, 'CPU vs GPU calculator', () => cpuGpuCalc(s.calc, ctx));
      ctx.note(s.chk, { type: 'check', html: '<p>The glossary rounds these. 500 W ÷ 384 threads = <b>1.30 W</b> per thread (it says “about 1.25 W”). 128 × 132 = <b>16,896</b> parallel threads (it says “&gt; 16,000”), and 700 W ÷ 16,896 = 0.0414 W = <b>4.1 cW</b> per thread (it says “about 5 cW”). The conclusion stands either way: about 44× the threads, each at about 1/31 of the power.</p>' });
      ctx.note(s.chk2, { type: 'check', html: `<p><b>How much faster?</b> The ${T('warp-scheduler', 'Warp Scheduler')} entry puts a full CPU context switch at “a few hundred to a few thousand clock cycles”. Against one cycle for a warp switch, that is a ratio of a few hundred to a few thousand, so “over 1000×” holds for the slower switches, the ones that take about a microsecond. Counting in time instead of cycles: a CPU’s clock runs at a few GHz, so 1,000 of its cycles last a few hundred nanoseconds, while an H100 warp switch takes one cycle at up to 1.98 GHz, about half a nanosecond. Either way the gap is hundreds to thousands of times.</p>` });
      guard(s.cv, 'Thread canvas', () => threadCanvas(s.cv, ctx));
      guard(s.lat, 'Latency hiding', () => smLatency(s.lat, ctx));
      guard(s.area, 'Area figure', () => areaFigure(s.area, ctx));
      guard(s.tile, 'Tiling figure', () => tileFigure(s.tile, ctx));
      ctx.reading(s.read, [
        { href: 'https://modal-cdn.com/gpu-glossary/gtc22-whitepaper-hopper.pdf', label: 'NVIDIA H100 Tensor Core GPU Architecture white paper', note: 'source of the SM diagram' },
        { href: 'https://www.techpowerup.com/cpu-specs/epyc-9965.c3904', label: 'TechPowerUp: AMD EPYC 9965 specifications', note: '192 cores, 384 threads, 500 W' },
        { href: 'https://fabiensanglard.net/cuda', label: 'Fabien Sanglard, “A history of NVidia Stream Multiprocessor”', note: 'source of the CPU vs GPU area diagram' },
        { href: 'https://docs.nvidia.com/cuda/cuda-c-programming-guide/', label: 'NVIDIA CUDA C Programming Guide', note: 'where the CPU vs GPU diagram likely comes from' },
      ]);
    },
  });


  /* ═════════════════════════════ shared: an SM floorplan figure with views ═════════════════════════════ */

  /* o: {title, hint, caption, views:[{value,label,keys,why,dots}], value, smOpts, stats(f) , focus:true (adds a whole SM / one
     sub-partition toggle), onView(v)} → {f, sm(), show(v)} */
  function smFigure(slot, ctx, o) {
    const f = ctx.figure(slot, { title: o.title, hint: o.hint || 'pick a view · hover or tap any block', wide: true, caption: o.caption });
    const host = el('div', { class: 'hwa-w' });
    f.stage.append(host);
    let sm = null, view = o.value, focus = o.focusStart || 'sm';
    const V = {};
    o.views.forEach((v) => { V[v.value] = v; });
    function make() {
      if (sm) sm.destroy();
      sm = GG.components.sm(host, Object.assign({ showCounts: true, highlight: V[view].keys, dots: !!V[view].dots, focus, onPart: (key, part) => { if (part) f.setWhy(`<b>${esc(part.name)}</b> · ${esc(part.count)}. ${esc(part.desc)}`); } }, o.smOpts || {}));
    }
    function show(v) { view = v; sm.highlight(V[v].keys, { dots: !!V[v].dots }); f.setWhy(V[v].why); if (o.onView) o.onView(v, sm); }
    GG.ui.seg(f.controls, { label: o.viewLabel || 'Show', value: view, onChange: show, options: o.views.map((v) => ({ value: v.value, label: v.label })) });
    if (o.focus) GG.ui.seg(f.controls, { label: 'Zoom', value: focus, onChange: (v) => { focus = v; make(); show(view); }, options: [{ value: 'sm', label: 'whole SM' }, { value: 'sub', label: 'one sub-partition' }] });
    if (o.stats) o.stats(f);
    make();
    show(view);
    return { f, sm: () => sm, show };
  }

  /* ═════════════════════════════ Core ═════════════════════════════ */

  /* Fig: data in, transformed data out: two kinds of pipe. The CUDA Core (one FP32 unit) takes a new operation every
     clock and moves it one stage per clock; a Tensor Core holds each HMMA.16816 tile for 4 clocks per stage (2,048
     multiply-adds at 512 per clock), so a new tile enters every 4th clock. Operations change shape as they are computed
     and park in an output bay when they leave. */
  function pipesFigure(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Cores as pipes: data in, transformed data out', hint: 'pick a pipe · play or step the clock', wide: true,
      caption: `The quantitative architect’s view. Each kind of core is a pipe tied to particular ${T('streaming-assembler', 'SASS')} instructions: values flow in from registers (blue, waiting at the left), are transformed, and flow out (green, collected at the right). Both pipes are pipelined: four operations are in flight at once, one per stage (between the dashed walls). They differ in pace. The CUDA Core pipe shown is one FP32 unit running FFMA (fused multiply-add: d = a × b + c on single numbers): a new operation enters every clock and moves one stage per clock. The Tensor Core pipe runs HMMA (matrix multiply-accumulate: D = A × B + C on whole tiles, drawn at their real 16 × 16 and 16 × 8 shapes). One H100 Tensor Core does 512 dense FP16/BF16 multiply-adds per clock: NVIDIA’s ${X('https://modal-cdn.com/gpu-glossary/gtc22-whitepaper-hopper.pdf', 'H100 white paper')} gives the H100 SM twice the A100 SM’s rate clock for clock, and an A100 SM does 1,024 (312 TFLOPS ÷ 2 FLOPs ÷ 108 SMs ÷ 1.41 GHz), so 2,048 per H100 SM, shared by its four Tensor Cores. An HMMA.16816 tile, 2,048 multiply-adds, therefore occupies a Tensor Core for at least 4 clocks: here each stage holds its tile for 4 clocks (the dots count them), and a new tile enters every 4th clock. The stage drawings show the inputs combining into the result; they are a schematic, not NVIDIA’s actual stage boundaries, and real pipes have more stages. Each pipe’s thickness grows with the logarithm of the multiply-adds one warp instruction sends through it (32 against 2,048); the bars below show both to a linear scale. The 989 TFLOPS Tensor Core peak is reached on the H100 with warpgroup MMA (PTX <code>wgmma</code>, SASS <code>HGMMA</code>); <code>HMMA.16816</code> is the per-warp form, shown here for its shape. The two peaks imply different clocks: 989.4 TFLOPS ÷ (528 Tensor Cores × 512 × 2 FLOPs) ≈ 1.83 GHz, while 66.9 TFLOPS ÷ (16,896 FP32 units × 2 FLOPs) ≈ 1.98 GHz, which is why their ratio is about 15× rather than the 16× of the per-clock rates.`,
    });
    const host = el('div', { class: 'hwa-w' });
    f.stage.append(host);
    let pick = 'both', rows = [], W = 0, tNow = 8.5, shownClock = null;
    const DATA = [
      { id: 'cuda', per: 1, name: 'CUDA Core pipe · FFMA', sub: 'per thread: 3 numbers in, 1 out', inL: 'a, b, c', outL: 'd = a × b + c', st: ['a, b, c', 'a × b', '+ c', 'd'] },
      { id: 'tc', per: 4, name: 'Tensor Core pipe · HMMA.16816', sub: 'per warp: tiles A 16×16, B 16×8, C 16×8 in; D 16×8 out', inL: 'A, B, C', outL: 'D = A × B + C', st: ['A, B, C', 'A × B', '+ C', 'D'] },
    ];
    const POOL = 12;
    function build(w) {
      W = w; host.innerHTML = ''; rows = [];
      const narrow = W < 640;
      // pipe thickness grows with log2(multiply-adds per warp instruction): 32 → 5, 2,048 → 11
      const PH = { cuda: 30, tc: 66 };
      const rowH = (d) => (narrow ? 86 : 76) + PH[d.id];
      const svg = svgRoot(host, W, rowH(DATA[0]) + rowH(DATA[1]) + 8, 'Two pipes, drawn with thickness growing with the log of the multiply-adds per instruction. Top: the CUDA Core pipe, where triples of numbers a, b, c enter, combine stage by stage, and leave as single results d. Bottom: the Tensor Core pipe, where three matrix tiles enter and one result tile D leaves. Four operations are in each pipe at once, one per stage. The CUDA Core pipe takes a new operation every clock; the Tensor Core pipe holds each tile for 4 clocks per stage, so it takes a new tile every 4th clock.');
      const D = defs(svg);
      DATA.forEach((d, i) => {
        const g = S('g', {}, svg);
        const y0 = i ? rowH(DATA[0]) + 2 : 2;
        tx(g, 0, y0 + 9, d.name, { size: narrow ? 11 : 12, fill: 'var(--ink)', weight: 600 });
        const sub = tx(g, W, y0 + 9, d.sub, { size: narrow ? 9.5 : 10.5, fill: 'var(--ink-3)', anchor: 'end' });
        if (narrow) { sub.setAttribute('x', 0); sub.setAttribute('y', y0 + 24); sub.setAttribute('text-anchor', 'start'); }
        const py = y0 + (narrow ? 40 : 30), ph = PH[d.id];
        const inW = narrow ? 58 : 110, outW = narrow ? 58 : 110;
        const px0 = inW, px1 = W - outW, sw = (px1 - px0) / 4;
        rect(g, px0, py, px1 - px0, ph, { fill: 'var(--core-a)', stroke: 'var(--core)', rx: Math.min(ph / 2, 16), sw: 1.5 });
        for (let k = 1; k < 4; k++) { const x = px0 + sw * k; S('line', { x1: x, x2: x, y1: py + 5, y2: py + ph - 5, stroke: 'var(--core)', 'stroke-dasharray': '3 3', 'stroke-opacity': 0.6 }, g); }
        d.st.forEach((lb, k) => tx(g, px0 + sw * (k + 0.5), py + ph + 13, (narrow ? '' : (k + 1) + ' · ') + lb, { size: narrow ? 9.5 : 10, anchor: 'middle', fill: k === 3 ? 'var(--core)' : 'var(--ink-3)' }));
        tx(g, 0, py + ph + 13, narrow ? 'in' : 'in: ' + d.inL, { size: 10, fill: 'var(--memory)' });
        tx(g, W, py + ph + 13, narrow ? 'out' : 'out: ' + d.outL, { size: 10, anchor: 'end', fill: 'var(--core)' });
        const fl = tx(g, 0, py + ph + 30, '', { size: narrow ? 9.5 : 10.5, fill: 'var(--ink-2)' });
        // Tensor Core lane: per stage, one dot per clock the tile has spent there (it stays d.per clocks)
        const pips = [];
        if (d.per > 1) for (let k = 0; k < 4; k++) for (let q = 0; q < d.per; q++) {
          pips.push({ q, c: S('circle', { cx: px0 + sw * (k + 0.5) + (q - (d.per - 1) / 2) * 8, cy: py + ph - 7, r: 2.2, fill: 'none', stroke: 'var(--core)', 'stroke-width': 1 }, g) });
        }
        // the four shapes an operation takes; widths gw (inputs) and go (result)
        const u = narrow ? 1.3 : 1.6;
        const tile = (gg, ox, oy, rws, cls, uu, col, fill) => {
          rect(gg, ox, oy, cls * uu, rws * uu, { fill: fill || 'none', stroke: col, rx: 1.5, sw: 1 });
          for (let r = 4; r < rws; r += 4) S('line', { x1: ox, x2: ox + cls * uu, y1: oy + r * uu, y2: oy + r * uu, stroke: col, 'stroke-width': 0.6, 'stroke-opacity': 0.7 }, gg);
          for (let c = 4; c < cls; c += 4) S('line', { y1: oy, y2: oy + rws * uu, x1: ox + c * uu, x2: ox + c * uu, stroke: col, 'stroke-width': 0.6, 'stroke-opacity': 0.7 }, gg);
        };
        let gw, go;
        const mk = () => {
          const pg = S('g', {}, g);
          const F = [S('g', {}, pg), S('g', {}, pg), S('g', {}, pg), S('g', {}, pg)];
          if (d.id === 'cuda') {
            [0, 1, 2].forEach((q) => rect(F[0], -5, -12.5 + q * 8.5, 10, 7.5, { fill: 'var(--memory)', rx: 2 }));
            rect(F[1], -6, -10, 12, 9, { fill: D.hatch, stroke: 'var(--core)', rx: 2 }); rect(F[1], -5, 2, 10, 7.5, { fill: 'var(--memory)', rx: 2 });
            rect(F[2], -6, -6, 12, 12, { fill: 'var(--memory-a)', stroke: 'var(--core)', rx: 2, sw: 1.5 });
            rect(F[3], -7, -7, 14, 14, { fill: 'var(--core)', rx: 2 });
            gw = 10; go = 14;
          } else {
            const hg = 16 * u;
            tile(F[0], -18 * u, -hg / 2, 16, 16, u, 'var(--memory)'); tile(F[0], 0, -hg / 2, 16, 8, u, 'var(--memory)'); tile(F[0], 10 * u, -hg / 2, 16, 8, u, 'var(--memory)');
            tile(F[1], -9 * u, -hg / 2, 16, 8, u, 'var(--core)', D.hatch); tile(F[1], 1 * u, -hg / 2, 16, 8, u, 'var(--memory)');
            tile(F[2], -4 * u, -hg / 2, 16, 8, u, 'var(--core)', 'var(--memory-a)');
            tile(F[3], -6 * u, -12 * u, 16, 8, u * 1.5, 'var(--core)', 'var(--core-a)');
            gw = 36 * u; go = 12 * u;
          }
          return { pg, F };
        };
        const pk = Array.from({ length: POOL }, mk);
        const qn = Math.max(1, Math.min(2, Math.floor((inW - 8) / (gw + 8)))), on = Math.max(1, Math.min(3, Math.floor((outW - 8) / (go + 6))));
        // station centres: input bay slots (p < 0), stages 0..3, output bay slots (p >= 4)
        const X = (p) => (p < 0 ? px0 - 6 - gw / 2 - (-p - 1) * (gw + 8) : p < 4 ? px0 + sw * (p + 0.5) : px1 + 8 + go / 2 + (p - 4) * (go + 6));
        rows.push({ d, g, pk, cy: py + ph / 2, X, qn, on, fl, pips });
      });
      paint(tNow);
      applyPick();
    }
    function paint(t) {
      tNow = t;
      const clock = Math.floor(t);
      if (clock !== shownClock) { shownClock = clock; oClk.set(fmt.int(clock)); }
      rows.forEach((r) => {
        // time in steps of this pipe: one step per clock (CUDA Core), one step per 4 clocks (Tensor Core)
        const per = r.d.per, tt = t / per;
        const base = Math.floor(tt);
        let inflight = 0;
        r.pk.forEach((p) => { p.pg.style.display = 'none'; });
        for (let j = base - 4 - r.on; j <= base + r.qn; j++) {
          if (j < -20) continue;
          const a = tt - j, st = Math.floor(a), fr = a - st;
          if (st < -r.qn || st >= 4 + r.on) continue;
          const p = r.pk[((j % POOL) + POOL) % POOL];
          // every move between stations takes 0.35 clocks, whatever the pipe's pace
          const k = Math.min(1, fr * per / 0.35), e = k * k * (3 - 2 * k);
          const x = r.X(st - 1) + (r.X(st) - r.X(st - 1)) * e;
          p.pg.style.display = '';
          p.pg.setAttribute('transform', `translate(${x.toFixed(1)},${r.cy})`);
          const form = st < 0 ? 0 : st >= 3 ? 3 : st;
          // the new shape appears once the operation has arrived in its stage
          const shown = st >= 0 && st <= 3 && e < 1 ? Math.max(0, form - 1) : form;
          p.F.forEach((q, n) => { q.style.display = n === shown ? '' : 'none'; });
          let op = 1;
          if (st === -r.qn) op = e; // fades in as it arrives at the far end of the input bay
          if (st >= 4 && st - 4 === r.on - 1) op = 1 - 0.55 * e; // the oldest result fades as it reaches the last slot
          p.pg.setAttribute('opacity', op.toFixed(2));
          if (st >= 0 && st < 4) inflight++;
        }
        // clocks the current tiles have spent in their stage, 1 … per
        const held = Math.min(per, Math.floor((tt - base) * per) + 1);
        r.pips.forEach((pp) => pp.c.setAttribute('fill', pp.q < held ? 'var(--core)' : 'none'));
        if (r.d.id === 'cuda') r.fl.textContent = W < 640 ? `in flight: ${inflight} · a new one every clock` : `in flight: ${inflight} operations, one per stage · a new FFMA enters every clock · each is 1 thread’s multiply-add (1 per clock per FP32 unit)`;
        else r.fl.textContent = W < 640 ? `in flight: ${inflight} · a new tile every ≥ 4 clocks · clock ${held} of ${per}` : `in flight: ${inflight} tiles, one per stage · a new HMMA.16816 every ≥ 4 clocks per Tensor Core (512 FMA/clk on H100) · this step: clock ${held} of ${per}`;
      });
    }
    function applyPick() { rows.forEach((r) => r.g.classList.toggle('hwa-dim', pick !== 'both' && pick !== r.d.id)); }
    const WHY = {
      both: `Two pipes, two kinds of throughput. A warp’s <b>FFMA</b> sends 32 multiply-adds through the CUDA Core pipe (one per thread); a warp’s <b>HMMA.16816</b> sends a 16 × 8 × 16 matrix multiply-accumulate, <b>2,048</b> multiply-adds, through a Tensor Core. Both keep four operations in flight, but at different paces. The CUDA Core pipe drawn, one FP32 unit, takes a new multiply-add every clock; a Tensor Core takes a new 16 × 8 × 16 tile only every 4 clocks or more, because it does 512 multiply-adds per clock on an H100: still 512× one FP32 unit, and 16× the 32 FP32 units beside it in its sub-partition. What a programmer gets from each pipe is its throughput, not its “cleverness”.`,
      cuda: `<b>CUDA Core pipe.</b> Scalar arithmetic: each thread’s three numbers go in and one comes out, d = a × b + c. One FP32 unit takes a new one every clock; a sub-partition has 32 of them, so a warp’s <code>FFMA</code> issues all 32 threads’ multiply-adds in one clock. On an H100 the FP32 pipes add up to <b>66.9 TFLOPS</b>. See ${T('cuda-core', 'CUDA Core')}.`,
      tc: `<b>Tensor Core pipe.</b> Matrix arithmetic: three tiles go in, one tile comes out, D = A × B + C. One H100 Tensor Core does 512 dense multiply-adds per clock (an SM’s four do 2,048, twice an A100 SM’s 1,024 clock for clock), so one <code>HMMA.16816</code> occupies it for at least 2,048 ÷ 512 = <b>4 clocks</b>: watch each stage hold its tile while the dots count to 4. The affordance is floating point matrix multiplication throughput: <b>989 TFLOPS</b> of dense BF16 on an H100, about 15× the FP32 CUDA Core pipes. That peak is reached with Hopper’s warp-group <code>wgmma</code> instructions (<code>HGMMA</code> in SASS); the older warp-level <code>mma</code> behind <code>HMMA.16816</code> attains about 63% of it on average (${X('https://arxiv.org/abs/2402.13499', 'Luo et al., 2024')}). See ${T('tensor-core', 'Tensor Core')}.`,
    };
    GG.ui.seg(f.controls, { label: 'Pipe', value: 'both', onChange: (v) => { pick = v; applyPick(); f.setWhy(WHY[v]); }, options: [{ value: 'both', label: 'both' }, { value: 'cuda', label: 'CUDA Core' }, { value: 'tc', label: 'Tensor Core' }] });
    GG.ui.stat(f.readouts, { label: 'FFMA · MACs / warp instr.', value: fmt.int(32 * 1), tone: 'core' });
    GG.ui.stat(f.readouts, { label: 'HMMA.16816 · MACs / warp instr.', value: fmt.int(16 * 8 * 16), tone: 'core' });
    const TC_FMA_CLK = 2 * 1024 / 4; // H100 SM = 2 × A100 SM's 1,024 dense FP16 FMA/clk, over 4 Tensor Cores
    GG.ui.stat(f.readouts, { label: 'clocks per HMMA.16816 · one Tensor Core', value: `≥ ${fmt.int((16 * 8 * 16) / TC_FMA_CLK)}`, tone: 'core' });
    GG.ui.stat(f.readouts, { label: 'H100 peak · FP32 CUDA vs dense BF16 Tensor', value: '66.9 vs 989 TFLOPS' });
    const oClk = GG.ui.stat(f.readouts, { label: 'clock', value: '—' });
    // throughput, drawn to scale: what each pipe affords
    const tp = el('div', { class: 'hwa-bars', style: 'margin-top:12px' });
    const tbar = (label, v, max, tone) => { const b = el('div', { class: 'hwa-bar' }); b.append(el('i', { style: `background:${tone};width:${(Math.max(v / max, 0.004) * 100).toFixed(2)}%` }), el('span', { text: label })); return b; };
    tp.append(
      el('div', { class: 'hwa-bar-l', text: 'multiply-adds per warp instruction (to scale)' }),
      tbar('FFMA · 32', 32, 2048, 'var(--core)'), tbar('HMMA.16816 · 2,048 (64×)', 2048, 2048, 'var(--core)'),
      el('div', { class: 'hwa-bar-l', text: 'multiply-adds per clock in one H100 sub-partition (to scale)' }),
      tbar('32 FP32 CUDA Cores · 32', 32, TC_FMA_CLK, 'var(--core)'), tbar(`1 Tensor Core · ${fmt.int(TC_FMA_CLK)} (${fmt.int(TC_FMA_CLK / 32)}×)`, TC_FMA_CLK, TC_FMA_CLK, 'var(--core)'),
      el('div', { class: 'hwa-bar-l', text: 'H100 SXM peak of each kind of pipe, TFLOPS (to scale)' }),
      tbar('FP32 on CUDA Cores · 66.9', 66.9, 989, 'var(--core)'), tbar('dense BF16 Tensor Cores (wgmma) · 989 · ~15×', 989, 989, 'var(--core)'));
    f.stage.append(tp);
    const anim = GG.anim(host, (t, dt) => paint(tNow + dt * 1.2));
    const pb = GG.ui.playButton(f.controls, anim);
    GG.ui.button(f.controls, { icon: 'next', label: 'Next clock', onClick: () => { if (anim.running) { anim.stop(); pb.sync(); } paint(Math.floor(tNow) + 1.5); } });
    onWidth(host, build);
    f.setWhy(WHY.both);
  }

  /* Fig: which part of a GPU is the CPU core’s counterpart? */
  function analogyFigure(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'What does a CPU core correspond to?', hint: 'compare the two analogies', wide: true,
      caption: `A CPU core has registers to store information, execution units to transform it, and instruction control (fetch, decode, scheduling) to specify and command the transformations. An SM has all three: the ${T('register-file', 'register file')}, the cores, and the ${T('warp-scheduler', 'warp schedulers')}. A single GPU core has only the middle one.`,
    });
    const host = el('div', { class: 'hwa-w' });
    f.stage.append(host);
    let mode = 'sm', parts = null;
    const ROWS = [
      { k: 'ctl', cpu: 'Instruction control', cpuS: 'fetch, decode, predict, schedule', sm: 'Warp Schedulers + Dispatch', smS: '4 per SM: pick a warp every cycle', cpuN: 'Instr. control', cpuNS: 'fetch, decode, predict', smN: 'Warp Schedulers', smNS: 'a warp per cycle', role: 'control' },
      { k: 'reg', cpu: 'Registers', cpuS: 'state for one or two threads', sm: 'Register File', smS: '65,536 × 32-bit, for up to 2,048 threads', cpuN: 'Registers', cpuNS: 'for 1 or 2 threads', smN: 'Register File', smNS: 'for 2,048 threads', role: 'memory' },
      { k: 'exe', cpu: 'Execution units', cpuS: 'ALUs, FPUs, vector units', sm: 'Cores', smS: 'CUDA Cores + Tensor Cores', cpuN: 'Execution units', cpuNS: 'ALUs, FPUs', smN: 'Cores', smNS: 'CUDA + Tensor', role: 'core' },
      { k: 'mem', cpu: 'Cache', cpuS: 'hardware-managed', sm: 'L1 Data Cache', smS: 'hardware cache + programmer-managed shared memory', cpuN: 'Cache', cpuNS: 'hardware-managed', smN: 'L1 Data Cache', smNS: 'cache + shared mem', role: 'memory' },
    ];
    const col = { control: 'var(--control)', memory: 'var(--memory)', core: 'var(--core)' };
    const bg = { control: 'var(--control-a)', memory: 'var(--memory-a)', core: 'var(--core-a)' };
    function build(W) {
      host.innerHTML = '';
      const narrow = W < 640;
      const cw = narrow ? (W - 24) / 2 : Math.min(330, (W - 200) / 2), gap = W - 2 * cw;
      const rh = narrow ? 64 : 68, top = 34;
      const H = top + ROWS.length * (rh + 10) + 12;
      const svg = svgRoot(host, W, H, 'Left: a CPU core with instruction control, registers, execution units and cache. Right: an SM with warp schedulers, register file, cores and L1 data cache. Matching parts are connected.');
      const D = defs(svg, 'var(--ink-2)');
      const lx = 0, rx = W - cw;
      tx(svg, lx, 12, 'CPU CORE', { size: 12, fill: 'var(--host)', weight: 600, ls: '0.1em' });
      tx(svg, rx, 12, narrow ? 'SM' : 'STREAMING MULTIPROCESSOR', { size: 12, fill: 'var(--ink)', weight: 600, ls: '0.1em' });
      const cpuFrame = rect(svg, lx - 0, top - 8, cw, ROWS.length * (rh + 10) + 6, { stroke: 'var(--host)', rx: 10, fill: 'var(--host-a)' });
      rect(svg, rx, top - 8, cw, ROWS.length * (rh + 10) + 6, { stroke: 'var(--line-2)', rx: 10, fill: 'rgba(255,255,255,0.02)' });
      parts = { cpu: [], sm: [], links: [], core: null, coreLink: null, x: [], cpuFrame };
      ROWS.forEach((r, i) => {
        const y = top + i * (rh + 10);
        const mk = (x, t1, t2) => {
          const g = S('g', {}, svg);
          const pad = narrow ? 5 : 8;
          rect(g, x + pad, y, cw - 2 * pad, rh, { fill: bg[r.role], stroke: col[r.role], rx: 6 });
          tx(g, x + pad + (narrow ? 7 : 10), y + 18, t1, { size: narrow ? 10.5 : 12.5, fill: 'var(--ink)', weight: 600 });
          tx(g, x + pad + (narrow ? 7 : 10), y + 37, t2, { size: narrow ? 9 : 10.5, fill: 'var(--ink-2)' });
          return g;
        };
        parts.cpu.push(narrow ? mk(lx, r.cpuN, r.cpuNS) : mk(lx, r.cpu, r.cpuS));
        const sg = narrow ? mk(rx, r.smN, r.smNS) : mk(rx, r.sm, r.smS);
        parts.sm.push(sg);
        const ln = line(svg, [[lx + cw - (narrow ? 5 : 8), y + rh / 2], [rx + (narrow ? 5 : 8), y + rh / 2]], { stroke: 'var(--ink-2)', sw: 1.5, arrow: D.arrow });
        parts.links.push(ln);
        if (r.k === 'exe') {
          // a row of tiny cores, one of them "a GPU core"
          const n = narrow ? 6 : 18, cs = 7, rEdge = rx + cw - (narrow ? 10 : 18);
          for (let j = 0; j < n; j++) rect(sg, rEdge - (n - j) * (cs + 2), y + 8, cs, cs, { fill: j === n - 1 ? 'var(--core)' : 'rgba(69,212,155,0.35)', rx: 1 });
          const cxp = rEdge - (cs + 2) + cs / 2;
          parts.core = [cxp, y + 8 + cs / 2];
        }
      });
      // misleading link: whole CPU core → one tiny core
      parts.coreLink = line(svg, [[lx + cw, top + ROWS.length * (rh + 10) / 2 - 4], [W / 2, top + ROWS.length * (rh + 10) / 2 - 4], [W / 2, parts.core[1] - 18], [parts.core[0], parts.core[1] - 18], [parts.core[0], parts.core[1] - 6]], { stroke: 'var(--danger)', sw: 1.8, arrow: D.arrow, dash: '5 3' });
      ROWS.forEach((r, i) => {
        if (r.k === 'exe') return;
        const y = top + i * (rh + 10);
        const t = tx(svg, rx + cw - (narrow ? 10 : 18), y + rh - 10, 'not in a GPU core', { size: narrow ? 8.5 : 10, fill: 'var(--danger)', anchor: 'end' });
        parts.x.push(t);
      });
      void gap;
      apply();
    }
    function apply() {
      if (!parts) return;
      const sm = mode === 'sm';
      parts.links.forEach((l) => l.style.display = sm ? '' : 'none');
      parts.coreLink.style.display = sm ? 'none' : '';
      parts.x.forEach((t) => t.style.display = sm ? 'none' : '');
      parts.sm.forEach((g, i) => g.classList.toggle('hwa-dim', !sm && ROWS[i].k !== 'exe'));
      parts.cpu.forEach((g) => g.classList.toggle('hwa-dim', false));
      f.setWhy(sm
        ? `<b>SM ≈ CPU core.</b> Every part of a CPU core has a counterpart in the SM: ${T('register-file', 'register memory')} to store information, cores to transform it, and an ${T('warp-scheduler', 'instruction scheduler')} to specify and command the transformations. The SM is the closer equivalent.`
        : `<b>GPU core ≈ CPU core</b> is the misleading analogy. A GPU core does effect the computation, but it has no instruction control and no registers of its own: the warp scheduler decides what it does, and its operands live in the SM’s register file. It is closer to one of a CPU core’s execution units.`);
    }
    GG.ui.seg(f.controls, { label: 'Analogy', value: 'sm', onChange: (v) => { mode = v; apply(); }, options: [{ value: 'sm', label: 'SM ≈ CPU core (closer)' }, { value: 'core', label: 'GPU core ≈ CPU core (misleading)' }] });
    onWidth(host, build);
  }

  GG.entry('core', {
    render(body, ctx) {
      body.classList.add('hwa-body');
      const s = ctx.html(body, `
<p>The cores are the primary compute units that make up the ${T('streaming-multiprocessor', 'Streaming Multiprocessors (SMs)')}: the parts of the chip that actually do arithmetic. Everything else in an SM exists to keep them fed with instructions and data.</p>
<div data-slot="sm" class="wide"></div>
<p>Examples of GPU core types include ${T('cuda-core', 'CUDA Cores')}, which execute scalar arithmetic (one operation on one number per thread), and ${T('tensor-core', 'Tensor Cores')}, which execute matrix operations. In the H100 SM above they are the green blocks: 256 small scalar units (64 INT32, 128 FP32 and 64 FP64, the mixture the glossary calls CUDA Cores) and four large Tensor Cores. NVIDIA’s marketing count of “CUDA Cores” is only the 128 FP32 units per SM; counting every scalar unit gives 256.</p>
<h3>A misleading name</h3>
<p>Though GPU cores are comparable to CPU cores in that they are the component that effects actual computations, this analogy can be quite misleading. A CPU core is a whole processor: it fetches its own instructions, decides what to do next, and keeps its own registers. A GPU core does none of that.</p>
<p>Instead, it is perhaps more helpful to take the viewpoint of the ${X('https://archive.org/details/computerarchitectureaquantitativeapproach6thedition', 'quantitative computer architect')} and think of them as <strong>“pipes”</strong> into which data goes in and out of which transformed data is returned.</p>
<div data-slot="pipes" class="wide"></div>
<p>These pipes are associated in turn with specific ${T('streaming-assembler', 'instructions')} from the hardware’s perspective, and with different fundamental affordances of <strong>throughput</strong> from the programmers’: for example, floating point matrix multiplication arithmetic throughput in the case of the ${T('tensor-core', 'Tensor Cores')}. To a programmer, a kind of core is “how many of these operations per second can I get”, and the instructions that ask for them.</p>
${GG.noteHTML('aside', `<p>The “quantitative computer architect” is a nod to Hennessy and Patterson’s textbook <em>${X('https://archive.org/details/computerarchitectureaquantitativeapproach6thedition', 'Computer Architecture: A Quantitative Approach')}</em> (6th edition linked), which describes processors by measurable quantities such as latency, throughput and the rate at which each functional unit can accept new work.</p>`)}
<h3>The SM is the CPU core’s counterpart</h3>
<p>The ${T('streaming-multiprocessor', 'SMs')} are closer to being the equivalent of CPU cores, in that they have ${T('register-file', 'register memory')} to store information, cores to transform it, and an ${T('warp-scheduler', 'instruction scheduler')} to specify and command transformations.</p>
<div data-slot="ana" class="wide"></div>
<p>This is also why GPU marketing numbers can be confusing. An H100 SXM has 16,896 “CUDA Cores” (NVIDIA’s count: the 128 FP32 units in each SM, × 132) and 528 Tensor Cores, but 132 SMs: the number to compare with a CPU’s core count is 132, and the ${T('streaming-multiprocessor', 'Streaming Multiprocessor')} entry does that comparison.</p>
<div data-slot="read"></div>`);
      guard(s.sm, 'SM floorplan', () => smFigure(s.sm, ctx, {
        title: 'The cores of an H100 SM',
        caption: `The internal architecture of an H100 GPU’s Streaming Multiprocessors, redrawn from NVIDIA’s ${X('https://modal-cdn.com/gpu-glossary/gtc22-whitepaper-hopper.pdf', 'H100 white paper')} as modified by the glossary. CUDA and Tensor Cores are shown in green.`,
        value: 'cores',
        views: [
          { value: 'cores', label: 'all cores', keys: ['cores'], why: `<b>All the cores</b>, in green: per SM, 256 small scalar units (64 INT32, 128 FP32, 64 FP64) and 4 Tensor Cores. NVIDIA counts only the 128 FP32 units as “CUDA Cores”. Everything else in the floorplan schedules the cores or feeds them data.` },
          { value: 'cuda', label: 'CUDA Cores', keys: ['cuda-cores'], why: `<b>${T('cuda-core', 'CUDA Cores')}</b>: many small units for scalar arithmetic, 16 INT32, 32 FP32 and 16 FP64 in each sub-partition (256 per SM). NVIDIA’s “CUDA Core” count is the FP32 units alone: 128 per SM.` },
          { value: 'tensor', label: 'Tensor Cores', keys: ['tensor'], why: `<b>${T('tensor-core', 'Tensor Cores')}</b>: one large unit per sub-partition, 4 per SM, for matrix operations.` },
        ],
        stats: (f) => {
          const p = P();
          GG.ui.stat(f.readouts, { label: 'scalar units / SM (INT32 + FP32 + FP64)', value: fmt.int(p.int32.perSM + p.fp32.perSM + p.fp64.perSM), tone: 'core' });
          GG.ui.stat(f.readouts, { label: 'NVIDIA “CUDA Cores” / SM (FP32)', value: fmt.int(p.fp32.perSM), tone: 'core' });
          GG.ui.stat(f.readouts, { label: 'Tensor Cores / SM', value: p.tensor.perSM, tone: 'core' });
        },
      }));
      guard(s.pipes, 'Pipes', () => pipesFigure(s.pipes, ctx));
      guard(s.ana, 'Analogy', () => analogyFigure(s.ana, ctx));
      ctx.reading(s.read, [
        { href: 'https://modal-cdn.com/gpu-glossary/gtc22-whitepaper-hopper.pdf', label: 'NVIDIA H100 Tensor Core GPU Architecture white paper', note: 'source of the SM diagram' },
        { href: 'https://archive.org/details/computerarchitectureaquantitativeapproach6thedition', label: 'Hennessy & Patterson, Computer Architecture: A Quantitative Approach (6th ed.)', note: 'the quantitative architect’s viewpoint' },
      ]);
    },
  });

  /* ═════════════════════════════ Special Function Unit ═════════════════════════════ */

  GG.css(`
.hwa-fx { display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); }
.hwa-fx.two { grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); align-items: start; }
.hwa-chain { display: grid; gap: 6px; }
.hwa-chain > div { display: grid; grid-template-columns: 74px minmax(0, 1fr); gap: 10px; align-items: baseline; padding: 7px 10px; border: 1px solid var(--line); border-radius: 9px; background: rgba(8, 9, 14, 0.55); font: 500 12px/1.45 var(--font-mono); color: var(--ink); }
.hwa-chain > div > span:first-child { font-size: 9.5px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-3); }
.hwa-chain .op { color: var(--special); font-weight: 600; }
.hwa-chain .ptx { color: var(--control); }
.hwa-chain small { color: var(--ink-3); font-size: 11px; }
`);

  /* Format a value, snapping floating-point noise (|v| < 1e-12, e.g. sin 2π) to 0. */
  const snap = (v, d) => GG.fmt.sig(Math.abs(v) < 1e-12 ? 0 : v, d);
  const FX = [
    { id: 'exp', acc: (x) => `${2 + Math.floor(Math.abs(1.173 * x))} ulp at most at this x: 2 + ⌊|1.173 x|⌋ for <code>__expf</code>`,  label: 'exp', gl: true, f: Math.exp, lo: -4, hi: 3, x: 1, y: [-0.5, 20], name: 'eˣ', ptx: 'mul.f32 · ex2.approx.f32', sass: 'FMUL · MUFU.EX2', cpp: '<code>__expf(x)</code> (or <code>expf</code> with fast math)',
      how: (x) => `x × log₂e = ${snap(x * Math.LOG2E, 5)} → <span class="op">MUFU.EX2</span> → 2^${snap(x * Math.LOG2E, 4)} = <b>${snap(Math.exp(x), 5)}</b>`,
      note: 'The SFU computes powers of two. Since eˣ = 2^(x · log₂e), one ordinary multiply by log₂e ≈ 1.4427 turns e into 2 for it. The default <code>expf</code> also uses <code>MUFU.EX2</code>, wrapped in a few extra FMAs for accuracy.' },
    { id: 'sin', acc: (x) => (Math.abs(x) <= Math.PI ? 'absolute error ≤ 2<sup>−21.41</sup> ≈ 3.6 × 10<sup>−7</sup> for <code>__sinf</code> on [−π, π]' : 'larger than 2<sup>−21.41</sup> here: <code>__sinf</code> is only that accurate on [−π, π]'),  label: 'sin', gl: true, f: Math.sin, lo: -2 * Math.PI, hi: 2 * Math.PI, x: 1, y: [-1.3, 1.3], name: 'sin x', ptx: 'sin.approx.f32', sass: 'FMUL.RZ · MUFU.SIN', cpp: '<code>__sinf(x)</code> (or <code>sinf</code> with fast math)',
      how: (x) => `x / 2π = ${snap(x / (2 * Math.PI), 4)} turns → <span class="op">MUFU.SIN</span> → <b>${snap(Math.sin(x), 5)}</b>`,
      note: 'A multiply by 1/(2π) first scales the angle, then MUFU.SIN does the rest. It is approximate, and most accurate for moderate angles. The default <code>sinf</code> does not use the SFU at all: it reduces the angle in software and evaluates a polynomial with FMAs.' },
    { id: 'cos', acc: (x) => (Math.abs(x) <= Math.PI ? 'absolute error ≤ 2<sup>−21.19</sup> ≈ 4.2 × 10<sup>−7</sup> for <code>__cosf</code> on [−π, π]' : 'larger than 2<sup>−21.19</sup> here: <code>__cosf</code> is only that accurate on [−π, π]'),  label: 'cos', gl: true, f: Math.cos, lo: -2 * Math.PI, hi: 2 * Math.PI, x: 1, y: [-1.3, 1.3], name: 'cos x', ptx: 'cos.approx.f32', sass: 'FMUL.RZ · MUFU.COS', cpp: '<code>__cosf(x)</code> (or <code>cosf</code> with fast math)',
      how: (x) => `x / 2π = ${snap(x / (2 * Math.PI), 4)} turns → <span class="op">MUFU.COS</span> → <b>${snap(Math.cos(x), 5)}</b>`,
      note: 'The same scaling as sin, then MUFU.COS. As with sin, the default <code>cosf</code> uses a software polynomial on the FMA units, not the SFU.' },
    { id: 'sqrt', acc: () => '1 ulp at most (<code>sqrtf</code> without <code>-prec-sqrt=true</code>, compute capability ≥ 5.2)',  label: 'sqrt', gl: true, f: Math.sqrt, lo: 0, hi: 9, x: 2, y: [-0.3, 3.3], name: '√x', ptx: 'sqrt.approx.f32', sass: 'MUFU.SQRT', cpp: '<code>sqrtf(x)</code> with fast math',
      how: (x) => `<span class="op">MUFU.SQRT</span>(${snap(x, 4)}) → <b>${snap(Math.sqrt(x), 5)}</b>`,
      note: 'One of the two MUFU instructions the glossary names. With fast math, <code>sqrtf</code> is this one instruction. The default, correctly rounded <code>sqrtf</code> is built differently: <code>MUFU.RSQ</code> followed by FMA correction steps (and a slow path for unusual inputs).' },
    { id: 'log', acc: (x) => (x >= 0.5 && x <= 2 ? 'absolute error ≤ 2<sup>−21.41</sup> for <code>__logf</code> on [0.5, 2]' : '3 ulp at most for <code>__logf</code> outside [0.5, 2]'),  label: 'log', gl: false, f: Math.log, lo: 0.05, hi: 8, x: 2, y: [-3.3, 2.4], name: 'ln x', ptx: 'lg2.approx.f32 · mul.f32', sass: 'MUFU.LG2 · FMUL', cpp: '<code>__logf(x)</code>',
      how: (x) => `<span class="op">MUFU.LG2</span>(${snap(x, 4)}) = ${snap(Math.log2(x), 5)} → × ln 2 → <b>${snap(Math.log(x), 5)}</b>`,
      note: 'The mirror image of exp: the SFU gives log₂ x, and one multiply by ln 2 ≈ 0.6931 converts it.' },
    { id: 'rsqrt', acc: () => '2 ulp at most, full range (<code>rsqrtf</code>)',  label: '1/√x', gl: false, f: (x) => 1 / Math.sqrt(x), lo: 0.1, hi: 9, x: 2, y: [-0.3, 3.3], name: '1/√x', ptx: 'rsqrt.approx.f32', sass: 'MUFU.RSQ', cpp: '<code>rsqrtf(x)</code>',
      how: (x) => `<span class="op">MUFU.RSQ</span>(${snap(x, 4)}) → <b>${snap(1 / Math.sqrt(x), 5)}</b>`,
      note: 'Reciprocal square root: normalising vectors, and the denominator of layer normalisation.' },
    { id: 'rcp', acc: () => '2 ulp at most for <code>__fdividef(a, x)</code> with |x| in [2<sup>−126</sup>, 2<sup>126</sup>]',  label: '1/x', gl: false, f: (x) => 1 / x, lo: -4, hi: 4, x: 2, y: [-4.5, 4.5], name: '1/x', ptx: 'div.approx.f32 (rcp.approx.f32 for 1/x itself)', sass: 'MUFU.RCP · FMUL', cpp: '<code>__fdividef(a, x)</code> computes a × (1/x)',
      how: (x) => (Math.abs(x) < 1e-9 ? 'undefined at 0' : `<span class="op">MUFU.RCP</span>(${snap(x, 4)}) → <b>${snap(1 / x, 5)}</b>`),
      note: 'Reciprocal: division a / b can be computed as a × (1/b), which is what <code>__fdividef</code> does: PTX <code>div.approx.f32</code>, which becomes <code>MUFU.RCP</code> and a multiply (plus range scaling without fast math). (x stays at least 0.25 away from 0 here, where 1/x would leave the plot.)' },
    { id: 'tanh', acc: () => 'relative error ≤ 2<sup>−11</sup> ≈ 4.9 × 10<sup>−4</sup> for <code>__tanhf</code>: the coarsest here',  label: 'tanh', gl: false, f: Math.tanh, lo: -4, hi: 4, x: 1, y: [-1.3, 1.3], name: 'tanh x', ptx: 'tanh.approx.f32', sass: 'MUFU.TANH', cpp: '<code>__tanhf(x)</code> (CUDA 12.8+), or <code>tanhf</code> with fast math',
      how: (x) => `<span class="op">MUFU.TANH</span>(${snap(x, 4)}) → <b>${snap(Math.tanh(x), 5)}</b>`,
      note: 'A newer SFU operation (compute capability 7.5+, PTX <code>tanh.approx.f32</code>), handy for the tanh-based approximation of the GELU activation. CUDA C++ exposes it as <code>__tanhf</code> from CUDA 12.8, and <code>-use_fast_math</code> maps <code>tanhf</code> to it; the default <code>tanhf</code> builds tanh from <code>MUFU.EX2</code> and <code>MUFU.RCP</code> plus FMAs.' },
  ];

  /* Fig: function explorer */
  function fxFigure(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Special functions and their MUFU instructions', hint: 'pick a function · drag x', wide: true,
      caption: `Each function is computed by one SFU instruction, sometimes with an ordinary multiply before or after it. Tags show which ones the glossary names (<span class="hwa-tag gl">glossary</span>) and which are added context (<span class="hwa-tag beyond">beyond</span>). Curves are the exact functions; the SFU returns fast approximations of them, and the Accuracy row gives NVIDIA’s published error bound for each (${X('https://docs.nvidia.com/cuda/archive/12.8.0/cuda-c-programming-guide/index.html#intrinsic-functions', 'CUDA C++ Programming Guide, intrinsic functions')}): at this scale every one of them is far smaller than a pixel. For real compiler output see ${X('https://godbolt.org/z/WGh3rPe83', 'the glossary’s Godbolt link')}, where <code>MUFU.EX2</code> implements <code>expf</code>. That sample compiles plain <code>expf</code> (no fast math) for <code>sm_75</code>, so its <code>MUFU.EX2</code> sits among a few FFMAs that keep <code>expf</code> accurate; <code>__expf</code> or <code>-use_fast_math</code> reduce it to the FMUL + MUFU.EX2 of the exp row.`,
    });
    const wrap = el('div', { class: 'hwa-fx' });
    f.stage.append(wrap);
    const plotHost = el('div', { class: 'hwa-w' });
    const chain = el('div', { class: 'hwa-chain' });
    wrap.append(plotHost, chain);
    let cur = FX[0], x = cur.x, svgEls = null, PW = 0;
    const seg = GG.ui.seg(f.controls, { label: 'Function', value: 'exp', onChange: (v) => { cur = FX.find((q) => q.id === v); x = cur.x; sl.set(x); sl.input.min = 0; drawPlot(); upd(); }, options: FX.map((q) => ({ value: q.id, label: q.label })) });
    void seg;
    const sl = GG.ui.slider(f.controls, { label: 'x', min: 0, max: 1000, step: 1, value: 0, format: () => GG.fmt.sig(x, 4), onInput: (p) => { x = cur.lo + (p / 1000) * (cur.hi - cur.lo); x = fixX(x); upd(); } });
    const fixX = (v) => (cur.id === 'rcp' && Math.abs(v) < 0.25 ? (v < 0 ? -0.25 : 0.25) : v);
    // slider works in 0..1000 positions; translate
    const toPos = (v) => Math.round(((v - cur.lo) / (cur.hi - cur.lo)) * 1000);
    sl.set = ((orig) => (v) => { sl.input.value = toPos(v); sl.input.style.setProperty('--p', (toPos(v) / 10).toFixed(1) + '%'); sl.el.querySelector('output').textContent = GG.fmt.sig(v, 4); })(sl.set);
    const oF = GG.ui.stat(f.readouts, { label: 'f(x)', value: '—', tone: 'special' });
    const oS = GG.ui.stat(f.readouts, { label: 'SFU instruction', value: '—', tone: 'special' });
    function drawPlot() {
      plotHost.innerHTML = '';
      const W = PW || 400, H = Math.round(Math.min(276, Math.max(206, W * 0.5 + 16)));
      const svg = svgRoot(plotHost, W, H, `Plot of ${cur.name} with the chosen x marked.`);
      const m = { l: 34, r: 8, t: 10, b: 38 };
      const sx = (v) => m.l + ((v - cur.lo) / (cur.hi - cur.lo)) * (W - m.l - m.r);
      const sy = (v) => m.t + (1 - (v - cur.y[0]) / (cur.y[1] - cur.y[0])) * (H - m.t - m.b);
      rect(svg, m.l, m.t, W - m.l - m.r, H - m.t - m.b, { fill: 'rgba(255,255,255,0.02)', stroke: 'var(--line)', rx: 4 });
      if (cur.y[0] < 0 && cur.y[1] > 0) S('line', { x1: m.l, x2: W - m.r, y1: sy(0), y2: sy(0), stroke: 'var(--line-2)' }, svg);
      if (cur.lo < 0 && cur.hi > 0) S('line', { y1: m.t, y2: H - m.b, x1: sx(0), x2: sx(0), stroke: 'var(--line-2)' }, svg);
      tx(svg, m.l - 6, sy(cur.y[1]) + 6, GG.fmt.sig(cur.y[1], 2), { size: 9.5, anchor: 'end', fill: 'var(--ink-3)' });
      tx(svg, m.l - 6, sy(cur.y[0]) - 6, GG.fmt.sig(cur.y[0], 2), { size: 9.5, anchor: 'end', fill: 'var(--ink-3)' });
      [0, 1].forEach((v) => { if (v > cur.y[0] + 0.15 * (cur.y[1] - cur.y[0]) && v < cur.y[1] - 0.12 * (cur.y[1] - cur.y[0])) { tx(svg, m.l - 6, sy(v), String(v), { size: 9.5, anchor: 'end', fill: 'var(--ink-3)' }); S('line', { x1: m.l, x2: m.l + 4, y1: sy(v), y2: sy(v), stroke: 'var(--ink-3)' }, svg); } });
      tx(svg, m.l, H - m.b + 12, GG.fmt.sig(cur.lo, 3), { size: 9.5, fill: 'var(--ink-3)' });
      tx(svg, W - m.r, H - m.b + 12, GG.fmt.sig(cur.hi, 3), { size: 9.5, fill: 'var(--ink-3)', anchor: 'end' });
      tx(svg, m.l + 10, m.t + 14, cur.name, { size: 13, fill: 'var(--special)', weight: 600 });
      // curve, split where it leaves the y range (1/x)
      let d = '', pen = false;
      const N = 240;
      for (let i = 0; i <= N; i++) {
        const v = cur.lo + (i / N) * (cur.hi - cur.lo);
        const y = cur.f(v);
        if (!isFinite(y) || y < cur.y[0] - 1 || y > cur.y[1] + 1 || (cur.id === 'rcp' && Math.abs(v) < 0.2)) { pen = false; continue; }
        d += (pen ? 'L' : 'M') + sx(v).toFixed(1) + ',' + sy(clamp(y, cur.y[0], cur.y[1])).toFixed(1);
        pen = true;
      }
      S('path', { d, fill: 'none', stroke: 'var(--special)', 'stroke-width': 2 }, svg);
      const vl = S('line', { stroke: 'var(--ink-3)', 'stroke-dasharray': '3 3' }, svg);
      const hl = S('line', { stroke: 'var(--ink-3)', 'stroke-dasharray': '3 3' }, svg);
      // the 32 threads of a warp, each with its own x around the chosen one
      const tg = S('g', { 'aria-hidden': 'true' }, svg);
      const tdots = [];
      for (let i = 0; i < 32; i++) tdots.push(S('circle', { r: 2.6, fill: 'var(--special)', 'fill-opacity': 0.75 }, tg));
      const dot = S('circle', { r: 5.5, fill: 'var(--bg)', stroke: 'var(--special)', 'stroke-width': 2.5 }, svg);
      tx(svg, (m.l + W - m.r) / 2, H - 6, '32 small dots = 32 threads of a warp, one MUFU instruction', { size: 9.5, anchor: 'middle', fill: 'var(--ink-3)' });
      svgEls = { sx, sy, vl, hl, dot, tdots, m, W, H };
    }
    function upd() {
      if (svgEls) {
        const { sx, sy, vl, hl, dot, m } = svgEls;
        const y = cur.f(x);
        const yy = clamp(isFinite(y) ? y : 0, cur.y[0], cur.y[1]);
        vl.setAttribute('x1', sx(x)); vl.setAttribute('x2', sx(x)); vl.setAttribute('y1', svgEls.H - m.b); vl.setAttribute('y2', sy(yy));
        hl.setAttribute('x1', m.l); hl.setAttribute('x2', sx(x)); hl.setAttribute('y1', sy(yy)); hl.setAttribute('y2', sy(yy));
        dot.setAttribute('cx', sx(x)); dot.setAttribute('cy', sy(yy));
        const spread = 0.45 * (cur.hi - cur.lo), x0 = clamp(x - spread / 2, cur.lo, cur.hi - spread);
        svgEls.tdots.forEach((c, i) => {
          const xi = fixX(x0 + (i / 31) * spread);
          const yi = cur.f(xi);
          c.setAttribute('cx', sx(xi).toFixed(1));
          c.setAttribute('cy', sy(clamp(isFinite(yi) ? yi : 0, cur.y[0], cur.y[1])).toFixed(1));
        });
      }
      sl.set(x);
      const mufu = cur.sass.split(' · ').find((q) => q.startsWith('MUFU'));
      oF.set(snap(cur.f(x), 5)); oS.set(mufu);
      chain.innerHTML = `
<div><span>Math</span><span>${cur.name} <span class="hwa-tag ${cur.gl ? 'gl' : 'beyond'}">${cur.gl ? 'glossary' : 'beyond'}</span></span></div>
<div><span>CUDA C++</span><span>${cur.cpp}</span></div>
<div><span>PTX</span><span class="ptx">${cur.ptx}</span></div>
<div><span>SASS</span><span class="op">${cur.sass}</span></div>
<div><span>At x</span><span>${cur.how(x)}</span></div>
<div><span>Accuracy</span><span>${cur.acc(x)} <small>(CUDA C++ Programming Guide)</small></span></div>`;
      f.setWhy(`${cur.note} One <code>${mufu}</code> instruction computes it for all 32 threads of a warp, each on its own x: the 32 small dots on the curve, which move together with the slider.`);
    }
    onWidth(plotHost, (w) => { PW = w; drawPlot(); upd(); });
    const fit = () => wrap.classList.toggle('two', f.stage.getBoundingClientRect().width > 760);
    GG.resize(f.stage, fit); fit();
    upd();
  }

  /* Fig: one warp through the FP32 units vs through the SFU (throughput model) */
  function sfuRateFigure(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'One warp: FFMA vs MUFU.EX2', hint: 'play or drag the clock', wide: true,
      caption: `A throughput model of one sub-partition. Top: a warp’s 32 threads. Middle: an <code>FFMA</code> on the sub-partition’s 32 FP32 units, all 32 results in one clock. Bottom: a <code>MUFU.EX2</code> on its SFU. At compute capability 9.0 an SM produces 128 FP32 results per clock but only 16 special-function results (${X('https://docs.nvidia.com/cuda/archive/12.4.0/cuda-c-programming-guide/index.html#arithmetic-instructions', 'CUDA C++ Programming Guide')}); the drawing spreads that evenly over the four sub-partitions, 4 per clock each, so a warp’s worth takes 8 clocks. How the hardware groups the SFU’s lanes is not documented; only the rate is.`,
    });
    const host = el('div', { class: 'hwa-w' });
    f.stage.append(host);
    let clk = 8, E = null;
    const sl = GG.ui.slider(f.controls, { label: 'Clock', min: 0, max: 8, step: 1, value: 8, format: (v) => (v === 0 ? 'issue' : 'clock ' + v), onInput: (v) => { clk = v; if (anim.running) { anim.stop(); pb.sync(); } paint(); } });
    const oF = GG.ui.stat(f.readouts, { label: 'FFMA results', value: '—', tone: 'core' });
    const oS = GG.ui.stat(f.readouts, { label: 'MUFU.EX2 results', value: '—', tone: 'special' });
    GG.ui.stat(f.readouts, { label: 'per SM per clock (cc 9.0)', value: '128 vs 16' });
    GG.ui.stat(f.readouts, { label: 'clocks per warp', value: '1 vs 8' });
    function build(w) {
      host.innerHTML = '';
      const narrow = w < 640;
      const cols = narrow ? 16 : 32, rowsN = 32 / cols;
      const lab = narrow ? 0 : 104, cw = (w - lab) / cols, ch = narrow ? 20 : 24;
      const band = (n) => rowsN * (ch + 3) + (narrow ? 20 : 8) + n;
      const y0 = narrow ? 18 : 4, y1 = y0 + band(14), y2 = y1 + band(14);
      const H = y2 + band(0) + 6;
      const svg = svgRoot(host, w, H, 'Thirty-two threads of a warp; below them, an FFMA completes all 32 results in one clock, while a MUFU.EX2 completes 4 results per clock over 8 clocks.');
      const rowLab = (y, t1, t2, col) => {
        if (narrow) { tx(svg, 0, y - 9, `${t1} · ${t2}`, { size: 10, fill: col }); }
        else { tx(svg, 0, y + 9, t1, { size: 11, fill: col, weight: 600 }); tx(svg, 0, y + 24, t2, { size: 9.5, fill: 'var(--ink-3)' }); }
      };
      const cell = (i, y) => ({ x: lab + (i % cols) * cw, y: y + Math.floor(i / cols) * (ch + 3) });
      rowLab(y0, 'warp', '32 threads', 'var(--ink)');
      rowLab(y1, 'FFMA', '32 FP32 units', 'var(--core)');
      rowLab(y2, 'MUFU.EX2', 'SFU · 4 / clock', 'var(--special)');
      const lanes = [], ff = [], mu = [];
      for (let i = 0; i < 32; i++) {
        const a = cell(i, y0); rect(svg, a.x + 1, a.y, cw - 2, ch, { fill: 'var(--surface-2)', stroke: 'var(--line-2)', rx: 3 });
        lanes.push(tx(svg, a.x + cw / 2, a.y + ch / 2, narrow && i % 4 ? '' : 'T' + i, { size: narrow ? 10 : cw < 30 ? 8 : 9.5, anchor: 'middle', fill: 'var(--ink-2)' }));
        const b = cell(i, y1); ff.push(rect(svg, b.x + 1, b.y, cw - 2, ch, { fill: 'var(--core-a)', stroke: 'var(--core)', rx: 3 }));
        const c = cell(i, y2); const g = S('g', {}, svg);
        const r = rect(g, c.x + 1, c.y, cw - 2, ch, { fill: 'var(--special-a)', stroke: 'var(--special)', rx: 3 });
        const t = tx(g, c.x + cw / 2, c.y + ch / 2, String(Math.floor(i / 4) + 1), { size: narrow || cw >= 30 ? 10 : 8.5, anchor: 'middle', fill: 'var(--ink-3)' });
        mu.push({ r, t });
      }
      E = { lanes, ff, mu };
      paint();
    }
    function paint() {
      if (!E) return;
      const fDone = clk >= 1 ? 32 : 0, mDone = Math.min(32, 4 * clk);
      E.ff.forEach((r) => r.setAttribute('fill', fDone ? 'var(--core)' : 'var(--core-a)'));
      E.mu.forEach((m, i) => { const done = i < mDone, now = done && i >= mDone - 4; m.r.setAttribute('fill', done ? 'var(--special)' : 'var(--special-a)'); m.r.setAttribute('stroke-width', now ? 2.5 : 1); m.t.setAttribute('fill', done ? '#0b0c12' : 'var(--ink-3)'); });
      oF.set(`${fDone} / 32`, 'core'); oS.set(`${mDone} / 32`, 'special');
      sl.set(clk);
      f.setWhy(clk === 0
        ? 'The warp scheduler issues the instruction. Every thread has its own x in its own register; nothing has been computed yet.'
        : clk < 8
          ? `<b>Clock ${clk}.</b> The FFMA finished on clock 1: 32 FP32 units, one per thread. The <code>MUFU.EX2</code> has produced <b>${mDone}</b> of its 32 results, 4 per clock (the numbers in the cells say which clock each one arrives on).`
          : '<b>Clock 8.</b> The <code>MUFU.EX2</code> is done: 8 clocks for what an <code>FFMA</code> did in 1. That is the 128 : 16 ratio of the throughput table. Special functions are cheap compared with computing them in software, but a kernel that applies <code>exp</code> to every element can still be limited by the SFUs.');
    }
    onWidth(host, build);
    let acc = 0;
    const anim = GG.anim(host, (t, dt) => { acc += dt; if (acc > 0.55) { acc = 0; clk = clk >= 10 ? 0 : clk + 1; const c = clk; clk = Math.min(8, c); paint(); clk = c; } }, { autostart: false });
    const pb = GG.ui.playButton(f.controls, anim, { onToggle: (on) => { if (on) { clk = 0; paint(); } else { clk = Math.min(8, clk); paint(); } } });
  }

  GG.entry('special-function-unit', {
    render(body, ctx) {
      body.classList.add('hwa-body');
      const s = ctx.html(body, `
<p>The Special Function Units (SFUs) in ${T('streaming-multiprocessor', 'Streaming Multiprocessors (SMs)')} accelerate certain arithmetic operations: the ones that would take many ordinary instructions to compute, but that programs need often enough to deserve hardware of their own.</p>
<div data-slot="sm" class="wide"></div>
<p>Notable for neural network workloads are <em>transcendental</em> mathematical operations, like <code>exp</code>, <code>sin</code> and <code>cos</code>. Transcendental means “not algebraic”: no polynomial equation relates x and f(x), so no finite sequence of additions, multiplications and divisions computes these functions exactly, and hardware has to approximate them. <code>exp</code> alone appears in every softmax of every attention layer, and in many activation functions.</p>
<h3>The MUFU instructions</h3>
<p>The ${T('streaming-assembler', 'Streaming Assembler (SASS)')} instructions associated with the SFUs generally begin with <code>MUFU</code>: <code>MUFU.SQRT</code>, <code>MUFU.EX2</code>. (The glossary does not expand the name; NVIDIA’s ${X('https://docs.nvidia.com/cuda/cuda-binary-utilities/index.html#instruction-set-reference', 'instruction set reference')} describes <code>MUFU</code> as an “FP32 Multi Function Operation”.) See ${X('https://godbolt.org/z/WGh3rPe83', 'this Godbolt link')} for sample assembly using the <code>MUFU.EX2</code> instruction to implement the <code>expf</code> intrinsic in ${T('cuda-c', 'CUDA C++')}. (The sample is a small element-wise kernel, <code>data[idx] = expf(data[idx])</code>, compiled with nvcc 12.8 for <code>sm_75</code> without fast math, so a few FFMAs surround the <code>MUFU.EX2</code> to keep <code>expf</code> accurate.) <code>EX2</code> means “2 to the power x”, so <code>exp</code> needs one extra step, which Fig. 2 shows.</p>
<div data-slot="fx" class="wide"></div>
${GG.noteHTML('beyond', `<p><b>Why exp becomes EX2.</b> Hardware finds powers of two easier than powers of e: a binary floating point number is already a power of two times a fraction. Since e<sup>x</sup> = 2<sup>x · log₂e</sup>, a fast <code>exp</code> is one ordinary multiply by log₂e ≈ 1.4427 followed by <code>MUFU.EX2</code>. The same trick runs in reverse for logarithms: ln x = log₂x · ln 2, with <code>MUFU.LG2</code>.</p>
<p><b>More MUFU variants.</b> Besides <code>SQRT</code> and <code>EX2</code>, the SFU’s operations include <code>LG2</code> (log₂), <code>SIN</code>, <code>COS</code>, <code>RCP</code> (reciprocal), <code>RSQ</code> (reciprocal square root) and, from compute capability 7.5, <code>TANH</code> (CUDA C++ <code>__tanhf</code>, new in CUDA 12.8). They correspond to PTX’s <code>.approx</code> instructions (<code>ex2.approx.f32</code>, <code>lg2.approx.f32</code>, …), and to CUDA C++’s fast intrinsics such as <code>__expf</code>, <code>__sinf</code> and <code>__logf</code>. They are fast and approximate. The default math functions use them differently: <code>expf</code> wraps <code>MUFU.EX2</code> in a few extra FMAs for accuracy; the correctly rounded <code>sqrtf</code> refines a <code>MUFU.RSQ</code> result with FMAs; and <code>sinf</code> and <code>cosf</code> skip the SFU entirely, reducing the angle in software and evaluating a polynomial on the FMA units. Only <code>__sinf</code> / <code>__cosf</code> (or compiling with <code>-use_fast_math</code>) use <code>MUFU.SIN</code> / <code>MUFU.COS</code>. (We checked by compiling each for <code>sm_90</code> with nvcc 12.8, with and without fast math.)</p>
<p><b>How fast.</b> NVIDIA’s ${X('https://docs.nvidia.com/cuda/archive/12.4.0/cuda-c-programming-guide/index.html#arithmetic-instructions', 'CUDA C++ Programming Guide')} tabulates the throughput of each arithmetic instruction per clock per SM. For compute capability 9.0 (the H100): <b>128</b> results per clock for 32-bit floating-point add, multiply and multiply-add, and <b>16</b> for 32-bit reciprocal, reciprocal square root, base-2 logarithm, base-2 exponential, sine and cosine. The special functions run at <b>one eighth</b> of the rate of FFMA. Fig. 3 draws what that means for one warp.</p>`)}
<div data-slot="rate" class="wide"></div>
<div data-slot="read"></div>`);
      guard(s.sm, 'SM floorplan', () => smFigure(s.sm, ctx, {
        title: 'Special Function Units in an H100 SM', focus: true,
        caption: `The internal architecture of an H100 SM, redrawn from NVIDIA’s ${X('https://modal-cdn.com/gpu-glossary/gtc22-whitepaper-hopper.pdf', 'H100 white paper')} as modified by the glossary. Special Function Units are shown in pink, along with the ${T('load-store-unit', 'Load/Store Units')}.`,
        value: 'sfu',
        views: [
          { value: 'sfu', label: 'SFUs', keys: ['sfu'], why: `<b>Special Function Units</b>: one SFU block at the foot of each sub-partition, beside the load/store units: 4 blocks per SM. Together they produce <b>16 results per clock</b> per SM (CUDA C++ Programming Guide, compute capability 9.0). The warp scheduler of each sub-partition sends its SFU block its warps’ <code>MUFU</code> instructions.` },
          { value: 'pink', label: 'all pink units', keys: ['sfu', 'ldst'], why: `<b>The pink units</b>: compute units that are not cores. SFUs compute special functions; ${T('load-store-unit', 'Load/Store Units')} (8 per sub-partition) move data between registers and memory.` },
          { value: 'cmp', label: 'SFU vs FP32', keys: ['sfu', 'fp32'], why: `<b>SFU vs FP32 units.</b> 32 FP32 units per sub-partition do multiply-adds; one SFU block per sub-partition does the special functions. Per SM that is <b>128</b> FFMA results per clock against <b>16</b> special-function results: <b>1/8</b> the rate. Plenty of hardware for the common case, a smaller amount for the rarer one. Fig. 3 shows one warp through each.` },
        ],
      }));
      guard(s.fx, 'Function explorer', () => fxFigure(s.fx, ctx));
      guard(s.rate, 'SFU rate', () => sfuRateFigure(s.rate, ctx));
      ctx.reading(s.read, [
        { href: 'https://modal-cdn.com/gpu-glossary/gtc22-whitepaper-hopper.pdf', label: 'NVIDIA H100 Tensor Core GPU Architecture white paper', note: 'source of the SM diagram' },
        { href: 'https://godbolt.org/z/WGh3rPe83', label: 'Godbolt: expf compiled to SASS', note: 'MUFU.EX2 implementing the expf intrinsic' },
        { href: 'https://docs.nvidia.com/cuda/archive/12.4.0/cuda-c-programming-guide/index.html#arithmetic-instructions', label: 'CUDA C++ Programming Guide (12.4): arithmetic instruction throughput', note: 'beyond the glossary: 128 vs 16 results per clock per SM at compute capability 9.0' },
        { href: 'https://docs.nvidia.com/cuda/cuda-binary-utilities/index.html#instruction-set-reference', label: 'CUDA Binary Utilities: instruction set reference', note: 'MUFU, “FP32 Multi Function Operation”' },
      ]);
    },
  });

  /* ═════════════════════════════ Load/Store Unit ═════════════════════════════ */

  /* Fig: follow a load or a store through the SM (flows) */
  function lsuFlow(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Follow a memory instruction', hint: 'pick an instruction · step through', wide: true,
      caption: `The internal architecture of an H100 SM, redrawn from NVIDIA’s ${X('https://modal-cdn.com/gpu-glossary/gtc22-whitepaper-hopper.pdf', 'H100 white paper')} as modified by the glossary, with a strip for what lies off the SM. Load/Store Units are pink, like the ${T('special-function-unit', 'Special Function Units')}. The LD/ST units talk directly to the on-chip L1 data cache, and only through it (and the L2 cache) to the off-chip GPU RAM. Shown for one warp’s instruction in sub-partition 3 (bottom left, the one nearest the L1); switch on “4 warps” (on wider screens) to see all four sub-partitions issue the same kind of instruction at once, each through its own LD/ST units into the one shared L1. “TMA · bulk copy” shows the other way into shared memory, through the ${T('tensor-memory-accelerator', 'Tensor Memory Accelerator')} instead of the LD/ST units.`,
    });
    const host = el('div', { class: 'hwa-w' });
    f.stage.append(host);
    const sm = GG.components.sm(host, { ext: true, showCounts: true, maxHeight: '92vh', onPart: (key, part) => { if (part) f.setWhy(`<b>${esc(part.name)}</b> · ${esc(part.count)}. ${esc(part.desc)}`); } });
    const SC = {
      lds: { op: 'LDS', level: 'shared · L1, on-chip', steps: [
        { from: 'dispatch', to: 'ldst', color: 'control', hl: ['scheduler', 'dispatch', 'ldst'], why: '<b>1 · Issue.</b> The warp scheduler picks a warp whose next instruction is <code>LDS</code> (load from shared memory), and the dispatch unit hands it to the sub-partition’s 8 <b>LD/ST units</b>, with one address per thread.' },
        { from: 'ldst', to: 'l1d', color: 'special', hl: ['ldst', 'l1d'], why: '<b>2 · Request.</b> The LD/ST units send the 32 requests straight to the SM’s on-chip SRAM, the <b>L1 data cache</b>, where shared memory lives. A short trip that never leaves the SM.' },
        { flows: [['l1d', 'ldst'], ['ldst', 'regfile']], color: 'memory', hl: ['l1d', 'ldst', 'regfile'], why: '<b>3 · Data back.</b> The values come back from the L1 through the LD/ST units, which write them into each thread’s destination register in the register file, ready for the next arithmetic instruction.' },
      ] },
      ldg: { op: 'LDG', level: 'global · GPU RAM, off-chip', steps: [
        { from: 'dispatch', to: 'ldst', color: 'control', hl: ['scheduler', 'dispatch', 'ldst'], why: '<b>1 · Issue.</b> The warp scheduler issues <code>LDG</code> (load from global memory) to the <b>LD/ST units</b>, one address per thread. The load does not stall the warp by itself: it can keep issuing instructions that do not need this data. When one does, the warp stalls (a long-scoreboard stall, see ' + T('scoreboard-stall', 'scoreboard stall') + ') and the scheduler runs other warps.' },
        { from: 'ldst', to: 'l1d', color: 'special', hl: ['ldst', 'l1d'], why: '<b>2 · Request to L1.</b> The LD/ST units send the requests to the <b>L1 data cache</b> first. This time it is a <b>miss</b>: the data is not on the SM. (Switch on “L1 hit” to see the short path.)' },
        { flows: [['l1d', 'l2'], ['l2', 'ram']], color: 'special', hl: ['l1d', 'l2', 'ram'], why: '<b>3 · Off the SM.</b> On a miss the request leaves the SM, to the L2 cache shared by all SMs and, if it misses there too, to the off-chip <b>GPU RAM</b> (HBM3). This is the indirect part: the LSUs never talk to GPU RAM themselves.' },
        { flows: [['ram', 'l2'], ['l2', 'l1d']], color: 'memory', hl: ['ram', 'l2', 'l1d'], why: '<b>4 · Data returns</b> from GPU RAM, through L2, into the L1 data cache, where it may serve later loads.' },
        { flows: [['l1d', 'ldst'], ['ldst', 'regfile']], color: 'memory', hl: ['l1d', 'ldst', 'regfile'], why: '<b>5 · Into registers.</b> The values come back through the LD/ST units into the threads’ registers, and any instruction waiting on these registers can now issue.' },
      ] },
      ldgHit: { op: 'LDG', level: 'global · served by the L1', steps: [
        { from: 'dispatch', to: 'ldst', color: 'control', hl: ['scheduler', 'dispatch', 'ldst'], why: '<b>1 · Issue.</b> The warp scheduler issues <code>LDG</code> (load from global memory) to the <b>LD/ST units</b>, one address per thread.' },
        { from: 'ldst', to: 'l1d', color: 'special', hl: ['ldst', 'l1d'], why: '<b>2 · L1 hit.</b> The requested lines are already in the <b>L1 data cache</b>, from an earlier load. Nothing leaves the SM: no trip to L2 or GPU RAM, so the wait is far shorter.' },
        { flows: [['l1d', 'ldst'], ['ldst', 'regfile']], color: 'memory', hl: ['l1d', 'ldst', 'regfile'], why: '<b>3 · Into registers.</b> The values come back through the LD/ST units into the threads’ registers. Three steps instead of five: the direct path the LSUs have to the L1.' },
      ] },
      stg: { op: 'STG', level: 'global · GPU RAM, off-chip', steps: [
        { from: 'dispatch', to: 'ldst', color: 'control', hl: ['scheduler', 'dispatch', 'ldst'], why: '<b>1 · Issue.</b> The warp scheduler issues <code>STG</code> (store to global memory) to the <b>LD/ST units</b>.' },
        { from: 'regfile', to: 'ldst', color: 'memory', hl: ['regfile', 'ldst'], why: '<b>2 · Read registers.</b> Each thread’s value and address come out of its registers into the LD/ST units.' },
        { from: 'ldst', to: 'l1d', color: 'special', hl: ['ldst', 'l1d'], why: '<b>3 · Into the memory pipeline.</b> The LD/ST units dispatch the store requests to the SM’s L1 data cache path.' },
        { flows: [['l1d', 'l2'], ['l2', 'ram']], color: 'special', hl: ['l1d', 'l2', 'ram'], why: '<b>4 · Off the SM</b> to the L2 cache and on to GPU RAM, where every thread in the grid can see the result. The warp does not need to wait for this.' },
      ] },
      tma: { op: 'cp.async.bulk.tensor', opLabel: 'PTX', level: 'global → shared, no LSUs', steps: [
        { from: 'dispatch', to: 'tma', color: 'control', hl: ['scheduler', 'dispatch', 'tma'], why: '<b>1 · Issue.</b> A single thread issues a bulk tensor copy (PTX <code>cp.async.bulk.tensor</code>) that describes a whole tile of a multi-dimensional array in GPU RAM. It goes to the SM’s one <b>Tensor Memory Accelerator</b>, not to the LD/ST units, which stay dark: there are no per-thread addresses to compute. The thread can rejoin its warp and do other work while the copy runs.' },
        { flows: [['tma', 'l2'], ['l2', 'ram']], color: 'special', hl: ['tma', 'l2', 'ram'], why: '<b>2 · Request.</b> The TMA computes the addresses of the whole tile itself (bulk affine accesses, many at once) and sends the requests off the SM, through the L2 cache to <b>GPU RAM</b>.' },
        { flows: [['ram', 'l2'], ['l2', 'tma'], ['tma', 'l1d']], color: 'memory', hl: ['ram', 'l2', 'tma', 'l1d'], why: '<b>3 · Into shared memory.</b> The tile arrives in shared memory, in the <b>L1 data cache</b>, bypassing the register file and the LD/ST units entirely. The threads of the block detect asynchronously that the copy has finished, then operate on the tile. See ' + T('tensor-memory-accelerator', 'Tensor Memory Accelerator') + '.' },
      ] },
    };
    let sc = 'ldg', hit = false, all = false, narrow = false, stepNow = 0, stops = [], stepper = null;
    // one warp's instruction runs in one sub-partition; '4 warps' shows all four at once
    const ONE = 2;
    const keyOf = (k) => (all ? k : k + '@' + ONE);
    const oOp = GG.ui.stat(f.readouts, { label: 'SASS', value: 'LDG', tone: 'special' });
    const oLv = GG.ui.stat(f.readouts, { label: 'memory reached', value: '—', tone: 'memory' });
    const oN = GG.ui.stat(f.readouts, { label: 'steps', value: '—' });
    const cur = () => SC[sc === 'ldg' && hit ? 'ldgHit' : sc];
    function go(i) {
      stepNow = i;
      const st = cur().steps[i];
      stops.forEach((s) => s()); stops = [];
      sm.highlight(st.hl.map(keyOf));
      (st.flows || [[st.from, st.to]]).forEach(([a, b]) => stops.push(sm.flow(a, b, { color: st.color, dots: 4, speed: 130, sub: all ? undefined : ONE })));
      f.setWhy(st.why);
    }
    function build() {
      if (stepper) { stepper.stop(); stepper.el.remove(); }
      stepper = GG.ui.stepper(f.controls, { label: 'Step', steps: cur().steps.map((q) => ({ label: q.why.replace(/<[^>]+>/g, '').slice(0, 40) })), onStep: go, autoplay: 2600 });
      oOp.el.querySelector('i').textContent = cur().opLabel || 'SASS'; oOp.set(cur().op); oLv.set(cur().level); oN.set(String(cur().steps.length));
      hitT.el.style.display = sc === 'ldg' ? '' : 'none';
      fitAll();
      go(0);
    }
    // '4 warps' needs room: on a phone the four sub-partitions' wires to the one L1 wrap the whole SM, so it is offered from 560 px up
    function fitAll() {
      const off = sc === 'tma' || narrow;
      allT.el.style.display = off ? 'none' : '';
      if (off && all) { all = false; allT.set(false); return true; }
      return false;
    }
    GG.ui.seg(f.controls, { label: 'Instruction', value: 'ldg', onChange: (v) => { sc = v; build(); }, options: [{ value: 'lds', label: 'LDS · load shared' }, { value: 'ldg', label: 'LDG · load global' }, { value: 'stg', label: 'STG · store global' }, { value: 'tma', label: 'TMA · bulk copy' }] });
    const hitT = GG.ui.toggle(f.controls, { label: 'L1 hit', value: false, onChange: (v) => { hit = v; build(); } });
    const allT = GG.ui.toggle(f.controls, { label: '4 warps', value: false, onChange: (v) => { all = v; go(stepNow); } });
    build();
    onWidth(host, (w) => { narrow = w < 560; if (fitAll()) go(stepNow); });
  }

  /* Fig: the two levels of the memory hierarchy the LSUs reach */
  function lsuLevels(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'The levels the LSUs reach', hint: 'pick a level', wide: true,
      caption: `Top: the ${T('cuda-programming-model', 'CUDA programming model')}’s ${T('memory-hierarchy', 'memory hierarchy')} (left) and the hardware that implements it (right). Bottom: the path a load or store takes through that hardware, one arrow per hop. The LSUs (pink) serve the two shared levels: ${T('shared-memory', 'shared memory')}, implemented by the L1 data cache, which they reach <b>directly</b> (one hop, solid), and ${T('global-memory', 'global memory')}, implemented by GPU RAM, which they reach only <b>indirectly</b>, through the L1 and L2 caches (three hops; the last two dashed). A thread’s registers need no LSU: arithmetic instructions read them directly, and loads deliver their results into them.`,
    });
    const map = GG.components.modelMap(f.stage, { highlight: ['shared', 'global'], caption: false });
    const host = el('div', { class: 'hwa-w', style: 'margin-top:14px' });
    f.stage.append(host);
    let view = 'both', P2 = null, P2lab = null;
    const LIT = {
      both: ['lsu', 'l1', 'ram', 'direct', 'hop2', 'hop3', 'l2', 'ilab'],
      shared: ['lsu', 'l1', 'direct'],
      global: ['lsu', 'l1', 'l2', 'ram', 'direct', 'hop2', 'hop3', 'ilab'],
      regs: ['cores', 'rf', 'lsu', 'core-rf', 'rf-lsu'],
    };
    function build(W) {
      host.innerHTML = '';
      const narrow = W < 640;
      const B = [
        { k: 'cores', t: 'Cores', s: 'CUDA + Tensor', col: 'core' },
        { k: 'rf', t: 'Register file', s: 'registers', col: 'memory' },
        { k: 'lsu', t: 'LD/ST × 32', s: 'Load/Store Units', col: 'special' },
        { k: 'l1', t: 'L1 data cache', s: 'shared memory', col: 'memory' },
        { k: 'l2', t: 'L2 cache', s: 'shared by all SMs', col: 'memory' },
        { k: 'ram', t: 'GPU RAM', s: narrow ? 'global memory · off-chip' : 'global memory', col: 'memory' },
      ];
      const pos = {};
      let H;
      if (!narrow) {
        const bw = Math.min(150, (W - 5 * 34) / 6), gp = (W - 6 * bw) / 5, bh = 50, y = 80;
        B.forEach((b, i) => { pos[b.k] = { x: i * (bw + gp), y, w: bw, h: bh }; });
        H = y + bh + 40;
      } else {
        const bw = Math.min(200, W - 110), bh = 40, gp = 22, x = 12;
        // off-SM hops get extra room so their dashes read as dashed (≥ 3 dashes), unlike the solid direct hop
        B.forEach((b, i) => { pos[b.k] = { x, y: 26 + i * (bh + gp) + (i >= 4 ? 18 : 0) + (i >= 5 ? 18 : 0), w: bw, h: bh }; });
        H = pos.ram.y + bh + 10;
      }
      const svg = svgRoot(host, W, H, 'The path of a memory instruction: cores read the register file directly; the LD/ST units connect the register file to the L1 data cache (shared memory) directly, and to GPU RAM (global memory) indirectly, through the L1 and the L2 cache.');
      const Dp = defs(svg, 'var(--special)');
      const Db = defs(svg, 'var(--memory)');
      const parts = {};
      const grp = (k) => (parts[k] = S('g', {}, svg));
      // SM frame
      const a = pos.cores, c = pos.l1;
      const fr = narrow ? { x: a.x - 8, y: a.y - 18, w: Math.max(a.w, c.w) + 16, h: c.y + c.h - a.y + 26 } : { x: a.x - 6, y: a.y - 22, w: c.x + c.w - a.x + 12, h: a.h + 32 };
      rect(svg, fr.x, fr.y, fr.w, fr.h, { stroke: 'var(--line-2)', dash: '4 3', rx: 8 });
      tx(svg, fr.x + 8, fr.y + 9, 'on the SM (on-chip)', { size: 9.5, fill: 'var(--ink-3)' });
      if (narrow) tx(svg, pos.l2.x + 2, pos.l2.y - 10, 'off the SM', { size: 9.5, fill: 'var(--ink-3)' });
      else {
        tx(svg, pos.l2.x, pos.l2.y - 12, 'off the SM', { size: 9.5, fill: 'var(--ink-3)' });
        tx(svg, pos.ram.x + pos.ram.w, pos.ram.y + pos.ram.h + 14, 'off-chip, on-device', { size: 9.5, anchor: 'end', fill: 'var(--ink-3)' });
      }
      // links
      const mid = (p, side) => (side === 'r' ? [p.x + p.w, p.y + p.h / 2] : side === 'l' ? [p.x, p.y + p.h / 2] : side === 'b' ? [p.x + p.w / 2, p.y + p.h] : [p.x + p.w / 2, p.y]);
      const link = (k, p, q, o) => { const g = grp(k); line(g, [p, q], o); return g; };
      const ends = (A, Bk) => (narrow ? [mid(pos[A], 'b'), mid(pos[Bk], 't')] : [mid(pos[A], 'r'), mid(pos[Bk], 'l')]);
      const shrink = (pq, d) => { const [p, q] = pq; const L = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1; const ux = (q[0] - p[0]) / L, uy = (q[1] - p[1]) / L; return [[p[0] + ux * d, p[1] + uy * d], [q[0] - ux * d, q[1] - uy * d]]; };
      let e = shrink(ends('cores', 'rf'), 3); link('core-rf', e[0], e[1], { stroke: 'var(--memory)', sw: 1.6, arrow: Db.arrow });
      e = shrink(ends('rf', 'lsu'), 3); const gRL = link('rf-lsu', e[1], e[0], { stroke: 'var(--memory)', sw: 1.6, arrow: Db.arrow });
      // LSU → L1 is the direct path (one hop); global memory is three hops along the same chain: LSU → L1 → L2 → GPU RAM
      e = shrink(ends('lsu', 'l1'), 3); const gD = link('direct', e[0], e[1], { stroke: 'var(--special)', sw: 2.4, arrow: Dp.arrow });
      e = shrink(ends('l1', 'l2'), 3); const gH2 = link('hop2', e[0], e[1], { stroke: 'var(--special)', sw: 2, dash: '6 4', arrow: Dp.arrow });
      e = shrink(ends('l2', 'ram'), 3); const gH3 = link('hop3', e[0], e[1], { stroke: 'var(--special)', sw: 2, dash: '6 4', arrow: Dp.arrow });
      const hopLab = (g, A, Bk, t) => {
        const p = pos[A], q = pos[Bk];
        if (narrow) return tx(g, p.x + p.w / 2 + 8, (p.y + p.h + q.y) / 2, t, { size: 9.5, fill: 'var(--special)' });
        return tx(g, (p.x + p.w + q.x) / 2, p.y + p.h + 14, t, { size: 9.5, anchor: 'middle', fill: 'var(--special)' });
      };
      const dLab = hopLab(gD, 'lsu', 'l1', 'direct');
      hopLab(gH2, 'l1', 'l2', 'hop 2'); hopLab(gH3, 'l2', 'ram', 'hop 3');
      const gIL = grp('ilab');
      if (!narrow) {
        const q = pos.ram, p0 = pos.lsu;
        const by = p0.y - 22 - 14;
        S('path', { d: `M${p0.x + p0.w / 2},${by + 9} V${by} H${q.x + q.w / 2} V${q.y - 4}`, fill: 'none', stroke: 'var(--special)', 'stroke-width': 1, 'stroke-opacity': 0.6 }, gIL);
        tx(gIL, (p0.x + p0.w / 2 + q.x + q.w / 2) / 2, by - 9, 'indirect: global memory is 3 hops away, through the L1 and the L2', { size: 10, anchor: 'middle', fill: 'var(--special)' });
        tx(gRL, (pos.rf.x + pos.rf.w + pos.lsu.x) / 2, pos.rf.y + pos.rf.h + 14, 'loads land here', { size: 9.5, anchor: 'middle', fill: 'var(--memory)' });
      } else {
        const p0 = pos.lsu, q = pos.ram, xr = p0.x + p0.w + 18;
        S('path', { d: `M${p0.x + p0.w + 6},${p0.y + p0.h / 2} H${xr} V${q.y + q.h / 2} H${q.x + q.w + 6}`, fill: 'none', stroke: 'var(--special)', 'stroke-width': 1, 'stroke-opacity': 0.6 }, gIL);
        tx(gIL, xr + 6, (p0.y + q.y) / 2 + 10, 'indirect:', { size: 10, fill: 'var(--special)' });
        tx(gIL, xr + 6, (p0.y + q.y) / 2 + 24, '3 hops', { size: 9.5, fill: 'var(--special)' });
      }
      P2lab = dLab;
      B.forEach((b) => {
        const g = grp(b.k), p = pos[b.k];
        rect(g, p.x, p.y, p.w, p.h, { fill: `var(--${b.col}-a)`, stroke: `var(--${b.col})`, rx: 6, sw: 1.3 });
        tx(g, p.x + 10, p.y + (narrow ? 14 : 18), b.t, { size: narrow ? 11 : 12, fill: 'var(--ink)', weight: 600 });
        tx(g, p.x + 10, p.y + (narrow ? 29 : 35), b.s, { size: narrow ? 9.5 : 10.5, fill: `var(--${b.col})` });
      });
      P2 = parts;
      apply();
    }
    function apply() {
      if (!P2) return;
      const lit = LIT[view];
      Object.keys(P2).forEach((k) => P2[k].setAttribute('opacity', lit.includes(k) ? 1 : 0.22));
      if (P2lab) P2lab.textContent = view === 'global' ? 'hop 1' : view === 'shared' ? 'direct' : 'direct · hop 1';
    }
    const V = {
      both: { keys: ['shared', 'global'], why: `<b>Both ends.</b> ${T('shared-memory', 'Shared memory')} (in each SM’s on-chip L1 data cache) is the lowest level a group of threads can share, and ${T('global-memory', 'global memory')} (in the off-chip GPU RAM) is the highest. The LSUs serve them both: one directly, one indirectly.` },
      shared: { keys: ['shared'], why: `<b>Shared memory ↔ L1 data cache.</b> The LSUs reach it <b>directly</b>: the SRAM sits on the SM itself. It is shared by the threads of one thread block.` },
      global: { keys: ['global'], why: `<b>Global memory ↔ GPU RAM.</b> The LSUs reach it <b>indirectly</b>, through the L1 and the L2 cache. It is shared by every thread of the grid, on the device but off the chip.` },
      regs: { keys: ['registers'], why: `<b>Registers ↔ register file.</b> Private to a thread, and read directly by the cores. No load or store needed, so no LSU involved in arithmetic: the LSUs are what connect the registers to the levels above, delivering loaded values into them and taking stored values out.` },
    };
    GG.ui.seg(f.controls, { label: 'Level', value: 'both', onChange: (v) => { view = v; map.highlight(V[v].keys); apply(); f.setWhy(V[v].why); }, options: [{ value: 'both', label: 'both LSU levels' }, { value: 'shared', label: 'shared · L1' }, { value: 'global', label: 'global · GPU RAM' }, { value: 'regs', label: 'registers' }] });
    onWidth(host, build);
    f.setWhy(V.both.why);
  }

  GG.entry('load-store-unit', {
    render(body, ctx) {
      body.classList.add('hwa-body');
      const s = ctx.html(body, `
<p>The Load/Store Units (LSUs) dispatch requests to <strong>load</strong> data from, or <strong>store</strong> data to, the memory subsystems of the GPU. Arithmetic happens on values in registers; the LSUs are how those values get into registers in the first place, and back out to memory afterwards.</p>
<p>Most importantly for ${T('cuda-software-platform', 'CUDA programmers')}, they interact <strong>directly</strong> with the ${T('streaming-multiprocessor', 'Streaming Multiprocessor')}’s on-chip SRAM (static RAM: fast memory built into the chip) ${T('l1-data-cache', 'L1 data cache')}, and <strong>indirectly</strong> with the off-chip, on-device ${T('gpu-ram', 'global RAM')}. These respectively implement the lowest and highest levels of the ${T('memory-hierarchy', 'memory hierarchy')} in the ${T('cuda-programming-model', 'CUDA programming model')}.</p>
<div data-slot="flow" class="wide"></div>
${GG.noteHTML('beyond', `<p><b>The instructions.</b> In SASS, loads and stores are named by the memory they target: <code>LDS</code> / <code>STS</code> for shared memory, <code>LDG</code> / <code>STG</code> for global memory, <code>LDL</code> / <code>STL</code> for local memory (per-thread data the compiler cannot keep in registers: spilled registers, and large or dynamically indexed arrays; it is stored in GPU RAM and cached in the L1 and L2), and generic <code>LD</code> / <code>ST</code> when the compiler cannot tell which. All of them go to the LD/ST units: 8 per sub-partition, 32 per H100 SM.</p><p><b>The other path.</b> On Hopper, bulk copies between global and shared memory can instead go through the ${T('tensor-memory-accelerator', 'Tensor Memory Accelerator')} (TMA, the bar below the four sub-partitions in Fig. 1: pick “TMA · bulk copy” there to light it up and follow a copy), which needs no per-thread addresses and no LSU work: one thread describes a whole tile, and the TMA moves it.</p>`)}
<h3>Lowest and highest</h3>
<p>The memory hierarchy gives each level of the ${T('thread-hierarchy', 'thread hierarchy')} its own memory. Of the levels that groups of threads share, ${T('shared-memory', 'shared memory')} (for a thread block) is the lowest and ${T('global-memory', 'global memory')} (for the whole grid) the highest, and the LSUs are the units that reach both. Fig. 2 maps them onto the hardware.</p>
${GG.noteHTML('check', `<p>The glossary calls the L1 data cache and GPU RAM the <em>lowest</em> and <em>highest</em> levels of the memory hierarchy. Strictly, a thread’s ${T('registers', 'registers')} sit below shared memory (see ${T('memory-hierarchy', 'Memory Hierarchy')}), but registers need no LSU. Of the levels the LSUs serve, shared memory in the L1 is the lowest and global memory in GPU RAM the highest, which is how we read the sentence.</p>`)}
<div data-slot="lv" class="wide"></div>
<p>That reach is why so much of GPU performance work is about the LSUs’ traffic: whether a warp’s 32 addresses ${T('memory-coalescing', 'coalesce')} into few memory transactions, whether shared memory accesses hit ${T('bank-conflict', 'bank conflicts')}, and whether data is reused from the L1 instead of being fetched again from GPU RAM.</p>
<div data-slot="read"></div>`);
      guard(s.flow, 'LSU flow', () => lsuFlow(s.flow, ctx));
      guard(s.lv, 'Memory levels', () => lsuLevels(s.lv, ctx));
      ctx.reading(s.read, [
        { href: 'https://modal-cdn.com/gpu-glossary/gtc22-whitepaper-hopper.pdf', label: 'NVIDIA H100 Tensor Core GPU Architecture white paper', note: 'source of the SM diagram' },
      ]);
    },
  });


  /* ═════════════════════════════ Warp Scheduler ═════════════════════════════ */

  /* Fig: the race — CPU context switch vs GPU warp switch */
  function raceFigure(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'The race: one CPU context switch vs GPU warp switches', hint: 'drag the context-switch cost', wide: true,
      caption: 'Both lanes share one clock, drawn at about 1 GHz (1 cycle ≈ 1 ns, as the glossary rounds; a real CPU runs at a few GHz, so its cycles are shorter). Before thread B can run, the CPU core must switch thread A out and B in: enter the operating system, choose the next thread, save A’s context (registers, program counter and more) to memory and restore B’s, and, between processes, switch address spaces. Copying the registers is only part of that cost; none of those cycles do useful work. The SM keeps every resident warp’s registers in its register file, so its warp scheduler simply points at a different warp on the next cycle. The zoom strip shows the scheduler picking a warp on every one of a run of consecutive cycles. Which warp it picks comes from a toy model: after it issues, a warp waits 1 to 7 cycles (at random) for its next instruction’s operands, and the scheduler takes the warp that has been ready longest.',
    });
    const host = el('div', { class: 'hwa-w' });
    f.stage.append(host);
    f.stage.append(el('div', { class: 'hwa-legend', html: '<span><i class="hwa-sw-host"></i>CPU doing useful work</span><span><i class="hwa-sw-idle"></i>switching A out and B in (OS, context save / restore): no useful work</span><span><i class="hwa-sw-core"></i>GPU warp issuing</span><span><i class="hwa-sw-memory"></i>thread A’s registers</span><span><i class="hwa-sw-memorya"></i>thread B’s registers</span>' }));
    let N = 1000, W = 0, E = null, prog = 0.42;
    const R = () => Math.round(N * 0.18);
    const total = () => N + 2 * R();
    const sl = GG.ui.slider(f.controls, { label: 'CPU context switch', min: 200, max: 5000, step: 10, log: true, value: N, format: (v) => fmt.int(v) + ' cycles', onInput: (v) => { N = Math.round(v); upd(); } });
    void sl;
    const oG = GG.ui.stat(f.readouts, { label: 'GPU warp switch', value: '1 cycle ≈ 1 ns', tone: 'core' });
    const oC = GG.ui.stat(f.readouts, { label: 'CPU context switch', value: '—', tone: 'danger' });
    const oX = GG.ui.stat(f.readouts, { label: 'ratio', value: '—' });
    const oK = GG.ui.stat(f.readouts, { label: 'GPU cycles issued so far', value: '0', tone: 'core' });
    void oG;
    // warp choice per cycle, from a small model: after it issues, a warp stalls for 1–7 cycles (seeded PRNG);
    // each cycle the scheduler picks the eligible warp that has been ready longest. With 8 warps and stalls of
    // at most 7 cycles some warp is always eligible, so an instruction issues on every cycle, never from the
    // same warp twice in a row.
    const PICK = (() => {
      const n = 5000 + 2 * Math.round(5000 * 0.18) + 8, out = new Uint8Array(n), ready = new Array(8).fill(0);
      let seed = 12345;
      const rnd = () => { seed = (Math.imul(seed, 1103515245) + 12345) >>> 0; return seed / 4294967296; };
      for (let c = 0; c < n; c++) {
        let best = -1;
        for (let w = 0; w < 8; w++) if (ready[w] <= c && (best < 0 || ready[w] < ready[best])) best = w;
        out[c] = best;
        ready[best] = c + 2 + Math.floor(rnd() * 7);
      }
      return out;
    })();
    const warpAt = (c) => PICK[clamp(c, 0, PICK.length - 1)];
    function build(w) {
      W = w; host.innerHTML = '';
      const narrow = W < 640;
      const panH = narrow ? 150 : 160;
      const pw = narrow ? W : (W - 24) / 2;
      const top2 = narrow ? panH + 14 : 0;
      const laneY = (narrow ? 2 * panH + 44 : panH + 24);
      const H = laneY + 150;
      const svg = svgRoot(host, W, H, 'Top left: a CPU core saving thread A’s registers to memory and restoring thread B’s. Top right: an SM register file holding eight warps’ registers while the warp scheduler points at one warp per cycle. Bottom: two timelines of the same length: the CPU spends the middle on the context switch, the GPU issues an instruction on every cycle.');
      const D = defs(svg);
      // CPU panel
      const cpu = { x: 0, y: 0 };
      rect(svg, 0, 0, pw, panH, { fill: 'rgba(184,164,255,0.05)', stroke: 'var(--line-2)', rx: 10 });
      tx(svg, 12, 16, narrow ? 'CPU CORE' : 'CPU CORE · OS context switch', { size: 11, fill: 'var(--host)', weight: 600, ls: '0.06em' });
      const regX = 14, regY = 36, cs = narrow ? 14 : 18, cg = 3, nR = 12;
      rect(svg, regX - 6, regY - 6, 6 * (cs + cg) + 9, 2 * (cs + cg) + 9, { stroke: 'var(--memory)', rx: 6, fill: 'none' });
      tx(svg, regX - 4, regY + 2 * (cs + cg) + 16, 'registers', { size: 9.5, fill: 'var(--ink-3)' });
      const memX = pw - 14 - (6 * (cs + cg) + 3), memY = 36;
      const slot = (k) => ({ x: memX, y: memY + k * (2 * (cs + cg) + 26) });
      [0, 1].forEach((k) => { const p = slot(k); rect(svg, p.x - 6, p.y - 6, 6 * (cs + cg) + 9, 2 * (cs + cg) + 9, { stroke: 'var(--line-2)', rx: 6, fill: 'rgba(255,255,255,0.03)', dash: '3 3' }); tx(svg, p.x - 4, p.y + 2 * (cs + cg) + 14, (narrow ? 'saved: ' : 'saved context: thread ') + (k ? 'B' : 'A'), { size: 9, fill: 'var(--ink-3)' }); });
      tx(svg, memX - 4, 22, 'memory', { size: 9.5, fill: 'var(--ink-3)' });
      const cellPos = (i, base) => ({ x: base.x + (i % 6) * (cs + cg), y: base.y + Math.floor(i / 6) * (cs + cg) });
      const aCells = [], bCells = [];
      for (let i = 0; i < nR; i++) {
        // on phones the cells are too small for legible letters: solid = A, light = B (see the legend)
        const ga = S('g', {}, svg); rect(ga, 0, 0, cs, cs, { fill: 'var(--memory)', rx: 2 }); if (!narrow) tx(ga, cs / 2, cs / 2 + 0.5, 'A', { size: 9, anchor: 'middle', fill: '#0b0c12', weight: 700 }); aCells.push(ga);
        const gb = S('g', {}, svg); rect(gb, 0, 0, cs, cs, { fill: 'rgba(111,166,255,0.28)', stroke: 'var(--memory)', rx: 2 }); if (!narrow) tx(gb, cs / 2, cs / 2 + 0.5, 'B', { size: 9, anchor: 'middle', fill: 'var(--ink)', weight: 700 }); bCells.push(gb);
      }
      const cpuSay = tx(svg, 12, panH - 14, '', { size: narrow ? 10 : 11, fill: 'var(--ink)' });
      // GPU panel
      const gx = narrow ? 0 : pw + 24, gy = top2;
      rect(svg, gx, gy, pw, panH, { fill: 'rgba(69,212,155,0.04)', stroke: 'var(--line-2)', rx: 10 });
      tx(svg, gx + 12, gy + 16, narrow ? 'SM · warp switch' : 'SM SUB-PARTITION · warp switch', { size: 11, fill: 'var(--core)', weight: 600, ls: '0.06em' });
      const rfX = gx + 64, rfY = gy + 30, rh = (panH - 58) / 8, rw = Math.min(pw - 90, 260);
      rect(svg, rfX - 5, rfY - 4, rw + 10, 8 * rh + 8, { stroke: 'var(--memory)', rx: 6 });
      tx(svg, gx + pw - 12, gy + 16, 'register file: nothing moves', { size: 9.5, fill: 'var(--memory)', anchor: 'end' });
      const rows = [];
      for (let k = 0; k < 8; k++) {
        const g = S('g', {}, svg);
        const bg = rect(g, rfX, rfY + k * rh + 1, rw, rh - 2, { fill: 'var(--memory-a)', rx: 2 });
        for (let j = 0; j < 12; j++) rect(g, rfX + 4 + j * ((rw - 8) / 12), rfY + k * rh + 3, (rw - 8) / 12 - 2, rh - 6, { fill: 'rgba(111,166,255,0.45)', rx: 1 });
        tx(g, rfX - 10, rfY + k * rh + rh / 2, 'W' + k, { size: 9.5, anchor: 'end', fill: 'var(--ink-2)' });
        rows.push(bg);
      }
      const arrow = S('path', { d: 'M0,-6 L10,0 L0,6 z', fill: 'var(--control)' }, svg);
      tx(svg, gx + 12, gy + panH - 14, 'warp scheduler', { size: 9.5, fill: 'var(--control)' });
      // lanes
      const lx = narrow ? 0 : 92, lw = W - lx;
      if (!narrow) { tx(svg, 0, laneY + 14, 'CPU', { size: 11, fill: 'var(--host)', weight: 600 }); tx(svg, 0, laneY + 56, 'GPU', { size: 11, fill: 'var(--core)', weight: 600 }); }
      else { tx(svg, 0, laneY - 8, 'CPU core', { size: 10, fill: 'var(--host)', weight: 600 }); tx(svg, 0, laneY + 39, 'GPU warp scheduler', { size: 10, fill: 'var(--core)', weight: 600 }); }
      const cpuLane = S('g', {}, svg), gpuLane = S('g', {}, svg);
      const cpuSegs = [rect(cpuLane, 0, 0, 0, 0, { fill: 'var(--host)', rx: 3 }), rect(cpuLane, 0, 0, 0, 0, { fill: 'var(--danger-a)', stroke: 'var(--danger)', rx: 3 }), rect(cpuLane, 0, 0, 0, 0, { fill: 'var(--danger-a)', stroke: 'var(--danger)', rx: 3 }), rect(cpuLane, 0, 0, 0, 0, { fill: 'var(--host)', rx: 3 })];
      const segLab = [tx(cpuLane, 0, 0, 'A runs', { size: 10, anchor: 'middle', fill: '#0b0c12', weight: 600 }), tx(cpuLane, 0, 0, narrow ? 'switch out A' : 'switch out A (save context)', { size: 10, anchor: 'middle', fill: 'var(--danger)' }), tx(cpuLane, 0, 0, narrow ? 'switch in B' : 'switch in B (restore context)', { size: 10, anchor: 'middle', fill: 'var(--danger)' }), tx(cpuLane, 0, 0, 'B runs', { size: 10, anchor: 'middle', fill: '#0b0c12', weight: 600 })];
      const segShort = ['A', '', '', 'B'];
      const gpuBar = rect(gpuLane, lx, laneY + (narrow ? 48 : 42), lw, narrow ? 26 : 28, { fill: 'var(--core)', rx: 3 });
      const gpuLab = tx(gpuLane, lx + lw / 2, laneY + (narrow ? 61 : 56), '', { size: 10, anchor: 'middle', fill: '#0b0c12', weight: 600 });
      const head = S('line', { stroke: 'var(--ink)', 'stroke-width': 1.5 }, svg);
      // zoom strip
      const zy = laneY + 92, zc = narrow ? 10 : 24, zw = lw / zc;
      tx(svg, lx, zy - 7, narrow ? 'zoom · 10 GPU cycles: the warp issued on each' : 'zoom · 24 consecutive GPU cycles around the playhead: the warp issued on each', { size: 9.5, fill: 'var(--ink-3)' });
      const zCells = [];
      for (let i = 0; i < zc; i++) { const g = S('g', {}, svg); const r = rect(g, lx + i * zw + 1, zy, zw - 2, 26, { fill: 'var(--core-a)', stroke: 'var(--core)', rx: 2 }); const t = tx(g, lx + i * zw + zw / 2, zy + 13, '', { size: 10, anchor: 'middle', fill: 'var(--ink)' }); zCells.push({ r, t }); }
      const zLab = tx(svg, lx, zy + 42, '', { size: 9.5, fill: 'var(--ink-3)' });
      E = { aCells, bCells, cellPos, regBase: { x: regX, y: regY }, slot, rows, arrow, rfX, rfY, rh, cpuSegs, segLab, segShort, segFull: segLab.map((q) => q.textContent), gpuBar, gpuLab, head, laneY, lx, lw, zCells, zLab, cpuSay, H, narrow };
      paint();
    }
    function paint() {
      if (!E) return;
      const C = total(), r = R(), cyc = Math.min(C - 1, Math.floor(prog * C));
      // lanes
      const xs = (c) => E.lx + (c / C) * E.lw;
      const segs = [[0, r], [r, r + N / 2], [r + N / 2, r + N], [r + N, C]];
      segs.forEach(([a, b], i) => {
        const s = E.cpuSegs[i];
        s.setAttribute('x', xs(a) + 0.5); s.setAttribute('width', Math.max(0, xs(b) - xs(a) - 1)); s.setAttribute('y', E.laneY); s.setAttribute('height', 28);
        const t = E.segLab[i]; t.setAttribute('x', (xs(a) + xs(b)) / 2); t.setAttribute('y', E.laneY + 14);
        const full = E.segFull[i], wseg = xs(b) - xs(a);
        // long labels when they fit, the bare thread letter in short lavender segments, nothing in tiny ones
        t.textContent = full.length * 6.2 + 8 < wseg ? full : E.segShort[i] && wseg > 12 ? E.segShort[i] : '';
      });
      E.gpuLab.textContent = `an instruction issues every cycle: ${fmt.int(C)} cycles, any warp each time`;
      if (E.narrow) E.gpuLab.textContent = 'issuing every cycle';
      const hx = xs(prog * C);
      E.head.setAttribute('x1', hx); E.head.setAttribute('x2', hx); E.head.setAttribute('y1', E.laneY - 6); E.head.setAttribute('y2', E.laneY + 76);
      // CPU mechanism
      const sv = clamp((cyc - r) / (N / 2), 0, 1), rs = clamp((cyc - r - N / 2) / (N / 2), 0, 1);
      const lerp = (p, q, t) => ({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t });
      E.aCells.forEach((g, i) => {
        const t = clamp(sv * 12 - i, 0, 1);
        const p = lerp(E.cellPos(i, E.regBase), E.cellPos(i, E.slot(0)), t);
        g.setAttribute('transform', `translate(${p.x.toFixed(1)},${p.y.toFixed(1)})`);
      });
      E.bCells.forEach((g, i) => {
        const t = clamp(rs * 12 - i, 0, 1);
        const p = lerp(E.cellPos(i, E.slot(1)), E.cellPos(i, E.regBase), t);
        g.setAttribute('transform', `translate(${p.x.toFixed(1)},${p.y.toFixed(1)})`);
      });
      const phase = cyc < r ? 0 : cyc < r + N / 2 ? 1 : cyc < r + N ? 2 : 3;
      E.cpuSay.textContent = ['thread A runs', `switching A out: ${fmt.int(Math.min(N / 2, cyc - r))} cycles…`, `switching B in: ${fmt.int(Math.min(N / 2, cyc - r - N / 2))} cycles…`, 'thread B finally runs'][phase];
      E.cpuSay.setAttribute('fill', phase === 1 || phase === 2 ? 'var(--danger)' : 'var(--ink)');
      // GPU mechanism
      const w = warpAt(cyc);
      E.rows.forEach((b, k) => b.setAttribute('fill', k === w ? 'var(--core)' : 'var(--memory-a)'));
      E.arrow.setAttribute('transform', `translate(${E.rfX - 40},${E.rfY + w * E.rh + E.rh / 2})`);
      // zoom
      const zc = E.zCells.length, z0 = Math.max(0, Math.min(C - zc, cyc - (zc >> 1)));
      E.zCells.forEach((z, i) => { const c = z0 + i; z.t.textContent = 'W' + warpAt(c); z.r.setAttribute('fill', c === cyc ? 'var(--core)' : 'var(--core-a)'); z.t.setAttribute('fill', c === cyc ? '#0b0c12' : 'var(--ink)'); });
      E.zLab.textContent = `cycles ${fmt.int(z0)}–${fmt.int(z0 + zc - 1)} of ${fmt.int(C)}`;
      oK.set(fmt.int(cyc + 1));
    }
    function upd() {
      oC.set(`${fmt.int(N)} cycles ≈ ${GG.fmt.sig(N / 1000, 2)} µs at 1 GHz`);
      oX.set('×' + fmt.int(N));
      f.setWhy(`A CPU context switch of <b>${fmt.int(N)} cycles</b> (about ${GG.fmt.sig(N / 1000, 2)} µs at 1 GHz) is spent in the operating system: entering the kernel, choosing the next thread, saving thread A’s context (registers, program counter and more) and restoring thread B’s, and, between processes, switching address spaces. In that time the GPU’s warp scheduler could switch warps <b>${fmt.int(N)} times</b>, one per cycle, because no data has to move: each warp’s registers are already in the register file.`);
      paint();
    }
    onWidth(host, build);
    const anim = GG.anim(host, (t) => { prog = (t / 7) % 1.08; if (prog > 1) prog = 1; paint(); });
    GG.ui.playButton(f.controls, anim);
    upd();
  }

  /* Fig: how many threads' state one core holds, and how many issue per cycle: SMT core vs warp scheduler vs SM */
  function smtFigure(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Hyper-threading, at a much larger scale', hint: 'step the clock · switch the GPU view', wide: true,
      caption: 'Left: a CPU core with simultaneous multi-threading holds the state (registers, program counter) of 2 threads and can issue instructions from both in the same cycle. Right: one H100 warp scheduler holds the state of up to 16 warps (512 threads) in its register file and issues from one of them per cycle, a different one whenever it likes; the whole SM has four such schedulers, 64 warps and 2,048 threads, and issues 4 warps per cycle. Which warp is picked on each cycle is random here; a real scheduler picks one whose operands are ready (Fig. 3).',
    });
    const host = el('div', { class: 'hwa-w' });
    f.stage.append(host);
    f.stage.append(el('div', { class: 'hwa-legend', html: '<span><i class="hwa-sw-memory"></i>one thread’s or warp’s state (registers, program counter)</span><span><i class="hwa-sw-core"></i>issuing this cycle</span><span><i class="hwa-sw-control"></i>warp scheduler</span>' }));
    let view = 'sched', cyc = 0, E = null, pick = [0, 0, 0, 0];
    const rnd = () => { for (let q = 0; q < 4; q++) pick[q] = (Math.random() * 16) | 0; };
    rnd();
    function build(w) {
      host.innerHTML = '';
      const narrow = w < 640;
      const cpuW = narrow ? w : Math.min(300, w * 0.3), gx = narrow ? 0 : cpuW + 40, gw = w - gx;
      const nS = view === 'sm' ? 4 : 1;
      const rowH = narrow ? 10 : 12, top = 30;
      const panH = top + 16 * rowH + 82;
      const cpuH = narrow ? 150 : panH;
      const H = narrow ? cpuH + 20 + panH : panH;
      const svg = svgRoot(host, w, H, 'A CPU core holding two threads’ state, both issuing; an SM warp scheduler holding sixteen warps’ state, one issuing per cycle; optionally all four schedulers of an SM.');
      const D = defs(svg, 'var(--core)');
      // CPU core
      tx(svg, 0, 10, 'CPU CORE · SMT', { size: 11, fill: 'var(--host)', weight: 600, ls: '0.06em' });
      rect(svg, 0, 22, cpuW, cpuH - 26, { fill: 'rgba(184,164,255,0.05)', stroke: 'var(--line-2)', rx: 10 });
      const tW = Math.min(110, (cpuW - 48) / 2), cpuT = [];
      for (let k = 0; k < 2; k++) {
        const x = 16 + k * (tW + 16);
        const g = S('g', {}, svg);
        rect(g, x, 40, tW, 34, { fill: 'var(--memory-a)', stroke: 'var(--memory)', rx: 5 });
        tx(g, x + tW / 2, 57, 'thread ' + k, { size: 10.5, anchor: 'middle', fill: 'var(--ink)' });
        cpuT.push(line(svg, [[x + tW / 2, 76], [x + tW / 2, cpuH - 50]], { stroke: 'var(--core)', sw: 2, arrow: D.arrow }));
      }
      rect(svg, 16, cpuH - 46, 2 * tW + 16, 22, { fill: 'var(--core-a)', stroke: 'var(--core)', rx: 5 });
      tx(svg, 16 + tW + 8, cpuH - 35, 'execution units', { size: 10, anchor: 'middle', fill: 'var(--core)' });
      // GPU side
      const oy = narrow ? cpuH + 20 : 0;
      tx(svg, gx, oy + 10, view === 'sm' ? 'H100 SM · 4 warp schedulers' : 'ONE H100 WARP SCHEDULER', { size: 11, fill: 'var(--control)', weight: 600, ls: '0.06em' });
      rect(svg, gx, oy + 22, gw, panH - 26, { fill: 'rgba(69,212,155,0.04)', stroke: 'var(--line-2)', rx: 10 });
      const colGap = 14, lab = view === 'sm' ? 0 : (narrow ? 34 : 44);
      const cw = (gw - 24 - lab - (nS - 1) * colGap) / nS;
      const cols = [];
      for (let q = 0; q < nS; q++) {
        const x0 = gx + 12 + lab + q * (cw + colGap), y0 = oy + top + 10;
        if (nS > 1) tx(svg, x0, y0 - 2, 'scheduler ' + q, { size: narrow ? 8.5 : 9.5, fill: 'var(--control)' });
        const rowsE = [];
        for (let r = 0; r < 16; r++) {
          const rr = rect(svg, x0 + 10, y0 + 6 + r * rowH, cw - 10, rowH - 2, { fill: 'var(--memory-a)', stroke: 'rgba(111,166,255,0.5)', rx: 2, sw: 0.8 });
          rowsE.push(rr);
          if (nS === 1 && (r % (narrow ? 3 : 1) === 0 || r === 15)) tx(svg, x0 - 6, y0 + 6 + r * rowH + rowH / 2 - 1, 'W' + r, { size: narrow ? 8.5 : 9.5, anchor: 'end', fill: 'var(--ink-3)' });
        }
        const ptr = S('path', { d: 'M0,-5 L8,0 L0,5 z', fill: 'var(--control)' }, svg);
        const ex = rect(svg, x0 + 10, y0 + 6 + 16 * rowH + 14, cw - 10, 20, { fill: 'var(--core-a)', stroke: 'var(--core)', rx: 4 });
        const exT = tx(svg, x0 + 10 + (cw - 10) / 2, y0 + 6 + 16 * rowH + 24, '', { size: narrow ? 8.5 : 10, anchor: 'middle', fill: 'var(--ink)' });
        cols.push({ x0, y0, rowsE, ptr, ex, exT });
      }
      const say = tx(svg, gx + 12, oy + panH - 12, '', { size: narrow ? 9.5 : 10.5, fill: 'var(--ink)' });
      E = { cpuT, cols, rowH, say, nS, narrow };
      paint();
    }
    function paint() {
      if (!E) return;
      E.cpuT.forEach((l) => l.setAttribute('stroke-opacity', 1));
      E.cols.forEach((c, q) => {
        c.rowsE.forEach((r, k) => { const on = k === pick[q]; r.setAttribute('fill', on ? 'var(--core)' : 'var(--memory-a)'); r.setAttribute('stroke', on ? 'var(--core)' : 'rgba(111,166,255,0.5)'); });
        c.ptr.setAttribute('transform', `translate(${c.x0 - (E.nS > 1 ? 0 : 0)},${c.y0 + 6 + pick[q] * E.rowH + E.rowH / 2 - 1})`);
        const wn = E.nS > 1 ? pick[q] * 4 + q : pick[q]; // whole-SM view numbers warps per SM, drawn as scheduler q owning q, q + 4, …
        c.exT.textContent = E.nS > 1 ? (E.narrow ? 'W' + wn : 'W' + wn + ' · 32 thr.') : `warp W${wn}: 32 threads issue`;
      });
      E.say.textContent = E.nS > 1 ? `cycle ${cyc}: 4 warps issue (128 threads); 64 warps resident` : `cycle ${cyc}: 1 warp issues; 16 resident`;
      f.setWhy(E.nS > 1
        ? `<b>Cycle ${cyc}.</b> The SM’s four schedulers each issue from one of their 16 warps: <b>4 warps, 128 threads</b> issue on the same cycle, out of <b>64 resident warps (2,048 threads)</b>. The CPU core holds <b>2</b> threads and can issue from both. That is the “much larger scale”: 2,048 threads’ state on one SM against 2 on one core, and switching between them is free.`
        : `<b>Cycle ${cyc}.</b> One warp scheduler holds up to <b>16 warps</b> and issues from <b>one</b> of them, W${pick[0]}, this cycle; next cycle it may pick any other. The CPU core holds <b>2</b> threads and can issue from both in the same cycle. So a warp scheduler alone is closer to fine-grained (interleaved) multithreading; the simultaneous part comes from the SM’s four schedulers. Switch the view to see them.`);
    }
    GG.ui.seg(f.controls, { label: 'GPU side', value: 'sched', onChange: (v) => { view = v; build(PW); }, options: [{ value: 'sched', label: 'one scheduler' }, { value: 'sm', label: 'whole SM' }] });
    const next = () => { cyc++; rnd(); paint(); };
    GG.ui.button(f.controls, { icon: 'next', label: 'Next cycle', onClick: next });
    let acc = 0;
    const anim = GG.anim(host, (t, dt) => { acc += dt; if (acc > 0.9) { acc = 0; next(); } }, { autostart: false });
    GG.ui.playButton(f.controls, anim);
    GG.ui.stat(f.readouts, { label: 'threads’ state held · CPU core', value: '2', tone: 'host' });
    GG.ui.stat(f.readouts, { label: 'warps · per scheduler / per SM', value: '16 / 64', tone: 'memory' });
    GG.ui.stat(f.readouts, { label: 'issue per cycle · scheduler / SM', value: '1 warp / 4 warps', tone: 'core' });
    let PW = 0;
    onWidth(host, (w) => { PW = w; build(w); });
  }

  /* Fig: cache locality after switches (LRU model) */
  function localityFigure(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Switching and the cache', hint: 'compare CPU threads with GPU warps', wide: true,
      caption: `A model of a 16-line cache. <b>CPU threads:</b> two threads with separate data (lines A0, A1, …, solid, and B0, B1, …, hatched; the bar above the cache counts each thread’s lines) take turns (24 accesses each, then a context switch), and the hardware evicts the least recently used line when it needs room (the evicted line flashes red): each thread’s return finds some of its data gone, the effect Mogul and Borg measured. <b>GPU warps, shared tile:</b> the warps of one ${T('cooperative-thread-array', 'CTA')} share a tile that the program loaded into ${T('shared-memory', 'shared memory')}; switching between warps on every access evicts nothing, because the programmer, not the hardware, decides what stays. <b>GPU warps, private data:</b> the same four warps switching on every access, but each with its own data in a hardware-managed cache (one fill style per warp). Cheap switches alone do not save the cache: the benefit comes from data the warps share and the programmer keeps.`,
    });
    const host = el('div', { class: 'hwa-w' });
    f.stage.append(host);
    const CAP = 16;
    let mode = 'cpu', ws = 12, st = null, E = null;
    function reset() {
      st = { lines: [], t: 0, hits: 0, miss: 0, last: null, owner: 0, k: 0, after: 0, hist: [] };
      paint();
    }
    function access() {
      st.evicted = null;
      const evict = (tag) => { let lo = 0; st.lines.forEach((l, i) => { if (l.used < st.lines[lo].used) lo = i; }); st.evicted = { idx: lo, tag: st.lines[lo].tag }; st.lines.splice(lo, 1, { tag, used: st.t }); };
      if (mode === 'cpu') {
        if (st.k >= 24) { st.k = 0; st.owner = 1 - st.owner; st.after = 0; }
        const tag = (st.owner ? 'B' : 'A') + (st.k % ws);
        st.k++;
        const idx = st.lines.findIndex((l) => l.tag === tag);
        if (idx >= 0) { st.hits++; st.lines[idx].used = st.t; st.last = { tag, hit: true }; }
        else {
          st.miss++; st.after++;
          if (st.lines.length >= CAP) evict(tag);
          else st.lines.push({ tag, used: st.t });
          st.last = { tag, hit: false };
        }
      } else if (mode === 'gpup') {
        // GPU, private data: warps W0–W3 switch every access, each reading its own `ws` lines through an LRU cache
        const warp = st.t % 4, tag = 'P' + warp + '.' + ((st.t >> 2) % ws);
        st.owner = warp;
        const idx = st.lines.findIndex((l) => l.tag === tag);
        if (idx >= 0) { st.hits++; st.lines[idx].used = st.t; st.last = { tag, hit: true }; }
        else {
          st.miss++;
          if (st.lines.length >= CAP) evict(tag);
          else st.lines.push({ tag, used: st.t });
          st.last = { tag, hit: false };
        }
      } else {
        // GPU: warps W0–W3 take turns every access; all read the CTA's shared tile of `ws` lines
        const warp = st.t % 4, tag = 'T' + ((st.t >> 2) % ws);
        st.owner = warp;
        const idx = st.lines.findIndex((l) => l.tag === tag);
        if (idx >= 0) { st.hits++; st.last = { tag, hit: true }; }
        else { st.miss++; st.lines.push({ tag, used: st.t }); st.last = { tag, hit: false }; }
      }
      st.hist.push(st.last.hit ? 1 : 0); if (st.hist.length > 96) st.hist.shift();
      st.t++;
      paint();
    }
    function build(w) {
      host.innerHTML = '';
      const narrow = w < 640;
      const cell = narrow ? Math.floor((w - 20) / 8) : 46, cols = narrow ? 8 : 16;
      const top = 44;
      const H = top + (narrow ? 2 : 1) * (cell + 4) + 92;
      const svg = svgRoot(host, w, H, 'A row of 16 cache lines, each labelled with the data it holds and filled in the style of its owner; a bar counting the lines each owner holds; a strip of recent hits and misses.');
      // owner styles: all data is blue; owners differ by fill treatment (solid, hatched, dotted, outline)
      const d = S('defs', {}, svg), pid = GG.uid('hwa-loc');
      const ph = S('pattern', { id: pid + '-h', width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, d);
      S('rect', { width: 6, height: 6, fill: 'rgba(111,166,255,0.06)' }, ph); S('rect', { width: 2, height: 6, fill: 'rgba(111,166,255,0.7)' }, ph);
      const pd = S('pattern', { id: pid + '-d', width: 6, height: 6, patternUnits: 'userSpaceOnUse' }, d);
      S('rect', { width: 6, height: 6, fill: 'rgba(111,166,255,0.06)' }, pd); S('circle', { cx: 3, cy: 3, r: 1.3, fill: 'rgba(111,166,255,0.85)' }, pd);
      STY = {
        solid: { fill: 'rgba(111,166,255,0.42)', stroke: 'var(--memory)', dash: null },
        hatch: { fill: `url(#${pid}-h)`, stroke: 'var(--memory)', dash: null },
        dots: { fill: `url(#${pid}-d)`, stroke: 'var(--memory)', dash: null },
        outline: { fill: 'rgba(111,166,255,0.03)', stroke: 'var(--memory)', dash: '3 2' },
      };
      tx(svg, 0, 10, 'CACHE · 16 lines', { size: 10.5, fill: 'var(--memory)', ls: '0.08em' });
      // stacked bar: how many of the 16 lines each owner holds
      const bx = narrow ? 0 : 150, bw = w - bx, segs = [];
      for (let k = 0; k < 5; k++) {
        const g = S('g', {}, svg);
        const r = rect(g, 0, narrow ? 18 : 2, 0, 14, { rx: 2 });
        const t = tx(g, 0, narrow ? 25 : 9, '', { size: 9.5, anchor: 'middle', fill: 'var(--ink)', weight: 600 });
        segs.push({ g, r, t });
      }
      const cells = [];
      for (let i = 0; i < CAP; i++) {
        const x = (i % cols) * (cell + 4), y = top + Math.floor(i / cols) * (cell + 4);
        const g = S('g', {}, svg);
        const r = rect(g, x, y, cell, cell, { fill: 'rgba(255,255,255,0.03)', stroke: 'var(--line-2)', rx: 4 });
        const t = tx(g, x + cell / 2, y + cell / 2, '', { size: narrow ? 10 : 11.5, anchor: 'middle', fill: 'var(--ink)', weight: 600 });
        cells.push({ r, t });
      }
      const hy = top + (narrow ? 2 : 1) * (cell + 4) + 18;
      tx(svg, 0, hy - 6, 'recent accesses: hit (green) or miss (red)', { size: 9.5, fill: 'var(--ink-3)' });
      const hc = narrow ? 48 : 96, hw = w / hc;
      const hist = [];
      for (let i = 0; i < hc; i++) hist.push(rect(svg, i * hw + 0.5, hy + 4, hw - 1, 16, { fill: 'rgba(255,255,255,0.04)', rx: 1 }));
      const say = tx(svg, 0, hy + 40, '', { size: narrow ? 10 : 11, fill: 'var(--ink)' });
      E = { cells, hist, hc, say, segs, bx, bw, narrow };
      paint();
    }
    let STY = null;
    const ownerOf = (tag) => (mode === 'cpu' ? tag[0] : mode === 'gpup' ? 'W' + tag[1] : 'tile');
    const OWN = { cpu: [['A', 'solid'], ['B', 'hatch']], gpup: [['W0', 'solid'], ['W1', 'hatch'], ['W2', 'dots'], ['W3', 'outline']], gpu: [['tile', 'solid']] };
    const styleOf = (own) => { const o = OWN[mode].find((q) => q[0] === own); return STY[o ? o[1] : 'solid']; };
    function paint() {
      if (!E || !st || !STY) return;
      E.cells.forEach((c, i) => {
        const l = st.lines[i];
        if (!l) { c.r.setAttribute('fill', 'rgba(255,255,255,0.03)'); c.r.setAttribute('stroke', 'var(--line-2)'); c.r.removeAttribute('stroke-dasharray'); c.t.textContent = ''; return; }
        const sty = styleOf(ownerOf(l.tag));
        const fresh = st.last && st.last.tag === l.tag;
        const ev = st.evicted && st.evicted.idx === i;
        c.r.setAttribute('fill', ev ? 'var(--danger-a)' : sty.fill);
        c.r.setAttribute('stroke', ev ? 'var(--danger)' : fresh ? (st.last.hit ? 'var(--core)' : 'var(--danger)') : sty.stroke);
        c.r.setAttribute('stroke-width', fresh || ev ? 2.5 : 1);
        if (sty.dash && !fresh && !ev) c.r.setAttribute('stroke-dasharray', sty.dash); else c.r.removeAttribute('stroke-dasharray');
        c.t.textContent = mode === 'cpu' ? l.tag : mode === 'gpup' ? 'W' + l.tag.slice(1) : 'tile ' + l.tag.slice(1);
        c.t.setAttribute('font-size', mode === 'cpu' ? 11.5 : 9.5);
      });
      // owner bar
      const own = OWN[mode].map(([k, sk]) => ({ k, sty: STY[sk], n: st.lines.filter((l) => ownerOf(l.tag) === k).length }));
      own.push({ k: 'empty', sty: { fill: 'rgba(255,255,255,0.03)', stroke: 'var(--line-2)' }, n: CAP - st.lines.length });
      let x = E.bx;
      E.segs.forEach((sg, k) => {
        const o = own[k];
        if (!o || !o.n) { sg.g.style.display = 'none'; return; }
        sg.g.style.display = '';
        const wd = (o.n / CAP) * E.bw;
        sg.r.setAttribute('x', x + 0.5); sg.r.setAttribute('width', Math.max(0, wd - 1));
        sg.r.setAttribute('fill', o.sty.fill); sg.r.setAttribute('stroke', o.sty.stroke);
        if (o.sty.dash) sg.r.setAttribute('stroke-dasharray', o.sty.dash); else sg.r.removeAttribute('stroke-dasharray');
        const label = `${o.k}: ${o.n}`;
        sg.t.textContent = label.length * 6 + 6 < wd ? label : String(o.n);
        sg.t.setAttribute('x', x + wd / 2);
        if (wd < 10) sg.t.textContent = '';
        x += wd;
      });
      const h = st.hist.slice(-E.hc);
      E.hist.forEach((r, i) => { const v = h[i]; r.setAttribute('fill', v == null ? 'rgba(255,255,255,0.04)' : v ? 'var(--core)' : 'var(--danger)'); });
      const tot = st.hits + st.miss;
      oH.set(tot ? fmt.pct(st.hits / tot, 0) : '—', tot && st.hits / tot > 0.9 ? 'core' : tot ? 'danger' : null);
      oM.set(fmt.int(st.miss));
      const lbl = (tag) => (mode === 'cpu' ? tag : mode === 'gpup' ? 'W' + tag.slice(1) : 'tile ' + tag.slice(1));
      const evTxt = st.evicted && st.last ? ` · miss on ${lbl(st.last.tag)} evicted ${lbl(st.evicted.tag)}` : '';
      E.say.textContent = (mode === 'cpu' ? `running thread ${st.owner ? 'B' : 'A'} · its working set: ${ws} lines` : mode === 'gpup' ? (E.narrow ? `warp W${st.owner} · own data: ${ws} lines each` : `warp W${st.owner} issuing · each warp’s own data: ${ws} lines (${4 * ws} in all)`) : `warp W${st.owner} of the CTA issuing · shared tile: ${ws} lines`) + (E.narrow ? '' : evTxt);
    }
    const oH = GG.ui.stat(f.readouts, { label: 'hit rate so far', value: '—' });
    const oM = GG.ui.stat(f.readouts, { label: 'misses', value: '0', tone: 'danger' });
    GG.ui.seg(f.controls, { label: 'Who takes turns', value: 'cpu', onChange: (v) => { mode = v; reset(); warm(); why(); }, options: [{ value: 'cpu', label: 'CPU threads A, B' }, { value: 'gpu', label: 'GPU warps, shared tile' }, { value: 'gpup', label: 'GPU warps, private data' }] });
    GG.ui.slider(f.controls, { label: 'Working set', min: 4, max: 16, step: 1, value: ws, format: (v) => v + ' lines', onInput: (v) => { ws = v; reset(); warm(); why(); } });
    let acc = 0;
    const anim = GG.anim(host, (t, dt) => { acc += dt; while (acc > 0.11) { acc -= 0.11; access(); } });
    GG.ui.playButton(f.controls, anim);
    GG.ui.button(f.controls, { icon: 'next', label: '24 accesses', onClick: () => { for (let i = 0; i < 24; i++) access(); } });
    GG.ui.button(f.controls, { icon: 'reset', label: 'Reset', onClick: () => { reset(); } });
    function why() {
      f.setWhy(mode === 'cpu'
        ? (2 * ws <= CAP
          ? `Two working sets of ${ws} lines fit in 16 together, so after the first misses both threads keep hitting. Make the working sets bigger than 8 lines and watch every switch flush the other thread’s data.`
          : `Two working sets of ${ws} lines do not fit in 16 together. Every context switch lets the running thread evict the other’s lines, so each thread starts its turn with a burst of <b>misses</b>: reduced locality, the cost Mogul and Borg measured on top of the switch itself.`)
        : mode === 'gpup'
          ? (4 * ws <= CAP
            ? `Four warps with ${ws} private lines each need ${4 * ws} lines, which fit in 16, so they keep hitting. Make each warp’s data bigger than 4 lines and watch the hit rate fall.`
            : `Four warps with ${ws} private lines each need <b>${4 * ws}</b> lines, more than the 16 the cache holds. Switching on every access, each warp evicts the others’ data and the hit rate collapses, cheap switches or not. Compare the shared tile: what protects the GPU’s cache is that warps share data the programmer keeps there.`)
          : `The ${ws}-line tile is loaded once (the first misses) and then shared: warps W0–W3 switch on <b>every</b> access, yet nothing is evicted, so the hit rate climbs toward 100%. Warp switches have much less impact on cache hit rates.`);
    }
    onWidth(host, build);
    const warm = () => { for (let i = 0; i < 72; i++) access(); }; // open on three turns already played
    reset(); warm(); why();
  }

  GG.entry('warp-scheduler', {
    render(body, ctx) {
      body.classList.add('hwa-body');
      const s = ctx.html(body, `
<p>The Warp Scheduler of the ${T('streaming-multiprocessor', 'Streaming Multiprocessor (SM)')} decides which group of ${T('thread', 'threads')} to execute on each clock cycle. An H100 SM has four of them, one per sub-partition; each issues one instruction per cycle for a group of 32 threads, and its Dispatch Unit hands that instruction to the execution units.</p>
<div data-slot="sm" class="wide"></div>
<h3>Switching every cycle</h3>
<p>These groups of threads, known as ${T('warp', 'warps')}, are switched out on a per-clock-cycle basis: roughly one nanosecond. This is much like the fine-grained thread-level parallelism of <em>simultaneous multi-threading</em> (“hyper-threading”) in CPUs, where one core holds two threads’ state and issues instructions from both, even in the same cycle, but at a much larger scale: up to 64 warps per SM, 16 for each of its four schedulers at full occupancy (every warp belongs to one sub-partition’s scheduler), instead of 2 threads per core. The analogy has one twist: each warp scheduler issues from <b>one</b> warp per cycle, switching every cycle (what CPU designers call fine-grained, or interleaved, multithreading). Across the SM’s four schedulers, four warps issue on the same cycle, which is the simultaneous part. Fig. 2 draws both.</p>
<div data-slot="smt" class="wide"></div>
<p>The ability of the Warp Schedulers to switch rapidly between a large number of concurrent tasks <strong>as soon as their instructions’ operands are available</strong> is key to the ${T('latency-hiding', 'latency hiding')} capabilities of GPUs. A warp waiting for a load from memory simply is not picked; another warp whose operands are ready runs instead.</p>
<div data-slot="cy" class="wide"></div>
<h3>Why a CPU cannot do the same</h3>
<p>Full CPU thread context switches take a few hundred to a few thousand clock cycles (more like a microsecond than a nanosecond), due to the need to <strong>save the context</strong> of one thread (its registers, its program counter, and more) to memory and <strong>restore the context</strong> of another.</p>
<div data-slot="race" class="wide"></div>
<p>Additionally, context switches on CPUs lead to reduced <em>locality</em> (the tendency of a program to reuse data it touched recently, which is what caches rely on), further reducing performance by increasing cache miss rates: the incoming thread finds the cache full of the outgoing thread’s data (see ${X('https://www.researchgate.net/publication/220938995_The_Effect_of_Context_Switches_on_Cache_Performance', 'Mogul and Borg, 1991')}).</p>
<h3>Why the GPU can</h3>
<p>Because each ${T('thread', 'thread')} has its own private ${T('registers', 'registers')} allocated from the ${T('register-file', 'register file')} of the ${T('streaming-multiprocessor', 'SM')}, context switches on the GPU <strong>do not require any data movement</strong> to save or restore contexts. Every resident warp’s context is already where it needs to be; switching is just choosing a different warp.</p>
<p>And because the ${T('l1-data-cache', 'L1 caches')} on GPUs can be entirely programmer-managed and are ${T('shared-memory', 'shared')} between the ${T('warp', 'warps')} scheduled together onto an ${T('streaming-multiprocessor', 'SM')} (see ${T('cooperative-thread-array', 'cooperative thread array')}), context switches on the GPU have much less impact on cache hit rates. For details on the interaction between programmer-managed caches and hardware-managed caches in GPUs, see ${X('https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#maximize-memory-throughput', 'the “Maximize Memory Throughput” section of the CUDA C Programming Guide')}.</p>
<div data-slot="loc" class="wide"></div>
${GG.noteHTML('intuition', '<p>A CPU context switch is like a chef who must pack away one dish’s ingredients and unpack another’s before cooking again. An SM is a kitchen where every dish has its own counter space, already laid out, and the chef just turns to whichever dish is ready: no packing, nothing knocked off the counters.</p>')}
<h3>Keeping track of warps</h3>
<p>The Warp Schedulers also manage the ${T('warp-execution-state', 'execution state of warps')}: which warps are <em>active</em> (resident on the SM), which are <em>stalled</em> (waiting on an operand, a busy execution unit or a barrier), which are <em>eligible</em> to issue, and which one is <em>selected</em> on each cycle. Fig. 3 above uses those states; the ${T('warp-execution-state', 'Warp Execution State')} entry defines them.</p>
<div data-slot="read"></div>`);
      guard(s.sm, 'SM floorplan', () => smFigure(s.sm, ctx, {
        title: 'Warp schedulers in an H100 SM', focus: true,
        caption: `The internal architecture of an H100 SM, redrawn from NVIDIA’s ${X('https://modal-cdn.com/gpu-glossary/gtc22-whitepaper-hopper.pdf', 'H100 white paper')} as modified by the glossary. The Warp Scheduler and Dispatch Unit are shown in orange (amber here).`,
        value: 'sched',
        views: [
          { value: 'sched', label: 'scheduler + dispatch', keys: ['control'], why: `<b>Warp Scheduler and Dispatch Unit</b>, one pair per sub-partition: each cycle the scheduler picks a warp, and the dispatch unit sends its instruction to the execution units for 32 threads. Four pairs per SM: 128 threads per clock.` },
          { value: 'regs', label: '+ register file', keys: ['scheduler', 'dispatch', 'regfile'], why: `<b>Scheduler and register file</b> side by side. Every resident warp’s registers live in the ${T('register-file', 'register file')} at once (16,384 × 32-bit per sub-partition), which is why switching warps moves no data.` },
          { value: 'l1', label: '+ L1 / shared memory', keys: ['scheduler', 'dispatch', 'l1d'], why: `<b>Schedulers and the L1 data cache.</b> All four sub-partitions’ warps share the SM’s 256 KiB ${T('l1-data-cache', 'L1 data cache')}, much of it programmer-managed ${T('shared-memory', 'shared memory')} used by the warps of one thread block together.` },
        ],
        stats: (f) => {
          GG.ui.stat(f.readouts, { label: 'warp schedulers / SM', value: P().scheduler.perSM, tone: 'control' });
          GG.ui.stat(f.readouts, { label: 'threads / clock each', value: 32, tone: 'control' });
          GG.ui.stat(f.readouts, { label: 'resident warps / SM', value: 'up to 64' });
        },
      }));
      guard(s.smt, 'SMT', () => smtFigure(s.smt, ctx));
      guard(s.cy, 'Warp states', () => {
        const f = ctx.figure(s.cy, {
          title: 'Picking a warp whose operands are ready', hint: 'watch the cycles · hover a box', wide: true,
          caption: `The glossary’s example from ${T('warp-execution-state', 'Warp Execution State')}: one warp scheduler, four warp slots, four cycles. On each cycle it may select (pink) one eligible warp (blue outline), whose next instruction has its operands available; stalled warps (amber) are waiting. On cycle n + 2 no warp is eligible, so nothing issues: latency the scheduler could not hide.`,
        });
        GG.components.cycles(f, { animate: true });
      });
      guard(s.race, 'Race', () => raceFigure(s.race, ctx));
      guard(s.loc, 'Locality', () => localityFigure(s.loc, ctx));
      ctx.reading(s.read, [
        { href: 'https://modal-cdn.com/gpu-glossary/gtc22-whitepaper-hopper.pdf', label: 'NVIDIA H100 Tensor Core GPU Architecture white paper', note: 'source of the SM diagram' },
        { href: 'https://www.researchgate.net/publication/220938995_The_Effect_of_Context_Switches_on_Cache_Performance', label: 'Mogul & Borg, “The Effect of Context Switches on Cache Performance” (1991)', note: 'how switches hurt locality' },
        { href: 'https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#maximize-memory-throughput', label: 'CUDA C Programming Guide: Maximize Memory Throughput', note: 'programmer-managed vs hardware-managed caches' },
      ]);
    },
  });

  /* ═════════════════════════════ CUDA Core ═════════════════════════════ */

  /* Fig: one instruction, many lanes (SIMT); threads on top, the execution units they share below */
  function simtFigure(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'One instruction, 32 threads, 32 sets of registers', hint: 'change the group size or the operation', wide: true,
      caption: 'One sub-partition. The warp scheduler issues a single instruction; every thread in the group has it applied to its own registers and gets its own result. Top: the 32 threads of a warp, each a column showing its own values of the instruction’s source registers (the key on the left names them) and, once computed, its result register. Bottom: the execution units for that instruction in one H100 sub-partition: 32 FP32, 16 INT32 or 16 FP64. The lines show which unit serves which thread: with 16 units, threads 0–15 go through in a first pass (solid lines) and threads 16–31 in a second (dashed), through the same 16 units. Once the instruction is done, the lines of every pass stay drawn. Masked lanes belong to threads that are not part of the group this time: they send nothing, and the unit that would have served them idles.',
    });
    const host = el('div', { class: 'hwa-w' });
    f.stage.append(host);
    const OPS = {
      ffma: { asm: 'FFMA R3, R0, R1, R2', math: 'R3 = R0 × R1 + R2', units: 32, kind: 'FP32', fn: (a, b, c) => a * b + c, key: ['R0 × R1', '+ R2', '→ R3'], sep: '×' },
      iadd: { asm: 'IADD3 R3, R0, R1, R2', math: 'R3 = R0 + R1 + R2', units: 16, kind: 'INT32', fn: (a, b, c) => a + b + c, key: ['R0 + R1', '+ R2', '→ R3'], sep: '+' },
      dfma: { asm: 'DFMA R4, R0, R2, R6', math: 'R4:R5 = R0:R1 × R2:R3 + R6:R7 (64-bit)', units: 16, kind: 'FP64', fn: (a, b, c) => a * b + c, key: ['R0:R1 × R2:R3', '+ R6:R7', '→ R4:R5'], sep: '×' },
    };
    let op = 'ffma', active = 32, E = null, ph = 0.0, W = 0;
    const val = (i) => ({ a: i % 8, b: (i * 3) % 5 + 1, c: (i * 7) % 4 });
    function build(w) {
      W = w;
      host.innerHTML = '';
      const O = OPS[op];
      const narrow = w < 640;
      const keyW = narrow ? 0 : op === 'dfma' ? 104 : 70;
      const gw = w - keyW;
      const cols = gw >= 860 ? 32 : gw >= 540 ? 16 : 8;
      const rowsN = 32 / cols;
      const lw = gw / cols, lh = narrow ? 64 : 70;
      const top = narrow ? 112 : 96;
      const uTop = top + rowsN * (lh + 8) + 46;
      const ucols = Math.min(cols, O.units), urows = O.units / ucols, uw = gw / ucols, uh = 34;
      const passes = Math.ceil(32 / O.units);
      const legY = uTop + urows * (uh + 6) + 10;
      const H = legY - 6 + (passes > 1 ? 22 : 0);
      const svg = svgRoot(host, w, H, `A warp scheduler issuing one ${O.kind} instruction to 32 thread lanes, each with its own register values and result; below, the ${O.units} ${O.kind} units of the sub-partition that the lanes pass through, ${Math.ceil(32 / O.units)} pass(es), with lines from each running lane to its unit.`);
      rect(svg, w / 2 - 150, 0, 300, 30, { fill: 'var(--control-a)', stroke: 'var(--control)', rx: 6 });
      tx(svg, w / 2, 15, 'Warp Scheduler + Dispatch', { size: 11.5, anchor: 'middle', fill: 'var(--ink)' });
      const banner = S('g', {}, svg);
      rect(banner, -110, -11, 220, 22, { fill: 'var(--surface-3)', stroke: 'var(--control)', rx: 11 });
      const bT = tx(banner, 0, 0, '', { size: 11, anchor: 'middle', fill: 'var(--control)', weight: 600 });
      tx(svg, 0, top - 8, narrow ? 'threads of the warp, each with its own registers' : 'threads of the warp (each with its own registers)', { size: 9.5, fill: 'var(--ink-3)' });
      // register key: left of the first row of lanes (above the lanes on phones)
      if (narrow) {
        tx(svg, 0, top - 24, `each lane: ${O.key[0]} ${O.key[1]} ${O.key[2]}`, { size: 9.5, fill: 'var(--memory)' });
      } else {
        tx(svg, 0, top + 9, 'thread', { size: 9, fill: 'var(--ink-3)' });
        tx(svg, 0, top + 25, O.key[0], { size: 9.5, fill: 'var(--memory)' });
        tx(svg, 0, top + 38, O.key[1], { size: 9.5, fill: 'var(--memory)' });
        tx(svg, 0, top + lh - 12, O.key[2], { size: 9.5, fill: 'var(--core)', weight: 600 });
      }
      const wires = S('g', {}, svg);
      const lanes = [];
      for (let i = 0; i < 32; i++) {
        const cx = keyW + (i % cols) * lw, cy = top + Math.floor(i / cols) * (lh + 8);
        const g = S('g', {}, svg);
        const box = rect(g, cx + 1.5, cy, lw - 3, lh, { fill: 'var(--surface-2)', stroke: 'var(--memory)', rx: 4 });
        const v = val(i);
        const fs = lw < 34 ? 9.5 : 10;
        const idT = tx(g, cx + lw / 2, cy + 9, (lw >= 22 ? 'T' : '') + i, { size: 9, anchor: 'middle', fill: 'var(--ink-2)' });
        const regs = tx(g, cx + lw / 2, cy + 25, `${v.a}${O.sep}${v.b}`, { size: fs, anchor: 'middle', fill: 'var(--memory)' });
        const regs2 = tx(g, cx + lw / 2, cy + 38, '+' + v.c, { size: fs, anchor: 'middle', fill: 'var(--memory)' });
        const res = tx(g, cx + lw / 2, cy + lh - 12, '', { size: fs + 1, anchor: 'middle', fill: 'var(--core)', weight: 700 });
        lanes.push({ g, box, res, regs, regs2, idT, v, bx: cx + lw / 2, by: cy + lh });
      }
      const uLab = tx(svg, keyW, uTop - 12, `${O.units} ${O.kind} units in this sub-partition${O.units < 32 ? `: ${32 / O.units} passes for 32 threads` : ': one per thread'}`, { size: narrow ? 9.5 : 10.5, fill: 'var(--core)' });
      // a halo keeps the label readable where the wires cross it
      uLab.setAttribute('stroke', 'var(--bg-2)'); uLab.setAttribute('stroke-width', 3); uLab.setAttribute('paint-order', 'stroke');
      const units = [];
      for (let j = 0; j < O.units; j++) {
        const ux = keyW + (j % ucols) * uw, uy = uTop + Math.floor(j / ucols) * (uh + 6);
        const r = rect(svg, ux + 1.5, uy, uw - 3, uh, { fill: 'var(--core-a)', stroke: 'var(--core)', rx: 4 });
        const t = tx(svg, ux + uw / 2, uy + uh / 2, '', { size: uw < 34 ? 9 : 10, anchor: 'middle', fill: 'var(--ink)', weight: 600 });
        units.push({ r, t, tx: ux + uw / 2, ty: uy });
      }
      // one wire per lane, shown while that lane is on the unit it uses this pass (and for every pass once done);
      // the second pass's wires are dashed
      const wl = lanes.map((l, i) => S('line', { stroke: 'var(--core)', 'stroke-width': 1.1, 'stroke-opacity': 0.75, 'stroke-dasharray': i >= O.units ? '4 3' : null }, wires));
      if (passes > 1) {
        const lg = (x, dash, t) => { line(svg, [[x, legY + 6], [x + 22, legY + 6]], { stroke: 'var(--core)', sw: 1.4, dash }); tx(svg, x + 28, legY + 6, t, { size: 9.5, fill: 'var(--ink-2)' }); };
        lg(keyW, null, `pass 1: threads 0–${O.units - 1}`);
        lg(keyW + (narrow ? 150 : 180), '4 3', `pass 2: threads ${O.units}–31`);
      }
      // on phones the banner stops above the register key line (at top - 24)
      E = { banner, bT, lanes, units, wl, w, top, lw, lh, cols, uTop, uw, bEnd: narrow ? top - 46 : top - 27 };
      paint();
    }
    function paint() {
      if (!E) return;
      const O = OPS[op];
      const passes = Math.ceil(32 / O.units);
      const tDesc = 0.22, tPass = (0.62 - tDesc) / passes;
      const by = 47 + clamp(ph / tDesc, 0, 1) * (E.bEnd - 47);
      E.banner.setAttribute('transform', `translate(${E.w / 2},${by.toFixed(1)})`);
      E.bT.textContent = O.asm;
      const cur = ph < tDesc ? -1 : Math.floor((ph - tDesc) / tPass);
      const doneAll = cur >= passes;   // the rest of the cycle (and the reduced-motion frame): every pass drawn at once
      E.lanes.forEach((l, i) => {
        const on = i < active;
        const pass = Math.floor(i / O.units);
        const done = ph >= tDesc + (pass + 1) * tPass;
        const running = cur === pass;
        l.box.setAttribute('fill', !on ? 'rgba(255,255,255,0.02)' : running ? 'var(--core)' : 'var(--surface-2)');
        l.box.setAttribute('stroke', on ? (running ? 'var(--core)' : 'var(--memory)') : 'var(--line-2)');
        l.box.setAttribute('stroke-dasharray', on ? '' : '3 3');
        [l.regs, l.regs2].forEach((t) => t.setAttribute('fill', on ? (running ? '#0b0c12' : 'var(--memory)') : 'var(--ink-3)'));
        l.idT.setAttribute('fill', on && running ? '#0b0c12' : 'var(--ink-2)');
        l.res.textContent = !on ? (E.lw < 34 ? '–' : 'masked') : done ? String(O.fn(l.v.a, l.v.b, l.v.c)) : '';
        l.res.setAttribute('fill', on ? (running ? '#0b0c12' : 'var(--core)') : 'var(--ink-3)');
        l.res.setAttribute('font-size', on ? (E.lw < 34 ? 10 : 11) : 8.5);
        const u = E.units[i - pass * O.units];
        const wire = E.wl[i];
        if (on && (running || doneAll) && u) {
          // where a lane sits right above its unit (fewer than 32 columns), the passes' wires would coincide: split them
          const dx = passes > 1 && E.cols < 32 ? (pass ? 5 : -5) : 0;
          wire.style.display = ''; wire.setAttribute('x1', l.bx + dx); wire.setAttribute('y1', l.by + 1); wire.setAttribute('x2', u.tx + dx); wire.setAttribute('y2', u.ty - 1);
        }
        else wire.style.display = 'none';
      });
      E.units.forEach((u, j) => {
        if (doneAll) {
          // every lane this unit served, over all passes
          const served = []; for (let i = j; i < active; i += O.units) served.push(i);
          u.r.setAttribute('fill', 'var(--core-a)');
          u.r.setAttribute('stroke-dasharray', served.length ? '' : '3 3');
          u.t.textContent = served.length ? served.map((i) => 'T' + i).join('·') : 'idle';
          if (served.length > 1 && E.uw < 72) {
            // too narrow for "T10·T26" on one line: one thread per line
            u.t.textContent = '';
            served.forEach((i, n) => S('tspan', { x: u.tx, dy: n ? '1.15em' : `${(-0.575 * (served.length - 1)).toFixed(3)}em` }, u.t).textContent = 'T' + i);
          }
          u.t.setAttribute('fill', served.length ? 'var(--ink)' : 'var(--ink-3)');
          return;
        }
        const lane = cur >= 0 && cur < passes ? cur * O.units + j : -1;
        const busy = lane >= 0 && lane < active;
        u.r.setAttribute('fill', busy ? 'var(--core)' : 'var(--core-a)');
        u.r.setAttribute('stroke-dasharray', lane >= 0 && !busy ? '3 3' : '');
        u.t.textContent = lane < 0 ? '' : busy ? 'T' + lane : 'idle';
        u.t.setAttribute('fill', busy ? '#0b0c12' : 'var(--ink-3)');
      });
    }
    function upd() {
      const O = OPS[op];
      const passes = Math.ceil(32 / O.units);
      oP.set(`${passes} pass${passes > 1 ? 'es' : ''}`, passes > 1 ? 'control' : 'core');
      oU.set(`${active} / 32 · ${fmt.pct(active / 32, 0)}`, active === 32 ? 'core' : 'danger');
      oN.set(`${O.units} ${O.kind}`);
      const passTxt = passes === 1 ? 'one pass, one unit per thread' : `${passes} passes (32 ÷ ${O.units}): threads 0–15 first, then threads 16–31`;
      const maskTxt = active === 32 ? '' : ` In this model the instruction still takes ${passes === 1 ? 'its full pass' : passes === 2 ? 'both passes' : `all ${passes} passes`}, even though only ${active} lane${active > 1 ? 's are' : ' is'} useful: the masked lanes send nothing and their units idle.`;
      const oneTxt = active === 1 ? ` A group of one thread is the per-thread scheduling the glossary means: since Volta, every thread has its own program counter, so the scheduler can issue an instruction for a single thread of a warp. It still uses the whole issue slot, at the cost of 31 idle lanes.` : '';
      f.setWhy(`<code>${O.asm}</code> means <b>${O.math}</b>. One issue by the warp scheduler, and ${active === 32 ? 'all 32 threads have it applied, each to its own registers' : `only <b>${active}</b> of the 32 lanes do useful work: the group is smaller than a warp, and the other lanes’ share of the issue slot is wasted (${fmt.pct(1 - active / 32, 0)})`}. ${O.kind} has <b>${O.units}</b> units per sub-partition, so a 32-thread instruction needs ${passTxt}.${maskTxt}${oneTxt}`);
      paint();
    }
    GG.ui.seg(f.controls, { label: 'Instruction', value: 'ffma', onChange: (v) => { op = v; build(W); upd(); }, options: [{ value: 'ffma', label: 'FFMA · FP32' }, { value: 'iadd', label: 'IADD3 · INT32' }, { value: 'dfma', label: 'DFMA · FP64' }] });
    GG.ui.seg(f.controls, { label: 'Threads in the group', value: 32, onChange: (v) => { active = v; upd(); }, options: [32, 16, 8, 1].map((n) => ({ value: n, label: String(n) })) });
    GG.ui.stat(f.readouts, { label: 'instructions issued', value: '1', tone: 'control' });
    const oN = GG.ui.stat(f.readouts, { label: 'units for it', value: '—', tone: 'core' });
    const oP = GG.ui.stat(f.readouts, { label: 'passes over the units', value: '—' });
    const oU = GG.ui.stat(f.readouts, { label: 'useful lanes', value: '—' });
    const anim = GG.anim(host, (t) => { ph = (t / 3.6) % 1; paint(); });
    if (GG.reducedMotion) ph = 0.99;
    GG.ui.playButton(f.controls, anim);
    onWidth(host, build);
    upd();
  }

  /* Fig: what a "CUDA Core" is made of, across SM architectures (beyond) */
  function archFigure(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'What “CUDA Cores per SM” counts, by architecture', hint: 'pick an SM architecture', wide: true,
      caption: 'Beyond the glossary, from NVIDIA’s architecture white papers. One square per unit in one SM: FP32 solid, INT32 dotted, FP64 pale. The copper outline marks the squares NVIDIA counts as “CUDA Cores”: the FP32 units in every case. The mix of 32-bit integer and 64-bit floating point units around them changes, and on GA102 half of the FP32 units double as INT32 units (hatched) and do one or the other on a given cycle.',
    });
    const host = el('div', { class: 'hwa-w' });
    f.stage.append(host);
    const A = {
      v100: { name: 'Volta · V100', sms: 80, fp32: 64, shared: 0, int32: 64, fp64: 32 },
      a100: { name: 'Ampere · A100', sms: 108, fp32: 64, shared: 0, int32: 64, fp64: 32 },
      ga102: { name: 'Ampere · GA102 (RTX 3090)', sms: 82, fp32: 64, shared: 64, int32: 0, fp64: 2 },
      h100: { name: 'Hopper · H100 SXM', sms: 132, fp32: 128, shared: 0, int32: 64, fp64: 64 },
    };
    let cur = 'h100', W = 0;
    const o1 = GG.ui.stat(f.readouts, { label: '“CUDA Cores” / SM', value: '—', tone: 'core' });
    const o2 = GG.ui.stat(f.readouts, { label: 'INT32-capable', value: '—' });
    const o3 = GG.ui.stat(f.readouts, { label: 'FP64', value: '—' });
    const o4 = GG.ui.stat(f.readouts, { label: '“CUDA Cores” / GPU', value: '—', tone: 'core' });
    function draw() {
      host.innerHTML = '';
      const a = A[cur];
      const narrow = W < 640;
      const per = narrow ? 32 : 64;
      const lab = narrow ? 0 : 96;
      const cs = Math.max(4, Math.floor((W - lab) / per) - 2), g = 2;
      const rowsFor = (n) => Math.max(1, Math.ceil(n / per));
      const groups = [
        { k: 'FP32', n: a.fp32, fill: 'var(--core)', counted: true },
        { k: 'FP32 / INT32', n: a.shared, fill: 'hatch', counted: true },
        { k: 'INT32', n: a.int32, fill: 'dots' },
        { k: 'FP64', n: a.fp64, fill: 'rgba(69,212,155,0.32)' },
      ].filter((q) => q.n > 0);
      const gh = (q) => (narrow ? 16 + rowsFor(q.n) * (cs + g) : Math.max(rowsFor(q.n) * (cs + g), 30)) + 12;
      const head = 22;
      let H = head; groups.forEach((q) => { H += gh(q); });
      const cc = a.fp32 + a.shared;
      const svg = svgRoot(host, W, H + 4, `Units in one ${a.name} SM: ${groups.map((q) => q.n + ' ' + q.k).join(', ')}. NVIDIA counts the ${cc} FP32-capable units as CUDA Cores.`);
      const D = defs(svg);
      let y = head;
      let cBot = head;
      groups.forEach((q) => {
        if (narrow) { tx(svg, 0, y + 6, `${q.k} · ${q.n}`, { size: 10.5, fill: 'var(--ink)' }); y += 16; }
        else { tx(svg, 0, y + cs / 2 + 1, q.k, { size: 11, fill: 'var(--ink)' }); tx(svg, 0, y + cs / 2 + 15, '× ' + q.n, { size: 10, fill: 'var(--ink-3)' }); }
        for (let i = 0; i < q.n; i++) {
          const x = lab + (i % per) * (cs + g), yy = y + Math.floor(i / per) * (cs + g);
          rect(svg, x, yy, cs, cs, { fill: q.fill === 'hatch' ? D.hatch : q.fill === 'dots' ? D.dots : q.fill, stroke: 'var(--core)', rx: 1.5, sw: 0.8 });
        }
        if (q.counted) cBot = y + rowsFor(q.n) * (cs + g);
        y += gh(q) - (narrow ? 16 : 0);
      });
      // the units NVIDIA counts as "CUDA Cores"
      rect(svg, lab - 4, head - 4, Math.min(per, Math.max(...groups.filter((q) => q.counted).map((q) => q.n))) * (cs + g) + 6, cBot - head + 6, { stroke: 'var(--accent)', sw: 1.6, rx: 4, dash: '5 3' });
      tx(svg, narrow ? 0 : lab - 2, 9, `counted as “CUDA Cores”: ${cc}`, { size: 10.5, fill: 'var(--accent)', weight: 600 });
      o1.set(fmt.int(cc)); o2.set(fmt.int(a.int32 + a.shared)); o3.set(fmt.int(a.fp64));
      o4.set(`${fmt.int(cc)} × ${a.sms} = ${fmt.int(cc * a.sms)}`);
      const W2 = {
        v100: 'Volta (V100): 64 FP32, 64 INT32 and 32 FP64 units per SM. 64 “CUDA Cores” per SM, 5,120 per GPU, and the FP64 rate is half the FP32 rate.',
        a100: 'Ampere’s A100 keeps Volta’s mix: 64 FP32, 64 INT32 and 32 FP64 units per SM, so again 64 “CUDA Cores” per SM.',
        ga102: 'The gaming GA102 counts 128 “CUDA Cores” per SM, but only 64 of them are pure FP32; the other 64 do FP32 <b>or</b> INT32. With just 2 FP64 units per SM, its double-precision rate is a tiny fraction of its FP32 rate. Same name, very different hardware.',
        h100: 'Hopper (H100): 128 FP32, 64 INT32 and 64 FP64 units per SM. NVIDIA’s “128 FP32 CUDA Cores” counts the FP32 units accurately, and is double the INT32 and FP64 counts.',
      };
      f.setWhy(W2[cur]);
    }
    GG.ui.seg(f.controls, { label: 'SM architecture', value: 'h100', onChange: (v) => { cur = v; draw(); }, options: Object.keys(A).map((k) => ({ value: k, label: A[k].name.split(' · ')[1] })) });
    onWidth(host, (w) => { W = w; draw(); });
  }

  GG.entry('cuda-core', {
    render(body, ctx) {
      body.classList.add('hwa-body');
      const CLK = 1.98e9, SMS = 132;
      const s = ctx.html(body, `
<p>The CUDA Cores are GPU ${T('core', 'cores')} that execute <strong>scalar</strong> arithmetic instructions: one operation on one number (or one pair, or one triple) per thread, like an add, a multiply or a fused multiply-add.</p>
<div data-slot="sm" class="wide"></div>
<p>They are to be contrasted with the ${T('tensor-core', 'Tensor Cores')}, which execute matrix operations. In the floorplan, note the larger size and lower number of Tensor Cores: four big blocks beside 256 small scalar units (64 INT32, 128 FP32 and 64 FP64). NVIDIA’s marketing count of “CUDA Cores” is only the 128 FP32 units per SM (16,896 per H100 SXM); counting every scalar unit gives 256 per SM. The rest of this entry is about why those two numbers differ.</p>
<h3>Not independently scheduled</h3>
<p>Unlike CPU cores, instructions issued to CUDA Cores are not generally independently scheduled. Instead, <strong>groups of cores are issued the same instruction simultaneously</strong> by the ${T('warp-scheduler', 'Warp Scheduler')}, but apply that instruction to <strong>different</strong> ${T('registers', 'registers')}. NVIDIA calls this SIMT: single instruction, multiple threads. Commonly these groups are of size 32, the size of a ${T('warp', 'warp')}, but for contemporary GPUs groups can contain as little as one thread, at a cost to performance.</p>
${GG.noteHTML('beyond', `<p><b>What changed in “contemporary” GPUs.</b> The glossary does not say, but the change NVIDIA documents is <b>independent thread scheduling</b>, introduced with Volta (compute capability 7.0). Before Volta, the 32 threads of a warp shared a single program counter, together with an <em>active mask</em> saying which threads take part: when threads took different sides of a branch, the paths ran one after the other with the other threads masked off, and a group smaller than a warp only ever existed as such a masked remainder. Since Volta, the GPU keeps execution state per thread, including a program counter and call stack, and can yield execution at a per-thread granularity; a schedule optimizer groups the active threads of a warp that are at the same instruction and issues for them together, down to a single thread, and they can reconverge later. Either way the instruction occupies a whole warp’s issue slot, which is the cost to performance: the lanes of the threads not in the group do nothing. (${X('https://docs.nvidia.com/cuda/archive/12.8.0/cuda-c-programming-guide/index.html#independent-thread-scheduling', 'CUDA C++ Programming Guide: Independent Thread Scheduling')}.)</p>`)}
<div data-slot="simt" class="wide"></div>
<p>When fewer than 32 threads of a warp take part (for example when some of them took the other side of an <code>if</code>, see ${T('warp-divergence', 'warp divergence')}), the instruction still costs a full issue, and the idle lanes’ share of it is lost.</p>
<h3>A slippery term</h3>
<p>The term “CUDA Core” is slightly slippery: in different ${T('streaming-multiprocessor-architecture', 'Streaming Multiprocessor architectures')}, CUDA Cores can consist of different units, a different mixture of 32-bit integer and 32-bit and 64-bit floating point units. They are perhaps best thought of in contrast to early GPUs, which contained a variety of much more specialized compute units mapped onto shader pipelines (see ${T('cuda-device-architecture', 'CUDA Device Architecture')}): a CUDA Core is a general-purpose arithmetic unit of a unified design, whatever its exact mix.</p>
<p>So, for example, the ${X('https://resources.nvidia.com/en-us-hopper-architecture/nvidia-h100-tensor-c', 'H100 whitepaper')} indicates that an H100 GPU’s ${T('streaming-multiprocessor', 'Streaming Multiprocessors (SMs)')} each have 128 “FP32 CUDA Cores”. This accurately counts the number of 32-bit floating point units, but is <strong>double</strong> the number of 32-bit integer or 64-bit floating point units, as the floorplan in Fig. 1 shows (switch it to INT32 or FP64).</p>
<div data-slot="arch" class="wide"></div>
<h3>Count the units for the operation</h3>
<p>For estimating performance, it’s best to look directly at the number of hardware units for a given operation. Each unit completes one operation per clock (a fused multiply-add counts as two floating point operations), so a rough peak is units per SM × SMs × operations per unit × clock rate:</p>
<div data-slot="tbl"></div>
<div data-slot="chk"></div>
<div data-slot="read"></div>`);
      const p = P();
      const U = { fp32: p.fp32.perSM, int32: p.int32.perSM, fp64: p.fp64.perSM };
      guard(s.sm, 'SM floorplan', () => smFigure(s.sm, ctx, {
        title: 'CUDA Cores in an H100 SM', viewLabel: 'Count',
        caption: `The internal architecture of an H100 SM, redrawn from NVIDIA’s ${X('https://modal-cdn.com/gpu-glossary/gtc22-whitepaper-hopper.pdf', 'H100 white paper')} as modified by the glossary. The CUDA Cores and Tensor Cores are depicted in green. Note the larger size and lower number of Tensor Cores.`,
        value: 'fp32',
        views: [
          { value: 'fp32', label: `FP32 · ${U.fp32}`, keys: ['fp32'], dots: true, why: `<b>${U.fp32} FP32 units</b> per SM (32 per sub-partition, in two columns of 16): the “128 FP32 CUDA Cores” of NVIDIA’s whitepaper. ${U.fp32} × ${SMS} SMs = <b>${fmt.int(U.fp32 * SMS)}</b> on an H100 SXM.` },
          { value: 'int32', label: `INT32 · ${U.int32}`, keys: ['int32'], dots: true, why: `<b>${U.int32} INT32 units</b> per SM (16 per sub-partition): half the FP32 count. Calling the SM’s CUDA Cores “128” would double-count its integer hardware.` },
          { value: 'fp64', label: `FP64 · ${U.fp64}`, keys: ['fp64'], dots: true, why: `<b>${U.fp64} FP64 units</b> per SM (16 per sub-partition): also half the FP32 count, so double-precision peak is half of single-precision peak.` },
          { value: 'all', label: `all scalar · ${U.fp32 + U.int32 + U.fp64}`, keys: ['cuda-cores'], why: `<b>All scalar units</b>: ${U.int32} INT32 + ${U.fp32} FP32 + ${U.fp64} FP64 = <b>${U.int32 + U.fp32 + U.fp64}</b> per SM, the mixture of 32-bit integer, 32-bit and 64-bit floating point units that the glossary says CUDA Cores consist of. NVIDIA counts only the ${U.fp32} FP32 units as “CUDA Cores”, which is why an H100 SXM has ${fmt.int(U.fp32 * SMS)} of them and not ${fmt.int((U.fp32 + U.int32 + U.fp64) * SMS)}.` },
          { value: 'tc', label: '+ Tensor Cores', keys: ['cores'], why: `<b>CUDA Cores and Tensor Cores</b> together: ${U.int32 + U.fp32 + U.fp64} small scalar units and ${p.tensor.perSM} large matrix units per SM.` },
        ],
      }));
      guard(s.simt, 'SIMT', () => simtFigure(s.simt, ctx));
      guard(s.arch, 'Architectures', () => archFigure(s.arch, ctx));
      const row = (nm, u, ops, unit, bad) => `<tr><td${bad ? ' class="c-danger"' : ''}>${nm}</td><td class="num${bad ? ' c-danger' : ''}">${u}</td><td class="num">${u} × ${SMS} × ${ops} × 1.98 GHz</td><td class="num${bad ? ' c-danger' : ''}"><b>${GG.fmt.fixed(u * SMS * ops * CLK / 1e12, 1)}</b> ${unit}</td></tr>`;
      s.tbl.outerHTML = GG.tableHTML(`<thead><tr><th>Operation</th><th class="num">Units / SM</th><th class="num">Units × SMs × ops × clock</th><th class="num">Peak</th></tr></thead><tbody>
${row('FP32 fused multiply-add', U.fp32, 2, 'TFLOPS')}
${row('FP64 fused multiply-add', U.fp64, 2, 'TFLOPS')}
${row('INT32 add', U.int32, 1, 'T ops/s')}
${row('FP64, counting “128 CUDA Cores”', 128, 2, 'TFLOPS: 2× too high', true)}</tbody>`);
      ctx.note(s.chk, { type: 'check', html: `<p>The FP32 row reproduces the figure the glossary gives in ${T('peak-rate', 'Peak Rate')}: 128 × 132 = 16,896 FMAs per clock = 33,792 FLOPs per clock, × 1.98 GHz = <b>66.9 TFLOPS</b>. The FP64 row, ${GG.fmt.fixed(U.fp64 * SMS * 2 * CLK / 1e12, 1)} TFLOPS, agrees with the 34 TFLOPS NVIDIA lists for FP64 on the H100 SXM. The INT32 row is the same arithmetic for integer adds; NVIDIA does not quote it. These are peaks: real kernels reach them only when the units are kept busy.</p>` });
      ctx.reading(s.read, [
        { href: 'https://resources.nvidia.com/en-us-hopper-architecture/nvidia-h100-tensor-c', label: 'NVIDIA H100 Tensor Core GPU Architecture white paper', note: 'the “128 FP32 CUDA Cores” per SM' },
        { href: 'https://modal-cdn.com/gpu-glossary/gtc22-whitepaper-hopper.pdf', label: 'The same white paper, as hosted by Modal', note: 'source of the SM diagram' },
      ]);
    },
  });

})();
