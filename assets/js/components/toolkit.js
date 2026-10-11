/* components/toolkit.js — GG.components.toolkit
   ─────────────────────────────────────────────────────────────────────────────
   The CUDA Toolkit stack, after the glossary's cuda-toolkit figure (adapted there
   from the Professional CUDA C Programming Guide). Inside a CPU (host) box:

       Applications            L-shaped, reaching down beside the layers below it
       CUDA Libraries
       CUDA Runtime API
       CUDA Driver API         ─ ─ dashed divider ─ ─
       NVIDIA GPU Driver
   and a GPU (device) box underneath. Arrows point from caller to callee, exactly
   as in the reference: Applications→CUDA Libraries, CUDA Libraries→CUDA Runtime API,
   Applications→CUDA Runtime API, CUDA Runtime API→CUDA Driver API,
   Applications→CUDA Driver API, NVIDIA GPU Driver→GPU.

   USAGE
     const f = ctx.figure(slot, { title: 'The CUDA Toolkit' });
     const tk = GG.components.toolkit(f.stage, { highlight: 'runtime', files: true });
     tk.call('app-runtime-driver-gpu', { tags: { runtime: 'cudaMalloc', 'driver-api': 'cuMemAlloc' } });

   GG.components.toolkit(parent, opts) → api
     parent             element to append to (usually f.stage)
     opts.highlight     key | key[]  initial highlight. Keys: 'apps' 'libs' 'runtime'
                        'driver-api' 'driver' 'gpu' (+ 'nvml' 'smi' when opts.nvml).
                        Lit layers glow and the rest dims. With one key, that layer's
                        incoming and outgoing arrows light (who calls it, whom it calls);
                        with several keys, the arrows whose two ends are both lit light.
                        Unknown keys are ignored with a console.warn.
     opts.files         default false. Annotate the Linux files on their layers:
                        libcudart.so on the Runtime API, libcuda.so on the Driver API,
                        nvidia.ko on the NVIDIA GPU Driver (plus libnvml.so, the glossary's name for libnvidia-ml.so, on NVML), and
                        label the dashed divider as the user-space / kernel-space boundary
                        (the Driver API is the userspace part of the drivers; nvidia.ko runs
                        in privileged mode).
     opts.nvml          default false. Adds a side column inside the CPU box:
                        nvidia-smi → NVML → NVIDIA GPU Driver, i.e. management tools that
                        bypass the Runtime and Driver APIs.
     opts.examples      default false. Example chips: cuBLAS, cuDNN and, dashed, "CUTLASS
                        (kernel toolkit)" in CUDA Libraries (data-term links); PyTorch and
                        "your CUDA C++ program" (link to cuda-c) in Applications.
     opts.interactive   default true. Hover / tap / keyboard-focus a layer to preview it:
                        it and its incoming/outgoing arrows light, the caption strip shows a
                        one-line explanation with data-term links. Click / tap / Enter
                        selects (again or Esc clears). Keyboard: one Tab stop, arrow keys
                        move between layers, Home / End.
     opts.caption       default = interactive || !!animateCall. Show the caption strip.
     opts.animateCall   path name, or {path, tags, say, summary}: statically light that path
                        (it takes precedence over opts.highlight until the reader interacts), play
                        the call packet once when the figure first scrolls into view (not
                        under prefers-reduced-motion), and add a "Send the call" button
                        to the caption strip so readers can replay it.
     opts.ariaLabel     override the accessible description.

   Paths (see GG.components.toolkit.PATHS):
     'app-runtime-driver-gpu'        Applications → Runtime API → Driver API → GPU Driver → GPU
     'app-libs-runtime-driver-gpu'   Applications → Libraries → Runtime API → Driver API → GPU Driver → GPU
     'app-driver-gpu'                Applications → Driver API → GPU Driver → GPU
     'smi-nvml-driver-gpu'           nvidia-smi → NVML → GPU Driver → GPU   (only with opts.nvml)

   Sizing / legibility
     The layout is 'narrow' below 560 px container width, 'wide' from 560. The SVG's viewBox width
     follows the rendered width (wide 560–760 units, narrow 260–380, or 300–380 with opts.nvml) and
     is redrawn when it changes, so one unit is one CSS px or more: labels never render below 10 px
     on a stage at least 260 px wide (300 px with opts.nvml; the stage is 302 px on a 360 px phone).
     Below that floor the drawing scales down. In tight boxes the layout narrows a file chip's
     padding, then drops its document glyph; at narrow widths the user-space / kernel-space marks
     break onto two lines. A packet tag pill slides sideways to stay inside the drawing. Keyboard
     focus on a layer survives a redraw.

   api
     api.el, api.svg (the current <svg>; it is replaced when the layout redraws, so re-read
     api.svg rather than keeping it), api.layout ('wide' | 'narrow')
     api.highlight(keys)       replace the highlight (clears any shown path; cancels a running call)
     api.clear()               remove highlight, shown path and stop any running call
     api.keys()                → highlighted keys
     api.showPath(name|null)   statically light a path's layers and exactly its arrows
     api.call(name, o?)        animate a call packet down the path once → Promise<boolean>
                               (true when it reached the GPU, false if cancelled or unknown).
                               o.tags {layerKey: 'text'}: the packet becomes a pill that shows
                               this text while in that layer (e.g. {runtime:'cudaMalloc',
                               'driver-api':'cuMemAlloc'}). o.say {layerKey: 'html'}: caption
                               text for that step instead of the layer's description.
                               o.summary 'html': caption shown when the call arrives.
                               Under reduced motion the packet jumps from layer to layer.
                               Afterwards the path stays lit (showPath) until changed.
     api.on(event, fn)         'select' fn({key, keys, layer}) · 'hover' fn({key, layer}|null)
                               · 'step' fn({path, key, index, count}) as a call enters a layer
                               · 'done' fn({path, ok}) when a call ends
     api.destroy()

   Static metadata
     GG.components.toolkit.LAYERS     [{key, name, term, terms:[ids shown as links], file?,
                                        fileTerm?, desc, optional?}]
     GG.components.toolkit.LAYERS_BY  keyed by key
     GG.components.toolkit.PATHS      {name: [layer keys in order]}
     GG.components.toolkit.ARROWS     [{id, from, to}]
   CSS prefix: tk-  (never tk-com/str/num/kw/type/fn/reg/op/attr/dir/pun/lnum/dec,
   which gg.css uses for code tokens)
   ───────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  const GG = window.GG;
  if (!GG) return;
  GG.components = GG.components || {};

  /* ───────────── metadata ───────────── */
  const LAYERS = [
    { key: 'apps', name: 'Applications', term: 'cuda-software-platform', terms: ['cuda-software-platform', 'cuda-c'],
      desc: 'Your program, or a framework like PyTorch. It can call the CUDA libraries, the CUDA Runtime API, or even the CUDA Driver API directly.' },
    { key: 'libs', name: 'CUDA Libraries', term: 'cuda-software-platform', terms: ['cublas', 'cudnn', 'cutlass'],
      desc: 'Libraries of high-performance kernels built on the CUDA APIs, like cuBLAS for linear algebra and cuDNN for deep neural networks, plus tools like CUTLASS for composing your own.' },
    { key: 'runtime', name: 'CUDA Runtime API', term: 'cuda-runtime-api', terms: ['cuda-runtime-api', 'libcudart'], file: 'libcudart.so', fileTerm: 'libcudart',
      desc: 'Wraps the Driver API in a higher-level, more ergonomic API for the same functions; most CUDA programs use it. On Linux its shared object is usually named libcudart.so, though it can also be linked statically.' },
    { key: 'driver-api', name: 'CUDA Driver API', term: 'cuda-driver-api', terms: ['cuda-driver-api', 'libcuda'], file: 'libcuda.so', fileTerm: 'libcuda',
      desc: 'The userspace component of the NVIDIA drivers, with C-library-like utilities such as cuMemAlloc for allocating GPU memory. Few programs call it directly. On Linux: libcuda.so, linked dynamically.' },
    { key: 'driver', name: 'NVIDIA GPU Driver', term: 'nvidia-gpu-drivers', terms: ['nvidia-gpu-drivers', 'nvidia-ko'], file: 'nvidia.ko', fileTerm: 'nvidia-ko',
      desc: 'The only component that communicates directly with the GPU. On Linux its core is the nvidia.ko kernel module, which runs in privileged mode.' },
    { key: 'gpu', name: 'GPU', term: 'device-hardware', terms: ['device-hardware'],
      desc: 'The device, where kernels run. Everything above it runs on the CPU, the host.' },
    { key: 'nvml', name: 'NVML', term: 'nvml', terms: ['nvml', 'libnvml'], file: 'libnvml.so', fileTerm: 'libnvml', optional: true,
      desc: 'The NVIDIA Management Library, for monitoring and managing GPU state: power draw, temperature, allocated memory, power limits. On Linux the file is libnvidia-ml.so (the glossary calls it libnvml.so).' },
    { key: 'smi', name: 'nvidia-smi', term: 'nvidia-smi', terms: ['nvidia-smi'], optional: true,
      desc: 'The command-line utility for querying and managing GPU state through NVML. Its text output is not guaranteed stable; NVML’s C API is.' },
  ];
  const BY = {};
  LAYERS.forEach((l) => { BY[l.key] = l; });
  const ARROWS = [
    { id: 'a1', from: 'apps', to: 'libs' },
    { id: 'a2', from: 'libs', to: 'runtime' },
    { id: 'a3', from: 'apps', to: 'runtime' },
    { id: 'a4', from: 'runtime', to: 'driver-api' },
    { id: 'a5', from: 'apps', to: 'driver-api' },
    { id: 'a6', from: 'driver', to: 'gpu' },
    { id: 'n1', from: 'smi', to: 'nvml', nvml: true },
    { id: 'n2', from: 'nvml', to: 'driver', nvml: true },
  ];
  const PATHS = {
    'app-runtime-driver-gpu': ['apps', 'runtime', 'driver-api', 'driver', 'gpu'],
    'app-libs-runtime-driver-gpu': ['apps', 'libs', 'runtime', 'driver-api', 'driver', 'gpu'],
    'app-driver-gpu': ['apps', 'driver-api', 'driver', 'gpu'],
    'smi-nvml-driver-gpu': ['smi', 'nvml', 'driver', 'gpu'],
  };
  const EX_APPS = [{ t: 'PyTorch' }, { t: 'your CUDA C++ program', term: 'cuda-c' }];
  const EX_LIBS = [{ t: 'cuBLAS', term: 'cublas' }, { t: 'cuDNN', term: 'cudnn' }, { t: 'CUTLASS (kernel toolkit)', term: 'cutlass', tool: true, aria: 'CUTLASS, a toolkit for composing kernels rather than a library of ready-made ones' }];
  // the CUTLASS chip is drawn with a dashed outline: the glossary separates kernel libraries
  // (cuBLAS, cuDNN) from tools for composing kernels yourself (CUTLASS)

  /* ───────────── styles ───────────── */
  GG.css(`
.tk { position: relative; }
.tk-svg { display: block; width: 100%; height: auto; max-width: 860px; margin: 0 auto; overflow: visible; -webkit-tap-highlight-color: transparent; }
.tk[data-layout="narrow"] .tk-svg { max-width: 470px; }
.tk-svg text { pointer-events: none; }
.tk-svg .tk-cpu { fill: rgba(184,164,255,0.035); stroke: rgba(184,164,255,0.42); stroke-width: 1.2; }
.tk-svg .tk-gpubox { fill: rgba(255,255,255,0.02); stroke: var(--line-2); stroke-width: 1.2; transition: stroke .2s, fill .2s; }
.tk-svg .tk-big { font-family: var(--font-display); font-weight: 800; letter-spacing: 0.02em; }
.tk-svg .tk-big.h { fill: var(--host); }
.tk-svg .tk-big.d { fill: var(--ink); }
.tk-svg .tk-sub { font-family: var(--font-mono); fill: var(--ink-3); }
.tk-svg .tk-shape { fill: var(--surface-2); stroke: none; transition: fill .2s; }
.tk-svg .tk-shape.app { fill: var(--surface-3); }
.tk-svg .tk-edge { fill: none; stroke: var(--line-2); stroke-width: 1.2; transition: stroke .2s; }
.tk-svg .tk-divl { stroke: var(--ink-3); stroke-width: 1; stroke-dasharray: 6 6; }
.tk-svg .tk-bnd { font-family: var(--font-mono); fill: var(--ink-3); }
.tk-svg .tk-lab { font-family: var(--font-mono); font-weight: 500; fill: var(--ink); }
.tk-svg .tk-chip rect { fill: var(--bg-2); stroke: var(--line-2); stroke-width: 1; transition: stroke .2s; }
.tk-svg .tk-chip text { font-family: var(--font-mono); fill: var(--ink-2); }
.tk-svg a.tk-chip { cursor: pointer; }
.tk-svg a.tk-chip text { fill: var(--ink); }
.tk-svg a.tk-chip:hover rect, .tk-svg a.tk-chip:focus-visible rect { stroke: var(--accent); }
.tk-svg a.tk-chip:focus { outline: none; }
.tk-svg .tk-chip.tk-tool rect { fill: transparent; stroke-dasharray: 4 2.5; }
.tk-svg .tk-file rect { fill: rgba(8,9,14,0.7); stroke: rgba(184,164,255,0.4); stroke-width: 1; stroke-dasharray: 3 2; }
.tk-svg .tk-file text { font-family: var(--font-mono); fill: #d9d0ff; }
.tk-svg .tk-file path { fill: none; stroke: #bfb1ff; stroke-width: 1; }
.tk-svg .tk-hit { fill: transparent; }
.tk-svg .tk-ring { fill: none; stroke: var(--accent); stroke-width: 1.5; opacity: 0; }
.tk-svg .tk-ly { outline: none; transition: opacity .22s ease; }
.tk-int .tk-svg .tk-ly { cursor: pointer; }
.tk-svg .tk-ly:focus-visible .tk-ring { opacity: 1; }
.tk-svg .tk-ly.tk-on .tk-shape { fill: #2a2542; }
.tk-svg .tk-ly.tk-on .tk-edge { stroke: var(--host); stroke-width: 1.6; }
.tk-svg .tk-ly.tk-on .tk-lab { fill: #ffffff; }
.tk-svg .tk-ly.tk-on .tk-gpubox { stroke: var(--ink-2); fill: rgba(236,238,246,0.05); }
.tk-svg .tk-ly.tk-cur .tk-shape { fill: #3a3160; }
.tk-svg .tk-ly.tk-cur .tk-edge { stroke: #d8ccff; }
.tk-svg .tk-sm rect.b { fill: var(--surface-2); stroke: var(--line-2); stroke-width: 1; }
.tk-svg .tk-sm rect.s { fill: rgba(111,166,255,0.45); }
.tk-svg .tk-sm rect.c { fill: rgba(69,212,155,0.5); transition: fill .25s; }
.tk-svg .tk-ly.tk-on .tk-sm rect.c { fill: rgba(69,212,155,0.8); }
.tk-svg .tk-flash .tk-sm rect.c { fill: #8fffd0; }
.tk-svg .tk-flash .tk-gpubox { stroke: var(--core); }
.tk-svg .tk-ar { transition: opacity .22s ease; }
.tk-svg .tk-ar path.l { fill: none; stroke: var(--ink-3); stroke-width: 1.4; transition: stroke .2s; }
.tk-svg .tk-ar path.h { fill: var(--ink-3); transition: fill .2s; }
.tk-svg .tk-ar.tk-on path.l { stroke: var(--control); stroke-width: 2; }
.tk-svg .tk-ar.tk-on path.h { fill: var(--control); }
.tk-svg.tk-has .tk-ly:not(.tk-on) { opacity: 0.3; }
.tk-svg.tk-has .tk-ar:not(.tk-on) { opacity: 0.22; }
.tk-svg .tk-pkt { pointer-events: none; }
.tk-svg .tk-pkt .halo { fill: rgba(255,198,92,0.25); }
.tk-svg .tk-pkt .dot { fill: var(--control); }
.tk-svg .tk-pkt rect { fill: var(--control); }
.tk-svg .tk-pkt text { font-family: var(--font-mono); font-weight: 600; fill: #241703; }
/* gg.css's '.fig svg text:not([fill])' outranks the rule above; the tag text also carries a fill attribute */
.tk-svg .tk-pkt text.tk-pkt-t { fill: #241703; }
.tk-svg .tk-pkt path.lead { fill: none; stroke: var(--control); stroke-width: 1.3; }
.tk-foot { display: flex; align-items: center; gap: 10px 14px; flex-wrap: wrap; margin: 10px auto 0; max-width: 860px; }
.tk[data-layout="narrow"] .tk-foot { max-width: 470px; }
.tk-cap { flex: 1 1 260px; margin: 0; padding: 9px 12px 10px; border: 1px solid var(--line); border-radius: 10px; background: rgba(8,9,14,0.55);
  font-size: 13.5px; line-height: 1.5; color: var(--ink-2); min-height: calc(3 * 1.5em + 21px); }
.tk[data-layout="narrow"] .tk-cap { font-size: 13px; min-height: calc(4 * 1.5em + 21px); }
.tk-cap.tk-idle { font-family: var(--font-mono); font-size: 12px; color: var(--ink-3); display: flex; align-items: center; }
.tk-cap b { color: var(--ink); font-weight: 600; }
.tk-cap .tk-step { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.06em; color: var(--control); margin-right: 6px; }
.tk-cap .tk-links { white-space: nowrap; }
.tk-cap a.term { white-space: nowrap; }
@media (prefers-reduced-motion: reduce) { .tk-svg .tk-ly, .tk-svg .tk-ar { transition: none; } }
`);

  /* ───────────── helpers ───────────── */
  const S = (tag, attrs, parent) => GG.svg(tag, attrs, parent);
  const r2 = (v) => Math.round(v * 100) / 100;
  const tw = (s, fs) => s.length * fs * 0.6;
  const PILL_H = 18;
  function text(parent, x, y, str, cls, size, anchor) {
    const t = S('text', { x: r2(x), y: r2(y), class: cls, 'font-size': size, 'text-anchor': anchor || 'middle' }, parent);
    t.textContent = str;
    return t;
  }
  function linkHTML(id, label) {
    const t = GG.byId && GG.byId[id];
    const sec = t && GG.SECTIONS ? GG.SECTIONS[t.section] : null;
    const style = sec ? ` style="--c:${sec.color}"` : '';
    return `<a class="term" data-term="${id}" href="#${id}"${style}>${GG.esc(label)}</a>`;
  }
  const LINK_TEXT = { 'cuda-software-platform': 'CUDA software platform', 'cuda-c': 'CUDA C++', cublas: 'cuBLAS', cudnn: 'cuDNN', cutlass: 'CUTLASS',
    'cuda-runtime-api': 'CUDA Runtime API', libcudart: 'libcudart.so', 'cuda-driver-api': 'CUDA Driver API', libcuda: 'libcuda.so',
    'nvidia-gpu-drivers': 'NVIDIA GPU drivers', 'nvidia-ko': 'nvidia.ko', 'device-hardware': 'Device hardware', nvml: 'NVML', libnvml: 'libnvml.so', 'nvidia-smi': 'nvidia-smi' };

  /* ───────────── geometry ───────────── */
  /* The viewBox width W follows the rendered width (clamped to Wmin..Wmax), so one user unit is
     one CSS px whenever the stage is at least Wmin wide and every font size below is a CSS px size.
     x1 = W - xr; WminN replaces Wmin when the NVML column is drawn. min is the floor for any label
     the layout shrinks to fit. fr: x positions as fractions of the x0..x1 span (right edges of Libraries / Runtime, steps of the Applications L,
     arrow columns). The narrow set widens Libraries and Runtime so their labels fit beside the
     NVML column at 10 px or more. */
  const TP = {
    wide: { W: 760, Wmin: 560, Wmax: 760, xr: 30, cpuX: 12, x0: 150, x0n: 150, colX: 24, colW: 112, top: 30, lab: 14.5, chip: 10.5, file: 10.5, bnd: 10, big: 30, sub: 10, min: 10,
      appsH: 62, libsH: 56, rtH: 58, drvH: 42, gap: 18, gap2: 26, padB: 20, gpuGap: 30, gpuH: 78, chipH: 20, fileH: 20, smW: 36, smGap: 14,
      fr: { libsR: 0.4735, step1: 0.5039, rtR: 0.6912, step2: 0.7196, ax12: 0.2373, ax3: 0.6, ax5: 0.8529, ax6: 0.5 } },
    narrow: { W: 360, Wmin: 260, WminN: 300, Wmax: 380, xr: 16, cpuX: 6, x0: 16, x0n: 110, colX: 12, colW: 88, top: 50, lab: 12, chip: 10, file: 10, bnd: 10, big: 22, sub: 10, min: 10,
      appsH: 44, libsH: 46, rtH: 48, drvH: 38, gap: 14, gap2: 22, padB: 12, gpuGap: 24, gpuH: 64, chipH: 18, fileH: 18, smW: 26, smGap: 10,
      fr: { libsR: 0.58, step1: 0.61, rtR: 0.78, step2: 0.81, ax12: 0.29, ax3: 0.71, ax5: 0.895, ax6: 0.5 } },
  };
  const fitW = (kind, w, nvml) => { const T = TP[kind]; return w > 0 ? Math.round(Math.max(nvml && T.WminN || T.Wmin, Math.min(T.Wmax, w))) : T.W; };

  /* lay out a label with optional file chip or chip row inside a box of width w */
  function plan(T, w, o) {
    const pad = 8;
    const lo = Math.max(T.min, T.lab * 0.8);
    let fs = T.lab;
    const labW = () => tw(o.label, fs);
    if (o.chips && o.chips.length) {
      const cw = o.chips.map((c) => tw(c.t, T.chip) + 14);
      const rows = [];
      let row = [], rw = 0;
      cw.forEach((wd, i) => {
        if (row.length && rw + 5 + wd > w - 2 * pad) { rows.push({ items: row, w: rw }); row = []; rw = 0; }
        rw += (row.length ? 5 : 0) + wd;
        row.push(i);
      });
      if (row.length) rows.push({ items: row, w: rw });
      while (labW() > w - 2 * pad && fs > lo) fs -= 0.5;
      const labBase = fs + 9;
      const chipTop = labBase + 8;
      const chips = [];
      rows.forEach((r, ri) => {
        let x = (w - r.w) / 2;
        r.items.forEach((i) => { chips.push({ c: o.chips[i], dx: x, dy: chipTop + ri * (T.chipH + 5), w: cw[i] }); x += cw[i] + 5; });
      });
      const h = Math.max(o.minH, chipTop + rows.length * (T.chipH + 5) - 5 + 9);
      return { h, fs, label: { dx: w / 2, dy: labBase }, chips };
    }
    const res = o.reserveR || 0;
    if (!o.file) {
      while (labW() > w - 2 * pad - 2 * res && fs > lo) fs -= 0.5;
      return { h: o.minH, fs, label: { dx: w / 2, dy: o.minH / 2 + fs * 0.36 } };
    }
    // file chip: document glyph + name. In a tight box first narrow the side padding, then drop
    // the glyph, and only as a last resort shrink the type.
    let ffs = T.file, glyph = true, fpad = pad;
    const fwOf = () => tw(o.file, ffs) + (glyph ? 22 : 12);
    let fw = fwOf();
    if (fw > w - 2 * fpad) fpad = 3;
    if (fw > w - 2 * fpad) { glyph = false; fw = fwOf(); }
    if (fw > w - 2 * fpad) { ffs = Math.max(8, (w - 2 * fpad - 12) / (o.file.length * 0.6)); fw = fwOf(); }
    const r0 = pad + fw + 10, r1 = w - pad - res;
    const fitInline = () => labW() <= r1 - r0;
    if (!fitInline() && fs > T.lab * 0.85) { fs = Math.max(T.min, T.lab * 0.9); }
    if (fitInline()) {
      let cx = w / 2;
      if (cx - labW() / 2 < r0) cx = r0 + labW() / 2;
      if (cx + labW() / 2 > r1) cx = (r0 + r1) / 2;
      return { h: o.minH, fs, label: { dx: cx, dy: o.minH / 2 + fs * 0.36 }, file: { dx: pad, dy: o.minH / 2 - T.fileH / 2, w: fw, fs: ffs, glyph } };
    }
    // stacked: label on top, file chip under it; both kept clear of the reserved right-hand zone
    fs = T.lab;
    while (labW() > w - 2 * pad - res && fs > lo) fs -= 0.5;
    const cx = Math.max(pad + labW() / 2, Math.min(w / 2, w - pad - res - labW() / 2));
    const h = Math.max(o.minH, fs + 9 + 7 + T.fileH + 8);
    const fdx = Math.max(fpad, Math.min(cx - fw / 2, w - fpad - res - fw));
    return { h, fs, label: { dx: cx, dy: fs + 9 }, file: { dx: fdx, dy: fs + 16, w: fw, fs: ffs, glyph } };
  }

  function geometry(kind, o, W) {
    W = W || TP[kind].W;
    const T = Object.assign({}, TP[kind], { W, x1: W - TP[kind].xr });
    const g = { kind, T, W: T.W };
    const x0 = o.nvml ? T.x0n : T.x0, x1 = T.x1;
    const fx = (f) => x0 + f * (x1 - x0);
    const F = T.fr;
    Object.assign(g, { x0, x1, libsR: fx(F.libsR), step1: fx(F.step1), rtR: fx(F.rtR), step2: fx(F.step2), ax12: fx(F.ax12), ax3: fx(F.ax3), ax5: fx(F.ax5), ax6: fx(F.ax6) });
    // user space / kernel space on one line each, or on two ('user' / 'space') when one line would
    // squeeze the NVIDIA GPU Driver label below its legible minimum
    const one = (x1 - x0) - 16 - (tw('kernel space', T.bnd) + 10) >= tw('NVIDIA GPU Driver', Math.max(T.min, T.lab * 0.85));
    g.bnd = one ? [['user space'], ['kernel space']] : [['user', 'space'], ['kernel', 'space']];
    const bndW = o.files ? Math.max(...g.bnd.flat().map((s) => tw(s, T.bnd))) + 10 : 0;

    g.apps = { top: T.top, plan: plan(T, x1 - x0, { label: 'Applications', chips: o.examples ? EX_APPS : null, minH: T.appsH }) };
    // the library call starts 12 units above the Applications band's bottom on the ax12 column; when a
    // chip in the bottom row sits on that column, add room under the chips so the packet clears it
    if (g.apps.plan.chips && g.apps.plan.chips.length) {
      const ch = g.apps.plan.chips, lastDy = ch[ch.length - 1].dy, cx = g.ax12 - x0;
      if (ch.some((c) => c.dy === lastDy && c.dx < cx + 11 && c.dx + c.w > cx - 11)) g.apps.plan.h += 14;
    }
    g.apps.bottom = g.apps.top + g.apps.plan.h;
    g.libs = { top: g.apps.bottom + T.gap, plan: plan(T, g.libsR - x0, { label: 'CUDA Libraries', chips: o.examples ? EX_LIBS : null, minH: T.libsH }) };
    g.libs.bottom = g.libs.top + g.libs.plan.h;
    g.runtime = { top: g.libs.bottom + T.gap2, plan: plan(T, g.rtR - x0, { label: 'CUDA Runtime API', file: o.files ? 'libcudart.so' : null, minH: T.rtH }) };
    g.runtime.bottom = g.runtime.top + g.runtime.plan.h;
    const dTop = g.runtime.bottom + T.gap2;
    g.dapi = { top: dTop, plan: plan(T, x1 - x0, { label: 'CUDA Driver API', file: o.files ? 'libcuda.so' : null, minH: T.drvH, reserveR: bndW }) };
    g.dapi.bottom = dTop + g.dapi.plan.h;
    g.drv = { top: g.dapi.bottom, plan: plan(T, x1 - x0, { label: 'NVIDIA GPU Driver', file: o.files ? 'nvidia.ko' : null, minH: T.drvH, reserveR: bndW }) };
    g.drv.bottom = g.drv.top + g.drv.plan.h;
    g.bndW = bndW;
    g.cpu = [T.cpuX, T.cpuX, T.W - 2 * T.cpuX, g.drv.bottom + T.padB - T.cpuX];
    g.gpuTop = g.drv.bottom + T.padB + T.gpuGap;
    g.gpu = [T.cpuX, g.gpuTop, T.W - 2 * T.cpuX, T.gpuH];
    g.H = Math.ceil(g.gpuTop + T.gpuH + T.cpuX);

    if (o.nvml) {
      const cx = T.colX + T.colW / 2;
      g.col = { x: T.colX, w: T.colW, cx };
      g.smi = { box: [T.colX, g.libs.top, T.colW, g.libs.plan.h], plan: plan(T, T.colW, { label: 'nvidia-smi', minH: g.libs.plan.h }) };
      // the column is too narrow for an inline file chip, so plan() stacks libnvml.so under the label
      const np = plan(T, T.colW, { label: 'NVML', file: o.files ? 'libnvml.so' : null, minH: g.runtime.plan.h });
      g.nvml = { box: [T.colX, g.runtime.top, T.colW, np.h], plan: np };
    }

    // GPU box contents
    const labRight = T.cpuX + (kind === 'wide' ? 18 : 12) + Math.max(tw('the device', T.sub), 40);
    const smX0 = Math.max(x0, labRight + 12), smX1 = x1;
    const n = Math.max(3, Math.floor((smX1 - smX0 + T.smGap) / (T.smW + T.smGap)));
    const tot = n * T.smW + (n - 1) * T.smGap;
    const sx = smX0 + (smX1 - smX0 - tot) / 2;
    const smH = T.gpuH - (kind === 'wide' ? 30 : 24);
    g.sms = [];
    for (let i = 0; i < n; i++) g.sms.push([sx + i * (T.smW + T.smGap), g.gpuTop + (T.gpuH - smH) / 2, T.smW, smH]);

    // arrows: [id, d, tip x, tip y]
    const A = {};
    const v = (id, x, ya, yb) => { A[id] = { d: `M${r2(x)} ${r2(ya)}V${r2(yb)}`, tip: [x, yb], dir: 'down' }; };
    v('a1', g.ax12, g.apps.bottom, g.libs.top);
    v('a2', g.ax12, g.libs.bottom, g.runtime.top);
    v('a3', g.ax3, g.libs.bottom, g.runtime.top);
    v('a4', g.ax12, g.runtime.bottom, g.dapi.top);
    v('a5', g.ax5, g.runtime.bottom, g.dapi.top);
    v('a6', g.ax6, g.drv.bottom, g.gpuTop);
    const dCy = g.dapi.top + g.dapi.plan.h / 2, gCy = g.drv.top + g.drv.plan.h / 2;
    if (o.nvml) {
      const c = g.col.cx;
      v('n1', c, g.smi.box[1] + g.smi.box[3], g.nvml.box[1]);
      A.n2 = { d: `M${r2(c)} ${r2(g.nvml.box[1] + g.nvml.box[3])}V${r2(gCy)}H${r2(x0)}`, tip: [x0, gCy], dir: 'right' };
    }
    g.arrows = A;

    // call paths: points {x, y, key?, arrow?}; arrow = the arrow the segment into this point travels along
    const ins = (top) => top + 11;
    const P = {};
    const tail = (xIn) => [
      { x: xIn, y: dCy }, { x: g.ax6, y: dCy }, { x: g.ax6, y: g.drv.top + 2, key: 'driver' }, { x: g.ax6, y: gCy },
      { x: g.ax6, y: g.drv.bottom }, { x: g.ax6, y: g.gpuTop, key: 'gpu', arrow: 'a6' }, { x: g.ax6, y: g.gpuTop + 12 },
    ];
    P['app-libs-runtime-driver-gpu'] = [
      { x: g.ax12, y: g.apps.bottom - 12, key: 'apps' },
      { x: g.ax12, y: g.libs.top, key: 'libs', arrow: 'a1' }, { x: g.ax12, y: g.libs.bottom },
      { x: g.ax12, y: g.runtime.top, key: 'runtime', arrow: 'a2' }, { x: g.ax12, y: g.runtime.bottom },
      { x: g.ax12, y: g.dapi.top, key: 'driver-api', arrow: 'a4' }, ...tail(g.ax12),
    ];
    P['app-runtime-driver-gpu'] = [
      { x: g.ax3, y: g.libs.bottom - 12, key: 'apps' },
      { x: g.ax3, y: g.runtime.top, key: 'runtime', arrow: 'a3' }, { x: g.ax3, y: ins(g.runtime.top) }, { x: g.ax12, y: ins(g.runtime.top) }, { x: g.ax12, y: g.runtime.bottom },
      { x: g.ax12, y: g.dapi.top, key: 'driver-api', arrow: 'a4' }, ...tail(g.ax12),
    ];
    P['app-driver-gpu'] = [
      { x: g.ax5, y: g.runtime.bottom - 12, key: 'apps' },
      { x: g.ax5, y: g.dapi.top, key: 'driver-api', arrow: 'a5' }, ...tail(g.ax5),
    ];
    if (o.nvml) {
      const c = g.col.cx;
      P['smi-nvml-driver-gpu'] = [
        { x: c, y: g.smi.box[1] + g.smi.box[3] - 10, key: 'smi' },
        { x: c, y: g.nvml.box[1], key: 'nvml', arrow: 'n1' }, { x: c, y: g.nvml.box[1] + g.nvml.box[3] },
        { x: c, y: gCy, arrow: 'n2' }, { x: x0, y: gCy, key: 'driver', arrow: 'n2' },
        { x: g.ax6, y: gCy }, { x: g.ax6, y: g.drv.bottom }, { x: g.ax6, y: g.gpuTop, key: 'gpu', arrow: 'a6' }, { x: g.ax6, y: g.gpuTop + 12 },
      ];
    }
    g.paths = P;
    return g;
  }

  /* ───────────── component ───────────── */
  function toolkit(parent, opts) {
    opts = opts || {};
    const nvml = !!opts.nvml, files = !!opts.files, examples = !!opts.examples;
    const interactive = opts.interactive !== false;
    const ac = opts.animateCall ? (typeof opts.animateCall === 'string' ? { path: opts.animateCall } : opts.animateCall) : null;
    const showCap = opts.caption !== undefined ? !!opts.caption : (interactive || !!ac);
    const canHover = !!(window.matchMedia && matchMedia('(hover: hover)').matches);
    const order = ['apps', 'libs', 'runtime', 'driver-api', 'driver', 'gpu'].concat(nvml ? ['smi', 'nvml'] : []);
    const arrowsUsed = ARROWS.filter((a) => nvml || !a.nvml);

    const root = GG.el('div', { class: 'tk' + (interactive ? ' tk-int' : '') });
    if (interactive) root.setAttribute('data-keys', '');
    let cap = null, foot = null, playBtn = null;
    if (showCap) {
      foot = GG.el('div', { class: 'tk-foot' });
      cap = GG.el('p', { class: 'tk-cap' });
      foot.append(cap);
      if (ac) playBtn = GG.ui.button(foot, { icon: 'play', label: 'Send the call', onClick: () => api.call(ac.path, ac) });
      root.append(foot);
    }
    (parent || document.body).appendChild(root);

    const handlers = {};
    const state = { base: norm(opts.highlight), path: null, hover: null, focus: null, rove: null };
    let svg = null, layout = null, g = null, nodes = null, run = null, destroyed = false, flashT = 0;

    function norm(keys) {
      if (keys == null || keys === '') return [];
      const arr = Array.isArray(keys) ? keys : [keys];
      const out = [];
      for (const k of arr) {
        if (BY[k] && (nvml || !BY[k].optional)) { if (!out.includes(k)) out.push(k); } else console.warn('[toolkit] unknown or unavailable key:', k);
      }
      return out;
    }
    function emit(ev, payload) { (handlers[ev] || []).forEach((fn) => { try { fn(payload); } catch (e) { console.error('[toolkit]', e); } }); }

    /* ── build ── */
    function build(kind, W) {
      layout = kind;
      root.setAttribute('data-layout', kind);
      g = geometry(kind, { nvml, files, examples }, W);
      const T = g.T;
      const s = S('svg', { class: 'tk-svg', viewBox: `0 0 ${g.W} ${g.H}`, role: interactive ? 'group' : 'img', 'aria-label': opts.ariaLabel || ariaText() });
      const ly = {}, ar = {};

      // CPU box + label
      const c = g.cpu;
      S('rect', { x: c[0], y: c[1], width: c[2], height: c[3], rx: 10, class: 'tk-cpu' }, s);
      let cpuT = null, hostT = null;
      if (kind === 'wide') {
        text(s, 30, g.apps.top + 32, 'CPU', 'tk-big h', T.big, 'start');
        text(s, 31, g.apps.top + 50, 'the host', 'tk-sub', T.sub, 'start');
      } else {
        // 'the host' sits on the same line, after the measured width of 'CPU' (placeHost); the
        // estimate (0.6 em per glyph plus letter-spacing) only stands in until it can be measured
        cpuT = text(s, 18, 34, 'CPU', 'tk-big h', T.big, 'start');
        cpuT.setAttribute('dominant-baseline', 'alphabetic');
        hostT = text(s, 18 + tw('CPU', T.big) + 0.06 * T.big + 8, 33, 'the host', 'tk-sub', T.sub, 'start');
      }

      function layer(key, hit, ringD) {
        const grp = S('g', { class: 'tk-ly', 'data-k': key }, s);
        if (interactive) {
          grp.setAttribute('tabindex', '-1');
          grp.setAttribute('role', 'button');
          grp.setAttribute('aria-label', `${BY[key].name}. ${BY[key].desc}`);
        }
        if (ringD) S('path', { d: ringD, class: 'tk-ring', style: 'stroke-width:2.5px' }, grp);
        else S('rect', { x: r2(hit[0] - 3), y: r2(hit[1] - 3), width: r2(hit[2] + 6), height: r2(hit[3] + 6), rx: 6, class: 'tk-ring' }, grp);
        ly[key] = grp;
        return grp;
      }
      function label(grp, x, top, pl, str) { text(grp, x + pl.label.dx, top + pl.label.dy, str, 'tk-lab', pl.fs); }
      function fileChip(grp, x, top, pl, str) {
        if (!pl.file) return;
        const f = pl.file;
        const fg = S('g', { class: 'tk-file' }, grp);
        const fx0 = x + f.dx, fy0 = top + f.dy;
        S('rect', { x: r2(fx0), y: r2(fy0), width: r2(f.w), height: T.fileH, rx: 4 }, fg);
        // tiny document glyph with a folded corner
        const ix = fx0 + 7, iy = fy0 + T.fileH / 2 - 5;
        if (f.glyph !== false) S('path', { d: `M${r2(ix)} ${r2(iy)}h5l3 3v7h-8z M${r2(ix + 5)} ${r2(iy)}v3h3` }, fg);
        text(fg, fx0 + (f.glyph !== false ? 18 : 6), fy0 + T.fileH / 2 + f.fs * 0.36, str, '', r2(f.fs), 'start');
      }
      function chips(grp, x, top, pl) {
        (pl.chips || []).forEach((ch) => {
          const cx0 = x + ch.dx, cy0 = top + ch.dy;
          let host = grp;
          if (ch.c.term) {
            host = S('a', { class: 'tk-chip term' + (ch.c.tool ? ' tk-tool' : ''), href: '#' + ch.c.term, 'data-term': ch.c.term, 'aria-label': (ch.c.aria || ch.c.t) + ' (glossary entry)' }, grp);
          } else host = S('g', { class: 'tk-chip' + (ch.c.tool ? ' tk-tool' : '') }, grp);
          S('rect', { x: r2(cx0), y: r2(cy0), width: r2(ch.w), height: T.chipH, rx: T.chipH / 2 }, host);
          text(host, cx0 + ch.w / 2, cy0 + T.chipH / 2 + T.chip * 0.36, ch.c.t, '', T.chip);
        });
      }

      // Applications (L-shape)
      const A = g.apps, Lb = g.libs, R = g.runtime;
      const appPts = [[g.x0, A.top], [g.x1, A.top], [g.x1, R.bottom], [g.step2, R.bottom], [g.step2, Lb.bottom], [g.step1, Lb.bottom], [g.step1, A.bottom], [g.x0, A.bottom]];
      const appD = 'M' + appPts.map((p) => r2(p[0]) + ' ' + r2(p[1])).join('L') + 'Z';
      const ga = layer('apps', null, appD);
      S('path', { d: appD, class: 'tk-shape app' }, ga);
      S('path', { d: appD, class: 'tk-edge' }, ga);
      label(ga, g.x0, A.top, A.plan, 'Applications');
      chips(ga, g.x0, A.top, A.plan);

      // Libraries
      const gl = layer('libs', [g.x0, Lb.top, g.libsR - g.x0, Lb.plan.h]);
      box(gl, [g.x0, Lb.top, g.libsR - g.x0, Lb.plan.h]);
      label(gl, g.x0, Lb.top, Lb.plan, 'CUDA Libraries');
      chips(gl, g.x0, Lb.top, Lb.plan);

      // Runtime
      const gr = layer('runtime', [g.x0, R.top, g.rtR - g.x0, R.plan.h]);
      box(gr, [g.x0, R.top, g.rtR - g.x0, R.plan.h]);
      label(gr, g.x0, R.top, R.plan, 'CUDA Runtime API');
      fileChip(gr, g.x0, R.top, R.plan, 'libcudart.so');

      // Driver API + GPU driver (one frame, dashed divider)
      const D = g.dapi, V = g.drv, w = g.x1 - g.x0;
      const gd = layer('driver-api', [g.x0, D.top, w, D.plan.h]);
      S('rect', { x: g.x0, y: r2(D.top), width: r2(w), height: r2(D.plan.h), class: 'tk-shape' }, gd);
      S('path', { d: `M${g.x0} ${r2(D.bottom)}V${r2(D.top)}H${g.x1}V${r2(D.bottom)}`, class: 'tk-edge' }, gd);
      label(gd, g.x0, D.top, D.plan, 'CUDA Driver API');
      fileChip(gd, g.x0, D.top, D.plan, 'libcuda.so');
      const gv = layer('driver', [g.x0, V.top, w, V.plan.h]);
      S('rect', { x: g.x0, y: r2(V.top), width: r2(w), height: r2(V.plan.h), class: 'tk-shape' }, gv);
      S('path', { d: `M${g.x0} ${r2(V.top)}V${r2(V.bottom)}H${g.x1}V${r2(V.top)}`, class: 'tk-edge' }, gv);
      label(gv, g.x0, V.top, V.plan, 'NVIDIA GPU Driver');
      fileChip(gv, g.x0, V.top, V.plan, 'nvidia.ko');
      S('line', { x1: g.x0, y1: r2(D.bottom), x2: g.x1, y2: r2(D.bottom), class: 'tk-divl' }, s);
      if (files) {
        const [up, dn] = g.bnd, lh = T.bnd + 2;
        up.forEach((t, i) => text(s, g.x1 - 7, D.bottom - 5 - (up.length - 1 - i) * lh, t, 'tk-bnd', T.bnd, 'end'));
        dn.forEach((t, i) => text(s, g.x1 - 7, D.bottom + T.bnd + 4 + i * lh, t, 'tk-bnd', T.bnd, 'end'));
      }

      // NVML column
      if (nvml) {
        const sb = g.smi.box, nb = g.nvml.box;
        const gs = layer('smi', sb);
        box(gs, sb);
        label(gs, sb[0], sb[1], g.smi.plan, 'nvidia-smi');
        const gn = layer('nvml', nb);
        box(gn, nb);
        label(gn, nb[0], nb[1], g.nvml.plan, 'NVML');
        fileChip(gn, nb[0], nb[1], g.nvml.plan, 'libnvml.so');
      }

      // GPU
      const gg = layer('gpu', g.gpu);
      S('rect', { x: g.gpu[0], y: r2(g.gpu[1]), width: g.gpu[2], height: g.gpu[3], rx: 10, class: 'tk-gpubox' }, gg);
      if (kind === 'wide') {
        text(gg, 30, g.gpuTop + 40, 'GPU', 'tk-big d', T.big, 'start');
        text(gg, 31, g.gpuTop + 59, 'the device', 'tk-sub', T.sub, 'start');
      } else {
        text(gg, 18, g.gpuTop + 30, 'GPU', 'tk-big d', T.big, 'start');
        text(gg, 18, g.gpuTop + 46, 'the device', 'tk-sub', T.sub, 'start');
      }
      const smg = S('g', { class: 'tk-sm' }, gg);
      g.sms.forEach((b) => {
        S('rect', { x: r2(b[0]), y: r2(b[1]), width: b[2], height: b[3], rx: 3, class: 'b' }, smg);
        S('rect', { x: r2(b[0] + 4), y: r2(b[1] + 4), width: b[2] - 8, height: 3.5, rx: 1.5, class: 's' }, smg);
        const nC = 3, cw2 = kind === 'wide' ? 5 : 4, sp = (b[2] - 8) / nC;
        for (let i = 0; i < nC; i++) S('rect', { x: r2(b[0] + 4 + sp * i + (sp - cw2) / 2), y: r2(b[1] + 11), width: cw2, height: b[3] - 15, rx: 1.2, class: 'c' }, smg);
      });

      // focus rings above each layer's own drawing
      for (const k in ly) { const rg = ly[k].querySelector('.tk-ring'); if (rg) ly[k].appendChild(rg); }

      // arrows on top of layers
      const ag = S('g', { 'aria-hidden': 'true' }, s);
      arrowsUsed.forEach((a) => {
        const geo = g.arrows[a.id];
        if (!geo) return;
        const grp = S('g', { class: 'tk-ar', 'data-a': a.id }, ag);
        const [tx, ty] = geo.tip;
        const back = 7;
        // shorten the line so the head sits cleanly on the target edge
        const d = geo.dir === 'down' ? geo.d.replace(/V([\d.]+)$/, `V${r2(ty - back + 1)}`) : geo.d.replace(/H([\d.]+)$/, `H${r2(tx - back + 1)}`);
        S('path', { d, class: 'l' }, grp);
        S('path', { d: geo.dir === 'down' ? `M${r2(tx)} ${r2(ty)}l-4 -${back}h8z` : `M${r2(tx)} ${r2(ty)}l-${back} -4v8z`, class: 'h' }, grp);
        ar[a.id] = grp;
      });

      // packet (hidden until a call runs)
      // the dot (mv) travels the path; the tag pill parks beside the layer being visited, joined to
      // the point where the call entered it by a short leader
      const pk = S('g', { class: 'tk-pkt', opacity: '0' }, s);
      const tagG = S('g', { class: 'tk-tag' }, pk);
      const lead = S('path', { class: 'lead' }, tagG);
      const pill = S('rect', { height: PILL_H, rx: PILL_H / 2, class: 'pill' }, tagG);
      const ptext = text(tagG, 0, 0, '', 'tk-pkt-t', T.chip);
      ptext.setAttribute('fill', '#241703');
      tagG.style.display = 'none';
      const mv = S('g', {}, pk);
      const halo = S('circle', { r: 10, class: 'halo' }, mv);
      const dot = S('circle', { r: 5, class: 'dot' }, mv);

      nodes = { ly, ar, pk, mv, tagG, lead, halo, dot, pill, ptext, gpu: gg, park: null };
      const hadFocus = !!(svg && document.activeElement && svg.contains(document.activeElement));
      if (svg) svg.replaceWith(s); else root.insertBefore(s, foot);
      svg = s;
      if (hostT) {
        const placeHost = () => {
          let wC = 0;
          try { wC = cpuT.getComputedTextLength(); } catch (e) { wC = 0; }
          if (wC > 0 && hostT.isConnected) hostT.setAttribute('x', r2(18 + wC + 7));
        };
        placeHost();
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeHost, () => {});
      }
      if (!state.rove || !ly[state.rove]) state.rove = state.base[0] || 'apps';
      syncRove();
      if (hadFocus && ly[state.rove]) { try { ly[state.rove].focus({ preventScroll: true }); } catch (e) { /* focus is best-effort */ } }
      if (run) placePacket();
      apply();
    }
    function box(grp, b) {
      S('rect', { x: r2(b[0]), y: r2(b[1]), width: r2(b[2]), height: r2(b[3]), class: 'tk-shape' }, grp);
      S('rect', { x: r2(b[0]), y: r2(b[1]), width: r2(b[2]), height: r2(b[3]), class: 'tk-edge' }, grp);
    }
    function ariaText() {
      return 'Diagram of the CUDA Toolkit stack. Inside the CPU (host): Applications at the top, reaching down beside CUDA Libraries, the CUDA Runtime API, then the CUDA Driver API above the NVIDIA GPU Driver. Below, the GPU (device). Arrows: Applications call CUDA Libraries, the Runtime API and the Driver API; Libraries call the Runtime API; the Runtime API calls the Driver API; the NVIDIA GPU Driver is the only layer that talks to the GPU.' +
        (files ? ' Files on Linux: libcudart.so implements the Runtime API, libcuda.so the Driver API, and the nvidia.ko kernel module is the driver; the divider between Driver API and GPU driver is the user-space / kernel-space boundary.' : '') +
        (nvml ? ' A side column shows nvidia-smi calling NVML (libnvml.so), which talks to the NVIDIA GPU Driver.' : '');
    }

    /* ── state → visuals ── */
    const arrowsOf = (k) => arrowsUsed.filter((a) => a.from === k || a.to === k).map((a) => a.id);
    function pathArrows(name) {
      const pts = g.paths[name] || [];
      return [...new Set(pts.map((p) => p.arrow).filter(Boolean))];
    }
    function apply() {
      if (!svg) return;
      let on = new Set(), arOn = new Set(), cur = null;
      const pv = state.hover || state.focus;
      if (pv) { on.add(pv); arrowsOf(pv).forEach((a) => arOn.add(a)); }
      else if (run) { run.visited.forEach((k) => on.add(k)); run.arrows.forEach((a) => arOn.add(a)); cur = run.current; }
      else if (state.path) { (PATHS[state.path] || []).forEach((k) => on.add(k)); pathArrows(state.path).forEach((a) => arOn.add(a)); }
      else if (state.base.length === 1) { on.add(state.base[0]); arrowsOf(state.base[0]).forEach((a) => arOn.add(a)); }
      else {
        state.base.forEach((k) => on.add(k));
        arrowsUsed.forEach((a) => { if (on.has(a.from) && on.has(a.to)) arOn.add(a.id); });
      }
      svg.classList.toggle('tk-has', on.size > 0);
      for (const k in nodes.ly) {
        nodes.ly[k].classList.toggle('tk-on', on.has(k));
        nodes.ly[k].classList.toggle('tk-cur', k === cur);
        if (interactive) nodes.ly[k].setAttribute('aria-pressed', String(state.base.includes(k)));
      }
      for (const id in nodes.ar) nodes.ar[id].classList.toggle('tk-on', arOn.has(id));
      renderCap(pv);
    }
    function linksFor(k) {
      return BY[k].terms.filter((id) => GG.byId == null || !Object.keys(GG.byId).length || GG.byId[id]).map((id) => linkHTML(id, LINK_TEXT[id] || id)).join(' · ');
    }
    function renderCap(pv) {
      if (!cap) return;
      const k = pv || (run ? run.current : null) || (!state.path ? state.base[0] : null);
      if (run && !pv && run.current) {
        const i = run.order.indexOf(run.current);
        const say = run.say && run.say[run.current];
        cap.classList.remove('tk-idle');
        cap.innerHTML = `<span class="tk-step">STEP ${i + 1} / ${run.order.length}</span><b>${GG.esc(BY[run.current].name)}.</b> ${say || GG.esc(BY[run.current].desc)}`;
        return;
      }
      if (k) {
        cap.classList.remove('tk-idle');
        cap.innerHTML = `<b>${GG.esc(BY[k].name)}.</b> ${GG.esc(BY[k].desc)} <span class="tk-links">→ ${linksFor(k)}</span>`;
        return;
      }
      if (state.path) {
        cap.classList.remove('tk-idle');
        cap.innerHTML = state.summary || pathSummary(state.path);
        return;
      }
      cap.classList.add('tk-idle');
      cap.innerHTML = interactive
        ? (canHover ? 'Arrows point from caller to callee. Hover, click or Tab into a layer to see what it does.' : 'Arrows point from caller to callee. Tap a layer to see what it does.')
        : 'Arrows point from caller to callee.';
    }
    function pathSummary(name) {
      const ks = PATHS[name] || [];
      return `<span class="tk-step">CALL PATH</span>${ks.map((k) => `<b>${GG.esc(BY[k].name)}</b>`).join(' → ')}`;
    }

    /* ── call animation ── */
    const SPEED = 165, DWELL = 0.42;
    const callAnim = GG.anim(root, (t, dt) => step(dt), { autostart: false });
    let rmTimer = 0;
    function startRun(name, o) {
      o = o || {};
      const pts = g.paths[name];
      if (!pts) { console.warn('[toolkit] unknown or unavailable path:', name); return Promise.resolve(false); }
      if (run) endRun(false);
      return new Promise((resolve) => {
        run = { name, seg: 0, u: 0, dwell: 0, visited: new Set(), arrows: new Set(), current: null, order: PATHS[name].slice(), tags: o.tags || {}, say: o.say || null, summary: o.summary || null, resolve };
        state.path = null;
        nodes.pk.setAttribute('opacity', '1');
        enter(pts[0].key);
        placePacket();
        if (GG.reducedMotion) {
          const keyed = pts.map((p, i) => (p.key ? i : -1)).filter((i) => i >= 0);
          let j = 0;
          const tick = () => {
            if (!run) return;
            j++;
            if (j >= keyed.length) { finish(); return; }
            for (let s2 = run.seg + 1; s2 <= keyed[j]; s2++) if (pts[s2].arrow) run.arrows.add(pts[s2].arrow);
            run.seg = keyed[j]; run.u = 0;
            enter(pts[keyed[j]].key);
            placePacket();
            rmTimer = setTimeout(tick, 900);
          };
          rmTimer = setTimeout(tick, 900);
        } else {
          run.dwell = DWELL;
          callAnim.start();
        }
      });
    }
    function enter(key) {
      if (!key || !run) return;
      run.visited.add(key);
      run.current = key;
      apply();
      emit('step', { path: run.name, key, index: run.order.indexOf(key), count: run.order.length });
    }
    function step(dt) {
      if (!run) { callAnim.stop(); return; }
      const pts = g.paths[run.name];
      if (run.dwell > 0) { run.dwell -= dt; return; }
      let adv = SPEED * dt;
      while (adv > 0 && run.seg < pts.length - 1) {
        const a = pts[run.seg], b = pts[run.seg + 1];
        if (b.arrow && !run.arrows.has(b.arrow)) { run.arrows.add(b.arrow); apply(); }
        const L = Math.hypot(b.x - a.x, b.y - a.y);
        const rem = L - run.u;
        if (adv < rem) { run.u += adv; adv = 0; }
        else {
          adv -= rem; run.seg++; run.u = 0;
          if (b.key) { enter(b.key); run.dwell = b.key === 'gpu' ? 0 : DWELL; adv = 0; }
        }
      }
      placePacket();
      if (run.seg >= pts.length - 1) finish();
    }
    function placePacket() {
      if (!run || !nodes) return;
      const pts = g.paths[run.name];
      if (!pts) return;
      const a = pts[Math.min(run.seg, pts.length - 1)], b = pts[Math.min(run.seg + 1, pts.length - 1)];
      const L = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      const f = Math.min(1, run.u / L);
      const x = a.x + (b.x - a.x) * f, y = a.y + (b.y - a.y) * f;
      nodes.mv.setAttribute('transform', `translate(${r2(x)} ${r2(y)})`);
      const key = run.current, tag = key && run.tags[key];
      if (!tag) { nodes.tagG.style.display = 'none'; return; }
      const pk = nodes.park;
      if (!pk || pk.run !== run || pk.key !== key || pk.tag !== tag) nodes.park = parkTag(key, tag);
    }
    /* The tag pill parks at the free spot nearest the point where the call entered the layer: off
       every label, chip, file chip, SM, box edge, arrow and the call's own route, preferring spots
       inside the visited layer. A leader joins it to the entry point. */
    function parkTag(key, tag) {
      const n = nodes, fs = g.T.chip, pts = g.paths[run.name];
      const a = pts.find((p) => p.key === key) || pts[0];
      n.ptext.textContent = tag;
      n.tagG.style.display = '';
      let tl = 0;
      try { tl = n.ptext.getComputedTextLength(); } catch (e) { tl = 0; }
      const w = (tl > 0 ? tl : tw(tag, fs)) + 16, h = g.kind === 'narrow' ? PILL_H - 2 : PILL_H;
      // nothing free: centre on the entry point, kept inside the drawing (the old placement)
      const s = parkSpot(key, a.x, a.y, w, h) || { cx: Math.max(4 + w / 2, Math.min(g.W - 4 - w / 2, a.x)), cy: a.y };
      const l = s.cx - w / 2, t = s.cy - h / 2;
      n.pill.setAttribute('x', r2(l));
      n.pill.setAttribute('y', r2(t));
      n.pill.setAttribute('width', r2(w));
      n.pill.setAttribute('height', h);
      n.pill.setAttribute('rx', h / 2);
      n.ptext.setAttribute('x', r2(s.cx));
      n.ptext.setAttribute('y', r2(s.cy + fs * 0.36));
      const e = s.e || [a.x, a.y], p = s.p || [Math.max(l, Math.min(l + w, a.x)), Math.max(t, Math.min(t + h, a.y))];
      n.lead.setAttribute('d', Math.hypot(p[0] - e[0], p[1] - e[1]) > 2 ? `M${r2(e[0])} ${r2(e[1])}L${r2(p[0])} ${r2(p[1])}` : '');
      return { run, key, tag };
    }
    function regionOf(key) {
      const A = g.apps, Lb = g.libs, R = g.runtime, D = g.dapi, V = g.drv;
      const bx = (b) => [b[0], b[1], b[0] + b[2], b[1] + b[3]];
      switch (key) {
        case 'apps': return [[g.x0, A.top, g.x1, A.bottom], [g.step1, A.top, g.x1, Lb.bottom], [g.step2, A.top, g.x1, R.bottom]];
        case 'libs': return [[g.x0, Lb.top, g.libsR, Lb.bottom]];
        case 'runtime': return [[g.x0, R.top, g.rtR, R.bottom]];
        case 'driver-api': return [[g.x0, D.top, g.x1, D.bottom]];
        case 'driver': return [[g.x0, V.top, g.x1, V.bottom]];
        case 'gpu': return [bx(g.gpu)];
        case 'smi': case 'nvml': return g[key] ? [bx(g[key].box)] : [];
        default: return [];
      }
    }
    function obstacles() {
      const ob = [];
      const add = (l, t, r, b, p) => ob.push([Math.min(l, r) - p, Math.min(t, b) - p, Math.max(l, r) + p, Math.max(t, b) + p]);
      const poly = (P, p) => { for (let i = 1; i < P.length; i++) add(P[i - 1][0], P[i - 1][1], P[i][0], P[i][1], p); };
      const frame = (l, t, r, b) => poly([[l, t], [r, t], [r, b], [l, b], [l, t]], 1.5);
      svg.querySelectorAll('text').forEach((el) => {
        if (nodes.pk.contains(el) || !el.textContent) return;
        let b = null;
        try { b = el.getBBox(); } catch (e) { b = null; }
        if (b && b.width > 0) { add(b.x, b.y, b.x + b.width, b.y + b.height, 3); return; }
        const fz = +el.getAttribute('font-size') || 10, x = +el.getAttribute('x') || 0, y = +el.getAttribute('y') || 0;
        const wd = tw(el.textContent, fz), an = el.getAttribute('text-anchor');
        const l = an === 'end' ? x - wd : an === 'middle' ? x - wd / 2 : x;
        add(l, y - fz, l + wd, y + fz * 0.3, 3);
      });
      svg.querySelectorAll('.tk-chip rect, .tk-file rect, .tk-sm rect.b').forEach((el) => {
        const x = +el.getAttribute('x'), y = +el.getAttribute('y');
        add(x, y, x + +el.getAttribute('width'), y + +el.getAttribute('height'), 2);
      });
      ob.nText = ob.length; // the leader may cross edges and arrows, but not these
      const A = g.apps, Lb = g.libs, R = g.runtime, D = g.dapi, V = g.drv;
      poly([[g.x0, A.top], [g.x1, A.top], [g.x1, R.bottom], [g.step2, R.bottom], [g.step2, Lb.bottom], [g.step1, Lb.bottom], [g.step1, A.bottom], [g.x0, A.bottom], [g.x0, A.top]], 1.5);
      frame(g.x0, Lb.top, g.libsR, Lb.bottom);
      frame(g.x0, R.top, g.rtR, R.bottom);
      frame(g.x0, D.top, g.x1, V.bottom);
      add(g.x0, D.bottom, g.x1, D.bottom, 1.5);
      [g.cpu, g.gpu].concat(nvml ? [g.smi.box, g.nvml.box] : []).forEach((b) => frame(b[0], b[1], b[0] + b[2], b[1] + b[3]));
      arrowsUsed.forEach((ar0) => {
        const geo = g.arrows[ar0.id];
        if (!geo) return;
        const P = [];
        let cx = 0, cy = 0;
        (geo.d.match(/[MVH][^MVH]*/g) || []).forEach((tok) => {
          const v = tok.slice(1).trim().split(/[\s,]+/).map(Number);
          if (tok[0] === 'M') { cx = v[0]; cy = v[1]; } else if (tok[0] === 'V') cy = v[0]; else cx = v[0];
          P.push([cx, cy]);
        });
        poly(P, 4);
      });
      poly(g.paths[run.name].map((p) => [p.x, p.y]), 11); // the packet's halo has radius 10
      return ob;
    }
    function parkSpot(key, ax, ay, w, h) {
      const ob = obstacles(), txt = ob.slice(0, ob.nText), reg = regionOf(key), m = 3;
      let best = null;
      const clear = (x0, y0, x1, y1) => {
        const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 2);
        for (let i = 1; i < n; i++) {
          const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n;
          if (txt.some((o) => x > o[0] && x < o[2] && y > o[1] && y < o[3])) return false;
        }
        return true;
      };
      const consider = (cx, cy) => {
        const l = cx - w / 2, r = cx + w / 2, t = cy - h / 2, b = cy + h / 2;
        const near = (x, y) => [Math.max(l, Math.min(r, x)), Math.max(t, Math.min(b, y))];
        // the leader runs from the entry point, or, when that would cross a label, from the
        // nearest edge of the visited layer
        let e = [ax, ay], p = near(ax, ay);
        if (!clear(ax, ay, p[0], p[1])) {
          e = null;
          reg.forEach((q) => {
            const qx = Math.max(q[0], Math.min(q[2], cx)), qy = Math.max(q[1], Math.min(q[3], cy));
            const pp = near(qx, qy);
            if ((!e || Math.hypot(pp[0] - qx, pp[1] - qy) < Math.hypot(p[0] - e[0], p[1] - e[1])) && clear(qx, qy, pp[0], pp[1])) { e = [qx, qy]; p = pp; }
          });
          if (!e) return;
        }
        const inside = reg.some((q) => l >= q[0] + m && r <= q[2] - m && t >= q[1] + m && b <= q[3] - m);
        const sc = Math.hypot(cx - ax, cy - ay) + (inside ? 0 : 70);
        if (!best || sc < best.sc) best = { cx, cy, sc, e, p };
      };
      for (let dy = -96; dy <= 96; dy += 1) {
        const cy = ay + dy, t = cy - h / 2, b = cy + h / 2;
        if (t < 2 || b > g.H - 2) continue;
        const bl = ob.filter((o) => o[1] < b && o[3] > t).sort((p, q) => p[0] - q[0]);
        const free = [];
        let cur = 4;
        for (const o of bl) { if (o[0] > cur) free.push([cur, o[0]]); cur = Math.max(cur, o[2]); }
        if (cur < g.W - 4) free.push([cur, g.W - 4]);
        const fit = (lo, hi) => { if (hi - lo >= w) consider(Math.max(lo + w / 2, Math.min(hi - w / 2, ax)), cy); };
        for (const [l, r] of free) {
          fit(l, r);
          reg.forEach((q) => { if (t >= q[1] + m && b <= q[3] - m) fit(Math.max(l, q[0] + m), Math.min(r, q[2] - m)); });
        }
      }
      return best;
    }
    function finish() {
      if (!run) return;
      const r = run;
      callAnim.stop();
      clearTimeout(rmTimer);
      nodes.gpu.classList.add('tk-flash');
      clearTimeout(flashT);
      flashT = setTimeout(() => { if (nodes) nodes.gpu.classList.remove('tk-flash'); }, 700);
      run = null;
      state.path = r.name;
      state.summary = r.summary;
      setTimeout(() => { if (!run && nodes) nodes.pk.setAttribute('opacity', '0'); }, GG.reducedMotion ? 0 : 450);
      apply();
      emit('done', { path: r.name, ok: true });
      r.resolve(true);
    }
    function endRun(ok) {
      if (!run) return;
      const r = run;
      run = null;
      callAnim.stop();
      clearTimeout(rmTimer);
      if (nodes) nodes.pk.setAttribute('opacity', '0');
      emit('done', { path: r.name, ok });
      r.resolve(ok);
    }

    /* ── interaction ── */
    const keyOf = (el) => { const x = el && el.closest ? el.closest('.tk-ly') : null; return x && root.contains(x) ? x.getAttribute('data-k') : null; };
    function setHover(k) {
      if (k === state.hover) return;
      state.hover = k;
      apply();
      emit('hover', k ? { key: k, layer: BY[k] } : null);
    }
    function hidePacket() { if (nodes) nodes.pk.setAttribute('opacity', '0'); }
    function select(k) {
      const same = k && state.base.length === 1 && state.base[0] === k && !state.path;
      if (run) endRun(false);
      hidePacket();
      state.path = null;
      state.base = !k || same ? [] : [k];
      if (k) { state.rove = k; syncRove(); }
      apply();
      const key = state.base[0] || null;
      emit('select', { key, keys: state.base.slice(), layer: key ? BY[key] : null });
    }
    function syncRove() {
      if (!interactive || !nodes) return;
      for (const k in nodes.ly) nodes.ly[k].setAttribute('tabindex', k === state.rove ? '0' : '-1');
    }
    if (interactive) {
      root.addEventListener('pointerover', (e) => { if (e.pointerType === 'mouse' || e.pointerType === 'pen') setHover(keyOf(e.target)); });
      root.addEventListener('pointerleave', () => setHover(null));
      root.addEventListener('click', (e) => {
        if (e.target.closest && e.target.closest('a, button')) return;
        const k = keyOf(e.target);
        if (k) select(k);
      });
      root.addEventListener('focusin', (e) => {
        const k = keyOf(e.target);
        if (!k || e.target.closest('a')) return;
        state.rove = k; syncRove();
        let fv = true;
        try { fv = e.target.matches(':focus-visible'); } catch (err) { fv = true; }
        if (fv) { state.focus = k; apply(); emit('hover', { key: k, layer: BY[k] }); }
      });
      root.addEventListener('focusout', (e) => {
        if (e.relatedTarget && keyOf(e.relatedTarget) && !e.relatedTarget.closest('a')) return;
        if (state.focus) { state.focus = null; apply(); emit('hover', null); }
      });
      root.addEventListener('keydown', (e) => {
        if (e.target.closest && e.target.closest('a, button')) return;
        const k = keyOf(e.target);
        if (!k) return;
        const i = order.indexOf(k);
        let next = null;
        switch (e.key) {
          case 'ArrowDown': case 'ArrowRight': next = order[Math.min(order.length - 1, i + 1)]; break;
          case 'ArrowUp': case 'ArrowLeft': next = order[Math.max(0, i - 1)]; break;
          case 'Home': next = order[0]; break;
          case 'End': next = order[order.length - 1]; break;
          case 'Enter': case ' ': e.preventDefault(); select(k); return;
          case 'Escape': if (state.base.length || state.path) { e.preventDefault(); select(null); } return;
          default: return;
        }
        e.preventDefault();
        if (next && next !== k && nodes.ly[next]) { state.rove = next; syncRove(); nodes.ly[next].focus(); }
      });
    }

    /* ── layout ── */
    const wantFor = (w) => (w > 0 && w < 560 ? 'narrow' : 'wide');
    const w0 = root.getBoundingClientRect().width || (parent && parent.getBoundingClientRect ? parent.getBoundingClientRect().width : 0);
    if (ac && PATHS[ac.path] && (nvml || !PATHS[ac.path].some((k) => BY[k].optional))) state.path = ac.path;
    const k0 = w0 > 0 ? wantFor(w0) : wantFor(window.innerWidth < 600 ? 400 : 800);
    build(k0, fitW(k0, w0, nvml));
    const ro = GG.resize(root, (r) => {
      if (destroyed || !r || !r.width) return;
      const want = wantFor(r.width), W = fitW(want, r.width, nvml);
      if (want !== layout || W !== g.W) build(want, W);
    });
    if (ac && !GG.reducedMotion) {
      GG.onVisible(root, () => { setTimeout(() => { if (!destroyed && !run && state.path === ac.path && !state.hover) api.call(ac.path, ac); }, 500); }, { once: true });
    }

    const api = {
      el: root,
      get svg() { return svg; },
      get layout() { return layout; },
      highlight(keys) { if (run) endRun(false); hidePacket(); state.path = null; state.base = norm(keys); apply(); return api; },
      clear() { if (run) endRun(false); hidePacket(); state.path = null; state.base = []; state.hover = null; state.focus = null; apply(); return api; },
      keys: () => state.base.slice(),
      showPath(name) {
        if (name && !g.paths[name]) { console.warn('[toolkit] unknown or unavailable path:', name); return api; }
        if (run) endRun(false);
        hidePacket();
        state.path = name || null; state.summary = null; apply(); return api;
      },
      call(name, o) { return startRun(name, o); },
      on(ev, fn) { if (typeof fn === 'function') (handlers[ev] || (handlers[ev] = [])).push(fn); return api; },
      destroy() {
        destroyed = true;
        endRun(false);
        clearTimeout(flashT);
        if (ro && ro.disconnect) ro.disconnect();
        root.remove();
      },
    };
    return api;
  }

  toolkit.LAYERS = LAYERS;
  toolkit.LAYERS_BY = BY;
  toolkit.PATHS = PATHS;
  toolkit.ARROWS = ARROWS;
  GG.components.toolkit = toolkit;
})();
