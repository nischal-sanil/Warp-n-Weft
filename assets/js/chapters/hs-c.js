/* chapters/hs-c — Host Software, part C: the kernel libraries and kernel-building tools.
   Entries: cublas, cudnn, cutlass, cute, cute-dsl, cutile-basic.
   CSS prefix: hsc-. Every figure draws pixel-true SVG (viewBox width = stage width) and
   re-lays itself out when the stage width changes, so text stays legible on phones. */
(function () {
  'use strict';
  if (!window.GG) return;

  /* ───────────────────────── shared helpers ───────────────────────── */
  const r1 = (v) => Math.round(v * 10) / 10;
  /* text width in px for SVG labels: measured with the page's mono face (3% safety margin);
     falls back to an estimate if canvas text metrics are unavailable */
  const mctx = (() => { try { return document.createElement('canvas').getContext('2d'); } catch (e) { return null; } })();
  const tw = (s, fs) => {
    if (mctx) { mctx.font = `500 ${fs}px "JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace`; return mctx.measureText(String(s)).width * 1.03; }
    return String(s).length * fs * 0.68;
  };
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const guard = (fn) => { try { fn(); } catch (e) { console.error('[hs-c] ' + ((e && e.stack) || e)); } };
  const esc = (s) => GG.esc(s);

  function clear(el) { while (el && el.firstChild) el.removeChild(el.firstChild); }
  function svgRoot(parent, label, cls) {
    return GG.svg('svg', { class: 'hsc-svg' + (cls ? ' ' + cls : ''), role: 'img', 'aria-label': label }, parent);
  }
  function sizeSvg(s, w, h) {
    s.setAttribute('viewBox', `0 0 ${Math.round(w)} ${Math.round(h)}`);
    s.setAttribute('width', Math.round(w));
    s.setAttribute('height', Math.round(h));
  }
  function G(parent, o) { return GG.svg('g', o || {}, parent); }
  function T(parent, x, y, s, o) {
    o = o || {};
    const a = { x: r1(x), y: r1(y) };
    if (o.anchor) a['text-anchor'] = o.anchor;
    if (o.base !== false) a['dominant-baseline'] = o.base || 'central';
    // inline style, so the size wins over the stylesheet's default for .hsc-svg text
    let st = 'font-size:' + (o.fs || 11) + 'px;';
    if (o.fill) st += 'fill:' + o.fill + ';';
    if (o.weight) st += 'font-weight:' + o.weight + ';';
    if (o.font) st += 'font-family:' + o.font + ';';
    if (o.ls) st += 'letter-spacing:' + o.ls + ';';
    if (st) a.style = st;
    if (o.cls) a.class = o.cls;
    const t = GG.svg('text', a, parent);
    t.textContent = s;
    return t;
  }
  function R(parent, x, y, w, h, o) {
    o = o || {};
    const a = { x: r1(x), y: r1(y), width: Math.max(0, r1(w)), height: Math.max(0, r1(h)) };
    if (o.rx != null) a.rx = o.rx;
    let st = 'fill:' + (o.fill || 'none') + ';';
    if (o.op != null) st += 'fill-opacity:' + o.op + ';';
    if (o.stroke) st += 'stroke:' + o.stroke + ';stroke-width:' + (o.sw || 1) + ';';
    if (o.dash) st += 'stroke-dasharray:' + o.dash + ';';
    a.style = st;
    if (o.cls) a.class = o.cls;
    return GG.svg('rect', a, parent);
  }
  function Ln(parent, x1, y1, x2, y2, o) {
    o = o || {};
    let st = 'stroke:' + (o.stroke || 'var(--line-2)') + ';stroke-width:' + (o.sw || 1) + ';';
    if (o.dash) st += 'stroke-dasharray:' + o.dash + ';';
    if (o.cap) st += 'stroke-linecap:' + o.cap + ';';
    return GG.svg('line', { x1: r1(x1), y1: r1(y1), x2: r1(x2), y2: r1(y2), style: st }, parent);
  }
  function Pth(parent, d, o) {
    o = o || {};
    let st = 'fill:' + (o.fill || 'none') + ';stroke:' + (o.stroke || 'none') + ';stroke-width:' + (o.sw || 1) + ';';
    if (o.dash) st += 'stroke-dasharray:' + o.dash + ';';
    if (o.op != null) st += 'opacity:' + o.op + ';';
    st += 'stroke-linejoin:round;stroke-linecap:round;';
    const a = { d, style: st };
    if (o.cls) a.class = o.cls;
    return GG.svg('path', a, parent);
  }
  /* straight arrow with a filled head */
  function Arrow(parent, x1, y1, x2, y2, o) {
    o = o || {};
    const c = o.stroke || 'var(--ink-3)';
    const g = G(parent, o.cls ? { class: o.cls } : null);
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const hl = o.head || 7;
    const bx = x2 - Math.cos(ang) * hl, by = y2 - Math.sin(ang) * hl;
    Ln(g, x1, y1, bx, by, { stroke: c, sw: o.sw || 1.5, dash: o.dash });
    const px = Math.cos(ang + Math.PI / 2) * hl * 0.55, py = Math.sin(ang + Math.PI / 2) * hl * 0.55;
    Pth(g, `M${r1(x2)},${r1(y2)} L${r1(bx + px)},${r1(by + py)} L${r1(bx - px)},${r1(by - py)} Z`, { fill: c });
    return g;
  }
  /* rebuild a figure whenever its stage width changes; build(w) gets the content width in px */
  function responsive(el, build) {
    let w0 = 0, raf = 0;
    const api = { get w() { return w0; }, rebuild() { if (w0) guard(() => build(w0)); } };
    GG.resize(el, (r) => {
      const w = Math.floor(r.width);
      if (w < 60 || Math.abs(w - w0) < 2) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => { w0 = w; guard(() => build(w)); });
    });
    // label widths are measured with the web font: lay out again once it has loaded
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => api.rebuild());
    return api;
  }
  function lineOf(code, needle, after) {
    const lines = code.split('\n');
    for (let i = (after || 0); i < lines.length; i++) if (lines[i].includes(needle)) return i + 1;
    return -1;
  }
  function range(a, b) { const out = []; for (let i = a; i <= b; i++) out.push(i); return out; }
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  /* create a figure / code block and put it where its slot was, as a direct child of .entry-body
     (so the .wide breakout applies) */
  function fig(ctx, slot, opts) { const f = ctx.figure(slot, opts); if (slot && slot.parentNode) slot.replaceWith(f.root); return f; }
  function codeAt(ctx, slot, opts) { const c = ctx.code(slot, opts); if (slot && slot.parentNode) slot.replaceWith(c.el); return c; }
  /* pick the first candidate string that fits in maxW at font size fs */
  const fit = (cands, fs, maxW) => { for (const c of cands) if (tw(c, fs) <= maxW) return c; return cands[cands.length - 1]; };
  const TR = 'ᵀ';
  /* The core styles figure titles, control labels and stat labels in capitals. Names and code
     identifiers must keep their case, so labels mark them as {name}; keepCase(root) turns each
     {…} into a span that is exempt from the capitals, and strips the braces from aria-labels. */
  function keepCase(root) {
    const re = /\{([^{}]+)\}/g;
    root.querySelectorAll('.fig-title, .ctl-lab, .ctl-lab > span, .stat i').forEach((el) => {
      [...el.childNodes].forEach((n) => {
        if (n.nodeType !== 3 || n.nodeValue.indexOf('{') < 0) return;
        const s = n.nodeValue, frag = document.createDocumentFragment();
        let last = 0, m;
        re.lastIndex = 0;
        while ((m = re.exec(s))) {
          if (m.index > last) frag.append(s.slice(last, m.index));
          frag.append(GG.el('span', { class: 'hsc-kc', text: m[1] }));
          last = m.index + m[0].length;
        }
        if (last < s.length) frag.append(s.slice(last));
        // one wrapper keeps the pieces a single item when the label is a flex container (.ctl-lab)
        const box = GG.el('span');
        box.append(frag);
        n.replaceWith(box);
      });
    });
    root.querySelectorAll('[aria-label*="{"]').forEach((el) => el.setAttribute('aria-label', el.getAttribute('aria-label').replace(/[{}]/g, '')));
  }
  /* one Tab stop for an SVG whose parts are hoverable: arrow keys step a cursor through them */
  function keyNav(svg, label, onKey) {
    svg.setAttribute('tabindex', '0');
    svg.setAttribute('data-keys', '');
    svg.setAttribute('aria-label', svg.getAttribute('aria-label') + ' ' + label);
    svg.addEventListener('keydown', (e) => { if (onKey(e.key) !== false) { if (/^(Arrow|Home|End|Escape)/.test(e.key)) e.preventDefault(); } });
  }

  GG.css(`
  .hsc-svg{display:block;width:100%;height:auto;overflow:visible;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}
  .hsc-svg text{font-family:var(--font-mono);font-size:11px;fill:var(--ink-2)}
  .hsc-mv{transition:transform .7s cubic-bezier(.3,.7,.2,1)}
  .hsc-fade{transition:opacity .35s ease}
  .hsc-hit{cursor:pointer}
  .hsc-drag{cursor:crosshair}
  @media (prefers-reduced-motion: reduce){.hsc-mv,.hsc-fade{transition:none}}
  .hsc-call{font:500 12.5px/1.8 var(--font-mono);color:var(--ink-2);background:rgba(8,9,14,.62);border:1px solid var(--line);border-radius:10px;padding:8px 12px;margin:0 0 12px}
  .hsc-compact .fig-controls .slider{flex:1 1 150px;min-width:130px}
  .hsc-kc{text-transform:none}
  .hsc-svg:focus{outline:none}
  .hsc-svg:focus-visible{outline:2px solid var(--accent);outline-offset:4px;border-radius:6px}
  .hsc-svg text.hsc-halo{paint-order:stroke;stroke:#0b0c12;stroke-width:3px;stroke-linejoin:round}
  .hsc-wrapwhy .fig-why code{white-space:normal;overflow-wrap:anywhere}
  .hsc-dl{display:grid;grid-template-columns:auto 1fr;gap:6px 16px;margin:14px 0 18px;font-size:15px;line-height:1.5}
  .hsc-dl dt{color:var(--ink);font-weight:600;white-space:nowrap}
  .hsc-dl dd{margin:0;color:var(--ink-body,var(--ink-2))}
  @media (max-width:560px){.hsc-dl{grid-template-columns:minmax(0,1fr);gap:2px}.hsc-dl dd{margin-bottom:8px}}
  .hsc-call .a{display:inline-block;padding:0 3px;margin:0 -3px;border-radius:5px;color:var(--ink);transition:background .2s,color .2s}
  .hsc-call .a.on{background:var(--accent-a);color:var(--accent-2);box-shadow:inset 0 0 0 1px rgba(255,138,91,.55)}
  .hsc-call .a.bad{background:var(--danger-a);color:var(--danger);box-shadow:inset 0 0 0 1px rgba(255,91,110,.5)}
  .hsc-call .f{color:#ffd88a}
  .hsc-call .c{color:#6c7290;font-style:italic}
  .hsc-formula{font:500 13px/1.65 var(--font-mono);color:var(--ink-2);padding:8px 12px;border-radius:10px;border:1px dashed var(--line-2);margin-top:10px;overflow-wrap:anywhere}
  @media (max-width:720px){.hsc-formula{font-size:12px}}
  .hsc-formula b{color:var(--ink);font-weight:600}
  .hsc-formula .k{color:var(--accent-2)}
  .hsc-formula .g{color:var(--core)}
  .hsc-formula .m{color:var(--memory)}
  .hsc-formula .d{color:var(--danger)}
  .hsc-kv{display:grid;grid-template-columns:auto 1fr;gap:4px 14px;font-size:14.5px}
  .hsc-kv dt{font-family:var(--font-mono);font-size:12.5px;color:var(--ink);white-space:nowrap}
  .hsc-kv dd{margin:0;color:var(--ink-2)}
  .hsc-txtin{height:32px;min-width:0;width:100%;max-width:340px;border-radius:9px;border:1px solid var(--line-2);background:var(--bg-2);color:var(--ink);font:500 13px var(--font-mono);padding:0 10px}
  .hsc-txtin:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-a)}
  .hsc-txtin.bad{border-color:var(--danger)}
  .hsc-exc{margin-bottom:12px}
  .hsc-exc pre{padding:8px 0;font-size:12.5px}
  .hsc-in-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
  .hsc-in-err{font:500 12px var(--font-mono);color:var(--danger);min-height:1em}
  .hsc-shelf{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;min-height:34px}
  .hsc-chip{font:500 11.5px/1.3 var(--font-mono);padding:6px 9px;border-radius:8px;border:1px solid rgba(69,212,155,.45);background:var(--core-a);color:var(--ink);white-space:nowrap}
  .hsc-chip.new{animation:hsc-pop .5s ease}
  .hsc-chip.dup{animation:hsc-dup .6s ease}
  @keyframes hsc-pop{from{transform:scale(.6);opacity:0}to{transform:none;opacity:1}}
  @keyframes hsc-dup{0%,100%{box-shadow:none}40%{box-shadow:0 0 0 3px var(--accent)}}
  .hsc-tpl{font:500 12.5px/1.75 var(--font-mono);color:#d4d7e6;background:#090a10;border:1px solid var(--line);border-radius:12px;padding:10px 14px;overflow-x:auto;white-space:pre;scrollbar-width:thin}
  @media (max-width:720px){.hsc-tpl{font-size:11.5px;padding:10px 12px}}
  .hsc-tpl .p{color:var(--accent-2);background:var(--accent-a);border-radius:4px;padding:0 3px}
  .hsc-tpl .k{color:#c9aefc}
  .hsc-tpl .c{color:#6c7290;font-style:italic}
  .hsc-tpl .t{color:#86d3ff}
  .hsc-cols{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:14px;align-items:start}
  @media (max-width:720px){.hsc-cols{grid-template-columns:minmax(0,1fr)}}
  .hsc-lab{font:500 10.5px var(--font-mono);letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);margin-bottom:6px}
  .hsc-crt{position:relative;border-radius:14px;border:1px solid #1f3a2e;background:radial-gradient(120% 90% at 50% 40%,#0c1a14,#060b09 70%);padding:14px 16px 16px;overflow:hidden;box-shadow:inset 0 0 40px rgba(69,212,155,.08)}
  .hsc-crt::after{content:"";position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,.22) 0 1px,transparent 1px 3px)}
  .hsc-crt pre{margin:0;font:500 14px/1.65 var(--font-mono);color:#7ff0bd;text-shadow:0 0 6px rgba(69,212,155,.45);white-space:pre-wrap;word-break:break-word;min-height:12.5em}
  .hsc-crt pre .dim{color:#3f8d69;text-shadow:none}
  .hsc-crt pre .hl{background:rgba(69,212,155,.18);box-shadow:0 0 0 2px rgba(69,212,155,.18)}
  .hsc-crt .cur{display:inline-block;width:.6em;height:1.05em;vertical-align:-.15em;background:#7ff0bd;box-shadow:0 0 8px rgba(69,212,155,.6);animation:hsc-blink 1s steps(1) infinite}
  @keyframes hsc-blink{50%{opacity:0}}
  .hsc-timeline{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;background:var(--line);border:1px solid var(--line);border-radius:12px;overflow:hidden}
  .hsc-timeline>div{background:var(--surface);padding:12px 14px}
  .hsc-timeline b{display:block;font-family:var(--font-display);font-weight:800;font-size:26px;line-height:1;color:var(--ink)}
  .hsc-timeline span{display:block;margin-top:6px;font-size:13px;line-height:1.45;color:var(--ink-2)}
  .hsc-timeline i{display:block;font:500 10.5px var(--font-mono);font-style:normal;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);margin-bottom:6px}
  @media (max-width:860px){.hsc-timeline{grid-template-columns:repeat(2,minmax(0,1fr))}}
  @media (max-width:440px){.hsc-timeline{grid-template-columns:minmax(0,1fr)}}
  `);

  /* A matrix as SVG cells. vals: 2D array (or null for '?'), returns {g, cells:[[{r,t}]]} */
  function matrixSvg(parent, x, y, rows, cols, cs, o) {
    o = o || {};
    const g = G(parent);
    const cells = [];
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        const r = R(g, x + j * cs, y + i * cs, cs - 2, cs - 2, { rx: 4, fill: o.fill || 'var(--memory)', op: o.op != null ? o.op : 0.13, stroke: o.stroke || 'rgba(111,166,255,.45)' });
        const v = o.vals ? o.vals(i, j) : '';
        const t = T(g, x + j * cs + (cs - 2) / 2, y + i * cs + (cs - 2) / 2 + 0.5, v, { anchor: 'middle', fs: o.fs || Math.min(13, cs * 0.42), fill: o.ink || 'var(--ink)' });
        row.push({ r, t });
      }
      cells.push(row);
    }
    return { g, cells };
  }

  /* ═════════════════════════════════════════════════════════════
     cuBLAS
     ═════════════════════════════════════════════════════════════ */
  const SGEMM_CODE = `#include <cublas_v2.h>

// performs single-precision C = alpha * A @ B + beta * C
// on row-major matrices using cublasSgemm
void sgemm_row_major(cublasHandle_t handle, int M, int N, int K,
                     const float *alpha,
                     const float *A, const float *B,
                     const float *beta,
                     float *C) {

  // A is M x K (row-major), cuBLAS sees it as A^T (K x M, column-major),
  //   the leading dimension of A^T is K
  // B is K x N (row-major), cuBLAS sees it as B^T (N x K, column-major),
  //   the leading dimension of B^T is N
  // C is M x N (row-major), cuBLAS sees it as C^T (N x M, column-major),
  //   the leading dimension of C^T is N

  // note the swapped A and B, and the swapped M and N
  cublasSgemm(handle, CUBLAS_OP_N, CUBLAS_OP_N,
              N, M, K,
              alpha,
              B, N,  // leading dimension of B^T
              A, K,  // leading dimension of A^T
              beta,
              C, N); // leading dimension of C^T
}`;

  /* Fig: one call, a shelf of kernels (schematic of cuBLAS's run-time kernel selection) */
  function figShelf(ctx, slot) {
    const f = fig(ctx, slot, {
      title: 'One call, a shelf of kernels', hint: 'change the problem', wide: true,
      caption: 'Schematic, not cuBLAS’s real catalogue. The library holds many kernels, each tuned for a data type, a range of matrix sizes and an SM architecture. Which one runs, and with what launch configuration, is decided at run time by internal heuristics that NVIDIA does not publish (the “?”).',
    });
    const DT = [{ v: 0, label: 'FP32', fn: 'cublasSgemm' }, { v: 1, label: 'FP16', fn: 'cublasHgemm' }];
    const SZ = [{ v: 0, label: 'small', s: 'S', n: 256 }, { v: 1, label: 'medium', s: 'M', n: 2048 }, { v: 2, label: 'large', s: 'L', n: 8192 }];
    const AR = [{ v: 0, label: 'Ampere' }, { v: 1, label: 'Hopper' }, { v: 2, label: 'Blackwell' }];
    const st = { dt: 1, sz: 2, ar: 1 };
    GG.ui.seg(f.controls, { label: 'Data type', options: DT.map((d) => ({ value: d.v, label: d.label })), value: st.dt, onChange: (v) => { st.dt = v; lay.rebuild(); } });
    GG.ui.seg(f.controls, { label: 'Matrix size (M = N = K)', options: SZ.map((d) => ({ value: d.v, label: `${d.label} · ${GG.fmt.int(d.n)}` })), value: st.sz, onChange: (v) => { st.sz = v; lay.rebuild(); } });
    GG.ui.seg(f.controls, { label: 'SM architecture', options: AR.map((d) => ({ value: d.v, label: d.label })), value: st.ar, onChange: (v) => { st.ar = v; lay.rebuild(); } });
    const sFn = GG.ui.stat(f.readouts, { label: 'Host calls', tone: 'host' });
    const sFl = GG.ui.stat(f.readouts, { label: 'Work (2·M·N·K)', tone: 'core' });
    const sK = GG.ui.stat(f.readouts, { label: 'Kernel bin', tone: 'control' });
    const svg = svgRoot(f.stage, 'Diagram: host code calls a cuBLAS function; unpublished heuristics pick one kernel from a grid of kernels tuned per data type, matrix size and SM architecture; the kernel is launched on the GPU.');

    const lay = responsive(f.stage, (w) => {
      clear(svg);
      const wide = w >= 720;
      const d = DT[st.dt], z = SZ[st.sz], a = AR[st.ar];
      const call = `${d.fn}(handle, …)`;
      let y = 0, shelfX, shelfW, hostBox, diam;
      if (wide) {
        hostBox = { x: 0, y: 34, w: 232, h: 96 };
        diam = { x: 290, y: 82 };
        shelfX = 352; shelfW = w - shelfX;
      } else {
        hostBox = { x: 0, y: 0, w: w, h: 70 };
        diam = { x: w / 2, y: 118 };
        shelfX = 0; shelfW = w;
      }
      // host box
      R(svg, hostBox.x, hostBox.y, hostBox.w, hostBox.h, { rx: 10, fill: 'var(--host)', op: 0.1, stroke: 'rgba(184,164,255,.55)' });
      T(svg, hostBox.x + 12, hostBox.y + 16, 'YOUR HOST CODE (CPU)', { fs: 10, fill: 'var(--host)', ls: '.1em' });
      T(svg, hostBox.x + 12, hostBox.y + 38, call, { fs: 12.5, fill: 'var(--ink)' });
      T(svg, hostBox.x + 12, hostBox.y + 58, `M = N = K = ${GG.fmt.int(z.n)}, ${d.label}`, { fs: 11, fill: 'var(--ink-2)' });
      if (wide) T(svg, hostBox.x + 12, hostBox.y + 78, 'or PyTorch calling it for you', { fs: 10.5, fill: 'var(--ink-3)' });
      // diamond
      const dr = 24;
      if (wide) Arrow(svg, hostBox.x + hostBox.w + 2, diam.y, diam.x - dr - 4, diam.y, { stroke: 'var(--host)' });
      else Arrow(svg, diam.x, hostBox.y + hostBox.h + 2, diam.x, diam.y - dr - 4, { stroke: 'var(--host)' });
      Pth(svg, `M${diam.x},${diam.y - dr} L${diam.x + dr},${diam.y} L${diam.x},${diam.y + dr} L${diam.x - dr},${diam.y} Z`, { fill: 'rgba(255,198,92,.14)', stroke: 'var(--control)', sw: 1.5 });
      T(svg, diam.x, diam.y + 1, '?', { anchor: 'middle', fs: 20, fill: 'var(--control)', weight: 700 });
      if (wide) {
        T(svg, diam.x, diam.y + dr + 14, 'heuristics', { anchor: 'middle', fs: 10.5, fill: 'var(--control)' });
        T(svg, diam.x, diam.y + dr + 28, '(unpublished)', { anchor: 'middle', fs: 10, fill: 'var(--ink-3)' });
      } else {
        T(svg, diam.x + dr + 10, diam.y - 6, 'heuristics', { fs: 10.5, fill: 'var(--control)' });
        T(svg, diam.x + dr + 10, diam.y + 9, '(unpublished)', { fs: 10, fill: 'var(--ink-3)' });
      }
      // shelf grid: rows = architectures, cols = dtype × size
      const top = wide ? 0 : diam.y + dr + 26;
      const rowLab = wide ? 86 : 74;
      const cgap = 8, rgap = wide ? 14 : 12, dgap = 10;
      const cw = (shelfW - rowLab - cgap * 5 - dgap) / 6;
      const ch = wide ? 34 : 30;
      const gx0 = shelfX + rowLab;
      const colX = (di, zi) => gx0 + di * (3 * (cw + cgap) + dgap) + zi * (cw + cgap);
      const rowY = (ai) => ry0 + ai * (ch + rgap);
      const hy = top + 12, sy = top + 30, ry0 = top + 52;
      T(svg, shelfX, hy, 'KERNELS', { fs: 10, fill: 'var(--ink-3)', ls: '.1em' });
      DT.forEach((dd, di) => {
        const x = colX(di, 0);
        T(svg, x + (3 * cw + 2 * cgap) / 2, hy, dd.label, { anchor: 'middle', fs: 11, fill: di === st.dt ? 'var(--ink)' : 'var(--ink-3)', weight: di === st.dt ? 600 : 400 });
        Ln(svg, x, hy + 9, x + 3 * cw + 2 * cgap, hy + 9, { stroke: di === st.dt ? 'var(--ink-3)' : 'var(--line-2)' });
        SZ.forEach((zz, zi) => {
          T(svg, colX(di, zi) + cw / 2, sy, cw > 52 ? zz.label : zz.s, { anchor: 'middle', fs: 10, fill: (di === st.dt && zi === st.sz) ? 'var(--ink)' : 'var(--ink-3)' });
        });
      });
      let pick = null;
      AR.forEach((aa, ai) => {
        const yy = rowY(ai);
        T(svg, shelfX, yy + ch / 2, aa.label, { fs: 11, fill: ai === st.ar ? 'var(--ink)' : 'var(--ink-3)', weight: ai === st.ar ? 600 : 400 });
        DT.forEach((dd, di) => SZ.forEach((zz, zi) => {
          const x = colX(di, zi);
          const on = ai === st.ar && di === st.dt && zi === st.sz;
          R(svg, x, yy, cw, ch, { rx: 6, fill: 'var(--core)', op: on ? 0.28 : 0.06, stroke: on ? 'var(--core)' : 'rgba(69,212,155,.22)', sw: on ? 1.6 : 1 });
          // three little kernel glyphs per bin: "many kernels"
          for (let q = 0; q < 3; q++) R(svg, x + cw / 2 - 11 + q * 8, yy + ch / 2 - 5, 5, 10, { rx: 1.5, fill: on ? 'var(--core)' : 'var(--ink-3)', op: on ? 0.95 : 0.35 });
          if (on) pick = { x: x + cw / 2, xr: x + cw, y: yy, yb: yy + ch, ai };
        }));
      });
      const gridBottom = rowY(2) + ch;
      // GPU box position (needed by the launch arrow)
      const gy = gridBottom + (wide ? 30 : 26);
      // the heuristics' choice: a dashed path that runs only through gaps (never across a chip)
      // and ends on the chosen kernel; then a solid launch arrow from that kernel to the GPU
      if (pick) {
        const yGap = pick.y - rgap / 2;
        let d;
        if (wide) {
          const xm = shelfX - 12;
          d = `M${r1(diam.x + dr + 2)},${r1(diam.y)} L${r1(xm)},${r1(diam.y)} L${r1(xm)},${r1(yGap)} L${r1(pick.x)},${r1(yGap)}`;
        } else {
          const xc = gx0 - 7;
          d = `M${r1(diam.x - dr - 2)},${r1(diam.y)} L${r1(xc)},${r1(diam.y)} L${r1(xc)},${r1(yGap)} L${r1(pick.x)},${r1(yGap)}`;
        }
        Pth(svg, d, { stroke: 'var(--control)', sw: 1.5, dash: '4 3' });
        Arrow(svg, pick.x, yGap, pick.x, pick.y - 1, { stroke: 'var(--control)', head: 5, sw: 1.5 });
        const xg = pick.xr + cgap / 2;
        Pth(svg, `M${r1(pick.xr + 1)},${r1(pick.y + ch / 2)} L${r1(xg)},${r1(pick.y + ch / 2)} L${r1(xg)},${r1(gy - 9)}`, { stroke: 'var(--core)', sw: 1.6 });
        Arrow(svg, xg, gy - 10, xg, gy - 1, { stroke: 'var(--core)', head: 6, sw: 1.6 });
        const lx = xg + 6, ly = gridBottom + (wide ? 16 : 14);
        const lt = fit(['launch', ''], 10, (wide ? shelfX + shelfW : w) - lx);
        if (lt) T(svg, lx, ly, lt, { fs: 10, fill: 'var(--core)' });
        else T(svg, xg - 6, ly, 'launch', { anchor: 'end', fs: 10, fill: 'var(--core)' });
      }
      // GPU box with a copy of the picked kernel running in it
      const gxL = wide ? shelfX : 0, gW = wide ? shelfW : w;
      R(svg, gxL, gy, gW, 56, { rx: 10, fill: 'var(--core)', op: 0.07, stroke: 'rgba(69,212,155,.4)' });
      T(svg, gxL + 12, gy + 17, `${a.label.toUpperCase()} GPU`, { fs: 10, fill: 'var(--core)', ls: '.1em' });
      const chipX = gxL + 12, chipY = gy + 28;
      R(svg, chipX, chipY, 18, 18, { rx: 4, fill: 'var(--core)', op: 0.35, stroke: 'var(--core)' });
      for (let q = 0; q < 3; q++) R(svg, chipX + 4 + q * 4, chipY + 5, 2, 8, { fill: 'var(--core)' });
      const gfs = w < 420 ? 10 : 11;
      T(svg, chipX + 26, chipY + 9, fit([`runs the picked kernel (${d.label} · ${z.label} · ${a.label}); grid and block sizes also chosen by cuBLAS`, `runs the picked kernel (${d.label} · ${z.label}); launch configuration chosen by cuBLAS`, `runs the picked kernel (${d.label}, ${z.label})`], gfs, gW - 50), { fs: gfs, fill: 'var(--ink-2)' });
      y = gy + 58;
      sizeSvg(svg, w, y);
      const fl = 2 * z.n ** 3;
      sFn.set(d.fn);
      sFl.set(GG.fmt.si(fl, 'FLOP', 2));
      sK.set(`${d.label} · ${z.label} · ${a.label}`);
      f.setWhy(`Asked for an <b>${d.label}</b> matrix multiplication with M = N = K = <b>${GG.fmt.int(z.n)}</b> on ${/^[AEIOU]/.test(a.label) ? 'an' : 'a'} <b>${a.label}</b> GPU, cuBLAS’s heuristics choose among the kernels tuned for that case (dashed path), then launch the winner with the grid and block sizes they chose (green arrow). That one host call is 2 × ${GG.fmt.int(z.n)}³ = <b>${GG.fmt.si(fl, 'FLOP', 2)}</b> of work.`);
    });
  }

  /* Fig: the same bytes, three readings (row-major vs column-major) */
  function figReadings(ctx, slot) {
    const f = fig(ctx, slot, {
      title: 'One strip of memory, three readings', hint: 'hover a letter · switch the reading', wide: true,
      caption: 'The strip is what is actually in memory: M·N values, one after another. A “layout” is just a rule for turning a slot number into a (row, column) position. The copper line follows the slots in order 0, 1, 2, … through each matrix.',
    });
    const st = { M: 3, N: 4, mode: 'colT', hover: -1 };
    const LET = 'abcdefghijklmnopqrstuvwxyz';
    const MODES = {
      row: { label: 'Row-major M×N', title: 'How C, C++ and Python wrote it' },
      colT: { label: 'Column-major N×M', title: 'How cuBLAS reads it if you describe it as N×M' },
      colBad: { label: 'Column-major M×N', title: 'How cuBLAS reads it if you describe it as M×N' },
    };
    GG.ui.seg(f.controls, { label: 'Read the strip as', options: Object.keys(MODES).map((k) => ({ value: k, label: MODES[k].label, title: MODES[k].title })), value: st.mode, onChange: (v) => { st.mode = v; paint(); } });
    GG.ui.slider(f.controls, { label: 'Rows M', min: 2, max: 4, value: st.M, onInput: (v) => { st.M = v; st.hover = -1; lay.rebuild(); } });
    GG.ui.slider(f.controls, { label: 'Columns N', min: 2, max: 6, value: st.N, onInput: (v) => { st.N = v; st.hover = -1; lay.rebuild(); } });
    const sDims = GG.ui.stat(f.readouts, { label: 'Reader sees', tone: 'memory' });
    const sPut = GG.ui.stat(f.readouts, { label: 'You put {A[i][j]} in slot', tone: 'memory' });
    const sAddr = GG.ui.stat(f.readouts, { label: 'Reader looks for cell {(r, c)} in slot', tone: 'memory' });
    const sRes = GG.ui.stat(f.readouts, { label: 'Result', tone: 'core' });
    const svg = svgRoot(f.stage, 'A memory strip of lettered slots, the matrix A as written in row-major order, and the same strip as read under the chosen layout.');
    keyNav(svg, 'Use the arrow keys to step through the slots.', (k) => {
      const n = st.M * st.N;
      if (k === 'ArrowRight' || k === 'ArrowDown') st.hover = st.hover < 0 ? 0 : Math.min(n - 1, st.hover + 1);
      else if (k === 'ArrowLeft' || k === 'ArrowUp') st.hover = st.hover < 0 ? n - 1 : Math.max(0, st.hover - 1);
      else if (k === 'Home') st.hover = 0;
      else if (k === 'End') st.hover = n - 1;
      else if (k === 'Escape') st.hover = -1;
      else return false;
      paint();
    });
    let E = null; // built elements
    const E0 = {};

    const pos = (mode, k, M, N) => {
      if (mode === 'row') return [Math.floor(k / N), k % N];
      if (mode === 'colT') return [k % N, Math.floor(k / N)];
      return [k % M, Math.floor(k / M)];
    };
    const dimsOf = (mode, M, N) => (mode === 'colT' ? [N, M] : [M, N]);

    const lay = responsive(f.stage, (w) => {
      clear(svg);
      const { M, N } = st, n = M * N;
      const narrow = w < 560;
      // strip
      const sw = clamp(Math.floor((w - 2) / n), 13, 40);
      const stripW = sw * n;
      const sx0 = Math.max(0, (w - stripW) / 2);
      const sy0 = 22;
      T(svg, sx0, 8, 'MEMORY: float *A, one slot after another', { fs: 10, fill: 'var(--ink-3)', ls: '.08em' });
      const strip = [];
      for (let k = 0; k < n; k++) {
        const g = G(svg, { class: 'hsc-hit' });
        const r = R(g, sx0 + k * sw, sy0, sw - 2, sw - 2, { rx: 3, fill: 'var(--memory)', op: 0.14, stroke: 'rgba(111,166,255,.4)' });
        T(g, sx0 + k * sw + (sw - 2) / 2, sy0 + (sw - 2) / 2 + 0.5, LET[k], { anchor: 'middle', fs: Math.min(14, sw * 0.55), fill: 'var(--ink)' });
        const lab = T(g, sx0 + k * sw + (sw - 2) / 2, sy0 + sw + 7, String(k), { anchor: 'middle', fs: sw < 18 ? 9 : 10, fill: 'var(--ink-3)' });
        g.addEventListener('pointerenter', () => { st.hover = k; paint(); });
        g.addEventListener('click', () => { st.hover = k; paint(); });
        strip.push({ g, r, lab });
      }
      // matrices
      const colsTotal = N + Math.max(M, N);
      const gapX = narrow ? 30 : 70;
      const cs = clamp(Math.floor((w - gapX - 16) / colsTotal), 22, 50);
      const my0 = sy0 + sw + 44;
      const lx0 = Math.max(16, (w - (colsTotal * cs + gapX)) / 2);
      const rx0 = lx0 + N * cs + gapX;
      E0.titleW = { left: N * cs + gapX - 10, right: w - rx0 };
      T(svg, lx0, my0 - 16, fit([`WHAT YOU MEANT: A (${M}×${N})`, `YOU MEANT: A (${M}×${N})`, `A (${M}×${N})`], 10, E0.titleW.left), { fs: 10, fill: 'var(--ink-3)' });
      const rTitle = T(svg, rx0, my0 - 16, '', { fs: 10, fill: 'var(--ink-3)' });
      const left = matrixSvg(svg, lx0, my0, M, N, cs, { vals: (i, j) => LET[i * N + j], fs: Math.min(15, cs * 0.46) });
      const lpath = [];
      for (let k = 0; k < n; k++) lpath.push([lx0 + (k % N) * cs + (cs - 2) / 2, my0 + Math.floor(k / N) * cs + (cs - 2) / 2]);
      Pth(svg, 'M' + lpath.map((p) => p.map(r1).join(',')).join(' L'), { stroke: 'var(--accent)', sw: 1.5, op: 0.55 });
      // hover hits on left
      for (let i = 0; i < M; i++) for (let j = 0; j < N; j++) {
        const k = i * N + j;
        const c = left.cells[i][j];
        c.r.classList.add('hsc-hit'); c.t.classList.add('hsc-hit');
        [c.r, c.t].forEach((el) => { el.addEventListener('pointerenter', () => { st.hover = k; paint(); }); el.addEventListener('click', () => { st.hover = k; paint(); }); });
      }
      // right: frame cells (max dims) + movable letters
      const maxD = Math.max(M, N);
      const frame = [];
      const fg = G(svg);
      for (let i = 0; i < maxD; i++) for (let j = 0; j < maxD; j++) {
        frame.push({ i, j, r: R(fg, rx0 + j * cs, my0 + i * cs, cs - 2, cs - 2, { rx: 4, fill: 'var(--memory)', op: 0.13, stroke: 'rgba(111,166,255,.45)' }) });
      }
      const rpath = Pth(svg, '', { stroke: 'var(--accent)', sw: 1.5, op: 0.55, cls: 'hsc-fade' });
      const movers = [];
      for (let k = 0; k < n; k++) {
        const g = G(svg, { class: 'hsc-mv hsc-hit' });
        const ring = R(g, 0, 0, cs - 2, cs - 2, { rx: 4, fill: 'none', stroke: 'transparent', sw: 2 });
        T(g, (cs - 2) / 2, (cs - 2) / 2 + 0.5, LET[k], { anchor: 'middle', fs: Math.min(15, cs * 0.46), fill: 'var(--ink)' });
        g.addEventListener('pointerenter', () => { st.hover = k; paint(); });
        g.addEventListener('click', () => { st.hover = k; paint(); });
        movers.push({ g, ring });
      }
      const rowIdx = [], colIdx = [];
      for (let i = 0; i < maxD; i++) rowIdx.push(T(svg, rx0 - 8, my0 + i * cs + (cs - 2) / 2, String(i), { anchor: 'end', fs: 10, fill: 'var(--ink-3)', cls: 'hsc-fade' }));
      for (let j = 0; j < maxD; j++) colIdx.push(T(svg, rx0 + j * cs + (cs - 2) / 2, my0 + maxD * cs + 6, String(j), { anchor: 'middle', fs: 10, fill: 'var(--ink-3)', cls: 'hsc-fade' }));
      for (let i = 0; i < M; i++) T(svg, lx0 - 8, my0 + i * cs + (cs - 2) / 2, String(i), { anchor: 'end', fs: 10, fill: 'var(--ink-3)' });
      for (let j = 0; j < N; j++) T(svg, lx0 + j * cs + (cs - 2) / 2, my0 + M * cs + 6, String(j), { anchor: 'middle', fs: 10, fill: 'var(--ink-3)' });
      svg.addEventListener('pointerleave', () => { st.hover = -1; paint(); });
      sizeSvg(svg, w, my0 + maxD * cs + 16);
      E = { strip, left, frame, movers, rpath, rTitle, rx0, my0, cs, rowIdx, colIdx };
      paint(true);
    });

    function paint(first) {
      if (!E) return;
      const { M, N } = st, n = M * N, mode = st.mode;
      const [rows, cols] = dimsOf(mode, M, N);
      const { cs, rx0, my0 } = E;
      const rw = E0.titleW ? E0.titleW.right : 400;
      E.rTitle.textContent = mode === 'row' ? fit([`READ ROW-MAJOR (${rows}×${cols})`, `ROW-MAJOR (${rows}×${cols})`], 10, rw) : fit([`READ COLUMN-MAJOR (${rows}×${cols})`, `COL-MAJOR (${rows}×${cols})`], 10, rw);
      E.frame.forEach((c) => { c.r.style.opacity = c.i < rows && c.j < cols ? 1 : 0; });
      E.rowIdx.forEach((t, i) => { t.style.opacity = i < rows ? 1 : 0; });
      E.colIdx.forEach((t, j) => { t.style.opacity = j < cols ? 1 : 0; t.setAttribute('y', my0 + rows * cs + 6); });
      let bad = 0;
      const pts = [];
      for (let k = 0; k < n; k++) {
        const [i, j] = pos(mode, k, M, N);
        const x = rx0 + j * cs, y = my0 + i * cs;
        const m = E.movers[k];
        if (first) { m.g.style.transition = 'none'; }
        m.g.style.transform = `translate(${x}px, ${y}px)`;
        if (first) { void m.g.getBoundingClientRect(); m.g.style.transition = ''; }
        pts.push([x + (cs - 2) / 2, y + (cs - 2) / 2]);
        // what should be here?
        let want;
        if (mode === 'row') want = i * N + j;
        else if (mode === 'colT') want = j * N + i; // A^T[i][j] = A[j][i]
        else want = i * N + j; // they meant A itself
        const ok = want === k;
        if (!ok) bad++;
        m.ring.style.stroke = k === st.hover ? 'var(--accent)' : ok ? 'transparent' : 'var(--danger)';
      }
      E.rpath.setAttribute('d', 'M' + pts.map((p) => p.map(r1).join(',')).join(' L'));
      E.strip.forEach((s, k) => {
        const h = k === st.hover;
        s.r.style.fill = h ? 'var(--accent)' : 'var(--memory)';
        s.r.style.fillOpacity = h ? 0.35 : 0.14;
        s.r.style.stroke = h ? 'var(--accent)' : 'rgba(111,166,255,.4)';
      });
      for (let i = 0; i < M; i++) for (let j = 0; j < N; j++) {
        const c = E.left.cells[i][j];
        const h = i * N + j === st.hover;
        c.r.style.fill = h ? 'var(--accent)' : 'var(--memory)';
        c.r.style.fillOpacity = h ? 0.35 : 0.13;
        c.r.style.stroke = h ? 'var(--accent)' : 'rgba(111,166,255,.45)';
      }
      sDims.set(`${rows}×${cols}`);
      sPut.set(`i·${N} + j`);
      sAddr.set(mode === 'row' ? `r·${N} + c` : mode === 'colT' ? `r + c·${N}` : `r + c·${M}`);
      if (mode === 'row') sRes.set('= A', 'core');
      else if (mode === 'colT') sRes.set('= A' + TR, 'core');
      else sRes.set(`${bad} of ${n} misplaced`, bad ? 'danger' : 'core');
      // why
      const L = (k) => `<b>${LET[k]}</b>`;
      let why;
      if (st.hover >= 0 && st.hover < n) {
        const k = st.hover, i0 = Math.floor(k / N), j0 = k % N;
        const [i, j] = pos(mode, k, M, N);
        const where = mode === 'row'
          ? `read row-major as ${rows}×${cols}, slot ${k} is row ⌊${k}/${N}⌋ = ${i}, column ${k} mod ${N} = ${j}: back where you put it.`
          : mode === 'colT'
            ? `read column-major as ${rows}×${cols}, slot ${k} is row ${k} mod ${N} = ${i}, column ⌊${k}/${N}⌋ = ${j}. ${i === j ? `It sits on the diagonal, so it stays put: A${TR}[${i}][${i}] = A[${i}][${i}].` : `Row and column have swapped: that is A${TR}[${i}][${j}] = A[${j}][${i}].`}`
            : `read column-major as ${rows}×${cols}, slot ${k} is row ${k} mod ${M} = ${i}, column ⌊${k}/${M}⌋ = ${j}. ${i === i0 && j === j0 ? 'By luck it lands in the right place.' : `But you meant A[${i}][${j}] to be ${L(i * N + j)}: wrong element.`}`;
        why = `You wrote ${L(k)} as A[${i0}][${j0}], so row-major puts it in slot ${i0}·${N} + ${j0} = <b>${k}</b>. ${where.charAt(0).toUpperCase() + where.slice(1)}`;
      } else if (mode === 'row') {
        why = `Row-major: row 0 first, then row 1, and so on. Element (i, j) of this ${M}×${N} matrix sits in slot <b>i·${N} + j</b>. The copper line runs along the rows.`;
      } else if (mode === 'colT') {
        why = `Column-major fills column 0 first. Described as a <b>${N}×${M}</b> matrix, the very same bytes come out as <b>A${TR}</b>: every row you wrote is now a column. No byte moved; only the reading rule changed.`;
      } else {
        why = `Keep the shape ${M}×${N} but read column-major and the letters scramble: <b>${bad} of ${n}</b> land in the wrong cell (red). This is the classic cuBLAS bug: row-major data described to a column-major library.`;
      }
      f.setWhy(why);
    }
  }

  /* Fig: leading dimension explorer */
  function figLda(ctx, slot) {
    const f = fig(ctx, slot, {
      title: 'Leading dimension: finding each column', hint: 'drag across the matrix · or use the sliders', wide: true, class: 'hsc-compact',
      caption: 'A parent matrix stored column-major, the way cuBLAS expects. The numbers in the cells are memory offsets. The highlighted submatrix is what you hand to cuBLAS: a pointer to its first element, its size m × n, and lda. Consecutive columns of the submatrix start lda slots apart, where lda is the parent’s row count.',
    });
    const Q = 8;
    const st = { P: 6, r0: 1, c0: 2, m: 3, n: 4, hover: null, anchor: null, tapStart: null };
    const sl = {};
    const fix = () => {
      st.r0 = clamp(st.r0, 0, st.P - 1); st.c0 = clamp(st.c0, 0, Q - 1);
      st.m = clamp(st.m, 1, st.P - st.r0); st.n = clamp(st.n, 1, Q - st.c0);
      if (sl.r0) {
        sl.r0.input.max = st.P - 1; sl.r0.set(st.r0);
        sl.m.input.max = st.P - st.r0; sl.m.set(st.m);
        sl.c0.set(st.c0); sl.n.input.max = Q - st.c0; sl.n.set(st.n);
        sl.P.set(st.P);
      }
    };
    sl.P = GG.ui.slider(f.controls, { label: 'Parent rows (= {lda})', min: 4, max: 8, value: st.P, onInput: (v) => { st.P = v; fix(); lay.rebuild(); } });
    sl.r0 = GG.ui.slider(f.controls, { label: 'First row', min: 0, max: st.P - 1, value: st.r0, onInput: (v) => { st.r0 = v; fix(); paint(); } });
    sl.c0 = GG.ui.slider(f.controls, { label: 'First column', min: 0, max: Q - 1, value: st.c0, onInput: (v) => { st.c0 = v; fix(); paint(); } });
    sl.m = GG.ui.slider(f.controls, { label: 'Rows {m}', min: 1, max: st.P - st.r0, value: st.m, onInput: (v) => { st.m = v; fix(); paint(); } });
    sl.n = GG.ui.slider(f.controls, { label: 'Columns {n}', min: 1, max: Q - st.c0, value: st.n, onInput: (v) => { st.n = v; fix(); paint(); } });
    GG.ui.button(f.controls, { label: 'Whole matrix', onClick: () => { st.r0 = 0; st.c0 = 0; st.m = st.P; st.n = Q; fix(); paint(); } });
    const sM = GG.ui.stat(f.readouts, { label: '{m × n}', tone: 'memory' });
    const sLda = GG.ui.stat(f.readouts, { label: '{lda}', tone: 'accent' });
    const sPtr = GG.ui.stat(f.readouts, { label: 'Pointer = {A} +', tone: 'memory' });
    const sUse = GG.ui.stat(f.readouts, { label: 'Used / spanned', tone: 'memory' });
    const svg = svgRoot(f.stage, 'A parent matrix in column-major order with a highlighted submatrix, and the linear memory strip showing where the submatrix columns start, lda slots apart.', 'hsc-drag');
    let E = null;

    const lay = responsive(f.stage, (w) => {
      clear(svg);
      const P = st.P;
      const narrow = w < 600;
      // parent grid
      const cs = clamp(Math.floor((narrow ? w - 30 : Math.min(w * 0.5, 460)) / Q), 26, 50);
      const gx0 = 22, gy0 = 26;
      T(svg, gx0, 8, fit([`PARENT MATRIX: ${P} rows × ${Q} columns, column-major`, `PARENT: ${P} × ${Q}, column-major`], 10, w - gx0), { fs: 10, fill: 'var(--ink-3)' });
      const cells = [];
      for (let i = 0; i < P; i++) {
        const row = [];
        for (let j = 0; j < Q; j++) {
          const x = gx0 + j * cs, y = gy0 + i * cs;
          const r = R(svg, x, y, cs - 2, cs - 2, { rx: 4, fill: 'var(--memory)', op: 0.06, stroke: 'rgba(111,166,255,.22)' });
          const t = T(svg, x + (cs - 2) / 2, y + (cs - 2) / 2 + 0.5, String(i + j * P), { anchor: 'middle', fs: Math.min(12, cs * 0.36), fill: 'var(--ink-3)' });
          [r, t].forEach((el) => {
            el.addEventListener('pointerdown', (e) => {
              st.ptype = e.pointerType;
              if (e.pointerType === 'mouse') { st.anchor = [i, j]; st.tapStart = null; setSel(i, j, i, j); e.preventDefault(); }
            });
            el.addEventListener('pointerenter', (e) => {
              st.hover = [i, j];
              if (st.anchor && e.pointerType === 'mouse' && (e.buttons & 1)) setSel(st.anchor[0], st.anchor[1], i, j);
              else paint();
            });
            el.addEventListener('click', () => {
              if (st.ptype === 'mouse') return;
              // touch / pen: first tap sets one corner, the second tap the opposite corner
              st.hover = null;
              if (!st.tapStart) { st.tapStart = [i, j]; setSel(i, j, i, j); }
              else { const s0 = st.tapStart; st.tapStart = null; setSel(s0[0], s0[1], i, j); }
            });
          });
          row.push({ r, t });
        }
        cells.push(row);
      }
      for (let j = 0; j < Q; j++) T(svg, gx0 + j * cs + (cs - 2) / 2, gy0 + P * cs + 7, 'c' + j, { anchor: 'middle', fs: 10, fill: 'var(--ink-3)' });
      for (let i = 0; i < P; i++) T(svg, gx0 - 7, gy0 + i * cs + (cs - 2) / 2, String(i), { anchor: 'end', fs: 10, fill: 'var(--ink-3)' });
      const selRect = R(svg, 0, 0, 0, 0, { rx: 6, fill: 'none', stroke: 'var(--accent)', sw: 2 });
      selRect.style.pointerEvents = 'none';
      const gridBottom = gy0 + P * cs + 16;
      // memory strip: under the grid, full width, one line if the slots can be at least 12 px wide
      const mx0 = 0, my0 = gridBottom + 34, mw = w - 2;
      const gap = 6;
      let segsPer = Q;
      let sw = (mw - (Q - 1) * gap) / (P * Q);
      if (sw < 12) { segsPer = Math.max(1, Math.floor((mw + gap) / (P * 12 + gap))); sw = (mw - (segsPer - 1) * gap) / (P * segsPer); }
      sw = Math.min(sw, 22);
      const lineW = segsPer * P * sw + (segsPer - 1) * gap;
      const lineH = sw + 74;
      T(svg, mx0, my0 - 20, 'MEMORY (one column after another)', { fs: 10, fill: 'var(--ink-3)', ls: '.08em' });
      const slots = [];
      const slotXY = (k) => {
        const col = Math.floor(k / P), within = k % P;
        const line = Math.floor(col / segsPer), segInLine = col % segsPer;
        return [mx0 + segInLine * (P * sw + gap) + within * sw, my0 + line * lineH + 30, line];
      };
      for (let k = 0; k < P * Q; k++) {
        const [x, y] = slotXY(k);
        slots.push(R(svg, x, y, sw - 1.5, sw, { rx: 2, fill: 'var(--memory)', op: 0.08, stroke: 'rgba(111,166,255,.2)' }));
      }
      for (let j = 0; j < Q; j++) {
        const [x, y] = slotXY(j * P);
        T(svg, x + (P * sw) / 2, y + sw + 10, 'c' + j, { anchor: 'middle', fs: 10, fill: 'var(--ink-3)' });
        T(svg, x, y + sw + 24, String(j * P), { fs: 10, fill: 'var(--ink-3)' });
      }
      const marks = G(svg);
      const lines = Math.ceil(Q / segsPer);
      const bottom = my0 + (lines - 1) * lineH + 30 + sw + 30;
      sizeSvg(svg, w, bottom + 4);
      E = { cells, selRect, slots, marks, slotXY, cs, gx0, gy0, sw, P, mx0, lineW };
      paint();
    });
    function setSel(i1, j1, i2, j2) {
      st.r0 = Math.min(i1, i2); st.c0 = Math.min(j1, j2);
      st.m = Math.abs(i2 - i1) + 1; st.n = Math.abs(j2 - j1) + 1;
      fix(); paint();
    }
    window.addEventListener('pointerup', () => { st.anchor = null; });
    svg.addEventListener('pointerleave', () => { st.hover = null; paint(); });

    function paint() {
      if (!E || E.P !== st.P) return;
      const { P } = st, { cs, gx0, gy0, sw } = E;
      const inSub = (i, j) => i >= st.r0 && i < st.r0 + st.m && j >= st.c0 && j < st.c0 + st.n;
      for (let i = 0; i < P; i++) for (let j = 0; j < Q; j++) {
        const c = E.cells[i][j], on = inSub(i, j);
        const h = st.hover && st.hover[0] === i && st.hover[1] === j;
        c.r.style.fillOpacity = on ? 0.3 : 0.06;
        c.r.style.stroke = h ? 'var(--accent)' : on ? 'rgba(111,166,255,.8)' : 'rgba(111,166,255,.22)';
        c.t.style.fill = on ? 'var(--ink)' : 'var(--ink-3)';
      }
      const sr = E.selRect;
      sr.setAttribute('x', gx0 + st.c0 * cs - 3); sr.setAttribute('y', gy0 + st.r0 * cs - 3);
      sr.setAttribute('width', st.n * cs + 4); sr.setAttribute('height', st.m * cs + 4);
      const hk = st.hover ? st.hover[0] + st.hover[1] * P : -1;
      E.slots.forEach((r, k) => {
        const i = k % P, j = Math.floor(k / P), on = inSub(i, j);
        r.style.fillOpacity = k === hk ? 0.6 : on ? 0.55 : 0.08;
        r.style.fill = k === hk ? 'var(--accent)' : 'var(--memory)';
        r.style.stroke = on ? 'rgba(111,166,255,.9)' : 'rgba(111,166,255,.2)';
      });
      // column-start markers + lda arcs
      clear(E.marks);
      const base = st.r0 + st.c0 * P;
      const starts = [];
      for (let j = 0; j < st.n; j++) starts.push(base + j * P);
      starts.forEach((s, j) => {
        const [x, y, line] = E.slotXY(s);
        const cx = x + (sw - 1.5) / 2;
        Pth(E.marks, `M${r1(cx)},${r1(y - 2)} L${r1(cx - 4)},${r1(y - 9)} L${r1(cx + 4)},${r1(y - 9)} Z`, { fill: j === 0 ? 'var(--accent)' : 'var(--accent-2)' });
        if (j > 0) {
          const [px, py, pl] = E.slotXY(starts[j - 1]);
          const pcx = px + (sw - 1.5) / 2;
          const hop = { stroke: 'var(--accent)', sw: 1.2, dash: '3 2' };
          if (pl === line) {
            const top = y - 18;
            Pth(E.marks, `M${r1(pcx)},${r1(py - 10)} C${r1(pcx)},${r1(top)} ${r1(cx)},${r1(top)} ${r1(cx)},${r1(y - 10)}`, hop);
            if (cx - pcx > 26) T(E.marks, (pcx + cx) / 2, top - 2, '+' + P, { anchor: 'middle', fs: 10, fill: 'var(--accent-2)' });
          } else {
            // the hop crosses a line break: leave the previous line on the right, re-enter on the left
            const t1 = py - 18, t2 = y - 18, endX = E.mx0 + E.lineW + 3, startX = E.mx0 - 1;
            Pth(E.marks, `M${r1(pcx)},${r1(py - 10)} C${r1(pcx)},${r1(t1)} ${r1(pcx + 8)},${r1(t1)} ${r1(Math.min(endX, pcx + 12))},${r1(t1)} L${r1(endX)},${r1(t1)}`, hop);
            Pth(E.marks, `M${r1(endX - 4)},${r1(t1 - 3)} L${r1(endX)},${r1(t1)} L${r1(endX - 4)},${r1(t1 + 3)}`, { stroke: 'var(--accent)', sw: 1.2 });
            const mid = Math.max(startX + 6, cx - 12);
            Pth(E.marks, `M${r1(startX)},${r1(t2)} L${r1(mid)},${r1(t2)} C${r1(cx)},${r1(t2)} ${r1(cx)},${r1(t2)} ${r1(cx)},${r1(y - 10)}`, hop);
            if (endX - pcx > 34) T(E.marks, endX - 6, t1 - 8, `+${P} →`, { anchor: 'end', fs: 10, fill: 'var(--accent-2)' });
            else T(E.marks, cx + 8, t2 - 2, `+${P}`, { fs: 10, fill: 'var(--accent-2)' });
          }
        }
      });
      const [fx, fy] = E.slotXY(base);
      T(E.marks, fx + (sw - 1.5) / 2 - 7, fy - 6, 'A', { anchor: 'end', fs: 11, fill: 'var(--accent)', weight: 700 });
      sM.set(`${st.m} × ${st.n}`);
      sLda.set(String(P));
      sPtr.set(`${st.r0} + ${st.c0}·${P} = ${base}`);
      const span = (st.n - 1) * P + st.m;
      sUse.set(`${st.m * st.n} / ${span}`);
      const whole = st.m === P && st.n === Q;
      let why;
      if (st.tapStart) {
        why = `One corner set at parent element (${st.tapStart[0]}, ${st.tapStart[1]}). Now tap the opposite corner of the submatrix you want.`;
      } else if (st.hover) {
        const [i, j] = st.hover;
        if (inSub(i, j)) {
          const li = i - st.r0, lj = j - st.c0;
          why = `Parent element (${i}, ${j}) is the submatrix’s element (${li}, ${lj}). cuBLAS finds it at <b>A[${li} + ${lj}·lda]</b> = ${base} + ${li} + ${lj}·${P} = <b>${base + li + lj * P}</b>.`;
        } else why = `Parent element (${i}, ${j}) is at offset ${i} + ${j}·${P} = <b>${i + j * P}</b>. It is outside the submatrix, but it may sit between the submatrix’s columns in memory: cuBLAS simply steps over it.`;
      } else if (whole) {
        why = `For the entire allocated matrix, the leading dimension is just its number of rows: <b>lda = ${P}</b>. The columns sit back to back with no gaps.`;
      } else {
        why = `This ${st.m}×${st.n} submatrix has only ${st.m} row${st.m > 1 ? 's' : ''}, but its columns start <b>${P}</b> slots apart, because each one is a piece of a ${P}-row parent column. So <b>lda = ${P}</b>, the parent’s row count, not m. Column j starts at ${base} + j·${P}. (Drag across the matrix, or tap one corner and then the opposite one, to pick another submatrix.)`;
      }
      f.setWhy(why);
    }
  }

  /* Fig: the transpose trick, stepped and verified with a real column-major GEMM */
  function figTrick(ctx, slot) {
    const f = fig(ctx, slot, {
      title: 'The transpose trick, step by step', hint: 'step through · hover a number · try the unswapped call', wide: true,
      caption: 'Everything here is computed: your row-major buffers are handed to a small JavaScript implementation of the column-major GEMM that <code>cublasSgemm</code> performs (α = 1, β = 0), with exactly the arguments shown. Shading marks the rows you wrote, alternately dark and light, so you can follow them into cuBLAS’s view; hover or tap any number to find the same memory slot everywhere. The excerpt at the top is the part of <code>sgemm_row_major</code> each step is about; in the unswapped mode it shows the buggy call that is actually made instead. Step 6 compares the output with A @ B computed directly.',
    });
    const st = { M: 2, K: 3, N: 4, seed: 7, mode: 'swap', step: 0, hov: null };
    const STEPS = [
      { label: 'What you have' }, { label: 'What cuBLAS sees' }, { label: 'Swap the operands' },
      { label: 'Make the call' }, { label: 'cuBLAS writes its answer' }, { label: 'Read it row-major' },
    ];
    let code = null; // set by caller for line highlighting
    let D = null, E = null;
    const exc = GG.el('div', { class: 'code no-ln hsc-exc' });
    const excPre = GG.el('pre', { tabindex: '0', 'aria-label': 'The lines of sgemm_row_major this step is about' });
    exc.append(excPre);
    const callBox = GG.el('div', { class: 'hsc-call', 'aria-label': 'The cublasSgemm call being made' });
    f.stage.append(exc, callBox);
    const svg = svgRoot(f.stage, 'Matrices A, B and C with their row-major memory buffers, and the matrices cuBLAS sees when it reads those buffers column-major.');
    const stepper = GG.ui.stepper(f.controls, { label: 'Step', steps: STEPS, autoplay: 2600, onStep: (i) => { st.step = i; st.hov = null; paint(); } });
    GG.ui.seg(f.controls, { label: 'Call', options: [{ value: 'swap', label: 'swapped (correct)' }, { value: 'plain', label: 'unswapped (bug)' }], value: st.mode, onChange: (v) => { st.mode = v; st.hov = null; paint(); } });
    const dimOpts = [1, 2, 3, 4].map((v) => ({ value: v, label: String(v) }));
    ['M', 'K', 'N'].forEach((k) => GG.ui.seg(f.controls, { label: k, options: dimOpts, value: st[k], onChange: (v) => { st[k] = v; st.hov = null; lay.rebuild(); } }));
    GG.ui.button(f.controls, { label: 'New numbers', icon: 'reset', onClick: () => { st.seed++; lay.rebuild(); } });
    const sCheck = GG.ui.stat(f.readouts, { label: '{cuBLAS} output vs {A@B}', tone: 'core' });
    const sDims = GG.ui.stat(f.readouts, { label: '{cuBLAS (m, n, k)}', tone: 'accent' });
    svg.addEventListener('pointerleave', () => { if (st.hov) { st.hov = null; paint(); } });

    function data() {
      const { M, K, N } = st;
      const rnd = mulberry32(st.seed * 7919 + M * 131 + K * 17 + N);
      const v = () => Math.floor(rnd() * 7) - 3;
      const A = Array.from({ length: M * K }, v), B = Array.from({ length: K * N }, v);
      const ref = [];
      for (let i = 0; i < M; i++) for (let j = 0; j < N; j++) { let s = 0; for (let p = 0; p < K; p++) s += A[i * K + p] * B[p * N + j]; ref.push(s); }
      // column-major GEMM with cuBLAS semantics (OP_N, OP_N, alpha = 1, beta = 0)
      const gemm = (m, n, k, X, ldx, Y, ldy, ldz) => {
        const Z = new Array(M * N).fill(0);
        for (let j = 0; j < n; j++) for (let i = 0; i < m; i++) { let s = 0; for (let p = 0; p < k; p++) s += X[i + p * ldx] * Y[p + j * ldy]; Z[i + j * ldz] = s; }
        return Z;
      };
      const swap = { m: N, n: M, k: K, X: 'B', ldx: N, Y: 'A', ldy: K, ldz: N };
      const plain = { m: M, n: N, k: K, X: 'A', ldx: M, Y: 'B', ldy: K, ldz: M };
      const run = (c) => gemm(c.m, c.n, c.k, c.X === 'A' ? A : B, c.ldx, c.Y === 'A' ? A : B, c.ldy, c.ldz);
      return { A, B, ref, swap, plain, outSwap: run(swap), outPlain: run(plain) };
    }
    const lay = responsive(f.stage, (w) => {
      D = data();
      E = { w };
      paint();
    });

    function setHov(s) {
      if (st.hov && s && st.hov.b === s.b && st.hov.k === s.k) return;
      st.hov = s; paint();
    }
    function hit(els, s) {
      els.forEach((el) => {
        el.classList.add('hsc-hit');
        el.addEventListener('pointerenter', () => setHov(s));
        el.addEventListener('click', () => setHov(s));
      });
    }

    function paint() {
      if (!D || !E) return;
      const { M, K, N } = st, w = E.w, step = st.step, sw = st.mode === 'swap';
      const { A, B, ref } = D;
      const c = sw ? D.swap : D.plain;
      const out = sw ? D.outSwap : D.outPlain;
      const BUF = { A, B, C: out };
      const rowLen = { A: K, B: N, C: N };
      const hv = st.hov;
      const same = (s) => !!(hv && s && s.b === hv.b && s.k === hv.k);
      // alternate rows of each buffer, as you wrote them, dark / light
      const shade = (s, lo, hi) => (Math.floor(s.k / rowLen[s.b]) % 2 ? lo : hi);
      clear(svg);
      // the lines this step is about (verbatim)
      const Lh = (n) => lineOf(SGEMM_CODE, n);
      const hl = [
        range(Lh('void sgemm_row_major'), Lh('float *C) {')),
        range(Lh('// A is M x K'), Lh('//   the leading dimension of B^T is N')),
        [Lh('// note the swapped')],
        range(Lh('cublasSgemm(handle'), Lh('C, N); //')),
        [Lh('C, N); //')],
        [Lh('// C is M x N'), Lh('//   the leading dimension of C^T is N')],
      ][step];
      const codeLines = SGEMM_CODE.split('\n');
      // unswapped mode: after the first step, show the call this mode actually makes (not the glossary's), and
      // leave the verbatim listing unhighlighted, since it is not the code being run
      const plainLines = step === 1 ? [
        '// unswapped (the bug): A and B passed as they are',
        '// cuBLAS reads buffer A column-major as M x K, leading dimension M: not A',
        '// cuBLAS reads buffer B column-major as K x N, leading dimension K: not B',
      ] : [
        '// unswapped (the bug): A first, M and N in their natural order',
        'cublasSgemm(handle, CUBLAS_OP_N, CUBLAS_OP_N,',
        '            M, N, K,',
        '            alpha,',
        '            A, M,',
        '            B, K,',
        '            beta,',
        '            C, M); // cuBLAS writes A′ @ B′ here, column-major',
      ];
      const own = !sw && step >= 1;
      const excLines = own ? plainLines : range(Math.min(...hl), Math.max(...hl)).map((n) => codeLines[n - 1]);
      excPre.setAttribute('aria-label', own ? 'The unswapped call this mode makes (not the code in sgemm_row_major)' : 'The lines of sgemm_row_major this step is about');
      excPre.innerHTML = excLines.map((l) => `<span class="ln">${GG.highlightLine(l, 'cpp') || ' '}</span>`).join('');
      if (code) { code.clear(); if (!own) code.highlight(hl, step >= 4 ? 'core' : null); }
      // call line
      const a = (txt, on, bad, tail) => `<span style="white-space:nowrap"><span class="a${on ? (bad ? ' bad' : ' on') : ''}">${txt}</span>${tail == null ? ',' : tail}</span> `;
      const p = (txt) => `<span style="white-space:nowrap">${txt},</span> `;
      const on3 = step >= 3;
      callBox.innerHTML = `<span class="f">cublasSgemm</span>(${p('handle')}${p('CUBLAS_OP_N')}${p('CUBLAS_OP_N')}${a('m=' + c.m, on3, !sw)}${a('n=' + c.n, on3, !sw)}${a('k=' + c.k, on3)}${p('alpha')}${a(c.X, on3 || step === 2, !sw)}${a(String(c.ldx), on3, !sw)}${a(c.Y, on3 || step === 2, !sw)}${a(String(c.ldy), on3)}${p('beta')}${a('C', step >= 4)}${a(String(c.ldz), on3, !sw, ');')}<span class="c">// ${sw ? 'as in sgemm_row_major' : 'A and B in their natural order'}</span>`;
      sDims.set(`(${c.m}, ${c.n}, ${c.k})`);
      const narrow = w < 640;
      // matrices for each step; src(i, j) names the buffer slot a cell shows
      const colSrc = (b, ld) => (i, j) => ({ b, k: i + j * ld });
      const rowSrc = (b, cols) => (i, j) => ({ b, k: i * cols + j });
      const val = (s) => BUF[s.b][s.k];
      const OUTF = { fill: 'var(--memory)', stroke: 'var(--memory)' }; // written output: memory, solid outline
      let mats = [];
      if (step === 0) {
        mats = [
          { t: 'A', nm: 'A', s: `${M}×${K}`, r: M, c: K, src: rowSrc('A', K) },
          { op: '@' },
          { t: 'B', nm: 'B', s: `${K}×${N}`, r: K, c: N, src: rowSrc('B', N) },
          { op: '=' },
          { t: 'C', s: `${M}×${N} · wanted`, r: M, c: N, v: () => null, dim: true },
        ];
      } else if (step <= 4) {
        const xName = sw ? 'B' + TR : 'A′', yName = sw ? 'A' + TR : 'B′';
        const xTrue = (i, j) => (sw ? B[j * N + i] : A[i * K + j]); // the value that should be there
        const yTrue = (i, j) => (sw ? A[j * K + i] : B[i * N + j]);
        const xs = colSrc(c.X, c.ldx), ys = colSrc(c.Y, c.ldy);
        const st4 = step === 4;
        mats = [
          { t: st4 ? xName : `${xName} = buf ${c.X}`, nm: xName, s: st4 ? `${c.m}×${c.k}` : `${c.m}×${c.k} · ld ${c.ldx}`, r: c.m, c: c.k, src: xs, bad: sw || st4 ? null : (i, j) => val(xs(i, j)) !== xTrue(i, j) },
          { op: step === 1 ? ',' : '@' },
          { t: st4 ? yName : `${yName} = buf ${c.Y}`, nm: yName, s: st4 ? `${c.k}×${c.n}` : `${c.k}×${c.n} · ld ${c.ldy}`, r: c.k, c: c.n, src: ys, bad: sw || st4 ? null : (i, j) => val(ys(i, j)) !== yTrue(i, j) },
        ];
        if (step >= 2) {
          const cName = sw ? 'C' + TR : 'C′';
          mats.push({ op: '=' }, st4
            ? Object.assign({ t: cName, nm: cName, s: `${c.m}×${c.n} · col-major`, r: c.m, c: c.n, src: colSrc('C', c.ldz) }, OUTF)
            : { t: cName, s: `${c.m}×${c.n} · ld ${c.ldz}`, r: c.m, c: c.n, v: () => null, dim: true });
        }
      } else {
        mats = [
          Object.assign({ t: 'buf C, row-major', nm: 'C', s: `${M}×${N}`, r: M, c: N, src: rowSrc('C', N), bad: (i, j) => out[i * N + j] !== ref[i * N + j] }, OUTF),
          { op: 'vs' },
          { t: 'A @ B', s: 'computed directly', r: M, c: N, v: (i, j) => ref[i * N + j], fill: 'var(--ink-3)', stroke: 'var(--line-2)', alpha: 0.1 },
        ];
      }
      // lay out the equation row: each matrix gets a slot at least as wide as its labels
      const symW = narrow ? 22 : 36;
      const labW = (m) => Math.max(tw(m.t, 11), tw(m.s, 10)) + 6;
      const place = (cs, list) => list.reduce((tot, m) => tot + (m.op !== undefined ? symW : Math.max(m.c * cs, labW(m))), 0);
      let cs = 46;
      while (cs > 20 && place(cs, mats) > w - 4) cs--;
      const places = []; // where the hovered slot appears
      function drawRow(list, y0, cs) {
        const maxR = Math.max(...list.filter((m) => m.op === undefined).map((m) => m.r));
        let x = Math.max(0, (w - place(cs, list)) / 2);
        list.forEach((m) => {
          if (m.op !== undefined) {
            T(svg, x + symW / 2, y0 + (maxR * cs) / 2, m.op, { anchor: 'middle', fs: m.op.length > 1 ? 11 : 18, fill: 'var(--ink-2)' });
            x += symW;
            return;
          }
          const slotW = Math.max(m.c * cs, labW(m));
          const vals = m.src ? (i, j) => { const v = val(m.src(i, j)); return v == null ? '?' : String(v); } : (i, j) => { const v = m.v(i, j); return v == null ? '?' : String(v); };
          const mm = matrixSvg(svg, x, y0, m.r, m.c, cs, { vals, fs: Math.min(13, cs * 0.44), fill: m.dim ? 'var(--ink-3)' : m.fill, stroke: m.dim ? 'var(--line-2)' : m.stroke, op: m.dim ? 0.08 : m.alpha, ink: m.dim ? 'var(--ink-3)' : null });
          let hasBad = false;
          for (let i = 0; i < m.r; i++) for (let j = 0; j < m.c; j++) {
            const cell = mm.cells[i][j];
            if (m.src) {
              const s = m.src(i, j);
              cell.r.style.fillOpacity = shade(s, 0.05, 0.45);
              hit([cell.r, cell.t], s);
              if (same(s)) { cell.r.style.stroke = 'var(--accent)'; cell.r.style.strokeWidth = 2.4; places.push(`${m.nm}[${i}][${j}]`); continue; }
            }
            if (m.bad && m.bad(i, j)) { hasBad = true; cell.r.style.stroke = 'var(--danger)'; cell.r.style.strokeWidth = 2; }
          }
          T(svg, x, y0 - 20, m.t, { fs: 11, fill: hasBad ? 'var(--danger)' : m.dim ? 'var(--ink-2)' : 'var(--ink)', weight: 600 });
          T(svg, x, y0 - 7, m.s, { fs: 10, fill: 'var(--ink-3)' });
          x += slotW;
        });
        return y0 + maxR * cs;
      }
      let y = drawRow(mats, 36, cs) + 14;
      // what you wrote, kept on screen while cuBLAS's view is shown
      if (step >= 1 && step <= 4) {
        const ghost = [
          { t: 'A', nm: 'A', s: `${M}×${K}`, r: M, c: K, src: rowSrc('A', K) },
          { op: '' },
          { t: 'B', nm: 'B', s: `${K}×${N}`, r: K, c: N, src: rowSrc('B', N) },
        ];
        let cs2 = Math.min(cs, 30);
        while (cs2 > 20 && place(cs2, ghost) > w - 4) cs2--;
        T(svg, 0, y + 8, fit(['FOR COMPARISON: A AND B AS YOU WROTE THEM (row-major)', 'AS YOU WROTE THEM (row-major)'], 10, w * 0.88), { fs: 10, fill: 'var(--ink-3)', ls: '.06em' });
        y = drawRow(ghost, y + 46, cs2) + 14;
      }
      y += 16;
      // memory buffers
      const sw2 = clamp(Math.floor((w - 4) / Math.max(M * K, K * N, M * N)), 16, 34);
      const read = (b) => step >= 1 && step <= 4 && (b === c.X || b === c.Y);
      const strip = (b, title, vals, o) => {
        T(svg, 0, y + 5, title, { fs: 10, fill: 'var(--ink-3)', ls: '.06em' });
        vals.forEach((v, k) => {
          const s = { b, k };
          const hot = same(s), on = o.on;
          const r = R(svg, k * sw2, y + 14, sw2 - 2, sw2 - 2, { rx: 3, fill: o.fill || 'var(--memory)', op: o.empty ? 0.06 : shade(s, 0.05, 0.45), stroke: hot ? 'var(--accent)' : on ? 'var(--accent)' : o.stroke || 'rgba(111,166,255,.4)', sw: hot ? 2.4 : on ? 1.2 : 1 });
          const t = T(svg, k * sw2 + (sw2 - 2) / 2, y + 14 + (sw2 - 2) / 2 + 0.5, v == null ? '' : String(v), { anchor: 'middle', fs: Math.min(12, sw2 * 0.44), fill: 'var(--ink)' });
          hit([r, t], s);
        });
        y += sw2 + 30;
      };
      strip('A', `BUFFER A (${M * K} floats, row-major)`, A, { on: read('A') });
      strip('B', `BUFFER B (${K * N} floats, row-major)`, B, { on: read('B') });
      if (step >= 4) strip('C', `BUFFER C (${M * N} floats) as written by cuBLAS`, out, { on: step === 5, stroke: 'var(--memory)' });
      else strip('C', `BUFFER C (${M * N} floats), not written yet`, new Array(M * N).fill(null), { empty: true });
      sizeSvg(svg, w, y - 10);
      // verification
      let wrong = 0;
      for (let q = 0; q < M * N; q++) if (out[q] !== ref[q]) wrong++;
      if (step < 4) sCheck.set('not run yet', null);
      else sCheck.set(wrong ? `${wrong} of ${M * N} wrong` : `all ${M * N} match`, wrong ? 'danger' : 'core');
      // why
      if (hv) {
        const L = rowLen[hv.b], r = Math.floor(hv.k / L), cc = hv.k % L;
        const v = hv.b === 'C' && step < 4 ? null : val(hv);
        f.setWhy(`Slot <b>${hv.k}</b> of buffer ${hv.b} is ${hv.b}[${r}][${cc}] of the row-major matrix (${hv.k} = ${r}·${L} + ${cc})${v == null ? ', not written yet' : `, value <b>${v}</b>`}. ${places.length ? `In the picture above it is ${places.join(' and ')}.` : 'No matrix above reads it at this step.'}`);
        return;
      }
      const whySwap = [
        `You have row-major A (${M}×${K}) and B (${K}×${N}) and want C = A @ B (${M}×${N}), also row-major. cuBLAS only speaks column-major. The shading marks your rows.`,
        `cuBLAS reads buffer B column-major as ${N}×${K} with leading dimension ${N}: that is exactly B${TR}. Each row you wrote (one shade) is now a column. Buffer A, read as ${K}×${M} with leading dimension ${K}, is A${TR}. Nothing was copied.`,
        `Since C = A @ B, we have C${TR} = B${TR} @ A${TR}. So ask for B-times-A: (${N}×${K}) @ (${K}×${M}) = C${TR} (${N}×${M}).`,
        `That is the call in <code>sgemm_row_major</code>: m = N = ${N}, n = M = ${M}, k = K = ${K}, first operand B with leading dimension ${N}, second A with ${K}, output leading dimension ${N}.`,
        `cuBLAS computes C${TR} and stores it column-major, column after column, into buffer C. Each column of C${TR} lands as one run of the buffer: one row of C.`,
        wrong ? `Something is off: ${wrong} values differ.` : `Read buffer C row-major as ${M}×${N} and you get exactly A @ B: <b>all ${M * N} values match</b>. The row-major bytes of C are the column-major bytes of C${TR}.`,
      ];
      const whyPlain = [
        whySwap[0],
        `Pass A and B in their natural order and cuBLAS reads buffer A column-major as ${M}×${K} (leading dimension ${M}): a scrambled matrix, not A (red cells differ; follow the shading). Same for B.`,
        `It multiplies those scrambled matrices: A′ @ B′.`,
        `The unswapped call: m = ${M}, n = ${N}, k = ${K}, A with leading dimension ${M}, B with ${K}, C with ${M}. Valid arguments, wrong meaning.`,
        `cuBLAS writes A′ @ B′ column-major into buffer C.`,
        wrong ? `Read row-major, <b>${wrong} of ${M * N}</b> values are wrong. No error is raised: the library did what it was told.`
          : [M, K, N].filter((d) => d === 1).length >= 2
            ? `With these sizes A, B and C are vectors (or a single number), and for a vector row-major and column-major order are the same bytes, so the missing swap cannot show. Make at least two of M, K and N larger than 1.`
            : `By coincidence every value matches (try New numbers, or change the sizes).`,
      ];
      f.setWhy((sw ? whySwap : whyPlain)[step]);
    }
    return { setCode(c) { code = c; paint(); }, stepper };
  }

  GG.entry('cublas', {
    render(body, ctx) {
      const s = ctx.html(body, `
        <p><strong>cuBLAS</strong> (CUDA Basic Linear Algebra Subroutines) is NVIDIA’s high-performance implementation of the <a href="https://en.wikipedia.org/wiki/Basic_Linear_Algebra_Subprograms">Basic Linear Algebra Subprograms (BLAS)</a> standard. BLAS is a decades-old contract for the everyday verbs of linear algebra: scale and add vectors, multiply a matrix by a vector, multiply two matrices. cuBLAS is a proprietary library (NVIDIA ships compiled binaries, not source) of highly optimized <a data-term="kernel">kernels</a> that do those things on NVIDIA GPUs.</p>
        <p>The deal it offers is simple. Instead of writing and tuning common operations like matrix multiplication from scratch, you call a cuBLAS function from your host code. Behind that one function sits a wide array of kernels, each fine-tuned for particular data types (e.g. FP32, FP16), matrix sizes and <a data-term="streaming-multiprocessor-architecture">Streaming Multiprocessor (SM) architectures</a>. At run time, cuBLAS uses internal heuristics, which NVIDIA does not document (the glossary calls them “unknown”), to select the most performant kernel and its optimal launch parameters.</p>
        <div data-slot="shelf"></div>
        <p>As a result, cuBLAS is the foundation for most <a data-term="perf">high-performance</a> numerical computing on NVIDIA GPUs. Deep learning frameworks like PyTorch use it extensively to accelerate their core operations, along with more specialized kernel libraries like <a data-term="cudnn">cuDNN</a>. When you write <code>x @ w</code> on a CUDA tensor in PyTorch, the <a data-term="kernel">kernel</a> that runs very often comes from cuBLAS.</p>
        <h3>The classic trap: column-major order</h3>
        <p>The single most common source of error when using cuBLAS is the matrix data layout. <a data-term="global-memory">GPU memory</a>, like all memory, is one-dimensional, so a two-dimensional matrix must be flattened into a line of numbers, and there are two natural ways to do it (<a href="https://en.wikipedia.org/wiki/Row-_and_column-major_order">row- and column-major order</a>):</p>
        <ul>
          <li><strong>Row-major</strong>: row 0, then row 1, and so on. Element (i, j) of an M×N matrix sits at offset <code>i·N + j</code>. This is the common order in C, C++ and Python.</li>
          <li><strong>Column-major</strong>: column 0, then column 1, and so on. Element (i, j) sits at offset <code>i + j·M</code>. This is Fortran’s order.</li>
        </ul>
        <p>For historical reasons, and to stay compatible with the original BLAS standard, which was written in Fortran, cuBLAS expects matrices in column-major order: the opposite of what C, C++ and Python programmers usually have. Fig. 2 shows what that means for your bytes. Read a row-major buffer column-major and you get the transpose if you also swap the dimensions, and garbage if you do not.</p>
        <div data-slot="readings"></div>
        ${GG.noteHTML('history', `<p>The first BLAS was a set of Fortran routines published in 1979, covering vector operations (later called Level 1). Level 2 (matrix-vector, 1988) and Level 3 (matrix-matrix, 1990) followed. Fortran stores two-dimensional arrays column by column, so the BLAS interface assumes column-major storage, and cuBLAS kept that contract.</p>`, 'Beyond the glossary: why Fortran order')}
        <h3>Leading dimensions</h3>
        <p>A BLAS function needs to know more than the size of the operation (<code>M</code>, <code>N</code>, <code>K</code>). It also needs to know how to find the start of each column in memory. That is the <strong>leading dimension</strong> (e.g. <code>lda</code> for matrix A; <code>ldb</code> and <code>ldc</code> for B and C): the stride, counted in elements, between the starts of consecutive columns. Element (i, j) of A lives at <code>A[i + j·lda]</code>.</p>
        <p>When you work with an entire allocated matrix, the leading dimension is just its number of rows. The interesting case is a submatrix. Its columns are pieces of the parent’s columns, so to hop from one of its columns to the next you must skip over a whole parent column. Its leading dimension is therefore the number of rows of the larger, parent matrix it was taken from. Drag out a submatrix in Fig. 3 and watch the column starts.</p>
        <div data-slot="lda"></div>
        ${GG.noteHTML('intuition', `<p>Think of a bookshelf where every shelf (column) holds <code>lda</code> books. A submatrix is a few books on each of a few consecutive shelves. To find the same spot on the next shelf you move along exactly one shelf’s worth, <code>lda</code>, no matter how many books you are borrowing from each.</p>`)}
        <h3>The transpose trick: row-major GEMM without copying</h3>
        <p>So must every row-major matrix be reordered before calling cuBLAS? For computationally intensive kernels like GEMM (GEneral Matrix Multiplication), no. Two facts combine:</p>
        <ol>
          <li>The identity: if <code>C = A @ B</code>, then <code>C^T = B^T @ A^T</code>.</li>
          <li>A matrix stored in row-major order has exactly the same memory layout as its transpose stored in column-major order. (You saw this in Fig. 2: same bytes, rows became columns.)</li>
        </ol>
        <p>So we provide our row-major matrices <code>A</code> and <code>B</code> to cuBLAS but swap their order in the function call, along with their dimensions. cuBLAS reads B’s bytes as B<sup>T</sup> and A’s as A<sup>T</sup>, computes B<sup>T</sup> @ A<sup>T</sup> = C<sup>T</sup>, and writes it out in column-major order. That block of memory, interpreted in row-major order, is exactly the matrix C we want. No data was moved. Fig. 4 runs the trick on real numbers, and lets you try the call without the swap.</p>
        <div data-slot="trick"></div>
        <p>The glossary packages the technique as a function. Hover a line with a dot for notes; the steps of Fig. 4 also light up the lines they correspond to.</p>
        <div data-slot="code"></div>
        <p>A complete, runnable version of this example is available on <a href="https://godbolt.org/z/axzYb75ro">Godbolt</a>.</p>
        <p>The <code>CUBLAS_OP_N</code> flag instructs the kernel to use the matrices as provided, without an additional transpose operation from its perspective. (“N” is for “no transpose”; cuBLAS also accepts <code>CUBLAS_OP_T</code>, transpose, and <code>CUBLAS_OP_C</code>, conjugate transpose, but the trick does not need them.)</p>
        ${GG.noteHTML('beyond', `<p><b>Reading the name.</b> BLAS routine names encode the precision and the operation. In <code>cublasSgemm</code>, <code>S</code> means single precision (FP32; <code>D</code> is double, <code>C</code> single-precision complex, <code>Z</code> double-precision complex, and cuBLAS adds <code>H</code> for half precision in <code>cublasHgemm</code>). <code>gemm</code> is GEneral Matrix Multiply, which computes C = α·op(A)·op(B) + β·C, where op is “as is”, transpose or conjugate transpose. With β = 0 the old contents of C are ignored; with β = 1 the product is added to them.</p>`)}
        <h3>Building against cuBLAS</h3>
        <p>cuBLAS is a separate library, so to use it the program must be linked against it, e.g. using the flag <code>-lcublas</code> when compiling with <a data-term="nvcc">nvcc</a>. Its functions are exposed via the <code>cublas_v2.h</code> header.</p>
        <div data-slot="build"></div>
        <p>Fig. 5 places the library in the CUDA software stack: your program calls cuBLAS, and cuBLAS in turn calls the CUDA Runtime API in <code>libcudart.so</code>, which sits on the Driver API in <code>libcuda.so</code>.</p>
        <div data-slot="platform"></div>
        <p>For more information on cuBLAS, see the <a href="https://docs.nvidia.com/cuda/cublas/">official cuBLAS documentation</a>.</p>
        <div data-slot="reading"></div>
      `);
      guard(() => figShelf(ctx, s.shelf));
      guard(() => figReadings(ctx, s.readings));
      guard(() => figLda(ctx, s.lda));
      let trick = null;
      guard(() => { trick = figTrick(ctx, s.trick); });
      guard(() => {
        const L = (n) => lineOf(SGEMM_CODE, n);
        const notes = {};
        notes[L('#include')] = 'The header for cuBLAS’s current, handle-based API. Including it declares the functions; you still have to link the library with <code>-lcublas</code>.';
        notes[L('// performs')] = 'The full GEMM contract: C = α·A@B + β·C. α scales the product; β scales whatever C already held (β = 0 ignores it).';
        notes[L('void sgemm_row_major')] = '<code>cublasHandle_t</code> carries cuBLAS’s state (create it once with <code>cublasCreate</code> and reuse it). <code>M</code>, <code>N</code>, <code>K</code> are the row-major sizes: A is M×K, B is K×N, C is M×N.';
        notes[L('const float *alpha')] = 'α and β are passed by pointer. By default cuBLAS reads them from host memory; its pointer mode can be switched so they are read from device memory instead.';
        notes[L('const float *A, const float *B')] = 'Device pointers to the row-major buffers. Nothing in this function copies or reorders them.';
        notes[L('// A is M x K')] = 'Row-major A, read column-major, is A<sup>T</sup>: a K×M matrix whose columns are K elements apart.';
        notes[L('// B is K x N')] = 'Likewise B’s buffer looks like B<sup>T</sup>, N×K, with leading dimension N.';
        notes[L('// C is M x N')] = 'And C’s buffer, read column-major, is C<sup>T</sup>, N×M, leading dimension N. So if cuBLAS writes C<sup>T</sup> there, we get C.';
        notes[L('// note the swapped')] = 'The whole trick in one line: C<sup>T</sup> = B<sup>T</sup>·A<sup>T</sup>, so B goes first and the output is N×M.';
        notes[L('cublasSgemm(handle')] = 'Two <code>CUBLAS_OP_N</code>: use both operands as provided, no transpose from cuBLAS’s point of view. (The call returns a <code>cublasStatus_t</code>, which real code should check.)';
        notes[L('N, M, K,')] = 'cuBLAS’s (m, n, k) = (N, M, K): an N×M result with inner dimension K.';
        notes[L('B, N,')] = 'First operand: B’s buffer, seen as B<sup>T</sup> (N×K). Its leading dimension must be at least m = N, and it is exactly N.';
        notes[L('A, K,')] = 'Second operand: A’s buffer, seen as A<sup>T</sup> (K×M), leading dimension K.';
        notes[L('C, N);')] = 'Output: cuBLAS writes C<sup>T</sup> (N×M) column-major with leading dimension N. Those bytes, read row-major, are C.';
        const code = codeAt(ctx, s.code, { lang: 'cpp', code: SGEMM_CODE, caption: 'sgemm_row_major: row-major GEMM on a column-major library', notes, wide: true });
        if (trick) trick.setCode(code);
      });
      guard(() => codeAt(ctx, s.build, { lang: 'shell', code: 'nvcc sgemm_row_major.cu -o sgemm_row_major -lcublas', caption: 'an example build line (the file name is ours)', lineNumbers: false }));
      guard(() => figPlatform(ctx, s.platform, {
        title: 'Where {cuBLAS} sits', files: true,
        caption: 'The CUDA Toolkit stack with the CUDA Libraries layer lit and the Linux files of the layers below it named. <code>-lcublas</code> links your program against the cuBLAS library; cuBLAS itself is built on the CUDA Runtime API.',
        why: 'cuBLAS is one of the <b>CUDA Libraries</b>: host code calls it, and it calls the CUDA Runtime API (<code>libcudart.so</code>), which calls the Driver API (<code>libcuda.so</code>) and the kernel-mode driver below. Hover a layer to see what it does.',
      }));
      ctx.reading(s.reading, [
        { href: 'https://en.wikipedia.org/wiki/Basic_Linear_Algebra_Subprograms', label: 'Basic Linear Algebra Subprograms', note: 'Wikipedia on the BLAS standard and its levels' },
        { href: 'https://en.wikipedia.org/wiki/Row-_and_column-major_order', label: 'Row- and column-major order', note: 'Wikipedia' },
        { href: 'https://godbolt.org/z/axzYb75ro', label: 'sgemm_row_major on Godbolt', note: 'the complete, runnable example' },
        { href: 'https://docs.nvidia.com/cuda/cublas/', label: 'cuBLAS documentation', note: 'NVIDIA' },
      ]);
      keepCase(body);
    },
  });

  /* ═════════════════════════════════════════════════════════════
     cuDNN
     ═════════════════════════════════════════════════════════════ */

  /* Fig: who handles which layer */
  function figRouting(ctx, slot) {
    const f = fig(ctx, slot, {
      title: 'Who handles which layer', hint: 'pick a layer', wide: true,
      caption: 'The typical division of labour: cuBLAS for general-purpose linear algebra, cuDNN for specialized deep-learning primitives. It is a tendency, not a rule: frameworks also ship kernels of their own and can choose between backends.',
    });
    const OPS = [
      { v: 'dense', label: 'Dense layer', lib: 'cublas', cat: 'matmul', why: 'A dense (fully-connected) layer is one big matrix multiplication, <code>y = x·Wᵀ + b</code>. That is general-purpose linear algebra, which frameworks like PyTorch typically hand to <b>cuBLAS</b>.' },
      { v: 'conv', label: 'Convolution', lib: 'cudnn', cat: 'conv', why: 'Convolutional layers are a deep-learning specialty. Frameworks rely on <b>cuDNN</b> for them; accelerating convolutional networks was cuDNN’s claim to fame.' },
      { v: 'norm', label: 'Normalization', lib: 'cudnn', cat: 'norm', why: 'Normalization routines (batch, layer and other normalizations) are among the specialized primitives frameworks lean on <b>cuDNN</b> for.' },
      { v: 'attn', label: 'Attention', lib: 'cudnn', cat: 'attn', why: 'Attention mechanisms, including scaled dot-product attention (the fused “Flash Attention” style of kernel), are available as <b>cuDNN</b> primitives.' },
    ];
    const CAT = [
      { k: 'conv', t: ['Convolution'] }, { k: 'attn', t: ['Self-attention (SDPA)', 'Attention (SDPA)', 'Attention'] }, { k: 'matmul', t: ['Matrix multiplication', 'Matmul'] },
      { k: 'norm', t: ['Normalizations', 'Norms'] }, { k: 'pool', t: ['Poolings', 'Pooling'] }, { k: 'etc', t: ['…'] },
    ];
    const st = { op: 'conv' };
    const segCtl = GG.ui.seg(f.controls, { label: 'Layer in a {PyTorch} model', options: OPS.map((o) => ({ value: o.v, label: o.label })), value: st.op, onChange: (v) => { st.op = v; lay.rebuild(); } });
    const sLib = GG.ui.stat(f.readouts, { label: 'Library', tone: 'core' });
    const svg = svgRoot(f.stage, 'Diagram: a PyTorch model’s layers route to cuBLAS or cuDNN, which sit on the CUDA runtime and driver above the GPU.');
    const lay = responsive(f.stage, (w) => {
      clear(svg);
      const op = OPS.find((o) => o.v === st.op);
      const narrow = w < 560;
      // framework box
      const fh = narrow ? 92 : 74;
      R(svg, 0, 0, w, fh, { rx: 10, fill: 'var(--host)', op: 0.08, stroke: 'rgba(184,164,255,.5)' });
      T(svg, 12, 15, 'PyTorch MODEL (runs on the host, launches work on the GPU)', { fs: 10, fill: 'var(--host)' }).textContent = fit(['PyTorch MODEL (runs on the host, launches work on the GPU)', 'PyTorch MODEL (host)'], 10, w - 24);
      const chipW = narrow ? (w - 24 - 8) / 2 : (w - 24 - 3 * 10) / 4;
      const chipPos = {};
      OPS.forEach((o, k) => {
        const cx = narrow ? 12 + (k % 2) * (chipW + 8) : 12 + k * (chipW + 10);
        const cy = narrow ? 28 + Math.floor(k / 2) * 30 : 30;
        const on = o.v === st.op;
        const g = G(svg, { class: 'hsc-hit' });
        R(g, cx, cy, chipW, 26, { rx: 7, fill: on ? 'var(--host)' : 'var(--surface-3)', op: on ? 0.3 : 1, stroke: on ? 'var(--host)' : 'var(--line-2)', sw: on ? 1.5 : 1 });
        T(g, cx + chipW / 2, cy + 13.5, o.label, { anchor: 'middle', fs: 11.5, fill: on ? 'var(--ink)' : 'var(--ink-2)' });
        g.addEventListener('click', () => { st.op = o.v; segCtl.set(o.v); lay.rebuild(); });
        chipPos[o.v] = { x: cx + chipW / 2, y: fh };
      });
      // libraries
      const ly = fh + 44;
      const gap = 16;
      const lw = (w - gap) / 2;
      const catRows = narrow ? 6 : 3;
      const lh = (narrow ? 44 + catRows * 24 : 44 + catRows * 28) + 10;
      const boxes = { cublas: { x: 0, w: lw }, cudnn: { x: lw + gap, w: lw } };
      ['cublas', 'cudnn'].forEach((k) => {
        const b = boxes[k], on = op.lib === k;
        R(svg, b.x, ly, b.w, lh, { rx: 12, fill: 'var(--core)', op: on ? 0.12 : 0.04, stroke: on ? 'var(--core)' : 'rgba(69,212,155,.25)', sw: on ? 1.6 : 1 });
        T(svg, b.x + 12, ly + 18, k === 'cublas' ? 'cuBLAS' : 'cuDNN', { fs: 14, fill: on ? 'var(--ink)' : 'var(--ink-2)', weight: 700, font: 'var(--font-body)' });
        T(svg, b.x + 12, ly + 36, fit(k === 'cublas' ? ['general-purpose linear algebra', 'linear algebra'] : ['deep-learning primitives', 'DNN primitives'], 10.5, b.w - 24), { fs: 10.5, fill: 'var(--ink-3)' });
      });
      // cuBLAS contents
      const bl = boxes.cublas;
      const blItems = [['GEMM (matrix multiply)', 'GEMM (matmul)', 'GEMM'], ['matrix-vector, vector ops', 'GEMV, vector ops', 'GEMV …'], ['the rest of BLAS', 'rest of BLAS']];
      blItems.forEach((t, k) => {
        const on = op.lib === 'cublas' && k === 0;
        const yy = ly + 48 + k * (narrow ? 24 : 28);
        R(svg, bl.x + 10, yy, bl.w - 20, narrow ? 20 : 22, { rx: 5, fill: on ? 'var(--core)' : 'var(--surface-3)', op: on ? 0.3 : 0.9, stroke: on ? 'var(--core)' : 'var(--line)' });
        T(svg, bl.x + 18, yy + (narrow ? 10 : 11), fit(t, 10.5, bl.w - 36), { fs: 10.5, fill: on ? 'var(--ink)' : 'var(--ink-2)' });
      });
      // cuDNN catalogue
      const dn = boxes.cudnn;
      const cols = narrow ? 1 : 2;
      const cw = (dn.w - 20 - (cols - 1) * 6) / cols;
      CAT.forEach((c, k) => {
        const on = op.lib === 'cudnn' && c.k === op.cat;
        const cx = dn.x + 10 + (k % cols) * (cw + 6), yy = ly + 48 + Math.floor(k / cols) * (narrow ? 24 : 28);
        R(svg, cx, yy, cw, narrow ? 20 : 22, { rx: 5, fill: on ? 'var(--core)' : 'var(--surface-3)', op: on ? 0.3 : 0.9, stroke: on ? 'var(--core)' : 'var(--line)' });
        T(svg, cx + 8, yy + (narrow ? 10 : 11), fit(c.t, 10.5, cw - 14), { fs: 10.5, fill: on ? 'var(--ink)' : 'var(--ink-2)' });
      });
      // route arrow
      const from = chipPos[op.v];
      const tb = boxes[op.lib];
      const tx = tb.x + tb.w / 2;
      const midY = fh + 22;
      Pth(svg, `M${r1(from.x)},${r1(from.y + 1)} L${r1(from.x)},${r1(midY)} L${r1(tx)},${r1(midY)} L${r1(tx)},${r1(ly - 9)}`, { stroke: 'var(--accent)', sw: 1.8 });
      Arrow(svg, tx, ly - 12, tx, ly - 2, { stroke: 'var(--accent)', sw: 1.8 });
      // platform + GPU
      const py = ly + lh + 30;
      Arrow(svg, tx, ly + lh + 2, tx, py - 2, { stroke: 'var(--core)' });
      R(svg, 0, py, w, 32, { rx: 8, fill: 'var(--surface-2)', stroke: 'var(--line-2)' });
      T(svg, 12, py + 16, fit(['CUDA Runtime API · CUDA Driver API · GPU driver', 'CUDA runtime & driver'], 10.5, w - 24), { fs: 10.5, fill: 'var(--ink-2)' });
      const gy = py + 44;
      Arrow(svg, w / 2, py + 33, w / 2, gy - 2, { stroke: 'var(--ink-3)' });
      R(svg, 0, gy, w, 34, { rx: 8, fill: 'var(--core)', op: 0.07, stroke: 'rgba(69,212,155,.35)' });
      T(svg, 12, gy + 17, fit([`GPU: the chosen ${op.lib === 'cublas' ? 'cuBLAS' : 'cuDNN'} kernel runs here`, 'GPU'], 10.5, w - 24), { fs: 10.5, fill: 'var(--core)' });
      sizeSvg(svg, w, gy + 36);
      sLib.set(op.lib === 'cublas' ? 'cuBLAS' : 'cuDNN');
      f.setWhy(op.why);
    });
  }

  /* Fig: cuDNN Graph API vs CUDA Graphs */
  function figGraphs(ctx, slot) {
    const f = fig(ctx, slot, {
      title: 'Two different “graphs”', hint: 'as written vs optimized', wide: true,
      caption: 'The first panel is a cuDNN operation graph: nodes are operations, edges are tensors, and cuDNN may fuse nodes into fewer kernels. The second is a CUDA Graph: nodes are kernel launches (here the two from the <a data-term="cuda-graph">CUDA Graph</a> entry’s example), recorded so the host can submit them all at once. The kernels themselves are unchanged.',
    });
    const st = { phase: 0 };
    GG.ui.seg(f.controls, { label: 'Stage', options: [{ value: 0, label: 'as written' }, { value: 1, label: 'optimized' }], value: 0, onChange: (v) => { st.phase = v; lay.rebuild(); } });
    const sK = GG.ui.stat(f.readouts, { label: '{cuDNN}: kernels', tone: 'core' });
    const sH = GG.ui.stat(f.readouts, { label: 'CUDA Graph: host submissions', tone: 'host' });
    const svg = svgRoot(f.stage, 'Side by side: a cuDNN operation graph of convolution, bias and ReLU that fuses into one kernel, and a CUDA Graph of two kernel launches that the host submits in one go.');
    const lay = responsive(f.stage, (w) => {
      clear(svg);
      const narrow = w < 600;
      const pw = narrow ? w : (w - 20) / 2;
      const ph = 230;
      const panels = narrow ? [{ x: 0, y: 0 }, { x: 0, y: ph + 16 }] : [{ x: 0, y: 0 }, { x: pw + 20, y: 0 }];
      const opt = st.phase === 1;
      // ── left: cuDNN operation graph
      {
        const { x, y } = panels[0];
        R(svg, x, y, pw, ph, { rx: 12, fill: 'var(--surface)', stroke: 'var(--line)' });
        T(svg, x + 12, y + 16, 'cuDNN GRAPH API', { fs: 10.5, fill: 'var(--ink)', weight: 600 });
        T(svg, x + 12, y + 32, fit(['nodes = operations · edges = tensors', 'nodes: ops · edges: tensors'], 10, pw - 24), { fs: 10, fill: 'var(--ink-3)' });
        const nodes = ['Conv', 'Bias', 'ReLU'];
        const nw = Math.min(80, (pw - 60) / 3.6), nh = 34;
        const ny = y + 112;
        const gapN = (pw - 24 - 3 * nw) / 2;
        const nx = (k) => x + 12 + k * (nw + gapN);
        if (!opt) {
          nodes.forEach((n, k) => {
            R(svg, nx(k), ny, nw, nh, { rx: 8, fill: 'var(--core)', op: 0.14, stroke: 'var(--core)' });
            T(svg, nx(k) + nw / 2, ny + nh / 2, n, { anchor: 'middle', fs: 12, fill: 'var(--ink)' });
            if (k < 2) {
              Arrow(svg, nx(k) + nw + 2, ny + nh / 2, nx(k + 1) - 3, ny + nh / 2, { stroke: 'var(--memory)' });
              T(svg, (nx(k) + nw + nx(k + 1)) / 2, ny + nh / 2 - 11, k === 0 ? 'T1' : 'T2', { anchor: 'middle', fs: 10.5, fill: 'var(--memory)' });
            }
          });
          // inputs
          Arrow(svg, nx(0) + nw / 2 - 12, ny - 34, nx(0) + nw / 2 - 12, ny - 3, { stroke: 'var(--memory)' });
          T(svg, nx(0) + nw / 2 - 12, ny - 42, 'X', { anchor: 'middle', fs: 11, fill: 'var(--memory)' });
          Arrow(svg, nx(0) + nw / 2 + 12, ny - 34, nx(0) + nw / 2 + 12, ny - 3, { stroke: 'var(--memory)' });
          T(svg, nx(0) + nw / 2 + 12, ny - 42, 'W', { anchor: 'middle', fs: 11, fill: 'var(--memory)' });
          Arrow(svg, nx(1) + nw / 2, ny - 34, nx(1) + nw / 2, ny - 3, { stroke: 'var(--memory)' });
          T(svg, nx(1) + nw / 2, ny - 42, 'b', { anchor: 'middle', fs: 11, fill: 'var(--memory)' });
          Arrow(svg, nx(2) + nw / 2, ny + nh + 2, nx(2) + nw / 2, ny + nh + 30, { stroke: 'var(--memory)' });
          T(svg, nx(2) + nw / 2, ny + nh + 40, 'Y', { anchor: 'middle', fs: 11, fill: 'var(--memory)' });
          T(svg, x + 12, y + ph - 16, fit(['you declare what to compute; nothing has run yet', 'declared, not yet run'], 10, pw - 24), { fs: 10, fill: 'var(--ink-3)' });
        } else {
          const fx = x + 12, fw = pw - 24;
          R(svg, fx, ny - 6, fw, nh + 12, { rx: 10, fill: 'var(--core)', op: 0.2, stroke: 'var(--core)', sw: 1.6 });
          T(svg, fx + fw / 2, ny + nh / 2 - 6, fit(['Conv + Bias + ReLU', 'Conv+Bias+ReLU'], 12, fw - 10), { anchor: 'middle', fs: 12, fill: 'var(--ink)', weight: 600 });
          T(svg, fx + fw / 2, ny + nh / 2 + 10, fit(['one fused kernel · T1, T2 stay on chip', 'one fused kernel'], 10, fw - 10), { anchor: 'middle', fs: 10, fill: 'var(--core)' });
          [['X', -14], ['W', 0], ['b', 14]].forEach(([n, dx]) => {
            Arrow(svg, fx + fw / 2 + dx * 1.6, ny - 40, fx + fw / 2 + dx * 1.6, ny - 9, { stroke: 'var(--memory)' });
            T(svg, fx + fw / 2 + dx * 1.6, ny - 48, n, { anchor: 'middle', fs: 11, fill: 'var(--memory)' });
          });
          Arrow(svg, fx + fw / 2, ny + nh + 8, fx + fw / 2, ny + nh + 30, { stroke: 'var(--memory)' });
          T(svg, fx + fw / 2, ny + nh + 40, 'Y', { anchor: 'middle', fs: 11, fill: 'var(--memory)' });
          T(svg, x + 12, y + ph - 16, fit(['cuDNN analyzed the graph and changed WHAT runs', 'changes what runs'], 10, pw - 24), { fs: 10, fill: 'var(--core)' });
        }
      }
      // ── right: CUDA Graph
      {
        const { x, y } = panels[1];
        R(svg, x, y, pw, ph, { rx: 12, fill: 'var(--surface)', stroke: 'var(--line)' });
        T(svg, x + 12, y + 16, 'CUDA GRAPH', { fs: 10.5, fill: 'var(--ink)', weight: 600 });
        T(svg, x + 12, y + 32, fit(['nodes = kernel launches · edges = dependencies', 'nodes: launches · edges: deps'], 10, pw - 24), { fs: 10, fill: 'var(--ink-3)' });
        const hostY = y + 50, hostH = 26;
        R(svg, x + 12, hostY, pw - 24, hostH, { rx: 7, fill: 'var(--host)', op: 0.12, stroke: 'rgba(184,164,255,.5)' });
        T(svg, x + 22, hostY + 13, fit(['host (CPU)', 'host'], 10.5, pw - 44), { fs: 10.5, fill: 'var(--host)' });
        const ks = ['kernelGemm', 'kernelEpilogue'];
        const kw = Math.min(124, (pw - 60) / 2), kh = 34;
        const ky = y + 136;
        const kx = (k) => x + 12 + k * (pw - 24 - kw);
        if (opt) R(svg, x + 8, ky - 10, pw - 16, kh + 20, { rx: 12, fill: 'none', stroke: 'var(--host)', dash: '5 4', sw: 1.3 });
        ks.forEach((n, k) => {
          R(svg, kx(k), ky, kw, kh, { rx: 8, fill: 'var(--core)', op: 0.14, stroke: 'var(--core)' });
          T(svg, kx(k) + kw / 2, ky + kh / 2, fit([n, n.replace('kernel', 'k.')], 11, kw - 8), { anchor: 'middle', fs: 11, fill: 'var(--ink)' });
          if (!opt) {
            Arrow(svg, kx(k) + kw / 2, hostY + hostH + 2, kx(k) + kw / 2, ky - 3, { stroke: 'var(--host)' });
            T(svg, kx(k) + kw / 2 + 6, (hostY + hostH + ky) / 2, fit(['launch ' + (k + 1), String(k + 1)], 10, kw / 2), { fs: 10, fill: 'var(--host)' });
          }
        });
        Arrow(svg, kx(0) + kw + 2, ky + kh / 2, kx(1) - 3, ky + kh / 2, { stroke: 'var(--ink-3)' });
        if (opt) {
          Arrow(svg, x + pw / 2, hostY + hostH + 2, x + pw / 2, ky - 13, { stroke: 'var(--host)', sw: 2 });
          T(svg, x + pw / 2 + 6, (hostY + hostH + ky - 12) / 2, fit(['one cudaGraphLaunch', 'one launch'], 10, pw / 2 - 10), { fs: 10, fill: 'var(--host)' });
        }
        T(svg, x + 12, y + ph - 16, fit([opt ? 'same kernels, submitted at once: changes HOW work is launched' : 'each launch costs the host microseconds', opt ? 'changes how work is launched' : 'one launch at a time'], 10, pw - 24), { fs: 10, fill: opt ? 'var(--host)' : 'var(--ink-3)' });
      }
      sizeSvg(svg, w, narrow ? 2 * ph + 16 : ph);
      sK.set(opt ? '1 (fused)' : '3');
      sH.set(opt ? '1' : '2');
      f.setWhy(opt
        ? 'After optimization the two graphs have done different things. cuDNN <b>fused</b> three operations into <b>one kernel</b>, so less data moves. The CUDA Graph still runs <b>both kernels</b>, but the host submits them with a <b>single launch</b>, cutting launch overhead.'
        : 'Both are “graphs”, of different things. A cuDNN operation graph describes <b>operations on tensors</b>, before any kernel exists. A CUDA Graph records <b>kernel launches that already exist</b>, so they can be replayed together.');
    });
  }

  /* Fig: operation fusion, with traffic computed from the tensor sizes */
  function figFusion(ctx, slot) {
    const f = fig(ctx, slot, {
      title: 'Operation fusion: Conv → Bias → {ReLU}', hint: 'play · switch modes · change the batch', wide: true, class: 'hsc-compact',
      caption: 'Tensors are N × 64 × 56 × 56 activations; the convolution is 3 × 3, 64 → 64 channels, with padding so its output has the input’s shape. Traffic counts every tensor a kernel reads from or writes to global memory. It is an idealized model: it ignores the L2 cache (H100’s is 50 MiB, which NVIDIA writes as “50 MB”; it can catch some of the round trips when tensors are small enough, and the explanation notes when a single tensor would fit) and the convolution’s own compute time. Times assume H100’s 3.35 TB/s. The animation plays once; press Play to replay it.',
    });
    const Cc = 64, Hh = 56, Ww = 56;
    // one pass of the animation, then it holds the "done" state (under reduced motion it starts there)
    const st = { mode: 'unfused', batch: 128, dt: 2, t: GG.reducedMotion ? 1e9 : 0, phase: -1 };
    const BW = 3.35e12, L2 = 50 * 1024 * 1024; // 50 MiB (NVIDIA: "50 MB")
    // under reduced motion a mode switch shows the new mode's Done state; otherwise it plays the new mode once
    const replay = () => { st.phase = -1; if (GG.reducedMotion) { st.t = 1e9; frame(); } else { st.t = 0; anim.start(); pb.sync(); } };
    GG.ui.seg(f.controls, { label: 'Run as', options: [{ value: 'unfused', label: '3 separate kernels' }, { value: 'fused', label: '1 fused kernel' }], value: st.mode, onChange: (v) => { st.mode = v; st.phase = -1; lay.rebuild(); replay(); } });
    GG.ui.slider(f.controls, { label: 'Batch size N', min: 1, max: 256, value: st.batch, onInput: (v) => { st.batch = v; st.phase = -1; lay.rebuild(); } });
    GG.ui.seg(f.controls, { label: 'Data type', options: [{ value: 2, label: 'FP16' }, { value: 4, label: 'FP32' }], value: st.dt, onChange: (v) => { st.dt = v; st.phase = -1; lay.rebuild(); } });
    const sL = GG.ui.stat(f.readouts, { label: 'Kernel launches', tone: 'core' });
    const sT = GG.ui.stat(f.readouts, { label: 'Global-memory traffic', tone: 'memory' });
    const sU = GG.ui.stat(f.readouts, { label: 'Time at {3.35 TB/s}', tone: 'memory' });
    const sR = GG.ui.stat(f.readouts, { label: 'Fusion saves', tone: 'accent' });
    const svg = svgRoot(f.stage, 'Animated diagram: tensors in global memory flow to and from an SM. Unfused, three kernels write and re-read intermediates T1 and T2; fused, one kernel keeps them on chip, a tile at a time.');

    function model() {
      const S = st.batch * Cc * Hh * Ww * st.dt, Wb = Cc * Cc * 9 * st.dt, bb = Cc * st.dt;
      const unf = [
        { name: 'Conv', reads: [['X', S], ['W', Wb]], writes: [['T1', S]] },
        { name: 'Bias', reads: [['T1', S], ['b', bb]], writes: [['T2', S]] },
        { name: 'ReLU', reads: [['T2', S]], writes: [['Y', S]] },
      ];
      const fus = [{ name: 'Conv + Bias + ReLU', reads: [['X', S], ['W', Wb], ['b', bb]], writes: [['Y', S]] }];
      const kb = (k) => [...k.reads, ...k.writes].reduce((u, x) => u + x[1], 0);
      unf.forEach((k) => { k.bytes = kb(k); });
      fus.forEach((k) => { k.bytes = kb(k); });
      const U = unf.reduce((s, k) => s + k.bytes, 0), F = fus[0].bytes;
      return { S, Wb, bb, unf, fus, U, F };
    }
    let E = null;
    const LOOP_U = 15, HOLD = 0.4; // seconds for the three unfused kernels (about 5 s each)
    const pool = [];
    const anim = GG.anim(f.stage, (t, dt) => {
      st.t += dt;
      const active = (st.mode === 'fused' && E ? E.m.F / E.m.U : 1) * LOOP_U;
      if (st.t > active + HOLD) { anim.stop(); pb.sync(); }
      frame();
    });
    const lay = responsive(f.stage, (w) => {
      clear(svg); pool.length = 0;
      const m = model();
      const narrow = w < 560;
      const fused = st.mode === 'fused';
      // HBM band
      const hbmY = 0, hbmH = narrow ? 78 : 74;
      R(svg, 0, hbmY, w, hbmH, { rx: 12, fill: 'var(--memory)', op: 0.06, stroke: 'rgba(111,166,255,.35)' });
      T(svg, 12, hbmY + 14, fit(['GLOBAL MEMORY (HBM, off-chip)', 'GLOBAL MEMORY (HBM)'], 10, w - 24), { fs: 10, fill: 'var(--memory)' });
      const names = ['X', 'W', 'b', 'T1', 'T2', 'Y'];
      const small = { W: 30, b: 22 };
      const inner = w - 24, gapT = narrow ? 5 : 10;
      const bigW = (inner - small.W - small.b - gapT * 5) / 4;
      const boxes = {};
      let bx = 12;
      names.forEach((n) => {
        const bw = small[n] || bigW;
        boxes[n] = { x: bx, w: bw, y: hbmY + 26, h: hbmH - 36 };
        bx += bw + gapT;
      });
      const tensorEls = {};
      names.forEach((n) => {
        const b = boxes[n];
        const ghost = fused && (n === 'T1' || n === 'T2');
        const g = G(svg);
        const base = R(g, b.x, b.y, b.w, b.h, { rx: 6, fill: 'var(--memory)', op: ghost ? 0 : 0.12, stroke: ghost ? 'var(--line-2)' : 'rgba(111,166,255,.6)', dash: ghost ? '4 3' : null });
        const fill = R(g, b.x, b.y, 0, b.h, { rx: 6, fill: 'var(--memory)', op: 0.45 });
        T(g, b.x + b.w / 2, b.y + (small[n] ? b.h / 2 : b.h / 2 - 6), n, { anchor: 'middle', fs: 12, fill: ghost ? 'var(--ink-3)' : 'var(--ink)', weight: 600 });
        if (!small[n]) T(g, b.x + b.w / 2, b.y + b.h / 2 + 9, ghost ? fit(['never stored', 'not stored', '—'], 10, b.w - 4) : fit([GG.fmt.si(m.S, 'B', 1), GG.fmt.si(m.S, 'B', 0)], 10, b.w - 4), { anchor: 'middle', fs: 10, fill: ghost ? 'var(--ink-3)' : 'var(--ink)' });
        tensorEls[n] = { base, fill, ghost };
      });
      // SM band
      const smY = hbmY + hbmH + (narrow ? 64 : 70), smH = 74;
      R(svg, 0, smY, w, smH, { rx: 12, fill: 'var(--core)', op: 0.05, stroke: 'rgba(69,212,155,.35)' });
      T(svg, 12, smY + 14, fit(['SM (on-chip): cores, registers, shared memory', 'SM (on-chip)'], 10, w - 24), { fs: 10, fill: 'var(--core)' });
      const coreBox = { x: 12, y: smY + 24, w: (w - 36) * 0.45, h: smH - 34 };
      const smemBox = { x: 24 + (w - 36) * 0.45, y: smY + 24, w: (w - 36) * 0.55, h: smH - 34 };
      R(svg, coreBox.x, coreBox.y, coreBox.w, coreBox.h, { rx: 7, fill: 'var(--core)', op: 0.14, stroke: 'rgba(69,212,155,.6)' });
      const kLab = T(svg, coreBox.x + coreBox.w / 2, coreBox.y + coreBox.h / 2, '', { anchor: 'middle', fs: 11, fill: 'var(--ink)' });
      R(svg, smemBox.x, smemBox.y, smemBox.w, smemBox.h, { rx: 7, fill: 'var(--memory)', op: 0.1, stroke: 'rgba(111,166,255,.55)' });
      T(svg, smemBox.x + 8, smemBox.y + 10, fit(['on-chip storage: registers, shared memory', 'registers, shared memory', 'on-chip storage'], 10, smemBox.w - 12), { fs: 10, fill: 'var(--memory)' });
      const smChips = [];
      if (fused) ['T1', 'T2'].forEach((n, k) => {
        const cw = Math.min(64, (smemBox.w - 30) / 2);
        const cx = smemBox.x + 10 + k * (cw + 8), cy = smemBox.y + 18;
        const r = R(svg, cx, cy, cw, smemBox.h - 24, { rx: 5, fill: 'var(--memory)', op: 0.2, stroke: 'var(--memory)' });
        T(svg, cx + cw / 2, cy + (smemBox.h - 24) / 2, fit([n + ' tile', n], 10.5, cw - 4), { anchor: 'middle', fs: 10.5, fill: 'var(--ink)' });
        smChips.push(r);
      });
      else T(svg, smemBox.x + smemBox.w / 2, smemBox.y + smemBox.h / 2 + 5, fit(['(unused between kernels)', 'unused'], 10, smemBox.w - 10), { anchor: 'middle', fs: 10, fill: 'var(--ink-3)' });
      // flow guides (static lines from each tensor to the SM)
      const flowX = (n) => clamp(boxes[n].x + boxes[n].w / 2, 16, w - 16);
      const guides = {}, heads = {};
      names.forEach((n) => {
        const x = flowX(n), yT = boxes[n].y + boxes[n].h + 2, yB = smY - 2;
        guides[n] = Ln(svg, x, yT, x, yB, { stroke: 'var(--line)', sw: 1.2, dash: '2 4' });
        heads[n] = {
          down: Pth(svg, `M${r1(x)},${r1(yB)} L${r1(x - 5)},${r1(yB - 8)} L${r1(x + 5)},${r1(yB - 8)} Z`, { fill: 'var(--memory)' }),
          up: Pth(svg, `M${r1(x)},${r1(yT)} L${r1(x - 5)},${r1(yT + 8)} L${r1(x + 5)},${r1(yT + 8)} Z`, { fill: 'var(--bg)', stroke: 'var(--memory)', sw: 1.3 }),
        };
        heads[n].down.style.opacity = 0; heads[n].up.style.opacity = 0;
      });
      // particle pool
      const pg = G(svg);
      for (let k = 0; k < 44; k++) pool.push(R(pg, -20, -20, 5, 7, { rx: 1.5, fill: 'var(--memory)' }));
      // timelines
      const tlY = smY + smH + 30;
      const labW = narrow ? 0 : 124;
      const barX = labW, barW = w - labW - (narrow ? 0 : 64);
      const scale = barW / m.U;
      const bars = [];
      [['unfused', m.unf, '3 separate kernels'], ['fused', m.fus, '1 fused kernel']].forEach(([mode, ks, lab], row) => {
        const y = tlY + row * (narrow ? 44 : 32);
        const on = st.mode === mode;
        if (narrow) T(svg, 0, y - 8, `${lab}: ${GG.fmt.si(ks.reduce((s, k) => s + k.bytes, 0), 'B', 1)}`, { fs: 10, fill: on ? 'var(--ink)' : 'var(--ink-3)' });
        else {
          T(svg, 0, y + 10, lab, { fs: 10.5, fill: on ? 'var(--ink)' : 'var(--ink-3)' });
        }
        let x = barX;
        ks.forEach((k) => {
          const bw = Math.max(2, k.bytes * scale);
          R(svg, x, y, bw - 2, 20, { rx: 4, fill: 'var(--core)', op: on ? 0.3 : 0.1, stroke: on ? 'var(--core)' : 'rgba(69,212,155,.3)' });
          T(svg, x + (bw - 2) / 2, y + 10.5, fit([k.name, k.name.replace(/ /g, ''), ''], 10, bw - 8), { anchor: 'middle', fs: 10, fill: on ? 'var(--ink)' : 'var(--ink-3)' });
          x += bw;
        });
        if (!narrow) T(svg, x + 6, y + 10.5, GG.fmt.si(ks.reduce((s, k) => s + k.bytes, 0), 'B', 1), { fs: 10, fill: on ? 'var(--ink-2)' : 'var(--ink-3)' });
        bars.push({ y, mode });
      });
      const ph = Ln(svg, barX, tlY - 4, barX, tlY + 24, { stroke: 'var(--accent)', sw: 2 });
      const tlBottom = tlY + (narrow ? 44 : 32) + 24;
      T(svg, barX, tlBottom + 4, 'time ∝ bytes moved (memory-bound model)', { fs: 10, fill: 'var(--ink-3)' });
      sizeSvg(svg, w, tlBottom + 14);
      E = { m, boxes, tensorEls, coreBox, smemBox, smChips, kLab, flowX, smY, guides, heads, ph, bars, barX, scale, tlY, narrow };
      // readouts
      const ks = fused ? m.fus : m.unf;
      const tot = fused ? m.F : m.U;
      sL.set(String(ks.length));
      sT.set(GG.fmt.si(tot, 'B', 1));
      sU.set(GG.fmt.fixed((tot / BW) * 1e6, 1) + ' µs');
      sR.set(`${GG.fmt.fixed(m.U / m.F, 2)}× less traffic`);
      frame();
    });

    function frame(tOverride) {
      if (!E) return;
      const { m } = E;
      const fused = st.mode === 'fused';
      const ks = fused ? m.fus : m.unf;
      const active = (fused ? m.F / m.U : 1) * LOOP_U;
      const loop = active + HOLD;
      const t = tOverride != null ? tOverride : Math.min(st.t, loop);
      // which kernel and progress
      let acc = 0, ki = -1, prog = 0;
      for (let k = 0; k < ks.length; k++) {
        const d = (ks[k].bytes / m.U) * LOOP_U;
        if (t < acc + d) { ki = k; prog = (t - acc) / d; break; }
        acc += d;
      }
      const done = ki === -1; // in the hold
      // tensor fill state
      const written = {};
      ks.forEach((k, idx) => k.writes.forEach(([n]) => { written[n] = done || idx < ki ? 1 : idx === ki ? prog : 0; }));
      ['X', 'W', 'b'].forEach((n) => { written[n] = 1; });
      Object.keys(E.tensorEls).forEach((n) => {
        const te = E.tensorEls[n], b = E.boxes[n];
        if (te.ghost) { te.fill.setAttribute('width', 0); return; }
        const v = written[n] == null ? 0 : written[n];
        te.fill.setAttribute('width', r1(b.w * v));
        te.base.style.fillOpacity = n === 'T1' || n === 'T2' || n === 'Y' ? 0.05 : 0.12;
      });
      // flows
      let p = 0;
      const k = ki >= 0 ? ks[ki] : null;
      const activeNames = new Set();
      Object.keys(E.heads).forEach((n) => { E.heads[n].down.style.opacity = 0; E.heads[n].up.style.opacity = 0; });
      if (k) {
        const flows = [...k.reads.map((x) => [x[0], x[1], 'down']), ...k.writes.map((x) => [x[0], x[1], 'up'])];
        flows.forEach(([n, bytes, dir]) => {
          activeNames.add(n);
          E.heads[n][dir].style.opacity = 1;
          const count = bytes > m.S * 0.2 ? 7 : 2;
          const x = E.flowX(n);
          const y0 = E.boxes[n].y + E.boxes[n].h + 4, y1 = E.smY - 8;
          for (let q = 0; q < count && p < pool.length; q++, p++) {
            let u = ((st.t * 0.9) + q / count) % 1;
            if (dir === 'up') u = 1 - u;
            const r = pool[p];
            r.setAttribute('x', r1(x - 2.5)); r.setAttribute('y', r1(y0 + u * (y1 - y0)));
            // reads are solid blue packets, writes hollow ones: both are data moving to or from memory
            r.style.fill = 'var(--memory)';
            r.style.fillOpacity = dir === 'up' ? 0.15 : 1;
            r.style.stroke = 'var(--memory)';
            r.style.strokeWidth = dir === 'up' ? 1.3 : 0;
            r.style.opacity = 0.9;
          }
        });
      }
      for (; p < pool.length; p++) pool[p].style.opacity = 0;
      Object.keys(E.guides).forEach((n) => { E.guides[n].style.stroke = activeNames.has(n) ? 'var(--ink-3)' : 'var(--line)'; });
      E.kLab.textContent = k ? (E.narrow ? k.name.replace(/ /g, '') : k.name) : 'done';
      if (fused && E.smChips.length) {
        E.smChips[0].style.fillOpacity = k ? 0.2 + 0.25 * (0.5 + 0.5 * Math.sin(st.t * 6)) : 0.15;
        E.smChips[1].style.fillOpacity = k ? 0.2 + 0.25 * (0.5 + 0.5 * Math.sin(st.t * 6 + 2)) : 0.15;
      }
      // playhead
      const bar = E.bars.find((b) => b.mode === st.mode);
      const px = E.barX + Math.min(t, active) / LOOP_U * m.U * E.scale;
      E.ph.setAttribute('x1', r1(px)); E.ph.setAttribute('x2', r1(px));
      E.ph.setAttribute('y1', bar.y - 4); E.ph.setAttribute('y2', bar.y + 24);
      // why, only on phase change
      const phaseKey = done ? 99 : ki;
      if (phaseKey !== st.phase) {
        st.phase = phaseKey;
        const sz = (b) => GG.fmt.si(b, 'B', 1);
        let why;
        if (done) {
          why = fused
            ? `Done: <b>${sz(m.F)}</b> crossed the memory bus, one launch, and T1 and T2 never left the SM. That is <b>${GG.fmt.fixed(m.U / m.F, 2)}×</b> less traffic than three separate kernels.`
            : `Done: <b>${sz(m.U)}</b> crossed the memory bus in three launches. T1 and T2 were each written out and read straight back in: ${sz(4 * m.S)} of pure round trips. Press Play to watch it again, or switch to the fused kernel.`;
        } else if (fused) {
          why = `One kernel reads X, W and b, keeps the convolution’s output (T1) and the biased result (T2) <b>on chip</b>, one tile at a time (in this chain, in registers), applies ReLU, and writes only Y: <b>${sz(m.F)}</b> of traffic.`;
        } else {
          const kk = ks[ki];
          why = `Kernel ${ki + 1} of 3, <b>${kk.name}</b>: reads ${kk.reads.map(([n, b]) => `${n} (${sz(b)})`).join(' and ')} from global memory and writes ${kk.writes.map(([n, b]) => `${n} (${sz(b)})`).join(', ')} back${ki < 2 ? ', only so the next kernel can read it again' : ''}.`;
        }
        if (m.S <= L2) why += ` <span class="c-dim">At this batch size each tensor (${sz(m.S)}) would fit in H100’s 50 MiB (52.4 MB; NVIDIA: 50 MB) L2 cache, so real global-memory traffic could be lower than this model shows.</span>`;
        f.setWhy(why);
      }
    }
    const pb = GG.ui.playButton(f.controls, anim, { onToggle: (running) => { if (running && E && st.t >= (st.mode === 'fused' ? E.m.F / E.m.U : 1) * LOOP_U) { st.t = 0; st.phase = -1; } frame(); } });
  }

  /* Fig: frontends, backend, engines and heuristics */
  function figStack(ctx, slot) {
    const f = fig(ctx, slot, {
      title: 'Inside {cuDNN}: frontends, backend, heuristics', hint: 'pick an entry point · change the inputs', wide: true,
      caption: 'Open-source frontends (Python, C++) sit on a closed-source C backend, which can also be called directly. For each operation there are several implementations; heuristics, which NVIDIA does not publish, choose one from the SM architecture, the data types and the input sizes. Which implementation wins for which inputs is made up here: only the fact that the choice depends on those inputs is real.',
    });
    const AR = ['Ampere', 'Hopper', 'Blackwell'], DTS = ['FP16', 'FP32'], SZS = ['small', 'large'];
    const PICK = [[[0, 3], [1, 4]], [[2, 5], [1, 3]], [[4, 5], [0, 2]]]; // schematic: [arch][dtype][size] → implementation
    const st = { entry: 'py', ar: 1, dt: 0, sz: 1 };
    GG.ui.seg(f.controls, { label: 'Your code calls', options: [{ value: 'py', label: 'Python frontend' }, { value: 'cpp', label: 'C++ frontend' }, { value: 'c', label: 'C backend (FFI / legacy)' }], value: st.entry, onChange: (v) => { st.entry = v; lay.rebuild(); } });
    GG.ui.seg(f.controls, { label: 'SM architecture', options: AR.map((l, v) => ({ value: v, label: l })), value: st.ar, onChange: (v) => { st.ar = v; lay.rebuild(); } });
    GG.ui.seg(f.controls, { label: 'Data type', options: DTS.map((l, v) => ({ value: v, label: l })), value: st.dt, onChange: (v) => { st.dt = v; lay.rebuild(); } });
    GG.ui.seg(f.controls, { label: 'Input size', options: SZS.map((l, v) => ({ value: v, label: l })), value: st.sz, onChange: (v) => { st.sz = v; lay.rebuild(); } });
    const sP = GG.ui.stat(f.readouts, { label: 'Layers on the path', tone: 'host' });
    const sO = GG.ui.stat(f.readouts, { label: 'Open source on the path', tone: 'core' });
    const sI = GG.ui.stat(f.readouts, { label: 'Heuristics pick', tone: 'control' });
    const svg = svgRoot(f.stage, 'Layered diagram of cuDNN: Python and C++ frontends (open source) over a C backend (closed source), several implementations per operation, a heuristics step choosing one from SM architecture, data types and input sizes, and the GPU.');
    const lay = responsive(f.stage, (w) => {
      clear(svg);
      const e = st.entry;
      const hot = 'var(--accent)';
      const gut = 44; // right-hand gutter for the direct path to the backend
      // your code
      R(svg, 0, 0, w, 30, { rx: 8, fill: 'var(--host)', op: 0.1, stroke: 'rgba(184,164,255,.5)' });
      T(svg, 12, 15, fit(['YOUR PROGRAM (framework, script, or another language via FFI)', 'YOUR PROGRAM'], 10, w - 24), { fs: 10, fill: 'var(--host)' });
      // frontends
      const fy = 58, fh = 44, gap = 12;
      const fw = (w - gut - gap) / 2;
      [['py', 'Python frontend'], ['cpp', 'C++ frontend']].forEach(([k, lab], i) => {
        const x = i * (fw + gap), on = e === k;
        const g = G(svg);
        if (e === 'c') g.style.opacity = 0.4;
        R(g, x, fy, fw, fh, { rx: 9, fill: 'var(--host)', op: on ? 0.22 : 0.07, stroke: on ? hot : 'rgba(184,164,255,.4)', sw: on ? 1.8 : 1 });
        T(g, x + 10, fy + 15, fit([lab, lab.split(' ')[0]], 11.5, fw - 16), { fs: 11.5, fill: 'var(--ink)', weight: 600 });
        T(g, x + 10, fy + 32, fit(['open source · Graph API', 'open source'], 10, fw - 20), { fs: 10, fill: 'var(--core)' });
      });
      // backend
      const by = fy + fh + 30, bh = 46;
      R(svg, 0, by, w, bh, { rx: 9, fill: 'var(--host)', op: e === 'c' ? 0.22 : 0.1, stroke: e === 'c' ? hot : 'rgba(184,164,255,.45)', sw: e === 'c' ? 1.8 : 1 });
      T(svg, 10, by + 15, 'C backend API', { fs: 11.5, fill: 'var(--ink)', weight: 600 });
      T(svg, 10, by + 32, fit(['closed source · legacy use cases · direct C FFI', 'closed source · C FFI'], 10, w - 20), { fs: 10, fill: 'var(--ink-2)' });
      // engines
      const ey = by + bh + 30;
      const nE = 6;
      const ew = (w - 90 - (nE - 1) * 6) / nE;
      T(svg, 0, ey - 9, fit(['SEVERAL IMPLEMENTATIONS OF THE SAME OPERATION', 'IMPLEMENTATIONS OF ONE OP'], 10, w), { fs: 10, fill: 'var(--ink-3)' });
      const pickIdx = PICK[st.ar][st.dt][st.sz];
      const pickX = pickIdx * (ew + 6) + ew / 2;
      for (let k = 0; k < nE; k++) {
        const x = k * (ew + 6), on = k === pickIdx;
        R(svg, x, ey, ew, 30, { rx: 6, fill: 'var(--core)', op: on ? 0.3 : 0.07, stroke: on ? 'var(--core)' : 'rgba(69,212,155,.3)', sw: on ? 1.6 : 1 });
        T(svg, x + ew / 2, ey + 15, fit([`impl ${k + 1}`, `#${k + 1}`, String(k + 1)], 10, ew - 4), { anchor: 'middle', fs: 10, fill: on ? 'var(--ink)' : 'var(--ink-3)' });
      }
      // heuristics diamond at right
      const dx = w - 40, dy = ey + 15, dr = 22;
      Pth(svg, `M${dx},${dy - dr} L${dx + dr},${dy} L${dx},${dy + dr} L${dx - dr},${dy} Z`, { fill: 'rgba(255,198,92,.14)', stroke: 'var(--control)', sw: 1.5 });
      T(svg, dx, dy + 1, '?', { anchor: 'middle', fs: 18, fill: 'var(--control)', weight: 700 });
      Pth(svg, `M${dx},${dy + dr + 2} L${dx},${ey + 48} L${r1(pickX)},${ey + 48} L${r1(pickX)},${ey + 33}`, { stroke: 'var(--control)', sw: 1.5, dash: '4 3' });
      const iy = ey + 66;
      const inTxt = `${AR[st.ar]} · ${DTS[st.dt]} · ${SZS[st.sz]} inputs`;
      // the inputs label goes on whichever side of the launch arrow has more room
      const leftSide = pickX > w / 2;
      T(svg, leftSide ? 0 : w, iy, fit([`heuristics see: ${inTxt}`, inTxt, `${AR[st.ar]} · ${DTS[st.dt]} · ${SZS[st.sz]}`], 10, leftSide ? pickX - 14 : w - pickX - 14), { anchor: leftSide ? 'start' : 'end', fs: 10, fill: 'var(--control)' });
      // GPU
      const gy = iy + 22;
      Arrow(svg, pickX, ey + 50, pickX, gy - 2, { stroke: 'var(--core)' });
      R(svg, 0, gy, w, 30, { rx: 8, fill: 'var(--core)', op: 0.07, stroke: 'rgba(69,212,155,.35)' });
      T(svg, 12, gy + 15, fit([`GPU (${AR[st.ar]}): the chosen implementation runs as a kernel`, 'GPU runs the chosen kernel'], 10, w - 24), { fs: 10, fill: 'var(--core)' });
      // entry path: through a frontend, or down the right-hand gutter straight to the backend
      if (e === 'c') {
        const ex = w - gut / 2;
        Arrow(svg, ex, 32, ex, by - 3, { stroke: hot, sw: 1.8 });
        T(svg, ex - 6, 44, 'direct', { anchor: 'end', fs: 10, fill: hot, cls: 'hsc-halo' });
      } else {
        const ex = e === 'py' ? fw / 2 : fw + gap + fw / 2;
        Arrow(svg, ex, 32, ex, fy - 3, { stroke: hot, sw: 1.8 });
        Arrow(svg, ex, fy + fh + 2, ex, by - 3, { stroke: hot, sw: 1.8 });
      }
      Arrow(svg, w / 2, by + bh + 2, w / 2, ey - 18, { stroke: 'var(--ink-3)' });
      sizeSvg(svg, w, gy + 32);
      sP.set(e === 'c' ? 'backend → kernel' : 'frontend → backend → kernel');
      sO.set(e === 'c' ? 'none' : 'the frontend', e === 'c' ? null : 'core');
      sI.set(`impl ${pickIdx + 1}`);
      const pickTxt = ` For ${DTS[st.dt]} data and ${SZS[st.sz]} inputs on ${AR[st.ar] === 'Ampere' ? 'an' : 'a'} ${AR[st.ar]} GPU, the heuristics pick <b>impl ${pickIdx + 1}</b> here; change any input and the pick may change.`;
      f.setWhy((e === 'c'
        ? 'Calling the <b>C backend</b> directly skips the frontends (dimmed). That is the path for legacy code and for other languages that call C through an FFI. The backend is <b>closed source</b>.'
        : `The <b>${e === 'py' ? 'Python' : 'C++'} frontend</b> is open source: you build an operation graph with it, and it drives the closed-source C backend.`) + pickTxt);
    });
  }

  /* Fig: cuDNN in the CUDA software platform (the shared toolkit picture) */
  function figPlatform(ctx, slot, opts) {
    const f = fig(ctx, slot, { title: opts.title, hint: 'hover or tap a layer', wide: true, caption: opts.caption });
    GG.components.toolkit(f.stage, { highlight: 'libs', examples: true, files: !!opts.files });
    f.setWhy(opts.why);
    return f;
  }

  GG.entry('cudnn', {
    render(body, ctx) {
      const s = ctx.html(body, `
        <p>NVIDIA’s <strong>cuDNN</strong> (CUDA Deep Neural Network) is a library of primitives for building GPU-accelerated deep neural networks. A primitive is one of the building-block operations that network layers are made of, shipped as highly optimized <a data-term="kernel">kernels</a>. The operations that arise frequently in neural networks include convolution, self-attention (including scaled dot-product attention, aka “Flash Attention”), matrix multiplication, various normalizations, poolings, and more. In plain terms:</p>
        <dl class="hsc-dl">
          <dt>Convolution</dt><dd>Slide a small grid of learned weights (a filter) across an image or feature map, taking a weighted sum of the values under it at every position. The workhorse of image models.</dd>
          <dt>Self-attention</dt><dd>Every position in a sequence takes a weighted average of every position’s “value” vector, weighting each by how well its own “query” matches that position’s “key”. <b>Scaled dot-product attention</b> (SDPA) is the standard form: softmax(QK<sup>T</sup>/√d)·V, where Q, K and V hold the queries, keys and values and d is the key length.</dd>
          <dt>Matrix multiplication</dt><dd>The GEMM of <a data-term="cublas">cuBLAS</a>, also offered here so it can take part in cuDNN’s fused operation graphs.</dd>
          <dt>Normalizations</dt><dd>Rescale activations to zero mean and unit variance over some group of values (a batch, a layer, a group of channels), then apply a learned scale and shift. Batch norm and layer norm are the best known.</dd>
          <dt>Poolings</dt><dd>Shrink a feature map by keeping the maximum (max pooling) or the average (average pooling) of each small window.</dd>
        </dl>
        ${GG.noteHTML('check', `<p><b>SDPA and “Flash Attention” are not quite the same thing.</b> Scaled dot-product attention is the operation, softmax(QK<sup>T</sup>/√d)·V. FlashAttention (Dao et al., 2022) is a particular way of computing it exactly: a fused, tiled kernel that never writes the full matrix of attention scores to global memory. Fast SDPA kernels are usually built in that style, which is why the names get used interchangeably.</p>`)}
        <p>cuDNN is a key library at the application layer of the <a data-term="cuda-software-platform">CUDA software platform</a>, alongside its sibling library, <a data-term="cublas">cuBLAS</a> (Fig. 1). The two split the work of a deep learning framework. Frameworks like PyTorch typically leverage cuBLAS for general-purpose linear algebra, such as the matrix multiplications that form the core of dense (fully-connected) layers. They rely on cuDNN for more specialized primitives like convolutional layers, normalization routines and attention mechanisms (Fig. 2).</p>
        <div data-slot="platform"></div>
        <div data-slot="routing"></div>
        <h3>Operation graphs</h3>
        <p>In modern cuDNN code you do not call one function per operation. You express the computation as an <strong>operation graph</strong>: nodes are operations (a convolution, a bias add, a ReLU) and edges are the tensors flowing between them. Graphs are constructed with the open-source <a href="https://docs.nvidia.com/deeplearning/cudnn/frontend/latest/developer/overview.html">Python and C++ frontend APIs</a>, via the declarative <a href="https://docs.nvidia.com/deeplearning/cudnn/frontend/v1.14.0/developer/graph-api.html">Graph API</a>. Declarative means you state <em>what</em> to compute and leave <em>how</em> to cuDNN.</p>
        <p>Watch the name: the cuDNN Graph API is not to be confused with <a data-term="cuda-graph">CUDA Graphs</a>. Fig. 3 puts the two side by side.</p>
        <div data-slot="graphs"></div>
        <h3>Operation fusion</h3>
        <p>Because the developer hands over a whole sequence of operations as a graph, cuDNN can analyze it and optimize it, most importantly by <strong>operation fusion</strong>. In operation fusion, a sequence of operations like Convolution + Bias + ReLU is merged (“fused”) into a single operation, run as a single <a data-term="kernel">kernel</a>. (A <b>bias add</b> adds one learned number per channel to every element of that channel, y = x + b. A <b>ReLU</b>, rectified linear unit, replaces negative values with zero, y = max(0, x).)</p>
        <p>Why this pays: separate kernels can only hand data to each other through <a data-term="global-memory">global memory</a>, so each one reads its input from there and writes its output back. A bias add does one addition per element and a ReLU one comparison, so kernels like these spend nearly all their time moving bytes: they are <a data-term="memory-bound">memory-bound</a>. Operation fusion reduces demand on <a data-term="memory-bandwidth">memory bandwidth</a> by keeping program intermediates in <a data-term="shared-memory">shared memory</a>, on the <a data-term="streaming-multiprocessor">Streaming Multiprocessor</a>, throughout the sequence of operations. Play Fig. 4 and compare the timelines.</p>
        <div data-slot="fusion"></div>
        ${GG.noteHTML('beyond', `<p><b>Where exactly do the intermediates live?</b> A fused kernel works on one tile of the output at a time. In a Conv + Bias + ReLU chain the convolution is typically computed like a matrix multiplication (an “implicit GEMM”), so each output tile is accumulated in <a data-term="registers">registers</a>, and the bias and ReLU are applied right there, in the kernel’s epilogue (the <a data-term="cutlass">CUTLASS</a> entry shows one), while shared memory holds the input tiles being staged. Other fusions, such as attention, also park intermediates in shared memory. Either way the intermediates stay on chip, a tile at a time, and never make the round trip through global memory.</p>`)}
        ${GG.noteHTML('intuition', `<p>Picture a cook who, after chopping the onions, puts them back in the pantry, then fetches them again to fry them, puts them back, and fetches them once more to season them. Fusion is keeping the onions on the counter until the dish is done. The counter (on-chip storage: registers and shared memory) is small but right next to you; the pantry (global memory) is big but a walk away.</p>`)}
        <h3>Frontends, backend and heuristics</h3>
        <p>The frontends interact with a lower-level, closed-source <a href="https://docs.nvidia.com/deeplearning/cudnn/backend/latest/api/overview.html">C backend</a>, which exposes an API for legacy use cases or direct C FFI. (An FFI, or foreign function interface, is how code in one language calls functions compiled from another; C’s calling conventions are the common ground most languages can reach.)</p>
        <p>As with <a data-term="cublas">cuBLAS</a>, cuDNN maintains multiple underlying implementations for any given operation and uses internal heuristics (unknown to the outside world) to select the most performant one for the target <a data-term="streaming-multiprocessor-architecture">Streaming Multiprocessor (SM) architecture</a>, data types and input sizes. Fig. 5 lets you change all three.</p>
        <div data-slot="stack"></div>
        ${GG.noteHTML('beyond', `<p>cuDNN’s documentation calls these implementations <em>engines</em>. Asked about an operation graph, its heuristics return candidate engine configurations ordered by expected performance, and the frontend builds an execution plan from one of them.</p>`)}
        <h3>From convnets to Transformers</h3>
        <p>cuDNN’s initial claim to fame was accelerating convolutional neural networks on Ampere <a data-term="streaming-multiprocessor-architecture">SM architecture</a> GPUs. For Transformer neural networks on Hopper and especially Blackwell <a data-term="streaming-multiprocessor-architecture">SM architectures</a>, NVIDIA has tended to place more emphasis on the <a data-term="cutlass">CUTLASS</a> library: a toolkit for building kernels yourself rather than a catalogue of ready-made ones.</p>
        ${GG.noteHTML('check', `<p><b>cuDNN made its name before Ampere.</b> NVIDIA introduced cuDNN in 2014, in the Kepler and Maxwell era (<a href="https://arxiv.org/abs/1410.0759">Chetlur et al., “cuDNN: Efficient Primitives for Deep Learning”</a>, October 2014), and frameworks of that time adopted it for convolutional networks: the paper reports that integrating it into Caffe made a standard model 36% faster. Ampere arrived six years later, in 2020. What does hold is that by the Ampere generation cuDNN was the standard backend for convolutional networks, while for Transformers on Hopper and Blackwell NVIDIA’s emphasis moved towards CUTLASS. The years below are when each was introduced.</p>`)}
        <div class="hsc-timeline" role="list" aria-label="cuDNN and NVIDIA’s emphasis, by year and SM architecture">
          <div role="listitem"><i>2014 · Kepler &amp; Maxwell era</i><b>CNNs</b><span>cuDNN is introduced; Caffe gets 36% faster with it.</span></div>
          <div role="listitem"><i>Ampere · 2020</i><b>CNNs</b><span>The glossary’s “claim to fame” era: cuDNN is the standard convnet backend.</span></div>
          <div role="listitem"><i>Hopper · 2022</i><b>Transformers</b><span>More emphasis on CUTLASS for the new workloads.</span></div>
          <div role="listitem"><i>Blackwell · 2024</i><b>Transformers</b><span>Especially here, the emphasis is on CUTLASS.</span></div>
        </div>
        <p>For more information on cuDNN, see the <a href="https://docs.nvidia.com/deeplearning/cudnn/">official cuDNN documentation</a> and the <a href="https://github.com/NVIDIA/cudnn-frontend">open source frontend APIs</a>.</p>
        <div data-slot="reading"></div>
      `);
      guard(() => figPlatform(ctx, s.platform, {
        title: '{cuDNN} in the CUDA software platform',
        caption: 'The CUDA Toolkit stack, with the CUDA Libraries layer lit. cuDNN, cuBLAS and CUTLASS sit there: applications call them, and they call the CUDA Runtime API in turn.',
        why: 'cuDNN lives in the <b>CUDA Libraries</b> layer next to cuBLAS: a framework like PyTorch calls it from the host, and it reaches the GPU through the CUDA Runtime and Driver APIs. Hover a layer to see what it does.',
      }));
      guard(() => figRouting(ctx, s.routing));
      guard(() => figGraphs(ctx, s.graphs));
      guard(() => figFusion(ctx, s.fusion));
      guard(() => figStack(ctx, s.stack));
      ctx.reading(s.reading, [
        { href: 'https://docs.nvidia.com/deeplearning/cudnn/', label: 'cuDNN documentation', note: 'NVIDIA' },
        { href: 'https://github.com/NVIDIA/cudnn-frontend', label: 'cudnn-frontend on GitHub', note: 'the open-source Python and C++ frontend APIs' },
        { href: 'https://docs.nvidia.com/deeplearning/cudnn/frontend/latest/developer/overview.html', label: 'Frontend developer overview', note: 'NVIDIA' },
        { href: 'https://docs.nvidia.com/deeplearning/cudnn/frontend/v1.14.0/developer/graph-api.html', label: 'The Graph API', note: 'declaring operation graphs' },
        { href: 'https://docs.nvidia.com/deeplearning/cudnn/backend/latest/api/overview.html', label: 'Backend API overview', note: 'the closed-source C layer' },
        { href: 'https://arxiv.org/abs/1410.0759', label: 'cuDNN: Efficient Primitives for Deep Learning', note: 'Chetlur et al., 2014' },
      ]);
      keepCase(body);
    },
  });

  /* ═════════════════════════════════════════════════════════════
     CUTLASS
     ═════════════════════════════════════════════════════════════ */

  /* Fig: the three BLAS levels and their arithmetic intensity */
  function figLevels(ctx, slot) {
    const f = fig(ctx, slot, {
      title: 'Why GEMMs: the three BLAS levels', hint: 'drag n', wide: true,
      caption: 'FP32 operands (4 bytes), n-element vectors and n × n matrices; one multiply-add counts as 2 FLOPs, α/β scaling is ignored, and every operand is read from memory once and every output written once. The dashed line is H100’s FP32 CUDA-core ridge point, 66.9 TFLOPS ÷ 3.35 TB/s ≈ 20 FLOPs per byte (see the <a data-term="roofline-model">Roofline Model</a> entry).',
    });
    const st = { n: 4096 };
    GG.ui.slider(f.controls, { label: 'Problem size n', min: 16, max: 16384, log: true, step: 16, value: st.n, format: (v) => GG.fmt.int(v), onInput: (v) => { st.n = v; lay.rebuild(); } });
    const s1 = GG.ui.stat(f.readouts, { label: 'Level 1 FLOP/B', tone: 'memory' });
    const s2 = GG.ui.stat(f.readouts, { label: 'Level 2 FLOP/B', tone: 'memory' });
    const s3 = GG.ui.stat(f.readouts, { label: 'Level 3 FLOP/B', tone: 'core' });
    const svg = svgRoot(f.stage, 'Arithmetic intensity of BLAS level 1, 2 and 3 routines on a logarithmic axis, compared with the H100 FP32 ridge point.');
    const RIDGE = 66.9e12 / 3.35e12;
    const lay = responsive(f.stage, (w) => {
      clear(svg);
      const n = st.n;
      const L = [
        { t: 'Level 1 · vector-vector', ex: 'AXPY: y ← αx + y', fl: 2 * n, by: 4 * 3 * n, g: 1 },
        { t: 'Level 2 · matrix-vector', ex: 'GEMV: y ← αAx + βy', fl: 2 * n * n, by: 4 * (n * n + 3 * n), g: 2 },
        { t: 'Level 3 · matrix-matrix', ex: 'GEMM: C ← αAB + βC', fl: 2 * n ** 3, by: 4 * 4 * n * n, g: 3 },
      ];
      L.forEach((l) => { l.ai = l.fl / l.by; });
      const narrow = w < 560;
      const labW = narrow ? 0 : 200;
      const ax0 = labW + 14, ax1 = w - 26;
      const lo = Math.log10(0.1), hi = Math.log10(1e4);
      const X = (v) => ax0 + ((Math.log10(clamp(v, 0.1, 1e4)) - lo) / (hi - lo)) * (ax1 - ax0);
      const rowH = narrow ? 70 : 54;
      const top = 20;
      // ridge
      const rx = X(RIDGE);
      L.forEach((l, i) => {
        const y = top + i * rowH;
        const ty = narrow ? y : y + 8;
        T(svg, 0, ty, l.t, { fs: 11.5, fill: 'var(--ink)', weight: 600 });
        T(svg, 0, ty + 15, l.ex, { fs: 10.5, fill: 'var(--ink-3)' });
        const by = narrow ? y + 28 : y;
        R(svg, ax0, by, ax1 - ax0, 22, { rx: 5, fill: 'var(--surface-2)', stroke: 'var(--line)' });
        if (narrow) Ln(svg, X(RIDGE), by - 3, X(RIDGE), by + 25, { stroke: 'var(--control)', dash: '4 3', sw: 1.3 });
        const bw = Math.max(3, X(l.ai) - ax0);
        const over = l.ai > RIDGE;
        R(svg, ax0, by, bw, 22, { rx: 5, fill: over ? 'var(--core)' : 'var(--memory)', op: 0.55 });
        const lab = `${GG.fmt.sig(l.ai, 3)} FLOP/B`;
        const inside = bw > tw(lab, 10.5) + 14;
        T(svg, inside ? ax0 + bw - 7 : ax0 + bw + 7, by + 11.5, lab, { anchor: inside ? 'end' : 'start', fs: 10.5, fill: 'var(--ink)' });
      });
      const axY = top + 3 * rowH - (narrow ? 10 : 22);
      Ln(svg, ax0, axY, ax1, axY, { stroke: 'var(--line-2)' });
      [0.1, 1, 10, 100, 1000, 10000].forEach((v) => {
        Ln(svg, X(v), axY, X(v), axY + 4, { stroke: 'var(--line-2)' });
        T(svg, X(v), axY + 13, v >= 1000 ? GG.fmt.int(v) : String(v), { anchor: 'middle', fs: 10, fill: 'var(--ink-3)' });
      });
      T(svg, ax1, axY + 28, 'arithmetic intensity, FLOPs per byte (log scale)', { anchor: 'end', fs: 10, fill: 'var(--ink-3)' });
      if (!narrow) {
        Ln(svg, rx, top - 12, rx, axY, { stroke: 'var(--control)', dash: '4 3', sw: 1.3 });
        T(svg, rx + 5, top - 10, 'H100 FP32 ridge ≈ 20', { fs: 10, fill: 'var(--control)' });
      } else {
        Ln(svg, rx, axY - 6, rx, axY, { stroke: 'var(--control)', sw: 1.3 });
        T(svg, 0, axY + 44, 'dashed: H100 FP32 ridge point ≈ 20', { fs: 10, fill: 'var(--control)' });
      }
      sizeSvg(svg, w, axY + (narrow ? 52 : 36));
      s1.set(GG.fmt.sig(L[0].ai, 3));
      s2.set(GG.fmt.sig(L[1].ai, 3));
      s3.set(GG.fmt.sig(L[2].ai, 3), L[2].ai > RIDGE ? 'core' : 'memory');
      const g = L[2];
      f.setWhy(`At n = <b>${GG.fmt.int(n)}</b>, a GEMM (C ← αAB + βC: read A, B and C, write C, so 4n² FP32 values) does 2n³ = ${GG.fmt.si(g.fl, 'FLOP', 1)} on 16n² = ${GG.fmt.si(g.by, 'B', 1)} of memory traffic: <b>${GG.fmt.sig(g.ai, 3)}</b> FLOPs per byte, which grows with n (it is n/8). ${g.ai > RIDGE ? 'That is past the ridge point, so a good GEMM can be <b>compute-bound</b>.' : 'Still below the ridge: at this size even a GEMM is memory-bound.'} Level 1 stays at 1/6 and Level 2 approaches 1/2 whatever n is: they are always memory-bound.`);
    });
  }

  /* Fig: one template, many instantiated kernels */
  function figTemplates(ctx, slot) {
    const f = fig(ctx, slot, {
      title: 'One template, many kernels', hint: 'choose arguments · instantiate', wide: true, class: 'hsc-wrapwhy',
      caption: 'A sketch of the idea, far simpler than CUTLASS’s real interfaces. Each distinct set of template arguments makes the compiler generate a separate, fully specialized kernel; asking for the same set again reuses the one it already made.',
    });
    const EL = [{ v: 0, l: 'float' }, { v: 1, l: 'half_t' }, { v: 2, l: 'bfloat16_t' }];
    const TL = [{ v: 0, l: '64×64', m: 64, n: 64 }, { v: 1, l: '128×128', m: 128, n: 128 }, { v: 2, l: '128×256', m: 128, n: 256 }];
    const EP = [{ v: 0, l: 'Identity' }, { v: 1, l: 'Scale' }, { v: 2, l: 'ReLU' }];
    const st = { el: 1, tl: 1, ep: 2 };
    const made = [];
    const pre = GG.el('div', { class: 'hsc-tpl', tabindex: '0', 'aria-label': 'Template sketch' });
    const shelfLab = GG.el('div', { class: 'hsc-lab', text: 'Kernels the compiler has generated' });
    shelfLab.style.marginTop = '12px';
    const shelf = GG.el('div', { class: 'hsc-shelf', 'aria-live': 'polite' });
    f.stage.append(pre, shelfLab, shelf);
    GG.ui.seg(f.controls, { label: 'Element', options: EL.map((o) => ({ value: o.v, label: o.l })), value: st.el, onChange: (v) => { st.el = v; paint(); } });
    GG.ui.seg(f.controls, { label: 'Tile ({TileM × TileN})', options: TL.map((o) => ({ value: o.v, label: o.l })), value: st.tl, onChange: (v) => { st.tl = v; paint(); } });
    GG.ui.seg(f.controls, { label: 'Epilogue', options: EP.map((o) => ({ value: o.v, label: o.l })), value: st.ep, onChange: (v) => { st.ep = v; paint(); } });
    GG.ui.button(f.controls, { label: 'Instantiate', primary: true, onClick: () => instantiate(true) });
    GG.ui.button(f.controls, { label: 'Clear', icon: 'reset', onClick: () => { made.length = 0; instantiate(false); } });
    const sN = GG.ui.stat(f.readouts, { label: 'Kernels generated', tone: 'core' });
    GG.ui.stat(f.readouts, { label: 'Possible here', tone: 'control', value: `${EL.length} × ${TL.length} × ${EP.length} = ${EL.length * TL.length * EP.length}` });
    const key = () => `${st.el}-${st.tl}-${st.ep}`;
    const name = () => `gemm_kernel<${EL[st.el].l}, ${TL[st.tl].m}, ${TL[st.tl].n}, ${EP[st.ep].l}>`;
    let lastMsg = '';
    function paint() {
      const e = EL[st.el].l, t = TL[st.tl], p = EP[st.ep].l;
      pre.innerHTML =
        `<span class="k">template</span> &lt;<span class="k">typename</span> Element,\n` +
        `          <span class="k">int</span> TileM, <span class="k">int</span> TileN,\n` +
        `          <span class="k">typename</span> Epilogue&gt;\n` +
        `<span class="k">__global__ void</span> gemm_kernel(\n` +
        `    <span class="k">const</span> Element* A, <span class="k">const</span> Element* B,\n` +
        `    Element* C, <span class="k">int</span> M, <span class="k">int</span> N, <span class="k">int</span> K);\n\n` +
        `<span class="c">// using it: these arguments pick</span>\n` +
        `<span class="c">// one instantiation</span>\n` +
        `gemm_kernel&lt;<span class="p">${e}</span>, <span class="p">${t.m}</span>, <span class="p">${t.n}</span>, <span class="p">${p}</span>&gt;\n` +
        `    &lt;&lt;&lt;grid, block&gt;&gt;&gt;(A, B, C, M, N, K);`;
      const has = made.some((m) => m.key === key());
      f.setWhy(lastMsg || (has
        ? `<code>${esc(name())}</code> already exists in the binary. Press Instantiate with different arguments to make the compiler generate another kernel.`
        : `The source is written once. Press <b>Instantiate</b> and the compiler generates <code>${esc(name())}</code>: a kernel with Element = ${esc(e)}, a ${t.m}×${t.n} tile and a ${esc(p)} epilogue baked in as constants.`));
      lastMsg = '';
    }
    function instantiate(add) {
      let flash = null;
      if (add) {
        const k = key();
        const ex = made.find((m) => m.key === k);
        if (ex) { flash = ex; lastMsg = `Same arguments, same kernel: <code>${esc(name())}</code> was already generated, so the compiler reuses it instead of making a copy.`; }
        else { made.push({ key: k, name: name(), fresh: true }); lastMsg = `Generated <code>${esc(name())}</code>. It is a separate function in the binary, specialized for exactly these arguments. ${made.length > 1 ? `The binary now holds ${made.length} kernels from one template.` : ''}`; }
      }
      clear(shelf);
      if (!made.length) shelf.append(GG.el('span', { class: 'c-dim', style: 'font:500 12px var(--font-mono)', text: 'none yet' }));
      made.forEach((m) => {
        const c = GG.el('span', { class: 'hsc-chip' + (m.fresh ? ' new' : m === flash ? ' dup' : ''), text: m.name });
        m.fresh = false;
        shelf.append(c);
      });
      sN.set(String(made.length));
      paint();
    }
    // start with the default instantiation already made
    made.push({ key: key(), name: name(), fresh: false });
    instantiate(false);
  }

  /* Fig: device / kernel / collective */
  function figDeviceLevels(ctx, slot) {
    const f = fig(ctx, slot, {
      title: 'Three levels: device, kernel, collective', hint: 'pick a level', wide: true,
      caption: 'The output matrix C is cut into tiles; one kernel launch runs a grid of thread blocks, one per tile; each thread block is a collective that computes its tile with a mainloop and an epilogue. All of it is built from CuTe’s Layout and Tensor types.',
    });
    const LV = [
      { v: 'device', l: 'device', why: 'The <b>device</b> level is the whole GPU, driven from host code: you configure a GEMM and launch it, much as you would call cuBLAS. It takes care of the launch itself.', scope: 'whole GPU, from the host' },
      { v: 'kernel', l: 'kernel', why: 'The <b>kernel</b> level is a single kernel: one launch covering the whole problem as a grid of thread blocks, each assigned a tile of C.', scope: 'one launch, all blocks' },
      { v: 'collective', l: 'collective', why: 'The <b>collective</b> level is what a collective of threads, typically one thread block, does together: its mainloop walks along K accumulating its tile, and its epilogue post-processes and stores it.', scope: 'one thread block (typically)' },
    ];
    const st = { lv: 'collective' };
    GG.ui.seg(f.controls, { label: 'Level', options: LV.map((o) => ({ value: o.v, label: o.l })), value: st.lv, onChange: (v) => { st.lv = v; lay.rebuild(); } });
    const sS = GG.ui.stat(f.readouts, { label: 'Scope', tone: 'accent' });
    const svg = svgRoot(f.stage, 'Host code calls a device-level GEMM; the kernel is a grid of thread blocks, one per tile of C; one thread block, the collective, runs a mainloop and an epilogue; CuTe underlies everything.');
    const lay = responsive(f.stage, (w) => {
      clear(svg);
      const lv = st.lv;
      const narrow = w < 600;
      const dimOp = (on) => (on ? 1 : 0.38);
      const hot = 'var(--accent)';
      let hostB, gpuB, zoomB;
      if (!narrow) {
        hostB = { x: 0, y: 30, w: 150, h: 96 };
        gpuB = { x: 176, y: 0, w: Math.min(300, w * 0.42), h: 214 };
        zoomB = { x: gpuB.x + gpuB.w + 30, y: 18, w: w - (gpuB.x + gpuB.w + 30), h: 178 };
      } else {
        hostB = { x: 0, y: 0, w: w, h: 54 };
        gpuB = { x: 0, y: 80, w: w, h: 196 };
        zoomB = { x: 0, y: 300, w: w, h: 150 };
      }
      // host
      const gH = G(svg); gH.style.opacity = dimOp(lv === 'device');
      R(gH, hostB.x, hostB.y, hostB.w, hostB.h, { rx: 10, fill: 'var(--host)', op: 0.1, stroke: lv === 'device' ? hot : 'rgba(184,164,255,.5)', sw: lv === 'device' ? 1.8 : 1 });
      T(gH, hostB.x + 10, hostB.y + 16, 'HOST CODE', { fs: 10, fill: 'var(--host)' });
      T(gH, hostB.x + 10, hostB.y + 36, 'gemm(args);', { fs: 11.5, fill: 'var(--ink)' });
      T(gH, hostB.x + 10, hostB.y + (narrow ? 36 : 56), narrow ? '' : 'device-level API', { fs: 10, fill: 'var(--ink-3)' });
      if (narrow) T(gH, hostB.x + 110, hostB.y + 36, 'device-level API', { fs: 10, fill: 'var(--ink-3)' });
      if (!narrow) Arrow(svg, hostB.x + hostB.w + 2, hostB.y + hostB.h / 2, gpuB.x - 4, hostB.y + hostB.h / 2, { stroke: lv === 'device' ? hot : 'var(--host)' });
      else Arrow(svg, w / 2, hostB.y + hostB.h + 2, w / 2, gpuB.y - 4, { stroke: lv === 'device' ? hot : 'var(--host)' });
      // GPU with C tiles
      R(svg, gpuB.x, gpuB.y, gpuB.w, gpuB.h, { rx: 12, fill: 'var(--core)', op: 0.04, stroke: lv === 'device' ? hot : 'rgba(69,212,155,.3)', sw: lv === 'device' ? 1.8 : 1 });
      T(svg, gpuB.x + 10, gpuB.y + 15, 'GPU', { fs: 10, fill: 'var(--core)' });
      const rows = 4, cols = 6;
      const gx = gpuB.x + 12, gy = gpuB.y + (narrow ? 44 : 30), gw = gpuB.w - 24, gh = gpuB.h - (narrow ? 56 : 62);
      const tw_ = gw / cols, th = gh / rows;
      const gK = G(svg);
      R(gK, gx - 4, gy - 4, gw + 8, gh + 8, { rx: 8, fill: 'none', stroke: lv === 'kernel' ? hot : 'transparent', sw: 1.8 });
      const sel = narrow ? { i: 3, j: 3 } : { i: 1, j: 3 };
      for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
        const on = i === sel.i && j === sel.j;
        const hl = lv === 'kernel' || (lv === 'collective' && on);
        R(gK, gx + j * tw_ + 1, gy + i * th + 1, tw_ - 3, th - 3, { rx: 4, fill: 'var(--core)', op: hl ? (on && lv === 'collective' ? 0.45 : 0.22) : 0.08, stroke: on && lv === 'collective' ? hot : 'rgba(69,212,155,.35)', sw: on && lv === 'collective' ? 1.8 : 1 });
        if (tw_ > 32) T(gK, gx + j * tw_ + tw_ / 2 - 1, gy + i * th + th / 2 - 1, `${i},${j}`, { anchor: 'middle', fs: 10, fill: 'var(--ink-3)' });
      }
      if (narrow) T(svg, gpuB.x + 10, gpuB.y + 30, fit(['kernel: a grid of thread blocks, one per tile of C', 'kernel: one block per tile of C', 'kernel: grid of blocks'], 10, gpuB.w - 20), { fs: 10, fill: lv === 'kernel' ? 'var(--ink)' : 'var(--ink-3)' });
      else {
        T(svg, gpuB.x + 10, gpuB.y + gpuB.h - 22, fit(['kernel: a grid of thread blocks,', 'kernel: grid of blocks'], 10, gpuB.w - 20), { fs: 10, fill: lv === 'kernel' ? 'var(--ink)' : 'var(--ink-3)' });
        T(svg, gpuB.x + 10, gpuB.y + gpuB.h - 9, fit(['one per tile of the output C', 'one per tile of C'], 10, gpuB.w - 20), { fs: 10, fill: lv === 'kernel' ? 'var(--ink)' : 'var(--ink-3)' });
      }
      // zoom lines
      const tx = gx + sel.j * tw_, ty = gy + sel.i * th;
      const zc = lv === 'collective' ? hot : 'var(--line-2)';
      if (!narrow) {
        Ln(svg, tx + tw_ - 2, ty + 1, zoomB.x, zoomB.y, { stroke: zc, dash: '3 3' });
        Ln(svg, tx + tw_ - 2, ty + th - 2, zoomB.x, zoomB.y + zoomB.h, { stroke: zc, dash: '3 3' });
      } else {
        Ln(svg, tx, ty + th - 2, zoomB.x + 8, zoomB.y, { stroke: zc, dash: '3 3' });
        Ln(svg, tx + tw_ - 2, ty + th - 2, zoomB.x + zoomB.w - 8, zoomB.y, { stroke: zc, dash: '3 3' });
      }
      const gZ = G(svg); gZ.style.opacity = dimOp(lv === 'collective');
      R(gZ, zoomB.x, zoomB.y, zoomB.w, zoomB.h, { rx: 12, fill: 'var(--surface)', stroke: lv === 'collective' ? hot : 'var(--line-2)', sw: lv === 'collective' ? 1.8 : 1 });
      T(gZ, zoomB.x + 12, zoomB.y + 16, fit([`COLLECTIVE: thread block (${sel.i}, ${sel.j})`, 'COLLECTIVE: one block'], 10, zoomB.w - 24), { fs: 10, fill: 'var(--ink)' });
      const mx = zoomB.x + 12, mw = zoomB.w - 24;
      const mH = narrow ? 44 : 58;
      R(gZ, mx, zoomB.y + 30, mw, mH, { rx: 8, fill: 'var(--core)', op: 0.12, stroke: 'rgba(69,212,155,.55)' });
      T(gZ, mx + 10, zoomB.y + 45, 'mainloop', { fs: 11.5, fill: 'var(--ink)', weight: 600 });
      T(gZ, mx + 10, zoomB.y + 62, fit(['for each K-tile: load A, B slices → MMA (Tensor Cores) into accumulators', 'for each K-tile: load A, B slices → MMA into accumulators', 'for each K-tile: load, multiply-accumulate', 'load + MMA along K'], 10, mw - 20), { fs: 10, fill: 'var(--ink-2)' });
      if (!narrow) {
        // tiny K-steps
        for (let k = 0; k < 6; k++) R(gZ, mx + 10 + k * 16, zoomB.y + 72, 12, 8, { rx: 2, fill: 'var(--core)', op: 0.35 + k * 0.1 });
      }
      const eY = zoomB.y + 30 + mH + 12;
      R(gZ, mx, eY, mw, narrow ? 40 : 50, { rx: 8, fill: 'var(--ink-3)', op: 0.08, stroke: 'var(--ink-3)', dash: '4 3' });
      T(gZ, mx + 10, eY + 15, 'epilogue', { fs: 11.5, fill: 'var(--ink)', weight: 600 });
      T(gZ, mx + 10, eY + 31, fit(['scale · non-linearity · store the tile to C', 'scale · activation · store', 'post-process, store'], 10, mw - 20), { fs: 10, fill: 'var(--ink-2)' });
      // CuTe bar
      const cy = Math.max(gpuB.y + gpuB.h, zoomB.y + zoomB.h, hostB.y + hostB.h) + 18;
      R(svg, 0, cy, w, 30, { rx: 8, fill: 'var(--memory)', op: 0.08, stroke: 'rgba(111,166,255,.4)' });
      T(svg, 12, cy + 15, fit(['CuTe: Layout and Tensor types for data and threads, the foundation of every level', 'CuTe: Layouts & Tensors underneath', 'CuTe underneath'], 10.5, w - 24), { fs: 10.5, fill: 'var(--memory)' });
      sizeSvg(svg, w, cy + 32);
      const L = LV.find((o) => o.v === lv);
      sS.set(L.scope);
      f.setWhy(L.why);
    });
  }

  /* curved arrow (cubic Bézier) with a filled head oriented along the last control segment */
  function CurveArrow(parent, x1, y1, c1x, c1y, c2x, c2y, x2, y2, o) {
    o = o || {};
    const c = o.stroke || 'var(--accent)';
    const g = G(parent);
    Pth(g, `M${r1(x1)},${r1(y1)} C${r1(c1x)},${r1(c1y)} ${r1(c2x)},${r1(c2y)} ${r1(x2)},${r1(y2)}`, { stroke: c, sw: o.sw || 1.4, dash: o.dash });
    const ang = Math.atan2(y2 - c2y, x2 - c2x), hl = o.head || 6;
    const bx = x2 - Math.cos(ang) * hl, by = y2 - Math.sin(ang) * hl;
    const px = Math.cos(ang + Math.PI / 2) * hl * 0.55, py = Math.sin(ang + Math.PI / 2) * hl * 0.55;
    Pth(g, `M${r1(x2)},${r1(y2)} L${r1(bx + px)},${r1(by + py)} L${r1(bx - px)},${r1(by - py)} Z`, { fill: c });
    g.style.pointerEvents = 'none';
    return g;
  }

  /* Fig: mainloop and epilogue of one collective, animated */
  function figMainloop(ctx, slot) {
    const f = fig(ctx, slot, {
      title: 'Mainloop, then epilogue', hint: 'step or play · click a tile of C', wide: true, class: 'hsc-compact',
      caption: 'A toy GEMM: C (8×8) = A (8×8) @ B (8×8), cut into 4×4 output tiles, one per thread block, with K walked in slices of 2. Every number is computed. The copper arrows show data moving: slices of A and B into shared memory during the mainloop, the finished tile from registers to C at the store. Real kernels use tiles like 128×128 with K-slices of 32 or 64 and feed the Tensor Cores, but the structure is the same.',
    });
    const M = 8, N = 8, K = 8, TM = 4, TN = 4, BK = 2, KT = K / BK;
    const ALPHA = 0.5;
    const EPS = [
      { v: 'none', l: 'none', f: (x) => x, d: 'no post-processing' },
      { v: 'scale', l: `× α (α = ${ALPHA})`, f: (x) => ALPHA * x, d: `scale by α = ${ALPHA}` },
      { v: 'relu', l: 'ReLU', f: (x) => Math.max(0, x), d: 'ReLU: negatives become 0' },
      { v: 'both', l: '× α, then ReLU', f: (x) => Math.max(0, ALPHA * x), d: `scale by ${ALPHA}, then ReLU` },
    ];
    const rnd = mulberry32(2024);
    const A = Array.from({ length: M * K }, () => Math.floor(rnd() * 5) - 2);
    const B = Array.from({ length: K * N }, () => Math.floor(rnd() * 5) - 2);
    const st = { bi: 0, bj: 1, step: 0, ep: 'both' };
    const STEPS = [{ label: 'start' }];
    for (let k = 0; k < KT; k++) STEPS.push({ label: 'mainloop ' + (k + 1) });
    STEPS.push({ label: 'epilogue' }, { label: 'store' });
    let lay = null;
    GG.ui.stepper(f.controls, { label: 'Step', steps: STEPS, autoplay: 1500, onStep: (i) => { st.step = i; if (lay) lay.rebuild(); } });
    GG.ui.seg(f.controls, { label: 'Epilogue', options: EPS.map((e) => ({ value: e.v, label: e.l })), value: st.ep, onChange: (v) => { st.ep = v; lay.rebuild(); } });
    const blkCtl = GG.ui.seg(f.controls, { label: 'Thread block', options: ['0,0', '0,1', '1,0', '1,1'].map((v) => ({ value: v, label: v })), value: `${st.bi},${st.bj}`, onChange: (v) => { const [a, b] = v.split(',').map(Number); st.bi = a; st.bj = b; lay.rebuild(); } });
    const sI = GG.ui.stat(f.readouts, { label: 'Mainloop iteration', tone: 'core' });
    const sF = GG.ui.stat(f.readouts, { label: 'FMAs in this block', tone: 'core' });
    const sE = GG.ui.stat(f.readouts, { label: 'Epilogue', tone: 'accent' });
    const svg = svgRoot(f.stage, 'Classic GEMM picture with A to the left and B above C; one 4×4 tile of C is computed by walking along K in slices, accumulating in registers, then post-processed and stored.');
    const fmtv = (v) => (Number.isInteger(v) ? String(v) : v.toFixed(1));
    lay = responsive(f.stage, (w) => {
      clear(svg);
      const narrow = w < 620;
      const { bi, bj, step } = st;
      const iters = Math.min(step, KT);
      const ep = EPS.find((e) => e.v === st.ep);
      const inLoop = step >= 1 && step <= KT;
      const kCur = inLoop ? step - 1 : -1;
      // accumulators
      const acc = [];
      for (let i = 0; i < TM; i++) for (let j = 0; j < TN; j++) {
        let s = 0;
        for (let p = 0; p < iters * BK; p++) s += A[(bi * TM + i) * K + p] * B[p * N + bj * TN + j];
        acc.push(s);
      }
      const out = acc.map(ep.f);
      // left: GEMM picture
      // wide stages get cells big enough that every stored value of C (up to 4 characters, e.g. -2.5) fits at 10 px
      const cs = narrow ? clamp(Math.floor((w - 24) / 16.9), 12, 20) : clamp(Math.floor((w * 0.5 - 20) / 16.9), 12, 28);
      const gap = Math.round(cs * 0.9);
      const ox = narrow ? Math.max(0, (w - (16 * cs + gap)) / 2) : 0;
      const bX = ox + 8 * cs + gap, bY = 16;
      const aX = ox, aY = bY + 8 * cs + gap;
      const cX = bX, cY = aY;
      const showNum = cs >= 17; // keep every number at 10 px or more
      const fsC = 10;
      T(svg, bX, bY - 8, 'B (K×N)', { fs: 10, fill: 'var(--ink-3)' });
      T(svg, aX, aY - 8, 'A (M×K)', { fs: 10, fill: 'var(--ink-3)' });
      T(svg, cX, cY - 8, fit(['C (M×N): click a tile', 'C (M×N)'], 10, 8 * cs), { fs: 10, fill: 'var(--ink-3)' });
      for (let i = 0; i < M; i++) for (let p = 0; p < K; p++) {
        const row = Math.floor(i / TM) === bi, cur = row && Math.floor(p / BK) === kCur, done = row && Math.floor(p / BK) < iters;
        R(svg, aX + p * cs, aY + i * cs, cs - 1.5, cs - 1.5, { rx: 2, fill: 'var(--memory)', op: cur ? 0.6 : row ? (done ? 0.22 : 0.14) : 0.05, stroke: cur ? 'var(--accent)' : 'rgba(111,166,255,' + (row ? '.5' : '.15') + ')' });
        if (showNum) T(svg, aX + p * cs + (cs - 1.5) / 2, aY + i * cs + (cs - 1.5) / 2 + 0.5, String(A[i * K + p]), { anchor: 'middle', fs: fsC, fill: row ? 'var(--ink)' : 'var(--ink-3)' });
      }
      for (let p = 0; p < K; p++) for (let j = 0; j < N; j++) {
        const col = Math.floor(j / TN) === bj, cur = col && Math.floor(p / BK) === kCur, done = col && Math.floor(p / BK) < iters;
        R(svg, bX + j * cs, bY + p * cs, cs - 1.5, cs - 1.5, { rx: 2, fill: 'var(--memory)', op: cur ? 0.6 : col ? (done ? 0.22 : 0.14) : 0.05, stroke: cur ? 'var(--accent)' : 'rgba(111,166,255,' + (col ? '.5' : '.15') + ')' });
        if (showNum) T(svg, bX + j * cs + (cs - 1.5) / 2, bY + p * cs + (cs - 1.5) / 2 + 0.5, String(B[p * N + j]), { anchor: 'middle', fs: fsC, fill: col ? 'var(--ink)' : 'var(--ink-3)' });
      }
      const storedNow = step === KT + 2;
      // the stored tile shows all 16 values or none: never a partial subset
      const outTxt = out.map(fmtv);
      const allFit = outTxt.every((sv) => tw(sv, 10) <= cs - 3);
      for (let ti = 0; ti < M / TM; ti++) for (let tj = 0; tj < N / TN; tj++) {
        const on = ti === bi && tj === bj;
        const g = G(svg, { class: 'hsc-hit' });
        R(g, cX + tj * TN * cs, cY + ti * TM * cs, TN * cs - 1.5, TM * cs - 1.5, { rx: 4, fill: 'var(--memory)', op: on ? 0.1 : 0.04, stroke: on ? 'var(--accent)' : 'rgba(111,166,255,.3)', sw: on ? 2 : 1 });
        for (let i = 0; i < TM; i++) for (let j = 0; j < TN; j++) {
          const stored = on && storedNow;
          R(g, cX + (tj * TN + j) * cs + 1, cY + (ti * TM + i) * cs + 1, cs - 3.5, cs - 3.5, { rx: 2, fill: 'var(--memory)', op: stored ? 0.35 : 0.06, stroke: stored ? 'var(--memory)' : null });
          if (stored && allFit) T(g, cX + (tj * TN + j) * cs + (cs - 1.5) / 2, cY + (ti * TM + i) * cs + (cs - 1.5) / 2 + 0.5, outTxt[i * TN + j], { anchor: 'middle', fs: 10, fill: 'var(--ink)' });
        }
        const tLab = on && storedNow ? (allFit ? '' : 'stored') : fit([`block ${ti},${tj}`, `${ti},${tj}`], 10, TN * cs - 4);
        T(g, cX + tj * TN * cs + (TN * cs) / 2, cY + ti * TM * cs + (TM * cs) / 2, tLab, { anchor: 'middle', fs: 10, fill: on ? 'var(--accent-2)' : 'var(--ink-3)', cls: 'hsc-halo' });
        g.addEventListener('click', () => { st.bi = ti; st.bj = tj; blkCtl.set(`${ti},${tj}`); lay.rebuild(); });
      }
      const leftH = cY + 8 * cs;
      // right: on-chip panel
      const px = narrow ? 0 : bX + 8 * cs + 28;
      const py = narrow ? leftH + 26 : 0;
      const pw = w - px;
      const acs = clamp(Math.floor((pw - 24) / 9), 24, 38);
      const panelH = 30 + 2 * acs + 18 + 4 * acs + 22 + 80;
      R(svg, px, py, pw, panelH, { rx: 12, fill: 'var(--surface)', stroke: 'var(--line)' });
      T(svg, px + 12, py + 15, fit([`ON CHIP: thread block (${bi}, ${bj})`, `block (${bi}, ${bj})`], 10, pw - 24), { fs: 10, fill: 'var(--ink)' });
      // shared memory slices
      const smY = py + 30;
      T(svg, px + 12, smY + 4, 'shared memory', { fs: 10, fill: 'var(--memory)' });
      const aSx = px + 12, aSy = smY + 12;
      const s = acs * 0.5;
      const sfs = s >= 17 ? 10 : s * 0.55;
      const hasSlice = inLoop;
      for (let i = 0; i < TM; i++) for (let p = 0; p < BK; p++) {
        R(svg, aSx + p * s, aSy + i * s, s - 1.5, s - 1.5, { rx: 2, fill: 'var(--memory)', op: hasSlice ? 0.45 : 0.06, stroke: 'rgba(111,166,255,.4)' });
        if (hasSlice) T(svg, aSx + p * s + (s - 1.5) / 2, aSy + i * s + (s - 1.5) / 2 + 0.5, String(A[(bi * TM + i) * K + kCur * BK + p]), { anchor: 'middle', fs: sfs, fill: 'var(--ink)' });
      }
      const bSx = aSx + BK * s + 18, bSy = aSy;
      for (let p = 0; p < BK; p++) for (let j = 0; j < TN; j++) {
        R(svg, bSx + j * s, bSy + p * s, s - 1.5, s - 1.5, { rx: 2, fill: 'var(--memory)', op: hasSlice ? 0.45 : 0.06, stroke: 'rgba(111,166,255,.4)' });
        if (hasSlice) T(svg, bSx + j * s + (s - 1.5) / 2, bSy + p * s + (s - 1.5) / 2 + 0.5, String(B[(kCur * BK + p) * N + bj * TN + j]), { anchor: 'middle', fs: sfs, fill: 'var(--ink)' });
      }
      T(svg, bSx + TN * s + 10, aSy + s, hasSlice ? fit([`K-slice ${kCur + 1} of ${KT}`, `${kCur + 1}/${KT}`], 10, pw - (bSx - px) - TN * s - 20) : '', { fs: 10, fill: 'var(--accent-2)' });
      // accumulators: registers are storage, so they are drawn in the memory colour
      const rY = aSy + 2 * acs + 14;
      const post = step >= KT + 1;
      T(svg, px + 12, rY - 4, post ? fit(['registers: tile after the epilogue', 'registers (after epilogue)'], 10, pw - 24) : fit(['registers: accumulators', 'registers'], 10, pw - 24), { fs: 10, fill: 'var(--memory)' });
      for (let i = 0; i < TM; i++) for (let j = 0; j < TN; j++) {
        const v = post ? out[i * TN + j] : acc[i * TN + j];
        const changed = post && out[i * TN + j] !== acc[i * TN + j];
        R(svg, px + 12 + j * acs, rY + 4 + i * acs, acs - 2, acs - 2, { rx: 4, fill: 'var(--memory)', op: 0.12 + Math.min(0.4, Math.abs(v) / 20), stroke: changed ? 'var(--accent)' : 'rgba(111,166,255,.45)', sw: changed ? 1.6 : 1 });
        T(svg, px + 12 + j * acs + (acs - 2) / 2, rY + 4 + i * acs + (acs - 2) / 2 + 0.5, fmtv(v), { anchor: 'middle', fs: Math.max(10, Math.min(12, acs * 0.36)), fill: v < 0 ? 'var(--ink-2)' : 'var(--ink)' });
      }
      // phase strip: mainloop k-steps (instructions running: green), epilogue (neutral), store (to memory: blue)
      const phY = rY + 4 + TM * acs + 16;
      const segs = [];
      for (let k = 0; k < KT; k++) segs.push({ l: 'k' + (k + 1), on: step === k + 1, done: step > k + 1, c: 'var(--core)' });
      segs.push({ l: 'epi', on: step === KT + 1, done: step > KT + 1, c: 'var(--ink-3)' }, { l: 'store', on: step === KT + 2, done: false, c: 'var(--memory)' });
      const sgw = (pw - 24 - (segs.length - 1) * 4) / segs.length;
      segs.forEach((sg, k) => {
        const x = px + 12 + k * (sgw + 4);
        R(svg, x, phY, sgw, 22, { rx: 5, fill: sg.c, op: sg.on ? 0.45 : sg.done ? 0.2 : 0.06, stroke: sg.on ? 'var(--accent)' : 'var(--line)', sw: sg.on ? 1.6 : 1 });
        T(svg, x + sgw / 2, phY + 11.5, fit([sg.l, sg.l.slice(0, 3)], 10, sgw - 2), { anchor: 'middle', fs: 10, fill: sg.on || sg.done ? 'var(--ink)' : 'var(--ink-3)' });
      });
      T(svg, px + 12, phY + 38, 'mainloop', { fs: 10, fill: 'var(--core)' });
      T(svg, px + 12 + KT * (sgw + 4), phY + 38, 'epilogue', { fs: 10, fill: 'var(--ink-2)' });
      T(svg, px + 12, phY + 58, fit(['MMA: on Tensor Cores in real kernels', 'MMA: Tensor Cores (real kernels)', 'MMA → Tensor Cores'], 10, pw - 24), { fs: 10, fill: 'var(--ink-3)' });
      // data movement arrows
      const arr = { stroke: 'var(--accent)', sw: 1.4, dash: '4 3' };
      if (inLoop) {
        const aSl = { x: aX + kCur * BK * cs, y: aY + bi * TM * cs, w: BK * cs, h: TM * cs };
        const bSl = { x: bX + bj * TN * cs, y: bY + kCur * BK * cs, w: TN * cs, h: BK * cs };
        if (!narrow) {
          const ex = aSx - 4, ey = aSy + TM * s / 2;
          CurveArrow(svg, aSl.x + aSl.w / 2, aSl.y - 2, aSl.x + aSl.w / 2, aY - gap / 2, ex - 40, ey, ex, ey, arr);
          const fx = bSl.x + bSl.w + 2, fy = bSl.y + bSl.h / 2;
          CurveArrow(svg, fx, fy, fx + 30, fy, bSx + TN * s - 6, bSy - 30, bSx + TN * s - 6, bSy - 3, arr);
        } else {
          CurveArrow(svg, aSl.x + aSl.w / 2, aSl.y + aSl.h + 2, aSl.x + aSl.w / 2, py - 10, aSx + BK * s / 2, aSy - 30, aSx + BK * s / 2, aSy - 3, arr);
          const fx = bSl.x + bSl.w + 2, fy = bSl.y + bSl.h / 2;
          CurveArrow(svg, fx, fy, w - 2, fy, w - 2, bSy - 40, bSx + TN * s / 2, bSy - 3, arr);
        }
      } else if (storedNow) {
        const tile = { x: cX + bj * TN * cs, y: cY + bi * TM * cs, w: TN * cs, h: TM * cs };
        const gx = px + 12, gy = rY + 4 + TM * acs / 2;
        if (!narrow) CurveArrow(svg, gx - 4, gy, gx - 40, gy, tile.x + tile.w + 40, tile.y + tile.h / 2, tile.x + tile.w + 3, tile.y + tile.h / 2, arr);
        else CurveArrow(svg, gx + TN * acs / 2, rY - 14, gx + TN * acs / 2, py - 10, tile.x + tile.w / 2, tile.y + tile.h + 30, tile.x + tile.w / 2, tile.y + tile.h + 3, arr);
      }
      sizeSvg(svg, w, Math.max(leftH, py + panelH) + 4);
      sI.set(`${iters} / ${KT}`);
      sF.set(GG.fmt.int(TM * TN * BK * iters));
      sE.set(post ? ep.l : 'not yet');
      // why
      let why;
      if (step === 0) why = `Thread block (${bi}, ${bj}) owns the 4×4 tile of C in rows ${bi * TM}–${bi * TM + TM - 1} and columns ${bj * TN}–${bj * TN + TN - 1}. Its accumulators start at zero, in registers.`;
      else if (inLoop) why = `<b>Mainloop</b>, iteration ${kCur + 1} of ${KT}: copy a 4×2 slice of A and a 2×4 slice of B from global into shared memory (copper arrows), then multiply-accumulate: acc += A-slice @ B-slice (${TM * TN * BK} FMAs). Walking K in slices like this is the tiling strategy.`;
      else if (step === KT + 1) {
        const ch = out.filter((v, q) => v !== acc[q]).length;
        why = `<b>Epilogue</b>: the accumulators hold the finished dot products; post-process them while still in registers (${ep.d}). ${ch} of 16 values changed (copper outline).`;
      } else why = `<b>Store</b>: write the finished tile from registers to C in global memory (copper arrow)${allFit ? '' : '; the 16 values written are the ones shown in the register tile, which are too wide to print in C’s small cells at this screen width'}. The other three blocks do the same for their tiles, in parallel. Click another tile of C to follow its block.`;
      f.setWhy(why);
    });
  }

  const MULADD_CODE = `template <typename T>
T muladd(T a, T b, T c) { return a * b + c; }

float  x = muladd<float>(2.0f, 3.0f, 1.0f);  // instantiates muladd<float>
double y = muladd(2.0, 3.0, 1.0);            // T deduced: muladd<double>`;

  GG.entry('cutlass', {
    render(body, ctx) {
      const s = ctx.html(body, `
        <p>CUDA Templates for Linear Algebra Subroutines and Solvers (<strong>CUTLASS</strong>) is a library of abstractions for implementing high-performance linear algebra in <a data-term="cuda-programming-model">CUDA</a> <a data-term="kernel">kernels</a>. Like <a data-term="cublas">cuBLAS</a>, CUTLASS is named in reference to the <a href="https://netlib.org/blas/blast-forum/">Basic Linear Algebra Subprograms (BLAS)</a> standard for low-level routines for linear algebraic computations.</p>
        <p>Unlike cuBLAS, CUTLASS is a toolkit for <em>constructing</em> kernels, rather than a library of ready-to-call routines. cuBLAS hands you a finished matrix multiplication; CUTLASS hands you the parts to build your own, including kernels no library ships, such as a matrix multiplication fused with a custom post-processing step. (NVIDIA’s cuBLASLt API does offer a fixed menu of fused post-processing, like a bias add followed by a ReLU; with CUTLASS you write your own.)</p>
        <p>CUTLASS is primarily associated with the third level of the BLAS hierarchy: general matrix multiplications, or “GEMMs”. The levels are named for what they operate on, and Fig. 1 shows why the third is the one worth building a toolkit for.</p>
        <div data-slot="levels"></div>
        ${GG.noteHTML('beyond', `<p>BLAS Level 1 routines work on vectors, Level 2 on a matrix and a vector, Level 3 on matrices. Only Level 3 reuses each loaded number many times: a GEMM on n × n matrices (C ← αAB + βC) does about 2n³ arithmetic while reading only 3n² inputs (A, B and C) and writing n² outputs, so its <a data-term="arithmetic-intensity">arithmetic intensity</a> grows with n. That is what lets a GEMM be <a data-term="compute-bound">compute-bound</a> and keep the <a data-term="tensor-core">Tensor Cores</a> busy, where Level 1 and 2 routines are always limited by <a data-term="memory-bandwidth">memory bandwidth</a>.</p>`)}
        <h3>Templates: written once, instantiated many times</h3>
        <p>As the name suggests, CUTLASS includes a collection of <a data-term="cuda-c">CUDA C++</a> template abstractions. <a href="https://en.cppreference.com/cpp/language/templates">Templates</a> are the C++ implementation of <a href="https://bartoszmilewski.com/2014/09/22/parametricity-money-for-nothing-and-theorems-for-free/">parametric polymorphism</a>, which you may have encountered in the form of <a href="https://doc.rust-lang.org/rust-by-example/generics.html">generics</a> in other languages. Polymorphic functions are written once but can operate on inputs with different types.</p>
        <div data-slot="muladd"></div>
        <p>In C++, the compiler generates (“instantiates”) a separate copy of a template for each distinct set of arguments it is used with. For kernels that is the whole point. Template parameters can be tile sizes, pipeline depths, memory layouts and epilogue operations as well as element types, so every instantiated kernel has those choices compiled in as constants: loops can be fully unrolled and index arithmetic folded away, for exactly that configuration.</p>
        <div data-slot="templates"></div>
        <h3>CuTe at the core</h3>
        <p>The core of modern CUTLASS is the <a data-term="cute">CuTe</a> library, which defines <code>Layout</code> and <code>Tensor</code> types for composably describing and manipulating tensors of <a data-term="memory-hierarchy">data</a> and <a data-term="thread-hierarchy">threads</a>. It is not to be confused with <a data-term="cute-dsl">CuTe DSL</a>, which exposes CuTe/CUTLASS templates via a Domain-Specific Language (DSL) in Python.</p>
        <h3>Three levels: device, kernel, collective</h3>
        <p>Atop CuTe, CUTLASS exposes a header-only CUDA C++ library (everything lives in header files that you include; there is no separate binary to link, which suits templates, since the compiler needs their full source to instantiate them). It operates at three levels: the whole <code>device</code>, a single <a data-term="kernel"><code>kernel</code></a>, or a <code>collective</code> of <a data-term="thread">threads</a>, typically a <a data-term="thread-block">thread block</a>.</p>
        <div data-slot="dlevels"></div>
        ${GG.noteHTML('beyond', `<p>In the CUTLASS 3.x sources these levels are namespaces. For GEMM: <code>cutlass::gemm::device</code> (e.g. <code>GemmUniversalAdapter</code>), <code>cutlass::gemm::kernel</code> (e.g. <code>GemmUniversal</code>) and <code>cutlass::gemm::collective</code> (e.g. <code>CollectiveMma</code>, the mainloop), with epilogues under <code>cutlass::epilogue::collective</code>.</p>`)}
        <h3>Mainloops and epilogues</h3>
        <p>At the <code>collective</code> layer, matrix-matrix multiplications are typically split into “mainloops” and “epilogues”. <strong>Mainloops</strong> express the core algorithm, like tiling strategies: how a thread block walks along the shared K dimension, staging slices of A and B in <a data-term="shared-memory">shared memory</a> and accumulating partial products in <a data-term="registers">registers</a>. <strong>Epilogues</strong> describe post-processing steps, like the application of scaling factors or scalar non-linearities (popular in neural networks), applied to the finished accumulators before they are written out.</p>
        <div data-slot="mainloop"></div>
        ${GG.noteHTML('intuition', `<p>The epilogue is where a CUTLASS GEMM gets its fusion. Applying a scale and a ReLU to values that are already sitting in registers costs almost nothing; doing it in a separate kernel would mean writing C to global memory and reading it all back. It is the same saving that <a data-term="cudnn">cuDNN</a> gets from operation fusion.</p>`)}
        <h3>Why people put up with it</h3>
        <p>CUTLASS is very commonly used to write some of the highest-performing kernels, especially matrix-matrix multiplications on hardware from more recent <a data-term="streaming-multiprocessor-architecture">Streaming Multiprocessor architectures</a>. These kernels require careful programming of the <a data-term="tensor-core">Tensor Cores</a> to achieve anything like peak <a data-term="perf">performance</a>, and CUTLASS’s abstractions are built for exactly that.</p>
        <p>CUTLASS is <a href="https://github.com/nvidia/cutlass">open source and available on GitHub</a>. The library also includes many implementations of high-performance open-source kernels using CUTLASS, which are regularly used as references elsewhere in open-source kernel development. The glossary highly recommends the <a href="https://research.colfax-intl.com/">popular tutorials by Jay Shah of Colfax International</a>, which explain in detail how the key components of CUTLASS are used to achieve maximum performance.</p>
        ${GG.noteHTML('quote', `<p>“Note, however, that like most C++ template metaprogramming, CUTLASS is not for the faint of heart!”</p>`)}
        <div data-slot="reading"></div>
      `);
      guard(() => figLevels(ctx, s.levels));
      guard(() => codeAt(ctx, s.muladd, { lang: 'cpp', code: MULADD_CODE, caption: 'a minimal template (ours, not from the glossary)', notes: { 1: '<code>T</code> is a type parameter: a placeholder filled in at compile time.', 2: 'One definition, written once, for any <code>T</code> that supports <code>*</code> and <code>+</code>.', 4: 'Explicit argument: the compiler generates <code>muladd&lt;float&gt;</code>.', 5: 'Argument deduced from the call: a second, separate function, <code>muladd&lt;double&gt;</code>.' } }));
      guard(() => figTemplates(ctx, s.templates));
      guard(() => figDeviceLevels(ctx, s.dlevels));
      guard(() => figMainloop(ctx, s.mainloop));
      ctx.reading(s.reading, [
        { href: 'https://github.com/nvidia/cutlass', label: 'CUTLASS on GitHub', note: 'source, examples and reference kernels' },
        { href: 'https://research.colfax-intl.com/', label: 'Colfax Research', note: 'Jay Shah’s CUTLASS tutorials' },
        { href: 'https://netlib.org/blas/blast-forum/', label: 'BLAS Technical Forum standard', note: 'netlib' },
        { href: 'https://en.cppreference.com/cpp/language/templates', label: 'Templates', note: 'cppreference' },
        { href: 'https://bartoszmilewski.com/2014/09/22/parametricity-money-for-nothing-and-theorems-for-free/', label: 'Parametricity: Money for Nothing and Theorems for Free', note: 'Bartosz Milewski on parametric polymorphism' },
        { href: 'https://doc.rust-lang.org/rust-by-example/generics.html', label: 'Generics', note: 'Rust by Example' },
      ]);
      keepCase(body);
    },
  });

  /* ═════════════════════════════════════════════════════════════
     CuTe
     ═════════════════════════════════════════════════════════════ */
  const TRANSPOSE_CODE = `// one CuTe trick: transpose a row-major matrix just using Layouts
template <typename T>
__global__ void transpose_kernel(const T* __restrict__ d_S,
                                 T* __restrict__ d_D,
                                 int M, int N)
{
    // define the Shape of tiles worked on by thread blocks
    using b = Int<32>;
    auto block_shape = make_shape(b{}, b{});

    // define the Shape of input/output Tensors
    auto tensor_shape = make_shape(M, N);

    // define the Layout of the input and output Tensors in global memory
    auto gmemLayoutS  = make_layout(tensor_shape, GenRowMajor{}); // input:  row-major
    auto gmemLayoutDT = make_layout(tensor_shape, GenColMajor{}); // output: col-major

    // construct the Tensors
    auto tensor_S  = make_tensor(make_gmem_ptr(d_S), gmemLayoutS);
    auto tensor_DT = make_tensor(make_gmem_ptr(d_D), gmemLayoutDT);

    // define a tile-ing of the Tensors (as a "Tensor of Tensors")
    auto tiled_tensor_S  = tiled_divide(tensor_S,  block_shape);
    auto tiled_tensor_DT = tiled_divide(tensor_DT, block_shape);

    // pull out the tiles this thread block will be working on
    auto tile_S  = tiled_tensor_S (make_coord(_, _), blockIdx.x, blockIdx.y);
    auto tile_DT = tiled_tensor_DT(make_coord(_, _), blockIdx.x, blockIdx.y);

    // create a Layout for threads in the thread block
    auto thr_layout = make_layout(
        make_shape(Int<8>{}, Int<32>{}),
        GenRowMajor{}
    );

    // pull out the tile this thread will work on
    auto thr_tile_S  = local_partition(tile_S,  thr_layout, threadIdx.x);
    auto thr_tile_DT = local_partition(tile_DT, thr_layout, threadIdx.x);

    // define a "Tensor" in register memory
    auto rmem = make_tensor_like<T>(thr_tile_S);

    // copy tile into registers
    copy(thr_tile_S, rmem);
    // copy tile out of registers as though it were column-major
    copy(rmem, thr_tile_DT);
}`;

  /* ── a tiny CuTe-layout engine: parse "Shape:Stride", evaluate, format ── */
  const Lay = {
    parse(str) {
      const src = String(str).replace(/\s+/g, '');
      const parts = src.split(':');
      if (parts.length !== 2 || !parts[0] || !parts[1]) throw new Error('write it as Shape:Stride, e.g. (4,8):(8,1)');
      const shape = Lay.tuple(parts[0]), stride = Lay.tuple(parts[1]);
      if (!Lay.congruent(shape, stride)) throw new Error('Shape and Stride must have the same nesting');
      Lay.leaves(shape).forEach((v) => { if (v < 1) throw new Error('shape entries must be at least 1'); });
      Lay.leaves(stride).forEach((v) => { if (v < 0) throw new Error('this explorer takes non-negative strides'); });
      return { shape, stride };
    },
    tuple(s) {
      let i = 0;
      const node = () => {
        if (s[i] === '(') {
          i++;
          const items = [];
          for (;;) {
            items.push(node());
            if (s[i] === ',') { i++; continue; }
            if (s[i] === ')') { i++; break; }
            throw new Error('expected “,” or “)” at position ' + (i + 1));
          }
          return items;
        }
        const m = /^_?(-?\d+)/.exec(s.slice(i));
        if (!m) throw new Error('expected a number at position ' + (i + 1));
        i += m[0].length;
        return parseInt(m[1], 10);
      };
      const n = node();
      if (i !== s.length) throw new Error('unexpected “' + s.slice(i, i + 3) + '”');
      return n;
    },
    congruent(a, b) {
      if (typeof a === 'number' || typeof b === 'number') return typeof a === typeof b;
      return a.length === b.length && a.every((x, k) => Lay.congruent(x, b[k]));
    },
    leaves(n) { return typeof n === 'number' ? [n] : n.flatMap(Lay.leaves); },
    size(n) { return typeof n === 'number' ? n : n.reduce((p, x) => p * Lay.size(x), 1); },
    /* colexicographic split of a flat index into a (possibly nested) coordinate */
    coord(shape, idx) {
      if (typeof shape === 'number') return idx;
      const out = [];
      for (const sub of shape) { const s = Lay.size(sub); out.push(Lay.coord(sub, idx % s)); idx = Math.floor(idx / s); }
      return out;
    },
    dot(coord, stride) { return typeof coord === 'number' ? coord * stride : coord.reduce((t, c, k) => t + Lay.dot(c, stride[k]), 0); },
    fmt(n) { return typeof n === 'number' ? String(n) : '(' + n.map(Lay.fmt).join(',') + ')'; },
  };

  /* Fig: Layout explorer */
  function figLayout(ctx, slot) {
    const f = fig(ctx, slot, {
      title: 'Layout explorer: Shape : Stride', hint: 'pick a preset · type a layout · hover a cell', wide: true,
      caption: 'Top: the logical coordinates (row i, column j), each cell showing the offset the layout maps it to; the grey line under the cells visits the offsets in order 0, 1, 2, …, and Walk memory sends a dot along it. Bottom: memory, one slot per offset. Pink slots are shared by several coordinates; hatched slots are skipped.',
    });
    const PRE = [
      { v: 'row', l: 'Row-major', s: '(4,8):(8,1)', d: 'Row-major: stride 8 down the rows and 1 along the columns, so moving right steps one slot and moving down skips a whole row of 8. In CuTe this is <code>GenRowMajor</code> (also called <code>LayoutRight</code>).' },
      { v: 'col', l: 'Column-major', s: '(4,8):(1,4)', d: 'Column-major: stride 1 down the rows and 4 along the columns. This is <code>GenColMajor</code> (<code>LayoutLeft</code>), and it is the order cuBLAS expects.' },
      { v: 'pad', l: 'Padded (lda = 5)', s: '(4,8):(1,5)', d: 'Column-major with a column stride of 5 for 4 rows: each column starts 5 slots after the previous one, leaving one unused slot between consecutive columns (7 in all). This is cuBLAS’s leading dimension, lda = 5, written as a Layout.' },
      { v: 'tile', l: 'Tiled', s: '((2,2),(4,2)):((1,8),(2,16))', d: 'A hierarchical layout, still 4×8. Rows split as (2,2) and columns as (4,2): inside each 2×4 tile the elements are column-major (strides 1 and 2), and the four tiles are themselves laid out column-major (strides 8 and 16). Each tile is one contiguous run of 8 slots.' },
      { v: 'bcast', l: 'Broadcast', s: '(4,8):(0,1)', d: 'A stride of 0 means stepping along that mode does not move in memory: all 4 rows read the same 8 slots. That is how a vector gets broadcast across a matrix without copying it.' },
      { v: 'thr', l: 'Threads 8×32', s: '(8,32):(32,1)', d: 'The thread layout from the transpose kernel below: 8 rows of 32, row-major, so the value at (i, j) is 32·i + j. Read it backwards and it tells thread t that it sits at row t / 32, column t mod 32.' },
    ];
    const st = { pre: 'tile', str: PRE[3].s, L: Lay.parse(PRE[3].s), hover: null, hslot: -1, walk: -1, err: '' };
    const segCtl = GG.ui.seg(f.controls, { label: 'Preset', options: PRE.map((p) => ({ value: p.v, label: p.l })), value: st.pre, onChange: (v) => { const p = PRE.find((q) => q.v === v); st.pre = v; setLayout(p.s); inp.value = p.s; } });
    const wrap = GG.el('div', { class: 'ctl' });
    wrap.append(GG.el('span', { class: 'ctl-lab', text: 'Or type a layout' }));
    const row = GG.el('div', { class: 'hsc-in-row' });
    const inp = GG.el('input', { class: 'hsc-txtin', type: 'text', value: st.str, 'aria-label': 'Layout as Shape:Stride', spellcheck: 'false', autocomplete: 'off' });
    const errEl = GG.el('div', { class: 'hsc-in-err', 'aria-live': 'polite' });
    row.append(inp);
    wrap.append(row, errEl);
    f.controls.append(wrap);
    GG.ui.button(row, { label: 'Apply', onClick: () => apply() });
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); apply(); } });
    function apply() {
      const p = PRE.find((q) => q.s.replace(/\s/g, '') === inp.value.replace(/\s/g, ''));
      st.pre = p ? p.v : null;
      segCtl.set(st.pre);
      setLayout(inp.value);
    }
    const walkAnim = GG.anim(f.stage, (t, dt) => {
      st.wt = (st.wt || 0) + dt;
      if (st.wt > 0.2) { st.wt = 0; st.walk++; if (!E || st.walk >= E.cosize) { st.walk = -1; walkAnim.stop(); walkBtn.setLabel('Walk memory', 'play'); } paint(); }
      placeDot();
    }, { autostart: false });
    const walkBtn = GG.ui.button(row, { label: 'Walk memory', icon: 'play', onClick: () => {
      if (walkAnim.running) { walkAnim.stop(); st.walk = -1; walkBtn.setLabel('Walk memory', 'play'); paint(); }
      else { st.walk = -1; st.wt = 1; walkAnim.start(); walkBtn.setLabel('Stop', 'pause'); }
    } });
    const sSz = GG.ui.stat(f.readouts, { label: '{size}', tone: 'memory' });
    const sCo = GG.ui.stat(f.readouts, { label: '{cosize}', tone: 'memory' });
    const sKind = GG.ui.stat(f.readouts, { label: 'mapping', tone: 'core' });
    const svg = svgRoot(f.stage, 'A grid of logical coordinates labelled with their memory offsets under the chosen layout, above a memory strip showing which offsets are used.');
    let E = null;
    function setLayout(str) {
      try {
        const L = Lay.parse(str);
        const top = typeof L.shape === 'number' ? 1 : L.shape.length;
        if (top > 2) throw new Error('this explorer draws rank-1 and rank-2 layouts');
        const size = Lay.size(L.shape);
        if (size > 256) throw new Error('keep the size to 256 coordinates or fewer');
        // cosize = 1 + the largest offset = 1 + Σ (shape − 1)·stride over the leaves (strides are non-negative)
        const sh = Lay.leaves(L.shape), sd = Lay.leaves(L.stride);
        const cosize = 1 + sh.reduce((t, n, k) => t + (n - 1) * sd[k], 0);
        if (cosize > 1024) throw new Error(`cosize ${GG.fmt.int(cosize)} is over 1,024: too sparse to draw`);
        const rows = top === 2 ? Lay.size(L.shape[0]) : 1;
        if (rows > 64) throw new Error('keep the first mode to 64 rows or fewer');
        if (size / rows > 64) throw new Error(top === 2 ? 'keep the second mode to 64 columns or fewer' : 'keep a rank-1 layout to 64 coordinates or fewer');
        st.L = L; st.str = str; st.err = ''; inp.classList.remove('bad');
      } catch (e) {
        st.err = e.message; inp.classList.add('bad');
      }
      errEl.textContent = st.err;
      st.hover = null; st.hslot = -1;
      lay.rebuild();
    }
    function analyse(L) {
      const rank2 = typeof L.shape !== 'number' && L.shape.length === 2;
      const m0 = rank2 ? L.shape[0] : (typeof L.shape === 'number' ? L.shape : L.shape[0]);
      const d0 = rank2 ? L.stride[0] : (typeof L.stride === 'number' ? L.stride : L.stride[0]);
      const m1 = rank2 ? L.shape[1] : null, d1 = rank2 ? L.stride[1] : null;
      const rows = rank2 ? Lay.size(m0) : 1, cols = rank2 ? Lay.size(m1) : Lay.size(m0);
      const cell = [];
      let maxOff = 0;
      for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
        const ci = rank2 ? Lay.coord(m0, i) : null, cj = Lay.coord(rank2 ? m1 : m0, j);
        const off = rank2 ? Lay.dot(ci, d0) + Lay.dot(cj, d1) : Lay.dot(cj, d0);
        cell.push({ i, j, ci, cj, off });
        if (off > maxOff) maxOff = off;
      }
      const cosize = maxOff + 1;
      const count = new Array(cosize).fill(0);
      cell.forEach((c) => count[c.off]++);
      const aliased = count.some((c) => c > 1), gaps = count.filter((c) => c === 0).length;
      // is the sharing caused by a zero stride on a mode that has more than one coordinate?
      const sh = Lay.leaves(L.shape), sd = Lay.leaves(L.stride);
      const zeroStride = sh.some((n, k) => n > 1 && sd[k] === 0);
      return { rank2, m0, d0, m1, d1, rows, cols, cell, cosize, count, aliased, gaps, zeroStride };
    }
    svg.addEventListener('pointerleave', () => { st.hover = null; st.hslot = -1; paint(); });
    // keyboard: one Tab stop; the arrow keys move a cursor over the coordinate grid
    keyNav(svg, 'Use the arrow keys to move between coordinates.', (k) => {
      if (!E) return false;
      const A = E.A;
      let c = st.hover || A.cell[0];
      let i = c.i, j = c.j;
      if (st.hover) {
        if (k === 'ArrowRight') j = Math.min(A.cols - 1, j + 1);
        else if (k === 'ArrowLeft') j = Math.max(0, j - 1);
        else if (k === 'ArrowDown') i = Math.min(A.rows - 1, i + 1);
        else if (k === 'ArrowUp') i = Math.max(0, i - 1);
        else if (k === 'Home') { i = 0; j = 0; }
        else if (k === 'End') { i = A.rows - 1; j = A.cols - 1; }
        else if (k === 'Escape') { st.hover = null; paint(); return; }
        else return false;
      } else if (!/^(Arrow|Home|End)/.test(k)) return false;
      st.hover = A.cell[i * A.cols + j]; st.hslot = -1; paint();
    });
    const lay = responsive(f.stage, (w) => {
      clear(svg);
      const A = analyse(st.L);
      const { rows, cols } = A;
      const labL = 22;
      // cell size limited by the width and, for tall layouts, by a height budget too
      // cells may be wider than tall, so a short, wide layout fills the stage instead of a corner of it
      const cw = clamp(Math.floor((w - labL - 4) / cols), 4, 96);
      const ch = clamp(Math.min(cw, Math.floor(480 / rows)), 4, 56);
      const cs = Math.min(cw, ch), gap = cs > 12 ? 2 : 1;
      const maxDigits = String(A.cosize - 1).length;
      const nfs = Math.min(12, cs * 0.4);
      const showNum = nfs >= 10 && tw('8'.repeat(maxDigits), nfs) <= cw - 3;
      const gx0 = labL, gy0 = 18;
      T(svg, gx0, 6, fit([`LOGICAL COORDINATES: ${rows} × ${cols}${A.rank2 ? '' : ' (rank 1)'}`, `${rows} × ${cols} coordinates`], 10, w - gx0), { fs: 10, fill: 'var(--ink-3)' });
      const cells = [];
      const cmax = Math.max(1, A.cosize - 1);
      // layers, bottom to top: the offset-order path (under the cells, so it never crosses a number on top),
      // the cells (hit targets), the tile separators, the walking dot, the numbers
      const gPath = G(svg), gCells = G(svg), gSep = G(svg), gDot = G(svg), gNums = G(svg);
      gNums.style.pointerEvents = 'none';
      const cx = (c) => gx0 + c.j * cw + (cw - gap) / 2, cy = (c) => gy0 + c.i * ch + (ch - gap) / 2;
      A.cell.forEach((c) => {
        const x = gx0 + c.j * cw, y = gy0 + c.i * ch;
        const g = G(gCells, { class: 'hsc-hit' });
        const r = R(g, x, y, cw - gap, ch - gap, { rx: cs > 14 ? 4 : 1.5, fill: 'var(--memory)', op: 0.1 + 0.45 * (c.off / cmax), stroke: 'rgba(111,166,255,.35)' });
        let t = null;
        if (showNum) t = T(gNums, cx(c), cy(c) + 0.5, String(c.off), { anchor: 'middle', fs: nfs, fill: 'var(--ink)', cls: 'hsc-halo' });
        g.addEventListener('pointerenter', () => { st.hover = c; st.hslot = -1; paint(); });
        g.addEventListener('click', () => { st.hover = c; st.hslot = -1; paint(); });
        cells.push({ c, r, t });
      });
      if (cs >= 14) {
        for (let i = 0; i < rows && A.rank2; i++) T(svg, gx0 - 6, gy0 + i * ch + (ch - gap) / 2, String(i), { anchor: 'end', fs: 10, fill: 'var(--ink-3)' });
        for (let j = 0; j < cols; j++) if (cw >= 22 || j % 4 === 0) T(svg, gx0 + j * cw + (cw - gap) / 2, gy0 + rows * ch + 7, String(j), { anchor: 'middle', fs: 10, fill: 'var(--ink-3)' });
      }
      // tile separators for nested modes
      const sep = (mode, horizontal) => {
        if (typeof mode === 'number') return;
        const step = Lay.size(mode[0]);
        const n = Lay.size(mode);
        for (let k = step; k < n; k += step) {
          if (horizontal) Ln(gSep, gx0 - 3, gy0 + k * ch - 1, gx0 + cols * cw + 1, gy0 + k * ch - 1, { stroke: 'var(--accent-2)', dash: '3 3', sw: 1.2 });
          else Ln(gSep, gx0 + k * cw - 1, gy0 - 3, gx0 + k * cw - 1, gy0 + rows * ch + 1, { stroke: 'var(--accent-2)', dash: '3 3', sw: 1.2 });
        }
      };
      if (A.rank2) { sep(A.m0, true); sep(A.m1, false); } else sep(A.m0, false);
      // offset-order path (only when every offset is used at most once), drawn under the cells
      const centers = new Array(A.cosize).fill(null);
      let dot = null;
      if (!A.aliased) {
        const byOff = A.cell.slice().sort((a, b) => a.off - b.off);
        byOff.forEach((c) => { centers[c.off] = { x: cx(c), y: cy(c) }; });
        Pth(gPath, 'M' + byOff.map((c) => `${r1(cx(c))},${r1(cy(c))}`).join(' L'), { stroke: 'var(--ink-3)', sw: cs > 20 ? 1.5 : 1, op: 0.9 });
        dot = GG.svg('circle', { r: cs > 20 ? 4.5 : 3, style: 'fill:var(--accent);stroke:var(--bg);stroke-width:1.5;display:none' }, gDot);
      }
      gPath.style.pointerEvents = 'none';
      gSep.style.pointerEvents = 'none';
      gDot.style.pointerEvents = 'none';
      // memory strip: at most 20 slots per line on phones, 40 on wide screens, slots at least 14 px
      const my0 = gy0 + rows * ch + 36;
      T(svg, 0, my0 - 14, fit([`MEMORY: offsets 0 to ${A.cosize - 1} (cosize ${A.cosize})`, `MEMORY: 0…${A.cosize - 1}`], 10, w), { fs: 10, fill: 'var(--ink-3)' });
      const target = w < 560 ? 20 : 40;
      const sw = clamp(Math.floor(w / Math.min(A.cosize, target)), 14, 28);
      const perLine = Math.max(1, Math.floor(w / sw));
      const lineH = sw + 18;
      const every = sw >= 26 ? 1 : sw >= 20 ? 2 : 4;
      const slots = [];
      for (let k = 0; k < A.cosize; k++) {
        const x = (k % perLine) * sw, y = my0 + Math.floor(k / perLine) * lineH;
        const n = A.count[k];
        const g = G(svg, { class: 'hsc-hit' });
        const r = R(g, x, y, sw - 2, sw - 2, { rx: 2, fill: n === 0 ? 'url(#hsc-hatch)' : n > 1 ? 'var(--special)' : 'var(--memory)', op: n === 0 ? 1 : n > 1 ? 0.45 : 0.1 + 0.45 * (k / cmax), stroke: n === 0 ? 'var(--line-2)' : n > 1 ? 'var(--special)' : 'rgba(111,166,255,.35)' });
        if (n > 1 && sw >= 20) T(g, x + (sw - 2) / 2, y + (sw - 2) / 2 + 0.5, '×' + n, { anchor: 'middle', fs: 10, fill: 'var(--ink)' });
        if (k % every === 0 || k % perLine === 0) T(g, x + (sw - 2) / 2, y + sw + 6, String(k), { anchor: 'middle', fs: 10, fill: 'var(--ink-3)' });
        g.addEventListener('pointerenter', () => { st.hslot = k; st.hover = null; paint(); });
        g.addEventListener('click', () => { st.hslot = k; st.hover = null; paint(); });
        slots.push(r);
      }
      // hatch pattern for unused slots
      const defs = GG.svg('defs', null, svg);
      const pat = GG.svg('pattern', { id: 'hsc-hatch', width: 5, height: 5, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
      GG.svg('line', { x1: 0, y1: 0, x2: 0, y2: 5, style: 'stroke:var(--ink-3);stroke-width:1.5' }, pat);
      const lines = Math.ceil(A.cosize / perLine);
      sizeSvg(svg, w, my0 + lines * lineH + 4);
      E = { A, cells, slots, cosize: A.cosize, cmax, showNum, centers, dot };
      sSz.set(String(A.rows * A.cols));
      sCo.set(String(A.cosize));
      const pl = (n, wd) => `${GG.fmt.int(n)} ${wd}${n === 1 ? '' : 's'}`;
      sKind.set(A.aliased ? (A.zeroStride ? 'aliasing (stride 0)' : 'aliasing (offsets overlap)') : A.gaps ? `${pl(A.gaps, 'unused slot')}` : 'one-to-one', A.aliased ? 'special' : A.gaps ? 'control' : 'core');
      paint();
    });
    // the walking dot glides from the previous used offset to the current one
    function placeDot() {
      if (!E || !E.dot) return;
      const at = (k) => { for (; k >= 0; k--) if (E.centers[k]) return E.centers[k]; return null; };
      const p1 = st.walk >= 0 ? at(st.walk) : null;
      if (!p1) { E.dot.style.display = 'none'; return; }
      const p0 = at(st.walk - 1) || p1;
      const u = GG.reducedMotion ? 1 : Math.min(1, (st.wt || 0) / 0.14);
      const e = u * u * (3 - 2 * u);
      E.dot.setAttribute('cx', r1(p0.x + (p1.x - p0.x) * e));
      E.dot.setAttribute('cy', r1(p0.y + (p1.y - p0.y) * e));
      E.dot.style.display = '';
    }
    function termStr(c) {
      const A = E.A;
      const leavesC = A.rank2 ? [...Lay.leaves(c.ci), ...Lay.leaves(c.cj)] : Lay.leaves(c.cj);
      const leavesD = A.rank2 ? [...Lay.leaves(A.d0), ...Lay.leaves(A.d1)] : Lay.leaves(A.d0);
      return leavesC.map((x, k) => `${x}·${leavesD[k]}`).join(' + ') + ` = <b>${c.off}</b>`;
    }
    function paint() {
      if (!E) return;
      const A = E.A;
      placeDot();
      const focusOff = st.walk >= 0 ? st.walk : st.hslot >= 0 ? st.hslot : st.hover ? st.hover.off : -1;
      E.cells.forEach(({ c, r }) => {
        const on = c.off === focusOff;
        const self = st.hover && st.hover === c;
        r.style.fill = on ? 'var(--accent)' : 'var(--memory)';
        r.style.fillOpacity = on ? 0.55 : 0.1 + 0.45 * (c.off / E.cmax);
        r.style.stroke = self ? 'var(--ink)' : on ? 'var(--accent)' : 'rgba(111,166,255,.35)';
      });
      E.slots.forEach((r, k) => {
        const n = A.count[k];
        if (k === focusOff) { r.style.fill = 'var(--accent)'; r.style.fillOpacity = 0.7; r.style.stroke = 'var(--accent)'; }
        else { r.style.fill = n === 0 ? 'url(#hsc-hatch)' : n > 1 ? 'var(--special)' : 'var(--memory)'; r.style.fillOpacity = n === 0 ? 1 : n > 1 ? 0.45 : 0.1 + 0.45 * (k / E.cmax); r.style.stroke = n === 0 ? 'var(--line)' : n > 1 ? 'var(--special)' : 'rgba(111,166,255,.35)'; }
      });
      const p = PRE.find((q) => q.v === st.pre);
      const lstr = `<code>${esc(Lay.fmt(st.L.shape))}:${esc(Lay.fmt(st.L.stride))}</code>`;
      let why;
      if (st.err) why = `That layout can’t be drawn here (${esc(st.err)}), so the figure still shows ${lstr}.`;
      else if (st.hover) {
        const c = st.hover;
        const coordTxt = A.rank2
          ? (typeof A.m0 === 'number' && typeof A.m1 === 'number' ? `(${c.i}, ${c.j})` : `(${c.i}, ${c.j}), which splits into ${Lay.fmt(c.ci)} and ${Lay.fmt(c.cj)}`)
          : (typeof A.m0 === 'number' ? `(${c.j})` : `(${c.j}) = ${Lay.fmt(c.cj)}`);
        why = `Coordinate ${coordTxt}: multiply each coordinate by its stride and add: ${termStr(c)}.${A.count[c.off] > 1 ? ` ${A.count[c.off]} coordinates share this offset.` : ''}`;
      } else if (focusOff >= 0) {
        const who = A.cell.filter((c) => c.off === focusOff).map((c) => (A.rank2 ? `(${c.i}, ${c.j})` : `(${c.j})`));
        why = who.length ? `Memory slot <b>${focusOff}</b> holds coordinate${who.length > 1 ? 's' : ''} ${who.join(', ')}.` : `Memory slot <b>${focusOff}</b> is not used by any coordinate: the layout steps over it.`;
      } else {
        const nC = A.rows * A.cols, pl = (n, w) => `${GG.fmt.int(n)} ${w}${n === 1 ? '' : 's'}`;
        why = (p ? p.d : `Your layout ${lstr}: ${pl(nC, 'coordinate')} over ${pl(A.cosize, 'slot')}, ${A.aliased ? (A.zeroStride ? 'with some slots shared because a stride is 0' : 'with some slots shared because the strides make offsets overlap') : A.gaps ? `skipping ${pl(A.gaps, 'slot')}` : 'one slot each'}.`) + (E.showNum ? '' : ' (The cells are too small for their numbers at this width: hover or tap one to read its offset.)');
      }
      f.setWhy(why);
    }
  }

  /* Fig: Tensor = pointer + Layout; copying between two views transposes */
  function figTensorCopy(ctx, slot) {
    const f = fig(ctx, slot, {
      title: 'Two Tensors, one copy, a transpose', hint: 'play or drag', wide: true,
      caption: 'The whole transpose kernel in miniature, on a 3 × 4 matrix. Copying element (i, j) from a row-major Tensor to a column-major Tensor of the same shape writes it to d_D[i + j·3]. Here one element moves at a time; the real kernel moves all of them in parallel.',
    });
    const M = 3, N = 4, n = M * N;
    const LET = 'abcdefghijkl';
    const st = { k: 5, t: 0 };
    const sl = GG.ui.slider(f.controls, { label: 'Elements copied', min: 0, max: n, value: st.k, onInput: (v) => { st.k = v; anim.stop(); pb.sync(); paint(); } });
    const anim = GG.anim(f.stage, (t, dt) => {
      st.t += dt;
      if (st.t > 0.55) { st.t = 0; st.k = st.k >= n ? 0 : st.k + 1; sl.set(st.k); paint(); }
    }, { autostart: false });
    const pb = GG.ui.playButton(f.controls, anim);
    const sA = GG.ui.stat(f.readouts, { label: 'Last copy', tone: 'memory' });
    const sD = GG.ui.stat(f.readouts, { label: '{d_D} as 4×3 row-major', tone: 'core' });
    const svg = svgRoot(f.stage, 'Memory d_S holds a 3 by 4 matrix row-major; a row-major tensor over it and a column-major tensor over d_D share coordinates; copying element by element fills d_D so that it reads as the transpose.');
    let E = null;
    const lay = responsive(f.stage, (w) => {
      clear(svg);
      const narrow = w < 560;
      const sw = clamp(Math.floor((w - 4) / n), 18, 40);
      const stripX = Math.max(0, (w - sw * n) / 2);
      const cs = clamp(Math.floor((narrow ? (w - 50) / 2 : (w - 120) / 3) / N), 20, 42);
      const mk = (y, lab, sub) => { T(svg, stripX, y - 22, lab, { fs: 10.5, fill: 'var(--ink)', weight: 600 }); T(svg, stripX, y - 8, sub, { fs: 10, fill: 'var(--ink-3)' }); };
      const strip = (y, vals) => vals.map((v, k) => {
        const g = G(svg);
        const r = R(g, stripX + k * sw, y, sw - 2, sw - 2, { rx: 3, fill: 'var(--memory)', op: 0.14, stroke: 'rgba(111,166,255,.4)' });
        const t = T(g, stripX + k * sw + (sw - 2) / 2, y + (sw - 2) / 2 + 0.5, v, { anchor: 'middle', fs: Math.min(13, sw * 0.5), fill: 'var(--ink)' });
        T(g, stripX + k * sw + (sw - 2) / 2, y + sw + 6, String(k), { anchor: 'middle', fs: 10, fill: 'var(--ink-3)' });
        return { r, t };
      });
      let y = 34;
      mk(y, 'd_S', 'input pointer: 12 values, written row-major');
      const sS = strip(y, LET.split(''));
      y += sw + 58;
      // tensor views
      const gxS = narrow ? 0 : Math.max(0, (w - (3 * N * cs + 2 * 60)) / 2);
      const gxD = gxS + N * cs + (narrow ? 44 : 60);
      T(svg, gxS, y - 22, 'tensor_S', { fs: 10.5, fill: 'var(--ink)', weight: 600 });
      T(svg, gxS, y - 8, fit(['d_S + (3,4):(4,1)', '(3,4):(4,1)'], 10, N * cs), { fs: 10, fill: 'var(--ink-3)' });
      T(svg, gxD, y - 22, 'tensor_DT', { fs: 10.5, fill: 'var(--ink)', weight: 600 });
      T(svg, gxD, y - 8, fit(['d_D + (3,4):(1,3)', '(3,4):(1,3)'], 10, N * cs), { fs: 10, fill: 'var(--ink-3)' });
      const mS = matrixSvg(svg, gxS, y, M, N, cs, { vals: (i, j) => LET[i * N + j] });
      const mD = matrixSvg(svg, gxD, y, M, N, cs, { vals: () => '' });
      const arrow = G(svg);
      Arrow(arrow, gxS + N * cs + 4, y + (M * cs) / 2, gxD - 6, y + (M * cs) / 2, { stroke: 'var(--accent)', sw: 1.6 });
      T(arrow, (gxS + N * cs + gxD) / 2, y + (M * cs) / 2 - 12, 'copy', { anchor: 'middle', fs: 10, fill: 'var(--accent-2)' });
      let tx = null, ty = y;
      if (!narrow) {
        tx = gxD + N * cs + 60;
        T(svg, tx, y - 22, 'd_D read row-major', { fs: 10.5, fill: 'var(--ink)', weight: 600 });
        T(svg, tx, y - 8, fit(['as a 4×3 matrix', '4×3'], 10, w - tx), { fs: 10, fill: 'var(--ink-3)' });
      }
      const yT = y + M * cs + 60;
      y = yT;
      mk(y, 'd_D', 'output pointer: filled at offset i + j·3');
      const sDs = strip(y, new Array(n).fill(''));
      y += sw + 20;
      let mT;
      if (narrow) {
        y += 38;
        tx = stripX; ty = y;
        T(svg, tx, y - 22, 'd_D read row-major as 4×3', { fs: 10.5, fill: 'var(--ink)', weight: 600 });
        T(svg, tx, y - 8, 'the transpose of S', { fs: 10, fill: 'var(--ink-3)' });
        mT = matrixSvg(svg, tx, ty, N, M, cs, { vals: () => '', fill: 'var(--core)', stroke: 'rgba(69,212,155,.45)' });
        y += N * cs + 8;
      } else {
        mT = matrixSvg(svg, tx, ty, N, M, Math.min(cs, Math.floor((M * cs) / N) + 6), { vals: () => '', fill: 'var(--core)', stroke: 'rgba(69,212,155,.45)' });
        y = Math.max(y, ty + N * Math.min(cs, Math.floor((M * cs) / N) + 6) + 8);
      }
      sizeSvg(svg, w, y);
      E = { sS, mS, mD, sDs, mT };
      paint();
    });
    function paint() {
      if (!E) return;
      const k = st.k;
      const cur = k - 1;
      for (let q = 0; q < n; q++) {
        const i = Math.floor(q / N), j = q % N, dst = i + j * M;
        const done = q < k, now = q === cur;
        E.sS[q].r.style.stroke = now ? 'var(--accent)' : 'rgba(111,166,255,.4)';
        E.sS[q].r.style.fillOpacity = now ? 0.4 : 0.14;
        E.mS.cells[i][j].r.style.stroke = now ? 'var(--accent)' : 'rgba(111,166,255,.45)';
        E.mS.cells[i][j].r.style.fillOpacity = now ? 0.4 : 0.13;
        E.mD.cells[i][j].t.textContent = done ? LET[q] : '';
        E.mD.cells[i][j].r.style.stroke = now ? 'var(--accent)' : 'rgba(111,166,255,.45)';
        E.mD.cells[i][j].r.style.fillOpacity = now ? 0.4 : done ? 0.22 : 0.08;
        E.sDs[dst].t.textContent = done ? LET[q] : '';
        E.sDs[dst].r.style.stroke = now ? 'var(--accent)' : 'rgba(111,166,255,.4)';
        E.sDs[dst].r.style.fillOpacity = now ? 0.4 : done ? 0.25 : 0.08;
        // d_D read row-major as N x M: element (a, b) = d_D[a*M + b]
        const a = Math.floor(dst / M), b = dst % M;
        E.mT.cells[a][b].t.textContent = done ? LET[q] : '';
        E.mT.cells[a][b].r.style.fillOpacity = done ? 0.2 : 0.06;
        E.mT.cells[a][b].r.style.stroke = now ? 'var(--accent)' : 'rgba(69,212,155,.45)';
      }
      if (cur >= 0) {
        const i = Math.floor(cur / N), j = cur % N;
        sA.set(`S(${i},${j}) → d_D[${i + j * M}]`);
        f.setWhy(`Copy <b>${LET[cur]}</b>: tensor_S(${i}, ${j}) reads d_S[${i}·4 + ${j}] = d_S[${i * N + j}]; tensor_DT(${i}, ${j}) writes d_D[${i} + ${j}·3] = d_D[<b>${i + j * M}</b>]. Same coordinate, different layout, different address.${k === n ? ' All 12 copied: read d_D row-major as 4×3 and every row of S has become a column.' : ''}`);
      } else {
        sA.set('none yet');
        f.setWhy('Nothing copied yet. Both Tensors use the same logical coordinates (i, j); only their layouts, and so their addresses, differ. Press Play or drag the slider.');
      }
      sD.set(k === n ? '= S' + TR : `${k} of ${n} in place`, k === n ? 'core' : 'memory');
    }
  }

  /* Fig: walking through the transpose kernel */
  function figKernelWalk(ctx, slot) {
    const f = fig(ctx, slot, {
      title: '{transpose_kernel}, step by step', hint: 'step · move the block and thread', wide: true, class: 'hsc-compact',
      caption: 'The excerpt shows the lines each step is about (verbatim from the kernel above). Right: the 32 × 32 tile of the chosen block, one square per element. The naive kernel has no bounds checks, so M and N are kept to multiples of 32; the memory strips assume T = float (4 bytes).',
    });
    const STEPS = [
      { label: 'Shapes', from: '// define the Shape of tiles', to: 'auto tensor_shape' },
      { label: 'Layouts', from: '// define the Layout', to: 'auto gmemLayoutDT' },
      { label: 'Tensors', from: '// construct the Tensors', to: 'auto tensor_DT' },
      { label: 'Tile them', from: '// define a tile-ing', to: 'auto tiled_tensor_DT' },
      { label: 'This block’s tile', from: '// pull out the tiles', to: 'auto tile_DT' },
      { label: 'Thread layout', from: '// create a Layout for threads', to: '    );' },
      { label: 'Partition', from: '// pull out the tile this thread', to: 'auto thr_tile_DT' },
      { label: 'Registers', from: '// define a "Tensor" in register', to: 'auto rmem' },
      { label: 'Copy in', from: '// copy tile into registers', to: 'copy(thr_tile_S, rmem);' },
      { label: 'Copy out', from: '// copy tile out of registers', to: 'copy(rmem, thr_tile_DT);' },
    ];
    STEPS.forEach((s) => { s.a = lineOf(TRANSPOSE_CODE, s.from); s.b = lineOf(TRANSPOSE_CODE, s.to, s.a - 1); });
    const st = { step: 0, M: 64, N: 96, bx: 1, by: 2, tid: 37 };
    let lay = null, code = null;
    const exc = GG.el('div', { class: 'code no-ln hsc-exc' });
    const excPre = GG.el('pre', { tabindex: '0' });
    exc.append(excPre);
    f.stage.append(exc);
    const svg = svgRoot(f.stage, 'Left: the input and output matrices, tiled into 32 by 32 tiles, with the chosen block’s tile highlighted. Right: that tile, with the chosen thread’s four elements and its warp highlighted, and memory strips for the warp’s loads and stores.');
    GG.ui.stepper(f.controls, { label: 'Step', steps: STEPS, onStep: (i) => { st.step = i; if (lay) lay.rebuild(); } });
    const dimOpts = [32, 64, 96, 128].map((v) => ({ value: v, label: String(v) }));
    GG.ui.seg(f.controls, { label: 'M (rows)', options: dimOpts, value: st.M, onChange: (v) => { st.M = v; st.bx = Math.min(st.bx, v / 32 - 1); bxS.input.max = v / 32 - 1; bxS.set(st.bx); lay.rebuild(); } });
    GG.ui.seg(f.controls, { label: 'N (columns)', options: dimOpts, value: st.N, onChange: (v) => { st.N = v; st.by = Math.min(st.by, v / 32 - 1); byS.input.max = v / 32 - 1; byS.set(st.by); lay.rebuild(); } });
    const bxS = GG.ui.slider(f.controls, { label: '{blockIdx.x}', min: 0, max: st.M / 32 - 1, value: st.bx, onInput: (v) => { st.bx = v; lay.rebuild(); } });
    const byS = GG.ui.slider(f.controls, { label: '{blockIdx.y}', min: 0, max: st.N / 32 - 1, value: st.by, onInput: (v) => { st.by = v; lay.rebuild(); } });
    GG.ui.slider(f.controls, { label: '{threadIdx.x}', min: 0, max: 255, value: st.tid, onInput: (v) => { st.tid = v; paintZoom(); } });
    const sG = GG.ui.stat(f.readouts, { label: 'Grid of blocks', tone: 'control' });
    const sT = GG.ui.stat(f.readouts, { label: 'Thread (row, col)', tone: 'core' });
    const sE = GG.ui.stat(f.readouts, { label: 'Its elements (i, j)', tone: 'accent' });
    let Z = null;

    lay = responsive(f.stage, (w) => {
      clear(svg);
      const { M, N, bx, by, step } = st;
      const narrow = w < 640;
      // excerpt
      const S = STEPS[step];
      const lines = TRANSPOSE_CODE.split('\n').slice(S.a - 1, S.b);
      excPre.innerHTML = lines.map((l) => `<span class="ln">${GG.highlightLine(l, 'cpp') || ' '}</span>`).join('');
      if (code) { code.clear(); code.highlight(range(S.a, S.b)); }
      // left: S and DT at tile granularity
      const leftW = narrow ? w : Math.min(330, w * 0.44);
      const half = (leftW - 18) / 2;
      const u = Math.min(half / N, (narrow ? 150 : 210) / M);
      const mw = N * u, mh = M * u;
      const lx = [0, half + 18];
      const ly = 34;
      const names = [['S', 'input, row-major'], ['DT', 'output, column-major']];
      names.forEach(([nm, sub], q) => {
        const x = lx[q];
        T(svg, x, ly - 22, nm === 'S' ? 'tensor_S' : 'tensor_DT', { fs: 10.5, fill: 'var(--ink)', weight: 600 });
        T(svg, x, ly - 9, fit([`${M}×${N}, ${sub}`, `${M}×${N}`], 10, half), { fs: 10, fill: 'var(--ink-3)' });
        R(svg, x, ly, mw, mh, { rx: 4, fill: 'var(--memory)', op: 0.1, stroke: 'rgba(111,166,255,.5)' });
        // traversal hint for step >= 1
        if (step >= 1 && step <= 2) {
          const nLines = 5;
          for (let k = 0; k < nLines; k++) {
            if (q === 0) { const yy = ly + (k + 0.5) * (mh / nLines); Arrow(svg, x + 4, yy, x + mw - 4, yy, { stroke: 'var(--accent)', sw: 1, head: 5 }); }
            else { const xx = x + (k + 0.5) * (mw / nLines); Arrow(svg, xx, ly + 4, xx, ly + mh - 4, { stroke: 'var(--accent)', sw: 1, head: 5 }); }
          }
        }
        if (step >= 3) {
          for (let ti = 0; ti < M / 32; ti++) for (let tj = 0; tj < N / 32; tj++) {
            const on = step >= 4 && ti === bx && tj === by;
            R(svg, x + tj * 32 * u + 0.5, ly + ti * 32 * u + 0.5, 32 * u - 1.5, 32 * u - 1.5, { rx: 2, fill: on ? 'var(--accent)' : 'var(--memory)', op: on ? 0.35 : 0.1, stroke: on ? 'var(--accent)' : 'rgba(111,166,255,.55)', sw: on ? 1.6 : 1 });
            if (32 * u >= 26) T(svg, x + tj * 32 * u + 16 * u, ly + ti * 32 * u + 16 * u, `${ti},${tj}`, { anchor: 'middle', fs: 9, fill: on ? 'var(--ink)' : 'var(--ink-3)' });
          }
        }
        if (step === 0 && q === 0) {
          R(svg, x, ly, 32 * u, 32 * u, { rx: 2, fill: 'var(--core)', op: 0.25, stroke: 'var(--core)', sw: 1.4 });
        }
        if (step === 2) T(svg, x + mw / 2, ly + mh + 14, nm === 'S' ? '↑ d_S' : '↑ d_D', { anchor: 'middle', fs: 10, fill: 'var(--memory)' });
      });
      const leftH = ly + Math.max(mh, 32 * u) + (step === 2 ? 26 : 12);
      // right side: info or zoom
      const rx = narrow ? 0 : leftW + 24;
      const ry = narrow ? leftH + 18 : 4;
      const rw = w - rx;
      const info = (rowsTxt) => {
        rowsTxt.forEach(([a, b, c], k) => {
          const yy = ry + 14 + k * 44;
          T(svg, rx, yy, a, { fs: 11.5, fill: 'var(--ink)', weight: 600 });
          T(svg, rx, yy + 16, fit(b, 10.5, rw), { fs: 10.5, fill: c || 'var(--ink-2)' });
        });
        return ry + rowsTxt.length * 44 + 6;
      };
      let bottom = leftH;
      Z = null;
      if (step <= 3) {
        const T3 = (M / 32) * (N / 32);
        const rowsTxt = [
          [[`block_shape = (_32,_32)`], [['static: fixed when the kernel is compiled', 'static (compile time)']], 'var(--core)'],
          [[`tensor_shape = (${M},${N})`], [['dynamic: M and N arrive as kernel arguments', 'dynamic (run time)']], 'var(--control)'],
          [[`gmemLayoutS  = (${M},${N}):(${N},_1)`], [[`S(i,j) at i·${N} + j`]]],
          [[`gmemLayoutDT = (${M},${N}):(_1,${M})`], [[`DT(i,j) at i + j·${M}`]]],
          [[`tensor_S  = d_S + gmemLayoutS`], [['a pointer plus a Layout']]],
          [[`tensor_DT = d_D + gmemLayoutDT`], [['same (i, j) coordinates, other memory order']]],
          [[`tiled: ((_32,_32),${M / 32},${N / 32})`], [[`a 32×32 tile, then which tile: ${T3} tiles`, `${T3} tiles`]]],
        ].map((r) => [r[0][0], r[1][0], r[2]]);
        const pick = [[0, 1], [2, 3], [4, 5], [6, 2, 3]][step];
        bottom = Math.max(bottom, info(pick.map((k) => rowsTxt[k])));
      } else {
        // zoom on the block's tile
        const zc = clamp(Math.floor((rw - 30) / 32), 6, 13);
        const zx = rx + 24, zy = ry + 30;
        T(svg, rx, ry + 8, fit([`tile (${bx}, ${by}): rows ${32 * bx}–${32 * bx + 31}, columns ${32 * by}–${32 * by + 31}`, `tile (${bx}, ${by})`], 10, rw), { fs: 10, fill: 'var(--ink)' });
        const rects = [];
        for (let a = 0; a < 32; a++) for (let b = 0; b < 32; b++) rects.push(R(svg, zx + b * zc, zy + a * zc, zc - (zc > 8 ? 1 : 0.6), zc - (zc > 8 ? 1 : 0.6), { rx: zc > 9 ? 1.5 : 0.5, fill: 'var(--memory)', op: 0.1 }));
        for (let k = 1; k < 4; k++) Ln(svg, zx - 4, zy + k * 8 * zc - 0.5, zx + 32 * zc + 2, zy + k * 8 * zc - 0.5, { stroke: step >= 6 ? 'var(--ink-3)' : 'transparent', dash: '3 3' });
        [0, 8, 16, 24].forEach((a) => T(svg, zx - 5, zy + a * zc + zc / 2, String(a), { anchor: 'end', fs: 8.5, fill: 'var(--ink-3)' }));
        [0, 8, 16, 24, 31].forEach((b) => T(svg, zx + b * zc + zc / 2, zy + 32 * zc + 7, String(b), { anchor: 'middle', fs: 8.5, fill: 'var(--ink-3)' }));
        let yb = zy + 32 * zc + 18;
        // legend for the colours in the zoomed tile (text filled in by paintZoom)
        let legY = null;
        if (step >= 5) { legY = yb + 4; yb += 22; }
        // rmem: four register slots, labelled with the element each holds
        const rm = [];
        if (step >= 7) {
          const rxm = zx + 32 * zc + 14;
          const room = w - rxm;
          if (room >= 150) {
            // beside the tile: register k sits level with copy k of the thread layout
            T(svg, rxm, zy - 8, 'rmem (registers)', { fs: 10, fill: 'var(--memory)' });
            for (let k = 0; k < 4; k++) rm.push({ x: rxm, y: zy + 8 * zc * k + 4 * zc - 11, w: 76, h: 22, dx: rxm + 84, dy: zy + 8 * zc * k + 4 * zc, dw: room - 84 });
          } else {
            T(svg, rx, yb + 6, 'rmem (registers)', { fs: 10, fill: 'var(--memory)' });
            yb += 18;
            const bw = Math.min(84, (rw - 18) / 4);
            for (let k = 0; k < 4; k++) rm.push({ x: rx + k * (bw + 6), y: yb, w: bw, h: 22, dx: rx + k * (bw + 6), dy: yb + 34, dw: bw });
            yb += 22 + (step >= 9 ? 30 : 8);
          }
          rm.forEach((b) => { b.r = R(svg, b.x, b.y, b.w, b.h, { rx: 4, fill: 'var(--memory)', op: 0.3, stroke: 'var(--memory)' }); });
        }
        const ov = G(svg); // overlay redrawn by paintZoom: legend, rmem labels, copy arrows
        ov.style.pointerEvents = 'none';
        // memory strips for the warp's loads / stores
        let strips = null;
        if (step >= 8) {
          strips = G(svg);
          yb += 8;
        }
        Z = { rects, zx, zy, zc, rm, ov, legY, strips, yb, rx, rw };
        bottom = Math.max(bottom, yb + (step >= 9 ? 76 : step >= 8 ? 40 : 0));
      }
      sizeSvg(svg, w, bottom + 4);
      sG.set(`(${M / 32}, ${N / 32})`);
      paintZoom();
    });

    function paintZoom() {
      const { M, N, bx, by, step, tid } = st;
      const r = Math.floor(tid / 32), c = tid % 32;
      sT.set(step >= 5 ? `(${r}, ${c})` : '—');
      const els = [0, 1, 2, 3].map((k) => [32 * bx + r + 8 * k, 32 * by + c]);
      sE.set(step >= 6 ? els.map(([i, j]) => `(${i},${j})`).join(' ') : '—');
      if (Z) {
        Z.rects.forEach((rect, q) => {
          const a = Math.floor(q / 32), b = q % 32;
          let fill = 'var(--memory)', op = step >= 4 ? 0.14 : 0.1;
          if (step === 5 && a < 8) { fill = 'var(--core)'; op = 0.16; }
          if (step >= 6) { fill = 'var(--core)'; op = Math.floor(a / 8) % 2 ? 0.1 : 0.16; }
          if (step >= 5 && a % 8 === r && (step >= 6 || a < 8)) { fill = 'var(--special)'; op = 0.4; }
          if (step >= 5 && a % 8 === r && b === c && (step >= 6 || a < 8)) { fill = 'var(--accent)'; op = 0.95; }
          rect.style.fill = fill; rect.style.fillOpacity = op;
        });
        if (Z.strips) drawStrips();
        // overlay: legend, what each register holds, and the copy arrows
        clear(Z.ov);
        if (Z.legY != null) {
          let x = Z.rx;
          const item = (col, cands) => {
            R(Z.ov, x, Z.legY - 5, 10, 10, { rx: 2, fill: col, op: 0.85 });
            const t = fit(cands, 10, Z.rw - (x - Z.rx) - 16);
            T(Z.ov, x + 14, Z.legY, t, { fs: 10, fill: 'var(--ink-2)' });
            x += 14 + tw(t, 10) + 16;
          };
          item('var(--special)', step >= 6 ? [`warp ${r} (threads ${32 * r}–${32 * r + 31}): its elements`, `warp ${r}’s elements`, `warp ${r}`] : [`warp ${r} (threads ${32 * r}–${32 * r + 31})`, `warp ${r}`]);
          item('var(--accent)', step >= 6 ? [`thread ${tid}: its 4 elements`, `thread ${tid}’s 4`, `thread ${tid}`] : [`thread ${tid}`]);
        }
        Z.rm.forEach((b, k) => {
          const [i, j] = els[k];
          T(Z.ov, b.x + b.w / 2, b.y + b.h / 2 + 0.5, fit([step >= 8 ? `S(${i},${j})` : `for (${i},${j})`, `(${i},${j})`], 10, b.w - 4), { anchor: 'middle', fs: 10, fill: step >= 8 ? 'var(--ink)' : 'var(--ink-3)' });
          const cx = Z.zx + c * Z.zc + Z.zc / 2, cy = Z.zy + (r + 8 * k) * Z.zc + Z.zc / 2;
          if (step === 8) {
            // global → registers: from the thread's element in the tile to its register
            const side = b.dx > b.x + b.w;
            if (side) Arrow(Z.ov, cx + 3, cy, b.x - 3, b.y + b.h / 2, { stroke: 'var(--accent)', sw: 1.2, head: 5 });
            else Arrow(Z.ov, cx, cy + 3, b.x + b.w / 2, b.y - 3, { stroke: 'var(--accent)', sw: 1.2, head: 5 });
          }
          if (step >= 9) T(Z.ov, b.dx + (b.dx > b.x + b.w ? 0 : b.w / 2), b.dy, fit([`→ d_D[${i + j * M}]`, `d_D[${i + j * M}]`], 10, b.dw), { anchor: b.dx > b.x + b.w ? 'start' : 'middle', fs: 10, fill: 'var(--danger)' });
        });
      }
      const n = 32 * r;
      const whys = [
        `<code>block_shape</code> is (_32,_32): <code>Int&lt;32&gt;</code> makes 32 a compile-time constant (CuTe prints static values with an underscore; the green square is one 32×32 tile to scale). <code>tensor_shape</code> is (${M},${N}): M and N are ordinary <code>int</code>s, known only when the kernel runs.`,
        `<code>gmemLayoutS</code> is row-major, (${M},${N}):(${N},_1), so S(i, j) lives at i·${N} + j. <code>gmemLayoutDT</code> is column-major, (${M},${N}):(_1,${M}), so DT(i, j) lives at i + j·${M}. Same shape, opposite strides: the arrows show each one’s memory order.`,
        `A Tensor is a pointer plus a Layout. <code>tensor_S</code> reads <code>d_S</code> through the row-major layout; <code>tensor_DT</code> writes <code>d_D</code> through the column-major one. Both are indexed by the same logical (i, j).`,
        `<code>tiled_divide</code> cuts each ${M}×${N} tensor into 32×32 tiles, giving a “Tensor of Tensors” of shape ((_32,_32),${M / 32},${N / 32}): the first mode is a whole tile, the other two pick which tile. ${(M / 32) * (N / 32)} tiles, one per thread block, so the kernel expects a grid of (${M / 32}, ${N / 32}) blocks.`,
        `Block (${bx}, ${by}) slices out tile (${bx}, ${by}) of both tensors: rows ${32 * bx}–${32 * bx + 31}, columns ${32 * by}–${32 * by + 31}. The <code>_</code> in <code>make_coord(_, _)</code> means “keep this whole mode”, like <code>:</code> in NumPy. Note that <code>blockIdx.x</code> picks the row of tiles.`,
        `<code>thr_layout</code> arranges the block’s 8 × 32 = 256 threads row-major, (_8,_32):(_32,_1): thread t sits at row t / 32, column t mod 32. Thread <b>${tid}</b> is at (${r}, ${c}); its warp, threads ${n}–${n + 31}, is row ${r} (pink).`,
        `<code>local_partition</code> tiles the 32×32 tile with the 8×32 thread layout (four copies, stacked) and hands each thread its spot in every copy. Thread <b>${tid}</b> owns rows ${r}, ${r + 8}, ${r + 16} and ${r + 24} of column ${c}: a (_4,_1) tensor.`,
        `<code>make_tensor_like&lt;T&gt;</code> makes a Tensor with the same shape, (_4,_1), but backed by registers: 4 values per thread, 4 × 256 = 1,024 per block, exactly one tile.`,
        `<code>copy(thr_tile_S, rmem)</code> loads the 4 values. Across warp ${r} (threads ${n}–${n + 31}) each load reads 32 neighbouring elements of one row of S: 128 contiguous bytes for float, a coalesced access.`,
        `<code>copy(rmem, thr_tile_DT)</code> stores them through the column-major view: DT(i, j) goes to d_D[i + j·${M}]. Read as a row-major ${N}×${M} matrix, d_D is now Sᵀ. But across a warp these stores land ${M} elements (${4 * M} bytes) apart: strided, uncoalesced writes. That is why this first version is the “naive” one.`,
      ];
      f.setWhy(whys[step]);
    }
    function drawStrips() {
      const { M, N, bx, by, tid } = st;
      const r = Math.floor(tid / 32);
      const g = Z.strips;
      clear(g);
      const x0 = Z.rx, wS = Z.rw;
      const y1 = Z.yb + 8, y2 = Z.yb + 44;
      // loads (k = 0): row i = 32bx + r, columns 32by .. 32by+31 → offsets i*N + j, contiguous
      const i0 = 32 * bx + r;
      const base = i0 * N + 32 * by;
      T(g, x0, y1 - 8, fit([`warp ${r} loads: d_S[${base}] … d_S[${base + 31}], one 128-byte run`, `loads: d_S[${base}…${base + 31}]`, 'loads: contiguous'], 10, wS), { fs: 10, fill: 'var(--memory)' });
      const W = wS - 4;
      // both strips span 32·M elements, so their marks are to the same scale
      R(g, x0, y1, W, 10, { rx: 2, fill: 'var(--surface-3)', stroke: 'var(--line)' });
      R(g, x0, y1, Math.max(3, W / M), 10, { rx: 1, fill: 'var(--core)', op: 0.9 });
      T(g, x0 + W, y1 + 22, `each strip spans 32 × ${M} = ${GG.fmt.int(32 * M)} elements`, { anchor: 'end', fs: 10, fill: 'var(--ink-3)' });
      if (st.step >= 9) {
        const dBase = i0 + 32 * by * M;
        T(g, x0, y2 - 8 + 8, fit([`warp ${r} stores: d_D[${dBase}], d_D[${dBase + M}], … every ${M}th element`, `stores: d_D[${dBase}], every ${M}th`, `stores: every ${M}th element`], 10, wS), { fs: 10, fill: 'var(--danger)' });
        R(g, x0, y2 + 8, W, 10, { rx: 2, fill: 'var(--surface-3)', stroke: 'var(--line)' });
        for (let k = 0; k < 32; k++) R(g, x0 + (k / 32) * W, y2 + 8, Math.max(1.5, W / M), 10, { fill: 'var(--danger)', op: 0.9 });
      }
    }
    return { setCode(c) { code = c; if (lay) lay.rebuild(); } };
  }

  /* Fig: composing two layouts, R = A ∘ B, evaluated cell by cell */
  function figCompose(ctx, slot) {
    const f = fig(ctx, slot, {
      title: 'Composing two layouts: R = A ∘ B', hint: 'hover or tap a coordinate · switch the example', wide: true,
      caption: 'Each grid is drawn in its layout’s shape. B turns a coordinate into an integer; because CuTe reads an integer as a coordinate of A (counting down the columns, first mode fastest), that integer can be fed straight into A. The Shape:Stride shown for R is checked against A(B(c)) for every coordinate. The first example is the one in NVIDIA’s CuTe layout-algebra documentation.',
    });
    const EX = [
      { v: 'docs', l: 'CuTe docs example', A: '(6,2):(8,2)', B: '(4,3):(3,1)', R: '((2,2),3):((24,2),8)', d: 'B = (4,3):(3,1) maps its 4×3 coordinates onto the integers 0 to 11, row-major. Each integer picks an element of A = (6,2):(8,2). The result has a nested first mode, ((2,2),3):((24,2),8): composition can produce layouts that neither A nor B wrote down.' },
      { v: 'tr', l: 'Transpose view', A: '(4,8):(8,1)', B: '(8,4):(4,1)', R: '(8,4):(1,8)', d: 'A = (4,8):(8,1) is a row-major 4×8 matrix. B = (8,4):(4,1) walks its 32 elements in a different order. The composition, (8,4):(1,8), reads the same memory as the 8×4 transpose: the transpose kernel’s trick, done by algebra.' },
    ];
    const st = { ex: 'docs', hov: 1 };
    GG.ui.seg(f.controls, { label: 'Example', options: EX.map((e) => ({ value: e.v, label: e.l })), value: st.ex, onChange: (v) => { st.ex = v; st.hov = 1; lay.rebuild(); } });
    const sA = GG.ui.stat(f.readouts, { label: 'A', tone: 'memory' });
    const sB = GG.ui.stat(f.readouts, { label: 'B', tone: 'memory' });
    const sR = GG.ui.stat(f.readouts, { label: 'R = A ∘ B', tone: 'accent' });
    const sC = GG.ui.stat(f.readouts, { label: 'Check: R(c) = A(B(c))', tone: 'core' });
    const svg = svgRoot(f.stage, 'Three grids: layout B mapping coordinates to integers, layout A mapping integers to offsets, and their composition R mapping coordinates straight to offsets.');
    const ev = (L, x) => Lay.dot(Lay.coord(L.shape, x), L.stride);
    const dims = (L) => [Lay.size(L.shape[0]), Lay.size(L.shape[1])];
    let E = null;
    keyNav(svg, 'Use the arrow keys to step through the coordinates of B.', (k) => {
      if (!E) return false;
      const n = E.n;
      if (k === 'ArrowRight' || k === 'ArrowDown') st.hov = (st.hov + 1) % n;
      else if (k === 'ArrowLeft' || k === 'ArrowUp') st.hov = (st.hov + n - 1) % n;
      else if (k === 'Home') st.hov = 0;
      else if (k === 'End') st.hov = n - 1;
      else return false;
      paint();
    });
    const lay = responsive(f.stage, (w) => {
      clear(svg);
      const ex = EX.find((e) => e.v === st.ex);
      const A = Lay.parse(ex.A), B = Lay.parse(ex.B), Rl = Lay.parse(ex.R);
      const n = Lay.size(B.shape);
      let ok = 0;
      for (let x = 0; x < n; x++) if (ev(Rl, x) === ev(A, ev(B, x))) ok++;
      const [bR, bC] = dims(B), [aR, aC] = dims(A);
      const narrow = w < 640;
      const gapX = narrow ? 0 : 54;
      const cs = narrow ? clamp(Math.floor((w - 24) / Math.max(bC, aC)), 22, 40) : clamp(Math.floor((w - 2 * gapX - 24) / (2 * bC + aC)), 22, 42);
      const panels = [
        { k: 'B', t: 'B: coordinate → integer', s: ex.B, rows: bR, cols: bC },
        { k: 'A', t: 'A: integer → offset', s: ex.A, rows: aR, cols: aC },
        { k: 'R', t: 'R = A ∘ B: coordinate → offset', s: ex.R, rows: bR, cols: bC },
      ];
      let x = 0, y = 34, maxH = 0;
      const cells = { B: [], A: [], R: [] };
      panels.forEach((p, q) => {
        const pw = p.cols * cs;
        if (narrow && q > 0) { y += maxH + 58; x = 0; maxH = 0; }
        T(svg, x, y - 22, fit([p.t, p.t.split(':')[0], p.k], 10.5, narrow || q === 2 ? w - x : pw + gapX - 8), { fs: 10.5, fill: 'var(--ink)', weight: 600 });
        T(svg, x, y - 8, p.s, { fs: 10, fill: p.k === 'R' ? 'var(--accent-2)' : 'var(--ink-3)' });
        for (let j = 0; j < p.cols; j++) for (let i = 0; i < p.rows; i++) {
          const idx = i + p.rows * j; // colexicographic: the first mode varies fastest
          const val = p.k === 'B' ? ev(B, idx) : p.k === 'A' ? ev(A, idx) : ev(Rl, idx);
          const g = G(svg, { class: 'hsc-hit' });
          const r = R(g, x + j * cs, y + i * cs, cs - 2, cs - 2, { rx: 4, fill: 'var(--memory)', op: 0.12, stroke: 'rgba(111,166,255,.4)' });
          T(g, x + j * cs + (cs - 2) / 2, y + i * cs + (cs - 2) / 2 + (p.k === 'A' && cs >= 30 ? 4 : 0.5), String(val), { anchor: 'middle', fs: Math.min(13, cs * 0.42), fill: 'var(--ink)' });
          if (p.k === 'A' && cs >= 30) T(g, x + j * cs + 4, y + i * cs + 8, String(idx), { fs: 10, fill: 'var(--ink-3)' });
          if (p.k !== 'A') {
            g.addEventListener('pointerenter', () => { st.hov = idx; paint(); });
            g.addEventListener('click', () => { st.hov = idx; paint(); });
          }
          cells[p.k][idx] = r;
        }
        maxH = Math.max(maxH, p.rows * cs);
        if (!narrow && q < 2) {
          const ax = x + pw + 8, ay = y + Math.min(p.rows, q === 0 ? bR : aR) * cs / 2;
          T(svg, ax + (gapX - 16) / 2, ay, q === 0 ? '→' : '=', { anchor: 'middle', fs: 18, fill: 'var(--ink-2)' });
        }
        x += pw + gapX;
      });
      if (!narrow && cs >= 30) T(svg, panels[0].cols * cs + gapX, y + aR * cs + 14, fit(['corner number: the integer that picks this element of A', 'corner: the integer'], 10, panels[1].cols * cs + gapX), { fs: 10, fill: 'var(--ink-3)' });
      const bottom = y + maxH + (narrow ? 8 : 26);
      sizeSvg(svg, w, bottom);
      E = { ex, A, B, Rl, cells, n, aR };
      sA.set(ex.A); sB.set(ex.B); sR.set(ex.R);
      sC.set(ok === n ? `all ${n} agree` : `${n - ok} differ`, ok === n ? 'core' : 'danger');
      paint();
    });
    function paint() {
      if (!E) return;
      const { A, B, Rl, cells, n } = E;
      const h = clamp(st.hov, 0, n - 1);
      const xb = ev(B, h), off = ev(A, xb);
      ['B', 'A', 'R'].forEach((k) => cells[k].forEach((r, idx) => {
        const on = k === 'A' ? idx === xb : idx === h;
        r.style.stroke = on ? 'var(--accent)' : 'rgba(111,166,255,.4)';
        r.style.strokeWidth = on ? 2.4 : 1;
        r.style.fill = on ? 'var(--accent)' : 'var(--memory)';
        r.style.fillOpacity = on ? 0.3 : 0.12;
      }));
      const [bR] = dims(B), [aR] = dims(A);
      const ci = h % bR, cj = Math.floor(h / bR);
      const ai = xb % aR, aj = Math.floor(xb / aR);
      const bs = Lay.leaves(B.stride), as = Lay.leaves(A.stride);
      f.setWhy(`Coordinate <b>(${ci}, ${cj})</b>: B gives ${ci}·${bs[0]} + ${cj}·${bs[1]} = <b>${xb}</b>. Read as a coordinate of A, ${xb} is (${xb} mod ${aR}, ${xb} div ${aR}) = (${ai}, ${aj}), and A gives ${ai}·${as[0]} + ${aj}·${as[1]} = <b>${off}</b>. So R(${ci}, ${cj}) = A(B(${ci}, ${cj})) = <b>${off}</b>, which <code>${esc(E.ex.R)}</code> computes in one step. ${E.ex.d}`);
    }
  }

  GG.entry('cute', {
    render(body, ctx) {
      const s = ctx.html(body, `
        <p>CUDA Templates (<strong>CuTe</strong>) is a header-only <a data-term="cuda-c">CUDA C++</a> library within <a data-term="cutlass">CUTLASS</a> for describing and manipulating tensors of <a data-term="memory-hierarchy">data</a> and <a data-term="thread-hierarchy">threads</a>. As the name implies, CuTe uses CUDA C++ <a href="https://en.cppreference.com/cpp/language/templates">templates</a>.</p>
        <p>Templates are the C++ implementation of <a href="https://bartoszmilewski.com/2014/09/22/parametricity-money-for-nothing-and-theorems-for-free/">parametric polymorphism</a>, which you may have encountered in the form of <a href="https://doc.rust-lang.org/rust-by-example/generics.html">generics</a> in other languages. Polymorphic functions are written once but can operate on inputs with different types (the <a data-term="cutlass">CUTLASS</a> entry shows the compiler stamping out copies). CuTe is not to be confused with <a data-term="cute-dsl">CuTe DSL</a>, which exposes CuTe/CUTLASS via a Domain-Specific Language (DSL) in Python.</p>
        <h3>Layouts: a Shape and a Stride</h3>
        <p>At the core of CuTe’s type system are <code>Layout</code>s. <code>Layout</code>s describe regular patterns of access to CuTe <code>Tensor</code>s. A <code>Layout</code> is made of two tuples: a <strong>Shape</strong>, which describes the memory extents (how many coordinates there are along each mode), and a <strong>Stride</strong>, which describes how to traverse them (how far to move in memory for one step along each mode). CuTe writes a layout as <code>Shape:Stride</code>, and it is a function from coordinates to offsets: multiply each coordinate by its stride and add up.</p>
        <p>So <code>(4,8):(8,1)</code> is a 4×8 row-major matrix, (i, j) ↦ 8i + j. Give it the strides <code>(1,4)</code> instead, 1 down each column and 4 (the number of rows) from one column to the next, and <code>(4,8):(1,4)</code> is column-major, (i, j) ↦ i + 4j. All of <a data-term="cublas">cuBLAS</a>’s layout headaches, row- versus column-major and leading dimensions, are just one <code>Layout</code> or another. Try the presets in Fig. 1, or type your own.</p>
        <div data-slot="layout"></div>
        <p>Shapes and strides can nest. <code>((2,2),(4,2)):((1,8),(2,16))</code> is still a 4×8 matrix, but its rows split into (2,2) and its columns into (4,2), each piece with its own stride: tiles within tiles, described in one value. These <code>Layout</code>s are, critically, composable: they form <a href="https://arxiv.org/abs/2601.05972">a category</a> with <a href="https://arxiv.org/abs/2603.02298">a rich algebra</a>, and so combine both expressiveness and structure. “Cut this tensor into 32×32 tiles” and “give each thread its share” are layout-algebra operations, and they compose, as the kernel below shows.</p>
        <p>The central operation is <strong>composition</strong>. A layout is a function from coordinates to integers, and an integer can itself be read as a coordinate of another layout (CuTe counts through a shape with the first mode varying fastest). So two layouts compose like two functions: R = A ∘ B means R(c) = A(B(c)). The useful part is that the result is again a <code>Shape:Stride</code> layout, which CuTe computes for you (at compile time, when the shapes and strides are static). Fig. 2 evaluates two compositions cell by cell. Dividing a layout into tiles, as <code>tiled_divide</code> does in the kernel below, is defined in terms of composition: CuTe’s documentation gives <code>logical_divide(A, tiler)</code> as the composition of A with the tiler and its complement, and <code>tiled_divide</code> rearranges the modes of that result.</p>
        <div data-slot="compose"></div>
        ${GG.noteHTML('beyond', `<p><b>How nested coordinates split.</b> CuTe orders coordinates colexicographically: in a nested mode the <em>first</em> sub-mode varies fastest. So in a mode of shape (2,2), row 1 is (1,0), row 2 is (0,1) and row 3 is (1,1). Hover the tiled preset in Fig. 1 to see the split. (A category, in the mathematical sense, is a collection of objects and composable arrows between them. The first paper linked above, Carlisle, Shah, Stern and VanKoughnett’s “Categorical Foundations for CuTe Layouts”, shows that layouts and their compositions fit that mould; the second, Cris Cecka’s “CuTe Layout Representation and Algebra”, sets out the layout algebra.)</p>`)}
        <h3>Tensors: a pointer plus a Layout</h3>
        <p><code>Tensor</code>s combine a <code>Layout</code> with a pointer to <a data-term="memory-hierarchy">memory</a>. Two tensors can share the same logical shape but carry different layouts. Copy element (i, j) of one to element (i, j) of the other and the data is rearranged in memory. The transpose kernel below does exactly this, with a row-major tensor over the input buffer <code>d_S</code> and a column-major tensor over the output buffer <code>d_D</code>; Fig. 3 runs it on twelve elements.</p>
        <div data-slot="copy"></div>
        <h3>Types that carry the metadata</h3>
        <p>CuTe uses the type system to encode key program metadata like memory organization, strided accesses and tiling, so that the <a data-term="nvcc">compiler</a> can check many aspects of correctness and preserve invariants while applying optimizations. This allows for very high-level metaprogramming of <a data-term="kernel">kernels</a> without sacrificing performance. For instance, the same template can be compiled into highly-optimized kernels across several <a data-term="streaming-multiprocessor-architecture">Streaming Multiprocessor architectures</a>.</p>
        <p>Because layouts are resolved at compile time, memory accesses carry zero additional runtime overhead. That overhead might otherwise kill <a data-term="perf">performance</a> for <a data-term="memory-bound">memory-bound</a> workloads, which have little arithmetic to hide extra index calculations behind.</p>
        ${GG.noteHTML('beyond', `<p><b>Static and dynamic.</b> Precisely, CuTe lets each shape or stride entry be <em>static</em> (a compile-time constant such as <code>Int&lt;32&gt;{}</code>, printed <code>_32</code>) or <em>dynamic</em> (an ordinary run-time <code>int</code>). Static parts fold away completely during compilation; dynamic parts become ordinary integer arithmetic. In the kernel below the tile and thread shapes are static, while the matrix extents <code>M</code> and <code>N</code> are dynamic. So “zero additional overhead” means nothing beyond what hand-written indexing would cost: the static parts vanish, and the dynamic parts compile to the same multiply-adds, like <code>i * N + j</code>, that a CUDA C++ programmer would write by hand.</p>`)}
        <p>For additional details, see NVIDIA’s <a href="https://docs.nvidia.com/cutlass/4.4.2/media/docs/cpp/cute/index.html">CuTe documentation</a>.</p>
        <h3>A transpose using only Layouts</h3>
        <p>The CuTe-based matrix transpose kernel below, based on the initial “naive” implementation from <a href="https://research.colfax-intl.com/tutorial-matrix-transpose-in-cutlass/">this article by Colfax International</a>, demonstrates the core features and types of CuTe: templating, shapes, layouts and tensors. You can run it on an H100 via <a href="https://modal.com/notebooks/modal-labs/examples/nb-owEUD0kdSVeL4KeEX5sjh1">this Modal Notebook</a>. Hover the marked lines for notes.</p>
        <div data-slot="code"></div>
        <p>Fig. 4 walks through the kernel one step at a time. Each thread block handles one 32×32 tile; inside it, each of the block’s 256 threads moves four elements.</p>
        <div data-slot="walk"></div>
        ${GG.noteHTML('beyond', `<p><b>Why “naive”?</b> The loads are coalesced: a warp reads 32 neighbouring elements of a row of S. The stores are not: through the column-major view, neighbouring threads write addresses M elements apart, so a warp’s 32 stores touch 32 separate places in memory (see <a data-term="memory-coalescing">memory coalescing</a>). The Colfax article goes on to fix this by staging each tile in <a data-term="shared-memory">shared memory</a>, so that both the global loads and the global stores are coalesced.</p>`)}
        <div data-slot="reading"></div>
      `);
      guard(() => figLayout(ctx, s.layout));
      guard(() => figCompose(ctx, s.compose));
      guard(() => figTensorCopy(ctx, s.copy));
      let walk = null;
      guard(() => {
        const L = (n) => lineOf(TRANSPOSE_CODE, n);
        const notes = {};
        notes[L('// one CuTe trick')] = 'The idea in one line: no index arithmetic, no shared memory, just two Layouts over two pointers.';
        notes[L('template <typename T>')] = 'Written once for any element type T; <code>transpose_kernel&lt;float&gt;</code> and <code>transpose_kernel&lt;half&gt;</code> would be separate instantiations.';
        notes[L('__global__ void transpose_kernel')] = '<code>__global__</code> marks a kernel: launched from the host, run by every thread of the grid. <code>__restrict__</code> promises the compiler that <code>d_S</code> and <code>d_D</code> don’t overlap.';
        notes[L('using b = Int<32>;')] = '<code>Int&lt;32&gt;</code> is a type whose value is 32: a static, compile-time integer.';
        notes[L('auto block_shape')] = 'The tile shape, (_32,_32). Fully static.';
        notes[L('auto tensor_shape')] = 'The matrix shape, (M, N): dynamic, because M and N are run-time kernel arguments.';
        notes[L('auto gmemLayoutS')] = '<code>GenRowMajor</code> generates row-major strides for the shape: (M,N):(N,_1).';
        notes[L('auto gmemLayoutDT')] = '<code>GenColMajor</code> generates column-major strides: (M,N):(_1,M). Same logical shape as the input.';
        notes[L('auto tensor_S  = make_tensor')] = 'A Tensor = pointer + Layout. <code>make_gmem_ptr</code> tags the pointer as pointing into global memory.';
        notes[L('auto tensor_DT = make_tensor')] = 'The output, viewed through the column-major layout.';
        notes[L('auto tiled_tensor_S  = tiled_divide')] = 'Shape ((_32,_32), M/32, N/32): mode 0 is a tile, modes 1 and 2 index the tiles. A “Tensor of Tensors”.';
        notes[L('auto tile_S  = tiled_tensor_S')] = '<code>_</code> keeps a whole mode (like <code>:</code> in NumPy). So this is the 32×32 tile at (blockIdx.x, blockIdx.y).';
        notes[L('auto thr_layout = make_layout(')] = 'A Layout for threads, not data: 8 × 32 = 256 threads, row-major.';
        notes[L('auto thr_tile_S  = local_partition')] = 'Tile the 32×32 tile by the 8×32 thread layout and take this thread’s element from each of the 4 copies: a (_4,_1) tensor.';
        notes[L('auto rmem = make_tensor_like<T>')] = 'Same shape as the thread’s partition, but stored in registers.';
        notes[L('copy(thr_tile_S, rmem);')] = 'Global → registers. A warp’s loads cover 32 adjacent elements of a row: coalesced.';
        notes[L('copy(rmem, thr_tile_DT);')] = 'Registers → global, through the column-major view: element (i, j) lands at d_D[i + j·M]. This is the transpose.';
        const code = codeAt(ctx, s.code, { lang: 'cpp', code: TRANSPOSE_CODE, caption: 'transpose_kernel: a naive CuTe transpose (after Colfax International)', notes, wide: true });
        walk = figKernelWalk(ctx, s.walk);
        if (walk) walk.setCode(code);
      });
      ctx.reading(s.reading, [
        { href: 'https://docs.nvidia.com/cutlass/4.4.2/media/docs/cpp/cute/index.html', label: 'CuTe documentation', note: 'NVIDIA' },
        { href: 'https://research.colfax-intl.com/tutorial-matrix-transpose-in-cutlass/', label: 'Tutorial: Matrix Transpose in CUTLASS', note: 'Colfax International; the source of the naive kernel and its improvements' },
        { href: 'https://modal.com/notebooks/modal-labs/examples/nb-owEUD0kdSVeL4KeEX5sjh1', label: 'Run the transpose on an H100', note: 'Modal Notebook' },
        { href: 'https://arxiv.org/abs/2601.05972', label: 'Categorical Foundations for CuTe Layouts', note: 'Carlisle, Shah, Stern & VanKoughnett, arXiv 2601.05972' },
        { href: 'https://arxiv.org/abs/2603.02298', label: 'CuTe Layout Representation and Algebra', note: 'Cris Cecka, arXiv 2603.02298' },
        { href: 'https://docs.nvidia.com/cutlass/latest/media/docs/cpp/cute/02_layout_algebra.html', label: 'CuTe Layout Algebra', note: 'NVIDIA’s documentation of composition, complement and divide' },
        { href: 'https://en.cppreference.com/cpp/language/templates', label: 'Templates', note: 'cppreference' },
        { href: 'https://bartoszmilewski.com/2014/09/22/parametricity-money-for-nothing-and-theorems-for-free/', label: 'Parametricity', note: 'Bartosz Milewski' },
        { href: 'https://doc.rust-lang.org/rust-by-example/generics.html', label: 'Generics', note: 'Rust by Example' },
      ]);
      keepCase(body);
    },
  });

  /* ═════════════════════════════════════════════════════════════
     CuTe DSL
     ═════════════════════════════════════════════════════════════ */
  const ELEM_ADD_CODE = `import cutlass.cute as cute
import torch

Tensor = cute.Tensor | torch.Tensor


@cute.kernel
def elem_add_kernel(a: cute.Tensor, b: cute.Tensor, out: cute.Tensor):
    block_x, _, _ = cute.arch.block_idx()
    block_dim_x, _, _ = cute.arch.block_dim()
    thread_x, _, _ = cute.arch.thread_idx()

    i = block_x * block_dim_x + thread_x

    if i < out.shape[0]:
        out[i] = a[i] + b[i]


@cute.jit
def elem_add(a: Tensor, b: Tensor, out: Tensor):
    n = out.shape[0]
    threads_per_block = 128
    blocks = (n + threads_per_block - 1) // threads_per_block

    elem_add_kernel(a, b, out).launch(
        grid=(blocks, 1, 1),
        block=(threads_per_block, 1, 1),
    )`;
  const INDEX_LINE = 'i = block_x * block_dim_x + thread_x';

  /* Fig: who may call whom */
  function figCallFlow(ctx, slot) {
    const f = fig(ctx, slot, {
      title: '{Python} → {@cute.jit} → {@cute.kernel}', hint: 'try the forbidden call', wide: true,
      caption: 'A <code>@cute.jit</code> function is compiled and can be called from Python or from other CuTe DSL functions; it launches the <code>@cute.kernel</code>, which runs on the GPU as a grid of thread blocks. Python cannot call the kernel itself.',
    });
    const st = { mode: 'jit' };
    GG.ui.seg(f.controls, { label: 'From Python, call', options: [{ value: 'jit', label: 'elem_add (@cute.jit)' }, { value: 'kernel', label: 'elem_add_kernel (@cute.kernel)' }], value: st.mode, onChange: (v) => { st.mode = v; lay.rebuild(); } });
    const sR = GG.ui.stat(f.readouts, { label: 'Result', tone: 'core' });
    const svg = svgRoot(f.stage, 'Python calls a @cute.jit function, which launches a @cute.kernel on the GPU; a direct call from Python to the kernel is not allowed.');
    const lay = responsive(f.stage, (w) => {
      clear(svg);
      const bad = st.mode === 'kernel';
      const narrow = w < 600;
      const bw = narrow ? w : (w - 2 * 56) / 3, bh = 104;
      const pos = narrow ? [{ x: 0, y: 0 }, { x: 0, y: bh + 54 }, { x: 0, y: 2 * (bh + 54) }] : [{ x: 0, y: 26 }, { x: bw + 56, y: 26 }, { x: 2 * (bw + 56), y: 26 }];
      const boxes = [
        { d: 'Python', t: 'your program', s1: ['the ordinary interpreter', 'interpreted'], s2: ['elem_add(a, b, out)'], c: 'var(--host)', ca: 'rgba(184,164,255,.5)' },
        { d: '@cute.jit', t: 'elem_add', s1: ['JIT-compiled, runs on the host', 'compiled, on the host', 'host'], s2: ['.launch(grid, block)', '.launch(…)'], c: 'var(--host)', ca: 'rgba(184,164,255,.5)' },
        { d: '@cute.kernel', t: 'elem_add_kernel', s1: ['runs on the GPU'], s2: ['blocks × 128 threads', 'blocks × 128'], c: 'var(--core)', ca: 'rgba(69,212,155,.5)' },
      ];
      boxes.forEach((b, k) => {
        const p = pos[k];
        const g = G(svg);
        if (bad && k === 1) g.style.opacity = 0.35;
        R(g, p.x, p.y, bw, bh, { rx: 12, fill: b.c, op: 0.1, stroke: b.ca });
        T(g, p.x + 12, p.y + 16, b.d, { fs: 10.5, fill: b.c, weight: 600 });
        T(g, p.x + 12, p.y + 34, fit([b.t], 12.5, bw - 24), { fs: 12.5, fill: 'var(--ink)', weight: 600 });
        T(g, p.x + 12, p.y + 55, fit(b.s1, 10.5, bw - 24), { fs: 10.5, fill: 'var(--ink-3)' });
        const callBad = bad && k === 0;
        const t2 = T(g, p.x + 12, p.y + 77, fit(callBad ? ['elem_add_kernel(a, b, out)', 'elem_add_kernel(…)'] : b.s2, 11, bw - 24), { fs: 11, fill: callBad ? 'var(--danger)' : b.c });
        if (callBad) t2.style.textDecoration = 'line-through';
        if (k === 2) for (let q = 0; q < Math.min(10, Math.floor((bw - 24) / 14)); q++) R(g, p.x + 12 + q * 14, p.y + 88, 10, 8, { rx: 2, fill: 'var(--core)', op: 0.4 });
      });
      const ok = 'var(--accent)';
      if (!narrow) {
        const y = pos[0].y + bh / 2;
        if (!bad) {
          Arrow(svg, bw + 3, y, bw + 53, y, { stroke: ok, sw: 1.8 });
          T(svg, bw + 28, y - 10, 'calls', { anchor: 'middle', fs: 10, fill: ok });
          Arrow(svg, 2 * bw + 59, y, 2 * bw + 109, y, { stroke: ok, sw: 1.8 });
          T(svg, 2 * bw + 84, y - 10, 'launches', { anchor: 'middle', fs: 10, fill: ok });
        } else {
          const yy = pos[0].y + bh + 22;
          Pth(svg, `M${r1(bw / 2)},${pos[0].y + bh + 2} L${r1(bw / 2)},${yy} L${r1(2 * (bw + 56) + bw / 2)},${yy} L${r1(2 * (bw + 56) + bw / 2)},${pos[0].y + bh + 4}`, { stroke: 'var(--danger)', sw: 1.8, dash: '5 4' });
          const cx = w / 2;
          R(svg, cx - 11, yy - 11, 22, 22, { rx: 11, fill: 'var(--bg)', stroke: 'var(--danger)', sw: 1.8 });
          T(svg, cx, yy + 0.5, '✕', { anchor: 'middle', fs: 12, fill: 'var(--danger)', weight: 700 });
          T(svg, cx, yy + 26, 'not allowed: Python cannot call a @cute.kernel directly', { anchor: 'middle', fs: 10.5, fill: 'var(--danger)' });
        }
        // self-loop: jit functions can call other jit functions
        if (!bad) {
          const x = pos[1].x + bw / 2;
          Pth(svg, `M${r1(x - 30)},${pos[1].y} C${r1(x - 30)},${pos[1].y - 26} ${r1(x + 30)},${pos[1].y - 26} ${r1(x + 30)},${pos[1].y - 3}`, { stroke: 'var(--host)', sw: 1.3, dash: '3 3' });
          T(svg, x + 36, pos[1].y - 16, fit(['or from other CuTe DSL functions', 'or other jit fns'], 9.5, bw / 2 + 40), { fs: 9.5, fill: 'var(--host)' });
        }
        sizeSvg(svg, w, pos[0].y + bh + (bad ? 64 : 12));
      } else {
        const x = w / 2;
        if (!bad) {
          Arrow(svg, x, bh + 3, x, bh + 51, { stroke: ok, sw: 1.8 });
          T(svg, x + 10, bh + 27, 'calls', { fs: 10, fill: ok });
          Arrow(svg, x, 2 * bh + 57, x, 2 * bh + 105, { stroke: ok, sw: 1.8 });
          T(svg, x + 10, 2 * bh + 81, 'launches', { fs: 10, fill: ok });
          // jit functions can also be called from other CuTe DSL functions: a small loop on the jit box
          const ly = bh + 54, lx = w - 2;
          Pth(svg, `M${r1(lx - 8)},${r1(ly + 22)} C${r1(lx + 6)},${r1(ly + 22)} ${r1(lx + 6)},${r1(ly + 52)} ${r1(lx - 8)},${r1(ly + 52)}`, { stroke: 'var(--host)', sw: 1.3, dash: '3 3' });
          T(svg, lx - 12, ly + 37, fit(['or from other CuTe DSL functions', 'or other jit fns'], 10, w / 2), { anchor: 'end', fs: 10, fill: 'var(--host)', cls: 'hsc-halo' });
        } else {
          const xx = w - 16;
          Pth(svg, `M${r1(w - 40)},${bh + 2} L${r1(w - 40)},${bh + 18} L${r1(xx)},${bh + 18} L${r1(xx)},${2 * (bh + 54) - 16} L${r1(w - 40)},${2 * (bh + 54) - 16} L${r1(w - 40)},${2 * (bh + 54) - 3}`, { stroke: 'var(--danger)', sw: 1.8, dash: '5 4' });
          R(svg, xx - 11, bh + 54 + bh / 2 - 11, 22, 22, { rx: 11, fill: 'var(--bg)', stroke: 'var(--danger)', sw: 1.8 });
          T(svg, xx, bh + 54 + bh / 2 + 0.5, '✕', { anchor: 'middle', fs: 12, fill: 'var(--danger)', weight: 700 });
        }
        sizeSvg(svg, w, 3 * bh + 2 * 54 + 4);
      }
      sR.set(bad ? 'not allowed' : 'runs', bad ? 'danger' : 'core');
      f.setWhy(bad
        ? 'Not allowed: Python code cannot call a <code>@cute.kernel</code> function directly. Kernels are launched, with an explicit grid and block configuration, from inside a <code>@cute.jit</code> function.'
        : 'Python calls the <code>@cute.jit</code> function <code>elem_add</code> like any other function. It is JIT-compiled, works out the launch configuration, and launches the <code>@cute.kernel</code> <code>elem_add_kernel</code> on the GPU with <code>.launch(grid=…, block=…)</code>.');
    });
  }

  /* Fig: atoms and tiled operations */
  function figAtoms(ctx, slot) {
    const f = fig(ctx, slot, {
      title: 'From an atom to a tiled operation', hint: 'pick an atom · pick a thread · arrange the warps', wide: true, class: 'hsc-compact',
      caption: 'The MMA atom is an Ampere-style warp-level matrix multiply-accumulate, <code>mma</code> with shape m16n8k16: one warp (32 threads) computes D (16 × 8) = A (16 × 16) · B (16 × 8) + C, drawn to scale. With FP32 accumulators each thread holds 4 of D’s 128 values: lane ℓ holds rows ⌊ℓ/4⌋ and ⌊ℓ/4⌋ + 8, columns 2(ℓ mod 4) and 2(ℓ mod 4) + 1, as NVIDIA’s PTX documentation specifies. The copy atom is a 16-byte-per-thread vector copy, such as Ampere’s <code>cp.async</code> from global to shared memory. A tiled operation stamps the atom across a layout of warps. Other architectures have other atoms; on Hopper, for example, MMAs are issued by a warpgroup of four warps.',
    });
    const st = { atom: 'mma', lane: 9, wm: 2, wn: 2, warp: 0 };
    GG.ui.seg(f.controls, { label: 'Atom', options: [{ value: 'mma', label: 'MMA (m16n8k16)' }, { value: 'copy', label: 'copy (16 B per thread)' }], value: st.atom, onChange: (v) => { st.atom = v; lay.rebuild(); } });
    const laneS = GG.ui.slider(f.controls, { label: 'Thread (lane) in the warp', min: 0, max: 31, value: st.lane, onInput: (v) => { st.lane = v; lay.rebuild(); } });
    GG.ui.slider(f.controls, { label: 'Warps along M', min: 1, max: 4, value: st.wm, onInput: (v) => { st.wm = v; st.warp = Math.min(st.warp, st.wm * st.wn - 1); lay.rebuild(); } });
    GG.ui.slider(f.controls, { label: 'Warps along N', min: 1, max: 4, value: st.wn, onInput: (v) => { st.wn = v; st.warp = Math.min(st.warp, st.wm * st.wn - 1); lay.rebuild(); } });
    const sW = GG.ui.stat(f.readouts, { label: 'Warps', tone: 'core' });
    const sT = GG.ui.stat(f.readouts, { label: 'Threads', tone: 'core' });
    const sO = GG.ui.stat(f.readouts, { label: 'Tile', tone: 'memory' });
    const sL = GG.ui.stat(f.readouts, { label: 'This lane holds', tone: 'accent' });
    const svg = svgRoot(f.stage, 'The four CuTe DSL abstractions; an MMA atom drawn to scale, D (16 by 8) equals A (16 by 16) times B (16 by 8) plus C, with the chosen thread’s four accumulator elements highlighted, or a copy atom in which 32 threads each move 16 bytes; and a tiled operation that arranges several warps, each running the atom on its own part of the tile.');
    const owns = (lane) => { const g = lane >> 2, t = lane % 4; return [[g, 2 * t], [g, 2 * t + 1], [g + 8, 2 * t], [g + 8, 2 * t + 1]]; };
    const lay = responsive(f.stage, (w) => {
      clear(svg);
      const { wm, wn, lane } = st;
      const narrow = w < 640;
      const mma = st.atom === 'mma';
      // legend of the four abstractions
      const ab = [['Layout', ['how data and threads are arranged', 'data & thread arrangement', 'arrangement'], 'var(--memory)'], ['Tensor', ['pointer or iterator + layout', 'pointer + layout'], 'var(--memory)'], ['Atom', ['one hardware op: MMA or copy', 'one hardware op', 'one op'], 'var(--core)'], ['Tiled op', ['atoms applied across warps/blocks', 'atoms across warps', 'atoms × layout'], 'var(--core)']];
      const cols = narrow ? 2 : 4;
      const aw = (w - (cols - 1) * 8) / cols;
      ab.forEach(([t, d, c], k) => {
        const x = (k % cols) * (aw + 8), y = Math.floor(k / cols) * 44;
        const on = k >= 2;
        R(svg, x, y, aw, 38, { rx: 8, fill: c, op: on ? 0.14 : 0.06, stroke: on ? c : 'var(--line)' });
        T(svg, x + 10, y + 13, t, { fs: 11, fill: 'var(--ink)', weight: 600 });
        T(svg, x + 10, y + 28, fit(d, 10, aw - 20), { fs: 10, fill: 'var(--ink-3)' });
      });
      let top = (narrow ? 2 : 1) * 44 + 26;
      // ── the atom
      const atomW = narrow ? w : Math.min(430, w * 0.48);
      T(svg, 0, top, mma ? 'ATOM: one warp, one mma instruction' : 'ATOM: one warp, one vector copy', { fs: 10, fill: 'var(--ink-3)' });
      let atomBottom;
      const mine = owns(lane);
      if (mma) {
        // GEMM picture: B (K×N = 16×8) above D, A (M×K = 16×16) to its left
        const u = clamp(Math.floor((atomW - 30) / 24), 8, 16);
        const ax = 0, by = top + 22, bx = ax + 16 * u + 10, ay = by + 16 * u + 10, dx = bx, dy = ay;
        T(svg, bx, by - 6, fit(['B: 16 × 8 (K × N)', 'B 16×8'], 10, 8 * u + 40), { fs: 10, fill: 'var(--memory)' });
        T(svg, ax, ay - 6, fit(['A: 16 × 16 (M × K)', 'A 16×16'], 10, 16 * u), { fs: 10, fill: 'var(--memory)' });
        for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) R(svg, ax + j * u, ay + i * u, u - 1, u - 1, { rx: 1, fill: 'var(--memory)', op: 0.12 });
        for (let i = 0; i < 16; i++) for (let j = 0; j < 8; j++) R(svg, bx + j * u, by + i * u, u - 1, u - 1, { rx: 1, fill: 'var(--memory)', op: 0.12 });
        // D = A·B + C: 16×8 accumulators, each owned by one lane
        for (let i = 0; i < 16; i++) for (let j = 0; j < 8; j++) {
          const ln = (i % 8) * 4 + (j >> 1);
          const on = ln === lane;
          const g = G(svg, { class: 'hsc-hit' });
          R(g, dx + j * u, dy + i * u, u - 1, u - 1, { rx: 1.5, fill: on ? 'var(--accent)' : 'var(--memory)', op: on ? 0.9 : 0.1 + 0.25 * ((ln % 4) / 3), stroke: on ? 'var(--accent)' : 'rgba(111,166,255,.3)' });
          if (u >= 16) T(g, dx + j * u + (u - 1) / 2, dy + i * u + (u - 1) / 2 + 0.5, String(ln), { anchor: 'middle', fs: 10, fill: on ? 'var(--bg)' : 'var(--ink-3)' });
          g.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse' && st.lane !== ln) { st.lane = ln; laneS.set(ln); lay.rebuild(); } });
          g.addEventListener('click', () => { st.lane = ln; laneS.set(ln); lay.rebuild(); });
        }
        // the lane's row of A and column of B feed its outputs: show the rows / columns involved
        const rowsA = [...new Set(mine.map((m) => m[0]))], colsB = [...new Set(mine.map((m) => m[1]))];
        rowsA.forEach((i) => R(svg, ax, ay + i * u, 16 * u - 1, u - 1, { rx: 1, fill: 'none', stroke: 'var(--accent)', sw: 1.2 }));
        colsB.forEach((j) => R(svg, bx + j * u, by, u - 1, 16 * u - 1, { rx: 1, fill: 'none', stroke: 'var(--accent)', sw: 1.2 }));
        atomBottom = dy + 16 * u + 6;
        if (dx + 8 * u + 8 + tw('D = A·B + C', 10) <= atomW) {
          T(svg, dx + 8 * u + 8, dy + 8, 'D = A·B + C', { fs: 10, fill: 'var(--ink)' });
          T(svg, dx + 8 * u + 8, dy + 24, '16 × 8', { fs: 10, fill: 'var(--ink-3)' });
          T(svg, dx + 8 * u + 8, dy + 40, '4 per lane', { fs: 10, fill: 'var(--ink-3)' });
        } else {
          T(svg, 0, atomBottom + 10, fit(['D = A·B + C: 16 × 8 accumulators, 4 per lane', 'D = A·B + C: 4 per lane'], 10, atomW), { fs: 10, fill: 'var(--ink)' });
          atomBottom += 18;
        }
        if (u < 16) { T(svg, 0, atomBottom + 10, fit(['hover or tap a cell of D to see which lane owns it', 'tap a cell of D'], 10, atomW), { fs: 10, fill: 'var(--ink-3)' }); atomBottom += 18; }
      } else {
        // 32 lanes, each moving one 16-byte chunk (4 floats): 512 contiguous bytes in all
        const cw = Math.max(8, Math.floor((atomW - 4) / 32));
        const y1 = top + 34, y2 = y1 + 70;
        T(svg, 0, y1 - 10, fit(['global memory: 512 contiguous bytes', 'global: 512 B'], 10, atomW), { fs: 10, fill: 'var(--memory)' });
        T(svg, 0, y2 + 30, fit(['shared memory', 'shared'], 10, atomW), { fs: 10, fill: 'var(--memory)' });
        for (let l = 0; l < 32; l++) {
          const x = l * cw, on = l === lane;
          const g = G(svg, { class: 'hsc-hit' });
          R(g, x, y1, cw - 1, 14, { rx: 1.5, fill: on ? 'var(--accent)' : 'var(--memory)', op: on ? 0.9 : 0.25 });
          R(g, x, y2, cw - 1, 14, { rx: 1.5, fill: on ? 'var(--accent)' : 'var(--memory)', op: on ? 0.9 : 0.25 });
          Ln(g, x + cw / 2, y1 + 16, x + cw / 2, y2 - 2, { stroke: on ? 'var(--accent)' : 'var(--core)', sw: on ? 1.6 : 0.8 });
          g.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse' && st.lane !== l) { st.lane = l; laneS.set(l); lay.rebuild(); } });
          g.addEventListener('click', () => { st.lane = l; laneS.set(l); lay.rebuild(); });
        }
        T(svg, 32 * cw + 6 > atomW - 60 ? 0 : 32 * cw + 6, y1 + 42, fit(['32 lanes, one instruction', '32 lanes'], 10, atomW), { fs: 10, fill: 'var(--core)' });
        atomBottom = y2 + 40;
      }
      // ── the tiled operation
      const tx0 = narrow ? 0 : atomW + 40;
      const ty0 = narrow ? atomBottom + 30 : top + 22;
      const avail = (narrow ? w : w - tx0) - 50;
      T(svg, tx0, ty0 - 8 - (narrow ? 0 : 14), fit([`TILED ${mma ? 'MMA' : 'COPY'}: ${wm} × ${wn} warps`, `${wm}×${wn} warps`], 10, avail + 50), { fs: 10, fill: 'var(--ink-3)' });
      if (!narrow) Arrow(svg, atomW + 6, top + 60, tx0 - 8, top + 60, { stroke: 'var(--accent)' });
      let tiledBottom;
      const sel = st.warp;
      if (mma) {
        // A strip (16·wm × 16) to the left, B strip (16 × 8·wn) on top, output tile (16·wm × 8·wn)
        const cell = Math.max(2, Math.min(9, avail / (16 + 8 * wn + 1), 220 / (16 + 16 * wm)));
        const aX = tx0, bY = ty0, oX = aX + 16 * cell + 6, oY = bY + 16 * cell + 6;
        const selI = sel % wm, selJ = Math.floor(sel / wm);
        R(svg, aX, oY, 16 * cell, 16 * wm * cell, { rx: 3, fill: 'var(--memory)', op: 0.08, stroke: 'var(--line-2)' });
        R(svg, oX, bY, 8 * wn * cell, 16 * cell, { rx: 3, fill: 'var(--memory)', op: 0.08, stroke: 'var(--line-2)' });
        R(svg, aX, oY + selI * 16 * cell, 16 * cell, 16 * cell, { rx: 2, fill: 'var(--accent)', op: 0.25, stroke: 'var(--accent)' });
        R(svg, oX + selJ * 8 * cell, bY, 8 * cell, 16 * cell, { rx: 2, fill: 'var(--accent)', op: 0.25, stroke: 'var(--accent)' });
        T(svg, aX, oY + 16 * wm * cell + 12, 'A', { fs: 10, fill: 'var(--memory)' });
        T(svg, oX + 8 * wn * cell + 6, bY + 8 * cell, 'B', { fs: 10, fill: 'var(--memory)' });
        for (let i = 0; i < wm; i++) for (let j = 0; j < wn; j++) {
          const k = i + j * wm; // warps numbered colexicographically, as CuTe orders layouts
          const x = oX + j * 8 * cell, y = oY + i * 16 * cell, on = k === sel;
          const g = G(svg, { class: 'hsc-hit' });
          R(g, x + 1, y + 1, 8 * cell - 2, 16 * cell - 2, { rx: 3, fill: on ? 'var(--accent)' : 'var(--core)', op: on ? 0.3 : 0.12 + 0.05 * (k % 2), stroke: on ? 'var(--accent)' : 'rgba(69,212,155,.6)' });
          T(g, x + 4 * cell, y + 8 * cell, fit([`warp ${k}`, `w${k}`, String(k)], 10, 8 * cell - 4), { anchor: 'middle', fs: 10, fill: 'var(--ink)' });
          const pick = () => { if (st.warp !== k) { st.warp = k; lay.rebuild(); } };
          g.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') pick(); });
          g.addEventListener('click', pick);
        }
        T(svg, oX + (wn * 8 * cell) / 2, oY + wm * 16 * cell + 12, `N = ${8 * wn}`, { anchor: 'middle', fs: 10, fill: 'var(--ink-3)' });
        T(svg, oX + wn * 8 * cell + 6, oY + (wm * 16 * cell) / 2, `M = ${16 * wm}`, { fs: 10, fill: 'var(--ink-3)' });
        tiledBottom = oY + wm * 16 * cell + 22;
      } else {
        const n = wm * wn, bw = avail + 40, bh = 16;
        for (let k = 0; k < n; k++) {
          const y = ty0 + k * (bh + 4), on = k === sel;
          const g = G(svg, { class: 'hsc-hit' });
          R(g, tx0, y, bw, bh, { rx: 3, fill: on ? 'var(--accent)' : 'var(--memory)', op: on ? 0.35 : 0.18, stroke: on ? 'var(--accent)' : 'rgba(111,166,255,.4)' });
          T(g, tx0 + 6, y + bh / 2, fit([`warp ${k}: bytes ${GG.fmt.int(512 * k)}–${GG.fmt.int(512 * k + 511)}`, `warp ${k}`], 10, bw - 10), { fs: 10, fill: 'var(--ink)' });
          const pick = () => { if (st.warp !== k) { st.warp = k; lay.rebuild(); } };
          g.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') pick(); });
          g.addEventListener('click', pick);
        }
        tiledBottom = ty0 + n * (bh + 4) + 6;
      }
      sizeSvg(svg, w, Math.max(atomBottom, tiledBottom) + 4);
      const nw = wm * wn;
      sW.set(String(nw)); sT.set(GG.fmt.int(32 * nw));
      sO.set(mma ? `${16 * wm} × ${8 * wn} outputs` : `${GG.fmt.int(512 * nw)} bytes`);
      sL.set(mma ? mine.map(([i, j]) => `D[${i}][${j}]`).join(' ') : `bytes ${16 * lane}–${16 * lane + 15}`);
      const sI = sel % wm, sJ = Math.floor(sel / wm);
      f.setWhy(mma
        ? `One <b>mma</b> instruction makes all 32 threads of a warp compute D = A·B + C together. Lane <b>${lane}</b> ends up holding four of D’s values, ${mine.map(([i, j]) => `D[${i}][${j}]`).join(', ')}, built from rows ${mine[0][0]} and ${mine[2][0]} of A and columns ${mine[0][1]} and ${mine[1][1]} of B (copper outlines). The tiled MMA stamps that atom across <b>${nw}</b> warp${nw > 1 ? 's' : ''}: warp ${sel} computes rows ${16 * sI}–${16 * sI + 15} and columns ${8 * sJ}–${8 * sJ + 7} of a ${16 * wm} × ${8 * wn} tile, reading the copper strip of A and the copper strip of B.`
        : `One copy instruction makes each of the warp’s 32 threads move 16 bytes: lane <b>${lane}</b> moves bytes ${16 * lane}–${16 * lane + 15}, and together they move 512 contiguous bytes. The tiled copy stamps that atom across <b>${nw}</b> warp${nw > 1 ? 's' : ''}, ${GG.fmt.int(512 * nw)} bytes per round; warp ${sel} handles bytes ${GG.fmt.int(512 * sel)}–${GG.fmt.int(512 * sel + 511)}.`);
    });
  }

  /* Fig: elem_add — which thread computes which element */
  function figElemAdd(ctx, slot) {
    const f = fig(ctx, slot, {
      title: '{elem_add}: one thread per element', hint: 'change n · pick a thread', wide: true, class: 'hsc-compact',
      caption: 'Each block is drawn as 4 warps of 32 threads (128 threads, as in the code). Green threads pass the bounds check and compute an element; red threads, in the last block, have i ≥ n and do nothing. Below: the selected warp’s neighbourhood of a, b and out (memory, so drawn blue), with the elements the warp’s active threads touch bracketed: 32 adjacent elements for a full warp, fewer for a warp that runs past the end.',
    });
    const TPB = 128;
    const st = { n: 300, bx: 2, tx: 37 };
    const blocksOf = (n) => Math.floor((n + TPB - 1) / TPB);
    GG.ui.slider(f.controls, { label: '{n = out.shape[0]}', min: 1, max: 1024, value: st.n, format: (v) => GG.fmt.int(v), onInput: (v) => { st.n = v; const B = blocksOf(v); st.bx = Math.min(st.bx, B - 1); sbx.input.max = B - 1; sbx.set(st.bx); lay.rebuild(); } });
    const sbx = GG.ui.slider(f.controls, { label: '{block_x}', min: 0, max: blocksOf(st.n) - 1, value: st.bx, onInput: (v) => { st.bx = v; paint(); } });
    const stx = GG.ui.slider(f.controls, { label: '{thread_x}', min: 0, max: TPB - 1, value: st.tx, onInput: (v) => { st.tx = v; paint(); } });
    const sB = GG.ui.stat(f.readouts, { label: 'blocks', tone: 'control' });
    const sL = GG.ui.stat(f.readouts, { label: 'threads launched', tone: 'core' });
    const sI = GG.ui.stat(f.readouts, { label: 'idle threads', tone: 'danger' });
    const sX = GG.ui.stat(f.readouts, { label: '{i}', tone: 'accent' });
    const svg = svgRoot(f.stage, 'Thread blocks of 128 threads each drawn as four warps; threads whose index is below n are active; the chosen thread and its warp are highlighted, with the memory elements they touch.');
    const formula = GG.el('div', { class: 'hsc-formula', 'aria-live': 'polite' });
    f.stage.append(formula);
    let E = null;
    const lay = responsive(f.stage, (w) => {
      clear(svg);
      const B = blocksOf(st.n);
      const narrow = w < 600;
      const bpr = narrow ? 1 : 2;
      const gap = 16;
      const bw = (w - (bpr - 1) * gap) / bpr;
      const c = Math.floor(bw / 32);
      const bh = 4 * c + 18;
      const cells = [];
      for (let b = 0; b < B; b++) {
        const bx0 = (b % bpr) * (bw + gap), by0 = Math.floor(b / bpr) * (bh + 10);
        T(svg, bx0, by0 + 7, `block_x = ${b}`, { fs: 10, fill: 'var(--ink-3)' });
        for (let t = 0; t < TPB; t++) {
          const x = bx0 + (t % 32) * c, y = by0 + 16 + Math.floor(t / 32) * c;
          const g = G(svg, { class: 'hsc-hit' });
          const r = R(g, x, y, c - 1, c - 1, { rx: 1.5, fill: 'var(--core)', op: 0.3 });
          g.addEventListener('click', () => { st.bx = b; st.tx = t; sbx.set(b); stx.set(t); paint(); });
          g.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { st.bx = b; st.tx = t; sbx.set(b); stx.set(t); paint(); } });
          cells.push({ b, t, r });
        }
      }
      const gridH = Math.ceil(B / bpr) * (bh + 10);
      // memory window
      const my = gridH + 22;
      const win = narrow ? 40 : 64;
      const sw = Math.max(5, Math.floor((w - 40) / win));
      const rowsY = [my + 14, my + 14 + sw + 18, my + 14 + 2 * (sw + 18)];
      const strips = ['a', 'b', 'out'].map((nm, q) => {
        T(svg, 0, rowsY[q] + sw / 2, nm, { fs: 10.5, fill: 'var(--memory)', weight: q === 2 ? 700 : 400 });
        const slots = [];
        for (let k = 0; k < win; k++) slots.push(R(svg, 34 + k * sw, rowsY[q], sw - 1, sw, { rx: 1, fill: 'var(--memory)', op: 0.1 }));
        return slots;
      });
      const bracket = G(svg);
      const labs = G(svg);
      sizeSvg(svg, w, rowsY[2] + sw + 30);
      E = { cells, strips, bracket, labs, win, sw, rowsY, B, w, lead: narrow ? 4 : 16 };
      paint();
    });
    function paint() {
      if (!E) return;
      const { n } = st;
      const B = E.B;
      const i = st.bx * TPB + st.tx;
      const warpStart = st.bx * TPB + Math.floor(st.tx / 32) * 32;
      E.cells.forEach(({ b, t, r }) => {
        const gi = b * TPB + t;
        const active = gi < n;
        const sel = b === st.bx && t === st.tx;
        const inWarp = gi >= warpStart && gi < warpStart + 32;
        r.style.fill = sel ? 'var(--accent)' : active ? 'var(--core)' : 'var(--danger)';
        r.style.fillOpacity = sel ? 1 : inWarp ? (active ? 0.75 : 0.55) : active ? 0.3 : 0.22;
        r.style.stroke = inWarp && !sel ? 'var(--special)' : 'none';
      });
      // memory window starts 16 before the warp
      const w0 = clamp(warpStart - E.lead, 0, Math.max(0, n - E.win));
      E.strips.forEach((slots, q) => slots.forEach((r, k) => {
        const e = w0 + k;
        const exists = e < n;
        const inWarp = e >= warpStart && e < warpStart + 32;
        const sel = e === i;
        r.style.fill = sel ? 'var(--accent)' : 'var(--memory)';
        r.style.fillOpacity = !exists ? 0 : sel ? 1 : inWarp ? 0.55 : 0.12;
        // out is the array being written: same memory colour, with a solid outline
        r.style.stroke = !exists ? 'var(--line)' : q === 2 && !sel ? 'var(--memory)' : 'none';
      }));
      clear(E.bracket); clear(E.labs);
      const bx0 = 34 + (warpStart - w0) * E.sw;
      const last = Math.min(warpStart + 32, n);
      const bx1 = 34 + (last - w0) * E.sw - 1;
      if (last > warpStart) {
        const yb = E.rowsY[2] + E.sw + 5;
        Pth(E.bracket, `M${r1(bx0)},${yb} L${r1(bx0)},${yb + 5} L${r1(bx1)},${yb + 5} L${r1(bx1)},${yb}`, { stroke: 'var(--special)', sw: 1.4 });
        const lt = fit([`warp’s elements ${warpStart}–${last - 1}: for 4-byte floats, ${4 * (last - warpStart)} contiguous bytes`, `warp’s elements ${warpStart}–${last - 1} (${4 * (last - warpStart)} bytes)`, `elements ${warpStart}–${last - 1}`], 10, E.w - 4);
        const lw = tw(lt, 10);
        T(E.labs, clamp((bx0 + bx1) / 2, lw / 2 + 2, E.w - lw / 2 - 2), yb + 15, lt, { anchor: 'middle', fs: 10, fill: 'var(--special)' });
      }
      T(E.labs, 34, E.rowsY[0] - 7, String(w0), { fs: 10, fill: 'var(--ink-3)' });
      T(E.labs, 34 + E.win * E.sw, E.rowsY[0] - 7, String(w0 + E.win - 1), { anchor: 'end', fs: 10, fill: 'var(--ink-3)' });
      const launched = B * TPB;
      sB.set(String(B)); sL.set(GG.fmt.int(launched)); sI.set(GG.fmt.int(launched - n)); sX.set(GG.fmt.int(i));
      const ok = i < n;
      formula.innerHTML = `<b>blocks</b> = (n + threads_per_block - 1) // threads_per_block = (${n} + 127) // 128 = <b class="k">${B}</b><br>` +
        `<b>i</b> = block_x * block_dim_x + thread_x = ${st.bx} * 128 + ${st.tx} = <b class="k">${i}</b><br>` +
        (ok ? `<span class="g">${i} &lt; ${n}, so out[${i}] = a[${i}] + b[${i}]</span>` : `<span class="d">${i} ≥ ${n}, so the if skips the body</span>`);
      const idle = launched - n;
      const act = Math.max(0, Math.min(warpStart + 32, n) - warpStart);
      f.setWhy(ok
        ? `Thread ${st.tx} of block ${st.bx} computes element <b>${GG.fmt.int(i)}</b>. ${act === 32 ? 'Its warp’s 32 threads touch 32 neighbouring elements' : `Only ${act} of its warp’s 32 threads pass the bounds check (the other ${32 - act} are past the end); those ${act} touch ${act} neighbouring element${act > 1 ? 's' : ''} (${4 * act} bytes of floats)`} of <code>a</code>, <code>b</code> and <code>out</code> in the same instruction: still one contiguous run, the pattern that <b>memory coalescing</b> needs. ${idle ? `${idle} thread${idle > 1 ? 's' : ''} in the last block ${idle > 1 ? 'have' : 'has'} nothing to do.` : 'n is a multiple of 128, so no thread is idle.'}`
        : `Thread ${st.tx} of block ${st.bx} has i = ${GG.fmt.int(i)}, past the end of the tensor (n = ${GG.fmt.int(n)}). The bounds check <code>if i &lt; out.shape[0]</code> stops it from writing out of bounds; it sits idle.`);
    }
  }

  /* Fig: the JIT pipeline */
  function figPipeline(ctx, slot) {
    const f = fig(ctx, slot, {
      title: 'From {Python} source to SASS', hint: 'step through the compiler', wide: true,
      caption: 'One line, <code>out[i] = a[i] + b[i]</code>, followed through every stage (copper). The AST panel has the structure Python’s own <code>ast</code> module produces for the <code>if</code> statement, with small subtrees abbreviated: <code>out.shape</code> stands for Attribute(Name out, shape), <code>a[i]</code> for Subscript(Name a, Name i). The trace, MLIR, PTX and SASS panels are illustrations of what each stage holds, not real compiler output (register names are made up). At time of writing (CUTLASS 4.x) the stack goes through MLIR, then PTX, then SASS.',
    });
    const STG = [
      { t: 'Python source', form: 'text', knows: 'syntax, as you wrote it' },
      { t: 'AST', form: 'tree', knows: 'the program’s structure' },
      { t: 'Trace', form: 'recorded ops', knows: 'argument types, shapes, layouts' },
      { t: 'MLIR', form: 'IR, many levels', knows: 'operations, lowered step by step' },
      { t: 'PTX', form: 'virtual ISA (text)', knows: 'a minimum SM arch' },
      { t: 'SASS', form: 'machine code', knows: 'one SM architecture’s instructions' },
      { t: 'Run', form: 'a kernel launch', knows: 'your actual data' },
    ];
    const st = { k: 1 };
    let lay = null;
    GG.ui.stepper(f.controls, { label: 'Stage', steps: STG.map((s) => ({ label: s.t })), start: 1, onStep: (i) => { st.k = i; if (lay) lay.rebuild(); } });
    const sF = GG.ui.stat(f.readouts, { label: 'Form', tone: 'host' });
    const sK = GG.ui.stat(f.readouts, { label: 'Knows about', tone: 'core' });
    const svg = svgRoot(f.stage, 'The CuTe DSL compilation pipeline: Python source, abstract syntax tree, tracing with proxy arguments, MLIR, PTX, SASS, and execution on the GPU, with a panel showing how the line out[i] = a[i] + b[i] looks at the current stage.');
    const WHY = [
      'Your kernel is ordinary-looking Python, but the Python interpreter never runs it on the GPU: it is compiled, and only a subset of Python semantics is supported in JIT-compiled code.',
      'Python parses the source into an <b>abstract syntax tree</b>: statements and operators become nodes, names become leaves. Working on the tree lets the DSL see control flow like <code>if i &lt; out.shape[0]</code> as structure (the <b>If</b> node at the top, with its test and its body), not just run it.',
      'The function is then <b>traced with proxy arguments</b>: stand-ins for <code>a</code>, <code>b</code> and <code>out</code> that carry type, shape and layout but no data. Running the code on them records the operations it performs: our line becomes two loads, an add and a store.',
      'The recorded program becomes <b>MLIR</b> (Multi-Level Intermediate Representation), a compiler framework in which a program is lowered through progressively lower-level dialects, from tensor-and-layout operations towards GPU instructions.',
      'MLIR lowers to <b>PTX</b>, NVIDIA’s virtual instruction set: a textual assembly language. PTX is compiled for a minimum SM architecture and, as a rule, also runs on newer ones; code built for an architecture-specific target such as <code>sm_100a</code>, which Blackwell-only features need, is the exception.',
      'PTX is compiled to <b>SASS</b>, the real machine code for one SM architecture, such as the B200 that the Modal Notebook runs on. Our line is now a global load, another global load, a floating-point add and a global store.',
      'Only now does anything run on the GPU: the <code>@cute.jit</code> function launches the compiled kernel on real tensors. Python got a compiled kernel’s speed, because the hot code was never interpreted.',
    ];
    lay = responsive(f.stage, (w) => {
      clear(svg);
      const k = st.k;
      const narrow = w < 640;
      // chain
      const perRow = narrow ? 4 : 7;
      const gap = narrow ? 10 : 12;
      const cw = (w - (perRow - 1) * gap) / perRow, ch = 36;
      STG.forEach((s, q) => {
        const x = (q % perRow) * (cw + gap), y = Math.floor(q / perRow) * (ch + 22);
        const on = q === k, done = q < k;
        const col = q === 6 ? 'var(--core)' : 'var(--host)';
        R(svg, x, y, cw, ch, { rx: 8, fill: col, op: on ? 0.3 : done ? 0.14 : 0.05, stroke: on ? 'var(--accent)' : done ? col : 'var(--line-2)', sw: on ? 1.8 : 1 });
        T(svg, x + cw / 2, y + ch / 2, fit([s.t, s.t.split(' ')[0]], 11, cw - 8), { anchor: 'middle', fs: 11, fill: on || done ? 'var(--ink)' : 'var(--ink-3)', weight: on ? 600 : 400 });
        const lit = done || on ? 'var(--ink-3)' : 'var(--line-2)';
        if (q < STG.length - 1 && (q % perRow) < perRow - 1) Arrow(svg, x + cw + 1, y + ch / 2, x + cw + gap - 1, y + ch / 2, { stroke: lit, head: 5 });
        else if (q < STG.length - 1) {
          // the chain wraps: from the end of this row back to the start of the next
          const yb = y + ch + 10, x2 = cw / 2;
          Pth(svg, `M${r1(x + cw / 2)},${r1(y + ch + 1)} L${r1(x + cw / 2)},${r1(yb)} L${r1(x2)},${r1(yb)}`, { stroke: q < k ? 'var(--ink-3)' : 'var(--line-2)', sw: 1.5 });
          Arrow(svg, x2, yb, x2, y + ch + 21, { stroke: q < k ? 'var(--ink-3)' : 'var(--line-2)', head: 5 });
        }
      });
      const py = Math.ceil(STG.length / perRow) * (ch + 22) + 2;
      if (k < 6) T(svg, 0, py, fit(['ON THE HOST, AT FIRST CALL (compile)', 'HOST: COMPILE'], 10, w), { fs: 10, fill: 'var(--host)' });
      else T(svg, 0, py, fit(['ON THE GPU (run)', 'GPU: RUN'], 10, w), { fs: 10, fill: 'var(--core)' });
      // panel
      const pY = py + 14, pH = 196;
      R(svg, 0, pY, w, pH, { rx: 12, fill: 'var(--surface)', stroke: 'var(--line)' });
      const g = G(svg);
      const px = 14, pw = w - 28;
      const hot = 'var(--accent-2)';
      const mono = (x, y, s, o) => T(g, x, y, s, Object.assign({ fs: 12, fill: 'var(--ink)' }, o || {}));
      const tag = (y, s) => T(g, px + pw, y, s, { anchor: 'end', fs: 10, fill: 'var(--ink-3)' });
      if (k === 0) {
        const fs0 = narrow ? 11 : 12.5;
        mono(px, pY + 30, INDEX_LINE, { fs: fs0 });
        mono(px, pY + 58, 'if i < out.shape[0]:', { fs: fs0 });
        mono(px + 28, pY + 82, 'out[i] = a[i] + b[i]', { fs: fs0, fill: hot });
        T(g, px, pY + 120, fit(['three lines from elem_add_kernel, as written', 'from elem_add_kernel'], 10, pw), { fs: 10, fill: 'var(--ink-3)' });
      } else if (k === 1) {
        // AST of:  if i < out.shape[0]:  out[i] = a[i] + b[i]
        const nodes = [
          { id: 'if', l: 'If', x: 0.5, y: 0, hl: 'if' },
          { id: 'cmp', l: 'Compare  <', x: 0.24, y: 1 },
          { id: 'as', l: 'Assign', x: 0.72, y: 1, hl: 'line' },
          { id: 'ni', l: 'Name i', x: 0.04, y: 2 },
          { id: 'sub', l: 'Subscript', x: 0.33, y: 2 },
          { id: 'out', l: 'out[i]', x: 0.6, y: 2, hl: 'line' },
          { id: 'add', l: 'BinOp  +', x: 0.86, y: 2, hl: 'line' },
          { id: 'attr', l: 'out.shape', x: 0.14, y: 3 },
          { id: 'c0', l: 'Constant 0', x: 0.47, y: 3 },
          { id: 'a', l: 'a[i]', x: 0.72, y: 3, hl: 'line' },
          { id: 'b', l: 'b[i]', x: 0.94, y: 3, hl: 'line' },
        ];
        const edges = [['if', 'cmp', 'test'], ['if', 'as', 'body'], ['cmp', 'ni', 'left'], ['cmp', 'sub', 'comparators'], ['sub', 'attr', 'value'], ['sub', 'c0', 'slice'], ['as', 'out', 'targets'], ['as', 'add', 'value'], ['add', 'a', 'left'], ['add', 'b', 'right']];
        const nfs = 10;
        const NH = 22;
        const P = {};
        nodes.forEach((nd) => { const nw = tw(nd.l, nfs) + 14; P[nd.id] = { x: clamp(px + nd.x * pw - nw / 2, px, px + pw - nw), y: pY + 16 + nd.y * 44, w: nw }; });
        edges.forEach(([a, b, lab]) => {
          const A = P[a], Bn = P[b];
          const x1 = A.x + A.w / 2, y1 = A.y + NH, x2 = Bn.x + Bn.w / 2, y2 = Bn.y;
          const onLine = nodes.find((n) => n.id === b).hl === 'line';
          Ln(g, x1, y1, x2, y2, { stroke: onLine ? 'var(--accent)' : 'var(--line-2)', sw: onLine ? 1.4 : 1 });
          if (!narrow) T(g, (x1 + x2) / 2 + 4, (y1 + y2) / 2, lab, { fs: 10, fill: 'var(--ink-3)', cls: 'hsc-halo' });
        });
        nodes.forEach((nd) => {
          const p = P[nd.id];
          const leaf = /^(Name|Constant)|\[|\./.test(nd.l);
          R(g, p.x, p.y, p.w, NH, { rx: 6, fill: leaf ? 'var(--memory)' : 'var(--host)', op: nd.hl === 'if' ? 0.35 : 0.16, stroke: nd.hl ? 'var(--accent)' : leaf ? 'rgba(111,166,255,.6)' : 'rgba(184,164,255,.6)', sw: nd.hl ? 1.6 : 1 });
          T(g, p.x + p.w / 2, p.y + NH / 2, nd.l, { anchor: 'middle', fs: nfs, fill: 'var(--ink)', weight: nd.hl === 'if' ? 600 : 400 });
        });
      } else if (k === 2) {
        const lines = [
          ['a, b, out', ['→ proxies: type, shape, layout; no data', '→ proxies (no data)']],
          ['block_idx()', ['→ %bx']],
          ['block_dim()', ['→ %bdx']],
          ['thread_idx()', ['→ %tx']],
          ['%bx * %bdx + %tx', ['→ %i']],
          ['if %i < out.shape[0]', ['→ recorded as a branch in the program', '→ recorded as a branch', '→ a branch']],
          ['out[%i] = a[%i] + b[%i]', ['→ load, load, add, store', '→ ld, ld, add, st']],
        ];
        const fs = narrow ? 10 : 11;
        const colX = px + (narrow ? 150 : 190);
        lines.forEach(([a, b], q) => {
          const last = q === lines.length - 1;
          T(g, px, pY + 22 + q * 24, fit([a, a.replace('out[%i] = ', '')], fs, colX - px - 6), { fs, fill: last ? hot : 'var(--ink)' });
          T(g, colX, pY + 22 + q * 24, fit(b, fs, pw - (colX - px)), { fs, fill: last ? hot : q === 0 ? 'var(--control)' : 'var(--ink-2)' });
        });
      } else if (k === 3) {
        const lv = [
          ['tensor & layout operations', ['%v = a[%i] + b[%i];  out[%i] = %v', 'out[%i] = a[%i] + b[%i]']],
          ['loads, arithmetic, stores', ['%x = load a[%i]; %y = load b[%i]; %z = addf %x, %y; store %z, out[%i]', 'load, load, addf, store']],
          ['GPU-level operations', ['global load ×2, 32-bit float add, global store', 'ld.global ×2, add, st.global']],
        ];
        lv.forEach(([t, c], q) => {
          const x = px + q * 14, y = pY + 12 + q * 58, ww = pw - q * 28;
          R(g, x, y, ww, 46, { rx: 8, fill: 'var(--host)', op: 0.08 + q * 0.06, stroke: 'rgba(184,164,255,.5)' });
          T(g, x + 12, y + 14, fit([`level ${q + 1}: ${t}`, t], 10.5, ww - 24), { fs: 10.5, fill: 'var(--ink)' });
          T(g, x + 12, y + 32, fit(c, 10, ww - 24), { fs: 10, fill: hot });
          if (q < 2) Arrow(g, px + pw / 2, y + 47, px + pw / 2, y + 57, { stroke: 'var(--ink-3)', head: 5 });
        });
        tag(pY + pH - 8, 'schematic, not real MLIR');
      } else if (k === 4) {
        T(g, px, pY + 22, 'PTX: Parallel Thread Execution', { fs: 12, fill: 'var(--ink)', weight: 600 });
        ['ld.global.f32   %f1, [%rd5];', 'ld.global.f32   %f2, [%rd7];', 'add.f32         %f3, %f1, %f2;', 'st.global.f32   [%rd9], %f3;'].forEach((l, q) => mono(px, pY + 46 + q * 17, fit([l, l.replace(/ {2,}/g, ' ')], 11, pw), { fs: narrow ? 10 : 11, fill: hot }));
        [['a virtual instruction set, written as text'], ['forward-compatible: runs on its target SM architecture or newer', 'runs on its target SM arch or newer'], ['except arch-specific targets like sm_100a (Blackwell-only features)', 'except arch-specific targets (sm_100a)'], ['still has to be assembled for a real GPU', 'still assembled for a real GPU']].forEach((t, q) => T(g, px, pY + 124 + q * 17, '• ' + fit(t, 10, pw - 20), { fs: 10, fill: 'var(--ink-2)' }));
      } else if (k === 5) {
        T(g, px, pY + 22, 'SASS: Streaming ASSembler', { fs: 12, fill: 'var(--ink)', weight: 600 });
        ['LDG.E   R2, [R2.64]', 'LDG.E   R4, [R4.64]', 'FADD    R7, R2, R4', 'STG.E   [R6.64], R7'].forEach((l, q) => mono(px, pY + 46 + q * 17, l, { fs: narrow ? 10 : 11, fill: hot }));
        [['the GPU’s real machine code'], ['specific to one SM architecture'], ['e.g. the B200 (Blackwell) in the Modal Notebook', 'e.g. the B200 in the Notebook']].forEach((t, q) => T(g, px, pY + 128 + q * 18, '• ' + fit(t, 10.5, pw - 20), { fs: 10.5, fill: 'var(--ink-2)' }));
        tag(pY + 22, 'illustrative');
      } else {
        const blocksShown = 6;
        const bw = Math.min(90, (pw - (blocksShown - 1) * 8) / blocksShown);
        T(g, px, pY + 24, fit(['the GPU runs the kernel: a grid of blocks, 128 threads each', 'a grid of 128-thread blocks'], 11, pw), { fs: 11, fill: 'var(--core)' });
        for (let b = 0; b < blocksShown; b++) {
          const x = px + b * (bw + 8), y = pY + 44;
          R(g, x, y, bw, 60, { rx: 6, fill: 'var(--core)', op: 0.12, stroke: 'rgba(69,212,155,.5)' });
          for (let q = 0; q < 4; q++) R(g, x + 6, y + 8 + q * 12, bw - 12, 8, { rx: 2, fill: 'var(--core)', op: 0.35 });
        }
        T(g, px, pY + 126, fit(['every thread with i < n runs out[i] = a[i] + b[i] on real data', 'each thread: out[i] = a[i] + b[i]'], 10.5, pw), { fs: 10.5, fill: hot });
        T(g, px, pY + 150, fit(['then control returns to Python with out filled in', 'then back to Python'], 10.5, pw), { fs: 10.5, fill: 'var(--ink-3)' });
      }
      sizeSvg(svg, w, pY + pH + 2);
      sF.set(STG[k].form);
      sK.set(STG[k].knows);
      f.setWhy(WHY[k]);
    });
  }

  GG.entry('cute-dsl', {
    render(body, ctx) {
      const s = ctx.html(body, `
        <p><strong>CuTe DSL</strong> is a Python-based Domain-Specific Language (DSL) for writing and dynamically compiling <a data-term="kernel">kernels</a> at high performance and with high developer productivity. A DSL is a small language built for one job; this one reads like Python, but what you write is compiled for the GPU.</p>
        <p>CuTe DSL is part of <a data-term="cutlass">CUTLASS</a>, a collection of <a data-term="cuda-c">CUDA C++</a> templates and DSLs. Unlike <a data-term="cublas">cuBLAS</a> or <a data-term="cudnn">cuDNN</a>, which provide ready-to-call kernels for common operations, the CUTLASS stack provides tools for composably defining high-performance kernels.</p>
        <h3>Four abstractions</h3>
        <p>The core abstractions of CuTe DSL are layouts, tensors, hardware atoms and tiled operations:</p>
        <ul>
          <li><strong>Layouts</strong> describe how data is organized in memory and across threads.</li>
          <li><strong>Tensors</strong> combine data pointers or iterators with layout metadata. (An iterator is CuTe’s generalized pointer: anything that can be offset and dereferenced like one. CuTe can also tag an iterator with the memory space it points into, as <code>make_gmem_ptr</code> does for global memory and <code>make_smem_ptr</code> for shared memory.)</li>
          <li><strong>Atoms</strong> represent fundamental hardware operations such as matrix multiply-accumulate (MMA) or memory copy.</li>
          <li><strong>Tiled operations</strong> describe how atoms are applied across <a data-term="thread-block">thread blocks</a> and <a data-term="warp">warps</a>.</li>
        </ul>
        <p>For the underlying details, see <a data-term="cute">CuTe</a>, where Fig. 1 lets you play with layouts directly.</p>
        <div data-slot="atoms"></div>
        <h3>@cute.jit and @cute.kernel</h3>
        <p>When launching a CuTe DSL kernel from Python, the Python program calls a <code>@cute.jit</code> function, and that function launches a <code>@cute.kernel</code> function. The <code>@cute.jit</code> decorator declares a JIT-compiled function that can be called from Python or from other CuTe DSL functions. The <code>@cute.kernel</code> decorator defines a GPU kernel function that can be launched from a <code>@cute.jit</code> function. Python code cannot call a <code>@cute.kernel</code> function directly.</p>
        <div data-slot="flow"></div>
        <h3>Hello, world: adding two vectors</h3>
        <p>Here is a naive (unoptimized) CuTe DSL kernel for elementwise addition of two one-dimensional tensors: the “hello world” of GPU programming, which goes back to <a href="https://graphics.stanford.edu/papers/brookgpu/brookgpu.pdf">Ian Buck’s Brook framework</a> that preceded and inspired <a data-term="cuda-programming-model">CUDA</a>. You can edit this kernel and execute it on a B200 GPU using <a href="https://modal.com/notebooks/modal-labs/examples/nb-Vnwf5bQck2WSSETJUPk2UD">this Modal Notebook</a>.</p>
        <div data-slot="code"></div>
        ${GG.noteHTML('history', `<p>Brook for GPUs (Buck et al., SIGGRAPH 2004) treated the graphics card as a stream processor: you wrote small “kernels” that were applied to every element of a “stream”, at a time when GPUs could otherwise only be programmed through graphics APIs. Ian Buck went on to join NVIDIA, where he led the development of CUDA.</p>`, 'History, beyond the glossary')}
        <p>The <code>elem_add_kernel</code> function is the <a data-term="kernel">kernel</a>. Each <a data-term="thread">thread</a> computes one output element. The global element index <code>i</code> is computed from the <a data-term="thread-block">thread block</a> index, the number of threads in the block, and the thread index inside the block:</p>
        <div data-slot="line"></div>
        <p>The <code>elem_add</code> function computes the number of thread blocks needed to cover the output tensor (a ceiling division: just enough blocks of 128 for n elements) and launches the kernel with a one-dimensional <a data-term="thread-block-grid">thread block grid</a>. Because n rarely divides evenly by 128, the last block usually has spare threads, which is what the <code>if i &lt; out.shape[0]</code> bounds check is for. Fig. 3 draws every thread.</p>
        <div data-slot="elem"></div>
        <p>This example is pedagogical, not optimized. Even so, it shows a good basic access pattern: adjacent threads read adjacent elements of <code>a</code> and <code>b</code>, then write adjacent elements of <code>out</code>. That is the pattern needed for coalesced accesses to <a data-term="global-memory">global memory</a>; see <a data-term="memory-coalescing">memory coalescing</a>.</p>
        <h3>Why a language for layouts</h3>
        <p>Layout concerns are one reason why CuTe DSL is useful for high-performance kernels. Engineering for <a data-term="perf">performance</a> is difficult because kernels must be closely mapped to hardware: which threads handle which data, how memory is accessed, how work is tiled, and which hardware operations the generated code should use. CuTe DSL allows programmers to express these mappings explicitly while reusing much of the same kernel code across a variety of shapes and <a data-term="streaming-multiprocessor-architecture">Streaming Multiprocessor architectures</a>.</p>
        <h3>Python, compiled</h3>
        <p>This may be surprising to performance-focused engineers from other domains. How can a program written in an interpreted language like Python hope to compete with programs written in compiled languages?</p>
        <p>The answer is that CuTe DSL kernels are compiled, Just-In-Time (JIT): at run time, when they are first needed, rather than ahead of time. Python source code is converted to an abstract syntax tree (AST), traced with proxy arguments, and then compiled. Note that only a subset of Python semantics are supported in JIT-compiled code.</p>
        <p>At time of writing, in CUTLASS 4.x, the compilation stack passes through <a href="https://mlir.llvm.org/">Multi-Level Intermediate Representation (MLIR)</a> to the <a data-term="parallel-thread-execution">PTX</a> IR to device-specific <a data-term="streaming-assembler">SASS</a> before being executed.</p>
        <div data-slot="pipe"></div>
        ${GG.noteHTML('intuition', `<p>Why both an AST and a trace? Tracing on its own only records what happens for the stand-in values it runs with, so a data-dependent branch such as <code>if i &lt; out.shape[0]</code> would be baked in one way; <code>i</code> is not even known until each GPU thread computes it. Looking at the syntax tree lets the compiler turn Python control flow into real branches and loops in the generated code. This is also why only a subset of Python works: everything has to have a meaning on the GPU.</p>`)}
        <h3>State of the art, from Python</h3>
        <p>Consider the <a href="https://arxiv.org/abs/2603.05451">FlashAttention-4</a> kernels. Modal’s <a href="https://modal.com/blog/reverse-engineer-flash-attention-4">write-up</a> of the open-source code walks through how it uses pipelined warp specialization, <a data-term="tensor-core">Tensor Core</a> operations, and <a data-term="tensor-memory">Tensor Memory</a> &amp; <a data-term="tensor-memory-accelerator">Tensor Memory Accelerator</a> operations to achieve state-of-the-art performance directly from CuTe DSL.</p>
        ${GG.noteHTML('beyond', `<p><b>Warp specialization</b> means giving different <a data-term="warp">warps</a> in a block different jobs: some only move data (for example with the Tensor Memory Accelerator), others only issue Tensor Core instructions, and they hand work to each other through a pipeline of buffers, so loading the next tile overlaps with computing on the current one.</p>`)}
        <p>For more details on CuTe DSL, see NVIDIA’s <a href="https://docs.nvidia.com/cutlass/4.4.2/media/docs/pythonDSL/cute_dsl.html">CuTe DSL documentation</a> and <a href="https://developer.nvidia.com/blog/achieve-cutlass-c-performance-with-python-apis-using-cute-dsl/">CuTe DSL overview blog</a>.</p>
        <div data-slot="reading"></div>
      `);
      guard(() => figAtoms(ctx, s.atoms));
      guard(() => figCallFlow(ctx, s.flow));
      guard(() => {
        const L = (n) => lineOf(ELEM_ADD_CODE, n);
        const notes = {};
        notes[L('import cutlass.cute')] = 'CuTe DSL ships in CUTLASS’s Python package; <code>cute</code> is the conventional short name.';
        notes[L('import torch')] = 'PyTorch, used here for its tensors.';
        notes[L('Tensor = cute.Tensor | torch.Tensor')] = 'A type alias written with Python’s union syntax: <code>elem_add</code> is annotated to accept either CuTe tensors or PyTorch tensors.';
        notes[L('@cute.kernel')] = 'Marks the GPU kernel. It can only be launched from a <code>@cute.jit</code> function, never called from plain Python.';
        notes[L('def elem_add_kernel')] = 'This body runs once per GPU thread, in parallel.';
        notes[L('block_x, _, _')] = 'This thread’s block index in the grid, as an (x, y, z) triple; <code>_</code> discards y and z. The CUDA C++ equivalent is <code>blockIdx</code>.';
        notes[L('block_dim_x, _, _')] = 'Threads per block, (x, y, z); here (128, 1, 1). CUDA C++: <code>blockDim</code>.';
        notes[L('thread_x, _, _')] = 'This thread’s index inside its block, 0 to 127. CUDA C++: <code>threadIdx</code>.';
        notes[L('i = block_x')] = 'The global element index: skip over all earlier blocks, then add this thread’s position in its own block.';
        notes[L('if i < out.shape[0]')] = 'Bounds check. The last block can have more threads than elements left; those threads must not touch memory past the end.';
        notes[L('out[i] = a[i] + b[i]')] = 'The actual work: two loads, one addition, one store.';
        notes[L('@cute.jit')] = 'A JIT-compiled function, callable from Python (or other CuTe DSL functions). It sets up and launches the kernel.';
        notes[L('n = out.shape[0]')] = 'The number of elements to produce.';
        notes[L('threads_per_block = 128')] = '128 threads = 4 warps of 32.';
        notes[L('blocks = (n + threads_per_block')] = 'Ceiling division: the smallest number of 128-thread blocks that covers n elements.';
        notes[L('elem_add_kernel(a, b, out).launch(')] = 'Inside a <code>@cute.jit</code> function, a kernel is launched by calling it with its arguments and then <code>.launch(…)</code> with an explicit launch configuration.';
        notes[L('grid=(blocks, 1, 1)')] = 'A one-dimensional grid of <code>blocks</code> thread blocks.';
        notes[L('block=(threads_per_block, 1, 1)')] = 'Each block is one-dimensional too: 128 threads along x.';
        codeAt(ctx, s.code, { lang: 'python', code: ELEM_ADD_CODE, caption: 'elem_add: a naive elementwise-addition kernel in CuTe DSL', notes, wide: true });
      });
      guard(() => codeAt(ctx, s.line, { lang: 'python', code: INDEX_LINE, lineNumbers: false, copy: false }));
      guard(() => figElemAdd(ctx, s.elem));
      guard(() => figPipeline(ctx, s.pipe));
      ctx.reading(s.reading, [
        { href: 'https://docs.nvidia.com/cutlass/4.4.2/media/docs/pythonDSL/cute_dsl.html', label: 'CuTe DSL documentation', note: 'NVIDIA' },
        { href: 'https://developer.nvidia.com/blog/achieve-cutlass-c-performance-with-python-apis-using-cute-dsl/', label: 'Achieve CUTLASS C++ performance with Python APIs using CuTe DSL', note: 'NVIDIA’s overview blog' },
        { href: 'https://modal.com/notebooks/modal-labs/examples/nb-Vnwf5bQck2WSSETJUPk2UD', label: 'Run elem_add on a B200', note: 'Modal Notebook' },
        { href: 'https://graphics.stanford.edu/papers/brookgpu/brookgpu.pdf', label: 'Brook for GPUs', note: 'Ian Buck et al.' },
        { href: 'https://mlir.llvm.org/', label: 'MLIR', note: 'the Multi-Level Intermediate Representation project' },
        { href: 'https://arxiv.org/abs/2603.05451', label: 'FlashAttention-4', note: 'arXiv' },
        { href: 'https://modal.com/blog/reverse-engineer-flash-attention-4', label: 'Reverse-engineering FlashAttention-4', note: 'Modal blog' },
      ]);
      keepCase(body);
    },
  });

  /* ═════════════════════════════════════════════════════════════
     cuTile BASIC
     ═════════════════════════════════════════════════════════════ */
  const BASIC_CODE = `10 REM Vector Add: C = A + B
20 INPUT N, A(), B()
30 DIM A(N), B(N), C(N)
40 TILE A(128), B(128), C(128)
50 LET C(BID) = A(BID) + B(BID)
60 OUTPUT C
70 END`;

  /* Fig: RUN the program on an old terminal, and watch the tiles */
  function figRun(ctx, slot) {
    const f = fig(ctx, slot, {
      title: 'RUN', hint: 'press Run · change N', wide: true,
      caption: 'An illustration of what the program means, not a capture of cuTile BASIC’s real output. The arrays are split into tiles of 128 elements; one tile block per tile, numbered by BID, adds its tile of A to its tile of B. All tile blocks run at once. N is kept to multiples of 128 so every tile is full.',
    });
    const TILE = 128;
    const st = { N: 512, t: 0, phase: 'idle' };
    const crt = GG.el('div', { class: 'hsc-crt', role: 'img', 'aria-label': 'A retro terminal showing the cuTile BASIC listing and RUN' });
    const pre = GG.el('pre');
    crt.append(pre);
    f.stage.append(crt);
    const svg = svgRoot(f.stage, 'Arrays A, B and C drawn as strips split into 128-element tiles, with one tile block per tile computing C(BID) = A(BID) + B(BID).');
    svg.style.marginTop = '14px';
    const lines = BASIC_CODE.split('\n');
    const total = BASIC_CODE.length;
    // timeline (seconds): typing, then each program line
    const TYPE = 3.2;
    const PH = [{ ln: 1, d: 0.9 }, { ln: 2, d: 0.9 }, { ln: 3, d: 1.1 }, { ln: 4, d: 1.6 }, { ln: 5, d: 0.9 }, { ln: 6, d: 0.6 }];
    const RUN_T = PH.reduce((s, p) => s + p.d, 0);
    const anim = GG.anim(f.stage, (t, dt) => { st.t += dt; if (st.t > TYPE + 0.5 + RUN_T + 0.3) { st.t = TYPE + 0.5 + RUN_T + 0.3; anim.stop(); runBtn.setLabel('Run again', 'reset'); } frame(); }, { autostart: false });
    const runBtn = GG.ui.button(f.controls, { label: 'Run', icon: 'play', onClick: () => { st.t = 0; anim.start(); runBtn.setLabel('Run', 'play'); frame(); } });
    GG.ui.slider(f.controls, { label: 'N (elements)', min: 128, max: 2048, step: 128, value: st.N, format: (v) => GG.fmt.int(v), onInput: (v) => { st.N = v; lay.rebuild(); } });
    const sT = GG.ui.stat(f.readouts, { label: 'tiles = tile blocks', tone: 'core' });
    GG.ui.stat(f.readouts, { label: 'elements per tile', tone: 'memory', value: String(TILE) });
    const sL = GG.ui.stat(f.readouts, { label: 'running line', tone: 'accent' });
    let E = null;
    const lay = responsive(f.stage, (w) => {
      clear(svg);
      const T_ = st.N / TILE;
      const labW = 26;
      const x0 = labW, W = w - labW;
      const tw_ = W / T_;
      const rowY = { A: 16, B: 50, BLK: 96, C: 158 };
      const H = 24;
      const tiles = { A: [], B: [], C: [] };
      ['A', 'B', 'C'].forEach((nm) => {
        T(svg, 0, rowY[nm] + H / 2, nm, { fs: 13, fill: 'var(--memory)', weight: 600 });
        for (let k = 0; k < T_; k++) {
          const r = R(svg, x0 + k * tw_ + 1, rowY[nm], tw_ - 3, H, { rx: 4, fill: 'var(--memory)', op: 0.1, stroke: 'rgba(111,166,255,.45)' });
          const lab = tw_ >= 44 ? T(svg, x0 + k * tw_ + tw_ / 2, rowY[nm] + H / 2, `${nm}(${k})`, { anchor: 'middle', fs: 10, fill: 'var(--ink-2)' }) : null;
          tiles[nm].push({ r, lab });
        }
      });
      T(svg, x0, rowY.A - 8, fit([`${GG.fmt.int(st.N)} elements · ${T_} tiles of 128`, `${T_} tiles`], 10, W), { fs: 10, fill: 'var(--ink-3)' });
      const blocks = [];
      for (let k = 0; k < T_; k++) {
        const bx = x0 + k * tw_ + 3, bw = tw_ - 7;
        const g = G(svg);
        const r = R(g, bx, rowY.BLK, bw, 40, { rx: 6, fill: 'var(--core)', op: 0.06, stroke: 'rgba(69,212,155,.35)' });
        const lab = T(g, bx + bw / 2, rowY.BLK + 13, tw_ >= 56 ? `BID ${k}` : String(k), { anchor: 'middle', fs: 10, fill: 'var(--ink-2)' });
        const plus = tw_ >= 30 ? T(g, bx + bw / 2, rowY.BLK + 28, '+', { anchor: 'middle', fs: 13, fill: 'var(--ink-3)' }) : null;
        const lines3 = [
          Ln(g, bx + bw / 2 - 4, rowY.B + H + 1, bx + bw / 2 - 4, rowY.BLK - 1, { stroke: 'transparent', sw: 1.5 }),
          Ln(g, bx + bw / 2, rowY.BLK + 41, bx + bw / 2, rowY.C - 1, { stroke: 'transparent', sw: 1.5 }),
        ];
        blocks.push({ r, lab, plus, lines3 });
      }
      T(svg, 0, rowY.BLK + 20, 'BID', { fs: 10, fill: 'var(--ink-3)' });
      sizeSvg(svg, w, rowY.C + H + 4);
      E = { tiles, blocks, T_ };
      sT.set(String(T_));
      frame();
    });
    function frame() {
      if (!E) return;
      const t = st.t;
      let typed = total, runLine = -1, runProg = 0, started = false;
      if (anim.running || t > 0) {
        started = true;
        if (t < TYPE) typed = Math.floor((t / TYPE) * total);
        else if (t >= TYPE + 0.5) {
          let acc = TYPE + 0.5;
          runLine = 7;
          for (const p of PH) { if (t < acc + p.d) { runLine = p.ln; runProg = (t - acc) / p.d; break; } acc += p.d; }
        } else runLine = 0;
      }
      // terminal text
      let out = '';
      let left = typed;
      lines.forEach((ln, k) => {
        if (left <= 0) return;
        const part = ln.slice(0, Math.max(0, left));
        left -= ln.length + 1;
        // runLine 1–6 is program line 20–70, which is listing line k = 1–6; after the run (7) END stays lit
        const hl = runLine >= 1 && k === Math.min(runLine, 6);
        out += hl ? `<span class="hl">${esc(part)}</span>\n` : `${esc(part)}\n`;
      });
      const doneTyping = typed >= total;
      if (!started) out = lines.map((l) => esc(l)).join('\n') + '\n\n<span class="dim">Press Run.</span>';
      else {
        if (!doneTyping) out = out.replace(/\n$/, '') + '<span class="cur"></span>';
        else if (runLine === 0) out += '\nRUN<span class="cur"></span>';
        else if (runLine >= 1) out += `\nRUN\n<span class="dim">${runLine >= 7 ? `${E.T_} tile blocks ran. C holds ${GG.fmt.int(st.N)} sums.` : `line ${[20, 30, 40, 50, 60][runLine - 1] || 70}…`}</span>`;
      }
      pre.innerHTML = out;
      // arrays
      const L = runLine;
      const showStatic = !started; // before RUN: draw the finished picture so the figure teaches without interaction
      const inp = showStatic || L >= 1, dim = showStatic || L >= 2, tiled = showStatic || L >= 3, comp = showStatic || L >= 4, outp = showStatic || L >= 5;
      const cProg = showStatic || L > 4 ? 1 : L === 4 ? runProg : 0;
      ['A', 'B', 'C'].forEach((nm) => E.tiles[nm].forEach((tl) => {
        const isC = nm === 'C';
        const present = isC ? dim : inp;
        tl.r.style.opacity = present ? 1 : 0.15;
        tl.r.style.fillOpacity = isC ? (comp ? 0.1 + 0.4 * cProg : 0.04) : 0.3;
        // C is memory too (blue); once written it gets a solid outline
        tl.r.style.stroke = tiled ? (isC && comp ? 'var(--memory)' : 'rgba(111,166,255,.6)') : 'transparent';
        tl.r.style.strokeWidth = isC && comp ? 1.5 : 1;
        if (isC && outp && L === 5) tl.r.style.stroke = 'var(--accent)';
        if (tl.lab) tl.lab.style.opacity = tiled ? 1 : 0;
      }));
      E.blocks.forEach((b) => {
        const on = comp;
        b.r.style.fillOpacity = on ? (L === 4 ? 0.2 + 0.25 * Math.sin(runProg * Math.PI) : 0.18) : 0.04;
        b.r.style.stroke = on ? 'var(--core)' : 'rgba(69,212,155,.2)';
        b.lab.style.fill = on ? 'var(--ink)' : 'var(--ink-3)';
        b.lines3.forEach((ln) => { ln.style.stroke = on ? 'var(--core)' : 'transparent'; });
      });
      const lineNo = [0, 20, 30, 40, 50, 60, 70, 70][Math.max(0, L)] || 0;
      sL.set(started && L >= 1 ? String(lineNo) : '—');
      const whys = {
        0: 'The listing is typed in. Classic BASIC runs the numbered lines in order when you type <b>RUN</b>.',
        1: '<b>20 INPUT</b>: the program takes its inputs, the length N and the arrays A and B.',
        2: `<b>30 DIM</b>: dimension three arrays of N = ${GG.fmt.int(st.N)} elements; C is still empty.`,
        3: `<b>40 TILE</b>: declare that A, B and C are processed in tiles of 128 elements: ${E.T_} tiles each.`,
        4: `<b>50 LET C(BID) = A(BID) + B(BID)</b>: ${E.T_} tile blocks run at once. Tile block BID adds tile BID of A to tile BID of B, writing tile BID of C: 128 additions as one tile operation, in a single thread of execution.`,
        5: '<b>60 OUTPUT C</b>: the result array is handed back.',
        6: '<b>70 END</b>.',
        7: `Done: ${E.T_} tile blocks, one per 128-element tile, computed all ${GG.fmt.int(st.N)} sums. Change N and press Run again.`,
      };
      f.setWhy(!started
        ? `Press <b>Run</b> to type the program in and run it. The picture below shows the result for N = ${GG.fmt.int(st.N)}: ${E.T_} tiles of 128 elements, one tile block (BID 0 to ${E.T_ - 1}) per tile.`
        : !doneTyping ? whys[0] : whys[Math.max(0, L)] || whys[0]);
    }
  }

  /* Fig: threads versus tiles */
  function figSimtTile(ctx, slot) {
    const f = fig(ctx, slot, {
      title: 'Same addition, two programming models', hint: 'switch the model', wide: true,
      caption: 'Top: the units of execution (in SIMT, each block of 128 threads is drawn as its 4 warps of 32). Middle: the same N-element arrays. Bottom: a zoom on tile 0, showing who handles its 128 elements. In CUDA SIMT (as in the CuTe DSL example) you write code for one thread and one element; in CUDA Tile you write code for one tile block and one whole tile.',
    });
    const st = { m: 'tile', N: 1024 };
    GG.ui.seg(f.controls, { label: 'Programming model', options: [{ value: 'simt', label: 'CUDA SIMT (elem_add)' }, { value: 'tile', label: 'CUDA Tile (cuTile BASIC)' }], value: st.m, onChange: (v) => { st.m = v; lay.rebuild(); } });
    GG.ui.slider(f.controls, { label: 'N', min: 128, max: 2048, step: 128, value: st.N, format: (v) => GG.fmt.int(v), onInput: (v) => { st.N = v; lay.rebuild(); } });
    const sU = GG.ui.stat(f.readouts, { label: 'units of execution', tone: 'core' });
    const sH = GG.ui.stat(f.readouts, { label: 'each one handles', tone: 'memory' });
    const svg = svgRoot(f.stage, 'Units of execution above an array: thousands of threads, one per element, in the SIMT model, or a handful of tile blocks, one per 128-element tile, in the Tile model; below, a zoom on the first tile.');
    const lay = responsive(f.stage, (w) => {
      clear(svg);
      const { N } = st, simt = st.m === 'simt';
      const T_ = N / 128;
      const W = w;
      const uy = 18, ay = 110;
      T(svg, 0, 6, fit(simt ? [`${GG.fmt.int(N)} THREADS, IN ${T_} BLOCKS OF 128 (4 WARPS EACH)`, `${GG.fmt.int(N)} THREADS, ${T_} BLOCKS`, `${GG.fmt.int(N)} THREADS`] : [`${T_} TILE BLOCKS, EACH A SINGLE THREAD OF EXECUTION`, `${T_} TILE BLOCKS`], 10, w), { fs: 10, fill: 'var(--ink-3)' });
      const xs = (b) => Math.round((b / T_) * W); // integer pixel edges, so identical blocks look identical
      for (let b = 0; b < T_; b++) {
        const bx = xs(b), bw = xs(b + 1) - bx;
        if (simt) {
          R(svg, bx + 1, uy, bw - 2, 62, { rx: 4, fill: 'none', stroke: 'rgba(69,212,155,.35)' });
          const wh = 11;
          for (let q = 0; q < 4; q++) R(svg, bx + 3, uy + 5 + q * (wh + 2), Math.max(1, bw - 6), wh, { rx: 2, fill: 'var(--core)', op: 0.35 });
        } else {
          R(svg, bx + 2, uy + 6, bw - 4, 50, { rx: 6, fill: 'var(--core)', op: 0.25, stroke: 'var(--core)' });
          if (bw > 26) T(svg, bx + bw / 2, uy + 31, bw > 60 ? `BID ${b}` : String(b), { anchor: 'middle', fs: 10, fill: 'var(--ink)' });
        }
      }
      // mapping arrows
      for (let b = 0; b < T_; b++) {
        const cx = (xs(b) + xs(b + 1)) / 2;
        if (W / T_ > 14) Arrow(svg, cx, uy + 64, cx, ay - 4, { stroke: 'var(--ink-3)', head: 5 });
      }
      for (let b = 0; b < T_; b++) {
        const bx = xs(b), bw = xs(b + 1) - bx;
        R(svg, bx + 1, ay, bw - 2, 22, { rx: 3, fill: 'var(--memory)', op: b === 0 ? 0.4 : 0.2, stroke: b === 0 ? 'var(--accent)' : 'rgba(111,166,255,.5)' });
      }
      T(svg, 0, ay + 36, fit([`the arrays: ${GG.fmt.int(N)} elements = ${T_} tiles of 128`, `${GG.fmt.int(N)} elements`], 10, w), { fs: 10, fill: 'var(--memory)' });
      // zoom on tile 0: who touches its 128 elements
      const zy = ay + 66;
      T(svg, 0, zy, fit(['ZOOM ON TILE 0: ITS 128 ELEMENTS', 'TILE 0, ZOOMED'], 10, w), { fs: 10, fill: 'var(--accent-2)' });
      const ex = (e) => Math.round((e / 128) * (W - 2)); // integer-snapped element edges
      const uY = zy + 14, eY = zy + 78;
      if (simt) {
        // 128 threads, one per element: one thin line each
        for (let e = 0; e < 128; e++) {
          const x0 = ex(e), x1 = ex(e + 1), cx = Math.round((x0 + x1) / 2) + 0.5;
          R(svg, x0, uY, Math.max(1, x1 - x0 - 1), 10, { fill: 'var(--core)', op: e % 32 === 0 ? 0.9 : 0.55 });
          Ln(svg, cx, uY + 11, cx, eY - 1, { stroke: 'var(--core)', sw: 0.8 });
        }
        T(svg, (W - 2) / 2, eY + 26, fit(['128 threads (green), each with its own line to one element', '128 threads, one element each'], 10, W - 70), { anchor: 'middle', fs: 10, fill: 'var(--core)' });
      } else {
        R(svg, 0, uY, W - 2, 24, { rx: 6, fill: 'var(--core)', op: 0.25, stroke: 'var(--core)' });
        T(svg, (W - 2) / 2, uY + 12, fit(['tile block BID 0: one thread of execution', 'BID 0'], 10, W - 12), { anchor: 'middle', fs: 10, fill: 'var(--ink)' });
        // one wide arrow covering the whole tile
        Pth(svg, `M${r1(8)},${r1(uY + 28)} L${r1(W - 10)},${r1(uY + 28)} L${r1(W - 10)},${r1(eY - 16)} L${r1((W - 2) / 2 + 18)},${r1(eY - 16)} L${r1((W - 2) / 2)},${r1(eY - 3)} L${r1((W - 2) / 2 - 18)},${r1(eY - 16)} L${r1(8)},${r1(eY - 16)} Z`, { fill: 'var(--core)', op: 0.18, stroke: 'var(--core)' });
        T(svg, (W - 2) / 2, uY + 38, fit(['one tile operation on all 128 elements at once', 'one op, all 128'], 10, W - 30), { anchor: 'middle', fs: 10, fill: 'var(--ink)' });
      }
      for (let e = 0; e < 128; e++) {
        const x0 = ex(e), x1 = ex(e + 1);
        R(svg, x0, eY, Math.max(1, x1 - x0 - (x1 - x0 > 3 ? 1 : 0)), 14, { fill: 'var(--memory)', op: 0.4 });
      }
      T(svg, 0, eY + 26, '0', { fs: 10, fill: 'var(--ink-3)' });
      T(svg, W - 2, eY + 26, '127', { anchor: 'end', fs: 10, fill: 'var(--ink-3)' });
      sizeSvg(svg, w, eY + 34);
      sU.set(simt ? `${GG.fmt.int(N)} threads` : `${T_} tile blocks`);
      sH.set(simt ? '1 element' : '128 elements');
      f.setWhy(simt
        ? `In the SIMT model, the same instructions are issued to many threads: <b>${GG.fmt.int(N)}</b> of them here, each computing one element from its own index <code>i</code>. The zoom shows tile 0’s 128 elements, each with its own thread. The programmer reasons about one thread at a time.`
        : `In the Tile model, the program is a tile-kernel run by a grid of <b>${T_}</b> tile blocks. Each is a single thread of execution that operates on a whole 128-element tile at once (the zoom: one tile block, one operation, all of tile 0); how that maps onto the GPU’s threads (and, for matrix multiplications, its Tensor Cores) is the compiler’s job.`);
    });
  }

  GG.entry('cutile-basic', {
    render(body, ctx) {
      const s = ctx.html(body, `
        <p><strong>cuTile BASIC</strong> is an implementation of the <a data-term="cuda-tile-programming-model">CUDA Tile programming model</a> in the <a href="https://modal-cdn.com/BASIC_Oct64.pdf">BASIC programming language</a>. BASIC stands for Beginner’s All-purpose Symbolic Instruction Code.</p>
        <p>BASIC is a programming language designed, in the 1960s, for ease of use and interactive programming. It was popular among early microcomputer programmers like William Gates III.</p>
        <div data-slot="nums"></div>
        ${GG.noteHTML('history', `<p>BASIC was created at Dartmouth College by John G. Kemeny and Thomas E. Kurtz, and its first programs ran in 1964; the glossary links to the BASIC manual of October 1964. “William Gates III” is Bill Gates: in 1975 he and Paul Allen wrote a BASIC interpreter for the Altair 8800 microcomputer, Microsoft’s first product. Classic BASIC programs number their lines, usually in steps of 10, so that new lines can be slipped in between later.</p>`, 'History, beyond the glossary')}
        <p>cuTile BASIC was released <a href="https://developer.nvidia.com/blog/cuda-tile-programming-now-available-for-basic/">as an April Fools’ joke</a>. It is a real, if toy, implementation of the programming model, and a demonstration of its generality: if tiles can be bolted onto a language from the 1960s, the model is not tied to any one syntax. You can run the vector-addition cuTile BASIC kernel below on a B200 GPU using <a href="https://modal.com/notebooks/modal-labs/examples/nb-151VgRNHYEDuKSfxJRjV5N">this Modal Notebook</a>. cuTile BASIC was developed, in part, via such Notebooks.</p>
        <div data-slot="code"></div>
        <div data-slot="run"></div>
        <h3>Thinking in tiles</h3>
        <p>Set this next to the “hello world” in the <a data-term="cute-dsl">CuTe DSL</a> entry, which adds two vectors the classic way: one <a data-term="thread">thread</a> per element, 128 threads per <a data-term="thread-block">thread block</a>, each thread computing its own index. The program above never mentions a thread. In the <a data-term="cuda-tile-programming-model">CUDA Tile programming model</a>, programs are written as tile-kernels that run across a grid of <em>tile blocks</em>, each of which is a single thread of execution operating on whole tiles; the mapping onto the hardware is left to the compiler.</p>
        <div data-slot="cmp"></div>
        <p>The same model is available, in more serious form, via cuTile Python, and experimentally via cuTile Rust; the <a data-term="cuda-tile-programming-model">CUDA Tile programming model</a> entry covers both.</p>
        <div data-slot="reading"></div>
      `);
      guard(() => ctx.numbers(s.nums, [
        { value: '1964', label: 'BASIC’s first programs run at Dartmouth', tone: 'host' },
        { value: '1975', label: 'Gates and Allen’s Altair BASIC', tone: 'host' },
        { value: '7', label: 'lines in the cuTile BASIC vector add', tone: 'core' },
        { value: '128', label: 'elements per tile in that program', tone: 'memory' },
      ]));
      guard(() => {
        const notes = {
          1: '<code>REM</code> is a remark: a comment. This one names the program.',
          2: '<code>INPUT</code> takes the program’s inputs: the length <code>N</code> and the arrays <code>A</code> and <code>B</code>.',
          3: '<code>DIM</code> (dimension) sizes the three arrays to N elements each.',
          4: 'The tile part: process <code>A</code>, <code>B</code> and <code>C</code> in tiles of 128 elements.',
          5: '<code>BID</code> is the tile block’s index. Each tile block adds tile BID of A to tile BID of B and stores tile BID of C: one line of BASIC, 128 additions.',
          6: 'Hand back the result array.',
          7: 'The end of the program.',
        };
        codeAt(ctx, s.code, { lang: 'basic', code: BASIC_CODE, caption: 'vector add in cuTile BASIC', notes, lineNumbers: false });
      });
      guard(() => figRun(ctx, s.run));
      guard(() => figSimtTile(ctx, s.cmp));
      ctx.reading(s.reading, [
        { href: 'https://developer.nvidia.com/blog/cuda-tile-programming-now-available-for-basic/', label: 'CUDA Tile programming now available for BASIC', note: 'NVIDIA’s April Fools’ announcement' },
        { href: 'https://modal.com/notebooks/modal-labs/examples/nb-151VgRNHYEDuKSfxJRjV5N', label: 'Run the cuTile BASIC vector add on a B200', note: 'Modal Notebook' },
        { href: 'https://modal-cdn.com/BASIC_Oct64.pdf', label: 'BASIC manual, October 1964', note: 'PDF' },
      ]);
      keepCase(body);
    },
  });
})();
