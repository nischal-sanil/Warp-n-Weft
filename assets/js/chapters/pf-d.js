/* chapters/pf-d — Performance, part D.
   Entries: branch-efficiency, memory-coalescing, bank-conflict, register-pressure.
   CSS prefix: pfd-. Every figure is pixel-true SVG (viewBox width = stage width), rebuilt
   whenever the stage width changes, so labels stay legible from 390 px phones to desktops. */
(function () {
  'use strict';
  if (!window.GG) return;

  GG.css(`
  .pfd-svg { display: block; width: 100%; height: auto; touch-action: manipulation; -webkit-user-select: none; user-select: none; }
  .pfd-eq { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 10px 16px; padding: 18px 16px;
    border: 1px solid var(--line); border-radius: 12px; background: var(--surface); font-family: var(--font-mono); font-size: 14.5px; color: var(--ink); text-align: center; }
  .pfd-eq-l { font-weight: 600; }
  .pfd-eq-op { color: var(--ink-3); font-size: 18px; }
  .pfd-frac { display: inline-flex; flex-direction: column; align-items: stretch; }
  .pfd-frac > span { padding: 4px 10px; }
  .pfd-frac > span:first-child { border-bottom: 1.5px solid var(--ink-2); color: var(--core); }
  .pfd-frac > span:last-child { color: var(--ink-2); }
  .pfd-eq small { display: block; width: 100%; font-family: var(--font-body); font-size: 12.5px; color: var(--ink-3); }
  .pfd-legend { display: flex; flex-wrap: wrap; gap: 4px 16px; margin: 0 0 12px; font: 500 11.5px/1.5 var(--font-mono); color: var(--ink-2); }
  .pfd-legend span { display: inline-flex; align-items: center; gap: 7px; }
  .pfd-legend i { flex: none; display: inline-block; width: 11px; height: 11px; border-radius: 3px; background: var(--sw); }
  .pfd-legend i.pfd-lg-outline { background: transparent; border: 1.5px solid var(--sw); }
  .pfd-legend i.pfd-lg-dash { background: transparent; border: 1.5px dashed var(--sw); }
  .pfd-legend i.pfd-lg-dot { width: 8px; height: 8px; border-radius: 50%; }
  .pfd-legend i.pfd-lg-bar { height: 4px; border-radius: 2px; }
  .pfd-legend i.pfd-lg-line { height: 0; border-radius: 0; background: none; border-top: 2px solid var(--sw); width: 16px; }
  .pfd-legend i.pfd-lg-dline { height: 0; border-radius: 0; background: none; border-top: 2px dashed var(--sw); width: 16px; }
  .pfd-legend i.pfd-lg-tint { background: rgba(255, 91, 110, 0.22); border: 1px solid var(--memory); }
  .pfd-legend i.pfd-lg-hue { background: linear-gradient(90deg, hsl(185,70%,60%), hsl(243,70%,74%), hsl(300,70%,60%)); width: 28px; }
  .pfd-legend i.pfd-lg-hatch { background: repeating-linear-gradient(45deg, var(--sw) 0 2px, transparent 2px 5px); border: 1px solid var(--sw); }
  .pfd-bign input { width: 150px; }
  .pfd-codeline { margin: 0 0 12px; padding: 8px 11px; border-radius: 9px; background: #090a10; border: 1px solid var(--line);
    font: 500 12.5px/1.55 var(--font-mono); color: var(--ink); white-space: pre; overflow-x: auto; scrollbar-width: thin; }
  .pfd-codeline .c { color: #6c7290; font-style: italic; }
  .pfd-codeline .k { color: #c9aefc; }
  .pfd-codeline .a { color: #f08ad8; }
  .pfd-kv { display: inline-block; font: 500 12.5px var(--font-mono); padding: 2px 8px; border-radius: 6px; background: var(--surface-3); border: 1px solid var(--line); color: var(--ink); }
  .pfd-presets { display: flex; flex-wrap: wrap; gap: 6px; }
  .pfd-presets .btn { height: 28px; font-size: 11.5px; padding: 0 10px; }
  @media (max-width: 720px) {
    .pfd-eq { font-size: 12.5px; padding: 14px 10px; gap: 8px 10px; }
    .pfd-legend { font-size: 10.5px; gap: 3px 12px; }
    .pfd-codeline { font-size: 11px; }
  }
  `);

  /* ───────────────────────── helpers ───────────────────────── */
  const r2 = (v) => Math.round(v * 100) / 100;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a; };
  const hex = (n, d) => '0x' + n.toString(16).toUpperCase().padStart(d || 3, '0');
  const fI = (n) => GG.fmt.int(n);
  const pct = (x, d) => (x * 100).toFixed(d == null ? 1 : d).replace(/\.0+$/, '') + '%';
  const plural = (n, one, many) => (n === 1 ? one : many || one + 's');
  const tw = (s, fs) => String(s).length * Math.max(fs, FSMIN) * 0.6; // JetBrains Mono advance ≈ 0.6 em
  const guard = (fn) => { try { fn(); } catch (e) { console.error('[pf-d] ' + ((e && e.stack) || e)); } };
  const effTone = (e) => (e >= 0.9 ? 'core' : e >= 0.5 ? 'control' : 'danger');
  /* Bank colours: hues from cyan (185°) to violet (300°), neighbouring banks alternating in lightness.
     The range deliberately avoids red (conflict), amber and green, which carry meaning elsewhere. */
  const bankCol = (b, a) => `hsla(${Math.round(185 + (b * 115) / 31)}, 70%, ${b % 2 ? 74 : 60}%, ${a == null ? 1 : a})`;
  const aN = (n) => (/^(8|11|18)(?!\d)/.test(String(n)) || /^8/.test(String(n)) ? 'an' : 'a'); // "an 8-way", "a 16-way"
  /* Smallest SVG font size, set while a figure builds: 9 px on phones, where the SVG is drawn at true pixel size. */
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
  const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
  function sci(x, dg) {
    const [m, e] = x.toExponential(dg == null ? 1 : dg).split('e');
    return m + ' × 10' + String(+e).split('').map((c) => SUP[c] || c).join('');
  }
  function pctAny(x) {
    if (x <= 0) return '0%';
    if (x >= 1) return '100%';
    if (x >= 0.001) return pct(x, 1);
    return sci(x * 100) + '%';
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
  function head(p, x, y, ang, size, fill) {
    const s = size || 6;
    const bx = x - Math.cos(ang) * s, by = y - Math.sin(ang) * s;
    const px = Math.cos(ang + Math.PI / 2) * s * 0.55, py = Math.sin(ang + Math.PI / 2) * s * 0.55;
    return Pa(p, `M${r2(x)},${r2(y)}L${r2(bx + px)},${r2(by + py)}L${r2(bx - px)},${r2(by - py)}Z`, 'fill:' + fill + ';stroke:none');
  }

  /* An SVG that rebuilds itself at the stage's content width. build(svg, w) returns the height. */
  function rsvg(stage, label, build) {
    const svg = GG.svg('svg', { class: 'pfd-svg', role: 'img', 'aria-label': label }, stage);
    let w0 = 0;
    function draw(w) {
      w0 = w;
      clear(svg);
      let h = 40;
      FSMIN = w < 640 ? 9 : 0;
      try { h = build(svg, w) || 40; } catch (e) { console.error('[pf-d] figure build failed: ' + ((e && e.stack) || e)); }
      FSMIN = 0;
      h = Math.ceil(h);
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.setAttribute('width', String(w));
      svg.setAttribute('height', String(h));
    }
    GG.resize(stage, (r) => { const w = Math.floor(r.width); if (w >= 60 && w !== w0) draw(w); });
    return { svg, redraw() { if (w0) draw(w0); }, get w() { return w0; } };
  }
  function mkFig(ctx, slot, opts) { const f = ctx.figure(slot, opts); if (slot.parentNode) slot.replaceWith(f.root); return f; }
  function mkCode(ctx, slot, opts) { const c = ctx.code(slot, opts); if (slot.parentNode) slot.replaceWith(c.el); return c; }
  function legend(parent, items) {
    const d = GG.el('div', { class: 'pfd-legend' });
    d.innerHTML = items.map((it) => `<span><i class="${it[2] ? 'pfd-lg-' + it[2] : ''}" style="--sw:${it[0]}"></i>${it[1]}</span>`).join('');
    parent.appendChild(d);
    return d;
  }
  const stat = (f, label, tone) => GG.ui.stat(f.readouts, { label, value: '—', tone });

  /* ═════════════════════════ BRANCH EFFICIENCY ═════════════════════════ */

  const BE_CODE = 'int idx = blockIdx.x * blockDim.x + threadIdx.x;\n    if (idx < n)';

  GG.entry('branch-efficiency', {
    render(body, ctx) {
      const s = ctx.html(body, `
<p>A <a data-term="kernel">kernel</a> is full of decisions: <code>if</code> statements, loop conditions, early returns. On a GPU each of those decisions is made by a whole <a data-term="warp">warp</a> of 32 <a data-term="thread">threads</a> at once. <strong>Branch efficiency</strong> scores how often the threads of a warp agree when they reach one.</p>
<div class="pfd-eq" role="math" aria-label="branch efficiency equals uniform control-flow decisions divided by branch instructions executed"><span class="pfd-eq-l">branch efficiency</span><span class="pfd-eq-op">=</span><span class="pfd-frac"><span>uniform control-flow decisions</span><span>branch instructions executed</span></span><small>both counted per warp, over the whole run of the kernel</small></div>
<p>Both counts are taken at the level of warps. When a warp reaches a branch instruction it executes it once, for all of its threads together. If every active thread wants to go the same way, that is one <em>uniform</em> decision. If some threads want the <code>if</code> side and others the <code>else</code> side, the warp is <em>divergent</em>: it has to run both sides, masking off part of its threads each time. Because uniformity is measured per warp, branch efficiency reads directly as the absence of <a data-term="warp-divergence">warp divergence</a>. At 100%, no warp ever split.</p>
${GG.noteHTML('intuition', '<p>Picture a tour group of 32 people reaching a fork in the path. If everyone wants to go left, the guide walks left once. If the group splits, the guide walks the left path with some of them while the others wait, then comes back for the right path. Branch efficiency is the share of forks at which the whole group agreed.</p>')}
<h3>The bounds check is (almost) free</h3>
<p>Not all conditionals reduce branch efficiency. The most common one in GPU code is the bounds check that appears near the top of most kernels (<a href="https://godbolt.org/z/d1PsYYPnW">like this one on Godbolt</a>). Here it is exactly as the glossary prints it:</p>
<div data-slot="code"></div>
<p>A kernel is launched as a <a data-term="thread-block-grid">grid</a> of whole <a data-term="thread-block">thread blocks</a>, so the grid usually holds a few more threads than there are elements. The spare threads, those whose <code>idx</code> is at or above <code>n</code>, must do nothing. That sounds like a recipe for divergence until you look at <em>where</em> the spare threads are. Warps are cut from consecutive thread indices. Every warp that lies wholly below <code>n</code> agrees that the condition is true, and every warp wholly at or above <code>n</code> agrees that it is false. Both are uniform decisions. Only one warp can straddle <code>n</code>, holding indices both below and above it. Slide <code>n</code> in Fig.&nbsp;1 and watch that single warp travel.</p>
<div data-slot="f1"></div>
<p>With <i>W</i> warps in the launch, the bounds check therefore scores (<i>W</i>&nbsp;−&nbsp;1)&nbsp;/&nbsp;<i>W</i> at worst, and exactly 100% whenever <code>n</code> is a multiple of 32. For an array of about a million elements the worst case is still tiny: with <i>n</i>&nbsp;=&nbsp;1,000,001 (the "huge n" box's default) and 256-thread blocks the launch has 31,256 warps, one of them divergent, so branch efficiency is 31,255&nbsp;/&nbsp;31,256&nbsp;=&nbsp;99.997%. For exactly 1,000,000, a multiple of 32, it is 100%. This is why the glossary says the fragment "will generally have very high branch efficiency".</p>
<h3>Branches on data are another story</h3>
<p>The trouble starts when the condition depends on the data each thread loads. The <a data-term="warp-divergence">warp divergence</a> entry's example kernel branches on <code>data[idx] &gt; 0.5f</code>. If values above and below 0.5 are scattered at random, each thread in effect flips its own coin, and a warp decides uniformly only when all 32 coins land the same way. With even odds the chance is 2&nbsp;×&nbsp;0.5<sup>32</sup>, about one warp in two billion.</p>
<div data-slot="f2"></div>
<p>Between the scattered and the sorted arrangements nothing about the branch changed: same code, same values, same number of <code>if</code>s. Only the arrangement of the values across threads changed, and with it the time the branch costs: scattered, almost every warp has to run both paths, one after the other; sorted, almost every warp runs just one. Branch efficiency is a property of the code and its data together, and sorting or grouping similar work into the same warps is a standard way to raise it.</p>
<h3>CPUs care about time, GPUs care about space</h3>
<p>CPUs care about the uniformity of branches too, but mostly <em>over time</em>. A CPU core guesses which way a branch will go before the condition is known (<em>branch prediction</em>) and runs ahead on that guess (<em>speculative execution</em>). Circuits in the core record how each branch behaved on earlier encounters, so a branch that behaves the same way again and again gets cheaper as the program runs. A wrong guess throws away the work done on the wrong path.</p>
<p>GPUs instead care about uniformity <em>in space</em>. The threads of a warp execute concurrently in time but are mapped onto distinct data. What counts is whether, at the moment they reach the branch, they agree with each other, and performance improves when they do. Fig.&nbsp;3 lays one branch out on both axes at once: time runs down the page, the 32 threads of a warp run across it. A CPU reads the picture by columns; a GPU reads it by rows.</p>
<div data-slot="f3"></div>
${GG.noteHTML('beyond', `<p><b>The predictor in Fig.&nbsp;3</b> is a textbook two-bit saturating counter per thread, starting out weakly predicting "taken": once it is confident, it takes two wrong guesses in a row to flip its prediction. Real CPU predictors also use the recent history of this and other branches, so they learn some patterns a lone counter cannot, such as strict alternation. The principle is the same: they learn from repetition over time.</p>
<p><b>Why GPUs do not lean on prediction.</b> GPU cores do not rely on branch prediction and speculation the way CPU cores do. When a warp has to wait, the <a data-term="warp-scheduler">warp scheduler</a> issues an instruction from another warp instead (<a data-term="latency-hiding">latency hiding</a>), so there is far less to gain from guessing ahead.</p>
<p><b>Where to find the number.</b> NVIDIA's Nsight Compute profiler reports branch efficiency in its Source Counters section, next to sampled warp stall reasons.</p>`)}
<div data-slot="reading"></div>`);

      guard(() => mkCode(ctx, s.code, {
        lang: 'cpp', code: BE_CODE, caption: 'the bounds-check fragment',
        noteDefault: 'Hover or tap a marked line.',
        notes: {
          1: '<code>idx</code> is this thread\'s global index: the number of its <a data-term="thread-block">thread block</a> (<code>blockIdx.x</code>) times the threads per block (<code>blockDim.x</code>), plus its position inside the block (<code>threadIdx.x</code>). Neighbouring threads get neighbouring indices, and each warp is 32 consecutive threads of a block.',
          2: 'The bounds check. The grid has a whole number of blocks, so it can have more threads than the array has elements; the ones with <code>idx &gt;= n</code> skip the body. (The odd indentation is the glossary\'s own.)',
        },
      }));
      guard(() => beBounds(ctx, s.f1));
      guard(() => beData(ctx, s.f2));
      guard(() => beTimeSpace(ctx, s.f3));
      ctx.reading(s.reading, [
        { href: 'https://godbolt.org/z/d1PsYYPnW', label: 'Godbolt: a kernel with the bounds check', note: 'the glossary\'s link on "kernels"; it opens a version of the <code>divergent_kernel</code> from <a data-term="warp-divergence">Warp Divergence</a>, compiled for <code>sm_60</code> at <code>-O3</code>' },
        { href: 'https://docs.nvidia.com/nsight-compute/ProfilingGuide/index.html', label: 'Nsight Compute Profiling Guide', note: 'its Source Counters section is where branch efficiency is reported (Beyond the glossary)' },
      ]);
    },
  });

  /* Fig: the bounds check, warp by warp */
  function beBounds(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'The bounds check, warp by warp', hint: 'drag n · hover, tap or arrow-key a warp', wide: true,
      caption: 'Each column is one warp: 32 threads with consecutive indices, lane 0 at the top. Brackets group warps into thread blocks. Green threads have <code>idx &lt; n</code> and run the body of the <code>if</code>; grey threads are masked off. Dashed outlines are warps the launch never creates, because it launches only ⌈<i>n</i> ÷ block size⌉ blocks. At most one warp, outlined in red, holds both kinds of thread. The strip underneath magnifies one warp lane by lane: the divergent one, or whichever warp you point at (focus the chart and use ← → to step). The "huge n" box applies the same arithmetic to an array too big to draw.',
    });
    const st = { n: 1000, bd: 256, hover: -1 };
    const MAXW = 64;
    legend(f.stage, [['var(--core)', 'idx &lt; n: runs the body'], ['#4a4f68', 'idx ≥ n: masked off'], ['var(--danger)', 'divergent warp', 'outline'], ['var(--line-2)', 'not launched', 'dash']]);
    const derive = () => {
      const blocks = Math.ceil(st.n / st.bd);
      const W = (blocks * st.bd) / 32;
      const div = st.n % 32 ? Math.floor(st.n / 32) : -1;
      return { blocks, W, div, uni: W - (div >= 0 ? 1 : 0), off: W - Math.ceil(st.n / 32) };
    };
    const focusWarp = (d) => (st.hover >= 0 && st.hover < d.W ? st.hover : d.div >= 0 ? d.div : clamp(Math.floor((st.n - 1) / 32), 0, d.W - 1));
    let geo = null, hl = null, zoomG = null;
    const view = rsvg(f.stage, 'The warps of the launch drawn as columns of 32 threads, coloured by whether each thread passes the bounds check idx < n, with one warp magnified lane by lane underneath.', (svg, w) => {
      const d = derive();
      const mob = w < 640;
      const perRow = 64;
      const wpb = st.bd / 32;
      const padL = mob ? 20 : 46, padR = 2;
      const gap = mob ? 2.5 : 5;
      const bpr = perRow / wpb;
      const colW = (w - padL - padR - (bpr - 1) * gap) / perRow;
      const cellH = 5, colH = cellH * 32;
      const top = 24, below = 28;
      const bandH = top + colH + below;
      const rows = MAXW / perRow;
      const xOf = (k) => padL + k * colW + Math.floor(k / wpb) * gap;
      const cw = Math.max(1, colW - (colW > 6 ? 1.5 : 0.75));
      geo = { xOf, perRow, bandH, top, colH, cw, padL, padR, w, mob, zoomY: rows * bandH + 2 };
      for (let r = 0; r < rows; r++) {
        const y0 = r * bandH + top;
        Tx(svg, padL - 5, y0 + 7, mob ? '0' : 'lane 0', { fs: 9.5, anchor: 'end', fill: 'var(--ink-3)' });
        Tx(svg, padL - 5, y0 + colH, mob ? '31' : 'lane 31', { fs: 9.5, anchor: 'end', fill: 'var(--ink-3)' });
        for (let k = 0; k < perRow; k++) {
          const wi = r * perRow + k, x = xOf(k);
          if (wi >= d.W) { R(svg, x + 0.5, y0 + 0.5, cw - 1, colH - 1, 'fill:none;stroke:var(--line-2);stroke-dasharray:2 3'); continue; }
          const nt = clamp(st.n - wi * 32, 0, 32);
          if (nt > 0) R(svg, x, y0, cw, nt * cellH, 'fill:var(--core)');
          if (nt < 32) R(svg, x, y0 + nt * cellH, cw, (32 - nt) * cellH, 'fill:#4a4f68');
        }
        if (!mob) {
          const dd = [];
          for (let l = 1; l < 32; l++) dd.push(`M${padL},${y0 + l * cellH}H${w - padR}`);
          Pa(svg, dd.join(''), 'fill:none;stroke:rgba(11,12,18,.55);stroke-width:1');
        }
        // one label style for the whole row: the widest style that fits the largest block number
        const bW = xOf(wpb - 1) + cw - xOf(0), maxB = r * bpr + bpr - 1;
        const fits = (s) => bW >= tw(s, 9.5) + 4;
        const style = fits('block ' + maxB) ? 'block ' : fits('b' + maxB) ? 'b' : fits(String(maxB)) ? '' : null;
        for (let b = 0; b < bpr; b++) {
          const gb = r * bpr + b;
          const x1 = xOf(b * wpb), x2 = xOf(b * wpb + wpb - 1) + cw;
          const launched = gb < d.blocks;
          const yb = y0 + colH + 6;
          Pa(svg, `M${r2(x1)},${yb}v4H${r2(x2)}v-4`, 'fill:none;stroke:' + (launched ? 'var(--ink-3)' : 'var(--line-2)'));
          if (style != null) Tx(svg, (x1 + x2) / 2, yb + 16, style + gb, { fs: 9.5, anchor: 'middle', fill: launched ? 'var(--ink-2)' : 'var(--ink-3)' });
        }
      }
      if (d.div >= 0) {
        const r = Math.floor(d.div / perRow), k = d.div % perRow;
        const x = xOf(k), y0 = r * bandH + top;
        const nt = st.n - d.div * 32;
        R(svg, x - 1.5, y0 - 1.5, cw + 3, colH + 3, 'fill:none;stroke:var(--danger);stroke-width:2', { rx: 2 });
        const yn = y0 + nt * cellH;
        Pa(svg, `M${r2(x + cw + 2)},${r2(yn)}l6,-4v8z`, 'fill:var(--ink);stroke:none');
        const lab = `divergent · n = ${fI(st.n)}`;
        const lw = tw(lab, 10);
        const lx = clamp(x + cw / 2 - lw / 2, padL, w - padR - lw);
        Tx(svg, lx, y0 - 8, lab, { fs: 10, fill: 'var(--danger)', weight: 600 });
      }
      hl = R(svg, 0, 0, 0, 0, 'fill:none;stroke:var(--ink);stroke-width:1.5;pointer-events:none', { rx: 2, visibility: 'hidden' });
      for (let wi = 0; wi < d.W; wi++) {
        const r = Math.floor(wi / perRow), k = wi % perRow;
        R(svg, xOf(k) - 0.5, r * bandH + top, colW + 0.5, colH, 'fill:transparent;cursor:crosshair', { 'data-w': wi });
      }
      zoomG = G(svg);
      paintHover(true);
      return geo.zoomY + 76;
    });
    /* The magnified warp: 32 lanes side by side, with their idx values and the position of n. */
    function drawZoom() {
      if (!zoomG || !geo) return;
      FSMIN = geo.mob ? 9 : 0;
      clear(zoomG);
      const d = derive(), k = focusWarp(d), wpb = st.bd / 32;
      const lo = k * 32, np = clamp(st.n - lo, 0, 32);
      const { padL, padR, w, mob } = geo;
      const y = geo.zoomY;
      const x0 = mob ? 0 : padL, zw = w - x0 - padR, lw = zw / 32;
      const cy = y + 22, chh = 20;
      const who = st.hover >= 0 ? 'the warp you picked' : d.div >= 0 ? 'the divergent warp' : 'the last warp below n';
      Tx(zoomG, x0, y + 12, mob ? `zoom · warp ${k} (block ${Math.floor(k / wpb)})` : `zoom · warp ${k}, ${who}: warp ${k % wpb} of block ${Math.floor(k / wpb)}, lanes 0–31`, { fs: 10, fill: 'var(--ink)' });
      Tx(zoomG, w - padR, y + 12, mob ? `${np} run · ${32 - np} masked` : `${np} ${plural(np, 'lane runs', 'lanes run')} the body · ${32 - np} masked off`, { fs: 10, anchor: 'end', fill: np > 0 && np < 32 ? 'var(--danger)' : 'var(--ink-2)', weight: 600 });
      for (let l = 0; l < 32; l++) {
        const on = l < np;
        R(zoomG, x0 + l * lw + 0.75, cy, lw - 1.5, chh, on ? 'fill:var(--core)' : 'fill:#4a4f68', { rx: 2 });
        if (lw >= 14) Tx(zoomG, x0 + (l + 0.5) * lw, cy + chh / 2 + 3.3, String(l), { fs: 9, anchor: 'middle', fill: on ? '#0b0c12' : 'var(--ink-2)', pe: false });
      }
      if (!mob) {
        Tx(zoomG, x0 - 5, cy + chh / 2 + 3.3, 'lane', { fs: 9, anchor: 'end', fill: 'var(--ink-3)' });
        Tx(zoomG, x0 - 5, cy + chh + 13, 'idx', { fs: 9, anchor: 'end', fill: 'var(--ink-3)' });
      }
      const bx = x0 + np * lw;
      const nLab = `n = ${fI(st.n)}`, nW = tw(nLab, 9.5);
      const showN = st.n >= lo && st.n <= lo + 32;
      const ticks = [];
      const every = mob ? 8 : Math.max(1, Math.ceil((tw(fI(lo + 31), 9) + 6) / lw));
      for (let l = 0; l < 32; l += every) ticks.push(l);
      if (ticks[ticks.length - 1] !== 31) ticks.push(31);
      ticks.forEach((l, i) => {
        const tx = x0 + (l + 0.5) * lw, s = fI(lo + l);
        if (i > 0 && l === 31 && tx - (x0 + (ticks[i - 1] + 0.5) * lw) < tw(s, 9) + 4) return;
        if (showN && Math.abs(tx - bx) < (tw(s, 9) + nW) / 2 + 4) return;
        const lab = mob && l === 0 ? 'idx ' + s : s;
        Tx(zoomG, mob && l === 0 ? x0 : tx, cy + chh + 13, lab, { fs: 9, anchor: l === 31 && mob ? 'end' : mob && l === 0 ? 'start' : 'middle', fill: 'var(--ink-3)' });
      });
      if (showN) {
        Ln(zoomG, bx, cy - 4, bx, cy + chh + 4, 'stroke:var(--ink);stroke-width:2');
        Tx(zoomG, clamp(bx, x0 + nW / 2, w - padR - nW / 2), cy + chh + 13, nLab, { fs: 9.5, anchor: 'middle', fill: 'var(--ink)', weight: 600 });
      }
      FSMIN = 0;
    }
    function paintHover(silent) {
      if (hl && geo && st.hover >= 0) {
        const r = Math.floor(st.hover / geo.perRow), k = st.hover % geo.perRow;
        hl.setAttribute('x', r2(geo.xOf(k) - 1));
        hl.setAttribute('y', r2(r * geo.bandH + geo.top - 1));
        hl.setAttribute('width', r2(geo.cw + 2));
        hl.setAttribute('height', geo.colH + 2);
        hl.setAttribute('visibility', 'visible');
      } else if (hl) hl.setAttribute('visibility', 'hidden');
      drawZoom();
      if (!silent) why();
    }
    const pick = (e) => {
      const a = e.target && e.target.getAttribute ? e.target.getAttribute('data-w') : null;
      if (a == null) return;
      const k = +a;
      if (k !== st.hover) { st.hover = k; paintHover(); }
    };
    view.svg.addEventListener('pointermove', pick);
    view.svg.addEventListener('pointerdown', pick);
    view.svg.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch' && st.hover !== -1 && document.activeElement !== view.svg) { st.hover = -1; paintHover(); } });
    view.svg.setAttribute('tabindex', '0');
    view.svg.setAttribute('data-keys', '');
    view.svg.addEventListener('keydown', (e) => {
      const d = derive();
      let k = st.hover >= 0 ? st.hover : focusWarp(d);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') k = st.hover >= 0 ? k + 1 : k;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') k = st.hover >= 0 ? k - 1 : k;
      else if (e.key === 'Home') k = 0;
      else if (e.key === 'End') k = d.W - 1;
      else if (e.key === 'Escape') k = -1;
      else return;
      e.preventDefault();
      st.hover = k < 0 ? -1 : clamp(k, 0, d.W - 1);
      paintHover();
    });

    GG.ui.slider(f.controls, { label: 'n (array length)', min: 1, max: 2048, step: 1, value: st.n, format: fI, onInput: (v) => { st.n = Math.round(v); st.hover = -1; update(); } });
    GG.ui.seg(f.controls, { label: 'threads per block', options: [128, 256, 512].map((v) => ({ value: v, label: String(v) })), value: st.bd, onChange: (v) => { st.bd = v; st.hover = -1; update(); } });
    const bigId = GG.uid('pfd-n');
    const big = GG.el('div', { class: 'ctl pfd-bign' });
    big.append(GG.el('label', { class: 'ctl-lab', for: bigId, text: 'huge n (same block size)' }));
    const inp = GG.el('input', { type: 'number', class: 'num-in', id: bigId, min: '1', max: '2147483647', step: '1', value: '1000001', inputmode: 'numeric' });
    big.append(inp);
    f.controls.append(big);
    inp.addEventListener('input', readouts);

    const sB = stat(f, 'blocks'), sW = stat(f, 'warps'), sU = stat(f, 'uniform', 'core'), sD = stat(f, 'divergent');
    const sE = stat(f, 'branch efficiency', 'core'), sHW = stat(f, 'huge n: warps'), sHE = stat(f, 'huge n: efficiency', 'core');

    function effStr(e, W) {
      if (e >= 1) return '100%';
      const dec = clamp(Math.ceil(Math.log10(W)) - 1, 1, 9);
      return (e * 100).toFixed(dec) + '%';
    }
    function readouts() {
      const d = derive();
      sB.set(fI(d.blocks)); sW.set(fI(d.W)); sU.set(fI(d.uni));
      sD.set(d.div >= 0 ? '1' : '0', d.div >= 0 ? 'danger' : '');
      sE.set(effStr(d.uni / d.W, d.W), effTone(d.uni / d.W));
      const n = Math.floor(+inp.value);
      if (n >= 1 && n <= 2147483647) {
        const W = (Math.ceil(n / st.bd) * st.bd) / 32, dv = n % 32 ? 1 : 0;
        sHW.set(fI(W)); sHE.set(effStr((W - dv) / W, W), effTone((W - dv) / W));
      } else { sHW.set('—'); sHE.set('—'); }
    }
    function why() {
      const d = derive(), wpb = st.bd / 32;
      if (st.hover >= 0 && st.hover < d.W) {
        const k = st.hover, lo = k * 32, nt = clamp(st.n - lo, 0, 32);
        const verdict = nt === 32 ? 'all 32 threads pass the check: a uniform decision'
          : nt === 0 ? 'all 32 threads fail the check and skip the body together, which is still a uniform decision'
            : `${nt} ${plural(nt, 'thread passes', 'threads pass')} and ${32 - nt} ${plural(32 - nt, 'fails', 'fail')}: a divergent decision, so the warp runs the body with ${32 - nt} ${plural(32 - nt, 'lane')} masked off`;
        f.setWhy(`<b>Warp ${k}</b> (warp ${k % wpb} of block ${Math.floor(k / wpb)}) holds indices ${fI(lo)}–${fI(lo + 31)}: ${verdict}.`);
        return;
      }
      const launch = `<b>n = ${fI(st.n)}</b> with ${st.bd}-thread blocks launches ${d.blocks} ${plural(d.blocks, 'block')} = ${d.W} warps.`;
      const tail = d.off > 0 ? ` The last ${d.off} ${plural(d.off, 'warp lies', 'warps lie')} wholly past n and ${d.off === 1 ? 'skips' : 'skip'} the body as a unit, which also counts as uniform.` : '';
      if (d.div >= 0) {
        const nt = st.n - d.div * 32, nm = 32 - nt;
        f.setWhy(`${launch} Only warp ${d.div} (indices ${fI(d.div * 32)}–${fI(d.div * 32 + 31)}) straddles n: ${nt} of its threads ${plural(nt, 'runs', 'run')} the body and ${nm} ${plural(nm, 'is', 'are')} masked off.${tail} Branch efficiency = ${d.uni} / ${d.W} = <b>${effStr(d.uni / d.W, d.W)}</b>.`);
      } else f.setWhy(`${launch} n is a multiple of 32, so the boundary falls between two warps and no warp diverges.${tail} Branch efficiency = <b>100%</b>.`);
    }
    function update() { view.redraw(); readouts(); why(); }
    readouts(); why();
  }

  /* Fig: a data-dependent branch */
  function beData(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Branching on data: if (data[idx] > 0.5f)', hint: 'rearrange the data · change the mix', wide: true,
      caption: '1,024 threads in 32 warps, one warp per column, running the data-dependent branch from the Warp Divergence entry. Green threads read a value above 0.5 and take path A; amber threads take path B. A red bar above a column marks a divergent warp. Under each column, time runs down: the paths that warp has to execute, one after the other, each bar filled in proportion to the lanes doing useful work while the rest sit masked off. A uniform warp runs one path; a divergent warp runs both. (The model assumes paths A and B take the same time.) All three arrangements hold exactly the same values; only their order in the array differs.',
    });
    const st = { lay: 'scatter', p: 0.5, seed: 3 };
    legend(f.stage, [['var(--core)', 'value &gt; 0.5: path A'], ['var(--control)', 'value ≤ 0.5: path B'], ['var(--danger)', 'divergent warp', 'bar'], ['var(--line-2)', 'uniform warp', 'bar'], ['#2a2e44', 'lanes masked off during a pass']]);
    let U = [];
    const reseed = () => { const r = rng(st.seed * 2654435761); U = Array.from({ length: 1024 }, () => r()); };
    reseed();
    function data() {
      const sc = U.map((u) => u < st.p);
      let k = 0; sc.forEach((v) => { if (v) k++; });
      if (st.lay === 'scatter') return { a: sc, k };
      if (st.lay === 'sorted') return { a: sc.map((_, i) => i >= 1024 - k), k };
      const a = new Array(1024);
      for (let w = 0; w < 32; w++) {
        let kw = 0;
        for (let l = 0; l < 32; l++) kw += sc[w * 32 + l] ? 1 : 0;
        for (let l = 0; l < 32; l++) a[w * 32 + l] = l >= 32 - kw;
      }
      return { a, k };
    }
    function stats(a) {
      const dv = [], cA = []; let div = 0;
      for (let w = 0; w < 32; w++) {
        let c = 0;
        for (let l = 0; l < 32; l++) c += a[w * 32 + l] ? 1 : 0;
        const d = c > 0 && c < 32; dv.push(d); cA.push(c); if (d) div++;
      }
      return { div, dv, cA, passes: 32 + div };
    }
    const view = rsvg(f.stage, 'Thirty-two warps as columns of 32 threads, coloured by which side of the data-dependent branch each thread takes.', (svg, w) => {
      const { a } = data(), S = stats(a);
      const mob = w < 640;
      const padL = mob ? 20 : 46;
      const colW = (w - padL - 2) / 32;
      const cellH = mob ? 4.5 : 6, colH = cellH * 32, top = 16;
      const cw = colW - (colW > 6 ? 2 : 1);
      Tx(svg, padL - 5, top + 7, mob ? '0' : 'lane 0', { fs: 9.5, anchor: 'end', fill: 'var(--ink-3)' });
      Tx(svg, padL - 5, top + colH, mob ? '31' : 'lane 31', { fs: 9.5, anchor: 'end', fill: 'var(--ink-3)' });
      for (let wv = 0; wv < 32; wv++) {
        const x = padL + wv * colW;
        let l = 0;
        while (l < 32) {
          const v = a[wv * 32 + l];
          let e = l;
          while (e < 32 && a[wv * 32 + e] === v) e++;
          R(svg, x, top + l * cellH, cw, (e - l) * cellH, 'fill:' + (v ? 'var(--core)' : 'var(--control)'));
          l = e;
        }
        R(svg, x, top - 9, cw, 5, 'fill:' + (S.dv[wv] ? 'var(--danger)' : 'var(--line-2)'), { rx: 1.5 });
      }
      if (!mob) {
        const dd = [];
        for (let l = 1; l < 32; l++) dd.push(`M${padL},${top + l * cellH}H${w - 2}`);
        Pa(svg, dd.join(''), 'fill:none;stroke:rgba(11,12,18,.5);stroke-width:1');
      }
      const step = mob ? 8 : 4;
      for (let wv = 0; wv < 32; wv += step) Tx(svg, padL + wv * colW + cw / 2, top + colH + 14, 'w' + wv, { fs: 9.5, anchor: 'middle', fill: 'var(--ink-3)' });
      Tx(svg, padL + 31 * colW + cw / 2, top + colH + 14, 'w31', { fs: 9.5, anchor: 'middle', fill: 'var(--ink-3)' });
      /* time: the paths each warp executes, one after the other */
      const ty = top + colH + 30, ph = mob ? 11 : 13;
      Tx(svg, padL - 5, ty + ph - 3, mob ? 't' : 'time', { fs: 9.5, anchor: 'end', fill: 'var(--ink-3)' });
      Tx(svg, padL - 5, ty + 2 * ph + 8, '↓', { fs: 10, anchor: 'end', fill: 'var(--ink-3)' });
      for (let wv = 0; wv < 32; wv++) {
        const x = padL + wv * colW, kA = S.cA[wv];
        const passes = [];
        if (kA > 0) passes.push([kA, 'var(--core)']);
        if (kA < 32) passes.push([32 - kA, 'var(--control)']);
        passes.forEach(([k, col], i) => {
          const y = ty + i * (ph + 2);
          R(svg, x, y, cw, ph, 'fill:#2a2e44', { rx: 1.5 });
          R(svg, x, y, (cw * k) / 32, ph, 'fill:' + col, { rx: 1.5 });
        });
      }
      const ly = ty + 2 * (ph + 2) + 14;
      Tx(svg, padL, ly, mob ? `${S.passes} path runs; ${32} if all uniform` : `${S.passes} path runs in total, where 32 would do if every warp were uniform: ${pct(1024 / (32 * S.passes), 1)} of lane slots do useful work`, { fs: 9.5, fill: S.div ? 'var(--ink)' : 'var(--ink-2)' });
      return ly + 5;
    });
    GG.ui.seg(f.controls, { label: 'arrangement', options: [{ value: 'scatter', label: 'scattered' }, { value: 'sorted', label: 'sorted' }, { value: 'inwarp', label: 'sorted within each warp' }], value: st.lay, onChange: (v) => { st.lay = v; update(); } });
    GG.ui.slider(f.controls, { label: 'share above 0.5', min: 0, max: 100, step: 1, value: 50, format: (v) => Math.round(v) + '%', onInput: (v) => { st.p = Math.round(v) / 100; update(); } });
    GG.ui.button(f.controls, { label: 'new values', icon: 'reset', onClick: () => { st.seed++; reseed(); update(); } });
    const sDv = stat(f, 'divergent warps'), sE = stat(f, 'branch efficiency', 'core'), sX = stat(f, 'expected if random');
    const sPr = stat(f, 'path runs (32 if uniform)'), sLu = stat(f, 'useful lane slots');
    function update() {
      view.redraw();
      const { a, k } = data(), S = stats(a);
      const e = (32 - S.div) / 32, lu = 1024 / (32 * S.passes);
      const expct = Math.pow(st.p, 32) + Math.pow(1 - st.p, 32);
      sDv.set(`${S.div} / 32`, S.div ? 'danger' : '');
      sE.set(pct(e, 1), effTone(e));
      sX.set(pctAny(expct));
      sPr.set(String(S.passes), S.div ? 'danger' : 'core'); sLu.set(pct(lu, 1), effTone(lu));
      let t;
      if (k === 0 || k === 1024) t = `All 1,024 values are on the same side of 0.5, so every warp agrees whatever the arrangement: branch efficiency <b>100%</b>.`;
      else if (st.lay === 'scatter') t = `<b>Scattered:</b> ${S.div} of 32 warps hold both kinds of value and must run path A and then path B, so branch efficiency is <b>${pct(e, 1)}</b> and the warps make ${S.passes} path runs instead of 32. For values placed independently at random, the expected score is p³² + (1 − p)³² = ${pctAny(expct)}: all 32 coins must land the same way.`;
      else if (st.lay === 'sorted') {
        const b = 1024 - k;
        t = `<b>Sorted:</b> the ${fI(k)} values above 0.5 sit together at the end of the array, so whole warps agree. ` + (S.div ? `Only warp ${Math.floor(b / 32)} straddles the boundary (index ${fI(b)}) and runs both paths: ` : 'The boundary falls exactly between two warps: ') + `branch efficiency <b>${pct(e, 1)}</b>, ${S.passes} path runs. It is the bounds check all over again.`;
      } else t = `<b>Sorted within each warp:</b> every warp still holds the same mix of values as before, so nothing improves (${S.div} divergent, <b>${pct(e, 1)}</b>, still ${S.passes} path runs). What matters is which values share a warp; their order inside it makes no difference.`;
      f.setWhy(t);
    }
    update();
  }

  /* Fig: time (CPU) vs space (GPU) */
  function beTimeSpace(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'One branch, two axes: time and space', hint: 'pick a branch · play through time', wide: true,
      caption: 'Each cell is one thread (column) reaching the same branch on one of 16 successive encounters (row), say iterations <i>i</i> = 0 … 15 of a loop. Green: taken; amber: not taken. <b>GPU reading, by rows:</b> the 32 threads are one warp, so each row is one branch instruction, uniform or divergent, summed up in the column on the right. <b>CPU reading, by columns:</b> imagine each thread on its own CPU core, whose predictor (a simple two-bit counter) guesses each outcome from that thread\'s own history. A red dot marks a wrong guess, and the lavender bars along the bottom count each thread\'s wrong guesses.',
    });
    const FL = (() => { const r = rng(4242); return Array.from({ length: 16 }, () => r() < 0.5); })();
    const DA = (() => { const r = rng(777); return Array.from({ length: 512 }, () => r() < 0.5); })();
    const PAT = {
      lane: { label: 'threadIdx.x % 2', code: 'if (threadIdx.x % 2)', f: (t, l) => l % 2 === 1 },
      time: { label: 'flag[i]', code: 'if (flag[i])', f: (t) => FL[t] },
      once: { label: 'i < 10', code: 'if (i < 10)', f: (t) => t < 10 },
      both: { label: 'data[i][tid] > 0.5f', code: 'if (data[i][threadIdx.x] > 0.5f)', f: (t, l) => DA[t * 32 + l] },
    };
    const st = { pat: 'lane', t: 16, playing: false };
    legend(f.stage, [['var(--core)', 'taken'], ['var(--control)', 'not taken'], ['var(--danger)', 'CPU mispredicted', 'dot'], ['var(--host)', 'CPU: wrong guesses per thread'], ['var(--danger)', 'GPU: warp diverged', 'outline'], ['var(--core)', 'GPU: warp uniform', 'outline']]);
    function sim() {
      const P = PAT[st.pat];
      const out = [], mis = [], uni = [];
      const ctr = new Array(32).fill(2);
      for (let t = 0; t < 16; t++) {
        const row = [], mr = [];
        for (let l = 0; l < 32; l++) {
          const o = !!P.f(t, l), pred = ctr[l] >= 2;
          row.push(o); mr.push(pred !== o);
          ctr[l] = o ? Math.min(3, ctr[l] + 1) : Math.max(0, ctr[l] - 1);
        }
        out.push(row); mis.push(mr); uni.push(row.every((v) => v === row[0]));
      }
      return { out, mis, uni };
    }
    let rowsG = [], cursor = null, geo = null, bars = [], barTx = [], cpuTot = null;
    const BARMAX = 16;
    const view = rsvg(f.stage, 'A 16 by 32 grid: rows are successive encounters of a branch, columns are the 32 threads of a warp, with a verdict per row and a count of wrong guesses per column.', (svg, w) => {
      const S = sim();
      const mob = w < 640;
      const padL = mob ? 24 : 50, padR = mob ? 18 : 80, top = 34;
      const cw = (w - padL - padR) / 32, ch = mob ? 13 : 17;
      Tx(svg, mob ? 46 : padL, 11, mob ? 'space → 32 threads of one warp' : 'SPACE → the 32 threads of one warp (lanes 0–31)', { fs: 10, fill: 'var(--ink)', ls: '0.03em' });
      Tx(svg, 0, 11, 'time ↓', { fs: 10, fill: 'var(--ink)' });
      if (!mob) Tx(svg, w - padR + 6, 11, 'GPU view', { fs: 10, fill: 'var(--ink)' });
      else Tx(svg, w, 11, 'GPU', { fs: 9, anchor: 'end', fill: 'var(--ink)' });
      Tx(svg, padL - 5, top - 6, 'i', { fs: 9.5, anchor: 'end', fill: 'var(--ink-2)', weight: 600 });
      for (let l = 0; l < 32; l++) {
        if (cw >= 15 || l % 8 === 0 || l === 31) Tx(svg, padL + (l + 0.5) * cw, top - 6, String(l), { fs: 8.5, anchor: 'middle', fill: 'var(--ink-3)' });
      }
      rowsG = [];
      for (let t = 0; t < 16; t++) {
        const g = G(svg); rowsG.push(g);
        const y = top + t * ch;
        Tx(g, padL - 5, y + ch / 2 + 3.5, mob ? String(t) : 'i = ' + t, { fs: 9, anchor: 'end', fill: 'var(--ink-3)' });
        for (let l = 0; l < 32; l++) {
          const x = padL + l * cw;
          R(g, x + 0.5, y + 0.5, cw - 1, ch - 1, 'fill:' + (S.out[t][l] ? 'var(--core)' : 'var(--control)') + ';fill-opacity:.82');
          if (S.mis[t][l]) C(g, x + cw / 2, y + ch / 2, Math.max(1.8, Math.min(cw, ch) * 0.2), 'fill:var(--danger);stroke:#0b0c12;stroke-width:1');
        }
        const u = S.uni[t];
        if (mob) R(g, w - padR + 5.5, y + ch / 2 - 4, 9, 8, 'fill:' + (u ? 'var(--core-a)' : 'var(--danger-a)') + ';stroke:' + (u ? 'var(--core)' : 'var(--danger)') + ';stroke-width:1.2', { rx: 2 });
        else {
          R(g, w - padR + 6, y + 2, padR - 8, ch - 4, 'fill:' + (u ? 'var(--core-a)' : 'var(--danger-a)') + ';stroke:' + (u ? 'var(--core)' : 'var(--danger)') + ';stroke-width:1', { rx: 4 });
          Tx(g, w - padR + 6 + (padR - 8) / 2, y + ch / 2 + 3.5, u ? 'uniform' : 'divergent', { fs: 9.5, anchor: 'middle', fill: u ? 'var(--core)' : 'var(--danger)' });
        }
      }
      /* CPU reading: wrong guesses per thread (column), on a fixed 0–16 scale */
      const yb0 = top + 16 * ch + 6, bh = mob ? 30 : 34, numH = 12;
      const base = yb0 + numH + bh;
      bars = []; barTx = [];
      R(svg, padL, yb0 + numH, 32 * cw, bh, 'fill:rgba(184,164,255,.05)');
      for (let l = 0; l < 32; l++) {
        const x = padL + l * cw;
        bars.push(R(svg, x + 1, base, Math.max(1, cw - 2), 0, 'fill:var(--host)', { rx: 1 }));
        barTx.push(Tx(svg, x + cw / 2, base, '', { fs: 9, anchor: 'middle', fill: 'var(--host)' }));
      }
      Ln(svg, padL, base + 0.5, padL + 32 * cw, base + 0.5, 'stroke:var(--line-2)');
      if (!mob) {
        Tx(svg, padL - 5, yb0 + numH + 10, 'CPU', { fs: 9, anchor: 'end', fill: 'var(--host)', weight: 600 });
        Tx(svg, padL - 5, yb0 + numH + 21, 'misses', { fs: 9, anchor: 'end', fill: 'var(--host)' });
        cpuTot = Tx(svg, w - padR + 6, base - 4, '', { fs: 9.5, fill: 'var(--host)', weight: 600 });
        Tx(svg, w - padR + 6, base - 18, 'wrong', { fs: 9, fill: 'var(--ink-3)' });
      } else cpuTot = null;
      const yb = base + 16;
      Tx(svg, padL, yb, mob ? 'CPU view ↑ bars: each thread\'s wrong guesses' : 'CPU view ↑ each column is one thread\'s history, read by its own predictor; the bars count its wrong guesses (scale 0–16)', { fs: 10, fill: 'var(--ink)' });
      cursor = R(svg, padL - 2, top, w - padL - padR + 4, ch, 'fill:none;stroke:var(--ink);stroke-width:1.8;pointer-events:none', { rx: 2, visibility: 'hidden' });
      geo = { padL, padR, top, ch, w, base, bh, cw };
      paintTime();
      return yb + 6;
    });
    function paintTime() {
      rowsG.forEach((g, t) => g.setAttribute('opacity', t < st.t ? '1' : '0.12'));
      if (cursor && geo) {
        if (st.playing && st.t >= 1) { cursor.setAttribute('y', r2(geo.top + (st.t - 1) * geo.ch)); cursor.setAttribute('visibility', 'visible'); }
        else cursor.setAttribute('visibility', 'hidden');
      }
      if (geo && bars.length) {
        const S = sim();
        let tot = 0;
        for (let l = 0; l < 32; l++) {
          let m = 0;
          for (let t = 0; t < st.t; t++) if (S.mis[t][l]) m++;
          tot += m;
          const h = (Math.min(m, BARMAX) / BARMAX) * geo.bh;
          bars[l].setAttribute('y', r2(geo.base - h)); bars[l].setAttribute('height', r2(h));
          if (barTx[l]) { barTx[l].textContent = tw(String(m), 9) <= geo.cw + 1 ? String(m) : ''; barTx[l].setAttribute('y', r2(geo.base - h - 3)); }
        }
        if (cpuTot) cpuTot.textContent = `${tot} of ${32 * st.t}`;
      }
      readouts();
    }
    const sG = stat(f, 'GPU branch efficiency', 'core'), sC = stat(f, 'CPU prediction accuracy', 'host'), sT = stat(f, 'encounters shown');
    function readouts() {
      const S = sim();
      let u = 0, ok = 0;
      for (let t = 0; t < st.t; t++) { if (S.uni[t]) u++; for (let l = 0; l < 32; l++) if (!S.mis[t][l]) ok++; }
      sG.set(st.t ? pct(u / st.t, 1) : '—', st.t ? effTone(u / st.t) : '');
      sC.set(st.t ? pct(ok / (32 * st.t), 1) : '—');
      sT.set(`${st.t} / 16`);
    }
    function why() {
      const S = sim();
      let u = 0, ok = 0;
      for (let t = 0; t < 16; t++) { if (S.uni[t]) u++; for (let l = 0; l < 32; l++) if (!S.mis[t][l]) ok++; }
      const g = pct(u / 16, 1), c = pct(ok / 512, 1), code = `<code>${GG.esc(PAT[st.pat].code)}</code>`;
      const all = 'over all 16 encounters';
      const T = {
        lane: `${code}: each thread always goes the same way, so each CPU predictor locks on after at most one miss (CPU accuracy ${all} <b>${c}</b>). But neighbouring threads always disagree, so every row splits: GPU branch efficiency <b>${g}</b>. Perfectly predictable in time, maximally divergent in space.`,
        time: `${code}: at every encounter all 32 threads agree (GPU branch efficiency <b>${g}</b> ${all}), but the outcome jumps about over time, so a predictor watching any one thread keeps guessing wrong (CPU accuracy <b>${c}</b>). Uniform in space, unpredictable in time.`,
        once: `${code}: all threads agree and the outcome changes only once, at <i>i</i> = 10, so both readings are good ${all}: GPU branch efficiency <b>${g}</b>, CPU accuracy <b>${c}</b> (two misses per thread around the switch while the counter flips).`,
        both: `${code}: random along both axes, the worst of both worlds ${all}: GPU branch efficiency <b>${g}</b>, CPU accuracy <b>${c}</b>, about what coin-flipping would give.`,
      };
      f.setWhy(T[st.pat] + (st.playing ? ' While it plays, the stat chips and the lavender bars count only the encounters shown so far.' : ''));
    }
    GG.ui.seg(f.controls, { label: 'branch condition', options: Object.keys(PAT).map((k) => ({ value: k, label: PAT[k].label })), value: st.pat, onChange: (v) => { st.pat = v; view.redraw(); why(); } });
    const ROW = 0.42;
    const anim = GG.anim(f.stage, (time) => {
      const t = Math.min(16, Math.floor(time / ROW) + 1);
      if (t !== st.t) { st.t = t; paintTime(); }
      if (time >= 16 * ROW + 0.6) { anim.stop(); st.playing = false; st.t = 16; btn.setLabel('Play through time', 'play'); paintTime(); why(); }
    }, { autostart: false });
    const btn = GG.ui.button(f.controls, {
      label: 'Play through time', icon: 'play',
      onClick: () => {
        if (anim.running) { anim.stop(); st.playing = false; st.t = 16; btn.setLabel('Play through time', 'play'); paintTime(); why(); return; }
        anim.reset(); st.t = 0; st.playing = true; btn.setLabel('Stop', 'pause'); paintTime(); why(); anim.start();
      },
    });
    why();
  }

  /* ═════════════════════════ MEMORY COALESCING ═════════════════════════ */

  const MC_CODE = `__global__ void strided_read_kernel(const float* __restrict__ in,
                                    float* __restrict__ out,
                                    size_t N, int stride)
{
    const size_t t  = blockIdx.x * blockDim.x + threadIdx.x;
    const size_t T  = gridDim.x * (size_t)blockDim.x;

    float acc = 0.f;

    for (size_t j = (size_t)t * (size_t)stride; j < N; j += (size_t)T * (size_t)stride) {
        // across a warp, addresses differ by (stride * sizeof(float))
        float v = in[j]; // perfectly coalesced for stride == 1
        acc = acc * 1.000000119f + v;  // force compiler to keep the load
    }

    // do one write per thread (negligible vs reads)
    if (t < N) out[t] = acc;
}`;
  const MC_OUT = `# Device: Tesla T4 (SM 75)
# N = 67108864 floats (256.0 MB), iters = 10
stride        GB/s
    1       206.0
    2       130.5
    4        68.8
    8        33.8
   16        16.8
   32        15.2
   64        13.6
  128        11.2`;
  const T4 = [[1, 206.0], [2, 130.5], [4, 68.8], [8, 33.8], [16, 16.8], [32, 15.2], [64, 13.6], [128, 11.2]];

  GG.entry('memory-coalescing', {
    render(body, ctx) {
      const s = ctx.html(body, `
<p>Every load instruction a <a data-term="warp">warp</a> executes is really 32 loads, one for each of its <a data-term="thread">threads</a>. <strong>Memory coalescing</strong> is the hardware noticing when those 32 <em>logical</em> reads sit close together in memory and serving them with one <em>physical</em> access instead of many. It is a hardware technique for getting more use out of the GPU's <a data-term="memory-bandwidth">memory bandwidth</a>, and the access pattern that decides whether it can work is in the programmer's hands.</p>
<p>Coalescing happens on accesses to <a data-term="global-memory">global memory</a>. For efficient access to <a data-term="shared-memory">shared memory</a>, which follows different rules, see <a data-term="bank-conflict">bank conflict</a>.</p>
<p>Fig.&nbsp;1 shows the whole idea on one warp and one load. Each thread reads a 4-byte float; the only thing that changes is how far apart neighbouring threads' floats are.</p>
<div data-slot="f1"></div>
<h3>Why DRAM wants to be read in bursts</h3>
<p>In <a data-term="cuda-device-architecture">CUDA</a> GPUs, global memory is backed by the <a data-term="gpu-ram">GPU RAM</a>, built with Dynamic Random Access Memory (DRAM) technologies like GDDR or HBM. GDDR (graphics DDR) is DRAM in separate chips on the circuit board around the GPU; HBM (High Bandwidth Memory) is stacks of DRAM dies placed right next to the GPU die and joined to it by a very wide bus. These technologies have high memory bandwidth but long access latency, long even compared to DDR5, the peer DRAM technology used as CPU RAM (the fifth generation of DDR, "double data rate", memory).</p>
<p>The latency comes from physics. A DRAM bit is a small charge on a tiny capacitor. Reading it means letting that capacitor charge up its access line until a sense amplifier can tell a 1 from a 0, and the speed of that step is fundamentally limited by thermal, power and size constraints. So every access starts with a slow, fixed cost. Because of this high latency, if each logical memory access were serviced as a separate physical access, much of the memory system's effort would go into paying that cost over and over, and the GPU's memory bandwidth would not be fully utilised.</p>
<div data-slot="f2"></div>
<p>Memory coalescing takes advantage of how DRAM works inside to reach full bandwidth utilisation for certain access patterns. Each time a DRAM address is accessed, multiple consecutive addresses are fetched together, in parallel, in a single clock. This access and transfer of consecutive memory locations is called a <strong>DRAM burst</strong>. If multiple concurrent logical accesses are serviced by a single physical burst, the access is said to be <strong>coalesced</strong>. A physical access is part of a <strong>memory transaction</strong>, a term you will meet in other descriptions of memory coalescing. For a bit more detail, see Section 6.1 of <a href="https://www.amazon.com/dp/0323912311">the 4th edition of <i>Programming Massively Parallel Processors</i></a>; for comprehensive detail, Ulrich Drepper's excellent article <a href="https://people.freebsd.org/~lstewart/articles/cpumemory.pdf"><i>What Every Programmer Should Know About Memory</i></a>.</p>
<h3>CPUs do this with cache lines, automatically</h3>
<p>On CPUs, a similar mapping of bursts onto <em>cache lines</em> improves access efficiency. Touch one byte and the cache pulls in its whole line, so a loop walking an array finds its next several elements already on chip. As is common in GPU programming, what is automatic cache behaviour on a CPU is programmer-managed here: the hardware merges whatever a warp's threads ask for, but only the programmer can arrange for those addresses to land close together.</p>
<div data-slot="f3"></div>
<h3>SIMT makes coalescing easy</h3>
<p>That is less hard than it could be, because DRAM bursts line up elegantly with the single-instruction, multiple-thread (SIMT) execution model of <a data-term="parallel-thread-execution">CUDA PTX</a>. In normal execution, all threads in a warp execute the same instruction at the same time. The 32 addresses of one load therefore reach the <a data-term="load-store-unit">Load/Store Units</a> together, which makes it simple for the memory hardware to detect accesses that can share a burst, and easy for a <a data-term="cuda-programming-model">CUDA</a> programmer to write coalesced code: let thread <i>t</i> touch element <i>t</i>. The sizes fit, too. Typically a single burst can service 128 bytes, which, not coincidentally, is enough for each of the 32 threads in a warp to load one 32-bit float.</p>
<div data-slot="nums"></div>
${GG.noteHTML('beyond', `<p><b>The same idea at a finer grain.</b> NVIDIA's current <a href="https://docs.nvidia.com/cuda/cuda-programming-guide/02-basics/writing-cuda-kernels.html">CUDA Programming Guide</a> (§2.3.4.1) puts it in one line: "Global memory is accessed via 32-byte memory transactions." (Older editions described naturally aligned 32-, 64- or 128-byte transactions.) The Best Practices Guide adds that on GPUs of compute capability 6.0 or newer "the concurrent accesses of the threads of a warp will coalesce into a number of transactions equal to the number of 32-byte transactions necessary to service all of the threads of the warp" (<a href="https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/index.html">CUDA C++ Best Practices Guide</a>). A perfectly coalesced warp touches four 32-byte <em>sectors</em>, the 128 bytes of one cache line of the <a data-term="l1-data-cache">L1 data cache</a>. The sector switch in Fig.&nbsp;1 counts those instead of 128-byte bursts: in the worst case each 4-byte load then drags in 32 bytes, dividing throughput by 8 rather than by 32.</p>
<p><b>Alignment matters as well.</b> The offset slider in Fig.&nbsp;1 starts the warp's floats part-way into a burst: even perfectly consecutive addresses then straddle a boundary and cost two physical accesses.</p>`)}
<h3>Measuring it: a strided read</h3>
<p>To see the performance impact, the glossary uses the <a data-term="kernel">kernel</a> below. It reads values from an array with a variable <code>stride</code>, the spacing between the elements that neighbouring threads access. As the stride grows, the number of DRAM bursts needed to service each warp's read grows with it, so there are more physical accesses per logical access, and memory throughput drops. The kernel does one multiply-add per 4-byte float it loads, a tiny <a data-term="arithmetic-intensity">arithmetic intensity</a>, so it is firmly <a data-term="memory-bound">memory-bound</a>: its speed is set entirely by how well it uses the memory system.</p>
<div data-slot="code"></div>
<p>Run as a micro-benchmark on Godbolt (you can <a href="https://godbolt.org/z/KbWhEWjcb">reproduce it here</a>), it shows the expected relationship between stride and throughput:</p>
<div data-slot="out"></div>
<div data-slot="f4"></div>
<p>Read the curve from the left. Adding a stride of two cuts the throughput roughly in half, because the number of DRAM bursts needed to serve each warp's request doubles. Doubling the stride to four cuts it in half once more, and so on. The glossary puts the change of pattern at a stride of 16, where counting bursts predicts a 16× reduction in throughput (the measured drop is 12.3×; see the note below). From there performance degrades differently and much more slowly, presumably because other parts of the memory subsystem become visible and suffer from the reduced locality: for example, misses in the on-device TLB (translation lookaside buffer, the small cache of virtual-to-physical address translations).</p>
<div data-slot="table"></div>
${GG.noteHTML('check', `<p>"Cuts the throughput in half" is a round description. The measured steps are ×0.63 (stride 1 → 2), ×0.53, ×0.49 and ×0.50, and at stride 16 throughput is 206.0 ÷ 16.8 = 12.3× lower than at stride 1; 16× is what counting bursts predicts. A pure 128-byte-burst model would also keep halving until stride 32, where every burst carries a single useful float, while the measurement bends one step earlier. Switch Fig.&nbsp;4 to the 32-byte-sector model and it bends too early, at stride 8.</p>
<p><b>The measurement itself rules out 128 physical bytes per float.</b> From stride 32 on, every float sits in a 128-byte line of its own. If the hardware really moved a whole 128-byte burst for each one, the DRAM would have to move 32 bytes for every useful byte: 15.2 × 32 = 486 GB/s at stride 32, 13.6 × 32 = 435 GB/s at 64 and 11.2 × 32 = 358 GB/s at 128, all above the T4's rated 320 GB/s. So the glossary's 128-byte burst is best read as the coalescing unit, one 128-byte cache line, and not as the size of one physical DRAM transfer. On the T4's GDDR6 memory, one burst on one 16-bit channel carries 32 bytes (Micron's GDDR6 technical note, Beyond the glossary). A 64-byte unit (16 floats) is the one that fits these numbers. It keeps the implied DRAM traffic between 206 and 275 GB/s for strides 1 to 16, and its model line bends exactly at 16, as the measurement does: pick "64-byte units" in Fig.&nbsp;4. This data alone cannot say which part of the memory system sets that 64-byte unit. Caches, DRAM timing and address translation all shape the real curve.</p>`)}
${GG.noteHTML('beyond', `<p><b>How the benchmark counts.</b> The Godbolt harness launches 256-thread blocks, 8 blocks per SM, does one warm-up run, then times 10 launches with CUDA events. Its GB/s counts only the bytes the kernel asked for, (N ÷ stride) floats × 4 bytes per launch, so a stride of 2 that reads half as many floats in the same time shows up as half the GB/s. (Its source comments are worded slightly differently from the listing above.) The "256.0 MB" in the header is N × 4 bytes divided by 1024², that is 256 MiB or 268 million bytes.</p>
<p><b>The GPU.</b> "SM 75" is compute capability 7.5, the Turing architecture. NVIDIA lists the <a href="https://www.nvidia.com/en-us/data-center/tesla-t4/">T4</a> with 16 GB of GDDR6 at "320+ GB/s", so even the stride-1 run reaches about 64% of the rated bandwidth in this simple kernel.</p>`)}
<p>For more best practices for global memory access, see the post <a href="https://developer.nvidia.com/blog/how-access-global-memory-efficiently-cuda-c-kernels/"><i>How to Access Global Memory Efficiently in CUDA C/C++ Kernels</i></a> on the NVIDIA Developer blog.</p>
<div data-slot="reading"></div>`);

      guard(() => mcWarp(ctx, s.f1));
      guard(() => mcDram(ctx, s.f2));
      guard(() => mcCpuGpu(ctx, s.f3));
      guard(() => ctx.numbers(s.nums, [
        { value: '128 B', label: 'one burst in the glossary\'s model: one cache line', tone: 'memory' },
        { value: '32 × 4 B', label: 'a warp loading one 32-bit float per thread', tone: 'core' },
        { value: '1', label: 'physical access for a perfectly coalesced warp load' },
        { value: '32', label: 'physical accesses when every thread needs its own burst', tone: 'danger' },
      ]));
      guard(() => mkCode(ctx, s.code, {
        lang: 'cuda', code: MC_CODE, wide: true, caption: 'the glossary\'s strided read kernel',
        notes: {
          1: '<code>in</code> points to the array in <a data-term="global-memory">global memory</a>. <code>__restrict__</code> promises the compiler that <code>in</code> and <code>out</code> never overlap, so it may schedule the loads freely.',
          3: '<code>N</code> is the array length in floats (67,108,864 in the benchmark); <code>stride</code> is the spacing, in floats, between the elements neighbouring threads read.',
          5: '<code>t</code>: this thread\'s global index. Consecutive threads, and so the 32 threads of each warp, get consecutive values of <code>t</code>.',
          6: '<code>T</code>: the total number of threads in the grid, used as the step of the loop below.',
          10: 'A grid-stride loop. Thread <code>t</code> starts at element <code>t × stride</code> and jumps ahead by <code>T × stride</code> each iteration, so the whole grid together reads every <code>stride</code>-th element: N ÷ stride loads in total.',
          11: 'The key fact. In iteration <i>i</i>, lane <i>k</i> of a warp whose first thread is <i>t</i>₀ reads element <code>(t₀ + k + i·T) × stride</code>, so neighbouring lanes are always <code>stride × 4</code> bytes apart. That is exactly what Fig.&nbsp;1 draws.',
          12: 'The load all the fuss is about: one instruction, executed by all 32 threads of a warp at once, 32 logical reads. With <code>stride == 1</code> they are 128 consecutive bytes, one burst.',
          13: 'Folds each loaded value into a running result that is written out at the end, so the compiler has to keep every load: that is the comment\'s point. <code>1.000000119f</code> rounds to the smallest float above 1.0 (1 + 2⁻²³), so the multiply is not a multiply by exactly 1, which a compiler could simply delete.',
          17: 'One coalesced write per thread, tiny next to the N ÷ stride reads, so the timing measures reads.',
        },
      }));
      guard(() => mkCode(ctx, s.out, { lang: 'text', langLabel: 'output', code: MC_OUT, caption: 'the micro-benchmark on a Tesla T4', lineNumbers: false }));
      guard(() => mcChart(ctx, s.f4));
      guard(() => mcTable(s.table));
      ctx.reading(s.reading, [
        { href: 'https://www.amazon.com/dp/0323912311', label: 'Programming Massively Parallel Processors, 4th ed.', note: 'Section 6.1 covers memory coalescing' },
        { href: 'https://people.freebsd.org/~lstewart/articles/cpumemory.pdf', label: 'Ulrich Drepper, What Every Programmer Should Know About Memory', note: 'DRAM internals, bursts and caches in comprehensive detail' },
        { href: 'https://godbolt.org/z/KbWhEWjcb', label: 'Godbolt: the strided-read micro-benchmark', note: 'the full harness around the kernel above' },
        { href: 'https://developer.nvidia.com/blog/how-access-global-memory-efficiently-cuda-c-kernels/', label: 'How to Access Global Memory Efficiently in CUDA C/C++ Kernels', note: 'NVIDIA Developer blog' },
        { href: 'https://docs.nvidia.com/cuda/cuda-programming-guide/02-basics/writing-cuda-kernels.html', label: 'CUDA Programming Guide: Coalesced Global Memory Access (§2.3.4.1)', note: '"Global memory is accessed via 32-byte memory transactions" (Beyond the glossary)' },
        { href: 'https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/index.html', label: 'CUDA C++ Best Practices Guide', note: 'the compute-capability-6.0 coalescing rule, quoted above (Beyond the glossary)' },
        { href: 'https://www.mouser.com/pdfDocs/tned03_gddr6-4.pdf', label: 'Micron TN-ED-03: GDDR6, the Next-Generation Graphics DRAM', note: 'two 16-bit channels per chip, 16n prefetch, 32-byte access granularity per channel (Beyond the glossary)' },
      ]);
    },
  });

  /* Fig: one warp, one load */
  function mcWarp(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'One warp, one load: float v = in[j]', hint: 'pick a stride · watch the bursts', wide: true,
      caption: 'Top: the 32 threads (lanes) of a warp executing the same load instruction; a lane turns green once its float has arrived. Middle: the global-memory bytes they address, cut into 128-byte bursts, the unit one physical access moves in the glossary\'s model (or into 32-byte sectors, with the switch on). This ruler zooms to fit the warp\'s footprint; the strip under it keeps one fixed scale, the first 16 KiB of the array, so you can see the footprint grow with the stride. Lit boxes are the physical accesses the warp needs; blue ticks are the floats threads asked for; the red-tinted rest of each lit box is fetched and then thrown away. Bottom: the accesses played out in time, one after another, each paying the slow activation of Fig.&nbsp;2 before its burst (schematic: one access at a time, not to scale).',
    });
    const st = { s: 1, off: 0, sector: false };
    legend(f.stage, [['var(--core)', 'thread whose float has arrived'], ['var(--memory)', 'a float a thread asked for'], ['var(--memory)', 'fetched but unused', 'tint'], ['var(--line-2)', 'memory the warp does not touch', 'outline'], ['var(--control)', 'activate (slow)'], ['var(--memory)', 'burst on the bus', 'bar']]);
    const DT = 0.34, OV = 16384;
    let Rf = null, anim = null;
    function model() {
      const U = st.sector ? 32 : 128;
      const addr = [];
      for (let t = 0; t < 32; t++) addr.push((st.off + t * st.s) * 4);
      const map = new Map();
      addr.forEach((a, t) => { const u = Math.floor(a / U); if (!map.has(u)) map.set(u, []); map.get(u).push(t); });
      const list = [...map.keys()].sort((x, y) => x - y).map((u) => ({ u, lanes: map.get(u) }));
      const end = Math.max(128, Math.ceil((addr[31] + 4) / 128) * 128);
      return { U, addr, list, P: list.length, end };
    }
    const view = rsvg(f.stage, 'The 32 threads of a warp, joined by lines to the addresses they load on a strip of global memory divided into bursts, a fixed-scale overview of the footprint, and a timeline of the physical accesses.', (svg, w) => {
      const m = model();
      const mob = w < 600;
      const px = mob ? 1 : 3, iw = w - 2 * px;
      const lw = iw / 32;
      const laneY = mob ? 16 : 20, laneH = mob ? 15 : 20;
      const ruY = laneY + laneH + (mob ? 64 : 92), ruH = mob ? 32 : 40;
      const sc = iw / m.end;
      const unitName = st.sector ? 'sector' : 'burst';
      if (!mob) {
        Tx(svg, px, 11, 'the warp: 32 threads executing one load instruction', { fs: 10, fill: 'var(--ink-2)' });
        Tx(svg, w - px, 11, '32 logical accesses', { fs: 10, anchor: 'end', fill: 'var(--ink-2)' });
      }
      const lines = [];
      for (let t = 0; t < 32; t++) {
        const x1 = px + (t + 0.5) * lw, y1 = laneY + laneH, x2 = px + (m.addr[t] + 2) * sc, y2 = ruY;
        const el = Pa(svg, `M${r2(x2)},${r2(y2)}L${r2(x1)},${r2(y1)}`, 'fill:none;stroke:var(--ink-3);stroke-width:1;opacity:.45');
        lines.push({ el, L: Math.hypot(x2 - x1, y2 - y1) });
      }
      const lanes = [], laneTx = [];
      for (let t = 0; t < 32; t++) {
        const x = px + t * lw;
        lanes.push(R(svg, x + 1, laneY, lw - 2, laneH, 'fill:var(--surface-3);stroke:var(--line-2)', { rx: 2.5 }));
        if (lw >= 17) laneTx[t] = Tx(svg, x + lw / 2, laneY + laneH / 2 + 3.2, String(t), { fs: 9, anchor: 'middle', fill: 'var(--ink-3)', pe: false });
        else if (t % 8 === 0 || t === 31) Tx(svg, x + lw / 2, laneY - 4, 't' + t, { fs: 8.5, anchor: t === 0 ? 'start' : t === 31 ? 'end' : 'middle', fill: 'var(--ink-3)' });
      }
      const touched = new Set(m.list.map((x) => x.u));
      const units = {};
      const nU = m.end / m.U;
      for (let u = 0; u < nU; u++) {
        const x = px + u * m.U * sc, uw = m.U * sc, g = uw > 4 ? 1 : 0;
        const on = touched.has(u);
        const el = uw >= 4
          ? R(svg, x + g / 2, ruY, uw - g, ruH, on ? 'fill:rgba(255,91,110,.2);stroke:var(--memory);stroke-width:1' : 'fill:var(--surface-2);stroke:var(--line);stroke-width:1')
          : R(svg, x, ruY, uw + 0.2, ruH, on ? 'fill:rgba(255,91,110,.45)' : 'fill:var(--surface-2)');
        if (on && uw >= 4) units[u] = el;
      }
      if (st.sector && 128 * sc >= 6) {
        const dd = [];
        for (let b = 0; b <= m.end / 128; b++) { const x = px + b * 128 * sc; dd.push(`M${r2(x)},${ruY - 4}V${ruY + ruH + 4}`); }
        Pa(svg, dd.join(''), 'fill:none;stroke:var(--ink-2);stroke-width:1.2');
      }
      const wpx = 4 * sc;
      const ww = Math.max(1.6, wpx - (wpx > 3 ? 1 : 0));
      for (let t = 0; t < 32; t++) R(svg, px + m.addr[t] * sc + (wpx > 3 ? 0.5 : 0), ruY + 4, ww, ruH - 8, 'fill:var(--memory);pointer-events:none');
      m.list.forEach((un) => {
        const uw = m.U * sc, lab = `${unitName} ${un.u}`;
        if (uw >= tw(lab, 9) + 14) {
          const lx = px + un.u * m.U * sc + 4;
          R(svg, lx, ruY + ruH - 16, tw(lab, 9) + 8, 13, 'fill:rgba(11,12,18,.88);pointer-events:none', { rx: 3 });
          Tx(svg, lx + 4, ruY + ruH - 6, lab, { fs: 9, fill: 'var(--ink)', pe: false });
        }
      });
      /* address ticks, spaced by the real label width so they never collide */
      const yl = ruY + ruH + 13;
      const bpx = 128 * sc, nB = m.end / 128;
      const dg = m.end > 4096 ? 4 : 3;
      const labW = tw(hex(0, dg), 9);
      const step = Math.max(1, Math.ceil((labW + 8) / bpx));
      let lastR = -Infinity;
      const ticks = [];
      for (let b = 0; b <= nB; b += step) ticks.push(b);
      if (ticks[ticks.length - 1] !== nB) ticks.push(nB);
      ticks.forEach((b) => {
        const x = px + b * bpx;
        const anchor = b === 0 ? 'start' : x + labW / 2 > w - 1 ? 'end' : 'middle';
        const left = anchor === 'start' ? x : anchor === 'end' ? x - labW : x - labW / 2;
        if (left < lastR + 6) return;
        Tx(svg, x, yl, hex(b * 128, dg), { fs: 9, anchor, fill: 'var(--ink-3)' });
        lastR = left + labW;
      });
      Tx(svg, px, yl + 15, mob ? `zoomed · box = one ${m.U}-byte ${unitName}` : `global memory (GPU RAM), byte addresses · zoomed to the warp's footprint · each box is one ${m.U}-byte ${unitName}`, { fs: 9.5, fill: 'var(--ink-2)' });
      Tx(svg, w - px, yl + 15, mob ? `${fI(m.end)} B shown` : `showing ${fI(m.end)} B`, { fs: 9.5, anchor: 'end', fill: 'var(--ink-3)' });
      /* fixed-scale overview: the first 16 KiB, the same for every stride */
      const oY = yl + 36, oH = 12, osc = iw / OV;
      Tx(svg, px, oY, mob ? 'fixed scale: 0 – 16 KiB' : 'the same memory at a fixed scale, 0 – 16 KiB, for every stride', { fs: 9.5, fill: 'var(--ink-2)' });
      const footB = m.addr[31] - m.addr[0] + 4;
      Tx(svg, w - px, oY, mob ? `footprint ${fI(footB)} B` : `warp footprint: ${fI(footB)} B`, { fs: 9.5, anchor: 'end', fill: 'var(--memory)', weight: 600 });
      R(svg, px, oY + 6, iw, oH, 'fill:var(--surface-2);stroke:var(--line);stroke-width:1', { rx: 2 });
      if (128 * osc >= 2.5) {
        const dd = [];
        for (let b = 1; b < OV / 128; b++) dd.push(`M${r2(px + b * 128 * osc)},${oY + 7}V${oY + 5 + oH}`);
        Pa(svg, dd.join(''), 'fill:none;stroke:rgba(11,12,18,.7);stroke-width:1');
      }
      m.list.forEach((un) => R(svg, px + un.u * m.U * osc, oY + 6.5, Math.max(1.2, m.U * osc - (m.U * osc > 3 ? 0.6 : 0)), oH - 1, 'fill:var(--memory)'));
      const zx2 = px + Math.min(OV, m.end) * osc;
      Pa(svg, `M${r2(px)},${oY + oH + 9}v-4H${r2(zx2)}v4`, 'fill:none;stroke:var(--ink-2);stroke-width:1.2');
      const zl = mob ? '↑ zoomed above' : '↑ the span the zoomed ruler shows';
      const zlW = tw(zl, 9);
      Tx(svg, clamp(zx2 + 6, px, w - px - zlW), oY + oH + 21, zl, { fs: 9, fill: 'var(--ink-3)' });
      /* time: one physical access after another, each = slow activation + short burst (schematic) */
      const tY = oY + oH + 44;
      Tx(svg, px, tY, mob ? 'physical accesses, in time → (schematic)' : 'physical accesses, one after another on the memory bus → (schematic: activation, then burst)', { fs: 9.5, fill: 'var(--ink-2)' });
      const maxBoxes = Math.max(32, m.P);
      const u3 = (iw - 44) / (maxBoxes * 3), bh = mob ? 11 : 13;
      const boxes = m.list.map((_, i) => {
        const x = px + i * 3 * u3;
        return { act: R(svg, x + 0.5, tY + 7, Math.max(0.6, 2 * u3 - 0.5), bh, 'fill:var(--surface-2)', { rx: 1.5 }), bur: R(svg, x + 2 * u3, tY + 7, Math.max(0.6, u3 - 1), bh, 'fill:var(--surface-2)', { rx: 1 }) };
      });
      Tx(svg, px + m.P * 3 * u3 + 4, tY + 7 + bh - 2, '= ' + m.P, { fs: 10.5, fill: 'var(--ink)', weight: 600 });
      Rf = { m, lanes, laneTx, lines, units, boxes };
      if (!anim || !anim.running) paint(m.P, 1);
      return tY + 7 + bh + 4;
    });
    function paint(k, prog) {
      if (!Rf) return;
      const { m, lanes, laneTx, lines, units, boxes } = Rf;
      m.list.forEach((un, i) => {
        const s = i < k ? 2 : i === k ? 1 : 0;
        const el = units[un.u];
        if (el && el._s !== s) {
          el._s = s;
          el.setAttribute('style', s === 1 ? 'fill:rgba(111,166,255,.5);stroke:var(--ink);stroke-width:1.6'
            : s === 2 ? 'fill:rgba(255,91,110,.2);stroke:var(--memory);stroke-width:1' : 'fill:rgba(255,91,110,.08);stroke:var(--memory);stroke-width:1;stroke-dasharray:3 2');
        }
        const b = boxes[i];
        if (b) {
          const bs = s === 1 ? (prog >= 2 / 3 ? 3 : 1) : s;
          if (b._s !== bs) {
            b._s = bs;
            b.act.setAttribute('style', bs === 0 ? 'fill:var(--surface-2)' : bs === 2 ? 'fill:var(--control);fill-opacity:.6' : 'fill:var(--control)');
            b.bur.setAttribute('style', bs === 0 || bs === 1 ? 'fill:var(--surface-2)' : bs === 3 ? 'fill:var(--ink)' : 'fill:var(--memory)');
          }
        }
        un.lanes.forEach((t) => {
          const ln = lines[t], lane = lanes[t];
          if (s === 1) { ln._s = 1; ln.el.setAttribute('style', `fill:none;stroke:var(--ink);stroke-width:1.8;stroke-dasharray:${r2(ln.L)} ${r2(ln.L + 4)};stroke-dashoffset:${r2(ln.L * (1 - prog))}`); }
          else if (ln._s !== s) { ln._s = s; ln.el.setAttribute('style', s === 2 ? 'fill:none;stroke:var(--core);stroke-width:1;opacity:.5' : 'fill:none;stroke:var(--ink-3);stroke-width:1;opacity:.3'); }
          const ls = s === 2 || (s === 1 && prog > 0.92) ? 2 : 0;
          if (lane._s !== ls) {
            lane._s = ls;
            lane.setAttribute('style', ls ? 'fill:var(--core);stroke:var(--core)' : 'fill:var(--surface-3);stroke:var(--line-2)');
            if (laneTx[t]) laneTx[t].setAttribute('style', 'pointer-events:none;fill:' + (ls ? '#0b0c12' : 'var(--ink-3)'));
          }
        });
      });
    }
    /* Plays once when first on screen and once after every change, then holds the final frame. */
    let btn = null;
    const label = () => { if (btn) btn.setLabel(anim && anim.running ? 'Pause' : 'Replay', anim && anim.running ? 'pause' : 'play'); };
    anim = GG.anim(f.stage, (time) => {
      if (!Rf) return;
      const P = Rf.m.P, k = Math.floor(time / DT);
      if (k >= P) { paint(P, 1); anim.stop(); label(); return; }
      paint(k, (time - k * DT) / DT);
    });
    GG.ui.seg(f.controls, { label: 'stride (floats)', options: [1, 2, 4, 8, 16, 32, 64, 128].map((v) => ({ value: v, label: String(v) })), value: 1, onChange: (v) => { st.s = v; update(); } });
    GG.ui.slider(f.controls, { label: 'start offset (floats)', min: 0, max: 31, step: 1, value: 0, onInput: (v) => { st.off = Math.round(v); update(); } });
    GG.ui.toggle(f.controls, { label: 'count 32-byte sectors', value: false, onChange: (v) => { st.sector = v; update(); } });
    btn = GG.ui.button(f.controls, {
      label: 'Replay', icon: 'play',
      onClick: () => {
        if (anim.running) { anim.stop(); if (Rf) paint(Rf.m.P, 1); }
        else { anim.reset(); if (Rf) paint(0, 0); anim.start(); }
        label();
      },
    });
    const sL = stat(f, 'logical accesses'), sP = stat(f, 'physical accesses'), sM = stat(f, 'bytes moved', 'memory'), sE = stat(f, 'useful', 'core');
    function update(first) {
      anim.reset();
      if (!first) anim.stop();
      view.redraw();
      if (!first && !GG.reducedMotion) { if (Rf) paint(0, 0); anim.start(); }
      label();
      const m = model();
      const moved = m.P * m.U, eff = 128 / moved;
      sL.set('32'); sP.set(String(m.P), m.P > (st.sector ? 4 : 1) ? 'danger' : 'core'); sM.set(fI(moved) + ' B'); sE.set(pct(eff, 1), effTone(eff));
      const span = m.addr[31] - m.addr[0] + 4;
      const unit = st.sector ? '32-byte sector' : '128-byte burst';
      let t = `<b>Stride ${st.s}${st.off ? `, offset ${st.off}` : ''}:</b> neighbouring threads are ${4 * st.s} bytes apart, so the warp's 32 floats spread over ${fI(span)} bytes and touch <b>${m.P} ${unit}${m.P > 1 ? 's' : ''}</b>. ${m.P} physical access${m.P > 1 ? 'es' : ''} move${m.P > 1 ? '' : 's'} ${fI(moved)} bytes to deliver the 128 the threads asked for: ${pct(eff, 1)} useful.`;
      if (!st.sector && m.P === 1) t += ' One physical access serves all 32 logical ones: perfectly coalesced.';
      else if (st.sector && m.P === 4 && st.s === 1) t += st.off ? ' Four sectors are still the minimum for 128 bytes, so this is still perfectly coalesced by the 32-byte rule, though the sectors now span two 128-byte cache lines.' : ' Four sectors are the 128 bytes of one cache line: still perfectly coalesced.';
      else if (!st.sector && st.s >= 32) t += ' Every thread now needs a burst of its own: 32 physical accesses for 32 logical ones, the worst case.';
      else if (st.sector && st.s >= 8) t += ' Every thread gets a sector to itself; the waste stops at 28 of every 32 bytes, so throughput is divided by 8.';
      if (st.off && st.s === 1 && !st.sector) t += ' The misaligned start makes perfectly consecutive floats straddle a burst boundary.';
      if (m.P > 1) t += ` In the time row, each of the ${m.P} accesses pays the slow activation again before its burst, so in this one-at-a-time schematic the warp waits about ${m.P}× as long as it would for one.`;
      f.setWhy(t);
    }
    update(true);
  }

  /* Fig: inside a DRAM access */
  function mcDram(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Inside one DRAM access', hint: 'step through, or play',
      caption: 'A simplified DRAM bank: a grid of cells (each a transistor and a tiny capacitor), a row decoder, and a row of sense amplifiers that doubles as the row buffer. Real rows hold thousands of bits. The chart shows why step 2 is slow: the charge in one tiny cell has to move a long access line far enough for the sense amplifier to read it. Step 5 lines the burst up with the 32 threads of a warp. Schematic, not to scale.',
    });
    const ROWS = 8, COLS = 16, RR = 5, CC = 8, BL = 8;
    const bits = (() => { const r = rng(99); return Array.from({ length: ROWS * COLS }, () => r() < 0.5); })();
    let step = 0, Rf = null, curveP = 0;
    const view = rsvg(f.stage, 'Schematic of a DRAM bank with a row decoder, a grid of cells, sense amplifiers and a data bus, next to a chart of access-line voltage over time.', (svg, w) => {
      const mob = w < 600;
      const decW = mob ? 48 : 58, ax = decW + 8;
      const pitch = mob ? Math.min(19, (w - ax - 4) / COLS) : Math.min(24, (w * 0.6 - ax) / COLS);
      const aW = pitch * COLS, ay = 44, aH = pitch * ROWS;
      const ref = { cells: [], buf: [], bitlines: null };
      const chip = G(svg);
      R(chip, ax, 6, mob ? 206 : 250, 26, 'fill:var(--control-a);stroke:var(--control);stroke-width:1', { rx: 6 });
      Tx(chip, ax + 10, 23, mob ? 'address → row 5 · col 8' : 'address → row 5 · column 8', { fs: mob ? 10.5 : 11.5, fill: 'var(--control)', weight: 600 });
      ref.chip = chip;
      R(svg, 0, ay, decW, aH, 'fill:var(--surface-2);stroke:var(--line-2)', { rx: 4 });
      Tx(svg, decW / 2, ay + aH / 2 - 3, 'row', { fs: mob ? 8.5 : 9.5, anchor: 'middle', fill: 'var(--ink-2)' });
      Tx(svg, decW / 2, ay + aH / 2 + 9, 'decoder', { fs: mob ? 8.5 : 9.5, anchor: 'middle', fill: 'var(--ink-2)' });
      ref.decRow = R(svg, 3, ay + RR * pitch + 2, decW - 6, pitch - 4, 'fill:var(--control)', { rx: 2 });
      const bl = [];
      for (let c = 0; c < COLS; c++) bl.push(`M${r2(ax + c * pitch + pitch / 2)},${ay}V${r2(ay + aH + 10)}`);
      ref.bitlines = Pa(svg, bl.join(''), 'fill:none;stroke:var(--line-2);stroke-width:1');
      ref.word = Ln(svg, ax - 4, ay + RR * pitch + pitch / 2, ax + aW + 2, ay + RR * pitch + pitch / 2, 'stroke:var(--control);stroke-width:2.5');
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const on = bits[r * COLS + c];
        ref.cells.push(R(svg, ax + c * pitch + 3, ay + r * pitch + 3, pitch - 6, pitch - 6, on ? 'fill:rgba(111,166,255,.75);stroke:var(--line-2)' : 'fill:var(--surface-3);stroke:var(--line-2)', { rx: 2 }));
      }
      const by = ay + aH + 10;
      R(svg, ax, by, aW, pitch, 'fill:var(--surface-2);stroke:var(--line-2)', { rx: 4 });
      for (let c = 0; c < COLS; c++) ref.buf.push(R(svg, ax + c * pitch + 3, by + 3, pitch - 6, pitch - 6, 'fill:var(--surface-3)', { rx: 2 }));
      Tx(svg, decW - 2, by + pitch / 2 - 1, mob ? 'sense' : 'sense amps', { fs: 9, anchor: 'end', fill: 'var(--ink-3)' });
      Tx(svg, decW - 2, by + pitch / 2 + 9, mob ? 'amps' : 'row buffer', { fs: 9, anchor: 'end', fill: 'var(--ink-3)' });
      const bx1 = ax + CC * pitch, bx2 = ax + (CC + BL) * pitch;
      const yb = by + pitch + 8;
      const burst = G(svg);
      Pa(burst, `M${r2(bx1 + 2)},${yb}v5H${r2(bx2 - 2)}v-5`, 'fill:none;stroke:var(--memory);stroke-width:1.5');
      const busY = yb + (mob ? 44 : 30);
      Pa(burst, `M${r2((bx1 + bx2) / 2)},${yb + 5}V${busY - 2}`, 'fill:none;stroke:var(--memory);stroke-width:2');
      head(burst, (bx1 + bx2) / 2, busY, Math.PI / 2, 7, 'var(--memory)');
      if (mob) {
        const bl8 = 'burst: 8 columns', bw8 = tw(bl8, 9.5);
        const bxm = clamp((bx1 + bx2) / 2 + 6, 0, w - bw8 - 1);
        R(burst, bxm - 2, yb + 10, bw8 + 4, 14, 'fill:var(--bg)', { rx: 3 });
        Tx(burst, bxm, yb + 21, bl8, { fs: 9.5, fill: 'var(--memory)' });
      } else Tx(burst, bx2 + 6, yb + 16, 'burst: 8 consecutive columns', { fs: 9.5, fill: 'var(--memory)' });
      ref.burst = burst;
      ref.bus = R(svg, ax, busY + 2, aW, 16, 'fill:var(--surface-2);stroke:var(--line-2)', { rx: 4 });
      ref.busTx = Tx(svg, ax + aW / 2, busY + 13.5, 'data bus → memory controller → SMs', { fs: 9, anchor: 'middle', fill: 'var(--ink-3)' });
      let H = busY + 22;
      const cx = mob ? 0 : ax + aW + 40, cy = mob ? H + 14 : ay, cw = mob ? w : w - (ax + aW + 40) - 4, chH = mob ? 116 : aH + pitch + 10;
      R(svg, cx, cy, cw, chH, 'fill:rgba(8,9,14,.5);stroke:var(--line)', { rx: 6 });
      Tx(svg, cx + 8, cy + 14, 'signal on the access line', { fs: 9.5, fill: 'var(--ink-2)' });
      Tx(svg, cx + cw - 8, cy + chH - 7, 'time →', { fs: 9.5, anchor: 'end', fill: 'var(--ink-3)' });
      const gx0 = cx + 10, gx1 = cx + cw - 12, gy0 = cy + chH - 18, gy1 = cy + 26;
      const vy = (v) => gy0 - v * (gy0 - gy1);
      const th = 0.78, k = 2.2;
      Ln(svg, gx0, vy(th), gx1, vy(th), 'stroke:var(--ink-3);stroke-width:1;stroke-dasharray:4 3');
      Tx(svg, gx0 + 2, vy(th) - 5, 'readable by the sense amp', { fs: 9, fill: 'var(--ink-3)' });
      const pts = [];
      for (let i = 0; i <= 60; i++) { const x = i / 60; pts.push(`${r2(gx0 + x * (gx1 - gx0))},${r2(vy(1 - Math.exp(-x * k)))}`); }
      ref.curve = Pa(svg, 'M' + pts.join('L'), 'fill:none;stroke:var(--control);stroke-width:2', { pathLength: '1' });
      const xc = -Math.log(1 - th) / k;
      ref.cross = G(svg);
      C(ref.cross, gx0 + xc * (gx1 - gx0), vy(th), 4, 'fill:var(--control)');
      Tx(ref.cross, gx0 + xc * (gx1 - gx0) - 6, vy(th) + 16, mob ? 'read!' : 'row can now be read', { fs: 9, anchor: 'end', fill: 'var(--control)' });
      Ln(svg, gx0, gy0, gx1, gy0, 'stroke:var(--line-2)');
      Ln(svg, gx0, gy0, gx0, gy1, 'stroke:var(--line-2)');
      if (mob) H = cy + chH + 2;
      /* step 5: the burst, in the glossary's 128-byte model, serving all 32 threads of a warp */
      const sy = Math.max(H, cy + chH + 2) + 16;
      const serve = G(svg);
      const sx0 = 0, sw = w - 1, slw = sw / 32;
      Tx(serve, sx0, sy, mob ? 'serve the warp: 128 B = 32 floats' : 'serve the warp: in the glossary\'s model one burst is 128 bytes, 32 four-byte floats, one per thread', { fs: 9.5, fill: 'var(--ink-2)' });
      const ly = sy + 10, lh = mob ? 13 : 16, gy = ly + lh + 16, gh = mob ? 12 : 14;
      ref.lanes = [];
      const dl = [];
      for (let t = 0; t < 32; t++) {
        const x = sx0 + t * slw;
        ref.lanes.push(R(serve, x + 1, ly, slw - 2, lh, 'fill:var(--surface-3);stroke:var(--line-2)', { rx: 2 }));
        if (slw >= 17) Tx(serve, x + slw / 2, ly + lh / 2 + 3.2, String(t), { fs: 9, anchor: 'middle', fill: 'var(--ink-3)', pe: false });
        dl.push(`M${r2(x + slw / 2)},${ly + lh + 2}V${gy - 2}`);
        R(serve, x + 0.5, gy, slw - 1, gh, 'fill:var(--memory)' + (t % 2 ? ';fill-opacity:.7' : ''), { rx: 1.5 });
      }
      ref.slines = Pa(serve, dl.join(''), 'fill:none;stroke:var(--core);stroke-width:1');
      Pa(serve, `M${r2(sx0 + 1)},${gy + gh + 4}v4H${r2(sx0 + sw - 1)}v-4`, 'fill:none;stroke:var(--memory);stroke-width:1.2');
      Tx(serve, sx0, gy + gh + 20, mob ? 'one physical access → 32 logical ones' : 'one burst on the data bus, 128 bytes: one physical access covers all 32 logical ones', { fs: 9.5, fill: 'var(--memory)' });
      if (!mob) Tx(serve, sx0 + sw, ly - 3, 'lanes 0–31', { fs: 9, anchor: 'end', fill: 'var(--ink-3)' });
      ref.serve = serve;
      Rf = ref;
      paint();
      return gy + gh + 26;
    });
    function paint() {
      if (!Rf) return;
      const s = step;
      Rf.decRow.setAttribute('opacity', '1');
      Rf.word.setAttribute('opacity', s >= 1 ? '1' : '0');
      Rf.bitlines.setAttribute('style', s === 1 ? 'fill:none;stroke:rgba(255,198,92,.55);stroke-width:1' : 'fill:none;stroke:var(--line-2);stroke-width:1');
      Rf.cells.forEach((el, i) => {
        const r = Math.floor(i / COLS), on = bits[i];
        const row = r === RR && s >= 1;
        el.setAttribute('style', (on ? 'fill:rgba(111,166,255,.75);' : 'fill:var(--surface-3);') + (row ? 'stroke:var(--control);stroke-width:1.5' : 'stroke:var(--line-2);stroke-width:1'));
      });
      Rf.buf.forEach((el, c) => {
        const on = bits[RR * COLS + c];
        const inB = c >= CC && c < CC + BL;
        let st = 'fill:var(--surface-3)';
        if (s >= 2) st = on ? 'fill:rgba(111,166,255,.8)' : 'fill:#2a2e44';
        if (s >= 3 && inB) st += ';stroke:var(--ink);stroke-width:1.5';
        el.setAttribute('style', st);
      });
      Rf.burst.setAttribute('opacity', s >= 3 ? '1' : '0');
      Rf.serve.setAttribute('opacity', s >= 4 ? '1' : '0.14');
      Rf.slines.setAttribute('opacity', s >= 4 ? '1' : '0');
      Rf.lanes.forEach((el) => el.setAttribute('style', s >= 4 ? 'fill:var(--core);stroke:var(--core)' : 'fill:var(--surface-3);stroke:var(--line-2)'));
      Rf.bus.setAttribute('style', s >= 3 ? 'fill:var(--memory-a);stroke:var(--memory)' : 'fill:var(--surface-2);stroke:var(--line-2)');
      Rf.busTx.setAttribute('style', 'fill:' + (s >= 3 ? 'var(--memory)' : 'var(--ink-3)'));
      const p = s === 0 ? 0 : s === 1 ? curveP : 1;
      Rf.curve.setAttribute('style', `fill:none;stroke:var(--control);stroke-width:2;stroke-dasharray:1 1;stroke-dashoffset:${r2(1 - p)}`);
      Rf.cross.setAttribute('opacity', p >= 0.69 ? '1' : '0');
    }
    const WHY = [
      '<b>1 · Address.</b> The memory controller splits the address into a row and a column, and the row decoder selects row 5. Nothing has been read yet.',
      '<b>2 · Activate: the slow part.</b> Row 5\'s word line switches on every cell in the row at once. Each cell\'s tiny capacitor has to charge up its long access line (a bit line) until the sense amplifier at the bottom can tell a 1 from a 0. How fast that goes is limited by thermal, power and size constraints, and it dominates DRAM latency.',
      '<b>3 · The row is in the row buffer.</b> Every sense amplifier now holds its column\'s bit: the whole row has been read in parallel, far more bits than one thread asked for.',
      '<b>4 · Burst.</b> Starting at column 8, a run of consecutive columns (8 here) is fetched from the row buffer in parallel, in a single clock, and streamed out as one burst. Once the slow activation is paid for, the neighbouring addresses come almost for free, which is why 32 threads reading neighbouring floats can share one access.',
      '<b>5 · Serve the warp.</b> In the glossary\'s model a burst carries 128 bytes, exactly one 4-byte float for each of the 32 threads of a warp. If the warp\'s 32 addresses are those 128 consecutive bytes, this single physical access serves all 32 logical ones: the load is coalesced. (How big one physical transfer really is on a given GPU is a finer point; see the note under Fig.&nbsp;4.)',
    ];
    const cAnim = GG.anim(f.stage, (t) => { curveP = Math.min(1, t / 1.3); paint(); if (curveP >= 1) cAnim.stop(); }, { autostart: false });
    GG.ui.stepper(f.controls, {
      label: 'step', steps: [{ label: 'Address' }, { label: 'Activate' }, { label: 'Row buffer' }, { label: 'Burst' }, { label: 'Serve the warp' }], autoplay: 3200,
      onStep: (i) => {
        step = i;
        f.setWhy(WHY[i]);
        if (i === 1 && !GG.reducedMotion) { curveP = 0; cAnim.reset(); cAnim.start(); } else { cAnim.stop(); curveP = 1; }
        paint();
      },
    });
    f.setWhy(WHY[0]);
  }

  /* Fig: CPU cache lines vs GPU bursts */
  function mcCpuGpu(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Cache lines in time, bursts in space', hint: 'change the stride',
      caption: 'CPU panel: one thread running <code>for (i = 0; i &lt; 32; i++) sum += a[i * s];</code>, one load per iteration, time running to the right. Its cache fetches a whole 64-byte line on a miss (typical for x86-64, Beyond the glossary), so later iterations can hit. GPU panel: one warp running <code>v = a[tid * s];</code>, all 32 loads at once, grouped into 128-byte bursts. Simplified: no CPU prefetcher, aligned data, one warp.',
    });
    const st = { s: 1 };
    legend(f.stage, [['var(--memory)', 'CPU: a miss, fetches a line · GPU: a load served by a burst'], ['rgba(111,166,255,.28)', 'CPU: already in the cache (hit)'], ['var(--ink-3)', 'one line / burst (bracket)', 'bar']]);
    function calc() {
      const s = st.s;
      const cpu = [], seen = new Set();
      for (let i = 0; i < 32; i++) { const L = Math.floor((4 * s * i) / 64); cpu.push({ L, miss: !seen.has(L) }); seen.add(L); }
      const gpu = [];
      for (let t = 0; t < 32; t++) gpu.push(Math.floor((4 * s * t) / 128));
      return { cpu, lines: seen.size, gpu, bursts: new Set(gpu).size };
    }
    const view = rsvg(f.stage, 'First, 32 loop iterations of a CPU thread marked hit or miss; second, the 32 threads of a GPU warp grouped into bursts.', (svg, w) => {
      const m = calc();
      const mob = w < 600;
      const gap = 28;
      const pw = mob ? w : (w - gap) / 2;
      const panels = [{ x: 0, y: 0, cpu: true }, { x: mob ? 0 : pw + gap, y: mob ? 104 : 0, cpu: false }];
      panels.forEach((P) => {
        const x0 = P.x, y0 = P.y;
        Tx(svg, x0, y0 + 12, P.cpu ? 'CPU · one thread, 32 iterations' : 'GPU · one warp, one instruction', { fs: 10.5, fill: P.cpu ? 'var(--host)' : 'var(--core)', weight: 600 });
        Tx(svg, x0 + pw, y0 + 12, P.cpu ? 'time →' : 'space →', { fs: 9.5, anchor: 'end', fill: 'var(--ink-3)' });
        const cw = pw / 32, cy = y0 + 22, chh = 20;
        for (let i = 0; i < 32; i++) {
          const x = x0 + i * cw;
          if (P.cpu) {
            const c = m.cpu[i];
            R(svg, x + 1, cy, cw - 2, chh, c.miss ? 'fill:var(--memory)' : 'fill:rgba(111,166,255,.28);stroke:rgba(111,166,255,.5)', { rx: 2 });
          } else {
            R(svg, x + 1, cy, cw - 2, chh, 'fill:var(--memory)', { rx: 2 });
            if (i > 0 && m.gpu[i] !== m.gpu[i - 1]) Ln(svg, x, cy - 3, x, cy + chh + 3, 'stroke:var(--ink);stroke-width:1.5');
          }
        }
        const key = P.cpu ? m.cpu.map((c) => c.L) : m.gpu;
        let i = 0;
        const by = cy + chh + 6;
        while (i < 32) {
          let e = i;
          while (e < 32 && key[e] === key[i]) e++;
          const xa = x0 + i * cw + 1.5, xb = x0 + e * cw - 1.5;
          Pa(svg, `M${r2(xa)},${by}v4H${r2(xb)}v-4`, 'fill:none;stroke:var(--ink-3)');
          i = e;
        }
        const n = P.cpu ? m.lines : m.bursts;
        Tx(svg, x0, by + 22, P.cpu ? `${n} cache ${plural(n, 'line')} fetched, ${32 - m.lines} ${plural(32 - m.lines, 'hit')}` : `${n} ${plural(n, 'burst')} for 32 loads`, { fs: 10.5, fill: 'var(--ink)' });
        Tx(svg, x0, by + 37, P.cpu ? 'grouping done by the cache, over time' : 'grouping done by the coalescer, at once', { fs: 9.5, fill: 'var(--ink-3)' });
      });
      return mob ? 104 + 22 + 20 + 6 + 42 : 22 + 20 + 6 + 42;
    });
    GG.ui.seg(f.controls, { label: 'stride s (floats)', options: [1, 2, 8, 16, 32].map((v) => ({ value: v, label: String(v) })), value: 1, onChange: (v) => { st.s = v; update(); } });
    const sL = stat(f, 'CPU lines fetched', 'host'), sH = stat(f, 'CPU cache hits', 'host'), sB = stat(f, 'GPU bursts', 'core');
    function update() {
      view.redraw();
      const m = calc();
      sL.set(String(m.lines)); sH.set(String(32 - m.lines)); sB.set(String(m.bursts));
      const per = Math.max(1, 16 / st.s);
      f.setWhy(`<b>Stride ${st.s}:</b> the CPU thread misses ${m.lines} ${plural(m.lines, 'time')}` + (m.lines < 32 ? `, and each miss brings in a 64-byte line that also holds ${per - 1 === 1 ? 'the element it needs next' : `the next ${per - 1} elements it needs`}` : ', because every element sits in a different line') + `. The GPU warp needs ${m.bursts} ${plural(m.bursts, 'burst')} for its 32 simultaneous loads. Same principle, grouping neighbouring bytes into one DRAM transfer; the CPU's cache does it for later iterations of one thread, the GPU's memory hardware does it for the 32 threads of one instruction.`);
    }
    update();
  }

  /* Fig: benchmark chart */
  function mcChart(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Tesla T4: throughput vs stride', hint: 'tap a point',
      caption: 'Blue: the glossary\'s measurements, in useful GB/s (bytes the threads asked for, per second). Dashed: what counting DRAM transfers predicts, if each warp request costs one transfer per burst (or sector) it touches, anchored at the stride-1 measurement. With the logarithmic axes a halving is always the same vertical step.',
    });
    const st = { ylog: true, model: 128, sel: 16 };
    legend(f.stage, [['var(--memory)', 'measured on a Tesla T4', 'line'], ['var(--ink-2)', 'burst-count model', 'dline'], ['var(--accent)', 'selected stride', 'dline']]);
    const modelGB = (s, U) => 206.0 / Math.min(s, U / 4);
    const view = rsvg(f.stage, 'Line chart of measured throughput in GB/s against stride from 1 to 128, with a dashed model line.', (svg, w) => {
      const mob = w < 560;
      const mL = mob ? 34 : 46, mR = mob ? 10 : 14, mT = 16, mB = 40;
      const H = mob ? 250 : 300;
      const pw = w - mL - mR, ph = H - mT - mB;
      const xs = (s) => mL + (Math.log2(s) / 7) * pw;
      const yMin = st.ylog ? 5 : 0, yMax = st.ylog ? 300 : 220;
      const ys = (v) => (st.ylog ? mT + ph * (1 - (Math.log(v) - Math.log(yMin)) / (Math.log(yMax) - Math.log(yMin))) : mT + ph * (1 - v / yMax));
      const yt = st.ylog ? [5, 10, 20, 50, 100, 200] : [0, 50, 100, 150, 200];
      yt.forEach((v) => { Ln(svg, mL, ys(v), w - mR, ys(v), 'stroke:var(--line);stroke-width:1'); Tx(svg, mL - 6, ys(v) + 3.5, String(v), { fs: 9.5, anchor: 'end', fill: 'var(--ink-3)' }); });
      T4.forEach(([s]) => { Ln(svg, xs(s), mT, xs(s), mT + ph, 'stroke:var(--line);stroke-width:1;opacity:.5'); Tx(svg, xs(s), mT + ph + 15, String(s), { fs: 10, anchor: 'middle', fill: s === st.sel ? 'var(--accent)' : 'var(--ink-2)' }); });
      Tx(svg, mL + pw / 2, H - 6, mob ? 'stride (floats)' : 'stride: floats between neighbouring threads', { fs: 9.5, anchor: 'middle', fill: 'var(--ink-3)' });
      Tx(svg, mL - 6, 9, 'GB/s', { fs: 9.5, anchor: 'end', fill: 'var(--ink-3)' });
      Ln(svg, xs(st.sel), mT, xs(st.sel), mT + ph, 'stroke:var(--accent);stroke-width:1.2;stroke-dasharray:3 3');
      if (st.model) {
        const pts = T4.map(([s]) => [xs(s), ys(modelGB(s, st.model))]);
        Pa(svg, 'M' + pts.map((p) => r2(p[0]) + ',' + r2(p[1])).join('L'), 'fill:none;stroke:var(--ink-2);stroke-width:1.5;stroke-dasharray:5 4');
        pts.forEach((p) => C(svg, p[0], p[1], 2.6, 'fill:var(--bg);stroke:var(--ink-2);stroke-width:1.2'));
      }
      Pa(svg, 'M' + T4.map(([s, v]) => r2(xs(s)) + ',' + r2(ys(v))).join('L'), 'fill:none;stroke:var(--memory);stroke-width:2.2');
      if (st.ylog && !mob) {
        Tx(svg, xs(2.5), ys(215), 'each doubling of the stride ≈ halves it', { fs: 9.5, fill: 'var(--ink-3)' });
        Tx(svg, xs(26), ys(24), 'then a gentler slope', { fs: 9.5, fill: 'var(--ink-3)' });
      }
      T4.forEach(([s, v]) => {
        const on = s === st.sel;
        C(svg, xs(s), ys(v), on ? 6.5 : 4.5, on ? 'fill:var(--memory);stroke:var(--ink);stroke-width:2' : 'fill:var(--memory);stroke:var(--bg);stroke-width:1.5');
        if (on || (!mob && (st.ylog || s <= 8))) {
          const lx = xs(s) + (s === 128 ? -8 : 8), ly = ys(v) - 9;
          if (on) R(svg, s === 128 ? lx - tw(v.toFixed(1), 9.5) - 3 : lx - 3, ly - 10, tw(v.toFixed(1), 9.5) + 6, 14, 'fill:#0e0f17', { rx: 3 });
          Tx(svg, lx, ly, v.toFixed(1), { fs: 9.5, anchor: s === 128 ? 'end' : 'start', fill: on ? 'var(--ink)' : 'var(--ink-2)', weight: on ? 600 : 400 });
        }
        C(svg, xs(s), ys(v), 16, 'fill:transparent;cursor:pointer').setAttribute('data-s', String(s));
      });
      return H;
    });
    view.svg.addEventListener('click', (e) => { const a = e.target && e.target.getAttribute && e.target.getAttribute('data-s'); if (a) { st.sel = +a; selCtl.set(st.sel); update(); } });
    GG.ui.seg(f.controls, { label: 'y axis', options: [{ value: 'log', label: 'log' }, { value: 'lin', label: 'linear' }], value: 'log', onChange: (v) => { st.ylog = v === 'log'; update(); } });
    GG.ui.seg(f.controls, { label: 'model', options: [{ value: 128, label: '128-byte bursts' }, { value: 64, label: '64-byte units' }, { value: 32, label: '32-byte sectors' }, { value: 0, label: 'off' }], value: 128, onChange: (v) => { st.model = v; update(); } });
    const selCtl = GG.ui.seg(f.controls, { label: 'inspect stride', options: T4.map(([s]) => ({ value: s, label: String(s) })), value: st.sel, onChange: (v) => { st.sel = v; update(); } });
    const sG = stat(f, 'measured', 'memory'), sD = stat(f, 'vs stride 1'), sP = stat(f, 'vs previous stride'), sM = stat(f, 'model predicts');
    function update() {
      view.redraw();
      const i = T4.findIndex((r) => r[0] === st.sel), [s, v] = T4[i];
      const drop = 206.0 / v, prev = i ? v / T4[i - 1][1] : null;
      sG.set(v.toFixed(1) + ' GB/s'); sD.set(s === 1 ? 'baseline' : drop.toFixed(drop < 10 ? 2 : 1) + '× lower'); sP.set(prev ? '×' + prev.toFixed(2) : '—');
      const U = st.model || 128, n = Math.min(32, Math.max(1, Math.ceil((s * 4 * 32) / U)));
      sM.set(st.model ? modelGB(s, st.model).toFixed(1) + ' GB/s' : '—');
      let t = `<b>Stride ${s}:</b> ${v.toFixed(1)} GB/s` + (s === 1 ? '' : `, ${drop.toFixed(1)}× below stride 1`) + (prev ? ` (×${prev.toFixed(2)} from stride ${T4[i - 1][0]})` : '') + '.';
      const uName = st.model === 128 ? 'burst' : st.model === 64 ? '64-byte unit' : 'sector';
      if (st.model) t += ` Counting ${st.model === 128 ? '128-byte bursts' : st.model === 64 ? '64-byte units' : '32-byte sectors'}, each warp request needs ${n} ${plural(n, uName)}, which predicts ${modelGB(s, st.model).toFixed(1)} GB/s; implied DRAM traffic ${(v * Math.min(s, st.model / 4)).toFixed(0)} GB/s${v * Math.min(s, st.model / 4) > 320 ? ', more than the T4\'s rated 320 GB/s, so this model cannot be right here' : ''}.`;
      if (s === 1) t += ' This is the fully coalesced baseline.';
      else if (s === 16) t += ' The glossary marks this as where the pattern changes: 16× down by the burst count, 12.3× as measured.';
      else if (s > 16) t += ' Past the knee each doubling costs only about 10–18%, presumably from other parts of the memory subsystem, such as on-device TLB misses.';
      f.setWhy(t);
    }
    update();
  }
  function mcTable(slot) {
    const rows = T4.map(([s, v], i) => {
      const prev = i ? '×' + (v / T4[i - 1][1]).toFixed(2) : '—';
      const drop = (206.0 / v).toFixed(2) + '×';
      const b = Math.min(s, 32);
      return `<tr><td class="num">${s}</td><td class="num">${v.toFixed(1)}</td><td class="num">${prev}</td><td class="num">${drop}</td><td class="num">${b}</td><td class="num">${(206.0 / b).toFixed(1)}</td></tr>`;
    }).join('');
    slot.outerHTML = GG.tableHTML(`<thead><tr><th class="num">stride</th><th class="num">GB/s</th><th class="num">vs previous</th><th class="num">below stride 1</th><th class="num">bursts per warp (128 B model)</th><th class="num">model GB/s</th></tr></thead><tbody>${rows}</tbody>`);
  }

  /* ═════════════════════════ BANK CONFLICT ═════════════════════════ */

  const BC_MAP = `Address:  0x00  0x04  0x08  0x0C  0x10  0x14  0x18  0x1C  ...  0x7C
Bank:       0     1     2     3     4     5     6     7   ...    31

Address:  0x80  0x84  0x88  0x8C  0x90  0x94  0x98  0x9C  ...  0xFC

Bank:       0     1     2     3     4     5     6     7   ...    31`;
  const BC_C1 = `__shared__ float data[1024];  // array in shared memory

// all 32 threads access consecutive elements of data
int tid = threadIdx.x;
float value = data[tid];  // address LSBs: 0x00, 0x04, 0x08, ...`;
  const BC_C2 = `float value = data[tid * 32];  // address LSBs: 0x000, 0x080, 0x100 ...
// recall: floats are 4 bytes wide`;

  GG.entry('bank-conflict', {
    render(body, ctx) {
      const s = ctx.html(body, `
<p>A bank conflict happens when several <a data-term="thread">threads</a> of one <a data-term="warp">warp</a> ask, at the same moment, for <em>different</em> addresses that live in the <em>same</em> bank of <a data-term="shared-memory">shared memory</a>. The hardware then has to serve those requests one after another instead of all at once. (Global memory has its own access rule, <a data-term="memory-coalescing">memory coalescing</a>.) The glossary's figure, redrawn here with the 32 banks of current GPUs, shows the two extremes.</p>
<div data-slot="f1"></div>
<p>When bank conflicts occur, the accesses by the distinct threads are serialised. That reduces memory throughput substantially, and by an integral factor: if the busiest bank must serve <i>n</i> distinct addresses, the request takes <i>n</i> passes and gets 1/<i>n</i> of the bandwidth, an <em><i>n</i>-way bank conflict</em>. It keeps a kernel from saturating shared memory's <a data-term="memory-bandwidth">memory bandwidth</a>.</p>
<h3>Why shared memory has banks</h3>
<p>Like other SRAM cache memories, the shared memory in a <a data-term="streaming-multiprocessor">Streaming Multiprocessor</a> is organised into groups called <em>banks</em>. (SRAM, static RAM, is the fast on-chip memory also used for registers and the <a data-term="l1-data-cache">L1 data cache</a>; shared memory is carved out of that same L1.) The banks can all be accessed simultaneously, which multiplies the bandwidth: a request that touches 32 different banks gets 32 words in one go.</p>
<p>In GPUs there are 32 banks, each bank is 4 bytes wide, and consecutive 32-bit words map to consecutive banks. The word is 32 bits, not 64, because GPUs were designed with 32-bit floats and integers in mind. The glossary's table of the mapping:</p>
<div data-slot="map"></div>
<p>So the bank of any address is <span class="pfd-kv">bank = (address ÷ 4) mod 32</span>, and addresses that differ by 32 × 4 = 128 bytes map to the same bank. Shared memories are roughly kilobyte scale (an H100 SM can devote up to 228 KB to it), so many addresses map onto each bank. Even the small array in the examples below, 1,024 floats in 4 KiB, puts 32 words in every bank. Hover any word in Fig.&nbsp;2 to find its bank.</p>
<div data-slot="f2"></div>
<h3>Consecutive elements: one transaction</h3>
<p>If we access sequential elements of an array in shared memory, each thread in our warp hits a different bank:</p>
<div data-slot="c1"></div>
<p>All 32 accesses complete in one memory transaction, because each thread hits a different bank. That is the conflict-free panel of Fig.&nbsp;1, the left side of the glossary's own figure.</p>
<h3>A column: 32 transactions</h3>
<p>Now say we want the threads to read a <em>column</em> of a row-major shared-memory array with 32 elements per row (row-major: each row stored contiguously, one after the other), so we write:</p>
<div data-slot="c2"></div>
<p>Every address is now a multiple of 128 bytes, so all the accesses hit the same bank, bank 0, and must be serialised, as in the 32-way panel of Fig.&nbsp;1 (the right side of the glossary's figure). The result is a 32× increase in latency, rising from on the order of ten cycles to on the order of hundreds.</p>
<div data-slot="nums"></div>
<p>The two examples are the ends of a family. For <code>data[tid * s]</code>, with <i>s</i> counted in 32-bit words, the 32 addresses land in 32 ÷ gcd(<i>s</i>, 32) distinct banks, gcd(<i>s</i>, 32) addresses per bank, so the conflict is gcd(<i>s</i>, 32)-way: every odd stride is conflict-free, stride 2 is 2-way, stride 32 is the full 32-way. Try it, and the special cases, in Fig.&nbsp;3.</p>
<div data-slot="f3"></div>
<h3>Fixing the column read</h3>
<p>We could solve this bank conflict by transposing our shared memory array: store it so that the column we want to read becomes a row. Fig.&nbsp;4 shows why that works, and what it costs. For more techniques to resolve bank conflicts, see the <a href="https://www.nvidia.com/en-us/on-demand/session/gtc24-s62191/"><i>Introduction to CUDA Programming and Performance Optimization</i> talk from GTC 2024</a>.</p>
<div data-slot="f4"></div>
${GG.noteHTML('beyond', `<p>Two other standard fixes keep <em>both</em> directions conflict-free. <b>Padding:</b> declare the tile one column wider, <code>__shared__ float tile[32][33]</code>. Each row then starts one bank later than the row above, so a column walks diagonally across all 32 banks, at the cost of 32 unused floats (3.1%). NVIDIA's <a href="https://developer.nvidia.com/blog/efficient-matrix-transpose-cuda-cc/">matrix transpose post</a> uses exactly this. <b>Swizzling:</b> keep the tile 32 wide but store element (r, c) at column c XOR r. Each row is permuted differently, so rows and columns both hit 32 distinct banks with no wasted space; libraries such as <a data-term="cutlass">CUTLASS</a> use swizzled shared-memory layouts for this reason.</p>`)}
<h3>Same address? Broadcast</h3>
<p>If threads access the same address in the same bank, that is the exact same data, a conflict need not occur: the data can be multicast or broadcast to every thread that asked. Conflicts are counted in <em>distinct addresses</em> per bank; threads that share an address ride along for free. The <code>data[0]</code>, <code>data[tid / 4]</code> and <code>data[(tid % 2) * 32]</code> patterns in Fig.&nbsp;3 show the difference.</p>
${GG.noteHTML('beyond', `<p>NVIDIA's current <a href="https://docs.nvidia.com/cuda/cuda-programming-guide/02-basics/writing-cuda-kernels.html">CUDA Programming Guide</a> (§2.3.4.2, Shared Memory Access Patterns) spells out the rule: "The two exceptions to this scenario happen when multiple threads in the same warp are accessing (either reading or writing) the same shared memory location. For read accesses, the word is broadcast to the requesting threads. For write accesses, each shared memory address is written by only one of the threads (which thread performs the write is undefined)." Older editions phrased the exception as any address within the same 32-bit word. The <a href="https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/index.html">Best Practices Guide</a> adds that "multiple broadcasts from different banks are coalesced into a single multicast", which is the <code>data[tid / 4]</code> case in Fig.&nbsp;3.</p>`)}
${GG.noteHTML('aside', `<p>The glossary's own diagram for this entry draws 16 banks and a "16-way bank conflict", which keeps it legible. The text, and every figure here, use the 32 banks of current NVIDIA GPUs. (The earliest CUDA GPUs, compute capability 1.x, really did have 16 banks and served a warp half at a time.)</p>`)}
<div data-slot="reading"></div>`);

      guard(() => bcDuel(ctx, s.f1));
      guard(() => mkCode(ctx, s.map, { lang: 'text', langLabel: 'address → bank', code: BC_MAP, lineNumbers: false, caption: 'as printed in the glossary' }));
      guard(() => bcMap(ctx, s.f2));
      guard(() => mkCode(ctx, s.c1, {
        lang: 'cuda', code: BC_C1, caption: 'row access: conflict-free',
        notes: {
          1: '<code>__shared__</code> places the array in the SM\'s <a data-term="shared-memory">shared memory</a>: 1,024 floats × 4 bytes = 4 KiB, visible to every thread of the block.',
          4: '<code>threadIdx.x</code> runs 0–31 across the first warp of the block, so <code>tid</code> is the lane number.',
          5: 'Thread <code>tid</code> reads byte <code>4 × tid</code>: bank <code>tid</code>. Thirty-two threads, thirty-two banks, one transaction. The comment lists only the address <em>LSBs</em>, its least significant (lowest) bits, because only those decide the bank: bits 0–1 pick a byte inside a 4-byte word, bits 2–6 pick one of the 32 banks, so bank = (address ÷ 4) mod 32. The higher bits only choose the row inside a bank.',
        },
      }));
      guard(() => mkCode(ctx, s.c2, {
        lang: 'cuda', code: BC_C2, caption: 'column access: 32-way conflict',
        notes: {
          1: 'Thread <code>tid</code> reads element <code>32 × tid</code>, byte <code>128 × tid</code>: always a multiple of 128, always bank 0. In binary 0x080 is 1000 0000: bits 2–6, the bank bits, are all zero, and the same holds for 0x100, 0x180 and every other multiple of 128. The largest index is 31 × 32 = 992, still inside <code>data[1024]</code>.',
          2: 'Which is why the stride in bytes is 32 × 4 = 128 = one full lap of the banks.',
        },
      }));
      guard(() => ctx.numbers(s.nums, [
        { value: '1', label: 'transaction for <code>data[tid]</code>', tone: 'memory' },
        { value: '32', label: 'transactions for <code>data[tid * 32]</code>', tone: 'danger' },
        { value: '~10', label: 'cycles: on the order of ten, conflict-free' },
        { value: '~100s', label: 'cycles: on the order of hundreds, 32-way', tone: 'danger' },
      ]));
      guard(() => bcExplore(ctx, s.f3));
      guard(() => bcTile(ctx, s.f4));
      ctx.reading(s.reading, [
        { href: 'https://www.nvidia.com/en-us/on-demand/session/gtc24-s62191/', label: 'Introduction to CUDA Programming and Performance Optimization (GTC 2024)', note: 'more techniques for resolving bank conflicts' },
        { href: 'https://developer.nvidia.com/blog/efficient-matrix-transpose-cuda-cc/', label: 'An Efficient Matrix Transpose in CUDA C/C++', note: 'the padded-tile fix in a real kernel (Beyond the glossary)' },
        { href: 'https://docs.nvidia.com/cuda/cuda-programming-guide/02-basics/writing-cuda-kernels.html', label: 'CUDA Programming Guide: Shared Memory Access Patterns (§2.3.4.2)', note: 'the same-location exception: broadcast on reads, one undefined writer on writes (Beyond the glossary)' },
        { href: 'https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/index.html', label: 'CUDA C++ Best Practices Guide', note: 'broadcasts from different banks coalesced into one multicast (Beyond the glossary)' },
      ]);
    },
  });

  function squiggle(x, y0, h, amp) {
    const pts = [];
    for (let y = 0; y <= h; y += 2) pts.push(`${r2(x + amp * Math.sin((y / h) * Math.PI * 3))},${r2(y0 + y)}`);
    return 'M' + pts.join('L');
  }

  /* Fig: conflict-free vs 32-way */
  function bcDuel(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Conflict-free vs 32-way bank conflict', hint: 'replay · step through the passes', wide: true,
      caption: 'Each squiggle is a thread requesting one 4-byte word; each box a shared-memory bank. Under the banks, the strip shows the 32 words the warp asked for, at their byte addresses. Conflict-free panel, <code>data[tid]</code>: 32 words, one in each bank, all served in one pass. 32-way panel, <code>data[tid * 32]</code>: 32 <em>different</em> words, 128 bytes apart, that all live in bank 0, so bank 0 serves one of them per pass. The bottom strip of each panel is time, measured in passes. The animation plays once when the figure comes into view.',
    });
    const PASS = 0.24;
    let k = 33, Rf = null;
    legend(f.stage, [['var(--control)', 'thread waiting (stalled)'], ['var(--ink)', 'being served this pass'], ['var(--core)', 'served'], ['var(--memory)', 'word in a bank'], ['var(--danger)', 'conflicted bank', 'outline']]);
    const view = rsvg(f.stage, 'Two panels of 32 threads and 32 banks. In the first, each thread goes to its own bank and its own word. In the second, all threads go to bank 0, each to a different word inside it.', (svg, w) => {
      const mob = w < 640;
      const gapP = 30;
      const pw = mob ? w : (w - gapP) / 2;
      const sqH = mob ? 22 : 30, ySq = 26;
      const yB = ySq + sqH + (mob ? 40 : 52), bH = mob ? 22 : 28;
      const yLab = yB + bH + 12;
      const yW = yLab + (mob ? 30 : 34), wH = mob ? 12 : 14;
      const yWl = yW + wH + 12;
      const yP = yWl + 22, pH = 9;
      const PH = yP + pH + 20;
      Rf = { p: [] };
      [false, true].forEach((conf, pi) => {
        const x0 = mob ? 0 : pi * (pw + gapP), y0 = mob ? pi * (PH + 10) : 0;
        const bw = pw / 32;
        const g = G(svg, { transform: `translate(${r2(x0)},${r2(y0)})` });
        Tx(g, 0, 12, conf ? '32-way conflict · data[tid * 32]' : 'conflict-free · data[tid]', { fs: 10.5, fill: conf ? 'var(--danger)' : 'var(--core)', weight: 600 });
        const P = { sq: [], ln: [], hd: [], bank: [], word: [], wl: [], slot: [], txt: null };
        const amp = Math.min(2.6, bw * 0.22);
        for (let t = 0; t < 32; t++) {
          const x = (t + 0.5) * bw;
          const tx = conf ? bw / 2 : x;
          const y1 = ySq + sqH + 3, y2 = yB - 2;
          const ang = Math.atan2(y2 - y1, tx - x);
          P.ln.push(Ln(g, x, y1, tx - Math.cos(ang) * 4, y2 - Math.sin(ang) * 4, 'stroke:var(--control);stroke-width:1'));
          P.hd.push(head(g, tx, y2, ang, 5, 'var(--control)'));
          P.sq.push(Pa(g, squiggle(x, ySq, sqH, amp), 'fill:none;stroke:var(--control);stroke-width:1.4;stroke-linecap:round'));
        }
        for (let b = 0; b < 32; b++) {
          P.bank.push(R(g, b * bw + 0.75, yB, bw - 1.5, bH, 'fill:var(--surface-2);stroke:var(--line-2)', { rx: 2 }));
          if (bw >= 15 || b % 4 === 0 || b === 31) Tx(g, (b + 0.5) * bw, yLab, String(b), { fs: 8.5, anchor: 'middle', fill: 'var(--ink-3)' });
        }
        /* the 32 requested words, slot t = thread t's word, joined to the bank that holds it */
        for (let t = 0; t < 32; t++) {
          const xs = (t + 0.5) * bw, xb = conf ? bw / 2 : xs;
          P.wl.push(Ln(g, xb, yLab + 4, xs, yW - 1, 'stroke:var(--memory);stroke-width:1;opacity:.4'));
          P.word.push(R(g, t * bw + 0.75, yW, bw - 1.5, wH, 'fill:var(--memory-a);stroke:var(--memory);stroke-width:1', { rx: 1.5 }));
        }
        [0, 8, 16, 24, 31].forEach((t) => {
          const lab = hex(t * (conf ? 128 : 4), conf ? 3 : 2);
          Tx(g, t === 0 ? 0 : t === 31 ? pw : (t + 0.5) * bw, yWl, lab, { fs: 8.5, anchor: t === 0 ? 'start' : t === 31 ? 'end' : 'middle', fill: 'var(--ink-3)' });
        });
        Tx(g, 0, yWl + 13, conf ? (mob ? '32 different words, all in bank 0' : 'the 32 words requested: all different, all in bank 0') : (mob ? '32 words, one in each bank' : 'the 32 words requested: one in each bank'), { fs: 9, fill: conf ? 'var(--danger)' : 'var(--ink-2)' });
        for (let i = 0; i < 32; i++) P.slot.push(R(g, i * bw + 0.5, yP, bw - 1, pH, 'fill:none;stroke:var(--line)', { rx: 1.5 }));
        P.txt = Tx(g, 0, yP + pH + 14, '', { fs: 10, fill: 'var(--ink-2)' });
        Rf.p.push(P);
      });
      paint();
      return mob ? 2 * PH + 10 : PH;
    });
    function paint() {
      if (!Rf) return;
      Rf.p.forEach((P, pi) => {
        const conf = pi === 1;
        for (let t = 0; t < 32; t++) {
          let s;
          if (!conf) s = k === 0 ? 0 : k === 1 ? 1 : 2;
          else s = k === 33 ? 2 : t < k - 1 ? 2 : t === k - 1 ? 1 : 0;
          const col = s === 0 ? 'var(--control)' : s === 1 ? 'var(--ink)' : 'var(--core)';
          P.sq[t].setAttribute('style', `fill:none;stroke:${col};stroke-width:${s === 1 ? 2 : 1.4};stroke-linecap:round`);
          P.ln[t].setAttribute('style', `stroke:${col};stroke-width:${s === 1 ? 1.6 : 1};opacity:${s === 2 ? 0.28 : s === 1 ? 1 : 0.6}`);
          P.hd[t].setAttribute('style', `fill:${col};stroke:none;opacity:${s === 2 ? 0.28 : 1}`);
          P.word[t].setAttribute('style', s === 1 ? 'fill:var(--ink);stroke:var(--ink);stroke-width:1' : s === 2 ? 'fill:var(--memory);stroke:var(--memory);stroke-width:1' : 'fill:var(--memory-a);stroke:var(--memory);stroke-width:1');
          P.wl[t].setAttribute('style', s === 1 ? 'stroke:var(--ink);stroke-width:1.5;opacity:1' : 'stroke:var(--memory);stroke-width:1;opacity:' + (s === 2 ? 0.25 : 0.45));
        }
        for (let b = 0; b < 32; b++) {
          let st = 'fill:var(--surface-2);stroke:var(--line-2)';
          const busy = conf ? b === 0 && k >= 1 && k <= 32 : k === 1;
          const used = conf ? b === 0 && k > 0 : k >= 1;
          if (busy) st = 'fill:var(--memory);stroke:var(--ink)';
          else if (used) st = 'fill:var(--memory-a);stroke:var(--memory)';
          if (conf && b === 0) st += ';stroke:var(--danger);stroke-width:2';
          P.bank[b].setAttribute('style', st);
        }
        const done = conf ? Math.min(k, 32) : Math.min(k, 1);
        P.slot.forEach((el, i) => {
          el.setAttribute('style', i < done ? (conf ? 'fill:var(--danger);stroke:none' : 'fill:var(--core);stroke:none') : 'fill:none;stroke:var(--line)');
        });
        P.txt.textContent = conf ? (k === 33 ? '32 passes: 32× the latency, 1/32 of the bandwidth' : k === 0 ? 'waiting' : `pass ${Math.min(k, 32)} of 32: word ${hex((k - 1) * 128, 3)}`) : (k === 0 ? 'waiting' : k === 1 ? 'pass 1: all 32 banks at once' : '1 pass, then idle: free for the next request');
      });
      const cDone = Math.min(k, 32), passes = Math.max(1, Math.min(k, 32));
      const cfDone = k >= 1 ? 32 : 0;
      sL.set(k === 0 ? '0' : '1'); sRt.set(String(k === 33 ? 32 : Math.min(k, 32)));
      sWd.set(`${cfDone} · ${cDone}`);
      sBw.set(k === 0 ? '—' : '1/' + Math.round(32 / (cDone / passes)), k === 0 ? '' : 'danger');
      const phase = k === 0 ? 0 : k === 33 ? 2 : 1;
      if (phase !== lastPhase) {
        lastPhase = phase;
        f.setWhy(phase === 0
          ? 'Both warps issue one load instruction. Conflict-free: 32 threads, 32 different banks. 32-way: 32 threads, 32 different addresses (0x000, 0x080, 0x100, …), all in bank 0.'
          : phase === 1 ? 'The conflict-free warp finishes in its first pass, with all 32 banks working at once. In the 32-way case the 32 words are different words that all sit in bank 0, and a bank can deliver one word per pass, so the threads queue up and are served one at a time while the other 31 banks sit idle.'
            : '<b>Done.</b> The conflict-free request took 1 pass; the conflicted one took 32. That is the glossary\'s 32× increase in latency, from on the order of ten cycles to on the order of hundreds, and 1/32 of the bandwidth. Had all 32 threads asked for the <em>same</em> word, bank 0 would have broadcast it in one pass (Fig.&nbsp;3, <code>data[0]</code>).');
      }
    }
    let lastPhase = -1;
    const sL = stat(f, 'passes, conflict-free', 'core'), sRt = stat(f, 'passes, 32-way', 'danger');
    const sWd = stat(f, 'words delivered (free · 32-way)'), sBw = stat(f, 'bandwidth, 32-way (words per pass ÷ 32)');
    let btn = null;
    const label = () => { if (btn) btn.setLabel(anim.running ? 'Pause' : 'Replay', anim.running ? 'pause' : 'play'); };
    /* Plays once when first on screen, then holds the final frame; Replay runs it again. */
    const anim = GG.anim(f.stage, (time) => {
      const nk = time >= 32 * PASS ? 33 : Math.floor(time / PASS) + 1;
      if (nk !== k) { k = nk; paint(); }
      if (nk === 33) { anim.stop(); label(); }
    });
    btn = GG.ui.button(f.controls, {
      label: 'Replay', icon: 'play',
      onClick: () => {
        if (anim.running) { anim.stop(); k = 33; paint(); }
        else { anim.reset(); k = 0; paint(); anim.start(); }
        label();
      },
    });
    GG.ui.button(f.controls, { label: 'step one pass', icon: 'next', onClick: () => { anim.stop(); label(); k = k >= 33 ? 1 : k + 1; paint(); } });
    GG.ui.button(f.controls, { label: 'reset', icon: 'reset', onClick: () => { anim.stop(); label(); k = 0; paint(); } });
    label();
    paint();
  }

  /* Fig: address → bank map */
  function bcMap(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Where each word of data[1024] lives', hint: 'hover or tap a word',
      caption: 'The 4 KiB array <code>__shared__ float data[1024]</code> as shared memory sees it: 32 columns, one per bank, and one row per 128 bytes. Colour encodes the bank. Every column is a bank, so any two addresses a multiple of 128 bytes apart sit in the same column.',
    });
    const st = { i: 32 };
    legend(f.stage, [['var(--memory)', 'colour = bank number (0–31)', 'hue'], ['var(--ink)', 'selected word', 'outline']]);
    let Rf = null;
    const view = rsvg(f.stage, 'A 32 by 32 grid of the 1,024 words of data, columns are banks and rows are 128-byte lines.', (svg, w) => {
      const mob = w < 600;
      const padL = mob ? 30 : 46, top = 18;
      const cw = (w - padL - 2) / 32, ch = mob ? 7 : 10;
      const cols = [];
      for (let b = 0; b < 32; b++) {
        const g = G(svg);
        cols.push(g);
        for (let r = 0; r < 32; r++) R(g, padL + b * cw + 0.5, top + r * ch + 0.5, cw - 1, ch - 1, 'fill:' + bankCol(b, 0.85), { 'data-i': r * 32 + b });
        if (cw >= 16 || b % 4 === 0 || b === 31) Tx(svg, padL + (b + 0.5) * cw, top - 6, String(b), { fs: 8.5, anchor: 'middle', fill: 'var(--ink-3)' });
      }
      Tx(svg, padL - 4, top - 6, 'bank', { fs: 8.5, anchor: 'end', fill: 'var(--ink-3)' });
      for (let r = 0; r < 32; r += mob ? 4 : 2) Tx(svg, padL - 4, top + r * ch + ch - 1.5, hex(r * 128, 3), { fs: mob ? 7.5 : 8.5, anchor: 'end', fill: 'var(--ink-3)' });
      const rowR = R(svg, 0, 0, 0, 0, 'fill:none;stroke:var(--ink-2);stroke-width:1;pointer-events:none;stroke-dasharray:3 2');
      const cell = R(svg, 0, 0, 0, 0, 'fill:none;stroke:var(--ink);stroke-width:2;pointer-events:none');
      Rf = { cols, rowR, cell, padL, top, cw, ch };
      paint();
      return top + 32 * ch + 4;
    });
    function paint() {
      if (!Rf) return;
      const b = st.i % 32, r = Math.floor(st.i / 32);
      Rf.cols.forEach((g, j) => g.setAttribute('opacity', j === b ? '1' : '0.3'));
      Rf.rowR.setAttribute('x', r2(Rf.padL - 1)); Rf.rowR.setAttribute('y', r2(Rf.top + r * Rf.ch - 0.5)); Rf.rowR.setAttribute('width', r2(32 * Rf.cw + 1)); Rf.rowR.setAttribute('height', r2(Rf.ch + 1));
      Rf.cell.setAttribute('x', r2(Rf.padL + b * Rf.cw - 0.5)); Rf.cell.setAttribute('y', r2(Rf.top + r * Rf.ch - 0.5)); Rf.cell.setAttribute('width', r2(Rf.cw + 1)); Rf.cell.setAttribute('height', r2(Rf.ch + 1));
      const a = st.i * 4;
      sI.set(`data[${st.i}]`); sA.set(hex(a, 3)); sBk.set(String(b)); sW.set(String(r));
      f.setWhy(`<b>data[${st.i}]</b> is at byte ${fI(a)} = ${hex(a, 3)}. (${fI(a)} ÷ 4) mod 32 = <b>bank ${b}</b>, and it is word ${r} of the 32 that bank holds for this array.` + (st.i >= 32 ? ` data[${st.i - 32}], exactly 128 bytes earlier, is in the same bank, directly above it.` : ` data[${st.i + 32}], exactly 128 bytes later, is in the same bank, directly below it.`));
    }
    const pick = (e) => { const a = e.target && e.target.getAttribute ? e.target.getAttribute('data-i') : null; if (a != null && +a !== st.i) { st.i = +a; sl.set(st.i); paint(); } };
    view.svg.addEventListener('pointermove', pick);
    view.svg.addEventListener('pointerdown', pick);
    const sl = GG.ui.slider(f.controls, { label: 'element index', min: 0, max: 1023, step: 1, value: st.i, onInput: (v) => { st.i = Math.round(v); paint(); } });
    const sI = stat(f, 'element'), sA = stat(f, 'address', 'memory'), sBk = stat(f, 'bank', 'accent'), sW = stat(f, 'word within bank');
    paint();
  }

  /* Fig: access-pattern explorer */
  const BC_PATS = [
    { id: 'lin', label: 'data[tid]', f: (t) => t },
    { id: 'col', label: 'data[tid * 32]', f: (t) => t * 32 },
    { id: 'str', label: 'data[tid * s]', f: (t, s) => t * s },
    { id: 'bc', label: 'data[0]', f: () => 0 },
    { id: 'mc', label: 'data[tid / 4]', f: (t) => Math.floor(t / 4) },
    { id: 'two', label: 'data[(tid % 2) * 32]', f: (t) => (t % 2) * 32 },
  ];
  function bankStats(words) {
    const per = Array.from({ length: 32 }, () => new Set());
    words.forEach((wd) => per[wd % 32].add(wd));
    const cnt = per.map((s) => s.size);
    const ways = Math.max(...cnt);
    const tpw = {};
    words.forEach((wd) => { tpw[wd] = (tpw[wd] || 0) + 1; });
    return { cnt, ways, distinct: Object.keys(tpw).length, share: Math.max(...Object.values(tpw)), banks: cnt.filter((c) => c > 0).length };
  }
  function bcExplore(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'A warp\'s request, bank by bank', hint: 'try each index expression', wide: true,
      caption: 'Top: the 32 threads of a warp, coloured by the bank they hit. Middle: the words of <code>data[1024]</code>, 32 banks across and 32 rows of 128 bytes down, with the requested words lit. Bottom: how many <em>distinct</em> words each bank must deliver. The tallest bar is the number of passes, the n in n-way.',
    });
    const st = { pat: 'lin', s: 3 };
    legend(f.stage, [['var(--memory)', 'colour = bank', 'hue'], ['var(--memory)', 'bank delivers 1 word: one pass'], ['var(--danger)', 'bank must deliver several words: conflict']]);
    const words = () => { const P = BC_PATS.find((p) => p.id === st.pat); const out = []; for (let t = 0; t < 32; t++) out.push(P.f(t, st.s)); return out; };
    const view = rsvg(f.stage, 'Thirty-two threads connected to the words they read in a 32 by 32 grid of shared-memory banks, with a histogram of distinct words per bank.', (svg, w) => {
      const W = words(), S = bankStats(W);
      const mob = w < 600;
      const padL = mob ? 2 : 40, iw = w - padL - 2;
      const cw = iw / 32;
      const yT = 14, tH = mob ? 12 : 16;
      const gy = yT + tH + (mob ? 44 : 62), ch = mob ? 5 : 6;
      for (let r = 0; r < 32; r++) for (let b = 0; b < 32; b++) R(svg, padL + b * cw + 0.5, gy + r * ch + 0.5, cw - 1, ch - 1, 'fill:' + bankCol(b, 0.1));
      if (!mob) { Tx(svg, padL - 5, gy + 6, '0x000', { fs: 8, anchor: 'end', fill: 'var(--ink-3)' }); Tx(svg, padL - 5, gy + 32 * ch, '0xF80', { fs: 8, anchor: 'end', fill: 'var(--ink-3)' }); Tx(svg, padL - 5, yT + tH - 3, 'tid', { fs: 8.5, anchor: 'end', fill: 'var(--ink-3)' }); }
      const req = new Set(W);
      for (let t = 0; t < 32; t++) {
        const wd = W[t], b = wd % 32, r = Math.floor(wd / 32);
        const x1 = padL + (t + 0.5) * cw, y1 = yT + tH, x2 = padL + (b + 0.5) * cw, y2 = gy + r * ch + ch / 2;
        Ln(svg, x1, y1, x2, y2, `stroke:${bankCol(b, 0.55)};stroke-width:1`);
      }
      req.forEach((wd) => { const b = wd % 32, r = Math.floor(wd / 32); R(svg, padL + b * cw, gy + r * ch, cw, ch, 'fill:' + bankCol(b, 1) + ';stroke:var(--ink);stroke-width:1'); });
      for (let t = 0; t < 32; t++) {
        const b = W[t] % 32;
        R(svg, padL + t * cw + 1, yT, cw - 2, tH, 'fill:' + bankCol(b, 0.95), { rx: 2 });
        if (cw >= 17) Tx(svg, padL + (t + 0.5) * cw, yT + tH / 2 + 3, String(t), { fs: 8.5, anchor: 'middle', fill: 'var(--bg)' });
        else if (t % 8 === 0 || t === 31) Tx(svg, padL + (t + 0.5) * cw, yT - 3, String(t), { fs: 8, anchor: 'middle', fill: 'var(--ink-3)' });
      }
      const hy = gy + 32 * ch + 18, hH = mob ? 48 : 64;
      const bh = Math.min(10, hH / Math.max(1, S.ways));
      for (let b = 0; b < 32; b++) {
        const c = S.cnt[b];
        const col = c > 1 ? 'var(--danger)' : 'var(--memory)';
        if (bh >= 4) for (let q = 0; q < c; q++) R(svg, padL + b * cw + 1, hy + hH - (q + 1) * bh + 0.5, cw - 2, bh - 1, 'fill:' + col, { rx: 1 });
        else if (c) R(svg, padL + b * cw + 1, hy + hH - c * bh, cw - 2, c * bh, 'fill:' + col);
        if (c > 1 && cw >= 9) Tx(svg, padL + (b + 0.5) * cw, hy + hH - c * bh - 3, String(c), { fs: 8, anchor: 'middle', fill: 'var(--danger)' });
      }
      Ln(svg, padL, hy + hH + 0.5, padL + iw, hy + hH + 0.5, 'stroke:var(--line-2)');
      Tx(svg, padL, hy + hH + 13, mob ? 'distinct words per bank' : 'distinct words each bank must deliver (banks 0–31, one block per word)', { fs: 9, fill: 'var(--ink-3)' });
      Tx(svg, padL + iw, hy + hH + 13, `${S.ways} ${plural(S.ways, 'pass', 'passes')}`, { fs: 10, anchor: 'end', fill: S.ways > 1 ? 'var(--danger)' : 'var(--memory)', weight: 600 });
      return hy + hH + 18;
    });
    const seg = GG.ui.seg(f.controls, { label: 'index expression', options: BC_PATS.map((p) => ({ value: p.id, label: p.label })), value: st.pat, onChange: (v) => { st.pat = v; update(); } });
    GG.ui.slider(f.controls, { label: 's, for data[tid * s]', min: 1, max: 33, step: 1, value: st.s, onInput: (v) => { st.s = Math.round(v); if (st.pat !== 'str') { st.pat = 'str'; seg.set('str'); } update(); } });
    const sD = stat(f, 'distinct addresses'), sSh = stat(f, 'threads per address'), sWy = stat(f, 'conflict'), sP = stat(f, 'passes'), sBw = stat(f, 'bandwidth');
    function update() {
      view.redraw();
      const W = words(), S = bankStats(W);
      sD.set(String(S.distinct)); sSh.set(S.share > 1 ? 'up to ' + S.share : '1');
      sWy.set(S.ways > 1 ? S.ways + '-way' : 'none', S.ways > 1 ? 'danger' : 'core');
      sP.set(String(S.ways), S.ways > 1 ? 'danger' : 'core'); sBw.set(S.ways > 1 ? `1/${S.ways}` : 'full');
      const T = {
        lin: '<b>data[tid]:</b> thread t reads word t, which is in bank t. 32 distinct words in 32 distinct banks: one pass, full bandwidth.',
        col: '<b>data[tid * 32]:</b> thread t reads word 32t, byte 128t. Every address is a whole number of 128-byte laps, so all 32 land in bank 0, 32 distinct words in one bank: a 32-way conflict, 32 passes.',
        bc: '<b>data[0]:</b> all 32 threads want the very same word. One bank, one address: the word is read once and broadcast to every thread. One pass, no conflict.',
        mc: '<b>data[tid / 4]:</b> integer division gives 8 distinct words, each wanted by 4 threads, in banks 0–7. Each bank has one distinct address, so the words are multicast: one pass, no conflict.',
        two: '<b>data[(tid % 2) * 32]:</b> only 2 distinct words, 0x000 and 0x080, but both are in bank 0. Sixteen threads share each word (that part is free), yet bank 0 still has to deliver two different words: a 2-way conflict. What counts is distinct addresses per bank.',
      };
      if (st.pat === 'str') {
        const g = gcd(st.s, 32);
        f.setWhy(`<b>data[tid * ${st.s}]:</b> gcd(${st.s}, 32) = ${g}, so the 32 addresses fall into ${32 / g} distinct ${plural(32 / g, 'bank')}, ${g} per bank: ` + (g === 1 ? `conflict-free, one pass.${st.s === 33 ? ' (A stride of 33 words is the padding trick of Fig. 4 in disguise.)' : st.s % 2 ? ' Every odd stride works this way.' : ''}` : `${aN(g)} ${g}-way conflict, ${g} passes, 1/${g} of the bandwidth.`));
      } else f.setWhy(T[st.pat]);
    }
    update();
  }

  /* Fig: fixing the column read */
  const LAYOUTS = {
    rm: { label: 'row-major', decl: '__shared__ float tile[32][32];', f: 'bank(r, c) = c', bank: (r, c) => c, word: (r, c) => 32 * r + c, col: 'tile[tid][c]', row: 'tile[r][tid]', bytes: 4096 },
    tr: { label: 'transposed', decl: '__shared__ float tileT[32][32];  // (r, c) stored at tileT[c][r]', f: 'bank(r, c) = r', bank: (r) => r, word: (r, c) => 32 * c + r, col: 'tileT[c][tid]', row: 'tileT[tid][r]', bytes: 4096 },
    pad: { label: 'padded', decl: '__shared__ float tile[32][33];  // one spare column', f: 'bank(r, c) = (33r + c) mod 32 = (r + c) mod 32', bank: (r, c) => (r * 33 + c) % 32, word: (r, c) => 33 * r + c, col: 'tile[tid][c]', row: 'tile[r][tid]', bytes: 4224 },
    sw: { label: 'swizzled', decl: '__shared__ float tile[32][32];  // (r, c) stored at tile[r][c ^ r]', f: 'bank(r, c) = c XOR r', bank: (r, c) => c ^ r, word: (r, c) => 32 * r + (c ^ r), col: 'tile[tid][c ^ tid]', row: 'tile[r][tid ^ r]', bytes: 4096 },
  };
  function bcTile(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Reading a 32 × 32 tile by rows and by columns', hint: 'change the layout · read a column',
      caption: '"Logical" draws the 32 × 32 tile of floats as the program sees it, row r down and column c across, each element coloured by the bank it is stored in. "As stored" draws shared memory itself: 32 bank columns, one row per 128 bytes, with every element at the word where the layout puts it (the padded layout\'s spare words hatched). The outlined cells are what one warp reads (thread <code>tid</code> takes row or column position <code>tid</code>). The bars count distinct words per bank for that read. Transposed, padded and swizzled are three ways to store the same tile.',
    });
    const st = { lay: 'rm', dir: 'col', k: 0, view: 'logical' };
    const codeEl = GG.el('div', { class: 'pfd-codeline' });
    f.stage.appendChild(codeEl);
    const view = rsvg(f.stage, 'A 32 by 32 tile coloured by bank, with the elements read by one warp outlined, and a histogram of words per bank.', (svg, w) => {
      const L = LAYOUTS[st.lay];
      const mob = w < 640;
      const cell = mob ? Math.floor((w - 20) / 32 * 10) / 10 : Math.min(13, (w * 0.55 - 20) / 32);
      const stored = st.view === 'stored';
      const nRows = stored && st.lay === 'pad' ? 33 : 32;
      const tx = 18, ty = 16, T = cell * nRows;
      Tx(svg, tx, 10, stored ? 'bank 0 → 31 (one column per bank)' : 'column c →', { fs: 9, fill: 'var(--ink-3)' });
      Tx(svg, 0, ty + 8, stored ? 'row' : 'r', { fs: 9, fill: 'var(--ink-3)' });
      Tx(svg, 0, ty + 20, '↓', { fs: 9, fill: 'var(--ink-3)' });
      const cnt = new Array(32).fill(0);
      const sel = [];
      const pos = (r, c) => { if (!stored) return [r, c]; const wd = L.word(r, c); return [Math.floor(wd / 32), wd % 32]; };
      if (stored && st.lay === 'pad') {
        const hid = GG.uid('pfd-spare');
        const pat = GG.svg('pattern', { id: hid, width: 4, height: 4, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, GG.svg('defs', null, svg));
        R(pat, 0, 0, 1.6, 4, 'fill:var(--ink-3)');
        for (let r = 0; r < 32; r++) { const wd = 33 * r + 32; R(svg, tx + (wd % 32) * cell + 0.4, ty + Math.floor(wd / 32) * cell + 0.4, cell - 0.8, cell - 0.8, `fill:url(#${hid});stroke:var(--line-2);stroke-width:.5`); }
      }
      for (let r = 0; r < 32; r++) for (let c = 0; c < 32; c++) {
        const b = L.bank(r, c);
        const on = st.dir === 'col' ? c === st.k : r === st.k;
        const [pr, pc] = pos(r, c);
        R(svg, tx + pc * cell + 0.4, ty + pr * cell + 0.4, cell - 0.8, cell - 0.8, 'fill:' + bankCol(b, on ? 1 : 0.42));
        if (on) { sel.push([pr, pc]); cnt[b]++; }
      }
      sel.forEach(([r, c]) => R(svg, tx + c * cell, ty + r * cell, cell, cell, 'fill:none;stroke:var(--ink);stroke-width:1.2'));
      const ways0 = Math.max(...cnt), hCap = mob ? 48 : 110;
      const hx = mob ? 0 : tx + cell * 32 + 28, hy = mob ? ty + T + 26 : ty, hw = mob ? w : w - hx - 2, hH = Math.max(24, Math.min(hCap, ways0 * 10));
      const bw = hw / 32;
      Tx(svg, hx, hy + 2, 'distinct words per bank, one block per word', { fs: 9.5, fill: 'var(--ink-2)' });
      const ways = Math.max(...cnt);
      const ubh = Math.min(10, hH / Math.max(1, ways));
      for (let b = 0; b < 32; b++) {
        const col = cnt[b] > 1 ? 'var(--danger)' : 'var(--memory)';
        if (ubh >= 4) for (let q = 0; q < cnt[b]; q++) R(svg, hx + b * bw + 1, hy + 12 + hH - (q + 1) * ubh + 0.5, bw - 2, ubh - 1, 'fill:' + col, { rx: 1 });
        else if (cnt[b]) R(svg, hx + b * bw + 1, hy + 12 + hH - cnt[b] * ubh, bw - 2, cnt[b] * ubh, 'fill:' + col);
      }
      Ln(svg, hx, hy + 12 + hH + 0.5, hx + hw, hy + 12 + hH + 0.5, 'stroke:var(--line-2)');
      Tx(svg, hx, hy + hH + 25, 'bank 0', { fs: 8.5, fill: 'var(--ink-3)' });
      Tx(svg, hx + hw, hy + hH + 25, '31', { fs: 8.5, anchor: 'end', fill: 'var(--ink-3)' });
      Tx(svg, hx, hy + hH + 46, ways > 1 ? `${ways}-way conflict: ${ways} passes` : 'conflict-free: 1 pass', { fs: 12, fill: ways > 1 ? 'var(--danger)' : 'var(--core)', weight: 600 });
      Tx(svg, hx, hy + hH + 64, L.f, { fs: 10, fill: 'var(--ink)' });
      Tx(svg, hx, hy + hH + 80, `storage: ${fI(L.bytes)} bytes` + (L.bytes > 4096 ? ` (+${pct((L.bytes - 4096) / 4096, 1)})` : ''), { fs: 10, fill: 'var(--ink-2)' });
      return mob ? hy + hH + 86 : Math.max(ty + T + 4, hy + hH + 86);
    });
    GG.ui.seg(f.controls, { label: 'layout', options: Object.keys(LAYOUTS).map((k) => ({ value: k, label: LAYOUTS[k].label })), value: st.lay, onChange: (v) => { st.lay = v; update(); } });
    GG.ui.seg(f.controls, { label: 'the warp reads', options: [{ value: 'col', label: 'a column' }, { value: 'row', label: 'a row' }], value: st.dir, onChange: (v) => { st.dir = v; update(); } });
    GG.ui.seg(f.controls, { label: 'draw the tile', options: [{ value: 'logical', label: 'logical' }, { value: 'stored', label: 'as stored' }], value: st.view, onChange: (v) => { st.view = v; update(); } });
    const kS = GG.ui.slider(f.controls, { label: 'which one', min: 0, max: 31, step: 1, value: 0, onInput: (v) => { st.k = Math.round(v); update(); } });
    void kS;
    const sW = stat(f, 'conflict'), sP = stat(f, 'passes'), sM = stat(f, 'storage');
    function update() {
      view.redraw();
      const L = LAYOUTS[st.lay];
      const cnt = new Array(32).fill(0);
      for (let i = 0; i < 32; i++) cnt[st.dir === 'col' ? L.bank(i, st.k) : L.bank(st.k, i)]++;
      const ways = Math.max(...cnt);
      sW.set(ways > 1 ? ways + '-way' : 'none', ways > 1 ? 'danger' : 'core'); sP.set(String(ways), ways > 1 ? 'danger' : 'core');
      sM.set(fI(L.bytes) + ' B' + (L.bytes > 4096 ? ' (+3.1%)' : ''));
      const acc = (st.dir === 'col' ? L.col.replace(/\bc\b/g, String(st.k)) : L.row.replace(/\br\b/g, String(st.k)));
      const [dcl, dcm] = L.decl.split('//');
      codeEl.innerHTML = (dcm ? `<span class="c">//${GG.esc(dcm)}</span>\n` : '') + `<span class="k">${GG.esc(dcl.trimEnd())}</span>\nfloat v = ${GG.esc(acc)};<span class="c">  // ${st.dir === 'col' ? 'column c = ' : 'row r = '}${st.k}</span>`;
      const c = st.k, r = st.k;
      const T = {
        'rm-col': `<b>Row-major, column ${c}:</b> element (r, ${c}) is word 32r + ${c}, so every element of the column is in bank ${c}. Thirty-two distinct words, one bank: a 32-way conflict. This is the glossary's <code>data[tid * 32]</code> case.`,
        'rm-row': `<b>Row-major, row ${r}:</b> 32 consecutive words, one per bank: conflict-free, the <code>data[tid]</code> case.`,
        'tr-col': `<b>Transposed, column ${c}:</b> the column you want is stored as a row, <code>tileT[${c}][0…31]</code>, 32 consecutive words in 32 banks: conflict-free. This is the glossary's fix.`,
        'tr-row': `<b>Transposed, row ${r}:</b> now it is the original rows that sit in a single bank (bank ${r}): 32-way conflict. Transposing moves the conflict to the other direction, so transpose for the direction you read most.`,
        'pad-col': `<b>Padded, column ${c}:</b> each row starts one bank later than the row above (33 ≡ 1 mod 32), so element (r, ${c}) is in bank (r + ${c}) mod 32 and the column walks diagonally across all 32 banks: conflict-free, for 32 spare floats.`,
        'pad-row': `<b>Padded, row ${r}:</b> a row is still 32 consecutive words: conflict-free. Padding fixes columns without breaking rows.`,
        'sw-col': `<b>Swizzled, column ${c}:</b> element (r, ${c}) is stored in bank ${c} XOR r, which is different for each of the 32 rows: conflict-free, with no wasted space.`,
        'sw-row': `<b>Swizzled, row ${r}:</b> c XOR ${r} runs through all 32 banks as c goes from 0 to 31: conflict-free in this direction too.`,
      };
      const SV = { rm: 'As stored, the tile looks exactly like its logical picture.', tr: 'As stored, logical column c has become physical row c.', pad: 'As stored, each logical row takes 33 words, so it starts one bank to the right of the row above; the hatched cells are the 32 spare words.', sw: 'As stored, each row\'s elements are shuffled among the 32 banks by c XOR r.' };
      f.setWhy(T[st.lay + '-' + st.dir] + (st.view === 'stored' ? ` ${SV[st.lay]} Count the outlined words in each bank column: the most in any one column is the number of passes.` : ''));
    }
    update();
  }

  /* ═════════════════════════ REGISTER PRESSURE ═════════════════════════ */

  const PROG = [
    { ptx: 'ld.global.f32  %f1, [%rd1];', sh: 'ld  f1 ← x0', d: 1, u: [] },
    { ptx: 'ld.global.f32  %f2, [%rd2];', sh: 'ld  f2 ← y0', d: 2, u: [] },
    { ptx: 'ld.global.f32  %f3, [%rd1+4];', sh: 'ld  f3 ← x1', d: 3, u: [] },
    { ptx: 'ld.global.f32  %f4, [%rd2+4];', sh: 'ld  f4 ← y1', d: 4, u: [] },
    { ptx: 'mul.f32        %f5, %f1, %f2;', sh: 'mul f5←f1,f2', d: 5, u: [1, 2] },
    { ptx: 'ld.global.f32  %f6, [%rd1+8];', sh: 'ld  f6 ← x2', d: 6, u: [] },
    { ptx: 'ld.global.f32  %f7, [%rd2+8];', sh: 'ld  f7 ← y2', d: 7, u: [] },
    { ptx: 'fma.rn.f32     %f8, %f3, %f4, %f5;', sh: 'fma f8←f3,f4,f5', d: 8, u: [3, 4, 5] },
    { ptx: 'ld.global.f32  %f9, [%rd1+12];', sh: 'ld  f9 ← x3', d: 9, u: [] },
    { ptx: 'ld.global.f32  %f10, [%rd2+12];', sh: 'ld f10 ← y3', d: 10, u: [] },
    { ptx: 'fma.rn.f32     %f11, %f6, %f7, %f8;', sh: 'fma f11←f6,7,8', d: 11, u: [6, 7, 8] },
    { ptx: 'fma.rn.f32     %f12, %f9, %f10, %f11;', sh: 'fma f12←f9,10,11', d: 12, u: [9, 10, 11] },
    { ptx: 'st.global.f32  [%rd3], %f12;', sh: 'st  out ← f12', d: 0, u: [12] },
  ];
  /* Belady-style allocation of a straight-line program onto `cap` registers. */
  function allocate(cap) {
    const N = PROG.length, V = 12;
    const def = {}, uses = {};
    PROG.forEach((ins, k) => { if (ins.d) def[ins.d] = k; ins.u.forEach((v) => (uses[v] = uses[v] || []).push(k)); });
    const last = {};
    for (let v = 1; v <= V; v++) last[v] = Math.max(...(uses[v] || [def[v]]));
    const nextUse = (v, k) => { for (const x of uses[v] || []) if (x > k) return x; return Infinity; };
    const reg = new Map(), free = [];
    for (let i = 0; i < cap; i++) free.push(i);
    const mem = new Set();
    let stores = 0, loads = 0;
    const spilled = new Set();
    const rows = [];
    for (let k = 0; k < N; k++) {
      const ins = PROG[k], ev = {}, readReg = {};
      const take = (avoid) => {
        if (free.length) { free.sort((a, b) => a - b); return free.shift(); }
        let best = -1, bnu = -1;
        for (const [v] of reg) { if (avoid.has(v)) continue; const nu = nextUse(v, k); if (nu > bnu) { bnu = nu; best = v; } }
        const id = reg.get(best);
        reg.delete(best);
        if (!mem.has(best)) { mem.add(best); stores++; ev[best] = (ev[best] || '') + 'S'; spilled.add(best); }
        return id;
      };
      const pin = new Set(ins.u);
      for (const v of ins.u) if (!reg.has(v)) { reg.set(v, take(pin)); loads++; ev[v] = (ev[v] || '') + 'L'; }
      for (const v of ins.u) readReg[v] = reg.get(v);
      for (const v of ins.u) if (last[v] === k) { free.push(reg.get(v)); reg.delete(v); mem.delete(v); }
      if (ins.d) reg.set(ins.d, take(new Set()));
      const cells = {};
      for (let v = 1; v <= V; v++) {
        if (def[v] > k || last[v] < k) continue;
        if (def[v] === k) cells[v] = { s: 'reg', id: reg.has(v) ? reg.get(v) : -1, def: true, ev: ev[v] || '' };
        else if (v in readReg) cells[v] = { s: 'reg', id: readReg[v], use: last[v] === k, ev: ev[v] || '' };
        else if (reg.has(v)) cells[v] = { s: 'reg', id: reg.get(v), ev: ev[v] || '' };
        else cells[v] = { s: 'mem', ev: ev[v] || '' };
      }
      rows.push(cells);
    }
    const press = PROG.map((_, k) => {
      let li = 0, lo = 0;
      for (let v = 1; v <= V; v++) { if (def[v] < k && last[v] >= k) li++; if (def[v] <= k && last[v] > k) lo++; }
      return Math.max(li, lo);
    });
    return { rows, stores, loads, press, peak: Math.max(...press), spilled: [...spilled].sort((a, b) => a - b) };
  }

  GG.entry('register-pressure', {
    render(body, ctx) {
      const s = ctx.html(body, `
<p>In other words, the <a data-term="register-file">register file</a> has become the <a data-term="performance-bottleneck">bottleneck</a>: a kernel wants more of the fastest, per-thread storage than the hardware can hand out without giving something else up.</p>
${GG.noteHTML('intuition', '<p>Think of the register file as a workbench shared by everyone in a workshop. Each worker (a thread) gets a patch of bench for the parts they are handling right now. The bench is a fixed size: give every worker a bigger patch and fewer workers fit around it. Anything that does not fit on your patch goes on a shelf across the room, and every trip to the shelf costs time.</p>')}
<h3>Unlimited on paper, finite in silicon</h3>
<p><a data-term="registers">Registers</a> in the <a data-term="parallel-thread-execution">Parallel Thread eXecution (PTX)</a> language are virtual and unlimited: a PTX program may name as many as it likes, and compilers that generate PTX tend to give nearly every new value a fresh one. The register files of the <a data-term="streaming-multiprocessor">Streaming Multiprocessor (SM)</a> are physical, and so limited: 65,536 32-bit registers per SM on an H100, 256 KiB split into four slices of 16,384, one per SM sub-partition.</p>
<p>The translation from one to the other happens when <code>ptxas</code>, the PTX assembler that <a data-term="nvcc">nvcc</a> runs as one of its compilation steps, compiles PTX into <a data-term="streaming-assembler">Streaming ASSembler (SASS)</a>, and the SASS code for a <a data-term="kernel">kernel</a> determines how much of the register file each <a data-term="thread">thread</a> consumes. What sets the count is the largest number of values that are <em>live</em> at the same moment (created, and still waiting to be used). The total number of values the program creates matters much less, because <code>ptxas</code> can reuse a physical register as soon as the value in it is dead. If the live values outnumber the registers it may use, some must spill to memory. Fig.&nbsp;1 plays this out on a tiny program.</p>
<div data-slot="f1"></div>
<p>The <a data-term="registers">Registers</a> entry describes where spilled values go: out of the register file to <a data-term="global-memory">global memory</a> in the <a data-term="gpu-ram">GPU RAM</a>, at a substantial performance penalty. CUDA calls this spill space <em>local memory</em>. It is private to each thread, but despite the name it lives off-chip, in the same DRAM as global memory.</p>
${GG.noteHTML('beyond', `<p><b>Seeing and steering it.</b> Compiling with <code>nvcc -Xptxas -v</code> (<a data-term="nvcc">nvcc</a> passing the <code>-v</code>, verbose, flag on to <code>ptxas</code>) prints each kernel's registers per thread and any spill stores and loads, in bytes. You can cap the count with <code>-maxrregcount=N</code> or the <code>__launch_bounds__</code> qualifier, trading spills for more resident threads. NVIDIA's Best Practices Guide puts it plainly: local memory "is so named because its scope is local to the thread, not because of its physical location. In fact, local memory is off-chip."</p>`)}
<h3>From registers per thread to blocks per SM</h3>
<p>All threads in a <a data-term="thread-block">thread block</a> are scheduled onto the same SM, so the register space a block needs is set by the SASS code and by the kernel's launch configuration together: registers per thread × threads per block. As the space allocated per block grows, fewer thread blocks fit on an SM at once. That reduces <a data-term="occupancy">occupancy</a>, leaves the <a data-term="warp-scheduler">warp schedulers</a> fewer warps to switch between, and makes it more difficult to <a data-term="latency-hiding">hide latency</a>. Fig.&nbsp;2 is a calculator for exactly this.</p>
<div data-slot="f2"></div>
<p>The last link in the chain is latency. Each of the SM's four <a data-term="warp-scheduler">warp schedulers</a> can issue one instruction per cycle, from any of its resident warps that is ready. While one warp waits for a slow load, another can issue, so the more warps a scheduler holds, the more of its cycles do useful work (<a data-term="issue-efficiency">issue efficiency</a>). Fig.&nbsp;3 takes the warps per SM from Fig.&nbsp;2, divides them among the four schedulers, and runs one scheduler for 32 cycles.</p>
<div data-slot="lat"></div>
${GG.noteHTML('beyond', `<p><b>How the hardware really hands out registers.</b> Three details sit under the simple division. (1) Registers are allocated per <a data-term="warp">warp</a> and "rounded up to the nearest 256 registers per warp", so a per-thread count effectively rounds up to a multiple of 8 (NVIDIA, CUDA C++ Best Practices Guide). (2) Each warp lives on one of the SM's four sub-partitions and takes its registers from that sub-partition's 16,384-register slice, so warps are counted slice by slice: 4 × ⌊16,384 ÷ registers per warp⌋. (3) <code>ptxas</code> never gives a thread more than 255 registers; any values beyond that spill to local memory at compile time. A block may use at most 65,536 registers in total: a block whose threads together need more, or whose warps cannot be spread over the four slices, fails to launch with "too many resources requested for launch". Fig.&nbsp;2's "hardware allocation rules" switch applies (1) and (2).</p>`)}
${GG.noteHTML('check', `<p>The Best Practices Guide's own example (compute capability 7.0, which has the same 65,536 registers, 64 warps and 32 blocks per SM as the H100): a kernel with 37 registers per thread reaches 75% occupancy with 128-thread blocks (12 blocks per SM) but only 63% with 320-thread blocks (4 blocks). Plain division would say 65,536 ÷ (37 × 320) = 5.5, so 5 blocks and 78%. With the allocation rules, 37 rounds up to 40 registers, 1,280 per warp; each 16,384-register slice holds 12 such warps, 48 per SM, and 48 warps make 12 blocks of 4 warps (75%) or 4 blocks of 10 warps (62.5%). Load both examples in Fig.&nbsp;2 with the buttons.</p>`)}
<h3>Hardware that takes load off the registers</h3>
<p>Recent <a data-term="streaming-multiprocessor-architecture">SM architectures</a> added hardware that relieves the register file, and <a href="https://semianalysis.com/2025/06/23/nvidia-tensor-core-evolution-from-volta-to-blackwell/">this excellent article by SemiAnalysis</a> traces how register pressure shaped them across generations of <a data-term="tensor-core">Tensor Cores</a>. Three features stand out: <b>asynchronous copies</b>, added in Ampere, which move data from global to shared memory without staging it in registers; the <a data-term="tensor-memory-accelerator">Tensor Memory Accelerator</a> (TMA), added in Hopper, which also takes over the address arithmetic of bulk copies; and <a data-term="tensor-memory">tensor memory</a>, added in Blackwell, which holds matrix-multiply accumulators outside the registers altogether.</p>
<div data-slot="f3"></div>
${GG.noteHTML('beyond', `<p>Hopper also lets a kernel move registers between <a data-term="warpgroup">warpgroups</a> at run time with the PTX instruction <code>setmaxnreg</code>: warpgroups that only issue TMA copies give registers up, so the warpgroups doing the math can hold bigger accumulator tiles.</p>`)}
<h3>CPUs feel it too</h3>
<p>Register pressure also occurs in CPUs, where similar register bottlenecks limit the degree to which loops can be <a href="https://hogback.atmos.colostate.edu/rr/old/tidbits/intel/macintel/doc_files/source/extfile/optaps_for/common/optaps_vec_mine.htm">strip-mined during auto-vectorization</a>. <em>Auto-vectorization</em> is the compiler turning an ordinary scalar loop into SIMD instructions by itself (SIMD: single instruction, multiple data; one instruction works on a short vector of numbers held in one wide register). <em>Strip-mining</em>, also known as loop sectioning, cuts the long loop into strips that each fit such a vector, one strip per iteration, and finishes the leftover elements in a scalar clean-up loop. In the linked Intel example each strip is one SSE vector of 4 floats:</p>
<div data-slot="intel"></div>
<p>Making the strips wider than one vector means unrolling: several vectors in flight per iteration, which hides more latency and saves loop overhead but keeps more registers live at once. That is where the register count caps how far the compiler can go; past it, the compiler would have to spill, just like <code>ptxas</code>. Fig.&nbsp;5 plays with that width. (The clean-up loop plays the role of the GPU's bounds check in <a data-term="branch-efficiency">branch efficiency</a>.)</p>
<div data-slot="f4"></div>
<div data-slot="reading"></div>`);

      guard(() => rpLive(ctx, s.f1));
      let lat = null;
      guard(() => rpCalc(ctx, s.f2, (O) => { if (lat) lat.set(O); }));
      guard(() => { lat = rpLat(ctx, s.lat); lat.set(occCalc(64, 256, false)); });
      guard(() => mkCode(ctx, s.intel, { lang: 'text', langLabel: 'Fortran', lineNumbers: false, caption: 'Intel\'s Example 2, after vectorization: a strip-mined loop over strips of 4 and a scalar clean-up loop', code: `!The vectorizer generates the following two loops
i = 1
do while (i < (n - mod(n,4)))
! Vector strip-mined loop.
  a(i:i+3) = b(i:i+3) + c(i:i+3)
  i = i + 4
end do
do while (i <= n)
  a(i) = b(i) + c(i)     !Scalar clean-up loop
  i = i + 1
end do` }));
      guard(() => rpArch(ctx, s.f3));
      guard(() => rpStrip(ctx, s.f4));
      ctx.reading(s.reading, [
        { href: 'https://semianalysis.com/2025/06/23/nvidia-tensor-core-evolution-from-volta-to-blackwell/', label: 'SemiAnalysis: NVIDIA Tensor Core Evolution, from Volta to Blackwell', note: 'register pressure and the features added to relieve it' },
        { href: 'https://hogback.atmos.colostate.edu/rr/old/tidbits/intel/macintel/doc_files/source/extfile/optaps_for/common/optaps_vec_mine.htm', label: 'Intel compiler documentation: strip-mining and clean-up', note: 'the CPU side of the story' },
        { href: 'https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/index.html', label: 'CUDA C++ Best Practices Guide', note: 'register pressure, allocation granularity and local memory (Beyond the glossary)' },
      ]);
    },
  });

  /* Fig: virtual registers onto physical ones */
  function rpLive(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Twelve virtual registers, a handful of physical ones', hint: 'squeeze the register budget', wide: true,
      caption: 'A hand-written PTX-style snippet: a dot product of four pairs of floats. Each row is one instruction, each column one virtual register (<code>%f1</code>–<code>%f12</code>). A bar shows where a value lives from the moment it is created until its last use: in a physical register (labelled R0, R1, …) or, if it had to be spilled, in local memory. ▼ marks a spill store, ▲ a reload. The column on the right counts live values. We only track the <code>%f</code> values; the <code>%rd</code> address registers need registers too. A real compiler would also reorder the loads to shorten lifetimes.',
    });
    const st = { cap: 4 };
    legend(f.stage, [['var(--memory)', 'value in a physical register'], ['var(--danger)', 'value spilled to local memory', 'dash'], ['var(--ink-3)', 'live values per instruction', 'bar']]);
    const view = rsvg(f.stage, 'Grid of instructions by virtual registers showing each value lifetime and whether it sits in a register or in local memory.', (svg, w) => {
      const A = allocate(st.cap);
      const mob = w < 640;
      const codeW = mob ? 92 : Math.min(290, w * 0.36), pressW = mob ? 40 : 112;
      const colW = clamp((w - codeW - pressW - 8) / 12, 12, 48);
      const rowH = mob ? 19 : 22, top = 30;
      const x0 = codeW + 4;
      Tx(svg, 0, 12, mob ? 'instruction' : 'PTX (virtual registers)', { fs: 9.5, fill: 'var(--ink-2)' });
      Tx(svg, x0, 12, mob ? 'value %f…' : 'where each value lives', { fs: 9.5, fill: 'var(--ink-2)' });
      for (let v = 1; v <= 12; v++) Tx(svg, x0 + (v - 0.5) * colW, top - 6, mob ? String(v) : '%f' + v, { fs: mob ? 8.5 : 9.5, anchor: 'middle', fill: 'var(--ink-3)' });
      const px0 = x0 + 12 * colW + 8, pw = w - px0 - 2;
      Tx(svg, px0, 12, 'live', { fs: 9.5, fill: 'var(--ink-2)' });
      const pScale = (pw - (mob ? 12 : 22)) / 6;
      const capX = px0 + st.cap * pScale;
      A.rows.forEach((cells, k) => {
        const y = top + k * rowH;
        if (k % 2 === 0) R(svg, 0, y, w, rowH, 'fill:rgba(255,255,255,.018)');
        Tx(svg, 0, y + rowH / 2 + 3.5, mob ? PROG[k].sh : PROG[k].ptx, { fs: mob ? 8.6 : 10.5, fill: 'var(--ink)' });
        for (let v = 1; v <= 12; v++) {
          const c = cells[v];
          if (!c) continue;
          const x = x0 + (v - 1) * colW + 2, cw = colW - 4;
          const y1 = y + (c.def ? 4 : 0), h = rowH - (c.def ? 4 : 0) - (c.use ? 4 : 0);
          const evY = c.ev ? 3.5 : 0; // push the label below a spill/reload marker
          if (c.s === 'reg') {
            R(svg, x, y1, cw, h, 'fill:var(--memory)' + (c.def ? '' : ';fill-opacity:.8'), { rx: c.def || c.use ? 3 : 0 });
            if (colW >= 16) Tx(svg, x + cw / 2, y + rowH / 2 + 3.2 + evY, 'R' + c.id, { fs: mob ? 7.5 : 9, anchor: 'middle', fill: '#0b0c12', weight: 600, pe: false });
          } else {
            R(svg, x + 0.5, y1 + 0.5, cw - 1, h - 1, 'fill:rgba(255,91,110,.16);stroke:var(--danger);stroke-width:1;stroke-dasharray:3 2');
            if (colW >= 26) Tx(svg, x + cw / 2, y + rowH / 2 + 3.2 + evY, 'mem', { fs: 8.5, anchor: 'middle', fill: 'var(--danger)' });
          }
          const gs = mob ? 6 : 8;
          if (c.ev.includes('S')) Pa(svg, `M${r2(x + cw - gs)},${r2(y + 1)}h${gs}l${-gs / 2},${r2(gs * 0.72)}z`, 'fill:var(--ink);stroke:#0b0c12;stroke-width:1');
          if (c.ev.includes('L')) Pa(svg, `M${r2(x)},${r2(y + 1 + gs * 0.72)}h${gs}l${-gs / 2},${r2(-gs * 0.72)}z`, 'fill:var(--ink);stroke:#0b0c12;stroke-width:1');
        }
        const p = A.press[k];
        const within = Math.min(p, st.cap), over = Math.max(0, p - st.cap);
        R(svg, px0, y + 5, within * pScale, rowH - 10, 'fill:var(--ink-3)', { rx: 1.5 });
        if (over) R(svg, px0 + within * pScale, y + 5, over * pScale, rowH - 10, 'fill:var(--danger)', { rx: 1.5 });
        Tx(svg, px0 + 6 * pScale + (mob ? 3 : 6), y + rowH / 2 + 3.5, String(p), { fs: 9, fill: over ? 'var(--danger)' : 'var(--ink-2)', weight: over ? 600 : 400 });
      });
      const yEnd = top + PROG.length * rowH;
      Ln(svg, capX, top - 2, capX, yEnd, 'stroke:var(--accent);stroke-width:1.2;stroke-dasharray:3 3');
      Tx(svg, capX, top - 6, mob ? String(st.cap) : 'budget ' + st.cap, { fs: 8.5, anchor: 'middle', fill: 'var(--accent)' });
      return yEnd + 4;
    });
    GG.ui.slider(f.controls, { label: 'physical registers ptxas may use', min: 3, max: 6, step: 1, value: st.cap, onInput: (v) => { st.cap = Math.round(v); update(); } });
    const sV = stat(f, 'virtual registers'), sPk = stat(f, 'peak live values', 'memory'), sC = stat(f, 'physical registers'), sS = stat(f, 'spill stores'), sL = stat(f, 'reloads');
    function update() {
      view.redraw();
      const A = allocate(st.cap);
      sV.set('12'); sPk.set(String(A.peak)); sC.set(String(st.cap));
      sS.set(String(A.stores), A.stores ? 'danger' : ''); sL.set(String(A.loads), A.loads ? 'danger' : '');
      const pk = A.press.indexOf(A.peak);
      const at = `<code>${GG.esc(PROG[pk].ptx.replace(/\s+/g, ' '))}</code>`;
      if (st.cap >= A.peak) f.setWhy(`<b>${st.cap} physical registers:</b> the program fits. Twelve virtual registers map onto ${A.peak} physical ones (R0–R${A.peak - 1}), because each register is reused as soon as the value in it is dead. The most values alive at once is ${A.peak}, at ${at}. No spills.` + (st.cap > A.peak ? ` ${st.cap - A.peak} ${plural(st.cap - A.peak, 'register sits', 'registers sit')} idle.` : ''));
      else f.setWhy(`<b>${st.cap} physical registers:</b> the peak of ${A.peak} live values (first reached at ${at}) no longer fits. Each time a register is needed, the allocator evicts the value whose next use is furthest away, here ${A.spilled.map((v) => '%f' + v).join(', ')}, to local memory, and reloads each one before its next use: <b>${A.stores} spill ${plural(A.stores, 'store')} and ${A.loads} ${plural(A.loads, 'reload')}</b>, each a trip toward GPU RAM that the ${A.peak}-register version never makes.`);
    }
    update();
  }

  function occCalc(regs, threads, rules) {
    const wpb = Math.ceil(threads / 32);
    let byRegs, perBlock, rpw = null;
    if (rules) {
      rpw = Math.ceil((regs * 32) / 256) * 256;
      const perSlice = Math.floor(16384 / rpw);
      byRegs = Math.floor((4 * perSlice) / wpb);
      perBlock = rpw * wpb;
    } else {
      perBlock = regs * threads;
      byRegs = Math.floor(65536 / perBlock);
    }
    // A block that does not fit the register file, or (with the rules) cannot be spread over the
    // four slices, cannot be placed on any SM: the launch fails.
    const overBlock = perBlock > 65536;
    if (overBlock) byRegs = 0;
    const fail = byRegs === 0;
    const byWarps = Math.floor(64 / wpb), byBlocks = 32;
    const blocks = Math.min(byRegs, byWarps, byBlocks);
    const warps = blocks * wpb;
    return { wpb, byRegs, byWarps, byBlocks, blocks, warps, occ: warps / 64, perBlock, rpw, fail, overBlock };
  }

  /* Fig: the occupancy calculator */
  function rpCalc(ctx, slot, onChange) {
    const f = mkFig(ctx, slot, {
      title: 'Registers per thread → blocks per SM → occupancy', hint: 'drag the sliders · try the presets', wide: true,
      caption: 'An H100-class SM: 65,536 registers, 64 warp slots, 32 block slots. The panels show the register file filled by resident blocks, the 64 warp slots in the four sub-partitions (occupancy is the filled share), the three limits on blocks per SM, with the one that binds highlighted, and occupancy as registers per thread vary at this block size. Shared memory, the other big limiter, is left out here; see <a data-term="occupancy">Occupancy</a>.',
    });
    const st = { regs: 64, threads: 256, rules: false };
    const leg = legend(f.stage, [['var(--memory)', 'registers of resident blocks'], ['var(--memory)', 'rounding waste (allocation rules)', 'hatch'], ['var(--core)', 'resident warps'], ['var(--accent)', 'this configuration', 'dot']]);
    const hatchLeg = leg.children[1];
    const hatchId = GG.uid('pfd-hatch');
    const view = rsvg(f.stage, 'Register file, warp slots, limit bars and an occupancy curve for the chosen registers per thread and threads per block.', (svg, w) => {
      const O = occCalc(st.regs, st.threads, st.rules);
      const mob = w < 700;
      const defs = GG.svg('defs', null, svg);
      const pat = GG.svg('pattern', { id: hatchId, width: 5, height: 5, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
      R(pat, 0, 0, 2, 5, 'fill:rgba(111,166,255,.55)');
      const colW = mob ? w : (w - 28) / 2;
      const lx = 0, rx = mob ? 0 : colW + 28;
      let y = 12;
      /* register file */
      Tx(svg, lx, y, st.rules ? 'register file: 4 slices × 16,384 registers' : 'register file: 65,536 × 32-bit registers (256 KiB)', { fs: 9.5, fill: 'var(--ink-2)' });
      y += 8;
      if (!st.rules) {
        const bh = 30;
        R(svg, lx, y, colW, bh, 'fill:var(--surface-2);stroke:var(--line-2)', { rx: 4 });
        const bw0 = (O.perBlock / 65536) * colW;
        if (bw0 >= 3) {
          for (let b = 0; b < O.blocks; b++) {
            const x = lx + (b * O.perBlock / 65536) * colW;
            R(svg, x + 0.5, y + 1, bw0 - 1, bh - 2, 'fill:var(--memory)' + (b % 2 ? ';fill-opacity:.62' : ''));
          }
        } else if (O.blocks) {
          // blocks too thin to draw one by one: one bar for the whole used span
          R(svg, lx + 0.5, y + 1, Math.max(0.6, O.blocks * bw0 - 0.5), bh - 2, 'fill:var(--memory)');
          const lab = `${O.blocks} ${plural(O.blocks, 'block')} × ${fI(O.perBlock)}`;
          if (O.blocks * bw0 >= tw(lab, 9) + 8) Tx(svg, lx + 5, y + bh / 2 + 3.5, lab, { fs: 9, fill: '#0b0c12', weight: 600 });
          else Tx(svg, lx + O.blocks * bw0 + 5, y + bh / 2 + 3.5, lab, { fs: 9, fill: 'var(--ink-2)' });
        }
        const used = O.blocks * O.perBlock;
        Tx(svg, lx, y + bh + 14, O.fail ? `one block needs ${fI(O.perBlock)} registers: more than 65,536` : `${fI(used)} used by ${O.blocks} ${plural(O.blocks, 'block')} · ${fI(65536 - used)} unused`, { fs: 9.5, fill: O.fail ? 'var(--danger)' : 'var(--ink-3)' });
        y += bh + 24;
      } else {
        const sh = 15;
        const perSlice = Math.floor(16384 / O.rpw);
        for (let s4 = 0; s4 < 4; s4++) {
          const yy = y + s4 * (sh + 4);
          R(svg, lx + 26, yy, colW - 26, sh, 'fill:var(--surface-2);stroke:var(--line-2)', { rx: 3 });
          Tx(svg, lx, yy + sh - 3.5, 'SP' + s4, { fs: 8.5, fill: 'var(--ink-3)' });
          const nIn = Math.max(0, Math.ceil((O.warps - s4) / 4));
          const sw = colW - 26;
          for (let j = 0; j < Math.min(nIn, perSlice); j++) {
            const gw = (s4 + 4 * j), blk = Math.floor(gw / O.wpb);
            const x = lx + 26 + (j * O.rpw / 16384) * sw, ww = (O.rpw / 16384) * sw, uw = (st.regs * 32 / 16384) * sw;
            R(svg, x + 0.4, yy + 1, Math.max(0.5, uw - 0.4), sh - 2, 'fill:var(--memory)' + (blk % 2 ? ';fill-opacity:.62' : ''));
            if (ww - uw > 0.3) R(svg, x + uw, yy + 1, ww - uw - 0.4, sh - 2, `fill:url(#${hatchId})`);
          }
        }
        y += 4 * (sh + 4) + 12;
        Tx(svg, lx, y, O.overBlock ? `one block needs ${fI(O.perBlock)} registers: more than 65,536`
          : O.fail ? `${perSlice} ${plural(perSlice, 'warp')}/slice × 4 = ${4 * perSlice}: fewer than one block's ${O.wpb}`
            : mob ? `${O.rpw / 32} regs/thr · ${fI(O.rpw)}/warp · ${perSlice} ${plural(perSlice, 'warp')}/slice` : `${O.rpw / 32} regs/thread after rounding · ${fI(O.rpw)}/warp · ${perSlice} ${plural(perSlice, 'warp')}/slice`, { fs: 9.5, fill: O.fail ? 'var(--danger)' : 'var(--ink-3)' });
        y += 10;
      }
      /* warp slots */
      y += 10;
      Tx(svg, lx, y, `warp slots: ${O.warps} of 64 filled · occupancy ${pct(O.occ, 1)}`, { fs: 9.5, fill: 'var(--ink-2)' });
      y += 7;
      const slW = (colW - 26) / 16, slH = mob ? 10 : 12;
      for (let s4 = 0; s4 < 4; s4++) {
        Tx(svg, lx, y + s4 * (slH + 3) + slH - 2, 'SP' + s4, { fs: 8.5, fill: 'var(--ink-3)' });
        for (let j = 0; j < 16; j++) {
          const gw = s4 + 4 * j;
          const on = gw < O.warps, blk = Math.floor(gw / O.wpb);
          R(svg, lx + 26 + j * slW + 1, y + s4 * (slH + 3), slW - 2, slH, on ? 'fill:var(--core)' + (blk % 2 ? ';fill-opacity:.6' : '') : 'fill:none;stroke:var(--line-2)', { rx: 2 });
        }
      }
      const leftEnd = y + 4 * (slH + 3);
      /* limits */
      let ry = mob ? leftEnd + 22 : 12;
      Tx(svg, rx, ry, 'what limits blocks per SM', { fs: 9.5, fill: 'var(--ink-2)' });
      ry += 8;
      const lim = [
        ['register file', O.byRegs, 'var(--memory)'],
        ['warp slots (64)', O.byWarps, 'var(--core)'],
        ['block slots (32)', O.byBlocks, 'var(--control)'],
      ];
      const labW = mob ? 104 : 112, bmax = 64, barW = colW - labW - 58;
      lim.forEach(([name, v, col], i) => {
        const yy = ry + i * 22;
        const binds = v === O.blocks;
        Tx(svg, rx, yy + 11, name, { fs: 9.5, fill: binds ? 'var(--ink)' : 'var(--ink-3)', weight: binds ? 600 : 400 });
        R(svg, rx + labW, yy + 2, barW, 12, 'fill:var(--surface-2)', { rx: 2 });
        const bl = (Math.min(v, bmax) / bmax) * barW;
        R(svg, rx + labW, yy + 2, bl, 12, `fill:${col};opacity:${binds ? 1 : 0.35}`, { rx: 2 });
        if (v > bmax) Pa(svg, `M${r2(rx + labW + barW - 1)},${yy + 2}l6,6l-6,6z`, `fill:${col}`);
        Tx(svg, rx + labW + Math.min(bl, barW) + (v > bmax ? 8 : 4), yy + 12, fI(v) + (binds ? ' ← binds' : ''), { fs: 9.5, fill: binds ? 'var(--ink)' : 'var(--ink-3)', weight: binds ? 600 : 400 });
      });
      ry += 3 * 22 + 12;
      /* occupancy curve */
      const cy0 = ry + 8, cH = mob ? 96 : 104, cX = rx + 30, cW = colW - 36;
      Tx(svg, rx, ry, mob ? `occupancy vs regs/thread (${fI(st.threads)} thr/block)` : `occupancy vs registers per thread, at ${fI(st.threads)} threads per block`, { fs: 9.5, fill: 'var(--ink-2)' });
      [0, 0.5, 1].forEach((v) => { const yy = cy0 + cH * (1 - v); Ln(svg, cX, yy, cX + cW, yy, 'stroke:var(--line)'); Tx(svg, cX - 4, yy + 3, pct(v, 0), { fs: 8.5, anchor: 'end', fill: 'var(--ink-3)' }); });
      const xOf = (r) => cX + ((r - 1) / 254) * cW;
      let d = '';
      for (let r = 1; r <= 255; r++) {
        const o = occCalc(r, st.threads, st.rules).occ;
        const x = xOf(r), yy = cy0 + cH * (1 - o);
        d += (r === 1 ? 'M' : 'L') + r2(x) + ',' + r2(yy);
        if (r < 255) d += 'H' + r2(xOf(r + 1));
      }
      Pa(svg, d, 'fill:none;stroke:var(--core);stroke-width:1.6');
      [1, 32, 64, 128, 255].forEach((r) => Tx(svg, r === 255 ? xOf(r) + 3 : xOf(r), cy0 + cH + 12, String(r), { fs: 8.5, anchor: r === 255 ? 'end' : 'middle', fill: 'var(--ink-3)' }));
      C(svg, xOf(st.regs), cy0 + cH * (1 - O.occ), 5, 'fill:var(--accent);stroke:var(--bg);stroke-width:1.5');
      const rightEnd = cy0 + cH + 16;
      return Math.max(mob ? 0 : leftEnd, rightEnd) + 2;
    });
    const sR = GG.ui.slider(f.controls, { label: 'registers per thread', min: 1, max: 255, step: 1, value: st.regs, onInput: (v) => { st.regs = Math.round(v); update(); } });
    const sT = GG.ui.slider(f.controls, { label: 'threads per block', min: 32, max: 1024, step: 32, value: st.threads, format: fI, onInput: (v) => { st.threads = Math.round(v / 32) * 32; update(); } });
    const tg = GG.ui.toggle(f.controls, { label: 'hardware allocation rules (Beyond)', value: false, onChange: (v) => { st.rules = v; update(); } });
    const pre = GG.el('div', { class: 'ctl' }, GG.el('span', { class: 'ctl-lab', text: 'presets' }));
    const pw = GG.el('div', { class: 'pfd-presets' });
    pre.append(pw);
    f.controls.append(pre);
    const preset = (label, r, t, rules) => GG.ui.button(pw, { label, onClick: () => { st.regs = r; st.threads = t; st.rules = rules; sR.set(r); sT.set(t); tg.set(rules); update(); } });
    preset('Occupancy entry: 8 regs × 32 threads', 8, 32, false);
    preset('32 regs: full occupancy', 32, 256, false);
    preset('Best Practices: 37 regs, 128 thr', 37, 128, true);
    preset('37 regs, 320 thr', 37, 320, true);
    const sPB = stat(f, 'registers per block', 'memory'), sBl = stat(f, 'blocks per SM'), sWp = stat(f, 'warps per SM', 'core'), sOc = stat(f, 'occupancy', 'core'), sBd = stat(f, 'binding limit');
    function update() {
      view.redraw();
      const O = occCalc(st.regs, st.threads, st.rules);
      if (onChange) onChange(O, st);
      hatchLeg.style.display = st.rules ? '' : 'none';
      sPB.set(fI(O.perBlock)); sBl.set(String(O.blocks), O.fail ? 'danger' : ''); sWp.set(`${O.warps} / 64`, O.fail ? 'danger' : 'core'); sOc.set(pct(O.occ, 1), O.fail ? 'danger' : 'core');
      const binds = [];
      if (O.fail) binds.push('launch fails');
      else { if (O.byRegs === O.blocks) binds.push('registers'); if (O.byWarps === O.blocks) binds.push('warp slots'); if (O.byBlocks === O.blocks) binds.push('block slots'); }
      sBd.set(binds.join(' + '), O.fail ? 'danger' : binds.includes('registers') ? 'memory' : 'control');
      const regLine = st.rules
        ? `${st.regs} ${plural(st.regs, 'register')} per thread ${O.rpw / 32 === st.regs ? plural(st.regs, 'needs', 'need') + ' no rounding' : plural(st.regs, 'rounds', 'round') + ' up to ' + O.rpw / 32} (${fI(O.rpw)} per warp); each 16,384-register slice holds ${Math.floor(16384 / O.rpw)} such warps, ${4 * Math.floor(16384 / O.rpw)} per SM, which is room for ${O.byRegs} ${plural(O.byRegs, 'block')} of ${O.wpb} ${plural(O.wpb, 'warp')}.`
        : `${st.regs} ${plural(st.regs, 'register')} × ${fI(st.threads)} threads = ${fI(O.perBlock)} registers per block; 65,536 ÷ ${fI(O.perBlock)} leaves room for ${O.byRegs} ${plural(O.byRegs, 'block')}.`;
      if (O.overBlock) f.setWhy(`<b>This launch would fail.</b> One block needs ${fI(O.perBlock)} registers, more than the 65,536 a block may use (and more than the whole SM has). The CUDA runtime reports "too many resources requested for launch". Use fewer registers or fewer threads per block.`);
      else if (O.fail) f.setWhy(`<b>This launch would fail.</b> At ${O.rpw / 32} registers per thread after rounding, a warp takes ${fI(O.rpw)} registers, so each 16,384-register slice holds only ${Math.floor(16384 / O.rpw)} warps, ${4 * Math.floor(16384 / O.rpw)} per SM. A block's ${fI(O.perBlock)} registers fit under the 65,536 limit in total, but its ${O.wpb} warps have to be spread over the four slices, and there is room for only ${4 * Math.floor(16384 / O.rpw)}. No SM can take even one block, so the CUDA runtime reports "too many resources requested for launch".`);
      else f.setWhy(`${regLine} The warp slots allow ${O.byWarps} and the block slots 32, so <b>${O.blocks} ${plural(O.blocks, 'block')}</b> (${O.warps} ${plural(O.warps, 'warp')}) ${plural(O.blocks, 'fits', 'fit')}: occupancy <b>${pct(O.occ, 1)}</b>, limited by ${binds.join(' and ')}.` + (st.regs === 8 && st.threads === 32 && !st.rules ? ' This is the Occupancy entry\'s worked example; there, its 12 KB of shared memory per block cuts the 32 blocks down to 19.' : '') + (binds.includes('registers') && O.occ < 1 ? ' This is register pressure at work: the register file is what caps how many warps can hide each other\'s latency.' : ''));
    }
    update();
  }

  /* Fig: fewer warps per scheduler → idle issue slots (driven by Fig. 2) */
  function rpLat(ctx, slot) {
    const LAT = 20, EVERY = 4, ROUND = EVERY - 1 + LAT;
    const f = mkFig(ctx, slot, {
      title: 'Fewer resident warps, more idle issue slots', hint: 'change Fig. 2 · hover a box', wide: true,
      caption: `One warp scheduler (one SM sub-partition) over 32 cycles. Rows are its 16 warp slots, filled with the warps Fig.&nbsp;2 fits on the SM divided by four; columns are cycles; the row along the bottom is the issue slot, red where nothing could issue. An illustrative instruction mix, not a measurement: each warp issues three quick instructions (FFMA) and then a load (LDG) whose result takes ${LAT} cycles to arrive, so one warp issues ${EVERY} instructions per ${ROUND}-cycle round. The Issue efficiency chip counts only these 32 cycles, which start with every warp ready at once; the long-run chip is the rate after that start-up burst, warps × ${EVERY} ÷ ${ROUND} (at most 100%). Change the registers per thread or the block size in Fig.&nbsp;2 and this figure follows.`,
    });
    let cy = null, cur = null, steady = 0;
    const need = Math.ceil(ROUND / EVERY);
    const why = () => {
      if (!cur) return null;
      const O = cur, wps = Math.min(16, Math.floor(O.warps / 4)), extra = O.warps % 4;
      const m = cy ? cy.metrics() : null;
      const ie = m ? GG.components.cycles.fmtPct(m.issueEfficiency) : '—';
      if (O.fail || !O.warps) return '<b>No warps fit</b>: with this configuration the launch fails, so the scheduler has nothing to issue.';
      const win = m && m.issueEfficiency > steady + 1e-9 ? ` The Issue efficiency chip counts only these first 32 cycles, which start with every warp ready, so it reads higher: ${ie}.` : '';
      return `Fig.&nbsp;2 fits <b>${O.warps} warps</b> on the SM (occupancy ${pct(O.occ, 1)}), so this scheduler holds ${wps}${extra ? ` (${extra} of the four schedulers get one more)` : ''}. Each warp issues ${EVERY} instructions per ${ROUND}-cycle round (three FFMAs, then the LDG and its ${LAT}-cycle wait), so it takes ${ROUND} ÷ ${EVERY} = ${+(ROUND / EVERY).toFixed(2)}, rounded up to ${need} warps, to keep one instruction issuing every cycle. ` +
        (wps >= need ? `${wps} is enough: once the warps are under way the scheduler issues on every cycle, issue efficiency <b>100%</b>; the latency is hidden.${win}` : `With only ${wps}, the scheduler gets ${wps * EVERY} instructions per ${ROUND}-cycle round, so in the long run its issue efficiency is ${wps * EVERY}/${ROUND} ≈ <b>${pct(steady, 1)}</b>: often every warp is waiting on its load at the same time, and those cycles issue nothing. That is register pressure making latency harder to hide.${win}`);
    };
    cy = GG.components.cycles(f, { simulate: { warps: 8, slots: 16, latency: LAT, issueEvery: EVERY, cycles: 32 }, mode: 'issue', why: (info) => (info && info.cell ? null : why()) });
    const sLR = stat(f, `long-run issue efficiency (warps × ${EVERY} ÷ ${ROUND})`, 'special');
    return {
      set(O) {
        cur = O;
        const wps = O.fail ? 0 : Math.min(16, Math.floor(O.warps / 4));
        const sc = cy.simulate({ warps: wps, slots: 16, latency: LAT, issueEvery: EVERY, cycles: 32 });
        steady = sc && sc.meta ? sc.meta.steady : Math.min(1, (wps * EVERY) / ROUND);
        sLR.set(wps ? pct(steady, 1) : '—');
        const h = why();
        if (h) f.setWhy(`<span class="cy-w">${h}</span>`);
      },
    };
  }

  /* Fig: architectures that relieve the register file */
  const GENS = [
    {
      name: 'Volta', gpu: 'V100', year: 2017, nodes: ['ram', 'rf', 'smem', 'tc'],
      edges: [['ram', 'rf', 'load', 'rf', 0], ['rf', 'smem', 'store', 'rf', 0.18], ['smem', 'rf', 'A, B tiles', 'rf', 0.18], ['rf', 'tc', 'A, B, C', 'rf', 0.04], ['tc', 'rf', 'D', 'rf', 0.24]],
      chips: [1, 1, 1, 1],
      why: '<b>Volta (V100, 2017), first Tensor Cores.</b> Everything a matrix multiply touches passes through registers. Tiles are loaded from global memory into registers and then stored into shared memory; operand fragments are loaded back into registers for the Tensor Core; the accumulators live in registers the whole time. All four kinds of data compete for the register file.',
    },
    {
      name: 'Ampere', gpu: 'A100', year: 2020, nodes: ['ram', 'rf', 'smem', 'tc'],
      edges: [['ram', 'smem', 'async copy', 'by', 0], ['smem', 'rf', 'A, B tiles', 'rf', 0.18], ['rf', 'tc', 'A, B, C', 'rf', 0.04], ['tc', 'rf', 'D', 'rf', 0.24]],
      chips: [0, 1, 1, 1],
      why: '<b>Ampere (A100, 2020) adds asynchronous copies</b> (<code>cp.async</code>): data moves from global memory straight into shared memory without being staged in registers, and the thread can do other work while it travels. Operand tiles and accumulators still live in registers.',
    },
    {
      name: 'Hopper', gpu: 'H100', year: 2022, nodes: ['ram', 'tma', 'rf', 'smem', 'tc'],
      edges: [['ram', 'tma', '', 'by', 0], ['tma', 'smem', 'bulk copy', 'by', 0], ['smem', 'tc', 'A, B (wgmma)', 'by', 0], ['tc', 'rf', 'D accumulators', 'rf', 0.24], ['rf', 'tc', '', 'rf', 0.04]],
      chips: [0, 0, 0, 1],
      why: '<b>Hopper (H100, 2022) adds the TMA</b>, which computes the addresses of bulk tile copies itself, so threads stop spending registers on address arithmetic, and a single thread can launch a large copy. Its warpgroup MMA instructions (<code>wgmma</code>) read the A and B tiles directly from shared memory (A may also come from registers). The accumulators stay in registers.',
    },
    {
      name: 'Blackwell', gpu: 'B200', year: 2024, nodes: ['ram', 'tma', 'rf', 'smem', 'tc', 'tmem'],
      edges: [['ram', 'tma', '', 'by', 0], ['tma', 'smem', 'bulk copy', 'by', 0], ['smem', 'tc', 'A, B', 'by', 0], ['tc', 'tmem', '', 'by', 0.2], ['tmem', 'tc', 'D', 'by', 0.2], ['tmem', 'rf', 'epilogue', 'rf', 0]],
      chips: [0, 0, 0, 0],
      why: '<b>Blackwell (B200, 2024) adds tensor memory.</b> For <code>tcgen05.mma</code>, the accumulator D must be in tensor memory, A may be in tensor memory or shared memory, and B must be in shared memory. None of the matrices are in registers. Values come out of tensor memory into registers only for post-processing, the epilogue, such as applying a non-linearity.',
    },
  ];
  function rpArch(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'What competes for registers in a matrix multiply', hint: 'step through four generations',
      caption: 'Data paths of a Tensor Core matrix multiply in four SM generations, simplified. Solid blue arrows pass through the register file; dashed grey arrows bypass it. The chips underneath list the four kinds of data that used to compete for registers, and where each generation moved them. Qualitative, not to scale.',
    });
    let gi = 0;
    legend(f.stage, [['var(--memory)', 'path through registers', 'line'], ['var(--ink-2)', 'path that bypasses registers', 'dline']]);
    const NAMES = { ram: 'GPU RAM\nglobal memory', rf: 'register file', smem: 'shared memory (L1)', tc: 'Tensor Core', tmem: 'tensor memory', tma: 'TMA' };
    const TONE = { ram: 'memory', rf: 'memory', smem: 'memory', tc: 'core', tmem: 'memory', tma: 'special' };
    const CHIPS = ['staging copies', 'address math', 'A/B operand tiles', 'accumulators'];
    const WHERE = ['async copy / TMA', 'the TMA', 'read from shared memory', 'tensor memory'];
    const CHAIN = [
      [['ram'], ['rf', 'load'], ['smem', 'store'], ['rf', 'A, B tiles'], ['tc', 'A, B, C'], ['rf', 'D (accumulator)']],
      [['ram'], ['smem', 'async copy'], ['rf', 'A, B tiles'], ['tc', 'A, B, C'], ['rf', 'D (accumulator)']],
      [['ram'], ['tma', 'TMA request'], ['smem', 'bulk tile copy'], ['tc', 'A, B (wgmma)'], ['rf', 'D, read and written']],
      [['ram'], ['tma', 'TMA request'], ['smem', 'bulk tile copy'], ['tc', 'A, B'], ['tmem', 'D, read and written'], ['rf', 'epilogue']],
    ];
    function node(svg, x, y, ww, hh, k, on, fs, oneLine) {
      const tone = TONE[k];
      R(svg, x, y, ww, hh, on ? `fill:var(--${tone}-a);stroke:var(--${tone});stroke-width:${k === 'rf' ? 2 : 1.2}` : 'fill:none;stroke:var(--line);stroke-dasharray:3 3', { rx: 8 });
      const lines = oneLine ? [NAMES[k].replace('\n', ' · ')] : NAMES[k].split('\n');
      const y0 = y + hh / 2 + 4 - ((lines.length - 1) * (fs + 3)) / 2;
      lines.forEach((ln, i) => Tx(svg, x + ww / 2, y0 + i * (fs + 3), ln, { fs, anchor: 'middle', fill: on ? `var(--${tone})` : 'var(--ink-3)', weight: on ? 600 : 400 }));
      if (!on) Tx(svg, x + ww / 2, y0 + lines.length * (fs + 3), 'not yet', { fs: 8.5, anchor: 'middle', fill: 'var(--ink-3)' });
    }
    function label(svg, x, y, lab, col) {
      const lw = tw(lab, 9.5) + 8;
      R(svg, x - lw / 2, y - 8, lw, 15, 'fill:#0e0f17;stroke:' + col + ';stroke-width:.8', { rx: 4 });
      Tx(svg, x, y + 3.3, lab, { fs: 9.5, anchor: 'middle', fill: col });
    }
    const view = rsvg(f.stage, 'Diagram of GPU RAM, shared memory, register file, Tensor Core, TMA and tensor memory with arrows for the data paths of one GPU generation.', (svg, w) => {
      const Gn = GENS[gi];
      const mob = w < 600;
      Tx(svg, 0, 14, `${Gn.name} · ${Gn.gpu} · ${Gn.year}`, { fs: 12, fill: 'var(--ink)', weight: 600 });
      let cy;
      if (!mob) {
        const c2 = Math.round(w * 0.38), c3 = w - 172;
        const N = { ram: [0, 40, 128, 184], tma: [146, 174, 56, 40], rf: [c2, 40, 170, 60], smem: [c2, 164, 170, 60], tc: [c3, 164, 170, 60], tmem: [c3, 40, 170, 60] };
        const cen = (k) => [N[k][0] + N[k][2] / 2, N[k][1] + N[k][3] / 2];
        const edgePt = (k, tx, ty) => {
          const [x, y, ww, hh] = N[k], cx = x + ww / 2, cyy = y + hh / 2;
          const dx = tx - cx, dy = ty - cyy;
          const sc = Math.min(Math.abs((ww / 2 + 3) / (dx || 1e-6)), Math.abs((hh / 2 + 3) / (dy || 1e-6)));
          return [cx + dx * sc, cyy + dy * sc];
        };
        Object.keys(N).forEach((k) => node(svg, N[k][0], N[k][1], N[k][2], N[k][3], k, Gn.nodes.includes(k), 10.5, false));
        const labels = [];
        Gn.edges.forEach(([a, b, lab, kind, bend, lt]) => {
          const [ax, ay] = cen(a), [bx, by] = cen(b);
          const col = kind === 'rf' ? 'var(--memory)' : 'var(--ink-2)';
          const len = Math.hypot(bx - ax, by - ay) || 1;
          const nx = -(by - ay) / len, ny = (bx - ax) / len;
          const off = bend * len;
          const qx = (ax + bx) / 2 + nx * off, qy = (ay + by) / 2 + ny * off;
          const [sx, sy] = edgePt(a, qx, qy), [ex, ey] = edgePt(b, qx, qy);
          Pa(svg, `M${r2(sx)},${r2(sy)}Q${r2(qx)},${r2(qy)} ${r2(ex)},${r2(ey)}`, `fill:none;stroke:${col};stroke-width:2` + (kind === 'rf' ? '' : ';stroke-dasharray:5 4'));
          head(svg, ex, ey, Math.atan2(ey - qy, ex - qx), 7, col);
          if (!lab) return;
          const t = lt == null ? 0.5 : lt;
          let lx = (1 - t) * (1 - t) * sx + 2 * t * (1 - t) * qx + t * t * ex, ly = (1 - t) * (1 - t) * sy + 2 * t * (1 - t) * qy + t * t * ey;
          if (off) {
            const sup = Math.abs(nx) * (tw(lab, 9.5) + 8) / 2 + Math.abs(ny) * 7.5 + 2;
            const sg = Math.sign(off);
            lx += sg * nx * sup; ly += sg * ny * sup;
          }
          labels.push([lx, ly, lab, col]);
        });
        labels.forEach(([x, y, lab, col]) => label(svg, x, y, lab, col));
        cy = 244;
      } else {
        const chain = CHAIN[gi];
        const bw = Math.min(190, w * 0.56), bh = 30, gap = 26, x0 = 0, top = 28;
        chain.forEach(([k, lab], i) => {
          const y = top + i * (bh + gap);
          if (i > 0) {
            const prev = chain[i - 1][0];
            const thru = prev === 'rf' || k === 'rf';
            const col = thru ? 'var(--memory)' : 'var(--ink-2)';
            const ax = x0 + bw / 2, y1 = y - gap + 2, y2 = y - 2;
            Ln(svg, ax, y1, ax, y2 - 6, `stroke:${col};stroke-width:2` + (thru ? '' : ';stroke-dasharray:5 4'));
            head(svg, ax, y2, Math.PI / 2, 7, col);
            if (lab) Tx(svg, ax + 10, (y1 + y2) / 2 + 3.5, lab, { fs: 9.5, fill: col });
          }
          node(svg, x0, y, bw, bh, k, true, 9.5, true);
        });
        const n = chain.filter(([k]) => k === 'rf').length;
        const yEnd = top + chain.length * (bh + gap) - gap;
        Tx(svg, bw + 14, top + 14, `${n} ${plural(n, 'visit')} to the`, { fs: 9.5, fill: 'var(--ink-2)' });
        Tx(svg, bw + 14, top + 28, 'register file', { fs: 9.5, fill: 'var(--memory)', weight: 600 });
        cy = yEnd + 26;
      }
      Tx(svg, 0, cy, 'competing for the register file:', { fs: 9.5, fill: 'var(--ink-2)' });
      cy += 8;
      const chipW = mob ? (w - 6) / 2 : (w - 18) / 4;
      CHIPS.forEach((c, i) => {
        const x = mob ? (i % 2) * (chipW + 6) : i * (chipW + 6), yy = cy + (mob ? Math.floor(i / 2) * 44 : 0);
        const on = Gn.chips[i];
        R(svg, x, yy, chipW, 38, on ? 'fill:var(--memory-a);stroke:var(--memory)' : 'fill:none;stroke:var(--line-2);stroke-dasharray:3 2', { rx: 7 });
        Tx(svg, x + 9, yy + 16, c, { fs: 10, fill: on ? 'var(--memory)' : 'var(--ink-3)', weight: on ? 600 : 400 });
        Tx(svg, x + 9, yy + 30, on ? 'in registers' : '→ ' + WHERE[i], { fs: 9, fill: on ? 'var(--ink-2)' : 'var(--ink-3)' });
        if (!on) Ln(svg, x + 9, yy + 12.5, x + 9 + tw(c, 10), yy + 12.5, 'stroke:var(--ink-3);stroke-width:1');
      });
      return cy + (mob ? 88 : 40);
    });
    const sN = stat(f, 'generation', 'accent'), sC = stat(f, 'kinds of data in registers', 'memory');
    GG.ui.stepper(f.controls, { label: 'generation', steps: GENS.map((g) => ({ label: g.name })), autoplay: 3600, onStep: (i) => { gi = i; view.redraw(); f.setWhy(GENS[i].why); sN.set(GENS[i].name); sC.set(`${GENS[i].chips.reduce((a2, b2) => a2 + b2, 0)} of 4`); } });
  }

  /* Fig: strip-mining on a CPU */
  function rpStrip(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Strip-mining a = b + c on a CPU', hint: 'widen the strip',
      caption: 'A toy model of an auto-vectorised loop over n = 70 floats, on an x86-64 CPU with SSE: 16 vector registers (XMM0–XMM15), 4 floats each. A strip of 4 is Intel\'s plain strip-mined loop, one vector per iteration; wider strips mean unrolling, w ÷ 4 vectors in flight per iteration. Each strip loads chunks of <code>b</code> and <code>c</code> into registers (the sum overwrites the <code>b</code> chunk), so a strip of w floats keeps 2 × w ÷ 4 registers live. Leftover elements run in the scalar clean-up loop. Real compilers pick strip widths and unrolling to fit the registers they have.',
    });
    const st = { w: 16 };
    const n = 70;
    legend(f.stage, [['var(--memory)', 'one strip (alternating shades)'], ['var(--line-2)', 'scalar clean-up loop', 'dash'], ['var(--danger)', 'does not fit: spilled to the stack', 'outline']]);
    const view = rsvg(f.stage, 'Three arrays of 70 floats split into strips, above a row of 16 vector registers filled by one strip.', (svg, w) => {
      const mob = w < 600;
      const cw = (w - 46) / n;
      const strips = Math.floor(n / st.w), main = strips * st.w;
      ['b', 'c', 'a'].forEach((nm, row) => {
        const y = 8 + row * 22;
        Tx(svg, 0, y + 12, nm === 'a' ? 'a =' : nm, { fs: 10, fill: 'var(--ink-2)' });
        for (let i = 0; i < n; i++) {
          const inMain = i < main, sIdx = Math.floor(i / st.w);
          R(svg, 40 + i * cw + 0.3, y, cw - 0.6, 16, inMain ? 'fill:var(--memory);fill-opacity:' + (sIdx % 2 ? 0.45 : 0.85) : 'fill:none;stroke:var(--line-2);stroke-dasharray:2 2');
        }
      });
      const yb = 8 + 3 * 22 + 2;
      for (let s = 0; s < strips; s++) {
        const x1 = 40 + s * st.w * cw + 1, x2 = 40 + (s + 1) * st.w * cw - 1;
        Pa(svg, `M${r2(x1)},${yb}v4H${r2(x2)}v-4`, 'fill:none;stroke:var(--ink-3)');
      }
      if (main < n) {
        const cl = `clean-up: ${n - main}`, cx0 = 40 + main * cw + 2;
        const fitsR = cx0 + tw(cl, 9) <= w;
        Tx(svg, fitsR ? cx0 : w, yb + 16, cl, { fs: 9, anchor: fitsR ? 'start' : 'end', fill: 'var(--ink-3)' });
      }
      Tx(svg, 40, yb + 16, `${strips} ${plural(strips, 'strip')} of ${st.w}`, { fs: 9.5, fill: 'var(--ink-2)' });
      const need = (2 * st.w) / 4;
      const ry = yb + 34;
      Tx(svg, 0, ry, mob ? `vector registers: ${need} needed, 16 available` : `vector registers for one strip: ${need} needed, 16 available` + (need > 16 ? ` · c0–c${need - 17} have no register: spilled` : ''), { fs: 9.5, fill: need > 16 ? 'var(--danger)' : 'var(--ink-2)' });
      const perRow = mob ? 8 : 16;
      const total = Math.max(16, need);
      const rw = (w - (perRow - 1) * 4) / perRow, rh = 26;
      for (let i = 0; i < total; i++) {
        const row = Math.floor(i / perRow), col = i % perRow;
        const x = col * (rw + 4), y = ry + 8 + row * (rh + 6);
        const used = i < need, over = i >= 16;
        const isB = i < need / 2;
        R(svg, x, y, rw, rh, over ? 'fill:rgba(255,91,110,.16);stroke:var(--danger);stroke-dasharray:3 2' : used ? 'fill:var(--memory-a);stroke:var(--memory)' : 'fill:none;stroke:var(--line-2)', { rx: 4 });
        for (let q = 0; q < 4; q++) if (used) R(svg, x + 3 + q * ((rw - 6) / 4), y + 3, (rw - 6) / 4 - 1.5, 8, 'fill:' + (over ? 'var(--danger)' : 'var(--memory)') + ';fill-opacity:.8');
        Tx(svg, x + 4, y + rh - 4, used ? (isB ? 'b' : 'c') + (isB ? i : i - need / 2) : 'xmm' + i, { fs: 8.5, fill: over ? 'var(--danger)' : used ? 'var(--ink)' : 'var(--ink-3)' });
      }
      const rows = Math.ceil(total / perRow);
      return ry + 8 + rows * (rh + 6);
    });
    GG.ui.seg(f.controls, { label: 'strip width (floats)', options: [4, 8, 16, 32, 64].map((v) => ({ value: v, label: String(v) })), value: st.w, onChange: (v) => { st.w = v; update(); } });
    const sN = stat(f, 'registers needed', 'memory'), sA = stat(f, 'available'), sS = stat(f, 'spilled'), sI = stat(f, 'strip iterations'), sC = stat(f, 'clean-up iterations');
    function update() {
      view.redraw();
      const need = (2 * st.w) / 4, spill = Math.max(0, need - 16);
      sN.set(String(need)); sA.set('16'); sS.set(String(spill), spill ? 'danger' : ''); sI.set(String(Math.floor(n / st.w))); sC.set(String(n % st.w));
      f.setWhy(spill
        ? `<b>Strips of ${st.w}:</b> each strip wants ${need / 2} chunks of <code>b</code> and ${need / 2} of <code>c</code> in flight, ${need} registers, but SSE has only 16. ${spill} would have to spill to the stack and be reloaded, so the compiler would not strip-mine this far: register pressure caps the strip width.`
        : `<b>Strips of ${st.w}:</b> ${Math.floor(n / st.w)} vectorised ${plural(Math.floor(n / st.w), 'iteration')} handle ${Math.floor(n / st.w) * st.w} elements, keeping ${need} of the 16 vector registers live, and the clean-up loop does the remaining ${n % st.w} one at a time.` + (need === 16 ? ' This strip uses every register: the widest that fits.' : ''));
    }
    update();
  }
})();
