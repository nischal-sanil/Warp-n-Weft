/* chapters/hs-b.js: Host Software, part B.
   Entries: cuda-graph, nvcc, nvrtc, cupti, nsight-systems, cuda-binary-utilities.
   Every CSS class here is prefixed "hsb-". */
(function () {
  'use strict';

  GG.css(`
/* ── shared ── */
.hsb-w { position: relative; min-width: 0; }
.hsb-legend { display: flex; flex-wrap: wrap; gap: 6px 16px; margin-top: 10px; font: 500 11px/1.4 var(--font-mono); color: var(--ink-2); }
.hsb-legend span { display: inline-flex; align-items: center; gap: 7px; }
.hsb-legend i { width: 11px; height: 11px; border-radius: 3px; flex: none; display: inline-block; }
.hsb-sw-core { background: var(--core); }
.hsb-sw-control { background: var(--control); }
.hsb-sw-host { background: var(--host); }
.hsb-sw-memory { background: var(--memory); }
.hsb-sw-special { background: var(--special); }
.hsb-sw-danger { background: rgba(255, 91, 110, 0.62); }
.hsb-sw-idle { background: var(--danger-a); box-shadow: inset 0 0 0 1px rgba(255, 91, 110, 0.6); }
.hsb-sw-ptx { background: transparent; box-shadow: inset 0 0 0 1.5px var(--ink-2); border-radius: 3px; }
.entry-body code.hsb-wc, .entry-body.hsb-body :not(pre) > code { white-space: normal; overflow-wrap: anywhere; }
.hsb-tool { font: 500 11px/1.3 var(--font-mono); color: var(--control); white-space: nowrap; }
.hsb-k { font: 500 10px/1.3 var(--font-mono); letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-3); }
.hsb-cmd {
  font: 500 12.5px/1.6 var(--font-mono); color: var(--ink); background: #090a10; border: 1px solid var(--line);
  border-radius: 10px; padding: 9px 12px; overflow-x: auto; white-space: pre; scrollbar-width: thin;
}
.hsb-cmd .d { color: var(--ink-3); }
.hsb-cmd .f { color: #ffc65c; }
.hsb-cmd .v { color: var(--ink); }
.hsb-sub { font: 500 11.5px/1.5 var(--font-mono); color: var(--ink-3); margin-top: 6px; }
.hsb-sub b { color: var(--ink-2); font-weight: 500; }
.hsb-ok { color: var(--core); } .hsb-bad { color: var(--danger); } .hsb-warn { color: var(--control); }
.hsb-ico { display: inline-flex; width: 18px; height: 18px; border-radius: 50%; align-items: center; justify-content: center; font: 700 11px/1 var(--font-mono); flex: none; }
.hsb-ico.ok { background: var(--core-a); color: var(--core); box-shadow: inset 0 0 0 1px rgba(69, 212, 155, 0.5); }
.hsb-ico.bad { background: var(--danger-a); color: var(--danger); box-shadow: inset 0 0 0 1px rgba(255, 91, 110, 0.5); }
.hsb-ico.warn { background: var(--control-a); color: var(--control); box-shadow: inset 0 0 0 1px rgba(255, 198, 92, 0.5); }
.hsb-tag { display: inline-block; font: 600 9.5px/1 var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 5px 2px; border-radius: 4px; border: 1px solid var(--line-2); color: var(--ink-3); vertical-align: 0.15em; white-space: nowrap; }
.hsb-tag.beyond { color: var(--host); border-color: rgba(184, 164, 255, 0.45); }

/* ── CUDA Graphs · launch timeline ── */
.hsb-cv canvas { display: block; }
.hsb-cv { touch-action: pan-y; }

/* ── CUDA Graphs · capture stepper ── */
.hsb-cap { display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; align-items: start; }
.hsb-cap.two { grid-template-columns: minmax(0, 1.08fr) minmax(0, 1fr); gap: 16px; }
.hsb-cap .code pre { font-size: 12.3px; }
.hsb-lanes { display: grid; gap: 8px; }
.hsb-lane { border: 1px solid var(--line); border-radius: 10px; background: rgba(8, 9, 14, 0.55); padding: 8px 10px 10px; transition: border-color 0.25s, background 0.25s; }
.hsb-lane.on { border-color: var(--ink-3); background: rgba(24, 26, 38, 0.9); }
.hsb-lane-h { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; margin-bottom: 7px; }
.hsb-lane-h b { font: 500 10px var(--font-mono); letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-3); }
.hsb-lane-h span { font: 500 11px var(--font-mono); color: var(--ink-3); text-align: right; }
.hsb-pipe { display: inline-flex; align-items: center; gap: 8px; padding: 4px 10px; border-radius: 999px; border: 1px solid rgba(184, 164, 255, 0.5); color: var(--host); background: var(--host-a); font: 500 12px var(--font-mono); }
.hsb-badge { font: 600 9.5px/1 var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; padding: 4px 6px 3px; border-radius: 5px; background: var(--danger-a); color: var(--danger); border: 1px solid rgba(255, 91, 110, 0.45); opacity: 0; transition: opacity 0.25s; }
.hsb-badge.on { opacity: 1; }
.hsb-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; min-height: 30px; }
.hsb-gnode { font: 500 11.5px/1.3 var(--font-mono); color: var(--ink); padding: 5px 8px; border-radius: 8px; border: 1px dashed var(--ink-3); background: var(--surface-2); opacity: 0.12; transition: opacity 0.3s, border-color 0.3s; }
.hsb-gnode small { display: block; color: var(--ink-3); font-size: 10px; }
.hsb-gnode.in { opacity: 1; }
.hsb-gnode.fresh { border-color: var(--accent); }
.hsb-arrow { font: 500 13px var(--font-mono); color: var(--ink-3); opacity: 0.12; transition: opacity 0.3s; }
.hsb-arrow.in { opacity: 1; }
.hsb-exec { font: 500 11.5px/1.3 var(--font-mono); color: var(--ink); padding: 5px 9px; border-radius: 8px; border: 1px solid var(--core); background: var(--core-a); opacity: 0.12; transition: opacity 0.3s; }
.hsb-exec.in { opacity: 1; }
.hsb-gpu { position: relative; height: 28px; border-radius: 6px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--line); overflow: hidden; flex: 1 1 160px; }
.hsb-gpu i { position: absolute; top: 4px; bottom: 4px; border-radius: 4px; background: var(--core); transform-origin: left center; transform: scaleX(0); font: 600 10px/20px var(--font-mono); color: #07140e; font-style: normal; padding-left: 5px; overflow: hidden; white-space: nowrap; }
.hsb-gpu.run i { animation: hsb-grow 0.55s ease-out forwards; }
.hsb-gpu.run i:nth-child(2) { animation-delay: 0.55s; }
@keyframes hsb-grow { to { transform: scaleX(1); } }
.hsb-count { font: 600 11px var(--font-mono); color: var(--ink-2); white-space: nowrap; }
.hsb-lanes.narrow .hsb-row.gr { flex-direction: column; align-items: flex-start; gap: 4px; }
.hsb-lanes.narrow .hsb-row.gr .hsb-arrow { padding-left: 18px; }
.hsb-active { margin-top: 8px; border: 1px solid var(--line); border-radius: 8px; background: rgba(8, 9, 14, 0.6); padding: 6px 9px; font: 500 11.5px/1.5 var(--font-mono); color: var(--ink-2); }
.hsb-active code { display: block; color: var(--ink); white-space: pre-wrap; overflow-wrap: anywhere; background: none; padding: 0; font-size: 12px; }
.hsb-active span { display: block; margin-top: 3px; color: var(--ink-3); }

/* ── CUDA Graphs · sample graph ── */
.hsb-sg { display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; align-items: start; }
.hsb-sg.two { grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr); gap: 18px; }
.hsb-node {
  display: block; width: 100%; text-align: left; cursor: pointer; border: 1px solid var(--line-2); background: var(--surface);
  border-radius: 12px; padding: 10px 12px 11px; color: var(--ink-2); font: 11.5px/1.5 var(--font-mono); transition: border-color 0.2s, box-shadow 0.2s;
}
.hsb-node:hover { border-color: var(--ink-3); }
.hsb-node[aria-pressed="true"] { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-a); }
.hsb-node-h { display: flex; justify-content: space-between; gap: 8px; color: var(--ink); font-weight: 600; letter-spacing: 0.08em; font-size: 11px; }
.hsb-node-h span:last-child { color: var(--ink-3); font-weight: 500; letter-spacing: 0; }
.hsb-node dl { display: grid; grid-template-columns: max-content minmax(0, 1fr); gap: 2px 10px; margin: 8px 0 0; }
.hsb-node dt { color: var(--ink-3); }
.hsb-node dd { margin: 0; color: var(--ink); overflow-wrap: anywhere; }
.hsb-node dd.cfg { color: var(--control); }
.hsb-edge { display: flex; flex-direction: column; align-items: center; color: var(--ink-3); font: 500 10.5px var(--font-mono); padding: 3px 0; }
.hsb-edge::before { content: ""; width: 1.5px; height: 16px; background: var(--ink-3); }
.hsb-edge::after { content: ""; width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 7px solid var(--ink-3); }
.hsb-edge span { padding: 2px 0; }
.hsb-panel { border: 1px solid var(--line); border-radius: 12px; background: rgba(8, 9, 14, 0.5); padding: 10px 12px 12px; }
.hsb-panel + .hsb-panel { margin-top: 10px; }
.hsb-panel-h { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; flex-wrap: wrap; margin-bottom: 6px; }
.hsb-panel-h b { font: 600 12px var(--font-mono); color: var(--ink); }
.hsb-panel-h span { font: 500 11px var(--font-mono); color: var(--ink-3); }
.hsb-panel svg { display: block; width: 100%; height: auto; }
.hsb-stats { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.hsb-toks { display: flex; flex-wrap: wrap; gap: 4px; }
.hsb-tok {
  font: 500 11.5px/1.2 var(--font-mono); padding: 4px 6px; border-radius: 6px; border: 1px solid var(--line-2);
  background: var(--surface-2); color: var(--ink); cursor: pointer; overflow-wrap: anywhere; text-align: left;
}
.hsb-tok:hover { border-color: var(--ink-3); }
.hsb-tok[aria-pressed="true"] { border-color: var(--accent); background: var(--accent-a); color: #fff; }
.hsb-dec { margin-top: 8px; font-size: 13.5px; line-height: 1.55; color: var(--ink-2); min-height: 3.2em; }
.hsb-dec b, .hsb-dec strong { color: var(--ink); font-weight: 600; }
.hsb-dec code { font-size: 0.88em; padding: 0.08em 0.35em; border-radius: 4px; background: var(--surface-3); color: var(--ink); }
.hsb-demangled { margin-top: 8px; font: 500 12px/1.5 var(--font-mono); color: var(--ink); overflow-wrap: anywhere; }
.hsb-demangled span { color: var(--ink-3); }

/* ── CUDA Graphs · portability ── */
.hsb-port { display: grid; gap: 12px; }
.hsb-pcard { border: 1px solid var(--line-2); border-radius: 12px; background: var(--surface); padding: 10px 12px; }
.hsb-plist { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 6px 16px; margin-top: 6px; }
.hsb-ptr { display: flex; gap: 8px; align-items: center; font: 500 11.5px/1.35 var(--font-mono); color: var(--ink-2); min-width: 0; }
.hsb-ptr b { color: var(--ink); font-weight: 600; }
.hsb-pv { color: var(--ink-2); overflow-wrap: anywhere; }
.hsb-dot { width: 9px; height: 9px; border-radius: 50%; flex: none; }
.hsb-map-l { display: flex; justify-content: space-between; gap: 8px; font: 500 10px var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-3); }
.hsb-map-l span:last-child { letter-spacing: 0; text-transform: none; }
.hsb-map {
  position: relative; height: 38px; margin: 26px 0 4px; border-radius: 8px; border: 1px solid var(--line);
  background: repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0 5px, transparent 5px 10px);
}
.hsb-reg {
  position: absolute; top: 4px; bottom: 4px; border-radius: 5px; font: 500 10px/28px var(--font-mono); padding: 0 3px;
  display: block; text-align: center; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
  transition: left 0.55s ease, width 0.55s ease; color: var(--ink-2); background: var(--surface-3); box-shadow: inset 0 0 0 1px var(--line-2);
}
.hsb-reg.host { background: rgba(184, 164, 255, 0.22); box-shadow: inset 0 0 0 1px rgba(184, 164, 255, 0.6); color: var(--ink); }
.hsb-reg.mem { background: rgba(111, 166, 255, 0.22); box-shadow: inset 0 0 0 1px rgba(111, 166, 255, 0.6); color: var(--ink); }
.hsb-reg.other { background: rgba(255, 255, 255, 0.06); box-shadow: inset 0 0 0 1px var(--line-2); color: var(--ink-3); }
.hsb-port.narrow .hsb-reg:not(.heap) { font-size: 9px; padding: 0 1px; text-overflow: clip; }
.hsb-reg.heap { top: 1px; bottom: 1px; background: rgba(255, 255, 255, 0.035); box-shadow: inset 0 0 0 1px var(--line-2); text-align: left; line-height: 1; padding: 3px 4px; color: var(--ink-3); font-size: 9px; }
.hsb-notch { position: absolute; top: -24px; bottom: -3px; width: 0; border-left: 1.5px dashed var(--ink-2); transform: translateX(-0.75px); z-index: 2; }
.hsb-notch b { position: absolute; top: -2px; left: 0; transform: translateX(-50%); font: 600 10px/1 var(--font-mono); padding: 2px 4px; border-radius: 4px; background: var(--bg); white-space: nowrap; }
.hsb-notch.ok { border-color: var(--core); } .hsb-notch.ok b { color: var(--core); }
.hsb-notch.bad { border-color: var(--danger); } .hsb-notch.bad b { color: var(--danger); }
.hsb-notch.wrong { border-left-style: dotted; border-left-width: 2px; border-color: var(--danger); } .hsb-notch.wrong b { color: var(--danger); text-decoration: line-through; }
.hsb-ico.wrong { background: transparent; color: var(--danger); box-shadow: inset 0 0 0 1.5px var(--danger); border-radius: 4px; }
`);

  /* ───────────── helpers ───────────── */
  const el = GG.el;
  const esc = GG.esc;
  const TERMS = {};
  (window.GG_TERMS || []).forEach((t) => { TERMS[t.id] = t; });
  /* Cross-link HTML, already decorated (so it also works in content shown after boot). */
  function T(id, text) {
    const t = TERMS[id];
    const color = t ? (GG.SECTIONS[t.section] || GG.SECTIONS.intro).color : 'var(--accent)';
    return `<a data-term="${id}" href="#${id}" class="term" style="--c:${color}">${text == null ? (t ? esc(t.name) : id) : text}</a>`;
  }
  const $$ = (root, sel) => Array.prototype.slice.call(root.querySelectorAll(sel));

  /* Decorate term/external links inside content created after boot. */
  function decorate(root) {
    $$(root, 'a[data-term]').forEach((a) => {
      const t = GG.byId && GG.byId[a.getAttribute('data-term')];
      if (!t) return;
      a.setAttribute('href', '#' + t.id);
      a.classList.add('term');
      a.style.setProperty('--c', (GG.SECTIONS[t.section] || GG.SECTIONS.intro).color);
    });
    $$(root, 'a[href^="http"]').forEach((a) => { a.target = '_blank'; a.rel = 'noopener noreferrer'; a.classList.add('ext'); });
  }

  /* cb(width) whenever el's content width changes (el should have no padding). */
  function onWidth(el, cb) {
    let last = -1;
    const run = (w) => { w = Math.floor(w); if (w > 0 && Math.abs(w - last) >= 1) { last = w; cb(w); } };
    GG.resize(el, (r) => run(r.width));
    requestAnimationFrame(() => run(el.getBoundingClientRect().width));
  }

  /* Run a figure builder; if it throws, keep the prose and show an error box. */
  function guard(parent, label, fn) {
    try { return fn(); } catch (e) {
      console.error('[hs-b] ' + label + ' failed', e);
      if (parent) parent.insertAdjacentHTML('beforeend', `<div class="entry-error">${esc(label)} could not be drawn: ${esc(e && e.message)}</div>`);
      return null;
    }
  }

  function fmtT(us) {
    if (!isFinite(us)) return '—';
    if (Math.abs(us) < 1e-9) return '0 µs';
    if (us < 10) return GG.fmt.fixed(us, us < 1 ? 2 : 1) + ' µs';
    if (us < 999.5) return GG.fmt.int(us) + ' µs';
    return GG.fmt.fixed(us / 1000, us < 9995 ? 2 : 1) + ' ms';
  }
  function niceStep(raw) {
    const p = Math.pow(10, Math.floor(Math.log10(raw)));
    const m = raw / p;
    return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
  }
  function tickLabel(us, step) {
    if (step >= 1000 || us >= 1000) return GG.fmt.sig(us / 1000, 4) + ' ms';
    return GG.fmt.sig(us, 4) + ' µs';
  }
  const S = (tag, attrs, parent) => GG.svg(tag, attrs, parent);
  function Tx(parent, x, y, text, attrs) {
    const a = Object.assign({ x, y }, attrs || {});
    // gg.css sets .fig svg text { fill }, which beats presentation attributes: pass colour as style
    if (a.fill) { a.style = 'fill:' + a.fill; delete a.fill; }
    const t = GG.svg('text', a, parent);
    t.textContent = text;
    return t;
  }
  function roundRect(g, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  /* ═════════════════════════════ CUDA Graphs ═════════════════════════════ */

  const CAPTURE_CODE = "// capture\ncudaStreamBeginCapture(stream);\nkernelGemm<<<{32, 20},64,19200,stream>>>(a, b, c);\nkernelEpilogue<<<{256,2},{8,32},0,stream>>>(c, c);\ncudaStreamEndCapture(stream, &graph);\n\n// launch\ncudaGraphInstantiate(&graphExec, graph, flags);\ncudaGraphLaunch(graphExec, stream);";
  const GRAPH_DUMP = "┌─────────────────────────────────────────────────────────────────────────┐\n│  ┌───────────────────────────────────────────────────────────────────┐  │\n│  │                          NODE 0: KERNEL                           │  │\n│  ├───────────────────────────────────────────────────────────────────┤  │\n│  │  ID:         0 (topoId: 1)                                        │  │\n│  │  Kernel:     cutlass3x_sm100_simt_sgemm_f32_f32_f32_f32_f32_      │  │\n│  │              64x32x16_1x1x1_3_tnn_align1_bias_f32_relu            │  │\n│  │              <<<{32,20},64,19200>>>                               │  │\n│  │  Node handle: 0x0000564604539520                                  │  │\n│  │  Func handle: 0x0000564603AFCC00                                  │  │\n│  └───────────────────────────────────────────────────────────────────┘  │\n│                              │                                          │\n│                              │                                          │\n│                              ▼                                          │\n│  ┌───────────────────────────────────────────────────────────────────┐  │\n│  │                          NODE 1: KERNEL                           │  │\n│  ├───────────────────────────────────────────────────────────────────┤  │\n│  │  ID:         1 (topoId: 0)                                        │  │\n│  │  Kernel:     _ZN8cublasLt8epilogue4impl12globalKernelILi8E...     │  │\n│  │              <<<{256,2},{8,32},0>>>                               │  │\n│  │  Node handle: 0x0000564604539C88                                  │  │\n│  │  Func handle: 0x00005646044770F0                                  │  │\n│  └───────────────────────────────────────────────────────────────────┘  │\n└─────────────────────────────────────────────────────────────────────────┘";

  const TORCH_CODE = `g = torch.cuda.CUDAGraph()
static_x = torch.randn(8, 4096, device="cuda")

# warm up on a side stream before capturing
s = torch.cuda.Stream()
s.wait_stream(torch.cuda.current_stream())
with torch.cuda.stream(s):
    for _ in range(3):
        static_y = model(static_x)
torch.cuda.current_stream().wait_stream(s)

# capture: the kernels are recorded, not run
with torch.cuda.graph(g):
    static_y = model(static_x)

# replay: copy new data into the captured input, then launch
static_x.copy_(new_x)
g.replay()  # static_y now holds model(new_x)`;

  /* Fig: launch timeline, individual launches vs one graph launch */
  function launchTimeline(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Launch overhead, with and without a graph',
      hint: 'drag the sliders · replay',
      wide: true,
      caption: 'A model, not a measurement. Each individual launch costs the host a fixed time, 10 µs by default, the order of magnitude the ' + T('overhead', 'Overhead') + ' entry gives for one CUDA API call; a kernel cannot start before its launch has been submitted. The graph costs the host one launch and then the GPU runs its nodes back to back. This is the launch model of that entry’s Fig. 1, which also splits each eager launch into framework time and the CUDA API call and charges a graph launch only the API call; with its framework time at zero, the two figures give the same totals. Idealized, as there: real graphs still leave small gaps between kernels.',
    });
    const wrap = el('div', { class: 'hsb-w hsb-cv' });
    f.stage.append(wrap);
    const cv = GG.canvas(wrap, { height: (w) => (w < 520 ? 212 : 204), label: 'Two timelines. Top: the host launches kernels one by one and the GPU runs each as it arrives. Bottom: the host makes one graph launch and the GPU runs all kernels back to back.' });
    const legend = el('div', { class: 'hsb-legend', html: '<span><i class="hsb-sw-control"></i>host launch call</span><span><i class="hsb-sw-core"></i>kernel running</span><span><i class="hsb-sw-idle"></i>GPU idle, waiting for work</span>' });
    wrap.append(legend);

    const st = { n: 200, d: 2, L: 10, zoom: 'all' };
    let sim = null;
    let playT = Infinity;

    function simulate() {
      const n = Math.max(1, Math.round(st.n)), d = Math.max(0.1, st.d), L = Math.max(0.1, st.L);
      const ind = { cpu: [], gpu: [] }, gr = { cpu: [[0, L]], gpu: [] };
      let g = 0;
      for (let k = 0; k < n; k++) {
        const c1 = (k + 1) * L;
        ind.cpu.push([k * L, c1]);
        const s0 = Math.max(c1, g);
        ind.gpu.push([s0, s0 + d]);
        g = s0 + d;
      }
      ind.total = g;
      g = 0;
      for (let k = 0; k < n; k++) {
        const s0 = k ? g : L;
        gr.gpu.push([s0, s0 + d]);
        g = s0 + d;
      }
      gr.total = g;
      const busy = n * d;
      ind.idle = Math.max(0, 1 - busy / ind.total);
      gr.idle = Math.max(0, 1 - busy / gr.total);
      ind.host = n * L;
      gr.host = L;
      return { n, d, L, ind, gr, busy };
    }

    function windowEnd() {
      if (st.zoom === 'first') {
        const k = Math.min(8, sim.n) - 1;
        return Math.max(sim.ind.gpu[k][1], sim.gr.gpu[k][1]) * 1.06;
      }
      return Math.max(sim.ind.total, sim.gr.total) * 1.02;
    }

    function draw() {
      if (!sim || !cv.w) return;
      const c = GG.colors();
      const g = cv.ctx, W = cv.w, H = cv.h;
      g.clearRect(0, 0, W, H);
      const narrow = W < 520;
      const lx = narrow ? 34 : 44;
      const x0 = lx + 6, x1 = W - 10, pw = x1 - x0;
      if (pw < 20) return; // container not laid out yet (or far too narrow): nothing sensible to draw
      const Tend = windowEnd();
      const X = (t) => x0 + (t / Tend) * pw;
      const p = Math.min(playT, Tend * 2);
      const rowH = 20;
      const rows = [
        { title: 'Individual launches', total: sim.ind.total, cpuY: 22, gpuY: 46, data: sim.ind, mode: 'ind' },
        { title: 'One CUDA Graph launch', total: sim.gr.total, cpuY: 100, gpuY: 124, data: sim.gr, mode: 'gr' },
      ];
      g.font = '500 11px "JetBrains Mono", ui-monospace, monospace';
      g.textBaseline = 'middle';
      for (const r of rows) {
        // section title
        g.fillStyle = c.ink;
        g.textAlign = 'left';
        g.font = '600 11px "JetBrains Mono", ui-monospace, monospace';
        const title = r.title.toUpperCase();
        g.fillText(title, x0, r.cpuY - 10);
        const tw = g.measureText(title).width;
        g.font = '500 11px "JetBrains Mono", ui-monospace, monospace';
        g.fillStyle = c.ink2;
        const done = p >= r.total;
        g.fillText((done ? 'total ' : 'running… ') + (done ? fmtT(r.total) : fmtT(Math.min(p, r.total))), x0 + tw + 10, r.cpuY - 10);
        // lane labels
        g.fillStyle = c.ink3;
        g.textAlign = 'right';
        g.fillText('CPU', lx, r.cpuY + rowH / 2);
        g.fillText('GPU', lx, r.gpuY + rowH / 2);
        // lane backgrounds
        g.fillStyle = 'rgba(255,255,255,0.03)';
        g.fillRect(x0, r.cpuY, pw, rowH);
        g.fillRect(x0, r.gpuY, pw, rowH);
        g.save();
        g.beginPath();
        g.rect(x0, r.cpuY - 1, pw, r.gpuY + rowH - r.cpuY + 2);
        g.clip();
        // GPU idle background, from 0 to the end of the run (or the playhead)
        const idleEnd = Math.min(p, r.total);
        g.fillStyle = GG.alpha(c.danger, 0.32);
        g.fillRect(X(0), r.gpuY + 2, Math.max(0, X(idleEnd) - X(0)), rowH - 4);
        // kernels: real rectangles when they are wide enough to see, otherwise
        // one column per pixel whose opacity is the fraction of that pixel's time spent busy
        g.fillStyle = c.core;
        if ((sim.d / Tend) * pw >= 2.5) {
          for (const [a, b] of r.data.gpu) {
            if (a > p || a > Tend) break;
            const xa = X(a), xb = X(Math.min(b, p));
            g.fillRect(xa, r.gpuY + 2, Math.max(0.6, xb - xa), rowH - 4);
          }
        } else {
          const nb = Math.max(1, Math.ceil(pw)), bins = new Float32Array(nb), per = Tend / pw;
          for (const [a, b0] of r.data.gpu) {
            if (a > p || a > Tend) break;
            const b = Math.min(b0, p, Tend);
            let i = Math.floor(a / per);
            while (i < nb && i * per < b) {
              const lo = Math.max(a, i * per), hi = Math.min(b, (i + 1) * per);
              if (hi > lo) bins[i] += (hi - lo) / per;
              i++;
            }
          }
          for (let i = 0; i < nb; i++) {
            if (bins[i] <= 0) continue;
            g.globalAlpha = Math.min(1, bins[i]);
            g.fillRect(x0 + i, r.gpuY + 2, 1, rowH - 4);
          }
          g.globalAlpha = 1;
        }
        // host launches
        g.fillStyle = c.control;
        for (const [a, b] of r.data.cpu) {
          if (a > p || a > Tend) break;
          const xa = X(a), xb = X(Math.min(b, p));
          const w = xb - xa;
          g.fillRect(xa, r.cpuY + 3, Math.max(0.6, w > 4 ? w - 1 : w), rowH - 6);
        }
        if (r.mode === 'gr') {
          const [a, b] = r.data.cpu[0];
          const w = X(Math.min(b, p)) - X(a);
          g.textAlign = 'left';
          const label = 'cudaGraphLaunch';
          if (w > g.measureText(label).width + 10) {
            g.fillStyle = '#1d1405';
            g.fillText(label, X(a) + 5, r.cpuY + rowH / 2);
          } else if (p >= b) {
            g.fillStyle = c.ink3;
            const t = narrow ? '← one call; host free after' : '← one call (cudaGraphLaunch), then the host is free for other work';
            g.fillText(t, X(b) + 6, r.cpuY + rowH / 2);
          }
        }
        g.restore();
      }
      // axis
      const ay = 156;
      g.strokeStyle = c.line2;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(x0, ay + 0.5);
      g.lineTo(x1, ay + 0.5);
      g.stroke();
      const step = niceStep(Tend / (narrow ? 3.2 : 6));
      g.fillStyle = c.ink3;
      g.textAlign = 'center';
      g.font = '500 10.5px "JetBrains Mono", ui-monospace, monospace';
      let lastRight = -Infinity;
      for (let t = 0; t <= Tend + 1e-9; t += step) {
        const x = X(t);
        g.fillRect(Math.round(x), ay, 1, 5);
        const lab = tickLabel(t, step);
        const w = g.measureText(lab).width;
        // keep every label inside the canvas: nudge the first right, the last left, skip any that would collide
        const cx = Math.min(Math.max(x, x0 + w / 2 - 6), W - 2 - w / 2);
        if (cx - w / 2 < lastRight + 8) continue;
        g.fillText(lab, cx, ay + 15);
        lastRight = cx + w / 2;
      }
      g.textAlign = 'right';
      g.fillText('time →', x1, ay + 32);
      // playhead
      if (p < Tend) {
        g.fillStyle = c.accent;
        g.fillRect(Math.round(X(p)), 14, 1.5, ay - 12);
      }
    }

    const stN = GG.ui.stat(f.readouts, { label: 'one by one', value: '' });
    const stG = GG.ui.stat(f.readouts, { label: 'as a graph', value: '', tone: 'core' });
    const stI = GG.ui.stat(f.readouts, { label: 'GPU idle · one by one', value: '', tone: 'danger' });
    const stJ = GG.ui.stat(f.readouts, { label: 'GPU idle · graph', value: '', tone: 'danger' });
    const stS = GG.ui.stat(f.readouts, { label: 'speed-up', value: '' });

    function update() {
      sim = simulate();
      stN.set(fmtT(sim.ind.total));
      stG.set(fmtT(sim.gr.total));
      stI.set(GG.fmt.pct(sim.ind.idle, sim.ind.idle < 0.1 ? 1 : 0));
      stJ.set(GG.fmt.pct(sim.gr.idle, sim.gr.idle < 0.1 ? 1 : 0));
      const sp = sim.ind.total / sim.gr.total;
      stS.set('×' + GG.fmt.fixed(sp, 2), sp > 1.2 ? 'core' : null);
      const { n, d, L } = sim;
      let why;
      if (n === 1) {
        why = `With a single kernel there is nothing to batch: both rows pay one launch (${fmtT(L)}) and then run the kernel.`;
      } else if (d < L) {
        why = `Each kernel runs for <b>${fmtT(d)}</b>, but the host needs <b>${fmtT(L)}</b> to launch the next one, so launched one by one the GPU is idle <b>${GG.fmt.pct(sim.ind.idle)}</b> of the time: the run is <b>launch-bound</b>. As a graph, all ${GG.fmt.int(n)} kernels are handed over in one call and run back to back: ${fmtT(sim.ind.total)} becomes ${fmtT(sim.gr.total)}.`;
      } else {
        why = `Each kernel (<b>${fmtT(d)}</b>) lasts at least as long as a launch (<b>${fmtT(L)}</b>), so the host keeps ahead of the GPU and the GPU never waits between kernels: its only idle time is the first launch (idle <b>${GG.fmt.pct(sim.ind.idle, sim.ind.idle < 0.1 ? 1 : 0)}</b>, the same in both rows). The graph still frees the host (1 call instead of ${GG.fmt.int(n)}, ${fmtT(L)} of host time instead of ${fmtT(sim.ind.host)}), but the total does not move: both rows take ${fmtT(sim.gr.total)}.`;
      }
      f.setWhy(why);
      draw();
    }

    const anim = GG.anim(cv.canvas, (t) => {
      const Tend = windowEnd();
      playT = (t / 2.6) * Tend;
      draw();
      if (playT >= Tend) { playT = Infinity; anim.stop(); draw(); }
    }, { autostart: false });
    function replay() { playT = 0; anim.reset(); anim.start(); }
    function halt() { anim.stop(); playT = Infinity; }

    GG.ui.slider(f.controls, { label: 'Kernels', min: 1, max: 500, step: 1, log: true, value: st.n, format: (v) => GG.fmt.int(v), onInput: (v) => { st.n = v; halt(); update(); } });
    GG.ui.slider(f.controls, { label: 'Kernel duration', min: 0.5, max: 200, step: 0.5, log: true, value: st.d, format: fmtT, onInput: (v) => { st.d = v; halt(); update(); } });
    GG.ui.slider(f.controls, { label: 'Host cost per launch', min: 1, max: 30, step: 0.5, value: st.L, format: fmtT, onInput: (v) => { st.L = v; halt(); update(); } });
    GG.ui.seg(f.controls, { label: 'Show', value: 'all', options: [{ value: 'all', label: 'whole run' }, { value: 'first', label: 'first 8 kernels' }], onChange: (v) => { st.zoom = v; halt(); draw(); } });
    GG.ui.button(f.controls, { label: 'Replay', icon: 'play', onClick: replay });

    cv.onResize(() => draw());
    update();
    if (!GG.reducedMotion) GG.onVisible(wrap, () => replay(), { once: true });
  }

  /* Fig: stream capture, step by step */
  function captureStepper(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Stream capture, step by step',
      hint: 'step with ◀ ▶ or press play',
      wide: true,
      caption: 'The glossary’s code, and what exists after each of its lines has run. Nothing reaches the GPU until the very last call. The graph object after capture is a description (NVIDIA calls it the graph template); the instantiated <code>graphExec</code> is what actually gets launched, as often as you like.',
    });
    const grid = el('div', { class: 'hsb-cap' });
    f.stage.append(grid);
    onWidth(grid, (w) => grid.classList.toggle('two', w >= 900));
    const codeHost = el('div', { class: 'hsb-w' });
    grid.append(codeHost);
    const code = GG.code(codeHost, { lang: 'cpp', code: CAPTURE_CODE, caption: 'stream capture, verbatim from the glossary' });
    // the active line, wrapped and decoded, so nothing important hides past a narrow code panel's right edge
    const active = el('div', { class: 'hsb-active', 'aria-live': 'polite' });
    codeHost.append(active);
    const CODE_LINES = CAPTURE_CODE.split('\n');
    const lanes = el('div', { class: 'hsb-lanes' });
    grid.append(lanes);
    lanes.innerHTML = `
      <div class="hsb-lane" data-l="host"><div class="hsb-lane-h"><b>Host · CUDA stream</b><span data-v="hostcalls"></span></div>
        <div class="hsb-row"><span class="hsb-pipe">stream</span><span class="hsb-badge" data-v="capbadge">capturing: recording, not running</span></div></div>
      <div class="hsb-lane" data-l="graph"><div class="hsb-lane-h"><b>Graph · cudaGraph_t</b><span data-v="gstate">empty</span></div>
        <div class="hsb-row gr"><span class="hsb-gnode" data-v="n0">node 0 · kernelGemm<small>&lt;&lt;&lt;{32,20}, 64, 19200&gt;&gt;&gt;</small></span><span class="hsb-arrow" data-v="edge">→</span><span class="hsb-gnode" data-v="n1">node 1 · kernelEpilogue<small>&lt;&lt;&lt;{256,2}, {8,32}, 0&gt;&gt;&gt;</small></span></div></div>
      <div class="hsb-lane" data-l="exec"><div class="hsb-lane-h"><b>Executable graph · cudaGraphExec_t</b><span data-v="estate">none yet</span></div>
        <div class="hsb-row"><span class="hsb-exec" data-v="exec">graphExec · validated, set up, ready to launch</span></div></div>
      <div class="hsb-lane" data-l="gpu"><div class="hsb-lane-h"><b>GPU</b><span data-v="gpustate">idle</span></div>
        <div class="hsb-row"><div class="hsb-gpu" data-v="gpubar"><i style="left:1%;width:56%">kernelGemm</i><i style="left:58%;width:40%">kernelEpilogue</i></div><span class="hsb-count" data-v="launches"></span></div></div>`;
    const v = {};
    $$(lanes, '[data-v]').forEach((n) => { v[n.getAttribute('data-v')] = n; });
    // on a narrow stage the two nodes stack, so the edge arrow must point down
    onWidth(lanes, (w) => { const nar = w < 460; lanes.classList.toggle('narrow', nar); v.edge.textContent = nar ? '↓' : '→'; });
    const laneEl = {};
    $$(lanes, '.hsb-lane').forEach((n) => { laneEl[n.getAttribute('data-l')] = n; });

    const steps = [
      { label: 'begin capture', line: 2, lane: 'host', dec: 'stream switches to capture mode', why: '<b>cudaStreamBeginCapture</b> puts <code>stream</code> into capture mode. From now on, work launched into this stream is not queued for the GPU; it is appended to a graph that is being built up.' },
      { label: 'capture kernelGemm', line: 3, lane: 'graph', dec: 'kernelGemm · grid {32,20} = 640 blocks · 64 threads per block · 19,200 B dynamic shared memory · stream · args a, b, c', why: 'The <b>kernelGemm</b> launch returns immediately, but no kernel runs. It becomes <b>node 0</b> of the graph, with its launch configuration (640 blocks of 64 threads, 19,200 bytes of dynamic shared memory) and its arguments <code>a, b, c</code> recorded as they are.' },
      { label: 'capture kernelEpilogue', line: 4, lane: 'graph', dec: 'kernelEpilogue · grid {256,2} = 512 blocks · block {8,32} = 256 threads · 0 B dynamic shared memory · stream · args c, c', why: '<b>kernelEpilogue</b> becomes <b>node 1</b>. Because it was issued into the same stream after node 0, capture adds an <b>edge</b> 0 → 1: the epilogue may start only after the GEMM has finished. It reads and writes <code>c</code>, the GEMM’s output.' },
      { label: 'end capture', line: 5, lane: 'graph', dec: 'capture ends; the recording comes back in graph', why: '<b>cudaStreamEndCapture</b> takes the stream out of capture mode and returns the recording in <code>graph</code>. The GPU has still done nothing: <code>graph</code> is a description of work.' },
      { label: 'instantiate', line: 8, lane: 'exec', dec: 'graph → graphExec, with instantiation flags', why: '<b>cudaGraphInstantiate</b> turns the description into an executable graph. Per NVIDIA’s guide it validates the graph and does “much of the setup and initialization of work with the aim of minimizing what needs to be done at launch”. <code>flags</code> tunes instantiation; 0 means the defaults. This cost is paid once.' },
      { label: 'launch', line: 9, lane: 'gpu', dec: 'one call submits the whole graph to stream', why: '<b>cudaGraphLaunch</b>: one host call submits the whole graph to <code>stream</code>. The GPU runs node 0, then node 1, respecting the edge.' },
      { label: 'launch again', line: 9, lane: 'gpu', dec: 'the same call again: no re-capture, no re-instantiation', why: 'The payoff: the same <code>graphExec</code> can be launched again and again, each time with one cheap call, with no re-capture and no re-instantiation. This is the “later replayed” part.' },
    ];
    function show(i) {
      code.clear();
      code.dim([1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => n !== steps[i].line));
      code.highlight(steps[i].line, 'control');
      Object.keys(laneEl).forEach((k) => laneEl[k].classList.toggle('on', k === steps[i].lane));
      v.capbadge.classList.toggle('on', i >= 0 && i <= 2);
      v.hostcalls.textContent = ['1 API call', '2 API calls', '3 API calls', '4 API calls', '5 API calls', '6 API calls', '7 API calls'][i];
      v.n0.classList.toggle('in', i >= 1);
      v.n1.classList.toggle('in', i >= 2);
      v.edge.classList.toggle('in', i >= 2);
      v.n0.classList.toggle('fresh', i === 1);
      v.n1.classList.toggle('fresh', i === 2);
      v.gstate.textContent = i === 0 ? 'being recorded (empty)' : i < 3 ? 'being recorded' : 'complete: 2 nodes, 1 edge';
      v.exec.classList.toggle('in', i >= 4);
      v.estate.textContent = i >= 4 ? 'instantiated once' : 'none yet';
      const nl = i === 5 ? 1 : i === 6 ? 2 : 0;
      v.gpustate.textContent = nl ? 'running the graph' : 'idle: nothing has run';
      v.launches.textContent = nl ? `launch #${nl}` : '';
      const bar = v.gpubar;
      bar.classList.remove('run');
      if (nl) { void bar.offsetWidth; bar.classList.add('run'); }
      active.innerHTML = `<code>${steps[i].line}  ${esc(CODE_LINES[steps[i].line - 1].trim())}</code><span>${esc(steps[i].dec)}</span>`;
      f.setWhy(steps[i].why);
    }
    GG.ui.stepper(f.controls, { label: 'Line', steps, autoplay: 2200, onStep: show });
  }

  /* The two nodes of the sample B200 graph */
  const SG_NODES = [
    {
      id: 0, topo: 1, short: 'CUTLASS SGEMM', cfg: '<<<{32,20},64,19200>>>', grid: [32, 20], block: [64, 1], smem: 19200,
      node: '0x0000564604539520', func: '0x0000564603AFCC00',
      nameLines: ['cutlass3x_sm100_simt_sgemm_f32_f32_f32_f32_f32_', '64x32x16_1x1x1_3_tnn_align1_bias_f32_relu'],
      toks: [
        ['cutlass3x', 'Made by ' + T('cutlass', 'CUTLASS') + ', NVIDIA’s open-source C++ template library for matrix multiplication, through its 3.x API. CUTLASS generates kernel names like this one from the template parameters.'],
        ['sm100', 'Compiled for ' + T('streaming-multiprocessor-architecture', 'SM architecture') + ' 10.0, i.e. ' + T('compute-capability', 'compute capability') + ' 10.0: the B200, the GPU this graph was captured on.'],
        ['simt', 'Built from ordinary SIMT instructions that run on the ' + T('cuda-core', 'CUDA Cores') + ', not on the ' + T('tensor-core', 'Tensor Cores') + ' (CUTLASS labels Tensor Core kernels <code>tensorop</code>).'],
        ['sgemm', 'Single-precision GEMM: a general matrix multiply in 32-bit floating point, the core of a linear layer.'],
        ['f32_f32_f32_f32_f32', 'The element types of the operands, the accumulator and the output: all 32-bit floats.'],
        ['64x32x16', 'The tile shape: each thread block computes a 64 × 32 tile of the output matrix, stepping through the shared K dimension 16 at a time.', 'tile'],
        ['1x1x1', 'The thread block cluster shape: every cluster is a single thread block.'],
        ['3', 'The number of pipeline stages: shared memory holds three A-and-B tile pairs in flight, so loads of the next tiles overlap the math on the current one. Three stages of a 64 × 16 A tile plus a 32 × 16 B tile, in 4-byte floats, is 3 × (1,024 + 512) × 4 B = <b>18,432 B</b>: most of the 19,200 B of dynamic shared memory this launch asks for (see the bar above). The name alone does not tell us what the other 768 B hold.', 'stages'],
        ['tnn', 'Memory layouts of A, B and C: <code>t</code> is transposed (row-major), <code>n</code> is non-transposed (column-major).'],
        ['align1', 'Operand alignment of 1 element: the kernel does not assume its matrices start on wider boundaries, so it cannot count on wide vectorized loads.'],
        ['bias_f32', 'A fused epilogue: before the result is written out, an FP32 bias vector is added, as a linear layer does.'],
        ['relu', 'The epilogue then applies ReLU, max(0, x). A plain <code>torch.nn.Linear</code> has no activation, and the glossary does not say how the layer was configured, so we leave this detail unexplained.'],
      ],
    },
    {
      id: 1, topo: 0, short: 'cuBLASLt epilogue', cfg: '<<<{256,2},{8,32},0>>>', grid: [256, 2], block: [8, 32], smem: 0,
      node: '0x0000564604539C88', func: '0x00005646044770F0',
      nameLines: ['_ZN8cublasLt8epilogue4impl12globalKernelILi8E...'],
      toks: [
        ['_Z', 'Marks a mangled C++ name. Compilers encode namespaces, template arguments and parameter types into one linker-safe symbol; this is the Itanium C++ ABI scheme that GCC, Clang and nvcc use on Linux.'],
        ['N', 'A nested, namespace-qualified name follows, closed by a matching <code>E</code> (cut off here).'],
        ['8cublasLt', 'A length-prefixed identifier: 8 characters, <code>cublasLt</code>. That is the namespace of cuBLASLt, the lightweight matrix-multiply interface of ' + T('cublas', 'cuBLAS') + '.'],
        ['8epilogue', 'Namespace <code>epilogue</code> (8 characters).'],
        ['4impl', 'Namespace <code>impl</code> (4 characters).'],
        ['12globalKernel', 'The function template <code>globalKernel</code> (12 characters): the ' + T('kernel', 'kernel') + ' itself.'],
        ['I', 'Its template argument list begins.'],
        ['Li8E', 'A literal (<code>L</code>) of type <code>int</code> (<code>i</code>) with value 8, closed by <code>E</code>: the first template argument is <code>8</code>.'],
        ['...', 'The dump truncates the rest of the name, so the remaining template arguments and the parameter list are unknown.'],
      ],
    },
  ];

  /* Fig: the sample graph redrawn */
  function sampleGraph(host, ctx) {
    const f = ctx.figure(host, {
      title: 'The B200 graph, redrawn',
      hint: 'pick a node · tap a name token',
      wide: true,
      caption: 'The two kernel nodes and their edge from the dump above. The launch configuration <code>&lt;&lt;&lt;grid, block, bytes&gt;&gt;&gt;</code> is decoded into a picture of the grid, one block (threads coloured by warp) and the block’s dynamic shared memory. The kernel-name readings are ours, not the glossary’s: they follow CUTLASS’s naming convention and the C++ name-mangling rules.',
    });
    const grid = el('div', { class: 'hsb-sg' });
    f.stage.append(grid);
    onWidth(grid, (w) => grid.classList.toggle('two', w >= 680));
    const left = el('div', { class: 'hsb-w' });
    const right = el('div', { class: 'hsb-w' });
    grid.append(left, right);
    const cards = SG_NODES.map((n, i) => {
      const b = el('button', { type: 'button', class: 'hsb-node', 'aria-pressed': 'false' });
      b.innerHTML = `<div class="hsb-node-h"><span>NODE ${n.id}: KERNEL</span><span>${esc(n.short)}</span></div>
        <dl><dt>ID</dt><dd>${n.id} (topoId: ${n.topo})</dd>
        <dt>Kernel</dt><dd>${n.nameLines.map((l) => (n.id === 0 ? esc(l).replace(/_/g, '_<wbr>') : esc(l))).join('<br>')}</dd>
        <dt>Config</dt><dd class="cfg">${esc(n.cfg)}</dd>
        <dt>Node</dt><dd>${n.node}</dd><dt>Func</dt><dd>${n.func}</dd></dl>`;
      b.addEventListener('click', () => select(i));
      left.append(b);
      if (i === 0) left.append(el('div', { class: 'hsb-edge', html: '<span>edge (the dump’s ▼): node 1 waits for node 0</span>' }));
      return b;
    });
    left.append(el('div', { class: 'hsb-sub', html: '<b>topoId</b> is a second numbering that the dump prints next to each ID. The glossary does not explain it, so we do not either; note that it is not the order drawn here, which follows the dump’s arrow from node 0 to node 1.' }));

    const pCfg = el('div', { class: 'hsb-panel' });
    const pName = el('div', { class: 'hsb-panel' });
    right.append(pCfg, pName);
    pCfg.innerHTML = '<div class="hsb-panel-h"><b data-v="cfgT"></b><span>launch configuration</span></div><div data-v="svgHost" class="hsb-w"></div>';
    pName.innerHTML = '<div class="hsb-panel-h"><b>The name, token by token</b><span class="hsb-tag beyond">our reading</span></div><div class="hsb-toks" data-v="toks"></div><div class="hsb-dec" data-v="dec" aria-live="polite"></div><div class="hsb-demangled" data-v="dem"></div>';
    const V = {};
    $$(right, '[data-v]').forEach((n) => { V[n.getAttribute('data-v')] = n; });

    const stB = GG.ui.stat(f.readouts, { label: 'blocks', value: '' });
    const stT = GG.ui.stat(f.readouts, { label: 'threads / block', value: '' });
    const stW = GG.ui.stat(f.readouts, { label: 'warps / block', value: '' });
    const stA = GG.ui.stat(f.readouts, { label: 'threads in all', value: '', tone: 'core' });
    const stM = GG.ui.stat(f.readouts, { label: 'dyn. shared mem / block', value: '', tone: 'memory' });

    let cur = 0, curTok = -1, width = 0;

    function drawCfg() {
      const n = SG_NODES[cur];
      const W = Math.max(200, width);
      const svg = S('svg', { viewBox: `0 0 ${W} 10`, role: 'img' });
      const [gx, gy] = n.grid, [bx, by] = n.block;
      const nb = gx * gy, nt = bx * by, nw = Math.ceil(nt / 32);
      svg.setAttribute('aria-label', `Grid of ${gx} by ${gy} = ${nb} blocks; one block of ${bx} by ${by} = ${nt} threads in ${nw} warps; ${n.smem} bytes of dynamic shared memory per block.`);
      let y = 12;
      const lab = (txt, yy, tone) => Tx(svg, 0, yy, txt, { 'font-size': 11, fill: tone || 'var(--ink-2)' });
      // grid
      lab(`GRID  {${gx},${gy}}  →  ${gx} × ${gy} = ${GG.fmt.int(nb)} thread blocks`, y, 'var(--ink)');
      y += 8;
      // a grid too wide to show every block at >= 5 px is wrapped into bands of columns
      const lx2 = 0;
      let bandCols = gx;
      while (bandCols > 8 && (W - (bandCols < gx ? 50 : 0)) / bandCols < 5) bandCols /= 2;
      const bands = Math.ceil(gx / bandCols);
      const wrapped = bands > 1;
      const bl = wrapped ? 50 : 0; // room for the band labels (column ranges)
      const cell = Math.min(10, (W - bl) / bandCols);
      const gap = 1.5;
      const bandGap = 7;
      const gg = S('g', {}, svg);
      for (let bnd = 0; bnd < bands; bnd++) {
        const by0 = y + bnd * (gy * cell + bandGap);
        if (wrapped) Tx(svg, 0, by0 + gy * cell / 2 + 3.5, `${bnd * bandCols}–${Math.min(gx, (bnd + 1) * bandCols) - 1}`, { 'font-size': 9.5, fill: 'var(--ink-3)' });
        for (let r = 0; r < gy; r++) {
          for (let q = 0; q < bandCols && bnd * bandCols + q < gx; q++) {
            const col = bnd * bandCols + q;
            S('rect', { x: bl + q * cell, y: by0 + r * cell, width: cell - gap, height: cell - gap, rx: 1.5, fill: (col + r) % 2 ? 'rgba(69,212,155,0.55)' : 'rgba(69,212,155,0.8)' }, gg);
          }
        }
      }
      const gridH = bands * gy * cell + (bands - 1) * bandGap;
      const note = wrapped
        ? [`${gx} columns × ${gy} rows, a long flat grid,`, `drawn wrapped in ${bands} bands of ${bandCols} columns`, 'each square is one thread block']
        : ['each square is one thread block'];
      note.forEach((t, k) => Tx(svg, lx2, y + gridH + 13 + k * 13, t, { 'font-size': 10.5, fill: 'var(--ink-3)' }));
      y += gridH + 13 * note.length + 20;
      // block
      lab(by > 1 ? `BLOCK  {${bx},${by}} = ${nt} threads = ${nw} warps` : `BLOCK  ${bx}  →  ${nt} threads = ${nw} warps of 32`, y, 'var(--ink)');
      y += 8;
      const tc = Math.min(12, W / bx, by > 1 ? 9 : 12);
      for (let r = 0; r < by; r++) {
        for (let q = 0; q < bx; q++) {
          const lin = q + r * bx;
          const w = Math.floor(lin / 32);
          S('circle', { cx: q * tc + tc / 2, cy: y + r * tc + tc / 2, r: Math.max(0.8, tc * 0.36), fill: w % 2 ? 'var(--memory)' : 'var(--core)' }, svg);
        }
      }
      // warp labels
      if (by > 1) {
        const rowsPerWarp = 32 / bx;
        for (let w = 0; w < nw; w++) {
          const yy = y + (w * rowsPerWarp + rowsPerWarp / 2) * tc + 3.5;
          Tx(svg, bx * tc + 8, yy, `warp ${w}`, { 'font-size': 10, fill: w % 2 ? 'var(--memory)' : 'var(--core)' });
        }
        Tx(svg, bx * tc + 62, y + 12, 'threads are numbered x first,', { 'font-size': 10, fill: 'var(--ink-3)' });
        Tx(svg, bx * tc + 62, y + 25, `so each warp is ${32 / bx} rows of ${bx}`, { 'font-size': 10, fill: 'var(--ink-3)' });
        y += by * tc + 20;
      } else {
        Tx(svg, 0, y + tc + 12, 'warp 0: threads 0–31', { 'font-size': 10, fill: 'var(--core)' });
        Tx(svg, Math.min(W - 130, 32 * tc), y + tc + 12, 'warp 1: threads 32–63', { 'font-size': 10, fill: 'var(--memory)' });
        y += tc + 34;
      }
      // shared memory bar
      lab(`DYN. SHARED MEMORY  ${GG.fmt.int(n.smem)} B${n.smem ? ` = ${GG.fmt.fixed(n.smem / 1024, 2)} KiB${W > 420 ? ' per block' : ''}` : ': none'}`, y, 'var(--ink)');
      y += 8;
      const scale = W / 24576;
      S('rect', { x: 0, y, width: W, height: 16, rx: 4, fill: 'rgba(255,255,255,0.04)', stroke: 'var(--line-2)' }, svg);
      const showStages = cur === 0 && SG_NODES[0].toks[curTok] && SG_NODES[0].toks[curTok][2] === 'stages';
      if (n.smem) {
        if (showStages) {
          for (let s2 = 0; s2 < 3; s2++) {
            S('rect', { x: s2 * 6144 * scale + 0.5, y: y + 1, width: 6144 * scale - 1.5, height: 14, rx: 3, fill: 'var(--memory)' }, svg);
            if (6144 * scale > 60) Tx(svg, s2 * 6144 * scale + 6, y + 11.5, `stage ${s2 + 1}`, { 'font-size': 9.5, fill: '#08111f' });
          }
          S('rect', { x: 18432 * scale + 0.5, y: y + 1, width: 768 * scale - 1, height: 14, rx: 2, fill: 'rgba(111,166,255,0.35)' }, svg);
        } else {
          S('rect', { x: 0.5, y: y + 1, width: n.smem * scale - 1, height: 14, rx: 3, fill: 'var(--memory)' }, svg);
        }
      }
      for (let k = 0; k <= 24; k += 8) {
        const x = Math.min(W - 1, k * 1024 * scale);
        S('rect', { x, y: y + 17, width: 1, height: 4, fill: 'var(--ink-3)' }, svg);
        Tx(svg, Math.max(0, Math.min(W - 40, x - 12)), y + 32, `${k} KiB`, { 'font-size': 10, fill: 'var(--ink-3)' });
      }
      y += 38;
      svg.setAttribute('viewBox', `0 0 ${W} ${y}`);
      V.svgHost.innerHTML = '';
      V.svgHost.append(svg);
    }

    function renderToks() {
      const n = SG_NODES[cur];
      V.toks.innerHTML = '';
      n.toks.forEach((t, k) => {
        const b = el('button', { type: 'button', class: 'hsb-tok', 'aria-pressed': String(k === curTok) }, t[0]);
        b.addEventListener('click', () => { curTok = k; renderToks(); drawCfg(); });
        b.addEventListener('mouseenter', () => { if (matchMedia('(hover: hover)').matches) { curTok = k; renderToks(); drawCfg(); const nb = V.toks.children[k]; if (nb) nb.focus({ preventScroll: true }); } });
        V.toks.append(b);
      });
      const t = n.toks[curTok];
      V.dec.innerHTML = t ? `<b>${esc(t[0])}</b>: ${t[1]}` : (cur === 0
        ? 'Tap a token to read it. The name spells out how the kernel was generated: library, target, instruction type, data types, tile, cluster, pipeline, layouts, alignment and epilogue.'
        : 'Tap a token to read it. This is a <em>mangled</em> C++ name; the ' + T('cuda-binary-utilities', 'CUDA Binary Utilities') + ' include <code>cu++filt</code> to turn such names back into C++.');
      decorate(V.dec);
      V.dem.innerHTML = cur === 1 ? '<span>demangled, as far as the dump shows: </span>cublasLt::epilogue::impl::globalKernel&lt;8, …&gt;' : '';
    }

    function select(i) {
      cur = i;
      curTok = -1;
      cards.forEach((c2, k) => c2.setAttribute('aria-pressed', String(k === i)));
      const n = SG_NODES[i];
      const nb = n.grid[0] * n.grid[1], nt = n.block[0] * n.block[1];
      V.cfgT.textContent = `Node ${i}: ${n.cfg}`;
      stB.set(GG.fmt.int(nb));
      stT.set(GG.fmt.int(nt));
      stW.set(GG.fmt.int(nt / 32));
      stA.set(GG.fmt.int(nb * nt));
      stM.set(n.smem ? GG.fmt.int(n.smem) + ' B' : '0 B');
      f.setWhy(i === 0
        ? '<b>Node 0</b> launches a 32 × 20 grid: <b>640 thread blocks</b> of <b>64 threads</b> (2 warps) each, 40,960 threads in all, and every block gets <b>19,200 bytes</b> of dynamic shared memory. The edge means node 1 cannot start until all 640 blocks have finished.'
        : '<b>Node 1</b> launches a 256 × 2 grid: <b>512 thread blocks</b> of 8 × 32 = <b>256 threads</b> (8 warps) each, 131,072 threads in all, with <b>no</b> dynamic shared memory. It is a separate pass over the GEMM’s output.');
      renderToks();
      drawCfg();
    }

    onWidth(V.svgHost, (w) => { width = w; drawCfg(); });
    select(0);
  }

  /* Fig: why a graph can't be saved and loaded elsewhere */
  function portability(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Why a captured graph does not travel',
      hint: 'switch scenarios',
      wide: true,
      caption: 'A schematic of the two address spaces a graph points into (not to scale). Notches mark the addresses stored in the graph; they are the same numbers in every scenario. A ✗ and a solid red notch mean the address is unmapped; a ≠ and a dotted red notch mean it is mapped, but to the wrong bytes. The two func handles are the real values from the B200 dump; the positions of <code>a</code>, <code>b</code> and <code>c</code> are illustrative. The snapshot scenario corresponds to <a href="https://modal.com/docs/guide/memory-snapshots">fully checkpointing and then restoring the host and device memory</a>.',
    });
    const wrap = el('div', { class: 'hsb-port' });
    f.stage.append(wrap);
    onWidth(wrap, (w) => wrap.classList.toggle('narrow', w < 480));
    const PTRS = [
      { k: 'f0', label: 'node 0 func handle', val: '0x0000564603AFCC00', map: 'host', at: 47.7, color: 'var(--host)' },
      { k: 'f1', label: 'node 1 func handle', val: '0x00005646044770F0', map: 'host', at: 57.7, color: 'var(--host)' },
      { k: 'a', label: 'argument a', val: 'a device pointer', map: 'dev', at: 8.7, color: 'var(--memory)' },
      { k: 'b', label: 'argument b', val: 'a device pointer', map: 'dev', at: 26.7, color: 'var(--memory)' },
      { k: 'c', label: 'argument c', val: 'a device pointer', map: 'dev', at: 48.7, color: 'var(--memory)' },
    ];
    const LAYOUT = {
      orig: {
        host: [['code', 2, 9, 'other'], ['libcuda', 15, 15, 'other'], ['heap', 36, 32, 'heap'], ['k0', 47, 6, 'host'], ['k1', 57, 6, 'host'], ['stack', 88, 10, 'other']],
        dev: [['a', 8, 14, 'mem'], ['b', 26, 14, 'mem'], ['c', 48, 14, 'mem'], ['workspace', 68, 18, 'other']],
      },
      moved: {
        host: [['code', 2, 9, 'other'], ['heap', 18, 32, 'heap'], ['k0', 28, 6, 'host'], ['k1', 38, 6, 'host'], ['libcuda', 66, 15, 'other'], ['stack', 88, 10, 'other']],
        dev: [['other', 20, 14, 'other'], ['a', 58, 11, 'mem'], ['b', 71, 11, 'mem'], ['c', 84, 11, 'mem']],
      },
    };
    const STATUS = {
      same: { f0: 'ok', f1: 'ok', a: 'ok', b: 'ok', c: 'ok' },
      moved: { f0: 'wrong', f1: 'bad', a: 'bad', b: 'wrong', c: 'bad' },
      snap: { f0: 'ok', f1: 'ok', a: 'ok', b: 'ok', c: 'ok' },
    };
    const NOTE = { ok: 'points at what it was recorded for', wrong: 'points at the wrong bytes', bad: 'points at nothing (unmapped)' };
    wrap.innerHTML = `
      <div class="hsb-pcard"><div class="hsb-map-l"><span>Pointers inside the captured graph</span><span data-v="where"></span></div><div class="hsb-plist" data-v="plist"></div></div>
      <div><div class="hsb-map-l"><span>Host memory · the process’s virtual address space</span><span>low → high addresses</span></div><div class="hsb-map" data-v="hmap"></div></div>
      <div><div class="hsb-map-l"><span>Device memory · GPU RAM</span><span>low → high addresses</span></div><div class="hsb-map" data-v="dmap"></div></div>`;
    const V = {};
    $$(wrap, '[data-v]').forEach((n) => { V[n.getAttribute('data-v')] = n; });
    const regEls = { host: {}, dev: {} };
    function buildMaps() {
      for (const m of ['host', 'dev']) {
        const box = m === 'host' ? V.hmap : V.dmap;
        LAYOUT.orig[m].forEach(([name, l, w, kind]) => {
          const r = el('div', { class: 'hsb-reg ' + kind, text: name, title: name });
          r.style.left = l + '%';
          r.style.width = w + '%';
          box.append(r);
          regEls[m][name] = r;
        });
      }
      // regions that only exist in the moved layout
      LAYOUT.moved.dev.forEach(([name, l, w, kind]) => {
        if (regEls.dev[name]) return;
        const r = el('div', { class: 'hsb-reg ' + kind, text: name, title: name });
        r.style.left = l + '%';
        r.style.width = '0%';
        r.style.opacity = '0';
        V.dmap.append(r);
        regEls.dev[name] = r;
      });
      PTRS.forEach((p) => {
        const n = el('div', { class: 'hsb-notch' });
        n.style.left = p.at + '%';
        n.innerHTML = `<b>${p.k === 'f0' ? 'k0' : p.k === 'f1' ? 'k1' : p.k}</b>`;
        (p.map === 'host' ? V.hmap : V.dmap).append(n);
        p.notch = n;
      });
    }
    function setMode(mode) {
      const lay = mode === 'moved' ? LAYOUT.moved : LAYOUT.orig;
      for (const m of ['host', 'dev']) {
        const seen = new Set();
        lay[m].forEach(([name, l, w]) => {
          const r = regEls[m][name];
          if (!r) return;
          seen.add(name);
          r.style.left = l + '%';
          r.style.width = w + '%';
          r.style.opacity = '1';
        });
        Object.keys(regEls[m]).forEach((name) => { if (!seen.has(name)) { regEls[m][name].style.width = '0%'; regEls[m][name].style.opacity = '0'; } });
      }
      const st = STATUS[mode];
      V.plist.innerHTML = PTRS.map((p) => {
        const s = st[p.k];
        const icon = s === 'ok' ? '✓' : s === 'bad' ? '✗' : '≠';
        return `<div class="hsb-ptr"><span class="hsb-ico ${s}">${icon}</span><span class="hsb-dot" style="background:${p.color}"></span><span><b>${esc(p.label)}</b><br><span class="hsb-pv">${esc(p.val)}</span><br><span class="hsb-${s === 'ok' ? 'ok' : 'bad'}">${NOTE[s]}</span></span></div>`;
      }).join('');
      PTRS.forEach((p) => { p.notch.className = 'hsb-notch ' + st[p.k]; });
      V.where.textContent = mode === 'same' ? 'in the process that captured it' : mode === 'moved' ? 'loaded into a new process' : 'after restoring a full snapshot';
      f.setWhy(mode === 'same'
        ? 'In the process that captured it, every pointer in the graph lands on what it was recorded for: the two function handles, which point at objects in host memory that identify the kernels, and the three tensors in GPU RAM.'
        : mode === 'moved'
          ? 'Copy the graph’s bytes into a <b>new process</b> and the numbers are unchanged, but memory there is laid out differently. Some pointers hit nothing at all; others hit the wrong bytes, which is worse. This is why CUDA Graphs cannot be serialized and are non-portable.'
          : 'A <b>full checkpoint</b> of host and device memory, restored exactly, puts everything back at the same addresses, so the same pointers are valid again. This is the one way out the glossary names.');
    }
    buildMaps();
    GG.ui.seg(f.controls, {
      label: 'Scenario', value: 'same',
      options: [{ value: 'same', label: 'same process' }, { value: 'moved', label: 'saved, loaded elsewhere' }, { value: 'snap', label: 'restored from a snapshot' }],
      onChange: setMode,
    });
    setMode('same');
  }

  GG.entry('cuda-graph', {
    render(body, ctx) {
      body.classList.add('hsb-body');
      const s = ctx.html(body, `
<p>In the definition above, the host is the CPU and the device is the GPU. Each <em>node</em> of a graph is one piece of work, such as a ${T('kernel', 'kernel')} launch. Each <em>edge</em> is a dependency: this node may start only after that one has finished. The graph describes a whole batch of GPU work up front, so it can be handed over in one piece.</p>
<p>Picture a cook and a recipe. You can read the recipe aloud one line at a time, waiting after each line until the cook is ready for the next, or you can hand over the whole card. The cooking is the same either way. The card removes the back-and-forth, and on a GPU the back-and-forth has a price.</p>
<h3>The problem: every launch costs the host time</h3>
<p>The primary use case for CUDA Graphs is reducing ${T('overhead', 'overhead')}, time in which no useful work gets done. Before a ${T('kernel', 'kernel')} can run, the host must <em>identify</em> it (which function, in which loaded module), <em>configure</em> it (the shape of its ${T('thread-block-grid', 'grid')} and ${T('thread-block', 'thread blocks')}, its ${T('shared-memory', 'shared memory')}, its arguments) and <em>submit</em> it to the GPU through the driver. Each launch takes on the order of microseconds.</p>
<p>A few microseconds is nothing next to a kernel that runs for milliseconds. It adds up when hundreds of kernels need to be launched within a few milliseconds, and it hurts most when kernels finish faster than the host can launch the next one: the GPU then sits idle between kernels, waiting for work. This is commonly the case for <a href="https://modal.com/docs/guide/high-performance-llm-inference">low-latency LLM inference</a>, where generating each token runs every layer of the model, one short kernel after another. In Fig. 1, find the point where launches, not kernels, set the pace.</p>
<div data-slot="tl" class="wide"></div>
${GG.noteHTML('intuition', '<p>Hundreds of launches in milliseconds, in numbers. Say one step of a model needs 400 kernel launches, and each costs the host 10 µs, the order of magnitude the ' + T('overhead', 'Overhead') + ' entry gives for one CUDA API call. The launches alone take 400 × 10 µs = 4,000 µs = 4 ms. If the kernels themselves only add up to 2 ms of GPU work, the step still takes at least 4 ms, and the GPU is idle at least half of it. Captured as one graph, those 400 launches become one.</p>', 'Intuition: the arithmetic')}
<h3>Capturing a graph from a stream</h3>
<p>You rarely build a graph node by node. CUDA Graphs are most commonly created with the <strong>stream capture</strong> API in the ${T('cuda-runtime-api', 'CUDA Runtime')}. A <em>CUDA stream</em> is an ordered queue of GPU work: operations placed in the same stream run one after another, in the order they were issued. Stream capture records all of the operations that occur on a single stream, so that they can be replayed later, like this (Fig. 2 steps through it):</p>
<div data-slot="cap" class="wide"></div>
<p>Read each launch with its four launch parameters in mind: <code class="hsb-wc">&lt;&lt;&lt;grid, block, dynamic shared memory in bytes, stream&gt;&gt;&gt;</code>. <code>{32, 20}</code> is a two-dimensional grid of 32 × 20 = 640 blocks; <code>64</code> means 64 ${T('thread', 'threads')} per block; <code>19200</code> asks for 19,200 bytes of dynamic ${T('shared-memory', 'shared memory')} per block. <code>kernelEpilogue</code> uses a 256 × 2 grid (512 blocks) of 8 × 32 = 256-thread blocks and no dynamic shared memory. These are exactly the launch configurations recorded in the real graph further down.</p>
${GG.noteHTML('beyond', '<p><b>One argument short.</b> In NVIDIA’s <a href="https://docs.nvidia.com/cuda/cuda-runtime-api/cuda_runtime_api/group__CUDART__STREAM.html">Runtime API reference</a>, <code>cudaStreamBeginCapture</code> takes a second argument, a <em>capture mode</em>: <code>cudaStreamCaptureModeGlobal</code>, <code>cudaStreamCaptureModeThreadLocal</code> or <code>cudaStreamCaptureModeRelaxed</code>. It controls whether the program may make API calls that NVIDIA classes as “potentially unsafe” while a capture is under way. The glossary’s snippet, like several examples in NVIDIA’s own programming guide, leaves it out for brevity; code that compiles passes it, as in <code>cudaStreamBeginCapture(stream, cudaStreamCaptureModeGlobal)</code>.</p>')}
<p>The ${T('cuda-runtime-api', 'CUDA Runtime')} interface to CUDA Graphs is documented by NVIDIA <a href="https://docs.nvidia.com/cuda/cuda-programming-guide/04-special-topics/cuda-graphs.html">in the CUDA Programming Guide</a>.</p>
${GG.noteHTML('beyond', '<p><b>Definition, instantiation, execution.</b> NVIDIA’s guide splits graph work into these three stages. A graph is defined once, instantiated once, and can then be launched any number of times without repeating the instantiation. The guide names two payoffs of separating definition from execution: CPU launch costs drop because much of the setup is done in advance, and seeing the whole workflow at once lets CUDA apply optimizations that piecewise submission to a stream cannot. Stream capture is one way to define a graph; the explicit graph API (<code>cudaGraphCreate</code>, <code>cudaGraphAddNode</code> …) is the other. Besides kernels, a node can be a memory copy, a memset, a CPU function call, an empty node, a CUDA event record or wait, an external semaphore signal or wait, a conditional node, a memory allocation or free, or a whole child graph.</p>')}
<h3>CUDA Graphs from PyTorch</h3>
<p>PyTorch wraps this API, for example through the <code>torch.cuda.graph</code> context manager, and that is how CUDA Graphs are generally captured for neural network training and inference. Whatever the model launches inside the <code>with</code> block is recorded rather than run, and the recording can then be replayed with one call.</p>
<div data-slot="torch"></div>
${GG.noteHTML('beyond', '<p>Two details in that sketch follow from how graphs work. The warm-up runs happen before capture, as PyTorch’s documentation recommends, so one-time setup work is not recorded into the graph. And new inputs are <em>copied into</em> <code>static_x</code> instead of passing a fresh tensor: the graph recorded <code>static_x</code>’s memory address, so that is where it will read from on every replay. The next sections show why those addresses matter so much.</p>')}
<h3>A real graph: one linear layer on a B200</h3>
<p>Below is a sample CUDA Graph, captured from a B200 GPU executing a <code>torch.Linear</code> layer. It has two kernel nodes and one edge between them:</p>
<div data-slot="dump" class="wide"></div>
${GG.noteHTML('check', '<p>The glossary writes <code>torch.Linear</code>; in PyTorch the linear layer is <code>torch.nn.Linear</code>.</p>')}
<p>Each box lists the node’s ID (plus a <code>topoId</code>, which the glossary does not explain), the kernel’s name, its launch configuration in triple chevrons, a <em>node handle</em> (the address of the node object) and a <em>func handle</em> (the address that identifies the kernel function). Judging by their names (see the note below), node 0 is the matrix multiply at the heart of the layer and node 1 is an epilogue kernel, a second pass over its output, from ${T('cublas', 'cuBLAS')}’s cuBLASLt library. The launch configurations are the same as in the capture code above. Fig. 3 unpacks them.</p>
<div data-slot="sg" class="wide"></div>
${GG.noteHTML('beyond', '<p><b>Reading the kernel names</b>, in brief (Fig. 3 goes token by token). Node 0\u2019s name says it was generated by ' + T('cutlass', 'CUTLASS') + ' for ' + T('streaming-multiprocessor-architecture', 'SM architecture') + ' 10.0 (' + T('compute-capability', 'compute capability') + ' 10.0, the B200), as a single-precision GEMM built from SIMT instructions for the ' + T('cuda-core', 'CUDA Cores') + ' rather than the ' + T('tensor-core', 'Tensor Cores') + ', with 64 × 32 × 16 tiles, 3 pipeline stages and a fused bias-and-ReLU epilogue. Node 1\u2019s name is a mangled C++ symbol, <code>cublasLt::epilogue::impl::globalKernel&lt;8, …&gt;</code>; <code>cu++filt</code>, one of the ' + T('cuda-binary-utilities', 'CUDA Binary Utilities') + ', demangles such names.</p>')}
${GG.noteHTML('beyond', '<p><b>Dumping a graph yourself.</b> The CUDA Runtime can write any graph out for inspection with <code>cudaGraphDebugDotPrint</code>, which produces a Graphviz DOT file; flags control how much detail it includes, such as kernel parameters and node and function handles. NVIDIA’s programming guide made one of its own graph figures this way, rendering the DOT file with Graphviz.</p>')}
<h3>Pointers everywhere: why graphs do not travel</h3>
<p>Notice that ${T('kernel', 'kernels')} are identified by pointers. Node 0’s func handle, <code>0x0000564603AFCC00</code>, is the number the glossary writes as <code>0x564603AFCC00</code> (the same value without its leading zeros). Inputs and outputs are also defined by pointers: the <code>a</code>, <code>b</code> and <code>c</code> of the capture code are addresses in the GPU’s ${T('global-memory', 'global memory')}. A pointer only means something inside the process, and on the GPU, where it was created.</p>
<p>These pointers, and other references to device resources, prevent serialization of CUDA Graphs (writing one to a file and reading it back later) and make them non-portable, outside of fully <a href="https://modal.com/docs/guide/memory-snapshots">checkpointing and then restoring the host and device memory</a>, which puts every address back where it was.</p>
<div data-slot="port" class="wide"></div>
${GG.noteHTML('beyond', '<p><b>Changing a graph’s pointers.</b> Inside one process, CUDA offers a lighter fix than re-capturing. NVIDIA’s “graph update” mechanism changes node parameters, such as kernel arguments and memory addresses, in place, as long as the graph’s shape stays the same: <code>cudaGraphExecKernelNodeSetParams</code> for one node, or <code>cudaGraphExecUpdate</code> to take all parameters from a freshly captured, topologically identical graph. PyTorch sidesteps the question by keeping inputs and outputs in fixed, "static" tensors.</p>')}
<div data-slot="read"></div>`);

      guard(s.tl, 'Launch timeline', () => launchTimeline(s.tl, ctx));
      guard(s.cap, 'Capture stepper', () => captureStepper(s.cap, ctx));
      guard(s.torch, 'PyTorch code', () => ctx.code(s.torch, {
        lang: 'python', code: TORCH_CODE, caption: 'beyond the glossary: a typical <code>torch.cuda.graph</code> capture',
        notes: {
          1: '<code>torch.cuda.CUDAGraph()</code> is PyTorch’s handle for one captured graph.',
          2: 'A fixed input tensor. Its GPU address will be baked into the graph.',
          5: 'Warm-up runs on a side stream, so one-time setup (library initialization, memory allocation) happens before capture and is not recorded.',
          13: '<code>torch.cuda.graph(g)</code> begins stream capture on entry and ends it on exit, like the <code>cudaStreamBeginCapture</code> / <code>cudaStreamEndCapture</code> pair above.',
          14: 'Every kernel the model launches here is recorded into <code>g</code>, not run.',
          17: 'New data goes <em>into</em> the captured tensor, because the graph will read from that same address.',
          18: '<code>replay()</code> launches the whole recorded graph with one call.',
        },
      }));
      guard(s.dump, 'Graph dump', () => ctx.code(s.dump, { lang: 'text', code: GRAPH_DUMP, caption: 'a CUDA Graph captured on a B200 running a linear layer (verbatim)', lineNumbers: false, wide: true }));
      guard(s.sg, 'Sample graph', () => sampleGraph(s.sg, ctx));
      guard(s.port, 'Portability', () => portability(s.port, ctx));
      ctx.reading(s.read, [
        { href: 'https://docs.nvidia.com/cuda/cuda-programming-guide/04-special-topics/cuda-graphs.html', label: 'CUDA Programming Guide: CUDA Graphs', note: 'NVIDIA’s documentation of the Runtime interface, stream capture, instantiation and graph update' },
        { href: 'https://modal.com/docs/guide/high-performance-llm-inference', label: 'Modal: high-performance LLM inference', note: 'where launch overhead and CUDA Graphs matter in practice' },
        { href: 'https://modal.com/docs/guide/memory-snapshots', label: 'Modal: memory snapshots', note: 'checkpointing and restoring host and device memory' },
        { href: 'https://pytorch.org/docs/stable/notes/cuda.html#cuda-graphs', label: 'PyTorch: CUDA Graphs', note: 'beyond the glossary: <code>torch.cuda.graph</code> usage, warm-up and static tensors' },
      ]);
    },
  });

  /* ═════════════════════════════ nvcc ═════════════════════════════ */

  GG.css(`
/* ── nvcc · trajectory ── */
.hsb-traj { display: grid; gap: 10px; }
.hsb-tj-cols { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 10px; }
.hsb-tj-col { display: grid; gap: 8px; align-content: start; border: 1px dashed var(--line-2); border-radius: 12px; padding: 8px; }
.hsb-tj-col > .hsb-k { padding: 0 2px; }
.hsb-st {
  position: relative; border: 1px solid var(--line); border-radius: 10px; background: var(--surface); padding: 8px 10px 9px;
  opacity: 0.55; transition: opacity 0.25s, border-color 0.25s, box-shadow 0.25s;
}
.hsb-st.done { opacity: 0.9; }
.hsb-st.on { opacity: 1; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-a); }
.hsb-st-h { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; flex-wrap: wrap; }
.hsb-st-h b { font: 600 12.5px/1.3 var(--font-mono); color: var(--ink); }
.hsb-st p { margin-top: 4px; font-size: 13px; line-height: 1.45; color: var(--ink-2); }
.hsb-st .hsb-out { display: inline-block; margin-top: 6px; font: 500 11px var(--font-mono); padding: 2px 7px; border-radius: 5px; }
.hsb-out.ptx { color: var(--ink); box-shadow: inset 0 0 0 1.2px var(--ink-2); border-radius: 5px; }
.hsb-out.sass { color: #07140e; background: var(--core); }
.hsb-out.host { color: #120d24; background: var(--host); }
.hsb-out.fat { color: var(--ink); background: var(--surface-3); box-shadow: inset 0 0 0 1px var(--line-2); }
.hsb-who { display: block; margin-top: 6px; font: 500 10px var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-3); }
.hsb-who.cd { color: var(--ink-2); }
.hsb-who.hd { color: var(--control); }
.hsb-tj-sep { display: flex; align-items: center; gap: 10px; font: 500 10.5px var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-3); }
.hsb-tj-sep::before, .hsb-tj-sep::after { content: ""; flex: 1; border-top: 1px dashed var(--line-2); }
.hsb-tj-run { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: 10px; }
.hsb-down { text-align: center; color: var(--ink-3); font: 500 12px/1 var(--font-mono); }
.hsb-join { display: flex; align-items: center; justify-content: center; gap: 6px; flex-wrap: wrap; font: 500 10.5px/1.3 var(--font-mono); color: var(--ink-3); opacity: 0.35; transition: opacity 0.25s; text-align: center; }
.hsb-join.on { opacity: 1; color: var(--ink-2); }
.hsb-join .hsb-out { margin: 0; }
.hsb-par { display: none; font: 500 10px var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-3); }
@media (max-width: 560px) { .hsb-par { display: block; } }
@media (max-width: 560px) { .hsb-tj-cols, .hsb-tj-run { grid-template-columns: minmax(0, 1fr); } }

/* ── nvcc · fat binary builder ── */
.hsb-fb { display: grid; gap: 14px; grid-template-columns: minmax(0, 1fr); }
.hsb-fb.two { grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); }
.hsb-multi button:disabled { opacity: 0.3; cursor: not-allowed; text-decoration: line-through; }
.hsb-multi button:disabled:hover { background: transparent; color: var(--ink-2); }
.hsb-fat { border: 1px solid var(--line-2); border-radius: 12px; background: var(--surface); padding: 10px 12px 12px; margin-top: 12px; }
.hsb-fat-h { display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; font: 600 12px var(--font-mono); color: var(--ink); }
.hsb-fat-h span { color: var(--ink-3); font-weight: 500; }
.hsb-fat-host { margin-top: 8px; padding: 7px 9px; border-radius: 8px; background: var(--host-a); box-shadow: inset 0 0 0 1px rgba(184, 164, 255, 0.45); font: 500 11.5px var(--font-mono); color: var(--ink); }
.hsb-fat-bin { margin-top: 8px; padding: 8px 9px 9px; border-radius: 8px; background: rgba(8, 9, 14, 0.6); box-shadow: inset 0 0 0 1px var(--line-2); }
.hsb-imgs { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; min-height: 28px; }
.hsb-img { font: 600 11.5px/1 var(--font-mono); padding: 7px 9px; border-radius: 7px; white-space: nowrap; }
.hsb-img.sass { background: var(--core); color: #07140e; }
.hsb-img.ptx { color: var(--ink); box-shadow: inset 0 0 0 1.5px var(--ink-2); background: transparent; border-radius: 7px; }
.hsb-img small { font-weight: 500; margin-left: 5px; font-size: 10.5px; }
.hsb-img.sass small { color: rgba(7, 20, 14, 0.72); }
.hsb-img.ptx small { color: var(--ink-3); }
.hsb-gpus { display: grid; gap: 5px; }
.hsb-gpu-r { display: grid; grid-template-columns: minmax(66px, 0.7fr) 34px minmax(0, 2.3fr); gap: 8px; align-items: center; padding: 6px 8px; border-radius: 9px; border: 1px solid var(--line); background: rgba(8, 9, 14, 0.5); font: 500 12px/1.35 var(--font-mono); }
.hsb-gpu-r > b { color: var(--ink); font-weight: 600; }
.hsb-gpu-r > span { color: var(--ink-3); text-align: right; }
.hsb-gpu-r > div { display: flex; gap: 7px; align-items: center; color: var(--ink-2); font-size: 11.5px; }
.hsb-gpu-r > div span span { color: var(--ink-3); }
.hsb-gpu-r.ok { border-color: rgba(69, 212, 155, 0.35); }
.hsb-gpu-r.jit { border-color: rgba(255, 198, 92, 0.35); }
.hsb-gpu-r.bad { border-color: rgba(255, 91, 110, 0.3); }
.hsb-ctlrow { display: flex; flex-wrap: wrap; gap: 12px 16px; align-items: flex-end; margin-bottom: 12px; }
.hsb-warnline { margin-top: 8px; font: 500 11.5px/1.5 var(--font-mono); color: var(--control); min-height: 1.5em; }

/* ── shorthand table: keep each flag on one line (the table scrolls on phones) ── */
.entry-body.hsb-body table.hsb-nwt td > code { white-space: nowrap; overflow-wrap: normal; }
.entry-body.hsb-body table.hsb-nwt td > code + br + code { margin-top: 4px; display: inline-block; }
.entry-body.hsb-body table.hsb-nwt td small { font-size: 12px; color: var(--ink-3); }

/* ── compiler driver vs hardware driver table ── */
.hsb-vs td:first-child { font-family: var(--font-mono); font-size: 12px; color: var(--ink-3); white-space: nowrap; }

/* ── nvrtc · two roads ── */
.hsb-roads { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; }
.hsb-roads.two { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
.hsb-road { border: 1px solid var(--line); border-radius: 12px; padding: 10px; background: rgba(8, 9, 14, 0.4); display: grid; gap: 6px; align-content: start; }
.hsb-road-h { display: flex; justify-content: space-between; gap: 8px; align-items: baseline; flex-wrap: wrap; }
.hsb-road-h b { font: 600 12.5px var(--font-mono); color: var(--ink); }
.hsb-road-h span { font: 500 11px var(--font-mono); color: var(--ink-3); }
.hsb-proc { border: 1.5px dashed rgba(184, 164, 255, 0.55); border-radius: 10px; padding: 18px 8px 8px; position: relative; display: grid; gap: 6px; }
.hsb-proc > i { position: absolute; top: 4px; left: 9px; font: 600 9.5px var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--host); font-style: normal; }
.hsb-proc.second { border-color: rgba(255, 198, 92, 0.6); }
.hsb-proc.second > i { color: var(--control); }
.hsb-disk { border-radius: 10px; padding: 7px 10px; background: repeating-linear-gradient(135deg, rgba(255,255,255,0.05) 0 6px, transparent 6px 12px); box-shadow: inset 0 0 0 1px var(--line-2); font: 500 11.5px var(--font-mono); color: var(--ink-2); opacity: 0.45; transition: opacity 0.25s, box-shadow 0.25s; }
.hsb-disk b { color: var(--ink); font-weight: 600; }
.hsb-disk.done { opacity: 0.9; }
.hsb-disk.on { opacity: 1; box-shadow: inset 0 0 0 1.5px var(--accent); }
.hsb-gpubox { border-radius: 10px; padding: 7px 10px; background: var(--core-a); box-shadow: inset 0 0 0 1px rgba(69, 212, 155, 0.5); font: 500 11.5px var(--font-mono); color: var(--ink); opacity: 0.45; transition: opacity 0.25s, box-shadow 0.25s; }
.hsb-gpubox.done { opacity: 0.9; }
.hsb-gpubox.on { opacity: 1; box-shadow: inset 0 0 0 1.5px var(--accent), 0 0 0 3px var(--accent-a); }
.hsb-road-f { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
.hsb-road .hsb-st { padding: 6px 9px 7px; }
.hsb-road .hsb-st p { font-size: 12.5px; }

/* ── nvrtc · JIT chain ── */
.hsb-chain { display: grid; grid-template-columns: minmax(0, 1fr); gap: 6px; }
.hsb-chain.row { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0; align-items: stretch; }
.hsb-link { position: relative; border: 1px solid var(--line); border-radius: 10px; background: var(--surface); padding: 8px 10px 10px; }
.hsb-chain.row .hsb-link { margin-right: 18px; }
.hsb-chain.row .hsb-link:last-child { margin-right: 0; }
.hsb-chain.row .hsb-link:not(:last-child)::after { content: "→"; position: absolute; right: -15px; top: 50%; transform: translateY(-50%); color: var(--ink-3); font: 500 13px var(--font-mono); }
.hsb-link .hsb-k { margin-bottom: 5px; }
.hsb-link b { display: block; font: 600 12.5px/1.35 var(--font-mono); color: var(--ink); }
.hsb-link p { margin-top: 4px; font-size: 12.5px; line-height: 1.45; color: var(--ink-2); }
.hsb-link.hot { border-color: var(--control); box-shadow: 0 0 0 3px var(--control-a); }
`);

  const ARCHS = [75, 80, 86, 89, 90, 100, 120];
  const GPU_LIST = [
    { name: 'T4', cc: 75 }, { name: 'A100', cc: 80 }, { name: 'A10', cc: 86 }, { name: 'L4 · L40S', cc: 89 },
    { name: 'H100 · H200', cc: 90 }, { name: 'B200', cc: 100 }, { name: 'RTX 5090', cc: 120 },
  ];
  const ccStr = (x) => (x / 10).toFixed(1);
  const major = (x) => Math.floor(x / 10);
  const sassRuns = (sm, cc) => major(sm) === major(cc) && cc >= sm;
  const ptxRuns = (cp, cc) => cc >= cp;

  /* Fig: the nvcc compilation trajectory */
  function trajectory(host, ctx) {
    const f = ctx.figure(host, {
      title: 'What nvcc does with one .cu file',
      hint: 'step through, or press play',
      wide: true,
      caption: 'Simplified from the trajectory in NVIDIA’s nvcc documentation, for one source file compiled with <code>-arch=sm_90</code>. Tool names (<code>cicc</code>, <code>ptxas</code>, <code>fatbinary</code>, <code>cudafe++</code>) are the ones NVIDIA’s diagram and <code>nvcc --dryrun</code> show; the glossary does not name them. Dashed outline: PTX, code for a virtual architecture. Solid green: SASS, machine code for a real one.',
    });
    const box = el('div', { class: 'hsb-traj' });
    f.stage.append(box);
    const st = (k, title, tool, text, out, who) => `<div class="hsb-st" data-s="${k}"><div class="hsb-st-h"><b>${title}</b>${tool ? `<span class="hsb-tool">${tool}</span>` : ''}</div><p>${text}</p>${out || ''}${who || ''}</div>`;
    const CD = (n) => `<span class="hsb-who cd">compiler driver at work: ${n}</span>`;
    const HD = '<span class="hsb-who hd">hardware driver at work</span>';
    box.innerHTML = `
      ${st(0, 'x.cu', '', 'One CUDA C++ file: host code (<code>main</code>, kernel launches) and device code (<code>__global__</code> kernels) side by side. nvcc separates the two.', '', CD('nvcc'))}
      <div class="hsb-tj-cols">
        <div class="hsb-tj-col"><div class="hsb-k">device code · for the GPU</div>
          ${st(1, 'compile to PTX', 'cicc', 'The device code is preprocessed, then compiled for a <em>virtual</em> architecture.', '<span class="hsb-out ptx">x.ptx · compute_90</span>', CD('nvcc'))}
          <div class="hsb-down">↓</div>
          ${st(2, 'assemble to SASS', 'ptxas', 'Turn PTX into machine code for one <em>real</em> SM architecture, packed in a cubin.', '<span class="hsb-out sass">x.cubin · sm_90</span>', CD('nvcc'))}
          <div class="hsb-down">↓</div>
          ${st(3, 'bundle', 'fatbinary', 'Pack every cubin and PTX version into one fat binary.', '<span class="hsb-out fat">SASS sm_90 + PTX compute_90</span>', CD('nvcc'))}
          <div class="hsb-join" data-j="out"><span data-v="jout">fat binary → into the host lane</span></div>
        </div>
        <div class="hsb-tj-col"><div class="hsb-k">host code · for the CPU</div><div class="hsb-par">runs side by side with the device lane above</div>
          ${st(4, 'rewrite CUDA syntax', 'cudafe++', 'Turn <code>&lt;&lt;&lt;…&gt;&gt;&gt;</code> launches into plain C++ calls into the CUDA Runtime, and include the fat binary as data.', '', CD('nvcc'))}
          <div class="hsb-join" data-j="in"><span>↓ plus</span><span class="hsb-out fat">fat binary</span><span data-v="jin">from the device lane ←</span></div>
          ${st(5, 'compile host code', 'gcc', 'The host system’s own compiler driver turns the C++ into CPU machine code.', '<span class="hsb-out host">x.o · x86-64 + embedded fat binary</span>', CD('gcc, called by nvcc'))}
        </div>
      </div>
      ${st(6, 'link', 'host linker', 'One executable that conforms to the host ABI (ELF on Linux), so <code>readelf</code> and friends can read it.', '<span class="hsb-out host">x · executable</span>', CD('nvcc (via the host linker)'))}
      <div class="hsb-tj-sep">build time above · run time below, on whatever machine runs x</div>
      <div class="hsb-tj-run">
        ${st(7, 'load & choose', 'NVIDIA GPU driver', 'When a kernel is first needed, the driver looks in the fat binary for SASS that fits this GPU. None? It JIT-compiles the PTX.', '', HD)}
        ${st(8, 'run', 'the GPU', 'The Streaming Multiprocessors execute the SASS.', '<span class="hsb-out sass">SASS executing</span>', '')}
      </div>`;
    const stages = $$(box, '.hsb-st');
    const joins = $$(box, '.hsb-join');
    // the fat binary crosses from the device lane into the host lane: say which way, for the current layout
    onWidth(box, () => {
      const cols = box.querySelectorAll('.hsb-tj-col');
      const side = cols.length < 2 || cols[0].offsetTop === cols[1].offsetTop; // a media query stacks the lanes on phones
      box.querySelector('[data-v="jout"]').textContent = side ? 'fat binary → into the host lane' : 'fat binary ↓ into the host lane below';
      box.querySelector('[data-v="jin"]').textContent = side ? 'from the device lane ←' : 'from the device lane ↑';
    });
    const steps = [
      { label: 'split', why: 'nvcc reads <b>x.cu</b> and separates the device code (functions marked <code>__global__</code> or <code>__device__</code>) from the host code. From here on it is a <b>compiler driver</b>: it does little compiling itself, and mostly runs other programs in the right order.' },
      { label: 'PTX', why: 'The device code is compiled to <b>PTX</b> for a <em>virtual</em> architecture, here <code>compute_90</code>, versioned by compute capability 9.0. PTX is an intermediate language, not yet something a GPU can execute.' },
      { label: 'SASS', why: '<b>ptxas</b>, the PTX optimizing assembler, turns the PTX into <b>SASS</b> for a <em>real</em> SM architecture, <code>sm_90</code>. The result is a <b>cubin</b>, itself an ELF file.' },
      { label: 'fat binary', why: 'The <b>fatbinary</b> tool bundles every cubin and every PTX version into one <b>fat binary</b>. With <code>-arch=sm_90</code> that is SASS for sm_90 plus PTX for compute_90.' },
      { label: 'host syntax', why: 'Meanwhile on the host side, <b>cudafe++</b> rewrites CUDA’s extensions, such as the <code>&lt;&lt;&lt;grid, block&gt;&gt;&gt;</code> launch syntax, into plain C++ that any host compiler understands.' },
      { label: 'gcc', why: 'The host code goes to the <b>host system’s compiler driver</b>, e.g. <code>gcc</code>, which runs its own preprocessor, compiler and assembler. The fat binary rides along as data inside the object file.' },
      { label: 'link', why: 'The host linker produces one <b>executable</b> that conforms to the host ABI. To the operating system it is a normal program, which is why <code>readelf</code> works on it.' },
      { label: 'driver', why: 'At run time the <b>NVIDIA GPU driver</b>, a <em>hardware</em> driver, finds the fat binary, picks the SASS that fits the GPU, or JIT-compiles the PTX if none fits. Different job, different meaning of “driver”.' },
      { label: 'run', why: 'The GPU’s Streaming Multiprocessors execute the <b>SASS</b>. Only SASS ever runs; PTX is always translated first, by ptxas at build time or by the driver at run time.' },
    ];
    GG.ui.stepper(f.controls, {
      label: 'Stage', steps, autoplay: 2300,
      onStep: (i) => {
        stages.forEach((n) => { const k = +n.getAttribute('data-s'); n.classList.toggle('on', k === i); n.classList.toggle('done', k < i); });
        joins.forEach((n) => n.classList.toggle('on', i >= 3 && i <= 5));
        f.setWhy(steps[i].why);
      },
    });
  }

  /* Fig: fat binary builder */
  function fatBuilder(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Fat binary builder',
      hint: 'pick a preset or set the flags',
      wide: true,
      controlsFirst: false,
      caption: 'What <code>nvcc x.cu --gpu-architecture=… --gpu-code=…</code> embeds, and what each GPU does with it at load time. Rules from NVIDIA’s nvcc documentation: SASS for <code>sm_XY</code> runs on GPUs of the same major version X and minor version at least Y; PTX for <code>compute_XY</code> can be JIT-compiled for any GPU of compute capability XY or higher. GPUs are examples of each compute capability.',
    });
    const box = el('div', { class: 'hsb-fb' });
    f.stage.append(box);
    onWidth(box, (w) => box.classList.toggle('two', w >= 700));
    const left = el('div', { class: 'hsb-w' });
    const right = el('div', { class: 'hsb-w' });
    box.append(left, right);

    const ctl = el('div', { class: 'hsb-w' });
    left.append(ctl);
    const PRESETS = {
      def: { arch: 75, code: ['sm_75', 'ptx'], label: 'nvcc x.cu', title: 'no flags: the default, compute_75 + sm_75' },
      sm90: { arch: 90, code: ['sm_90', 'ptx'], label: '-arch=sm_90', title: 'shorthand for --gpu-architecture=compute_90 --gpu-code=sm_90,compute_90' },
      c80: { arch: 80, code: [], label: '-arch=compute_80', title: 'PTX only; SASS is left to the driver' },
      sass: { arch: 80, code: ['sm_80'], label: 'SASS only', title: '--gpu-architecture=compute_80 --gpu-code=sm_80' },
      fat: { arch: 80, code: ['ptx', 'sm_86', 'sm_89'], label: 'docs’ fat binary', title: 'NVIDIA’s fatbinary example: --gpu-architecture=compute_80 --gpu-code=compute_80,sm_86,sm_89' },
    };
    const state = { arch: 90, code: new Set(['sm_90', 'ptx']) };
    let dropped = [];
    const presetSeg = GG.ui.seg(ctl, {
      label: 'Preset', value: 'sm90',
      options: Object.keys(PRESETS).map((k) => ({ value: k, label: PRESETS[k].label, title: PRESETS[k].title })),
      onChange: (k) => { const p = PRESETS[k]; state.arch = p.arch; state.code = new Set(p.code); dropped = []; archSeg.set(p.arch); render(); },
    });
    presetSeg.el.style.marginBottom = '12px';
    const archSeg = GG.ui.seg(ctl, {
      label: '--gpu-architecture (PTX version)', value: 90,
      options: ARCHS.map((a) => ({ value: a, label: 'compute_' + a })),
      onChange: (a) => {
        state.arch = a;
        dropped = [];
        for (const c of [...state.code]) if (c !== 'ptx' && +c.slice(3) < a) { state.code.delete(c); dropped.push(c); }
        presetSeg.set(null);
        render();
      },
    });
    archSeg.el.style.marginBottom = '12px';
    const codeWrap = el('div', { class: 'ctl' });
    codeWrap.innerHTML = '<span class="ctl-lab">--gpu-code (what gets embedded)</span>';
    const codeSeg = el('div', { class: 'seg hsb-multi', role: 'group', 'aria-label': 'gpu-code values' });
    codeWrap.append(codeSeg);
    ctl.append(codeWrap);
    const codeBtns = {};
    [...ARCHS.map((a) => 'sm_' + a), 'ptx'].forEach((c) => {
      const b = el('button', { type: 'button', 'aria-pressed': 'false' }, c === 'ptx' ? 'compute_90' : c);
      b.addEventListener('click', () => {
        if (b.disabled) return;
        if (state.code.has(c)) state.code.delete(c); else state.code.add(c);
        dropped = [];
        presetSeg.set(null);
        render();
      });
      codeSeg.append(b);
      codeBtns[c] = b;
    });
    const strike = el('div', { class: 'hsb-sub' });
    const warn = el('div', { class: 'hsb-warnline', 'aria-live': 'polite' });
    ctl.append(strike, warn);

    const cmd = el('div', { class: 'hsb-cmd' });
    const sub = el('div', { class: 'hsb-sub' });
    const fat = el('div', { class: 'hsb-fat' });
    left.append(cmd, sub, fat);
    cmd.style.marginTop = '4px';
    const gpus = el('div', { class: 'hsb-gpus' });
    right.append(el('div', { class: 'hsb-k', text: 'At load time, on each GPU', style: { marginBottom: '6px' } }), gpus);

    const stS = GG.ui.stat(f.readouts, { label: 'SASS images', value: '', tone: 'core' });
    const stP = GG.ui.stat(f.readouts, { label: 'PTX images', value: '' });
    const stD = GG.ui.stat(f.readouts, { label: 'GPUs run SASS as is', value: '', tone: 'core' });
    const stJ = GG.ui.stat(f.readouts, { label: 'GPUs need JIT', value: '', tone: 'control' });
    const stX = GG.ui.stat(f.readouts, { label: 'GPUs can’t run it', value: '', tone: 'danger' });

    function render() {
      const a = state.arch;
      const omitted = state.code.size === 0;
      const eff = omitted ? new Set(['ptx']) : state.code;
      const sms = ARCHS.filter((x) => eff.has('sm_' + x));
      const hasPtx = eff.has('ptx');
      // controls
      ARCHS.forEach((x) => {
        const b = codeBtns['sm_' + x];
        b.disabled = x < a;
        b.title = x < a ? `compute_${a} PTX assumes features that sm_${x} does not have, so the pair is incompatible` : `assemble the PTX into SASS for sm_${x} and embed it`;
        b.setAttribute('aria-pressed', String(state.code.has('sm_' + x)));
      });
      const off = ARCHS.filter((x) => x < a);
      strike.innerHTML = off.length ? `Struck out: ${off.map((x) => 'sm_' + x).join(', ')}, older than compute_${a}. compute_${a} PTX assumes features those SMs lack, so NVIDIA’s nvcc documentation calls the pairs incompatible.` : '';
      codeBtns.ptx.textContent = 'compute_' + a;
      codeBtns.ptx.title = `embed the compute_${a} PTX itself, for JIT compilation by the driver`;
      codeBtns.ptx.setAttribute('aria-pressed', String(state.code.has('ptx')));
      warn.textContent = dropped.length ? `Dropped ${dropped.join(', ')}: compute_${a} PTX cannot be assembled for an older architecture.` : omitted ? `--gpu-code omitted, so it defaults to the --gpu-architecture value: compute_${a} (PTX only).` : '';
      // command line
      const codes = [...sms.map((x) => 'sm_' + x), ...(hasPtx && !omitted ? ['compute_' + a] : [])];
      cmd.innerHTML = `<span class="d">$ </span>nvcc x.cu${omitted ? ' ' : ' <span class="d">\\</span>\n    '}<span class="f">--gpu-architecture</span>=<span class="v">compute_${a}</span>${omitted ? '' : ` <span class="d">\\</span>\n    <span class="f">--gpu-code</span>=<span class="v">${codes.join(',')}</span>`}`;
      let eq = '';
      if (!omitted && sms.length === 1 && sms[0] === a && hasPtx) eq = a === 75 ? 'same as plain <b>nvcc x.cu</b> (the default), or <b>-arch=sm_75</b>' : `same as the shorthand <b>nvcc x.cu -arch=sm_${a}</b>`;
      else if (omitted || (sms.length === 0 && hasPtx)) eq = `same as <b>nvcc x.cu -arch=compute_${a}</b>`;
      else eq = `equivalent: <b>--generate-code arch=compute_${a},code=${codes.length > 1 ? '[' + codes.join(',') + ']' : codes[0]}</b>`;
      sub.innerHTML = eq;
      // fat binary picture
      const imgs = sms.map((x) => `<span class="hsb-img sass">sm_${x}<small>SASS</small></span>`).join('') + (hasPtx ? `<span class="hsb-img ptx">compute_${a}<small>PTX</small></span>` : '');
      fat.innerHTML = `<div class="hsb-fat-h">x <span>executable · host ABI (ELF on Linux)</span></div>
        <div class="hsb-fat-host">host code · CPU machine code, from gcc</div>
        <div class="hsb-fat-bin"><div class="hsb-k">fat binary · device code</div><div class="hsb-imgs">${imgs}</div></div>`;
      // GPUs
      let nd = 0, nj = 0, nx = 0;
      const rows = GPU_LIST.map((g) => {
        const fit = sms.filter((x) => sassRuns(x, g.cc));
        let cls, ico, txt;
        if (fit.length) {
          nd++;
          cls = 'ok'; ico = '<span class="hsb-ico ok">✓</span>';
          const best = fit[fit.length - 1];
          txt = `runs SASS <b class="hsb-ok">sm_${best}</b>${fit.length > 1 ? ` <span>(sm_${fit.slice(0, -1).join(', sm_')} would also run)</span>` : ''}`;
        } else if (hasPtx && ptxRuns(a, g.cc)) {
          nj++;
          cls = 'jit'; ico = '<span class="hsb-ico warn">↻</span>';
          txt = `driver JITs compute_${a} PTX → <b class="hsb-warn">sm_${g.cc}</b> SASS`;
        } else {
          nx++;
          cls = 'bad'; ico = '<span class="hsb-ico bad">✗</span>';
          const why = [];
          if (sms.length) why.push(`SASS is for ${[...new Set(sms.map(major))].map((m) => m + '.x').join(', ')}`);
          if (hasPtx) why.push(`PTX needs ${ccStr(a)}+`);
          else why.push('no PTX to fall back on');
          txt = `no usable code <span>(${why.join('; ')})</span>`;
        }
        return `<div class="hsb-gpu-r ${cls}"><b>${esc(g.name)}</b><span>${ccStr(g.cc)}</span><div>${ico}<span>${txt}</span></div></div>`;
      });
      gpus.innerHTML = rows.join('');
      stS.set(sms.length);
      stP.set(hasPtx ? 1 : 0);
      stD.set(nd);
      stJ.set(nj);
      stX.set(nx);
      // why
      const parts = [];
      parts.push(`Embedded: ${sms.length ? sms.map((x) => `<b>sm_${x}</b> SASS`).join(', ') : 'no SASS'}${hasPtx ? `${sms.length ? ' and ' : ', only '}<b>compute_${a}</b> PTX` : ', no PTX'}.`);
      if (nd) parts.push(`${nd} of ${GPU_LIST.length} GPUs load ready-made SASS.`);
      if (nj) parts.push(`${nj} need the driver to JIT-compile the PTX at load time (slower first launch, but it works, including on GPUs newer than this build).`);
      if (nx) parts.push(`${nx} cannot run it at all${!hasPtx ? ': without PTX there is no forward compatibility' : ''}.`);
      f.setWhy(parts.join(' '));
    }
    render();
  }

  GG.entry('nvcc', {
    render(body, ctx) {
      body.classList.add('hsb-body');
      const s = ctx.html(body, `
<p>The programs <code>nvcc</code> compiles are written in ${T('cuda-c', 'CUDA C/C++')}, and the word <em>driver</em> in its name is meant precisely: nvcc is mostly a conductor. It splits your source into the part that runs on the GPU and the part that runs on the CPU, then runs a chain of other programs over each part, in the right order and with the right flags, and stitches the results together.</p>
<p>What comes out is a binary executable that conforms to the host ABI and also includes ${T('parallel-thread-execution', 'PTX')} and/or ${T('streaming-assembler', 'SASS')} to be executed on the GPU: a so-called <strong>fat binary</strong>. The <em>host ABI</em> (application binary interface) is the set of rules every binary on the platform follows, such as the object file format, how functions are called and how data is laid out. Following it is what makes nvcc’s output a normal program to the operating system. <em>Fat</em> because it can carry several versions of the same GPU code at once, for different GPUs, next to the CPU code.</p>
<div data-slot="traj" class="wide"></div>
<p>These binaries are inspectable with the same tools used for other binaries, like <code>readelf</code> on Linux, but they can additionally be manipulated with the specialized ${T('cuda-binary-utilities', 'CUDA Binary Utilities')}, which know how to open the fat binary inside.</p>
<h3>Two kinds of GPU code, two version numbers</h3>
<p>The two kinds of device code in a fat binary are versioned differently, and nvcc’s flags follow that split.</p>
<div class="grid-2">
<div>${GG.noteHTML('aside', '<p><b>PTX</b> is versioned by ' + T('compute-capability', 'Compute Capability') + ', configured by passing <code>compute_XYz</code> values to the <code>--gpu-architecture</code> or <code>--gpu-code</code> options. PTX targets a <em>virtual</em> architecture: an idealized GPU with a given feature set. It is not machine code yet, which is what lets the driver compile it for GPUs that did not exist when you built.</p>', 'PTX · compute_XYz')}</div>
<div>${GG.noteHTML('aside', '<p><b>SASS</b> is versioned by ' + T('streaming-multiprocessor-architecture', 'SM architecture version') + ', configured by passing <code>sm_XYz</code> values to the <code>--gpu-architecture</code> or <code>--gpu-code</code> options. SASS targets a <em>real</em> architecture: it is the machine code the ' + T('streaming-multiprocessor', 'Streaming Multiprocessors') + ' of one GPU generation execute directly.</p>', 'SASS · sm_XYz')}</div>
</div>
<p>In both names, <code>X</code> is the major version, <code>Y</code> the minor version and <code>z</code> an optional letter suffix: <code>compute_90</code> is PTX for compute capability 9.0 (Hopper, the H100), <code>sm_100</code> is SASS for SM architecture 10.0 (the B200), <code>sm_90a</code> adds a suffix. The glossary adds one more rule: passing <code>compute_XYz</code> to <code>--gpu-code</code> will also trigger the generation of SASS code with the same version as the PTX. Build a fat binary yourself in Fig. 2 and see which GPUs could run it.</p>
<div data-slot="fb" class="wide"></div>
${GG.noteHTML('check', '<p>NVIDIA’s <a href="https://docs.nvidia.com/cuda/cuda-compiler-driver-nvcc/">nvcc documentation</a> (CUDA 13.4) describes <code>compute_XY</code> in <code>--gpu-code</code> differently from the glossary’s last sentence. Its “Shorthand 1” says that when a <code>--gpu-code</code> value is a virtual architecture, “the stage 2 translation will be omitted for such virtual architecture, and the stage 1 PTX result will be embedded instead”; the driver compiles that PTX to SASS at application launch, if it finds no better alternative. So at build time, <code>compute_80</code> in <code>--gpu-code</code> embeds PTX, not SASS. Fig. 2 follows the documentation.</p><p>Two nearby cases do fit the glossary’s wording. The shorthand <code>-arch=sm_80</code> (with no <code>--gpu-code</code>) expands to <code>--gpu-architecture=compute_80 --gpu-code=sm_80,compute_80</code>, SASS and PTX of the same version. And if the sentence means the driver’s JIT, SASS does get generated from that PTX, though for whatever GPU is present, which may be newer than the PTX.</p>')}
<h4>Shorthands, as nvcc reads them <span class="hsb-tag beyond">beyond the glossary</span></h4>
<p>In practice people rarely spell out both options. From NVIDIA\u2019s nvcc documentation (CUDA 13.4), where <code>-arch</code> is short for <code>--gpu-architecture</code> and <code>-code</code> for <code>--gpu-code</code>:</p>
<div data-slot="short"></div>
${GG.noteHTML('beyond', '<p><b>Suffixes.</b> <code>a</code> marks architecture-specific code, such as <code>sm_90a</code> for Hopper-only instructions: <code>compute_90a</code> PTX can only be compiled to <code>sm_90a</code> SASS. <code>f</code> marks family-specific code, such as <code>sm_100f</code>: <code>compute_100f</code> PTX can also be compiled to SASS for later GPUs of the same family. With <code>-arch=sm_90a</code>, nvcc embeds both <code>compute_90</code> and <code>compute_90a</code> PTX next to the <code>sm_90a</code> SASS.</p>')}
<h3>Host code goes to the host compiler</h3>
<p>nvcc does not compile the CPU side itself. Compilation of host code is done using the host system’s compiler driver, e.g. the <code>gcc</code> compiler driver on Linux. <code>gcc</code> is a compiler driver in exactly nvcc’s sense: the <code>gcc</code> command runs a preprocessor, the compiler proper, an assembler and a linker for you.</p>
<p>Note that compiler drivers are not to be confused with hardware drivers, like the ${T('nvidia-gpu-drivers', 'NVIDIA GPU Drivers')}. Same word, unrelated jobs:</p>
<div data-slot="vs"></div>
${GG.noteHTML('beyond', '<p>You can watch both compiler drivers conduct. <code>nvcc --dryrun x.cu</code> lists the sub-commands nvcc would run without running them (<code>--verbose</code> runs them and prints them); <code>gcc -v</code> prints the programs gcc invokes, such as <code>cc1</code> (the compiler proper), <code>as</code> (the assembler) and <code>collect2</code> (a wrapper around the linker <code>ld</code>).</p>')}
<h3>Looking inside the result</h3>
<p>Because the output follows the host ABI, ordinary tools see an ordinary program. The fat binary is just more data inside it, which only CUDA-aware tools can take apart.</p>
<div data-slot="shell"></div>
<p>The documentation for <code>nvcc</code> can be found <a href="https://docs.nvidia.com/cuda/cuda-compiler-driver-nvcc/">here</a>.</p>
<div data-slot="read"></div>`);
      guard(s.traj, 'Trajectory', () => trajectory(s.traj, ctx));
      guard(s.fb, 'Fat binary builder', () => fatBuilder(s.fb, ctx));
      s.short.innerHTML = GG.tableHTML(`<thead><tr><th>you write</th><th>nvcc reads it as</th><th>embedded in the fat binary</th></tr></thead><tbody>
        <tr><td><code>nvcc x.cu</code><br><small>no flags</small></td><td><code>--gpu-architecture=compute_75</code><br><code>--gpu-code=sm_75,compute_75</code></td><td>SASS sm_75, PTX compute_75 (the default)</td></tr>
        <tr><td><code>-arch=sm_90</code></td><td><code>--gpu-architecture=compute_90</code><br><code>--gpu-code=sm_90,compute_90</code></td><td>SASS sm_90, PTX compute_90</td></tr>
        <tr><td><code>-arch=compute_80</code></td><td><code>--gpu-architecture=compute_80</code><br><code>--gpu-code=compute_80</code></td><td>PTX compute_80 only</td></tr>
        <tr><td><code>-arch=native</code></td><td>the GPUs visible on the build machine</td><td>SASS for them, no PTX</td></tr>
        <tr><td><code>-arch=all</code></td><td>every supported architecture</td><td>SASS for all, PTX for the highest major version</td></tr>
        <tr><td><code>-gencode</code> <code>arch=compute_80,code=[sm_80,sm_86]</code><br><code>-gencode</code> <code>arch=compute_90,code=sm_90</code></td><td>two PTX generations: <code>--gpu-architecture</code> takes only one value, <code>--generate-code</code> (<code>-gencode</code>) may be repeated</td><td>SASS sm_80 and sm_86 from compute_80 PTX, SASS sm_90 from compute_90 PTX, no PTX</td></tr></tbody>`).replace('<table>', '<table class="hsb-nwt">');
      s.vs.innerHTML = GG.tableHTML(`<thead><tr><th></th><th>compiler driver</th><th>hardware driver</th></tr></thead><tbody>
        <tr><td>examples</td><td><code>nvcc</code>, <code>gcc</code></td><td>the ${T('nvidia-gpu-drivers', 'NVIDIA GPU Drivers')}: the ${T('nvidia-ko', 'nvidia.ko')} kernel module and the user-space ${T('libcuda', 'libcuda.so')}</td></tr>
        <tr><td>when it runs</td><td>at build time, when you compile</td><td>at run time, every time the program talks to the GPU</td></tr>
        <tr><td>what it drives</td><td>other programs: preprocessors, compilers, assemblers, linkers</td><td>a device: the GPU itself</td></tr>
        <tr><td>what it produces</td><td>object files and executables</td><td>memory allocations, copies, kernel launches, and JIT-compiled SASS</td></tr></tbody>`).replace('<table>', '<table class="hsb-vs">');
      guard(s.shell, 'Shell', () => ctx.code(s.shell, {
        lang: 'shell', caption: 'beyond the glossary: poking at nvcc’s output on Linux',
        code: 'nvcc -arch=sm_90 -o saxpy saxpy.cu   # one executable: host code + fat binary\nreadelf -S saxpy                     # generic ELF tool: sections, among them .nv_fatbin\ncuobjdump -lelf saxpy                # CUDA tool: list the cubins (SASS) in the fat binary\ncuobjdump -lptx saxpy                # CUDA tool: list the PTX in the fat binary',
        notes: {
          1: '<code>-arch=sm_90</code> embeds SASS for sm_90 and PTX for compute_90 (see the shorthand note above).',
          2: '<code>readelf</code> sees a normal ELF executable. On Linux the fat binary sits in its own section, <code>.nv_fatbin</code>, which readelf lists but cannot interpret.',
          3: '<code>cuobjdump</code> is one of the CUDA Binary Utilities. <code>-lelf</code> lists the cubins, the ELF files that hold SASS, embedded in the host binary.',
          4: '<code>-lptx</code> lists the embedded PTX.',
        },
      }));
      ctx.reading(s.read, [
        { href: 'https://docs.nvidia.com/cuda/cuda-compiler-driver-nvcc/', label: 'NVIDIA CUDA Compiler Driver (nvcc) documentation', note: 'the compilation trajectory, <code>--gpu-architecture</code>, <code>--gpu-code</code>, <code>-gencode</code>, virtual architectures, JIT and fat binaries' },
      ]);
    },
  });

  /* ═════════════════════════════ nvrtc ═════════════════════════════ */

  const NVRTC_CODE = `// CUDA C++ source, held in a string (it could be generated at run time)
const char *src = R"(
extern "C" __global__ void scale(float *x, float a, int n) {
  int i = blockIdx.x * blockDim.x + threadIdx.x;
  if (i < n) x[i] = a * x[i];
})";

// 1. compile it to PTX, in this process
nvrtcProgram prog;
nvrtcCreateProgram(&prog, src, "scale.cu", 0, NULL, NULL);
const char *opts[] = {"--gpu-architecture=compute_80"};
nvrtcCompileProgram(prog, 1, opts);

size_t ptxSize;
nvrtcGetPTXSize(prog, &ptxSize);
char *ptx = new char[ptxSize];
nvrtcGetPTX(prog, ptx);
nvrtcDestroyProgram(&prog);

// 2. hand the PTX to the driver, which JIT-compiles it to SASS
CUmodule module;
CUfunction kernel;
cuModuleLoadData(&module, ptx);
cuModuleGetFunction(&kernel, module, "scale");`;

  /* Fig: nvrtc in-process vs spawning nvcc */
  function twoRoads(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Compiling at run time: two roads',
      hint: 'press play or step',
      wide: true,
      caption: 'Both roads start from CUDA C++ source that exists only while the program runs and end with SASS running on the GPU. Dashed outlines are operating-system processes; hatched boxes are files on disk. The drawbacks of the second road are the ones NVIDIA’s NVRTC documentation lists: extra overhead from spawning processes and disk I/O, and end users needing nvcc and its tools installed.',
    });
    const box = el('div', { class: 'hsb-roads' });
    f.stage.append(box);
    onWidth(box, (w) => box.classList.toggle('two', w >= 660));
    const sg = (k, title, code, text) => `<div class="hsb-st" data-k="${k}"><div class="hsb-st-h"><b>${title}</b>${code ? `<span class="hsb-tool">${code}</span>` : ''}</div><p>${text}</p></div>`;
    box.innerHTML = `
      <div class="hsb-road" data-road="a"><div class="hsb-road-h"><b>NVRTC</b><span>a library call</span></div>
        <div class="hsb-proc"><i>your process</i>
          ${sg(0, 'source string', 'const char *src', 'CUDA C++ in memory, perhaps just generated.')}
          ${sg(1, 'compile in-process', 'nvrtcCompileProgram', 'libnvrtc compiles the string. No new process, no files.')}
          ${sg(2, 'PTX string', 'nvrtcGetPTX', 'The result is PTX text, still in memory.')}
          ${sg(3, 'driver JIT', 'cuModuleLoadData', 'The NVIDIA GPU driver compiles PTX → SASS for this GPU.')}
        </div>
        <div class="hsb-gpubox" data-k="4">GPU · runs the SASS <span class="c-dim">(cuLaunchKernel)</span></div>
        <div class="hsb-road-f" data-v="fa"></div>
      </div>
      <div class="hsb-road" data-road="b"><div class="hsb-road-h"><b>Spawn nvcc</b><span>another program</span></div>
        <div class="hsb-proc"><i>your process</i>
          ${sg(0, 'source string', 'const char *src', 'The same CUDA C++ in memory.')}
          ${sg(1, 'write it to disk', 'fwrite', 'nvcc reads files, so the string is saved first.')}
        </div>
        <div class="hsb-disk" data-k="1"><b>kernel.cu</b> · file on disk</div>
        <div class="hsb-proc second"><i>a second process</i>
          ${sg(2, 'start nvcc', 'fork + exec', 'Launch nvcc, which starts its own sub-tools.')}
          ${sg(3, 'compile', 'nvcc -ptx kernel.cu', 'nvcc writes kernel.ptx and exits.')}
        </div>
        <div class="hsb-disk" data-k="3"><b>kernel.ptx</b> · file on disk</div>
        <div class="hsb-proc"><i>your process</i>
          ${sg(4, 'read the PTX back', 'fread', 'Wait for nvcc to exit, then load its output.')}
          ${sg(5, 'driver JIT', 'cuModuleLoadData', 'Same as the first road from here.')}
        </div>
        <div class="hsb-gpubox" data-k="6">GPU · runs the SASS <span class="c-dim">(cuLaunchKernel)</span></div>
        <div class="hsb-road-f" data-v="fb"></div>
      </div>`;
    const roads = { a: box.querySelector('[data-road="a"]'), b: box.querySelector('[data-road="b"]') };
    const chips = (host2, items) => { host2.innerHTML = ''; items.forEach(([l, v, tone]) => GG.ui.stat(host2, { label: l, value: v, tone })); };
    chips(box.querySelector('[data-v="fa"]'), [['processes', '1', 'core'], ['files written', '0', 'core'], ['needs nvcc installed', 'no', 'core']]);
    chips(box.querySelector('[data-v="fb"]'), [['processes', '2+', 'danger'], ['files written', '2', 'danger'], ['needs nvcc installed', 'yes', 'danger']]);
    const steps = [
      { label: 'source', why: 'Both roads start with <b>CUDA C++ source in a string</b>, for example code a framework just generated for one specific shape or operator chain.' },
      { label: 'compile / write', why: 'NVRTC compiles the string <b>right away, inside your process</b> (<code>nvrtcCompileProgram</code>). The other road first has to <b>write the source to a file</b>, because nvcc is a separate program that reads files.' },
      { label: 'PTX / spawn', why: 'NVRTC hands back <b>PTX as a string</b> (<code>nvrtcGetPTX</code>). The other road <b>spawns a new process</b> for nvcc, which in turn starts its own sub-tools.' },
      { label: 'JIT / compile', why: 'On the NVRTC road the <b>driver</b> now JIT-compiles the PTX to SASS (<code>cuModuleLoadData</code>). nvcc meanwhile compiles <code>kernel.cu</code>, <b>writes kernel.ptx to disk</b> and exits.' },
      { label: 'run / read', why: 'The NVRTC road is done: the kernel <b>runs on the GPU</b>. The nvcc road is still <b>reading kernel.ptx back</b> into your process.' },
      { label: 'JIT', why: 'Now the nvcc road reaches the same <b>driver JIT</b> step. Note it: whichever road you take, PTX is compiled to SASS <em>by the driver</em>, a compilation distinct from the one NVRTC or nvcc did.' },
      { label: 'run', why: 'Both roads end with the same SASS running on the GPU. The difference was everything in between: <b>one process and no files</b>, versus <b>two processes, two files and a toolchain</b> that has to be installed wherever the program runs.' },
    ];
    GG.ui.stepper(f.controls, {
      label: 'Step', steps, autoplay: 1900,
      onStep: (i) => {
        for (const r of ['a', 'b']) {
          const lastA = 4;
          $$(roads[r], '[data-k]').forEach((n) => {
            const k = +n.getAttribute('data-k');
            const cap = r === 'a' ? Math.min(i, lastA) : i;
            n.classList.toggle('on', k === cap && !(r === 'a' && i > lastA));
            n.classList.toggle('done', k < cap || (r === 'a' && i > lastA && k <= lastA));
          });
        }
        f.setWhy(steps[i].why);
      },
    });
  }

  /* Fig: where the driver's JIT step comes in */
  function jitChain(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Who compiles what, and when',
      hint: 'pick a source and a GPU',
      wide: true,
      caption: 'At run time, the PTX-to-SASS step is the driver’s job. It runs whenever the driver has PTX but no SASS that fits the GPU: always for NVRTC’s PTX output, and for an nvcc fat binary whenever none of its SASS fits the GPU, which is the forward-compatibility case when the GPU is newer than the build. The third source is the note below the code: NVRTC given a real architecture (here the GPU’s own) returns a cubin through <code>nvrtcGetCUBIN</code>, so there is nothing left for the driver to compile. The time strip places each compilation in the life of the program. SASS compatibility rule from NVIDIA’s nvcc documentation.',
    });
    GG.css(`
.hsb-when { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; margin-top: 12px; }
.hsb-when > div { display: grid; grid-template-rows: auto 1fr; gap: 5px; min-width: 0; }
.hsb-when .hsb-k { border-top: 2px solid var(--line-2); padding-top: 5px; }
.hsb-when i { display: block; font: 500 11px/1.35 var(--font-mono); font-style: normal; padding: 6px 7px; border-radius: 7px; min-height: 40px; overflow-wrap: anywhere; transition: background 0.25s, box-shadow 0.25s; }
.hsb-when i.cc { background: var(--host-a); box-shadow: inset 0 0 0 1px rgba(184, 164, 255, 0.55); color: var(--ink); }
.hsb-when i.jit { background: var(--control-a); box-shadow: inset 0 0 0 1.5px var(--control); color: var(--ink); }
.hsb-when i.ld { background: rgba(255, 255, 255, 0.04); box-shadow: inset 0 0 0 1px var(--line-2); color: var(--ink-2); }
.hsb-when i.run { background: var(--core-a); box-shadow: inset 0 0 0 1px rgba(69, 212, 155, 0.55); color: var(--ink); }
.hsb-when i.none { color: var(--ink-3); box-shadow: inset 0 0 0 1px var(--line); background: repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0 5px, transparent 5px 10px); }
@media (max-width: 560px) { .hsb-when { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); } }
`);
    const chain = el('div', { class: 'hsb-chain' });
    const when = el('div', { class: 'hsb-when', role: 'img' });
    f.stage.append(chain, when);
    onWidth(chain, (w) => chain.classList.toggle('row', w >= 720));
    const st = { src: 'nvrtc', cc: 90 };
    const GP = { 80: 'A100', 90: 'H100', 100: 'B200' };
    const stJ = GG.ui.stat(f.readouts, { label: 'driver JIT at load', value: '' });
    const stS = GG.ui.stat(f.readouts, { label: 'SASS that runs', value: '', tone: 'core' });
    const stC = GG.ui.stat(f.readouts, { label: 'compiled by', value: '' });
    function render() {
      const src = st.src, nv = src === 'nvrtc', cub = src === 'cubin';
      const cc = st.cc;
      const cubinFits = cub || (src === 'fat' && sassRuns(80, cc));
      const jit = !cubinFits;
      const ran = jit || cub ? cc : 80;
      const first = nv ? '<b>NVRTC</b><p>in-process, for the virtual architecture <code>compute_80</code>: emits PTX only</p>'
        : cub ? `<b>NVRTC</b><p>in-process, for the real architecture <code>sm_${cc}</code> of the GPU it found: emits a cubin (<code>nvrtcGetCUBIN</code>)</p>`
          : '<b>nvcc -arch=sm_80</b><p>at build time: a fat binary with sm_80 SASS and compute_80 PTX</p>';
      const drv = nv ? 'NVRTC’s output is PTX, so the driver must compile it.'
        : cub ? `The cubin already holds sm_${cc} SASS for this GPU, so there is nothing to compile.`
          : cubinFits ? 'sm_80 SASS runs on compute capability 8.x, so no compilation is needed.' : `sm_80 SASS cannot run on ${ccStr(cc)}: a different major version. The PTX saves the day.`;
      chain.innerHTML = `
        <div class="hsb-link"><div class="hsb-k">1 · source</div><b>CUDA C++</b><p>${src === 'fat' ? 'x.cu, written before the program shipped' : 'a string your program built while running'}</p></div>
        <div class="hsb-link"><div class="hsb-k">2 · first compiler</div>${first}</div>
        <div class="hsb-link ${jit ? 'hot' : ''}"><div class="hsb-k">3 · NVIDIA GPU driver</div><b>${jit ? 'JIT: PTX → SASS' : cub ? 'load the cubin' : 'load the sm_80 cubin'}</b><p>${drv}</p></div>
        <div class="hsb-link"><div class="hsb-k">4 · ${GP[cc]} · CC ${ccStr(cc)}</div><b>runs sm_${ran} SASS</b><p>${jit ? 'freshly compiled for this exact GPU' : cub ? 'compiled by NVRTC moments ago' : 'the SASS nvcc produced at build time'}</p></div>`;
      const cols = [
        ['build time', src === 'fat' ? '<i class="cc">nvcc: C++ → sm_80 SASS + compute_80 PTX</i>' : '<i class="none">no GPU code yet: the source does not exist</i>'],
        ['program running', nv ? '<i class="cc">NVRTC: C++ → compute_80 PTX</i>' : cub ? `<i class="cc">NVRTC: C++ → sm_${cc} cubin</i>` : '<i class="none">nothing to compile</i>'],
        ['code loaded by the driver', jit ? `<i class="jit">driver JIT: PTX → sm_${cc} SASS</i>` : `<i class="ld">driver loads the sm_${ran} cubin as is</i>`],
        ['kernel runs', `<i class="run">GPU runs sm_${ran} SASS</i>`],
      ];
      when.innerHTML = cols.map(([h, b]) => `<div><div class="hsb-k">${h}</div>${b}</div>`).join('');
      when.setAttribute('aria-label', 'When each compilation happens: ' + cols.map(([h, b]) => `${h}: ${b.replace(/<[^>]+>/g, '')}`).join('; ') + '.');
      stJ.set(jit ? 'yes' : 'no', jit ? 'control' : 'core');
      stS.set('sm_' + ran);
      stC.set(nv ? 'NVRTC + driver' : cub ? 'NVRTC only' : jit ? 'nvcc + driver' : 'nvcc only');
      f.setWhy(nv
        ? `NVRTC compiled the C++ to <b>PTX</b> while the program ran. On the ${GP[cc]}, the <b>driver</b> then JIT-compiles that PTX into <b>sm_${cc}</b> SASS when the code is loaded: two compilers, run by two different pieces of software, both after the program started.`
        : cub
          ? `Asked for the real architecture <b>sm_${cc}</b>, NVRTC returns a <b>cubin</b> instead of PTX. The driver only loads it: the one compilation happened inside the program, and <b>no JIT</b> is needed.`
          : cubinFits
            ? 'The fat binary already holds <b>sm_80</b> SASS and the A100 is compute capability 8.0, so the driver loads it as is. All compilation happened at build time. No JIT.'
            : `This binary was built before anyone targeted the ${GP[cc]}. Its sm_80 SASS cannot run on compute capability ${ccStr(cc)}, so the driver <b>JIT-compiles the embedded compute_80 PTX</b> to sm_${cc} at load time. That is forward compatibility, and it goes through the same driver step as NVRTC’s PTX output.`);
    }
    GG.ui.seg(f.controls, { label: 'GPU code comes from', value: 'nvrtc', options: [{ value: 'nvrtc', label: 'NVRTC → PTX' }, { value: 'cubin', label: 'NVRTC → cubin' }, { value: 'fat', label: 'an nvcc fat binary' }], onChange: (v) => { st.src = v; render(); } });
    GG.ui.seg(f.controls, { label: 'GPU', value: 90, options: [{ value: 80, label: 'A100 · 8.0' }, { value: 90, label: 'H100 · 9.0' }, { value: 100, label: 'B200 · 10.0' }], onChange: (v) => { st.cc = v; render(); } });
    render();
  }

  GG.entry('nvrtc', {
    render(body, ctx) {
      body.classList.add('hsb-body');
      const s = ctx.html(body, `
<p>NVRTC, as the library is often written, compiles ${T('cuda-c', 'CUDA C++')} to ${T('parallel-thread-execution', 'PTX')} while your program runs, from inside your program, without requiring a separate launch of the ${T('nvcc', 'NVIDIA CUDA Compiler Driver')} (<code>nvcc</code>) in another process.</p>
<p>Why compile GPU code while the program is running? Because some code only exists at run time. NVRTC is used by some libraries and frameworks to, for example, map generated C/C++ code to PTX code that can run on a GPU: a kernel written on the fly for the exact data types, sizes or chain of operations a user just asked for, which no one could have compiled in advance.</p>
<div data-slot="roads" class="wide"></div>
${GG.noteHTML('beyond', '<p>NVIDIA’s NVRTC documentation gives the history: without runtime compilation support, programs that wanted to compile at run time had to spawn nvcc in a separate process, which meant higher compilation overhead and required end users to install nvcc and its tools. NVRTC removes the process spawn and the disk I/O. One well-known user is CuPy, whose <code>RawKernel</code> compiles CUDA source strings with NVRTC by default.</p>')}
<h3>A second compilation, in the driver</h3>
<p>NVRTC’s output is not yet machine code. This PTX is then further <em>JIT-compiled</em> (just-in-time: compiled at the last moment, on the machine that will run it) from the PTX <em>IR</em> (intermediate representation, a program in a compiler’s in-between form) to ${T('streaming-assembler', 'SASS assembly')}, the GPU’s real instruction set. This step is done by the ${T('nvidia-gpu-drivers', 'NVIDIA GPU drivers')} and is distinct from the compilation done by NVRTC.</p>
<p>The same step serves ordinary nvcc-built programs. CUDA binaries that contain PTX, as required for <em>forward compatibility</em> (running on GPUs newer than the binary), also pass through this compilation step whenever none of their SASS fits the GPU. Fig. 2 shows both cases side by side.</p>
<div data-slot="jit" class="wide"></div>
<h3>What it looks like in code</h3>
<p>A sketch of the whole road in C++: NVRTC turns a source string into PTX, then the ${T('cuda-driver-api', 'CUDA Driver API')} (in ${T('libcuda', 'libcuda.so')}) loads the PTX, which is where the driver’s JIT compilation happens.</p>
<div data-slot="code"></div>
${GG.noteHTML('beyond', '<p><b>Skipping the JIT.</b> Given a real architecture instead of a virtual one (<code>--gpu-architecture=sm_90</code> instead of <code>compute_90</code>), current NVRTC can also emit a cubin, SASS ready to load, through <code>nvrtcGetCUBIN</code>; with a virtual architecture no cubin is produced. <b>Caching the JIT.</b> The driver can keep JIT output in a compilation cache that persists across runs of an application, which the nvcc documentation suggests to soften the start-up delay that JIT compilation causes.</p>')}
<p>NVRTC is closed source. You can find its documentation <a href="https://docs.nvidia.com/cuda/nvrtc/index.html">here</a>.</p>
<div data-slot="read"></div>`);
      guard(s.roads, 'Two roads', () => twoRoads(s.roads, ctx));
      guard(s.jit, 'JIT chain', () => jitChain(s.jit, ctx));
      guard(s.code, 'NVRTC code', () => ctx.code(s.code, {
        lang: 'cpp', code: NVRTC_CODE, caption: 'beyond the glossary: NVRTC plus the Driver API (error checks and driver set-up such as <code>cuInit</code> and context creation omitted)',
        notes: {
          3: 'The source sits in a C++ raw string literal. <code>extern "C"</code> keeps the kernel’s name unmangled, so it can be looked up as <code>"scale"</code> later.',
          10: '<code>nvrtcCreateProgram(&amp;prog, src, name, numHeaders, headers, includeNames)</code>: wrap the source in a program object. No headers here.',
          11: 'The option string is nvcc-style. <code>compute_80</code> is a virtual architecture, so the output is PTX.',
          12: '<code>nvrtcCompileProgram</code>: the compilation itself, inside this process.',
          15: 'Ask for the size, allocate, then copy the PTX out: the usual two-call C pattern.',
          17: '<code>nvrtcGetPTX</code>: the PTX, as text.',
          23: '<code>cuModuleLoadData</code> hands the PTX to the driver, which JIT-compiles it to SASS for the GPU in this machine.',
          24: 'Look the kernel up by name; it can now be launched with <code>cuLaunchKernel</code>.',
        },
      }));
      ctx.reading(s.read, [
        { href: 'https://docs.nvidia.com/cuda/nvrtc/index.html', label: 'NVRTC documentation', note: 'API reference, supported compile options and a complete SAXPY example' },
      ]);
    },
  });


  /* ═════════════════════════════ CUPTI ═════════════════════════════ */

  GG.css(`
/* ── CUPTI · clocks ── */
.hsb-svgw svg { display: block; width: 100%; height: auto; overflow: visible; }
.hsb-key { display: flex; flex-wrap: wrap; gap: 3px 18px; margin-top: 8px; font: 500 11px/1.45 var(--font-mono); color: var(--ink-3); }
.hsb-key b { color: var(--ink); font-weight: 600; }

/* ── CUPTI · consumers ── */
.hsb-stack { display: grid; gap: 8px; }
.hsb-cons { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
@media (max-width: 560px) { .hsb-cons { grid-template-columns: minmax(0, 1fr); } }
.hsb-con { text-align: left; cursor: pointer; border: 1px solid var(--line-2); border-radius: 10px; background: var(--surface); padding: 8px 10px; color: var(--ink-2); font: 12.5px/1.45 var(--font-body); }
.hsb-con b { display: block; font: 600 12.5px var(--font-mono); color: var(--ink); }
.hsb-con[aria-pressed="true"] { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-a); }
.hsb-layer { border-radius: 10px; padding: 8px 10px 10px; border: 1px solid var(--line); background: rgba(8, 9, 14, 0.5); }
.hsb-layer.cupti { border-color: rgba(184, 164, 255, 0.5); background: var(--host-a); }
.hsb-layer.gpu { border-color: rgba(69, 212, 155, 0.45); background: var(--core-a); }
.hsb-layer .hsb-k { margin-bottom: 6px; }
.hsb-apis { display: flex; flex-wrap: wrap; gap: 5px; }
.hsb-api { font: 500 11.5px/1.2 var(--font-mono); padding: 5px 8px; border-radius: 7px; border: 1px solid rgba(184, 164, 255, 0.4); background: rgba(8, 9, 14, 0.55); color: var(--ink); cursor: help; }
.hsb-api:hover, .hsb-api:focus-visible, .hsb-api.on { border-color: var(--accent); }
.hsb-flow { text-align: center; font: 500 11px var(--font-mono); color: var(--ink-3); }

/* ── CUPTI · three levels ── */
.hsb-lv { display: grid; gap: 10px; grid-template-columns: minmax(0, 1fr); }
.hsb-lv-2 { display: grid; gap: 10px; grid-template-columns: minmax(0, 1fr); }
.hsb-lv-2.two { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
.hsb-lvp { border: 1px solid var(--line); border-radius: 10px; background: #090a10; overflow: hidden; min-width: 0; }
.hsb-lvp-h { display: flex; justify-content: space-between; gap: 8px; padding: 6px 10px; border-bottom: 1px solid var(--line); background: var(--surface); font: 500 10.5px var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-3); }
.hsb-lvp-h span:last-child { letter-spacing: 0; text-transform: none; }
.hsb-lvp-b { overflow-x: auto; padding: 5px 0; scrollbar-width: thin; }
.hsb-tbl { display: table; width: 100%; border-collapse: collapse; }
.hsb-lvp.scroll .hsb-lvp-b { max-height: 300px; overflow-y: auto; }
.hsb-ln { display: table-row; font: 12px/1.7 var(--font-mono); color: #d4d7e6; white-space: pre; cursor: default; transition: background 0.15s, opacity 0.15s; }
.hsb-ln > span { display: table-cell; vertical-align: middle; padding: 0 10px; }
.hsb-ln > span.bar { width: 96px; min-width: 96px; padding: 0; }
.hsb-ln > span.bar i { position: relative; display: block; height: 10px; border-radius: 3px; background: var(--ink-2); }
.hsb-ln > span.bar b { display: block; height: 10px; margin-right: 10px; border-radius: 3px; background: rgba(255, 255, 255, 0.04); }
.hsb-ln .a { color: #8a8fa8; margin-right: 8px; }
.hsb-lv.focus .hsb-ln { opacity: 0.35; }
.hsb-lv.focus .hsb-ln.hl { opacity: 1; background: rgba(255, 255, 255, 0.07); }
.hsb-lv.focus .hsb-ln.hl > span.bar i { background: var(--ink); }
.hsb-ln.src { font-size: 12.5px; }
/* source lines wrap, so the roll-up bars never scroll out of a narrow panel */
.hsb-ln.src > span:first-child { white-space: pre-wrap; overflow-wrap: anywhere; }

/* ── Nsight Systems · mock timeline ── */
.hsb-ns { display: grid; gap: 10px; }
.hsb-ns-cv { position: relative; border: 1px solid var(--line); border-radius: 10px; background: #0a0b11; overflow: hidden; touch-action: pan-y; cursor: grab; }
.hsb-ns-cv:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.hsb-ns-cv.drag { cursor: grabbing; }
.hsb-ns-bar { display: flex; flex-wrap: wrap; gap: 8px 14px; align-items: center; }
.hsb-ns-bar .seg button { min-width: 34px; }
.hsb-insp { font: 500 12px/1.5 var(--font-mono); color: var(--ink-2); border: 1px solid var(--line); border-radius: 10px; background: rgba(8, 9, 14, 0.6); padding: 8px 10px; min-height: 3.2em; }
.hsb-insp b { color: var(--ink); font-weight: 600; }
.hsb-rules { display: grid; gap: 8px; grid-template-columns: minmax(0, 1fr); }
.hsb-rules.two { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
.hsb-rule { border: 1px solid var(--line); border-radius: 10px; background: var(--surface); padding: 9px 11px 10px; display: grid; gap: 5px; align-content: start; }
.hsb-rule.hit { border-color: rgba(255, 91, 110, 0.45); }
.hsb-rule.clean { border-color: rgba(69, 212, 155, 0.4); }
.hsb-rule-h { display: flex; justify-content: space-between; gap: 8px; align-items: baseline; flex-wrap: wrap; }
.hsb-rule-h b { font: 600 12.5px var(--font-mono); color: var(--ink); }
.hsb-rule-h span { font: 500 10.5px var(--font-mono); color: var(--ink-3); }
.hsb-rule p { font-size: 13px; line-height: 1.45; color: var(--ink-2); }
.hsb-rule .res { font: 600 12px/1.45 var(--font-mono); }
.hsb-rule .res.hit { color: var(--danger); } .hsb-rule .res.clean { color: var(--core); }
.hsb-rule .adv { font-size: 12.5px; color: var(--ink-3); }
.hsb-rule .adv b { color: var(--ink-2); font-weight: 600; }
.hsb-rule-f { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-top: 2px; }
.hsb-rule-f .switch { font-size: 11.5px; }

/* ── Nsight Systems · tracing vs sampling ── */
.hsb-sw-flag { background: #0a0b11; box-shadow: inset 0 0 0 1.5px var(--danger); }
.hsb-sw-low { background: linear-gradient(to top, rgba(255, 91, 110, 0.8) 0 45%, transparent 45%); box-shadow: inset 0 0 0 1px var(--line-2); }
.hsb-rule-f .btn[aria-pressed="true"] { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-a); color: var(--ink); }
.hsb-rule-f .hsb-sub { margin-top: 0; }
.hsb-sw-hatch { background: repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.16) 0 2px, transparent 2px 5px); box-shadow: inset 0 0 0 1px var(--line-2); }
.hsb-tvs { display: grid; gap: 6px; margin-top: 12px; }
.hsb-tvs-r { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 0.6fr) minmax(0, 1fr) minmax(0, 1.1fr); gap: 4px 12px; align-items: start; font: 500 12px/1.35 var(--font-mono); color: var(--ink-2); padding: 7px 10px; border: 1px solid var(--line); border-radius: 9px; background: rgba(8, 9, 14, 0.5); }
.hsb-tvs-r.h { background: none; border: 0; padding: 0 10px; font-size: 9.5px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-3); }
.hsb-tvs-r b { color: var(--ink); font-weight: 600; }
.hsb-tvs-r small { display: block; font-size: 10.5px; color: var(--ink-3); margin-top: 2px; }
.hsb-tvs-r .sw { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 7px; vertical-align: -1px; }
.hsb-tvs-bar { position: relative; display: block; height: 7px; border-radius: 4px; background: rgba(255, 255, 255, 0.06); margin-top: 5px; }
.hsb-tvs-bar i { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 4px; }
.hsb-tvs-bar u { position: absolute; top: -3px; bottom: -3px; width: 2px; margin-left: -1px; background: var(--ink); }
@media (max-width: 600px) {
  .hsb-tvs-r { grid-template-columns: minmax(0, 0.8fr) minmax(0, 1fr) minmax(0, 1.2fr); }
  .hsb-tvs-r > span:first-child { grid-column: 1 / -1; }
  .hsb-tvs-r.h > span:first-child { display: none; }
}

/* ── CUDA Binary Utilities ── */
.hsb-bx { display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); grid-template-areas: "cmds" "diag" "term"; }
.hsb-bx.two { grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr); grid-template-areas: "diag cmds" "diag term"; grid-template-rows: auto 1fr; column-gap: 14px; }
.hsb-bx > .bx-cmds { grid-area: cmds; min-width: 0; }
.hsb-bx > .bx-diag { grid-area: diag; }
.hsb-bx > .hsb-term { grid-area: term; margin-top: 0; align-self: start; }
/* phones: the commands become one scrolling row right above the diagram they light up */
.hsb-bx:not(.two) .hsb-cmds { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: thin; }
.hsb-bx:not(.two) .hsb-cmdb { flex: none; width: auto; white-space: nowrap; }
.hsb-nest { border-radius: 10px; padding: 7px 9px 9px; border: 1px solid var(--line-2); background: rgba(8, 9, 14, 0.5); font: 500 11.5px/1.4 var(--font-mono); color: var(--ink-2); transition: border-color 0.2s, box-shadow 0.2s, opacity 0.2s; }
.hsb-nest + .hsb-nest { margin-top: 6px; }
.hsb-nest > .hsb-nest-h { display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
.hsb-nest > .hsb-nest-h b { color: var(--ink); font-weight: 600; }
.hsb-nest > .hsb-nest-h span { color: var(--ink-3); }
.hsb-nest .hsb-nest { margin-top: 6px; }
.hsb-nest.host { border-color: rgba(184, 164, 255, 0.45); }
.hsb-nest.sass { border-color: rgba(69, 212, 155, 0.5); background: var(--core-a); }
.hsb-nest.ptxn { border-style: dashed; border-color: var(--ink-3); }
.hsb-nest.meta { border-color: var(--line-2); }
.hsb-nest.lit { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-a); }
.hsb-nest.rej { border-color: var(--danger); box-shadow: 0 0 0 2px var(--danger-a); }
.hsb-bxw.dimall .hsb-nest:not(.lit):not(.rej):not(.keep) { opacity: 0.55; }
.hsb-xfile { margin-top: 10px; opacity: 0.25; transition: opacity 0.3s; }
.hsb-xfile.on { opacity: 1; }
.hsb-xfile .hsb-k { margin-bottom: 4px; }
.hsb-cmds { display: grid; gap: 4px; }
.hsb-cmdb { display: flex; gap: 8px; align-items: baseline; text-align: left; width: 100%; cursor: pointer; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); padding: 6px 9px; font: 500 11.5px/1.4 var(--font-mono); color: var(--ink-2); }
.hsb-cmdb:hover { border-color: var(--ink-3); color: var(--ink); }
.hsb-cmdb[aria-pressed="true"] { border-color: var(--accent); color: var(--ink); background: var(--surface-2); }
.hsb-cmdb i { font-style: normal; color: var(--ink-3); flex: none; min-width: 5.2em; }
.hsb-cmdb[aria-pressed="true"] i { color: var(--accent); }
.hsb-term { margin-top: 10px; border: 1px solid var(--line); border-radius: 10px; background: #07080c; overflow: hidden; }
.hsb-term-h { padding: 6px 10px; border-bottom: 1px solid var(--line); background: var(--surface); font: 500 10.5px var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-3); display: flex; justify-content: space-between; gap: 8px; }
.hsb-term-h span:last-child { text-transform: none; letter-spacing: 0; }
.hsb-term pre { margin: 0; padding: 9px 12px; font: 12px/1.6 var(--font-mono); color: #d4d7e6; overflow-x: auto; max-height: 330px; scrollbar-width: thin; }
.hsb-term .cm { color: #6c7290; font-style: italic; white-space: pre-wrap; }
.hsb-term .pr { color: var(--core); }
.hsb-cfg { display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); }
.hsb-cfg.two { grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr); }
.hsb-lst { border: 1px solid var(--line); border-radius: 10px; background: #090a10; overflow: hidden; min-width: 0; }
.hsb-lst pre { margin: 0; padding: 6px 0; overflow-x: auto; font: 11.5px/1.62 var(--font-mono); color: #d4d7e6; max-height: 520px; scrollbar-width: thin; }
.hsb-lst .l { display: block; padding: 0 12px; white-space: pre; transition: background 0.15s, opacity 0.15s; }
.hsb-lst.focus .l { opacity: 0.35; }
.hsb-lst.focus .l.hl { opacity: 1; background: rgba(69, 212, 155, 0.1); }
.hsb-lst .l.mk { color: var(--control); }
.hsb-cfgsvg svg { display: block; width: 100%; height: auto; }
.hsb-cfg:not(.two) > .hsb-cfgsvg { order: -1; }
.hsb-cfgsvg g[data-b] { cursor: pointer; }
.hsb-cfgsvg g[data-b]:focus { outline: none; }
.hsb-cfgsvg g[data-b]:focus-visible rect { stroke: var(--accent); stroke-width: 2; }
`);

  /* Fig: CPU and GPU clocks, with and without CUPTI's synchronisation */
  function clockSync(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Two clocks, one timeline',
      hint: 'toggle the sync · drag the clock error',
      wide: true,
      caption: 'A made-up trace of one short CUDA program: host API calls on top, the GPU work they caused below. Numbers link each call to its GPU activity (CUPTI calls this a correlation ID). With synchronisation off, the GPU’s own timestamps are drawn as if they were CPU times; with it on, dashed outlines keep showing where those raw timestamps would have put each activity. The clock error is exaggerated so that it is visible over a few hundred microseconds; real clocks drift far more slowly, but over a long run even a small rate difference adds up.',
    });
    const wrap = el('div', { class: 'hsb-w hsb-svgw' });
    f.stage.append(wrap);
    const key = el('div', { class: 'hsb-key', html: '<span><b>1</b> cudaMemcpyAsync → memcpy HtoD</span><span><b>2 3 4</b> cudaLaunchKernel → kernels A, B, C</span><span><b>5</b> cudaMemcpyAsync → memcpy DtoH</span><span><b>sync</b> cudaStreamSynchronize waits for it all</span>' });
    wrap.after(key);
    const API = [
      { n: '1', name: 'cudaMemcpyAsync', t0: 0, t1: 14, c: 1 },
      { n: '2', name: 'cudaLaunchKernel', t0: 18, t1: 25, c: 2 },
      { n: '3', name: 'cudaLaunchKernel', t0: 28, t1: 35, c: 3 },
      { n: '4', name: 'cudaLaunchKernel', t0: 38, t1: 45, c: 4 },
      { n: '5', name: 'cudaMemcpyAsync', t0: 48, t1: 58, c: 5 },
      { n: 'sync', name: 'cudaStreamSynchronize', t0: 62, t1: 334, c: 0 },
    ];
    const DEV = [
      { n: '1', name: 'memcpy HtoD', t0: 16, t1: 76, c: 1, mem: true },
      { n: '2', name: 'kernel A', t0: 80, t1: 148, c: 2 },
      { n: '3', name: 'kernel B', t0: 150, t1: 232, c: 3 },
      { n: '4', name: 'kernel C', t0: 234, t1: 290, c: 4 },
      { n: '5', name: 'memcpy DtoH', t0: 294, t1: 330, c: 5, mem: true },
    ];
    const st = { sync: false, off: -120, rate: 4 };
    let width = 0;
    const stE = GG.ui.stat(f.readouts, { label: 'largest timestamp error', value: '' });
    const stO = GG.ui.stat(f.readouts, { label: 'GPU work "before" its launch', value: '' });
    const stC = GG.ui.stat(f.readouts, { label: 'correlated pairs', value: '5' });

    const raw = (t) => t * (1 + st.rate / 100) + st.off;
    function shown(t) { return st.sync ? t : raw(t); }

    function draw() {
      const W = Math.max(280, width);
      const narrow = W < 520;
      const lx = narrow ? 44 : 78;
      const disp = DEV.map((d) => ({ ...d, s0: shown(d.t0), s1: shown(d.t1), r0: raw(d.t0), r1: raw(d.t1) }));
      // the axis covers the raw timestamps too, so toggling the sync moves the bars, not the axis
      const lo = Math.min(0, ...disp.map((d) => d.r0)) - 12;
      const hi = Math.max(340, ...disp.map((d) => d.r1)) + 10;
      const X = (t) => lx + ((t - lo) / (hi - lo)) * (W - lx - 6);
      // phones: the five host calls share ~60 µs, too few pixels to tell apart, so they get a magnified inset
      const top = narrow ? 36 : 0;
      const yA = 34 + top, yG = 106 + top, h = 22, ay = 158 + top, H = 186 + top;
      const svg = S('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': st.sync ? 'Host API calls and GPU activities aligned on one timeline; each GPU activity starts after the call that caused it. Dashed outlines show where the raw GPU timestamps would have put them.' : 'Host API calls and GPU activities plotted with unconverted GPU timestamps; some GPU activities appear to start before the calls that caused them.' });
      Tx(svg, lx - 8, yA + 15, narrow ? 'CPU' : 'CPU · API', { 'text-anchor': 'end', 'font-size': 11, fill: 'var(--ink-3)' });
      Tx(svg, lx - 8, yG + 15, narrow ? 'GPU' : 'GPU · work', { 'text-anchor': 'end', 'font-size': 11, fill: 'var(--ink-3)' });
      S('rect', { x: lx, y: yA - 2, width: W - lx - 6, height: h + 4, fill: 'rgba(255,255,255,0.025)', rx: 4 }, svg);
      S('rect', { x: lx, y: yG - 2, width: W - lx - 6, height: h + 4, fill: 'rgba(255,255,255,0.025)', rx: 4 }, svg);
      // host time zero
      S('line', { x1: X(0), x2: X(0), y1: yA - 20, y2: yG + h + 22, stroke: 'var(--line-2)', 'stroke-dasharray': '2 3' }, svg);
      if (!narrow) Tx(svg, X(0) + 3, 12, 'program start, t = 0 on the CPU clock', { 'font-size': 10, fill: 'var(--ink-3)' });
      if (narrow) {
        // inset: 0–60 µs of host time, magnified
        const i0 = -2, i1 = 62, iy = 16, ih = 16;
        const XI = (t) => lx + ((t - i0) / (i1 - i0)) * (W - lx - 6);
        Tx(svg, lx - 8, iy + 12, '×' + GG.fmt.int((hi - lo) / (i1 - i0)), { 'text-anchor': 'end', 'font-size': 10, fill: 'var(--ink-3)' });
        Tx(svg, lx, iy - 5, 'host calls 0–60 µs, magnified', { 'font-size': 10, fill: 'var(--ink-3)' });
        S('rect', { x: lx, y: iy, width: W - lx - 6, height: ih, fill: 'rgba(255,255,255,0.025)', rx: 3 }, svg);
        API.filter((a) => a.c).forEach((a) => {
          const xa = XI(Math.max(i0, a.t0)), xb = XI(Math.min(i1, a.t1));
          S('rect', { x: xa, y: iy, width: Math.max(1, xb - xa - 1), height: ih, rx: 2, fill: a.c ? 'var(--control)' : 'rgba(255,198,92,0.35)' }, svg);
          Tx(svg, (xa + xb) / 2, iy + 11.5, a.n, { 'text-anchor': 'middle', 'font-size': 10, fill: '#1d1405', 'font-weight': 600 });
        });
        // leader lines from the inset to the stretch of the CPU row it magnifies
        const b0 = X(i0), b1 = X(i1);
        S('path', { d: `M${lx},${iy + ih} L${b0},${yA - 4} M${W - 6},${iy + ih} L${b1},${yA - 4} M${b0},${yA - 4} L${b1},${yA - 4}`, fill: 'none', stroke: 'var(--ink-3)', 'stroke-width': 0.8, 'stroke-dasharray': '2 2' }, svg);
      }
      const tight = X(18) - X(8) < 12; // numbers above neighbouring calls would touch: stagger them
      let bad = 0, err = 0;
      // correlation lines first (under the bars)
      disp.forEach((d) => {
        const a = API.find((q) => q.c === d.c);
        const backwards = d.s0 < a.t0;
        if (backwards) bad++;
        err = Math.max(err, Math.abs(d.s0 - d.t0), Math.abs(d.s1 - d.t1));
        S('path', { d: `M${X((a.t0 + a.t1) / 2)},${yA + h} C${X((a.t0 + a.t1) / 2)},${yA + h + 26} ${X(d.s0)},${yG - 26} ${X(d.s0)},${yG}`, fill: 'none', stroke: backwards ? 'var(--danger)' : 'var(--ink-3)', 'stroke-width': backwards ? 1.6 : 1.1, 'stroke-dasharray': backwards ? '' : '3 3' }, svg);
      });
      // API bars
      API.forEach((a) => {
        const x = X(a.t0), w = Math.max(2, X(a.t1) - X(a.t0));
        const r = S('rect', { x, y: yA, width: w, height: h, rx: 3, fill: a.c ? 'var(--control)' : 'rgba(255,198,92,0.35)' }, svg);
        S('title', {}, r).textContent = `${a.name}: CPU ${a.t0}–${a.t1} µs`;
        if (a.c) { if (!narrow) Tx(svg, x + w / 2, yA - (tight && a.c % 2 === 0 ? 14 : 5), a.n, { 'text-anchor': 'middle', 'font-size': 10.5, fill: 'var(--ink)', 'font-weight': 600 }); }
        else if (w > 210) Tx(svg, x + 6, yA + 15, 'cudaStreamSynchronize: waiting', { 'font-size': 10.5, fill: '#1d1405' });
        else if (w > 140) Tx(svg, x + 6, yA + 15, 'cudaStreamSynchronize', { 'font-size': 10.5, fill: '#1d1405' });
        else if (w > 40) Tx(svg, x + 5, yA + 15, 'sync', { 'font-size': 10.5, fill: '#1d1405' });
      });
      // with the sync on, the raw (uncorrected) GPU timestamps stay visible as ghosts
      if (st.sync) {
        disp.forEach((d) => {
          const x = X(d.r0), w = Math.max(2, X(d.r1) - X(d.r0));
          S('rect', { x: x + 0.5, y: yG + 0.5, width: w - 1, height: h - 1, rx: 3, fill: 'none', stroke: 'var(--ink-3)', 'stroke-width': 1, 'stroke-dasharray': '3 2', opacity: 0.8 }, svg);
        });
      }
      // GPU bars
      disp.forEach((d) => {
        const a = API.find((q) => q.c === d.c);
        const backwards = d.s0 < a.t0;
        const x = X(d.s0), w = Math.max(2, X(d.s1) - X(d.s0));
        const r = S('rect', { x, y: yG, width: w, height: h, rx: 3, fill: d.mem ? 'var(--memory)' : 'var(--core)', stroke: backwards ? 'var(--danger)' : 'none', 'stroke-width': 2, opacity: st.sync ? 0.92 : 1 }, svg);
        S('title', {}, r).textContent = `${d.name}: true GPU time ${d.t0}–${d.t1} µs, drawn at ${GG.fmt.fixed(d.s0, 1)}–${GG.fmt.fixed(d.s1, 1)} µs`;
        Tx(svg, x + w / 2, yG + h + 13, d.n, { 'text-anchor': 'middle', 'font-size': 10.5, fill: backwards ? 'var(--danger)' : 'var(--ink)', 'font-weight': 600 });
        const short = d.name.replace('memcpy ', '').replace('kernel ', 'k');
        const label = !narrow && w > d.name.length * 6.6 + 8 ? d.name : w > short.length * 6.6 + 8 ? short : '';
        if (label) Tx(svg, x + 5, yG + 15, label, { 'font-size': 10.5, fill: d.mem ? '#08111f' : '#07140e' });
      });
      // axis
      S('line', { x1: lx, x2: W - 6, y1: ay, y2: ay, stroke: 'var(--line-2)' }, svg);
      const step = niceStep((hi - lo) / (narrow ? 3.5 : 7));
      for (let t = Math.ceil(lo / step) * step; t <= hi; t += step) {
        const x = X(t);
        S('line', { x1: x, x2: x, y1: ay, y2: ay + 4, stroke: 'var(--ink-3)' }, svg);
        Tx(svg, x, ay + 16, `${GG.fmt.int(Math.round(t) + 0)} µs`, { 'text-anchor': 'middle', 'font-size': 10, fill: 'var(--ink-3)' });
      }
      wrap.innerHTML = '';
      wrap.append(svg);
      stE.set(err < 0.05 ? '0 µs' : fmtT(err), err < 0.05 ? 'core' : 'danger');
      stO.set(String(bad), bad ? 'danger' : 'core');
      const kA = disp[1];
      if (st.sync) {
        f.setWhy(`With CUPTI’s synchronisation on, every GPU timestamp is converted to the CPU’s timebase. Each activity now starts <b>after</b> the call that caused it, and the gap between a call and its GPU work is real time you can measure. Here it is mostly <b>queueing</b> in the stream: kernel A is launched at ${fmtT(API[1].t0)} but starts at ${fmtT(DEV[1].t0)}, after the copy in front of it ends at ${fmtT(DEV[0].t1)}, and kernels B and C each wait for the kernel before them. The sliders now move only the dashed ghosts: the raw GPU timestamps that CUPTI corrects.`);
      } else if (err < 0.05) {
        f.setWhy('With zero offset and zero rate error the two clocks happen to agree, so even unconverted timestamps line up. Real clocks start at different times and tick at slightly different rates: move the sliders.');
      } else {
        f.setWhy(`Plotted without conversion, the GPU’s timestamps are off by up to <b>${fmtT(err)}</b>. ${kA.s0 < API[1].t0 ? `Kernel A appears to start <b>${fmtT(API[1].t0 - kA.s0)}</b> before <code>cudaLaunchKernel</code> even began, which is impossible.` : 'Every kernel appears shifted against the call that launched it.'} ${bad ? `<b>${bad}</b> of 5 GPU activities seem to happen before their own launch.` : ''} The profile would be lying.`);
      }
    }
    GG.ui.toggle(f.controls, { label: 'CUPTI timestamp synchronisation', value: false, onChange: (v) => { st.sync = v; draw(); } });
    GG.ui.slider(f.controls, { label: 'GPU clock offset', min: -250, max: 250, step: 5, value: st.off, format: (v) => (v > 0 ? '+' : '') + v + ' µs', onInput: (v) => { st.off = v; draw(); } });
    GG.ui.slider(f.controls, { label: 'GPU clock rate error', min: 0, max: 8, step: 0.5, value: st.rate, format: (v) => '+' + GG.fmt.fixed(v, 1) + '%', ariaLabel: 'GPU clock rate error, exaggerated', onInput: (v) => { st.rate = v; draw(); } });
    onWidth(wrap, (w) => { width = w; draw(); });
  }

  /* Fig: who consumes CUPTI */
  function cuptiConsumers(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Where CUPTI sits',
      hint: 'pick a consumer · hover an API',
      wide: true,
      caption: 'Tools sit on top of CUPTI; CUPTI hooks into the CUDA stack underneath your application. API names follow NVIDIA’s CUPTI documentation and the one-line descriptions paraphrase it; the older Profiling API, deprecated in CUDA 13.0 in favour of Range Profiling, is left out. The glossary names Nsight Systems and the PyTorch Profiler as consumers.',
    });
    const box = el('div', { class: 'hsb-stack' });
    f.stage.append(box);
    const CONS = [
      { k: 'nsys', name: 'Nsight Systems', text: 'NVIDIA’s system-wide profiler (next entry).', why: '<b>Nsight Systems</b> draws a timeline of your whole program: CPU threads, CUDA API calls and GPU kernels and copies, on one clock. The GPU half of that picture, and its alignment with the CPU half, come through CUPTI.' },
      { k: 'torch', name: 'PyTorch Profiler', text: 'torch.profiler: which ops ran, and which kernels they launched.', why: 'The <b>PyTorch Profiler</b> records PyTorch operators on the CPU and the CUDA kernels they launched, then exports a trace. Its CUDA side is built on CUPTI (through Kineto, PyTorch’s profiling library). Modal’s docs show it in action.' },
      { k: 'own', name: 'Your own tool', text: 'CUPTI has C and Python APIs.', why: 'Anyone can build on CUPTI: NVIDIA describes it as providing <b>C and Python APIs for building profiling and tracing tools</b>. A tool subscribes, enables the activity kinds or callbacks it wants, and receives records in buffers.' },
    ];
    const APIS = [
      ['Activity API', 'Asynchronously record CUDA activities, e.g. CUDA API calls, kernels and memory copies, with timestamps.'],
      ['Callback API', 'Get notified on specific CUDA events, such as entry to and exit from a CUDA API function.'],
      ['PC Sampling API', 'Sample the warp program counter and warp scheduler state: which SASS instruction each sampled warp is at, and why it is stalled.'],
      ['SASS Metrics API', 'Collect kernel performance metrics at the source level by patching the SASS.'],
      ['Range Profiling API', 'Collect hardware performance metrics for a range of execution.'],
      ['Host Profiling API', 'Enumerate, configure and evaluate performance metrics on the host.'],
      ['PM Sampling API', 'Sample the GPU’s hardware performance monitors periodically.'],
      ['Checkpoint API', 'Save and restore the functional state of the CUDA device.'],
    ];
    box.innerHTML = `<div class="hsb-cons" data-v="cons"></div>
      <div class="hsb-flow">↓ subscribe, enable, receive records ↓</div>
      <div class="hsb-layer cupti"><div class="hsb-k">CUPTI · libcupti</div><div class="hsb-apis" data-v="apis"></div><div class="hsb-dec" data-v="apid" aria-live="polite">Hover or focus an API for what it does.</div></div>
      <div class="hsb-flow">↓ hooks into ↓</div>
      <div class="hsb-layer"><div class="hsb-k">your application → CUDA Runtime and Driver APIs → NVIDIA GPU drivers</div><div style="font-size:13px;color:var(--ink-2)">Every <code>cudaLaunchKernel</code>, <code>cudaMemcpy</code> and synchronization passes through here, which is where CUPTI can observe it and timestamp it.</div></div>
      <div class="hsb-flow">↓</div>
      <div class="hsb-layer gpu"><div class="hsb-k">GPU</div><div style="font-size:13px;color:var(--ink-2)">Kernels, copies and memsets run here, stamped by the GPU’s own clock and translated into CPU time by CUPTI.</div></div>`;
    const V = {};
    $$(box, '[data-v]').forEach((n) => { V[n.getAttribute('data-v')] = n; });
    const btns = CONS.map((c, i) => {
      const b = el('button', { type: 'button', class: 'hsb-con', 'aria-pressed': 'false', html: `<b>${esc(c.name)}</b>${esc(c.text)}` });
      b.addEventListener('click', () => pick(i));
      V.cons.append(b);
      return b;
    });
    APIS.forEach(([n, d]) => {
      const a = el('span', { class: 'hsb-api', tabindex: '0', text: n });
      const show = () => { $$(V.apis, '.hsb-api').forEach((x) => x.classList.remove('on')); a.classList.add('on'); V.apid.innerHTML = `<b>${esc(n)}</b>: ${esc(d)}`; };
      a.addEventListener('mouseenter', show);
      a.addEventListener('focus', show);
      a.addEventListener('click', show);
      V.apis.append(a);
    });
    function pick(i) {
      btns.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
      f.setWhy(CONS[i].why);
    }
    pick(0);
  }

  /* The add kernel from NVIDIA's CUDA Binary Utilities docs, at three levels */
  const ADD_SRC = [
    '__global__ void add(float *a, float *b, float *c) {',
    '  int i = blockIdx.x * blockDim.x + threadIdx.x;',
    '  c[i] = a[i] + b[i];',
    '}',
  ];
  const ADD_PTX = [
    ['.visible .entry _Z3addPfS_S_( … three .param .u64 pointers … )', 1],
    ['ld.param.u64 %rd1, [_Z3addPfS_S__param_0];', 1],
    ['ld.param.u64 %rd2, [_Z3addPfS_S__param_1];', 1],
    ['ld.param.u64 %rd3, [_Z3addPfS_S__param_2];', 1],
    ['cvta.to.global.u64 %rd4, %rd3;', 1],
    ['cvta.to.global.u64 %rd5, %rd2;', 1],
    ['cvta.to.global.u64 %rd6, %rd1;', 1],
    ['mov.u32 %r1, %tid.x;', 2],
    ['mov.u32 %r2, %ctaid.x;', 2],
    ['mov.u32 %r3, %ntid.x;', 2],
    ['mad.lo.s32 %r4, %r2, %r3, %r1;', 2],
    ['mul.wide.s32 %rd7, %r4, 4;', 3],
    ['add.s64 %rd8, %rd6, %rd7;', 3],
    ['ld.global.f32 %f1, [%rd8];', 3],
    ['add.s64 %rd9, %rd5, %rd7;', 3],
    ['ld.global.f32 %f2, [%rd9];', 3],
    ['add.f32 %f3, %f1, %f2;', 3],
    ['add.s64 %rd10, %rd4, %rd7;', 3],
    ['st.global.f32 [%rd10], %f3;', 3],
    ['ret;', 4],
  ];
  const ADD_SASS = [
    ['0000', 'LDC R1, c[0x0][0x37c] ;', 1, 3],
    ['0010', 'S2R R9, SR_TID.X ;', 2, 9],
    ['0020', 'S2UR UR6, SR_CTAID.X ;', 2, 4],
    ['0030', 'LDCU.64 UR4, c[0x0][0x358] ;', 1, 3],
    ['0040', 'LDC R0, c[0x0][0x360] ;', 2, 5],
    ['0050', 'LDC.64 R2, c[0x0][0x380] ;', 1, 4],
    ['0060', 'LDC.64 R4, c[0x0][0x388] ;', 1, 3],
    ['0070', 'IMAD R9, R0, UR6, R9 ;', 2, 6],
    ['0080', 'LDC.64 R6, c[0x0][0x390] ;', 1, 2],
    ['0090', 'IMAD.WIDE R2, R9, 0x4, R2 ;', 3, 11],
    ['00a0', 'LDG.E R2, desc[UR4][R2.64] ;', 3, 7],
    ['00b0', 'IMAD.WIDE R4, R9, 0x4, R4 ;', 3, 2],
    ['00c0', 'LDG.E R5, desc[UR4][R4.64] ;', 3, 5],
    ['00d0', 'IMAD.WIDE R6, R9, 0x4, R6 ;', 3, 2],
    ['00e0', 'FADD R9, R2, R5 ;', 3, 131],
    ['00f0', 'STG.E desc[UR4][R6.64], R9 ;', 3, 21],
    ['0100', 'EXIT ;', 4, 12],
    ['0110', 'BRA 0x110;', 0, 0],
  ];

  /* Fig: one kernel seen as CUDA C++, PTX and SASS */
  function threeLevels(host, ctx) {
    const f = ctx.figure(host, {
      title: 'One kernel, three levels',
      hint: 'hover or tap a line',
      wide: true,
      caption: 'PTX and SASS are NVIDIA’s own compiler output for this <code>add</code> kernel (sm_100), from the CUDA Binary Utilities documentation, abridged; we reconstructed the three-line source from the PTX. The mapping of instructions to source lines and all sample counts are illustrative: a real tool reads the mapping from line information in the binary and the counts from the hardware.',
    });
    const box = el('div', { class: 'hsb-lv' });
    f.stage.append(box);
    const total = ADD_SASS.reduce((a, r) => a + r[3], 0);
    const perLine = [0, 0, 0, 0, 0];
    ADD_SASS.forEach((r) => { perLine[r[2]] += r[3]; });
    const maxS = Math.max(...ADD_SASS.map((r) => r[3]));
    const maxL = Math.max(...perLine);
    const lineHTML = (code, lang, src, n, maxN, addr, cls) => `<div class="hsb-ln ${cls || ''} ${n == null ? 'nobar' : ''}" data-src="${src}" tabindex="0">${addr ? `<span><span class="a">/*${addr}*/</span>${GG.highlightLine(code, lang)}</span>` : `<span>${GG.highlightLine(code, lang)}</span>`}${n == null ? '' : `<span class="bar" title="${n} samples"><b><i style="width:${(n / maxN) * 100}%"></i></b></span>`}</div>`;
    const cpp = `<div class="hsb-lvp"><div class="hsb-lvp-h"><span>CUDA C++ · what you wrote</span><span>samples, rolled up by line</span></div><div class="hsb-lvp-b"><div class="hsb-tbl">${ADD_SRC.map((c, i) => lineHTML(`${i + 1}  ${c}`, 'cpp', i + 1, perLine[i + 1], maxL, '', 'src')).join('')}</div></div></div>`;
    const ptx = `<div class="hsb-lvp"><div class="hsb-lvp-h"><span>PTX · the virtual ISA</span><span>never executes</span></div><div class="hsb-lvp-b"><div class="hsb-tbl">${ADD_PTX.map(([c, l]) => lineHTML(c, 'ptx', l, null, 1, '')).join('')}</div></div></div>`;
    const sass = `<div class="hsb-lvp"><div class="hsb-lvp-h"><span>SASS · what the SM runs</span><span>samples per instruction</span></div><div class="hsb-lvp-b"><div class="hsb-tbl">${ADD_SASS.map(([a, c, l, n]) => lineHTML(c, 'sass', l, n, maxS, a)).join('')}</div></div></div>`;
    box.innerHTML = cpp + `<div class="hsb-lv-2">${ptx}${sass}</div>`;
    const two = box.querySelector('.hsb-lv-2');
    onWidth(box, (w) => two.classList.toggle('two', w >= 700));
    const lines = $$(box, '.hsb-ln');
    const WHY = {
      0: 'The trailing <code>BRA</code> branches to itself: padding after <code>EXIT</code> that never runs, so it maps to no source line and collects no samples.',
      1: `<b>Line 1</b>, the function entry and its three pointer parameters: <b>${perLine[1]}</b> of ${total} samples. In PTX the parameters are loaded with <code>ld.param</code>; in SASS the three pointers are read from the constant bank (<code>LDC.64</code> at <code>c[0x0][0x380]</code>, <code>0x388</code> and <code>0x390</code>). Two more constant loads count toward this line but belong to the kernel’s prologue rather than to a parameter: <code>R1</code>, the stack pointer, and <code>UR4</code>, the memory descriptor that every global load and store below uses (<code>desc[UR4]</code>).`,
      2: `<b>Line 2</b>, the index computation: <b>${perLine[2]}</b> of ${total} samples. Four PTX instructions (thread, block and block-size registers, then a multiply-add) become four SASS instructions (<code>S2R</code>, <code>S2UR</code>, <code>LDC</code>, <code>IMAD</code>).`,
      3: `<b>Line 3</b>, <code>c[i] = a[i] + b[i]</code>: <b>${perLine[3]}</b> of ${total} samples (${GG.fmt.pct(perLine[3] / total)}). Most land on <code>FADD</code>, the first instruction that needs the two values the <code>LDG</code> loads fetch from global memory. Warps wait there, so that is where a sampler finds them.`,
      4: `<b>Line 4</b>, the closing brace: the PTX <code>ret</code> and the SASS <code>EXIT</code>, <b>${perLine[4]}</b> of ${total} samples.`,
    };
    GG.ui.stat(f.readouts, { label: 'samples in all', value: GG.fmt.int(total) });
    const stLine = GG.ui.stat(f.readouts, { label: 'this line', value: '' });
    const stIns = GG.ui.stat(f.readouts, { label: 'its SASS instructions', value: '' });
    const stHot = GG.ui.stat(f.readouts, { label: 'its hottest instruction', value: '' });
    function focus(src) {
      box.classList.add('focus');
      lines.forEach((l) => l.classList.toggle('hl', +l.getAttribute('data-src') === src));
      const mine = ADD_SASS.filter((r) => r[2] === src);
      const hot = mine.reduce((b, r) => (r[3] > (b ? b[3] : -1) ? r : b), null);
      stLine.set(src ? `line ${src} · ${perLine[src]} of ${total} · ${GG.fmt.pct(perLine[src] / total)}` : `no line · 0 of ${total}`);
      stIns.set(String(mine.length));
      stHot.set(hot && hot[3] ? `${hot[1].split(/[ .]/)[0]} · ${hot[3]} samples` : '—');
      f.setWhy(WHY[src]);
    }
    lines.forEach((l) => {
      const src = +l.getAttribute('data-src');
      l.addEventListener('mouseenter', () => focus(src));
      l.addEventListener('focus', () => focus(src));
      l.addEventListener('click', () => focus(src));
    });
    focus(3);
  }

  GG.entry('cupti', {
    render(body, ctx) {
      body.classList.add('hsb-body');
      const s = ctx.html(body, `
<p>CUPTI is an interface for people who build tools: the profilers and tracers you actually look at are built on top of it. It can measure a kernel at each of the three levels the kernel exists in: the ${T('cuda-c', 'CUDA C++')} you wrote, its ${T('parallel-thread-execution', 'PTX')} and its ${T('streaming-assembler', 'SASS')}.</p>
<p>To <em>profile</em> a program is to measure where its time and resources go. For a GPU program that is two questions at once: what did the host do (which CUDA API calls, when, for how long), and what did the device do (which ${T('kernel', 'kernels')} and copies ran, when, and what happened inside them)? CUPTI can answer both. Critically, it synchronizes timestamps across the CPU host and the GPU device, so the two answers land on one timeline.</p>
<h3>Why the timestamps need synchronizing</h3>
<p>The CPU and the GPU each keep their own clock. The clocks start counting at different moments and tick at slightly different rates, so a raw GPU timestamp and a raw CPU timestamp cannot be compared directly. Put them on one axis without converting and the picture is wrong in ways that are easy to miss: kernels that seem to start before they were launched, gaps that are not there, overlaps that never happened. Toggle the conversion in Fig. 1.</p>
<div data-slot="clk" class="wide"></div>
${GG.noteHTML('beyond', '<p><b>Correlation IDs.</b> Lining up clocks is half of the job; the other half is knowing which GPU activity came from which call. CUPTI’s Activity API gives every CUDA Runtime or Driver API call a <em>correlation ID</em>, and every kernel, memcpy or memset record that the call produced carries the same ID. That is how a profiler can draw the arrow from a <code>cudaLaunchKernel</code> to its kernel. For ' + T('cuda-graph', 'CUDA Graphs') + ', records also carry a graph ID and a graph node ID. Kernel names come back mangled; NVIDIA points to <code>cu++filt</code>, one of the ' + T('cuda-binary-utilities', 'CUDA Binary Utilities') + ', to demangle them.</p>')}
<h3>Who uses CUPTI</h3>
<p>CUPTI’s interfaces are consumed by, for example, the ${T('nsight-systems', 'Nsight Systems profiler')} (the glossary styles it “NSight Systems Profiler” here; NVIDIA writes Nsight) and the <a href="https://modal.com/docs/examples/torch_profiling">PyTorch Profiler</a>.</p>
<div data-slot="cons" class="wide"></div>
<h3>C++, PTX and SASS</h3>
<p>The three levels in CUPTI’s description are the three forms a kernel takes: the ${T('cuda-c', 'CUDA C++')} you write, the ${T('parallel-thread-execution', 'PTX')} it is compiled to, and the ${T('streaming-assembler', 'SASS')} that actually runs on the ${T('streaming-multiprocessor', 'Streaming Multiprocessors')}. Measurements are taken on what runs, SASS, and can then be attributed back up to PTX and source lines. Fig. 3 shows one small kernel at all three levels.</p>
<div data-slot="lv" class="wide"></div>
${GG.noteHTML('beyond', '<p><b>Why the samples pile up on FADD.</b> A PC sampler periodically records, for some warp, which instruction it is at and whether it can issue. A warp that is waiting for data from ' + T('global-memory', 'global memory') + ' is not stuck on the load that requested it; the load issued long ago. It is stuck on the first instruction that <em>uses</em> the loaded value, here the <code>FADD</code>, waiting on the scoreboard (see ' + T('scoreboard-stall', 'scoreboard stall') + '). Hot spots in a sampled profile therefore often sit one or two instructions after the real cause.</p>')}
<p>You can find CUPTI’s documentation <a href="https://docs.nvidia.com/cupti/">here</a>. For details on using profiling tools for GPU applications running on Modal, see <a href="https://modal.com/docs/examples/torch_profiling">this example from Modal’s documentation</a>.</p>
<div data-slot="read"></div>`);
      guard(s.clk, 'Clock sync', () => clockSync(s.clk, ctx));
      guard(s.cons, 'Consumers', () => cuptiConsumers(s.cons, ctx));
      guard(s.lv, 'Three levels', () => threeLevels(s.lv, ctx));
      ctx.reading(s.read, [
        { href: 'https://docs.nvidia.com/cupti/', label: 'CUPTI documentation', note: 'the Activity, Callback, PC Sampling, SASS Metrics and profiling APIs; correlation IDs' },
        { href: 'https://modal.com/docs/examples/torch_profiling', label: 'Modal: profiling PyTorch code', note: 'the PyTorch Profiler, a CUPTI consumer, on Modal GPUs' },
      ]);
    },
  });

  /* ═════════════════════════════ Nsight Systems ═════════════════════════════ */

  /* Mock program: 3 iterations of prepare → copy in → 4 layers of kernels → copy out → (sync) */
  const NS_KERNELS = (() => {
    const small = [['bias_add', 4], ['gelu', 2], ['dropout', 2], ['layer_norm', 3], ['residual_add', 2], ['softmax', 2], ['transpose', 3], ['scale', 2], ['reduce', 2], ['copy', 2]];
    const out = [];
    for (let l = 0; l < 4; l++) { out.push(['gemm', 30]); small.forEach((k) => out.push(k)); }
    return out;
  })();

  function nsSimulate(fx) {
    const P = 220, H2D = 180, D2H = 20, L = 8, LG = 9, GAP = 1, ITERS = 3;
    const ev = { nvtx: [], cpu: [], api: [], kern: [], mem: [] };
    let h = 0, g = 0, corr = 0;
    const pushCpu = (state, a, b, what) => { if (b > a) ev.cpu.push({ state, t0: a, t1: b, what }); };
    for (let it = 0; it < ITERS; it++) {
      const n0 = h;
      pushCpu('py', h, h + P, 'prepare_batch()');
      h += P;
      // copy in
      {
        const c = ++corr;
        const s0 = Math.max(g, h + 2), s1 = s0 + H2D;
        g = s1;
        ev.mem.push({ name: 'memcpy HtoD', t0: s0, t1: s1, corr: c, bytes: '48 MiB', pageable: !fx.pinned });
        const e = fx.pinned ? h + 7 : s1 + 3;
        ev.api.push({ name: 'cudaMemcpyAsync', t0: h, t1: e, corr: c, rule: fx.pinned ? null : 'cuda_memcpy_async', what: 'x.to("cuda")' });
        pushCpu(fx.pinned ? 'api' : 'blocked', h, e, 'cudaMemcpyAsync');
        h = e;
      }
      // kernels
      if (fx.graph) {
        const c = ++corr;
        ev.api.push({ name: 'cudaGraphLaunch', t0: h, t1: h + LG, corr: c, what: 'graph.replay()' });
        pushCpu('api', h, h + LG, 'cudaGraphLaunch');
        h += LG;
        NS_KERNELS.forEach(([name, d], k) => {
          const s0 = Math.max(k === 0 ? h : 0, g + GAP);
          ev.kern.push({ name, t0: s0, t1: s0 + d, corr: c, graph: true });
          g = s0 + d;
        });
      } else {
        NS_KERNELS.forEach(([name, d]) => {
          const c = ++corr;
          ev.api.push({ name: 'cudaLaunchKernel', t0: h, t1: h + L, corr: c, what: name });
          pushCpu('api', h, h + L, 'cudaLaunchKernel');
          h += L;
          const s0 = Math.max(h, g + GAP);
          ev.kern.push({ name, t0: s0, t1: s0 + d, corr: c });
          g = s0 + d;
        });
      }
      // copy out
      {
        const c = ++corr;
        const s0 = Math.max(g + GAP, h + 2), s1 = s0 + D2H;
        g = s1;
        ev.mem.push({ name: 'memcpy DtoH', t0: s0, t1: s1, corr: c, bytes: '4 KiB', pageable: !fx.pinned });
        const e = fx.pinned ? h + 6 : s1 + 3;
        ev.api.push({ name: 'cudaMemcpyAsync', t0: h, t1: e, corr: c, rule: fx.pinned ? null : 'cuda_memcpy_async', what: 'loss.to("cpu")' });
        pushCpu(fx.pinned ? 'api' : 'blocked', h, e, 'cudaMemcpyAsync');
        h = e;
      }
      if (!fx.nosync || it === ITERS - 1) {
        const e = Math.max(h, g) + 3;
        ev.api.push({ name: 'cudaStreamSynchronize', t0: h, t1: e, corr: 0, rule: 'cuda_api_sync', what: 'loss.item()' });
        pushCpu('blocked', h, e, 'cudaStreamSynchronize');
        h = e;
      }
      ev.nvtx.push({ name: 'iteration ' + (it + 1), t0: n0, t1: h });
    }
    ev.end = Math.max(h, g);
    // GPU gaps and utilisation
    const gpu = [...ev.kern, ...ev.mem].sort((a, b) => a.t0 - b.t0);
    ev.gaps = [];
    for (let i = 1; i < gpu.length; i++) { const gap = gpu[i].t0 - gpu[i - 1].t1; if (gap > 50) ev.gaps.push({ t0: gpu[i - 1].t1, t1: gpu[i].t0 }); }
    const first = gpu[0].t0, last = gpu[gpu.length - 1].t1;
    const NCH = 40, cw = (last - first) / NCH;
    ev.util = [];
    for (let k = 0; k < NCH; k++) {
      const a = first + k * cw, b = a + cw;
      let busy = 0;
      for (const e of gpu) { const lo = Math.max(a, e.t0), hi = Math.min(b, e.t1); if (hi > lo) busy += hi - lo; }
      ev.util.push({ t0: a, t1: b, u: busy / cw });
    }
    ev.busy = gpu.reduce((s, e) => s + (e.t1 - e.t0), 0);
    ev.gpuSpan = [first, last];
    ev.blocked = ev.cpu.filter((c) => c.state === 'blocked').reduce((s, c) => s + c.t1 - c.t0, 0);
    // CPU samples every 20 µs
    ev.samples = [];
    for (let t = 10; t < h; t += 20) {
      const c = ev.cpu.find((q) => t >= q.t0 && t < q.t1);
      ev.samples.push({ t, state: c ? c.state : 'py', what: c ? c.what : 'prepare_batch()' });
    }
    return ev;
  }

  const NS_STACK = {
    'prepare_batch()': ['prepare_batch  train.py:41', 'main  train.py:70'],
    cudaLaunchKernel: ['cudaLaunchKernel  libcudart.so', 'at::native::… (op dispatch)  libtorch_cuda.so', 'Model.forward  train.py:57', 'main  train.py:72'],
    cudaGraphLaunch: ['cudaGraphLaunch  libcudart.so', 'CUDAGraph::replay  libtorch_cuda.so', 'main  train.py:72'],
    cudaMemcpyAsync: ['cudaMemcpyAsync  libcudart.so', 'at::native::copy_  libtorch_cuda.so', 'Tensor.to  train.py:43'],
    cudaStreamSynchronize: ['cudaStreamSynchronize  libcudart.so', 'Tensor.item  train.py:62', 'main  train.py:73'],
  };

  function nsNote(fx, fin) {
    const p = fx.pinned, n = fx.nosync, gr = fx.graph, nk = NS_KERNELS.length;
    const up = ' Compared with the same setup without a graph, host blocked mid-run goes <em>up</em>: launching is now so quick that the host reaches the next blocking call sooner and simply waits there longer.';
    if (p && n && gr) return `The CPU now runs ahead and the GPU works back to back: the GPU is the bottleneck, which is where you want to be. What is left is the first batch\u2019s preparation, before the GPU has anything to do. The host is no longer blocked mid-run at all; the ${fmtT(fin)} it spends waiting is all in the one final sync, an idle CPU waiting for a busy GPU, which is the healthy kind of waiting.`;
    if (p && n) return `The host now runs ahead into the next iteration, yet it is still the bottleneck: preparing a batch and then launching ${nk} kernels one by one takes it longer than the GPU needs for a whole iteration, so the GPU waits between iterations. This is where a CUDA Graph pays off.`;
    if (p && gr) return 'With pinned memory the kernel launches already hide behind the input copy, so the graph changes nothing yet. What remains is the per-iteration sync: the GPU idles while Python prepares the next batch.' + up;
    if (p) return 'The host no longer blocks in the input copy, so it launches the kernels while the copy runs and they are queued by the time the GPU needs them. The per-iteration sync remains: the GPU idles while Python prepares the next batch.';
    if (n && gr) return 'Launching is cheap now, but dropping the sync barely helps while copies come from pageable memory: each such copy waits for the GPU to finish, so the host stays in lock-step with it.' + up;
    if (n) return 'Dropping the per-iteration sync alone barely helps: a copy from pageable memory still waits for the GPU to finish, so the host stays in lock-step with it.';
    if (gr) return 'Launching is now cheap, so the kernels run back to back once the input has arrived, but every iteration still ends in a sync and the GPU idles while Python prepares the next batch.' + up;
    return '';
  }

  function nsightMock(host, ctx) {
    const f = ctx.figure(host, {
      title: 'A profile, Nsight Systems style',
      hint: 'hover · drag to pan · zoom · run the fixes',
      wide: true,
      caption: 'A mock trace of three iterations of a small PyTorch-style training loop, not a real capture: rows, colours and numbers are made up but follow the shape of an Nsight Systems timeline. Rule names and IDs are the Nsight Systems expert-system rules from NVIDIA’s documentation, with their descriptions and advice lightly abridged; the GPU Starvation threshold is lowered from its 500 ms default to fit this 2 ms trace. The fixes are ours. With the CUDA Graph fix on, the mock still draws every kernel of the graph, as <code>nsys profile --cuda-graph-trace=node</code> would; by default Nsight Systems traces each graph as one whole, which adds less overhead.',
    });
    const box = el('div', { class: 'hsb-ns' });
    f.stage.append(box);
    const cvWrap = el('div', { class: 'hsb-ns-cv', tabindex: '0', 'data-keys': '', role: 'group', 'aria-label': 'Timeline. Left and right arrow keys step through GPU activities; plus and minus zoom.' });
    box.append(cvWrap);
    const cv = GG.canvas(cvWrap, { height: (w) => (w < 520 ? 236 : 226) });
    box.append(el('div', { class: 'hsb-legend', style: { marginTop: '0' }, html: '<span><i class="hsb-sw-host"></i>CPU running Python</span><span><i class="hsb-sw-control"></i>CPU inside a CUDA API call</span><span><i class="hsb-sw-core"></i>kernel</span><span><i class="hsb-sw-memory"></i>memcpy</span><span><i class="hsb-sw-danger"></i>CPU blocked, waiting on the GPU</span><span><i class="hsb-sw-flag"></i>CUDA API call flagged by a rule</span><span><i class="hsb-sw-low"></i>GPU util. chunk under 50% busy</span>' }));
    const bar = el('div', { class: 'hsb-ns-bar' });
    box.append(bar);
    const insp = el('div', { class: 'hsb-insp', 'aria-live': 'polite' });
    box.append(insp);
    const rulesBox = el('div', { class: 'hsb-rules' });
    box.append(el('div', { class: 'hsb-k', text: 'Expert system · rules run over the trace' }), rulesBox);
    onWidth(rulesBox, (w) => rulesBox.classList.toggle('two', w >= 640));

    const fx = { pinned: false, nosync: false, graph: false };
    let ev = nsSimulate(fx);
    const view = { t0: 0, t1: ev.end };
    let showSamples = true, sel = null, hover = null, hlRange = null;
    let geom = null;

    const stW = GG.ui.stat(f.readouts, { label: 'wall time', value: '' });
    const stB = GG.ui.stat(f.readouts, { label: 'GPU busy', value: '', tone: 'core' });
    const stH = GG.ui.stat(f.readouts, { label: 'host blocked mid-run', value: '', tone: 'danger' });
    const stF = GG.ui.stat(f.readouts, { label: 'host waiting in the final sync', value: '' });

    function rows(W) {
      const narrow = W < 520;
      return {
        lx: narrow ? 62 : 92,
        list: [
          { k: 'nvtx', label: 'NVTX', y: 8, h: 16 },
          { k: 'cpu', label: narrow ? 'CPU' : 'CPU thread', y: 32, h: 24 },
          { k: 'api', label: 'CUDA API', y: 64, h: 20 },
          { k: 'kern', label: narrow ? 'kernels' : 'GPU kernels', y: 96, h: 22 },
          { k: 'mem', label: narrow ? 'memcpy' : 'GPU memcpy', y: 126, h: 18 },
          { k: 'util', label: narrow ? 'GPU util' : 'GPU util.', y: 154, h: 26 },
        ],
        axis: 196,
      };
    }

    function draw() {
      if (!cv.w) return;
      const c = GG.colors();
      const g = cv.ctx, W = cv.w, H = cv.h;
      g.clearRect(0, 0, W, H);
      const R = rows(W);
      const x0 = R.lx, x1 = W - 8, pw = x1 - x0;
      if (pw < 20) return;
      const span = view.t1 - view.t0;
      const X = (t) => x0 + ((t - view.t0) / span) * pw;
      geom = { R, X, x0, x1, pw };
      g.font = '500 10.5px "JetBrains Mono", ui-monospace, monospace';
      g.textBaseline = 'middle';
      // row labels + backgrounds
      for (const r of R.list) {
        g.fillStyle = 'rgba(255,255,255,0.025)';
        g.fillRect(x0, r.y, pw, r.h);
        g.fillStyle = c.ink3;
        g.textAlign = 'right';
        g.fillText(r.label, x0 - 8, r.y + r.h / 2);
      }
      g.save();
      g.beginPath();
      g.rect(x0, 0, pw, H);
      g.clip();
      const vis = (e) => e.t1 >= view.t0 && e.t0 <= view.t1;
      const barAt = (e, r, color, label, darkText) => {
        const xa = X(e.t0), xb = X(e.t1), w = Math.max(0.8, xb - xa);
        g.fillStyle = color;
        if (w > 3) { roundRect(g, xa, r.y + 1, w, r.h - 2, 2.5); g.fill(); } else g.fillRect(xa, r.y + 1, w, r.h - 2);
        if (label && w > g.measureText(label).width + 8) {
          g.fillStyle = darkText || '#0b0c12';
          g.textAlign = 'left';
          g.fillText(label, Math.max(xa, x0) + 4, r.y + r.h / 2);
        }
      };
      const RR = {};
      R.list.forEach((r) => { RR[r.k] = r; });
      // highlight range (from a rule)
      if (hlRange) {
        g.fillStyle = GG.alpha(c.danger, 0.12);
        g.fillRect(X(hlRange.t0), 0, Math.max(2, X(hlRange.t1) - X(hlRange.t0)), R.axis);
        g.strokeStyle = GG.alpha(c.danger, 0.6);
        g.strokeRect(X(hlRange.t0) + 0.5, 0.5, Math.max(2, X(hlRange.t1) - X(hlRange.t0)) - 1, R.axis - 1);
      }
      ev.nvtx.filter(vis).forEach((e) => barAt(e, RR.nvtx, 'rgba(236,238,246,0.16)', e.name, c.ink));
      // CPU thread states
      const cpuCol = { py: c.host, api: c.control, blocked: GG.alpha(c.danger, 0.85) };
      ev.cpu.filter(vis).forEach((e) => {
        const r = RR.cpu;
        const xa = X(e.t0), w = Math.max(0.8, X(e.t1) - xa);
        g.fillStyle = cpuCol[e.state];
        g.fillRect(xa, r.y + 9, w, r.h - 9);
        if (e.state === 'blocked' && w > 60) { g.fillStyle = '#2a0910'; g.textAlign = 'left'; g.fillText('blocked', Math.max(xa, x0) + 4, r.y + 16.5); }
        else if (e.state === 'py' && w > 110) { g.fillStyle = '#120d24'; g.textAlign = 'left'; g.fillText('python', Math.max(xa, x0) + 4, r.y + 16.5); }
      });
      if (showSamples) {
        ev.samples.forEach((sm) => {
          if (sm.t < view.t0 || sm.t > view.t1) return;
          g.fillStyle = sm.state === 'blocked' ? c.danger : sm.state === 'api' ? c.control : c.host;
          g.fillRect(Math.round(X(sm.t)) - 0.5, RR.cpu.y + 1, 1.5, 6);
        });
      }
      ev.api.filter(vis).forEach((e) => {
        if (!e.rule) { barAt(e, RR.api, c.control, e.name.replace('cuda', ''), '#1d1405'); return; }
        // flagged by a rule: outlined in red, so it reads differently from the solid red "blocked" on the CPU row
        const r = RR.api, xa = X(e.t0), w = Math.max(1.5, X(e.t1) - xa);
        g.fillStyle = '#16090d';
        g.fillRect(xa, r.y + 1, w, r.h - 2);
        g.strokeStyle = c.danger;
        g.lineWidth = 1.5;
        g.strokeRect(xa + 0.75, r.y + 1.75, Math.max(0.5, w - 1.5), r.h - 3.5);
        const label = e.name.replace('cuda', '');
        if (w > g.measureText(label).width + 8) { g.fillStyle = c.danger; g.textAlign = 'left'; g.fillText(label, Math.max(xa, x0) + 4, r.y + r.h / 2); }
      });
      ev.kern.filter(vis).forEach((e) => barAt(e, RR.kern, c.core, e.name, '#07140e'));
      ev.mem.filter(vis).forEach((e) => barAt(e, RR.mem, c.memory, e.name.replace('memcpy ', ''), '#08111f'));
      // utilisation chunks
      ev.util.forEach((u) => {
        if (u.t1 < view.t0 || u.t0 > view.t1) return;
        const r = RR.util;
        const xa = X(u.t0), w = Math.max(1, X(u.t1) - xa - 1);
        const hh = Math.max(1, (r.h - 2) * Math.min(1, u.u));
        g.fillStyle = u.u < 0.5 ? GG.alpha(c.danger, 0.75) : GG.alpha(c.core, 0.8);
        g.fillRect(xa, r.y + r.h - 1 - hh, w, hh);
      });
      // selection + correlation link
      const drawSel = (e, alpha) => {
        if (!e) return;
        const r = RR[e._row];
        if (!r) return;
        g.strokeStyle = GG.alpha(c.accent, alpha);
        g.lineWidth = 1.5;
        g.strokeRect(X(e.t0) - 1, r.y - 0.5, Math.max(2, X(e.t1) - X(e.t0)) + 2, r.h + 1);
        if (e.corr) {
          const partner = e._row === 'api' ? [...ev.kern, ...ev.mem].find((q) => q.corr === e.corr) : ev.api.find((q) => q.corr === e.corr);
          if (partner) {
            const a = e._row === 'api' ? e : partner, b = e._row === 'api' ? partner : e;
            const bRow = ev.mem.includes(b) ? RR.mem : RR.kern;
            g.beginPath();
            g.moveTo(X((a.t0 + a.t1) / 2), RR.api.y + RR.api.h);
            g.lineTo(X(b.t0), bRow.y);
            g.stroke();
            g.strokeRect(X(partner.t0) - 1, (e._row === 'api' ? bRow : RR.api).y - 0.5, Math.max(2, X(partner.t1) - X(partner.t0)) + 2, (e._row === 'api' ? bRow : RR.api).h + 1);
          }
        }
      };
      drawSel(hover, 0.7);
      drawSel(sel, 1);
      g.restore();
      // axis
      g.strokeStyle = c.line2;
      g.beginPath();
      g.moveTo(x0, R.axis + 0.5);
      g.lineTo(x1, R.axis + 0.5);
      g.stroke();
      const step = niceStep(span / (W < 520 ? 3.5 : 7));
      g.fillStyle = c.ink3;
      g.textAlign = 'center';
      for (let t = Math.ceil(view.t0 / step) * step; t <= view.t1 + 1e-6; t += step) {
        const x = X(t);
        g.fillRect(Math.round(x), R.axis, 1, 4);
        const lab = span >= 1000 ? GG.fmt.sig(t / 1000, 3) + ' ms' : GG.fmt.sig(t, 4) + ' µs';
        const w = g.measureText(lab).width;
        if (x - w / 2 < x0 - 30 || x + w / 2 > W) continue;
        g.fillText(lab, x, R.axis + 14);
      }
      viewLab.textContent = `showing ${fmtT(view.t0)} – ${fmtT(view.t1)} of ${fmtT(ev.end)}`;
    }

    let rangeNote = null; // set while a rule's "show" is active
    function inspect(e) {
      if (!e && rangeNote) { insp.innerHTML = rangeNote; return; }
      if (!e) {
        insp.innerHTML = 'Hover or tap a bar to inspect it; with the timeline focused, <b>← →</b> step through GPU activities and <b>+ −</b> zoom. The small ticks on the CPU row are <b>samples</b>: the profiling half of Nsight Systems.';
        return;
      }
      const dur = fmtT(e.t1 - e.t0);
      let html = '';
      if (e._row === 'sample') {
        const stack = NS_STACK[e.what] || NS_STACK['prepare_batch()'];
        html = `<b>CPU sample</b> at ${fmtT(e.t)} · thread ${e.state === 'py' ? 'running Python' : e.state === 'api' ? 'inside the CUDA API' : 'inside the CUDA API, spin-waiting on the GPU'}<br>backtrace: ${stack.map(esc).join(' ← ')}`;
      } else if (e._row === 'kern') {
        html = `<b>${esc(e.name)}</b> · kernel · ${dur} · starts ${fmtT(e.t0)}${e.graph ? ' · launched as part of a CUDA Graph' : ` · launched by cudaLaunchKernel (correlation ID ${e.corr})`}`;
      } else if (e._row === 'mem') {
        html = `<b>${esc(e.name)}</b> · ${e.bytes} · ${dur}${e.pageable ? ' · from <b>pageable</b> host memory' : ' · pinned host memory'} · correlation ID ${e.corr}`;
      } else if (e._row === 'api') {
        html = `<b>${esc(e.name)}</b> · CUDA API · ${dur} on the CPU · called from <code>${esc(e.what)}</code>${e.corr ? ` · correlation ID ${e.corr}` : ''}${e.rule ? ` · flagged by <b>${e.rule}</b>` : ''}`;
      } else if (e._row === 'nvtx') {
        html = `<b>${esc(e.name)}</b> · NVTX range · ${dur} of host time`;
      } else if (e._row === 'cpu') {
        html = `<b>CPU thread</b> · ${e.state === 'py' ? 'running Python' : e.state === 'api' ? 'in a CUDA API call' : 'blocked, waiting on the GPU'} · ${dur}`;
      } else if (e._row === 'util') {
        html = `<b>GPU utilisation</b> ${GG.fmt.pct(Math.min(1, e.u))} over ${fmtT(e.t0)} – ${fmtT(e.t1)} (time the GPU had any work)`;
      }
      insp.innerHTML = html;
    }

    function pickAt(px, py) {
      if (!geom) return null;
      const { R, x0, pw } = geom;
      if (px < x0) return null;
      const t = view.t0 + ((px - x0) / pw) * (view.t1 - view.t0);
      const tol = ((view.t1 - view.t0) / pw) * 3;
      const r = R.list.find((q) => py >= q.y - 2 && py <= q.y + q.h + 2);
      if (!r) return null;
      if (r.k === 'cpu' && py < r.y + 8 && showSamples) {
        let best = null, bd = Infinity;
        ev.samples.forEach((sm) => { const d = Math.abs(sm.t - t); if (d < bd) { bd = d; best = sm; } });
        if (best && bd <= Math.max(tol, 10)) return Object.assign({ _row: 'sample', t0: best.t, t1: best.t }, best);
      }
      const list = r.k === 'util' ? ev.util : ev[r.k];
      let hit = list.find((e) => t >= e.t0 - tol && t <= e.t1 + tol);
      if (!hit) return null;
      hit._row = r.k;
      return hit;
    }

    // interaction
    let drag = null;
    cvWrap.addEventListener('pointerdown', (e) => {
      drag = { x: e.clientX, t0: view.t0, t1: view.t1, moved: false };
      cvWrap.setPointerCapture(e.pointerId);
    });
    cvWrap.addEventListener('pointermove', (e) => {
      const rect = cv.canvas.getBoundingClientRect();
      if (drag) {
        const dx = e.clientX - drag.x;
        if (Math.abs(dx) > 3) { drag.moved = true; cvWrap.classList.add('drag'); }
        if (drag.moved && geom) {
          const dt = (-dx / geom.pw) * (drag.t1 - drag.t0);
          setView(drag.t0 + dt, drag.t1 + dt);
        }
        return;
      }
      const hit = pickAt(e.clientX - rect.left, e.clientY - rect.top);
      if (hit !== hover) { hover = hit; draw(); inspect(hover || sel); }
    });
    const end = (e) => {
      if (!drag) return;
      const moved = drag.moved;
      drag = null;
      cvWrap.classList.remove('drag');
      if (!moved) {
        const rect = cv.canvas.getBoundingClientRect();
        sel = pickAt(e.clientX - rect.left, e.clientY - rect.top);
        draw();
        inspect(sel);
      }
    };
    cvWrap.addEventListener('pointerup', end);
    cvWrap.addEventListener('pointercancel', () => { drag = null; cvWrap.classList.remove('drag'); });
    cvWrap.addEventListener('pointerleave', () => { if (!drag && hover) { hover = null; draw(); inspect(sel); } });
    cvWrap.addEventListener('keydown', (e) => {
      const gpu = [...ev.kern.map((q) => (q._row = 'kern', q)), ...ev.mem.map((q) => (q._row = 'mem', q))].sort((a, b) => a.t0 - b.t0);
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        let i = sel ? gpu.indexOf(sel) : -1;
        i = e.key === 'ArrowRight' ? Math.min(gpu.length - 1, i + 1) : Math.max(0, i < 0 ? 0 : i - 1);
        sel = gpu[i];
        const span = view.t1 - view.t0;
        if (sel.t0 < view.t0 || sel.t1 > view.t1) setView(sel.t0 - span * 0.3, sel.t0 + span * 0.7);
        draw();
        inspect(sel);
      } else if (e.key === '+' || e.key === '=') { e.preventDefault(); zoom(0.5); } else if (e.key === '-' || e.key === '_') { e.preventDefault(); zoom(2); } else if (e.key === 'Escape' && hlRange) { e.preventDefault(); clearShow(); draw(); inspect(sel); }
    });

    function setView(a, b) {
      const span = Math.min(ev.end, Math.max(20, b - a));
      a = Math.max(0, Math.min(ev.end - span, a));
      view.t0 = a;
      view.t1 = a + span;
      draw();
    }
    function zoom(k, center) {
      const mid = center != null ? center : sel ? (sel.t0 + sel.t1) / 2 : (view.t0 + view.t1) / 2;
      const span = (view.t1 - view.t0) * k;
      setView(mid - span / 2, mid + span / 2);
    }
    const zseg = el('div', { class: 'ctl' });
    zseg.innerHTML = '<span class="ctl-lab">Zoom</span>';
    const zrow = el('div', { class: 'seg', role: 'group', 'aria-label': 'Zoom' });
    [['−', () => zoom(2), 'zoom out'], ['+', () => zoom(0.5), 'zoom in'], ['fit', () => { clearShow(); setView(0, ev.end); inspect(sel); }, 'show the whole trace']].forEach(([l, fn, t]) => {
      const b = el('button', { type: 'button', title: t, 'aria-label': t }, l);
      b.addEventListener('click', fn);
      zrow.append(b);
    });
    zseg.append(zrow);
    bar.append(zseg);
    const viewLab = el('span', { class: 'hsb-sub', style: { marginTop: '0' } });
    GG.ui.toggle(bar, { label: 'show CPU samples (profiling)', value: true, onChange: (v) => { showSamples = v; draw(); } });
    bar.append(viewLab);

    const RULES = [
      { id: 'cuda_memcpy_async', name: 'Asynchronous memcpy with pageable memory', desc: 'Identifies asynchronous memory transfers that end up becoming synchronous if the memory is pageable.', adv: 'If applicable, use pinned memory instead.', fixKey: 'pinned', fixLabel: 'fix: pin the host buffers',
        run: () => { const hits = ev.api.filter((a) => a.rule === 'cuda_memcpy_async'); return { n: hits.length, text: hits.length ? `${hits.length} calls; the host sat in them for ${fmtT(hits.reduce((s, a) => s + a.t1 - a.t0, 0))}` : 'no pageable async copies', all: hits }; },
        say: (a) => `<code>${esc(a.name)}</code> from <code>${esc(a.what)}</code>. Its host buffer is pageable, so the call returns only after the GPU has finished the copy: the CPU thread is blocked for ${fmtT(a.t1 - a.t0)}.` },
      { id: 'cuda_api_sync', name: 'Synchronization APIs', desc: 'Identifies synchronization APIs that block the host until all issued CUDA calls are complete.', adv: 'Avoid excessive use of synchronization; asynchronous CUDA event calls such as cudaStreamWaitEvent and cudaEventSynchronize can prevent host synchronization.', advCheck: true, fixKey: 'nosync', fixLabel: 'fix: sync once, at the end',
        run: () => { const hits = ev.api.filter((a) => a.rule === 'cuda_api_sync'); const tt = fmtT(hits.reduce((s, a) => s + a.t1 - a.t0, 0)); return hits.length <= 1 ? { n: hits.length, text: `only the final sync remains (${tt})`, all: hits, soft: true } : { n: hits.length, text: `${hits.length} calls blocked the host for ${tt}`, all: hits }; },
        say: (a) => `<code>cudaStreamSynchronize</code> from <code>${esc(a.what)}</code>: the host waits ${fmtT(a.t1 - a.t0)} until the GPU has finished everything issued to the stream.` },
      { id: 'gpu_gaps', name: 'GPU Starvation', desc: 'Identifies time ranges where a GPU is idle for longer than a threshold (500 ms by default; 50 µs here).', adv: 'Use CPU sampling data and OS runtime information to see whether a sluggish or blocked CPU causes the gaps; add NVTX annotations.', fixNote: 'No switch of its own: these gaps are the CPU’s doing, and in this trace they close only with all three fixes on the other cards turned on.',
        run: () => ({ n: ev.gaps.length, text: ev.gaps.length ? `${ev.gaps.length} gaps over 50 µs, ${fmtT(ev.gaps.reduce((s, q) => s + q.t1 - q.t0, 0))} idle in total` : 'no gaps over 50 µs', all: ev.gaps }),
        say: (q) => `The GPU has nothing to do for ${fmtT(q.t1 - q.t0)}.` },
      { id: 'gpu_time_util', name: 'GPU Low Utilization', desc: 'Identifies time regions with low utilization: the span from the first to the last GPU operation is split into equal chunks, and chunks under a threshold (here 50%) are reported.', adv: 'Same as above: find out what the CPU is doing in those regions.', fixKey: 'graph', fixLabel: 'fix: capture the kernels as a CUDA Graph',
        run: () => { const low = ev.util.filter((u) => u.u < 0.5); return { n: low.length, text: low.length ? `${low.length} of ${ev.util.length} chunks under 50%` : `all ${ev.util.length} chunks at 50% or more`, all: low }; },
        say: (u) => `The GPU is busy only ${GG.fmt.pct(Math.min(1, u.u))} of this chunk.` },
    ];
    // what the CPU thread was doing during [a, b]
    function cpuDuring(a, b) {
      const tot = { py: 0, api: 0, blocked: 0 };
      ev.cpu.forEach((c2) => { const lo = Math.max(a, c2.t0), hi = Math.min(b, c2.t1); if (hi > lo) tot[c2.state] += hi - lo; });
      const parts = [['py', 'running Python'], ['api', 'in CUDA API calls'], ['blocked', 'blocked']].filter(([k]) => tot[k] > 0.5).map(([k, l]) => `${l} for ${fmtT(tot[k])}`);
      return parts.length ? parts.join(', ') : 'idle';
    }
    let showBtns = [];
    function clearShow() {
      hlRange = null;
      rangeNote = null;
      showBtns.forEach((b) => { b.setAttribute('aria-pressed', 'false'); b.setLabel('show'); b.idx = -1; });
    }
    function renderRules() {
      rulesBox.innerHTML = '';
      showBtns = [];
      RULES.forEach((r) => {
        const res = r.run();
        const hit = res.n > 0 && !res.soft;
        const card = el('div', { class: 'hsb-rule ' + (hit ? 'hit' : 'clean') });
        card.innerHTML = `<div class="hsb-rule-h"><b>${esc(r.name)}</b><span>${r.id}</span></div><p>${esc(r.desc)}</p><div class="res ${hit ? 'hit' : 'clean'}">${hit ? '● ' : '✓ '}${esc(res.text)}</div><div class="adv"><b>Advice:</b> ${esc(r.adv)}${r.advCheck ? ' <span class="hsb-tag">see the check note below</span>' : ''}</div>`;
        const foot = el('div', { class: 'hsb-rule-f' });
        const all = res.all || [];
        if (all.length) {
          const b = GG.ui.button(foot, {
            label: 'show',
            onClick: () => {
              const k = (b.idx + 1) % all.length;
              clearShow();
              b.idx = k;
              const a = all[k];
              hlRange = { t0: a.t0, t1: a.t1 };
              b.setAttribute('aria-pressed', 'true');
              if (all.length > 1) b.setLabel(`next (${k + 1} of ${all.length})`);
              rangeNote = `<b>${esc(r.name)}</b> · ${k + 1} of ${all.length}: ${fmtT(a.t0)} – ${fmtT(a.t1)}. ${r.say(a)} Meanwhile the CPU thread is ${cpuDuring(a.t0, a.t1)}.${all.length > 1 ? ' Press the button again for the next one;' : ''} <b>fit</b> or Esc clears the highlight.`;
              const pad = Math.max(60, (a.t1 - a.t0) * 1.2);
              setView(a.t0 - pad, a.t1 + pad);
              sel = null;
              inspect(null);
            },
          });
          b.idx = -1;
          b.setAttribute('aria-pressed', 'false');
          showBtns.push(b);
        }
        if (r.fixKey) GG.ui.toggle(foot, { label: r.fixLabel, value: fx[r.fixKey], onChange: (v) => { fx[r.fixKey] = v; recompute(); } });
        else foot.append(el('span', { class: 'hsb-sub', text: r.fixNote }));
        card.append(foot);
        rulesBox.append(card);
      });
    }
    function recompute(keepView) {
      ev = nsSimulate(fx);
      sel = null;
      hover = null;
      hlRange = null;
      rangeNote = null;
      if (!keepView) { view.t0 = 0; view.t1 = ev.end; }
      renderRules();
      const syncs = ev.api.filter((a) => a.name === 'cudaStreamSynchronize');
      const finS = syncs[syncs.length - 1];
      const fin = finS ? finS.t1 - finS.t0 : 0;
      const mid = Math.max(0, ev.blocked - fin);
      stW.set(fmtT(ev.end));
      stB.set(GG.fmt.pct(ev.busy / ev.end));
      stH.set(fmtT(mid), mid > 1 ? 'danger' : 'core');
      stF.set(fmtT(fin));
      const on = Object.keys(fx).filter((k) => fx[k]);
      const base = nsSimulate({ pinned: false, nosync: false, graph: false });
      f.setWhy(on.length === 0
        ? `As captured: <b>${fmtT(ev.end)}</b> for three iterations, GPU busy only <b>${GG.fmt.pct(ev.busy / ev.end)}</b> of the time. The CPU row shows why: the thread is often <b>blocked</b> (solid red), mostly inside copies from pageable memory, and the GPU row has long gaps while the CPU prepares the next batch. The expert system flags all of it; try its three fixes one at a time, and press <b>show</b> on a card to jump to what it flagged.`
        : `With ${on.map((k) => ({ pinned: 'pinned memory', nosync: 'one sync at the end', graph: 'CUDA Graphs' }[k])).join(' + ')}: <b>${fmtT(ev.end)}</b> instead of ${fmtT(base.end)} (×${GG.fmt.fixed(base.end / ev.end, 2)}), GPU busy <b>${GG.fmt.pct(ev.busy / ev.end)}</b>. ${nsNote(fx, fin)}`);
      draw();
      inspect(null);
    }
    cv.onResize(() => draw());
    recompute();
  }

  /* Fig: the same CPU thread seen by tracing and by sampling */
  function traceVsSample(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Tracing versus sampling',
      hint: 'drag the sampling interval',
      wide: true,
      caption: 'The CPU thread of the as-captured trace in Fig. 1. Top: what the thread really did. Middle: what CUDA API tracing records, every call with exact start and end times, and nothing in between. Bottom: periodic samples, each one noting where the running thread was at that instant (in Nsight Systems, with a backtrace). A sampler only catches a thread that is on a CPU. This one always is: while a CUDA call waits for the GPU, the thread spins inside it, which is CUDA’s default when a process has no more active CUDA contexts than the machine has logical CPUs (the note below covers a thread that sleeps instead). We jitter the sample times slightly so they do not fall into step with the program’s regular 8 µs launches. In the table, each bar is the samples’ estimate and the white tick the true share.',
    });
    const ev = nsSimulate({ pinned: false, nosync: false, graph: false });
    const T1 = ev.cpu[ev.cpu.length - 1].t1;
    const wrap = el('div', { class: 'hsb-w hsb-svgw' });
    const tbl = el('div', { class: 'hsb-tvs' });
    f.stage.append(wrap, tbl);
    const CATS = [
      { k: 'py', label: 'Python, in prepare_batch()', color: 'var(--host)' },
      { k: 'api', label: 'in a CUDA API call, issuing work', color: 'var(--control)' },
      { k: 'blocked', label: 'in a CUDA API call, waiting for the GPU', color: 'var(--danger)' },
    ];
    const COL = { py: 'var(--host)', api: 'var(--control)', blocked: 'rgba(255,91,110,0.8)' };
    const truth = { py: 0, api: 0, blocked: 0 };
    ev.cpu.forEach((c) => { truth[c.state] += c.t1 - c.t0; });
    const launches = ev.api.filter((a) => a.name === 'cudaLaunchKernel');
    const hatchId = GG.uid('hsb-hatch');
    let dt = 20, width = 0;
    const stN = GG.ui.stat(f.readouts, { label: 'samples', value: '' });
    const stR = GG.ui.stat(f.readouts, { label: 'trace records', value: String(ev.api.length), tone: 'control' });
    const stE = GG.ui.stat(f.readouts, { label: 'worst sample error', value: '' });
    const stL = GG.ui.stat(f.readouts, { label: 'launches sampled', value: '' });

    function takeSamples() {
      const out = [];
      let j = 0;
      for (let k = 0; ; k++) {
        const jit = (Math.abs(Math.sin((k + 1) * 12.9898) * 43758.5453) % 1) - 0.5;
        const t = (k + 0.5 + 0.4 * jit) * dt;
        if (t >= T1) break;
        while (j < ev.cpu.length - 1 && ev.cpu[j].t1 <= t) j++;
        out.push({ t, state: ev.cpu[j].state });
      }
      return out;
    }

    function draw() {
      const W = Math.max(280, width);
      const narrow = W < 520;
      const lx = narrow ? 58 : 150;
      const X = (t) => lx + (t / T1) * (W - lx - 4);
      const rowY = [6, 38, 70], rh = 20, ay = 100;
      const sm = takeSamples();
      const svg = S('svg', { viewBox: `0 0 ${W} ${ay + 22}`, role: 'img', 'aria-label': `Three rows over ${fmtT(T1)} of one CPU thread: the true activity, the trace of CUDA API calls with gaps between them, and ${sm.length} samples, one every ${fmtT(dt)}.` });
      const defs = S('defs', {}, svg);
      const pat = S('pattern', { id: hatchId, width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
      S('rect', { width: 6, height: 6, fill: 'rgba(255,255,255,0.02)' }, pat);
      S('rect', { width: 2, height: 6, fill: 'rgba(255,255,255,0.09)' }, pat);
      const labels = narrow ? ['truth', 'trace', 'samples'] : ['what really ran', 'trace · CUDA API', `samples · every ${fmtT(dt)}`];
      labels.forEach((l, i) => Tx(svg, lx - 8, rowY[i] + 14, l, { 'text-anchor': 'end', 'font-size': 10.5, fill: 'var(--ink-3)' }));
      // truth
      ev.cpu.forEach((c) => S('rect', { x: X(c.t0), y: rowY[0], width: Math.max(0.5, X(c.t1) - X(c.t0)), height: rh, fill: COL[c.state] }, svg));
      // trace: hatched "no events" background, then every API call
      S('rect', { x: X(0), y: rowY[1], width: X(T1) - X(0), height: rh, fill: `url(#${hatchId})` }, svg);
      ev.api.forEach((a) => S('rect', { x: X(a.t0), y: rowY[1], width: Math.max(0.6, X(a.t1) - X(a.t0)), height: rh, fill: a.rule ? COL.blocked : COL.api }, svg));
      const g0 = ev.cpu[0];
      if (X(g0.t1) - X(g0.t0) > 70) Tx(svg, X(g0.t0) + 5, rowY[1] + 14, 'no events', { 'font-size': 10, fill: 'var(--ink-3)' });
      // samples
      const pxPer = (W - lx - 4) / (T1 / dt);
      const tw = Math.max(1, Math.min(3, pxPer * 0.55));
      S('rect', { x: X(0), y: rowY[2], width: X(T1) - X(0), height: rh, fill: 'rgba(255,255,255,0.025)' }, svg);
      sm.forEach((q) => S('rect', { x: X(q.t) - tw / 2, y: rowY[2], width: tw, height: rh, fill: COL[q.state] }, svg));
      // axis
      S('line', { x1: lx, x2: W - 4, y1: ay, y2: ay, stroke: 'var(--line-2)' }, svg);
      const step = niceStep(T1 / (narrow ? 3 : 6));
      for (let t = 0; t <= T1 + 1e-6; t += step) {
        S('line', { x1: X(t), x2: X(t), y1: ay, y2: ay + 4, stroke: 'var(--ink-3)' }, svg);
        const lab = t >= 1000 ? GG.fmt.sig(t / 1000, 3) + ' ms' : GG.fmt.int(t) + ' µs';
        Tx(svg, Math.min(X(t), W - 22), ay + 16, lab, { 'text-anchor': 'middle', 'font-size': 10, fill: 'var(--ink-3)' });
      }
      wrap.innerHTML = '';
      wrap.append(svg);

      // estimates
      const n = sm.length;
      const hits = { py: 0, api: 0, blocked: 0 };
      sm.forEach((q) => { hits[q.state]++; });
      let worst = 0;
      let li = 0, hitL = 0;
      launches.forEach((a) => {
        while (li < n && sm[li].t < a.t0) li++;
        if (li < n && sm[li].t < a.t1) hitL++;
      });
      const pct = (x) => GG.fmt.fixed(x * 100, 1) + '%';
      tbl.innerHTML = `<div class="hsb-tvs-r h"><span>the thread was</span><span>truth</span><span>trace says</span><span>samples say</span></div>` + CATS.map((c) => {
        const tr = truth[c.k] / T1, est = n ? hits[c.k] / n : 0;
        worst = Math.max(worst, Math.abs(est - tr));
        const traceCell = c.k === 'py' ? `<b>${pct(tr)}</b><small>as gaps: what ran there is unknown</small>` : c.k === 'blocked' ? `<b>${pct(tr)}</b><small>exact call time; spinning or asleep, it cannot tell</small>` : `<b>${pct(tr)}</b><small>exact</small>`;
        return `<div class="hsb-tvs-r"><span><i class="sw" style="background:${COL[c.k]}"></i>${esc(c.label)}</span><span><b>${pct(tr)}</b></span><span>${traceCell}</span><span><b>${pct(est)}</b><small>${hits[c.k]} of ${n} samples</small><span class="hsb-tvs-bar"><i style="width:${(est * 100).toFixed(2)}%;background:${COL[c.k]}"></i><u style="left:${(tr * 100).toFixed(2)}%"></u></span></span></div>`;
      }).join('');
      stN.set(GG.fmt.int(n));
      stE.set(GG.fmt.fixed(worst * 100, 1) + ' pts', worst > 0.05 ? 'danger' : worst > 0.02 ? 'control' : 'core');
      stL.set(`${hitL} of ${launches.length}`);
      const py = hits.py / Math.max(1, n);
      let why = `<b>${GG.fmt.int(n)} samples</b>, one every ${fmtT(dt)}, put Python at <b>${pct(py)}</b> of the thread’s time (truth ${pct(truth.py / T1)}). The trace needs ${ev.api.length} records and times every CUDA call exactly, but between calls it only sees gaps: it cannot tell you that the time went to <code>prepare_batch()</code>. A sample can, from its backtrace.`;
      if (worst > 0.05 || n < 30) why += ` But with only ${GG.fmt.int(n)} samples the estimate is <b>unreliable</b>: Python, ${pct(truth.py / T1)} of the time, got ${hits.py} of them, and the worst share is off by ${GG.fmt.fixed(worst * 100, 1)} points. Sampling trades accuracy for overhead.`;
      else if (hitL < launches.length * 0.5) why += ` At this rate most individual 8 µs launches get no sample at all (${hitL} of ${launches.length} do), yet together they still show up in proportion.`;
      else why += ` At this rate ${hitL} of the ${launches.length} short launches are caught by at least one sample; the price is ${GG.fmt.int(n)} interruptions of the program.`;
      f.setWhy(why);
    }
    GG.ui.slider(f.controls, { label: 'Sample every', min: 5, max: 400, step: 1, log: true, value: dt, format: fmtT, onInput: (v) => { dt = Math.max(5, v); draw(); } });
    const legend = el('div', { class: 'hsb-legend', html: '<span><i class="hsb-sw-host"></i>Python</span><span><i class="hsb-sw-control"></i>CUDA API call, issuing work</span><span><i class="hsb-sw-danger"></i>CUDA API call, waiting for the GPU (spinning)</span><span><i class="hsb-sw-hatch"></i>trace: no events</span>' });
    wrap.after(legend);
    onWidth(wrap, (w) => { width = w; draw(); });
  }

  GG.entry('nsight-systems', {
    render(body, ctx) {
      body.classList.add('hsb-body');
      const s = ctx.html(body, `
<p>For the ${T('cuda-c', 'CUDA C++')} programs it debugs, Nsight Systems combines profiling, tracing and expert systems analysis in a GUI (and a command-line tool, <code>nsys</code>):</p>
<ul>
<li><b>Tracing</b> records events exactly as they happen: every CUDA API call, every ${T('kernel', 'kernel')}, every memory copy, each with a start and an end time, on a timeline shared by the CPU and the GPU.</li>
<li><b>Profiling</b>, in the sense of <em>sampling</em>, periodically interrupts the program’s CPU threads and records what each was doing (its call stack), building a statistical picture of where CPU time goes.</li>
<li><b>Expert systems analysis</b> runs a set of rules over the collected data to point at known bad patterns and suggest fixes, so you do not have to spot every problem by eye.</li>
</ul>
${GG.noteHTML('quote', '<p>No one wakes up and says “today I want to write a program that runs on a hard to use, expensive piece of hardware using a proprietary software stack”.</p>')}
<p>Instead, GPUs are selected when normal computing hardware doesn’t perform well enough to solve a computing problem. So ${T('perf', 'almost all GPU programs are performance-sensitive')}, and the performance debugging workflows supported by Nsight Systems, or by other tools built on top of the ${T('cupti', 'CUDA Profiling Tools Interface')}, are mission-critical. A GPU program that is not fast enough has lost the reason it was written.</p>
<h3>Reading a timeline</h3>
<p>Fig. 1 is a mock profile in the style of Nsight Systems. Read it top to bottom: NVTX ranges (labels the program adds to its own timeline), the CPU thread with its sampled call stacks, the CUDA API calls, then what the GPU did and how busy it was. Correlation lines connect a call to the work it caused.</p>
<div data-slot="mock" class="wide"></div>
${GG.noteHTML('check', '<p><b>One word in NVIDIA’s advice.</b> The Synchronization APIs card quotes the Nsight Systems analysis guide, which names <code>cudaStreamWaitEvent</code> and <code>cudaEventSynchronize</code> together as “asynchronous CUDA event calls”. Only the first leaves the host free: <code>cudaStreamWaitEvent</code> makes a stream wait for an event, and the GPU enforces that dependency. <code>cudaEventSynchronize</code> does block: NVIDIA’s <a href="https://docs.nvidia.com/cuda/cuda-runtime-api/group__CUDART__EVENT.html">Runtime API reference</a> says it makes the calling CPU thread wait until the event has completed. Its gain is that it waits only for the work captured in that one event, not for everything issued.</p>')}
${GG.noteHTML('intuition', '<p>Notice the order of the fixes that pay off. The trace’s biggest problem is not any single kernel: it is the GPU waiting on the CPU. Only once the host stops blocking (pinned memory, no per-iteration sync) and launches stop costing one call per kernel (' + T('cuda-graph', 'CUDA Graphs') + ') does the GPU become the bottleneck. That is the usual first job of a timeline profiler: find out whether you are even measuring the GPU, or just its ' + T('overhead', 'overhead') + '.</p>')}
<h3>Tracing and sampling, side by side</h3>
<p>The two ways of watching a program answer different questions. Tracing is exact but sees only what is instrumented: the CUDA API, NVTX ranges, OS runtime calls, the GPU activities that ${T('cupti', 'CUPTI')} reports. Sampling is statistical but sees everything the CPU runs, including your own code that nobody annotated, at a cost that grows with the sampling rate. Fig. 2 puts both views of the CPU thread from Fig. 1 on top of each other.</p>
<div data-slot="tvs" class="wide"></div>
${GG.noteHTML('beyond', '<p><b>Waiting is not always blocking.</b> Fig. 1 calls the red stretches <em>blocked</em> in the everyday sense: the program cannot go on until the GPU is done. To the operating system, the thread is often still running. NVIDIA’s <a href="https://docs.nvidia.com/cuda/cuda-runtime-api/group__CUDART__DEVICE.html">Runtime API reference</a> describes the default, <code>cudaDeviceScheduleAuto</code>: if a process has more active CUDA contexts than the system has logical processors, CUDA yields its thread to other OS threads while waiting for the device; otherwise it actively spins on the processor. Spinning is what Fig. 2 draws, and it is why samples land inside <code>cudaStreamSynchronize</code>.</p><p>Pass <code>cudaDeviceScheduleBlockingSync</code> to <code>cudaSetDeviceFlags</code> and the thread instead blocks on a synchronization primitive and leaves the CPU. A sampler then records nothing there: on Linux, Nsight Systems takes a sample after a fixed count of the thread’s own CPU cycles (its user guide gives 1 million reference cycles as an example), and a thread that is not running counts none. Nsight Systems shows that time from a different source, its trace of OS context switches, as a thread state on the timeline; <code>nsys</code> turns that trace on whenever CPU sampling is on. The CUDA API trace sees neither: it records only when each call began and ended.</p>')}
${GG.noteHTML('beyond', '<p><b>From the command line.</b> <code>nsys profile</code> records a report (a <code>.nsys-rep</code> file) that the GUI opens, and <code>nsys analyze</code> runs the same expert-system rules on it and prints the results, as documented in NVIDIA’s Nsight Systems user guide. Besides the four rules in Fig. 1, NVIDIA documents two more CUDA rules: Synchronous Memcpy (<code>cuda_memcpy_sync</code>) and Synchronous Memset (<code>cuda_memset_sync</code>), which flag copies and memsets that block the host and suggest their <code>…Async</code> versions.</p>')}
<div data-slot="cli"></div>
<p>You can find Nsight Systems’ documentation <a href="https://docs.nvidia.com/nsight-systems/index.html">here</a>, but <a href="https://www.youtube.com/watch?v=dUDGO66IadU">watching someone use the tool</a> is usually more helpful. For details on how to profile GPU applications on Modal, see <a href="https://modal.com/docs/examples/torch_profiling">Modal’s documentation</a>.</p>
<div data-slot="read"></div>`);
      guard(s.mock, 'Nsight mock', () => nsightMock(s.mock, ctx));
      guard(s.tvs, 'Tracing vs sampling', () => traceVsSample(s.tvs, ctx));
      guard(s.cli, 'nsys CLI', () => ctx.code(s.cli, {
        lang: 'shell', caption: 'beyond the glossary: profiling from a terminal',
        code: 'nsys profile -o report --trace=cuda,nvtx,osrt python train.py\nnsys analyze -r cuda_memcpy_async,cuda_api_sync,gpu_gaps,gpu_time_util report.nsys-rep',
        notes: {
          1: '<code>nsys profile</code> runs the program under the profiler. <code>--trace</code> picks what to trace: CUDA API calls and GPU activity, NVTX ranges and OS runtime calls. The result is <code>report.nsys-rep</code>.',
          2: '<code>nsys analyze</code> runs expert-system rules (<code>-r</code>) over the report. These four are the rules in Fig. 1.',
        },
      }));
      ctx.reading(s.read, [
        { href: 'https://docs.nvidia.com/nsight-systems/index.html', label: 'Nsight Systems documentation', note: 'user guide, CLI reference and the expert-system rules' },
        { href: 'https://www.youtube.com/watch?v=dUDGO66IadU', label: 'Watching someone use Nsight Systems (video)', note: 'the glossary’s recommendation' },
        { href: 'https://modal.com/docs/examples/torch_profiling', label: 'Modal: profiling GPU applications', note: 'how to profile on Modal' },
      ]);
    },
  });

  /* ═════════════════════════════ CUDA Binary Utilities ═════════════════════════════ */

  const BU_CMDS = [
    { tool: 'readelf', cmd: 'readelf -S a.out', lit: ['exe', 'htext', 'hother', 'fat'], keep: [], xfile: false,
      out: '<span class="cm"># generic ELF tool, abridged: section names only</span>\nSection Headers:\n  [Nr] Name              Type\n  ...\n  [..] .text             PROGBITS\n  ...\n  [..] .rodata           PROGBITS\n  ...\n  [..] .nv_fatbin        PROGBITS\n  ...\n<span class="cm"># .nv_fatbin is listed, but to readelf it is just bytes</span>',
      why: '<b>readelf</b> is a general-purpose Linux tool. Because nvcc’s output follows the host ABI, it reads the executable fine, and it even lists the section that holds the fat binary. It cannot look inside it.' },
    { tool: 'cuobjdump', cmd: 'cuobjdump -lelf a.out', lit: ['fat', 'cubin'], keep: ['exe'], xfile: false,
      out: 'ELF file    1: add.sm_100.cubin',
      why: '<b>cuobjdump</b> opens the fat binary inside a host binary. <code>-lelf</code> (<code>--list-elf</code>) lists the embedded cubins, the ELF files that hold SASS: one for each source file and each real architecture it was compiled for.' },
    { tool: 'cuobjdump', cmd: 'cuobjdump -sass a.out', lit: ['cubin', 'sass'], keep: ['exe', 'fat'], xfile: false,
      out: 'Fatbin elf code:\n================\narch = sm_100\ncode version = [1,8]\nhost = linux\ncompile_size = 64bit\n\n        code for sm_100\n        .target sm_100\n                Function : _Z3addPfS_S_\n        .headerflags    @"EF_CUDA_SM100 EF_CUDA_VIRTUAL_SM(EF_CUDA_SM100)"\n        /*0000*/                   LDC R1, c[0x0][0x37c] ;\n        /*0010*/                   S2R R9, SR_TID.X ;\n        /*0020*/                   S2UR UR6, SR_CTAID.X ;\n        ...\n        /*00e0*/                   FADD R9, R2, R5 ;\n        /*00f0*/                   STG.E desc[UR4][R6.64], R9 ;\n        /*0100*/                   EXIT ;\n        ...',
      why: '<code>-sass</code> disassembles every cubin in the binary and prints the <b>SASS</b> of each kernel. The name <code>_Z3addPfS_S_</code> is the mangled form of <code>add(float*, float*, float*)</code>.' },
    { tool: 'cuobjdump', cmd: 'cuobjdump -ptx a.out', lit: ['ptx'], keep: ['exe', 'fat'], xfile: false,
      out: 'Fatbin ptx code:\n================\narch = sm_100\ncode version = [8,8]\nhost = linux\ncompile_size = 64bit\ncompressed\n\n.version 8.8\n.target sm_100\n.address_size 64\n\n.visible .entry _Z3addPfS_S_(\n  ...\nld.global.f32 %f1, [%rd8];\n...\nadd.f32 %f3, %f1, %f2;\n...',
      why: '<code>-ptx</code> extracts the embedded <b>PTX</b> text. PTX is stored as text, compressed here, which is why it can be JIT-compiled later for GPUs that did not exist at build time.' },
    { tool: 'cuobjdump', cmd: 'cuobjdump -xelf all a.out', lit: ['cubin'], keep: ['exe', 'fat'], xfile: true,
      out: 'Extracting ELF file    1: add.sm_100.cubin',
      why: '<code>-xelf</code> (<code>--extract-elf</code>) goes beyond listing: it extracts each embedded cubin into its own file, here <code>add.sm_100.cubin</code>, ready for nvdisasm. <code>a.out</code> itself is not changed.' },
    { tool: 'nvdisasm', cmd: 'nvdisasm add.sm_100.cubin', lit: ['x-sass', 'x-info'], keep: [], needsFile: true,
      out: '<span class="cm"># abridged</span>\n        .section        .text._Z3addPfS_S_,"ax",@progbits\n        ...\n_Z3addPfS_S_:\n.text._Z3addPfS_S_:\n        /*0000*/                   LDC R1, c[0x0][0x37c] ;\n        /*0010*/                   S2R R9, SR_TID.X ;\n        ...\n        /*0100*/                   EXIT ;\n.L_x_0:\n        /*0110*/                   BRA `(.L_x_0) ;',
      why: '<b>nvdisasm</b> works on a cubin file only. Its listing is laid out like assembler source, with sections and labels, and its control-flow analysis names branch targets (here the self-branch after <code>EXIT</code>).' },
    { tool: 'nvdisasm', cmd: 'nvdisasm -cfg add.sm_100.cubin | dot -ocfg.png -Tpng', lit: ['x-sass'], keep: [], needsFile: true,
      out: '<span class="cm"># -cfg prints the control flow graph in Graphviz DOT format;</span>\n<span class="cm"># dot renders it to cfg.png. Fig. 2 draws one.</span>',
      why: '<code>-cfg</code> makes nvdisasm output the kernel’s <b>control flow graph</b> in the DOT graph language, which Graphviz’s <code>dot</code> turns into a picture. Per NVIDIA, each node of the <code>-cfg</code> graph is a <em>hyperblock</em>; <code>-bbcfg</code> (<code>nvdisasm -bbcfg add.sm_100.cubin | dot -obbcfg.png -Tpng</code>) draws one node per <em>basic block</em> instead, the view Fig. 2 draws.' },
    { tool: 'nvdisasm', cmd: 'nvdisasm a.out', lit: [], keep: [], rej: ['exe'], xfile: false,
      out: '<span class="cm"># nvdisasm accepts only cubin files, not host binaries.</span>\n<span class="cm"># Extract the cubins first: cuobjdump -xelf all a.out</span>',
      why: 'Pointed at the host executable, <b>nvdisasm</b> is the wrong tool: it only accepts cubin files. The division of labour: cuobjdump for whole binaries (and cubins), nvdisasm for cubins, with richer output.' },
  ];

  function binExplorer(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Inside a.out, and which tool opens what',
      hint: 'run a command',
      wide: true,
      caption: '<code>a.out</code> is the result of <code>nvcc -arch=sm_100 add.cu</code>: host code plus a fat binary with one sm_100 cubin and compute_100 PTX. Command formats and the SASS and PTX shown follow the sample outputs in NVIDIA’s CUDA Binary Utilities documentation, abridged; the cubin’s file name is illustrative.',
    });
    const box = el('div', { class: 'hsb-bx' });
    f.stage.append(box);
    onWidth(box, (w) => box.classList.toggle('two', w >= 700));
    const left = el('div', { class: 'hsb-w hsb-bxw dimall bx-diag' });
    const right = el('div', { class: 'hsb-w bx-cmds' });
    box.append(right, left);
    left.innerHTML = `
      <div class="hsb-nest host" data-p="exe"><div class="hsb-nest-h"><b>a.out</b><span>host executable · ELF</span></div>
        <div class="hsb-nest host" data-p="htext"><div class="hsb-nest-h"><b>.text</b><span>CPU machine code (x86-64)</span></div></div>
        <div class="hsb-nest host" data-p="hother"><div class="hsb-nest-h"><b>.rodata, .data, …</b><span>other host sections</span></div></div>
        <div class="hsb-nest meta" data-p="fat"><div class="hsb-nest-h"><b>.nv_fatbin</b><span>the fat binary</span></div>
          <div class="hsb-nest sass" data-p="cubin"><div class="hsb-nest-h"><b>add.sm_100.cubin</b><span>ELF, for the GPU</span></div>
            <div class="hsb-nest sass" data-p="sass"><div class="hsb-nest-h"><b>.text._Z3addPfS_S_</b><span>SASS</span></div></div>
            <div class="hsb-nest meta" data-p="info"><div class="hsb-nest-h"><b>.nv.info, symbols, relocations</b><span>metadata</span></div></div>
          </div>
          <div class="hsb-nest ptxn" data-p="ptx"><div class="hsb-nest-h"><b>PTX · compute_100</b><span>text</span></div></div>
        </div>
      </div>
      <div class="hsb-xfile" data-v="xfile"><div class="hsb-k">extracted file on disk</div>
        <div class="hsb-nest sass" data-p="x-cubin"><div class="hsb-nest-h"><b>add.sm_100.cubin</b><span>standalone cubin</span></div>
          <div class="hsb-nest sass" data-p="x-sass"><div class="hsb-nest-h"><b>.text._Z3addPfS_S_</b><span>SASS</span></div></div>
          <div class="hsb-nest meta" data-p="x-info"><div class="hsb-nest-h"><b>.nv.info, symbols, relocations</b><span>metadata</span></div></div>
        </div>
      </div>`;
    const cmds = el('div', { class: 'hsb-cmds', role: 'group', 'aria-label': 'Commands' });
    right.append(el('div', { class: 'hsb-k', text: 'Commands', style: { marginBottom: '6px' } }), cmds);
    const term = el('div', { class: 'hsb-term' });
    term.innerHTML = '<div class="hsb-term-h"><span>terminal</span><span data-v="tc"></span></div><pre data-v="to" tabindex="0"></pre>';
    box.append(term);
    const tc = term.querySelector('[data-v="tc"]'), to = term.querySelector('[data-v="to"]');
    const parts = {};
    $$(left, '[data-p]').forEach((n) => { parts[n.getAttribute('data-p')] = n; });
    const xfile = left.querySelector('[data-v="xfile"]');
    const btns = BU_CMDS.map((c, i) => {
      const b = el('button', { type: 'button', class: 'hsb-cmdb', 'aria-pressed': 'false' });
      b.innerHTML = `<i>${c.tool}</i><span>${esc(c.cmd.replace(c.tool + ' ', ''))}</span>`;
      b.addEventListener('click', () => run(i));
      cmds.append(b);
      return b;
    });
    let extracted = false;
    function run(i) {
      const c = BU_CMDS[i];
      btns.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
      Object.values(parts).forEach((n) => n.classList.remove('lit', 'rej', 'keep'));
      c.lit.forEach((p) => parts[p] && parts[p].classList.add('lit'));
      (c.keep || []).forEach((p) => parts[p] && parts[p].classList.add('keep'));
      (c.rej || []).forEach((p) => parts[p] && parts[p].classList.add('rej'));
      // nvdisasm needs the cubin as a file: if it has not been extracted yet, run the extraction first, visibly
      const pre = c.needsFile && !extracted ? BU_CMDS.find((q) => q.xfile) : null;
      if (c.xfile || pre) extracted = true;
      if (c.lit.some((p) => p.startsWith('x-'))) parts['x-cubin'].classList.add('keep');
      xfile.classList.toggle('on', extracted);
      tc.textContent = c.tool === 'readelf' ? 'not a CUDA tool' : c.tool === 'cuobjdump' ? 'host binaries or cubins' : 'cubins only';
      const outHTML = (q) => `<span class="pr">$</span> ${esc(q.cmd)}\n${q.out.split('\n').map((l) => (/^\s*\/\*[0-9a-f]{4}\*\//.test(l) ? '  ' + sassLineHTML(l) : l.startsWith('<span') ? l : esc(l))).join('\n')}`;
      to.innerHTML = (pre ? `<span class="cm"># nvdisasm needs the cubin as a file, so extract it first:</span>\n${outHTML(pre)}\n` : '') + outHTML(c);
      f.setWhy((pre ? 'The cubin had not been extracted yet, so the terminal first runs <code>cuobjdump -xelf all a.out</code>, which writes it to disk (see “extracted file on disk”). ' : '') + c.why);
    }
    run(1);
  }

  /* nvdisasm sample output from NVIDIA's CUDA Binary Utilities documentation (basic disassembly, acos kernel) */
  const ACOS = [
    ['        /*0000*/               MOV R1, c[0x0][0x28] ;', 'B0'],
    ['        /*0010*/               NOP;', 'B0'],
    ['        /*0020*/               S2R R0, SR_CTAID.X ;', 'B0'],
    ['        /*0030*/               S2R R3, SR_TID.X ;', 'B0'],
    ['        /*0040*/               IMAD R0, R0, c[0x0][0x0], R3 ;', 'B0'],
    ['        /*0050*/               ISETP.GE.AND P0, PT, R0, c[0x0][0x170], PT ;', 'B0'],
    ['        /*0060*/           @P0 EXIT ;', 'B0'],
    ['.L_1:', 'B1', true],
    ['        /*0070*/               MOV R11, 0x4 ;', 'B1'],
    ['        /*0080*/               IMAD.WIDE R2, R0, R11, c[0x0][0x160] ;', 'B1'],
    ['        /*0090*/               LDG.E.SYS R2, [R2] ;', 'B1'],
    ['        /*00a0*/               MOV R7, 0x3d53f941 ;', 'B1'],
    ['        /*00b0*/               FADD.FTZ R4, |R2|.reuse, -RZ ;', 'B1'],
    ['        /*00c0*/               FSETP.GT.FTZ.AND P0, PT, |R2|.reuse, 0.5699, PT ;', 'B1'],
    ['        /*00d0*/               FSETP.GEU.FTZ.AND P1, PT, R2, RZ, PT ;', 'B1'],
    ['        /*00e0*/               FADD.FTZ R5, -R4, 1 ;', 'B1'],
    ['        /*00f0*/               IMAD.WIDE R2, R0, R11, c[0x0][0x168] ;', 'B1'],
    ['        /*0100*/               FMUL.FTZ R5, R5, 0.5 ;', 'B1'],
    ['        /*0110*/           @P0 MUFU.SQRT R4, R5 ;', 'B1'],
    ['        /*0120*/               MOV R5, c[0x0][0x0] ;', 'B1'],
    ['        /*0130*/               IMAD R0, R5, c[0x0][0xc], R0 ;', 'B1'],
    ['        /*0140*/               FMUL.FTZ R6, R4, R4 ;', 'B1'],
    ['        /*0150*/               FFMA.FTZ R7, R6, R7, 0.018166976049542427063 ;', 'B1'],
    ['        /*0160*/               FFMA.FTZ R7, R6, R7, 0.046756859868764877319 ;', 'B1'],
    ['        /*0170*/               FFMA.FTZ R7, R6, R7, 0.074846573173999786377 ;', 'B1'],
    ['        /*0180*/               FFMA.FTZ R7, R6, R7, 0.16667014360427856445 ;', 'B1'],
    ['        /*0190*/               FMUL.FTZ R7, R6, R7 ;', 'B1'],
    ['        /*01a0*/               FFMA.FTZ R7, R4, R7, R4 ;', 'B1'],
    ['        /*01b0*/               FADD.FTZ R9, R7, R7 ;', 'B1'],
    ['        /*01c0*/          @!P0 FADD.FTZ R9, -R7, 1.5707963705062866211 ;', 'B1'],
    ['        /*01d0*/               ISETP.GE.AND P0, PT, R0, c[0x0][0x170], PT ;', 'B1'],
    ['        /*01e0*/          @!P1 FADD.FTZ R9, -R9, 3.1415927410125732422 ;', 'B1'],
    ['        /*01f0*/               STG.E.SYS [R2], R9 ;', 'B1'],
    ['        /*0200*/          @!P0 BRA `(.L_1) ;', 'B1'],
    ['        /*0210*/               EXIT ;', 'B2'],
    ['.L_2:', 'B3', true],
    ['        /*0220*/               BRA `(.L_2);', 'B3'],
    ['.L_21:', '', true],
  ];
  /* nvdisasm -g sample output from the same documentation */
  const LINEINFO = [
    ['        /*0000*/                   MOV R1, c[0x0][0x28] ;', 0],
    ['        /*0010*/                   NOP;', 0],
    ['    //## File "/home/user/cuda/sample/sample.cu", line 25', 25, true],
    ['        /*0020*/                   MOV R0, 0x160 ;', 25],
    ['        /*0030*/                   LDC R0, c[0x0][R0] ;', 25],
    ['        /*0040*/                   MOV R0, R0 ;', 25],
    ['        /*0050*/                   MOV R2, R0 ;', 25],
    ['    //## File "/home/user/cuda/sample/sample.cu", line 26', 26, true],
    ['        /*0060*/                   MOV R4, R2 ;', 26],
    ['        /*0070*/                   MOV R20, 32@lo((_Z6kernali + .L_1@srel)) ;', 26],
    ['        /*0080*/                   MOV R21, 32@hi((_Z6kernali + .L_1@srel)) ;', 26],
    ['        /*0090*/                   CALL.ABS.NOINC `(_Z3fooi) ;', 26],
    ['.L_1:', 26, true],
    ['        /*00a0*/                   MOV R0, R4 ;', 26],
    ['        /*00b0*/                   MOV R4, R2 ;', 26],
    ['        /*00c0*/                   MOV R2, R0 ;', 26],
    ['        /*00d0*/                   MOV R20, 32@lo((_Z6kernali + .L_2@srel)) ;', 26],
    ['        /*00e0*/                   MOV R21, 32@hi((_Z6kernali + .L_2@srel)) ;', 26],
    ['        /*00f0*/                   CALL.ABS.NOINC `(_Z3bari) ;', 26],
    ['.L_2:', 26, true],
    ['        /*0100*/                   MOV R4, R4 ;', 26],
    ['        /*0110*/                   IADD3 R4, R2, R4, RZ ;', 26],
    ['        /*0120*/                   MOV R2, 32@lo(arr) ;', 26],
    ['        /*0130*/                   MOV R3, 32@hi(arr) ;', 26],
    ['        /*0140*/                   MOV R2, R2 ;', 26],
    ['        /*0150*/                   MOV R3, R3 ;', 26],
    ['        /*0160*/                   ST.E.SYS [R2], R4 ;', 26],
    ['    //## File "/home/user/cuda/sample/sample.cu", line 27', 27, true],
    ['        /*0170*/                   ERRBAR ;', 27],
    ['        /*0180*/                   EXIT ;', 27],
    ['.L_3:', 27, true],
    ['        /*0190*/                   BRA `(.L_3);', 27],
  ];

  /* One nvdisasm/cuobjdump listing line: squeeze the documentation's column padding, highlight the SASS. */
  function sassLineHTML(line) {
    const m = /^\s*(\/\*[0-9a-f]{4}\*\/)\s*(@!?U?P\d\s+)?(.*)$/.exec(line);
    if (!m) return esc(line);
    const pred = (m[2] || '').trim();
    return `<span style="color:#8a8fa8">${m[1]}</span> ${GG.highlightLine(pred.padStart(4), 'sass')} ${GG.highlightLine(m[3], 'sass')}`;
  }

  function cfgFigure(host, ctx) {
    const f = ctx.figure(host, {
      title: 'What nvdisasm adds: control flow and source lines',
      hint: 'hover a block or a line',
      wide: true,
      caption: 'Both listings are sample nvdisasm output from NVIDIA’s CUDA Binary Utilities documentation (the kernel <code>_Z9acos_main10acosParams</code>, which demangles to <code>acos_main(acosParams)</code>, from its basic-disassembly example, and the <code>-g</code> line-information example). The graph is our drawing of the listing’s basic blocks and branches, the structure <code>nvdisasm -bbcfg</code> emits as DOT for Graphviz; the documentation’s source file for the <code>-g</code> example is not shown there, so only line numbers appear.',
    });
    const box = el('div', { class: 'hsb-cfg' });
    f.stage.append(box);
    onWidth(box, (w) => box.classList.toggle('two', w >= 700));
    const lst = el('div', { class: 'hsb-lst' });
    const vis = el('div', { class: 'hsb-w hsb-cfgsvg' });
    box.append(lst, vis);
    let mode = 'cfg', width = 0;
    const BLK = {
      B0: { t: 'B0 · entry', d: 'compute i, compare with n', w: 'Block 0 computes this thread’s index <code>i = blockIdx.x · blockDim.x + threadIdx.x</code> and compares it with <code>n</code>. <code>@P0 EXIT</code>: threads with i ≥ n leave right away.' },
      B1: { t: 'B1 · .L_1 · loop body', d: 'load, arccos, store', w: 'Block 1 is the loop body: load <code>x[i]</code>, evaluate arccos with a polynomial (<code>FFMA</code> chain) and a square root, store the result, step <code>i</code> by <code>blockDim.x · gridDim.x</code> and branch back to <code>.L_1</code> while i &lt; n. Reading it as a grid-stride loop is ours.' },
      B2: { t: 'B2 · exit', d: 'EXIT', w: 'Block 2 is reached when the loop condition fails: the thread exits.' },
      B3: { t: 'B3 · .L_2', d: 'BRA to itself', w: 'Block 3 branches to itself. It sits after the last <code>EXIT</code> and is never reached: padding that ends many kernels.' },
    };
    function renderList() {
      const src = mode === 'cfg' ? ACOS : LINEINFO;
      lst.innerHTML = `<pre tabindex="0">${src.map(([code, k, mark]) => `<span class="l${mark ? ' mk' : ''}" data-k="${k}">${mark ? esc(code.trim()) : sassLineHTML(code)}</span>`).join('')}</pre>`;
      $$(lst, '.l').forEach((l) => {
        const k = l.getAttribute('data-k');
        if (!k || k === '0') return;
        l.addEventListener('mouseenter', () => focus(mode === 'cfg' ? k : +k));
      });
    }
    function focus(k) {
      lst.classList.add('focus');
      $$(lst, '.l').forEach((l) => l.classList.toggle('hl', l.getAttribute('data-k') === String(k)));
      $$(vis, '[data-b]').forEach((g) => g.querySelector('rect').setAttribute('stroke', g.getAttribute('data-b') === String(k) ? 'var(--accent)' : g.getAttribute('data-base')));
      if (mode === 'cfg') f.setWhy(BLK[k].w);
      else {
        const n = LINEINFO.filter((r) => r[1] === k && !r[2]).length;
        f.setWhy(k === 25 ? `Source <b>line 25</b> compiled to <b>${n}</b> instructions: a load of a kernel parameter from the constant bank (<code>LDC … c[0x0][R0]</code>) and some register moves.`
          : k === 26 ? `Source <b>line 26</b> compiled to <b>${n}</b> instructions, including two calls (<code>CALL.ABS.NOINC</code> to <code>foo(int)</code> and <code>bar(int)</code>, demangled from <code>_Z3fooi</code> and <code>_Z3bari</code>), an add (<code>IADD3</code>) and a store to <code>arr</code>. One line of C++ can be a lot of SASS.`
            : `Source <b>line 27</b>, the end of the kernel: <b>${n}</b> instructions, an error barrier, <code>EXIT</code>, and the padding self-branch.`);
      }
    }
    function drawVis() {
      const W = Math.max(260, width);
      const svg = S('svg', { role: 'img' });
      if (mode === 'cfg') {
        svg.setAttribute('aria-label', 'Control flow graph: B0 entry block, which exits if i ≥ n or falls into B1, the loop body; B1 loops back to itself while i < n, then falls into B2, exit. B3 is an unreachable self-loop.');
        const bh = 44, bx = 4;
        const tw = Math.max(74, Math.min(110, W * 0.26));
        const bw = Math.min(260, W - tw - 54);
        const tx = bx + bw + 44;
        const pos = { B0: 8, B1: 90, B2: 184, B3: 262 };
        const defs = S('defs', {}, svg);
        const mk = S('marker', { id: 'hsb-ar', viewBox: '0 0 8 8', refX: 7, refY: 4, markerWidth: 7, markerHeight: 7, orient: 'auto' }, defs);
        S('path', { d: 'M0,0 L8,4 L0,8 z', fill: 'var(--ink-3)' }, mk);
        const edge = (d) => S('path', { d, fill: 'none', stroke: 'var(--ink-3)', 'stroke-width': 1.3, 'marker-end': 'url(#hsb-ar)' }, svg);
        const lab = (x, y, t, anchor) => Tx(svg, x, y, t, { 'font-size': 10, fill: 'var(--ink-3)', 'text-anchor': anchor || 'start' });
        const cx = bx + bw / 2;
        // terminal: the thread exits
        const ty = pos.B2 + 6;
        S('rect', { x: tx, y: ty, width: tw, height: bh - 12, rx: 16, fill: 'rgba(255,255,255,0.04)', stroke: 'var(--ink-3)' }, svg);
        Tx(svg, tx + tw / 2, ty + 20, 'thread exits', { 'font-size': 10.5, fill: 'var(--ink)', 'text-anchor': 'middle' });
        edge(`M${cx},${pos.B0 + bh} L${cx},${pos.B1 - 2}`);
        lab(cx + 6, pos.B0 + bh + 22, 'P0 false (i < n)');
        edge(`M${bx + bw},${pos.B0 + bh / 2} L${tx + tw / 2 - 8},${pos.B0 + bh / 2} Q${tx + tw / 2},${pos.B0 + bh / 2} ${tx + tw / 2},${pos.B0 + bh / 2 + 8} L${tx + tw / 2},${ty - 2}`);
        lab(bx + bw + 6, pos.B0 + bh / 2 - 6, '@P0 EXIT');
        edge(`M${bx + bw},${pos.B1 + bh - 12} C${bx + bw + 30},${pos.B1 + bh + 4} ${bx + bw + 30},${pos.B1 - 4} ${bx + bw + 2},${pos.B1 + 12}`);
        // back-edge label to the right of its loop arc; exit-edge label to the left of its arrow, so the two never run together
        Tx(svg, bx + bw + 30, pos.B1 + bh / 2 - 3, '@!P0 BRA', { 'font-size': 10, fill: 'var(--ink-3)' });
        Tx(svg, bx + bw + 30, pos.B1 + bh / 2 + 9, '.L_1', { 'font-size': 10, fill: 'var(--ink-3)' });
        edge(`M${cx},${pos.B1 + bh} L${cx},${pos.B2 - 2}`);
        lab(cx - 6, pos.B1 + bh + 26, 'P0 true (i ≥ n)', 'end');
        edge(`M${bx + bw},${pos.B2 + bh / 2} L${tx - 2},${pos.B2 + bh / 2}`);
        edge(`M${bx + bw},${pos.B3 + bh - 12} C${bx + bw + 30},${pos.B3 + bh + 4} ${bx + bw + 30},${pos.B3 - 4} ${bx + bw + 2},${pos.B3 + 12}`);
        lab(bx + bw + 4, pos.B3 + bh + 14, 'BRA .L_2');
        Object.keys(pos).forEach((k) => {
          const base = k === 'B3' ? 'var(--line-2)' : 'rgba(69,212,155,0.6)';
          const g = S('g', { 'data-b': k, tabindex: '0', 'data-base': base }, svg);
          S('rect', { x: bx, y: pos[k], width: bw, height: bh, rx: 8, fill: k === 'B3' ? 'rgba(255,255,255,0.03)' : 'rgba(69,212,155,0.1)', stroke: base, 'stroke-width': 1.4, 'stroke-dasharray': k === 'B3' ? '4 3' : '' }, g);
          Tx(g, bx + 10, pos[k] + 18, BLK[k].t, { 'font-size': 11.5, fill: 'var(--ink)', 'font-weight': 600 });
          Tx(g, bx + 10, pos[k] + 34, BLK[k].d, { 'font-size': 10.5, fill: 'var(--ink-3)' });
          g.addEventListener('mouseenter', () => focus(k));
          g.addEventListener('focus', () => focus(k));
          g.addEventListener('click', () => focus(k));
        });
        lab(bx + bw, pos.B3 - 6, 'unreachable', 'end');
        svg.setAttribute('viewBox', `0 0 ${W} ${pos.B3 + bh + 22}`);
      } else {
        const lines = [25, 26, 27];
        const counts = lines.map((k) => LINEINFO.filter((r) => r[1] === k && !r[2]).length);
        svg.setAttribute('aria-label', `Source lines 25, 26 and 27 of sample.cu with the number of SASS instructions each compiled to: ${counts.join(', ')}.`);
        const maxC = Math.max(...counts);
        Tx(svg, 0, 14, 'sample.cu', { 'font-size': 11.5, fill: 'var(--ink)', 'font-weight': 600 });
        Tx(svg, W, 14, 'SASS instructions per line', { 'font-size': 10, fill: 'var(--ink-3)', 'text-anchor': 'end' });
        const bw = W - 90;
        lines.forEach((k, i) => {
          const y = 30 + i * 44;
          const g = S('g', { 'data-b': String(k), tabindex: '0', 'data-base': 'var(--line-2)' }, svg);
          S('rect', { x: 0, y, width: W, height: 36, rx: 8, fill: 'rgba(255,255,255,0.03)', stroke: 'var(--line-2)', 'stroke-width': 1.3 }, g);
          Tx(g, 10, y + 22, `line ${k}`, { 'font-size': 11.5, fill: 'var(--control)', 'font-weight': 600 });
          S('rect', { x: 78, y: y + 12, width: (bw - 40) * (counts[i] / maxC), height: 12, rx: 3, fill: 'var(--core)' }, g);
          Tx(g, 84 + (bw - 40) * (counts[i] / maxC), y + 22, String(counts[i]), { 'font-size': 11, fill: 'var(--ink)' });
          g.addEventListener('mouseenter', () => focus(k));
          g.addEventListener('focus', () => focus(k));
          g.addEventListener('click', () => focus(k));
        });
        Tx(svg, 0, 30 + 3 * 44 + 12, 'the MOV and the NOP before line 25 carry no line marker', { 'font-size': 10, fill: 'var(--ink-3)' });
        svg.setAttribute('viewBox', `0 0 ${W} ${30 + 3 * 44 + 18}`);
      }
      vis.innerHTML = '';
      vis.append(svg);
    }
    function setMode(m) {
      mode = m;
      lst.classList.remove('focus');
      renderList();
      drawVis();
      focus(m === 'cfg' ? 'B1' : 26);
    }
    GG.ui.seg(f.controls, { label: 'nvdisasm option', value: 'cfg', options: [{ value: 'cfg', label: '-bbcfg · basic blocks' }, { value: 'g', label: '-g · source lines' }], onChange: setMode });
    onWidth(vis, (w) => { width = w; drawVis(); focus(mode === 'cfg' ? 'B1' : 26); });
    renderList();
  }

  GG.entry('cuda-binary-utilities', {
    render(body, ctx) {
      body.classList.add('hsb-body');
      const s = ctx.html(body, `
<p>Recall what <code>nvcc</code>, the ${T('nvcc', 'NVIDIA CUDA Compiler driver')}, produces: an ordinary host executable with a fat binary inside it, and inside that, <em>cubin</em> files that hold ${T('streaming-assembler', 'SASS')}, often next to ${T('parallel-thread-execution', 'PTX')} text. A cubin (CUDA binary) is itself an ELF file, the same format as the executable around it: a binary nested inside a binary. General-purpose tools stop at the outer layer. The CUDA Binary Utilities open the inner ones.</p>
<div data-slot="bx" class="wide"></div>
<h3>cuobjdump: whole binaries, or cubins</h3>
<p>One tool, <code>cuobjdump</code>, can be used to examine and manipulate the contents of entire host binaries (executables, object files, static libraries) or of the CUDA-specific <code>cubin</code> files that are normally embedded within those binaries. It lists the embedded cubins and PTX, extracts them as separate files, dumps each ${T('kernel', 'kernel')}’s SASS, dumps the PTX, and reports the resources each kernel uses, such as its ${T('registers', 'registers')} and ${T('shared-memory', 'shared memory')}:</p>
<div data-slot="res"></div>
<h3>nvdisasm: cubins only, with richer output</h3>
<p>Another, <code>nvdisasm</code>, is intended for manipulating <code>cubin</code> files. It can extract ${T('streaming-assembler', 'SASS assembler')} and manipulate it, e.g. constructing <em>control flow graphs</em> (the kernel’s straight-line runs of instructions, called basic blocks, and the jumps between them) and mapping assembly instructions to lines in CUDA program files.</p>
${GG.noteHTML('check', '<p>The glossary spells this tool <code>nvidisasm</code>. Its name is <code>nvdisasm</code>, as in NVIDIA’s <a href="https://docs.nvidia.com/cuda/cuda-binary-utilities/index.html">CUDA Binary Utilities documentation</a>.</p>')}
<div data-slot="cfg" class="wide"></div>
${GG.noteHTML('beyond', '<p><b>Two control flow graphs.</b> NVIDIA’s options table distinguishes them: with <code>-cfg</code> each node of the graph is a <em>hyperblock</em>, with <code>-bbcfg</code> each node is a <em>basic block</em>. In compiler terms a hyperblock is a larger region with a single entry that can merge several basic blocks, using predicated instructions in place of some branches. Fig. 2 draws the basic-block view.</p><p><b>More views from nvdisasm.</b> NVIDIA’s documentation lists a few more options: <code>-gi</code> adds function-inlining information to the source lines, <code>-gp</code> reads line information from the cubin’s <code>.nv_debug_line_sass</code> section, <code>-plr</code> prints each register’s life range in a column beside the code (where it is assigned, used and live), and <code>-json</code> emits the disassembly as JSON for other programs. Control-flow analysis needs the cubin’s relocation information; if that is missing, <code>-ndf</code> turns the analysis off.</p><p><b>The rest of the collection.</b> NVIDIA’s documentation covers four tools. Besides cuobjdump and nvdisasm there is <code>cu++filt</code>, which demangles CUDA C++ symbol names (it turns <code>_Z3addPfS_S_</code> back into <code>add(float*, float*, float*)</code>, and is handy for names like the cuBLASLt kernel in the ' + T('cuda-graph', 'CUDA Graphs') + ' entry), and <code>nvprune</code>, which strips a relocatable object file or static library down to the device code for chosen targets, for example keeping only the sm_120 cubins of a large library.</p>')}
<p>You can find their documentation <a href="https://docs.nvidia.com/cuda/cuda-binary-utilities/index.html">here</a>.</p>
<div data-slot="read"></div>`);
      guard(s.bx, 'Binary explorer', () => binExplorer(s.bx, ctx));
      guard(s.res, 'res-usage', () => ctx.code(s.res, {
        lang: 'text', caption: 'sample <code>cuobjdump -res-usage</code> output, from NVIDIA’s documentation',
        code: '$ cuobjdump test.cubin -res-usage\nResource usage:\n Common:\n  GLOBAL:56 CONSTANT[3]:28\n Function calculate:\n  REG:24 STACK:8 SHARED:0 LOCAL:0 CONSTANT[0]:472 CONSTANT[2]:24 TEXTURE:0 SURFACE:0 SAMPLER:0\n Function mysurf_func:\n  REG:38 STACK:8 SHARED:4 LOCAL:0 CONSTANT[0]:532 TEXTURE:8 SURFACE:7 SAMPLER:0\n Function mytexsampler_func:\n  REG:42 STACK:0 SHARED:0 LOCAL:0 CONSTANT[0]:472 TEXTURE:4 SURFACE:0 SAMPLER:1',
        notes: {
          1: '<code>-res-usage</code> (<code>--dump-resource-usage</code>) works on a cubin or on a whole host binary.',
          4: 'Resources shared by the whole cubin: bytes of global and constant data.',
          6: '<code>REG:24</code>: each thread of <code>calculate</code> uses 24 ' + T('registers', 'registers') + '. Per NVIDIA, REG, TEXTURE, SURFACE and SAMPLER are counts; the other values are bytes.',
          8: '<code>SHARED:4</code>: 4 bytes of static ' + T('shared-memory', 'shared memory') + ' per block. Register and shared-memory use per kernel are two of the things that limit ' + T('occupancy', 'occupancy') + '.',
        },
      }));
      guard(s.cfg, 'CFG figure', () => cfgFigure(s.cfg, ctx));
      ctx.reading(s.read, [
        { href: 'https://docs.nvidia.com/cuda/cuda-binary-utilities/index.html', label: 'CUDA Binary Utilities documentation', note: 'cuobjdump, nvdisasm, cu++filt and nvprune, with the sample outputs used above and per-architecture SASS instruction set references' },
      ]);
    },
  });

})();
