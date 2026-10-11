/* ═══════════════════════════════════════════════════════════════════════════════════════════
   components/sm.js — the H100 (Hopper, SM90) Streaming Multiprocessor floorplan, plus a V100 (Volta,
   SM70) variant.                                                                       prefix: sm-
   ═══════════════════════════════════════════════════════════════════════════════════════════

   Redrawn from the SM figure in NVIDIA's H100 whitepaper, as modified by the GPU Glossary:
   L1 Instruction Cache on top; four identical sub-partitions (2 × 2), each with an L0 Instruction
   Cache, a Warp Scheduler (32 thread/clk), a Dispatch Unit (32 thread/clk), a Register File
   (16,384 × 32-bit), 16 INT32, 32 FP32 (two columns of 16) and 16 FP64 units, one 4th-generation
   Tensor Core, 8 LD/ST units and an SFU block; below them the Tensor Memory Accelerator, the
   256 KiB L1 Data Cache / Shared Memory and 4 Tex units.
   Colours: cores green (--core), LSU/SFU/TMA pink (--special), scheduler/dispatch amber (--control),
   register file and caches blue (--memory), Tex and frames neutral.
   opts.arch 'volta' draws the V100 SM after NVIDIA's V100 whitepaper figure instead: four processing
   blocks (Volta's name for sub-partitions), each with 8 FP64, 16 INT32, 16 FP32 units, two 1st-generation
   Tensor Cores, 8 LD/ST and an SFU block, under a 128 KiB L1 data cache / shared memory; no TMA.

   ── USAGE ─────────────────────────────────────────────────────────────────────────────────────
     const f  = ctx.figure(slot, { title: 'Inside one SM', wide: true, caption: '…' });
     const sm = GG.components.sm(f.stage, { highlight: ['tensor'], showCounts: true, legend: true,
                                            onPart: (key, part) => f.setWhy(part.desc) });
     sm.highlight('cuda-cores');                        // animated transition
     const stop = sm.flow('ldst', 'l1d', { color: 'memory' });   // particles; stop() removes them

   ── GG.components.sm(parent, opts) → api ───────────────────────────────────────────────────────
   opts (all optional):
     highlight    string | string[]   Part keys to emphasise from the start (see KEYS). Default none.
     focus        'sm' | 'sub'        'sm' (default): the whole SM, 2 × 2 sub-partitions.
                                      'sub': one sub-partition, zoomed, with larger labels; the
                                      SM-wide blocks (L1 I-cache, TMA, L1 data cache, Tex) are drawn
                                      as strips above/below it, and a 2 × 2 locator shows which of
                                      the four quadrants it is.
     sub          0..3                Which sub-partition 'sub' focus shows (default 0). Only affects
                                      the locator and '@n' key matching.
     interactive  boolean             Default true. Hover / tap / keyboard focus on a part shows an
                                      info panel (name, counts, one-line description, glossary link).
                                      Click, tap, Enter or Space "selects" the part: the panel stays
                                      pinned and onPart fires. Tap again / click outside / Esc closes.
                                      Keyboard: the drawing is one Tab stop; ← ↑ → ↓ move between
                                      parts, Home / End jump, Enter / Space select, Esc closes.
     onPart       fn(key, part)       Called when the reader selects a part (part = PARTS entry).
     showCounts   boolean             Draw unit counts beside the groups (×16 over INT32, ×32 over the
                                      FP32 pair, ×16 FP64, ×1 Tensor Core, ×8 LD/ST, ×1 SFU).
                                      Default false.
     legend       boolean             Render the per-SM totals strip under the drawing (64 INT32,
                                      128 FP32, 64 FP64, 4 Tensor Cores, 32 LD/ST, 65,536 registers
                                      (256 KiB), 256 KiB L1 / shared, 4 warp schedulers). Hovering a
                                      legend item lights up those parts; clicking selects them.
                                      Default false.
     compact      boolean             Fewer labels, for small inline use: no title strip, no per-unit
                                      text, labels only in the first sub-partition. Default false.
     ext          boolean             Draw what lies off the SM under it, as two bands with a gap between
                                      them: "L2 cache, shared by all SMs", then "GPU RAM (HBM3, off-chip)".
                                      Flow endpoints 'l2' and 'ram'; 'ext' = GPU RAM through the L2 (its
                                      wire crosses the L2 band). Default false (flows to them still work;
                                      they just exit at the frame edge).
     dots         boolean             With the initial highlight: one dot per unit on lit INT32 / FP32 /
                                      FP64 columns (see highlight). Default false.
     title        string              Title line inside the drawing, after a bold "SM". Default
                                      'Streaming Multiprocessor · H100 (Hopper, SM90)' (shortened to
                                      '… · H100' on phones; 'Sub-partition n of 4 · …' in 'sub' focus).
                                      '' hides the whole title strip.
     ariaLabel    string              Accessible name. Default: a full text description of the SM.
     maxHeight    CSS length          Cap on the drawing's height; it then scales down and centres.
                                      Default '86vh' so a whole SM fits on screen. 'none' disables.
     arch         'hopper' | 'volta'  Which SM to draw (aliases 'h100', 'sm90' / 'v100', 'gv100', 'sm70').
                                      Default 'hopper'. Same keys and API for both; on Volta 'tma' does not
                                      exist (highlighting it, or a group containing it, skips it; a flow to
                                      it draws nothing). Per-arch data: api.PARTS / api.byKey / api.TOTALS,
                                      or GG.components.sm.ARCHS.volta.{PARTS, byKey, TOTALS}.
     infoDock     true|false|'auto'   The info panel below 560 px, where it docks under the drawing.
                                      true: always shown, with a "Tap or hover any block" hint when idle.
                                      false: never shown (highlight and events only).
                                      'auto' (default): as true outside a figure. Inside a ctx.figure, which
                                      has its own why line: no idle hint; the panel opens only for a part
                                      the reader taps or hovers, and not at all for a selection that onPart
                                      or on('part') already reports (the chapter writes it to the why line).

   KEYS (part keys; every method that takes keys accepts a string or an array):
     'l1i' L1 Instruction Cache    'l0i' L0 Instruction Cache   'scheduler' Warp Scheduler
     'dispatch' Dispatch Unit      'regfile' Register File      'int32' INT32 units
     'fp32' FP32 units             'fp64' FP64 units            'tensor' Tensor Core
     'ldst' Load/Store units       'sfu' Special Function Unit  'tma' Tensor Memory Accelerator
     'l1d' L1 Data Cache / Shared Memory                        'tex' Texture units
     'sp'  a whole sub-partition (highlighting it lights up everything inside it)
     'l2'  L2 cache, 'ram' GPU RAM: the off-SM bands (ext:true); highlight, hover, flow endpoints
     'ext' both of them: highlight('ext') lights both bands; as a flow endpoint it means GPU RAM, through the L2
   Group keys:  'cuda-cores' = int32 + fp32 + fp64        'cores'   = cuda-cores + tensor
                'memory'     = regfile + l1d + l0i + l1i   'control' = scheduler + dispatch
                'special'    = ldst + sfu + tma            'shared'  = l1i + tma + l1d + tex
                'all'        = every part
   Aliases (glossary ids work too): 'cuda-core' → cuda-cores, 'tensor-core' → tensor,
     'load-store-unit' / 'lsu' → ldst, 'special-function-unit' → sfu, 'warp-scheduler(s)' → scheduler,
     'register-file' / 'registers' / 'rf' → regfile, 'l1-data-cache' / 'shared-memory' / 'smem' / 'l1' → l1d,
     'tensor-memory-accelerator' → tma, 'gpu-ram' → ram, 'l2-cache' → l2, 'sub-partition' → sp.
     An unknown key is skipped with a console.warn (so a typo shows up in the checker).
   Sub-partition suffix: 'fp32@0' = only sub-partition 0's FP32 units, 'sp@2' = all of sub-partition 2.
     Sub-partitions are numbered 0 1 (top row) / 2 3 (bottom row). SM-wide parts ignore the suffix.
     (The drawing's own title counts from 1 for readers: sub:1 is titled "Sub-partition 2 of 4".)

   BEHAVIOUR NOTES (so chapters can rely on them):
     · Every label is drawn at ≥ 10 px on screen down to ~300 px wide drawings (a 360 px phone). Narrower,
       labels that would not fit their box switch to a shorter form ("Register File") or, as a last resort,
       shrink (on a 320 px phone only the coarse "Tensor Core" label does, to ~9.6 px).
     · Level of detail follows the scale the drawing really gets. When every unit cell can hold a 10 px
       label (scale ≥ 0.583, INT32 cells ≥ 31 px wide; whole SM ≳ 585 px wide after the maxHeight cap)
       every unit is labelled as in the whitepaper figure ("INT32" in each of the 16 cells, "LD/ST" in
       each box, full bar labels such as "Warp Scheduler (32 thread/clk)"); otherwise (phones, short caps)
       it switches to a taller layout with column labels, short bar labels and the "LD/ST" label (with its
       count) under its row of boxes. 'sub' focus keeps full detail down to ~330 px, so it is the best
       choice for unit-level figures on phones. Text is sized per screen pixel, so it never balloons.
     · On a wide stage whose whole-SM drawing is height-capped, the sub-partitions widen (up to 1.25×) so
       the floorplan uses more of the width and its unit labels have room; with legend:true beside the
       drawing, only into the space the legend leaves. 'sub' focus is never stretched.
     · Hovering or focusing one instance lights up every instance of that key (all four FP32 pairs):
       the drawing itself shows "×4 per SM". The info panel floats next to the hovered instance; below
       560 px (non-compact) it docks under the drawing (see infoDock).
     · With legend:true and room to spare (a wide stage whose drawing is height-capped), the legend sits
       beside the drawing instead of below it.
     · Highlighted parts stay highlighted while hovered; pulse() temporarily lifts a dimmed part to full
       strength. Flows never change the highlight: call highlight() yourself for the endpoints. The one
       exception is the off-SM strip (ext:true): while a flow starts or ends at a band it is outlined in
       memory blue and never dimmed (a flow to 'ram' / 'ext' lights both bands, since it crosses the L2).
     · Flow wires run under the parts (labels paint over them); particles and arrowheads run on top. Long
       routes also carry a chevron halfway along their longest leg, so the direction reads in a still
       frame (reduced motion) too.
     · Flows between a sub-partition part and an SM-wide part leave the sub-partition through the outer
       margin (left column via the left edge, right column via the right edge), so wires never cross a
       neighbouring sub-partition; up to three concurrent flows get separate parallel wires. LD/ST and SFU
       wires to SM-wide parts leave through the bottom of the sub-partition (LD/ST from its outermost box)
       and run along the gap below it, never along the LD/ST + SFU row. Between the bars (L0 I-cache,
       scheduler, dispatch, register file) and LD/ST or the SFU, wires run up the sub-partition's own left
       (LD/ST) or right (SFU) margin, never through the unit columns, and meet both ends at their outer edge.
     · The fine / coarse choice has a little hysteresis: a drawing in the fine layout keeps it until its
       scale is 3% below the limits, so a width that jitters around the threshold does not flip it.

   api:
     el, svg                     root <div class="sm-root"> and its <svg>
     arch, PARTS, byKey, TOTALS  this instance's architecture id ('hopper' | 'volta') and its part data
     highlight(keys, {instant, dots})  Emphasise keys (full colour + glow), dim everything else, with an
                                 animated transition. Replaces the current set. [] / null clears.
                                 dots: true draws one dot per unit on the lit INT32 / FP32 / FP64 columns
                                 (16 / 32 / 16 per sub-partition on the H100), replacing the per-cell
                                 labels, so the count reads apart from the column widths (which follow
                                 the whitepaper figure). Each call sets it again (default off).
     clear()                     Remove the highlight (flows keep running).
     pulse(keys, {color, ms})    Brief flash on those parts (e.g. an instruction issuing). Default
                                 700 ms. color: a role name ('core', 'memory', …) or any CSS colour.
     flow(from, to, opts) → stop  Animate particles from one part to another along wire-like routes.
                                 Between sub-partition parts it runs in all four sub-partitions at once
                                 (or only opts.sub); between a sub-partition part and an SM-wide part
                                 (tma, l1d, l1i, tex, l2, ram, ext) it runs from/to each sub-partition.
                                 'l2' ↔ 'ram' is one hop across the gap between the off-SM bands.
                                 Keys may carry '@n'. opts: {
                                   color  role name or CSS colour (default: the source part's colour),
                                   dots   particles per route (default 5),
                                   speed  on-screen px per second (default 120),
                                   sub    number | number[]  which sub-partitions,
                                   once   true = a single burst that travels once, then removes itself,
                                   onDone called after a `once` burst finishes,
                                   animate true = animate even under prefers-reduced-motion }
                                 Under GG.reducedMotion a flow is drawn as a static route (line, arrow
                                 heads, evenly spaced dots) and only moves after stop.play() (call it
                                 from a Play button) or with animate:true.
                                 Returns stop(): removes the flow. stop.play() / stop.pause() control
                                 its motion; stop.running is its state.
     stopFlows()                 Remove every flow.
     info(key | null)            Open (pinned) / close the info panel programmatically.
     partEl(key, sub)            The <g> of that part (the instance in sub-partition `sub`, default the
                                 first one). null for group keys or unknown keys.
     partEls(key)                Every <g> instance of an atomic key (e.g. 4 for 'fp32').
     keys()                      The atomic keys currently highlighted (with any '@n').
     on(event, fn) → off()       'part' (key, part)  reader selected a part
                                 'hover' (key | null) pointer / focus moved onto or off a part
                                 'highlight' (keys[]) after highlight()/clear()
     destroy()                   Stop everything and remove the component.

   Static data (for legends, quizzes, prose):
     GG.components.sm.PARTS   [{ key, name, label, short, role ('core'|'special'|'control'|'memory'|
                               'neutral'), scope ('sub'|'sm'|'ext'), perSub (number|null), perSM
                               (number), count (display string, e.g. '×16 per sub-partition · ×64 per
                               SM'), desc (one plain-text sentence), term (glossary id or null),
                               termName }], in reading order.
     GG.components.sm.byKey   { key: part }
     GG.components.sm.GROUPS  { group: [atomic keys] }
     GG.components.sm.TOTALS  per-SM totals used by the legend: [{ value, label, sub, keys, role }]
     GG.components.sm.expand(keys) → atomic keys (groups and aliases resolved, '@n' kept)
     GG.components.sm.ARCHS   { hopper, volta }: per-arch { id, gpu, long, nSM, PARTS, byKey, TOTALS, … }.
                              PARTS / byKey / TOTALS above are the Hopper ones (unchanged).
   ═══════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const GG = window.GG;
  if (!GG) return;

  /* ───────────────────────── metadata ───────────────────────── */
  const ROLE_VAR = { core: 'var(--core)', special: 'var(--special)', control: 'var(--control)', memory: 'var(--memory)', neutral: 'var(--ink-2)', host: 'var(--host)', danger: 'var(--danger)', accent: 'var(--accent)' };
  const ROLE_NAME = { core: 'GPU core', special: 'other compute unit', control: 'scheduling', memory: 'memory', neutral: '' };

  const PARTS = [
    { key: 'l1i', name: 'L1 Instruction Cache', label: 'L1 Instruction Cache', short: 'L1 Instruction Cache', role: 'memory', scope: 'sm', perSub: null, perSM: 1,
      count: '×1 per SM, shared by the four sub-partitions', term: null, termName: null,
      desc: "Holds the machine instructions (SASS) of the code running on this SM and refills the four sub-partitions' L0 instruction caches." },
    { key: 'l0i', name: 'L0 Instruction Cache', label: 'L0 Instruction Cache', short: 'L0 Instruction Cache', role: 'memory', scope: 'sub', perSub: 1, perSM: 4,
      count: '×1 per sub-partition · ×4 per SM', term: null, termName: null,
      desc: 'A small instruction cache private to one sub-partition, right next to the warp scheduler it feeds.' },
    { key: 'scheduler', name: 'Warp Scheduler', label: 'Warp Scheduler (32 thread/clk)', short: 'Warp Scheduler', role: 'control', scope: 'sub', perSub: 1, perSM: 4,
      count: '×1 per sub-partition · ×4 per SM', term: 'warp-scheduler', termName: 'Warp Scheduler',
      desc: 'Decides which warp (a group of 32 threads) to execute on each clock cycle, switching between warps in a single cycle.' },
    { key: 'dispatch', name: 'Dispatch Unit', label: 'Dispatch Unit (32 thread/clk)', short: 'Dispatch Unit', role: 'control', scope: 'sub', perSub: 1, perSM: 4,
      count: '×1 per sub-partition · ×4 per SM', term: 'warp-scheduler', termName: 'Warp Scheduler',
      desc: "Hands the instruction the warp scheduler picked to the execution units, for 32 threads per clock." },
    { key: 'regfile', name: 'Register File', label: 'Register File (16,384 × 32-bit)', short: 'Register File · 64 KiB', role: 'memory', scope: 'sub', perSub: 16384, perSM: 65536,
      count: '16,384 × 32-bit (64 KiB) per sub-partition · 65,536 registers (256 KiB) per SM', term: 'register-file', termName: 'Register File',
      desc: "The primary store of bits between their manipulation by the cores. The compiler gives every thread its own private registers here." },
    { key: 'int32', name: 'INT32 units', label: 'INT32', short: 'INT32', role: 'core', scope: 'sub', perSub: 16, perSM: 64,
      count: '×16 per sub-partition · ×64 per SM', term: 'cuda-core', termName: 'CUDA Core',
      desc: '32-bit integer arithmetic units, one of the kinds of unit that make up CUDA Cores. There are half as many as FP32 units.' },
    { key: 'fp32', name: 'FP32 units', label: 'FP32', short: 'FP32', role: 'core', scope: 'sub', perSub: 32, perSM: 128,
      count: '×32 per sub-partition · ×128 per SM', term: 'cuda-core', termName: 'CUDA Core',
      desc: 'Single-precision (32-bit) floating point units: the "128 FP32 CUDA Cores" per SM that NVIDIA\'s whitepaper counts.' },
    { key: 'fp64', name: 'FP64 units', label: 'FP64', short: 'FP64', role: 'core', scope: 'sub', perSub: 16, perSM: 64,
      count: '×16 per sub-partition · ×64 per SM', term: 'cuda-core', termName: 'CUDA Core',
      desc: 'Double-precision (64-bit) floating point units. Like the INT32 units, there are half as many as FP32 units.' },
    { key: 'tensor', name: 'Tensor Core (4th generation)', label: 'Tensor Core', short: 'Tensor Core', role: 'core', scope: 'sub', perSub: 1, perSM: 4,
      count: '×1 per sub-partition · ×4 per SM', term: 'tensor-core', termName: 'Tensor Core',
      desc: 'Operates on entire matrices with each instruction (D = AB + C). Much larger and far fewer than CUDA Cores: one per warp scheduler.' },
    { key: 'ldst', name: 'Load/Store Units (LD/ST)', label: 'LD/ST', short: 'LD/ST', role: 'special', scope: 'sub', perSub: 8, perSM: 32,
      count: '×8 per sub-partition · ×32 per SM', term: 'load-store-unit', termName: 'Load/Store Unit',
      desc: "Dispatch requests to load or store data: directly to the SM's L1 data cache and, indirectly, to GPU RAM." },
    { key: 'sfu', name: 'Special Function Unit (SFU)', label: 'SFU', short: 'SFU', role: 'special', scope: 'sub', perSub: 1, perSM: 4,
      count: '×1 SFU block per sub-partition · ×4 per SM', term: 'special-function-unit', termName: 'Special Function Unit',
      desc: 'Accelerates transcendental math like exp, sin and cos (SASS instructions starting with MUFU, such as MUFU.EX2).' },
    { key: 'sp', name: 'Sub-partition', label: '', short: '', role: 'neutral', scope: 'sub', perSub: null, perSM: 4,
      count: '×4 per SM, identical', term: 'streaming-multiprocessor', termName: 'Streaming Multiprocessor',
      desc: 'One of the four identical quadrants of the SM, with its own L0 instruction cache, warp scheduler, dispatch unit, register file and execution units.' },
    { key: 'tma', name: 'Tensor Memory Accelerator (TMA)', label: 'Tensor Memory Accelerator', short: 'Tensor Memory Accelerator', role: 'special', scope: 'sm', perSub: null, perSM: 1,
      count: '×1 per SM, shared by the four sub-partitions', term: 'tensor-memory-accelerator', termName: 'Tensor Memory Accelerator',
      desc: 'Copies multi-dimensional arrays from GPU RAM into shared memory, bypassing the registers, with the addresses computed in hardware.' },
    { key: 'l1d', name: 'L1 Data Cache / Shared Memory', label: '256 KiB L1 Data Cache / Shared Memory', short: 'L1 Data Cache / Shared Mem · 256 KiB', role: 'memory', scope: 'sm', perSub: null, perSM: 1,
      count: '256 KiB per SM, shared by the four sub-partitions', term: 'l1-data-cache', termName: 'L1 Data Cache',
      desc: "The SM's private on-chip SRAM, accessed through the LD/ST units. Part of it is the L1 data cache, which the hardware manages (loads from global memory are cached there automatically); the rest is shared memory, which the programmer manages. How it is split can be set per kernel." },
    { key: 'tex', name: 'Texture units (Tex)', label: 'Tex', short: 'Tex', role: 'neutral', scope: 'sm', perSub: null, perSM: 4,
      count: '×4 per SM', term: null, termName: null,
      desc: "Texture units, inherited from the GPU's graphics pipeline: they fetch and filter texture (image) data." },
    { key: 'ext', name: 'Off-SM memory: L2 cache and GPU RAM', label: 'L2 cache · GPU RAM', short: 'L2 cache · GPU RAM', role: 'memory', scope: 'ext', perSub: null, perSM: 0,
      count: 'outside the SM, shared by all 132 SMs of an H100 SXM', term: 'gpu-ram', termName: 'GPU RAM',
      desc: 'Everything beyond the SM: the L2 cache shared by all SMs and, behind it, the GPU RAM (HBM3 on an H100).' },
    { key: 'l2', name: 'L2 cache', label: 'L2 cache', short: 'L2 cache', role: 'memory', scope: 'ext', perSub: null, perSM: 0,
      count: 'outside the SM, shared by all 132 SMs of an H100 SXM', term: null, termName: null,
      desc: 'The on-chip cache between the SMs and GPU RAM. A load that misses in the L1 data cache goes here next; only on a miss here too does it go on to GPU RAM.' },
    { key: 'ram', name: 'GPU RAM', label: 'GPU RAM', short: 'GPU RAM', role: 'memory', scope: 'ext', perSub: null, perSM: 0,
      count: 'off-chip, 80 GiB of HBM3 on an H100 SXM, shared by all 132 SMs', term: 'gpu-ram', termName: 'GPU RAM',
      desc: 'The large off-chip memory of the GPU, behind the L2 cache. Global memory lives here.' },
  ];
  const BY = {};
  PARTS.forEach((p) => { BY[p.key] = p; });
  const ATOMS = PARTS.filter((p) => p.scope !== 'ext' && p.key !== 'sp').map((p) => p.key);
  const BANDS = ['l2', 'ram'];   // the off-SM strip (ext:true), top to bottom; 'ext' stands for both
  const SUB_KEYS = ['l0i', 'scheduler', 'dispatch', 'regfile', 'int32', 'fp32', 'fp64', 'tensor', 'ldst', 'sfu'];

  const GROUPS = {
    'cuda-cores': ['int32', 'fp32', 'fp64'],
    cores: ['int32', 'fp32', 'fp64', 'tensor'],
    memory: ['regfile', 'l1d', 'l0i', 'l1i'],
    control: ['scheduler', 'dispatch'],
    special: ['ldst', 'sfu', 'tma'],
    shared: ['l1i', 'tma', 'l1d', 'tex'],
    all: ATOMS.slice(),
  };
  const ALIAS = {
    'cuda-core': 'cuda-cores', 'tensor-core': 'tensor', 'tensor-cores': 'tensor', 'load-store-unit': 'ldst', lsu: 'ldst',
    'special-function-unit': 'sfu', 'warp-scheduler': 'scheduler', 'register-file': 'regfile', registers: 'regfile',
    'l1-data-cache': 'l1d', 'shared-memory': 'l1d', 'tensor-memory-accelerator': 'tma',
    l1: 'l1d', smem: 'l1d', rf: 'regfile', 'warp-schedulers': 'scheduler', 'gpu-ram': 'ram', 'l2-cache': 'l2', 'sub-partition': 'sp',
  };

  const TOTALS = [
    { value: '64', label: 'INT32 units', sub: '16 per sub-partition', keys: ['int32'], role: 'core' },
    { value: '128', label: 'FP32 units', sub: '32 per sub-partition', keys: ['fp32'], role: 'core' },
    { value: '64', label: 'FP64 units', sub: '16 per sub-partition', keys: ['fp64'], role: 'core' },
    { value: '4', label: 'Tensor Cores', sub: '1 per sub-partition', keys: ['tensor'], role: 'core' },
    { value: '32', label: 'LD/ST units', sub: '8 per sub-partition', keys: ['ldst'], role: 'special' },
    { value: '65,536', label: 'registers (256 KiB)', sub: '16,384 × 32-bit per sub-partition', keys: ['regfile'], role: 'memory' },
    { value: '256 KiB', label: 'L1 data cache / shared memory', sub: 'one per SM', keys: ['l1d'], role: 'memory' },
    { value: '4', label: 'warp schedulers', sub: '1 per sub-partition', keys: ['scheduler'], role: 'control' },
  ];

  /* Volta (GV100, SM70): the same four-quadrant plan with fewer, differently grouped units. Per processing block
     (NVIDIA's name for a sub-partition on Volta): 8 FP64, 16 INT32, 16 FP32, 2 first-generation Tensor Cores,
     8 LD/ST, one SFU block; per SM a 128 KiB L1 data cache / shared memory, no TMA. V100: 80 SMs. */
  const VOLTA_OVR = {
    l0i: { count: '×1 per processing block · ×4 per SM', desc: 'A small instruction cache private to one processing block (sub-partition), right next to the warp scheduler it feeds.' },
    scheduler: { count: '×1 per processing block · ×4 per SM' },
    dispatch: { count: '×1 per processing block · ×4 per SM' },
    regfile: { count: '16,384 × 32-bit (64 KiB) per processing block · 65,536 registers (256 KiB) per SM' },
    int32: { perSub: 16, perSM: 64, count: '×16 per processing block · ×64 per SM',
      desc: '32-bit integer arithmetic units. Volta was the first NVIDIA GPU with INT32 units separate from the FP32 units, so integer and floating point instructions can run at the same time.' },
    fp32: { perSub: 16, perSM: 64, count: '×16 per processing block · ×64 per SM',
      desc: 'Single-precision (32-bit) floating point units: the "64 FP32 cores" per SM of NVIDIA\'s V100 whitepaper, 5,120 on a V100.' },
    fp64: { perSub: 8, perSM: 32, count: '×8 per processing block · ×32 per SM',
      desc: 'Double-precision (64-bit) floating point units: half as many as FP32 units, the same ratio as on the H100.' },
    tensor: { name: 'Tensor Core (1st generation)', perSub: 2, perSM: 8, count: '×2 per processing block · ×8 per SM · 640 on a V100',
      desc: 'The first Tensor Cores. Each one computes D = A × B + C on 4 × 4 matrices every clock: 64 fused multiply-adds, with FP16 inputs and FP16 or FP32 accumulation.' },
    ldst: { count: '×8 per processing block · ×32 per SM' },
    sfu: { count: '×1 SFU block per processing block · ×4 per SM' },
    sp: { name: 'Processing block (sub-partition)', count: '×4 per SM, identical',
      desc: 'One of the four identical processing blocks of the SM, with its own L0 instruction cache, warp scheduler, dispatch unit, register file and execution units.' },
    l1i: { count: '×1 per SM, shared by the four processing blocks' },
    l1d: { label: '128 KiB L1 Data Cache / Shared Memory', short: 'L1 Data Cache / Shared Mem · 128 KiB', count: '128 KiB per SM, shared by the four processing blocks',
      desc: "Volta's combined L1 data cache and shared memory: 128 KiB per SM, of which up to 96 KiB can be used as shared memory." },
    ext: { count: 'outside the SM, shared by all 80 SMs of a V100',
      desc: 'Everything beyond the SM: the L2 cache shared by all SMs and, behind it, the GPU RAM (HBM2 on a V100).' },
    l2: { count: 'outside the SM, shared by all 80 SMs of a V100' },
    ram: { count: 'off-chip HBM2 on a V100, shared by all 80 SMs' },
  };
  const VOLTA_PARTS = PARTS.filter((p) => p.key !== 'tma').map((p) => Object.assign({}, p, VOLTA_OVR[p.key] || {}));
  const VOLTA_TOTALS = [
    { value: '64', label: 'INT32 units', sub: '16 per processing block', keys: ['int32'], role: 'core' },
    { value: '64', label: 'FP32 units', sub: '16 per processing block', keys: ['fp32'], role: 'core' },
    { value: '32', label: 'FP64 units', sub: '8 per processing block', keys: ['fp64'], role: 'core' },
    { value: '8', label: 'Tensor Cores', sub: '2 per processing block', keys: ['tensor'], role: 'core' },
    { value: '32', label: 'LD/ST units', sub: '8 per processing block', keys: ['ldst'], role: 'special' },
    { value: '65,536', label: 'registers (256 KiB)', sub: '16,384 × 32-bit per processing block', keys: ['regfile'], role: 'memory' },
    { value: '128 KiB', label: 'L1 data cache / shared memory', sub: 'one per SM', keys: ['l1d'], role: 'memory' },
    { value: '4', label: 'warp schedulers', sub: '1 per processing block', keys: ['scheduler'], role: 'control' },
  ];
  const byKeyOf = (list) => { const o = {}; list.forEach((p) => { o[p.key] = p; }); return o; };

  /* Per-architecture floorplan. cols: unit columns as [x, w] boxes inside a 448-wide sub-partition (x positions
     follow the whitepaper figures); rows: units per column; lanes: x of the gaps that wires use to drop from the
     bars to the LD/ST (g2) and SFU (g3) row. */
  const ARCHS = {
    hopper: {
      id: 'hopper', gpu: 'H100', long: 'H100 (Hopper, SM90)', nSM: 132, rows: 16, tma: true, mem: 'HBM3',
      cols: { int32: [[0, 50]], fp32: [[63, 50], [113, 50]], fp64: [[176, 136]], tensor: [[325, 123]] },
      lanes: { g2: 169.5, g3: 318.5 },
      // coarse layout: rotated column labels need less width, so the Tensor Core column (and the SFU under
      // it) takes some from FP64 and its "Tensor" label stays at 10 px on 360 px phones
      colsC: { int32: [[0, 46]], fp32: [[56, 46], [102, 46]], fp64: [[158, 136]], tensor: [[304, 144]] },
      lanesC: { g2: 153, g3: 299 }, ldstC: [296, 304, 144],
      counts: { int32: '×16', fp32: '×32', fp64: '×16', tensor: '×1', ldst: '×8', sfu: '×1' },
      gen: ['4th generation', '4th gen.', ''],
      PARTS, byKey: BY, TOTALS,
      label: 'Floorplan of an NVIDIA H100 Streaming Multiprocessor: an L1 instruction cache on top; four identical sub-partitions, each with an L0 instruction cache, a warp scheduler and a dispatch unit (32 threads per clock each), a register file of 16,384 32-bit registers, 16 INT32, 32 FP32 and 16 FP64 units, one 4th-generation Tensor Core, 8 load/store units and a special function unit; below them the Tensor Memory Accelerator, the 256 KiB L1 data cache / shared memory, and 4 texture units.',
      labelSub: 'One of the four identical sub-partitions of an NVIDIA H100 Streaming Multiprocessor: an L0 instruction cache, a warp scheduler and a dispatch unit (32 threads per clock each), a register file of 16,384 32-bit registers, 16 INT32, 32 FP32 and 16 FP64 units, one 4th-generation Tensor Core, 8 load/store units and a special function unit. Shared with the other three: the L1 instruction cache, the Tensor Memory Accelerator, the 256 KiB L1 data cache / shared memory and 4 texture units.',
    },
    volta: {
      id: 'volta', gpu: 'V100', long: 'V100 (Volta, SM70)', nSM: 80, rows: 8, tma: false, mem: 'HBM2',
      cols: { fp64: [[0, 56]], int32: [[64, 50], [114, 50]], fp32: [[172, 50], [222, 50]], tensor: [[282, 79], [369, 79]] },
      lanes: { g2: 168, g3: 277 },
      counts: { int32: '×16', fp32: '×16', fp64: '×8', tensor: '×2', ldst: '×8', sfu: '×1' },
      gen: ['1st gen.', ''],
      PARTS: VOLTA_PARTS, byKey: byKeyOf(VOLTA_PARTS), TOTALS: VOLTA_TOTALS,
      label: 'Floorplan of an NVIDIA V100 (Volta) Streaming Multiprocessor: an L1 instruction cache on top; four identical processing blocks, each with an L0 instruction cache, a warp scheduler and a dispatch unit (32 threads per clock each), a register file of 16,384 32-bit registers, 8 FP64, 16 INT32 and 16 FP32 units, two 1st-generation Tensor Cores, 8 load/store units and a special function unit; below them the 128 KiB L1 data cache / shared memory and 4 texture units. There is no Tensor Memory Accelerator on Volta.',
      labelSub: 'One of the four identical processing blocks of an NVIDIA V100 (Volta) Streaming Multiprocessor: an L0 instruction cache, a warp scheduler and a dispatch unit (32 threads per clock each), a register file of 16,384 32-bit registers, 8 FP64, 16 INT32 and 16 FP32 units, two 1st-generation Tensor Cores, 8 load/store units and a special function unit. Shared with the other three: the L1 instruction cache, the 128 KiB L1 data cache / shared memory and 4 texture units.',
    },
  };
  const ARCH_ALIAS = { h100: 'hopper', sm90: 'hopper', hopper: 'hopper', v100: 'volta', gv100: 'volta', sm70: 'volta', volta: 'volta' };

  /* keys → atomic keys ("fp32", "fp32@2"); groups and aliases resolved */
  function expand(keys) {
    const out = [];
    const list = keys == null ? [] : Array.isArray(keys) ? keys : [keys];
    for (const raw of list) {
      if (raw == null || raw === '') continue;
      const [b0, s] = String(raw).trim().split('@');
      const base = ALIAS[b0] || b0;
      const suf = s != null && s !== '' ? '@' + s : '';
      const atoms = GROUPS[base] || (BY[base] ? [base] : []);
      if (!atoms.length) { console.warn('[sm] unknown part key:', raw); continue; }
      for (const a of atoms) {
        const k = BY[a].scope === 'sub' ? a + suf : a;
        if (!out.includes(k)) out.push(k);
      }
    }
    return out;
  }

  const colorOf = (c) => (c ? ROLE_VAR[c] || c : null);

  /* ───────────────────────── geometry ─────────────────────────
     All coordinates are SVG user units. A sub-partition is 468 wide (448 inside its padding). */
  const IW = 448;
  const LDST_W = 312, SFU_X = 325, SFU_W = 123;
  const FR = 4, M = 24;
  /* Level-of-detail limits (screen px). The fine layout (a label in every unit cell, as in the whitepaper) is
     used only when its cell labels can be drawn at 10 px: rows ≥ 10.5 px tall, INT32 cells ≥ 31 px wide,
     LD/ST boxes ≥ 19.5 px wide. Otherwise the taller coarse layout, sized for 10.4 px labels at 300+ px. */
  const FINE_S = 0.583, FINE_COL = 31, FINE_LDST = 19.5, XS_MAX = 1.25;

  function spLocal(fine, counts, A, xs) {
    const P = fine ? 10 : 8;
    const IWx = IW * xs;
    const g = {};
    let y = P;
    const bar = (k, h, gap) => { g[k] = { x: P, y, w: IWx, h }; y += h + gap; };
    if (fine) { bar('l0i', 30, 6); bar('scheduler', 26, 5); bar('dispatch', 26, 6); bar('regfile', 42, 0); }
    else { bar('l0i', 42, 5); bar('scheduler', 42, 5); bar('dispatch', 42, 5); bar('regfile', 46, 0); }
    const hdrY = y;
    const hdr = counts ? (fine ? 24 : 42) : (fine ? 11 : 10);
    y += hdr;
    const uh = fine ? 288 : 192, rowH = uh / A.rows;
    const cols = (!fine && A.colsC) || A.cols, lanes = (!fine && A.lanesC) || A.lanes;
    const [ldW, sfX, sfW] = (!fine && A.ldstC) || [LDST_W, SFU_X, SFU_W];
    for (const k in cols) {
      const boxes = cols[k].map(([x, w]) => ({ x: P + x * xs, y, w: w * xs, h: uh }));
      g[k] = Object.assign(union(boxes), { boxes });
    }
    const unitsTop = y, unitsBot = y + uh;
    y = unitsBot + (fine ? 9 : 8);
    const lh = fine ? 38 : 40;
    g.ldst = { x: P, y, w: ldW * xs, h: lh };
    g.sfu = { x: P + sfX * xs, y, w: sfW * xs, h: lh };
    const ldstTop = y, ldstBot = y + lh;
    // coarse: the "LD/ST" label sits under its row of eight boxes, so the bottom strip is always there
    const bot = fine ? (counts ? 22 : P) : 46;
    const H = ldstBot + bot;
    return {
      g, P, W: IWx + 2 * P, H, rowH, unitsTop, unitsBot, ldstTop, ldstBot, hdrY, hdr, bot,
      cy3: hdrY + hdr / 2, cy4: (unitsBot + ldstTop) / 2, cy5: ldstBot + bot / 2,
      lane: { g2: P + lanes.g2 * xs, g3: P + lanes.g3 * xs },
    };
  }

  const ROW = { l0i: 0, scheduler: 1, dispatch: 2, regfile: 3, int32: 4, fp32: 4, fp64: 4, tensor: 4, ldst: 5, sfu: 5 };

  function buildLayout(o, fine, xs) {
    xs = xs || 1;
    const A = o.A;
    const counts = !!o.showCounts;
    const sp = spLocal(fine, counts, A, xs);
    const showTitle = o.title !== '' && !o.compact;
    const L = { fine, counts, sp, insts: [], sps: [], focus: o.focus, xs, A };
    const subs = o.focus === 'sub' ? [o.sub] : [0, 1, 2, 3];
    const W = o.focus === 'sub' ? sp.W + 2 * M : 2 * sp.W + 16 + 2 * M;
    const CW = W - 2 * M;
    let y = showTitle ? (fine ? 46 : 64) : M;
    L.titleY = showTitle ? y - (fine ? 15 : 20) : null;
    const sh = o.focus === 'sub'
      ? { l1i: fine ? 30 : 40, tma: fine ? 30 : 40, l1d: fine ? 36 : 42, tex: fine ? 26 : 36, gap: 10, gap2: 8, texGap: 8 }
      : { l1i: fine ? 34 : 44, tma: fine ? 34 : 44, l1d: fine ? 40 : 46, tex: fine ? 26 : 42, gap: 12, gap2: 10, texGap: 16 };
    const add = (key, sub, boxes, extra) => {
      const bb = union(boxes);
      const inst = Object.assign({ key, sub, boxes, bb, row: ROW[key] }, extra || {});
      L.insts.push(inst);
      return inst;
    };
    add('l1i', null, [{ x: M, y, w: CW, h: sh.l1i }]);
    y += sh.l1i + sh.gap;
    const spTop0 = y;
    subs.forEach((s, i) => {
      const col = o.focus === 'sub' ? 0 : s % 2, row = o.focus === 'sub' ? 0 : Math.floor(s / 2);
      const ox = M + col * (sp.W + 16), oy = spTop0 + row * (sp.H + 16);
      const frame = { x: ox, y: oy, w: sp.W, h: sp.H };
      const side = o.focus === 'sub' ? 'L' : col === 0 ? 'L' : 'R';
      const spInfo = { s, ox, oy, frame, side, col, row, i };
      L.sps.push(spInfo);
      add('sp', s, [frame], { spi: spInfo });
      for (const k of SUB_KEYS) {
        const r = sp.g[k];
        let boxes;
        if (r.boxes) boxes = r.boxes.map((b) => ({ x: ox + b.x, y: oy + b.y, w: b.w, h: b.h }));
        else if (k === 'ldst') {
          const bw = (r.w - 7 * 5) / 8;
          boxes = [];
          for (let j = 0; j < 8; j++) boxes.push({ x: ox + r.x + j * (bw + 5), y: oy + r.y, w: bw, h: r.h });
        } else boxes = [{ x: ox + r.x, y: oy + r.y, w: r.w, h: r.h }];
        add(k, s, boxes, { spi: spInfo, haloUnion: k !== 'ldst' && boxes.length > 1 });
      }
    });
    const spRows = o.focus === 'sub' ? 1 : 2;
    y = spTop0 + spRows * sp.H + (spRows - 1) * 16 + sh.gap;
    if (A.tma) {
      add('tma', null, [{ x: M, y, w: CW, h: sh.tma }]);
      y += sh.tma + sh.gap2;
    }
    add('l1d', null, [{ x: M, y, w: CW, h: sh.l1d }]);
    y += sh.l1d + sh.gap2;
    const tw = (CW - 3 * sh.texGap) / 4;
    const tb = [];
    for (let j = 0; j < 4; j++) tb.push({ x: M + j * (tw + sh.texGap), y, w: tw, h: sh.tex });
    add('tex', null, tb);
    y += sh.tex;
    const frameB = y + 16;
    let H = frameB + FR;
    /* the off-SM strip: two bands with a real gap between them, L2 cache then GPU RAM. Flows enter a band at
       eY (just above its middle); a flow to 'ram' (or 'ext') crosses the L2 band on its way down. */
    L.band = {};
    if (o.ext) {
      const eh = fine ? 26 : 36, gap = fine ? 18 : 24;
      let by = frameB + 8;
      for (const key of BANDS) {
        L.band[key] = { key, x: FR, y: by, w: W - 2 * FR, h: eh, eY: by + eh * 0.42 };
        by += eh + gap;
      }
      H = by - gap + 2;
    }
    L.extY = o.ext ? L.band.ram.eY : frameB;
    Object.assign(L, { W, H, CW, frameB, spGap: sh.gap, vL: (FR + M) / 2, vR: W - (FR + M) / 2 });
    L.byKey = {};
    for (const it of L.insts) (L.byKey[it.key] = L.byKey[it.key] || []).push(it);
    return L;
  }

  function union(bs) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const b of bs) { x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.w); y1 = Math.max(y1, b.y + b.h); }
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, r: x1, b: y1 };
  }

  /* ───────────────────────── routing (Manhattan wires through the gaps) ───────────────────────── */
  function anchorUnit(inst, above) { const b = inst.bb; return above ? b.y + Math.min(26, b.h / 3) : b.b - Math.min(26, b.h / 3); }
  /* where a bar's wire leaves it: just inside the edge that faces the other end (never across its label) */
  function anchorBar(inst, towardBelow) { const b = inst.bb; return towardBelow ? b.b - 5 : b.y + 5; }
  /* bars drop their wires into a unit column at different x, so parallel flows do not overlap */
  const BAR_FRAC = { l0i: 0.5, scheduler: 0.5, dispatch: 0.3, regfile: 0.7 };

  function routeSame(L, A, B) {
    const sp = L.sp, S = A.spi, oy = S.oy, ox = S.ox;
    const ra = A.row, rb = B.row;
    const cy3 = oy + sp.cy3, cy4 = oy + sp.cy4;
    if (ra <= 4 && rb <= 4) {
      if (ra === 4 && rb === 4) return [[A.bb.cx, anchorUnit(A, true)], [A.bb.cx, cy3], [B.bb.cx, cy3], [B.bb.cx, anchorUnit(B, true)]];
      const unit = ra === 4 ? A : rb === 4 ? B : null, bar = unit === A ? B : A;
      const x = unit ? unit.bb.x + unit.bb.w * BAR_FRAC[bar.key] : ox + S.frame.w * 0.87;
      const yOf = (P, Q) => (P.row === 4 ? anchorUnit(P, Q.row < 4) : anchorBar(P, Q.row > P.row));
      return [[x, yOf(A, B)], [x, yOf(B, A)]];
    }
    if (ra === 5 && rb === 5) return [[A.bb.cx, A.bb.cy], [B.bb.cx, B.bb.cy]];
    const [P, Q, rev] = ra === 5 ? [A, B, false] : [B, A, true];   // P is the bottom-row part
    let pts;
    if (Q.row === 4) {
      // up from the row's top edge (never over its label) into the unit above
      pts = [[P.bb.cx, P.bb.y], [P.bb.cx, cy4], [Q.bb.cx, cy4], [Q.bb.cx, anchorUnit(Q, false)]];
    } else {
      /* to a bar: along the sub-partition's own margin, clear of the unit columns. LD/ST sits at the left, so its
         wire runs up the left margin into its first box; the SFU sits at the right, so up the right margin. The
         wire meets each end at its outer edge, beside the (centred) label. */
      const left = P.key === 'ldst', fw = S.frame.w;
      const xm = left ? ox + sp.P / 2 : ox + fw - sp.P / 2;
      const pe = left ? P.boxes[0].x : P.bb.r;
      const qe = left ? ox + sp.P : ox + fw - sp.P;
      pts = [[pe, P.bb.cy], [xm, P.bb.cy], [xm, Q.bb.cy], [qe, Q.bb.cy]];
    }
    return rev ? pts.reverse() : pts;
  }

  /* path from a sub-partition part out to the side lane (ends on the lane) */
  function spPort(L, P, lx) {
    const sp = L.sp, S = P.spi, lane = lx[S.side];
    // bars: the wire ends just inside the outer edge, clear of the (centred) label
    const inner = S.side === 'L' ? S.ox + sp.P + 4 : S.ox + S.frame.w - sp.P - 4;
    if (P.key === 'sp') return [[S.side === 'L' ? S.ox + 14 : S.ox + S.frame.w - 14, S.oy + S.frame.h / 2], [lane, S.oy + S.frame.h / 2]];
    if (P.row <= 3) return [[inner, P.bb.cy], [lane, P.bb.cy]];
    const y4 = S.oy + sp.cy4;
    if (P.row === 4) return [[P.bb.cx, anchorUnit(P, false)], [P.bb.cx, y4], [lane, y4]];
    /* bottom row: leave through the bottom of the sub-partition and run along the gap below it to the side lane,
       so the wire never runs along the LD/ST + SFU row. The LD/ST row leaves from its outermost box, the SFU near
       its outer edge: both clear of the centred labels and counts under the row. */
    const x = P.key === 'ldst'
      ? (S.side === 'L' ? P.boxes[0] : P.boxes[P.boxes.length - 1]).x + P.boxes[0].w / 2
      : S.side === 'L' ? P.bb.x + Math.min(14, P.bb.w / 4) : P.bb.r - Math.min(14, P.bb.w / 4);
    const yg = S.oy + S.frame.h + (L.sps.length > 1 && S.row === 0 ? 8 : L.spGap / 2);
    return [[x, P.bb.b], [x, yg], [lane, yg]];
  }

  /* path from the side lane into an SM-wide part (starts on the lane) */
  function sharedPort(L, T, side, lx) {
    const lane = lx[side];
    if (T.scope === 'ext') return [[lane, bandY(L, T.key)]];
    let box = T.bb;
    if (T.key === 'tex') box = side === 'L' ? T.boxes[0] : T.boxes[3];
    const cy = box.y + box.h / 2;
    const x = side === 'L' ? box.x + Math.min(44, box.w * 0.3) : box.x + box.w - Math.min(44, box.w * 0.3);
    return [[lane, cy], [x, cy]];
  }

  /* where a flow ends on the off-SM strip: the L2 band, or the GPU RAM band below it ('ext' = GPU RAM) */
  function bandY(L, key) { const b = L.band[key === 'l2' ? 'l2' : 'ram']; return b ? b.eY : L.frameB; }

  function routes(L, from, to, subsWanted, laneOff) {
    const lx = { L: L.vL + (laneOff || 0), R: L.vR - (laneOff || 0) };
    const [fk, fs] = String(from).split('@'), [tk, ts] = String(to).split('@');
    const a = ALIAS[fk] || fk, b = ALIAS[tk] || tk;
    if (!BY[a] || !BY[b] || GROUPS[a] || GROUPS[b]) { console.warn('[sm] flow needs two part keys, got', from, to); return []; }
    if (a === b && fs === ts) return [];
    const A = BY[a], B = BY[b];
    const subsAvail = L.sps.map((s) => s.s);
    const pick = (x) => (x == null ? null : (Array.isArray(x) ? x : [x]).map(Number));
    let subs = pick(subsWanted) || subsAvail;
    if (fs != null && fs !== '') subs = subs.filter((s) => s === +fs);
    if (ts != null && ts !== '' && (fs == null || fs === '')) subs = subs.filter((s) => s === +ts);
    subs = subs.filter((s) => subsAvail.includes(s));
    const inst = (k, s) => (L.byKey[k] || []).find((it) => it.sub === s) || null;
    const one = (k) => (BY[k].scope === 'ext' ? BY[k] : (L.byKey[k] || [])[0]);
    const out = [];
    const aSub = A.scope === 'sub', bSub = B.scope === 'sub';
    if (aSub && bSub) {
      const crossSub = fs != null && ts != null && fs !== '' && ts !== '' && fs !== ts;
      if (crossSub) {
        const P = inst(a, +fs), Q = inst(b, +ts);
        if (P && Q) out.push([[P.bb.cx, P.bb.cy], [Q.bb.cx, Q.bb.cy]]);
        return out;
      }
      for (const s of subs) {
        const P = inst(a, s), Q = inst(b, s);
        if (!P || !Q) continue;
        if (a === 'sp' || b === 'sp') out.push([[P.bb.cx, P.bb.cy], [Q.bb.cx, Q.bb.cy]]);
        else out.push(routeSame(L, P, Q));
      }
      return out;
    }
    if (aSub || bSub) {
      const [sk, tkey, rev] = aSub ? [a, b, false] : [b, a, true];
      for (const s of subs) {
        const P = inst(sk, s);
        if (!P) continue;
        const T = one(tkey);
        if (!T) continue;
        const pts = spPort(L, P, lx).concat(sharedPort(L, T, P.spi.side, lx));
        out.push(rev ? pts.reverse() : pts);
      }
      return out;
    }
    // off the SM: L2 ↔ GPU RAM, one hop down the right lane across the gap between the bands
    const aExt = A.scope === 'ext', bExt = B.scope === 'ext';
    if (aExt && bExt) {
      const ram = (k) => k !== 'l2';
      if (ram(a) === ram(b) || !L.band.l2) return out;
      const l2 = L.band.l2, pts = [[lx.R, l2.y + l2.h * 0.62], [lx.R, bandY(L, 'ram')]];
      out.push(ram(a) ? pts.reverse() : pts);
      return out;
    }
    // SM-wide ↔ off the SM
    if (aExt || bExt) {
      const T = one(aExt ? b : a);
      if (!T) return out;
      const pts = sharedPort(L, T, 'R', lx).reverse().concat([[lx.R, bandY(L, aExt ? a : b)]]);
      out.push(aExt ? pts.reverse() : pts);
      return out;
    }
    const P = one(a), Q = one(b);
    if (!P || !Q) return out;
    for (const f of [0.08, 0.3, 0.7, 0.92]) {
      const x = M + L.CW * f;
      out.push([[x, P.bb.cy], [x, Q.bb.cy]]);
    }
    return out;
  }

  function prepPath(pts) {
    // drop zero-length segments
    const p = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const q = p[p.length - 1];
      if (Math.abs(pts[i][0] - q[0]) > 0.01 || Math.abs(pts[i][1] - q[1]) > 0.01) p.push(pts[i]);
    }
    const cum = [0];
    for (let i = 1; i < p.length; i++) cum.push(cum[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]));
    return { pts: p, cum, len: cum[cum.length - 1] };
  }
  function pointAt(P, d) {
    const { pts, cum } = P;
    if (pts.length === 1) return pts[0];
    let i = 1;
    while (i < cum.length - 1 && cum[i] < d) i++;
    const seg = cum[i] - cum[i - 1] || 1, t = Math.max(0, Math.min(1, (d - cum[i - 1]) / seg));
    return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t];
  }

  /* ───────────────────────── styles ───────────────────────── */
  GG.css(`
.sm-root { position: relative; }
.sm-svg { display: block; width: 100%; height: auto; margin: 0 auto; overflow: visible; -webkit-user-select: none; user-select: none; -webkit-tap-highlight-color: transparent; }
.sm-svg .sm-part { transition: opacity .38s ease; }
.sm-svg.sm-int .sm-part { cursor: pointer; }
.sm-svg .sm-part:focus { outline: none; }
.sm-svg .sm-r-core { --c: var(--core); } .sm-svg .sm-r-special { --c: var(--special); } .sm-svg .sm-r-control { --c: var(--control); }
.sm-svg .sm-r-memory { --c: var(--memory); } .sm-svg .sm-r-neutral { --c: var(--ink-2); }
.sm-svg .sm-frame { fill: #0c0d16; fill-opacity: .72; stroke: var(--line-2); stroke-width: 1px; vector-effect: non-scaling-stroke; }
.sm-svg .sm-box { fill: var(--c); fill-opacity: .09; stroke: var(--c); stroke-opacity: .46; stroke-width: 1px; vector-effect: non-scaling-stroke;
  transition: fill-opacity .38s ease, stroke-opacity .38s ease, stroke-width .38s ease; }
.sm-svg .sm-halo { fill: none; stroke: var(--c); stroke-opacity: 0; stroke-width: 7px; vector-effect: non-scaling-stroke; transition: stroke-opacity .38s ease; }
.sm-svg .sm-grid { fill: none; stroke: var(--c); stroke-opacity: .24; stroke-width: 1px; vector-effect: non-scaling-stroke; transition: stroke-opacity .38s ease; }
.sm-svg .sm-glyph { fill: var(--c); fill-opacity: .16; stroke: var(--c); stroke-opacity: .42; stroke-width: 1px; vector-effect: non-scaling-stroke; transition: fill-opacity .38s ease; }
.sm-svg .sm-r-memory .sm-box { fill-opacity: .1; }
.sm-svg .sm-r-neutral .sm-box { fill-opacity: .07; stroke-opacity: .38; }
.sm-svg .sm-sp .sm-box { fill: #fff; fill-opacity: .016; stroke: var(--line-2); stroke-opacity: 1; }
.sm-svg .sm-sp .sm-halo { stroke: var(--ink); }
.sm-svg text { font-family: var(--font-mono); }
.sm-svg .sm-part text { fill: var(--c); fill-opacity: .86; text-anchor: middle; pointer-events: none; transition: fill-opacity .38s ease; }
.sm-svg .sm-part text.sm-lab { font-size: var(--sm-fs-bar); letter-spacing: .02em; }
.sm-svg .sm-part text.sm-cell { font-size: var(--sm-fs-cell); fill-opacity: .6; letter-spacing: -.02em; }
.sm-svg .sm-part text.sm-col { font-size: var(--sm-fs-col); paint-order: stroke; stroke: #0c0d16; stroke-width: var(--sm-halo-col); stroke-linejoin: round; stroke-opacity: .9; }
.sm-svg .sm-part text.sm-cnt { font-size: var(--sm-fs-cnt); font-weight: 600; fill-opacity: 1; }
.sm-svg .sm-part text.sm-t2 { font-size: var(--sm-fs-sub2); fill-opacity: .66; }
.sm-svg .sm-title { fill: var(--ink-2); }
.sm-svg .sm-title .sm-t-big { font-family: var(--font-display); font-weight: 800; font-size: var(--sm-fs-big); fill: var(--ink); letter-spacing: .02em; }
.sm-svg .sm-title .sm-t-sub { font-size: var(--sm-fs-title); fill: var(--ink-2); letter-spacing: .04em; }
.sm-svg .sm-loc rect { fill: none; stroke: var(--ink-3); stroke-width: 1px; vector-effect: non-scaling-stroke; }
.sm-svg .sm-loc rect.on { fill: var(--ink-2); stroke: var(--ink-2); }
.sm-svg .sm-port { fill: var(--bg); stroke: var(--memory); stroke-opacity: .7; stroke-width: 1px; vector-effect: non-scaling-stroke; }
/* the off-SM strip: a context band, labelled in ink so it reads even when the SM is dimmed around a highlight */
.sm-svg .sm-ext .sm-box { stroke-dasharray: 5 4; fill-opacity: .07; stroke-opacity: .55; }
.sm-svg .sm-ext text.sm-lab { fill: var(--ink-2); fill-opacity: 1; }
.sm-svg .sm-ext.sm-fend .sm-box, .sm-svg .sm-ext.sm-on .sm-box { stroke-dasharray: none; stroke-opacity: 1; stroke-width: 1.5px; fill-opacity: .16; }
.sm-svg .sm-ext.sm-fend .sm-halo { stroke-opacity: .2; }
.sm-svg .sm-ext.sm-fend text.sm-lab, .sm-svg .sm-ext.sm-on text.sm-lab { fill: var(--ink); }
.sm-svg .sm-port.sm-fend { fill: var(--memory); stroke-opacity: 1; }

/* highlight: the chosen parts glow, the rest dims */
.sm-svg.sm-dim .sm-part:not(.sm-on):not(.sm-sp):not(.sm-fend) { opacity: .22; }
.sm-svg.sm-dim .sm-part.sm-hov:not(.sm-on):not(.sm-sp) { opacity: .72; }
.sm-svg .sm-part.sm-on .sm-box { fill-opacity: .3; stroke-opacity: 1; stroke-width: 1.5px; }
.sm-svg .sm-part.sm-on .sm-halo { stroke-opacity: .26; }
.sm-svg .sm-part.sm-on .sm-grid { stroke-opacity: .55; }
.sm-svg .sm-part.sm-on .sm-glyph { fill-opacity: .4; }
.sm-svg .sm-part.sm-on text { fill-opacity: 1; }
.sm-svg .sm-part.sm-on text.sm-cell { fill-opacity: .92; }
/* dots: one per unit on lit INT32 / FP32 / FP64 columns (they replace the per-cell labels while shown) */
.sm-svg .sm-udots { display: none; }
.sm-svg .sm-udots circle { fill: var(--c); fill-opacity: .95; }
.sm-svg.sm-udot .sm-part.sm-on .sm-udots { display: inline; }
.sm-svg.sm-udot .sm-part.sm-on text.sm-cell { display: none; }
.sm-svg.sm-udot .sm-part.sm-on .sm-grid { stroke-opacity: .2; }
.sm-svg .sm-sp.sm-on .sm-box { stroke: var(--ink-2); fill-opacity: .035; }
.sm-svg .sm-sp.sm-on .sm-halo { stroke-opacity: .14; }
/* hover / keyboard focus */
.sm-svg .sm-part.sm-hov .sm-box { stroke-opacity: 1; fill-opacity: .2; }
.sm-svg .sm-part.sm-on.sm-hov .sm-box { fill-opacity: .38; }
.sm-svg .sm-part.sm-hov .sm-halo { stroke-opacity: .16; }
.sm-svg .sm-part.sm-hov text { fill-opacity: 1; }
.sm-svg .sm-sp.sm-hov .sm-box { stroke: var(--ink-3); fill-opacity: .03; }
.sm-svg .sm-part.sm-kf .sm-halo { stroke: var(--accent); stroke-opacity: .6; }
.sm-svg .sm-part.sm-kf .sm-box { stroke: var(--accent); stroke-opacity: 1; }
/* pulse: a brief flash */
@keyframes sm-pulse-halo { from { stroke-opacity: .9; stroke-width: 14px; } }
@keyframes sm-pulse-box { from { fill-opacity: .72; stroke-opacity: 1; } }
.sm-svg .sm-part.sm-pulse { opacity: 1 !important; transition: none; }
.sm-svg .sm-part.sm-pulse .sm-halo { stroke: var(--pc, var(--c)); animation: sm-pulse-halo .7s ease-out; }
.sm-svg .sm-part.sm-pulse .sm-box { animation: sm-pulse-box .7s ease-out; }
@media (prefers-reduced-motion: reduce) {
  .sm-svg .sm-part.sm-pulse .sm-box { fill-opacity: .5; stroke-opacity: 1; }
  .sm-svg .sm-part.sm-pulse .sm-halo { stroke-opacity: .5; }
}
.sm-svg.sm-notrans .sm-part, .sm-svg.sm-notrans .sm-box, .sm-svg.sm-notrans .sm-halo, .sm-svg.sm-notrans .sm-grid, .sm-svg.sm-notrans text { transition: none !important; }
/* flows */
.sm-svg .sm-flows { pointer-events: none; }
.sm-svg .sm-fpath { fill: none; stroke: var(--fc); stroke-opacity: .62; stroke-width: 2px; vector-effect: non-scaling-stroke; stroke-linejoin: round; }
.sm-svg .sm-farrow { fill: var(--fc); fill-opacity: 1; stroke: #0b0c12; stroke-width: 1px; vector-effect: non-scaling-stroke; stroke-linejoin: round; }
.sm-svg .sm-fmid { fill: var(--fc); fill-opacity: .95; }
.sm-svg .sm-dot { fill: var(--fc); stroke: #0b0c12; stroke-width: 1.25px; vector-effect: non-scaling-stroke; }

/* info panel */
.sm-info { position: absolute; left: 0; top: 0; z-index: 6; width: min(300px, calc(100% - 8px)); padding: 11px 13px 11px; border-radius: 12px;
  background: rgba(17, 18, 29, .97); border: 1px solid var(--line-2); box-shadow: 0 18px 48px -14px rgba(0,0,0,.9);
  font-size: 13.5px; line-height: 1.5; color: var(--ink-2); opacity: 0; visibility: hidden; transform: translateY(3px);
  transition: opacity .12s ease, transform .12s ease, visibility 0s linear .12s; }
.sm-info[hidden] { display: none !important; }
.sm-info.sm-show { opacity: 1; visibility: visible; transform: none; transition: opacity .12s ease, transform .12s ease; }
.sm-root.sm-dock .sm-info { position: static; width: auto; margin-top: 10px; opacity: 1; visibility: visible; transform: none; transition: none;
  box-shadow: none; background: rgba(8, 9, 14, .66); border-color: var(--line); min-height: 44px; }
.sm-info-h { display: flex; align-items: baseline; gap: 8px; }
.sm-info-h i { width: 9px; height: 9px; border-radius: 2px; background: var(--c); flex: none; align-self: center; }
.sm-info-h b { font-weight: 650; color: var(--ink); font-size: 14.5px; line-height: 1.3; }
.sm-info-role { margin-bottom: 5px; font: 500 9.5px/1 var(--font-mono); letter-spacing: .12em; text-transform: uppercase; color: var(--c); }
.sm-info-n { margin-top: 4px; font: 500 11.5px/1.45 var(--font-mono); color: var(--c); }
.sm-info-d { margin: 5px 0 0; }
.sm-info-f { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 4px 12px; align-items: baseline; justify-content: space-between; font-size: 13px; }
.sm-info-f > span { color: var(--ink-3); }
.sm-info-f a { font-weight: 600; }
.sm-info-f small { font: 500 10.5px var(--font-mono); color: var(--ink-3); }
.sm-info-hint { font: 500 11.5px/1.5 var(--font-mono); color: var(--ink-3); }

/* per-SM totals legend */
.sm-legend { margin-top: 12px; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1px; background: var(--line);
  border: 1px solid var(--line); border-radius: 12px; overflow: hidden; }
.sm-root.sm-narrow .sm-legend, .sm-root.sm-side .sm-legend { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.sm-root.sm-side { display: grid; column-gap: 18px; align-items: center; }
.sm-root.sm-side .sm-legend { margin-top: 0; }
.sm-root.sm-narrow .sm-lg { padding: 8px 10px 9px; }
.sm-root.sm-narrow .sm-lg b { font-size: 23px; }
.sm-root.sm-narrow .sm-lg span { font-size: 12px; }
.sm-lg { appearance: none; -webkit-appearance: none; border: 0; margin: 0; border-radius: 0; text-align: left; background: rgba(14, 15, 24, .96); padding: 10px 12px 10px;
  color: var(--ink-2); font: inherit; cursor: pointer; display: flex; flex-direction: column; gap: 3px; min-width: 0; transition: background .15s; }
.sm-lg b { font: 800 27px/1 var(--font-display); color: var(--c); letter-spacing: .01em; font-variant-numeric: tabular-nums; }
.sm-lg span { font-size: 12.5px; line-height: 1.3; color: var(--ink); }
.sm-lg small { font: 500 10.5px/1.35 var(--font-mono); color: var(--ink-3); }
.sm-lg:hover, .sm-lg.sm-on { background: var(--surface-3); }
.sm-lg:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; border-radius: 0; }
`);

  /* ───────────────────────── the component ───────────────────────── */
  function sm(parent, opts) {
    opts = opts || {};
    const archId = ARCH_ALIAS[String(opts.arch || 'hopper').toLowerCase()];
    if (opts.arch != null && !archId) console.warn('[sm] unknown arch:', opts.arch, '(using hopper)');
    const A = ARCHS[archId || 'hopper'];
    const AP = A.byKey;
    const o = {
      A,
      infoDock: opts.infoDock === true || opts.infoDock === false ? opts.infoDock : 'auto',
      focus: opts.focus === 'sub' ? 'sub' : 'sm',
      sub: Math.max(0, Math.min(3, (opts.sub | 0))),
      interactive: opts.interactive !== false,
      showCounts: !!opts.showCounts,
      legend: !!opts.legend,
      compact: !!opts.compact,
      ext: !!opts.ext,
      title: opts.title,
      onPart: typeof opts.onPart === 'function' ? opts.onPart : null,
    };
    const S = (tag, attrs, p) => GG.svg(tag, attrs, p);
    const listeners = {};
    const emit = (ev, ...a) => (listeners[ev] || []).slice().forEach((fn) => { try { fn(...a); } catch (e) { console.error('[sm] listener', e); } });

    const root = GG.el('div', { class: 'sm-root' });
    const svg = S('svg', { class: 'sm-svg' + (o.interactive ? ' sm-int' : ''), xmlns: 'http://www.w3.org/2000/svg', 'data-keys': '' });
    root.append(svg);
    const mh = opts.maxHeight == null ? '86vh' : opts.maxHeight;
    if (mh && mh !== 'none') svg.style.maxHeight = mh;
    const defaultLabel = o.focus === 'sub' ? A.labelSub : A.label;
    const baseLabel = opts.ariaLabel || defaultLabel;
    svg.setAttribute('role', o.interactive ? 'group' : 'img');
    svg.setAttribute('aria-label', baseLabel);

    let info = null, hintHTML = '';
    if (o.interactive) {
      info = GG.el('div', { class: 'sm-info', 'aria-live': 'polite' });
      hintHTML = '<div class="sm-info-hint">Tap or hover any block to see what it is.</div>';
      root.append(info);
    }
    let legendEl = null;
    if (o.legend) {
      legendEl = GG.el('div', { class: 'sm-legend', role: 'group', 'aria-label': 'Per-SM totals' });
      A.TOTALS.forEach((t) => {
        const b = GG.el('button', { type: 'button', class: 'sm-lg', style: `--c:${ROLE_VAR[t.role]}`, 'data-sm-keys': t.keys.join(' '), 'aria-label': `${t.value} ${t.label} per SM, ${t.sub}` });
        b.innerHTML = `<b>${GG.esc(t.value)}</b><span>${GG.esc(t.label)}</span><small>${GG.esc(t.sub)}</small>`;
        legendEl.append(b);
      });
      root.append(legendEl);
    }
    (parent || document.body).appendChild(root);

    /* state */
    let L = null, fine = true, k = 1, narrow = false, dock = false, xs = 1, measured = false;
    const geomCache = {};
    const own = (list) => list.filter((x) => AP[x.split('@')[0]]);   // drop parts this architecture lacks (tma on Volta)
    let hl = own(expand(opts.highlight)), dotsOn = !!opts.dots;
    let hovKey = null, hovInst = null, pinned = null, pinnedInst = null, focusKey = null, hideT = 0;
    const flows = [];
    let anim = null;
    let order = [];
    const reps = {};
    let fsU = {};   // current font sizes in user units, by class (set in setFontVars)

    /* ───── build the drawing ───── */
    function build() {
      L = buildLayout(o, fine, xs);
      L.fits = [];
      L.bands = [];
      svg.textContent = '';
      svg.setAttribute('viewBox', `0 0 ${L.W} ${L.H}`);
      svg.classList.toggle('sm-fine', fine);
      const gFrame = S('g', { class: 'sm-bg', 'aria-hidden': 'true' }, svg);
      S('rect', { class: 'sm-frame', x: FR, y: FR, width: L.W - 2 * FR, height: L.frameB - FR, rx: fine ? 10 : 14 }, gFrame);
      if (L.titleY != null) drawTitle(gFrame);
      if (o.ext) drawExt(gFrame);
      // wires run under the parts (labels paint over them); particles and arrowheads run above
      L.wireLayer = S('g', { class: 'sm-flows sm-wires', 'aria-hidden': 'true' }, svg);
      const gParts = S('g', { class: 'sm-parts' }, svg);
      const gSp = S('g', { class: 'sm-sps' }, gParts);
      for (const it of L.insts) drawInst(it.key === 'sp' ? gSp : gParts, it);
      L.flowLayer = S('g', { class: 'sm-flows', 'aria-hidden': 'true' }, svg);
      // keyboard representatives (roving tabindex)
      order = A.PARTS.filter((p) => p.scope !== 'ext' && L.byKey[p.key]).map((p) => p.key);
      for (const b of L.bands) order.push(b.key);
      for (const kk in reps) delete reps[kk];
      for (const key of order) {
        const insts = L.byKey[key] || [];
        const rep = insts[0];
        reps[key] = rep ? rep.el : (bandsOf(key)[0] || {}).el;
      }
      if (o.interactive) {
        for (const key of order) {
          const el = reps[key];
          if (!el) continue;
          const p = AP[key];
          el.setAttribute('tabindex', key === (focusKey || order[0]) ? '0' : '-1');
          el.setAttribute('role', 'button');
          el.setAttribute('aria-label', `${p.name}: ${p.count}. ${p.desc}`);
        }
      }
      for (const f of flows) mountFlow(f);
      markFlowEnds();
      applyHL('fresh');   // new elements start in their final state; nothing to transition from
      applyHover();
    }

    /* Register a label that must fit a width: `vars` are alternatives, longest first ('' = drop it); a label
       whose shortest alternative still does not fit is shrunk. fitLabels() re-runs whenever the scale changes. */
    function fit(el, vars, maxW, cls) { L.fits.push({ el, vars, maxW, cls }); return el; }
    const CW_EM = { lab: 0.62, cell: 0.58, col: 0.6, cnt: 0.6, t2: 0.6, title: 0.64 };
    function fitLabels() {
      if (!L || !L.fits) return;
      for (const F of L.fits) {
        const fs = fsU[F.cls] || 12, cw = (CW_EM[F.cls] || 0.6) * fs;
        const maxW = typeof F.maxW === 'function' ? F.maxW() : F.maxW;
        if (F.vars) {
          let pick = F.vars.find((v) => v.length * cw <= maxW);
          if (pick == null) pick = F.vars[F.vars.length - 1];
          if (F.el.textContent !== pick) F.el.textContent = pick;
        }
        const len = F.vars ? F.el.textContent.length : Math.max(0, ...[...F.el.childNodes].map((n) => n.textContent.length));
        const need = len * cw;
        if (len && need > maxW) F.el.style.fontSize = Math.max(fs * 0.6, (fs * maxW) / need).toFixed(2) + 'px';
        else if (F.el.style.fontSize) F.el.style.fontSize = '';
      }
    }

    function drawTitle(g) {
      const t = S('text', { class: 'sm-title', x: M, y: L.titleY }, g);
      S('tspan', { class: 'sm-t-big', text: 'SM' }, t);
      const vars = o.title != null ? [o.title]
        : o.focus === 'sub' ? [`Sub-partition ${o.sub + 1} of 4 · ${A.long}`, `Sub-partition ${o.sub + 1} of 4 · ${A.gpu}`, `${o.sub + 1} of 4 · ${A.gpu}`]
          : [`Streaming Multiprocessor · ${A.long}`, `Streaming Multiprocessor · ${A.gpu}`, A.gpu];
      const sub = S('tspan', { class: 'sm-t-sub', dx: '0.55em', text: fine ? vars[0] : vars[Math.min(1, vars.length - 1)] }, t);
      const locW = o.focus === 'sub' ? 2 * (fine ? 9 : 12) + 2 + 12 : 0;
      fit(sub, fine ? vars : vars.slice(Math.min(1, vars.length - 1)), () => L.W - 2 * M - locW - (fsU.big || 20) * 1.15 - (fsU.title || 12) * 0.6, 'title');
      if (o.focus === 'sub') {
        const s = fine ? 9 : 12, gap = 2, x0 = L.W - M - (2 * s + gap), y0 = L.titleY - 2 * s - gap + (fine ? 2 : 3);
        const loc = S('g', { class: 'sm-loc' }, g);
        for (let q = 0; q < 4; q++) S('rect', { class: q === o.sub ? 'on' : null, x: x0 + (q % 2) * (s + gap), y: y0 + Math.floor(q / 2) * (s + gap), width: s, height: s, rx: 1.5 }, loc);
      }
    }

    function drawExt(g) {
      const mem = A.mem;
      const VARS = {
        l2: ['Off the SM: L2 cache, shared by all SMs', 'L2 cache, shared by all SMs', 'L2 cache · all SMs', 'L2 cache'],
        ram: [`GPU RAM (${mem}, off-chip)`, `GPU RAM · ${mem}, off-chip`, 'GPU RAM · off-chip', 'GPU RAM'],
      };
      for (const key of BANDS) {
        const e = L.band[key];
        const eg = S('g', { class: 'sm-part sm-r-memory sm-ext', 'data-part': key }, g.parentNode);
        S('rect', { class: 'sm-halo', x: e.x, y: e.y, width: e.w, height: e.h, rx: e.h / 2 }, eg);
        S('rect', { class: 'sm-box', x: e.x, y: e.y, width: e.w, height: e.h, rx: e.h / 2 }, eg);
        const vars = fine ? VARS[key] : VARS[key].slice(1);
        const t = S('text', { class: 'sm-lab', x: L.W / 2, y: e.y + e.h / 2, dy: '0.35em', text: vars[0], 'aria-hidden': 'true' }, eg);
        fit(t, vars, e.w - 2 * (M + 40), 'lab');
        L.bands.push({ key, el: eg, bb: { x: e.x, y: e.y, w: e.w, h: e.h, cx: L.W / 2, cy: e.y + e.h / 2 } });
      }
      L.ports = [];
      for (const x of [L.vL, L.vR]) L.ports.push(S('circle', { class: 'sm-port', cx: x, cy: L.frameB, r: fine ? 3 : 6 }, g));
    }

    /* per-key label alternatives (longest first); fine layout first, then the coarse one */
    const BAR_VARS = {
      l1i: [['L1 Instruction Cache', 'L1 I-Cache'], ['L1 Instruction Cache', 'L1 I-Cache']],
      l0i: [['L0 Instruction Cache', 'L0 I-Cache'], ['L0 Instruction Cache', 'L0 I-Cache']],
      scheduler: [['Warp Scheduler (32 thread/clk)', 'Warp Scheduler', 'Scheduler'], ['Warp Scheduler', 'Scheduler']],
      dispatch: [['Dispatch Unit (32 thread/clk)', 'Dispatch Unit', 'Dispatch'], ['Dispatch Unit', 'Dispatch']],
      regfile: [['Register File (16,384 × 32-bit)', 'Register File · 64 KiB', 'Register File'], ['Register File · 64 KiB', 'Register File', 'Registers']],
      tma: [['Tensor Memory Accelerator', 'TMA'], ['Tensor Memory Accelerator', 'TMA']],
      sfu: [['SFU'], ['SFU']],
    };
    function l1dVars() {
      const p = AP.l1d, kib = p.label.split(' ')[0] + ' KiB';
      return [[p.label, p.short, 'L1 / Shared Mem · ' + kib, 'L1 / Shared Mem'], [p.short, 'L1 / Shared Mem · ' + kib, 'L1 / Shared Mem']];
    }

    function drawInst(parentG, it) {
      const p = AP[it.key];
      const g = S('g', { class: `sm-part sm-r-${p.role}` + (it.key === 'sp' ? ' sm-sp' : ''), 'data-part': it.key, 'data-sub': it.sub == null ? null : String(it.sub) }, parentG);
      it.el = g;
      const rx = it.key === 'sp' ? (fine ? 7 : 10) : fine ? 2.5 : 4;
      if (it.haloUnion) S('rect', { class: 'sm-halo', x: it.bb.x, y: it.bb.y, width: it.bb.w, height: it.bb.h, rx }, g);
      else for (const b of it.boxes) S('rect', { class: 'sm-halo', x: b.x, y: b.y, width: b.w, height: b.h, rx }, g);
      for (const b of it.boxes) S('rect', { class: 'sm-box', x: b.x, y: b.y, width: b.w, height: b.h, rx }, g);
      if (it.key === 'sp') return;
      const showLabels = !(o.compact && it.sub != null && it.sub !== L.sps[0].s);
      const cellKeys = { int32: 'INT32', fp32: 'FP32', fp64: 'FP64' };
      const rows = A.rows, rowH = L.sp.rowH;
      const col = (x, y, txt, rot, parent) => S('text', { class: 'sm-col', x, y, dy: '0.36em', transform: rot ? `rotate(-90 ${x} ${y})` : null, text: txt, 'aria-hidden': 'true' }, parent || g);
      if (cellKeys[it.key]) {
        let d = '';
        for (const b of it.boxes) for (let r = 1; r < rows; r++) d += `M${b.x} ${b.y + r * rowH}h${b.w}`;
        S('path', { class: 'sm-grid', d }, g);
        // one dot per unit, shown only while the part is lit by highlight(keys, { dots: true })
        const gd = S('g', { class: 'sm-udots', 'aria-hidden': 'true' }, g);
        for (const b of it.boxes) {
          const rr = Math.min(rowH * 0.36, b.w * 0.2);
          for (let r = 0; r < rows; r++) S('circle', { cx: b.x + b.w / 2, cy: b.y + (r + 0.5) * rowH, r: rr }, gd);
        }
        if (fine) {
          for (const b of it.boxes) for (let r = 0; r < rows; r++) S('text', { class: 'sm-cell', x: b.x + b.w / 2, y: b.y + (r + 0.5) * rowH, dy: '0.36em', text: cellKeys[it.key], 'aria-hidden': 'true' }, g);
        } else if (showLabels) {
          for (const b of it.boxes) {
            const rot = b.w < 90;
            fit(col(b.x + b.w / 2, b.y + b.h / 2, cellKeys[it.key], rot), [cellKeys[it.key]], rot ? b.h - 16 : b.w - 12, 'col');
          }
        }
      } else if (it.key === 'tensor') {
        const multi = it.boxes.length > 1;
        // a small matrix tile in each Tensor Core: they operate on whole matrices
        const n = 4, gs = fine ? 7 : 9, gg = fine ? 3 : 4, tw = n * gs + (n - 1) * gg;
        if (fine || showLabels) {
          for (const b of it.boxes) {
            const cx = b.x + b.w / 2, gy = b.y + b.h * (fine ? 0.62 : 0.66);
            for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) S('rect', { class: 'sm-glyph', x: cx - tw / 2 + c * (gs + gg), y: gy + r * (gs + gg), width: gs, height: gs, rx: 1 }, g);
          }
        }
        if (fine) {
          for (const b of it.boxes) {
            const cx = b.x + b.w / 2, y = b.y + b.h * 0.36;
            if (multi) {
              const t = S('text', { class: 'sm-lab', x: cx, y, 'aria-hidden': 'true' }, g);
              S('tspan', { x: cx, dy: '-0.2em', text: 'Tensor' }, t);
              S('tspan', { x: cx, dy: '1.15em', text: 'Core' }, t);
              fit(t, null, b.w - 8, 'lab');
              fit(S('text', { class: 'sm-t2', x: cx, y, dy: '2.75em', text: A.gen[0], 'aria-hidden': 'true' }, g), A.gen, b.w - 8, 't2');
            } else {
              fit(S('text', { class: 'sm-lab', x: cx, y, dy: '0.36em', text: 'Tensor Core', 'aria-hidden': 'true' }, g), ['Tensor Core'], b.w - 8, 'lab');
              fit(S('text', { class: 'sm-t2', x: cx, y, dy: '1.95em', text: A.gen[0], 'aria-hidden': 'true' }, g), A.gen, b.w - 8, 't2');
            }
          }
        } else if (showLabels) {
          // one label per SM-figure position: over the pair on Volta (the paint-order halo keeps it legible)
          const b = it.bb;
          const t = S('text', { class: 'sm-col', x: b.cx, y: b.y + b.h * 0.34, 'aria-hidden': 'true' }, g);
          S('tspan', { x: b.cx, dy: '-0.2em', text: 'Tensor' }, t);
          S('tspan', { x: b.cx, dy: '1.1em', text: multi ? 'Cores' : 'Core' }, t);
          fit(t, null, b.w - 12, 'col');
        }
      } else if (it.key === 'ldst') {
        if (fine) {
          for (const b of it.boxes) {
            const t = S('text', { class: 'sm-cell', x: b.x + b.w / 2, y: b.y + b.h / 2, 'aria-hidden': 'true' }, g);
            S('tspan', { x: b.x + b.w / 2, dy: '-0.2em', text: 'LD/' }, t);
            S('tspan', { x: b.x + b.w / 2, dy: '1.1em', text: 'ST' }, t);
          }
        } else if (showLabels) {
          // coarse: the boxes are too small to hold text, so the label goes under the row (with the count)
          const t = S('text', { class: 'sm-col', x: it.bb.cx, y: it.spi.oy + L.sp.cy5, dy: '0.36em', 'aria-hidden': 'true' }, g);
          S('tspan', { text: 'LD/ST' }, t);
          if (L.counts) S('tspan', { class: 'sm-cnt', dx: '0.5em', text: A.counts.ldst }, t);
        }
      } else if (it.key === 'tex') {
        for (const b of it.boxes) S('text', { class: 'sm-lab', x: b.x + b.w / 2, y: b.y + b.h / 2, dy: '0.36em', text: 'Tex', 'aria-hidden': 'true' }, g);
      } else if (showLabels) {
        const vv = it.key === 'l1d' ? l1dVars() : BAR_VARS[it.key];
        const vars = vv ? vv[fine ? 0 : 1] : [fine ? p.label : p.short];
        fit(S('text', { class: 'sm-lab', x: it.bb.cx, y: it.bb.cy, dy: '0.36em', text: vars[0], 'aria-hidden': 'true' }, g), vars, it.bb.w - 16, 'lab');
      }
      if (L.counts && it.sub != null && showLabels && !(it.key === 'ldst' && !fine)) {
        const sp = L.sp, S0 = it.spi;
        const cnt = A.counts[it.key];
        if (cnt) {
          const y = it.row === 4 ? S0.oy + sp.cy3 : S0.oy + sp.cy5;
          S('text', { class: 'sm-cnt', x: it.bb.cx, y, dy: '0.36em', text: cnt, 'aria-hidden': 'true' }, g);
        }
      }
    }

    /* ───── sizing ───── */
    function updateScale() {
      const r = svg.getBoundingClientRect();
      if (!r.width || !L) return;
      const s = Math.min(r.width / L.W, (r.height || r.width * L.H / L.W) / L.H);
      k = 1 / s;
      setFontVars();
      for (const f of flows) sizeFlow(f);
      if (!anim || !anim.running) for (const f of flows) drawFlowStatic(f);
    }
    /* Text is sized in screen pixels (k = user units per screen px): ≥ 10 px everywhere on the drawing, with
       caps in user units so labels always fit their boxes. */
    function setFontVars() {
      const c = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
      const v = fine
        ? { bar: c(10.5 * k, 11, 18), cell: c(10.1 * k, 9.5, 17.6), col: c(10.5 * k, 11, 18), cnt: c(10.1 * k, 10.5, 18), sub2: c(10.1 * k, 9.5, 17.6), title: c(11 * k, 11.5, 19.5), big: c(21 * k, 22, 34) }
        : { bar: c(10.4 * k, 12, 38), cell: c(10.4 * k, 12, 38), col: c(10.4 * k, 12, 38), cnt: c(10.4 * k, 12, 38), sub2: c(10 * k, 11, 36), title: c(10.4 * k, 12, 38), big: c(16 * k, 20, 48) };
      for (const n in v) svg.style.setProperty('--sm-fs-' + n, v[n].toFixed(2) + 'px');
      svg.style.setProperty('--sm-halo-col', (v.col * 0.28).toFixed(2) + 'px');
      fsU = { lab: v.bar, cell: v.cell, col: v.col, cnt: v.cnt, t2: v.sub2, title: v.title, big: v.big };
      fitLabels();
    }

    /* Geometry of a layout at xs = 1, for the level-of-detail decision (cached per level). */
    function geom(fl) {
      if (!geomCache[fl]) { const g = buildLayout(o, fl, 1); geomCache[fl] = { W: g.W, H: g.H }; }
      return geomCache[fl];
    }
    /* Scale s and horizontal stretch xs a layout would get in a root `w` px wide under a height cap `mh`. On a
       wide stage whose drawing is height-capped (whole SM, not 'sub' focus), the sub-partitions widen by up to
       XS_MAX so the floorplan uses the width it is given and its unit labels have room at ≥ 10 px. */
    function fitAt(fl, w, mh, wStretch) {
      const g = geom(fl), nc = o.focus === 'sub' ? 1 : 2;
      let x = 1;
      if (mh > 0 && o.focus !== 'sub') x = Math.max(1, Math.min(XS_MAX, 1 + (wStretch * g.H / mh - g.W) / (nc * IW)));
      x = Math.floor(x * 20 + 1e-6) / 20;
      const Wx = g.W + nc * IW * (x - 1);
      return { xs: x, s: Math.min(w / Wx, mh > 0 ? mh / g.H : Infinity), W: Wx, H: g.H };
    }

    /* Pick the level of detail from the width the drawing will really get (the height cap can make
       it narrower than its container), lay out the legend beside the drawing when there is room. */
    function decide() {
      const w = root.clientWidth;
      if (!w) return;
      const nar = w < 560, dk = nar && !o.compact && o.interactive;
      if (nar !== narrow || dk !== dock) {
        narrow = nar; dock = dk;
        root.classList.toggle('sm-narrow', narrow);
        root.classList.toggle('sm-dock', dock);
        if (info) { info.style.left = info.style.top = ''; renderInfo(); }
      }
      const mh = parseFloat(getComputedStyle(svg).maxHeight);
      // a legend that fits beside the drawing stays there (the drawing then stretches only into what is left)
      const sideFor = (r) => !!legendEl && !narrow && w - Math.floor(Math.min(w, mh > 0 ? mh * r.W / r.H : Infinity)) - 18 >= 300;
      const fitFor = (fl) => {
        if (legendEl && !narrow) { const r = fitAt(fl, w, mh, w - 318); if (sideFor(r)) return r; }
        return fitAt(fl, w, mh, w);
      };
      let pick = null;
      if (!o.compact) {
        const r = fitFor(true);
        const bw = (LDST_W * r.xs - 35) / 8;
        /* hysteresis: once measured, a drawing in the fine layout keeps it until the scale drops 3% below the
           limits, so a container that jitters around the threshold does not flip the level of detail */
        const h = measured && fine ? 0.97 : 1;
        if (r.s >= FINE_S * h && 50 * r.xs * r.s >= FINE_COL * h && bw * r.s >= FINE_LDST * h) pick = { fine: true, r };
      }
      if (!pick) pick = { fine: false, r: fitFor(false) };
      measured = true;
      if (pick.fine !== fine || pick.r.xs !== xs || !L) { fine = pick.fine; xs = pick.r.xs; build(); }
      if (legendEl) {
        const D = Math.floor(Math.min(w, mh > 0 ? mh * L.W / L.H : Infinity));
        const side = sideFor(L);
        root.classList.toggle('sm-side', side);
        root.style.gridTemplateColumns = side ? `${D}px minmax(0, 1fr)` : '';
      }
      updateScale();
    }

    /* ───── highlight ───── */
    function isOn(it, set) {
      if (BANDS.includes(it.key)) return set.includes(it.key) || set.includes('ext');
      if (set.includes(it.key)) return true;
      if (it.sub != null) {
        if (set.includes(it.key + '@' + it.sub)) return true;
        if (it.key !== 'sp' && (set.includes('sp') || set.includes('sp@' + it.sub))) return true;
      }
      return false;
    }
    function applyHL(instant) {
      if (!L) return;
      if (instant === 'fresh') instant = false;
      else if (instant) svg.classList.add('sm-notrans');
      svg.classList.toggle('sm-dim', hl.length > 0);
      svg.classList.toggle('sm-udot', dotsOn);
      for (const it of L.insts) it.el.classList.toggle('sm-on', isOn(it, hl));
      for (const b of L.bands) b.el.classList.toggle('sm-on', isOn(b, hl));
      if (legendEl) legendEl.querySelectorAll('.sm-lg').forEach((b) => b.classList.toggle('sm-on', b.getAttribute('data-sm-keys').split(' ').some((kk) => hl.includes(kk))));
      const names = [...new Set(hl.map((x) => x.split('@')[0]))].map((x) => AP[x] && AP[x].name).filter(Boolean);
      svg.setAttribute('aria-label', baseLabel + (names.length ? ' Highlighted: ' + names.join(', ') + '.' : ''));
      if (instant) { void svg.getBoundingClientRect(); requestAnimationFrame(() => svg.classList.remove('sm-notrans')); }
    }

    /* ───── hover / info ───── */
    /* the drawn off-SM bands for a key ('ext' = both) */
    function bandsOf(key) { return L && L.bands ? L.bands.filter((b) => key === 'ext' || b.key === key) : []; }
    function instsOf(key) { return BY[key] && BY[key].scope === 'ext' ? bandsOf(key) : (L.byKey[key] || []); }
    function applyHover() {
      if (!L) return;
      const hot = (it) => (!!hovKey && it.key === hovKey && (hovKey !== 'sp' || it === hovInst)) || (!!pinned && it.key === pinned && (pinned !== 'sp' || it === pinnedInst));
      for (const it of L.insts) it.el.classList.toggle('sm-hov', hot(it));
      for (const b of L.bands) b.el.classList.toggle('sm-hov', hovKey === b.key || pinned === b.key);
      for (const key in reps) if (reps[key]) reps[key].classList.toggle('sm-kf', key === focusKey && kbFocus);
    }
    function setHover(key, inst) {
      if (key === hovKey && inst === hovInst) return;
      hovKey = key; hovInst = inst || null;
      applyHover();
      emit('hover', key);
      renderInfo();
    }
    /* Docked panel (narrow, interactive): infoDock true = always, with an idle hint; false = never; 'auto'
       (default) = like true outside a figure; inside a figure, which has its own why line, no idle hint, and a
       selection that onPart / on('part') already reports to the page is not repeated under the drawing. */
    const hasHandler = () => !!o.onPart || !!(listeners.part && listeners.part.length);
    const inFigure = () => !!(root.closest && root.closest('figure') && root.closest('figure').querySelector('.fig-why'));
    function renderInfo() {
      if (!info) return;
      const key = hovKey || pinned;
      if (dock) {
        const mode = o.infoDock === 'auto' ? (inFigure() ? 'fig' : true) : o.infoDock;
        const show = mode === true || (mode === 'fig' && !!key && !(key === pinned && !hovKey && hasHandler()));
        info.hidden = !show;
        if (!show) { info.classList.remove('sm-show'); return; }
      } else info.hidden = false;
      if (!key) {
        info.classList.remove('sm-show');
        if (dock) info.innerHTML = hintHTML;
        return;
      }
      const p = AP[key];
      if (!p) return;
      const col = ROLE_VAR[p.role];
      const role = ROLE_NAME[p.role];
      const link = p.term ? `<span>Entry: <a data-term="${p.term}" href="#${p.term}" class="term">${GG.esc((GG.byId && GG.byId[p.term] && GG.byId[p.term].name) || p.termName)}</a></span>` : '<span></span>';
      const hint = pinned === key || !matchMedia('(hover: hover)').matches ? '' : '<small>click to pin</small>';
      info.style.setProperty('--c', col);
      info.innerHTML = (role ? `<div class="sm-info-role">${role}</div>` : '') + `<div class="sm-info-h"><i></i><b>${GG.esc(p.name)}</b></div>` +
        `<div class="sm-info-n">${GG.esc(p.count)}</div><p class="sm-info-d">${GG.esc(p.desc)}</p>` +
        (p.term || hint ? `<div class="sm-info-f">${link}${hint}</div>` : '');
      if (p.term) {
        const a = info.querySelector('a[data-term]');
        const t = GG.byId && GG.byId[p.term];
        if (a && t && GG.SECTIONS) a.style.setProperty('--c', (GG.SECTIONS[t.section] || {}).color || '');
      }
      info.classList.add('sm-show');
      if (!dock) placeInfo(key);
    }
    function placeInfo(key) {
      const inst = (hovKey === key && hovInst) ? hovInst : (pinned === key && pinnedInst) ? pinnedInst : (instsOf(key)[0] || null);
      if (!inst || !inst.el) return;
      const rr = root.getBoundingClientRect(), pr = inst.el.getBoundingClientRect();
      const pw = info.offsetWidth, ph = info.offsetHeight;
      const Lx = pr.left - rr.left, Rx = pr.right - rr.left, T = pr.top - rr.top, B = pr.bottom - rr.top;
      const W = rr.width, H = rr.height;
      let x, y;
      if (Rx + 12 + pw <= W) { x = Rx + 12; y = T; }
      else if (Lx - 12 - pw >= 0) { x = Lx - 12 - pw; y = T; }
      else {
        x = (Lx + Rx) / 2 - pw / 2;
        y = B + 10;
        if (y + ph > H - 4) y = T - ph - 10;
      }
      x = Math.max(4, Math.min(W - pw - 4, x));
      y = Math.max(4, Math.min(Math.max(4, H - ph - 4), y));
      info.style.left = Math.round(x) + 'px';
      info.style.top = Math.round(y) + 'px';
    }
    function select(key, inst) {
      if (!key) return;
      inst = inst || instsOf(key)[0] || null;
      if (pinned === key && inst === pinnedInst) { pinned = null; pinnedInst = null; applyHover(); renderInfo(); return; }
      pinned = key; pinnedInst = inst;
      applyHover();
      renderInfo();
      const p = AP[key];
      if (o.onPart) { try { o.onPart(key, p); } catch (e) { console.error('[sm] onPart', e); } }
      emit('part', key, p);
    }
    function unpin() { if (pinned) { pinned = null; pinnedInst = null; applyHover(); renderInfo(); } }

    let kbFocus = false, lastPointer = 0;
    function partFromEvent(e) {
      const g = e.target && e.target.closest ? e.target.closest('.sm-part') : null;
      if (!g || !svg.contains(g)) return [null, null];
      const key = g.getAttribute('data-part');
      const inst = BANDS.includes(key) ? bandsOf(key)[0] : L.insts.find((it) => it.el === g);
      return [key, inst];
    }

    if (o.interactive) {
      svg.addEventListener('pointerover', (e) => {
        if (e.pointerType === 'touch') return;
        const [key, inst] = partFromEvent(e);
        clearTimeout(hideT);
        if (key) setHover(key, inst);
      });
      svg.addEventListener('pointerout', (e) => {
        if (e.pointerType === 'touch') return;
        const to = e.relatedTarget;
        if (to && svg.contains(to) && to.closest && to.closest('.sm-part')) return;
        if (to && info && info.contains(to)) return;
        clearTimeout(hideT);
        hideT = setTimeout(() => setHover(null, null), 140);
      });
      if (info) {
        info.addEventListener('pointerenter', () => clearTimeout(hideT));
        info.addEventListener('pointerleave', (e) => {
          if (e.relatedTarget && svg.contains(e.relatedTarget)) return;
          clearTimeout(hideT);
          hideT = setTimeout(() => setHover(null, null), 140);
        });
      }
      svg.addEventListener('pointerdown', () => { lastPointer = performance.now(); });
      svg.addEventListener('click', (e) => {
        const [key, inst] = partFromEvent(e);
        if (!key) { unpin(); return; }
        if (e.pointerType === 'touch' || !matchMedia('(hover: hover)').matches) { hovKey = null; hovInst = null; }
        select(key, inst);
      });
      svg.addEventListener('focusin', (e) => {
        const [key] = partFromEvent(e);
        if (!key) return;
        kbFocus = performance.now() - lastPointer > 400;
        focusKey = key;
        for (const kk in reps) if (reps[kk]) reps[kk].setAttribute('tabindex', kk === key ? '0' : '-1');
        const inst = instsOf(key)[0];
        hovKey = null;
        setHover(key, inst);
      });
      svg.addEventListener('focusout', (e) => {
        if (e.relatedTarget && svg.contains(e.relatedTarget)) return;
        kbFocus = false;
        applyHover();
        if (!pinned) setHover(null, null);
      });
      svg.addEventListener('keydown', (e) => {
        const [key] = partFromEvent(e);
        if (!key) return;
        const i = order.indexOf(key);
        let j = -1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = Math.min(order.length - 1, i + 1);
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = Math.max(0, i - 1);
        else if (e.key === 'Home') j = 0;
        else if (e.key === 'End') j = order.length - 1;
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(key, instsOf(key)[0]); return; }
        else if (e.key === 'Escape') { pinned = null; pinnedInst = null; setHover(null, null); renderInfo(); return; }
        if (j >= 0) { e.preventDefault(); if (reps[order[j]]) reps[order[j]].focus(); }
      });
      if (legendEl) {
        legendEl.addEventListener('pointerover', (e) => {
          const b = e.target.closest('.sm-lg'); if (!b) return;
          const key = b.getAttribute('data-sm-keys').split(' ')[0];
          setHover(key, instsOf(key)[0]);
        });
        legendEl.addEventListener('pointerleave', () => { if (!pinned) setHover(null, null); });
        legendEl.addEventListener('focusin', (e) => { const b = e.target.closest('.sm-lg'); if (b) { const key = b.getAttribute('data-sm-keys').split(' ')[0]; setHover(key, instsOf(key)[0]); } });
        legendEl.addEventListener('focusout', () => { if (!pinned) setHover(null, null); });
        legendEl.addEventListener('click', (e) => {
          const b = e.target.closest('.sm-lg'); if (!b) return;
          const key = b.getAttribute('data-sm-keys').split(' ')[0];
          select(key, instsOf(key)[0]);
        });
      }
    } else if (legendEl) {
      legendEl.addEventListener('pointerover', (e) => { const b = e.target.closest('.sm-lg'); if (b) { hovKey = b.getAttribute('data-sm-keys').split(' ')[0]; applyHover(); } });
      legendEl.addEventListener('pointerleave', () => { hovKey = null; applyHover(); });
    }
    const onDocDown = (e) => { if (pinned && !root.contains(e.target)) unpin(); };
    if (o.interactive) document.addEventListener('pointerdown', onDocDown, true);

    /* ───── flows ───── */
    function ensureAnim() {
      if (!anim) anim = GG.anim(svg, tick, { autostart: false });
      const want = flows.some((f) => f.running);
      if (want && !anim.running) anim.start();
      else if (!want && anim.running) anim.stop();
    }
    function mountFlow(f) {
      const slot = flows.indexOf(f) % 3;
      const rs = routes(L, f.from, f.to, f.sub, [0, -6, 6][slot]);
      f.paths = rs.map(prepPath).filter((p) => p.len > 0);
      if (f.g) f.g.remove();
      if (f.wg) f.wg.remove();
      f.g = S('g', { class: 'sm-flow', style: `--fc:${f.color}` }, L.flowLayer);
      f.wg = S('g', { class: 'sm-flow', style: `--fc:${f.color}` }, L.wireLayer);
      f.arrows = [];
      f.mids = [];
      f.dots = [];
      for (const P of f.paths) {
        P.el = S('path', { class: 'sm-fpath', d: 'M' + P.pts.map((q) => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('L') }, f.wg);
        f.arrows.push(S('path', { class: 'sm-farrow' }, f.g));
        f.mids.push(S('path', { class: 'sm-fmid' }, f.g));
        const ds = [];
        for (let i = 0; i < f.n; i++) ds.push(S('circle', { class: 'sm-dot', r: 3 }, f.g));
        f.dots.push(ds);
      }
      sizeFlow(f);
      drawFlowStatic(f);
    }
    function sizeFlow(f) {
      if (!f.paths) return;
      const r = 3.2 * k, a = 6.5 * k;
      const tri = (e, ux, uy, a) => {
        const bx = e[0] - ux * a * 1.6, by = e[1] - uy * a * 1.6;
        return `M${e[0].toFixed(1)} ${e[1].toFixed(1)}L${(bx - uy * a).toFixed(1)} ${(by + ux * a).toFixed(1)}L${(bx + uy * a).toFixed(1)} ${(by - ux * a).toFixed(1)}Z`;
      };
      f.paths.forEach((P, i) => {
        const n = P.pts.length, e = P.pts[n - 1], s = P.pts[n - 2] || P.pts[0];
        const dx = e[0] - s[0], dy = e[1] - s[1], m = Math.hypot(dx, dy) || 1;
        f.arrows[i].setAttribute('d', tri(e, dx / m, dy / m, a));
        // a second, smaller chevron halfway along the longest leg shows the direction even when the dots are still
        let best = -1, bl = 0;
        for (let j = 1; j < n; j++) { const l = Math.hypot(P.pts[j][0] - P.pts[j - 1][0], P.pts[j][1] - P.pts[j - 1][1]); if (l > bl) { bl = l; best = j; } }
        if (best > 0 && bl > 44 * k && P.len > 90 * k) {
          const p0 = P.pts[best - 1], p1 = P.pts[best], ux = (p1[0] - p0[0]) / bl, uy = (p1[1] - p0[1]) / bl;
          const am = a * 0.8, mid = [(p0[0] + p1[0]) / 2 + ux * am * 0.8, (p0[1] + p1[1]) / 2 + uy * am * 0.8];
          f.mids[i].setAttribute('d', tri(mid, ux, uy, am));
        } else f.mids[i].setAttribute('d', '');
        f.dots[i].forEach((c) => c.setAttribute('r', r.toFixed(2)));
      });
    }
    function placeDots(f, t, spread) {
      const speed = f.speed * k;
      let alive = false;
      f.paths.forEach((P, pi) => {
        const ds = f.dots[pi];
        // short wires carry fewer particles so they never bunch up into beads
        const n = f.once ? f.n : Math.max(1, Math.min(f.n, Math.floor(P.len / (30 * k))));
        for (let i = n; i < ds.length; i++) ds[i].setAttribute('opacity', '0');
        for (let i = 0; i < n; i++) {
          let d;
          if (f.once && !spread) {
            const gap = Math.min(P.len / Math.max(1, n), 16 * k);
            d = t * speed - i * gap;
            if (d < 0 || d > P.len) { ds[i].setAttribute('opacity', '0'); if (d < 0) alive = true; continue; }
            alive = true;
          } else d = ((t * speed + (i * P.len) / n) % P.len + P.len) % P.len;
          const q = pointAt(P, d), u = d / P.len;
          const fade = Math.min(1, u / 0.1, (1 - u) / 0.1);
          ds[i].setAttribute('cx', q[0].toFixed(1));
          ds[i].setAttribute('cy', q[1].toFixed(1));
          ds[i].setAttribute('opacity', Math.max(0, fade).toFixed(2));
        }
      });
      return alive;
    }
    /* The off-SM strip lights up (and is never dimmed) while a flow starts or ends on it. */
    function markFlowEnds() {
      if (!L || !L.bands.length) return;
      // a flow to GPU RAM ('ram' or 'ext') crosses the L2 band, so it lights both; one to 'l2' only the L2 band
      const lit = new Set();
      const mark = (x) => { const b0 = String(x).split('@')[0], b = ALIAS[b0] || b0; if (b === 'l2') lit.add('l2'); else if (b === 'ram' || b === 'ext') { lit.add('l2'); lit.add('ram'); } };
      flows.forEach((f) => { mark(f.from); mark(f.to); });
      for (const b of L.bands) b.el.classList.toggle('sm-fend', lit.has(b.key));
      (L.ports || []).forEach((p) => p.classList.toggle('sm-fend', lit.size > 0));
    }
    function drawFlowStatic(f) { if (f.paths && !f.running) placeDots(f, f.t || 0.0001, f.once && !f.t); }
    function tick(time, dt) {
      for (const f of flows.slice()) {
        if (!f.running) continue;
        f.t += dt;
        const alive = placeDots(f, f.t);
        if (f.once && !alive) { f.stop(); if (f.onDone) { try { f.onDone(); } catch (e) { console.error('[sm] onDone', e); } } }
      }
    }
    function flow(from, to, fo) {
      fo = fo || {};
      const [fk] = String(from).split('@');
      const srcKey = ALIAS[fk] || fk;
      const [tk] = String(to).split('@');
      const dstKey = ALIAS[tk] || tk;
      const dflt = BY[srcKey] && BY[srcKey].scope !== 'ext' ? ROLE_VAR[BY[srcKey].role] : BY[dstKey] ? ROLE_VAR[BY[dstKey].role] : 'var(--accent)';
      const f = {
        from, to, sub: fo.sub, color: colorOf(fo.color) || dflt,
        n: Math.max(1, Math.min(40, fo.dots | 0 || 5)), speed: +fo.speed > 0 ? +fo.speed : 120,
        once: !!fo.once, onDone: fo.onDone, t: 0, running: false,
      };
      flows.push(f);
      if (L) { mountFlow(f); markFlowEnds(); }
      const stop = () => {
        const i = flows.indexOf(f);
        if (i >= 0) flows.splice(i, 1);
        f.running = false;
        if (f.g) f.g.remove();
        if (f.wg) f.wg.remove();
        markFlowEnds();
        ensureAnim();
      };
      stop.play = () => { if (flows.includes(f)) { f.running = true; ensureAnim(); } return stop; };
      stop.pause = () => { f.running = false; ensureAnim(); drawFlowStatic(f); return stop; };
      Object.defineProperty(stop, 'running', { get: () => f.running });
      f.stop = stop;
      if (!GG.reducedMotion || fo.animate) stop.play();
      else if (f.once) { /* static burst: show it, then clean up after a moment */ setTimeout(() => { if (flows.includes(f) && !f.running) { stop(); if (f.onDone) f.onDone(); } }, 1200); }
      return stop;
    }

    /* ───── pulse ───── */
    function pulse(keys, po) {
      po = po || {};
      if (!L) return;
      const set = expand(keys), ms = +po.ms > 0 ? +po.ms : 700, col = colorOf(po.color);
      const els = L.insts.filter((it) => it.key !== 'sp' && isOn(it, set)).map((it) => it.el);
      for (const b of L.bands) if (isOn(b, set)) els.push(b.el);
      for (const el of els) {
        el.classList.remove('sm-pulse');
        if (col) el.style.setProperty('--pc', col); else el.style.removeProperty('--pc');
        void el.getBoundingClientRect();
        el.classList.add('sm-pulse');
        clearTimeout(el._smPulse);
        el._smPulse = setTimeout(() => el.classList.remove('sm-pulse'), ms);
      }
    }

    /* ───── api ───── */
    const api = {
      el: root, svg, PARTS: A.PARTS, byKey: AP, TOTALS: A.TOTALS, arch: A.id,
      highlight(keys, ho) { hl = own(expand(keys)); dotsOn = !!(ho && ho.dots); applyHL(!!(ho && ho.instant)); emit('highlight', hl.slice()); return api; },
      clear() { hl = []; dotsOn = false; applyHL(false); emit('highlight', []); return api; },
      pulse(keys, po) { pulse(keys, po); return api; },
      flow,
      stopFlows() { flows.slice().forEach((f) => f.stop()); return api; },
      info(key) {
        if (!o.interactive) return api;
        if (key == null) { pinned = null; pinnedInst = null; setHover(null, null); renderInfo(); return api; }
        const a = expand(key)[0];
        if (!a) return api;
        const base = a.split('@')[0], s = a.split('@')[1];
        if (!AP[base]) return api;
        const inst = instsOf(base).find((it) => s == null || String(it.sub) === s) || instsOf(base)[0];
        pinned = base; pinnedInst = inst || null; applyHover(); renderInfo();
        return api;
      },
      partEl(key, sub) {
        if (!L) return null;
        const base = ALIAS[key] || key;
        if (!BY[base] || GROUPS[base]) return null;
        const list = instsOf(base);
        const it = sub == null ? list[0] : list.find((x) => x.sub === +sub);
        return it ? it.el : null;
      },
      partEls(key) { if (!L) return []; const base = ALIAS[key] || key; return BY[base] ? instsOf(base).map((it) => it.el) : []; },
      keys: () => hl.slice(),
      on(ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); return () => { listeners[ev] = (listeners[ev] || []).filter((x) => x !== fn); }; },
      destroy() {
        flows.slice().forEach((f) => f.stop());
        if (anim) anim.stop();
        if (ro && ro.disconnect) ro.disconnect();
        document.removeEventListener('pointerdown', onDocDown, true);
        clearTimeout(hideT);
        root.remove();
        for (const kk in listeners) delete listeners[kk];
      },
    };

    // first build at the current width, then track resizes
    // Build from a viewport guess without forcing a synchronous layout (many instances are created during
    // boot); the ResizeObserver's first callback runs after layout and before paint, measures, and corrects.
    fine = !o.compact && (window.innerWidth || 1024) >= (o.focus === 'sub' ? 360 : 700);
    build();
    k = fine ? 1.4 : 3;
    setFontVars();
    if (info) renderInfo();
    const ro = GG.resize(root, decide);
    return api;
  }

  sm.PARTS = PARTS;
  sm.byKey = BY;
  sm.GROUPS = GROUPS;
  sm.TOTALS = TOTALS;
  sm.expand = expand;
  sm.ARCHS = ARCHS;
  GG.components.sm = sm;
})();
