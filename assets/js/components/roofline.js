/* components/roofline.js — GG.components.roofline
   A precise log-log (or linear) roofline chart in SVG, with GPU presets and draggable kernels.

   ─────────────────────────────── API ───────────────────────────────

   const rf = GG.components.roofline(target, opts)

   target   Either a figure object returned by ctx.figure()/GG.ui.figure() (recommended: the chart goes
            in figure.stage, the selector in figure.controls, stat chips in figure.readouts and the live
            sentence in figure.setWhy), or any element (the chart, controls, readouts and why-line are
            then all appended inside it). You can also pass an element plus opts.figure.

   opts (all optional)
     system       preset id or custom system object (see below). Default 'h100-bf16'. A string id is looked up
                  in this chart's own `systems` and `compare` lists first, then in the presets, so custom
                  systems can be addressed by id (here, in api.setSystem and in the built-in selector).
     systems      array of preset ids / objects offered by the selector, in order.
                  Default: all 7 presets in PRESETS order (the glossary table order, then H100 FP32).
                  `system` is added if it is missing. The log axes are fitted to ALL of these, so switching
                  systems moves the roofs, not the axes.
     compare      array of preset ids / objects drawn as faint extra roofs with a small label (its `label`; a blank
                  label such as '\u200b' draws no label). Default []. Extra fields a compare object may carry:
                    labelAt   'roof'  : above/below the right end of its own flat roof (default when its height
                                        differs from every other roof's)
                              'slope' : rotated along its own slanted roof (default when it shares its height with
                                        the main roof or another compare roof, e.g. one GPU fed over several links)
                              'ridge' : beside its ridge square
                              Each falls back to the others, and the label is hidden when nothing fits.
                    dash      SVG dash pattern for its line, e.g. '6 3', to tell near-parallel roofs apart.
     compareLabelAt  default `labelAt` for every compare roof (overrides the automatic choice).
     kernels      array of kernels: {id, label, ai, achieved, color, draggable, bound, boundTone}
                    id        string (default 'k0', 'k1', …)
                    label     short name shown next to the point (default 'Kernel', or 'Kernel 1', 'Kernel 2', …)
                    ai        arithmetic intensity in FLOPs/byte (default 1)
                    achieved  fraction (0,1] of the attainable roof the kernel really reaches (default 1).
                              <1 draws the point below the roof, with a hollow ring on the roof and a gap line.
                    color     token name ('special', 'host', 'ink', 'control', 'memory', 'core', 'accent'),
                              'var(--x)' or a hex: a fixed override. Default (no color): coloured by regime, the
                              site's semantic code, recomputed against the current system's ridge on every change
                              (drags, system switches, the glide): var(--memory) left of the ridge, var(--core) at
                              or right of it; a kernel with a `bound` verdict and a token `boundTone` takes that
                              token's colour instead (e.g. 'control' for overhead-bound). Kernels are told apart by
                              their labels, not by hue.
                    draggable per-kernel override of opts.draggable
                    bound     verdict text that overrides the one derived from the kernel's position, e.g.
                              'overhead-bound' for a kernel under the memory roof that is limited by launch
                              latency. Used in its point label, the Bound chip, the aria labels, state.boundLabel,
                              and appended to the default why-line. Default null (derive from the position).
                    boundTone stat-chip tone for that verdict ('control', 'danger', …); also tones the
                              Attainable/Achieved chip. Default null (neutral).
     selectorLabel  label of the built-in system selector. Default 'System (compute / memory)'.
     selected     id of the kernel the readouts/why-line describe (default: the first). Dragging or
                  focusing a kernel selects it.
     draggable    true (default): drag a kernel horizontally (or tap/click anywhere on the plot to move the
                  nearest kernel there); when a kernel is focused: ←/→ (or ↓/↑) step 1/20 decade,
                  Shift+arrow 1/4 decade, PageUp/PageDown one decade, Home/End the axis ends. Steps and drags
                  "stick" to the ridge point when they cross it, so readers can land on it exactly.
     shade        null (default) | 'memory' (tint the region under the slanted roof, left of the ridge)
                  | 'compute' (tint under the flat roof, right of the ridge) | 'both'.
     regions      true (default): faint "memory-bound" / "compute-bound" labels at the bottom of each region.
     showControls false (default): add a segmented control of `systems` (only if there are 2+).
     showReadouts defaults to showControls: stat chips — Ridge point, Intensity, Attainable (reads "Achieved"
                  when the selected kernel has achieved < 1), Bound ("memory-bound" / "compute-bound" /
                  "at the ridge") with kernels; Ridge point, Compute roof, Memory roof without kernels.
     showWhy      true (default): live sentence, e.g. "At 12 FLOPs/byte, an H100 running BF16 Tensor Core math
                  can deliver at most 40.2 TFLOPS: the memory roof caps it (3.35 TB/s × 12 FLOPs/byte). You'd need
                  295.2 FLOPs/byte to reach the compute roof."
     why          function(state) → html string, to replace the default why-line (return null/undefined to
                  keep the default). `state` is the same object 'change' listeners get.
     scale        'log' (default) | 'linear'. On linear axes the memory roof is visibly a line through the
                  origin whose slope is the bandwidth; a rise/run triangle spells it out. Linear axes fit the
                  current system (ridge × ~2.2) and its kernels (largest intensity × 1.15, up to ridge × 8), so they
                  rescale when the system or the kernels change (api.setKernel past the axis end refits too).
                  A kernel still outside the x axis (either scale) is drawn as a half dot clipped at the plot
                  edge with an outward arrow, and its label says "off scale".
     showScale    false (default): add a "log / linear" segmented control.
     hover        true (default): with a mouse, a crosshair shows the roof value under the pointer.
     xDomain      [lo, hi] FLOPs/byte override for log axes (default: fits presets, e.g. [0.1, 10000]).
     yDomain      [lo, hi] FLOP/s override for log axes (default: fits presets, e.g. [1e11, ~2e16]).
     height       number (px) or function(width) → px. Default: ~0.56 × width on desktop (340–540 px),
                  ~0.92 × width on phones.
     ariaLabel    extra text for the chart's accessible name.

   Labels are placed by a collision-avoiding layout. The ridge label, the compute- and memory-roof labels, the
   rise/run labels, every kernel label, the comparison-roof labels and the region labels form one collision
   set: none is printed over another. A kernel label goes next to its point if it can; on phones it may drop
   to its name alone; it may cross another kernel's guide line (kernel and rise/run labels sit above all guide
   lines, on a dark backing); otherwise it moves to the nearest free spot with a thin leader line. Leader
   lines join the collision set too: no leader crosses another label, and no label sits on a leader. When a
   kernel label has no good spot, the static "ridge point" and compute-roof texts give way (the axis chips
   still show both values), and the kernels are also tried in reverse order. Labels without a backing (roof,
   ridge and comparison labels) carry a dark halo, so a faint line that has to cross one does not cut it.
   On phones labels shorten. Intensities that print as 1 read "1 FLOP/byte".
   Colours: memory roof = var(--memory) blue, compute roof = var(--core) green (the site's semantic code;
   note this is the reverse of the glossary's own figure, which draws memory green and compute blue).
   The ridge point is a white square with its x value in a chip on the x-axis; the compute roof's height is
   in a green chip on the y-axis. Dashed lines continue each roof past the ridge, as in the glossary figure.

   Returns api:
     api.el, api.svg                  wrapper element and the <svg>
     api.setSystem(idOrObject)        switch system (the roofs glide in log mode; instant under reduced motion)
     api.setSystems(list)             replace the selector's list (rebuilds the selector and the axes)
     api.setCompare(list)             replace the faint comparison roofs
     api.setKernels(list)             replace all kernels (same shape as opts.kernels)
     api.setKernel(id, ai)            move one kernel
     api.select(id)                   choose the kernel the readouts describe
     api.setShade(null|'memory'|'compute'|'both')
     api.setScale('log'|'linear')
     api.state()                      → the current state object (below)
     api.on('change', fn)             fn(state) after every change (drag, key, setSystem, setKernels…).
                                      Not fired for the initial state: read api.state() for that.
     api.off('change', fn)
     api.destroy()                    remove everything this component added (including controls/readouts)

   state = { system,            the system object (see PRESETS)
             ridge,             system.flops / system.bw, FLOPs/byte
             kernel,            the selected kernel object (or null), with its current .ai
             ai,                its arithmetic intensity (FLOPs/byte) or null
             attainable,        min(flops, bw × ai) in FLOP/s — the roof above the kernel — or null
             achieved,          attainable × kernel.achieved, FLOP/s, or null
             bound,             'memory' (ai < ridge) | 'compute' (ai ≥ ridge) | null (always from the position)
             boundLabel,        the verdict as displayed: kernel.bound if set, else 'memory-bound' /
                                'compute-bound' / 'at the ridge'; null without kernels
             atRidge }          true when ai equals the ridge (after the ridge "stickiness")

   Statics on GG.components.roofline:
     PRESETS      object keyed by id, in order: a100-bf16, h100-bf16, b200-bf16, h100-fp8, b200-fp8, b200-fp4
                  (the six rows of the glossary's ridge-point tables), then h100-fp32 (the peak-rate entry's
                  CUDA Core figure; shows that roofs differ per subsystem). Each preset:
                  { id, label ('H100 BF16'), name ('H100 SXM BF16 TC / HBM3', the glossary row text),
                    gpu, unit ('BF16 Tensor Cores'), memory ('HBM3'), arch ('Hopper'),
                    tflops (989), tbps (3.35), flops (989e12 FLOP/s), bw (3.35e12 bytes/s),
                    ridge (computed: 295.22…), src (datasheet URL from the glossary table), table (true if a
                    row of the glossary table), phrase ('an H100 running BF16 Tensor Core math'), derivation? }
                  Ridges: A100 BF16 156 · H100 BF16 295.2 · B200 BF16 281.25 · H100 FP8 590.7 (the glossary's
                  tables print 592) · B200 FP8 562.5 · B200 FP4 1,125 · H100 FP32 19.97.
     ORDER        the preset ids in that order
     attainable(ai, sys)   → min(sys.flops, sys.bw × ai) FLOP/s (sys: id or object)
     ridge(sys)            → sys.flops / sys.bw FLOPs/byte
     system(obj)           → normalise a custom system: {id, label, flops | tflops, bw | tbps, name?, phrase?}
     fmt.perf(flopsPerSec, sig=3)  '40.2 TFLOPS', '1.98 PFLOPS' (sig 4: '1.979 PFLOPS'), '335 GFLOPS'
     fmt.perfShort(flopsPerSec)    '989T', '1.98P'
     fmt.bw(bytesPerSec)           '3.35 TB/s'
     fmt.ai(flopsPerByte)          '0.17', '12', '295', '1,125'
     fmt.ridge(flopsPerByte)       '156', '295.2', '281.25', '590.7', '1,125', '19.97'
     fmt.unit(flopsPerByte | str)  'FLOP' when the value prints as '1', else 'FLOPs' (for '1 FLOP/byte')
   Custom systems (anywhere a preset id is accepted): e.g. the glossary's hypothetical GPU
     { id: 'pf-gpu', label: '1 PFLOPS / 10 TB/s', tflops: 1000, tbps: 10, phrase: 'a GPU with 1 PFLOPS and 10 TB/s' }
*/
(function () {
  'use strict';
  const GG = window.GG;
  if (!GG) return;

  /* ───────────── presets ───────────── */
  const A100_DS = 'https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a100/pdf/nvidia-a100-datasheet-us-nvidia-1758950-r4-web.pdf';
  const H100_DS = 'https://resources.nvidia.com/en-us-gpu-resources/h100-datasheet-24306';
  const B200_DS = 'https://resources.nvidia.com/en-us-dgx-systems/dgx-b200-datasheet';
  const H100_WP = 'https://resources.nvidia.com/en-us-hopper-architecture/nvidia-h100-tensor-c';

  const RAW = [
    { id: 'a100-bf16', label: 'A100 BF16', name: 'A100 80GB SXM BF16 TC / HBM2e', gpu: 'A100 80GB SXM', unit: 'BF16 Tensor Cores', memory: 'HBM2e', arch: 'Ampere', tflops: 312, tbps: 2, src: A100_DS, table: true, phrase: 'an A100 running BF16 Tensor Core math' },
    { id: 'h100-bf16', label: 'H100 BF16', name: 'H100 SXM BF16 TC / HBM3', gpu: 'H100 SXM', unit: 'BF16 Tensor Cores', memory: 'HBM3', arch: 'Hopper', tflops: 989, tbps: 3.35, src: H100_DS, table: true, phrase: 'an H100 running BF16 Tensor Core math' },
    { id: 'b200-bf16', label: 'B200 BF16', name: 'B200 BF16 TC / HBM3e', gpu: 'B200', unit: 'BF16 Tensor Cores', memory: 'HBM3e', arch: 'Blackwell', tflops: 2250, tbps: 8, src: B200_DS, table: true, phrase: 'a B200 running BF16 Tensor Core math' },
    { id: 'h100-fp8', label: 'H100 FP8', name: 'H100 SXM FP8 TC / HBM3', gpu: 'H100 SXM', unit: 'FP8 Tensor Cores', memory: 'HBM3', arch: 'Hopper', tflops: 1979, tbps: 3.35, src: H100_DS, table: true, phrase: 'an H100 running FP8 Tensor Core math' },
    { id: 'b200-fp8', label: 'B200 FP8', name: 'B200 FP8 TC / HBM3e', gpu: 'B200', unit: 'FP8 Tensor Cores', memory: 'HBM3e', arch: 'Blackwell', tflops: 4500, tbps: 8, src: B200_DS, table: true, phrase: 'a B200 running FP8 Tensor Core math' },
    { id: 'b200-fp4', label: 'B200 FP4', name: 'B200 FP4 TC / HBM3e', gpu: 'B200', unit: 'FP4 Tensor Cores', memory: 'HBM3e', arch: 'Blackwell', tflops: 9000, tbps: 8, src: B200_DS, table: true, phrase: 'a B200 running FP4 Tensor Core math' },
    { id: 'h100-fp32', label: 'H100 FP32', name: 'H100 SXM FP32 CUDA Cores / HBM3', gpu: 'H100 SXM', unit: 'FP32 CUDA Cores', memory: 'HBM3', arch: 'Hopper', tflops: 66.9, tbps: 3.35, src: H100_WP, table: false, phrase: 'an H100 running FP32 math on its CUDA Cores', derivation: '132 SMs × 128 FP32 cores × 2 FLOPs per FMA × 1.98 GHz = 66.9 TFLOPS' },
  ];

  function normSystem(s) {
    const o = Object.assign({}, s);
    if (o.flops == null && o.tflops != null) o.flops = Math.round(o.tflops * 1e12);
    if (o.bw == null && o.tbps != null) o.bw = Math.round(o.tbps * 1e12);
    if (o.tflops == null && o.flops != null) o.tflops = o.flops / 1e12;
    if (o.tbps == null && o.bw != null) o.tbps = o.bw / 1e12;
    if (!(o.flops > 0) || !(o.bw > 0)) throw new Error('roofline: a system needs flops/tflops and bw/tbps > 0');
    o.id = o.id || 'custom-' + o.flops + '-' + o.bw;
    o.label = o.label || o.name || o.id;
    o.name = o.name || o.label;
    o.phrase = o.phrase || 'the ' + o.label;
    o.ridge = o.flops / o.bw;
    return Object.freeze(o);
  }

  const PRESETS = {};
  RAW.forEach((r) => { PRESETS[r.id] = normSystem(r); });
  const ORDER = RAW.map((r) => r.id);

  function resolve(s) {
    if (s && typeof s === 'object') {
      if (s.ridge && Object.isFrozen(s)) return s;
      try { return normSystem(s); } catch (e) { console.warn('[roofline]', e.message, s, '— using h100-bf16'); return PRESETS['h100-bf16']; }
    }
    if (PRESETS[s]) return PRESETS[s];
    console.warn('[roofline] unknown system', s, '— using h100-bf16');
    return PRESETS['h100-bf16'];
  }

  const attainable = (ai, sys) => { const s = resolve(sys); return Math.min(s.flops, s.bw * ai); };
  const ridgeOf = (sys) => { const s = resolve(sys); return s.flops / s.bw; };

  /* ───────────── formatting ───────────── */
  const num = (v, maxFrac = 6) => Number(v).toLocaleString('en-US', { maximumFractionDigits: maxFrac });
  const sigv = (v, s) => Number(Number(v).toPrecision(s));
  const PERF_U = [[1e18, 'EFLOPS'], [1e15, 'PFLOPS'], [1e12, 'TFLOPS'], [1e9, 'GFLOPS'], [1e6, 'MFLOPS'], [1, 'FLOPS']];
  function fmtPerf(v, s = 3) {
    if (!isFinite(v) || v <= 0) return '0 FLOPS';
    for (let i = 0; i < PERF_U.length; i++) {
      const [u, name] = PERF_U[i];
      if (v >= u || i === PERF_U.length - 1) {
        const x = sigv(v / u, s);
        if (x >= 1000 && i > 0) return num(sigv(v / PERF_U[i - 1][0], s)) + ' ' + PERF_U[i - 1][1];
        return num(x) + ' ' + name;
      }
    }
    return String(v);
  }
  const PERF_SHORT = [[1e18, 'E'], [1e15, 'P'], [1e12, 'T'], [1e9, 'G'], [1e6, 'M'], [1, '']];
  function fmtPerfShort(v, s = 3) {
    for (let i = 0; i < PERF_SHORT.length; i++) {
      const [u, p] = PERF_SHORT[i];
      if (v >= u || i === PERF_SHORT.length - 1) {
        const x = sigv(v / u, s);
        if (x >= 1000 && i > 0) return num(sigv(v / PERF_SHORT[i - 1][0], s)) + PERF_SHORT[i - 1][1];
        return num(x) + p;
      }
    }
    return String(v);
  }
  function fmtBW(v) {
    if (v >= 1e15) return num(sigv(v / 1e15, 3)) + ' PB/s';
    if (v >= 1e12) return num(sigv(v / 1e12, 3)) + ' TB/s';
    return num(sigv(v / 1e9, 3)) + ' GB/s';
  }
  function fmtAI(v) {
    if (!isFinite(v)) return '—';
    if (v < 1) return num(sigv(v, 2));
    if (v < 1000) return num(sigv(v, 3));
    return num(Math.round(v), 0);
  }
  function fmtRidge(v) {
    const r2 = Math.round(v * 100) / 100;
    if (Math.abs(v - r2) < 1e-9) return num(r2, 2);
    return v >= 100 ? num(Math.round(v * 10) / 10, 1) : num(sigv(v, 4));
  }
  /* 'FLOP' when the intensity prints as exactly 1 ('1 FLOP/byte'), else 'FLOPs'; takes a number or a formatted string */
  const fpw = (v) => ((typeof v === 'string' ? v : fmtAI(v)) === '1' ? 'FLOP' : 'FLOPs');
  const fmt = { perf: fmtPerf, perfShort: fmtPerfShort, bw: fmtBW, ai: fmtAI, ridge: fmtRidge, unit: fpw };

  /* ───────────── css ───────────── */
  let cssDone = false;
  function injectCSS() {
    if (cssDone) return;
    cssDone = true;
    GG.css(`
.rf { position: relative; min-width: 0; }
.rf-svg { display: block; width: 100%; height: auto; overflow: visible; touch-action: pan-y pinch-zoom; -webkit-user-select: none; user-select: none; -webkit-tap-highlight-color: transparent; }
.rf-svg text { font-family: var(--font-mono); }
.rf-svg .rf-plotbg { fill: rgba(8, 9, 14, 0.35); }
.rf-svg .rf-grid { stroke: rgba(255, 255, 255, 0.07); stroke-width: 1; fill: none; shape-rendering: crispEdges; }
.rf-svg .rf-minor { stroke: var(--line-2); stroke-width: 1; shape-rendering: crispEdges; }
.rf-svg .rf-axis { stroke: var(--ink-3); stroke-width: 1.25; fill: none; }
.rf-svg .rf-arrow { fill: var(--ink-3); stroke: none; }
.rf-svg .rf-tick { font-size: 11px; fill: var(--ink-3); font-variant-numeric: tabular-nums; }
.rf-svg .rf-axt { font-size: 11.5px; fill: var(--ink-2); }
.rf-svg .rf-mem { stroke: var(--memory); stroke-width: 2.5; fill: none; stroke-linecap: round; }
.rf-svg .rf-cmp { stroke: var(--core); stroke-width: 2.5; fill: none; stroke-linecap: round; }
.rf-svg .rf-ext { stroke-width: 1.5; stroke-dasharray: 5 5; opacity: 0.6; }
.rf-svg .rf-shade-mem { fill: var(--memory); opacity: 0; transition: opacity 0.25s; }
.rf-svg .rf-shade-cmp { fill: var(--core); opacity: 0; transition: opacity 0.25s; }
.rf-svg .rf-shade-mem.on, .rf-svg .rf-shade-cmp.on { opacity: 0.13; }
.rf-svg .rf-reg { font-size: 10.5px; letter-spacing: 0.06em; opacity: 0.55; paint-order: stroke; stroke: var(--bg); stroke-width: 3px; stroke-linejoin: round; }
.rf-svg .rf-reg.on { opacity: 0.95; }
.rf-svg .rf-reg-mem { fill: var(--memory); }
.rf-svg .rf-reg-cmp { fill: var(--core); }
.rf-svg .rf-lab { font-size: 12px; font-weight: 600; }
.rf-svg .rf-lab-mem { fill: var(--memory); }
.rf-svg .rf-lab-cmp { fill: var(--core); }
.rf-svg .rf-ridge { fill: var(--ink); stroke: var(--bg); stroke-width: 2; }
.rf-svg .rf-drop { stroke: var(--ink-3); stroke-width: 1; stroke-dasharray: 2 3; }
.rf-svg .rf-rlab { font-size: 12px; font-weight: 600; fill: var(--ink); }
.rf-svg .rf-rsub { font-size: 11px; fill: var(--ink-2); }
.rf-svg .rf-chip rect { fill: var(--surface-3); stroke: var(--line-2); stroke-width: 1; }
.rf-svg .rf-chip text { font-size: 11px; font-weight: 600; fill: var(--ink); font-variant-numeric: tabular-nums; }
.rf-svg .rf-chip-cmp rect { fill: #10241c; stroke: var(--core); }
.rf-svg .rf-chip-cmp text { fill: var(--core); }
.rf-svg .rf-cmpr path { stroke: var(--ink-3); stroke-width: 1.5; fill: none; opacity: 0.7; }
.rf-svg .rf-cmpr path.rf-ext { stroke-width: 1; opacity: 0.35; }
.rf-svg .rf-cmpr rect { fill: var(--ink-3); }
.rf-svg .rf-cmpr-t { font-size: 10.5px; fill: var(--ink-2); }
/* labels without a backing get a dark halo, so a faint line that has to cross one does not cut its glyphs */
.rf-svg .rf-lab, .rf-svg .rf-rlab, .rf-svg .rf-rsub, .rf-svg .rf-cmpr-t { paint-order: stroke; stroke: var(--bg); stroke-width: 3px; stroke-linejoin: round; }
.rf-svg .rf-tri { stroke: var(--memory); stroke-width: 1.25; fill: none; stroke-dasharray: 3 3; }
.rf-svg .rf-tri-t { font-size: 11px; fill: var(--memory); }
.rf-svg .rf-tri-bg { fill: rgba(11, 12, 18, 0.72); }
.rf-svg .rf-k-offa { fill: var(--kc); }
.rf-svg .rf-k { cursor: ew-resize; outline: none; }
.rf-svg .rf-k.static { cursor: default; }
.rf-svg .rf-k-guide { stroke: var(--kc); stroke-width: 1.5; stroke-dasharray: 3 4; opacity: 0.85; }
.rf-svg .rf-k-gap { stroke: var(--kc); stroke-width: 1.5; opacity: 0.55; }
.rf-svg .rf-k-ring { fill: none; stroke: var(--kc); stroke-width: 1.5; stroke-dasharray: 2 2; }
.rf-svg .rf-k-dot { fill: var(--kc); stroke: var(--bg); stroke-width: 2.5; }
.rf-svg .rf-k-hit { fill: transparent; }
.rf-svg .rf-k-chev { fill: var(--kc); opacity: 0.45; transition: opacity 0.15s; }
.rf-svg .rf-k:hover .rf-k-chev, .rf-svg .rf-k.drag .rf-k-chev { opacity: 0.95; }
.rf-svg .rf-k-focus { fill: none; stroke: var(--accent); stroke-width: 2; opacity: 0; }
.rf-svg .rf-k:focus-visible .rf-k-focus { opacity: 1; }
.rf-svg .rf-k-name { font-size: 12px; font-weight: 600; fill: var(--ink); }
.rf-svg .rf-k-val { font-size: 11px; fill: var(--ink-2); font-variant-numeric: tabular-nums; }
.rf-svg .rf-k-bg { fill: rgba(11, 12, 18, 0.72); }
.rf-svg .rf-k-lead { stroke: var(--kc); stroke-width: 1; opacity: 0.6; }
.rf-svg .rf-hov { pointer-events: none; }
.rf-svg .rf-hov line { stroke: var(--ink-2); stroke-width: 1; stroke-dasharray: 2 3; }
.rf-svg .rf-hov circle { fill: var(--ink); stroke: var(--bg); stroke-width: 2; }
.rf-svg .rf-hov rect { fill: rgba(20, 21, 32, 0.95); stroke: var(--line-2); }
.rf-svg .rf-hov text { font-size: 11px; fill: var(--ink); font-variant-numeric: tabular-nums; }
.rf-svg .rf-plot { cursor: crosshair; }
.rf-dock { display: flex; flex-wrap: wrap; gap: 12px 18px; align-items: flex-end; margin-top: 12px; }
.rf-dock:empty { display: none; }
.rf-dock > div { display: flex; flex-wrap: wrap; gap: 6px 12px; align-items: flex-end; }
.rf-why { margin-top: 12px; padding: 10px 13px; border-radius: 12px; background: rgba(8, 9, 14, 0.66); border: 1px solid var(--line); font-size: 14.5px; line-height: 1.55; color: var(--ink-2); }
.rf-why:empty { display: none; }
.rf-why b, .fig-why .rf-w b { color: var(--ink); font-weight: 600; }
.rf-w-mem { color: var(--memory); font-weight: 600; }
.rf-w-cmp { color: var(--core); font-weight: 600; }
`);
  }

  /* ───────────── helpers ───────────── */
  const TOKENS = ['special', 'host', 'ink', 'control', 'memory', 'core', 'accent', 'danger', 'ink-2'];
  // an explicit kernel colour (token, 'var(--x)' or hex), or null: coloured by regime (see regimeColor in update)
  const colorOf = (c) => (!c ? null : TOKENS.includes(c) ? `var(--${c})` : c);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lg = Math.log10;
  const tw = (s, fs) => String(s).length * 0.6 * fs; // JetBrains Mono advance = 0.6 em
  const hit = (a, b) => a && b && a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  /* does segment a→b cross rectangle r? (Liang–Barsky clip) */
  function segBox(a, b, r) {
    let t0 = 0, t1 = 1;
    const dx = b.x - a.x, dy = b.y - a.y;
    const p = [-dx, dx, -dy, dy], q = [a.x - r.x, r.x + r.w - a.x, a.y - r.y, r.y + r.h - a.y];
    for (let i = 0; i < 4; i++) {
      if (p[i] === 0) { if (q[i] < 0) return false; continue; }
      const t = q[i] / p[i];
      if (p[i] < 0) { if (t > t1) return false; if (t > t0) t0 = t; }
      else { if (t < t0) return false; if (t < t1) t1 = t; }
    }
    return t0 <= t1;
  }
  const setA = (el, a) => { for (const k in a) el.setAttribute(k, a[k]); };
  const setT = (el, s) => { if (el.textContent !== s) el.textContent = s; };
  const show = (el, on) => { if (on) el.removeAttribute('display'); else el.setAttribute('display', 'none'); };
  const f1 = (v) => Math.round(v * 10) / 10;
  /* the part of segment a→b inside rectangle r, as [a', b'], or null */
  function segClip(a, b, r) {
    let t0 = 0, t1 = 1;
    const dx = b.x - a.x, dy = b.y - a.y;
    const p = [-dx, dx, -dy, dy], q = [a.x - r.x, r.x + r.w - a.x, a.y - r.y, r.y + r.h - a.y];
    for (let i = 0; i < 4; i++) {
      if (p[i] === 0) { if (q[i] < 0) return null; continue; }
      const t = q[i] / p[i];
      if (p[i] < 0) { if (t > t1) return null; if (t > t0) t0 = t; }
      else { if (t < t0) return null; if (t < t1) t1 = t; }
    }
    if (t1 - t0 < 1e-6) return null;
    return [{ x: a.x + dx * t0, y: a.y + dy * t0 }, { x: a.x + dx * t1, y: a.y + dy * t1 }];
  }

  function niceStep(v) { // 1-2-5 step
    const p = 10 ** Math.floor(lg(v));
    const m = v / p;
    return p * (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10);
  }
  function niceCeil(v) {
    const p = 10 ** Math.floor(lg(v));
    const steps = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
    for (const s of steps) if (s * p >= v - 1e-9 * v) return s * p;
    return 10 * p;
  }
  function scale(d0, d1, r0, r1, log) {
    if (log) {
      const a = lg(d0), b = lg(d1);
      const f = (v) => r0 + ((lg(Math.max(v, 1e-300)) - a) / (b - a)) * (r1 - r0);
      f.invert = (p) => 10 ** (a + ((p - r0) / (r1 - r0)) * (b - a));
      return f;
    }
    const f = (v) => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0);
    f.invert = (p) => d0 + ((p - r0) / (r1 - r0)) * (d1 - d0);
    return f;
  }
  const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

  /* ───────────── component ───────────── */
  function roofline(target, opts) {
    opts = opts || {};
    injectCSS();
    let fig = opts.figure || null;
    let parent = target;
    if (target && target.stage && target.root) { fig = target; parent = target.stage; }
    if (!parent) throw new Error('roofline: missing parent element');

    const o = Object.assign({
      system: 'h100-bf16', systems: null, compare: [], kernels: [], draggable: true, shade: null,
      regions: true, showControls: false, showWhy: true, scale: 'log', showScale: false, hover: true,
    }, opts);
    if (o.showReadouts === undefined) o.showReadouts = o.showControls;

    const S = {
      sys: null,
      list: [],
      compare: (o.compare || []).map(resolve),
      kernels: [],
      sel: 0,
      shade: o.shade || null,
      scale: o.scale === 'linear' ? 'linear' : 'log',
      cur: null,
    };
    // a string id is looked up in this chart's own systems (selector list, then comparison roofs) before the presets
    const lookup = (s) => {
      if (typeof s === 'string' || typeof s === 'number') {
        const id = String(s);
        const own = S.list.find((x) => x.id === id) || S.compare.find((x) => x.id === id) || (S.sys && S.sys.id === id ? S.sys : null);
        if (own) return own;
      }
      return resolve(s);
    };
    S.list = (o.systems || ORDER).map(resolve);
    S.sys = lookup(o.system);
    if (!S.list.some((s) => s.id === S.sys.id)) S.list.push(S.sys);
    S.cur = { flops: S.sys.flops, bw: S.sys.bw };

    const listeners = { change: [] };
    const emit = (ev, data) => (listeners[ev] || []).slice().forEach((fn) => { try { fn(data); } catch (e) { console.error('[roofline] listener', e); } });

    /* DOM scaffold */
    const wrap = GG.el('div', { class: 'rf' });
    parent.appendChild(wrap);
    const svg = GG.svg('svg', { class: 'rf-svg', role: 'group', 'data-keys': '' }, wrap);
    const clipId = GG.uid('rfclip');
    let ctlEl, roEl, whyEl = null, dockEl = null;
    if (fig) { ctlEl = fig.controls; roEl = fig.readouts; }
    else {
      dockEl = GG.el('div', { class: 'rf-dock' });
      ctlEl = GG.el('div'); roEl = GG.el('div');
      dockEl.append(ctlEl, roEl);
      wrap.append(dockEl);
      whyEl = GG.el('p', { class: 'rf-why', 'aria-live': 'polite' });
      wrap.append(whyEl);
    }
    const added = []; // nodes we added to the figure dock (removed on destroy)
    const setWhy = (h) => { if (!o.showWhy) return; if (fig) fig.setWhy(h); else whyEl.innerHTML = h; };

    /* controls */
    let sysSeg = null, scaleSeg = null;
    function buildSelector() {
      if (sysSeg) { sysSeg.el.remove(); sysSeg = null; }
      if (!o.showControls || S.list.length < 2) return;
      const holder = GG.el('div', { style: 'display:contents' });
      sysSeg = GG.ui.seg(holder, {
        label: o.selectorLabel || 'System (compute / memory)',
        options: S.list.map((s) => ({ value: s.id, label: s.label, title: s.name + ': ' + fmtPerf(s.flops, 4) + ', ' + fmtBW(s.bw) })),
        value: S.sys.id,
        onChange: (v) => api.setSystem(v),
      });
      ctlEl.insertBefore(sysSeg.el, ctlEl.firstChild && scaleSeg ? scaleSeg.el : null);
      holder.remove();
      added.push(sysSeg.el);
    }
    buildSelector();
    if (o.showScale) {
      scaleSeg = GG.ui.seg(ctlEl, {
        label: 'Axes',
        options: [{ value: 'log', label: 'log–log', title: 'Logarithmic axes: every decade the same width' }, { value: 'linear', label: 'linear', title: 'Linear axes: the memory roof is a line through the origin with slope = bandwidth' }],
        value: S.scale,
        onChange: (v) => api.setScale(v),
      });
      added.push(scaleSeg.el);
    }
    const st = {};
    if (o.showReadouts) {
      st.ridge = GG.ui.stat(roEl, { label: 'Ridge point', value: '—', title: 'compute roof ÷ memory roof' });
      st.ai = GG.ui.stat(roEl, { label: 'Intensity', value: '—' });
      st.perf = GG.ui.stat(roEl, { label: 'Attainable', value: '—' });
      st.bound = GG.ui.stat(roEl, { label: 'Bound', value: '—' });
      st.peak = GG.ui.stat(roEl, { label: 'Compute roof', value: '—', tone: 'core' });
      st.bw = GG.ui.stat(roEl, { label: 'Memory roof', value: '—', tone: 'memory' });
      Object.values(st).forEach((s) => added.push(s.el));
    }

    /* kernels */
    function normKernels(list) {
      const n = (list || []).length;
      return (list || []).map((k, i) => ({
        id: k.id != null ? String(k.id) : 'k' + i,
        label: k.label != null ? String(k.label) : (n > 1 ? 'Kernel ' + (i + 1) : 'Kernel'),
        ai: +k.ai > 0 ? +k.ai : 1,
        achieved: k.achieved != null ? clamp(+k.achieved || 0, 0.001, 1) : 1,
        color: colorOf(k.color),
        draggable: k.draggable != null ? !!k.draggable : !!o.draggable,
        bound: k.bound != null && String(k.bound) !== '' ? String(k.bound) : null,
        boundTone: k.boundTone != null ? k.boundTone : null,
      }));
    }
    S.kernels = normKernels(o.kernels);
    if (o.selected != null) { const j = S.kernels.findIndex((k) => k.id === String(o.selected)); if (j >= 0) S.sel = j; }

    /* ── layout ── */
    let L = null; // current layout
    let E = null; // element refs
    let W = 0;

    function logDomain() {
      const all = [...S.list, ...S.compare, S.sys];
      let xd = o.xDomain, yd = o.yDomain;
      if (!xd) {
        let lo = 0.1, hi = 1e4;
        const rMin = Math.min(...all.map((s) => s.ridge)), rMax = Math.max(...all.map((s) => s.ridge));
        const ais = S.kernels.map((k) => k.ai);
        const kMin = ais.length ? Math.min(...ais) : Infinity, kMax = ais.length ? Math.max(...ais) : 0;
        while (lo > rMin / 100 || lo > kMin / 1.5) lo /= 10;
        while (hi < rMax * 4 || hi < kMax * 1.5) hi *= 10;
        xd = [lo, hi];
      }
      if (!yd) {
        const bwMin = Math.min(...all.map((s) => s.bw));
        let yMin = bwMin * xd[0];
        S.kernels.forEach((k) => { yMin = Math.min(yMin, Math.min(...all.map((s) => Math.min(s.flops, s.bw * k.ai))) * k.achieved); });
        const lo = 10 ** Math.floor(lg(yMin) + 1e-9);
        const hi = Math.max(...all.map((s) => s.flops)) * 10 ** 0.36;
        yd = [lo, hi];
      }
      return { xd, yd };
    }
    function linDomain() {
      const s = S.sys;
      // fit the system (ridge × 2.2) and every kernel (× 1.15), but never squeeze the ridge into the first
      // eighth of the axis: a kernel further out is drawn at the edge, marked off scale
      const kMax = S.kernels.length ? Math.max(...S.kernels.map((k) => k.ai)) : 0;
      const hi = Math.max(s.ridge * 2.2, Math.min(kMax * 1.15, s.ridge * 8));
      return { xd: [0, niceCeil(hi)], yd: [0, niceCeil(s.flops * 1.18)] };
    }

    function computeLayout() {
      const narrow = W < 520;
      const log = S.scale === 'log';
      const { xd, yd } = log ? logDomain() : linDomain();
      // ticks
      const xt = [], yt = [], xminor = [], yminor = [];
      if (log) {
        for (let e = Math.ceil(lg(xd[0]) - 1e-9); e <= Math.floor(lg(xd[1]) + 1e-9); e++) xt.push(10 ** e);
        for (let e = Math.ceil(lg(yd[0]) - 1e-9); e <= Math.floor(lg(yd[1]) + 1e-9); e++) yt.push(10 ** e);
        for (let e = Math.floor(lg(xd[0])); e <= Math.ceil(lg(xd[1])); e++) for (let m = 2; m <= 9; m++) { const v = m * 10 ** e; if (v > xd[0] && v < xd[1]) xminor.push(v); }
        for (let e = Math.floor(lg(yd[0])); e <= Math.ceil(lg(yd[1])); e++) for (let m = 2; m <= 9; m++) { const v = m * 10 ** e; if (v > yd[0] && v < yd[1]) yminor.push(v); }
      } else {
        const sx = niceStep(xd[1] / (narrow ? 3.5 : 5)), sy = niceStep(yd[1] / 5);
        for (let v = 0; v <= xd[1] + 1e-9; v += sx) xt.push(Math.round(v * 1e6) / 1e6);
        for (let v = 0; v <= yd[1] * (1 + 1e-9); v += sy) yt.push(v);
      }
      const xLab = (v) => {
        if (!log) return num(v);
        if (narrow && v >= 1e6) return num(v / 1e6) + 'M';
        if (narrow && v >= 1000) return num(v / 1000) + 'k';
        return num(v);
      };
      const yLab = (v) => (v === 0 ? '0' : narrow ? fmtPerfShort(v) : fmtPerf(v));
      const fs = 11;
      const yLabW = Math.max(...yt.map((v) => tw(yLab(v), fs)), 20);
      // room on the right for the last x tick label when it sits at the axis end ('1,500', '100,000')
      const xLast = xt[xt.length - 1];
      const rNeed = xLast != null && Math.abs(xLast - xd[1]) <= 1e-9 * xd[1] ? Math.ceil(tw(xLab(xLast), fs) / 2) + 2 : 0;
      const m = { l: Math.ceil(yLabW + 14), r: Math.max(narrow ? 12 : 20, rNeed), t: 30, b: narrow ? 46 : 50 };
      let H;
      if (typeof o.height === 'function') H = o.height(W);
      else if (typeof o.height === 'number') H = o.height;
      else H = narrow ? Math.round(W * 0.92) : Math.round(clamp(W * 0.56, 340, 540));
      H = Math.max(220, Math.round(H));
      const x0 = m.l, x1 = W - m.r, y0 = m.t, y1 = H - m.b;
      return {
        W, H, m, narrow, log, xd, yd, xt, yt, xminor, yminor, xLab, yLab, x0, x1, y0, y1,
        xs: scale(xd[0], xd[1], x0, x1, log), ys: scale(yd[0], yd[1], y1, y0, log),
      };
    }

    /* ── build (DOM for the current layout; run on resize / structural change) ── */
    function build() {
      if (!W) return;
      L = computeLayout();
      const { W: w, H, x0, x1, y0, y1, xs, ys } = L;
      svg.textContent = '';
      setA(svg, { viewBox: `0 0 ${w} ${H}`, width: w, height: H });
      E = {};
      const g = (cls, p) => GG.svg('g', cls ? { class: cls } : null, p || svg);
      const defs = GG.svg('defs', null, svg);
      const cp = GG.svg('clipPath', { id: clipId }, defs);
      GG.svg('rect', { x: x0, y: y0 - 1, width: x1 - x0 + 1, height: y1 - y0 + 1 }, cp);

      // plot background + grid
      E.plot = GG.svg('rect', { class: 'rf-plotbg rf-plot', x: x0, y: y0, width: x1 - x0, height: y1 - y0 }, svg);
      const grid = g('rf-gridg');
      L.xt.forEach((v) => { const x = Math.round(xs(v)) + 0.5; if (x > x0 + 1) GG.svg('line', { class: 'rf-grid', x1: x, x2: x, y1: y0, y2: y1 }, grid); });
      L.yt.forEach((v) => { const y = Math.round(ys(v)) + 0.5; if (y < y1 - 1) GG.svg('line', { class: 'rf-grid', x1: x0, x2: x1, y1: y, y2: y }, grid); });

      // shading + region labels (clipped)
      const clipped = g(null); clipped.setAttribute('clip-path', `url(#${clipId})`);
      E.shMem = GG.svg('path', { class: 'rf-shade-mem' }, clipped);
      E.shCmp = GG.svg('path', { class: 'rf-shade-cmp' }, clipped);

      // comparison roofs
      E.cmpRoofs = S.compare.map((c, j) => {
        const cg = g('rf-cmpr', clipped);
        const ext = GG.svg('path', { class: 'rf-ext' }, cg);
        const line = GG.svg('path', null, cg);
        if (c.dash) line.style.strokeDasharray = String(c.dash);
        const mk = GG.svg('rect', { width: 6, height: 6 }, cg);
        const lab = GG.svg('text', { class: 'rf-cmpr-t', 'text-anchor': 'end' }, svg);
        lab.textContent = c.label;
        // a blank label (e.g. '\u200b') means "no label"
        const hasLab = String(c.label || '').replace(/[\s\u200b-\u200d\ufeff]/g, '') !== '';
        return { sys: c, j, g: cg, ext, line, mk, lab, hasLab };
      });

      // main roofs
      E.memExt = GG.svg('path', { class: 'rf-mem rf-ext' }, clipped);
      E.cmpExt = GG.svg('path', { class: 'rf-cmp rf-ext' }, clipped);
      E.memLine = GG.svg('path', { class: 'rf-mem' }, clipped);
      E.cmpLine = GG.svg('path', { class: 'rf-cmp' }, clipped);
      E.drop = GG.svg('line', { class: 'rf-drop' }, svg);

      // slope triangle (linear only); its labels are created after the kernels' guide lines, below
      E.tri = GG.svg('path', { class: 'rf-tri' }, clipped);

      // axes
      const ax = g('rf-axes');
      GG.svg('path', { class: 'rf-axis', d: `M${x0},${y0 - 12}V${y1}H${x1 + 8}` }, ax);
      GG.svg('path', { class: 'rf-arrow', d: `M${x0},${y0 - 18}l-4,8h8z` }, ax);
      GG.svg('path', { class: 'rf-arrow', d: `M${x1 + 14},${y1}l-8,-4v8z` }, ax);
      if (L.log) {
        L.xminor.forEach((v) => { const x = Math.round(xs(v)) + 0.5; GG.svg('line', { class: 'rf-minor', x1: x, x2: x, y1: y1, y2: y1 + 3 }, ax); });
        L.yminor.forEach((v) => { const y = Math.round(ys(v)) + 0.5; GG.svg('line', { class: 'rf-minor', x1: x0 - 3, x2: x0, y1: y, y2: y }, ax); });
      }
      E.xTicks = L.xt.map((v) => {
        const x = xs(v);
        GG.svg('line', { class: 'rf-axis', x1: x, x2: x, y1: y1, y2: y1 + 5 }, ax);
        const t = GG.svg('text', { class: 'rf-tick', x, y: y1 + 18, 'text-anchor': 'middle' }, ax);
        t.textContent = L.xLab(v);
        return { v, t, x, w: tw(t.textContent, 11) };
      });
      E.yTicks = L.yt.map((v) => {
        const y = ys(v);
        GG.svg('line', { class: 'rf-axis', x1: x0 - 5, x2: x0, y1: y, y2: y }, ax);
        const t = GG.svg('text', { class: 'rf-tick', x: x0 - 8, y: y + 4, 'text-anchor': 'end' }, ax);
        t.textContent = L.yLab(v);
        return { v, t, y };
      });
      const xt = GG.svg('text', { class: 'rf-axt', x: (x0 + x1) / 2, y: H - 8, 'text-anchor': 'middle' }, svg);
      xt.textContent = 'Arithmetic intensity (FLOPs/byte)';
      const yt = GG.svg('text', { class: 'rf-axt', x: x0 + 12, y: 14 }, svg);
      yt.textContent = L.narrow ? 'Performance (FLOP/s)' : 'Attainable performance (FLOP/s)';

      // ridge marker, labels, chips
      E.ridge = GG.svg('rect', { class: 'rf-ridge', width: 11, height: 11, rx: 1.5 }, svg);
      E.memLab = GG.svg('text', { class: 'rf-lab rf-lab-mem', 'text-anchor': 'middle' }, svg);
      E.cmpLab = GG.svg('text', { class: 'rf-lab rf-lab-cmp' }, svg);
      E.rLab = GG.svg('text', { class: 'rf-rlab' }, svg);
      E.rSub = GG.svg('text', { class: 'rf-rsub' }, svg);
      const chip = (cls) => { const cg = g('rf-chip ' + cls); const r = GG.svg('rect', { rx: 5, height: 18 }, cg); const t = GG.svg('text', { 'text-anchor': 'middle' }, cg); return { g: cg, r, t }; };
      E.xChip = chip('rf-chip-x');
      E.yChip = chip('rf-chip-cmp');

      // kernels
      // kernels' guide lines sit in a layer below every label, so a label backing always covers them
      E.kGuides = g('rf-kguides');
      // the rise/run labels sit on dark backings above the guide lines, like the kernel labels
      E.triRunBg = GG.svg('rect', { class: 'rf-tri-bg', rx: 3 }, svg);
      E.triRiseBg = GG.svg('rect', { class: 'rf-tri-bg', rx: 3 }, svg);
      E.triRun = GG.svg('text', { class: 'rf-tri-t' }, svg);
      E.triRise = GG.svg('text', { class: 'rf-tri-t' }, svg);
      E.regMem = GG.svg('text', { class: 'rf-reg rf-reg-mem', 'text-anchor': 'middle' }, svg);
      E.regCmp = GG.svg('text', { class: 'rf-reg rf-reg-cmp', 'text-anchor': 'middle' }, svg);
      E.regMem.textContent = 'memory-bound';
      E.regCmp.textContent = 'compute-bound';
      E.kg = g('rf-kernels');
      E.ks = S.kernels.map((k, i) => buildKernel(k, i));

      // hover layer
      E.hov = g('rf-hov');
      E.hLine = GG.svg('line', null, E.hov);
      E.hDot = GG.svg('circle', { r: 4 }, E.hov);
      E.hBg = GG.svg('rect', { rx: 5, height: 20 }, E.hov);
      E.hText = GG.svg('text', null, E.hov);
      show(E.hov, false);
    }

    function buildKernel(k, i) {
      const kg = GG.svg('g', { class: 'rf-k' + (k.draggable ? '' : ' static'), 'data-i': i }, E.kg);
      const lines = GG.svg('g', { class: 'rf-k-lines', 'data-i': i }, E.kGuides);
      // a fixed colour is set once; a regime colour is (re)set by update()
      if (k.color) { kg.style.setProperty('--kc', k.color); lines.style.setProperty('--kc', k.color); }
      const guide = GG.svg('line', { class: 'rf-k-guide' }, lines);
      const gap = GG.svg('line', { class: 'rf-k-gap' }, lines);
      const ring = GG.svg('circle', { class: 'rf-k-ring', r: 6 }, lines);
      const lead = GG.svg('line', { class: 'rf-k-lead' }, kg);
      const bgN = GG.svg('rect', { class: 'rf-k-bg', rx: 4 }, kg);
      const name = GG.svg('text', { class: 'rf-k-name' }, kg);
      const val = GG.svg('text', { class: 'rf-k-val' }, kg);
      const chevL = GG.svg('path', { class: 'rf-k-chev' }, kg);
      const chevR = GG.svg('path', { class: 'rf-k-chev' }, kg);
      const offA = GG.svg('path', { class: 'rf-k-offa' }, kg);
      const focus = GG.svg('circle', { class: 'rf-k-focus', r: 11.5 }, kg);
      const dot = GG.svg('circle', { class: 'rf-k-dot', r: 6.5 }, kg);
      const hitc = GG.svg('circle', { class: 'rf-k-hit', r: 18 }, kg);
      name.textContent = k.label;
      show(chevL, k.draggable); show(chevR, k.draggable);
      if (k.draggable) {
        setA(kg, { tabindex: '0', role: 'slider', 'aria-orientation': 'horizontal' });
        kg.addEventListener('keydown', (e) => onKey(e, i));
        kg.addEventListener('focus', () => { if (S.sel !== i) { S.sel = i; refresh(true); } });
      } else {
        setA(kg, { role: 'img' });
      }
      return { g: kg, lines, kc: k.color, guide, gap, ring, lead, bgN, name, val, chevL, chevR, offA, focus, dot, hitc };
    }

    /* ── update (positions only; safe to call every frame: no nodes are created) ── */
    function update() {
      if (!L || !E) return;
      const { x0, x1, y0, y1, xs, ys, narrow, log } = L;
      const f = S.cur.flops, b = S.cur.bw, r = f / b;
      const yF = ys(f), xR = xs(r);

      /* roofs */
      const xa = log ? Math.max(L.xd[0], L.yd[0] / b) : 0;
      const pA = { x: xs(xa), y: ys(b * xa) }, pR = { x: xR, y: yF };
      const pTop = { x: xs(L.yd[1] / b), y: ys(L.yd[1]) };
      E.memLine.setAttribute('d', `M${f1(pA.x)},${f1(pA.y)}L${f1(pR.x)},${f1(pR.y)}`);
      E.memExt.setAttribute('d', `M${f1(pR.x)},${f1(pR.y)}L${f1(pTop.x)},${f1(pTop.y)}`);
      E.cmpLine.setAttribute('d', `M${f1(xR)},${f1(yF)}H${x1}`);
      E.cmpExt.setAttribute('d', `M${x0},${f1(yF)}H${f1(xR)}`);

      /* shading */
      const xrC = clamp(xR, x0, x1);
      E.shMem.setAttribute('d', `M${f1(pA.x)},${y1}L${f1(pA.x)},${f1(pA.y)}L${f1(pR.x)},${f1(pR.y)}L${f1(pR.x)},${y1}Z`);
      E.shCmp.setAttribute('d', `M${f1(xrC)},${y1}V${f1(yF)}H${x1}V${y1}Z`);
      E.shMem.classList.toggle('on', S.shade === 'memory' || S.shade === 'both');
      E.shCmp.classList.toggle('on', S.shade === 'compute' || S.shade === 'both');

      /* ridge marker + drop line */
      const ridgeIn = xR >= x0 - 1 && xR <= x1 + 1;
      show(E.ridge, ridgeIn); show(E.drop, ridgeIn);
      setA(E.ridge, { x: f1(xR - 5.5), y: f1(yF - 5.5) });
      setA(E.drop, { x1: f1(xR), x2: f1(xR), y1: f1(yF + 6), y2: y1 });

      /* x chip: the ridge point's intensity, on the axis */
      const rTxt = fmtRidge(r);
      setT(E.xChip.t, rTxt);
      const xcw = tw(rTxt, 11) + 12;
      const xcx = clamp(xR, x0 + xcw / 2, x1 - xcw / 2 + 10);
      setA(E.xChip.r, { x: f1(xcx - xcw / 2), y: y1 + 5, width: f1(xcw) });
      setA(E.xChip.t, { x: f1(xcx), y: y1 + 18 });
      show(E.xChip.g, ridgeIn);
      const xChipBox = { x: xcx - xcw / 2 - 6, y: y1 + 4, w: xcw + 12, h: 20 }; // ticks closer than 6 px to the chip are hidden
      // hide x tick labels under the ridge chip, and any that would touch the previous visible one
      let tickEnd = -Infinity;
      E.xTicks.forEach((tk) => {
        const on = (!ridgeIn || !hit({ x: tk.x - tk.w / 2, y: y1 + 6, w: tk.w, h: 14 }, xChipBox)) && tk.x - tk.w / 2 >= tickEnd + 4;
        show(tk.t, on);
        if (on) tickEnd = tk.x + tk.w / 2;
      });

      /* y chip: the compute roof's height, on the axis */
      const yTxt = narrow ? fmtPerfShort(f, 4) : fmtPerf(f, 4);
      setT(E.yChip.t, yTxt);
      const ycw = tw(yTxt, 11) + 12;
      const ycx = Math.max(ycw / 2 + 1, x0 - 6 - ycw / 2);
      setA(E.yChip.r, { x: f1(ycx - ycw / 2), y: f1(yF - 9), width: f1(ycw) });
      setA(E.yChip.t, { x: f1(ycx), y: f1(yF + 4) });
      E.yTicks.forEach((tk) => show(tk.t, Math.abs(tk.y - yF) > 14));

      /* comparison roofs */
      // a comparison roof identical to the current system is hidden
      E.cmpRoofs.forEach((c) => { c.on = !(c.sys.flops === S.sys.flops && c.sys.bw === S.sys.bw); show(c.g, c.on); });
      E.cmpRoofs.forEach((c) => {
        if (!c.on) return;
        const cf = c.sys.flops, cb = c.sys.bw, cr = cf / cb;
        const cxa = log ? Math.max(L.xd[0], L.yd[0] / cb) : 0;
        c.line.setAttribute('d', `M${f1(xs(cxa))},${f1(ys(cb * cxa))}L${f1(xs(cr))},${f1(ys(cf))}H${x1}`);
        c.ext.setAttribute('d', `M${f1(xs(cr))},${f1(ys(cf))}L${f1(xs(L.yd[1] / cb))},${f1(ys(L.yd[1]))}`);
        setA(c.mk, { x: f1(xs(cr) - 3), y: f1(ys(cf) - 3) });
      });

      /* kernel geometry (a kernel outside the x domain is pinned to the edge and marked "off scale") */
      const kg = S.kernels.map((k) => {
        const roof = Math.min(f, b * k.ai);
        const rx = xs(k.ai);
        const off = rx > x1 + 0.5 ? 1 : rx < x0 - 0.5 ? -1 : 0;
        return { k, roof, off, px: clamp(rx, x0, x1), roofY: clamp(ys(roof), y0, y1), py: clamp(ys(roof * k.achieved), y0, y1) };
      });

      /* obstacles for label placement: boxes (t 'mark' = a drawn mark, 'lab' = a placed label) and segments.
         Every label below joins one collision set, so no label is ever printed over another. */
      const baseBoxes = [], baseSegs = [];
      baseSegs.push({ a: pA, b: pR, t: 'mem' }, { a: pR, b: { x: x1, y: yF }, t: 'cmp' }, { a: { x: x0, y: yF }, b: pR, t: 'cmpExt' }, { a: pR, b: pTop, t: 'memExt' });
      if (ridgeIn) { baseSegs.push({ a: { x: xR, y: yF + 6 }, b: { x: xR, y: y1 }, t: 'drop' }); baseBoxes.push({ x: xR - 7, y: yF - 7, w: 14, h: 14, o: 'ridge', t: 'mark' }); }
      kg.forEach((q, i) => {
        baseBoxes.push({ x: q.px - 10, y: q.py - 10, w: 20, h: 20, o: 'k' + i, t: 'mark' });
        if (q.k.draggable) baseBoxes.push({ x: q.px - 17, y: q.py - 5, w: 34, h: 10, o: 'k' + i, t: 'mark' }); // drag chevrons
        baseSegs.push({ a: { x: q.px, y: y1 }, b: { x: q.px, y: q.py }, t: 'guide', o: 'k' + i });
        if (q.k.achieved < 0.999) baseBoxes.push({ x: q.px - 8, y: q.roofY - 8, w: 16, h: 16, o: 'k' + i, t: 'mark' });
      });
      // comparison roofs: their flat and slanted parts (a part that coincides with a main roof adds nothing)
      E.cmpRoofs.forEach((c) => {
        if (!c.on) return;
        const cf = c.sys.flops, cb = c.sys.bw, crx = xs(cf / cb), cy = ys(cf);
        if (Math.abs(lg(cf / f)) > 0.004) baseSegs.push({ a: { x: crx, y: cy }, b: { x: x1, y: cy }, t: 'cmpr', o: 'c' + c.j });
        if (Math.abs(lg(cb / b)) > 0.004) {
          const cxa = log ? Math.max(L.xd[0], L.yd[0] / cb) : 0;
          baseSegs.push({ a: { x: xs(cxa), y: ys(cb * cxa) }, b: { x: crx, y: cy }, t: 'cmprS', o: 'c' + c.j });
        }
      });
      const inPlotBox = (bx) => bx.x >= x0 + 2 && bx.x + bx.w <= x1 + 2 && bx.y >= y0 - 2 && bx.y + bx.h <= y1 - 2;
      const PAD = 3;
      const padded = (bx) => ({ x: bx.x - PAD, y: bx.y - PAD, w: bx.w + 2 * PAD, h: bx.h + 2 * PAD });
      // the leader line from a kernel's point (an) to its label box bx, as drawn in "apply" below; null when the
      // label sits next to its point and no leader is drawn
      const leaderOf = (an, bx) => {
        const lx = clamp(an.x, bx.x - 4, bx.x + bx.w + 4), ly = clamp(an.y, bx.y - 2, bx.y + bx.h + 1);
        return Math.hypot(lx - an.x, ly - an.y) > 18 ? { a: { x: an.x, y: an.y }, b: { x: lx, y: ly } } : null;
      };
      // does that leader cross another label or another owner's mark? (it starts inside its own point's mark)
      const leadHits = (C, an, bx, own) => {
        const ld = an && leaderOf(an, bx);
        return !!ld && C.boxes.some((q) => (own == null || q.o !== own) && segBox(ld.a, ld.b, q));
      };
      // is box bx free in collision set C? `ignore`: segment tags to ignore; `own`: owner whose own marks may be
      // touched; `an`: the point a leader line would join it to (that leader must not cross a label either)
      const free = (C, bx, ignore, own, an) => {
        if (!inPlotBox(bx)) return false;
        const pb = padded(bx);
        return !C.boxes.some((q) => (own == null || q.o !== own) && hit(q, pb)) &&
          !C.segs.some((sg) => !(ignore && ignore.includes(sg.t)) && (own == null || sg.o !== own) && segBox(sg.a, sg.b, pb)) &&
          !leadHits(C, an, bx, own);
      };
      // how bad is box bx? 0 = free; crossing a faint or dashed line is cheap, covering text, a mark or a roof is not
      const SEGW = { mem: 300, cmp: 300, memExt: 40, cmpExt: 40, tri: 60, cmpr: 25, cmprS: 25, guide: 20, drop: 20, lead: 150 };
      const costOf = (C, bx, ignore, own, an) => {
        if (!inPlotBox(bx)) return Infinity;
        const pb = padded(bx);
        let c = 0;
        C.boxes.forEach((q) => { if ((own == null || q.o !== own) && hit(q, pb)) c += q.t === 'mark' ? 500 : 1000; });
        C.segs.forEach((sg) => { if (!(ignore && ignore.includes(sg.t)) && (own == null || sg.o !== own) && segBox(sg.a, sg.b, pb)) c += SEGW[sg.t] || 50; });
        if (leadHits(C, an, bx, own)) c += 400;
        return c;
      };
      // try variants × positions (strict, then letting labels sit over the faint comparison roofs);
      // returns {v, x, y, w, h, k (position index)} or null
      const placeLabel = (C, variants, positions, ignore, own, an) => {
        for (const ig of [ignore || [], (ignore || []).concat(['cmpr', 'cmprS'])]) {
          for (const v of variants) {
            for (let k = 0; k < positions.length; k++) {
              const bx = positions[k](v.w, v.h);
              if (free(C, bx, ig, own, an)) return Object.assign({ v, k }, bx);
            }
          }
        }
        return null;
      };
      // the least bad position with cost ≤ max (or null)
      const softBest = (C, variants, positions, ignore, own, max, an) => {
        let best = null;
        for (const v of variants) {
          for (let k = 0; k < positions.length; k++) {
            const bx = positions[k](v.w, v.h);
            const c = costOf(C, bx, ignore, own, an);
            if (c <= max && (!best || c < best.cost)) best = Object.assign({ v, k, cost: c }, bx);
          }
        }
        return best;
      };
      // the free spot nearest to (px, py), within maxD px of it (a leader line will join them). Unless `loose`, it
      // must also be nearer to this point than to any other kernel's, so that it cannot be read as another
      // kernel's label; with `loose` the leader line alone makes the link (used when nothing else fits).
      const dBox = (px, py, x, y, w, h) => Math.hypot(px < x ? x - px : px > x + w ? px - x - w : 0, py < y ? y - py : py > y + h ? py - y - h : 0);
      const gridNear = (C, v, px, py, maxD, ignore, own, loose) => {
        const step = narrow ? 6 : 8, cands = [];
        const others = loose ? [] : kg.filter((q, i) => 'k' + i !== own);
        for (let y = y0 + 2; y <= y1 - v.h - 3; y += step) {
          for (let x = x0 + 4; x <= x1 - v.w - 2; x += step) {
            const d = dBox(px, py, x, y, v.w, v.h);
            if (d >= 10 && d <= maxD && others.every((q) => dBox(q.px, q.py, x, y, v.w, v.h) > d + 4)) cands.push({ x, y, d });
          }
        }
        cands.sort((p, q) => p.d - q.d);
        const an = { x: px, y: py };
        for (const c of cands) {
          const bx = { x: c.x, y: c.y, w: v.w, h: v.h };
          if (free(C, bx, ignore, own, an)) return Object.assign({ v, k: -1 }, bx);
        }
        return null;
      };
      // a label rotated along segment a→bb: on its upper/left side first, then on the other side
      const T_ALONG = [0.5, 0.36, 0.64, 0.24, 0.76, 0.14, 0.86, 0.43, 0.57, 0.3, 0.7, 0.19, 0.81];
      const alongSeg = (C, a, bb, texts, fs, ignore, own) => {
        const segLen = Math.hypot(bb.x - a.x, bb.y - a.y);
        const ang = Math.atan2(bb.y - a.y, bb.x - a.x);
        const dx = Math.cos(ang), dy = Math.sin(ang), nx = Math.sin(ang), ny = -Math.cos(ang);
        const gh = fs * 0.75; // glyph body height
        const vs = texts.filter((s) => tw(s, fs) < segLen - 20);
        for (const side of [1, -1]) {
          const bo = side > 0 ? 9 : -(5 + gh); // baseline offset from the line, along the normal
          for (const s of vs) {
            const lw = tw(s, fs);
            for (const t of T_ALONG) {
              const cx = a.x + (bb.x - a.x) * t + nx * bo, cy = a.y + (bb.y - a.y) * t + ny * bo;
              // the rotated label as small boxes along its centre line
              const parts = [];
              for (let u = -lw / 2; u <= lw / 2 + 0.1; u += 9) {
                const mx = cx + dx * u + nx * (gh / 2), my = cy + dy * u + ny * (gh / 2);
                parts.push({ x: mx - 4.5, y: my - (gh + 2) / 2, w: 9, h: gh + 2, t: 'lab' });
              }
              if (parts.every((q) => free(C, q, ignore, own))) return { s, cx, cy, ang, parts, side };
            }
          }
        }
        return null;
      };
      // a placed label's footprint, grown by gx / gy px (default gy: none) so that neighbours keep some air
      const labBox = (p, gx, gy) => ({ x: p.x - (gx || 0), y: p.y - (gy || 0), w: p.w + 2 * (gx || 0), h: p.h + 2 * (gy || 0), t: 'lab' });

      /* 1. ridge label */
      const stepRidge = (C, R) => {
        const sub = rTxt + ' ' + fpw(rTxt) + '/byte';
        const two = { s: 'ridge point', s2: sub, w: Math.max(tw('ridge point', 12), tw(sub, 11)), h: 30 };
        const one = { s: 'ridge point', s2: '', w: tw('ridge point', 12), h: 14 };
        const p = ridgeIn ? placeLabel(C, narrow ? [one] : [two, one], [
          (w, h) => ({ x: xR + 10, y: yF + 9, w, h }),
          (w, h) => ({ x: xR - 10 - w, y: yF - 9 - h, w, h }),
          (w, h) => ({ x: xR + 10, y: yF - 9 - h, w, h }),
          (w, h) => ({ x: xR - 10 - w, y: yF + 9, w, h }),
          (w, h) => ({ x: xR + 10, y: yF + 30, w, h }),
        ], null, 'ridge') : null;
        R.ridge = p;
        if (p) C.boxes.push(labBox(p, 8, 4)); // keep other labels a little further off, so none reads as part of it
        else if (ridgeIn) R.score += 15; // the chip on the x-axis still gives the value
      };

      /* 2. compute roof label: above the flat roof, right-aligned if possible; dropped (the y-axis chip still
         gives the value) rather than printed over another label */
      const stepCmp = (C, R) => {
        const vs = (narrow ? [fmtPerf(f, 4)] : ['compute roof · ' + fmtPerf(f, 4), fmtPerf(f, 4)]).map((s) => ({ s, w: tw(s, 12), h: 14 }));
        const pos = [
          (w, h) => ({ x: x1 - 6 - w, y: yF - 8 - h, w, h }),
          (w, h) => ({ x: x1 - 6 - w, y: yF - 11 - h, w, h }),
          (w, h) => ({ x: Math.max(x0 + 4, xR + 14), y: yF - 8 - h, w, h }),
          (w, h) => ({ x: x1 - 6 - w, y: yF + 8, w, h }),
          (w, h) => ({ x: x1 - 6 - w, y: yF + 11, w, h }),
          (w, h) => ({ x: xR - 14 - w, y: yF - 8 - h, w, h }),
          (w, h) => ({ x: Math.max(x0 + 4, xR + 14), y: yF + 8, w, h }),
          // further along the flat roof, above then below it
          ...[0.5, 0.3, 0.7].map((t) => (w, h) => ({ x: xrC + (x1 - xrC) * t - w / 2, y: yF - 8 - h, w, h })),
          ...[0.5, 0.3, 0.7].map((t) => (w, h) => ({ x: xrC + (x1 - xrC) * t - w / 2, y: yF + 8, w, h })),
        ];
        const ig = ['memExt', 'drop'];
        const p = placeLabel(C, vs, pos, ig) || softBest(C, [vs[vs.length - 1]], pos, ig, null, 45);
        R.cmp = p;
        if (p) C.boxes.push(labBox(p, 6)); // a little air, so it never reads as one phrase with 'ridge point'
        else R.score += 10;
      };

      /* 3. memory roof label, rotated along the slanted roof */
      const stepMem = (C, R) => {
        const segLen = Math.hypot(pR.x - pA.x, pR.y - pA.y);
        const vs = (log ? ['memory roof · ' + fmtBW(b), fmtBW(b)] : ['memory roof · slope ' + fmtBW(b), 'slope ' + fmtBW(b), fmtBW(b)]).filter((s) => tw(s, 12) < segLen - 20);
        // strict first, then allowed to sit over the faint comparison roofs (as the other labels are)
        const p = vs.length ? alongSeg(C, pA, pR, vs, 12, ['mem'], null) || alongSeg(C, pA, pR, vs, 12, ['mem', 'cmpr', 'cmprS'], null) : null;
        R.mem = p;
        if (p) C.boxes.push(...p.parts);
        else R.score += 25;
      };

      /* 4. rise/run triangle on linear axes: placed away from kernels, with its run label under the base and
         its rise label beside the vertical leg, each on a dark backing */
      const stepTri = (C, R) => {
        if (log) { R.tri = null; return; }
        let run = niceStep(r * 0.4);
        while (2 * run >= r) run /= 2;
        const starts = [run, run / 2, 1.5 * run].filter((s) => s + run < r * 0.999);
        const clearOf = (s) => kg.every((q) => q.px < xs(s) - 16 || q.px > xs(s + run) + 16);
        let cands = starts.filter(clearOf);
        if (!cands.length) cands = [starts[0] || run];
        const runA = fmtAI(run), u = fpw(runA);
        const runVs = (narrow ? [`run ${runA} ${u}/B`, `run ${runA}`] : [`run ${runA} ${u}/B`]).map((s) => ({ s, w: tw(s, 11), h: 13 }));
        const riseVs = (narrow ? ['rise ' + fmtPerf(b * run), 'rise ' + fmtPerfShort(b * run)] : ['rise ' + fmtPerf(b * run)]).map((s) => ({ s, w: tw(s, 11), h: 13 }));
        let best = null;
        for (const sA of cands) {
          const sB = sA + run;
          const lx = xs(sA), rx2 = xs(sB), by = ys(b * sA), ty = ys(b * sB);
          const C2 = { boxes: C.boxes.slice(), segs: C.segs.concat([{ a: { x: lx, y: by }, b: { x: rx2, y: by }, t: 'tri' }, { a: { x: rx2, y: by }, b: { x: rx2, y: ty }, t: 'tri' }]) };
          const runPos = [
            (w, h) => ({ x: (lx + rx2) / 2 - w / 2, y: by + 5, w, h }),
            (w, h) => ({ x: rx2 - w, y: by + 5, w, h }),
            (w, h) => ({ x: lx, y: by + 5, w, h }),
            (w, h) => ({ x: rx2 + 6, y: by + 3, w, h }),
          ];
          const risePos = [
            (w, h) => ({ x: rx2 + 6, y: (by + ty) / 2 - h / 2, w, h }),
            (w, h) => ({ x: rx2 + 6, y: ty + 2, w, h }),
            (w, h) => ({ x: rx2 + 6, y: by - h - 3, w, h }),
            (w, h) => ({ x: rx2 - 6 - w, y: by - h - 5, w, h }),
          ];
          let cost = 0;
          let pr = placeLabel(C2, runVs, runPos);
          if (!pr) { pr = softBest(C2, runVs.slice(-1), runPos, null, null, 1e6); cost += pr ? pr.cost : 1000; }
          if (!pr) pr = Object.assign({ v: runVs[runVs.length - 1] }, runPos[3](runVs[runVs.length - 1].w, 13));
          C2.boxes.push(labBox(pr, 3));
          let pq = placeLabel(C2, riseVs, risePos);
          if (!pq) { pq = softBest(C2, riseVs.slice(-1), risePos, null, null, 1e6); cost += pq ? pq.cost : 1000; }
          if (!pq) pq = Object.assign({ v: riseVs[riseVs.length - 1] }, risePos[0](riseVs[riseVs.length - 1].w, 13));
          C2.boxes.push(labBox(pq, 3));
          if (!best || cost < best.cost) best = { cost, sA, sB, pr, pq, C2 };
          if (cost === 0) break;
        }
        C.boxes = best.C2.boxes; C.segs = best.C2.segs;
        R.tri = best;
        R.score += Math.min(best.cost, 400);
      };

      /* 5. kernel labels: next to the point if there is room; else nearby with a leader line; on phones, the
         name alone; never printed over another label unless nothing else fits anywhere */
      const stepKernels = (C, R, kOrder) => {
        (kOrder || kg.map((q, i) => i)).forEach((i) => {
          const q = kg[i];
          const { k, px, py } = q;
          const an = { x: px, y: py };
          const side = k.draggable ? 19 : 14; // clear of the drag chevrons
          const a = k.ai, A = fmtAI(a), u = fpw(A), own = 'k' + i;
          const atR = Math.abs(lg(a / r)) < 1e-9;
          const bTxt = k.bound || (atR ? 'at the ridge' : a < r ? 'memory-bound' : 'compute-bound');
          let long = `${A} ${u}/byte · ${bTxt}`, short = `${A} ${u}/B`;
          if (q.off > 0) { long += ' · off scale →'; short = `${A} ${u}/B, off scale →`; }
          if (q.off < 0) { long = '← ' + long + ' · off scale'; short = `← ${A} ${u}/B, off scale`; }
          const full = (narrow ? [short] : [long, short]).map((s) => ({ s, w: Math.max(tw(k.label, 12), tw(s, 11)), h: 30 }));
          const last = full[full.length - 1];
          const nameV = { s: '', w: tw(k.label, 12), h: 15, nameOnly: true };
          const pos = [];
          for (const dyy of [12, 44, 76]) {
            pos.push((w, h) => ({ x: px + 12, y: py + dyy, w, h }), (w, h) => ({ x: px - 12 - w, y: py + dyy, w, h }));
          }
          pos.push((w, h) => ({ x: px + 12, y: py - 12 - h, w, h }), (w, h) => ({ x: px - 12 - w, y: py - 12 - h, w, h }));
          pos.push((w, h) => ({ x: px + 12, y: py - 44 - h, w, h }), (w, h) => ({ x: px - 12 - w, y: py - 44 - h, w, h }));
          pos.push(
            (w, h) => ({ x: px + side, y: py - h / 2, w, h }), (w, h) => ({ x: px - side - w, y: py - h / 2, w, h }),
            (w, h) => ({ x: px - w / 2, y: py - 14 - h, w, h }), (w, h) => ({ x: px - w / 2, y: py + 14, w, h }),
          );
          const farPos = [(w, h) => ({ x: px + 12, y: py - 76 - h, w, h }), (w, h) => ({ x: px - 12 - w, y: py - 76 - h, w, h })];
          // a kernel label sits on a dark backing, so it may cross the ridge's drop line and the faint slanted
          // comparison roofs. Wherever it goes, its leader line (if any) must not cross another label.
          const ig = ['drop', 'cmprS'];
          let p = placeLabel(C, full, pos, ig, own, an) || placeLabel(C, full, farPos, ig, own, an), pen = 0;
          // on phones the name alone next to the point beats the full label at the end of a leader
          if (!p && narrow) { p = placeLabel(C, [nameV], pos, ig, own, an); pen = 8; }
          // next to the point over another kernel's guide line (the label's backing covers it)
          if (!p) { p = softBest(C, [last], pos, ig, own, 45, an); if (p) pen = p.cost; }
          if (!p) { p = gridNear(C, last, px, py, 90, ig, own); pen = 6; }
          if (!p) { p = placeLabel(C, [nameV], pos, ig, own, an); pen = 8; }
          if (!p) { p = softBest(C, [nameV], pos, ig, own, 45, an); if (p) pen = 8 + p.cost; }
          if (!p) { p = gridNear(C, last, px, py, Infinity, ig, own); pen = 20; }
          if (!p) { p = gridNear(C, nameV, px, py, Infinity, ig, own); pen = 24; }
          // a free spot nearer to another kernel's point: the leader line says whose label it is
          if (!p) { p = gridNear(C, last, px, py, 120, ig, own, true); pen = 30; }
          if (!p) { p = gridNear(C, nameV, px, py, Infinity, ig, own, true); pen = 36; }
          if (!p) { p = softBest(C, [last, nameV], pos.concat(farPos), ig, own, 1e6, an); if (p) pen = 40 + p.cost; }
          if (!p) { p = { v: nameV, x: clamp(px + 12, x0 + 2, x1 - nameV.w), y: clamp(py + 12, y0, y1 - nameV.h - 2), w: nameV.w, h: nameV.h }; pen = 1000; }
          C.boxes.push(labBox(p, 3, 1)); // its dark backing reaches 4 px past the text
          // its leader line joins the collision set, so later labels do not sit on it
          const ld = leaderOf(an, p);
          if (ld) C.segs.push({ a: ld.a, b: ld.b, t: 'lead', o: own });
          R.ks[i] = { p, bTxt, A, u };
          R.score += pen;
        });
      };

      /* place the main labels; when a kernel label (or the triangle) has no good spot, retry with the
         kernels placed before the static "ridge point" / compute-roof text, and with the kernels in reverse
         order (the first one placed takes the best spot), and keep the best layout */
      const layout = (order, kOrder) => {
        const C = { boxes: baseBoxes.slice(), segs: baseSegs.slice() };
        const R = { score: 0, ks: [], C };
        const fn = { ridge: stepRidge, cmp: stepCmp, mem: stepMem, tri: stepTri, k: (C2, R2) => stepKernels(C2, R2, kOrder) };
        order.forEach((s) => fn[s](C, R));
        return R;
      };
      const ORDERS = [['ridge', 'cmp', 'mem', 'tri', 'k'], ['mem', 'tri', 'k', 'cmp', 'ridge'], ['k', 'tri', 'mem', 'cmp', 'ridge']];
      const kRev = kg.length > 1 ? kg.map((q, i) => kg.length - 1 - i) : null;
      let R = layout(ORDERS[0]);
      [[ORDERS[1]], [ORDERS[2]], ...(kRev ? [[ORDERS[0], kRev], [ORDERS[2], kRev]] : [])].forEach(([ord, ko]) => {
        if (R.score === 0) return;
        const R2 = layout(ord, ko);
        if (R2.score < R.score) R = R2;
      });
      const C = R.C;

      /* 6. comparison roof labels: on the faint roof's own flat part (default when it has its own height),
         along its slanted part (default when it shares its height with another roof), or beside its ridge
         square; hidden when nothing fits */
      E.cmpRoofs.forEach((c) => {
        c.place = null;
        if (!c.on || !c.hasLab) return;
        const cf = c.sys.flops, cb = c.sys.bw, crx = xs(cf / cb), y = ys(cf), own = 'c' + c.j;
        const shared = Math.abs(lg(cf / f)) < 0.004 || E.cmpRoofs.some((d) => d !== c && d.on && Math.abs(lg(d.sys.flops / cf)) < 0.004);
        const mode = c.sys.labelAt || o.compareLabelAt || (shared ? 'slope' : 'roof');
        const w = tw(c.sys.label, 10.5);
        const ig = ['drop', 'cmpExt', 'memExt'];
        const roofPos = [
          (w2, h) => ({ x: x1 - 6 - w2, y: y - 5 - h, w: w2, h }),
          (w2, h) => ({ x: x1 - 6 - w2, y: y + 5, w: w2, h }),
          (w2, h) => ({ x: Math.max(crx + 10, x0 + 4), y: y - 5 - h, w: w2, h }),
        ];
        const ridgePos = [
          (w2, h) => ({ x: crx - 8 - w2, y: y - 5 - h, w: w2, h }),
          (w2, h) => ({ x: crx + 8, y: y + 5, w: w2, h }),
          (w2, h) => ({ x: crx + 8, y: y - 5 - h, w: w2, h }),
          (w2, h) => ({ x: crx - 8 - w2, y: y + 5, w: w2, h }),
        ];
        if (mode === 'slope') {
          const cxa = log ? Math.max(L.xd[0], L.yd[0] / cb) : 0;
          const seg = segClip({ x: xs(cxa), y: ys(cb * cxa) }, { x: crx, y }, { x: x0, y: y0, w: x1 - x0, h: y1 - y0 });
          const rot = seg ? alongSeg(C, seg[0], seg[1], [c.sys.label], 10.5, ig, own) : null;
          if (rot) { c.place = { rot }; C.boxes.push(...rot.parts); return; }
        }
        const lists = mode === 'roof' ? [[roofPos, null], [ridgePos, own]] : [[ridgePos, own], [roofPos, null]];
        for (const [P, ow] of lists) {
          const p = placeLabel(C, [{ w, h: 13 }], P, ig, ow);
          if (p) { c.place = { box: p }; C.boxes.push(labBox(p)); return; }
        }
      });

      /* 7. region labels along the bottom of each region (or, if the bottom is taken, just under the roofs'
         height, still inside the region's band) */
      const region = (txt, left, right, shaded) => {
        const w = tw(txt, 10.5) + txt.length * 0.63; // + letter-spacing
        // passes: the bottom row; the bottom row across kernels' guide lines (the text has a dark halo);
        // then, for an unshaded region only, a row just under the roofs' height
        const passes = [[y1 - 10, ['cmpExt', 'memExt'], 6], [y1 - 10, ['cmpExt', 'memExt', 'guide', 'drop'], 6]];
        if (!shaded) passes.push([yF + 22, ['cmpExt', 'memExt'], 2]);
        if (o.regions && right - left > w + 12) {
          for (const [ry, ig, mg] of passes) {
            if (ry > y1 - 10 || ry - 11 < y0) continue;
            for (const t of [0.5, 0.3, 0.7, 0.18, 0.82, 0.4, 0.6, 0.1, 0.9]) {
              const mid = left + (right - left) * t;
              const bx = { x: mid - w / 2, y: ry - 11, w, h: 14 };
              if (bx.x < left + 2 || bx.x + w > right - 2) continue;
              if (free(C, { x: bx.x - mg, y: bx.y, w: bx.w + 2 * mg, h: bx.h }, ig)) { C.boxes.push(Object.assign({ t: 'lab' }, bx)); return { x: mid, y: ry }; }
            }
          }
        }
        return null;
      };
      const shM = S.shade === 'memory' || S.shade === 'both', shC = S.shade === 'compute' || S.shade === 'both';
      const regM = region('memory-bound', Math.max(x0, pA.x), xrC, shM);
      const regC = region('compute-bound', xrC, x1, shC);

      /* ── apply ── */
      {
        const p = R.ridge;
        show(E.rLab, !!p); show(E.rSub, !!(p && p.v.s2));
        if (p) {
          setT(E.rLab, p.v.s); setT(E.rSub, p.v.s2);
          setA(E.rLab, { x: f1(p.x), y: f1(p.y + 11), 'text-anchor': 'start' });
          setA(E.rSub, { x: f1(p.x), y: f1(p.y + 26), 'text-anchor': 'start' });
        }
      }
      show(E.cmpLab, !!R.cmp);
      if (R.cmp) { setT(E.cmpLab, R.cmp.v.s); setA(E.cmpLab, { x: f1(R.cmp.x), y: f1(R.cmp.y + 11) }); }
      show(E.memLab, !!R.mem);
      if (R.mem) {
        const m = R.mem;
        setT(E.memLab, m.s);
        setA(E.memLab, { x: f1(m.cx), y: f1(m.cy), transform: `rotate(${f1((m.ang * 180) / Math.PI)} ${f1(m.cx)} ${f1(m.cy)})` });
      }
      const triOn = !!R.tri;
      [E.tri, E.triRun, E.triRise, E.triRunBg, E.triRiseBg].forEach((el) => show(el, triOn));
      if (triOn) {
        const t = R.tri;
        const P = (x, y) => `${f1(xs(x))},${f1(ys(y))}`;
        E.tri.setAttribute('d', `M${P(t.sA, b * t.sA)}L${P(t.sB, b * t.sA)}L${P(t.sB, b * t.sB)}`);
        [[E.triRun, E.triRunBg, t.pr], [E.triRise, E.triRiseBg, t.pq]].forEach(([el, bg, p]) => {
          setT(el, p.v.s);
          setA(el, { x: f1(p.x), y: f1(p.y + 10), 'text-anchor': 'start' });
          setA(bg, { x: f1(p.x - 3), y: f1(p.y - 1), width: f1(p.w + 6), height: p.h + 2 });
        });
      }

      kg.forEach((q, i) => {
        const ke = E.ks[i], rk = R.ks[i];
        if (!ke || !rk) return;
        const { k, roof, px, roofY, py } = q;
        const { p, bTxt, A, u } = rk;
        // regime colour (no explicit color): the same verdict as the label, against the current (gliding) ridge
        if (!k.color) {
          const tone = k.bound && TOKENS.includes(k.boundTone) ? k.boundTone : null;
          const kc = tone ? `var(--${tone})` : k.ai < r && Math.abs(lg(k.ai / r)) >= 1e-9 ? 'var(--memory)' : 'var(--core)';
          if (ke.kc !== kc) { ke.kc = kc; ke.g.style.setProperty('--kc', kc); ke.lines.style.setProperty('--kc', kc); }
        }
        setA(ke.guide, { x1: f1(px), x2: f1(px), y1: y1, y2: f1(py + 7) });
        const gapOn = k.achieved < 0.999 && roofY < py - 8;
        show(ke.gap, gapOn); show(ke.ring, gapOn);
        setA(ke.gap, { x1: f1(px), x2: f1(px), y1: f1(roofY + 6), y2: f1(py - 7) });
        setA(ke.ring, { cx: f1(px), cy: f1(roofY) });
        [ke.dot, ke.hitc, ke.focus].forEach((c) => setA(c, { cx: f1(px), cy: f1(py) }));
        // off scale: a half dot clipped at the plot edge, with an arrow pointing to where it really is
        if (q.off) ke.dot.setAttribute('clip-path', `url(#${clipId})`); else ke.dot.removeAttribute('clip-path');
        show(ke.offA, !!q.off);
        if (q.off) ke.offA.setAttribute('d', q.off > 0 ? `M${f1(x1 + 3)},${f1(py - 5)}l7,5l-7,5z` : `M${f1(x0 - 3)},${f1(py - 5)}l-7,5l7,5z`);
        ke.chevL.setAttribute('d', `M${f1(px - 11)},${f1(py - 4)}l-5,4l5,4z`);
        ke.chevR.setAttribute('d', `M${f1(px + 11)},${f1(py - 4)}l5,4l-5,4z`);
        // (the left chevron is left out when it would poke into the y axis' tick labels)
        show(ke.chevR, k.draggable && q.off <= 0); show(ke.chevL, k.draggable && q.off >= 0 && px - 16 >= x0 - 2);
        const nameOnly = !!p.v.nameOnly;
        setT(ke.val, p.v.s);
        show(ke.val, !nameOnly);
        setA(ke.name, { x: f1(p.x), y: f1(p.y + 11) });
        setA(ke.val, { x: f1(p.x), y: f1(p.y + 26) });
        setA(ke.bgN, { x: f1(p.x - 4), y: f1(p.y - 2), width: f1(p.w + 8), height: p.h + 3 });
        // a thin leader when the label had to move away from its point
        const ld = leaderOf({ x: px, y: py }, p);
        show(ke.lead, !!ld);
        if (ld) setA(ke.lead, { x1: f1(px), y1: f1(py), x2: f1(ld.b.x), y2: f1(ld.b.y) });
        const perf = fmtPerf(roof * k.achieved);
        const offTxt = q.off ? ' (beyond the axis)' : '';
        if (k.draggable) {
          setA(ke.g, {
            'aria-label': k.label + ': arithmetic intensity',
            'aria-valuemin': String(sigv(L.log ? L.xd[0] : 0, 6)), 'aria-valuemax': String(sigv(L.xd[1], 6)),
            'aria-valuenow': String(sigv(k.ai, 6)),
            'aria-valuetext': `${A} ${u} per byte${offTxt}, ${bTxt}, at most ${perf}`,
          });
        } else {
          ke.g.setAttribute('aria-label', `${k.label}: ${A} ${u} per byte${offTxt}, ${bTxt}, at most ${perf}`);
        }
      });

      E.cmpRoofs.forEach((c) => {
        const pl = c.place;
        show(c.lab, !!pl);
        if (!pl) return;
        if (pl.rot) {
          const m = pl.rot;
          setA(c.lab, { x: f1(m.cx), y: f1(m.cy), 'text-anchor': 'middle', transform: `rotate(${f1((m.ang * 180) / Math.PI)} ${f1(m.cx)} ${f1(m.cy)})` });
        } else {
          c.lab.removeAttribute('transform');
          setA(c.lab, { x: f1(pl.box.x + pl.box.w), y: f1(pl.box.y + 10), 'text-anchor': 'end' });
        }
      });

      show(E.regMem, !!regM); if (regM) setA(E.regMem, { x: f1(regM.x), y: f1(regM.y) });
      show(E.regCmp, !!regC); if (regC) setA(E.regCmp, { x: f1(regC.x), y: f1(regC.y) });
      E.regMem.classList.toggle('on', S.shade === 'memory' || S.shade === 'both');
      E.regCmp.classList.toggle('on', S.shade === 'compute' || S.shade === 'both');
    }

    function kernelPoints() {
      if (!L) return [];
      const f = S.cur.flops, b = S.cur.bw;
      return S.kernels.map((k) => {
        const roof = Math.min(f, b * k.ai);
        return { x: clamp(L.xs(k.ai), L.x0, L.x1), y: clamp(L.ys(roof * k.achieved), L.y0, L.y1) };
      });
    }

    /* ── state, readouts, why ── */
    function state() {
      const s = S.sys;
      const k = S.kernels[S.sel] || null;
      if (!k) return { system: s, ridge: s.ridge, kernel: null, ai: null, attainable: null, achieved: null, bound: null, boundLabel: null, atRidge: false };
      const att = Math.min(s.flops, s.bw * k.ai);
      const atRidge = Math.abs(lg(k.ai / s.ridge)) < 1e-9;
      const bound = k.ai < s.ridge && !atRidge ? 'memory' : 'compute';
      const boundLabel = k.bound || (atRidge ? 'at the ridge' : bound + '-bound');
      return { system: s, ridge: s.ridge, kernel: k, ai: k.ai, attainable: att, achieved: att * k.achieved, bound, boundLabel, atRidge };
    }

    function defaultWhy(stt) {
      const s = stt.system;
      const R = `<b>${fmtRidge(s.ridge)} ${fpw(fmtRidge(s.ridge))}/byte</b>`;
      if (!stt.kernel) {
        return `The ridge point of ${GG.esc(s.phrase)} sits at ${R}: its compute roof, <b>${fmtPerf(s.flops, 4)}</b>, divided by its memory bandwidth, <b>${fmtBW(s.bw)}</b>. Kernels to the left of it are memory-bound; kernels to the right are compute-bound.`;
      }
      const k = stt.kernel, A = `<b>${fmtAI(stt.ai)} ${fpw(stt.ai)}/byte</b>`, P = `<b>${fmtPerf(stt.attainable)}</b>`;
      let h;
      if (stt.atRidge) {
        h = `At the ridge point, ${R}, both roofs meet: ${GG.esc(s.phrase)} can just reach its <b>${fmtPerf(s.flops, 4)}</b> peak, with memory bandwidth fully used. This is the least intensity that escapes the memory bottleneck.`;
      } else if (stt.bound === 'memory') {
        const need = s.ridge / stt.ai;
        h = `At ${A}, ${GG.esc(s.phrase)} can deliver at most ${P}: the <span class="rf-w-mem">memory roof</span> caps it (${fmtBW(s.bw)} × ${fmtAI(stt.ai)} ${fpw(stt.ai)}/byte). You'd need ${R} to reach the compute roof${need >= 1.05 ? `, ${num(sigv(need, 2))}× more work per byte` : ''}.`;
      } else {
        h = `At ${A}, ${GG.esc(s.phrase)} can deliver at most ${P}: the <span class="rf-w-cmp">compute roof</span> caps it. Memory bandwidth alone would allow ${fmtPerf(s.bw * stt.ai)} here, so more intensity buys no more speed.`;
      }
      if (k.achieved < 0.999) h += ` ${GG.esc(k.label)} actually reaches ${Math.round(k.achieved * 100)}% of that roof, <b>${fmtPerf(stt.achieved)}</b>; the gap is overhead.`;
      if (k.bound) h += ` Its real limit lies elsewhere, though: ${GG.esc(k.label)} is <b>${GG.esc(k.bound)}</b>.`;
      return h;
    }

    function report() {
      const stt = state();
      const s = stt.system;
      if (o.showReadouts) {
        st.ridge.set(fmtRidge(s.ridge) + ' ' + fpw(fmtRidge(s.ridge)) + '/B');
        const hasK = !!stt.kernel;
        show2(st.ai.el, hasK); show2(st.perf.el, hasK); show2(st.bound.el, hasK);
        show2(st.peak.el, !hasK); show2(st.bw.el, !hasK);
        if (hasK) {
          st.ai.set(fmtAI(stt.ai) + ' ' + fpw(stt.ai) + '/B');
          const ach = stt.kernel.achieved < 0.999;
          st.perf.el.querySelector('i').textContent = ach ? 'Achieved' : 'Attainable';
          st.perf.el.title = ach ? `${Math.round(stt.kernel.achieved * 100)}% of the ${fmtPerf(stt.attainable)} roof` : 'the roof above this intensity';
          const ktone = stt.kernel.bound && stt.kernel.boundTone ? stt.kernel.boundTone : null;
          st.perf.set(fmtPerf(ach ? stt.achieved : stt.attainable), ktone || (stt.bound === 'memory' ? 'memory' : 'core'));
          if (stt.kernel.bound) st.bound.set(stt.kernel.bound, stt.kernel.boundTone);
          else if (stt.atRidge) st.bound.set('at the ridge', 'accent');
          else st.bound.set(stt.bound === 'memory' ? 'memory-bound' : 'compute-bound', stt.bound === 'memory' ? 'memory' : 'core');
        } else {
          st.peak.set(fmtPerf(s.flops, 4));
          st.bw.set(fmtBW(s.bw));
        }
      }
      let h = null;
      if (typeof o.why === 'function') { try { h = o.why(stt); } catch (e) { console.error('[roofline] why()', e); } }
      if (h == null) h = defaultWhy(stt);
      setWhy(h);
      svg.setAttribute('aria-label', `Roofline chart (${S.scale === 'log' ? 'log–log' : 'linear'} axes) for ${s.name}: compute roof ${fmtPerf(s.flops, 4)}, memory roof ${fmtBW(s.bw)}, ridge point ${fmtRidge(s.ridge)} ${fpw(fmtRidge(s.ridge))} per byte.${stt.kernel ? ` ${stt.kernel.label} at ${fmtAI(stt.ai)} ${fpw(stt.ai)} per byte is ${stt.boundLabel}.` : ''}${o.ariaLabel ? ' ' + o.ariaLabel : ''}`);
      return stt;
    }
    const show2 = (el, on) => { el.hidden = !on; };

    function refresh(fire) {
      update();
      const stt = report();
      if (fire) emit('change', stt);
    }

    /* ── system tween ── */
    let tweenId = 0;
    function glideTo(sys) {
      cancelAnimationFrame(tweenId);
      if (GG.reducedMotion || !L || !L.log) { S.cur = { flops: sys.flops, bw: sys.bw }; return false; }
      const from = { flops: S.cur.flops, bw: S.cur.bw };
      const t0 = performance.now(), dur = 460;
      const stepF = (t) => {
        const k = ease(clamp((t - t0) / dur, 0, 1));
        S.cur.flops = 10 ** (lg(from.flops) + (lg(sys.flops) - lg(from.flops)) * k);
        S.cur.bw = 10 ** (lg(from.bw) + (lg(sys.bw) - lg(from.bw)) * k);
        update();
        if (k < 1) tweenId = requestAnimationFrame(stepF);
        else { S.cur = { flops: sys.flops, bw: sys.bw }; update(); }
      };
      tweenId = requestAnimationFrame(stepF);
      return true;
    }

    /* ── interaction ── */
    const clampAI = (a) => {
      if (!L) return a;
      const lo = L.log ? L.xd[0] : Math.max(1e-3, L.xd[1] / 1000);
      return clamp(a, lo, L.log ? L.xd[1] : Math.max(L.xd[1], a));
    };
    function setAI(i, a, snapPx) {
      const k = S.kernels[i];
      if (!k) return;
      a = clampAI(a);
      if (snapPx && L && Math.abs(L.xs(a) - L.xs(S.sys.ridge)) < snapPx) a = S.sys.ridge;
      k.ai = Number(a.toPrecision(12));
      S.sel = i;
      refresh(true);
    }
    function stepAI(a, dir, frac) {
      const r = S.sys.ridge, la = lg(a);
      const n = dir > 0 ? Math.floor(la / frac + 1e-7) + 1 : Math.ceil(la / frac - 1e-7) - 1;
      let next = Number((10 ** (n * frac)).toPrecision(10));
      const eq = (x, y) => Math.abs(lg(x / y)) < 1e-9;
      if (!eq(a, r) && ((a < r && next > r) || (a > r && next < r))) next = r;
      return next;
    }
    function onKey(e, i) {
      const k = S.kernels[i];
      if (!k || !L) return;
      let a = k.ai;
      const frac = e.shiftKey ? 0.25 : 0.05;
      switch (e.key) {
        case 'ArrowRight': case 'ArrowUp': a = stepAI(a, 1, frac); break;
        case 'ArrowLeft': case 'ArrowDown': a = stepAI(a, -1, frac); break;
        case 'PageUp': a = stepAI(a, 1, 1); break;
        case 'PageDown': a = stepAI(a, -1, 1); break;
        case 'Home': a = L.log ? L.xd[0] : clampAI(0); break;
        case 'End': a = L.xd[1]; break;
        default: return;
      }
      e.preventDefault();
      e.stopPropagation();
      setAI(i, a, 0);
    }

    function svgPoint(e) {
      const rect = svg.getBoundingClientRect();
      const sx = L.W / (rect.width || L.W), sy = L.H / (rect.height || L.H);
      return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
    }
    const inPlot = (p) => L && p.x >= L.x0 - 8 && p.x <= L.x1 + 8 && p.y >= L.y0 - 16 && p.y <= L.y1 + 6;
    function nearestKernel(p, requireHit) {
      const pts = kernelPoints();
      let best = -1, bd = Infinity;
      S.kernels.forEach((k, i) => {
        if (!k.draggable) return;
        const d = requireHit ? Math.hypot(pts[i].x - p.x, pts[i].y - p.y) : Math.abs(pts[i].x - p.x) + (i === S.sel ? -0.5 : 0);
        if (d < bd) { bd = d; best = i; }
      });
      if (requireHit && bd > 20) return -1;
      return best;
    }

    let drag = null; // {i, id, pending, sx, sy}
    function aiAt(px) { return clampAI(L.xs.invert(clamp(px, L.x0, L.x1))); }
    function startDrag(i, e) {
      drag.pending = false;
      try { svg.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
      const ke = E.ks[i];
      if (ke) { ke.g.classList.add('drag'); try { ke.g.focus({ preventScroll: true }); } catch (_) { /* ignore */ } }
      hideHover();
    }
    function endDrag() {
      if (drag && E && E.ks[drag.i]) E.ks[drag.i].g.classList.remove('drag');
      drag = null;
    }
    svg.addEventListener('pointerdown', (e) => {
      if (!L || e.button > 0) return;
      const p = svgPoint(e);
      if (!inPlot(p)) return;
      const onK = nearestKernel(p, true);
      const i = onK >= 0 ? onK : nearestKernel(p, false);
      if (i < 0) return;
      drag = { i, id: e.pointerId, pending: true, sx: e.clientX, sy: e.clientY, onK: onK >= 0 };
      if (e.pointerType !== 'touch') {
        e.preventDefault();
        startDrag(i, e);
        if (!drag.onK) setAI(i, aiAt(p.x), 6);
      }
    });
    svg.addEventListener('pointermove', (e) => {
      if (!L) return;
      const p = svgPoint(e);
      if (drag && drag.id === e.pointerId) {
        if (drag.pending) {
          const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
          if (Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) startDrag(drag.i, e);
          else return;
        }
        setAI(drag.i, aiAt(p.x), 6);
        return;
      }
      if (e.pointerType === 'mouse' && o.hover) hoverAt(p);
    });
    svg.addEventListener('pointerup', (e) => {
      if (!drag || drag.id !== e.pointerId) return;
      if (drag.pending) {
        const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
        if (Math.hypot(dx, dy) < 8) { const p = svgPoint(e); setAI(drag.i, aiAt(p.x), 6); }
      }
      endDrag();
    });
    svg.addEventListener('pointercancel', endDrag);
    svg.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') hideHover(); });
    svg.addEventListener('lostpointercapture', () => { if (drag && !drag.pending) endDrag(); });

    function hideHover() { if (E && E.hov) show(E.hov, false); }
    function hoverAt(p) {
      if (!E || !inPlot(p) || p.x < L.x0 || p.x > L.x1) { hideHover(); return; }
      const kp = kernelPoints();
      if (kp.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 22)) { hideHover(); return; }
      const a = L.xs.invert(p.x);
      const roof = Math.min(S.cur.flops, S.cur.bw * a);
      const y = clamp(L.ys(roof), L.y0, L.y1);
      setA(E.hLine, { x1: f1(p.x), x2: f1(p.x), y1: L.y1, y2: f1(y) });
      setA(E.hDot, { cx: f1(p.x), cy: f1(y) });
      const txt = `${fmtAI(a)} ${fpw(a)}/B → ${fmtPerf(roof)}`;
      setT(E.hText, txt);
      const w = tw(txt, 11) + 12;
      let tx = p.x + 10;
      if (tx + w > L.x1) tx = p.x - 10 - w;
      const ty = clamp(y - 30, L.y0 + 2, L.y1 - 24);
      setA(E.hBg, { x: f1(tx), y: f1(ty), width: f1(w) });
      setA(E.hText, { x: f1(tx + 6), y: f1(ty + 14) });
      show(E.hov, true);
    }

    /* ── resize ── */
    function measure() { return Math.round(wrap.getBoundingClientRect().width); }
    const ro = GG.resize(wrap, (r) => {
      const w = Math.round(r.width);
      if (w > 0 && w !== W) { W = w; build(); update(); }
    });
    W = measure();
    if (W > 0) build();
    refresh(false);

    /* ── api ── */
    const api = {
      el: wrap,
      svg,
      state,
      setSystem(sys) {
        const s = lookup(sys);
        // was this system part of the axis fit? (if not, the log axes are refitted instead of gliding)
        const known = [...S.list, ...S.compare, S.sys].some((x) => x.flops === s.flops && x.bw === s.bw);
        if (!S.list.some((x) => x.id === s.id) && sysSeg) { S.list.push(s); buildSelector(); }
        S.sys = s;
        if (sysSeg) sysSeg.set(s.id, false);
        if (S.scale === 'linear' || (!known && !(o.xDomain && o.yDomain))) { cancelAnimationFrame(tweenId); S.cur = { flops: s.flops, bw: s.bw }; build(); }
        else glideTo(s);
        refresh(true);
        return api;
      },
      setSystems(list) {
        S.list = (list || ORDER).map(resolve);
        if (!S.list.some((s) => s.id === S.sys.id)) S.list.push(S.sys);
        buildSelector(); build(); refresh(true);
        return api;
      },
      setCompare(list) { S.compare = (list || []).map(resolve); build(); refresh(false); return api; },
      setKernels(list) {
        const prevId = S.kernels[S.sel] && S.kernels[S.sel].id;
        S.kernels = normKernels(list);
        const j = S.kernels.findIndex((k) => k.id === prevId);
        S.sel = j >= 0 ? j : 0;
        build(); refresh(true);
        return api;
      },
      setKernel(id, ai) {
        const i = S.kernels.findIndex((k) => k.id === String(id));
        if (i >= 0 && +ai > 0) {
          // linear axes refit when a kernel is moved past their end
          if (L && !L.log && +ai > L.xd[1]) { S.kernels[i].ai = +ai; build(); }
          setAI(i, +ai, 0);
        }
        return api;
      },
      select(id) {
        const i = S.kernels.findIndex((k) => k.id === String(id));
        if (i >= 0) { S.sel = i; refresh(true); }
        return api;
      },
      setShade(v) { S.shade = v === 'memory' || v === 'compute' || v === 'both' ? v : null; update(); return api; },
      setScale(v) {
        S.scale = v === 'linear' ? 'linear' : 'log';
        cancelAnimationFrame(tweenId);
        S.cur = { flops: S.sys.flops, bw: S.sys.bw };
        if (scaleSeg) scaleSeg.set(S.scale, false);
        build(); refresh(true);
        return api;
      },
      on(ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); return api; },
      off(ev, fn) { const l = listeners[ev]; if (l) { const j = l.indexOf(fn); if (j >= 0) l.splice(j, 1); } return api; },
      destroy() {
        cancelAnimationFrame(tweenId);
        if (ro && ro.disconnect) ro.disconnect();
        wrap.remove();
        added.forEach((n) => n.remove());
        if (fig && o.showWhy) fig.setWhy('');
        listeners.change = [];
      },
    };
    return api;
  }

  roofline.PRESETS = PRESETS;
  roofline.ORDER = ORDER;
  roofline.attainable = attainable;
  roofline.ridge = ridgeOf;
  roofline.system = normSystem;
  roofline.fmt = fmt;
  GG.components.roofline = roofline;
})();
