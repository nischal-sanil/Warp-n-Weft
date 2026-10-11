/* components/model-map.js — GG.components.modelMap
   ─────────────────────────────────────────────────────────────────────────────
   The CUDA programming model mapped onto the hardware (after the glossary's
   cuda-programming-model figure). Left column = abstractions (software), right
   column = the hardware that implements them, one row per level:

       CUDA thread  (+ its registers)          →  CUDA Core
       CUDA thread block (+ Shared Memory)     →  Streaming Multiprocessor (Register File, L1 Data Cache, cores)
       CUDA kernel grid  (+ Global Memory)     →  GPU (many SMs + GPU RAM)

   Threads are drawn as wavy strands (the weaving motif). Two families of
   connectors: amber = "runs on / is scheduled onto / runs across" (execution),
   blue = "lives in" (memory: registers → register file, shared → L1, global → RAM).

   USAGE
     const f = ctx.figure(slot, { title: 'Threads, blocks, grids and the hardware', wide: true });
     const map = GG.components.modelMap(f.stage, { highlight: 'shared' });
     map.on('select', (e) => f.setWhy(e.key ? GG.components.modelMap.LEVELS_BY[e.key].desc : '…'));

   GG.components.modelMap(parent, opts) → api
     parent            element to append to (usually f.stage)
     opts.highlight    key | key[]   initial highlight (default: none). Keys:
                         software: 'thread' 'registers' 'block' 'shared' 'grid' 'global'
                         hardware: 'core' 'regfile' 'sm' 'l1' 'gpu' 'ram'
                       Lighting any key also lights its pair (thread↔core, registers↔regfile,
                       block↔sm, shared↔l1, grid↔gpu, global↔ram) and the connector between
                       them; everything else dims (drawings to 26 %, their text to 42 %, so a
                       dimmed name stays readable) and the connectors of unlit levels are
                       hidden. Unknown keys are ignored with a console.warn.
                       Extra key 'spill' (not a level): lights registers ↔ register file and
                       GPU RAM, and draws a dashed connector from the register file down to
                       GPU RAM, labelled "spills (local memory)" (wide geometry; the narrow one
                       has no connector labels). It combines with other keys, e.g.
                       ['spill', 'global']. The caption explains the spill while it is lit.
     opts.interactive  default true. Hover / tap / keyboard focus a level to preview it and
                       its pair; click / tap / Enter to select it (click again or Esc to clear).
                       Keyboard: one Tab stop; ↑ ↓ move within a column, → / ← jump across to
                       the paired level, Home / End, Enter or Space selects, Esc clears.
     opts.caption      default = interactive. Show the caption strip under the diagram: the
                       mapping sentence for the previewed/selected level (both names are
                       data-term links) plus a one-line description. With nothing lit it shows
                       a colour legend plus a short hint (interactive) or just the legend. The
                       strip's height is measured: as tall as its longest message at the
                       current width (so it does not jump on hover), with shorter messages
                       centred. Pass false to drive your own f.setWhy() from the
                       'hover'/'select' events instead.
     opts.names        'cuda' (default: "CUDA thread", "CUDA thread block", "CUDA kernel grid")
                       | 'ptx' ("Thread", "Cooperative thread array (CTA)", "Grid of CTAs";
                       adds the PTX state-space names .reg / .shared / .global; the block's
                       link becomes cooperative-thread-array). Hardware names do not change.
     opts.animate      default true. Strands gently wave while the map is on screen (GG.anim).
                       The strands of one block share a phase; separate blocks drift apart
                       (blocks run independently). Never autostarts under
                       prefers-reduced-motion; use api.anim.start() from a Play button.
     opts.layout       'wide' (default): side by side, switching automatically to a narrow
                       side-by-side geometry (fewer strands/cores, wrapped labels, larger
                       type) when the container is < 680 px wide, so every pair stays on
                       screen together on phones and every label is >= 10 px at 390 px.
                       'narrow' (alias 'stacked') forces the narrow geometry at every width.
     opts.compact      default false. Drops the two column headers and caps the diagram at
                       640 px wide (360 px narrow) for small inline figures; the wide
                       geometry then uses larger type so labels keep their size.
     opts.ariaLabel    override the diagram's accessible description.

   api
     api.el                 root <div class="mm">
     api.svg                current <svg> (rebuilt when the layout switches)
     api.layout             'wide' | 'narrow' (current geometry)
     api.highlight(keys)    replace the highlight (key | key[] | null). Updates the caption.
     api.clear()            remove every highlight (and any user selection)
     api.keys()             → the currently highlighted keys (array copy)
     api.on(event, fn)      subscribe; returns api. Events:
                              'select' fn({key, pair, keys, level}) on click/tap/Enter/Esc;
                                        key is null when the selection was cleared
                              'hover'  fn({key, pair, level}) on pointer/keyboard preview;
                                        fn(null) when the preview ends
     api.anim               the GG.anim controller for the strands (null if animate:false)
     api.destroy()          stop animation, disconnect observers, remove the DOM

   Static metadata
     GG.components.modelMap.LEVELS     array of {key, side:'software'|'hardware',
                                        kind:'exec'|'memory', name, ptxName?, pair, term,
                                        ptxTerm?, desc, ptxDesc?}  (glossary order of rows)
     GG.components.modelMap.LEVELS_BY  the same, keyed by key
     GG.components.modelMap.PAIRS      {thread:'core', registers:'regfile', block:'sm',
                                        shared:'l1', grid:'gpu', global:'ram'}
   CSS prefix: mm-  (all styles injected once via GG.css)
   ───────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  const GG = window.GG;
  if (!GG) return;
  GG.components = GG.components || {};

  /* ───────────── metadata ───────────── */
  const LEVELS = [
    { key: 'thread', side: 'software', kind: 'exec', pair: 'core', name: 'CUDA thread', ptxName: 'Thread', term: 'thread',
      desc: 'The atom of the thread hierarchy: one stream of instructions with its own registers, but little else.' },
    { key: 'registers', side: 'software', kind: 'memory', pair: 'regfile', name: 'Registers', term: 'registers',
      desc: 'A thread’s private storage. Values that spill out go to global memory in GPU RAM, at a substantial performance penalty.' },
    { key: 'block', side: 'software', kind: 'exec', pair: 'sm', name: 'CUDA thread block', ptxName: 'Cooperative thread array (CTA)',
      term: 'thread-block', ptxTerm: 'cooperative-thread-array',
      desc: 'Up to 1,024 threads, typically a multiple of the 32-thread warp, that can coordinate via shared memory and barriers.',
      ptxDesc: 'The PTX/SASS name for a thread block: one or more warps that can coordinate via shared memory and barriers.' },
    { key: 'shared', side: 'software', kind: 'memory', pair: 'l1', name: 'Shared memory', term: 'shared-memory',
      desc: 'Memory shared by the threads of one block: much smaller, but much faster, than global memory.' },
    { key: 'grid', side: 'software', kind: 'exec', pair: 'gpu', name: 'CUDA kernel grid', ptxName: 'Grid of CTAs', term: 'thread-block-grid',
      desc: 'Every thread of one kernel launch: thread blocks in one, two or three dimensions, run in no guaranteed order.' },
    { key: 'global', side: 'software', kind: 'memory', pair: 'ram', name: 'Global memory', term: 'global-memory',
      desc: 'Global in scope and lifetime: every thread in the grid can reach it for as long as the program runs. Blocks coordinate through it with atomics.' },
    { key: 'core', side: 'hardware', kind: 'exec', pair: 'thread', name: 'CUDA Core', term: 'cuda-core',
      desc: 'Executes scalar arithmetic. The warp scheduler issues the same instruction to a group of cores at once, commonly 32 of them (a warp).' },
    { key: 'regfile', side: 'hardware', kind: 'memory', pair: 'registers', name: 'Register file', term: 'register-file',
      desc: 'The SM’s primary store of bits between operations, about an order of magnitude faster than the L1 data cache. On an H100: 65,536 32-bit registers (256 KiB) per SM.' },
    { key: 'sm', side: 'hardware', kind: 'exec', pair: 'block', name: 'Streaming Multiprocessor', term: 'streaming-multiprocessor',
      desc: 'Roughly the GPU’s counterpart of a CPU core: cores, warp schedulers, register file and L1 data cache. An H100 SXM has 132.' },
    { key: 'l1', side: 'hardware', kind: 'memory', pair: 'shared', name: 'L1 data cache', term: 'l1-data-cache',
      desc: 'The SM’s private SRAM (256 KiB on an H100), only about an order of magnitude slower than the cores. Unlike a CPU’s L1, it is mostly programmer-managed.' },
    { key: 'gpu', side: 'hardware', kind: 'exec', pair: 'grid', name: 'GPU', term: 'device-hardware',
      desc: 'The whole device: all of its Streaming Multiprocessors, sharing one GPU RAM.' },
    { key: 'ram', side: 'hardware', kind: 'memory', pair: 'global', name: 'GPU RAM', term: 'gpu-ram',
      desc: 'Large DRAM (80 GiB of HBM3 on an H100) that every SM can address. It also holds register values spilled from the register file.' },
  ];
  const BY = {};
  LEVELS.forEach((l) => { BY[l.key] = l; });
  const PAIRS = { thread: 'core', registers: 'regfile', block: 'sm', shared: 'l1', grid: 'gpu', global: 'ram' };
  const SW = ['thread', 'registers', 'block', 'shared', 'grid', 'global'];
  const HW = ['core', 'regfile', 'sm', 'l1', 'gpu', 'ram'];

  /* mapping sentences; n(key, text?) returns a link to that level */
  const SENT = {
    thread: (n, p) => `A ${n('thread', p ? 'thread' : 'CUDA thread')} runs on a ${n('core')}.`,
    registers: (n) => `${n('registers', 'Registers')} live in a slice of the SM’s ${n('regfile', 'register file')}.`,
    block: (n, p) => `A ${n('block', p ? 'cooperative thread array (CTA)' : 'CUDA thread block')} is scheduled onto a single ${n('sm', 'Streaming Multiprocessor (SM)')}.`,
    shared: (n) => `${n('shared', 'Shared memory')} lives in the SM’s ${n('l1', 'L1 data cache')}.`,
    grid: (n, p) => `A ${n('grid', p ? 'grid of CTAs' : 'CUDA kernel grid')} executes across many SMs, at the scale of the whole ${n('gpu', 'GPU')}.`,
    global: (n) => `${n('global', 'Global memory')} lives in ${n('ram', 'GPU RAM')}.`,
  };

  const PTX_SPACE = { registers: '.reg', shared: '.shared', global: '.global' };

  /* the 'spill' highlight key: not a level, a path from the register file to GPU RAM */
  const SPILL = {
    lights: ['registers', 'regfile', 'ram'],
    conns: ['registers', 'spill'],
    sentence: (n) => `${n('registers', 'Register')} values that do not fit in the ${n('regfile', 'register file')} spill to local memory, in ${n('ram', 'GPU RAM')}.`,
    desc: 'The compiler stores them there and loads them back when they are needed, at a substantial performance penalty.',
  };
  const isKey = (k) => !!BY[k] || k === 'spill';

  /* ───────────── styles ───────────── */
  GG.css(`
.mm { position: relative; }
.mm-svg { display: block; width: 100%; height: auto; max-width: 900px; margin: 0 auto; overflow: visible; -webkit-tap-highlight-color: transparent; }
.mm[data-layout="narrow"] .mm-svg { max-width: 470px; }
.mm.mm-compact .mm-svg { max-width: 640px; }
.mm.mm-compact[data-layout="narrow"] .mm-svg { max-width: 360px; }
.mm-svg text, .mm-svg .mm-cns { pointer-events: none; }
.mm-svg .mm-head { font-family: var(--font-mono); font-size: 9.5px; letter-spacing: 0.14em; fill: var(--ink-3); }
.mm-svg .mm-lab { font-family: var(--font-mono); font-weight: 500; fill: var(--ink); }
.mm-svg .mm-barlab { font-family: var(--font-mono); fill: #d3e3ff; }
.mm-svg .mm-barlab .mm-sp { fill: var(--memory); }
.mm-svg .mm-small { font-family: var(--font-mono); fill: #bcd3ff; }
.mm-svg .mm-verb { font-family: var(--font-mono); letter-spacing: 0.02em; opacity: 0; transition: opacity .2s; }
.mm-svg .mm-hit { fill: transparent; stroke: none; }
.mm-svg .mm-ring { fill: none; stroke: var(--accent); stroke-width: 1.5; opacity: 0; }
.mm-svg .mm-lv { outline: none; }
.mm-int .mm-svg .mm-lv { cursor: pointer; }
.mm-svg .mm-lv:focus-visible .mm-ring { opacity: 1; }
.mm-svg .mm-cn { transition: opacity .22s ease; }
.mm-svg .mm-lv > * { transition: opacity .22s ease, fill .2s, stroke .2s, color .2s; }

/* containers */
.mm-svg .mm-box { fill: rgba(255,255,255,0.018); stroke: var(--line-2); stroke-width: 1.2; stroke-dasharray: 5 4; }
.mm-svg .mm-mini { fill: var(--surface-2); stroke: var(--line-2); stroke-width: 1; }
.mm-svg .mm-dots { fill: var(--ink-3); }
.mm-svg .mm-lv.mm-on .mm-box { fill: rgba(236,238,246,0.05); stroke: var(--ink-2); stroke-dasharray: none; stroke-width: 1.4; }
.mm-svg .mm-lv.mm-on .mm-mini { fill: var(--surface-3); stroke: var(--ink-3); }

/* strands (threads) */
.mm-svg .mm-strands { color: var(--ink-2); stroke-width: 1.35; }
.mm-svg .mm-lv.mm-on .mm-strands { color: #ffffff; stroke-width: 1.6; }

/* cores */
.mm-svg .mm-core { fill: rgba(69,212,155,0.55); stroke: var(--core); stroke-width: 1; }
.mm-svg .mm-lv.mm-on .mm-core { fill: var(--core); filter: drop-shadow(0 0 4px rgba(69,212,155,0.55)); }
.mm-svg .mm-core-mini { fill: rgba(69,212,155,0.5); }
.mm-svg .mm-lv.mm-on .mm-core-mini { fill: var(--core); }

/* memory */
.mm-svg .mm-mem { fill: rgba(111,166,255,0.13); stroke: rgba(111,166,255,0.75); stroke-width: 1; }
.mm-svg .mm-cell { stroke: rgba(111,166,255,0.35); stroke-width: 1; }
.mm-svg .mm-slice { fill: rgba(111,166,255,0.0); }
.mm-svg .mm-strip { fill: rgba(111,166,255,0.4); }
.mm-svg .mm-lv.mm-on .mm-mem { fill: rgba(111,166,255,0.3); stroke: var(--memory); stroke-width: 1.5; }
.mm-svg .mm-lv.mm-on .mm-barlab, .mm-svg .mm-lv.mm-on .mm-small { fill: #ffffff; }
.mm-svg .mm-lv.mm-on .mm-slice { fill: rgba(111,166,255,0.7); }
.mm-svg .mm-tick { stroke: var(--ink-3); stroke-width: 1; }
.mm-svg .mm-lv.mm-on .mm-tick { stroke: var(--memory); }

/* connectors */
.mm-svg .mm-cn path.mm-line { fill: none; stroke-width: 1.2; stroke-dasharray: 3 4; opacity: 0.6; transition: opacity .2s, stroke-width .2s; }
.mm-svg .mm-cn .mm-tip, .mm-svg .mm-cn .mm-dot { opacity: 0.6; transition: opacity .2s; }
.mm-svg .mm-cn.x path.mm-line { stroke: var(--control); }
.mm-svg .mm-cn.m path.mm-line { stroke: var(--memory); }
.mm-svg .mm-cn.x .mm-tip, .mm-svg .mm-cn.x .mm-dot { fill: var(--control); }
.mm-svg .mm-cn.m .mm-tip, .mm-svg .mm-cn.m .mm-dot { fill: var(--memory); }
.mm-svg .mm-cn.x .mm-verb { fill: var(--control); }
.mm-svg .mm-cn.m .mm-verb { fill: var(--memory); }
.mm-svg .mm-cn.mm-on path.mm-line { opacity: 1; stroke-width: 2; stroke-dasharray: none; }
.mm-svg .mm-cn.mm-on .mm-tip, .mm-svg .mm-cn.mm-on .mm-dot { opacity: 1; }
.mm-svg .mm-cn.mm-on .mm-verb { opacity: 1; }
.mm-svg .mm-cn .mm-halo { fill: none; stroke: var(--bg); stroke-width: 5; opacity: 0; }
.mm-svg .mm-cn.mm-on .mm-halo { opacity: 0.9; }

/* dimming: the drawing of an unlit level fades to 0.26; its text only to 0.42 (about 3.5:1
   against the stage) so dimmed names stay readable. Connectors of unlit levels are hidden, so
   only the lit mappings are drawn (with nothing lit, every connector shows, dashed). */
.mm-svg.mm-has .mm-lv:not(.mm-on) > :not(.mm-ring):not(.mm-hit) { opacity: 0.26; }
.mm-svg.mm-has .mm-lv:not(.mm-on) > text:not(.mm-ring):not(.mm-hit) { opacity: 0.42; }
.mm-svg.mm-has .mm-cn:not(.mm-on) { opacity: 0; }
/* the spill path only appears when 'spill' is lit, and stays dashed when it is */
.mm-svg .mm-cn.mm-spill:not(.mm-on) { opacity: 0; }
.mm-svg .mm-cn.mm-spill.mm-on path.mm-line { stroke-dasharray: 5 3; }

/* caption strip */
.mm-cap { margin: 10px auto 0; max-width: 900px; padding: 9px 12px 10px; border: 1px solid var(--line); border-radius: 10px;
  background: rgba(8,9,14,0.55); font-size: 13.5px; line-height: 1.5; color: var(--ink-2);
  display: flex; flex-direction: column; justify-content: center; box-sizing: border-box; }
.mm[data-layout="narrow"] .mm-cap { font-size: 13px; }
.mm.mm-compact .mm-cap { max-width: 640px; }
.mm-cap:empty { display: none; }
.mm-cap .mm-cap-s { color: var(--ink); font-weight: 500; }
.mm-cap .mm-cap-s::before { content: ""; display: inline-block; width: 9px; height: 9px; border-radius: 2px; margin-right: 8px; vertical-align: 0.02em; background: var(--mmc, var(--ink-3)); }
.mm-cap.mm-idle { font-family: var(--font-mono); font-size: 12px; gap: 4px; }
.mm-cap .mm-leg { display: flex; flex-wrap: wrap; gap: 4px 18px; color: var(--ink-2); }
.mm-cap .mm-leg span { display: inline-flex; align-items: center; gap: 8px; }
.mm-cap .mm-leg i { width: 20px; height: 0; border-top: 2px solid var(--c); display: inline-block; }
.mm-cap .mm-hint { color: var(--ink-3); }
.mm-cap a.term { white-space: nowrap; }
@media (prefers-reduced-motion: reduce) { .mm-svg .mm-lv > *, .mm-svg .mm-cn, .mm-svg .mm-verb { transition: none; } }
`);

  /* ───────────── helpers ───────────── */
  const S = (tag, attrs, parent) => GG.svg(tag, attrs, parent);
  const r2 = (v) => Math.round(v * 100) / 100;

  function text(parent, x, y, str, cls, size, anchor) {
    const t = S('text', { x: r2(x), y: r2(y), class: cls, 'text-anchor': anchor || 'middle', 'font-size': size }, parent);
    t.textContent = str;
    return t;
  }
  function rect(parent, [x, y, w, h], cls, rx) {
    return S('rect', { x: r2(x), y: r2(y), width: r2(w), height: r2(h), rx: rx == null ? 3 : rx, class: cls }, parent);
  }

  /* one wavy strand, centred on x = 0, from y = 0 to y = L, arrowhead at the bottom */
  function strandD(L, A, wl, ph) {
    const Ls = L - 5;
    const n = Math.max(10, Math.round(Ls / 2));
    let d = '';
    for (let i = 0; i <= n; i++) {
      const s = (i / n) * Ls;
      const u = s / Ls;
      let e = Math.min(1, u / 0.16, (1 - u) / 0.2);
      e = e <= 0 ? 0 : e * e * (3 - 2 * e);
      const x = A * e * Math.sin((2 * Math.PI * s) / wl - ph);
      d += (i ? 'L' : 'M') + x.toFixed(2) + ' ' + s.toFixed(2);
    }
    return d;
  }
  const headD = (L) => `M-3.2 ${L - 6}L3.2 ${L - 6}L0 ${L}Z`;

  function linkHTML(id, label) {
    const t = GG.byId && GG.byId[id];
    const sec = t && GG.SECTIONS ? GG.SECTIONS[t.section] : null;
    const style = sec ? ` style="--c:${sec.color}"` : '';
    return `<a class="term" data-term="${id}" href="#${id}"${style}>${GG.esc(label)}</a>`;
  }
  const stripTags = (h) => h.replace(/<[^>]+>/g, '');

  /* ───────────── geometry ───────────── */
  const P = {
    wide: { W: 760, Lc: 178, Rc: 582, colW: 324, gutL: 340, gutR: 420, lab: 14, bar: 11, head: 9.5, small: 10, verb: 9.5,
      boxW: 220, A: 3.2, wl: 13, thrL: 62, nStr: 12, strSp: 14.5, nCore: 5, coreW: 13, coreSp: 40, row2H: 120, row3H: 134,
      miniN: 3, miniW: 84, miniH: 72, miniGap: 12, ellW: 44, miniStr: 7, miniStrSp: 10, miniCore: 5, miniCoreSp: 14, barH: 26, rowGap: 28 },
    narrow: { W: 360, Lc: 84, Rc: 276, colW: 160, gutL: 164, gutR: 196, lab: 12.5, bar: 11, head: 11, small: 11, verb: 0,
      boxW: 154, A: 2.6, wl: 11, thrL: 56, nStr: 8, strSp: 13.5, nCore: 4, coreW: 11, coreSp: 30, row2H: 114, row3H: 126,
      miniN: 2, miniW: 60, miniH: 62, miniGap: 10, ellW: 24, miniStr: 5, miniStrSp: 9.5, miniCore: 3, miniCoreSp: 14, barH: 24, rowGap: 24 },
  };

  const COMPACT_TYPE = { lab: 15.5, bar: 12.5, small: 11, verb: 11 };

  function labelsFor(kind, names) {
    const ptx = names === 'ptx';
    const narrow = kind === 'narrow';
    return {
      thread: [ptx ? 'Thread' : 'CUDA thread'],
      core: ['CUDA Core'],
      block: ptx ? (narrow ? ['Cooperative thread', 'array (CTA)'] : ['Cooperative thread array (CTA)']) : ['CUDA thread block'],
      sm: narrow ? ['Streaming', 'Multiprocessor'] : ['Streaming Multiprocessor'],
      grid: [ptx ? 'Grid of CTAs' : 'CUDA kernel grid'],
      gpu: ['GPU'],
    };
  }

  function geometry(kind, names, compact) {
    // compact figures are capped at 640 px (≈0.84 scale on desktop): enlarge their type to match
    const p = compact && kind === 'wide' ? Object.assign({}, P.wide, COMPACT_TYPE) : P[kind];
    const L = labelsFor(kind, names);
    const g = { kind, p, L, W: p.W, conns: {} };
    const lineH = p.lab * 1.25;
    let y = compact ? 6 : (kind === 'wide' ? 30 : 26);
    g.heads = compact ? null : { y: kind === 'wide' ? 14 : 13 };

    // label block for a row: returns baselines for sw and hw labels and the y below them
    function labels(swLines, hwLines, top) {
      const n = Math.max(swLines.length, hwLines.length);
      const base = (lines) => lines.map((_, i) => top + (n - lines.length + i) * lineH + p.lab * 0.95);
      return { sw: base(swLines), hw: base(hwLines), bottom: top + n * lineH };
    }

    /* row 1: thread | core */
    const l1 = labels(L.thread, L.core, y);
    g.thread = { labY: l1.sw, cx: p.Lc, y0: l1.bottom + 8, L: p.thrL };
    g.thread.y1 = g.thread.y0 + p.thrL;
    g.core = { labY: l1.hw, bar: [p.Rc - p.coreW / 2, g.thread.y0, p.coreW, p.thrL] };
    const chipW = kind === 'wide' ? 26 : 22, chipH = kind === 'wide' ? 14 : 12;
    const chip = [p.Lc + (kind === 'wide' ? 22 : 29), g.thread.y0 + (kind === 'wide' ? 30 : 28), chipW, chipH];
    g.regs = { chip, labX: chip[0] + chipW / 2, labY: chip[1] - 5, tick: [p.Lc + 4, chip[1] + chipH / 2, chip[0], chip[1] + chipH / 2] };
    g.thread.hit = [p.Lc - 62, y - 2, 124 + 0, g.thread.y1 - y + 8];
    g.core.hit = [p.Rc - 70, y - 2, 140, g.thread.y1 - y + 8];
    const regLabW = (names === 'ptx' ? 4 : 9) * p.small * 0.6;
    const hitW = Math.max(chipW + 10, regLabW + 10), hitTop = g.regs.labY - p.small - 2;
    g.regs.hit = [g.regs.labX - hitW / 2, hitTop, hitW, chip[1] + chipH + 4 - hitTop];
    y = g.thread.y1 + p.rowGap;

    /* row 2: block | SM */
    const l2 = labels(L.block, L.sm, y);
    const top2 = l2.bottom + 8;
    const bh = p.row2H;
    const bx = p.Lc - p.boxW / 2, sx = p.Rc - p.boxW / 2;
    g.block = { labY: l2.sw, box: [bx, top2, p.boxW, bh], hit: [bx - 4, y - 2, p.boxW + 8, top2 + bh - y + 6] };
    g.sm = { labY: l2.hw, box: [sx, top2, p.boxW, bh], hit: [sx - 4, y - 2, p.boxW + 8, top2 + bh - y + 6] };
    const pad = kind === 'wide' ? 12 : 5;
    const rfH = kind === 'wide' ? 16 : 14, l1H = kind === 'wide' ? 18 : 16, shH = kind === 'wide' ? 20 : 18;
    g.regfile = { bar: [sx + pad, top2 + 10, p.boxW - 2 * pad, rfH] };
    g.l1 = { bar: [sx + pad, top2 + 10 + rfH + 5, p.boxW - 2 * pad, l1H] };
    g.shared = { bar: [bx + pad, top2 + 10 + rfH / 2 + 3, p.boxW - 2 * pad, shH] };
    const sb = g.shared.bar;
    const st0 = sb[1] + sb[3] + 11, st1 = top2 + bh - 9;
    g.block.strands = { xs: [], y0: st0, L: st1 - st0 };
    for (let i = 0; i < p.nStr; i++) g.block.strands.xs.push(p.Lc + (i - (p.nStr - 1) / 2) * p.strSp);
    const lb = g.l1.bar;
    const c0 = lb[1] + lb[3] + 10, c1 = top2 + bh - 10;
    g.sm.cores = [];
    for (let i = 0; i < p.nCore; i++) g.sm.cores.push([p.Rc + (i - (p.nCore - 1) / 2) * p.coreSp - p.coreW / 2, c0, p.coreW, c1 - c0]);
    y = top2 + bh + p.rowGap;

    /* row 3: grid | GPU */
    const l3 = labels(L.grid, L.gpu, y);
    const top3 = l3.bottom + 8;
    const gh = p.row3H;
    const gx = p.Lc - p.colW / 2, ux = p.Rc - p.colW / 2;
    g.grid = { labY: l3.sw, box: [gx, top3, p.colW, gh], hit: [gx - 4, y - 2, p.colW + 8, top3 + gh - y + 6], minis: [] };
    g.gpu = { labY: l3.hw, box: [ux, top3, p.colW, gh], hit: [ux - 4, y - 2, p.colW + 8, top3 + gh - y + 6], minis: [] };
    const total = p.miniN * p.miniW + Math.max(0, p.miniN - 2) * p.miniGap + p.ellW;
    const off = (p.colW - total) / 2;
    const mxs = [];
    let cx = off;
    for (let i = 0; i < p.miniN; i++) {
      mxs.push(cx);
      cx += p.miniW + (i === p.miniN - 2 ? p.ellW : p.miniGap);
    }
    const ellX = mxs[p.miniN - 2] + p.miniW + p.ellW / 2;
    const my = top3 + 12;
    for (const m of mxs) {
      const strands = { xs: [], y0: my + 16, L: p.miniH - 22 };
      for (let i = 0; i < p.miniStr; i++) strands.xs.push(gx + m + p.miniW / 2 + (i - (p.miniStr - 1) / 2) * p.miniStrSp);
      g.grid.minis.push({ rect: [gx + m, my, p.miniW, p.miniH], strip: [gx + m + 6, my + 5, p.miniW - 12, 5], strands });
      const cores = [];
      for (let i = 0; i < p.miniCore; i++) cores.push([ux + m + p.miniW / 2 + (i - (p.miniCore - 1) / 2) * p.miniCoreSp - 3.5, my + 16, 7, p.miniH - 22]);
      g.gpu.minis.push({ rect: [ux + m, my, p.miniW, p.miniH], strip: [ux + m + 6, my + 5, p.miniW - 12, 5], cores });
    }
    g.grid.dots = [gx + ellX, my + p.miniH / 2];
    g.gpu.dots = [ux + ellX, my + p.miniH / 2];
    const barY = my + p.miniH + 12;
    g.global = { bar: [gx + pad, barY, p.colW - 2 * pad, p.barH] };
    g.ram = { bar: [ux + pad, barY, p.colW - 2 * pad, p.barH] };
    const gb = barY + p.barH + 12;
    g.grid.box[3] = gb - top3; g.gpu.box[3] = gb - top3;
    g.grid.hit[3] = gb - y + 6; g.gpu.hit[3] = gb - y + 6;
    g.H = Math.ceil(gb + 8);

    /* connectors (software end → hardware end) */
    const gx1 = p.gutL + 3, gx2 = p.gutR - 3, k = (gx2 - gx1) / 2;
    const hz = (x1, x2, yy) => ({ d: `M${r2(x1)} ${r2(yy)}H${r2(x2)}`, a: [x1, yy], b: [x2, yy], mid: [(p.gutL + p.gutR) / 2, yy] });
    const sc = (x1, y1, x2, y2) => ({
      d: `M${r2(x1)} ${r2(y1)}H${r2(gx1)}C${r2(gx1 + k)} ${r2(y1)} ${r2(gx2 - k)} ${r2(y2)} ${r2(gx2)} ${r2(y2)}H${r2(x2)}`,
      a: [x1, y1], b: [x2, y2], mid: [(p.gutL + p.gutR) / 2, (y1 + y2) / 2],
    });
    const cb = g.core.bar;
    g.conns.thread = hz(p.Lc + p.A + 4, cb[0] - 2, g.thread.y0 + 10);
    const rf = g.regfile.bar;
    g.conns.registers = sc(chip[0] + chipW, chip[1] + chipH / 2, rf[0] - 1, rf[1] + rf[3] / 2);
    g.conns.registers.mid = [(chip[0] + chipW + gx1) / 2, chip[1] + chipH / 2];
    g.conns.shared = sc(sb[0] + sb[2], sb[1] + sb[3] / 2, lb[0] - 1, lb[1] + lb[3] / 2);
    const byy = g.block.strands.y0 + g.block.strands.L * 0.62;
    g.conns.block = hz(bx + p.boxW, sx, byy);
    g.conns.grid = hz(gx + p.colW, ux, my + p.miniH / 2);
    const glb = g.global.bar, rmb = g.ram.bar;
    g.conns.global = hz(glb[0] + glb[2], rmb[0] - 1, glb[1] + glb[3] / 2);
    /* spill: out of the register file's right end, down outside the GPU box, into GPU RAM's right end */
    const sa = [rf[0] + rf[2] + 1, rf[1] + rf[3] / 2], sbp = [rmb[0] + rmb[2] + 1, rmb[1] + rmb[3] / 2];
    const sxv = ux + p.colW + (kind === 'wide' ? 8 : 2);
    g.conns.spill = {
      d: `M${r2(sa[0])} ${r2(sa[1])}H${r2(sxv)}V${r2(sbp[1])}H${r2(sbp[0])}`, a: sa, b: sbp, left: true,
      lab: [sxv - 4, top2 + bh + p.rowGap / 2 + p.verb * 0.35], anchor: 'end',
    };
    return g;
  }

  /* below this container width the narrow geometry is used (so its type stays ≥ 10 px on phones,
     portrait and landscape); the wide geometry is 760 units across */
  const NARROW_BELOW = 680;

  const VERBS = { thread: 'runs on', registers: 'live in', block: 'scheduled on', shared: 'lives in', grid: 'runs across', global: 'lives in' };

  /* ───────────── component ───────────── */
  function modelMap(parent, opts) {
    opts = opts || {};
    const names = opts.names === 'ptx' ? 'ptx' : 'cuda';
    const ptx = names === 'ptx';
    const interactive = opts.interactive !== false;
    const showCap = opts.caption !== undefined ? !!opts.caption : interactive;
    const compact = !!opts.compact;
    const forced = opts.layout === 'narrow' || opts.layout === 'stacked' ? 'narrow' : null;
    const canHover = !!(window.matchMedia && matchMedia('(hover: hover)').matches);

    const root = GG.el('div', { class: 'mm' + (compact ? ' mm-compact' : '') + (interactive ? ' mm-int' : '') });
    if (interactive) root.setAttribute('data-keys', '');
    const cap = showCap ? GG.el('p', { class: 'mm-cap' }) : null;
    if (cap) root.append(cap);
    (parent || document.body).appendChild(root);

    const handlers = { select: [], hover: [] };
    let spillUsed = false; // once 'spill' has been lit, the caption is sized for its message too
    const state = { base: norm(opts.highlight), hover: null, focus: null, rove: null };
    let svg = null, layout = null, nodes = null, masters = [], destroyed = false;

    function norm(keys) {
      if (keys == null || keys === '') return [];
      const arr = Array.isArray(keys) ? keys : [keys];
      const out = [];
      for (const k of arr) {
        if (isKey(k)) { if (!out.includes(k)) out.push(k); } else console.warn('[modelMap] unknown key:', k);
      }
      if (out.includes('spill')) spillUsed = true;
      return out;
    }
    const firstLevel = (keys) => keys.find((k) => BY[k]) || null;
    const nameOf = (l) => (ptx && l.ptxName ? l.ptxName : l.name);
    const termOf = (l) => (ptx && l.ptxTerm ? l.ptxTerm : l.term);
    const descOf = (l) => (ptx && l.ptxDesc ? l.ptxDesc : l.desc);
    const swOf = (k) => (BY[k].side === 'software' ? k : BY[k].pair);
    function publicLevel(k) {
      const l = BY[k];
      return Object.assign({}, l, { name: nameOf(l), term: termOf(l), desc: descOf(l) });
    }
    function sentence(k, links) {
      const n = (key, label) => {
        const l = BY[key];
        const txt = label || nameOf(l);
        return links ? linkHTML(termOf(l), txt) : GG.esc(txt);
      };
      return (k === 'spill' ? SPILL.sentence : SENT[swOf(k)])(n, ptx);
    }
    function emit(ev, payload) { (handlers[ev] || []).forEach((fn) => { try { fn(payload); } catch (e) { console.error('[modelMap]', e); } }); }

    /* ── build the SVG for a geometry ── */
    function build(kind) {
      layout = kind;
      root.setAttribute('data-layout', kind);
      const g = geometry(kind, names, compact);
      const p = g.p;
      const L = g.L;
      const s = S('svg', {
        class: 'mm-svg', viewBox: `0 0 ${g.W} ${g.H}`, role: interactive ? 'group' : 'img',
        'aria-label': opts.ariaLabel || ariaText(),
      });
      const defs = S('defs', null, s);
      const lv = {}, cn = {};
      masters = [];

      function master(Lpx, phase, speed) {
        const id = GG.uid('mm-str');
        const grp = S('g', { id }, defs);
        const path = S('path', { d: strandD(Lpx, p.A, p.wl, phase), fill: 'none', stroke: 'currentColor', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, grp);
        S('path', { d: headD(Lpx), fill: 'currentColor', stroke: 'none' }, grp);
        const m = { id, path, L: Lpx, phase, speed };
        masters.push(m);
        return m;
      }
      function strands(parentG, m, xs, y0) {
        const sg = S('g', { class: 'mm-strands' }, parentG);
        for (const x of xs) S('use', { href: '#' + m.id, x: r2(x), y: r2(y0) }, sg);
        return sg;
      }
      function level(key, hit) {
        const l = BY[key];
        const grp = S('g', { class: 'mm-lv', 'data-k': key }, s);
        if (interactive) {
          grp.setAttribute('tabindex', '-1');
          grp.setAttribute('role', 'button');
          grp.setAttribute('aria-label', `${nameOf(l)}. ${stripTags(sentence(key, false))} ${descOf(l)}`);
        }
        rect(grp, [hit[0] - 3, hit[1] - 3, hit[2] + 6, hit[3] + 6], 'mm-ring', 6);
        rect(grp, hit, 'mm-hit', 4);
        lv[key] = grp;
        return grp;
      }
      function labelLines(grp, lines, x, ys) {
        lines.forEach((ln, i) => text(grp, x, ys[i], ln, 'mm-lab', p.lab));
      }
      function barLabel(grp, bar, str, key) {
        const t = text(grp, bar[0] + bar[2] / 2, bar[1] + bar[3] / 2 + p.bar * 0.36, str, 'mm-barlab', p.bar);
        if (ptx && PTX_SPACE[key]) {
          const sp = S('tspan', { class: 'mm-sp', dx: kind === 'wide' ? '6' : '4' }, t);
          sp.textContent = PTX_SPACE[key];
        }
        return t;
      }

      /* column headers */
      if (g.heads) {
        text(s, p.Lc, g.heads.y, ptx ? 'PTX / SASS NAMES' : 'PROGRAMMING MODEL', 'mm-head', p.head);
        text(s, p.Rc, g.heads.y, 'HARDWARE', 'mm-head', p.head);
      }

      /* containers first */
      const gb = level('block', g.block.hit);
      rect(gb, g.block.box, 'mm-box', 5);
      labelLines(gb, L.block, p.Lc, g.block.labY);
      strands(gb, master(g.block.strands.L, 0.4, 0.55), g.block.strands.xs, g.block.strands.y0);

      const gs = level('sm', g.sm.hit);
      rect(gs, g.sm.box, 'mm-box', 5);
      labelLines(gs, L.sm, p.Rc, g.sm.labY);
      g.sm.cores.forEach((c) => rect(gs, c, 'mm-core', 2));

      const gg = level('grid', g.grid.hit);
      rect(gg, g.grid.box, 'mm-box', 6);
      labelLines(gg, L.grid, p.Lc, g.grid.labY);
      g.grid.minis.forEach((m, i) => {
        rect(gg, m.rect, 'mm-mini', 3);
        rect(gg, m.strip, 'mm-strip', 1.5);
        strands(gg, master(m.strands.L, 1.3 + i * 2.1, 0.42 + i * 0.13), m.strands.xs, m.strands.y0);
      });
      dots(gg, g.grid.dots);

      const gu = level('gpu', g.gpu.hit);
      rect(gu, g.gpu.box, 'mm-box', 6);
      labelLines(gu, L.gpu, p.Rc, g.gpu.labY);
      g.gpu.minis.forEach((m) => {
        rect(gu, m.rect, 'mm-mini', 3);
        rect(gu, m.strip, 'mm-strip', 1.5);
        m.cores.forEach((c) => rect(gu, c, 'mm-core-mini', 1.5));
      });
      dots(gu, g.gpu.dots);

      /* connectors */
      const cg = S('g', { class: 'mm-cns', 'aria-hidden': 'true' }, s);
      for (const key of SW) {
        const c = g.conns[key];
        const kind2 = BY[key].kind === 'exec' ? 'x' : 'm';
        const grp = S('g', { class: 'mm-cn ' + kind2, 'data-c': key }, cg);
        S('path', { d: c.d, class: 'mm-halo' }, grp);
        S('path', { d: c.d, class: 'mm-line' }, grp);
        S('circle', { cx: r2(c.a[0]), cy: r2(c.a[1]), r: 2.2, class: 'mm-dot' }, grp);
        const [bx2, by2] = c.b;
        S('path', { d: `M${r2(bx2)} ${r2(by2)}l-6.5 -3.6v7.2z`, class: 'mm-tip' }, grp);
        if (p.verb) text(grp, c.mid[0], c.mid[1] - 5, VERBS[key], 'mm-verb', p.verb);
        cn[key] = grp;
      }
      {
        const c = g.conns.spill;
        const grp = S('g', { class: 'mm-cn m mm-spill', 'data-c': 'spill' }, cg);
        S('path', { d: c.d, class: 'mm-halo' }, grp);
        S('path', { d: c.d, class: 'mm-line' }, grp);
        S('circle', { cx: r2(c.a[0]), cy: r2(c.a[1]), r: 2.2, class: 'mm-dot' }, grp);
        S('path', { d: `M${r2(c.b[0])} ${r2(c.b[1])}l6.5 -3.6v7.2z`, class: 'mm-tip' }, grp);
        if (p.verb) text(grp, c.lab[0], c.lab[1], 'spills (local memory)', 'mm-verb', p.verb, c.anchor);
        cn.spill = grp;
      }

      /* memory + leaf levels on top */
      const grf = level('regfile', padRect(g.regfile.bar, 2));
      rect(grf, g.regfile.bar, 'mm-mem', 2.5);
      const rb = g.regfile.bar;
      const nCells = kind === 'wide' ? 16 : 11;
      const cw = rb[2] / nCells;
      rect(grf, [rb[0] + 0.5, rb[1] + 0.5, cw - 1, rb[3] - 1], 'mm-slice', 2);
      // cell dividers stop short of the label so the text sits on a clean band
      const rfLab = 'Register File', rfGap = (rfLab.length * 0.6 * p.bar) / 2 + 5, rfMid = rb[0] + rb[2] / 2;
      for (let i = 1; i < nCells; i++) {
        const x = rb[0] + i * cw;
        if (Math.abs(x - rfMid) < rfGap) continue;
        S('line', { x1: r2(x), y1: rb[1] + 2, x2: r2(x), y2: rb[1] + rb[3] - 2, class: 'mm-cell' }, grf);
      }
      text(grf, rfMid, rb[1] + rb[3] / 2 + p.bar * 0.36, rfLab, 'mm-barlab', p.bar);

      const gl1 = level('l1', padRect(g.l1.bar, 2));
      rect(gl1, g.l1.bar, 'mm-mem', 2.5);
      barLabel(gl1, g.l1.bar, 'L1 Data Cache', 'l1');

      const gsh = level('shared', padRect(g.shared.bar, 2));
      rect(gsh, g.shared.bar, 'mm-mem', 2.5);
      barLabel(gsh, g.shared.bar, 'Shared Memory', 'shared');

      const ggl = level('global', padRect(g.global.bar, 2));
      rect(ggl, g.global.bar, 'mm-mem', 3);
      barLabel(ggl, g.global.bar, 'Global Memory', 'global');

      const grm = level('ram', padRect(g.ram.bar, 2));
      rect(grm, g.ram.bar, 'mm-mem', 3);
      barLabel(grm, g.ram.bar, 'GPU RAM', 'ram');

      const gt = level('thread', g.thread.hit);
      labelLines(gt, L.thread, p.Lc, g.thread.labY);
      strands(gt, master(g.thread.L, 2.2, 0.5), [p.Lc], g.thread.y0);

      const gr = level('registers', g.regs.hit);
      const t = g.regs.tick;
      S('line', { x1: r2(t[0]), y1: r2(t[1]), x2: r2(t[2]), y2: r2(t[3]), class: 'mm-tick' }, gr);
      const ch = g.regs.chip;
      rect(gr, ch, 'mm-mem', 2);
      for (let i = 1; i < 3; i++) S('line', { x1: r2(ch[0] + (i * ch[2]) / 3), y1: ch[1] + 2, x2: r2(ch[0] + (i * ch[2]) / 3), y2: ch[1] + ch[3] - 2, class: 'mm-cell' }, gr);
      rect(gr, [ch[0] + 1, ch[1] + 1, ch[2] / 3 - 1.5, ch[3] - 2], 'mm-slice', 1.5);
      text(gr, g.regs.labX, g.regs.labY, ptx ? '.reg' : 'registers', 'mm-small', p.small);

      const gc = level('core', g.core.hit);
      labelLines(gc, L.core, p.Rc, g.core.labY);
      rect(gc, g.core.bar, 'mm-core', 2);

      nodes = { lv, cn };
      if (svg) svg.replaceWith(s); else root.insertBefore(s, cap);
      svg = s;
      if (!state.rove || !lv[state.rove]) state.rove = firstLevel(state.base) || 'thread';
      syncRove();
      drawStrands(animCtrl ? animCtrl.time : 0);
      apply();
    }

    function padRect(r, d) { return [r[0] - d, r[1] - d, r[2] + 2 * d, r[3] + 2 * d]; }
    function dots(parentG, [x, y]) {
      for (let i = -1; i <= 1; i++) S('circle', { cx: r2(x + i * 7), cy: r2(y), r: 2, class: 'mm-dots' }, parentG);
    }

    function ariaText() {
      const b = ptx ? 'cooperative thread array' : 'thread block';
      return `Diagram: the CUDA programming model mapped onto GPU hardware. Left, the abstractions: a thread with its registers, a ${b} with shared memory, and a grid of blocks with global memory. Right, the hardware: a CUDA Core; a Streaming Multiprocessor with its register file, L1 data cache and cores; and the whole GPU, many SMs sharing GPU RAM. Threads run on cores, blocks are scheduled onto SMs and grids spread over the whole GPU; registers live in the register file, shared memory in the L1 data cache and global memory in GPU RAM.`;
    }

    /* ── state → visuals ── */
    function shownKeys() {
      if (state.hover) return [state.hover];
      if (state.focus) return [state.focus];
      return state.base;
    }
    function apply() {
      if (!svg) return;
      const keys = shownKeys();
      const on = new Set(), cs = new Set();
      keys.forEach((k) => {
        if (k === 'spill') { SPILL.lights.forEach((x) => on.add(x)); SPILL.conns.forEach((x) => cs.add(x)); return; }
        on.add(k); on.add(BY[k].pair); cs.add(swOf(k));
      });
      svg.classList.toggle('mm-has', on.size > 0);
      for (const k in nodes.lv) {
        nodes.lv[k].classList.toggle('mm-on', on.has(k));
        if (interactive) nodes.lv[k].setAttribute('aria-pressed', String(state.base.includes(k)));
      }
      for (const k in nodes.cn) nodes.cn[k].classList.toggle('mm-on', cs.has(k));
      renderCap(keys[0] || null);
    }
    function renderCap(k) {
      if (!cap) return;
      if (!k) {
        cap.classList.add('mm-idle');
        const hint = !interactive ? ''
          : canHover ? 'Hover, click or Tab into any level to light up its counterpart.' : 'Tap any level to light up its counterpart.';
        cap.innerHTML = '<span class="mm-leg"><span><i style="--c:var(--control)"></i>runs on / is scheduled onto</span>' +
          '<span><i style="--c:var(--memory)"></i>lives in (memory)</span></span>' + (hint ? `<span class="mm-hint">${hint}</span>` : '');
        cap.style.removeProperty('--mmc');
        return;
      }
      const l = BY[k];
      cap.classList.remove('mm-idle');
      cap.style.setProperty('--mmc', l && l.kind === 'exec' ? 'var(--control)' : 'var(--memory)');
      cap.innerHTML = `<span class="mm-cap-in"><span class="mm-cap-s">${sentence(k, true)}</span> <span class="mm-cap-d">${GG.esc(l ? descOf(l) : SPILL.desc)}</span></span>`;
    }

    /* The strip is as tall as its longest message at the current width (measured, so it does
       not jump while the reader moves between levels), and shorter messages sit centred in it. */
    let capW = 0;
    function sizeCap(force) {
      if (!cap || destroyed) return;
      const w = cap.clientWidth;
      if (!w || (!force && w === capW)) return;
      capW = w;
      cap.style.minHeight = '0px';
      renderCap(null);
      let max = cap.offsetHeight;
      for (const l of LEVELS) { renderCap(l.key); max = Math.max(max, cap.offsetHeight); }
      if (spillUsed) { renderCap('spill'); max = Math.max(max, cap.offsetHeight); }
      cap.style.minHeight = Math.ceil(max) + 'px';
      renderCap(shownKeys()[0] || null);
    }

    /* ── strands animation ── */
    function drawStrands(t) {
      for (const m of masters) m.path.setAttribute('d', strandD(m.L, P[layout].A, P[layout].wl, m.phase + t * m.speed * Math.PI * 2));
    }
    const animCtrl = opts.animate === false ? null : GG.anim(root, (t) => drawStrands(t));

    /* ── interaction ── */
    const keyOf = (el) => { const g = el && el.closest ? el.closest('.mm-lv') : null; return g && root.contains(g) ? g.getAttribute('data-k') : null; };
    function setHover(k) {
      if (k === state.hover) return;
      state.hover = k;
      apply();
      emit('hover', k ? { key: k, pair: BY[k].pair, level: publicLevel(k) } : null);
    }
    function select(k) {
      const same = k && state.base.length === 1 && state.base[0] === k;
      state.base = !k || same ? [] : [k];
      if (k) { state.rove = k; syncRove(); }
      apply();
      const key = state.base[0] || null;
      emit('select', { key, pair: key ? BY[key].pair : null, keys: state.base.slice(), level: key ? publicLevel(key) : null });
    }
    function syncRove() {
      if (!interactive || !nodes) return;
      for (const k in nodes.lv) nodes.lv[k].setAttribute('tabindex', k === state.rove ? '0' : '-1');
    }
    function moveFocus(k) {
      if (!k || !nodes.lv[k]) return;
      state.rove = k;
      syncRove();
      nodes.lv[k].focus();
    }

    if (interactive) {
      root.addEventListener('pointerover', (e) => { if (e.pointerType === 'mouse' || e.pointerType === 'pen') setHover(keyOf(e.target)); });
      root.addEventListener('pointerleave', () => setHover(null));
      root.addEventListener('click', (e) => {
        if (e.target.closest && e.target.closest('a')) return;
        const k = keyOf(e.target);
        if (k) select(k);
      });
      root.addEventListener('focusin', (e) => {
        const k = keyOf(e.target);
        if (!k) return;
        state.rove = k;
        syncRove();
        let fv = true;
        try { fv = e.target.matches(':focus-visible'); } catch (err) { fv = true; }
        if (fv) { state.focus = k; apply(); emit('hover', { key: k, pair: BY[k].pair, level: publicLevel(k) }); }
      });
      root.addEventListener('focusout', (e) => {
        if (e.relatedTarget && root.contains(e.relatedTarget) && keyOf(e.relatedTarget)) return;
        if (state.focus) { state.focus = null; apply(); emit('hover', null); }
      });
      root.addEventListener('keydown', (e) => {
        const k = keyOf(e.target);
        if (!k) return;
        const col = SW.includes(k) ? SW : HW;
        const i = col.indexOf(k);
        let next = null;
        switch (e.key) {
          case 'ArrowDown': next = col[Math.min(col.length - 1, i + 1)]; break;
          case 'ArrowUp': next = col[Math.max(0, i - 1)]; break;
          case 'ArrowRight': next = col === SW ? BY[k].pair : null; break;
          case 'ArrowLeft': next = col === HW ? BY[k].pair : null; break;
          case 'Home': next = col[0]; break;
          case 'End': next = col[col.length - 1]; break;
          case 'Enter': case ' ': e.preventDefault(); select(k); return;
          case 'Escape': if (state.base.length) { e.preventDefault(); select(null); } return;
          default: return;
        }
        e.preventDefault();
        if (next && next !== k) moveFocus(next);
      });
    }

    /* ── layout switching ── */
    function wantFor(w) { return forced || (w > 0 && w < NARROW_BELOW ? 'narrow' : 'wide'); }
    const w0 = (parent && parent.getBoundingClientRect ? parent.getBoundingClientRect().width : 0) || root.getBoundingClientRect().width;
    build(w0 > 0 ? wantFor(w0) : wantFor(window.innerWidth < 600 ? 400 : 800));
    const ro = GG.resize(root, (r) => {
      if (destroyed || !r || !r.width) return;
      const want = wantFor(r.width);
      if (want !== layout) {
        const hadFocus = root.contains(document.activeElement) ? keyOf(document.activeElement) : null;
        build(want);
        if (hadFocus) moveFocus(hadFocus);
        sizeCap(true);
      } else sizeCap(false);
    });
    sizeCap(true);
    if (cap && document.fonts && document.fonts.ready) document.fonts.ready.then(() => sizeCap(true)).catch(() => {});

    const api = {
      el: root,
      get svg() { return svg; },
      get layout() { return layout; },
      anim: animCtrl,
      highlight(keys) {
        const had = spillUsed;
        state.base = norm(keys);
        const first = firstLevel(state.base);
        if (first) { state.rove = first; syncRove(); }
        apply();
        if (spillUsed && !had) sizeCap(true);
        return api;
      },
      clear() { state.base = []; state.hover = null; state.focus = null; apply(); return api; },
      keys: () => state.base.slice(),
      on(ev, fn) { if (typeof fn === 'function') (handlers[ev] || (handlers[ev] = [])).push(fn); return api; },
      destroy() {
        destroyed = true;
        if (animCtrl) animCtrl.stop();
        if (ro && ro.disconnect) ro.disconnect();
        root.remove();
      },
    };
    return api;
  }

  modelMap.LEVELS = LEVELS;
  modelMap.LEVELS_BY = BY;
  modelMap.PAIRS = PAIRS;
  GG.components.modelMap = modelMap;
})();
