/* chapters/hs-a.js: Host Software, part A.
   Entries: cuda-software-platform, cuda-c, nvidia-gpu-drivers, nvidia-ko, cuda-driver-api, libcuda,
            nvml, libnvml, nvidia-smi, cuda-runtime-api, libcudart.
   Every CSS class here is prefixed "hsa-". */
(function () {
  'use strict';
  if (!window.GG) return;

  GG.css(`
/* ── shared ── */
.entry-body.hsa-body :not(pre) > code { white-space: normal; overflow-wrap: anywhere; }
/* JetBrains Mono's programming ligatures (in "calt") redraw /= as ≠ and == as one bar: code must read verbatim */
.entry-body.hsa-body, .entry-body.hsa-body * { font-variant-ligatures: common-ligatures no-contextual; font-feature-settings: "kern", "liga", "calt" 0; }
.entry-body.hsa-body pre, .entry-body.hsa-body pre *, .entry-body.hsa-body code, .entry-body.hsa-body code *, .entry-body.hsa-body svg text { font-variant-ligatures: none; font-feature-settings: "kern", "liga" 0, "calt" 0; }
.hsa-w { position: relative; min-width: 0; }
.hsa-k { font: 500 10px/1.3 var(--font-mono); letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-3); }
.hsa-tag { display: inline-block; font: 600 9.5px/1 var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 5px 2px; border-radius: 4px;
  border: 1px solid var(--line-2); color: var(--ink-3); vertical-align: 0.15em; white-space: nowrap; }
.hsa-tag.beyond { color: var(--host); border-color: rgba(184, 164, 255, 0.45); }
.hsa-tag.sim { color: var(--control); border-color: rgba(255, 198, 92, 0.5); }
.hsa-tag.ok { color: var(--core); border-color: rgba(69, 212, 155, 0.5); }
.hsa-tag.bad { color: var(--danger); border-color: rgba(255, 91, 110, 0.5); }
.hsa-legend { display: flex; flex-wrap: wrap; gap: 6px 16px; margin-top: 10px; font: 500 11px/1.4 var(--font-mono); color: var(--ink-2); }
.hsa-legend span { display: inline-flex; align-items: center; gap: 7px; }
.hsa-legend i { width: 11px; height: 11px; border-radius: 3px; flex: none; display: inline-block; }
.hsa-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.hsa-chip { font: 500 12px/1 var(--font-mono); color: var(--ink-2); background: var(--surface-2); border: 1px solid var(--line-2); border-radius: 999px;
  padding: 7px 10px 6px; cursor: pointer; white-space: nowrap; transition: background 0.15s, color 0.15s, border-color 0.15s; }
.hsa-chip:hover { color: var(--ink); border-color: var(--ink-3); }
.hsa-chip[aria-pressed="true"] { background: var(--ink); color: var(--bg); border-color: var(--ink); }
.hsa-term { margin: 0; background: #07080c; border: 1px solid var(--line); border-radius: 10px; font: 500 12.5px/1.6 var(--font-mono); color: #d4d7e6;
  padding: 10px 14px; overflow-x: auto; white-space: pre; tab-size: 4; scrollbar-width: thin; scrollbar-color: var(--line-2) transparent; }
.hsa-term .p { color: var(--ink-3); }
.hsa-term .c { color: var(--ink); }
.hsa-term .ok { color: var(--core); }
.hsa-term .bad { color: var(--danger); }
.hsa-term .dim { color: var(--ink-3); }
.hsa-term .hi { color: var(--control); }
.hsa-svg { display: block; width: 100%; height: auto; margin: 0 auto; overflow: visible; }
.hsa-svg text { font-family: var(--font-mono); }
.hsa-sub { font: 500 11.5px/1.5 var(--font-mono); color: var(--ink-3); margin-top: 8px; }
.hsa-sub b { color: var(--ink-2); font-weight: 500; }
.hsa-halo { paint-order: stroke; stroke: #121420; stroke-width: 6px; stroke-linejoin: round; }

/* ── cuda-software-platform · three meanings ── */
.hsa-mean { display: grid; grid-template-columns: minmax(0, 1fr) 76px minmax(0, 1fr) 76px minmax(0, 1fr); gap: 6px; align-items: stretch; }
.hsa-mean.one { grid-template-columns: minmax(0, 1fr); }
.hsa-mlink { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; text-align: center; font: 500 10.5px/1.3 var(--font-mono); color: var(--ink-3); }
.hsa-mlink i { font-style: normal; font-size: 18px; line-height: 1; color: var(--ink-2); }
.hsa-mean.one .hsa-mlink { flex-direction: row; gap: 8px; padding: 1px 0; }
.hsa-mcard .hsa-tag { align-self: flex-start; }
.hsa-mcard { text-align: left; display: flex; flex-direction: column; gap: 5px; padding: 12px 12px 13px; border-radius: 12px; border: 1px solid var(--line);
  background: rgba(8, 9, 14, 0.55); color: var(--ink-2); cursor: pointer; font: inherit; transition: border-color 0.15s, background 0.15s, box-shadow 0.15s; min-width: 0; }
.hsa-mcard:hover { border-color: var(--ink-3); }
.hsa-mcard .hsa-ico { width: 100%; height: auto; display: block; margin-bottom: 6px; }
.hsa-mcard .t { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.hsa-mcard b { font: 600 15px/1.25 var(--font-body); color: var(--ink); }
.hsa-mcard .d { font-size: 13px; line-height: 1.45; }
.hsa-mcard[aria-pressed="true"] { border-color: var(--accent); background: rgba(24, 26, 38, 0.95); box-shadow: inset 0 0 0 1px var(--accent); }
.hsa-mcard.ok { border-color: var(--core); box-shadow: inset 0 0 0 1px var(--core); }
.hsa-mcard.no { border-color: var(--danger); box-shadow: inset 0 0 0 1px var(--danger); }
.hsa-mean.one .hsa-mcard { flex-direction: row; align-items: center; gap: 12px; }
.hsa-mean.one .hsa-ico { width: 104px; flex: none; margin: 0; }
.hsa-mean.one .hsa-i-lay-t { display: none; }   /* at icon size the stack reads as a glyph; its labels would be under 9px */
.hsa-i-chip { fill: rgba(255, 255, 255, 0.02); stroke: var(--line-2); stroke-width: 1; }
.hsa-i-sm { fill: var(--surface-2); stroke: var(--line-2); stroke-width: 1; }
.hsa-i-mem { fill: rgba(111, 166, 255, 0.6); }
.hsa-i-core { fill: rgba(69, 212, 155, 0.8); }
.hsa-i-grid { fill: rgba(255, 255, 255, 0.02); stroke: var(--ink-3); stroke-width: 1; stroke-dasharray: 4 3; }
.hsa-i-blk { fill: rgba(255, 255, 255, 0.03); stroke: var(--line-2); stroke-width: 1; stroke-dasharray: 3 2; }
.hsa-i-str { fill: none; stroke: var(--ink-2); stroke-width: 1.3; stroke-linecap: round; }
.hsa-i-lay { fill: rgba(184, 164, 255, 0.14); stroke: rgba(184, 164, 255, 0.55); stroke-width: 1; }
.hsa-i-lay-t { fill: var(--ink); font-size: 9px; }
.hsa-quiz { margin-top: 12px; border: 1px solid var(--line); border-radius: 12px; background: rgba(8, 9, 14, 0.55); padding: 11px 13px 12px; }
.hsa-quiz-top { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
.hsa-quiz-q { margin: 8px 0 10px; font-size: 17px; line-height: 1.45; color: var(--ink); }
.hsa-quiz-q code { font-size: 0.86em; }
.hsa-quiz-a { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.hsa-quiz-a .btn.ok { border-color: var(--core); color: var(--core); }
.hsa-quiz-a .btn.no { border-color: var(--danger); color: var(--danger); }
.hsa-quiz-a .sp { flex: 1 1 10px; }

/* ── cuda-software-platform · build vs run ── */
.hsa-life { display: grid; grid-template-columns: minmax(0, 1fr) 54px minmax(0, 1fr); gap: 10px; align-items: stretch; }
.hsa-life.one { grid-template-columns: minmax(0, 1fr); }
.hsa-lane { border: 1px dashed var(--line-2); border-radius: 12px; padding: 10px 12px 12px; display: flex; flex-direction: column; gap: 5px; min-width: 0; transition: border-color 0.2s; }
.hsa-lane.on { border-color: var(--ink-3); }
.hsa-lane-h { margin-bottom: 4px; }
.hsa-lane-h b { font: 600 11px/1.3 var(--font-mono); letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink); }
.hsa-lane-h span { display: block; font-size: 12.5px; line-height: 1.4; color: var(--ink-3); margin-top: 2px; }
.hsa-node { border: 1px solid var(--line); border-radius: 10px; background: rgba(8, 9, 14, 0.6); padding: 7px 10px 8px; transition: opacity 0.25s, border-color 0.25s, background 0.25s; opacity: 0.4; }
.hsa-node .src { float: right; margin-left: 8px; }
.hsa-node b { font: 600 13.5px/1.35 var(--font-mono); color: var(--ink); }
.hsa-node span.d { display: block; font-size: 12.5px; color: var(--ink-2); line-height: 1.4; margin-top: 2px; }
.hsa-node.done { opacity: 0.8; }
.hsa-node.on { opacity: 1; border-color: var(--accent); background: rgba(24, 26, 38, 0.95); }
.hsa-node.gpu.on { border-color: var(--core); background: rgba(69, 212, 155, 0.1); }
.hsa-arr { text-align: center; color: var(--ink-3); font: 12px/1 var(--font-mono); }
.hsa-ship { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; font: 500 10.5px/1.3 var(--font-mono); color: var(--ink-3); text-align: center; transition: color 0.2s; }
.hsa-ship i { font-style: normal; font-size: 18px; line-height: 1; }
.hsa-ship.on { color: var(--accent); }
.hsa-life.one .hsa-ship { flex-direction: row; padding: 2px 0; }

/* ── cuda-c · annotated program ── */
.hsa-cc { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr); gap: 14px; align-items: start; }
.hsa-cc.one { grid-template-columns: minmax(0, 1fr); }
.hsa-cc .code pre { font-size: 12.4px; }
.hsa-cc .ln.hsa-pick { cursor: pointer; }
.hsa-cc .ln span.hsa-glow { border-radius: 3px; box-shadow: 0 0 0 1.5px currentColor; background: rgba(255, 255, 255, 0.06); }
.hsa-feat { border: 1px solid var(--line); border-radius: 12px; background: rgba(8, 9, 14, 0.6); padding: 12px 14px 13px; }
.hsa-feat .syn { font: 600 22px/1.2 var(--font-mono); color: var(--ink); margin: 6px 0 8px; overflow-wrap: anywhere; }
.hsa-feat .syn.core { color: var(--core); } .hsa-feat .syn.memory { color: var(--memory); } .hsa-feat .syn.control { color: var(--control); } .hsa-feat .syn.accent { color: var(--accent); }
.hsa-feat p { font-size: 14px; line-height: 1.55; color: var(--ink-2); }
.hsa-feat p + p { margin-top: 0.55em; }
.hsa-feat code { font-size: 0.88em; padding: 0.08em 0.35em; border-radius: 4px; background: var(--surface-3); border: 1px solid var(--line); color: var(--ink); white-space: normal; overflow-wrap: anywhere; }
.hsa-feat .gq { margin-top: 10px; padding-top: 9px; border-top: 1px dashed var(--line-2); font-size: 13px; line-height: 1.5; color: var(--ink-3); }
.hsa-feat .gq b { color: var(--ink-2); font-weight: 600; }

/* ── cuda-c · reduction ── */
.hsa-red-code { margin-top: 8px; font: 500 12.5px/1.5 var(--font-mono); color: var(--ink-2); background: #07080c; border: 1px solid var(--line); border-radius: 8px; padding: 7px 10px; overflow-x: auto; white-space: pre; }
.hsa-red-code .n { color: #8a8fa8; margin-right: 12px; }
.hsa-rsvg .cell { stroke-width: 1; transition: fill 0.25s, stroke 0.25s, opacity 0.25s; }
/* memory is blue: global x dimmer, shared buf brighter, a just-written slot brightest. Green is kept for threads and additions. */
.hsa-rsvg .xcell { fill: rgba(111, 166, 255, 0.08); stroke: rgba(111, 166, 255, 0.4); stroke-dasharray: 3 2; }
.hsa-rsvg .bcell { fill: rgba(111, 166, 255, 0.2); stroke: var(--memory); }
.hsa-rsvg .bcell.stale { fill: rgba(111, 166, 255, 0.05); stroke: rgba(111, 166, 255, 0.3); }
.hsa-rsvg .bcell.fresh { fill: rgba(111, 166, 255, 0.42); stroke: var(--memory); stroke-width: 2; }
.hsa-rsvg .val { font-size: 12px; font-weight: 600; fill: var(--ink); }
.hsa-rsvg .val.stale { fill: var(--ink-3); font-weight: 500; }
.hsa-rsvg .tl { font-size: 10.5px; fill: var(--ink-3); }
.hsa-rsvg .tl.on { fill: var(--core); font-weight: 600; }
.hsa-rsvg .rowl { font-size: 10px; fill: var(--ink-3); letter-spacing: 0.04em; }
.hsa-rsvg .str { fill: none; stroke: var(--ink-3); stroke-width: 1.3; stroke-linecap: round; transition: stroke 0.25s; }
.hsa-rsvg .str.on { stroke: var(--core); stroke-width: 1.6; }
.hsa-rsvg .arc { fill: none; stroke: var(--core); stroke-width: 1.4; }
.hsa-rsvg .arc.race { stroke: var(--danger); stroke-dasharray: 4 3; }
.hsa-rsvg .arc.ghost { stroke: var(--ink-3); stroke-dasharray: 3 3; opacity: 0.6; }
.hsa-rsvg .ghostl { font-size: 11px; fill: var(--ink-3); }
.hsa-rsvg .ld { stroke: var(--memory); stroke-width: 1.2; }
.hsa-rsvg .ah { fill: var(--core); }
.hsa-rsvg .ah.ld { fill: var(--memory); stroke: none; }
.hsa-rsvg .ah.race { fill: var(--danger); }
.hsa-rsvg .bar { fill: var(--control); }
.hsa-rsvg .bar.miss { fill: none; stroke: var(--danger); stroke-width: 1.4; stroke-dasharray: 5 4; }
.hsa-rsvg .barl { font-size: 11px; fill: var(--control); font-weight: 600; }
.hsa-rsvg .barl.miss { fill: var(--danger); }
.hsa-rsvg .q { font-size: 11px; font-weight: 700; fill: var(--danger); }
.hsa-rsvg .q.lucky { fill: var(--ink-3); font-weight: 500; }
.hsa-rsvg .arc.race.bad { stroke-dasharray: none; stroke-width: 1.8; }
.hsa-rsvg .bcell.bad { fill: rgba(255, 91, 110, 0.2); stroke: var(--danger); }
.hsa-rsvg .outc { fill: rgba(111, 166, 255, 0.2); stroke: var(--memory); }

/* ── cuda-c · launch geometry ── */
.hsa-geo .blk { fill: rgba(69, 212, 155, 0.2); stroke: rgba(69, 212, 155, 0.6); stroke-width: 1; }
.hsa-geo .blk.sel { fill: rgba(69, 212, 155, 0.45); stroke: var(--core); stroke-width: 1.6; }
.hsa-geo .idle { fill: url(#hsa-hatch); stroke: rgba(255, 91, 110, 0.7); stroke-width: 1; }
.hsa-geo .warp { fill: rgba(69, 212, 155, 0.22); stroke: rgba(69, 212, 155, 0.55); stroke-width: 1; }
.hsa-geo .zoom { fill: rgba(255, 255, 255, 0.025); stroke: var(--ink-3); stroke-width: 1; stroke-dasharray: 3 3; }
.hsa-geo .mark { stroke: var(--accent); stroke-width: 2; }
.hsa-geo .markt { fill: var(--accent); font-size: 11px; font-weight: 600; }
.hsa-geo .lab { fill: var(--ink-2); font-size: 11px; }
.hsa-geo .lab.dim { fill: var(--ink-3); font-size: 10px; }
.hsa-geo .head { fill: var(--ink); font-size: 12px; font-weight: 600; }
.hsa-fx { margin-top: 10px; font: 500 14px/1.6 var(--font-mono); color: var(--ink-2); text-align: center; overflow-wrap: anywhere; }
.hsa-fx b { color: var(--ink); font-weight: 600; }
.hsa-fx .i { color: var(--accent); } .hsa-fx .b { color: var(--core); } .hsa-fx .t { color: var(--special); }
.hsa-fx .bad { color: var(--danger); }
.hsa-warn { display: block; margin-top: 0.4em; }
.hsa-warn > b:first-child { color: var(--danger); }

/* ── cuda-c · split compilation ── */
.hsa-split { display: grid; grid-template-columns: 190px minmax(0, 1fr); gap: 16px; align-items: center; }
.hsa-split.one { grid-template-columns: minmax(0, 1fr); }
.hsa-mini .ml { transition: opacity 0.2s; }
.hsa-mini .ml.dev { fill: var(--core); }
.hsa-mini .ml.host { fill: var(--host); }
.hsa-mini .ml.launch { fill: var(--control); }
.hsa-mini text { font-size: 9.5px; fill: var(--ink-3); }
.hsa-mini .dim { opacity: 0.18; }
.hsa-lanes { display: grid; gap: 10px; }
.hsa-plane { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; padding: 9px 10px; border-radius: 12px; border: 1px solid var(--line); background: rgba(8, 9, 14, 0.5); transition: opacity 0.2s; }
.hsa-plane.dim { opacity: 0.25; }
.hsa-plane .hd { flex: 1 0 100%; display: flex; gap: 8px; align-items: baseline; }
.hsa-plane .hd b { font: 600 11px var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; }
.hsa-plane.dev .hd b { color: var(--core); }
.hsa-plane.host .hd b { color: var(--host); }
.hsa-plane .hd span { font-size: 12.5px; color: var(--ink-3); }
.hsa-pn { font: 500 12px/1.3 var(--font-mono); color: var(--ink); padding: 5px 8px; border-radius: 8px; border: 1px solid var(--line-2); background: var(--surface-2); }
.hsa-pn small { display: block; font-size: 10px; color: var(--ink-3); }
.hsa-pn.tool { border-style: dashed; color: var(--ink-2); }
.hsa-plane.dev .hsa-pn.out { border-color: rgba(69, 212, 155, 0.6); }
.hsa-plane.host .hsa-pn.out { border-color: rgba(184, 164, 255, 0.6); }
.hsa-pa { font: 12px var(--font-mono); color: var(--ink-3); }
.hsa-exe { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: center; padding: 9px 10px; border-radius: 12px; border: 1px solid var(--ink-3); background: rgba(24, 26, 38, 0.9); }
.hsa-exe b { font: 600 13px var(--font-mono); color: var(--ink); }
.hsa-exe span { font-size: 12.5px; color: var(--ink-2); }
`);

  /* ───────────── helpers ───────────── */
  const el = GG.el;
  const esc = GG.esc;
  const S = (tag, attrs, parent) => GG.svg(tag, attrs, parent);
  const TERMS = {};
  (window.GG_TERMS || []).forEach((t) => { TERMS[t.id] = t; });
  const $$ = (root, sel) => Array.prototype.slice.call(root.querySelectorAll(sel));
  const r2 = (v) => Math.round(v * 100) / 100;

  /* Cross-link HTML, already decorated (so it also works in content shown after boot). */
  function T(id, text) {
    const t = TERMS[id];
    const color = t ? (GG.SECTIONS[t.section] || GG.SECTIONS.intro).color : 'var(--accent)';
    return `<a data-term="${id}" href="#${id}" class="term" style="--c:${color}">${text == null ? (t ? esc(t.name) : id) : text}</a>`;
  }
  /* External link HTML, already decorated. */
  function X(href, text) { return `<a href="${href}" class="ext" target="_blank" rel="noopener noreferrer">${text}</a>`; }

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
      console.error('[hs-a] ' + label + ' failed', e);
      if (parent) parent.insertAdjacentHTML('beforeend', `<div class="entry-error">${esc(label)} could not be drawn: ${esc(e && e.message)}</div>`);
      return null;
    }
  }

  function txt(parent, x, y, str, attrs) {
    const t = S('text', Object.assign({ x: r2(x), y: r2(y), fill: '#aeb2c7' }, attrs || {}), parent); // explicit fill: CSS classes still win, the core default does not
    t.textContent = str;
    return t;
  }
  function svgRoot(parent, W, H, label, cls) {
    const s = S('svg', { class: 'hsa-svg' + (cls ? ' ' + cls : ''), viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': label });
    parent.appendChild(s);
    return s;
  }
  /* A wavy vertical thread strand from (x, y0) to (x, y1). */
  function strand(x, y0, y1, amp) {
    const n = Math.max(1, Math.round((y1 - y0) / 14));
    const h = (y1 - y0) / n;
    let d = `M${r2(x)} ${r2(y0)}q${r2(amp)} ${r2(h / 4)} 0 ${r2(h / 2)}t0 ${r2(h / 2)}`;
    for (let k = 1; k < n; k++) d += `t0 ${r2(h / 2)}t0 ${r2(h / 2)}`;
    return d;
  }
  const hatchDefs = (svg) => {
    const defs = S('defs', null, svg);
    const p = S('pattern', { id: 'hsa-hatch', width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    S('rect', { width: 6, height: 6, fill: 'rgba(255,91,110,0.10)' }, p);
    S('line', { x1: 0, y1: 0, x2: 0, y2: 6, stroke: 'rgba(255,91,110,0.75)', 'stroke-width': 2 }, p);
    return defs;
  };

  /* A figure holding the shared CUDA Toolkit stack component. */
  function toolkitFig(host, ctx, figOpts, tkOpts) {
    const f = ctx.figure(host, figOpts);
    const make = GG.components && GG.components.toolkit;
    if (!make) { f.stage.innerHTML = '<div class="entry-error">The CUDA Toolkit diagram component did not load.</div>'; return { f, tk: null }; }
    const tk = make(f.stage, tkOpts || {});
    return { f, tk };
  }

  const LINDHOLM = 'https://www.cs.cmu.edu/afs/cs/academic/class/15869-f11/www/readings/lindholm08_tesla.pdf';
  const PROF_CUDA = 'the <em>Professional CUDA C Programming Guide</em>';

  /* ═════════════════════════ cuda-software-platform ═════════════════════════ */

  function iconSVG(k) {
    let s = '<svg class="hsa-ico" viewBox="0 0 160 84" aria-hidden="true">';
    if (k === 'arch') {
      s += '<rect x="2.5" y="2.5" width="155" height="79" rx="7" class="hsa-i-chip"/>';
      for (let r = 0; r < 2; r++) for (let c = 0; c < 6; c++) {
        const x = 11 + c * 23.6, y = 10 + r * 33, w = 20, h = 29;
        s += `<rect x="${r2(x)}" y="${y}" width="${w}" height="${h}" rx="2.5" class="hsa-i-sm"/>`;
        s += `<rect x="${r2(x + 3)}" y="${y + 3}" width="${w - 6}" height="3" rx="1.2" class="hsa-i-mem"/>`;
        for (let j = 0; j < 3; j++) s += `<rect x="${r2(x + 3.6 + j * 4.9)}" y="${y + 10}" width="2.8" height="15" rx="1" class="hsa-i-core"/>`;
      }
    } else if (k === 'model') {
      s += '<rect x="2.5" y="2.5" width="155" height="79" rx="7" class="hsa-i-grid"/>';
      for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
        const x = 10 + c * 48.5, y = 10 + r * 34, w = 43, h = 29;
        s += `<rect x="${r2(x)}" y="${y}" width="${w}" height="${h}" rx="3" class="hsa-i-blk"/>`;
        for (let j = 0; j < 4; j++) s += `<path d="${strand(x + 8 + j * 9, y + 4, y + h - 4, 2.6)}" class="hsa-i-str"/>`;
      }
    } else {
      const L = ['CUDA C++ source', 'nvcc toolchain', 'cuBLAS · cuDNN · …', 'Runtime · Driver API'];
      L.forEach((t, i) => {
        const y = 3 + i * 20;
        s += `<rect x="${6 + i * 3}" y="${y}" width="${148 - i * 6}" height="16" rx="3" class="hsa-i-lay"/>`;
        s += `<text x="80" y="${y + 11.3}" text-anchor="middle" fill="#eceef6" class="hsa-i-lay-t">${esc(t)}</text>`;
      });
    }
    return s + '</svg>';
  }

  function meaningsFig(host, ctx) {
    const f = ctx.figure(host, {
      title: 'One word, three meanings',
      hint: 'pick a meaning, then test yourself',
      wide: true,
      caption: 'The three things “CUDA” can mean, after the glossary’s own list, stacked in the same order as in the CUDA (Device Architecture) entry so the arrows read as a sentence: programs written in the programming model are compiled and launched by the software platform, which runs on hardware with the device architecture. This entry is the middle layer. The quiz sentences are ours.',
    });
    const M = {
      arch: {
        short: 'a device architecture',
        line: 'Hardware whose computation happens in many identical, general-purpose Streaming Multiprocessors.',
        why: `<b>CUDA, the device architecture.</b> A GPU design in which all the real computation happens in many identical ${T('streaming-multiprocessor', 'Streaming Multiprocessors')}, instead of in a fixed pipeline of specialized units. NVIDIA introduced it with the GeForce 8800 in 2006. More in ${T('cuda-device-architecture', 'CUDA (Device Architecture)')}.`,
      },
      model: {
        short: 'a programming model',
        line: 'Threads grouped into thread blocks, grouped into grids, with matching memories and barriers.',
        why: `<b>CUDA, the programming model.</b> A way to write massively parallel programs for such hardware: ${T('thread', 'threads')} grouped into ${T('thread-block', 'thread blocks')}, grouped into a ${T('thread-block-grid', 'grid')}, with a matching hierarchy of memories and barrier synchronization. More in ${T('cuda-programming-model', 'CUDA Programming Model')}.`,
      },
      platform: {
        short: 'a software platform',
        line: 'Compilers, APIs, drivers and libraries that add the model to languages like C++.',
        why: '<b>CUDA, the software platform.</b> The compilers, APIs, drivers, libraries and tools that extend a high-level language like C++ with the programming model and run the result on the GPU. That is this entry.',
      },
    };
    const KEYS = ['model', 'platform', 'arch'];   // same stack and arrow wording as cuda-device-architecture's "Three things called CUDA"
    const LINKS = ['compiled and launched by', 'runs on'];
    const Q = [
      { q: '“The GeForce 8800 was NVIDIA’s first CUDA GPU.”', a: 'arch', why: 'This sentence is about hardware: the G80 chip in the GeForce 8800 was the first NVIDIA GPU built from identical, general-purpose Streaming Multiprocessors, the <b>device architecture</b>.' },
      { q: '“In CUDA, threads are grouped into thread blocks, and blocks into a grid.”', a: 'model', why: 'Threads, blocks and grids are the abstractions of the <b>programming model</b>. They say how a parallel program is organized, whatever language you write it in.' },
      { q: '“<code>nvidia-smi</code> says <code>CUDA Version: 13.0</code>.”', a: 'platform', why: `A version number belongs to software: here, the newest version of the CUDA <b>software platform</b>’s Driver API that the installed driver provides. See ${T('nvidia-smi', 'nvidia-smi')}.` },
      { q: '“An H100 has 16,896 CUDA Cores.”', a: 'arch', why: `${T('cuda-core', 'CUDA Cores')} are hardware units inside each SM (132 SMs × 128 = 16,896 on an H100 SXM), so this is the <b>device architecture</b>.` },
      { q: '“Write the kernel so that each of a million threads handles one element.”', a: 'model', why: 'Decomposing work into many threads that each run the same kernel is the heart of the <b>programming model</b>.' },
      { q: '“Install CUDA 12.8 so you can compile with nvcc.”', a: 'platform', why: 'Something you install and compile with is the <b>software platform</b>: here, a release of the CUDA Toolkit.' },
    ];
    const wrap = el('div', { class: 'hsa-mean' });
    f.stage.append(wrap);
    const linkEls = [];
    onWidth(wrap, (w) => { const one = w < 760;   /* below this the platform icon's labels would render under 9px */ wrap.classList.toggle('one', one); linkEls.forEach((l) => { l.querySelector('i').textContent = one ? '↓' : '→'; }); });
    const cards = {};
    KEYS.forEach((k, j) => {
      const b = el('button', { type: 'button', class: 'hsa-mcard', 'data-k': k, 'aria-pressed': 'false' });
      b.innerHTML = iconSVG(k) + `<span class="t"><span class="hsa-k">“CUDA” as</span><b>${M[k].short}</b><span class="d">${M[k].line}</span></span>` + (k === 'platform' ? '<span class="hsa-tag beyond">this entry</span>' : '');
      b.addEventListener('click', () => select(k));
      wrap.append(b);
      cards[k] = b;
      if (j < LINKS.length) {
        const l = el('div', { class: 'hsa-mlink', 'aria-hidden': 'true' });
        l.innerHTML = `<i>→</i><span>${LINKS[j]}</span>`;
        wrap.append(l);
        linkEls.push(l);
      }
    });
    const quiz = el('div', { class: 'hsa-quiz' });
    quiz.innerHTML = '<div class="hsa-quiz-top"><span class="hsa-k">Which CUDA is meant?</span><span class="hsa-k" data-n></span></div><p class="hsa-quiz-q" data-q></p><div class="hsa-quiz-a" data-a></div>';
    f.stage.append(quiz);
    const qEl = quiz.querySelector('[data-q]'), nEl = quiz.querySelector('[data-n]'), aEl = quiz.querySelector('[data-a]');
    const ans = {};
    KEYS.forEach((k) => { ans[k] = GG.ui.button(aEl, { label: M[k].short.replace(/^an? /, ''), onClick: () => answer(k) }); });
    aEl.append(el('span', { class: 'sp' }));
    const nextBtn = GG.ui.button(aEl, { label: 'Next sentence', icon: 'next', onClick: () => ask(qi + 1) });
    const stScore = GG.ui.stat(f.readouts, { label: 'correct', value: null });
    const stSel = GG.ui.stat(f.readouts, { label: 'showing', value: '' });
    let qi = 0, answered = false, right = 0, done = 0;
    function clearMarks() {
      KEYS.forEach((k) => { cards[k].classList.remove('ok', 'no'); ans[k].classList.remove('ok', 'no'); });
    }
    function select(k) {
      clearMarks();
      KEYS.forEach((j) => cards[j].setAttribute('aria-pressed', String(j === k)));
      stSel.set(M[k].short.replace(/^an? /, ''));
      f.setWhy(M[k].why);
    }
    function ask(i) {
      qi = ((i % Q.length) + Q.length) % Q.length;
      answered = false;
      clearMarks();
      qEl.innerHTML = Q[qi].q;
      nEl.textContent = `sentence ${qi + 1} of ${Q.length}`;
      KEYS.forEach((k) => { ans[k].disabled = false; });
      nextBtn.setLabel(qi === Q.length - 1 ? 'Start over' : 'Next sentence', 'next');
    }
    function answer(k) {
      if (answered) return;
      answered = true;
      const q = Q[qi];
      const ok = k === q.a;
      done++; if (ok) right++;
      stScore.set(`${right} of ${done}`, right === done ? 'core' : null);
      KEYS.forEach((j) => { cards[j].setAttribute('aria-pressed', 'false'); ans[j].disabled = j !== k && j !== q.a; });
      cards[q.a].classList.add('ok'); ans[q.a].classList.add('ok');
      if (!ok) { cards[k].classList.add('no'); ans[k].classList.add('no'); }
      stSel.set('answer: ' + M[q.a].short.replace(/^an? /, ''));
      f.setWhy((ok ? '<b>Right.</b> ' : `<b>Not quite: it’s ${M[q.a].short}.</b> `) + q.why);
    }
    ask(0);
    select('platform');
  }

  function lifeFig(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Build time and run time',
      hint: 'press play or step',
      wide: true,
      caption: 'One CUDA C++ program (the one built in the CUDA C++ entry) from source file to GPU. The build-time lane holds components used to <em>build</em> applications; the run-time lane, components used <em>within</em> or <em>from</em> them while they run. The tags say where each piece comes from on a Linux machine.',
    });
    const box = el('div', { class: 'hsa-life' });
    f.stage.append(box);
    onWidth(box, (w) => { box.classList.toggle('one', w < 640); ship.innerHTML = w < 640 ? '<i>↓</i> ship the executable' : '<i>→</i>ship'; });
    const node = (k, name, d, src, gpu) => `<div class="hsa-node${gpu ? ' gpu' : ''}" data-k="${k}"><span class="hsa-tag src">${src}</span><b>${name}</b><span class="d">${d}</span></div>`;
    box.innerHTML = `
      <div class="hsa-lane" data-lane="build"><div class="hsa-lane-h"><b>Build time</b><span>components used to build applications</span></div>
        ${node(0, 'block_sum.cu', 'CUDA C++ source: C++ plus kernels, launches, shared memory and barriers', 'you')}
        <div class="hsa-arr">↓</div>
        ${node(1, 'nvcc (+ gcc)', 'the NVIDIA CUDA Compiler Driver toolchain; hands host code to the host compiler', 'CUDA Toolkit')}
        <div class="hsa-arr">↓</div>
        ${node(2, 'block_sum', 'one executable: CPU machine code plus GPU code (PTX and SASS)', 'output')}
      </div>
      <div class="hsa-ship" data-ship></div>
      <div class="hsa-lane" data-lane="run"><div class="hsa-lane-h"><b>Run time</b><span>components used within or from applications</span></div>
        ${node(3, './block_sum', 'the program starts on the CPU, the host', 'you')}
        <div class="hsa-arr">↓</div>
        ${node(4, 'CUDA Runtime API', 'cudaMalloc, cudaMemcpy, kernel launches (libcudart, linked into the program)', 'CUDA Toolkit')}
        <div class="hsa-arr">↓</div>
        ${node(5, 'CUDA Driver API', 'libcuda.so, the user-space part of the driver', 'NVIDIA driver')}
        <div class="hsa-arr">↓</div>
        ${node(6, 'NVIDIA GPU driver', 'nvidia.ko, the kernel module that talks to the hardware', 'NVIDIA driver')}
        <div class="hsa-arr">↓</div>
        ${node(7, 'GPU', 'runs the kernel', 'hardware', true)}
      </div>`;
    const ship = box.querySelector('[data-ship]');
    ship.innerHTML = '<i>→</i>ship';
    const lanes = { build: box.querySelector('[data-lane="build"]'), run: box.querySelector('[data-lane="run"]') };
    const nodes = $$(box, '.hsa-node');
    const stPhase = GG.ui.stat(f.readouts, { label: 'phase', value: '' });
    const stGpu = GG.ui.stat(f.readouts, { label: 'needs a GPU', value: '' });
    const stFrom = GG.ui.stat(f.readouts, { label: 'comes with', value: '' });
    const steps = [
      { label: 'source', from: 'you', why: 'You write <b>CUDA C++</b>: an ordinary C++ file plus a kernel marked <code>__global__</code> and a <code>&lt;&lt;&lt;…&gt;&gt;&gt;</code> launch. Nothing about this step needs a GPU.' },
      { label: 'compile', from: 'CUDA Toolkit', why: `The <b>${T('nvcc', 'nvcc')}</b> toolchain compiles the GPU part itself and hands the CPU part to the host compiler, <code>gcc</code> on Linux. It comes with the CUDA Toolkit and runs happily on a machine with no GPU at all.` },
      { label: 'executable', from: 'output', why: 'The result is <b>one executable</b>: CPU machine code with the GPU code (PTX and SASS) embedded in it. By default nvcc also links the CUDA Runtime into it, so it can be copied to another machine. Build time is over.' },
      { label: 'run', from: 'you', why: 'On the machine that runs it, the program starts like any other, <b>on the CPU</b>. From here on every component is used <em>from</em> the running application.' },
      { label: 'Runtime API', from: 'CUDA Toolkit', why: `Its CUDA calls go to the <b>${T('cuda-runtime-api', 'CUDA Runtime API')}</b>, the ergonomic layer most programs use. It came from the CUDA Toolkit and was linked into the executable at build time.` },
      { label: 'Driver API', from: 'NVIDIA driver', why: `The Runtime API does its work through the <b>${T('cuda-driver-api', 'CUDA Driver API')}</b>, ${T('libcuda', 'libcuda.so')}. This file comes with the NVIDIA driver, not with the toolkit, so the machine running the program must have the driver installed.` },
      { label: 'GPU driver', from: 'NVIDIA driver', why: `The Driver API asks the kernel module ${T('nvidia-ko', 'nvidia.ko')}, the core of the ${T('nvidia-gpu-drivers', 'NVIDIA GPU drivers')}, to talk to the hardware on its behalf.` },
      { label: 'GPU', from: 'hardware', why: 'Finally the <b>GPU</b> runs the kernel: 1,048,576 threads adding up numbers. The build machine needed a compiler and no GPU; this machine needs a GPU and its driver, and no compiler.' },
    ];
    GG.ui.stepper(f.controls, {
      label: 'Step', steps, autoplay: 2300,
      onStep: (i) => {
        nodes.forEach((n) => { const k = +n.getAttribute('data-k'); n.classList.toggle('on', k === i); n.classList.toggle('done', k < i); });
        lanes.build.classList.toggle('on', i <= 2);
        lanes.run.classList.toggle('on', i >= 3);
        ship.classList.toggle('on', i === 3);
        stPhase.set(i <= 2 ? 'build time' : 'run time', i <= 2 ? 'host' : 'core');
        stGpu.set(i <= 2 ? 'no' : 'yes', i <= 2 ? null : 'core');
        stFrom.set(steps[i].from);
        f.setWhy(steps[i].why);
      },
    });
  }

  function platformStackFig(host, ctx) {
    const SAY = {
      libs: {
        apps: 'Your program needs a matrix multiplication. Instead of writing a kernel, it calls <b>cuBLAS</b>.',
        libs: `${T('cublas', 'cuBLAS')} picks a tuned ${T('kernel', 'kernel')} for these matrix shapes and launches it through the CUDA APIs below.`,
        runtime: 'The launch goes through the <b>Runtime API</b>, which libraries like cuBLAS are built on.',
        'driver-api': 'The Runtime API wraps the <b>Driver API</b>, which does the actual work.',
        driver: 'The <b>NVIDIA GPU Driver</b> is the only component that talks to the GPU.',
        gpu: 'The GPU runs cuBLAS’s kernel.',
      },
      runtime: {
        apps: 'Your own CUDA C++ program asks for GPU memory with <code>cudaMalloc</code>.',
        runtime: 'The <b>Runtime API</b> takes the call and forwards it to its Driver API equivalent.',
        'driver-api': 'In the <b>Driver API</b> the same request is <code>cuMemAlloc</code>.',
        driver: 'The <b>NVIDIA GPU Driver</b> reserves the memory on the device.',
        gpu: 'The allocation now exists in the GPU’s memory.',
      },
      driver: {
        apps: 'A few programs skip the Runtime API and call the <b>Driver API</b> themselves, here <code>cuMemAlloc</code>.',
        'driver-api': 'The <b>Driver API</b> offers more control, at the price of more code.',
        driver: 'The <b>NVIDIA GPU Driver</b> reserves the memory on the device.',
        gpu: 'Same result, one layer fewer.',
      },
    };
    const PATH = { libs: 'app-libs-runtime-driver-gpu', runtime: 'app-runtime-driver-gpu', driver: 'app-driver-gpu' };
    const TAGS = { libs: { libs: 'cublasSgemm' }, runtime: { runtime: 'cudaMalloc', 'driver-api': 'cuMemAlloc' }, driver: { 'driver-api': 'cuMemAlloc' } };
    const LABEL = { libs: 'through a library', runtime: 'through the Runtime API', driver: 'straight to the Driver API' };
    const { f, tk } = toolkitFig(host, ctx, {
      title: 'The CUDA Toolkit stack',
      hint: 'hover a layer · pick a route',
      wide: true,
      caption: `The run-time half of the CUDA software platform, redrawn from the glossary’s figure, which was adapted from ${PROF_CUDA}. Arrows point from caller to callee. Example libraries and applications are chips. The dashed chip, CUTLASS, is a toolkit for composing kernels rather than a library of ready-made ones. The NVIDIA GPU Driver is the only layer that talks to the GPU.`,
    }, { examples: true, animateCall: { path: PATH.libs, tags: TAGS.libs, say: SAY.libs } });
    if (!tk) return;
    const stL = GG.ui.stat(f.readouts, { label: 'layers crossed', value: '' });
    const stD = GG.ui.stat(f.readouts, { label: 'reaches the GPU via', value: 'the driver', tone: 'host' });
    void stD;
    function set(k, send) {
      const p = GG.components.toolkit.PATHS[PATH[k]];
      stL.set(String(p.length - 1));
      f.setWhy(`Route: <b>${LABEL[k]}</b>. ${p.map((x) => GG.components.toolkit.LAYERS_BY[x].name).join(' → ')}. Every route ends in the NVIDIA GPU Driver, the only component that talks to the GPU.`);
      if (send) tk.call(PATH[k], { tags: TAGS[k], say: SAY[k] });
    }
    GG.ui.seg(f.controls, { label: 'An application calls the GPU', value: 'libs', options: Object.keys(LABEL).map((k) => ({ value: k, label: LABEL[k] })), onChange: (k) => set(k, true) });
    set('libs', false);
  }

  GG.entry('cuda-software-platform', {
    render(body, ctx) {
      body.classList.add('hsa-body');
      const s = ctx.html(body, `
<p>“Developing CUDA programs” takes more than a compiler. The <strong>CUDA software platform</strong> collects the compiler toolchain that builds them, the APIs and drivers they call while they run, and the libraries and tools around both.</p>
<h3>One word, three things</h3>
<p>CUDA stands for <em>Compute Unified Device Architecture</em>. Depending on the context, “CUDA” can refer to multiple distinct things:</p>
<ul>
<li>a high-level ${T('cuda-device-architecture', 'device architecture')}, a way of designing GPU hardware;</li>
<li>a ${T('cuda-programming-model', 'parallel programming model')} for architectures with that design;</li>
<li>a <b>software platform</b> that extends high-level languages like C to add that programming model.</li>
</ul>
<p>The three are layered. The platform is how you write programs in the model, and the model is how you put the architecture to work. Fig. 1 draws them in that order, as a chain. Context usually makes it clear which one someone means; the quiz under the chain lets you practise.</p>
<div data-slot="mean" class="wide"></div>
${GG.noteHTML('history', `<p>The vision for CUDA is laid out in the ${X(LINDHOLM, 'Lindholm et al., 2008')} white paper, “NVIDIA Tesla: A Unified Graphics and Computing Architecture”, by Erik Lindholm, John Nickolls, Stuart Oberman and John Montrym, published in <i>IEEE Micro</i>. The glossary highly recommends it: it is the original source for many claims, diagrams, and even specific turns of phrase in NVIDIA’s documentation.</p>`)}
<h3>CUDA C++, and the other CUDAs</h3>
<p>This entry is about the CUDA <em>software platform</em>. Though CUDA software platforms exist for other languages, like FORTRAN, Python, and ${T('cutile-basic', 'BASIC')}, the glossary (and this site) focuses on the dominant ${T('cuda-c', 'CUDA C++')} version.</p>
<div data-slot="langs"></div>
<h3>Building versus running</h3>
<p>The platform can be roughly divided into two groups. There are the components used to <em>build</em> applications, like the ${T('nvcc', 'NVIDIA CUDA Compiler Driver')} toolchain. And there are the components used <em>within</em> or <em>from</em> applications while they run, like the ${T('cuda-driver-api', 'CUDA Driver API')} and the ${T('cuda-runtime-api', 'CUDA Runtime API')}. Fig. 2 follows one program through both.</p>
<div data-slot="life" class="wide"></div>
<p>The split has a practical consequence. The machine that builds a CUDA program needs the toolchain but no GPU. The machine that runs it needs a GPU and its driver but no compiler.</p>
<h3>The stack you call at run time</h3>
<p>The run-time components are usually drawn as a stack, from applications at the top down to the GPU. Fig. 3 redraws the glossary’s version of that diagram, which it adapted from ${PROF_CUDA}. Arrows point from caller to callee: applications can call the libraries, the Runtime API, or even the Driver API directly.</p>
<div data-slot="stack" class="wide"></div>
<p>Built on top of these APIs are libraries of high-performance ${T('kernel', 'kernels')} for general and specific domains, like ${T('cublas', 'cuBLAS')} for linear algebra and ${T('cudnn', 'cuDNN')} for deep neural networks. Alongside them are tools for composing such kernels yourself, like ${T('cutlass', 'CUTLASS')} and ${T('cute-dsl', 'CuTe DSL')}. The difference is who writes the kernel. A library hands you ready-to-call kernels for common operations. A kernel-composition tool hands you building blocks (data layouts, tiles, hardware copy and matrix-multiply operations) to assemble a fast kernel of your own.</p>
${GG.noteHTML('beyond', `<p><b>Where each piece comes from on Linux.</b> The <b>CUDA Toolkit</b> download brings nvcc, the headers, the Runtime API (${T('libcudart', 'libcudart.so')} and a static version of it), libraries like cuBLAS, and tools. The <b>NVIDIA driver</b> is installed separately and brings the Driver API (${T('libcuda', 'libcuda.so')}), the kernel module ${T('nvidia-ko', 'nvidia.ko')}, ${T('nvml', 'NVML')} and ${T('nvidia-smi', 'nvidia-smi')}. cuDNN is a separate download again.</p>`)}
<div data-slot="read"></div>`);
      guard(s.mean, 'Three meanings', () => meaningsFig(s.mean, ctx));
      s.langs.innerHTML = GG.tableHTML(`<thead><tr><th>language</th><th>for example</th><th>what it is</th></tr></thead><tbody>
        <tr><td>C++</td><td>${T('cuda-c', 'CUDA C++')}</td><td>The dominant version: C++ plus kernel definitions, launches, shared memory, barriers and built-in index variables. Compiled with ${T('nvcc', 'nvcc')}.</td></tr>
        <tr><td>FORTRAN</td><td>CUDA Fortran</td><td>Fortran with the same kind of extensions. <span class="hsa-tag beyond">beyond the glossary</span> NVIDIA’s <code>nvfortran</code> compiler, part of the NVIDIA HPC SDK, compiles it.</td></tr>
        <tr><td>Python</td><td>${T('cute-dsl', 'CuTe DSL')}, ${X('https://docs.nvidia.com/cuda/cutile-python/quickstart.html', 'cuTile Python')}</td><td>Ways to write kernels from Python: CuTe DSL is part of ${T('cutlass', 'CUTLASS')}; cuTile Python implements the ${T('cuda-tile-programming-model', 'CUDA Tile programming model')}.</td></tr>
        <tr><td>BASIC</td><td>${T('cutile-basic', 'cuTile BASIC')}</td><td>Released as an April Fools’ joke, yet a real, if toy, implementation of the CUDA Tile programming model.</td></tr></tbody>`);
      guard(s.life, 'Build and run', () => lifeFig(s.life, ctx));
      guard(s.stack, 'Toolkit stack', () => platformStackFig(s.stack, ctx));
      ctx.reading(s.read, [
        { href: LINDHOLM, label: 'Lindholm, Nickolls, Oberman and Montrym, “NVIDIA Tesla: A Unified Graphics and Computing Architecture”, IEEE Micro, 2008', note: 'the vision for CUDA; the glossary highly recommends it' },
        { href: 'https://docs.nvidia.com/cuda/', label: 'NVIDIA CUDA Toolkit documentation', note: 'every component of the platform, from nvcc to the libraries' },
      ]);
    },
  });

  /* ═════════════════════════════ cuda-c ═════════════════════════════ */

  const BLOCK_SUM = `#include <cstdio>
#include <vector>

// Each thread block adds up 256 numbers into one partial sum.
__global__ void block_sum(const float *x, float *partial, int n) {
  __shared__ float buf[256];                     // one array per block

  int i = blockIdx.x * blockDim.x + threadIdx.x; // this thread's number
  buf[threadIdx.x] = (i < n) ? x[i] : 0.0f;
  __syncthreads();                               // wait: buf is full

  for (int s = blockDim.x / 2; s > 0; s /= 2) {  // tree reduction
    if (threadIdx.x < s) buf[threadIdx.x] += buf[threadIdx.x + s];
    __syncthreads();                             // finish each level
  }
  if (threadIdx.x == 0) partial[blockIdx.x] = buf[0];
}

int main() {
  const int n = 1 << 20;                         // 1,048,576 numbers
  const int threads = 256;                       // threads per block
  const int blocks = (n + threads - 1) / threads; // 4,096 blocks
  size_t bytes = n * sizeof(float);

  std::vector<float> x(n, 1.0f), partial(blocks);
  float *d_x, *d_partial;                        // GPU memory
  cudaMalloc(&d_x, bytes);
  cudaMalloc(&d_partial, blocks * sizeof(float));
  cudaMemcpy(d_x, x.data(), bytes, cudaMemcpyHostToDevice);

  block_sum<<<blocks, threads>>>(d_x, d_partial, n);  // launch

  cudaMemcpy(partial.data(), d_partial, blocks * sizeof(float),
             cudaMemcpyDeviceToHost);            // waits for the kernel
  float sum = 0.0f;
  for (float p : partial) sum += p;
  printf("sum = %.0f\\n", sum);                   // prints sum = 1048576
  cudaFree(d_x);
  cudaFree(d_partial);
}`;
  const BS_LINES = BLOCK_SUM.split('\n');
  const BS_DEVICE = [4, 17];   // inclusive line range of device code

  function featuresFig(host, ctx) {
    const f = ctx.figure(host, {
      title: 'What CUDA C++ adds to C++',
      hint: 'step through, or click a lit line',
      wide: true,
      caption: 'A complete CUDA C++ program (ours, not the glossary’s): it sums 2<sup>20</sup> ones, 256 at a time per thread block, and prints <code>sum = 1048576</code>. Everything that is not highlighted in some step is ordinary C++. Error checking is left out to keep it short.',
    });
    const grid = el('div', { class: 'hsa-cc' });
    f.stage.append(grid);
    const left = el('div', { class: 'hsa-w' });
    const card = el('div', { class: 'hsa-feat', 'aria-live': 'polite' });
    grid.append(left, card);
    onWidth(grid, (w) => grid.classList.toggle('one', w < 820));
    const code = ctx.code(left, { lang: 'cuda', code: BLOCK_SUM, caption: 'block_sum.cu' });
    // tag tokens so a step can make its keyword glow
    $$(code.el, '.ln span').forEach((sp) => { sp.setAttribute('data-w', sp.textContent); });
    const FEATS = [
      {
        label: '__global__', lines: [5], tone: 'core', words: ['__global__'], syn: '__global__',
        title: 'Kernel definition',
        body: `<p><code>__global__</code> marks <code>block_sum</code> as a ${T('kernel', 'kernel')}: a function that runs on the GPU, once per thread, and is launched from the CPU. Like every kernel it takes pointers in (<code>x</code> and <code>partial</code> point into the GPU’s ${T('global-memory', 'global memory')}) and has return type <code>void</code>. It hands back results by writing through its pointers; a million threads could not all return one value.</p><p>It may also take plain values, like <code>n</code>, which are copied to the GPU when the kernel is launched.</p>`,
        gq: 'Glossary: <b>kernel definition with <code>__global__</code></b>. CUDA kernels are C++ functions that take in pointers and have return type void.',
        why: '<b>Step 1 of 5.</b> <code>__global__</code> turns an ordinary C++ function into a GPU kernel.',
      },
      {
        label: '__shared__', lines: [6], tone: 'memory', words: ['__shared__'], syn: '__shared__',
        title: 'Shared memory allocation',
        body: `<p><code>__shared__ float buf[256]</code> gives every ${T('thread-block', 'thread block')} its own array of 256 floats (1 KiB) in ${T('shared-memory', 'shared memory')}, a fast on-chip scratchpad that the threads of one block can all read and write and nothing outside the block can see.</p><p>The launch below makes 4,096 blocks, so there will be 4,096 separate <code>buf</code>s, each existing only while its block runs.</p>`,
        gq: 'Glossary: <b>shared memory allocation with the <code>shared</code> keyword</b>. In source code it is spelled <code>__shared__</code>, see the note below.',
        why: '<b>Step 2 of 5.</b> <code>__shared__</code> allocates one array per thread block in fast on-chip memory.',
      },
      {
        label: 'indexing', lines: [8, 9, 12, 13, 16], tone: null, words: ['threadIdx', 'blockDim', 'blockIdx'], syn: 'threadIdx · blockDim',
        title: 'Thread and block indexing',
        body: `<p>Every ${T('thread', 'thread')} runs the same code, so each needs to know which one it is. Built-in variables tell it: <code>threadIdx.x</code> is its index within its block (0 to 255 here), <code>blockDim.x</code> is the block’s size (256), and <code>blockIdx.x</code> is the block’s index within the grid (0 to 4,095).</p><p><code>blockIdx.x * blockDim.x + threadIdx.x</code> turns them into one global index <code>i</code>: thread 3 of block 2 handles number 2 × 256 + 3 = 515. Each also has <code>.y</code> and <code>.z</code> parts, for 2-D and 3-D problems.</p>`,
        gq: 'Glossary: <b>thread block and thread indexing with the <code>blockDim</code> and <code>threadIdx</code> built-in variables</b>. <code>blockIdx</code> is their sibling.',
        why: '<b>Step 3 of 5.</b> Built-in variables tell each of the 1,048,576 threads who it is and which number is its own.',
      },
      {
        label: '__syncthreads()', lines: [10, 14], tone: 'control', words: ['__syncthreads'], syn: '__syncthreads()',
        title: 'Barrier synchronization',
        body: `<p><code>__syncthreads()</code> is an <em>intrinsic function</em>: one the compiler knows and turns straight into a GPU instruction, here a barrier. Every thread of the block waits at it until all of them have arrived.</p><p>Line 10 guarantees <code>buf</code> is completely filled before any thread reads a neighbour’s slot. Line 14 makes each level of the reduction finish before the next begins. The barrier covers one block only: different blocks never wait for each other at it.</p>`,
        gq: 'Glossary: <b>barrier synchronization with the <code>__syncthreads()</code> intrinsic function</b>.',
        why: '<b>Step 4 of 5.</b> <code>__syncthreads()</code> makes all 256 threads of a block wait for each other.',
      },
      {
        label: '<<<>>>', lines: [31], tone: 'control', words: ['<<<', '>>>'], syn: '<<<blocks, threads>>>',
        title: 'Kernel launch',
        body: `<p>Back on the CPU, <code>block_sum&lt;&lt;&lt;blocks, threads&gt;&gt;&gt;(…)</code> launches the kernel. The triple angle brackets set the ${T('thread-block-grid', 'thread block grid')}’s dimensions: 4,096 blocks of 256 threads, 1,048,576 threads in all, one per number. The arguments in parentheses go to every thread.</p><p>The launch returns to the CPU right away, while the GPU works. The <code>cudaMemcpy</code> on line 33 waits for the kernel to finish before it copies the partial sums back.</p>`,
        gq: 'Glossary: <b>kernel launches with <code>&lt;&lt;&lt;&gt;&gt;&gt;</code></b>, a triple bracket syntax, used from the CPU host, that sets the thread block grid dimensions.',
        why: '<b>Step 5 of 5.</b> <code>&lt;&lt;&lt;blocks, threads&gt;&gt;&gt;</code> launches the kernel from the CPU as a grid of 4,096 blocks × 256 threads.',
      },
    ];
    const lineToFeat = {};
    FEATS.forEach((ft, k) => ft.lines.forEach((n) => { if (lineToFeat[n] == null) lineToFeat[n] = k; }));
    Object.keys(lineToFeat).forEach((n) => {
      const ln = code.line(+n);
      if (!ln) return;
      ln.classList.add('hsa-pick');
      ln.addEventListener('click', () => stepper.go(lineToFeat[n]));
    });
    const stL = GG.ui.stat(f.readouts, { label: 'highlighted', value: '' });
    const stC = GG.ui.stat(f.readouts, { label: 'runs on', value: '' });
    function show(k) {
      const ft = FEATS[k];
      code.clear();
      $$(code.el, 'span.hsa-glow').forEach((sp) => sp.classList.remove('hsa-glow'));
      code.highlight(ft.lines, ft.tone || undefined);
      ft.lines.forEach((n) => {
        const ln = code.line(n);
        if (!ln) return;
        $$(ln, 'span[data-w]').forEach((sp) => { if (ft.words.includes(sp.getAttribute('data-w'))) sp.classList.add('hsa-glow'); });
      });
      card.innerHTML = `<div class="hsa-k">feature ${k + 1} of ${FEATS.length} · ${esc(ft.title)}</div><div class="syn ${ft.tone || 'accent'}">${esc(ft.syn)}</div>${ft.body}<div class="gq">${ft.gq}</div>`;
      stL.set((ft.lines.length === 1 ? 'line ' : 'lines ') + ft.lines.join(', '));
      stC.set(ft.lines[0] <= BS_DEVICE[1] ? 'GPU (device)' : 'CPU (host)', ft.lines[0] <= BS_DEVICE[1] ? 'core' : 'host');
      f.setWhy(ft.why);
    }
    const stepper = GG.ui.stepper(f.controls, { label: 'Feature', steps: FEATS.map((x) => ({ label: x.label })), onStep: show });
  }

  function reductionFig(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Inside one thread block',
      hint: 'step through · flip the barrier switch',
      wide: true,
      caption: 'The kernel’s tree reduction, drawn with a 16-thread block so every value fits (the program’s blocks have 256 threads, which take 8 levels instead of 4). Wavy lines are threads (green while working); bright blue cells are the block’s <code>__shared__</code> array <code>buf</code>, dim dashed ones its slice of global <code>x</code>; green arcs are additions (dashed grey: a preview of the next ones); the amber bar is a <code>__syncthreads()</code> barrier. With the barriers removed, the figure plays one possible unlucky timing, picked at random (illustrative): each number on an arc is the value that read actually got, red when it was stale.',
    });
    const N = 16;
    const holder = el('div', { class: 'hsa-w' });
    f.stage.append(holder);
    const codeStrip = el('div', { class: 'hsa-red-code' });
    f.stage.append(codeStrip);
    const LINES = { load: 9, bar1: 10, add: 13, bar: 14, out: 16 };
    const steps = [{ kind: 'load' }, { kind: 'bar', after: 'load' }];
    for (let s = N / 2; s >= 1; s /= 2) { steps.push({ kind: 'add', s }); steps.push({ kind: 'bar', after: s }); }
    steps.push({ kind: 'out' });
    const state = { i: 0, noBar: false, layout: null, timing: null };
    let svg = null, G = null;
    const LEVELS = steps.filter((x) => x.kind === 'add').map((x) => x.s);

    /* buf contents after executing steps[0..upto]. With stale = {s: bool[]} (barriers removed), a reader
       marked stale at level s sees the slot's value from before its writer's latest store. */
    function values(upto, stale) {
      const v = new Array(N).fill(null), prev = new Array(N).fill(0);
      const fresh = new Array(N).fill(false), live = new Array(N).fill(true);
      const got = new Array(N).fill(null), bad = new Array(N).fill(false);   // per reader t at this step
      let staleSoFar = 0;
      for (let k = 0; k <= upto; k++) {
        const st = steps[k];
        fresh.fill(false); got.fill(null); bad.fill(false);
        if (st.kind === 'load') { for (let t = 0; t < N; t++) { prev[t] = v[t] == null ? 0 : v[t]; v[t] = 1; fresh[t] = true; } }
        if (st.kind === 'add') {
          for (let t = 0; t < st.s; t++) {
            const isStale = !!(stale && stale[st.s] && stale[st.s][t]);
            got[t] = isStale ? prev[t + st.s] : v[t + st.s];
            bad[t] = isStale;
            if (isStale) staleSoFar++;
          }
          for (let t = 0; t < st.s; t++) { prev[t] = v[t]; v[t] += got[t]; fresh[t] = true; }
          for (let t = st.s; t < N; t++) live[t] = false;
        }
      }
      return { v, fresh, live, got, bad, staleSoFar };
    }
    /* One unlucky interleaving, reproducible from its seed, whose final sum is wrong. */
    function makeTiming(seed) {
      for (let tries = 0; tries < 500; tries++, seed++) {
        let a = seed >>> 0;
        const rnd = () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
        const stale = {};
        LEVELS.forEach((s) => { stale[s] = Array.from({ length: s }, () => rnd() < 0.3); });
        const end = values(steps.length - 1, stale);
        if (end.v[0] !== N) return { seed, stale, total: end.staleSoFar, sum: end.v[0] };
      }
      return null;
    }
    state.timing = makeTiming(7);
    function geom(kind) {
      const wide = kind === 'wide';
      const W = wide ? 760 : 360;
      const x0 = wide ? 112 : 8, x1 = W - 8;
      const cw = (x1 - x0) / N;
      return { W, x0, x1, cw, wide, cx: (t) => x0 + cw * (t + 0.5), yT: wide ? 16 : 30, yStrTop: wide ? 24 : 38, yX: wide ? 40 : 54, hX: 22, yB: wide ? 104 : 118, hB: 30, yArc: wide ? 134 : 148, yBar: wide ? 196 : 208, H: wide ? 250 : 270 };
    }
    function build(kind) {
      state.layout = kind;
      G = geom(kind);
      holder.innerHTML = '';
      svg = svgRoot(holder, G.W, G.H, 'A 16-thread block performing a tree reduction in shared memory', 'hsa-rsvg');
      render();
    }
    function render() {
      if (!svg) return;
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      const g = G, st = steps[state.i];
      const race = state.noBar && state.timing;
      const { v, fresh, live, got, bad, staleSoFar } = values(state.i, race ? state.timing.stale : null);
      const badSrc = new Array(N).fill(false);
      if (st.kind === 'add') for (let t = 0; t < st.s; t++) if (bad[t]) badSrc[t + st.s] = true;
      const defs = S('defs', null, svg);
      [['hsa-ah-core', 'var(--core)'], ['hsa-ah-race', 'var(--danger)'], ['hsa-ah-mem', 'var(--memory)']].forEach(([id, c]) => {
        const m = S('marker', { id, viewBox: '0 0 8 8', refX: 7, refY: 4, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
        S('path', { d: 'M0 0L8 4L0 8z', fill: c }, m);
      });
      // row labels
      if (g.wide) {
        txt(svg, 4, g.yT + 3, 'threadIdx.x', { class: 'rowl' });
        txt(svg, 4, g.yX + 15, 'x (global)', { class: 'rowl' });
        txt(svg, 4, g.yB + 19, 'buf (shared)', { class: 'rowl' });
      } else {
        txt(svg, g.x0, 12, 'threadIdx.x · x (global memory) · buf (shared memory)', { class: 'rowl' });
      }
      const active = (t) => (st.kind === 'load') || (st.kind === 'add' && t < st.s) || (st.kind === 'out' && t === 0);
      for (let t = 0; t < N; t++) {
        const cx = g.cx(t);
        txt(svg, cx, g.yT + 3, String(t), { class: 'tl' + (active(t) ? ' on' : ''), 'text-anchor': 'middle' });
        // global memory slice
        S('rect', { x: r2(cx - g.cw / 2 + 2), y: g.yX, width: r2(g.cw - 4), height: g.hX, rx: 3, class: 'cell xcell' }, svg);
        txt(svg, cx, g.yX + 15, '1', { class: 'val stale', 'text-anchor': 'middle' });
        // strand from label to buf, cut at the barrier on barrier steps
        S('path', { d: strand(cx, g.yStrTop + (g.wide ? 0 : 0), g.yX - 2, 2.2), class: 'str' + (active(t) ? ' on' : '') }, svg);
        const cls = badSrc[t] ? 'cell bcell bad' : v[t] == null ? 'cell bcell stale' : !live[t] ? 'cell bcell stale' : fresh[t] ? 'cell bcell fresh' : 'cell bcell';
        S('rect', { x: r2(cx - g.cw / 2 + 2), y: g.yB, width: r2(g.cw - 4), height: g.hB, rx: 4, class: cls }, svg);
        txt(svg, cx, g.yB + 19.5, v[t] == null ? '·' : String(v[t]), { class: 'val' + (live[t] ? '' : ' stale'), 'text-anchor': 'middle' });
      }
      // operation arrows
      if (st.kind === 'load') {
        for (let t = 0; t < N; t++) {
          const cx = g.cx(t);
          S('line', { x1: r2(cx), y1: g.yX + g.hX + 2, x2: r2(cx), y2: g.yB - 3, class: 'ld', 'marker-end': 'url(#hsa-ah-mem)' }, svg);
        }
        // preview of the first level (same geometry as the s = N/2 arcs below), so the space under buf shows what comes next
        const yb = g.yB + g.hB + 2, depth = 50;
        for (let t = 0; t < N / 2; t++) {
          const a = g.cx(t + N / 2), b = g.cx(t);
          S('path', { d: `M${r2(a)} ${r2(yb)}C${r2(a)} ${r2(yb + depth)} ${r2(b)} ${r2(yb + depth)} ${r2(b)} ${r2(yb + 1)}`, class: 'arc ghost' }, svg);
        }
        txt(svg, g.x0, g.yBar + 20, `next, after a barrier: level s = ${N / 2}, ${N / 2} additions`, { class: 'ghostl' });
      }
      let racy = 0, staleHere = 0;
      if (st.kind === 'add') {
        for (let t = 0; t < st.s; t++) {
          const a = g.cx(t + st.s), b = g.cx(t);
          const depth = 16 + 34 * (st.s / (N / 2));
          const yb = g.yB + g.hB + 2;
          const cls = race ? (bad[t] ? ' race bad' : ' race') : '';
          S('path', { d: `M${r2(a)} ${r2(yb)}C${r2(a)} ${r2(yb + depth)} ${r2(b)} ${r2(yb + depth)} ${r2(b)} ${r2(yb + 1)}`, class: 'arc' + cls, 'marker-end': `url(#${race ? 'hsa-ah-race' : 'hsa-ah-core'})` }, svg);
          if (race) {
            racy++;
            if (bad[t]) staleHere++;
            txt(svg, r2((a + b) / 2), r2(yb + depth * 0.75 + 4), String(got[t]), { class: 'q' + (bad[t] ? '' : ' lucky'), 'text-anchor': 'middle' });
          }
        }
      }
      if (st.kind === 'out') {
        const cx = g.cx(0);
        const ox = g.wide ? g.x0 + g.cw * 3 : g.x0 + g.cw * 4.5, oy = g.yBar - 18;
        S('path', { d: `M${r2(cx)} ${g.yB + g.hB + 2}V${r2(oy + 10)}H${r2(ox - 2)}`, class: 'ld', fill: 'none', 'marker-end': 'url(#hsa-ah-mem)' }, svg);
        const outBox = S('rect', { x: r2(ox), y: r2(oy), height: 22, rx: 4, class: 'cell outc' }, svg);
        const outT = txt(svg, ox + 8, oy + 15, `partial[blockIdx.x] = ${v[0]}`, { class: 'val' });
        const ow = r2((outT.getComputedTextLength() || outT.textContent.length * 7.4) + 16);   // sized to its text
        outBox.setAttribute('width', ow);
        if (race && v[0] !== N) txt(svg, g.wide ? ox + ow + 14 : ox, g.wide ? oy + 15 : oy + 38, `expected ${N}, got ${v[0]}`, { class: 'q' });
      }
      // barrier
      if (st.kind === 'bar') {
        const miss = state.noBar;
        S('rect', { x: g.x0, y: g.yBar - 3, width: r2(g.x1 - g.x0), height: 6, rx: 3, class: 'bar' + (miss ? ' miss' : '') }, svg);
        txt(svg, g.x0, g.yBar + 20, miss ? 'no __syncthreads() here: each thread runs on as soon as it can' : `__syncthreads(): all ${N} threads wait here until every one has arrived`, { class: 'barl' + (miss ? ' miss' : '') });
        if (!miss) for (let t = 0; t < N; t++) S('path', { d: strand(g.cx(t), g.yB + g.hB + 6, g.yBar - 5, 2), class: 'str on', style: 'stroke:var(--control)' }, svg);
      }
      // readouts + why
      const lvl = st.kind === 'add' ? st.s : null;
      const barsSoFar = steps.slice(0, state.i + 1).filter((x) => x.kind === 'bar').length;
      const crossTotal = N - 1;
      let crossUpTo = 0;
      steps.slice(0, state.i + 1).forEach((x) => { if (x.kind === 'add') crossUpTo += x.s; });
      stPhase.set(st.kind === 'load' ? 'load' : st.kind === 'bar' ? 'barrier' : st.kind === 'add' ? `level s = ${lvl}` : 'write result');
      stAct.set(st.kind === 'bar' ? (state.noBar ? '—' : 'all wait') : st.kind === 'load' ? `${N} of ${N}` : st.kind === 'add' ? `${lvl} of ${N}` : `1 of ${N}`, st.kind === 'bar' ? 'control' : 'core');
      stBar.set(state.noBar ? '0 (removed)' : `${barsSoFar} of 5`, state.noBar ? 'danger' : 'control');
      stRace.set(state.noBar ? `${crossUpTo} of ${crossTotal}` : `0 of ${crossTotal}`, state.noBar && crossUpTo ? 'danger' : 'core');
      stStale.set(race ? `${staleSoFar} so far` : '0', race && staleSoFar ? 'danger' : 'core');
      const ln = st.kind === 'load' ? LINES.load : st.kind === 'bar' ? (st.after === 'load' ? LINES.bar1 : LINES.bar) : st.kind === 'add' ? LINES.add : LINES.out;
      codeStrip.innerHTML = `<span class="n">${ln}</span>${GG.highlightLine(BS_LINES[ln - 1].replace(/\s+\/\/.*$/, '').trim(), 'cuda')}${state.noBar && st.kind === 'bar' ? '  <span class="tk-com">// removed</span>' : ''}`;
      let why;
      if (st.kind === 'load') why = `Every thread copies its own number from global memory into its own slot, <code>buf[threadIdx.x]</code>. All ${N} threads are busy.`;
      else if (st.kind === 'bar') {
        if (state.noBar) why = `<b>The barrier is gone.</b> Nothing stops a fast thread from racing ahead to the next line and reading a slot its neighbour has not written yet.`;
        else why = st.after === 'load' ? `<b>Barrier.</b> No thread may start adding until all ${N} have stored their number, because each is about to read a slot another thread filled.` : `<b>Barrier.</b> Level s = ${st.after} must be completely finished before level s = ${st.after / 2} reads its results.`;
      } else if (st.kind === 'add') {
        why = race
          ? `<b>A race.</b> Threads 0 to ${lvl - 1} each read <code>buf[threadIdx.x + ${lvl}]</code>, written by a different thread. With no barrier, each read sees the old value or the new one, depending on timing. In this timing ${staleHere ? `<b>${staleHere} of the ${racy}</b> reads came too early and got the old value (red numbers, red source cells)${lvl === N / 2 ? '. Here “old” means the slot was not loaded yet; shared memory then holds leftover data, which we draw as 0' : ''}` : `all ${racy} reads were lucky and saw the new value`}.`
          : `<b>Level s = ${lvl}.</b> Threads 0 to ${lvl - 1} each add <code>buf[threadIdx.x + ${lvl}]</code> into <code>buf[threadIdx.x]</code>; the other ${N - lvl} threads sit this level out. Every slot read was filled before the last barrier, so every value is final.`;
      } else why = race ? `Thread 0 writes <b>${v[0]}</b> instead of ${N}: ${staleSoFar} stale read${staleSoFar === 1 ? '' : 's'} lost part of the sum. A real GPU would give a different wrong answer from run to run, and sometimes the right one, which makes such bugs hard to find. Replay to try another timing.` : `Thread 0 writes the block’s sum, <b>${v[0]}</b>, to global memory. The real kernel does the same with 256 threads: 8 levels, 255 additions, 9 barriers, and a partial sum of 256 per block.`;
      f.setWhy(why);
    }
    const stPhase = GG.ui.stat(f.readouts, { label: 'now', value: '' });
    const stAct = GG.ui.stat(f.readouts, { label: 'threads working', value: '' });
    const stBar = GG.ui.stat(f.readouts, { label: 'barriers passed', value: '' });
    const stRace = GG.ui.stat(f.readouts, { label: 'unprotected reads', value: '' });
    const stStale = GG.ui.stat(f.readouts, { label: 'stale reads', value: '' });
    const stepper = GG.ui.stepper(f.controls, { label: 'Step', steps: steps.map((x) => ({ label: x.kind })), autoplay: 1500, onStep: (i) => { state.i = i; render(); } });
    GG.ui.toggle(f.controls, { label: 'remove the __syncthreads() calls', value: false, onChange: (v) => { state.noBar = v; replay.style.display = v ? '' : 'none'; render(); } });
    const replay = GG.ui.button(f.controls, { label: 'replay with another unlucky timing', icon: 'reset', onClick: () => { const nt = makeTiming(((state.timing && state.timing.seed) || 7) + 1); if (nt) state.timing = nt; render(); } });
    replay.style.display = 'none';
    onWidth(holder, (w) => { const want = w < 560 ? 'narrow' : 'wide'; if (want !== state.layout) build(want); });
    build((f.stage.getBoundingClientRect().width || 700) < 560 ? 'narrow' : 'wide');
    void stepper;
  }

  function geometryFig(host, ctx) {
    const f = ctx.figure(host, {
      title: 'The launch: <<<blocks, threads>>>',
      hint: 'drag the sliders',
      wide: true,
      caption: 'How a launch covers n numbers. Top: the whole grid of blocks. Below: the selected block, zoomed, split into warps of 32 consecutive threads. Hatched red threads have <code>i ≥ n</code>: they are launched but have no number, which is why the kernel checks <code>i &lt; n</code>. Blocks run in no guaranteed order.',
    });
    const holder = el('div', { class: 'hsa-w' });
    f.stage.append(holder);
    const fx = el('div', { class: 'hsa-fx', 'aria-live': 'polite' });
    f.stage.append(fx);
    const st = { n: 1 << 20, threads: 256, i: 515, layout: null };
    let svg = null;
    const MAXN = 1 << 24;
    function derived() {
      const threads = st.threads;
      const blocks = Math.max(1, Math.ceil(st.n / threads));
      const total = blocks * threads;
      const idle = total - st.n;
      const i = Math.max(0, Math.min(total - 1, st.i));
      return { threads, blocks, total, idle, i, b: Math.floor(i / threads), t: i % threads };
    }
    function draw() {
      const d = derived();
      const wide = st.layout !== 'narrow';
      const W = wide ? 760 : 360, x0 = 10, x1 = W - 10, w = x1 - x0;
      const top = wide ? 0 : 15;   // the narrow header takes two lines
      const H = (wide ? 190 : 206) + top;
      holder.innerHTML = '';
      svg = svgRoot(holder, W, H, `Launch geometry: ${d.blocks} blocks of ${d.threads} threads`, 'hsa-geo');
      hatchDefs(svg);
      const fs = GG.fmt.int;
      const head1 = `grid: ${fs(d.blocks)} block${d.blocks === 1 ? '' : 's'} × ${fs(d.threads)} threads`, head2 = `= ${fs(d.total)} threads`;
      if (wide) txt(svg, x0, 14, head1 + ' ' + head2, { class: 'head' });
      else { txt(svg, x0, 14, head1, { class: 'head' }); txt(svg, x0, 29, head2, { class: 'head' }); }
      // grid ruler
      const gy = 26 + top, gh = 26;
      let bx0, bx1;
      if (d.blocks <= 48) {
        const gap = d.blocks > 24 ? 1.5 : 3;
        const bw = (w - gap * (d.blocks - 1)) / d.blocks;
        for (let b = 0; b < d.blocks; b++) {
          const x = x0 + b * (bw + gap);
          const last = b === d.blocks - 1;
          const actW = last && d.idle ? bw * (1 - d.idle / d.threads) : bw;
          S('rect', { x: r2(x), y: gy, width: r2(Math.max(0.5, actW)), height: gh, rx: 2, class: 'blk' + (b === d.b ? ' sel' : '') }, svg);
          if (last && d.idle) S('rect', { x: r2(x + actW), y: gy, width: r2(bw - actW), height: gh, rx: 1, class: 'idle' }, svg);
          if (b === d.b) { bx0 = x; bx1 = x + bw; }
        }
      } else {
        S('rect', { x: x0, y: gy, width: w, height: gh, rx: 3, class: 'blk' }, svg);
        const bw = Math.max(3, w / d.blocks);
        const x = Math.min(x1 - bw, x0 + (d.b / d.blocks) * w);
        S('rect', { x: r2(x), y: gy - 3, width: r2(bw), height: gh + 6, rx: 1.5, class: 'blk sel' }, svg);
        bx0 = x; bx1 = x + bw;
        if (d.idle) {
          const iw = Math.max(3, (d.idle / d.total) * w);
          S('rect', { x: r2(x1 - iw), y: gy, width: r2(iw), height: gh, class: 'idle' }, svg);
        }
        txt(svg, x0 + 6, gy + 17, `block 0`, { class: 'lab dim' });
        txt(svg, x1 - 6, gy + 17, `block ${fs(d.blocks - 1)}`, { class: 'lab dim', 'text-anchor': 'end' });
      }
      // zoom connector
      const zy = (wide ? 92 : 104) + top, zh = 34;
      S('path', { d: `M${r2(bx0)} ${gy + gh + 2}L${x0} ${zy - 4}H${x1}L${r2(bx1)} ${gy + gh + 2}Z`, class: 'zoom' }, svg);
      const zl = `block ${fs(d.b)} · blockIdx.x = ${fs(d.b)}`, zlw = zl.length * 6.7 + 12;
      S('rect', { x: r2((x0 + x1) / 2 - zlw / 2), y: zy - 24, width: r2(zlw), height: 17, rx: 4, fill: '#121420', stroke: 'rgba(255,255,255,0.08)' }, svg);
      txt(svg, (x0 + x1) / 2, zy - 12, zl, { class: 'lab', 'text-anchor': 'middle' });
      // warps of the selected block
      const nw = Math.ceil(d.threads / 32);
      const gap = nw > 16 ? 1.5 : 3;
      const ww = (w - gap * (nw - 1)) / nw;
      const firstI = d.b * d.threads;
      for (let k = 0; k < nw; k++) {
        const x = x0 + k * (ww + gap);
        const i0 = firstI + k * 32;
        const act = Math.max(0, Math.min(32, st.n - i0));
        if (act > 0) S('rect', { x: r2(x), y: zy, width: r2(ww * act / 32), height: zh, rx: 2, class: 'warp' }, svg);
        if (act < 32) S('rect', { x: r2(x + ww * act / 32), y: zy, width: r2(ww * (32 - act) / 32), height: zh, rx: 1, class: 'idle' }, svg);
        if (ww >= 20 || k === 0 || k === nw - 1) txt(svg, x + ww / 2, zy + zh + 14, ww >= 52 ? `warp ${k}` : `w${k}`, { class: 'lab dim', 'text-anchor': 'middle' });
      }
      // selected thread
      const tx = x0 + Math.floor(d.t / 32) * (ww + gap) + ((d.t % 32) + 0.5) * (ww / 32);
      S('line', { x1: r2(tx), y1: zy - 5, x2: r2(tx), y2: zy + zh + 3, class: 'mark' }, svg);
      const lab = `threadIdx.x = ${fs(d.t)}`;
      const anchor = tx < x0 + 70 ? 'start' : tx > x1 - 70 ? 'end' : 'middle';
      txt(svg, tx, zy + zh + (wide ? 34 : 34), lab, { class: 'markt', 'text-anchor': anchor });
      txt(svg, x0, H - 6, `blockDim.x = ${fs(d.threads)} · ${nw} warp${nw === 1 ? '' : 's'} per block`, { class: 'lab dim' });
      // formula
      const idle = d.i >= st.n;
      fx.innerHTML = `i = <span class="b">blockIdx.x</span> × blockDim.x + <span class="t">threadIdx.x</span><br><b class="i">${fs(d.i)}</b> = <b class="b">${fs(d.b)}</b> × ${fs(d.threads)} + <b class="t">${fs(d.t)}</b>${idle ? ` <span class="bad">· i ≥ n: this thread has no number</span>` : ''}`;
      stB.set(fs(d.blocks));
      stT.set(fs(d.total));
      stI.set(fs(d.idle), d.idle ? 'danger' : 'core');
      const over = d.threads > 256
        ? ` <span class="hsa-warn"><b>Careful:</b> <code>block_sum</code> itself would break at this size. Its <code>__shared__ float buf[256]</code> has 256 entries, so threads 256 to ${fs(d.threads - 1)} of each block would write past its end. The arithmetic shown is for the launch only.</span>`
        : '';
      f.setWhy((d.idle
        ? `<b>${fs(st.n)}</b> numbers need ⌈${fs(st.n)} / ${fs(d.threads)}⌉ = <b>${fs(d.blocks)}</b> blocks, which launch ${fs(d.total)} threads: <b>${fs(d.idle)}</b> more than there are numbers, all in the last block. The kernel’s <code>i &lt; n</code> check keeps them from reading past the end of <code>x</code> (in <code>block_sum</code> they store 0.0 instead).`
        : `<b>${fs(st.n)}</b> numbers, <b>${fs(d.threads)}</b> threads per block: <code>(n + threads - 1) / threads</code> = <b>${fs(d.blocks)}</b> blocks, exactly one thread per number. Thread ${fs(d.t)} of block ${fs(d.b)} handles number ${fs(d.i)}.`) + over);
    }
    const nSl = GG.ui.slider(f.controls, { label: 'n (numbers)', min: 1, max: MAXN, log: true, step: 1, value: st.n, format: (v) => GG.fmt.int(v), onInput: (v) => { st.n = Math.round(v); syncI(); draw(); } });
    GG.ui.seg(f.controls, { label: 'threads per block', value: 256, options: [32, 64, 128, 256, 512, 1024].map((v) => ({ value: v, label: String(v) })), onChange: (v) => { st.threads = v; syncI(); draw(); } });
    const iSl = GG.ui.slider(f.controls, { label: 'follow thread i', min: 0, max: (1 << 20) - 1, value: st.i, format: (v) => GG.fmt.int(v), onInput: (v) => { st.i = Math.round(v); draw(); } });
    const nudge = el('div', { class: 'ctl' }, el('span', { class: 'ctl-lab', text: 'step thread i by' }));
    const nrow = el('div', { class: 'hsa-chips' });
    nudge.append(nrow);
    f.controls.append(nudge);
    const move = (dBlock, dThread) => { const d = derived(); st.i = Math.max(0, Math.min(d.total - 1, d.i + dBlock * d.threads + dThread)); iSl.set(st.i); draw(); };
    [['blockIdx.x − 1', -1, 0], ['blockIdx.x + 1', 1, 0], ['threadIdx.x − 1', 0, -1], ['threadIdx.x + 1', 0, 1]].forEach(([label, db, dt]) => GG.ui.button(nrow, { label, onClick: () => move(db, dt) }));
    const pre = el('div', { class: 'ctl' }, el('span', { class: 'ctl-lab', text: 'presets' }));
    const prow = el('div', { class: 'hsa-chips' });
    pre.append(prow);
    f.controls.append(pre);
    GG.ui.button(prow, { label: 'the program: n = 2²⁰', onClick: () => { st.n = 1 << 20; nSl.set(st.n); syncI(515); draw(); } });
    GG.ui.button(prow, { label: 'n = 1,000,000', onClick: () => { st.n = 1000000; nSl.set(st.n); const d = derived(); syncI(d.total - 1); draw(); } });
    function syncI(want) {
      const d = derived();
      iSl.input.max = String(d.total - 1);
      if (want != null) st.i = want;
      st.i = Math.max(0, Math.min(d.total - 1, st.i));
      iSl.set(st.i);
    }
    const stB = GG.ui.stat(f.readouts, { label: 'blocks (gridDim.x)', value: '' });
    const stT = GG.ui.stat(f.readouts, { label: 'threads launched', value: '' });
    const stI = GG.ui.stat(f.readouts, { label: 'threads with i ≥ n', value: '' });
    onWidth(holder, (w) => { const want = w < 560 ? 'narrow' : 'wide'; if (want !== st.layout) { st.layout = want; draw(); } });
    st.layout = (f.stage.getBoundingClientRect().width || 700) < 560 ? 'narrow' : 'wide';
    syncI();
    draw();
  }

  function splitFig(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Two compilers, one program',
      hint: 'pick a path',
      wide: true,
      caption: 'The miniature is <code>block_sum.cu</code>, one bar per line, coloured by which compiler handles it. Next to it (below it on a phone) are the two paths through the toolchain. The amber line is the <code>&lt;&lt;&lt;&gt;&gt;&gt;</code> launch, which nvcc rewrites into ordinary host code before gcc sees it. The ' + T('nvcc', 'nvcc') + ' entry shows every stage in detail.',
    });
    const box = el('div', { class: 'hsa-split' });
    f.stage.append(box);
    onWidth(box, (w) => box.classList.toggle('one', w < 620));
    const miniHost = el('div', { class: 'hsa-w' });
    const lanes = el('div', { class: 'hsa-lanes' });
    box.append(miniHost, lanes);
    // minimap
    const lh = 6, lg = 2.2, top = 4, W = 190;
    const H = top + BS_LINES.length * (lh + lg) + 4;
    const mini = svgRoot(miniHost, W, H, 'Miniature of block_sum.cu, lines 4 to 17 are device code, the rest host code, line 31 the launch', 'hsa-mini');
    mini.style.maxWidth = '220px';
    const bars = [];
    BS_LINES.forEach((ln, k) => {
      const n = k + 1;
      if (!ln.trim()) return;
      const ind = ln.match(/^\s*/)[0].length;
      const len = ln.replace(/\s+\/\/.*$/, '').trimEnd().length - ind;
      const kind = n === 31 ? 'launch' : (n >= BS_DEVICE[0] && n <= BS_DEVICE[1]) ? 'dev' : 'host';
      const b = S('rect', { x: r2(26 + ind * 2.2), y: r2(top + k * (lh + lg)), width: r2(Math.max(4, len * 2.2)), height: lh, rx: 1.5, class: 'ml ' + kind }, mini);
      bars.push({ b, kind });
    });
    [1, 4, 17, 31, 40].forEach((n) => txt(mini, 0, top + (n - 1) * (lh + lg) + lh - 0.2, String(n)));
    lanes.innerHTML = `
      <div class="hsa-plane dev" data-p="dev"><div class="hd"><b>device code</b><span>lines 4–17, the kernel</span></div>
        <span class="hsa-pn">block_sum()<small>CUDA C++</small></span><span class="hsa-pa">→</span>
        <span class="hsa-pn tool">nvcc<small>GPU compiler</small></span><span class="hsa-pa">→</span>
        <span class="hsa-pn">PTX<small>virtual ISA</small></span><span class="hsa-pa">→</span>
        <span class="hsa-pn">SASS<small>machine code</small></span><span class="hsa-pa">→</span>
        <span class="hsa-pn out">fat binary<small>GPU code</small></span></div>
      <div class="hsa-plane host" data-p="host"><div class="hd"><b>host code</b><span>lines 1–2 and 19–40, with the launch rewritten</span></div>
        <span class="hsa-pn">main()<small>C++ + runtime calls</small></span><span class="hsa-pa">→</span>
        <span class="hsa-pn tool">gcc<small>host compiler</small></span><span class="hsa-pa">→</span>
        <span class="hsa-pn out">x86-64 / Arm code<small>CPU machine code</small></span></div>
      <div class="hsa-exe"><span>nvcc links both into</span><b>block_sum</b><span>one executable</span></div>`;
    const planes = { dev: lanes.querySelector('[data-p="dev"]'), host: lanes.querySelector('[data-p="host"]') };
    const term = el('pre', { class: 'hsa-term' });
    term.innerHTML = '<span class="p">$</span> <span class="c">nvcc -o block_sum block_sum.cu</span>\n<span class="p">$</span> <span class="c">./block_sum</span>\nsum = 1048576';
    f.stage.append(el('div', { style: 'margin-top:12px' }, term));
    const stD = GG.ui.stat(f.readouts, { label: 'device lines', value: String(bars.filter((x) => x.kind === 'dev').length), tone: 'core' });
    const stH = GG.ui.stat(f.readouts, { label: 'host lines', value: String(bars.filter((x) => x.kind !== 'dev').length), tone: 'host' });
    void stD; void stH;
    const WHY = {
      both: 'nvcc reads the whole file but compiles only part of it. It separates the <b>device code</b> (the kernel) from the <b>host code</b> (everything else), sends each down its own path, and links the results into one executable.',
      dev: `The kernel goes down NVIDIA’s own path: compiled to ${T('parallel-thread-execution', 'PTX')}, a virtual instruction set, then assembled into ${T('streaming-assembler', 'SASS')}, the GPU’s machine code. Both end up in a <em>fat binary</em> embedded in the executable.`,
      host: 'Everything else is ordinary C++ for the CPU. nvcc first rewrites the <code>&lt;&lt;&lt;blocks, threads&gt;&gt;&gt;</code> launch on line 31 into plain calls to the CUDA Runtime API, then hands the file to the host compiler driver, <code>gcc</code> on Linux.',
    };
    function set(p) {
      bars.forEach(({ b, kind }) => b.classList.toggle('dim', p === 'dev' ? kind !== 'dev' : p === 'host' ? kind === 'dev' : false));
      planes.dev.classList.toggle('dim', p === 'host');
      planes.host.classList.toggle('dim', p === 'dev');
      f.setWhy(WHY[p]);
    }
    GG.ui.seg(f.controls, { label: 'show', value: 'both', options: [{ value: 'both', label: 'both paths' }, { value: 'dev', label: 'device code' }, { value: 'host', label: 'host code' }], onChange: set });
    set('both');
  }

  GG.entry('cuda-c', {
    render(body, ctx) {
      body.classList.add('hsa-body');
      const s = ctx.html(body, `
<p>A <strong>CUDA C++</strong> file is mostly ordinary C++. A handful of additions, which bring the ${T('cuda-programming-model', 'CUDA programming model')} into the language, let the same file describe work for the GPU, say how many threads should do it, and coordinate those threads.</p>
<h3>What CUDA C++ adds</h3>
<p>CUDA C++ adds several features to C++ to implement the CUDA programming model, including:</p>
<ul>
<li><b>${T('kernel', 'Kernel')} definition</b> with <b><code>__global__</code></b>. CUDA kernels are implemented as C++ functions that take in pointers and have return type <code>void</code>, annotated with this keyword.</li>
<li><b>Kernel launches</b> with <b><code>&lt;&lt;&lt;&gt;&gt;&gt;</code></b>. Kernels are executed from the CPU host using a triple bracket syntax that sets the ${T('thread-block-grid', 'thread block grid')} dimensions.</li>
<li><b>${T('shared-memory', 'Shared memory')} allocation</b> with the <code>shared</code> keyword, <b>barrier synchronization</b> with the <code>__syncthreads()</code> intrinsic function, and <b>${T('thread-block', 'thread block')}</b> and <b>${T('thread', 'thread')} indexing</b> with the <code>blockDim</code> and <code>threadIdx</code> built-in variables.</li>
</ul>
<p>All of them fit in one short program. The program in Fig. 1 adds up 2<sup>20</sup> = 1,048,576 numbers, all 1.0. Each thread block sums 256 of them in shared memory, and the CPU adds up the 4,096 partial sums. Step through it to watch each feature light up.</p>
<div data-slot="feat" class="wide"></div>
${GG.noteHTML('check', '<p>The glossary lists shared memory allocation “with the <code>shared</code> keyword”. In CUDA C++ source it is spelled <code>__shared__</code>, with two underscores on each side like <code>__global__</code>, as on line 6 of the program. <code>shared</code> on its own is not a CUDA keyword.</p>')}
${GG.noteHTML('intuition', '<p>A kernel is the body of a loop with the loop taken away. On a CPU you would write <code>for (int i = 0; i &lt; n; i++) work(i);</code>. In CUDA C++ you write only <code>work</code>, launch one thread per <code>i</code>, and let each thread compute its own <code>i</code> from the built-in variables.</p>')}
<h3>Inside one block: shared memory and barriers</h3>
<p>The kernel uses a classic pattern called a <em>tree reduction</em>. Each of a block’s 256 threads first copies one number into the shared array <code>buf</code>. Then half the threads each add a number from the upper half into the lower half, then a quarter of them, and so on: 128, 64, 32, 16, 8, 4, 2 and 1 additions, eight levels and 255 additions in all, until <code>buf[0]</code> holds the block’s sum.</p>
<p>Between levels every thread has to wait for all the others, because it is about to read a value a different thread just wrote. That wait is <code>__syncthreads()</code>. Fig. 2 draws a 16-thread block so that every value fits on screen. Flip the switch to see what the barriers protect.</p>
<div data-slot="red" class="wide"></div>
<h3>The launch: how many threads, and which one am I?</h3>
<p><code>&lt;&lt;&lt;blocks, threads&gt;&gt;&gt;</code> launches <code>blocks × threads</code> threads, all running the kernel. To cover <code>n</code> numbers with 256 threads per block you need ⌈n / 256⌉ blocks, which the program computes as <code>(n + threads - 1) / threads</code>, an integer division that rounds up. Each thread then combines the built-in variables into its global index. When <code>n</code> is not a multiple of the block size, the last block has threads with nothing to do, which is why the kernel checks <code>i &lt; n</code>.</p>
<div data-slot="geo" class="wide"></div>
${GG.noteHTML('beyond', '<p>The full launch syntax is <code>kernel&lt;&lt;&lt;grid, block, sharedBytes, stream&gt;&gt;&gt;(args)</code>. <code>grid</code> and <code>block</code> can be <code>dim3</code> values with <code>.x</code>, <code>.y</code> and <code>.z</code> sizes; a block holds at most 1,024 threads. The optional third value reserves extra shared memory sized at launch time, and the fourth picks the <em>stream</em> the launch goes into: an ordered queue of GPU work, whose items run one after another. (Streams can be recorded into ' + T('cuda-graph', 'CUDA Graphs') + '.) Next to <code>__global__</code>, CUDA C++ also has <code>__device__</code> for GPU functions called from GPU code and <code>__host__</code> for CPU functions (the default).</p>')}
<h3>Two compilers, one program</h3>
<p>CUDA C++ programs are compiled by a combination of host C/C++ compiler drivers like <code>gcc</code> and the ${T('nvcc', 'NVIDIA CUDA Compiler Driver')}, <code>nvcc</code>. You run nvcc; nvcc compiles the GPU half of the file itself and hands the CPU half to the host compiler.</p>
<div data-slot="split" class="wide"></div>
<p>For information on how to use CUDA C++ on ${X('https://modal.com', 'Modal')}, see ${X('https://modal.com/docs/guide/cuda', 'this guide')}.</p>
<div data-slot="read"></div>`);
      guard(s.feat, 'Annotated program', () => featuresFig(s.feat, ctx));
      guard(s.red, 'Reduction', () => reductionFig(s.red, ctx));
      guard(s.geo, 'Launch geometry', () => geometryFig(s.geo, ctx));
      guard(s.split, 'Split compilation', () => splitFig(s.split, ctx));
      ctx.reading(s.read, [
        { href: 'https://modal.com/docs/guide/cuda', label: 'Modal: using CUDA on Modal', note: 'running CUDA C++ on Modal’s GPUs' },
        { href: 'https://docs.nvidia.com/cuda/cuda-c-programming-guide/', label: 'NVIDIA CUDA C++ Programming Guide', note: 'the language extensions in full: qualifiers, launch syntax, built-in variables, intrinsics' },
      ]);
    },
  });
  /* ═════════════════════════ nvidia-gpu-drivers ═════════════════════════ */

  GG.css(`
.hsa-pkg { display: grid; grid-template-columns: minmax(0, 1fr) 210px; gap: 12px; align-items: start; }
.hsa-pkg.one { grid-template-columns: minmax(0, 1fr); }
.hsa-band { border-radius: 12px; border: 1px solid var(--line); padding: 9px 10px 10px; background: rgba(8, 9, 14, 0.5); }
.hsa-band + .hsa-band { margin-top: 8px; }
.hsa-band.user { border-color: rgba(184, 164, 255, 0.35); background: rgba(184, 164, 255, 0.04); }
.hsa-band.kern { border-color: rgba(255, 198, 92, 0.32); background: rgba(255, 198, 92, 0.035); }
.hsa-band.gpu { border-color: rgba(69, 212, 155, 0.32); background: rgba(69, 212, 155, 0.035); }
.hsa-band.tool { border-style: dashed; border-color: var(--line-2); background: transparent; }
.hsa-band-h { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 10px; margin-bottom: 8px; }
.hsa-band-h b { font: 600 10.5px/1.2 var(--font-mono); letter-spacing: 0.12em; text-transform: uppercase; }
.hsa-band.user .hsa-band-h b { color: var(--host); }
.hsa-band.kern .hsa-band-h b { color: var(--control); }
.hsa-band.gpu .hsa-band-h b { color: var(--core); }
.hsa-band.tool .hsa-band-h b { color: var(--ink-3); }
.hsa-band-h span { font-size: 12.5px; color: var(--ink-3); }
.hsa-items { display: flex; flex-wrap: wrap; gap: 6px; }
.hsa-it { text-align: left; font: inherit; cursor: pointer; padding: 6px 9px 7px; border-radius: 9px; border: 1px solid var(--line-2); background: var(--surface-2);
  color: var(--ink); transition: opacity 0.2s, border-color 0.15s, background 0.15s; min-width: 0; max-width: 100%; }
.hsa-it b { display: block; font: 600 12.5px/1.3 var(--font-mono); overflow-wrap: anywhere; }
.hsa-it small { display: block; font-size: 11.5px; line-height: 1.3; color: var(--ink-3); margin-top: 1px; }
.hsa-it:hover { border-color: var(--ink-3); }
.hsa-it[aria-pressed="true"] { border-color: var(--accent); background: rgba(24, 26, 38, 0.95); box-shadow: inset 0 0 0 1px var(--accent); }
.hsa-it.off { opacity: 0.28; }
.hsa-band.tool .hsa-it { background: transparent; border-style: dashed; color: var(--ink-2); }
.hsa-det { margin-top: 10px; border: 1px solid var(--line); border-radius: 12px; background: rgba(8, 9, 14, 0.6); padding: 10px 13px 11px; min-height: 92px; }
.hsa-det .hd { display: flex; flex-wrap: wrap; gap: 6px 10px; align-items: baseline; margin-bottom: 4px; }
.hsa-det .hd b { font: 600 15px/1.3 var(--font-mono); color: var(--ink); overflow-wrap: anywhere; }
.hsa-det p { font-size: 14px; line-height: 1.55; color: var(--ink-2); }
.hsa-det .meta { margin-top: 6px; font: 500 11.5px/1.5 var(--font-mono); color: var(--ink-3); overflow-wrap: anywhere; }
`);

  const PKG = [
    { k: 'libcuda', band: 'user', name: 'libcuda.so', sub: 'CUDA Driver API', file: '/usr/lib/x86_64-linux-gnu/libcuda.so.1', serves: ['cuda'],
      desc: `The ${T('cuda-driver-api', 'CUDA Driver API')}, the user-space part of the drivers. Every CUDA program reaches the GPU through it, directly or through the Runtime API. See ${T('libcuda', 'libcuda.so')}.` },
    { k: 'nvml', band: 'user', name: 'libnvidia-ml.so', sub: 'NVML · the glossary’s libnvml.so', file: '/usr/lib/x86_64-linux-gnu/libnvidia-ml.so.1', serves: ['monitor'],
      desc: `${T('nvml', 'NVML')}, the NVIDIA Management Library, for reading and changing GPU state: power, temperature, memory, limits. The glossary calls this file ${T('libnvml', 'libnvml.so')}; on disk it is named <code>libnvidia-ml.so</code>.` },
    { k: 'smi', band: 'user', name: 'nvidia-smi', sub: 'command-line tool', file: '/usr/bin/nvidia-smi', serves: ['monitor'],
      desc: `The command-line utility built on NVML that prints the familiar table of GPUs. See ${T('nvidia-smi', 'nvidia-smi')}.` },
    { k: 'jit', band: 'user', name: 'libnvidia-ptxjitcompiler.so', sub: 'PTX JIT compiler', file: '/usr/lib/x86_64-linux-gnu/libnvidia-ptxjitcompiler.so.1', serves: ['cuda'],
      desc: `Compiles ${T('parallel-thread-execution', 'PTX')} into ${T('streaming-assembler', 'SASS')} while a program runs (“just in time”), when the program carries PTX but no machine code for this particular GPU. This is why a driver can run programs built before its GPU existed.` },
    { k: 'pd', band: 'user', name: 'nvidia-persistenced', sub: 'background service', file: '/usr/bin/nvidia-persistenced', serves: ['cuda', 'monitor'],
      desc: 'A daemon that keeps the driver initialized on each GPU even when no program is using it (persistence mode, the <code>Persistence-M</code> column of nvidia-smi). Without it, the driver may shut a GPU down between programs and set it up again for the next one, which costs time.' },
    { k: 'gfx', band: 'user', name: 'OpenGL · Vulkan', sub: 'graphics libraries', file: 'libGLX_nvidia.so, libnvidia-glcore.so, …', serves: ['graphics'],
      desc: 'The same driver package also serves graphics: implementations of the OpenGL and Vulkan graphics APIs for games, desktops and visualization. A GPU used only for CUDA never touches them.' },
    { k: 'ko', band: 'kern', name: 'nvidia.ko', sub: 'the core kernel module', file: '/lib/modules/$(uname -r)/…/nvidia.ko', serves: ['cuda', 'monitor', 'graphics', 'os'],
      desc: `The kernel module at the core of the drivers. It runs in privileged mode and is the part that actually talks to the GPU hardware, on behalf of everything above it. See ${T('nvidia-ko', 'nvidia.ko')}.` },
    { k: 'uvm', band: 'kern', name: 'nvidia-uvm.ko', sub: 'unified memory', file: '/lib/modules/$(uname -r)/…/nvidia-uvm.ko', serves: ['cuda'],
      desc: 'Unified Virtual Memory: lets the CPU and the GPU share one range of memory addresses and moves pages of data between host memory and GPU memory when either side touches them. CUDA programs use it.' },
    { k: 'ms', band: 'kern', name: 'nvidia-modeset.ko', sub: 'display mode setting', file: '/lib/modules/$(uname -r)/…/nvidia-modeset.ko', serves: ['graphics', 'os'],
      desc: 'Programs the display side of the GPU: which monitor shows what, at which resolution and refresh rate.' },
    { k: 'drm', band: 'kern', name: 'nvidia-drm.ko', sub: 'Linux graphics interface', file: '/lib/modules/$(uname -r)/…/nvidia-drm.ko', serves: ['graphics', 'os'],
      desc: 'Plugs the driver into the Direct Rendering Manager (DRM), the Linux kernel’s common interface to graphics hardware, so the operating system’s display servers and desktops can use the GPU.' },
    { k: 'gsp', band: 'gpu', name: 'GSP firmware', sub: 'runs on the GPU itself', file: '/lib/firmware/nvidia/<version>/gsp_*.bin', serves: ['cuda', 'monitor', 'graphics', 'os'],
      desc: 'Turing and later GPUs contain a small general-purpose processor, the GPU System Processor (GSP). The kernel module loads this firmware onto it when the GPU starts, and much of the driver’s work of setting up and managing the GPU runs there.' },
  ];
  const TOOLKIT_SIDE = [
    { k: 'nvcc', name: 'nvcc', sub: 'compiler driver', desc: `${T('nvcc', 'nvcc')}, the CUDA compiler driver, comes with the <b>CUDA Toolkit</b>, not with the driver. A build machine needs it; a machine that only runs CUDA programs does not.` },
    { k: 'rt', name: 'libcudart.so', sub: 'CUDA Runtime API', desc: `The ${T('cuda-runtime-api', 'CUDA Runtime API')} (${T('libcudart', 'libcudart.so')}) comes with the <b>CUDA Toolkit</b>. Standalone programs often carry their own copy, linked in statically (nvcc’s default); frameworks like PyTorch load a shared <code>libcudart.so</code> that they ship themselves. Either way it does not come from the driver.` },
    { k: 'libs', name: 'cuBLAS · cuDNN · …', sub: 'kernel libraries', desc: `Libraries like ${T('cublas', 'cuBLAS')} come with the CUDA Toolkit (${T('cudnn', 'cuDNN')} is a separate download). They are built on the Runtime API, which is built on the driver.` },
  ];
  const SERVES = {
    all: { label: 'everything', why: 'Everything in the <b>NVIDIA driver package</b> on a Linux machine. Libraries and tools run in <b>user space</b>, as part of ordinary programs. Kernel modules run in <b>kernel space</b>, with the privileges to touch hardware. The firmware runs <b>on the GPU</b>. Click any piece.' },
    cuda: { label: 'CUDA programs', why: 'What a <b>CUDA program</b> relies on at run time: the Driver API library, the PTX JIT compiler for code without matching SASS, the unified-memory module, the core kernel module and the GPU’s firmware, plus, optionally, the persistence daemon that keeps each GPU initialized between programs.' },
    monitor: { label: 'monitoring tools', why: 'What <b>nvidia-smi and other monitoring tools</b> rely on: NVML, which asks the kernel module, which asks the GPU and its firmware, plus, optionally, the persistence daemon, which keeps each GPU initialized so a query need not wait for the driver to set it up again.' },
    os: { label: 'the operating system', why: 'What serves the <b>host operating system</b>: modules that let Linux set display modes and draw desktops through its common graphics interface, on top of the core module. This is the “host operating system” half of the glossary’s definition.' },
  };

  function packageFig(host, ctx) {
    const f = ctx.figure(host, {
      title: 'What is inside “the drivers”',
      hint: 'click a piece · filter by who it serves',
      wide: true,
      caption: 'The files of the NVIDIA driver package on a 64-bit x86 Linux machine (exact paths vary by distribution). This inventory is added context, not from the glossary. The dashed panel lists CUDA pieces that are <em>not</em> part of the driver.',
    });
    const box = el('div', { class: 'hsa-pkg' });
    f.stage.append(box);
    const main = el('div', { class: 'hsa-w' });
    const side = el('div', { class: 'hsa-w' });
    box.append(main, side);
    onWidth(box, (w) => box.classList.toggle('one', w < 640));
    const BANDS = [
      { k: 'user', b: 'user space', s: 'runs as part of ordinary programs' },
      { k: 'kern', b: 'kernel space', s: 'runs inside the Linux kernel, in privileged mode' },
      { k: 'gpu', b: 'on the GPU', s: 'firmware loaded onto the device' },
    ];
    const btns = {};
    const all = PKG.map((x) => Object.assign({ group: 'driver' }, x)).concat(TOOLKIT_SIDE.map((x) => Object.assign({ group: 'toolkit', band: 'tool', serves: [] }, x)));
    const byK = {};
    all.forEach((x) => { byK[x.k] = x; });
    const mk = (x) => {
      const b = el('button', { type: 'button', class: 'hsa-it', 'aria-pressed': 'false' });
      b.innerHTML = `<b>${esc(x.name)}</b><small>${esc(x.sub)}</small>`;
      b.addEventListener('click', () => pick(x.k));
      btns[x.k] = b;
      return b;
    };
    BANDS.forEach((bd) => {
      const band = el('div', { class: 'hsa-band ' + bd.k });
      band.innerHTML = `<div class="hsa-band-h"><b>${bd.b}</b><span>${bd.s}</span></div>`;
      const items = el('div', { class: 'hsa-items' });
      PKG.filter((x) => x.band === bd.k).forEach((x) => items.append(mk(x)));
      band.append(items);
      main.append(band);
    });
    const tb = el('div', { class: 'hsa-band tool' });
    tb.innerHTML = '<div class="hsa-band-h"><b>not in the driver</b><span>these come with the CUDA Toolkit</span></div>';
    const ti = el('div', { class: 'hsa-items' });
    TOOLKIT_SIDE.forEach((x) => ti.append(mk(x)));
    tb.append(ti);
    side.append(tb);
    const det = el('div', { class: 'hsa-det', 'aria-live': 'polite' });
    f.stage.append(det);
    const stN = GG.ui.stat(f.readouts, { label: 'pieces lit', value: '' });
    const stK = GG.ui.stat(f.readouts, { label: 'in kernel space', value: '' });
    let filter = 'all', cur = 'ko';
    function apply() {
      let n = 0, nk = 0;
      PKG.forEach((x) => {
        const on = filter === 'all' || x.serves.includes(filter);
        btns[x.k].classList.toggle('off', !on);
        if (on) { n++; if (x.band === 'kern') nk++; }
      });
      TOOLKIT_SIDE.forEach((x) => btns[x.k].classList.toggle('off', filter !== 'all'));
      stN.set(`${n} of ${PKG.length}`);
      stK.set(String(nk), 'control');
      f.setWhy(SERVES[filter].why);
    }
    function pick(k) {
      cur = k;
      const x = byK[k];
      Object.keys(btns).forEach((j) => btns[j].setAttribute('aria-pressed', String(j === k)));
      const where = x.group === 'toolkit' ? '<span class="hsa-tag">CUDA Toolkit</span>' : x.band === 'user' ? '<span class="hsa-tag beyond">user space</span>' : x.band === 'kern' ? '<span class="hsa-tag sim">kernel space</span>' : '<span class="hsa-tag ok">on the GPU</span>';
      det.innerHTML = `<div class="hd"><b>${esc(x.name)}</b>${where}</div><p>${x.desc}</p>${x.file ? `<div class="meta">${esc(x.file)}</div>` : ''}`;
    }
    GG.ui.seg(f.controls, { label: 'pieces that serve', value: 'all', options: Object.keys(SERVES).map((k) => ({ value: k, label: SERVES[k].label })), onChange: (v) => { filter = v; apply(); } });
    apply();
    pick(cur);
  }

  function driverRoutesFig(host, ctx) {
    const R = {
      runtime: { label: 'Runtime API', path: 'app-runtime-driver-gpu', tags: { runtime: 'cudaMalloc', 'driver-api': 'cuMemAlloc' },
        say: { apps: 'An application asks for GPU memory through the <b>Runtime API</b>, the way most applications come in.', runtime: 'The Runtime API forwards the request to the Driver API.', 'driver-api': 'The Driver API, the user-space part of the drivers, hands it to the kernel module.', driver: 'The <b>NVIDIA GPU Driver</b> reserves the memory on the device.', gpu: 'Done. Only the driver touched the GPU.' },
        why: 'Route 1, the <b>Runtime API</b>: the interface most applications use. It still ends in the NVIDIA GPU Driver.' },
      driver: { label: 'Driver API', path: 'app-driver-gpu', tags: { 'driver-api': 'cuMemAlloc' },
        say: { apps: 'A few applications call the <b>Driver API</b> directly.', 'driver-api': 'The Driver API is part of the drivers itself: its user-space half.', driver: 'Its kernel-space half, the <b>NVIDIA GPU Driver</b>, does the talking.', gpu: 'Done. Only the driver touched the GPU.' },
        why: 'Route 2, the <b>Driver API</b>: lower level, used directly by few programs. Same destination.' },
      nvml: { label: 'NVML (tools)', path: 'smi-nvml-driver-gpu', tags: { nvml: 'GetTemperature' },
        say: { smi: '<b>nvidia-smi</b> wants the GPU’s temperature. It is not a CUDA program and uses neither CUDA API.', nvml: 'It asks <b>NVML</b>, the management library.', driver: 'NVML asks the <b>NVIDIA GPU Driver</b>.', gpu: 'The driver reads the sensor. Only the driver touched the GPU.' },
        why: 'A side door for management tools: <b>nvidia-smi → NVML → driver</b>. Even this route goes through the NVIDIA GPU Driver.' },
    };
    const { f, tk } = toolkitFig(host, ctx, {
      title: 'Every road ends at the driver',
      hint: 'pick a route · hover a layer',
      wide: true,
      caption: `The CUDA Toolkit stack with the management column, redrawn from the glossary’s figure (adapted from ${PROF_CUDA}). The labels on the packet are example calls. Whichever way a request comes in, the NVIDIA GPU Driver is the only component that communicates directly with the GPU.`,
    }, { nvml: true, files: true, animateCall: { path: R.runtime.path, tags: R.runtime.tags, say: R.runtime.say } });
    if (!tk) return;
    const stL = GG.ui.stat(f.readouts, { label: 'layers above the driver', value: '' });
    GG.ui.stat(f.readouts, { label: 'touches the GPU', value: 'driver only', tone: 'control' });
    function set(k, send) {
      const p = GG.components.toolkit.PATHS[R[k].path];
      stL.set(String(p.indexOf('driver')));
      f.setWhy(R[k].why);
      if (send) tk.call(R[k].path, { tags: R[k].tags, say: R[k].say });
    }
    GG.ui.seg(f.controls, { label: 'way in', value: 'runtime', options: Object.keys(R).map((k) => ({ value: k, label: R[k].label })), onChange: (k) => set(k, true) });
    set('runtime', false);
  }

  GG.entry('nvidia-gpu-drivers', {
    render(body, ctx) {
      body.classList.add('hsa-body');
      const s = ctx.html(body, `
<p>A <em>driver</em> is the software that lets an operating system and its programs use a piece of hardware without knowing the details of how to operate it. The <strong>NVIDIA GPU drivers</strong> stand between the GPU and two kinds of client: host programs, and the host operating system itself. Programs say what they want (“reserve 4 MiB of GPU memory”, “run this kernel”); the driver knows which commands to send the chip to make that happen.</p>
<h3>The only way to the GPU</h3>
<p>The primary interfaces to the GPU drivers for applications are, in order, the ${T('cuda-runtime-api', 'CUDA Runtime API')} and the ${T('cuda-driver-api', 'CUDA Driver API')}. “In order” can be read two ways, and both hold. By use: most applications use the Runtime API and few call the Driver API directly. By layering: a Runtime API call passes through the Driver API on its way down. Management tools such as ${T('nvidia-smi', 'nvidia-smi')} take a third road, through ${T('nvml', 'NVML')}.</p>
<div data-slot="routes" class="wide"></div>
<p>As the glossary’s caption for this diagram puts it, the NVIDIA GPU Driver is the only component that communicates directly with the GPU. Everything above it, however clever, is asking the driver to do something.</p>
${GG.noteHTML('intuition', '<p>Think of the driver as the GPU’s front desk. Applications, libraries, monitoring tools and the operating system all queue at the same desk. None of them walks into the back office and operates the machine themselves.</p>')}
<h3>“Drivers”, plural</h3>
<p>The driver is not one file. On Linux the core is a kernel module, ${T('nvidia-ko', '<code>nvidia.ko</code>')}, which runs inside the operating system kernel. The Driver API, ${T('libcuda', '<code>libcuda.so</code>')}, is the user-space component of the same drivers: a library loaded into each CUDA program. In the stack diagram these are the two halves of the bottom frame, on either side of the dashed line. Fig. 2 opens up the whole package.</p>
<div data-slot="pkg" class="wide"></div>
<p>The filter in Fig. 2 shows both halves of the definition. Host programs (CUDA applications and monitoring tools) reach the GPU through the user-space libraries. The host operating system uses the driver too, for example to drive displays through its own graphics interface.</p>
<h3>Open source</h3>
<p>NVIDIA has released the ${X('https://github.com/NVIDIA/open-gpu-kernel-modules', 'source')} for their Linux Open GPU ${T('nvidia-ko', 'Kernel Module')}. What is open is the kernel-space part. The user-space libraries, including the Driver API, remain closed source.</p>
${GG.noteHTML('beyond', `<p>NVIDIA ships two flavours of the kernel modules: the open ones and the older proprietary ones. The open modules support Turing and later GPUs and, from the R560 driver series, are the default on them. For the newest platforms, such as Grace Hopper and Blackwell (the B200s in the ${T('nvidia-smi', 'nvidia-smi')} sample), only the open modules are supported (${X('https://developer.nvidia.com/blog/nvidia-transitions-fully-towards-open-source-gpu-kernel-modules/', 'NVIDIA’s announcement')}). Part of what made opening them practical is that much of the driver’s logic moved into the closed firmware that runs on the GPU System Processor.</p>`)}
<div data-slot="read"></div>`);
      guard(s.routes, 'Driver routes', () => driverRoutesFig(s.routes, ctx));
      guard(s.pkg, 'Driver package', () => packageFig(s.pkg, ctx));
      ctx.reading(s.read, [
        { href: 'https://github.com/NVIDIA/open-gpu-kernel-modules', label: 'NVIDIA/open-gpu-kernel-modules on GitHub', note: 'the source of the Linux Open GPU Kernel Module' },
        { href: 'https://developer.nvidia.com/blog/nvidia-transitions-fully-towards-open-source-gpu-kernel-modules/', label: 'NVIDIA Technical Blog: “NVIDIA Transitions Fully Towards Open-Source GPU Kernel Modules”', note: 'which GPUs need the open modules' },
      ]);
    },
  });

  /* ═════════════════════════════ nvidia-ko ═════════════════════════════ */

  GG.css(`
.hsa-priv .band { stroke-width: 1; }
.hsa-priv .band.u { fill: rgba(184, 164, 255, 0.045); stroke: rgba(184, 164, 255, 0.35); }
.hsa-priv .band.k { fill: rgba(255, 198, 92, 0.04); stroke: rgba(255, 198, 92, 0.32); }
.hsa-priv .band.h { fill: rgba(69, 212, 155, 0.035); stroke: rgba(69, 212, 155, 0.3); }
.hsa-priv .bl { font-size: 10.5px; letter-spacing: 0.1em; font-weight: 600; }
.hsa-priv .bl.u { fill: var(--host); } .hsa-priv .bl.k { fill: var(--control); } .hsa-priv .bl.h { fill: var(--core); }
.hsa-priv .bs { font-size: 10px; fill: var(--ink-3); }
.hsa-priv .nd { fill: var(--surface-2); stroke: var(--line-2); stroke-width: 1.2; transition: fill 0.25s, stroke 0.25s; }
.hsa-priv .nd.on { fill: #2a2542; stroke: var(--accent); stroke-width: 1.8; }
.hsa-priv .nd.gpu.on { fill: rgba(69, 212, 155, 0.16); stroke: var(--core); }
.hsa-priv .nd.bad { stroke: var(--danger); }
.hsa-priv .nt { font-size: 13px; font-weight: 600; fill: var(--ink); }
.hsa-priv .ns { font-size: 10.5px; fill: var(--ink-2); }
.hsa-priv .bnd { stroke: var(--ink-3); stroke-width: 1; stroke-dasharray: 6 5; }
.hsa-priv .gate { fill: #0b0c12; stroke: var(--ink-3); stroke-width: 1; transition: stroke 0.25s; }
.hsa-priv .gate.on { stroke: var(--control); stroke-width: 1.6; }
.hsa-priv .gt { font-size: 10px; fill: var(--ink-2); }
.hsa-priv .ar { fill: none; stroke: var(--ink-3); stroke-width: 1.4; opacity: 0.35; transition: opacity 0.25s, stroke 0.25s; }
.hsa-priv .ar.on { opacity: 1; stroke: var(--control); stroke-width: 2; stroke-dasharray: 7 5; }
.hsa-run .hsa-priv .ar.on { animation: hsa-flow 0.9s linear 5; }   /* only on screen (GG.onVisible), and for 4.5 s per step: it settles without needing a pause control */
.hsa-priv .ar.ret.on { stroke: var(--core); }
.hsa-priv .ar.blk { stroke: var(--danger); opacity: 1; stroke-width: 2; stroke-dasharray: 5 4; }
.hsa-priv .x { stroke: var(--danger); stroke-width: 3; stroke-linecap: round; }
.hsa-priv .xt { font-size: 11px; font-weight: 600; fill: var(--danger); }
.hsa-priv .reg { fill: rgba(111, 166, 255, 0.35); transition: fill 0.25s; }
.hsa-priv .reg.on { fill: var(--memory); }
.hsa-priv .rt { font-size: 10px; font-weight: 600; fill: var(--core); }
@keyframes hsa-flow { to { stroke-dashoffset: -24; } }
@media (prefers-reduced-motion: reduce) { .hsa-run .hsa-priv .ar.on { animation: none; } }
.hsa-oc { display: grid; gap: 0; }
.hsa-oc .hsa-band + .hsa-band { margin-top: 0; }
.hsa-oc-via { display: flex; align-items: center; gap: 10px; margin: 6px 0; font: 500 10.5px/1.2 var(--font-mono); color: var(--ink-3); }
.hsa-oc-via::before, .hsa-oc-via::after { content: ""; flex: 1 1 0; border-top: 1px dashed var(--line-2); }
.hsa-oc-row { display: grid; grid-template-columns: 22px minmax(0, 1fr) auto; gap: 10px; align-items: center; width: 100%; text-align: left; font: inherit; cursor: pointer;
  border: 1px solid var(--line-2); border-radius: 9px; padding: 7px 10px; margin-top: 6px; background: var(--surface-2); color: var(--ink); transition: border-color 0.15s, background 0.2s; }
.hsa-oc-row:hover { border-color: var(--ink-3); }
.hsa-oc-row[aria-pressed="true"] { box-shadow: inset 0 0 0 1px var(--accent); border-color: var(--accent); }
.hsa-oc-row .nm b { display: block; font: 600 12.5px/1.3 var(--font-mono); overflow-wrap: anywhere; }
.hsa-oc-row small { display: block; font-size: 11.5px; line-height: 1.3; color: var(--ink-3); margin-top: 1px; }
.hsa-oc-row .src { font: 600 10.5px/1.2 var(--font-mono); letter-spacing: 0.06em; text-transform: uppercase; text-align: right; }
.hsa-oc-row .src small { font: 500 10.5px/1.3 var(--font-mono); letter-spacing: 0; text-transform: none; }
.hsa-oc-row.closed { background: repeating-linear-gradient(135deg, rgba(255,255,255,0.025) 0 6px, transparent 6px 12px), rgba(8, 9, 14, 0.6); color: var(--ink-2); }
.hsa-oc-row.closed .src { color: var(--ink-3); }
.hsa-oc-row.open { border-color: rgba(236, 238, 246, 0.55); background: rgba(236, 238, 246, 0.06); }
.hsa-oc-row.open .src { color: var(--ink); }
.hsa-oc-row.yours .src { color: var(--ink-3); }
.hsa-lock { width: 18px; height: 18px; stroke: currentColor; stroke-width: 1.4; fill: none; }
.hsa-lock rect { fill: currentColor; fill-opacity: 0.18; }
.hsa-oc-row.closed .hsa-lock { color: var(--ink-3); }
@media (max-width: 520px) { .hsa-oc-row { grid-template-columns: 20px minmax(0, 1fr); } .hsa-oc-row .src { grid-column: 2; text-align: left; } }
.hsa-shelf { display: grid; grid-template-columns: minmax(0, 250px) minmax(0, 1fr); gap: 12px; align-items: start; }
.hsa-shelf.one { grid-template-columns: minmax(0, 1fr); }
.hsa-cmds { display: flex; flex-direction: column; gap: 6px; }
.hsa-shelf.one .hsa-cmds { flex-direction: row; flex-wrap: wrap; }
.hsa-cmd { text-align: left; font: 500 12.5px/1.35 var(--font-mono); color: var(--ink); background: #07080c; border: 1px solid var(--line); border-radius: 9px; padding: 8px 10px; cursor: pointer; overflow-wrap: anywhere; }
.hsa-cmd::before { content: "$ "; color: var(--ink-3); }
.hsa-cmd:hover { border-color: var(--ink-3); }
.hsa-cmd[aria-pressed="true"] { border-color: var(--accent); box-shadow: inset 0 0 0 1px var(--accent); }
.hsa-cmdout { min-width: 0; }
.hsa-cmdout p { font-size: 14px; line-height: 1.55; color: var(--ink-2); margin-top: 9px; }
.hsa-cmdout p b { color: var(--ink); }
/* nvidia-ko · what each command reveals */
.hsa-kr-wrap { margin-top: 10px; }
.hsa-kr-wrap .btn { margin-top: 6px; }
.hsa-kr { max-width: 640px; margin: 0; }
.hsa-kr.narrow { max-width: 420px; }
.hsa-kr .band { stroke-width: 1; }
.hsa-kr .band.u { fill: rgba(184, 164, 255, 0.045); stroke: rgba(184, 164, 255, 0.35); }
.hsa-kr .band.k { fill: rgba(255, 198, 92, 0.04); stroke: rgba(255, 198, 92, 0.32); }
.hsa-kr .band.h { fill: rgba(69, 212, 155, 0.035); stroke: rgba(69, 212, 155, 0.3); }
.hsa-kr .band.d { fill: rgba(255, 255, 255, 0.02); stroke: var(--line-2); }
.hsa-kr .band.dv { fill: none; stroke: var(--ink-3); stroke-dasharray: 4 3; }
.hsa-kr .bl { font-size: 10.5px; letter-spacing: 0.1em; font-weight: 600; }
.hsa-kr .bl.u { fill: var(--host); } .hsa-kr .bl.k { fill: var(--control); } .hsa-kr .bl.h { fill: var(--core); } .hsa-kr .bl.d, .hsa-kr .bl.dv { fill: var(--ink-2); }
.hsa-kr .nd { fill: var(--surface-2); stroke: var(--line-2); stroke-width: 1.2; }
.hsa-kr .nd.mod { fill: rgba(255, 198, 92, 0.1); stroke: var(--control); }
.hsa-kr .nd.lib { stroke: var(--host); }
.hsa-kr .nd.dev { fill: #0b0c12; stroke: var(--ink-2); }
.hsa-kr .nd.gpu { fill: rgba(69, 212, 155, 0.14); stroke: var(--core); }
.hsa-kr .nd.kern { fill: rgba(255, 198, 92, 0.05); stroke: rgba(255, 198, 92, 0.5); stroke-dasharray: 4 3; }
.hsa-kr .nd.slot { fill: none; stroke: var(--ink-3); stroke-dasharray: 4 3; }
.hsa-kr .nd.file { fill: #0b0c12; stroke: var(--ink-2); }
.hsa-kr .nd.card { fill: #0b0c12; stroke: var(--line-2); }
.hsa-kr .nd.open { stroke: var(--core); } .hsa-kr .nd.closed { stroke: var(--ink-3); }
.hsa-kr .nt { font-size: 12px; font-weight: 600; fill: var(--ink); }
.hsa-kr .nt.sm { font-size: 10.5px; }
.hsa-kr .ns { font-size: 10.5px; fill: var(--ink-2); }
.hsa-kr .nk { font-size: 12px; font-weight: 600; fill: var(--control); }
.hsa-kr .big { font-size: 15px; font-weight: 600; fill: var(--ink); }
.hsa-kr .big.open { fill: var(--core); }
.hsa-kr .il { font-size: 10px; fill: var(--ink-3); font-style: italic; }
.hsa-kr .ar { fill: none; stroke: var(--ink-2); stroke-width: 1.3; }
.hsa-kr .ar.dash { stroke-dasharray: 5 4; }
.hsa-kr .ar.ctl { stroke: var(--control); }
.hsa-kr .ln { fill: none; stroke: var(--ink-3); stroke-width: 1; }
.hsa-kr .ln.gpu { stroke: rgba(69, 212, 155, 0.55); }
.hsa-kr .ne { font-size: 15px; font-weight: 700; fill: var(--control); }
.hsa-kr .rule { stroke: var(--line); stroke-width: 1; }
.hsa-kr .lock { fill: none; stroke-width: 1.4; }
.hsa-kr .lock.open { stroke: var(--core); } .hsa-kr .lock.closed { stroke: var(--ink-3); }
.hsa-kr .mv { transition: none; }
.hsa-kr .mv .nd { fill: rgba(255, 198, 92, 0.16); stroke: var(--control); stroke-width: 1.6; }
`);

  function privFig(host, ctx) {
    const f = ctx.figure(host, {
      title: 'User mode, privileged mode',
      hint: 'step through · try to skip the module',
      wide: true,
      caption: 'One allocation, followed from a CUDA program down to the hardware on Linux. The program and <code>libcuda.so</code> run in user mode; <code>nvidia.ko</code> runs in the kernel, in privileged mode, and is the one that operates the GPU. Amber arrows carry the request down; the green path, drawn only while it is in use, carries the answer back up the same way. Simplified: real requests involve several such calls.',
    });
    const holder = el('div', { class: 'hsa-w' });
    f.stage.append(holder);
    GG.onVisible(holder, (v) => holder.classList.toggle('hsa-run', v));
    const G = {
      wide: { W: 760, H: 352, sub: true, nreg: 12, bands: { u: [10, 10, 740, 116], k: [10, 160, 740, 82], h: [10, 262, 740, 80] }, bndY: 143,
        prog: [40, 46, 270, 60], lib: [430, 46, 290, 60], ko: [430, 176, 290, 52], gpu: [40, 288, 680, 40], gate: [556, 133, 160, 20],
        a1: 'M310 70H426', a2: 'M590 106V172', a3: 'M590 228V284', r3: 'M704 288V232', r2: 'M704 176V110', r1: 'M430 92H314', retLab: [372, 121],
        blk: 'M40 76H26V308H36', xAt: [26, 143], xLab: [40, 147], regX0: 260, bandX: 40 },
      narrow: { W: 360, H: 446, sub: false, nreg: 8, bands: { u: [6, 6, 348, 186], k: [6, 222, 348, 92], h: [6, 334, 348, 104] }, bndY: 207,
        prog: [62, 38, 282, 56], lib: [62, 120, 282, 56], ko: [62, 246, 282, 52], gpu: [20, 368, 324, 56], gate: [196, 197, 148, 20],
        a1: 'M150 94V116', a2: 'M280 176V242', a3: 'M280 298V364', r3: 'M336 368V302', r2: 'M336 246V180', r1: 'M300 120V98', retLab: [292, 111, 'end'],
        blk: 'M62 66H34V364', xAt: [34, 207], xLab: [46, 211], regX0: 170, bandX: 62 },
    };
    const st = { i: 0, skip: false, layout: null };
    let N = {};
    function build(kind) {
      st.layout = kind;
      const g = G[kind];
      holder.innerHTML = '';
      const svg = svgRoot(holder, g.W, g.H, 'A CUDA program in user space calls libcuda.so, which makes a system call into the nvidia.ko kernel module in privileged mode, which operates the GPU.', 'hsa-priv');
      const B = g.bands;
      [['u', 'USER SPACE', 'user mode: ordinary programs'], ['k', 'KERNEL SPACE', 'privileged mode: the kernel and its modules'], ['h', 'HARDWARE', 'reached over PCIe']].forEach(([k, a, b]) => {
        const r = B[k];
        S('rect', { x: r[0], y: r[1], width: r[2], height: r[3], rx: 10, class: 'band ' + k }, svg);
        const bx = g.bandX || r[0] + 12;   // titles start at the boxes' left edge, clear of the blocked path's gutter
        txt(svg, bx, r[1] + 17, a, { class: 'bl ' + k });
        txt(svg, bx + a.length * 7.4 + 8, r[1] + 17, g.sub ? b : b.split(':')[0], { class: 'bs' });
      });
      S('line', { x1: 10, y1: g.bndY, x2: g.W - 10, y2: g.bndY, class: 'bnd' }, svg);
      const node = (key, r, title, sub, cls) => {
        const n = S('rect', { x: r[0], y: r[1], width: r[2], height: r[3], rx: 8, class: 'nd' + (cls ? ' ' + cls : '') }, svg);
        txt(svg, r[0] + 12, r[1] + (sub ? 23 : r[3] / 2 + 5), title, { class: 'nt' });
        if (sub) txt(svg, r[0] + 12, r[1] + 41, sub, { class: 'ns' });
        N[key] = n;
      };
      node('prog', g.prog, 'your CUDA program', 'cuMemAlloc(&p, 4 MiB)');
      node('lib', g.lib, 'libcuda.so', 'Driver API, user-space half');
      node('ko', g.ko, 'nvidia.ko', 'kernel module, kernel-space half');
      node('gpu', g.gpu, 'GPU', null, 'gpu');
      N.regs = [];
      for (let k = 0; k < g.nreg; k++) N.regs.push(S('rect', { x: g.regX0 + k * ((g.gpu[0] + g.gpu[2] - 14 - g.regX0) / g.nreg), y: g.gpu[1] + g.gpu[3] / 2 - 7, width: kind === 'wide' ? 26 : 9, height: 14, rx: 2, class: 'reg' }, svg));
      txt(svg, g.gpu[0] + 56, g.gpu[1] + g.gpu[3] / 2 + 4, kind === 'wide' ? 'control registers →' : 'registers →', { class: 'ns' });
      const gr = g.gate;
      N.gate = S('rect', { x: gr[0], y: gr[1], width: gr[2], height: gr[3], rx: 5, class: 'gate' }, svg);
      txt(svg, gr[0] + 7, gr[1] + 14, 'ioctl(/dev/nvidiactl)', { class: 'gt' });
      const defs = S('defs', null, svg);
      [['hsa-pk-dim', 'var(--ink-3)'], ['hsa-pk-ctl', 'var(--control)'], ['hsa-pk-ret', 'var(--core)']].forEach(([id, c]) => {
        const m = S('marker', { id, viewBox: '0 0 8 8', refX: 7, refY: 4, markerWidth: 6, markerHeight: 6, orient: 'auto' }, defs);
        S('path', { d: 'M0 0L8 4L0 8z', fill: c }, m);
      });
      N.a = {};
      [['a1', ''], ['a2', ''], ['a3', ''], ['r3', ' ret'], ['r2', ' ret'], ['r1', ' ret']].forEach(([k, c]) => { N.a[k] = S('path', { d: g[k], class: 'ar' + c }, svg); });
      N.retLab = g.retLab ? txt(svg, g.retLab[0], g.retLab[1], 'device pointer', { class: 'rt', 'text-anchor': g.retLab[2] || 'middle' }) : null;
      N.blk = S('g', null, svg);
      S('path', { d: g.blk, class: 'ar blk' }, N.blk);
      const [xx, xy] = g.xAt;
      S('path', { d: `M${xx - 8} ${xy - 8}L${xx + 8} ${xy + 8}M${xx + 8} ${xy - 8}L${xx - 8} ${xy + 8}`, class: 'x' }, N.blk);
      // the label sits on the dashed boundary: an opaque plate behind it breaks the line there
      N.blkLab = S('g', null, svg);
      const xPlate = S('rect', { x: g.xLab[0] - 4, y: g.bndY - 8, height: 16, rx: 3, fill: '#121420' }, N.blkLab);
      const xT = txt(N.blkLab, g.xLab[0], g.xLab[1], kind === 'wide' ? 'blocked: segmentation fault' : 'blocked: segfault', { class: 'xt' });
      xPlate.setAttribute('width', r2((xT.getComputedTextLength() || xT.textContent.length * 6.8) + 8));
      render();
    }
    const STEPS = [
      { label: 'call', on: ['prog'], ar: ['a1'], mode: 'user', who: 'your program', why: 'Your program calls <code>cuMemAlloc</code> to get 4 MiB of GPU memory. That is an ordinary function call into <code>libcuda.so</code>, the Driver API library loaded into the program. Everything here runs in <b>user mode</b>.' },
      { label: 'system call', on: ['lib'], ar: ['a2'], gate: true, mode: 'user → kernel', who: 'libcuda.so', why: '<code>libcuda.so</code> cannot touch hardware either. It makes a <b>system call</b>, <code>ioctl()</code>, on a device file the driver’s modules created: allocations like this one go to the control device, <code>/dev/nvidiactl</code> (next to it sit <code>/dev/nvidia0</code>, one per GPU, and <code>/dev/nvidia-uvm</code> for unified memory). The CPU switches into <b>privileged mode</b> and runs the kernel module’s code.' },
      { label: 'operate the GPU', on: ['ko', 'gpu'], ar: ['a3'], regs: true, mode: 'kernel (privileged)', who: 'nvidia.ko', why: 'In privileged mode, <code>nvidia.ko</code> does what no user program may: it reads and writes the GPU’s control registers across PCIe, reserves 4 MiB of GPU memory and maps it into the GPU’s address space for this program. On recent GPUs, the B200 included, much of this work is handed on to firmware running on the GPU’s own small processor, the GSP (GPU System Processor).' },
      { label: 'return', on: ['ko', 'lib', 'prog'], ar: ['r3', 'r2', 'r1'], ret: true, mode: 'kernel → user', who: 'your program', why: 'The answer travels back the way the request came (green): from the GPU to <code>nvidia.ko</code>, which returns from the system call, so the CPU drops back to <b>user mode</b> in <code>libcuda.so</code>, and <code>cuMemAlloc</code> hands the program a device pointer to its new memory.' },
    ];
    const stMode = GG.ui.stat(f.readouts, { label: 'CPU mode', value: '' });
    const stWho = GG.ui.stat(f.readouts, { label: 'running', value: '' });
    function render() {
      const s = STEPS[st.i];
      ['prog', 'lib', 'ko', 'gpu'].forEach((k) => { N[k].classList.toggle('on', !st.skip && s.on.includes(k)); N[k].classList.remove('bad'); });
      Object.keys(N.a).forEach((k) => {
        const on = !st.skip && s.ar.includes(k), ret = k[0] === 'r';
        N.a[k].classList.toggle('on', on);
        N.a[k].style.display = ret && !on ? 'none' : '';   // the return path exists only while something returns along it
        N.a[k].setAttribute('marker-end', `url(#${on ? (ret ? 'hsa-pk-ret' : 'hsa-pk-ctl') : 'hsa-pk-dim'})`);
      });
      if (N.retLab) N.retLab.style.display = !st.skip && s.ret ? '' : 'none';
      N.gate.classList.toggle('on', !st.skip && !!s.gate);
      N.regs.forEach((r) => r.classList.toggle('on', !st.skip && !!s.regs));
      N.blk.style.display = st.skip ? '' : 'none';
      N.blkLab.style.display = st.skip ? '' : 'none';
      if (st.skip) {
        N.prog.classList.add('on', 'bad');
        stMode.set('user', 'host');
        stWho.set('blocked', 'danger');
        f.setWhy('<b>No shortcut.</b> A user-mode program cannot simply write to the GPU’s registers. They are not mapped into its memory, so the CPU’s memory protection stops the access and the kernel ends the program with a segmentation fault. Only privileged code, the kernel and modules like <code>nvidia.ko</code>, operates the hardware directly.');
        return;
      }
      stMode.set(s.mode, /kernel/.test(s.mode) && !/→ user/.test(s.mode) ? 'control' : 'host');
      stWho.set(s.who, null);
      f.setWhy(s.why);
    }
    const stepper = GG.ui.stepper(f.controls, { label: 'Step', steps: STEPS, autoplay: 2600, onStep: (i) => { st.i = i; if (N.prog) render(); } });
    const tg = GG.ui.toggle(f.controls, { label: 'skip the kernel module: write to the GPU from user space', value: false, onChange: (v) => { st.skip = v; render(); } });
    void stepper; void tg;
    onWidth(holder, (w) => { const want = w < 560 ? 'narrow' : 'wide'; if (want !== st.layout) build(want); });
    build((f.stage.getBoundingClientRect().width || 700) < 560 ? 'narrow' : 'wide');
  }

  /* nvidia-ko Fig. 3: a drawing of what each inspection command reveals. Illustrative, not real output.
     k indexes the command list in koShelfFig. Returns a dispose function (the modprobe drawing animates). */
  function koReveal(parent, k, narrow) {
    const W = narrow ? 340 : 600;
    const H = [[232, 300], [200, 324], [176, 300], [216, 304], [282, 306], [196, 300]][k][narrow ? 1 : 0];
    const LABEL = ['Module dependency graph: nvidia_drm depends on nvidia_modeset; nvidia_modeset and nvidia_uvm depend on nvidia, which is loaded into the running kernel.',
      'modinfo reads the nvidia.ko file on disk and reports its filename, version, vermagic and license fields.',
      'Two flavours of nvidia.ko: the open module declares the license Dual MIT/GPL, the proprietary one NVIDIA.',
      'The installed nvidia.ko on disk and the loaded module in the running kernel can have different versions; /proc/driver/nvidia/version reports the loaded one.',
      'Device files: /dev/nvidia0 to /dev/nvidia7 and /dev/nvidiactl belong to nvidia.ko, /dev/nvidia-uvm to nvidia-uvm.ko; each /dev/nvidiaN leads to one of eight GPUs. User-space libraries open these files.',
      'modprobe loads nvidia.ko from disk into the running kernel.'][k];
    const svg = svgRoot(parent, W, H, LABEL, 'hsa-kr' + (narrow ? ' narrow' : ''));
    const defs = S('defs', null, svg);
    [['hsa-kr-ah', 'var(--ink-2)'], ['hsa-kr-ahc', 'var(--control)']].forEach(([id, c]) => {
      const m = S('marker', { id, viewBox: '0 0 8 8', refX: 7, refY: 4, markerWidth: 6, markerHeight: 6, orient: 'auto' }, defs);
      S('path', { d: 'M0 0L8 4L0 8z', fill: c }, m);
    });
    const band = (x, y, w, h, kind, title, sub) => {
      S('rect', { x, y, width: w, height: h, rx: 9, class: 'band ' + kind }, svg);
      if (title) {
        const t = txt(svg, x + 10, y + 16, title, { class: 'bl hsa-halo ' + kind });
        if (sub) txt(svg, x + 10 + title.length * 7.4 + 8, y + 16, sub, { class: 'il hsa-halo' });
        return t;
      }
      return null;
    };
    const node = (x, y, w, h, label, cls, opts = {}) => {
      const g = opts.into || svg;
      S('rect', { x, y, width: w, height: h, rx: opts.rx == null ? 6 : opts.rx, class: 'nd ' + (cls || '') }, g);
      if (label != null) txt(g, opts.left ? x + 10 : x + w / 2, y + h / 2 + 4, label, { class: 'nt' + (opts.sm ? ' sm' : ''), 'text-anchor': opts.left ? 'start' : 'middle' });
    };
    const arrow = (d, cls) => S('path', { d, class: 'ar' + (cls ? ' ' + cls : ''), 'marker-end': `url(#${/ctl/.test(cls || '') ? 'hsa-kr-ahc' : 'hsa-kr-ah'})` }, svg);
    const line = (d, cls) => S('path', { d, class: 'ln' + (cls ? ' ' + cls : '') }, svg);
    const note = (x, y, t, anchor) => txt(svg, x, y, t, { class: 'il', 'text-anchor': anchor || 'start' });
    const fileIcon = (x, y, w, h, label) => {
      S('path', { d: `M${x} ${y}H${x + w - 14}L${x + w} ${y + 14}V${y + h}H${x}Z`, class: 'nd file' }, svg);
      S('path', { d: `M${x + w - 14} ${y}V${y + 14}H${x + w}`, class: 'ln' }, svg);
      txt(svg, x + w / 2, y + h / 2 + 5, label, { class: 'nt', 'text-anchor': 'middle' });
    };
    const lock = (x, y, open, g) => {
      S('path', { d: open ? `M${x + 3} ${y + 7}V${y + 4}a4 4 0 0 1 8 0` : `M${x + 3} ${y + 7}V${y + 4}a4 4 0 0 1 8 0V${y + 7}`, class: 'lock ' + (open ? 'open' : 'closed') }, g || svg);
      S('rect', { x, y: y + 7, width: 14, height: 10, rx: 2, class: 'lock ' + (open ? 'open' : 'closed') }, g || svg);
    };
    let dispose = () => {};

    if (k === 0) {   // lsmod: who depends on whom
      if (!narrow) {
        band(10, 8, 580, 192, 'k', 'KERNEL SPACE', 'modules lsmod lists');
        node(30, 44, 150, 32, 'nvidia_drm', 'mod');
        node(225, 44, 150, 32, 'nvidia_modeset', 'mod');
        node(420, 44, 150, 32, 'nvidia_uvm', 'mod');
        node(225, 108, 345, 34, 'nvidia', 'mod');
        node(30, 164, 540, 26, 'the running Linux kernel', 'kern', { sm: true });
        arrow('M180 60H219'); arrow('M300 76V102'); arrow('M495 76V102'); arrow('M397 142V158', 'dash');
        note(180, 155, 'loaded into', 'start');
        note(10, 222, '→ depends on (lsmod’s “Used by” column, read the other way)');
        note(590, 222, 'illustrative', 'end');
      } else {
        band(6, 6, 328, 256, 'k', 'KERNEL SPACE', 'lsmod');
        node(18, 38, 146, 32, 'nvidia_drm', 'mod');
        node(176, 38, 146, 32, 'nvidia_uvm', 'mod');
        node(18, 98, 146, 32, 'nvidia_modeset', 'mod');
        node(18, 160, 304, 32, 'nvidia', 'mod');
        node(18, 222, 304, 26, 'running Linux kernel', 'kern', { sm: true });
        arrow('M91 70V92'); arrow('M91 130V154'); arrow('M249 70V154'); arrow('M170 192V216', 'dash');
        note(180, 210, 'loaded into');
        note(6, 282, '→ depends on (lsmod’s “Used by”,');
        note(6, 296, '   read the other way)');
        note(334, 296, 'illustrative', 'end');
      }
    } else if (k === 1) {   // modinfo: the file's fields
      const rows = [['filename', 'where the .ko file sits on disk'], ['version', 'must match the user-space driver libraries'], ['vermagic', 'the kernel version it was built for'], ['license', 'open or proprietary (next command)']];
      if (!narrow) {
        band(10, 8, 190, 184, 'd', 'DISK');
        fileIcon(45, 42, 120, 84, 'nvidia.ko');
        note(105, 150, '/lib/modules/', 'middle');
        note(105, 164, '<kernel>/…/nvidia.ko', 'middle');
        arrow('M168 84H232');
        note(200, 76, 'reads', 'middle');
        node(238, 8, 352, 184, null, 'card', { rx: 9 });
        txt(svg, 252, 28, 'modinfo nvidia', { class: 'bl d' });
        rows.forEach(([a, b], i) => {
          const y = 58 + i * 36;
          if (i) S('line', { x1: 248, y1: y - 22, x2: 580, y2: y - 22, class: 'rule' }, svg);
          txt(svg, 252, y, a + ':', { class: 'nk' });
          txt(svg, 338, y, b, { class: 'ns' });
        });
      } else {
        band(6, 6, 328, 96, 'd', 'DISK');
        fileIcon(18, 28, 84, 62, 'nvidia.ko');
        note(114, 54, '/lib/modules/<kernel>/');
        note(114, 68, '…/nvidia.ko');
        arrow('M170 104V124');
        note(180, 118, 'modinfo reads');
        node(6, 128, 328, 190, null, 'card', { rx: 9 });
        txt(svg, 18, 148, 'modinfo nvidia', { class: 'bl d' });
        rows.forEach(([a, b], i) => {
          const y = 176 + i * 36;
          if (i) S('line', { x1: 16, y1: y - 18, x2: 324, y2: y - 18, class: 'rule' }, svg);
          txt(svg, 18, y, a + ':', { class: 'nk' });
          txt(svg, 18, y + 15, b, { class: 'ns' });
        });
      }
    } else if (k === 2) {   // license: two flavours
      const card = (x, y, w, h, open) => {
        node(x, y, w, h, null, 'card ' + (open ? 'open' : 'closed'), { rx: 9 });
        txt(svg, x + 14, y + 22, open ? 'open kernel module' : 'proprietary module', { class: 'nt' });
        lock(x + w - 28, y + 9, open);
        txt(svg, x + 14, y + 44, 'license:', { class: 'ns' });
        txt(svg, x + 14, y + 66, open ? 'Dual MIT/GPL' : 'NVIDIA', { class: 'big' + (open ? ' open' : '') });
        txt(svg, x + 14, y + 92, open ? 'source: public, on GitHub' : 'source: closed, except a thin layer', { class: 'ns' });
        txt(svg, x + 14, y + 107, open ? 'default from R560 on, Turing and later' : 'that adapts it to the running kernel', { class: 'ns' });
        txt(svg, x + 14, y + 122, open ? '' : 'still runs older GPUs', { class: 'ns' });
      };
      if (!narrow) { card(10, 8, 284, 140, true); card(306, 8, 284, 140, false); note(10, 170, 'Both are binary nvidia.ko files once built.'); }
      else { card(6, 6, 328, 132, true); card(6, 148, 328, 132, false); note(6, 296, 'Both are binary nvidia.ko files once built.'); }
    } else if (k === 3) {   // /proc version: installed vs loaded
      if (!narrow) {
        band(10, 8, 230, 172, 'd', 'DISK', 'installed');
        fileIcon(40, 40, 120, 70, 'nvidia.ko');
        txt(svg, 40, 134, 'version on disk', { class: 'ns' });
        note(40, 150, '(what modinfo reports)');
        band(280, 8, 310, 172, 'k', 'KERNEL SPACE', 'running');
        node(300, 40, 270, 40, 'nvidia (loaded)', 'mod');
        txt(svg, 300, 98, 'version in memory', { class: 'ns' });
        node(300, 122, 270, 30, '/proc/driver/nvidia/version', 'dev', { sm: true });
        arrow('M435 80V118', 'ctl');
        note(443, 106, 'publishes');
        arrow('M162 66H296', 'dash');
        note(229, 58, 'loaded at boot', 'middle'); note(229, 92, 'or by modprobe', 'middle');
        txt(svg, 40, 206, 'after a driver upgrade these two versions can differ until a reload or reboot', { class: 'ns' });
        txt(svg, 20, 207, '≠', { class: 'ne' });
      } else {
        band(6, 6, 328, 96, 'd', 'DISK', 'installed');
        fileIcon(18, 28, 84, 60, 'nvidia.ko');
        txt(svg, 114, 54, 'version on disk', { class: 'ns' });
        note(114, 70, '(what modinfo reports)');
        arrow('M60 104V136', 'dash');
        note(70, 124, 'loaded at boot or by modprobe');
        band(6, 140, 328, 120, 'k', 'KERNEL SPACE', 'running');
        node(18, 166, 304, 34, 'nvidia (loaded)', 'mod');
        txt(svg, 18, 216, 'version in memory', { class: 'ns' });
        node(18, 224, 304, 28, '/proc/driver/nvidia/version', 'dev', { sm: true });
        txt(svg, 6, 282, '≠', { class: 'ne' });
        txt(svg, 24, 282, 'after a driver upgrade these two can', { class: 'ns' });
        txt(svg, 24, 297, 'differ until a reload or reboot', { class: 'ns' });
      }
    } else if (k === 4) {   // /dev/nvidia*: files, modules, GPUs
      const g = narrow
        ? { u: [6, 6, 328, 50], libs: [[18, 26, 120, 24, 'libcuda.so'], [146, 26, 176, 24, 'libnvidia-ml.so (NVML)']], dv: [6, 68, 328, 92], fx: (i) => 18 + i * 24, fw: 21, fy: 126, ctl: [18, 92, 189, 24], uvm: [214, 92, 108, 60],
            k: [6, 168, 328, 64], ko: [18, 194, 189, 28], uko: [214, 194, 108, 28], h: [6, 240, 328, 60], gy: 266 }
        : { u: [10, 8, 580, 48], libs: [[230, 18, 120, 28, 'libcuda.so'], [370, 18, 170, 28, 'libnvidia-ml.so (NVML)']], dv: [10, 70, 580, 66], fx: (i) => 16 + i * 34, fw: 30, fy: 96, ctl: [296, 96, 76, 28], uvm: [378, 96, 206, 28],
            k: [10, 146, 580, 62], ko: [16, 170, 356, 28], uko: [378, 170, 206, 28], h: [10, 216, 580, 56], gy: 238 };
      band(...g.u, 'u', 'USER SPACE');
      g.libs.forEach(([x, y, w, h, t]) => { node(x, y, w, h, t, 'lib', { sm: true }); arrow(`M${x + w / 2} ${y + h}V${g.dv[1] - 2}`); });
      note(g.libs[0][0] + g.libs[0][2] / 2 + 8, g.dv[1] - 5, 'open() + ioctl()');
      band(...g.dv, 'dv', '/dev', narrow ? 'device files' : 'device files: nvidia0 … nvidia7, one per GPU');
      for (let i = 0; i < 8; i++) {
        const x = g.fx(i);
        node(x, g.fy, g.fw, 26, String(i), 'dev', { sm: true, rx: 4 });
        line(`M${x + g.fw / 2} ${g.fy + 26}V${g.ko[1]}`);
        line(`M${x + g.fw / 2} ${g.ko[1] + g.ko[3]}V${g.gy}`, 'gpu');
      }
      node(...g.ctl, 'nvidiactl', 'dev', { sm: true, rx: 4 });
      if (narrow) {
        line(`M${g.ctl[0]} ${g.ctl[1] + 12}H11V${g.ko[1] + 14}H${g.ko[0]}`);
        S('rect', { x: g.uvm[0], y: g.uvm[1], width: g.uvm[2], height: g.uvm[3], rx: 4, class: 'nd dev' }, svg);
        txt(svg, g.uvm[0] + g.uvm[2] / 2, g.uvm[1] + 24, 'nvidia-uvm', { class: 'nt sm', 'text-anchor': 'middle' });
        txt(svg, g.uvm[0] + g.uvm[2] / 2, g.uvm[1] + 42, 'nvidia-uvm-tools', { class: 'nt sm', 'text-anchor': 'middle' });
        line(`M${g.uvm[0] + g.uvm[2] / 2} ${g.uvm[1] + g.uvm[3]}V${g.uko[1]}`);
      } else {
        line(`M${g.ctl[0] + g.ctl[2] / 2} ${g.ctl[1] + 28}V${g.ko[1]}`);
        node(378, 96, 80, 28, 'nvidia-uvm', 'dev', { sm: true, rx: 4 });
        node(464, 96, 120, 28, 'nvidia-uvm-tools', 'dev', { sm: true, rx: 4 });
        line(`M418 124V${g.uko[1]}`); line(`M524 124V${g.uko[1]}`);
      }
      band(...g.k, 'k', 'KERNEL SPACE');
      node(...g.ko, 'nvidia.ko', 'mod', { sm: true });
      node(...g.uko, 'nvidia-uvm.ko', 'mod', { sm: true });
      band(...g.h, 'h', 'HARDWARE');
      for (let i = 0; i < 8; i++) node(g.fx(i), g.gy, g.fw, 24, 'GPU', 'gpu', { sm: true, rx: 4 });
      // the "GPU" label does not fit the narrow boxes: number them there instead
      if (narrow) $$(svg, 'rect.gpu + text').forEach((t, i) => { t.textContent = String(i); });
      note(g.h[0] + g.h[2] - 8, g.h[1] + 16, narrow ? 'illustrative · 8 GPUs' : 'illustrative · 8-GPU machine', 'end');
    } else {   // modprobe: load from disk into the running kernel
      const g = narrow
        ? { d: [6, 6, 328, 112], f: [18, 30, 84, 62], p: [114, 56], k: [6, 146, 328, 146], slot: [18, 186, 304, 40], to: [18, 186], from: [18, 40], st: [18, 250] }
        : { d: [10, 8, 210, 180], f: [45, 40, 120, 80], p: [105, 140], k: [260, 8, 330, 180], slot: [276, 62, 298, 44], to: [276, 62], from: [45, 58], st: [276, 136] };
      band(...g.d, 'd', 'DISK');
      fileIcon(g.f[0], g.f[1], g.f[2], g.f[3], 'nvidia.ko');
      if (narrow) { note(g.p[0], g.p[1], '/lib/modules/<kernel>/'); note(g.p[0], g.p[1] + 14, '…/nvidia.ko'); }
      else { note(g.p[0], g.p[1], '/lib/modules/', 'middle'); note(g.p[0], g.p[1] + 14, '<kernel>/…/nvidia.ko', 'middle'); }
      band(...g.k, 'k', 'KERNEL SPACE', 'running, privileged');
      node(...g.slot, null, 'slot');
      if (narrow) { arrow('M170 120V180', 'dash ctl'); note(180, 156, 'modprobe loads it'); }
      else { arrow('M222 84H270', 'dash ctl'); note(246, 76, 'modprobe', 'middle'); }
      const slotLab = txt(svg, g.slot[0] + 12, g.slot[1] + g.slot[3] / 2 + 4, 'not loaded', { class: 'il' });
      const st1 = txt(svg, g.st[0], g.st[1], '', { class: 'ns' });
      const st2 = txt(svg, g.st[0], g.st[1] + 16, '', { class: 'ns' });
      note(g.k[0] + g.k[2] - 8, g.k[1] + g.k[3] - 10, 'root only · no reboot', 'end');
      const mv = S('g', { class: 'mv' }, svg);
      const mw = g.slot[2], mh = g.slot[3];
      S('rect', { x: 0, y: 0, width: mw, height: mh, rx: 6, class: 'nd' }, mv);
      txt(mv, 12, mh / 2 + 4, 'nvidia', { class: 'nt' });
      const mvSub = txt(mv, mw - 12, mh / 2 + 4, 'copying in…', { class: 'il', 'text-anchor': 'end' });
      const place = (p) => {   // p in [0, 1]: from on top of the file to the kernel slot
        const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        const sc = 0.45 + 0.55 * e;
        const x = g.from[0] + (g.to[0] - g.from[0]) * e, y = g.from[1] + (g.to[1] - g.from[1]) * e - Math.sin(Math.PI * e) * (narrow ? 0 : 26);
        mv.setAttribute('transform', `translate(${r2(x)} ${r2(y)}) scale(${r2(sc)})`);
        mv.style.opacity = p <= 0 ? '0' : String(Math.min(1, p * 4));
        const done = p >= 1;
        slotLab.style.display = done || p > 0.6 ? 'none' : '';
        mvSub.textContent = done ? 'loaded' : 'copying in…';
        st1.textContent = done ? 'lsmod now lists nvidia, and its' : '';
        st2.textContent = done ? 'code runs in privileged mode' : '';
      };
      const DUR = 1.8;
      const anim = GG.anim(svg, (t) => { const p = Math.min(1, t / DUR); place(p); if (p >= 1) anim.stop(); }, { autostart: false });
      if (GG.reducedMotion) place(1); else { place(0); anim.reset().start(); }
      const again = GG.ui.button(parent, { label: 'Run modprobe again', icon: 'reset', onClick: () => { if (GG.reducedMotion) { place(1); return; } place(0); anim.reset().start(); } });
      dispose = () => { anim.dispose(); again.remove(); };
    }
    return dispose;
  }

  function koShelfFig(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Meet the module on a real machine',
      hint: 'pick a command',
      wide: true,
      caption: 'Standard Linux commands for inspecting kernel modules, as they apply to nvidia.ko. Added context, not from the glossary. Rather than reproduce output, which varies by machine, we draw what each command reveals (illustrative). The device files are an abridged example for an 8-GPU machine like the one in the nvidia-smi entry.',
    });
    const box = el('div', { class: 'hsa-shelf' });
    f.stage.append(box);
    onWidth(box, (w) => box.classList.toggle('one', w < 620));
    const cmds = el('div', { class: 'hsa-cmds' });
    const out = el('div', { class: 'hsa-cmdout', 'aria-live': 'polite' });
    box.append(cmds, out);
    const C = [
      { c: 'lsmod | grep nvidia', t: 'list loaded modules', why: '<b>Is it loaded?</b> <code>lsmod</code> lists the modules currently loaded into the running kernel. On a CUDA machine you see <code>nvidia</code> plus its companions <code>nvidia_uvm</code>, <code>nvidia_modeset</code> and <code>nvidia_drm</code> (lsmod writes dashes in module names as underscores), along with which modules depend on which.' },
      { c: 'modinfo nvidia', t: 'describe the module file', why: '<b>Which file, which version?</b> <code>modinfo</code> describes a module file: its path on disk (ending in <code>nvidia.ko</code>), its version, which must match the user-space driver libraries, the kernel version it was built for, and its license.' },
      { c: 'modinfo -F license nvidia', t: 'open or proprietary?', why: '<b>Open or proprietary?</b> The open kernel module declares the license <code>Dual MIT/GPL</code>; the older proprietary module declares <code>NVIDIA</code>. Both are binary <code>.ko</code> files once built; only the open one’s source is public.' },
      { c: 'cat /proc/driver/nvidia/version', t: 'ask the running driver', why: '<b>What is actually running?</b> The loaded module publishes files under <code>/proc/driver/nvidia/</code>. This one states the version of the kernel module that is loaded right now, which can differ from what is installed on disk until the module is reloaded or the machine reboots.' },
      { c: 'ls /dev/nvidia*', t: 'the doors into the module', out: '/dev/nvidia0  /dev/nvidia1  …  /dev/nvidia7\n/dev/nvidiactl  /dev/nvidia-uvm  /dev/nvidia-uvm-tools\n…', why: '<b>The doors into the driver.</b> The kernel modules expose device files: one per GPU (<code>/dev/nvidia0</code> to <code>/dev/nvidia7</code> on an 8-GPU machine), a control device (<code>/dev/nvidiactl</code>), and the unified-memory devices from <code>nvidia-uvm.ko</code>. Depending on the setup you may also see <code>/dev/nvidia-modeset</code> and a <code>/dev/nvidia-caps</code> directory, used for Multi-Instance GPU. <code>libcuda.so</code> and NVML open these files and send <code>ioctl()</code> calls through them. A container sees the GPUs only if these files are passed into it.' },
      { c: 'sudo modprobe nvidia', t: 'load it', why: '<b>Load it.</b> <code>modprobe</code> loads a module into the running kernel, together with any modules it depends on, without a reboot. That on-demand loading is what makes it a <em>kernel module</em> rather than part of the kernel image. Loading and unloading require root.' },
    ];
    const btns = C.map((x, k) => {
      const b = el('button', { type: 'button', class: 'hsa-cmd', 'aria-pressed': 'false', title: x.t, text: x.c });
      b.addEventListener('click', () => pick(k));
      cmds.append(b);
      return b;
    });
    let cur = 0, narrow = null, drop = () => {};
    function draw() {
      drop();
      const holder = out.querySelector('.hsa-kr-wrap');
      holder.innerHTML = '';
      drop = koReveal(holder, cur, narrow);
    }
    function pick(k) {
      cur = k;
      btns.forEach((b, j) => b.setAttribute('aria-pressed', String(j === k)));
      const x = C[k];
      out.innerHTML = `<pre class="hsa-term"><span class="p">$</span> <span class="c">${esc(x.c)}</span>${x.out ? '\n' + esc(x.out) : '\n<span class="dim"># output varies by machine; drawn below</span>'}</pre><div class="hsa-kr-wrap"></div><p>${x.why}</p>`;
      if (narrow != null) draw();
      f.setWhy(`<b>${esc(x.t)}</b>: <code>${esc(x.c)}</code>`);
    }
    pick(0);
    onWidth(out, (w) => { const nw = w < 520; if (nw !== narrow) { narrow = nw; draw(); } });
  }

  const LOCK = {
    closed: '<svg class="hsa-lock" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 7.5V5a3 3 0 0 1 6 0v2.5" fill="none"/><rect x="3" y="7.5" width="10" height="7" rx="1.6"/></svg>',
    open: '<svg class="hsa-lock" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 7.5V5a3 3 0 0 1 6 0" fill="none"/><rect x="3" y="7.5" width="10" height="7" rx="1.6"/></svg>',
    yours: '<svg class="hsa-lock" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3.5h10M3 8h7M3 12.5h9" fill="none"/></svg>',
  };
  function openClosedFig(host, ctx) {
    const f = ctx.figure(host, {
      title: 'nvidia.ko in the stack: open and closed',
      hint: 'click a layer · switch the module flavour',
      wide: true,
      caption: `The run-time layers of the CUDA Toolkit diagram (redrawn from the glossary’s figure, adapted from ${PROF_CUDA}) with the Linux file behind each one, sorted by where it runs, and marked by whether its source code is public. An open padlock means public source. Which pieces are open is added context from NVIDIA’s repositories and announcements.`,
    });
    const L = [
      { k: 'app', band: 'user', name: 'your program', sub: 'Applications', src: 'yours', from: 'you',
        why: () => 'Your own code, calling the layers below. Its source is whatever you decide.' },
      { k: 'rt', band: 'user', name: 'libcudart.so', sub: 'CUDA Runtime API', src: 'closed', from: 'CUDA Toolkit',
        why: () => `The ${T('cuda-runtime-api', 'CUDA Runtime API')} ships as compiled code with the CUDA Toolkit, as ${T('libcudart', 'libcudart.so')} and a static library. Its documentation is public; its source is not.` },
      { k: 'drv', band: 'user', name: 'libcuda.so', sub: 'CUDA Driver API', src: 'closed', from: 'NVIDIA driver',
        why: () => `The ${T('cuda-driver-api', 'CUDA Driver API')}, the user-space half of the driver, in ${T('libcuda', 'libcuda.so')}. Closed source: the open alternatives described in its entry re-implement it from the outside.` },
      { k: 'nvml', band: 'user', name: 'libnvidia-ml.so', sub: 'NVML (the glossary’s libnvml.so)', src: 'closed', from: 'NVIDIA driver',
        why: () => `${T('nvml', 'NVML')}, the management library behind nvidia-smi (${T('libnvml', 'libnvml.so')}). Also closed source.` },
      { k: 'ko', band: 'kern', name: 'nvidia.ko', sub: 'the NVIDIA GPU Driver box: the core kernel module', src: 'flavour', from: 'NVIDIA driver',
        why: (fl) => fl === 'open'
          ? '<b>The open flavour.</b> This <code>nvidia.ko</code> is built from the source NVIDIA publishes on GitHub and declares the license <code>Dual MIT/GPL</code>: anyone can read, build and modify it. It is the default for Turing and later GPUs from the R560 drivers on, and the only flavour supported on Blackwell GPUs such as the B200s in the nvidia-smi sample.'
          : '<b>The proprietary flavour.</b> NVIDIA’s older module declares the license <code>NVIDIA</code>. Most of it ships as a precompiled binary; only a thin layer that adapts it to the running Linux kernel comes as source. It still runs older GPUs that the open modules do not support.' },
      { k: 'comp', band: 'kern', name: 'nvidia-uvm.ko · nvidia-modeset.ko · nvidia-drm.ko', sub: 'companion modules', src: 'flavour', from: 'NVIDIA driver',
        why: (fl) => `The companion modules (unified memory, display mode setting, the Linux graphics interface) come from the same source tree as <code>nvidia.ko</code>, so they are ${fl === 'open' ? 'open' : 'proprietary'} along with it.` },
      { k: 'gsp', band: 'gpu', name: 'GSP firmware', sub: 'runs on the GPU System Processor', src: 'closed', from: 'NVIDIA driver',
        why: () => 'Firmware the kernel module loads onto the GPU’s own small processor when the GPU starts. It ships as a binary file under <code>/lib/firmware/nvidia/</code>; its source is not public. With the open modules, much of the driver’s work of setting up and managing the GPU runs here.' },
    ];
    const BANDS = [['user', 'user space', 'ordinary programs, user mode'], ['kern', 'kernel space', 'privileged mode'], ['gpu', 'on the GPU', 'firmware']];
    const VIA = { kern: 'system calls on /dev/nvidia*', gpu: 'PCIe' };
    const box = el('div', { class: 'hsa-oc' });
    f.stage.append(box);
    const rows = {};
    BANDS.forEach(([b, name, sub]) => {
      if (VIA[b]) box.append(el('div', { class: 'hsa-oc-via', html: `<span>${VIA[b]}</span>` }));
      const band = el('div', { class: 'hsa-band ' + b });
      band.innerHTML = `<div class="hsa-band-h"><b>${name}</b><span>${sub}</span></div>`;
      L.filter((x) => x.band === b).forEach((x) => {
        const r = el('button', { type: 'button', class: 'hsa-oc-row', 'aria-pressed': 'false' });
        r.addEventListener('click', () => pick(x.k));
        band.append(r);
        rows[x.k] = r;
      });
      box.append(band);
    });
    const stO = GG.ui.stat(f.readouts, { label: 'driver & toolkit layers with public source', value: '' });
    const stLic = GG.ui.stat(f.readouts, { label: 'nvidia.ko license', value: '' });
    let fl = 'open', cur = 'ko';
    const srcOf = (x) => (x.src === 'flavour' ? fl : x.src);
    function draw() {
      let open = 0, n = 0;
      L.forEach((x) => {
        const s = srcOf(x);
        if (x.src !== 'yours') { n++; if (s === 'open') open++; }
        const tag = s === 'open' ? 'open source' : s === 'closed' ? 'closed source' : 'your code';
        rows[x.k].className = 'hsa-oc-row ' + s;
        rows[x.k].innerHTML = `${LOCK[s] || LOCK.closed}<span class="nm"><b>${esc(x.name)}</b><small>${esc(x.sub)}</small></span><span class="src">${tag}<small>from: ${esc(x.from)}</small></span>`;
        rows[x.k].setAttribute('aria-pressed', String(x.k === cur));
      });
      stO.set(`${open} of ${n}`);
      stLic.set(fl === 'open' ? 'Dual MIT/GPL' : 'NVIDIA');
    }
    function pick(k) {
      cur = k;
      draw();
      f.setWhy(L.find((x) => x.k === k).why(fl));
    }
    GG.ui.seg(f.controls, { label: 'kernel modules installed', value: 'open', options: [{ value: 'open', label: 'open (default)' }, { value: 'prop', label: 'proprietary' }], onChange: (v) => { fl = v === 'open' ? 'open' : 'closed'; pick(cur); } });
    pick('ko');
  }

  GG.entry('nvidia-ko', {
    render(body, ctx) {
      body.classList.add('hsa-body');
      const s = ctx.html(body, `
<p>A ${X('https://wiki.archlinux.org/title/Kernel_module', 'kernel module')} is a piece of code that can be loaded into the running operating system kernel, and unloaded again, without rebooting. Most hardware drivers on Linux are modules, so the kernel only carries code for the devices a machine actually has. The <code>.ko</code> extension stands for <em>kernel object</em>. “Binary” means the file holds compiled machine code, built to match a particular kernel version, rather than source code. <strong><code>nvidia.ko</code></strong> is the module at the core of the ${T('nvidia-gpu-drivers', 'NVIDIA GPU drivers')} for Linux.</p>
<h3>Privileged mode</h3>
<p>Like other kernel modules, it executes in privileged mode and communicates directly with hardware on behalf of the user: in this case, the GPU.</p>
<p>CPUs run code in at least two modes. In <em>privileged mode</em> (kernel mode; “ring 0” on x86) code can execute any instruction, read and write any memory and talk to any device. In <em>user mode</em> it can do none of that, and has to ask the kernel through a <em>system call</em>. Every ordinary program runs in user mode, including CUDA programs and the ${T('cuda-driver-api', 'CUDA Driver API')} library inside them. So when a CUDA program needs the GPU, the request ends up in <code>nvidia.ko</code>. Fig. 1 follows one.</p>
<div data-slot="priv" class="wide"></div>
${GG.noteHTML('beyond', '<p><b>Not every request is a system call.</b> Crossing into the kernel takes time, so the drivers avoid it on hot paths. When a program starts using the GPU, <code>nvidia.ko</code> can map specific GPU resources, such as the queues that work is submitted through, into the program’s memory. <code>libcuda.so</code> can then queue kernel launches by writing to that memory directly. The kernel module still decides what is mapped and to whom, which is what keeps one process from touching another’s GPU state.</p>')}
<h3>Where it sits, and what is open</h3>
<p>In the CUDA Toolkit diagram (drawn in the ${T('cuda-software-platform', 'CUDA software platform')} and ${T('cuda-driver-api', 'CUDA Driver API')} entries), <code>nvidia.ko</code> is the <b>NVIDIA GPU Driver</b> box: below the dashed user-space / kernel-space line, and the only box with an arrow into the GPU.</p>
<p>The Linux Open GPU Kernel Module is ${X('https://github.com/NVIDIA/open-gpu-kernel-modules', 'open source')}: anyone can read, build and modify the code of <code>nvidia.ko</code> and its companion modules. The user-space side of the drivers, such as <code>libcuda.so</code>, remains closed. Fig. 2 redraws the stack with the file behind each layer and whether its source is public.</p>
<div data-slot="stack" class="wide"></div>
<div data-slot="shelf" class="wide"></div>
<div data-slot="read"></div>`);
      guard(s.priv, 'Privilege levels', () => privFig(s.priv, ctx));
      guard(s.stack, 'Open and closed', () => openClosedFig(s.stack, ctx));
      guard(s.shelf, 'Module commands', () => koShelfFig(s.shelf, ctx));
      ctx.reading(s.read, [
        { href: 'https://wiki.archlinux.org/title/Kernel_module', label: 'ArchWiki: Kernel module', note: 'what kernel modules are and how to load, list and configure them' },
        { href: 'https://github.com/NVIDIA/open-gpu-kernel-modules', label: 'NVIDIA/open-gpu-kernel-modules on GitHub', note: 'the source of nvidia.ko and its companions' },
      ]);
    },
  });

  /* ═════════════════════════════ cuda-driver-api ═════════════════════════════ */

  GG.css(`
.hsa-two { display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr); gap: 12px; align-items: start; }
.hsa-two.one { grid-template-columns: minmax(0, 1fr); }
.hsa-two .code pre { font-size: 12px; }
.hsa-two .code .ln.hl-host { background: var(--host-a); box-shadow: inset 3px 0 0 var(--host); }
.hsa-two .code .ln.hsa-only, .hsa-only-sw { background: repeating-linear-gradient(135deg, rgba(236, 238, 246, 0.1) 0 5px, transparent 5px 10px); box-shadow: inset 3px 0 0 var(--ink-2); color: var(--ink); }
.hsa-two .hsa-colh { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; margin-bottom: 6px; }
.hsa-two .hsa-colh b { font: 600 11px/1.2 var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink); }
.hsa-two .hsa-colh span { font: 500 11.5px/1.2 var(--font-mono); color: var(--ink-3); }
.hsa-two .hsa-task { display: inline-block; margin-bottom: 6px; font: 600 10.5px/1.2 var(--font-mono); letter-spacing: 0.06em; color: var(--ink); background: rgba(255, 138, 91, 0.12); border: 1px solid rgba(255, 138, 91, 0.45); border-radius: 5px; padding: 4px 7px 3px; }
.hsa-two .hsa-imp { margin-top: 8px; font-size: 12.5px; line-height: 1.45; color: var(--ink-3); border: 1px dashed var(--line-2); border-radius: 9px; padding: 7px 9px; transition: border-color 0.2s, color 0.2s; }
.hsa-two .hsa-imp.on { border-color: var(--host); color: var(--ink-2); }
.hsa-mx { display: grid; gap: 4px; }
.hsa-mx .h { font: 500 10.5px/1.25 var(--font-mono); color: var(--ink-3); display: flex; flex-direction: column; justify-content: flex-end; align-items: center; text-align: center; padding: 2px; }
.hsa-mx .h b { color: var(--ink); font-weight: 600; font-size: 12px; }
.hsa-mx .h.r { align-items: flex-end; text-align: right; justify-content: center; padding-right: 6px; }
.hsa-mx .corner { font: 500 10px/1.3 var(--font-mono); color: var(--ink-3); display: flex; align-items: flex-end; padding: 2px 6px 4px 0; text-align: right; justify-content: flex-end; }
.hsa-mx button { font: 600 11px/1.15 var(--font-mono); border-radius: 7px; border: 1px solid transparent; padding: 9px 2px; cursor: pointer; min-width: 0; transition: box-shadow 0.15s, transform 0.15s; }
.hsa-mx button.ok { background: rgba(69, 212, 155, 0.16); color: var(--core); border-color: rgba(69, 212, 155, 0.35); }
.hsa-mx button.lim { background: rgba(255, 198, 92, 0.12); color: var(--control); border-color: rgba(255, 198, 92, 0.35); }
.hsa-mx button.no { background: rgba(255, 91, 110, 0.1); color: var(--danger); border-color: rgba(255, 91, 110, 0.3); }
.hsa-mx button[aria-pressed="true"] { box-shadow: 0 0 0 2px var(--ink); }
.hsa-axis { font: 500 10.5px/1.3 var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-3); }
.hsa-load { margin-top: 12px; font: 500 12.5px/1.6 var(--font-mono); color: var(--ink-2); background: #07080c; border: 1px solid var(--line); border-radius: 10px; padding: 9px 12px; overflow-wrap: anywhere; }
.hsa-load .k { color: var(--ink-3); }
.hsa-load .ok { color: var(--core); } .hsa-load .lim { color: var(--control); } .hsa-load .no { color: var(--danger); }
.hsa-alt { display: grid; gap: 8px; max-width: 640px; margin: 0 auto; }
.hsa-alt .lv { border-radius: 11px; border: 1px solid var(--line-2); padding: 9px 12px 10px; background: var(--surface-2); text-align: center; transition: border-color 0.25s, background 0.25s; }
.hsa-alt .lv b { display: block; font: 600 13.5px/1.3 var(--font-mono); color: var(--ink); }
.hsa-alt .lv span { display: block; font-size: 12.5px; line-height: 1.4; color: var(--ink-3); margin-top: 2px; }
.hsa-alt .lv.swap { border-width: 1.5px; }
.hsa-alt .lv.swap.closed { border-color: var(--ink-3); background: repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0 6px, transparent 6px 12px), var(--surface-2); }
.hsa-alt .lv.swap.open { border-color: var(--core); background: rgba(69, 212, 155, 0.08); }
.hsa-alt .lv.kern { border-color: rgba(255, 198, 92, 0.4); }
.hsa-alt .lv.gpu { border-color: rgba(69, 212, 155, 0.35); }
.hsa-alt .via { text-align: center; font: 500 11px/1.2 var(--font-mono); color: var(--ink-3); }
`);

  const RT_HOST = `// Runtime API: setup happens for you
float *d_x, *d_partial;
cudaMalloc(&d_x, bytes);
cudaMalloc(&d_partial, pbytes);
cudaMemcpy(d_x, x, bytes, cudaMemcpyHostToDevice);

block_sum<<<blocks, threads>>>(d_x, d_partial, n);

cudaMemcpy(partial, d_partial, pbytes,
           cudaMemcpyDeviceToHost);
cudaFree(d_x);
cudaFree(d_partial);`;
  const DRV_HOST = `// Driver API: every step is spelled out
CUdevice dev;
CUcontext ctx;
CUmodule mod;
CUfunction fn;
CUdeviceptr d_x, d_partial;

cuInit(0);
cuDeviceGet(&dev, 0);
cuDevicePrimaryCtxRetain(&ctx, dev);
cuCtxSetCurrent(ctx);
cuModuleLoad(&mod, "block_sum.cubin");
cuModuleGetFunction(&fn, mod, "block_sum");

cuMemAlloc(&d_x, bytes);
cuMemAlloc(&d_partial, pbytes);
cuMemcpyHtoD(d_x, x, bytes);

void *args[] = { &d_x, &d_partial, &n };
cuLaunchKernel(fn, blocks, 1, 1, threads, 1, 1, 0, NULL, args, NULL);

cuMemcpyDtoH(partial, d_partial, pbytes);
cuMemFree(d_x);
cuMemFree(d_partial);
cuModuleUnload(mod);
cuDevicePrimaryCtxRelease(dev);`;

  function sideBySideFig(host, ctx, opts) {
    opts = opts || {};
    const f = ctx.figure(host, {
      title: opts.title || 'The same host code, two APIs',
      hint: 'step through the tasks',
      wide: true,
      caption: opts.caption || 'The host half of the <code>block_sum</code> program from the CUDA C++ entry, written against each API (declarations of <code>x</code>, <code>partial</code>, <code>n</code>, <code>bytes</code> and <code>pbytes</code> omitted; error checks left out). The Driver API version loads the kernel from a separately compiled <code>block_sum.cubin</code>, so the kernel is declared <code>extern "C"</code> to keep its name unmangled.',
    });
    const box = el('div', { class: 'hsa-two' });
    f.stage.append(box);
    onWidth(box, (w) => box.classList.toggle('one', w < 840));
    const L = el('div', { class: 'hsa-w' }), R = el('div', { class: 'hsa-w' });
    box.append(L, R);
    L.innerHTML = '<div class="hsa-colh"><b>CUDA Runtime API</b><span>cuda… · libcudart</span></div><div class="hsa-task" data-t></div>';
    R.innerHTML = '<div class="hsa-colh"><b>CUDA Driver API</b><span>cu… · libcuda.so</span></div><div class="hsa-task" data-t></div>';
    const tagL = L.querySelector('[data-t]'), tagR = R.querySelector('[data-t]');
    const rc = ctx.code(L, { lang: 'cuda', code: RT_HOST, caption: 'host code' });
    const imp = el('div', { class: 'hsa-imp' });
    L.append(imp);
    const dc = ctx.code(R, { lang: 'cuda', code: DRV_HOST, caption: 'host code' });
    /* dr: the Driver lines that do the same job as the Runtime lines (lit in the same colour);
       only: Driver lines with no Runtime counterpart (hatched) */
    const TASKS = [
      { label: 'declare', rt: [2], dr: [6], only: [2, 3, 4, 5], why: 'Both declare device pointers. The Driver API also needs handles for the device, the context, the loaded module and the kernel function.', imp: 'The Runtime needs no handles: the device, context, module and function are managed for you.' },
      { label: 'start up', rt: [], dr: [], only: [8, 9, 10, 11], why: 'The Driver API must be initialized (<code>cuInit</code>), a device chosen and a <em>context</em> made current: the per-process GPU state that allocations and launches belong to. The Runtime API does all of this by itself on its first call, using the device’s <em>primary context</em>, the same one the Driver code retains here.', imp: 'Implicit: the first Runtime call initializes CUDA, picks device 0 and makes its primary context current.' },
      { label: 'load the kernel', rt: [], dr: [], only: [12, 13], why: 'With the Driver API you load compiled GPU code yourself and look the kernel up by name. With the Runtime API the kernel was compiled into the executable by nvcc and is found automatically.', imp: 'Implicit: nvcc embedded block_sum’s GPU code in the executable, and the Runtime loads it.' },
      { label: 'allocate', rt: [3, 4], dr: [15, 16], only: [], why: '<code>cudaMalloc</code> and <code>cuMemAlloc</code>: the malloc of each API. Same job, same arguments.', imp: '' },
      { label: 'copy in', rt: [5], dr: [17], only: [], why: 'One copy function with a direction argument, or one function per direction (<code>HtoD</code>: host to device).', imp: '' },
      { label: 'launch', rt: [7], dr: [20], only: [19], why: 'The <code>&lt;&lt;&lt;&gt;&gt;&gt;</code> launch is CUDA C++ syntax that nvcc turns into Runtime calls. Through the Driver API you pass the grid and block sizes as six numbers, the shared-memory size, the stream, and an array of pointers to the arguments.', imp: 'Implicit: for a <<<>>> launch, the code nvcc generates packs the array of argument pointers for you.' },
      { label: 'copy out', rt: [9, 10], dr: [22], only: [], why: 'Copy the partial sums back. Both copies wait for the kernel to finish first.', imp: '' },
      { label: 'clean up', rt: [11, 12], dr: [23, 24], only: [25, 26], why: 'Free the memory. The Driver code also unloads its module and releases the context it retained. The Runtime tidies up its own state when the program exits.', imp: 'Implicit: the Runtime releases its context and modules at exit.' },
    ];
    const stR = GG.ui.stat(f.readouts, { label: 'runtime lines so far', value: '', tone: 'host' });
    const stD = GG.ui.stat(f.readouts, { label: 'driver lines so far', value: '' });
    const leg = el('div', { class: 'hsa-legend' });
    leg.innerHTML = '<span><i style="width:22px;background:var(--host-a);box-shadow:inset 3px 0 0 var(--host)"></i>same job in both APIs</span><span><i class="hsa-only-sw" style="width:22px"></i>Driver API only: done for you by the Runtime</span>';
    f.stage.append(leg);
    function show(k) {
      const t = TASKS[k];
      rc.clear(); dc.clear();
      [rc, dc].forEach((c) => $$(c.el, '.ln.hl-host, .ln.hsa-only').forEach((x) => x.classList.remove('hl-host', 'hsa-only')));
      rc.highlight(t.rt.length ? t.rt : [1], t.rt.length ? 'host' : undefined);
      if (!t.rt.length) rc.dim(Array.from({ length: 11 }, (_, j) => j + 2));
      dc.highlight(t.dr, 'host');
      t.only.forEach((n) => { const ln = dc.line(n); if (ln) ln.classList.add('hsa-only'); });
      imp.textContent = t.imp || 'Nothing hidden in this step: the highlighted lines on both sides do the same job.';
      tagL.textContent = tagR.textContent = `task ${k + 1} of ${TASKS.length}: ${t.label}`;
      imp.classList.toggle('on', !!t.imp);
      let nr = 0, nd = 0;
      for (let j = 0; j <= k; j++) { nr += TASKS[j].rt.length; nd += TASKS[j].dr.length + TASKS[j].only.length; }
      stR.set(String(nr));
      stD.set(String(nd));
      f.setWhy(`<b>${esc(t.label[0].toUpperCase() + t.label.slice(1))}.</b> ${t.why}`);
    }
    GG.ui.stepper(f.controls, { label: 'Task', steps: TASKS, autoplay: 2600, onStep: show });
  }

  const VERS = [
    { v: '11.8', br: 'R520' }, { v: '12.0', br: 'R525' }, { v: '12.4', br: 'R550' }, { v: '12.8', br: 'R570' }, { v: '13.0', br: 'R580' },
  ];
  function compatFig(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Old programs, new drivers',
      hint: 'click a cell',
      wide: true,
      caption: 'Rows: the CUDA version a program was built against. Columns: the CUDA version of the Driver API that the installed driver provides (the “CUDA Version” nvidia-smi shows), with the driver branch that first shipped it. Green is the glossary’s binary-compatibility guarantee. Amber and red are added context from NVIDIA’s compatibility documentation. All of this is about the host side, the Driver API library; separately, the program’s GPU code must suit the GPU it runs on.',
    });
    const box = el('div', { class: 'hsa-w' });
    f.stage.append(box);
    const mx = el('div', { class: 'hsa-mx' });
    mx.style.gridTemplateColumns = 'minmax(64px, auto) repeat(5, minmax(0, 1fr))';
    box.append(el('div', { class: 'hsa-axis', style: 'text-align:right;margin-bottom:6px', text: 'installed driver provides →' }), mx);
    mx.append(el('div', { class: 'corner', html: 'built<br>against ↓' }));
    VERS.forEach((c) => mx.append(el('div', { class: 'h', html: `<b>${c.v}</b>${c.br}` })));
    const cells = {};
    const cmp = (a, b) => { const [a1, a2] = a.split('.').map(Number), [b1, b2] = b.split('.').map(Number); return a1 !== b1 ? a1 - b1 : a2 - b2; };
    const kind = (built, inst) => (cmp(inst, built) >= 0 ? 'ok' : built.split('.')[0] === inst.split('.')[0] ? 'lim' : 'no');
    const MARK = { ok: 'runs', lim: 'limited', no: 'fails' };
    VERS.forEach((r) => {
      mx.append(el('div', { class: 'h r', html: `<b>${r.v}</b>` }));
      VERS.forEach((c) => {
        const k = kind(r.v, c.v);
        const b = el('button', { type: 'button', class: k, 'aria-pressed': 'false', 'aria-label': `built against ${r.v}, driver provides ${c.v}: ${MARK[k]}`, text: MARK[k] });
        b.addEventListener('click', () => pick(r.v, c.v));
        cells[r.v + '|' + c.v] = b;
        mx.append(b);
      });
    });
    const SHORT = { ok: '✓', lim: '~', no: '✕' };
    const leg = el('div', { class: 'hsa-legend', html: '<span>✓ runs</span><span>~ limited</span><span>✕ fails</span>' });
    box.append(leg);
    onWidth(box, (w) => {
      const sh = w < 460;
      leg.style.display = sh ? '' : 'none';
      Object.keys(cells).forEach((key) => { const k = cells[key].className; cells[key].textContent = sh ? SHORT[k] : MARK[k]; });
    });
    const load = el('div', { class: 'hsa-load', 'aria-live': 'polite' });
    box.append(load);
    const stB = GG.ui.stat(f.readouts, { label: 'built against', value: '' });
    const stI = GG.ui.stat(f.readouts, { label: 'driver provides', value: '' });
    const stR = GG.ui.stat(f.readouts, { label: 'result', value: '' });
    function pick(b, i) {
      Object.keys(cells).forEach((key) => cells[key].setAttribute('aria-pressed', String(key === b + '|' + i)));
      const k = kind(b, i);
      const br = VERS.find((x) => x.v === i).br;
      stB.set('CUDA ' + b);
      stI.set('CUDA ' + i, 'host');
      stR.set(MARK[k], k === 'ok' ? 'core' : k === 'lim' ? 'control' : 'danger');
      const verdict = {
        ok: '<span class="ok">same behaviour: binary compatible</span>',
        lim: '<span class="lim">may run, with a limited feature set</span>',
        no: '<span class="no">not supported: the driver is too old</span>',
      }[k];
      load.innerHTML = `<span class="k">$ ./app</span>   <span class="k"># built against CUDA ${b}</span>\nloader → libcuda.so.1 from the ${br} driver (Driver API ${i}) → ${verdict}`.replace(/\n/g, '<br>');
      let why;
      if (k === 'ok' && cmp(i, b) === 0) why = `Built against CUDA ${b}, run on a driver that provides exactly CUDA ${b}. The simplest case.`;
      else if (k === 'ok') why = `<b>Binary compatibility.</b> A program built against the CUDA ${b} Driver API runs on a system whose driver provides CUDA ${i}. The operating system’s loader simply loads the newer <code>libcuda.so</code>, and the program functions the same. This is why updating the driver does not mean rebuilding every program. It is the host-side guarantee: the program’s GPU code must also suit the GPU, either as ${T('streaming-assembler', 'SASS')} built for that GPU or as ${T('parallel-thread-execution', 'PTX')} the driver can compile just in time.`;
      else if (k === 'lim') why = `<b>Newer program, older driver, same major version.</b> The glossary’s guarantee only runs the other way. NVIDIA additionally offers <em>minor version compatibility</em>: a program built with CUDA ${b} can often run on a driver from the CUDA ${i.split('.')[0]}.x family, but only if it avoids features the older driver lacks (for example, its PTX cannot be JIT-compiled by the older driver).`;
      else why = `<b>Newer major version, older driver.</b> A program built against CUDA ${b} needs a driver that provides at least CUDA ${b.split('.')[0]}.0. On a CUDA ${i} driver it fails as soon as it initializes CUDA, with an error saying the driver is too old, unless the machine has NVIDIA’s forward-compatibility package, available for datacenter GPUs.`;
      f.setWhy(why);
    }
    pick('12.4', '13.0');
  }

  function altFig(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Swapping out the closed layer',
      hint: 'pick an implementation',
      wide: true,
      caption: 'What LibreCuda and tinygrad replace. Both stay on top of the NVIDIA kernel module and talk to it the way libcuda.so does, through system calls on its device files. The descriptions are added context from the projects’ own documentation and source.',
    });
    const O = {
      libcuda: { label: 'libcuda.so', cls: 'closed', name: 'libcuda.so · NVIDIA', sub: 'the CUDA Driver API as NVIDIA ships it: closed source', src: 'closed', lang: 'not public', top: 'any CUDA program or library',
        why: `The standard setup: programs call the Driver API, implemented by NVIDIA’s closed-source <code>libcuda.so</code>. Its behaviour is documented (${X('https://docs.nvidia.com/cuda/cuda-driver-api/index.html', 'docs')}), its code is not.` },
      libre: { label: 'LibreCuda', cls: 'open', name: 'LibreCuda', sub: 'an open re-implementation of the Driver API, in C', src: 'open', lang: 'C', top: 'a program that loads and launches compiled kernels',
        why: `${X('https://github.com/mikex86/LibreCuda', 'LibreCuda')} aims to replace the CUDA Driver API so that CUDA code can be launched without NVIDIA’s user-space libraries. It talks to the kernel module directly, using the control interface of NVIDIA’s open kernel modules.` },
      tiny: { label: 'tinygrad NV', cls: 'open', name: 'tinygrad · ops_nv.py', sub: 'a Python backend that drives the GPU without libcuda.so', src: 'open', lang: 'Python', top: 'the tinygrad deep learning framework',
        why: `${X('https://github.com/tinygrad', 'tinygrad')}, a small deep learning framework, has an “NV” backend that issues the system calls to the kernel module and builds the GPU’s command queues itself, in Python. See ${X('https://github.com/tinygrad/tinygrad/blob/77f7ddf62a78218bee7b4f7b9ff925a0e581fcad/tinygrad/runtime/ops_nv.py', 'ops_nv.py')}, the source file the glossary points to.` },
    };
    const box = el('div', { class: 'hsa-alt' });
    f.stage.append(box);
    box.innerHTML = `<div class="lv"><b data-top></b><span>calls into the layer below</span></div><div class="via">↓ function calls</div>
      <div class="lv swap" data-swap><b data-n></b><span data-s></span></div><div class="via">↓ ioctl() on /dev/nvidia*</div>
      <div class="lv kern"><b>nvidia.ko</b><span>the kernel module: still required</span></div><div class="via">↓ PCIe</div>
      <div class="lv gpu"><b>GPU</b><span>runs the kernels</span></div>`;
    const sw = box.querySelector('[data-swap]');
    const stS = GG.ui.stat(f.readouts, { label: 'user-space layer', value: '' });
    const stL = GG.ui.stat(f.readouts, { label: 'language', value: '' });
    GG.ui.stat(f.readouts, { label: 'kernel module', value: 'unchanged', tone: 'control' });
    function set(k) {
      const o = O[k];
      sw.className = 'lv swap ' + o.cls;
      sw.querySelector('[data-n]').textContent = o.name;
      sw.querySelector('[data-s]').textContent = o.sub;
      box.querySelector('[data-top]').textContent = o.top;
      stS.set(o.src === 'open' ? 'open source' : 'closed source', o.src === 'open' ? 'core' : null);
      stL.set(o.lang);
      f.setWhy(o.why);
    }
    GG.ui.seg(f.controls, { label: 'driver layer in user space', value: 'libcuda', options: Object.keys(O).map((k) => ({ value: k, label: O[k].label })), onChange: set });
    set('libcuda');
  }

  GG.entry('cuda-driver-api', {
    render(body, ctx) {
      body.classList.add('hsa-body');
      const s = ctx.html(body, `
<p><em>Userspace</em> means it runs as part of ordinary programs, in user mode, unlike the kernel module ${T('nvidia-ko', 'nvidia.ko')} beneath it. The ${X('https://docs.nvidia.com/cuda/cuda-driver-api/index.html', 'CUDA Driver API')} is a C library: a set of functions, all named <code>cu…</code>, that a program calls to use the GPU.</p>
<div data-slot="stack" class="wide"></div>
<h3>Familiar from the C standard library</h3>
<p>It provides utilities familiar to users of the C standard library: a function for allocating ${T('global-memory', 'memory')} on GPU devices, for example, the GPU counterpart of <code>malloc</code>. Its other basics follow the same pattern.</p>
<div data-slot="table"></div>
${GG.noteHTML('check', '<p>The glossary names this allocator “a <code>cuMalloc</code> function”. The Driver API has no <code>cuMalloc</code>: its allocator is <code>cuMemAlloc</code>, which takes a pointer to a <code>CUdeviceptr</code> and a size in bytes. (The Runtime API’s equivalent is <code>cudaMalloc</code>.)</p>')}
<h3>Few programs call it directly</h3>
<p>Very few CUDA programs are written to directly use the CUDA Driver API. They instead use the ${T('cuda-runtime-api', 'CUDA Runtime API')}, which wraps it. ${X('https://docs.nvidia.com/cuda/cuda-driver-api/driver-vs-runtime-api.html#driver-vs-runtime-api', 'This section')} of the CUDA Driver API docs compares the two. Fig. 2 shows why the Runtime wins on convenience: the Driver API makes you spell out start-up, contexts and module loading that the Runtime does for you.</p>
<div data-slot="side" class="wide"></div>
<p>What you get in exchange is control: when GPU code is loaded and from where (a file, or a buffer produced at run time by ${T('nvrtc', 'NVRTC')}), which context is current, and exactly how each kernel is launched. Libraries and frameworks use that control; most applications never need it.</p>
<h3>Linked dynamically, as libcuda.so</h3>
<p>The CUDA Driver API is generally not linked statically, that is, copied into the program’s executable when it is built. Instead it is linked dynamically: the executable only records that it needs the library, and the operating system loads it when the program starts. The file is typically named ${T('libcuda', 'libcuda.so')} on Linux systems.</p>
<p>There is a good reason. <code>libcuda.so</code> is part of the driver: it is installed with it and has to match the kernel module it talks to. A copy frozen into a program would go stale the moment the driver was updated.</p>
<h3>Binary compatibility</h3>
<p>The CUDA Driver API is binary-compatible: an application compiled against old versions of the CUDA Driver API can run on systems with newer versions of the CUDA Driver API. That is, the operating system’s binary loader may load a newer version of the CUDA Driver API and the program will function the same.</p>
<div data-slot="compat" class="wide"></div>
<p>For details on distributing ${T('cuda-c', 'CUDA C/C++')} applications, see the ${X('https://docs.nvidia.com/cuda/cuda-c-best-practices-guide', 'CUDA C/C++ Best Practices Guide')} from NVIDIA.</p>
<h3>Closed source, and open alternatives</h3>
<p>The CUDA Driver API is closed source. You can find its documentation ${X('https://docs.nvidia.com/cuda/cuda-driver-api/index.html', 'here')}.</p>
<p>Though they are not commonly used, there are projects that attempt to provide or use open source alternatives to the CUDA Driver API, like ${X('https://github.com/mikex86/LibreCuda', 'LibreCuda')} and ${X('https://github.com/tinygrad', 'tinygrad')}. See ${X('https://github.com/tinygrad/tinygrad/blob/77f7ddf62a78218bee7b4f7b9ff925a0e581fcad/tinygrad/runtime/ops_nv.py', 'their source code')} for details.</p>
<div data-slot="alt" class="wide"></div>
<div data-slot="read"></div>`);
      guard(s.stack, 'Toolkit stack', () => {
        toolkitFig(s.stack, ctx, {
          title: 'The Driver API in the CUDA Toolkit stack',
          hint: 'hover a layer · send the call',
          wide: true,
          caption: `As the glossary’s caption puts it, the CUDA Driver API sits between applications or other toolkit components and the GPU. Redrawn from its figure (adapted from ${PROF_CUDA}). The animated call is a program that uses the Driver API directly.`,
        }, { files: true, highlight: 'driver-api', animateCall: { path: 'app-driver-gpu', tags: { 'driver-api': 'cuMemAlloc' },
          say: { apps: 'A program calls <code>cuMemAlloc</code>, the Driver API’s malloc, directly.', 'driver-api': 'The <b>Driver API</b> (<code>libcuda.so</code>) is the user-space part of the driver. It prepares the request and passes it into the kernel.', driver: 'The kernel module, <code>nvidia.ko</code>, reserves the memory on the GPU.', gpu: 'The allocation exists. Back in the program, <code>cuMemAlloc</code> returns its device address.' } } });
      });
      s.table.innerHTML = GG.tableHTML(`<thead><tr><th>job</th><th>C standard library</th><th>CUDA Driver API</th><th>CUDA Runtime API</th></tr></thead><tbody>
        <tr><td>allocate memory</td><td><code>malloc</code></td><td><code>cuMemAlloc</code></td><td><code>cudaMalloc</code></td></tr>
        <tr><td>free it</td><td><code>free</code></td><td><code>cuMemFree</code></td><td><code>cudaFree</code></td></tr>
        <tr><td>copy bytes</td><td><code>memcpy</code></td><td><code>cuMemcpyHtoD</code>, <code>cuMemcpyDtoH</code>, <code>cuMemcpy</code></td><td><code>cudaMemcpy</code></td></tr>
        <tr><td>fill bytes</td><td><code>memset</code></td><td><code>cuMemsetD8</code>, <code>cuMemsetD32</code></td><td><code>cudaMemset</code></td></tr>
        <tr><td>report an error</td><td><code>strerror</code></td><td><code>cuGetErrorString</code></td><td><code>cudaGetErrorString</code></td></tr></tbody>`);
      guard(s.side, 'Side by side', () => sideBySideFig(s.side, ctx));
      guard(s.compat, 'Compatibility matrix', () => compatFig(s.compat, ctx));
      guard(s.alt, 'Alternatives', () => altFig(s.alt, ctx));
      ctx.reading(s.read, [
        { href: 'https://docs.nvidia.com/cuda/cuda-driver-api/index.html', label: 'CUDA Driver API reference', note: 'NVIDIA’s documentation for every cu… function' },
        { href: 'https://docs.nvidia.com/cuda/cuda-driver-api/driver-vs-runtime-api.html#driver-vs-runtime-api', label: 'Difference between the driver and runtime APIs', note: 'the docs section the glossary points to' },
        { href: 'https://docs.nvidia.com/cuda/cuda-c-best-practices-guide', label: 'CUDA C++ Best Practices Guide', note: 'including how to distribute CUDA applications and which compatibility rules apply' },
        { href: 'https://github.com/mikex86/LibreCuda', label: 'LibreCuda on GitHub', note: 'an open re-implementation of the Driver API' },
        { href: 'https://github.com/tinygrad', label: 'tinygrad on GitHub', note: 'and its NV backend, ' + X('https://github.com/tinygrad/tinygrad/blob/77f7ddf62a78218bee7b4f7b9ff925a0e581fcad/tinygrad/runtime/ops_nv.py', 'ops_nv.py') },
      ]);
    },
  });

  /* ═════════════════════════════ libcuda ═════════════════════════════ */

  GG.css(`
.hsa-chain { display: flex; align-items: stretch; gap: 0; }
.hsa-chain.col { flex-direction: column; }
.hsa-cn { flex: 1 1 0; min-width: 0; border: 1px solid var(--line-2); border-radius: 10px; background: var(--surface-2); padding: 8px 10px 9px; transition: border-color 0.25s, background 0.25s, opacity 0.25s; }
.hsa-cn .hsa-k { margin-bottom: 3px; }
.hsa-cn b { display: block; font: 600 12.5px/1.35 var(--font-mono); color: var(--ink); overflow-wrap: anywhere; }
.hsa-cn span.d { display: block; font-size: 12px; line-height: 1.4; color: var(--ink-3); margin-top: 3px; }
.hsa-cn.on { border-color: var(--accent); background: rgba(24, 26, 38, 0.95); }
.hsa-cn.ok { border-color: var(--core); background: rgba(69, 212, 155, 0.08); }
.hsa-cn.bad { border-color: var(--danger); background: rgba(255, 91, 110, 0.08); }
.hsa-cn.gone { opacity: 0.3; border-style: dashed; }
.hsa-cn.host { border-color: rgba(184, 164, 255, 0.5); }
.hsa-ca { flex: none; width: 26px; display: flex; align-items: center; justify-content: center; font: 13px var(--font-mono); color: var(--ink-3); }
.hsa-chain.col .hsa-ca { width: auto; height: 20px; }
.hsa-ca.bad { color: var(--danger); }
.hsa-term .note-c { color: var(--ink-3); }
`);

  function loaderFig(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Finding libcuda.so',
      hint: 'pick a program · remove the driver',
      wide: true,
      caption: 'How a CUDA program on Linux ends up with the Driver API loaded, on a machine with driver 580.95.05 installed. The terminal shows the commands, with output abridged (load addresses replaced by <code>0x…</code>). <code>vec_driver</code> is a hypothetical program that calls the Driver API directly; <code>block_sum</code> is the Runtime API program from the CUDA C++ entry.',
    });
    const chain = el('div', { class: 'hsa-chain' });
    f.stage.append(chain);
    onWidth(chain, (w) => chain.classList.toggle('col', w < 700));
    const term = el('pre', { class: 'hsa-term' });
    f.stage.append(el('div', { style: 'margin-top:12px' }, term));
    const st = { prog: 'driver', installed: true };
    const stWhen = GG.ui.stat(f.readouts, { label: 'libcuda.so loaded', value: '' });
    const stBy = GG.ui.stat(f.readouts, { label: 'loaded by', value: '' });
    const stRes = GG.ui.stat(f.readouts, { label: 'result', value: '' });
    function node(cls, k, b, d) { return `<div class="hsa-cn ${cls}"><div class="hsa-k">${k}</div><b>${b}</b><span class="d">${d}</span></div>`; }
    function arrow(bad) { return `<div class="hsa-ca${bad ? ' bad' : ''}" aria-hidden="true">${chain.classList.contains('col') ? '↓' : '→'}</div>`; }
    function draw() {
      const drv = st.prog === 'driver', ok = st.installed;
      const progName = drv ? './vec_driver' : './block_sum';
      const n1 = node('host', 'program', progName, drv ? 'needs <code>libcuda.so.1</code>, recorded when it was linked with <code>-lcuda</code>' : 'libcudart linked in statically; no mention of libcuda');
      const n2 = node(ok ? 'on' : 'bad', drv ? 'when it starts' : 'at its first CUDA call', drv ? 'dynamic loader (ld.so)' : 'libcudart, inside the program', drv ? 'reads the list of needed libraries and searches the system’s library directories' : 'asks the operating system for <code>libcuda.so.1</code> itself, the same search');
      const n3 = node(ok ? 'ok' : 'bad', 'found?', ok ? '/lib/x86_64-linux-gnu/libcuda.so.1' : 'libcuda.so.1: not found', ok ? 'a symbolic link, installed by the driver' : 'no driver installed, so no such file');
      const n4 = node(ok ? 'ok' : 'gone', 'the real file', 'libcuda.so.580.95.05', 'the Driver API library of this exact driver version');
      const n5 = node(ok ? 'ok' : 'gone', 'talks to', 'nvidia.ko', 'through system calls on /dev/nvidia*');
      chain.innerHTML = n1 + arrow() + n2 + arrow() + n3 + arrow(!ok) + n4 + arrow(!ok) + n5;
      let t;
      const P = (c) => `<span class="p">$</span> <span class="c">${esc(c)}</span>\n`;
      const C = (c) => `<span class="note-c">${esc(c)}</span>\n`;
      if (drv) {
        t = P('nvcc -o vec_driver vec_driver.cu -lcuda') + P('ldd ./vec_driver') +
          '\tlinux-vdso.so.1 (0x…)\n' +
          (ok ? '\t<span class="ok">libcuda.so.1 =&gt; /lib/x86_64-linux-gnu/libcuda.so.1</span> (0x…)\n' : '\t<span class="bad">libcuda.so.1 =&gt; not found</span>\n') +
          '\tlibstdc++.so.6 =&gt; /lib/x86_64-linux-gnu/libstdc++.so.6 (0x…)\n\tlibc.so.6 =&gt; /lib/x86_64-linux-gnu/libc.so.6 (0x…)\n\t…\n' +
          (ok ? P('ls -l /lib/x86_64-linux-gnu/libcuda.so.1') + 'lrwxrwxrwx … /lib/x86_64-linux-gnu/libcuda.so.1 -&gt; libcuda.so.580.95.05\n'
            : P('./vec_driver') + '<span class="bad">./vec_driver: error while loading shared libraries: libcuda.so.1: cannot open shared object file: No such file or directory</span>\n');
      } else {
        t = P('nvcc -o block_sum block_sum.cu') + P('ldd ./block_sum | grep cuda') + C('# (no output: no CUDA library is listed)') + P('./block_sum') +
          (ok ? 'sum = 1048576\n' : 'sum = 0\n' + C('# every CUDA call failed, and block_sum never checks for errors'));
      }
      term.innerHTML = t.replace(/\n$/, '');
      stWhen.set(drv ? 'at start-up' : 'at first CUDA call', 'host');
      stBy.set(drv ? 'ld.so' : 'libcudart');
      stRes.set(ok ? 'runs' : drv ? 'refuses to start' : 'calls fail', ok ? 'core' : 'danger');
      let why;
      if (ok && drv) why = '<b>Dynamic linking at start-up.</b> Linking with <code>-lcuda</code> recorded the library’s official name, <code>libcuda.so.1</code>, in the executable. When the program starts, the loader finds that name, a link to the file of the installed driver version, and maps it into the program before <code>main</code> runs.';
      else if (ok) why = '<b>Loaded on demand.</b> <code>ldd</code> lists no libcuda: nvcc linked the Runtime statically. The Runtime opens <code>libcuda.so.1</code> itself at its first CUDA call, through the same system search. Either way, every CUDA program ends up using the driver’s own <code>libcuda.so</code> at run time.';
      else if (drv) why = '<b>Missing libcuda.so.</b> The loader cannot find <code>libcuda.so.1</code> and refuses to start the program at all. When this file is missing, the drivers are generally improperly installed (or, in a container, not made available to it).';
      else why = '<b>Missing libcuda.so, silently.</b> The program starts, but the Runtime cannot load the Driver API, so every CUDA call returns an error. A program that checked would see the Runtime report the driver as missing or too old (<code>cudaErrorInsufficientDriver</code>). This one never checks, so it prints a wrong answer.';
      f.setWhy(why);
    }
    GG.ui.seg(f.controls, { label: 'program', value: 'driver', options: [{ value: 'driver', label: 'calls the Driver API' }, { value: 'runtime', label: 'uses the Runtime API' }], onChange: (v) => { st.prog = v; draw(); } });
    GG.ui.toggle(f.controls, { label: 'NVIDIA driver installed', value: true, onChange: (v) => { st.installed = v; draw(); } });
    onWidth(chain, () => draw());
    draw();
  }

  function libcudaUsersFig(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Four programs, one libcuda.so',
      hint: 'click a program',
      wide: true,
      caption: 'Four programs on the machine from the nvidia-smi sample (driver 580.95.05), each with the route by which it reaches the Driver API. <code>vec_driver</code> is the hypothetical Driver API program from Fig. 1; the PyTorch row assumes a CUDA 12 build. The terminal asks the kernel which files a running process has mapped; output abridged.',
    });
    const holder = el('div', { class: 'hsa-w' });
    f.stage.append(holder);
    const term = el('pre', { class: 'hsa-term' });
    f.stage.append(el('div', { style: 'margin-top:12px' }, term));
    const P = [
      { k: 'bs', t: 'block_sum', s: 'Runtime API program', via: 'libcudart_static', vs: 'inside the executable', maps: true,
        why: '<code>block_sum</code> carries the Runtime inside its executable (static <code>libcudart</code>). At its first CUDA call the Runtime opens <code>libcuda.so.1</code>, and the loader maps the driver’s file into the process.' },
      { k: 'vd', t: 'vec_driver', s: 'Driver API program', via: 'nothing in between', vs: 'linked with -lcuda', maps: true,
        why: '<code>vec_driver</code> was linked with <code>-lcuda</code>, so the dynamic loader maps <code>libcuda.so</code> when the program starts, before <code>main</code> runs. Its calls go straight to the Driver API.' },
      { k: 'pt', t: 'python (PyTorch)', s: 'framework', via: 'libcudart.so.12', vs: 'shared, shipped with PyTorch', maps: true,
        why: 'PyTorch’s shared <code>libcudart.so.12</code> opens <code>libcuda.so.1</code> at the first CUDA operation. Every CUDA library in the process, cuBLAS and cuDNN included, then works through that one mapped copy.' },
      { k: 'smi', t: 'nvidia-smi', s: 'monitoring tool', via: 'libnvidia-ml.so', vs: 'NVML instead', maps: false,
        why: `<code>nvidia-smi</code> never maps <code>libcuda.so</code>. It reaches the same kernel module through ${T('nvml', 'NVML')}, the driver’s other user-space library.` },
    ];
    const st = { sel: 'bs', layout: null };
    let N = null;
    function build(kind) {
      st.layout = kind;
      const wide = kind === 'wide';
      const W = wide ? 760 : 360;
      const px = 6, pw = wide ? 170 : 150, vx = wide ? 200 : 164, vw = wide ? 230 : 180, rh = wide ? 44 : 46, gap = wide ? 10 : 8, y0 = 26;
      const rowsEnd = y0 + P.length * (rh + gap) - gap;
      const so = wide ? [480, y0 + (3 * (rh + gap) - gap) / 2 - 32, 274, 64] : [34, rowsEnd + 22, 320, 52];   // narrow: a left gutter for nvidia-smi's route past it
      const ko = wide ? [480, rowsEnd - 44, 274, 44] : [6, so[1] + so[3] + 28, 348, 42];
      const H = wide ? rowsEnd + 6 : ko[1] + ko[3] + 6;
      holder.innerHTML = '';
      const svg = svgRoot(holder, W, H, 'Four programs; three of them reach the one libcuda.so file by different routes, nvidia-smi uses NVML instead; libcuda.so talks to nvidia.ko.', 'hsa-who');
      txt(svg, px, 14, 'PROGRAMS', { class: 'hd' });
      txt(svg, vx, 14, 'ROUTE', { class: 'hd' });
      if (wide) txt(svg, so[0], 14, 'MAPPED INTO EACH', { class: 'hd' });
      N = { c: {}, ln: {}, via: {} };
      const lineG = S('g', null, svg);
      S('path', { d: wide ? `M${so[0] + so[2] / 2} ${so[1] + so[3]}V${ko[1]}` : `M${so[0] + so[2] / 2} ${so[1] + so[3]}V${ko[1]}`, class: 'ln k' }, lineG);
      P.forEach((p, i) => {
        const y = y0 + i * (rh + gap), cy = y + rh / 2;
        let d;
        if (!p.maps) d = wide ? `M${vx + vw} ${cy}H${ko[0]}` : `M${vx + 12} ${y + rh}V${so[1] - 11}H20V${ko[1]}`;
        else if (wide) d = `M${vx + vw} ${cy}C${vx + vw + 30} ${cy} ${so[0] - 30} ${so[1] + so[3] / 2} ${so[0]} ${so[1] + so[3] / 2}`;
        else d = `M${vx + vw} ${cy}H${W - 4}V${so[1]}`;
        N.ln[p.k] = [S('path', { d: `M${px + pw} ${cy}H${vx}`, class: 'ln' }, lineG)];
        if (d) N.ln[p.k].push(S('path', { d, class: 'ln' }, lineG));
      });
      N.so = S('rect', { x: so[0], y: so[1], width: so[2], height: so[3], rx: 8, class: 'so' }, svg);
      txt(svg, so[0] + 12, so[1] + 22, 'libcuda.so.1', { class: 'st' });
      txt(svg, so[0] + 12, so[1] + (wide ? 40 : 39), '→ libcuda.so.580.95.05 · one file', { class: 'ss' });
      if (wide) txt(svg, so[0] + 12, so[1] + 55, 'installed by the driver, shared by all', { class: 'ss' });
      S('rect', { x: ko[0], y: ko[1], width: ko[2], height: ko[3], rx: 8, class: 'ko' }, svg);
      txt(svg, ko[0] + 12, ko[1] + 18, 'nvidia.ko', { class: 'kt' });
      txt(svg, ko[0] + 12, ko[1] + 34, 'kernel module (NVML reaches it too)', { class: 'ss' });
      P.forEach((p, i) => {
        const y = y0 + i * (rh + gap);
        const g = S('g', { class: 'c', tabindex: '0', role: 'button', 'aria-label': `${p.t}, ${p.s}` }, svg);
        S('rect', { x: px, y, width: pw, height: rh, rx: 8, class: 'cl' }, g);
        txt(g, px + 10, y + 18, p.t, { class: 'ct' });
        txt(g, px + 10, y + 33, p.s, { class: 'cs' });
        g.addEventListener('click', () => pick(p.k));
        g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(p.k); } });
        N.c[p.k] = g;
        const v = S('g', { class: 'via' + (p.maps ? '' : ' alt') }, svg);
        S('rect', { x: vx, y, width: vw, height: rh, rx: 8, class: 'vb' }, v);
        txt(v, vx + 10, y + 18, p.via, { class: 'vt' });
        txt(v, vx + 10, y + 33, p.vs, { class: 'cs' });
        N.via[p.k] = v;
      });
      pick(st.sel);
    }
    const stM = GG.ui.stat(f.readouts, { label: 'programs mapping libcuda.so', value: `${P.filter((p) => p.maps).length} of ${P.length}` });
    const stF = GG.ui.stat(f.readouts, { label: 'copies on disk', value: '1' });
    void stM; void stF;
    const stS = GG.ui.stat(f.readouts, { label: 'this one', value: '' });
    const PID = { bs: 4211, vd: 4215, pt: 4302, smi: 4390 };
    function pick(k) {
      st.sel = k;
      const p = P.find((x) => x.k === k);
      Object.keys(N.c).forEach((j) => { N.c[j].classList.toggle('on', j === k); N.via[j].classList.toggle('on', j === k); N.ln[j].forEach((l) => l.classList.toggle('on', j === k)); });
      N.so.classList.toggle('on', p.maps);
      stS.set(p.maps ? 'maps it' : 'does not', p.maps ? 'host' : null);
      term.innerHTML = `<span class="p">$</span> <span class="c">grep libcuda /proc/${PID[k]}/maps | head -1</span>   <span class="note-c"># ${esc(p.t)}, pid ${PID[k]} (example)</span>\n` +
        (p.maps ? '7f…-7f… r-xp 00000000 … /usr/lib/x86_64-linux-gnu/libcuda.so.580.95.05' : '<span class="note-c"># (no output: libcuda.so is not mapped)</span>');
      f.setWhy(p.why);
    }
    onWidth(holder, (w) => { const want = w < 600 ? 'narrow' : 'wide'; if (want !== st.layout) build(want); });
    build((f.stage.getBoundingClientRect().width || 700) < 600 ? 'narrow' : 'wide');
  }

  GG.entry('libcuda', {
    render(body, ctx) {
      body.classList.add('hsa-body');
      const s = ctx.html(body, `
<p>A <em>shared object</em> (the <code>.so</code>) is Linux’s name for a shared library: compiled code that is not copied into each program but kept in one file that many programs load while they run. Windows calls the same idea a DLL. The <code>lib</code> prefix is the usual convention for library files. <strong><code>libcuda.so</code></strong> is the shared object that holds the ${T('cuda-driver-api', 'CUDA Driver API')}.</p>
<h3>Dynamically linked</h3>
<p>It is dynamically linked by CUDA programs: found and loaded by the operating system when the program runs, never baked into the executable. That is what lets a newer driver’s copy stand in for an older one, the Driver API’s binary compatibility. If it is missing, the drivers are generally improperly installed. Fig. 1 shows both cases.</p>
<div data-slot="load" class="wide"></div>
${GG.noteHTML('beyond', '<p><b>The names around it.</b> The file programs ask for is <code>libcuda.so.1</code>, the library’s <em>soname</em>: a name that stays the same across driver updates. It is a symbolic link to the real file, named after the driver version (<code>libcuda.so.580.95.05</code> for the driver in the nvidia-smi sample). The CUDA Toolkit also ships a placeholder <code>libcuda.so</code> in its <code>stubs</code> directory, so that programs can be linked against the Driver API on a build machine with no driver installed. The stub cannot run anything; at run time the real file has to come from the driver.</p>')}
<h3>Every CUDA program ends up here</h3>
<p>In the CUDA Toolkit diagram, <code>libcuda.so</code> is the file behind the CUDA Driver API layer: the last stop in user space before the kernel module ${T('nvidia-ko', 'nvidia.ko')}. Programs reach it by different routes, through a Runtime API built into them, through a framework’s shared ${T('libcudart', 'libcudart.so')}, or directly, but they all end up with the same file from the driver mapped into their memory. Fig. 2 follows four programs.</p>
<div data-slot="stack" class="wide"></div>`);
      guard(s.load, 'Loader', () => loaderFig(s.load, ctx));
      guard(s.stack, 'Who maps libcuda', () => libcudaUsersFig(s.stack, ctx));
    },
  });

  /* ═════════════════════════════ nvml ═════════════════════════════ */

  GG.css(`
.hsa-dash { display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.2fr); gap: 14px; align-items: start; }
.hsa-dash.one { grid-template-columns: minmax(0, 1fr); }
.hsa-tiles { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.hsa-tile { border: 1px solid var(--line); border-radius: 11px; background: rgba(8, 9, 14, 0.62); padding: 9px 11px 10px; min-width: 0; transition: border-color 0.2s, box-shadow 0.2s; }
.hsa-tile.wide2 { grid-column: 1 / -1; }
.hsa-tile.lit { border-color: var(--accent); box-shadow: inset 0 0 0 1px var(--accent); }
.hsa-tile .v { font: 800 30px/1 var(--font-display); color: var(--ink); margin: 5px 0 4px; font-variant-numeric: tabular-nums; }
.hsa-tile .v small { font: 500 12px var(--font-mono); color: var(--ink-3); margin-left: 4px; }
.hsa-tile .fn { font: 500 10.5px/1.3 var(--font-mono); color: var(--ink-3); overflow-wrap: anywhere; }
.hsa-tile .bar { height: 6px; border-radius: 3px; background: var(--surface-3); margin-top: 6px; overflow: hidden; position: relative; }
.hsa-tile .bar i { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 3px; }
.hsa-tile.pw .bar i, .hsa-tile.tp .bar i { background: var(--ink-2); }
.hsa-tile.mm .v { color: var(--memory); } .hsa-tile.mm .bar i { background: var(--memory); }
.hsa-tile.st .v { font-size: 24px; }
.hsa-tile.st.on .v { color: var(--danger); }
.hsa-tile.st.off .v { color: var(--ink-2); }
.hsa-dash .code .ln[data-note]::after { content: none; }
.hsa-dash .code .ln[data-note]::before { content: "•" attr(data-n); color: var(--accent-2); }
.hsa-mirror { display: none; margin-top: 8px; align-items: baseline; gap: 10px; flex-wrap: wrap; border: 1px solid var(--accent); border-radius: 10px; padding: 7px 10px; background: rgba(8, 9, 14, 0.62); }
.hsa-mirror.on { display: flex; }
.hsa-mirror b { font: 800 22px/1 var(--font-display); color: var(--ink); }
.hsa-mirror b small { font: 500 11px var(--font-mono); color: var(--ink-3); margin-left: 4px; }
.hsa-ctlrow { flex: 1 0 100%; display: flex; }
.hsa-spark { margin-top: 8px; border: 1px solid var(--line); border-radius: 11px; background: rgba(8, 9, 14, 0.62); padding: 7px 9px 4px; }
.hsa-spark .hsa-legend { margin: 0 0 4px; }
.hsa-dash .code pre { font-size: 11.6px; }
.hsa-out { margin-top: 8px; }
.hsa-out .hsa-term { font-size: 12px; white-space: pre-wrap; overflow-wrap: anywhere; }
.hsa-term { font-variant-ligatures: none; }
`);

  const NVML_PY = `import pynvml

pynvml.nvmlInit()
h = pynvml.nvmlDeviceGetHandleByIndex(0)  # GPU 0

watts = pynvml.nvmlDeviceGetPowerUsage(h) / 1000  # mW -> W
celsius = pynvml.nvmlDeviceGetTemperature(h, pynvml.NVML_TEMPERATURE_GPU)
mem = pynvml.nvmlDeviceGetMemoryInfo(h)  # in bytes
limit = pynvml.nvmlDeviceGetEnforcedPowerLimit(h) / 1000  # mW -> W
reasons = pynvml.nvmlDeviceGetCurrentClocksEventReasons(h)
capped = bool(reasons & pynvml.nvmlClocksEventReasonSwPowerCap)

print(f"{watts:.0f} W of {limit:.0f} W, {celsius} C, "
      f"{mem.used / 2**20:.0f} MiB used, capped: {capped}")
pynvml.nvmlShutdown()`;

  function dashFig(host, ctx) {
    const f = ctx.figure(host, {
      title: 'What NVML exposes',
      hint: 'simulated · drag the sliders · hover the code',
      wide: true,
      caption: '<span class="hsa-tag sim">simulated</span> A made-up model of one B200, for illustration only: the curves and the response to load are not measurements. It opens at GPU 0’s values from the glossary’s nvidia-smi sample (136 W of a 1000 W limit, 27 °C, 0 of 183,359 MiB). The pynvml script is real code (hover or tap a marked line, with a dot by its number, to light the value it reads); its output line shows what it would print for the simulated state.',
    });
    const box = el('div', { class: 'hsa-dash' });
    f.stage.append(box);
    onWidth(box, (w) => box.classList.toggle('one', w < 860));
    const L = el('div', { class: 'hsa-w' }), R = el('div', { class: 'hsa-w' });
    box.append(L, R);
    const tiles = el('div', { class: 'hsa-tiles' });
    L.append(tiles);
    const mkTile = (cls, k, fn) => {
      const t = el('div', { class: 'hsa-tile ' + cls });
      t.innerHTML = `<div class="hsa-k">${k}</div><div class="v"></div><div class="fn">${fn.replace(/([a-z])([A-Z])/g, '$1<wbr>$2')}</div>` + (cls === 'st' ? '' : '<div class="bar"><i></i></div>');
      tiles.append(t);
      return { el: t, v: t.querySelector('.v'), bar: t.querySelector('.bar i') };
    };
    const tP = mkTile('pw', 'power draw', 'nvmlDeviceGetPowerUsage');
    const tT = mkTile('tp', 'temperature', 'nvmlDeviceGetTemperature');
    const tM = mkTile('mm wide2', 'allocated memory', 'nvmlDeviceGetMemoryInfo');
    const tL = mkTile('pw', 'power limit', 'nvmlDeviceGetEnforcedPowerLimit');
    const tS = mkTile('st', 'power limiting', 'nvmlDeviceGetCurrentClocksEventReasons');
    const spark = el('div', { class: 'hsa-spark' });
    spark.innerHTML = '<div class="hsa-legend"><span><i style="background:var(--ink);height:3px;width:16px;border-radius:1px"></i>power draw (W, of 1,000)</span><span><i style="background:transparent;height:0;width:16px;border-radius:0;border-top:2px dashed var(--ink-3)"></i>temperature (°C, of 100)</span></div>';
    L.append(spark);
    const cv = GG.canvas(spark, { height: 64, label: 'Simulated history of power draw and temperature over the last 30 seconds' });
    const code = ctx.code(R, { lang: 'python', code: NVML_PY, caption: 'nvml_peek.py · Python bindings', notes: {
      1: '<code>pynvml</code> is the module NVIDIA’s official Python bindings install. Under it is the C library, <code>libnvidia-ml.so</code>.',
      3: '<code>nvmlInit</code> loads and initializes NVML. Every NVML session starts with it and ends with <code>nvmlShutdown</code>.',
      4: 'A <em>handle</em> names one GPU; index 0 is the first one in nvidia-smi’s list.',
      6: '<b>Power draw.</b> NVML reports it in <b>milliwatts</b>, hence the division.',
      7: '<b>Temperature</b> of the GPU die, in degrees Celsius.',
      8: '<b>Allocated memory.</b> A struct with <code>total</code>, <code>free</code> and <code>used</code>, in bytes. 183,359 MiB total on a B200.',
      9: '<b>Power limit</b> the GPU is enforcing right now, in milliwatts. Administrators can lower it (nvidia-smi <code>-pl</code>).',
      10: '<b>Power limiting state.</b> A bit mask of reasons the clocks are currently held down. Older code calls <code>nvmlDeviceGetCurrentClocksThrottleReasons</code>, the deprecated name of the same query.',
      11: 'The software power cap bit: set when the GPU is slowing its clocks to stay under the power limit. Its deprecated name is <code>nvmlClocksThrottleReasonSwPowerCap</code>.',
      13: 'Print a one-line summary.',
      15: 'Release NVML’s resources.',
    } });
    const mirror = el('div', { class: 'hsa-mirror', 'aria-live': 'polite' });
    R.append(mirror);
    const out = el('div', { class: 'hsa-out' });
    out.innerHTML = '<div class="hsa-k">it would print <span class="hsa-tag sim">simulated</span></div>';
    const outPre = el('pre', { class: 'hsa-term', 'aria-live': 'off' });
    out.append(outPre);
    R.append(out);
    const LINK = { 6: tP, 7: tT, 8: tM, 9: tL, 10: tS, 11: tS };
    let litTile = null, mirrorHTML = '';
    function syncMirror() {
      const on = !!litTile && box.classList.contains('one');   // stacked layout: the tiles are off screen, so echo the value here
      mirror.classList.toggle('on', on);
      const h = on ? `<span class="hsa-k">${litTile.el.querySelector('.hsa-k').textContent}</span><b>${litTile.v.innerHTML}</b>` : '';
      if (h !== mirrorHTML) { mirrorHTML = h; mirror.innerHTML = h; }
    }
    Object.keys(LINK).forEach((n) => {
      const ln = code.line(+n);
      if (!ln) return;
      const on = () => { litTile = LINK[n]; [tP, tT, tM, tL, tS].forEach((t) => t.el.classList.toggle('lit', t === LINK[n])); syncMirror(); };
      ln.addEventListener('mouseenter', on); ln.addEventListener('focus', on); ln.addEventListener('click', on);
    });
    code.el.addEventListener('mouseleave', () => { if (box.classList.contains('one')) return; litTile = null; [tP, tT, tM, tL, tS].forEach((t) => t.el.classList.remove('lit')); syncMirror(); });
    // simulation
    const MEM_TOTAL = 183359, IDLE_W = 136, PEAK_W = 1150;
    const sim = { load: 0, limit: 1000, mem: 0, P: IDLE_W, T: 27, hist: [], acc: 0 };
    const demand = () => IDLE_W + (PEAK_W - IDLE_W) * sim.load;
    const targetT = (p) => 27 + (p - IDLE_W) * 0.05;
    for (let k = 0; k < 120; k++) sim.hist.push([sim.P, sim.T]);
    let lastWhy = '';
    function paint() {
      const capped = demand() > sim.limit + 0.5;
      tP.v.innerHTML = `${Math.round(sim.P)}<small>W</small>`;
      tP.bar.style.width = (sim.P / 1000 * 100).toFixed(1) + '%';
      tT.v.innerHTML = `${Math.round(sim.T)}<small>°C</small>`;
      tT.bar.style.width = Math.min(100, sim.T).toFixed(1) + '%';
      tM.v.innerHTML = `${GG.fmt.int(sim.mem)}<small>of ${GG.fmt.int(MEM_TOTAL)} MiB</small>`;
      tM.bar.style.width = (sim.mem / MEM_TOTAL * 100).toFixed(2) + '%';
      tL.v.innerHTML = `${Math.round(sim.limit)}<small>W</small>`;
      tL.bar.style.width = (sim.limit / 1000 * 100).toFixed(1) + '%';
      tS.el.classList.toggle('on', capped); tS.el.classList.toggle('off', !capped);
      tS.v.textContent = capped ? 'active' : 'not limiting';
      outPre.textContent = `${Math.round(sim.P)} W of ${Math.round(sim.limit)} W, ${Math.round(sim.T)} C, ${Math.round(sim.mem)} MiB used, capped: ${capped ? 'True' : 'False'}`;
      stD.set(GG.fmt.int(demand()) + ' W', capped ? 'danger' : null);
      stU.set(GG.fmt.pct(sim.P / sim.limit), capped ? 'danger' : null);
      const P0 = Math.round(sim.P), T0 = Math.round(sim.T);
      const atSample = sim.load === 0 && sim.mem === 0 && sim.limit === 1000 && Math.abs(sim.T - 27) < 0.5 && Math.abs(sim.P - IDLE_W) < 0.5;
      const why = capped
        ? `<b>Power limiting.</b> The work being run would draw about ${GG.fmt.int(demand())} W, more than the ${Math.round(sim.limit)} W limit. The GPU lowers its clocks until it draws no more than the limit, and NVML’s power-cap reason bit turns on: the kernels run, just slower.`
        : atSample
          ? 'The GPU from the glossary’s sample, at rest: 136 W of a 1000 W limit, 27 °C, no memory allocated. Even idle, a B200 draws over a hundred watts.'
          : sim.load === 0
            ? `No kernels running: the GPU draws ${P0} W at ${T0} °C${sim.T > 27.5 ? ', still cooling down from the last load' : ''}, with a ${Math.round(sim.limit)} W limit${sim.mem ? ` and ${GG.fmt.int(sim.mem)} MiB allocated, which by itself does no work` : ''}. Even idle, a B200 draws over a hundred watts.`
            : `Under ${GG.fmt.pct(sim.load)} load the GPU draws ${P0} W of its ${Math.round(sim.limit)} W limit. Temperature follows power with a delay, because the chip and its cooling take time to heat up.`;
      if (why !== lastWhy) { lastWhy = why; f.setWhy(why); }
      syncMirror();
      drawSpark();
    }
    function drawSpark() {
      const g = cv.ctx, w = cv.w, hh = cv.h;
      if (!w) return;
      const C = GG.colors();
      g.clearRect(0, 0, w, hh);
      g.strokeStyle = GG.alpha(C.ink3 || '#767b95', 0.25); g.lineWidth = 1;
      [0.25, 0.5, 0.75].forEach((q) => { g.beginPath(); g.moveTo(0, Math.round(hh * q) + 0.5); g.lineTo(w, Math.round(hh * q) + 0.5); g.stroke(); });
      const n = sim.hist.length;
      [[0, 1000, C.ink, []], [1, 100, C.ink3, [5, 4]]].forEach(([j, max, col, dash]) => {
        g.strokeStyle = col; g.lineWidth = 1.8; g.setLineDash(dash); g.beginPath();
        sim.hist.forEach((p, k) => { const x = (k / (n - 1)) * w, y = hh - 3 - (Math.min(max, p[j]) / max) * (hh - 6); if (k) g.lineTo(x, y); else g.moveTo(x, y); });
        g.stroke();
      });
      g.setLineDash([]);
    }
    cv.onResize(() => drawSpark());
    const anim = GG.anim(f.stage, (t, dt) => {
      const tgtP = Math.min(demand(), sim.limit);
      sim.P += (tgtP - sim.P) * Math.min(1, dt * 2.2);
      sim.T += (targetT(sim.P) - sim.T) * Math.min(1, dt / 6);
      sim.acc += dt;
      if (sim.acc >= 0.25) { sim.acc = 0; sim.hist.push([sim.P, sim.T]); if (sim.hist.length > 120) sim.hist.shift(); }
      paint();
    });
    const stD = GG.ui.stat(f.readouts, { label: 'work would draw', value: '' });
    const stU = GG.ui.stat(f.readouts, { label: 'draw / limit', value: '' });
    GG.ui.slider(f.controls, { label: 'kernel load', min: 0, max: 100, value: 0, format: (v) => v + '%', onInput: (v) => { sim.load = v / 100; if (!anim.running) { sim.P = Math.min(demand(), sim.limit); sim.T = targetT(sim.P); } paint(); } });
    GG.ui.slider(f.controls, { label: 'power limit (-pl)', min: 200, max: 1000, step: 10, value: 1000, format: (v) => v + ' W', onInput: (v) => { sim.limit = v; if (!anim.running) { sim.P = Math.min(demand(), sim.limit); sim.T = targetT(sim.P); } paint(); } });
    GG.ui.slider(f.controls, { label: 'memory allocated', min: 0, max: MEM_TOTAL, step: 1, value: 0, format: (v) => GG.fmt.int(v) + ' MiB', onInput: (v) => { sim.mem = v; paint(); } });
    const pbRow = el('div', { class: 'hsa-ctlrow' });
    f.controls.append(pbRow);
    GG.ui.playButton(pbRow, anim);
    paint();
  }

  GG.entry('nvml', {
    render(body, ctx) {
      body.classList.add('hsa-body');
      const s = ctx.html(body, `
<p><strong>NVML</strong> is a C library that ships with the driver. Where the CUDA APIs are for <em>using</em> a GPU (allocating memory, launching kernels), NVML is for <em>watching and administering</em> it: how hot is it, how much power is it drawing, who is using it, and what limits apply.</p>
<div data-slot="stack" class="wide"></div>
<h3>What it exposes</h3>
<p>It exposes, for example, the power draw and temperature of the GPU, the allocated memory, and the device’s power limit and power limiting state. The <em>power limit</em> is the most power the GPU is allowed to draw (1000 W for each B200 in the ${T('nvidia-smi', 'nvidia-smi')} sample). When the work it is given would draw more, the GPU lowers its clock speed to stay under the limit, and its power limiting state says so. Fig. 2 lets you push a simulated GPU into that state.</p>
<div data-slot="dash" class="wide"></div>
<p>For details on these metrics, including how to interpret power and thermal readings, see ${X('https://modal.com/docs/guide/gpu-metrics', 'this page on the Modal docs')}.</p>
${GG.noteHTML('intuition', '<p>Power is often a better gauge of how hard a GPU is working than “utilization”. A GPU that is busy but waiting on memory draws much less than one doing dense matrix math at full speed. Power limiting is the GPU telling you it could go faster if it were allowed more power.</p>')}
<h3>Monitoring and managing</h3>
<p>“Managing” means changing state, not just reading it. NVML has a setter for many of the things it reports; administrators normally reach them through nvidia-smi’s flags. A few pairs:</p>
<div data-slot="mgmt"></div>
<h3>How to reach it</h3>
<p>The functions of NVML are frequently accessed via the ${T('nvidia-smi', 'nvidia-smi')} command line utility, but are also accessible to programs via wrappers, like ${X('https://pypi.org/project/pynvml/', 'pynvml in Python')} and ${X('https://docs.rs/nvml-wrapper/latest/nvml_wrapper/', 'nvml_wrapper in Rust')}. A <em>wrapper</em> (or binding) lets a language other than C call the library with that language’s own types: the script in Fig. 2 is Python, but every call in it ends in the C library ${T('libnvml', 'libnvml.so')}.</p>
${GG.noteHTML('beyond', '<p>NVML is also what most GPU monitoring systems are built on, including NVIDIA’s Data Center GPU Manager (DCGM) and the exporters that feed GPU metrics into dashboards. It does not use the CUDA APIs and does not create a CUDA context, so reading a GPU’s temperature does not disturb the programs running on it.</p>')}
<div data-slot="read"></div>`);
      guard(s.stack, 'Toolkit stack', () => {
        toolkitFig(s.stack, ctx, {
          title: 'NVML beside the CUDA Toolkit stack',
          hint: 'send the call · hover a layer',
          wide: true,
          caption: `The CUDA Toolkit stack (redrawn from the glossary, adapted from ${PROF_CUDA}) with the management column added: nvidia-smi calls NVML, and NVML talks to the NVIDIA GPU Driver without going through the CUDA Runtime or Driver API.`,
        }, { nvml: true, files: true, highlight: 'nvml', animateCall: { path: 'smi-nvml-driver-gpu', tags: { smi: 'nvidia-smi', nvml: 'GetPowerUsage' },
          say: { smi: 'You type <code>nvidia-smi</code>. To fill in its table it needs, among other things, each GPU’s power draw.', nvml: '<b>NVML</b> provides it: <code>nvmlDeviceGetPowerUsage</code>, implemented in <code>libnvml.so</code> (on disk, <code>libnvidia-ml.so</code>).', driver: 'NVML asks the <b>NVIDIA GPU Driver</b>, which reads the GPU’s power sensor.', gpu: 'The reading comes back up the same path: 136 W on GPU 0 in the sample.' } } });
      });
      guard(s.dash, 'NVML dashboard', () => dashFig(s.dash, ctx));
      s.mgmt.innerHTML = GG.tableHTML(`<thead><tr><th>state</th><th>read with</th><th>change with</th><th>nvidia-smi</th></tr></thead><tbody>
        <tr><td>power limit</td><td><code>nvmlDeviceGetPowerManagementLimit</code></td><td><code>nvmlDeviceSetPowerManagementLimit</code></td><td><code>-pl</code></td></tr>
        <tr><td>persistence mode</td><td><code>nvmlDeviceGetPersistenceMode</code></td><td><code>nvmlDeviceSetPersistenceMode</code></td><td><code>-pm</code></td></tr>
        <tr><td>compute mode</td><td><code>nvmlDeviceGetComputeMode</code></td><td><code>nvmlDeviceSetComputeMode</code></td><td><code>-c</code></td></tr>
        <tr><td>application clocks</td><td><code>nvmlDeviceGetApplicationsClock</code></td><td><code>nvmlDeviceSetApplicationsClocks</code></td><td><code>-ac</code></td></tr>
        <tr><td>locked GPU clocks</td><td></td><td><code>nvmlDeviceSetGpuLockedClocks</code></td><td><code>-lgc</code></td></tr>
        <tr><td>locked memory clocks</td><td></td><td><code>nvmlDeviceSetMemoryLockedClocks</code></td><td><code>-lmc</code></td></tr></tbody>`);
      ctx.reading(s.read, [
        { href: 'https://modal.com/docs/guide/gpu-metrics', label: 'Modal docs: GPU metrics', note: 'what the power and thermal readings mean and how to interpret them' },
        { href: 'https://pypi.org/project/pynvml/', label: 'pynvml on PyPI', note: 'Python access to NVML' },
        { href: 'https://docs.rs/nvml-wrapper/latest/nvml_wrapper/', label: 'nvml_wrapper on docs.rs', note: 'Rust access to NVML' },
        { href: 'https://docs.nvidia.com/deploy/nvml-api/', label: 'NVML API Reference Guide', note: 'NVIDIA’s documentation of every NVML function' },
      ]);
    },
  });

  /* ═════════════════════════════ libnvml ═════════════════════════════ */

  GG.css(`
.hsa-who .cl { fill: var(--surface-2); stroke: var(--line-2); stroke-width: 1.2; cursor: pointer; transition: fill 0.2s, stroke 0.2s; }
.hsa-who g.c:hover .cl { stroke: var(--ink-3); }
.hsa-who g.c.on .cl { fill: #2a2542; stroke: var(--accent); stroke-width: 1.8; }
.hsa-who g.c:focus { outline: none; }
.hsa-who g.c:focus-visible .cl { stroke: var(--accent); stroke-width: 2.2; }
.hsa-who .ct { font-size: 12px; font-weight: 600; fill: var(--ink); pointer-events: none; }
.hsa-who .cs { font-size: 9.5px; fill: var(--ink-3); pointer-events: none; }
.hsa-who .so { fill: rgba(8, 9, 14, 0.8); stroke: rgba(184, 164, 255, 0.45); stroke-width: 1.2; stroke-dasharray: 4 3; transition: stroke 0.2s, fill 0.2s; }
.hsa-who .so.on { stroke: var(--host); fill: rgba(184, 164, 255, 0.1); stroke-dasharray: none; stroke-width: 1.6; }
.hsa-who .st { font-size: 12.5px; font-weight: 600; fill: #d9d0ff; }
.hsa-who .ss { font-size: 9.5px; fill: var(--ink-3); }
.hsa-who .ko { fill: rgba(255, 198, 92, 0.06); stroke: rgba(255, 198, 92, 0.5); stroke-width: 1.2; }
.hsa-who .kt { font-size: 12.5px; font-weight: 600; fill: var(--control); }
.hsa-who .ln { fill: none; stroke: var(--ink-3); stroke-width: 1.2; opacity: 0.18; transition: opacity 0.2s, stroke 0.2s; }
.hsa-who .ln.on { opacity: 1; stroke: var(--control); stroke-width: 1.8; }
.hsa-who .ln.k { opacity: 0.5; stroke-dasharray: 3 3; }
.hsa-who .hd { font-size: 10px; letter-spacing: 0.1em; fill: var(--ink-3); }
.hsa-who .so.bad, .hsa-who .so.on.bad, .hsa-who .ko.bad { stroke: var(--danger); stroke-dasharray: none; }
.hsa-who .ln.k.bad { stroke: var(--danger); opacity: 0.9; }
.hsa-who .ss.new { fill: var(--ink); font-weight: 600; }
.hsa-who .vb { fill: rgba(8, 9, 14, 0.6); stroke: var(--line-2); stroke-width: 1.1; stroke-dasharray: 4 3; transition: stroke 0.2s; }
.hsa-who .via.on .vb { stroke: var(--host); stroke-dasharray: none; }
.hsa-who .vt { font-size: 11.5px; font-weight: 600; fill: var(--ink-2); pointer-events: none; }
.hsa-who .via.alt .vt { fill: var(--ink-3); }
/* the mismatch error is the point of the state: wrap it on a phone instead of hiding half of it off-screen */
.hsa-term.hsa-wrap { white-space: pre-wrap; overflow-wrap: anywhere; }
`);

  function whoLoadsFig(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Two shared objects from one driver',
      hint: 'click a program · upgrade the driver',
      wide: true,
      caption: 'Which of the driver’s two big user-space libraries each kind of program loads, on the machine from the nvidia-smi sample (driver 580.95.05). Both are installed by the driver, both talk to the same kernel module, and they never call each other: CUDA programs use libcuda, monitoring tools use NVML. The NVML file on disk is <code>libnvidia-ml.so</code>, what the glossary calls libnvml.so. The upgrade switch replays a well-known failure; the newer version number, 590.48.01, is illustrative.',
    });
    const holder = el('div', { class: 'hsa-w' });
    f.stage.append(holder);
    const term = el('pre', { class: 'hsa-term' });
    const termHint = el('div', { class: 'hsa-scrollhint', text: '← scroll sideways for the versions →' });
    f.stage.append(el('div', { style: 'margin-top:12px' }, term, termHint));
    const fitHint = () => termHint.classList.toggle('on', term.scrollWidth > term.clientWidth + 2);
    onWidth(term, fitHint);
    const CL = [
      { k: 'cu', t: 'block_sum', s: 'a CUDA C++ program', uses: ['cuda'], why: `A CUDA program like <code>block_sum</code> loads only <code>libcuda.so</code> (through its built-in copy of the Runtime, at the first CUDA call). It never needs NVML.` },
      { k: 'pt', t: 'PyTorch', s: 'a framework', uses: ['cuda', 'nvml'], why: 'PyTorch runs its kernels through <code>libcuda.so</code>. A few of its helpers, such as <code>torch.cuda.utilization()</code>, ask NVML instead, through the pynvml bindings, so a PyTorch process can end up with both libraries loaded.' },
      { k: 'smi', t: 'nvidia-smi', s: 'command-line tool', uses: ['nvml'], why: `${T('nvidia-smi', 'nvidia-smi')} is built entirely on NVML: every number in its table comes from <code>libnvidia-ml.so</code>. NVML even has a query for the “CUDA Version” printed in its header.` },
      { k: 'py', t: 'pynvml script', s: 'Python bindings', uses: ['nvml'], why: 'The Python bindings load <code>libnvidia-ml.so.1</code> at <code>nvmlInit()</code> and call its C functions directly.' },
      { k: 'rs', t: 'nvml_wrapper', s: 'Rust bindings', uses: ['nvml'], why: 'The Rust crate does the same from Rust: it opens the NVML shared object when the program initializes it.' },
    ];
    const OLD = '580.95.05', NEW = '590.48.01';
    const DRV = {
      inst: { lib: OLD, ko: OLD, ok: true, label: 'as installed' },
      mis: { lib: NEW, ko: OLD, ok: false, label: 'upgraded, no reboot' },
      boot: { lib: NEW, ko: NEW, ok: true, label: 'after a reboot' },
    };
    const st = { sel: 'smi', layout: null, drv: 'inst' };
    let N = null;
    function build(kind) {
      st.layout = kind;
      const D = DRV[st.drv];
      const wide = kind === 'wide';
      const W = wide ? 760 : 360;
      const cw = wide ? 190 : 132, ch = wide ? 44 : 40, gap = wide ? 10 : 9, cx = 6, cy0 = 26;
      const H = cy0 + CL.length * (ch + gap) + (wide ? 4 : 80);
      holder.innerHTML = '';
      const svg = svgRoot(holder, W, H, 'Programs on the left; libcuda.so and libnvidia-ml.so in the middle; both talk to nvidia.ko.', 'hsa-who');
      txt(svg, cx, 14, 'PROGRAMS', { class: 'hd' });
      const soX = wide ? 300 : 156, soW = wide ? 250 : 188, soH = wide ? 66 : 62;
      const soY = { cuda: cy0 + (wide ? 4 : 2), nvml: cy0 + CL.length * (ch + gap) - gap - soH - (wide ? 4 : 2) };
      txt(svg, soX, 14, 'SHARED OBJECTS (USER SPACE)', { class: 'hd' });
      const ko = wide ? [600, cy0 + (CL.length * (ch + gap) - gap) / 2 - 26, 150, 52] : [soX, H - 60, soW, 50];
      N = { c: {}, ln: [], so: {} };
      const lineG = S('g', null, svg);
      const SO = {
        cuda: { t: 'libcuda.so.1', v: '→ libcuda.so.' + D.lib, r: 'the CUDA Driver API' },
        nvml: { t: 'libnvidia-ml.so.1', v: '→ libnvidia-ml.so.' + D.lib, r: wide ? 'NVML: the glossary’s libnvml.so' : 'NVML (glossary: libnvml.so)' },
      };
      Object.keys(SO).forEach((k) => {
        const y = soY[k];
        let d;
        if (wide) d = `M${soX + soW} ${y + soH / 2}C${soX + soW + 30} ${y + soH / 2} ${ko[0] - 30} ${ko[1] + ko[3] / 2} ${ko[0]} ${ko[1] + ko[3] / 2}`;
        else if (k === 'nvml') d = `M${soX + soW / 2} ${y + soH}V${ko[1]}`;
        else d = `M${soX + soW} ${y + soH / 2}H${W - 6}V${ko[1] + ko[3] / 2}H${soX + soW}`;
        S('path', { d, class: 'ln k' + (D.ok ? '' : ' bad') }, lineG);
      });
      CL.forEach((c, i) => {
        const y = cy0 + i * (ch + gap);
        c.uses.forEach((u) => {
          const ty = soY[u] + soH / 2;
          const off = Math.min(40, (soX - cx - cw) * 0.6);
          const d = `M${cx + cw} ${y + ch / 2}C${cx + cw + off} ${y + ch / 2} ${soX - off} ${ty} ${soX} ${ty}`;
          N.ln.push({ k: c.k, el: S('path', { d, class: 'ln' }, lineG) });
        });
      });
      Object.keys(SO).forEach((k) => {
        const y = soY[k];
        N.so[k] = S('rect', { x: soX, y, width: soW, height: soH, rx: 8, class: 'so' + (D.ok ? '' : ' bad') }, svg);
        txt(svg, soX + 12, y + 22, SO[k].t, { class: 'st' });
        txt(svg, soX + 12, y + 39, SO[k].v, { class: 'ss' + (D.lib !== OLD ? ' new' : '') });
        txt(svg, soX + 12, y + 55, SO[k].r, { class: 'ss' });
      });
      S('rect', { x: ko[0], y: ko[1], width: ko[2], height: ko[3], rx: 8, class: 'ko' + (D.ok ? '' : ' bad') }, svg);
      txt(svg, ko[0] + 12, ko[1] + 22, 'nvidia.ko', { class: 'kt' });
      txt(svg, ko[0] + 12, ko[1] + 39, 'loaded: ' + D.ko, { class: 'ss' + (D.ko !== OLD ? ' new' : '') });
      CL.forEach((c, i) => {
        const y = cy0 + i * (ch + gap);
        const g = S('g', { class: 'c', tabindex: '0', role: 'button', 'aria-label': `${c.t}, ${c.s}` }, svg);
        S('rect', { x: cx, y, width: cw, height: ch, rx: 8, class: 'cl' }, g);
        txt(g, cx + 10, y + (wide ? 19 : 17), c.t, { class: 'ct' });
        txt(g, cx + 10, y + (wide ? 34 : 31), c.s, { class: 'cs' });
        g.addEventListener('click', () => pick(c.k));
        g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(c.k); } });
        N.c[c.k] = g;
      });
      pick(st.sel);
    }
    const stL = GG.ui.stat(f.readouts, { label: 'loads libcuda.so', value: '' });
    const stN = GG.ui.stat(f.readouts, { label: 'loads NVML', value: '' });
    const stV = GG.ui.stat(f.readouts, { label: 'library / module versions', value: '' });
    function pick(k) {
      st.sel = k;
      const c = CL.find((x) => x.k === k);
      const D = DRV[st.drv];
      Object.keys(N.c).forEach((j) => N.c[j].classList.toggle('on', j === k));
      N.ln.forEach((l) => l.el.classList.toggle('on', l.k === k));
      N.so.cuda.classList.toggle('on', c.uses.includes('cuda'));
      N.so.nvml.classList.toggle('on', c.uses.includes('nvml'));
      stL.set(c.uses.includes('cuda') ? 'yes' : 'no', c.uses.includes('cuda') ? 'host' : null);
      stN.set(c.uses.includes('nvml') ? 'yes' : 'no', c.uses.includes('nvml') ? 'host' : null);
      stV.set(D.ok ? 'match' : 'mismatch', D.ok ? null : 'danger');
      const P = (x) => `<span class="p">$</span> <span class="c">${esc(x)}</span>\n`;
      term.classList.toggle('hsa-wrap', !D.ok);
      term.innerHTML = (P('nvidia-smi') + (D.ok
        ? `${esc(SMI_LINES[0])}\n${esc(SMI_LINES[1].replace(/580\.95\.05/g, D.lib).replace('CUDA Version: 13.0', D.lib === OLD ? 'CUDA Version: 13.0' : 'CUDA Version: …   '))}\n<span class="note-c"># … the rest of the table</span>`
        : '<span class="bad">Failed to initialize NVML: Driver/library version mismatch</span>')).replace(/\n$/, '');
      fitHint();
      const drvWhy = {
        inst: '',
        mis: ` <b>Right now, though, nothing works.</b> The driver was upgraded on disk, so the libraries are now version ${NEW}, but the kernel still has the old ${OLD} module loaded. NVML refuses to talk to a module from another version, and nvidia-smi stops with the famous error; CUDA programs fail to initialize for the same reason.`,
        boot: ` After the reboot the new ${NEW} module is loaded, matching the libraries again. (Unloading and reloading the kernel modules, with no GPU process running, does the same.)`,
      }[st.drv];
      f.setWhy(c.why + drvWhy);
    }
    GG.ui.seg(f.controls, { label: 'driver', value: 'inst', options: Object.keys(DRV).map((k) => ({ value: k, label: DRV[k].label })), onChange: (v) => { st.drv = v; build(st.layout); } });
    onWidth(holder, (w) => { const want = w < 600 ? 'narrow' : 'wide'; if (want !== st.layout) build(want); });
    build((f.stage.getBoundingClientRect().width || 700) < 600 ? 'narrow' : 'wide');
  }

  GG.entry('libnvml', {
    render(body, ctx) {
      body.classList.add('hsa-body');
      const s = ctx.html(body, `
<p><strong><code>libnvml.so</code></strong> is to ${T('nvml', 'NVML')} what ${T('libcuda', 'libcuda.so')} is to the ${T('cuda-driver-api', 'CUDA Driver API')}: the compiled library that programs load at run time, installed together with the driver.</p>
<div data-slot="stack" class="wide"></div>
${GG.noteHTML('check', '<p><b>The name on disk.</b> On a Linux machine with the NVIDIA driver installed you will not find a file called <code>libnvml.so</code>. NVIDIA’s driver installs the NVML library as <code>libnvidia-ml.so</code>: programs ask for <code>libnvidia-ml.so.1</code>, a link to a file named after the driver version, like <code>libnvidia-ml.so.580.95.05</code>. (On Windows it is <code>nvml.dll</code>.) “libnvml” is a convenient short name for it.</p>')}
<h3>Who loads it</h3>
<p>Monitoring and management programs load it; ordinary CUDA programs do not. Fig. 2 shows which program loads which of the driver’s two libraries.</p>
<div data-slot="who" class="wide"></div>
${GG.noteHTML('beyond', '<p><b>A famous error message.</b> Like <code>libcuda.so</code>, <code>libnvidia-ml.so</code> must come from the same driver version as the loaded kernel module ' + T('nvidia-ko', 'nvidia.ko') + '. After a driver upgrade without a reboot, the new library meets the old module still in memory, and nvidia-smi stops with <code>Failed to initialize NVML: Driver/library version mismatch</code>. Rebooting, or reloading the kernel module, brings the two back in line. Fig. 2’s driver switch plays it out.</p>')}`);
      guard(s.stack, 'Toolkit stack', () => {
        toolkitFig(s.stack, ctx, {
          title: 'libnvml.so beside libcuda.so',
          hint: 'hover a layer',
          wide: true,
          caption: `The CUDA Toolkit stack with the management column (redrawn from the glossary, adapted from ${PROF_CUDA}) and each layer’s file. NVML and the Driver API are lit: two user-space libraries of the same driver, one for management, one for computation. The NVML chip carries the glossary’s name, libnvml.so; on disk the file is libnvidia-ml.so (Fig. 2).`,
        }, { nvml: true, files: true, highlight: ['nvml', 'driver-api'] });
      });
      guard(s.who, 'Who loads it', () => whoLoadsFig(s.who, ctx));
    },
  });

  const SMI_SAMPLE = "+-----------------------------------------------------------------------------------------+\n| NVIDIA-SMI 580.95.05              Driver Version: 580.95.05      CUDA Version: 13.0     |\n|-----------------------------------------+------------------------+----------------------+\n| GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |\n| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |\n|                                         |                        |               MIG M. |\n|=========================================+========================+======================|\n|   0  NVIDIA B200                    On  |   00000000:51:00.0 Off |                    0 |\n| N/A   27C    P0            136W / 1000W |       0MiB / 183359MiB |      0%      Default |\n|                                         |                        |             Disabled |\n+-----------------------------------------+------------------------+----------------------+\n|   1  NVIDIA B200                    On  |   00000000:52:00.0 Off |                    0 |\n| N/A   25C    P0            140W / 1000W |       0MiB / 183359MiB |      0%      Default |\n|                                         |                        |             Disabled |\n+-----------------------------------------+------------------------+----------------------+\n|   2  NVIDIA B200                    On  |   00000000:62:00.0 Off |                    0 |\n| N/A   27C    P0            138W / 1000W |       0MiB / 183359MiB |      0%      Default |\n|                                         |                        |             Disabled |\n+-----------------------------------------+------------------------+----------------------+\n|   3  NVIDIA B200                    On  |   00000000:63:00.0 Off |                    0 |\n| N/A   26C    P0            138W / 1000W |       0MiB / 183359MiB |      0%      Default |\n|                                         |                        |             Disabled |\n+-----------------------------------------+------------------------+----------------------+\n|   4  NVIDIA B200                    On  |   00000000:75:00.0 Off |                    0 |\n| N/A   27C    P0            139W / 1000W |       0MiB / 183359MiB |      0%      Default |\n|                                         |                        |             Disabled |\n+-----------------------------------------+------------------------+----------------------+\n|   5  NVIDIA B200                    On  |   00000000:76:00.0 Off |                    0 |\n| N/A   25C    P0            140W / 1000W |       0MiB / 183359MiB |      0%      Default |\n|                                         |                        |             Disabled |\n+-----------------------------------------+------------------------+----------------------+\n|   6  NVIDIA B200                    On  |   00000000:86:00.0 Off |                    0 |\n| N/A   27C    P0            142W / 1000W |       0MiB / 183359MiB |      0%      Default |\n|                                         |                        |             Disabled |\n+-----------------------------------------+------------------------+----------------------+\n|   7  NVIDIA B200                    On  |   00000000:87:00.0 Off |                    0 |\n| N/A   26C    P0            138W / 1000W |       0MiB / 183359MiB |      0%      Default |\n|                                         |                        |             Disabled |\n+-----------------------------------------+------------------------+----------------------+";

  /* ═════════════════════════════ nvidia-smi ═════════════════════════════ */

  GG.css(`
.hsa-smi { font-size: 12px; line-height: 1.5; padding: 10px 12px; }
@media (min-width: 1100px) { .hsa-smi { font-size: 13.5px; } }
.hsa-scrollhint { display: none; margin-top: 6px; font: 500 11px/1.3 var(--font-mono); color: var(--ink-3); text-align: center; }
.hsa-scrollhint.on { display: block; }
.hsa-smi .b { color: var(--ink-3); }
.hsa-smi .hsa-fh { color: var(--ink-2); border-radius: 3px; cursor: pointer; }
.hsa-smi .hsa-f { color: var(--ink); border-radius: 3px; cursor: pointer; }
.hsa-smi .hsa-fh:focus { outline: none; }
.hsa-smi .hsa-fh:focus-visible { box-shadow: 0 0 0 1.5px var(--accent); }
.hsa-smi .col { background: rgba(255, 138, 91, 0.16); color: var(--accent-2); }
.hsa-smi .cur { background: var(--accent); color: var(--on-accent); }
.hsa-smi.grp .hsa-f:not(.ing), .hsa-smi.grp .hsa-fh:not(.ing) { color: var(--ink-3); }
.hsa-smi .chg { background: rgba(69, 212, 155, 0.22); color: var(--core); box-shadow: 0 0 0 1px rgba(69, 212, 155, 0.6); }
.hsa-smi .tgt { box-shadow: 0 0 0 1px rgba(255, 198, 92, 0.75); color: var(--control); }
.hsa-smi .whole { background: rgba(255, 198, 92, 0.07); }
.hsa-fx2 { margin-top: 10px; border: 1px solid var(--line); border-radius: 12px; background: rgba(8, 9, 14, 0.6); padding: 10px 13px 11px; min-height: 120px; }
.hsa-fx2 .hd { display: flex; flex-wrap: wrap; gap: 6px 10px; align-items: baseline; margin-bottom: 4px; }
.hsa-fx2 .hd b { font: 600 15px/1.3 var(--font-mono); color: var(--ink); }
.hsa-fx2 p { font-size: 14px; line-height: 1.55; color: var(--ink-2); }
.hsa-fx2 p + p { margin-top: 0.5em; }
.hsa-fx2 .meta { margin-top: 7px; font: 500 12px/1.5 var(--font-mono); color: var(--ink-3); }
.hsa-fx2 .meta b { color: var(--ink); font-weight: 600; }
.hsa-fx2 .meta .me { color: var(--ink); }
.hsa-fchips { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px; }
.hsa-fchips .hsa-chip { font-size: 11.5px; padding: 6px 8px 5px; }
.hsa-flags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
.hsa-flags .hsa-chip { font-size: 12.5px; }
.hsa-scr { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; }
.hsa-scr.one { grid-template-columns: minmax(0, 1fr); }
.hsa-scr .pane { border: 1px solid var(--line); border-radius: 12px; padding: 10px 12px 12px; background: rgba(8, 9, 14, 0.5); min-width: 0; }
.hsa-scr .pane h4 { margin: 0 0 8px; font: 600 11px/1.3 var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink); display: flex; flex-wrap: wrap; gap: 6px; align-items: baseline; }
.hsa-scr pre.src { margin: 0; font: 500 12px/1.55 var(--font-mono); background: #07080c; border: 1px solid var(--line); border-radius: 8px; padding: 8px 10px; overflow-x: auto; white-space: pre; color: var(--ink-2); }
.hsa-scr .res { margin-top: 8px; font: 600 13px/1.4 var(--font-mono); }
.hsa-scr .res.ok { color: var(--core); } .hsa-scr .res.bad { color: var(--danger); }
.hsa-scr .lines { margin-top: 8px; font: 500 11.5px/1.55 var(--font-mono); background: #07080c; border: 1px solid var(--line); border-radius: 8px; padding: 6px 8px; overflow-x: auto; white-space: pre; color: #8a8fa8; }
.hsa-scr .lines .ix { color: var(--ink-3); }
.hsa-scr .lines .pick { color: var(--ink); background: rgba(255, 138, 91, 0.12); }
.hsa-scr .lines .tok { color: var(--on-accent); background: var(--accent); border-radius: 2px; }
.hsa-scr .lines .new { color: var(--control); }
`);

  const SMI_LINES = SMI_SAMPLE.split('\n');
  const SMI_RX = {
    top: /(NVIDIA-SMI [\d.]+)\s+(Driver Version: [\d.]+)\s+(CUDA Version: [\d.]+)/d,
    a: /^\|\s+(\d+)\s+(NVIDIA B200)\s+(On|Off)\s+\|\s+([0-9A-F]{8}:[0-9A-F]{2}:[0-9A-F]{2}\.\d)\s+(On|Off)\s+\|\s+(\S+)\s+\|$/d,
    b: /^\|\s+(N\/A|\d+%)\s+(\d+C)\s+(P\d+)\s+(\d+W \/\s+\d+W)\s+\|\s+(\d+MiB \/ \d+MiB)\s+\|\s+(\d+%)\s+(\S+(?: \S+)?)\s+\|$/d,
    c: /^\|\s+\|\s+\|\s+(\S+)\s+\|$/d,
  };
  const SMI_KEYS = { top: ['smi', 'drv', 'cuda'], a: ['idx', 'name', 'pm', 'bus', 'disp', 'ecc'], b: ['fan', 'temp', 'perf', 'pwr', 'mem', 'util', 'cm'], c: ['mig'] };
  const SMI_HEAD = { 3: [['GPU', 'idx'], ['Name', 'name'], ['Persistence-M', 'pm'], ['Bus-Id', 'bus'], ['Disp.A', 'disp'], ['Volatile Uncorr. ECC', 'ecc']],
    4: [['Fan', 'fan'], ['Temp', 'temp'], ['Perf', 'perf'], ['Pwr:Usage/Cap', 'pwr'], ['Memory-Usage', 'mem'], ['GPU-Util', 'util'], ['Compute M.', 'cm']], 5: [['MIG M.', 'mig']] };

  /* [start, end, key, gpu|null, isHeader] tokens of one nvidia-smi line (index in the sample's layout) */
  function smiTokens(line, i) {
    const out = [];
    if (i === 1) { const m = SMI_RX.top.exec(line); if (m) SMI_KEYS.top.forEach((k, j) => out.push([m.indices[j + 1][0], m.indices[j + 1][1], k, null, false])); return out; }
    if (SMI_HEAD[i]) { let p = 0; SMI_HEAD[i].forEach(([lab, k]) => { const at = line.indexOf(lab, p); if (at >= 0) { out.push([at, at + lab.length, k, null, true]); p = at + lab.length; } }); return out; }
    if (i < 7) return out;
    const r = (i - 7) % 4, g = Math.floor((i - 7) / 4);
    const kind = r === 0 ? 'a' : r === 1 ? 'b' : r === 2 ? 'c' : null;
    if (!kind) return out;
    const m = SMI_RX[kind].exec(line);
    if (m) SMI_KEYS[kind].forEach((k, j) => out.push([m.indices[j + 1][0], m.indices[j + 1][1], k, g, false]));
    return out;
  }
  function smiParse(lines) {
    const top = SMI_RX.top.exec(lines[1]);
    const gpus = [];
    for (let i = 7; i + 2 < lines.length; i += 4) {
      const a = SMI_RX.a.exec(lines[i]), b = SMI_RX.b.exec(lines[i + 1]), c = SMI_RX.c.exec(lines[i + 2]);
      if (!a || !b || !c) continue;
      const D = {};
      SMI_KEYS.a.forEach((k, j) => { D[k] = a[j + 1]; });
      SMI_KEYS.b.forEach((k, j) => { D[k] = b[j + 1]; });
      D.mig = c[1];
      D.watts = parseInt(D.pwr, 10); D.cap = parseInt(D.pwr.split('/')[1], 10);
      D.used = parseInt(D.mem, 10); D.total = parseInt(D.mem.split('/')[1], 10);
      D.celsius = parseInt(D.temp, 10);
      gpus.push(D);
    }
    return { smi: top ? top[1] : '', drv: top ? top[2] : '', cuda: top ? top[3] : '', gpus };
  }
  /* HTML for lines; tokens become spans. opts.lines (array of indices to show), opts.mark(tok) → extra class */
  function smiHTML(lines, opts) {
    opts = opts || {};
    const show = opts.show || lines.map((_, i) => i);
    return show.map((i) => {
      const line = lines[i];
      const toks = smiTokens(line, opts.layoutIndex ? opts.layoutIndex(i) : i);
      let html = '', p = 0;
      const plain = (s) => esc(s).replace(/[|+=\-]+/g, (m) => `<span class="b">${m}</span>`);
      toks.forEach(([s0, s1, k, g, hd]) => {
        html += plain(line.slice(p, s0));
        const extra = opts.mark ? opts.mark(k, g, hd) : '';
        html += `<span class="${hd ? 'hsa-fh' : 'hsa-f'}${extra ? ' ' + extra : ''}" data-f="${k}"${g != null ? ` data-g="${g}"` : ''}>${esc(line.slice(s0, s1))}</span>`;
        p = s1;
      });
      html += plain(line.slice(p));
      return opts.wrapLine ? opts.wrapLine(i, html) : html;
    }).join('\n');
  }

  const SMI_GROUPS = {
    all: { label: 'all fields' },
    ver: { label: 'versions', keys: ['smi', 'drv', 'cuda'] },
    id: { label: 'identity', keys: ['idx', 'name', 'bus'] },
    live: { label: 'live utilization', keys: ['util', 'mem'] },
    pt: { label: 'power & thermal', keys: ['pwr', 'temp', 'perf', 'fan'] },
    mode: { label: 'modes & health', keys: ['pm', 'cm', 'mig', 'disp', 'ecc'] },
  };
  const SMI_GROUP_OF = {};
  Object.keys(SMI_GROUPS).forEach((g) => (SMI_GROUPS[g].keys || []).forEach((k) => { SMI_GROUP_OF[k] = g; }));

  const SMI_FIELDS = {
    smi: { label: 'NVIDIA-SMI 580.95.05', val: (P) => P.smi.split(' ')[1], text: () => 'The version of the <code>nvidia-smi</code> tool itself. It is installed with the driver, so it normally matches the driver version next to it.' },
    drv: { label: 'Driver Version', val: (P) => P.drv.split(': ')[1], text: () => `The installed ${T('nvidia-gpu-drivers', 'NVIDIA driver')}. The first number is the driver branch, here R580. The kernel module and every user-space library of the driver (<code>libcuda.so</code>, NVML) carry this same version.` },
    cuda: { label: 'CUDA Version', val: (P) => P.cuda.split(': ')[1], text: () => `Often misread. This is <b>not</b> the CUDA Toolkit installed on the machine (there may be none). It is the newest CUDA version the driver’s ${T('cuda-driver-api', 'Driver API')} supports. Programs built with CUDA 13.0 or older can use this driver, thanks to the Driver API’s binary compatibility. Their GPU code must still suit the B200: either machine code (${T('streaming-assembler', 'SASS')}) built for it, which needs CUDA 12.8 or newer, or ${T('parallel-thread-execution', 'PTX')} that the driver compiles just in time.` },
    idx: { label: 'GPU', val: (P, D) => D.idx, text: () => 'The GPU’s index in nvidia-smi’s list, 0 to 7 here, in order of PCI bus address. Pass it to <code>-i</code> to aim a command at one GPU. (CUDA programs number GPUs by their own rule, fastest first, which can differ; setting <code>CUDA_DEVICE_ORDER=PCI_BUS_ID</code> makes the two agree.)' },
    name: { label: 'Name', val: (P, D) => D.name, text: () => 'The product name: here NVIDIA’s B200, a datacenter GPU of the Blackwell generation. The rest of the identity the glossary lists, a unique ID (UUID) and the PCI ID, is printed by <code>nvidia-smi -q</code>, and <code>nvidia-smi -L</code> lists each GPU with its UUID.' },
    pm: { label: 'Persistence-M', flag: '-pm', val: (P, D) => D.pm, text: () => 'Persistence mode. When <b>On</b>, the driver keeps the GPU initialized even while no program is using it, so the next program does not wait for the driver to set the GPU up again. Linux only. NVIDIA recommends running its <code>nvidia-persistenced</code> service for this.' },
    bus: { label: 'Bus-Id', val: (P, D) => D.bus, text: (D) => { const [dom, bus, rest] = D.bus.split(':'); const [dev, fn] = rest.split('.'); return `The GPU’s address on the PCI Express bus, written <code>domain:bus:device.function</code> in hexadecimal: domain <code>${dom}</code>, bus <code>${bus}</code>, device <code>${dev}</code>, function <code>${fn}</code>. The eight B200s sit on buses 51, 52, 62, 63, 75, 76, 86 and 87.`; } },
    disp: { label: 'Disp.A', val: (P, D) => D.disp, text: () => 'Display Active: whether a display is initialized on the GPU, that is, whether memory is set aside on it to drive a monitor. <b>Off</b>, as you would expect for datacenter GPUs with no screen attached.' },
    ecc: { label: 'Volatile Uncorr. ECC', val: (P, D) => D.ecc, text: () => 'The number of <em>uncorrectable</em> memory errors since the driver was last loaded. ECC (error-correcting code) memory stores extra check bits so that it can repair small errors and detect larger ones; uncorrectable errors are those it detected but could not repair. “Volatile” means the count restarts when the driver reloads (<code>-q</code> also shows an aggregate count). <b>0</b> is what you want.' },
    fan: { label: 'Fan', val: (P, D) => D.fan, text: () => 'Fan speed as a percentage of its maximum. <b>N/A</b> because the B200 has no fan of its own to report: the server’s cooling system does that job.' },
    temp: { label: 'Temp', val: (P, D) => D.temp, text: () => `The GPU’s core temperature in degrees Celsius, read through ${T('nvml', 'NVML')}. These idle GPUs sit at 25 to 27 °C.` },
    perf: { label: 'Perf', val: (P, D) => D.perf, text: () => 'The performance state, from <b>P0</b> (maximum performance) down to P12 (minimum). The driver moves between states with demand; these GPUs report P0 even while idle.' },
    pwr: { label: 'Pwr:Usage/Cap', flag: '-pl', val: (P, D) => D.pwr, text: (D) => `The power the GPU draws right now, and its power limit (cap). GPU ${D.idx} draws ${D.watts} W, ${GG.fmt.fixed(D.watts / D.cap * 100, 1)}% of its ${GG.fmt.int(D.cap)} W cap, while doing nothing. Under heavy load a GPU that hits its cap lowers its clocks to stay under it.` },
    mem: { label: 'Memory-Usage', val: (P, D) => D.mem, text: (D) => `GPU memory allocated, out of the total available. MiB means mebibytes, 2<sup>20</sup> bytes, so ${GG.fmt.int(D.total)} MiB is ${GG.fmt.fixed(D.total / 1024, 1)} GiB, or ${GG.fmt.fixed(D.total * 1048576 / 1e9, 1)} GB in decimal units. <b>${GG.fmt.int(D.used)} MiB</b> used: no program holds memory on it.` },
    util: { label: 'GPU-Util', val: (P, D) => D.util, text: () => `Utilization of kernel execution time: the percentage of time, over the last sample period (between 1/6 s and 1 s depending on the product), during which at least one kernel was running on the GPU. It measures time, not how much of the GPU was busy: one tiny kernel running nonstop shows 100%. See ${T('streaming-multiprocessor-utilization', 'SM utilization')} for a better measure.` },
    cm: { label: 'Compute M.', flag: '-c', val: (P, D) => D.cm, text: () => 'Compute mode. <b>Default</b> lets any number of processes use the GPU at once. <b>Exclusive_Process</b> allows only one at a time, and <b>Prohibited</b> none.' },
    mig: { label: 'MIG M.', val: (P, D) => D.mig, text: () => `Multi-Instance GPU mode. When enabled, the GPU can be split into several isolated GPU instances, each with its own share of ${T('streaming-multiprocessor', 'SMs')} and memory, which programs see as separate GPUs. <b>Disabled</b> here: each B200 is one GPU.` },
  };

  function smiTableFig(host, ctx) {
    const f = ctx.figure(host, {
      title: 'nvidia-smi on a machine with 8 × B200',
      hint: 'hover or tap any field · filter by kind',
      wide: true,
      caption: 'The glossary’s sample output, reproduced verbatim. Every field is live: hovering or tapping one lights its column across all eight GPUs and explains it below, using the values in the text. The filter groups the fields into the kinds of information the glossary lists. Readouts are computed from the text.',
    });
    const P = smiParse(SMI_LINES);
    const pre = el('pre', { class: 'hsa-term hsa-smi', 'data-keys': '' });
    pre.innerHTML = smiHTML(SMI_LINES);
    f.stage.append(pre);
    const hint = el('div', { class: 'hsa-scrollhint', text: '← 91 columns wide: scroll sideways →' });
    f.stage.append(hint);
    onWidth(pre, () => { hint.classList.toggle('on', pre.scrollWidth > pre.clientWidth + 2); reveal(); });
    const chipsRow = el('div', { class: 'hsa-fchips', role: 'group', 'aria-label': 'Fields' });
    f.stage.append(chipsRow);
    const fx = el('div', { class: 'hsa-fx2', 'aria-live': 'polite' });
    f.stage.append(fx);
    const spans = $$(pre, '[data-f]');
    const st = { key: 'cuda', g: 0, group: 'all' };
    let pinned = { key: 'cuda', g: 0 };
    const chips = {};
    Object.keys(SMI_FIELDS).forEach((k) => {
      const b = el('button', { type: 'button', class: 'hsa-chip', 'aria-pressed': 'false', text: SMI_FIELDS[k].label.replace(' 580.95.05', '') });
      b.addEventListener('click', () => { pinned = { key: k, g: pinned.g }; show(k, pinned.g); reveal(); });
      chipsRow.append(b);
      chips[k] = b;
    });
    function show(k, g) {
      st.key = k; st.g = g == null ? st.g : g;
      const F = SMI_FIELDS[k], D = P.gpus[st.g] || P.gpus[0];
      spans.forEach((sp) => {
        const same = sp.getAttribute('data-f') === k;
        const sg = sp.getAttribute('data-g');
        sp.classList.toggle('col', same);
        sp.classList.toggle('cur', same && (sg == null ? true : +sg === st.g) && !sp.classList.contains('hsa-fh'));
      });
      Object.keys(chips).forEach((j) => chips[j].setAttribute('aria-pressed', String(j === k)));
      const grp = SMI_GROUP_OF[k];
      const perGpu = !['smi', 'drv', 'cuda'].includes(k);
      const val = F.val(P, D);
      const vals = P.gpus.map((x) => F.val(P, x));
      const same = vals.every((x) => x === vals[0]);
      const all = !perGpu ? '' : same ? ` · the same on all ${vals.length} GPUs` : `<br>all ${vals.length} GPUs: ${vals.map((x, j) => `<span class="${j === +D.idx ? 'me' : ''}">GPU ${j} ${esc(x)}</span>`).join(' · ')}`;
      fx.innerHTML = `<div class="hd"><b>${esc(F.label)}</b><span class="hsa-tag">${esc(SMI_GROUPS[grp].label)}</span>${F.flag ? `<span class="hsa-tag ok">change with ${F.flag}</span>` : ''}</div><p>${F.text(D)}</p><div class="meta">${perGpu ? `GPU ${D.idx}: ` : 'whole machine: '}<b>${esc(val)}</b>${all}</div>`;
      f.setWhy(`<b>${esc(F.label)}</b>${perGpu ? ` on GPU ${D.idx}` : ''}: <code>${esc(val)}</code>. ${SMI_GROUPS[grp].label[0].toUpperCase() + SMI_GROUPS[grp].label.slice(1)}${grp === 'ver' ? ', printed once for the whole machine.' : ', one value per GPU.'}`);
    }
    /* On a narrow screen the table scrolls sideways: bring the selected field into view (the pre only, never the page). */
    function reveal() {
      if (pre.scrollWidth <= pre.clientWidth + 2) return;
      const c = pre.querySelector('.cur') || pre.querySelector('.col');
      if (!c) return;
      const pr = pre.getBoundingClientRect(), cr = c.getBoundingClientRect();
      pre.scrollLeft = Math.max(0, Math.min(pre.scrollWidth - pre.clientWidth, pre.scrollLeft + (cr.left - pr.left) - pr.width / 2 + cr.width / 2));
    }
    function applyGroup() {
      const keys = SMI_GROUPS[st.group].keys;
      pre.classList.toggle('grp', !!keys);
      spans.forEach((sp) => sp.classList.toggle('ing', !keys || keys.includes(sp.getAttribute('data-f'))));
      Object.keys(chips).forEach((k) => { chips[k].style.display = !keys || keys.includes(k) ? '' : 'none'; });
      if (keys && !keys.includes(pinned.key)) { pinned = { key: keys[0], g: pinned.g }; }
      show(pinned.key, pinned.g);
      reveal();
    }
    const pick = (e) => { const sp = e.target.closest && e.target.closest('[data-f]'); if (!sp || !pre.contains(sp)) return null; const g = sp.getAttribute('data-g'); return { key: sp.getAttribute('data-f'), g: g == null ? null : +g }; };
    pre.addEventListener('mouseover', (e) => { const p = pick(e); if (p) show(p.key, p.g); });
    pre.addEventListener('mouseleave', () => show(pinned.key, pinned.g));
    pre.addEventListener('click', (e) => { const p = pick(e); if (p) { pinned = { key: p.key, g: p.g == null ? pinned.g : p.g }; show(pinned.key, pinned.g); } });
    pre.addEventListener('focusin', (e) => { const p = pick(e); if (p) { pinned = { key: p.key, g: pinned.g }; show(p.key, pinned.g); } });
    pre.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && pick(e)) { e.preventDefault(); } });
    GG.ui.seg(f.controls, { label: 'show', value: 'all', options: Object.keys(SMI_GROUPS).map((g) => ({ value: g, label: SMI_GROUPS[g].label })), onChange: (g) => { st.group = g; applyGroup(); } });
    const sumW = P.gpus.reduce((a, d) => a + d.watts, 0), sumCap = P.gpus.reduce((a, d) => a + d.cap, 0);
    const temps = P.gpus.map((d) => d.celsius);
    GG.ui.stat(f.readouts, { label: 'GPUs', value: String(P.gpus.length) });
    GG.ui.stat(f.readouts, { label: 'total power', value: `${GG.fmt.int(sumW)} of ${GG.fmt.int(sumCap)} W` });
    GG.ui.stat(f.readouts, { label: 'temperatures', value: `${Math.min(...temps)}–${Math.max(...temps)} °C` });
    GG.ui.stat(f.readouts, { label: 'memory in use', value: `${GG.fmt.int(P.gpus.reduce((a, d) => a + d.used, 0))} of ${GG.fmt.int(P.gpus.reduce((a, d) => a + d.total, 0))} MiB`, tone: 'memory' });
    applyGroup();
  }

  function smiFlagsFig(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Flags: querying and managing',
      hint: 'pick a flag',
      wide: true,
      caption: 'The flags the glossary lists, one sentence each, with the NVML function behind the setting where there is a direct one. Commands that change state need root. For the three settings shown in the summary table, “after” shows how GPU 0’s rows would then read (illustrative). <code>-q</code>, <code>-x</code> and <code>pmon</code> print their own formats, shown as abridged or illustrative excerpts.',
    });
    const FL = [
      { k: 'q', label: '-q · --query', cmd: 'nvidia-smi -q', what: 'Prints a full report for each GPU, far longer than the summary: identity (including the UUID and PCI IDs), clocks, temperatures, power, memory, ECC counters, and the processes currently using it.', target: 'all' },
      { k: 'pmon', label: 'pmon', cmd: 'nvidia-smi pmon', what: 'Monitors the processes using each GPU, printing one line per process at every sample, with each process’s share of SM and memory activity, until you stop it.', target: ['util', 'mem'] },
      { k: 'pm', label: '-pm', cmd: 'sudo nvidia-smi -i 0 -pm 0', what: 'Turns persistence mode on (<code>1</code>) or off (<code>0</code>): whether the driver keeps the GPU initialized between programs. Linux only.', nvml: 'nvmlDeviceSetPersistenceMode', target: ['pm'], after: (L) => { L[7] = L[7].replace(/ On  \|/, 'Off  |'); } },
      { k: 'c', label: '-c', cmd: 'sudo nvidia-smi -i 0 -c EXCLUSIVE_PROCESS', what: 'Sets the compute mode: <code>DEFAULT</code> (any number of processes), <code>EXCLUSIVE_PROCESS</code> (one process at a time) or <code>PROHIBITED</code> (none).', nvml: 'nvmlDeviceSetComputeMode', target: ['cm'], after: (L) => { L[8] = L[8].replace('   Default |', 'E. Process |'); } },
      { k: 'pl', label: '-pl', cmd: 'sudo nvidia-smi -i 0 -pl 700', what: 'Sets the power limit, in watts, within the range the GPU allows. A lower cap trades speed for power and heat.', nvml: 'nvmlDeviceSetPowerManagementLimit', target: ['pwr'], after: (L) => { L[8] = L[8].replace('136W / 1000W', '136W /  700W'); } },
      { k: 'ac', label: '-ac', cmd: 'sudo nvidia-smi -i 0 -ac <memMHz>,<graphicsMHz>', what: 'Sets the application clocks: the memory and graphics clock speeds, in MHz, given as a pair, that the GPU uses while running programs. Clocks are not in the summary table; <code>nvidia-smi -q -d CLOCK</code> shows them.', nvml: 'nvmlDeviceSetApplicationsClocks', target: [] },
      { k: 'lgc', label: '-lgc', cmd: 'sudo nvidia-smi -i 0 -lgc <minMHz>,<maxMHz>', what: 'Locks the GPU (graphics) clock to a range, for example to make benchmark timings repeatable. <code>-rgc</code> undoes it.', nvml: 'nvmlDeviceSetGpuLockedClocks', target: [] },
      { k: 'lmc', label: '-lmc', cmd: 'sudo nvidia-smi -i 0 -lmc <minMHz>,<maxMHz>', what: 'Locks the memory clock to a range. <code>-rmc</code> undoes it.', nvml: 'nvmlDeviceSetMemoryLockedClocks', target: [] },
      { k: 'r', label: '-r', cmd: 'sudo nvidia-smi -i 0 -r', what: 'Resets the GPU, reinitializing its hardware state, for example to recover it after an error. Nothing may be using the GPU at the time.', target: 'gpu0' },
      { k: 'x', label: '-x', cmd: 'nvidia-smi -q -x', what: 'Formats the <code>-q</code> report as XML instead of human-readable text, for other programs to parse.', target: 'all' },
    ];
    const flags = el('div', { class: 'hsa-flags', role: 'group', 'aria-label': 'Flags' });
    f.stage.append(flags);
    const cmdPre = el('pre', { class: 'hsa-term' });
    f.stage.append(cmdPre);
    const mini = el('pre', { class: 'hsa-term hsa-smi', style: 'margin-top:8px' });
    f.stage.append(mini);
    const altWrap = el('div', { style: 'margin-top:8px' });
    const altHead = el('div', { class: 'hsa-k', style: 'margin-bottom:5px' });
    const alt = el('pre', { class: 'hsa-term' });
    altWrap.append(altHead, alt);
    f.stage.append(altWrap);
    const ALT = {
      q: { head: 'abridged excerpt, values from the sample', text: '==============NVSMI LOG==============\n\nTimestamp                                 : …\nDriver Version                            : 580.95.05\nCUDA Version                              : 13.0\n\nAttached GPUs                             : 8\nGPU 00000000:51:00.0\n    Product Name                          : NVIDIA B200\n    …\n    Persistence Mode                      : Enabled\n    …\n    GPU UUID                              : GPU-…\n    …\n    PCI\n        Bus                               : 0x51\n        Device                            : 0x00\n        Domain                            : 0x0000\n        Device Id                         : 0x…10DE\n        Bus Id                            : 00000000:51:00.0\n    …\n    Temperature\n        GPU Current Temp                  : 27 C\n    …' },
      pmon: { head: 'illustrative: one process on GPU 0; columns vary by driver version', text: '# gpu         pid   type     sm    mem    enc    dec   command\n# Idx           #    C/G      %      %      %      %   name\n    0       51234     C     97     38      -      -   python\n    1           -     -      -      -      -      -   -\n    …' },
      x: { head: 'abridged excerpt, values from the sample', text: '<?xml version="1.0" ?>\n<nvidia_smi_log>\n\t<timestamp>…</timestamp>\n\t<driver_version>580.95.05</driver_version>\n\t<cuda_version>13.0</cuda_version>\n\t<attached_gpus>8</attached_gpus>\n\t<gpu id="00000000:51:00.0">\n\t\t<product_name>NVIDIA B200</product_name>\n\t\t…' },
    };
    const fx = el('div', { class: 'hsa-fx2', 'aria-live': 'polite', style: 'min-height:0' });
    f.stage.append(fx);
    const SHOW = Array.from({ length: 11 }, (_, i) => i);
    const btn = {};
    let cur = 'pl', after = true;
    FL.forEach((x) => {
      const b = el('button', { type: 'button', class: 'hsa-chip', 'aria-pressed': 'false', text: x.label });
      b.addEventListener('click', () => pick(x.k));
      flags.append(b);
      btn[x.k] = b;
    });
    const stRoot = GG.ui.stat(f.readouts, { label: 'needs root', value: '' });
    const stNv = GG.ui.stat(f.readouts, { label: 'NVML setter', value: '' });
    const seg = GG.ui.seg(f.controls, { label: 'table', value: 'after', options: [{ value: 'before', label: 'before' }, { value: 'after', label: 'after (illustrative)' }], onChange: (v) => { after = v === 'after'; pick(cur); } });
    function pick(k) {
      cur = k;
      const x = FL.find((y) => y.k === k);
      Object.keys(btn).forEach((j) => btn[j].setAttribute('aria-pressed', String(j === k)));
      cmdPre.innerHTML = `<span class="p">$</span> <span class="c">${esc(x.cmd)}</span>`;
      const L = SMI_LINES.slice();
      const changed = !!(x.after && after);
      if (changed) x.after(L);
      seg.el.style.display = x.after ? '' : 'none';   // only settings shown in the summary table have a before and after
      const A = ALT[x.k];
      mini.style.display = A ? 'none' : '';
      altWrap.style.display = A ? '' : 'none';
      if (A) { altHead.textContent = 'it prints (' + A.head + ')'; alt.textContent = A.text; }
      mini.innerHTML = smiHTML(L, {
        show: SHOW,
        mark: (key, g, hd) => {
          if (hd) return Array.isArray(x.target) && x.target.includes(key) ? 'tgt' : '';
          if (x.target === 'all' || (x.target === 'gpu0' && g === 0)) return 'tgt';
          if (Array.isArray(x.target) && x.target.includes(key) && g === 0) return changed ? 'chg' : 'tgt';
          return '';
        },
      });
      const root = /^sudo/.test(x.cmd);
      stRoot.set(root ? 'yes' : 'no', root ? 'danger' : 'core');
      stNv.set(x.nvml ? x.nvml.replace('nvmlDevice', '…') : '—');
      fx.innerHTML = `<div class="hd"><b>${esc(x.label)}</b>${root ? '<span class="hsa-tag bad">root</span>' : '<span class="hsa-tag ok">read-only</span>'}</div><p>${x.what}</p>${x.nvml ? `<div class="meta">NVML equivalent: <b>${x.nvml}</b></div>` : ''}`;
      f.setWhy(x.after
        ? (changed ? `After <code>${esc(x.cmd)}</code>, GPU 0’s <b>${esc(SMI_FIELDS[x.target[0]].label)}</b> field would read differently (green). The other seven GPUs are untouched, because <code>-i 0</code> aimed the command at GPU 0.` : `Before: GPU 0’s <b>${esc(SMI_FIELDS[x.target[0]].label)}</b> field as in the sample (outlined). Switch to “after” to see the change.`)
        : A ? (x.k === 'pmon' ? `<code>${esc(x.cmd)}</code> prints its own table, not the summary: one row per process per GPU, refreshed every sample, with each process’s share of SM (<code>sm</code>) and memory (<code>mem</code>) activity.` : x.k === 'q' ? `<code>${esc(x.cmd)}</code> prints a long key–value report instead of the table, including the GPU UUID and the PCI IDs (<code>Device Id</code> holds the device ID and NVIDIA’s vendor ID, <code>10DE</code>).` : `<code>${esc(x.cmd)}</code> prints the same report as <code>-q</code>, as XML for programs to parse.`)
        : x.target === 'all' ? `<code>${esc(x.cmd)}</code> reports on every field and much more, for every GPU.` : Array.isArray(x.target) && !x.target.length ? `<code>${esc(x.cmd)}</code> changes clock speeds, which are not part of the summary table.` : x.target === 'gpu0' ? `<code>${esc(x.cmd)}</code> acts on GPU 0 as a whole (outlined).` : `<code>${esc(x.cmd)}</code>: the related column is outlined.`);
    }
    pick(cur);
  }

  function smiScrapeFig(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Why tools should call NVML',
      hint: 'switch the input',
      wide: true,
      caption: 'Two ways a script might read GPU 3’s temperature. The first panel scrapes the text table by position, with line and word numbers counted on the glossary’s sample; the second asks NVML. The sample leaves out the line real nvidia-smi prints above the table: the date and time (the date shown here is illustrative).',
    });
    const box = el('div', { class: 'hsa-scr' });
    f.stage.append(box);
    onWidth(box, (w) => { box.classList.toggle('one', w < 760); center(); });
    const L = el('div', { class: 'pane' }), R = el('div', { class: 'pane' });
    box.append(L, R);
    const SCR = `import subprocess
out = subprocess.run(["nvidia-smi"], capture_output=True,
                     text=True).stdout
temp = out.splitlines()[20].split()[2]   # GPU 3's temperature?`;
    const NV = `# after pynvml.nvmlInit()
h = pynvml.nvmlDeviceGetHandleByIndex(3)
temp = pynvml.nvmlDeviceGetTemperature(
    h, pynvml.NVML_TEMPERATURE_GPU)`;
    const hl = (s) => s.split('\n').map((l) => GG.highlightLine(l, 'python')).join('\n');
    L.innerHTML = `<h4>scrape the text <span class="hsa-tag bad">not stable</span></h4><pre class="src">${hl(SCR)}</pre><div class="lines" data-l></div><div class="res" data-r></div>`;
    R.innerHTML = `<h4>ask NVML <span class="hsa-tag ok">stable C API</span></h4><pre class="src">${hl(NV)}</pre><div class="res ok" data-r></div>`;
    const linesEl = L.querySelector('[data-l]'), resL = L.querySelector('[data-r]'), resR = R.querySelector('[data-r]');
    const P = smiParse(SMI_LINES);
    const STAMP = 'Fri Oct  3 12:00:00 2025';
    function center() {
      const tok = linesEl.querySelector('.tok');
      if (!tok || linesEl.scrollWidth <= linesEl.clientWidth + 2) return;
      const pr = linesEl.getBoundingClientRect(), cr = tok.getBoundingClientRect();
      linesEl.scrollLeft = Math.max(0, linesEl.scrollLeft + (cr.left - pr.left) - pr.width / 2 + cr.width / 2);
    }
    function run(mode) {
      const real = mode === 'real';
      const lines = SMI_LINES.slice();
      if (real) lines.unshift(STAMP);
      const picked = lines[20] || '';
      const toks = picked.split(/\s+/).filter(Boolean);
      const val = toks[2] || '';
      let html = '';
      const from = real ? 0 : 17, to = 21;
      for (let i = from; i <= to; i++) {
        if (real && i === 2) { html += `<span class="ix">  ⋮</span>\n`; i = 17; }
        const ln = lines[i] || '';
        let body = esc(ln);
        if (i === 20) {
          const m = /^(\s*\S+\s+\S+\s+)(\S+)/.exec(ln);
          body = m ? esc(m[1]) + `<span class="tok">${esc(m[2])}</span>` + esc(ln.slice(m[0].length)) : esc(ln);
          body = `<span class="pick">${body}</span>`;
        } else if (real && i === 0) body = `<span class="new">${body}</span>`;
        html += `<span class="ix">[${String(i).padStart(2, ' ')}]</span> ${body}\n`;
      }
      linesEl.innerHTML = html.replace(/\n$/, '');
      linesEl.scrollLeft = 0;
      requestAnimationFrame(center);
      const ok = val === P.gpus[3].temp;
      resL.className = 'res ' + (ok ? 'ok' : 'bad');
      resL.textContent = `temp = '${val}'` + (ok ? '   ✓' : '   ✗ wrong field');
      resR.textContent = `temp = ${P.gpus[3].celsius}   ✓`;
      stS.set(`'${val}'`, ok ? 'core' : 'danger');
      f.setWhy(ok
        ? `On the glossary’s sample, line 20 is GPU 3’s second row and its third word is <code>${esc(val)}</code>, so the scraper looks right. NVML returns the number <b>${P.gpus[3].celsius}</b> directly.`
        : `On a real machine, nvidia-smi first prints the date and time. That one line shifts everything down: line 20 is now GPU 3’s <em>first</em> row, and its third word is <code>${esc(val)}</code>. The scraper silently returns the wrong field, and any change a driver update makes to the layout would do the same. The NVML call is unaffected, because NVML’s C API, unlike the text output, is a stable interface.`);
    }
    const stS = GG.ui.stat(f.readouts, { label: 'scraper reads', value: '' });
    GG.ui.stat(f.readouts, { label: 'NVML reads', value: String(P.gpus[3].celsius), tone: 'core' });
    GG.ui.seg(f.controls, { label: 'run the scraper on', value: 'sample', options: [{ value: 'sample', label: 'the glossary’s sample' }, { value: 'real', label: 'real output (date line first)' }], onChange: run });
    run('sample');
  }

  GG.entry('nvidia-smi', {
    render(body, ctx) {
      body.classList.add('hsa-body');
      const s = ctx.html(body, `
<p>The name stands for NVIDIA System Management Interface. Everything <code>nvidia-smi</code> prints or changes goes through ${T('nvml', 'NVML')}: it is that library’s command-line face. Its outputs, a sample of which appears below, are familiar to users of NVIDIA GPUs to the point of being a ${X('https://x.com/boborado/status/1752724223934578760', 'meme')}: running <code>nvidia-smi</code> is the first thing many people do on a new GPU machine, and the second, third and fourth thing when something seems wrong.</p>
<p>The sample below comes from a machine with eight NVIDIA B200 GPUs, all idle. Every field in it is explained in Fig. 1.</p>
<div data-slot="table" class="wide"></div>
<h3>What it reports</h3>
<p><code>nvidia-smi</code> reports the following:</p>
<ul>
<li><b>GPU identity information</b> like the card’s model name, a UUID, and the PCI ID. In the table: <code>Name</code>, the index in the <code>GPU</code> column and the PCI <code>Bus-Id</code>; the UUID and the PCI vendor and device IDs appear in the longer <code>-q</code> report.</li>
<li><b>live utilization metrics</b> for kernel execution time and memory allocation: <code>GPU-Util</code> and <code>Memory-Usage</code>.</li>
<li><b>live power and thermal information</b>: <code>Pwr:Usage/Cap</code>, <code>Temp</code>, the performance state <code>Perf</code> and the <code>Fan</code>.</li>
</ul>
<p>For details on these metrics, including how to interpret power and thermal readings, see ${X('https://modal.com/docs/guide/gpu-metrics', 'this page on the Modal docs')}.</p>
${GG.noteHTML('warn', '<p><b>100% GPU-Util does not mean the GPU is fully used.</b> The number is the fraction of time at least one kernel was running. A kernel that keeps a single SM busy while all the others on the chip sit idle still counts as 100%. Power draw, and profilers that look inside the SMs, tell you much more about how hard the GPU is actually working.</p>')}
<h3>Processes and management</h3>
<p><code>nvidia-smi</code> can also list processes currently using the GPU (<code>-q</code>, <code>--query</code>, <code>pmon</code>). Common management tasks include setting persistence mode (<code>-pm</code>), compute mode (<code>-c</code>), power limits (<code>-pl</code>), application/locked clocks (<code>-ac</code>, <code>-lgc</code>, <code>-lmc</code>), and performing GPU resets (<code>-r</code>).</p>
<div data-slot="flags" class="wide"></div>
${GG.noteHTML('aside', '<p>The full table that <code>nvidia-smi</code> prints by default ends with a second table, <em>Processes</em>, listing every process using each GPU and how much memory it holds. It is left out of the glossary’s sample, where no process is running.</p>')}
<h3>Text for people, NVML for programs</h3>
<p>Output can be formatted as human-readable text or XML (<code>-x</code>). While <code>nvidia-smi</code>’s text output format is not guaranteed to be stable, the underlying ${T('nvml', 'NVML C library')} offers a stable API for tool development. A program that parses the text table can break when a driver update rearranges it; a program that calls NVML keeps working.</p>
<div data-slot="scrape" class="wide"></div>
${GG.noteHTML('beyond', '<p>For quick shell scripts, nvidia-smi also has a mode designed for machine reading: <code>nvidia-smi --query-gpu=index,temperature.gpu,power.draw --format=csv</code> prints just the fields you name, as CSV. <code>nvidia-smi --help-query-gpu</code> lists the available fields.</p>')}
<p>The documentation for <code>nvidia-smi</code> can be found ${X('https://docs.nvidia.com/deploy/nvidia-smi/', 'here')}, and the official Python bindings can be found ${X('http://pypi.python.org/pypi/nvidia-ml-py/', 'here')}.</p>
<div data-slot="read"></div>`);
      guard(s.table, 'nvidia-smi table', () => smiTableFig(s.table, ctx));
      guard(s.flags, 'nvidia-smi flags', () => smiFlagsFig(s.flags, ctx));
      guard(s.scrape, 'Scraping vs NVML', () => smiScrapeFig(s.scrape, ctx));
      ctx.reading(s.read, [
        { href: 'https://docs.nvidia.com/deploy/nvidia-smi/', label: 'nvidia-smi documentation', note: 'every field and flag, from NVIDIA' },
        { href: 'http://pypi.python.org/pypi/nvidia-ml-py/', label: 'nvidia-ml-py on PyPI', note: 'the official Python bindings to NVML' },
        { href: 'https://modal.com/docs/guide/gpu-metrics', label: 'Modal docs: GPU metrics', note: 'how to interpret power and thermal readings' },
        { href: 'https://x.com/boborado/status/1752724223934578760', label: 'The nvidia-smi meme', note: 'how familiar this output is' },
      ]);
    },
  });

  /* ═════════════════════════════ cuda-runtime-api ═════════════════════════════ */

  GG.css(`
.hsa-lz .lane { fill: rgba(255, 255, 255, 0.015); stroke: var(--line); stroke-width: 1; }
.hsa-lz .lane.app { fill: rgba(184, 164, 255, 0.05); stroke: rgba(184, 164, 255, 0.35); }
.hsa-lz .lane.dr { stroke-dasharray: 5 4; stroke: var(--line-2); }
.hsa-lz .lh { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; fill: var(--ink-2); }
.hsa-lz .lh.app { fill: var(--host); }
.hsa-lz .lsub { font-size: 10px; fill: var(--ink-3); }
.hsa-lz .bx { fill: var(--surface-2); stroke: var(--line-2); stroke-width: 1.2; transition: opacity 0.25s, stroke 0.25s, fill 0.25s; }
.hsa-lz .bx.app { stroke: rgba(184, 164, 255, 0.6); }
.hsa-lz .bx.on { fill: #2a2542; stroke: var(--accent); stroke-width: 1.8; }
.hsa-lz .bt { font-size: 12px; font-weight: 600; fill: var(--ink); }
.hsa-lz .bt.sm { font-size: 10px; }
.hsa-lz .bn { font-size: 10px; font-weight: 600; fill: var(--ink-3); }
.hsa-lz .bd { font-size: 10.5px; fill: var(--ink-3); }
.hsa-lz .fut { opacity: 0.35; }
.hsa-lz .hop { fill: none; stroke: var(--ink-3); stroke-width: 1.3; stroke-dasharray: 3 3; }
.hsa-lz .hop.done { stroke: var(--control); stroke-width: 1.8; stroke-dasharray: none; }
.hsa-lz .ax { stroke: var(--ink-3); stroke-width: 1; }
.hsa-lz .axl { font-size: 10px; fill: var(--ink-3); }
.hsa-lz .over { fill: url(#hsa-lz-hatch); stroke: rgba(255, 198, 92, 0.45); stroke-width: 1; stroke-dasharray: 4 3; }
.hsa-lz .overl { font-size: 11px; fill: var(--control); font-weight: 600; }
.hsa-lz .overs { font-size: 10px; fill: var(--ink-2); }
.hsa-ctxs { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr); gap: 14px; align-items: start; }
.hsa-ctxs.one { grid-template-columns: minmax(0, 1fr); }
.hsa-ctxs h4 { margin: 0 0 8px; font: 600 10.5px/1.3 var(--font-mono); letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-3); }
.hsa-ctxs h4 + * { margin-top: 0; }
.hsa-thr { border: 1px solid rgba(184, 164, 255, 0.4); border-radius: 10px; padding: 8px 10px; background: rgba(184, 164, 255, 0.04); margin-bottom: 8px; }
.hsa-thr b { font: 600 12.5px var(--font-mono); color: var(--host); }
.hsa-thr .stk { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 6px; align-items: center; font: 500 11px var(--font-mono); color: var(--ink-3); }
.hsa-dev { border: 1px solid rgba(69, 212, 155, 0.35); border-radius: 10px; padding: 8px 10px; background: rgba(69, 212, 155, 0.035); margin-bottom: 8px; }
.hsa-dev b { font: 600 12.5px var(--font-mono); color: var(--core); }
.hsa-dev .cl { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 6px; }
.hsa-cx { font: 600 11px/1 var(--font-mono); padding: 5px 7px 4px; border-radius: 6px; border: 1px solid; white-space: nowrap; }
.hsa-cx.p0, .hsa-cx.p1 { color: var(--ink); border-color: var(--ink-3); background: rgba(236, 238, 246, 0.06); }
.hsa-cx.x0, .hsa-cx.x1 { color: var(--ink-2); border-color: var(--ink-3); border-style: dashed; background: transparent; }
.hsa-cx.cur { box-shadow: 0 0 0 1.5px var(--accent); }
.hsa-cx.cur::after { content: " ◂ current"; color: var(--accent-2); font-weight: 500; }
.hsa-dev .hsa-cx.cur::after { content: none; }
.hsa-ctxl { margin-top: 4px; font-size: 13px; line-height: 1.5; color: var(--ink-2); }
`);

  function runtimeStackFig(host, ctx) {
    const C = {
      malloc: { label: 'cudaMalloc', tags: { runtime: 'cudaMalloc', 'driver-api': 'cuMemAlloc' }, rt: 'cudaMalloc', dr: 'cuMemAlloc' },
      memcpy: { label: 'cudaMemcpy', tags: { runtime: 'cudaMemcpy', 'driver-api': 'cuMemcpyHtoD' }, rt: 'cudaMemcpy(…, cudaMemcpyHostToDevice)', dr: 'cuMemcpyHtoD' },
      launch: { label: '<<<…>>>', tags: { apps: 'block_sum<<<…>>>', runtime: 'cudaLaunchKernel', 'driver-api': 'cuLaunchKernel' }, rt: 'cudaLaunchKernel (what nvcc turns <<<…>>> into)', dr: 'cuLaunchKernel' },
      free: { label: 'cudaFree', tags: { runtime: 'cudaFree', 'driver-api': 'cuMemFree' }, rt: 'cudaFree', dr: 'cuMemFree' },
    };
    const say = (k) => ({
      apps: `Your program calls the Runtime API: <code>${esc(C[k].rt)}</code>.`,
      runtime: 'The <b>Runtime API</b> is a wrapper: it makes sure CUDA is set up in this process, then calls into the layer below.',
      'driver-api': `In the <b>Driver API</b> the same job is <code>${esc(C[k].dr)}</code>, which does the actual work.`,
      driver: 'The NVIDIA GPU Driver carries it out on the device.',
      gpu: 'Done, through both layers.',
    });
    const { f, tk } = toolkitFig(host, ctx, {
      title: 'The Runtime API wraps the Driver API',
      hint: 'pick a call · send it',
      wide: true,
      caption: `As the glossary’s caption puts it, the CUDA Runtime API wraps the CUDA Driver API to make it more amenable to application programming. Redrawn from its figure (adapted from ${PROF_CUDA}). The packet shows each call’s Runtime name and the Driver API function that does the same job. The Runtime is closed source, so this is the correspondence, not a trace of its internals.`,
    }, { files: true, highlight: 'runtime', animateCall: { path: 'app-runtime-driver-gpu', tags: C.malloc.tags, say: say('malloc') } });
    if (!tk) return;
    const stR = GG.ui.stat(f.readouts, { label: 'runtime call', value: '', tone: 'host' });
    const stD = GG.ui.stat(f.readouts, { label: 'driver API equivalent', value: '' });
    function set(k, send) {
      stR.set(C[k].tags.runtime);
      stD.set(C[k].dr);
      f.setWhy(`<code>${esc(C[k].rt)}</code> in the Runtime API corresponds to <code>${esc(C[k].dr)}</code> in the Driver API: same function, friendlier wrapper.`);
      if (send) tk.call('app-runtime-driver-gpu', { tags: C[k].tags, say: say(k) });
    }
    GG.ui.seg(f.controls, { label: 'call', value: 'malloc', options: Object.keys(C).map((k) => ({ value: k, label: C[k].label })), onChange: (k) => set(k, true) });
    set('malloc', false);
  }

  function lazyInitFig(host, ctx) {
    const f = ctx.figure(host, {
      title: 'What a first call does',
      hint: 'step through · compare with a later call',
      wide: true,
      caption: 'The work hidden behind a program’s very first Runtime API call, shown as the Driver API steps it is equivalent to (the Runtime’s exact internals are not public). Each lane is a layer; amber arrows show which layer is working at each step, in time order from top to bottom (not to scale). Later calls skip straight to the useful work. The Driver API version of the same program has to write every one of these steps itself (Fig. 2 of the CUDA Driver API entry).',
    });
    const S0 = [
      { lay: 'app', b: 'cudaMalloc(&d_x, bytes)', d: 'the program’s first CUDA call', dLater: 'a later CUDA call, same program', first: true, later: true, why: 'The program makes its first CUDA call. It never initialized anything: the Runtime API has no “init” function you must call.' },
      { lay: 'rt', b: 'load libcuda.so.1', d: 'find the Driver API, installed with the driver', first: true, why: 'The Runtime has not talked to the driver yet in this process, so it loads the Driver API library, <code>libcuda.so</code>.' },
      { lay: 'dr', b: 'cuInit(0)', d: 'initialize the Driver API', first: true, why: 'It initializes the Driver API, which discovers the GPUs.' },
      { lay: 'rt', b: 'choose the current device', d: 'device 0, unless cudaSetDevice picked another', first: true, why: 'It picks the <em>current device</em>: device 0 unless the program called <code>cudaSetDevice</code> first.' },
      { lay: 'dr', b: 'cuDevicePrimaryCtxRetain', d: 'set up that device’s primary context and make it current', first: true, why: 'It creates the device’s <b>primary context</b>, the per-process GPU state that memory and launches belong to, and makes it current. This is often the slowest step.' },
      { lay: 'rt', b: 'load the program’s GPU code', d: 'the kernels nvcc embedded in the executable', first: true, why: 'It makes the GPU code that nvcc embedded in the executable available in the new context, so that <code>&lt;&lt;&lt;&gt;&gt;&gt;</code> launches find their kernels. (Recent CUDA versions do this lazily, loading each kernel the first time it is launched.)' },
      { lay: 'dr', b: 'cuMemAlloc(&d_x, bytes)', d: 'the work that was actually asked for', first: true, later: true, why: 'Only now does the requested work happen: the Driver API allocation.' },
    ];
    const SHORT = ['cudaMalloc', 'load libcuda', 'cuInit(0)', 'pick device', 'primary ctx', 'load GPU code', 'cuMemAlloc'];
    const LANES = ['app', 'rt', 'dr'];
    const LAY = { app: 'your program', rt: 'Runtime API', dr: 'Driver API' };
    const LSUB = { app: 'your code', rt: 'libcudart', dr: 'libcuda.so' };
    const holder = el('div', { class: 'hsa-w' });
    f.stage.append(holder);
    const st = { mode: 'first', i: 0, narrow: null };
    const stN = GG.ui.stat(f.readouts, { label: 'steps in this call', value: '' });
    const stI = GG.ui.stat(f.readouts, { label: 'hidden set-up steps', value: '' });
    function list() { return S0.map((x, i) => i).filter((i) => st.mode === 'first' || S0[i].later); }
    /* Split a description into at most two lines of n characters. */
    function wrap2(t, n) {
      if (t.length <= n) return [t];
      let k = t.lastIndexOf(' ', n);
      if (k < 1) k = n;
      const b = t.slice(k + 1);
      return [t.slice(0, k), b.length > n ? b.slice(0, n - 1) + '…' : b];
    }
    function render() {
      const L = list();
      const k = L[Math.min(st.i, L.length - 1)];
      const nw = st.narrow;
      const W = nw ? 340 : 760, ax = nw ? 0 : 46, top = 44, pitch = nw ? 44 : 50, bh = 30;
      const lw = (W - ax) / 3;
      const lx = (lay) => ax + LANES.indexOf(lay) * lw;
      const later = st.mode === 'later';
      const overH = 46;   // the shaded band standing in for the skipped set-up
      // row y for each listed step: the later call keeps row 1, then the overhead band, then cuMemAlloc
      const ys = {};
      L.forEach((i, j) => { ys[i] = top + 8 + (later && j > 0 ? pitch + overH : j * pitch); });
      const bottom = Math.max(...Object.values(ys)) + bh;
      const H = bottom + 16;
      holder.innerHTML = '';
      const svg = svgRoot(holder, W, H, later
        ? 'Swimlanes for a later Runtime API call: cudaMalloc in your program goes straight to cuMemAlloc in the Driver API; the set-up steps are skipped.'
        : 'Swimlanes for the first Runtime API call: cudaMalloc in your program, then the Runtime loads libcuda, the Driver API runs cuInit, the Runtime picks a device, the Driver API retains the primary context, the Runtime loads the GPU code, and the Driver API finally runs cuMemAlloc.', 'hsa-lz');
      const defs = S('defs', null, svg);
      [['hsa-lz-ah', 'var(--ink-3)'], ['hsa-lz-ahc', 'var(--control)']].forEach(([id, c]) => {
        const m = S('marker', { id, viewBox: '0 0 8 8', refX: 7, refY: 4, markerWidth: 6, markerHeight: 6, orient: 'auto' }, defs);
        S('path', { d: 'M0 0L8 4L0 8z', fill: c }, m);
      });
      const pat = S('pattern', { id: 'hsa-lz-hatch', width: 7, height: 7, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
      S('rect', { width: 7, height: 7, fill: 'rgba(255,198,92,0.05)' }, pat);
      S('line', { x1: 0, y1: 0, x2: 0, y2: 7, stroke: 'rgba(255,198,92,0.3)', 'stroke-width': 2 }, pat);
      // lanes
      LANES.forEach((lay) => {
        const x = lx(lay);
        S('rect', { x: r2(x + 3), y: 2, width: r2(lw - 6), height: H - 4, rx: 9, class: 'lane ' + lay }, svg);
        txt(svg, x + 12, 19, nw ? LAY[lay].replace(' API', '') : LAY[lay].toUpperCase(), { class: 'lh ' + lay });
        txt(svg, x + 12, 33, LSUB[lay], { class: 'lsub' });
      });
      // time axis (wide only; on phones the row order carries it)
      if (!nw) {
        S('line', { x1: 22, y1: top + 6, x2: 22, y2: bottom, class: 'ax', 'marker-end': 'url(#hsa-lz-ah)' }, svg);
        txt(svg, 4, top - 2, 'time', { class: 'axl' });
      }
      // overhead band: what a later call no longer pays
      if (later) {
        const y = ys[L[0]] + bh + 8;
        S('rect', { x: r2(ax + 10), y, width: r2(W - ax - 20), height: overH - 16 + pitch - bh - 8, rx: 6, class: 'over' }, svg);
        txt(svg, ax + 20, y + 16, nw ? 'set-up skipped (steps 2 to 6)' : 'set-up skipped: steps 2 to 6 were done once, by the first call', { class: 'overl hsa-halo' });
        txt(svg, ax + 20, y + 31, nw ? 'already initialized, context current' : 'CUDA is initialized and the device’s primary context is current', { class: 'overs hsa-halo' });
      }
      // hops between consecutive steps, then the boxes on top
      const cx = (i) => lx(S0[i].lay) + lw / 2;
      L.forEach((i, j) => {
        if (!j) return;
        const a = L[j - 1];
        const x1 = cx(a), y1 = ys[a] + bh, x2 = cx(i), y2 = ys[i] - 2;
        const done = j <= L.indexOf(k);
        const mid = later ? y1 + 8 : (y1 + y2) / 2;
        S('path', { d: `M${r2(x1)} ${y1}V${r2(mid)}H${r2(x2)}V${r2(y2)}`, class: 'hop' + (done ? ' done' : ''), 'marker-end': `url(#${done ? 'hsa-lz-ahc' : 'hsa-lz-ah'})` }, svg);
      });
      L.forEach((i, j) => {
        const x = S0[i];
        const bx = lx(x.lay) + (nw ? 6 : 10), bw = lw - (nw ? 12 : 20), y = ys[i];
        const g = S('g', { class: j > L.indexOf(k) ? 'fut' : null }, svg);
        S('rect', { x: r2(bx), y, width: r2(bw), height: bh, rx: 6, class: 'bx ' + x.lay + (i === k ? ' on' : '') }, g);
        txt(g, bx + (nw ? 5 : 8), y + 19, String(i + 1), { class: 'bn' });
        txt(g, bx + (nw ? 16 : 22), y + 19.5, nw ? SHORT[i] : x.b, { class: 'bt' + (nw ? ' sm' : '') });
        if (!nw) {
          // the description sits in an empty lane of the same row: right of your program, left of the others
          const d = later && x.dLater ? x.dLater : x.d;
          const right = x.lay === 'app';
          const lines = wrap2(d, right ? 60 : 34);
          lines.forEach((t, n) => txt(g, right ? bx + bw + 20 : bx - 18, y + (lines.length === 1 ? 19 : 12 + n * 13), t, { class: 'bd', 'text-anchor': right ? 'start' : 'end' }));
        }
      });
      stN.set(String(L.length));
      stI.set(String(L.length - 2), st.mode === 'first' ? 'control' : 'core');
      const lead = nw ? `<code>${esc(S0[k].b)}</code> · ` : '';   /* phones show short box labels: name the full call */
      f.setWhy(st.mode === 'later' && k !== 0 ? lead + 'A <b>later call</b>: CUDA is already initialized and the context is current, so the Runtime goes straight to the Driver API allocation.' : st.mode === 'later' ? lead + 'A <b>later call</b> in the same program.' : lead + S0[k].why);
    }
    onWidth(holder, (w) => { const nw = w < 600; if (nw !== st.narrow) { st.narrow = nw; render(); } });
    let stepper = null;
    function mkStepper() {
      if (stepper) stepper.el.remove();
      st.i = 0;
      stepper = GG.ui.stepper(f.controls, { label: 'Step', steps: list().map((i) => ({ label: S0[i].b })), autoplay: 1700, onStep: (i) => { st.i = i; render(); } });
    }
    GG.ui.seg(f.controls, { label: 'which call', value: 'first', options: [{ value: 'first', label: 'the first call' }, { value: 'later', label: 'a later call' }], onChange: (v) => { st.mode = v; mkStepper(); render(); } });
    mkStepper();
    st.narrow = (f.stage.getBoundingClientRect().width || 700) < 600;
    render();
  }

  function contextsFig(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Context management: implicit or explicit',
      hint: 'switch the API',
      wide: true,
      caption: 'One process with two host threads on a machine with two GPUs. A <em>context</em> is the GPU-side state a process works in: its memory allocations, loaded kernels and streams all belong to one. Solid chips are primary contexts, dashed chips extra contexts the program created; the outlined chip is each thread’s current context. With the Driver API selected, step thread A through a push and a pop.',
    });
    const box = el('div', { class: 'hsa-ctxs' });
    f.stage.append(box);
    onWidth(box, (w) => box.classList.toggle('one', w < 620));
    const M = {
      rt: {
        thr: [{ n: 'thread A', code: 'cudaSetDevice(0)', stack: [['p0', 'primary · GPU 0']] }, { n: 'thread B', code: 'cudaSetDevice(1)', stack: [['p1', 'primary · GPU 1']] }],
        dev: [{ n: 'GPU 0', cx: [['p0', 'primary']] }, { n: 'GPU 1', cx: [['p1', 'primary']] }],
        txt: 'The Runtime API keeps it simple: <b>one primary context per GPU per process</b>, created for you and shared by every thread. A thread only chooses which GPU it is talking to, with <code>cudaSetDevice</code>. Memory allocated by thread A on GPU 0 is visible to any thread using GPU 0.',
        why: '<b>Runtime API.</b> Contexts are managed for you: one per GPU, shared by all threads. Simple, and right for almost every program.',
      },
      dr: {
        thr: [{ n: 'thread A', code: 'cuCtxPushCurrent(ctxX)', stack: [['p0', 'primary · GPU 0'], ['x0', 'ctx X · GPU 0']] }, { n: 'thread B', code: 'cuCtxSetCurrent(ctxY)', stack: [['x1', 'ctx Y · GPU 1']] }],
        steps: [
          { label: 'start', code: '// GPU 0’s primary context is current', stack: [['p0', 'primary · GPU 0']], why: '<b>Driver API, thread A.</b> It starts with GPU 0’s primary context current: the bottom of its context stack.' },
          { label: 'push', code: 'cuCtxPushCurrent(ctxX)', stack: [['p0', 'primary · GPU 0'], ['x0', 'ctx X · GPU 0']], why: '<b>Push.</b> <code>cuCtxPushCurrent(ctxX)</code> puts ctx X on top of thread A’s stack. Everything thread A does now, allocations and launches, belongs to ctx X, kept apart from the primary context’s.' },
          { label: 'pop', code: 'cuCtxPopCurrent(&ctx)', stack: [['p0', 'primary · GPU 0']], why: '<b>Pop.</b> <code>cuCtxPopCurrent</code> takes ctx X off the stack again (ctx X itself lives on, until <code>cuCtxDestroy</code>), and the context underneath, the primary one, is current once more.' },
        ],
        dev: [{ n: 'GPU 0', cx: [['p0', 'primary'], ['x0', 'ctx X']] }, { n: 'GPU 1', cx: [['p1', 'primary'], ['x1', 'ctx Y']] }],
        txt: 'The Driver API hands you the controls: you can create <b>additional contexts</b> on a GPU, each with its own separate memory and kernels, and each thread keeps a <b>stack</b> of current contexts that it pushes and pops. Contexts on the same GPU are kept apart from each other, much like separate processes.',
        why: '<b>Driver API.</b> Contexts are explicit objects: create several per GPU, switch between them per thread, push and pop. More control, more to manage.',
      },
    };
    const L = el('div', { class: 'hsa-w' }), R = el('div', { class: 'hsa-w' });
    box.append(L, R);
    const txt2 = el('p', { class: 'hsa-ctxl' });
    f.stage.append(txt2);
    const stN = GG.ui.stat(f.readouts, { label: 'contexts in the process', value: '' });
    const stW = GG.ui.stat(f.readouts, { label: 'who creates them', value: '' });
    const stC = GG.ui.stat(f.readouts, { label: 'thread A’s current context', value: '' });
    let api = 'rt', stepI = 1;
    function set(k) {
      api = k;
      stepper.el.style.display = k === 'dr' ? '' : 'none';
      const m = Object.assign({}, M[k]);
      if (k === 'dr') {
        const S2 = M.dr.steps[stepI];
        m.thr = [{ n: 'thread A', code: S2.code, stack: S2.stack }, M.dr.thr[1]];
        m.why = S2.why;
      }
      const chip = ([c, t], cur) => `<span class="hsa-cx ${c}${cur ? ' cur' : ''}">${esc(t)}</span>`;
      L.innerHTML = '<h4>host threads (CPU)</h4>' + m.thr.map((t) => `<div class="hsa-thr"><b>${t.n}</b> <code>${esc(t.code)}</code><div class="stk">current: ${t.stack.map((s, i) => chip(s, i === t.stack.length - 1)).join('')}${t.stack.length > 1 ? ' <span>(top of its stack)</span>' : ''}</div></div>`).join('');
      R.innerHTML = '<h4>devices (GPU) and their contexts</h4>' + m.dev.map((d) => `<div class="hsa-dev"><b>${d.n}</b><div class="cl">${d.cx.map((c) => chip(c, false)).join('')}</div></div>`).join('');
      txt2.innerHTML = m.txt;
      stN.set(String(m.dev.reduce((a, d) => a + d.cx.length, 0)));
      stW.set(k === 'rt' ? 'the Runtime' : 'your code');
      const a = m.thr[0].stack;
      stC.set(a[a.length - 1][1]);
      f.setWhy(m.why);
    }
    GG.ui.seg(f.controls, { label: 'API', value: 'rt', options: [{ value: 'rt', label: 'Runtime API' }, { value: 'dr', label: 'Driver API' }], onChange: set });
    const stepper = GG.ui.stepper(f.controls, { label: 'thread A’s stack', steps: M.dr.steps, start: 1, onStep: (i) => { stepI = i; if (api === 'dr') set('dr'); } });
    set('rt');
  }

  GG.entry('cuda-runtime-api', {
    render(body, ctx) {
      body.classList.add('hsa-body');
      const s = ctx.html(body, `
<p>The <strong>CUDA Runtime API</strong>’s functions are named <code>cuda…</code> where those of the ${T('cuda-driver-api', 'CUDA Driver API')} underneath it are named <code>cu…</code>: <code>cudaMalloc</code> for <code>cuMemAlloc</code>, <code>cudaFree</code> for <code>cuMemFree</code>. The kernel-launch syntax of ${T('cuda-c', 'CUDA C++')}, <code>&lt;&lt;&lt;&gt;&gt;&gt;</code>, is built on it too: ${T('nvcc', 'nvcc')} turns each launch into Runtime API calls.</p>
<div data-slot="stack" class="wide"></div>
<h3>Better ergonomics</h3>
<p>It is generally preferred over the Driver API for better ergonomics. The difference is mostly what you do <em>not</em> have to write. There is no initialization call, no context to create, and no module of GPU code to load: the Runtime does all of that by itself, the first time the program uses it. Fig. 2 opens up that first call.</p>
<div data-slot="init" class="wide"></div>
${GG.noteHTML('beyond', '<p>Because the first call pays for all the set-up, it can take far longer than later ones. Programs that time their GPU work often make a throwaway call first, traditionally <code>cudaFree(0)</code>, so that the set-up cost is not counted against the first real operation.</p>')}
<h3>The caveats: launches and contexts</h3>
<p>There are some small caveats around control of kernel launches and context management. See ${X('https://docs.nvidia.com/cuda/cuda-runtime-api/driver-vs-runtime-api.html#driver-vs-runtime-api', 'this section')} of the CUDA Runtime API docs for more.</p>
<p><b>Context management.</b> The Runtime gives each process one context per GPU (Fig. 3); the Driver API lets you create, share and switch contexts explicitly. The two interoperate: the Runtime’s contexts are the Driver API’s <em>primary</em> contexts, so code using both APIs can share them.</p>
<div data-slot="ctx" class="wide"></div>
<p><b>Kernel launches.</b> With the Runtime, kernels are normally compiled into the program and launched with <code>&lt;&lt;&lt;&gt;&gt;&gt;</code>. The Driver API lets a program decide when GPU code is loaded and unloaded, load it from memory at run time (for example straight from ${T('nvrtc', 'NVRTC')}), and launch kernels through handles with explicitly packed arguments. Newer Runtime versions have added some of these abilities, which is part of why the caveats are small.</p>
<h3>Linking: static or dynamic</h3>
<p>While the Runtime API may be statically linked, per ${X('https://docs.nvidia.com/cuda/eula/index.html#attachment-a', 'Attachment A of the NVIDIA CUDA Toolkit EULA')}, it does not have to be. Statically linking means copying the library’s code into your executable; Attachment A lists the parts of the CUDA Toolkit that you may redistribute with your application, which includes the static Runtime library. The shared object file for dynamic linking is usually named ${T('libcudart', 'libcudart.so')} on Linux systems.</p>
${GG.noteHTML('beyond', '<p>Static is nvcc’s default: <code>nvcc -o app app.cu</code> links the static Runtime (<code>libcudart_static.a</code>) into <code>app</code>. Passing <code>-cudart shared</code> links against <code>libcudart.so</code> instead. Either way, the Driver API underneath is always loaded dynamically, from the driver.</p>')}
<h3>Closed source</h3>
<p>The CUDA Runtime API is closed source. You can find its documentation ${X('https://docs.nvidia.com/cuda/cuda-runtime-api/index.html', 'here')}.</p>
<div data-slot="read"></div>`);
      guard(s.stack, 'Toolkit stack', () => runtimeStackFig(s.stack, ctx));
      guard(s.init, 'First call', () => lazyInitFig(s.init, ctx));
      guard(s.ctx, 'Contexts', () => contextsFig(s.ctx, ctx));
      ctx.reading(s.read, [
        { href: 'https://docs.nvidia.com/cuda/cuda-runtime-api/index.html', label: 'CUDA Runtime API reference', note: 'NVIDIA’s documentation for every cuda… function' },
        { href: 'https://docs.nvidia.com/cuda/cuda-runtime-api/driver-vs-runtime-api.html#driver-vs-runtime-api', label: 'Difference between the driver and runtime APIs', note: 'the docs section the glossary points to' },
        { href: 'https://docs.nvidia.com/cuda/eula/index.html#attachment-a', label: 'NVIDIA CUDA Toolkit EULA, Attachment A', note: 'which toolkit files may be redistributed, including the static Runtime' },
      ]);
    },
  });

  /* ═════════════════════════════ libcudart ═════════════════════════════ */

  GG.css(`
.hsa-proc { flex: 1.6 1 0; min-width: 0; border: 1px solid rgba(184, 164, 255, 0.45); border-radius: 12px; padding: 8px 10px 10px; background: rgba(184, 164, 255, 0.04); }
.hsa-proc > .hsa-k { margin-bottom: 6px; }
.hsa-proc .in { display: flex; flex-wrap: wrap; gap: 6px; }
.hsa-proc .pc { flex: 1 1 120px; min-width: 0; border-radius: 9px; border: 1px solid var(--line-2); background: var(--surface-2); padding: 6px 9px 7px; }
.hsa-proc .pc b { display: block; font: 600 12px/1.35 var(--font-mono); color: var(--ink); overflow-wrap: anywhere; }
.hsa-proc .pc span { display: block; font-size: 11.5px; line-height: 1.35; color: var(--ink-3); margin-top: 2px; }
.hsa-proc .pc.rt { border-color: var(--host); background: rgba(184, 164, 255, 0.12); }
.hsa-cn.rt { border-color: var(--host); background: rgba(184, 164, 255, 0.12); }
.hsa-ca.lab { width: 74px; flex-direction: column; font-size: 10px; line-height: 1.25; text-align: center; gap: 2px; }
.hsa-chain.col .hsa-ca.lab { width: auto; height: auto; padding: 4px 0; flex-direction: row; gap: 6px; }
`);

  function linkModesFig(host, ctx) {
    const f = ctx.figure(host, {
      title: 'Static or dynamic libcudart',
      hint: 'switch the linking mode',
      wide: true,
      caption: 'Where the Runtime API’s code lives in three typical setups on Linux (file paths vary by installation; <code>ldd</code> output abridged). The PyTorch setup is a CUDA 12 build; PyTorch’s CUDA 13 builds load <code>libcudart.so.13</code> instead. The Driver API, <code>libcuda.so</code>, is dynamic in every case, because it comes with the driver.',
    });
    const chain = el('div', { class: 'hsa-chain' });
    f.stage.append(chain);
    onWidth(chain, (w) => { chain.classList.toggle('col', w < 720); draw(); });
    const term = el('pre', { class: 'hsa-term' });
    f.stage.append(el('div', { style: 'margin-top:12px' }, term));
    const M = {
      st: {
        label: 'deployed binary: static',
        proc: { k: 'the executable file ./app', pcs: [['', 'your code', 'main(), the kernel launches'], ['rt', 'libcudart_static.a', 'the Runtime API, copied in when nvcc linked the program']] },
        mid: null,
        cmd: ['nvcc -o app app.cu', 'ldd ./app | grep cudart'], out: '<span class="note-c"># (no output: the Runtime is inside ./app)</span>',
        copies: '1, inside the program', ship: 'just ./app', upg: 'rebuild needed',
        why: '<b>Static linking</b>, nvcc’s default. The Runtime’s code is copied into the executable, so deploying the program means copying one file. The target machine needs only the NVIDIA driver, not the CUDA Toolkit. The cost: a bigger executable, and a Runtime fixed at the version it was built with.',
      },
      dy: {
        label: 'same binary: dynamic',
        proc: { k: 'the executable file ./app', pcs: [['', 'your code', 'main(), the kernel launches']] },
        mid: { cls: 'rt', k: 'from the CUDA Toolkit', b: 'libcudart.so.13', d: 'found by the loader when the program starts' },
        cmd: ['nvcc -cudart shared -o app app.cu', 'ldd ./app | grep cudart'], out: '\tlibcudart.so.13 =&gt; /usr/local/cuda/lib64/libcudart.so.13 (0x…)',
        copies: '1, a shared file', ship: './app + libcudart.so.13', upg: 'swap the file',
        why: '<b>Dynamic linking.</b> The executable only records that it needs <code>libcudart.so.13</code> (the 13 is the CUDA major version). The loader finds it at start-up, so it must be installed, or shipped, wherever the program runs.',
      },
      pt: {
        label: 'PyTorch: dynamic',
        proc: { k: 'a Python process running PyTorch', pcs: [['', 'libtorch_cuda.so', 'PyTorch’s CUDA code'], ['', 'libcublas.so.12', 'matrix multiplications'], ['', 'libcudnn.so.9', 'neural-network kernels']] },
        mid: { cls: 'rt', k: 'from a pip package', b: 'libcudart.so.12', d: 'nvidia-cuda-runtime-cu12, a dependency of PyTorch’s CUDA 12 builds' },
        cmd: ['pip install torch --index-url https://download.pytorch.org/whl/cu128', 'ls site-packages/nvidia/cuda_runtime/lib/'], out: 'libcudart.so.12',
        copies: '1, shared by the process', ship: 'pip packages', upg: 'upgrade the package',
        why: '<b>Frameworks load it dynamically.</b> A framework like PyTorch is itself a set of shared libraries built on the CUDA Toolkit. They load one shared <code>libcudart.so</code>, so the whole process uses a single copy of the Runtime, at a version that matches the other CUDA libraries the framework ships with.',
      },
    };
    let cur = 'st';
    const stC = GG.ui.stat(f.readouts, { label: 'copies of the runtime', value: '' });
    const stS = GG.ui.stat(f.readouts, { label: 'to deploy', value: '' });
    const stU = GG.ui.stat(f.readouts, { label: 'newer runtime', value: '' });
    function draw() {
      const m = M[cur];
      const col = chain.classList.contains('col');
      const arrow = (t) => `<div class="hsa-ca lab" aria-hidden="true"><span>${col ? '↓' : '→'}</span><span>${t}</span></div>`;
      let html = `<div class="hsa-proc"><div class="hsa-k">${esc(m.proc.k)}</div><div class="in">${m.proc.pcs.map(([c, b, d]) => `<div class="pc ${c}"><b>${esc(b)}</b><span>${esc(d)}</span></div>`).join('')}</div></div>`;
      if (m.mid) html += arrow('at start-up') + `<div class="hsa-cn ${m.mid.cls}"><div class="hsa-k">${esc(m.mid.k)}</div><b>${esc(m.mid.b)}</b><span class="d">${esc(m.mid.d)}</span></div>` + arrow('first CUDA call');
      else html += arrow('first CUDA call');
      html += '<div class="hsa-cn"><div class="hsa-k">from the NVIDIA driver</div><b>libcuda.so.1</b><span class="d">the Driver API, always dynamic</span></div>';
      chain.innerHTML = html;
      term.innerHTML = m.cmd.map((c) => `<span class="p">$</span> <span class="c">${esc(c)}</span>`).join('\n') + '\n' + m.out;
      stC.set(m.copies, 'host');
      stS.set(m.ship);
      stU.set(m.upg, cur === 'st' ? 'control' : 'core');
      f.setWhy(m.why);
    }
    GG.ui.seg(f.controls, { label: 'setup', value: 'st', options: Object.keys(M).map((k) => ({ value: k, label: M[k].label })), onChange: (k) => { cur = k; draw(); } });
    draw();
  }

  GG.entry('libcudart', {
    render(body, ctx) {
      body.classList.add('hsa-body');
      const s = ctx.html(body, `
<p>The name <strong><code>libcudart.so</code></strong> reads “lib-cuda-rt”: the library of the ${T('cuda-runtime-api', 'CUDA Runtime API')}. Unlike ${T('libcuda', 'libcuda.so')}, which comes with the driver, it comes with the CUDA Toolkit, in two forms: the shared object, and a static library (<code>libcudart_static.a</code>) for copying into programs.</p>
<div data-slot="stack" class="wide"></div>
<h3>Static in deployed binaries, dynamic in frameworks</h3>
<p>Deployed CUDA binaries often statically link this file, but libraries and frameworks built on the CUDA Toolkit, like PyTorch, typically load it dynamically. Fig. 2 puts the setups side by side.</p>
<div data-slot="modes" class="wide"></div>
${GG.noteHTML('intuition', '<p>Static linking is packing your own lunch: the Runtime travels inside the program, and nothing at the destination can be missing or the wrong version. Dynamic linking is eating at the canteen: lighter to carry, shared with everyone, but it has to be there when you arrive.</p>')}
<p>Static linking is allowed by the toolkit’s license, as the ${T('cuda-runtime-api', 'CUDA Runtime API')} entry explains, which is what makes the single-file deployment possible.</p>`);
      guard(s.stack, 'Toolkit stack', () => {
        toolkitFig(s.stack, ctx, {
          title: 'libcudart.so in the CUDA Toolkit stack',
          hint: 'hover a layer',
          wide: true,
          caption: `Redrawn from the glossary’s CUDA Toolkit figure (adapted from ${PROF_CUDA}) with each layer’s Linux file: <code>libcudart.so</code> implements the CUDA Runtime API, on top of the Driver API’s <code>libcuda.so</code>.`,
        }, { files: true, highlight: 'runtime' });
      });
      guard(s.modes, 'Linking modes', () => linkModesFig(s.modes, ctx));
    },
  });

  /* @@END@@ */
})();
