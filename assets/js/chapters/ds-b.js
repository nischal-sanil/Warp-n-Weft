/* chapters/ds-b.js: Device Software, part B.
   Entries: thread, warp, warpgroup, cooperative-thread-array, kernel.
   Every CSS class here is prefixed "dsb-". */
(function () {
  'use strict';

  GG.css(`
/* ── shared ── */
.dsb-w { position: relative; min-width: 0; }
.dsb-svg { display: block; width: 100%; height: auto; overflow: visible; -webkit-tap-highlight-color: transparent; }
.dsb-svg text { font-family: var(--font-mono); pointer-events: none; }
.dsb-svg .dsb-hit { cursor: pointer; }
.dsb-svg[tabindex]:focus-visible, .dsb-svg:focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; border-radius: 6px; }
.dsb-svg [data-k] { transition: opacity 0.22s ease; }
.dsb-legend { display: flex; flex-wrap: wrap; gap: 6px 16px; margin-top: 10px; font: 500 11px/1.4 var(--font-mono); color: var(--ink-2); }
.dsb-legend span { display: inline-flex; align-items: center; gap: 7px; }
.dsb-legend i { width: 11px; height: 11px; border-radius: 3px; flex: none; display: inline-block; }
.dsb-sw-core { background: var(--core); }
.dsb-sw-control { background: var(--control); }
.dsb-sw-memory { background: var(--memory); }
.dsb-sw-special { background: var(--special); }
.dsb-sw-host { background: var(--host); }
.dsb-sw-accent { background: var(--accent); }
.dsb-sw-thread { background: var(--ink-2); }
.dsb-sw-idle { background: var(--danger-a); box-shadow: inset 0 0 0 1px rgba(255, 91, 110, 0.7); }
.dsb-sw-empty { background: transparent; box-shadow: inset 0 0 0 1px var(--line-2); }
.dsb-detail {
  margin-top: 10px; padding: 9px 12px; border-radius: 10px; border: 1px solid var(--line); background: rgba(8, 9, 14, 0.55);
  font: 500 12px/1.6 var(--font-mono); color: var(--ink-2); overflow-wrap: anywhere;
}
.dsb-detail b { color: var(--ink); font-weight: 600; }
.dsb-detail .a { color: var(--accent); }
.dsb-detail .m { color: var(--memory); }
.dsb-detail .c { color: var(--core); }
.dsb-detail .k { color: var(--control); }
.dsb-detail .d { color: var(--danger); }
.dsb-detail .dim { color: var(--ink-3); }
.dsb-formula {
  margin-top: 10px; padding: 10px 12px; border-radius: 10px; border: 1px solid var(--line); background: #090a10;
  font: 500 12.5px/1.75 var(--font-mono); color: var(--ink-2); overflow-x: auto; white-space: pre; scrollbar-width: thin;
}
.dsb-formula .v { color: var(--accent); font-weight: 600; }
.dsb-formula .r { color: var(--ink); font-weight: 600; }
.dsb-formula .s { color: #7fb0ff; }
.dsb-formula .c { color: var(--ink-3); }
.dsb-formula .ok { color: var(--core); }
.dsb-formula .bad { color: var(--danger); }
.dsb-banner { display: inline-flex; align-items: center; gap: 8px; font: 600 11px/1.2 var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; padding: 6px 9px 5px; border-radius: 7px; }
.dsb-banner.ok { color: var(--core); background: var(--core-a); box-shadow: inset 0 0 0 1px rgba(69, 212, 155, 0.5); }
.dsb-banner.bad { color: var(--danger); background: var(--danger-a); box-shadow: inset 0 0 0 1px rgba(255, 91, 110, 0.5); }
.dsb-banner.run { color: var(--control); background: var(--control-a); box-shadow: inset 0 0 0 1px rgba(255, 198, 92, 0.5); }
.entry-body .dsb-tag { display: inline-block; font: 600 9.5px/1 var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 5px 2px; border-radius: 4px; border: 1px solid rgba(184, 164, 255, 0.45); color: var(--host); vertical-align: 0.15em; white-space: nowrap; }
.dsb-defs { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 10px; }
.dsb-def { border: 1px solid var(--line); border-radius: 12px; background: var(--surface); padding: 10px 12px 11px; font-size: 14px; line-height: 1.5; color: var(--ink-2); }
.dsb-def .dsb-def-h { margin: 0 0 4px; display: flex; align-items: center; gap: 8px; font: 600 11px/1.3 var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink); }
.dsb-def .dsb-def-h i { width: 12px; height: 12px; border-radius: 3px; flex: none; }
.dsb-def .dsb-def-h i.st { background: rgba(255, 198, 92, 0.25); box-shadow: inset 0 0 0 1.5px var(--control); }
.dsb-def .dsb-def-h i.el { background: rgba(111, 166, 255, 0.25); box-shadow: inset 0 0 0 1.5px var(--memory); }
.dsb-def .dsb-def-h i.ie { background: rgba(238, 116, 207, 0.3); box-shadow: inset 0 0 0 1.5px var(--special); }
.dsb-def .dsb-def-h i.oc { background: transparent; box-shadow: inset 0 0 0 1.5px var(--core); }
.entry-body .dsb-sig code { white-space: normal; }
.dsb-eq { font: 500 13px/1.6 var(--font-mono); color: var(--ink); background: #090a10; border: 1px solid var(--line); border-radius: 10px; padding: 9px 12px; overflow-x: auto; white-space: pre; scrollbar-width: thin; }
.dsb-eq .c { color: var(--ink-3); }
.dsb-flex { display: flex; flex-wrap: wrap; gap: 8px 12px; align-items: center; }
.dsb-stage-h { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 6px 12px; margin: 2px 0 8px; font: 500 11px/1.4 var(--font-mono); color: var(--ink-3); letter-spacing: 0.04em; }
.dsb-stage-h b { color: var(--ink); font-weight: 600; }
.dsb-fig-code .code pre { font-size: 12.4px; }
.dsb-two { display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; align-items: start; }
@media (min-width: 980px) { .dsb-two.on { grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); } }
.dsb-cv { touch-action: pan-y; }
.dsb-cv canvas { display: block; }
/* phones: long lines in our figure code panels wrap with a hanging indent instead of clipping */
@media (max-width: 600px) {
  .dsb-fig-code .code pre { font-size: 11.6px; }
  .dsb-fig-code .code .ln { white-space: pre-wrap; overflow-wrap: anywhere; padding-left: calc(4.3em + 4ch); text-indent: calc(-4.3em - 4ch); }
  .dsb-fig-code .code .ln::before { text-indent: 0; }
}
`);

  /* ───────────── helpers ───────────── */
  const el = GG.el;
  const esc = GG.esc;
  const fmt = GG.fmt;
  const TERMS = {};
  (window.GG_TERMS || []).forEach((t) => { TERMS[t.id] = t; });
  /* Cross-link HTML, already decorated (so it also works in content written after boot). */
  function T(id, text) {
    const t = TERMS[id];
    const color = t ? (GG.SECTIONS[t.section] || GG.SECTIONS.intro).color : 'var(--accent)';
    return `<a data-term="${id}" href="#${id}" class="term" style="--c:${color}">${text == null ? (t ? esc(t.name) : id) : text}</a>`;
  }
  const S = (tag, attrs, parent) => GG.svg(tag, attrs, parent);
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }
  /* SVG text. gg.css sets `.fig svg text { fill }`, which beats presentation attributes, so colour goes in style. */
  function tx(parent, x, y, str, o) {
    o = o || {};
    let st = `fill:${o.fill || 'var(--ink-2)'};font-size:${o.size || 11}px;`;
    if (o.weight) st += `font-weight:${o.weight};`;
    if (o.family) st += `font-family:${o.family};`;
    if (o.ls) st += `letter-spacing:${o.ls};`;
    if (o.opacity != null) st += `opacity:${o.opacity};`;
    const t = GG.svg('text', { x: r1(x), y: r1(y), 'text-anchor': o.anchor || null, class: o.cls || null, style: st }, parent);
    t.textContent = str;
    return t;
  }
  function rect(parent, x, y, w, h, o) {
    o = o || {};
    return S('rect', {
      x: r1(x), y: r1(y), width: r1(Math.max(0, w)), height: r1(Math.max(0, h)), rx: o.rx != null ? o.rx : 4,
      fill: o.fill || 'none', stroke: o.stroke || 'none', 'stroke-width': o.sw || (o.stroke ? 1 : null),
      'stroke-dasharray': o.dash || null, opacity: o.opacity != null ? o.opacity : null, class: o.cls || null,
    }, parent);
  }
  function line(parent, x1, y1, x2, y2, o) {
    o = o || {};
    return S('line', {
      x1: r1(x1), y1: r1(y1), x2: r1(x2), y2: r1(y2), stroke: o.stroke || 'var(--ink-3)', 'stroke-width': o.sw || 1,
      'stroke-dasharray': o.dash || null, 'stroke-linecap': o.cap || null, opacity: o.opacity != null ? o.opacity : null,
      'marker-end': o.marker || null,
    }, parent);
  }
  function path(parent, d, o) {
    o = o || {};
    return S('path', {
      d, fill: o.fill || 'none', stroke: o.stroke || 'none', 'stroke-width': o.sw || (o.stroke ? 1 : null),
      'stroke-dasharray': o.dash || null, 'stroke-linecap': o.cap || null, 'stroke-linejoin': o.join || null,
      opacity: o.opacity != null ? o.opacity : null,
    }, parent);
  }
  const r1 = (v) => Math.round(v * 10) / 10;
  /* A small arrow head at (x, y) pointing in direction (dx, dy). */
  function arrowHead(parent, x, y, dx, dy, color, size) {
    const s = size || 5;
    const L = Math.hypot(dx, dy) || 1;
    const ux = dx / L, uy = dy / L;
    const px = -uy, py = ux;
    const d = `M${r1(x)},${r1(y)} L${r1(x - ux * s * 1.6 + px * s)},${r1(y - uy * s * 1.6 + py * s)} L${r1(x - ux * s * 1.6 - px * s)},${r1(y - uy * s * 1.6 - py * s)} Z`;
    return path(parent, d, { fill: color });
  }
  /* A wavy thread strand (the weaving motif), top to bottom. */
  function strandD(x, y0, y1, amp, waves) {
    const n = Math.max(2, Math.round(waves * 8));
    let d = `M${r1(x)},${r1(y0)}`;
    for (let i = 1; i <= n; i++) {
      const t = i / n;
      const y = y0 + (y1 - y0) * t;
      const xx = x + Math.sin(t * waves * Math.PI * 2) * amp;
      d += ` L${r1(xx)},${r1(y)}`;
    }
    return d;
  }
  const $$ = (root, sel) => Array.prototype.slice.call(root.querySelectorAll(sel));

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
      console.error('[ds-b] ' + label + ' failed', e);
      if (parent) parent.insertAdjacentHTML('beforeend', `<div class="entry-error">${esc(label)} could not be drawn: ${esc(e && e.message)}</div>`);
      return null;
    }
  }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const plural = (n, w, ws) => `${fmt.int(n)} ${n === 1 ? w : (ws || w + 's')}`;
  const canHover = !!(window.matchMedia && matchMedia('(hover: hover)').matches);
  /* Phones: code panels clip their right-hand comment column, so our own snippets drop trailing
     comments there and the figure shows the current line's comment in its text instead. */
  const NARROW = !!(window.matchMedia && matchMedia('(max-width: 600px)').matches);
  function splitComments(src) {
    if (!NARROW) return { code: src, comments: {} };
    const comments = {};
    const code = src.split('\n').map((ln, k) => {
      const m = ln.match(/^(.*\S)\s+\/\/\s?(.*)$/);
      if (!m || /^\s*\/\//.test(ln)) return ln;
      comments[k + 1] = '// ' + m[2];
      return m[1];
    }).join('\n');
    return { code, comments };
  }
  /* One decimal place, with a true minus sign. */
  const num1 = (v) => (v < 0 ? '−' + fmt.fixed(-v, 1) : fmt.fixed(v, 1));

  /* The programming-model map (shared component), with a figure frame. The map's own caption
     strip is off; the figure's why line carries the same mapping sentence and description. */
  const MAP_SENT = {
    thread: (n, p) => `A ${n('thread', p ? 'thread' : 'CUDA thread')} runs on a ${n('core')}.`,
    registers: (n) => `${n('registers', 'Registers')} live in a slice of the SM’s ${n('regfile', 'register file')}.`,
    block: (n, p) => `A ${n('block', p ? 'cooperative thread array (CTA)' : 'CUDA thread block')} is scheduled onto a single ${n('sm', 'Streaming Multiprocessor (SM)')}.`,
    shared: (n) => `${n('shared', 'Shared memory')} lives in the SM’s ${n('l1', 'L1 data cache')}.`,
    grid: (n, p) => `A ${n('grid', p ? 'grid of CTAs' : 'CUDA kernel grid')} executes across many SMs, at the scale of the whole ${n('gpu', 'GPU')}.`,
    global: (n) => `${n('global', 'Global memory')} lives in ${n('ram', 'GPU RAM')}.`,
  };
  function modelMapFigure(host, ctx, o) {
    const f = ctx.figure(host, { title: o.title, hint: canHover ? 'hover or click a level' : 'tap a level', wide: true, caption: o.caption });
    const MM = GG.components.modelMap;
    const ptx = o.names === 'ptx';
    const map = MM(f.stage, { highlight: o.highlight, names: o.names || 'cuda', caption: false });
    const base = Array.isArray(o.highlight) ? o.highlight.slice() : [o.highlight];
    const lv = (k) => { const l = MM.LEVELS_BY[k]; return { name: (ptx && l.ptxName) || l.name, term: (ptx && l.ptxTerm) || l.term, desc: (ptx && l.ptxDesc) || l.desc }; };
    const n = (k, label) => T(lv(k).term, label || esc(lv(k).name));
    function why(k) {
      const l = MM.LEVELS_BY[k];
      if (!l) return;
      f.setWhy(`${MAP_SENT[l.side === 'software' ? k : l.pair](n, ptx)} ${esc(lv(k).desc)}`);
    }
    let sel = base[0];
    map.on('select', (e) => { if (!e.key) map.highlight(base); sel = e.key || base[0]; why(sel); });
    map.on('hover', (e) => why(e ? e.key : sel));
    why(sel);
    return { f, map };
  }

  const REF_CUDA_REFRESHER = 'https://developer.nvidia.com/blog/cuda-refresher-cuda-programming-model/';
  const REF_CPG_MODEL = 'https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#programming-model';
  const REF_BPG_ARITH = 'https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/index.html#arithmetic-instructions';
  const REF_NCU_PIPES = 'https://docs.nvidia.com/nsight-compute/ProfilingGuide/index.html';
  const MAP_CREDIT = `Modified from diagrams in NVIDIA’s <a href="${REF_CUDA_REFRESHER}">CUDA Refresher: The CUDA Programming Model</a> and the NVIDIA <a href="${REF_CPG_MODEL}">CUDA C++ Programming Guide</a>, as in the glossary.`;

  /* ═════════════════════════════ Thread ═════════════════════════════ */

  const AXPB = `__global__ void axpb(const float* x, float* y) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;  // which element is mine?
    float v = x[i];                                 // load from global memory
    float r = 2.0f * v + 1.0f;                      // one multiply-add
    y[i] = r;                                       // store to global memory
}`;

  /* Fig: a POSIX thread and a CUDA thread, side by side */
  function threadCompare(host, ctx) {
    const f = ctx.figure(host, {
      title: 'A POSIX thread and a CUDA thread',
      hint: canHover ? 'pick a row · hover the parts' : 'pick a row · tap the parts',
      wide: true,
      caption: 'Left (top on phones): a C program in a POSIX environment targets a process, which holds one or more threads and the resources they share. Right (bottom): SASS and PTX programs target a single thread, which owns its registers, but little else. Colours follow the rest of the site: amber for control (the program counter), blue for anything that stores bits, lavender for the CPU side.',
    });
    const ROWS = [
      { value: 'target', label: 'Target' },
      { value: 'regs', label: 'Registers' },
      { value: 'pc', label: 'Program counter' },
      { value: 'stack', label: 'Stack' },
      { value: 'sys', label: 'Syscalls' },
      { value: 'rest', label: 'Everything else' },
    ];
    const WHY = {
      target: `<b>What a program targets.</b> A C program in a POSIX environment targets a <b>process</b>: a container, set up by the operating system, that holds one or more threads plus the resources they share. ${T('streaming-assembler', 'SASS')} and ${T('parallel-thread-execution', 'PTX')} programs target a single <b>thread</b>: the code says what one thread does, and the GPU runs it once per thread.`,
      regs: `<b>Registers.</b> Both kinds of thread have their own ${T('registers', 'registers')}. A CUDA thread’s registers are a slice of its SM’s ${T('register-file', 'register file')} and stay there for the thread’s whole life, so the ${T('warp-scheduler', 'warp scheduler')} can switch between threads without moving any data. A CPU thread’s registers are saved to memory whenever the operating system switches it out.`,
      pc: `<b>Program counter.</b> Both can have a private program counter (PC), the address of the next instruction to run. On the GPU, programs are generally written so that all 32 threads of a ${T('warp', 'warp')} keep the same PC and execute instructions in lock-step: one instruction issued, 32 threads executing it.`,
      stack: `<b>Stack.</b> Both have a stack, for spilled registers and a function call stack. A CUDA thread’s stack lives in ${T('global-memory', 'global memory')}, in ${T('gpu-ram', 'GPU RAM')}, far from the cores, so high-performance ${T('kernel', 'kernels')} generally limit their use of both.`,
      sys: `<b>System calls.</b> A POSIX thread makes system calls (syscalls) to ask the operating system kernel for files, memory, network and other privileged services. CUDA threads are not used to make syscalls. Work that needs the operating system stays on the host, the CPU.`,
      rest: `<b>Everything else.</b> A process owns an address space, a heap and open files, and its threads share them. A CUDA thread has its own registers, but little else: the memory it reads and writes belongs to its ${T('thread-block', 'block')} (${T('shared-memory', 'shared memory')}) or to the whole grid (${T('global-memory', 'global memory')}).`,
    };
    let sel = 'target', hover = null;
    GG.ui.seg(f.controls, { label: 'Compare', options: ROWS, value: sel, onChange: (v) => { sel = v; apply(); } });
    const wrap = el('div', { class: 'dsb-w' });
    f.stage.append(wrap);
    const svg = S('svg', { class: 'dsb-svg', role: 'img', 'aria-label': 'Side-by-side diagram. Left, a POSIX process on a CPU: a shared strip for address space, heap and open files, two threads each with a program counter, registers and a stack, and a syscall arrow to the OS kernel. Right, a CUDA thread on a GPU: one of 32 threads in a warp that share a program counter in practice, with its registers in the SM register file, its stack in global memory in GPU RAM, an empty slot where a process would own other resources, and a crossed-out arrow to the OS kernel: no syscalls.' }, wrap);
    let parts = [];

    const PH = 316;
    function panelPosix(g, x0, y0, pw) {
      tx(g, x0, y0 + 13, 'POSIX process on a CPU', { fill: 'var(--host)', size: 12, weight: 600 });
      const gp = S('g', { 'data-k': 'target rest' }, g);
      rect(gp, x0, y0 + 24, pw, 198, { rx: 12, fill: 'rgba(184,164,255,0.05)', stroke: 'var(--host)', sw: 1.2 });
      tx(gp, x0 + 12, y0 + 42, 'process', { fill: 'var(--host)', size: 11 });
      tx(gp, x0 + pw - 12, y0 + 42, 'one or more threads', { fill: 'var(--ink-3)', size: 10, anchor: 'end' });
      const gs = S('g', { 'data-k': 'rest' }, g);
      rect(gs, x0 + 12, y0 + 50, pw - 24, 26, { rx: 6, fill: 'var(--memory-a)', stroke: 'var(--memory)' });
      tx(gs, x0 + pw / 2, y0 + 67, pw < 300 ? 'address space · heap · files' : 'shared: address space · heap · open files', { fill: 'var(--ink)', size: 10.5, anchor: 'middle' });
      const tw = (pw - 24 - 10) / 2;
      for (let i = 0; i < 2; i++) {
        const x = x0 + 12 + i * (tw + 10), y = y0 + 86;
        const gt = S('g', { 'data-k': 'target' }, g);
        rect(gt, x, y, tw, 124, { rx: 8, fill: 'var(--surface-2)', stroke: 'var(--line-2)' });
        path(gt, strandD(x + 12, y + 6, y + 21, 1.6, 1.5), { stroke: 'var(--ink-2)', sw: 1.4, cap: 'round' });
        tx(gt, x + 22, y + 18, 'thread ' + (i + 1), { fill: 'var(--ink)', size: 11, weight: 600 });
        const rows = [['pc', 'program counter', 'control'], ['regs', 'registers', 'memory'], ['stack', 'stack', 'memory']];
        rows.forEach(([k, lab, c], r) => {
          const gr = S('g', { 'data-k': k }, g);
          const ry = y + 30 + r * 30;
          rect(gr, x + 8, ry, tw - 16, 24, { rx: 5, fill: `var(--${c}-a)`, stroke: `var(--${c})` });
          tx(gr, x + 16, ry + 16, lab, { fill: 'var(--ink)', size: 10.5 });
        });
      }
      const gk = S('g', { 'data-k': 'sys' }, g);
      const kx = x0 + pw * 0.16, kw = pw * 0.68;
      rect(gk, kx, y0 + 258, kw, 32, { rx: 8, fill: 'var(--surface-3)', stroke: 'var(--line-2)' });
      tx(gk, kx + kw / 2, y0 + 278, 'OS kernel', { fill: 'var(--ink)', size: 11, anchor: 'middle' });
      const ax = x0 + 12 + tw / 2;
      line(gk, ax, y0 + 212, ax, y0 + 252, { stroke: 'var(--ink-2)', sw: 1.4 });
      arrowHead(gk, ax, y0 + 257, 0, 1, 'var(--ink-2)', 4.5);
      tx(gk, ax + 8, y0 + 240, 'syscall', { fill: 'var(--ink-2)', size: 10.5 });
    }
    function panelCuda(g, x0, y0, pw) {
      tx(g, x0, y0 + 13, 'CUDA thread on a GPU', { fill: 'var(--ink)', size: 12, weight: 600 });
      const gw = S('g', { 'data-k': 'pc' }, g);
      rect(gw, x0, y0 + 24, pw, 60, { rx: 12, fill: 'rgba(255,255,255,0.02)', stroke: 'var(--line-2)', dash: '4 3' });
      tx(gw, x0 + 12, y0 + 40, 'warp · 32 threads', { fill: 'var(--ink-2)', size: 10.5 });
      tx(gw, x0 + pw - 12, y0 + 40, pw < 300 ? 'one PC, lock-step' : 'one PC in practice: lock-step', { fill: 'var(--control)', size: 10.5, anchor: 'end' });
      rect(gw, x0 + 10, y0 + 47, pw - 20, 4, { rx: 2, fill: 'var(--control)', opacity: 0.8 });
      const sx0 = x0 + 16, sx1 = x0 + pw - 16;
      const HL = 5;
      let hx = 0;
      for (let j = 0; j < 32; j++) {
        const x = sx0 + (j * (sx1 - sx0)) / 31;
        if (j === HL) { hx = x; continue; }
        path(gw, strandD(x, y0 + 55, y0 + 78, 1.3, 1.5), { stroke: 'var(--ink-3)', sw: 1.1, cap: 'round' });
      }
      const ga = S('g', { 'data-k': 'target regs pc stack sys rest' }, g);
      path(ga, strandD(hx, y0 + 55, y0 + 78, 1.3, 1.5), { stroke: 'var(--accent)', sw: 2.2, cap: 'round' });
      const bx = x0 + 12, bw = pw - 24, by = y0 + 98, bh = 146;
      path(ga, `M${r1(hx)},${r1(y0 + 80)} L${r1(bx + 2)},${r1(by)} M${r1(hx)},${r1(y0 + 80)} L${r1(bx + bw - 2)},${r1(by)}`, { stroke: 'var(--accent)', sw: 0.8, dash: '3 3', opacity: 0.7 });
      const gt = S('g', { 'data-k': 'target' }, g);
      rect(gt, bx, by, bw, bh, { rx: 8, fill: 'var(--surface-2)', stroke: 'var(--accent)', sw: 1.2 });
      tx(gt, bx + 10, by + 18, 'thread 5', { fill: 'var(--ink)', size: 11, weight: 600 });
      tx(gt, bx + bw - 10, by + 18, pw < 300 ? 'targeted by SASS, PTX' : 'what SASS and PTX target', { fill: 'var(--ink-3)', size: 10, anchor: 'end' });
      const narrow = pw < 330;
      const rows = [
        ['pc', narrow ? 'program counter · = warp’s' : 'program counter · kept equal across the warp', 'control', false],
        ['regs', narrow ? 'registers · SM register file' : 'registers · in the SM’s register file', 'memory', false],
        ['rest', narrow ? 'no heap, files or address space' : 'no address space, heap or files of its own', 'none', true],
        ['stack', narrow ? 'stack · global memory' : 'stack · in global memory, in GPU RAM', 'memory', false],
      ];
      rows.forEach(([k, lab, c, empty], r) => {
        const gr = S('g', { 'data-k': k }, g);
        const ry = by + 28 + r * 28;
        if (empty) rect(gr, bx + 8, ry, bw - 16, 22, { rx: 5, fill: 'none', stroke: 'var(--ink-3)', dash: '3 3' });
        else rect(gr, bx + 8, ry, bw - 16, 22, { rx: 5, fill: `var(--${c}-a)`, stroke: `var(--${c})` });
        tx(gr, bx + 16, ry + 15, lab, { fill: empty ? 'var(--ink-3)' : 'var(--ink)', size: 10.5 });
      });
      const gm = S('g', { 'data-k': 'stack' }, g);
      const mw = pw * 0.56, my = y0 + 262;
      rect(gm, x0, my, mw, 46, { rx: 8, fill: 'var(--memory-a)', stroke: 'var(--memory)' });
      tx(gm, x0 + 10, my + 17, 'GPU RAM', { fill: 'var(--ink)', size: 10.5, weight: 600 });
      rect(gm, x0 + 8, my + 24, mw - 16, 16, { rx: 4, fill: 'rgba(111,166,255,0.28)', stroke: 'var(--memory)', dash: '2 2' });
      tx(gm, x0 + 14, my + 36, mw < 240 ? 'stack: spills, calls' : 'thread 5’s stack: spills, calls', { fill: 'var(--ink)', size: 9.5 });
      const sx = x0 + 34;
      line(gm, sx, by + bh, sx, my - 5, { stroke: 'var(--memory)', sw: 1.4 });
      arrowHead(gm, sx, my - 1, 0, 1, 'var(--memory)', 4);
      const gk = S('g', { 'data-k': 'sys' }, g);
      const kx = x0 + pw * 0.64, kw = pw * 0.36;
      rect(gk, kx, my + 8, kw, 32, { rx: 8, fill: 'var(--surface-3)', stroke: 'var(--line-2)', opacity: 0.6 });
      tx(gk, kx + kw / 2, my + 28, 'OS kernel', { fill: 'var(--ink-3)', size: 11, anchor: 'middle' });
      const ax = kx + kw / 2;
      line(gk, ax, by + bh, ax, my + 3, { stroke: 'var(--danger)', sw: 1.3, dash: '3 3' });
      const cy = by + bh + (my + 8 - by - bh) / 2;
      path(gk, `M${r1(ax - 5)},${r1(cy - 5)} L${r1(ax + 5)},${r1(cy + 5)} M${r1(ax + 5)},${r1(cy - 5)} L${r1(ax - 5)},${r1(cy + 5)}`, { stroke: 'var(--danger)', sw: 2, cap: 'round' });
      tx(gk, ax - 10, cy + 4, 'no syscalls', { fill: 'var(--danger)', size: 10.5, anchor: 'end' });
    }
    function draw(W) {
      clear(svg);
      const two = W >= 640;
      const g = S('g', null, svg);
      if (two) {
        const gap = 34, pw = (W - gap) / 2;
        panelPosix(g, 0, 0, pw);
        panelCuda(g, pw + gap, 0, pw);
        tx(g, pw + gap / 2, PH / 2, 'vs', { fill: 'var(--ink-3)', size: 11, anchor: 'middle' });
        svg.setAttribute('viewBox', `0 0 ${W} ${PH}`);
      } else {
        panelPosix(g, 0, 0, W);
        panelCuda(g, 0, PH + 10, W);
        svg.setAttribute('viewBox', `0 0 ${W} ${PH * 2 + 10}`);
      }
      parts = $$(svg, '[data-k]');
      apply();
    }
    function apply() {
      const k = hover || sel;
      parts.forEach((p) => { p.style.opacity = p.getAttribute('data-k').split(' ').includes(k) ? '1' : '0.34'; });
      f.setWhy(WHY[k]);
    }
    svg.addEventListener('pointerover', (e) => {
      const g = e.target.closest && e.target.closest('[data-k]');
      const k = g ? g.getAttribute('data-k').split(' ')[0] : null;
      if (k !== hover && (e.pointerType === 'mouse' || e.pointerType === 'pen')) { hover = k; apply(); }
    });
    svg.addEventListener('pointerleave', () => { if (hover) { hover = null; apply(); } });
    svg.addEventListener('click', (e) => {
      const g = e.target.closest && e.target.closest('[data-k]');
      if (!g) return;
      const k = g.getAttribute('data-k').split(' ')[0];
      sel = k; hover = null;
      const segBtn = f.controls.querySelector(`button[data-value="${k}"]`);
      if (segBtn) segBtn.click(); else apply();
    });
    onWidth(wrap, draw);
  }

  /* Fig: thirty-two threads, one program counter */
  function threadLockstep(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Thirty-two threads, one program counter',
      hint: 'step through · pick a thread',
      wide: true,
      caption: 'One warp (threads 0 to 31 of block 2, with blockDim.x = 64) runs the kernel above. The PC marker is shared: every thread is on the same line. Each column is one thread with its own registers. The unit row shows what the warp’s instruction occupies, step by step in time: line 2’s integer multiply-add (<code>IMAD</code>) runs at 16 results per clock per sub-partition, NVIDIA’s documented rate, so it covers the 32 threads in two passes, lanes 0 to 15 and then 16 to 31; line 4’s floating-point multiply-add gets one FP32 CUDA Core per thread, one pass; loads and stores go through the load/store units (pink) and then wait on memory. The kernel and its input values are ours, for illustration; one source line compiles to one or more machine instructions.' + (NARROW ? ' On a narrow screen the code’s comments move into the detail line, and an 8-thread window around the chosen thread shows the register values.' : ''),
    });
    f.root.classList.add('dsb-fig-code');
    const cs = splitComments(AXPB);
    const code = GG.code(f.stage, { lang: 'cuda', code: cs.code, caption: 'beyond the glossary: a small kernel to watch', copy: false });
    const wrap = el('div', { class: 'dsb-w', style: 'margin-top:12px' });
    f.stage.append(wrap);
    const svg = S('svg', { class: 'dsb-svg', role: 'img', 'aria-label': 'Thirty-two thread columns sharing one program counter marker, with per-thread register cells for i, v and r, a row of execution units that fills pass by pass, and a memory row for loads and stores.' }, wrap);
    const detail = el('div', { class: 'dsb-detail', 'aria-live': 'polite' });
    f.stage.append(detail);

    const BLOCK = 2, BDIM = 64;
    const xval = (i) => (((i * 7) % 11) - 5) / 2;
    const STEPS = [
      { label: 'Start', line: 2, tone: 'control' },
      { label: 'Line 2: IMAD, pass 1 (lanes 0–15)', line: 2, tone: 'core' },
      { label: 'Line 2: IMAD, pass 2 (lanes 16–31)', line: 2, tone: 'core' },
      { label: 'Line 3: load issued', line: 3, tone: 'memory' },
      { label: 'Line 3: data arrives', line: 3, tone: 'memory' },
      { label: 'Line 4: multiply-add', line: 4, tone: 'core' },
      { label: 'Line 5: store', line: 5, tone: 'memory' },
    ];
    let step = 0, lane = 5, W = 0;
    const stPC = GG.ui.stat(f.readouts, { label: 'PC at', value: 'line 2', tone: 'control' });
    const stCores = GG.ui.stat(f.readouts, { label: 'units busy', value: 'none', tone: 'core' });
    const stClk = GG.ui.stat(f.readouts, { label: 'instructions issued', value: '0', tone: 'control' });
    GG.ui.stepper(f.controls, { label: 'Step', steps: STEPS, autoplay: 1500, onStep: (i) => { step = i; paint(); } });
    const sl = GG.ui.slider(f.controls, { label: 'Inspect thread', min: 0, max: 31, value: lane, format: (v) => 'threadIdx.x = ' + v, onInput: (v) => { lane = v; paint(); } });

    /* What each register cell holds at the current step: k = 0 (i), 1 (v), 2 (r); j = lane. */
    function cellState(k, j) {
      if (k === 0) return { has: step >= 2 || (step === 1 && j < 16), fresh: (step === 1 && j < 16) || (step === 2 && j >= 16), wait: false };
      if (k === 1) return { has: step >= 4, fresh: step === 4, wait: step === 3 };
      return { has: step >= 5, fresh: step === 5, wait: false };
    }
    const cellFill = (c) => (c.wait ? 'var(--control-a)' : c.has ? (c.fresh ? 'rgba(111,166,255,0.45)' : 'var(--memory-a)') : 'none');
    const cellStroke = (c) => (c.wait ? 'var(--control)' : c.has ? 'var(--memory)' : 'var(--line-2)');

    const WHY = [
      'Before line 2 runs, all 32 threads of the warp stand at the same instruction. Each can read its own <code>threadIdx.x</code> (0 to 31 here), but nothing is computed yet.',
      `The warp is issued line 2 <b>once</b>, and all 32 threads execute it: each computes its own <code>i</code> from <code>blockIdx.x</code>, <code>blockDim.x</code> and its own <code>threadIdx.x</code>, into its own register. Same instruction, 32 different results. It compiles to one integer multiply-add (<code>IMAD</code>), and NVIDIA’s <a href="${REF_BPG_ARITH}">Best Practices Guide</a> lists 32-bit integer multiply-add at 64 results per clock per SM on an H100, half the FP32 rate: 16 per sub-partition per clock. So the hardware covers the warp in two passes. <b>Pass 1: lanes 0–15</b>.`,
      '<b>Pass 2: lanes 16–31</b> get their <code>i</code>. This is still the one instruction from the previous step, finishing; nothing new was issued. Now all 32 threads hold different values of <code>i</code>.',
      `Line 3: the warp is issued one load. The ${T('load-store-unit', 'load/store units')} (pink) take the 32 addresses <code>x[i]</code>, one per thread, and send the requests to ${T('global-memory', 'global memory')}. Each thread’s <code>v</code> register is waiting (amber): the data takes hundreds of cycles to come back, and line 4 needs it, so this warp is ${T('warp-execution-state', 'stalled')}.`,
      `The data arrives, and each thread’s <code>v</code> register fills with its own element. While this warp waited, its ${T('warp-scheduler', 'warp scheduler')} could issue instructions from other warps instead: ${T('latency-hiding', 'latency hiding')}.`,
      `Line 4: one floating-point multiply-add (<code>FFMA</code>) is issued to the warp, and 32 ${T('cuda-core', 'CUDA Cores')} (FP32 units) execute it, one per thread, each on that thread’s own <code>v</code>: a single pass.`,
      'Line 5: each thread stores its own <code>r</code> to <code>y[i]</code>, again through the load/store units. This warp is done; the other warp of the block runs the same lines for threads 32 to 63.',
    ];

    function draw(w) {
      W = w;
      clear(svg);
      const LW = W < 480 ? 46 : 64;
      const x0 = LW, x1 = W - 4;
      const p = (x1 - x0) / 32;
      const showVals = p >= 25;
      const zoom = !showVals;
      const H = 206 + (zoom ? 128 : 0);
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const g = S('g', null, svg);
      const cx = (j) => x0 + p * j + p / 2;
      const ls = W < 480 ? 10 : 10.5;
      const labs = [['PC', 16, 'var(--control)'], ['thread', 44, 'var(--ink-3)'], ['i', 92, 'var(--memory)'], ['v', 114, 'var(--memory)'], ['r', 136, 'var(--memory)'], ['memory', 190, 'var(--memory)']];
      labs.forEach(([t, y, c]) => tx(g, 2, y, t, { fill: c, size: ls }));
      svg._unitLab = tx(g, 2, 162, 'units', { fill: 'var(--core)', size: ls });
      svg._pcBar = rect(g, x0, 8, x1 - x0, 10, { rx: 5, fill: 'var(--control-a)', stroke: 'var(--control)' });
      svg._pcText = tx(g, (x0 + x1) / 2, 17, '', { fill: 'var(--ink)', size: 10, anchor: 'middle' });
      svg._strands = []; svg._cells = []; svg._vals = []; svg._cores = []; svg._hit = [];
      for (let j = 0; j < 32; j++) {
        const x = cx(j);
        svg._strands.push(path(g, strandD(x, 26, 60, Math.min(2, p * 0.18), 1.5), { stroke: 'var(--ink-3)', sw: 1.2, cap: 'round' }));
        if (j % (p < 14 ? 8 : 4) === 0 || j === 31) tx(g, x, 74, String(j), { fill: 'var(--ink-3)', size: 10, anchor: 'middle' });
        const col = [];
        const vcol = [];
        [80, 102, 124].forEach((y) => {
          col.push(rect(g, x0 + p * j + 1, y, p - 2, 17, { rx: 2, fill: 'none', stroke: 'var(--line-2)' }));
          vcol.push(showVals ? tx(g, x, y + 12, '', { fill: 'var(--ink)', size: 10, anchor: 'middle' }) : null);
        });
        svg._cells.push(col); svg._vals.push(vcol);
        svg._cores.push(rect(g, x0 + p * j + 1, 150, p - 2, 17, { rx: 2, fill: 'none', stroke: 'var(--line-2)' }));
        const hit = rect(g, x0 + p * j, 24, p, 150, { rx: 0, fill: 'transparent', cls: 'dsb-hit' });
        hit.addEventListener('click', () => { lane = j; sl.set(j, false); paint(); });
        svg._hit.push(hit);
      }
      // the load/store units: one shared block, not one unit per lane
      svg._lsu = rect(g, x0 + 1, 150, x1 - x0 - 2, 17, { rx: 4, fill: 'var(--special-a)', stroke: 'var(--special)', opacity: 0 });
      svg._lsuT = tx(g, (x0 + x1) / 2, 162, '', { fill: 'var(--ink)', size: 10, anchor: 'middle' });
      svg._sel = rect(g, 0, 22, p, 150, { rx: 3, fill: 'none', stroke: 'var(--accent)', sw: 1.4 });
      svg._mem = rect(g, x0, 178, x1 - x0, 18, { rx: 4, fill: 'none', stroke: 'var(--line-2)' });
      svg._memText = tx(g, (x0 + x1) / 2, 191, '', { fill: 'var(--ink)', size: 10, anchor: 'middle' });
      svg._p = p; svg._x0 = x0;
      svg._zoom = null;
      if (zoom) {
        // an 8-thread window around the chosen thread, large enough to read the values
        const zy = 214;
        const win = rect(g, 0, 22, 8 * p, 176, { rx: 3, fill: 'rgba(255,138,91,0.06)', stroke: 'rgba(255,138,91,0.5)', dash: '3 2' });
        const zp = (x1 - x0) / 8;
        const zt = tx(g, 2, zy + 10, '', { fill: 'var(--ink-2)', size: 10 });
        const zl = [['thread', zy + 34, 'var(--ink-3)'], ['i', zy + 58, 'var(--memory)'], ['v', zy + 82, 'var(--memory)'], ['r', zy + 106, 'var(--memory)']];
        zl.forEach(([t, y, c]) => tx(g, 2, y, t, { fill: c, size: 10 }));
        const cols = [];
        for (let q = 0; q < 8; q++) {
          const zx = x0 + zp * q;
          const head = tx(g, zx + zp / 2, zy + 34, '', { fill: 'var(--ink-2)', size: 10, anchor: 'middle' });
          const box = rect(g, zx + 1, zy + 20, zp - 2, 20, { rx: 3, fill: 'none', stroke: 'none' });
          const cells = [], texts = [];
          [zy + 44, zy + 68, zy + 92].forEach((y) => {
            cells.push(rect(g, zx + 1.5, y, zp - 3, 20, { rx: 3, fill: 'none', stroke: 'var(--line-2)' }));
            texts.push(tx(g, zx + zp / 2, y + 14, '', { fill: 'var(--ink)', size: 10.5, anchor: 'middle' }));
          });
          const hz = rect(g, zx, zy + 20, zp, 96, { rx: 0, fill: 'transparent', cls: 'dsb-hit' });
          hz.addEventListener('click', () => { const j = svg._zoom.start + q; lane = j; sl.set(j, false); paint(); });
          cols.push({ head, box, cells, texts });
        }
        svg._zoom = { win, zt, cols, start: 0 };
      }
      paint();
    }
    function paint() {
      if (!svg._cells) return;
      const s = STEPS[step];
      code.clear();
      code.highlight(s.line, s.tone);
      stPC.set('line ' + s.line);
      const intOp = step === 1 || step === 2, fpOp = step === 5;
      const lsu = step === 3 || step === 6, wait = step === 4;
      const lab = stCores.el.querySelector('i');
      if (intOp) { lab.textContent = 'integer multiply-add · 16 per clock'; stCores.set(`pass ${step} / 2 · lanes ${step === 1 ? '0–15' : '16–31'}`, 'core'); }
      else if (fpOp) { lab.textContent = 'FP32 CUDA Cores busy'; stCores.set('32 / 32 · 1 pass', 'core'); }
      else if (lsu) { lab.textContent = 'load/store units'; stCores.set(step === 3 ? '32 load addresses' : '32 store addresses', 'special'); }
      else if (wait) { lab.textContent = 'execution units'; stCores.set('none: data in flight', 'memory'); }
      else { lab.textContent = 'execution units busy'; stCores.set('none', 'core'); }
      // one issue each for lines 2, 3, 4 and 5 (the two IMAD passes are one instruction)
      stClk.set(String(step >= 6 ? 4 : step >= 5 ? 3 : step >= 3 ? 2 : step >= 1 ? 1 : 0));
      svg._unitLab.textContent = intOp ? 'IMAD' : fpOp ? 'FP32' : lsu ? 'LD/ST' : 'units';
      svg._unitLab.style.fill = lsu ? 'var(--special)' : 'var(--core)';
      svg._pcText.textContent = step === 0 ? 'all 32 threads: next is line 2' : `all 32 threads: line ${s.line}`;
      for (let j = 0; j < 32; j++) {
        const i = BLOCK * BDIM + j, v = xval(i), r = 2 * v + 1;
        const vals = [String(i), num1(v), num1(r)];
        svg._cells[j].forEach((c, k) => {
          const st = cellState(k, j);
          c.setAttribute('fill', cellFill(st));
          c.setAttribute('stroke', cellStroke(st));
          const t = svg._vals[j][k];
          if (t) t.textContent = st.has ? vals[k] : '';
        });
        const core = svg._cores[j];
        const on = fpOp || (step === 1 && j < 16) || (step === 2 && j >= 16);
        const did = step === 2 && j < 16; // finished in pass 1
        core.setAttribute('fill', on ? 'var(--core)' : 'none');
        core.setAttribute('stroke', on || did ? 'var(--core)' : 'var(--line-2)');
        core.setAttribute('stroke-dasharray', did ? '2 2' : 'none');
        core.setAttribute('opacity', lsu ? '0' : on ? '0.85' : '1');
        svg._strands[j].setAttribute('stroke', j === lane ? 'var(--accent)' : 'var(--ink-3)');
        svg._strands[j].setAttribute('stroke-width', j === lane ? '2' : '1.2');
      }
      svg._lsu.setAttribute('opacity', lsu ? '1' : '0');
      svg._lsuT.textContent = lsu ? (svg._p < 14 ? (step === 3 ? 'LD/ST: 32 addresses out' : 'LD/ST: 32 stores out') : (step === 3 ? 'load/store units: 32 addresses → memory' : 'load/store units: 32 values → memory')) : '';
      svg._sel.setAttribute('x', r1(svg._x0 + svg._p * lane));
      const memOn = lsu || wait;
      svg._mem.setAttribute('fill', memOn ? 'var(--memory-a)' : 'none');
      svg._mem.setAttribute('stroke', memOn ? 'var(--memory)' : 'var(--line-2)');
      const nar = svg._p < 14;
      svg._memText.textContent = step === 3 ? (nar ? 'x[128] … x[159] requested' : '32 loads requested: x[128] … x[159] · hundreds of cycles away')
        : step === 4 ? (nar ? 'x[128] … x[159] → v' : 'the data returns: x[128] … x[159] → each thread’s v')
        : step === 6 ? (nar ? 'registers → y[128] … y[159]' : '32 stores: registers → y[128] … y[159]')
        : nar ? 'global memory' : 'global memory (GPU RAM): idle on this line';
      svg._memText.style.fill = memOn ? 'var(--ink)' : 'var(--ink-3)';
      const Z = svg._zoom;
      if (Z) {
        const st0 = clamp(lane - 3, 0, 24);
        Z.start = st0;
        Z.win.setAttribute('x', r1(svg._x0 + svg._p * st0));
        Z.zt.textContent = `threads ${st0}–${st0 + 7}, zoomed: same instruction, different values`;
        Z.cols.forEach((col, q) => {
          const j = st0 + q, i = BLOCK * BDIM + j, v = xval(i), r = 2 * v + 1;
          const vals = [String(i), num1(v), num1(r)];
          col.head.textContent = String(j);
          col.head.style.fill = j === lane ? 'var(--accent)' : 'var(--ink-2)';
          col.box.setAttribute('stroke', j === lane ? 'var(--accent)' : 'none');
          col.cells.forEach((c, k) => {
            const st = cellState(k, j);
            c.setAttribute('fill', cellFill(st));
            c.setAttribute('stroke', cellStroke(st));
            col.texts[k].textContent = st.has ? vals[k] : st.wait ? '…' : '';
          });
        });
      }
      const i = BLOCK * BDIM + lane, v = xval(i), r = 2 * v + 1;
      const iSt = cellState(0, lane);
      const parts = [`<b class="a">thread threadIdx.x = ${lane}</b> <span class="dim">(lane ${lane} of warp 0, block ${BLOCK})</span>`];
      parts.push(iSt.has ? `<span class="m">i</span> = ${BLOCK} × ${BDIM} + ${lane} = <b>${i}</b>` : step === 1 ? '<span class="m">i</span> <span class="dim">comes in pass 2 (lanes 16–31)</span>' : '<span class="m">i</span> <span class="dim">not yet computed</span>');
      parts.push(step >= 4 ? `<span class="m">v</span> = x[${i}] = <b>${num1(v)}</b>` : step === 3 ? `<span class="k">v</span> <span class="dim">requested from x[${i}], waiting</span>` : '<span class="m">v</span> <span class="dim">not yet loaded</span>');
      parts.push(step >= 5 ? `<span class="m">r</span> = 2 × ${v < 0 ? '(' + num1(v) + ')' : num1(v)} + 1 = <b>${num1(r)}</b>` : '<span class="m">r</span> <span class="dim">—</span>');
      if (step >= 6) parts.push(`y[${i}] ← <b>${num1(r)}</b>`);
      const cm = cs.comments[s.line];
      detail.innerHTML = (cm && step > 0 ? `<span class="dim">line ${s.line}: ${esc(cm)}</span><br>` : '') + parts.join(' &nbsp;·&nbsp; ');
      f.setWhy(WHY[step]);
    }
    onWidth(wrap, draw);
  }

  /* Fig: registers, spills and the stack in local memory */
  function threadSpill(host, ctx) {
    const f = ctx.figure(host, {
      title: 'When a thread runs out of registers',
      hint: 'drag the slider · pick a cap',
      wide: true,
      controlsFirst: true,
      caption: 'A model of one thread. Each value the thread needs to keep at the same time takes one 32-bit register, up to the cap the compiler works under: 255 is the most an H100 thread may use, and <code>nvcc --maxrregcount</code> or <code>__launch_bounds__</code> can lower it. Values beyond the cap are spilled to the thread’s stack in local memory, which lives in GPU RAM and is cached in L1 and L2: a store when the value is spilled (<code>STL</code> in SASS), a load each time it is needed again (<code>LDL</code>). A non-inlined call adds a stack frame there too (amber; its size here is illustrative). Real compilers also need registers for addresses and loop counters, so they spill sooner than this; <code>ptxas -v</code> reports the result as “bytes stack frame, bytes spill stores, bytes spill loads” and the registers used. The last readout shows the other side of the trade: registers are handed out per warp in units of 256 (8 per thread), and the fewer each thread takes, the more warps fit in the SM’s 65,536.',
    });
    let live = 80, cap = 64, call = false, loads = 0;
    const sl = GG.ui.slider(f.controls, { label: 'Live values per thread', min: 8, max: 320, step: 1, value: live, format: (v) => String(v), onInput: (v) => { live = v; loads = 0; draw(); } });
    void sl;
    GG.ui.seg(f.controls, {
      label: 'Register cap per thread', value: cap,
      options: [{ value: 255, label: '255 (the maximum)' }, { value: 128, label: '128' }, { value: 64, label: '64' }, { value: 32, label: '32' }],
      onChange: (v) => { cap = v; loads = 0; draw(); },
    });
    const row = el('div', { class: 'dsb-flex' });
    f.controls.append(row);
    GG.ui.toggle(row, { label: 'a non-inlined call in flight', value: call, onChange: (v) => { call = v; draw(); } });
    const useBtn = GG.ui.button(row, { icon: 'play', label: 'Use a spilled value', onClick: () => useSpilled() });
    const stR = GG.ui.stat(f.readouts, { label: 'registers used', value: '', tone: 'memory' });
    const stS = GG.ui.stat(f.readouts, { label: 'values spilled', value: '', tone: 'danger' });
    const stB = GG.ui.stat(f.readouts, { label: 'local memory · this thread', value: '', tone: 'memory' });
    const stL = GG.ui.stat(f.readouts, { label: 'reloads from local memory', value: '0', tone: 'danger' });
    const stW = GG.ui.stat(f.readouts, { label: 'warps per SM, by registers', value: '', tone: 'control' });
    const wrap = el('div', { class: 'dsb-w' });
    f.stage.append(wrap);
    const svg = S('svg', { class: 'dsb-svg', role: 'img', 'aria-label': 'One thread’s registers drawn as a grid of cells up to the register cap, filled in blue for values in use, above a box for the thread’s stack in local memory in GPU RAM, holding the spilled values outlined in red and, optionally, a call frame.' }, wrap);
    let W = 0, G = null, tok = null;
    const frameCells = 8; // a call frame, drawn as 8 words (illustrative)
    const anim = GG.anim(wrap, (t, dt) => {
      if (!tok) { anim.stop(); return; }
      tok.t += dt / 0.9;
      placeTok();
      if (tok.t >= 1) { tok.el.setAttribute('opacity', '0'); tok = null; anim.stop(); }
    }, { autostart: false });
    function placeTok() {
      if (!tok || !G) return;
      const u = Math.min(1, tok.t), e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
      const x = tok.x0 + (tok.x1 - tok.x0) * e, y = tok.y0 + (tok.y1 - tok.y0) * e;
      tok.el.setAttribute('transform', `translate(${r1(x)},${r1(y)})`);
      tok.el.setAttribute('opacity', '1');
    }
    function useSpilled() {
      const spill = Math.max(0, live - cap);
      if (!spill || !G) { f.setWhy(spill ? '' : `Nothing is spilled: all ${plural(live, 'value')} fit in ${plural(cap, 'register')}. Push the slider past the cap, or pick a lower cap.`); return; }
      loads++;
      stL.set(fmt.int(loads), 'danger');
      const k = (loads - 1) % spill;
      const src = G.spillXY(k), dst = G.regXY(Math.min(cap, live) - 1);
      tok = { t: 0, x0: src.x, y0: src.y, x1: dst.x, y1: dst.y, el: G.tok };
      if (GG.reducedMotion) { tok.t = 1; placeTok(); G.tok.setAttribute('opacity', '1'); tok = null; }
      else { placeTok(); anim.start(); }
      f.setWhy(`<b>Reload ${loads}.</b> To use spilled value ${k + 1}, the thread first loads it back from local memory into a register (<code>LDL</code>), moving another value out if every register is busy. If the line is still in L1 that is fairly quick; if it has to come from GPU RAM it takes hundreds of cycles. Each use of a spilled value pays this again, which is why high-performance kernels avoid spilling.`);
    }
    function draw(w) {
      if (w) W = w;
      if (!W) return;
      clear(svg);
      const used = Math.min(live, cap), spill = Math.max(0, live - cap);
      const per = 32;
      const cw = Math.min(16, (W - 8) / per), ch = Math.min(14, Math.max(9, cw));
      const g = S('g', null, svg);
      const nar = W < 560;
      let y = 0;
      tx(g, 0, y + 12, nar ? `registers · cap ${cap}` : `thread 5’s registers (in the SM’s register file) · cap ${cap}`, { fill: 'var(--memory)', size: 11, weight: 600 });
      tx(g, W, y + 12, `${used} / ${cap} used`, { fill: 'var(--ink-2)', size: 10.5, anchor: 'end' });
      y += 20;
      const ry0 = y;
      const regRows = Math.ceil(cap / per);
      const regXY = (k) => ({ x: (k % per) * cw + cw / 2, y: ry0 + Math.floor(k / per) * (ch + 2) + ch / 2 });
      for (let k = 0; k < cap; k++) {
        const on = k < used;
        rect(g, (k % per) * cw + 0.5, ry0 + Math.floor(k / per) * (ch + 2), cw - 1, ch, { rx: 1.5, fill: on ? 'var(--memory)' : 'none', stroke: on ? 'none' : 'var(--line-2)', opacity: on ? 0.8 : 1 });
      }
      y = ry0 + regRows * (ch + 2) + 8;
      // the trip between them
      const ax = Math.min(W * 0.25, 120);
      const gap = 44;
      const midY = y + gap / 2;
      line(g, ax, y + 2, ax, y + gap - 6, { stroke: spill ? 'var(--danger)' : 'var(--line-2)', sw: 1.4, dash: '3 3' });
      arrowHead(g, ax, y + gap - 2, 0, 1, spill ? 'var(--danger)' : 'var(--line-2)', 4);
      tx(g, ax + 8, midY - 3, nar ? 'spill: STL' : 'spill: store (STL)', { fill: spill ? 'var(--danger)' : 'var(--ink-3)', size: 10 });
      const bx = ax + (nar ? 110 : 160);
      line(g, bx, y + gap - 2, bx, y + 6, { stroke: spill ? 'var(--memory)' : 'var(--line-2)', sw: 1.4, dash: '3 3' });
      arrowHead(g, bx, y + 2, 0, -1, spill ? 'var(--memory)' : 'var(--line-2)', 4);
      tx(g, bx + 8, midY + 9, nar ? 'reload: LDL' : 'reload: load (LDL), each use', { fill: spill ? 'var(--memory)' : 'var(--ink-3)', size: 10 });
      y += gap;
      // local memory
      const nLocal = spill + (call ? frameCells : 0);
      const locRows = Math.max(1, Math.ceil(nLocal / per));
      const boxH = 30 + locRows * (ch + 2) + 8;
      rect(g, 0.5, y + 0.5, W - 1, boxH, { rx: 8, fill: 'rgba(111,166,255,0.06)', stroke: 'rgba(111,166,255,0.5)', dash: '4 3' });
      tx(g, 8, y + 16, nar ? 'local memory: GPU RAM, cached in L1/L2' : 'thread 5’s stack in local memory · lives in GPU RAM, cached in L1 and L2', { fill: 'var(--ink-2)', size: 10.5 });
      if (call) tx(g, W - 8, y + 16, nar ? 'amber: call' : 'amber: the call’s frame', { fill: 'var(--control)', size: 10, anchor: 'end' });
      const ly0 = y + 24;
      const spillXY = (k) => ({ x: 4 + (k % per) * ((W - 8) / per) + ((W - 8) / per) / 2, y: ly0 + Math.floor(k / per) * (ch + 2) + ch / 2 });
      const lw = (W - 8) / per;
      for (let k = 0; k < nLocal; k++) {
        const isFrame = k >= spill;
        rect(g, 4 + (k % per) * lw + 0.5, ly0 + Math.floor(k / per) * (ch + 2), lw - 1, ch, { rx: 1.5, fill: isFrame ? 'var(--control-a)' : 'var(--danger-a)', stroke: isFrame ? 'var(--control)' : 'var(--danger)', sw: 1 });
      }
      if (!nLocal) tx(g, 8, ly0 + ch - 2, 'empty: nothing spilled', { fill: 'var(--ink-3)', size: 10 });
      y += boxH + 4;
      svg.setAttribute('viewBox', `0 0 ${W} ${r1(y)}`);
      // the travelling value (on top)
      const tk = S('g', { opacity: 0 }, svg);
      rect(tk, -cw / 2, -ch / 2, cw, ch, { rx: 2, fill: 'var(--memory)', stroke: 'var(--accent)', sw: 1.5 });
      G = { regXY, spillXY, tok: tk };
      // readouts
      const regsAlloc = Math.ceil(used / 8) * 8;
      const warpsFit = Math.min(64, Math.floor(65536 / (regsAlloc * 32)));
      stR.set(`${used} / ${cap}`);
      stS.set(fmt.int(spill), spill ? 'danger' : 'core');
      stB.set(fmt.int(4 * nLocal) + ' bytes', nLocal ? 'memory' : 'core');
      stL.set(fmt.int(loads), loads ? 'danger' : 'core');
      stW.set(`${warpsFit} / 64`);
      useBtn.disabled = !spill;
      const fitS = `With ${plural(used, 'register')} each (rounded up to ${regsAlloc}), ${plural(warpsFit, 'warp')} of this kernel fit in the SM’s 65,536 registers${warpsFit === 64 ? ', every warp slot' : ''}.`;
      if (!spill) f.setWhy(`All <b>${plural(live, 'live value')}</b> fit under the cap of ${cap}, so nothing spills: every operand is read straight from a register.${call ? ' The non-inlined call still needs a stack frame in local memory (amber).' : ''} ${fitS}`);
      else f.setWhy(`<b>${plural(live, 'live value')}</b> but a cap of ${cap}: the compiler keeps ${cap} in registers and spills <b>${spill}</b> to local memory, ${fmt.int(4 * spill)} bytes for this thread (and the same for every other thread). Each spilled value costs a store now and a load every time it is used again; press “Use a spilled value”. ${fitS}${cap < 255 ? ' A lower cap lets more warps fit, at the price of spills: a real trade-off compilers and programmers weigh.' : ''}`);
    }
    onWidth(wrap, draw);
  }

  GG.entry('thread', {
    render(body, ctx) {
      const s = ctx.html(body, `
<p>A <strong>thread of execution</strong>, or <strong>thread</strong> for short, is the lowest unit of programming for GPUs. It is the base and atom of the ${T('cuda-programming-model', 'CUDA programming model')}’s ${T('thread-hierarchy', 'thread hierarchy')}: threads are grouped into ${T('thread-block', 'thread blocks')}, and blocks into a ${T('thread-block-grid', 'grid')}, but nothing sits below a thread. A thread is one stream of instructions, running with its own ${T('registers', 'registers')}, but little else.</p>
<p>In the map below, threads sit at the top left and are drawn as wavy strands. On the hardware side they are mapped onto the ${T('core', 'cores')} of a ${T('streaming-multiprocessor', 'Streaming Multiprocessor')} (SM): a thread runs on a ${T('cuda-core', 'CUDA Core')}, and its registers live in the SM’s ${T('register-file', 'register file')}.</p>
<div data-slot="map" class="wide"></div>
<h3>What a program targets</h3>
<p>Both ${T('streaming-assembler', 'SASS')} and ${T('parallel-thread-execution', 'PTX')} programs target threads. A PTX or SASS program is written from the point of view of one thread: it says what a single thread does, step by step, and the GPU runs that program once for every thread in the launch. Each copy works out which data is its own by reading its thread index (<code>%tid</code> in PTX, <code>threadIdx</code> in ${T('cuda-c', 'CUDA C++')}).</p>
<p>Compare this to a typical C program in a POSIX environment, the operating-system interface that Linux and macOS follow. It targets a <em>process</em>, itself a collection of one or more threads. The process is the operating system’s container: it owns the address space, the heap and the open files, and its threads share them.</p>
<p>Unlike POSIX threads, CUDA threads are not used to make syscalls. A system call (syscall) is how a CPU program asks the operating system kernel to do something privileged, such as opening a file, mapping memory or sending a packet. A CUDA thread never does this. Anything that needs the operating system happens on the host, the CPU, before or after the GPU work. Fig. 2 puts the two kinds of thread side by side.</p>
<div data-slot="cmp" class="wide"></div>
${GG.noteHTML('beyond', `<p><b>What about <code>printf</code> in a kernel?</b> It does not make a syscall either. Device-side <code>printf</code> writes its arguments into a buffer in GPU memory, and, as NVIDIA’s CUDA C++ Programming Guide puts it, “final formatting of the <code>printf()</code> output takes place on the host system”, which then prints it. Device-side <code>malloc</code> is similar: it hands out pieces of a heap that was set aside in GPU memory in advance, with no operating system involved.</p>`)}
<h3>A private program counter, used in lock-step</h3>
<p>Like a thread on a CPU, a GPU thread can have a private instruction pointer, also called the program counter (PC): the address of the next instruction the thread will run. However, for performance reasons, GPU programs are generally written so that all the threads in a ${T('warp', 'warp')} share the same instruction pointer, executing instructions in lock-step. A warp is a group of 32 threads that the hardware schedules together. Its ${T('warp-scheduler', 'Warp Scheduler')} issues one instruction, and all 32 threads execute it together, each on its own data. For 32-bit floating-point math an H100 has a core for every lane, so a warp’s FP32 instruction is done in one pass. Other work runs at lower rates: in NVIDIA’s <a href="${REF_BPG_ARITH}">table of instruction throughputs</a>, double precision runs at 64 results per clock per SM (16 per sub-partition) and the special function unit’s approximate <code>sin</code>, <code>exp2</code> and reciprocal at 16 per SM (4 per sub-partition), so those instructions take several cycles to cover all 32 threads. Step through Fig. 3 to watch one warp do this; its integer multiply-add takes two passes.</p>
<div data-slot="lock" class="wide"></div>
<p>A single ${T('cuda-core', 'CUDA Core')} executes instructions from a single thread. In Fig. 3 that is the unit row: when the warp is issued the floating-point multiply-add, 32 cores each run it for one thread. An H100 SM has four sub-partitions with 32 FP32 CUDA Cores each, one per thread of a warp.</p>
${GG.noteHTML('beyond', `<p><b>Which units run line 2?</b> Not the INT32 units, as you might guess. NVIDIA’s <a href="${REF_NCU_PIPES}">Nsight Compute profiling guide</a> lists the SM’s pipelines: the ALU pipeline “executes integer instructions, excluding IMAD and IMUL”, and the FMA pipeline, the one that does FP32 arithmetic, “also performs integer multiplication operations (IMUL, IMAD)”. So the two passes in Fig. 3 come from the integer multiply-add’s documented rate, 64 results per clock per SM, not from counting INT32 units. Integer adds, which do run on the ALU pipeline, are listed at the same 64 per clock per SM for compute capability 9.0, the H100’s, in NVIDIA’s <a href="${REF_BPG_ARITH}">throughput table</a>; only Maxwell and some Pascal GPUs list 128.</p>`)}
<p>When threads of one warp need different instructions, for example on the two sides of an <code>if</code>, they can no longer share a PC. The warp then runs each path in turn while the threads on the other path sit idle, which is called ${T('warp-divergence', 'warp divergence')} and is the reason lock-step matters for performance.</p>
${GG.noteHTML('history', `<p><b>How private is the PC, really?</b> NVIDIA’s <a href="https://docs.nvidia.com/cuda/parallel-thread-execution/index.html#independent-thread-scheduling">PTX ISA documentation</a> explains that on architectures before Volta (2017), a warp had a single program counter shared by all 32 threads, plus an “active mask” saying which threads were on the current path. Starting with Volta, <em>Independent Thread Scheduling</em> keeps execution state per thread, “including a program counter and call stack”, and a schedule optimizer groups the active threads of a warp back together into SIMT units. So today each thread really does own a PC; keeping them equal is what makes a warp fast.</p>`)}
<h3>Stacks: spills and calls</h3>
<p>Also like threads on CPUs, GPU threads have stacks, in ${T('global-memory', 'global memory')} in ${T('gpu-ram', 'GPU RAM')}. A stack is a region of memory used last-in, first-out, and a thread’s stack holds two kinds of things:</p>
<ul>
<li><strong>Spilled registers.</strong> When a thread needs more live values than the compiler can fit in its registers, some are <em>spilled</em>: stored to the stack and loaded back when needed.</li>
<li><strong>A function call stack.</strong> Return addresses and local variables for function calls that the compiler did not inline.</li>
</ul>
<p>High-performance ${T('kernel', 'kernels')} generally limit use of both. Registers sit right next to the cores; GPU RAM is off-chip, and a trip there takes hundreds of clock cycles. Every spill turns a register access into a memory access. Fig. 4 lets you push a thread past its register budget and watch the spills, and the call frame, land on its stack.</p>
<div data-slot="spill" class="wide"></div>
${GG.noteHTML('beyond', `<p><b>“Local memory.”</b> CUDA’s name for this per-thread memory is <em>local memory</em>: local in scope, but, in the Programming Guide’s words, it “resides in device memory, so local memory accesses have the same high latency and low bandwidth as global memory accesses”. Like global memory, it is cached in L1 and L2 on current GPUs, including the H100 (NVIDIA’s Best Practices Guide notes that only compute capability 5.x devices cache it in L2 alone), so a few spills can stay on chip; heavy spilling still reaches GPU RAM. Compiling with <code>nvcc --ptxas-options=-v</code> reports each kernel’s registers and its local memory (<code>lmem</code>), so you can see whether anything spilled. On an H100 a thread may use at most 255 registers.</p>`)}
<div data-slot="nums"></div>
<div data-slot="read"></div>`);

      guard(s.map, 'Programming model map', () => modelMapFigure(s.map, ctx, {
        title: 'Threads in the thread hierarchy, and on the hardware',
        highlight: ['thread', 'registers'],
        caption: `Threads are the lowest level of the thread group hierarchy (top left) and are mapped onto the cores of a Streaming Multiprocessor (top right). ${MAP_CREDIT} Hover or tap any level to light up its counterpart.`,
      }));
      guard(s.cmp, 'Thread comparison', () => threadCompare(s.cmp, ctx));
      guard(s.lock, 'Lock-step warp', () => threadLockstep(s.lock, ctx));
      guard(s.spill, 'Register spills', () => threadSpill(s.spill, ctx));
      ctx.numbers(s.nums, [
        { value: '1', label: 'thread per CUDA Core: a core executes one thread’s instructions', tone: 'core' },
        { value: '32', label: 'threads per warp, sharing one PC in practice', tone: 'control' },
        { value: '255', label: 'registers per thread, at most, on an H100', tone: 'memory' },
        { value: '2,048', label: 'threads resident on one H100 SM at once' },
      ]);
      ctx.reading(s.read, [
        { href: REF_CUDA_REFRESHER, label: 'NVIDIA: CUDA Refresher: The CUDA Programming Model', note: 'source of the thread / block / grid diagram' },
        { href: REF_CPG_MODEL, label: 'NVIDIA: CUDA C++ Programming Guide, Programming Model', note: 'threads, blocks and grids as CUDA C++ exposes them' },
        { href: 'https://docs.nvidia.com/cuda/parallel-thread-execution/index.html#independent-thread-scheduling', label: 'NVIDIA: PTX ISA, Independent Thread Scheduling', note: 'beyond the glossary: per-thread program counters since Volta' },
        { href: REF_BPG_ARITH, label: 'NVIDIA: CUDA C++ Best Practices Guide, Arithmetic Instructions', note: 'beyond the glossary: results per clock per SM for each kind of instruction (Table 5)' },
        { href: REF_NCU_PIPES, label: 'NVIDIA: Nsight Compute Kernel Profiling Guide', note: 'beyond the glossary: which pipeline runs which instructions' },
      ]);
    },
  });

  /* ═════════════════════════════ Warp ═════════════════════════════ */

  /* Which lanes have x > 0 in the branch program (a fixed, data-dependent pattern). 18 of 32. */
  const LOOM_MASK = [1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0];
  const LOOM_PROGS = {
    straight: [
      { op: 'LDG', d: 'load x from global memory' },
      { op: 'FFMA', d: 'a = x × x + x' },
      { op: 'FMNMX', d: 'b = max(a, 1)' },
      { op: 'FADD', d: 'c = b + x' },
      { op: 'FMUL', d: 'd = c × 0.5' },
      { op: 'STG', d: 'store d to global memory' },
    ],
    branch: [
      { op: 'LDG', d: 'load x from global memory' },
      { op: 'FSETP', d: 'test: is x > 0 ?' },
      { op: 'FMUL', d: 'if:   a = x × x', m: 1 },
      { op: 'FMNMX', d: 'if:   d = max(a, 1)', m: 1 },
      { op: 'FADD', d: 'else: a = x + 1', m: -1 },
      { op: 'FMUL', d: 'else: d = a × 0.5', m: -1 },
      { op: 'STG', d: 'store d to global memory' },
    ],
  };
  const laneActive = (ins, j) => (!ins.m ? true : ins.m === 1 ? !!LOOM_MASK[j] : !LOOM_MASK[j]);

  /* Fig: the warps of whole blocks, resident on one SM, and its four schedulers picking among them */
  function warpResident(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Many warps on one SM',
      hint: 'drag the sliders · play the clock',
      wide: true,
      controlsFirst: true,
      caption: 'One H100 SM with its 64 warp slots, drawn as 16 under each of its four Warp Schedulers (amber). Each block sent to the SM is cut into warps of 32 threads, and all of a block’s warps go to this one SM: a block is never split across SMs. The SM can hold warps from several blocks at once, up to 64 warps and 32 blocks; a block that does not fit whole waits for room here or runs on another SM. On each clock, each scheduler issues an instruction for at most one of its warps (pink). Here every warp is assumed ready, and the schedulers take turns among theirs. How warps are dealt to the four schedulers is not documented by NVIDIA; we deal them out in turn.',
    });
    let tpb = 256, nb = 3, cyc = 0;
    const tones = ['#3b4262', '#4f5878', '#363d58', '#5a6386'];
    const sT = GG.ui.slider(f.controls, { label: 'Threads per block', min: 32, max: 1024, step: 32, value: tpb, format: (v) => fmt.int(v), onInput: (v) => { tpb = v; clampBlocks(); draw(); } });
    void sT;
    const sB = GG.ui.slider(f.controls, { label: 'Blocks sent to this SM', min: 1, max: 9, value: nb, format: (v) => String(v), onInput: (v) => { nb = v; draw(); } });
    const row = el('div', { class: 'dsb-flex' });
    f.controls.append(row);
    let acc = 0;
    const anim = GG.anim(f.stage, (t, dt) => { acc += dt; if (acc > 0.7) { acc = 0; cyc++; paint(); } }, { autostart: false });
    const play = GG.ui.playButton(row, anim);
    GG.ui.button(row, { icon: 'next', label: 'Next clock', onClick: () => { anim.stop(); play.sync(); cyc++; paint(); } });
    const stW = GG.ui.stat(f.readouts, { label: 'warps per block', value: '', tone: 'control' });
    const stB = GG.ui.stat(f.readouts, { label: 'blocks resident', value: '' });
    const stS = GG.ui.stat(f.readouts, { label: 'warp slots used', value: '', tone: 'control' });
    const stI = GG.ui.stat(f.readouts, { label: 'warps issued this clock', value: '', tone: 'special' });
    const fitOf = () => Math.min(32, Math.floor(64 / (tpb / 32)));
    function clampBlocks() {
      const mx = Math.min(33, fitOf() + 1);
      sB.input.max = String(mx);
      if (nb > mx) nb = mx;
      sB.set(nb, false);
    }
    const wrap = el('div', { class: 'dsb-w' });
    f.stage.append(wrap);
    const svg = S('svg', { class: 'dsb-svg', role: 'img', 'aria-label': 'An SM drawn as four columns, one per warp scheduler, each with 16 warp slots. Warp chips labelled by block and warp fill the slots; the warps each scheduler issues this clock are highlighted. Blocks that do not fit wait outside.' }, wrap);
    let W = 0, G = null;
    function draw(w) {
      if (w) W = w;
      if (!W) return;
      clear(svg);
      const wpb = tpb / 32, fit = fitOf(), res = Math.min(nb, fit), waiting = nb - res;
      const nar = W < 560;
      const gap = nar ? 6 : 12;
      const cw = (W - 3 * gap) / 4;
      const per = cw >= 150 ? 2 : 1;
      const rows = 16 / per;
      const sh = 18, sg = 3;
      const top = 22, hh = 22;
      const g = S('g', null, svg);
      tx(g, 0, 12, nar ? 'SM · 64 slots · chip = block·warp' : 'one SM · 64 warp slots, 16 per Warp Scheduler', { fill: 'var(--ink)', size: 11, weight: 600 });
      tx(g, W, 12, `${res * wpb} / 64 used`, { fill: 'var(--ink-2)', size: 10.5, anchor: 'end' });
      const chips = [];
      const slotX = (k, q) => k * (cw + gap) + 6 + (q % per) * ((cw - 12) / per);
      const slotY = (q) => top + hh + 8 + Math.floor(q / per) * (sh + sg);
      const sw = (cw - 12) / per - (per > 1 ? 4 : 0);
      const colH = hh + 8 + rows * (sh + sg) + 6;
      const heads = [];
      for (let k = 0; k < 4; k++) {
        const x = k * (cw + gap);
        rect(g, x, top, cw, colH, { rx: 8, fill: 'rgba(255,255,255,0.02)', stroke: 'var(--line-2)', dash: '4 3' });
        heads.push(rect(g, x + 4, top + 4, cw - 8, hh - 4, { rx: 5, fill: 'var(--control-a)', stroke: 'var(--control)' }));
        tx(g, x + cw / 2, top + 16, cw < 110 ? `sched. ${k}` : `Warp Scheduler ${k}`, { fill: 'var(--ink)', size: 10, anchor: 'middle' });
        for (let q = 0; q < 16; q++) rect(g, slotX(k, q), slotY(q), sw, sh, { rx: 4, fill: 'none', stroke: 'var(--line)', dash: '2 2' });
      }
      // resident warps: warp gI (blocks in order) goes to scheduler gI % 4, slot floor(gI / 4)
      let gI = 0;
      for (let b = 0; b < res; b++) for (let w2 = 0; w2 < wpb; w2++, gI++) {
        const k = gI % 4, q = Math.floor(gI / 4);
        const x = slotX(k, q), y = slotY(q);
        const r = rect(g, x, y, sw, sh, { rx: 4, fill: tones[b % 4], stroke: 'rgba(255,255,255,0.18)' });
        const t = tx(g, x + sw / 2, y + 12.5, sw < 70 ? `${b}·${w2}` : `block ${b} · warp ${w2}`, { fill: 'var(--ink)', size: 10, anchor: 'middle' });
        chips.push({ k, q, b, w: w2, r, t });
      }
      let y = top + colH + 12;
      // blocks that do not fit whole
      const waitG = S('g', null, g);
      if (waiting > 0) {
        const b = res;
        tx(waitG, 0, y + 10, nar ? `block ${b}: ${plural(wpb, 'warp')}, waits` : `block ${b} (${plural(wpb, 'warp')}) does not fit whole, so it waits for room here or runs on another SM`, { fill: 'var(--danger)', size: 10.5 });
        y += 16;
        const cww = Math.min(60, (W - (wpb - 1) * 3) / Math.max(1, wpb));
        for (let w2 = 0; w2 < wpb; w2++) rect(waitG, w2 * (cww + 3), y, cww, 14, { rx: 3, fill: 'var(--danger-a)', stroke: 'var(--danger)', dash: '3 2' });
        y += 20;
      }
      svg.setAttribute('viewBox', `0 0 ${W} ${r1(y)}`);
      G = { chips, heads, res, wpb, fit, waiting };
      paint();
    }
    function paint() {
      if (!G) return;
      const byK = [[], [], [], []];
      G.chips.forEach((c) => byK[c.k].push(c));
      let issued = 0;
      const picks = [];
      byK.forEach((list, k) => {
        const pick = list.length ? list[cyc % list.length] : null;
        list.forEach((c) => {
          const on = c === pick;
          c.r.setAttribute('fill', on ? 'var(--special)' : tones[c.b % 4]);
          c.t.style.fill = on ? '#0b0c12' : 'var(--ink)';
          c.t.style.fontWeight = on ? '600' : '';
        });
        G.heads[k].setAttribute('fill', pick ? 'rgba(255,198,92,0.32)' : 'var(--control-a)');
        if (pick) { issued++; picks.push(`block ${pick.b}’s warp ${pick.w}`); }
      });
      const { res, wpb, fit, waiting } = G;
      stW.set(String(wpb));
      stB.set(`${res}${waiting ? ' (+1 waiting)' : ''}`);
      stS.set(`${res * wpb} / 64`);
      stI.set(`${issued} / 4 · clock ${cyc}`);
      const lim = fit === 32 && 64 / wpb > 32 ? 'the SM’s limit of 32 blocks' : 'its 64 warp slots';
      const blocksS = res === 1 ? `One block of ${fmt.int(tpb)} threads is ${plural(wpb, 'warp')}, and all of them sit on this one SM.` : `${res} blocks of ${fmt.int(tpb)} threads, ${plural(wpb, 'warp')} each, share this SM: ${plural(res * wpb, 'warp')} from different blocks side by side.`;
      const free = 64 - res * wpb;
      const why2 = free >= wpb ? 'the SM already holds its maximum of 32 blocks' : `it needs ${plural(wpb, 'slot')} and only ${fmt.int(free)} ${free === 1 ? 'is' : 'are'} free`;
      const waitS = waiting ? ` Block ${res} does not fit: ${why2}. A block’s warps are never split across SMs, so it waits. At most ${plural(fit, 'block')} of this size fit (${lim}).` : ` At most ${plural(fit, 'block')} of this size fit (${lim}).`;
      const issueS = issued < 4 ? ` This clock ${plural(issued, 'scheduler')} ${issued === 1 ? 'has' : 'have'} a warp to issue; ${4 - issued} ${4 - issued === 1 ? 'has' : 'have'} none, so ${4 - issued === 1 ? 'that issue slot goes' : 'those issue slots go'} unused.` : ` This clock each of the four schedulers issues one warp (pink: ${picks.join(', ')}), four warp-instructions at once; next clock they move on to others.`;
      f.setWhy(blocksS + waitS + issueS);
    }
    clampBlocks();
    onWidth(wrap, draw);
  }

  /* Fig: a warp on the loom */
  function warpLoom(host, ctx) {
    const f = ctx.figure(host, {
      title: 'A warp on the loom',
      hint: 'play · step · switch programs',
      wide: true,
      caption: 'The weaving metaphor made literal. The 32 vertical warp threads are the 32 CUDA threads of one warp. Each instruction the warp scheduler (the amber shuttle) issues is one weft pass: a solid green line across every thread that takes part; on alternate threads the warp thread passes over the weft, which shows as a break in the green, as in woven cloth. The finished cloth, read top to bottom, is the warp’s instruction stream in issue order, and the tally at the right of each row counts the threads that did work on that pass. A solid red cell is a thread that sits the pass out. Instruction names are real SASS mnemonics (<code>FMNMX</code> is a floating-point min/max), and each line is one instruction as written: a multiply followed by an add that uses its result would be fused into one <code>FFMA</code>, as in the straight-line program’s first pass, so the programs avoid that pattern. The programs are ours and leave out branch bookkeeping.',
    });
    const wrap = el('div', { class: 'dsb-w' });
    f.stage.append(wrap);
    const svg = S('svg', { class: 'dsb-svg', role: 'img', 'aria-label': 'A loom: 32 vertical threads, with one horizontal weft pass woven across them for each instruction issued to the warp. In the branch program, some passes cross only the threads on that side of the branch, and the others are marked idle.' }, wrap);
    let prog = 'straight';
    const PASS = 1.0, GAP = 0.3;
    let clk = 0, pos = 0, fin = false;
    let G = null; // current drawing
    const stIss = GG.ui.stat(f.readouts, { label: 'instructions issued', value: '0', tone: 'control' });
    const stThr = GG.ui.stat(f.readouts, { label: 'thread-instructions', value: '0', tone: 'core' });
    const stUtil = GG.ui.stat(f.readouts, { label: 'lane utilization', value: '—' });
    GG.ui.seg(f.controls, {
      label: 'Program', value: prog,
      options: [{ value: 'straight', label: 'straight-line' }, { value: 'branch', label: 'if (x > 0) … else …' }],
      onChange: (v) => { prog = v; clk = 0; pos = anim.running ? 0 : LOOM_PROGS[prog].length; fin = !anim.running; build(); },
    });
    const btnRow = el('div', { class: 'dsb-flex' });
    f.controls.append(btnRow);
    const anim = GG.anim(wrap, (t, dt) => tick(dt), { autostart: false });
    const play = GG.ui.playButton(btnRow, anim, { onToggle: (on) => { if (on && (fin || pos >= LOOM_PROGS[prog].length)) { clk = 0; pos = 0; fin = false; paint(); } } });
    GG.ui.button(btnRow, { icon: 'next', label: 'Next pass', onClick: () => {
      anim.stop(); play.sync();
      const R = LOOM_PROGS[prog].length;
      // passes 1 … R, each with its own sentence, then the summary
      if (fin) { pos = 1; fin = false; }
      else if (pos >= R) fin = true;
      else pos = Math.min(R, Math.floor(pos + 1e-6) + 1);
      clk = pos * (PASS + GAP);
      paint();
    } });
    GG.ui.button(btnRow, { icon: 'reset', label: 'Restart', onClick: () => { clk = 0; pos = 0; fin = false; paint(); } });

    /* Plays once and stops on the summary; Play runs it again. */
    function tick(dt) {
      const R = LOOM_PROGS[prog].length;
      clk += dt;
      if (clk >= R * (PASS + GAP)) { pos = R; fin = true; anim.stop(); play.sync(); paint(); return; }
      const r = Math.floor(clk / (PASS + GAP));
      pos = r + Math.min(1, (clk - r * (PASS + GAP)) / PASS);
      paint();
    }

    let W = 0;
    function build(w) {
      if (w) W = w;
      if (!W) return;
      clear(svg);
      const P = LOOM_PROGS[prog];
      const R = P.length;
      const narrow = W < 560;
      const LW = narrow ? 78 : 226;
      const TLW = narrow ? 34 : 46;
      const x0 = LW + 6, x1 = W - 6 - TLW;
      const p = (x1 - x0) / 32;
      const RH = narrow ? 25 : 27;
      const y0 = 50;
      const yEnd = y0 + (R - 1) * RH + 16;
      const branch = prog === 'branch';
      const H = yEnd + (branch ? 34 : 10);
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const X = (j) => x0 + p * (j + 0.5);
      const sw = clamp(p * 0.15, 1.2, 2.2);
      const ww = narrow ? 3 : 4;
      const SC = '#9aa0b8';
      const defs = S('defs', null, svg);
      const g = S('g', null, svg);
      // header
      tx(g, 0, 12, narrow ? '32 threads' : 'warp threads = CUDA threads', { fill: 'var(--ink-3)', size: 10 });
      [0, 8, 16, 24, 31].forEach((j) => tx(g, X(j), 12, String(j), { fill: 'var(--ink-3)', size: 9.5, anchor: 'middle' }));
      rect(g, x0 - 4, 18, x1 - x0 + 8, 8, { rx: 3, fill: 'var(--surface-3)', stroke: 'var(--line-2)' });
      tx(g, 0, 38, narrow ? 'issued ↓' : 'instruction issued (in order) ↓', { fill: 'var(--ink-3)', size: 10 });
      const behind = S('g', null, g);
      const strands = S('g', null, g);
      const over = S('g', null, g);
      for (let j = 0; j < 32; j++) line(strands, X(j), 26, X(j), yEnd, { stroke: SC, sw, cap: 'round' });
      const rows = [];
      P.forEach((ins, r) => {
        const y = y0 + r * RH;
        const cid = GG.uid('dsb-clip');
        const cp = S('clipPath', { id: cid }, defs);
        const cr = rect(cp, x0 - 6, y - 8, 0, 16, { rx: 0, fill: '#fff' });
        const gb = S('g', { 'clip-path': `url(#${cid})` }, behind);
        const go = S('g', { 'clip-path': `url(#${cid})` }, over);
        const act = [];
        for (let j = 0; j < 32; j++) act.push(laneActive(ins, j));
        const nAct = act.filter(Boolean).length;
        if (nAct < 32) line(gb, x0 - 4, y, x1 + 4, y, { stroke: 'var(--ink-3)', sw: 1.1, dash: '3 3' });
        // runs of active lanes
        let j = 0;
        while (j < 32) {
          if (!act[j]) { j++; continue; }
          let k = j;
          while (k + 1 < 32 && act[k + 1]) k++;
          const xa = j === 0 ? x0 - 4 : X(j) - p / 2 + 0.5, xb = k === 31 ? x1 + 4 : X(k) + p / 2 - 0.5;
          line(go, xa, y, xb, y, { stroke: 'var(--core)', sw: ww, cap: 'round' });
          j = k + 1;
        }
        for (let q = 0; q < 32; q++) {
          if (!act[q]) {
            // an idle lane: a solid red cell, the full lane wide, that hides the warp thread, so it cannot be mistaken for weave
            rect(go, X(q) - p / 2 + 0.5, y - 7, Math.max(2, p - 1), 14, { rx: 1.5, fill: 'var(--danger)', opacity: 0.9 });
            continue;
          }
          // the weave: on alternate lanes the warp thread passes over the weft, which shows as a break in
          // the green with the warp thread running through it (on the others the weft covers the thread)
          if ((r + q) % 2 === 1) {
            line(go, X(q), y - ww / 2 - 1.5, X(q), y + ww / 2 + 1.5, { stroke: '#11121c', sw: sw + 2.6 });
            line(go, X(q), y - 7, X(q), y + 7, { stroke: SC, sw, cap: 'round' });
          }
        }
        const tally = tx(g, x1 + 10, y + 4, `${nAct}/32`, { fill: nAct < 32 ? 'var(--danger)' : 'var(--core)', size: narrow ? 9.5 : 10.5, weight: 600 });
        const lab = S('g', null, g);
        const opT = tx(lab, 0, y + 4, ins.op, { fill: 'var(--ink)', size: narrow ? 10.5 : 11.5, weight: 600 });
        let dT = null;
        if (narrow) { if (ins.m) dT = tx(lab, 44, y + 4, ins.m === 1 ? 'if' : 'else', { fill: 'var(--ink-3)', size: 10 }); }
        else dT = tx(lab, 52, y + 4, ins.d, { fill: 'var(--ink-3)', size: 10.5 });
        rows.push({ cr, lab, opT, dT, y, nAct, ins, tally });
      });
      let pred = null;
      if (branch) {
        const py = yEnd + 16;
        pred = S('g', null, g);
        tx(pred, 0, py + 4, narrow ? 'x > 0 ? 1/0' : 'x > 0 ?  (1 = if, 0 = else)', { fill: 'var(--ink-3)', size: 10 });
        // the predicate, one bit per lane: 1 takes the if side, 0 the else side
        for (let j = 0; j < 32; j++) {
          const on = !!LOOM_MASK[j];
          tx(pred, X(j), py + 4, on ? '1' : '0', { fill: on ? 'var(--core)' : 'var(--danger)', size: clamp(p * 1.25, 9, 11.5), anchor: 'middle', weight: 600 });
        }
      }
      const shuttle = S('g', { opacity: 0 }, g);
      path(shuttle, 'M-15,0 Q-9,-5.5 0,-5.5 Q9,-5.5 15,0 Q9,5.5 0,5.5 Q-9,5.5 -15,0 Z', { fill: 'var(--control)', stroke: '#2a1d05', sw: 1 });
      rect(shuttle, -5, -2, 10, 4, { rx: 2, fill: '#6b4a10' });
      G = { rows, shuttle, pred, x0, x1, p, R };
      paint();
    }
    function paint() {
      if (!G) return;
      const P = LOOM_PROGS[prog];
      const R = P.length;
      const full = Math.floor(pos + 1e-9);
      const frac = pos - full;
      let issued = 0, thr = 0;
      G.rows.forEach((row, r) => {
        const rev = r < full ? 1 : r === full ? frac : 0;
        row.cr.setAttribute('width', r1((G.x1 - G.x0 + 12) * rev));
        const done = rev >= 1;
        const cur = r === full && frac > 0;
        if (done) { issued++; thr += row.nAct; }
        row.opT.style.fill = cur ? 'var(--control)' : done ? 'var(--ink)' : 'var(--ink-3)';
        row.lab.style.opacity = done || cur ? '1' : '0.55';
        row.tally.style.opacity = done ? '1' : '0';
      });
      if (G.pred) G.pred.style.opacity = full >= 2 ? '1' : '0.25';
      const cur = full < R && frac > 0 ? G.rows[full] : null;
      if (cur && anim.running) {
        G.shuttle.setAttribute('opacity', '1');
        G.shuttle.setAttribute('transform', `translate(${r1(G.x0 - 6 + (G.x1 - G.x0 + 12) * frac)},${r1(cur.y)})`);
      } else G.shuttle.setAttribute('opacity', '0');
      stIss.set(String(issued));
      stThr.set(String(thr));
      stUtil.set(issued ? fmt.pct(thr / (issued * 32), 0) : '—', issued && thr < issued * 32 ? 'danger' : 'core');
      // why
      let why;
      if (full === 0 && frac === 0) why = `The loom is threaded: 32 warp threads, one per CUDA thread, and a program of ${R} instructions waiting on the left. Press Play or Next pass.`;
      else if (fin) {
        why = prog === 'straight'
          ? `Done: <b>${R} instructions issued</b>, and every one crossed all 32 threads, so <b>${R * 32} thread-instructions</b> of work were done with every lane busy on every pass: <b>100%</b> lane utilization. This is SIMT at its best.`
          : `Done: <b>${R} instructions issued</b> for <b>${thr} thread-instructions</b> of work, ${fmt.pct(thr / (R * 32), 0)} lane utilization. Each thread only needed 5 instructions, but because the warp diverged, it had to run the <code>if</code> side and then the <code>else</code> side, one after the other.`;
      } else {
        const r = frac > 0 ? full : full - 1;
        const ins = P[r];
        const n = G.rows[r].nAct;
        if (!ins.m) why = `<b>Pass ${r + 1} of ${R} · ${ins.op}</b> (${esc(ins.d)}): the warp scheduler issues it once, and all 32 threads execute it together, each on its own data. One pass of the shuttle, 32 threads crossed.`;
        else why = `<b>Pass ${r + 1} of ${R} · ${ins.op}</b>, the <code>${ins.m === 1 ? 'if' : 'else'}</code> side: issued to the whole warp, but only the ${n} threads whose <code>x ${ins.m === 1 ? '&gt;' : '≤'} 0</code> take part. The other ${32 - n} sit this pass out (red), and their lanes do no work.`;
      }
      f.setWhy(why);
    }
    onWidth(wrap, (w) => build(w));
    if (GG.reducedMotion) { pos = LOOM_PROGS[prog].length; fin = true; }
    else GG.onVisible(wrap, (v) => { if (v && pos === 0 && !anim.running) { anim.start(); play.sync(); } }, { once: true });
  }

  /* Fig: blocks are cut into warps, and bytes into cache lines, side by side */
  function warpCarve(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Threads to warps, bytes to cache lines',
      hint: 'drag the slider',
      wide: true,
      controlsFirst: true,
      caption: 'Top, GPU: a block’s n threads are numbered in order and cut into consecutive warps of 32, all run by the one SM that holds the block. Bottom, CPU (added for comparison): reading n bytes from a line-aligned address brings them into cache in whole 64-byte lines, the usual size on x86 CPUs. One slider drives both. In both cases the program is correct whatever n is; the grouping only changes speed. Red marks lanes that have no thread, and bytes fetched that nobody asked for. The two counts of waste are different things and usually differ; the readouts also give the cost in time: each instruction of the kernel is issued once per warp, and each line is one transfer from memory.',
    });
    let n = 72;
    const wrap = el('div', { class: 'dsb-w' });
    f.stage.append(wrap);
    const svg = S('svg', { class: 'dsb-svg', role: 'img', 'aria-label': 'Two panels driven by one number n. Top: a block of n threads cut into warps of 32, with the unused lanes of the last warp marked idle. Bottom: n bytes read, grouped into 64-byte cache lines, with the unused bytes of the last line marked.' }, wrap);
    const sl = GG.ui.slider(f.controls, { label: 'n: threads per block · bytes read', min: 1, max: 1024, value: n, format: (v) => fmt.int(v), onInput: (v) => { n = v; presets.set(null); draw(); } });
    const presets = GG.ui.seg(f.controls, {
      label: 'Try', value: 72,
      options: [32, 33, 64, 72, 100, 256, 1000].map((v) => ({ value: v, label: String(v) })),
      onChange: (v) => { n = v; sl.set(v, false); draw(); },
    });
    const st1 = GG.ui.stat(f.readouts, { label: 'warps · issues per instruction', value: '', tone: 'control' });
    const st3 = GG.ui.stat(f.readouts, { label: 'idle lanes', value: '', tone: 'danger' });
    const st2 = GG.ui.stat(f.readouts, { label: 'cache lines · transfers', value: '', tone: 'memory' });
    const st4 = GG.ui.stat(f.readouts, { label: 'bytes unused', value: '', tone: 'danger' });
    let W = 0;
    function panel(g, y, gpu) {
      const G = gpu ? 32 : 64;
      const groups = Math.ceil(n / G);
      const per = gpu ? (W >= 640 ? 4 : 2) : (W >= 640 ? 2 : 1);
      const gap = 10;
      const gw = (W - 16 - (per - 1) * gap) / per;
      const cw = gw / G;
      const rowH = 32, top = 30;
      const rowsUsed = Math.ceil(groups / per);
      const H = top + rowsUsed * rowH + 8;
      rect(g, 0.5, y + 0.5, W - 1, H - 1, { rx: 10, fill: gpu ? 'rgba(255,255,255,0.015)' : 'var(--memory-a)', stroke: gpu ? 'var(--line-2)' : 'rgba(111,166,255,0.45)', dash: '4 3' });
      const wideHead = W >= 560;
      tx(g, 10, y + 18, gpu ? (wideHead ? 'GPU: one SM runs every warp of this block' : 'GPU: warps of 32 threads') : (wideHead ? 'CPU: memory → cache, one 64-byte line at a time' : 'CPU: 64-byte cache lines'), { fill: gpu ? 'var(--ink)' : 'var(--ink)', size: 10.5, weight: 600 });
      if (wideHead) tx(g, W - 10, y + 18, gpu ? `${plural(n, 'thread')} asked for` : `${plural(n, 'byte')} read`, { fill: 'var(--ink-3)', size: 10.5, anchor: 'end' });
      for (let k = 0; k < groups; k++) {
        const row = Math.floor(k / per), col = k % per;
        const gx = 8 + col * (gw + gap), gy = y + top + row * rowH;
        const a = k * G, b = Math.min(n, (k + 1) * G) - 1;
        const lab = gpu ? (W < 480 ? `warp ${k}` : `warp ${k} · threads ${a}–${b}`) : (W < 480 ? `line ${k}` : `line ${k} · bytes ${a}–${b}`);
        tx(g, gx, gy + 8, lab, { fill: 'var(--ink-3)', size: 9.5 });
        const used = Math.min(G, n - a);
        for (let c = 0; c < G; c++) {
          const on = c < used;
          rect(g, gx + c * cw + 0.4, gy + 12, Math.max(0.6, cw - 0.8), 12, {
            rx: 1,
            fill: on ? (gpu ? 'var(--ink-2)' : 'var(--memory)') : 'var(--danger-a)',
            stroke: on ? 'none' : 'rgba(255,91,110,0.7)', sw: 0.6, opacity: on ? (gpu ? 0.85 : 0.8) : 1,
          });
        }
      }
      return { H, groups, units: groups * G, idle: groups * G - n };
    }
    function draw(w) {
      if (w) W = w;
      if (!W) return;
      clear(svg);
      const g = S('g', null, svg);
      const A = panel(g, 0, true);
      const B = panel(g, A.H + 12, false);
      svg.setAttribute('viewBox', `0 0 ${W} ${A.H + 12 + B.H}`);
      st1.set(fmt.int(A.groups)); st3.set(fmt.int(A.idle), A.idle ? 'danger' : 'core');
      st2.set(fmt.int(B.groups)); st4.set(fmt.int(B.idle), B.idle ? 'danger' : 'core');
      const tail = n % 32;
      const first = A.groups > 1 ? `threads 0–31 form warp 0${A.groups > 2 ? ', 32–63 warp 1, and so on' : ''}` : 'it fits in one warp';
      const gpuS = tail === 0
        ? `A block of <b>${plural(n, 'thread')}</b> runs as <b>${plural(A.groups, 'warp')}</b> (${first}). ${fmt.int(n)} is a multiple of 32, so every lane of every warp has a thread and nothing is wasted.`
        : `A block of <b>${plural(n, 'thread')}</b> runs as <b>${plural(A.groups, 'warp')}</b> (${first}). ${A.groups > 1 ? 'The last warp' : 'That warp'} holds only ${plural(tail, 'thread')}, and its other <b>${plural(32 - tail, 'lane')} ${32 - tail === 1 ? 'idles' : 'idle'}</b> for the whole kernel: ${fmt.pct(A.idle / A.units, 1)} of the block’s lanes do no work, yet every instruction still costs ${plural(A.groups, 'issue')}, one per warp.`;
      const cpuS = `Reading <b>${plural(n, 'byte')}</b> from a line-aligned address makes the CPU bring in <b>${plural(B.groups, 'cache line')}</b>, ${fmt.int(B.units)} bytes in ${plural(B.groups, 'transfer')}; ${B.idle ? `${fmt.int(B.idle)} of them come along unasked` : 'every byte moved is used'}.`;
      f.setWhy(`${gpuS} ${cpuS} Neither the CUDA nor the C code mentions warps or lines, and both are correct either way; the grouping only changes how fast they run.`);
    }
    onWidth(wrap, draw);
  }

  /* Fig: latency hiding in miniature (shared cycles component) */
  function warpLatency(host, ctx) {
    const f = ctx.figure(host, {
      title: 'A warp stalls; the scheduler switches',
      hint: 'drag the sliders · hover a box',
      wide: true,
      caption: 'One warp scheduler, cycle by cycle (a model). Each row is a warp slot and each column a clock cycle. As the figure opens, every second instruction of a warp is a global load (<code>LDG</code>; the third slider changes how often), whose result takes the set latency to arrive; the warp is stalled (amber) until then. Whenever some other warp is eligible (blue), the scheduler selects it (pink) and issues its next instruction instead. Real global loads take hundreds of cycles; the latency here is scaled down so the pattern fits. The slot count is scaled down too: an H100 warp scheduler can hold up to 16 warps (64 per SM ÷ 4 schedulers), and occupancy here is measured against this model’s 8 slots. The run lasts 40 cycles, longer than the longest round the sliders allow (7 <code>FFMA</code> instructions, then an <code>LDG</code> whose result takes 32 cycles: 39 cycles), so the issue-efficiency readout always includes the idle issue slots that follow the opening burst, when every warp still has work ready. Because it counts that burst too, it can read higher than the long-run rate, never lower.',
    });
    const cy = GG.components.cycles(f, { simulate: { warps: 2, latency: 8, issueEvery: 2, slots: 8, cycles: 40, ops: { long: 'LDG', short: 'FFMA' } }, simControls: true, animate: false });
    return cy;
  }

  GG.entry('warp', {
    render(body, ctx) {
      const s = ctx.html(body, `
<p>A <strong>warp</strong> is a group of ${T('thread', 'threads')} that are scheduled together and execute in parallel. All threads in a warp are scheduled onto a single ${T('streaming-multiprocessor', 'Streaming Multiprocessor (SM)')}. A single SM typically executes multiple warps, at the very least all warps from the same ${T('cooperative-thread-array', 'Cooperative Thread Array')}, aka ${T('thread-block', 'thread block')}. Fig. 1 shows both: a block’s warps always land together on one SM, and an SM holds the warps of several blocks at once, its four ${T('warp-scheduler', 'Warp Schedulers')} each picking one warp per clock.</p>
<div data-slot="res" class="wide"></div>
<h3>One instruction, thirty-two threads</h3>
<p>Warps are the typical unit of execution on a GPU. In normal execution, all threads of a warp execute the same instruction in parallel: the so-called “Single-Instruction, Multiple Thread” or <strong>SIMT</strong> model. The ${T('warp-scheduler', 'Warp Scheduler')} fetches and issues one instruction, and each of the warp’s 32 threads executes it on its own ${T('registers', 'registers')}. One issue, 32 threads’ worth of work.</p>
<p>The name is a weaving term. On a loom, the <em>warp</em> is the set of lengthwise threads held under tension, and the <em>weft</em> is the crosswise thread that a shuttle carries across all of them in a single pass. Fig. 2 makes the metaphor literal: each CUDA thread is a warp thread, and each instruction issued to the warp is a weft pass that crosses all 32 at once.</p>
<div data-slot="loom" class="wide"></div>
${GG.noteHTML('quote', '<p>Warps are named in reference to weaving, “the first parallel thread technology”.</p><p><small>The glossary, quoting <a href="https://www.cs.cmu.edu/afs/cs/academic/class/15869-f11/www/readings/lindholm08_tesla.pdf">Lindholm et al., 2008</a>, the paper that introduced NVIDIA’s Tesla architecture: “The term warp originates from weaving, the first parallel thread technology.”</small></p>')}
<p>When the threads in a warp split from one another to execute different instructions, also known as ${T('warp-divergence', 'warp divergence')}, performance generally drops precipitously. Switch Fig. 2 to the branch program. A warp can issue only one instruction at a time, so it runs the <code>if</code> side for the threads that took it, then the <code>else</code> side for the rest. Each pass still costs a full issue, even though some of its threads sit it out: on each divergent pass, the threads on the other side (anywhere from 1 to 31 lanes) idle. If the two sides are the same length, exactly half of the lane-slots in the divergent region are wasted, however the threads split (in Fig. 2, 18 + 18 + 14 + 14 = 64 of 4 × 32 = 128); if the side taken by fewer threads is longer, more than half are. And if all 32 threads took different paths, the warp would run them one by one.</p>
<p>Warp size is technically a machine-dependent constant, but in practice (and throughout this glossary) it is 32. PTX exposes it as the constant <code>WARP_SZ</code>, and ${T('cuda-c', 'CUDA C++')} as the built-in variable <code>warpSize</code>.</p>
<div data-slot="nums"></div>
<h3>Waiting for results</h3>
<p>When a warp is issued an instruction, the results are generally not available within a single clock cycle, and so dependent instructions (ones that need those results as inputs) cannot be issued. This is most obviously true for fetches from ${T('global-memory', 'global memory')}, which generally ${T('gpu-ram', 'go off-chip')} to GPU RAM and take hundreds of cycles. It is also true for some arithmetic instructions. See <a href="https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/index.html#arithmetic-instructions">the CUDA C++ Best Practices Guide</a> for a table of results per clock cycle for specific instructions. That table counts <em>operations</em> per clock cycle per SM; as the guide notes, one warp instruction is 32 operations. On a compute capability 9.0 GPU like the H100, for example, the table lists 128 results per clock per SM for 32-bit floating-point add, multiply and multiply-add: four warp instructions’ worth, one for each of the SM’s four warp schedulers.</p>
<p>A warp whose next instruction is delayed by missing operands is said to be ${T('warp-execution-state', 'stalled')}.</p>
<h3>Hiding the wait</h3>
<p>Instead of waiting for an instruction’s results to return, when multiple warps are scheduled onto a single SM, the ${T('warp-scheduler', 'Warp Scheduler')} will select another warp to execute. This ${T('latency-hiding', 'latency hiding')} is how GPUs achieve high throughput and ensure work is always available for all of their cores during execution. For this reason, it is often beneficial to maximize the number of warps scheduled onto each SM, ensuring there is always an ${T('warp-execution-state', 'eligible')} warp for the SM to run. In Fig. 3, drop to one warp and watch it stall; then add warps until every issue slot is used.</p>
<div data-slot="lat" class="wide"></div>
<div data-slot="defs" class="dsb-defs"></div>
<h3>An implementation detail that decides performance</h3>
<p>Warps are not actually part of the ${T('cuda-programming-model', 'CUDA programming model')}’s ${T('thread-hierarchy', 'thread hierarchy')}, which goes thread, block, grid. Instead, they are an implementation detail of that model on NVIDIA GPUs. The hardware makes them for you: a block’s threads are numbered in order and cut into consecutive runs of 32, so threads 0 to 31 form warp 0, threads 32 to 63 warp 1, and so on, as the CUDA C++ Programming Guide specifies.</p>
<p>In that way, they are somewhat akin to <a href="https://www.nic.uoregon.edu/~khuck/ts/acumem-report/manual_html/ch03s02.html">cache lines</a> in CPUs. A CPU moves memory into its caches in fixed-size lines, and a C program never mentions them. Both are a feature of the hardware that you don’t directly control and don’t need to consider for program correctness, but which is important for achieving ${T('perf', 'maximum performance')}. Fig. 4 shows the two side by side, driven by one number: a block of 72 threads works, but it runs as three warps, the last with 24 idle lanes, much as reading 72 bytes brings in two 64-byte lines, 56 bytes of which nobody asked for.</p>
<div data-slot="carve" class="wide"></div>
${GG.noteHTML('beyond', `<p><b>Reaching into the warp on purpose.</b> You can ignore warps and still write correct CUDA, but you can also program them directly. CUDA’s warp-level primitives, such as <code>__shfl_sync</code> (read a register of another thread in the warp) and <code>__ballot_sync</code> (collect one bit from each thread), exchange data among the 32 threads of a warp without going through memory. Code that uses them depends on the warp size, which is why <code>warpSize</code> exists.</p>`)}
<h3>Warps by any other name</h3>
<p>The equivalent of warps in other GPU programming models include <a href="https://github.com/gpuweb/gpuweb/pull/4368">subgroups</a> in WebGPU, <a href="https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_WaveSize.html">waves</a> in DirectX, and <a href="https://developer.apple.com/documentation/metal/compute_passes/creating_threads_and_threadgroups#2928931">simdgroups</a> in Metal.</p>
<div data-slot="tbl"></div>
${GG.noteHTML('history', '<p><b>Then and now.</b> Lindholm et al. describe each Tesla SM managing a pool of 24 warps, 768 threads in all, and choose the 32-thread warp because it “provides efficiency on plentiful fine-grained pixel threads and computing threads”. An H100 SM keeps up to 64 warps, 2,048 threads, resident at once. The warp itself is still 32 threads wide.</p>')}
<div data-slot="read"></div>`);

      guard(s.res, 'Resident warps', () => warpResident(s.res, ctx));
      guard(s.loom, 'Loom', () => warpLoom(s.loom, ctx));
      ctx.numbers(s.nums, [
        { value: '32', label: 'threads per warp, in practice', tone: 'core' },
        { value: '4', label: 'warp schedulers per H100 SM, one warp instruction per clock each', tone: 'control' },
        { value: '64', label: 'warps resident on one H100 SM at most (2,048 threads)' },
      ]);
      guard(s.lat, 'Latency hiding', () => warpLatency(s.lat, ctx));
      s.defs.innerHTML = [
        ['st', 'Stalled', `A warp whose next instruction cannot issue yet, for example because an operand is still on its way from memory. See ${T('warp-execution-state', 'warp execution state')}.`],
        ['el', 'Eligible', `A warp that is ready to issue its next instruction this cycle: a candidate for the ${T('warp-scheduler', 'warp scheduler')}.`],
        ['ie', 'Issue efficiency', `The fraction of cycles on which a warp was issued an instruction. See ${T('issue-efficiency', 'issue efficiency')}.`],
        ['oc', 'Occupancy', `The degree of concurrency in warp scheduling: active warps relative to the maximum the SM can hold. See ${T('occupancy', 'occupancy')}.`],
      ].map(([c, h, d]) => `<div class="dsb-def"><div class="dsb-def-h"><i class="${c}"></i>${h}</div>${d}</div>`).join('');
      guard(s.carve, 'Warps and cache lines', () => warpCarve(s.carve, ctx));
      s.tbl.innerHTML = GG.tableHTML(`<thead><tr><th>Programming model</th><th>Its name for a warp</th><th>How code asks for the width <span class="dsb-tag">beyond</span></th></tr></thead><tbody>
<tr><td>CUDA C++ · PTX (NVIDIA)</td><td>warp</td><td><code>warpSize</code> · <code>WARP_SZ</code></td></tr>
<tr><td>WebGPU (WGSL)</td><td><a href="https://github.com/gpuweb/gpuweb/pull/4368">subgroup</a></td><td><code>@builtin(subgroup_size)</code></td></tr>
<tr><td>DirectX (HLSL)</td><td><a href="https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_WaveSize.html">wave</a></td><td><code>WaveGetLaneCount()</code>; Shader Model 6.6 adds a <code>WaveSize</code> attribute to require one</td></tr>
<tr><td>Metal (MSL)</td><td><a href="https://developer.apple.com/documentation/metal/compute_passes/creating_threads_and_threadgroups#2928931">SIMD-group (simdgroup)</a></td><td><code>[[threads_per_simdgroup]]</code></td></tr>
</tbody>`);
      ctx.reading(s.read, [
        { href: 'https://www.cs.cmu.edu/afs/cs/academic/class/15869-f11/www/readings/lindholm08_tesla.pdf', label: 'Lindholm et al. (2008), NVIDIA Tesla: A Unified Graphics and Computing Architecture', note: 'where the warp, and its name, come from' },
        { href: 'https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/index.html#arithmetic-instructions', label: 'NVIDIA: CUDA C++ Best Practices Guide, Arithmetic Instructions', note: 'results per clock cycle for specific instructions' },
        { href: 'https://www.nic.uoregon.edu/~khuck/ts/acumem-report/manual_html/ch03s02.html', label: 'Cache lines', note: 'the CPU feature warps resemble' },
        { href: 'https://github.com/gpuweb/gpuweb/pull/4368', label: 'WebGPU: subgroups' },
        { href: 'https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_WaveSize.html', label: 'DirectX: HLSL Shader Model 6.6 WaveSize' },
        { href: 'https://developer.apple.com/documentation/metal/compute_passes/creating_threads_and_threadgroups#2928931', label: 'Metal: Creating threads and threadgroups', note: 'SIMD-groups' },
      ]);
    },
  });

  /* ═════════════════════════════ Warpgroup ═════════════════════════════ */

  const WG_CODE = `int linearIdx = (%tid.x + %tid.y * %ntid.x  + %tid.z * %ntid.x * %ntid.y);
int warpRank = linearIdx / 32;`;
  const WG_TONES = ['#3b4262', '#4d557c', '#606a97', '#7580b2'];

  /* Fig: warp-rank calculator */
  function wgCalc(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Warp-rank calculator',
      hint: canHover ? 'pick a shape · click a thread' : 'pick a shape · tap a thread',
      wide: true,
      controlsFirst: true,
      caption: 'First view (left on wide screens): the block as you index it, x across, y down, one panel per z. Second view: the same threads in linear order, one row per warp of 32, grouped into warpgroups of four warps. In both views the shading repeats every four warps (a warp’s position in its warpgroup), and amber marks the warpgroups: outlines and “WG” labels in the first view (plus a bracket under the z panels when one warpgroup spans several), brackets in the second; a dashed grey outline or bracket marks trailing warps that make no complete warpgroup. The chosen thread is copper and its warp is tinted. The formula is the glossary’s, from NVIDIA’s PTX ISA.',
    });
    const SHAPES = [[128, 1, 1], [256, 1, 1], [16, 16, 1], [32, 8, 1], [8, 8, 4], [96, 2, 1], [20, 10, 1]];
    let nt = [16, 16, 1], tid = [5, 6, 0];
    GG.ui.seg(f.controls, {
      label: 'Block shape (%ntid.x × .y × .z)', value: '16x16x1',
      options: SHAPES.map((s) => ({ value: s.join('x'), label: s.join(' × ') })),
      onChange: (v) => { nt = v.split('x').map(Number); tid = tid.map((t, k) => Math.min(t, nt[k] - 1)); syncSliders(); draw(); },
    });
    const sls = ['x', 'y', 'z'].map((a, k) => GG.ui.slider(f.controls, { label: '%tid.' + a, min: 0, max: 255, value: tid[k], format: (v) => String(v), onInput: (v) => { tid[k] = v; paint(); } }));
    function syncSliders() {
      sls.forEach((sl, k) => {
        sl.el.hidden = nt[k] === 1;
        sl.input.max = String(Math.max(1, nt[k] - 1));
        sl.set(tid[k], false);
      });
    }
    const two = el('div', { class: 'dsb-two on' });
    const wa = el('div', { class: 'dsb-w' }), wb = el('div', { class: 'dsb-w' });
    two.append(wa, wb);
    f.stage.append(two);
    const svgA = S('svg', { class: 'dsb-svg', role: 'img', 'aria-label': 'The thread block drawn as a grid of threads, x across and y down, one panel per z layer, shaded by warp.' }, wa);
    const svgB = S('svg', { class: 'dsb-svg', role: 'img', 'aria-label': 'The same threads in linear order: one row of 32 per warp, with brackets marking warpgroups of four warps.' }, wb);
    const formula = el('div', { class: 'dsb-formula', 'aria-live': 'polite' });
    f.stage.append(formula);
    const stL = GG.ui.stat(f.readouts, { label: 'linearIdx', value: '' });
    const stW = GG.ui.stat(f.readouts, { label: 'warp-rank', value: '' });
    const stLn = GG.ui.stat(f.readouts, { label: 'lane', value: '' });
    const stG = GG.ui.stat(f.readouts, { label: 'warpgroup', value: '', tone: 'control' });
    let A = null, B = null;
    const lin = (t) => t[0] + t[1] * nt[0] + t[2] * nt[0] * nt[1];
    function draw() {
      const n = nt[0] * nt[1] * nt[2];
      // ── view A: the block as indexed. Rows longer than 32 wrap into chunks of 32 (↩), so the
      //    cells stay large enough to see and tap; each warp's region gets an outline.
      const Wa = Math.max(200, wa.getBoundingClientRect().width || 320);
      clear(svgA);
      const gap = 12;
      const nx = nt[0], ny = nt[1], nz = nt[2];
      const wrapX = nx > 32 && nz === 1;
      const segs = wrapX ? nx / 32 : 1;
      const vx = wrapX ? 32 : nx;
      const RW = wrapX ? 22 : 0; // room for the y label on wrapped rows
      const cw = Math.min(18, (Wa - RW - (wrapX ? 14 : 0) - (nz - 1) * gap) / (vx * nz));
      const ch = Math.max(cw, 14);
      const ygap = wrapX && ny > 1 ? 6 : 0;
      const vy = (y, x) => (wrapX ? y * segs + Math.floor(x / 32) : y);
      const cellY = (y, x) => 20 + vy(y, x) * ch + y * ygap;
      const cellX = (z, x) => RW + z * (vx * cw + gap) + (wrapX ? x % 32 : x) * cw;
      const HA = 20 + ny * segs * ch + (ny - 1) * ygap + 18;
      // a warpgroup (128 threads) that runs past one z panel gets a bracket joining its panels
      const perZ = nx * ny, nWg = Math.floor(Math.ceil(n / 32) / 4);
      const wgZ = (gI) => [Math.floor((gI * 128) / perZ), Math.floor((gI * 128 + 127) / perZ)];
      const spans = nz > 1 && Array.from({ length: nWg }, (_, gI) => wgZ(gI)).some(([za, zb]) => zb > za);
      svgA.setAttribute('viewBox', `0 0 ${Wa} ${HA + (spans ? 24 : 0)}`);
      const ga = S('g', null, svgA);
      tx(ga, 0, 11, wrapX ? `as indexed: x →, y ↓ (rows of ${nx} wrap every 32)` : 'as indexed: x →, y ↓', { fill: 'var(--ink-3)', size: 10 });
      A = { cells: new Map(), cw, ch, cellX, cellY };
      const outline = [];
      for (let z = 0; z < nz; z++) {
        if (nz > 1) tx(ga, RW + z * (vx * cw + gap) + (vx * cw) / 2, HA - 4, 'z = ' + z, { fill: 'var(--ink-3)', size: 9.5, anchor: 'middle' });
        for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) {
          const L = lin([x, y, z]);
          const w = Math.floor(L / 32);
          const X0 = cellX(z, x), Y0 = cellY(y, x);
          const r = rect(ga, X0 + (cw > 4 ? 0.5 : 0), Y0 + 0.5, cw > 4 ? cw - 1 : cw, ch - 1, { rx: cw > 6 ? 1.5 : 0, fill: WG_TONES[w % 4] });
          A.cells.set(L, r);
          // outline edges where the neighbour belongs to another warp (or is outside the block)
          const other = (xx, yy) => (xx < 0 || yy < 0 || xx >= nx || yy >= ny ? true : Math.floor(lin([xx, yy, z]) / 32) !== w);
          const sameRow = (xx) => !wrapX || Math.floor(xx / 32) === Math.floor(x / 32);
          if (x === 0 || !sameRow(x - 1) || other(x - 1, y)) outline.push(`M${r1(X0)},${r1(Y0)}V${r1(Y0 + ch)}`);
          if (x === nx - 1 || !sameRow(x + 1) || other(x + 1, y)) outline.push(`M${r1(X0 + cw)},${r1(Y0)}V${r1(Y0 + ch)}`);
          if (wrapX || other(x, y - 1)) outline.push(`M${r1(X0)},${r1(Y0)}H${r1(X0 + cw)}`);
          if (wrapX || other(x, y + 1)) outline.push(`M${r1(X0)},${r1(Y0 + ch)}H${r1(X0 + cw)}`);
        }
        if (wrapX) for (let y = 0; y < ny; y++) {
          tx(ga, 0, cellY(y, 0) + ch / 2 + 3.5, 'y=' + y, { fill: 'var(--ink-3)', size: 9 });
          for (let sI = 0; sI < segs - 1; sI++) tx(ga, cellX(0, 31) + cw + 2, cellY(y, sI * 32) + ch / 2 + 3.5, '↩', { fill: 'var(--ink-3)', size: 9 });
        }
        const hit = rect(ga, RW + z * (vx * cw + gap), 20, vx * cw, HA - 38, { rx: 0, fill: 'transparent', cls: 'dsb-hit' });
        hit.addEventListener('click', (e) => {
          const pt = svgPoint(svgA, e);
          const cx = clamp(Math.floor((pt.x - RW - z * (vx * cw + gap)) / cw), 0, vx - 1);
          let x, y;
          if (wrapX) {
            let best = 0;
            for (let yy = 0; yy < ny; yy++) for (let sI = 0; sI < segs; sI++) if (pt.y >= cellY(yy, sI * 32)) best = yy * segs + sI;
            y = Math.floor(best / segs); x = (best % segs) * 32 + cx;
          } else { x = cx; y = clamp(Math.floor((pt.y - 20) / ch), 0, ny - 1); }
          tid = [x, y, z]; syncSliders(); paint();
        });
      }
      path(ga, outline.join(''), { stroke: '#0b0c12', sw: 1.6 });
      // warpgroup outlines (amber, as the WG brackets in the linear view): four whole warps, 128 threads
      const nWarps = Math.ceil(n / 32);
      const gComplete = (gI) => gI * 4 + 3 < nWarps;
      const wgOf = (L) => Math.floor(Math.floor(L / 32) / 4);
      const wgEdges = { ok: [], no: [] };
      if (wrapX) {
        // each wrapped row of 32 is exactly one warp, so a warpgroup is four consecutive rows
        for (let gI = 0; gI * 4 < nWarps; gI++) {
          const w0 = gI * 4, w1 = Math.min(nWarps, w0 + 4) - 1;
          const ya = cellY(Math.floor(w0 / segs), (w0 % segs) * 32), yb = cellY(Math.floor(w1 / segs), (w1 % segs) * 32) + ch;
          const X0 = cellX(0, 0), X1 = cellX(0, 31) + cw;
          (gComplete(gI) ? wgEdges.ok : wgEdges.no).push(`M${r1(X0 - 1)},${r1(ya - 1)}H${r1(X1 + 1)}V${r1(yb + 1)}H${r1(X0 - 1)}Z`);
        }
      } else {
        for (let z = 0; z < nz; z++) for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) {
          const L = lin([x, y, z]), gI = wgOf(L);
          const X0 = cellX(z, x), Y0 = cellY(y, x);
          const diff = (xx, yy) => (xx < 0 || yy < 0 || xx >= nx || yy >= ny ? true : wgOf(lin([xx, yy, z])) !== gI);
          const e = [];
          if (diff(x - 1, y)) e.push(`M${r1(X0)},${r1(Y0)}V${r1(Y0 + ch)}`);
          if (diff(x + 1, y)) e.push(`M${r1(X0 + cw)},${r1(Y0)}V${r1(Y0 + ch)}`);
          if (diff(x, y - 1)) e.push(`M${r1(X0)},${r1(Y0)}H${r1(X0 + cw)}`);
          if (diff(x, y + 1)) e.push(`M${r1(X0)},${r1(Y0 + ch)}H${r1(X0 + cw)}`);
          (gComplete(gI) ? wgEdges.ok : wgEdges.no).push(...e);
        }
      }
      const wgLayer = S('g', { style: 'pointer-events:none' }, ga);
      if (wgEdges.no.length) path(wgLayer, wgEdges.no.join(''), { stroke: 'var(--ink-3)', sw: 1.6, dash: '3 2' });
      if (wgEdges.ok.length) path(wgLayer, wgEdges.ok.join(''), { stroke: 'var(--control)', sw: 2, cap: 'square' });
      // a label at each complete warpgroup's first thread, and again at its first thread in every further z panel it covers
      for (let gI = 0; gI * 4 + 3 < nWarps; gI++) {
        const [za, zb] = wgZ(gI);
        for (let z = za; z <= zb; z++) {
          const L0 = z === za ? gI * 128 : z * perZ;
          const t0 = [L0 % nx, Math.floor(L0 / nx) % ny, Math.floor(L0 / perZ)];
          const lx = cellX(t0[2], t0[0]), ly = cellY(t0[1], t0[0]);
          rect(wgLayer, lx + 1, ly + 1, 34, Math.min(ch - 2, 14), { rx: 3, fill: '#11121c', stroke: 'var(--control)', sw: 1 });
          tx(wgLayer, lx + 18, ly + Math.min(ch - 2, 14) / 2 + 4.5, 'WG ' + gI, { fill: 'var(--control)', size: 10, anchor: 'middle', weight: 600 });
        }
        if (spans && zb > za) {
          const xa = cellX(za, 0) + 1, xb = cellX(zb, nx - 1) + cw - 1, yb = HA + 4;
          path(wgLayer, `M${r1(xa)},${r1(yb - 4)}V${r1(yb)}H${r1(xb)}V${r1(yb - 4)}`, { stroke: 'var(--control)', sw: 1.4 });
          tx(wgLayer, (xa + xb) / 2, yb + 13, `WG ${gI}: z = ${za}–${zb}`, { fill: 'var(--control)', size: 10, anchor: 'middle', weight: 600 });
        }
      }
      if (ny === 1 && nz === 1) tx(ga, 0, HA - 4, `${nx} threads in one row: each warp is 32 of them`, { fill: 'var(--ink-3)', size: 9.5 });
      A.sel = rect(ga, 0, 0, cw, ch, { rx: 1.5, fill: 'none', stroke: 'var(--accent)', sw: 2 });
      // ── view B: linear order, one row per warp
      const Wb = Math.max(200, wb.getBoundingClientRect().width || 320);
      clear(svgB);
      const warps = Math.ceil(n / 32);
      const LB = 56, RB = 62;
      const cwb = (Wb - LB - RB) / 32;
      const rh = 14;
      const HB = 20 + warps * rh + 6 + Math.floor((warps - 1) / 4) * 6;
      svgB.setAttribute('viewBox', `0 0 ${Wb} ${HB}`);
      const gb = S('g', null, svgB);
      tx(gb, 0, 11, 'in linear order: one row = one warp', { fill: 'var(--ink-3)', size: 10 });
      B = { cells: [], rows: [], warps };
      const rowY = (w) => 20 + w * rh + Math.floor(w / 4) * 6;
      for (let w = 0; w < warps; w++) {
        const y = rowY(w);
        B.rows.push(tx(gb, 0, y + 10, 'warp ' + w, { fill: 'var(--ink-2)', size: 9.5 }));
        for (let c = 0; c < 32; c++) {
          const L = w * 32 + c;
          const on = L < n;
          const r = rect(gb, LB + c * cwb + 0.4, y + 1, cwb - 0.8, rh - 3, { rx: 1, fill: on ? WG_TONES[w % 4] : 'none', stroke: on ? 'none' : 'var(--ink-3)', dash: on ? null : '2 2', sw: 0.6 });
          if (on) B.cells[L] = r;
        }
      }
      for (let gI = 0; gI * 4 < warps; gI++) {
        const w0 = gI * 4, w1 = Math.min(warps, w0 + 4) - 1;
        const complete = w1 - w0 === 3 && (w1 + 1) * 32 <= n + 31;
        const ya = rowY(w0) + 1, yb = rowY(w1) + rh - 2;
        const bx = Wb - RB + 6;
        const col = complete ? 'var(--control)' : 'var(--ink-3)';
        path(gb, `M${r1(bx)},${r1(ya)} L${r1(bx + 5)},${r1(ya)} L${r1(bx + 5)},${r1(yb)} L${r1(bx)},${r1(yb)}`, { stroke: col, sw: 1.3, dash: complete ? null : '3 2' });
        tx(gb, bx + 10, (ya + yb) / 2 + 4, complete ? 'WG ' + gI : 'no WG', { fill: col, size: 9.5 });
      }
      const hitB = rect(gb, LB, 20, 32 * cwb, HB - 20, { rx: 0, fill: 'transparent', cls: 'dsb-hit' });
      hitB.addEventListener('click', (e) => {
        const pt = svgPoint(svgB, e);
        let w = 0;
        for (let k = 0; k < warps; k++) if (pt.y >= rowY(k)) w = k;
        const c = clamp(Math.floor((pt.x - LB) / cwb), 0, 31);
        const L = Math.min(n - 1, w * 32 + c);
        tid = [L % nt[0], Math.floor(L / nt[0]) % nt[1], Math.floor(L / (nt[0] * nt[1]))];
        syncSliders(); paint();
      });
      B.sel = rect(gb, 0, 0, cwb, rh - 3, { rx: 1, fill: 'none', stroke: 'var(--accent)', sw: 2 });
      B.rowSel = rect(gb, LB - 2, 0, 32 * cwb + 4, rh, { rx: 3, fill: 'none', stroke: 'rgba(255,138,91,0.6)', sw: 1 });
      B.rowY = rowY; B.cwb = cwb; B.LB = LB; B.rh = rh;
      paint();
    }
    function paint() {
      if (!A || !B) return;
      const n = nt[0] * nt[1] * nt[2];
      const L = lin(tid);
      const w = Math.floor(L / 32), lane = L % 32, g = Math.floor(w / 4);
      // tint the chosen warp in both views
      const tint = (r, L2) => { const w2 = Math.floor(L2 / 32); r.setAttribute('fill', L2 === L ? 'var(--accent)' : w2 === w ? 'rgba(255,138,91,0.42)' : WG_TONES[w2 % 4]); };
      A.cells.forEach((r, L2) => tint(r, L2));
      B.cells.forEach((r, L2) => { if (r) tint(r, L2); });
      A.sel.setAttribute('x', r1(A.cellX(tid[2], tid[0])));
      A.sel.setAttribute('y', r1(A.cellY(tid[1], tid[0])));
      A.sel.setAttribute('width', r1(A.cw)); A.sel.setAttribute('height', r1(A.ch));
      B.sel.setAttribute('x', r1(B.LB + lane * B.cwb)); B.sel.setAttribute('y', r1(B.rowY(w) + 1));
      B.rowSel.setAttribute('y', r1(B.rowY(w) - 1));
      B.rows.forEach((t, k) => { t.style.fill = k === w ? 'var(--accent)' : 'var(--ink-2)'; });
      const warps = Math.ceil(n / 32);
      // a warpgroup is four whole, contiguous warps starting at a multiple of 4: the trailing warps of a
      // block whose warp count is not a multiple of 4 belong to none
      const complete = g * 4 + 3 < warps;
      const gLast = Math.min(warps - 1, g * 4 + 3);
      stL.set(fmt.int(L)); stW.set(String(w)); stLn.set(String(lane)); stG.set(complete ? String(g) : 'none', complete ? 'control' : 'danger');
      const pad = (v, k) => String(v).padStart(k);
      const [x, y, zz] = tid, [X, Y] = nt;
      if ((formula.getBoundingClientRect().width || 600) < 560) {
        formula.innerHTML =
          `<span class="c">// the glossary’s formula, this thread</span>\n` +
          `linearIdx = %tid.x + %tid.y * %ntid.x\n` +
          `          + %tid.z * %ntid.x * %ntid.y\n` +
          `          = <span class="v">${x}</span> + <span class="v">${y}</span> * <span class="s">${X}</span> + <span class="v">${zz}</span> * <span class="s">${X}</span> * <span class="s">${Y}</span>\n` +
          `          = <span class="r">${L}</span>\n` +
          `warpRank  = ${L} / 32 = <span class="r">${w}</span>\n` +
          `lane      = ${L} % 32 = <span class="r">${lane}</span>\n` +
          (complete ? `warpgroup = ${w} / 4 = <span class="r">${g}</span>\n` : `warpgroup = ${w} / 4 = ${g}, <span class="bad">but warps ${g * 4}–${gLast}\n            are not a full warpgroup</span>\n`) +
          `<span class="c">// "/" is integer division: it rounds down</span>`;
      } else formula.innerHTML =
        `<span class="c">// the glossary’s PTX formula, with this thread’s values</span>\n` +
        `linearIdx = %tid.x + %tid.y * %ntid.x + %tid.z * %ntid.x * %ntid.y\n` +
        `          = <span class="v">${pad(x, 6)}</span> + <span class="v">${pad(y, 6)}</span> * <span class="s">${pad(X, 7)}</span> + <span class="v">${pad(zz, 6)}</span> * <span class="s">${pad(X, 7)}</span> * <span class="s">${pad(Y, 7)}</span>\n` +
        `          = <span class="r">${L}</span>\n` +
        `warpRank  = linearIdx / 32 = ${L} / 32 = <span class="r">${w}</span>   <span class="c">// integer division rounds down</span>\n` +
        `lane      = linearIdx % 32 = <span class="r">${lane}</span>   <span class="c">// position inside the warp</span>\n` +
        (complete ? `warpgroup = warpRank / 4   = <span class="r">${g}</span>   <span class="c">// warps ${g * 4}–${g * 4 + 3}</span>` : `warpgroup = warpRank / 4   = ${g}   <span class="bad">// warps ${g * 4}–${gLast} only: not a full warpgroup</span>`);
      let shapeNote;
      if (nt[0] % 32 === 0 && nt[0] > 32) shapeNote = `In this shape each row of ${nt[0]} threads holds ${nt[0] / 32} whole warps.`;
      else if (nt[0] === 32) shapeNote = 'In this shape each row of 32 threads is exactly one warp.';
      else if (32 % nt[0] === 0 && n >= 32) shapeNote = `In this shape each warp covers ${32 / nt[0]} rows of ${nt[0]} threads${nt[2] > 1 ? `, and each z panel holds ${(nt[0] * nt[1]) / 32} warps` : ''}.`;
      else shapeNote = `Rows of ${nt[0]} do not divide 32, so warps start part-way through a row.`;
      const tail = n % 32 ? ` The block has ${n} threads, so its last warp holds only ${n % 32}.` : '';
      const incomplete = warps % 4 ? ` A warpgroup needs four whole warps, so warp${warps % 4 > 1 ? 's' : ''} ${warps - (warps % 4)}${warps % 4 > 1 ? '–' + (warps - 1) : ''} belong${warps % 4 > 1 ? '' : 's'} to no complete warpgroup.` : '';
      const where = complete
        ? `which is warp ${w % 4} of <b>warpgroup ${g}</b>.`
        : `which is in <b>no complete warpgroup</b>: warp ${w} would sit in warpgroup ${g}, but this block has only ${plural(warps, 'warp')}, so warps ${g * 4}–${gLast} form no warpgroup (a warpgroup is four whole warps).`;
      f.setWhy(`Thread <b>(${x}, ${y}, ${zz})</b> of a ${nt.join(' × ')} block is thread number <b>${L}</b> in x-fastest order, so it is lane ${lane} of <b>warp ${w}</b>, ${where} ${shapeNote}${tail}${complete ? incomplete : ''}`);
    }
    function svgPoint(svg, e) {
      const r = svg.getBoundingClientRect();
      const vb = svg.viewBox.baseVal;
      return { x: ((e.clientX - r.left) / r.width) * vb.width, y: ((e.clientY - r.top) / r.height) * vb.height };
    }
    syncSliders();
    onWidth(two, () => draw());
  }

  /* Fig: which four warps form a warpgroup? */
  function wgDispatch(host, ctx) {
    const f = ctx.figure(host, {
      title: 'An 8-warp dispatch: which four warps are a warpgroup?',
      hint: canHover ? 'click a warp to start the bracket there' : 'tap a warp to start the bracket there',
      wide: true,
      caption: 'Eight warps (256 threads) of one CTA. The bracket picks four contiguous warps, starting at the warp you click (or the first warp-rank you pick below; it stops at warp 4 so all four fit); underneath are the two warpgroups the definition allows. Only a bracket whose first warp-rank is a multiple of 4 lines up with one of them.',
    });
    let s0 = 0;
    const wrap = el('div', { class: 'dsb-w' });
    f.stage.append(wrap);
    const svg = S('svg', { class: 'dsb-svg', role: 'img', 'aria-label': 'Eight warps in a row, ranks 0 to 7, with a selection bracket over four contiguous warps and, below, warpgroup 0 (ranks 0 to 3) and warpgroup 1 (ranks 4 to 7).' }, wrap);
    const seg = GG.ui.seg(f.controls, {
      label: 'First warp-rank of the four', value: 0,
      options: [0, 1, 2, 3, 4].map((v) => ({ value: v, label: `${v}–${v + 3}` })),
      onChange: (v) => { s0 = v; paint(); },
    });
    const stF = GG.ui.stat(f.readouts, { label: 'first rank mod 4', value: '' });
    const stV = GG.ui.stat(f.readouts, { label: 'warpgroup?', value: '' });
    const stT = GG.ui.stat(f.readouts, { label: 'warpgroups it touches', value: '', tone: 'control' });
    let G = null;
    function draw(W) {
      clear(svg);
      const gap = W < 480 ? 5 : 10;
      const bw = (W - 7 * gap) / 8;
      const H = 168;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const g = S('g', null, svg);
      const bx = (r) => r * (bw + gap);
      const boxes = [];
      for (let r = 0; r < 8; r++) {
        const x = bx(r), y = 44;
        const gr = S('g', { class: 'dsb-hit' }, g);
        gr.addEventListener('click', () => { s0 = Math.min(r, 4); seg.set(s0, false); paint(); });
        const bg = rect(gr, x, y, bw, 56, { rx: 7, fill: 'var(--surface-2)', stroke: 'var(--line-2)' });
        tx(gr, x + bw / 2, y + 15, W < 480 ? String(r) : 'warp ' + r, { fill: 'var(--ink)', size: W < 480 ? 10 : 10.5, anchor: 'middle', weight: 600 });
        const k = Math.max(4, Math.min(10, Math.floor(bw / 7)));
        for (let q = 0; q < k; q++) {
          const sx = x + 6 + (q * (bw - 12)) / (k - 1);
          path(gr, strandD(sx, y + 22, y + 50, 1.1, 1.5), { stroke: 'var(--ink-3)', sw: 1, cap: 'round' });
        }
        boxes.push(bg);
      }
      [0, 1].forEach((gI) => {
        const x = bx(gI * 4), w = bx(gI * 4 + 3) + bw - x;
        rect(g, x, 116, w, 26, { rx: 7, fill: 'var(--control-a)', stroke: 'var(--control)' });
        tx(g, x + w / 2, 133, W < 480 ? `WG ${gI} · ${gI * 4}–${gI * 4 + 3}` : `warpgroup ${gI} · ranks ${gI * 4}–${gI * 4 + 3}`, { fill: 'var(--ink)', size: 10.5, anchor: 'middle' });
      });
      tx(g, 0, 160, 'the two valid warpgroups of an 8-warp dispatch', { fill: 'var(--ink-3)', size: 9.5 });
      const br = path(g, '', { stroke: 'var(--core)', sw: 2, join: 'round', cap: 'round' });
      const lab = tx(g, 0, 14, '', { fill: 'var(--core)', size: 11, anchor: 'middle', weight: 600 });
      G = { br, lab, boxes, bx, bw, W };
      paint();
    }
    function paint() {
      if (!G) return;
      const ok = s0 % 4 === 0;
      const col = ok ? 'var(--core)' : 'var(--danger)';
      const xa = G.bx(s0) - 2, xb = G.bx(s0 + 3) + G.bw + 2;
      G.br.setAttribute('d', `M${r1(xa)},38 L${r1(xa)},26 L${r1(xb)},26 L${r1(xb)},38`);
      G.br.setAttribute('stroke', col);
      G.lab.setAttribute('x', r1(Math.min(G.W - 60, Math.max(60, (xa + xb) / 2))));
      G.lab.textContent = ok ? `warps ${s0}–${s0 + 3}: warpgroup ${s0 / 4}` : `warps ${s0}–${s0 + 3}: not a warpgroup`;
      G.lab.style.fill = col;
      G.boxes.forEach((b, r) => {
        const inSel = r >= s0 && r < s0 + 4;
        b.setAttribute('stroke', inSel ? col : 'var(--line-2)');
        b.setAttribute('stroke-width', inSel ? '1.6' : '1');
        b.setAttribute('fill', inSel ? (ok ? 'rgba(69,212,155,0.1)' : 'rgba(255,91,110,0.1)') : 'var(--surface-2)');
      });
      stF.set(`${s0} mod 4 = ${s0 % 4}`, ok ? 'core' : 'danger');
      stT.set(ok ? `1 (warpgroup ${s0 / 4})` : '2 (0 and 1)', ok ? 'core' : 'danger');
      stV.set(ok ? 'yes' : 'no', ok ? 'core' : 'danger');
      if (ok) f.setWhy(`Warps ${s0}–${s0 + 3} are four contiguous warps, and the first warp-rank, ${s0}, is a multiple of 4. So they are <b>warpgroup ${s0 / 4}</b>: a warpgroup-level instruction like <code>wgmma.mma_async</code> coordinates their 4 × 32 = <b>128 threads</b> at once.`);
      else {
        const inG0 = [], inG1 = [];
        for (let r = s0; r < s0 + 4; r++) (r < 4 ? inG0 : inG1).push(r);
        const nm = (a) => (a.length === 1 ? 'warp ' + a[0] : 'warps ' + a.join(', ').replace(/, (\d+)$/, ' and $1'));
        f.setWhy(`Warps ${s0}–${s0 + 3} are four contiguous warps, but the first warp-rank, ${s0}, is <b>not a multiple of 4</b>, so they are not a warpgroup. They straddle two: ${nm(inG0)} belong${inG0.length === 1 ? 's' : ''} to warpgroup 0, and ${nm(inG1)} to warpgroup 1.`);
      }
    }
    onWidth(wrap, draw);
  }

  /* Fig: the SM's four subunits (shared SM component), with warpgroup 0's four warps tagged on its quadrants */
  function wgSM(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Four subunits per SM, each with a Warp Scheduler and a Tensor Core',
      hint: canHover ? 'pick what to light · hover any block' : 'pick what to light · tap any block',
      wide: true,
      caption: 'The H100 SM from the Streaming Multiprocessor entry. It has four identical quadrants, which this site calls sub-partitions (the glossary calls them “unnamed” subunits); each has its own Warp Scheduler and its own Tensor Core. The tags put warpgroup 0’s four warps one per quadrant, warp k in quadrant k (numbered 0 1 on top, 2 3 below). That one-warp-per-quadrant placement is our assumption, drawn to show the match the glossary points to; NVIDIA does not document it. Compare one <code>wgmma</code>, issued for all four warps at once, with one warp-level <code>mma</code>, which involves a single warp.',
    });
    const WHY = {
      both: `Each of the four subunits has its own ${T('warp-scheduler', 'Warp Scheduler')} (amber) and its own ${T('tensor-core', 'Tensor Core')} (green). A warpgroup has exactly four warps, and the SM has exactly four subunits: the tags show warps 0 to 3 of warpgroup 0, one per quadrant. The glossary points to this match as a likely reason for the undocumented alignment rule; NVIDIA has not said so.`,
      wgmma: `One <code>wgmma.mma_async</code> for warpgroup 0: all four of its warps execute the same instruction (PTX requires it), and with one warp in each quadrant, as tagged, the instruction reaches all four ${T('tensor-core', 'Tensor Cores')} of the SM at once, and they work on the one matrix multiply together. Press “Issue again” to watch it go out.`,
      mma: `One warp-level <code>mma.sync</code> for warp 0. It involves one warp, so, with warp 0 in the top-left quadrant as tagged, one scheduler issues it and one Tensor Core works on it while the other three wait for instructions from other warps. Keeping all four busy this way takes four warps, each issuing its own stream of <code>mma.sync</code> instructions (Fig. 5 shows what that costs).`,
      sp: 'The four sub-partitions, lit whole. Everything inside one quadrant (instruction cache, scheduler, dispatch, register file, cores, Tensor Core, load/store units) is repeated four times; only the L1 instruction cache, the Tensor Memory Accelerator, the L1 data cache and the texture units are shared by the whole SM.',
      scheduler: `Four ${T('warp-scheduler', 'Warp Schedulers')}, one per subunit, each issuing an instruction for one warp per clock (32 threads per clock).`,
      tensor: `Four ${T('tensor-core', 'Tensor Cores')}, one per subunit. Warpgroup-level matrix instructions such as <code>wgmma.mma_async</code> exist to keep these busy with large matrix multiplications.`,
    };
    const KEYS = { both: ['scheduler', 'tensor'], wgmma: ['scheduler', 'tensor'], mma: ['scheduler@0', 'tensor@0'], sp: ['sp'], scheduler: ['scheduler'], tensor: ['tensor'] };
    let sel = 'both';
    const head = el('div', { class: 'dsb-stage-h' });
    head.innerHTML = '<span><b>warpgroup 0</b> = warps 0–3 · 4 × 32 = 128 threads</span><span>tags: warp k on quadrant k (our assumption)</span>';
    f.stage.append(head);
    const sm = GG.components.sm(f.stage, { highlight: KEYS[sel], maxHeight: '78vh' });
    const ov = S('g', { class: 'dsb-wgov', style: 'pointer-events:none', 'aria-hidden': 'true' });
    let flowStop = null;
    function place() {
      const svg = sm.svg;
      if (!svg || !svg.isConnected) return;
      if (ov.parentNode !== svg) svg.appendChild(ov);
      clear(ov);
      const ctm = svg.getScreenCTM();
      if (!ctm || !ctm.a) return;
      const inv = ctm.inverse();
      const toUser = (x, y) => { const p = svg.createSVGPoint(); p.x = x; p.y = y; return p.matrixTransform(inv); };
      const u = 1 / ctm.a; // user units per screen pixel
      for (let k = 0; k < 4; k++) {
        const spEl = sm.partEl('sp', k) || sm.partEl('scheduler', k);
        if (!spEl) continue;
        const r = spEl.getBoundingClientRect();
        if (!r.width) continue;
        const a = toUser(r.left, r.top), b = toUser(r.right, r.bottom);
        const on = sel === 'wgmma' || (sel === 'mma' && k === 0);
        const dim = sel === 'mma' && k !== 0;
        // sit on the quadrant's outer corner (top row above it, bottom row below it), clear of the centred bar labels
        const w = 52 * u, h = 15 * u;
        const x = k % 2 === 0 ? a.x + 3 * u : b.x - w - 3 * u;
        const y = k < 2 ? a.y - h + 2 * u : b.y - 2 * u;
        rect(ov, x, y, w, h, { rx: 4 * u, fill: on ? 'var(--core)' : '#11121c', stroke: on ? 'var(--core)' : 'var(--control)', sw: 1.2 * u, opacity: dim ? 0.45 : 1 });
        tx(ov, x + w / 2, y + h / 2 + 3.6 * u, 'warp ' + k, { fill: on ? '#0b0c12' : 'var(--control)', size: 10.5 * u, anchor: 'middle', weight: 600, opacity: dim ? 0.6 : 1 });
      }
    }
    const mo = new MutationObserver(() => { if (ov.parentNode !== sm.svg) requestAnimationFrame(place); });
    mo.observe(sm.svg, { childList: true });
    GG.resize(sm.el, () => requestAnimationFrame(place));
    function issue() {
      if (flowStop) { flowStop(); flowStop = null; }
      if (sel === 'wgmma') flowStop = sm.flow('scheduler', 'tensor', { color: 'core', once: true, dots: 4, onDone: () => { flowStop = null; } });
      else if (sel === 'mma') flowStop = sm.flow('scheduler', 'tensor', { color: 'core', once: true, dots: 4, sub: 0, onDone: () => { flowStop = null; } });
      if (sel === 'wgmma' || sel === 'mma') sm.pulse(sel === 'wgmma' ? 'tensor' : 'tensor@0', { color: 'core', ms: 1200 });
    }
    GG.ui.seg(f.controls, {
      label: 'Light up', value: sel,
      options: [{ value: 'both', label: 'schedulers + Tensor Cores' }, { value: 'wgmma', label: 'one wgmma (a warpgroup)' }, { value: 'mma', label: 'one mma (a warp)' }, { value: 'sp', label: 'the four subunits' }, { value: 'scheduler', label: 'Warp Schedulers' }, { value: 'tensor', label: 'Tensor Cores' }],
      onChange: (v) => { sel = v; sm.highlight(KEYS[v]); f.setWhy(WHY[v]); againBtn.disabled = !(v === 'wgmma' || v === 'mma'); place(); issue(); },
    });
    const againBtn = GG.ui.button(f.controls, { icon: 'play', label: 'Issue again', onClick: () => issue() });
    againBtn.disabled = true;
    f.setWhy(WHY[sel]);
    requestAnimationFrame(place);
    return sm;
  }

  /* Fig (beyond): work per instruction, warp-level vs warpgroup-level MMA */
  function wgShapes(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Work per instruction: one warp vs one warpgroup',
      hint: 'drag N',
      wide: true,
      caption: 'Beyond the glossary. Two PTX matrix multiply-accumulate instructions for 16-bit inputs (f16 or bf16), drawn to the same scale: <code>mma.sync.m16n8k16</code>, executed by one warp, and Hopper’s <code>wgmma.mma_async.m64nNk16</code>, executed by one warpgroup, where N can be any multiple of 8 from 8 to 256 (shapes from NVIDIA’s PTX ISA). Each computes D = A × B + D with A of size M × K, B of size K × N and D of size M × N, which is 2 × M × N × K floating-point operations. Operand colours match the Tensor Core entry: <span class="c-special">A</span>, <span class="c-memory">B</span> and <span class="c-control">D</span>.',
    });
    let N = 256;
    const wrap = el('div', { class: 'dsb-w' });
    f.stage.append(wrap);
    const svg = S('svg', { class: 'dsb-svg', role: 'img', 'aria-label': 'Two matrix tiles drawn to scale: a small 16 by 8 output tile for the warp-level mma instruction and a much larger 64 by N output tile for the warpgroup-level wgmma instruction.' }, wrap);
    GG.ui.slider(f.controls, { label: 'wgmma N', min: 8, max: 256, step: 8, value: N, format: (v) => 'm64n' + v + 'k16', onInput: (v) => { N = v; draw(); } });
    const stA = GG.ui.stat(f.readouts, { label: 'FLOPs · mma (warp)', value: fmt.int(2 * 16 * 8 * 16) });
    const stB = GG.ui.stat(f.readouts, { label: 'FLOPs · wgmma', value: '', tone: 'core' });
    const stR = GG.ui.stat(f.readouts, { label: 'per instruction', value: '', tone: 'core' });
    const stP = GG.ui.stat(f.readouts, { label: 'per thread', value: '', tone: 'core' });
    void stA;
    let W = 0;
    function tile(g, x, y, s, M, Nn, K, o) {
      // B on top (K × N), A on the left (M × K), D (M × N)
      const kx = K * s;
      // operand colours follow the Tensor Core entry: A pink, B blue, D amber
      rect(g, x + kx + 6, y, Nn * s, K * s, { rx: 2, fill: 'var(--memory-a)', stroke: 'var(--memory)' });
      rect(g, x, y + kx + 6, K * s, M * s, { rx: 2, fill: 'var(--special-a)', stroke: 'var(--special)' });
      rect(g, x + kx + 6, y + kx + 6, Nn * s, M * s, { rx: 2, fill: 'var(--control-a)', stroke: 'var(--control)', sw: 1.4 });
      if (K * s >= 11) {
        tx(g, x + kx / 2, y + kx + 6 + (M * s) / 2 + 4, 'A', { fill: 'var(--special)', size: 10, anchor: 'middle', weight: 600 });
        if (Nn * s >= 11) tx(g, x + kx + 6 + (Nn * s) / 2, y + (K * s) / 2 + 4, 'B', { fill: 'var(--memory)', size: 10, anchor: 'middle', weight: 600 });
      }
      if (o.labels) {
        tx(g, x + kx + 6 + Math.max(Nn * s, 40) + 6, y + K * s * 0.5 + 4, `B · ${K} × ${Nn}`, { fill: 'var(--memory)', size: 10 });
        tx(g, x + kx + 6 + Nn * s / 2, y + kx + 6 + M * s / 2 + 4, Nn * s > 70 ? `D · ${M} × ${Nn}` : '', { fill: 'var(--ink)', size: 10.5, anchor: 'middle' });
      }
    }
    function draw(w) {
      if (w) W = w;
      if (!W) return;
      clear(svg);
      const s = (W - 30 - 110) / (16 + 256);
      const g = S('g', null, svg);
      let y = 0;
      const split = W < 560;
      tx(g, 0, y + 12, split ? 'one warp · 32 threads' : 'one warp · 32 threads · mma.sync.m16n8k16', { fill: 'var(--ink)', size: 11, weight: 600 });
      if (split) { y += 16; tx(g, 0, y + 12, 'mma.sync.m16n8k16', { fill: 'var(--ink-2)', size: 10.5 }); }
      y += 22;
      tile(g, 0, y, s, 16, 8, 16, {});
      tx(g, 16 * s + 6 + 8 * s + 10, y + 16 * s + 6 + 8 * s + 4, `D · 16 × 8 · ${fmt.int(2 * 16 * 8 * 16)} FLOPs`, { fill: 'var(--ink-2)', size: 10 });
      y += (16 + 16) * s + 6 + 20;
      tx(g, 0, y + 12, split ? 'one warpgroup · 128 threads' : `one warpgroup · 128 threads · wgmma.mma_async.m64n${N}k16`, { fill: 'var(--ink)', size: 11, weight: 600 });
      if (split) { y += 16; tx(g, 0, y + 12, `wgmma.mma_async.m64n${N}k16`, { fill: 'var(--ink-2)', size: 10.5 }); }
      y += 22;
      tile(g, 0, y, s, 64, N, 16, { labels: true });
      const flops = 2 * 64 * N * 16;
      if (N * s <= 70) tx(g, 16 * s + 6 + N * s + 10, y + 16 * s + 6 + 32 * s + 4, `D · 64 × ${N}`, { fill: 'var(--ink-2)', size: 10 });
      y += (16 + 64) * s + 6 + 8;
      svg.setAttribute('viewBox', `0 0 ${W} ${r1(y)}`);
      stB.set(fmt.int(flops));
      stR.set('× ' + fmt.sig(flops / 4096, 3));
      stP.set(flops / 128 === 128 ? 'same' : '× ' + fmt.sig((flops / 128) / (4096 / 32), 3));
      f.setWhy(`One <code>wgmma.mma_async.m64n${N}k16</code> multiplies a 64 × 16 tile of A by a 16 × ${N} tile of B into a 64 × ${N} tile of D: 2 × 64 × ${N} × 16 = <b>${fmt.int(flops)} FLOPs</b> from a single instruction, issued for 128 threads. A warp-level <code>mma.sync.m16n8k16</code> does 2 × 16 × 8 × 16 = 4,096. That is <b>${fmt.sig(flops / 4096, 3)} times</b> the work per instruction, and ${flops / 128 === 128 ? 'the same work per thread (128 FLOPs each): at N = 8 the bigger instruction only spreads the same per-thread work over four warps' : `${fmt.sig((flops / 128) / 128, 3)} times the work per thread (${fmt.int(flops / 128)} FLOPs vs 128)`}.`);
    }
    onWidth(wrap, draw);
  }

  /* Fig: four warps with mma.sync vs one warpgroup with wgmma (a schematic timeline) */
  function wgSync(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Four warps, or one warpgroup: the same 64 × 256 × 16 tile',
      hint: 'switch between warp-level and warpgroup-level',
      wide: true,
      caption: 'A schematic, not to scale: time runs left to right, one row per warp. Both versions compute the same D (64 × 256) += A (64 × 16) × B (16 × 256). Warp-level: each warp takes a 16-row slice and issues <code>mma.sync.m16n8k16</code> 256 / 8 = 32 times (one tick each); the warps finish at different moments and, before the B tile they all read from shared memory can be replaced, they meet at a barrier. Warpgroup-level: the tiles must first have arrived in shared memory; Hopper kernels usually copy them with the Tensor Memory Accelerator and wait on an <code>mbarrier</code>, a barrier object in shared memory that counts the bytes landing (1). Then <code>wgmma.fence</code> (2), the four warps issue one <code>wgmma.mma_async</code> together, commit it with <code>wgmma.commit_group</code> (3), may do other work that leaves its inputs alone while it runs, and wait for it with <code>wgmma.wait_group</code> (4). Instruction names and counts are from NVIDIA’s PTX ISA; the timings are made up.',
    });
    let mode = 'warp';
    const wrap = el('div', { class: 'dsb-w' });
    f.stage.append(wrap);
    const svg = S('svg', { class: 'dsb-svg', role: 'img', 'aria-label': 'Timeline of four warps. Warp-level: each warp issues 32 mma.sync instructions, finishes at a different time, and waits at a bar.sync barrier. Warpgroup-level: each warp waits on an mbarrier for the tiles, then the four warps issue one wgmma.mma_async together, do other work while the Tensor Cores run it, then wait for it with wgmma.wait_group.' }, wrap);
    GG.ui.seg(f.controls, {
      label: 'Matrix instructions', value: mode,
      options: [{ value: 'warp', label: 'warp-level: mma.sync' }, { value: 'wg', label: 'warpgroup-level: wgmma' }],
      onChange: (v) => { mode = v; draw(); },
    });
    const stI = GG.ui.stat(f.readouts, { label: 'MMA instructions per warp', value: '', tone: 'core' });
    const stT = GG.ui.stat(f.readouts, { label: 'warp-instruction issues', value: '', tone: 'control' });
    const stB = GG.ui.stat(f.readouts, { label: '4 warps line up around the MMAs', value: '' });
    const stD = GG.ui.stat(f.readouts, { label: 'wait for the tiles to arrive', value: '', tone: 'control' });
    let W = 0;
    function draw(w) {
      if (w) W = w;
      if (!W) return;
      clear(svg);
      const nar = W < 560;
      const fs = 10;
      const LX = nar ? 46 : 60, x1 = W - 2, span = x1 - LX;
      const X = (t) => LX + t * span;
      const top = 24, lh = 26, lg = 7;
      const Y = (k) => top + k * (lh + lg);
      const yB = Y(4) + 6;
      const H = yB + (mode === 'wg' ? (nar ? 62 : 50) : 40);
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const g = S('g', null, svg);
      tx(g, x1, 12, 'time →  (schematic)', { fill: 'var(--ink-3)', size: fs, anchor: 'end' });
      for (let k = 0; k < 4; k++) {
        tx(g, 0, Y(k) + 17, 'warp ' + k, { fill: 'var(--ink-2)', size: fs });
        rect(g, LX, Y(k), span, lh, { rx: 4, fill: 'rgba(255,255,255,0.02)', stroke: 'var(--line)' });
      }
      const bar = (k, t0, t1, fill, o) => rect(g, X(t0), Y(k) + 2, Math.max(1, X(t1) - X(t0)), lh - 4, Object.assign({ rx: 3, fill }, o || {}));
      const lab = (x, y, str, o) => tx(g, x, y, str, Object.assign({ fill: 'var(--ink)', size: fs }, o || {}));
      if (mode === 'warp') {
        const ends = [0.5, 0.58, 0.46, 0.54], tb = 0.62;
        for (let k = 0; k < 4; k++) {
          bar(k, 0.02, ends[k], 'var(--core)', { opacity: 0.75 });
          // 32 short ticks along the bottom edge: 32 separate mma.sync instructions
          const n = 32;
          let d = '';
          for (let q = 1; q < n; q++) { const xq = X(0.02 + (q * (ends[k] - 0.02)) / n); d += `M${r1(xq)},${r1(Y(k) + lh - 9)}V${r1(Y(k) + lh - 3)}`; }
          path(g, d, { stroke: '#0b0c12', sw: 1, opacity: 0.7 });
          lab(X(0.03), Y(k) + 14, nar ? '32 × mma' : '32 × mma.sync', { fill: '#0b0c12', weight: 600 });
          bar(k, ends[k], tb, 'var(--control-a)', { stroke: 'var(--control)', dash: '3 2' });
          bar(k, tb + 0.02, 0.98, 'rgba(255,255,255,0.06)', { stroke: 'var(--line-2)' });
          if (k === 0) lab(X(tb + 0.04), Y(k) + 17, nar ? 'next tile' : 'next B tile, next k-step', { fill: 'var(--ink-2)' });
        }
        line(g, X(tb + 0.01), top - 4, X(tb + 0.01), Y(3) + lh + 4, { stroke: 'var(--control)', sw: 2.2 });
        lab(X(tb + 0.01), yB + 10, nar ? 'bar.sync: all 4 wait' : 'bar.sync: all 4 warps wait here', { fill: 'var(--control)', anchor: 'middle' });
        lab(X(0.02) - (nar ? LX : 0), yB + 24, nar ? 'amber: a warp waiting · ticks: one mma each' : 'amber, dashed: a warp done early, waiting for the others · ticks: one mma.sync each', { fill: 'var(--ink-3)' });
        stI.set('32 mma.sync'); stT.set('4 × 32 = 128'); stB.set('yes: bar.sync', 'control'); stD.set('at the same bar.sync', 'control');
        f.setWhy(`<b>Warp-level.</b> Each warp computes its own 16 × 256 slice with 32 <code>mma.sync.m16n8k16</code> instructions: 4 × 32 = <b>128 warp-instruction issues</b> for the tile. The warps run on their own and finish at different moments, and all four read the same B tile from shared memory, so before anyone may overwrite it with the next one, they line up at an explicit barrier (<code>bar.sync</code>, <code>__syncthreads()</code> in CUDA C++). Early warps sit idle there.`);
      } else {
        // the tile wait (1), fence (2), the one wgmma, commit (3), other work, wait_group (4), use D
        const TL = { mb: [0.02, 0.06], fe: [0.075, 0.1], mm: [0.105, 0.16], co: [0.165, 0.185], ow: [0.21, 0.52], wa: [0.53, 0.57], ud: [0.6, 0.98] };
        rect(g, X(TL.mm[1] + 0.005), top - 2, X(0.565) - X(TL.mm[1] + 0.005), Y(3) + lh + 2 - (top - 2), { rx: 6, fill: 'rgba(69,212,155,0.08)', stroke: 'rgba(69,212,155,0.5)', dash: '4 3' });
        lab(X(0.36), Y(4) + 2, nar ? 'Tensor Cores busy' : 'the Tensor Cores run the 64 × 256 × 16 multiply', { fill: 'var(--core)', anchor: 'middle' });
        const ends = [0.05, 0.06, 0.04, 0.055];
        for (let k = 0; k < 4; k++) {
          // each warp waits on the mbarrier until the tile bytes have landed; the warps arrive at their own times
          bar(k, TL.mb[0], ends[k], 'var(--control-a)', { stroke: 'var(--control)', dash: '3 2' });
          bar(k, TL.fe[0], TL.fe[1], 'var(--control)', { opacity: 0.8 });
          bar(k, TL.co[0], TL.co[1], 'var(--control)', { opacity: 0.8 });
          bar(k, TL.ow[0], TL.ow[1], 'rgba(255,255,255,0.08)', { stroke: 'var(--line-2)' });
          if (!nar || k === 0) lab(X(TL.ow[0] + 0.015), Y(k) + 17, nar ? 'other work' : 'other work: softmax, or loads into buffer 2', { fill: 'var(--ink-2)' });
          bar(k, TL.wa[0], TL.wa[1], 'var(--control)', { opacity: 0.8 });
          bar(k, TL.ud[0], TL.ud[1], 'rgba(255,255,255,0.06)', { stroke: 'var(--line-2)' });
          if (k === 0) lab(X(TL.ud[0] + 0.02), Y(k) + 17, 'use D', { fill: 'var(--ink-2)' });
        }
        rect(g, X(TL.mm[0]), top - 2, X(TL.mm[1]) - X(TL.mm[0]), Y(3) + lh + 2 - (top - 2), { rx: 4, fill: 'var(--core)', opacity: 0.85 });
        const vx = X((TL.mm[0] + TL.mm[1]) / 2);
        const vt = tx(g, vx, Y(1) + lh + 4, nar ? 'wgmma' : 'wgmma.mma_async', { fill: '#0b0c12', size: fs, weight: 600, anchor: 'middle' });
        vt.setAttribute('transform', `rotate(-90 ${r1(vx)} ${r1(Y(1) + lh + 4)})`);
        // step numbers above the rows, names below
        [['1', TL.mb], ['2', TL.fe], ['3', TL.co], ['4', TL.wa]].forEach(([n, tt]) => lab(X((tt[0] + tt[1]) / 2), top - 6, n, { fill: 'var(--control)', anchor: 'middle', weight: 600 }));
        if (nar) {
          lab(0, yB + 10, '1 mbarrier: tiles here · 2 fence', { fill: 'var(--control)' });
          lab(0, yB + 23, '3 commit · 4 wait_group', { fill: 'var(--control)' });
          lab(0, yB + 37, 'one instruction for all 4 warps', { fill: 'var(--ink-3)' });
          lab(0, yB + 50, 'no line-up of the 4 around it', { fill: 'var(--ink-3)' });
        } else {
          lab(X(TL.mb[0]), yB + 10, '1 mbarrier wait: tiles arrived', { fill: 'var(--control)' });
          lab(X(TL.wa[0]), yB + 10, '4 wait_group', { fill: 'var(--control)' });
          lab(X(TL.mb[0]), yB + 24, '2 wgmma.fence · 3 commit_group', { fill: 'var(--control)' });
          lab(X(TL.mb[0]), yB + 38, 'one instruction spans all four warps: no line-up of the four around it, and each waits for data on its own', { fill: 'var(--ink-3)' });
        }
        stI.set('1 wgmma'); stT.set('4 × 1 = 4'); stB.set('no', 'core'); stD.set('mbarrier, each warp', 'control');
        f.setWhy(`<b>Warpgroup-level.</b> The tiles still have to arrive before a <code>wgmma</code> reads them: Hopper kernels usually have the ${T('tensor-memory-accelerator', 'Tensor Memory Accelerator')} copy them into shared memory and wait on an <code>mbarrier</code> until the bytes have landed (1). After <code>wgmma.fence</code> (2), the four warps execute one <code>wgmma.mma_async.m64n256k16</code> together (its <code>.aligned</code> qualifier requires all threads of the warpgroup to run the same instruction): <b>4 warp-instruction issues</b> instead of 128. It is asynchronous: after <code>wgmma.commit_group</code> (3) the warps may do other work, as long as they leave the instruction’s inputs alone until it is done (so the next tiles go into a second buffer), and <code>wgmma.wait_group</code> (4) is where each waits for the result. What disappears is the line-up of four warps around each matrix instruction; waiting for data remains.`);
      }
    }
    onWidth(wrap, draw);
  }

  /* Fig: the cast of warps in Flash Attention 4, from Modal's write-up */
  function wgFA4(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Flash Attention 4: one pipeline, five kinds of warp',
      hint: canHover ? 'pick a role · hover a row' : 'pick a role · tap a row',
      wide: true,
      caption: 'The warps of one Flash Attention 4 program instance, grouped by the job each is given, after Modal’s <a href="https://modal.com/blog/reverse-engineer-flash-attention-4">reverse-engineering of the kernel</a>. Amber brackets mark the warpgroups the post names: two for softmax, one for correction. Each chip is one warp of 32 threads, coloured by what it mostly drives: pink for the warps that move tiles between memories, green for those that compute. How the roles map to warp-ranks is not shown. The kernel targets Blackwell GPUs.',
    });
    const ROLES = [
      { k: 'load', name: 'Load', n: 1, wg: 0, col: 'special', d: 'loads query, key and value tiles from global memory into shared memory, using the Tensor Memory Accelerator to fire off copies asynchronously' },
      { k: 'mma', name: 'MMA', n: 1, wg: 0, col: 'core', d: 'computes unnormalized attention scores from query and key tiles and accumulates score-weighted value tiles into the output tiles; a single leader thread issues each matrix instruction, unlike the warpgroup-wide MMAs of Hopper' },
      { k: 'softmax', name: 'Softmax', n: 8, wg: 2, col: 'core', d: 'computes normalized attention scores and tracks running statistics (max, sum). The post: “The core softmax operation is implemented by two warpgroups, aka eight warps”, one for each of the two query/output tile workstreams' },
      { k: 'correction', name: 'Correction', n: 4, wg: 1, col: 'core', d: 'watches for updates to the normalization scale and re-normalizes the output tiles. “Like the Softmax warps, the four Correction warps form a warpgroup”' },
      { k: 'epilogue', name: 'Epilogue', n: 2, nTxt: '1 or 2', wg: 0, col: 'special', d: 'stores completed output tiles from shared memory into global memory; there are one or two of them' },
    ];
    let sel = 'all', hover = null;
    const opts = [{ value: 'all', label: 'all roles' }].concat(ROLES.map((r) => ({ value: r.k, label: r.name })));
    const segC = GG.ui.seg(f.controls, { label: 'Role', value: sel, options: opts, onChange: (v) => { sel = v; hover = null; paint(); } });
    void segC;
    const stN = GG.ui.stat(f.readouts, { label: 'warps', value: '', tone: 'control' });
    const stG = GG.ui.stat(f.readouts, { label: 'warpgroups', value: '', tone: 'control' });
    const wrap = el('div', { class: 'dsb-w' });
    f.stage.append(wrap);
    const svg = S('svg', { class: 'dsb-svg', role: 'img', 'aria-label': 'Five rows of warp chips: one Load warp, one MMA warp, eight Softmax warps bracketed as two warpgroups, four Correction warps bracketed as one warpgroup, and one or two Epilogue warps.' }, wrap);
    let rows = [];
    function draw(W) {
      clear(svg);
      const nar = W < 560;
      const LW = nar ? 0 : 170;
      const cw = Math.min(56, (W - LW - 7 * 6) / 8), chH = 26;
      const rh = nar ? 64 : 48;
      const g = S('g', null, svg);
      rows = [];
      ROLES.forEach((r, i) => {
        const y = i * rh + (nar ? 16 : 6);
        const gr = S('g', { class: 'dsb-hit', 'data-k': r.k }, g);
        rect(gr, 0, y - (nar ? 16 : 6), W, rh - 2, { rx: 8, fill: 'transparent' });
        const nm = tx(gr, 0, nar ? y - 4 : y + 17, `${r.name} · ${r.nTxt || r.n} warp${r.n > 1 ? 's' : ''}`, { fill: 'var(--ink)', size: 11, weight: 600 });
        const chips = [];
        for (let q = 0; q < r.n; q++) {
          const x = LW + q * (cw + 6);
          const opt = r.k === 'epilogue' && q === 1;
          const c = rect(gr, x, y, cw, chH, { rx: 6, fill: opt ? 'none' : `var(--${r.col}-a)`, stroke: `var(--${r.col})`, dash: opt ? '3 3' : null });
          for (let s2 = 0; s2 < 4; s2++) path(gr, strandD(x + 8 + (s2 * (cw - 16)) / 3, y + 5, y + chH - 5, 1, 1.2), { stroke: 'var(--ink-3)', sw: 1, cap: 'round' });
          chips.push(c);
        }
        for (let wgI = 0; wgI < r.wg; wgI++) {
          const xa = LW + wgI * 4 * (cw + 6) - 1, xb = LW + (wgI * 4 + 3) * (cw + 6) + cw + 1;
          path(gr, `M${r1(xa)},${r1(y + chH + 4)} L${r1(xa)},${r1(y + chH + 9)} L${r1(xb)},${r1(y + chH + 9)} L${r1(xb)},${r1(y + chH + 4)}`, { stroke: 'var(--control)', sw: 1.5 });
          tx(gr, (xa + xb) / 2, y + chH + 20, nar ? `WG ${wgI}` : `warpgroup${r.wg > 1 ? ' ' + (wgI + 1) : ''}`, { fill: 'var(--control)', size: 10, anchor: 'middle' });
        }
        rows.push({ r, gr, nm });
      });
      svg.setAttribute('viewBox', `0 0 ${W} ${ROLES.length * rh + (nar ? 14 : 8)}`);
      paint();
    }
    function paint() {
      const k = hover || sel;
      rows.forEach(({ r, gr }) => { gr.style.opacity = k === 'all' || k === r.k ? '1' : '0.3'; });
      if (k === 'all') {
        stN.set('15 or 16'); stG.set('3');
        f.setWhy(`Flash Attention 4 splits each tile’s work into an asynchronous pipeline and gives each stage its own warps, a technique called <b>warp specialization</b>: one Load warp, one MMA warp, eight Softmax warps, four Correction warps and one or two Epilogue warps, 15 or 16 in all. The warp schedulers switch between them every clock, so while one stage stalls, another runs. Three of the groups are warpgroups. The post also notes that it saw nothing in this Blackwell kernel that made explicit use of warpgroups, and suggests their alignment “may lead to more even distribution of work across warp schedulers/subunits of the SM”.`);
      } else {
        const r = ROLES.find((x) => x.k === k);
        stN.set(r.nTxt || String(r.n)); stG.set(String(r.wg));
        f.setWhy(`<b>${r.name}</b> (${r.nTxt || r.n} warp${r.n > 1 ? 's' : ''}${r.wg ? `, ${plural(r.wg, 'warpgroup')}` : ''}): ${r.d}.`);
      }
    }
    svg.addEventListener('pointerover', (e) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      const gr = e.target.closest && e.target.closest('[data-k]');
      const k = gr ? gr.getAttribute('data-k') : null;
      if (k !== hover) { hover = k; paint(); }
    });
    svg.addEventListener('pointerleave', () => { if (hover) { hover = null; paint(); } });
    svg.addEventListener('click', (e) => {
      const gr = e.target.closest && e.target.closest('[data-k]');
      if (!gr) return;
      const b = f.controls.querySelector(`button[data-value="${gr.getAttribute('data-k')}"]`);
      if (b) b.click();
    });
    onWidth(wrap, draw);
  }

  GG.entry('warpgroup', {
    render(body, ctx) {
      const s = ctx.html(body, `
<p>A <strong>warpgroup</strong> is a set of four contiguous ${T('warp', 'warps')} such that the warp-rank of the first warp is a multiple of 4. Two conditions, then. <em>Contiguous</em>: the ranks are consecutive, k, k + 1, k + 2 and k + 3. <em>Aligned</em>: k is 0, 4, 8, 12 and so on. Warps 0 to 3 form a warpgroup and so do warps 4 to 7, but warps 2 to 5, though contiguous, do not.</p>
<p>Upon dispatching a warpgroup-level instruction, we coordinate 128 ${T('thread', 'threads')}: 4 warps per warpgroup × 32 threads per warp. Operating at a larger granularity removes the need for explicit inter-warp synchronization: the four warps act on the instruction together, so they do not have to line each other up around it (Fig. 5 shows the difference). It also allows work to be performed on larger problem sizes per instruction, especially larger matrix multiplications. Larger matrix multiplications more readily saturate the massive ${T('arithmetic-bandwidth', 'arithmetic bandwidth')} of the ${T('tensor-core', 'Tensor Cores')} of recent data center GPUs.</p>
<div data-slot="nums"></div>
<h3>Where warpgroups come from</h3>
<p>Warpgroups were introduced in NVIDIA’s Hopper ${T('streaming-multiprocessor-architecture', 'Streaming Multiprocessor architecture')} (the H100’s), where they are used to support warpgroup-level matrix multiplication, like <code>wgmma.mma_async</code>. The name reads as <em>w</em>arp<em>g</em>roup <em>m</em>atrix <em>m</em>ultiply-<em>a</em>ccumulate, and <em>async</em> means the instruction is asynchronous: the threads issue it, may go on with other work, and later wait for the result. See <a href="https://research.colfax-intl.com/cutlass-tutorial-wgmma-hopper/">this blog post from Colfax</a> for a deep dive. Fig. 4 shows how much bigger one warpgroup instruction is than its warp-level cousin.</p>
<p>Warpgroups feature prominently in the organization of pipeline components of high-performance Hopper and Blackwell ${T('kernel', 'kernels')}, like <a href="https://modal.com/blog/reverse-engineer-flash-attention-4">Flash Attention 4</a>. A “pipeline component” is one stage of a kernel that runs as an asynchronous pipeline: loading tiles, multiplying them, post-processing the results, storing them. In such kernels each stage is given its own warps, which is called <em>warp specialization</em>, and the warp schedulers switch between the stages every clock, so one stage’s stall is hidden by another’s work. In Flash Attention 4 the softmax stage is two warpgroups and the correction stage one; Fig. 6, at the end of this entry, shows the whole cast.</p>
${GG.noteHTML('beyond', `<p><b>The wgmma recipe</b>, as NVIDIA’s <a href="https://docs.nvidia.com/cuda/parallel-thread-execution/index.html">PTX ISA</a> lays it out: all threads of a warpgroup collectively load A, B and D into ${T('registers', 'registers')} or ${T('shared-memory', 'shared memory')} (in the instruction, D, the accumulator, is a set of registers; A may be in registers or shared memory; B must be in shared memory); fence, with <code>wgmma.fence</code> to mark that the registers and shared memory have been written and, when shared memory was written with ordinary stores, <code>fence.proxy.async</code>, which makes those writes visible to the “async proxy” that <code>wgmma</code> reads through; issue <code>wgmma.mma_async</code>; commit the outstanding operations into a “wgmma-group” with <code>wgmma.commit_group</code>; then wait for that group with <code>wgmma.wait_group</code>. The instruction’s mandatory <code>.aligned</code> qualifier means “all threads in the warpgroup must execute the same <code>wgmma.mma_async</code> instruction”, and it requires the <code>sm_90a</code> target, so this is Hopper-specific code.</p>`)}
<h3>Finding a warp’s rank</h3>
<p>In ${T('parallel-thread-execution', 'Parallel Thread Execution (PTX)')} IR, the warp-rank of a warp is:</p>
<div data-slot="code"></div>
<p>where <code>tid</code> is the thread index, accessed via special PTX ${T('registers', 'registers')}. <code>%tid.x</code>, <code>%tid.y</code> and <code>%tid.z</code> are a thread’s coordinates inside its block (<code>threadIdx</code> in CUDA C++), and <code>%ntid</code> holds the block’s size in each dimension (<code>blockDim</code>). The first line flattens the three coordinates into one number, counting x fastest, then y, then z, exactly like reading a book: across a row, then down, then to the next page. The second line cuts that numbering into runs of 32 with integer division. Try it in Fig. 1: the same thread can land in very different warps depending on the block’s shape.</p>
<div data-slot="calc" class="wide"></div>
${GG.noteHTML('beyond', `<p><b>Why not just read a warp ID?</b> PTX does have a <code>%warpid</code> register, but its documentation warns that it “returns the location of a thread at the moment when read, but its value may change during execution, e.g., due to rescheduling of threads following preemption. For this reason, <code>%ctaid</code> and <code>%tid</code> should be used to compute a virtual warp index if such a value is needed in kernel code.” The warp-rank formula is that virtual index.</p>`)}
<h3>An 8-warp dispatch</h3>
<p>So the valid warpgroups for an 8-warp dispatch are:</p>
<ul>
<li><strong>Warpgroup 0</strong>: warp-ranks 0, 1, 2, and 3</li>
<li><strong>Warpgroup 1</strong>: warp-ranks 4, 5, 6, and 7.</li>
</ul>
<p>Click any warp in Fig. 2 to move the bracket there and see why no other set of four works. A 16 × 16 block, like the tiled matmul in the ${T('kernel', 'Kernel')} entry, is exactly such an 8-warp dispatch.</p>
<div data-slot="disp" class="wide"></div>
<h3>Why the alignment?</h3>
<p>To our knowledge (the glossary’s authors write), the purpose of the warp-rank alignment restriction is not documented. But ${T('streaming-multiprocessor', 'Streaming Multiprocessors')} for recent data center GPUs appear to contain four (unnamed) subunits, each with their own ${T('warp-scheduler', 'Warp Scheduler')} and Tensor Core. Four warps to a warpgroup, four subunits to an SM: Fig. 3 lights them up.</p>
<div data-slot="sm" class="wide"></div>
<h3>Bigger instructions, bigger matrices</h3>
<p>“Larger problem sizes per instruction” is easy to see with real instruction shapes. In Fig. 4, the warp-level and warpgroup-level matrix instructions are drawn to the same scale.</p>
<div data-slot="shape" class="wide"></div>
<h3>No barrier, and no waiting in line</h3>
<p>The other two claims, that a warpgroup instruction removes explicit inter-warp synchronization and that <code>wgmma</code> is asynchronous, are about time. Fig. 5 puts the same 64 × 256 × 16 multiply on a timeline twice: once as four warps each issuing their own <code>mma.sync</code> instructions, once as one warpgroup issuing a single <code>wgmma.mma_async</code>.</p>
<div data-slot="sync" class="wide"></div>
<h3>Warpgroups in a real pipeline</h3>
<p>Modal’s reverse-engineering of <a href="https://modal.com/blog/reverse-engineer-flash-attention-4">Flash Attention 4</a> lists the warps of one program instance by job. Fig. 6 lines them up: one warp to load, one to issue the matrix multiplies, two warpgroups for softmax, one warpgroup for correction, and one or two warps to store the results.</p>
<div data-slot="fa4" class="wide"></div>
<div data-slot="read"></div>`);

      ctx.numbers(s.nums, [
        { value: '4', label: 'contiguous warps per warpgroup', tone: 'control' },
        { value: '128', label: 'threads per warpgroup: 4 × 32', tone: 'core' },
        { value: '2', label: 'warpgroups in an 8-warp (256-thread) dispatch', tone: 'control' },
      ]);
      guard(s.code, 'Warp-rank code', () => ctx.code(s.code, {
        lang: 'cpp', code: WG_CODE, caption: 'warp-rank in PTX, verbatim from the glossary',
        notes: {
          1: '<code>%tid.x</code>, <code>%tid.y</code>, <code>%tid.z</code>: this thread’s position in its block (CTA). <code>%ntid.x</code>, <code>%ntid.y</code>: the block’s width and height. x varies fastest, then y, then z.',
          2: 'Integer division by the warp size, 32: threads 0–31 are warp 0, 32–63 warp 1, and so on. (The two lines mix C syntax with PTX register names, as pseudocode.)',
        },
      }));
      guard(s.calc, 'Warp-rank calculator', () => wgCalc(s.calc, ctx));
      guard(s.disp, 'Warpgroup dispatch', () => wgDispatch(s.disp, ctx));
      guard(s.sm, 'SM subunits', () => wgSM(s.sm, ctx));
      guard(s.shape, 'Instruction shapes', () => wgShapes(s.shape, ctx));
      guard(s.sync, 'Warp vs warpgroup timeline', () => wgSync(s.sync, ctx));
      guard(s.fa4, 'Flash Attention 4 warps', () => wgFA4(s.fa4, ctx));
      ctx.reading(s.read, [
        { href: 'https://research.colfax-intl.com/cutlass-tutorial-wgmma-hopper/', label: 'Colfax Research: CUTLASS tutorial, WGMMA on Hopper', note: 'a deep dive into warpgroup-level matrix multiplication' },
        { href: 'https://modal.com/blog/reverse-engineer-flash-attention-4', label: 'Modal: reverse-engineering Flash Attention 4', note: 'warpgroups in a real Hopper/Blackwell pipeline' },
        { href: 'https://docs.nvidia.com/cuda/parallel-thread-execution/index.html', label: 'NVIDIA: PTX ISA, warpgroup-level matrix instructions', note: 'beyond the glossary: the warpgroup definition, wgmma shapes and the commit/wait protocol' },
      ]);
    },
  });

  /* ═════════════════════════════ Cooperative Thread Array ═════════════════════════════ */

  const CTA_SUM = `__global__ void sum(const int* in, int* total) {
    __shared__ int vals[8];
    vals[threadIdx.x] = in[blockIdx.x * 8 + threadIdx.x];
    __syncthreads();                   // barrier: the whole CTA waits here
    if (threadIdx.x == 0) {
        int s = 0;
        for (int k = 0; k < 8; k++) s += vals[k];
        atomicAdd(total, s);           // across CTAs: only via global memory
    }
}
// launched as sum<<<2, 8>>>(in, total), with *total == 0 beforehand`;

  /* Fig: coordinating inside a CTA, and across CTAs */
  function ctaCoord(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Coordinating inside a CTA, and across CTAs',
      hint: 'step through',
      wide: true,
      caption: `A small reduction, launched as two CTAs of 8 threads (tiny, for the picture: real CTAs usually have hundreds of threads, in whole warps of 32, so these 8 would be lanes of one partly filled warp). Inside each CTA, threads share values through shared memory in their SM’s L1 data cache and wait for each other at a barrier: in the barrier step, each thread runs down to the bar at its own pace and turns amber while it waits. The two CTAs have no barrier between them; they combine their results with an atomic add on global memory, one update after the other. What the atomic prevents, a lost update when two plain read-add-writes interleave, is the subject of ${T('global-memory', 'Global Memory')} Fig. 3.` + (NARROW ? ' On a narrow screen the code’s comments move into the line under it.' : ''),
    });
    f.root.classList.add('dsb-fig-code');
    const cs = splitComments(CTA_SUM);
    const code = GG.code(f.stage, { lang: 'cuda', code: cs.code, caption: 'beyond the glossary: sum 16 numbers with two CTAs', copy: false });
    const cmt = NARROW ? el('div', { class: 'dsb-detail', 'aria-live': 'polite' }) : null;
    if (cmt) f.stage.append(cmt);
    const wrap = el('div', { class: 'dsb-w', style: 'margin-top:12px' });
    f.stage.append(wrap);
    const svg = S('svg', { class: 'dsb-svg', role: 'img', 'aria-label': 'Two SMs, each running one CTA of eight threads with a shared memory strip and a barrier, above global memory holding sixteen inputs and a total.' }, wrap);
    const STEPS = [
      { label: 'Launch', lines: [1], tone: 'control' },
      { label: 'Load into shared memory', lines: [2, 3], tone: 'memory' },
      { label: 'Barrier', lines: [4], tone: 'control' },
      { label: 'Thread 0 sums', lines: [5, 6, 7], tone: 'core' },
      { label: 'Line 8: first update', lines: [8], tone: 'memory' },
      { label: 'Line 8: second update', lines: [8], tone: 'memory' },
      { label: 'No barrier across CTAs', lines: [], tone: null },
    ];
    const SUMS = [36, 100];
    let step = 0, G = null, first = 0;
    // barrier animation: each thread reaches the barrier at its own time (seconds); bt = time since the step began
    const ARR = [[0.35, 0.9, 0.55, 1.25, 0.7, 0.45, 1.05, 0.8], [0.6, 0.4, 1.15, 0.75, 0.5, 1.3, 0.65, 0.95]];
    const BEND = 1.3;
    let bt = BEND;
    const banim = GG.anim(svg, (t, dt) => { bt = Math.min(BEND + 0.2, bt + dt); paint(); if (bt >= BEND + 0.2) banim.stop(); }, { autostart: false });
    const stB = GG.ui.stat(f.readouts, { label: 'barriers passed', value: '0', tone: 'control' });
    const stR = GG.ui.stat(f.readouts, { label: 'arrived at the barrier', value: '—', tone: 'control' });
    const stA = GG.ui.stat(f.readouts, { label: 'atomics on global', value: '0', tone: 'memory' });
    const stT = GG.ui.stat(f.readouts, { label: 'total', value: '0' });
    // under reduced motion the barrier opens on a still frame part-way through the arrivals
    const RM_FRAMES = [0.3, 0.7, 1.0, BEND + 0.2];
    const stp = GG.ui.stepper(f.controls, { label: 'Step', steps: STEPS, autoplay: 1900, onStep: (i) => {
      step = i;
      if (i === 2 && !GG.reducedMotion) { bt = 0; banim.start(); }
      else if (i === 2) { banim.stop(); bt = 0.7; }
      else { banim.stop(); bt = BEND + 0.2; }
      paint();
    } });
    GG.ui.button(f.controls, { icon: 'reset', label: 'Replay arrival', title: 'Watch the threads reach the barrier again', onClick: () => {
      if (step !== 2) { stp.go(2); return; }
      if (GG.reducedMotion) { const k = RM_FRAMES.findIndex((v) => v > bt + 1e-9); bt = RM_FRAMES[k < 0 ? 0 : k]; paint(); }
      else { bt = 0; banim.start(); }
    } });
    GG.ui.seg(f.controls, {
      label: 'First to reach line 8', value: first,
      options: [{ value: 0, label: 'CTA 0' }, { value: 1, label: 'CTA 1' }],
      onChange: (v) => { first = v; paint(); },
    });
    const WHY = [
      `The kernel is launched as <b>2 CTAs of 8 threads</b>. Each CTA is scheduled onto one ${T('streaming-multiprocessor', 'SM')} and stays there; its ${T('shared-memory', 'shared memory')} array <code>vals</code> is carved out of that SM’s ${T('l1-data-cache', 'L1 data cache')}. The 16 inputs and the <code>total</code> live in ${T('global-memory', 'global memory')}.`,
      'Every thread loads one input from global memory and writes it into its CTA’s shared memory. CTA 0 gets inputs 1 to 8; CTA 1 gets 9 to 16. Each CTA sees only its own <code>vals</code>.',
      '<code>__syncthreads()</code> is a barrier: no thread of the CTA goes past it until all of its threads have arrived. Threads get there at different times (amber: arrived, waiting); only when all 8 of a CTA are there do they go on (green). After it, thread 0 can safely read values the other seven wrote. This is the fast, on-chip coordination a CTA is for.',
      'Thread 0 of each CTA adds up its eight values straight out of shared memory: 36 in CTA 0, 100 in CTA 1. The other threads are done.',
      null,
      null,
      '<b>What CTAs cannot do</b>: wait for each other at a barrier. <code>__syncthreads()</code> only covers the threads of one CTA. CTA 1 cannot wait for CTA 0 to finish its sum; the two coordinate only through global memory, e.g. with atomics, and the kernel’s result must not depend on their order.',
    ];
    function whyUpdate() {
      const a = first, b = 1 - first;
      return step === 4
        ? `To combine the two partial sums, the CTAs must go through global memory. CTA ${a} reaches line 8 first. <code>atomicAdd</code> reads <code>total</code>, adds ${SUMS[a]} and writes the result back as one indivisible step: total = 0 + ${SUMS[a]} = <b>${SUMS[a]}</b>. Nothing else can touch <code>total</code> in between.`
        : `Then CTA ${b}’s <code>atomicAdd</code>: ${SUMS[a]} + ${SUMS[b]} = <b>136</b>. Both updates land, in whichever order the CTAs get there: 0 → 36 → 136, or 0 → 100 → 136. Switch “First to reach line 8”: the order changes, the result does not.`;
    }
    const SY0 = 26, SY1 = 82; // strand top and the barrier
    function draw(W) {
      clear(svg);
      const gap = 16, pw = (W - gap) / 2;
      const GY = 186; // global memory panel top
      const H = GY + 92;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const g = S('g', null, svg);
      G = { cta: [], W, pw, gap, GY };
      for (let c = 0; c < 2; c++) {
        const x0 = c * (pw + gap);
        const gc = S('g', null, g);
        rect(gc, x0, 0, pw, 176, { rx: 10, fill: 'rgba(255,255,255,0.02)', stroke: 'var(--line-2)' });
        tx(gc, x0 + 10, 16, `SM ${c}`, { fill: 'var(--ink-2)', size: 10.5, weight: 600 });
        tx(gc, x0 + pw - 10, 16, pw < 260 ? `CTA ${c}` : `CTA ${c} · blockIdx.x = ${c}`, { fill: 'var(--ink-3)', size: 10, anchor: 'end' });
        const cw = (pw - 20) / 8;
        const X = (j) => x0 + 10 + cw * (j + 0.5);
        const strands = [];
        for (let j = 0; j < 8; j++) strands.push(path(gc, strandD(X(j), SY0, SY1, 1.6, 1.5), { stroke: 'var(--ink-2)', sw: 1.4, cap: 'round' }));
        const bar = rect(gc, x0 + 8, 88, pw - 16, 6, { rx: 3, fill: 'var(--control)', opacity: 0 });
        const barT = tx(gc, x0 + pw / 2, 104, '', { fill: 'var(--control)', size: 9.5, anchor: 'middle', opacity: 0 });
        tx(gc, x0 + 10, 118, pw < 200 ? 'shared · vals[8]' : 'shared memory · vals[8]', { fill: 'var(--memory)', size: 9.5 });
        const cells = [], cellT = [];
        for (let j = 0; j < 8; j++) {
          cells.push(rect(gc, x0 + 10 + cw * j + 1, 124, cw - 2, 18, { rx: 3, fill: 'none', stroke: 'var(--memory)' }));
          cellT.push(tx(gc, X(j), 137, '', { fill: 'var(--ink)', size: 9.5, anchor: 'middle' }));
        }
        const sumG = S('g', null, gc);
        const sumBox = rect(sumG, x0 + 10, 150, pw - 20, 18, { rx: 4, fill: 'none', stroke: 'var(--line-2)' });
        const sumT = tx(sumG, x0 + pw / 2, 163, '', { fill: 'var(--ink)', size: 9.5, anchor: 'middle' });
        G.cta.push({ strands, bar, barT, cells, cellT, sumG, sumBox, sumT, X, x0 });
      }
      // no cross-CTA barrier marker
      const nb = S('g', { opacity: 0 }, g);
      line(nb, pw + gap / 2, 30, pw + gap / 2, 150, { stroke: 'var(--danger)', sw: 1.5, dash: '4 3' });
      path(nb, `M${r1(pw + gap / 2 - 6)},${r1(84)} l12,12 M${r1(pw + gap / 2 + 6)},${r1(84)} l-12,12`, { stroke: 'var(--danger)', sw: 2.2, cap: 'round' });
      G.nb = nb;
      // global memory: the inputs on top, the label and the total underneath, so flows up to shared memory cross nothing
      const flows = S('g', null, g);
      const gm = S('g', null, g);
      rect(gm, 0, GY, W, 90, { rx: 10, fill: 'var(--memory-a)', stroke: 'rgba(111,166,255,0.55)' });
      G.inC = []; G.flows = [];
      for (let c = 0; c < 2; c++) {
        const { X } = G.cta[c];
        const cw = (pw - 20) / 8;
        for (let j = 0; j < 8; j++) {
          const x = X(j);
          const r = rect(gm, x - cw / 2 + 1, GY + 8, cw - 2, 18, { rx: 3, fill: 'rgba(111,166,255,0.18)', stroke: 'var(--memory)' });
          tx(gm, x, GY + 21, String(c * 8 + j + 1), { fill: 'var(--ink)', size: 9.5, anchor: 'middle' });
          G.inC.push(r);
          G.flows.push(line(flows, x, GY + 6, x, 144, { stroke: 'var(--memory)', sw: 1.2, dash: '2 3', opacity: 0 }));
        }
      }
      tx(gm, 10, GY + 44, W < 480 ? 'global memory' : 'global memory, in GPU RAM', { fill: 'var(--ink-2)', size: 10 });
      const tw = Math.min(150, W * 0.36);
      G.tw = tw;
      G.totBox = rect(gm, (W - tw) / 2, GY + 58, tw, 22, { rx: 5, fill: 'var(--surface-3)', stroke: 'var(--memory)' });
      G.totT = tx(gm, W / 2, GY + 73, 'total = 0', { fill: 'var(--ink)', size: 10.5, anchor: 'middle', weight: 600 });
      G.at = [0, 1].map(() => path(g, '', { stroke: 'var(--memory)', sw: 1.6, opacity: 0 }));
      G.atH = [0, 1].map(() => path(g, '', { fill: 'var(--memory)', opacity: 0 }));
      G.atT = tx(g, W / 2 + tw / 2 + 8, GY + 73, '', { fill: 'var(--ink-2)', size: 10 });
      paint();
    }
    function paint() {
      if (!G) return;
      const s = STEPS[step];
      code.clear();
      if (s.lines.length) code.highlight(s.lines, s.tone);
      if (cmt) {
        const c = s.lines.map((n) => cs.comments[n]).filter(Boolean);
        cmt.innerHTML = c.length ? `<span class="dim">line ${s.lines.find((n) => cs.comments[n])}: ${esc(c[0])}</span>` : '';
        cmt.style.display = c.length ? '' : 'none';
      }
      const inBar = step === 2;
      const arrivedN = [0, 0];
      G.cta.forEach((c, k) => {
        c.cells.forEach((cell, j) => {
          const has = step >= 1;
          cell.setAttribute('fill', has ? (step === 1 ? 'rgba(111,166,255,0.42)' : 'var(--memory-a)') : 'none');
          c.cellT[j].textContent = has ? String(k * 8 + j + 1) : '';
          cell.setAttribute('stroke', step === 3 ? 'var(--core)' : 'var(--memory)');
        });
        const allIn = !inBar || ARR[k].every((a) => bt >= a);
        c.strands.forEach((st, j) => {
          if (inBar) {
            const prog = Math.min(1, bt / ARR[k][j]);
            const arrived = prog >= 1;
            if (arrived) arrivedN[k]++;
            st.setAttribute('d', strandD(c.X(j), SY0, SY0 + (SY1 - SY0) * Math.max(0.04, prog), 1.6, 1.5 * Math.max(0.04, prog)));
            st.setAttribute('stroke', allIn ? 'var(--core)' : arrived ? 'var(--control)' : 'var(--ink-2)');
            st.setAttribute('stroke-width', arrived && !allIn ? '2' : '1.4');
            st.setAttribute('opacity', '1');
            return;
          }
          st.setAttribute('d', strandD(c.X(j), SY0, SY1, 1.6, 1.5));
          st.setAttribute('stroke-width', '1.4');
          const active = step <= 2 || (j === 0 && step <= 5);
          st.setAttribute('stroke', j === 0 && step >= 3 && step <= 5 ? 'var(--core)' : active ? 'var(--ink-2)' : 'var(--ink-3)');
          st.setAttribute('opacity', active ? '1' : '0.4');
        });
        c.bar.setAttribute('opacity', inBar ? '1' : step > 2 ? '0.35' : '0');
        c.barT.style.opacity = inBar ? '1' : '0';
        c.barT.textContent = inBar ? (allIn ? (G.pw < 220 ? 'all 8 arrived: go' : '__syncthreads(): all 8 arrived') : `waiting · ${arrivedN[k]} / 8 arrived`) : '';
        c.barT.style.fill = inBar && allIn ? 'var(--core)' : 'var(--control)';
        const sum = k === 0 ? 36 : 100;
        c.sumG.setAttribute('opacity', step === 1 ? '0.15' : '1');
        c.sumBox.setAttribute('stroke', step >= 3 ? 'var(--core)' : 'var(--line-2)');
        c.sumBox.setAttribute('fill', step >= 3 ? 'var(--core-a)' : 'none');
        c.sumT.textContent = step >= 3 ? `thread 0: s = ${sum}` : (G.pw < 200 ? 'thread 0’s s' : 'thread 0’s register s');
        c.sumT.style.fill = step >= 3 ? 'var(--ink)' : 'var(--ink-3)';
      });
      G.flows.forEach((fl) => fl.setAttribute('opacity', step === 1 ? '0.9' : '0'));
      G.inC.forEach((r) => r.setAttribute('fill', step === 1 ? 'rgba(111,166,255,0.4)' : 'rgba(111,166,255,0.18)'));
      // atomics: from each CTA's sum, down through the gap between the two input groups, into the total
      const W = G.W, tw = G.tw, mid = W / 2;
      [0, 1].forEach((c) => {
        const sx = G.cta[c].x0 + G.pw * 0.5;
        const gx = mid + (c === 0 ? -5 : 5);
        const ty = G.GY + 58;
        G.at[c].setAttribute('d', `M${r1(sx)},170 C${r1(sx)},182 ${r1(gx)},172 ${r1(gx)},${r1(G.GY + 4)} L${r1(gx)},${r1(ty - 5)}`);
        G.atH[c].setAttribute('d', `M${r1(gx)},${r1(ty)} l-4,-7 l8,0 Z`);
        // one CTA's atomic per step; at the second, the earlier one stays faint
        let op = 0;
        if (step === 4) op = c === first ? 1 : 0;
        else if (step === 5) op = c === first ? 0.3 : 1;
        G.at[c].setAttribute('opacity', String(op));
        G.atH[c].setAttribute('opacity', String(op));
      });
      void tw;
      const second = 1 - first;
      let total = 0;
      if (step >= 4) total = step === 4 ? SUMS[first] : 136;
      G.totT.textContent = 'total = ' + total;
      G.totBox.setAttribute('fill', step === 4 || step === 5 ? 'rgba(111,166,255,0.4)' : 'var(--surface-3)');
      G.atT.textContent = step === 4 ? `+${SUMS[first]} from CTA ${first}` : step === 5 ? `+${SUMS[second]} from CTA ${second}` : '';
      G.nb.setAttribute('opacity', step === 6 ? '1' : '0');
      stB.set(step > 2 || (inBar && arrivedN[0] === 8 && arrivedN[1] === 8) ? '2 (one per CTA)' : '0');
      stR.set(inBar ? `${arrivedN[0]} / 8 · ${arrivedN[1]} / 8` : step > 2 ? '8 / 8 · 8 / 8' : '—');
      stA.set(step >= 5 ? '2' : step === 4 ? '1' : '0');
      stT.set(String(total), step >= 5 ? 'core' : null);
      f.setWhy(step === 4 || step === 5 ? whyUpdate() : WHY[step]);
    }
    onWidth(wrap, draw);
  }

  /* Fig: blocking one CTA on another */
  function ctaDeadlock(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Blocking one CTA on another',
      hint: 'change the slots and the order · play',
      wide: true,
      caption: 'A model of a dangerous kernel: CTA 5 (copper outline) sets a flag in global memory, and CTAs 0 to 4 spin in a loop until they see it; the dashed amber lines are their reads of the flag. The GPU can keep only so many CTAs resident at once (the slots), and a CTA gives up its slot only when it finishes. Whether this kernel finishes depends on whether CTA 5 gets a slot, which depends on the order CTAs are handed out to SMs (by the GPU’s block scheduler; see the note below the figure) and on how many fit.',
    });
    const N = 6, P = 5;
    let slots = 3, order = 'launch', seed = 3;
    let st = null;
    const wrap = el('div', { class: 'dsb-w' });
    f.stage.append(wrap);
    const svg = S('svg', { class: 'dsb-svg', role: 'img', 'aria-label': 'A dispatch queue of six CTAs, a row of resident slots on the GPU, a flag in global memory and a tray of finished CTAs.' }, wrap);
    const banner = el('div', { style: 'margin-top:10px' });
    f.stage.append(banner);
    const sl = GG.ui.slider(f.controls, { label: 'Resident CTA slots', min: 1, max: 6, value: slots, format: (v) => String(v), onInput: (v) => { slots = v; reset(); } });
    void sl;
    GG.ui.seg(f.controls, {
      label: 'Dispatch order', value: order,
      options: [{ value: 'launch', label: 'by index: 0, 1, …, 5' }, { value: 'first', label: 'CTA 5 first' }, { value: 'shuffle', label: 'shuffled' }],
      onChange: (v) => { order = v; if (v === 'shuffle') seed++; reset(); },
    });
    const row = el('div', { class: 'dsb-flex' });
    f.controls.append(row);
    let acc = 0;
    const anim = GG.anim(wrap, (t, dt) => { acc += dt; spin(t); if (acc > 0.95) { acc = 0; advance(); } }, { autostart: false });
    const play = GG.ui.playButton(row, anim, { onToggle: (on) => { if (on && st && st.status !== 'running') reset(true); } });
    GG.ui.button(row, { icon: 'next', label: 'Step', onClick: () => { anim.stop(); play.sync(); advance(); } });
    GG.ui.button(row, { icon: 'reset', label: 'Restart', title: 'Start again (a shuffled order is re-drawn)', onClick: () => { if (order === 'shuffle') seed++; reset(anim.running); } });
    const stT = GG.ui.stat(f.readouts, { label: 'time step', value: '0' });
    const stD = GG.ui.stat(f.readouts, { label: 'CTAs finished', value: '0 / 6', tone: 'core' });
    const stS = GG.ui.stat(f.readouts, { label: 'steps spent spinning', value: '0', tone: 'control' });

    function makeOrder() {
      if (order === 'launch') return [0, 1, 2, 3, 4, 5];
      if (order === 'first') return [5, 0, 1, 2, 3, 4];
      const a = [0, 1, 2, 3, 4, 5];
      let s32 = (seed * 0x9E3779B1) >>> 0;
      const rnd = () => { s32 = (s32 + 0x6D2B79F5) >>> 0; let t = s32; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }
    function reset(keepPlaying) {
      const q = makeOrder();
      st = { t: 0, queue: q.slice(), order: q, slot: new Array(slots).fill(null), flag: 0, done: [], work: {}, spins: 0, status: 'running', spinning: new Set(), stuck: 0 };
      fill();
      if (!keepPlaying) { anim.stop(); play.sync(); }
      build();
    }
    function fill() {
      for (let k = 0; k < st.slot.length; k++) {
        if (st.slot[k] == null && st.queue.length) { const c = st.queue.shift(); st.slot[k] = c; st.work[c] = c === P ? 2 : 1; }
      }
      checkDeadlock();
    }
    /* Stuck: every slot spins on the flag while its only setter waits in the queue. We let it spin a
       few steps before calling it, so the reader sees the spinning first. */
    function checkDeadlock() {
      const allBlocked = st.slot.every((c) => c != null && c !== P) && st.flag === 0 && st.queue.includes(P);
      st.blocked = allBlocked;
      if (allBlocked && st.stuck >= 3) st.status = 'deadlock';
    }
    function advance() {
      if (!st || st.status !== 'running') { anim.stop(); play.sync(); paint(); return; }
      st.t++;
      st.spinning = new Set();
      for (let k = 0; k < st.slot.length; k++) {
        const c = st.slot[k];
        if (c == null) continue;
        if (c === P) {
          st.work[c]--;
          if (st.work[c] <= 0) { st.flag = 1; st.done.push(c); st.slot[k] = null; }
        } else if (st.flag === 1) {
          st.work[c]--;
          if (st.work[c] <= 0) { st.done.push(c); st.slot[k] = null; }
        } else { st.spins++; st.spinning.add(c); }
      }
      if (st.blocked) st.stuck++;
      fill();
      if (st.done.length === N) st.status = 'finished';
      if (st.status !== 'running') { anim.stop(); play.sync(); }
      paint();
    }
    let G = null;
    function build(w) {
      if (w) G = Object.assign(G || {}, { W: w });
      const W = G && G.W;
      if (!W || !st) return;
      clear(svg);
      const H = 244;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const g = S('g', null, svg);
      const sg = 8;
      const sw = Math.min(240, (W - (slots - 1) * sg) / slots);
      const tw = Math.min(96, (W - 44) / 6, sw - 6), th = 30;
      const small = tw < 52;
      const nar = W < 560;
      tx(g, 0, 12, nar ? 'launch queue, in hand-out order →' : 'launch queue: the order CTAs are handed out to SMs →', { fill: 'var(--ink-3)', size: 10 });
      tx(g, 0, 78, `GPU: ${plural(slots, 'resident slot')}${nar ? '' : ' (a CTA leaves only when it finishes)'}`, { fill: 'var(--ink-3)', size: 10 });
      const slotX = (k) => k * (sw + sg);
      const fw = 110, fx = W - fw, fy = 150;
      // polling lines: each spinning CTA keeps reading the flag (drawn under the slots and tokens)
      const polls = [];
      for (let k = 0; k < slots; k++) {
        const pl = path(g, `M${r1(slotX(k) + sw / 2)},136 C${r1(slotX(k) + sw / 2)},150 ${r1(fx + fw / 2)},${r1(fy - 18)} ${r1(fx + fw / 2)},${r1(fy - 2)}`, { stroke: 'var(--control)', sw: 1.2, dash: '3 3', opacity: 0 });
        polls.push(pl);
      }
      for (let k = 0; k < slots; k++) rect(g, slotX(k), 86, sw, 50, { rx: 8, fill: 'rgba(255,255,255,0.02)', stroke: 'var(--line-2)', dash: '4 3' });
      tx(g, fx - 8, fy + 15, nar ? 'global memory' : 'global memory:', { fill: 'var(--ink-3)', size: 10, anchor: 'end' });
      const flagBox = rect(g, fx, fy, fw, 22, { rx: 5, fill: 'var(--memory-a)', stroke: 'var(--memory)' });
      const flagT = tx(g, fx + fw / 2, fy + 15, 'flag = 0', { fill: 'var(--ink)', size: 10.5, anchor: 'middle', weight: 600 });
      const pollT = tx(g, W, fy + 36, '', { fill: 'var(--control)', size: 9.5, anchor: 'end' });
      // CTA 5 → flag: the only writer (shown while it runs); and, on deadlock, its unmet need for a slot
      const setter = path(g, '', { stroke: 'var(--accent)', sw: 1.6, dash: '4 3', opacity: 0 });
      const setterH = path(g, '', { fill: 'var(--accent)', opacity: 0 });
      const need = path(g, '', { stroke: 'var(--danger)', sw: 1.6, dash: '4 3', opacity: 0 });
      const needH = path(g, '', { fill: 'var(--danger)', opacity: 0 });
      const needT = tx(g, 0, 0, 'needs a free slot', { fill: 'var(--danger)', size: 9.5, opacity: 0 });
      tx(g, 0, 190, 'finished (slot given back)', { fill: 'var(--ink-3)', size: 10 });
      rect(g, 0, 196, W, 38, { rx: 8, fill: 'rgba(255,255,255,0.015)', stroke: 'var(--line-2)', dash: '4 3' });
      const tokens = [];
      for (let c = 0; c < N; c++) {
        const gt = S('g', { style: 'transition: transform 0.45s ease' }, g);
        const bg = rect(gt, 0, 0, tw, th, { rx: 7, fill: 'var(--surface-2)', stroke: 'var(--line-2)' });
        if (c === P) rect(gt, -2.5, -2.5, tw + 5, th + 5, { rx: 9, fill: 'none', stroke: 'var(--accent)', sw: 1.6 });
        tx(gt, tw / 2, 13, 'CTA ' + c, { fill: c === P ? 'var(--accent)' : 'var(--ink)', size: 10, anchor: 'middle', weight: 600 });
        const sub = tx(gt, tw / 2, 25.5, '', { fill: 'var(--ink-3)', size: 10, anchor: 'middle' });
        tokens.push({ gt, bg, sub, tw, th });
      }
      G = Object.assign(G, { tokens, tw, th, sw, slotX, flagBox, flagT, small, polls, pollT, setter, setterH, need, needH, needT, fx, fy, fw });
      paint();
    }
    function spin(t) {
      if (!G || !G.tokens || !st) return;
      G.tokens.forEach((tk) => {
        if (tk.spinning) tk.bg.setAttribute('stroke-dashoffset', r1(-(t * 24) % 16));
      });
      G.polls.forEach((pl) => pl.setAttribute('stroke-dashoffset', r1((t * 18) % 12)));
    }
    function paint() {
      if (!G || !G.tokens || !st) return;
      const { tokens, tw, th, sw, slotX } = G;
      const qPos = {};
      st.queue.forEach((c, i) => { qPos[c] = i; });
      const at = {};
      tokens.forEach((tk, c) => {
        let x, y, state;
        const inSlot = st.slot.indexOf(c);
        if (inSlot >= 0) { x = slotX(inSlot) + (sw - tw) / 2; y = 96; state = c === P ? 'work' : st.flag ? 'work' : 'spin'; }
        else if (st.done.includes(c)) { x = 4 + st.done.indexOf(c) * (tw + 6); y = 200; state = 'done'; }
        else { x = qPos[c] * (tw + 6); y = 20; state = 'queued'; }
        at[c] = { x, y, state };
        tk.gt.style.transform = `translate(${r1(x)}px, ${r1(y)}px)`;
        const dead = st.status === 'deadlock' && state === 'spin';
        tk.bg.setAttribute('fill', state === 'work' ? 'var(--core-a)' : state === 'spin' ? (dead ? 'var(--danger-a)' : 'var(--control-a)') : 'var(--surface-2)');
        tk.bg.setAttribute('stroke', state === 'work' ? 'var(--core)' : state === 'spin' ? (dead ? 'var(--danger)' : 'var(--control)') : 'var(--line-2)');
        tk.gt.setAttribute('opacity', state === 'done' ? '0.55' : '1');
        tk.sub.textContent = state === 'spin' ? (dead ? 'stuck' : G.small ? 'spins' : 'spinning') : state === 'done' ? 'done' : c === P ? (state === 'work' ? (G.small ? 'setting' : 'setting flag') : (G.small ? 'setter' : 'flag setter')) : state === 'work' ? (G.small ? 'runs' : 'saw flag') : 'waits';
        tk.sub.style.fill = c === P && state !== 'done' ? 'var(--accent)' : 'var(--ink-3)';
        tk.spinning = state === 'spin';
        tk.bg.setAttribute('stroke-dasharray', state === 'spin' ? '5 3' : 'none');
        tk.bg.setAttribute('stroke-width', state === 'spin' ? '1.6' : '1');
      });
      // polling lines from every slot whose CTA is spinning on the flag
      let nSpin = 0;
      G.polls.forEach((pl, k) => {
        const c = st.slot[k];
        const on = c != null && at[c] && at[c].state === 'spin';
        if (on) nSpin++;
        pl.setAttribute('opacity', on ? '0.85' : '0');
        pl.setAttribute('stroke', st.status === 'deadlock' ? 'var(--danger)' : 'var(--control)');
      });
      G.pollT.textContent = nSpin ? (st.status === 'deadlock' ? `${plural(nSpin, 'CTA')} polling, forever` : `polled by ${plural(nSpin, 'spinning CTA')}`) : '';
      G.pollT.style.fill = st.status === 'deadlock' ? 'var(--danger)' : 'var(--control)';
      const p5 = at[P];
      const fcx = G.fx + G.fw / 2;
      const showSet = p5.state === 'work';
      if (showSet) {
        const sx = p5.x + tw / 2, sy = p5.y + th;
        G.setter.setAttribute('d', `M${r1(sx)},${r1(sy)} C${r1(sx)},${r1(sy + 22)} ${r1(G.fx + 10)},${r1(G.fy - 22)} ${r1(G.fx + 10)},${r1(G.fy - 5)}`);
        G.setterH.setAttribute('d', `M${r1(G.fx + 10)},${r1(G.fy)} l-4,-7 l8,0 Z`);
      }
      G.setter.setAttribute('opacity', showSet ? '1' : '0');
      G.setterH.setAttribute('opacity', showSet ? '1' : '0');
      const dead = st.status === 'deadlock';
      if (dead) {
        const sx = p5.x + tw / 2, sy = p5.y + th + 2;
        G.need.setAttribute('d', `M${r1(sx)},${r1(sy)} L${r1(sx)},${r1(80)}`);
        G.needH.setAttribute('d', `M${r1(sx)},${r1(85)} l-4,-7 l8,0 Z`);
        G.needT.setAttribute('x', r1(Math.min(sx + 6, G.W - 92)));
        G.needT.setAttribute('y', r1(sy + 14));
      }
      [G.need, G.needH].forEach((n) => n.setAttribute('opacity', dead ? '1' : '0'));
      G.needT.style.opacity = dead ? '1' : '0';
      void fcx;
      G.flagT.textContent = 'flag = ' + st.flag;
      G.flagBox.setAttribute('fill', st.flag ? 'rgba(111,166,255,0.42)' : 'var(--memory-a)');
      stT.set(String(st.t)); stD.set(st.done.length + ' / 6', st.done.length === 6 ? 'core' : null); stS.set(fmt.int(st.spins));
      const pos = st.order.indexOf(P) + 1;
      const ord = st.order.join(', ');
      if (st.status === 'deadlock') {
        banner.innerHTML = '<span class="dsb-banner bad">Deadlock: the kernel never finishes</span> <span class="dsb-detail" style="display:block;margin-top:8px"><span class="d">The cycle:</span> every slot spins until flag = 1 → only CTA 5 sets the flag → CTA 5 needs a free slot → a slot frees only when its CTA finishes → which needs flag = 1.</span>';
        f.setWhy(`<b>Deadlock.</b> ${slots === 1 ? 'The only slot holds a CTA' : `All ${slots} slots hold CTAs`} spinning on a flag that only CTA 5 can set, and CTA 5 is still in the queue waiting for a free slot. A slot frees only when a CTA finishes, and none of them can. With order ${ord}, CTA 5 is number ${pos} in line, but only ${plural(slots, 'CTA')} fit at once.`);
      } else if (st.status === 'finished') {
        banner.innerHTML = `<span class="dsb-banner ok">Finished in ${st.t} steps</span>`;
        f.setWhy(`<b>Finished.</b> CTA 5 was number ${pos} in line and ${plural(slots, 'CTA')} fit at once, so it got a slot, set the flag, and every waiting CTA could then finish. ${st.spins ? `Along the way, waiting CTAs burned ${st.spins} slot-steps spinning.` : ''} Same code: only the order or the number of slots decides whether it hangs.`);
      } else {
        banner.innerHTML = '<span class="dsb-banner run">Running</span>';
        f.setWhy(st.t === 0
          ? `Dispatch order <b>${ord}</b>, ${plural(slots, 'slot')}. CTA 5 (copper outline) is the only CTA that sets the flag, and it is number ${pos} in line. ${pos <= slots ? 'It will get a slot straight away.' : `The first ${plural(slots, 'CTA')} to get slots will all be waiting for it.`} Press Play or Step.`
          : `Step ${st.t}: ${st.slot.filter((c) => c != null).map((c) => 'CTA ' + c).join(', ') || 'no CTA'} resident; flag = ${st.flag}. ${st.spinning.size ? `${st.spinning.size} CTA${st.spinning.size > 1 ? 's are' : ' is'} spinning (dashed lines: polling the flag), holding a slot without doing useful work.` : ''}`);
      }
    }
    onWidth(wrap, (w) => build(w));
    reset();
    GG.onVisible(wrap, (v) => { if (v && !GG.reducedMotion && st && st.t === 0 && !anim.running) { anim.start(); play.sync(); } }, { once: true });
  }

  /* Fig: how many CTAs fit on one SM */
  function ctaPack(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Packing CTAs onto one H100 SM',
      hint: 'drag the sliders',
      wide: true,
      controlsFirst: true,
      caption: 'Each CTA takes a fixed share of four per-SM budgets on an H100: register-file space (65,536 32-bit registers), warp slots (64), shared memory (up to 228 KB of the 256 KB L1 data cache) and CTA slots (32). Whichever budget runs out first sets how many CTAs fit. Two arithmetics. The default applies NVIDIA’s allocation rules for compute capability 9.0, as its occupancy calculator does (beyond the glossary): registers are handed out per warp in units of 256, so a thread’s count is in effect rounded up to a multiple of 8 (66 counts as 72); each warp takes all of its registers from one of the four sub-partitions’ quarters of the register file; and 1 KB of shared memory per CTA is reserved for system use. The other is the glossary’s plain division, as in its occupancy example. Under the rules the glossary’s example fits 17 CTAs rather than 19.',
    });
    let nThr = 32, R = 8, M = 12, rules = true;
    const ex = GG.ui.seg(f.controls, {
      label: 'Examples', value: 'g',
      options: [{ value: 'g', label: 'glossary: 32 thr · 8 reg · 12 KB' }, { value: 'r', label: '256 thr · 128 reg · 0 KB' }, { value: 'b', label: '1024 thr · 32 reg · 48 KB' }, { value: 'x', label: '1024 thr · 128 reg' }],
      onChange: (v) => { const p = { g: [32, 8, 12], r: [256, 128, 0], b: [1024, 32, 48], x: [1024, 128, 0] }[v]; [nThr, R, M] = p; sT.set(nThr, false); sR.set(R, false); sM.set(M, false); draw(); },
    });
    const sT = GG.ui.slider(f.controls, { label: 'Threads per CTA', min: 32, max: 1024, step: 32, value: nThr, format: (v) => fmt.int(v) + ` (${v / 32} warp${v > 32 ? 's' : ''})`, onInput: (v) => { nThr = v; ex.set(null); draw(); } });
    const sR = GG.ui.slider(f.controls, { label: 'Registers per thread', min: 1, max: 255, value: R, format: (v) => String(v), onInput: (v) => { R = v; ex.set(null); draw(); } });
    const sM = GG.ui.slider(f.controls, { label: 'Shared memory per CTA', min: 0, max: 227, value: M, format: (v) => v + ' KB', onInput: (v) => { M = v; ex.set(null); draw(); } });
    GG.ui.seg(f.controls, {
      label: 'Arithmetic', value: 'rules',
      options: [{ value: 'rules', label: 'hardware rules (CC 9.0)', title: 'NVIDIA’s allocation rules, as in its occupancy calculator (beyond the glossary)' }, { value: 'glossary', label: 'glossary arithmetic', title: 'the glossary’s plain division' }],
      onChange: (v) => { rules = v === 'rules'; draw(); },
    });
    const stC = GG.ui.stat(f.readouts, { label: 'CTAs per SM', value: '' });
    const stL = GG.ui.stat(f.readouts, { label: 'limited by', value: '', tone: 'danger' });
    const stW = GG.ui.stat(f.readouts, { label: 'resident warps', value: '', tone: 'control' });
    const stO = GG.ui.stat(f.readouts, { label: 'theoretical occupancy', value: '', tone: 'core' });
    const wrap = el('div', { class: 'dsb-w' });
    f.stage.append(wrap);
    const svg = S('svg', { class: 'dsb-svg', role: 'img', 'aria-label': 'Four horizontal bars for the SM’s register file, warp slots, shared memory and CTA slots, each filled with one segment per resident CTA, with the limiting resource marked.' }, wrap);
    let W = 0;
    /* the packing arithmetic. rl = true: NVIDIA's allocation rules for compute capability 9.0 (as pf-b's occupancy
       calculator): registers go to each warp in units of 256, every warp draws them from one of the four
       sub-partitions' 16,384-register quarters, and 1 KB of shared memory per CTA is reserved. rl = false: the
       glossary's plain division. */
    function model(rl) {
      const warpsPer = Math.ceil(nThr / 32);
      const rpw = rl ? Math.ceil((R * 32) / 256) * 256 : R * 32;
      const perSlice = rl ? Math.floor(16384 / rpw) : null;
      const regsPer = rl ? rpw * warpsPer : nThr * R;
      const smemPer = M + (rl ? 1 : 0);
      const res = [
        { k: 'reg', name: 'Register file', lc: 'the register file', cap: 65536, use: regsPer, allow: rl ? Math.floor((4 * perSlice) / warpsPer) : Math.floor(65536 / regsPer), unit: (v) => fmt.int(v) + ' registers', col: 'memory' },
        { k: 'warp', name: 'Warp slots', lc: 'the warp slots', cap: 64, use: warpsPer, unit: (v) => plural(v, 'warp'), col: 'control' },
        { k: 'smem', name: 'Shared memory', lc: 'shared memory', cap: 228, use: smemPer, unit: (v) => fmt.int(v) + ' KB', col: 'memory' },
        { k: 'cta', name: 'CTA slots', lc: 'the CTA slots', cap: 32, use: 1, unit: (v) => plural(v, 'CTA'), col: 'control' },
      ];
      res.forEach((r) => { if (r.allow == null) r.allow = r.use === 0 ? Infinity : Math.floor(r.cap / r.use); });
      const n = Math.max(0, Math.min(...res.map((r) => r.allow)));
      return { warpsPer, rpw, perSlice, regsPer, smemPer, res, n, limiters: res.filter((r) => r.allow === n) };
    }
    function draw(w) {
      if (w) W = w;
      if (!W) return;
      const { warpsPer, rpw, perSlice, regsPer, smemPer, res, n, limiters } = model(rules);
      const other = model(!rules).n;
      const Rr = rpw / 32;
      const rNote = rules && Rr !== R ? ` (${R} rounded up to ${Rr})` : '';
      clear(svg);
      const narrow = W < 600;
      const LW = narrow ? 0 : 170;
      const bx = LW, bw = W - LW - (narrow ? 0 : 4);
      const rowH = narrow ? 66 : 50;
      // one CTA, drawn as its warps: the unit the warp-slot bar counts
      const TOP = narrow ? 48 : 40;
      const H = TOP + res.length * rowH + 4;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const g = S('g', null, svg);
      tx(g, 0, 12, `one CTA = ${fmt.int(nThr)} threads = ${plural(warpsPer, 'warp')} of 32`, { fill: 'var(--ink)', size: 11, weight: 600 });
      {
        const cx0 = narrow ? 0 : LW, cwid = W - cx0;
        const chw = Math.min(26, (cwid - (warpsPer - 1) * 3) / warpsPer);
        for (let k = 0; k < warpsPer; k++) {
          const x = cx0 + k * (chw + 3);
          rect(g, x, 18, chw, 14, { rx: 3, fill: 'var(--control-a)', stroke: 'var(--control)' });
          if (chw >= 14) for (let q = 0; q < 3; q++) line(g, x + (chw * (q + 1)) / 4, 21, x + (chw * (q + 1)) / 4, 29, { stroke: 'var(--ink-3)', sw: 1 });
        }
        if (!narrow) tx(g, 0, 29, 'each chip takes one warp slot', { fill: 'var(--ink-3)', size: 9.5 });
      }
      res.forEach((r, i) => {
        const y = TOP + i * rowH + (narrow ? 18 : 6);
        const lim = limiters.includes(r);
        const ly = narrow ? y - 6 : y + 13;
        tx(g, 0, ly, r.name, { fill: lim ? 'var(--danger)' : 'var(--ink)', size: 11, weight: 600 });
        if (!narrow) tx(g, 0, ly + 15, 'capacity ' + r.unit(r.cap), { fill: 'var(--ink-3)', size: 9.5 });
        else tx(g, W, ly, 'of ' + r.unit(r.cap), { fill: 'var(--ink-3)', size: 9.5, anchor: 'end' });
        rect(g, bx, y, bw, 22, { rx: 5, fill: 'rgba(255,255,255,0.03)', stroke: lim ? 'var(--danger)' : 'var(--line-2)', sw: lim ? 1.4 : 1 });
        const segW = (r.use / r.cap) * bw;
        const shown = Math.min(n, 256);
        if (n === 0) {
          // not even one CTA fits: draw one CTA's demand on every budget, overflowing where it breaks
          const over = r.allow === 0;
          if (over && r.use <= r.cap) {
            // fits the register file in total, but not in whole sub-partition quarters
            rect(g, bx + 0.5, y + 2, Math.max(2, segW - 1), 18, { rx: 2, fill: 'var(--danger-a)', stroke: 'var(--danger)', dash: '4 2' });
            tx(g, bx + 8, y + 15, `${warpsPer} warps, room for ${4 * perSlice} in the 4 quarters`, { fill: 'var(--ink)', size: 10, weight: 600 });
          } else if (over) {
            const capW = (r.cap / r.use) * bw;
            rect(g, bx + 1, y + 2, bw - 2, 18, { rx: 2, fill: 'var(--danger-a)', stroke: 'var(--danger)', dash: '4 2' });
            rect(g, bx + 1, y + 2, capW - 2, 18, { rx: 2, fill: 'var(--danger)', opacity: 0.55 });
            line(g, bx + capW, y - 3, bx + capW, y + 25, { stroke: 'var(--ink)', sw: 1.6 });
            if (!narrow) tx(g, bx + capW, y - 5, 'capacity', { fill: 'var(--ink)', size: 10, anchor: 'middle', weight: 600 });
            tx(g, bx + 8, y + 15, `one CTA needs ${fmt.sig(r.use / r.cap, 3)} × capacity`, { fill: 'var(--ink)', size: 10, weight: 600 });
          } else if (r.use > 0) {
            rect(g, bx + 0.5, y + 2, Math.max(2, segW - 1), 18, { rx: 2, fill: 'none', stroke: `var(--${r.col})`, dash: '3 2' });
          }
          tx(g, narrow ? 0 : bx, y + 36, `one CTA needs ${r.unit(r.use)} · ${fmt.pct(r.use / r.cap, r.use / r.cap < 0.1 && r.use > 0 ? 1 : 0)} of capacity`, { fill: over ? 'var(--danger)' : 'var(--ink-3)', size: 10 });
          return;
        }
        if (segW >= 2.5) {
          for (let k = 0; k < shown; k++) rect(g, bx + k * segW + 0.5, y + 2, Math.max(0.5, segW - 1), 18, { rx: 2, fill: `var(--${r.col})`, opacity: k % 2 ? 0.62 : 0.85 });
        } else if (n > 0) {
          rect(g, bx + 1, y + 2, Math.max(1, n * segW - 2), 18, { rx: 2, fill: `var(--${r.col})`, opacity: 0.75 });
        }
        if (lim && isFinite(r.allow) && n * r.use < r.cap && segW >= 2.5) {
          const gx = bx + n * segW;
          if (gx + segW <= bx + bw + 0.5) rect(g, gx + 0.5, y + 2, segW - 1, 18, { rx: 2, fill: 'none', stroke: 'var(--danger)', dash: '3 2' });
        }
        const used = n * r.use;
        const txt = `${r.unit(used)} used · ${fmt.pct(used / r.cap, used / r.cap < 0.1 && used > 0 ? 1 : 0)}` + (isFinite(r.allow) ? ` · alone allows ${fmt.int(r.allow)}` : ' · no limit');
        tx(g, narrow ? 0 : bx, y + 36, txt, { fill: lim ? 'var(--danger)' : 'var(--ink-3)', size: 10 });
      });
      const warps = n * warpsPer;
      stC.set(fmt.int(n));
      stL.set(n === 0 ? 'does not fit' : limiters.map((r) => r.k === 'cta' ? 'CTA slots' : r.name.toLowerCase()).join(' + '));
      stW.set(`${warps} / 64`);
      stO.set(fmt.pct(warps / 64, 1));
      const otherTxt = other !== n ? ` With the ${rules ? 'glossary’s plain arithmetic' : 'hardware rules'} it would be ${other ? plural(other, 'CTA') + ', ' + fmt.pct((other * warpsPer) / 64, 1) : 'none: the kernel could not launch'}.` : '';
      if (n === 0) {
        const why0 = regsPer > 65536
          ? `${fmt.int(nThr)} threads × ${Rr} registers${rNote} = ${fmt.int(regsPer)} registers, ${fmt.sig(regsPer / 65536, 3)} times the ${fmt.int(65536)} in the register file (the red bar runs past the white capacity line).`
          : `The CTA’s ${fmt.int(regsPer)} registers would fit in the register file as a whole, but each warp must take all of its ${fmt.int(rpw)} registers${rNote} from one 16,384-register quarter, so each quarter holds ${plural(perSlice, 'warp')}, ${4 * perSlice} in all: fewer than the CTA’s ${warpsPer}.`;
        f.setWhy(`<b>Not even one CTA fits.</b> ${why0} As the CUDA C++ Programming Guide notes, when there are not enough registers or shared memory for at least one block, the kernel fails to launch.${otherTxt}`);
      } else {
        const math = {
          reg: rules
            ? `each warp needs ${R} × 32 = ${fmt.int(R * 32)} registers${rpw !== R * 32 ? `, allocated as ${fmt.int(rpw)}` : ''}; one 16,384-register quarter of the register file holds ${plural(perSlice, 'such warp')}, the four quarters ${fmt.int(4 * perSlice)}, and ${fmt.int(4 * perSlice)} ÷ ${plural(warpsPer, 'warp')} per CTA = ${fmt.int(n)}${(n + 1) * regsPer <= 65536 ? ' (the bar has room for another CTA’s registers in total, but not in whole quarters)' : ''}`
            : `each CTA needs ${fmt.int(nThr)} × ${R} = ${fmt.int(regsPer)} registers, and 65,536 ÷ ${fmt.int(regsPer)} = ${fmt.int(n)}`,
          warp: `each CTA is ${plural(warpsPer, 'warp')}, and 64 ÷ ${warpsPer} = ${fmt.int(n)}`,
          smem: rules ? `228 KB ÷ (${M} + 1 reserved) KB = 228 ÷ ${smemPer} = ${fmt.int(n)}` : `228 KB ÷ ${M} KB = ${fmt.int(n)}`,
          cta: `the SM holds at most 32 resident CTAs`,
        };
        const and = (a) => (a.length > 1 ? a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1] : a[0]);
        let why;
        if (limiters.length === 1) {
          const lim = limiters[0];
          why = lim.k === 'cta' ? 'the SM’s limit of 32 resident CTAs is reached first' : `${lim.lc} run${lim.k === 'smem' || lim.k === 'reg' ? 's' : ''} out first: ${math[lim.k]}`;
        } else {
          why = `${and(limiters.map((r) => r.lc))} run out at the same time, each allowing ${fmt.int(n)} (${limiters.map((r) => math[r.k]).join('; ')})`;
        }
        const oth = res.filter((r) => !limiters.includes(r) && isFinite(r.allow)).map((r) => `${r.lc} ${fmt.int(r.allow)}`);
        const others = oth.length ? ` On their own, ${and(oth)} would fit.` : '';
        f.setWhy(`With ${fmt.int(nThr)} threads, ${plural(R, 'register')} per thread${rNote ? ` (allocated as ${Rr})` : ''} and ${M} KB of shared memory per CTA${rules ? ' (plus 1 KB reserved)' : ''}, <b>${plural(n, 'CTA')}</b> ${n === 1 ? 'fits' : 'fit'} on the SM: ${why}.${others} That is ${warps} of 64 warp slots, a theoretical ${T('occupancy', 'occupancy')} of <b>${fmt.pct(warps / 64, 1)}</b>.${otherTxt}`);
      }
    }
    onWidth(wrap, draw);
  }

  GG.entry('cooperative-thread-array', {
    render(body, ctx) {
      const s = ctx.html(body, `
<p>A <strong>cooperative thread array</strong> (CTA) is a collection of ${T('thread', 'threads')} scheduled onto the same ${T('streaming-multiprocessor', 'Streaming Multiprocessor (SM)')}. CTAs are the ${T('parallel-thread-execution', 'PTX')}/${T('streaming-assembler', 'SASS')} implementation of the ${T('cuda-programming-model', 'CUDA programming model')}’s ${T('thread-block', 'thread blocks')}: one thing, two names. You write “thread block” and <code>blockIdx</code> in ${T('cuda-c', 'CUDA C++')}; the compiled PTX and SASS talk about CTAs (PTX’s <code>%ctaid</code> is CUDA C++’s <code>blockIdx</code>). CTAs are composed of one or more ${T('warp', 'warps')}.</p>
<div data-slot="map" class="wide"></div>
<h3>Cooperating inside, not across</h3>
<p>Programmers can direct threads within a CTA to coordinate with each other. The programmer-managed ${T('shared-memory', 'shared memory')}, in the ${T('l1-data-cache', 'L1 data cache')} of the ${T('streaming-multiprocessor', 'SMs')}, makes this coordination fast: because every thread of a CTA runs on the same SM, they can all reach the same on-chip memory. They can also wait for each other at a <em>barrier</em>, a point in the program that no thread passes until all threads of the CTA have reached it (<code>__syncthreads()</code> in CUDA C++, <code>bar.sync</code> in PTX).</p>
<p>Threads in different CTAs cannot coordinate with each other via barriers, unlike threads within a CTA, and instead must coordinate via ${T('global-memory', 'global memory')}, e.g. via atomic update instructions. An atomic instruction, such as <code>atomicAdd</code>, reads, modifies and writes one memory location as a single indivisible step, so concurrent updates from different CTAs cannot overwrite each other. Fig. 2 walks through both kinds of coordination.</p>
<div data-slot="coord" class="wide"></div>
<h3>Why you must not make one CTA wait for another</h3>
<p>Due to driver control over the scheduling of CTAs at runtime, CTA execution order is indeterminate, and blocking a CTA on another CTA can easily lead to deadlock. The trap is that a waiting CTA does not give up its place on the GPU: it keeps its SM resources while it spins. If every place fills up with CTAs waiting for one that has not been scheduled yet, nothing can ever move. Try it in Fig. 3, where the waiting CTAs spin on a flag that one other CTA sets, so whether the kernel hangs depends on the order CTAs are handed out. ${T('thread-hierarchy', 'Thread Hierarchy')} Fig. 3 shows the same trap with a barrier across blocks.</p>
<div data-slot="dead" class="wide"></div>
${GG.noteHTML('check', `<p><b>Driver, or hardware?</b> The glossary credits the driver with scheduling CTAs. The driver submits the launch, but handing individual CTAs to SMs as they free up is done on the GPU by a hardware scheduler: NVIDIA’s <a href="https://www.nvidia.com/content/PDF/fermi_white_papers/NVIDIA_Fermi_Compute_Architecture_Whitepaper.pdf">Fermi whitepaper</a> puts it in one line: “The GigaThread global scheduler distributes thread blocks to SM thread schedulers.” Either way the conclusion stands: the order is not the program’s to choose, or to rely on.</p>`)}
<p>Notice that the same kernel can work on one GPU and hang on another. How many CTAs fit at once is the number of ${T('streaming-multiprocessor', 'SMs')} times how many fit on each (up to 32 on an H100 SM, and often fewer, as the next section shows). A kernel that happens to finish with a small grid on a large GPU can deadlock when the grid grows, the GPU is smaller, or another kernel is occupying some SMs.</p>
${GG.noteHTML('beyond', `<p><b>Sanctioned ways to coordinate across CTAs.</b> Newer CUDA offers two, both designed around this problem. A <em>cooperative launch</em> (<code>cudaLaunchCooperativeKernel</code>) lets threads synchronize across the whole grid with <code>grid.sync()</code> from Cooperative Groups; it is only allowed when all of the grid’s CTAs can be resident at once, so no CTA can be waiting in a queue. And since Hopper, CTAs can be grouped into <em>thread block clusters</em>: the CTAs of a cluster are guaranteed to be co-scheduled on one ${T('graphics-processing-cluster', 'GPU Processing Cluster')}, and they can synchronize with cluster-wide barriers and read and write each other’s shared memory (Hopper’s “distributed shared memory”).</p>`)}
<h3>How many CTAs fit on an SM</h3>
<p>The number of CTAs that can be scheduled onto a single SM sets the ${T('occupancy', 'achievable occupancy')} and depends on a number of factors. Fundamentally, the SM has a limited set of resources: lines in the ${T('register-file', 'register file')}, “slots” for ${T('warp', 'warps')}, bytes of ${T('shared-memory', 'shared memory')} in the ${T('l1-data-cache', 'L1 data cache')}. Each CTA uses a certain amount of those resources (as calculated at ${T('nvcc', 'compile')} time) when scheduled onto an SM. The compiler decides how many registers each thread needs and how big the static shared memory arrays are, so the per-CTA bill is fixed before the kernel ever runs. Fig. 4 packs CTAs onto an H100 SM; it opens on the example from the glossary’s ${T('occupancy', 'occupancy')} entry, which fits 19 CTAs by the glossary’s arithmetic and 17 under the allocation rules the hardware applies.</p>
<div data-slot="pack" class="wide"></div>
${GG.noteHTML('beyond', `<p><b>Seeing the bill, and one part that is not compiled in.</b> <code>nvcc --resource-usage</code> (or <code>--ptxas-options=-v</code>) prints each kernel’s registers per thread and its static shared memory. Shared memory can also be <em>dynamic</em>: its size is passed as the third launch parameter, <code>kernel&lt;&lt;&lt;grid, block, bytes&gt;&gt;&gt;</code>, so that part of a CTA’s bill is set at launch time rather than at compile time.</p>`)}
<div data-slot="read"></div>`);

      guard(s.map, 'Programming model map', () => modelMapFigure(s.map, ctx, {
        title: 'CTAs in the thread hierarchy, and on the hardware',
        highlight: ['block', 'shared'],
        names: 'ptx',
        caption: `Cooperative thread arrays correspond to the thread block level of the thread hierarchy in the CUDA programming model (middle left), here with PTX names. A CTA is scheduled onto a single SM, and its shared memory lives in that SM’s L1 data cache (middle right). ${MAP_CREDIT}`,
      }));
      guard(s.coord, 'CTA coordination', () => ctaCoord(s.coord, ctx));
      guard(s.dead, 'CTA deadlock', () => ctaDeadlock(s.dead, ctx));
      guard(s.pack, 'CTA packing', () => ctaPack(s.pack, ctx));
      ctx.reading(s.read, [
        { href: REF_CUDA_REFRESHER, label: 'NVIDIA: CUDA Refresher: The CUDA Programming Model', note: 'source of the thread / block / grid diagram' },
        { href: REF_CPG_MODEL, label: 'NVIDIA: CUDA C++ Programming Guide, Programming Model', note: 'thread blocks, shared memory and barriers in CUDA C++' },
        { href: 'https://docs.nvidia.com/cuda/parallel-thread-execution/index.html', label: 'NVIDIA: PTX ISA', note: 'beyond the glossary: CTAs, clusters of CTAs and barriers as PTX defines them' },
        { href: 'https://www.nvidia.com/content/PDF/fermi_white_papers/NVIDIA_Fermi_Compute_Architecture_Whitepaper.pdf', label: 'NVIDIA: Fermi Compute Architecture whitepaper', note: 'beyond the glossary: the GigaThread scheduler that hands thread blocks to SMs' },
      ]);
    },
  });

  /* ═════════════════════════════ Kernel ═════════════════════════════ */

  GG.css(`
.dsb-strip { margin-top: 10px; border: 1px solid var(--line); border-radius: 10px; background: #090a10; padding: 7px 0 8px; font: 500 12px/1.75 var(--font-mono); color: var(--ink-body); overflow-x: auto; scrollbar-width: thin; }
.dsb-strip-h { padding: 0 12px 4px; font: 600 9.5px/1.4 var(--font-mono); letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-3); }
.dsb-sl { display: block; white-space: pre; padding: 0 12px 0 9px; border-left: 3px solid transparent; }
.dsb-sl i { font-style: normal; display: inline-block; width: 2.4em; color: #545a76; user-select: none; }
.dsb-sl[data-tone="memory"] { border-left-color: var(--memory); background: var(--memory-a); }
.dsb-sl[data-tone="core"] { border-left-color: var(--core); background: var(--core-a); }
.dsb-sl[data-tone="control"] { border-left-color: var(--control); background: var(--control-a); }
.entry-body .dsb-cmp td:first-child { color: var(--ink); white-space: nowrap; }
.dsb-many { flex: 1 1 100%; min-width: 0; }
.dsb-many .stepper .dots { flex-wrap: wrap; }
.dsb-many .stepper .dots button { width: 14px; }
.dsb-nw { white-space: nowrap; }
@media (max-width: 600px) {
  .dsb-strip { font-size: 11px; }
  .dsb-sl { white-space: pre-wrap; overflow-wrap: anywhere; padding-left: calc(9px + 2.4em + 2ch); text-indent: calc(-2.4em - 2ch); }
  .dsb-sl i { text-indent: 0; }
}
`);

  const MM_NAIVE = `__global__ void mm(float* A, float* B, float* C, int N) {
    int row = blockIdx.y * blockDim.y + threadIdx.y;
    int col = blockIdx.x * blockDim.x + threadIdx.x;

    if (row < N && col < N) {
        float sum = 0.0f;
        for (int k = 0; k < N; k++) {
            sum += A[row * N + k] * B[k * N + col];
        }
        C[row * N + col] = sum;
    }
}`;

  const MM_TILED = `#define TILE_WIDTH 16

__global__ void mm(float* A, float* B, float* C, int N) {

    // declare variables in shared memory ("smem")
    __shared__ float As[TILE_WIDTH][TILE_WIDTH];
    __shared__ float Bs[TILE_WIDTH][TILE_WIDTH];

    int row = blockIdx.y * TILE_WIDTH + threadIdx.y;
    int col = blockIdx.x * TILE_WIDTH + threadIdx.x;

    float c_output = 0;
    for (int m = 0; m < N/TILE_WIDTH; ++m) {

        // each thread loads one element of A and one of B from global memory into smem
        As[threadIdx.y][threadIdx.x] = A[row * N + (m * TILE_WIDTH + threadIdx.x)];
        Bs[threadIdx.y][threadIdx.x] = B[(m * TILE_WIDTH + threadIdx.y) * N + col];

        // we wait until all threads in the 16x16 block are done loading into smem
        // so that it contains two 16x16 tiles
        __syncthreads();

        // then we loop over the inner dimension,
        // performing 16 multiplies and 16 adds per pair of loads from global memory
        for (int k = 0; k < TILE_WIDTH; ++k) {
            c_output += As[threadIdx.y][k] * Bs[k][threadIdx.x];
        }
        // wait for all threads to finish computing
        // before any start loading the next tile into smem
        __syncthreads();
    }
    C[row * N + col] = c_output;
}`;

  const MM_LAUNCH = `// A, B, C: N × N floats in global memory (from cudaMalloc)
dim3 block(16, 16);                       // 256 threads per block
dim3 grid((N + 15) / 16, (N + 15) / 16);  // enough blocks for C
mm<<<grid, block>>>(A, B, C, N);          // one launch
cudaDeviceSynchronize();                  // wait until it is done`;

  /* small deterministic PRNG (mulberry32) */
  function prng(seed) {
    let s = seed >>> 0;
    return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  /* "Now running" strip: the given source lines, de-indented, highlighted. */
  function codeStrip(node, src, lines, tone, label) {
    const all = src.split('\n');
    const ind = Math.min(...lines.map((n) => all[n - 1].match(/^ */)[0].length));
    node.innerHTML = `<div class="dsb-strip-h">${label || 'now running'}</div>` +
      lines.map((n) => `<span class="dsb-sl" data-tone="${tone || ''}"><i>${n}</i>${GG.highlightLine(all[n - 1].slice(ind), 'cpp') || ' '}</span>`).join('');
  }
  function svgPt(svg, e) {
    const r = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    return { x: vb.x + ((e.clientX - r.left) / r.width) * vb.width, y: vb.y + ((e.clientY - r.top) / r.height) * vb.height };
  }
  const minus = (v) => (v < 0 ? '−' + -v : String(v));
  const paren = (v) => (v < 0 ? `(${minus(v)})` : String(v));
  function words(n) {
    const u = [[1e12, 'trillion'], [1e9, 'billion'], [1e6, 'million'], [1e3, 'thousand']];
    for (const [v, w] of u) if (n >= v) return `${fmt.sig(n / v, 3)} ${w}`;
    return fmt.int(n);
  }
  function msStr(s) { return s >= 1 ? fmt.sig(s, 3) + ' s' : s >= 1e-3 ? fmt.sig(s * 1e3, 3) + ' ms' : s >= 1e-6 ? fmt.sig(s * 1e6, 3) + ' µs' : fmt.sig(s * 1e9, 3) + ' ns'; }

  /* Fig: one launch, many executions */
  function kLaunch(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Called once, executed many times',
      hint: 'play · launch again · change the SMs',
      wide: true,
      caption: 'Top: a procedure on a CPU is called, runs its body once on one thread, working through the outputs one after another, and returns. The two timelines are not to scale: how long each takes depends on the machines and on N. Bottom: one launch (each launch returns once; the counters keep a tally across Launch again) of the naive matmul kernel below, for N = 64 with 16 × 16 thread blocks, makes a 4 × 4 grid of blocks, 4,096 threads in all, and every thread executes the kernel body once. Each bar is one block, labelled with its <code>blockIdx</code> (x, y), on one SM; its 256 threads run there together. While a block runs, the row band of A and the column band of B it reads light up; the C tiles show the order the blocks finished. The model is ours: an SM here runs one block at a time and the timings are made up. Real SMs hold several blocks at once, and an H100 has 132 SMs, enough for all 16 blocks at the same moment.',
    });
    const GX = 4, NB = 16, TPB = 256;
    let sms = 4, run = 1, t = 0, P = null, G = null, W = 0;
    const wrap = el('div', { class: 'dsb-w' });
    f.stage.append(wrap);
    const svg = S('svg', { class: 'dsb-svg', role: 'img', 'aria-label': 'Two timelines. Top: a CPU procedure, called once, running once and returning once. Bottom: a kernel launched once by the host; its sixteen thread blocks run on several SMs at overlapping times, in an order that changes from launch to launch, each writing its tile of the output matrix C in global memory; then the kernel returns once.' }, wrap);
    const anim = GG.anim(wrap, (tt, dt) => {
      if (!P) return;
      t = Math.min(P.total, t + (dt * P.total) / 5);
      paint();
      if (t >= P.total) { anim.stop(); play.sync(); }
    }, { autostart: false });
    GG.ui.seg(f.controls, {
      label: 'SMs in this toy GPU', value: sms,
      options: [1, 2, 4, 8].map((v) => ({ value: v, label: String(v) })),
      onChange: (v) => { sms = v; run = 1; relaunch(); },
    });
    const row = el('div', { class: 'dsb-flex' });
    f.controls.append(row);
    const play = GG.ui.playButton(row, anim, { onToggle: (on) => { if (on && P && t >= P.total) { t = 0; paint(); } } });
    GG.ui.button(row, { icon: 'reset', label: 'Launch again', title: 'Launch the same kernel again: a new run, a new order', onClick: () => { run++; relaunch(); } });
    const stL = GG.ui.stat(f.readouts, { label: 'launches', value: '1', tone: 'host' });
    const stR = GG.ui.stat(f.readouts, { label: 'blocks running now', value: '0', tone: 'core' });
    const stF = GG.ui.stat(f.readouts, { label: 'threads finished', value: '0 / 4,096' });
    const stRet = GG.ui.stat(f.readouts, { label: 'returns', value: '0', tone: 'core' });

    function plan() {
      const r = prng(run * 7919 + sms * 131 + 17);
      const order = [...Array(NB).keys()].map((i) => [i, i + r() * 5]).sort((a, b) => a[1] - b[1]).map((a) => a[0]);
      const free = new Array(sms).fill(0);
      const blocks = [];
      order.forEach((b) => {
        let lane = 0;
        for (let k = 1; k < sms; k++) if (free[k] < free[lane] - 1e-9) lane = k;
        const dur = 0.7 + r() * 0.8;
        blocks[b] = { b, x: b % GX, y: Math.floor(b / GX), lane, start: free[lane], end: free[lane] + dur };
        free[lane] += dur;
      });
      const fin = blocks.slice().sort((a, b) => a.end - b.end);
      fin.forEach((bk, i) => { bk.rank = i; });
      P = { blocks, fin, total: Math.max(...free) };
    }
    function relaunch() {
      plan();
      t = 0;
      build();
      if (GG.reducedMotion) { t = P.total; paint(); }
      else { anim.start(); play.sync(); }
    }
    function build(w) {
      if (w) W = w;
      if (!W || !P) return;
      clear(svg);
      const nar = W < 600;
      const LX = nar ? 42 : 78, x1 = W - 2, span = x1 - LX;
      const X = (tt) => LX + (tt / P.total) * span;
      const g = S('g', null, svg);
      let y = 0;
      tx(g, 0, y + 12, 'A procedure on a CPU', { fill: 'var(--host)', size: 11.5, weight: 600 });
      tx(g, x1, y + 12, nar ? 'not to scale' : 'called once · runs once · returns once · timelines not to scale', { fill: 'var(--ink-3)', size: 10, anchor: 'end' });
      y += 20;
      tx(g, 0, y + 15, 'CPU', { fill: 'var(--ink-3)', size: 10 });
      rect(g, LX, y, span, 22, { rx: 6, fill: 'var(--host-a)', stroke: 'var(--host)' });
      // one thread works through every output in turn: its progress fills the bar as the kernel runs below
      const cpuFill = rect(g, LX, y, 0, 22, { rx: 6, fill: 'var(--host)', opacity: 0.35 });
      const cpuCur = line(g, LX, y - 3, LX, y + 25, { stroke: 'var(--host)', sw: 1.6 });
      tx(g, LX + 10, y + 15, nar ? 'one thread: 4,096 outputs in turn' : 'call mm_cpu(A, B, C, N) → one thread works through all 4,096 outputs in turn → return', { fill: 'var(--ink)', size: 10 });
      const cpuT = tx(g, 0, y + 36, '', { fill: 'var(--ink-3)', size: 10 });
      y += 22 + (nar ? 30 : 34);
      tx(g, 0, y + 12, 'A CUDA kernel', { fill: 'var(--ink)', size: 11.5, weight: 600 });
      if (!nar) tx(g, x1, y + 12, `launched once · executed by ${fmt.int(NB * TPB)} threads · returns once`, { fill: 'var(--ink-3)', size: 10, anchor: 'end' });
      y += 20;
      const hostY = y;
      tx(g, 0, y + 15, 'host', { fill: 'var(--ink-3)', size: 10 });
      line(g, LX, y + 11, x1, y + 11, { stroke: 'var(--line-2)', dash: '3 4' });
      const lw = nar ? 60 : 250;
      const launch = rect(g, LX, y, lw, 22, { rx: 6, fill: 'var(--host-a)', stroke: 'var(--host)' });
      tx(g, LX + 8, y + 15, nar ? 'launch' : 'launch: mm<<<grid, block>>>(A, B, C, N)', { fill: 'var(--ink)', size: 10 });
      const done = S('g', null, g);
      const dw = nar ? 56 : 132;
      rect(done, x1 - dw, y, dw, 22, { rx: 6, fill: '#12131c' });
      rect(done, x1 - dw, y, dw, 22, { rx: 6, fill: 'var(--core-a)', stroke: 'var(--core)' });
      tx(done, x1 - dw / 2, y + 15, nar ? 'return' : 'all done: one return', { fill: 'var(--ink)', size: 10, anchor: 'middle' });
      y += 32;
      const lh = sms >= 8 ? 19 : 25, lg = 4;
      const laneY = (k) => y + k * (lh + lg);
      for (let k = 0; k < sms; k++) {
        tx(g, 0, laneY(k) + lh / 2 + 4, 'SM ' + k, { fill: 'var(--ink-2)', size: 10 });
        rect(g, LX, laneY(k), span, lh, { rx: 5, fill: 'rgba(255,255,255,0.02)', stroke: 'var(--line)' });
      }
      // the cursor is drawn first, so it runs behind the block bars and their labels
      const cursor = line(g, LX, laneY(0) - 4, LX, laneY(sms - 1) + lh + 4, { stroke: 'var(--accent)', sw: 1.3 });
      const bars = P.blocks.map((b) => {
        const gb = S('g', null, g);
        const bx0 = X(b.start) + 1, bw = Math.max(2, X(b.end) - X(b.start) - 2);
        const by = laneY(b.lane) + 2, bh = lh - 4;
        const bg = rect(gb, bx0, by, bw, bh, { rx: 4, fill: 'none', stroke: 'var(--core)' });
        const prog = rect(gb, bx0, by, 0, bh, { rx: 4, fill: 'var(--core)', opacity: 0.32 });
        if (bw >= 28) rect(gb, bx0 + bw / 2 - 13, by + bh / 2 - 7, 26, 14, { rx: 3, fill: '#12131c', opacity: 0.85 });
        const lab = bw >= 28 ? tx(gb, bx0 + bw / 2, by + bh / 2 + 3.5, `${b.x},${b.y}`, { fill: 'var(--ink)', size: 10, anchor: 'middle' }) : null;
        return { b, gb, bg, prog, lab, bw };
      });
      const yEnd = laneY(sms - 1) + lh;
      y = yEnd + 20;
      tx(g, 0, y + 10, nar ? 'global memory' : 'global memory (GPU RAM): the kernel’s pointers point here', { fill: 'var(--memory)', size: 10.5 });
      y += 20;
      const gapM = nar ? 22 : 40;
      const ts = Math.min(24, (W - 2 * gapM - 4) / 12);
      const cTiles = [], aTiles = [], bTiles = [];
      ['A', 'B', 'C'].forEach((nm, j) => {
        const mx = j * (4 * ts + gapM);
        for (let q = 0; q < 16; q++) {
          const r = rect(g, mx + (q % 4) * ts + 0.5, y + Math.floor(q / 4) * ts + 0.5, ts - 1, ts - 1, { rx: 2, fill: nm === 'C' ? 'rgba(111,166,255,0.06)' : 'rgba(111,166,255,0.2)', stroke: nm === 'C' ? 'var(--line-2)' : 'rgba(111,166,255,0.5)' });
          if (nm === 'A') aTiles[q] = r;
          if (nm === 'B') bTiles[q] = r;
          if (nm === 'C') cTiles[q] = { r, t: ts >= 14 ? tx(g, mx + (q % 4) * ts + ts / 2, y + Math.floor(q / 4) * ts + ts / 2 + 3.5, '', { fill: 'var(--ink)', size: Math.min(10, ts * 0.45), anchor: 'middle' }) : null };
        }
        tx(g, mx, y + 4 * ts + 14, nm === 'C' ? (nar ? 'C · written' : 'C · written, tile by tile') : nar ? `${nm} · read` : nm === 'A' ? 'A · rows read now' : 'B · columns read now', { fill: nm === 'C' ? 'var(--ink)' : 'var(--ink-2)', size: 10 });
      });
      if (!nar) tx(g, 3 * (4 * ts + gapM), y + 2 * ts + 4, 'numbers: the order the blocks finished', { fill: 'var(--ink-3)', size: 10 });
      const H = y + 4 * ts + 22;
      svg.setAttribute('viewBox', `0 0 ${W} ${r1(H)}`);
      G = { bars, cursor, X, done, launch, cTiles, aTiles, bTiles, cpuFill, cpuCur, cpuT, LX, span, nar };
      paint();
    }
    function paint() {
      if (!G || !P) return;
      let running = 0, nd = 0;
      const rowsRead = new Set(), colsRead = new Set();
      G.bars.forEach((o) => {
        const b = o.b;
        const st = t >= b.end - 1e-9 ? 'done' : t > b.start ? 'run' : 'wait';
        if (st === 'run') { running++; rowsRead.add(b.y); colsRead.add(b.x); }
        if (st === 'done') nd++;
        o.gb.setAttribute('opacity', st === 'wait' ? '0' : '1');
        o.bg.setAttribute('fill', st === 'done' ? 'rgba(69,212,155,0.2)' : 'none');
        o.prog.setAttribute('width', r1(st === 'run' ? (o.bw * (t - b.start)) / (b.end - b.start) : 0));
        const ct = G.cTiles[b.b];
        ct.r.setAttribute('fill', st === 'done' ? 'rgba(69,212,155,0.3)' : st === 'run' ? 'rgba(69,212,155,0.1)' : 'rgba(111,166,255,0.06)');
        ct.r.setAttribute('stroke', st === 'wait' ? 'var(--line-2)' : 'var(--core)');
        if (ct.t) ct.t.textContent = st === 'done' ? String(b.rank + 1) : '';
      });
      // a running block (x, y) reads row band y of A and column band x of B
      G.aTiles.forEach((r, q) => r.setAttribute('fill', rowsRead.has(Math.floor(q / 4)) ? 'rgba(111,166,255,0.55)' : 'rgba(111,166,255,0.14)'));
      G.bTiles.forEach((r, q) => r.setAttribute('fill', colsRead.has(q % 4) ? 'rgba(111,166,255,0.55)' : 'rgba(111,166,255,0.14)'));
      const x = G.X(t);
      G.cursor.setAttribute('x1', r1(x)); G.cursor.setAttribute('x2', r1(x));
      const cf = P.total ? t / P.total : 0;
      G.cpuFill.setAttribute('width', r1(G.span * cf));
      G.cpuCur.setAttribute('x1', r1(G.LX + G.span * cf)); G.cpuCur.setAttribute('x2', r1(G.LX + G.span * cf));
      G.cpuCur.setAttribute('opacity', cf > 0 && cf < 1 ? '1' : '0');
      G.cpuT.textContent = `body runs: 1 · outputs done: ${fmt.int(Math.floor(4096 * cf))} / 4,096${G.nar ? '' : ', one after another'}`;
      G.cursor.setAttribute('opacity', t > 0 && t < P.total ? '1' : '0');
      const fin = t >= P.total - 1e-9;
      G.done.setAttribute('opacity', fin ? '1' : '0.18');
      stR.set(String(running));
      stF.set(`${fmt.int(nd * TPB)} / ${fmt.int(NB * TPB)}`, fin ? 'core' : null);
      stL.set(String(run));
      stRet.set(String(run - 1 + (fin ? 1 : 0)));
      const ord = (n) => P.fin.slice(0, n).map((b) => `(${b.x}, ${b.y})`).join(', ');
      let why;
      if (t <= 0) why = `The host makes one call, <code>mm&lt;&lt;&lt;grid, block&gt;&gt;&gt;(A, B, C, N)</code>, which launches the kernel: a 4 × 4 grid of blocks of 16 × 16 threads, 4,096 threads in all. Press Play.`;
      else if (!fin) why = `${running} block${running === 1 ? '' : 's'} running right now${running > 1 ? `, on ${running} different SMs at the same time: <b>parallel</b>` : ''}. ${nd ? `${nd} finished so far, in the order ${ord(Math.min(nd, 5))}${nd > 5 ? ', …' : ''}, which the program never asked for: <b>concurrent</b>.` : 'None has finished yet.'}`;
      else if (sms === 1) why = `Done: one launch, one return. With a single SM the blocks ran one after another, so they were not parallel with each other. They were still <b>concurrent</b>: the order (this time ${ord(4)}, …) is not up to the program. Inside each block, its 256 threads, 8 warps, shared the SM: up to 4 of those warps issued on any one clock (one per warp scheduler), and the schedulers interleaved the rest.`;
      else why = `Done: <b>one launch, one return</b>, and ${fmt.int(NB * TPB)} executions of the kernel body, up to ${Math.min(sms, NB)} blocks at a time. This time the blocks finished in the order ${ord(5)}, …; press Launch again and the order changes. C ends up the same every time: the kernel returns nothing, it just writes its results into memory.`;
      f.setWhy(why);
    }
    plan();
    onWidth(wrap, (w) => build(w));
    if (GG.reducedMotion) t = P.total;
    else GG.onVisible(wrap, (v) => { if (v && t === 0 && !anim.running) { anim.start(); play.sync(); } }, { once: true });
  }

  /* Fig: one thread of the naive kernel */
  function kNaive(host, ctx, code) {
    const f = ctx.figure(host, {
      title: 'One thread of the naive kernel',
      hint: canHover ? 'click an element of C · play' : 'tap an element of C · play',
      wide: true,
      caption: 'B sits above C and A to its left, so the row of A and the column of B that meet at an element of C line up with it. The thread that owns <code>C[row][col]</code> walks k from 0 to N − 1, loading one element of A and one of B from global memory into its registers each time, then multiplying and adding. The matrices hold small integers so you can check the arithmetic, and are stored row-major: element (i, j) lives at index i × N + j. Here the kernel is launched with 4 × 4 thread blocks, so when N is not a multiple of 4 some threads (dashed) fall outside C.',
    });
    const BD = 4;
    let N = 8, row = 2, col = 5, s = 3, G = null, W = 0, acc = 0;
    const Av = (i, k) => ((i * 3 + k * 5 + 1) % 7) - 3;
    const Bv = (k, j) => ((k * 2 + j * 3) % 5) - 2;
    const sumTo = (kk) => { let v = 0; for (let k = 0; k <= kk; k++) v += Av(row, k) * Bv(k, col); return v; };
    const wrap = el('div', { class: 'dsb-w' });
    f.stage.append(wrap);
    const svg = S('svg', { class: 'dsb-svg', role: 'img', tabindex: '0', 'data-keys': '', 'aria-label': 'Matrices A, B and C. The chosen thread’s row of A and column of B are highlighted, with the pair of elements it is loading now outlined; its registers row, col, k, a, b and sum are shown in the corner. Arrow keys move the chosen element of C; Enter steps.' }, wrap);
    const strip = el('div', { class: 'dsb-strip' });
    const detail = el('div', { class: 'dsb-detail', 'aria-live': 'polite' });
    f.stage.append(strip, detail);
    GG.ui.seg(f.controls, {
      label: 'N', value: N,
      options: [4, 6, 8, 16].map((v) => ({ value: v, label: String(v) })),
      onChange: (v) => { N = v; row = Math.min(row, N - 1); col = Math.min(col, N - 1); s = -1; build(); },
    });
    const btns = el('div', { class: 'dsb-flex' });
    f.controls.append(btns);
    const anim = GG.anim(wrap, (tt, dt) => { acc += dt; if (acc > 0.62) { acc = 0; next(true); } }, { autostart: false });
    const play = GG.ui.playButton(btns, anim, { onToggle: (on) => { if (on && s >= N) { s = -1; paint(); } } });
    GG.ui.button(btns, { icon: 'next', label: 'Next k', onClick: () => { anim.stop(); play.sync(); next(false); } });
    GG.ui.button(btns, { icon: 'reset', label: 'Restart', onClick: () => { s = -1; acc = 0; paint(); } });
    const stG = GG.ui.stat(f.readouts, { label: 'global loads · this thread', value: '', tone: 'memory' });
    const stF = GG.ui.stat(f.readouts, { label: 'FLOPs · this thread', value: '', tone: 'core' });
    const stR = GG.ui.stat(f.readouts, { label: 'FLOPs per load', value: '', tone: 'core' });
    const stAll = GG.ui.stat(f.readouts, { label: 'loads · whole kernel (2·N³)', value: '', tone: 'memory' });

    function next(auto) {
      if (s >= N) { if (auto) { anim.stop(); play.sync(); } else s = -1; }
      else s++;
      if (auto && s >= N) { anim.stop(); play.sync(); }
      paint();
    }
    function select(r, c) { row = clamp(r, 0, N - 1); col = clamp(c, 0, N - 1); s = -1; acc = 0; paint(); }

    function build(w) {
      if (w) W = w;
      if (!W) return;
      clear(svg);
      const Gd = Math.ceil(N / BD) * BD;
      const lab = 16, top = 30;
      const c = Math.min(N <= 8 ? 28 : 15, (W - lab - 6) / (2 * Gd + 1));
      const gap = Math.max(10, c);
      const Ww = lab + 2 * Gd * c + gap;
      const ox = Math.max(0, (W - Ww) / 2) + lab, oy = top;
      const Cx = ox + Gd * c + gap, Cy = oy + Gd * c + gap;
      const Bx = Cx, By = Cy - gap - N * c, Ax = Cx - gap - N * c, Ay = Cy;
      const H = Cy + Gd * c + 20;
      svg.setAttribute('viewBox', `0 0 ${W} ${r1(H)}`);
      const g = S('g', null, svg);
      const showV = c >= 18;
      const fs = clamp(c * 0.42, 8.5, 11);
      const every = c >= 13 ? 1 : 4;
      tx(g, Bx, By - 19, `B · ${N} × ${N}`, { fill: 'var(--ink-2)', size: 10.5, weight: 600 });
      tx(g, Ax, Ay + N * c + 14, `A · ${N} × ${N}`, { fill: 'var(--ink-2)', size: 10.5, weight: 600 });
      tx(g, Cx, H - 4, `C = A × B`, { fill: 'var(--ink-2)', size: 10.5, weight: 600 });
      const colLab = [], rowLab = [];
      for (let j = 0; j < N; j++) colLab.push(j % every === 0 ? tx(g, Bx + j * c + c / 2, By - 6, String(j), { fill: 'var(--ink-3)', size: 9, anchor: 'middle' }) : null);
      for (let i = 0; i < N; i++) rowLab.push(i % every === 0 ? tx(g, Ax - 4, Ay + i * c + c / 2 + 3, String(i), { fill: 'var(--ink-3)', size: 9, anchor: 'end' }) : null);
      const cellsA = [], cellsB = [], cellsC = [];
      for (let i = 0; i < N; i++) {
        cellsA.push([]); cellsB.push([]);
        for (let k = 0; k < N; k++) {
          cellsA[i].push(rect(g, Ax + k * c + 0.5, Ay + i * c + 0.5, c - 1, c - 1, { rx: c > 8 ? 2 : 1, fill: 'none' }));
          if (showV) tx(g, Ax + k * c + c / 2, Ay + i * c + c / 2 + fs * 0.36, minus(Av(i, k)), { fill: 'var(--ink-2)', size: fs, anchor: 'middle' });
          cellsB[i].push(rect(g, Bx + k * c + 0.5, By + i * c + 0.5, c - 1, c - 1, { rx: c > 8 ? 2 : 1, fill: 'none' }));
          if (showV) tx(g, Bx + k * c + c / 2, By + i * c + c / 2 + fs * 0.36, minus(Bv(i, k)), { fill: 'var(--ink-2)', size: fs, anchor: 'middle' });
        }
      }
      for (let i = 0; i < Gd; i++) for (let j = 0; j < Gd; j++) {
        if (i < N && j < N) cellsC.push(rect(g, Cx + j * c + 0.5, Cy + i * c + 0.5, c - 1, c - 1, { rx: c > 8 ? 2 : 1, fill: 'rgba(111,166,255,0.05)', stroke: 'var(--line)' }));
        else rect(g, Cx + j * c + 1.5, Cy + i * c + 1.5, c - 3, c - 3, { rx: 2, fill: 'none', stroke: 'var(--ink-3)', dash: '2 2', opacity: 0.7 });
      }
      for (let bi = 0; bi < Gd / BD; bi++) for (let bj = 0; bj < Gd / BD; bj++) rect(g, Cx + bj * BD * c, Cy + bi * BD * c, BD * c, BD * c, { rx: 3, fill: 'none', stroke: 'var(--line-2)', dash: '4 3' });
      const cT = tx(g, 0, 0, '', { fill: 'var(--ink)', size: fs, anchor: 'middle', weight: 600 });
      const selC = rect(g, 0, 0, c, c, { rx: 2, fill: 'none', stroke: 'var(--accent)', sw: 2 });
      const curA = rect(g, 0, 0, c, c, { rx: 2, fill: 'none', stroke: 'var(--accent)', sw: 1.8 });
      const curB = rect(g, 0, 0, c, c, { rx: 2, fill: 'none', stroke: 'var(--accent)', sw: 1.8 });
      // registers, in the empty top-left quadrant
      const Q = Gd * c;
      const gr = S('g', null, g);
      tx(gr, ox, oy + 11, Q < 170 ? 'registers' : 'this thread’s registers', { fill: 'var(--memory)', size: 10 });
      const bw = (Q - 6) / 2, bh = Math.min(26, (Q - 22) / 3 - 5);
      const regs = {};
      ['row', 'col', 'k', 'sum', 'a', 'b'].forEach((nm, q) => {
        const rx0 = ox + (q % 2) * (bw + 6), ry0 = oy + 18 + Math.floor(q / 2) * (bh + 5);
        const r = rect(gr, rx0, ry0, bw, bh, { rx: 5, fill: 'var(--memory-a)', stroke: 'rgba(111,166,255,0.55)' });
        tx(gr, rx0 + 7, ry0 + bh / 2 + 3.5, nm === 'a' ? (Q < 170 ? 'a' : 'a (from A)') : nm === 'b' ? (Q < 170 ? 'b' : 'b (from B)') : nm, { fill: 'var(--ink-3)', size: 9.5 });
        regs[nm] = { r, t: tx(gr, rx0 + bw - 7, ry0 + bh / 2 + 3.5, '', { fill: 'var(--ink)', size: 10.5, anchor: 'end', weight: 600 }) };
      });
      const hit = rect(g, Cx, Cy, N * c, N * c, { rx: 0, fill: 'transparent', cls: 'dsb-hit' });
      hit.addEventListener('click', (e) => { const p = svgPt(svg, e); select(Math.floor((p.y - Cy) / c), Math.floor((p.x - Cx) / c)); });
      G = { c, Ax, Ay, Bx, By, Cx, Cy, cellsA, cellsB, cellsC, cT, selC, curA, curB, regs, colLab, rowLab };
      paint();
    }
    function paint() {
      if (!G) return;
      const { c } = G;
      const inLoop = s >= 0 && s < N, done = s >= N;
      const k = inLoop ? s : -1;
      const fillFor = (on, kk) => {
        if (!on) return 'rgba(111,166,255,0.05)';
        if (done || kk < k) return 'rgba(111,166,255,0.3)';
        if (kk === k) return 'rgba(111,166,255,0.62)';
        return 'rgba(111,166,255,0.13)';
      };
      for (let i = 0; i < N; i++) for (let kk = 0; kk < N; kk++) {
        const a = G.cellsA[i][kk], onA = i === row;
        a.setAttribute('fill', fillFor(onA, kk));
        a.setAttribute('stroke', onA ? 'rgba(111,166,255,0.7)' : 'var(--line)');
        const b = G.cellsB[i][kk], onB = kk === col;
        b.setAttribute('fill', fillFor(onB, i));
        b.setAttribute('stroke', onB ? 'rgba(111,166,255,0.7)' : 'var(--line)');
      }
      G.colLab.forEach((t, j) => { if (t) t.style.fill = j === col ? 'var(--accent)' : 'var(--ink-3)'; });
      G.rowLab.forEach((t, i) => { if (t) t.style.fill = i === row ? 'var(--accent)' : 'var(--ink-3)'; });
      const place = (r, x, y) => { r.setAttribute('x', r1(x)); r.setAttribute('y', r1(y)); r.setAttribute('width', r1(c)); r.setAttribute('height', r1(c)); };
      place(G.selC, G.Cx + col * c, G.Cy + row * c);
      G.curA.setAttribute('opacity', inLoop ? '1' : '0');
      G.curB.setAttribute('opacity', inLoop ? '1' : '0');
      if (inLoop) { place(G.curA, G.Ax + k * c, G.Ay + row * c); place(G.curB, G.Bx + col * c, G.By + k * c); }
      G.cellsC.forEach((r) => r.setAttribute('fill', 'rgba(111,166,255,0.05)'));
      const ci = G.cellsC[row * N + col];
      if (ci) ci.setAttribute('fill', done ? 'rgba(69,212,155,0.42)' : s >= 0 ? `rgba(69,212,155,${r1(0.08 + (0.24 * (s + 1)) / N)})` : 'rgba(255,138,91,0.12)');
      const total = sumTo(N - 1);
      G.cT.setAttribute('x', r1(G.Cx + col * c + c / 2)); G.cT.setAttribute('y', r1(G.Cy + row * c + c / 2 + 3.5));
      G.cT.textContent = done && c >= 16 ? minus(total) : '';
      const a = inLoop ? Av(row, k) : null, b = inLoop ? Bv(k, col) : null;
      const sum = s < 0 ? 0 : sumTo(Math.min(s, N - 1));
      G.regs.row.t.textContent = String(row);
      G.regs.col.t.textContent = String(col);
      G.regs.k.t.textContent = inLoop ? String(k) : done ? '—' : '—';
      G.regs.a.t.textContent = inLoop ? minus(a) : '—';
      G.regs.b.t.textContent = inLoop ? minus(b) : '—';
      G.regs.sum.t.textContent = minus(sum);
      ['a', 'b'].forEach((nm) => G.regs[nm].r.setAttribute('fill', inLoop ? 'rgba(111,166,255,0.38)' : 'var(--memory-a)'));
      G.regs.sum.r.setAttribute('fill', s >= 0 ? 'rgba(69,212,155,0.2)' : 'var(--memory-a)');
      G.regs.sum.r.setAttribute('stroke', s >= 0 ? 'var(--core)' : 'rgba(111,166,255,0.55)');
      // code
      const lines = s < 0 ? [2, 3, 5, 6] : inLoop ? [7, 8] : [10];
      const tone = s < 0 ? 'control' : 'memory';
      if (code) { code.clear(); code.highlight(lines, tone); }
      codeStrip(strip, MM_NAIVE, lines, tone, s < 0 ? 'now running · before the loop' : inLoop ? `now running · loop iteration k = ${k}` : 'now running · after the loop');
      const iters = s < 0 ? 0 : Math.min(s + 1, N);
      const loads = 2 * iters, flops = 2 * iters; // per iteration: a load from A and one from B; a multiply and an add
      stG.set(fmt.int(loads)); stF.set(fmt.int(flops)); stR.set(loads ? fmt.sig(flops / loads, 2) : '—');
      stAll.set(fmt.int(2 * N * N * N));
      const bi = [Math.floor(col / BD), Math.floor(row / BD)], ti = [col % BD, row % BD];
      const Gd = Math.ceil(N / BD) * BD;
      const seg = [`<b class="a dsb-nw">blockIdx = (${bi[0]}, ${bi[1]})</b>`, `<b class="a dsb-nw">threadIdx = (${ti[0]}, ${ti[1]})</b>`, `<span class="dsb-nw">row = ${bi[1]} × 4 + ${ti[1]} = <b>${row}</b></span>`, `<span class="dsb-nw">col = ${bi[0]} × 4 + ${ti[0]} = <b>${col}</b></span>`];
      if (inLoop) seg.push(`<span class="m dsb-nw">A[${row} * ${N} + ${k}] = A[${row * N + k}] = ${minus(a)}</span>`, `<span class="m dsb-nw">B[${k} * ${N} + ${col}] = B[${k * N + col}] = ${minus(b)}</span>`);
      if (done) seg.push(`<span class="c dsb-nw">C[${row} * ${N} + ${col}] = C[${row * N + col}] ← ${minus(total)}</span>`);
      detail.innerHTML = seg.join(' &nbsp;·&nbsp; ');
      let why;
      if (s < 0) {
        why = `This thread computes row = <b>${row}</b> and col = <b>${col}</b> from its block and thread indices. Both are less than N = ${N}, so it passes the guard <code>row &lt; N &amp;&amp; col &lt; N</code> and starts with sum = 0. Press Play or Next k.`;
        if (Gd > N) why += ` The grid has ${Gd} × ${Gd} = ${Gd * Gd} threads for ${N * N} elements, so ${Gd * Gd - N * N} threads (dashed) fail the guard and do nothing.`;
      } else if (inLoop) {
        const prev = k ? sumTo(k - 1) : 0;
        why = `<b>k = ${k}</b>: load A[${row * N + k}] = ${minus(a)} and B[${k * N + col}] = ${minus(b)} from global memory into registers, then multiply and add: sum = ${minus(prev)} + ${paren(a)} × ${paren(b)} = <b>${minus(sum)}</b>. So far: ${loads} loads from global memory, ${flops} FLOPs. <b>One FLOP per load</b>, on every iteration.`;
      } else {
        why = `Done: one store, C[${row * N + col}] = <b>${minus(total)}</b>. This thread loaded all of row ${row} of A and all of column ${col} of B: <b>${2 * N} loads for ${2 * N} FLOPs</b>. All ${N * N} threads do the same, so the kernel makes 2 × N³ = ${fmt.int(2 * N * N * N)} loads, and every element of A and of B is loaded ${N} times, once by each thread that needs it.`;
      }
      f.setWhy(why);
    }
    svg.addEventListener('keydown', (e) => {
      const d = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key];
      if (d) { e.preventDefault(); select(row + d[0], col + d[1]); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); anim.stop(); play.sync(); next(false); }
    });
    onWidth(wrap, (w) => build(w));
  }

  /* Fig: the tiled kernel, phase by phase */
  function kTiled(host, ctx, code) {
    const f = ctx.figure(host, {
      title: 'The tiled kernel, phase by phase',
      hint: canHover ? 'step through · click C to pick a thread' : 'step through · tap C to pick a thread',
      wide: true,
      caption: 'One thread block (copper outline in C) computes one 16 × 16 tile of C. In each phase m it copies one 16 × 16 tile of A (from its band of rows) and one of B (from its band of columns) into shared memory, waits at a barrier, does 16 multiply-adds per thread out of shared memory, and waits again. The copper square is one thread: its own element of C, the two elements it copies in each phase, and, during the multiply-adds, the row of As and the column of Bs it reads. In the load step, the two tiles are tagged “→ As” and “→ Bs” and a copy of each travels from global memory into shared memory; in the multiply-add step, the green row and column in C are the 16 + 16 threads that read the same row of As and column of Bs as the copper thread. Tiles are labelled by (tile-row, tile-column); blocks by blockIdx = (x, y), which is (column, row).',
    });
    const TW = 16;
    let N = 64, row = 21, col = 37, si = 7, G = null, W = 0, steps = [], stepper = null;
    const wrap = el('div', { class: 'dsb-w' });
    f.stage.append(wrap);
    const svg = S('svg', { class: 'dsb-svg', role: 'img', tabindex: '0', 'data-keys': '', 'aria-label': 'Matrices A, B and C divided into 16 by 16 tiles, and an SM panel with the two shared-memory tiles As and Bs. The current tiles of A and B, the block’s tile of C and one thread’s elements are highlighted. Arrow keys move the chosen thread.' }, wrap);
    const strip = el('div', { class: 'dsb-strip' });
    f.stage.append(strip);
    GG.ui.seg(f.controls, {
      label: 'N (a multiple of 16)', value: N,
      options: [32, 48, 64].map((v) => ({ value: v, label: String(v) })),
      onChange: (v) => { N = v; row = Math.min(row, N - 1); col = Math.min(col, N - 1); makeSteps(); makeStepper(0); build(); },
    });
    const stepBox = el('div', { class: 'dsb-w dsb-many' });
    f.controls.append(stepBox);
    const stG = GG.ui.stat(f.readouts, { label: 'global loads · this thread', value: '', tone: 'memory' });
    const stF = GG.ui.stat(f.readouts, { label: 'FLOPs · this thread', value: '', tone: 'core' });
    const stR = GG.ui.stat(f.readouts, { label: 'FLOPs per global load', value: '', tone: 'core' });
    const stU = GG.ui.stat(f.readouts, { label: 'threads reading each smem element', value: '—', tone: 'memory' });
    const stS = GG.ui.stat(f.readouts, { label: 'phase (outer loop m)', value: '—', tone: 'control' });
    // the load step: ghost copies of this phase's tiles fly from global memory into As and Bs
    let flyT = 1, lastSi = -1;
    const fly = GG.anim(wrap, (tt, dt) => { flyT = Math.min(1, flyT + dt / 0.85); paintFly(); if (flyT >= 1) fly.stop(); }, { autostart: false });
    function makeSteps() {
      const P = N / TW;
      steps = [{ k: 'start', label: 'Start' }];
      for (let m = 0; m < P; m++) steps.push({ k: 'load', m, label: `m = ${m}: load two tiles` }, { k: 'sync1', m, label: `m = ${m}: barrier` }, { k: 'comp', m, label: `m = ${m}: 16 multiply-adds` }, { k: 'sync2', m, label: `m = ${m}: barrier` });
      steps.push({ k: 'store', label: 'Store C' });
    }
    function makeStepper(start) {
      if (stepper) stepper.stop();
      clear(stepBox);
      si = clamp(start, 0, steps.length - 1);
      stepper = GG.ui.stepper(stepBox, { label: 'Step', steps, autoplay: 1500, start: si, onStep: (i) => { si = i; paint(); } });
    }
    function build(w) {
      if (w) W = w;
      if (!W) return;
      clear(svg);
      const wide = W >= 760;
      const lab = 4, top = 22;
      const SPW = wide ? 330 : W;
      const MW = wide ? W - SPW - 30 : W;
      const side = Math.min(wide ? 236 : 1e9, (MW - lab - 12) / 2);
      const c = side / N;
      const ox = lab, oy = top;
      const Bx = ox + side + 12, By = oy, Ax = ox, Ay = oy + side + 12, Cx = Bx, Cy = Ay;
      const matH = Ay + side + 20;
      const pw = SPW;
      const cs = Math.min(10, (pw - 36) / 32);
      const gsz = cs * TW;
      const ph = 40 + gsz + 16 + 24 + 12 + 30 + 10;
      const px = wide ? MW + 30 : 0, py = wide ? Math.max(oy, (matH - ph) / 2) : matH + 8;
      const H = Math.max(matH, py + ph) + 2;
      svg.setAttribute('viewBox', `0 0 ${W} ${r1(H)}`);
      const g = S('g', null, svg);
      const P = N / TW;
      const grid = (x, y, sz, n, col0) => {
        let d = '';
        for (let q = 1; q < n; q++) { const o = (q * sz) / n; d += `M${r1(x + o)},${r1(y)}V${r1(y + sz)}M${r1(x)},${r1(y + o)}H${r1(x + sz)}`; }
        return path(g, d, { stroke: col0, sw: 1 });
      };
      // global matrices
      const mats = {};
      [['A', Ax, Ay], ['B', Bx, By], ['C', Cx, Cy]].forEach(([nm, x, y]) => {
        rect(g, x, y, side, side, { rx: 3, fill: 'rgba(111,166,255,0.05)', stroke: 'var(--line-2)' });
        mats[nm] = { x, y };
      });
      tx(g, Bx, 12, wide ? `B · ${N} × ${N} floats in global memory` : `B · ${N} × ${N}`, { fill: 'var(--ink-2)', size: 10.5, weight: 600 });
      tx(g, Ax, Ay + side + 15, `A · ${N} × ${N}`, { fill: 'var(--ink-2)', size: 10.5, weight: 600 });
      tx(g, Cx, Cy + side + 15, 'C = A × B', { fill: 'var(--ink-2)', size: 10.5, weight: 600 });
      const bandA = rect(g, 0, 0, 0, 0, { rx: 2, fill: 'rgba(111,166,255,0.1)' });
      const bandB = rect(g, 0, 0, 0, 0, { rx: 2, fill: 'rgba(111,166,255,0.1)' });
      const tileA = [], tileB = [];
      for (let m = 0; m < P; m++) {
        tileA.push(rect(g, 0, 0, 0, 0, { rx: 2, fill: 'none' }));
        tileB.push(rect(g, 0, 0, 0, 0, { rx: 2, fill: 'none' }));
      }
      const tileC = rect(g, 0, 0, 0, 0, { rx: 2, fill: 'none', stroke: 'var(--accent)', sw: 1.6 });
      // the threads that share the copper thread's row of As (same threadIdx.y) and column of Bs (same threadIdx.x)
      const rdRow = rect(g, 0, 0, 0, 0, { rx: 1, fill: 'rgba(69,212,155,0.45)', stroke: 'var(--core)', sw: 0.8, opacity: 0 });
      const rdCol = rect(g, 0, 0, 0, 0, { rx: 1, fill: 'rgba(69,212,155,0.45)', stroke: 'var(--core)', sw: 0.8, opacity: 0 });
      ['A', 'B', 'C'].forEach((nm) => grid(mats[nm].x, mats[nm].y, side, P, 'rgba(255,255,255,0.13)'));
      // a label on a dark pill, so no line or tile drawn under it can hide it
      const pillLab = (x, y, o) => {
        const bg = rect(g, x - 3, y - 11, 10, 15, { rx: 4, fill: '#11121c', opacity: 0.92 });
        const oo = Object.assign({ fill: 'var(--memory)', size: 10 }, o || {});
        const t2 = tx(g, x, y, '', oo);
        return { set(s) { t2.textContent = s; bg.setAttribute('width', r1(s.length * oo.size * 0.62 + 6)); bg.setAttribute('opacity', s ? '0.92' : '0'); }, bg, t2 };
      };
      const ring = (sz) => rect(g, 0, 0, sz, sz, { rx: 1.5, fill: 'var(--accent)', stroke: '#0b0c12', sw: 1.2 });
      const rs = Math.max(c, 6);
      const elA = ring(rs), elB = ring(rs), elC = ring(rs);
      // load step: "→ As" / "→ Bs" tags on this phase's tiles of A and B
      const tagA = pillLab(0, 0, { fill: 'var(--memory)', weight: 600 }), tagB = pillLab(0, 0, { fill: 'var(--memory)', weight: 600 });
      // SM panel
      rect(g, px, py, pw, ph, { rx: 10, fill: 'rgba(255,255,255,0.02)', stroke: 'var(--line-2)' });
      const pTitle = pillLab(px + 10, py + 16, { fill: 'var(--ink-2)', size: 10.5, weight: 600 });
      const gx1 = px + 12, gx2 = px + pw - 12 - gsz, gy = py + 40;
      const lAs = pillLab(gx1, gy - 6, { fill: 'var(--memory)', size: 10 });
      const lBs = pillLab(gx2, gy - 6, { fill: 'var(--memory)', size: 10 });
      const sm = {};
      [['As', gx1], ['Bs', gx2]].forEach(([nm, x]) => {
        rect(g, x, gy, gsz, gsz, { rx: 2, fill: 'rgba(255,255,255,0.02)', stroke: 'var(--line-2)' });
        const fillR = rect(g, x, gy, gsz, gsz, { rx: 2, fill: 'rgba(111,166,255,0.3)' });
        grid(x, gy, gsz, TW, 'rgba(255,255,255,0.07)');
        const hl = rect(g, x, gy, 0, 0, { rx: 1, fill: 'rgba(69,212,155,0.5)', stroke: 'var(--core)', sw: 1 });
        const own = rect(g, x, gy, cs, cs, { rx: 1, fill: 'var(--accent)' });
        sm[nm] = { x, fillR, hl, own };
      });
      const barY = gy + gsz + 12;
      const bar = rect(g, px + 10, barY, pw - 20, 22, { rx: 6, fill: 'var(--control-a)', stroke: 'var(--control)' });
      const barT = tx(g, px + pw / 2, barY + 15, '__syncthreads(): all 256 threads arrived', { fill: 'var(--control)', size: 10, anchor: 'middle' });
      const regY = barY + 34;
      rect(g, px + 10, regY, pw - 20, 26, { rx: 6, fill: 'var(--memory-a)', stroke: 'rgba(111,166,255,0.55)' });
      const regT = tx(g, px + 18, regY + 17, '', { fill: 'var(--ink)', size: 10 });
      const hit = rect(g, Cx, Cy, side, side, { rx: 0, fill: 'transparent', cls: 'dsb-hit' });
      hit.addEventListener('click', (e) => { const p = svgPt(svg, e); pick(Math.floor((p.y - Cy) / c), Math.floor((p.x - Cx) / c)); });
      // the flying copies, on top of everything while they travel
      const ghA = rect(g, 0, 0, 0, 0, { rx: 2, fill: 'rgba(111,166,255,0.55)', stroke: 'var(--memory)', sw: 1.5, opacity: 0 });
      const ghB = rect(g, 0, 0, 0, 0, { rx: 2, fill: 'rgba(111,166,255,0.55)', stroke: 'var(--memory)', sw: 1.5, opacity: 0 });
      ghA.style.pointerEvents = 'none'; ghB.style.pointerEvents = 'none';
      G = { c, side, Ax, Ay, Bx, By, Cx, Cy, bandA, bandB, tileA, tileB, tileC, elA, elB, elC, rs, sm, cs, gsz, gy, bar, barT, regT, pTitle, lAs, lBs, P, rdRow, rdCol, tagA, tagB, ghA, ghB, gx1, gx2 };
      paint();
    }
    function pick(r, cc) {
      row = clamp(r, 0, N - 1); col = clamp(cc, 0, N - 1);
      paint();
    }
    function paint() {
      if (!G || !steps.length) return;
      const st = steps[si] || steps[0];
      const { c, P } = G;
      const bx = Math.floor(col / TW), by = Math.floor(row / TW), tx_ = col % TW, ty = row % TW;
      const m = st.k === 'start' ? -1 : st.k === 'store' ? P : st.m;
      const T = TW * c;
      const set = (r, x, y, w, h) => { r.setAttribute('x', r1(x)); r.setAttribute('y', r1(y)); r.setAttribute('width', r1(w)); r.setAttribute('height', r1(h)); };
      set(G.bandA, G.Ax, G.Ay + by * T, G.side, T);
      set(G.bandB, G.Bx + bx * T, G.By, T, G.side);
      const compDone = steps.slice(1, si + 1).filter((s) => s.k === 'comp').length;
      for (let q = 0; q < P; q++) {
        const used = q < m || (q === m && (st.k === 'sync2')) || st.k === 'store';
        const cur = q === m && st.k !== 'start' && st.k !== 'store';
        const fillA = cur ? (st.k === 'load' ? 'rgba(111,166,255,0.6)' : 'rgba(111,166,255,0.4)') : used ? 'rgba(111,166,255,0.24)' : 'none';
        [[G.tileA[q], G.Ax + q * T, G.Ay + by * T], [G.tileB[q], G.Bx + bx * T, G.By + q * T]].forEach(([r, x, y]) => {
          set(r, x, y, T, T);
          r.setAttribute('fill', fillA);
          r.setAttribute('stroke', cur ? 'var(--memory)' : 'none');
          r.setAttribute('stroke-width', cur && st.k === 'load' ? '2' : '1.2');
        });
      }
      set(G.tileC, G.Cx + bx * T, G.Cy + by * T, T, T);
      G.tileC.setAttribute('fill', st.k === 'store' ? 'rgba(69,212,155,0.5)' : compDone ? `rgba(69,212,155,${r1(0.08 + (0.3 * compDone) / P)})` : 'none');
      const ring = (r, x, y) => set(r, x + c / 2 - G.rs / 2, y + c / 2 - G.rs / 2, G.rs, G.rs);
      ring(G.elC, G.Cx + col * c, G.Cy + row * c);
      const showLoad = st.k === 'load';
      G.elA.setAttribute('opacity', showLoad ? '1' : '0');
      G.elB.setAttribute('opacity', showLoad ? '1' : '0');
      if (m >= 0 && m < P) {
        ring(G.elA, G.Ax + (m * TW + tx_) * c, G.Ay + row * c);
        ring(G.elB, G.Bx + col * c, G.By + (m * TW + ty) * c);
      }
      const loaded = m >= 0 && m < P, last = st.k === 'store';
      const mm = last ? P - 1 : m;
      const cs = G.cs;
      ['As', 'Bs'].forEach((nm) => {
        const o = G.sm[nm];
        o.fillR.setAttribute('opacity', loaded ? (st.k === 'load' ? '1' : '0.7') : last ? '0.35' : '0');
        set(o.own, o.x + tx_ * cs, G.gy + ty * cs, cs, cs);
        o.own.setAttribute('opacity', loaded ? '1' : '0');
        if (st.k === 'comp') {
          if (nm === 'As') set(o.hl, o.x, G.gy + ty * cs, G.gsz, cs);
          else set(o.hl, o.x + tx_ * cs, G.gy, cs, G.gsz);
          o.hl.setAttribute('opacity', '1');
        } else o.hl.setAttribute('opacity', '0');
      });
      const sync = st.k === 'sync1' || st.k === 'sync2';
      G.bar.setAttribute('opacity', sync ? '1' : '0.15');
      G.barT.style.opacity = sync ? '1' : '0.3';
      G.barT.textContent = sync ? '__syncthreads(): all 256 threads arrived' : '__syncthreads() barrier';
      G.pTitle.set(W < 420 ? `SM · blockIdx (${bx}, ${by}) · shared memory` : `SM · blockIdx = (${bx}, ${by}) · shared memory (L1)`);
      G.lAs.set(loaded || last ? `As ← A tile (${by}, ${mm})` : 'As (empty)');
      G.lBs.set(loaded || last ? `Bs ← B tile (${mm}, ${bx})` : 'Bs (empty)');
      // load: tag this phase's tiles of A and B with where they go, and fly a copy of each into As and Bs
      const showAr = st.k === 'load';
      const place = (tag, x, y) => { tag.set(showAr ? (tag === G.tagA ? '→ As' : '→ Bs') : ''); tag.t2.setAttribute('x', r1(x + 5)); tag.t2.setAttribute('y', r1(y + 13)); tag.bg.setAttribute('x', r1(x + 2)); tag.bg.setAttribute('y', r1(y + 2)); };
      // outside the tiles, so they never cover the copper thread's elements: A's tag above its tile, B's to the left
      if (showAr) { place(G.tagA, G.Ax + m * T - 2, G.Ay + by * T - 18); place(G.tagB, G.Bx + bx * T - 42, G.By + m * T); }
      else { G.tagA.set(''); G.tagB.set(''); }
      G.fly = showAr ? { a: [G.Ax + m * T, G.Ay + by * T, T, T, G.gx1, G.gy, G.gsz, G.gsz], b: [G.Bx + bx * T, G.By + m * T, T, T, G.gx2, G.gy, G.gsz, G.gsz] } : null;
      if (showAr && si !== lastSi && !GG.reducedMotion) { flyT = 0; fly.start(); }
      else if (!showAr) { fly.stop(); flyT = 1; }
      lastSi = si;
      paintFly();
      stS.set(st.k === 'start' ? `— of ${P}` : st.k === 'store' ? `done: ${P} of ${P}` : `${m + 1} of ${P} (m = ${m})`);
      // compute: the 16 threads of this thread's tile-row read the same As row; the 16 of its tile-column, the same Bs column
      const comp = st.k === 'comp';
      set(G.rdRow, G.Cx + bx * T, G.Cy + row * c, T, c);
      set(G.rdCol, G.Cx + col * c, G.Cy + by * T, c, T);
      G.rdRow.setAttribute('opacity', comp ? '1' : '0');
      G.rdCol.setAttribute('opacity', comp ? '1' : '0');
      stU.set(comp ? String(TW) : '—');
      const prods = 16 * compDone;
      G.regT.textContent = `c_output, thread (${tx_}, ${ty}): ${prods} of ${N} products${st.k === 'store' ? ' → C' : ''}`;
      // counters
      let loads = 0, flops = 0;
      for (let i = 1; i <= si; i++) { if (steps[i].k === 'load') loads += 2; if (steps[i].k === 'comp') flops += 32; }
      stG.set(fmt.int(loads)); stF.set(fmt.int(flops));
      stR.set(loads ? fmt.sig(flops / loads, 3) : '—', loads && flops / loads === 16 ? 'core' : 'memory');
      // code
      const L = { start: [[6, 7, 9, 10, 12], 'control'], load: [[13, 16, 17], 'memory'], sync1: [[21], 'control'], comp: [[25, 26], 'core'], sync2: [[30], 'control'], store: [[32], 'memory'] }[st.k];
      if (code) { code.clear(); code.highlight(L[0], L[1]); }
      codeStrip(strip, MM_TILED, L[0], L[1], `now running · ${st.label}`);
      const r0 = by * TW, c0 = bx * TW;
      let why;
      if (st.k === 'start') why = `Block blockIdx = (${bx}, ${by}) of the ${P} × ${P} grid computes the tile of C at rows ${r0}–${r0 + 15} and columns ${c0}–${c0 + 15}. Each of its 256 threads owns one element; the copper one, threadIdx (${tx_}, ${ty}), owns C[${row}][${col}]. It will work through N / TILE_WIDTH = ${N} / 16 = <b>${P} phases</b>, one per tile along the inner dimension. Shared memory starts empty.`;
      else if (st.k === 'load') why = `<b>Phase m = ${m}, load.</b> Every thread of the block copies one element of A’s tile (row ${by}, col ${m}) and one of B’s tile (row ${m}, col ${bx}) from global memory into shared memory (tagged “→ As” and “→ Bs”). This thread copies A[${row}][${m * 16 + tx_}] into As[${ty}][${tx_}] and B[${m * 16 + ty}][${col}] into Bs[${ty}][${tx_}]. That is 2 loads per thread, 512 for the block, and both tiles are full.${m ? ' (FLOPs per global load dips here, until this phase’s multiply-adds run.)' : ''}`;
      else if (st.k === 'sync1') why = `<b>Barrier.</b> No thread may start multiplying until all 256 have finished loading, or it could read an element of As or Bs that its owner has not written yet. After <code>__syncthreads()</code>, shared memory holds two complete 16 × 16 tiles.`;
      else if (st.k === 'comp') why = `<b>Phase m = ${m}, compute.</b> The inner loop runs 16 times: c_output += As[${ty}][k] × Bs[k][${tx_}], reading row ${ty} of As and column ${tx_} of Bs from fast shared memory. 16 multiplies and 16 adds = 32 FLOPs for this phase’s 2 global loads: <b>16 FLOPs per global memory read</b>. Each element in shared memory is read by 16 different threads: row ${ty} of As by the 16 threads of tile-row ${ty} (green row in C), column ${tx_} of Bs by the 16 threads of tile-column ${tx_} (green column).`;
      else if (st.k === 'sync2') why = `<b>Barrier again.</b> No thread may overwrite As or Bs with the next tiles until all 256 have finished reading these. ${m < P - 1 ? `Next: phase m = ${m + 1}, phase ${m + 2} of ${P}.` : `That was phase ${P} of ${P}, the last.`}`;
      else why = `<b>Done.</b> C[${row}][${col}] = c_output, the sum of all ${N} products, is written to global memory once. This thread made ${2 * P} global loads for ${2 * N} FLOPs; in the naive kernel the same element costs ${2 * N} loads. Every element of A and B is now loaded N / 16 = ${P} times instead of N = ${N} times.`;
      f.setWhy(why);
    }
    function paintFly() {
      if (!G) return;
      const on = G.fly && flyT < 1;
      [['a', G.ghA], ['b', G.ghB]].forEach(([k, gh]) => {
        if (!on) { gh.setAttribute('opacity', '0'); return; }
        const [x0, y0, w0, h0, x1, y1, w1, h1] = G.fly[k];
        const u = flyT, e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
        const L = (a, b) => a + (b - a) * e;
        gh.setAttribute('x', r1(L(x0, x1))); gh.setAttribute('y', r1(L(y0, y1)));
        gh.setAttribute('width', r1(L(w0, w1))); gh.setAttribute('height', r1(L(h0, h1)));
        gh.setAttribute('opacity', '1');
      });
    }
    svg.addEventListener('keydown', (e) => {
      const d = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key];
      if (d) { e.preventDefault(); pick(row + d[0], col + d[1]); }
    });
    makeSteps();
    makeStepper(si);
    onWidth(wrap, (w) => build(w));
  }

  /* Fig: global loads for the whole matmul, both kernels */
  function kTotals(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Every load, for the whole multiplication',
      hint: 'drag N',
      wide: true,
      caption: 'Totals for multiplying two N × N matrices of 4-byte floats. Both kernels do the same arithmetic, N³ multiply-adds or 2 × N³ FLOPs. The naive kernel issues 2 loads from global memory per multiply-add; the tiled kernel issues 2 per 16, and makes its other reads from shared memory. Both groups are drawn on fixed logarithmic axes, where each tick is ten times the last, so the bars grow as N grows (doubling N multiplies every count by 8), while the gap between naive and tiled, a factor of 16, stays the same length. The times assume, as a worst case, that every global load goes all the way to GPU RAM; in practice the L1 and L2 caches catch many of the naive kernel’s repeated loads, so it does better than that, though still far from peak. The shaded band marks microseconds, the time scale of launching a kernel at all.',
    });
    let N = 4096;
    GG.ui.slider(f.controls, { label: 'N', min: 16, max: 16384, step: 16, log: true, value: N, format: (v) => fmt.int(v), onInput: (v) => { N = v; draw(); } });
    const stA = GG.ui.stat(f.readouts, { label: 'FLOPs, either kernel', value: '', tone: 'core' });
    const stN = GG.ui.stat(f.readouts, { label: 'global loads · naive', value: '', tone: 'memory' });
    const stT = GG.ui.stat(f.readouts, { label: 'global loads · tiled', value: '', tone: 'memory' });
    const stX = GG.ui.stat(f.readouts, { label: 'fewer global loads', value: '', tone: 'memory' });
    const wrap = el('div', { class: 'dsb-w' });
    f.stage.append(wrap);
    const svg = S('svg', { class: 'dsb-svg', role: 'img', 'aria-label': 'Two groups of horizontal bars on logarithmic axes. First: FLOPs of either kernel, global loads of the naive kernel (as many as its FLOPs), global loads of the tiled kernel (one sixteenth as many), and shared-memory loads of the tiled kernel. Second: the time to move each kernel’s loads at H100 memory bandwidth and the time for the arithmetic, with a band marking microseconds.' }, wrap);
    let W = 0;
    const CNT = [2, 14], TIM = [-10, 2]; // log10 ranges of the two axes
    const cntLab = (e) => ({ 2: '100', 4: '10 k', 6: '1 M', 8: '100 M', 10: '10 B', 12: '1 T', 14: '100 T' }[e] || '');
    const timLab = (e) => ({ '-9': '1 ns', '-6': '1 µs', '-3': '1 ms', 0: '1 s', 2: '100 s' }[e] || '');
    function draw(w) {
      if (w) W = w;
      if (!W) return;
      clear(svg);
      const n3 = N * N * N;
      const rows = [
        { lab: 'FLOPs · either kernel', v: 2 * n3, col: 'core', unit: 'FLOPs' },
        { lab: 'global loads · naive', v: 2 * n3, col: 'memory', unit: 'loads', bytes: true },
        { lab: 'global loads · tiled', v: (2 * n3) / 16, col: 'memory', unit: 'loads', bytes: true },
        { lab: 'shared-memory loads · tiled', v: 2 * n3, col: 'memory', unit: 'loads', faint: true },
      ];
      const nar = W < 600;
      const LW = nar ? 0 : 200;
      const bw = W - LW - 2;
      const rh = nar ? 50 : 40;
      const bwRAM = 3.35e12, fp32 = 66.9e12;
      const tN = (8 * n3) / bwRAM, tT = (0.5 * n3) / bwRAM, tC = (2 * n3) / fp32;
      const trows = [
        { lab: 'moving naive’s loads', v: tN, col: 'memory' },
        { lab: 'moving tiled’s loads', v: tT, col: 'memory' },
        { lab: 'the arithmetic (FP32)', v: tC, col: 'core' },
      ];
      const axH = 24, head = 26;
      const g = S('g', null, svg);
      const pos = (v, R) => LW + clamp((Math.log10(Math.max(v, 1e-30)) - R[0]) / (R[1] - R[0]), 0, 1) * bw;
      const axis = (y, R, labf, y0) => {
        line(g, LW, y, LW + bw, y, { stroke: 'var(--line-2)' });
        for (let e = R[0]; e <= R[1]; e++) {
          const x = pos(Math.pow(10, e), R);
          const lb = labf(e);
          line(g, x, y0, x, y + (lb ? 5 : 3), { stroke: lb ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)', sw: 1 });
          if (lb && (!nar || e % (R === CNT ? 4 : 3) === (R === CNT ? 2 : 0) || e === R[1])) tx(g, x, y + 16, lb, { fill: 'var(--ink-3)', size: 10, anchor: e === R[1] ? 'end' : e === R[0] ? 'start' : 'middle' });
        }
      };
      const bar = (r, y, R, label) => {
        tx(g, 0, nar ? y - 4 : y + 15, r.lab, { fill: 'var(--ink)', size: 11 });
        rect(g, LW, y, bw, 22, { rx: 5, fill: 'rgba(255,255,255,0.03)', stroke: 'var(--line)' });
        const ww = Math.max(2, pos(r.v, R) - LW);
        rect(g, LW, y, ww, 22, { rx: 5, fill: r.faint ? 'none' : `var(--${r.col})`, stroke: `var(--${r.col})`, dash: r.faint ? '4 3' : null, opacity: r.faint ? 1 : 0.8 });
        const inside = ww > label.length * 6.6 + 16;
        tx(g, inside ? LW + 8 : LW + ww + 8, y + 15, label, { fill: inside && !r.faint ? '#0b0c12' : 'var(--ink-2)', size: 10.5, weight: inside && !r.faint ? 600 : null, anchor: null });
      };
      // group 1: counts
      const g1top = 0;
      rows.forEach((r, i) => bar(r, g1top + i * rh + (nar ? 16 : 4), CNT, `${words(r.v)} ${r.unit}${r.bytes ? ` · ${fmt.si(4 * r.v, 'B', 1)}` : ''}${r.faint ? ' · on chip' : ''}`));
      const ax1 = g1top + rows.length * rh + 4;
      axis(ax1, CNT, cntLab, g1top);
      // group 2: times
      const y2 = ax1 + axH + 10;
      tx(g, 0, y2 + 14, nar ? 'time at H100 peak, log scale' : 'time at H100 peak (3.35 TB/s for bytes, 66.9 TFLOPS for FLOPs), log scale', { fill: 'var(--ink-2)', size: 10.5, weight: 600 });
      const t0 = y2 + head;
      const bandY0 = t0 - 2, bandY1 = t0 + trows.length * rh + 4;
      const bx0 = pos(1e-6, TIM), bx1 = pos(1e-5, TIM);
      rect(g, bx0, bandY0, bx1 - bx0, bandY1 - bandY0, { rx: 0, fill: 'rgba(184,164,255,0.10)' });
      tx(g, bx1 + 4, bandY1 - 4, nar ? 'µs: launch scale' : 'microseconds: the time scale of a kernel launch', { fill: 'var(--host)', size: 10 });
      trows.forEach((r, i) => bar(r, t0 + i * rh + (nar ? 16 : 4), TIM, msStr(r.v)));
      const ax2 = t0 + trows.length * rh + 4;
      axis(ax2, TIM, timLab, t0);
      svg.setAttribute('viewBox', `0 0 ${W} ${r1(ax2 + axH)}`);
      stA.set(words(2 * n3));
      stN.set(words(2 * n3));
      stT.set(words(n3 / 8));
      stX.set(fmt.sig((2 * n3) / (n3 / 8), 3) + ' ×');
      f.setWhy(`For N = ${fmt.int(N)}, both kernels do 2 × N³ = <b>${words(2 * n3)} FLOPs</b>. The naive kernel issues as many global loads, ${fmt.si(8 * n3, 'B', 1)} of floats; the tiled kernel issues <b>16 times fewer</b>, ${words(n3 / 8)} (${fmt.si(0.5 * n3, 'B', 1)}). If every one of them went to GPU RAM at an H100’s 3.35 TB/s, just moving the bytes would take <b>${msStr(tN)}</b> for the naive kernel and <b>${msStr(tT)}</b> for the tiled one, while the arithmetic needs only ${msStr(tC)} at the 66.9 TFLOPS of its CUDA Cores.${tN < 1e-6 ? ' At sizes this small, all of these sit left of the shaded band: the microseconds it takes just to launch a kernel outweigh them.' : ''}`);
    }
    onWidth(wrap, draw);
  }

  /* Fig: both kernels on the H100 roofline */
  function kRoof(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Why one FLOP per load leaves the GPU idle',
      hint: 'pick a kernel · hover the chart',
      wide: true,
      caption: 'The roofline model for an H100’s FP32 CUDA Cores (66.9 TFLOPS) and its 3.35 TB/s of GPU RAM bandwidth, with the BF16 Tensor Core roof (989 TFLOPS) drawn faintly above. Each kernel sits at its arithmetic intensity, counting every global load as 4 bytes from GPU RAM (the same worst case as Fig. 5): the naive kernel does 2 FLOPs per 8 bytes, 0.25 FLOPs/byte; the tiled kernel 32 FLOPs per 8 bytes, 4 FLOPs/byte. Both sit left of the ridge point, so memory, not arithmetic, sets their speed.',
    });
    const RF = GG.components.roofline;
    const rf = RF(f, {
      system: 'h100-fp32', systems: ['h100-fp32'], compare: ['h100-bf16'],
      kernels: [{ id: 'naive', label: 'naive', ai: 0.25, color: 'memory' }, { id: 'tiled', label: 'tiled', ai: 4, color: 'memory' }],
      selected: 'tiled', draggable: false, shade: 'memory', showReadouts: true,
      why: (S0) => {
        if (!S0 || !S0.kernel) return null;
        const naive = S0.kernel.id === 'naive';
        const att = S0.attainable, peak = S0.system.flops;
        return `${naive ? 'The <b>naive</b> kernel' : 'The <b>tiled</b> kernel'} does ${naive ? '2 FLOPs per 2 loads of 4 bytes' : '32 FLOPs per 2 loads of 4 bytes'}: <b>${RF.fmt.ai(S0.ai)} FLOPs/byte</b>. On the memory roof that allows at most 3.35 TB/s × ${RF.fmt.ai(S0.ai)} = <b>${RF.fmt.perf(att)}</b>, ${fmt.pct(att / peak, 1)} of the ${RF.fmt.perf(peak)} the CUDA Cores could deliver. Reaching the compute roof takes ${RF.fmt.ridge(S0.ridge)} FLOPs/byte${naive ? '. The tiled kernel gets 16 times closer.' : ', so even the tiled kernel is memory-bound. The faint Tensor Core roof, 989 TFLOPS, would take Tensor Core instructions and about 295 FLOPs per byte.'}`;
      },
    });
    GG.ui.seg(f.controls, {
      label: 'Kernel', value: 'tiled',
      options: [{ value: 'naive', label: 'naive: 1 FLOP / load' }, { value: 'tiled', label: 'tiled: 16 FLOPs / load' }],
      onChange: (v) => rf.select(v),
    });
    return rf;
  }

  GG.entry('kernel', {
    render(body, ctx) {
      const s = ctx.html(body, `
<p>A <strong>kernel</strong> is the unit of ${T('cuda-programming-model', 'CUDA')} code that programmers typically write and compose, akin to a procedure or function in languages targeting CPUs. You write it as one function, marked <code>__global__</code> in ${T('cuda-c', 'CUDA C++')}, and the GPU runs it.</p>
<div data-slot="map" class="wide"></div>
<h3>Called once, executed many times</h3>
<p>Unlike procedures, a kernel is called (“launched”) once and returns once, but is executed many times, once each by a number of ${T('thread', 'threads')}. A CPU procedure runs its body once per call. A kernel’s body is written from the point of view of a single thread, and a launch of the matmul kernel below on a 4,096 × 4,096 matrix runs that body about 16.8 million times, once per element of the output.</p>
<p>These executions are generally <strong>concurrent</strong>: their execution order is non-deterministic, so no thread may assume that another has already run, or has not. They are also <strong>parallel</strong>: they occur simultaneously on different execution units, many ${T('cuda-core', 'CUDA Cores')} on many ${T('streaming-multiprocessor', 'SMs')} at once. Watch both in Fig. 2, then launch it again.</p>
<div data-slot="launch" class="wide"></div>
${GG.noteHTML('beyond', `<p><b>“Returns once”, as the host sees it.</b> A launch is asynchronous: the call <code>mm&lt;&lt;&lt;grid, block&gt;&gt;&gt;(…)</code> queues the kernel on the GPU and hands control back to the CPU straight away. The kernel finishes, once, when its last thread is done, and the host waits for that with a call such as <code>cudaDeviceSynchronize()</code> or <code>cudaStreamSynchronize()</code>, or with a blocking <code>cudaMemcpy</code> of the results, which waits for the kernel. Work queued behind it in the same stream also waits for it, but on the GPU, without blocking the host. Here is a typical launch of the naive kernel:</p><div data-slot="lcode"></div>`)}
<h3>A kernel’s threads: the grid</h3>
<p>The collection of all threads executing a kernel is organized as a <strong>kernel grid</strong>, aka a ${T('thread-block-grid', 'thread block grid')}, the highest level of the CUDA programming model’s ${T('thread-hierarchy', 'thread hierarchy')}: a grid of ${T('thread-block', 'thread blocks')}, each a block of threads. A kernel grid executes across multiple ${T('streaming-multiprocessor', 'Streaming Multiprocessors (SMs)')} and so operates at the scale of the entire GPU. The matching level of the ${T('memory-hierarchy', 'memory hierarchy')} is the ${T('global-memory', 'global memory')}: memory that every thread of the grid, on every SM, can read and write. That is the bottom row of Fig. 1.</p>
<h3>Pointers in, nothing out</h3>
<p>In ${T('cuda-c', 'CUDA C++')}, kernels are passed pointers to ${T('global-memory', 'global memory')} on the device when they are invoked by the host and return nothing: they just mutate memory. Their return type is always <code>void</code>. Results come back by writing them through those pointers, which is why Fig. 2 ends with C filled in rather than with a value handed back.</p>
<div data-slot="cmp"></div>
${GG.noteHTML('aside', '<p>Not to be confused with the operating system’s kernel, the privileged core of the OS that, for example, the ' + T('nvidia-ko', 'nvidia.ko') + ' driver module is loaded into. A CUDA kernel is ordinary user code that runs on the GPU.</p>')}
<h3>Matrix multiplication, two ways</h3>
<p>To give a flavor for CUDA kernel programming, let’s walk through two implementations of the “hello world” of CUDA kernels: matrix multiplication of two square matrices, <code>A</code> and <code>B</code>. Each element of the product C = A × B is a dot product: C[row][col] is the sum over k of A[row][k] × B[k][col]. For N × N matrices that is N multiply-adds per element and N³ in all, or 2 × N³ floating point operations (FLOPs), counting each multiply and each add as one. The two implementations will differ in how they map the textbook matrix multiplication algorithm onto the ${T('thread-hierarchy', 'thread hierarchy')} and ${T('memory-hierarchy', 'memory hierarchy')}.</p>
<h3>The naive kernel: one thread, one element</h3>
<p>In the simplest implementation, inspired by the first matmul kernel in <a href="https://www.amazon.com/dp/0323912311">Programming Massively Parallel Processors</a> (4th edition, Figure 3.11), each ${T('thread', 'thread')} does all of the work to compute one element of the output matrix: loading in turn each element of a particular <code>row</code> of <code>A</code> and a particular <code>col</code>umn of <code>B</code> into ${T('registers', 'registers')}, multiplying the paired elements, summing the results, and placing the sum back in ${T('global-memory', 'global memory')}.</p>
<div data-slot="ncode" class="wide"></div>
<p>Pick any element of C in Fig. 3 and watch its thread work.</p>
<div data-slot="naive" class="wide"></div>
<p>In this kernel, each thread does one floating point operation (FLOP) per read from ${T('global-memory', 'global memory')}: a multiply and an add; a load from <code>A</code> and a load from <code>B</code>. You’ll never <a href="https://modal.com/blog/gpu-utilization-guide">use the whole GPU</a> that way, since the ${T('arithmetic-bandwidth', 'arithmetic bandwidth')} of the ${T('cuda-core', 'CUDA Cores')} in FLOPs/s is much higher than the ${T('memory-bandwidth', 'memory bandwidth')} between the ${T('gpu-ram', 'GPU RAM')} and the ${T('streaming-multiprocessor', 'SMs')}. On an H100 the CUDA Cores can do 66.9 trillion FLOPs per second, while GPU RAM delivers 3.35 trillion bytes per second, about one float (4 bytes) for every 80 FLOPs. A kernel that needs a fresh float for every FLOP leaves the cores waiting.</p>
${GG.noteHTML('beyond', '<p><b>One instruction, two FLOPs.</b> The compiler turns <code>sum += A[…] * B[…]</code> into a single fused multiply-add instruction (<code>FFMA</code> in SASS), which computes a × b + c in one step. FLOP counts still count it as two operations, a multiply and an add, which is how the glossary counts here too.</p>')}
<h3>The tiled kernel: share loads through shared memory</h3>
<p>We can increase <a data-term="arithmetic-intensity">the ratio of FLOPs to memory operations</a> by more carefully mapping the work in this algorithm onto the ${T('thread-hierarchy', 'thread hierarchy')} and ${T('memory-hierarchy', 'memory hierarchy')}. In the “tiled” matmul kernel below, inspired by that in Figure 5.9 of the 4th edition of <a href="https://www.amazon.com/dp/0323912311">Programming Massively Parallel Processors</a>, we map the loading of submatrices of <code>A</code> and <code>B</code> and the computation of submatrices of <code>C</code> onto ${T('shared-memory', 'shared memory')} and ${T('thread-block', 'thread blocks')} respectively.</p>
<p>The idea: the 256 threads of a 16 × 16 block compute a 16 × 16 tile of C, and all 16 threads in one row of that tile need the same row of A (all 16 in a column, the same column of B). So instead of each thread fetching everything for itself, the block fetches each needed tile of A and B once into shared memory, on chip in the SM’s ${T('l1-data-cache', 'L1 data cache')}, and every thread then reads from there.</p>
<div data-slot="tcode" class="wide"></div>
<p>Step through Fig. 4. One phase is one iteration of the outer loop over <code>m</code>; the two <code>__syncthreads()</code> barriers keep the block’s threads from reading tiles before they are complete, or overwriting them while others still need them.</p>
<div data-slot="tiled" class="wide"></div>
<p>For each iteration of the outer loop, which loads two elements, a thread runs 16 iterations of the inner loop, which does a multiply and an add, for 16 FLOPs per global memory read: 32 FLOPs for 2 loads. The total work is the same as before; the global loads drop sixteenfold. Fig. 5 adds them up, and Fig. 6 shows what that does on the ${T('roofline-model', 'roofline model')}.</p>
${GG.noteHTML('warn', '<p><b>Assumptions baked into the tiled kernel.</b> It has no <code>row &lt; N &amp;&amp; col &lt; N</code> guard and loops <code>N/TILE_WIDTH</code> times, so as written it is only correct when N is a multiple of 16, launched with 16 × 16 blocks (<code>blockDim</code> must equal <code>TILE_WIDTH</code> in both directions) and an N / 16 × N / 16 grid. Its block is 256 threads, 8 warps, and its two tiles take 2 × 16 × 16 × 4 bytes = 2 KiB of shared memory.</p>')}
<div data-slot="tot" class="wide"></div>
<div data-slot="roof" class="wide"></div>
<h3>Still far from fast</h3>
<p>This is still far from a fully optimized kernel for matrix multiplication. <a href="https://siboehm.com/articles/22/CUDA-MMM">This worklog by Si Boehm of Anthropic</a> walks through optimizations that further increase the FLOP to memory read ratio and map the algorithm even more tightly onto the hardware. Our kernels resemble his Kernel 1 and Kernel 3; the worklog covers ten kernels.</p>
${GG.noteHTML('check', `<p><b>Which of Boehm’s kernels, exactly?</b> The glossary’s line holds for the algorithms, with one wrinkle in memory access. Boehm’s Kernel 1 gives <code>threadIdx.x</code> to the <em>row</em> (<code>x = blockIdx.x * blockDim.x + threadIdx.x</code>, then <code>A[x * K + i]</code> and <code>C[x * N + y]</code>), so neighbouring threads of a warp read and write memory far apart. Our naive kernel gives <code>threadIdx.x</code> to the <em>column</em>, so neighbouring threads read neighbouring elements of B and write neighbouring elements of C: that is the fix his Kernel 2, “global memory coalescing”, introduces. So ours is his Kernel 1’s algorithm with Kernel 2’s access pattern (see ${T('memory-coalescing', 'memory coalescing')}). And the count: his kernels are numbered 1 to 10, but the article skips 7 and 8 (“They eliminate the conflicts but were overall still slower, so I won’t cover them here”), so it walks through eight.</p>`)}
<p>That worklog and this article only consider writing kernels for execution on the ${T('cuda-core', 'CUDA Cores')}. The absolute fastest matrix multiplication kernels run instead on ${T('tensor-core', 'Tensor Cores')}, which have a much higher ${T('arithmetic-bandwidth', 'arithmetic bandwidth')}.</p>
<div data-slot="nums"></div>
<div data-slot="read"></div>`);

      guard(s.map, 'Programming model map', () => modelMapFigure(s.map, ctx, {
        title: 'A kernel launch is a grid',
        highlight: ['grid', 'global'],
        caption: `A single kernel launch corresponds to a thread block grid in the CUDA programming model (bottom left). The grid runs across every SM of the GPU, and its level of the memory hierarchy is global memory, stored in GPU RAM (bottom right). ${MAP_CREDIT} Hover or tap any level to light up its counterpart.`,
      }));
      guard(s.launch, 'Kernel launch', () => kLaunch(s.launch, ctx));
      const lslot = body.querySelector('[data-slot="lcode"]');
      if (lslot) guard(lslot, 'Launch code', () => ctx.code(lslot, { lang: 'cuda', code: MM_LAUNCH, caption: 'beyond the glossary: launching the naive kernel from the host' }));
      s.cmp.innerHTML = GG.tableHTML(`<thead><tr><th></th><th>A procedure on a CPU</th><th>A CUDA kernel</th></tr></thead><tbody class="dsb-cmp">
<tr><td>Started by</td><td>a call, from code on the same thread</td><td>a launch, usually from the host (with dynamic parallelism, a kernel can also launch one)</td></tr>
<tr><td>Calls and returns</td><td>called once, returns once</td><td>launched once, returns once</td></tr>
<tr><td>Runs its body</td><td>once</td><td>once per thread: N × N times for the matmuls below</td></tr>
<tr><td>Order of those runs</td><td>one run, nothing to order</td><td>concurrent (order not determined) and parallel (simultaneous)</td></tr>
<tr><td>Arguments</td><td>values, and pointers into the process’s memory</td><td>values, and pointers to ${T('global-memory', 'global memory')} on the device</td></tr>
<tr><td>Result</td><td>can return a value</td><td>returns nothing (<code>void</code>): it writes through its pointers</td></tr></tbody>`);
      let nCode = null, tCode = null;
      guard(s.ncode, 'Naive kernel code', () => {
        nCode = ctx.code(s.ncode, {
          lang: 'cuda', code: MM_NAIVE, wide: false, caption: 'the naive kernel, verbatim from the glossary',
          notes: {
            1: '<code>__global__</code> marks a kernel: called from the host, run on the device. It returns <code>void</code>; <code>A</code>, <code>B</code> and <code>C</code> are pointers to N × N floats in global memory, and <code>N</code> is passed by value.',
            2: 'This thread’s row of C: which block it is in (<code>blockIdx.y</code>) times the block’s height (<code>blockDim.y</code>), plus its position inside the block (<code>threadIdx.y</code>).',
            3: 'The same in x gives its column. Every thread gets a different (row, col) pair, so together they cover all of C.',
            5: 'The guard. Blocks come in whole numbers, so when N is not a multiple of the block size some threads land outside C; they skip all the work.',
            6: '<code>sum</code> is a local variable: it lives in a register of this thread.',
            7: 'The loop over the inner dimension, N iterations.',
            8: 'Two loads from global memory (A and B are row-major, so element (i, j) is at index i × N + j), one multiply and one add: 1 FLOP per load.',
            10: 'One store to global memory, the only result the kernel produces.',
          },
        });
      });
      guard(s.naive, 'Naive kernel figure', () => kNaive(s.naive, ctx, nCode));
      guard(s.tcode, 'Tiled kernel code', () => {
        tCode = ctx.code(s.tcode, {
          lang: 'cuda', code: MM_TILED, caption: 'the tiled kernel, verbatim from the glossary',
          notes: {
            1: '<code>TILE_WIDTH</code> is both the tile size and the block size: 16 × 16 = 256 threads per block.',
            6: '<code>__shared__</code> puts <code>As</code> in shared memory: one copy per block, in the SM’s L1 data cache, visible to all 256 of its threads. 16 × 16 floats = 1 KiB.',
            7: 'A second 1 KiB tile, for B.',
            9: 'The same row and column as in the naive kernel, with <code>TILE_WIDTH</code> as the block size.',
            12: '<code>c_output</code> accumulates in a register, as <code>sum</code> did.',
            13: 'One iteration per phase: N / 16 tiles along the inner dimension.',
            16: 'Each thread copies one element of A’s tile: row <code>row</code>, column m × 16 + <code>threadIdx.x</code>. Together the 256 threads copy the whole 16 × 16 tile.',
            17: 'And one element of B’s tile: row m × 16 + <code>threadIdx.y</code>, column <code>col</code>.',
            21: 'A barrier: every thread of the block waits here until all 256 have arrived, so both tiles are complete before anyone reads them.',
            25: 'The inner loop: 16 iterations over the tile.',
            26: 'One multiply and one add per iteration, both operands from shared memory: 32 FLOPs per phase for 2 global loads, 16 FLOPs per global read.',
            30: 'A second barrier, so no thread starts overwriting <code>As</code> and <code>Bs</code> with the next tiles while others are still reading them.',
            32: 'One store per thread, after all phases.',
          },
        });
      });
      guard(s.tiled, 'Tiled kernel figure', () => kTiled(s.tiled, ctx, tCode));
      guard(s.tot, 'Load totals', () => kTotals(s.tot, ctx));
      guard(s.roof, 'Roofline', () => kRoof(s.roof, ctx));
      ctx.numbers(s.nums, [
        { value: '1', label: 'FLOP per global load, naive kernel', tone: 'memory' },
        { value: '16', label: 'FLOPs per global load, tiled kernel (TILE_WIDTH = 16)', tone: 'core' },
        { value: '66.9', label: 'TFLOPS, FP32 on an H100’s CUDA Cores', tone: 'core' },
        { value: '989', label: 'TFLOPS, dense BF16 on its Tensor Cores', tone: 'core' },
      ]);
      ctx.reading(s.read, [
        { href: 'https://www.amazon.com/dp/0323912311', label: 'Hwu, Kirk and El Hajj: Programming Massively Parallel Processors, 4th edition', note: 'Figure 3.11 (the naive kernel) and Figure 5.9 (the tiled kernel)' },
        { href: 'https://siboehm.com/articles/22/CUDA-MMM', label: 'Si Boehm: How to Optimize a CUDA Matmul Kernel for cuBLAS-like Performance', note: 'kernels numbered 1 to 10 (8 written up); ours resemble Kernel 1 and Kernel 3' },
        { href: 'https://modal.com/blog/gpu-utilization-guide', label: 'Modal: the GPU utilization guide', note: 'what it takes to use the whole GPU' },
        { href: REF_CUDA_REFRESHER, label: 'NVIDIA: CUDA Refresher: The CUDA Programming Model', note: 'source of the thread / block / grid diagram' },
        { href: REF_CPG_MODEL, label: 'NVIDIA: CUDA C++ Programming Guide, Programming Model', note: 'kernels, launches and the thread hierarchy in CUDA C++' },
      ]);
    },
  });
})();
