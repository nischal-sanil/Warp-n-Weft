/* components/cycles.js — GG.components.cycles
   Warp slots × clock cycles grid with warp execution states (active / stalled / eligible / selected),
   an issue-slot row, per-mode highlighting, a cycle-by-cycle animation and a deterministic simulator.

   ─────────────────────────────── API ───────────────────────────────

   const cy = GG.components.cycles(target, opts)

   target   A figure object from ctx.figure()/GG.ui.figure() (recommended: grid + legend go in figure.stage,
            buttons in figure.controls, stat chips in figure.readouts, the live sentence in figure.setWhy),
            or any element (everything is appended inside it). You can also pass an element + opts.figure.

   opts (all optional)
     scenario     'default' (the glossary's diagram, see DEFAULT) or a custom description:
                    { slots, cycles, cells, cycleLabels?, slotLabels?, notes? }
                    cells[slot][cycle] is one of
                      null | '' | 'unused'            no active warp in that slot on that cycle
                      'OP:state'                      e.g. 'LDS:stalled', 'EX2:selected'
                      { op, state, note?, long?, issuedAt?, ready? }
                                                      state: 'stalled' | 'eligible' | 'selected'.
                                                      Optional latency bookkeeping (simulate() fills it in):
                                                      long: true marks a long-latency instruction; on a selected
                                                      long box, issuedAt = its cycle and ready = the cycle its warp
                                                      can issue again; on a stalled box, the same two numbers for
                                                      the long instruction it waits for. Hovering such a box
                                                      outlines the wait and names the instruction and latency.
                    'selected' implies eligible; every non-empty cell is active. Put at most one selected
                    cell per cycle (one warp scheduler issues at most one instruction per cycle); the issue row
                    shows the selected cell's op. notes: { 'slot,cycle': html } (0-based) extra explanations.
                    cycleLabels default: 'n', 'n + 1', … (≤ 8 cycles) or '0', '1', …; slotLabels: '1', '2', …
     simulate     params object (see simulate below): start from a simulated scenario instead.
     mode         'states' (default): state colours; hover/tap/arrow-key a box to see which adjectives apply and why.
                  'active'   : tints active cycles (cycles with ≥ 1 active warp). Default scenario: 4 of 4.
                  'occupancy': recolours every box holding an active warp green and counts them up
                               (animated once when first visible; instant under reduced motion).
                               Default: 15 of 16 = 93.75 % ≈ 94 %.
                  'issue'    : highlights cycles whose issue slot got an instruction; idle ones in red.
                               Default: 3 of 4 = 75 %.
     showModes    false (default): add a segmented control for the four modes.
     animate      false (default): a cycle cursor sweeps left to right; each selected instruction travels
                  down into its issue slot, fading out while it crosses other warps' boxes (its label leaves the
                  box while it travels; the destination tray is
                  outlined; the tray fills and the why-line says "… issues" when it lands, on the same frame).
                  Autoplays (looping) while visible, except under reduced motion. While playing, the why-line's
                  aria-live is set to "off" so screen readers are not interrupted every cycle; "polite" when paused.
                  Adds ◀ ▶ step buttons, Play/Pause and "All" (show every cycle at once) to the controls.
                  Under reduced motion it starts on the complete static frame; the buttons still work.
     stepMs       ms per cycle when animating (default 1100; 260 for dense grids).
     showReadouts true (default): stat chips — Active cycles, Occupancy, Issue efficiency, Eligible / cycle
                  (the per-cycle list for ≤ 8 cycles, else the average). All computed from the scenario.
                  While occupancy mode counts up, the Occupancy chip reads 'counting… k/N' until the count ends.
                  Simulated grids whose slot count is neither 16 (one H100 warp scheduler) nor 64 (one SM) label
                  it 'Occupancy · of N slots' (a scaled-down model), and the why-line says so too.
     occupancyLabel  string (optional, added): label for the Occupancy chip, overriding the above.
     showLegend   true (default): legend of the states; hover/focus/tap an entry to highlight every box in
                  that state and read the glossary's definition in the why-line. The counts partition the grid:
                  Stalled + Eligible (not selected) + Selected = Active. In occupancy mode the legend collapses to
                  Active (counted) and Unused. Dense simulated grids add an '<long op> issued' entry (a subset of
                  Selected; its swatch shows only the marker, not a second pink chip).
     showWhy      true (default): live sentence describing the mode, the hovered box, or the animated cycle.
     why          function(info) → html, overrides the why-line (return null to keep the default).
                  info = { mode, metrics, scenario, cell|null, slot|null, cycle|null, step|null }
     simControls  false (default): add sliders (Active warps 0–slots, Latency 1–32 cycles, Instructions per LDG
                  1–8 = issueEvery) that re-run the simulator. Starts from opts.simulate (slots default 16 here).
     fit          true (default): a dense grid wider than the stage shrinks its cycles down to a 4px pitch to fit
                  (so 72 cycles fit a phone); false keeps a 9px minimum pitch and scrolls sideways.
     interactive  true (default): hover/tap/keyboard cell inspection. The grid is one tab stop: arrow keys move
                  between boxes, Home/End jump to the first/last cycle, Esc clears. Hovering an issue slot or a
                  cycle label explains that cycle; hovering a slot number summarises that slot.

   Visual code (site tokens): stalled = amber fill + outline (--control); eligible = blue (--memory);
   selected = pink box (--special) inside a blue eligible outline; active = thin green outline ring (--core)
   around every box that holds a warp; unused = dashed empty box. Issue slots are open-topped trays; a
   selected hover also rings its issue slot. Grids with > 8 slots or > 8 cycles switch to a compact
   "dense" rendering (labels thinned, with a tick per cycle; horizontal scroll if it cannot fit). Dense
   grids (which shrink to fit, see fit) mark an active slot with a green bar beside its number, print each selected instruction (its full
   name, or its first letter when boxes are small; nothing below 10px) and give long-latency issues
   (cell.long) a light outline; pink there means selected/issued only (the legend's Selected swatch is the
   same solid pink) and idle issue slots are hollow red outlines. Phones (< 470px) with ≥ 7 cycles drop
   the slot boxes for plain numbers so 4-letter mnemonics fit at 10px; the cycle tints and the cursor never cover the slot header.

   Returns api:
     api.el, api.svg
     api.setMode(m)            'states' | 'active' | 'occupancy' | 'issue'
     api.setScenario(s)        'default' or a scenario object (as above)
     api.simulate(params)      generate + display a simulated scenario; returns it (see below)
     api.step(dir=1)           move the animation cursor one cycle (-1 to go back); pauses playback.
                               Adds the cycle controls if animate was off.
     api.play(), api.pause()   control the sweep (play() also works when animate was off, and adds the controls)
     api.metrics()             → metrics of the current scenario (see below)
     api.scenario()            → the current (normalised) scenario
     api.on('cell', fn)        fn({slot, cycle, cell, states:{active,stalled,eligible,selected,unused}, pinned})
                               on hover/focus/tap of a box; fn(null) when the pointer leaves
     api.on('step', fn)        fn({cycle, issued}) each time the animation cursor moves
     api.on('mode', fn)        fn(mode)
     api.off(ev, fn)
     api.destroy()

   Statics on GG.components.cycles:
     DEFAULT      the glossary's 4 × 4 scenario:
                    slot 1: MMA stalled on n … n+3
                    slot 2: LDS stalled on n, n+1, n+2; eligible + selected on n+3
                    slot 3: EX2 eligible + selected on n; ADD stalled on n+1 … n+3
                    slot 4: RET eligible (not selected) on n; RET selected on n+1; unused on n+2 (the warp
                            exited); LDG stalled on n+3 (a new warp arrived)
                    issue slots: EX2, RET, (nothing), LDS
     metrics(scenario) → { slots, cycles, totalCells, activeCells, unusedCells, stalledCells, eligibleCells
                    (includes the selected ones), eligibleOnlyCells (eligible, not selected), selectedCells,
                    longIssued (selected boxes with cell.long), activeCycles, inactiveCycles[], idleCycles[] (active but nothing issued),
                    issuedCycles, occupancy (activeCells ÷ (slots × activeCycles): achieved occupancy on active
                    cycles), occupancyAll (÷ all cycles), issueEfficiency (issuedCycles ÷ activeCycles),
                    eligibleAvg, activeWarpsAvg, activePerCycle[], stalledPerCycle[], eligiblePerCycle[]
                    (selected counts as eligible), selectedPerCycle[], issued[] (op or null per cycle),
                    unused[] ([slot, cycle] pairs) }
                  DEFAULT → activeCycles 4, activeCells 15 of 16, occupancy 0.9375, issueEfficiency 0.75,
                  eligiblePerCycle [2, 1, 0, 1].
     simulate(params) → scenario (with .meta), deterministic:
                    { warps = 4        active warps, occupying slots 1 … warps
                      slots = max(warps, 8)   warp slots drawn (the maximum resident warps)
                      latency = 8      cycles from issuing a long-latency instruction (e.g. LDG) until the
                                       warp's next, dependent instruction can issue (the warp is stalled for
                                       latency − 1 cycles in between)
                      issueEvery = 1   every issueEvery-th instruction of a warp is long-latency; the others
                                       (FFMA) let the warp issue again on the next cycle
                      cycles = 32
                      jitter = 0       extra 0 … jitter cycles added to each long latency (seeded PRNG)
                      seed = 1
                      ops = { long: 'LDG', short: 'FFMA' } }
                    One warp scheduler issues ≤ 1 instruction per cycle, greedy-then-oldest: it keeps issuing from
                    the warp it picked last cycle while that warp stays eligible, otherwise it picks the eligible warp
                    that has been ready longest (ties: least recently issued, then lowest slot). All warps are ready
                    on cycle 0. Steady-state issue efficiency = min(1, warps × issueEvery ÷ (issueEvery − 1 + latency))
                    (meta.steady; the measured value over a finite run can differ slightly because of the start-up),
                    so hiding latency L at one instruction per cycle takes L warps when issueEvery = 1 (Little's law).
                    meta = { warps, slots, latency, issueEvery, cycles, jitter, seed, ops, warpsNeeded, steady }
                    Cells carry long / issuedAt / ready (see scenario cells above).
     normalize(scenario) → the normalised form used internally (cells as {op, state, note} | null)
     fmtPct(x, d = 1)  fixed precision: '93.8%', '75.0%', '33.3%' (d decimals)
*/
(function () {
  'use strict';
  const GG = window.GG;
  if (!GG) return;

  /* ───────────── scenario model ───────────── */
  const STATES = ['stalled', 'eligible', 'selected'];

  const DEFAULT = Object.freeze({
    slots: 4,
    cycles: 4,
    cycleLabels: ['n', 'n + 1', 'n + 2', 'n + 3'],
    slotLabels: ['1', '2', '3', '4'],
    cells: [
      ['MMA:stalled', 'MMA:stalled', 'MMA:stalled', 'MMA:stalled'],
      ['LDS:stalled', 'LDS:stalled', 'LDS:stalled', 'LDS:selected'],
      ['EX2:selected', 'ADD:stalled', 'ADD:stalled', 'ADD:stalled'],
      ['RET:eligible', 'RET:selected', null, 'LDG:stalled'],
    ],
    notes: {
      '0,0': 'It stays stalled on all four cycles shown, holding its slot without ever becoming ready. Long-running Tensor Core work can keep a warp waiting like this: <code>HMMA</code> instructions can run for dozens of cycles.',
      '0,2': 'On this cycle no warp in any slot is eligible.',
      '1,2': 'Every active warp is stalled on this cycle, so nothing issues.',
      '1,3': 'After three stalled cycles, whatever held it back has cleared.',
      '2,0': 'Two warps are eligible on cycle n, this one and slot 4\'s; the scheduler picks this one.',
      '2,1': 'The warp stays stalled for the rest of the diagram.',
      '3,0': 'It gets its turn on the next cycle.',
      '3,1': 'It is the only eligible warp this cycle.',
      '3,2': 'Its warp exited on the previous cycle: this is the only one of the 16 slot-cycles without an active warp.',
      '3,3': 'A new warp has arrived in the freed slot, so the slot holds an active warp again.',
    },
  });

  const OPS = {
    MMA: 'a matrix multiply-accumulate on the Tensor Cores',
    HMMA: 'a half-precision matrix multiply-accumulate on the Tensor Cores',
    LDS: 'a load from shared memory',
    STS: 'a store to shared memory',
    LDG: 'a load from global memory',
    STG: 'a store to global memory',
    EX2: 'a base-2 exponential, computed by the SFU (MUFU.EX2 in SASS)',
    ADD: 'an addition',
    FADD: 'a floating-point addition',
    IADD: 'an integer addition',
    FFMA: 'a fused multiply-add on the CUDA Cores',
    FMUL: 'a floating-point multiply',
    RET: 'a return: the warp\'s threads exit the kernel',
    BAR: 'a barrier synchronization',
  };
  const opDesc = (op) => OPS[String(op).toUpperCase()] || OPS[String(op).split('.')[0].toUpperCase()] || null;

  function normCell(x) {
    if (x == null || x === '' || x === 'unused' || x === false) return null;
    if (typeof x === 'string') {
      const i = x.lastIndexOf(':');
      const op = i >= 0 ? x.slice(0, i).trim() : x.trim();
      let st = i >= 0 ? x.slice(i + 1).trim().toLowerCase() : 'stalled';
      if (!STATES.includes(st)) st = 'stalled';
      return { op, state: st, note: null };
    }
    const st = STATES.includes(String(x.state).toLowerCase()) ? String(x.state).toLowerCase() : 'stalled';
    const out = { op: x.op != null ? String(x.op) : '', state: st, note: x.note || null };
    // optional latency bookkeeping (written by simulate()): long = this is a long-latency instruction;
    // issuedAt/ready = the cycle a long instruction issued and the cycle its warp can issue again
    if (x.long) out.long = true;
    if (x.issuedAt != null && x.ready != null) { out.issuedAt = +x.issuedAt; out.ready = +x.ready; }
    return out;
  }

  function normScenario(sc) {
    if (!sc || sc === 'default') sc = DEFAULT;
    if (sc.__norm) return sc;
    const rows = sc.cells || [];
    const slots = Math.max(0, sc.slots != null ? sc.slots | 0 : rows.length);
    const cycles = Math.max(0, sc.cycles != null ? sc.cycles | 0 : Math.max(0, ...rows.map((r) => (r ? r.length : 0))));
    const cells = [];
    for (let s = 0; s < slots; s++) {
      const row = [];
      for (let c = 0; c < cycles; c++) row.push(normCell(rows[s] && rows[s][c]));
      cells.push(row);
    }
    const notes = Object.assign({}, sc.notes || {});
    cells.forEach((row, s) => row.forEach((cell, c) => { if (cell && cell.note) notes[s + ',' + c] = cell.note; }));
    const cycleLabels = (sc.cycleLabels && sc.cycleLabels.length >= cycles)
      ? sc.cycleLabels.map(String)
      : Array.from({ length: cycles }, (_, c) => (cycles <= 8 ? (c === 0 ? 'n' : 'n + ' + c) : String(c)));
    const slotLabels = (sc.slotLabels && sc.slotLabels.length >= slots) ? sc.slotLabels.map(String) : Array.from({ length: slots }, (_, s) => String(s + 1));
    const cycleNames = cycleLabels.map((t) => t.replace(/ /g, '\u00a0')); // for prose: never break 'n + 2'
    return { __norm: true, slots, cycles, cells, notes, cycleLabels, cycleNames, slotLabels, meta: sc.meta || null, isDefault: sc === DEFAULT };
  }

  function metrics(scIn) {
    const sc = normScenario(scIn);
    const { slots, cycles, cells } = sc;
    const per = (fn) => Array.from({ length: cycles }, (_, c) => { let n = 0; for (let s = 0; s < slots; s++) if (fn(cells[s][c])) n++; return n; });
    const activePerCycle = per((x) => !!x);
    const stalledPerCycle = per((x) => x && x.state === 'stalled');
    const eligiblePerCycle = per((x) => x && (x.state === 'eligible' || x.state === 'selected'));
    const selectedPerCycle = per((x) => x && x.state === 'selected');
    const sum = (a) => a.reduce((p, q) => p + q, 0);
    const activeCycles = activePerCycle.filter((n) => n > 0).length;
    const activeCells = sum(activePerCycle);
    const issued = Array.from({ length: cycles }, (_, c) => { for (let s = 0; s < slots; s++) { const x = cells[s][c]; if (x && x.state === 'selected') return x.op; } return null; });
    const issuedCycles = selectedPerCycle.filter((n) => n > 0).length;
    const inactiveCycles = [], idleCycles = [], unused = [];
    for (let c = 0; c < cycles; c++) {
      if (!activePerCycle[c]) inactiveCycles.push(c);
      else if (!selectedPerCycle[c]) idleCycles.push(c);
      for (let s = 0; s < slots; s++) if (!cells[s][c]) unused.push([s, c]);
    }
    return {
      slots, cycles, totalCells: slots * cycles,
      activeCells, unusedCells: slots * cycles - activeCells,
      stalledCells: sum(stalledPerCycle), eligibleCells: sum(eligiblePerCycle), selectedCells: sum(selectedPerCycle),
      eligibleOnlyCells: sum(eligiblePerCycle) - sum(selectedPerCycle),
      longIssued: issuedLong(cells, slots, cycles),
      activeCycles, inactiveCycles, idleCycles, issuedCycles,
      occupancy: activeCycles ? activeCells / (slots * activeCycles) : 0,
      occupancyAll: slots * cycles ? activeCells / (slots * cycles) : 0,
      issueEfficiency: activeCycles ? issuedCycles / activeCycles : 0,
      eligibleAvg: activeCycles ? sum(eligiblePerCycle) / activeCycles : 0,
      activeWarpsAvg: activeCycles ? activeCells / activeCycles : 0,
      activePerCycle, stalledPerCycle, eligiblePerCycle, selectedPerCycle, issued, unused,
    };
  }

  function issuedLong(cells, slots, cycles) {
    let n = 0;
    for (let s = 0; s < slots; s++) for (let c = 0; c < cycles; c++) { const x = cells[s][c]; if (x && x.long && x.state === 'selected') n++; }
    return n;
  }

  /* deterministic PRNG (mulberry32) */
  function prng(seed) {
    let a = (seed >>> 0) || 1;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function simulate(p) {
    const P = Object.assign({ warps: 4, slots: null, latency: 8, issueEvery: 1, cycles: 32, jitter: 0, seed: 1 }, p || {});
    const ops = Object.assign({ long: 'LDG', short: 'FFMA' }, (p && p.ops) || {});
    const clampI = (v, a, b) => Math.max(a, Math.min(b, Math.round(+v || 0)));
    const warps0 = clampI(P.warps, 0, 64);
    const slots = clampI(P.slots != null ? P.slots : Math.max(warps0, 8), 1, 64);
    const warps = Math.min(warps0, slots);
    const latency = clampI(P.latency, 1, 1000);
    const every = clampI(P.issueEvery, 1, 64);
    const cycles = clampI(P.cycles, 1, 256);
    const jitter = clampI(P.jitter, 0, 1000);
    const rnd = prng(clampI(P.seed, 1, 2 ** 31));
    const isLong = (i) => i % every === every - 1;
    const W = Array.from({ length: warps }, () => ({ i: 0, readyAt: 0, last: -Infinity, waitAt: -1 }));
    const cells = Array.from({ length: slots }, () => Array(cycles).fill(null));
    let prevPick = -1;
    for (let t = 0; t < cycles; t++) {
      // greedy: keep issuing from last cycle's warp while it stays eligible
      let pick = prevPick >= 0 && W[prevPick].readyAt <= t ? prevPick : -1;
      const greedy = pick >= 0;
      // otherwise oldest: the eligible warp that has been ready longest
      for (let w = 0; w < warps && !greedy; w++) {
        const q = W[w];
        if (q.readyAt > t) continue;
        if (pick < 0) { pick = w; continue; }
        const b = W[pick];
        if (q.readyAt < b.readyAt || (q.readyAt === b.readyAt && q.last < b.last)) pick = w;
      }
      for (let w = 0; w < warps; w++) {
        const q = W[w];
        const long = isLong(q.i);
        const cell = { op: long ? ops.long : ops.short, state: w === pick ? 'selected' : q.readyAt <= t ? 'eligible' : 'stalled', note: null };
        if (long) cell.long = true;
        // a stalled warp here is always waiting on the long instruction it issued last
        if (cell.state === 'stalled' && q.waitAt >= 0) { cell.issuedAt = q.waitAt; cell.ready = q.readyAt; }
        cells[w][t] = cell;
      }
      if (pick >= 0) {
        const q = W[pick];
        const long = isLong(q.i);
        const lat = long ? latency + (jitter ? Math.floor(rnd() * (jitter + 1)) : 0) : 1;
        q.last = t;
        q.readyAt = t + lat;
        if (long) { q.waitAt = t; cells[pick][t].issuedAt = t; cells[pick][t].ready = t + lat; }
        q.i++;
      }
      prevPick = pick;
    }
    const period = every - 1 + latency;
    const meta = {
      warps, slots, latency, issueEvery: every, cycles, jitter, seed: P.seed, ops,
      warpsNeeded: Math.ceil(period / every),
      steady: Math.min(1, (warps * every) / period),
    };
    return { slots, cycles, cells, meta, cycleLabels: Array.from({ length: cycles }, (_, c) => String(c)) };
  }

  // one fixed precision everywhere (readouts and prose): '93.8%', '75.0%', '33.3%'
  const fmtPct = (x, d = 1) => (isFinite(x) ? (x * 100).toFixed(d) + '%' : '—');
  // the result of an 'a ÷ b' equation in prose: '= <b>93.75%</b>' / '= <b>75%</b>' when exact to two decimals,
  // else '≈ <b>33.3%</b>'
  const pctExact = (x) => isFinite(x) && Math.abs(x * 1e4 - Math.round(x * 1e4)) < 1e-6;
  const eqPct = (x) => (!isFinite(x) ? '= <b>—</b>' : pctExact(x) ? `= <b>${+(x * 100).toFixed(2)}%</b>` : `≈ <b>${(x * 100).toFixed(1)}%</b>`);

  /* ───────────── css ───────────── */
  let cssDone = false;
  function injectCSS() {
    if (cssDone) return;
    cssDone = true;
    GG.css(`
.cy { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; min-width: 0; }
.cy.side { grid-template-columns: minmax(0, 1fr) auto; align-items: start; gap: 20px; }
.cy-sv { min-width: 0; }
.cy-sv.scroll-x { padding-bottom: 4px; }
.cy-svg { display: block; max-width: none; overflow: visible; -webkit-user-select: none; user-select: none; -webkit-tap-highlight-color: transparent; outline: none; }
.fig-stage .cy-svg { width: auto; max-width: none; }
.cy-svg:not(.dense) { margin: 0 auto; }
.cy-svg text { font-family: var(--font-mono); }
.cy-svg:focus-visible .cy-focus { stroke-width: 2.5; }
.cy-svg .cy-h { font-size: 12px; fill: var(--ink-2); letter-spacing: 0.06em; }
.cy-svg .cy-cl { font-size: 12px; fill: var(--ink-2); font-variant-numeric: tabular-nums; }
.cy-svg .cy-cl.act { fill: var(--core); font-weight: 600; }
.cy-svg .cy-arrow { stroke: var(--ink-3); stroke-width: 1.25; fill: none; }
.cy-svg .cy-arrowhead { fill: var(--ink-3); }
.cy-svg .cy-slotbox { fill: rgba(8, 9, 14, 0.5); stroke: var(--line-2); stroke-width: 1.25; }
.cy-svg .cy-sl { font-size: 13px; fill: var(--ink-2); font-variant-numeric: tabular-nums; }
.cy-svg .cy-band { fill: transparent; stroke: none; transition: fill 0.25s; }
.cy-svg .cy-cell { transition: opacity 0.2s; }
.cy-svg .cy-box { stroke-width: 1.5; transition: fill 0.25s, stroke 0.25s; }
.cy-svg .cy-inner { fill: var(--special-a); stroke: var(--special); stroke-width: 1.5; display: none; }
.cy-svg .cy-ring { fill: none; stroke: var(--core); stroke-width: 1.25; opacity: 0.55; }
.cy-svg .cy-op { font-size: 14px; font-weight: 500; letter-spacing: 0.04em; transition: fill 0.25s, opacity 0.2s; }
.cy-svg .cy-cell.fly .cy-op { opacity: 0; transition: none; }
.cy-svg .cy-num { font-size: 10px; fill: var(--core); font-weight: 600; opacity: 0; font-variant-numeric: tabular-nums; }
.cy-svg [data-s="stalled"] .cy-box { fill: rgba(255, 198, 92, 0.12); stroke: var(--control); }
.cy-svg [data-s="stalled"] .cy-op { fill: var(--control); }
.cy-svg [data-s="eligible"] .cy-box { fill: rgba(111, 166, 255, 0.2); stroke: var(--memory); stroke-width: 2; }
.cy-svg [data-s="eligible"] .cy-op { fill: var(--memory); }
.cy-svg [data-s="selected"] .cy-box { fill: rgba(111, 166, 255, 0.10); stroke: var(--memory); stroke-width: 2; }
.cy-svg [data-s="selected"] .cy-inner { display: inline; }
.cy-svg [data-s="selected"] .cy-op { fill: var(--special); }
.cy-svg [data-s="unused"] .cy-box { fill: transparent; stroke: var(--line-2); stroke-dasharray: 4 4; }
.cy-svg [data-s="unused"] .cy-ring { display: none; }
.cy-svg.dense .cy-box { stroke-width: 0; }
.cy-svg.dense [data-s="stalled"] .cy-box { fill: rgba(255, 198, 92, 0.5); }
.cy-svg.dense [data-s="eligible"] .cy-box { fill: rgba(111, 166, 255, 0.62); }
.cy-svg.dense [data-s="selected"] .cy-box { fill: var(--special); }
.cy-svg.dense [data-s="unused"] .cy-box { fill: rgba(255, 255, 255, 0.05); stroke-width: 0; }
/* modes */
.cy-svg.m-active .cy-band.on { fill: rgba(69, 212, 155, 0.09); stroke: rgba(69, 212, 155, 0.5); stroke-width: 1; stroke-dasharray: 3 3; }
.cy-svg.m-active .cy-ring { opacity: 1; stroke-width: 2; }
.cy-svg.m-active .cy-cell { opacity: 0.85; }
.cy-svg.m-occupancy .cy-cell:not([data-s="unused"]) .cy-box { fill: rgba(69, 212, 155, 0.2); stroke: var(--core); stroke-width: 1.5; }
.cy-svg.m-occupancy.dense .cy-cell:not([data-s="unused"]) .cy-box { fill: rgba(69, 212, 155, 0.7); stroke-width: 0; }
.cy-svg.m-occupancy .cy-cell:not([data-s="unused"]) .cy-op { fill: var(--core); }
.cy-svg.m-occupancy .cy-inner, .cy-svg.m-occupancy .cy-ring { display: none; }
.cy-svg.m-occupancy .cy-cell:not([data-s="unused"]) .cy-num { opacity: 0.9; }
.cy-svg.m-occupancy .cy-cell.pend .cy-box { fill: transparent; stroke: var(--line-2); }
.cy-svg.m-occupancy.dense .cy-cell.pend .cy-box { fill: rgba(255, 255, 255, 0.05); }
.cy-svg.m-occupancy .cy-cell.pend .cy-op { fill: var(--ink-3); }
.cy-svg.m-occupancy .cy-cell.pend .cy-num { opacity: 0; }
.cy-svg.m-occupancy [data-s="unused"] .cy-box { stroke: var(--ink-2); }
.cy-svg .cy-gap { font-size: 10.5px; fill: var(--ink-2); display: none; }
.cy-svg.m-occupancy .cy-gap { display: inline; }
.cy-svg.m-issue .cy-cell:not([data-s="selected"]) { opacity: 0.55; }
.cy-svg.m-active .cy-issue, .cy-svg.m-occupancy .cy-issue { opacity: 0.4; }
.cy-svg .cy-issue { transition: opacity 0.2s; }
.cy-svg.m-issue .cy-band.iss { fill: rgba(238, 116, 207, 0.07); }
.cy-svg.m-issue .cy-band.idle { fill: rgba(255, 91, 110, 0.08); stroke: rgba(255, 91, 110, 0.5); stroke-width: 1; stroke-dasharray: 3 3; }
/* issue row */
.cy-svg .cy-slot { fill: none; stroke: var(--line-2); stroke-width: 1.5; stroke-linejoin: round; }
.cy-svg .cy-slot-bg { fill: transparent; }
.cy-svg .cy-iop { font-size: 14px; font-weight: 500; letter-spacing: 0.04em; fill: var(--special); }
.cy-svg .cy-idle { font-size: 10.5px; fill: var(--danger); display: none; }
.cy-svg .cy-is.issued .cy-slot { stroke: var(--core); }
.cy-svg.m-issue .cy-is.issued .cy-slot { stroke: var(--special); stroke-width: 2; }
.cy-svg.m-issue .cy-is.issued .cy-slot-bg { fill: rgba(238, 116, 207, 0.12); }
.cy-svg.m-issue .cy-is.idle .cy-slot { stroke: var(--danger); stroke-dasharray: 4 3; }
.cy-svg.m-issue .cy-is.idle .cy-idle, .cy-svg.dense .cy-is.idle .cy-idle { display: inline; }
.cy-svg.dense .cy-slot { stroke-width: 0; }
.cy-svg.dense .cy-is.issued .cy-slot-bg { fill: var(--special); }
.cy-svg.dense .cy-is.idle .cy-slot-bg { fill: rgba(255, 91, 110, 0.1); stroke: var(--danger); stroke-width: 1; }
/* a cycle the sweep has not reached yet: an empty tray in every mode (doubled classes outrank the mode rules) */
.cy-svg.cy-svg .cy-is.pend.pend .cy-iop, .cy-svg.cy-svg .cy-is.pend.pend .cy-g { opacity: 0; }
.cy-svg.cy-svg .cy-is.pend.pend .cy-slot { stroke: var(--line-2); stroke-width: 1.5; stroke-dasharray: none; }
.cy-svg.cy-svg .cy-is.pend.pend .cy-slot-bg { fill: transparent; stroke-width: 0; }
.cy-svg.cy-svg.dense .cy-is.pend.pend .cy-slot-bg { fill: rgba(255, 255, 255, 0.05); }
.cy-svg.cy-svg .cy-is.pend.pend .cy-idle { display: none; }
.cy-svg.cy-svg .cy-is.pend.pend.incoming .cy-slot { stroke: var(--special); stroke-width: 2; }
.cy-svg.cy-svg.dense .cy-is.pend.pend.incoming .cy-slot-bg { fill: var(--special-a); }
.cy-svg.cy-svg.m-issue .cy-band.pend { fill: transparent; stroke: none; }
/* dense: op glyphs, long-latency issues, active-row bars, cycle ticks */
.cy-svg .cy-g { font-size: 10px; font-weight: 700; fill: var(--bg); pointer-events: none; }
.cy-svg.m-occupancy .cy-g { display: none; }
.cy-svg.dense .cy-cell.lop[data-s="selected"] .cy-box, .cy-svg.dense .cy-is.lop.issued:not(.pend) .cy-slot-bg { stroke: var(--ink); stroke-width: 1.25; }
.cy-svg.m-occupancy.dense .cy-cell.lop .cy-box { stroke-width: 0; }
.cy-svg .cy-actbar { fill: var(--core); opacity: 0.75; }
.cy-svg.m-occupancy .cy-actbar, .cy-svg[data-hl="active"] .cy-actbar { opacity: 1; }
.cy-svg .cy-tick { stroke: var(--ink-3); stroke-width: 1; }
.cy-svg .cy-span { fill: none; stroke: var(--accent); stroke-width: 1.5; pointer-events: none; }
.cy-svg .cy-span-bg { fill: var(--surface-2); stroke: var(--accent); stroke-width: 1; }
.cy-svg .cy-span-t { font-size: 11px; fill: var(--ink); }
/* highlight by legend */
.cy-svg[data-hl] .cy-cell { opacity: 0.18; }
.cy-svg[data-hl="stalled"] .cy-cell[data-s="stalled"],
.cy-svg[data-hl="eligible"] .cy-cell[data-s="eligible"],
.cy-svg[data-hl="long"] .cy-cell.lop[data-s="selected"],
.cy-svg[data-hl="selected"] .cy-cell[data-s="selected"],
.cy-svg[data-hl="active"] .cy-cell:not([data-s="unused"]),
.cy-svg[data-hl="unused"] .cy-cell[data-s="unused"] { opacity: 1; }
.cy-svg[data-hl="active"] .cy-ring { opacity: 1; stroke-width: 2; }
.cy-svg[data-hl="unused"] [data-s="unused"] .cy-box { stroke: var(--ink); }
/* cursor, focus, token */
.cy-svg .cy-cursor { fill: rgba(255, 138, 91, 0.06); stroke: var(--accent); stroke-width: 1.5; pointer-events: none; }
.cy-svg .cy-focus { fill: none; stroke: var(--accent); stroke-width: 2; pointer-events: none; }
.cy-svg .cy-conn { stroke: var(--accent); stroke-width: 1.5; stroke-dasharray: 4 3; fill: none; pointer-events: none; }
.cy-svg .cy-token rect { fill: var(--special-a); stroke: var(--special); stroke-width: 1.5; }
.cy-svg .cy-token rect.cy-tokbase { fill: var(--bg); stroke: none; }
.cy-svg .cy-token text { font-size: 13px; font-weight: 600; fill: var(--special); }
.cy-svg .cy-hit { fill: transparent; cursor: pointer; }
/* legend */
.cy-leg { display: flex; flex-wrap: wrap; gap: 6px; align-content: flex-start; }
.cy.side .cy-leg { flex-direction: column; flex-wrap: nowrap; padding-top: 58px; }
.cy-leg button { display: inline-flex; align-items: center; gap: 9px; padding: 5px 10px 5px 6px; border-radius: 9px; border: 1px solid var(--line); background: rgba(8, 9, 14, 0.55); color: var(--ink-2); font: 500 12.5px var(--font-mono); cursor: pointer; text-align: left; }
.cy-leg button:hover, .cy-leg button[aria-pressed="true"] { border-color: var(--line-2); color: var(--ink); background: var(--surface-2); }
.cy-leg svg { width: 26px; height: 18px; flex: none; display: block; overflow: visible; }
.cy-leg button[hidden] { display: none; }
.cy-leg span small { display: block; font-size: 10.5px; line-height: 1.2; color: var(--ink-3); font-weight: 500; }
.cy-leg b { font-weight: 600; color: var(--ink-3); font-variant-numeric: tabular-nums; margin-left: auto; padding-left: 6px; }
.cy-why { padding: 10px 13px; border-radius: 12px; background: rgba(8, 9, 14, 0.66); border: 1px solid var(--line); font-size: 14.5px; line-height: 1.55; color: var(--ink-2); grid-column: 1 / -1; }
.cy-why:empty { display: none; }
.cy-dock { display: flex; flex-wrap: wrap; gap: 10px 16px; align-items: flex-end; grid-column: 1 / -1; }
.cy-dock:empty { display: none; }
.cy-dock > div { display: flex; flex-wrap: wrap; gap: 6px 10px; align-items: flex-end; }
.cy-anim { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.cy-anim output { font: 500 12px var(--font-mono); color: var(--ink-2); min-width: 7.5em; font-variant-numeric: tabular-nums; }
.cy-chips { display: inline-flex; flex-wrap: wrap; gap: 4px; vertical-align: 1px; margin: 0 2px; }
.cy-chip { display: inline-block; font: 600 11px/1 var(--font-mono); padding: 4px 6px 3px; border-radius: 5px; border: 1px solid currentColor; letter-spacing: 0.02em; }
.cy-chip.no { color: var(--ink-3); border-color: var(--line-2); text-decoration: line-through; font-weight: 500; opacity: 0.8; }
.cy-chip.s-active { color: var(--core); }
.cy-chip.s-stalled { color: var(--control); }
.cy-chip.s-eligible { color: var(--memory); }
.cy-chip.s-selected { color: var(--special); }
.cy-chip.s-unused { color: var(--ink-2); }
.cy-w b, .fig-why .cy-w b { color: var(--ink); font-weight: 600; }
.cy-w code, .fig-why code { font-size: 0.88em; padding: 0.08em 0.35em; border-radius: 4px; background: var(--surface-3); color: var(--ink); border: 1px solid var(--line); }
`);
  }

  /* ───────────── helpers ───────────── */
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const setA = (el, a) => { for (const k in a) el.setAttribute(k, a[k]); };
  const setT = (el, s) => { if (el.textContent !== s) el.textContent = s; };
  const show = (el, on) => { if (on) el.removeAttribute('display'); else el.setAttribute('display', 'none'); };
  const f1 = (v) => Math.round(v * 10) / 10;
  const tw = (s, fs) => String(s).length * 0.6 * fs;
  const esc = (s) => GG.esc(s);
  const code = (s) => `<code>${esc(s)}</code>`;
  const cycName = (sc, c) => 'cycle ' + sc.cycleNames[c];
  const list = (arr) => (arr.length <= 1 ? arr.join('') : arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1]);
  const plural = (n, a, b) => n + ' ' + (n === 1 ? a : b || a + 's');
  const an = (op) => (/^[AEFHILMNORSX]/i.test(String(op)) ? 'an' : 'a'); // SASS mnemonics are read letter by letter

  const DEFS = {
    active: 'An <b>active</b> warp is resident on the SM from the time its threads begin executing until all of them have exited the kernel. Active warps are the pool the warp scheduler picks from; they are not necessarily executing an instruction.',
    stalled: 'A <b>stalled</b> warp is active but cannot issue its next instruction, because of an execution dependency (waiting on an arithmetic result), a memory dependency (waiting on a memory operation) or a pipeline conflict (the execution unit it needs is busy). Stalls are not inherently bad: many stalled warps can hide latency.',
    eligible: 'An <b>eligible</b> warp is active and ready to issue its next instruction: the instruction has been fetched, the execution unit it needs is available, its dependencies are resolved, and no barrier blocks it.',
    selected: 'A <b>selected</b> warp is the eligible warp the warp scheduler picks to receive an instruction this cycle. Each cycle the scheduler selects one if any warp is eligible.',
    unused: 'An <b>unused</b> box has no active warp: that warp slot is empty on that cycle.',
  };

  function swatch(state, glyph) {
    const s = {
      stalled: '<rect x="1" y="1" width="24" height="16" rx="3" fill="rgba(255,198,92,0.14)" stroke="var(--control)" stroke-width="1.5"/>',
      eligible: '<rect x="1" y="1" width="24" height="16" rx="3" fill="rgba(111,166,255,0.22)" stroke="var(--memory)" stroke-width="2"/>',
      selected: '<rect x="1" y="1" width="24" height="16" rx="3" fill="rgba(111,166,255,0.1)" stroke="var(--memory)" stroke-width="2"/><rect x="4.5" y="4.5" width="17" height="9" rx="2" fill="var(--special-a)" stroke="var(--special)" stroke-width="1.5"/>',
      active: '<rect x="-1.5" y="-1.5" width="29" height="21" rx="5" fill="none" stroke="var(--core)" stroke-width="1.5"/><rect x="2.5" y="2.5" width="21" height="13" rx="2.5" fill="rgba(255,255,255,0.06)" stroke="var(--ink-3)" stroke-width="1"/>',
      unused: '<rect x="1" y="1" width="24" height="16" rx="3" fill="none" stroke="var(--line-2)" stroke-width="1.5" stroke-dasharray="4 4"/>',
      // occupancy mode: every box holding an active warp is counted, in green
      counted: '<rect x="1" y="1" width="24" height="16" rx="3" fill="rgba(69,212,155,0.2)" stroke="var(--core)" stroke-width="1.5"/>',
      // dense grids draw no rings: an active row gets a green bar in the slot gutter instead
      activeDense: '<rect x="0" y="1" width="3" height="16" rx="1" fill="var(--core)"/><rect x="6" y="5" width="6" height="8" rx="1" fill="rgba(255,198,92,0.5)"/><rect x="13" y="5" width="6" height="8" rx="1" fill="rgba(111,166,255,0.62)"/><rect x="20" y="5" width="6" height="8" rx="1" fill="var(--special)"/>',
      // dense grids: a selected box is solid pink, as drawn in the grid
      selectedDense: '<rect x="4" y="1" width="18" height="16" rx="2" fill="var(--special)"/>',
      // dense grids: the marker of a long-latency issue (a light outline, plus its letter when boxes carry
      // letters); drawn without the pink so pink keeps a single meaning in the legend: selected
      long: '<rect x="4" y="1" width="18" height="16" rx="2" fill="none" stroke="var(--ink)" stroke-width="1.25"/>',
    }[state];
    const g = glyph ? `<text x="13" y="13" text-anchor="middle" fill="${state === 'long' ? 'var(--ink)' : 'var(--bg)'}" style="font: 700 10px var(--font-mono)">${esc(glyph)}</text>` : '';
    return `<svg viewBox="0 0 26 18" aria-hidden="true">${s}${g}</svg>`;
  }

  /* ───────────── component ───────────── */
  function cycles(target, opts) {
    opts = opts || {};
    injectCSS();
    let fig = opts.figure || null;
    let parent = target;
    if (target && target.stage && target.root) { fig = target; parent = target.stage; }
    if (!parent) throw new Error('cycles: missing parent element');

    const o = Object.assign({ mode: 'states', showModes: false, animate: false, showReadouts: true, showLegend: true, showWhy: true, simControls: false, interactive: true }, opts);
    const MODES = ['states', 'active', 'occupancy', 'issue'];

    const S = {
      sc: null, M: null,
      mode: MODES.includes(o.mode) ? o.mode : 'states',
      simP: Object.assign({ warps: 4, latency: 8, issueEvery: 1, cycles: 32 }, o.simulate || {}),
      hover: null,      // {kind:'cell'|'issue'|'cycle'|'slot', s, c}
      pinned: null,
      legend: null,     // state highlighted from the legend
      cursor: null,     // animation cursor (cycle index) or null = show everything
      occK: Infinity,   // occupancy count animation progress (cells lit)
      anim: !!o.animate,
    };

    const listeners = { cell: [], step: [], mode: [] };
    const emit = (ev, d) => (listeners[ev] || []).slice().forEach((fn) => { try { fn(d); } catch (e) { console.error('[cycles] listener', e); } });

    /* scaffold */
    const wrap = GG.el('div', { class: 'cy' });
    parent.appendChild(wrap);
    const svWrap = GG.el('div', { class: 'cy-sv' });
    wrap.append(svWrap);
    const svg = GG.svg('svg', { class: 'cy-svg', role: 'group', tabindex: o.interactive ? '0' : null, 'data-keys': '' }, svWrap);
    let legEl = null;
    const legBtns = {};
    if (o.showLegend) {
      legEl = GG.el('div', { class: 'cy-leg', role: 'group', 'aria-label': 'Warp states legend' });
      ['stalled', 'eligible', 'selected', 'long', 'active', 'unused'].forEach((st) => {
        const b = GG.el('button', { type: 'button', 'aria-pressed': 'false', 'data-state': st });
        // initial content; paintLegend() relabels per mode and grid (and shows 'long' only for dense simulated grids)
        b.innerHTML = swatch(st) + `<span>${st[0].toUpperCase() + st.slice(1)}</span><b></b>`;
        if (st === 'long') b.hidden = true;
        const on = () => setLegend(st);
        const off = () => { if (S.legendPinned !== st) setLegend(S.legendPinned || null); };
        b.addEventListener('mouseenter', on);
        b.addEventListener('mouseleave', off);
        b.addEventListener('focus', on);
        b.addEventListener('blur', off);
        b.addEventListener('click', () => { S.legendPinned = S.legendPinned === st ? null : st; setLegend(S.legendPinned); });
        legEl.append(b);
        legBtns[st] = b;
      });
      wrap.append(legEl);
    }
    let ctlEl, roEl, whyEl = null;
    if (fig) { ctlEl = fig.controls; roEl = fig.readouts; }
    else {
      const dock = GG.el('div', { class: 'cy-dock' });
      ctlEl = GG.el('div'); roEl = GG.el('div');
      dock.append(ctlEl, roEl);
      wrap.append(dock);
      whyEl = GG.el('p', { class: 'cy-why cy-w', 'aria-live': 'polite' });
      wrap.append(whyEl);
    }
    const added = [];
    const setWhy = (h) => { if (!o.showWhy) return; if (fig) fig.setWhy(`<span class="cy-w">${h}</span>`); else whyEl.innerHTML = h; };

    /* controls */
    let modeSeg = null;
    if (o.showModes) {
      modeSeg = GG.ui.seg(ctlEl, {
        label: 'Show',
        options: [
          { value: 'states', label: 'States', title: 'Colour each box by warp state' },
          { value: 'active', label: 'Active cycles', title: 'Cycles with at least one active warp' },
          { value: 'occupancy', label: 'Occupancy', title: 'Boxes holding an active warp' },
          { value: 'issue', label: 'Issue efficiency', title: 'Cycles on which an instruction issued' },
        ],
        value: S.mode,
        onChange: (v) => api.setMode(v),
      });
      added.push(modeSeg.el);
    }
    let recount = null; // created the first time occupancy mode is shown
    function ensureRecount() {
      if (recount || S.mode !== 'occupancy') return;
      recount = GG.ui.button(ctlEl, { label: 'Count again', icon: 'reset', onClick: () => startCount(true) });
      added.push(recount);
    }

    let animUI = null;
    function buildAnimUI() {
      if (animUI) return;
      const wrapC = GG.el('div', { class: 'ctl' }, GG.el('span', { class: 'ctl-lab', text: 'Cycle by cycle' }));
      const row = GG.el('div', { class: 'cy-anim' });
      const prev = GG.ui.button(row, { icon: 'prev', ariaLabel: 'Previous cycle', onClick: () => api.step(-1) });
      const play = GG.ui.button(row, { icon: 'play', label: 'Play', onClick: () => (player.running ? api.pause() : api.play()) });
      const next = GG.ui.button(row, { icon: 'next', ariaLabel: 'Next cycle', onClick: () => api.step(1) });
      const reset = GG.ui.button(row, { icon: 'reset', label: 'All', ariaLabel: 'Show all cycles at once', title: 'Show all cycles at once', onClick: () => { api.pause(); setCursor(null); } });
      const out = GG.el('output', { 'aria-live': 'off' });
      row.append(out);
      wrapC.append(row);
      ctlEl.append(wrapC);
      added.push(wrapC);
      animUI = { row: wrapC, prev, play, next, reset, out };
    }

    /* sim sliders */
    let simUI = null;
    if (o.simControls) {
      const P = S.simP;
      simUI = {
        warps: GG.ui.slider(ctlEl, { label: 'Active warps', min: 0, max: Math.max(1, P.slots || 16), step: 1, value: P.warps, format: (v) => String(v), onInput: (v) => { S.simP.warps = v; runSim(); } }),
        latency: GG.ui.slider(ctlEl, { label: 'Latency', min: 1, max: 32, step: 1, value: P.latency, format: (v) => plural(v, 'cycle'), onInput: (v) => { S.simP.latency = v; runSim(); } }),
        every: GG.ui.slider(ctlEl, { label: 'Instructions per ' + ((P.ops && P.ops.long) || 'LDG'), min: 1, max: 8, step: 1, value: P.issueEvery || 1, format: (v) => String(v), onInput: (v) => { S.simP.issueEvery = v; runSim(); } }),
      };
      Object.values(simUI).forEach((c) => added.push(c.el));
      if (!S.simP.slots) S.simP.slots = 16;
    }
    function runSim() { api.simulate(S.simP); }

    /* readouts */
    const st = {};
    if (o.showReadouts) {
      st.active = GG.ui.stat(roEl, { label: 'Active cycles', value: '—', tone: 'core' });
      st.occ = GG.ui.stat(roEl, { label: 'Occupancy', value: '—', tone: 'core' });
      st.iss = GG.ui.stat(roEl, { label: 'Issue efficiency', value: '—', tone: 'special' });
      st.elig = GG.ui.stat(roEl, { label: 'Eligible / cycle', value: '—', tone: 'memory' });
      Object.values(st).forEach((x) => added.push(x.el));
    }

    /* ── layout + build ── */
    let W = 0, L = null, E = null;

    function computeLayout() {
      const sc = S.sc;
      const dense = sc.slots > 8 || sc.cycles > 8;
      const narrow = W < 470;
      const n = Math.max(1, sc.cycles), m = Math.max(1, sc.slots);
      let left, gap, cellW, cellH, top, slotBoxW, labY, arrY, titleY, svgW;
      // slot column: boxes at sx … sx + slotBoxW. On phones the column is narrow and its header is the short
      // 'Slot'; `left` leaves a clear gutter so cycle tints and the cursor never reach the header.
      const sx = narrow ? 6 : 8;
      // phones with 7+ cycles: plain slot numbers instead of slot boxes, so the boxes are wide enough for
      // 4-letter mnemonics at 10px; the 'Slot' header then moves up to the title row, clear of the cycle tints
      const compact = narrow && !dense && n >= 7;
      if (!dense) {
        left = compact ? 26 : narrow ? 46 : 112;
        slotBoxW = compact ? 0 : narrow ? 28 : 60;
        gap = narrow ? (n >= 7 ? 6 : 8) : 14;
        cellW = Math.min(150, (W - left - 6 - gap * (n - 1)) / n);
        cellH = clamp(Math.round(cellW * 0.5), 40, 60);
        titleY = 14; labY = narrow ? 38 : 42; arrY = labY + 10; top = arrY + (narrow ? 14 : 18);
        svgW = Math.min(W, Math.ceil(left + n * (cellW + gap) - gap + 18));
      } else {
        // left clears the right-aligned 'slot' header (ending at left − 8) so it is never clipped
        left = narrow ? 36 : 44;
        slotBoxW = 0;
        let pitch = (W - left - 6) / n;
        // fit (default): shrink the cycles to fit the stage, down to a 4px pitch (72 cycles fit a phone);
        // fit: false keeps the 9px minimum and scrolls sideways instead
        pitch = Math.max(pitch, o.fit === false ? 9 : 4);
        gap = pitch >= 16 ? 2 : 1;
        cellW = Math.min(40, pitch) - gap;
        cellH = clamp(cellW, 9, 20);
        titleY = 12; labY = 30; arrY = 37; top = 48;
        svgW = Math.max(W, Math.ceil(left + 6 + n * (cellW + gap)));
      }
      const pitchX = cellW + gap, pitchY = cellH + gap;
      const gx0 = left, gx1 = left + n * pitchX - gap;
      const gy1 = top + m * pitchY - gap;
      const issLabY = gy1 + (dense ? 18 : 30);
      const issY = issLabY + (dense ? 7 : 12);
      const issH = dense ? clamp(cellH, 9, 16) : Math.round(cellH * 0.8);
      const H = issY + issH + (dense ? 6 : 12);
      // cycle labels: compact 'n + 3' → '+3' when they would collide, then thin them out
      const sc0 = S.sc;
      let labels = sc0.cycleLabels.slice();
      const widest = (ls) => Math.max(0, ...ls.map((t) => tw(t, 12)));
      if (widest(labels) > pitchX - 6) labels = labels.map((t) => t.replace(/^n \+ (\d+)$/, '+$1'));
      let every = 1;
      while (every < n && (pitchX * every) < Math.max(24, widest(labels) + 8)) every *= 2;
      let slotEvery = 1;
      while (slotEvery < m && (pitchY * slotEvery) < 11) slotEvery *= 2;
      // dense grids: op names (or their first letter) in the selected boxes, at 10px minimum, when they fit
      let glyph = null;
      if (dense) {
        const ops = new Set();
        sc0.cells.forEach((row) => row.forEach((x) => { if (x && x.state === 'selected' && x.op) ops.add(x.op); }));
        const longest = Math.max(0, ...[...ops].map((t) => t.length));
        if (ops.size && cellH >= 11) {
          if (cellW - 4 >= tw('M'.repeat(longest), 10) && cellH >= 14) glyph = 'full';
          else if (cellW >= 9) glyph = 'letter';
        }
      }
      // cursor padding: wide enough to enclose the active ring, never wider than half the gap + 1
      const curPad = dense ? (pitchX < 9 ? 1 : 1.5) : Math.min(7, gap / 2 + 1);
      return { dense, narrow, compact, left, sx, gap, cellW, cellH, top, slotBoxW, labY, arrY, titleY, pitchX, pitchY, gx0, gx1, gy1, issLabY, issY, issH, W: svgW, H, every, slotEvery, labels, glyph, curPad };
    }

    const cx = (c) => L.gx0 + c * L.pitchX;
    const opFont = (op) => clamp((L.cellW - (L.narrow ? 5 : 8)) / (0.6 * Math.max(1, String(op).length)), 10, L.narrow ? 12.5 : 14);
    const cyy = (s) => L.top + s * L.pitchY;

    function build() {
      if (!W || !S.sc) return;
      L = computeLayout();
      const sc = S.sc;
      svg.textContent = '';
      setA(svg, { viewBox: `0 0 ${L.W} ${L.H}`, width: L.W, height: L.H });
      svg.style.width = L.W + 'px';
      svWrap.classList.toggle('scroll-x', L.W > W + 1);
      svg.classList.toggle('dense', L.dense);
      E = { bands: [], cells: [], iss: [], cls: [] };
      const G = (cls) => GG.svg('g', cls ? { class: cls } : null, svg);

      // header: "Cycles", labels, arrow
      const hdr = G('cy-hdr');
      const title = GG.svg('text', { class: 'cy-h', x: f1((L.gx0 + L.gx1) / 2), y: L.titleY, 'text-anchor': 'middle' }, hdr);
      title.textContent = 'Cycles';
      for (let c = 0; c < sc.cycles; c++) {
        const t = GG.svg('text', { class: 'cy-cl', x: f1(cx(c) + L.cellW / 2), y: L.labY, 'text-anchor': 'middle' }, hdr);
        t.textContent = L.labels[c];
        if (c % L.every !== 0) show(t, false);
        E.cls.push(t);
      }
      GG.svg('line', { class: 'cy-arrow', x1: L.gx0, x2: L.gx1 + 4, y1: L.arrY, y2: L.arrY }, hdr);
      if (L.every > 1) {
        // labels are thinned: a tick for every cycle (longer under the labelled ones) keeps them countable
        let d = '';
        for (let c = 0; c < sc.cycles; c++) { const x = f1(cx(c) + L.cellW / 2); d += `M${x},${L.arrY - (c % L.every ? 2 : 4)}V${L.arrY}`; }
        GG.svg('path', { class: 'cy-tick', d }, hdr);
      }
      GG.svg('path', { class: 'cy-arrowhead', d: `M${L.gx1 + 12},${L.arrY}l-8,-4v8z` }, hdr);

      // slot column
      const sh = L.dense
        ? GG.svg('text', { class: 'cy-h', x: L.left - 8, y: L.top - 6, 'text-anchor': 'end' }, hdr)
        : L.compact ? GG.svg('text', { class: 'cy-h', x: 2, y: L.titleY }, hdr)
          : GG.svg('text', { class: 'cy-h', x: f1(L.sx + L.slotBoxW / 2), y: L.labY, 'text-anchor': 'middle' }, hdr);
      sh.textContent = L.dense ? 'slot' : L.narrow ? 'Slot' : 'Warp slots';
      if (L.dense) { sh.style.fontSize = '10px'; sh.style.fill = 'var(--ink-3)'; }
      else if (L.narrow) sh.style.fontSize = '11px';
      for (let s = 0; s < sc.slots; s++) {
        const y = cyy(s);
        if (L.compact) {
          const t = GG.svg('text', { class: 'cy-sl', x: L.left - 9, y: f1(y + L.cellH / 2 + 4.5), 'text-anchor': 'end' }, hdr);
          t.textContent = sc.slotLabels[s];
        } else if (!L.dense) {
          GG.svg('rect', { class: 'cy-slotbox', x: L.sx, y: f1(y), width: L.slotBoxW, height: L.cellH, rx: 6 }, hdr);
          const t = GG.svg('text', { class: 'cy-sl', x: f1(L.sx + L.slotBoxW / 2), y: f1(y + L.cellH / 2 + 4.5), 'text-anchor': 'middle' }, hdr);
          t.textContent = sc.slotLabels[s];
        } else {
          if (s % L.slotEvery === 0) {
            const t = GG.svg('text', { class: 'cy-sl', x: L.left - 8, y: f1(y + L.cellH / 2 + 3.5), 'text-anchor': 'end' }, hdr);
            t.style.fontSize = '10px';
            t.textContent = sc.slotLabels[s];
          }
          // dense grids draw no rings: a green bar in the gutter marks a slot that holds an active warp
          if (sc.cells[s].some(Boolean)) GG.svg('rect', { class: 'cy-actbar', x: L.left - 5, y: f1(y), width: 2.5, height: f1(L.cellH), rx: 1 }, hdr);
        }
      }

      // column bands (behind cells)
      const bands = G('cy-bands');
      for (let c = 0; c < sc.cycles; c++) {
        const bp = L.dense ? 0.5 : Math.min(6, L.gap / 2 - 0.5);
        const b = GG.svg('rect', { class: 'cy-band', x: f1(cx(c) - bp), y: f1(L.labY - 16), width: f1(L.cellW + 2 * bp), height: f1(L.gy1 - L.labY + 16 + (L.dense ? 3 : 7)), rx: L.dense ? 1 : 10 }, bands);
        E.bands.push(b);
      }

      // cells
      const cellsG = G('cy-cellsg');
      let count = 0;
      const order = []; // counting order: cycle-major
      for (let c = 0; c < sc.cycles; c++) for (let s = 0; s < sc.slots; s++) order.push([s, c]);
      const numOf = {};
      order.forEach(([s, c]) => { if (sc.cells[s][c]) numOf[s + ',' + c] = ++count; });
      for (let s = 0; s < sc.slots; s++) {
        const row = [];
        for (let c = 0; c < sc.cycles; c++) {
          const cell = sc.cells[s][c];
          const x = cx(c), y = cyy(s);
          let opFs = 0;
          const g = GG.svg('g', { class: 'cy-cell' + (cell && cell.long ? ' lop' : ''), 'data-s': cell ? cell.state : 'unused' }, cellsG);
          if (!L.dense) {
            const ro = Math.min(4, L.gap / 2 - 1.5);
            GG.svg('rect', { class: 'cy-ring', x: f1(x - ro), y: f1(y - ro), width: f1(L.cellW + 2 * ro), height: f1(L.cellH + 2 * ro), rx: 8 }, g);
          }
          GG.svg('rect', { class: 'cy-box', x: f1(x), y: f1(y), width: f1(L.cellW), height: f1(L.cellH), rx: L.dense ? 1.5 : 5 }, g);
          if (!L.dense) {
            const ins = L.narrow ? 3 : 4;
            GG.svg('rect', { class: 'cy-inner', x: f1(x + ins), y: f1(y + ins), width: f1(L.cellW - 2 * ins), height: f1(L.cellH - 2 * ins), rx: 3 }, g);
            if (cell && cell.op) {
              // shrink long mnemonics to fit (never below 10px, the phone minimum), then truncate as a last resort
              const fs = opFont(cell.op);
              const t = GG.svg('text', { class: 'cy-op', x: f1(x + L.cellW / 2), y: f1(y + L.cellH / 2 + fs * 0.36), 'text-anchor': 'middle' }, g);
              t.style.fontSize = f1(fs) + 'px';
              if (tw(cell.op, fs) * 1.07 > L.cellW - 8) t.style.letterSpacing = '0'; // tight fit: drop the tracking
              t.textContent = tw(cell.op, fs) > L.cellW - 3 ? cell.op.slice(0, Math.max(1, Math.floor((L.cellW - 3) / (0.6 * fs)))) : cell.op;
              opFs = fs;
            }
            if (cell) {
              const nt = GG.svg('text', { class: 'cy-num', x: f1(x + L.cellW - 5), y: f1(y + 12), 'text-anchor': 'end' }, g);
              nt.textContent = String(numOf[s + ',' + c]);
            } else {
              const gt = GG.svg('text', { class: 'cy-gap', x: f1(x + L.cellW / 2), y: f1(y + L.cellH / 2 + 4), 'text-anchor': 'middle' }, g);
              gt.textContent = L.cellW > 60 ? 'no warp' : '—';
            }
          }
          if (L.dense && L.glyph && cell && cell.state === 'selected' && cell.op) {
            const gt = GG.svg('text', { class: 'cy-g', x: f1(x + L.cellW / 2), y: f1(y + L.cellH / 2 + 3.6), 'text-anchor': 'middle' }, g);
            gt.textContent = L.glyph === 'full' ? cell.op : glyphOf(cell.op);
          }
          row.push({ g, num: numOf[s + ',' + c] || 0, fs: opFs });
        }
        E.cells.push(row);
      }

      // issue row
      const ig = G('cy-issue');
      const il = GG.svg('text', { class: 'cy-h', x: f1((L.gx0 + L.gx1) / 2), y: L.issLabY, 'text-anchor': 'middle' }, ig);
      il.textContent = 'Issue slots';
      if (!L.dense && !L.narrow) {
        const t = GG.svg('text', { class: 'cy-h', x: f1(8 + L.slotBoxW / 2), y: f1(L.issY + L.issH / 2 + 4), 'text-anchor': 'middle' }, ig);
        t.textContent = 'issued';
        t.style.fill = 'var(--ink-3)';
        t.style.fontSize = '11px';
      } else if (!L.dense && 2 + tw('issued', 10) + 3 <= L.gx0 - L.curPad) {
        // phones: the same row label, smaller and left-aligned, clear of the cycle tints and the cursor
        const t = GG.svg('text', { class: 'cy-h', x: 2, y: f1(L.issY + L.issH / 2 + 3.5) }, ig);
        t.textContent = 'issued';
        t.style.fill = 'var(--ink-3)';
        t.style.fontSize = '10px';
        t.style.letterSpacing = '0';
      }
      for (let c = 0; c < sc.cycles; c++) {
        const x = cx(c), y = L.issY;
        const w = whoIssued(c);
        const g = GG.svg('g', { class: 'cy-is' + (w && sc.cells[w.s][c].long ? ' lop' : '') }, ig);
        const bg = GG.svg('rect', { class: 'cy-slot-bg', x: f1(x), y: f1(y), width: f1(L.cellW), height: f1(L.issH), rx: L.dense ? 1.5 : 4 }, g);
        const path = GG.svg('path', { class: 'cy-slot', d: L.dense ? '' : `M${f1(x)},${f1(y)}V${f1(y + L.issH)}H${f1(x + L.cellW)}V${f1(y)}` }, g);
        let op = null, idle = null;
        if (!L.dense) {
          op = GG.svg('text', { class: 'cy-iop', x: f1(x + L.cellW / 2), y: f1(y + L.issH / 2 + 5), 'text-anchor': 'middle' }, g);
          idle = GG.svg('text', { class: 'cy-idle', x: f1(x + L.cellW / 2), y: f1(y + L.issH / 2 + 4), 'text-anchor': 'middle' }, g);
          idle.textContent = 'idle';
          const ifs = opFont(S.M.issued[c] || '');
          op.style.fontSize = f1(ifs) + 'px';
          if (tw(S.M.issued[c] || '', ifs) * 1.07 > L.cellW - 8) op.style.letterSpacing = '0';
        } else if (L.glyph && w && w.op) {
          const gt = GG.svg('text', { class: 'cy-g', x: f1(x + L.cellW / 2), y: f1(y + L.issH / 2 + 3.6), 'text-anchor': 'middle' }, g);
          gt.textContent = L.glyph === 'full' ? w.op : glyphOf(w.op);
          if (L.issH < 11) gt.setAttribute('display', 'none');
        }
        E.iss.push({ g, bg, path, op, idle });
      }

      // overlays: cursor, connector, token, focus
      E.cursor = GG.svg('rect', { class: 'cy-cursor', rx: L.dense ? 2 : 10 }, svg);
      show(E.cursor, false);
      E.conn = GG.svg('rect', { class: 'cy-conn', rx: L.dense ? 2 : 6 }, svg);
      show(E.conn, false);
      E.token = GG.svg('g', { class: 'cy-token' }, svg);
      const tins = L.narrow ? 3 : 4; // same inset as the selected box's pink inner box
      const tsz = { rx: L.dense ? 1.5 : 3, width: f1(L.dense ? L.cellW : L.cellW - 2 * tins), height: f1(L.dense ? L.cellH : L.cellH - 2 * tins) };
      E.tokBase = GG.svg('rect', Object.assign({ class: 'cy-tokbase' }, tsz), E.token); // opaque, so the token reads cleanly over the boxes it passes
      E.tokRect = GG.svg('rect', tsz, E.token);
      E.tokText = GG.svg('text', { 'text-anchor': 'middle' }, E.token);
      show(E.token, false);
      E.focus = GG.svg('rect', { class: 'cy-focus', rx: L.dense ? 2 : 7 }, svg);
      show(E.focus, false);
      // latency span: from a long instruction's issue to the last cycle its warp is stalled on it (on hover)
      E.span = GG.svg('g', { class: 'cy-spang', 'pointer-events': 'none' }, svg);
      E.spanR = GG.svg('rect', { class: 'cy-span', rx: L.dense ? 2 : 7 }, E.span);
      E.spanBg = GG.svg('rect', { class: 'cy-span-bg', rx: 4, height: 17 }, E.span);
      E.spanT = GG.svg('text', { class: 'cy-span-t', 'text-anchor': 'middle' }, E.span);
      show(E.span, false);
      // gg.css gives `.fig svg text:not([fill])` the ink-2 fill, which outranks this file's class rules: an explicit
      // fill attribute opts every text out of it (CSS class rules still override the attribute)
      svg.querySelectorAll('text:not([fill])').forEach((t) => t.setAttribute('fill', 'var(--ink-2)'));
      paint();
    }

    /* ── paint: classes/text for the current mode, cursor, counts (no node creation) ── */
    function paint() {
      if (!E || !L) return;
      const sc = S.sc, M = S.M;
      MODES.forEach((m) => svg.classList.toggle('m-' + m, S.mode === m));
      if (S.legend) svg.setAttribute('data-hl', S.legend); else svg.removeAttribute('data-hl');
      // bands
      for (let c = 0; c < sc.cycles; c++) {
        const b = E.bands[c];
        const act = M.activePerCycle[c] > 0;
        b.classList.toggle('on', act);
        b.classList.toggle('iss', M.selectedPerCycle[c] > 0);
        b.classList.toggle('idle', act && !M.selectedPerCycle[c]);
        // issue mode: a cycle the sweep has not reached (or whose instruction is still travelling) is not tinted yet
        b.classList.toggle('pend', S.cursor != null && (c > S.cursor || (c === S.cursor && !!S.tokenFlying)));
        E.cls[c].classList.toggle('act', S.mode === 'active' && act);
      }
      // occupancy counting
      const k = S.mode === 'occupancy' ? S.occK : Infinity;
      for (let s = 0; s < sc.slots; s++) for (let c = 0; c < sc.cycles; c++) {
        const e = E.cells[s][c];
        e.g.classList.toggle('pend', e.num > 0 && e.num > k);
        // while the selected instruction travels to its issue slot, its label leaves the box (no double label)
        const x = sc.cells[s][c];
        e.g.classList.toggle('fly', !!S.tokenFlying && c === S.cursor && !!x && x.state === 'selected');
      }
      // issue row, respecting the animation cursor
      for (let c = 0; c < sc.cycles; c++) {
        const e = E.iss[c];
        const op = M.issued[c];
        const shown = S.cursor == null || c < S.cursor || (c === S.cursor && !S.tokenFlying);
        const pend = !shown;
        e.g.classList.toggle('issued', !!op);
        e.g.classList.toggle('idle', !op && M.activePerCycle[c] > 0);
        e.g.classList.toggle('pend', pend);
        e.g.classList.toggle('incoming', pend && c === S.cursor && !!op); // the tray the flying instruction lands in
        if (e.op) setT(e.op, op || '');
      }
      // cursor
      if (S.cursor != null && S.cursor >= 0 && S.cursor < sc.cycles) {
        const x = cx(S.cursor);
        const pad = L.curPad;
        setA(E.cursor, { x: f1(x - pad), y: f1(L.labY - 17), width: f1(L.cellW + 2 * pad), height: f1(L.issY + L.issH - L.labY + 17 + pad) });
        show(E.cursor, true);
      } else show(E.cursor, false);
      paintFocus();
      paintLegend();
      ensureRecount();
      if (recount) show2(recount, S.mode === 'occupancy');
    }
    const show2 = (el, on) => { el.hidden = !on; };

    // the long-latency op whose issues are marked in a dense simulated grid (null when none are drawn)
    function longOp() {
      if (!L || !L.dense || !S.M.longIssued) return null;
      if (S.sc.meta && S.sc.meta.ops && S.sc.meta.ops.long) return String(S.sc.meta.ops.long);
      for (const row of S.sc.cells) for (const x of row) if (x && x.long) return x.op;
      return null;
    }
    const glyphOf = (op) => String(op || '').replace(/[^A-Za-z0-9]/g, '').charAt(0).toUpperCase();

    function paintLegend() {
      if (!legEl) return;
      const M = S.M, occ = S.mode === 'occupancy', lop = longOp();
      const cnt = { stalled: M.stalledCells, eligible: M.eligibleOnlyCells, selected: M.selectedCells, long: M.longIssued, active: M.activeCells, unused: M.unusedCells };
      const boxes = (n) => (n === 1 ? 'box' : 'boxes');
      for (const k in legBtns) {
        const b = legBtns[k];
        let sw = k, name = k[0].toUpperCase() + k.slice(1), sub = '', hide = false;
        // the counts partition the grid: stalled + eligible (not selected) + selected = active
        if (k === 'eligible') sub = 'not selected';
        if (k === 'active') { if (occ) { sw = 'counted'; sub = 'counted'; } else if (L && L.dense) sw = 'activeDense'; }
        if (k === 'selected' && L && L.dense) sw = 'selectedDense';
        if (k === 'long') { hide = !lop || occ; name = lop ? lop + ' issued' : 'Long'; sub = 'of the selected'; }
        if (occ && (k === 'stalled' || k === 'eligible' || k === 'selected')) hide = true;
        const glyph = k === 'long' && lop && L.glyph ? glyphOf(lop) : '';
        const key = [sw, name, sub, glyph].join('|');
        if (b._key !== key) { b._key = key; b.innerHTML = swatch(sw, glyph) + `<span>${esc(name)}${sub ? `<small>${sub}</small>` : ''}</span><b></b>`; }
        b.hidden = hide;
        if (hide && (S.legend === k || S.legendPinned === k)) { S.legend = null; S.legendPinned = null; svg.removeAttribute('data-hl'); }
        setT(b.querySelector('b'), String(cnt[k]));
        b.setAttribute('aria-pressed', String(S.legendPinned === k));
        b.title = k === 'eligible'
          ? `${cnt.eligible} eligible ${boxes(cnt.eligible)} not selected; ${M.eligibleCells} eligible in all, counting the ${M.selectedCells} selected`
          : k === 'long' ? `${cnt.long} ${lop || ''} ${cnt.long === 1 ? 'instruction' : 'instructions'} issued`
            : k === 'active' && occ ? `${cnt.active} ${boxes(cnt.active)} hold an active warp and are counted`
              : `${cnt[k]} ${k} ${boxes(cnt[k])}`;
      }
    }

    function paintFocus() {
      const h = S.hover || S.pinned;
      show(E.conn, false);
      show(E.span, false);
      if (!h || !o.interactive) { show(E.focus, false); return; }
      let x, y, w, hh;
      const pad = L.dense ? 1 : 3;
      if (h.kind === 'cell') { x = cx(h.c); y = cyy(h.s); w = L.cellW; hh = L.cellH; }
      else if (h.kind === 'issue') { x = cx(h.c); y = L.issY; w = L.cellW; hh = L.issH; }
      else if (h.kind === 'cycle') { x = cx(h.c); y = L.top; w = L.cellW; hh = L.gy1 - L.top; }
      else { x = L.gx0; y = cyy(h.s); w = L.gx1 - L.gx0; hh = L.cellH; }
      setA(E.focus, { x: f1(x - pad), y: f1(y - pad), width: f1(w + 2 * pad), height: f1(hh + 2 * pad) });
      show(E.focus, true);
      // a selected cell also rings the issue slot its instruction went into
      if (h.kind === 'cell') {
        const cell = S.sc.cells[h.s][h.c];
        if (cell && cell.state === 'selected') {
          setA(E.conn, { x: f1(cx(h.c) - pad), y: f1(L.issY - pad), width: f1(L.cellW + 2 * pad), height: f1(L.issH + 2 * pad) });
          show(E.conn, true);
        }
        paintSpan(h.s, cell);
      }
    }
    // bracket a long instruction's latency: its issue box plus the stalled boxes that wait for its result
    function paintSpan(s, cell) {
      const sp = latSpan(s, cell);
      if (!sp) { show(E.span, false); return; }
      const pad = (L.dense ? 1 : 3) + 2.5;
      const x0 = cx(sp.from) - pad, x1 = cx(sp.to) + L.cellW + pad, y = cyy(s) - pad;
      setA(E.spanR, { x: f1(x0), y: f1(y), width: f1(x1 - x0), height: f1(L.cellH + 2 * pad) });
      const txt = `${sp.op} latency: ${plural(sp.lat, 'cycle')}`;
      const w = tw(txt, 11) + 12;
      const mx = clamp((x0 + x1) / 2, w / 2 + 2, L.W - w / 2 - 2);
      // above the row, unless that would cover the cycle labels: then below it
      const ty = y - 19 >= L.top - 4 || cyy(s) + L.cellH + pad + 19 > L.issLabY - 10 ? Math.max(1, y - 19) : cyy(s) + L.cellH + pad + 2;
      setA(E.spanBg, { x: f1(mx - w / 2), y: f1(ty), width: f1(w) });
      setA(E.spanT, { x: f1(mx), y: f1(ty + 12.5) });
      setT(E.spanT, txt);
      show(E.span, true);
    }
    // {from, to, op, lat, ready} for a long instruction (selected) or a box stalled on one; null otherwise
    function latSpan(s, cell) {
      if (!cell || cell.issuedAt == null || cell.ready == null) return null;
      const from = cell.issuedAt, ready = cell.ready, lat = ready - from;
      if (lat < 2 || from < 0 || from >= S.sc.cycles) return null;
      const src = S.sc.cells[s][from];
      return { from, to: Math.min(ready - 1, S.sc.cycles - 1), op: (src && src.op) || cell.op, lat, ready };
    }

    /* ── explanations ── */
    function chips(cell) {
      const has = { active: !!cell, stalled: cell && cell.state === 'stalled', eligible: cell && (cell.state === 'eligible' || cell.state === 'selected'), selected: cell && cell.state === 'selected' };
      return '<span class="cy-chips">' + ['active', 'stalled', 'eligible', 'selected'].map((k) => `<span class="cy-chip s-${k}${has[k] ? '' : ' no'}">${has[k] ? '' : '<span class="visually-hidden">not </span>'}${k}</span>`).join(' ') + '</span>';
    }
    function whoIssued(c) {
      const sc = S.sc;
      for (let s = 0; s < sc.slots; s++) { const x = sc.cells[s][c]; if (x && x.state === 'selected') return { s, op: x.op }; }
      return null;
    }
    function cellText(s, c) {
      const sc = S.sc, cell = sc.cells[s][c];
      const where = `<b>Warp slot ${esc(sc.slotLabels[s])}, ${esc(cycName(sc, c))}</b>`;
      const note = sc.notes[s + ',' + c];
      if (!cell) return `${where}: ${chips(null)} No active warp holds this slot on this cycle, so it is unused.${note ? ' ' + note : ''}`;
      const d = opDesc(cell.op);
      const opTxt = cell.op ? `${code(cell.op)}${d ? ` (${esc(d)})` : ''}` : 'its next instruction';
      let body;
      if (cell.state === 'stalled') body = `The warp is active but stalled: it cannot issue its next instruction, ${opTxt}, on this cycle.`;
      else if (cell.state === 'eligible') {
        const w = whoIssued(c);
        body = `The warp is active and eligible: ${opTxt} is ready to issue. ` + (w ? `But the scheduler selected slot ${esc(sc.slotLabels[w.s])}'s ${code(w.op)} this cycle, and it issues only one instruction per cycle.` : 'No warp was selected on this cycle.');
      } else body = `Active, eligible and selected: the warp scheduler picked this warp, so ${opTxt} goes into the issue slot on ${esc(cycName(sc, c))}.`;
      return `${where}: ${chips(cell)} ${body}${latText(s, cell)}${note ? ' ' + note : ''}`;
    }
    // simulated grids: tie a stall to the long instruction it waits for, and a long instruction to its stall run
    function latText(s, cell) {
      if (!cell || cell.issuedAt == null || cell.ready == null) return '';
      const sc = S.sc, lat = cell.ready - cell.issuedAt;
      const cyc = (c) => (c < sc.cycles ? 'cycle ' + sc.cycleNames[c] : `cycle ${c}, after this window ends`);
      if (cell.state === 'stalled') {
        const src = sc.cells[s][cell.issuedAt];
        return ` It needs the result of the ${code((src && src.op) || '?')} this warp issued on cycle ${esc(sc.cycleNames[cell.issuedAt] || String(cell.issuedAt))}, which takes ${plural(lat, 'cycle')}, so it can issue again on ${esc(cyc(cell.ready))}.`;
      }
      if (cell.state === 'selected') {
        if (lat < 2) return ' Its result is ready on the next cycle, so this warp does not stall.';
        const last = cell.ready - 1;
        return ` Its result takes ${plural(lat, 'cycle')}, so this warp's next instruction cannot issue until ${esc(cyc(cell.ready))}: the warp is stalled on ${lat === 2 ? 'cycle ' + esc(sc.cycleNames[cell.issuedAt + 1] || String(cell.issuedAt + 1)) : `cycles ${esc(sc.cycleNames[cell.issuedAt + 1])} to ${esc(last < sc.cycles ? sc.cycleNames[last] : String(last))}`} (outlined).`;
      }
      return '';
    }
    function cycleText(c, selecting) {
      const sc = S.sc, M = S.M;
      const a = M.activePerCycle[c], st2 = M.stalledPerCycle[c], el = M.eligiblePerCycle[c];
      const w = whoIssued(c);
      const head = `<b>${esc(cycName(sc, c)[0].toUpperCase() + cycName(sc, c).slice(1))}</b>: `;
      if (!a) return head + 'no active warp at all, so this is not an active cycle.';
      if (!el) return head + `${plural(a, 'active warp')}, ${a === 1 ? 'stalled' : 'all stalled'}. No warp is eligible, so the scheduler sits idle and the issue slot stays empty.`;
      let t = `${plural(a, 'active warp')}: ${st2} stalled, ${el} eligible. `;
      if (w) {
        const others = [];
        for (let s = 0; s < sc.slots; s++) { const x = sc.cells[s][c]; if (x && x.state === 'eligible') others.push(`slot ${esc(sc.slotLabels[s])}'s ${code(x.op)}`); }
        // selecting: the instruction is still travelling to the issue slot, so say only who was selected
        if (selecting) t += el > 1 ? `The scheduler selects slot ${esc(sc.slotLabels[w.s])}'s ${code(w.op)} over ${list(others)}…` : `Slot ${esc(sc.slotLabels[w.s])} is the only eligible warp, so the scheduler selects its ${code(w.op)}…`;
        else t += el > 1 ? `The scheduler selects slot ${esc(sc.slotLabels[w.s])} over ${list(others)}, and ${code(w.op)} issues.` : `Slot ${esc(sc.slotLabels[w.s])} is the only eligible warp; it is selected and ${code(w.op)} issues.`;
      } else t += 'No warp was selected on this cycle, so the issue slot stays empty.';
      return head + t;
    }
    function slotText(s) {
      const sc = S.sc;
      const row = sc.cells[s];
      const n = { stalled: 0, eligible: 0, selected: 0, unused: 0 };
      row.forEach((x) => { n[x ? x.state : 'unused']++; });
      const act = sc.cycles - n.unused;
      return `<b>Warp slot ${esc(sc.slotLabels[s])}</b>: an active warp on ${act} of ${plural(sc.cycles, 'cycle')}; stalled on ${n.stalled}, eligible on ${n.eligible + n.selected} (selected on ${n.selected})${n.unused ? `, empty on ${n.unused}` : ''}.`;
    }
    function legendText(stt) {
      const M = S.M, sc = S.sc;
      let extra = '';
      if (stt === 'eligible') {
        const none = M.eligiblePerCycle.map((v, c) => (v ? null : c)).filter((c) => c != null && M.activePerCycle[c]);
        const nAct = M.activeCycles;
        extra = (M.eligibleOnlyCells ? ` Lit here: the ${plural(M.eligibleOnlyCells, 'box', 'boxes')} eligible but not selected (plain blue).` : ' No box here is eligible but not selected.') +
          (M.selectedCells ? ` The ${M.selectedCells === 1 ? 'selected box is' : plural(M.selectedCells, 'selected box', 'selected boxes') + ' are'} eligible too, so ${M.eligibleCells} ${M.eligibleCells === 1 ? 'box is' : 'boxes are'} eligible in all` : '') +
          (!M.selectedCells ? '' : none.length && none.length <= 3 && none.length < nAct ? `, on every active cycle except ${list(none.map((c) => sc.cycleNames[c]))}.` : none.length > 3 ? `; on ${none.length} of the ${nAct} active cycles no warp is eligible.` : '.');
        if (none.length) extra += ' Having no eligible warp on many cycles can hurt performance, especially when the work mostly runs on lower-latency units like the CUDA Cores.';
      } else if (stt === 'stalled') {
        extra = ` ${plural(M.stalledCells, 'stalled box', 'stalled boxes')} here.`;
      } else if (stt === 'selected') {
        extra = ` ${plural(M.selectedCells, 'selected box', 'selected boxes')} here: one on every cycle that has an eligible warp.`;
      } else if (stt === 'active') {
        extra = !M.activeCells ? ` None of the ${M.totalCells} boxes holds an active warp.`
          : S.mode === 'occupancy'
            ? ` In this view every box holding an active warp is green and counted: ${M.activeCells} of the ${M.totalCells}.`
            : ` ${M.activeCells} of the ${M.totalCells} boxes hold an active warp: ${M.stalledCells} stalled + ${M.eligibleOnlyCells} eligible but not selected + ${M.selectedCells} selected.${L && L.dense ? ' The green bars beside the slot numbers mark the slots that hold one.' : ''}`;
      } else if (stt === 'long') {
        const op = longOp() || 'long';
        const d = opDesc(op);
        const m = sc.meta;
        return `<b>${esc(op)} issued</b> (a selected box, so pink, marked by a light outline): ${M.longIssued} of the ${M.issuedCycles} issued instructions are ${code(op)}${d ? `, ${esc(d)}` : ''}. ` + (m && m.latency < 2 && !m.jitter
          ? 'Here its result is ready on the next cycle, so it never stalls the warp.'
          : `Each one's result takes ${m ? plural(m.latency, 'cycle') + (m.jitter ? ' or more' : '') : 'several cycles'}, so the warp's next instruction has to wait: that is the amber run after it in the same row. Hover or tap one to outline its wait.`);
      } else if (stt === 'unused') {
        extra = ` ${plural(M.unusedCells, 'unused box', 'unused boxes')} here.`;
      }
      return DEFS[stt] + extra;
    }
    function modeText() {
      const sc = S.sc, M = S.M;
      if (sc.meta && S.mode === 'states') return simText();
      if (S.mode === 'active') {
        if (!M.activeCycles) return 'No cycle here is active: no slot holds an active warp.';
        const all = M.activeCycles === sc.cycles;
        const idle = M.idleCycles.map((c) => sc.cycleNames[c]);
        return `${all ? `All ${sc.cycles}` : `${M.activeCycles} of the ${sc.cycles}`} cycles are <b>active cycles</b>: each has at least one active warp resident on the SM, eligible or stalled.` +
          (idle.length && idle.length <= 3 ? ` ${idle.length === 1 ? 'Cycle' : 'Cycles'} ${list(idle)} ${idle.length === 1 ? 'counts' : 'count'} too, even though nothing issued.` : '') +
          (M.inactiveCycles.length ? ` ${list(M.inactiveCycles.map((c) => sc.cycleNames[c]))} ${M.inactiveCycles.length === 1 ? 'has' : 'have'} no active warp, so ${M.inactiveCycles.length === 1 ? 'it is' : 'they are'} not active.` : '');
      }
      if (S.mode === 'occupancy') {
        const denom = sc.slots * M.activeCycles;
        const un = M.unused.filter(([, c]) => M.activePerCycle[c] > 0);
        let t = `<b>${M.activeCells} of the ${denom}</b> warp-slot × cycle boxes hold an active warp: ${M.activeCells} ÷ ${denom} ${eqPct(M.occupancy)}${pctExact(M.occupancy) && Math.abs(M.occupancy * 100 - Math.round(M.occupancy * 100)) > 0.001 ? `, about ${Math.round(M.occupancy * 100)}%` : ''} occupancy.`;
        if (un.length === 1 && sc.isDefault) t += ' The one gap is slot 4 on cycle n\u00a0+\u00a02, right after its warp exited.';
        else if (un.length && un.length <= 3) t += ` The ${un.length === 1 ? 'gap is' : 'gaps are'} ${list(un.map(([s, c]) => `slot ${sc.slotLabels[s]} on ${cycName(sc, c)}`))}.`;
        if (M.inactiveCycles.length) t += ` (Measured over active cycles only, like achieved occupancy.)`;
        return t;
      }
      if (S.mode === 'issue') {
        if (!M.activeCycles) return 'No active cycles, so issue efficiency is undefined here.';
        const allStalled = M.idleCycles.filter((c) => !M.eligiblePerCycle[c]);
        const other = M.idleCycles.filter((c) => M.eligiblePerCycle[c]);
        const names = (cs) => (cs.length === 1 ? 'cycle ' : 'cycles ') + list(cs.map((c) => sc.cycleNames[c]));
        let t = `An instruction issued on <b>${M.issuedCycles} of the ${M.activeCycles}</b> active cycles: ${M.issuedCycles} ÷ ${M.activeCycles} ${eqPct(M.issueEfficiency)} issue efficiency.`;
        if (!M.idleCycles.length) t += ' The scheduler issued on every cycle: at least one warp was eligible each time.';
        if (allStalled.length) t += allStalled.length <= 3 ? ` On ${names(allStalled)} every active warp was stalled, so the scheduler sat idle.` : ` On the ${allStalled.length} red cycles every active warp was stalled, so the scheduler sat idle.`;
        if (other.length) t += ` On ${other.length <= 3 ? names(other) : other.length + ' cycles'} nothing issued even though a warp was eligible.`;
        return t;
      }
      if (sc.isDefault) return 'Each box is one warp slot on one clock cycle, coloured by the state of the warp in it. The adjectives are non-exclusive: a selected warp is also eligible, and every stalled or eligible warp is active (the green outline). Hover or tap a box to see which apply.';
      return `Each box is one warp slot on one clock cycle, coloured by the state of the warp in it. ${M.activeCells} of ${M.totalCells} boxes hold an active warp; instructions issued on ${M.issuedCycles} of ${M.activeCycles} active cycles.`;
    }
    // simulated slot counts other than one H100 warp scheduler (16) or one SM (64) are a scaled-down model
    const toySlots = (m) => !!m && m.slots !== 16 && m.slots !== 64;
    function simText() {
      const m = S.sc.meta, M = S.M;
      if (!m.warps) return `No warps are resident in any of the ${m.slots} slots, so no cycle is active and nothing issues.`;
      const occ = fmtPct(m.warps / m.slots);
      const ORD = { 2: 'second', 3: 'third', 4: 'fourth', 5: 'fifth', 6: 'sixth', 7: 'seventh', 8: 'eighth' };
      const lop = `${an(m.ops.long)} ${code(m.ops.long)}`;
      const wait = m.latency < 2
        ? 'whose result is ready on the next cycle'
        : `that makes its warp wait <b>${plural(m.latency, 'cycle')}</b>${m.jitter ? ` (plus up to ${plural(m.jitter, 'cycle')} of random extra)` : ''} before its next instruction can issue`;
      let t = `<b>${m.warps} of ${m.slots}</b> warp slots ${m.warps === 1 ? 'holds' : 'hold'} an active warp (${occ} occupancy${toySlots(m) ? ` in this ${m.slots}-slot model` : ''}). ` +
        (m.issueEvery === 1 ? `Every instruction is ${lop} ${wait}. ` :
          `Every ${ORD[m.issueEvery] || m.issueEvery + 'th'} instruction is ${lop} ${wait}; the ${code(m.ops.short)} instructions in between can issue back to back. `) +
        `The scheduler issued on <b>${M.issuedCycles} of ${M.activeCycles}</b> active cycles: ${fmtPct(M.issueEfficiency)} issue efficiency.`;
      if (M.issueEfficiency < 0.999) {
        t += m.warps >= m.warpsNeeded
          ? ` ${plural(m.warpsNeeded, 'warp')} would hide the nominal latency, but the random extra latency sometimes leaves every warp waiting at once: the red issue slots.`
          : ` In this model it takes ${plural(m.warpsNeeded, 'warp')} to keep the scheduler busy every cycle; the red issue slots are latency that ${plural(m.warps, 'warp')} could not hide.`;
      } else if (m.warps < m.warpsNeeded) {
        // 100% over a window too short to leave the opening burst (every warp starts ready on cycle 0)
        t += ` That is only the start-up burst: every warp begins ready on cycle 0, and this window ends before they all wait on their ${code(m.ops.long)} at once. In this model it takes ${plural(m.warpsNeeded, 'warp')} to keep the scheduler busy every cycle; in the long run ${plural(m.warps, 'warp')} would issue on only ${fmtPct(m.steady)} of cycles.`;
      } else if (m.latency < 2) t += ` With a one-cycle latency there is nothing to hide: no warp ever stalls, and one warp alone keeps the scheduler busy${m.warps > 1 ? '; the extra warps raise occupancy but cannot push issue efficiency past 100%' : ''}.`;
      else if (m.warps === m.warpsNeeded) t += ` That is exactly the ${plural(m.warpsNeeded, 'warp')} this model needs to hide the latency: some warp is eligible on every cycle.`;
      else t += ` This model needs only ${plural(m.warpsNeeded, 'warp')} to hide the latency; the extra warps raise occupancy but cannot push issue efficiency past 100%.`;
      return t;
    }
    function stepText(c) {
      if (c == null) return null;
      return cycleText(c, !!S.tokenFlying);
    }

    function report() {
      const M = S.M, sc = S.sc;
      if (o.showReadouts) {
        st.active.set(`${M.activeCycles} / ${sc.cycles}`);
        const denom = sc.slots * M.activeCycles;
        const counting = S.mode === 'occupancy' && isFinite(S.occK) && S.occK < M.activeCells;
        // during the count-up the chip says so, rather than show a partial value as the occupancy
        st.occ.set(!denom ? '—' : counting ? `counting… ${Math.min(S.occK, M.activeCells)}/${denom}` : `${M.activeCells}/${denom} · ${fmtPct(M.occupancy)}`);
        const toy = toySlots(sc.meta);
        const occLab = o.occupancyLabel || (toy ? `Occupancy · of ${sc.slots} slots` : 'Occupancy');
        setT(st.occ.el.querySelector('i'), occLab);
        st.iss.set(M.activeCycles ? `${M.issuedCycles}/${M.activeCycles} · ${fmtPct(M.issueEfficiency)}` : '—');
        st.elig.set(sc.cycles <= 8 ? M.eligiblePerCycle.join(' · ') : 'avg ' + (+M.eligibleAvg.toFixed(2)));
        st.elig.el.title = 'Eligible warps on each cycle (selected warps count as eligible)';
        st.occ.el.title = 'Active warp-slot × cycle boxes ÷ all boxes on active cycles' + (toy ? `, against this model's ${sc.slots} warp slots (an H100 SM holds up to 64 warps, 16 per warp scheduler)` : '');
        st.iss.el.title = 'Cycles on which an instruction issued ÷ active cycles';
      }
      const h = S.hover || S.pinned;
      let txt = null;
      const info = { mode: S.mode, metrics: M, scenario: sc, cell: null, slot: null, cycle: null, step: S.cursor };
      if (h) {
        if (h.kind === 'cell') { info.slot = h.s; info.cycle = h.c; info.cell = sc.cells[h.s][h.c]; txt = cellText(h.s, h.c); }
        else if (h.kind === 'issue' || h.kind === 'cycle') { info.cycle = h.c; txt = cycleText(h.c); }
        else if (h.kind === 'slot') { info.slot = h.s; txt = slotText(h.s); }
      } else if (S.legend) txt = legendText(S.legend);
      else if (S.cursor != null) txt = stepText(S.cursor);
      if (typeof o.why === 'function') { try { const r = o.why(info); if (r != null) txt = r; } catch (e) { console.error('[cycles] why()', e); } }
      if (txt == null) txt = modeText();
      setWhy(txt);
      // while the sweep plays the line changes every cycle: keep screen readers from announcing each change
      const whyNode = fig ? fig.why : whyEl;
      if (whyNode && o.showWhy) whyNode.setAttribute('aria-live', player.running ? 'off' : 'polite');
      svg.setAttribute('aria-label', `Warp slots by clock cycles: ${sc.slots} slots, ${sc.cycles} cycles. ${M.activeCells} of ${M.totalCells} slot-cycles hold an active warp; instructions issued on ${M.issuedCycles} of ${M.activeCycles} active cycles.${o.interactive ? ' Use the arrow keys to inspect each box.' : ''}`);
      if (animUI) {
        animUI.out.textContent = S.cursor == null ? 'all cycles' : cycName(sc, S.cursor);
        animUI.prev.disabled = S.cursor === 0;
        animUI.next.disabled = S.cursor === sc.cycles - 1;
        animUI.play.setLabel(player.running ? 'Pause' : 'Play', player.running ? 'pause' : 'play');
      }
    }

    function refresh() { paint(); report(); }

    /* ── legend ── */
    function setLegend(stt) {
      S.legend = stt;
      paint(); report();
    }

    /* ── hover / keyboard ── */
    function hitAt(p) {
      if (!L) return null;
      const sc = S.sc;
      const colAt = (x) => { const c = Math.floor((x - L.gx0 + L.gap / 2) / L.pitchX); return c >= 0 && c < sc.cycles ? c : -1; };
      const rowAt = (y) => { const s = Math.floor((y - L.top + L.gap / 2) / L.pitchY); return s >= 0 && s < sc.slots ? s : -1; };
      if (p.y >= L.top - L.gap / 2 && p.y <= L.gy1 + L.gap / 2) {
        const s = rowAt(p.y);
        if (s < 0) return null;
        if (p.x >= L.gx0 - L.gap / 2 && p.x <= L.gx1 + L.gap / 2) { const c = colAt(p.x); return c >= 0 ? { kind: 'cell', s, c } : null; }
        if (p.x < L.gx0 - L.gap / 2) return { kind: 'slot', s };
        return null;
      }
      if (p.y >= L.issY - 6 && p.y <= L.issY + L.issH + 6) { const c = colAt(p.x); return c >= 0 ? { kind: 'issue', c } : null; }
      if (p.y >= L.labY - 16 && p.y < L.top - L.gap / 2) { const c = colAt(p.x); return c >= 0 ? { kind: 'cycle', c } : null; }
      return null;
    }
    const same = (a, b) => (!a && !b) || (a && b && a.kind === b.kind && a.s === b.s && a.c === b.c);
    function svgPt(e) {
      const r = svg.getBoundingClientRect();
      return { x: (e.clientX - r.left) * (L.W / (r.width || L.W)), y: (e.clientY - r.top) * (L.H / (r.height || L.H)) };
    }
    function emitCell(h, pinned) {
      if (!h || h.kind !== 'cell') { emit('cell', null); return; }
      const cell = S.sc.cells[h.s][h.c];
      emit('cell', { slot: h.s, cycle: h.c, cell, pinned: !!pinned, states: { active: !!cell, stalled: !!cell && cell.state === 'stalled', eligible: !!cell && cell.state !== 'stalled', selected: !!cell && cell.state === 'selected', unused: !cell } });
    }
    if (o.interactive) {
      svg.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse' || !L) return;
        const h = hitAt(svgPt(e));
        if (!same(h, S.hover)) { S.hover = h; paintFocus(); report(); emitCell(h || S.pinned, false); }
      });
      svg.addEventListener('pointerleave', (e) => {
        if (e.pointerType !== 'mouse') return;
        if (S.hover) { S.hover = null; paintFocus(); report(); emitCell(S.pinned, true); }
      });
      svg.addEventListener('click', (e) => {
        if (!L) return;
        const h = hitAt(svgPt(e));
        S.pinned = h && !same(h, S.pinned) ? h : null;
        if (e.pointerType !== 'mouse') S.hover = null;
        paintFocus(); report(); emitCell(S.pinned, true);
      });
      svg.addEventListener('keydown', (e) => {
        const sc = S.sc;
        const cur = S.pinned && S.pinned.kind === 'cell' ? S.pinned : null;
        let s = cur ? cur.s : 0, c = cur ? cur.c : 0;
        switch (e.key) {
          case 'ArrowRight': if (cur) c = Math.min(sc.cycles - 1, c + 1); break;
          case 'ArrowLeft': if (cur) c = Math.max(0, c - 1); break;
          case 'ArrowDown': if (cur) s = Math.min(sc.slots - 1, s + 1); break;
          case 'ArrowUp': if (cur) s = Math.max(0, s - 1); break;
          case 'Home': c = 0; break;
          case 'End': c = sc.cycles - 1; break;
          case 'Escape': S.pinned = null; paintFocus(); report(); emitCell(null); return;
          default: return;
        }
        e.preventDefault();
        e.stopPropagation();
        S.pinned = { kind: 'cell', s, c };
        S.hover = null;
        paintFocus(); report(); emitCell(S.pinned, true);
      });
      svg.addEventListener('focus', () => {
        let kb = true;
        try { kb = svg.matches(':focus-visible'); } catch (_) { /* older browsers */ }
        if (kb && !S.pinned && S.sc.slots && S.sc.cycles) { S.pinned = { kind: 'cell', s: 0, c: 0 }; paintFocus(); report(); emitCell(S.pinned, true); }
      });
      svg.addEventListener('blur', () => { S.pinned = null; paintFocus(); report(); });
    }

    /* ── occupancy count animation ── */
    const counter = GG.anim(svg, (t) => {
      const per = S.M.activeCells > 40 ? 1.6 / S.M.activeCells : 0.11;
      const k = Math.floor(t / per);
      if (k !== S.occK) { S.occK = k; paint(); report(); }
      if (k >= S.M.activeCells) { counter.stop(); S.occK = Infinity; paint(); report(); }
    }, { autostart: false });
    let countedOnce = false;
    function startCount(force) {
      if (S.mode !== 'occupancy') return;
      if (GG.reducedMotion && !force) { S.occK = Infinity; refresh(); return; }
      countedOnce = true;
      S.occK = 0;
      counter.reset();
      counter.start();
      refresh();
    }
    GG.onVisible(svg, (v) => { if (v && S.mode === 'occupancy' && !countedOnce) startCount(false); });

    /* ── cycle sweep animation ── */
    let tOffset = 0; // seconds added to the player's clock (to resume mid-sweep)
    const stepMs = () => (o.stepMs || (L && L.dense ? 260 : 1100)) / 1000;
    const player = GG.anim(svg, (t) => {
      const dur = stepMs();
      const n = S.sc.cycles;
      const hold = 2.2;
      const total = n + hold;
      const pos = ((t + tOffset) / dur) % total;
      const c = Math.floor(pos);
      const frac = pos - c;
      const cur = c < n ? c : n - 1;
      if (c >= n) { if (S.cursor !== n - 1 || S.tokenFlying) setCursor(n - 1, false); show(E.token, false); return; } // hold on the full last cycle
      if (cur !== S.cursor) { setCursor(cur, true); }
      animateToken(cur, clamp(frac / 0.45, 0, 1));
    }, { autostart: false });

    function animateToken(c, k) {
      if (!E || !L) return;
      const w = whoIssued(c);
      if (!w || GG.reducedMotion) {
        if (S.tokenFlying) { S.tokenFlying = false; paint(); report(); }
        show(E.token, false);
        return;
      }
      // the token starts exactly on the selected box's pink inner box and label (which hides while it travels)
      const tw2 = +E.tokRect.getAttribute('width'), th = +E.tokRect.getAttribute('height');
      const x0 = cx(c) + (L.cellW - tw2) / 2, y0 = cyy(w.s) + (L.cellH - th) / 2;
      const y1 = L.issY + (L.issH - th) / 2;
      const e2 = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      const y = y0 + (y1 - y0) * e2;
      if (k < 1) {
        // fade the token while it crosses the rows below its own box, so it never covers another warp's box
        const below = w.s + 1 < S.sc.slots ? cyy(w.s + 1) - L.gap / 2 : Infinity;
        const ov = clamp((Math.min(y + th, L.gy1 + L.gap / 2) - Math.max(y, below)) / th, 0, 1);
        E.token.style.opacity = String(f1(clamp(1 - 2 * ov, 0, 1)));
        const fs = (E.cells[w.s][c] && E.cells[w.s][c].fs) || 13;
        setA(E.tokRect, { x: f1(x0), y: f1(y) });
        setA(E.tokBase, { x: f1(x0), y: f1(y) });
        setA(E.tokText, { x: f1(x0 + tw2 / 2), y: f1(y + th / 2 + fs * 0.36) });
        E.tokText.style.fontSize = f1(fs) + 'px';
        setT(E.tokText, L.dense ? '' : w.op);
        show(E.token, true);
        if (!S.tokenFlying) { S.tokenFlying = true; paint(); report(); }
      } else {
        show(E.token, false);
        // landed: the tray fills and the why line says the instruction issued, on the same frame
        if (S.tokenFlying) { S.tokenFlying = false; paint(); report(); }
      }
    }

    function setCursor(c, fromAnim) {
      S.cursor = c;
      if (!fromAnim) { S.tokenFlying = false; if (E) show(E.token, false); }
      else S.tokenFlying = !!whoIssued(c) && !GG.reducedMotion;
      paint(); report();
      if (c != null) emit('step', { cycle: c, issued: S.M.issued[c] });
    }

    /* ── resize ── */
    const ro = GG.resize(svWrap, (r) => {
      const w = Math.round(r.width);
      if (w > 0 && Math.abs(w - W) > 0) { W = w; build(); }
    });
    function sideLayout() {
      // legend beside the grid when there is room
      const total = Math.round(wrap.getBoundingClientRect().width);
      wrap.classList.toggle('side', !!legEl && total >= 700);
    }
    const ro2 = GG.resize(wrap, () => sideLayout());

    /* ── scenario ── */
    function setScenario(sc) {
      S.sc = normScenario(sc);
      S.M = metrics(S.sc);
      S.hover = null; S.pinned = null;
      if (S.cursor != null && S.cursor >= S.sc.cycles) S.cursor = S.sc.cycles - 1;
      if (W) build();
      refresh();
    }

    /* ── init ── */
    sideLayout();
    W = Math.round(svWrap.getBoundingClientRect().width);
    setScenario(o.simulate && !o.scenario ? simulate(o.simulate) : o.scenario || 'default');
    if (S.anim) {
      buildAnimUI();
      if (!GG.reducedMotion) { S.cursor = 0; player.start(); }
      refresh();
    }

    const api = {
      el: wrap, svg,
      setMode(m) {
        if (!MODES.includes(m)) return api;
        S.mode = m;
        if (modeSeg) modeSeg.set(m, false);
        S.occK = Infinity;
        if (m === 'occupancy') { if (GG.isVisible(svg)) startCount(false); else countedOnce = false; }
        refresh();
        emit('mode', m);
        return api;
      },
      setScenario(sc) { setScenario(sc); return api; },
      simulate(p) {
        S.simP = Object.assign({}, S.simP, p || {});
        const sc = simulate(S.simP);
        if (simUI) {
          simUI.warps.set(sc.meta.warps, false);
          simUI.latency.set(sc.meta.latency, false);
          simUI.every.set(sc.meta.issueEvery, false);
        }
        setScenario(sc);
        return sc;
      },
      step(dir) {
        dir = dir === -1 ? -1 : 1;
        buildAnimUI();
        player.stop();
        const n = S.sc.cycles;
        let c = S.cursor == null ? (dir > 0 ? 0 : n - 1) : S.cursor + dir;
        c = clamp(c, 0, n - 1);
        setCursor(c, false);
        return api;
      },
      play() {
        buildAnimUI();
        S.anim = true;
        const n = S.sc.cycles;
        const start = S.cursor == null || S.cursor >= n - 1 ? 0 : S.cursor;
        player.reset();
        tOffset = start * stepMs(); // resume from the current cycle
        player.start();
        report();
        return api;
      },
      pause() { player.stop(); if (S.tokenFlying) { S.tokenFlying = false; if (E) show(E.token, false); paint(); } report(); return api; },
      metrics: () => S.M,
      scenario: () => S.sc,
      on(ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); return api; },
      off(ev, fn) { const l = listeners[ev]; if (l) { const j = l.indexOf(fn); if (j >= 0) l.splice(j, 1); } return api; },
      destroy() {
        player.stop(); counter.stop();
        if (ro && ro.disconnect) ro.disconnect();
        if (ro2 && ro2.disconnect) ro2.disconnect();
        wrap.remove();
        added.forEach((n) => n.remove());
        if (fig && o.showWhy) fig.setWhy('');
        for (const k in listeners) listeners[k] = [];
      },
    };
    return api;
  }

  cycles.DEFAULT = DEFAULT;
  cycles.metrics = metrics;
  cycles.simulate = simulate;
  cycles.normalize = normScenario;
  cycles.fmtPct = fmtPct;
  GG.components.cycles = cycles;
})();
