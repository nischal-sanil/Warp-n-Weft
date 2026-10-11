/* chapters/pf-a — Performance, part A.
   Entries: performance-bottleneck, roofline-model, compute-bound, memory-bound, arithmetic-intensity, overhead.
   CSS prefix: pfa-. Custom figures are pixel-true SVG (viewBox width = stage width) rebuilt when the stage
   width changes, so labels stay legible from 390 px phones to desktops; the roofline figures use
   GG.components.roofline with different systems, kernels and options in every entry. */
(function () {
  'use strict';
  if (!window.GG) return;

  GG.css(`
  .pfa-svg { display: block; width: 100%; height: auto; touch-action: manipulation; -webkit-user-select: none; user-select: none; }
  .pfa-cv canvas { display: block; }
  .pfa-legend { display: flex; flex-wrap: wrap; gap: 4px 16px; margin: 0 0 10px; font: 500 11.5px/1.5 var(--font-mono); color: var(--ink-2); }
  .pfa-legend span { display: inline-flex; align-items: center; gap: 7px; }
  .pfa-legend i { flex: none; display: inline-block; width: 11px; height: 11px; border-radius: 3px; background: var(--sw); }
  .pfa-legend i.ln { height: 0; width: 18px; border-radius: 0; background: none; border-top: 2.5px solid var(--sw); }
  .pfa-legend i.dl { height: 0; width: 18px; border-radius: 0; background: none; border-top: 2px dashed var(--sw); }
  .pfa-legend i.ol { background: transparent; border: 1.5px solid var(--sw); }
  .pfa-legend i.dt { width: 9px; height: 9px; border-radius: 50%; }
  .pfa-legend i.lg { height: 2.5px; width: 22px; border-radius: 0; background: repeating-linear-gradient(90deg, var(--sw) 0 8px, transparent 8px 12px); }
  .pfa-legend i.dd { height: 0; width: 18px; border-radius: 0; background: none; border-top: 3px dotted var(--sw); }
  .pfa-presets { display: flex; flex-wrap: wrap; gap: 6px; }
  .pfa-presets .btn { height: 30px; font-size: 11.5px; padding: 0 10px; }
  .pfa-presets .btn[aria-pressed="true"] { border-color: var(--accent); background: var(--accent-a); color: var(--ink); }
  .pfa-eq { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 8px 14px; padding: 16px 14px;
    border: 1px solid var(--line); border-radius: 12px; background: var(--surface); font-family: var(--font-mono); font-size: 14px; color: var(--ink); text-align: center; }
  .pfa-eq .op { color: var(--ink-3); font-size: 17px; }
  .pfa-eq .fr { display: inline-flex; flex-direction: column; align-items: stretch; }
  .pfa-eq .fr > span { padding: 3px 9px; }
  .pfa-eq .fr > span:first-child { border-bottom: 1.5px solid var(--ink-2); }
  .pfa-eq small { display: block; width: 100%; font-family: var(--font-body); font-size: 12.5px; color: var(--ink-3); }
  .pfa-eq.in-fig { margin-top: 12px; background: rgba(8, 9, 14, 0.5); }
  .pfa-eq .row { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 8px 12px; width: 100%; }
  .pfa-log { margin-top: 10px; display: grid; gap: 3px; font: 500 11.5px/1.45 var(--font-mono); color: var(--ink-3); min-height: 1.45em; }
  .pfa-log b { color: var(--ink); font-weight: 600; }
  .pfa-log .up { color: var(--core); }
  .pfa-log .flat { color: var(--danger); }
  .pfa-gauges { display: grid; gap: 8px; margin-top: 12px; }
  .pfa-gauge { display: grid; grid-template-columns: minmax(118px, 190px) minmax(0, 1fr) 58px; align-items: center; gap: 10px; font: 500 11.5px/1.3 var(--font-mono); color: var(--ink-2); }
  .pfa-gauge .tr { height: 12px; border-radius: 6px; background: rgba(255, 255, 255, 0.06); overflow: hidden; border: 1px solid var(--line); }
  .pfa-gauge .tr i { display: block; height: 100%; width: 0; border-radius: 6px; background: var(--gc); transition: width 0.25s; }
  .pfa-gauge b { text-align: right; color: var(--ink); font-weight: 600; font-variant-numeric: tabular-nums; }
  .pfa-gauge-h { font: 500 10px/1.3 var(--font-mono); letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-3); margin-top: 4px; }
  .pfa-cards { display: grid; gap: 8px; }
  .pfa-card { display: grid; grid-template-columns: 26px minmax(0, 1fr); gap: 10px; align-items: baseline; padding: 9px 12px; border-radius: 10px;
    border: 1px solid var(--line); background: rgba(8, 9, 14, 0.5); }
  .pfa-card > span:first-child { font: 600 11px var(--font-mono); color: var(--accent); }
  .pfa-card .l { font-size: 13.5px; line-height: 1.45; color: var(--ink-2); }
  .pfa-card .m { display: block; margin-top: 3px; font: 500 13px/1.5 var(--font-mono); color: var(--ink); overflow-wrap: anywhere; }
  .pfa-card .m b { font-weight: 700; }
  .pfa-card.hot { border-color: var(--line-2); background: rgba(24, 26, 38, 0.8); }
  .pfa-tw { margin-top: 12px; }
  .pfa-tw table { font-size: 12.5px; }
  .pfa-tw th, .pfa-tw td { padding: 7px 10px; }
  .pfa-tw td.hl { color: var(--ink); font-weight: 600; }
  .entry-body td.pfa-bad { color: var(--control); }
  .pfa-k { font: 500 10px/1.3 var(--font-mono); letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-3); }
  .pfa-st { cursor: pointer; outline: none; }
  .pfa-st:focus-visible .pfa-st-ring { stroke: var(--accent); stroke-width: 2.5; opacity: 1; }
  .pfa-st:hover .pfa-st-box { stroke: var(--ink-3); }
  .pfa-flow { cursor: pointer; outline: none; }
  .pfa-dim { opacity: 0.28; transition: opacity 0.2s; }
  .pfa-num-row { display: flex; flex-wrap: wrap; gap: 6px 14px; margin-top: 10px; font: 500 11.5px/1.5 var(--font-mono); color: var(--ink-3); }
  .pfa-num-row b { color: var(--ink); font-weight: 600; }
  .pfa-ovkey > b, .pfa-ovkey > span:not(:first-child) { display: inline-flex; align-items: center; gap: 7px; }
  .pfa-ovkey i { flex: none; display: inline-block; width: 18px; height: 0; border-top: 1.5px solid var(--ink-3); opacity: 0.8; }
  .pfa-ovkey i.on { border-top: 2.5px solid var(--memory); opacity: 1; }
  .pfa-bign input { width: 120px; }
  .pfa-pw { margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--line); }
  .pfa-dimctl { opacity: 0.45; transition: opacity 0.2s; }
  @media (max-width: 720px) { .pfa-ownrow { flex: 1 1 100%; } }
  /* phones: each table row becomes a small card (row name, then label: value lines), so no column hides off-screen */
  @media (max-width: 600px) {
    .entry-body .pfa-stk { position: relative; overflow: visible; }
    .entry-body .pfa-stk table, .entry-body .pfa-stk tbody, .entry-body .pfa-stk tr { display: block; width: auto; }
    .entry-body .pfa-stk thead { display: block; left: 0; top: 0; position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
    .entry-body .pfa-stk tr { padding: 9px 12px 8px; border-bottom: 1px solid var(--line); }
    .entry-body .pfa-stk tr:last-child { border-bottom: 0; }
    .entry-body .pfa-stk td, .entry-body .pfa-stk td.num { display: block; overflow: hidden; padding: 2px 0; border: 0; text-align: right; white-space: normal; }
    .entry-body .pfa-stk td::before { content: attr(data-label); float: left; margin-right: 14px; text-align: left; font: 500 11px/1.75 var(--font-mono); color: var(--ink-3); }
    .entry-body .pfa-stk td:first-child { text-align: left; padding: 0 0 4px; font-weight: 600; color: var(--ink); }
    .entry-body .pfa-stk td:first-child::before { content: none; }
  }
  @media (max-width: 720px) {
    .pfa-eq { font-size: 12.5px; padding: 12px 8px; gap: 6px 8px; }
    .pfa-legend { font-size: 10.5px; gap: 3px 12px; }
    .pfa-gauge { grid-template-columns: minmax(0, 1fr) 52px; gap: 4px 8px; font-size: 11px; }
    .pfa-gauge > span:first-child { grid-column: 1 / -1; }
    .pfa-card { grid-template-columns: 20px minmax(0, 1fr); padding: 8px 10px; }
    .pfa-card .m { font-size: 12px; }
  }
  `);

  /* ═════════════════════════ helpers ═════════════════════════ */
  const r2 = (v) => Math.round(v * 100) / 100;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const lg = Math.log10;
  const tw = (s, fs) => String(s).length * fs * 0.6; // JetBrains Mono advance ≈ 0.6 em
  const guard = (fn, label) => { try { fn(); } catch (e) { console.error('[pf-a] ' + (label || '') + ' ' + ((e && e.stack) || e)); } };
  const fI = (n) => GG.fmt.int(n);
  const num = (v, d) => Number(v).toLocaleString('en-US', { maximumFractionDigits: d == null ? 2 : d });
  const sg = (v, s) => Number(Number(v).toPrecision(s || 3)).toLocaleString('en-US', { maximumFractionDigits: 12 });
  const rp = (v, s) => Number(Number(v).toPrecision(s || 3)); // round to s significant digits, as a number
  const pct = (x, d) => {
    if (!isFinite(x)) return '—';
    const v = x * 100;
    if (v !== 0 && Math.abs(v) < 0.1) return sg(v, 2) + '%';
    return (d == null ? (v < 10 ? v.toFixed(1) : v.toFixed(0)) : v.toFixed(d)).replace(/\.0+$/, '') + '%';
  };
  const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
  function sci(x, d) {
    if (!isFinite(x)) return '—';
    if (x === 0) return '0';
    const [m, e] = x.toExponential(d == null ? 2 : d).split('e');
    const mm = String(+m);
    if (+e === 0) return mm;
    return (mm === '1' ? '' : mm + ' × ') + '10' + String(+e).split('').map((c) => SUP[c] || c).join('');
  }
  /* seconds → ns / μs / ms / s, 3 significant digits */
  function fmtT(s, d) {
    if (!isFinite(s)) return '—';
    const a = Math.abs(s), p = d || 3;
    if (a === 0) return '0 s';
    if (a < 1e-6) return sg(s * 1e9, p) + ' ns';
    if (a < 1e-3) return sg(s * 1e6, p) + ' μs';
    if (a < 1) return sg(s * 1e3, p) + ' ms';
    return sg(s, p) + ' s';
  }
  /* decimal bytes (the glossary's TB = 10¹² bytes) */
  function fmtB(n, d) {
    const u = [[1e15, 'PB'], [1e12, 'TB'], [1e9, 'GB'], [1e6, 'MB'], [1e3, 'kB']];
    for (const [v, p] of u) if (Math.abs(n) >= v) return sg(n / v, d || 3) + ' ' + p;
    return sg(n, d || 3) + ' B';
  }
  /* binary bytes, for on-chip capacities */
  function fmtBi(n) {
    const u = [[2 ** 40, 'TiB'], [2 ** 30, 'GiB'], [2 ** 20, 'MiB'], [2 ** 10, 'KiB']];
    for (const [v, p] of u) if (Math.abs(n) >= v) return sg(n / v, 3) + ' ' + p;
    return sg(n, 3) + ' B';
  }
  function fmtRate(f, d) { // FLOP/s
    const u = [[1e18, 'EFLOP/s'], [1e15, 'PFLOP/s'], [1e12, 'TFLOP/s'], [1e9, 'GFLOP/s'], [1e6, 'MFLOP/s']];
    for (const [v, p] of u) if (f >= v) return sg(f / v, d || 3) + ' ' + p;
    return sg(f, d || 3) + ' FLOP/s';
  }
  function fmtBW(b, d) {
    if (b >= 1e15) return sg(b / 1e15, d || 3) + ' PB/s';
    if (b >= 1e12) return sg(b / 1e12, d || 3) + ' TB/s';
    return sg(b / 1e9, d || 3) + ' GB/s';
  }
  function fmtF(n) { // a count of FLOPs
    if (n < 1e6) return fI(n) + ' FLOPs';
    return sci(n, 2) + ' FLOPs';
  }
  function fmtAI(v) {
    if (!isFinite(v)) return '—';
    if (v < 1) return sg(v, 2);
    if (v < 1000) return sg(v, 3);
    return fI(v);
  }
  const plural = (n, one, many) => (n === 1 ? one : many || one + 's');
  const fpw = (v) => (fmtAI(v) === '1' ? 'FLOP' : 'FLOPs'); // "1 FLOP per byte", "2 FLOPs per byte"

  /* links for HTML written after boot (why-lines): fully decorated, since boot only decorates once */
  function tl(id, text) {
    const t = GG.byId && GG.byId[id];
    const c = t && GG.SECTIONS[t.section] ? GG.SECTIONS[t.section].color : 'var(--accent)';
    return `<a class="term" href="#${id}" data-term="${id}" style="--c:${c}">${text == null ? GG.name(id) : text}</a>`;
  }
  const xl = (href, text) => `<a class="ext" href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;

  /* SVG primitives */
  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }
  function G(p, a) { return GG.svg('g', a || null, p); }
  function R(p, x, y, w, h, st, a) {
    const o = { x: r2(x), y: r2(y), width: r2(Math.max(0, w)), height: r2(Math.max(0, h)) };
    if (a) Object.assign(o, a);
    const el = GG.svg('rect', o, p);
    if (st) el.setAttribute('style', st);
    return el;
  }
  function C(p, cx, cy, r, st) { const el = GG.svg('circle', { cx: r2(cx), cy: r2(cy), r: r2(r) }, p); el.setAttribute('style', st || 'fill:var(--ink)'); return el; }
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
    const a = { x: r2(x), y: r2(y), 'font-size': o.fs || 11 };
    if (o.anchor) a['text-anchor'] = o.anchor;
    if (o.base) a['dominant-baseline'] = o.base;
    if (o.tf) a.transform = o.tf;
    const el = GG.svg('text', a, p);
    el.textContent = s;
    let st = 'fill:' + (o.fill || 'var(--ink-2)') + ';';
    if (o.weight) st += 'font-weight:' + o.weight + ';';
    if (o.font) st += 'font-family:' + o.font + ';';
    if (o.ls) st += 'letter-spacing:' + o.ls + ';';
    if (o.op != null) st += 'opacity:' + o.op + ';';
    if (o.halo) st += 'paint-order:stroke;stroke:var(--bg);stroke-width:3.5px;stroke-linejoin:round;';
    st += 'pointer-events:none;';
    el.setAttribute('style', st);
    return el;
  }
  function arrowHead(p, x, y, ang, size, fill) {
    const s = size || 6;
    const bx = x - Math.cos(ang) * s, by = y - Math.sin(ang) * s;
    const px = Math.cos(ang + Math.PI / 2) * s * 0.55, py = Math.sin(ang + Math.PI / 2) * s * 0.55;
    return Pa(p, `M${r2(x)},${r2(y)}L${r2(bx + px)},${r2(by + py)}L${r2(bx - px)},${r2(by - py)}Z`, 'fill:' + fill + ';stroke:none');
  }

  /* An SVG that rebuilds itself at the stage's content width. build(svg, w) returns the height. */
  function rsvg(stage, label, build) {
    const svg = GG.svg('svg', { class: 'pfa-svg', role: 'img', 'aria-label': label }, stage);
    let w0 = 0;
    function draw(w) {
      w0 = w;
      clear(svg);
      let h = 40;
      try { h = build(svg, w) || 40; } catch (e) { console.error('[pf-a] figure build failed: ' + ((e && e.stack) || e)); }
      h = Math.ceil(h);
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.setAttribute('width', String(w));
      svg.setAttribute('height', String(h));
    }
    GG.resize(stage, (r) => { const w = Math.floor(r.width); if (w >= 60 && w !== w0) draw(w); });
    return { svg, redraw() { if (w0) draw(w0); }, get w() { return w0; } };
  }
  /* GG.tableHTML plus a data-label on every cell (its column's header), for the stacked phone layout */
  function TB(inner) {
    const t = document.createElement('template');
    t.innerHTML = GG.tableHTML(inner);
    const wrap = t.content.firstElementChild;
    wrap.classList.add('pfa-stk');
    const heads = Array.from(wrap.querySelectorAll('thead th')).map((th) => th.textContent.trim());
    wrap.querySelectorAll('tbody tr').forEach((tr) => Array.from(tr.children).forEach((td, i) => { if (heads[i]) td.setAttribute('data-label', heads[i]); }));
    return wrap.outerHTML;
  }
  function mkFig(ctx, slot, opts) { const f = ctx.figure(slot, opts); if (slot && slot.parentNode) slot.replaceWith(f.root); return f; }
  function legend(parent, items) {
    const d = GG.el('div', { class: 'pfa-legend' });
    d.innerHTML = items.map((it) => `<span><i class="${it[2] || ''}" style="--sw:${it[0]}"></i>${it[1]}</span>`).join('');
    parent.appendChild(d);
    return d;
  }
  const stat = (f, label, tone) => GG.ui.stat(f.readouts, { label, value: '—', tone });
  function presets(parent, label, items, onPick) {
    const wrap = GG.el('div', { class: 'ctl' });
    wrap.append(GG.el('span', { class: 'ctl-lab', text: label }));
    const row = GG.el('div', { class: 'pfa-presets' });
    const btns = items.map((it) => {
      const b = GG.ui.button(row, { label: it.label, title: it.title, onClick: () => onPick(it) });
      b.setAttribute('aria-pressed', 'false');
      return [it, b];
    });
    wrap.append(row);
    parent.append(wrap);
    return { el: wrap, mark(fn) { btns.forEach(([it, b]) => b.setAttribute('aria-pressed', String(!!fn(it)))); } };
  }
  /* log axis ticks (decades) between lo and hi */
  function decades(lo, hi) { const out = []; for (let e = Math.ceil(lg(lo) - 1e-9); e <= Math.floor(lg(hi) + 1e-9); e++) out.push(10 ** e); return out; }
  const RFC = () => GG.components && GG.components.roofline;

  /* H100 SXM numbers from the glossary (989 TFLOPS dense BF16 Tensor Core, 66.9 TFLOPS FP32 CUDA Core, 3.35 TB/s) */
  const H100 = { tc: 989e12, cc: 66.9e12, bw: 3.35e12 };

  /* ═════════════════════════ PERFORMANCE BOTTLENECK ═════════════════════════ */

  GG.entry('performance-bottleneck', {
    render(body, ctx) {
      const s = ctx.html(body, `
<p>Pour from a bottle and the liquid leaves no faster than the narrow neck lets it. The wide body holds most of the liquid, yet making the body wider still would not pour it one drop faster. A <strong>performance bottleneck</strong> is the same thing in any system that completes tasks: the one part whose limited rate caps the rate of the whole.</p>
<div data-slot="f1"></div>
<p>Two lessons from Fig.&nbsp;1 carry over to everything in this chapter. First, the bottleneck alone sets the pace: widening any other part changes nothing. Second, a bottleneck can move. Widen the neck past the body and the body becomes the narrowest part, so now <em>it</em> is the bottleneck.</p>
<h3>Determine, elevate, repeat</h3>
<p>Bottlenecks are the target of performance optimization, because speeding up anything else leaves the overall rate where it was. The textbook approach to optimization is a loop:</p>
<ol>
  <li><strong>determine</strong> the bottleneck,</li>
  <li><strong>elevate</strong> the bottleneck until it is no longer such, and</li>
  <li><strong>repeat</strong> on the new bottleneck.</li>
</ol>
<p>Fig.&nbsp;2 runs that loop on the input pipeline of a model-training job, a place where bottlenecks are notoriously common. Each station can finish a fixed number of batches per second. Press <em>Elevate the bottleneck</em> to double the slowest station and watch where the queue forms next. Then click a station that is <em>not</em> the bottleneck to see what speeding up the wrong thing buys you.</p>
<div data-slot="f2"></div>
<p>The pipeline makes two things visible. Work piles up in front of the bottleneck, and the stations upstream of it stall, because there is nowhere to put their output. Downstream, stations starve for input. Every station's busy fraction is simply the line's throughput divided by its own capacity, so only the bottleneck is busy all of the time.</p>
<p>This approach is formalized in, for instance, the <a href="https://en.wikipedia.org/wiki/Theory_of_constraints">"Theory of Constraints" by Eliyahu Goldratt</a>, which helped <a href="https://www.leanproduction.com/theory-of-constraints/">transmit the Toyota approach to manufacturing to manufacturers worldwide</a>, and <a href="https://youtu.be/1jU7iUr-0xE">thence to software engineering and operations</a>.</p>
${GG.noteHTML('beyond', `<p>Goldratt introduced the Theory of Constraints in his 1984 business novel <i>The Goal</i>. Its "five focusing steps" are a longer version of the glossary's loop: <b>identify</b> the constraint, <b>exploit</b> it (get the most out of it as it is), <b>subordinate</b> everything else to it (for example, stop upstream stations from overproducing), <b>elevate</b> it, and <b>repeat</b>, without letting inertia become the new constraint. Fig.&nbsp;2 folds exploiting and elevating into one button.</p>`)}
<h3>Compute, memory and overhead</h3>
<p>In <a href="https://youtu.be/139UPjoq7Kw?t=1229">this talk for Jane Street</a>, Horace He broke down the work done by the <a data-term="kernel">kernels</a> of programs run on GPUs into three categories:</p>
<ul>
  <li><strong class="c-core">Compute</strong>: running floating point operations on <a data-term="cuda-core">CUDA Cores</a> or <a data-term="tensor-core">Tensor Cores</a>.</li>
  <li><strong class="c-memory">Memory</strong>: moving data in the system's <a data-term="memory-hierarchy">memory hierarchy</a>.</li>
  <li><strong class="c-control">Overhead</strong>: everything else.</li>
</ul>
<p>And so for GPU kernels, performance bottlenecks fall into three main categories. ("Main", because the glossary adds an asterisk that we come back to at the end.)</p>
<ul>
  <li><a data-term="compute-bound">Compute-bound</a> kernels are bottlenecked by the <a data-term="arithmetic-bandwidth">arithmetic bandwidth</a> of compute units, like large matrix-matrix multiplication.</li>
  <li><a data-term="memory-bound">Memory-bound</a> kernels are bottlenecked by the <a data-term="memory-bandwidth">bandwidth of memory subsystems</a>, like large vector-vector multiplication.</li>
  <li><a data-term="overhead">Overhead-bound</a> kernels are bottlenecked by latency, like small array operations.</li>
</ul>
<p>Which category a kernel lands in depends on what it computes and on how big its inputs are. Fig.&nbsp;3 estimates all three costs for the glossary's examples on an H100 and marks the largest: that one is the bottleneck.</p>
<div data-slot="f3"></div>
<p>In a large matrix multiplication every number loaded from memory takes part in thousands of multiply-adds, so the math takes longer than the data movement. A vector-vector multiplication does a single multiplication per pair of numbers it loads, so the cores wait on the memory system. Shrink the arrays and both of those costs fall to nanoseconds; what remains is the fixed cost of getting a kernel launched and finished at all. That is a latency, not a bandwidth, which is why small array operations are overhead-bound. Slide <i>N</i> down on the vector operation to watch a large vector-vector multiplication turn into a small array operation.</p>
${GG.noteHTML('beyond', `<p>Horace He also wrote the same three-way split up in his essay <a href="https://horace.io/brrr_intro.html"><i>Making Deep Learning Go Brrrr From First Principles</i></a> (2022). Fig.&nbsp;3 is a deliberately crude version of that way of thinking: it treats the three costs as overlapping perfectly, so the largest one alone sets the time, and it counts each operand crossing the memory bus exactly once.</p>`)}
<h3>What a roofline shows</h3>
<p><a data-term="roofline-model">Roofline model</a> analysis helps quickly identify whether a program's performance is bottlenecked by compute (the <a data-term="arithmetic-bandwidth">arithmetic bandwidth</a>) or by <a data-term="memory-bandwidth">memory bandwidth</a>. The glossary opens this entry with a roofline diagram; Fig.&nbsp;4 places the three kernels from Fig.&nbsp;3 on one. The horizontal axis is <a data-term="arithmetic-intensity">arithmetic intensity</a>, the FLOPs a kernel performs per byte it moves; the two lines, the <em>roofs</em>, are the most performance the hardware could possibly deliver at each intensity.</p>
<div data-slot="f4"></div>
<p>The matrix multiplication sits under the flat compute roof, the large vector multiplication under the slanted memory roof. The small array operation has exactly the same arithmetic intensity as the large vector multiplication, so it sits under the same roof, but it reaches only a couple of percent of it. Its bottleneck, launch latency, is not a bandwidth, so it has no roof of its own: on a roofline, overhead shows up as the gap between a kernel and the roof above it.</p>
<h3>Any resource can be the neck</h3>
<p>Of course, <em>any</em> resource can become a bottleneck. For instance, power ingress and heat egress can and do bottleneck some GPUs below their theoretical maximum performance. <a href="https://developer.nvidia.com/blog/nvidia-sets-new-generative-ai-performance-and-scale-records-in-mlperf-training-v4-0/">This article from NVIDIA</a> explains a 4% end-to-end performance improvement from redirecting power from the L2 cache to the <a data-term="streaming-multiprocessor">Streaming Multiprocessors</a>, and <a href="https://www.thonking.ai/p/strangely-matrix-multiplications">this article from Horace He</a> shows that matrix multiplication performance varies with the input data, through the amount of power demanded by transistor switching. But compute and memory are the most important resources, and the most common bottlenecks.</p>
<div data-slot="f5"></div>
<div data-slot="reading"></div>`);

      guard(() => pbBottle(ctx, s.f1), 'bottle');
      guard(() => pbPipeline(ctx, s.f2), 'pipeline');
      guard(() => pbCategories(ctx, s.f3), 'categories');
      guard(() => pbRoofline(ctx, s.f4), 'roofline');
      guard(() => pbFlows(ctx, s.f5), 'flows');
      ctx.reading(s.reading, [
        { href: 'https://people.eecs.berkeley.edu/~kubitron/cs252/handouts/papers/RooflineVyNoYellow.pdf', label: 'Williams, Waterman and Patterson (2008), <i>Roofline: An Insightful Visual Performance Model for Multicore Architectures</i>', note: 'the paper the glossary\'s roofline diagram is adapted from' },
        { href: 'https://en.wikipedia.org/wiki/Theory_of_constraints', label: 'Theory of constraints (Wikipedia)', note: 'Goldratt\'s formalization of determine, elevate, repeat' },
        { href: 'https://www.leanproduction.com/theory-of-constraints/', label: 'Lean Production: Theory of Constraints', note: 'how it spread through manufacturing' },
        { href: 'https://youtu.be/1jU7iUr-0xE', label: 'The Theory of Constraints in software engineering and operations (video)', note: 'the glossary\'s link for its spread to software' },
        { href: 'https://youtu.be/139UPjoq7Kw?t=1229', label: 'Horace He\'s talk for Jane Street (from 20:29)', note: 'compute, memory and overhead' },
        { href: 'https://horace.io/brrr_intro.html', label: 'Horace He, <i>Making Deep Learning Go Brrrr From First Principles</i>', note: 'the same three categories in essay form (Beyond the glossary)' },
        { href: 'https://developer.nvidia.com/blog/nvidia-sets-new-generative-ai-performance-and-scale-records-in-mlperf-training-v4-0/', label: 'NVIDIA: MLPerf Training v4.0 records', note: 'power moved from the L2 cache to the SMs for 4% end to end' },
        { href: 'https://www.thonking.ai/p/strangely-matrix-multiplications', label: 'Horace He: matmul speed depends on the data', note: 'transistor switching power as a bottleneck' },
      ]);
    },
  });

  /* Fig: a bottle and its neck (canvas particles; flux is conserved, so speed ∝ 1 / local width) */
  function pbBottle(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'A bottle and its neck', hint: 'widen the neck · widen the body', wide: true,
      caption: 'A toy model of pouring. The liquid can move no faster than a fixed top speed, and it cannot pile up or thin out, so the same amount crosses every cross-section each second: it creeps through the wide body and races through the narrow part. The narrowest cross-section, marked in red, times that top speed sets the flow. Each dot trails a streak as long as the distance it covers in 0.07 s.',
    });
    const wrap = GG.el('div', { class: 'pfa-cv' });
    f.stage.append(wrap);
    const cv = GG.canvas(wrap, { height: (w) => (w < 520 ? 180 : 214), label: 'A bottle lying on its side, pouring to the right. Dots of liquid move slowly through the wide body and quickly through the narrow neck.' });
    const st = { neck: 0.2, body: 0.9 };
    const MAXP = 1600;
    const P = { x: new Float32Array(MAXP), u: new Float32Array(MAXP), y: new Float32Array(MAXP), vy: new Float32Array(MAXP), fall: new Uint8Array(MAXP), on: new Uint8Array(MAXP) };
    let geo = null, spawnAcc = 0, seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const VMAX = 120; // px per second through the narrowest section
    const RHO = 0.0042; // dots per px² of liquid

    function layout() {
      const W = cv.w, H = cv.h;
      const mob = W < 520;
      const Hmax = H * (mob ? 0.62 : 0.66), mid = H * 0.47;
      const xB0 = W * 0.05, xB1 = W * (mob ? 0.46 : 0.5), xN0 = W * (mob ? 0.62 : 0.64), xN1 = W * (mob ? 0.86 : 0.88);
      const hb = (st.body * Hmax) / 2, hn = (st.neck * Hmax) / 2;
      const hw = (x) => {
        if (x <= xB1) return hb;
        if (x >= xN0) return hn;
        const t = (x - xB1) / (xN0 - xB1), sm = t * t * (3 - 2 * t);
        return hb + (hn - hb) * sm;
      };
      const hmin = Math.min(hb, hn);
      geo = { W, H, mob, Hmax, mid, xB0, xB1, xN0, xN1, hb, hn, hw, hmin, Q: VMAX * 2 * hmin };
    }
    function fill() {
      // pre-populate the liquid at uniform density, so even the first (or a reduced-motion) frame is full
      for (let i = 0; i < MAXP; i++) P.on[i] = 0;
      const { xB0, xN1, hw } = geo;
      let area = 0;
      for (let x = xB0; x < xN1; x += 2) area += 2 * hw(x) * 2;
      let n = Math.min(MAXP - 60, Math.round(area * RHO)), k = 0, guardN = 0;
      while (k < n && guardN++ < 20000) {
        const x = xB0 + rnd() * (xN1 - xB0);
        // accept with probability ∝ local width, so density is uniform per area
        if (rnd() > hw(x) / Math.max(geo.hb, geo.hn)) continue;
        P.x[k] = x; P.u[k] = rnd() * 2 - 1; P.fall[k] = 0; P.on[k] = 1; k++;
      }
    }
    function spawn(n) {
      for (let i = 0; i < MAXP && n > 0; i++) {
        if (P.on[i]) continue;
        P.on[i] = 1; P.fall[i] = 0; P.x[i] = geo.xB0 + 1 + rnd() * 2; P.u[i] = rnd() * 2 - 1; n--;
      }
    }
    function step(dt) {
      const { hw, Q, xN1, H, mid } = geo;
      spawnAcc += Q * RHO * dt;
      const k = Math.floor(spawnAcc); spawnAcc -= k;
      spawn(k);
      for (let i = 0; i < MAXP; i++) {
        if (!P.on[i]) continue;
        if (!P.fall[i]) {
          const v = Q / (2 * hw(P.x[i]));
          P.x[i] += v * dt;
          if (P.x[i] >= xN1) { P.fall[i] = 1; P.y[i] = mid + P.u[i] * hw(xN1) * 0.86; P.vy[i] = 0; }
        } else {
          P.x[i] += (Q / (2 * geo.hn)) * dt * 0.55;
          P.vy[i] += 520 * dt;
          P.y[i] += P.vy[i] * dt;
          if (P.y[i] > H + 4 || P.x[i] > geo.W + 4) P.on[i] = 0;
        }
      }
    }
    function draw() {
      if (!geo || !cv.w) return;
      const c = GG.colors(), g = cv.ctx, { W, H, mob, mid, xB0, xB1, xN0, xN1, hw, hb, hn } = geo;
      g.clearRect(0, 0, W, H);
      // glass
      const pts = [];
      for (let x = xB0; x <= xN1 + 0.1; x += 2) pts.push([x, hw(x)]);
      const glass = 5;
      g.beginPath();
      g.moveTo(xB0 - glass, mid - hb - glass);
      pts.forEach(([x, h]) => g.lineTo(x, mid - h - glass));
      g.lineTo(xN1 + 3, mid - hn - glass - 2);
      g.lineTo(xN1 + 3, mid + hn + glass + 2);
      for (let i = pts.length - 1; i >= 0; i--) g.lineTo(pts[i][0], mid + pts[i][1] + glass);
      g.lineTo(xB0 - glass, mid + hb + glass);
      g.closePath();
      g.fillStyle = 'rgba(255,255,255,0.045)';
      g.fill();
      g.lineWidth = 1.5;
      g.strokeStyle = GG.alpha(c.ink3, 0.9);
      g.stroke();
      g.beginPath();
      pts.forEach(([x, h], j) => (j ? g.lineTo(x, mid - h) : g.moveTo(x, mid - h)));
      g.strokeStyle = 'rgba(255,255,255,0.12)';
      g.lineWidth = 1;
      g.stroke();
      g.beginPath();
      pts.forEach(([x, h], j) => (j ? g.lineTo(x, mid + h) : g.moveTo(x, mid + h)));
      g.stroke();
      // velocity streaks: each dot trails a line as long as the distance it covers in 0.07 s,
      // so the static (reduced-motion) frame also shows slow liquid in the body and fast liquid in the neck
      g.strokeStyle = GG.alpha(c.memory, 0.38);
      g.lineWidth = 1.2;
      g.beginPath();
      for (let i = 0; i < MAXP; i++) {
        if (!P.on[i] || P.fall[i]) continue;
        const x = P.x[i], y = mid + P.u[i] * hw(x) * 0.86, len = clamp((geo.Q / (2 * hw(x))) * 0.07, 0, 26);
        if (len < 1.5) continue;
        g.moveTo(Math.max(xB0, x - len), y); g.lineTo(x, y);
      }
      g.stroke();
      // liquid dots
      g.fillStyle = GG.alpha(c.memory, 0.9);
      for (let i = 0; i < MAXP; i++) {
        if (!P.on[i]) continue;
        const x = P.x[i], y = P.fall[i] ? P.y[i] : mid + P.u[i] * hw(x) * 0.86;
        g.fillRect(x - 1.4, y - 1.4, 2.8, 2.8);
      }
      // the narrowest section
      const neckIsMin = hn <= hb + 0.01;
      const x0 = neckIsMin ? xN0 : xB0, x1 = neckIsMin ? xN1 : xB1, hh = neckIsMin ? hn : hb;
      g.strokeStyle = c.danger;
      g.lineWidth = 2;
      const yb = mid + hh + glass + 9;
      g.beginPath();
      g.moveTo(x0, yb - 4); g.lineTo(x0, yb); g.lineTo(x1, yb); g.lineTo(x1, yb - 4);
      g.stroke();
      g.font = `600 ${mob ? 10.5 : 11.5}px "JetBrains Mono", ui-monospace, monospace`;
      g.textBaseline = 'top';
      g.textAlign = 'center';
      g.fillStyle = c.danger;
      const lab = neckIsMin ? (mob ? 'neck: sets the flow' : 'narrowest: sets the flow') : (mob ? 'body: now the neck' : 'narrowest: now the body');
      const lx = clamp((x0 + x1) / 2, g.measureText(lab).width / 2 + 2, W - g.measureText(lab).width / 2 - 2);
      g.fillText(lab, lx, yb + 5);
      // labels
      g.textBaseline = 'alphabetic';
      g.fillStyle = c.ink3;
      g.font = `500 ${mob ? 10 : 11}px "JetBrains Mono", ui-monospace, monospace`;
      g.textAlign = 'center';
      g.fillText('body', (xB0 + xB1) / 2, mid - hb - glass - 8);
      g.fillText('neck', (xN0 + xN1) / 2, mid - hn - glass - 8);
      g.textAlign = 'left';
      if (!mob) g.fillText('pours out →', xN1 + 10, mid - hn - glass - 8);
    }
    const sQ = stat(f, 'flow'), sN = stat(f, 'narrowest part', 'danger'), sV = stat(f, 'speed in the body');
    function why() {
      const Q = Math.min(st.body, st.neck);
      const Q0 = Math.min(0.9, 0.2);
      sQ.set('×' + num(Q / Q0, 2));
      const neckIsMin = st.neck <= st.body;
      sN.set(neckIsMin ? 'the neck' : 'the body');
      sV.set(pct(Q / st.body, 0) + ' of top speed');
      if (neckIsMin) {
        f.setWhy(`The neck is <b>${pct(st.neck / st.body, 0)}</b> as wide as the body, so the liquid in the body creeps along at ${pct(st.neck / st.body, 0)} of its speed in the neck. Flow = top speed × the narrowest width, so it is <b>×${num(Q / Q0, 2)}</b> the starting flow. Widening the body only adds volume; widening the neck is the only way to pour faster.`);
      } else {
        f.setWhy(`Now the neck is wider than the body, so the <b>body</b> is the narrowest part and sets the flow (<b>×${num(Q / Q0, 2)}</b> the starting flow). The neck's extra width buys nothing: the bottleneck has moved.`);
      }
    }
    const anim = GG.anim(cv.canvas, (t, dt) => { step(Math.min(dt, 0.05)); draw(); });
    GG.ui.slider(f.controls, { label: 'neck width', min: 6, max: 100, step: 1, value: st.neck * 100, format: (v) => Math.round(v) + '%', onInput: (v) => { st.neck = v / 100; layout(); if (!anim.running) { fill(); draw(); } why(); } });
    GG.ui.slider(f.controls, { label: 'body width', min: 6, max: 100, step: 1, value: st.body * 100, format: (v) => Math.round(v) + '%', onInput: (v) => { st.body = v / 100; layout(); if (!anim.running) { fill(); draw(); } why(); } });
    GG.ui.playButton(f.controls, anim);
    cv.onResize(() => { layout(); fill(); draw(); });
    why();
  }

  /* Fig: determine → elevate → repeat on a four-station pipeline (deterministic discrete simulation) */
  const PB_ST = [
    { id: 'read', name: 'Read files', where: 'storage', color: 'memory', cap: 9, how: ['cache the dataset in RAM', 'store it as larger, sequential shards', 'read from local NVMe instead of network storage'] },
    { id: 'cpu', name: 'Decode & augment', where: 'CPU', color: 'host', cap: 3, how: ['add data-loader worker processes', 'use a faster image decoder', 'move augmentation onto the GPU'] },
    { id: 'copy', name: 'Copy to GPU', where: 'PCIe', color: 'memory', cap: 13, how: ['copy from pinned (page-locked) host memory', 'copy in fewer, larger transfers', 'send smaller, lower-precision data'] },
    { id: 'gpu', name: 'Training step', where: 'GPU', color: 'core', cap: 7, how: ['use mixed precision on the Tensor Cores', 'fuse small kernels and capture a CUDA Graph', 'move to a faster GPU'] },
  ];
  function pbPipeline(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Determine, elevate, repeat', hint: 'elevate · click any station', wide: true,
      caption: 'A training job\'s input pipeline as four stations, each finishing a fixed number of batches per second, with room for three batches between stations. Upstream of the bottleneck the buffers fill and stations stall (amber: done, but nowhere to put the batch); downstream they starve (idle, waiting for input). The capacities and the fixes attached to them are illustrative. The simulation runs at 0.4× speed. The step chart under the log records the line\'s throughput after each elevation, coloured by the station that was elevated.',
    });
    const BUF = 3, SPEED = 0.4;
    const S = { caps: PB_ST.map((x) => x.cap), used: PB_ST.map(() => 0), steps: 0, log: [], hist: [] };
    let sim;
    function resetSim() {
      sim = { st: PB_ST.map(() => ({ busy: false, t: 0, done: false })), buf: [0, 0, 0], out: 0 };
      advance(8);
    }
    const thr = () => Math.min(...S.caps);
    const bottleneck = () => { const T = thr(); return S.caps.findIndex((c) => c === T); };
    function tickSim(dt) {
      const n = S.caps.length;
      for (let i = n - 1; i >= 0; i--) {
        const x = sim.st[i];
        let carry = 0;
        if (x.busy) { x.t -= dt; if (x.t <= 0) { carry = -x.t; x.busy = false; x.done = true; } }
        if (x.done) {
          if (i === n - 1) { sim.out++; x.done = false; }
          else if (sim.buf[i] < BUF) { sim.buf[i]++; x.done = false; }
        }
        if (!x.busy && !x.done) {
          if (i === 0) { x.busy = true; x.t = 1 / S.caps[i] - carry; }
          else if (sim.buf[i - 1] > 0) { sim.buf[i - 1]--; x.busy = true; x.t = 1 / S.caps[i] - carry; }
        }
      }
    }
    function advance(t) { const h = 1 / 240; while (t > 1e-9) { const d = Math.min(h, t); tickSim(d); t -= d; } }

    resetSim();
    const logEl = GG.el('div', { class: 'pfa-log', 'aria-live': 'polite' });
    let E = null;
    const view = rsvg(f.stage, 'A pipeline of four stations: read files, decode and augment on the CPU, copy to the GPU, and the training step. The slowest station is outlined in red as the bottleneck.', (svg, w) => {
      const mob = w < 640;
      const n = PB_ST.length, T = thr(), b = bottleneck();
      E = { st: [], slots: [], mob };
      let H;
      const geo = [];
      if (!mob) {
        const srcW = 18, sinkW = 50, bufW = 30, top = 22, boxH = 128;
        const boxW = (w - srcW - sinkW - (n - 1) * bufW) / n;
        for (let i = 0; i < n; i++) geo.push({ x: srcW + i * (boxW + bufW), y: top, w: boxW, h: boxH });
        const cy = top + boxH / 2;
        Ln(svg, 1, cy, srcW - 5, cy, 'stroke:var(--ink-3);stroke-width:1.5');
        arrowHead(svg, srcW - 2, cy, 0, 7, 'var(--ink-3)');
        const lx = geo[n - 1].x + boxW;
        Ln(svg, lx + 3, cy, lx + 12, cy, 'stroke:var(--ink-3);stroke-width:1.5');
        arrowHead(svg, lx + 15, cy, 0, 7, 'var(--ink-3)');
        E.doneLab = Tx(svg, lx + 18, cy - 14, 'done', { fs: 9.5, fill: 'var(--ink-3)' });
        E.done = Tx(svg, lx + 18, cy + 4, '0', { fs: 12, fill: 'var(--ink)', weight: 600 });
        for (let i = 0; i < n - 1; i++) {
          const x0 = geo[i].x + boxW, x1 = geo[i + 1].x, cx = (x0 + x1) / 2;
          Ln(svg, x0 + 1, cy, x1 - 4, cy, 'stroke:var(--line-2);stroke-width:1.5');
          arrowHead(svg, x1 - 1, cy, 0, 6, 'var(--line-2)');
          const sw = 10, gap = 3, tot = BUF * sw + (BUF - 1) * gap, sy = cy - tot / 2;
          const col = [];
          // fill from the bottom up, like a stack
          for (let k = 0; k < BUF; k++) col.push(R(svg, cx - sw / 2, sy + (BUF - 1 - k) * (sw + gap), sw, sw, 'fill:var(--bg);stroke:var(--line-2);stroke-width:1', { rx: 2 }));
          E.slots.push(col);
          Tx(svg, cx, sy + tot + 13, 'queue', { fs: 8.5, anchor: 'middle', fill: 'var(--ink-3)' });
        }
        H = top + boxH + 6;
      } else {
        const srcH = 20, sinkH = 26, bufH = 34, boxH = 74;
        for (let i = 0; i < n; i++) geo.push({ x: 0, y: srcH + i * (boxH + bufH), w: w, h: boxH });
        Ln(svg, w / 2, 2, w / 2, srcH - 4, 'stroke:var(--ink-3);stroke-width:1.5');
        arrowHead(svg, w / 2, srcH - 2, Math.PI / 2, 7, 'var(--ink-3)');
        Tx(svg, w / 2 + 8, 12, 'files', { fs: 9.5, fill: 'var(--ink-3)' });
        const ly = geo[n - 1].y + boxH;
        Ln(svg, w / 2, ly + 3, w / 2, ly + 13, 'stroke:var(--ink-3);stroke-width:1.5');
        arrowHead(svg, w / 2, ly + 15, Math.PI / 2, 7, 'var(--ink-3)');
        E.doneLab = Tx(svg, w / 2 + 10, ly + 16, 'trained:', { fs: 10, fill: 'var(--ink-3)' });
        E.done = Tx(svg, w / 2 + 10 + tw('trained: ', 10), ly + 16, '0', { fs: 11, fill: 'var(--ink)', weight: 600 });
        for (let i = 0; i < n - 1; i++) {
          const y0 = geo[i].y + boxH, y1 = geo[i + 1].y, cx = w / 2;
          Ln(svg, cx, y0 + 2, cx, y1 - 4, 'stroke:var(--line-2);stroke-width:1.5');
          arrowHead(svg, cx, y1 - 2, Math.PI / 2, 6, 'var(--line-2)');
          const sw = 11, gap = 3, tot = BUF * sw + (BUF - 1) * gap, sx = cx + 12, cy = (y0 + y1) / 2;
          const row = [];
          for (let k = 0; k < BUF; k++) row.push(R(svg, sx + k * (sw + gap), cy - sw / 2, sw, sw, 'fill:var(--bg);stroke:var(--line-2);stroke-width:1', { rx: 2 }));
          E.slots.push(row);
          Tx(svg, cx - 10, cy + 4, 'queue', { fs: 9, anchor: 'end', fill: 'var(--ink-3)' });
        }
        H = ly + sinkH;
      }
      // stations
      for (let i = 0; i < n; i++) {
        const d = PB_ST[i], g0 = geo[i], cap = S.caps[i], util = T / cap, isB = i === b;
        const grp = G(svg, { class: 'pfa-st', tabindex: '0', role: 'button', 'aria-label': `${d.name} (${d.where}), ${sg(cap, 3)} batches per second${isB ? ', the bottleneck' : ''}. Press to elevate it.` });
        const tint = R(grp, g0.x, g0.y, g0.w, g0.h, `fill:var(--${d.color});opacity:0.07`, { rx: 10 });
        const box = R(grp, g0.x + 0.5, g0.y + 0.5, g0.w - 1, g0.h - 1, 'fill:none;stroke:' + (isB ? 'var(--danger)' : 'var(--line-2)') + ';stroke-width:' + (isB ? 2 : 1), { rx: 10, class: 'pfa-st-box' });
        R(grp, g0.x - 2.5, g0.y - 2.5, g0.w + 5, g0.h + 5, 'fill:none;stroke:var(--accent);stroke-width:0;opacity:0', { rx: 12, class: 'pfa-st-ring' });
        const pad = mob ? 10 : 12, x0 = g0.x + pad, x1 = g0.x + g0.w - pad;
        let trackY;
        if (!mob) {
          Tx(grp, x0, g0.y + 20, d.name, { fs: d.name.length > 14 && g0.w < 150 ? 11.5 : 12, fill: 'var(--ink)', weight: 600 });
          Tx(grp, x0, g0.y + 35, d.where, { fs: 10.5, fill: `var(--${d.color})` });
          Tx(grp, x0, g0.y + 53, sg(cap, 3) + ' batches/s', { fs: 11, fill: 'var(--ink-2)' });
          R(grp, x0, g0.y + 61, x1 - x0, 6, 'fill:rgba(255,255,255,0.07)', { rx: 3 });
          R(grp, x0, g0.y + 61, (x1 - x0) * util, 6, `fill:var(--${d.color})`, { rx: 3 });
          Tx(grp, x0, g0.y + 81, 'busy ' + pct(util, 0), { fs: 10, fill: isB ? 'var(--danger)' : 'var(--ink-2)', weight: isB ? 600 : null });
          Tx(grp, x0, g0.y + 94, isB ? 'sets the pace' : (i < b ? 'stalled ' : 'starved ') + pct(1 - util, 0), { fs: 10, fill: isB ? 'var(--danger)' : 'var(--ink-3)' });
          trackY = g0.y + 107;
          if (isB) Tx(svg, g0.x + 2, g0.y - 8, 'BOTTLENECK', { fs: 10, fill: 'var(--danger)', weight: 600, ls: '0.1em' });
        } else {
          Tx(grp, x0, g0.y + 19, d.name, { fs: 12, fill: 'var(--ink)', weight: 600 });
          Tx(grp, x0 + tw(d.name, 12) + 7, g0.y + 19, d.where, { fs: 10, fill: `var(--${d.color})` });
          Tx(grp, x1, g0.y + 19, sg(cap, 3) + ' /s', { fs: 11, fill: 'var(--ink-2)', anchor: 'end' });
          R(grp, x0, g0.y + 29, x1 - x0, 6, 'fill:rgba(255,255,255,0.07)', { rx: 3 });
          R(grp, x0, g0.y + 29, (x1 - x0) * util, 6, `fill:var(--${d.color})`, { rx: 3 });
          const ut = isB ? 'busy 100% · BOTTLENECK' : i < b ? `busy ${pct(util, 0)} · stalled ${pct(1 - util, 0)}` : `busy ${pct(util, 0)} · starved ${pct(1 - util, 0)}`;
          Tx(grp, x0, g0.y + 50, ut, { fs: 10, fill: isB ? 'var(--danger)' : 'var(--ink-3)', weight: isB ? 600 : null });
          trackY = g0.y + 62;
        }
        Ln(grp, x0, trackY, x1, trackY, 'stroke:var(--line);stroke-width:1;stroke-dasharray:2 3');
        const item = R(grp, x0, trackY - 5, 10, 10, `fill:var(--${d.color})`, { rx: 2 });
        const park = R(grp, x1 - 10, trackY - 5, 10, 10, 'fill:var(--control)', { rx: 2, visibility: 'hidden' });
        const stateT = mob ? Tx(grp, x1, trackY - 11, '', { fs: 9.5, anchor: 'end', fill: 'var(--control)' }) : Tx(grp, x0, trackY + 15, '', { fs: 9.5, fill: 'var(--control)' });
        grp.addEventListener('click', () => elevate(i));
        grp.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); elevate(i); } });
        E.st.push({ tint, box, item, park, stateT, x0, x1: x1 - 10, last: '' });
      }
      paint();
      return H;
    });
    f.stage.append(logEl);
    /* throughput after every elevation, as a step chart */
    const hist = rsvg(f.stage, 'A step chart of the pipeline throughput after each elevation, each step coloured by the station that was elevated.', (svg, w) => {
      const H = 92, ml = 34, mr = 8, mt = 16, mb = 20, x0 = ml, x1 = w - mr, y0 = mt, y1 = H - mb;
      const pts = [{ T: Math.min(...PB_ST.map((x) => x.cap)), i: -1 }].concat(S.hist);
      const n = Math.max(6, pts.length);
      const Tmax = Math.max(...pts.map((p) => p.T)) * 1.15;
      const X = (j) => x0 + (j / n) * (x1 - x0), Y = (T) => y1 - (T / Tmax) * (y1 - y0);
      Tx(svg, 0, 10, 'throughput after each elevation (batches/s)', { fs: 9.5, fill: 'var(--ink-3)', ls: '0.05em' });
      Ln(svg, x0, y1, x1, y1, 'stroke:var(--line-2)');
      [0].forEach((v) => Tx(svg, x0 - 5, Y(v) + 3.5, String(v), { fs: 9.5, anchor: 'end', fill: 'var(--ink-3)' }));
      pts.forEach((p, j) => {
        const c = p.i < 0 ? 'ink-3' : PB_ST[p.i].color;
        R(svg, X(j) + 1, Y(p.T), Math.max(1, X(j + 1) - X(j) - 2), y1 - Y(p.T), `fill:var(--${c});opacity:${p.i < 0 ? 0.35 : 0.8}`, { rx: 2 });
        if (X(j + 1) - X(j) > 22) Tx(svg, (X(j) + X(j + 1)) / 2, Y(p.T) - 4, sg(p.T, 3), { fs: 9.5, anchor: 'middle', fill: 'var(--ink-2)' });
        if (X(j + 1) - X(j) > 14) Tx(svg, (X(j) + X(j + 1)) / 2, y1 + 13, j === 0 ? 'start' : String(j), { fs: 9, anchor: 'middle', fill: 'var(--ink-3)' });
      });
      return H;
    });
    hist.svg.style.marginTop = '12px';

    function paint() {
      if (!E) return;
      const n = PB_ST.length;
      for (let i = 0; i < n; i++) {
        const x = sim.st[i], e = E.st[i];
        const state = x.busy ? 'work' : x.done ? 'blocked' : 'starved';
        if (x.busy) {
          const p = clamp(1 - x.t * S.caps[i], 0, 1);
          e.item.setAttribute('x', r2(e.x0 + p * (e.x1 - e.x0)));
        }
        if (state !== e.last) {
          e.last = state;
          e.item.setAttribute('visibility', x.busy ? 'visible' : 'hidden');
          e.park.setAttribute('visibility', state === 'blocked' ? 'visible' : 'hidden');
          e.stateT.textContent = state === 'blocked' ? (E.mob ? 'stalled: queue full' : 'queue full') : state === 'starved' ? (E.mob ? 'starved: no input' : 'no input') : '';
          e.stateT.style.fill = state === 'blocked' ? 'var(--control)' : 'var(--ink-3)';
          e.tint.style.opacity = state === 'work' ? '0.13' : '0.04';
        }
      }
      E.slots.forEach((row, j) => row.forEach((r, k) => {
        const on = k < sim.buf[j];
        const want = on ? 'on' : 'off';
        if (r._s !== want) { r._s = want; r.style.fill = on ? 'var(--ink-2)' : 'var(--bg)'; }
      }));
      E.done.textContent = fI(sim.out);
    }

    const sT = stat(f, 'throughput', 'core'), sB = stat(f, 'bottleneck', 'danger'), sX = stat(f, 'speed-up'), sS = stat(f, 'elevations');
    function report(msg) {
      const T = thr(), b = bottleneck();
      sT.set(sg(T, 3) + ' batches/s');
      sB.set(PB_ST[b].name);
      sX.set('×' + num(T / Math.min(...PB_ST.map((x) => x.cap)), 2));
      sS.set(String(S.steps));
      const up = [], down = [];
      S.caps.forEach((c, i) => { if (i < b) up.push(`${PB_ST[i].name} (stalled ${pct(1 - T / c, 0)} of the time)`); else if (i > b) down.push(`${PB_ST[i].name} (starved ${pct(1 - T / c, 0)})`); });
      const d = PB_ST[b];
      let t = (msg ? msg + ' ' : '') + `<b>${d.name}</b> (${d.where}) is the bottleneck: it finishes ${sg(S.caps[b], 3)} batches/s, so the whole line finishes ${sg(T, 3)} batches/s.`;
      if (up.length) t += ` Upstream, ${up.join(' and ')} ${up.length > 1 ? 'wait' : 'waits'} on a full queue.`;
      if (down.length) t += ` Downstream, ${down.join(' and ')} ${down.length > 1 ? 'wait' : 'waits'} for work.`;
      f.setWhy(t);
      logEl.innerHTML = S.log.length ? S.log.slice(-4).map((l) => `<div>${l}</div>`).join('') : '<div>No elevations yet. The bottleneck is outlined in red.</div>';
    }
    function elevate(i) {
      const d = PB_ST[i], before = thr(), wasB = i === bottleneck();
      const how = d.how[Math.min(S.used[i], d.how.length - 1)];
      const old = S.caps[i];
      S.caps[i] = old * 2;
      S.used[i]++;
      S.steps++;
      const after = thr();
      const gain = after > before + 1e-9;
      S.hist.push({ T: after, i });
      S.log.push(`${S.steps}. <b>${d.name}</b> ${sg(old, 3)} → ${sg(S.caps[i], 3)}/s (${S.used[i] > d.how.length ? 'elevate it again' : how}): throughput <span class="${gain ? 'up' : 'flat'}">${sg(before, 3)} → ${sg(after, 3)}</span>`);
      view.redraw(); hist.redraw();
      let msg;
      if (!wasB) msg = `You doubled <b>${d.name}</b>, which was not the bottleneck, so throughput stayed at <b>${sg(after, 3)} batches/s</b> and the station now idles more.`;
      else if (gain) msg = `Elevated <b>${d.name}</b> (${how}): throughput ${sg(before, 3)} → <b>${sg(after, 3)} batches/s</b>.` + (bottleneck() !== i ? ' Repeat on the new bottleneck.' : ' It is still the slowest station: elevate it again.');
      else msg = `Elevated <b>${d.name}</b>, but another station has exactly the same capacity, so throughput stays at <b>${sg(after, 3)} batches/s</b>.`;
      report(msg);
    }
    GG.ui.button(f.controls, { label: 'Elevate the bottleneck', primary: true, onClick: () => elevate(bottleneck()) });
    const anim = GG.anim(f.stage, (t, dt) => { advance(Math.min(dt, 0.05) * SPEED); paint(); });
    GG.ui.playButton(f.controls, anim);
    GG.ui.button(f.controls, { label: 'Reset', icon: 'reset', onClick: () => { S.caps = PB_ST.map((x) => x.cap); S.used = PB_ST.map(() => 0); S.steps = 0; S.log = []; S.hist = []; resetSim(); view.redraw(); hist.redraw(); report(); } });
    report();
  }

  /* Fig: compute vs memory vs overhead for the glossary's three examples */
  function pbCategories(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Which of the three costs is largest?', hint: 'pick an example · slide N', wide: true,
      caption: 'Estimates for an H100 SXM. <b>Compute</b> = FLOPs ÷ arithmetic bandwidth (989 TFLOP/s for BF16 on the Tensor Cores; 66.9 TFLOP/s for FP32 on the CUDA Cores). <b>Memory</b> = bytes ÷ 3.35 TB/s, counting each input and output once. <b>Overhead</b> = the host-side cost of launching one kernel, about 10 μs (see <a data-term="overhead">Overhead</a>), which also caps how often back-to-back kernels can start. The bars are drawn to scale against the largest cost; the strip below repeats the comparison for every N.',
    });
    const OPS = {
      mm: { label: 'matrix × matrix', short: 'C = A @ B', desc: 'C = A @ B with N × N BF16 matrices on the Tensor Cores', flops: (N) => 2 * N ** 3, bytes: (N) => 6 * N * N, F: H100.tc, Fname: '989 TFLOP/s', min: 16, max: 32768, dflt: 8192 },
      vv: { label: 'vector ⊙ vector', short: 'z = x ⊙ y', desc: 'z = x ⊙ y, the elementwise product of two FP32 vectors of length N, on the CUDA Cores', flops: (N) => N, bytes: (N) => 12 * N, F: H100.cc, Fname: '66.9 TFLOP/s', min: 1024, max: 2 ** 32, dflt: 2 ** 28 },
    };
    const st = { op: 'mm', N: { mm: 8192, vv: 2 ** 28 }, oh: 10e-6 };
    const CAT = [
      { k: 'c', name: 'Compute', sub: 'FLOPs ÷ FLOP/s', color: 'core', bound: 'compute-bound' },
      { k: 'm', name: 'Memory', sub: 'bytes ÷ bandwidth', color: 'memory', bound: 'memory-bound' },
      { k: 'o', name: 'Overhead', sub: 'launch latency', color: 'control', bound: 'overhead-bound' },
    ];
    function costs(op, N) {
      const o = OPS[op];
      const fl = o.flops(N), by = o.bytes(N);
      const t = { c: fl / o.F, m: by / H100.bw, o: st.oh };
      const k = t.c >= t.m && t.c >= t.o ? 'c' : t.m >= t.o ? 'm' : 'o';
      return { fl, by, t, k, T: Math.max(t.c, t.m, t.o) };
    }
    const view = rsvg(f.stage, 'Three horizontal bars comparing the estimated compute time, memory time and overhead of one kernel, and a strip showing which is largest for every input size N.', (svg, w) => {
      const mob = w < 560;
      const op = st.op, o = OPS[op], N = st.N[op], cc = costs(op, N);
      const labW = mob ? 0 : 150, valW = mob ? 0 : 210;
      const bx0 = labW, bx1 = w - valW;
      let y = 4;
      CAT.forEach((c) => {
        const t = cc.t[c.k], frac = t / cc.T, isB = c.k === cc.k;
        if (mob) {
          Tx(svg, 0, y + 11, c.name, { fs: 11.5, fill: isB ? 'var(--ink)' : 'var(--ink-2)', weight: 600 });
          Tx(svg, tw(c.name, 11.5) + 8, y + 11, c.sub, { fs: 10, fill: 'var(--ink-3)' });
          Tx(svg, w, y + 11, fmtT(t), { fs: 11.5, anchor: 'end', fill: isB ? 'var(--ink)' : 'var(--ink-2)', weight: isB ? 600 : null });
          y += 17;
        } else {
          Tx(svg, 0, y + 12, c.name, { fs: 12, fill: isB ? 'var(--ink)' : 'var(--ink-2)', weight: 600 });
          Tx(svg, 0, y + 26, c.sub, { fs: 10, fill: 'var(--ink-3)' });
        }
        const bh = mob ? 14 : 20;
        R(svg, bx0, y + 2, bx1 - bx0, bh, 'fill:rgba(255,255,255,0.04)', { rx: 4 });
        R(svg, bx0, y + 2, Math.max(1.5, (bx1 - bx0) * frac), bh, `fill:var(--${c.color});opacity:${isB ? 1 : 0.45}`, { rx: 4 });
        if (isB) {
          const lab = 'bottleneck';
          Tx(svg, bx0 + 8, y + 2 + bh / 2 + 4, lab, { fs: mob ? 10 : 11, fill: '#0b0c12', weight: 700 });
        } else {
          const lx = bx0 + Math.max(1.5, (bx1 - bx0) * frac) + 6;
          Tx(svg, lx, y + 2 + bh / 2 + 4, pct(frac) + ' of the time', { fs: mob ? 10 : 10.5, fill: 'var(--ink-3)' });
        }
        if (!mob) {
          Tx(svg, w, y + 12, fmtT(t), { fs: 12.5, anchor: 'end', fill: isB ? 'var(--ink)' : 'var(--ink-2)', weight: isB ? 600 : null });
          const det = c.k === 'c' ? `${fmtF(cc.fl)} ÷ ${o.Fname}` : c.k === 'm' ? `${fmtB(cc.by)} ÷ 3.35 TB/s` : 'per kernel launch';
          Tx(svg, w, y + 26, det, { fs: 9.5, anchor: 'end', fill: 'var(--ink-3)' });
        }
        y += mob ? bh + 12 : 36;
      });
      // regime strip across N
      y += mob ? 14 : 14;
      Tx(svg, 0, y, mob ? 'Largest cost at every N' : 'Largest cost at every N (log scale)', { fs: 10.5, fill: 'var(--ink-3)', ls: '0.06em' });
      y += 16; // room for the N marker's triangle under the caption
      const sx0 = mob ? 4 : 8, sx1 = w - (mob ? 4 : 8), sh = 22;
      const X = (n) => sx0 + ((lg(n) - lg(o.min)) / (lg(o.max) - lg(o.min))) * (sx1 - sx0);
      let prev = null, segStart = sx0;
      const segs = [];
      const steps = Math.max(60, Math.round(sx1 - sx0));
      for (let i = 0; i <= steps; i++) {
        const n = 10 ** (lg(o.min) + (i / steps) * (lg(o.max) - lg(o.min)));
        const k = costs(op, n).k;
        const x = sx0 + (i / steps) * (sx1 - sx0);
        if (prev == null) prev = k;
        if (k !== prev || i === steps) { segs.push({ k: prev, a: segStart, b: x }); segStart = x; prev = k; }
      }
      const narrow = [];
      segs.forEach((sgm) => {
        const c = CAT.find((q) => q.k === sgm.k);
        R(svg, sgm.a, y, sgm.b - sgm.a, sh, `fill:var(--${c.color});opacity:0.3`);
        const lab = mob ? c.bound.replace('-bound', '') : c.bound, lw0 = tw(lab, 10.5);
        if (sgm.b - sgm.a <= lw0 + 10 && sgm.b - sgm.a >= 1) narrow.push({ c, x: (sgm.a + sgm.b) / 2, lab: c.bound.replace('-bound', '') });
        if (sgm.b - sgm.a > lw0 + 10) {
          // keep the label clear of the N marker
          let cx = (sgm.a + sgm.b) / 2;
          const xm = X(N);
          if (Math.abs(xm - cx) < lw0 / 2 + 8) {
            const l = xm - 8 - lw0 / 2, r = xm + 8 + lw0 / 2;
            cx = l - lw0 / 2 >= sgm.a + 4 ? l : r + lw0 / 2 <= sgm.b - 4 ? r : cx;
          }
          Tx(svg, cx, y + 15, lab, { fs: 10.5, anchor: 'middle', fill: `var(--${c.color})`, weight: 600 });
        }
      });
      R(svg, sx0, y, sx1 - sx0, sh, 'fill:none;stroke:var(--line-2)');
      const xn = X(N);
      Ln(svg, xn, y - 5, xn, y + sh + 5, 'stroke:var(--bg);stroke-width:5');
      Ln(svg, xn, y - 5, xn, y + sh + 5, 'stroke:var(--ink);stroke-width:2');
      Pa(svg, `M${r2(xn - 5)},${r2(y - 9)}h10l-5,6z`, 'fill:var(--ink);stroke:none');
      // ticks
      const ty = y + sh + 16;
      decades(o.min, o.max).forEach((v) => {
        const x = X(v);
        Ln(svg, x, y + sh, x, y + sh + 4, 'stroke:var(--ink-3)');
        const e10 = Math.round(lg(v));
        const lab = v >= 1e5 ? '10' + String(e10).split('').map((ch) => SUP[ch]).join('') : fI(v);
        if (!mob || op !== 'vv' || e10 % 2 === 0) Tx(svg, x, ty, lab, { fs: 10, anchor: 'middle', fill: 'var(--ink-3)' });
      });
      Tx(svg, sx1, ty + 15, 'N →', { fs: 10, anchor: 'end', fill: 'var(--ink-3)' });
      // bands too narrow for their own label get one below the axis, with a leader up to the band
      let extra = 0;
      narrow.forEach((q) => {
        const lw0 = tw(q.lab, 9.5), lx = clamp(q.x - lw0 / 2, sx0, sx1 - tw('N →', 10) - lw0 - 10);
        Ln(svg, q.x, y + sh, q.x, ty + 20, `stroke:var(--${q.c.color});stroke-width:1`);
        Tx(svg, lx, ty + 30, q.lab, { fs: 9.5, fill: `var(--${q.c.color})`, weight: 600, halo: true });
        extra = 14;
      });
      return ty + 20 + extra;
    });
    const opSeg = GG.ui.seg(f.controls, { label: 'operation', value: st.op, options: Object.keys(OPS).map((k) => ({ value: k, label: OPS[k].label, title: OPS[k].desc })), onChange: (v) => { st.op = v; sliders.mm.el.hidden = v !== 'mm'; sliders.vv.el.hidden = v !== 'vv'; update(); } });
    const sliders = {};
    sliders.mm = GG.ui.slider(f.controls, { label: 'N (matrices are N × N)', min: 16, max: 32768, log: true, value: st.N.mm, format: (v) => fI(v), onInput: (v) => { st.N.mm = Math.max(16, Math.round(v)); update(); } });
    sliders.vv = GG.ui.slider(f.controls, { label: 'N (vector length)', min: 1024, max: 2 ** 32, log: true, value: st.N.vv, format: (v) => fI(v), onInput: (v) => { st.N.vv = Math.max(1024, Math.round(v)); update(); } });
    sliders.vv.el.hidden = true;
    GG.ui.slider(f.controls, { label: 'overhead per kernel', min: 1, max: 50, step: 0.5, value: 10, format: (v) => sg(v, 3) + ' μs', onInput: (v) => { st.oh = v * 1e-6; update(); } });
    const EX = [
      { id: 'mm', label: 'large matmul', op: 'mm', N: 8192, title: 'C = A @ B with 8,192 × 8,192 BF16 matrices' },
      { id: 'vv', label: 'large vector-vector multiply', op: 'vv', N: 2 ** 28, title: 'z = x ⊙ y with 2²⁸ = 268,435,456 FP32 elements' },
      { id: 'sm', label: 'small array operation', op: 'vv', N: 65536, title: 'z = x ⊙ y with 65,536 FP32 elements' },
    ];
    const pr = presets(f.controls, 'the glossary\'s examples', EX, (it) => {
      st.op = it.op; st.N[it.op] = it.N; opSeg.set(it.op, false);
      sliders[it.op].set(it.N, false);
      sliders.mm.el.hidden = it.op !== 'mm'; sliders.vv.el.hidden = it.op !== 'vv';
      update();
    });
    const sF = stat(f, 'FLOPs'), sBy = stat(f, 'bytes moved'), sAI = stat(f, 'FLOPs per byte'), sT = stat(f, 'kernel time'), sK = stat(f, 'verdict');
    function update() {
      view.redraw();
      const op = st.op, o = OPS[op], N = st.N[op], cc = costs(op, N);
      pr.mark((it) => it.op === op && it.N === N);
      sF.set(fmtF(cc.fl)); sBy.set(fmtB(cc.by)); sAI.set(fmtAI(cc.fl / cc.by));
      sT.set(fmtT(cc.T));
      const cat = CAT.find((q) => q.k === cc.k);
      sK.set(cat.bound, cat.color);
      const nTxt = op === 'mm' ? `${fI(N)} × ${fI(N)} matrices` : `${fI(N)} elements`;
      let t;
      if (cc.k === 'c') t = `<b>${o.short}</b> with ${nTxt}: the math needs <b>${fmtT(cc.t.c)}</b> and moving the ${fmtB(cc.by)} of data only ${fmtT(cc.t.m)} (${pct(cc.t.m / cc.t.c)} of that), so the kernel is <b>compute-bound</b>. Each byte loaded feeds ${fmtAI(cc.fl / cc.by)} ${fpw(cc.fl / cc.by)}.`;
      else if (cc.k === 'm') t = `<b>${o.short}</b> with ${nTxt}: moving ${fmtB(cc.by)} takes <b>${fmtT(cc.t.m)}</b>, while the ${fmtF(cc.fl)} of math would take ${fmtT(cc.t.c)}, so the cores spend most of the time waiting on memory: <b>memory-bound</b>.`;
      else t = `<b>${o.short}</b> with ${nTxt}: the data (${fmtB(cc.by)}) moves in ${fmtT(cc.t.m)} and the math takes ${fmtT(cc.t.c)}, both far less than the ~${fmtT(st.oh)} it costs just to launch a kernel. The GPU does useful work ${pct(Math.max(cc.t.c, cc.t.m) / cc.T)} of the time: <b>overhead-bound</b>.`;
      f.setWhy(t);
    }
    update();
  }

  /* Fig: the three examples on one roofline (H100 BF16 Tensor Cores, with the FP32 CUDA Core roof faint) */
  function pbRoofline(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'The three examples on a roofline', hint: 'pick a kernel to describe',
      wide: true,
      caption: 'Roofline diagrams like this one are used to quickly identify performance bottlenecks in throughput-oriented systems (adapted from <a href="https://people.eecs.berkeley.edu/~kubitron/cs252/handouts/papers/RooflineVyNoYellow.pdf">Williams, Waterman, and Patterson (2008)</a>). Here: an H100 SXM, with the BF16 Tensor Core compute roof in green and, faint, the lower FP32 CUDA Core roof that the two vector kernels run under; the readouts use the roof each kernel actually runs under. Intensities: the matmul is C = A @ B in BF16, reading A and B and writing C once each, so it does 2N³ FLOPs on 3N² two-byte elements, 6N² bytes (N/3 = 2,731 FLOPs/byte at N = 8,192); the vector kernels do 1 FLOP per 12 bytes. The two vector kernels share one intensity, so their points sit on the same vertical line: the large one on the memory roof, the small one far below it, by the fraction of time its data actually moves (with the ~10 μs launch overhead of Fig.&nbsp;3). Each kernel is coloured by what limits it, as in Fig.&nbsp;3: green compute, blue memory, amber overhead.',
    });
    const rf = RFC();
    if (!rf) return;
    const tMem = (12 * 65536) / H100.bw;
    const ach = tMem / Math.max(10e-6, tMem);
    /* drawn in this order so the large vector kernel's dot sits on top of the small kernel's "roof" ring */
    const K = [
      { id: 'mm', label: 'Large matmul', ai: 8192 / 3, color: 'core', draggable: false },
      /* its position says "memory-bound"; its real limit is launch latency */
      { id: 'sm', label: 'Small array op', ai: 1 / 12, achieved: ach, color: 'control', draggable: false, bound: 'overhead-bound', boundTone: 'control' },
      { id: 'vv', label: 'Large vector multiply', ai: 1 / 12, color: 'memory', draggable: false },
    ];
    const ORDER = ['mm', 'vv', 'sm'];
    const P = rf.PRESETS;
    /* each kernel's own roof and verdict: the position-derived "memory-bound" is wrong for the small array op */
    const INFO = {
      mm: { roof: 'BF16 Tensor Cores', sys: P['h100-bf16'], perf: H100.tc, bound: 'compute-bound', tone: 'core' },
      vv: { roof: 'FP32 CUDA Cores', sys: P['h100-fp32'], perf: H100.bw / 12, bound: 'memory-bound', tone: 'memory' },
      sm: { roof: 'FP32 CUDA Cores', sys: P['h100-fp32'], perf: (H100.bw / 12) * ach, bound: 'overhead-bound', tone: 'control' },
    };
    let sel = 'mm';
    legend(f.stage, [['var(--core)', 'compute roof: BF16 Tensor Cores, 989 TFLOPS', 'ln'], ['var(--ink-3)', 'FP32 CUDA Cores, 66.9 TFLOPS', 'ln'], ['var(--memory)', 'memory roof: 3.35 TB/s', 'ln']]);
    const sRoof = stat(f, 'runs under'), sRidge = stat(f, 'ridge point'), sAI = stat(f, 'intensity'), sPerf = stat(f, 'achieved'), sBound = stat(f, 'bound');
    function chips(id) {
      const k = K.find((q) => q.id === id), x = INFO[id];
      sRoof.set(x.roof, id === 'mm' ? 'core' : null);
      sRidge.set(rf.fmt.ridge(x.sys.ridge) + ' FLOPs/B');
      sAI.set(fmtAI(k.ai) + ' FLOPs/B');
      sPerf.set(rf.fmt.perf(x.perf) + (id === 'sm' ? ` (${pct(ach, 1)} of its roof)` : ''), x.tone);
      sBound.set(x.bound, x.tone);
    }
    const api = rf(f, {
      system: 'h100-bf16', systems: ['h100-bf16'], compare: ['h100-fp32'], kernels: K, selected: 'mm', showReadouts: false,
      xDomain: [0.01, 10000], yDomain: [1e9, 2e16], draggable: false,
      why: (s) => {
        if (!s.kernel) return null;
        chips(s.kernel.id);
        if (s.kernel.id === 'mm') return `The <b>matmul</b> (N = 8,192, BF16) does ${fmtAI(8192 / 3)} FLOPs per byte, far right of the Tensor Cores' ridge at ${rf.fmt.ridge(s.ridge)}: its roof is the flat <span class="rf-w-cmp">compute roof</span>, 989 TFLOPS. It is <b>compute-bound</b>.`;
        if (s.kernel.id === 'vv') return `The <b>large vector multiply</b> runs on the FP32 CUDA Cores (ridge ${rf.fmt.ridge(P['h100-fp32'].ridge)}) and does 1 FLOP per 12 bytes (0.083 FLOPs/byte), far left of that ridge. Its roof is the slanted <span class="rf-w-mem">memory roof</span>: 3.35 TB/s × 0.083 = <b>${rf.fmt.perf(H100.bw / 12)}</b>, far below either compute roof. It is <b>memory-bound</b>.`;
        return `The <b>small array op</b> (65,536 elements) has the same intensity and the same roof, ${rf.fmt.perf(H100.bw / 12)}, but its data moves in ${fmtT(tMem)} while each launch costs ~10 μs, so it reaches only <b>${pct(ach, 1)}</b> of that roof (${rf.fmt.perf((H100.bw / 12) * ach)}). Its position says "memory roof", but its time goes to launch latency: it is <b>overhead-bound</b>. The roofline has no roof for latency, so overhead shows up as this gap.`;
      },
    });
    chips(sel);
    GG.ui.seg(f.controls, { label: 'describe', value: sel, options: ORDER.map((id) => ({ value: id, label: K.find((k) => k.id === id).label })), onChange: (v) => { sel = v; api.select(v); } });
  }

  /* Fig: every flow into or out of a GPU is a potential bottleneck */
  function pbFlows(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Everything that flows can be the neck', hint: 'hover or pick a flow', wide: true,
      caption: 'Five flows that every GPU workload depends on. Compute and memory are the common bottlenecks and have roofs on a roofline; overhead is the host failing to hand over work fast enough; power and heat set limits on how fast the chip may switch at all. The instrument below the diagram is a deliberately simple model of those last two: the SMs\' clock falls in proportion to the power they are allowed to draw (power ∝ clock, at fixed voltage), and the compute roof falls with the clock. Real GPUs also lower the voltage when they lower the clock, so power falls faster than the clock and a real chip gives up less speed than this model shows. The wattages are illustrative.',
    });
    const FL = [
      { id: 'c', name: 'FLOPs', color: 'core', title: 'Compute', html: `<b>Compute:</b> arithmetic on the ${tl('cuda-core', 'CUDA Cores')} and ${tl('tensor-core', 'Tensor Cores')} inside the SMs, up to the ${tl('arithmetic-bandwidth', 'arithmetic bandwidth')} (989 TFLOPS of dense BF16 on an H100). Kernels limited here are ${tl('compute-bound', 'compute-bound')}.` },
      { id: 'm', name: 'bytes', color: 'memory', title: 'Memory', html: `<b>Memory:</b> bytes moving between ${tl('gpu-ram', 'GPU RAM')} and the SMs, at most the ${tl('memory-bandwidth', 'memory bandwidth')} (3.35 TB/s on an H100). Kernels limited here are ${tl('memory-bound', 'memory-bound')}. Together with compute, the most common bottleneck.` },
      { id: 'o', name: 'work', color: 'control', title: 'Overhead', html: `<b>Work from the host:</b> the CPU must decide on and launch every kernel (on the order of 10 μs per launch). When kernels are short, the GPU waits for work: ${tl('overhead', 'overhead')}.` },
      { id: 'p', name: 'power', color: 'ink-2', title: 'Power ingress', html: `<b>Power in:</b> every switching transistor draws current, and a board's power budget is fixed. NVIDIA got ${xl('https://developer.nvidia.com/blog/nvidia-sets-new-generative-ai-performance-and-scale-records-in-mlperf-training-v4-0/', 'a 4% end-to-end speed-up')} by redirecting power from the L2 cache to the SMs. Horace He found ${xl('https://www.thonking.ai/p/strangely-matrix-multiplications', 'matmul speed depends on the input data')}, because different data flips different numbers of transistors.` },
      { id: 'h', name: 'heat', color: 'ink-2', title: 'Heat egress', html: '<b>Heat out:</b> all of that power leaves the chip as heat. If the cooling cannot carry it away fast enough, the GPU has to slow its SM clocks to stay within its temperature limits, and the compute roof drops with them.' },
    ];
    let cur = null;
    const E = { groups: null };
    const view = rsvg(f.stage, 'A GPU with five flows around it: work from the host, bytes between GPU RAM and the SMs, FLOPs inside the SMs, power in and heat out.', (svg, w) => {
      const mob = w < 560;
      const hostW = mob ? 52 : 80, gapW = mob ? 46 : 120;
      const chipW = mob ? Math.min(w - hostW - gapW - 4, 240) : 320, chipH = 150;
      const compW = hostW + gapW + chipW;
      const hostX = Math.max(2, (w - compW) / 2), chipX = hostX + hostW + gapW, chipY = 70;
      // chip first, so the flow groups draw on top of it
      R(svg, chipX, chipY, chipW, chipH, 'fill:var(--surface-2);stroke:var(--line-2);stroke-width:1.5', { rx: 12 });
      Tx(svg, chipX + 12, chipY + 18, 'GPU', { fs: 11, fill: 'var(--ink-3)', ls: '0.12em', weight: 600 });
      const grp = {};
      FL.forEach((d) => { grp[d.id] = G(svg, { class: 'pfa-flow', 'data-id': d.id }); });
      // SMs block
      const smX = chipX + 14, smY = chipY + 28, smW = chipW - 28, smH = 62;
      const gc = grp.c;
      R(gc, smX, smY, smW, smH, 'fill:var(--core-a);stroke:var(--core);stroke-width:1.2', { rx: 8 });
      const cols = mob ? 7 : 12, cw = (smW - 16) / cols;
      for (let i = 0; i < cols; i++) R(gc, smX + 8 + i * cw, smY + smH - 18, cw - 4, 10, 'fill:var(--core);opacity:0.55', { rx: 2 });
      Tx(gc, smX + 10, smY + 18, mob ? 'SMs · FLOPs' : 'SMs · FLOPs on CUDA / Tensor Cores', { fs: 11, fill: 'var(--core)', weight: 600 });
      // GPU RAM block
      const ramY = chipY + chipH - 34;
      const gm = grp.m;
      R(gm, smX, ramY, smW, 22, 'fill:var(--memory-a);stroke:var(--memory);stroke-width:1.2', { rx: 6 });
      Tx(gm, smX + 10, ramY + 15, 'GPU RAM', { fs: 11, fill: 'var(--memory)', weight: 600 });
      const ax = smX + smW - 30;
      Ln(gm, ax, smY + smH + 4, ax, ramY - 4, 'stroke:var(--memory);stroke-width:2');
      arrowHead(gm, ax, smY + smH + 2, -Math.PI / 2, 7, 'var(--memory)');
      arrowHead(gm, ax, ramY - 2, Math.PI / 2, 7, 'var(--memory)');
      Tx(gm, ax - 10, (smY + smH + ramY) / 2 + 4, 'bytes', { fs: 10.5, anchor: 'end', fill: 'var(--memory)' });
      // host → chip
      const go = grp.o;
      const hostY = chipY + chipH / 2 - 24;
      R(go, hostX, hostY, hostW, 48, 'fill:var(--host-a);stroke:var(--host);stroke-width:1.2', { rx: 8 });
      Tx(go, hostX + hostW / 2, hostY + 20, 'host', { fs: 11, anchor: 'middle', fill: 'var(--host)', weight: 600 });
      Tx(go, hostX + hostW / 2, hostY + 35, 'CPU', { fs: 10, anchor: 'middle', fill: 'var(--ink-3)' });
      const ay = chipY + chipH / 2;
      Ln(go, hostX + hostW + 4, ay, chipX - 7, ay, 'stroke:var(--control);stroke-width:2');
      arrowHead(go, chipX - 3, ay, 0, 8, 'var(--control)');
      Tx(go, (hostX + hostW + chipX) / 2, ay - 9, mob ? 'work' : 'work: launches', { fs: 10.5, anchor: 'middle', fill: 'var(--control)' });
      // power in (top)
      const gp = grp.p;
      const px = chipX + chipW * 0.24;
      Ln(gp, px, chipY - 44, px, chipY - 7, 'stroke:var(--ink-2);stroke-width:2');
      arrowHead(gp, px, chipY - 3, Math.PI / 2, 8, 'var(--ink-2)');
      Pa(gp, `M${px - 9},${chipY - 50}l-6,11h6l-5,11`, 'fill:none;stroke:var(--control);stroke-width:1.6;stroke-linejoin:round');
      Tx(gp, px + 9, chipY - 24, 'power in', { fs: 10.5, fill: 'var(--ink-2)' });
      // heat out (top right)
      const gh = grp.h;
      const hx = chipX + chipW * (mob ? 0.66 : 0.7);
      for (let k = 0; k < 3; k++) {
        const x = hx + k * 11;
        Pa(gh, `M${x},${chipY - 7}c-5,-6 5,-10 0,-15c-5,-6 5,-10 0,-15`, 'fill:none;stroke:var(--danger);stroke-width:1.5;opacity:0.85');
      }
      Tx(gh, hx + 32, chipY - 24, 'heat out', { fs: 10.5, fill: 'var(--ink-2)' });
      // hit areas for hover, each with an outline that marks the selected flow
      const hits = { c: [smX, smY, smW, smH], m: [smX, smY + smH, smW, ramY + 22 - smY - smH], o: [hostX, hostY - 16, chipX - hostX, 64], p: [px - 18, chipY - 54, hx - px - 2, 50], h: [hx - 10, chipY - 54, Math.min(100, chipX + chipW - hx + 30), 50] };
      E.outl = {};
      Object.keys(hits).forEach((k) => {
        const [x, y, ww, hh] = hits[k];
        const ox0 = Math.max(1, x - 3), ox1 = Math.min(w - 1, x + ww + 3);
        E.outl[k] = R(grp[k], ox0, y - 3, ox1 - ox0, hh + 6, 'fill:none;stroke:var(--accent);stroke-width:1.5;stroke-dasharray:4 3', { rx: 8, visibility: 'hidden' });
        const r = R(grp[k], x, y, ww, hh, 'fill:transparent;cursor:pointer');
        r.addEventListener('pointerenter', () => pick(k));
        r.addEventListener('pointerdown', () => pick(k));
      });
      E.groups = grp;
      applyDim();
      return chipY + chipH + 8;
    });
    function applyDim() {
      if (!E.groups) return;
      Object.keys(E.groups).forEach((k) => {
        E.groups[k].classList.toggle('pfa-dim', !!cur && cur !== k);
        if (E.outl && E.outl[k]) E.outl[k].setAttribute('visibility', cur === k ? 'visible' : 'hidden');
      });
    }
    /* power and heat instrument: sustained budget = min(board power limit, heat the cooling removes);
       clock ∝ budget ÷ demand (capped at full clock); compute roof ∝ clock; the memory roof does not move */
    const PW = { demand: 800, limit: 700, cool: 900 };
    const pwModel = () => {
      const budget = Math.min(PW.limit, PW.cool), clk = Math.min(1, budget / PW.demand);
      const by = budget >= PW.demand ? 'nothing' : PW.cool < PW.limit ? 'cooling' : 'power limit';
      return { budget, clk, by, roof: H100.tc * clk, ridge: (H100.tc * clk) / H100.bw };
    };
    const inst = GG.el('div', { class: 'pfa-pw' });
    f.stage.append(inst);
    const mini = rsvg(inst, 'A small roofline: the full 989 TFLOPS compute roof dashed, the compute roof at the current clock solid, and the unchanged 3.35 TB/s memory roof.', (svg, w) => {
      const m = pwModel(), mob = w < 560;
      const XD = [1, 10000], YD = [1e12, 3e15], H = mob ? 150 : 170;
      const ml = mob ? 40 : 48, x0 = ml, x1 = w - (mob ? 20 : 16), y0 = 14, y1 = H - 26;
      const X = (v) => x0 + ((lg(v) - lg(XD[0])) / (lg(XD[1]) - lg(XD[0]))) * (x1 - x0);
      const Y = (v) => y1 - ((lg(v) - lg(YD[0])) / (lg(YD[1]) - lg(YD[0]))) * (y1 - y0);
      R(svg, x0, y0, x1 - x0, y1 - y0, 'fill:rgba(8,9,14,0.35)');
      [1, 10, 100, 1000, 10000].forEach((v) => { Ln(svg, X(v), y0, X(v), y1, 'stroke:rgba(255,255,255,0.06)'); Tx(svg, X(v), y1 + 13, fI(v), { fs: 9.5, anchor: 'middle', fill: 'var(--ink-3)' }); });
      [1e12, 1e13, 1e14, 1e15].forEach((v) => { Ln(svg, x0, Y(v), x1, Y(v), 'stroke:rgba(255,255,255,0.06)'); Tx(svg, x0 - 5, Y(v) + 3.5, RFC() ? RFC().fmt.perfShort(v) : sci(v), { fs: 9.5, anchor: 'end', fill: 'var(--ink-3)' }); });
      Pa(svg, `M${x0},${y0}V${y1}H${x1}`, 'fill:none;stroke:var(--ink-3)');
      Tx(svg, x1, H - 2, 'FLOPs per byte →', { fs: 9.5, anchor: 'end', fill: 'var(--ink-3)' });
      const rFull = H100.tc / H100.bw;
      // full-clock roof, dashed and faint
      Pa(svg, `M${r2(X(rFull))},${r2(Y(H100.tc))}H${x1}`, 'fill:none;stroke:var(--core);stroke-width:1.5;stroke-dasharray:5 4;opacity:0.45');
      if (m.clk < 0.999) Tx(svg, x1 - 4, Y(H100.tc) - 5, 'full clock: 989 TFLOPS', { fs: 9.5, anchor: 'end', fill: 'var(--ink-3)', halo: true });
      // memory roof up to the current ridge, then the current compute roof
      Pa(svg, `M${r2(X(XD[0]))},${r2(Y(H100.bw * XD[0]))}L${r2(X(m.ridge))},${r2(Y(m.roof))}`, 'fill:none;stroke:var(--memory);stroke-width:2.5');
      Pa(svg, `M${r2(X(m.ridge))},${r2(Y(m.roof))}H${x1}`, 'fill:none;stroke:var(--core);stroke-width:2.5');
      R(svg, X(m.ridge) - 4, Y(m.roof) - 4, 8, 8, 'fill:var(--ink);stroke:var(--bg);stroke-width:1.5', { rx: 1 });
      const lab = `${RFC() ? RFC().fmt.perf(m.roof) : fmtRate(m.roof)} · ridge ${sg(m.ridge, 3)}`;
      Tx(svg, Math.min(X(m.ridge) + 8, x1 - tw(lab, 10)), Y(m.roof) + 15, lab, { fs: 10, fill: 'var(--core)', weight: 600, halo: true });
      return H;
    });
    const pwRow = GG.el('div', { class: 'pfa-num-row' });
    inst.append(pwRow);
    const sClk = stat(f, 'SM clock'), sRoof = stat(f, 'compute roof', 'core'), sLim = stat(f, 'clock limited by');
    function pwText() {
      const m = pwModel();
      if (m.by === 'nothing') return `The sustained budget (${fI(m.budget)} W) covers the ${fI(PW.demand)} W the work draws at full clock, so the SMs keep their full clock and the compute roof stays at <b>989 TFLOPS</b>.`;
      return `The work would draw ${fI(PW.demand)} W at full clock, but the ${m.by === 'cooling' ? 'cooling can only carry away' : 'board power limit allows'} <b>${fI(m.budget)} W</b>, so in this model the SMs slow to <b>${pct(m.clk, 0)}</b> of their full clock. The compute roof drops to <b>${RFC() ? RFC().fmt.perf(m.roof) : fmtRate(m.roof)}</b> and the ridge point to ${sg(m.ridge, 3)} FLOPs per byte; the memory roof stays at 3.35 TB/s.`;
    }
    function pwUpd(flow) {
      mini.redraw();
      const m = pwModel();
      sClk.set(pct(m.clk, 0) + ' of full', m.clk < 0.999 ? 'danger' : null);
      sRoof.set(RFC() ? RFC().fmt.perf(m.roof) : fmtRate(m.roof));
      sLim.set(m.by, m.by === 'nothing' ? null : 'danger');
      pwRow.innerHTML = `<span>sustained budget = min(power limit ${fI(PW.limit)} W, cooling ${fI(PW.cool)} W) = <b>${fI(m.budget)} W</b></span><span>clock = min(1, ${fI(m.budget)} ÷ ${fI(PW.demand)}) = <b>${pct(m.clk, 0)}</b></span>`;
      if (flow) pick(flow);
      else if (cur === 'p' || cur === 'h') pick(cur);
    }
    function pick(k) {
      cur = k;
      applyDim();
      seg.set(k, false);
      const d = FL.find((x) => x.id === k);
      f.setWhy(d.html + (k === 'p' || k === 'h' ? ' ' + pwText() : ''));
    }
    const seg = GG.ui.seg(f.controls, { label: 'flow', value: null, options: FL.map((d) => ({ value: d.id, label: d.title })), onChange: (v) => pick(v) });
    GG.ui.slider(f.controls, { label: 'power the work draws at full clock', min: 300, max: 1000, step: 10, value: PW.demand, format: (v) => fI(v) + ' W', onInput: (v) => { PW.demand = v; pwUpd('p'); } });
    GG.ui.slider(f.controls, { label: 'board power limit', min: 300, max: 700, step: 10, value: PW.limit, format: (v) => fI(v) + ' W', onInput: (v) => { PW.limit = v; pwUpd('p'); } });
    GG.ui.slider(f.controls, { label: 'heat the cooling removes', min: 300, max: 1000, step: 10, value: PW.cool, format: (v) => fI(v) + ' W', onInput: (v) => { PW.cool = v; pwUpd('h'); } });
    pwUpd();
    f.setWhy('Five flows keep a GPU working. Pick one to see how it can become the bottleneck. <b>Compute</b> and <b>memory</b> are the most important resources and the most common bottlenecks; they are the two roofs of the ' + tl('roofline-model', 'roofline model') + '.');
  }


  /* ═════════════════════════ ROOFLINE MODEL ═════════════════════════ */

  const WWP = 'https://people.eecs.berkeley.edu/~kubitron/cs252/handouts/papers/RooflineVyNoYellow.pdf';
  const COLOR_NOTE = 'Colours follow this site\'s code: the memory roof is blue and the compute roof green, the reverse of the glossary\'s own figure.';

  GG.entry('roofline-model', {
    render(body, ctx) {
      const s = ctx.html(body, `
<p>The <strong>roofline model</strong> is a simplified, visual model of performance used to quickly determine whether a program is bound by <a data-term="memory-bandwidth">memory bandwidth</a> or <a data-term="arithmetic-bandwidth">arithmetic bandwidth</a>. It fits on a napkin: two straight lines that describe the hardware, and one dot per <a data-term="kernel">kernel</a>.</p>
<div data-slot="f1"></div>
<h3>Two roofs</h3>
<p>In the roofline model, two hardware-derived "roofs" put a "ceiling" on the possible performance:</p>
<ul>
  <li>the <strong class="c-core">compute roof</strong>: the <a data-term="peak-rate">peak rate</a> of the target hardware (<a data-term="cuda-core">CUDA Cores</a> or <a data-term="tensor-core">Tensor Cores</a>), aka the <a data-term="arithmetic-bandwidth">arithmetic bandwidth</a>;</li>
  <li>the <strong class="c-memory">memory roof</strong>: the peak memory throughput of the target hardware, aka the <a data-term="memory-bandwidth">memory bandwidth</a>.</li>
</ul>
<p>These are drawn on a plane with the <a data-term="arithmetic-intensity">arithmetic intensity</a> (in operations per byte) on the x-axis and the performance (in operations per second) on the y-axis. The compute roof is a horizontal line with height equal to the arithmetic bandwidth. The memory roof is a slanted line with slope equal to the memory bandwidth. Slope is "rise over run", and so the line has units of bytes per second: operations per second divided by operations per byte.</p>
<div class="pfa-eq" role="math" aria-label="attainable performance equals the minimum of the arithmetic bandwidth and the memory bandwidth times the arithmetic intensity"><span>attainable</span><span class="op">=</span><span>min(</span><span class="c-core">arithmetic bandwidth</span><span class="op">,</span><span><span class="c-memory">memory bandwidth</span> × <span>arithmetic intensity</span></span><span>)</span><small>FLOP/s = min( FLOP/s , byte/s × FLOP/byte )</small></div>
<p>Read the formula as two limits on a kernel that performs <i>I</i> operations for every byte it moves. It cannot compute faster than the compute units can go, and it cannot compute faster than the memory system delivers bytes, times <i>I</i>. Whichever limit is lower is the roof above that kernel. Fig.&nbsp;2 builds a roofline from nothing but those two numbers. Its axes start out linear, so you can see the slope directly: one step to the right (one more operation per byte) raises the memory roof by exactly the bandwidth.</p>
<div data-slot="f2"></div>
${GG.noteHTML('intuition', '<p>Why is the roofline almost always drawn on log–log axes, as in Fig.&nbsp;1? Because kernels differ in intensity by factors of thousands, and only logarithmic axes fit them on one chart. On log–log axes every memory roof has the same slope, one decade up for each decade right, so a higher bandwidth <em>slides</em> the slanted roof upward instead of tilting it. Toggle the axes in Fig.&nbsp;2 to watch the same roofline change shape.</p>')}
<h3>Reading a kernel's position</h3>
<p>A specific kernel's x-coordinate tells you instantly whether it is fundamentally <a data-term="compute-bound">compute-bound</a> (points beneath the flat roof) or <a data-term="memory-bound">memory-bound</a> (points beneath the slanted roof). Its y-coordinate is the performance it actually reaches, and kernels are rarely up against either roof due to the effects of <a data-term="overhead">overhead</a>. Switch on <em>measured kernels</em> in Fig.&nbsp;1: each dot drops below its roof, and the gap is time lost to everything the two roofs leave out.</p>
<h3>The ridge point</h3>
<p>The point on the boundary, where the diagonal and horizontal roofs meet, is called the <strong>ridge point</strong>. Its x-coordinate is the minimum arithmetic intensity required to be able to escape the memory <a data-term="performance-bottleneck">bottleneck</a>, and it is simply the ratio of the two roofs.</p>
<div class="pfa-eq" role="math" aria-label="ridge point equals arithmetic bandwidth divided by memory bandwidth"><span>ridge point</span><span class="op">=</span><span class="fr"><span class="c-core">arithmetic bandwidth</span><span class="c-memory">memory bandwidth</span></span><span class="op">=</span><span class="fr"><span>989 TFLOP/s</span><span>3.35 TB/s</span></span><span class="op">=</span><span><b>295.2</b> FLOPs/byte</span><small>an H100 SXM running BF16 math on its Tensor Cores</small></div>
<p>So to keep an H100's Tensor Cores busy, a kernel must perform almost three hundred floating point operations for every byte it moves between <a data-term="gpu-ram">GPU RAM</a> and the chip. Computer systems whose ridge point is further to the left are easier to achieve maximum performance on, but the relatively poor scaling of memory relative to compute has generally pushed the ridge points of systems to the right over time. The history at the end of this entry explains why.</p>
<h3>Roofs belong to subsystems</h3>
<p>The compute and memory roofs need only be derived once per subsystem, though importantly they vary depending on the subsystem, not just the system: <a data-term="tensor-core">Tensor Cores</a> have more FLOPS than <a data-term="cuda-core">CUDA Cores</a>. On one H100 the BF16 Tensor Core roof (989 TFLOPS) sits 14.8× above the FP32 CUDA Core roof (66.9 TFLOPS), and FP8 doubles it again, while all three share the same 3.35 TB/s memory roof. So the same kernel can be compute-bound on one subsystem and memory-bound on another. Drag the kernel in Fig.&nbsp;3 and compare the verdicts.</p>
<div data-slot="f3"></div>
<p>NVIDIA's NSight Compute tool for <a data-term="kernel">kernel</a> performance engineering automatically performs roofline analysis for profiled kernels: it counts each kernel's operations and bytes and draws the dot for you.</p>
<h3>Deceptively simple</h3>
<p>The roofline model is deceptively simple. Note that, for instance, system latencies do not appear anywhere in the diagram, only bandwidths and throughputs. It is simple because it is highly opinionated, and understanding those opinions and their reasoning is key to understanding the power and the proper application of the roofline.</p>
${GG.noteHTML('beyond', `<p>Four opinions are built into the two lines:</p>
<ul>
<li><b>Only throughput matters.</b> A roof can be reached only if enough work is in flight to cover every latency. By <a data-term="littles-law">Little's Law</a>, the bytes in flight must equal bandwidth × latency. GPUs are designed to keep that much in flight (<a data-term="latency-hiding">latency hiding</a>), so for them the opinion usually holds.</li>
<li><b>Compute and data movement overlap perfectly.</b> The minimum of the two limits assumes a kernel computes on some data while fetching the next. Fig.&nbsp;4 shows what the opposite assumption costs.</li>
<li><b>One memory level counts.</b> The bytes on the x-axis are those crossing between GPU RAM and the chip; traffic that stays in on-chip caches is free. That is a good bet when working sets are far larger than the caches, as the <a data-term="memory-bound">memory-bound</a> entry explains.</li>
<li><b>The peaks are reachable.</b> The roofs are the datasheet's numbers. Anything that keeps a kernel from them, from launch overhead to <a data-term="bank-conflict">bank conflicts</a>, appears only as distance below the roof.</li>
</ul>`)}
<div data-slot="f4"></div>
<h3>Where the roofline came from</h3>
<p>The roofline model was introduced by Samuel Williams, Andrew Waterman, and David Patterson in <a href="${WWP}">this 2008 paper</a>, which plots "operational intensity", operations per byte of DRAM traffic. They introduced it in the face of several hardware scaling trends that shaped system architectures before and since.</p>
<h4>1 · Latency lags bandwidth</h4>
<p>First, as Patterson separately observed in a famous 2004 paper, <a href="https://dl.acm.org/doi/pdf/10.1145/1022594.1022596">"latency lags bandwidth"</a>. More specifically, across subsystems like compute, memory, and storage, a linear improvement in latency has historically been accompanied by a quadratic improvement in bandwidth. This suggested that future systems would be, like GPUs, throughput-oriented. Fig.&nbsp;5 shows why the one follows from the other.</p>
<div data-slot="f5"></div>
<p>A system that waits for each answer before asking the next question gets only one latency's worth of work done per round trip, no matter how wide its pipes are. To use a pipe that gets shorter by <i>k</i> and wider by <i>k</i>², it has to keep <i>k</i> times more requests in flight. Designs that do this, many independent requests outstanding at once, are what throughput-oriented means, and it is how GPUs work: tens of thousands of threads, each waiting on its own memory request.</p>
<h4>2 · The memory wall</h4>
<p>Second, as has long been observed, compute subsystems (like processor cores) have scaled their performance much more rapidly than memory subsystems like <a data-term="l1-data-cache">caches</a> and <a data-term="gpu-ram">DRAM</a>. This was popularized as the <a href="https://www.eecs.ucf.edu/~lboloni/Teaching/EEL5708_2006/slides/wulf94.pdf">"memory wall"</a> by Wulf and McKee in 1994. On a roofline, compute outgrowing memory means the compute roof rises faster than the memory roof, so the ridge point slides to the right. The glossary's table of recent NVIDIA data center GPUs shows it happening.</p>
<div data-slot="f6"></div>
${GG.noteHTML('beyond', '<p>Wulf and McKee made their case with the average time per memory access, <i>t</i><sub>avg</sub> = <i>p</i> × <i>t</i><sub>cache</sub> + (1 − <i>p</i>) × <i>t</i><sub>DRAM</sub>, where <i>p</i> is the fraction of accesses that hit in the cache. Processor speed was improving much faster than DRAM speed, so <i>t</i><sub>DRAM</sub>, counted in processor cycles, grew every year. However high the hit rate, the second term eventually dominates, and from then on a faster processor barely helps: it has hit the wall.</p>')}
<h4>3 · The end of Dennard scaling</h4>
<p>Finally, the early 2000s saw the end of <a href="https://en.wikipedia.org/wiki/Dennard_scaling">Dennard scaling</a>, aka increasing clock speed at equal power, due primarily to the fixed leakage current of transistors, which posed power draw and heat dissipation problems. Increasing clock speed had previously buoyed general purpose, latency-oriented systems like CPUs over special purpose hardware. This slowdown was not accompanied by a slowdown in <a href="https://en.wikipedia.org/wiki/Moore%27s_law">Moore's Law</a>, aka increasing transistor count per chip. The architectural solution to an abundance of transistors but scarcity of power was hardware specialization: disaggregating computers into components specialized in completing distinct tasks.</p>
<div data-slot="f7"></div>
${GG.noteHTML('beyond', '<p>The arithmetic behind Fig.&nbsp;7. A transistor\'s switching power is roughly <i>C</i> × <i>V</i>² × <i>f</i>: capacitance, the square of the supply voltage, and clock frequency. Shrinking every dimension by a factor κ (about 1.4 per process generation, which doubles the transistors per area) cuts <i>C</i> by κ. Under Dennard scaling the voltage fell by κ too, so each transistor used κ² less power, exactly offsetting the κ² more transistors, even with the clock raised by κ. Once the voltage could no longer fall (lower voltages would have meant lower threshold voltages and exponentially more leakage), power per area started to climb with every generation, and a growing share of each chip had to stay switched off at any moment. This is often called <i>dark silicon</i>.</p>')}
<p>For a well-documented example of specialization, see the <a href="https://blog.google/products/pixel/pixel-visual-core-image-processing-and-machine-learning-pixel-2/">Pixel Visual Core</a> image co-processor, explained in detail in chapter 7 of the sixth edition of Hennessy and Patterson's <a href="https://archive.org/details/computerarchitectureaquantitativeapproach6thedition/page/n13/mode/2up"><i>Computer Architecture</i></a>. A GPU's <a data-term="tensor-core">Tensor Cores</a> are the same idea: units that do only one thing, matrix multiplication, and deliver many times the FLOPS of the chip's general-purpose <a data-term="cuda-core">CUDA Cores</a>.</p>
<h4>What it all adds up to</h4>
<p>Taken together, these trends correctly suggested to the authors that future systems would be throughput-oriented and that among the various bandwidths at play, the <a data-term="memory-bandwidth">bandwidth of memory subsystems</a> would be the primary <a data-term="performance-bottleneck">performance bottleneck</a>. Applications of those systems that wanted to achieve peak performance would therefore need to have high operational intensity for that hardware's specialized operations: in the case of GPUs, <a data-term="arithmetic-intensity">arithmetic intensity</a> for Tensor Cores, which is to say very large matrix multiplications. The matmul in Fig.&nbsp;6 makes "very large" concrete. A square N × N matrix multiplication C = A @ B does 2N³ operations on 3N² numbers (it reads A and B and writes C), so its intensity grows with N; in BF16 it reaches an H100's ridge at N = 886.</p>
<div data-slot="reading"></div>`);

      guard(() => rmFlagship(ctx, s.f1), 'flagship');
      guard(() => rmBuild(ctx, s.f2), 'build');
      guard(() => rmSubsystems(ctx, s.f3), 'subsystems');
      guard(() => rmOverlap(ctx, s.f4), 'overlap');
      guard(() => rmLatency(ctx, s.f5), 'latency');
      guard(() => rmRidges(ctx, s.f6), 'ridges');
      guard(() => rmDennard(ctx, s.f7), 'dennard');
      ctx.reading(s.reading, [
        { href: WWP, label: 'Williams, Waterman and Patterson (2008), <i>Roofline: An Insightful Visual Performance Model for Multicore Architectures</i>', note: 'the paper that introduced the roofline model' },
        { href: 'https://dl.acm.org/doi/pdf/10.1145/1022594.1022596', label: 'Patterson (2004), <i>Latency Lags Bandwidth</i>', note: 'the quadratic rule of thumb' },
        { href: 'https://www.eecs.ucf.edu/~lboloni/Teaching/EEL5708_2006/slides/wulf94.pdf', label: 'Wulf and McKee (1994), <i>Hitting the Memory Wall: Implications of the Obvious</i>', note: 'the memory wall' },
        { href: 'https://en.wikipedia.org/wiki/Dennard_scaling', label: 'Dennard scaling (Wikipedia)' },
        { href: 'https://en.wikipedia.org/wiki/Moore%27s_law', label: 'Moore\'s law (Wikipedia)' },
        { href: 'https://blog.google/products/pixel/pixel-visual-core-image-processing-and-machine-learning-pixel-2/', label: 'Google: Pixel Visual Core', note: 'an image co-processor, and a textbook case of specialization' },
        { href: 'https://archive.org/details/computerarchitectureaquantitativeapproach6thedition/page/n13/mode/2up', label: 'Hennessy and Patterson, <i>Computer Architecture: A Quantitative Approach</i>, 6th edition', note: 'chapter 7 covers the Pixel Visual Core' },
        { href: 'https://developer.nvidia.com/nsight-compute', label: 'NVIDIA NSight Compute', note: 'profiler with automatic roofline analysis (link Beyond the glossary)' },
      ]);
    },
  });

  /* Fig 1: the flagship roofline */
  function rmFlagship(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'The roofline model', hint: 'drag a kernel · switch system · switch axes', wide: true,
      caption: `<a data-term="kernel">Kernels</a> to the left of the ridge point are <a data-term="memory-bound">limited by the bandwidth of the memory subsystem</a> and kernels to the right of the ridge point are <a data-term="compute-bound">limited by the bandwidth of the arithmetic subsystem</a>. Diagram adapted from <a href="${WWP}">Williams, Waterman, and Patterson (2008)</a>, which introduced the roofline model; its two kernels are the glossary figure's "Arithmetic Intensity 1" and "2". The measured kernels reach 55% and 70% of their roofs (illustrative values). ${COLOR_NOTE} Each kernel takes the colour of the roof that caps it, and changes colour as you drag it across the ridge.`,
    });
    const rf = RFC();
    if (!rf) return;
    const K = [
      { id: 'k1', label: 'Kernel 1', ai: 30, meas: 0.55 },
      { id: 'k2', label: 'Kernel 2', ai: 1200, meas: 0.7 },
    ];
    const ais = { k1: 30, k2: 1200 };
    const st = { meas: false };
    const api = rf(f, { system: 'h100-bf16', showControls: true, showScale: true, kernels: K.map((k) => ({ id: k.id, label: k.label, ai: k.ai })) });
    api.on('change', (x) => { if (x.kernel) ais[x.kernel.id] = x.kernel.ai; });
    const tg = GG.el('div', { class: 'ctl' });
    tg.append(GG.el('span', { class: 'ctl-lab', text: 'show' }));
    const row = GG.el('div', { style: 'display:flex;gap:14px;flex-wrap:wrap;align-items:center;min-height:30px' });
    tg.append(row);
    f.controls.append(tg);
    GG.ui.toggle(row, { label: 'measured kernels', value: false, onChange: (v) => { st.meas = v; api.setKernels(K.map((k) => ({ id: k.id, label: k.label, ai: ais[k.id], achieved: v ? k.meas : 1 }))); } });
    GG.ui.toggle(row, { label: 'shade regions', value: false, onChange: (v) => api.setShade(v ? 'both' : null) });
  }

  /* Fig 2: a roofline from two numbers */
  function rmBuild(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Two numbers make a roofline', hint: 'set the two bandwidths · toggle the axes', wide: true,
      caption: 'A hypothetical GPU defined by nothing but its arithmetic bandwidth and its memory bandwidth. On linear axes the memory roof is a straight line through the origin, and the dashed triangle measures its slope: rise ÷ run = (FLOP/s) ÷ (FLOPs/byte) = bytes/s, the memory bandwidth. The presets load three rows of the glossary\'s ridge-point table, plus an H100\'s FP32 CUDA Cores (66.9 TFLOPS, see <a data-term="peak-rate">Peak Rate</a>).',
    });
    const rf = RFC();
    if (!rf) return;
    const st = { t: 989, b: 3.35 };
    const sys = () => ({ id: 'rm-custom', label: 'This GPU', tflops: st.t, tbps: st.b, phrase: 'this GPU' });
    const api = rf(f, { system: sys(), systems: [sys()], scale: 'linear', showScale: true, showReadouts: true, kernels: [{ id: 'k', label: 'Kernel', ai: 100, color: 'accent' }], xDomain: [0.01, 1e6], yDomain: [1e11, 1e17] });
    const eq = GG.el('div', { class: 'pfa-eq in-fig', role: 'math' });
    f.stage.append(eq);
    let sT, sB;
    function upd(fromPreset) {
      api.setSystem(sys());
      const R = (st.t * 1e12) / (st.b * 1e12);
      eq.innerHTML = `<div class="row"><span>slope of the memory roof</span><span class="op">=</span><span class="fr"><span>rise</span><span>run</span></span><span class="op">=</span><span class="fr"><span>FLOP/s</span><span>FLOPs/byte</span></span><span class="op">=</span><span class="c-memory">bytes/s</span><span class="op">=</span><span class="c-memory">${sg(st.b, 3)} TB/s</span></div><div class="row"><span>ridge point</span><span class="op">=</span><span class="fr"><span class="c-core">${sg(st.t, 4)} TFLOP/s</span><span class="c-memory">${sg(st.b, 3)} TB/s</span></span><span class="op">=</span><span><b>${rf.fmt.ridge(R)}</b> FLOPs/byte</span></div>`;
      pr.mark((it) => Math.abs(it.t - st.t) < 1e-6 && Math.abs(it.b - st.b) < 1e-6);
      if (fromPreset) { sT.set(st.t, false); sB.set(st.b, false); }
    }
    sT = GG.ui.slider(f.controls, { label: 'arithmetic bandwidth', min: 10, max: 20000, log: true, value: st.t, format: (v) => sg(v, 3) + ' TFLOP/s', onInput: (v) => { st.t = rp(v, 3); upd(); } });
    sB = GG.ui.slider(f.controls, { label: 'memory bandwidth', min: 0.2, max: 20, log: true, value: st.b, format: (v) => sg(v, 3) + ' TB/s', onInput: (v) => { st.b = rp(v, 3); upd(); } });
    const P = rf.PRESETS;
    const pr = presets(f.controls, 'load a row', ['a100-bf16', 'h100-bf16', 'b200-fp4', 'h100-fp32'].map((id) => ({ id, label: P[id].label, t: P[id].tflops, b: P[id].tbps, title: P[id].name })), (it) => { st.t = it.t; st.b = it.b; upd(true); });
    upd(true);
  }

  /* Fig 3: roofs belong to subsystems */
  function rmSubsystems(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'One H100, three compute roofs', hint: 'drag the kernel · switch subsystem', wide: true,
      caption: 'All three subsystems of one H100 SXM share the 3.35 TB/s memory roof; only the compute roof changes. FP32 on the CUDA Cores: 132 SMs × 128 FP32 units × 2 FLOPs per FMA × 1.98 GHz = 66.9 TFLOPS (see <a data-term="peak-rate">Peak Rate</a>). BF16 and FP8 on the Tensor Cores: 989 and 1,979 TFLOPS, dense, from NVIDIA\'s datasheet. The other two roofs are drawn faintly. In practice a kernel\'s intensity also depends on its data type; here we hold it fixed to isolate the roofs.',
    });
    const rf = RFC();
    if (!rf) return;
    const IDS = ['h100-fp32', 'h100-bf16', 'h100-fp8'];
    const P = rf.PRESETS;
    const api = rf(f, { system: 'h100-bf16', systems: IDS, showControls: true, compare: ['h100-fp32', 'h100-fp8'], kernels: [{ id: 'k', label: 'Kernel', ai: 100, color: 'accent' }] });
    const tw0 = GG.el('div', { class: 'pfa-tw' });
    f.stage.append(tw0);
    let last = 'h100-bf16';
    function table(stt) {
      const ai = stt.ai;
      tw0.innerHTML = TB(`<thead><tr><th>subsystem</th><th class="num">compute roof</th><th class="num">ridge</th><th class="num">at ${fmtAI(ai)} ${fpw(ai)}/B</th><th>bound</th></tr></thead><tbody>` +
        IDS.map((id) => {
          const x = P[id], att = Math.min(x.flops, x.bw * ai), b = ai < x.ridge ? 'memory-bound' : 'compute-bound';
          const on = id === stt.system.id;
          return `<tr><td class="${on ? 'hl' : ''}">${x.unit}</td><td class="num">${rf.fmt.perf(x.flops, 4)}</td><td class="num">${rf.fmt.ridge(x.ridge)}</td><td class="num ${on ? 'hl' : ''}">${rf.fmt.perf(att)}</td><td class="${b === 'memory-bound' ? 'c-memory' : 'c-core'}">${b}</td></tr>`;
        }).join('') + '</tbody>');
    }
    api.on('change', (stt) => {
      if (stt.system.id !== last) { last = stt.system.id; api.setCompare(IDS.filter((i) => i !== last)); }
      table(api.state());
    });
    table(api.state());
  }

  /* Fig 4: the overlap opinion — min(t_c, t_m) vs t_c + t_m */
  function rmOverlap(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'The roofline assumes perfect overlap', hint: 'slide the intensity',
      wide: true,
      caption: 'An H100 SXM at BF16 (989 TFLOPS, 3.35 TB/s) doing 1 GFLOP of work at the chosen intensity. The roofline assumes that computing and moving data happen at the same time, so the time is the larger of the two (solid lines). If the kernel instead alternated, loading and then computing, the times would add up (dashed grey curve). The two differ most at the ridge point, where they are exactly a factor of two apart.',
    });
    const F = H100.tc, B = H100.bw, Rg = F / B;
    const st = { ai: 100 };
    const XD = [0.1, 10000], YD = [1e11, 3e15];
    legend(f.stage, [['var(--memory)', 'memory roof', 'ln'], ['var(--core)', 'compute roof', 'ln'], ['var(--ink-2)', 'if data movement and math took turns', 'dl'], ['var(--accent)', 'this intensity', 'dt']]);
    const view = rsvg(f.stage, 'A roofline with a second, lower curve for serial execution, and two timelines comparing overlapped and serial execution of the same work.', (svg, w) => {
      const mob = w < 640;
      const cw = mob ? w : Math.floor(w * 0.55), ch = mob ? Math.round(w * 0.72) : 300;
      const m = { l: mob ? 44 : 64, r: mob ? 22 : 16, t: 14, b: 34 };
      const x0 = m.l, x1 = cw - m.r, y0 = m.t, y1 = ch - m.b;
      const X = (v) => x0 + ((lg(v) - lg(XD[0])) / (lg(XD[1]) - lg(XD[0]))) * (x1 - x0);
      const Y = (v) => y1 - ((lg(v) - lg(YD[0])) / (lg(YD[1]) - lg(YD[0]))) * (y1 - y0);
      R(svg, x0, y0, x1 - x0, y1 - y0, 'fill:rgba(8,9,14,0.35)');
      decades(XD[0], XD[1]).forEach((v) => { Ln(svg, X(v), y0, X(v), y1, 'stroke:rgba(255,255,255,0.07)'); Tx(svg, X(v), y1 + 15, fmtAI(v), { fs: 10, anchor: 'middle', fill: 'var(--ink-3)' }); });
      decades(YD[0], YD[1]).forEach((v) => { Ln(svg, x0, Y(v), x1, Y(v), 'stroke:rgba(255,255,255,0.07)'); Tx(svg, x0 - 6, Y(v) + 3.5, RFC() ? RFC().fmt.perfShort(v) : sci(v), { fs: 10, anchor: 'end', fill: 'var(--ink-3)' }); });
      Pa(svg, `M${x0},${y0}V${y1}H${x1}`, 'fill:none;stroke:var(--ink-3);stroke-width:1.2');
      Tx(svg, (x0 + x1) / 2, ch - 4, 'arithmetic intensity (FLOPs/byte)', { fs: 10.5, anchor: 'middle', fill: 'var(--ink-2)' });
      // roofs
      const xa = XD[0];
      Pa(svg, `M${r2(X(xa))},${r2(Y(B * xa))}L${r2(X(Rg))},${r2(Y(F))}`, 'fill:none;stroke:var(--memory);stroke-width:2.5');
      Pa(svg, `M${r2(X(Rg))},${r2(Y(F))}H${x1}`, 'fill:none;stroke:var(--core);stroke-width:2.5');
      // serial curve
      const pts = [];
      for (let i = 0; i <= 160; i++) { const a = 10 ** (lg(XD[0]) + (i / 160) * (lg(XD[1]) - lg(XD[0]))); pts.push(`${r2(X(a))},${r2(Y(1 / (1 / F + 1 / (B * a))))}`); }
      Pa(svg, 'M' + pts.join('L'), 'fill:none;stroke:var(--ink-2);stroke-width:2;stroke-dasharray:6 4');
      R(svg, X(Rg) - 5, Y(F) - 5, 10, 10, 'fill:var(--ink);stroke:var(--bg);stroke-width:2', { rx: 1.5 });
      if (!mob) Tx(svg, X(Rg) + 9, Y(F) - 8, 'ridge 295.2', { fs: 10, fill: 'var(--ink-2)' });
      // current intensity
      const a = st.ai, roof = Math.min(F, B * a), ser = 1 / (1 / F + 1 / (B * a));
      Ln(svg, X(a), y1, X(a), Y(roof), 'stroke:var(--accent);stroke-width:1.5;stroke-dasharray:3 3');
      C(svg, X(a), Y(roof), 5.5, 'fill:var(--accent);stroke:var(--bg);stroke-width:2');
      C(svg, X(a), Y(ser), 5, 'fill:var(--ink-2);stroke:var(--bg);stroke-width:2');
      // timelines
      const tx0 = mob ? 0 : cw + 26, tx1 = w;
      let ty = mob ? ch + 18 : 30;
      const W = 1e9, tc = W / F, tm = W / (a * B), tot = tc + tm;
      const S = (t) => ((tx1 - tx0 - 2) * t) / tot;
      Tx(svg, tx0, ty, 'overlapped: the roofline\'s view', { fs: 11, fill: 'var(--ink)', weight: 600 });
      Tx(svg, tx1, ty, fmtT(Math.max(tc, tm)), { fs: 11, anchor: 'end', fill: 'var(--ink)', weight: 600 });
      ty += 10;
      R(svg, tx0, ty, S(tm), 16, 'fill:var(--memory)', { rx: 3 });
      if (S(tm) > 58) Tx(svg, tx0 + 6, ty + 12, 'move bytes', { fs: 10, fill: '#0b0c12', weight: 600 });
      R(svg, tx0, ty + 20, S(tc), 16, 'fill:var(--core)', { rx: 3 });
      if (S(tc) > 50) Tx(svg, tx0 + 6, ty + 32, 'compute', { fs: 10, fill: '#0b0c12', weight: 600 });
      Ln(svg, tx0 + S(Math.max(tc, tm)), ty - 4, tx0 + S(Math.max(tc, tm)), ty + 40, 'stroke:var(--ink);stroke-width:1.5');
      ty += 66;
      Tx(svg, tx0, ty, 'one after the other', { fs: 11, fill: 'var(--ink)', weight: 600 });
      Tx(svg, tx1, ty, fmtT(tot), { fs: 11, anchor: 'end', fill: 'var(--ink-2)', weight: 600 });
      ty += 10;
      R(svg, tx0, ty, S(tm), 16, 'fill:var(--memory)', { rx: 3 });
      R(svg, tx0 + S(tm), ty, S(tc), 16, 'fill:var(--core)', { rx: 3 });
      Ln(svg, tx0 + S(tot) - 1, ty - 4, tx0 + S(tot) - 1, ty + 20, 'stroke:var(--ink-2);stroke-width:1.5');
      ty += 40;
      const lines = [`compute: 1 GFLOP ÷ 989 TFLOP/s = ${fmtT(tc)}`, `bytes: ${fmtB(W / a)} ÷ 3.35 TB/s = ${fmtT(tm)}`];
      lines.forEach((l, i) => Tx(svg, tx0, ty + i * 16, l, { fs: 10.5, fill: 'var(--ink-3)' }));
      return Math.max(ch, ty + 22);
    });
    const sR = stat(f, 'roofline bound', 'core'), sS = stat(f, 'if serial'), sQ = stat(f, 'serial ÷ roofline');
    const sl = GG.ui.slider(f.controls, { label: 'arithmetic intensity', min: 0.1, max: 10000, log: true, value: st.ai, format: (v) => fmtAI(v) + ' FLOPs/byte', onInput: (v) => { st.ai = v; upd(); } });
    const pr = presets(f.controls, 'jump to', [{ id: 'r', label: 'the ridge point', ai: Rg }, { id: 'lo', label: '1 FLOP/byte', ai: 1 }, { id: 'hi', label: '10,000 FLOPs/byte', ai: 10000 }], (it) => { st.ai = it.ai; sl.set(it.ai, false); upd(); });
    function upd() {
      view.redraw();
      const a = st.ai, roof = Math.min(F, B * a), ser = 1 / (1 / F + 1 / (B * a)), q = ser / roof;
      sR.set(RFC() ? RFC().fmt.perf(roof) : fmtRate(roof)); sS.set(RFC() ? RFC().fmt.perf(ser) : fmtRate(ser)); sQ.set(pct(q, 1));
      pr.mark((it) => Math.abs(lg(it.ai / a)) < 1e-6);
      const atR = Math.abs(lg(a / Rg)) < 0.004;
      let t;
      if (atR) t = `At the ridge point the two times are equal, so doing them one after the other takes <b>exactly twice</b> as long as overlapping them: <b>50%</b> of the roofline's prediction. This is where the roofline's opinion matters most.`;
      else if (a < Rg) t = `At <b>${fmtAI(a)} ${fpw(a)}/byte</b> moving the bytes takes ${sg(Rg / a, 3)}× longer than the math, so hiding the math under the data movement saves little: serial execution reaches <b>${pct(q, 1)}</b> of the roof.`;
      else t = `At <b>${fmtAI(a)} ${fpw(a)}/byte</b> the math takes ${sg(a / Rg, 3)}× longer than moving the bytes, so the data movement hides easily: serial execution still reaches <b>${pct(q, 1)}</b> of the roof.`;
      f.setWhy(t + ' The gap between the curves is never more than 2× (it is the ratio of a sum to its larger part).');
    }
    upd();
  }

  /* Fig 5: latency lags bandwidth */
  function rmLatency(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Latency lags bandwidth', hint: 'slide the latency improvement', wide: true,
      caption: 'The rule of thumb from Patterson (2004): when latency improves by a factor k, bandwidth improves by about k². The bars apply it: latency shrinks to 1/k, bandwidth grows k², and to keep the faster pipe full a system must keep bandwidth × latency = k² × 1/k = k times as many bytes in flight (Little\'s Law). All three are relative to the starting system, on a log scale.',
    });
    const st = { k: 10 };
    const view = rsvg(f.stage, 'Left: bandwidth improvement plotted against latency improvement on log-log axes, following bandwidth equals latency squared. Right: bars for latency, bandwidth and bytes in flight relative to the start.', (svg, w) => {
      const mob = w < 640;
      const cw = mob ? w : Math.floor(w * 0.52), ch = mob ? Math.round(w * 0.78) : 290;
      const m = { l: mob ? 44 : 56, r: 12, t: 14, b: 38 };
      const x0 = m.l, x1 = cw - m.r, y0 = m.t, y1 = ch - m.b;
      const XD = [1, 30], YD = [1, 1000];
      const X = (v) => x0 + (lg(v) / lg(XD[1])) * (x1 - x0), Y = (v) => y1 - (lg(v) / lg(YD[1])) * (y1 - y0);
      R(svg, x0, y0, x1 - x0, y1 - y0, 'fill:rgba(8,9,14,0.35)');
      [1, 3, 10, 30].forEach((v) => { Ln(svg, X(v), y0, X(v), y1, 'stroke:rgba(255,255,255,0.07)'); Tx(svg, X(v), y1 + 15, v + '×', { fs: 10, anchor: 'middle', fill: 'var(--ink-3)' }); });
      [1, 10, 100, 1000].forEach((v) => { Ln(svg, x0, Y(v), x1, Y(v), 'stroke:rgba(255,255,255,0.07)'); Tx(svg, x0 - 6, Y(v) + 3.5, fI(v) + '×', { fs: 10, anchor: 'end', fill: 'var(--ink-3)' }); });
      Pa(svg, `M${x0},${y0}V${y1}H${x1}`, 'fill:none;stroke:var(--ink-3);stroke-width:1.2');
      Tx(svg, (x0 + x1) / 2, ch - 6, 'latency improvement', { fs: 10.5, anchor: 'middle', fill: 'var(--ink-2)' });
      Tx(svg, x0 + 6, y0 + 13, 'bandwidth improvement', { fs: 10.5, fill: 'var(--ink-2)' });
      Pa(svg, `M${r2(X(1))},${r2(Y(1))}L${r2(X(30))},${r2(Y(30))}`, 'fill:none;stroke:var(--ink-3);stroke-width:1.5;stroke-dasharray:5 4');
      {
        const ang = Math.atan2(Y(30) - Y(1), X(30) - X(1)), tx = X(1) + (X(30) - X(1)) * 0.93, ty = Y(1) + (Y(30) - Y(1)) * 0.93;
        const ox = -Math.sin(ang) * 12, oy = Math.cos(ang) * 12;
        Tx(svg, tx + ox, ty + oy, 'if both kept pace: k', { fs: 10, anchor: 'end', fill: 'var(--ink-3)', tf: `rotate(${r2((ang * 180) / Math.PI)} ${r2(tx + ox)} ${r2(ty + oy)})` });
      }
      const kmax = 30;
      Pa(svg, `M${r2(X(1))},${r2(Y(1))}L${r2(X(kmax))},${r2(Y(kmax * kmax))}`, 'fill:none;stroke:var(--memory);stroke-width:2.5');
      {
        // above-left of the line: the label's right end sits where the line is still 5 px below the baseline
        const slope = (Y(1) - Y(kmax * kmax)) / (X(kmax) - X(1)), xr = X(kmax) - Math.max(14, (y0 + 17 - Y(kmax * kmax)) / slope);
        Tx(svg, xr, Y(kmax * kmax) + (X(kmax) - xr) * slope - 5, 'bandwidth ≈ k²', { fs: 11, anchor: 'end', fill: 'var(--memory)', weight: 600, halo: true });
      }
      const k = st.k;
      Ln(svg, X(k), y1, X(k), Y(k * k), 'stroke:var(--accent);stroke-width:1;stroke-dasharray:2 3');
      Ln(svg, x0, Y(k * k), X(k), Y(k * k), 'stroke:var(--accent);stroke-width:1;stroke-dasharray:2 3');
      C(svg, X(k), Y(k * k), 6, 'fill:var(--accent);stroke:var(--bg);stroke-width:2');
      // bars
      const bx0 = mob ? 0 : cw + 30, bx1 = w, by0 = mob ? ch + 14 : 22, bh = mob ? 190 : 226;
      const LD = [1 / 30, 1000];
      const BY = (v) => by0 + bh - ((lg(v) - lg(LD[0])) / (lg(LD[1]) - lg(LD[0]))) * bh;
      const base = BY(1);
      Ln(svg, bx0, base, bx1, base, 'stroke:var(--ink-3);stroke-width:1');
      Tx(svg, bx1, base - 5, '1× (start)', { fs: 10, anchor: 'end', fill: 'var(--ink-3)' });
      const bars = [
        { lab: 'latency', lab2: '', v: 1 / k, c: 'ink-2', txt: '÷' + sg(k, 3) },
        { lab: 'bandwidth', lab2: '', v: k * k, c: 'memory', txt: '×' + sg(k * k, 3) },
        { lab: 'bytes', lab2: 'in flight', v: k, c: 'special', txt: '×' + sg(k, 3) },
      ];
      const colW = (bx1 - bx0 - 70) / 3;
      bars.forEach((b, i) => {
        const x = bx0 + 8 + i * colW, bw = Math.min(56, colW * 0.5), cx = x + colW / 2;
        const y = BY(b.v);
        R(svg, cx - bw / 2, Math.min(y, base), bw, Math.abs(base - y), `fill:var(--${b.c})`, { rx: 3 });
        const inside = b.v < 1 && y - base > 22; // a tall downward bar carries its value inside, clear of the category label
        Tx(svg, cx, b.v >= 1 ? y - 6 : inside ? y - 7 : y + 15, b.txt, { fs: 12, anchor: 'middle', fill: inside ? '#0b0c12' : `var(--${b.c})`, weight: 700 });
        Tx(svg, cx, by0 + bh + 18, b.lab, { fs: 10.5, anchor: 'middle', fill: 'var(--ink-2)' });
        if (b.lab2) Tx(svg, cx, by0 + bh + 31, b.lab2, { fs: 10.5, anchor: 'middle', fill: 'var(--ink-2)' });
      });
      return Math.max(ch, by0 + bh + 38);
    });
    const sL = stat(f, 'latency'), sBw = stat(f, 'bandwidth', 'memory'), sF = stat(f, 'bytes in flight', 'special');
    GG.ui.slider(f.controls, { label: 'latency improves by k =', min: 1, max: 30, step: 0.5, value: st.k, format: (v) => sg(v, 3) + '×', onInput: (v) => { st.k = v; upd(); } });
    function upd() {
      view.redraw();
      const k = st.k;
      sL.set('÷' + sg(k, 3)); sBw.set('×' + sg(k * k, 3)); sF.set('×' + sg(k, 3));
      f.setWhy(k <= 1 ? 'No improvement yet: the same latency, the same bandwidth, the same bytes in flight.' : `If latency improves <b>${sg(k, 3)}×</b>, the rule of thumb says bandwidth improves about <b>${sg(k * k, 3)}×</b>. Each request comes back ${sg(k, 3)}× sooner, but the pipe now carries ${sg(k * k, 3)}× as many bytes per second, so to keep it full a system needs <b>${sg(k, 3)}× more bytes in flight</b>. A system that keeps the old number of requests outstanding now fills only 1/${sg(k, 3)} (${pct(1 / k, 0)}) of the pipe: the future belongs to throughput-oriented designs that keep many requests in flight.`);
    }
    upd();
  }

  /* Fig 6: ridge points move right (the glossary's table) + "very large" matmuls */
  function rmRidges(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Ridge points move right', hint: 'step through generations · size the matmul', wide: true,
      caption: 'Rows of the glossary\'s ridge-point table (dense Tensor Core FLOPS and HBM bandwidth from NVIDIA\'s datasheets); the other two generations of the chosen path are drawn faintly. The bars measure growth relative to the A100. The kernel is an N × N matrix multiplication C = A @ B in the system\'s number format, moving each matrix once: 2N³ FLOPs on 3N² elements, so its intensity is 2N ÷ (3 × bytes per element). H100 FP8 is drawn at the recomputed 590.7 (the glossary\'s table prints 592; see the Checked-the-math note in <a data-term="arithmetic-bandwidth">Arithmetic Bandwidth</a>).',
    });
    const rf = RFC();
    if (!rf) return;
    const P = rf.PRESETS;
    const PATHS = { max: ['a100-bf16', 'h100-fp8', 'b200-fp4'], bf16: ['a100-bf16', 'h100-bf16', 'b200-bf16'] };
    const BYTES = { 'a100-bf16': 2, 'h100-bf16': 2, 'b200-bf16': 2, 'h100-fp8': 1, 'b200-fp8': 1, 'b200-fp4': 0.5 };
    const GEN = ['Ampere · A100', 'Hopper · H100', 'Blackwell · B200'];
    const st = { path: 'max', gen: 1, N: 2048 };
    const cur = () => PATHS[st.path][st.gen];
    const aiOf = (id) => (2 * st.N) / (3 * BYTES[id]);
    const api = rf(f, {
      system: cur(), systems: ['a100-bf16', 'h100-bf16', 'b200-bf16', 'h100-fp8', 'b200-fp8', 'b200-fp4'], compare: PATHS.max.filter((x) => x !== cur()),
      kernels: [{ id: 'mm', label: 'N × N matmul', ai: aiOf(cur()), draggable: false }], showReadouts: true,
      xDomain: [1, 100000], yDomain: [1e12, 4e16],
      why: (x) => {
        const id = x.system.id, b = BYTES[id], need = Math.ceil((1.5 * b * x.ridge) - 1e-9);
        const fmtName = b === 2 ? 'BF16' : b === 1 ? 'FP8' : 'FP4';
        const v = x.bound === 'compute' || x.atRidge ? `reaches the compute roof (${rf.fmt.perf(x.system.flops, 4)})` : `is still memory-bound, at ${rf.fmt.perf(x.attainable)}`;
        return `<b>${x.system.label}</b>: ridge point <b>${rf.fmt.ridge(x.ridge)} FLOPs/byte</b>. A ${fI(st.N)} × ${fI(st.N)} ${fmtName} matmul does ${fmtAI(x.ai)} ${fpw(x.ai)} per byte and ${v}. It needs N ≥ <b>${fI(need)}</b> to escape the memory bottleneck on this system.`;
      },
    });
    const bars = GG.el('div', { class: 'pfa-gauges' });
    f.stage.append(bars);
    const sN = stat(f, 'N needed');
    function paintBars() {
      const s0 = P['a100-bf16'], s1 = P[cur()];
      const rows = [['arithmetic bandwidth', s1.flops / s0.flops, 'core'], ['memory bandwidth', s1.bw / s0.bw, 'memory'], ['ridge point', s1.ridge / s0.ridge, 'ink-2']];
      bars.innerHTML = `<div class="pfa-gauge-h">growth since the A100 (log scale, up to 32×)</div>` + rows.map(([l, v, c]) => `<div class="pfa-gauge" style="--gc:var(--${c})"><span>${l}</span><span class="tr"><i style="width:${(clamp(lg(v) / lg(32), 0, 1) * 100).toFixed(1)}%"></i></span><b>×${num(v, v < 10 ? 2 : 1)}</b></div>`).join('');
      sN.set('N ≥ ' + fI(Math.ceil(1.5 * BYTES[cur()] * s1.ridge - 1e-9)));
    }
    function set() {
      api.setSystem(cur());
      api.setCompare(PATHS[st.path].filter((x) => x !== cur()));
      api.setKernel('mm', aiOf(cur()));
      paintBars();
    }
    GG.ui.seg(f.controls, { label: 'path', value: st.path, options: [{ value: 'max', label: 'highest ridge per generation', title: 'A100 BF16 → H100 FP8 → B200 FP4' }, { value: 'bf16', label: 'BF16 throughout' }], onChange: (v) => { st.path = v; set(); } });
    GG.ui.seg(f.controls, { label: 'generation', value: st.gen, options: GEN.map((g, i) => ({ value: i, label: g })), onChange: (v) => { st.gen = v; set(); } });
    GG.ui.slider(f.controls, { label: 'matmul size N', min: 64, max: 16384, step: 1, log: true, value: st.N, format: (v) => fI(v), onInput: (v) => { st.N = Math.round(v); api.setKernel('mm', aiOf(cur())); } });
    paintBars();
  }

  /* Fig 7: Dennard scaling, and what happened after it */
  function rmDennard(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'More transistors, fixed power', hint: 'add process generations · switch eras', wide: true,
      caption: 'Idealized scaling: each generation shrinks transistors by κ = √2, doubling how many fit on the same area (Moore\'s Law). Switching power per transistor ∝ C × V² × f. Under Dennard scaling V shrinks by κ; afterwards it stays put. The chip keeps the power budget of generation 0; lit squares are the share of transistors that can switch at full speed within it.',
    });
    const K = Math.SQRT2;
    const st = { n: 3, era: 'post', clock: 'raise' };
    const shareTxt = (u) => (u >= 0.9995 ? '100%' : sg(u * 100, 3) + '%');
    function model() {
      const n = st.n, T = 2 ** n, fq = st.clock === 'raise' ? K ** n : 1, V = st.era === 'dennard' ? K ** -n : 1, Cc = K ** -n;
      const p = Cc * V * V * fq, Pall = T * p, u = Math.min(1, 1 / Pall);
      return { n, T, fq, V, p, Pall, u };
    }
    const view = rsvg(f.stage, 'A chip drawn as a grid of transistor blocks; lit blocks are the share that can switch within the power budget.', (svg, w) => {
      const mob = w < 600;
      const md = model();
      const count = 4 * md.T;
      const cols = 2 ** Math.ceil((st.n + 2) / 2), rows = count / cols;
      const side = Math.min(mob ? w - 8 : 300, 300);
      const chipX = mob ? (w - side) / 2 : 6, chipY = 8;
      R(svg, chipX - 4, chipY - 4, side + 8, side * (rows / cols) + 8, 'fill:var(--surface-2);stroke:var(--line-2);stroke-width:1.5', { rx: 8 });
      const cs = side / cols, gap = Math.max(0.6, cs * 0.12);
      const lit = Math.round(md.u * count);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          const on = i < lit;
          R(svg, chipX + c * cs + gap / 2, chipY + r * cs + gap / 2, cs - gap, cs - gap, on ? `fill:var(--core);opacity:${0.55 + 0.45 * Math.min(1, md.fq / K ** 6)}` : 'fill:#232638', { rx: Math.min(3, cs * 0.15) });
        }
      }
      const chH = side * (rows / cols) + 8;
      // side panel
      const px = mob ? 0 : side + 40, py = mob ? chipY + chH + 18 : 18;
      const lines = [
        ['process generation', String(st.n)],
        ['transistors on the chip', '×' + fI(md.T)],
        ['clock', '×' + num(md.fq, 2)],
        ['supply voltage', '×' + num(md.V, 3)],
        ['power per transistor', '×' + num(md.p, 3)],
        ['power if all switch at once', '×' + num(md.Pall, 2)],
        ['share that can switch', shareTxt(md.u)],
      ];
      lines.forEach(([a, b], i) => {
        const y = py + i * 26;
        Tx(svg, px, y + 12, a, { fs: 11.5, fill: 'var(--ink-2)' });
        const hot = i === 6 || (i === 5 && md.Pall > 1.001);
        Tx(svg, mob ? w : Math.min(w, px + 320), y + 12, b, { fs: 12.5, anchor: 'end', fill: i === 6 ? (md.u < 0.999 ? 'var(--danger)' : 'var(--core)') : hot ? 'var(--control)' : 'var(--ink)', weight: 600 });
        Ln(svg, px, y + 19, mob ? w : Math.min(w, px + 320), y + 19, 'stroke:var(--line);stroke-width:1');
      });
      return Math.max(chipY + chH + 4, py + lines.length * 26 + 4);
    });
    const sU = stat(f, 'usable share', 'core'), sP = stat(f, 'power density if all on', 'control');
    GG.ui.slider(f.controls, { label: 'process generations', min: 0, max: 6, step: 1, value: st.n, format: (v) => String(v), onInput: (v) => { st.n = Math.round(v); upd(); } });
    GG.ui.seg(f.controls, { label: 'era', value: st.era, options: [{ value: 'dennard', label: 'Dennard: V shrinks', title: 'supply voltage falls by κ each generation' }, { value: 'post', label: 'after ~2005: V stuck', title: 'supply voltage stays put' }], onChange: (v) => { st.era = v; upd(); } });
    GG.ui.seg(f.controls, { label: 'clock', value: st.clock, options: [{ value: 'raise', label: 'raise it ×1.41 per gen' }, { value: 'hold', label: 'hold it' }], onChange: (v) => { st.clock = v; upd(); } });
    function upd() {
      view.redraw();
      const md = model();
      sU.set(shareTxt(md.u), md.u < 0.999 ? 'danger' : 'core');
      sP.set('×' + num(md.Pall, 2));
      let t;
      if (st.n === 0) t = 'Generation 0: the starting chip, every transistor switching within the power budget. Add generations to shrink the transistors.';
      else if (st.era === 'dennard' && st.clock === 'raise') t = `Under Dennard scaling, ${st.n} ${plural(st.n, 'generation')} give <b>${fI(md.T)}×</b> the transistors, clocked <b>${num(md.fq, 2)}×</b> faster, and each uses ${num(1 / md.p, 1)}× less power, so the whole chip still fits the same power budget: <b>every transistor can switch</b>. Faster clocks came free, which is what kept general-purpose, latency-oriented CPUs ahead of special-purpose hardware.`;
      else if (st.era === 'dennard') t = `Under Dennard scaling with the clock held, ${st.n} ${plural(st.n, 'generation')} give <b>${fI(md.T)}×</b> the transistors and each uses ${num(1 / md.p, 1)}× less power, so the whole chip uses only <b>${num(md.Pall, 2)}×</b> its power budget. That headroom would pay for a <b>${num(K ** st.n, 2)}×</b> faster clock: the free frequency that Dennard scaling handed out every generation. Switch the clock to “raise it” to spend it.`;
      else t = `With the voltage stuck, ${st.n} ${plural(st.n, 'generation')} still give <b>${fI(md.T)}×</b> the transistors, but ${st.clock === 'raise' ? `raising the clock ${num(md.fq, 2)}× leaves each transistor using just as much power as before` : `each one only uses ${num(1 / md.p, 2)}× less power`}. Switching all of them would take <b>${num(md.Pall, 2)}×</b> the power budget, so only <b>${shareTxt(md.u)}</b> can be active at once. Transistors are abundant and power is scarce: spend the dark area on specialized units that switch on only when their job comes up.`;
      f.setWhy(t);
    }
    upd();
  }


  /* ═════════════════════════ shared: utilization gauges ═════════════════════════ */
  function gaugeBox(parent) {
    const el = GG.el('div', { class: 'pfa-gauges', 'aria-live': 'off' });
    parent.append(el);
    return {
      el,
      set(rows) {
        el.innerHTML = rows.map((r) => (r.head ? `<div class="pfa-gauge-h">${r.head}</div>` :
          `<div class="pfa-gauge" style="--gc:var(--${r.c})"><span>${r.l}</span><span class="tr" role="img" aria-label="${GG.esc(r.l)}: ${GG.esc(r.t)}"><i style="width:${(clamp(r.v, 0, 1) * 100).toFixed(2)}%"></i></span><b>${r.t}</b></div>`)).join('');
      },
    };
  }
  /* pipe and bandwidth utilization of a kernel at intensity ai running at its roof */
  function utilOf(ai, sys) {
    const P = Math.min(sys.flops, sys.bw * ai);
    return { P, pipes: P / sys.flops, bw: P / ai / sys.bw };
  }

  /* ═════════════════════════ COMPUTE-BOUND ═════════════════════════ */

  const ALMANAC = 'https://modal.com/llm-almanac/summary';
  const D_MODEL = 8192;
  const gemmAI = (T, d) => (T * d) / (d + 2 * T); // X[T×d] @ W[d×d], BF16: 2Td² FLOPs on 2(d² + 2Td) bytes

  GG.entry('compute-bound', {
    render(body, ctx) {
      const s = ctx.html(body, `
<p><a data-term="kernel">Kernels</a> that are <strong>compute-bound</strong> are limited by the <a data-term="arithmetic-bandwidth">arithmetic bandwidth</a> of the <a data-term="cuda-core">CUDA Cores</a> or <a data-term="tensor-core">Tensor Cores</a>. The math units are the neck: data arrives fast enough, and the kernel would run faster only if the chip could perform more floating point operations per second.</p>
<div data-slot="f1"></div>
<p>In the <a data-term="roofline-model">roofline diagram</a>, compute-bound kernels are the ones underneath the flat compute roof, to the right of the ridge point. The glossary's figure draws that roof in blue; here it is green, this site's colour for compute.</p>
<h3>High arithmetic intensity</h3>
<p>Compute-bound kernels are characterized by high <a data-term="arithmetic-intensity">arithmetic intensity</a>: many arithmetic operations per byte of memory loaded or stored. <a data-term="pipe-utilization">Utilization of arithmetic pipes</a> is the limiting factor for a compute-bound kernel. The gauges under Fig.&nbsp;1 show the difference: right of the ridge it is the arithmetic pipes that run at 100% while the memory bandwidth has room to spare; left of it, the other way round.</p>
<p>The kernel in Fig.&nbsp;1 is the workhorse of a Transformer: a batch of <i>T</i> token vectors multiplied by a <i>d</i>&nbsp;×&nbsp;<i>d</i> weight matrix, with <i>d</i> = 8,192 and 16-bit (BF16) numbers. It performs 2<i>Td</i>² FLOPs and moves the weights once plus <i>T</i> input and <i>T</i> output vectors:</p>
<div class="pfa-eq" role="math" aria-label="arithmetic intensity equals 2 T d squared over 2 times d squared plus 2 T d, which is T d over d plus 2 T, about T when T is much smaller than d"><span>intensity</span><span class="op">=</span><span class="fr"><span class="c-core">2 T d²</span><span class="c-memory">2 (d² + 2 T d)</span></span><span class="op">=</span><span class="fr"><span>T d</span><span>d + 2T</span></span><span class="op">≈</span><span><b>T</b> FLOPs/byte</span><small>for T much smaller than d: every weight byte fetched is used by all T tokens</small></div>
<p>For a single token that is about one FLOP per byte, deep in memory-bound territory. With a few hundred tokens, each weight fetched from memory is reused hundreds of times, and the kernel crosses the ridge: on an H100 running BF16 (ridge 295.2) it takes <i>T</i> ≥ 319 at <i>d</i> = 8,192, since <i>T</i>&nbsp;×&nbsp;8,192 ÷ (8,192 + 2<i>T</i>) first reaches 295.2 there. Prefill of a prompt with thousands of tokens is comfortably past it.</p>
<h3>One kernel, or a whole workload?</h3>
<p>Technically, compute-boundedness is only defined for a single <a data-term="kernel">kernel</a>, as part of the <a data-term="roofline-model">roofline model</a>, but with a bit of squinting it can be generalized to cover the multiple kernels that make up a typical workload. Fig.&nbsp;2 squints at one feed-forward block of a Transformer: five kernels, each with its own verdict. When nearly all of the block's time goes to compute-bound kernels, it is fair to call the block, and a model built from such blocks, compute-bound.</p>
<div data-slot="f2"></div>
<h3>Where compute-bound workloads come from</h3>
<p>Large diffusion model inference workloads are generally compute-bound. Contemporary large language model inference workloads are often compute-bound during batch prefill/prompt processing, when each weight can be loaded into <a data-term="shared-memory">shared memory</a> once and then used across many tokens. That is the reuse Fig.&nbsp;1 measures: prefill feeds the whole prompt, hundreds or thousands of tokens, through each weight matrix at once.</p>
${GG.noteHTML('beyond', '<p>Why diffusion models? Within one denoising step, a diffusion model applies the same weights to every position of the image it is denoising, thousands of positions at once. Like prefill, each weight fetched from memory is reused across all of those positions, which is what pushes the arithmetic intensity past the ridge. A diffusion model runs many denoising steps, but each step fetches the weights again, so the steps multiply the total work without raising the intensity.</p>')}
<h3>A back-of-the-envelope estimate</h3>
<p>Let's do a simple estimation, inspired by <a href="https://twitter.com/kipperrii">kipperrii</a>'s <a href="https://kipp.ly/transformer-inference-arithmetic">Transformer inference arithmetic</a> framework, of the minimum latency between tokens (inter-token latency or time per output token) for compute-bound Transformer language model inference.</p>
<p>Assume the model has 500B parameters, stored in 16-bit precision, for a total of 1 TB. This model will perform roughly one trillion floating point operations (one multiply and one accumulate per parameter) per batch element. Run on a GPU with one petaFLOP/s of <a data-term="arithmetic-bandwidth">arithmetic bandwidth</a> for 16-bit matrix math, the minimum latency between tokens, assuming compute-boundedness, is one millisecond per batch element.</p>
<p>Note that for this GPU to be compute-bound at batch size one, it would need a <a data-term="memory-bandwidth">memory bandwidth</a> of 1 PB/s (so that it can load all 1 TB of weights in one ms). Contemporary <a data-term="memory-bandwidth">memory bandwidths</a> are in the TB/s range, and so batches of hundreds of inputs are required to provide sufficient <a data-term="arithmetic-intensity">arithmetic intensity</a> for execution to be compute-bound. Fig.&nbsp;3 runs the whole estimate and lets you change every assumption; it starts with an H100's 3.35 TB/s.</p>
<div data-slot="f3"></div>
${GG.noteHTML('intuition', '<p>A shortcut hides in these numbers. With 16-bit weights a decode step at batch size <i>B</i> does 2<i>B</i> FLOPs per parameter and loads 2 bytes per parameter, so its arithmetic intensity is simply <i>B</i> FLOPs per byte. The batch size needed to become compute-bound is therefore the ridge point itself: about 300 for a GPU with 1 PFLOP/s and 3.35 TB/s, or 295 for an H100 running BF16.</p>')}
<p>For more on LLM inference, see our <a href="${ALMANAC}">LLM Engineer's Almanac</a>. The <a data-term="memory-bound">memory-bound</a> entry looks at the same model from the other side, where batches are small. Its Fig.&nbsp;3 starts from that entry's own number, 10 TB/s, instead of an H100's 3.35 TB/s, so there the weights load in 100 ms rather than 299 ms, and decoding turns compute-bound at a batch of 100 rather than 299.</p>
<div data-slot="reading"></div>`);
      guard(() => cbRoofline(ctx, s.f1), 'roofline');
      guard(() => cbWorkload(ctx, s.f2), 'workload');
      guard(() => cbEstimate(ctx, s.f3), 'estimate');
      ctx.reading(s.reading, [
        { href: WWP, label: 'Williams, Waterman and Patterson (2008)', note: 'the roofline model the glossary\'s diagram is adapted from' },
        { href: 'https://kipp.ly/transformer-inference-arithmetic', label: 'kipply, <i>Transformer Inference Arithmetic</i>', note: 'the framework behind the estimate' },
        { href: 'https://twitter.com/kipperrii', label: 'kipperrii on Twitter' },
        { href: ALMANAC, label: 'Modal: LLM Engineer\'s Almanac' },
      ]);
    },
  });

  /* Fig 1: prefill vs decode on a roofline, with utilization gauges */
  function cbRoofline(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Crossing into compute-bound', hint: 'slide the tokens · switch GPU', wide: true,
      caption: `The shaded region under the flat roof is compute-bound. Both kernels multiply token vectors by one ${fI(D_MODEL)} × ${fI(D_MODEL)} BF16 weight matrix: decode handles one token, prefill handles T tokens at once. Their intensity is T·d ÷ (d + 2T). The gauges assume the kernel runs exactly at its roof. Adapted from <a href="${WWP}">Williams, Waterman, and Patterson (2008)</a>.`,
    });
    const rf = RFC();
    if (!rf) return;
    const st = { T: 2048 };
    const K = () => ([
      { id: 'pre', label: 'Prefill: T tokens', ai: gemmAI(st.T, D_MODEL), draggable: false },
      { id: 'dec', label: 'Decode: 1 token', ai: gemmAI(1, D_MODEL), draggable: false },
    ]);
    const needT = (R) => Math.ceil((R * D_MODEL) / (D_MODEL - 2 * R) - 1e-9);
    const api = rf(f, {
      system: 'h100-bf16', systems: ['a100-bf16', 'h100-bf16', 'b200-bf16'], showControls: true, showReadouts: true, shade: 'compute', kernels: K(),
      xDomain: [0.3, 10000], yDomain: [1e11, 2e16],
      why: (x) => {
        const T = st.T, ai = gemmAI(T, D_MODEL), n = needT(x.ridge);
        const u = utilOf(ai, x.system);
        if (ai >= x.ridge) return `Prefill with <b>T = ${fI(T)}</b> tokens does ${fmtAI(ai)} ${fpw(ai)} per byte, past ${x.system.label}'s ridge (${rf.fmt.ridge(x.ridge)}): <b>compute-bound</b>. Its arithmetic pipes are the limit (100% busy) while only ${pct(u.bw, 0)} of the memory bandwidth is used. Adding tokens now adds time, not speed. Decode, at 1 FLOP per byte, stays far to the left.`;
        return `Prefill with <b>T = ${fI(T)}</b> ${plural(T, 'token')} does ${fmtAI(ai)} ${fpw(ai)} per byte, short of ${x.system.label}'s ridge (${rf.fmt.ridge(x.ridge)}): still <b>memory-bound</b>, with the arithmetic pipes ${pct(u.pipes, u.pipes < 0.1 ? 1 : 0)} busy. On this GPU it takes T ≥ <b>${fI(n)}</b> tokens to become compute-bound.`;
      },
    });
    const gz = gaugeBox(f.stage);
    function paint() {
      const sys = api.state().system;
      const up = utilOf(gemmAI(st.T, D_MODEL), sys), ud = utilOf(gemmAI(1, D_MODEL), sys);
      gz.set([
        { head: `prefill, T = ${fI(st.T)}` },
        { l: 'arithmetic pipes busy', v: up.pipes, c: 'core', t: pct(up.pipes, up.pipes < 0.1 ? 1 : 0) },
        { l: 'memory bandwidth used', v: up.bw, c: 'memory', t: pct(up.bw, up.bw < 0.1 ? 1 : 0) },
        { head: 'decode, 1 token' },
        { l: 'arithmetic pipes busy', v: ud.pipes, c: 'core', t: pct(ud.pipes, 1) },
        { l: 'memory bandwidth used', v: ud.bw, c: 'memory', t: pct(ud.bw, 0) },
      ]);
    }
    api.on('change', paint);
    GG.ui.slider(f.controls, { label: 'prefill tokens T', min: 1, max: 16384, step: 1, log: true, value: st.T, format: (v) => fI(v), onInput: (v) => { st.T = Math.max(1, Math.round(v)); api.setKernel('pre', gemmAI(st.T, D_MODEL)); api.select('pre'); } });
    paint();
  }

  /* Fig 2: squinting at a workload of five kernels */
  function cbWorkload(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Squinting at a workload', hint: 'slide the tokens', wide: true,
      caption: `One feed-forward block of a Transformer layer with d = ${fI(D_MODEL)}, BF16 activations and weights, on an H100 SXM. Each kernel is timed at its roof, max(FLOPs ÷ FLOP/s, bytes ÷ 3.35 TB/s), with launch overhead ignored. The two matrix multiplications use the Tensor Cores (989 TFLOP/s, ridge 295.2); the elementwise kernels use the CUDA Cores (66.9 TFLOP/s, ridge 19.97). Elementwise FLOP counts are rough (about 8 per element for LayerNorm and GELU); they are memory-bound either way.`,
    });
    const d = D_MODEL;
    const KS = [
      { id: 'ln', name: 'LayerNorm', short: 'LN', F: H100.cc, fl: (T) => 8 * T * d, by: (T) => 4 * T * d },
      { id: 'up', name: 'Up-projection (d → 4d)', short: 'up', F: H100.tc, fl: (T) => 8 * T * d * d, by: (T) => 10 * T * d + 8 * d * d },
      { id: 'gelu', name: 'GELU', short: 'GELU', F: H100.cc, fl: (T) => 32 * T * d, by: (T) => 16 * T * d },
      { id: 'down', name: 'Down-projection (4d → d)', short: 'down', F: H100.tc, fl: (T) => 8 * T * d * d, by: (T) => 10 * T * d + 8 * d * d },
      { id: 'res', name: 'Residual add', short: 'add', F: H100.cc, fl: (T) => T * d, by: (T) => 6 * T * d },
    ];
    const st = { T: 2048 };
    function calc() {
      const T = st.T;
      const rows = KS.map((k) => {
        const fl = k.fl(T), by = k.by(T), tc = fl / k.F, tm = by / H100.bw;
        return { k, fl, by, ai: fl / by, ridge: k.F / H100.bw, t: Math.max(tc, tm), cb: tc >= tm };
      });
      const tot = rows.reduce((a, r) => a + r.t, 0), tcb = rows.reduce((a, r) => a + (r.cb ? r.t : 0), 0);
      return { rows, tot, share: tcb / tot };
    }
    const tbl = GG.el('div', { class: 'pfa-tw' });
    const view = rsvg(f.stage, 'A timeline of five kernels drawn with widths proportional to their time, coloured green when compute-bound and blue when memory-bound.', (svg, w) => {
      const mob = w < 560;
      const c = calc();
      let x = 0;
      const y = 22, h = mob ? 34 : 40;
      Tx(svg, 0, 12, `one feed-forward block, T = ${fI(st.T)}: ${fmtT(c.tot)}`, { fs: 11, fill: 'var(--ink-2)' });
      c.rows.forEach((r, i) => {
        const ww = (w * r.t) / c.tot;
        R(svg, x + 0.5, y, Math.max(0.8, ww - 1), h, `fill:var(--${r.cb ? 'core' : 'memory'});opacity:${r.cb ? 0.9 : 0.75}`, { rx: 3 });
        const lab = mob ? r.k.short : r.k.short === 'LN' ? 'LayerNorm' : r.k.short;
        if (ww > tw(lab, 10.5) + 8) Tx(svg, x + ww / 2, y + h / 2 + 4, lab, { fs: 10.5, anchor: 'middle', fill: '#0b0c12', weight: 700 });
        x += ww;
        void i;
      });
      // share bar
      const y2 = y + h + 22;
      Tx(svg, 0, y2, 'time in compute-bound kernels', { fs: 10.5, fill: 'var(--ink-3)' });
      Tx(svg, w, y2, pct(c.share, 1), { fs: 11, anchor: 'end', fill: 'var(--ink)', weight: 600 });
      R(svg, 0, y2 + 6, w, 8, 'fill:rgba(255,255,255,0.07)', { rx: 4 });
      R(svg, 0, y2 + 6, w * c.share, 8, 'fill:var(--core)', { rx: 4 });
      Ln(svg, w / 2, y2 + 3, w / 2, y2 + 17, 'stroke:var(--ink-3);stroke-width:1;stroke-dasharray:2 2');
      return y2 + 20;
    });
    legend(f.stage, [['var(--core)', 'compute-bound kernel'], ['var(--memory)', 'memory-bound kernel']]);
    f.stage.append(tbl);
    const sS = stat(f, 'compute-bound share', 'core'), sV = stat(f, 'squinting, the block is');
    const sl = GG.ui.slider(f.controls, { label: 'tokens T', min: 1, max: 16384, step: 1, log: true, value: st.T, format: (v) => fI(v), onInput: (v) => { st.T = Math.max(1, Math.round(v)); upd(); } });
    const pr = presets(f.controls, 'jump to', [{ id: 'dec', label: 'decode (T = 1)', T: 1 }, { id: 'pre', label: 'prefill (T = 2,048)', T: 2048 }], (it) => { st.T = it.T; sl.set(it.T, false); upd(); });
    function upd() {
      view.redraw();
      const c = calc();
      tbl.innerHTML = TB('<thead><tr><th>kernel</th><th class="num">FLOPs</th><th class="num">bytes</th><th class="num">FLOPs/byte</th><th class="num">ridge</th><th>bound</th><th class="num">time</th></tr></thead><tbody>' +
        c.rows.map((r) => `<tr><td>${r.k.name}</td><td class="num">${fmtF(r.fl).replace(' FLOPs', '')}</td><td class="num">${fmtB(r.by)}</td><td class="num">${fmtAI(r.ai)}</td><td class="num">${fmtAI(r.ridge)}</td><td class="${r.cb ? 'c-core' : 'c-memory'}">${r.cb ? 'compute' : 'memory'}</td><td class="num">${fmtT(r.t)}</td></tr>`).join('') + '</tbody>');
      sS.set(pct(c.share, 1));
      const v = c.share >= 0.5 ? 'compute-bound' : 'memory-bound';
      sV.set(v, c.share >= 0.5 ? 'core' : 'memory');
      pr.mark((it) => it.T === st.T);
      const gemm = c.rows[1];
      let t;
      if (c.share >= 0.5) t = `With <b>T = ${fI(st.T)}</b> tokens the two matrix multiplications do ${fmtAI(gemm.ai)} ${fpw(gemm.ai)} per byte, past the Tensor Cores' ridge, and take <b>${pct(c.share, 1)}</b> of the block's time. The three elementwise kernels stay memory-bound, but squinting, the block is <b>compute-bound</b>.`;
      else t = `With <b>T = ${fI(st.T)}</b> ${plural(st.T, 'token')} even the matrix multiplications do only ${fmtAI(gemm.ai)} ${fpw(gemm.ai)} per byte, below the ridge (295.2), so ${c.share > 0 ? 'most' : 'all'} of the block's time is spent waiting on memory: squinting, it is <b>memory-bound</b>. The matmuls cross the ridge at T = 310.`;
      f.setWhy(t);
    }
    upd();
  }

  /* Fig 3: the worked estimate, as a calculator */
  function cbEstimate(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Minimum time per token, compute-bound', hint: 'change any assumption', wide: true,
      caption: 'The glossary\'s estimate, step by step. The defaults are its numbers, with an H100\'s 3.35 TB/s for the memory bandwidth. Every result is recomputed from the inputs; FLOPs per token assume one multiply and one accumulate per parameter (attention and other costs are ignored), and the times assume the GPU runs exactly at its roofs.',
    });
    const st = { P: 500e9, b: 2, F: 1e15, BW: 3.35e12, B: 1 };
    const cards = GG.el('div', { class: 'pfa-cards', style: 'margin-bottom:16px' });
    f.stage.append(cards);
    const view = rsvg(f.stage, 'Two bars: the time to do the math for the whole batch, and the time to load all the weights once. The longer one sets the time per step.', (svg, w) => {
      const W = st.P * st.b, tc = (st.B * 2 * st.P) / st.F, tm = W / st.BW, T = Math.max(tc, tm);
      let y = 22;
      Tx(svg, 0, 12, `one decode step at batch size ${fI(st.B)}: ${fmtT(T)}`, { fs: 11, fill: 'var(--ink-2)' });
      [['math for the batch', tc, 'core', `${fI(st.B)} × ${fmtT((2 * st.P) / st.F)}`], ['load every weight once', tm, 'memory', `${fmtB(W)} ÷ ${fmtBW(st.BW)}`]].forEach(([l, t, c, det]) => {
        const isB = t >= T * 0.9999;
        const bw0 = w * (t / T);
        Tx(svg, 0, y + 11, l, { fs: 11, fill: isB ? 'var(--ink)' : 'var(--ink-2)', weight: 600 });
        Tx(svg, w, y + 11, fmtT(t) + '  (' + det + ')', { fs: 10.5, anchor: 'end', fill: 'var(--ink-3)' });
        R(svg, 0, y + 16, w, 16, 'fill:rgba(255,255,255,0.05)', { rx: 4 });
        R(svg, 0, y + 16, Math.max(1.5, bw0), 16, `fill:var(--${c});opacity:${isB ? 1 : 0.45}`, { rx: 4 });
        if (isB) Tx(svg, 6, y + 28, 'sets the pace', { fs: 10, fill: '#0b0c12', weight: 700 });
        y += 44;
      });
      return y - 8;
    });
    const sBn = stat(f, 'bound'), sL = stat(f, 'time per token'), sTp = stat(f, 'tokens/s (all sequences)');
    function upd() {
      view.redraw();
      const W = st.P * st.b, fpt = 2 * st.P, tpe = fpt / st.F, bwNeed = W / tpe, tm = W / st.BW;
      const Bstar = tm / tpe, Bn = Math.ceil(Bstar - 1e-9), tc = st.B * tpe, T = Math.max(tc, tm);
      const prec = st.b === 4 ? '32-bit' : st.b === 2 ? '16-bit' : st.b === 1 ? '8-bit' : '4-bit';
      const C = (n, l, m, hot) => `<div class="pfa-card${hot ? ' hot' : ''}"><span>${n}</span><div class="l">${l}<span class="m">${m}</span></div></div>`;
      cards.innerHTML = [
        C(1, 'Weights to store', `${sg(st.P / 1e9, 4)}B parameters × ${sg(st.b, 2)} bytes (${prec}) = <b>${fmtB(W)}</b>`),
        C(2, 'FLOPs per token, for each batch element', `${sg(st.P / 1e9, 4)}B × 2 (one multiply + one accumulate) = <b>${fmtF(fpt)}</b>`),
        C(3, 'Minimum time per token, per batch element, if compute-bound', `${fmtF(fpt)} ÷ ${fmtRate(st.F)} = <b>${fmtT(tpe)}</b> per batch element`, true),
        C(4, 'Memory bandwidth needed to be compute-bound at batch size 1', `${fmtB(W)} of weights in ${fmtT(tpe)} = <b>${fmtBW(bwNeed)}</b>`),
        C(5, `With ${fmtBW(st.BW)}, loading the weights once takes`, `${fmtB(W)} ÷ ${fmtBW(st.BW)} = <b>${fmtT(tm)}</b>, the time of ${sg(Bstar, 4)} batch elements' math, so batches of <b>${fI(Bn)}</b> or more are compute-bound`, true),
      ].join('');
      const at = Math.abs(tc - tm) <= 1e-9 * tm, cb = tc > tm && !at;
      sBn.set(at ? 'at the crossover' : cb ? 'compute-bound' : 'memory-bound', at ? null : cb ? 'core' : 'memory');
      sL.set(fmtT(T));
      sTp.set(sg(st.B / T, 3));
      let t;
      if (at) t = `At batch size <b>${fI(st.B)}</b> the math and the weight load take the same time, <b>${fmtT(tm)}</b>: exactly at the crossover between memory-bound and compute-bound. With these numbers the memory bandwidth (${fmtBW(st.BW)}) is just enough to load all ${fmtB(W)} of weights in the ${fmtT(tpe)} the math takes per batch element.`;
      else if (cb) t = `At batch size <b>${fI(st.B)}</b> the math (${fmtT(tc)}) outlasts the weight load (${fmtT(tm)}): <b>compute-bound</b>. Each step produces one token for ${st.B === 1 ? 'the single sequence' : `each of the ${fI(st.B)} sequences`}, so the time between tokens is <b>${fmtT(T)}</b>, ${fmtT(tpe)} per batch element, and throughput is capped at ${sg(st.F / fpt, 3)} tokens/s however large the batch.`;
      else {
        const idle = 1 - tc / tm;
        t = `At batch size <b>${fI(st.B)}</b> the weights take ${fmtT(tm)} to load but the math only ${fmtT(tc)}: <b>memory-bound</b>, with the compute units idle ${idle > 0.999 ? 'more than 99.9%' : pct(idle, 1)} of the time. The glossary's point: at ${fmtBW(st.BW)} it takes a batch of <b>${fI(Bn)}</b> to be compute-bound, while reaching the ${fmtT(tpe)}-per-element pace at batch size 1 would need <b>${fmtBW(bwNeed)}</b>.`;
      }
      f.setWhy(t);
    }
    GG.ui.slider(f.controls, { label: 'parameters', min: 1e9, max: 2e12, log: true, value: st.P, format: (v) => sg(v / 1e9, 3) + 'B', onInput: (v) => { st.P = rp(v, 3); upd(); } });
    GG.ui.seg(f.controls, { label: 'precision', value: st.b, options: [{ value: 4, label: '32-bit' }, { value: 2, label: '16-bit' }, { value: 1, label: '8-bit' }, { value: 0.5, label: '4-bit' }], onChange: (v) => { st.b = v; upd(); } });
    GG.ui.slider(f.controls, { label: 'arithmetic bandwidth', min: 1e13, max: 2e16, log: true, value: st.F, format: (v) => fmtRate(v), onInput: (v) => { st.F = rp(v, 3); upd(); } });
    GG.ui.slider(f.controls, { label: 'memory bandwidth', min: 5e11, max: 1e15, log: true, value: st.BW, format: (v) => fmtBW(v), onInput: (v) => { st.BW = rp(v, 3); upd(); } });
    GG.ui.slider(f.controls, { label: 'batch size', min: 1, max: 4096, step: 1, log: true, value: st.B, format: (v) => fI(v), onInput: (v) => { st.B = Math.max(1, Math.round(v)); upd(); } });
    upd();
  }

  /* ═════════════════════════ MEMORY-BOUND ═════════════════════════ */

  GG.entry('memory-bound', {
    render(body, ctx) {
      const s = ctx.html(body, `
<p><a data-term="kernel">Kernels</a> that are <strong>memory-bound</strong> are limited by the <a data-term="memory-bandwidth">memory bandwidth</a> of the GPU. The compute units could do more work, but the bytes they need arrive too slowly, so the arithmetic pipes spend most of their time waiting.</p>
<div data-slot="f1"></div>
<p>Roofline diagrams like Fig.&nbsp;1 help identify whether a program's performance is bottlenecked by compute power, memory bandwidth, or something else. Memory-bound kernels sit under the slanted memory roof, left of the ridge point. Try the systems: a memory-bound kernel speeds up with bandwidth and with smaller numbers, not with more FLOPS.</p>
<h3>Which memory, exactly?</h3>
<p>Specifically, memory-bound kernels are limited by <a data-term="memory-bandwidth">the bandwidth</a> between the <a data-term="gpu-ram">GPU RAM</a> and the <a data-term="l1-data-cache">local cache</a> of the <a data-term="streaming-multiprocessor">Streaming Multiprocessors</a>, because the problems of interest for GPU performance generally have <a href="https://en.wikipedia.org/wiki/Working_set_size">working set sizes</a> much larger than any higher level of the <a data-term="memory-hierarchy">memory hierarchy</a>. A computation's <em>working set</em> is the data it needs to keep at hand while it runs. If that fits in a fast, small level of the hierarchy, the data can be reused from there; if not, it has to stream in from the big, slow level, again and again.</p>
<div data-slot="f2"></div>
${GG.noteHTML('beyond', '<p>The capacities in Fig.&nbsp;2 are an H100 SXM\'s: 256 KiB of registers and 256 KiB of combined L1 data cache and shared memory in each of 132 SMs, a 50 MiB L2 cache shared by all SMs (NVIDIA\'s H100 whitepaper writes it as “50 MB”), and 80 GiB of HBM3 GPU RAM (85.9 GB; the datasheet writes “80GB”). Even the whole L2 cannot hold a single 4,096 × 4,096 matrix of FP32 numbers (64 MiB).</p>')}
<h3>Lower intensity, relative to the ridge</h3>
<p>Memory-bound kernels have a lower <a data-term="arithmetic-intensity">arithmetic intensity</a> (fewer operations per byte moved), relative to the ridge point of their <a data-term="roofline-model">roofline model</a>. "Relative" matters: 100 FLOPs per byte is memory-bound on an H100's BF16 Tensor Cores (ridge 295.2) but compute-bound on its FP32 CUDA Cores (ridge 19.97).</p>
<p>Technically, memory-boundedness is only defined for a single <a data-term="kernel">kernel</a>, as part of the <a data-term="roofline-model">roofline model</a>, but with a bit of squinting it can be generalized to cover the multiple kernels that make up a typical workload, just as for <a data-term="compute-bound">compute-bound</a> workloads.</p>
<h3>LLM decoding</h3>
<p>Contemporary large language model inference workloads are often memory-bound during the decode/output generation stage, when the weights must be loaded once in each forward pass. That happens once per output token, unless multi-token prediction or speculative decoding are used, which makes it easy to calculate the minimum latency between tokens (intertoken latency or time per output token) for memory-bound Transformer large language model inference.</p>
<p>Assume the model has 500B parameters, stored in 16-bit precision, for a total of 1 TB. If we run inference on a single GPU with a <a data-term="memory-bandwidth">memory bandwidth</a> of 10 TB/s, we can load the weights once every 100 ms, and that puts a lower bound on our intertoken latency. By batching multiple inputs together, we can linearly increase the number of floating point operations done per parameter loaded (the <a data-term="arithmetic-intensity">arithmetic intensity</a>), in principle up to the point of <a data-term="compute-bound">compute-boundedness</a>, without incurring any additional latency, which implies that the throughput improves linearly in the batch size.</p>
<div data-slot="f3"></div>
<p>Fig.&nbsp;3 combines this entry's estimate with the one in <a data-term="compute-bound">Compute-bound</a>, for a GPU with both of the glossary's numbers: 10 TB/s and 1 PFLOP/s (Compute-bound's own calculator starts from an H100's 3.35 TB/s, which moves its crossover to a batch of 299). Its ridge point is 100 FLOPs per byte, and so, with 16-bit weights, is the batch size at which decoding turns from memory-bound to compute-bound. Below that, a bigger batch is free throughput: the same 100 ms per token, more sequences served. Above it, every extra sequence adds 1 ms to everyone's time per token.</p>
${GG.noteHTML('beyond', '<p><b>No single GPU holds 1 TB.</b> An H100 has 80 GiB (85.9 GB) of GPU RAM, so a 500B-parameter model is split across several GPUs, each streaming its own share of the weights at the same time; their combined bandwidth plays the role of the single 10 TB/s GPU. <b>Multi-token prediction and speculative decoding</b> get around the once-per-token rule by producing or checking several tokens in one forward pass. The "tokens per forward pass" slider in Fig.&nbsp;3 shows the ideal case, where every extra token is kept.</p>')}
<p>For more on LLM inference, see our <a href="${ALMANAC}">LLM Engineer's Almanac</a>.</p>
<div data-slot="reading"></div>`);
      guard(() => mbRoofline(ctx, s.f1), 'roofline');
      guard(() => mbHierarchy(ctx, s.f2), 'hierarchy');
      guard(() => mbDecode(ctx, s.f3), 'decode');
      ctx.reading(s.reading, [
        { href: WWP, label: 'Williams, Waterman and Patterson (2008)', note: 'the roofline model the glossary\'s diagram is adapted from' },
        { href: 'https://en.wikipedia.org/wiki/Working_set_size', label: 'Working set size (Wikipedia)' },
        { href: ALMANAC, label: 'Modal: LLM Engineer\'s Almanac' },
      ]);
    },
  });

  /* Fig 1: memory-bound kernels across systems; their intensity follows the number format */
  function mbRoofline(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Memory-bound kernels, system by system', hint: 'switch systems · drag the elementwise kernel', wide: true,
      caption: `The shaded region under the slanted roof is memory-bound. The decode kernel multiplies a weight matrix by a single token vector: 2 FLOPs per weight, so 1 FLOP per byte in BF16, 2 in FP8 and 4 in FP4. The elementwise add z = x + y does 1 FLOP per 3 numbers moved. Both follow the number format of the selected system. The table compares the decode kernel across the glossary's systems. Adapted from <a href="${WWP}">Williams, Waterman, and Patterson (2008)</a>.`,
    });
    const rf = RFC();
    if (!rf) return;
    const P = rf.PRESETS, IDS = ['a100-bf16', 'h100-bf16', 'b200-bf16', 'h100-fp8', 'b200-fp8', 'b200-fp4'];
    const BY = { 'a100-bf16': 2, 'h100-bf16': 2, 'b200-bf16': 2, 'h100-fp8': 1, 'b200-fp8': 1, 'b200-fp4': 0.5 };
    let cur = 'h100-bf16', addMul = 1;
    const K = (id) => ([
      { id: 'dec', label: 'Decode matvec', ai: 2 / BY[id], draggable: false },
      { id: 'add', label: 'Elementwise add', ai: (1 / (3 * BY[id])) * addMul },
    ]);
    const fmtName = (b) => (b === 2 ? 'BF16' : b === 1 ? 'FP8' : 'FP4');
    const api = rf(f, {
      system: cur, systems: IDS, showControls: true, showReadouts: true, shade: 'memory', kernels: K(cur),
      xDomain: [0.03, 10000], yDomain: [1e11, 2e16],
      why: (x) => {
        const b = BY[x.system.id], k = x.kernel;
        if (!k) return null;
        const u = utilOf(k.ai, x.system);
        const base = `On <b>${x.system.label}</b>, ${fmtName(b)} numbers take ${sg(b, 2)} ${b === 1 ? 'byte' : 'bytes'} each. `;
        if (k.id === 'dec') return base + `The decode matvec does <b>${fmtAI(k.ai)} ${fpw(k.ai)} per byte</b>, ${sg(x.ridge / k.ai, 3)}× short of the ridge: it runs at ${rf.fmt.bw(x.system.bw)} × ${fmtAI(k.ai)} = <b>${rf.fmt.perf(u.P)}</b>, with the arithmetic pipes ${pct(u.pipes, 1)} busy. Only more bandwidth or fewer bytes per weight make it faster.`;
        if (x.bound === 'compute' || x.atRidge) return base + `At <b>${fmtAI(k.ai)} ${fpw(k.ai)} per byte</b> the dragged kernel has left memory-bound territory: it is now limited by the compute roof.`;
        return base + `The elementwise kernel does <b>${fmtAI(k.ai)} ${fpw(k.ai)} per byte</b>, ${sg(x.ridge / k.ai, 3)}× short of the ridge: <b>memory-bound</b> at ${rf.fmt.perf(u.P)}, arithmetic pipes ${pct(u.pipes, 2)} busy.`;
      },
    });
    const tbl = GG.el('div', { class: 'pfa-tw' });
    f.stage.append(tbl);
    function table() {
      const base = P['a100-bf16'].bw * 1;
      tbl.innerHTML = TB('<thead><tr><th>system</th><th class="num">memory bandwidth</th><th class="num">decode FLOPs/byte</th><th class="num">decode speed</th><th class="num">vs A100</th><th class="num">compute roof</th></tr></thead><tbody>' +
        IDS.map((id) => {
          const x = P[id], ai = 2 / BY[id], sp = Math.min(x.flops, x.bw * ai), on = id === cur;
          return `<tr><td class="${on ? 'hl' : ''}">${x.label}</td><td class="num">${rf.fmt.bw(x.bw)}</td><td class="num">${fmtAI(ai)}</td><td class="num ${on ? 'hl' : ''}">${rf.fmt.perf(sp)}</td><td class="num ${on ? 'hl' : ''}">×${num(sp / base, 2)}</td><td class="num">${rf.fmt.perf(x.flops, 4)}</td></tr>`;
        }).join('') + '</tbody>');
    }
    api.on('change', (x) => {
      if (x.system.id !== cur) {
        const old = BY[cur];
        const st0 = api.state();
        cur = x.system.id;
        // keep the dragged elementwise kernel at the same place relative to its format
        const addNow = st0.kernel && st0.kernel.id === 'add' ? st0.kernel.ai : null;
        if (addNow) addMul = (addNow * 3 * old);
        api.setKernels(K(cur));
        table();
      } else if (x.kernel && x.kernel.id === 'add') {
        addMul = x.kernel.ai * 3 * BY[cur];
      }
    });
    table();
  }

  /* Fig 2: the working set vs the H100 memory hierarchy */
  function mbHierarchy(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Where does the working set fit?', hint: 'slide the working set · try the examples', wide: true,
      caption: 'Capacities of an H100 SXM on a logarithmic scale; each level is the total across the chip (the registers, another 256 KiB per SM, hold each thread\'s private values rather than shared data). A working set that fits in a level can be reused from there; one that does not must stream through the level below it, and for the workloads GPUs are bought for that is GPU RAM, read at 3.35 TB/s. That is the bandwidth on the slanted roof.',
    });
    const LV = [
      { name: 'L1 cache / shared memory', sub: '256 KiB per SM × 132', cap: 132 * 256 * 1024, color: 'memory', term: 'l1-data-cache' },
      { name: 'L2 cache', sub: 'shared by all SMs', cap: 50 * 2 ** 20, color: 'memory' },
      { name: 'GPU RAM (HBM3)', sub: '3.35 TB/s to the SMs', cap: 80 * 2 ** 30, color: 'memory', term: 'gpu-ram' },
    ];
    const EX = [
      { id: 'vec', label: 'a 1M-element FP32 vector', v: 4 * 2 ** 20 },
      { id: 'mat', label: 'a 4,096² FP32 matrix', v: 4 * 4096 * 4096 },
      { id: 'b7', label: '7B params in BF16', v: 14e9 },
      { id: 'b500', label: '500B params in 16-bit', v: 1e12 },
    ];
    const st = { v: 1e12 };
    const XD = [2 ** 20, 4e12];
    const view = rsvg(f.stage, 'Horizontal bars for the capacity of the L1 caches, the L2 cache and GPU RAM on a log scale, with a vertical line marking the working set.', (svg, w) => {
      const mob = w < 560;
      const lw = mob ? 0 : 190;
      // inset the axis so the end tick labels are not clipped
      const x0 = lw + (mob ? tw('1 MiB', 10) / 2 + 2 : 0), x1 = w - (mob ? 14 : 8);
      const X = (v) => x0 + ((lg(clamp(v, XD[0], XD[1])) - lg(XD[0])) / (lg(XD[1]) - lg(XD[0]))) * (x1 - x0);
      const fitIdx = LV.findIndex((l) => l.cap >= st.v);
      const bh = mob ? 16 : 22, rowH = mob ? 15 + bh + 12 : 36;
      const yEnd = 6 + LV.length * rowH;
      // working set marker first, so the labels (with halos) sit on top of it
      const xv = X(st.v);
      if (!mob) Ln(svg, xv, 2, xv, yEnd - 4, 'stroke:var(--accent);stroke-width:2');
      let y = 6;
      LV.forEach((l, i) => {
        const fits = l.cap >= st.v, first = i === fitIdx;
        if (mob) { Tx(svg, 0, y + 10, l.name, { fs: 11, fill: first ? 'var(--ink)' : 'var(--ink-2)', weight: 600, halo: true }); Tx(svg, w, y + 10, l.sub, { fs: 9.5, anchor: 'end', fill: 'var(--ink-3)', halo: true }); y += 15; }
        else { Tx(svg, 0, y + 13, l.name, { fs: 11.5, fill: first ? 'var(--ink)' : 'var(--ink-2)', weight: 600 }); Tx(svg, 0, y + 27, l.sub, { fs: 9.5, fill: 'var(--ink-3)' }); }
        const xe = X(l.cap);
        if (mob) Ln(svg, xv, y, xv, y + bh + 7, 'stroke:var(--accent);stroke-width:2');
        R(svg, x0, y + 3, xe - x0, bh, `fill:var(--memory);opacity:${first ? 0.95 : fits ? 0.45 : 0.22}`, { rx: 4 });
        const capTxt = fmtBi(l.cap);
        const txt = capTxt + (first ? '  ← fits here' : fits ? '' : '  too small'), tW = tw(txt, 10.5);
        const col = first ? 'var(--ink)' : fits ? 'var(--ink-3)' : 'var(--danger)';
        // on phones, start the annotation after the working-set marker when the marker would cross it
        const ax = mob && !fits && xv >= xe + 2 && xv <= xe + 10 + tW ? xv + 6 : xe + 6;
        if (ax + tW <= w - 2) Tx(svg, ax, y + 3 + bh / 2 + 4, txt, { fs: 10.5, fill: col, weight: first ? 600 : null, halo: true });
        else {
          // no room after the bar: write the annotation inside its right end
          const inTxt = first ? capTxt + '  fits here →' : txt;
          Tx(svg, xe - 6, y + 3 + bh / 2 + 4, inTxt, { fs: 10.5, anchor: 'end', fill: first ? '#0b0c12' : col, weight: 600 });
        }
        y += rowH;
      });
      const lab = 'working set ' + fmtB(st.v);
      const lx = clamp(xv - tw(lab, 10.5) / 2, 0, w - tw(lab, 10.5));
      Tx(svg, lx, y + 10, lab, { fs: 10.5, fill: 'var(--accent)', weight: 600 });
      // axis
      const ay = y + 22;
      Ln(svg, x0, ay, x1, ay, 'stroke:var(--line-2)');
      [2 ** 20, 2 ** 30, 1e12].forEach((v) => { Ln(svg, X(v), ay, X(v), ay + 4, 'stroke:var(--ink-3)'); Tx(svg, X(v), ay + 16, v === 1e12 ? '1 TB' : fmtBi(v), { fs: 10, anchor: 'middle', fill: 'var(--ink-3)' }); });
      [1e6, 1e9].forEach((v) => { Ln(svg, X(v), ay, X(v), ay + 3, 'stroke:var(--line-2)'); });
      return ay + 22;
    });
    const sl = GG.ui.slider(f.controls, { label: 'working set', min: XD[0], max: XD[1], log: true, value: st.v, format: (v) => fmtB(v), onInput: (v) => { st.v = v; upd(); } });
    const pr = presets(f.controls, 'examples', EX, (it) => { st.v = it.v; sl.set(it.v, false); upd(); });
    const sF = stat(f, 'smallest level that fits', 'memory'), sBw = stat(f, 'streams at');
    function upd() {
      view.redraw();
      pr.mark((it) => Math.abs(lg(it.v / st.v)) < 1e-6);
      const i = LV.findIndex((l) => l.cap >= st.v);
      if (i < 0) {
        sF.set('none: more than one GPU', 'danger'); sBw.set('< 3.35 TB/s');
        f.setWhy(`A working set of <b>${fmtB(st.v)}</b> is ${sg(st.v / LV[2].cap, 3)}× what fits even in GPU RAM, so it has to be split across several GPUs (or spill to host memory over a much slower link). Every byte still reaches the SMs from GPU RAM at best: <b>memory bandwidth</b> is the neck.`);
      } else if (i === 2) {
        sF.set('GPU RAM', 'memory'); sBw.set('3.35 TB/s');
        f.setWhy(`<b>${fmtB(st.v)}</b> is ${sg(st.v / LV[1].cap, 3)}× larger than the L2 cache and ${sg(st.v / (132 * 256 * 1024), 3)}× larger than all the SMs' L1 caches together, so a kernel sweeping over it streams it from <b>GPU RAM</b>: the bandwidth between GPU RAM and the SMs, 3.35 TB/s, is what bounds it.`);
      } else if (i === 1) {
        sF.set('L2 cache', 'memory'); sBw.set('L2 bandwidth');
        f.setWhy(`<b>${fmtB(st.v)}</b> fits in the 50 MiB L2 cache, so repeated passes over it can be served from L2 instead of GPU RAM. The GPU workloads that matter are rarely this small.`);
      } else {
        sF.set('L1 caches', 'memory'); sBw.set('on-chip');
        f.setWhy(`<b>${fmtB(st.v)}</b> fits in the SMs' own L1 caches (${fmtBi(132 * 256 * 1024)} across the chip) if it is split evenly among the 132 SMs: the ideal case, where data is reused without leaving the SMs. Real GPU workloads are rarely this small.`);
      }
    }
    upd();
  }

  /* Fig 3: the decode loop, and latency / throughput against batch size */
  function mbDecode(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'LLM decoding: memory-bound until the ridge', hint: 'slide the batch · change the GPU', wide: true,
      caption: 'Combines this entry\'s estimate with <a data-term="compute-bound">Compute-bound</a>\'s. Each forward pass loads every weight once (blue) and does 2 FLOPs per parameter for every token in the batch (green); the pass takes as long as the slower of the two. Time per token = pass time ÷ tokens per pass; throughput = batch × tokens per pass ÷ pass time. Defaults: the glossary\'s 500B-parameter 16-bit model on a GPU with 10 TB/s and 1 PFLOP/s. The animation shows one forward pass at a time, stretched to about two seconds.',
    });
    const st = { P: 500e9, b: 2, BW: 10e12, F: 1e15, B: 1, k: 1 };
    const M = () => {
      const W = st.P * st.b, tm = W / st.BW, per = (2 * st.P) / st.F, tc = st.B * st.k * per, T = Math.max(tm, tc);
      const Bstar = tm / (st.k * per), at = Math.abs(tc - tm) <= 1e-9 * tm;
      return { W, tm, per, tc, T, itl: T / st.k, thr: (st.B * st.k) / T, Bstar, Bn: Math.ceil(Bstar - 1e-9), cb: tc > tm && !at, at };
    };
    // animated pass strip
    let phase = 0, passes = 0;
    const E = { bars: [], seq: [], clock: null, w: 0 };
    const strip = rsvg(f.stage, 'One forward pass: a bar for streaming the weights and a bar for the math, filling at their relative speeds, and the batch of sequences each receiving new tokens at the end of the pass.', (svg, w) => {
      const m = M();
      E.w = w;
      const y0 = 4;
      Tx(svg, 0, y0 + 10, 'one forward pass', { fs: 10.5, fill: 'var(--ink-3)', ls: '0.06em' });
      E.clock = Tx(svg, w, y0 + 10, '', { fs: 10.5, anchor: 'end', fill: 'var(--ink-2)' });
      const rows = [['stream all weights: ' + fmtB(m.W) + ' ÷ ' + fmtBW(st.BW), m.tm, 'memory'], ['math: ' + fI(st.B * st.k) + ' × ' + fmtF(2 * st.P), m.tc, 'core']];
      E.bars = rows.map(([l, t, c], i) => {
        const y = y0 + 20 + i * 34;
        Tx(svg, 0, y + 10, l, { fs: 10.5, fill: 'var(--ink-2)' });
        Tx(svg, w, y + 10, fmtT(t), { fs: 10.5, anchor: 'end', fill: t >= m.T * 0.9999 ? 'var(--ink)' : 'var(--ink-3)', weight: t >= m.T * 0.9999 ? 600 : null });
        R(svg, 0, y + 15, w, 12, 'fill:rgba(255,255,255,0.05)', { rx: 3 });
        const fill = R(svg, 0, y + 15, 0, 12, `fill:var(--${c})`, { rx: 3 });
        const idle = R(svg, 0, y + 15, 0, 12, 'fill:url(#pfa-hatch)', { rx: 3 });
        return { fill, idle, frac: t / m.T };
      });
      const defs = GG.svg('defs', null, svg);
      const pat = GG.svg('pattern', { id: 'pfa-hatch', width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
      R(pat, 0, 0, 2, 6, 'fill:rgba(255,91,110,0.55)');
      // sequences
      const yS = y0 + 20 + 2 * 34 + 8;
      Tx(svg, 0, yS + 10, `${fI(st.B)} ${plural(st.B, 'sequence')} in the batch, +${st.k} ${plural(st.k, 'token')} each per pass`, { fs: 10.5, fill: 'var(--ink-2)' });
      const sz = clamp((w - 70) / Math.min(st.B, 64) - 2, 5, 14);
      const fit = Math.max(1, Math.floor((w - 70) / (sz + 2)));
      const nShow = Math.min(st.B, 64, fit);
      E.seq = [];
      for (let i = 0; i < nShow; i++) E.seq.push(R(svg, i * (sz + 2), yS + 18, sz, sz, 'fill:var(--special);opacity:0.55', { rx: 2 }));
      if (st.B > nShow) Tx(svg, nShow * (sz + 2) + 4, yS + 18 + sz - 1, '… ×' + fI(st.B), { fs: 10, fill: 'var(--ink-3)' });
      paintPhase();
      return yS + 18 + sz + 6;
    });
    function paintPhase() {
      const m = M();
      E.bars.forEach((b) => {
        const full = b.frac * E.w, cur = Math.min(phase, b.frac) * E.w;
        b.fill.setAttribute('width', r2(cur));
        const idle = phase > b.frac ? (phase - b.frac) * E.w : 0;
        b.idle.setAttribute('x', r2(full));
        b.idle.setAttribute('width', r2(Math.max(0, idle)));
      });
      const flash = phase < 0.12 && passes > 0;
      E.seq.forEach((r) => { r.style.opacity = flash ? '1' : '0.55'; });
      if (E.clock) E.clock.textContent = `pass ${passes + 1} · ${fmtT(phase * m.T)} of ${fmtT(m.T)}`;
    }
    const anim = GG.anim(f.stage, (t, dt) => {
      phase += dt / 2.1;
      if (phase >= 1) { phase = 0; passes++; }
      paintPhase();
    });
    if (!anim.running) phase = 1;
    // charts
    const chart = rsvg(f.stage, 'Two log-log charts against batch size: time per token, flat at the memory floor and then rising with the batch; and throughput, rising with the batch and then flat.', (svg, w) => {
      const m = M();
      const mob = w < 640;
      const pw = mob ? w : (w - 30) / 2, ph = mob ? 190 : 210;
      const BD = [1, 8192];
      const panel = (ox, oy, title, fn, yLab, yFmt, col, kind) => {
        const ml = 52, mr = 10, mt = 18, mb = 30;
        const x0 = ox + ml, x1 = ox + pw - mr, y0 = oy + mt, y1 = oy + ph - mb;
        const vals = [];
        for (let i = 0; i <= 120; i++) { const B = 10 ** ((i / 120) * lg(BD[1])); vals.push([B, fn(B)]); }
        let lo = Math.min(...vals.map((v) => v[1])), hi = Math.max(...vals.map((v) => v[1]));
        lo = 10 ** Math.floor(lg(lo) - 0.05); hi = 10 ** Math.ceil(lg(hi) + 0.05);
        const X = (B) => x0 + (lg(B) / lg(BD[1])) * (x1 - x0), Y = (v) => y1 - ((lg(v) - lg(lo)) / (lg(hi) - lg(lo))) * (y1 - y0);
        R(svg, x0, y0, x1 - x0, y1 - y0, 'fill:rgba(8,9,14,0.35)');
        Tx(svg, ox, oy + 10, title, { fs: 11, fill: 'var(--ink)', weight: 600 });
        decades(lo, hi).forEach((v) => { Ln(svg, x0, Y(v), x1, Y(v), 'stroke:rgba(255,255,255,0.07)'); Tx(svg, x0 - 5, Y(v) + 3.5, yFmt(v), { fs: 9.5, anchor: 'end', fill: 'var(--ink-3)' }); });
        [1, 10, 100, 1000].forEach((B) => { Ln(svg, X(B), y0, X(B), y1, 'stroke:rgba(255,255,255,0.07)'); Tx(svg, X(B), y1 + 14, fI(B), { fs: 9.5, anchor: 'middle', fill: 'var(--ink-3)' }); });
        Tx(svg, x1, y1 + 27, 'batch size →', { fs: 9.5, anchor: 'end', fill: 'var(--ink-3)' });
        Pa(svg, `M${x0},${y0}V${y1}H${x1}`, 'fill:none;stroke:var(--ink-3)');
        // crossover shading
        const xs = X(clamp(m.Bstar, BD[0], BD[1]));
        R(svg, x0, y0, Math.max(0, xs - x0), y1 - y0, 'fill:var(--memory);opacity:0.07');
        R(svg, xs, y0, Math.max(0, x1 - xs), y1 - y0, 'fill:var(--core);opacity:0.07');
        if (m.Bstar > BD[0] && m.Bstar < BD[1]) {
          Ln(svg, xs, y0, xs, y1, 'stroke:var(--ink-3);stroke-dasharray:3 3');
          const lab = 'B* = ' + sg(m.Bstar, 3);
          Tx(svg, clamp(xs + 4, x0, x1 - tw(lab, 9.5)), y0 + 11, lab, { fs: 9.5, fill: 'var(--ink-2)' });
        }
        Pa(svg, 'M' + vals.map(([B, v]) => `${r2(X(B))},${r2(Y(v))}`).join('L'), `fill:none;stroke:var(--${col});stroke-width:2.5`);
        const cy = fn(st.B);
        Ln(svg, X(st.B), y1, X(st.B), Y(cy), 'stroke:var(--accent);stroke-width:1;stroke-dasharray:2 3');
        C(svg, X(st.B), Y(cy), 5.5, 'fill:var(--accent);stroke:var(--bg);stroke-width:2');
        const vl = yLab(cy);
        const tx = X(st.B) + 8 + tw(vl, 10.5) > x1 ? X(st.B) - 8 - tw(vl, 10.5) : X(st.B) + 8;
        Tx(svg, tx, Y(cy) + (kind === 'lat' ? -8 : 14), vl, { fs: 10.5, fill: 'var(--ink)', weight: 600 });
      };
      const latFn = (B) => Math.max(m.tm, B * st.k * m.per) / st.k;
      const thrFn = (B) => (B * st.k) / Math.max(m.tm, B * st.k * m.per);
      panel(0, 0, 'time per token', latFn, (v) => fmtT(v), (v) => fmtT(v, 2).replace(' ', ''), 'ink', 'lat');
      panel(mob ? 0 : pw + 30, mob ? ph + 14 : 0, 'throughput (tokens/s)', thrFn, (v) => sg(v, 3) + ' tok/s', (v) => (v >= 1000 ? sg(v / 1000, 3) + 'k' : sg(v, 3)), 'ink', 'thr');
      return mob ? 2 * ph + 18 : ph + 4;
    });
    legend(f.stage, [['var(--memory)', 'memory-bound batch sizes'], ['var(--core)', 'compute-bound batch sizes'], ['var(--accent)', 'your batch', 'dt']]);
    const sL = stat(f, 'time per token'), sT = stat(f, 'throughput'), sBs = stat(f, 'crossover batch B*'), sBd = stat(f, 'bound');
    function upd() {
      strip.redraw(); chart.redraw();
      const m = M();
      sL.set(fmtT(m.itl)); sT.set(sg(m.thr, 3) + ' tok/s'); sBs.set(sg(m.Bstar, 3)); sBd.set(m.at ? 'at the crossover' : m.cb ? 'compute-bound' : 'memory-bound', m.at ? null : m.cb ? 'core' : 'memory');
      const kTxt = st.k > 1 ? ` With ${st.k} tokens per pass (ideal multi-token prediction or speculative decoding), each weight load is shared by ${st.k} tokens.` : '';
      let t;
      const maxThr = st.F / (2 * st.P); // tokens/s once the math fills the pass: B* × k ÷ (weight-load time)
      if (m.at) t = `Batch size <b>${fI(st.B)}</b> is exactly at the crossover: streaming the weights and doing the math both take <b>${fmtT(m.tm)}</b>. Throughput has reached its ceiling, ${sg(maxThr, 3)} tokens/s, at the floor time per token, <b>${fmtT(m.itl)}</b>.${kTxt} One more sequence would make decoding compute-bound and add ${fmtT(m.per)} to everyone's time per token.`;
      else if (!m.cb) t = `Batch size <b>${fI(st.B)}</b>: streaming ${fmtB(m.W)} of weights takes <b>${fmtT(m.tm)}</b>, the math only ${fmtT(m.tc)}. Decoding is <b>memory-bound</b> and the time per token is at its floor, <b>${fmtT(m.itl)}</b>.${kTxt} Throughput is ${sg(m.thr, 3)} tokens/s now; growing the batch toward the crossover (B* = ${sg(m.Bstar, 3)}, so a batch of ${fI(m.Bn)}) raises it in proportion, up to about ${sg(maxThr, 3)} tokens/s, at the same ${fmtT(m.itl)} per token.`;
      else t = `Batch size <b>${fI(st.B)}</b> is past the crossover (${sg(m.Bstar, 3)}): the math takes <b>${fmtT(m.tc)}</b>, longer than streaming the weights (${fmtT(m.tm)}). Decoding is <b>compute-bound</b>: throughput is capped at ${sg(st.F / (2 * st.P), 3)} tokens/s, and every extra sequence adds ${fmtT(m.per)} to everyone's time per token (now <b>${fmtT(m.itl)}</b>).${kTxt}`;
      f.setWhy(t);
    }
    GG.ui.slider(f.controls, { label: 'batch size', min: 1, max: 8192, step: 1, log: true, value: st.B, format: (v) => fI(v), onInput: (v) => { st.B = Math.max(1, Math.round(v)); upd(); } });
    GG.ui.slider(f.controls, { label: 'memory bandwidth', min: 1e12, max: 1e14, log: true, value: st.BW, format: (v) => fmtBW(v), onInput: (v) => { st.BW = rp(v, 3); upd(); } });
    GG.ui.slider(f.controls, { label: 'arithmetic bandwidth', min: 1e14, max: 2e16, log: true, value: st.F, format: (v) => fmtRate(v), onInput: (v) => { st.F = rp(v, 3); upd(); } });
    GG.ui.slider(f.controls, { label: 'parameters', min: 1e9, max: 2e12, log: true, value: st.P, format: (v) => sg(v / 1e9, 3) + 'B', onInput: (v) => { st.P = rp(v, 3); upd(); } });
    GG.ui.seg(f.controls, { label: 'precision', value: st.b, options: [{ value: 2, label: '16-bit' }, { value: 1, label: '8-bit' }, { value: 0.5, label: '4-bit' }], onChange: (v) => { st.b = v; upd(); } });
    GG.ui.slider(f.controls, { label: 'tokens per forward pass', min: 1, max: 8, step: 1, value: st.k, format: (v) => String(v), onInput: (v) => { st.k = Math.round(v); upd(); } });
    GG.ui.playButton(f.controls, anim);
    upd();
  }

  /* ═════════════════════════ ARITHMETIC INTENSITY ═════════════════════════ */

  const DS = {
    a100: 'https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a100/pdf/nvidia-a100-datasheet-us-nvidia-1758950-r4-web.pdf',
    h100: 'https://resources.nvidia.com/en-us-gpu-resources/h100-datasheet-24306',
    b200: 'https://resources.nvidia.com/en-us-dgx-systems/dgx-b200-datasheet',
  };
  const supE = (e) => String(e).split('').map((c) => SUP[c] || c).join('');
  /* the glossary's three kernels: N elements (SAXPY, FFT) or N × N matrices (SGEMM), all FP32 */
  const AIK = [
    { id: 'saxpy', name: 'SAXPY y = ax + y', short: 'SAXPY', fl: (N) => 2 * N, by: (N) => 12 * N, flT: '2N', byT: '12N', aiT: '1/6', sc: 'O(1)' },
    { id: 'fft', name: 'Single-precision real FFT', short: 'FFT', fl: (N) => 2.5 * N * Math.log2(N), by: (N) => 16 * N, flT: '5/2 N log₂N', byT: '16N', aiT: '5/32 log₂N', sc: 'O(log N)' },
    { id: 'sgemm', name: 'SGEMM C = A @ B + C', short: 'SGEMM', fl: (N) => 2 * N ** 3, by: (N) => 16 * N * N, flT: '2N³', byT: '16N²', aiT: 'N/8', sc: 'O(N)' },
  ];
  const AIS = { e: 10, subs: [] }; // N = 2^e, shared by the live table and the scaling chart
  function aiSetE(e, from) { AIS.e = clamp(Math.round(e), 1, 16); AIS.subs.forEach((fn) => { if (fn !== from) guard(fn, 'ai sync'); }); }
  const fmtCount = (n) => (n < 1e6 ? fI(n) : sci(n, 2));
  const SG_RIDGE = 66.9 / 3.35; // H100 FP32 CUDA Core ridge, 19.97 FLOPs/byte

  GG.entry('arithmetic-intensity', {
    render(body, ctx) {
      const s = ctx.html(body, `
<p><strong>Arithmetic intensity</strong> is the ratio of arithmetic operations to memory operations in a <a data-term="kernel">kernel</a>. Count the floating point operations (FLOPs) the kernel performs, count the bytes it loads from and stores to memory, and divide one by the other. The result, in FLOPs per byte, says how much work the kernel gets out of every byte it moves.</p>
<div data-slot="f1"></div>
<p>Fig.&nbsp;1 does the counting for two kernels from the glossary's table further down. SAXPY touches every number exactly once: two FLOPs for every twelve bytes, however long the arrays are. A matrix multiplication also loads each number once, but then uses it in <i>N</i> multiply-adds, so the bigger the matrices, the more work each byte does.</p>
<h3>The horizontal axis of the roofline</h3>
<p>In the <a data-term="roofline-model">roofline model</a>, operational/arithmetic intensity is plotted on the horizontal axis. (<i>Operational intensity</i> is the name Williams, Waterman, and Patterson used in <a href="${WWP}">the 2008 paper</a> that introduced the model; for GPUs the usual name is arithmetic intensity.) A high arithmetic intensity indicates that a <a data-term="kernel">kernel</a> performs many arithmetic operations per byte loaded.</p>
<p>Due to the high ratio between <a data-term="arithmetic-bandwidth">arithmetic bandwidth</a> and <a data-term="memory-bandwidth">memory bandwidth</a> in modern GPUs, the most efficient kernels have high arithmetic intensity. That ratio is the ridge point. An H100's Tensor Cores can do 989 trillion BF16 FLOPs per second while its memory delivers 3.35 trillion bytes per second, so a kernel needs about 295 FLOPs per byte before memory stops holding it back. Drag the kernel in Fig.&nbsp;2 to see how much of the chip's peak each intensity can use.</p>
<div data-slot="f2"></div>
<h3>Trading memory for compute</h3>
<p>That means that when elevating a memory <a data-term="performance-bottleneck">bottleneck</a>, we can often shift work from the memory subsystem to the compute subsystem, saving on <a data-term="memory-bandwidth">memory bandwidth</a> but adding to the load on the arithmetic units. A <a data-term="memory-bound">memory-bound</a> kernel has idle arithmetic units by definition, so spending some of their time to move fewer bytes can be a bargain. Two examples.</p>
<h4>Compressing data in global memory</h4>
<p>Compressing data in <a data-term="global-memory">global memory</a> reduces memory traffic, since fewer bytes need to be transferred, but the compute units must perform additional decompression operations. If we were previously <a data-term="performance-bottleneck">bottlenecked</a> by memory, this can improve performance. It also increases the ratio of FLOPs to bytes moved, increasing the arithmetic intensity: the FLOPs grow by the decompression work while the bytes shrink by the compression ratio.</p>
<div data-slot="f3"></div>
<p>Fig.&nbsp;3 also shows where the trade stops paying. Extra decompression FLOPs are free only while the arithmetic units have time to spare. Make decompression expensive enough and the kernel crosses the ridge point and becomes <a data-term="compute-bound">compute-bound</a>; from there on, every extra operation costs time.</p>
<h4>Recomputing instead of storing</h4>
<p>As another example, the <a href="https://www.nature.com/articles/323533a0">backpropagation algorithm</a> creates long-lived intermediates (activation values) that generally must be stored in <a data-term="global-memory">global memory</a> during a forward pass and then retrieved during a backwards pass. In some cases, it is faster to store only a fraction of these intermediates and then recompute the remainder, a technique known as <a href="https://arxiv.org/abs/1604.06174">gradient checkpointing</a>, which increases arithmetic intensity.</p>
<p>When is recomputing <em>faster</em>, and not just leaner on memory? When the step is <a data-term="memory-bound">memory-bound</a>. Its arithmetic units then sit idle much of the time, so the FLOPs spent regenerating an activation cost almost nothing, while every activation that is not written to global memory and read back saves bytes, which is exactly what the bottleneck charges for. The saving is largest when the recomputed values never leave the chip. Fig.&nbsp;4 times a toy network both ways, with memory-bound and with compute-bound layers.</p>
${GG.noteHTML('beyond', `<p><b>FlashAttention</b> (${xl('https://arxiv.org/abs/2205.14135', 'Dao, Fu, Ermon, Rudra and Ré, 2022')}) is the best-known case. Standard attention stores its large N × N attention matrix in global memory for the backward pass. FlashAttention stores only the output and two small softmax statistics per row, then recomputes the attention matrix in the backward pass, block by block, from blocks of the queries, keys and values held in on-chip SRAM. Its authors call this "a form of selective gradient checkpointing", and report that "even with more FLOPs, our recomputation speeds up the backward pass due to reduced HBM accesses".</p>`)}
${GG.noteHTML('beyond', '<p><b>Why backpropagation keeps activations.</b> Training nudges every weight of a network in the direction that reduces its error. Backpropagation, popularized by Rumelhart, Hinton and Williams in the 1986 <i>Nature</i> paper linked above, computes those directions (the gradients) with the chain rule, layer by layer from the output back to the input. A layer\'s gradient depends on the input that layer saw in the forward pass, so every activation must survive until the backward pass reaches its layer. <b>Gradient checkpointing</b> (Chen, Xu, Zhang and Guestrin, 2016) keeps only some activations, the checkpoints, and reruns the forward pass from the nearest checkpoint to regenerate the others when they are needed. With one checkpoint every √<i>L</i> layers of an <i>L</i>-layer network, activation memory falls from O(<i>L</i>) to O(√<i>L</i>), for about one extra forward pass of compute.</p>')}
<div data-slot="f4"></div>
<h3>How intensity scales with problem size</h3>
<p>Because different algorithms inherently have different operational and memory complexities, they inherently scale differently in arithmetic intensity. An algorithm with O(1) operational complexity and O(<i>N</i>) memory complexity has O(1/<i>N</i>) arithmetic intensity scaling, while one with O(<i>N</i>) operational complexity and O(1) memory complexity has O(<i>N</i>) arithmetic intensity scaling.</p>
<p>The notation O(<i>f</i>(<i>N</i>)), "big O", describes how a quantity grows for large inputs, ignoring constant factors: O(<i>N</i>) work doubles when <i>N</i> doubles, O(1) work does not change at all. Intensity is one count divided by another, so its growth is the ratio of their growths: O(1) ÷ O(<i>N</i>) = O(1/<i>N</i>), and O(<i>N</i>) ÷ O(1) = O(<i>N</i>). The glossary's table works three real kernels through:</p>
${TB(`<thead><tr><th>Kernel</th><th class="num">FLOPs</th><th class="num">Bytes Moved</th><th class="num">Arithmetic Intensity</th><th class="num">Arithmetic Intensity Scaling</th></tr></thead><tbody>
<tr><td>SAXPY y = ax + y</td><td class="num">2N</td><td class="num">12N</td><td class="num">1/6</td><td class="num">O(1)</td></tr>
<tr><td>Single-Precision Real FFT</td><td class="num">5/2 N log(N)</td><td class="num">16N</td><td class="num">5/32 log(N)</td><td class="num">O(log(N))</td></tr>
<tr><td>SGEMM C = A @ B + C</td><td class="num">2N<sup>3</sup></td><td class="num">16N<sup>2</sup></td><td class="num">N/8</td><td class="num">O(N)</td></tr></tbody>`)}
<p>Row by row. <b>SAXPY</b> ("single-precision a times x plus y") updates a vector of <i>N</i> 4-byte numbers: for each element it multiplies x[i] by the scalar a and adds y[i], 2 FLOPs (a GPU does both in one fused multiply-add, or FMA, instruction), while loading x[i] and y[i] and storing the new y[i], 12 bytes. 2N ÷ 12N = 1/6, whatever <i>N</i> is. <b>The FFT</b> (fast Fourier transform) splits a signal of <i>N</i> samples into its frequencies. The classic radix-2 FFT of <i>N</i> complex numbers works through log₂<i>N</i> stages, each made of <i>N</i>/2 "butterflies": one complex multiply (4 real multiplies and 2 real adds, 6 FLOPs) plus two complex additions (2 FLOPs each), about 10 FLOPs per butterfly. That makes 10 × <i>N</i>/2 × log₂<i>N</i> = 5<i>N</i> log₂<i>N</i> FLOPs. <i>Real</i> in "Single-Precision Real FFT" means the input samples are real numbers rather than complex ones, and a real-input FFT can skip about half of that work: 5/2 <i>N</i> log <i>N</i>. The 16<i>N</i> bytes are the glossary's figure, which we take as given; it matches reading and then writing <i>N</i> single-precision complex values of 8 bytes each (a real-input transform stored compactly could move less). Dividing, 5/2 <i>N</i> log <i>N</i> ÷ 16<i>N</i> = 5/32 log <i>N</i>: the intensity grows, but only with the logarithm of <i>N</i>. <b>SGEMM</b> ("single-precision general matrix multiply") on <i>N</i> × <i>N</i> matrices computes <i>N</i>² outputs, each a dot product of length <i>N</i> (<i>N</i> multiplies and <i>N</i> adds): 2N³ FLOPs. It reads A, B and C and writes C, 4<i>N</i>² bytes each: 16N². 2N³ ÷ 16N² = N/8. The BF16 matmul examples in Fig.&nbsp;8 below (and in the <a data-term="roofline-model">Roofline Model</a> entry) are instead C = A @ B with no C read: 3<i>N</i>² two-byte elements moved, so N/3 FLOPs per byte.</p>
${GG.noteHTML('aside', '<p>The glossary writes log(N) without a base. Our figures assume <b>base 2</b>, the usual convention for FFT operation counts (a radix-2 FFT works through log₂<i>N</i> stages). Another base would only rescale the FFT\'s line by a constant factor; it stays O(log <i>N</i>) either way. The byte counts are the glossary\'s: each input and output crosses the memory bus once.</p>', 'Our assumption: log base 2')}
<div data-slot="f5"></div>
<p>Plotted against <i>N</i> on log–log axes (Fig.&nbsp;6), the three scaling classes become three shapes: a flat line, a slowly bending curve and a straight line of slope one. The dashed line falling the other way is the O(1/<i>N</i>) case, a fixed amount of work spread over more and more bytes.</p>
<div data-slot="f6"></div>
<p>Notably, matrix multiplication scales linearly, that is O(<i>N</i>), in arithmetic intensity: it is O(<i>N</i>³) in operational complexity and O(<i>N</i>²) in memory complexity. This favorable scaling makes it easy to map applications of matrix multiplication onto arithmetic-intensity-oriented hardware (see the discussion in the <a data-term="roofline-model">article on roofline modeling</a>): however far right a system's ridge point moves, a large enough matrix multiplication clears it. It is a key secret to the success of machine learning algorithms based on matrix multiplication, like neural networks, in the past few decades.</p>
<h3>Attention</h3>
<p>For a discussion of arithmetic intensity as applied to Bahdanau attention, used in Transformer neural networks, see <a href="https://arxiv.org/abs/2505.21487">this paper</a> by Zadouri, Strauss, and Dao.</p>
${GG.noteHTML('check', '<p><b>Which attention?</b> The glossary says “Bahdanau attention, used in Transformer neural networks”. Bahdanau attention is <i>additive</i> attention, from recurrent translation models: it scores each key against the query with a small feed-forward network. Transformers use <i>scaled dot-product</i> attention instead; <a href="https://arxiv.org/abs/1706.03762">Vaswani et al. (2017)</a> contrast the two and chose dot products because they run as fast matrix multiplications. The linked paper studies attention for Transformer decoding: grouped-query attention and two new variants, Grouped-Tied Attention (GTA) and Grouped Latent Attention (GLA).</p>')}
${GG.noteHTML('beyond', '<p>Attention lets each token of a sequence gather information from the tokens before it. The mechanism was introduced for machine translation by <a href="https://arxiv.org/abs/1409.0473">Bahdanau, Cho and Bengio (2014)</a>; Transformers score the keys differently, with scaled dot products. While a Transformer generates text, each new token\'s <i>query</i> vector is compared with the stored <i>key</i> vector of every earlier token, and the resulting weights mix their stored <i>value</i> vectors. Those keys and values, the <i>KV cache</i>, are read from global memory for every new token, and each 16-bit number read takes part in one multiply-add: 2 FLOPs per 2 bytes. So standard multi-head attention does about <b>1 FLOP per byte</b>, and batching does not help, because every sequence has its own cache. Grouped-query attention lets several query heads share one key/value head, which multiplies the FLOPs per byte by the group size. Zadouri, Strauss and Dao push the same idea further, with attention variants designed to do more computation per byte loaded (Grouped-Tied Attention and Grouped Latent Attention). Fig.&nbsp;7 puts numbers on it.</p>')}
<div data-slot="f7"></div>
<h3>Ridge points: derived once per system</h3>
<p>The minimum arithmetic intensity required for work to be <a data-term="compute-bound">compute-bound</a> (that is, to be past the ridge point of the <a data-term="roofline-model">roofline model</a>) is a fixed parameter of a system and so only needs to be derived once. Ridge point arithmetic intensities for recent NVIDIA data center GPUs appear in the table below. Notice that the highest ridge point has increased going from the Ampere to Hopper to Blackwell <a data-term="streaming-multiprocessor-architecture">Streaming Multiprocessor architectures</a>.</p>
${TB(`<thead><tr><th>System (Compute / Memory)</th><th class="num"><a data-term="arithmetic-bandwidth">Arithmetic Bandwidth</a> (TFLOPs/s)</th><th class="num"><a data-term="memory-bandwidth">Memory Bandwidth</a> (TB/s)</th><th class="num"><a data-term="roofline-model">Ridge Point</a> (FLOPs/byte)</th><th class="num">Recomputed: TFLOPs/s ÷ TB/s</th></tr></thead><tbody>
<tr><td><a href="${DS.a100}">A100 80GB SXM BF16 TC / HBM2e</a></td><td class="num">312</td><td class="num">2</td><td class="num">156</td><td class="num">156</td></tr>
<tr><td><a href="${DS.h100}">H100 SXM BF16 TC / HBM3</a></td><td class="num">989</td><td class="num">3.35</td><td class="num">295</td><td class="num">295.2</td></tr>
<tr><td><a href="${DS.b200}">B200 BF16 TC / HBM3e</a></td><td class="num">2,250</td><td class="num">8</td><td class="num">281</td><td class="num">281.25</td></tr>
<tr><td><a href="${DS.h100}">H100 SXM FP8 TC / HBM3</a></td><td class="num">1,979</td><td class="num">3.35</td><td class="num">592</td><td class="num pfa-bad">590.7 ≠</td></tr>
<tr><td><a href="${DS.b200}">B200 FP8 TC / HBM3e</a></td><td class="num">4,500</td><td class="num">8</td><td class="num">562</td><td class="num">562.5</td></tr>
<tr><td><a href="${DS.b200}">B200 FP4 TC / HBM3e</a></td><td class="num">9,000</td><td class="num">8</td><td class="num">1125</td><td class="num">1,125</td></tr></tbody>`)}
${GG.noteHTML('check', '<p>The last column divides the two bandwidth columns. The H100 FP8 row gives 1,979 ÷ 3.35 = <b>590.7</b> FLOPs/byte, where the table prints 592; the other five match. The full check, and how the table\'s dense, per-GPU figures relate to the datasheets\' headline numbers, are in the <a data-term="arithmetic-bandwidth">Arithmetic Bandwidth</a> entry.</p>')}
<p>"Highest" matters in that sentence. Take the highest ridge point of each architecture and the trend is steep: 156 for Ampere's BF16, 590.7 for Hopper's FP8, 1,125 for Blackwell's FP4. Compare the same number format across generations and the picture is flatter: B200's BF16 ridge (281.25) sits slightly <em>below</em> H100's (295.2), because B200 raised memory bandwidth 2.39× while raising BF16 compute 2.28×. Each smaller number format doubles the FLOPS on the same memory system, and so doubles the ridge.</p>
<div data-slot="f8"></div>
<div data-slot="reading"></div>`);
      guard(() => aiLedger(ctx, s.f1), 'ledger');
      guard(() => aiEfficiency(ctx, s.f2), 'efficiency');
      guard(() => aiCompress(ctx, s.f3), 'compress');
      guard(() => aiCheckpoint(ctx, s.f4), 'checkpoint');
      guard(() => aiLive(ctx, s.f5), 'live table');
      guard(() => aiScaling(ctx, s.f6), 'scaling');
      guard(() => aiAttention(ctx, s.f7), 'attention');
      guard(() => aiRidges(ctx, s.f8), 'ridges');
      ctx.reading(s.reading, [
        { href: WWP, label: 'Williams, Waterman and Patterson (2008), <i>Roofline: An Insightful Visual Performance Model for Multicore Architectures</i>', note: 'operational intensity on the horizontal axis' },
        { href: 'https://www.nature.com/articles/323533a0', label: 'Rumelhart, Hinton and Williams (1986), <i>Learning representations by back-propagating errors</i>', note: 'the backpropagation algorithm' },
        { href: 'https://arxiv.org/abs/1604.06174', label: 'Chen, Xu, Zhang and Guestrin (2016), <i>Training Deep Nets with Sublinear Memory Cost</i>', note: 'gradient checkpointing' },
        { href: 'https://arxiv.org/abs/2205.14135', label: 'Dao, Fu, Ermon, Rudra and Ré (2022), <i>FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness</i>', note: 'recomputation that makes the backward pass faster (Beyond the glossary)' },
        { href: 'https://arxiv.org/abs/2505.21487', label: 'Zadouri, Strauss and Dao (2025), <i>Hardware-Efficient Attention for Fast Decoding</i>', note: 'arithmetic intensity of attention' },
        { href: 'https://arxiv.org/abs/1409.0473', label: 'Bahdanau, Cho and Bengio (2014), <i>Neural Machine Translation by Jointly Learning to Align and Translate</i>', note: 'the attention mechanism (Beyond the glossary)' },
        { href: DS.a100, label: 'NVIDIA A100 datasheet', note: '312 TFLOPS BF16, 2 TB/s' },
        { href: DS.h100, label: 'NVIDIA H100 datasheet', note: '989 / 1,979 TFLOPS BF16 / FP8, 3.35 TB/s' },
        { href: DS.b200, label: 'NVIDIA DGX B200 datasheet', note: 'B200 BF16, FP8 and FP4 rates, 8 TB/s' },
      ]);
    },
  });

  /* Fig 1: counting FLOPs and bytes, one operation at a time */
  function aiLedger(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Counting FLOPs and bytes', hint: 'play · step · switch kernel', wide: true,
      caption: 'Each step is either a memory operation (blue: bytes crossing between global memory and the chip) or arithmetic (green: FLOPs). SAXPY computes y[i] = a × x[i] + y[i] on FP32 numbers, 4 bytes each; the scalar a arrives once, as a kernel argument, and is not counted, as in the glossary. SGEMM computes C = A @ B + C on N × N FP32 matrices in the ideal case, where each matrix crosses the memory bus exactly once and is reused from on-chip memory. Each green SGEMM step is one output element: a dot product of length N, so N multiplies and N adds.',
    });
    const st = { k: 'saxpy', N: { saxpy: 8, sgemm: 4 }, i: 0, acc: 0 };
    let ev = [];
    function events() {
      const N = st.N[st.k];
      ev = [];
      if (st.k === 'saxpy') {
        for (let i = 0; i < N; i++) {
          ev.push({ t: `load x[${i}]`, d: '+4 bytes', b: 4, f: 0 });
          ev.push({ t: `load y[${i}]`, d: '+4 bytes', b: 4, f: 0 });
          ev.push({ t: `a × x[${i}]`, d: '+1 FLOP: multiply', b: 0, f: 1 });
          ev.push({ t: `a × x[${i}] + y[${i}]`, d: '+1 FLOP: add', b: 0, f: 1 });
          ev.push({ t: `store y[${i}]`, d: '+4 bytes', b: 4, f: 0 });
        }
      } else {
        const n2 = N * N;
        ['A', 'B', 'C'].forEach((m) => ev.push({ t: `load all of ${m}`, d: `${n2} numbers × 4 bytes = +${fI(4 * n2)} bytes`, b: 4 * n2, f: 0, slow: true }));
        for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) ev.push({ t: `C[${i}][${j}] += row ${i} of A · column ${j} of B`, d: `${N} multiplies + ${N} adds = +${2 * N} FLOPs`, b: 0, f: 2 * N });
        ev.push({ t: 'store all of C', d: `+${fI(4 * n2)} bytes`, b: 4 * n2, f: 0, slow: true });
      }
    }
    const CS = { 0: 'fill:var(--bg);stroke:var(--line-2);stroke-width:1', ld: 'fill:var(--memory-a);stroke:var(--memory);stroke-width:1', wr: 'fill:var(--core-a);stroke:var(--core);stroke-width:1' };
    function sty(r, s, act) {
      const v = CS[s] + (act === 'ink' ? ';stroke:var(--ink);stroke-width:2' : act === 'core' ? ';stroke:var(--core);stroke-width:2' : '');
      if (r._v !== v) { r._v = v; r.setAttribute('style', v); }
    }
    const E = { ok: false };
    const view = rsvg(f.stage, 'Arrays or matrices in global memory, with cells lighting up as they are loaded, computed and stored, and running counts of FLOPs, bytes and their ratio.', (svg, w) => {
      const mob = w < 640, N = st.N[st.k];
      const pw = mob ? w : Math.floor(w * 0.58);
      E.ok = false; E.cells = {};
      let H;
      Tx(svg, 0, 11, 'global memory · FP32, 4 bytes per number', { fs: 10, fill: 'var(--ink-3)', ls: '0.05em' });
      if (st.k === 'saxpy') {
        const lw = 22, gap = 3;
        const cw = Math.max(6, Math.min(mob ? 30 : 44, Math.floor((pw - lw) / N) - gap));
        const rows = [28, 28 + cw + 30];
        ['x', 'y'].forEach((nm, r) => {
          Tx(svg, 0, rows[r] + cw / 2 + 5, nm, { fs: 14, fill: 'var(--ink)', weight: 600 });
          E.cells[nm] = [];
          for (let i = 0; i < N; i++) {
            const x = lw + i * (cw + gap);
            E.cells[nm].push(R(svg, x, rows[r], cw, cw, CS[0], { rx: Math.min(4, cw * 0.18) }));
            if (cw >= 15 || i % 4 === 0) Tx(svg, x + cw / 2, rows[r] + cw + 12, String(i), { fs: 9, anchor: 'middle', fill: 'var(--ink-3)' });
          }
        });
        H = rows[1] + cw + 18;
      } else {
        const gap = mob ? 18 : 30;
        const gs = Math.min(mob ? 120 : 150, Math.floor((pw - 2 * gap) / 3));
        const cs = gs / N, y0 = 40;
        const names = ['A', 'B', 'C'];
        names.forEach((nm, m) => {
          const x0 = m * (gs + gap);
          Tx(svg, x0, y0 - 8, nm + (m === 2 ? (mob ? ' (overwritten)' : ' (read, then overwritten)') : ''), { fs: mob ? 10.5 : 11.5, fill: 'var(--ink)', weight: 600 });
          E.cells[nm] = [];
          for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) E.cells[nm].push(R(svg, x0 + j * cs + 0.75, y0 + i * cs + 0.75, cs - 1.5, cs - 1.5, CS[0], { rx: Math.min(3, cs * 0.15) }));
          if (m < 2) Tx(svg, x0 + gs + gap / 2, y0 + gs / 2 + 5, m === 0 ? '@' : '+', { fs: 14, anchor: 'middle', fill: 'var(--ink-3)' });
        });
        E.cOut = R(svg, 2 * (gs + gap) - 3, y0 - 3, gs + 6, gs + 6, 'fill:none;stroke:var(--memory);stroke-width:2;opacity:0', { rx: 5 });
        E.cOutT = Tx(svg, 2 * (gs + gap), y0 + gs + 16, 'stored back to global memory', { fs: 9.5, fill: 'var(--memory)', op: 0 });
        H = y0 + gs + 22;
      }
      // counters
      const cx = mob ? 0 : pw + 36, cy = mob ? H + 14 : 26, cwid = mob ? w : w - cx;
      E.step = Tx(svg, cx, cy, '', { fs: 10, fill: 'var(--ink-3)', ls: '0.05em' });
      E.evT = Tx(svg, cx, cy + 20, '', { fs: 13, fill: 'var(--ink)', weight: 600 });
      E.evD = Tx(svg, cx, cy + 37, '', { fs: 11, fill: 'var(--ink-2)' });
      const colW = cwid / 3, by = cy + 92;
      [['FLOPs', 'core'], ['bytes', 'memory'], ['FLOPs per byte', 'ink']].forEach(([l, c], q) => {
        Tx(svg, cx + q * colW, by - 26, l, { fs: 10, fill: c === 'ink' ? 'var(--ink-2)' : `var(--${c})`, ls: '0.05em' });
      });
      E.cF = Tx(svg, cx, by, '0', { fs: mob ? 24 : 28, fill: 'var(--core)', weight: 800, font: 'var(--font-display)' });
      E.cB = Tx(svg, cx + colW, by, '0', { fs: mob ? 24 : 28, fill: 'var(--memory)', weight: 800, font: 'var(--font-display)' });
      E.cR = Tx(svg, cx + 2 * colW, by, '—', { fs: mob ? 24 : 28, fill: 'var(--ink)', weight: 800, font: 'var(--font-display)' });
      E.fin = Tx(svg, cx, by + 24, '', { fs: 11, fill: 'var(--ink-2)' });
      E.ok = true;
      paint();
      return Math.max(H, by + 32);
    });
    function paint() {
      if (!E.ok) return;
      const N = st.N[st.k], n = st.i;
      let F = 0, B = 0;
      for (let q = 0; q < n; q++) { F += ev[q].f; B += ev[q].b; }
      const cur = n > 0 ? ev[n - 1] : null;
      if (st.k === 'saxpy') {
        const ce = n > 0 && n < ev.length ? Math.floor((n - 1) / 5) : -1;
        for (let i = 0; i < N; i++) {
          const act = i === ce ? 'ink' : null;
          sty(E.cells.x[i], n >= 5 * i + 1 ? 'ld' : 0, act);
          sty(E.cells.y[i], n >= 5 * i + 5 ? 'wr' : n >= 5 * i + 2 ? 'ld' : 0, act);
        }
      } else {
        const n2 = N * N, done = clamp(n - 3, 0, n2);
        const ci = n > 3 && n <= 3 + n2 ? n - 4 : -1, r0 = ci >= 0 ? Math.floor(ci / N) : -1, c0 = ci >= 0 ? ci % N : -1;
        for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
          const q = i * N + j;
          sty(E.cells.A[q], n >= 1 ? 'ld' : 0, i === r0 ? 'core' : null);
          sty(E.cells.B[q], n >= 2 ? 'ld' : 0, j === c0 ? 'core' : null);
          sty(E.cells.C[q], q < done ? 'wr' : n >= 3 ? 'ld' : 0, q === ci ? 'ink' : null);
        }
        const stored = n >= 4 + n2;
        E.cOut.style.opacity = stored ? '1' : '0';
        E.cOutT.style.opacity = stored ? '1' : '0';
      }
      E.step.textContent = n === 0 ? `${ev.length} steps` : `step ${n} of ${ev.length}`;
      E.evT.textContent = cur ? cur.t : (st.k === 'saxpy' ? 'y[i] = a × x[i] + y[i]' : 'C = A @ B + C');
      E.evD.textContent = cur ? cur.d : 'nothing counted yet';
      E.evD.style.fill = cur ? (cur.f ? 'var(--core)' : 'var(--memory)') : 'var(--ink-3)';
      E.cF.textContent = fI(F);
      E.cB.textContent = fI(B);
      E.cR.textContent = B ? sg(F / B, 3) : '—';
      E.fin.textContent = st.k === 'saxpy' ? `finished: 2N ÷ 12N = 1/6 ≈ 0.167, for any N` : `finished: 2N³ ÷ 16N² = N/8 = ${sg(N / 8, 3)}`;
      E.fin.style.fill = n >= ev.length ? 'var(--ink)' : 'var(--ink-3)';
    }
    const interval = (q) => (st.k === 'saxpy' ? 0.2 : ev[q] && ev[q].slow ? 0.75 : Math.max(0.03, 5 / (st.N.sgemm ** 2)));
    let pb;
    const anim = GG.anim(f.stage, (t, dt) => {
      if (st.i >= ev.length) { anim.stop(); if (pb) pb.sync(); return; }
      st.acc += dt;
      let moved = false;
      while (st.i < ev.length && st.acc >= interval(st.i)) { st.acc -= interval(st.i); st.i++; moved = true; }
      if (moved) paint();
    }, { autostart: false });
    function why() {
      const N = st.N[st.k];
      if (st.k === 'saxpy') f.setWhy(`SAXPY on <b>${N}</b> elements: every element costs 12 bytes (load x[i], load y[i], store y[i]) and earns 2 FLOPs (one multiply, one add), so the ratio is <b>1/6 FLOP per byte</b> at every step and for every N. No number is ever used twice. Try 32 elements: the counts grow, the ratio does not.`);
      else f.setWhy(`SGEMM on <b>${N} × ${N}</b> matrices: ${fI(16 * N * N)} bytes move (each of A, B and C read once, C written once), but each number of A and B is then used in ${N} multiply-adds, so ${fI(2 * N ** 3)} FLOPs get done: <b>${sg(N / 8, 3)} ${N === 8 ? 'FLOP' : 'FLOPs'} per byte</b>, N/8. Doubling N doubles the intensity.`);
    }
    function reset(play) {
      events();
      st.acc = 0;
      st.i = play && !GG.reducedMotion ? 0 : ev.length;
      view.redraw();
      why();
      if (play && !GG.reducedMotion) anim.start(); else anim.stop();
      if (pb) pb.sync();
    }
    GG.ui.seg(f.controls, { label: 'kernel', value: st.k, options: [{ value: 'saxpy', label: 'SAXPY' }, { value: 'sgemm', label: 'SGEMM' }], onChange: (v) => { st.k = v; nS.el.hidden = v !== 'saxpy'; nM.el.hidden = v !== 'sgemm'; reset(true); } });
    const nS = GG.ui.seg(f.controls, { label: 'N (elements)', value: 8, options: [8, 16, 32].map((v) => ({ value: v, label: String(v) })), onChange: (v) => { st.N.saxpy = v; reset(true); } });
    const nM = GG.ui.seg(f.controls, { label: 'N (matrices are N × N)', value: 4, options: [4, 8, 16].map((v) => ({ value: v, label: String(v) })), onChange: (v) => { st.N.sgemm = v; reset(true); } });
    nM.el.hidden = true;
    const row = GG.el('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;align-items:flex-end' });
    f.controls.append(row);
    pb = GG.ui.playButton(row, anim, { onToggle: (on) => { if (on && st.i >= ev.length) { st.i = 0; st.acc = 0; paint(); } } });
    GG.ui.button(row, { label: 'Step', icon: 'next', onClick: () => { anim.stop(); pb.sync(); if (st.i >= ev.length) st.i = 0; st.i++; st.acc = 0; paint(); } });
    GG.ui.button(row, { label: 'Reset', icon: 'reset', onClick: () => { anim.stop(); st.i = 0; st.acc = 0; paint(); pb.sync(); } });
    events();
    st.i = GG.reducedMotion ? ev.length : 0;
    why();
    // start counting when the figure first scrolls into view
    GG.onVisible(f.stage, () => { if (!GG.reducedMotion && st.i === 0) { anim.start(); pb.sync(); } }, { once: true });
  }

  /* Fig 2: share of the peak a given intensity can use */
  function aiEfficiency(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'How much of the peak can a kernel use?', hint: 'drag the kernel · switch system', wide: true,
      caption: `In the <a data-term="roofline-model">roofline model</a>, operational/arithmetic intensity is plotted on the horizontal axis. Diagram adapted from <a href="${WWP}">Williams, Waterman, and Patterson (2008)</a>. The gauges show the best case, a kernel running exactly at its roof: it can use min(1, intensity ÷ ridge point) of the compute roof, and min(1, ridge point ÷ intensity) of the memory bandwidth.`,
    });
    const rf = RFC();
    if (!rf) return;
    const api = rf(f, {
      system: 'h100-bf16', showControls: true, showReadouts: true, shade: 'both',
      kernels: [{ id: 'k', label: 'Your kernel', ai: 30, color: 'accent' }],
      why: (x) => {
        if (!x.kernel) return null;
        const sh = Math.min(1, x.ai / x.ridge);
        if (x.bound === 'memory' && !x.atRidge) return `At <b>${fmtAI(x.ai)} ${fpw(x.ai)} per byte</b>, ${x.system.phrase} can use at most <b>${pct(sh, sh < 0.1 ? 1 : 0)}</b> of its peak: ${rf.fmt.bw(x.system.bw)} × ${fmtAI(x.ai)} = ${rf.fmt.perf(x.attainable)} of ${rf.fmt.perf(x.system.flops, 4)}. The other arithmetic units wait on memory. It takes <b>${rf.fmt.ridge(x.ridge)}</b> FLOPs per byte, ${sg(x.ridge / x.ai, 3)}× more, to keep them all busy.`;
        return `At <b>${fmtAI(x.ai)} ${fpw(x.ai)} per byte</b> the kernel is ${x.atRidge ? 'exactly at' : 'past'} the ridge (${rf.fmt.ridge(x.ridge)}): memory delivers bytes fast enough, and ${x.system.phrase} can run at its full <b>${rf.fmt.perf(x.system.flops, 4)}</b>. More intensity no longer helps; only faster arithmetic would.`;
      },
    });
    const gz = gaugeBox(f.stage);
    function paint() {
      const x = api.state();
      if (!x.ai) return;
      const c = Math.min(1, x.ai / x.ridge), m = Math.min(1, x.ridge / x.ai);
      gz.set([
        { l: 'share of peak FLOP/s usable', v: c, c: 'core', t: pct(c, c < 0.1 ? 1 : 0) },
        { l: 'share of memory bandwidth used', v: m, c: 'memory', t: pct(m, m < 0.1 ? 1 : 0) },
      ]);
    }
    api.on('change', paint);
    paint();
  }

  /* Fig 3: compressing data in global memory */
  function aiCompress(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Compression: fewer bytes, more FLOPs', hint: 'toggle · set ratio and decompression cost', wide: true,
      caption: 'A kernel that reads 1 GB of FP32 numbers (250 million of them) from global memory and does 2 FLOPs with each, on an H100\'s FP32 CUDA Cores (66.9 TFLOPS, 3.35 TB/s, ridge point 19.97 FLOPs/byte). Compressed, the same numbers take up 1 GB ÷ the ratio, and each costs extra FLOPs to decompress. Times assume the kernel runs exactly at its roof. The decompression cost is illustrative: real schemes vary widely.',
    });
    const rf = RFC();
    if (!rf) return;
    const F = H100.cc, BW = H100.bw, n = 2.5e8;
    const st = { on: true, r: 4, d: 6 };
    const M = () => {
      const fl0 = 2 * n, by0 = 4 * n, fl1 = (2 + (st.on ? st.d : 0)) * n, by1 = (4 * n) / (st.on ? st.r : 1);
      const tc0 = fl0 / F, tm0 = by0 / BW, tc1 = fl1 / F, tm1 = by1 / BW;
      return { fl0, by0, fl1, by1, tc0, tm0, tc1, tm1, T0: Math.max(tc0, tm0), T1: Math.max(tc1, tm1), ai0: fl0 / by0, ai1: fl1 / by1 };
    };
    const K = () => {
      const m = M(), out = [{ id: 'raw', label: 'Uncompressed', ai: m.ai0, draggable: false }];
      if (st.on) out.push({ id: 'zip', label: 'Compressed ×' + sg(st.r, 2), ai: m.ai1, draggable: false });
      return out;
    };
    const api = rf(f, {
      system: 'h100-fp32', systems: ['h100-fp32'], kernels: K(), selected: 'zip', draggable: false, showReadouts: false,
      xDomain: [0.1, 2000], yDomain: [1e11, 2e14], showWhy: false,
    });
    const bars = rsvg(f.stage, 'Time bars for the uncompressed and the compressed kernel: memory time in blue and compute time in green; the longer of the two sets each kernel\'s time.', (svg, w) => {
      const m = M(), mob = w < 560;
      const rows = [['uncompressed', m.tm0, m.tc0, fmtB(m.by0), fmtF(m.fl0)]];
      if (st.on) rows.push(['compressed ×' + sg(st.r, 2), m.tm1, m.tc1, fmtB(m.by1), fmtF(m.fl1)]);
      const Tm = Math.max(...rows.map((r) => Math.max(r[1], r[2])));
      const lw = mob ? 0 : 150, x0 = lw, x1 = w - (mob ? 0 : 92);
      let y = 4;
      rows.forEach(([lab, tm, tc, b, fl]) => {
        const T = Math.max(tm, tc);
        if (mob) { Tx(svg, 0, y + 10, lab, { fs: 11, fill: 'var(--ink)', weight: 600 }); Tx(svg, w, y + 10, fmtT(T), { fs: 11, anchor: 'end', fill: 'var(--ink)', weight: 600 }); y += 16; }
        else { Tx(svg, 0, y + 14, lab, { fs: 11.5, fill: 'var(--ink)', weight: 600 }); Tx(svg, w, y + 14, fmtT(T), { fs: 12, anchor: 'end', fill: 'var(--ink)', weight: 600 }); }
        [[tm, 'memory', 'move ' + b], [tc, 'core', fl]].forEach(([t, c, det], q) => {
          const yy = y + q * 17, ww = Math.max(1.5, ((x1 - x0) * t) / Tm), pace = t >= T * 0.9999;
          R(svg, x0, yy + 2, x1 - x0, 13, 'fill:rgba(255,255,255,0.04)', { rx: 3 });
          R(svg, x0, yy + 2, ww, 13, `fill:var(--${c});opacity:${pace ? 1 : 0.5}`, { rx: 3 });
          const txt = `${det} · ${fmtT(t)}`;
          const inside = ww > tw(txt, 10) + 12;
          Tx(svg, inside ? x0 + 6 : x0 + ww + 6, yy + 12, txt, { fs: 10, fill: inside ? '#0b0c12' : 'var(--ink-3)', weight: inside ? 600 : null });
        });
        y += 46;
      });
      return y - 6;
    });
    const sAI = stat(f, 'FLOPs per byte'), sBy = stat(f, 'bytes moved', 'memory'), sT = stat(f, 'time'), sX = stat(f, 'speed-up');
    function upd() {
      api.setKernels(K());
      if (st.on) api.select('zip');
      bars.redraw();
      const m = M(), x = m.T0 / m.T1, cb = m.ai1 >= SG_RIDGE;
      sAI.set(st.on ? `${sg(m.ai0, 2)} → ${sg(m.ai1, 3)}` : sg(m.ai0, 2));
      sBy.set(st.on ? `${fmtB(m.by0)} → ${fmtB(m.by1)}` : fmtB(m.by0));
      sT.set(st.on ? `${fmtT(m.T0)} → ${fmtT(m.T1)}` : fmtT(m.T0));
      sX.set(st.on ? '×' + num(x, 2) : '—', st.on ? (x > 1.0001 ? 'core' : x < 0.9999 ? 'danger' : null) : null);
      [slR, slD].forEach((q) => q && q.el.classList.toggle('pfa-dimctl', !st.on));
      let t;
      if (!st.on) t = `Uncompressed, the kernel moves ${fmtB(m.by0)} to do ${fmtF(m.fl0)}: <b>0.5 FLOPs per byte</b>, ${sg(SG_RIDGE / 0.5, 3)}× short of the ridge. It is <b>memory-bound</b>: moving the data takes ${fmtT(m.tm0)}, while the math alone would take ${fmtT(m.tc0)}. The arithmetic units idle ${pct(1 - m.tc0 / m.tm0, 1)} of the time. Switch compression on, or move either slider.`;
      else {
        const head = (st.r === 1 ? `No compression yet (ratio ×1): the kernel still moves ${fmtB(m.by1)}, and does` : `Compressed ×${sg(st.r, 2)}, the kernel moves only ${fmtB(m.by1)} but does`) + ` ${sg(2 + st.d, 3)} FLOPs per number (2 + ${sg(st.d, 3)} to decompress): intensity ${sg(m.ai0, 2)} → <b>${sg(m.ai1, 3)} FLOPs per byte</b>. `;
        if (!cb && st.r === 1) t = head + `Still <b>memory-bound</b>, so the extra FLOPs ride along for free, but with nothing saved the kernel is no faster. Raise the compression ratio.`;
        else if (!cb) t = head + `Still <b>memory-bound</b>, so the extra FLOPs ride along for free on idle arithmetic units, and the kernel runs <b>×${num(x, 2)}</b> faster: the speed-up is the compression ratio.`;
        else if (x > 1.0001) t = head + `That is past the ridge (19.97): the kernel is now <b>compute-bound</b>. It is still ×${num(x, 2)} faster than before, but the decompression work now sets the pace, and any more of it costs time.`;
        else if (st.r === 1) t = head + `With nothing saved, the decompression work only adds time: the kernel is <b>compute-bound</b> and <b>slower</b> (×${num(x, 2)}) than not compressing at all. Raise the compression ratio, or lower the decompression cost.`;
        else t = head + `Decompression now costs more time than the bytes it saves: the kernel is <b>compute-bound</b> and ${x < 0.9999 ? `<b>slower</b> (×${num(x, 2)}) than` : 'no faster than'} not compressing at all. Past ${sg(4 * F / BW - 2, 3)} FLOPs per number, compression cannot pay off on this GPU.`;
      }
      f.setWhy(t);
    }
    let slR = null, slD = null;
    /* moving a compression slider while compression is off switches it on, so the sliders never look live but do nothing */
    const autoOn = () => { if (!st.on) { st.on = true; tg.set(true, false); } };
    const tg = GG.ui.toggle(f.controls, { label: 'compress the data', value: st.on, onChange: (v) => { st.on = v; upd(); } });
    slR = GG.ui.slider(f.controls, { label: 'compression ratio', min: 1, max: 8, step: 0.5, value: st.r, format: (v) => '×' + sg(v, 2), onInput: (v) => { st.r = v; autoOn(); upd(); } });
    slD = GG.ui.slider(f.controls, { label: 'decompress FLOPs / number', min: 0, max: 128, step: 1, value: st.d, format: (v) => String(v), onInput: (v) => { st.d = v; autoOn(); upd(); } });
    upd();
  }

  /* Fig 4: gradient checkpointing on a 16-layer network */
  function aiCheckpoint(ctx, slot) {
    const L = 16;
    const f = mkFig(ctx, slot, {
      title: 'Gradient checkpointing', hint: 'choose k · switch traffic and layer type · play the backward pass', wide: true,
      caption: 'A 16-layer network. Each layer\'s forward step produces one activation that its backward step needs later. Saving every k-th activation (a checkpoint) means re-running the forward steps in between during the backward pass, one segment at a time; Play sweeps the backward pass and draws how many activations are held over time. Compute is counted in units of one layer\'s forward step, with the usual rule of thumb that a backward step costs about two. Traffic counts only stored activations (weight and gradient traffic is ignored, which exaggerates the change in FLOPs per byte): without checkpointing each activation is written once and read once, 32 transfers. With round trips, the forward pass writes only the checkpoints, recomputation reads each checkpoint once more and writes the regenerated activations, and the backward pass reads all 16: 2L + L/k transfers. On chip, only the checkpoints cross the memory bus, written once and read once: 2L/k. Toy timing: one activation transfer takes 1 time unit; one forward step of math takes ¼ unit when the layers are memory-bound and 4 units when they are compute-bound; a pass takes max(compute, traffic), as on a roofline.',
    });
    const st = { k: 4, mode: 'rt', lay: 'mb', pos: -1 };
    const M = () => {
      const k = st.k, saved = L / k, re = L - saved, peak = saved + (k - 1);
      const fl = 3 * L + re, by = k === 1 ? 2 * L : st.mode === 'rt' ? 2 * L + L / k : (2 * L) / k;
      const c = st.lay === 'mb' ? 0.25 : 4, T0 = Math.max(3 * L * c, 2 * L), T = Math.max(fl * c, by);
      return { k, saved, re, peak, fl, by, c, T0, T, aiX: (fl / by) / (3 * L / (2 * L)), extra: re / (3 * L) };
    };
    /* the timeline of the whole pass: forward, then per segment (last first) recompute and backward */
    function events() {
      const k = st.k, ev = [];
      let held = 0;
      for (let j = 0; j < L; j++) { if (j % k === 0) held++; ev.push({ row: 'f', j, held }); }
      for (let c0 = Math.floor((L - 1) / k) * k; c0 >= 0; c0 -= k) {
        for (let j = c0 + 1; j < Math.min(L, c0 + k); j++) { held++; ev.push({ row: 'r', j, held }); }
        for (let j = Math.min(L, c0 + k) - 1; j >= c0; j--) { held--; ev.push({ row: 'b', j, held }); }
      }
      return ev;
    }
    let EV = events();
    const E = { ok: false };
    const view = rsvg(f.stage, 'Rows of layer boxes for the forward pass, the activations it saves, the forward steps recomputed during the backward pass, and the backward pass, with meters for peak memory and total compute and a chart of activations held over time.', (svg, w) => {
      const m = M(), mob = w < 640;
      E.ok = false;
      const lw = mob ? 0 : 128, gap = mob ? 2 : 4;
      const bw = (w - lw - gap * (L - 1)) / L;
      const X = (j) => lw + j * (bw + gap);
      const defs = GG.svg('defs', null, svg);
      const pat = GG.svg('pattern', { id: 'pfa-rc-hatch', width: 5, height: 5, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
      R(pat, 0, 0, 5, 5, 'fill:var(--core-a)');
      R(pat, 0, 0, 1.8, 5, 'fill:var(--core)');
      let y = 0;
      const rowLab = (t, sub, yy, hh) => {
        if (mob) { Tx(svg, 0, yy - 5, t + (sub ? '  ' + sub : ''), { fs: 10, fill: 'var(--ink-2)' }); }
        else { Tx(svg, 0, yy + hh / 2 + (sub ? -1 : 4), t, { fs: 11, fill: 'var(--ink)', weight: 600 }); if (sub) Tx(svg, 0, yy + hh / 2 + 12, sub, { fs: 9.5, fill: 'var(--ink-3)' }); }
      };
      const rowY = {};
      // forward
      y = mob ? 14 : 2;
      rowY.f = [y, 26];
      rowLab('forward pass →', 'layer 1 … 16', y, 26);
      for (let j = 0; j < L; j++) {
        R(svg, X(j), y, bw, 26, 'fill:var(--core-a);stroke:var(--core);stroke-width:1', { rx: 4 });
        if (bw >= 15 || j % 3 === 0) Tx(svg, X(j) + bw / 2, y + 17, String(j + 1), { fs: bw >= 22 ? 10.5 : 9, anchor: 'middle', fill: 'var(--core)' });
      }
      // activations
      y += 26 + (mob ? 22 : 12);
      rowLab('activations', `${m.saved} kept · ${m.re} dropped`, y, 14);
      for (let j = 0; j < L; j++) {
        const keep = j % st.k === 0;
        R(svg, X(j) + bw * 0.15, y, bw * 0.7, 14, keep ? 'fill:var(--memory);stroke:none' : 'fill:none;stroke:var(--ink-3);stroke-width:1;stroke-dasharray:2 2', { rx: 3 });
      }
      // recompute
      y += 14 + (mob ? 22 : 12);
      rowY.r = [y, 22];
      rowLab('recomputed', m.re ? `${m.re} extra forward steps` : 'nothing to redo', y, 22);
      for (let j = 0; j < L; j++) {
        if (j % st.k === 0) continue;
        R(svg, X(j), y, bw, 22, 'fill:url(#pfa-rc-hatch);stroke:var(--core);stroke-width:1;stroke-dasharray:3 2', { rx: 4 });
      }
      // segment brackets
      if (st.k > 1) {
        for (let s0 = 0; s0 < L; s0 += st.k) {
          const xa = X(s0), xb = X(s0 + st.k - 1) + bw;
          Pa(svg, `M${r2(xa)},${r2(y + 27)}v4H${r2(xb)}v-4`, 'fill:none;stroke:var(--ink-3);stroke-width:1');
        }
      }
      // backward
      y += 22 + (mob ? 26 : 16);
      rowY.b = [y, 26];
      rowLab('← backward pass', 'each step ≈ 2 units', y, 26);
      for (let j = 0; j < L; j++) {
        R(svg, X(j), y, bw, 26, 'fill:var(--core);opacity:0.75', { rx: 4 });
        if (bw >= 15 || j % 3 === 0) Tx(svg, X(j) + bw / 2, y + 17, '∇' + (bw >= 22 ? (j + 1) : ''), { fs: bw >= 22 ? 10.5 : 9, anchor: 'middle', fill: '#0b0c12', weight: 600 });
      }
      // the step being played
      E.hl = R(svg, 0, 0, bw + 4, 10, 'fill:none;stroke:var(--ink);stroke-width:2', { rx: 5, visibility: 'hidden' });
      E.rowY = rowY; E.X = X; E.bw = bw;
      // meters
      y += 26 + 26;
      const mx0 = mob ? 0 : lw, mx1 = w;
      const meter = (title, parts, total, valTxt) => {
        Tx(svg, mx0, y, title, { fs: 10.5, fill: 'var(--ink-2)' });
        Tx(svg, mx1, y, valTxt, { fs: 11, anchor: 'end', fill: 'var(--ink)', weight: 600 });
        let x = mx0;
        R(svg, mx0, y + 6, mx1 - mx0, 12, 'fill:rgba(255,255,255,0.05)', { rx: 3 });
        parts.forEach(([v, stl]) => { const ww = ((mx1 - mx0) * v) / total; if (ww > 0) R(svg, x, y + 6, ww, 12, stl); x += ww; });
        y += 38;
      };
      meter(mob ? 'peak activations held' : 'peak activations held at once: checkpoints + one segment recomputed', [[m.saved, 'fill:var(--memory)'], [m.k - 1, 'fill:var(--memory);opacity:0.45']], L, `${m.peak} of ${L}` + (m.peak < L ? ` (−${pct(1 - m.peak / L, 0)})` : ''));
      meter(mob ? 'compute (units)' : 'compute, in forward-step units', [[L, 'fill:var(--core-a);stroke:var(--core);stroke-width:1'], [2 * L, 'fill:var(--core);opacity:0.75'], [m.re, 'fill:url(#pfa-rc-hatch)']], 4 * L, `${m.fl} = 16 fwd + 32 bwd${m.re ? ' + ' + m.re + ' redone' : ''}`);
      meter(mob ? 'activation transfers' : 'activation transfers to and from global memory', [[m.by, 'fill:var(--memory);opacity:0.75']], 2 * L + L / 2, `${sg(m.by, 3)} (was 32)`);
      // activations held over time
      const cx0 = mx0, cx1 = mx1, ch = mob ? 70 : 80, cy0 = y, cy1 = y + ch;
      Tx(svg, cx0, cy0 - 2, mob ? 'activations held over time' : 'activations held over time: forward, then recompute + backward one segment at a time', { fs: 10.5, fill: 'var(--ink-2)' });
      const top = cy0 + 8;
      const n = EV.length;
      const CX = (i) => cx0 + (i / n) * (cx1 - cx0), CY = (h) => cy1 - (h / L) * (cy1 - top);
      R(svg, cx0, top, cx1 - cx0, cy1 - top, 'fill:rgba(8,9,14,0.35)');
      Ln(svg, cx0, CY(m.peak), cx1, CY(m.peak), 'stroke:var(--memory);stroke-width:1;stroke-dasharray:3 3;opacity:0.7');
      Tx(svg, cx1 - 4, CY(m.peak) - 4, `peak ${m.peak}`, { fs: 9.5, anchor: 'end', fill: 'var(--memory)', halo: true });
      Ln(svg, CX(L), top, CX(L), cy1, 'stroke:var(--ink-3);stroke-width:1;stroke-dasharray:2 3');
      Tx(svg, CX(L) + 4, cy1 - 4, 'backward starts', { fs: 9, fill: 'var(--ink-3)', halo: true });
      let d = `M${r2(CX(0))},${r2(CY(0))}`;
      EV.forEach((e, i) => { d += `V${r2(CY(e.held))}H${r2(CX(i + 1))}`; });
      Pa(svg, d, 'fill:none;stroke:var(--memory);stroke-width:2');
      E.veil = R(svg, cx0, top, 0, cy1 - top, 'fill:rgba(11,12,18,0.72)');
      E.ph = Ln(svg, cx0, top, cx0, cy1, 'stroke:var(--accent);stroke-width:1.5');
      E.CX = CX; E.cx1 = cx1;
      E.ok = true;
      paintPos();
      return cy1 + 6;
    });
    legend(f.stage, [['var(--memory)', 'kept activation (checkpoint)'], ['var(--ink-3)', 'dropped, to be recomputed', 'ol'], ['var(--core)', 'forward / backward step'], ['repeating-linear-gradient(135deg, var(--core) 0 2px, var(--core-a) 2px 5px)', 'extra compute: recomputed forward steps']]);
    function paintPos() {
      if (!E.ok) return;
      const n = EV.length, i = Math.floor(st.pos);
      const on = st.pos >= 0 && st.pos < n;
      E.ph.style.opacity = on ? '1' : '0';
      E.veil.style.opacity = on ? '1' : '0';
      E.hl.setAttribute('visibility', on ? 'visible' : 'hidden');
      if (!on) return;
      const x = E.CX(st.pos);
      E.ph.setAttribute('x1', r2(x)); E.ph.setAttribute('x2', r2(x));
      E.veil.setAttribute('x', r2(x)); E.veil.setAttribute('width', r2(Math.max(0, E.cx1 - x)));
      const e = EV[i], [ry, rh] = E.rowY[e.row];
      E.hl.setAttribute('x', r2(E.X(e.j) - 2)); E.hl.setAttribute('y', r2(ry - 2)); E.hl.setAttribute('height', r2(rh + 4));
      sNow.set(`${e.held} / ${L}`);
    }
    const sP = stat(f, 'peak activations', 'memory'), sNow = stat(f, 'held now'), sE = stat(f, 'extra compute', 'core'), sB = stat(f, 'activation traffic', 'memory'), sA = stat(f, 'FLOPs per activation byte'), sT = stat(f, 'pass time (toy units)');
    function upd() {
      EV = events();
      view.redraw();
      const m = M();
      sP.set(`${m.peak} / ${L}`);
      if (!(st.pos >= 0 && st.pos < EV.length)) sNow.set('—');
      sE.set(m.re ? '+' + pct(m.extra, 0) : '0%');
      sB.set(`32 → ${sg(m.by, 3)}`);
      sA.set('×' + num(m.aiX, 2));
      const sp = m.T0 / m.T;
      sT.set(`${sg(m.T0, 3)} → ${sg(m.T, 3)}`, sp > 1.0001 ? 'core' : sp < 0.9999 ? 'danger' : null);
      let t;
      const cTxt = st.lay === 'mb' ? '¼' : '4';
      const time = `With ${st.lay === 'mb' ? 'memory-bound layers (here one forward step of math takes ¼ of the time of one transfer)' : 'compute-bound layers (here one forward step of math takes 4 times as long as one transfer)'}, the pass takes max(${m.fl} × ${cTxt}, ${sg(m.by, 3)}) = <b>${sg(m.T, 3)}</b> time units instead of ${sg(m.T0, 3)}: ${sp > 1.0001 ? `<b>×${num(sp, 2)} faster</b>` : sp < 0.9999 ? `<b>×${num(1 / sp, 2)} slower</b>` : 'no change'}.`;
      if (st.k === 1) t = 'Keeping every activation: all 16 stay in global memory from the forward pass until the backward pass reaches their layer, 32 transfers. Nothing is recomputed. This is plain backpropagation, the baseline for the other settings.';
      else {
        t = `Keeping every ${st.k === 2 ? 'second' : st.k + 'th'} activation: ${m.saved} ${plural(m.saved, 'checkpoint')} ${m.saved === 1 ? 'survives' : 'survive'} the forward pass, and the backward pass regenerates the other ${m.re} from the nearest checkpoint, one segment at a time, for <b>${pct(m.extra, 0)}</b> more compute. `;
        t += m.peak < L ? `At most <b>${m.peak}</b> activations are held at once instead of 16. ` : 'One segment\'s 15 recomputed activations plus the checkpoint are as many as before, so this setting <b>saves nothing at the peak</b>. ';
        if (st.mode === 'rt') {
          const dir = m.aiX > 1.0001 ? `rise <b>×${num(m.aiX, 2)}</b>` : m.aiX < 0.9999 ? `<b>fall</b> (×${num(m.aiX, 2)}): the extra checkpoint reads outweigh the extra FLOPs` : 'stay the same';
          t += `With round trips through global memory, the traffic grows a little (32 → ${sg(m.by, 3)} transfers), and FLOPs per activation byte ${dir}. `;
        } else t += `If recomputed activations never leave the chip, only the checkpoints cross the memory bus (32 → ${sg(m.by, 3)} transfers), so FLOPs per activation byte rise <b>×${num(m.aiX, 2)}</b>. `;
        t += time;
        if (st.k === 4) t += ' With 16 layers, k = 4 = √16 gives the smallest peak.';
      }
      f.setWhy(t);
    }
    GG.ui.seg(f.controls, { label: 'keep every k-th activation', value: st.k, options: [1, 2, 4, 8, 16].map((k) => ({ value: k, label: k === 1 ? 'all (k = 1)' : 'k = ' + k })), onChange: (v) => { st.k = v; st.pos = -1; anim.stop(); pb.sync(); upd(); } });
    GG.ui.seg(f.controls, { label: 'recomputed activations', value: st.mode, options: [{ value: 'rt', label: 'round-trip to global memory' }, { value: 'chip', label: 'stay on chip (ideal)' }], onChange: (v) => { st.mode = v; upd(); } });
    GG.ui.seg(f.controls, { label: 'each layer is', value: st.lay, options: [{ value: 'mb', label: 'memory-bound' }, { value: 'cb', label: 'compute-bound' }], onChange: (v) => { st.lay = v; upd(); } });
    const anim = GG.anim(f.stage, (tt, dt) => {
      st.pos += dt * 7;
      if (st.pos >= EV.length) { st.pos = -1; anim.stop(); pb.sync(); sNow.set('—'); }
      paintPos();
    }, { autostart: false });
    const row = GG.el('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;align-items:flex-end' });
    f.controls.append(row);
    const pb = GG.ui.playButton(row, anim, { onToggle: (on) => { if (on && !(st.pos >= 0)) st.pos = 0; paintPos(); } });
    GG.ui.button(row, { label: 'Step', icon: 'next', onClick: () => { anim.stop(); pb.sync(); st.pos = st.pos >= 0 ? Math.floor(st.pos) + 1 : 0; if (st.pos >= EV.length) st.pos = -1; paintPos(); if (st.pos < 0) sNow.set('—'); } });
    upd();
  }

  /* Fig 5: the glossary's table, live, on a roofline */
  function aiLive(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'The table, live', hint: 'slide N · pick a kernel', wide: true,
      caption: 'The glossary\'s three kernels at the same N (elements for SAXPY and the FFT; matrices are N × N for SGEMM), on an H100\'s FP32 CUDA Cores (66.9 TFLOPS, 3.35 TB/s, ridge point 19.97 FLOPs/byte), the hardware these single-precision kernels run on. The FFT uses log base 2. The dots sit on their roofs: real kernels land somewhat lower.',
    });
    const rf = RFC();
    if (!rf) return;
    const N = () => 2 ** AIS.e;
    const kern = () => AIK.map((k) => ({ id: k.id, label: k.short, ai: k.fl(N()) / k.by(N()), draggable: false }));
    let sel = 'sgemm';
    const api = rf(f, {
      system: 'h100-fp32', systems: ['h100-fp32'], kernels: kern(), selected: sel, draggable: false, showReadouts: true,
      xDomain: [0.05, 20000], yDomain: [3e9, 2e14],
      why: (x) => {
        const n = N(), e = AIS.e, k = x.kernel;
        if (!k) return null;
        const K = AIK.find((q) => q.id === k.id), fl = K.fl(n), by = K.by(n);
        const head = `<b>${K.short}</b> at N = 2${supE(e)} = ${fI(n)}: ${fmtCount(fl)} FLOPs on ${fmtCount(by)} bytes. `;
        if (k.id === 'saxpy') return head + 'That is <b>1/6 FLOP per byte</b> at every N, so its dot never moves: no input size makes SAXPY anything but <b>memory-bound</b>.';
        if (k.id === 'fft') return head + `5/32 × log₂N = 5/32 × ${e} = <b>${sg(k.ai, 3)} FLOPs per byte</b>. Doubling N adds just 5/32 of a FLOP per byte; reaching this ridge (19.97) would take N ≈ 2¹²⁸, a 39-digit number. <b>Memory-bound</b> at any practical size.`;
        return head + `N/8 = <b>${fmtAI(k.ai)} ${fpw(k.ai)} per byte</b>. Doubling N doubles it. ${k.ai >= SG_RIDGE ? `Past the ridge (19.97) since N = 160: <b>compute-bound</b>.` : `It reaches the ridge (19.97) at N = 160; until then it is <b>memory-bound</b>.`}`;
      },
    });
    const tbl = GG.el('div', { class: 'pfa-tw' });
    f.stage.append(tbl);
    function table() {
      const n = N();
      tbl.innerHTML = TB(`<thead><tr><th>kernel</th><th class="num">FLOPs</th><th class="num">bytes moved</th><th class="num">FLOPs/byte</th><th class="num">scaling</th><th>on H100 FP32</th></tr></thead><tbody>` +
        AIK.map((k) => {
          const fl = k.fl(n), by = k.by(n), ai = fl / by, cb = ai >= SG_RIDGE, on = k.id === sel;
          return `<tr><td class="${on ? 'hl' : ''}">${k.name}</td><td class="num">${k.flT} = ${fmtCount(fl)}</td><td class="num">${k.byT} = ${fmtCount(by)}</td><td class="num ${on ? 'hl' : ''}">${k.aiT} = ${sg(ai, 3)}</td><td class="num">${k.sc}</td><td class="${cb ? 'c-core' : 'c-memory'}">${cb ? 'compute-bound' : 'memory-bound'}</td></tr>`;
        }).join('') + '</tbody>');
    }
    const sl = GG.ui.slider(f.controls, { label: 'N', min: 1, max: 16, step: 1, value: AIS.e, format: (v) => `2${supE(v)} = ${fI(2 ** v)}`, onInput: (v) => { aiSetE(v, sync); sync(); } });
    const seg = GG.ui.seg(f.controls, { label: 'describe', value: sel, options: AIK.map((k) => ({ value: k.id, label: k.short })), onChange: (v) => { sel = v; api.select(v); table(); } });
    api.on('change', (x) => { if (x.kernel && x.kernel.id !== sel) { sel = x.kernel.id; seg.set(sel, false); table(); } });
    function sync() { sl.set(AIS.e, false); api.setKernels(kern()); api.select(sel); table(); }
    AIS.subs.push(sync);
    table();
  }

  /* Fig 6: how intensity scales with N */
  function aiScaling(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Three scaling classes', hint: 'slide or drag along N', wide: true,
      caption: 'Arithmetic intensity against N on log–log axes. O(1) is flat, O(N) is a straight line climbing one decade per decade, O(log N) bends slowly upward, and O(1/N) falls one decade per decade (the thin grey dashed line is 1/N FLOPs per byte, a pure illustration of the class). The horizontal dashed line is the H100 FP32 ridge point, 19.97 FLOPs/byte. As in Fig. 5, each kernel is blue where it is memory-bound (below the ridge) and green where it is compute-bound; the line style tells the kernels apart. Shares N with Fig. 5.',
    });
    const ED = [1, 16], YD = [1e-5, 1e4];
    const curves = [
      /* kernels are coloured by regime (blue below the ridge, green above), told apart by line style (sd) and name */
      { id: 'sgemm', fn: (n) => n / 8, lab: 'SGEMM · O(N)', short: 'SGEMM', sd: null, key: 'ln' },
      { id: 'fft', fn: (n) => (5 / 32) * Math.log2(n), lab: 'FFT · O(log N)', short: 'FFT', sd: '8 4', key: 'lg' },
      { id: 'saxpy', fn: () => 1 / 6, lab: 'SAXPY · O(1)', short: 'SAXPY', sd: '0.1 5', key: 'dd' },
      { id: 'inv', fn: (n) => 1 / n, c: 'ink-3', lab: 'O(1/N)', short: '1/N', dash: true },
    ];
    const colOf = (c, v) => c.c || (v >= SG_RIDGE ? 'core' : 'memory');
    let G0 = null;
    const view = rsvg(f.stage, 'Arithmetic intensity of SAXPY, the FFT and SGEMM against N on log-log axes, with an O(1/N) guide line and the H100 FP32 ridge point.', (svg, w) => {
      const mob = w < 640;
      const ml = mob ? 46 : 58, mr = mob ? 10 : 118, mt = 10, mb = 34, H = mob ? 270 : 330;
      const x0 = ml, x1 = w - mr, y0 = mt, y1 = H - mb;
      const X = (e) => x0 + ((e - ED[0]) / (ED[1] - ED[0])) * (x1 - x0);
      const Y = (v) => y1 - ((lg(clamp(v, YD[0], YD[1])) - lg(YD[0])) / (lg(YD[1]) - lg(YD[0]))) * (y1 - y0);
      G0 = { x0, x1, X };
      R(svg, x0, y0, x1 - x0, y1 - y0, 'fill:rgba(8,9,14,0.35)');
      for (let e = 2; e <= 16; e += 2) { Ln(svg, X(e), y0, X(e), y1, 'stroke:rgba(255,255,255,0.06)'); if (!mob || e % 4 === 0) Tx(svg, X(e), y1 + 15, '2' + supE(e), { fs: 10, anchor: 'middle', fill: 'var(--ink-3)' }); }
      decades(YD[0], YD[1]).forEach((v) => {
        Ln(svg, x0, Y(v), x1, Y(v), 'stroke:rgba(255,255,255,0.06)');
        const e10 = Math.round(lg(v));
        if (!mob || e10 % 2 === 0) Tx(svg, x0 - 6, Y(v) + 3.5, v >= 1 ? fI(v) : v >= 0.01 ? String(v) : '10' + supE(e10), { fs: 10, anchor: 'end', fill: 'var(--ink-3)' });
      });
      Pa(svg, `M${x0},${y0}V${y1}H${x1}`, 'fill:none;stroke:var(--ink-3);stroke-width:1.2');
      Tx(svg, x1, H - 4, 'N →', { fs: 10, anchor: 'end', fill: 'var(--ink-3)' });
      Tx(svg, x0 + 6, y0 + 13, 'FLOPs per byte', { fs: 10.5, fill: 'var(--ink-2)' });
      // ridge
      Ln(svg, x0, Y(SG_RIDGE), x1, Y(SG_RIDGE), 'stroke:var(--core);stroke-width:1.2;stroke-dasharray:5 4');
      Tx(svg, mob ? x0 + 6 : x1 + 6, Y(SG_RIDGE) + (mob ? -6 : 4), mob ? 'H100 FP32 ridge 19.97' : 'ridge 19.97', { fs: 10, fill: 'var(--core)' });
      curves.forEach((c) => {
        // one path per run of samples in the same regime, so a curve changes colour where it crosses the ridge
        const runs = [];
        for (let i = 0; i <= 150; i++) {
          const e = ED[0] + (i / 150) * (ED[1] - ED[0]), v = c.fn(2 ** e), col = colOf(c, v), pt = `${r2(X(e))},${r2(Y(v))}`;
          const last = runs[runs.length - 1];
          if (last && last.col === col) last.pts.push(pt);
          else { if (last) last.pts.push(pt); runs.push({ col, pts: [pt] }); }
        }
        const sty = c.dash ? 'stroke-width:1.5;stroke-dasharray:4 4' : `stroke-width:2.5${c.sd ? `;stroke-dasharray:${c.sd};stroke-linecap:round` : ''}`;
        runs.forEach((r) => Pa(svg, 'M' + r.pts.join('L'), `fill:none;stroke:var(--${r.col});${sty}`));
        if (!mob) Tx(svg, x1 + 6, Y(c.fn(2 ** 16)) + 4, c.lab, { fs: 10, fill: `var(--${colOf(c, c.fn(2 ** 16))})`, weight: 600 });
      });
      // SGEMM crosses the ridge at N = 160
      const ec = Math.log2(SG_RIDGE * 8);
      R(svg, X(ec) - 4, Y(SG_RIDGE) - 4, 8, 8, 'fill:var(--ink);stroke:var(--bg);stroke-width:1.5', { rx: 1 });
      Tx(svg, X(ec) + 8, Y(SG_RIDGE) + 15, 'N = 160', { fs: 10, fill: 'var(--ink)', halo: true });
      // current N
      const e = AIS.e, xe = X(e);
      Ln(svg, xe, y0, xe, y1, 'stroke:var(--accent);stroke-width:1.2;stroke-dasharray:2 3');
      const lab = `N = 2${supE(e)}`;
      Tx(svg, clamp(xe + 5, x0, x1 - tw(lab, 10.5)), y1 - 6, lab, { fs: 10.5, fill: 'var(--accent)', weight: 600 });
      const marks = curves.map((c) => ({ c, v: c.fn(2 ** e) })).sort((a, b) => b.v - a.v);
      marks.forEach((mk) => C(svg, xe, Y(mk.v), mk.c.dash ? 3.5 : 5, `fill:var(--${colOf(mk.c, mk.v)});stroke:var(--bg);stroke-width:2`));
      // value labels in a column beside the line, spread 13 px apart, with leaders when they had to move
      const labs = marks.filter((mk) => !(mk.c.dash && mob)).map((mk) => ({ mk, yy: Y(mk.v), ty: Y(mk.v) + 4 }));
      for (let i = 1; i < labs.length; i++) if (labs[i].ty - labs[i - 1].ty < 13) labs[i].ty = labs[i - 1].ty + 13;
      const over = labs.length ? labs[labs.length - 1].ty - (y1 - 4) : 0;
      if (over > 0) labs.forEach((q) => { q.ty -= over; });
      const vlab = (mk) => `${mk.c.short} ${sg(mk.v, 3)}`;
      const maxW = Math.max(0, ...labs.map((q) => tw(vlab(q.mk), 10.5)));
      const left = xe + 22 + maxW > x1;
      labs.forEach((q) => {
        const t = vlab(q.mk), lx = left ? xe - 18 : xe + 18, col = colOf(q.mk.c, q.mk.v);
        if (Math.abs(q.ty - 4 - q.yy) > 3) Ln(svg, xe + (left ? -6 : 6), q.yy, lx + (left ? 3 : -3), q.ty - 4, `stroke:var(--${col});stroke-width:1`);
        Tx(svg, lx, q.ty, t, { fs: 10.5, anchor: left ? 'end' : null, fill: `var(--${col})`, weight: 600, halo: true });
      });
      return H;
    });
    legend(f.stage, curves.map((c) => [c.dash ? `var(--${c.c})` : 'var(--ink-2)', c.lab, c.dash ? 'dl' : c.key]).concat([['var(--memory)', 'memory-bound'], ['var(--core)', 'compute-bound'], ['var(--core)', 'H100 FP32 ridge point', 'dl']]));
    const sl = GG.ui.slider(f.controls, { label: 'N', min: 1, max: 16, step: 1, value: AIS.e, format: (v) => `2${supE(v)} = ${fI(2 ** v)}`, onInput: (v) => { aiSetE(v, sync); sync(); } });
    const sS = stat(f, 'SGEMM'), sF = stat(f, 'FFT'), sA = stat(f, 'SAXPY');
    function sync() {
      sl.set(AIS.e, false);
      view.redraw();
      const n = 2 ** AIS.e;
      sS.set(fmtAI(n / 8), n / 8 >= SG_RIDGE ? 'core' : 'memory'); sF.set(sg((5 / 32) * AIS.e, 3), 'memory'); sA.set('0.167', 'memory');
      const e = AIS.e;
      if (e === 1) f.setWhy(`The starting values, at N = 2¹ = 2: SGEMM does <b>0.25</b> FLOPs per byte (N/8), the FFT <b>0.156</b> (5/32 × log₂2), SAXPY <b>1/6</b>, and the O(1/N) guide is at 0.5. All four are memory-bound and nearly equal here. Slide N up to watch them separate.`);
      else f.setWhy(`From N = 2${supE(e - 1)} to 2${supE(e)}: SGEMM's intensity doubled to <b>${fmtAI(n / 8)}</b> (O(N)), the FFT's grew by 5/32 to <b>${sg((5 / 32) * e, 3)}</b> (O(log N)), and SAXPY's stayed at <b>1/6</b> (O(1)). An O(1/N) kernel would have halved, to ${sg(1 / n, 3)}.`);
    }
    // drag along the chart to set N
    const pick = (ev) => {
      if (!G0) return;
      const r = view.svg.getBoundingClientRect();
      const x = ((ev.clientX - r.left) / r.width) * view.w;
      const e = ED[0] + ((x - G0.x0) / (G0.x1 - G0.x0)) * (ED[1] - ED[0]);
      const ee = clamp(Math.round(e), 1, 16);
      if (ee !== AIS.e) { aiSetE(ee, sync); sync(); }
    };
    view.svg.addEventListener('pointerdown', (ev) => { pick(ev); view.svg.setPointerCapture && view.svg.setPointerCapture(ev.pointerId); });
    view.svg.addEventListener('pointermove', (ev) => { if (ev.buttons) pick(ev); });
    view.svg.style.cursor = 'ew-resize';
    AIS.subs.push(sync);
    sync();
  }

  /* Fig 7: attention while decoding: intensity set by the head grouping, not the batch */
  function aiAttention(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Attention while decoding', hint: 'change the grouping · change the batch', wide: true,
      caption: `Two kernels of one decoding step, in BF16 on the Tensor Cores. Attention over the KV cache: each key and value number (2 bytes) is used in one multiply-add (2 FLOPs) per query head that shares it, so its intensity is about the group size, whatever the batch. The weight matmul: a ${fI(D_MODEL)} × ${fI(D_MODEL)} weight matrix shared by the whole batch, intensity B·d ÷ (d + 2B) ≈ B (as in <a data-term="compute-bound">Compute-bound</a>). Softmax and other small costs are ignored. Beyond the glossary.`,
    });
    const rf = RFC();
    if (!rf) return;
    const st = { g: 1, B: 64 };
    const K = () => ([
      { id: 'att', label: 'Attention (KV cache)', ai: st.g, draggable: false },
      { id: 'mm', label: 'Weight matmul', ai: gemmAI(st.B, D_MODEL), draggable: false },
    ]);
    const NAMES = { 1: 'multi-head attention (one key/value head per query head)', 2: 'grouped-query attention (2 query heads share each key/value head)', 4: 'grouped-query attention (4 query heads share each key/value head)', 8: 'grouped-query attention (8 query heads share each key/value head)', 16: 'grouped-query attention (16 query heads share each key/value head)' };
    const api = rf(f, {
      system: 'h100-bf16', systems: ['h100-bf16', 'b200-bf16'], showControls: true, showReadouts: false, kernels: K(), selected: 'att', draggable: false,
      xDomain: [0.3, 10000], yDomain: [1e11, 4e15],
      why: (x) => {
        const att = st.g, mm = gemmAI(st.B, D_MODEL);
        return `With ${NAMES[st.g]}, attention does about <b>${att} FLOP${att > 1 ? 's' : ''} per byte</b> of KV cache, ${sg(x.ridge / att, 3)}× short of ${x.system.label}'s ridge (${rf.fmt.ridge(x.ridge)}): <b>memory-bound</b>, at ${rf.fmt.perf(Math.min(x.system.flops, x.system.bw * att))}. At batch ${fI(st.B)}, the weight matmul does ${fmtAI(mm)} ${fpw(mm)} per byte (${mm >= x.ridge ? '<b>compute-bound</b>' : 'memory-bound'}). A bigger batch moves only the matmul: every sequence brings its own KV cache.`;
      },
    });
    const sA = stat(f, 'attention FLOPs/byte'), sM = stat(f, 'matmul FLOPs/byte');
    /* the chips take their kernel's regime colour, as the dots do */
    function chips() {
      const r = api.state().ridge, tone = (a) => (a >= r ? 'core' : 'memory'), mm = gemmAI(st.B, D_MODEL);
      sA.set(String(st.g), tone(st.g)); sM.set(fmtAI(mm), tone(mm));
    }
    api.on('change', chips);
    function upd() { api.setKernels(K()); api.select('att'); chips(); }
    GG.ui.seg(f.controls, { label: 'query heads per key/value head (1 = MHA, >1 = GQA)', value: st.g, options: [1, 2, 4, 8, 16].map((g) => ({ value: g, label: String(g), title: g === 1 ? 'multi-head attention' : 'grouped-query attention' })), onChange: (v) => { st.g = v; upd(); } });
    GG.ui.slider(f.controls, { label: 'batch size', min: 1, max: 1024, step: 1, log: true, value: st.B, format: (v) => fI(v), onInput: (v) => { st.B = Math.max(1, Math.round(v)); upd(); } });
    upd();
  }

  /* Fig 8: the ridge-point ladder */
  function aiRidges(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Ridge points by architecture', hint: 'drag your kernel\'s intensity', wide: true,
      caption: 'The six rows of the ridge-point table, grouped by Streaming Multiprocessor architecture on a log axis. A system turns green when a kernel of the chosen intensity would be compute-bound on it, and blue when memory-bound. The ringed point is each architecture\'s highest ridge; the dashed path joins them. H100 FP8 is drawn at the recomputed 590.7. The matmul examples are C = A @ B in BF16 with no C read: 2N³ FLOPs on 3N² two-byte elements, N/3 FLOPs per byte. The SGEMM row of the algorithm table above also reads C, and in 4-byte FP32, hence its N/8.',
    });
    const rf = RFC();
    if (!rf) return;
    const P = rf.PRESETS;
    const LANES = [
      { arch: 'Ampere', gpu: 'A100', ids: ['a100-bf16'] },
      { arch: 'Hopper', gpu: 'H100', ids: ['h100-bf16', 'h100-fp8'] },
      { arch: 'Blackwell', gpu: 'B200', ids: ['b200-bf16', 'b200-fp8', 'b200-fp4'] },
    ];
    const XD = [1, 3000];
    const st = { ai: 300 };
    let G0 = null;
    const fmtOf = (id) => P[id].unit.split(' ')[0];
    const view = rsvg(f.stage, 'A log axis of arithmetic intensity with the ridge points of six GPU configurations in three rows (Ampere, Hopper, Blackwell) and a vertical line for the chosen kernel intensity.', (svg, w) => {
      const mob = w < 640;
      const lw = mob ? 0 : 130, x0 = lw + 14, x1 = w - 16;
      const X = (v) => x0 + ((lg(clamp(v, XD[0], XD[1])) - lg(XD[0])) / (lg(XD[1]) - lg(XD[0]))) * (x1 - x0);
      G0 = { x0, x1 };
      const laneH = mob ? 82 : 66, top = 22;
      const xa = X(st.ai);
      const lanesY = LANES.map((ln, i) => top + i * laneH);
      LANES.forEach((ln, i) => {
        const y = lanesY[i];
        R(svg, mob ? 0 : lw, y, mob ? w : w - lw, laneH - 8, 'fill:rgba(255,255,255,0.025);stroke:var(--line);stroke-width:1', { rx: 8 });
        if (mob) Tx(svg, 8, y + 14, `${ln.arch} · ${ln.gpu}`, { fs: 10.5, fill: 'var(--ink-2)', weight: 600 });
        else { Tx(svg, 0, y + 26, ln.arch, { fs: 12, fill: 'var(--ink)', weight: 600 }); Tx(svg, 0, y + 41, ln.gpu, { fs: 10.5, fill: 'var(--ink-3)' }); }
      });
      const yb = top + LANES.length * laneH;
      // the kernel's intensity, under the markers
      Ln(svg, xa, top - 6, xa, yb, 'stroke:var(--accent);stroke-width:2');
      const lab = `your kernel: ${fmtAI(st.ai)} ${fpw(st.ai)}/byte`;
      Tx(svg, clamp(xa - tw(lab, 10.5) / 2, 0, w - tw(lab, 10.5)), top - 10, lab, { fs: 10.5, fill: 'var(--accent)', weight: 600 });
      const highs = [];
      LANES.forEach((ln, i) => {
        const y = lanesY[i], cy = y + (mob ? 46 : (laneH - 8) / 2 + 2);
        const maxId = ln.ids.reduce((p0, q) => (P[q].ridge > P[p0].ridge ? q : p0));
        const fs = mob ? 9.5 : 10.5;
        let lastAbove = -1e9, lastBelow = -1e9, lastTop = -1e9;
        ln.ids.slice().sort((p0, q) => P[p0].ridge - P[q].ridge).forEach((id) => {
          const x = X(P[id].ridge), cb = st.ai >= P[id].ridge - 1e-9, hi = id === maxId;
          if (hi) { highs.push([x, cy]); C(svg, x, cy, 11, 'fill:none;stroke:var(--ink);stroke-width:1.5'); }
          C(svg, x, cy, 7, `fill:var(--${cb ? 'core' : 'memory'});stroke:var(--bg);stroke-width:2`);
          const t = `${fmtOf(id)} ${rf.fmt.ridge(P[id].ridge)}`, tw0 = tw(t, fs);
          const lx = clamp(x - tw0 / 2, mob ? 2 : lw + 2, w - tw0 - 2);
          let tier = lx >= lastAbove + 6 ? 'a' : lx >= lastBelow + 6 ? 'b' : 't';
          if (tier === 'a') lastAbove = lx + tw0; else if (tier === 'b') lastBelow = lx + tw0; else lastTop = lx + tw0;
          Tx(svg, lx, tier === 'a' ? cy - 16 : tier === 'b' ? cy + 25 : cy - 29, t, { fs, fill: hi ? 'var(--ink)' : 'var(--ink-2)', weight: hi ? 600 : null, halo: true });
        });
      });
      if (highs.length > 1) Pa(svg, 'M' + highs.map(([x, y]) => `${r2(x)},${r2(y)}`).join('L'), 'fill:none;stroke:var(--ink-3);stroke-width:1.2;stroke-dasharray:4 4');
      Ln(svg, x0, yb, x1, yb, 'stroke:var(--ink-3)');
      [1, 10, 100, 1000].forEach((v) => { Ln(svg, X(v), yb, X(v), yb + 4, 'stroke:var(--ink-3)'); Tx(svg, X(v), yb + 16, fI(v), { fs: 10, anchor: 'middle', fill: 'var(--ink-3)' }); });
      Tx(svg, x1, yb + 31, 'FLOPs per byte →', { fs: 10, anchor: 'end', fill: 'var(--ink-3)' });
      return yb + 36;
    });
    const sC = stat(f, 'compute-bound on', 'core'), sM = stat(f, 'memory-bound on', 'memory');
    const sl = GG.ui.slider(f.controls, { label: 'your kernel\'s intensity', min: XD[0], max: XD[1], log: true, value: st.ai, format: (v) => fmtAI(v) + ' FLOPs/byte', onInput: (v) => { st.ai = v; upd(); } });
    const EX = [
      { id: 'dec', label: 'BF16 decode matvec (1)', ai: 1 },
      { id: 'mm1', label: 'BF16 C = A@B, N = 1,024 (341)', ai: 1024 / 3 },
      { id: 'mm4', label: 'BF16 C = A@B, N = 4,096 (1,365)', ai: 4096 / 3 },
    ];
    const pr = presets(f.controls, 'examples', EX, (it) => { st.ai = it.ai; sl.set(it.ai, false); upd(); });
    function upd() {
      view.redraw();
      pr.mark((it) => Math.abs(lg(it.ai / st.ai)) < 1e-6);
      const ids = LANES.flatMap((l) => l.ids), cbs = ids.filter((id) => st.ai >= P[id].ridge - 1e-9), mbs = ids.filter((id) => !cbs.includes(id));
      sC.set(`${cbs.length} of 6`); sM.set(`${mbs.length} of 6`);
      const nm = (id) => P[id].label;
      let t = `At <b>${fmtAI(st.ai)} ${fpw(st.ai)} per byte</b>, a kernel would be `;
      if (!cbs.length) t += '<b>memory-bound on every system</b> in the table: below even the A100\'s ridge of 156.';
      else if (!mbs.length) t += '<b>compute-bound on every system</b>, even past the B200\'s FP4 ridge of 1,125.';
      else t += `compute-bound on ${cbs.map(nm).join(', ')} and memory-bound on ${mbs.map(nm).join(', ')}.`;
      t += ' Each ridge is computed once per system; the kernel\'s own intensity is what changes from kernel to kernel.';
      f.setWhy(t);
    }
    const pick = (ev) => {
      if (!G0) return;
      const r = view.svg.getBoundingClientRect();
      const x = ((ev.clientX - r.left) / r.width) * view.w;
      const v = 10 ** (lg(XD[0]) + ((x - G0.x0) / (G0.x1 - G0.x0)) * (lg(XD[1]) - lg(XD[0])));
      st.ai = clamp(v, XD[0], XD[1]);
      sl.set(st.ai, false);
      upd();
    };
    view.svg.addEventListener('pointerdown', (ev) => { pick(ev); view.svg.setPointerCapture && view.svg.setPointerCapture(ev.pointerId); });
    view.svg.addEventListener('pointermove', (ev) => { if (ev.buttons) pick(ev); });
    view.svg.style.cursor = 'ew-resize';
    upd();
  }

  /* ═════════════════════════ OVERHEAD ═════════════════════════ */

  const GTC25 = 'https://www.nvidia.com/en-us/on-demand/session/gtc25-s72686/';
  const HOSTOH = 'https://modal.com/blog/host-overhead-inference-efficiency';
  /* shared launch model (μs): n kernels of k μs; each eager launch costs the host fw (framework) + api (CUDA API) */
  const OVS = { n: 16, k: 5, api: 10, fw: 10, subs: [] };
  function ovSet(patch, from) { Object.assign(OVS, patch); OVS.subs.forEach((fn) => { if (fn !== from) guard(fn, 'overhead sync'); }); }
  function ovModel(o) {
    const h = o.api + o.fw, host = [], gpu = [];
    let e = 0;
    for (let i = 0; i < o.n; i++) {
      host.push([i * h, i * h + o.fw, (i + 1) * h]);
      const s0 = Math.max((i + 1) * h, e);
      gpu.push([s0, s0 + o.k]);
      e = s0 + o.k;
    }
    const gG = [];
    for (let i = 0; i < o.n; i++) gG.push([o.api + i * o.k, o.api + (i + 1) * o.k]);
    const Te = e, Tg = o.api + o.n * o.k, work = o.n * o.k;
    return { h, host, gpu, gG, Te, Tg, busyE: work / Te, busyG: work / Tg, work };
  }
  const busyAt = (k, o) => { const h = o.api + o.fw, T = k >= h ? h + o.n * k : o.n * h + k; return (o.n * k) / T; };
  const busyGAt = (k, o) => (o.n * k) / (o.api + o.n * k);
  function niceStep(span, target) {
    const raw = span / (target || 6), p = 10 ** Math.floor(lg(raw)), m = raw / p;
    return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
  }
  const fmtUs = (us) => fmtT(us * 1e-6);

  GG.entry('overhead', {
    render(body, ctx) {
      const s = ctx.html(body, `
<p><strong>Overhead</strong> latency is the time spent with no useful work being done.</p>
<p>Unlike time spent <a data-term="performance-bottleneck">bottlenecked</a> on <a data-term="compute-bound">compute</a> or <a data-term="memory-bound">memory</a>, during which the GPU is working as fast as possible, latency from overhead represents time where the GPU is instead waiting to receive work. Compute-bound and memory-bound time is the GPU running flat out against one of its limits; overhead is the GPU not running at all. On a timeline it shows up as gaps.</p>
<div data-slot="f1"></div>
<h3>Where overhead comes from</h3>
<p>Overhead often comes from CPU-side bottlenecks that prevent the GPU from receiving work fast enough. The CPU, the <em>host</em>, decides on every <a data-term="kernel">kernel</a> and asks the GPU to run it, one launch at a time. For example, CUDA API call overhead adds on the order of 10 μs per kernel launch. Moreover, frameworks like PyTorch or TensorFlow spend time deciding which <a data-term="kernel">kernel</a> to launch (checking the inputs' shapes, data types and devices, then picking an implementation), which can take many microseconds. We generally use the term <a href="${HOSTOH}">"host overhead"</a> here, though it's not entirely standardized.</p>
<p>Fig.&nbsp;1 shows both costs on the host's timeline: lavender for the framework, amber for the CUDA API call. Launches are asynchronous, so the host does not wait for a kernel to finish before preparing the next one. If kernels take longer than launches, the host runs ahead, a queue of launched work builds up, and the GPU never waits. If kernels are shorter than launches, the queue is always empty and the GPU idles between kernels, however fast it is. Fig.&nbsp;2 sweeps the kernel duration to find the crossover.</p>
<div data-slot="f2"></div>
${GG.noteHTML('intuition', '<p>A quick test for overhead-bound work: make the GPU faster and see whether anything changes. In Fig.&nbsp;1, halving the kernel duration of a 5 μs kernel behind a 20 μs launch barely moves the total, because the host, not the GPU, sets the pace. This is why small array operations are overhead-bound (see <a data-term="performance-bottleneck">Performance Bottleneck</a>): their work takes nanoseconds, and the launch takes microseconds.</p>')}
<h3>The fix: launch less often</h3>
<p><a data-term="cuda-graph">CUDA Graphs</a>, which can collect a number of device-side <a data-term="kernel">kernels</a> together into a single host-side launch, are a common solution to these overheads. The graph is recorded once; replaying it costs the host one launch, instead of one launch plus one framework decision per kernel. The lower half of Fig.&nbsp;1 runs the same kernels that way. For more, see the <a href="${GTC25}"><i>CUDA Techniques to Maximize Concurrency and System Utilization</i></a> talk at GTC 2025.</p>
${GG.noteHTML('beyond', '<p>Other common ways to cut host overhead attack the same quantity, launches per unit of useful work. <b>Kernel fusion</b> merges several small kernels into one, so there are fewer launches (and fewer round trips through memory). <b>Bigger batches</b> make each kernel longer for the same number of launches, which moves work right along the horizontal axis of Fig.&nbsp;2. In PyTorch, <code>torch.compile(mode="reduce-overhead")</code> does fusion and uses CUDA Graphs for you.</p>')}
<h3>Memory and communications overhead</h3>
<p>"Memory overhead" or "communications overhead" is overhead latency incurred moving data back and forth from the CPU to the GPU or from one GPU to another. But when communication bandwidth is the limiting factor, it's often better to think of it as a form of <a data-term="memory-bound">memory-boundedness</a> where the "memory" is distributed across machines. The <a data-term="roofline-model">roofline</a> still applies: only the slanted roof changes, its slope set by the link the bytes cross instead of the bandwidth of <a data-term="gpu-ram">GPU RAM</a>.</p>
<div data-slot="f3"></div>
<p>Which description fits depends on the size of each transfer. Every transfer pays a fixed cost to get started, then streams at the link's bandwidth. Small transfers are all fixed cost: overhead. Large ones are all bandwidth: memory-boundedness over a slower "memory".</p>
<div data-slot="f4"></div>
<div data-slot="reading"></div>`);
      guard(() => ovTimeline(ctx, s.f1), 'timeline');
      guard(() => ovSweep(ctx, s.f2), 'sweep');
      guard(() => ovLinks(ctx, s.f3), 'links');
      guard(() => ovTransfer(ctx, s.f4), 'transfer');
      ctx.reading(s.reading, [
        { href: HOSTOH, label: 'Modal: host overhead and inference efficiency', note: 'the term "host overhead"' },
        { href: GTC25, label: 'GTC 2025: <i>CUDA Techniques to Maximize Concurrency and System Utilization</i>', note: 'talk (NVIDIA On-Demand)' },
        { href: 'https://docs.nvidia.com/cuda/cuda-programming-guide/04-special-topics/cuda-graphs.html', label: 'NVIDIA: CUDA Graphs in the CUDA Programming Guide', note: 'Beyond the glossary' },
        { href: DS.h100, label: 'NVIDIA H100 datasheet', note: 'NVLink 900 GB/s and PCIe Gen5 128 GB/s (both directions combined), used in Figs. 3 and 4' },
      ]);
    },
  });

  /* Fig 1: launch timeline, eager vs CUDA Graph */
  function ovTimeline(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Host launches and GPU gaps', hint: 'change the kernel and launch costs', wide: true,
      caption: 'Both halves run the same kernels and share one time axis. <b>Eager</b>: for every kernel the host spends framework time (lavender) and a CUDA API call (amber); the kernel can start once its launch has been issued and the previous kernel has finished. <b>CUDA Graph</b>: the kernels were captured into a graph ahead of time, so the host issues one graph launch, assumed to cost one CUDA API call (the "CUDA API per launch" setting, 10 μs by default) with no per-kernel framework work, and the GPU runs the kernels back to back. Thin amber lines join each eager launch to the kernel it releases. Red hatching is GPU time with no work: overhead. Idealized: real graphs still leave small gaps between kernels. The playhead replays the timeline. Fig.&nbsp;1 of the <a data-term="cuda-graph">CUDA Graphs</a> entry uses the same launch model, with the framework time folded into one per-launch cost.',
    });
    let E = null, phase = 1;
    const view = rsvg(f.stage, 'Four timeline rows: host and GPU for eager launches, host and GPU for a CUDA Graph launch. Kernels are green blocks; idle GPU time is hatched red.', (svg, w) => {
      const m = ovModel(OVS), mob = w < 640;
      const lw = mob ? 0 : 150, x0 = lw, x1 = w - 4, Tm = Math.max(m.Te, m.Tg);
      const X = (t) => x0 + (t / Tm) * (x1 - x0);
      const defs = GG.svg('defs', null, svg);
      const pat = GG.svg('pattern', { id: 'pfa-idle-hatch', width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
      R(pat, 0, 0, 2.2, 6, 'fill:rgba(255,91,110,0.6)');
      const rh = mob ? 18 : 22;
      let y = 0;
      const row = (lab, sub) => {
        if (mob) { Tx(svg, 0, y + 10, lab + (sub ? ' · ' + sub : ''), { fs: 10, fill: 'var(--ink-2)' }); y += 15; }
        else { Tx(svg, 0, y + rh / 2 + (sub ? 0 : 4), lab, { fs: 11, fill: 'var(--ink)', weight: 600 }); if (sub) Tx(svg, 0, y + rh / 2 + 12, sub, { fs: 9.5, fill: 'var(--ink-3)' }); }
        R(svg, x0, y, x1 - x0, rh, 'fill:rgba(255,255,255,0.03)', { rx: 3 });
        const yy = y;
        y += rh + (mob ? 8 : 10);
        return yy;
      };
      const head = (t, val, col) => {
        Tx(svg, mob ? 0 : x0, y + 11, t, { fs: 10.5, fill: 'var(--ink-3)', ls: '0.06em' });
        if (mob) { Tx(svg, 0, y + 27, val, { fs: 11, fill: col, weight: 600 }); y += 36; }
        else { Tx(svg, x1, y + 11, val, { fs: 10.5, anchor: 'end', fill: col, weight: 600 }); y += 20; }
      };
      head('EAGER: ONE LAUNCH PER KERNEL', `${fmtUs(m.Te)} · GPU busy ${pct(m.busyE, 0)}`, 'var(--ink)');
      const yh = row('host (CPU)', 'framework + CUDA API');
      m.host.forEach(([a, b, c]) => {
        R(svg, X(a), yh + 2, Math.max(0.8, X(b) - X(a) - 0.6), rh - 4, 'fill:var(--host);opacity:0.85', { rx: 2 });
        R(svg, X(b), yh + 2, Math.max(0.8, X(c) - X(b) - 0.6), rh - 4, 'fill:var(--control)', { rx: 2 });
      });
      const yg = row('GPU', 'kernels');
      R(svg, X(0), yg, X(m.Te) - X(0), rh, 'fill:url(#pfa-idle-hatch)');
      m.gpu.forEach(([a, b]) => R(svg, X(a), yg, Math.max(1, X(b) - X(a) - (X(b) - X(a) > 3 ? 0.8 : 0)), rh, 'fill:var(--core)', { rx: 2 }));
      // each launch releases its kernel: join the end of the CUDA API call to the start of the kernel
      m.host.forEach(([, , c], i) => Ln(svg, X(c) - 0.5, yh + rh - 2, X(m.gpu[i][0]) + 0.5, yg + 1, 'stroke:var(--control);stroke-width:1;opacity:0.75'));
      y += 6;
      head('CUDA GRAPH: ONE LAUNCH FOR ALL', `${fmtUs(m.Tg)} · GPU busy ${pct(m.busyG, 0)}`, 'var(--core)');
      const yh2 = row('host (CPU)', `one graph launch, ${sg(OVS.api, 3)} μs`);
      R(svg, X(0), yh2 + 2, Math.max(0.8, X(OVS.api) - X(0)), rh - 4, 'fill:var(--control)', { rx: 2 });
      const glab = `+${sg(OVS.api, 3)} μs graph launch`;
      if (X(OVS.api) + 6 + tw(glab, 9.5) < x1) Tx(svg, X(OVS.api) + 6, yh2 + rh / 2 + 3.5, glab, { fs: 9.5, fill: 'var(--control)' });
      const yg2 = row('GPU', 'kernels');
      R(svg, X(0), yg2, X(m.Tg) - X(0), rh, 'fill:url(#pfa-idle-hatch)');
      m.gG.forEach(([a, b]) => R(svg, X(a), yg2, Math.max(1, X(b) - X(a) - (X(b) - X(a) > 3 ? 0.8 : 0)), rh, 'fill:var(--core)', { rx: 2 }));
      // axis
      const ay = y + 2;
      Ln(svg, x0, ay, x1, ay, 'stroke:var(--ink-3)');
      const stp = niceStep(Tm, mob ? 4 : 8);
      for (let t = 0; t <= Tm + 1e-9; t += stp) { Ln(svg, X(t), ay, X(t), ay + 4, 'stroke:var(--ink-3)'); Tx(svg, X(t), ay + 16, sg(t, 4) + (t === 0 ? '' : ' μs'), { fs: 9.5, anchor: t === 0 ? 'start' : 'middle', fill: 'var(--ink-3)' }); }
      // playhead
      const top = 18, bot = ay;
      const veil = R(svg, x0, top, 0, bot - top, 'fill:rgba(11,12,18,0.7)');
      const cur = Ln(svg, x0, top - 2, x0, bot, 'stroke:var(--accent);stroke-width:1.5');
      E = { veil, cur, X, x1, Tm };
      paintHead();
      return ay + 22;
    });
    function paintHead() {
      if (!E) return;
      const t = clamp(phase, 0, 1) * E.Tm, x = E.X(t);
      E.veil.setAttribute('x', r2(x));
      E.veil.setAttribute('width', r2(Math.max(0, E.x1 - x)));
      E.cur.setAttribute('x1', r2(x)); E.cur.setAttribute('x2', r2(x));
      E.cur.style.opacity = phase >= 1 ? '0' : '1';
    }
    let hold = 0;
    const anim = GG.anim(f.stage, (t, dt) => {
      if (phase >= 1) { hold += dt; if (hold > 1.6) { hold = 0; phase = 0; } }
      else phase = Math.min(1, phase + dt / 4.5);
      paintHead();
    });
    const sE = stat(f, 'eager', 'control'), sBe = stat(f, 'GPU busy, eager'), sG = stat(f, 'CUDA Graph', 'core'), sBg = stat(f, 'GPU busy, graph'), sX = stat(f, 'speed-up');
    const ctl = {};
    function sync() {
      Object.keys(ctl).forEach((k) => ctl[k].set(OVS[k], false));
      view.redraw();
      const m = ovModel(OVS), o = OVS;
      sE.set(fmtUs(m.Te)); sBe.set(pct(m.busyE, 0), m.busyE < 0.5 ? 'danger' : null); sG.set(fmtUs(m.Tg)); sBg.set(pct(m.busyG, 0)); sX.set('×' + num(m.Te / m.Tg, 2));
      let t;
      if (o.k < m.h) t = `Each eager launch costs the host <b>${sg(m.h, 3)} μs</b> (${sg(o.fw, 3)} μs of framework, ${sg(o.api, 3)} μs of CUDA API), but each kernel runs only <b>${sg(o.k, 3)} μs</b>. The GPU finishes every kernel and then waits ${sg(m.h - o.k, 3)} μs for the next launch: it is busy only <b>${pct(m.busyE, 0)}</b> of the ${fmtUs(m.Te)}. That is overhead. As one CUDA Graph, launched with a single ${sg(o.api, 3)} μs API call, the same ${o.n} kernels take ${sg(o.api, 3)} + ${o.n} × ${sg(o.k, 3)} = ${fmtUs(m.Tg)}, <b>×${num(m.Te / m.Tg, 2)}</b> faster.`;
      else t = `Each kernel (<b>${sg(o.k, 3)} μs</b>) outlasts a launch (${sg(m.h, 3)} μs), so the host runs ahead and queues work: after the first launch the GPU never waits, and it is busy <b>${pct(m.busyE, 0)}</b> of the time. Overhead is hidden, so a CUDA Graph only saves ${fmtUs(m.Te - m.Tg)} (×${num(m.Te / m.Tg, 2)}).`;
      f.setWhy(t);
    }
    ctl.k = GG.ui.slider(f.controls, { label: 'kernel duration', min: 0.5, max: 500, log: true, value: OVS.k, format: (v) => sg(v, 2) + ' μs', onInput: (v) => { ovSet({ k: rp(v, 2) }, sync); sync(); } });
    ctl.api = GG.ui.slider(f.controls, { label: 'CUDA API per launch', min: 1, max: 30, step: 0.5, value: OVS.api, format: (v) => sg(v, 3) + ' μs', onInput: (v) => { ovSet({ api: v }, sync); sync(); } });
    ctl.fw = GG.ui.slider(f.controls, { label: 'framework per launch', min: 0, max: 60, step: 1, value: OVS.fw, format: (v) => sg(v, 3) + ' μs', onInput: (v) => { ovSet({ fw: v }, sync); sync(); } });
    ctl.n = GG.ui.slider(f.controls, { label: 'kernels', min: 2, max: 48, step: 1, value: OVS.n, format: (v) => String(v), onInput: (v) => { ovSet({ n: Math.round(v) }, sync); sync(); } });
    const prow = GG.el('div', { class: 'pfa-ownrow' });
    f.controls.append(prow);
    GG.ui.playButton(prow, anim);
    OVS.subs.push(sync);
    sync();
  }

  /* Fig 2: GPU busy fraction against kernel duration */
  function ovSweep(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'When does overhead dominate?', hint: 'slide the kernel duration', wide: true,
      caption: 'GPU busy time ÷ total time for the launch model of Fig. 1 (it shares Fig. 1\'s settings), as the kernel duration varies. Eager: the GPU waits whenever a kernel is shorter than the host\'s per-launch cost, the tinted region. CUDA Graph: only the single graph launch is overhead, so the curve rises much earlier.',
    });
    const KD = [0.5, 2000];
    let G0 = null;
    const view = rsvg(f.stage, 'Two curves of GPU busy percentage against kernel duration on a log axis: eager launches and a CUDA Graph launch, with the overhead-bound region tinted.', (svg, w) => {
      const mob = w < 640, o = OVS, h = o.api + o.fw;
      const ml = mob ? 40 : 52, mr = 12, mt = 10, mb = 34, H = mob ? 240 : 290;
      const x0 = ml, x1 = w - mr, y0 = mt, y1 = H - mb;
      const X = (k) => x0 + ((lg(clamp(k, KD[0], KD[1])) - lg(KD[0])) / (lg(KD[1]) - lg(KD[0]))) * (x1 - x0);
      const Y = (b) => y1 - b * (y1 - y0);
      G0 = { x0, x1 };
      R(svg, x0, y0, x1 - x0, y1 - y0, 'fill:rgba(8,9,14,0.35)');
      R(svg, x0, y0, X(h) - x0, y1 - y0, 'fill:var(--control);opacity:0.08');
      [0, 0.25, 0.5, 0.75, 1].forEach((b) => { Ln(svg, x0, Y(b), x1, Y(b), 'stroke:rgba(255,255,255,0.06)'); Tx(svg, x0 - 6, Y(b) + 3.5, pct(b, 0), { fs: 10, anchor: 'end', fill: 'var(--ink-3)' }); });
      [1, 10, 100, 1000].forEach((k) => { Ln(svg, X(k), y0, X(k), y1, 'stroke:rgba(255,255,255,0.06)'); Tx(svg, X(k), y1 + 15, fmtUs(k), { fs: 10, anchor: 'middle', fill: 'var(--ink-3)' }); });
      Pa(svg, `M${x0},${y0}V${y1}H${x1}`, 'fill:none;stroke:var(--ink-3);stroke-width:1.2');
      Tx(svg, x1, H - 4, 'kernel duration →', { fs: 10, anchor: 'end', fill: 'var(--ink-3)' });
      Ln(svg, X(h), y0, X(h), y1, 'stroke:var(--control);stroke-width:1.2;stroke-dasharray:4 3');
      const hl = mob ? `launch cost ${sg(h, 3)} μs` : `kernel = launch cost (${sg(h, 3)} μs)`;
      const hr = X(h) + 6 + tw(hl, 10) < x1;
      Tx(svg, hr ? X(h) + 6 : X(h) - 6, y1 - 10, hl, { fs: 10, anchor: hr ? null : 'end', fill: 'var(--control)', halo: true });
      {
        // put the region label where neither curve passes: sample both curves across the label's width,
        // trying the left of the tinted region, then its right end (against the launch-cost line), then a shorter label
        const kAt = (x) => 10 ** (lg(KD[0]) + ((x - x0) / (x1 - x0)) * (lg(KD[1]) - lg(KD[0])));
        const clear = (xa, xb, yy) => {
          for (let x = xa - 4; x <= xb + 4; x += 2) for (const fn of [busyAt, busyGAt]) { const cy = Y(fn(kAt(x), o)); if (cy > yy - 15 && cy < yy + 6) return false; }
          return true;
        };
        let placed = false;
        for (const t of ['overhead-bound', 'overhead']) {
          const lw0 = tw(t, 10) + 8; // the font runs a little wider than the estimate
          for (const xa of [x0 + 8, X(h) - 8 - lw0]) {
            if (xa < x0 + 4 || xa + lw0 > X(h) - 4) continue;
            for (let yy = y0 + 14; yy <= y1 - 4 && !placed; yy += 2) {
              if (clear(xa, xa + lw0, yy)) { Tx(svg, xa, yy, t, { fs: 10, fill: 'var(--control)', weight: 600, halo: true }); placed = true; }
            }
            if (placed) break;
          }
          if (placed) break;
        }
      }
      const curve = (fn, st) => {
        const pts = [];
        for (let i = 0; i <= 200; i++) { const k = 10 ** (lg(KD[0]) + (i / 200) * (lg(KD[1]) - lg(KD[0]))); pts.push(`${r2(X(k))},${r2(Y(fn(k, o)))}`); }
        Pa(svg, 'M' + pts.join('L'), st);
      };
      curve(busyAt, 'fill:none;stroke:var(--ink);stroke-width:2.5');
      curve(busyGAt, 'fill:none;stroke:var(--core);stroke-width:2.5');
      const xk = X(o.k);
      Ln(svg, xk, y0, xk, y1, 'stroke:var(--accent);stroke-width:1.2;stroke-dasharray:2 3');
      const be = busyAt(o.k, o), bg = busyGAt(o.k, o);
      C(svg, xk, Y(be), 5.5, 'fill:var(--ink);stroke:var(--bg);stroke-width:2');
      C(svg, xk, Y(bg), 5.5, 'fill:var(--core);stroke:var(--bg);stroke-width:2');
      const left = xk + 60 > x1;
      const lab = (b, c, dy) => Tx(svg, left ? xk - 11 : xk + 11, Y(b) + dy, pct(b, 0), { fs: 10.5, anchor: left ? 'end' : null, fill: c, weight: 600, halo: true });
      const close = Math.abs(Y(be) - Y(bg)) < 16;
      lab(bg, 'var(--core)', close ? -8 : 4);
      lab(be, 'var(--ink)', close ? 15 : 4);
      return H;
    });
    legend(f.stage, [['var(--ink)', 'eager: one launch per kernel', 'ln'], ['var(--core)', 'one CUDA Graph launch', 'ln'], ['var(--control)', 'kernels shorter than a launch']]);
    const sl = GG.ui.slider(f.controls, { label: 'kernel duration', min: 0.5, max: 500, log: true, value: OVS.k, format: (v) => sg(v, 2) + ' μs', onInput: (v) => { ovSet({ k: rp(v, 2) }, sync); sync(); } });
    const sK = stat(f, 'launch cost (host)', 'control'), sE = stat(f, 'busy, eager'), sG = stat(f, 'busy, graph', 'core');
    function sync() {
      sl.set(OVS.k, false);
      view.redraw();
      const o = OVS, h = o.api + o.fw, be = busyAt(o.k, o), bg = busyGAt(o.k, o);
      sK.set(sg(h, 3) + ' μs'); sE.set(pct(be, 0)); sG.set(pct(bg, 0));
      f.setWhy(o.k < h ? `A ${sg(o.k, 2)} μs kernel is shorter than the ${sg(h, 3)} μs it takes the host to launch one, so eager execution is <b>overhead-bound</b>: the GPU is busy ${pct(be, 0)} of the time. One graph launch for all ${o.n} kernels raises that to <b>${pct(bg, 0)}</b>.` : `A ${sg(o.k, 2)} μs kernel outlasts the ${sg(h, 3)} μs launch, so launches overlap with work and the GPU stays busy (${pct(be, 0)} eager, ${pct(bg, 0)} with a graph). Launch overhead is no longer the bottleneck; compute or memory is.`);
    }
    const pick = (ev) => {
      if (!G0) return;
      const r = view.svg.getBoundingClientRect(), x = ((ev.clientX - r.left) / r.width) * view.w;
      const k = 10 ** (lg(KD[0]) + ((x - G0.x0) / (G0.x1 - G0.x0)) * (lg(KD[1]) - lg(KD[0])));
      ovSet({ k: rp(clamp(k, 0.5, 500), 2) }, sync); sync();
    };
    view.svg.addEventListener('pointerdown', (ev) => { pick(ev); view.svg.setPointerCapture && view.svg.setPointerCapture(ev.pointerId); });
    view.svg.addEventListener('pointermove', (ev) => { if (ev.buttons) pick(ev); });
    view.svg.style.cursor = 'ew-resize';
    OVS.subs.push(sync);
    sync();
  }

  /* Links, one direction: GPU RAM, NVLink, PCIe, network (H100 datasheet; 400 Gb/s NIC) */
  const LINKS = [
    { id: 'ov-hbm', label: 'GPU RAM', tflops: 989, tbps: 3.35, phrase: 'an H100 reading its own GPU RAM', what: 'its own GPU RAM (HBM3)' },
    { id: 'ov-nvl', label: 'NVLink', tflops: 989, tbps: 0.45, phrase: 'an H100 reading another GPU over NVLink', what: 'another GPU in the same machine, over NVLink (900 GB/s both ways, 450 GB/s each way)' },
    { id: 'ov-pcie', label: 'PCIe Gen5', tflops: 989, tbps: 0.064, phrase: 'an H100 reading CPU memory over PCIe', what: 'the CPU\'s memory, over PCIe Gen5 x16 (128 GB/s both ways, 64 GB/s each way)' },
    { id: 'ov-net', label: 'network', tflops: 989, tbps: 0.05, phrase: 'an H100 reading another machine over a 400 Gb/s link', what: 'another machine, over a 400 Gb/s (50 GB/s) network link' },
  ];

  /* Fig 3: distributed "memory" on a roofline */
  /* the faint roofs share the 989 TFLOPS roof, so the component labels each along its own slanted roof;
     a dash pattern per link tells the near-parallel PCIe and network roofs apart */
  const LDASH = { 'ov-hbm': null, 'ov-nvl': '8 3', 'ov-pcie': '4 3', 'ov-net': '1.5 3' };
  /* the other links' roofs are drawn unlabelled (a blank label draws none): on the chart only the chosen link's roof is named,
     and the key under it names all four, with their line styles */
  const cmpOf = (id) => LINKS.filter((l) => l.id !== id).map((l) => Object.assign({}, l, { label: '\u200b', dash: LDASH[l.id] }));
  function ovLinks(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'The "memory" can be far away', hint: 'switch the link · drag the kernel', wide: true,
      caption: 'One H100\'s BF16 Tensor Core roof (989 TFLOPS) over four slanted roofs, one per place the bytes can come from, using one-way bandwidths: 3.35 TB/s from its own GPU RAM; 450 GB/s over NVLink and 64 GB/s over PCIe Gen5 (half of the H100 datasheet\'s 900 and 128 GB/s, which count both directions); 50 GB/s over a 400 Gb/s network link. The intensity counts FLOPs per byte that crosses the chosen link. Link numbers are Beyond the glossary.',
    });
    const rf = RFC();
    if (!rf) return;
    const api = rf(f, {
      system: LINKS[1], systems: LINKS, showControls: false, showReadouts: true, compare: cmpOf('ov-nvl'),
      kernels: [{ id: 'k', label: 'Your kernel', ai: 300, color: 'accent' }], xDomain: [0.1, 1e5], yDomain: [1e10, 4e15],
      why: (x) => {
        const L = LINKS.find((l) => l.id === x.system.id) || LINKS[0];
        if (!x.kernel) return null;
        if (x.bound === 'memory' && !x.atRidge) return `Fetching from ${L.what}: at ${fmtAI(x.ai)} ${fpw(x.ai)} per byte the kernel can reach ${rf.fmt.perf(x.attainable)}, ${pct(x.attainable / x.system.flops, 1)} of the Tensor Cores' peak. It is <b>memory-bound</b>, with the "memory" on the other side of the link. Escaping needs <b>${rf.fmt.ai(x.ridge)}</b> FLOPs per byte crossing it.`;
        return `Fetching from ${L.what}: at ${fmtAI(x.ai)} ${fpw(x.ai)} per byte, the link keeps up and the kernel can reach the full 989 TFLOPS: <b>compute-bound</b>. The ridge for this link is ${rf.fmt.ai(x.ridge)} FLOPs per byte.`;
      },
    });
    const key = GG.el('div', { class: 'pfa-num-row pfa-ovkey' });
    f.stage.append(key);
    const paintKey = (id) => {
      key.innerHTML = '<span>slanted roofs, one way, left to right (each meets the compute roof at its ridge):</span>' + LINKS.map((l) => { const on = l.id === id, t = `${l.label} ${rf.fmt.bw(l.tbps * 1e12)} · ridge ${rf.fmt.ai((l.tflops / l.tbps))}`; const d = LDASH[l.id] && LDASH[l.id].split(' ').map(Number), sw = d ? ` style="border-top:0;height:1.5px;background:repeating-linear-gradient(90deg,var(--ink-3) 0 ${d[0]}px,transparent ${d[0]}px ${d[0] + d[1]}px)"` : ''; return on ? `<b class="c-memory"><i class="on"></i>${t}</b>` : `<span><i${sw}></i>${t}</span>`; }).join('');
    };
    let lastId = 'ov-nvl';
    /* our own selector: it passes the link objects themselves, and is labelled for what it picks */
    const linkSeg = GG.ui.seg(f.controls, { label: 'where the bytes come from', value: lastId, options: LINKS.map((l) => ({ value: l.id, label: l.label, title: l.what })), onChange: (v) => { const L = LINKS.find((l) => l.id === v); if (L) api.setSystem(L); } });
    if (linkSeg.el.parentNode === f.controls) f.controls.insertBefore(linkSeg.el, f.controls.firstChild);
    api.on('change', (x) => { if (x.system.id !== lastId) { lastId = x.system.id; linkSeg.set(lastId, false); api.setCompare(cmpOf(lastId)); paintKey(lastId); } });
    paintKey(lastId);
  }

  /* Fig 4: fixed cost vs bandwidth for one transfer */
  function ovTransfer(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Small transfers pay overhead, large ones pay bandwidth', hint: 'slide the transfer size', wide: true,
      caption: 'Time for one transfer = fixed cost + bytes ÷ link bandwidth (one-way bandwidths as in Fig. 3). The fixed cost stands for everything paid once per transfer, from the API call to setting up the copy; its value here is illustrative. The curve shows the effective bandwidth, bytes ÷ total time, as a share of the link\'s bandwidth.',
    });
    const st = { link: 'ov-pcie', b: 1e6, fix: 10 };
    let G0 = null;
    const BD = [1e3, 1e10];
    const L = () => LINKS.find((l) => l.id === st.link);
    const view = rsvg(f.stage, 'A split bar for one transfer: fixed cost in amber and streaming time in blue, above a curve of effective bandwidth against transfer size.', (svg, w) => {
      const mob = w < 640, bw = L().tbps * 1e12, tf = st.fix * 1e-6, tb = st.b / bw, T = tf + tb;
      // split bar
      Tx(svg, 0, 11, `one ${fmtB(st.b)} transfer over ${L().label}: ${fmtT(T)}`, { fs: 11, fill: 'var(--ink)', weight: 600 });
      const wf = (w * tf) / T;
      R(svg, 0, 18, w, 20, 'fill:rgba(255,255,255,0.04)', { rx: 4 });
      R(svg, 0, 18, Math.max(1.5, wf), 20, 'fill:var(--control)', { rx: 4 });
      R(svg, wf, 18, Math.max(1.5, w - wf), 20, 'fill:var(--memory)', { rx: 4 });
      const t1 = `fixed ${fmtT(tf)}`, t2 = `streaming ${fmtT(tb)}`;
      if (wf > tw(t1, 10) + 10) Tx(svg, 6, 32, t1, { fs: 10, fill: '#0b0c12', weight: 600 });
      if (w - wf > tw(t2, 10) + 10) Tx(svg, w - 6, 32, t2, { fs: 10, anchor: 'end', fill: '#0b0c12', weight: 600 });
      // effective bandwidth curve
      const ml = mob ? 40 : 52, mr = 12, top = 64, H = top + (mob ? 170 : 200), mb = 34;
      const x0 = ml, x1 = w - mr, y0 = top, y1 = H - mb;
      const X = (b) => x0 + ((lg(b) - lg(BD[0])) / (lg(BD[1]) - lg(BD[0]))) * (x1 - x0), Y = (u) => y1 - u * (y1 - y0);
      G0 = { x0, x1 };
      R(svg, x0, y0, x1 - x0, y1 - y0, 'fill:rgba(8,9,14,0.35)');
      [0, 0.5, 1].forEach((u) => { Ln(svg, x0, Y(u), x1, Y(u), 'stroke:rgba(255,255,255,0.06)'); Tx(svg, x0 - 6, Y(u) + 3.5, pct(u, 0), { fs: 10, anchor: 'end', fill: 'var(--ink-3)' }); });
      [1e3, 1e5, 1e7, 1e9].forEach((b) => { Ln(svg, X(b), y0, X(b), y1, 'stroke:rgba(255,255,255,0.06)'); Tx(svg, X(b), y1 + 15, fmtB(b), { fs: 10, anchor: 'middle', fill: 'var(--ink-3)' }); });
      Pa(svg, `M${x0},${y0}V${y1}H${x1}`, 'fill:none;stroke:var(--ink-3);stroke-width:1.2');
      Tx(svg, x0 + 6, y0 + 13, 'effective ÷ link bandwidth', { fs: 10, fill: 'var(--ink-2)' });
      Tx(svg, x1, H - 4, 'transfer size →', { fs: 10, anchor: 'end', fill: 'var(--ink-3)' });
      const half = bw * tf; // size where fixed cost = streaming time
      if (half > BD[0] && half < BD[1]) {
        Ln(svg, X(half), y0, X(half), y1, 'stroke:var(--ink-3);stroke-dasharray:3 3');
        const hl = `half: ${fmtB(half)}`;
        Tx(svg, X(half) + 5 + tw(hl, 10) < x1 ? X(half) + 5 : X(half) - 5, y0 + 28, hl, { fs: 10, anchor: X(half) + 5 + tw(hl, 10) < x1 ? null : 'end', fill: 'var(--ink-2)', halo: true });
      }
      const pts = [];
      for (let i = 0; i <= 160; i++) { const b = 10 ** (lg(BD[0]) + (i / 160) * (lg(BD[1]) - lg(BD[0]))); pts.push(`${r2(X(b))},${r2(Y(b / bw / (tf + b / bw)))}`); }
      Pa(svg, 'M' + pts.join('L'), 'fill:none;stroke:var(--memory);stroke-width:2.5');
      const u = tb / T;
      C(svg, X(st.b), Y(u), 5.5, 'fill:var(--accent);stroke:var(--bg);stroke-width:2');
      return H;
    });
    const sT = stat(f, 'time'), sU = stat(f, 'effective bandwidth', 'memory'), sV = stat(f, 'dominated by');
    function upd() {
      view.redraw();
      const bw = L().tbps * 1e12, tf = st.fix * 1e-6, tb = st.b / bw, T = tf + tb;
      const share = (x) => (x < 0.01 ? sg(x * 100, 2) + '%' : pct(x, 0));
      sT.set(fmtT(T)); sU.set(`${fmtBW(st.b / T)} (${share(tb / T)})`);
      const ov = tf > tb;
      sV.set(ov ? 'overhead' : 'bandwidth', ov ? 'control' : 'memory');
      f.setWhy(ov ? `A ${fmtB(st.b)} transfer streams over ${L().label} in ${fmtT(tb)}, less than its ${fmtT(tf)} fixed cost: most of the time is <b>overhead</b>, and the link runs at ${share(tb / T)} of its bandwidth. Batch small transfers into fewer, larger ones.` : `A ${fmtB(st.b)} transfer spends ${fmtT(tb)} streaming and only ${fmtT(tf)} on its fixed cost: it is limited by the link's bandwidth, ${fmtBW(bw)}. Think of it as <b>memory-bound</b>, with the "memory" on the far side of the link.`);
    }
    GG.ui.seg(f.controls, { label: 'link', value: st.link, options: LINKS.map((l) => ({ value: l.id, label: l.label })), onChange: (v) => { st.link = v; upd(); } });
    const sl = GG.ui.slider(f.controls, { label: 'transfer size', min: BD[0], max: BD[1], log: true, value: st.b, format: (v) => fmtB(v), onInput: (v) => { st.b = v; upd(); } });
    GG.ui.slider(f.controls, { label: 'fixed cost per transfer (illustrative)', min: 1, max: 50, step: 1, value: st.fix, format: (v) => v + ' μs', onInput: (v) => { st.fix = v; upd(); } });
    const pick = (ev) => {
      if (!G0) return;
      const r = view.svg.getBoundingClientRect(), x = ((ev.clientX - r.left) / r.width) * view.w;
      if (((ev.clientY - r.top) / r.height) * view.svg.viewBox.baseVal.height < 56) return;
      st.b = clamp(10 ** (lg(BD[0]) + ((x - G0.x0) / (G0.x1 - G0.x0)) * (lg(BD[1]) - lg(BD[0]))), BD[0], BD[1]);
      sl.set(st.b, false); upd();
    };
    view.svg.addEventListener('pointerdown', (ev) => { pick(ev); });
    view.svg.addEventListener('pointermove', (ev) => { if (ev.buttons) pick(ev); });
    upd();
  }
})();
