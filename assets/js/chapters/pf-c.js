/* chapters/pf-c — Performance, part C.
   Entries: pipe-utilization, peak-rate, issue-efficiency, streaming-multiprocessor-utilization,
   warp-divergence, scoreboard-stall.
   CSS prefix: pfc-. Figures are pixel-true SVG (viewBox width = stage width), rebuilt whenever the
   stage width changes, so labels stay legible from 390 px phones to 1440 px desktops. */
(function () {
  'use strict';
  if (!window.GG) return;

  GG.css(`
  .pfc-svg { display: block; width: 100%; height: auto; touch-action: manipulation; -webkit-user-select: none; user-select: none; }
  .pfc-svg text { font-family: var(--font-mono); }
  .pfc-eq { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 10px 16px; padding: 18px 16px;
    border: 1px solid var(--line); border-radius: 12px; background: var(--surface); font-family: var(--font-mono); font-size: 14.5px; color: var(--ink); text-align: center; }
  .pfc-eq-l { font-weight: 600; }
  .pfc-eq-op { color: var(--ink-3); font-size: 18px; }
  .pfc-frac { display: inline-flex; flex-direction: column; align-items: stretch; }
  .pfc-frac > span { padding: 4px 10px; }
  .pfc-frac > span:first-child { border-bottom: 1.5px solid var(--ink-2); color: var(--core); }
  .pfc-frac > span:last-child { color: var(--ink-2); }
  .pfc-eq small { display: block; width: 100%; font-family: var(--font-body); font-size: 12.5px; color: var(--ink-3); }
  .pfc-legend { display: flex; flex-wrap: wrap; gap: 4px 16px; margin: 0 0 12px; font: 500 11.5px/1.5 var(--font-mono); color: var(--ink-2); }
  .pfc-legend span { display: inline-flex; align-items: center; gap: 7px; }
  .pfc-legend i { flex: none; display: inline-block; width: 11px; height: 11px; border-radius: 3px; background: var(--sw); }
  .pfc-legend i.pfc-lg-outline { background: transparent; border: 1.5px solid var(--sw); }
  .pfc-legend i.pfc-lg-dash { background: transparent; border: 1.5px dashed var(--sw); }
  .pfc-legend i.pfc-lg-dot { width: 9px; height: 9px; border-radius: 50%; }
  .pfc-legend i.pfc-lg-hatch { background: repeating-linear-gradient(45deg, var(--sw) 0 2px, transparent 2px 5px); border: 1px solid var(--sw); }
  .pfc-legend i.pfc-lg-strike { background: none; border-radius: 0; height: 0; width: 16px; border-top: 2px solid var(--sw); }
  .pfc-codeline { margin: 0; padding: 9px 12px; border-radius: 9px; background: #090a10; border: 1px solid var(--line);
    font: 500 12.5px/1.6 var(--font-mono); color: var(--ink); white-space: pre; overflow-x: auto; scrollbar-width: thin; }
  .pfc-codeline .c { color: #6c7290; }
  .pfc-presets { display: flex; flex-wrap: wrap; gap: 6px; }
  .pfc-presets .btn { height: 28px; font-size: 11.5px; padding: 0 10px; }
  .pfc-presets .btn[aria-pressed="true"] { border-color: var(--ink-2); color: var(--ink); background: var(--surface-3); }
  .pfc-mixbox { display: flex; flex-wrap: wrap; gap: 10px 16px; width: 100%; }
  .pfc-mixbox[hidden] { display: none !important; }
  .pfc-mixbox .slider { flex: 1 1 150px; min-width: 130px; }
  .entry-body :not(pre) > code.pfc-brk, .fig :not(pre) > code.pfc-brk { white-space: normal; overflow-wrap: anywhere; word-break: break-all; }
  .pfc-wd-bare, .pfc-wd-note { display: none; }
  .pfc-wd-note { margin: -6px 0 12px; font: 500 11.5px/1.5 var(--font-mono); color: #6c7290; }
  @media (max-width: 640px) {
    .pfc-wd-full { display: none !important; }
    .pfc-wd-bare { display: block; margin-bottom: 12px; }
    .pfc-wd-bare pre { font-size: 11px; }
    .pfc-wd-bare .ln::before { width: 2em; padding-right: 0.8em; }
    .pfc-wd-note { display: block; }
  }
  .pfc-sub { font: 500 10.5px var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-3); }

  /* metric-name builder */
  .pfc-metric { font: 600 clamp(12.5px, 1.75vw, 19px)/1.5 var(--font-mono); color: var(--ink); padding: 16px 14px; border-radius: 12px;
    background: #090a10; border: 1px solid var(--line); overflow-wrap: anywhere; word-break: break-all; text-align: center; }
  .pfc-metric span { border-radius: 4px; padding: 1px 1px; transition: background 0.15s, color 0.15s, box-shadow 0.15s; cursor: default; }
  .pfc-metric span.on { background: var(--accent-a); box-shadow: 0 0 0 1px var(--accent); }
  .pfc-metric .p-unit { color: var(--core); }
  .pfc-metric .p-sep { color: var(--ink-3); }
  .pfc-metric .p-ctr { color: var(--memory); }
  .pfc-metric .p-pipe { color: var(--special); }
  .pfc-metric .p-roll { color: var(--control); }
  .pfc-metric .p-sub { color: var(--host); }
  .pfc-parts { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 8px; margin-top: 12px; }
  .pfc-part { padding: 10px 12px; border-radius: 10px; border: 1px solid var(--line); background: rgba(8, 9, 14, 0.5); font-size: 13.5px; line-height: 1.5; color: var(--ink-2); transition: border-color 0.15s, background 0.15s; outline: none; }
  .pfc-part:focus-visible { box-shadow: 0 0 0 2px var(--accent); }
  .pfc-part.on { border-color: var(--accent); background: rgba(255, 138, 91, 0.06); }
  .pfc-part code { font-size: 12.5px; }
  .pfc-part > b:first-child { display: block; font: 600 12.5px var(--font-mono); margin-bottom: 3px; }
  .pfc-part em.pfc-tag { font-style: normal; font: 500 9.5px var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--host); margin-left: 6px; }
  .pfc-part[data-c="unit"] > b:first-child { color: var(--core); }
  .pfc-part[data-c="ctr"] > b:first-child { color: var(--memory); }
  .pfc-part[data-c="pipe"] > b:first-child { color: var(--special); }
  .pfc-part[data-c="roll"] > b:first-child { color: var(--control); }
  .pfc-part[data-c="sub"] > b:first-child { color: var(--host); }
  .pfc-part[data-c="sep"] > b:first-child { color: var(--ink-3); }

  /* control-code decoder */
  .pfc-ccin { width: min(100%, 300px); height: 34px; border-radius: 8px; border: 1px solid var(--line-2); background: var(--bg-2); color: var(--ink);
    font: 600 14px var(--font-mono); padding: 0 10px; letter-spacing: 0.02em; }
  .pfc-ccin[aria-invalid="true"] { border-color: var(--danger); }
  .pfc-ccerr { font: 500 12.5px var(--font-mono); color: var(--danger); min-height: 1.3em; }
  .pfc-fields { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 8px; margin-top: 12px; }
  .pfc-field { padding: 10px 12px; border-radius: 10px; border: 1px solid var(--line); background: rgba(8, 9, 14, 0.5); font-size: 13.5px; line-height: 1.5; color: var(--ink-2); }
  .pfc-svg text, .pfc-field, .pfc-ccbig, .pfc-ccin, .pfc-metric, .pfc-codeline { font-variant-ligatures: none; font-feature-settings: "liga" 0, "calt" 0; }
  .pfc-field > b { display: block; font: 600 12.5px var(--font-mono); color: var(--ink); margin-bottom: 4px; }
  .pfc-field > b small { font-weight: 500; color: var(--ink-3); font-size: 11px; margin-left: 6px; }
  .pfc-field em.pfc-tag { font-style: normal; font: 500 9.5px var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--host); margin-left: 6px; }
  .pfc-bits { display: flex; gap: 4px; margin: 4px 0 6px; flex-wrap: wrap; }
  .pfc-bits button { width: 34px; height: 34px; border-radius: 7px; border: 1.5px solid var(--line-2); background: var(--surface-2); color: var(--ink-3);
    font: 600 14px var(--font-mono); cursor: pointer; padding: 0; }
  .pfc-bits button[aria-pressed="true"] { border-color: var(--control); background: var(--control-a); color: var(--control); }
  .pfc-bits button:hover { border-color: var(--ink-3); }
  .pfc-bits.w button[aria-pressed="true"] { border-color: var(--memory); background: var(--memory-a); color: var(--memory); }
  .pfc-bits.y button[aria-pressed="true"] { border-color: var(--core); background: var(--core-a); color: var(--core); }
  .pfc-bits.r button[aria-pressed="true"] { border-color: var(--host); background: var(--host-a); color: var(--host); }
  .pfc-ccbig { font: 700 clamp(16px, 2.6vw, 24px)/1.3 var(--font-mono); color: var(--ink); letter-spacing: 0.02em; text-align: center; padding: 10px 0 4px; overflow-wrap: anywhere; }
  .pfc-ccbig .b { color: var(--control); } .pfc-ccbig .r { color: var(--host); } .pfc-ccbig .w { color: var(--memory); }
  .pfc-ccbig .y { color: var(--core); } .pfc-ccbig .s { color: var(--special); } .pfc-ccbig .x { color: var(--ink-3); }

  @media (max-width: 720px) {
    .pfc-eq { font-size: 12.5px; padding: 14px 10px; gap: 8px 10px; }
    .pfc-legend { font-size: 10.5px; gap: 3px 12px; }
    .pfc-codeline { font-size: 11px; }
    .pfc-metric { font-size: 12.5px; padding: 12px 10px; }
    .pfc-bits button { width: 30px; height: 30px; font-size: 13px; }
  }
  `);

  /* ───────────────────────── helpers ───────────────────────── */
  const r2 = (v) => Math.round(v * 100) / 100;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const fI = (n) => GG.fmt.int(n);
  const pct = (x, d) => (x * 100).toFixed(d == null ? 1 : d).replace(/\.0+$/, '') + '%';
  const plural = (n, one, many) => (n === 1 ? one : many || one + 's');
  const tw = (s, fs) => String(s).length * Math.max(fs, FSMIN) * 0.6; // JetBrains Mono advance ≈ 0.6 em
  const guard = (fn) => { try { fn(); } catch (e) { console.error('[pf-c] ' + ((e && e.stack) || e)); } };
  let FSMIN = 0;

  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }
  function G(p, a) { return GG.svg('g', a || null, p); }
  function R(p, x, y, w, h, st, a) {
    const o = { x: r2(x), y: r2(y), width: r2(Math.max(0, w)), height: r2(Math.max(0, h)) };
    if (a) Object.assign(o, a);
    const el = GG.svg('rect', o, p);
    if (st) el.setAttribute('style', st);
    return el;
  }
  function C(p, cx, cy, r, st) { const el = GG.svg('circle', { cx: r2(cx), cy: r2(cy), r: r2(r) }, p); el.setAttribute('style', st); return el; }
  function Ln(p, x1, y1, x2, y2, st) {
    const el = GG.svg('line', { x1: r2(x1), y1: r2(y1), x2: r2(x2), y2: r2(y2) }, p);
    el.setAttribute('style', st || 'stroke:var(--line-2);stroke-width:1');
    return el;
  }
  function Pa(p, d, st, a) {
    const el = GG.svg('path', Object.assign({ d }, a || {}), p);
    el.setAttribute('style', st || 'fill:none;stroke:var(--ink-3);stroke-width:1');
    return el;
  }
  function Tx(p, x, y, s, o) {
    o = o || {};
    const a = { x: r2(x), y: r2(y), 'font-size': Math.max(o.fs || 11, FSMIN) };
    if (o.anchor) a['text-anchor'] = o.anchor;
    const el = GG.svg('text', a, p);
    el.textContent = s;
    let st = 'fill:' + (o.fill || 'var(--ink-2)') + ';';
    if (o.weight) st += 'font-weight:' + o.weight + ';';
    if (o.font) st += 'font-family:' + o.font + ';';
    if (o.ls) st += 'letter-spacing:' + o.ls + ';';
    if (o.pe === false) st += 'pointer-events:none;';
    el.setAttribute('style', st);
    return el;
  }
  function arrowHead(p, x, y, ang, size, fill) {
    const s = size || 6;
    const bx = x - Math.cos(ang) * s, by = y - Math.sin(ang) * s;
    const px = Math.cos(ang + Math.PI / 2) * s * 0.55, py = Math.sin(ang + Math.PI / 2) * s * 0.55;
    return Pa(p, `M${r2(x)},${r2(y)}L${r2(bx + px)},${r2(by + py)}L${r2(bx - px)},${r2(by - py)}Z`, 'fill:' + fill + ';stroke:none');
  }
  /* hatch pattern, defined once per svg */
  function hatchDef(svg, id, col) {
    const defs = GG.svg('defs', null, svg);
    const pat = GG.svg('pattern', { id, width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    R(pat, 0, 0, 2, 6, 'fill:' + col);
    return 'url(#' + id + ')';
  }

  /* An SVG that rebuilds itself at the stage's content width. build(svg, w) returns the height. */
  function rsvg(stage, label, build, onDraw) {
    const svg = GG.svg('svg', { class: 'pfc-svg', role: 'img', 'aria-label': label }, stage);
    let w0 = 0;
    function draw(w) {
      w0 = w;
      clear(svg);
      let h = 40;
      FSMIN = w < 640 ? 9 : 0;
      try { h = build(svg, w) || 40; } catch (e) { console.error('[pf-c] figure build failed: ' + ((e && e.stack) || e)); }
      FSMIN = 0;
      h = Math.ceil(h);
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.setAttribute('width', String(w));
      svg.setAttribute('height', String(h));
      if (onDraw) { try { onDraw(); } catch (e) { /* the figure's state may not exist yet on a synchronous first draw */ } }
    }
    GG.resize(stage, (r) => { const w = Math.floor(r.width); if (w >= 60 && w !== w0) draw(w); });
    return { svg, redraw() { if (w0) draw(w0); }, get w() { return w0; } };
  }
  function mkFig(ctx, slot, opts) { const f = ctx.figure(slot, opts); if (slot.parentNode) slot.replaceWith(f.root); return f; }
  function mkCode(ctx, slot, opts) { const c = ctx.code(slot, opts); if (slot.parentNode) slot.replaceWith(c.el); return c; }
  function legend(parent, items) {
    const d = GG.el('div', { class: 'pfc-legend' });
    d.innerHTML = items.map((it) => `<span><i class="${it[2] ? 'pfc-lg-' + it[2] : ''}" style="--sw:${it[0]}"></i>${it[1]}</span>`).join('');
    parent.appendChild(d);
    return d;
  }
  const stat = (f, label, tone) => GG.ui.stat(f.readouts, { label, value: '—', tone });
  /* a row of preset buttons that behave like a radio group */
  function presets(parent, label, items, onPick) {
    const wrap = GG.el('div', { class: 'ctl' });
    if (label) wrap.append(GG.el('span', { class: 'ctl-lab', text: label }));
    const row = GG.el('div', { class: 'pfc-presets', role: 'group', 'aria-label': label || 'Presets' });
    const btns = items.map((it) => {
      const b = GG.ui.button(row, { label: it.label, title: it.title, onClick: () => { api.set(it.value); onPick(it.value); } });
      b.setAttribute('aria-pressed', 'false');
      return [it.value, b];
    });
    wrap.append(row);
    parent.appendChild(wrap);
    const api = { el: wrap, set(v) { btns.forEach(([bv, b]) => b.setAttribute('aria-pressed', String(bv === v))); } };
    return api;
  }
  const pctTone = (u) => (u >= 0.8 ? 'core' : u >= 0.4 ? 'control' : 'danger');

  /* ═════════════════════════ PIPE UTILIZATION ═════════════════════════ */

  /* Toy sub-partition pipes. Peak = warp instructions the pipe can accept per cycle (toy values, except fma). */
  const PIPES = [
    { k: 'fma', name: 'fma', unit: 'CUDA Cores', tone: 'core', peak: 1, peakLab: '1 per cycle', ex: 'FADD FMUL FFMA' },
    { k: 'tensor', name: 'tensor', unit: 'Tensor Core', tone: 'core', peak: 0.25, peakLab: '1 every 4 cycles', ex: 'HMMA' },
    { k: 'lsu', name: 'lsu', unit: 'load/store units', tone: 'special', peak: 0.25, peakLab: '1 every 4 cycles', ex: 'LDG STG LDS STS' },
    { k: 'adu', name: 'adu', unit: 'address divergence unit', tone: 'special', peak: 0.5, peakLab: '1 every 2 cycles', ex: 'branch targets, constant loads, barriers' },
    { k: 'cf', name: 'control flow', unit: 'branch unit', tone: 'control', peak: 0.5, peakLab: '1 every 2 cycles', ex: 'BRA EXIT' },
  ];
  const PU_PRESETS = {
    fp32: { label: 'FP32 math loop', mix: { fma: 75, tensor: 0, lsu: 10, adu: 5, cf: 10 } },
    gemm: { label: 'Tensor Core matmul', mix: { fma: 40, tensor: 24, lsu: 16, adu: 8, cf: 12 } },
    copy: { label: 'Memory copy', mix: { fma: 35, tensor: 0, lsu: 35, adu: 10, cf: 20 } },
    branchy: { label: 'Branch-heavy', mix: { fma: 40, tensor: 0, lsu: 10, adu: 10, cf: 40 } },
  };
  function puCalc(mix, ie) {
    const tot = PIPES.reduce((a, p) => a + (mix[p.k] || 0), 0);
    const share = {}, util = {};
    PIPES.forEach((p) => { share[p.k] = tot ? (mix[p.k] || 0) / tot : 0; });
    let limit = Infinity, lim = null;
    PIPES.forEach((p) => { if (share[p.k] > 0) { const l = p.peak / share[p.k]; if (l < limit - 1e-12) { limit = l; lim = p.k; } } });
    const ipc = tot ? Math.min(ie, limit) : 0;
    let top = null;
    PIPES.forEach((p) => { util[p.k] = (ipc * share[p.k]) / p.peak; if (!top || util[p.k] > util[top] + 1e-12) top = p.k; });
    return { tot, share, util, ipc, lim: tot && limit < ie - 1e-12 ? lim : null, top, limit };
  }
  const pipeBy = (k) => PIPES.find((p) => p.k === k);
  const fmtIpc = (x) => (Math.abs(x - Math.round(x)) < 0.005 ? String(Math.round(x)) : x.toFixed(2));

  GG.entry('pipe-utilization', {
    render(body, ctx) {
      const s = ctx.html(body, `
<p><strong>Pipe utilization</strong> measures how effectively a <a data-term="kernel">kernel</a> uses the execution resources <em>inside</em> each <a data-term="streaming-multiprocessor">Streaming Multiprocessor (SM)</a>. It is the finest-grained of three utilization numbers. <a href="https://modal.com/blog/gpu-utilization-guide">GPU kernel utilization</a> asks whether a kernel is running at all. <a data-term="streaming-multiprocessor-utilization">SM utilization</a> asks how many SMs it keeps busy. Pipe utilization asks how hard each busy SM works the units it has.</p>
${GG.noteHTML('intuition', '<p>Picture each SM as a workshop with a few specialised machines: one for arithmetic, one for matrix work, one for fetching and storing materials, one for deciding what to do next. Each machine has a top speed. Pipe utilization is each machine\'s speedometer reading as a percentage of its top speed, read only while the workshop has work in it, and averaged over every workshop that had work.</p>')}
<h3>An SM has several pipes</h3>
<p>Each SM contains multiple independent <em>execution pipes</em>, each optimised for a different type of instruction:</p>
<ul>
<li><a data-term="cuda-core">CUDA Cores</a> for general floating-point arithmetic;</li>
<li><a data-term="tensor-core">Tensor Cores</a> for tensor contractions, such as matrix multiplications;</li>
<li><a data-term="load-store-unit">load/store units</a> for memory access;</li>
<li>control flow units for branching.</li>
</ul>
<p>"Pipe" is short for <em>pipeline</em>. A pipeline works like an assembly line: an instruction needs several cycles to pass through it, but the next one can enter before the previous one leaves. So a pipe's capacity is measured by how often it can <em>accept</em> a new instruction. On every cycle a <a data-term="warp-scheduler">warp scheduler</a> may issue one instruction from one of its <a data-term="warp">warps</a>, and the instruction goes to the pipe for its type: an <code>FFMA</code> (fused multiply-add) to the CUDA Cores' <code>fma</code> pipe, an <code>LDG</code> (load from global memory) to the load/store pipe, a branch to the control flow unit. Which pipes get busy therefore depends on the kernel's <em>instruction mix</em>. Feed a toy SM sub-partition a few different mixes in Fig.&nbsp;1.</p>
<div data-slot="f1"></div>
<p>Two things show up straight away. First, a pipe's utilization is capped by the mix. The scheduler issues at most one instruction per cycle and the toy <code>fma</code> pipe can take one every cycle, so if 40% of the instructions are FFMAs, the <code>fma</code> pipe is at most 40% busy. Second, a pipe that accepts instructions less often than the kernel needs them saturates first and holds everything back. Choose <i>Memory copy</i>: the load/store pipe pins at 100% and caps the whole sub-partition, while the other pipes are held well below their peaks (<code>fma</code> at 25%). In the tubes, each ring is one cycle on which a pipe could accept an instruction; a filled ring is one it really got. The <code>lsu</code> tube has few rings, all filled. The <code>fma</code> tube has a ring every cycle, and most of them are hollow.</p>
<p>Issue efficiency moves with all of this. Lower the share of cycles on which some warp is ready to issue, and every gauge drops together, because the scheduler has fewer instructions to send anywhere. A saturated pipe lowers <a data-term="issue-efficiency">issue efficiency</a> too: the warps whose next instruction needs that pipe have to wait for it, so under <i>Memory copy</i> the scheduler issues on only 71% of cycles even though a warp is always ready.</p>
${GG.noteHTML('beyond', '<p><b>Waiting for a full pipe.</b> When a warp\'s next instruction is bound for a pipe that cannot take it yet, the warp stalls. Nsight Compute reports such stalls as <em>throttles</em>: "Math Pipe Throttle" when an arithmetic pipe is oversubscribed, "MIO Throttle" when the queue for the MIO (memory input/output) pipelines is full, which carry shared-memory, special-math and dynamic-branch instructions, and "LG Throttle" when the queue for local and global memory operations is full.</p>')}
<h3>The definition, piece by piece</h3>
<p>For each pipe, pipe utilization reports <b>what percentage of the pipe\'s <a data-term="peak-rate">peak rate</a> is achieved when that pipe is actively executing at least one warp, averaged across all active SMs</b>. That sentence has three parts.</p>
<ol>
<li><b>A percentage of the peak rate.</b> The numerator counts the instructions the pipe really executed. The denominator is the most it could have executed in the same cycles. For the <code>fma</code> pipe of an H100 the peak is easy to work out: an SM has 128 FP32 CUDA Cores and a warp has 32 threads, so an SM can start at most 128&nbsp;÷&nbsp;32&nbsp;=&nbsp;4 warp-wide <code>FFMA</code> instructions per cycle, one per sub-partition.</li>
<li><b>Only while active.</b> Cycles on which the SM has no warps are left out. A kernel that leaves an SM idle half the time is not marked down for it here; that idle time shows up in GPU and SM utilization instead.</li>
<li><b>Averaged across active SMs.</b> SMs that never ran any of the kernel's warps don't drag the average down either.</li>
</ol>
${GG.noteHTML('check', '<p><b>Which cycles count as "active"?</b> The glossary\'s wording, "when that pipe is actively executing at least one warp", reads as if only the cycles on which that particular pipe is busy count. The metric is looser than that. In Nsight Compute, <code>pct_of_peak_sustained_active</code> divides by the active cycles of the unit named at the start of the metric. For <code>sm__inst_executed_pipe_*</code> that unit is the SM, and an SM-active cycle is an <a data-term="active-cycle">active cycle</a>: one on which the SM has at least one warp resident, eligible or stalled. So a cycle on which the SM has warps but the <code>fma</code> pipe takes nothing still counts, and pulls <code>fma</code> utilization down. (If only the pipe\'s own busy cycles counted, a pipe that accepts one instruction per cycle would score close to 100% whenever it was used at all.) Fig.&nbsp;2 follows Nsight Compute: its denominator is SM-active cycles.</p>')}
<div data-slot="f2"></div>
${GG.noteHTML('beyond', '<p><b>What "active" means to Nsight Compute.</b> In Nsight Compute\'s metric definitions, the suffix <code>pct_of_peak_sustained_active</code> means the percentage of the peak sustained rate achieved <em>during unit active cycles</em>. The unit is the one the metric name starts with: for <code>sm__</code> metrics it is the SM, and an SM\'s active cycles are the cycles on which it has at least one warp in flight. Fig.&nbsp;2 counts active cycles that way. Its <i>all cycles</i> option shows the sibling suffix <code>pct_of_peak_sustained_elapsed</code>, which divides by every cycle of every SM instead.</p>')}
<h3>Check the coarser numbers first</h3>
<p>Before debugging application performance at the level of pipe utilization, GPU programmers should first look at <a href="https://modal.com/blog/gpu-utilization-guide">GPU kernel utilization</a> and <a data-term="streaming-multiprocessor-utilization">SM utilization</a>. Pipe utilization is blind to exactly the problems those two catch, because it only looks at active cycles of active SMs. A kernel can run its one SM\'s pipes flat out, scoring a high pipe utilization, while the other 131 SMs of an H100 sit idle. Work down the levels in order, as in Fig.&nbsp;3.</p>
<div data-slot="f3"></div>
<h3>Reading it in Nsight Compute</h3>
<p>Pipe utilization is available in the <code class="pfc-brk">sm__inst_executed_pipe_*.avg.pct_of_peak_sustained_active</code> metrics from <a href="https://developer.nvidia.com/nsight-compute">NSight Compute</a> (<code>ncu</code>), NVIDIA\'s kernel profiler. The asterisk stands for a specific pipeline, such as <a data-term="cuda-core"><code>fma</code></a>, <a data-term="tensor-core"><code>tensor</code></a>, <a data-term="load-store-unit"><code>lsu</code></a> or <code>adu</code> (address). Build the metric names in Fig.&nbsp;4 and see what each part means.</p>
<div data-slot="f4"></div>
${GG.noteHTML('beyond', `<p><b>How Nsight Compute names its metrics.</b> A metric name reads as <code>unit__counter_qualifiers.rollup.submetric</code>: which hardware unit counts (<code>sm</code>), what it counts (<code>inst_executed</code>, warp-level instructions executed), a qualifier narrowing it (<code>pipe_fma</code>), how the per-unit values are combined across the GPU's units (<code>.avg</code>, <code>.sum</code>, <code>.min</code> or <code>.max</code>), and how the result is expressed (<code>.pct_of_peak_sustained_active</code>).</p>
<p><b>More pipes.</b> Besides the glossary's four, Nsight Compute's documentation lists other pipes, including <code>alu</code> (integer and logic instructions), <code>xu</code> (transcendental functions and conversions, the work of the <a data-term="special-function-unit">Special Function Unit</a>) and <code>cbu</code>, the Convergence Barrier Unit that executes branch and warp-level convergence instructions: the "control flow units" above. It expands <code>adu</code> as the Address Divergence Unit, which handles address divergence for branches and jumps, constant loads and block-level barriers. The exact set of pipes varies by GPU and <code>ncu</code> version; <code>ncu --query-metrics</code> lists what your GPU supports.</p>`)}
<div data-slot="reading"></div>`);

      guard(() => puMixFig(ctx, s.f1));
      guard(() => puMeasureFig(ctx, s.f2));
      guard(() => puLevelsFig(ctx, s.f3));
      guard(() => puMetricFig(ctx, s.f4));
      ctx.reading(s.reading, [
        { href: 'https://modal.com/blog/gpu-utilization-guide', label: 'Modal: the GPU utilization guide', note: 'GPU kernel utilization, and why it should be high' },
        { href: 'https://developer.nvidia.com/nsight-compute', label: 'NVIDIA Nsight Compute', note: 'the kernel profiler that reports the pipe utilization metrics' },
        { href: 'https://docs.nvidia.com/nsight-compute/ProfilingGuide/index.html', label: 'Nsight Compute Kernel Profiling Guide', note: 'metric naming, the pipes, and stall reasons (Beyond the glossary)' },
      ]);
    },
  });

  /* Fig: a toy sub-partition. The scheduler issues ≤ 1 instruction per cycle; each instruction goes to the
     pipe for its type; each pipe has its own peak. Steady state: IPC = min(issue efficiency, min_p peak_p / share_p). */
  function puMixFig(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Instruction mix → pipe utilization', hint: 'pick a kernel · edit the mix · make warps less ready', wide: true,
      caption: 'A toy SM sub-partition in steady state. Its warp scheduler (amber) issues at most one warp instruction per cycle, and each instruction goes to the pipe for its type. Each tube is a pipe drawn as a conveyor belt: a ring passes the inlet on every cycle the pipe <em>could</em> accept an instruction, so closely spaced rings mean a high peak, and a ring is filled when an instruction really arrived. The gauge is the share of rings filled: accepted instructions as a percentage of the pipe\'s peak. The stacked bar in the scheduler is the instruction mix. The peaks are round numbers chosen for illustration, not H100 specifications, except <code>fma</code>: one warp instruction per cycle matches the 32 FP32 lanes of each H100 sub-partition. When a pipe saturates, every ring is filled and the warps queued for it (amber dots at its inlet) hold the scheduler back. The slider sets how often some warp is ready to issue, before any pipe limit; the issue efficiency chip shows what the scheduler really achieves.',
    });
    const st = { preset: 'gemm', mix: Object.assign({}, PU_PRESETS.gemm.mix), ie: 1 };
    let res = puCalc(st.mix, st.ie);
    let geo = null;
    const TOK = 11, DEPTH = 8, CPS = 4.5; // rings per pipe, tube length in cycles, cycles per second
    const view = rsvg(f.stage, 'A warp scheduler feeding five execution pipes, with a gauge of each pipe\'s utilization.', (svg, w) => {
      const mob = w < 700;
      const rows = PIPES.length;
      geo = { pipes: [] };
      if (!mob) {
        const sx = 0, sw = 168, top = 26, rh = 58;
        const H = top + rows * rh + 6;
        const lx = sw + 46, lw = 196, tx0 = lx + lw + 10, gw = Math.min(250, w * 0.24), gx = w - gw - 54, tx1 = gx - 30;
        Tx(svg, lx, 12, 'PIPE · PEAK (TOY)', { fs: 10, fill: 'var(--ink-3)', ls: '0.08em' });
        Tx(svg, tx0, 12, 'CAPACITY RINGS · FILLED = USED', { fs: 10, fill: 'var(--ink-3)', ls: '0.08em' });
        Tx(svg, gx, 12, 'PIPE UTILIZATION', { fs: 10, fill: 'var(--ink-3)', ls: '0.08em' });
        // scheduler
        const sy = top + 6, sh = rows * rh - 18;
        R(svg, sx + 1, sy, sw - 2, sh, 'fill:var(--control-a);stroke:var(--control);stroke-width:1.5', { rx: 10 });
        Tx(svg, sx + 14, sy + 22, 'warp scheduler', { fs: 12.5, fill: 'var(--control)', weight: 600 });
        Tx(svg, sx + 14, sy + 40, 'issues ≤ 1 / cycle', { fs: 10.5, fill: 'var(--ink-2)' });
        Tx(svg, sx + 14, sy + 66, 'issuing now', { fs: 10, fill: 'var(--ink-3)' });
        Tx(svg, sx + 14, sy + 92, fmtIpc(res.ipc), { fs: 26, fill: 'var(--ink)', weight: 700 });
        Tx(svg, sx + 14 + tw(fmtIpc(res.ipc), 26) + 6, sy + 92, '/ cycle', { fs: 10.5, fill: 'var(--ink-2)' });
        // mix bar
        const mbx = sx + 14, mby = sy + 116, mbw = sw - 28, mbh = 14;
        Tx(svg, mbx, mby - 6, 'instruction mix', { fs: 10, fill: 'var(--ink-3)' });
        drawMix(svg, mbx, mby, mbw, mbh, false);
        const legY = mby + mbh + 16;
        PIPES.forEach((p, i) => {
          const sh2 = res.share[p.k];
          Tx(svg, mbx, legY + i * 15, (p.k === 'cf' ? 'control' : p.name), { fs: 10, fill: 'var(--' + p.tone + ')' });
          Tx(svg, mbx + mbw, legY + i * 15, pct(sh2, 0), { fs: 10, anchor: 'end', fill: 'var(--ink-2)' });
        });
        PIPES.forEach((p, i) => {
          const cy = top + i * rh + rh / 2;
          const u = res.util[p.k], sh2 = res.share[p.k];
          // fan line
          const fx0 = sx + sw - 1, fy0 = sy + 20 + (i * (sh - 40)) / (rows - 1);
          Pa(svg, `M${fx0},${r2(fy0)}C${fx0 + 26},${r2(fy0)} ${lx - 26},${r2(cy)} ${lx - 6},${r2(cy)}`, `fill:none;stroke:var(--${p.tone});stroke-width:${r2(0.8 + sh2 * 5)};opacity:${sh2 > 0 ? 0.75 : 0.18}`);
          // label
          Tx(svg, lx, cy - 6, p.name, { fs: 13, fill: 'var(--' + p.tone + ')', weight: 600 });
          Tx(svg, lx + tw(p.name, 13) + 8, cy - 6, p.unit, { fs: 10.5, fill: 'var(--ink-2)' });
          Tx(svg, lx, cy + 12, 'peak ' + p.peakLab, { fs: 10, fill: 'var(--ink-3)' });
          pipeTube(svg, p, i, tx0, tx1, cy, 22);
          gauge(svg, gx, cy, gw, 14, u, p);
        });
        return H;
      }
      // phone layout: scheduler strip on top, then one row per pipe
      const top = 4, schH = 74, rh = 64;
      R(svg, 1, top, w - 2, schH, 'fill:var(--control-a);stroke:var(--control);stroke-width:1.5', { rx: 10 });
      Tx(svg, 12, top + 18, 'warp scheduler · issues ≤ 1 per cycle', { fs: 10.5, fill: 'var(--control)', weight: 600 });
      Tx(svg, w - 12, top + 38, 'issuing ' + fmtIpc(res.ipc) + ' / cycle', { fs: 10, anchor: 'end', fill: 'var(--ink)', weight: 600 });
      Tx(svg, 12, top + 38, 'instruction mix', { fs: 9.5, fill: 'var(--ink-3)' });
      drawMix(svg, 12, top + 44, w - 24, 12, false);
      let lxm = 12;
      PIPES.forEach((p) => {
        const lab = (p.k === 'cf' ? 'ctrl' : p.name) + ' ' + pct(res.share[p.k], 0);
        Tx(svg, lxm, top + 68, lab, { fs: 9, fill: 'var(--' + p.tone + ')' });
        lxm += tw(lab, 9) + 8;
      });
      const y0 = top + schH + 10;
      PIPES.forEach((p, i) => {
        const y = y0 + i * rh;
        Tx(svg, 2, y + 12, p.name, { fs: 11.5, fill: 'var(--' + p.tone + ')', weight: 600 });
        Tx(svg, 2 + tw(p.name, 11.5) + 6, y + 12, p.unit, { fs: 9.5, fill: 'var(--ink-2)' });
        Tx(svg, w - 2, y + 12, 'peak ' + p.peakLab, { fs: 9, anchor: 'end', fill: 'var(--ink-3)' });
        const cy = y + 34;
        const gw = Math.round(w * 0.36);
        // the tube starts far enough in for the queue of waiting warps (3 dots left of its inlet) to fit
        pipeTube(svg, p, i, 34, w - gw - 58, cy, 18);
        gauge(svg, w - gw - 46, cy, gw, 12, res.util[p.k], p);
      });
      return y0 + rows * rh - 6;
    }, () => placeTokens(20 + anim.time * CPS));
    legend(f.stage, [['var(--core)', 'a cycle on which the pipe could accept an instruction', 'outline pfc-lg-dot'], ['var(--core)', 'an instruction it accepted', 'dot'], ['var(--control)', 'warps queued at a saturated pipe', 'dot']]);
    function drawMix(svg, x, y, wd, h) {
      let cx = x;
      R(svg, x, y, wd, h, 'fill:rgba(8,9,14,.6);stroke:var(--line-2)', { rx: 3 });
      PIPES.forEach((p) => {
        const ww = wd * res.share[p.k];
        if (ww <= 0) return;
        R(svg, cx + 0.5, y + 0.5, Math.max(0, ww - 1), h - 1, 'fill:var(--' + p.tone + ');opacity:' + (p.k === 'tensor' ? 0.6 : 0.9), { rx: 2 });
        cx += ww;
      });
    }
    function pipeTube(svg, p, i, x0, x1, cy, h) {
      const len = Math.max(20, x1 - x0);
      R(svg, x0, cy - h / 2, len, h, 'fill:rgba(8,9,14,.55);stroke:var(--line-2);stroke-width:1', { rx: h / 2 });
      const g = G(svg);
      const toks = [];
      for (let k = 0; k < TOK; k++) toks.push(C(g, -50, cy, h * 0.24, 'opacity:0'));
      // queue of waiting warps at a saturated pipe
      const q = G(svg);
      if (res.lim === p.k) {
        for (let k = 0; k < 3; k++) C(q, x0 - 8 - k * 9, cy, 3.4, 'fill:var(--control)');
      }
      geo.pipes[i] = { x0, len, toks, peak: p.peak, u: Math.min(1, res.util[p.k]), tone: p.tone };
    }
    function gauge(svg, x, cy, wd, h, u, p) {
      R(svg, x, cy - h / 2, wd, h, 'fill:rgba(8,9,14,.6);stroke:var(--line-2)', { rx: 3 });
      if (u > 0) R(svg, x + 1, cy - h / 2 + 1, Math.max(0, (wd - 2) * Math.min(1, u)), h - 2, 'fill:var(--' + p.tone + ')', { rx: 2 });
      Ln(svg, x + wd * 0.5, cy + h / 2 + 1, x + wd * 0.5, cy + h / 2 + 4, 'stroke:var(--ink-3);stroke-width:1');
      Tx(svg, x + wd + 8, cy + 4.5, pct(u, 0), { fs: 13, fill: u >= 0.995 ? 'var(--ink)' : 'var(--ink-2)', weight: 600 });
      if (res.lim === p.k) Tx(svg, x, cy - h / 2 - 4, 'saturated: the bottleneck', { fs: 9.5, fill: 'var(--control)' });
    }
    /* Each pipe is a conveyor of capacity rings, one per cycle on which it can accept an instruction
       (spacing 1/peak cycles). Ring j is filled when floor((j+1)u) > floor(ju): an even spread of u. */
    function placeTokens(tc) {
      if (!geo) return;
      geo.pipes.forEach((pp) => {
        if (!pp) return;
        const { x0, len, toks, peak, u, tone } = pp;
        let used = 0;
        const jmax = Math.floor(tc * peak), jmin = Math.ceil((tc - DEPTH) * peak);
        for (let j = Math.max(0, jmin); j <= jmax && used < toks.length; j++) {
          const age = tc - j / peak;
          if (age < 0 || age > DEPTH) continue;
          const t = toks[used++];
          const full = Math.floor((j + 1) * u + 1e-9) > Math.floor(j * u + 1e-9);
          const op = age < 0.4 ? age / 0.4 : age > DEPTH - 0.4 ? (DEPTH - age) / 0.4 : 1;
          t.setAttribute('cx', r2(x0 + 8 + (age / DEPTH) * (len - 16)));
          t.setAttribute('style', full ? `fill:var(--${tone});stroke:none;opacity:${r2(op)}` : `fill:none;stroke:var(--${tone});stroke-width:1.3;opacity:${r2(op * 0.6)}`);
        }
        for (let k = used; k < toks.length; k++) toks[k].setAttribute('style', 'opacity:0');
      });
    }
    const anim = GG.anim(f.stage, (t) => placeTokens(20 + t * CPS));
    const sIe = stat(f, 'Issue efficiency', 'control');
    const sIpc = stat(f, 'Issued / cycle', 'control');
    const sTop = stat(f, 'Busiest pipe', 'core');
    const sLim = stat(f, 'Bottleneck', 'accent');
    const pick = presets(f.controls, 'Kernel', Object.keys(PU_PRESETS).map((k) => ({ value: k, label: PU_PRESETS[k].label })).concat([{ value: 'custom', label: 'Custom mix' }]), (v) => {
      st.preset = v;
      if (v !== 'custom') { st.mix = Object.assign({}, PU_PRESETS[v].mix); PIPES.forEach((p) => mixS[p.k].set(st.mix[p.k], false)); }
      mixBox.hidden = v !== 'custom';
      update();
    });
    pick.set(st.preset);
    GG.ui.slider(f.controls, { label: 'Cycles with a warp ready (before pipe limits)', min: 0, max: 100, step: 1, value: 100, format: (v) => v + '%', onInput: (v) => { st.ie = v / 100; update(); } });
    GG.ui.playButton(f.controls, anim);
    const mixBox = GG.el('div', { class: 'pfc-mixbox', hidden: true });
    mixBox.append(GG.el('span', { class: 'pfc-sub', style: 'flex-basis:100%', text: 'Relative weights: each share is its weight ÷ the sum of all five' }));
    f.controls.append(mixBox);
    const mixS = {};
    const shareWith = (k, v) => { const tot = PIPES.reduce((a, q) => a + (q.k === k ? v : st.mix[q.k] || 0), 0); return tot ? v / tot : 0; };
    PIPES.forEach((p) => {
      mixS[p.k] = GG.ui.slider(mixBox, { label: (p.k === 'cf' ? 'control' : p.name) + ' weight', min: 0, max: 100, step: 5, value: st.mix[p.k], format: (v) => `${v} → ${pct(shareWith(p.k, v), 0)}`, onInput: (v) => {
        st.mix[p.k] = v; update();
        PIPES.forEach((q) => { if (q.k !== p.k) mixS[q.k].set(st.mix[q.k], false); });
      } });
    });
    function update() {
      res = puCalc(st.mix, st.ie);
      view.redraw();
      placeTokens(20 + anim.time * CPS);
      sIpc.set(fmtIpc(res.ipc));
      sIe.set(pct(res.ipc, 0));
      const tp = pipeBy(res.top);
      sTop.set(res.tot ? `${tp.name} ${pct(res.util[res.top], 0)}` : '—', res.tot ? tp.tone : 'core');
      sLim.set(res.lim ? pipeBy(res.lim).name + ' pipe' : res.tot && st.ie < 1 ? 'issue rate' : 'none');
      f.setWhy(why());
    }
    function why() {
      if (!res.tot) return 'The mix is empty: with no instructions to issue, every pipe sits at 0%.';
      if (st.ie === 0) return 'No warp is ever ready to issue, so the scheduler never issues: issue efficiency is 0%, no instruction reaches any pipe, and every ring stays hollow.';
      const tp = pipeBy(res.top);
      if (res.lim) {
        const lp = pipeBy(res.lim);
        return `<b>The ${lp.name} pipe is the bottleneck.</b> ${pct(res.share[lp.k], 0)} of the instructions need it, but it accepts only ${lp.peakLab}, so every one of its rings is filled: it runs at 100% and holds the scheduler to <b>${fmtIpc(res.ipc)} instructions per cycle</b>. A warp is ready on ${pct(st.ie, 0)} of cycles, but the warps waiting for this pipe stall, so issue efficiency is only <b>${pct(res.ipc, 0)}</b>. Every other pipe waits on it.`;
      }
      const iePart = st.ie < 1 ? ` A warp is ready on only ${pct(st.ie, 0)} of cycles, so issue efficiency is ${pct(st.ie, 0)}, which scales every gauge down by the same factor.` : ' The scheduler issues on every cycle: issue efficiency is 100%.';
      return `No pipe saturates. The busiest is <b>${tp.name}</b> at <b>${pct(res.util[tp.k], 0)}</b>: ${pct(res.share[tp.k], 0)} of the instructions go to it, so it receives ${fmtIpc(res.ipc * res.share[tp.k])} per cycle against a peak of ${tp.peakLab}.${iePart}`;
    }
    update();
  }

  /* Fig: measuring fma pipe utilization over SMs × cycles, exactly as the definition says. */
  function puMeasureFig(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Measuring fma pipe utilization', hint: 'change the SMs and the FFMA rate · switch the denominator', wide: true,
      caption: 'Six of an H100\'s 132 SMs over 16 cycles. Every cycle, each SM\'s <code>fma</code> pipe can start up to four warp-wide <code>FFMA</code>s, one per sub-partition: the four small squares in each cell, filled green when one started. Each block of work keeps its SM busy for 12 cycles, but the SMs received theirs at different times, so the active windows are staggered; hatched cells are cycles when that SM had no warps. Rows marked "no warps" are SMs that never ran the kernel. The pattern of FFMAs is random but fixed, so it changes smoothly as you move the slider.',
    });
    const NS = 6, NC = 16, L = 12, OFF = [0, 3, 1, 4, 2, 0];
    const st = { act: 4, d: 2.6, den: 'active' };
    const U = []; const r = rng(91);
    for (let s2 = 0; s2 < NS; s2++) { U.push([]); for (let c = 0; c < NC; c++) U[s2].push([r(), r(), r(), r()]); }
    legend(f.stage, [['var(--core)', 'FFMA started'], ['var(--line-2)', 'unused fma slot', 'outline'], ['var(--ink-3)', 'SM had no warps (inactive cycle)', 'hatch']]);
    function data() {
      const rows = [];
      let tot = 0, actC = 0;
      for (let s2 = 0; s2 < NS; s2++) {
        const on = s2 < st.act;
        const cells = [];
        let n = 0, a = 0;
        for (let c = 0; c < NC; c++) {
          const active = on && c >= OFF[s2] && c < OFF[s2] + L;
          const slots = U[s2][c].map((u) => active && u < st.d / 4);
          if (active) { a++; n += slots.filter(Boolean).length; }
          cells.push({ active, slots });
        }
        tot += n; actC += a;
        rows.push({ on, cells, n, a });
      }
      const denC = st.den === 'active' ? actC : NS * NC;
      return { rows, tot, actC, denC, util: denC ? tot / (4 * denC) : 0 };
    }
    let D = data();
    const view = rsvg(f.stage, 'A grid of six SMs by sixteen cycles; each cell has four fma issue slots, filled when an FFMA started.', (svg, w) => {
      const mob = w < 640;
      const hatch = hatchDef(svg, 'pfc-hatch-pu', 'rgba(118,123,149,.35)');
      const padL = mob ? 34 : 64, padR = mob ? 50 : 132, top = 22;
      const cw = (w - padL - padR) / NC;
      const ch = clamp(Math.round(cw * 0.78), 18, 46);
      const gap = mob ? 1.5 : 3;
      for (let c = 0; c < NC; c++) {
        if (mob && c % 4 && c !== NC - 1) continue;
        Tx(svg, padL + c * cw + cw / 2, top - 8, String(c), { fs: 9.5, anchor: 'middle', fill: 'var(--ink-3)' });
      }
      Tx(svg, padL - 8, top - 8, 'cycle', { fs: 9.5, anchor: 'end', fill: 'var(--ink-3)' });
      Tx(svg, w, top - 8, mob ? 'per SM' : 'per SM: FFMAs / fma slots', { fs: 9.5, anchor: 'end', fill: 'var(--ink-3)' });
      D.rows.forEach((row, s2) => {
        const y = top + s2 * (ch + gap + 4);
        Tx(svg, padL - 8, y + ch / 2 + 4, mob ? 'SM' + s2 : 'SM ' + s2, { fs: mob ? 9.5 : 11, anchor: 'end', fill: row.on ? 'var(--ink)' : 'var(--ink-3)' });
        if (!row.on) {
          R(svg, padL + 0.5, y + 0.5, cw * NC - gap - 1, ch - 1, 'fill:none;stroke:var(--line-2);stroke-dasharray:3 4', { rx: 4 });
          Tx(svg, padL + (cw * NC) / 2, y + ch / 2 + 4, mob ? 'no warps: not active' : 'no warps on this SM: it is not active and is left out of the average', { fs: mob ? 9 : 10.5, anchor: 'middle', fill: 'var(--ink-3)' });
        }
        row.cells.forEach((cell, c) => {
          const x = padL + c * cw;
          if (!row.on) return;
          if (!cell.active) { R(svg, x, y, cw - gap, ch, `fill:${hatch};stroke:var(--line);stroke-width:1`, { rx: 3 }); return; }
          R(svg, x, y, cw - gap, ch, 'fill:rgba(69,212,155,.05);stroke:rgba(69,212,155,.35);stroke-width:1', { rx: 3 });
          const ip = mob ? 1.5 : 4, sg = mob ? 1 : 2.5;
          const sw = (cw - gap - 2 * ip - sg) / 2, sh = (ch - 2 * ip - sg) / 2;
          cell.slots.forEach((on2, k) => {
            const sx = x + ip + (k % 2) * (sw + sg), sy = y + ip + Math.floor(k / 2) * (sh + sg);
            R(svg, sx, sy, sw, sh, on2 ? 'fill:var(--core)' : 'fill:none;stroke:var(--line-2);stroke-width:1', { rx: 1.5 });
          });
        });
        const den = st.den === 'active' ? row.a : NC;
        const lab = row.on || st.den === 'elapsed' ? pct(den ? row.n / (4 * den) : 0, 0) : '—';
        Tx(svg, w, y + ch / 2 + 4, lab, { fs: mob ? 10 : 12, anchor: 'end', fill: row.on ? 'var(--ink)' : 'var(--ink-3)', weight: 600 });
        if (!mob && row.on) Tx(svg, w - 46, y + ch / 2 + 4, `${row.n}/${4 * den} slots`, { fs: 9.5, anchor: 'end', fill: 'var(--ink-3)' });
      });
      const yb = top + NS * (ch + gap + 4) + 10;
      const eqTxt = `${fI(D.tot)} FFMAs ÷ (4 × ${D.denC} ${st.den === 'active' ? 'active' : 'elapsed'} SM-cycles) = ${fI(D.tot)} ÷ ${fI(4 * D.denC)} = ${pct(D.util, 1)}`;
      Tx(svg, padL, yb + 6, mob ? `${fI(D.tot)} ÷ (4 × ${D.denC}) = ${pct(D.util, 1)}` : eqTxt, { fs: mob ? 10.5 : 12, fill: 'var(--ink)', weight: 600 });
      return yb + 14;
    });
    const sN = stat(f, 'FFMAs started', 'core');
    const sD = stat(f, st.den === 'active' ? 'Active SM-cycles' : 'SM-cycles', 'ink');
    const sU = stat(f, 'fma pipe utilization', 'accent');
    GG.ui.slider(f.controls, { label: 'SMs that got work', min: 1, max: NS, step: 1, value: st.act, format: (v) => `${v} of ${NS} shown`, onInput: (v) => { st.act = v; update(); } });
    GG.ui.slider(f.controls, { label: 'FFMAs per SM-cycle', min: 0, max: 4, step: 0.1, value: st.d, format: (v) => v.toFixed(1) + ' / 4 (avg)', onInput: (v) => { st.d = v; update(); } });
    GG.ui.seg(f.controls, { label: 'Divide by', options: [{ value: 'active', label: 'active cycles' }, { value: 'elapsed', label: 'all cycles' }], value: st.den, onChange: (v) => { st.den = v; update(); } });
    function update() {
      D = data();
      view.redraw();
      sN.set(fI(D.tot));
      sD.el.querySelector('i').textContent = st.den === 'active' ? 'Active SM-cycles' : 'All SM-cycles';
      sD.set(fI(D.denC));
      sU.set(pct(D.util, 1));
      const idle = NS - st.act;
      if (st.den === 'active') {
        f.setWhy(`${st.act} ${plural(st.act, 'SM')} × 12 active cycles = <b>${D.actC} active SM-cycles</b>, each with room for 4 FFMAs: ${fI(4 * D.actC)} slots, of which ${fI(D.tot)} were used, so the <code>fma</code> pipe ran at <b>${pct(D.util, 1)}</b> of its peak.${idle ? ` The ${idle} idle ${plural(idle, 'SM')} and every hatched cycle are left out; that is what <code>_active</code> means.` : ' The hatched cycles are left out; that is what <code>_active</code> means.'}`);
      } else {
        f.setWhy(`Dividing by every cycle of every SM shown (${NS} × ${NC} = ${NS * NC} SM-cycles) gives <b>${pct(D.util, 1)}</b>: the same ${fI(D.tot)} FFMAs, now diluted by idle SMs and idle cycles. Nsight Compute's <code>_elapsed</code> metrics work this way; pipe utilization uses <code>_active</code>, so that it measures how well the pipes are used <em>when there is work</em>.`);
      }
    }
    update();
  }

  /* Fig: the three levels of utilization, coarse to fine. */
  const PU_LEVELS = {
    gaps: {
      label: 'Gaps between kernels', gpu: 0.38, smBusy: 0.97, pipes: { fma: 0.72, tensor: 0, lsu: 0.31 },
      why: '<b>Start at the top.</b> No kernel is running for 62% of the time: the GPU waits on the host between launches. Neither SM nor pipe utilization can see that time, so look at GPU utilization first and remove the gaps (see <a data-term="overhead">overhead</a>).',
    },
    one: {
      label: 'A one-block kernel', gpu: 1, smBusy: 1 / 132, pipes: { fma: 0.81, tensor: 0, lsu: 0.28 },
      why: '<b>GPU utilization looks perfect, but only one SM is working.</b> A kernel with a single thread block runs on one SM, so SM utilization is at most 1/132 ≈ 0.76%. The busy SM\'s pipes look healthy, which is exactly why pipe utilization must not be read first. Launch more blocks; Fig.&nbsp;1 of <a data-term="streaming-multiprocessor-utilization">SM utilization</a> lets you add them and watch the waves fill the SMs.',
    },
    stall: {
      label: 'Busy SMs, idle pipes', gpu: 1, smBusy: 0.97, pipes: { fma: 0.09, tensor: 0, lsu: 0.21 },
      why: '<b>Every SM has work, but the pipes inside them are mostly idle.</b> Now pipe utilization is the number to look at: the warps spend most cycles stalled, for example waiting on global memory (<a data-term="scoreboard-stall">scoreboard stalls</a>), and no pipe comes close to its <a data-term="peak-rate">peak rate</a>.',
    },
    good: {
      label: 'Busy all the way down', gpu: 1, smBusy: 0.98, pipes: { fma: 0.12, tensor: 0.88, lsu: 0.36 },
      why: '<b>All three levels are high.</b> Kernels run back to back, nearly every SM is busy, and the Tensor Core pipe runs at 88% of its peak rate. This kernel is close to the speed of light for the pipe it depends on.',
    },
  };
  function puLevelsFig(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Coarse to fine: which utilization to read first', hint: 'pick a situation', wide: true,
      caption: 'Three nested questions. GPU (kernel) utilization, as <a data-term="nvidia-smi"><code>nvidia-smi</code></a> reports it, is the share of time any kernel is running: the green spans on the timeline. SM utilization is the share of SM-time spent running kernels: among an H100\'s 132 SMs, the outlined tiles are the ones busy while a kernel runs, and each fills only as far as the share of time a kernel is running at all, so the green area is SM utilization. Pipe utilization looks inside the busy SMs. The first level that is low (red outline) is the one to fix first. The situations and their numbers are illustrative.',
    });
    const st = { sc: 'gaps' };
    const view = rsvg(f.stage, 'Three panels: a GPU timeline, a grid of 132 SM tiles, and pipe gauges inside one SM.', (svg, w) => {
      const sc = PU_LEVELS[st.sc];
      const mob = w < 700;
      const smU = sc.gpu * sc.smBusy;
      const pipeMax = Math.max(sc.pipes.fma, sc.pipes.tensor, sc.pipes.lsu);
      const vals = [sc.gpu, smU, pipeMax];
      const firstLow = vals.findIndex((v) => v < 0.6);
      const panels = [
        { t: 'GPU utilization', s: 'is any kernel running?', v: sc.gpu },
        { t: 'SM utilization', s: 'how many SMs are busy?', v: smU },
        { t: 'Pipe utilization', s: 'how hard do busy SMs work?', v: pipeMax },
      ];
      const gapX = mob ? 0 : 34;
      const pw = mob ? w : (w - 2 * gapX) / 3;
      const ph = mob ? 150 : 210;
      panels.forEach((p, i) => {
        const x = mob ? 0 : i * (pw + gapX), y = mob ? i * (ph + 26) : 0;
        const low = i === firstLow;
        R(svg, x + 1, y + 1, pw - 2, ph - 2, `fill:rgba(8,9,14,.45);stroke:${low ? 'var(--danger)' : 'var(--line-2)'};stroke-width:${low ? 2 : 1}`, { rx: 10 });
        Tx(svg, x + 12, y + 20, (i + 1) + ' · ' + p.t, { fs: 12, fill: 'var(--ink)', weight: 600 });
        Tx(svg, x + 12, y + 36, p.s, { fs: 10, fill: 'var(--ink-3)' });
        Tx(svg, x + pw - 12, y + 22, p.v < 0.01 && p.v > 0 ? pct(p.v, 2) : pct(p.v, 0), { fs: 18, anchor: 'end', fill: low ? 'var(--danger)' : p.v >= 0.6 ? 'var(--core)' : 'var(--ink)', weight: 700 });
        if (low) Tx(svg, x + pw - 12, y + 36, 'look here first', { fs: 9.5, anchor: 'end', fill: 'var(--danger)' });
        const ix = x + 12, iy = y + 50, iw = pw - 24, ih = ph - 62;
        if (i === 0) {
          // timeline: kernel spans
          const n = 4, period = iw / n;
          const ty = iy + ih / 2 - 14;
          R(svg, ix, ty, iw, 28, 'fill:rgba(255,255,255,.03);stroke:var(--line)', { rx: 4 });
          for (let k = 0; k < n; k++) R(svg, ix + k * period + 1, ty + 2, period * sc.gpu - 2, 24, 'fill:var(--core);opacity:.85', { rx: 3 });
          Tx(svg, ix, ty + 46, 'time →', { fs: 9.5, fill: 'var(--ink-3)' });
          Tx(svg, ix + iw, ty + 46, 'green: a kernel is running', { fs: 9.5, anchor: 'end', fill: 'var(--ink-3)' });
        } else if (i === 1) {
          // tiles: outlined = busy while a kernel runs; the green fill rises to the share of time a kernel runs
          const cols = mob ? 22 : 12, rowsN = Math.ceil(132 / cols);
          const cell = Math.min(iw / cols, (ih - 20) / rowsN);
          const ox = ix + (iw - cell * cols) / 2;
          const busy = Math.max(sc.smBusy > 0 ? 1 : 0, Math.round(132 * sc.smBusy));
          for (let k = 0; k < 132; k++) {
            const cx = ox + (k % cols) * cell, cy = iy + Math.floor(k / cols) * cell;
            if (k < busy) {
              R(svg, cx + 0.75, cy + 0.75, cell - 1.5, cell - 1.5, 'fill:#1d2030;stroke:var(--core);stroke-width:1', { rx: 1.5 });
              const fh = (cell - 2.5) * sc.gpu;
              R(svg, cx + 1.25, cy + cell - 1.25 - fh, cell - 2.5, fh, 'fill:var(--core)', { rx: 1 });
            } else R(svg, cx + 0.75, cy + 0.75, cell - 1.5, cell - 1.5, 'fill:#2a2e44', { rx: 1.5 });
          }
          const capY = iy + rowsN * cell + 12;
          Tx(svg, ix, capY, `${busy}/132 busy while a kernel runs` + (sc.gpu < 1 ? ` × ${pct(sc.gpu, 0)} of the time` : ''), { fs: 9.5, fill: 'var(--ink-2)' });
        } else {
          const ks = ['fma', 'tensor', 'lsu'];
          const bh = mob ? 14 : 18, gap = mob ? 12 : 18;
          ks.forEach((k, j) => {
            const p2 = pipeBy(k);
            const by = iy + 10 + j * (bh + gap);
            Tx(svg, ix, by + bh - 4, k, { fs: 11, fill: 'var(--' + p2.tone + ')', weight: 600 });
            const bx = ix + 58, bw = iw - 58 - 44;
            R(svg, bx, by, bw, bh, 'fill:rgba(8,9,14,.6);stroke:var(--line-2)', { rx: 3 });
            if (sc.pipes[k] > 0) R(svg, bx + 1, by + 1, (bw - 2) * sc.pipes[k], bh - 2, 'fill:var(--' + p2.tone + ')', { rx: 2 });
            Tx(svg, ix + iw, by + bh - 4, pct(sc.pipes[k], 0), { fs: 11, anchor: 'end', fill: 'var(--ink-2)' });
          });
        }
        if (i < 2) {
          if (mob) { const ax = w / 2, ay = y + ph + 4; Pa(svg, `M${ax},${ay}v14`, 'fill:none;stroke:var(--ink-3);stroke-width:1.5'); arrowHead(svg, ax, ay + 19, Math.PI / 2, 7, 'var(--ink-3)'); }
          else { const ax = x + pw + 5, ay = ph / 2; Pa(svg, `M${ax},${ay}h${gapX - 14}`, 'fill:none;stroke:var(--ink-3);stroke-width:1.5'); arrowHead(svg, ax + gapX - 9, ay, 0, 7, 'var(--ink-3)'); Tx(svg, ax + (gapX - 10) / 2, ay - 8, 'zoom', { fs: 9, anchor: 'middle', fill: 'var(--ink-3)' }); }
        }
      });
      return mob ? 3 * ph + 2 * 26 : ph;
    });
    GG.ui.seg(f.controls, { label: 'Situation', options: Object.keys(PU_LEVELS).map((k) => ({ value: k, label: PU_LEVELS[k].label })), value: st.sc, onChange: (v) => { st.sc = v; update(); } });
    function update() { view.redraw(); f.setWhy(PU_LEVELS[st.sc].why); GG.decorate(f.why); }
    update();
  }

  /* Fig: build an Nsight Compute metric name and read each part. */
  const NCU_PIPES = [
    { v: 'fma', label: 'fma', g: true, html: 'The <b>fused multiply-add</b> pipe of the <a data-term="cuda-core">CUDA Cores</a>: most FP32 arithmetic (<code>FADD</code>, <code>FMUL</code>, <code>FFMA</code>). Nsight Compute notes it also runs integer multiplies such as <code>IMAD</code>.' },
    { v: 'tensor', label: 'tensor', g: true, html: 'The <a data-term="tensor-core">Tensor Cores</a>, which execute matrix multiply-accumulate instructions such as <code>HMMA</code>.' },
    { v: 'lsu', label: 'lsu', g: true, html: 'The <a data-term="load-store-unit">load/store units</a>: loads, stores and atomics to global, local and shared memory.' },
    { v: 'adu', label: 'adu', g: true, html: 'The <b>address</b> unit. Nsight Compute expands it as the Address Divergence Unit: address divergence for branches and jumps, constant loads and block-level barriers.' },
    { v: 'alu', label: 'alu', g: false, html: 'The arithmetic logic unit: integer arithmetic other than multiplies, bit manipulation and logic instructions.' },
    { v: 'cbu', label: 'cbu', g: false, html: 'The Convergence Barrier Unit: branches and warp-level convergence instructions. These are the "control flow units".' },
    { v: 'xu', label: 'xu', g: false, html: 'Transcendental functions (sine, cosine, reciprocal square root) and type conversions: the work of the <a data-term="special-function-unit">Special Function Unit</a>.' },
  ];
  function puMetricFig(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Nsight Compute metric-name builder', hint: 'pick a pipe · hover or tap a part', wide: true,
      caption: 'The glossary names the pattern <code class="pfc-brk">sm__inst_executed_pipe_*.avg.pct_of_peak_sustained_active</code> and four pipes. The pipes marked <i>Beyond</i> and the <i>elapsed</i> variant come from Nsight Compute\'s documentation. The command at the bottom is how you would ask <code>ncu</code> for the metric when profiling a program.',
    });
    const st = { pipe: 'fma', sub: 'active', on: null };
    const box = GG.el('div');
    f.stage.append(box);
    const metric = GG.el('div', { class: 'pfc-metric', role: 'group', 'aria-label': 'metric name' });
    const parts = GG.el('div', { class: 'pfc-parts' });
    const cmd = GG.el('pre', { class: 'pfc-codeline', tabindex: '0', style: 'margin-top:12px' });
    box.append(metric, parts, cmd);
    const PARTS = () => {
      const p = NCU_PIPES.find((x) => x.v === st.pipe);
      return [
        { id: 'unit', c: 'unit', cls: 'p-unit', txt: 'sm', h: '<b>sm<em class="pfc-tag">unit</em></b>The hardware unit that counts: the <a data-term="streaming-multiprocessor">Streaming Multiprocessor</a>. Every one of the GPU\'s SMs keeps its own count.' },
        { id: 'sep', c: 'sep', cls: 'p-sep', txt: '__', h: '<b>__</b>A double underscore separates the unit from what it counts.' },
        { id: 'ctr', c: 'ctr', cls: 'p-ctr', txt: 'inst_executed', h: '<b>inst_executed<em class="pfc-tag">counter</em></b>Instructions executed, counted per <a data-term="warp">warp</a>: one instruction for 32 threads counts once.' },
        { id: 'pipe', c: 'pipe', cls: 'p-pipe', txt: '_pipe_' + st.pipe, h: `<b>_pipe_${st.pipe}<em class="pfc-tag">${p.g ? 'the asterisk' : 'Beyond'}</em></b>Only instructions executed on this pipe. ${p.html}` },
        { id: 'roll', c: 'roll', cls: 'p-roll', txt: '.avg', h: '<b>.avg<em class="pfc-tag">rollup</em></b>Combine the per-SM values by averaging them. With <code>_active</code>, an SM that never ran the kernel has no active cycles and so adds nothing.' },
        { id: 'sub', c: 'sub', cls: 'p-sub', txt: '.pct_of_peak_sustained_' + st.sub, h: st.sub === 'active'
          ? '<b>.pct_of_peak_sustained_active<em class="pfc-tag">submetric</em></b>Express the count as a percentage of the pipe\'s <a data-term="peak-rate">peak</a> sustained rate over the SM\'s <em>active</em> cycles. This is pipe utilization.'
          : '<b>.pct_of_peak_sustained_elapsed<em class="pfc-tag">Beyond</em></b>The same percentage over <em>all</em> elapsed cycles, idle ones included. Lower whenever SMs sit idle; not what the glossary calls pipe utilization.' },
      ];
    };
    function render() {
      const P = PARTS();
      metric.innerHTML = P.map((p) => `<span class="${p.cls}" data-p="${p.id}">${p.txt}</span>`).join('');
      parts.innerHTML = P.map((p) => `<div class="pfc-part" data-c="${p.c}" data-p="${p.id}" tabindex="0">${p.h}</div>`).join('');
      const name = P.map((p) => p.txt).join('');
      cmd.innerHTML = `<span class="c"># profile ./my_app and report one metric</span>\nncu --metrics ${name} ./my_app`;
      GG.decorate(parts);
      const hi = (id) => {
        st.on = id;
        box.querySelectorAll('[data-p]').forEach((el) => el.classList.toggle('on', el.getAttribute('data-p') === id));
        const p = P.find((x) => x.id === id);
        if (p) f.setWhy(`<code class="pfc-brk">${GG.esc(p.txt)}</code>: ${p.h.replace(/<b>[\s\S]*?<\/b>/, '')}`);
        GG.decorate(f.why);
      };
      box.querySelectorAll('[data-p]').forEach((el) => {
        const id = el.getAttribute('data-p');
        el.addEventListener('mouseenter', () => hi(id));
        el.addEventListener('focus', () => hi(id));
        el.addEventListener('click', () => hi(id));
      });
      if (st.on) hi(st.on);
      else f.setWhy(`Pipe utilization of the <b>${st.pipe}</b> pipe: <code class="pfc-brk">${name}</code>. Hover or tap any part of the name to see what it means.`);
    }
    GG.ui.seg(f.controls, { label: 'Pipe (the asterisk)', options: NCU_PIPES.map((p) => ({ value: p.v, label: p.g ? p.label : p.label + '*', title: p.g ? 'named in the glossary' : 'Beyond the glossary: from Nsight Compute\'s documentation' })), value: st.pipe, onChange: (v) => { st.pipe = v; st.on = 'pipe'; render(); } });
    GG.ui.seg(f.controls, { label: 'Denominator', options: [{ value: 'active', label: '_active' }, { value: 'elapsed', label: '_elapsed*' }], value: st.sub, onChange: (v) => { st.sub = v; st.on = 'sub'; render(); } });
    const lab = GG.el('span', { class: 'pfc-sub', text: '* Beyond the glossary' });
    f.controls.append(lab);
    render();
  }

  /* ═════════════════════════ PEAK RATE ═════════════════════════ */

  const PR_PRESETS = {
    h100: { label: 'H100 SXM', sms: 132, cores: 128, flops: 2, mhz: 1980, tf: '66.9', note: 'the glossary\'s example' },
    h100p: { label: 'H100 PCIe*', sms: 114, cores: 128, flops: 2, mhz: 1755, tf: '51.2', note: '' },
    a100: { label: 'A100*', sms: 108, cores: 64, flops: 2, mhz: 1410, tf: '19.5', note: '' },
    v100: { label: 'V100*', sms: 80, cores: 64, flops: 2, mhz: 1530, tf: '15.7', note: '' },
  };
  const SUPD = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
  const sup = (n) => String(n).split('').map((c) => SUPD[c] || c).join('');

  GG.entry('peak-rate', {
    render(body, ctx) {
      const s = ctx.html(body, `
<p><strong>Peak rate</strong> is the theoretical maximum rate at which a hardware system can complete work. For a GPU the work is usually counted in floating-point operations (FLOPs), so a peak rate reads like "66.9 TFLOPS": 66.9 trillion floating-point operations per second.</p>
<p>It is the absolute upper bound of GPU performance: what you would get if every execution unit operated at maximum capacity with perfect efficiency. It assumes ideal operation, where no resource constraint creates a <a data-term="performance-bottleneck">bottleneck</a>. Nothing waits for <a data-term="registers">registers</a>, for <a data-term="memory-bandwidth">memory bandwidth</a>, at synchronization barriers, or for anything else. Real kernels never quite reach it. The interesting question is how close they get.</p>
${GG.noteHTML('intuition', '<p>A peak rate is like a car\'s top speed: what the engine could do on an empty, straight, flat road. Traffic, corners and hills are the bottlenecks. Nobody drives at top speed all the time, but it is still the number every trip is measured against.</p>')}
<h3>Computed from the spec sheet</h3>
<p>Peak rate is computed directly from the fixed hardware specifications of each GPU architecture: count the units, multiply by the work each unit can do per clock cycle, multiply by the clock rate. Take <a href="https://resources.nvidia.com/en-us-hopper-architecture/nvidia-h100-tensor-c">an NVIDIA H100 GPU</a>. It has 132 SMs, each containing 128 FP32 cores. Each core can issue one single-precision <b>fused multiply-add</b> (<code>FMA</code>) per clock. An FMA computes <i>a</i>&nbsp;×&nbsp;<i>b</i>&nbsp;+&nbsp;<i>c</i> in one step, so it comprises two floating-point operations: a multiply and an add. That's 132&nbsp;×&nbsp;128&nbsp;×&nbsp;2&nbsp;=&nbsp;33,792 per clock, which the glossary calls <a href="https://en.wikipedia.org/wiki/Instructions_per_cycle">instructions per clock</a>. The H100 can run its compute clock at up to 1,980&nbsp;MHz (million clocks per second) when using the FP32 cores, so the peak rate is 33,792&nbsp;×&nbsp;1,980&nbsp;million&nbsp;=&nbsp;66,908 billion FLOPS, or <b>66.9 TFLOPS</b>.</p>
<p>That precisely matches the Peak FP32 TFLOPS (non-Tensor) rate advertised in <a href="https://resources.nvidia.com/en-us-hopper-architecture/nvidia-h100-tensor-c">NVIDIA's H100 whitepaper</a>. Build the number yourself in Fig.&nbsp;1, then change the inputs.</p>
<div data-slot="f1"></div>
${GG.noteHTML('check', '<p><b>33,792 are FLOPs per clock, not instructions.</b> Counting instructions, each of the 16,896 FP32 cores (132&nbsp;×&nbsp;128) completes one FMA per clock: 16,896 FMAs. Counted the way the GPU issues them, as warp-wide instructions of 32 threads each, that is 16,896&nbsp;÷&nbsp;32&nbsp;=&nbsp;528 <code>FFMA</code> instructions per clock, four per SM. Each FMA is two FLOPs, which gives the 33,792 per clock. The final answer is unaffected: 33,792 FLOPs&nbsp;×&nbsp;1.98&nbsp;×&nbsp;10<sup>9</sup> clocks per second&nbsp;=&nbsp;66.9&nbsp;×&nbsp;10<sup>12</sup> FLOPS.</p>')}
${GG.noteHTML('beyond', '<p><b>The other presets</b> in Fig.&nbsp;1 (starred) use NVIDIA\'s published figures for those GPUs: the H100 PCIe card has 114 SMs at up to 1,755&nbsp;MHz (51.2 TFLOPS FP32, from the same whitepaper); the A100 has 108 SMs of 64 FP32 cores at 1,410&nbsp;MHz (19.5 TFLOPS); the V100 SXM2 has 80 SMs of 64 FP32 cores at 1,530&nbsp;MHz (15.7 TFLOPS). Each comes out of the same three-factor product.</p>')}
<h3>The yardstick</h3>
<p>Peak rate is the yardstick against which all achieved performance is measured. It shows up in three places across this glossary.</p>
<ul>
<li>It sets the <a data-term="compute-bound">compute-bound</a> "roof" in a <a data-term="roofline-model">roofline analysis</a>: the flat line no kernel can rise above, however much arithmetic it does per byte of memory traffic (Fig.&nbsp;2).</li>
<li>It is the denominator in the utilization fraction reported in <a data-term="pipe-utilization">pipe utilization</a> metrics: "percentage of peak".</li>
<li>It is the <a href="https://modal.com/blog/gpu-utilization-guide">ultimate arbiter of GPU utilization</a>: achieved FLOPS divided by peak FLOPS says how much of the hardware you are really using.</li>
</ul>
<div data-slot="f2"></div>
<p>A GPU has more than one peak rate, because it has more than one kind of unit. The 66.9 TFLOPS above belongs to the FP32 CUDA Cores. The same H100's Tensor Cores peak at 989 TFLOPS for dense BF16 matrix math. Divide by the peak of the pipe the kernel really uses, or the percentage means little (Fig.&nbsp;3).</p>
<div data-slot="f3"></div>
<h3>The "speed of light"</h3>
<p>Poetically, NVIDIA engineers often call the peak rate the <b>"speed of light"</b>: the limit on program speed imposed by physics. However clever the code, the hardware cannot do more than its units can do in the clock cycles available, just as nothing travels faster than light.</p>
${GG.noteHTML('beyond', '<p>The phrase has made it into NVIDIA\'s tools. Nsight Compute\'s first report section is called <b>GPU Speed Of Light Throughput</b>: it shows a kernel\'s achieved compute and memory throughput as percentages of the hardware\'s peaks.</p>')}
<div data-slot="reading"></div>`);
      guard(() => prCalcFig(ctx, s.f1));
      guard(() => prRoofFig(ctx, s.f2));
      guard(() => prYardFig(ctx, s.f3));
      ctx.reading(s.reading, [
        { href: 'https://resources.nvidia.com/en-us-hopper-architecture/nvidia-h100-tensor-c', label: 'NVIDIA H100 Tensor Core GPU Architecture whitepaper', note: 'SM counts, clocks and the Peak FP32 TFLOPS (non-Tensor) figure' },
        { href: 'https://en.wikipedia.org/wiki/Instructions_per_cycle', label: 'Wikipedia: Instructions per cycle', note: 'IPC, the measure the glossary names' },
        { href: 'https://modal.com/blog/gpu-utilization-guide', label: 'Modal: the GPU utilization guide', note: 'peak rate as the ultimate arbiter of GPU utilization' },
      ]);
    },
  });

  /* Fig: the peak-rate product, drawn as nested units, with a slow-motion clock. */
  function prCalcFig(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Building a peak rate', hint: 'pick a GPU · change any factor', wide: true,
      caption: 'Peak rate as a product of four factors. Every tile in the first panel is an SM (for 128-core, Hopper-style settings the empty outlines fill up to the 144 SMs of a full GH100 die); every dot in the second is one FP32 core of an SM; the third shows the work one core does in one clock; the fourth is the clock. In slow motion, each tick of the clock flashes every core at once and adds one clock\'s worth of FLOPs to the counter. The real clock ticks billions of times a second (1.98 billion for the H100 SXM; the clock panel shows the rate for the GPU you pick). Starred presets are Beyond the glossary.',
    });
    const st = Object.assign({}, PR_PRESETS.h100, { preset: 'h100' });
    const eq = GG.el('div', { class: 'pfc-eq', role: 'math', style: 'margin-top:12px' });
    let geo = null;
    const PERIOD = 1.1;
    const view = rsvg(f.stage, 'The peak-rate product: SMs, times FP32 cores per SM, times FLOPs per core per clock, times the clock rate.', (svg, w) => {
      const mob = w < 700;
      const gap = mob ? 22 : 30;
      const pw = mob ? (w - gap) / 2 : (w - 3 * gap) / 4;
      const ph = mob ? 182 : 214;
      geo = { flash: [], wave: null, cursor: null, counter: null, wx0: 0, ww: 0, wy: 0, wh: 0 };
      const P = (i) => ({ x: mob ? (i % 2) * (pw + gap) : i * (pw + gap), y: mob ? Math.floor(i / 2) * (ph + 26) : 0 });
      const frame = (i, title, val, tone) => {
        const { x, y } = P(i);
        R(svg, x + 1, y + 1, pw - 2, ph - 2, 'fill:rgba(8,9,14,.45);stroke:var(--line-2)', { rx: 10 });
        Tx(svg, x + 12, y + 19, title, { fs: mob ? 9.5 : 10.5, fill: 'var(--ink-3)', ls: '0.06em' });
        Tx(svg, x + 12, y + ph - 14, val, { fs: mob ? 15 : 19, fill: 'var(--' + tone + ')', weight: 700 });
        if (i < 3) {
          const last = mob && i % 2 === 1;
          const sx = last ? w / 2 : x + pw + gap / 2, sy = last ? y + ph + 14 : y + ph / 2;
          Tx(svg, sx, sy + 6, '×', { fs: 20, anchor: 'middle', fill: 'var(--ink-3)', weight: 600 });
        }
        return { x, y };
      };
      // 1: SMs
      {
        const { x, y } = frame(0, mob ? 'SM COUNT' : 'STREAMING MULTIPROCESSORS', fI(st.sms) + ' ' + plural(st.sms, 'SM'), 'ink');
        const cols = 12, rowsN = Math.ceil(st.sms / cols);
        const avail = { w: pw - 24, h: ph - 64 };
        const cell = Math.min(avail.w / cols, avail.h / 12);
        const ox = x + 12 + (avail.w - cell * cols) / 2, oy = y + 28;
        const g = G(svg);
        for (let k = 0; k < st.sms; k++) R(g, ox + (k % cols) * cell + 0.75, oy + Math.floor(k / cols) * cell + 0.75, cell - 1.5, cell - 1.5, 'fill:var(--core)', { rx: 1.5 });
        geo.flash.push(g);
        // ghost outlines up to the full GH100 die (144 SMs), only for Hopper-like settings (128 FP32 cores per SM)
        if (st.cores === 128 && st.sms < 144) {
          for (let k = st.sms; k < 144; k++) R(svg, ox + (k % cols) * cell + 0.75, oy + Math.floor(k / cols) * cell + 0.75, cell - 1.5, cell - 1.5, 'fill:none;stroke:var(--line-2);stroke-width:.75', { rx: 1.5 });
          Tx(svg, x + pw - 12, mob ? y + 19 : y + ph - 14, mob ? 'die: 144' : 'full die: 144', { fs: 9, anchor: 'end', fill: 'var(--ink-3)' });
        }
        void rowsN;
      }
      // 2: cores per SM
      {
        const { x, y } = frame(1, mob ? 'FP32 CORES / SM' : 'FP32 CORES PER SM', fI(st.cores) + ' cores', 'core');
        const cols = 16, rowsN = st.cores / 16;
        const sp = Math.min((pw - 24) / cols, (ph - 70) / 8);
        const ox = x + 12 + (pw - 24 - sp * cols) / 2, oy = y + 30 + ((8 - rowsN) * sp) / 2;
        const g = G(svg);
        for (let k = 0; k < st.cores; k++) C(g, ox + (k % cols) * sp + sp / 2, oy + Math.floor(k / cols) * sp + sp / 2, sp * 0.33, 'fill:var(--core)');
        geo.flash.push(g);
        // sub-partition brackets for the 128-core case
        if (st.cores === 128) {
          for (let q = 0; q < 4; q++) {
            const yy = oy + q * 2 * sp;
            if (q) Ln(svg, ox, yy, ox + sp * cols, yy, 'stroke:var(--line-2);stroke-width:1;stroke-dasharray:2 3');
          }
        }
      }
      // 3: FLOPs per core per clock
      {
        const { x, y } = frame(2, mob ? 'FLOPS / CORE / CLOCK' : 'FLOPS PER CORE PER CLOCK', st.flops + (st.flops === 1 ? ' FLOP' : ' FLOPs'), 'special');
        const cx = x + pw / 2, cy = y + ph / 2 - 10;
        const fs = mob ? 14 : 18;
        const txt = st.flops === 2 ? 'd = a × b + c' : 'd = a + b';
        Tx(svg, cx, cy - 18, st.flops === 2 ? 'FFMA (fused multiply-add)' : 'FADD (add only)', { fs: mob ? 9 : 10.5, anchor: 'middle', fill: 'var(--ink-2)' });
        Tx(svg, cx, cy + 10, txt, { fs, anchor: 'middle', fill: 'var(--ink)', weight: 600 });
        const ops = st.flops === 2 ? ['× 1 FLOP', '+ 1 FLOP'] : ['+ 1 FLOP'];
        const bw = mob ? 66 : 84, bh = 22;
        const tot = ops.length * bw + (ops.length - 1) * 8;
        ops.forEach((o, k) => {
          const bx = cx - tot / 2 + k * (bw + 8), by = cy + 24;
          R(svg, bx, by, bw, bh, 'fill:var(--special-a);stroke:var(--special)', { rx: 6 });
          Tx(svg, bx + bw / 2, by + 15, o, { fs: mob ? 9.5 : 11, anchor: 'middle', fill: 'var(--special)', weight: 600 });
        });
      }
      // 4: clock
      {
        const { x, y } = frame(3, 'CLOCK RATE', fI(st.mhz) + ' MHz', 'control');
        const wx0 = x + 14, ww = pw - 28, wy = y + 42, wh = 34;
        const n = 4, per = ww / n;
        let d = `M${wx0},${wy + wh}`;
        for (let k = 0; k < n; k++) { const a = wx0 + k * per; d += `H${r2(a + per * 0.1)}V${wy}H${r2(a + per * 0.6)}V${wy + wh}`; }
        d += `H${wx0 + ww}`;
        Pa(svg, d, 'fill:none;stroke:var(--control);stroke-width:1.8');
        geo.cursor = C(svg, wx0, wy + wh, 4.5, 'fill:var(--ink)');
        Object.assign(geo, { wx0, ww, wy, wh, per });
        Tx(svg, x + 14, wy + wh + 22, `${(st.mhz / 1000).toFixed(st.mhz % 10 ? 3 : 2)} × 10${sup(9)} clocks / s`, { fs: mob ? 9.5 : 11, fill: 'var(--ink-2)' });
        geo.counter = Tx(svg, x + 14, wy + wh + 40, '', { fs: mob ? 9 : 10.5, fill: 'var(--ink-3)' });
        geo.counter2 = Tx(svg, x + 14, wy + wh + 54, '', { fs: mob ? 9 : 10.5, fill: 'var(--ink-2)' });
      }
      return mob ? 2 * ph + 26 : ph;
    }, () => { lastTick = -1; frameAt(GG.reducedMotion && !anim.running && !anim.time ? PERIOD * 0.15 : anim.time); });
    f.stage.append(eq);
    let lastTick = -1;
    function frameAt(t) {
      if (!geo || !geo.cursor) return;
      const tick = Math.floor(t / PERIOD);
      const ph = (t % PERIOD) / PERIOD;
      const per = geo.per, pos = (tick % 4) * per + ph * per;
      const xx = geo.wx0 + pos;
      const rel = ph; // within one period: rising edge at 0.1
      const high = rel >= 0.1 && rel < 0.6;
      geo.cursor.setAttribute('cx', r2(xx));
      geo.cursor.setAttribute('cy', r2(high ? geo.wy : geo.wy + geo.wh));
      const glow = rel >= 0.1 ? Math.max(0, 1 - (rel - 0.1) / 0.45) : 0;
      geo.flash.forEach((g) => { g.style.opacity = String(0.62 + 0.38 * glow); });
      if (tick !== lastTick || !geo.counter.textContent) {
        lastTick = tick;
        const n = tick + 1;
        geo.counter.textContent = `slow motion: ${n} ${plural(n, 'clock')}`;
        geo.counter2.textContent = `= ${fI(n * st.sms * st.cores * st.flops)} FLOPs`;
      }
    }
    const anim = GG.anim(f.stage, (t) => frameAt(t));
    const sOps = stat(f, 'Core-ops / clock', 'core');
    const sFl = stat(f, 'FLOPs / clock', 'special');
    const sWi = stat(f, 'Warp instr. / clock', 'ink');
    const sPk = stat(f, 'Peak rate', 'accent');
    const pre = presets(f.controls, 'GPU', Object.keys(PR_PRESETS).map((k) => ({ value: k, label: PR_PRESETS[k].label })), (v) => {
      Object.assign(st, PR_PRESETS[v], { preset: v });
      sl.sms.set(st.sms, false); sl.mhz.set(st.mhz, false); sl.cores.set(st.cores, false); sl.flops.set(st.flops, false);
      update();
    });
    pre.set('h100');
    const sl = {};
    const custom = () => { const k = Object.keys(PR_PRESETS).find((p) => ['sms', 'cores', 'flops', 'mhz'].every((q) => PR_PRESETS[p][q] === st[q])); st.preset = k || null; pre.set(st.preset); };
    sl.sms = GG.ui.slider(f.controls, { label: 'SMs', min: 1, max: 144, step: 1, value: st.sms, format: (v) => String(v), onInput: (v) => { st.sms = v; custom(); update(); } });
    sl.mhz = GG.ui.slider(f.controls, { label: 'Clock', min: 100, max: 2100, step: 5, value: st.mhz, format: (v) => fI(v) + ' MHz', onInput: (v) => { st.mhz = v; custom(); update(); } });
    sl.cores = GG.ui.seg(f.controls, { label: 'FP32 cores / SM', options: [{ value: 64, label: '64' }, { value: 128, label: '128' }], value: st.cores, onChange: (v) => { st.cores = v; custom(); update(); } });
    sl.flops = GG.ui.seg(f.controls, { label: 'Work per core per clock', options: [{ value: 2, label: 'FMA: 2 FLOPs' }, { value: 1, label: 'add: 1 FLOP' }], value: st.flops, onChange: (v) => { st.flops = v; custom(); update(); } });
    GG.ui.playButton(f.controls, anim);
    function update() {
      const ops = st.sms * st.cores, fl = ops * st.flops, gfl = (fl * st.mhz) / 1000;
      view.redraw();
      lastTick = -1;
      frameAt(GG.reducedMotion && !anim.running ? PERIOD * 0.15 : anim.time);
      sOps.set(fI(ops)); sFl.set(fI(fl)); sWi.set(GG.fmt.sig(ops / 32, 4)); sPk.set((gfl / 1000).toFixed(gfl >= 10000 ? 1 : 2) + ' TFLOPS');
      const tfl = gfl / 1000;
      eq.setAttribute('aria-label', `${st.sms} ${plural(st.sms, 'SM')} times ${st.cores} cores times ${st.flops} FLOPs times ${st.mhz} MHz equals ${tfl.toFixed(1)} TFLOPS`);
      eq.innerHTML = `<span>${fI(st.sms)} ${plural(st.sms, 'SM')}</span><span class="pfc-eq-op">×</span><span>${st.cores} cores</span><span class="pfc-eq-op">×</span><span>${st.flops} ${plural(st.flops, 'FLOP')}</span><span class="pfc-eq-op">=</span><span><b>${fI(fl)}</b> FLOPs / clock</span><span class="pfc-eq-op">×</span><span>${fI(st.mhz)} × 10${sup(6)} clocks / s</span><span class="pfc-eq-op">=</span><span><b>${fI(gfl)}</b> GFLOPS</span><span class="pfc-eq-op">≈</span><span class="pfc-eq-l" style="color:var(--accent)">${tfl.toFixed(1)} TFLOPS</span>`;
      let w;
      const p = st.preset && PR_PRESETS[st.preset];
      if (st.preset === 'h100') w = `${st.sms} × ${st.cores} × ${st.flops} = <b>${fI(fl)} FLOPs every clock</b>. At ${fI(st.mhz)} million clocks per second that is <b>${fI(gfl)} billion FLOPS = ${tfl.toFixed(1)} TFLOPS</b>, the Peak FP32 (non-Tensor) figure in NVIDIA's H100 whitepaper. Warp by warp, it is ${fI(ops / 32)} <code>FFMA</code> instructions per clock.`;
      else if (p) w = `${p.label.replace('*', '')}: ${fI(st.sms)} SMs × ${st.cores} cores × ${st.flops} FLOPs × ${fI(st.mhz)} MHz = <b>${tfl.toFixed(1)} TFLOPS</b>, matching the ${p.tf} TFLOPS NVIDIA publishes for its FP32 peak.`;
      else w = `Your GPU: ${fI(st.sms)} ${plural(st.sms, 'SM')} × ${st.cores} cores × ${st.flops} ${plural(st.flops, 'FLOP')} = ${fI(fl)} FLOPs per clock, × ${fI(st.mhz)} MHz = <b>${tfl.toFixed(2)} TFLOPS</b>.`;
      if (st.flops === 1) w += ' Counting one operation per core per clock instead of a fused multiply-add halves the peak: code that does not use FMAs cannot get above half of the advertised FP32 rate.';
      else if (st.sms > 132 && st.cores === 128) w += ` (A full GH100 die has 144 SMs; the H100 SXM enables 132 of them.)`;
      f.setWhy(w);
    }
    update();
  }

  /* Fig: the peak rate as the compute roof. */
  function prRoofFig(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Peak rate is the roof', hint: 'drag the kernel · switch the pipe', wide: true,
      caption: 'A roofline chart (log-log). The flat green line is the peak rate of the chosen pipe, the "speed of light" for that kind of math; the slanted blue line is the limit set by memory bandwidth. The kernel sits below its roof at 60% of what the roofs allow. Switch between the H100\'s FP32 CUDA Cores and its BF16 Tensor Cores: the same chip has two very different peaks.',
    });
    const RF = GG.components.roofline;
    RF(f, {
      system: 'h100-fp32', systems: ['h100-fp32', 'h100-bf16'], showControls: true, shade: 'compute',
      kernels: [{ label: 'Kernel', ai: 40, achieved: 0.6 }],
      why: (S) => {
        if (!S || !S.system) return null;
        const pk = S.system.flops;
        let t = `The flat roof is the <b>peak rate</b> of ${S.system.phrase}: <b>${RF.fmt.perf(pk)}</b>. No kernel rises above it, however many FLOPs it does per byte.`;
        if (S.ai != null) {
          const a = S.achieved != null ? S.achieved : S.attainable;
          t += S.bound === 'memory'
            ? ` At ${RF.fmt.ai(S.ai)} FLOPs/byte this kernel is memory-bound: its roof is the bandwidth line, ${RF.fmt.perf(S.attainable)}. It reaches ${RF.fmt.perf(a)}, which is ${pct(a / pk, 1)} of the peak rate.`
            : ` At ${RF.fmt.ai(S.ai)} FLOPs/byte this kernel is compute-bound: the peak rate is its roof. It reaches ${RF.fmt.perf(a)}, ${pct(a / pk, 1)} of the speed of light.`;
        }
        return t;
      },
    });
  }

  /* Fig: one measured matmul, two yardsticks. */
  function prYardFig(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'One measurement, two yardsticks', hint: 'choose a matrix size and a run time', wide: true,
      caption: 'Multiplying two <i>N</i>&nbsp;×&nbsp;<i>N</i> matrices takes <i>N</i><sup>3</sup> multiply-adds, or 2<i>N</i><sup>3</sup> FLOPs. Divide by the measured run time to get the achieved rate, then by a peak rate to get a utilization. The log axis marks the H100\'s two peaks, both compute cores and so both green: 66.9 TFLOPS on the FP32 CUDA Cores (thin dashed line) and 989 TFLOPS for dense BF16 on the Tensor Cores (thick solid line). A rate above a pipe\'s peak means the work cannot have run on that pipe alone; a rate above both means the measurement itself is wrong. The 133.8 TFLOPS half-precision CUDA Core peak and the TF32 Tensor Core peak (494.7 TFLOPS dense, the format an FP32 matmul runs in on the Tensor Cores) in the readout are from NVIDIA\'s H100 whitepaper (Beyond the glossary).',
    });
    const st = { n: 4096, ms: 3 };
    const PEAKS = [
      { k: 'fp32', label: 'FP32 CUDA Cores', v: 66.9e12, sw: 1.6, dash: '4 3', op: 0.55 },
      { k: 'bf16', label: 'BF16 Tensor Cores (dense)', v: 989e12, sw: 3, dash: null, op: 1 },
    ];
    /* utilization as a percentage, with enough digits that a tiny nonzero rate never reads as 0% */
    const fmtU = (u) => (u >= 0.001 ? pct(u, 1) : u > 0 ? (u * 100).toPrecision(2) + '%' : '0%');
    const RFfmt = GG.components.roofline && GG.components.roofline.fmt;
    const perf = (x) => (RFfmt ? RFfmt.perf(x) : GG.fmt.si(x, 'FLOPS'));
    const view = rsvg(f.stage, 'A logarithmic axis of FLOPS with the two H100 peak rates and the measured kernel\'s achieved rate.', (svg, w) => {
      const mob = w < 640;
      const ach = (2 * st.n ** 3) / (st.ms / 1000);
      const lo = 1e11, hi = 3e15;
      const padL = 8, padR = 8;
      const X = (v) => padL + ((Math.log10(clamp(v, lo, hi)) - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo))) * (w - padL - padR);
      const ay = 70;
      Ln(svg, padL, ay, w - padR, ay, 'stroke:var(--ink-3);stroke-width:1.2');
      [1e11, 1e12, 1e13, 1e14, 1e15].forEach((v) => {
        Ln(svg, X(v), ay, X(v), ay + 6, 'stroke:var(--ink-3)');
        const tl = mob ? ({ 1e11: '100 G', 1e12: '1 T', 1e13: '10 T', 1e14: '100 T', 1e15: '1 P' })[v] : perf(v);
        Tx(svg, X(v), ay + 19, tl, { fs: 9.5, anchor: v === 1e11 ? 'start' : 'middle', fill: 'var(--ink-3)' });
      });
      // Both peaks are compute cores (green). The Tensor Core line is thick and solid, the CUDA Core line thin
      // and dashed. Labels sit on separate rows, left of their own line; the FP32 line starts below the BF16
      // label row, so no label is crossed by the other peak's line.
      PEAKS.slice().reverse().forEach((p, i) => {
        const x = X(p.v), ly = 26 + i * 18;
        Ln(svg, x, ly - 10, x, ay, `stroke:var(--core);stroke-width:${p.sw}${p.dash ? ';stroke-dasharray:' + p.dash : ''}`);
        const lab = (mob ? (p.k === 'fp32' ? 'FP32 CUDA peak ' : 'BF16 TC peak ') : p.label + ' peak · ') + perf(p.v);
        const lw = tw(lab, 10);
        const left = x - 6 - lw > padL;
        Tx(svg, left ? x - 6 : x + 6, ly, lab, { fs: 10, anchor: left ? 'end' : 'start', fill: 'var(--core)', weight: p.k === 'bf16' ? 600 : null });
      });
      const xa = X(ach);
      Pa(svg, `M${r2(xa)},${ay - 9}l7,9l-7,9l-7,-9z`, 'fill:var(--ink);stroke:var(--bg);stroke-width:1.5');
      const al = 'achieved ' + perf(ach);
      Tx(svg, clamp(xa, padL + tw(al, 11) / 2, w - padR - tw(al, 11) / 2), ay + 38, al, { fs: 11, anchor: 'middle', fill: 'var(--ink)', weight: 600 });
      // two utilization bars
      let y = ay + 66;
      PEAKS.forEach((p) => {
        const u = ach / p.v;
        const bx = 0, bw = w - (mob ? 54 : 70);
        Tx(svg, 0, y - 5, 'measured against the ' + p.label + ' peak', { fs: mob ? 9.5 : 11, fill: 'var(--core)' });
        const by = y;
        R(svg, bx, by, bw, 16, 'fill:rgba(8,9,14,.6);stroke:var(--line-2)', { rx: 3 });
        R(svg, bx + 1, by + 1, (bw - 2) * Math.min(1, u), 14, u > 1 ? 'fill:var(--danger)' : `fill:var(--core);opacity:${p.op}`, { rx: 2 });
        Tx(svg, w, by + 12.5, u > 9.995 ? '>999%' : fmtU(u), { fs: 12, anchor: 'end', fill: u > 1 ? 'var(--danger)' : 'var(--ink)', weight: 600 });
        if (u > 1) Tx(svg, bx + 8, by + 12, 'above this peak: impossible on this pipe alone', { fs: mob ? 9 : 10, fill: '#fff', weight: 600 });
        y += 44;
      });
      return y - 26;
    });
    const sF = stat(f, 'FLOPs (2N³)', 'ink');
    const sA = stat(f, 'Achieved', 'accent');
    const pre = presets(f.controls, 'Example', [
      { value: 'sgemm', label: 'FP32 matmul, CUDA Cores' },
      { value: 'hgemm', label: 'BF16 matmul, Tensor Cores' },
    ], (v) => {
      if (v === 'sgemm') { st.n = 4096; st.ms = 3; } else { st.n = 8192; st.ms = 1.6; }
      nS.set(st.n, false); tS.set(st.ms, false); update();
    });
    pre.set('sgemm');
    const nS = GG.ui.seg(f.controls, { label: 'Matrix size N', options: [1024, 2048, 4096, 8192, 16384].map((v) => ({ value: v, label: fI(v) })), value: st.n, onChange: (v) => { st.n = v; pre.set(null); update(); } });
    const tS = GG.ui.slider(f.controls, { label: 'Measured run time', min: 0.05, max: 500, log: true, step: 0.01, value: st.ms, format: (v) => (v < 1 ? v.toFixed(2) : v < 10 ? v.toFixed(2) : v.toFixed(1)) + ' ms', onInput: (v) => { st.ms = v; pre.set(null); update(); } });
    function update() {
      const fl = 2 * st.n ** 3, ach = fl / (st.ms / 1000);
      view.redraw();
      sF.set(GG.fmt.sig(fl / 1e12, 4) + ' T');
      sA.set(perf(ach));
      const u32 = ach / 66.9e12, u16 = ach / 989e12, TF32 = 494.7e12; // TF32: dense H100 SXM Tensor Core peak, NVIDIA whitepaper
      let w = `2 × ${fI(st.n)}³ = ${GG.fmt.sig(fl / 1e12, 4)} trillion FLOPs in ${GG.fmt.sig(st.ms, 3)} ms is <b>${perf(ach)}</b>. `;
      if (u16 > 1) w += `That is faster than every peak in this figure, including the Tensor Cores' 989 TFLOPS for dense BF16, so a dense FP32 or BF16 matmul cannot have done it: <b>the measurement is wrong</b>. Check the timing (for example, a timer stopped before the kernel finished because nothing synchronized with the GPU), or check that the kernel really did all 2<i>N</i>³ FLOPs.`;
      else if (u32 > 1) {
        const uTf = ach / TF32;
        w += `That is more than the FP32 CUDA Cores' 66.9 TFLOPS speed of light, so this cannot be plain FP32 on the CUDA Cores. ${ach > 133.8e12 ? 'It is also above 133.8 TFLOPS, the CUDA Cores\' peak even for half precision, so ' : 'A half-precision kernel could in principle get this far on the CUDA Cores, whose FP16 and BF16 peak is 133.8 TFLOPS, but '}a matmul this fast is almost certainly running on the Tensor Cores. Which Tensor Core peak to divide by depends on the input type. `;
        w += uTf > 1
          ? `FP32 inputs can only use the Tensor Cores as TF32, whose dense peak is about 495 TFLOPS, and this rate is above it: if the inputs really were FP32, the measurement is wrong. If they were BF16, against the 989 TFLOPS BF16 peak it reaches <b>${fmtU(u16)}</b>.`
          : `If the inputs were FP32, the Tensor Cores ran them as TF32, whose dense peak is about 495 TFLOPS: that is <b>${fmtU(uTf)}</b>. If they were BF16, the peak is 989 TFLOPS and the same run is <b>${fmtU(u16)}</b>.`;
      }
      else w += `On the FP32 CUDA Cores that is <b>${fmtU(u32)}</b> of peak; measured against the Tensor Cores' 989 TFLOPS it would look like only ${fmtU(u16)}. Same run, very different verdicts: divide by the peak of the pipe the kernel uses.`;
      f.setWhy(w);
    }
    update();
  }

  /* ═════════════════════════ ISSUE EFFICIENCY ═════════════════════════ */

  const CYC = () => GG.components && GG.components.cycles;

  GG.entry('issue-efficiency', {
    render(body, ctx) {
      const s = ctx.html(body, `
<p><strong>Issue efficiency</strong> measures how effectively the <a data-term="warp-scheduler">warp scheduler</a> keeps the execution pipes busy by issuing instructions from <a data-term="warp-execution-state">eligible warps</a>.</p>
<p>Every clock cycle, each warp scheduler looks over its <em>active</em> warps: the warps resident on its part of the SM. A warp whose next instruction can run right now is <em>eligible</em>. A warp that is waiting (for data from memory, for a busy unit, for an earlier instruction to finish) is <em>stalled</em>. From the eligible warps the scheduler <em>selects</em> one and issues its next instruction into the pipe for that instruction's type. If no warp is eligible, nothing issues and that cycle's issue slot goes to waste. Issue efficiency is the share of cycles on which the slot was filled.</p>
<div class="pfc-eq" role="math" aria-label="issue efficiency equals cycles on which the scheduler issued an instruction divided by scheduler-active cycles"><span class="pfc-eq-l">issue efficiency</span><span class="pfc-eq-op">=</span><span class="pfc-frac"><span>cycles on which the scheduler issued an instruction</span><span>scheduler-active cycles</span></span><small>per warp scheduler; an SM has four of them. A <em>scheduler-active cycle</em> is one on which that scheduler has at least one active warp, eligible or stalled. It is the <a data-term="active-cycle">active cycle</a> idea applied to one of the SM's four sub-partitions: an active cycle proper is counted for the whole SM, and needs a warp resident anywhere on it. (Nsight Compute draws the same line: its <code>sm__</code> metrics count the SM's active cycles, its <code>smsp__</code> metrics those of each SM sub-partition.) With no active warps at all there are no scheduler-active cycles, and issue efficiency is undefined.</small></div>
<div data-slot="f1"></div>
<p>Of the four clock cycles in Fig.&nbsp;1, instructions were issued on three, for an issue efficiency of 3&nbsp;÷&nbsp;4&nbsp;=&nbsp;<b>75%</b>. On cycle <i>n</i> two warps were eligible and the scheduler picked slot 3's <code>EX2</code>. On <i>n</i>&nbsp;+&nbsp;1 the <code>RET</code> in slot 4 got its turn. On <i>n</i>&nbsp;+&nbsp;2 every active warp was stalled and slot 4 was empty (its warp had just exited), so nothing could issue. On <i>n</i>&nbsp;+&nbsp;3 the <code>LDS</code> in slot 2 finally became eligible and issued. Meanwhile a new warp has taken over slot 4; its first instruction, an <code>LDG</code>, is stalled. All four cycles had at least one active warp, so all four are active cycles; with only this one scheduler drawn, they are also its scheduler-active cycles. The diagram is inspired by the <a href="https://www.nvidia.com/en-us/on-demand/session/gtc25-s72685/"><i>CUDA Techniques to Maximize Compute and Instruction Throughput</i></a> talk at GTC 2025.</p>
<h3>100%, and less</h3>
<p>An issue efficiency of <b>100%</b> means every <a data-term="warp-scheduler">scheduler</a> issued an instruction on every cycle. That requires at least one <a data-term="warp-execution-state">eligible warp</a> on each cycle. Values <b>below 100%</b> signal that, during some cycles, all <a data-term="warp-execution-state">active warps</a> were <a data-term="warp-execution-state">stalled</a>, waiting on data, resources, or dependencies, so the scheduler sat idle and overall instruction throughput fell.</p>
<p>The usual cure is to give the scheduler more warps to choose from, so that while some wait, others are ready: <a data-term="latency-hiding">latency hiding</a>. Fig.&nbsp;2 simulates one scheduler whose warps alternate short arithmetic instructions with loads that take several cycles. Slide the number of active warps down and watch empty issue slots appear.</p>
<div data-slot="f2"></div>
<p>The curve has a simple shape. Each warp can issue a few instructions in a row, then waits out the load. If a warp issues <i>k</i> instructions per round and a round lasts <i>k</i>&nbsp;−&nbsp;1&nbsp;+&nbsp;<i>L</i> cycles (the load's latency <i>L</i>, plus the cycles spent on the other instructions), then <i>W</i> warps can fill at most <i>W</i>&nbsp;×&nbsp;<i>k</i> of those cycles, and the scheduler is fully busy once <i>W</i>&nbsp;≥&nbsp;(<i>k</i>&nbsp;−&nbsp;1&nbsp;+&nbsp;<i>L</i>)&nbsp;÷&nbsp;<i>k</i>. That is <a data-term="littles-law">Little's law</a> at work: the concurrency you need is the latency times the throughput you want. It is also why <a data-term="occupancy">occupancy</a>, the number of warps an SM keeps resident, matters.</p>
<h3>Every scheduler, every cycle</h3>
<p>An H100 SM has four warp schedulers, one per sub-partition, and each picks from its own warps. When all four have warps, "100%" means all four issued on every cycle, so the SM as a whole issued four instructions per cycle. A scheduler that is short of eligible warps leaves its own slots empty even when its neighbours are busy. Each scheduler is measured over its own scheduler-active cycles, so a scheduler with no warps at all is left out rather than counted as idle. Divide instead by the SM's <a data-term="active-cycle">active cycles</a>, four issue slots on each, and its empty slots count against the SM too.</p>
<div data-slot="f3"></div>
${GG.noteHTML('beyond', '<p><b>Where to read it.</b> Nsight Compute\'s <i>Scheduler Statistics</i> section reports, per scheduler, the average number of active and eligible warps, the share of cycles with no eligible warp ("No Eligible") and with at least one ("One or More Eligible"), and the instructions issued per cycle ("Issued Warp Per Scheduler"). The <i>Warp State Statistics</i> section then says why warps were stalled, for example on a <a data-term="scoreboard-stall">scoreboard</a>.</p><p><b>Not the same as pipe utilization.</b> Issue efficiency asks whether the scheduler issued <em>anything</em> on a cycle. <a data-term="pipe-utilization">Pipe utilization</a> asks how close each individual pipe came to its own peak. A scheduler can issue on every cycle while a slow pipe is saturated and the others idle.</p>')}
<div data-slot="reading"></div>`);
      guard(() => ieFig1(ctx, s.f1));
      guard(() => ieFig2(ctx, s.f2));
      guard(() => ieFig3(ctx, s.f3));
      ctx.reading(s.reading, [
        { href: 'https://www.nvidia.com/en-us/on-demand/session/gtc25-s72685/', label: 'GTC 2025: CUDA Techniques to Maximize Compute and Instruction Throughput', note: 'the talk that inspired the glossary\'s diagram' },
        { href: 'https://docs.nvidia.com/nsight-compute/ProfilingGuide/index.html', label: 'Nsight Compute Kernel Profiling Guide', note: 'Scheduler Statistics and Warp State Statistics (Beyond the glossary)' },
      ]);
    },
  });

  function ieFig1(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Four cycles, three issued', hint: 'play, step, or hover a box', wide: true,
      caption: 'One warp scheduler with four warp slots over four clock cycles, redrawn from the glossary\'s diagram, which is inspired by the <a href="https://www.nvidia.com/en-us/on-demand/session/gtc25-s72685/"><i>CUDA Techniques to Maximize Compute and Instruction Throughput</i></a> talk at GTC 2025. Each box is a warp\'s next instruction: amber stalled, blue eligible, pink the one selected and issued. The trays below are the issue slots. Cycles that issued are tinted; the idle one is marked red.',
    });
    CYC()(f, { mode: 'issue', animate: true });
  }

  function ieFig2(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Fewer warps, emptier issue slots', hint: 'drag the sliders · hover a box', wide: true,
      caption: 'A simulated warp scheduler over 32 cycles. Every warp repeats the same pattern: a few one-cycle <code>FFMA</code>s, then an <code>LDG</code> whose result its next instruction needs, so after the load the warp is stalled until the latency has passed. The scheduler issues at most one instruction per cycle, preferring the warp it issued from last. The grid has one row per active warp (at least four). The chart underneath plots issue efficiency against the number of active warps: dots are measured over these 32 cycles (start-up included), the dashed line is the steady-state value, and the ring marks the grid above.',
    });
    const st = { warps: 3, latency: 8, every: 2 };
    const SLOTS = 12, CYCLES = 32;
    const C0 = CYC();
    let cy = null;
    // the grid draws one row per active warp (at least 4), so a few warps are not lost among empty rows;
    // the chart's x-axis still runs 1 … SLOTS
    const P = () => ({ warps: st.warps, latency: st.latency, issueEvery: st.every, slots: Math.max(st.warps, 4), cycles: CYCLES, ops: { long: 'LDG', short: 'FFMA' } });
    const steady = (wn) => Math.min(1, (wn * st.every) / (st.every - 1 + st.latency));
    const need = () => Math.ceil((st.every - 1 + st.latency) / st.every);
    function whyTxt() {
      const M = C0.metrics(C0.simulate(P()));
      const per = st.every - 1 + st.latency, n = need();
      const ie = M.issueEfficiency;
      let t = `<b>${st.warps} active ${plural(st.warps, 'warp')}</b>; each issues ${st.every} ${plural(st.every, 'instruction')} per round of ${per} cycles (${st.every - 1} ${plural(st.every - 1, 'FFMA')} + an LDG with ${st.latency}-cycle latency). Issue efficiency over these ${CYCLES} cycles: <b>${pct(ie, 1)}</b>`;
      if (st.warps === 0) return 'With no active warps there is nothing to issue: no cycle is active, so issue efficiency is undefined.';
      if (st.warps >= n) t += `. With at least ${n} warps, one is eligible on every cycle once things get going; the rest of the latency is hidden.`;
      else t += `, heading for ${st.warps} × ${st.every} ÷ ${per} = ${pct(steady(st.warps), 1)} in steady state. On the red cycles every warp is stalled. ${n} warps would hide the latency completely.`;
      return t;
    }
    cy = C0(f, { simulate: P(), mode: 'issue', simControls: false, showReadouts: false, why: (info) => (info && info.cell ? null : whyTxt()) });
    const sAc = stat(f, 'Active cycles', 'core');
    const sIe2 = stat(f, 'Issue efficiency', 'special');
    const sEl = stat(f, 'Eligible warps / cycle', 'memory');
    function chips() {
      const M = C0.metrics(C0.simulate(P()));
      sAc.set(`${M.activeCycles} / ${CYCLES}`);
      sIe2.set(M.activeCycles ? `${M.issuedCycles}/${M.activeCycles} · ${pct(M.issueEfficiency, 1)}` : '—');
      sEl.set(M.activeCycles ? M.eligibleAvg.toFixed(2) : '—');
    }
    chips();
    const box = GG.el('div', { style: 'margin-top:14px' });
    f.stage.append(box);
    const chart = rsvg(box, 'Issue efficiency against the number of active warps, measured and steady-state.', (svg, w) => {
      const mob = w < 640;
      const padL = mob ? 34 : 44, padR = 10, top = 10, h = mob ? 130 : 150, bot = 30;
      const X = (k) => padL + ((k - 1) / (SLOTS - 1)) * (w - padL - padR);
      const Y = (v) => top + (1 - v) * h;
      [0, 0.25, 0.5, 0.75, 1].forEach((v) => {
        Ln(svg, padL, Y(v), w - padR, Y(v), 'stroke:var(--line);stroke-width:1');
        Tx(svg, padL - 6, Y(v) + 3.5, pct(v, 0), { fs: 9.5, anchor: 'end', fill: 'var(--ink-3)' });
      });
      for (let k = 1; k <= SLOTS; k++) Tx(svg, X(k), top + h + 15, String(k), { fs: 9.5, anchor: 'middle', fill: k === st.warps ? 'var(--ink)' : 'var(--ink-3)', weight: k === st.warps ? 600 : null });
      Tx(svg, (padL + w - padR) / 2, top + h + 28, 'active warps', { fs: 9.5, anchor: 'middle', fill: 'var(--ink-3)' });
      const n = need();
      if (n <= SLOTS) {
        Ln(svg, X(n), top, X(n), top + h, 'stroke:var(--core);stroke-width:1;stroke-dasharray:3 3');
        Tx(svg, X(n) + (X(n) > w - 120 ? -4 : 4), top + 11, `${n} warps hide it`, { fs: 9.5, anchor: X(n) > w - 120 ? 'end' : 'start', fill: 'var(--core)' });
      }
      let d = '';
      for (let k = 1; k <= SLOTS; k++) d += (k === 1 ? 'M' : 'L') + r2(X(k)) + ',' + r2(Y(steady(k)));
      Pa(svg, d, 'fill:none;stroke:var(--ink-3);stroke-width:1.5;stroke-dasharray:5 4');
      for (let k = 1; k <= SLOTS; k++) {
        const m = C0.metrics(C0.simulate(Object.assign(P(), { warps: k, slots: Math.max(k, 4) }))).issueEfficiency;
        C(svg, X(k), Y(m), k === st.warps ? 5.5 : 3.5, `fill:var(--special)`);
        if (k === st.warps) {
          C(svg, X(k), Y(m), 9, 'fill:none;stroke:var(--ink);stroke-width:1.5');
          const lab = pct(m, 1);
          Tx(svg, clamp(X(k), padL + 20, w - padR - 20), Y(m) > top + 30 ? Y(m) - 14 : Y(m) + 22, lab, { fs: 11, anchor: 'middle', fill: 'var(--ink)', weight: 600 });
        }
      }
      return top + h + bot + 4;
    });
    function rerun() { cy.simulate(P()); chart.redraw(); chips(); }
    GG.ui.slider(f.controls, { label: 'Active warps', min: 0, max: SLOTS, step: 1, value: st.warps, format: (v) => String(v), onInput: (v) => { st.warps = v; rerun(); } });
    GG.ui.slider(f.controls, { label: 'LDG latency', min: 2, max: 24, step: 1, value: st.latency, format: (v) => v + ' cycles', onInput: (v) => { st.latency = v; rerun(); } });
    GG.ui.slider(f.controls, { label: 'Instructions per round', min: 1, max: 6, step: 1, value: st.every, format: (v) => (v === 1 ? '1 (LDG only)' : `${v} (${v - 1} FFMA + LDG)`), onInput: (v) => { st.every = v; rerun(); } });
  }

  /* Fig: four schedulers of one SM, each with its own warps. */
  function ieFig3(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Four schedulers, one SM', hint: 'change the warps on the SM', wide: true,
      caption: 'The four warp schedulers of one SM over 32 cycles, each simulated like Fig.&nbsp;2 (every warp issues one <code>FFMA</code> and then an <code>LDG</code> whose result it waits for). The SM\'s active warps are spread as evenly as possible over the four schedulers. A pink tick is an issued instruction, a red gap an idle issue slot on a scheduler-active cycle; a scheduler with no warps has no scheduler-active cycles (dashed) and is left out of the issue efficiency, which is issued cycles ÷ scheduler-active cycles summed over the schedulers. (With at least one warp anywhere on it, the SM itself is active on every one of these cycles.) The strip at the bottom counts how many of the four issued on each cycle: the SM\'s instructions per cycle, at most 4.',
    });
    const C0 = CYC();
    const st = { warps: 14, latency: 8 };
    const NC = 32;
    function sims() {
      const out = [];
      for (let q = 0; q < 4; q++) {
        const wq = Math.floor(st.warps / 4) + (q < st.warps % 4 ? 1 : 0);
        const sc = C0.simulate({ warps: wq, slots: Math.max(1, wq), latency: st.latency, issueEvery: 2, cycles: NC, ops: { long: 'LDG', short: 'FFMA' } });
        const M = C0.metrics(sc);
        out.push({ wq, issued: M.issued.map((x) => !!x), nIss: M.issuedCycles, nAct: M.activeCycles, ie: M.activeCycles ? M.issueEfficiency : null });
      }
      return out;
    }
    let S = sims();
    const view = rsvg(f.stage, 'Four rows of issue slots, one per warp scheduler, over 32 cycles, with a strip counting issues per cycle.', (svg, w) => {
      const mob = w < 640;
      const padL = mob ? 52 : 118, padR = mob ? 40 : 56, top = 18, rh = mob ? 22 : 28, gap = 6;
      const cw = (w - padL - padR) / NC;
      for (let c = 0; c < NC; c += mob ? 8 : 4) Tx(svg, padL + c * cw + cw / 2, top - 6, String(c), { fs: 9.5, anchor: 'middle', fill: 'var(--ink-3)' });
      Tx(svg, padL - 8, top - 6, 'cycle', { fs: 9.5, anchor: 'end', fill: 'var(--ink-3)' });
      S.forEach((q, i) => {
        const y = top + i * (rh + gap);
        Tx(svg, padL - 8, y + rh / 2 + (mob ? -1 : -2), mob ? 'sched ' + i : 'scheduler ' + i, { fs: mob ? 9.5 : 11, anchor: 'end', fill: 'var(--control)' });
        Tx(svg, padL - 8, y + rh / 2 + (mob ? 9 : 11), `${q.wq} ${plural(q.wq, 'warp')}`, { fs: 9, anchor: 'end', fill: 'var(--ink-3)' });
        for (let c = 0; c < NC; c++) {
          const x = padL + c * cw;
          if (q.issued[c]) R(svg, x + 0.75, y, cw - 1.5, rh, 'fill:var(--special)', { rx: 2 });
          else if (!q.wq) R(svg, x + 0.75, y, cw - 1.5, rh, 'fill:none;stroke:var(--line);stroke-dasharray:2 3', { rx: 2 });
          else R(svg, x + 0.75, y, cw - 1.5, rh, 'fill:var(--danger-a);stroke:rgba(255,91,110,.55);stroke-width:1', { rx: 2 });
        }
        if (!q.wq) Tx(svg, padL + (NC * cw) / 2, y + rh / 2 + 4, mob ? 'no warps: never active' : 'no warps: no scheduler-active cycles, left out of issue efficiency', { fs: mob ? 9 : 10, anchor: 'middle', fill: 'var(--ink-3)' });
        Tx(svg, w, y + rh / 2 + 4, q.ie == null ? '—' : pct(q.ie, 0), { fs: mob ? 10.5 : 12, anchor: 'end', fill: q.ie != null && q.ie >= 0.999 ? 'var(--core)' : 'var(--ink)', weight: 600 });
      });
      const yb = top + 4 * (rh + gap) + 10, bh = mob ? 34 : 44;
      Tx(svg, padL - 8, yb + bh / 2 + 4, mob ? 'IPC' : 'issued (of 4)', { fs: mob ? 9.5 : 10.5, anchor: 'end', fill: 'var(--ink-2)' });
      R(svg, padL, yb, NC * cw, bh, 'fill:rgba(8,9,14,.5);stroke:var(--line)', { rx: 3 });
      for (let k = 1; k < 4; k++) Ln(svg, padL, yb + bh - (k * bh) / 4, padL + NC * cw, yb + bh - (k * bh) / 4, 'stroke:var(--line);stroke-dasharray:2 3');
      for (let c = 0; c < NC; c++) {
        const n = S.filter((q) => q.issued[c]).length;
        if (n) R(svg, padL + c * cw + 1, yb + bh - (n * bh) / 4, cw - 2, (n * bh) / 4, n === 4 ? 'fill:var(--core)' : 'fill:var(--special);opacity:.75', { rx: 1.5 });
      }
      Tx(svg, w, yb + 10, '4', { fs: 9, anchor: 'end', fill: 'var(--ink-3)' });
      Tx(svg, w, yb + bh, '0', { fs: 9, anchor: 'end', fill: 'var(--ink-3)' });
      return yb + bh + 4;
    });
    const sIe = stat(f, 'SM issue efficiency', 'special');
    const sIpc = stat(f, 'Instructions / cycle', 'core');
    GG.ui.slider(f.controls, { label: 'Active warps on the SM', min: 0, max: 32, step: 1, value: st.warps, format: (v) => String(v), onInput: (v) => { st.warps = v; update(); } });
    GG.ui.slider(f.controls, { label: 'LDG latency', min: 2, max: 24, step: 1, value: st.latency, format: (v) => v + ' cycles', onInput: (v) => { st.latency = v; update(); } });
    function update() {
      S = sims();
      view.redraw();
      // SM issue efficiency: issued cycles over scheduler-active cycles, summed over the schedulers that have warps
      const act = S.reduce((a, q) => a + q.nAct, 0);
      const avg = act ? S.reduce((a, q) => a + q.nIss, 0) / act : null;
      const ipc = S.reduce((a, q) => a + q.issued.filter(Boolean).length, 0) / NC;
      sIe.set(avg == null ? '—' : pct(avg, 1)); sIpc.set(ipc.toFixed(2));
      const idleQ = S.filter((q) => !q.wq).length;
      const need = Math.ceil((1 + st.latency) / 2);
      const counts = S.map((q) => q.wq);
      const short = counts.filter((c) => c && c < need).length;
      let t;
      if (!st.warps) t = 'No warps, no instructions: every issue slot is empty. No scheduler has a scheduler-active cycle (nor does the SM have an active cycle), so issue efficiency is undefined (—) and the SM issues 0 instructions per cycle.';
      else if (counts.every((c) => c >= need)) t = `Each scheduler has at least ${need} warps, enough to cover the ${st.latency}-cycle latency, so all four issue on (nearly) every cycle: <b>${ipc.toFixed(2)} instructions per cycle</b> for the SM, out of 4.`;
      else t = `The schedulers hold ${counts.join(', ')} warps. Each needs ${need} to hide ${/^(8|11|18)$/.test(String(st.latency)) ? 'an' : 'a'} ${st.latency}-cycle load when its warps issue two instructions per round, so ${short === 4 ? 'all four leave' : short === 4 - idleQ ? (short === 1 ? 'the one scheduler with warps leaves' : short === 2 ? 'both schedulers with warps leave' : `all ${short} schedulers with warps leave`) : 'the ones with fewer leave'} issue slots empty. Over the scheduler-active cycles of the ${idleQ ? 4 - idleQ + ' schedulers that have warps' : 'four schedulers'}, issue efficiency is <b>${pct(avg, 1)}</b>, and the SM issues ${ipc.toFixed(2)} instructions per cycle of a possible 4.${idleQ ? ` ${idleQ === 1 ? 'The scheduler' : `The ${idleQ} schedulers`} with no warps ${idleQ === 1 ? 'has' : 'have'} no scheduler-active cycles, so ${idleQ === 1 ? 'it is' : 'they are'} left out of issue efficiency, but ${idleQ === 1 ? 'it still issues' : 'they still issue'} nothing: that shows up in the SM's instructions per cycle. The SM itself has a warp on all ${NC} cycles, so all ${NC} are <a data-term="active-cycle">active cycles</a>; measured against them, four issue slots each, the idle ${idleQ === 1 ? 'scheduler\'s' : 'schedulers\''} empty slots would count too, and the SM would score ${pct(ipc / 4, 1)}.` : ''}`;
      f.setWhy(t);
    }
    update();
  }

  /* ═════════════════════════ SM UTILIZATION ═════════════════════════ */

  GG.entry('streaming-multiprocessor-utilization', {
    render(body, ctx) {
      const s = ctx.html(body, `
<p><strong>SM utilization</strong> measures the percentage of time that <a data-term="streaming-multiprocessor">Streaming Multiprocessors (SMs)</a> are executing instructions. Add up, over every SM, the time it spent running a <a data-term="kernel">kernel</a>, and divide by the time it could have spent: the number of SMs times the elapsed time.</p>
<div class="pfc-eq" role="math" aria-label="SM utilization equals the sum over SMs of busy time divided by the number of SMs times elapsed time"><span class="pfc-eq-l">SM utilization</span><span class="pfc-eq-op">=</span><span class="pfc-frac"><span>Σ over SMs of time spent executing kernels</span><span>number of SMs × elapsed time</span></span><small>an H100 SXM has 132 SMs, so each SM is worth 1/132 ≈ 0.76% of the total</small></div>
<h3>Finer-grained than GPU utilization</h3>
<p>SM utilization is akin to the more familiar <a href="https://modal.com/blog/gpu-utilization-guide">kernel utilization</a> reported by <a data-term="nvidia-smi"><code>nvidia-smi</code></a> (often just called "GPU utilization"), but more fine-grained. GPU utilization reports the fraction of time that a kernel is executing <em>anywhere</em> on the GPU. SM utilization reports the fraction of time <em>all</em> SMs spend executing kernels.</p>
<p>The difference is easy to see with a small kernel. If a kernel uses only one SM, for example because it has only one <a data-term="thread-block">thread block</a>, it achieves 100% GPU utilization while it is active: a kernel is running the whole time. But its SM utilization is at most one over the number of SMs: 1&nbsp;÷&nbsp;132&nbsp;≈&nbsp;0.76% on an H100, under 1%. The other 131 SMs have nothing to do. Fig.&nbsp;1 starts with exactly that kernel; give it more blocks.</p>
<div data-slot="f1"></div>
<div data-slot="nums"></div>
${GG.noteHTML('beyond', '<p><b>What <code>nvidia-smi</code> measures.</b> Its "GPU-Util" column comes from NVML, which defines it as the percentage of time over the past sample period during which one or more kernels was executing on the GPU. One busy SM is enough to count.</p><p><b>About the model in Fig.&nbsp;1.</b> To keep the picture readable, every block takes the same time and each block fills an SM by itself, as a block does when it needs all of an SM\'s shared memory or registers. Blocks are then handed out in "waves" of up to 132, and a last, partial wave leaves SMs idle: 133 blocks need two waves, and SM utilization drops to 133&nbsp;÷&nbsp;264&nbsp;≈&nbsp;50%. On real GPUs an SM can hold several smaller blocks at once (up to 32), and blocks finish at different times, which blurs the waves without removing the effect.</p>')}
<h3>It should be high</h3>
<p><a href="https://modal.com/blog/gpu-utilization-guide">As with GPU utilization but unlike CPU utilization</a>, SM utilization should be high, even up to 100%. A GPU is a throughput machine: an SM that is not running a kernel is hardware you are paying for and not using.</p>
${GG.noteHTML('beyond', '<p><b>Why CPUs are different.</b> A CPU server usually runs many independent tasks and has to answer each one quickly. As its cores approach 100% busy, newly arriving work has to wait in line, so operators keep headroom and treat very high CPU utilization as a warning sign. GPU work is mostly batched: the aim is to finish a large amount of it as fast as possible, and idle SMs are simply lost throughput. Fig.&nbsp;2 puts the two side by side.</p>')}
<div data-slot="f3"></div>
<h3>Busy SMs are not the end of the story</h3>
<p>Even though SM utilization is finer-grained than GPU utilization, it still isn't fine-grained enough to capture how well the GPU's compute resources are being used. An SM counts as busy while it is running the kernel's warps, even if those warps spend most of their cycles stalled. If SM utilization is high but performance is still inadequate, check <a data-term="pipe-utilization">pipe utilization</a>, which measures how effectively each SM uses its internal functional units. High SM utilization with low pipe utilization means the kernel is running on many SMs but not fully using the computational resources within each one. Fig.&nbsp;3 shows the difference.</p>
${GG.noteHTML('check', '<p><b>"Executing instructions", in practice.</b> The glossary\'s first sentence defines SM utilization as the share of time SMs "are executing instructions"; its second paragraph calls it the fraction of time SMs "spend executing kernels". Measurements follow the second reading. An SM counts as busy on every <a data-term="active-cycle">active cycle</a>, any cycle on which it has at least one active warp resident, whether that warp is <a data-term="warp-execution-state">eligible or stalled</a>. So an SM whose warps are all waiting on memory still counts as fully used, which is how SM utilization can read 100% while the pipes inside sit nearly idle.</p>')}
<div data-slot="f2"></div>
<div data-slot="reading"></div>`);
      guard(() => smuFig1(ctx, s.f1));
      ctx.numbers(s.nums, [
        { value: '100%', label: 'GPU utilization of a one-block kernel while it runs', tone: 'core' },
        { value: '0.76%', label: 'its SM utilization at most: 1 of 132 SMs', tone: 'danger' },
        { value: '132', label: 'SMs on an H100 SXM; each is 1/132 of the total', tone: 'ink' },
      ]);
      guard(() => smuCpuGpu(ctx, s.f3));
      guard(() => smuFig2(ctx, s.f2));
      ctx.reading(s.reading, [
        { href: 'https://modal.com/blog/gpu-utilization-guide', label: 'Modal: the GPU utilization guide', note: 'kernel utilization, and why GPU and SM utilization should be high, unlike CPU utilization' },
      ]);
    },
  });

  /* Fig: a kernel of B blocks launched three times, with host gaps. 132 SM tiles + timeline. */
  function smuFig1(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'GPU utilization vs SM utilization', hint: 'choose the number of blocks · add host gaps', wide: true,
      caption: 'The same kernel launched three times on an H100\'s 132 SMs. Top: the SMs at the moment under the playhead, lit while they run a block. Bottom: the timeline. The upper track is what GPU utilization counts, any kernel running at all; the lower track is how many of the 132 SMs are busy, which is what SM utilization averages. Time is measured in block durations: in this model every block takes one unit and occupies a whole SM (see the note below the figure).',
    });
    const st = { blocks: 1, gap: 0 };
    const NSM = 132, LAUNCH = 3;
    const model = () => {
      const waves = Math.max(1, Math.ceil(st.blocks / NSM));
      const D = waves;
      const gapT = st.gap >= 1 ? 0 : (D * st.gap) / (1 - st.gap);
      const per = D + gapT;
      return { waves, D, gapT, per, T: per * LAUNCH, gpu: D / per, sm: (st.blocks / (NSM * waves)) * (D / per) };
    };
    const busyAt = (m, t) => {
      const tp = t % m.per;
      if (tp >= m.D) return 0;
      const k = Math.floor(tp);
      return clamp(st.blocks - k * NSM, 0, NSM);
    };
    let geo = null, M = model();
    const view = rsvg(f.stage, 'A grid of 132 SM tiles above a timeline of three kernel launches, showing when any kernel runs and how many SMs are busy.', (svg, w) => {
      const mob = w < 640;
      const cols = 22, rowsN = Math.ceil(NSM / cols);
      const cell = mob ? w / cols : Math.min(40, (w - 180) / cols);
      const gx = mob ? (w - cols * cell) / 2 : 0, gy = 6;
      const tiles = [];
      for (let k = 0; k < NSM; k++) {
        const x = gx + (k % cols) * cell, y = gy + Math.floor(k / cols) * cell;
        tiles.push(R(svg, x + 1, y + 1, cell - 2, cell - 2, 'fill:#2a2e44', { rx: 2.5 }));
        if (!mob && cell >= 28) Tx(svg, x + cell / 2, y + cell / 2 + 3.5, String(k), { fs: 9, anchor: 'middle', fill: 'var(--ink-3)', pe: false });
      }
      const gh = rowsN * cell;
      let nowTxt = null;
      if (!mob) {
        const sx = gx + cols * cell + 18;
        Tx(svg, sx, gy + 16, 'SMs BUSY NOW', { fs: 10, fill: 'var(--ink-3)', ls: '0.08em' });
        nowTxt = Tx(svg, sx, gy + 50, '', { fs: 30, fill: 'var(--core)', weight: 700 });
        Tx(svg, sx, gy + 70, 'of 132', { fs: 11, fill: 'var(--ink-2)' });
      }
      // timeline
      const ty = gy + gh + (mob ? 48 : 26);
      if (mob) nowTxt = Tx(svg, w / 2, gy + gh + 18, '', { fs: 11, anchor: 'middle', fill: 'var(--core)', weight: 600 });
      const padL = mob ? 0 : 150, tw0 = w - padL;
      const X = (t) => padL + (t / M.T) * tw0;
      const kH = 22, sH = mob ? 54 : 70;
      Tx(svg, mob ? 0 : padL - 10, mob ? ty - 4 : ty + 15, mob ? 'kernel running? (GPU utilization)' : 'kernel running?', { fs: mob ? 9.5 : 11, anchor: mob ? 'start' : 'end', fill: 'var(--ink-2)' });
      if (!mob) Tx(svg, padL - 10, ty + 29, 'GPU utilization', { fs: 9, anchor: 'end', fill: 'var(--ink-3)' });
      R(svg, padL, ty, tw0, kH, 'fill:rgba(255,255,255,.03);stroke:var(--line)', { rx: 3 });
      for (let L = 0; L < LAUNCH; L++) {
        R(svg, X(L * M.per) + 0.5, ty + 2, Math.max(1, X(L * M.per + M.D) - X(L * M.per) - 1), kH - 4, 'fill:var(--core);opacity:.85', { rx: 2 });
        if (M.gapT > 0 && X(L * M.per + M.per) - X(L * M.per + M.D) > 70) Tx(svg, (X(L * M.per + M.D) + X((L + 1) * M.per)) / 2, ty + 15, 'host gap', { fs: 9.5, anchor: 'middle', fill: 'var(--ink-3)' });
      }
      const sy = ty + kH + (mob ? 26 : 12);
      Tx(svg, mob ? 0 : padL - 10, mob ? sy - 4 : sy + 15, mob ? 'SMs busy, of 132 (SM utilization)' : 'SMs busy', { fs: mob ? 9.5 : 11, anchor: mob ? 'start' : 'end', fill: 'var(--ink-2)' });
      if (!mob) Tx(svg, padL - 10, sy + 29, 'SM utilization', { fs: 9, anchor: 'end', fill: 'var(--ink-3)' });
      R(svg, padL, sy, tw0, sH, 'fill:rgba(255,255,255,.03);stroke:var(--line)', { rx: 3 });
      Ln(svg, padL, sy + 0.5, padL + tw0, sy + 0.5, 'stroke:var(--line-2);stroke-dasharray:2 3');
      let d = `M${r2(padL)},${r2(sy + sH)}`;
      for (let L = 0; L < LAUNCH; L++) {
        for (let k = 0; k < M.waves; k++) {
          const n = clamp(st.blocks - k * NSM, 0, NSM);
          const y = sy + sH - (n / NSM) * (sH - 1);
          const x0 = X(L * M.per + k), x1 = X(L * M.per + k + 1);
          d += `L${r2(x0)},${r2(y)}L${r2(x1)},${r2(y)}`;
        }
        d += `L${r2(X(L * M.per + M.D))},${r2(sy + sH)}L${r2(X((L + 1) * M.per))},${r2(sy + sH)}`;
      }
      Pa(svg, d + 'Z', 'fill:var(--core-a);stroke:var(--core);stroke-width:1.5');
      Tx(svg, padL + tw0 - 4, sy + 11, '132', { fs: 9, anchor: 'end', fill: 'var(--ink-3)' });
      const axY = sy + sH + 14;
      const step = M.T > 40 ? 10 : M.T > 16 ? 5 : M.T > 6 ? 2 : 1;
      for (let t = 0; t <= M.T + 1e-9; t += step) { if (X(t) > w - 6 && t > 0) break; Tx(svg, X(t), axY, String(t), { fs: 9, anchor: t === 0 ? 'start' : 'middle', fill: 'var(--ink-3)' }); }
      Tx(svg, w, axY + 14, 'time, in block durations', { fs: 9, anchor: 'end', fill: 'var(--ink-3)' });
      // on phones the track labels sit above each track, so the playhead is drawn in two pieces that skip them
      const heads = mob
        ? [Ln(svg, padL, ty - 1, padL, ty + kH + 1, 'stroke:var(--ink);stroke-width:1.5'), Ln(svg, padL, sy - 1, padL, sy + sH + 2, 'stroke:var(--ink);stroke-width:1.5')]
        : [Ln(svg, padL, ty - 6, padL, sy + sH + 2, 'stroke:var(--ink);stroke-width:1.5')];
      // the thin-line annotation sits on an opaque pill drawn after the playhead, so the moving line passes behind it
      if (st.blocks <= 6) {
        const lab = `${st.blocks} of 132 SMs: ${st.blocks === 1 ? 'a line this thin' : 'this thin'}`;
        const ax = padL + 6, ay = sy + sH - 8;
        R(svg, ax - 4, ay - 10.5, tw(lab, 9.5) + 8, 14.5, 'fill:var(--surface-2);stroke:rgba(69,212,155,.35);stroke-width:1', { rx: 3 });
        Tx(svg, ax, ay, lab, { fs: 9.5, fill: 'var(--core)', pe: false });
      }
      geo = { tiles, heads, X, nowTxt, mob };
      return axY + 18;
    }, () => { lastN = -1; paintAt(anim.running || anim.time ? anim.time * SPEED() : 0.5); });
    let lastN = -1;
    function paintAt(t) {
      if (!geo) return;
      const tt = t % M.T;
      const x = geo.X(tt);
      geo.heads.forEach((hd) => { hd.setAttribute('x1', r2(x)); hd.setAttribute('x2', r2(x)); });
      const n = busyAt(M, tt);
      if (n !== lastN) {
        lastN = n;
        geo.tiles.forEach((el, k) => el.setAttribute('style', k < n ? 'fill:var(--core)' : 'fill:#2a2e44'));
        if (geo.nowTxt) geo.nowTxt.textContent = geo.mob ? `${n} of 132 SMs busy now` : String(n);
      }
    }
    const SPEED = () => M.T / 7; // one sweep ≈ 7 s
    const anim = GG.anim(f.stage, (t) => paintAt(t * SPEED()));
    const sG = stat(f, 'GPU utilization', 'core');
    const sS = stat(f, 'SM utilization', 'accent');
    const sW = stat(f, 'Waves per launch', 'ink');
    const pre = presets(f.controls, 'Blocks', [
      { value: 1, label: '1 block' }, { value: 66, label: '66' }, { value: 132, label: '132' }, { value: 133, label: '133' }, { value: 1056, label: '1,056' },
    ], (v) => { st.blocks = v; bS.set(v, false); update(); });
    const bS = GG.ui.slider(f.controls, { label: 'Thread blocks in the grid', min: 1, max: 2000, step: 1, log: true, value: st.blocks, format: (v) => fI(v), onInput: (v) => { st.blocks = Math.round(v); pre.set(st.blocks); update(); } });
    GG.ui.slider(f.controls, { label: 'GPU idle between launches', min: 0, max: 75, step: 1, value: 0, format: (v) => v + '%', onInput: (v) => { st.gap = v / 100; update(); } });
    GG.ui.playButton(f.controls, anim);
    pre.set(1);
    function update() {
      M = model();
      lastN = -1;
      view.redraw();
      paintAt(anim.running || anim.time ? anim.time * SPEED() : 0.5);
      sG.set(pct(M.gpu, 1));
      sS.set(M.sm < 0.01 ? pct(M.sm, 2) : pct(M.sm, 1));
      sW.set(String(M.waves));
      const B = st.blocks;
      let t;
      if (B === 1) t = `One block runs on one SM. <b>GPU utilization is ${pct(M.gpu, 0)}</b>${st.gap ? ', the share of time a kernel is running' : ': a kernel is running the whole time'}, but <b>SM utilization is ${pct(M.sm, 2)}</b>: one SM out of 132${st.gap ? ', and only while a kernel runs' : ''}. The other 131 never get any work.`;
      else if (B < NSM) t = `${fI(B)} blocks keep ${fI(B)} of 132 SMs busy while the kernel runs, so SM utilization is ${fI(B)}/132 = ${pct(B / NSM, 1)} of GPU utilization: <b>${pct(M.sm, 1)}</b>. ${132 - B} SMs never get any work.`;
      else if (B % NSM === 0) t = `${fI(B)} blocks fill ${M.waves} complete ${plural(M.waves, 'wave')} of 132: every SM is busy whenever a kernel runs, so SM utilization equals GPU utilization, <b>${pct(M.sm, 1)}</b>.`;
      else { const last = B - (M.waves - 1) * NSM; t = `${fI(B)} blocks need ${M.waves} waves, and the last one has only ${last} ${plural(last, 'block')}: during it ${NSM - last} SMs sit idle. SM utilization is ${fI(B)} ÷ (132 × ${M.waves}) ${st.gap ? '× ' + pct(M.gpu, 0) + ' ' : ''}= <b>${pct(M.sm, 1)}</b>, while GPU utilization reads ${pct(M.gpu, 0)}.`; }
      if (st.gap > 0) t += ` The host gaps lower both numbers: nothing runs anywhere for ${pct(st.gap, 0)} of the time.`;
      f.setWhy(t);
    }
    update();
  }

  /* Fig: why high utilization is bad news for a CPU server and good news for a GPU batch (Beyond the glossary).
     CPU: textbook M/M/1 queue, mean response time = service time / (1 − ρ).
     GPU: a fixed batch of work at utilization ρ takes ideal time / ρ. */
  function smuCpuGpu(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'High utilization: warning sign or goal?', hint: 'drag the utilization', wide: true,
      caption: 'Two idealised models, Beyond the glossary. Left: a CPU server answering requests that arrive at random, modelled as the textbook single-server queue (M/M/1), where the average response time is the service time ÷ (1 − utilization). Right: a GPU working through a fixed batch, which takes the ideal time ÷ utilization. Both curves are in multiples of the best case; the vertical axis is cut off at 10×.',
    });
    const st = { u: 0.9 };
    const YMAX = 10;
    const view = rsvg(f.stage, 'Two charts against utilization: CPU response time rises towards infinity near 100%, GPU batch time falls to its minimum at 100%.', (svg, w) => {
      const mob = w < 640;
      const gap = 34, pw = mob ? w : (w - gap) / 2, ph = mob ? 170 : 200;
      const panels = [
        { t: 'CPU server · average response time', tone: 'host', fn: (u) => 1 / (1 - u), lab: (v) => GG.fmt.sig(v, 3) + '× the service time', note: 'requests wait in line' },
        { t: 'GPU batch · time to finish the batch', tone: 'core', fn: (u) => 1 / u, lab: (v) => GG.fmt.sig(v, 3) + '× the ideal time', note: 'idle SMs are lost time' },
      ];
      panels.forEach((pn, i) => {
        const x0 = mob ? 0 : i * (pw + gap), y0 = mob ? i * (ph + 24) : 0;
        const padL = 34, top = 28, bot = 26;
        const X = (u) => x0 + padL + u * (pw - padL - 8);
        const Y = (v) => y0 + top + (1 - Math.min(v, YMAX) / YMAX) * (ph - top - bot);
        Tx(svg, x0, y0 + 12, pn.t, { fs: mob ? 10.5 : 11.5, fill: `var(--${pn.tone})`, weight: 600 });
        [1, 5, 10].forEach((v) => { Ln(svg, X(0), Y(v), X(1), Y(v), 'stroke:var(--line);stroke-width:1'); Tx(svg, X(0) - 6, Y(v) + 3.5, v + '×', { fs: 9.5, anchor: 'end', fill: 'var(--ink-3)' }); });
        [0, 0.5, 1].forEach((u) => Tx(svg, X(u), y0 + ph - bot + 14, pct(u, 0), { fs: 9.5, anchor: u === 0 ? 'start' : u === 1 ? 'end' : 'middle', fill: 'var(--ink-3)' }));
        Tx(svg, X(0.5), y0 + ph - 1, 'utilization', { fs: 9.5, anchor: 'middle', fill: 'var(--ink-3)' });
        let d = '';
        for (let k = 0; k <= 200; k++) {
          const u = 0.005 + (k / 200) * 0.99;
          const v = pn.fn(u);
          if (v > YMAX * 1.02) { if (d && !d.endsWith('|')) d += '|'; continue; }
          d += (d === '' || d.endsWith('|') ? 'M' : 'L') + r2(X(u)) + ',' + r2(Y(v));
        }
        Pa(svg, d.replace(/\|/g, ''), `fill:none;stroke:var(--${pn.tone});stroke-width:2`);
        const v = pn.fn(st.u);
        Ln(svg, X(st.u), Y(YMAX), X(st.u), Y(0), 'stroke:var(--accent);stroke-width:1.2;stroke-dasharray:3 3');
        C(svg, X(st.u), Y(v), 5.5, `fill:var(--${pn.tone});stroke:var(--bg);stroke-width:1.5`);
        const txt = (v > YMAX + 1e-6 ? 'off the chart: ' : '') + pn.lab(v);
        const tx = clamp(X(st.u), x0 + padL + tw(txt, 10.5) / 2, x0 + pw - tw(txt, 10.5) / 2);
        Tx(svg, tx, y0 + 25, txt, { fs: 10.5, anchor: 'middle', fill: 'var(--ink)', weight: 600 });
      });
      return mob ? 2 * ph + 24 : ph;
    });
    const sC = stat(f, 'CPU response time', 'host');
    const sG = stat(f, 'GPU batch time', 'core');
    GG.ui.slider(f.controls, { label: 'Utilization', min: 5, max: 99, step: 1, value: st.u * 100, format: (v) => v + '%', onInput: (v) => { st.u = v / 100; update(); } });
    function update() {
      view.redraw();
      const c = 1 / (1 - st.u), g = 1 / st.u;
      sC.set(GG.fmt.sig(c, 3) + '×'); sG.set(GG.fmt.sig(g, 3) + '×');
      f.setWhy(`At <b>${pct(st.u, 0)}</b> utilization, a request to the CPU server takes on average <b>${GG.fmt.sig(c, 3)}×</b> its service time, because it usually finds others ahead of it in the queue${st.u >= 0.8 ? ', and the curve climbs steeply as utilization nears 100%: that is why CPU operators keep headroom' : ''}. The GPU batch takes <b>${GG.fmt.sig(g, 3)}×</b> the ideal time${st.u >= 0.95 ? ', close to the best it can do' : ': every idle SM-cycle is work it has not done yet'}. For the GPU, higher utilization is simply better.`);
    }
    update();
  }

  /* Fig: high SM utilization, with pipes that may or may not be busy. */
  const SMU_SC = {
    few: { label: 'Few blocks', busy: 8, pipes: { fma: 0.7, tensor: 0, lsu: 0.3, adu: 0.06, cf: 0.12 },
      why: (u) => `Only 8 SMs got a block, so SM utilization is <b>${u}</b>. Those 8 work hard, but most of the GPU is idle: fix this first, by giving the kernel more blocks.` },
    stall: { label: 'Busy SMs, stalled warps', busy: 132, pipes: { fma: 0.08, tensor: 0, lsu: 0.17, adu: 0.03, cf: 0.05 },
      why: (u) => `Every SM is running warps, so SM utilization is <b>${u}</b>, yet no pipe gets above 20% of its peak: the warps spend most cycles stalled, for example waiting on global memory (<a data-term="scoreboard-stall">scoreboard stalls</a>). High SM utilization with low <a data-term="pipe-utilization">pipe utilization</a>: busy SMs, idle units.` },
    fp32: { label: 'FP32 compute-bound', busy: 132, pipes: { fma: 0.91, tensor: 0, lsu: 0.2, adu: 0.05, cf: 0.1 },
      why: (u, rg) => { const r = rg('fma'); return `SM utilization is <b>${u}</b> and the <code>fma</code> pipe runs at <b>${pct(r.avg, 0)}</b> of its peak on average, between ${pct(r.lo, 0)} and ${pct(r.hi, 0)} from SM to SM: the CUDA Cores are close to their speed of light.`; } },
    gemm: { label: 'Tensor Core matmul', busy: 132, pipes: { fma: 0.2, tensor: 0.86, lsu: 0.35, adu: 0.06, cf: 0.08 },
      why: (u, rg) => { const r = rg('tensor'); return `SM utilization is <b>${u}</b>, and inside the SMs the <code>tensor</code> pipe runs at <b>${pct(r.avg, 0)}</b> of its peak on average (${pct(r.lo, 0)} to ${pct(r.hi, 0)} from SM to SM). The other pipes are low, which is fine: the Tensor Cores are the ones doing the work.`; } },
  };
  function smuFig2(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Inside the busy SMs', hint: 'pick a kernel · tap an SM', wide: true,
      caption: 'The grid is the 132 SMs of an H100. An outlined tile is an SM running the kernel (what SM utilization counts); the fill inside rises with that SM\'s busiest pipe, in that pipe\'s colour (green for <code>fma</code> and <code>tensor</code>, pink for <code>lsu</code>). The gauges show the pipes of the SM you select (tap a tile or use the slider), as a percentage of each pipe\'s peak rate. The kernels and their numbers are illustrative, with small random differences between SMs.',
    });
    const st = { sc: 'stall', sel: 0 };
    legend(f.stage, [['var(--core)', 'SM running the kernel', 'outline'], ['var(--special)', 'fill height: that SM\'s busiest pipe, in the pipe\'s colour'], ['var(--line-2)', 'SM with no block', 'outline']]);
    const jit = []; const r = rng(7);
    for (let k = 0; k < 132; k++) jit.push(PIPES.map(() => 0.85 + r() * 0.3));
    const pipesOf = (k) => {
      const sc = SMU_SC[st.sc];
      if (k >= sc.busy) return null;
      const o = {};
      PIPES.forEach((p, i) => { o[p.k] = clamp(sc.pipes[p.k] * jit[k][i], 0, 0.99); });
      return o;
    };
    let tiles = [], selS = null;
    const view = rsvg(f.stage, 'The 132 SMs of a GPU, each filled by how busy its busiest pipe is, and the pipe gauges of one selected SM.', (svg, w) => {
      const mob = w < 700;
      const cols = 12, rowsN = 11;
      const gridW = mob ? w : Math.min(460, w * 0.46);
      const cell = gridW / cols;
      const sc = SMU_SC[st.sc];
      tiles = [];
      for (let k = 0; k < 132; k++) {
        const x = (k % cols) * cell, y = Math.floor(k / cols) * cell;
        const P = pipesOf(k);
        const g = G(svg, { 'data-k': k, style: 'cursor:pointer' });
        R(g, x + 1.5, y + 1.5, cell - 3, cell - 3, P ? 'fill:rgba(8,9,14,.6);stroke:var(--core);stroke-width:1.2' : 'fill:#1d2030;stroke:var(--line);stroke-width:1', { rx: 3 });
        if (P) {
          let top = PIPES[0];
          PIPES.forEach((p) => { if (P[p.k] > P[top.k]) top = p; });
          const ih = (cell - 6) * P[top.k];
          R(g, x + 3, y + cell - 3 - ih, cell - 6, ih, `fill:var(--${top.tone});opacity:.85`, { rx: 1.5 });
        }
        if (k === st.sel) R(g, x + 0.5, y + 0.5, cell - 1, cell - 1, 'fill:none;stroke:var(--ink);stroke-width:2', { rx: 4 });
        g.addEventListener('click', () => { st.sel = k; if (selS) selS.set(k, false); update(); });
        tiles.push(g);
      }
      const gh = rowsN * cell;
      // gauges
      const px = mob ? 0 : gridW + 40, py = mob ? gh + 22 : 8, pw = mob ? w : w - px;
      const P = pipesOf(st.sel);
      Tx(svg, px, py + 6, `SM ${st.sel}` + (P ? '' : ': no block, idle'), { fs: 13, fill: 'var(--ink)', weight: 600 });
      Tx(svg, px, py + 22, P ? 'pipe utilization, % of each pipe\'s peak rate' : 'this SM is not running the kernel', { fs: 10, fill: 'var(--ink-3)' });
      const rh = mob ? 34 : 40;
      PIPES.forEach((p, i) => {
        const y = py + 42 + i * rh;
        const u = P ? P[p.k] : 0;
        Tx(svg, px, y + 11, p.name, { fs: 11.5, fill: 'var(--' + p.tone + ')', weight: 600 });
        Tx(svg, px + (mob ? 100 : 108), y + 11, p.unit, { fs: 9.5, fill: 'var(--ink-3)' });
        const bx = px, bw = pw - 50;
        R(svg, bx, y + 17, bw, 10, 'fill:rgba(8,9,14,.6);stroke:var(--line-2)', { rx: 3 });
        if (u > 0) R(svg, bx + 1, y + 18, (bw - 2) * u, 8, 'fill:var(--' + p.tone + ')', { rx: 2 });
        Tx(svg, px + pw, y + 26, P ? pct(u, 0) : '—', { fs: 11.5, anchor: 'end', fill: 'var(--ink-2)', weight: 600 });
      });
      const ph = 42 + PIPES.length * rh;
      return mob ? gh + 22 + ph : Math.max(gh, ph + 8);
    });
    const sS = stat(f, 'SM utilization', 'core');
    const sP = stat(f, 'Busiest pipe, average', 'accent');
    GG.ui.seg(f.controls, { label: 'Kernel', options: Object.keys(SMU_SC).map((k) => ({ value: k, label: SMU_SC[k].label })), value: st.sc, onChange: (v) => { st.sc = v; update(); } });
    selS = GG.ui.slider(f.controls, { label: 'Selected SM', min: 0, max: 131, step: 1, value: st.sel, format: (v) => 'SM ' + v, onInput: (v) => { st.sel = v; update(); } });
    function update() {
      view.redraw();
      const sc = SMU_SC[st.sc];
      const u = pct(sc.busy / 132, 1);
      sS.set(u);
      let best = null, bv = -1;
      PIPES.forEach((p) => { let a = 0; for (let k = 0; k < sc.busy; k++) a += pipesOf(k)[p.k]; a /= sc.busy; if (a > bv) { bv = a; best = p; } });
      sP.set(`${best.name} ${pct(bv, 0)}`, best.tone);
      const rg = (key) => { let lo = 1, hi = 0, a = 0; for (let k = 0; k < sc.busy; k++) { const v = pipesOf(k)[key]; lo = Math.min(lo, v); hi = Math.max(hi, v); a += v; } return { lo, hi, avg: a / sc.busy }; };
      f.setWhy(sc.why(u, rg));
      GG.decorate(f.why);
    }
    update();
  }

  /* ═════════════════════════ WARP DIVERGENCE ═════════════════════════ */

  const WD_KERNEL = '__global__ void divergent_kernel(float* data, int n) {\n    int idx = blockIdx.x * blockDim.x + threadIdx.x;\n    if (idx < n) {\n        if (data[idx] > 0.5f) {\n\t\t    // A\n            data[idx] = data[idx] * 4.0f;\n        } else {\n\t\t    // B\n            data[idx] = data[idx] + 2.0f;\n        }\n        data[idx] = data[idx] * data[idx];\n    }\n}';
  const WD_SASS = 'LDG.E.SYS R4, [R2]                       // L1 load data[idx]\nFSETP.GT.AND P0, PT, R4.reuse, 0.5, PT   // L2 set P0 to data[idx] > 0.5\nFADD R0, R4, 2                           // L3 store 2 + data[idx] in R0\n@P0 FMUL R0, R4, 4                       // L4 in some threads, store 4 * data[idx] in R0\nFMUL R5, R0, R0                          // L5 store R0 * R0 in R5\nSTG.E.SYS [R2], R5                       // L6 store R5 in data[idx]';
  const f2 = (v) => (Math.round(v * 100) / 100).toFixed(2);

  GG.entry('warp-divergence', {
    render(body, ctx) {
      const s = ctx.html(body, `
<p><strong>Warp divergence</strong> occurs when <a data-term="thread">threads</a> within a <a data-term="warp">warp</a> take different execution paths due to control flow statements such as <code>if</code>/<code>else</code>.</p>
<p>The 32 threads of a warp share one instruction stream: on each cycle the warp issues one instruction, and every thread that takes part executes that same instruction on its own data. That works perfectly as long as all 32 want to run the same instruction next. A branch whose outcome differs from thread to thread breaks that agreement.</p>
${GG.noteHTML('intuition', '<p>Think of a warp as a rowing crew of 32 with a single cox calling the strokes. Everyone rows to the same call. If the course forks and some rowers want to go left while others want right, the cox can only call one side at a time: the others rest their oars until it is their turn.</p>')}
<p>For example, consider this <a data-term="kernel">kernel</a>:</p>
<div data-slot="kernel"></div>
<p>When the threads of a warp reach the data-dependent conditional, some must execute block A while others must execute block B, depending on the value at <code>data[idx]</code>. Because of this data dependency, and because of the structural constraints of the <a data-term="cuda-programming-model">CUDA programming model</a> and its implementation in the <a data-term="parallel-thread-execution">PTX machine model</a>, there is no way for a programmer or a compiler to avoid this split in control flow inside of the warp: nobody knows, until the data arrives, which threads will go which way.</p>
<p>Instead, the <a data-term="warp-scheduler">warp scheduler</a> must handle concurrent execution of the divergent code paths. It does so by "masking" some threads so that they don't execute an instruction: they sit out that cycle while the rest of the warp runs it. The mask comes from <em>predicate</em> <a data-term="registers">registers</a>, one-bit registers that hold a true/false value for each thread.</p>
<h3>Reading the SASS</h3>
<p>Let's examine the generated <a data-term="streaming-assembler">SASS</a> (<a href="https://godbolt.org/z/EGWKb5oWr">Godbolt link</a>) to understand the execution flow. The listing covers the body of the bounds-checked <code>if</code>; hover or tap a line.</p>
<div data-slot="sass"></div>
<p>After loading the data into <code>R4</code> (<code>L1</code>), all 32 threads in the warp execute <code>FSETP.GT.AND</code> concurrently (<code>L2</code>), and each thread gets its own <code>P0</code> value based on the <code>data</code> value in its <code>R4</code>. Then comes a bit of <a data-term="nvcc">compiler</a> cleverness. In <code>L3</code> <em>all</em> threads execute <code>FADD</code>, block B's "add 2", writing to <code>R0</code>. Only those for whom <code>P0</code> is true then execute block A's "multiply by 4" (<code>L4</code>), overwriting the value written to <code>R0</code> in <code>L3</code>. On this instruction the warp is said to be <b>divergent</b>. On <code>L5</code>, all threads are back to executing the same code. Once the warp scheduler brings them back into alignment, issuing the same instruction to all of them on the same clock cycle, the warp has <b>converged</b>. Step through it lane by lane in Fig.&nbsp;1.</p>
<div data-slot="f1"></div>
${GG.noteHTML('check', '<p><b>A and B are swapped in the glossary\'s walk-through.</b> In the kernel, the comment <code>// A</code> marks the multiply-by-<code>4.0f</code> branch, taken when <code>data[idx] &gt; 0.5f</code>, and <code>// B</code> marks the add-<code>2.0f</code> branch. In the SASS, <code>L3</code> (<code>FADD R0, R4, 2</code>) therefore computes <b>B</b>, for every thread, and <code>L4</code> (<code>@P0 FMUL R0, R4, 4</code>) computes <b>A</b>, only for the threads whose <code>P0</code>, that is <code>data[idx] &gt; 0.5</code>, is true. The glossary\'s prose says that <code>L3</code> executes the code in A and <code>L4</code> the code in B. The mechanism it describes is exactly right; only the two letters are crossed. This page follows the code\'s labels throughout.</p>')}
<h3>Why compute both?</h3>
<p>This is presumably more efficient than the naïve encoding of the branch into SASS, which would instead predicate both lines: <code>L3</code> for the threads with <code>P0</code> false and <code>L4</code> for those with it true. "Presumably" in two senses: we can trust the <a data-term="nvcc">compiler</a>, and heuristically we are trading use of cheap, plentiful <a data-term="cuda-core">CUDA Core</a> computation for more expensive flow control. Compare the two encodings in Fig.&nbsp;2.</p>
<div data-slot="f2"></div>
<p>Both encodings issue the same two instructions, 64 lane-slots in all. The naïve one leaves the path-A lanes masked on <code>L3</code>. The compiler's lets those lanes run path B's <code>FADD</code> instead, then throws that result away on <code>L4</code>. As often in GPU programming, it's better to waste compute (an unnecessary <code>FADD</code> for every thread that executes <code>L4</code>) than to add complexity, even if it's just a simple predication.</p>
${GG.noteHTML('beyond', '<p><b>One likely payoff: one fewer dependency.</b> A predicated instruction cannot run until its predicate is known, so in the naïve encoding both <code>L3</code> and <code>L4</code> would have to wait for <code>L2</code>\'s comparison to produce <code>P0</code>. In the compiler\'s encoding, <code>L3</code> does not read <code>P0</code> at all: it can go ahead while the comparison is still in flight, and only <code>L4</code> waits.</p>')}
<h3>Divergence, then and now</h3>
<p>One reason compilers might aggressively avoid divergence is that in early (pre-Volta) GPUs, divergent warps were always fully serialized: the warp ran one path to the end with the other path's threads masked off, then ran the other path, and only then continued together. While warp divergence still reduces efficiency, modern GPUs with <em>independent thread scheduling</em> don't necessarily experience the full serialization penalties.</p>
<div data-slot="f3"></div>
${GG.noteHTML('beyond', '<p><b>Independent thread scheduling</b> arrived with the Volta architecture (2017). Each thread keeps its own program counter and call stack, so the hardware can interleave the execution of statements from different sides of a branch instead of finishing one side first. At any one cycle a warp still issues a single instruction for the threads on one path, so divergence still costs issue slots. What changes is that one path\'s work can fill the time the other path spends waiting, and that threads on different paths can wait for each other without deadlocking. NVIDIA\'s Volta whitepaper describes it; see the reading list.</p>')}
<p>A related measure, <a data-term="branch-efficiency">branch efficiency</a>, counts how often warps avoid divergence when they reach a branch.</p>
<div data-slot="reading"></div>`);

      guard(() => {
        const c = mkCode(ctx, s.kernel, {
          lang: 'cuda', code: WD_KERNEL, caption: 'divergent_kernel',
          notes: {
            1: '<code>__global__</code> marks a kernel: a function the host launches and every thread runs. <code>data</code> points to <code>n</code> floats in <a data-term="global-memory">global memory</a>.',
            2: 'Each thread\'s global index: its block\'s number times the block size, plus its position in the block. A warp is 32 consecutive values of <code>idx</code>.',
            3: 'The bounds check. Threads past the end of the array skip everything. (See <a data-term="branch-efficiency">branch efficiency</a> for why this branch rarely splits a warp.)',
            4: 'The data-dependent branch. Each thread compares <em>its own</em> element with 0.5, so threads of one warp can disagree.',
            5: 'The comment marking block A. (The odd indentation, two tabs and four spaces, is the glossary\'s own.)',
            6: '<b>Block A</b>, for elements above 0.5: multiply by 4.',
            8: 'The comment marking block B.',
            9: '<b>Block B</b>, for elements of 0.5 or less: add 2.',
            11: 'After the <code>if</code>/<code>else</code>, every thread squares its element: both paths meet again here.',
          },
        });
        GG.decorate(c.el);
      });
      guard(() => mkCode(ctx, s.sass, {
        lang: 'sass', code: WD_SASS, caption: 'the kernel body in SASS', wide: true,
        notes: {
          1: '<b>L1 · <code>LDG</code></b>, LoaD from Global memory: each thread reads <code>data[idx]</code> from the address held in <code>R2</code> into its own <code>R4</code>. <i>Beyond the glossary:</i> a 64-bit address takes a register pair, here <code>R2</code> and <code>R3</code>; <code>.E</code> marks such an extended address and <code>.SYS</code> a system-wide memory scope.',
          2: '<b>L2 · <code>FSETP.GT.AND</code></b>, Float SET Predicate: <code>P0</code> = (<code>R4</code> &gt; 0.5) AND <code>PT</code>. <code>PT</code> is the always-true predicate, so the AND changes nothing. <i>Beyond the glossary:</i> the instruction can also write the opposite result to a second predicate; naming <code>PT</code> there discards it. <code>.reuse</code> tells the hardware to keep <code>R4</code> in a small operand cache because the next instruction reads it again.',
          3: '<b>L3 · <code>FADD</code></b>, for <em>every</em> thread: <code>R0</code> = <code>R4</code> + 2. This is block B\'s work, done unconditionally.',
          4: '<b>L4 · <code>@P0 FMUL</code></b>: the <code>@P0</code> prefix predicates the instruction, so only threads whose <code>P0</code> is true execute it, overwriting <code>R0</code> with <code>R4</code> × 4: block A. The other threads are masked. Here the warp is divergent.',
          5: '<b>L5 · <code>FMUL</code></b>, for every thread again: <code>R5</code> = <code>R0</code> × <code>R0</code>. The warp has converged.',
          6: '<b>L6 · <code>STG</code></b>, STore to Global memory: each thread writes its <code>R5</code> back to <code>data[idx]</code>.',
        },
      }));
      guard(() => wdLanes(ctx, s.f1));
      guard(() => wdEncodings(ctx, s.f2));
      guard(() => wdSerial(ctx, s.f3));
      ctx.reading(s.reading, [
        { href: 'https://godbolt.org/z/EGWKb5oWr', label: 'Godbolt: divergent_kernel compiled to SASS', note: 'the glossary\'s compiler output' },
        { href: 'https://images.nvidia.com/content/volta-architecture/pdf/volta-architecture-whitepaper.pdf', label: 'NVIDIA Tesla V100 (Volta) architecture whitepaper', note: 'independent thread scheduling (Beyond the glossary)' },
      ]);
    },
  });

  /* Fig: one warp, 32 lanes, stepping through L1–L6. */
  function wdLanes(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'One warp, lane by lane', hint: 'step through L1–L6 · drag a bar to edit a value', wide: true, controlsFirst: false,
      caption: 'The 32 lanes (threads) of one warp, each with its own copy of every register. The bar is the lane\'s <code>data[idx]</code>, between 0 and 1, with the 0.5 threshold dashed; drag it, or focus it and use ↑ ↓ (Shift for steps of 0.1), to change the value. After <code>L2</code> the bars are coloured by path: green lanes have <code>P0</code> = 1 and take path A (× 4), pink lanes take path B (+ 2). The bar always shows the lane\'s <em>input</em>; the blue <code>data[idx]</code> row shows what is in memory, which changes at <code>L6</code>. A bright cell is the register the current instruction just wrote. Hatched lanes are masked off for the current instruction. On <code>L4</code>, a path-A lane\'s <code>R0</code> shows the <code>FADD</code> result from <code>L3</code> struck through in red above the new value that overwrites it; from then on a red dot by the lane number marks a lane whose <code>FADD</code> was wasted. Values are shown to two decimal places.',
    });
    const st = { step: 0, seed: 11, pat: 'random', vals: [] };
    function roll() {
      const r = rng(st.seed * 7919);
      if (st.pat === 'random') st.vals = Array.from({ length: 32 }, () => Math.round(r() * 100) / 100);
      else if (st.pat === 'above') st.vals = Array.from({ length: 32 }, () => Math.round((0.51 + r() * 0.49) * 100) / 100);
      else if (st.pat === 'below') st.vals = Array.from({ length: 32 }, () => Math.round(r() * 50) / 100);
      else st.vals = Array.from({ length: 32 }, (_, i) => (i < 16 ? Math.round((0.51 + r() * 0.49) * 100) / 100 : Math.round(r() * 50) / 100));
    }
    roll();
    const code = GG.code(f.stage, { lang: 'sass', code: WD_SASS, copy: false, langLabel: 'sass', caption: 'executing now' });
    code.el.style.marginBottom = '12px';
    code.el.classList.add('pfc-wd-full');
    // phones: the same listing without its comments (the full one is above the figure), plus the current
    // line's comment underneath, so nothing meaningful is scrolled out of view
    const SASS_LINES = WD_SASS.split('\n');
    const code2 = GG.code(f.stage, { lang: 'sass', code: SASS_LINES.map((l) => l.replace(/\s*\/\/.*$/, '')).join('\n'), copy: false, langLabel: 'sass', caption: 'executing now' });
    code2.el.classList.add('pfc-wd-bare');
    const codeNote = GG.el('div', { class: 'pfc-wd-note', 'aria-live': 'polite' });
    f.stage.append(codeNote);
    legend(f.stage, [['var(--core)', 'path A: data &gt; 0.5, × 4'], ['var(--special)', 'path B: data ≤ 0.5, + 2'], ['var(--memory)', 'value not yet compared'], ['var(--ink-3)', 'masked for this instruction', 'hatch'], ['var(--danger)', 'FADD result overwritten (struck through on L4)', 'strike'], ['var(--danger)', 'lane whose FADD was wasted', 'dot']]);
    const lane = (i) => {
      const v = st.vals[i], k = st.step, p = v > 0.5;
      return {
        v, p,
        R4: k >= 1 ? v : null,
        P0: k >= 2 ? p : null,
        R0: k >= 3 ? (k >= 4 && p ? v * 4 : v + 2) : null,
        R5: k >= 5 ? (p ? v * 4 : v + 2) ** 2 : null,
        mem: k >= 6 ? (p ? v * 4 : v + 2) ** 2 : v,
        masked: k === 4 && !p,
        wasted: k >= 4 && p,
        old: v + 2,
      };
    };
    let geo = null;
    const view = rsvg(f.stage, 'Thirty-two lanes of a warp, each showing its data value and its registers R4, P0, R0 and R5 at the current step.', (svg, w) => {
      const mob = w < 640;
      const lpr = w >= 860 ? 16 : 8;
      const padL = mob ? 30 : 66;
      const cw = (w - padL) / lpr;
      const hdr = 14, barH = mob ? 28 : 36, rowH = mob ? 13.5 : 15;
      const ROWS = [['mem', 'data[idx]', 'data'], ['R4', 'R4', 'R4'], ['P0', 'P0', 'P0'], ['R0', 'R0', 'R0'], ['R5', 'R5', 'R5']];
      // the R0 row is taller: on L4 it shows the overwritten FADD value above the new one
      const rH = (j) => (ROWS[j][0] === 'R0' ? rowH * 1.75 : rowH);
      const rY = (j) => { let y = 0; for (let q = 0; q < j; q++) y += rH(q); return y; };
      const ch = hdr + barH + 8 + rY(ROWS.length) + 4;
      const top = 4;
      const hatch = hatchDef(svg, 'pfc-hatch-wd', 'rgba(118,123,149,.28)');
      const k = st.step;
      const written = { 1: 'R4', 2: 'P0', 3: 'R0', 4: 'R0', 5: 'R5', 6: 'mem' }[k];
      geo = { bars: [] };
      const groups = 32 / lpr;
      for (let gI = 0; gI < groups; gI++) {
        const y0 = top + gI * (ch + 10);
        // row labels
        Tx(svg, padL - 6, y0 + 10, mob ? '#' : 'lane', { fs: 9.5, anchor: 'end', fill: 'var(--ink-3)' });
        Tx(svg, padL - 6, y0 + hdr + barH / 2 + 3, mob ? 'in' : 'input', { fs: 9.5, anchor: 'end', fill: 'var(--ink-3)' });
        Tx(svg, padL - 6, y0 + hdr + barH * 0.5 + 14, mob ? '' : '0.5 ┄', { fs: 8.5, anchor: 'end', fill: 'var(--ink-3)' });
        ROWS.forEach((rw, j) => Tx(svg, padL - 6, y0 + hdr + barH + 8 + rY(j) + rH(j) - 3.5, mob ? rw[2] : rw[1], { fs: mob ? 8.5 : 10, anchor: 'end', fill: rw[0] === 'mem' ? 'var(--memory)' : 'var(--ink-2)' }));
        for (let c = 0; c < lpr; c++) {
          const i = gI * lpr + c, L = lane(i);
          const x = padL + c * cw + 1.5, cwi = cw - 3;
          const g = G(svg);
          const active = k >= 1 && !L.masked;
          R(g, x, y0, cwi, ch, L.masked ? `fill:${hatch};stroke:var(--line-2);stroke-dasharray:3 3` : active ? 'fill:rgba(69,212,155,.05);stroke:rgba(69,212,155,.45);stroke-width:1.2' : 'fill:rgba(8,9,14,.45);stroke:var(--line-2)', { rx: 5 });
          Tx(g, x + cwi / 2, y0 + 11, String(i), { fs: 9.5, anchor: 'middle', fill: L.masked ? 'var(--ink-3)' : 'var(--ink-2)' });
          if (L.wasted) C(g, x + cwi - 5, y0 + 7, 2.6, 'fill:var(--danger)');
          // value bar
          const bx = x + cwi * 0.28, bw = cwi * 0.44, by = y0 + hdr, bb = by + barH;
          R(g, bx, by, bw, barH, 'fill:rgba(255,255,255,.04)', { rx: 2 });
          const col = k >= 2 ? (L.p ? 'var(--core)' : 'var(--special)') : 'var(--memory)';
          R(g, bx, bb - barH * L.v, bw, barH * L.v, `fill:${col};opacity:${L.masked ? 0.45 : 0.9}`, { rx: 2 });
          Ln(g, x + 3, by + barH * 0.5, x + cwi - 3, by + barH * 0.5, 'stroke:var(--ink-2);stroke-width:1;stroke-dasharray:2 2');
          const hit = R(g, x, by - 2, cwi, barH + 4, 'fill:transparent;cursor:ns-resize', { 'data-lane': i, tabindex: '0', role: 'slider', 'aria-label': `lane ${i} data value`, 'aria-valuemin': '0', 'aria-valuemax': '1', 'aria-valuenow': f2(L.v) });
          geo.bars[i] = { el: hit, by, barH };
          ROWS.forEach((rw, j) => {
            const ry = y0 + hdr + barH + 8 + rY(j) + rH(j) - rowH;
            const val = L[rw[0]];
            let txt = '·', fill = 'var(--ink-3)';
            if (rw[0] === 'P0') { if (val != null) { txt = val ? '1' : '0'; fill = val ? 'var(--core)' : 'var(--special)'; } }
            else if (val != null) { txt = f2(val); fill = 'var(--ink-2)'; }
            const isNew = written === rw[0] && !(L.masked && rw[0] === 'R0');
            if (rw[0] === 'R0' && L.wasted && k === 4) {
              // the overwrite itself: L3's FADD result, struck through, above the value L4 wrote
              const ot = f2(L.old), ofs = mob ? 8 : 9, oy = ry - rowH * 0.75 + rowH - 4;
              Tx(g, x + cwi / 2, oy, ot, { fs: ofs, anchor: 'middle', fill: 'var(--danger)', pe: false });
              const half = tw(ot, ofs) / 2 + 1;
              Ln(g, x + cwi / 2 - half, oy - Math.max(ofs, FSMIN) * 0.32, x + cwi / 2 + half, oy - Math.max(ofs, FSMIN) * 0.32, 'stroke:var(--danger);stroke-width:1.2');
            }
            if (isNew && !L.masked) R(g, x + 2, ry + 0.5, cwi - 4, rowH - 1, `fill:${rw[0] === 'mem' ? 'var(--memory-a)' : 'rgba(255,255,255,.1)'}`, { rx: 2 });
            if (isNew && !L.masked && rw[0] !== 'P0') fill = rw[0] === 'mem' ? 'var(--memory)' : 'var(--ink)';
            if (rw[0] === 'mem' && k < 6) fill = 'var(--memory)';
            Tx(g, x + cwi / 2, ry + rowH - 3.5, txt, { fs: mob ? 8.5 : 10, anchor: 'middle', fill, weight: isNew && !L.masked ? 600 : null, pe: false });
          });
        }
      }
      return top + groups * (ch + 10) - 6;
    });
    view.svg.setAttribute('data-keys', '');
    /* editing values */
    let drag = null;
    const setVal = (i, v) => {
      st.vals[i] = clamp(Math.round(v * 100) / 100, 0, 1);
      st.pat = 'custom'; pre.set(null);
      refresh();
    };
    const valFromY = (i, clientY) => {
      const rect = view.svg.getBoundingClientRect();
      const b = geo.bars[i];
      const y = ((clientY - rect.top) * view.w) / rect.width;
      return (b.by + b.barH - y) / b.barH;
    };
    view.svg.addEventListener('pointerdown', (e) => {
      const t = e.target.closest && e.target.closest('[data-lane]');
      if (!t) return;
      drag = +t.getAttribute('data-lane');
      try { view.svg.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ }
      e.preventDefault();
      setVal(drag, valFromY(drag, e.clientY));
    });
    view.svg.addEventListener('pointermove', (e) => { if (drag != null) setVal(drag, valFromY(drag, e.clientY)); });
    const end = () => { drag = null; };
    view.svg.addEventListener('pointerup', end);
    view.svg.addEventListener('pointercancel', end);
    view.svg.addEventListener('keydown', (e) => {
      const t = e.target.closest && e.target.closest('[data-lane]');
      if (!t) return;
      const i = +t.getAttribute('data-lane');
      const d = e.shiftKey ? 0.1 : 0.01;
      let v = null;
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') v = st.vals[i] + d;
      else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') v = st.vals[i] - d;
      else if (e.key === 'Home') v = 0; else if (e.key === 'End') v = 1;
      if (v == null) return;
      e.preventDefault();
      setVal(i, v);
      const nb = geo.bars[i]; if (nb) nb.el.focus();
    });
    const sA = stat(f, 'Path A lanes', 'core');
    const sM = stat(f, 'Masked on L4', 'ink');
    const sW = stat(f, 'Wasted FADDs', 'danger');
    const sS = stat(f, 'Warp', 'accent');
    const STEPS = ['before L1', 'L1 LDG', 'L2 FSETP', 'L3 FADD', 'L4 @P0 FMUL', 'L5 FMUL', 'L6 STG'];
    GG.ui.stepper(f.controls, { label: 'Instruction', steps: STEPS.map((l) => ({ label: l })), autoplay: 1700, start: 4, onStep: (i) => { st.step = i; refresh(); } });
    const pre = presets(f.controls, 'Data', [
      { value: 'random', label: 'Random' }, { value: 'half', label: 'Half and half' }, { value: 'above', label: 'All > 0.5' }, { value: 'below', label: 'All ≤ 0.5' },
    ], (v) => { st.pat = v; roll(); refresh(); });
    pre.set('random');
    GG.ui.button(f.controls, { label: 'Re-roll', icon: 'reset', onClick: () => { st.seed = (st.seed * 31 + 7) % 100003; if (st.pat === 'custom') st.pat = 'random'; pre.set(st.pat); roll(); refresh(); } });
    function refresh() {
      view.redraw();
      code.clear(); code2.clear();
      if (st.step > 0) { code.highlight(st.step, 'core'); code2.highlight(st.step, 'core'); }
      const cm = st.step > 0 ? (SASS_LINES[st.step - 1].match(/\/\/\s*(.*)$/) || [])[1] : null;
      codeNote.textContent = cm ? '// ' + cm : '// nothing has executed yet';
      const nA = st.vals.filter((v) => v > 0.5).length;
      const k = st.step;
      sA.set(k >= 2 ? `${nA} of 32` : '?');
      sM.set(k >= 2 ? String(32 - nA) : '?');
      sW.set(k >= 4 ? String(nA) : k === 3 ? `${nA} pending` : '—');
      const div = nA > 0 && nA < 32;
      sS.set(k === 4 ? (div ? 'divergent' : 'uniform') : k >= 5 ? (div ? 'converged' : 'uniform') : 'together');
      const has05 = st.vals.some((v) => v === 0.5);
      let t;
      switch (k) {
        case 0: t = 'One warp: 32 lanes, one per thread, <code>idx</code> 0 to 31. Each lane will work on its own element <code>data[idx]</code> (the bars). Nothing has executed yet. Press ▶ to issue <code>L1</code>.'; break;
        case 1: t = '<b>L1 · <code>LDG</code></b>: one instruction, issued once for the whole warp, and every lane loads <em>its own</em> <code>data[idx]</code> into <em>its own</em> <code>R4</code>. Same instruction, 32 different values.'; break;
        case 2: t = `<b>L2 · <code>FSETP.GT.AND</code></b>: all 32 lanes compare their <code>R4</code> with 0.5 at once. <b>${nA} ${plural(nA, 'lane')}</b> get <code>P0</code> = 1 (path A), ${32 - nA} get 0 (path B).${has05 ? ' A value of exactly 0.50 is not greater than 0.5, so it goes to path B.' : ''}`; break;
        case 3: t = `<b>L3 · <code>FADD</code></b>: <em>all</em> 32 lanes compute <code>R4</code> + 2 into <code>R0</code>. That is block B's code, run unconditionally. For the ${nA} path-A ${plural(nA, 'lane')} this result is not the answer and will be overwritten next.`; break;
        case 4: t = nA === 0 ? '<b>L4 · <code>@P0 FMUL</code></b>: no lane has <code>P0</code> set, so all 32 are masked. The instruction still issues and costs a cycle, but does nothing. Every lane took path B: the warp never diverged.'
          : nA === 32 ? '<b>L4 · <code>@P0 FMUL</code></b>: every lane has <code>P0</code> set, so all 32 overwrite <code>R0</code> with <code>R4</code> × 4. No lane is masked, so the warp is uniform, but all 32 <code>FADD</code>s from <code>L3</code> were wasted work.'
          : `<b>L4 · <code>@P0 FMUL</code></b>: only the <b>${nA} lanes</b> with <code>P0</code> = 1 execute, overwriting <code>R0</code> with <code>R4</code> × 4: block A. The other ${32 - nA} are masked and idle. On this instruction the warp is <b>divergent</b>.`; break;
        case 5: t = `<b>L5 · <code>FMUL</code></b>: all 32 lanes square <code>R0</code> into <code>R5</code>. Every lane runs the same instruction on the same cycle again: the warp has ${div ? '<b>converged</b>' : 'stayed uniform throughout'}.`; break;
        default: t = '<b>L6 · <code>STG</code></b>: each lane stores its <code>R5</code> back to its own <code>data[idx]</code> (the blue row). Path-A lanes hold (4<i>x</i>)², path-B lanes (<i>x</i> + 2)².';
      }
      f.setWhy(t);
    }
    refresh();
  }

  /* Fig: the compiler's encoding vs the naive one. */
  function wdEncodings(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Two encodings of the if/else', hint: 'change how many lanes take path A', wide: true,
      caption: 'Each row is one instruction issued for the whole warp; each cell is one of its 32 lanes. Green cells do path A\'s useful work, pink cells path B\'s, grey cells sit masked, and red cells compute an <code>FADD</code> that is later overwritten. The blue arrows mark instructions that must read the predicate register <code>P0</code>, which <code>L2</code> writes. <code>@!P0</code> means "only where <code>P0</code> is false". The naïve encoding is the glossary\'s hypothetical, not compiler output.',
    });
    const st = { k: 13 };
    const order = []; { const r = rng(5); const a = Array.from({ length: 32 }, (_, i) => [r(), i]); a.sort((x, y) => x[0] - y[0]); a.forEach((p) => order.push(p[1])); }
    const isA = (i) => order.indexOf(i) < st.k;
    const ENC = [
      { name: 'Compiler\'s encoding (the real SASS)', rows: [
        { code: 'FSETP.GT.AND P0, PT, R4.reuse, 0.5, PT', kind: 'cmp' },
        { code: 'FADD R0, R4, 2', kind: 'fadd', pred: false },
        { code: '@P0 FMUL R0, R4, 4', kind: 'fmul', pred: true },
      ] },
      { name: 'Naïve encoding (both predicated)', rows: [
        { code: 'FSETP.GT.AND P0, PT, R4.reuse, 0.5, PT', kind: 'cmp' },
        { code: '@!P0 FADD R0, R4, 2', kind: 'faddp', pred: true },
        { code: '@P0 FMUL R0, R4, 4', kind: 'fmul', pred: true },
      ] },
    ];
    const cellKind = (row, i) => {
      const a = isA(i);
      if (row.kind === 'cmp') return 'cmp';
      if (row.kind === 'fadd') return a ? 'waste' : 'B';
      if (row.kind === 'faddp') return a ? 'mask' : 'B';
      return a ? 'A' : 'mask';
    };
    const FILL = { cmp: 'fill:var(--memory);opacity:.55', A: 'fill:var(--core)', B: 'fill:var(--special)', mask: 'fill:#2a2e44', waste: 'fill:var(--danger)' };
    const view = rsvg(f.stage, 'Two panels of instruction rows by 32 lanes, comparing the compiler\'s encoding with a naive predicated encoding.', (svg, w) => {
      const mob = w < 760;
      const gap = 36;
      const pw = mob ? w : (w - gap) / 2;
      const rowH = 18, labH = 16, rGap = 10;
      const ph = 22 + 3 * (labH + rowH + rGap) + 20;
      ENC.forEach((enc, e) => {
        const x0 = mob ? 0 : e * (pw + gap), y0 = mob ? e * (ph + 16) : 0;
        Tx(svg, x0, y0 + 13, enc.name, { fs: 12, fill: 'var(--ink)', weight: 600 });
        const arrX = x0 + pw - 14;
        const cellsW = pw - 34;
        const cw = cellsW / 32;
        enc.rows.forEach((row, j) => {
          const y = y0 + 24 + j * (labH + rowH + rGap);
          Tx(svg, x0, y + 11, (j === 0 ? 'L2  ' : j === 1 ? 'L3  ' : 'L4  ') + row.code, { fs: mob ? 10 : 10.5, fill: row.pred ? 'var(--memory)' : 'var(--ink-2)' });
          for (let i = 0; i < 32; i++) R(svg, x0 + i * cw + 0.5, y + labH, cw - 1, rowH, FILL[cellKind(row, i)], { rx: 1.5 });
          if (j === 0) { R(svg, arrX - 6, y + labH + 4, 12, 10, 'fill:var(--memory-a);stroke:var(--memory)', { rx: 2 }); Tx(svg, arrX, y + labH + 26, 'P0', { fs: 9, anchor: 'middle', fill: 'var(--memory)' }); }
          if (row.pred) {
            const ty = y + labH + rowH / 2, sy = y0 + 24 + labH + 14;
            Pa(svg, `M${arrX},${sy + 18}V${ty}H${x0 + cellsW + 6}`, 'fill:none;stroke:var(--memory);stroke-width:1.4');
            arrowHead(svg, x0 + cellsW + 3, ty, Math.PI, 6, 'var(--memory)');
          }
        });
        const cnt = { A: 0, B: 0, mask: 0, waste: 0 };
        enc.rows.slice(1).forEach((row) => { for (let i = 0; i < 32; i++) cnt[cellKind(row, i)]++; });
        const npred = enc.rows.filter((r) => r.pred).length;
        const sy = y0 + 24 + 3 * (labH + rowH + rGap) + 4;
        Tx(svg, x0, sy + 8, mob ? `L3+L4: ${npred} ${npred === 1 ? 'reads' : 'read'} P0 · ${cnt.mask} masked · ${cnt.waste} wasted` : `L3 + L4: 2 issued · ${npred} ${npred === 1 ? 'reads' : 'read'} P0 · ${cnt.A + cnt.B} useful · ${cnt.mask} masked · ${cnt.waste} wasted`, { fs: mob ? 9.5 : 10.5, fill: 'var(--ink-2)' });
      });
      return mob ? 2 * ph + 16 : ph;
    });
    GG.ui.slider(f.controls, { label: 'Lanes taking path A (data > 0.5)', min: 0, max: 32, step: 1, value: st.k, format: (v) => `${v} of 32`, onInput: (v) => { st.k = v; update(); } });
    const sW = stat(f, 'Wasted FADDs (compiler)', 'danger');
    const sP = stat(f, 'Instructions reading P0', 'memory');
    function update() {
      view.redraw();
      sW.set(String(st.k));
      sP.set('1 vs 2');
      f.setWhy(`With <b>${st.k}</b> of 32 lanes on path A, both encodings spend the same two issue slots and the same 64 lane-slots. The naïve one leaves ${st.k} lanes masked on <code>L3</code> and ${32 - st.k} on <code>L4</code>; the compiler's lets those ${st.k} path-A lanes run a throwaway <code>FADD</code> instead. In exchange only <b>one</b> instruction depends on the predicate, and <code>L3</code> needs no predicate logic at all.`);
    }
    update();
  }

  /* Fig: full serialization before Volta vs interleaving with independent thread scheduling (schematic). */
  function wdSerial(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Serialized vs interleaved paths', hint: 'change the split and the wait', wide: true,
      caption: 'A schematic of one warp running an <code>if</code>/<code>else</code> whose path A starts with a load and must wait for it before its second instruction, while path B is three independent instructions. Each square is one cycle of this warp: green issues for path A\'s threads, pink for path B\'s, and amber hatched cycles are this warp stalled, waiting for the load. The slider sets the load\'s latency: the second A issues that many cycles after the first. Before Volta, a divergent warp ran one path to the end, waits included, before starting the other. With independent thread scheduling the hardware may interleave the paths, as drawn on the second row; how it actually schedules them is up to the GPU.',
    });
    const st = { lat: 6, split: 'div' };
    const sched = (mode) => {
      const L = st.lat, cells = [];
      if (st.split === 'A') { cells.push('A'); for (let t = 1; t < L; t++) cells.push('wait'); cells.push('A'); return cells; }
      if (st.split === 'B') return ['B', 'B', 'B'];
      if (mode === 'serial') { cells.push('A'); for (let t = 1; t < L; t++) cells.push('wait'); cells.push('A', 'B', 'B', 'B'); return cells; }
      cells.push('A');
      let t = 1, b = 0;
      while (t < L || b < 3) { if (b < 3) { cells.push('B'); b++; } else cells.push('wait'); t++; }
      cells.push('A');
      return cells;
    };
    const view = rsvg(f.stage, 'Two timelines of one warp, one serializing the two branch paths and one interleaving them.', (svg, w) => {
      const mob = w < 640;
      const hatch = hatchDef(svg, 'pfc-hatch-ser', 'rgba(255,198,92,.35)');
      const rowsD = [['serial', 'pre-Volta: fully serialized'], ['inter', 'Volta and later: may interleave']];
      const maxN = st.lat + 5;
      const padL = mob ? 0 : 230;
      const cw = Math.min(40, (w - padL - 70) / maxN);
      let y = 4;
      rowsD.forEach(([m, lab]) => {
        const c = sched(m);
        if (mob) { Tx(svg, 0, y + 10, lab, { fs: 10.5, fill: 'var(--ink)', weight: 600 }); y += 16; }
        else Tx(svg, padL - 12, y + cw / 2 + 4, lab, { fs: 11, anchor: 'end', fill: 'var(--ink)', weight: 600 });
        c.forEach((k, t) => {
          const x = padL + t * cw;
          if (k === 'wait') R(svg, x + 1, y + 1, cw - 2, cw - 2, `fill:${hatch};stroke:rgba(255,198,92,.5)`, { rx: 3 });
          else { R(svg, x + 1, y + 1, cw - 2, cw - 2, k === 'A' ? 'fill:var(--core)' : 'fill:var(--special)', { rx: 3 }); if (cw >= 18) Tx(svg, x + cw / 2, y + cw / 2 + 4, k, { fs: 10, anchor: 'middle', fill: '#0b0c12', weight: 700 }); }
        });
        Tx(svg, padL + c.length * cw + 8, y + cw / 2 + 4, `${c.length} cycles`, { fs: 11, fill: 'var(--ink-2)', weight: 600 });
        y += cw + (mob ? 14 : 12);
      });
      return y;
    });
    GG.ui.seg(f.controls, { label: 'Threads in the warp', options: [{ value: 'div', label: 'some A, some B' }, { value: 'A', label: 'all A' }, { value: 'B', label: 'all B' }], value: st.split, onChange: (v) => { st.split = v; update(); } });
    GG.ui.slider(f.controls, { label: 'Path A\'s load latency', min: 2, max: 12, step: 1, value: st.lat, format: (v) => v + ' cycles', onInput: (v) => { st.lat = v; update(); } });
    const sS = stat(f, 'Serialized', 'danger');
    const sI = stat(f, 'Interleaved', 'core');
    function update() {
      view.redraw();
      const a = sched('serial').length, b = sched('inter').length;
      sS.set(a + ' cycles'); sI.set(b + ' cycles');
      if (st.split !== 'div') f.setWhy(`Every thread takes path ${st.split}: the warp is uniform, nothing is masked, and both schedules are the same ${a} cycles. Divergence costs nothing when it doesn't happen.`);
      else f.setWhy(`Divergent warp: run path A then path B and the warp needs <b>${a} cycles</b>, sitting idle while A waits for its load. If path B's three instructions can run in that wait instead, it needs <b>${b}</b>. Either way the warp issues A's and B's instructions one at a time, so divergence still costs issue slots; what interleaving can save is the waiting.`);
    }
    update();
  }

  /* ═════════════════════════ SCOREBOARD STALL ═════════════════════════ */

  const SB_SASS = '[barrier:  :  :  :  ]  /*line*/  INSTRUCTION Ri, [Rj] ; # Format: scoreboard info, line number, instruction, operands\n[B------:R-:W2:-:S04]  /*00f0*/  LDG.E.SYS R0, [R2] ;   # Sets scoreboard 2\n[B------:R-:W2:-:S01]  /*0100*/  LDG.E.SYS R5, [R4] ;   # `ptxas` intelligently reuses scoreboard 2\n...\n[B--2---:R-:W-:Y:S08]  /*0150*/  IMAD R0, R0, c[0x0][0x160], R5 ;  # Waits on scoreboard 2';

  GG.entry('scoreboard-stall', {
    render(body, ctx) {
      const s = ctx.html(body, `
<p>A <strong>scoreboard stall</strong> occurs when an instruction cannot be issued due to a dependency on the result of a prior instruction: it needs a value that an earlier instruction has not finished producing.</p>
<h3>What a scoreboard is</h3>
<p>A <b>scoreboard</b> is a hardware structure that tracks which <a data-term="registers">registers</a> are waiting to be written to by an in-flight instruction. When a slow instruction, such as a load from memory, is issued, its destination register is marked as "result pending". Any later instruction that reads that register has to wait until the mark is cleared. While it waits, its <a data-term="warp">warp</a> is in the <a data-term="warp-execution-state">stalled state</a>, and a warp cannot progress while it is stalled: its threads execute their instructions in order, so nothing behind the waiting instruction can go first.</p>
${GG.noteHTML('intuition', '<p>Think of a restaurant kitchen with a ticket rail. Each order for a slow dish gets a ticket on the rail; a waiter who needs that dish cannot leave the pass until its ticket comes down. The rail does not cook anything. It only keeps track of what is still on its way, so nobody serves a plate that is not ready.</p>')}
<p>Fig.&nbsp;1 plays out the glossary's own example, two global loads and a multiply-add that needs both results, one event at a time.</p>
<div data-slot="f1"></div>
<h3>Short and long scoreboard stalls</h3>
<p>Scoreboard stalls come in two types: <b>short</b> and <b>long</b>, named for how long the awaited result can take.</p>
<p>A <b>short scoreboard stall</b> occurs when an instruction is waiting on the result of a variable-latency instruction that does not leave the <a data-term="streaming-multiprocessor">Streaming Multiprocessor (SM)</a>. Most prominently, this includes <a data-term="shared-memory">shared memory</a> operations like <code>LDS</code> (load from shared) and <code>STS</code> (store to shared). It also includes certain <a data-term="special-function-unit">Special Function Unit (SFU)</a> operations, for reasons that are somewhat obscure but <a href="https://stackoverflow.com/questions/66123750/what-are-the-long-and-short-scoreboards-w-r-t-mio-l1tex">related</a> to their integration with the same Memory Input/Output (MIO) hardware as shared memory accesses.</p>
<p>A <b>long scoreboard stall</b> occurs when an instruction is waiting on the result of a memory operation that may leave the SM, such as <a data-term="global-memory">global memory</a> loads (<code>LDG</code>) or stores (<code>STG</code>). "May": a global load can be served by the SM's own L1 cache, but it can also have to travel to the L2 cache or all the way to GPU RAM, hundreds of cycles away. Long scoreboard stalls dominate <a data-term="memory-bound">memory-bound</a> code. Classify a few instructions in Fig.&nbsp;2.</p>
<div data-slot="f2"></div>
<p>Which stalls pile up depends on what limits the kernel. A profiler can show this. Nsight Compute's <i>Warp State Statistics</i> section takes the average time between two consecutive instructions of a warp, the <em>warp cycles per issued instruction</em>, and splits it by the state the warp was in during those cycles. In <a data-term="memory-bound">memory-bound</a> code the long scoreboard bar towers over the rest: warps spend most of their time waiting for global loads. In <a data-term="compute-bound">compute-bound</a> code it shrinks, and waits for busy math pipes take over. Compare the typical shapes in Fig.&nbsp;3.</p>
<div data-slot="fws"></div>
${GG.noteHTML('beyond', '<p><b>Reading the warp states.</b> Nsight Compute samples the warps and reports, for each state, the average number of cycles spent in it per issued instruction. Its own guidance matches the glossary: when <i>Long Scoreboard</i> dominates, "the kernel is memory-latency-bound, which is not necessarily memory-bandwidth-bound"; when <i>Math Pipe Throttle</i> dominates, "the kernel is usually compute-pipeline-bound". <i>Selected</i> and <i>Not Selected</i> are scheduler states, not real stalls. A warp is <i>Selected</i> on the one cycle it issues, so that bar is always one cycle per issued instruction. <i>Not Selected</i> means the warp was eligible but the scheduler picked another one. The guide also advises to "only focus on stall reasons if the schedulers fail to issue every cycle": long stalls cost nothing while other warps keep the scheduler busy (<a data-term="latency-hiding">latency hiding</a>). And because samples are labelled by scoreboard, the scoreboard-sharing caveat further down applies to these bars too.</p>')}
<h3>Scoreboards in SASS</h3>
<p>Some scoreboard information is legible in <a data-term="streaming-assembler">Streaming Assembler (SASS)</a>. For instance, you can see that each warp has six distinct barrier identifiers, numbered 0 to 5, which the compiler uses to track data dependencies between instructions. Concretely, below is what you might see from a <code>cuobjdump</code> with the <code>--dump-sass</code> flag:</p>
<div data-slot="code"></div>
${GG.noteHTML('check', '<p><b>Where the bracketed column comes from.</b> Run stock <code>cuobjdump --dump-sass</code> and you get the SASS with each instruction\'s hexadecimal encoding, but no <code>[B------:R-:W2:-:S04]</code> column: NVIDIA\'s tool does not decode the control bits. The bracketed form is how community decoders, such as CuAssembler, spell out the control bits they extract from those hexadecimal words. The glossary\'s "what you might see" is that decoded view.</p>')}
<p>The <code>IMAD</code> instruction has a barrier (<code>B--2---</code>) on scoreboard 2, indicating that it requires that bit flag to be cleared before it can issue. Each scoreboard is really a small counter rather than a single bit: both loads add one to it, each returning result subtracts one, and "cleared" means back to zero. Both <code>LDG</code> instructions increment (<code>W2</code>, "write") scoreboard 2 when they are issued, so that the <code>IMAD</code> instruction will have the correct values in registers <code>R0</code> and <code>R5</code> before it executes. Note the comment on the second load: <code>ptxas</code>, the assembler that turns PTX into SASS (run for you by <a data-term="nvcc">nvcc</a>), reuses scoreboard 2 instead of taking a second one, because the <code>IMAD</code> needs both loads anyway.</p>
<p>There may be multiple scoreboards to barrier on, such as <code>B01--4-</code>, which means wait until scoreboards 0, 1 and 4 are all cleared. Each of the six positions after the <code>B</code> stands for one scoreboard: a digit means "wait on this one", a dash means "don't". When a data dependency has been satisfied, the respective scoreboard is decremented. Decode and build these fields in Fig.&nbsp;4.</p>
<div data-slot="f3"></div>
${GG.noteHTML('beyond', '<p><b>The other fields.</b> NVIDIA does not document these control bits. They were reverse-engineered by the community: maxas for Maxwell GPUs, and later tools such as CuAssembler for Volta and newer. In that reading, <code>R</code> names a scoreboard to set until the instruction has <em>read</em> its source registers (so a later instruction may not overwrite them early), <code>Y</code> is a yield hint that lets the scheduler switch to another warp, and <code>S</code> is a stall count: how many cycles to wait before issuing this warp\'s next instruction, which is how the compiler handles instructions with a fixed, known latency without any scoreboard at all. The <code>/*00f0*/</code> column is the instruction\'s byte offset, in hexadecimal. On Volta and later GPUs every instruction is 16 bytes, so the <code>...</code> between <code>/*0100*/</code> and <code>/*0150*/</code> hides four instructions.</p>')}
${GG.noteHTML('warn', '<p><b>Scoreboard reuse can fool the profiler.</b> Because the compiler shares scoreboards between instructions, the stall classification from Nsight Compute can be incorrect: a long and a short scoreboard stall may be conflated if they use the same scoreboard. Pick <i>LDS + LDG share 2</i> in Fig.&nbsp;1 to see such a wait.</p>')}
<h3>An old idea, used differently</h3>
<p><a href="https://www.cs.umd.edu/~meesh/411/website/projects/dynamic/scoreboard.html">Scoreboarding</a> for dependency tracking in dynamic instruction scheduling dates back to the "first supercomputer", the <a href="https://en.wikipedia.org/wiki/CDC_6600">Control Data Corporation 6600</a>, one of which <a href="https://www.ams.org/journals/bull/1966-72-06/S0002-9904-1966-11654-3/S0002-9904-1966-11654-3.pdf">disproved Euler's sum of powers conjecture</a> in 1966.</p>
${GG.noteHTML('history', '<p>The CDC 6600, designed by Seymour Cray, was released in 1964, with the first machines delivered in 1965, and was the fastest computer in the world until 1969. Its scoreboard let several functional units work at once while keeping every instruction\'s inputs and outputs in the right order. In 1966 L. J. Lander and T. R. Parkin used one to search for sums of fifth powers. Euler had conjectured in 1769 that it takes at least <i>n</i> <i>n</i>-th powers to add up to an <i>n</i>-th power. They found four fifth powers that do it, in a paper two sentences long. Check their counterexample in Fig.&nbsp;5.</p>')}
<div data-slot="f4"></div>
<p>Unlike in CPUs, scoreboarding in GPUs isn't used for out-of-order execution <em>within</em> <a data-term="thread">threads</a> (instruction-level parallelism), only <em>across</em> them (thread-level parallelism); see <a href="https://patents.google.com/patent/US7676657">this NVIDIA patent</a>. A CPU core that hits a waiting instruction looks further down the same thread for independent work to run early. A GPU warp scheduler keeps each warp strictly in order and simply issues from another warp instead, as in Fig.&nbsp;6.</p>
<div data-slot="f5"></div>
<p>For more details about scoreboard implementation on GPUs, see <a href="https://pages.cs.wisc.edu/~sinclair/courses/cs758/fall2019/handouts/lecture/cs758-fall19-gpu_uarch2.pdf">Professor Matthew D. Sinclair's slides</a>.</p>
<div data-slot="reading"></div>`);
      guard(() => mkCode(ctx, s.code, {
        lang: 'nasm', code: SB_SASS, wide: true, caption: 'cuobjdump --dump-sass, annotated',
        notes: {
          1: 'The header names the columns: the scoreboard (control) information in brackets, the line, the instruction and its operands.',
          2: '<b>First load.</b> <code>B------</code>: waits on no scoreboard. <code>W2</code>: when it issues, it increments scoreboard 2, which counts down again once <code>R0</code> has been written. <code>LDG</code> is a global load, so a wait on it is a <em>long</em> scoreboard stall.',
          3: '<b>Second load</b>, into <code>R5</code>. It increments scoreboard 2 as well: <code>ptxas</code> reuses the same scoreboard rather than taking another of the six.',
          4: 'Instructions the glossary elides. Judging by the offsets (<code>0x0100</code> to <code>0x0150</code>, 16 bytes per instruction), there are four of them.',
          5: '<b>The consumer.</b> <code>B--2---</code>: it may not issue until scoreboard 2 is back to zero, that is until both loads have delivered <code>R0</code> and <code>R5</code>. It computes <code>R0</code> × <code>c[0x0][0x160]</code> + <code>R5</code>; <code>c[0x0][0x160]</code> is a value in constant bank 0, where kernel parameters live (Beyond the glossary).',
        },
      }));
      guard(() => sbStepper(ctx, s.f1));
      guard(() => sbClassify(ctx, s.f2));
      guard(() => sbWarpStates(ctx, s.fws));
      guard(() => sbDecoder(ctx, s.f3));
      guard(() => sbEuler(ctx, s.f4));
      guard(() => sbIlpTlp(ctx, s.f5));
      ctx.reading(s.reading, [
        { href: 'https://stackoverflow.com/questions/66123750/what-are-the-long-and-short-scoreboards-w-r-t-mio-l1tex', label: 'Stack Overflow: What are the long and short scoreboards w.r.t. MIO/L1TEX?', note: 'why some SFU operations count as short' },
        { href: 'https://www.cs.umd.edu/~meesh/411/website/projects/dynamic/scoreboard.html', label: 'University of Maryland: Scoreboarding', note: 'dynamic scheduling with a scoreboard, step by step' },
        { href: 'https://en.wikipedia.org/wiki/CDC_6600', label: 'Wikipedia: CDC 6600', note: 'the "first supercomputer"' },
        { href: 'https://www.ams.org/journals/bull/1966-72-06/S0002-9904-1966-11654-3/S0002-9904-1966-11654-3.pdf', label: 'Lander & Parkin (1966): Counterexample to Euler\'s conjecture on sums of like powers', note: 'Bulletin of the AMS' },
        { href: 'https://patents.google.com/patent/US7676657', label: 'NVIDIA patent US7676657', note: 'scoreboarding across threads' },
        { href: 'https://pages.cs.wisc.edu/~sinclair/courses/cs758/fall2019/handouts/lecture/cs758-fall19-gpu_uarch2.pdf', label: 'Matthew D. Sinclair: GPU microarchitecture slides (CS 758, UW–Madison)', note: 'scoreboard implementation on GPUs' },
        { href: 'https://docs.nvidia.com/nsight-compute/ProfilingGuide/index.html#warp-stall-reasons', label: 'Nsight Compute Kernel Profiling Guide: warp stall reasons', note: 'Long Scoreboard, Short Scoreboard and the other warp states of Fig. 3 (Beyond the glossary)' },
      ]);
    },
  });

  /* Fig: the glossary's example, event by event. */
  const SB_SC = {
    ldg: { label: 'Two LDGs (glossary)', loads: [{ op: 'LDG.E.SYS', dst: 'R0', src: 'R2', lat: 400, long: true }, { op: 'LDG.E.SYS', dst: 'R5', src: 'R4', lat: 400, long: true }] },
    lds: { label: 'Two LDS (short)', loads: [{ op: 'LDS', dst: 'R0', src: 'R2', lat: 30, long: false }, { op: 'LDS', dst: 'R5', src: 'R4', lat: 30, long: false }] },
    mix: { label: 'LDS + LDG share 2', loads: [{ op: 'LDS', dst: 'R0', src: 'R2', lat: 30, long: false }, { op: 'LDG.E.SYS', dst: 'R5', src: 'R4', lat: 400, long: true }] },
  };
  function sbStepper(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Scoreboard 2, event by event', hint: 'step through · switch the loads', wide: true,
      caption: 'One warp running the glossary\'s SASS: its instructions with their control codes (the arrow marks the next one to issue), its six scoreboards, each a small counter, and the destination registers (hatched while a result is pending) with where each load goes. Underneath, a timeline with a broken axis: the zig-zag cuts mark long stretches of cycles that are not drawn (the label says how many), and the thin strip below it draws the same run to scale. Amber is warp 0 stalled, pink is other warps issuing in the meantime (if the SM has eligible ones). In the <i>LDS + LDG share 2</i> scenario two more rows compare what the wait is really for with the single scoreboard it is recorded against. The latencies (about 400 cycles for a global load, 30 for shared memory) and the one-cycle spacing of the four elided instructions are illustrative; the issue times of the two loads follow their <code>S04</code> stall count. The second and third scenarios swap in shared-memory loads to show a short scoreboard and a shared one.',
    });
    const st = { sc: 'ldg', step: 0 };
    const timeline = () => {
      const L = SB_SC[st.sc].loads;
      const iss = [0, 4];
      const ret = L.map((l, i) => iss[i] + l.lat);
      const r1 = Math.min(...ret), r2v = Math.max(...ret);
      return { L, iss, ret, first: ret.indexOf(r1), r1, r2: r2v, imad: r2v + 1 };
    };
    const STEPS = 8;
    const stepT = (T, k) => [null, 0, 4, 8, 9, T.r1, T.r2, T.imad][k];
    const view = rsvg(f.stage, 'A warp\'s instructions, its six scoreboards, its pending registers and a timeline of issue and stall.', (svg, w) => {
      const mob = w < 760;
      const T = timeline(), k = st.step, t = stepT(T, k);
      const hatchB = hatchDef(svg, 'pfc-hatch-sb', 'rgba(111,166,255,.45)');
      const hatchA = (() => { const defs = GG.svg('defs', null, svg); const pat = GG.svg('pattern', { id: 'pfc-hatch-sb2', width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs); R(pat, 0, 0, 2.5, 6, 'fill:rgba(255,198,92,.55)'); return 'url(#pfc-hatch-sb2)'; })();
      // state
      const issued = [k >= 1, k >= 2, k >= 3, k >= 7];
      const returned = T.L.map((l, i) => t != null && t >= T.ret[i]);
      const sb2 = (issued[0] && !returned[0] ? 1 : 0) + (issued[1] && !returned[1] ? 1 : 0);
      const stalled = k >= 4 && k <= 6;
      // ── instruction list
      const fsI = mob ? 9 : 10.5;
      const insW = mob ? w : 492;
      const rowsI = [
        { cc: '[B------:R-:W2:-:S04]', txt: `${T.L[0].op} ${T.L[0].dst}, [${T.L[0].src}]` },
        { cc: '[B------:R-:W2:-:S01]', txt: `${T.L[1].op} ${T.L[1].dst}, [${T.L[1].src}]` },
        { cc: '', txt: '...   four more instructions' },
        { cc: '[B--2---:R-:W-:Y:S08]', txt: 'IMAD R0, R0, c[0x0][0x160], R5' },
      ];
      Tx(svg, 0, 12, 'WARP 0 · INSTRUCTIONS', { fs: 10, fill: 'var(--ink-3)', ls: '0.08em' });
      const rh = mob ? 34 : 36;
      const nextIdx = k === 0 ? 0 : k === 1 ? 1 : k === 2 ? 2 : k <= 6 ? 3 : -1;
      rowsI.forEach((r, i) => {
        const y = 22 + i * rh;
        const isStall = i === 3 && stalled;
        const fill = issued[i] ? 'rgba(69,212,155,.08)' : isStall ? 'var(--control-a)' : 'rgba(8,9,14,.45)';
        const stroke = issued[i] ? 'rgba(69,212,155,.5)' : isStall ? 'var(--control)' : 'var(--line-2)';
        R(svg, 14, y, insW - 14, rh - 6, `fill:${fill};stroke:${stroke}`, { rx: 6 });
        if (i === nextIdx) arrowHead(svg, 10, y + (rh - 6) / 2, 0, 8, 'var(--accent)');
        if (mob) {
          if (r.cc) Tx(svg, 22, y + 11.5, r.cc, { fs: fsI, fill: 'var(--control)' });
          Tx(svg, 22, y + (r.cc ? 23 : 17), r.txt, { fs: fsI, fill: i === 2 ? 'var(--ink-3)' : 'var(--ink)' });
        } else {
          if (r.cc) Tx(svg, 24, y + 19, r.cc, { fs: fsI, fill: 'var(--control)' });
          Tx(svg, 24 + (r.cc ? tw(r.cc, fsI) + 14 : 0), y + 19, r.txt, { fs: fsI, fill: i === 2 ? 'var(--ink-3)' : 'var(--ink)' });
        }
        const stTxt = issued[i] ? (i === 0 ? 'issued @0' : i === 1 ? 'issued @4' : i === 2 ? 'issued @5–8' : `issued @${T.imad}`) : isStall ? 'stalled' : '';
        if (stTxt) Tx(svg, insW - 8, y + (mob ? 23 : 19), stTxt, { fs: mob ? 8.5 : 9.5, anchor: 'end', fill: issued[i] ? 'var(--core)' : 'var(--control)', weight: 600 });
      });
      let y1 = 22 + 4 * rh + 8;
      // ── scoreboards
      const sbX = mob ? 0 : insW + 26, sbY = mob ? y1 + 4 : 0;
      Tx(svg, sbX, sbY + 12, 'SCOREBOARDS', { fs: 10, fill: 'var(--ink-3)', ls: '0.08em' });
      const bs = mob ? 34 : 38, bg = mob ? 6 : 6;
      for (let b = 0; b < 6; b++) {
        const bx = sbX + b * (bs + bg), by = sbY + 22;
        const n = b === 2 ? sb2 : 0;
        R(svg, bx, by, bs, bs, n ? 'fill:var(--control-a);stroke:var(--control);stroke-width:1.6' : 'fill:rgba(8,9,14,.5);stroke:var(--line-2)', { rx: 6 });
        Tx(svg, bx + bs / 2, by + bs / 2 + 6, String(n), { fs: 17, anchor: 'middle', fill: n ? 'var(--control)' : 'var(--ink-3)', weight: 700 });
        Tx(svg, bx + bs / 2, by + bs + 13, 'SB' + b, { fs: 9.5, anchor: 'middle', fill: b === 2 ? 'var(--ink)' : 'var(--ink-3)' });
      }
      const sbNote = k === 0 ? 'all clear' : stalled ? `IMAD waits for SB2 = 0` : k >= 7 ? 'SB2 clear: IMAD issued' : sb2 ? `SB2 counts ${sb2} in flight` : '';
      Tx(svg, sbX, sbY + 22 + bs + 32, sbNote, { fs: 10.5, fill: stalled ? 'var(--control)' : 'var(--ink-2)', weight: 600 });
      // ── registers + memory
      const rgX = mob ? 0 : sbX + 6 * (bs + bg) + 24, rgY = mob ? sbY + 22 + bs + 46 : 0, rgW = mob ? w : w - rgX;
      Tx(svg, rgX, rgY + 12, 'REGISTERS · WHERE THE LOADS GO', { fs: 10, fill: 'var(--ink-3)', ls: '0.08em' });
      ['R0', 'R5'].forEach((rn, i) => {
        const bx = rgX + i * 70, by = rgY + 22;
        const pend = issued[i] && !returned[i];
        const ready = returned[i];
        R(svg, bx, by, 60, 30, pend ? `fill:${hatchB};stroke:var(--memory)` : ready ? 'fill:var(--memory-a);stroke:var(--memory);stroke-width:1.5' : 'fill:rgba(8,9,14,.5);stroke:var(--line-2)', { rx: 5 });
        Tx(svg, bx + 30, by + 19, rn, { fs: 12, anchor: 'middle', fill: ready ? 'var(--memory)' : 'var(--ink)', weight: 600 });
        Tx(svg, bx + 30, by + 44, pend ? 'pending' : ready ? (k >= 7 && i === 0 ? 'IMAD result' : 'ready') : '—', { fs: 9, anchor: 'middle', fill: pend ? 'var(--memory)' : 'var(--ink-3)' });
      });
      // memory path: SM box with shared memory / L1, then L2 · GPU RAM outside
      const my = rgY + 78, mw = Math.max(200, rgW - 4), smW = mw * 0.56;
      R(svg, rgX, my, smW, 62, 'fill:none;stroke:var(--line-2);stroke-dasharray:4 3', { rx: 8 });
      Tx(svg, rgX + 8, my + 13, 'inside the SM', { fs: 9, fill: 'var(--ink-3)' });
      R(svg, rgX + 8, my + 20, smW - 16, 16, 'fill:var(--memory-a);stroke:rgba(111,166,255,.5)', { rx: 3 });
      const pill = tw('shared memory · L1', 9) + 14 <= smW - 16 ? 'shared memory · L1' : tw('shared mem · L1', 9) + 14 <= smW - 16 ? 'shared mem · L1' : 'shared · L1';
      Tx(svg, rgX + 14, my + 31.5, pill, { fs: 9, fill: 'var(--memory)' });
      const ox = rgX + smW + 10, ow = mw - smW - 10;
      R(svg, ox, my, ow, 62, 'fill:rgba(111,166,255,.06);stroke:rgba(111,166,255,.4)', { rx: 8 });
      Tx(svg, ox + 8, my + 13, 'outside the SM', { fs: 9, fill: 'var(--ink-3)' });
      Tx(svg, ox + 8, my + 31.5, 'L2 · GPU RAM', { fs: 9, fill: 'var(--memory)' });
      T.L.forEach((l, i) => {
        if (!issued[i] || returned[i]) return;
        const cx = l.long ? ox + ow / 2 + (i ? 12 : -12) : rgX + smW / 2 + (i ? 14 : -14);
        C(svg, cx, my + 49, 5.5, `fill:${l.long ? 'var(--control)' : 'var(--special)'}`);
        Tx(svg, cx, my + 52.5, String(i + 1), { fs: 7.5, anchor: 'middle', fill: '#0b0c12', weight: 700, pe: false });
      });
      const topH = mob ? my + 62 + 10 : Math.max(y1, my + 62 + 6);
      // ── timeline with a broken axis
      const ty = topH + 30;
      const segs = [[0, 12], [12, T.r1 - 3], [T.r1 - 3, T.r2 + 4]];
      if (T.r2 - T.r1 > 12) segs.splice(2, 1, [T.r1 - 3, T.r1 + 4], [T.r1 + 4, T.r2 - 3], [T.r2 - 3, T.r2 + 4]);
      const exp = segs.map((sg, i) => (i % 2 === 0 ? 1 : 0));
      const brkW = 34, totExp = segs.reduce((a, sg, i) => a + (exp[i] ? sg[1] - sg[0] : 0), 0);
      const avail = w - 90 - brkW * exp.filter((e) => !e).length;
      const X = (tt) => {
        let x = 90;
        for (let i = 0; i < segs.length; i++) {
          const [a, b] = segs[i];
          const sw = exp[i] ? ((b - a) / totExp) * avail : brkW;
          if (tt <= b || i === segs.length - 1) return x + clamp((tt - a) / (b - a), 0, 1) * sw;
          x += sw;
        }
        return x;
      };
      const mixRows = st.sc === 'mix';
      const lateLabels = [];
      const extra = mixRows ? 40 : 0;
      const lanes = [['warp 0', ty], ['other warps', ty + 22]];
      if (mixRows) lanes.push(['waits for', ty + 44], ['SB2 says', ty + 62]);
      lanes.forEach(([lab, yy], i) => Tx(svg, 80, yy + (i < 2 ? 11 : 9.5), lab, { fs: i < 2 ? 9.5 : 9, anchor: 'end', fill: i < 2 ? 'var(--ink-2)' : 'var(--ink-3)' }));
      R(svg, 90, ty, w - 90, 16, 'fill:rgba(255,255,255,.03)', { rx: 2 });
      R(svg, 90, ty + 22, w - 90, 16, 'fill:rgba(255,255,255,.03)', { rx: 2 });
      const tick = (tt, yy, col) => R(svg, X(tt) - 1.5, yy + 1, Math.max(3, X(tt + 1) - X(tt) - 1), 14, `fill:${col}`, { rx: 1.5 });
      const upTo = t == null ? -1 : t;
      [0, 4, 5, 6, 7, 8].forEach((tt) => { if (tt <= upTo) tick(tt, ty, 'var(--core)'); });
      if (k >= 4) { const e = Math.min(upTo, T.r2); R(svg, X(9), ty + 1, Math.max(2, X(e + 1) - X(9)), 14, `fill:${hatchA};stroke:var(--control);stroke-width:1`, { rx: 2 }); R(svg, X(9), ty + 23, Math.max(2, X(e + 1) - X(9)), 14, 'fill:var(--special);opacity:.45', { rx: 2 }); }
      if (k >= 7) tick(T.imad, ty, 'var(--core)');
      // LDS + LDG on one scoreboard: what the wait is really for, against the one label the scoreboard carries
      if (mixRows && k >= 4) {
        const e = Math.min(upTo, T.r2) + 1;
        // A span's label goes in the widest stretch of it that is drawn (not inside a zig-zag break), using the
        // longest of its candidate texts that fits there.
        const seg = (a, b, yy, tone, labs) => {
          if (b <= a) return;
          const x0 = X(a), x1 = X(b);
          R(svg, x0, yy, Math.max(2, x1 - x0), 13, `fill:var(--${tone}-a);stroke:var(--${tone});stroke-width:1`, { rx: 2 });
          let best = null;
          segs.forEach(([sa, sb], i) => {
            if (!exp[i]) return;
            const lo = Math.max(a, sa), hi = Math.min(b, sb);
            if (hi <= lo) return;
            const pa = X(lo), pb = X(hi);
            if (!best || pb - pa > best[1] - best[0]) best = [pa, pb];
          });
          // longest text first: inside a drawn stretch if it fits there; otherwise (phones) centred on the whole
          // span, on an opaque pill drawn after the zig-zag breaks so they cannot cut it
          for (const l of labs) {
            if (best && best[1] - best[0] > tw(l, 9) + 8) { Tx(svg, (best[0] + best[1]) / 2, yy + 9.5, l, { fs: 9, anchor: 'middle', fill: `var(--${tone})`, weight: 600, pe: false }); return; }
            if (x1 - x0 > tw(l, 9) + 12) { lateLabels.push([(x0 + x1) / 2, yy, l, tone]); return; }
          }
        };
        seg(9, Math.min(e, T.r1), ty + 44, 'special', ['LDS and LDG', 'LDS+LDG', 'both']);
        seg(T.r1, e, ty + 44, 'memory', ['LDG only: long', 'LDG only', 'LDG']);
        seg(9, e, ty + 62, 'control', ['one wait on scoreboard 2: short or long?', 'short or long?', 'short? long?', '?']);
      }
      // breaks: a zig-zag cut through every lane, labelled with the number of cycles not drawn
      for (let i = 0; i < segs.length; i++) if (!exp[i]) {
        const xa = X(segs[i][0]), xm = xa + brkW / 2, y0z = ty - 3, y1z = ty + 41 + extra;
        R(svg, xm - 5, y0z, 10, y1z - y0z, 'fill:#11121c');
        [-5, 5].forEach((dx) => {
          let d = `M${r2(xm + dx)},${r2(y0z)}`;
          for (let yy = y0z, n = 0; yy < y1z; yy += 5, n++) d += `L${r2(xm + dx + (n % 2 ? -2.5 : 2.5))},${r2(Math.min(y1z, yy + 5))}`;
          Pa(svg, d, 'fill:none;stroke:var(--ink-2);stroke-width:1.3');
        });
        const nSkip = segs[i][1] - segs[i][0];
        Tx(svg, xm, ty - 8, mob ? `${nSkip} cycles` : `${nSkip} cycles not drawn`, { fs: 9, anchor: 'middle', fill: 'var(--ink-2)', weight: 600 });
      }
      lateLabels.forEach(([cx, yy, lab, tone]) => {
        const lw = tw(lab, 9) + 8;
        R(svg, cx - lw / 2, yy + 0.5, lw, 12, `fill:#11121c;stroke:var(--${tone});stroke-width:1`, { rx: 2 });
        Tx(svg, cx, yy + 9.5, lab, { fs: 9, anchor: 'middle', fill: `var(--${tone})`, weight: 600, pe: false });
      });
      const ay = ty + 54 + extra;
      const marks = [0, 4, 9, T.r1, T.r2, T.imad].filter((v, i, a) => a.indexOf(v) === i && !(v === T.r2 && T.imad - T.r2 <= 2));
      let lastX = -99;
      marks.forEach((m) => { const x = X(m) + 1; if (x - lastX < 30) return; lastX = x; Tx(svg, x, ay, String(m), { fs: 9, anchor: 'middle', fill: 'var(--ink-3)' }); });
      Tx(svg, 80, ay, 'cycle', { fs: 9, anchor: 'end', fill: 'var(--ink-3)' });
      if (t != null) { const x = X(t) + 1; Ln(svg, x, ty - 2, x, ty + 42 + extra, 'stroke:var(--accent);stroke-width:1.5'); }
      // the same run drawn to scale: the issue burst is a sliver, the stall is nearly everything
      const sy = ay + 14, span = T.imad + 1, XS = (tt) => 90 + (tt / span) * (w - 90);
      Tx(svg, 80, sy + 8, 'to scale', { fs: 9, anchor: 'end', fill: 'var(--ink-3)' });
      R(svg, 90, sy, w - 90, 10, 'fill:rgba(255,255,255,.03)', { rx: 2 });
      if (upTo >= 0) R(svg, XS(0), sy + 1, Math.max(1.5, XS(Math.min(upTo, 8) + 1) - XS(0)), 8, 'fill:var(--core)', { rx: 1 });
      if (k >= 4) R(svg, XS(9), sy + 1, Math.max(1.5, XS(Math.min(upTo, T.r2) + 1) - XS(9)), 8, `fill:${hatchA};stroke:var(--control);stroke-width:1`, { rx: 1 });
      if (k >= 7) R(svg, XS(T.imad), sy + 1, Math.max(1.5, XS(T.imad + 1) - XS(T.imad)), 8, 'fill:var(--core)', { rx: 1 });
      Tx(svg, w, sy + 22, `cycles 0 to ${T.imad}, every cycle the same width`, { fs: 9, anchor: 'end', fill: 'var(--ink-3)' });
      return sy + 26;
    });
    const sC = stat(f, 'Cycle', 'ink');
    const sB = stat(f, 'Scoreboard 2', 'control');
    const sW = stat(f, 'Warp 0', 'accent');
    const stepper = GG.ui.stepper(f.controls, { label: 'Event', steps: Array.from({ length: STEPS }, (_, i) => ({ label: 'event ' + i })), autoplay: 1900, start: 4, onStep: (i) => { st.step = i; update(); } });
    GG.ui.seg(f.controls, { label: 'Loads', options: Object.keys(SB_SC).map((k) => ({ value: k, label: SB_SC[k].label })), value: st.sc, onChange: (v) => { st.sc = v; update(); } });
    function update() {
      view.redraw();
      const T = timeline(), k = st.step, t = stepT(T, k);
      const L = T.L;
      const kind = (l) => (l.long ? 'long' : 'short');
      const returned = L.map((l, i) => t != null && t >= T.ret[i]);
      const issued = [k >= 1, k >= 2];
      const sb2 = (issued[0] && !returned[0] ? 1 : 0) + (issued[1] && !returned[1] ? 1 : 0);
      sC.set(t == null ? '—' : String(t));
      sB.set(String(sb2));
      const stalled = k >= 4 && k <= 6;
      const stallKind = stalled ? (st.sc === 'mix' ? 'stalled: short or long?' : 'stalled: ' + kind(L[0]) + ' SB') : k >= 7 ? 'issued IMAD' : 'issuing';
      sW.set(stallKind);
      const ln = (i) => `<code>${L[i].op}</code> into <code>${L[i].dst}</code>`;
      let w;
      switch (k) {
        case 0: w = 'All six scoreboards of warp 0 read 0: nothing is in flight. The warp is about to issue its first load.'; break;
        case 1: w = `Cycle 0: the warp issues ${ln(0)}. Its control code says <code>W2</code>, so <b>scoreboard 2 goes from 0 to 1</b> and <code>${L[0].dst}</code> is now pending. <code>S04</code>: wait 4 cycles before this warp's next instruction.`; break;
        case 2: w = `Cycle 4: ${ln(1)} issues. It also says <code>W2</code>: ptxas reused the scoreboard, so <b>scoreboard 2 now counts 2</b> results in flight.`; break;
        case 3: w = 'Cycles 5 to 8: the four elided instructions issue. They do not read <code>R0</code> or <code>R5</code>, so they wait on nothing, and the loads keep travelling.'; break;
        case 4: w = `Cycle 9: <code>IMAD</code> is next. Its <code>B--2---</code> says it may not issue until scoreboard 2 is 0, and it is ${sb2}. Warp 0 is <b>stalled</b>: a ${st.sc === 'mix' ? 'scoreboard stall on scoreboard 2, which a short-latency <code>LDS</code> and a long-latency <code>LDG</code> both set' : `<b>${kind(L[0])} scoreboard stall</b>, since it waits on ${L[0].long ? 'global loads that may leave the SM' : 'shared-memory loads that stay inside the SM'}`}. The warp scheduler issues from other warps meanwhile.`; break;
        case 5: w = `Cycle ${T.r1}: the ${T.first ? 'second' : 'first'} load's data lands in <code>${L[T.first].dst}</code> and <b>scoreboard 2 is decremented to ${sb2}</b>. Still not zero: <code>IMAD</code> keeps waiting.${st.sc === 'mix' ? ' From here on the wait is entirely for the global load, yet it is the same scoreboard the shared-memory load used: a profiler attributing stalls by scoreboard can call this wait short, long, or a mix of both.' : ''}`; break;
        case 6: w = `Cycle ${T.r2}: the other load lands in <code>${L[1 - T.first].dst}</code>: <b>scoreboard 2 is back to 0</b>. The dependency is satisfied.`; break;
        default: w = `Cycle ${T.imad}: <code>IMAD</code> issues with both inputs ready: <code>R0</code> = <code>R0</code> × <code>c[0x0][0x160]</code> + <code>R5</code>. Warp 0 was stalled for ${T.imad - 9} cycles, which only other warps could fill.`;
      }
      f.setWhy(w);
    }
    update();
    void stepper;
  }

  /* Fig: where a warp's cycles go, by warp state, for three kinds of kernel. The profiles are illustrative
     shapes (not measurements); state names and descriptions follow Nsight Compute's Warp State Statistics. */
  const WS_REASONS = [
    { k: 'long', name: 'Long Scoreboard', tone: 'memory', sb: true, html: 'waiting on a scoreboard for an L1TEX operation (local, global, surface or texture memory): the result of an <code>LDG</code>, for example. A <b>long scoreboard stall</b>.' },
    { k: 'short', name: 'Short Scoreboard', tone: 'special', sb: true, html: 'waiting on a scoreboard for an MIO operation that stays in the SM: mostly shared-memory instructions such as <code>LDS</code>, also special math (<code>MUFU</code>) and dynamic branches. A <b>short scoreboard stall</b>.' },
    { k: 'lg', name: 'LG Throttle', tone: 'control', html: 'waiting for room in the queue for local and global memory instructions, which fills when a kernel issues them very often.' },
    { k: 'mio', name: 'MIO Throttle', tone: 'control', html: 'waiting for room in the MIO instruction queue, which fills under heavy use of shared memory, special math or dynamic branches.' },
    { k: 'math', name: 'Math Pipe Throttle', tone: 'control', html: 'waiting for a math pipe that every active warp wants at once. When it dominates, the kernel is usually compute-bound.' },
    { k: 'wait', name: 'Wait', tone: 'control', html: 'waiting out a fixed-latency dependency, such as an <code>FFMA</code> that needs the result of the one before it. No scoreboard is involved: in the control codes this is the job of the <code>S</code> stall count.' },
    { k: 'bar', name: 'Barrier', tone: 'control', html: 'waiting at a block-wide barrier (<code>__syncthreads()</code>) for the other warps of the thread block.' },
    { k: 'other', name: 'Other stalls', tone: 'control', html: 'everything else Nsight Compute lists, such as No Instruction, Branch Resolving, Dispatch Stall, Membar and Drain, lumped together here.' },
    { k: 'nosel', name: 'Not Selected', tone: 'ink', sched: true, html: 'eligible to issue, but the scheduler picked another warp. A scheduler state, not a stall: plenty of these means there are warps to spare.' },
    { k: 'sel', name: 'Selected', tone: 'ink', sched: true, html: 'the cycle on which the warp issues. Exactly one per issued instruction, so this bar is always 1.' },
  ];
  const WS_PROFILES = {
    mem: { label: 'Memory-bound', ex: 'a streaming kernel, like a large vector add: every thread loads two values from global memory, adds them and stores the sum',
      v: { long: 14, short: 0.2, lg: 1.6, mio: 0.1, math: 0.1, wait: 0.9, bar: 0, other: 0.6, nosel: 0.2, sel: 1 } },
    comp: { label: 'Compute-bound', ex: 'a loop of dependent FP32 fused multiply-adds on values held in registers, with plenty of warps',
      v: { long: 0.2, short: 0.1, lg: 0, mio: 0, math: 2.2, wait: 1.6, bar: 0, other: 0.3, nosel: 2.4, sel: 1 } },
    smem: { label: 'Shared-memory heavy', ex: 'a kernel that stages tiles in shared memory and reads them back with bank conflicts, synchronizing the block between phases',
      v: { long: 2, short: 4.5, lg: 0.2, mio: 2, math: 0.1, wait: 0.8, bar: 1.2, other: 0.4, nosel: 0.3, sel: 1 } },
  };
  function sbWarpStates(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Where a warp\'s cycles go', hint: 'switch the kernel · hover or focus a bar', wide: true,
      caption: 'The kind of chart Nsight Compute draws in its Warp State Statistics section: for each warp state, the average number of cycles a warp spends in it per instruction it issues. The strip on top stacks the same bars, so its length is the warp cycles per issued instruction and each colour\'s share of it is that state\'s share of the time. Blue is the long scoreboard, pink the short scoreboard, amber every other stall; grey states are the scheduler\'s, not stalls. The three profiles are <b>illustrative shapes, not measured data</b>: real numbers depend on the kernel, the GPU and the number of warps. State names and descriptions follow Nsight Compute\'s documentation (Beyond the glossary).',
    });
    const st = { p: 'mem', hover: null };
    const AXMAX = 20;
    const prof = () => WS_PROFILES[st.p];
    const total = () => WS_REASONS.reduce((a, r) => a + prof().v[r.k], 0);
    const fill = (r) => (r.sched ? (r.k === 'sel' ? 'var(--ink-2)' : 'var(--ink-3)') : `var(--${r.tone})`);
    let rowEls = [];
    const view = rsvg(f.stage, 'Bars of warp cycles per issued instruction, by warp state, with a stacked strip of their total.', (svg, w) => {
      const mob = w < 640;
      const padL = mob ? 112 : 150, padR = mob ? 34 : 44, rh = mob ? 21 : 23;
      const X = (v) => padL + (Math.min(v, AXMAX) / AXMAX) * (w - padL - padR);
      const v = prof().v, tot = total();
      // the stacked strip
      Tx(svg, padL - 8, 23, mob ? 'cycles / instr.' : 'cycles per instruction', { fs: mob ? 9 : 10.5, anchor: 'end', fill: 'var(--ink-2)', weight: 600 });
      let x = padL;
      WS_REASONS.forEach((r) => {
        const ww = X(v[r.k]) - padL;
        if (ww <= 0) return;
        R(svg, x, 10, Math.max(0.5, ww - 0.6), 20, `fill:${fill(r)}`, { rx: 1.5 });
        x += ww;
      });
      Tx(svg, Math.min(x + 6, w - padR + 6), 24.5, GG.fmt.sig(tot, 3), { fs: 12, fill: 'var(--ink)', weight: 700 });
      // axis
      const y0 = 50;
      [0, 5, 10, 15, 20].forEach((t) => {
        Ln(svg, X(t), y0 - 6, X(t), y0 + WS_REASONS.length * rh, 'stroke:var(--line);stroke-width:1');
        Tx(svg, X(t), y0 - 10, String(t), { fs: 9, anchor: 'middle', fill: 'var(--ink-3)' });
      });
      rowEls = [];
      WS_REASONS.forEach((r, i) => {
        const y = y0 + i * rh;
        const g = G(svg, { tabindex: '0', role: 'button', 'aria-label': `${r.name}: ${GG.fmt.sig(v[r.k], 2)} cycles per issued instruction`, 'data-keys': '1', style: 'cursor:pointer;outline:none' });
        const bg = R(g, 0, y, w, rh - 2, 'fill:transparent', { rx: 4 });
        if (i === 8) Ln(svg, 0, y - 1, w, y - 1, 'stroke:var(--line-2);stroke-dasharray:3 3');
        Tx(g, padL - 8, y + rh / 2 + 2.5, mob ? r.name.replace('Math Pipe Throttle', 'Math Pipe Thr.') : r.name, { fs: mob ? 9.5 : 11, anchor: 'end', fill: r.sb ? `var(--${r.tone})` : r.sched ? 'var(--ink-2)' : 'var(--ink-2)', weight: r.sb ? 600 : null });
        const val = v[r.k];
        if (val > 0) R(g, padL, y + 3, Math.max(1.5, X(val) - padL), rh - 8, `fill:${fill(r)}`, { rx: 2 });
        Tx(g, Math.max(X(val), padL) + 5, y + rh / 2 + 2.5, GG.fmt.sig(val, 2), { fs: mob ? 9.5 : 10.5, fill: 'var(--ink-2)' });
        const on = () => { st.hover = r.k; bg.setAttribute('style', 'fill:rgba(255,255,255,.05);stroke:var(--accent);stroke-width:1'); f.setWhy(why()); };
        const off = () => { if (st.hover === r.k) st.hover = null; bg.setAttribute('style', 'fill:transparent'); f.setWhy(why()); };
        g.addEventListener('pointerenter', on); g.addEventListener('focus', on); g.addEventListener('click', on);
        g.addEventListener('pointerleave', off); g.addEventListener('blur', off);
        rowEls.push(g);
      });
      const yb = y0 + WS_REASONS.length * rh + 8;
      Tx(svg, w - padR, yb + 6, 'cycles per issued instruction', { fs: 9, anchor: 'end', fill: 'var(--ink-3)' });
      return yb + 10;
    });
    legend(f.stage, [['var(--memory)', 'long scoreboard'], ['var(--special)', 'short scoreboard'], ['var(--control)', 'other stalls'], ['var(--ink-3)', 'scheduler states (not stalls)']]);
    const sT = stat(f, 'Cycles / issued instr.', 'ink');
    const sTop = stat(f, 'Largest stall', 'control');
    const sL = stat(f, 'Long scoreboard share', 'memory');
    GG.ui.seg(f.controls, { label: 'Kernel (illustrative)', options: Object.keys(WS_PROFILES).map((k) => ({ value: k, label: WS_PROFILES[k].label })), value: st.p, onChange: (v) => { st.p = v; st.hover = null; update(); } });
    function topStall() {
      const v = prof().v;
      return WS_REASONS.filter((r) => !r.sched).reduce((a, r) => (!a || v[r.k] > v[a.k] ? r : a), null);
    }
    function why() {
      const v = prof().v, tot = total(), P = prof();
      if (st.hover) {
        const r = WS_REASONS.find((q) => q.k === st.hover);
        return `<b>${r.name}</b>: ${r.html} In this profile: ${GG.fmt.sig(v[r.k], 2)} of the ${GG.fmt.sig(tot, 3)} cycles per issued instruction (${pct(v[r.k] / tot, 0)}).`;
      }
      const tp = topStall(), sb = v.long + v.short;
      let t = `<b>${P.label}</b>, for example ${P.ex}. A warp issues one instruction every ${GG.fmt.sig(tot, 3)} cycles on average. `;
      if (st.p === 'mem') t += `<b>Long Scoreboard</b> takes ${GG.fmt.sig(v.long, 2)} of them, ${pct(v.long / tot, 0)} of the warp's time, waiting for global loads. As the glossary says, long scoreboard stalls dominate memory-bound code.`;
      else if (st.p === 'comp') t += `The largest stall is <b>${tp.name}</b> (${GG.fmt.sig(v[tp.k], 2)} cycles): the warps are waiting for the FP32 pipe and for their previous <code>FFMA</code>, not for memory. Scoreboard stalls of either kind are only ${pct(sb / tot, 0)} of the time, and <i>Not Selected</i> is high: there are more eligible warps than the scheduler can issue.`;
      else t += `The largest stall is <b>${tp.name}</b> (${GG.fmt.sig(v[tp.k], 2)} cycles), ${pct(v.short / tot, 0)} of the time against ${pct(v.long / tot, 0)} for the long scoreboard: the waits are for shared memory, inside the SM. MIO Throttle and Barrier come from the same shared-memory traffic and the synchronization around it.`;
      return t + ' Hover, tap or focus a bar for what that state means.';
    }
    function update() {
      view.redraw();
      const tot = total(), v = prof().v, tp = topStall();
      sT.set(GG.fmt.sig(tot, 3));
      sTop.set(tp.name, tp.sb ? tp.tone : 'control');
      sL.set(pct(v.long / tot, 0));
      f.setWhy(why());
      GG.decorate && GG.decorate(f.why);
    }
    update();
  }

  /* Fig: classify instructions as short / long / no scoreboard. */
  const SB_OPS = [
    { v: 'LDS', path: 'mio', dest: 'smem', sb: 'short', g: true, html: '<code>LDS</code> loads from <a data-term="shared-memory">shared memory</a>. Its latency varies (a <a data-term="bank-conflict">bank conflict</a> makes it longer), so it needs a scoreboard, but it never leaves the SM: <b>short</b>.' },
    { v: 'STS', path: 'mio', dest: 'smem', sb: 'short', g: true, html: '<code>STS</code> stores to shared memory. A store produces no register result; what can wait on it is a later instruction that wants to overwrite the register being stored. Stays in the SM: <b>short</b>.' },
    { v: 'MUFU.EX2', path: 'mio', dest: 'sfu', sb: 'short', g: true, html: '<code>MUFU.EX2</code>, a 2<sup><i>x</i></sup> on the <a data-term="special-function-unit">Special Function Unit</a>. Certain SFU operations share the Memory Input/Output (MIO) hardware with shared memory accesses, so waits on them are <b>short</b> scoreboard stalls too.' },
    { v: 'LDG', path: 'l1tex', dest: 'ext', sb: 'long', g: true, html: '<code>LDG</code> loads from <a data-term="global-memory">global memory</a>. It may hit in the SM\'s L1 cache, but it may also go out to L2 or GPU RAM, hundreds of cycles away: <b>long</b>.' },
    { v: 'STG', path: 'l1tex', dest: 'ext', sb: 'long', g: true, html: '<code>STG</code> stores to global memory, which may leave the SM: <b>long</b>.' },
    { v: 'LDL', path: 'l1tex', dest: 'ext', sb: 'long', g: false, html: '<code>LDL</code> loads from <em>local</em> memory, per-thread memory that lives in global memory (for example registers spilled under <a data-term="register-pressure">register pressure</a>). It takes the same path as <code>LDG</code>: <b>long</b>.' },
    { v: 'FFMA', path: 'fixed', dest: 'core', sb: 'none', g: false, html: '<code>FFMA</code> runs on the <a data-term="cuda-core">CUDA Cores</a> with a fixed, known latency. The compiler spaces dependent instructions with stall counts, so it needs <b>no scoreboard</b> at all.' },
  ];
  function sbClassify(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Short, long, or none?', hint: 'pick an instruction', wide: true,
      caption: 'Where an instruction\'s work goes decides which kind of scoreboard stall can follow it. Shared-memory and some SFU work goes through the SM\'s Memory Input/Output (MIO) path and stays inside the SM: short. Global and local memory go through the L1 cache and may continue out of the SM to L2 and GPU RAM: long. Fixed-latency arithmetic needs no scoreboard. Instructions marked * are Beyond the glossary; the path names follow Nsight Compute\'s documentation, which describes long scoreboard stalls as waits on L1TEX (local, global, surface, texture) operations.',
    });
    const st = { op: 'LDS' };
    let tAnim = 0;
    const geo = {};
    const view = rsvg(f.stage, 'An SM with a scheduler, an MIO path to shared memory and the SFU, an L1 path that can leave the SM to L2 and GPU RAM, and CUDA Cores.', (svg, w) => {
      const mob = w < 700;
      const o = SB_OPS.find((x) => x.v === st.op);
      const H = mob ? 260 : 230;
      const smW = mob ? w : w * 0.7;
      R(svg, 1, 1, smW - 2, H - 2, 'fill:rgba(8,9,14,.35);stroke:var(--line-2);stroke-dasharray:5 4', { rx: 12 });
      Tx(svg, 14, 20, 'STREAMING MULTIPROCESSOR', { fs: 10, fill: 'var(--ink-3)', ls: '0.08em' });
      const box = (x, y, bw, bh, label, tone, on, sub) => {
        R(svg, x, y, bw, bh, `fill:${on ? `var(--${tone}-a)` : 'rgba(8,9,14,.6)'};stroke:${on ? `var(--${tone})` : 'var(--line-2)'};stroke-width:${on ? 1.8 : 1}`, { rx: 7 });
        Tx(svg, x + bw / 2, y + bh / 2 + (sub ? -2 : 4), label, { fs: mob ? 10 : 11.5, anchor: 'middle', fill: on ? `var(--${tone})` : 'var(--ink-2)', weight: 600 });
        if (sub) Tx(svg, x + bw / 2, y + bh / 2 + 12, sub, { fs: 9, anchor: 'middle', fill: 'var(--ink-3)' });
        return { x, y, w: bw, h: bh, cx: x + bw / 2, cy: y + bh / 2 };
      };
      const colW = (smW - 40) / 4;
      const sch = box(14, H / 2 - 24, colW * 0.85, 48, 'scheduler', 'control', true, 'issues');
      const yA = 38, yB = H / 2 - 22, yC = H - 82;
      const x2 = 14 + colW + 10, x3 = 14 + 2 * colW + 26;
      const mio = box(x2, yA, colW * 0.9, 44, 'MIO', 'special', o.path === 'mio', 'short path');
      const l1t = box(x2, yC, colW * 0.9, 44, 'L1TEX', 'memory', o.path === 'l1tex', 'long path');
      const core = box(x2, yB, colW * 0.9, 44, 'CUDA Cores', 'core', o.path === 'fixed', mob ? 'fixed' : 'fixed latency');
      const smem = box(x3, yA - 6, colW * 1.25, 26, 'shared memory', 'memory', o.dest === 'smem');
      const sfu = box(x3, yA + 26, colW * 1.25, 26, 'SFU', 'special', o.dest === 'sfu');
      const l1 = box(x3, yC, colW * 1.25, 44, 'L1 data cache', 'memory', o.path === 'l1tex', 'may hit here');
      // L2 and GPU RAM sit outside the dashed SM outline: to the right on desktops, below it on phones
      const ex = mob ? box(x3, H + 18, colW * 1.25, 40, 'L2 · GPU RAM', 'memory', o.dest === 'ext', 'outside the SM') : box(smW + 24, yC, w - smW - 26, 44, 'L2 · GPU RAM', 'memory', o.dest === 'ext', 'outside the SM');
      const conn = (a, b, on, tone) => Pa(svg, `M${r2(a.x + a.w)},${r2(a.cy)}C${r2(a.x + a.w + 18)},${r2(a.cy)} ${r2(b.x - 18)},${r2(b.cy)} ${r2(b.x)},${r2(b.cy)}`, `fill:none;stroke:${on ? `var(--${tone})` : 'var(--line-2)'};stroke-width:${on ? 2 : 1}`);
      conn(sch, mio, o.path === 'mio', 'special'); conn(sch, core, o.path === 'fixed', 'core'); conn(sch, l1t, o.path === 'l1tex', 'memory');
      conn(mio, smem, o.dest === 'smem', 'special'); conn(mio, sfu, o.dest === 'sfu', 'special'); conn(l1t, l1, o.path === 'l1tex', 'memory');
      if (mob) Pa(svg, `M${r2(l1.cx)},${r2(l1.y + l1.h)}V${r2(ex.y)}`, `fill:none;stroke:${o.dest === 'ext' ? 'var(--memory)' : 'var(--line-2)'};stroke-width:${o.dest === 'ext' ? 2 : 1}`);
      else conn(l1, ex, o.dest === 'ext', 'memory');
      // verdict
      const vx = mob ? 14 : smW + 24, vy = mob ? H + 18 : 40;
      const vt = { short: 'SHORT scoreboard', long: 'LONG scoreboard', none: 'NO scoreboard' }[o.sb];
      const vc = { short: 'var(--special)', long: 'var(--memory)', none: 'var(--core)' }[o.sb];
      Tx(svg, vx, vy, (o.g ? '' : '* ') + o.v, { fs: mob ? 15 : 18, fill: 'var(--ink)', weight: 700 });
      Tx(svg, vx, vy + 22, vt, { fs: mob ? 11 : 12, fill: vc, weight: 700 });
      Tx(svg, vx, vy + 40, o.sb === 'long' ? 'may leave the SM' : o.sb === 'short' ? 'stays inside the SM' : 'fixed latency, stall counts', { fs: 10, fill: 'var(--ink-3)' });
      // packet path for the animation
      const pts = o.path === 'mio' ? [sch, mio, o.dest === 'smem' ? smem : sfu] : o.path === 'fixed' ? [sch, core] : [sch, l1t, l1, ex];
      geo.pts = pts.map((p) => [p.cx, p.cy]);
      geo.dot = C(svg, -20, -20, 5, `fill:${vc}`);
      return mob ? H + 72 : H;
    }, () => place(anim.running || tAnim ? tAnim : STATIC_T));
    const STATIC_T = 2.2 * 0.999; // a still frame shows the packet at its destination
    function place(t) {
      if (!geo.pts || !geo.dot) return;
      const n = geo.pts.length - 1, ph = (t % 2.2) / 2.2 * n;
      const i = Math.min(n - 1, Math.floor(ph)), u = ph - i;
      const [ax, ay] = geo.pts[i], [bx, by] = geo.pts[i + 1];
      geo.dot.setAttribute('cx', r2(ax + (bx - ax) * u)); geo.dot.setAttribute('cy', r2(ay + (by - ay) * u));
    }
    const anim = GG.anim(f.stage, (t) => { tAnim = t; place(t); });
    GG.ui.seg(f.controls, { label: 'Instruction', options: SB_OPS.map((o) => ({ value: o.v, label: o.g ? o.v : o.v + '*' })), value: st.op, onChange: (v) => { st.op = v; update(); } });
    GG.ui.playButton(f.controls, anim);
    const sK = stat(f, 'Scoreboard', 'accent');
    function update() {
      view.redraw(); place(anim.running || tAnim ? tAnim : STATIC_T);
      const o = SB_OPS.find((x) => x.v === st.op);
      sK.set(o.sb);
      f.setWhy(o.html); GG.decorate(f.why);
    }
    update();
  }

  /* Fig: decode and build a control code. */
  function sbDecoder(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Control-code decoder and mask builder', hint: 'type a code, pick an example, or click the bits', wide: true,
      caption: 'The bracketed control information from the listing, field by field. The B (wait mask) and W (write) fields are explained in the glossary; R, Y and S are marked Beyond and follow the community\'s reverse-engineered descriptions. The <code>B01--4-</code> example is the glossary\'s; the other fields of that example are filled in for illustration.',
    });
    const st = { B: [false, false, true, false, false, false], R: '-', W: '-', Y: true, S: 8 };
    const wrap = GG.el('div');
    f.stage.append(wrap);
    const row = GG.el('div', { style: 'display:flex;flex-wrap:wrap;gap:10px;align-items:center' });
    const inp = GG.el('input', { class: 'pfc-ccin', type: 'text', 'aria-label': 'control code', spellcheck: 'false', autocomplete: 'off' });
    row.append(inp);
    wrap.append(row);
    const err = GG.el('div', { class: 'pfc-ccerr', 'aria-live': 'polite' });
    const big = GG.el('div', { class: 'pfc-ccbig', 'aria-hidden': 'true' });
    const fields = GG.el('div', { class: 'pfc-fields' });
    wrap.append(err, big, fields);
    const fmtCode = () => `[B${st.B.map((on, i) => (on ? String(i) : '-')).join('')}:R${st.R}:W${st.W}:${st.Y ? 'Y' : '-'}:S${String(st.S).padStart(2, '0')}]`;
    const pre = presets(f.controls, 'Examples', [
      { value: '[B------:R-:W2:-:S04]', label: 'first LDG' },
      { value: '[B------:R-:W2:-:S01]', label: 'second LDG' },
      { value: '[B--2---:R-:W-:Y:S08]', label: 'IMAD' },
      { value: '[B01--4-:R-:W-:-:S01]', label: 'B01--4-' },
    ], (v) => { parse(v); render(true); });
    function parse(txt) {
      const m = /^\s*\[?\s*B([0-5-]{6})\s*:\s*R([0-5-])\s*:\s*W([0-5-])\s*:\s*([Yy-])\s*:\s*S(\d{1,2})\s*\]?\s*$/.exec(txt);
      if (!m) return 'Expected the form [B------:R-:W-:-:S00]: six wait-mask positions, then R, W, Y and S fields.';
      const b = m[1].split('');
      for (let i = 0; i < 6; i++) if (b[i] !== '-' && b[i] !== String(i)) return `Position ${i} of the wait mask can only hold "${i}" or "-" (each position stands for one scoreboard).`;
      const sv = +m[5];
      if (sv > 15) return 'The stall count is a 4-bit field: 0 to 15.';
      st.B = b.map((c) => c !== '-'); st.R = m[2]; st.W = m[3]; st.Y = m[4] !== '-'; st.S = sv;
      return null;
    }
    inp.addEventListener('input', () => {
      const e = parse(inp.value);
      inp.setAttribute('aria-invalid', e ? 'true' : 'false');
      err.textContent = e || '';
      if (!e) render(false);
    });
    const regs = ['-', '0', '1', '2', '3', '4', '5'];
    const groups = [];
    function bits(parent, cls, n, isOn, onClick, labels) {
      const d = GG.el('div', { class: 'pfc-bits ' + cls, role: 'group' });
      const bs = [];
      for (let i = 0; i < n; i++) {
        const b = GG.el('button', { type: 'button', title: labels ? (cls === 'y' ? 'yield hint' : labels[i] === '-' ? 'none' : 'scoreboard ' + labels[i]) : 'scoreboard ' + i }, labels ? labels[i] : String(i));
        b.addEventListener('click', () => { onClick(i); render(true); });
        d.append(b); bs.push(b);
      }
      parent.append(d);
      groups.push(() => bs.forEach((b, i) => b.setAttribute('aria-pressed', String(isOn(i)))));
    }
    const card = (tag) => {
      const c = GG.el('div', { class: 'pfc-field' });
      const h = GG.el('b'); const body2 = GG.el('div');
      c.append(h, body2); fields.append(c);
      return { c, set(title, html) { h.innerHTML = `${title}${tag ? `<em class="pfc-tag">${tag}</em>` : ''}`; body2.innerHTML = html; } };
    };
    const cB = card(''), cW = card(''), cR = card('Beyond'), cY = card('Beyond'), cS = card('Beyond');
    bits(cB.c, 'b', 6, (i) => st.B[i], (i) => { st.B[i] = !st.B[i]; });
    bits(cW.c, 'w', 7, (i) => regs[i] === st.W, (i) => { st.W = regs[i]; }, regs);
    bits(cR.c, 'r', 7, (i) => regs[i] === st.R, (i) => { st.R = regs[i]; }, regs);
    bits(cY.c, 'y', 1, () => st.Y, () => { st.Y = !st.Y; }, ['Y']);
    const sS = GG.ui.slider(cS.c, { label: 'cycles', min: 0, max: 15, step: 1, value: st.S, format: (v) => String(v), onInput: (v) => { st.S = v; render(true); } });
    sS.el.style.marginTop = '6px';
    function render(writeInput) {
      const code = fmtCode();
      if (writeInput) { inp.value = code; inp.setAttribute('aria-invalid', 'false'); err.textContent = ''; }
      pre.set(code);
      groups.forEach((g) => g());
      if (sS.get() !== st.S) sS.set(st.S, false);
      const Bs = st.B.map((on, i) => (on ? String(i) : '-')).join('');
      const S2 = String(st.S).padStart(2, '0');
      big.innerHTML = `<span class="x">[</span><span class="b">B${Bs}</span><span class="x">:</span><span class="r">R${st.R}</span><span class="x">:</span><span class="w">W${st.W}</span><span class="x">:</span><span class="y">${st.Y ? 'Y' : '-'}</span><span class="x">:</span><span class="s">S${S2}</span><span class="x">]</span>`;
      const waits = st.B.map((on, i) => (on ? i : null)).filter((x) => x != null);
      const list = (a) => (a.length === 1 ? String(a[0]) : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]);
      cB.set(`B${Bs}<small>wait mask</small>`, waits.length ? `Before this instruction can issue, scoreboard${waits.length > 1 ? 's' : ''} <b>${list(waits)}</b> must ${waits.length > 1 ? 'all ' : ''}be cleared (back to zero). Click the bits to build a mask.` : 'Waits on no scoreboard. Click the bits to build a mask.');
      const wMask = 'B' + [0, 1, 2, 3, 4, 5].map((i) => (String(i) === st.W ? st.W : '-')).join('');
      cW.set(`W${st.W}<small>write</small>`, st.W === '-' ? 'Sets no scoreboard: either the result has a fixed latency the compiler already accounts for, or there is no register result to wait for.' : `When this instruction issues it increments scoreboard <b>${st.W}</b>; when its result has been written, the scoreboard is decremented again. A later instruction that needs the result waits with <code>${wMask}</code>.`);
      cR.set(`R${st.R}<small>read</small>`, st.R === '-' ? 'Sets no read scoreboard.' : `Sets scoreboard <b>${st.R}</b> until this instruction has <em>read</em> its source registers, so that a later instruction does not overwrite them too early. Typical for stores, which read their data some cycles after they issue.`);
      cY.set(`${st.Y ? 'Y' : '-'}<small>yield</small>`, st.Y ? 'Yield hint set: after this instruction the scheduler may switch to another warp.' : 'No yield hint.');
      cS.set(`S${S2}<small>stall count</small>`, `Wait <b>${st.S}</b> ${plural(st.S, 'cycle')} before issuing this warp's next instruction. The compiler uses it to space out instructions whose latency is fixed and known.`);
      f.setWhy(waits.length ? `<code>${GG.esc(code)}</code>: issue only when scoreboard${waits.length > 1 ? 's' : ''} ${list(waits)} ${waits.length > 1 ? 'are' : 'is'} clear${st.W !== '-' ? `, then count this instruction's result on scoreboard ${st.W}` : ''}.` : `<code>${GG.esc(code)}</code>: no wait${st.W !== '-' ? `; once issued, this instruction's pending result is counted on scoreboard ${st.W}` : ''}.`);
    }
    render(true);
  }

  /* Fig: Lander & Parkin's counterexample, checked with exact integer arithmetic. */
  function sbEuler(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: '27⁵ + 84⁵ + 110⁵ + 133⁵ = 144⁵', hint: 'edit the numbers', wide: false,
      caption: 'Lander and Parkin\'s counterexample to Euler\'s sum of powers conjecture, found with a CDC 6600 and checked here with exact integer arithmetic. Each bar is a fifth power, drawn to scale: the four on top add up exactly to the one below (27⁵, at 14 million, is too thin to see next to 144⁵, at 62 billion, so it is labelled from above). At this scale a near miss looks identical, so the two sums are also compared digit by digit: green digits agree, red ones differ. Change any number to see how rare an exact match is.',
    });
    const st = { a: [27, 84, 110, 133], e: 144 };
    const box = GG.el('div', { style: 'display:flex;flex-wrap:wrap;gap:8px;align-items:center;font:600 14px var(--font-mono);color:var(--ink)' });
    const ins = st.a.map((v, i) => {
      const n = GG.el('input', { class: 'num-in', type: 'number', min: '1', max: '999', value: String(v), 'aria-label': 'base ' + (i + 1), style: 'width:72px' });
      n.addEventListener('input', () => { const x = Math.round(+n.value); if (x >= 1 && x <= 999) { st.a[i] = x; update(); } });
      return n;
    });
    const ein = GG.el('input', { class: 'num-in', type: 'number', min: '1', max: '999', value: String(st.e), 'aria-label': 'right-hand base', style: 'width:72px' });
    ein.addEventListener('input', () => { const x = Math.round(+ein.value); if (x >= 1 && x <= 999) { st.e = x; update(); } });
    ins.forEach((n, i) => { box.append(n, GG.el('span', { text: i < 3 ? '⁵ +' : '⁵ =' })); });
    box.append(ein, GG.el('span', { text: '⁵' }));
    f.controls.append(box);
    const P = (x) => BigInt(x) ** 5n;
    const view = rsvg(f.stage, 'Bars for the four fifth powers stacked end to end above a bar for the fifth power on the right-hand side, and the two sums compared digit by digit.', (svg, w) => {
      const parts = st.a.map(P), lhs = parts.reduce((a, b) => a + b, 0n), rhs = P(st.e);
      const mx = Number(lhs > rhs ? lhs : rhs);
      const sc = (w - 2) / mx;
      const by = 30;
      let x = 1, nThin = 0;
      // the four terms are plain numbers, so they get neutral shades, not the unit colours
      const tones = ['var(--ink-2)', 'var(--ink-3)', 'var(--ink-2)', 'var(--ink-3)'];
      parts.forEach((p, i) => {
        const ww = Number(p) * sc;
        R(svg, x, by, Math.max(1, ww - 1), 26, `fill:${tones[i]}`, { rx: 3 });
        const lab = `${st.a[i]}⁵`;
        if (ww > tw(lab, 10.5) + 12) Tx(svg, x + ww / 2, by + 17, lab, { fs: 10.5, anchor: 'middle', fill: '#0b0c12', weight: 700 });
        else {
          // too thin to hold its label: a callout above, with a leader line down to the bar
          const lx = 1 + nThin * 46, cxB = x + Math.max(1, ww - 1) / 2;
          Tx(svg, lx, 12, lab, { fs: 10, fill: 'var(--ink-2)', weight: 600 });
          Pa(svg, `M${r2(lx + 6)},${16}L${r2(cxB)},${by - 1}`, 'fill:none;stroke:var(--ink-3);stroke-width:1');
          nThin++;
        }
        x += ww;
      });
      R(svg, 1, by + 34, Math.max(1, Number(rhs) * sc), 26, 'fill:var(--ink)', { rx: 3 });
      Tx(svg, 10, by + 51, `${st.e}⁵`, { fs: 10.5, fill: '#0b0c12', weight: 700 });
      // digit by digit: bars at this scale cannot show a mismatch of a few million in 62 billion, digits can
      const L = lhs.toString(), Rr = rhs.toString(), n = Math.max(L.length, Rr.length);
      const Lp = L.padStart(n, ' '), Rp = Rr.padStart(n, ' ');
      let firstDiff = n;
      for (let i = 0; i < n; i++) if (Lp[i] !== Rp[i]) { firstDiff = i; break; }
      const fs = w < 400 ? 12 : 14, cwD = Math.max(fs, FSMIN) * 0.6 + 2;
      const dx0 = Math.max(64, w - n * cwD - 2);
      const rowsD = [['left', Lp], ['right', Rp]];
      rowsD.forEach(([lab, str], j) => {
        const yy = by + 92 + j * 22;
        Tx(svg, 0, yy, lab, { fs: 10, fill: 'var(--ink-3)' });
        for (let i = 0; i < n; i++) {
          if (str[i] === ' ') continue;
          const same = i < firstDiff;
          Tx(svg, dx0 + i * cwD + cwD / 2, yy, str[i], { fs, anchor: 'middle', fill: same ? 'var(--core)' : 'var(--danger)', weight: 600 });
        }
      });
      const msg = firstDiff === n ? 'every digit matches' : firstDiff === 0 ? 'they differ from the first digit' : `the first ${firstDiff} ${plural(firstDiff, 'digit')} match, then they differ`;
      Tx(svg, 0, by + 136, msg, { fs: 10, fill: firstDiff === n ? 'var(--core)' : 'var(--danger)', weight: 600 });
      return by + 142;
    });
    const sL = stat(f, 'Left side', 'ink');
    const sR = stat(f, 'Right side', 'ink');
    function update() {
      view.redraw();
      const lhs = st.a.map(P).reduce((a, b) => a + b, 0n), rhs = P(st.e);
      const fmt = (b) => b.toLocaleString('en-US');
      sL.set(fmt(lhs)); sR.set(fmt(rhs));
      const d = lhs - rhs;
      f.setWhy(d === 0n ? `<b>Exactly equal:</b> ${st.a.map((v) => `${v}⁵`).join(' + ')} = ${fmt(lhs)} = ${st.e}⁵. Four fifth powers summing to a fifth power, where Euler's conjecture said at least five would be needed.` : `Not equal: the left side is ${fmt(d < 0n ? -d : d)} ${d < 0n ? 'smaller' : 'larger'} than ${st.e}⁵. Lander and Parkin's search had to find the one combination that matches exactly.`);
    }
    update();
  }

  /* Fig: ILP within a thread (CPU) vs TLP across warps (GPU). */
  function sbIlpTlp(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Hiding a wait: within a thread, or across threads', hint: 'switch processor', wide: true,
      caption: 'Both processors run the same instruction stream, written with the same names in both views (subscripts give program order): a load, an instruction that needs the loaded value, then two independent instructions. Each square is a cycle; hatched squares are cycles spent waiting. The out-of-order CPU core uses its scoreboard to run the independent instructions early, within the same thread. The GPU keeps every warp in order: warp 0 waits at <code>IMAD</code>, and the scheduler fills the gap with instructions from other warps. Schematic, with a 5-cycle load.',
    });
    const st = { m: 'gpu' };
    const LAT = 5;
    const view = rsvg(f.stage, 'Cycle-by-cycle schedules of a CPU core running one thread out of order and a GPU warp scheduler switching between warps.', (svg, w) => {
      const mob = w < 640;
      const rowsD = st.m === 'cpu'
        ? [{ lab: 'thread', cells: ['LDG₀', 'ADD₂', 'SUB₃', 'w', 'w', 'IMAD₁'], cols: ['memory', 'core', 'core', null, null, 'core'] }]
        : [
            { lab: 'warp 0', cells: ['LDG₀', 'w', 'w', 'w', 'w', 'IMAD₁', 'ADD₂', 'SUB₃'], cols: ['memory', null, null, null, null, 'core', 'core', 'core'] },
            { lab: 'warp 1', cells: ['', 'FFMA', 'FFMA', '', '', '', '', ''], cols: [null, 'special', 'special'] },
            { lab: 'warp 2', cells: ['', '', '', 'FFMA', 'FFMA', '', '', ''], cols: [null, null, null, 'special', 'special'] },
          ];
      const hatch = hatchDef(svg, 'pfc-hatch-ilp', 'rgba(255,198,92,.4)');
      const padL = mob ? 52 : 80;
      const n = 8, cw = Math.min(70, (w - padL) / n), ch = mob ? 26 : 30;
      for (let c = 0; c < n; c++) Tx(svg, padL + c * cw + cw / 2, 12, String(c), { fs: 9.5, anchor: 'middle', fill: 'var(--ink-3)' });
      Tx(svg, padL - 8, 12, 'cycle', { fs: 9.5, anchor: 'end', fill: 'var(--ink-3)' });
      rowsD.forEach((r, i) => {
        const y = 20 + i * (ch + 8);
        Tx(svg, padL - 8, y + ch / 2 + 4, r.lab, { fs: mob ? 9.5 : 11, anchor: 'end', fill: 'var(--ink-2)' });
        r.cells.forEach((c, k) => {
          const x = padL + k * cw;
          if (c === 'w') R(svg, x + 1, y, cw - 2, ch, `fill:${hatch};stroke:rgba(255,198,92,.5)`, { rx: 3 });
          else if (c) { R(svg, x + 1, y, cw - 2, ch, `fill:var(--${r.cols[k]}-a);stroke:var(--${r.cols[k]})`, { rx: 3 }); Tx(svg, x + cw / 2, y + ch / 2 + 4, c, { fs: mob ? 8.5 : 10.5, anchor: 'middle', fill: `var(--${r.cols[k]})`, weight: 600 }); }
          else R(svg, x + 1, y, cw - 2, ch, 'fill:none;stroke:var(--line);stroke-dasharray:2 3', { rx: 3 });
        });
      });
      const yb = 20 + rowsD.length * (ch + 8) + 6;
      Tx(svg, padL, yb + 8, st.m === 'cpu'
        ? (mob ? 'run out of program order (subscripts)' : 'program order: LDG₀, IMAD₁ (needs the load), ADD₂, SUB₃ (independent); run out of order')
        : (mob ? 'warp 0 stays in program order' : 'program order: LDG₀, IMAD₁ (needs the load), ADD₂, SUB₃; warp 0 keeps it'), { fs: mob ? 9 : 10, fill: 'var(--ink-3)' });
      return yb + 14;
    });
    GG.ui.seg(f.controls, { label: 'Processor', options: [{ value: 'cpu', label: 'CPU core: out of order' }, { value: 'gpu', label: 'GPU: switch warps' }], value: st.m, onChange: (v) => { st.m = v; update(); } });
    function update() {
      view.redraw();
      f.setWhy(st.m === 'cpu'
        ? `<b>Instruction-level parallelism.</b> The CPU's scoreboard sees that <code>IMAD₁</code> must wait ${LAT} cycles for the load, but <code>ADD₂</code> and <code>SUB₃</code> don't depend on it, so it runs them early, out of program order. The waiting is filled from the <em>same thread</em>, and only partly: two cycles are still lost.`
        : `<b>Thread-level parallelism.</b> Warp 0 issues strictly in order: its <code>IMAD₁</code> waits on a scoreboard, and its independent <code>ADD₂</code> and <code>SUB₃</code> wait behind it. The scheduler fills the ${LAT - 1} empty cycles with <code>FFMA</code>s from warps 1 and 2 instead, so the SM loses nothing. That only works if there are enough other warps: see <a data-term="latency-hiding">latency hiding</a>.`);
      GG.decorate(f.why);
    }
    update();
  }
})();
