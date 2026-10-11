/* chapters/hw-b.js: Device Hardware, part B.
   Entries: tensor-core, tensor-memory-accelerator, streaming-multiprocessor-architecture.
   Every CSS class here is prefixed "hwb-". */
(function () {
  'use strict';

  GG.css(`
/* ── shared ── */
.hwb-w { position: relative; min-width: 0; }
.hwb-svg { display: block; width: 100%; height: auto; overflow: visible; }
.hwb-legend { display: flex; flex-wrap: wrap; gap: 6px 16px; margin-top: 10px; font: 500 11px/1.4 var(--font-mono); color: var(--ink-2); }
.hwb-legend span { display: inline-flex; align-items: center; gap: 7px; }
.hwb-legend i { width: 11px; height: 11px; border-radius: 3px; flex: none; display: inline-block; }
.hwb-sw-core { background: var(--core); } .hwb-sw-control { background: var(--control); } .hwb-sw-memory { background: var(--memory); }
.hwb-sw-special { background: var(--special); } .hwb-sw-host { background: var(--host); } .hwb-sw-danger { background: var(--danger); }
.hwb-sw-ghost { background: transparent; box-shadow: inset 0 0 0 1.5px var(--ink-3); }
.hwb-sw-zero { background: var(--surface-3); box-shadow: inset 0 0 0 1px var(--ink-3); }
.hwb-sw-c { background: var(--ink-2); }
.hwb-subnote { margin: 0 0 8px; }
.hwb-kc { text-transform: none; letter-spacing: 0.02em; }
.hwb-opleg { margin: 0 0 10px; padding-bottom: 8px; border-bottom: 1px dashed var(--line); }
.hwb-opleg .hwb-opleg-h { color: var(--ink-3); }
.hwb-tag { display: inline-block; font: 600 9.5px/1 var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 5px 2px; border-radius: 4px; border: 1px solid var(--line-2); color: var(--ink-3); vertical-align: 0.15em; white-space: nowrap; }
.hwb-tag.beyond { color: var(--host); border-color: rgba(184, 164, 255, 0.45); }
.hwb-k { font: 500 10px/1.3 var(--font-mono); letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-3); }
.entry-body .hwb-body :not(pre) > code, .entry-body.hwb-body :not(pre) > code { white-space: normal; overflow-wrap: anywhere; }
.hwb-panel { border: 1px solid var(--line); border-radius: 12px; background: rgba(8, 9, 14, 0.5); padding: 10px 12px 12px; }
.hwb-hint { font: 500 11.5px/1.5 var(--font-mono); color: var(--ink-3); }
.hwb-hint b { color: var(--ink-2); font-weight: 500; }
.fig-why code, .hwb-panel code, .hwb-dec-ex code { font-size: 0.88em; padding: 0.08em 0.35em; border-radius: 4px; background: var(--surface-3); color: var(--ink); overflow-wrap: anywhere; }

/* operand colours, shared by the compile chain, the register walk-through and the decoder */
.code .hwb-op, .hwb-op { border-radius: 4px; transition: background 0.2s, box-shadow 0.2s, opacity 0.2s; cursor: help; }
.code .hwb-op[data-g="D"], .hwb-op[data-g="D"] { color: var(--control); }
.code .hwb-op[data-g="A"], .hwb-op[data-g="A"] { color: var(--special); }
.code .hwb-op[data-g="B"], .hwb-op[data-g="B"] { color: var(--memory); }
.code .hwb-op[data-g="C"], .hwb-op[data-g="C"] { color: var(--ink-2); }
.code .hwb-op[data-g="C"][data-acc], .hwb-op[data-g="C"][data-acc] { color: var(--control); }
.code .hwb-op.on[data-g="D"], .code .hwb-op.on[data-g="C"][data-acc] { background: var(--control-a); box-shadow: 0 0 0 1px rgba(255, 198, 92, 0.65); }
.code .hwb-op.on[data-g="A"] { background: var(--special-a); box-shadow: 0 0 0 1px rgba(238, 116, 207, 0.65); }
.code .hwb-op.on[data-g="B"] { background: var(--memory-a); box-shadow: 0 0 0 1px rgba(111, 166, 255, 0.65); }
.code .hwb-op.on[data-g="C"]:not([data-acc]) { background: rgba(255, 255, 255, 0.08); box-shadow: 0 0 0 1px rgba(167, 171, 195, 0.6); }
.code .hwb-shape.on { background: rgba(69, 212, 155, 0.14); box-shadow: 0 0 0 1px rgba(69, 212, 155, 0.5); border-radius: 4px; }
.hwb-wrapcode pre .ln { white-space: pre-wrap; overflow-wrap: anywhere; padding-left: 34px !important; text-indent: -18px; }
.code .hwb-shape, .code .hwb-op { white-space: nowrap; }
.hwb-archcode pre .ln { white-space: pre-wrap; overflow-wrap: anywhere; padding-left: 5.3em; text-indent: -5.3em; }
.hwb-archcode pre .ln::before { text-indent: 0; }
.hwb-opkey { display: flex; flex-wrap: wrap; gap: 4px 14px; margin: 8px 0 0; font: 500 11px/1.4 var(--font-mono); color: var(--ink-3); }
.hwb-opkey b { font-weight: 700; }

/* ── Tensor Core · amortisation, rates ── */
.hwb-rowlab { font-family: var(--font-mono); }

/* ── Tensor Core · decoder ── */
.hwb-toks { display: flex; flex-wrap: wrap; align-items: stretch; gap: 4px; justify-content: center; margin: 4px 0 12px; }
.hwb-tok {
  display: inline-flex; flex-direction: column; align-items: center; gap: 3px; min-width: 38px; padding: 8px 9px 6px; border-radius: 10px;
  border: 1px solid var(--line-2); background: var(--surface-2); color: var(--ink); cursor: pointer; font: 700 26px/1 var(--font-mono);
  transition: border-color 0.15s, background 0.15s, transform 0.15s;
}
.hwb-tok small { font: 500 9.5px/1 var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-3); }
.hwb-tok:hover { border-color: var(--ink-3); }
.hwb-tok[aria-pressed="true"] { border-color: var(--accent); background: var(--accent-a); }
.hwb-tok[data-r="in"] b { color: var(--ink); padding-bottom: 3px; background: linear-gradient(90deg, var(--special) 50%, var(--memory) 50%) no-repeat left bottom / 100% 3px; }
.hwb-tok[data-r="acc"] b { color: var(--control); }
.hwb-toks.hyp .hwb-tok:not([data-r="m"]):not([data-r="n"]):not([data-r="k"]) { opacity: 0.4; }
.hwb-dec-tag { text-align: center; margin: -4px 0 10px; font: 500 11.5px/1.45 var(--font-mono); color: var(--ink-3); min-height: 1.45em; }
.hwb-dec-tag b { color: var(--ink-2); font-weight: 600; }
.hwb-tok[data-r="m"] b, .hwb-tok[data-r="n"] b, .hwb-tok[data-r="k"] b { color: var(--ink); }
.hwb-tok b { font-weight: 700; }
.hwb-tsep { align-self: flex-end; font: 700 26px/1 var(--font-mono); color: var(--ink-3); padding: 0 1px 14px; }
.hwb-dec-ex { min-height: 3.1em; padding: 9px 12px; border-radius: 10px; border: 1px dashed var(--line-2); font-size: 14px; line-height: 1.55; color: var(--ink-2); }
.hwb-dec-ex b { color: var(--ink); font-weight: 600; }
.hwb-calc { margin: 10px 0 4px; font: 500 13px/1.7 var(--font-mono); color: var(--ink-2); text-align: center; }
.hwb-calc b { color: var(--ink); font-weight: 600; }
.hwb-calc .big { color: var(--core); font-size: 15px; }
.hwb-calc span { display: inline-block; white-space: nowrap; margin: 0 8px; }
@media (max-width: 720px) { .hwb-toks { gap: 3px; } .hwb-tok { font-size: 18px; min-width: 26px; padding: 6px 5px 5px; } .hwb-tok small { font-size: 8.5px; letter-spacing: 0.06em; } .hwb-tsep { font-size: 18px; padding: 0 0 12px; } }

/* ── Tensor Core · compile chain ── */
.hwb-chain { display: grid; gap: 6px; }
.hwb-lv { transition: opacity 0.25s; }
.hwb-lv.dim { opacity: 0.4; }
.hwb-arrow { display: flex; align-items: center; gap: 10px; padding: 2px 0 2px 18px; font: 500 11px var(--font-mono); color: var(--ink-3); }
.hwb-arrow::before { content: "↓"; font-size: 15px; color: var(--ink-2); }
.hwb-arrow b { color: var(--control); font-weight: 600; }
.hwb-chain .code pre { font-size: 12.8px; }

/* ── Tensor Core · register walk-through ── */
.hwb-walk .code { margin-bottom: 10px; }
.hwb-walk .code pre { font-size: 13px; }
.hwb-cell { stroke: rgba(255, 255, 255, 0.07); stroke-width: 0.6; }
.hwb-blk { transition: opacity 0.3s, stroke-width 0.2s; }
.hwb-blk.dim { opacity: 0.33; }
.hwb-dfill { transition: fill-opacity 0.45s; }
.hwb-pulse { animation: hwb-pulse 0.9s ease-out; }
@keyframes hwb-pulse { 0% { fill-opacity: 0.9; } 100% { fill-opacity: 0; } }
.hwb-dgrid { cursor: pointer; outline: none; }
.hwb-dgrid:focus-visible .hwb-dframe { stroke: var(--accent); stroke-width: 2; }
.hwb-probe { min-height: 4.2em; margin-top: 10px; }
.hwb-prods { display: grid; grid-template-columns: minmax(0, 1fr); gap: 8px; margin-top: 8px; }
@media (min-width: 720px) { .hwb-prods { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); } }
.hwb-prodg { border: 1px solid var(--line); border-radius: 9px; padding: 7px 9px 8px; transition: opacity 0.25s, border-color 0.25s; }
.hwb-prodg.todo { opacity: 0.45; border-style: dashed; }
.hwb-prodg.now { border-color: var(--core); }
.hwb-prodg-h { font: 500 10.5px/1.4 var(--font-mono); color: var(--ink-3); margin-bottom: 6px; }
.hwb-prodg-h b { color: var(--ink-2); font-weight: 600; }
.hwb-pbox { display: flex; flex-wrap: wrap; gap: 3px; }
.hwb-pbox span { min-width: 26px; text-align: center; font: 600 11.5px/22px var(--font-mono); border-radius: 5px; background: rgba(255, 255, 255, 0.05); color: var(--ink); font-variant-numeric: tabular-nums; }
.hwb-prodg-s { margin-top: 6px; font: 500 11.5px var(--font-mono); color: var(--ink-2); }
.hwb-prodg-s b { color: var(--control); }

.hwb-pnav { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-top: 10px; }
.hwb-pnav .hwb-k { margin-right: 4px; flex-basis: 100%; }
.hwb-pgrp { display: inline-flex; align-items: center; gap: 6px; margin-right: 8px; }
.hwb-pnav .btn { min-width: 34px; min-height: 34px; justify-content: center; }

/* ── Tensor Core · systolic array ── */
.hwb-sys g.hwb-mov { transition: transform 0.55s ease, opacity 0.3s; }
.hwb-sys svg { max-width: 560px; margin: 0 auto; }
.hwb-sys .hwb-pe { transition: fill 0.25s, stroke 0.25s; }
.hwb-sys-call { margin: 8px 0 0; min-height: 3.2em; text-align: center; font: 500 13px/1.7 var(--font-mono); color: var(--ink-2); }
.hwb-sys-call .hwb-sys-eq { display: inline-block; white-space: nowrap; margin: 0 9px; }
.hwb-sys-call b { color: var(--ink); }

/* ── Tensor Core · SASS by architecture ── */
.hwb-arch { display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; align-items: start; }
.hwb-arch.two { grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); }
.hwb-arch .code pre { font-size: 12.2px; max-height: 330px; overflow-y: auto; }
@media (max-width: 560px) { .hwb-arch .code pre { max-height: none; } }
.hwb-chipwrap { margin-bottom: 10px; }
.hwb-chipwrap .hwb-k { margin-bottom: 6px; }
.hwb-chips { display: grid; gap: 4px; align-items: center; }
.hwb-chip-h { font: 500 10px/1.2 var(--font-mono); color: var(--ink-3); text-align: center; white-space: nowrap; }
.hwb-chips > .hwb-chip-h:nth-child(n) { padding: 0 2px; }
.hwb-chip { display: flex; flex-direction: column; align-items: center; gap: 1px; min-width: 0; padding: 5px 2px; border-radius: 7px; border: 1px solid var(--line-2); background: var(--surface-2); cursor: pointer; font: 500 10px/1.25 var(--font-mono); color: var(--ink-3); }
.hwb-chip b { font: 700 12.5px/1.2 var(--font-mono); }
.hwb-chip i { font-style: normal; }
.hwb-chip span { white-space: nowrap; }
.hwb-chip.on, .hwb-chip:hover { border-color: var(--accent); }
@media (max-width: 560px) { .hwb-chip { font-size: 9.5px; letter-spacing: -0.02em; } .hwb-chip b { font-size: 11.5px; } }
.hwb-chip:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }

/* ── Tensor Core · tiling zoom ── */
.hwb-tile svg { touch-action: manipulation; }
.hwb-tile .hwb-tsel { cursor: pointer; }
`);

  /* ───────────── helpers ───────────── */
  const el = GG.el;
  const esc = GG.esc;
  const fmt = GG.fmt;
  const TERMS = {};
  (window.GG_TERMS || []).forEach((t) => { TERMS[t.id] = t; });
  /* Cross-link HTML, already decorated (so it also works in content shown after boot). */
  function T(id, text) {
    const t = TERMS[id];
    const color = t ? (GG.SECTIONS[t.section] || GG.SECTIONS.intro).color : 'var(--accent)';
    return `<a data-term="${id}" href="#${id}" class="term" style="--c:${color}">${text == null ? (t ? esc(t.name) : id) : text}</a>`;
  }
  const $$ = (root, sel) => Array.prototype.slice.call(root.querySelectorAll(sel));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  /* "a" or "an" before a word or a number as it is spoken (8, 11, 18, 80… start with a vowel sound) */
  const an = (s) => (/^(8|11|18)/.test(String(s)) || /^[aeiou]/i.test(String(s)) ? 'an' : 'a');
  const plural = (n, word, many) => (n === 1 ? word : (many || word + 's'));
  /* core's stepper prints "Step k / n"; show the step's own label instead */
  function stepOut(root, text) { const o = root.querySelector('.stepper output'); if (o) o.textContent = text; }

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
      console.error('[hw-b] ' + label + ' failed', e);
      if (parent) parent.insertAdjacentHTML('beforeend', `<div class="entry-error">${esc(label)} could not be drawn: ${esc(e && e.message)}</div>`);
      return null;
    }
  }

  const S = (tag, attrs, parent) => GG.svg(tag, attrs, parent);
  /* SVG text; gg.css sets .fig svg text { fill }, which beats presentation attributes, so colour goes in style */
  function Tx(parent, x, y, text, attrs) {
    const a = Object.assign({ x, y }, attrs || {});
    let style = a.style || '';
    if (a.fill) { style += 'fill:' + a.fill + ';'; delete a.fill; }
    if (a.size) { style += 'font-size:' + a.size + 'px;'; delete a.size; }
    if (a.weight) { style += 'font-weight:' + a.weight + ';'; delete a.weight; }
    if (a.family) { style += 'font-family:' + a.family + ';'; delete a.family; }
    if (style) a.style = style;
    const t = GG.svg('text', a, parent);
    t.textContent = text;
    return t;
  }
  function svgRoot(parent, w, h, label) {
    return S('svg', { viewBox: `0 0 ${w} ${h}`, width: '100%', role: 'img', 'aria-label': label, class: 'hwb-svg' }, parent);
  }
  const ROLE = { A: 'var(--special)', B: 'var(--memory)', D: 'var(--control)', C: 'var(--ink-2)', core: 'var(--core)' };

  /* Case-sensitive identifiers (mma_sync, sm_75, cuTensorMapEncodeTiled, nvcc …) keep their case inside
     labels that the design system sets in capitals (figure titles, stat labels, panel headers). */
  const KC_RE = /(mma_sync|sm_\d+[a-z]?|compute_\d+[a-z]?|cuTensorMapEncodeTiled|nvcc|ptxas|cp\.async[\w.:]*|wgmma|tcgen05[\w.]*)/g;
  const kcHTML = (text) => esc(text).replace(KC_RE, '<span class="hwb-kc">$1</span>');
  function keepCase(node) { if (node && KC_RE.test(node.textContent)) node.innerHTML = kcHTML(node.textContent); KC_RE.lastIndex = 0; }
  /* GG.ui.stat with a case-preserving label */
  function stat(parent, opts) { const s = GG.ui.stat(parent, opts); keepCase(s.el.querySelector('i')); return s; }
  /* ctx whose figures keep identifier case in their titles */
  function kcCtx(ctx) {
    const fig = ctx.figure;
    return Object.assign({}, ctx, { figure: (p, o) => { const f = fig(p, o); keepCase(f.bar.querySelector('.fig-title')); return f; } });
  }
  /* Operand key at the top of a figure: these colours name operands, not hardware. acc: C is drawn grey as zeros */
  function opKey(stage, acc) {
    const k = el('div', { class: 'hwb-legend hwb-opleg', html:
      '<span class="hwb-opleg-h">colours here name operands, not hardware:</span>' +
      '<span><i class="hwb-sw-special"></i>A</span><span><i class="hwb-sw-memory"></i>B</span>' +
      (acc ? '<span><i class="hwb-sw-c"></i>C as zeros (RZ)</span><span><i class="hwb-sw-control"></i>D, and C when it accumulates</span>' : '<span><i class="hwb-sw-control"></i>C and D</span>') });
    stage.insertBefore(k, stage.firstChild);
    return k;
  }

  /* ═════════════════════════════ Tensor Core ═════════════════════════════ */

  const CPP_LINE = 'wmma::mma_sync(c, a, b, c);';
  const PTX_LINE = 'wmma.mma.sync.aligned.col.row.m16n16k16.f32.f32 {%f2, %f3, %f4, %f5, %f6, %f7, %f8, %f9}, {%r2, %r3, %r4, %r5, %r6, %r7, %r8, %r9}, {%r10, %r11, %r12, %r13, %r14, %r15, %r16, %r17}, {%f1, %f1, %f1, %f1, %f1, %f1, %f1, %f1};';
  const SASS_CODE = 'HMMA.1688.F32 R20, R12, R11, RZ   // 1\nHMMA.1688.F32 R24, R12, R17, RZ   // 2\nHMMA.1688.F32 R20, R14, R16, R20  // 3\nHMMA.1688.F32 R24, R14, R18, R24  // 4';
  const GODBOLT_SRC = '#include <mma.h>\n#include <cuda_fp16.h>\n#include <cuda_runtime.h>\n\nusing namespace nvcuda;\n\n#define TILE_DIM 16\n\n__global__ void matmul_tensor_core_kernel(const half *A, const half *B, float *C) {\n    wmma::fragment<wmma::matrix_a, 16, 16, 16, half, wmma::col_major> a_frag;\n    wmma::fragment<wmma::matrix_b, 16, 16, 16, half, wmma::row_major> b_frag;\n    wmma::fragment<wmma::accumulator, 16, 16, 16, float> c_frag;\n\n    wmma::fill_fragment(c_frag, 0.0f);\n    wmma::load_matrix_sync(a_frag, A, 16);\n    wmma::load_matrix_sync(b_frag, B, 16);\n    wmma::mma_sync(c_frag, a_frag, b_frag, c_frag);\n    wmma::store_matrix_sync(C, c_frag, 16, wmma::mem_row_major);\n}';

  /* Tensor Core instructions of the glossary's Godbolt kernel, per target, verbatim from Compiler Explorer's
     device view (nvcc 12.6 Update 2, the compiler that link uses). */
  const ARCH_SASS = [
    {
      id: 'sm70', label: 'sm_70 · Volta', fam: 'Volta', gpu: 'V100', n: 16, shape: '8 × 8 × 4', mnem: 'HMMA.884',
      code: 'HMMA.884.F32.F32.STEP0 R4, R10.reuse.COL, R24.reuse.ROW, RZ\nHMMA.884.F32.F32.STEP1 R6, R10.reuse.COL, R24.reuse.ROW, RZ\nHMMA.884.F32.F32.STEP2 R8, R10.reuse.COL, R24.reuse.ROW, RZ\nHMMA.884.F32.F32.STEP3 R10, R10.COL, R24.ROW, RZ\nHMMA.884.F32.F32.STEP0 R4, R20.reuse.COL, R22.reuse.ROW, R4\nHMMA.884.F32.F32.STEP1 R6, R20.reuse.COL, R22.reuse.ROW, R6\nHMMA.884.F32.F32.STEP2 R8, R20.reuse.COL, R22.reuse.ROW, R8\nHMMA.884.F32.F32.STEP3 R10, R20.COL, R22.ROW, R10\nHMMA.884.F32.F32.STEP0 R4, R14.reuse.COL, R16.reuse.ROW, R4\nHMMA.884.F32.F32.STEP1 R6, R14.reuse.COL, R16.reuse.ROW, R6\nHMMA.884.F32.F32.STEP2 R8, R14.reuse.COL, R16.reuse.ROW, R8\nHMMA.884.F32.F32.STEP3 R10, R14.COL, R16.ROW, R10\nHMMA.884.F32.F32.STEP0 R4, R2.reuse.COL, R12.reuse.ROW, R4\nHMMA.884.F32.F32.STEP1 R6, R2.reuse.COL, R12.reuse.ROW, R6\nHMMA.884.F32.F32.STEP2 R8, R2.reuse.COL, R12.reuse.ROW, R8\nHMMA.884.F32.F32.STEP3 R10, R2.COL, R12.ROW, R10',
      why: 'On <b>Volta</b> (sm_70, the V100), the same call becomes <b>16</b> Tensor Core instructions, <code>HMMA.884</code>, in four groups of four (<code>STEP0</code> to <code>STEP3</code>). Each group reads a new pair of A and B registers (the <code>.reuse</code> flags mark operands used again by the next instruction), and groups two to four add onto the accumulators the first group wrote, as their last operands <code>R4</code>, <code>R6</code>, <code>R8</code>, <code>R10</code> show. 4,096 ÷ 16 = 256 MACs per instruction on average. SASS semantics are undocumented, so we do not draw how the steps split the work.',
    },
    {
      id: 'sm75', label: 'sm_75 · Turing', fam: 'Turing', gpu: 'T4', n: 4, shape: '16 × 8 × 8', mnem: 'HMMA.1688',
      code: 'HMMA.1688.F32 R20, R12, R11, RZ\nHMMA.1688.F32 R24, R12, R17, RZ\nHMMA.1688.F32 R20, R14, R16, R20\nHMMA.1688.F32 R24, R14, R18, R24',
      why: 'On <b>Turing</b> (sm_75, the T4), the call becomes exactly the glossary’s four <code>HMMA.1688.F32</code> instructions: 16 × 8 × 8 = <b>1,024</b> MACs each, two outer products of two instructions each (Fig. 8). That is where the glossary’s SASS listing comes from.',
    },
    {
      id: 'sm80', label: 'sm_80 … sm_120', fam: 'Ampere to Blackwell', gpu: 'A100, H100, B200 …', n: 2, shape: '16 × 8 × 16', mnem: 'HMMA.16816',
      code: 'HMMA.16816.F32 R24, R4.reuse, R18, RZ\nHMMA.16816.F32 R20, R4, R20, RZ',
      why: 'From <b>Ampere</b> on (sm_80, sm_86, sm_89, sm_90, sm_90a, sm_100, sm_120), the call becomes <b>two</b> <code>HMMA.16816.F32</code> instructions: 16 × 8 × 16 = <b>2,048</b> MACs each, the shape of the glossary’s opening example. Each covers the whole inner dimension k = 16 at once and writes one 16 × 8 half of the result, so neither needs to accumulate: both add <code>RZ</code>. 2,048 ÷ 32 = 64 MACs per thread per instruction, the glossary’s number.',
    },
  ];

  /* Tag the operands of a SASS listing: for each line the registers in order are D, A, B, C. */
  function tagSass(code) {
    code.lines.forEach((ln) => {
      $$(ln, '.tk-reg').forEach((sp, j) => {
        const g = ['D', 'A', 'B', 'C'][j];
        if (!g) return;
        sp.classList.add('hwb-op');
        sp.setAttribute('data-g', g);
        if (g === 'C' && sp.textContent !== 'RZ') sp.setAttribute('data-acc', '');
      });
    });
  }
  function tagPtx(code) {
    const G = ['D', 'A', 'B', 'C'];
    let grp = -1;
    Array.prototype.forEach.call(code.lines[0].children, (sp) => {
      const t = sp.textContent;
      if (sp.classList.contains('tk-pun') && t === '{') grp++;
      if (sp.classList.contains('tk-reg') && grp >= 0 && grp < 4) { sp.classList.add('hwb-op'); sp.setAttribute('data-g', G[grp]); }
      if (grp < 0 && (sp.classList.contains('tk-dir') || sp.classList.contains('tk-op'))) sp.classList.add('hwb-shape');
    });
    // let the long opcode wrap between its suffixes, never inside one (".m16n16k16" stays whole)
    $$(code.lines[0], '.hwb-shape').forEach((sp) => sp.after(document.createElement('wbr')));
  }
  function tagCpp(code) {
    const ln = code.lines[0];
    const op = (t, g) => `<span class="hwb-op" data-g="${g}">${t}</span>`;
    const html = '<span class="tk-type">wmma</span><span class="tk-pun">::</span><span class="tk-fn hwb-shape">mma_sync</span><span class="tk-pun">(</span>' +
      op('c', 'D') + '<span class="tk-pun">,</span> ' + op('a', 'A') + '<span class="tk-pun">,</span> ' + op('b', 'B') + '<span class="tk-pun">,</span> ' + op('c', 'C') + '<span class="tk-pun">);</span>';
    const probe = document.createElement('span');
    probe.innerHTML = html;
    if (probe.textContent === CPP_LINE) ln.innerHTML = html;
  }

  /* ── Fig 1: the Tensor Cores in the SM floorplan ── */
  function tcFloorplan(slot, ctx) {
    const CAP = {
      hopper: 'The internal architecture of an H100 SM, redrawn from NVIDIA’s <a href="https://modal-cdn.com/gpu-glossary/gtc22-whitepaper-hopper.pdf">H100 white paper</a> as modified by the glossary. Note the larger size and lower number of Tensor Cores: one large block in each of the four sub-partitions, beside hundreds of small CUDA Core units.',
      volta: 'The V100 view goes beyond the glossary: the internal architecture of a V100 SM, redrawn from the SM figure in NVIDIA’s <a href="https://images.nvidia.com/content/volta-architecture/pdf/volta-architecture-whitepaper.pdf">V100 white paper</a>, the GPU that introduced Tensor Cores. Its four processing blocks (Volta’s name for sub-partitions) hold two 1st-generation Tensor Cores each, beside the small CUDA Core units. There is no Tensor Memory Accelerator on Volta.',
    };
    const f = ctx.figure(slot, {
      title: 'Tensor Cores in an H100 SM', hint: 'pick a view · hover or tap any block', wide: true,
      caption: CAP.hopper,
    });
    const titleEl = f.bar.querySelector('.fig-title');
    const ARCHS = GG.components.sm.ARCHS;
    const subNote = el('div', { class: 'hwb-hint hwb-subnote' });
    const smHost = el('div');
    f.stage.append(subNote, smHost);
    /* the four views, worded for one architecture (counts from the component's per-arch data) */
    function views(A) {
      const P = A.byKey;
      const nTC = P.tensor.perSM, nFP32 = P.fp32.perSM, nINT = P.int32.perSM, nFP64 = P.fp64.perSM, nSch = P.scheduler.perSM;
      const nCC = nINT + nFP32 + nFP64;
      if (A.id === 'volta') return {
        nTC, nSch, nCC,
        tensor: { keys: ['tensor'], why: `Each of the SM’s four processing blocks has <b>two</b> Tensor Cores (the 1st generation, on Volta): <b>${nTC}</b> per SM, and ${nTC} × ${A.nSM} = <b>${fmt.int(nTC * A.nSM)}</b> across the ${A.nSM} SMs of a V100. Each one multiplies 4 × 4 matrices, D = A × B + C: 4 × 4 × 4 = <b>64</b> fused multiply-adds per clock, in the V100 white paper’s words.`, sub: ` Here one processing block: its <b>two</b> Tensor Cores beside its ${nCC / 4} small CUDA Core units.` },
        sched: { keys: ['tensor', 'scheduler'], why: `<b>Two</b> Tensor Cores per <b>warp scheduler</b>. Each processing block’s scheduler issues its warps’ instructions to its own execution units, including the two Tensor Cores beside it: ${nTC} Tensor Cores for ${nSch} schedulers. The H100 has one per scheduler.`, sub: '' },
        cuda: { keys: ['cuda-cores'], why: `The CUDA Cores: ${nINT} INT32, ${nFP32} FP32 and ${nFP64} FP64 units, <b>${nCC}</b> in all. The V100 white paper counts the ${nFP32} FP32 units as the SM’s “${nFP32} FP32 cores”. Each executes scalar arithmetic: one operation on one number, per thread.`, sub: ` One processing block holds a quarter of them: ${nINT / 4} + ${nFP32 / 4} + ${nFP64 / 4} = ${nCC / 4}, each drawn as its own small cell.` },
        both: { keys: ['cores'], why: `All the cores together: <b>${nCC}</b> small CUDA Core units and <b>${nTC}</b> Tensor Cores. Already on the V100, the Tensor Cores supply most of the SM’s floating point throughput: 125 Tensor TFLOPS against 15.7 FP32 TFLOPS, by the white paper’s count (Fig. 3).`, sub: ` In this one processing block: ${nCC / 4} CUDA Core units and two Tensor Cores.` },
      };
      return {
        nTC, nSch, nCC,
        tensor: { keys: ['tensor'], why: `Each of the SM’s four sub-partitions has <b>one</b> Tensor Core (the 4th generation, on Hopper): <b>${nTC}</b> per SM, and ${nTC} × 132 = <b>${fmt.int(nTC * 132)}</b> across the 132 SMs of an H100 SXM. Each is one large block, where the CUDA Cores are many small ones.`, sub: ` Here one sub-partition: its <b>one</b> Tensor Core beside its ${nCC / 4} small CUDA Core units.` },
        sched: { keys: ['tensor', 'scheduler'], why: `One Tensor Core per <b>warp scheduler</b>. Each sub-partition’s scheduler issues its warps’ instructions to its own execution units, and a Tensor Core instruction goes to the one Tensor Core beside it: ${nTC} Tensor Cores for ${nSch} schedulers.`, sub: '' },
        cuda: { keys: ['cuda-cores'], why: `The CUDA Cores: ${nINT} INT32, ${nFP32} FP32 and ${nFP64} FP64 units, <b>${nCC}</b> in all. NVIDIA counts the ${nFP32} FP32 units as the SM’s “${nFP32} FP32 CUDA Cores”. Each executes scalar arithmetic: one operation on one number, per thread.`, sub: ` One sub-partition holds a quarter of them: ${nINT / 4} + ${nFP32 / 4} + ${nFP64 / 4} = ${nCC / 4}, each drawn as its own small cell.` },
        both: { keys: ['cores'], why: `All the cores together: <b>${nCC}</b> small CUDA Core units and <b>${nTC}</b> Tensor Cores. The Tensor Cores are much larger and far less numerous, yet on recent GPUs they supply most of the SM’s floating point throughput (Fig. 3).`, sub: ` In this one sub-partition: ${nCC / 4} CUDA Core units and one Tensor Core.` },
      };
    }
    let arch = 'hopper', V = views(ARCHS.hopper);
    let sm = null, isSub = null, view = 'tensor';
    function make(sub) {
      if (sm) { try { sm.destroy(); } catch (e) { /* already gone */ } }
      isSub = sub;
      sm = GG.components.sm(smHost, { arch, highlight: V[view].keys, showCounts: true, focus: sub ? 'sub' : 'sm' });
      sm.on('part', (key, part) => { if (part) f.setWhy(`<b>${esc(part.name)}</b> · ${esc(part.count)}. ${esc(part.desc)}`); });
      subNote.hidden = !sub;
    }
    function show(v) { view = v; sm.highlight(V[v].keys); f.setWhy(V[v].why + (isSub ? V[v].sub : '')); }
    GG.ui.seg(f.controls, {
      label: 'SM', value: 'hopper', onChange: (v) => { arch = v; paintArch(); make(isSub); show(view); },
      options: [{ value: 'hopper', label: 'H100', title: 'Hopper, SM90: the glossary’s figure' }, { value: 'volta', label: 'V100', title: 'Volta, SM70: the first Tensor Cores' }],
    });
    GG.ui.seg(f.controls, {
      label: 'Show', value: 'tensor', onChange: show,
      options: [{ value: 'tensor', label: 'Tensor Cores' }, { value: 'sched', label: '+ warp schedulers' }, { value: 'cuda', label: 'CUDA Cores' }, { value: 'both', label: 'all cores' }],
    });
    const stTC = stat(f.readouts, { label: 'Tensor Cores / SM', value: '', tone: 'core' });
    const stSch = stat(f.readouts, { label: 'per warp scheduler', value: '', tone: 'control' });
    const stCC = stat(f.readouts, { label: 'CUDA Core units / SM', value: '' });
    const stGPU = stat(f.readouts, { label: '', value: '', tone: 'core' });
    const stClk = stat(f.readouts, { label: 'FMAs / clock / Tensor Core', value: '4 × 4 × 4 = 64', tone: 'core', title: 'V100 white paper: each Tensor Core “performs 64 floating point FMA operations per clock”' });
    function paintArch() {
      const A = ARCHS[arch];
      V = views(A);
      titleEl.textContent = `Tensor Cores in ${A.id === 'volta' ? 'a' : 'an'} ${A.gpu} SM`;
      f.caption.innerHTML = CAP[A.id];
      const unit = A.id === 'volta' ? 'processing blocks' : 'sub-partitions';
      subNote.innerHTML = `<b>Phone view:</b> one of the SM’s four identical ${unit}, drawn large enough to show every unit. The whole SM has four of these, in a 2 × 2 grid (the locator in the corner shows which one).`;
      stTC.set(V.nTC); stSch.set(V.nTC / V.nSch); stCC.set(V.nCC);
      stGPU.el.querySelector('i').textContent = A.id === 'volta' ? 'Tensor Cores · V100' : 'Tensor Cores · H100 SXM';
      stGPU.set(fmt.int(V.nTC * A.nSM));
      stClk.el.hidden = A.id !== 'volta';
    }
    paintArch();
    /* phones get one sub-partition at full detail (the whole SM there would draw the CUDA Cores as solid columns) */
    const narrowAt = (w) => w > 0 && w < 560;
    make(narrowAt(f.stage.clientWidth || window.innerWidth));
    show('tensor');
    onWidth(f.stage, (w) => { const sub = narrowAt(w); if (sub !== isSub) { make(sub); show(view); } });
  }

  /* ── Fig 2: amortising instruction overhead ── */
  /* a share as a percentage that never rounds a non-zero share down to 0 */
  const pctS = (x) => (x > 0 && x < 0.001 ? '<0.1%' : fmt.pct(x, x < 0.1 ? 1 : 0));
  function tcAmortize(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'One matrix multiply, three instruction budgets', hint: 'drag the overhead slider · add the no-warp baseline', wide: true,
      caption: 'A model, not a measurement. Every row computes the same 16 × 16 × 16 matrix multiply for one warp: 4,096 multiply-accumulates (MACs). Each instruction pays a fixed cost to be fetched and decoded; each MAC costs one unit. Every instruction is drawn as its own amber sliver (its fetch and decode) followed by its green share of the arithmetic, so a bar’s stripes are its instructions and its length is the total energy. When the instructions are too thin to draw one by one, the bar shows their overhead summed at the left. NVIDIA does not publish these energies, so the ratio is yours to set. The instruction counts are real: 4,096 ÷ 32 = 128 scalar FFMAs per warp, and the SASS of Figs. 8 and 9. The optional first row is hypothetical: a processor without warps, which decodes every thread’s instruction separately.',
    });
    const ROWS = [
      { id: 'thread', name: 'Hypothetical · no warps', note: '4,096 instructions × 1 MAC (one each)', n: 4096, macs: 1, opt: true },
      { id: 'ffma', name: 'CUDA Cores · FFMA', note: '128 instructions × 32 MACs (1 per thread)', n: 128, macs: 32 },
      { id: 'h1688', name: 'Tensor Cores · HMMA.1688', note: '4 instructions × 1,024 MACs (16 × 8 × 8)', n: 4, macs: 1024 },
      { id: 'h16816', name: 'Tensor Cores · HMMA.16816', note: '2 instructions × 2,048 MACs (16 × 8 × 16)', n: 2, macs: 2048 },
    ];
    const byId = {}; ROWS.forEach((x) => { byId[x.id] = x; });
    let r = 64, W = 0, noWarp = false, summed = false;
    const rows = () => ROWS.filter((x) => !x.opt || noWarp);
    const host = el('div', { class: 'hwb-w' });
    f.stage.append(host);
    const legend = el('div', { class: 'hwb-legend', html: '<span><i class="hwb-sw-control"></i>fetch + decode of one instruction</span><span><i class="hwb-sw-core"></i>that instruction’s multiply-accumulates</span><span><i class="hwb-sw-ghost" style="width:2px;border-radius:0"></i>tick: where one instruction ends (when there is room)</span>' });
    f.stage.append(legend);
    const pid = GG.uid('hwbam');
    const E = (row) => row.n * (r + row.macs);
    const share = (row) => (row.n * r) / E(row);
    function draw() {
      if (!W) return;
      host.innerHTML = '';
      const vbW = clamp(W, 300, 1020);
      const narrow = vbW < 640;
      const labW = narrow ? 0 : 280;
      const rowH = narrow ? 70 : 58;
      const R = rows();
      const H = R.length * rowH + (narrow ? 40 : 30);
      const svg = svgRoot(host, vbW, H, 'Bars of total energy for the same matrix multiply: scalar FMA instructions on CUDA Cores, and HMMA instructions on Tensor Cores. Each instruction is drawn as an amber overhead sliver followed by its green arithmetic.');
      const defs = S('defs', {}, svg);
      const x0 = labW, avail = vbW - x0 - (narrow ? 4 : 12);
      const maxE = Math.max(...R.map(E));
      const sc = avail / maxE;
      summed = false;
      R.forEach((row, i) => {
        const y = i * rowH + 4;
        const by = narrow ? y + 38 : y + 20;
        const bh = narrow ? 20 : 24;
        const pc = pctS(share(row));
        if (narrow) {
          Tx(svg, 0, y + 12, row.name, { fill: row.opt ? 'var(--ink-2)' : 'var(--ink)', size: 12, weight: 600 });
          Tx(svg, 0, y + 25, row.note, { fill: 'var(--ink-3)', size: 10.5 });
          Tx(svg, vbW - 2, y + 12, pc + ' overhead', { fill: 'var(--control)', size: 12, weight: 600, 'text-anchor': 'end' });
        } else {
          Tx(svg, 0, by + 9, row.name, { fill: row.opt ? 'var(--ink-2)' : 'var(--ink)', size: 12.5, weight: 600 });
          Tx(svg, 0, by + 24, row.note, { fill: 'var(--ink-3)', size: 10.5 });
        }
        S('rect', { x: x0, y: by, width: avail, height: bh, rx: 4, style: 'fill:rgba(255,255,255,0.025)' }, svg);
        const span = E(row) * sc, per = span / row.n, fo = r / (r + row.macs);
        if (per >= 2) {
          // one period of the pattern = one instruction: amber overhead, then green arithmetic
          const pat = S('pattern', { id: pid + row.id, patternUnits: 'userSpaceOnUse', x: x0, y: by, width: per.toFixed(4), height: bh }, defs);
          S('rect', { x: 0, y: 0, width: Math.max(0.5, per * fo).toFixed(4), height: bh, style: 'fill:var(--control)' }, pat);
          S('rect', { x: (per * fo).toFixed(4), y: 0, width: Math.max(0, per * (1 - fo)).toFixed(4), height: bh, style: 'fill:var(--core)' }, pat);
          S('rect', { x: x0, y: by, width: span.toFixed(2), height: bh, style: `fill:url(#${pid + row.id})` }, svg);
          if (per >= 5) {
            let d = '';
            for (let k = 0; k <= row.n; k++) { const x = (x0 + k * per).toFixed(2); d += `M${x} ${by - 6}V${by - 1}`; }
            S('path', { d, style: 'stroke:var(--ink-2);stroke-width:1;fill:none' }, svg);
          }
        } else {
          // too thin to draw one by one: the overhead summed at the left, then the arithmetic
          summed = true;
          const wO = row.n * r * sc, wM = row.n * row.macs * sc;
          S('rect', { x: x0, y: by, width: Math.max(0.6, wO).toFixed(2), height: bh, style: 'fill:var(--control)' }, svg);
          S('rect', { x: (x0 + wO).toFixed(2), y: by, width: Math.max(0.6, wM).toFixed(2), height: bh, style: 'fill:var(--core)' }, svg);
          S('path', { d: `M${x0} ${by - 4}H${(x0 + Math.max(2, wO)).toFixed(2)}`, style: 'stroke:var(--control);stroke-width:1.2;stroke-dasharray:2 2;fill:none' }, svg);
        }
        const tot = fmt.int(E(row)) + (narrow ? '' : ' · ' + pc + ' overhead');
        const tw = tot.length * 7 + 10;
        const out = x0 + span + tw < vbW;
        Tx(svg, out ? x0 + span + 6 : x0 + span - 6, by + bh / 2 + 4.5, tot, { fill: out ? 'var(--ink-2)' : '#062014', size: 11.5, weight: 700, 'text-anchor': out ? 'start' : 'end' });
      });
      const ay = R.length * rowH + 14;
      S('path', { d: `M${x0} ${ay - 6}V${ay}H${x0 + avail}`, style: 'stroke:var(--line-2);fill:none' }, svg);
      if (narrow) {
        Tx(svg, x0, ay + 13, 'bar length = total energy', { fill: 'var(--ink-3)', size: 10.5 });
        Tx(svg, x0, ay + 26, 'in units of one multiply-accumulate →', { fill: 'var(--ink-3)', size: 10.5 });
      } else Tx(svg, x0, ay + 13, 'bar length: total energy, in units of one multiply-accumulate →', { fill: 'var(--ink-3)', size: 10.5 });
    }
    const stats = ROWS.map((row) => stat(f.readouts, { label: 'overhead · ' + (row.opt ? 'no warps' : row.name.split(' · ')[1]), value: '', tone: 'control' }));
    const stR = stat(f.readouts, { label: 'energy · FFMA ÷ HMMA.1688', value: '', tone: 'control' });
    const stP = stat(f.readouts, { label: 'same power budget · HMMA.1688 vs FFMA', value: '', tone: 'core', title: 'Under a fixed power budget, the MACs per second scale with the inverse of the energy per MAC' });
    const stWp = stat(f.readouts, { label: 'energy · no warps ÷ FFMA', value: '', tone: 'control' });
    function update() {
      ROWS.forEach((row, i) => { stats[i].set(pctS(share(row))); stats[i].el.hidden = !!row.opt && !noWarp; });
      const F = byId.ffma, H8 = byId.h1688, H16 = byId.h16816, T0 = byId.thread;
      const ratio = E(F) / E(H8), wr = E(T0) / E(F);
      stR.set('×' + fmt.fixed(ratio, 2));
      stP.set('×' + fmt.fixed(ratio, 2) + ' MACs/s');
      stWp.set('×' + fmt.fixed(wr, 2)); stWp.el.hidden = !noWarp;
      const rs = fmt.int(r);
      const lead = `If fetching and decoding one instruction costs as much energy as <b>${rs} multiply-accumulate${r === 1 ? '' : 's'}</b>, `;
      const warpPart = noWarp ? `decoding every thread’s instruction separately would spend <b>${pctS(share(T0))}</b> of the energy on overhead across 4,096 instructions; the warp scheduler’s one decode for 32 threads cuts that to <b>${pctS(share(F))}</b> across 128 FFMAs, and the no-warp version uses ×${fmt.fixed(wr, 2)} the energy of the FFMAs in all. That saving comes before any Tensor Core is involved. ` : `the scalar path spends <b>${pctS(share(F))}</b> of its energy on overhead across 128 instructions; `;
      const tcPart = `${noWarp ? 'The' : 'the'} Tensor Core paths spend <b>${pctS(share(H8))}</b> (4 instructions) and <b>${pctS(share(H16))}</b> (2). Same 4,096 MACs, ×${fmt.fixed(ratio, 2)} the energy for scalar FFMAs, so on a fixed power budget the Tensor Cores can do ×${fmt.fixed(ratio, 2)} as many MACs per second. `;
      const close = ratio < 1.15 ? 'Only when decoding is nearly free does the scalar path catch up.' : 'The more work each instruction does, the less its overhead matters.';
      draw();
      f.setWhy(lead + warpPart + tcPart + close + (summed ? ' (Bars whose instructions are too thin to draw one by one show their overhead summed at the left.)' : ''));
    }
    GG.ui.slider(f.controls, { label: 'Decode cost per instruction', min: 1, max: 1000, step: 1, log: true, value: r, format: (v) => '= ' + fmt.int(v) + ' MAC' + (Math.round(v) === 1 ? '' : 's'), onInput: (v) => { r = Math.max(1, Math.round(v)); update(); } });
    GG.ui.toggle(f.controls, { label: 'no-warp baseline: one thread per instruction', value: false, onChange: (v) => { noWarp = v; update(); } });
    onWidth(host, (w) => { W = w; update(); });
    update();
  }

  /* ── Fig 3: Tensor Core vs CUDA Core peak rates ── */
  function tcRates(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'How much faster? Three generations at 16 bits, drawn to scale', hint: 'pick a GPU', wide: true,
      caption: 'Peak arithmetic rates (TFLOPS, trillions of floating point operations per second) of Tensor Cores with 16-bit inputs against FP32 CUDA Cores, one GPU generation at a time. H100 SXM numbers are the ones the glossary itself uses in its Arithmetic Bandwidth and Peak Rate entries (dense, i.e. without sparsity); the B200’s dense BF16 rate is the glossary’s too (its Arithmetic Bandwidth table, from the DGX B200 datasheet), and the B200’s 75 TFLOPS of FP32 is NVIDIA’s <a href="https://www.nvidia.com/en-us/data-center/hgx/">HGX B200</a> figure (600 TFLOPS for eight GPUs); V100 numbers are from Table 1 of NVIDIA’s <a href="https://images.nvidia.com/content/volta-architecture/pdf/volta-architecture-whitepaper.pdf">Volta white paper</a>. The dashed outline shows what 100 × the CUDA Core rate would be.',
    });
    const RATES = [
      { id: 'v100', label: 'V100 · FP16', gpu: 'V100 (SXM2)', tc: 125, tcName: 'Tensor Cores · FP16 inputs', tcWhat: 'FP16-input', cc: 15.7, ccName: 'CUDA Cores · FP32' },
      { id: 'bf16', label: 'H100 · BF16', gpu: 'H100 SXM', tc: 989, tcName: 'Tensor Cores · dense BF16', tcWhat: 'dense BF16', cc: 66.9, ccName: 'CUDA Cores · FP32' },
      { id: 'b200bf16', label: 'B200 · BF16', gpu: 'B200', tc: 2250, tcName: 'Tensor Cores · dense BF16', tcWhat: 'dense BF16', cc: 75, ccName: 'CUDA Cores · FP32' },
    ];
    let cur = RATES[1], W = 0;
    const host = el('div', { class: 'hwb-w' });
    f.stage.append(host);
    function draw() {
      if (!W) return;
      host.innerHTML = '';
      const vbW = clamp(W, 300, 1020);
      const narrow = vbW < 640;
      const labW = narrow ? 0 : 230;
      const rows = [
        { name: cur.ccName, v: cur.cc, kind: 'cc' },
        { name: cur.tcName, v: cur.tc, kind: 'tc' },
        { name: '100 × the CUDA Cores', v: 100 * cur.cc, kind: 'ghost' },
      ];
      const rowH = narrow ? 50 : 42;
      const H = rows.length * rowH + 28;
      const svg = svgRoot(host, vbW, H, `Bar chart: ${cur.ccName} ${cur.cc} TFLOPS, ${cur.tcName} ${cur.tc} TFLOPS, and a dashed outline at 100 times the CUDA Core rate.`);
      const x0 = labW, avail = vbW - x0 - 6;
      const max = Math.max(cur.tc, 100 * cur.cc) * 1.0;
      const X = (v) => x0 + (v / max) * avail;
      // axis
      const step = max > 5000 ? 1000 : max > 2000 ? 500 : max > 1000 ? 250 : 100;
      for (let v = 0; v <= max + 1e-9; v += step) {
        const x = X(v);
        S('line', { x1: x, x2: x, y1: 4, y2: rows.length * rowH + 6, style: 'stroke:rgba(255,255,255,0.05)' }, svg);
        if (x < vbW - 20 || v === 0) Tx(svg, x, rows.length * rowH + 20, fmt.int(v), { fill: 'var(--ink-3)', size: 10, 'text-anchor': v === 0 ? 'start' : 'middle' });
      }
      rows.forEach((row, i) => {
        const y = i * rowH + 6;
        const by = narrow ? y + 18 : y + 6, bh = narrow ? 20 : 24;
        const lx = narrow ? 0 : 0;
        Tx(svg, lx, narrow ? y + 11 : by + 16, row.name, { fill: row.kind === 'ghost' ? 'var(--ink-3)' : 'var(--ink)', size: 12, weight: row.kind === 'ghost' ? 500 : 600 });
        const w = Math.max(1.5, X(row.v) - x0);
        if (row.kind === 'ghost') S('rect', { x: x0, y: by, width: w, height: bh, rx: 4, style: 'fill:none;stroke:var(--ink-3);stroke-dasharray:5 4;stroke-width:1.3' }, svg);
        else S('rect', { x: x0, y: by, width: w, height: bh, rx: 4, style: `fill:var(--core);fill-opacity:${row.kind === 'cc' ? 0.45 : 1}` }, svg);
        const txt = row.kind === 'tc' ? `${fmt.int(row.v)} TFLOPS · ${fmt.fixed(cur.tc / cur.cc, 1)}×` : row.kind === 'cc' ? `${fmt.sig(row.v, 3)} TFLOPS` : `${fmt.int(row.v)} TFLOPS`;
        const inside = w > 190;
        Tx(svg, inside ? x0 + w - 8 : x0 + w + 8, by + bh / 2 + 4, txt, { fill: inside ? (row.kind === 'ghost' ? 'var(--ink-2)' : '#062014') : 'var(--ink-2)', size: 11.5, weight: 600, 'text-anchor': inside ? 'end' : 'start' });
      });
    }
    const stRatio = stat(f.readouts, { label: 'Tensor ÷ CUDA Core', value: '', tone: 'core' });
    const stHund = stat(f.readouts, { label: '100× would be', value: '' });
    const stShare = stat(f.readouts, { label: 'of the 100× bar', value: '' });
    function update() {
      const ratio = cur.tc / cur.cc;
      stRatio.set(fmt.fixed(ratio, 1) + '×');
      stHund.set(fmt.int(100 * cur.cc) + ' TFLOPS');
      stShare.set(fmt.pct(cur.tc / (100 * cur.cc)));
      const verdict = ratio >= 100 ? `so here the Tensor Cores go past the 100× rule of thumb` : ratio >= 50 ? `so here the rule of thumb is the right order of magnitude, if a little high` : `so for this comparison the rule of thumb overstates the gap`;
      f.setWhy(`On the <b>${cur.gpu}</b>, the Tensor Cores peak at <b>${fmt.int(cur.tc)} TFLOPS</b> of ${cur.tcWhat} math and the CUDA Cores at <b>${fmt.sig(cur.cc, 3)} TFLOPS</b> of FP32 math: ${fmt.int(cur.tc)} ÷ ${fmt.sig(cur.cc, 3)} ≈ <b>${fmt.fixed(ratio, 1)}×</b>. A 100× ratio would need ${fmt.int(100 * cur.cc)} TFLOPS, ${verdict}${cur.id === 'v100' ? '. This is the GPU that introduced Tensor Cores' : ''}. Each generation widens the gap. So do lower-precision inputs, which this figure holds at 16 bits.`);
      draw();
    }
    GG.ui.seg(f.controls, { label: 'Compare', value: 'bf16', options: RATES.map((r) => ({ value: r.id, label: r.label })), onChange: (v) => { cur = RATES.find((r) => r.id === v); update(); } });
    onWidth(host, (w) => { W = w; draw(); });
    update();
  }

  /* ── Fig 4: decoding HMMA16.16816.F32 ── */
  function tcDecoder(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Decoding HMMA16.16816.F32', hint: 'hover or tap a token · change m, n, k', wide: true,
      caption: 'The name of the instruction spells out its job. The matrices are drawn to scale (a dimension too thin to draw is widened and marked “not to scale”): A is m × k, B is k × n, and C and D are m × n, so every output element is a sum of k products. Colours here name operands, not kinds of hardware: A pink, B blue, C and D amber. The first two presets are real SASS shapes and the third a real PTX shape; the sliders count any shape, though real instructions come in a fixed menu of shapes.',
    });
    const st = { m: 16, n: 8, k: 16, pin: null, hover: null };
    const root = el('div', { class: 'hwb-dec' });
    f.stage.append(root);
    opKey(f.stage, false);
    const tokRow = el('div', { class: 'hwb-toks', role: 'group', 'aria-label': 'Parts of the instruction name' });
    const tag = el('div', { class: 'hwb-dec-tag' });
    const exp = el('div', { class: 'hwb-dec-ex', 'aria-live': 'polite' });
    const calc = el('div', { class: 'hwb-calc' });
    const svgHost = el('div', { class: 'hwb-w' });
    root.append(tokRow, tag, exp, calc, svgHost);
    const TOK = [
      { id: 'H', t: 'H', sub: 'half', r: 'in' },
      { id: 'MMA', t: 'MMA', sub: 'op', r: 'op' },
      { id: 'in16', t: '16', sub: 'bits', r: 'in' },
      { sep: true },
      { id: 'm', t: () => String(st.m), sub: 'm', r: 'm' },
      { id: 'n', t: () => String(st.n), sub: 'n', r: 'n' },
      { id: 'k', t: () => String(st.k), sub: 'k', r: 'k' },
      { sep: true },
      { id: 'F32', t: 'F32', sub: 'acc', r: 'acc' },
    ];
    const EXPL = {
      H: () => '<b>H</b> is for <b>half precision</b>: the inputs A and B (both of them, hence the pink and blue underline) are 16-bit floating point numbers (FP16), half the 32 bits of a single-precision float.',
      MMA: () => '<b>MMA</b> stands for <b>Matrix Multiply and Accumulate</b>. The instruction calculates <b>D = AB + C</b> for whole matrices A, B, C and D. C is often the same physical matrix as D, which makes it <b>C += AB</b>: products are added onto what is already there.',
      in16: () => '<b>16</b>: the inputs are <b>16 bits</b> wide, the same fact the H states. (The disassembler prints the instruction without this 16, as <code>HMMA.16816.F32</code>; see the note below.)',
      m: () => `<b>m = ${st.m}</b>: the rows of A, and of C and D. With n it is one of the two <b>outer dimensions</b>, which NVIDIA names first.`,
      n: () => `<b>n = ${st.n}</b>: the columns of B, and of C and D, the second <b>outer dimension</b>. Together, m × n = ${fmt.int(st.m * st.n)} output elements.`,
      k: () => `<b>k = ${st.k}</b>: the shared <b>inner dimension</b>, the columns of A and the rows of B. It is the dimension that gets summed away: each output element accumulates k = ${st.k} products.`,
      F32: () => '<b>F32</b>: the products are accumulated into <b>32-bit floats</b>, single precision, so C and D are FP32 even though A and B are FP16. Adding many small products in higher precision loses less to rounding.',
      none: () => (st.m === 16 && st.n === 8 && st.k === 16
        ? 'The string <b>16816</b> is not a single number larger than 16,000. It is three numbers in a row, <b>16</b>, <b>8</b> and <b>16</b>: the dimensions m, n and k of the matrices, as NVIDIA names them, for example in PTX. Hover or tap a token.'
        : (() => {
          const sh = shape();
          const tail = sh.sass ? ''
            : sh.ptx ? ' Only the shape is real here (m16n16k16 is a PTX <code>wmma</code> shape); the rest of the name is the glossary’s SASS example, kept for reference.'
              : ' This shape is hypothetical: no instruction has it. The rest of the name is the glossary’s example, kept for reference.';
          return `The digits after the first dot are three numbers in a row, <b>${st.m}</b>, <b>${st.n}</b> and <b>${st.k}</b>: the dimensions m, n and k of the matrices, as NVIDIA names them.${tail} Hover or tap a token.`;
        })()),
    };
    const btns = {};
    TOK.forEach((t) => {
      if (t.sep) { tokRow.append(el('span', { class: 'hwb-tsep', 'aria-hidden': 'true', text: '.' })); return; }
      const b = el('button', { type: 'button', class: 'hwb-tok', 'data-r': t.r, 'aria-pressed': 'false', 'aria-label': { H: 'H, half precision', MMA: 'MMA, matrix multiply and accumulate', in16: '16, input bits', m: 'm', n: 'n', k: 'k', F32: 'F32, accumulator type' }[t.id] });
      b.innerHTML = `<b></b><small>${esc(t.sub)}</small>`;
      b.addEventListener('mouseenter', () => { st.hover = t.id; render(); });
      b.addEventListener('mouseleave', () => { st.hover = null; render(); });
      b.addEventListener('focus', () => { st.hover = t.id; render(); });
      b.addEventListener('blur', () => { st.hover = null; render(); });
      b.addEventListener('click', () => { st.pin = st.pin === t.id ? null : t.id; render(); });
      tokRow.append(b);
      btns[t.id] = { b, t };
    });
    let W = 0;
    function active() { return st.hover || st.pin; }
    function drawSvg() {
      if (!W) return;
      svgHost.innerHTML = '';
      const { m, n, k } = st;
      const vbW = clamp(W, 300, 720);
      const narrow = vbW < 520;
      const left = narrow ? 58 : 84, top = 34, right = 14, gap = 8;
      const availW = vbW - left - right - gap;
      const vbH = narrow ? 300 : 360;
      const availH = vbH - top - 30 - gap;
      // a dimension is drawn at least MIN long (so labels never pile up); solve for the cell size with those clamps
      const MIN = narrow ? 50 : 56;
      const fitS = (dims, avail) => { let s0 = avail / dims.reduce((a, d) => a + d, 0); for (let it = 0; it < 4; it++) { const free = dims.filter((d) => d * s0 >= MIN); const fixed = (dims.length - free.length) * MIN; s0 = free.length ? Math.max(0.5, (avail - fixed) / free.reduce((a, d) => a + d, 0)) : s0; } return s0; };
      const s = Math.min(fitS([k, n], availW), fitS([k, m], availH), 22);
      const L = (d) => Math.max(d * s, MIN);
      const notScale = [m, n, k].some((d) => d * s < MIN);
      const ox = Math.max(0, (vbW - (left + L(k) + L(n) + gap + right + 40)) / 2);
      const Ax = left + ox, Ay = top + L(k) + gap, Bx = Ax + L(k) + gap, By = top, Cx = Bx, Cy = Ay;
      const H = Ay + L(m) + 30;
      const svg = svgRoot(svgHost, vbW, H, `Matrix A, ${m} by ${k}; matrix B, ${k} by ${n}; result C and D, ${m} by ${n}.`);
      const a = active();
      const lit = {
        A: ['H', 'in16', 'MMA', 'm', 'k'].includes(a), B: ['H', 'in16', 'MMA', 'n', 'k'].includes(a), C: ['F32', 'MMA', 'm', 'n'].includes(a),
      };
      const anyLit = !!a;
      function mat(x, y, rows, cols, color, name, sub, on) {
        const g = S('g', { style: `opacity:${!anyLit || on ? 1 : 0.35};transition:opacity .2s` }, svg);
        const w = L(cols), h = L(rows), cw = w / cols, ch = h / rows;
        S('rect', { x, y, width: w, height: h, rx: 3, style: `fill:${color};fill-opacity:${on ? 0.3 : 0.16};stroke:${color};stroke-width:${on ? 2 : 1.2}` }, g);
        if (Math.min(cw, ch) >= 3.2) {
          let d = '';
          for (let i = 1; i < rows; i++) d += `M${x} ${(y + i * ch).toFixed(2)}h${w.toFixed(2)}`;
          for (let j = 1; j < cols; j++) d += `M${(x + j * cw).toFixed(2)} ${y}v${h.toFixed(2)}`;
          S('path', { d, style: `stroke:${color};stroke-opacity:0.22;stroke-width:0.7;fill:none` }, g);
        }
        const big = w > name.length * 10 + 12 && h > 34;
        const subFits = sub && h > 50 && w > sub.length * 6.4 + 10;
        if (big) {
          Tx(g, x + w / 2, y + h / 2 + (subFits ? -2 : 5), name, { fill: 'var(--ink)', size: narrow ? 13 : 15, weight: 700, 'text-anchor': 'middle' });
          if (subFits) Tx(g, x + w / 2, y + h / 2 + 15, sub, { fill: 'var(--ink-2)', size: 10.5, 'text-anchor': 'middle' });
        }
        return big;
      }
      const bigA = mat(Ax, Ay, m, k, ROLE.A, 'A', `${m} × ${k} · FP16`, lit.A);
      const bigB = mat(Bx, By, k, n, ROLE.B, 'B', `${k} × ${n} · FP16`, lit.B);
      const bigC = mat(Cx, Cy, m, n, ROLE.D, 'C, D', `${m} × ${n} · FP32`, lit.C);
      if (!bigA) Tx(svg, Ax + L(k) / 2, Ay + L(m) + 16, 'A', { fill: ROLE.A, size: 12, weight: 700, 'text-anchor': 'middle' });
      if (!bigB) Tx(svg, Bx + L(n) + 6, By + L(k) / 2 + 4, 'B', { fill: ROLE.B, size: 12, weight: 700 });
      if (!bigC) Tx(svg, Cx + L(n) + 6, Cy + L(m) / 2 + 4, 'C, D', { fill: ROLE.D, size: 12, weight: 700 });
      if (notScale) Tx(svg, vbW - 4, H - 8, 'not to scale: thin dimensions widened', { fill: 'var(--ink-3)', size: 10.5, 'text-anchor': 'end' });
      // dimension brackets
      function bracket(x1, y1, x2, y2, label, key, anchor, lx, ly) {
        const on = a === key;
        const col = on ? 'var(--accent)' : 'var(--ink-3)';
        S('path', { d: `M${x1} ${y1}L${x2} ${y2}`, style: `stroke:${col};stroke-width:${on ? 2 : 1.2}` }, svg);
        const tick = 4;
        if (x1 === x2) S('path', { d: `M${x1 - tick} ${y1}h${2 * tick}M${x2 - tick} ${y2}h${2 * tick}`, style: `stroke:${col};stroke-width:1.2` }, svg);
        else S('path', { d: `M${x1} ${y1 - tick}v${2 * tick}M${x2} ${y2 - tick}v${2 * tick}`, style: `stroke:${col};stroke-width:1.2` }, svg);
        Tx(svg, lx, ly, label, { fill: on ? 'var(--accent)' : 'var(--ink-2)', size: narrow ? 11.5 : 12.5, weight: on ? 700 : 500, 'text-anchor': anchor });
      }
      bracket(Ax - 8, Ay, Ax - 8, Ay + L(m), `m = ${m}`, 'm', 'end', Ax - 14, Ay + L(m) / 2 + 4);
      bracket(Ax, Ay - 8, Ax + L(k), Ay - 8, `k = ${k}`, 'k', 'middle', Ax + L(k) / 2, Ay - 14);
      bracket(Bx, By - 8, Bx + L(n), By - 8, `n = ${n}`, 'n', 'middle', Bx + L(n) / 2, By - 14);
      // B's k label goes on its left when there is room, else on its right, so it never stacks on A's k label
      if (L(k) >= 100) bracket(Bx - 8, By, Bx - 8, By + L(k), `k = ${k}`, 'k', 'end', Bx - 14, By + L(k) / 2 + 4);
      else bracket(Bx + L(n) + 8, By, Bx + L(n) + 8, By + L(k), `k = ${k}`, 'k', 'start', Bx + L(n) + 14, By + L(k) / 2 + 4);
    }
    const stM = stat(f.readouts, { label: 'MACs · m × n × k', value: '', tone: 'core' });
    const stT = stat(f.readouts, { label: 'per thread · ÷ 32', value: '', tone: 'core' });
    const stF = stat(f.readouts, { label: 'FLOPs · 2 per MAC', value: '' });
    const stO = stat(f.readouts, { label: 'outputs · m × n', value: '', tone: 'control' });
    /* what the current shape is: a real SASS instruction, the PTX wmma shape, or a hypothetical one */
    function shape() {
      if (st.m === 16 && st.n === 8 && st.k === 16) return { sass: true, lead: 'One <code>HMMA16.16816.F32</code>' };
      if (st.m === 16 && st.n === 8 && st.k === 8) return { sass: true, lead: 'One <code>HMMA.1688.F32</code>' };
      if (st.m === 16 && st.n === 16 && st.k === 16) return { sass: false, ptx: true, lead: 'One PTX <code>wmma.mma</code> instruction of shape m16n16k16' };
      return { sass: false, lead: `A hypothetical m${st.m} n${st.n} k${st.k} MMA` };
    }
    function render() {
      const a = active();
      for (const id in btns) {
        const { b, t } = btns[id];
        b.querySelector('b').textContent = typeof t.t === 'function' ? t.t() : t.t;
        b.setAttribute('aria-pressed', String(st.pin === id));
      }
      exp.innerHTML = (EXPL[a] || EXPL.none)();
      const sh = shape();
      tokRow.classList.toggle('hyp', !sh.sass);
      tag.innerHTML = sh.sass ? '' : sh.ptx
        ? '<b>Not one SASS instruction:</b> ptxas splits this PTX shape into 2, 4 or 16 HMMAs, depending on the target (Fig. 9). The greyed tokens belong to the glossary’s example.'
        : '<b>Not a real instruction shape.</b> The greyed tokens belong to the glossary’s example; the counts below hold for any m, n and k.';
      const macs = st.m * st.n * st.k;
      const per = macs / 32;
      const perS = Number.isInteger(per) ? fmt.int(per) : fmt.sig(per, 3);
      calc.innerHTML = `<span><b>m × n × k</b> = ${st.m} × ${st.n} × ${st.k} = <b class="big">${fmt.int(macs)}</b> ${plural(macs, 'MAC')}</span><span>÷ 32 threads = <b class="big">${perS}</b> per thread</span>`;
      stM.set(fmt.int(macs)); stT.set(perS); stF.set(fmt.int(2 * macs)); stO.set(fmt.int(st.m * st.n));
      const outs = st.m * st.n;
      f.setWhy(`${sh.lead} computes ${outs === 1 ? 'the single element' : `all <b>${fmt.int(outs)}</b> elements`} of the ${st.m} × ${st.n} result, ${outs === 1 ? 'a' : 'each a'} sum of <b>${st.k}</b> ${plural(st.k, 'product')}: ${fmt.int(macs)} ${plural(macs, 'multiply-accumulate')}. The 32 threads of a warp execute it together, so each thread’s share is <b>${perS}</b> ${plural(per, 'MAC')} per instruction, where a scalar FMA on a CUDA Core does one.${sh.ptx ? ' On a real GPU this work is done by several smaller HMMA instructions (Fig. 9).' : ''}`);
      drawSvg();
    }
    const PRE = [
      { value: '16816', label: '16 8 16 · glossary', m: 16, n: 8, k: 16 },
      { value: '1688', label: '16 8 8 · HMMA.1688', m: 16, n: 8, k: 8 },
      { value: '161616', label: '16 16 16 · wmma (PTX)', m: 16, n: 16, k: 16 },
    ];
    let preSeg, slM, slN, slK;
    function syncPre() { const p = PRE.find((q) => q.m === st.m && q.n === st.n && q.k === st.k); preSeg.set(p ? p.value : null, false); }
    preSeg = GG.ui.seg(f.controls, { label: 'Preset', value: '16816', options: PRE.map((p) => ({ value: p.value, label: p.label })), onChange: (v) => { const p = PRE.find((q) => q.value === v); st.m = p.m; st.n = p.n; st.k = p.k; slM.set(p.m); slN.set(p.n); slK.set(p.k); render(); } });
    slM = GG.ui.slider(f.controls, { label: 'm (rows)', min: 1, max: 64, step: 1, value: st.m, onInput: (v) => { st.m = clamp(Math.round(v), 1, 64); syncPre(); render(); } });
    slN = GG.ui.slider(f.controls, { label: 'n (columns)', min: 1, max: 64, step: 1, value: st.n, onInput: (v) => { st.n = clamp(Math.round(v), 1, 64); syncPre(); render(); } });
    slK = GG.ui.slider(f.controls, { label: 'k (inner)', min: 1, max: 64, step: 1, value: st.k, onInput: (v) => { st.k = clamp(Math.round(v), 1, 64); syncPre(); render(); } });
    onWidth(svgHost, (w) => { W = w; drawSvg(); });
    render();
  }

  /* ── Fig 5: a systolic array (TPU style) ── */
  function tcSystolic(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'A 4 × 4 systolic array computing Y = X · W', hint: 'step through the cycles or press play · follow one input vector', wide: false,
      caption: 'A weight-stationary systolic array, the design of the matrix unit in Google’s first TPU (which has 256 × 256 cells). The weights W stay in the cells (the blue “w=” in each corner). Each input vector (a row of X) enters from the left spread over the array’s four rows, each row one cycle behind the one above. Every busy cell shows its step as <span class="c-control">in</span> + x·w = out (on phones, the followed vector’s steps are listed under the grid): the partial sum arriving from the cell above, plus the input arriving from the left times its weight; it passes the sum down and the input right. Sums leave the bottom edge as outputs. One instruction drives the whole wave. Whether NVIDIA’s Tensor Cores work this way is not publicly known.',
    });
    const K = 4, N = 4, NB = 4, LAST = (NB - 1) + (K - 1) + (N - 1); // busy cycles 0..LAST, then a "done" frame
    const Wm = [[1, 2, 0, 1], [3, 1, 2, 0], [0, 1, 1, 2], [2, 0, 3, 1]];
    const Xm = [[1, 0, 2, 1], [2, 1, 0, 3], [0, 2, 1, 1], [1, 1, 1, 0]];
    const psum = (b, n, k) => { let v = 0; for (let q = 0; q <= k; q++) v += Xm[b][q] * Wm[q][n]; return v; };
    const Y = Xm.map((row, b) => [0, 1, 2, 3].map((n) => psum(b, n, K - 1)));
    const wrap = el('div', { class: 'hwb-w hwb-sys' });
    const call = el('div', { class: 'hwb-sys-call', 'aria-live': 'polite' });
    f.stage.append(wrap, call);
    let G = null, cur = 0, follow = 0;
    function build(narrow) {
      wrap.innerHTML = '';
      const cs = narrow ? 58 : 66, qs = narrow ? 22 : 28, ax = narrow ? 150 : 196, ay = 60, tr = narrow ? 9 : 10.5;
      const vbW = ax + N * cs + 8, vbH = ay + K * cs + 24 + NB * 27 + 10;
      const svg = svgRoot(wrap, vbW, vbH, 'A four by four grid of multiply-accumulate cells holding weights. Input values queue on the left and move right; partial sums move down; outputs collect below each column, one row per input vector.');
      Tx(svg, 4, 22, 'inputs X →', { fill: 'var(--memory)', size: 13, weight: 600 });
      Tx(svg, ax, 22, 'weights W stay in the cells', { fill: 'var(--ink-2)', size: 12.5 });
      Tx(svg, ax, 41, 'partial sums flow down ↓', { fill: 'var(--control)', size: 11.5 });
      const cells = [];
      for (let k = 0; k < K; k++) {
        for (let n = 0; n < N; n++) {
          const g = S('g', {}, svg);
          const x = ax + n * cs, y = ay + k * cs;
          const r = S('rect', { class: 'hwb-pe', x: x + 3, y: y + 3, width: cs - 6, height: cs - 6, rx: 8 }, g);
          Tx(g, x + cs - 8, y + (narrow ? 16 : 16), 'w=' + Wm[k][n], { fill: 'var(--memory)', size: narrow ? 12.5 : 11.5, weight: 600, 'text-anchor': 'end' });
          const v = Tx(g, x + cs - 8, y + cs / 2 + (narrow ? 6 : 7), '', { fill: 'var(--ink)', size: narrow ? 15 : 17, weight: 700, 'text-anchor': 'end' });
          const eq = Tx(g, x + cs / 2, y + cs - (narrow ? 8 : 9), '', { size: narrow ? 9.5 : 10.5, 'text-anchor': 'middle' });
          cells.push({ k, n, r, v, eq });
        }
      }
      const toks = [];
      for (let b = 0; b < NB; b++) {
        for (let k = 0; k < K; k++) {
          const g = S('g', { class: 'hwb-mov' }, svg);
          const c = S('circle', { cx: 0, cy: 0, r: tr, style: 'fill:var(--bg);stroke:var(--memory);stroke-width:1.6' }, g);
          Tx(g, 0, 4.4, String(Xm[b][k]), { fill: 'var(--memory)', size: narrow ? 12 : 13, weight: 700, 'text-anchor': 'middle' });
          toks.push({ b, k, g, c });
        }
      }
      const outs = [];
      const oy = ay + K * cs + 18;
      Tx(svg, 4, oy + 15, 'outputs Y', { fill: 'var(--control)', size: 12.5, weight: 600 });
      Tx(svg, 4, oy + 33, 'one row per', { fill: 'var(--ink-3)', size: 10.5 });
      Tx(svg, 4, oy + 47, 'input vector', { fill: 'var(--ink-3)', size: 10.5 });
      const rowLabs = [];
      for (let b = 0; b < NB; b++) rowLabs.push(Tx(svg, ax - 6, oy + b * 27 + 16, `y${b} ← x${b}`, { fill: 'var(--ink-3)', size: 10.5, 'text-anchor': 'end' }));
      for (let n = 0; n < N; n++) {
        for (let b = 0; b < NB; b++) {
          const x = ax + n * cs + 7, y = oy + b * 27;
          const r = S('rect', { x, y, width: cs - 14, height: 23, rx: 5 }, svg);
          const t = Tx(svg, x + (cs - 14) / 2, y + 16.5, '', { fill: 'var(--control)', size: 13, weight: 700, 'text-anchor': 'middle' });
          outs.push({ n, b, r, t });
        }
      }
      G = { cells, toks, outs, rowLabs, cs, qs, ax, ay, narrow };
    }
    const stC = stat(f.readouts, { label: 'cycle', value: '' });
    const stM = stat(f.readouts, { label: 'MACs so far', value: '', tone: 'core' });
    const stO = stat(f.readouts, { label: 'outputs done', value: '', tone: 'control' });
    stat(f.readouts, { label: 'instructions', value: '1' });
    function eqSpans(t, parts) {
      t.textContent = '';
      parts.forEach(([txt, c, w]) => { const e = S('tspan', { style: `fill:${c};${w ? 'font-weight:700' : ''}` }, t); e.textContent = txt; });
    }
    function show(t) {
      cur = t;
      if (!G) return;
      const { cells, toks, outs, rowLabs, cs, qs, ax, ay } = G;
      const done = t > LAST;
      let busy = 0, fCells = 0;
      cells.forEach((c) => {
        const b = t - c.k - c.n;
        const on = !done && b >= 0 && b < NB;
        if (on) busy++;
        const fol = on && b === follow;
        if (fol) fCells++;
        c.r.setAttribute('style', on ? `fill:rgba(69,212,155,0.26);stroke:${fol ? 'var(--accent)' : 'var(--core)'};stroke-width:${fol ? 2.6 : 1.8}` : 'fill:rgba(69,212,155,0.05);stroke:rgba(69,212,155,0.35);stroke-width:1.2');
        c.v.textContent = on ? String(psum(b, c.n, c.k)) : '';
        if (on && !G.narrow) {
          const inn = c.k ? psum(b, c.n, c.k - 1) : 0;
          eqSpans(c.eq, [[String(inn), 'var(--control)'], ['+', 'var(--ink-3)'], [String(Xm[b][c.k]), 'var(--memory)'], ['·', 'var(--ink-3)'], [String(Wm[c.k][c.n]), 'var(--memory)'], ['=', 'var(--ink-3)'], [String(psum(b, c.n, c.k)), 'var(--ink)', 1]]);
        } else c.eq.textContent = '';
      });
      toks.forEach((o) => {
        const col = t - o.b - o.k;
        let x, vis = 1;
        if (done || col >= N) { x = ax + N * cs - 16; vis = 0; }
        else if (col >= 0) x = ax + col * cs + (G.narrow ? 15 : 17);
        else x = ax - 16 + (col + 1) * qs;
        const y = ay + o.k * cs + cs / 2;
        o.g.style.transform = `translate(${x}px, ${y}px)`;
        o.g.style.opacity = vis;
        const fol = o.b === follow;
        o.c.setAttribute('style', `fill:var(--bg);stroke:${fol ? 'var(--accent)' : 'var(--memory)'};stroke-width:${fol ? 2.6 : 1.6}`);
      });
      let nd = 0;
      outs.forEach((o) => {
        const ready = done || t >= o.b + (K - 1) + o.n;
        if (ready) nd++;
        o.t.textContent = ready ? String(Y[o.b][o.n]) : '';
        const fol = o.b === follow;
        o.r.setAttribute('style', ready ? `fill:var(--control-a);stroke:${fol ? 'var(--accent)' : 'var(--control)'};stroke-width:${fol ? 2.2 : 1.2}` : `fill:none;stroke:${fol ? 'var(--accent)' : 'var(--line-2)'};stroke-dasharray:3 3`);
      });
      rowLabs.forEach((r, b) => { r.style.fill = b === follow ? 'var(--ink)' : 'var(--ink-3)'; r.style.fontWeight = b === follow ? '700' : '400'; });
      // phones: the cells are too small for their step equations, so the followed vector's steps are listed here
      call.hidden = !G.narrow;
      if (G.narrow) {
        const sp = (t2, c) => `<span style="color:${c}">${t2}</span>`;
        const mine = done ? [] : cells.filter((c) => t - c.k - c.n === follow);
        if (follow < 0) call.innerHTML = '<span class="hwb-hint">Follow an input vector to see each of its cells’ steps here.</span>';
        else if (!mine.length) call.innerHTML = `<span class="hwb-hint">x${follow}: ${done || t > follow + (K - 1) + (N - 1) ? 'finished' : 'still queued'}, no cell busy with it this cycle.</span>`;
        else call.innerHTML = `<div class="hwb-hint">x${follow} now · (row, col): ${sp('in', 'var(--control)')} + x·w = out</div>` + mine.map((c) => {
          const inn = c.k ? psum(follow, c.n, c.k - 1) : 0;
          return `<span class="hwb-sys-eq">(${c.k}, ${c.n}): ${sp(inn, 'var(--control)')} + ${sp(Xm[follow][c.k], 'var(--memory)')}·${sp(Wm[c.k][c.n], 'var(--memory)')} = <b>${psum(follow, c.n, c.k)}</b></span>`;
        }).join('');
      }
      let macs = 0;
      for (let b = 0; b < NB; b++) for (let k = 0; k < K; k++) for (let n = 0; n < N; n++) if (done || b + k + n <= t) macs++;
      stC.set(done ? 'done' : `${t} / ${LAST}`);
      stM.set(`${macs} / ${NB * K * N}`);
      stO.set(`${nd} / ${NB * N}`);
      let fs = '';
      if (follow >= 0) {
        const fb = follow;
        if (done || t > fb + (K - 1) + (N - 1)) fs = ` Input vector x${fb} (outlined) is finished: row y${fb} = [${Y[fb].join(', ')}].`;
        else if (t < fb) fs = ` Input vector x${fb} (outlined) is still queued; its first value enters in cycle ${fb}.`;
        else fs = ` Input vector x${fb} (outlined) is in <b>${fCells}</b> ${plural(fCells, 'cell')} this cycle, on a diagonal; its finished sums collect in row y${fb}.`;
      }
      if (done) f.setWhy(`All <b>${NB * N}</b> outputs have left the bottom edge: <b>${NB * K * N}</b> multiply-accumulates in ${LAST + 1} cycles, and no instruction was fetched after the first. Check one: y[0][0] = 1·1 + 0·3 + 2·0 + 1·2 = <b>${Y[0][0]}</b>, the four steps the top-left column of cells did for x0. A TPU’s matrix unit has 256 × 256 = 65,536 such cells.`);
      else if (t === 0) f.setWhy('Cycle 0: the first input, x0[0] = 1, meets the weight in the top-left cell, w=1: 0 + 1·1 = 1, and the cell passes the sum 1 down. Every other input is still queued, each row one cycle behind the row above it.' + fs);
      else f.setWhy(`Cycle ${t}: <b>${busy}</b> of 16 cells are busy, a diagonal wavefront moving down and to the right. Each busy cell shows <span class="c-control">in</span> + x·w = out: the partial sum from the cell above, plus the input arriving from the left times the weight it holds. It passes the input right and the sum down.` + fs);
    }
    onWidth(wrap, (w) => { const narrow = w < 480; if (!G || G.narrow !== narrow) { build(narrow); show(cur); } });
    const steps = [];
    for (let t = 0; t <= LAST + 1; t++) steps.push({ label: t > LAST ? 'done' : 'cycle ' + t });
    GG.ui.stepper(f.controls, { label: 'Cycle', steps, autoplay: 1100, start: 0, onStep: (t) => { show(t); stepOut(f.controls, steps[t].label); } });
    GG.ui.seg(f.controls, { label: 'Follow input vector', value: 0, options: [{ value: -1, label: 'none' }, { value: 0, label: 'x0' }, { value: 1, label: 'x1' }, { value: 2, label: 'x2' }, { value: 3, label: 'x3' }], onChange: (v) => { follow = v; show(cur); } });
  }

  /* ── Fig 6: the compile chain ── */
  function tcChain(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'One line, three levels: CUDA C++ → PTX → SASS', hint: 'step through · hover a register', wide: true,
      caption: 'All three code blocks are verbatim from the glossary (the PTX is one line, wrapped here to fit). Colours match each operand across levels: <span class="c-control">D, the output</span>, <span class="c-special">A</span>, <span class="c-memory">B</span> and C, the accumulator, which starts as zeros. We found these four SASS lines in the sm_75 (Turing) output of the glossary’s Godbolt link; other targets compile differently (Fig. 9).',
    });
    const box = el('div', { class: 'hwb-chain' });
    f.stage.append(box);
    opKey(f.stage, true);
    const lvC = el('div', { class: 'hwb-lv' }), lvP = el('div', { class: 'hwb-lv' }), lvS = el('div', { class: 'hwb-lv' });
    box.append(lvC, el('div', { class: 'hwb-arrow', html: '<b>nvcc</b> compiles CUDA C++ to the PTX intermediate representation' }), lvP, el('div', { class: 'hwb-arrow', html: '<b>ptxas</b> assembles PTX into SASS for one SM architecture' }), lvS);
    const cpp = GG.code(lvC, { lang: 'cpp', code: CPP_LINE, caption: 'CUDA C++ · the call', lineNumbers: false });
    const ptx = GG.code(lvP, { lang: 'ptx', code: PTX_LINE, caption: 'PTX · one instruction', lineNumbers: false });
    ptx.el.classList.add('hwb-wrapcode');
    const sass = GG.code(lvS, { lang: 'sass', code: SASS_CODE, caption: 'SASS · four instructions', lineNumbers: false });
    tagCpp(cpp); tagPtx(ptx); tagSass(sass);
    const ops = $$(box, '.hwb-op');
    const shapes = $$(box, '.hwb-shape').map((sp) => ({ sp, lv: lvC.contains(sp) ? 'C' : 'P' }));
    const GROUP = {
      D: '<b class="c-control">D, the output.</b> In C++ it is the first <code>c</code>. In PTX it is the eight 32-bit float registers <code>%f2</code>–<code>%f9</code> that each thread holds: 8 × 32 threads = 256 values, the 16 × 16 result. In SASS it is <b>R20</b> and <b>R24</b>, the left and right halves of the result (each thread’s R20 stands for R20–R23, and R24 for R24–R27).',
      A: '<b class="c-special">A.</b> <code>a</code> in C++; <code>%r2</code>–<code>%r9</code> in PTX, 32-bit registers that each hold two 16-bit halves; <b>R12</b> and <b>R14</b> in SASS (R12–R13 and R14–R15 per thread), the first and second eight columns of A. <b>Why fewer registers in SASS?</b> PTX’s <code>wmma</code> fragment for a 16 × 16 FP16 operand gives each thread eight 32-bit registers, 16 halves, twice the 256 ÷ 32 = 8 halves each thread needs; how the elements are spread over the threads is left unspecified, so some can be held twice. ptxas, which knows the real layout for sm_75, uses only four registers per thread per operand.',
      B: '<b class="c-memory">B.</b> <code>b</code> in C++; <code>%r10</code>–<code>%r17</code> in PTX; in SASS four registers, one per 8 × 8 tile of B: <b>R11</b> and <b>R17</b> hold the first eight rows (left and right halves), <b>R16</b> and <b>R18</b> the second eight rows. <b>Why fewer registers in SASS?</b> PTX’s <code>wmma</code> fragment for a 16 × 16 FP16 operand gives each thread eight 32-bit registers, 16 halves, twice the 256 ÷ 32 = 8 halves each thread needs; how the elements are spread over the threads is left unspecified, so some can be held twice. ptxas, which knows the real layout for sm_75, uses only four registers per thread per operand.',
      C: '<b>C, the accumulator.</b> The last <code>c</code>, all zeros. PTX passes one register eight times, <code>%f1</code>, which the full PTX sets just before with <code>mov.f32 %f1, 0f00000000;</code> (0f00000000 is the bit pattern of 0.0). ptxas replaces it with <b>RZ</b>, the zero register, in instructions 1 and 2. Instructions 3 and 4 use <b class="c-control">R20</b> and <b class="c-control">R24</b> as C: they accumulate onto what 1 and 2 wrote.',
    };
    const STEPS = [
      { label: 'the CUDA C++ call', focus: 'C', grp: null, shape: 'C', why: '<b>One line of CUDA C++.</b> The call’s general form is <code>mma_sync(d, a, b, c)</code>: it multiplies two 16 × 16 matrices held by a whole warp, <code>a</code> and <code>b</code>, adds the last argument, the accumulator <code>c</code>, and writes the result to the first: d = a @ b + c. In <code>wmma::mma_sync(c, a, b, c)</code> the first and last arguments are the same fragment, <code>c</code>, which starts as all zeros; its first appearance marks it as the output too, so the line computes C = A @ B. <code>mma_sync</code> is an intrinsic: a function the compiler replaces with a PTX instruction.' },
      { label: 'the PTX instruction', focus: 'P', grp: null, shape: 'P', why: '<b>nvcc turns the call into one PTX instruction.</b> <code>wmma.mma</code> is the warp-level matrix multiply-accumulate. <code>.sync</code> and <code>.aligned</code> say that all 32 threads of the warp execute it together. <code>.col.row</code> are the memory layouts of A (column-major) and B (row-major). <code>.m16n16k16</code> is the shape, and <code>.f32.f32</code> are the types of D and C.' },
      { label: 'D, the output', focus: 'all', grp: 'D' },
      { label: 'A', focus: 'all', grp: 'A' },
      { label: 'B', focus: 'all', grp: 'B' },
      { label: 'C, the zeros', focus: 'all', grp: 'C' },
      { label: 'four SASS instructions', focus: 'S', grp: 'all', why: '<b>ptxas turns one PTX instruction into four SASS instructions.</b> Each <code>HMMA.1688.F32</code> multiplies a 16 × 8 slice of A by an 8 × 8 tile of B (16 × 8 × 8 = 1,024 MACs), and four of them make the 16 × 16 × 16 = 4,096 MACs of the PTX instruction. Read each as <b>D = A @ B + C</b>: instruction 3 writes R20 from R14 and R16, and adds the old R20.' },
    ];
    let cur = 0, hov = null;
    function paint() {
      const s = STEPS[cur];
      const g = hov || s.grp;
      lvC.classList.toggle('dim', !hov && s.focus !== 'C' && s.focus !== 'all');
      lvP.classList.toggle('dim', !hov && s.focus !== 'P' && s.focus !== 'all');
      lvS.classList.toggle('dim', !hov && s.focus !== 'S' && s.focus !== 'all');
      ops.forEach((sp) => sp.classList.toggle('on', g === 'all' || sp.getAttribute('data-g') === g));
      shapes.forEach(({ sp, lv }) => sp.classList.toggle('on', !hov && s.shape === lv));
      sass.clear();
      if (!hov && s.focus === 'S') sass.highlight([1, 2, 3, 4], 'core');
      f.setWhy(hov ? GROUP[hov] : (s.why || GROUP[s.grp]));
    }
    ops.forEach((sp) => {
      sp.addEventListener('mouseenter', () => { hov = sp.getAttribute('data-g'); paint(); });
      sp.addEventListener('mouseleave', () => { hov = null; paint(); });
      sp.addEventListener('click', () => { const g = sp.getAttribute('data-g'); const k = STEPS.findIndex((x) => x.grp === g); if (k >= 0) { hov = null; stp.go(k); } });
    });
    const stp = GG.ui.stepper(f.controls, { label: 'Walk the chain', steps: STEPS, autoplay: 3200, start: 0, onStep: (i) => { cur = i; paint(); stepOut(f.controls, STEPS[i].label); } });
    stat(f.readouts, { label: 'C++ calls', value: '1' });
    stat(f.readouts, { label: 'PTX instructions', value: '1' });
    stat(f.readouts, { label: 'SASS instructions', value: String(sass.lines.length), tone: 'core' });
    stat(f.readouts, { label: 'MACs', value: fmt.int(16 * 16 * 16), tone: 'core' });
  }

  /* ── Fig 7 (new): from a large matrix multiply down to one HMMA ── */
  function tcTiling(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'From a large matrix multiply to one Tensor Core instruction', hint: 'step through the zoom · tap a tile of C · change the size', wide: true,
      caption: 'The simplest way to tile C = A @ B for the warp-level <code>wmma</code> API: each 16 × 16 tile of C belongs to one warp, which walks along k calling <code>mma_sync</code> once per 16 × 16 × 16 block, and each call becomes four <code>HMMA.1688</code> instructions on sm_75 (Figs. 6 and 8). Real libraries use bigger tiles per thread block and reuse data through shared memory, but the arithmetic always breaks down this way. Colours name operands: A pink, B blue, C amber.',
    });
    const SIZES = [64, 128, 256, 512];
    const st = { N: 256, lv: 0, ti: 1, tj: 2, ks: 0 };
    const LV = [{ label: 'the whole multiply' }, { label: 'one output tile' }, { label: 'one mma_sync' }, { label: 'one HMMA.1688' }];
    const host = el('div', { class: 'hwb-w hwb-tile' });
    f.stage.append(host);
    opKey(f.stage, false);
    let W = 0, G = null;
    const TT = () => st.N / 16;
    function build() {
      host.innerHTML = '';
      if (!W) return;
      const narrow = W < 640;
      const L = narrow
        ? { vbW: 360, vbH: 552, S: 118, A: [26, 150], B: [158, 24], C: [158, 150], Z: 86, zA: [40, 436], zB: [176, 342], zC: [176, 436], zf: [8, 302, 344, 244] }
        : { vbW: 1000, vbH: 372, S: 150, A: [44, 192], B: [214, 30], C: [214, 192], Z: 124, zA: [610, 214], zB: [760, 74], zC: [760, 214], zf: [574, 30, 418, 330] };
      const svg = svgRoot(host, L.vbW, L.vbH, 'Left: matrices A, B and C with C cut into 16 by 16 tiles; one tile and the strips of A and B it needs are highlighted. Right: that tile’s 16 by 16 by 16 block, split into the halves and quarters that individual HMMA instructions use.');
      const sz = L.S;
      const mat = (x, y, w, h, c, op) => S('rect', { x, y, width: w, height: h, style: `fill:${c};fill-opacity:${op};stroke:${c};stroke-width:1.2` }, svg);
      mat(L.A[0], L.A[1], sz, sz, ROLE.A, 0.08); mat(L.B[0], L.B[1], sz, sz, ROLE.B, 0.08); mat(L.C[0], L.C[1], sz, sz, ROLE.D, 0.08);
      const T = TT(), cs = sz / T;
      let d = '';
      for (let i = 1; i < T; i++) d += `M${L.C[0]} ${(L.C[1] + i * cs).toFixed(2)}h${sz}M${(L.C[0] + i * cs).toFixed(2)} ${L.C[1]}v${sz}`;
      S('path', { d, style: `stroke:${ROLE.D};stroke-opacity:0.3;stroke-width:0.7;fill:none` }, svg);
      const fs = narrow ? 11 : 12;
      Tx(svg, L.A[0] + sz / 2, L.A[1] + sz + 16, `A · ${st.N} × ${st.N}`, { fill: ROLE.A, size: fs, weight: 600, 'text-anchor': 'middle' });
      Tx(svg, L.B[0] + sz + 6, L.B[1] + 12, 'B', { fill: ROLE.B, size: fs, weight: 600 });
      Tx(svg, L.B[0] + sz + 6, L.B[1] + 26, `${st.N} × ${st.N}`, { fill: ROLE.B, size: fs - 1 });
      Tx(svg, L.C[0] + sz / 2, L.C[1] + sz + 16, `C · ${T} × ${T} tiles`, { fill: ROLE.D, size: fs, weight: 600, 'text-anchor': 'middle' });
      // highlights in the big panel
      const hl = (c) => S('rect', { x: 0, y: 0, width: 0, height: 0, style: `fill:${c};fill-opacity:0.28;stroke:${c};stroke-width:1.4;pointer-events:none` }, svg);
      const strA = hl(ROLE.A), strB = hl(ROLE.B), blkA = hl(ROLE.A), blkB = hl(ROLE.B), tile = hl(ROLE.D);
      // when a 16 × 16 tile is only a few pixels wide, rings mark where to look
      const ring = (c) => S('circle', { r: 11, cx: -50, cy: -50, style: `fill:none;stroke:${c};stroke-width:1.8;pointer-events:none;opacity:0` }, svg);
      const rings = { tile: ring('var(--accent)'), a: ring(ROLE.A), b: ring(ROLE.B) };
      // clickable tiles of C
      const hit = S('rect', { class: 'hwb-tsel', x: L.C[0], y: L.C[1], width: sz, height: sz, style: 'fill:transparent' }, svg);
      hit.addEventListener('click', (e) => {
        const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
        const m = svg.getScreenCTM(); if (!m) return;
        const q = pt.matrixTransform(m.inverse());
        st.ti = clamp(Math.floor((q.y - L.C[1]) / cs), 0, T - 1); st.tj = clamp(Math.floor((q.x - L.C[0]) / cs), 0, T - 1);
        if (st.lv === 0) stp.go(1); else paint();
      });
      // zoom panel
      const [fx, fy, fw, fh] = L.zf;
      const zoomG = S('g', {}, svg);
      S('rect', { x: fx, y: fy, width: fw, height: fh, rx: 12, style: 'fill:rgba(255,255,255,0.015);stroke:var(--line-2);stroke-dasharray:5 4' }, zoomG);
      const zTitle = Tx(zoomG, fx + 12, fy + 20, '', { fill: 'var(--ink-2)', size: narrow ? 11 : 12, weight: 600 });
      const Z = L.Z, h = Z / 2;
      const zr = (x, y, w, hh, c) => S('rect', { x: x + 0.5, y: y + 0.5, width: w - 1, height: hh - 1, rx: 2, style: `fill:${c};fill-opacity:0.12;stroke:${c};stroke-width:1.2` }, zoomG);
      const zt = (x, y, t, c) => Tx(zoomG, x, y, t, { fill: c, size: narrow ? 10 : 11, weight: 600, 'text-anchor': 'middle' });
      const zParts = {
        A0: zr(L.zA[0], L.zA[1], h, Z, ROLE.A), A1: zr(L.zA[0] + h, L.zA[1], h, Z, ROLE.A),
        B00: zr(L.zB[0], L.zB[1], h, h, ROLE.B), B01: zr(L.zB[0] + h, L.zB[1], h, h, ROLE.B), B10: zr(L.zB[0], L.zB[1] + h, h, h, ROLE.B), B11: zr(L.zB[0] + h, L.zB[1] + h, h, h, ROLE.B),
        C0: zr(L.zC[0], L.zC[1], h, Z, ROLE.D), C1: zr(L.zC[0] + h, L.zC[1], h, Z, ROLE.D),
      };
      zt(L.zA[0] + h / 2, L.zA[1] + Z / 2 + 4, 'k 0–7', ROLE.A); zt(L.zA[0] + h * 1.5, L.zA[1] + Z / 2 + 4, 'k 8–15', ROLE.A);
      zt(L.zA[0] + Z / 2, L.zA[1] + Z + 15, 'A block · 16 × 16', ROLE.A);
      zt(L.zB[0] + Z + (narrow ? 26 : 32), L.zB[1] + h / 2 + 4, 'k 0–7', ROLE.B); zt(L.zB[0] + Z + (narrow ? 26 : 32), L.zB[1] + h * 1.5 + 4, 'k 8–15', ROLE.B);
      zt(L.zC[0] + Z / 2, L.zC[1] + Z + 15, 'C tile · by columns', ROLE.D);
      zt(L.zC[0] + h / 2, L.zC[1] + Z / 2 + 4, '0–7', ROLE.D); zt(L.zC[0] + h * 1.5, L.zC[1] + Z / 2 + 4, '8–15', ROLE.D);
      // zoom connectors from the tile to the zoom frame
      const con = [0, 1].map(() => S('line', { style: 'stroke:var(--ink-3);stroke-width:1;stroke-dasharray:3 3' }, svg));
      G = { L, svg, cs, strA, strB, blkA, blkB, tile, zoomG, zTitle, zParts, con, narrow, rings };
      paint();
    }
    const stTiles = stat(f.readouts, { label: 'output tiles = warps', value: '', tone: 'control' });
    const stCalls = stat(f.readouts, { label: 'mma_sync calls', value: '' });
    const stH = stat(f.readouts, { label: 'HMMA.1688 (sm_75)', value: '', tone: 'core' });
    const stMac = stat(f.readouts, { label: 'MACs · N³', value: '', tone: 'core' });
    function setR(r, x, y, w, h) { r.setAttribute('x', x); r.setAttribute('y', y); r.setAttribute('width', Math.max(0, w)); r.setAttribute('height', Math.max(0, h)); }
    function paint() {
      const T = TT();
      st.ti = clamp(st.ti, 0, T - 1); st.tj = clamp(st.tj, 0, T - 1); st.ks = clamp(st.ks, 0, T - 1);
      const N = st.N, macs = N * N * N;
      stTiles.set(fmt.int(T * T)); stCalls.set(`${fmt.int(T * T * T)} (${T} per tile)`); stH.set(fmt.int(4 * T * T * T)); stMac.set(fmt.int(macs));
      if (ksl) { ksl.input.max = String(T); ksl.set(st.ks + 1); }
      if (G) {
        const { L, cs, strA, strB, blkA, blkB, tile, zoomG, zTitle, zParts, con } = G;
        const lv = st.lv, sz = L.S;
        const on1 = lv >= 1;
        // a highlighted strip or block is drawn at least MINW wide, centred on where it really is
        const MINW = 3.5, mw = Math.max(cs, MINW), o = (mw - cs) / 2;
        setR(tile, L.C[0] + st.tj * cs - o, L.C[1] + st.ti * cs - o, on1 ? mw : 0, on1 ? mw : 0);
        tile.style.fillOpacity = on1 ? 0.7 : 0;
        setR(strA, L.A[0], L.A[1] + st.ti * cs - o, on1 ? sz : 0, mw); strA.style.fillOpacity = on1 ? 0.16 : 0; strA.style.strokeOpacity = on1 ? 0.6 : 0;
        setR(strB, L.B[0] + st.tj * cs - o, L.B[1], mw, on1 ? sz : 0); strB.style.fillOpacity = on1 ? 0.16 : 0; strB.style.strokeOpacity = on1 ? 0.6 : 0;
        setR(blkA, L.A[0] + st.ks * cs - o, L.A[1] + st.ti * cs - o, on1 ? mw : 0, mw); blkA.style.fillOpacity = on1 ? 0.75 : 0;
        setR(blkB, L.B[0] + st.tj * cs - o, L.B[1] + st.ks * cs - o, mw, on1 ? mw : 0); blkB.style.fillOpacity = on1 ? 0.75 : 0;
        const small = on1 && cs < 10;
        const place = (c, x, y) => { c.setAttribute('cx', x); c.setAttribute('cy', y); c.style.opacity = small ? 1 : 0; };
        place(G.rings.tile, L.C[0] + (st.tj + 0.5) * cs, L.C[1] + (st.ti + 0.5) * cs);
        place(G.rings.a, L.A[0] + (st.ks + 0.5) * cs, L.A[1] + (st.ti + 0.5) * cs);
        place(G.rings.b, L.B[0] + (st.tj + 0.5) * cs, L.B[1] + (st.ks + 0.5) * cs);
        const z = lv >= 2;
        zoomG.style.opacity = z ? 1 : 0.28;
        zTitle.textContent = lv >= 3 ? 'zoom: HMMA 1 of this mma_sync' : lv === 2 ? `zoom: mma_sync, k-step ${st.ks + 1} of ${T}` : 'zoom (steps 3 and 4)';
        const lit = lv === 3 ? ['A0', 'B00', 'C0'] : lv === 2 ? ['A0', 'B00', 'B01', 'C0', 'C1'] : [];
        Object.keys(zParts).forEach((k) => { const r = zParts[k]; const o = lit.includes(k); r.style.fillOpacity = o ? 0.42 : 0.1; r.style.strokeWidth = o ? 2.4 : 1.2; });
        const tx = L.C[0] + st.tj * cs, ty = L.C[1] + st.ti * cs;
        const ends = G.narrow ? [[tx, ty + cs, L.zf[0], L.zf[1]], [tx + cs, ty + cs, L.zf[0] + L.zf[2], L.zf[1]]] : [[tx + cs, ty, L.zf[0], L.zf[1]], [tx + cs, ty + cs, L.zf[0], L.zf[1] + L.zf[3]]];
        con.forEach((c, i) => { const e = ends[i]; c.setAttribute('x1', e[0]); c.setAttribute('y1', e[1]); c.setAttribute('x2', e[2]); c.setAttribute('y2', e[3]); c.style.opacity = z ? 0.8 : 0; });
      }
      const r0 = st.ti * 16, c0 = st.tj * 16, k0 = st.ks * 16;
      const WHY = [
        `<b>The whole multiply.</b> C = A @ B with ${N} × ${N} matrices is ${N} × ${N} × ${N} = <b>${fmt.int(macs)}</b> multiply-accumulates. No instruction does that at once, so the work is cut into 16 × 16 tiles of C: ${T} × ${T} = <b>${fmt.int(T * T)}</b> of them, each computed by one warp in the simplest scheme. Tap a tile of C.`,
        `<b>One output tile</b>, rows ${r0}–${r0 + 15} and columns ${c0}–${c0 + 15} of C. It needs the 16-row strip of A and the 16-column strip of B that cross it, each ${N} long. Cut along k into ${T} blocks of 16, and the warp calls <code>mma_sync</code> <b>${T}</b> ${plural(T, 'time')}, each adding a 16 × 16 × 16 product onto the tile. Highlighted: k-step ${st.ks + 1} of ${T}, k = ${k0}–${k0 + 15}.`,
        `<b>One <code>mma_sync</code></b>: a 16 × 16 block of A times a 16 × 16 block of B, added onto the tile: 4,096 MACs. On sm_75 it becomes four <code>HMMA.1688</code> instructions in two “outer products” (Fig. 8). Lit: the first outer product, k = 0–7 of the block (the first eight columns of A times the first eight rows of B), which touches both halves of the tile.`,
        `<b>One <code>HMMA.1688.F32</code></b>: a 16 × 8 slice of A times an 8 × 8 tile of B, added onto a 16 × 8 half of the tile: 1,024 MACs, 32 per thread. Count back up: 4 per <code>mma_sync</code> × ${T} k-steps × ${fmt.int(T * T)} tiles = <b>${fmt.int(4 * T * T * T)}</b> HMMAs, and ${fmt.int(4 * T * T * T)} × 1,024 = ${fmt.int(macs)} MACs, the whole multiply.`,
      ];
      f.setWhy(WHY[st.lv]);
    }
    let ksl = null;
    const stp = GG.ui.stepper(f.controls, { label: 'Zoom', steps: LV, autoplay: 2600, start: 0, onStep: (i) => { st.lv = i; stepOut(f.controls, LV[i].label); paint(); } });
    GG.ui.seg(f.controls, { label: 'matrix size N', value: st.N, options: SIZES.map((n) => ({ value: n, label: String(n) })), onChange: (v) => { st.N = v; build(); paint(); } });
    ksl = GG.ui.slider(f.controls, { label: 'k-step', min: 1, max: 16, step: 1, value: 1, format: (v) => `${Math.round(v)} of ${TT()}`, onInput: (v) => { st.ks = Math.round(v) - 1; if (st.lv === 0) stp.go(1); else paint(); } });
    onWidth(host, (w) => { const nw = w < 640; if (!G || G.narrow !== nw) { W = w; build(); } });
  }

  /* ── Fig 7: the register walk-through ── */
  function tcWalk(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Register usage in a Tensor Core MMA for C = A @ B', hint: 'step or play · tap a cell of D', wide: true,
      caption: 'After the glossary’s figure: the 16 × 16 result (<b>R20</b>, <b>R24</b>) = A (<b>R12</b>, <b>R14</b>) @ B (<b>R11</b>, <b>R17</b>, <b>R16</b>, <b>R18</b>). The R11, R17, R16 and R18 registers are used in instructions 1, 2, 3 and 4, respectively. The small integer values are ours, so the sums are easy to check. Colours name operands, not kinds of hardware: A pink, B blue, the result D amber. “One thread’s share” shows which elements each of the 32 threads holds, read off the loads and stores in the sm_75 SASS of the glossary’s Godbolt kernel.',
    });
    const INSTR = [
      { d: 'R20', a: 'R12', b: 'R11', c: 'RZ', half: 0, kb: 0 },
      { d: 'R24', a: 'R12', b: 'R17', c: 'RZ', half: 1, kb: 0 },
      { d: 'R20', a: 'R14', b: 'R16', c: 'R20', half: 0, kb: 1 },
      { d: 'R24', a: 'R14', b: 'R18', c: 'R24', half: 1, kb: 1 },
    ];
    const Am = [], Bm = [];
    for (let i = 0; i < 16; i++) { Am.push([]); Bm.push([]); for (let j = 0; j < 16; j++) { Am[i].push(((i * 3 + j * 5 + 1) % 5) - 2); Bm[i].push(((i * 7 + j * 3 + 2) % 5) - 2); } }
    const st = { s: 1, probe: null, lane: null };
    const root = el('div', { class: 'hwb-walk' });
    f.stage.append(root);
    opKey(f.stage, true);
    const codeHost = el('div', { class: 'hwb-w' });
    root.append(codeHost);
    const sass = GG.code(codeHost, { lang: 'sass', code: SASS_CODE, caption: 'the four instructions, read as D = A @ B + C', lineNumbers: false });
    tagSass(sass);
    const svgHost = el('div', { class: 'hwb-w' });
    root.append(svgHost);
    const nav = el('div', { class: 'hwb-pnav' });
    const probe = el('div', { class: 'hwb-panel hwb-probe', 'aria-live': 'polite' });
    root.append(nav, probe);
    const move = (di, dj) => { const p = st.probe || { i: 0, j: 0 }; st.probe = st.probe ? { i: clamp(p.i + di, 0, 15), j: clamp(p.j + dj, 0, 15) } : { i: 0, j: 0 }; render(false); };
    nav.append(el('span', { class: 'hwb-k', text: 'probe a cell of D' }));
    const grpR = el('span', { class: 'hwb-pgrp' }), grpC = el('span', { class: 'hwb-pgrp' });
    nav.append(grpR, grpC);
    GG.ui.button(grpR, { icon: 'prev', ariaLabel: 'Previous row', title: 'row up', onClick: () => move(-1, 0) });
    grpR.append(el('span', { class: 'hwb-hint', text: 'row' }));
    GG.ui.button(grpR, { icon: 'next', ariaLabel: 'Next row', title: 'row down', onClick: () => move(1, 0) });
    GG.ui.button(grpC, { icon: 'prev', ariaLabel: 'Previous column', title: 'column left', onClick: () => move(0, -1) });
    grpC.append(el('span', { class: 'hwb-hint', text: 'column' }));
    GG.ui.button(grpC, { icon: 'next', ariaLabel: 'Next column', title: 'column right', onClick: () => move(0, 1) });
    GG.ui.button(nav, { label: 'clear', onClick: () => { st.probe = null; render(false); } });
    let W = 0, G = null;
    // geometry
    function geom(w) {
      const narrow = w < 640;
      if (!narrow) {
        const cs = 15, gs = 240, gap = 70, vbW = 1000;
        const x0 = (vbW - (3 * gs + 2 * gap)) / 2;
        return { narrow, cs, vbW, vbH: 350, D: [x0, 66], A: [x0 + gs + gap, 66], B: [x0 + 2 * (gs + gap), 66], eq: [x0 + gs + gap / 2, 66 + gs / 2], at: [x0 + 2 * gs + 1.5 * gap, 66 + gs / 2], eqY: 32, lab: 66 + gs + 26, fs: 15 };
      }
      const cs = 9.4, gs = 16 * cs, vbW = 360;
      return { narrow, cs, vbW, vbH: 50 + gs + 58 + gs + 34, A: [12, 50], B: [vbW - 12 - gs, 50], at: [vbW / 2, 50 + gs / 2], D: [(vbW - gs) / 2, 50 + gs + 58], eq: [(vbW - gs) / 2 - 18, 50 + gs + 58 + gs / 2], eqY: 26, lab: null, fs: 12 };
    }
    function build() {
      svgHost.innerHTML = '';
      const g = geom(W);
      const svg = svgRoot(svgHost, g.vbW, g.vbH, 'Three 16 by 16 grids: the result D split into halves R20 and R24, equals A split into column halves R12 and R14, matrix-multiplied by B split into four tiles R11, R17, R16, R18.');
      const cs = g.cs;
      const eq = Tx(svg, g.vbW / 2, g.eqY, '', { size: g.narrow ? 14 : 19, weight: 700, 'text-anchor': 'middle', fill: 'var(--ink)' });
      Tx(svg, g.eq[0], g.eq[1] + 8, '=', { fill: 'var(--ink-2)', size: g.narrow ? 20 : 30, weight: 700, 'text-anchor': 'middle' });
      Tx(svg, g.at[0], g.at[1] + 8, '@', { fill: 'var(--ink-2)', size: g.narrow ? 18 : 28, weight: 700, 'text-anchor': 'middle' });
      function grid(parent, x, y, color) {
        const gg = S('g', {}, parent);
        S('rect', { x, y, width: 16 * cs, height: 16 * cs, style: `fill:${color};fill-opacity:0.06` }, gg);
        let d = '';
        for (let i = 1; i < 16; i++) { d += `M${x} ${(y + i * cs).toFixed(2)}h${16 * cs}M${(x + i * cs).toFixed(2)} ${y}v${16 * cs}`; }
        S('path', { d, style: `stroke:${color};stroke-opacity:0.16;stroke-width:0.6;fill:none` }, gg);
        return gg;
      }
      const blk = {};
      // register-name chips live in their own top layer, so the probe outlines never cover them
      const labLayer = S('g', { style: 'pointer-events:none' }, svg);
      function block(name, x, y, w, h, color, parent) {
        const gg = S('g', { class: 'hwb-blk' }, parent);
        const r = S('rect', { x: x + 0.5, y: y + 0.5, width: w - 1, height: h - 1, rx: 2, style: `fill:${color};fill-opacity:0.16;stroke:${color};stroke-width:1.2` }, gg);
        const lw = g.narrow ? 32 : 44, lh = g.narrow ? 16 : 22;
        const lg = S('g', { class: 'hwb-blk' }, labLayer);
        S('rect', { x: x + w / 2 - lw / 2, y: y + h / 2 - lh / 2, width: lw, height: lh, rx: 5, style: 'fill:rgba(11,12,18,0.82)' }, lg);
        Tx(lg, x + w / 2, y + h / 2 + (g.narrow ? 4 : 5.5), name, { fill: color, size: g.narrow ? 11 : 15, weight: 700, 'text-anchor': 'middle' });
        blk[name + (blk[name] ? '_' : '')] = { g: gg, lg, r, x, y, w, h };
        return { g: gg, r };
      }
      const gs = 16 * cs, hs = 8 * cs;
      // A
      const gA = S('g', {}, svg);
      grid(gA, g.A[0], g.A[1], ROLE.A);
      block('R12', g.A[0], g.A[1], hs, gs, ROLE.A, gA);
      block('R14', g.A[0] + hs, g.A[1], hs, gs, ROLE.A, gA);
      // B
      const gB = S('g', {}, svg);
      grid(gB, g.B[0], g.B[1], ROLE.B);
      block('R11', g.B[0], g.B[1], hs, hs, ROLE.B, gB);
      block('R17', g.B[0] + hs, g.B[1], hs, hs, ROLE.B, gB);
      block('R16', g.B[0], g.B[1] + hs, hs, hs, ROLE.B, gB);
      block('R18', g.B[0] + hs, g.B[1] + hs, hs, hs, ROLE.B, gB);
      // D
      const gD = S('g', { class: 'hwb-dgrid', tabindex: '0', role: 'group', 'aria-label': 'Result matrix D. Arrow keys move the probe, Enter shows a cell, Escape clears.', 'data-keys': '' }, svg);
      grid(gD, g.D[0], g.D[1], ROLE.D);
      const fills = [0, 1].map((h) => S('rect', { class: 'hwb-dfill', x: g.D[0] + h * hs, y: g.D[1], width: hs, height: gs, style: 'fill:var(--control)', 'fill-opacity': 0 }, gD));
      const pulses = [0, 1].map((h) => S('rect', { x: g.D[0] + h * hs, y: g.D[1], width: hs, height: gs, style: 'fill:var(--core);fill-opacity:0' }, gD));
      const dL = block('R20', g.D[0], g.D[1], hs, gs, ROLE.D, gD);
      const dR = block('R24', g.D[0] + hs, g.D[1], hs, gs, ROLE.D, gD);
      S('rect', { class: 'hwb-dframe', x: g.D[0] - 2, y: g.D[1] - 2, width: gs + 4, height: gs + 4, rx: 3, style: 'fill:none;stroke:transparent' }, gD);
      // probe overlays
      const pRowA = S('rect', { x: g.A[0], y: 0, width: gs, height: cs, style: 'fill:none;stroke:var(--ink);stroke-width:1.6;opacity:0' }, svg);
      const pColB = S('rect', { x: 0, y: g.B[1], width: cs, height: gs, style: 'fill:none;stroke:var(--ink);stroke-width:1.6;opacity:0' }, svg);
      const pCell = S('rect', { x: 0, y: 0, width: cs, height: cs, style: 'fill:var(--ink);fill-opacity:0.35;stroke:var(--ink);stroke-width:1.6;opacity:0;pointer-events:none' }, svg);
      // thread markers: 8 each for A, B, D
      const markG = S('g', { style: 'pointer-events:none' }, svg);
      const marks = [];
      for (let q = 0; q < 24; q++) marks.push(S('circle', { r: g.narrow ? 3.4 : 3.6, cx: -20, cy: -20, style: 'fill:var(--ink);stroke:#0b0c12;stroke-width:1.2;opacity:0' }, markG));
      svg.appendChild(labLayer);
      // labels under matrices (wide) or next to them (narrow)
      const labs = {};
      if (!g.narrow) {
        Tx(svg, g.D[0] + gs / 2, g.lab, 'D · 16 × 16 · FP32', { fill: ROLE.D, size: 12.5, weight: 600, 'text-anchor': 'middle' });
        Tx(svg, g.A[0] + gs / 2, g.lab, 'A · 16 × 16 · FP16', { fill: ROLE.A, size: 12.5, weight: 600, 'text-anchor': 'middle' });
        Tx(svg, g.B[0] + gs / 2, g.lab, 'B · 16 × 16 · FP16', { fill: ROLE.B, size: 12.5, weight: 600, 'text-anchor': 'middle' });
        labs.L = Tx(svg, g.D[0] + hs / 2, g.lab + 18, '', { fill: 'var(--ink-3)', size: 11, 'text-anchor': 'middle' });
        labs.R = Tx(svg, g.D[0] + hs + hs / 2, g.lab + 18, '', { fill: 'var(--ink-3)', size: 11, 'text-anchor': 'middle' });
        Tx(svg, g.A[0] + hs / 2, g.lab + 18, 'cols 0–7', { fill: 'var(--ink-3)', size: 11, 'text-anchor': 'middle' });
        Tx(svg, g.A[0] + hs + hs / 2, g.lab + 18, 'cols 8–15', { fill: 'var(--ink-3)', size: 11, 'text-anchor': 'middle' });
        Tx(svg, g.B[0] + gs / 2, g.lab + 18, 'rows 0–7 on top, 8–15 below', { fill: 'var(--ink-3)', size: 11, 'text-anchor': 'middle' });
      } else {
        Tx(svg, g.A[0], g.A[1] - 7, 'A · FP16', { fill: ROLE.A, size: 11, weight: 600 });
        Tx(svg, g.B[0] + gs, g.B[1] - 7, 'B · FP16', { fill: ROLE.B, size: 11, weight: 600, 'text-anchor': 'end' });
        Tx(svg, g.D[0] + gs / 2, g.D[1] - 8, 'D · 16 × 16 · FP32', { fill: ROLE.D, size: 11, weight: 600, 'text-anchor': 'middle' });
        labs.L = Tx(svg, g.D[0] + hs / 2, g.D[1] + gs + 15, '', { fill: 'var(--ink-3)', size: 11, 'text-anchor': 'middle' });
        labs.R = Tx(svg, g.D[0] + hs + hs / 2, g.D[1] + gs + 15, '', { fill: 'var(--ink-3)', size: 11, 'text-anchor': 'middle' });
      }
      // D interaction
      function cellAt(evt) {
        const pt = svg.createSVGPoint();
        pt.x = evt.clientX; pt.y = evt.clientY;
        const m = svg.getScreenCTM();
        if (!m) return null;
        const p = pt.matrixTransform(m.inverse());
        // snap to the nearest cell, with a cell's worth of slack around the grid (cells are small on phones)
        const fj = (p.x - g.D[0]) / cs, fi = (p.y - g.D[1]) / cs;
        if (fi < -1 || fi > 17 || fj < -1 || fj > 17) return null;
        return { i: clamp(Math.floor(fi), 0, 15), j: clamp(Math.floor(fj), 0, 15) };
      }
      gD.addEventListener('click', (e) => { const c = cellAt(e); if (c) { st.probe = st.probe && st.probe.i === c.i && st.probe.j === c.j ? null : c; render(false); } });
      gD.addEventListener('keydown', (e) => {
        const p = st.probe || { i: 0, j: 0 };
        const mv = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key];
        if (mv) { e.preventDefault(); st.probe = { i: clamp(p.i + mv[0], 0, 15), j: clamp(p.j + mv[1], 0, 15) }; render(false); }
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); st.probe = st.probe ? null : { i: 0, j: 0 }; render(false); }
        else if (e.key === 'Escape') { st.probe = null; render(false); }
      });
      G = { g, svg, eq, blk, fills, pulses, dL, dR, pRowA, pColB, pCell, marks, labs };
    }
    function termsAfter(half, s) {
      // k-terms accumulated in a D half after step s (0..4)
      if (half === 0) return s >= 3 ? 16 : s >= 1 ? 8 : 0;
      return s >= 4 ? 16 : s >= 2 ? 8 : 0;
    }
    function laneCells(L) {
      const gq = L >> 2, t = L & 3;
      const A = [], B = [], D = [];
      for (const r of [gq, gq + 8]) for (const c of [2 * t, 2 * t + 1, 8 + 2 * t, 9 + 2 * t]) { A.push([r, c]); D.push([r, c]); }
      for (const r of [2 * t, 2 * t + 1, 8 + 2 * t, 9 + 2 * t]) for (const c of [gq, 8 + gq]) B.push([r, c]);
      return { A, B, D, gq, t };
    }
    const stI = stat(f.readouts, { label: 'instructions', value: '' });
    const stM = stat(f.readouts, { label: 'MACs', value: '', tone: 'core' });
    const stO = stat(f.readouts, { label: 'outputs finished', value: '', tone: 'control' });
    const stT = stat(f.readouts, { label: 'MACs per thread', value: '', tone: 'core' });
    const WHY = [
      'Before the first HMMA, each thread has loaded its share of A and B. <b class="c-special">R12</b> and <b class="c-special">R14</b> hold the first and second eight columns of A; <b class="c-memory">R11</b>, <b class="c-memory">R17</b>, <b class="c-memory">R16</b> and <b class="c-memory">R18</b> hold B as four 8 × 8 tiles. Nothing has been written to <b class="c-control">R20</b> or <b class="c-control">R24</b> yet.',
      '<b>Instruction 1 · R20 = R12 @ R11 + RZ.</b> The first eight columns of A (16 × 8) times the top-left 8 × 8 tile of B gives the left half of the result, columns 0–7, summed over k = 0–7 only. <b>RZ</b> is the zero register, so nothing is added. 16 × 8 × 8 = 1,024 MACs.',
      '<b>Instruction 2 · R24 = R12 @ R17 + RZ.</b> The same slice of A times the top-right tile of B gives the right half. Instructions 1 and 2 together are an <b>“outer product”</b>: a tall, skinny 16 × 8 slice of A times a short, wide 8 × 16 slice of B (R11 next to R17) fills the whole 16 × 16 result with partial sums.',
      '<b>Instruction 3 · R20 = R14 @ R16 + R20.</b> The second eight columns of A times the bottom-left tile of B covers k = 8–15. R20 is both the output D and the input C, so the new products are added onto what instruction 1 left there: the left half is finished.',
      '<b>Instruction 4 · R24 = R14 @ R18 + R24.</b> The second outer product completes the right half. Four instructions, 4 × 1,024 = 4,096 = 16 × 16 × 16 MACs: the whole of C = A @ B, with every output a sum of all 16 products.',
    ];
    function render(anim) {
      if (!G) return;
      const s = st.s;
      const ins = s >= 1 ? INSTR[s - 1] : null;
      // equation
      G.eq.innerHTML = '';
      const tsp = (t, c) => { const e = S('tspan', { style: `fill:${c}` }, G.eq); e.textContent = t; };
      if (!ins) { tsp('C', ROLE.D); tsp(' = ', 'var(--ink-2)'); tsp('A', ROLE.A); tsp(' @ ', 'var(--ink-2)'); tsp('B', ROLE.B); tsp(G.g.narrow ? ' · 4 HMMAs' : ', as four HMMA.1688.F32 instructions', 'var(--ink-3)'); }
      else { tsp(`${s} · `, 'var(--ink-3)'); tsp(ins.d, ROLE.D); tsp(' = ', 'var(--ink-2)'); tsp(ins.a, ROLE.A); tsp(' @ ', 'var(--ink-2)'); tsp(ins.b, ROLE.B); tsp(' + ', 'var(--ink-2)'); tsp(ins.c, ins.c === 'RZ' ? ROLE.C : ROLE.D); }
      // blocks
      const on = new Set(), pair = new Set();
      if (ins) { on.add(ins.a); on.add(ins.b); on.add(ins.d); if (ins.half === 1) pair.add(INSTR[s - 2].b); }
      Object.keys(G.blk).forEach((k) => {
        const b = G.blk[k];
        const isOn = on.has(k), isPair = pair.has(k), isD = k === 'R20' || k === 'R24';
        b.g.classList.toggle('dim', !!ins && !isOn && !isPair && !isD);
        b.lg.classList.toggle('dim', !!ins && !isOn && !isPair && !isD);
        b.r.style.strokeWidth = isOn ? '3' : '1.2';
        if (!isD) b.r.style.fillOpacity = isOn ? '0.42' : isPair ? '0.26' : '0.16';
        else b.r.style.fillOpacity = '0';
      });
      [0, 1].forEach((h) => {
        const n = termsAfter(h, s);
        G.fills[h].setAttribute('fill-opacity', n === 0 ? 0 : n === 8 ? 0.24 : 0.62);
        G.labs[h ? 'R' : 'L'].textContent = n === 0 ? (G.g.narrow ? 'empty' : 'not written yet') : n === 8 ? (G.g.narrow ? 'k 0–7' : 'k 0–7 summed') : 'k 0–15 ✓';
      });
      if (anim && ins && !GG.reducedMotion) {
        const p = G.pulses[ins.half];
        p.classList.remove('hwb-pulse');
        void p.getBoundingClientRect();
        p.classList.add('hwb-pulse');
      }
      // code
      sass.clear();
      if (ins) { sass.dim([1, 2, 3, 4].filter((n) => n !== s)); sass.highlight(s, 'core'); }
      // probe
      const cs = G.g.cs, D0 = G.g.D, A0 = G.g.A, B0 = G.g.B;
      if (st.probe) {
        const { i, j } = st.probe;
        G.pRowA.setAttribute('y', A0[1] + i * cs); G.pRowA.style.opacity = 1;
        G.pColB.setAttribute('x', B0[0] + j * cs); G.pColB.style.opacity = 1;
        G.pCell.setAttribute('x', D0[0] + j * cs); G.pCell.setAttribute('y', D0[1] + i * cs); G.pCell.style.opacity = 1;
        const half = j < 8 ? 0 : 1;
        const grp = [0, 1].map((kb) => {
          const k0 = kb * 8;
          const prods = []; let sum = 0;
          for (let k = k0; k < k0 + 8; k++) { const p = Am[i][k] * Bm[k][j]; prods.push(p); sum += p; }
          const n = INSTR.findIndex((x) => x.half === half && x.kb === kb) + 1;
          return { kb, prods, sum, n, ins: INSTR[n - 1], done: s >= n, now: s === n };
        });
        const soFar = grp.reduce((acc, q) => acc + (q.done ? q.sum : 0), 0);
        const nDone = grp.filter((q) => q.done).length * 8;
        probe.innerHTML = `<div class="hwb-hint"><b>D[${i}][${j}]</b> = Σ<sub>k</sub> A[${i}][k] · B[k][${j}]: row ${i} of A (outlined) times column ${j} of B (outlined), 16 products. So far: <b style="color:var(--control)">${soFar}</b> (${nDone} of 16 products)${nDone === 16 ? ', final' : `; final value ${grp[0].sum + grp[1].sum}`}.</div>
          <div class="hwb-prods">${grp.map((q) => `<div class="hwb-prodg${q.done ? '' : ' todo'}${q.now ? ' now' : ''}"><div class="hwb-prodg-h">k ${q.kb * 8}–${q.kb * 8 + 7} · <b>instruction ${q.n}</b> · ${q.ins.a} × ${q.ins.b}${q.done ? '' : ' · not yet'}</div><div class="hwb-pbox">${q.prods.map((p) => `<span>${p}</span>`).join('')}</div><div class="hwb-prodg-s">sum <b>${q.sum}</b></div></div>`).join('')}</div>`;
      } else {
        G.pRowA.style.opacity = 0; G.pColB.style.opacity = 0; G.pCell.style.opacity = 0;
        probe.innerHTML = '<div class="hwb-hint">Tap or click any cell of <b>D</b> (or focus it and use the arrow keys) to see the 16 products behind it, and which two instructions add them up.</div>';
      }
      // thread markers
      if (st.lane != null) {
        const lc = laneCells(st.lane);
        const all = [].concat(lc.A.map(([r, c]) => [A0[0] + (c + 0.5) * cs, A0[1] + (r + 0.5) * cs]), lc.B.map(([r, c]) => [B0[0] + (c + 0.5) * cs, B0[1] + (r + 0.5) * cs]), lc.D.map(([r, c]) => [D0[0] + (c + 0.5) * cs, D0[1] + (r + 0.5) * cs]));
        G.marks.forEach((mk, q) => { mk.setAttribute('cx', all[q][0]); mk.setAttribute('cy', all[q][1]); mk.style.opacity = 1; });
      } else G.marks.forEach((mk) => { mk.style.opacity = 0; });
      // readouts
      const fin = (termsAfter(0, s) === 16 ? 128 : 0) + (termsAfter(1, s) === 16 ? 128 : 0);
      stI.set(`${s} / 4`); stM.set(`${fmt.int(s * 1024)} / 4,096`); stO.set(`${fin} / 256`); stT.set(String(s * 32));
      let why = WHY[s];
      if (st.lane != null) {
        const lc = laneCells(st.lane);
        why = `<b>Thread ${st.lane}</b> (group ${lc.gq}, position ${lc.t} of 4) holds the 24 marked elements: 8 halves of A (in R12–R15, two per register), 8 halves of B (in R11, R16, R17, R18) and 8 floats of D (in R20–R27). 32 threads × 8 = 256, so every element of each matrix has exactly one owner, and the warp computes the product together. ` + (s ? `In instruction ${s}, this thread’s 4 outputs take 8 products each: 32 of the instruction’s 1,024 MACs.` : '');
      }
      f.setWhy(why);
    }
    const laneSl = GG.ui.slider(f.controls, { label: 'Thread (lane)', min: 0, max: 31, step: 1, value: 5, onInput: (v) => { st.lane = clamp(Math.round(v), 0, 31); render(false); } });
    laneSl.el.style.display = 'none';
    GG.ui.toggle(f.controls, { label: 'one thread’s share', value: false, onChange: (v) => { st.lane = v ? laneSl.get() : null; laneSl.el.style.display = v ? '' : 'none'; render(false); } });
    onWidth(svgHost, (w) => { const narrow = w < 640; if (!G || narrow !== G.g.narrow) { W = w; build(); render(false); } });
    const WSTEPS = [{ label: 'registers loaded' }, { label: 'HMMA 1 of 4' }, { label: 'HMMA 2 of 4' }, { label: 'HMMA 3 of 4' }, { label: 'HMMA 4 of 4' }];
    const stp = GG.ui.stepper(f.controls, { label: 'Instruction', steps: WSTEPS, autoplay: 2000, start: 1, onStep: (i) => { st.s = i; render(true); stepOut(f.controls, WSTEPS[i].label); } });
    f.controls.insertBefore(stp.el, f.controls.firstChild);
  }

  /* ── Fig 8: the same call on other SM architectures ── */
  function tcArch(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'The same mma_sync, compiled for different SM architectures', hint: 'pick a target', wide: true,
      caption: 'Beyond the glossary. We compiled the kernel behind the glossary’s <a href="https://godbolt.org/z/e6cqn8491">Godbolt link</a> with the compiler it uses (nvcc 12.6 Update 2) for sm_70, sm_75, sm_80 and sm_90a, and kept the Tensor Core instructions, verbatim. nvcc 12.9.1 gives the same two instructions for sm_86, sm_89, sm_90, sm_100 and sm_120 (up to a <code>.reuse</code> flag). One PTX instruction, three different SASS programs: SASS belongs to an SM architecture.',
    });
    let cur = ARCH_SASS[1];
    const grid = el('div', { class: 'hwb-arch' });
    f.stage.append(grid);
    onWidth(grid, (w) => grid.classList.toggle('two', w >= 760));
    const codeHost = el('div', { class: 'hwb-w' });
    const chartHost = el('div', { class: 'hwb-w' });
    grid.append(codeHost, chartHost);
    opKey(f.stage, true);
    const stN = stat(f.readouts, { label: 'SASS instructions', value: '', tone: 'core' });
    const stM = stat(f.readouts, { label: 'MACs per instruction', value: '', tone: 'core' });
    const stP = stat(f.readouts, { label: 'per thread', value: '' });
    const stS = stat(f.readouts, { label: 'shape m × n × k', value: '' });
    function drawChart() {
      chartHost.innerHTML = '';
      const vbW = 380, rowH = 52, H = ARCH_SASS.length * rowH + 30;
      const svg = svgRoot(chartHost, vbW, H, 'Bar chart of how many Tensor Core instructions one 16 by 16 by 16 matrix multiply takes: 16 on Volta, 4 on Turing, 2 from Ampere on.');
      Tx(svg, 0, 14, 'instructions for one 16 × 16 × 16 multiply', { fill: 'var(--ink-3)', size: 11 });
      const x0 = 162, avail = vbW - x0 - 34;
      ARCH_SASS.forEach((a, i) => {
        const y = 28 + i * rowH;
        const on = a === cur;
        Tx(svg, 0, y + 17, a.label.split(' · ')[0], { fill: on ? 'var(--ink)' : 'var(--ink-2)', size: 12.5, weight: on ? 700 : 500 });
        Tx(svg, 0, y + 32, a.fam, { fill: 'var(--ink-3)', size: 10.5 });
        const w = (a.n / 16) * avail;
        const g = S('g', { style: 'cursor:pointer' }, svg);
        const cw = w / a.n;
        for (let q = 0; q < a.n; q++) S('rect', { x: x0 + q * cw + 0.5, y: y + 4, width: Math.max(1, cw - 1.5), height: 28, rx: 3, style: `fill:var(--core);fill-opacity:${on ? 0.85 : 0.3}` }, g);
        Tx(svg, x0 + w + 8, y + 23, String(a.n), { fill: on ? 'var(--core)' : 'var(--ink-2)', size: 14, weight: 700 });
        g.addEventListener('click', () => { seg.set(a.id, true); });
      });
    }
    /* the listing as a grid of chips: rows are groups of instructions, columns STEP0–STEP3 (Volta) */
    function chips(code) {
      const ins = cur.code.split('\n').map((ln) => {
        const regs = ln.match(/\b(?:R\d+|RZ)\b/g) || [];
        const stepM = ln.match(/STEP(\d)/);
        return { d: regs[0], a: regs[1], b: regs[2], c: regs[3], step: stepM ? +stepM[1] : null };
      });
      const volta = ins[0].step != null;
      const cols = volta ? 4 : ins.length;
      const g = el('div', { class: 'hwb-chips', style: `grid-template-columns: max-content repeat(${cols}, minmax(0, 1fr))` });
      g.append(el('span', { class: 'hwb-chip-h', text: volta ? 'group' : '' }));
      for (let j = 0; j < cols; j++) g.append(el('span', { class: 'hwb-chip-h', html: volta ? `<span class="hwb-kc">STEP${j}</span>` : 'instr. ' + (j + 1) }));
      const btns = [];
      const rowsN = volta ? ins.length / 4 : 1;
      for (let i = 0; i < rowsN; i++) {
        g.append(el('span', { class: 'hwb-chip-h', text: volta ? String(i + 1) : '' }));
        for (let j = 0; j < cols; j++) {
          const q = i * cols + j, x = ins[q];
          const b = el('button', { type: 'button', class: 'hwb-chip', 'aria-label': `Line ${q + 1}: ${x.d} = ${x.a} times ${x.b} plus ${x.c}`,
            html: `<b style="color:${ROLE.D}">${x.d}</b><span><i style="color:${ROLE.A}">${x.a}</i>·<i style="color:${ROLE.B}">${x.b}</i>+<i style="color:${x.c === 'RZ' ? ROLE.C : ROLE.D}">${x.c}</i></span>` });
          b.addEventListener('click', () => { code.clear(); btns.forEach((y) => y.classList.toggle('on', y === b)); code.highlight(q + 1, 'core'); const ln = code.line(q + 1); if (ln && ln.scrollIntoView && code.pre.scrollHeight > code.pre.clientHeight) code.pre.scrollTop = ln.offsetTop - code.pre.clientHeight / 2; });
          btns.push(b); g.append(b);
        }
      }
      return g;
    }
    function update() {
      codeHost.innerHTML = '';
      const chipHost = el('div', { class: 'hwb-chipwrap' });
      codeHost.append(chipHost);
      const code = GG.code(codeHost, { lang: 'sass', code: cur.code, caption: `${cur.label} · ${cur.gpu}`, lineNumbers: true });
      code.el.classList.add('hwb-archcode');
      tagSass(code);
      chipHost.append(el('div', { class: 'hwb-k', text: 'each instruction as D = A · B + C · tap one to find its line' }), chips(code));
      const macs = 4096 / cur.n;
      stN.set(String(cur.n)); stM.set(fmt.int(macs)); stP.set(fmt.int(macs / 32)); stS.set(cur.shape);
      f.setWhy(cur.why);
      drawChart();
      decorate(codeHost);
    }
    const seg = GG.ui.seg(f.controls, { label: 'Target', value: cur.id, options: ARCH_SASS.map((a) => ({ value: a.id, label: a.label })), onChange: (v) => { cur = ARCH_SASS.find((a) => a.id === v); update(); } });
    update();
  }

  GG.entry('tensor-core', {
    render(body, ctx0) {
      const ctx = kcCtx(ctx0);
      body.classList.add('hwb-body');
      const s = ctx.html(body, `
<p><strong>Tensor Cores</strong> are GPU ${T('core', 'cores')} that operate on entire matrices with each instruction. The workhorse floating point instruction of the ${T('cuda-core', 'CUDA Cores')}, the <em>fused multiply-add</em> (<code>FFMA</code>), multiplies one pair of numbers for each ${T('thread', 'thread')} and adds a third. One Tensor Core instruction multiplies two small matrices and adds a third matrix to the result: anywhere from a few hundred multiply-adds (the <code>HMMA</code> instructions below do 256 to 2,048) to hundreds of thousands (Hopper’s warpgroup-level <code>wgmma</code>: 64 × 256 × 16 = 262,144 for 16-bit inputs, 64 × 256 × 32 = 524,288 for 8-bit ones), all at once.</p>
<div data-slot="sm" class="wide"></div>
<p>Fig. 1 is the glossary’s picture of an H100 ${T('streaming-multiprocessor', 'Streaming Multiprocessor (SM)')}. Note the larger size and lower number of the Tensor Cores: four big blocks, where the CUDA Cores are hundreds of small ones.</p>
<h3>More work per instruction, less power per operation</h3>
<p>Operating on more data for a single instruction fetch dramatically reduces power requirements, which unlocks increased performance. That is the argument of <a href="https://youtu.be/kLiwvnr4L80?t=868">this talk</a> (“Trends in Deep Learning Hardware”, from 14:28) by Bill Dally, Chief Scientist at NVIDIA. Every instruction costs energy before any arithmetic happens: it has to be fetched from an instruction cache, decoded, scheduled, and have its operands read from the ${T('register-file', 'register file')}. For one multiply-add that overhead can outweigh the arithmetic itself. Give each instruction thousands of multiply-adds to do and the same overhead is spread thin. Chips have a fixed power budget, so energy saved per operation turns into more operations per second.</p>
<div data-slot="amort" class="wide"></div>
<p>Since their introduction in the Volta ${T('streaming-multiprocessor-architecture', 'Streaming Multiprocessor (SM) Architecture')} generation, Tensor Cores have been the only way to achieve the highest ${T('arithmetic-bandwidth', 'arithmetic throughput')} on NVIDIA GPUs. The glossary puts their advantage at 100× more floating point operations per second than ${T('cuda-core', 'CUDA Cores')}. That is a rule of thumb; Fig. 3 checks it against the glossary’s own numbers, across three generations of GPU.</p>
<div data-slot="rates" class="wide"></div>
${GG.noteHTML('check', '<p>“100×” is a rule of thumb: the glossary’s ' + T('arithmetic-bandwidth', 'Arithmetic Bandwidth') + ' entry calls a 100:1 ratio “a good rule of thumb”. Fig. 3 holds the Tensor Core inputs at 16 bits and changes the generation: 125 ÷ 15.7 ≈ 8× on the V100, which introduced Tensor Cores (Volta white paper, Table 1); 989 ÷ 66.9 ≈ 14.8× for dense BF16 on the H100 SXM (the glossary’s figures, the CUDA Core one from its ' + T('peak-rate', 'Peak Rate') + ' entry); and 2,250 ÷ 75 = 30× for dense BF16 on the B200 (the glossary’s Tensor Core figure against 75 TFLOPS of FP32, NVIDIA’s HGX B200 figure, outside the glossary). So the ratio grows with each generation, and for 16-bit math the rule of thumb overstates it. Lower-precision inputs widen the gap further, up to 120:1 for dense FP4 on a B200, where the rule of thumb fits; ' + T('arithmetic-bandwidth', 'Arithmetic Bandwidth') + '’s Fig. 4 counts the ratio out format by format. The conclusion stands either way: for matrix math, the Tensor Cores are where the throughput is.</p>')}
<h3>Reading one instruction: HMMA16.16816.F32</h3>
<p>As an example, the <code>HMMA16.16816.F32</code> ${T('streaming-assembler', 'SASS')} instruction calculates <b>D = AB + C</b> for matrices A, B, C and D, where C is often the same physical matrix as D. The <code>MMA</code> stands for “Matrix Multiply and Accumulate”. <code>HMMA16</code> indicates that the inputs are half-precision (<code>16</code> bits), and the <code>F32</code> indicates that the outputs are accumulated into <code>32</code>-bit (aka single-precision) floats.</p>
<p>The <code>16816</code> between is not a single number larger than 16,000. Instead, the string of numbers <code>16</code>, <code>8</code> and <code>16</code> denotes the dimensions of the matrices. NVIDIA generally names these dimensions <code>m</code>, <code>n</code> and <code>k</code>, for example in ${T('parallel-thread-execution', 'PTX')} instructions. The outer dimensions of A and B, <code>m</code> and <code>n</code>, come first, followed by the shared inner dimension for the accumulation, <code>k</code>. Multiplying these out, the instruction performs 16 × 8 × 16 = <b>2,048</b> multiply-accumulate (MAC) operations. Try other shapes in Fig. 4.</p>
<div data-slot="dec" class="wide"></div>
${GG.noteHTML('check', '<p>The glossary spells the instruction <code>HMMA16.16816.F32</code>, and one sentence later writes <code>HMMA16.16816.32</code>, a slip for <code>.F32</code>. In the disassembly of the glossary’s own Godbolt kernel (Fig. 9), the instruction with this 16 × 8 × 16 shape prints as <code>HMMA.16816.F32</code>: the leading <code>H</code> already says “half precision”, and there is no separate <code>16</code>. Fig. 4 keeps the glossary’s spelling, whose <code>16</code> says exactly what the <code>H</code> means.</p>')}
<div data-slot="nums"></div>
<p>Note that a single instruction in a single ${T('thread', 'thread')} does not produce the entire matrix multiplication. Instead, the 32 threads of a ${T('warp', 'warp')} cooperatively produce the result by executing the instruction together. Most of the per-instruction power overhead is in decoding, which is shared across a warp thanks to the ${T('warp-scheduler', 'warp scheduler')}: it decodes and issues one instruction for all 32 threads (Fig. 2’s no-warp baseline shows what that saves). But even spread across those 32 threads, that is 64 = 2,048 ÷ 32 MACs per instruction.</p>
${GG.noteHTML('intuition', '<p>A scalar fused multiply-add, <code>FFMA</code>, does one MAC per thread per instruction. <code>HMMA16.16816.F32</code> does 64. To do the same 2,048 MACs with scalar instructions, every thread of the warp would need 64 of them, each fetched, decoded and issued: 64 times the overhead for the same arithmetic.</p>')}
<h3>A complex instruction set computer, inside a core</h3>
<p>For this reason, it is helpful to think of Tensor Cores, and similar hardware like the <em>systolic arrays</em> in Google’s Tensor Processing Units (TPUs), as a form of <a href="https://www.omgwiki.org/ddsf/doku.php?id=ddsf:public:guidebook:06_append:glossary:c:cisc">complex instruction set computer (CISC)</a> hardware. The two classic styles of instruction set differ in how much one instruction does. In a <em>reduced instruction set computer</em> (RISC), each instruction is small and simple: load a value, add two registers, store a value. In a CISC, one instruction can do a lot of work, such as a whole matrix multiply, over many clock cycles.</p>
<p>For more on this perspective, applied to TPUs, see <a href="https://youtu.be/fhHAArxwzvQ?t=2072">this talk by computer architect David Patterson</a> (“Evaluation of the Tensor Processing Unit”, from 34:32), who also <a href="https://www.semanticscholar.org/paper/4d3a941a5749dbf0dd39554f12597c449c3c07ff">coined the terms CISC and RISC</a>: the linked paper is “The Case for the Reduced Instruction Set Computer”, by Patterson and David Ditzel (1980). A systolic array is a grid of multiply-accumulate cells that pass data to their neighbours in lockstep, like a heartbeat pumping blood (hence “systolic”). Fig. 5 runs a small one.</p>
<div data-slot="sys"></div>
${GG.noteHTML('beyond', '<p><b>What the TPU paper says.</b> The first TPU’s matrix unit, described by Jouppi et al. (with Patterson among the authors) in “In-Datacenter Performance Analysis of a Tensor Processing Unit” (2017), “contains 256x256 MACs that can perform 8-bit multiply-and-adds”. Its instructions “follow the CISC tradition”, and each one takes many clock cycles: “The average clock cycles per instruction (CPI) of these CISC instructions is typically 10 to 20.” Few instructions, each doing a lot of work, is the idea behind Fig. 2. (The paper also says that “our CISC instructions are long, so decode is insignificant and does not hide the overhead of loading from the DRAM”, in a passage on why a larger matrix unit would not help.) The matrix unit “uses systolic execution to save energy by reducing reads and writes” of its on-chip buffer, since “reading a large SRAM uses much more power than arithmetic”.</p>')}
<h3>From CUDA C++ to PTX to SASS</h3>
<p>That assembler-level instruction might be produced by a compiler to implement ${T('parallel-thread-execution', 'PTX-level')} matrix-multiply-and-accumulate instructions like <code>wmma</code> (documented <a href="https://docs.nvidia.com/cuda/archive/12.8.0/parallel-thread-execution/index.html#warp-level-matrix-instructions">here</a>). Those instructions also calculate D = AB + C for matrices A, B, C and D, but are generally compiled into many individual ${T('streaming-assembler', 'SASS')} Tensor Core instructions that operate on smaller matrices. These instructions from the PTX instruction set architecture are exposed in the high-level ${T('cuda-c', 'CUDA C++')} programming language as <em>intrinsics</em>: functions that look like library calls but that the compiler turns into specific instructions.</p>
<p>In reverse order, a line of ${T('cuda-c', 'CUDA C++')} coding a matrix multiplication <code>C = A @ B</code> of two 16 by 16 matrices, like <code>${esc(CPP_LINE)}</code>, where <code>c</code> is initialized to all zeros and its first appearance indicates that it is also the output, might be compiled by ${T('nvcc', '<code>nvcc</code>')} to the PTX intermediate representation, and then by <code>ptxas</code> to SASS. Fig. 6 shows all three levels, verbatim, with each operand coloured the same way at every level.</p>
<div data-slot="chain" class="wide"></div>
<p>The operands to each <code>HMMA</code> instruction can be read, in order, as <b>D = A @ B + C</b>. For example, instruction 3 uses ${T('register-file', 'register')} 20 for its output D, registers 14 and 16 for its inputs A and B, respectively, and re-uses register 20 for its input C, effecting the computation C += A @ B.</p>
${GG.noteHTML('beyond', '<p><b>The whole kernel.</b> The glossary’s <a href="https://godbolt.org/z/e6cqn8491">Godbolt link</a> compiles the kernel below, where the fragments are called <code>a_frag</code>, <code>b_frag</code> and <code>c_frag</code>. Hover the marked lines.</p>')}
<div data-slot="kernel"></div>
<p>This program partitions the full 16 by 16 square matrix multiplication into four separate instructions, each itself a matrix multiplication of a 16 by 8 matrix with an 8 by 8 matrix. Similarly, programs running large-scale matrix multiplications must break their work down into smaller matrix multiplications, like the 16 by 16 square matrix multiplication performed by the <code>mma_sync</code> call we are dissecting. Fig. 7 zooms from a large multiplication down to one instruction; Fig. 8 walks through the program.</p>
<div data-slot="tiling" class="wide"></div>
<div data-slot="walk" class="wide"></div>
<p>The first two instructions compute the matrix multiplication of the first eight columns of the input <code>a</code>, from <code>R12</code>, with the first eight rows of the input <code>b</code>, from <code>R11</code> and <code>R17</code>, producing a 16 by 16 matrix, which is stored in <code>R20</code> and <code>R24</code>. This is a sort of “outer product”: a tall and skinny matrix multiplied by a short and wide matrix. (<code>RZ</code> is a special-purpose “register” that contains the value <code>Z</code>ero.)</p>
<p>The second two instructions compute a similar “outer product” for the second eight columns of <code>a</code> and the second eight rows of <code>b</code>, accumulating with the output of the first two instructions to produce the final value in <code>c</code>.</p>
<p>Put another way: within a block of eight rows out of eight columns in B and within an entire column of A, a number of multiplications and additions occur inside the Tensor Core concurrently, with respect to the instruction, to implement a matrix multiplication. The instruction is one indivisible step: all its 16 × 8 × 8 multiply-adds are its work, however the hardware schedules them inside. Each instruction handles all <code>m</code> rows of A for the given block of rows and columns from B. Together, the four handle the full matrix multiplication. Tap a cell of D in Fig. 8 to see its 16 products split between two instructions.</p>
${GG.noteHTML('check', '<p>That sentence is the glossary’s, and two of its phrases are easy to misread. Read “an entire column of A” as a block of eight whole columns of A, all 16 rows of them: the 16 × 8 slice in <code>R12</code> (columns 0–7) or <code>R14</code> (columns 8–15). Read “a block of eight rows out of eight columns in B” as one 8 × 8 tile of B, eight rows by eight columns: <code>R11</code>, <code>R17</code>, <code>R16</code> or <code>R18</code>. Each instruction multiplies one such slice of A by one such tile of B, as Fig. 8 shows step by step.</p>')}
${GG.noteHTML('beyond', '<p><b>Each register name is a run of registers.</b> A SASS register is 32 bits, and each instruction’s operands are shared by 32 threads. So the 16 × 8 block of FP32 results that one HMMA.1688 writes is 128 values ÷ 32 threads = 4 registers per thread: <code>R20</code> means R20–R23, and <code>R24</code> means R24–R27. A 16 × 8 slice of FP16 A is 128 halves ÷ 32 = 4 halves = 2 registers per thread (<code>R12</code> means R12–R13), and an 8 × 8 tile of B is 64 halves ÷ 32 = 2 halves, one register. That is why the destination names jump by four, the A names by two, and the B names by one. The loads and stores around the four HMMAs in the compiled kernel confirm this layout, which Fig. 8’s thread view draws.</p>')}
<p>Explore <a href="https://godbolt.org/z/e6cqn8491">this compiler output on Godbolt</a> if you want to dive deeper. Note that this is far from a <a href="https://modal.com/blog/gpu-utilization-guide">utilization-maximizing</a> matrix multiplication using Tensor Cores: one warp computes one 16 × 16 tile, loaded straight from ${T('global-memory', 'global memory')}, and then the kernel ends. For that, see <a href="https://cudaforfun.substack.com/p/outperforming-cublas-on-h100-a-worklog">this worklog by Pranjal Shankhdhar</a>, “Outperforming cuBLAS on H100”.</p>
${GG.noteHTML('check', '<p>The glossary spells the worklog author’s name “Pranjal Shandkar”; the post itself is signed Pranjal Shankhdhar.</p>')}
<h4>Beyond the glossary: one call, three SASS programs <span class="hwb-tag beyond">beyond</span></h4>
<p>The four <code>HMMA.1688</code> lines are what ptxas writes for one ${T('streaming-multiprocessor-architecture', 'SM architecture')}, Turing’s sm_75. Compile the same kernel for other targets and the Tensor Core instructions change shape, because SASS is tied to an SM architecture. The newer shapes do more per instruction.</p>
<div data-slot="arch" class="wide"></div>
<h3>Programming Hopper and Blackwell Tensor Cores</h3>
<p>Programming Hopper and Blackwell Tensor Cores for maximum performance cannot be done in pure ${T('cuda-c', 'CUDA C++')}, requiring instead ${T('parallel-thread-execution', 'PTX')} intrinsics for both computation and memory. It is generally recommended to instead use existing ${T('kernel', 'kernels')} from kernel libraries like ${T('cublas', 'cuBLAS (CUDA Basic Linear Algebra Subroutines)')} or higher-level kernel programming interfaces like ${T('cutlass', 'CUTLASS (CUDA Templates for Linear Algebra Subroutines)')} in C++ or ${T('cute-dsl', 'CuTe DSL')} in Python.</p>
${GG.noteHTML('beyond', '<p>The PTX families involved are <code>wgmma</code> on Hopper, an asynchronous MMA issued by a ' + T('warpgroup', 'warpgroup') + ' of four warps, and <code>tcgen05</code> on datacenter Blackwell GPUs such as the B200, whose MMAs keep their accumulators in ' + T('tensor-memory', 'Tensor Memory') + ' (the TMA entry’s Fig. 5 draws where those operands travel). PTX offers <code>tcgen05</code> only for compute capability 10.x and 11.0 targets; the 12.x Blackwell GPUs, such as the GeForce RTX 5090, still use warp-level <code>mma</code> instructions, as the sm_120 output in Fig. 9 shows. Fig. 9 shows the gap: compiled for sm_90a, the portable <code>wmma</code> call still becomes two warp-level <code>HMMA</code> instructions, not Hopper’s larger warpgroup-level instructions. The memory side is the ' + T('tensor-memory-accelerator', 'Tensor Memory Accelerator') + ', which feeds the Tensor Cores’ inputs through ' + T('shared-memory', 'shared memory') + '.</p>')}
<h3>Few and large, and on Blackwell the main users of Tensor Memory</h3>
<p>Tensor Cores are much larger and less numerous than ${T('cuda-core', 'CUDA Cores')}. An H100 SXM5 has only four Tensor Cores per ${T('streaming-multiprocessor', 'SM')}, i.e. one per ${T('warp-scheduler', 'Warp Scheduler')}, but has hundreds of CUDA Cores: 128 FP32 units by NVIDIA’s count, 256 arithmetic units counting the INT32 and FP64 units (Fig. 1). On GPUs that have it, like the B200, Tensor Cores are the primary producers and consumers of ${T('tensor-memory', 'Tensor Memory')}, a specialized memory in the SM for their inputs and outputs.</p>
<h3>Where they came from, and what we do not know</h3>
<p>Tensor Cores were introduced in the V100 GPU, which represented a major improvement in the suitability of NVIDIA GPUs for large neural network workloads. For more, see <a href="https://images.nvidia.com/content/volta-architecture/pdf/volta-architecture-whitepaper.pdf">the NVIDIA white paper introducing the V100</a>.</p>
${GG.noteHTML('history', '<p>From that white paper: the V100 has <b>640 Tensor Cores</b>, eight per SM and two per processing block (sub-partition), where the H100 has four per SM (Fig. 1’s V100 view draws that SM). Each Volta Tensor Core “operates on a 4x4 matrix”, computing D = A×B + C with FP16 inputs and FP16 or FP32 accumulation, and “performs 64 floating point FMA operations per clock”: 4 × 4 × 4 = 64. That adds up to 640 × 64 × 2 FLOPs × 1.53 GHz ≈ 125 TFLOPS, the paper’s “125 Tensor TFLOPS”. The paper also introduces the programming interface used above: “Warp-Level Matrix Operations in the CUDA 9 C++ API”, which “assumes 16x16 size matrices spanning all 32 threads of the warp”, that is, <code>wmma</code>.</p>')}
<p>The internals of Tensor Cores are unknown, and likely differ from ${T('streaming-multiprocessor-architecture', 'SM Architecture')} to ${T('streaming-multiprocessor-architecture', 'SM Architecture')}. They are commonly assumed to be systolic arrays, like TPUs, but there is no consensus in the microbenchmarking literature: studies that time the instructions from outside can measure their latency and throughput, but not see the circuit.</p>
<div data-slot="read"></div>`);
      guard(s.sm, 'SM floorplan', () => tcFloorplan(s.sm, ctx));
      guard(s.amort, 'Instruction budget', () => tcAmortize(s.amort, ctx));
      guard(s.rates, 'Peak rates', () => tcRates(s.rates, ctx));
      guard(s.dec, 'Decoder', () => tcDecoder(s.dec, ctx));
      guard(s.nums, 'Key numbers', () => ctx.numbers(s.nums, [
        { value: '2,048', label: 'MACs in one HMMA16.16816.F32: 16 × 8 × 16', tone: 'core' },
        { value: '64', label: 'MACs per thread per instruction: 2,048 ÷ 32', tone: 'core' },
        { value: '4', label: 'Tensor Cores per H100 SM, one per warp scheduler', tone: 'control' },
        { value: '528', label: 'Tensor Cores in an H100 SXM: 4 × 132 SMs' },
      ]));
      guard(s.sys, 'Systolic array', () => tcSystolic(s.sys, ctx));
      guard(s.chain, 'Compile chain', () => tcChain(s.chain, ctx));
      guard(s.kernel, 'Kernel', () => ctx.code(s.kernel, {
        lang: 'cuda', code: GODBOLT_SRC, caption: 'the kernel behind the glossary’s Godbolt link, verbatim',
        notes: {
          10: '<code>matrix_a</code> fragment, 16 × 16 × 16, <code>half</code> precision, stored <b>column-major</b>: the <code>.col</code> in the PTX.',
          11: '<code>matrix_b</code> fragment, stored <b>row-major</b>: the <code>.row</code> in the PTX.',
          12: 'The <code>accumulator</code> fragment holds <code>float</code>s: the <code>.f32.f32</code> (D and C) in the PTX, and the <code>F32</code> in the SASS.',
          14: '<code>c</code> is initialized to all zeros. In PTX this becomes <code>mov.f32 %f1, 0f00000000;</code>, and in SASS the zero register <code>RZ</code>.',
          15: 'Each of the 32 threads loads its share of A from global memory; 16 is the leading dimension (the stride between columns).',
          16: 'The same for B (16 is the stride between rows).',
          17: 'The glossary’s line, with the fragments’ real names: <code>mma_sync(c, a, b, c)</code>. It becomes one PTX <code>wmma.mma</code> and, for sm_75, four <code>HMMA.1688.F32</code>.',
          18: 'Write the 16 × 16 FP32 result to global memory, row-major.',
        },
      }));
      guard(s.tiling, 'Tiling zoom', () => tcTiling(s.tiling, ctx));
      guard(s.walk, 'Register walk-through', () => tcWalk(s.walk, ctx));
      guard(s.arch, 'SASS by architecture', () => tcArch(s.arch, ctx));
      ctx.reading(s.read, [
        { href: 'https://youtu.be/kLiwvnr4L80?t=868', label: 'Bill Dally, “Trends in Deep Learning Hardware”', note: 'why doing more work per instruction fetch saves power (from 14:28)' },
        { href: 'https://youtu.be/fhHAArxwzvQ?t=2072', label: 'David Patterson, “Evaluation of the Tensor Processing Unit”', note: 'TPUs, systolic arrays and the CISC view (from 34:32)' },
        { href: 'https://www.semanticscholar.org/paper/4d3a941a5749dbf0dd39554f12597c449c3c07ff', label: 'Patterson and Ditzel, “The Case for the Reduced Instruction Set Computer” (1980)', note: 'the paper that coined RISC and CISC' },
        { href: 'https://www.omgwiki.org/ddsf/doku.php?id=ddsf:public:guidebook:06_append:glossary:c:cisc', label: 'Complex instruction set computer (CISC)', note: 'a glossary definition' },
        { href: 'https://docs.nvidia.com/cuda/archive/12.8.0/parallel-thread-execution/index.html#warp-level-matrix-instructions', label: 'PTX ISA: warp-level matrix instructions', note: '<code>wmma</code> and friends, their shapes, layouts and fragments' },
        { href: 'https://godbolt.org/z/e6cqn8491', label: 'The wmma kernel on Godbolt (Compiler Explorer)', note: 'CUDA C++, PTX and SASS side by side' },
        { href: 'https://modal.com/blog/gpu-utilization-guide', label: 'Modal: the GPU utilization guide', note: 'what utilization-maximizing means' },
        { href: 'https://cudaforfun.substack.com/p/outperforming-cublas-on-h100-a-worklog', label: 'Pranjal Shankhdhar, “Outperforming cuBLAS on H100: a Worklog”', note: 'a matrix multiplication that does maximize Tensor Core use' },
        { href: 'https://images.nvidia.com/content/volta-architecture/pdf/volta-architecture-whitepaper.pdf', label: 'NVIDIA Tesla V100 (Volta) architecture white paper', note: 'the introduction of Tensor Cores' },
        { href: 'https://modal-cdn.com/gpu-glossary/gtc22-whitepaper-hopper.pdf', label: 'NVIDIA H100 (Hopper) architecture white paper', note: 'source of the SM figure' },
      ]);
    },
  });

  /* ═════════════════════════════ Tensor Memory Accelerator ═════════════════════════════ */

  GG.css(`
/* ── TMA · shared ── */
.hwb-two { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; }
.hwb-two.on { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
.hwb-pane { border: 1px solid var(--line); border-radius: 12px; background: rgba(8, 9, 14, 0.45); padding: 10px 10px 8px; min-width: 0; }
.hwb-pane-h { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; flex-wrap: wrap; font: 600 11px/1.3 var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-2); margin: 0 2px 6px; }
.hwb-pane-h b { color: var(--ink); font-weight: 700; }
.hwb-pane-h span { font-weight: 500; letter-spacing: 0.04em; text-transform: none; color: var(--ink-3); }
.hwb-pane-s { min-height: 2.9em; margin: 6px 2px 0; font: 500 12px/1.45 var(--font-mono); color: var(--ink-2); }
.hwb-pane-s b { color: var(--ink); font-weight: 600; }
.hwb-aff .hwb-cellr { cursor: pointer; }
.hwb-aff svg { touch-action: manipulation; }
.hwb-addr { margin-top: 8px; min-height: 2.6em; text-align: center; font: 500 13px/1.6 var(--font-mono); color: var(--ink-2); }
.hwb-addr b { color: var(--ink); font-weight: 600; }
.hwb-addr .nw { display: inline-block; white-space: nowrap; }
.hwb-addr .m { color: var(--memory); } .hwb-addr .s { color: var(--special); } .hwb-addr .a { color: var(--ink); text-decoration: underline; text-decoration-style: dotted; text-underline-offset: 3px; }
.hwb-tmap { margin-top: 10px; display: grid; grid-template-columns: max-content minmax(0, 1fr); gap: 3px 14px; font: 500 12px/1.5 var(--font-mono); color: var(--ink-2); }
.hwb-tmap .h { grid-column: 1 / -1; font: 600 10.5px/1.4 var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-3); margin-top: 4px; }
.hwb-tmap .h:first-child { margin-top: 0; }
.hwb-tmap b { color: var(--ink); font-weight: 600; }
.hwb-tmap i { font-style: normal; color: var(--ink-3); }
.hwb-tmap .sum { grid-column: 1 / -1; margin-top: 6px; color: var(--ink); }
.hwb-tmap .warn { grid-column: 1 / -1; color: var(--ink-3); }
.hwb-tmap code { overflow-wrap: anywhere; }
.hwb-node { cursor: pointer; outline: none; }
.hwb-hops { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 8px; margin-top: 10px; font: 500 12px/1.4 var(--font-mono); color: var(--ink-3); }
.hwb-hops[hidden] { display: none; }
.hwb-hop { display: inline-flex; align-items: center; gap: 7px; padding: 4px 9px 4px 4px; border-radius: 999px; border: 1px solid var(--line-2); opacity: 0.45; transition: opacity 0.2s, border-color 0.2s; }
.hwb-hop i { display: inline-grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; font: 700 11.5px/1 var(--font-mono); font-style: normal; color: var(--bg); background: var(--ink-3); }
.hwb-hop.on { opacity: 1; color: var(--ink); }
.hwb-hop.on[data-c="memory"] { border-color: var(--memory); } .hwb-hop.on[data-c="memory"] i { background: var(--memory); }
.hwb-hop.on[data-c="special"] { border-color: var(--special); } .hwb-hop.on[data-c="special"] i { background: var(--special); }
.hwb-hop-ar { color: var(--ink-3); }
@media (max-width: 560px) { .hwb-hop-ar { display: none; } }
.hwb-hop-tag { flex-basis: 100%; color: var(--ink-2); }
.hwb-hop-tag b { color: var(--ink); }
.hwb-node:focus-visible rect { stroke: var(--accent) !important; stroke-width: 2.4px !important; }
.hwb-edge { transition: opacity 0.3s; }
.hwb-gantt text { font-family: var(--font-mono); }
`);

  /* ── TMA Fig 1: where it sits in the SM ── */
  function tmaFloorplan(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'The Tensor Memory Accelerator in an H100 SM', hint: 'pick a view · hover or tap any block', wide: true,
      caption: 'The internal architecture of an H100 SM, redrawn from NVIDIA’s <a href="https://modal-cdn.com/gpu-glossary/gtc22-whitepaper-hopper.pdf">H100 white paper</a> as modified by the glossary. Note the Tensor Memory Accelerator at the bottom of the SM, shared between the four sub-units. The two bands under the SM stand for memory outside it: the L2 cache and, behind it, GPU RAM.',
    });
    const sm = GG.components.sm(f.stage, { highlight: ['tma'], ext: true });
    const hops = el('div', { class: 'hwb-hops', 'aria-live': 'polite' });
    f.stage.append(hops);
    let stops = [], gen = 0;
    const clearFlows = () => { gen++; stops.forEach((s2) => { try { s2(); } catch (e) { /* already gone */ } }); stops = []; };
    const VIEWS = {
      tma: {
        keys: ['tma'], flows: [],
        why: 'One <b>Tensor Memory Accelerator</b> per SM, drawn as a bar at the bottom, below the four sub-partitions. It is not inside any one sub-partition: all four share it, the same way they share the L1 data cache just below it. 132 SMs on an H100 SXM means 132 TMAs.',
      },
      with: {
        keys: ['tma', 'l1d'], flows: [['ext', 'tma', 'special'], ['tma', 'l1d', 'special']],
        steps: [{ n: '1', t: 'one copy: GPU RAM → TMA → shared memory', c: 'special' }],
        tag: '<b>1 step</b>, no register file on the way; the four sub-partitions stay free',
        why: '<b>The TMA path.</b> Data comes from GPU RAM (via the L2 cache) through the TMA and lands in the <b>shared memory</b> part of the L1 data cache in one step. The register files and the CUDA Cores in the four sub-partitions are not on the path at all. Compare “copy with ordinary loads”.',
      },
      without: {
        keys: ['ldst@0', 'regfile@0', 'l1d'], flows: [['ext', 'ldst', 'memory'], ['ldst', 'regfile', 'memory'], ['regfile', 'l1d', 'memory']], seq: true,
        steps: [{ n: '1', t: 'load: GPU RAM → LD/ST units', c: 'memory' }, { n: '2', t: 'the data lands in registers', c: 'memory' }, { n: '3', t: 'store: registers → shared memory', c: 'memory' }],
        tag: '<b>3 steps</b>, through the register file; drawn for one sub-partition, and all four do the same (×4)',
        why: '<b>The path with ordinary loads</b>, drawn for one sub-partition (the other three do the same). <b>1</b>: each thread issues loads through the load/store units. <b>2</b>: the data arrives in its <b>registers</b>. <b>3</b>: each thread issues stores to move it on into shared memory. Every byte passes through a register file, and every address is computed by the threads themselves. Ampere’s asynchronous copies (<code>cp.async</code>) skip the registers, but the threads still issue every copy and compute every address.',
      },
    };
    function setHop(V, k) {
      if (!V.steps) { hops.hidden = true; return; }
      hops.hidden = false;
      hops.innerHTML = V.steps.map((st2, i) => `<span class="hwb-hop${k < 0 || k === i ? ' on' : ''}" data-c="${st2.c}"><i>${st2.n}</i>${esc(st2.t)}</span>`).join('<span class="hwb-hop-ar" aria-hidden="true">→</span>') + `<div class="hwb-hop-tag">${V.tag}</div>`;
    }
    function show(v) {
      clearFlows();
      const V = VIEWS[v], g0 = gen;
      sm.highlight(V.keys);
      if (V.seq && !GG.reducedMotion) {
        // one step after another, in sub-partition 0 only, so the three-step path reads as a sequence
        let i = 0;
        const next = () => {
          if (g0 !== gen) return;
          const [a2, b2, c2] = V.flows[i];
          setHop(V, i);
          stops.push(sm.flow(a2, b2, { color: c2, dots: 4, speed: 110, sub: 0, once: true, onDone: () => {
            if (g0 !== gen) return;
            i = (i + 1) % V.flows.length;
            if (i === 0) setTimeout(next, 700); else next();
          } }));
        };
        next();
      } else {
        V.flows.forEach(([a2, b2, c2]) => { stops.push(sm.flow(a2, b2, { color: c2, dots: 4, speed: 90, sub: V.seq ? 0 : undefined })); });
        setHop(V, -1);
      }
      f.setWhy(V.why);
    }
    GG.ui.seg(f.controls, {
      label: 'Show', value: 'tma', onChange: show,
      options: [{ value: 'tma', label: 'the TMA' }, { value: 'with', label: 'copy with the TMA' }, { value: 'without', label: 'copy with ordinary loads' }],
    });
    const P = GG.components.sm.byKey;
    stat(f.readouts, { label: 'TMAs per SM', value: P.tma.perSM, tone: 'special' });
    stat(f.readouts, { label: 'sub-partitions sharing it', value: P.scheduler.perSM });
    stat(f.readouts, { label: 'TMAs · H100 SXM', value: fmt.int(P.tma.perSM * 132), tone: 'special' });
    sm.on('part', (key, part) => { if (part) f.setWhy(`<b>${esc(part.name)}</b> · ${esc(part.count)}. ${esc(part.desc)}`); });
    show('tma');
  }

  /* ── TMA Fig 2: what an affine access is, in 1, 2 and 3 dimensions ── */
  function tmaAffine(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'addr = width × base + offset', hint: 'pick 1D, 2D or 3D · tap the grid to move the tile · hover a cell · drag the sliders', wide: true,
      caption: 'An array stored row by row (row-major), as arrays in GPU RAM usually are. The top drawing is how we picture it; the strip below is how memory holds it, one address after another. Addresses here count elements; with 2-byte BF16 elements, the byte address is twice as large. In 2D, a rectangular tile becomes several separate runs of addresses, one per row of the tile, spaced one array width apart; in 3D, one run per row of every slice of the tile. “Multiply-adds per address” counts the arithmetic to compute each address from scratch with the formula.',
    });
    const DIMS = { 1: { R: 1, D: 1 }, 2: { R: 8, D: 1 }, 3: { R: 4, D: 3 } };
    const st = { dim: 2, width: 16, h: 4, w: 6, d: 2, r0: 2, c0: 5, z0: 0, hov: null };
    const R = () => DIMS[st.dim].R, D = () => DIMS[st.dim].D;
    const root = el('div', { class: 'hwb-aff' });
    f.stage.append(root);
    const host = el('div', { class: 'hwb-w' });
    const addr = el('div', { class: 'hwb-addr', 'aria-live': 'polite' });
    const tmap = el('div', { class: 'hwb-panel hwb-tmap' });
    root.append(host, addr, tmap);
    let W = 0, G = null;
    const A = (z, r, c) => (z * R() + r) * st.width + c;
    function fix() {
      st.w = clamp(st.w, 1, st.width); st.h = clamp(st.h, 1, R()); st.d = clamp(st.d, 1, D());
      st.r0 = clamp(st.r0, 0, R() - st.h); st.c0 = clamp(st.c0, 0, st.width - st.w); st.z0 = clamp(st.z0, 0, D() - st.d);
    }
    function build() {
      host.innerHTML = '';
      if (!W) return;
      const vbW = clamp(W, 300, 1000);
      const narrow = vbW < 600;
      const nR = R(), nD = D();
      const gapS = 26; // between slices
      const stack = narrow && nD > 1; // phones: slices one under another
      const s2 = stack || nD === 1 ? Math.min(narrow ? 18 : 30, (vbW - 46) / st.width) : Math.min(30, (vbW - 46 - (nD - 1) * gapS) / (nD * st.width));
      const sliceW = st.width * s2, sliceH = nR * s2;
      const totW = stack || nD === 1 ? sliceW : nD * sliceW + (nD - 1) * gapS;
      const gx = Math.max(40, (vbW - totW) / 2), gy = nD > 1 ? 42 : 26;
      const slicePos = (z) => (stack ? [gx, gy + z * (sliceH + gapS)] : [gx + z * (sliceW + gapS), gy]);
      const gridBot = stack ? gy + nD * sliceH + (nD - 1) * gapS : gy + sliceH;
      // strip: rpl array rows per strip line; phones keep 2 so labels stay legible and memory still reads as one line
      const nRows = nR * nD;
      const fsL = narrow ? 10.5 : 10;
      const minCell = narrow ? 5.2 : 6;
      const rpl = st.dim === 1 ? 1 : narrow ? Math.min(2, nRows) : clamp(Math.floor((vbW - 40) / (st.width * minCell)), 1, nRows);
      const lines = Math.ceil(nRows / rpl);
      const s1 = Math.min(14, (vbW - 40) / (rpl * st.width));
      const sx = (vbW - rpl * st.width * s1) / 2;
      const sy0 = gridBot + (narrow ? 64 : 52);
      const lineH = s1 + 30;
      const H = sy0 + lines * lineH + 4;
      const svg = svgRoot(host, vbW, H, `A ${st.dim}D array drawn as ${nD > 1 ? nD + ' slices of ' : ''}${nR} by ${st.width} cells, with a tile, and below it the same array as one line of addresses, where the tile becomes separate runs.`);
      const head = st.dim === 1 ? `as we picture it · a 1D array of ${st.width} elements` : st.dim === 2 ? `as we picture it · a 2D array, ${nR} rows × width ${st.width}` : `as we picture it · a 3D array, ${nD} slices × ${nR} rows × width ${st.width}`;
      const headN = st.dim === 1 ? `as we picture it · ${st.width} elements in a row` : st.dim === 2 ? `as we picture it · ${nR} rows × width ${st.width}` : `as we picture it · ${nD} slices × ${nR} rows × ${st.width}`;
      Tx(svg, narrow ? 4 : gx, 14, narrow ? headN : head, { fill: 'var(--ink-3)', size: narrow ? 10.5 : 11.5 });
      const cells = [], rowNums = [], sliceLabs = [];
      for (let z = 0; z < nD; z++) {
        const [ox, oy] = slicePos(z);
        if (nD > 1) sliceLabs.push(Tx(svg, ox, oy - 7, `slice ${z}`, { fill: 'var(--ink-3)', size: narrow ? 10.5 : 11, weight: 600 }));
        for (let r = 0; r < nR; r++) {
          if (st.dim > 1 && (stack || z === 0)) rowNums.push({ z, r, t: Tx(svg, ox - 7, oy + r * s2 + s2 / 2 + 4, 'r' + r, { fill: 'var(--ink-3)', size: narrow ? 10 : 11, 'text-anchor': 'end' }) });
          for (let c = 0; c < st.width; c++) {
            const rc = S('rect', { class: 'hwb-cellr', x: ox + c * s2 + 0.5, y: oy + r * s2 + 0.5, width: s2 - 1, height: s2 - 1, rx: 2 }, svg);
            rc.addEventListener('mouseenter', () => { st.hov = { z, r, c }; paint(); });
            rc.addEventListener('mouseleave', () => { st.hov = null; paint(); });
            rc.addEventListener('click', () => { st.z0 = z; st.r0 = r; st.c0 = c; fix(); syncSliders(); st.hov = { z, r, c }; paint(); });
            cells.push({ z, r, c, rc });
          }
        }
      }
      const tileOut = [];
      for (let z = 0; z < nD; z++) tileOut.push(S('rect', { x: 0, y: 0, width: 0, height: 0, rx: 3, style: 'fill:none;stroke:var(--memory);stroke-width:2;pointer-events:none' }, svg));
      Tx(svg, narrow ? 4 : sx, sy0 - (narrow ? 38 : 22), narrow ? 'as memory holds it · one address after another' : 'as memory holds it · one address after another, counting elements', { fill: 'var(--ink-3)', size: narrow ? 10.5 : 11.5 });
      if (narrow) Tx(svg, 4, sy0 - 23, 'addresses count elements (× 2 = bytes, BF16)', { fill: 'var(--ink-3)', size: 10.5 });
      const sc = [];
      const total = nRows * st.width;
      for (let q = 0; q < total; q++) {
        const row = Math.floor(q / st.width);
        const line = Math.floor(row / rpl), pos = q - line * rpl * st.width;
        const x = sx + pos * s1, y = sy0 + line * lineH;
        sc.push(S('rect', { x: x + 0.3, y, width: Math.max(0.6, s1 - 0.6), height: s1, rx: s1 > 8 ? 1.5 : 0.6 }, svg));
        if (q % st.width === 0) {
          S('line', { x1: x, x2: x, y1: y - 3, y2: y + s1 + 3, style: `stroke:${nD > 1 && row % nR === 0 ? 'var(--ink-2)' : 'var(--ink-3)'};stroke-width:${nD > 1 && row % nR === 0 ? 1.6 : 1}` }, svg);
          Tx(svg, x + 1, y + s1 + 14, String(q), { fill: 'var(--ink-3)', size: fsL });
        }
        if (pos === rpl * st.width - 1 && line < lines - 1) Tx(svg, x + s1 + 3, y + s1 - 1, '↵', { fill: 'var(--ink-3)', size: 11 });
      }
      const runLabs = [];
      for (let i = 0; i < nRows; i++) runLabs.push(Tx(svg, 0, 0, '', { fill: 'var(--memory)', size: fsL, weight: 600, 'text-anchor': 'middle' }));
      G = { svg, cells, sc, tileOut, s2, slicePos, runLabs, rowNums, rpl, s1, sx, sy0, lineH, narrow };
      paint();
    }
    const stE = stat(f.readouts, { label: 'elements in the tile', value: '', tone: 'memory' });
    const stR = stat(f.readouts, { label: 'separate runs', value: '', tone: 'memory' });
    const stM = stat(f.readouts, { label: 'multiply-adds per address', value: '' });
    const stT = stat(f.readouts, { label: 'address math for the tile', value: '', tone: 'core' });
    const inTile = (z, r, c) => z >= st.z0 && z < st.z0 + st.d && r >= st.r0 && r < st.r0 + st.h && c >= st.c0 && c < st.c0 + st.w;
    function runsOf() {
      if (st.dim === 1) return 1;
      if (st.w < st.width) return st.h * st.d;
      if (st.h < R()) return st.d; // whole rows: each slice's rows are contiguous
      return 1; // whole rows of whole slices
    }
    const nw = (h) => `<span class="nw">${h}</span>`;
    function paint() {
      if (!G) return;
      const hv = st.hov;
      G.cells.forEach((q) => {
        const t = inTile(q.z, q.r, q.c), h = hv && hv.z === q.z && hv.r === q.r && hv.c === q.c;
        q.rc.setAttribute('style', h ? 'fill:var(--accent);fill-opacity:0.85;stroke:var(--accent);stroke-width:1.5' : t ? 'fill:var(--memory);fill-opacity:0.62' : 'fill:var(--memory);fill-opacity:0.1');
      });
      G.tileOut.forEach((o, z) => {
        const on = z >= st.z0 && z < st.z0 + st.d;
        const [ox, oy] = G.slicePos(z);
        o.setAttribute('x', ox + st.c0 * G.s2 - 1.5); o.setAttribute('y', oy + st.r0 * G.s2 - 1.5);
        o.setAttribute('width', on ? st.w * G.s2 + 3 : 0); o.setAttribute('height', on ? st.h * G.s2 + 3 : 0);
      });
      const nR = R();
      G.sc.forEach((rc, q) => {
        const row = Math.floor(q / st.width), c = q % st.width, z = Math.floor(row / nR), r = row % nR;
        const t = inTile(z, r, c), h = hv && hv.z === z && hv.r === r && hv.c === c;
        rc.setAttribute('style', h ? 'fill:var(--accent)' : t ? 'fill:var(--memory);fill-opacity:0.9' : 'fill:var(--memory);fill-opacity:0.13');
      });
      // run labels: one per tile row, above its run in the strip
      let li = 0;
      G.runLabs.forEach((lab) => { lab.textContent = ''; });
      for (let z = st.z0; z < st.z0 + st.d; z++) for (let r = st.r0; r < st.r0 + st.h; r++) {
        const lab = G.runLabs[li++];
        if (!lab) continue;
        const row = z * nR + r, a0 = A(z, r, st.c0);
        const line = Math.floor(row / G.rpl), pos = a0 - line * G.rpl * st.width;
        lab.setAttribute('x', G.sx + (pos + st.w / 2) * G.s1);
        lab.setAttribute('y', G.sy0 + line * G.lineH - 4);
        const room = G.s1 * st.w, name = st.dim === 3 ? `s${z}r${r}` : st.dim === 2 ? `r${r}` : 'run';
        lab.textContent = room > (name.length + 5) * 6.5 ? `${name} · ${a0}` : room > name.length * 6.5 ? name : '';
      }
      G.rowNums.forEach(({ r, t }) => { const on = r >= st.r0 && r < st.r0 + st.h; t.style.fill = on ? 'var(--memory)' : 'var(--ink-3)'; t.style.fontWeight = on ? '700' : '400'; });
      const runs = runsOf(), n = st.h * st.w * st.d;
      const madds = st.dim - 1;
      stE.set(fmt.int(n)); stR.set(String(runs));
      stM.set(st.dim === 1 ? '0 (one add)' : String(madds));
      stT.set(st.dim === 1 ? `${fmt.int(n)} adds` : `${fmt.int(n * madds)} multiply-adds`);
      // the address formula, for the hovered cell or the tile's first element
      const p = hv || { z: st.z0, r: st.r0, c: st.c0 };
      const a = A(p.z, p.r, p.c);
      const who = hv ? '' : 'first element of the tile: ';
      const bytes = nw(`· byte <b>${fmt.int(2 * a)}</b>`);
      if (st.dim === 1) addr.innerHTML = `${who}${nw('<b>addr</b> = <span class="a">offset</span>')} ${nw(`= <span class="a">${p.c}</span>`)} ${nw('(base 0: no multiply)')} ${bytes}`;
      else if (st.dim === 2) addr.innerHTML = `${who}${nw('<b>addr</b> = <span class="m">width</span> × <span class="s">base</span> + <span class="a">offset</span>')} ${nw(`= <span class="m">${st.width}</span> × <span class="s">${p.r}</span> + <span class="a">${p.c}</span>`)} ${nw(`= <b>${a}</b>`)} ${bytes}`;
      else addr.innerHTML = `${who}${nw('<b>addr</b> = (<span class="s">slice</span> × rows + <span class="s">row</span>)')} ${nw('× <span class="m">width</span> + <span class="a">column</span>')} ${nw(`= (<span class="s">${p.z}</span> × ${nR} + <span class="s">${p.r}</span>) × <span class="m">${st.width}</span> + <span class="a">${p.c}</span>`)} ${nw(`= <b>${a}</b>`)} ${bytes}`;
      // the live explanation
      const starts = [];
      for (let z = st.z0; z < st.z0 + st.d; z++) for (let r = st.r0; r < st.r0 + st.h; r++) starts.push(A(z, r, st.c0));
      const list = starts.slice(0, 4).map(fmt.int).join(', ') + (starts.length > 4 ? ', …' : '');
      let why;
      if (st.dim === 1) {
        why = `In <b>one dimension</b> the tile is a single contiguous run of <b>${st.w}</b> ${plural(st.w, 'element')}, addresses ${st.c0} to ${st.c0 + st.w - 1}: each address is the previous one plus one, with no multiply at all. There is little address math to save here, and a 1D bulk copy needs no tensor map. The savings grow with the number of dimensions (try 2D and 3D) and with the size of the copy (Fig. 3).`;
      } else if (st.dim === 2) {
        const lastRow = st.r0 + st.h - 1;
        why = `The tile is <b>${st.h}</b> ${plural(st.h, 'row')} of <b>${st.w}</b> ${plural(st.w, 'element')}. Its ${plural(st.h, 'row')} ${st.h === 1 ? st.r0 : st.r0 + '–' + lastRow} ${st.h === 1 ? 'starts' : 'start'} at ${plural(st.h, 'address', 'addresses')} ${list}: each one is width × base + offset, with the row number as the base and the column as the offset, one multiply-add per address. `;
        if (runs === 1 && st.h > 1) why += 'This tile spans whole rows, so in memory it is one contiguous run: the easy case, a plain one-dimensional copy.';
        else if (st.h === 1) why += 'One row is one contiguous run of addresses: in effect a one-dimensional access.';
        else why += `In memory it is <b>${runs}</b> separate runs, ${st.width} apart (labelled r${st.r0}…r${lastRow} in the strip, like the grid’s rows). Copying it means computing ${fmt.int(n)} addresses from ${st.h} bases and ${st.w} offsets each. The TMA generates all of them in hardware from one description of the array and the tile, the tensor map below.`;
      } else {
        why = `In <b>three dimensions</b> the tile is ${st.d} ${plural(st.d, 'slice')} × ${st.h} ${plural(st.h, 'row')} × ${st.w} ${plural(st.w, 'element')} = <b>${fmt.int(n)}</b> elements. Each address is (slice × rows + row) × width + column: <b>two</b> multiply-adds, one more than in 2D, so computing every address from scratch costs ${fmt.int(2 * n)} multiply-adds. `;
        why += runs === 1 ? 'This tile is whole slices, so in memory it is one contiguous run.' : `In memory it is <b>${runs}</b> separate ${plural(runs, 'run')} (starting at ${list}), ${runs === st.d ? `one per slice, ${nR * st.width} apart` : `${st.width} apart within a slice and ${nR * st.width} apart between slices`}. The TMA takes the same one-instruction request and generates every address itself.`;
      }
      f.setWhy(why);
      // the tensor map that describes this array and tile (BF16 elements, 2 bytes each)
      const rowB = st.width * 2, boxB = st.w * 2;
      const bad = [];
      if (st.dim === 1) {
        const offB = st.c0 * 2, sizeB = st.w * 2;
        if (offB % 16) bad.push(`the source address is ${offB} bytes into the array, not a multiple of 16`);
        if (sizeB % 16) bad.push(`the size is ${sizeB} bytes`);
        tmap.innerHTML = `<div class="h">a 1D bulk copy · <span class="hwb-kc">no tensor map needed</span></div>
          <span>PTX</span><span><code>cp.async.bulk.shared::cluster.global…</code> <i>[smem], [array + </i><b>${st.c0} × 2 B</b><i>], </i><b>${sizeB} B</b><i>, [barrier]</i></span>
          <div class="sum">1 instruction → the TMA copies one contiguous run of <b>${sizeB}</b> bytes</div>
          <div class="warn">${bad.length ? `A real bulk copy needs 16-byte-aligned addresses and a size that is a multiple of 16 bytes; here ${bad.join(' and ')}.` : 'The address is 16-byte aligned and the size a multiple of 16 bytes, as a bulk copy requires.'}</div>`;
        return;
      }
      if (rowB % 16) bad.push(`the row stride is ${rowB} bytes`);
      if (boxB % 16) bad.push(`a tile row is ${boxB} bytes`);
      const three = st.dim === 3;
      tmap.innerHTML = `<div class="h">tensor map · built once on the host (<span class="hwb-kc">cuTensorMapEncodeTiled</span>)</div>
        <span>data type</span><span><b>BF16</b> <i>· 2 bytes per element</i></span>
        <span>globalDim</span><span><b>{${st.width}, ${nR}${three ? ', ' + D() : ''}}</b> <i>· ${three ? 'columns, rows, slices' : 'columns, rows'} (innermost first)</i></span>
        <span>globalStrides</span><span><b>{${rowB} B${three ? ', ' + rowB * nR + ' B' : ''}}</b> <i>· ${three ? 'one row = width × 2 bytes; one slice = ' + nR + ' rows' : 'one row = width × 2 bytes'}</i></span>
        <span>boxDim</span><span><b>{${st.w}, ${st.h}${three ? ', ' + st.d : ''}}</b> <i>· the tile, ${three ? 'w × h × d' : 'w × h'}</i></span>
        <div class="h">the copy · one thread, one instruction</div>
        <span>PTX</span><span><code>cp.async.bulk.tensor.${st.dim}d…</code> <i>[smem], [map, </i><b>{${st.c0}, ${st.r0}${three ? ', ' + st.z0 : ''}}</b><i>], [barrier]</i> <i>· the tile’s first ${three ? 'column, row and slice' : 'column and row'}</i></span>
        <div class="sum">1 descriptor + 1 instruction → the TMA generates <b>${fmt.int(n)}</b> element addresses in ${runs} ${plural(runs, 'run')}</div>
        <div class="warn">${bad.length ? `A real tensor map needs row strides and tile rows that are multiples of 16 bytes (8 BF16 elements); here ${bad.join(' and ')}, so a real kernel would pad the array or widen the tile.` : 'Both the row stride and the tile row are multiples of 16 bytes, as a real tensor map requires.'}</div>`;
    }
    let slWd, slH, slW, slD, slR, slC, slZ;
    function syncSliders() {
      slH.input.max = String(R()); slR.input.max = String(Math.max(0, R() - 1)); slZ.input.max = String(Math.max(0, D() - 1)); slD.input.max = String(D());
      slW.set(st.w); slH.set(st.h); slD.set(st.d); slR.set(st.r0); slC.set(st.c0); slZ.set(st.z0);
      slH.el.style.display = slR.el.style.display = st.dim === 1 ? 'none' : '';
      slD.el.style.display = slZ.el.style.display = st.dim === 3 ? '' : 'none';
    }
    GG.ui.seg(f.controls, { label: 'dimensions', value: 2, options: [{ value: 1, label: '1D' }, { value: 2, label: '2D' }, { value: 3, label: '3D' }], onChange: (v) => { st.dim = v; if (v === 3) { st.h = Math.min(st.h, 3); st.r0 = 1; st.d = 2; } if (v === 2) { st.h = 4; st.r0 = 2; } fix(); syncSliders(); build(); } });
    slWd = GG.ui.slider(f.controls, { label: 'array width', min: 8, max: 24, step: 1, value: st.width, onInput: (v) => { st.width = clamp(Math.round(v), 8, 24); fix(); syncSliders(); build(); } });
    slH = GG.ui.slider(f.controls, { label: 'tile rows (h)', min: 1, max: 8, step: 1, value: st.h, onInput: (v) => { st.h = Math.round(v); fix(); syncSliders(); paint(); } });
    slW = GG.ui.slider(f.controls, { label: 'tile columns (w)', min: 1, max: 24, step: 1, value: st.w, onInput: (v) => { st.w = Math.round(v); fix(); syncSliders(); paint(); } });
    slD = GG.ui.slider(f.controls, { label: 'tile slices (d)', min: 1, max: 3, step: 1, value: st.d, onInput: (v) => { st.d = Math.round(v); fix(); syncSliders(); paint(); } });
    slR = GG.ui.slider(f.controls, { label: 'tile’s first row', min: 0, max: 7, step: 1, value: st.r0, onInput: (v) => { st.r0 = Math.round(v); fix(); syncSliders(); paint(); } });
    slC = GG.ui.slider(f.controls, { label: 'tile’s first column', min: 0, max: 23, step: 1, value: st.c0, onInput: (v) => { st.c0 = Math.round(v); fix(); syncSliders(); paint(); } });
    slZ = GG.ui.slider(f.controls, { label: 'tile’s first slice', min: 0, max: 2, step: 1, value: st.z0, onInput: (v) => { st.z0 = Math.round(v); fix(); syncSliders(); paint(); } });
    void slWd;
    fix();
    syncSliders();
    onWidth(host, (w) => { W = w; build(); });
  }

  /* ── TMA Fig 3: the copy, two ways ── */
  function tmaCopy(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Copying one tile into shared memory, two ways', hint: 'step through the phases or press play · change the tile and the threads', wide: true,
      caption: 'A schematic, not a measurement. Both copies move the same tile of 16-bit (BF16) numbers, and we give them the same arrival time, so what differs is what the threads and registers do meanwhile. The left panel models the classic copy with ordinary loads and stores (no TMA, and no Ampere-style <code>cp.async</code>, which would skip the registers but still leave every copy and address to the threads). There each thread loads 16 bytes per instruction into four 32-bit registers and computes one global address per load (real code also computes shared memory addresses and loop counters); it holds all its loads in registers at once so that their latencies overlap. The 32 squares are one warp; with more copying threads, the other warps look the same.',
    });
    const SIZES = [[8, 8], [16, 16], [32, 32], [64, 64], [128, 64], [128, 128]];
    const NTH = [32, 64, 128, 256];
    const st = { si: 3, ti: 0 };
    function model() {
      const [h, w] = SIZES[st.si];
      const B = h * w * 2, n = NTH[st.ti];
      const vec = Math.ceil(B / 16);
      const cpt = Math.ceil(vec / n); // 16-byte loads per thread
      const busy = Math.min(n, vec); // threads that get any work
      return { h, w, B, n, vec, cpt, busy, regs: 4 * cpt, winstr: 2 * cpt * Math.ceil(busy / 32), warps: n / 32 };
    }
    const grid = el('div', { class: 'hwb-two' });
    f.stage.append(grid);
    const paneA = el('div', { class: 'hwb-pane' }), paneB = el('div', { class: 'hwb-pane' });
    grid.append(paneA, paneB);
    paneA.innerHTML = '<div class="hwb-pane-h"><b>Ordinary loads</b><span>no TMA, no cp.async · every thread copies</span></div>';
    paneB.innerHTML = '<div class="hwb-pane-h"><b>With the TMA</b><span>one thread asks, the TMA copies</span></div>';
    const hostA = el('div', { class: 'hwb-w' }), hostB = el('div', { class: 'hwb-w' });
    const sA = el('div', { class: 'hwb-pane-s' }), sB = el('div', { class: 'hwb-pane-s' });
    paneA.append(hostA, sA); paneB.append(hostB, sB);
    let ready = false;
    onWidth(grid, (w) => {
      grid.classList.toggle('on', w >= 760);
      const nw = (w >= 760 ? w / 2 : w) < 430;
      if (nw !== narrowNow) { buildPanels(nw); if (ready) update(); }
    });
    let VW = 460, RAM, RF, BOX, SMEM, LANES;
    const VH = 428;
    function geo(narrow) {
      VW = narrow ? 340 : 460;
      const bw = narrow ? 110 : 128;
      RAM = { x: 14, y: 8, w: VW - 28, h: 52 }; BOX = { x: VW - 14 - bw, y: 112, w: bw, h: 118 };
      RF = { x: 14, y: 112, w: VW - 28 - bw - 14, h: 118 }; SMEM = { x: 14, y: 266, w: VW - 28, h: 46 }; LANES = { x: 14, y: 356 };
    }
    const NP = 12;
    function panel(host, mode) {
      host.innerHTML = '';
      const svg = svgRoot(host, VW, VH, mode === 'A' ? 'Without the TMA: GPU RAM, the register file with 32 thread columns, the CUDA Cores computing addresses, shared memory, and a warp of 32 threads.' : 'With the TMA: GPU RAM, an unused register file, the TMA computing addresses, shared memory, and a warp of 32 threads.');
      const box = (b, color, op) => S('rect', { x: b.x, y: b.y, width: b.w, height: b.h, rx: 8, style: `fill:${color};fill-opacity:${op};stroke:${color};stroke-opacity:0.7;stroke-width:1.2` }, svg);
      box(RAM, 'var(--memory)', 0.08);
      Tx(svg, RAM.x + 12, RAM.y + 21, 'GPU RAM · global memory', { fill: 'var(--memory)', size: 13, weight: 600 });
      const ramSub = Tx(svg, RAM.x + 12, RAM.y + 40, '', { fill: 'var(--ink-3)', size: 11 });
      // tile glyph in RAM
      const gc = VW < 400 ? 4 : 6, gw = VW < 400 ? 11 : 15;
      for (let i = 0; i < 4; i++) for (let j = 0; j < gc; j++) S('rect', { x: RAM.x + RAM.w - 8 - gc * gw + j * gw, y: RAM.y + 8 + i * 9, width: gw - 2, height: 7, rx: 1.5, style: 'fill:var(--memory);fill-opacity:0.7' }, svg);
      // register file
      const rfFrame = box(RF, 'var(--memory)', 0.05);
      Tx(svg, RF.x + 10, RF.y + 17, 'Register file', { fill: 'var(--memory)', size: 12.5, weight: 600 });
      const rfSub = Tx(svg, RF.x + 10, RF.y + 32, '', { fill: 'var(--ink-3)', size: VW < 400 ? 11 : 10.5 });
      const bars = [];
      const bx0 = RF.x + 10, bw = (RF.w - 20) / 32, by0 = RF.y + 40, bh = RF.h - 48;
      for (let i = 0; i < 32; i++) {
        S('rect', { x: bx0 + i * bw + 1, y: by0, width: bw - 2, height: bh, rx: 1.5, style: 'fill:rgba(255,255,255,0.035)' }, svg);
        bars.push(S('rect', { x: bx0 + i * bw + 1, y: by0 + bh, width: bw - 2, height: 0, rx: 1.5, style: 'fill:var(--memory)' }, svg));
      }
      const capLine = S('line', { x1: bx0, x2: bx0 + 32 * bw, y1: by0, y2: by0, style: 'stroke:var(--danger);stroke-width:1;stroke-dasharray:3 3;opacity:0' }, svg);
      const rfNote = Tx(svg, RF.x + RF.w / 2, RF.y + RF.h / 2 + 18, '', { fill: 'var(--ink-3)', size: 11.5, 'text-anchor': 'middle' });
      // right box: CUDA Cores or TMA
      const col = mode === 'A' ? 'var(--core)' : 'var(--special)';
      const bxFrame = box(BOX, col, 0.06);
      Tx(svg, BOX.x + BOX.w / 2, BOX.y + 20, mode === 'A' ? 'CUDA Cores' : 'TMA', { fill: col, size: 13, weight: 700, 'text-anchor': 'middle' });
      Tx(svg, BOX.x + BOX.w / 2, BOX.y + 36, 'address math', { fill: 'var(--ink-3)', size: 10.5, 'text-anchor': 'middle' });
      const cnt = Tx(svg, BOX.x + BOX.w / 2, BOX.y + 70, '0', { fill: 'var(--ink)', size: 22, weight: 700, 'text-anchor': 'middle', family: 'var(--font-display)' });
      Tx(svg, BOX.x + BOX.w / 2, BOX.y + 88, 'addresses', { fill: 'var(--ink-3)', size: 10.5, 'text-anchor': 'middle' });
      Tx(svg, BOX.x + BOX.w / 2, BOX.y + 106, 'w × base + off', { fill: 'var(--ink-3)', size: 10, 'text-anchor': 'middle' });
      // shared memory
      box(SMEM, 'var(--memory)', 0.06);
      const fill = S('rect', { x: SMEM.x + 1, y: SMEM.y + 1, width: 0, height: SMEM.h - 2, rx: 7, style: 'fill:var(--memory);fill-opacity:0.32' }, svg);
      Tx(svg, SMEM.x + 12, SMEM.y + 20, 'Shared memory · L1 data cache', { fill: 'var(--memory)', size: 13, weight: 600 });
      const smSub = Tx(svg, SMEM.x + 12, SMEM.y + 37, '', { fill: 'var(--ink-3)', size: 11 });
      const flash = S('rect', { x: SMEM.x, y: SMEM.y, width: SMEM.w, height: SMEM.h, rx: 8, style: 'fill:none;stroke:var(--special);stroke-width:3;opacity:0' }, svg);
      // lanes
      Tx(svg, LANES.x, LANES.y - 7, 'warp 0 · 32 threads', { fill: 'var(--ink-3)', size: 10.5 });
      const laneState = Tx(svg, VW - 14, LANES.y - 7, '', { fill: 'var(--ink-2)', size: 10.5, weight: 600, 'text-anchor': 'end' });
      const lanes = [];
      const lw = (VW - 28) / 32;
      for (let i = 0; i < 32; i++) lanes.push(S('rect', { x: LANES.x + i * lw + 1, y: LANES.y, width: lw - 2, height: 18, rx: 2.5 }, svg));
      const legend = Tx(svg, LANES.x, LANES.y + 46, '', { fill: 'var(--ink-3)', size: VW < 400 ? 11 : 10 });
      // the one instruction: lane 0 hands the copy to the TMA (drawn only in its phase)
      let issue = null;
      if (mode === 'B') {
        const lx = LANES.x + lw / 2, ry = LANES.y + 27, rx = VW - 5;
        issue = S('g', { style: 'opacity:0;transition:opacity .25s' }, svg);
        S('path', { d: `M${lx} ${LANES.y + 19}V${ry}H${rx}V${BOX.y + BOX.h / 2}H${BOX.x + BOX.w + 1}`, style: 'stroke:var(--special);stroke-width:2;fill:none' }, issue);
        S('path', { d: `M${BOX.x + BOX.w + 1} ${BOX.y + BOX.h / 2}l7 -4.5v9z`, style: 'fill:var(--special)' }, issue);
        S('rect', { x: lx + 8, y: ry - 8, width: VW < 400 ? 196 : 222, height: 15, rx: 3, style: 'fill:#0b0c12' }, issue);
        Tx(issue, lx + 12, ry + 3.5, 'lane 0: cp.async.bulk.tensor', { fill: 'var(--special)', size: VW < 400 ? 11 : 11.5, weight: 700 });
      }
      // packets
      const pk = [];
      for (let i = 0; i < NP; i++) pk.push(S('rect', { x: -20, y: -20, width: 9, height: 6, rx: 1.5, style: 'fill:var(--memory);opacity:0' }, svg));
      // TMA bypass wire
      if (mode === 'B') {
        S('path', { d: `M${BOX.x + BOX.w / 2} ${RAM.y + RAM.h}V${BOX.y}M${BOX.x + BOX.w / 2} ${BOX.y + BOX.h}V${SMEM.y}`, style: 'stroke:var(--special);stroke-opacity:0.45;stroke-width:1.4;stroke-dasharray:4 3;fill:none' }, svg);
      } else {
        S('path', { d: `M${RF.x + RF.w / 2} ${RAM.y + RAM.h}V${RF.y}M${RF.x + RF.w / 2} ${RF.y + RF.h}V${SMEM.y}`, style: 'stroke:var(--memory);stroke-opacity:0.45;stroke-width:1.4;stroke-dasharray:4 3;fill:none' }, svg);
      }
      return { svg, ramSub, rfSub, bars, capLine, rfNote, rfFrame, bxFrame, cnt, fill, smSub, flash, laneState, lanes, legend, pk, by0, bh, issue };
    }
    let PA = null, PB = null, narrowNow = null;
    function buildPanels(narrow) { geo(narrow); PA = panel(hostA, 'A'); PB = panel(hostB, 'B'); narrowNow = narrow; }
    buildPanels(false);
    const PH = [
      { label: '1 · address math · issue' }, { label: '2 · copy in flight' }, { label: '3 · stores · copy lands' }, { label: '4 · barrier' }, { label: '5 · compute' },
    ];
    const LANE_COL = { addr: 'var(--core)', load: 'var(--memory)', wait: 'var(--control)', store: 'var(--memory)', issue: 'var(--special)', other: 'var(--core)', compute: 'var(--core)', idle: 'var(--surface-3)' };
    let lastKey = '', step = 0, stepT0 = 0;
    /* one phase of both copies; tau in [0, 1] is the progress through the phase, t drives the moving packets */
    function frame(ph, tau, t) {
      const M = model();
      const over = M.regs > 255;
      const regFrac = Math.min(1, M.regs / 255);
      let pa, laneA, txtA, regP = 0, smP = 0, cA = M.vec;
      let pb, laneB0, laneB, txtB, smB = 0, cB = M.vec, flashOn = 0;
      if (ph === 0) {
        pa = 'addr'; laneA = 'addr'; cA = Math.round(tau * M.vec);
        txtA = `<b>Address math.</b> Each of the ${fmt.int(M.busy)} copying threads computes the global address of each of its ${M.cpt} ${plural(M.cpt, 'load')} on the CUDA Cores: ${fmt.int(M.vec)} ${plural(M.vec, 'address', 'addresses')} in all.`;
        pb = 'issue'; laneB0 = 'issue'; laneB = 'other'; cB = 0;
        txtB = '<b>One instruction.</b> A single thread (lane 0, pink) tells the TMA: copy this tile, described by a tensor map (the array’s base address, sizes and row stride) and the tile’s coordinates, into shared memory. Then it rejoins its warp.';
      } else if (ph === 1) {
        pa = 'load'; laneA = 'wait'; regP = Math.min(1, tau * 1.6);
        txtA = `<b>Loads in flight.</b> Data streams from GPU RAM into registers: <b>${M.regs}</b> ${plural(M.regs, 'register')} per thread${over ? ', more than the 255 a thread can have' : ''}. The warp stalls until its loads arrive.`;
        pb = 'copy'; laneB0 = 'other'; laneB = 'other'; cB = Math.round(tau * M.vec); smB = tau;
        txtB = '<b>The TMA copies.</b> It computes the addresses itself and writes the data straight into shared memory. All 32 threads do other work meanwhile. The register file holds none of the tile.';
      } else if (ph === 2) {
        pa = 'store'; laneA = 'store'; regP = 1 - tau; smP = tau;
        txtA = '<b>Stores.</b> Each thread now issues stores that move its registers into shared memory, and the registers drain.';
        pb = 'land'; laneB0 = 'other'; laneB = 'other'; smB = 1; flashOn = 1 - 0.6 * tau;
        txtB = '<b>The copy lands.</b> As the last bytes arrive, the TMA updates a barrier object in shared memory (the pink outline). The warps are still busy with other work.';
      } else if (ph === 3) {
        pa = 'bar'; laneA = 'wait'; smP = 1;
        txtA = '<b>Barrier.</b> <code>__syncthreads()</code>: every thread waits until all the others have stored their part of the tile.';
        pb = 'check'; laneB0 = 'wait'; laneB = 'wait'; smB = 1;
        txtB = '<b>Done, detected asynchronously.</b> The threads that need the tile check the barrier when they are ready for it, find the copy complete, and go on.';
      } else {
        pa = 'comp'; laneA = 'compute'; smP = 1;
        txtA = '<b>Compute.</b> The tile is in shared memory and the threads can finally do math on it.';
        pb = 'comp'; laneB0 = 'compute'; laneB = 'compute'; smB = 1;
        txtB = '<b>Compute.</b> The consumers operate on the tile, which arrived while they were busy with other work.';
      }
      // paint A
      PA.cnt.textContent = fmt.int(cA);
      PA.bxFrame.style.fillOpacity = pa === 'addr' ? 0.3 : 0.06;
      PA.bars.forEach((b, i) => {
        const has = i < M.busy;
        const hh = has ? PA.bh * regFrac * regP : 0;
        b.setAttribute('y', PA.by0 + PA.bh - hh); b.setAttribute('height', Math.max(0, hh));
        b.style.fill = over ? 'var(--danger)' : 'var(--memory)';
      });
      PA.capLine.style.opacity = over && regP > 0 ? 1 : 0;
      PA.fill.setAttribute('width', Math.max(0, (SMEM.w - 2) * smP));
      PA.lanes.forEach((ln, i) => { const s2 = i < M.busy ? laneA : (laneA === 'compute' ? 'compute' : 'wait'); ln.style.fill = LANE_COL[s2]; ln.style.fillOpacity = s2 === 'compute' || s2 === 'wait' ? 0.9 : 0.75; });
      PA.laneState.textContent = { addr: 'computing addresses', wait: pa === 'bar' ? 'waiting at the barrier' : 'stalled on loads', store: 'storing', compute: 'computing on the tile' }[laneA];
      PA.pk.forEach((p, i) => {
        const q = (t * 0.9 + i / NP) % 1;
        const x = RF.x + 16 + ((i * 37) % (RF.w - 40));
        const moving = !GG.reducedMotion && (pa === 'load' || pa === 'store');
        if (moving && pa === 'load') { const y = RAM.y + RAM.h + 2 + q * (RF.y - RAM.y - RAM.h - 10); p.setAttribute('x', x); p.setAttribute('y', y); p.style.opacity = (0.95 * Math.min(1, 6 * (1 - q))).toFixed(2); }
        else if (moving) { const y = RF.y + RF.h + 2 + q * (SMEM.y - RF.y - RF.h - 10); p.setAttribute('x', x); p.setAttribute('y', y); p.style.opacity = (0.95 * Math.min(1, 6 * (1 - q))).toFixed(2); }
        else p.style.opacity = 0;
      });
      // paint B
      PB.cnt.textContent = fmt.int(cB);
      PB.bxFrame.style.fillOpacity = pb === 'copy' || pb === 'issue' ? 0.3 : 0.06;
      PB.bars.forEach((b) => { b.setAttribute('height', 0); });
      PB.fill.setAttribute('width', Math.max(0, (SMEM.w - 2) * smB));
      PB.flash.style.opacity = flashOn;
      if (PB.issue) PB.issue.style.opacity = pb === 'issue' ? 1 : 0;
      PB.lanes.forEach((ln, i) => { const s2 = i === 0 ? laneB0 : laneB; ln.style.fill = LANE_COL[s2]; ln.style.fillOpacity = s2 === 'other' ? 0.55 : 0.9; });
      PB.laneState.textContent = { issue: 'lane 0 issues · the rest work', other: 'doing other work', wait: 'checking the barrier', compute: 'computing on the tile' }[laneB0 === 'issue' ? 'issue' : laneB];
      PB.pk.forEach((p, i) => {
        if (pb === 'copy' && !GG.reducedMotion) {
          const q = (t * 0.9 + i / NP) % 1;
          const x = BOX.x + BOX.w / 2 - 4.5 + ((i % 3) - 1) * 14;
          const y = i % 2 === 0 ? RAM.y + RAM.h + 2 + q * (BOX.y - RAM.y - RAM.h - 10) : BOX.y + BOX.h + 2 + q * (SMEM.y - BOX.y - BOX.h - 10);
          p.setAttribute('x', x); p.setAttribute('y', y); p.style.opacity = (0.95 * Math.min(1, 6 * (1 - q))).toFixed(2); p.style.fill = 'var(--memory)';
        } else p.style.opacity = 0;
      });
      const key = pa + '|' + pb + '|' + st.si + '|' + st.ti;
      if (key !== lastKey) {
        lastKey = key;
        sA.innerHTML = txtA; sB.innerHTML = txtB;
        PA.legend.textContent = 'blue: moving data · amber: stalled · green: math';
        PB.legend.textContent = 'pink: issues the copy · amber: checks · green: math';
      }
    }
    const stB = stat(f.readouts, { label: 'tile', value: '', tone: 'memory' });
    const stRg = stat(f.readouts, { label: 'registers / thread · loads', value: '', tone: 'memory' });
    const stIn = stat(f.readouts, { label: 'copy instructions · loads', value: '' });
    const stAd = stat(f.readouts, { label: 'addresses by threads · loads', value: '', tone: 'core' });
    const stTm = stat(f.readouts, { label: 'with TMA', value: '', tone: 'special' });
    /* without animation (reduced motion), each phase is drawn in its end state, so every counter shows its final value */
    const paint = () => frame(step, GG.reducedMotion || !anim.running ? 1 : clamp((anim.time - stepT0) / 1.8, 0, 1), anim.time);
    function update() {
      const M = model();
      const tot = M.regs * M.busy;
      stB.set(`${M.h} × ${M.w} · ${fmt.bytes(M.B, 1)}`);
      stRg.set(M.regs > 255 ? `${M.regs} > 255` : String(M.regs), M.regs > 255 ? 'danger' : 'memory');
      stIn.set(fmt.int(M.winstr) + ' warp instr.');
      stAd.set(fmt.int(M.vec));
      stTm.set('1 instr. · 0 regs');
      [PA, PB].forEach((P) => { P.ramSub.textContent = `a ${M.h} × ${M.w} tile of BF16 · ${fmt.bytes(M.B, 1)}`; P.smSub.textContent = `${fmt.bytes(M.B, 1)} to fill`; });
      PA.rfSub.textContent = `${M.regs} ${VW < 400 ? '' : 'regs'}/thread · ${fmt.int(tot)} total`.replace(' /', '/');
      PB.rfSub.textContent = 'none of the tile';
      PB.rfNote.textContent = 'free for other work';
      PA.rfNote.textContent = '';
      const sz = fmt.bytes(M.B, 1);
      const who = M.busy < M.n ? `only ${fmt.int(M.busy)} of the ${M.n} threads get a share; each` : 'every thread';
      let why;
      if (M.regs > 255) why = `${an(sz) === 'an' ? 'An' : 'A'} ${sz} tile copied by ${M.n} threads needs <b>${M.regs}</b> registers per thread just to hold the data in flight, more than the 255 a thread may use. With ordinary loads the kernel must copy in rounds or use more threads; with the TMA, a single instruction moves it and no register holds any of it.`;
      else if (M.B < 1024) why = `A small tile (${fmt.bytes(M.B, 0)}): with ordinary loads it costs only ${M.regs} ${plural(M.regs, 'register')} per thread and ${M.winstr} warp instructions, so offloading it saves little. The TMA’s advantage grows with the size of the copy.`;
      else why = `${an(sz) === 'an' ? 'An' : 'A'} ${sz} tile copied by ${M.n} threads: with ordinary loads ${who} stages <b>${M.regs}</b> registers of data (${fmt.int(tot)} registers in all, register pressure) and the threads compute <b>${fmt.int(M.vec)}</b> addresses with ${fmt.int(M.winstr)} load and store warp instructions on top. With the TMA: one instruction from one thread, and zero registers of data.`;
      f.setWhy(why);
      lastKey = '';
      paint();
    }
    const anim = GG.anim(f.stage, () => { paint(); });
    const stp = GG.ui.stepper(f.controls, { label: 'Phase', steps: PH, autoplay: 2600, start: 0, onStep: (i) => { step = i; stepT0 = anim ? anim.time : 0; stepOut(f.controls, PH[i].label); if (ready) { lastKey = ''; paint(); } } });
    GG.ui.slider(f.controls, { label: 'tile', min: 0, max: SIZES.length - 1, step: 1, value: st.si, format: (v) => { const [h, w] = SIZES[Math.round(v)]; return `${h}×${w} · ${fmt.bytes(h * w * 2, 1)}`; }, onInput: (v) => { st.si = clamp(Math.round(v), 0, SIZES.length - 1); update(); } });
    GG.ui.seg(f.controls, { label: 'copying threads (ordinary loads)', value: 0, options: NTH.map((n, i) => ({ value: i, label: String(n) })), onChange: (v) => { st.ti = v; update(); } });
    ready = true;
    update();
    if (!GG.reducedMotion) GG.onVisible(f.root, () => { if (stp.get() === 0) stp.play(); }, { once: true });
  }

  /* ── TMA Fig 4: producers and consumers, overlapped ── */
  function tmaPipe(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Asynchronous copies let copying and computing overlap', hint: 'drag the time cursor or press play · change the ratio and the buffers', wide: true,
      caption: 'A model of a loop over six tiles, with time measured in units of one tile’s computation. Top: the threads copy each tile themselves and then compute on it, one after the other. Bottom: one thread hands each copy to the TMA, and the consumer warps compute on one buffer while the TMA fills the next. With one buffer there is nothing to overlap; with two or more, the slower of copying and computing sets the pace. A careful kernel can also overlap copies without a TMA (Ampere’s asynchronous copies are one way), at the price of the threads’ own instructions.',
    });
    const N = 6;
    const st = { r: 1, S: 2, t: 0 };
    function sim() {
      const C = st.r, Mt = 1;
      const sync = [];
      for (let k = 0; k < N; k++) sync.push({ c0: k * (C + Mt), c1: k * (C + Mt) + C, m0: k * (C + Mt) + C, m1: (k + 1) * (C + Mt) });
      const asy = [];
      for (let k = 0; k < N; k++) {
        const prevC = k ? asy[k - 1].c1 : 0;
        const freeAt = k >= st.S ? asy[k - st.S].m1 : 0;
        const c0 = Math.max(prevC, freeAt), c1 = c0 + C;
        const m0 = Math.max(c1, k ? asy[k - 1].m1 : 0), m1 = m0 + Mt;
        asy.push({ c0, c1, m0, m1 });
      }
      return { sync, asy, Ts: sync[N - 1].m1, Ta: asy[N - 1].m1 };
    }
    const host = el('div', { class: 'hwb-w hwb-gantt' });
    f.stage.append(host);
    f.stage.append(el('div', { class: 'hwb-legend', html: '<span><i class="hwb-sw-memory"></i>copy N: the warps copy tile N themselves</span><span><i class="hwb-sw-special"></i>copy N: the TMA copies tile N</span><span><i class="hwb-sw-core"></i>math N: compute on tile N</span><span><i class="hwb-sw-control" style="opacity:.55"></i>waiting for a tile</span><span><i style="width:9px;height:9px;transform:rotate(45deg);background:var(--special);border-radius:1px"></i>barrier: “tile N has landed”</span>' }));
    let W = 0, R = sim(), G = null;
    function draw() {
      host.innerHTML = '';
      if (!W) return;
      R = sim();
      const vbW = clamp(W, 300, 1020), narrow = vbW < 600;
      const lab = narrow ? 0 : 176, x0 = lab + 6, x1 = vbW - 10;
      const Tm = Math.max(R.Ts, R.Ta);
      const X = (t) => x0 + (t / Tm) * (x1 - x0);
      const rowH = narrow ? 44 : 34, bh = 18;
      const rows = [
        { y: 30, name: 'no TMA · warps', sub: 'copy, then compute' },
        { y: 30 + rowH + 26, name: 'TMA · one thread asks', sub: 'copies in flight' },
        { y: 30 + 2 * rowH + 26, name: 'TMA · consumer warps', sub: 'compute, or wait' },
      ];
      const H = rows[2].y + rowH + 34;
      const svg = svgRoot(host, vbW, H, 'Two timelines of a six-tile loop: without the TMA, copy and compute alternate; with the TMA, copies overlap the computation on the previous tile.');
      Tx(svg, x0, 14, 'without the TMA', { fill: 'var(--ink-2)', size: 11, weight: 600 });
      Tx(svg, x0, rows[1].y - 10, 'with the TMA', { fill: 'var(--ink-2)', size: 11, weight: 600 });
      rows.forEach((r) => {
        const ly = narrow ? r.y - 2 : r.y + 13;
        if (!narrow) { Tx(svg, 0, ly, r.name, { fill: 'var(--ink)', size: 11.5, weight: 600 }); Tx(svg, 0, ly + 13, r.sub, { fill: 'var(--ink-3)', size: 10 }); }
        S('rect', { x: x0, y: narrow ? r.y + 10 : r.y, width: x1 - x0, height: bh, rx: 3, style: 'fill:rgba(255,255,255,0.025)' }, svg);
      });
      if (narrow) rows.forEach((r) => { Tx(svg, x0, r.y + 4, r.name + ' · ' + r.sub, { fill: 'var(--ink-3)', size: 10 }); });
      const yOf = (i) => (narrow ? rows[i].y + 10 : rows[i].y);
      // the time cursor: one short mark per row, drawn under the bars so it never crosses a label
      const curG = S('g', { style: 'pointer-events:none' }, svg);
      const curSegs = [0, 1, 2].map((i) => S('line', { x1: 0, x2: 0, y1: yOf(i) - 4, y2: yOf(i) + bh + 4, style: 'stroke:var(--accent);stroke-width:2' }, curG));
      const segr = (i, a, b, color, op, long, short) => {
        if (b - a <= 1e-9) return;
        S('rect', { x: X(a) + 0.5, y: yOf(i), width: Math.max(0.8, X(b) - X(a) - 1), height: bh, rx: 3, style: `fill:${color};fill-opacity:${op}` }, svg);
        const w = X(b) - X(a);
        const label = long && w > long.length * 6.4 + 6 ? long : short && w > short.length * 6.4 + 4 ? short : '';
        if (label) Tx(svg, (X(a) + X(b)) / 2, yOf(i) + 13, label, { fill: '#0b0c12', size: 10, weight: 700, 'text-anchor': 'middle' });
      };
      R.sync.forEach((q, k) => { segr(0, q.c0, q.c1, 'var(--memory)', 0.85, 'copy ' + (k + 1), 'c' + (k + 1)); segr(0, q.m0, q.m1, 'var(--core)', 0.9, 'math ' + (k + 1), 'm' + (k + 1)); });
      R.asy.forEach((q, k) => {
        segr(1, q.c0, q.c1, 'var(--special)', 0.85, 'copy ' + (k + 1), 'c' + (k + 1));
        const prev = k ? R.asy[k - 1].m1 : 0;
        segr(2, prev, q.m0, 'var(--control)', 0.55, 'wait', '');
        segr(2, q.m0, q.m1, 'var(--core)', 0.9, 'math ' + (k + 1), 'm' + (k + 1));
        // the barrier: the copy's completion, which the consumers wait on
        const bx = X(q.c1);
        if (!narrow) S('line', { x1: bx, x2: bx, y1: yOf(1) + bh + 2, y2: yOf(2) - 2, style: 'stroke:var(--special);stroke-width:1.2;stroke-dasharray:2 2.5' }, svg);
        S('path', { d: `M${bx} ${yOf(1) + bh - 4}l4.5 4.5l-4.5 4.5l-4.5 -4.5z`, style: 'fill:var(--special);stroke:#0b0c12;stroke-width:1' }, svg);
      });
      // end markers
      [[0, R.Ts], [2, R.Ta]].forEach(([i, t]) => { S('line', { x1: X(t), x2: X(t), y1: yOf(i) - 4, y2: yOf(i) + bh + 4, style: 'stroke:var(--ink-2);stroke-width:1.4' }, svg); });
      // axis
      const ay = H - 14;
      S('line', { x1: x0, x2: x1, y1: ay - 10, y2: ay - 10, style: 'stroke:var(--line-2)' }, svg);
      const step = Tm > 16 ? 4 : Tm > 8 ? 2 : 1;
      for (let t = 0; t <= Tm + 1e-9; t += step) { S('line', { x1: X(t), x2: X(t), y1: ay - 13, y2: ay - 7, style: 'stroke:var(--ink-3)' }, svg); Tx(svg, X(t), ay + 3, String(t), { fill: 'var(--ink-3)', size: 9.5, 'text-anchor': 'middle' }); }
      if (!narrow) Tx(svg, 0, ay + 3, 'time · 1 = one tile’s compute', { fill: 'var(--ink-3)', size: 9.5 });
      G = { X, curSegs, Tm };
      cursor();
    }
    function stateAt(t) {
      const a = R.sync.find((q) => t >= q.c0 && t < q.m1);
      let sA;
      if (!a) sA = t >= R.Ts ? 'done with all six tiles' : 'between tiles';
      else { const k = R.sync.indexOf(a) + 1; sA = t < a.c1 ? `copying tile ${k} themselves` : `computing on tile ${k}`; }
      const cp = R.asy.filter((q) => t >= q.c0 && t < q.c1).map((q) => R.asy.indexOf(q) + 1);
      const mb = R.asy.find((q) => t >= q.m0 && t < q.m1);
      let sB;
      if (mb) sB = `computing on tile ${R.asy.indexOf(mb) + 1}`;
      else if (t >= R.Ta) sB = 'done with all six tiles';
      else sB = 'waiting for a copy to land';
      return { sA, sB, cp };
    }
    function cursor() {
      if (!G) return;
      const t = Math.min(st.t, G.Tm);
      G.curSegs.forEach((c) => { c.setAttribute('x1', G.X(t)); c.setAttribute('x2', G.X(t)); });
      const s = stateAt(t);
      f.setWhy(`At time <b>${fmt.fixed(t, 1)}</b>: without the TMA, the warps are ${s.sA}. With it, ${s.cp.length ? `the TMA is copying tile ${s.cp.join(' and ')} while ` : ''}the consumer warps are ${s.sB}. Each pink diamond is a copy completing its barrier, which releases the consumers’ wait. ${st.S === 1 ? 'With one buffer the next copy cannot start until the tile in it has been used, so nothing overlaps.' : `With ${st.S} buffers the TMA can fill one while the warps read another.`}`);
    }
    const stS = stat(f.readouts, { label: 'no TMA · total', value: '' });
    const stA = stat(f.readouts, { label: 'TMA · total', value: '', tone: 'special' });
    const stX = stat(f.readouts, { label: 'speed-up', value: '' });
    const stW = stat(f.readouts, { label: 'warp time not computing', value: '', title: 'copying (no TMA) → waiting for a tile (TMA)' });
    function update() {
      R = sim();
      stS.set(fmt.fixed(R.Ts, 1)); stA.set(fmt.fixed(R.Ta, 1)); stX.set('×' + fmt.fixed(R.Ts / R.Ta, 2));
      const waitA = R.asy.reduce((acc, q, k) => acc + (q.m0 - (k ? R.asy[k - 1].m1 : 0)), 0);
      stW.set(`${fmt.fixed(N * st.r, 1)} copying → ${fmt.fixed(waitA, 1)} waiting`);
      tSl.input.max = String(Math.ceil(Math.max(R.Ts, R.Ta) * 10) / 10);
      draw();
    }
    const tSl = GG.ui.slider(f.controls, { label: 'time cursor', min: 0, max: 12, step: 0.1, value: 0, format: (v) => fmt.fixed(v, 1), onInput: (v) => { st.t = v; anim.stop(); pb.sync(); cursor(); } });
    const anim = GG.anim(f.stage, (t, dt) => { st.t += dt * 1.6; if (st.t > Math.max(R.Ts, R.Ta) + 0.8) st.t = 0; tSl.set(Math.min(st.t, +tSl.input.max)); cursor(); }, { autostart: false });
    const pb = GG.ui.playButton(f.controls, anim);
    GG.ui.slider(f.controls, { label: 'copy ÷ compute time', min: 0.25, max: 3, step: 0.05, value: st.r, format: (v) => fmt.fixed(v, 2), onInput: (v) => { st.r = clamp(v, 0.25, 3); update(); } });
    GG.ui.seg(f.controls, { label: 'shared memory buffers', value: 2, options: [{ value: 1, label: '1' }, { value: 2, label: '2' }, { value: 3, label: '3' }], onChange: (v) => { st.S = v; update(); } });
    onWidth(host, (w) => { W = w; draw(); });
    st.t = 3.4;
    update();
    tSl.set(st.t);
  }

  /* ── TMA Fig 5: TMA vs Tensor Memory ── */
  function tmaNames(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Tensor Memory Accelerator ≠ Tensor Memory', hint: 'pick a GPU · hover or tap a block or an arrow', wide: true,
      caption: 'Beyond the glossary: where operands for the Tensor Cores move, by PTX instruction family, inside one SM. The TMA moves tiles between GPU RAM and shared memory in both directions (the two-headed pink arrows), and, in a cluster, into the shared memories of other SMs (drawn outside the SM’s frame). Tensor Memory, on datacenter Blackwell GPUs such as the B200 (compute capability 10.x), is filled and read by the Tensor Cores’ own <code>tcgen05</code> instructions; the 12.x Blackwell GPUs, such as the GeForce RTX 5090, have a TMA but no <code>tcgen05</code>. No TMA arrow touches Tensor Memory.',
    });
    const NODES = {
      ram: { name: 'GPU RAM', sub: 'global memory', c: 'var(--memory)', why: '<b>GPU RAM</b> holds the big arrays (matrices, tensors) in global memory. The TMA reads tiles of them, and writes tiles back.' },
      tma: { name: 'TMA', sub: 'Tensor Memory Accelerator', c: 'var(--special)', why: '<b>The Tensor Memory Accelerator</b> copies tiles between global memory and shared memory, computing the addresses itself. Despite its name, it never reads or writes Tensor Memory.' },
      smem: { name: 'Shared memory', sub: 'L1 data cache', c: 'var(--memory)', why: '<b>Shared memory</b>, carved from the L1 data cache. The TMA’s destination, and where the Tensor Cores read their B operand (and usually A) on Hopper and Blackwell.' },
      rf: { name: 'Registers', sub: 'register file', c: 'var(--memory)', why: '<b>Registers.</b> On Hopper, Tensor Core accumulators live here (and A may too). On Blackwell, threads read results out of Tensor Memory into registers with <code>tcgen05.ld</code>.' },
      tc: { name: 'Tensor Cores', sub: 'matrix math', c: 'var(--core)', why: '<b>Tensor Cores</b> do the matrix multiply-accumulate. They are the primary producers and consumers of Tensor Memory, where it exists.' },
      peer: { name: 'Shared memory', sub: 'of another SM, same cluster', c: 'var(--memory)', why: '<b>Another SM’s shared memory.</b> From Hopper on, the thread blocks of a kernel can be grouped into clusters that run on neighbouring SMs, and the TMA can move tiles into the shared memories of the cluster’s other SMs as well as its own.' },
      tmem: { name: 'Tensor Memory', sub: 'B200-class Blackwell', c: 'var(--memory)', why: '<b>Tensor Memory</b> is a memory in the SMs of datacenter Blackwell GPUs such as the B200, dedicated to the Tensor Cores: their accumulators live there, and it is reached with <code>tcgen05</code> instructions. It is not what the Tensor Memory Accelerator accelerates.' },
    };
    const EDGES = [
      { id: 'e1', a: 'ram', b: 'tma', lab: 'cp.async.bulk.tensor', c: 'var(--special)', arch: 'both', two: true, why: 'Both directions. <b>Loads:</b> a single thread issues one <code>cp.async.bulk.tensor</code> PTX instruction and the TMA reads the tile from global memory. <b>Stores</b> use the same instruction the other way, from shared to global memory, and its reduction form, <code>cp.reduce.async.bulk.tensor</code>, combines the tile with what global memory already holds as it writes (add, min, max, and bitwise and, or, xor, among others).' },
      { id: 'e2', a: 'tma', b: 'smem', lab: '', c: 'var(--special)', arch: 'both', two: true, why: 'For a load, the TMA writes the tile into shared memory, bypassing the registers, and signals a barrier there when it is complete. For a store, it reads the tile out of shared memory.' },
      { id: 'e8', a: 'tma', b: 'peer', lab: 'SM ↔ SM · cluster', c: 'var(--special)', arch: 'both', two: true, why: 'Within a cluster, a tile loaded from global memory can be delivered into another SM’s shared memory, or into several at once (<code>.multicast::cluster</code>), and bulk copies (<code>cp.async.bulk</code>) move data from one SM’s shared memory to another’s.' },
      { id: 'e3', a: 'smem', b: 'tc', lab: 'operands A, B', c: 'var(--core)', arch: 'both', why: 'The Tensor Cores read their operands from shared memory: with <code>wgmma</code> instructions on Hopper, <code>tcgen05.mma</code> on Blackwell.' },
      { id: 'e4', a: 'rf', b: 'tc', lab: 'A, accumulators', c: 'var(--core)', arch: 'hopper', why: 'On Hopper, <code>wgmma</code> keeps the accumulator matrix in the registers of the warpgroup’s threads, and can take A from registers too.' },
      { id: 'e5', a: 'tc', b: 'tmem', lab: 'accumulators', c: 'var(--core)', arch: 'blackwell', why: 'On Blackwell, <code>tcgen05.mma</code> accumulates into Tensor Memory (and can read A from it): the Tensor Cores produce and consume it.' },
      { id: 'e6', a: 'smem', b: 'tmem', lab: 'tcgen05.cp', c: 'var(--core)', arch: 'blackwell', why: '<code>tcgen05.cp</code> copies data from shared memory into Tensor Memory. It is a Tensor Core instruction family, not a TMA operation.' },
      { id: 'e7', a: 'tmem', b: 'rf', lab: 'tcgen05.ld / .st', c: 'var(--memory)', arch: 'blackwell', why: 'Threads move data between Tensor Memory and their registers with <code>tcgen05.ld</code> and <code>tcgen05.st</code>, for example to read out a finished result.' },
    ];
    const LAY = {
      wide: { W: 860, H: 404, box: [150, 54], n: { ram: [8, 138], tma: [200, 138], smem: [395, 138], tc: [660, 40], tmem: [660, 236], rf: [395, 262], peer: [200, 342] }, sm: [182, 18, 668, 304],
        labs: { e1: [180, 212, 'middle'], e3: [540, 92, 'start'], e4: [632, 192, 'start'], e7: [602, 296, 'middle'], e8: [289, 266, 'middle', 90] } },
      narrow: { W: 360, H: 420, box: [150, 50], n: { ram: [202, 8], tma: [8, 104], smem: [8, 196], rf: [8, 330], tc: [202, 150], tmem: [202, 330], peer: [8, 8] }, sm: [2, 90, 356, 320],
        labs: { e1: [214, 84, 'start'], e3: [180, 193, 'middle', 0, 'A, B'], e6: [176, 312, 'end'], e5: [289, 265, 'middle', 90], e4: [214, 258, 'start'], e7: [180, 397, 'middle'], e8: [92, 84, 'start', 0, 'SM ↔ SM'] } },
    };
    const mid = GG.uid('hwbah');
    let arch = 'blackwell', W = 0, G = null, sel = null;
    const host = el('div', { class: 'hwb-w' });
    f.stage.append(host);
    function anchor(r, other) {
      const cx = r[0] + r[2] / 2, cy = r[1] + r[3] / 2, ox = other[0] + other[2] / 2, oy = other[1] + other[3] / 2;
      const dx = ox - cx, dy = oy - cy;
      if (Math.abs(dx) * r[3] > Math.abs(dy) * r[2]) return [cx + Math.sign(dx) * r[2] / 2, cy + (dy / Math.abs(dx || 1)) * (r[2] / 2) * 0.5];
      return [cx + (dx / Math.abs(dy || 1)) * (r[3] / 2) * 0.6, cy + Math.sign(dy) * r[3] / 2];
    }
    function build() {
      host.innerHTML = '';
      if (!W) return;
      const L = W < 600 ? LAY.narrow : LAY.wide;
      const svg = svgRoot(host, L.W, L.H, 'Data paths for Tensor Core operands: GPU RAM to and from the TMA to and from shared memory; the TMA to another SM’s shared memory in a cluster; shared memory to the Tensor Cores; on Blackwell, Tensor Cores and Tensor Memory exchange accumulators, and Tensor Memory connects to registers. No path joins the TMA to Tensor Memory.');
      const defs = S('defs', {}, svg);
      ['special', 'core', 'memory'].forEach((c) => {
        const m = S('marker', { id: 'hwb-ah-' + c + '-' + mid, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
        S('path', { d: 'M0 0L10 5L0 10z', style: `fill:var(--${c})` }, m);
      });
      const [sx, sy, sw, shh] = L.sm;
      S('rect', { x: sx, y: sy, width: sw, height: shh, rx: 14, style: 'fill:rgba(255,255,255,0.015);stroke:var(--line-2);stroke-dasharray:5 4' }, svg);
      Tx(svg, sx + sw - 10, sy + shh - 9, 'inside one SM', { fill: 'var(--ink-3)', size: 10.5, 'text-anchor': 'end' });
      const rect = (k) => [L.n[k][0], L.n[k][1], L.box[0], L.box[1]];
      const eg = {};
      EDGES.forEach((e) => {
        const ra = rect(e.a), rb = rect(e.b);
        const p = anchor(ra, rb), q = anchor(rb, ra);
        const g = S('g', { class: 'hwb-edge', tabindex: '0', role: 'button', 'aria-label': (e.lab || 'TMA to and from shared memory') }, svg);
        const ck = e.c.match(/--(\w+)/)[1];
        const two = e.two || e.id === 'e4' || e.id === 'e5' || e.id === 'e7';
        S('line', { x1: p[0], y1: p[1], x2: q[0], y2: q[1], style: 'stroke:transparent;stroke-width:16' }, g);
        const ln = S('line', { x1: p[0], y1: p[1], x2: q[0], y2: q[1], 'marker-end': `url(#hwb-ah-${ck}-${mid})`, 'marker-start': two ? `url(#hwb-ah-${ck}-${mid})` : null, style: `stroke:${e.c};stroke-width:2` }, g);
        let lt = null;
        if (e.lab) {
          const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
          const horiz = Math.abs(q[0] - p[0]) > Math.abs(q[1] - p[1]);
          const o = L.labs[e.id];
          // labels sit on a dark backing so they read against any line they cross; o[3] rotates one along a vertical edge
          const bg = S('rect', { rx: 3, style: 'fill:var(--bg);fill-opacity:0.88' }, g);
          lt = o ? Tx(g, o[0], o[1], o[4] || e.lab, { fill: e.c, size: 10.5, weight: 600, 'text-anchor': o[2], transform: o[3] ? `rotate(${o[3]} ${o[0]} ${o[1]})` : null })
            : Tx(g, mx + (horiz ? 0 : 8), my + (horiz ? -8 : 4), e.lab, { fill: e.c, size: 10.5, weight: 600, 'text-anchor': horiz ? 'middle' : 'start' });
          try { const bb = lt.getBBox(); if (bb.width) { bg.setAttribute('x', bb.x - 3); bg.setAttribute('y', bb.y - 1); bg.setAttribute('width', bb.width + 6); bg.setAttribute('height', bb.height + 2); if (o && o[3]) bg.setAttribute('transform', `rotate(${o[3]} ${o[0]} ${o[1]})`); } } catch (err) { /* not laid out yet */ }
        }
        const go = () => { sel = { e }; paint(); };
        g.addEventListener('mouseenter', go); g.addEventListener('focus', go); g.addEventListener('click', go);
        g.addEventListener('mouseleave', () => { sel = null; paint(); });
        eg[e.id] = { g, ln, lt, e };
      });
      const ng = {};
      Object.keys(NODES).forEach((k) => {
        const N = NODES[k], r = rect(k);
        const g = S('g', { class: 'hwb-node', tabindex: '0', role: 'button', 'aria-label': N.name }, svg);
        const bx = S('rect', { x: r[0], y: r[1], width: r[2], height: r[3], rx: 9, style: `fill:${N.c};fill-opacity:0.12;stroke:${N.c};stroke-width:1.4` }, g);
        Tx(g, r[0] + r[2] / 2, r[1] + r[3] / 2 - 2, N.name, { fill: N.c, size: 13, weight: 700, 'text-anchor': 'middle' });
        const sub = Tx(g, r[0] + r[2] / 2, r[1] + r[3] / 2 + 14, N.sub, { fill: 'var(--ink-3)', size: N.sub.length * 6.1 > r[2] - 12 ? 9 : 10, 'text-anchor': 'middle' });
        const go = () => { sel = { n: k }; paint(); };
        g.addEventListener('mouseenter', go); g.addEventListener('focus', go); g.addEventListener('click', go);
        g.addEventListener('mouseleave', () => { sel = null; paint(); });
        ng[k] = { g, bx, sub };
      });
      const noLink = Tx(svg, 0, 0, '', { fill: 'var(--danger)', size: 11, weight: 600, 'text-anchor': 'middle' });
      G = { eg, ng, noLink, L, rect };
      paint();
    }
    function paint() {
      if (!G) return;
      const on = (e) => e.arch === 'both' || e.arch === arch;
      Object.values(G.eg).forEach(({ g, e }) => { g.style.opacity = sel && sel.e && sel.e !== e ? 0.35 : 1; g.style.display = on(e) ? '' : 'none'; });
      const tm = G.ng.tmem;
      tm.g.style.opacity = arch === 'blackwell' ? 1 : 0.28;
      tm.sub.textContent = arch === 'blackwell' ? 'B200-class Blackwell' : 'not on Hopper';
      Object.keys(G.ng).forEach((k) => { if (k !== 'tmem') G.ng[k].g.style.opacity = sel && sel.n && sel.n !== k ? 0.55 : 1; });
      if (sel && sel.e) f.setWhy(sel.e.why);
      else if (sel && sel.n) f.setWhy(arch === 'hopper' && sel.n === 'tmem' ? '<b>Tensor Memory</b> does not exist on Hopper GPUs like the H100; it arrived with Blackwell. Hopper has a TMA all the same.' : NODES[sel.n].why);
      else f.setWhy(arch === 'blackwell'
        ? 'On a <b>Blackwell</b> GPU like the B200, both exist. The <b>TMA</b> (pink) brings tiles from GPU RAM into shared memory. <b>Tensor Memory</b> sits with the Tensor Cores, which accumulate into it, and is filled and drained by <code>tcgen05</code> instructions. The two share a name and nothing else.'
        : 'On a <b>Hopper</b> GPU like the H100 there is no Tensor Memory at all, yet there is a <b>Tensor Memory Accelerator</b>: the “Tensor Memory” in its name means memory holding tensors, and the TMA copies those into shared memory. The Tensor Cores read operands from shared memory and keep accumulators in registers.');
    }
    GG.ui.seg(f.controls, { label: 'GPU', value: arch, options: [{ value: 'hopper', label: 'Hopper · H100' }, { value: 'blackwell', label: 'Blackwell · B200' }], onChange: (v) => { arch = v; sel = null; paint(); } });
    stat(f.readouts, { label: 'TMA', value: 'Hopper, Blackwell', tone: 'special' });
    stat(f.readouts, { label: 'Tensor Memory', value: 'B200-class Blackwell', tone: 'memory' });
    stat(f.readouts, { label: 'TMA ↔ Tensor Memory paths', value: '0' });
    onWidth(host, (w) => { const nw = w < 600; if (!G || (G.L === LAY.narrow) !== nw) { W = w; build(); } });
  }

  GG.entry('tensor-memory-accelerator', {
    render(body, ctx0) {
      const ctx = kcCtx(ctx0);
      body.classList.add('hwb-body');
      const s = ctx.html(body, `
<p><strong>Tensor Memory Accelerators</strong> are specialized hardware in Hopper and Blackwell ${T('streaming-multiprocessor-architecture', 'architecture')} GPUs designed to accelerate access to multi-dimensional arrays in ${T('gpu-ram', 'GPU RAM')}. “Tensor” here just means a multi-dimensional array: a matrix is a two-dimensional tensor, and a batch of images is a four-dimensional one. The TMA is a copy engine for <em>tiles</em> of such arrays, the rectangular blocks that matrix multiplications and other kernels work on one at a time.</p>
<div data-slot="sm" class="wide"></div>
<p>Fig. 1 is the glossary’s picture of an H100 ${T('streaming-multiprocessor', 'Streaming Multiprocessor (SM)')}. Note the Tensor Memory Accelerator at the bottom of the SM, shared between the four sub-units (the sub-partitions, each with its own ${T('warp-scheduler', 'warp scheduler')}, ${T('register-file', 'register file')} and cores).</p>
<h3>Straight into shared memory, around the registers</h3>
<p>The TMA loads data from ${T('global-memory', 'global memory')}/${T('gpu-ram', 'GPU RAM')} to ${T('shared-memory', 'shared memory')}/${T('l1-data-cache', 'L1 data cache')}, bypassing the ${T('registers', 'registers')}/${T('register-file', 'register file')} entirely. Each pair names one thing twice: first the memory as the programmer sees it in the ${T('memory-hierarchy', 'memory hierarchy')}, then the hardware that holds it. With ordinary loads, data on its way into shared memory goes through registers: each ${T('thread', 'thread')} loads values into its registers with the ${T('load-store-unit', 'load/store units')}, then stores them from there into shared memory. Before the Ampere architecture that was the only way. Fig. 1’s “copy with ordinary loads” view shows that path; “copy with the TMA” shows the shortcut.</p>
${GG.noteHTML('beyond', '<p><b>The TMA is not the first to skip the registers.</b> Ampere GPUs (A100, compute capability 8.0), which have no TMA, added asynchronous copies from global to shared memory (<code>cp.async</code> in PTX, <code>LDGSTS</code> in SASS) that, in the words of NVIDIA’s <a href="https://docs.nvidia.com/cuda/ampere-tuning-guide/index.html">Ampere Tuning Guide</a>, “avoid using extra registers for memory copies and can also bypass the L1 cache”. But with <code>cp.async</code> every thread still issues its own copies of 4, 8 or 16 bytes and computes their addresses. What the TMA adds is the rest: one thread issues one instruction for a whole tile of a 1D to 5D array, and the TMA hardware generates every address (the two advantages below).</p>')}
<h3>Advantage one: the TMA does the address arithmetic</h3>
<p>The first advantage of the TMA comes from reducing the use of other compute and memory resources. The TMA hardware calculates addresses for bulk <em>affine</em> memory accesses, i.e. accesses of the form <code>addr = width * base + offset</code> for many bases and offsets concurrently, which are the most common accesses for arrays. “Affine” means a multiply and an add, nothing fancier. In a row-major matrix the base is the row number, the width is the length of a row, and the offset is the column: Fig. 2 shows why a rectangular tile of a matrix turns into many such addresses, in many separate runs.</p>
<div data-slot="aff" class="wide"></div>
<p>Offloading this work to the TMA saves space in the ${T('register-file', 'register file')}, reducing “${T('register-pressure', 'register pressure')}”, and reduces demand on the ${T('arithmetic-bandwidth', 'arithmetic bandwidth')} provided by the ${T('cuda-core', 'CUDA Cores')}. Register pressure is the squeeze on a fixed budget: the more registers each thread needs, the fewer threads fit on an SM at once, and past 255 per thread the compiler must <em>spill</em> values to slower memory. A copy routed through registers occupies them until the data moves on, and the address math takes instruction slots from the cores that should be doing the kernel’s real arithmetic. The savings are more pronounced for large (KB-scale) accesses to arrays with two or more dimensions: big tiles need many registers to stage, and every extra dimension adds a multiply-add to each address computed from scratch (switch Fig. 2 between 1D, 2D and 3D). Fig. 3 shows the other half, size: how the register and instruction costs grow with the tile.</p>
<div data-slot="copy" class="wide"></div>
<h3>Advantage two: asynchronous copies</h3>
<p>The second advantage comes from the asynchronous execution model of TMA copies. A single ${T('thread', 'CUDA thread')} can trigger a large copy and then rejoin its ${T('warp', 'warp')} to perform other work. Those threads and others in the same ${T('thread-block', 'thread block')} can then asynchronously detect the completion of the TMA copy after it finishes and operate on the results, as in a <em>producer-consumer</em> model: one party produces data (here, the thread that asks for the copy, and the TMA that performs it), others consume it, and a shared signal tells the consumers when a batch is ready. In practice the signal is a barrier object in shared memory that the copy updates as its bytes arrive. Fig. 4 shows what this buys in a loop over many tiles.</p>
<div data-slot="pipe" class="wide"></div>
${GG.noteHTML('beyond', '<p><b>From NVIDIA’s Hopper Tuning Guide.</b> “The Hopper architecture builds on top of the asynchronous copies introduced by NVIDIA Ampere GPU architecture and provides a more sophisticated asynchronous copy engine: the Tensor Memory Accelerator (TMA).” (Ampere’s copies are the PTX <code>cp.async</code> instructions, with which each thread copies 4, 8 or 16 bytes from global to shared memory, as the PTX ISA specifies, still computing its own addresses and issuing its own copies.) The TMA “allows applications to transfer 1D and up to 5D tensors between global memory and shared memory, in both directions, as well as between the shared memory regions of different SMs in the same cluster”, and “for writes from shared memory to global memory, it allows specifying element wise reduction operations such as add/min/max as well as bitwise and/or for most common data types”. The guide lists its advantages, among them: “Avoids using registers for moving data between the different memory spaces.” “Avoids using SM instructions for moving data: a single thread can issue large data movement instructions to the TMA unit.” “Enables users to write warp specialized codes, where specific warps specialize on data movement between the different memory spaces while other warps only work on local data within the SM.”</p>')}
${GG.noteHTML('beyond', '<p><b>How it is programmed.</b> For a multi-dimensional copy the hardware needs a <em>tensor map</em>, a small descriptor of the array’s layout in global memory (base address, sizes, the stride from one row to the next in bytes) and of the tile’s shape in shared memory. It is usually built on the host with the ' + T('cuda-driver-api', 'CUDA Driver API') + ' function <code>cuTensorMapEncodeTiled</code> and passed to the ' + T('kernel', 'kernel') + ' as a <code>const __grid_constant__</code> parameter. In the kernel, one elected thread issues the ' + T('parallel-thread-execution', 'PTX') + ' instruction <code>cp.async.bulk.tensor</code> with the tile’s coordinates, and the threads wait on a shared memory barrier that knows how many bytes to expect. One-dimensional bulk copies of contiguous memory need no tensor map, just a pointer and a size. Libraries such as ' + T('cutlass', 'CUTLASS') + ' and ' + T('cute', 'CuTe') + ' wrap all of this.</p>')}
<p>For details, see the TMA sections of <a href="https://arxiv.org/abs/2501.12084v1">Luo et al.’s Hopper micro-benchmarking paper</a> (“Dissecting the NVIDIA Hopper Architecture through Microbenchmarking and Multiple Level Analysis”) and the <a href="https://docs.nvidia.com/cuda/hopper-tuning-guide/index.html#tensor-memory-accelerator">NVIDIA Hopper Tuning Guide</a>.</p>
<h3>Not to be confused with Tensor Memory</h3>
${GG.noteHTML('warn', '<p>Despite the name, the Tensor Memory Accelerator does not accelerate operations using ' + T('tensor-memory', 'Tensor Memory') + '. Read the name as “accelerator for memory holding tensors”. Tensor Memory is a separate thing: a memory that the SMs of datacenter Blackwell GPUs such as the B200 dedicate to their ' + T('tensor-core', 'Tensor Cores') + '. Hopper GPUs have a TMA and no Tensor Memory at all, and neither do the compute capability 12.x Blackwell GPUs such as the GeForce RTX 5090 (PTX offers the <code>tcgen05</code> instructions that use Tensor Memory only for 10.x and 11.0 targets).</p>')}
<div data-slot="names" class="wide"></div>
<div data-slot="nums"></div>
<div data-slot="read"></div>`);
      guard(s.sm, 'SM floorplan', () => tmaFloorplan(s.sm, ctx));
      guard(s.aff, 'Affine addresses', () => tmaAffine(s.aff, ctx));
      guard(s.copy, 'Copy comparison', () => tmaCopy(s.copy, ctx));
      guard(s.pipe, 'Pipeline', () => tmaPipe(s.pipe, ctx));
      guard(s.names, 'TMA and Tensor Memory', () => tmaNames(s.names, ctx));
      guard(s.nums, 'Key numbers', () => ctx.numbers(s.nums, [
        { value: '1', label: 'TMA per SM, shared by the four sub-partitions', tone: 'special' },
        { value: '0', label: 'registers the copied data passes through', tone: 'memory' },
        { value: '1', label: 'thread needed to start a copy', tone: 'special' },
        { value: '1D–5D', label: 'tensor shapes it can copy (Hopper Tuning Guide)' },
      ]));
      ctx.reading(s.read, [
        { href: 'https://arxiv.org/abs/2501.12084v1', label: 'Luo et al., “Dissecting the NVIDIA Hopper Architecture through Microbenchmarking and Multiple Level Analysis”', note: 'see its TMA sections' },
        { href: 'https://docs.nvidia.com/cuda/hopper-tuning-guide/index.html#tensor-memory-accelerator', label: 'NVIDIA Hopper Tuning Guide: Tensor Memory Accelerator', note: 'what the TMA does and why it helps' },
        { href: 'https://modal-cdn.com/gpu-glossary/gtc22-whitepaper-hopper.pdf', label: 'NVIDIA H100 (Hopper) architecture white paper', note: 'source of the SM figure' },
      ]);
    },
  });

  /* ═════════════════════════════ Streaming Multiprocessor Architecture ═════════════════════════════ */

  GG.css(`
.hwb-cmp { display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; align-items: start; }
.hwb-cmp.both { grid-template-columns: minmax(0, 0.48fr) minmax(0, 1fr); }
.hwb-cmp > div[hidden] { display: none; }
.hwb-cmp-h { font: 600 11px/1.3 var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-2); margin: 0 0 8px 2px; }
.hwb-cmp-h span { color: var(--ink-3); font-weight: 500; letter-spacing: 0.04em; text-transform: none; }
.hwb-tesla { max-width: 420px; margin: 0 auto; }
.hwb-tp { cursor: pointer; outline: none; }
.hwb-tp rect { transition: fill-opacity 0.2s, stroke-width 0.2s, opacity 0.2s; }
.hwb-tp:focus-visible rect { stroke: var(--accent) !important; stroke-width: 3px !important; }
.hwb-ver { position: relative; }
.hwb-pill { cursor: pointer; outline: none; }
.hwb-pill:focus-visible rect { stroke: var(--accent); stroke-width: 2.4px; }
.hwb-vdec { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 4px 18px; margin: 4px 0 12px; }
.hwb-vbig { font: 700 40px/1 var(--font-mono); color: var(--ink); letter-spacing: 0.01em; }
.hwb-vbig .mj { color: var(--ink); text-decoration: underline; text-decoration-thickness: 3px; text-underline-offset: 6px; text-decoration-color: var(--ink-3); } .hwb-vbig .mn { color: var(--ink-2); } .hwb-vbig .sx { color: var(--ink-3); }
.hwb-vside { font: 500 12.5px/1.6 var(--font-mono); color: var(--ink-2); }
.hwb-vside b { color: var(--ink); font-weight: 600; }
@media (max-width: 720px) { .hwb-vbig { font-size: 30px; } }
.hwb-mx { width: 100%; border-collapse: separate; border-spacing: 3px; font: 500 12px var(--font-mono); }
.hwb-mx th, .hwb-mx td { border: 0 !important; }
.hwb-mx th { color: var(--ink-3); font: 500 11.5px var(--font-mono); text-transform: none !important; letter-spacing: 0 !important; background: none !important; padding: 2px 6px; text-align: center; white-space: nowrap; }
.hwb-mx th.rowh { vertical-align: middle; text-align: left; color: var(--ink-2); cursor: pointer; }
.hwb-mx tr.sel th.rowh { color: var(--accent); }
.hwb-mx td { text-align: center; border-radius: 6px; padding: 6px 2px; cursor: pointer; min-width: 34px; transition: box-shadow 0.15s, opacity 0.2s; }
.hwb-mx td.y { background: var(--core-a); color: var(--core); }
.hwb-mx td.j { background: var(--control-a); color: var(--control); }
.hwb-mx td.n { background: rgba(255, 91, 110, 0.07); color: var(--danger); }
.hwb-mx tr:not(.sel) td { opacity: 0.75; }
.hwb-mx td.cur { box-shadow: 0 0 0 2px var(--accent); opacity: 1; }
.hwb-mx th.colh.cur { color: var(--accent); }
.hwb-mxwrap { overflow-x: auto; }
.hwb-cmd { margin-top: 10px; padding: 9px 12px; border-radius: 10px; background: var(--bg-2); border: 1px solid var(--line); font: 500 12.5px/1.5 var(--font-mono); color: var(--ink); white-space: pre-wrap; overflow-wrap: anywhere; }
@media (max-width: 560px) {
  .hwb-mx { border-spacing: 2px; font-size: 11px; }
  .hwb-mx th { font-size: 10.5px; padding: 2px 3px; }
  .hwb-mx th.rowh { padding-left: 0; }
  .hwb-mx { border-spacing: 3px; }
  .hwb-mx td { min-width: 24px; padding: 5px 1px; }
  .hwb-mx td.j { font-size: 9px; letter-spacing: -0.03em; }
  .hwb-cmd { font-size: 11.5px; }
}
.hwb-compat .stat { max-width: 100%; min-width: 0; }
.hwb-compat .stat b { white-space: normal; overflow-wrap: anywhere; line-height: 1.25; }
.hwb-mini { display: none; margin-top: 10px; }
.hwb-mini.on { display: block; }
.hwb-mini-cap { font: 500 11.5px/1.45 var(--font-mono); color: var(--ink-2); margin-top: 4px; }
.hwb-mini-cap b { color: var(--ink); font-weight: 600; }
.hwb-cmd .p { color: var(--ink-3); }
.hwb-cmd .h { color: var(--accent); }
`);

  /* ── SMA Fig 1: the original Tesla SM vs the Hopper SM ── */
  const TESLA_PARTS = [
    { key: 'icache', name: 'Instruction Cache', role: 'memory', h: ['l1i', 'l0i'], desc: 'Holds the instructions of the program the SM is running. On Hopper this became an L1 instruction cache for the SM plus a small L0 cache in each sub-partition.' },
    { key: 'mt', name: 'MT Issue', role: 'control', h: ['scheduler', 'dispatch'], desc: 'The multithreaded instruction issue unit: it picks a warp of 32 threads and issues the warp’s next instruction to the cores, and (in Fabien Sanglard’s description) enables and disables threads of a warp as their paths diverge and converge. Hopper has four of these jobs’ descendants, a warp scheduler and a dispatch unit per sub-partition.' },
    { key: 'const', name: 'Constants Cache', role: 'memory', h: [], desc: 'Caches constant memory, read-only values that every thread may read. The glossary’s H100 figure does not draw a constants cache.' },
    { key: 'rf', name: 'RF (1,024 × 32-bit)', role: 'memory', h: ['regfile'], desc: 'The register file, “where thread states are stored”, as Fabien Sanglard puts it. The figure, after his blog, labels it 1,024 × 32-bit, the blog’s 4 KiB. NVIDIA documented 8,192 32-bit registers (32 KiB) per SM for compute capability 1.0 and 1.1 (16,384 on 1.2 and 1.3), eight times the figure’s number; the sources disagree, and the readout uses NVIDIA’s count. An H100 SM has 65,536 (256 KiB), split over four sub-partitions.' },
    { key: 'core', name: 'Core', role: 'core', h: ['int32', 'fp32'], desc: 'One of eight scalar cores, the ancestors of CUDA Cores. Each executes one integer or one 32-bit floating point instruction per clock for one thread, the jobs of the Hopper SM’s INT32 and FP32 units (lit). Double-precision arithmetic came later, from compute capability 1.3, so the H100’s 64 FP64 units have no ancestor here. An H100 SM has 128 FP32 and 64 INT32 units besides, and four Tensor Cores.' },
    { key: 'sfu', name: 'SFU', role: 'special', h: ['sfu'], desc: 'One of two special function units, for transcendental math such as sine, cosine, exponentials and reciprocal square roots. The H100 SM has an SFU block in each sub-partition.' },
    { key: 'smem', name: '16 KiB Shared Memory', role: 'memory', h: ['l1d'], desc: '16 KiB of shared memory, the on-chip scratchpad that threads of a block share. On the H100 it is part of a 256 KiB L1 data cache / shared memory, of which up to 228 KB can be shared memory.' },
  ];
  function teslaSvg(parent, onHover) {
    const svg = svgRoot(parent, 460, 828, 'The original Tesla streaming multiprocessor: instruction cache, MT issue, constants cache, a register file of 1,024 32-bit registers, eight cores, two SFUs and 16 KiB of shared memory.');
    const groups = {};
    const C = { memory: 'var(--memory)', control: 'var(--control)', core: 'var(--core)', special: 'var(--special)' };
    function part(key, x, y, w, h, label) {
      const P = TESLA_PARTS.find((p) => p.key === key);
      const g = S('g', { class: 'hwb-tp', tabindex: groups[key] ? '-1' : '0', role: 'button', 'aria-label': P.name + '. ' + P.desc }, svg);
      const r = S('rect', { x: x + 0.5, y: y + 0.5, width: w - 1, height: h - 1, rx: 3, style: `fill:${C[P.role]};fill-opacity:0.12;stroke:${C[P.role]};stroke-width:1.3` }, g);
      Tx(g, x + w / 2, y + h / 2 + 6, label, { fill: C[P.role], size: 17, weight: 500, 'text-anchor': 'middle', family: 'var(--font-mono)' });
      (groups[key] = groups[key] || []).push({ g, r });
      const go = () => onHover(P);
      g.addEventListener('mouseenter', go); g.addEventListener('focus', go); g.addEventListener('click', go);
      g.addEventListener('mouseleave', () => onHover(null));
      g.addEventListener('blur', () => onHover(null));
    }
    S('rect', { x: 0, y: 0, width: 460, height: 828, rx: 10, style: 'fill:rgba(255,255,255,0.015);stroke:var(--line-2)' }, svg);
    part('icache', 20, 20, 420, 40, 'Instruction Cache');
    part('mt', 20, 72, 420, 40, 'MT Issue');
    part('const', 20, 124, 420, 40, 'Constants Cache');
    part('rf', 20, 176, 420, 80, 'RF (1,024 × 32-bit)');
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) part('core', 20 + j * 120, 268 + i * 120, 120, 120, 'Core');
    part('sfu', 276, 268, 164, 228, 'SFU');
    part('sfu', 276, 512, 164, 236, 'SFU');
    part('smem', 20, 760, 420, 48, '16 KiB Shared Memory');
    return {
      svg,
      light(key) {
        Object.keys(groups).forEach((k) => groups[k].forEach(({ r }) => { r.style.fillOpacity = !key ? '0.12' : k === key ? '0.38' : '0.05'; r.style.opacity = !key || k === key ? '1' : '0.5'; r.style.strokeWidth = k === key ? '2.4' : '1.3'; }));
      },
    };
  }
  /* A small schematic of the Hopper SM, for phones: shown right under the Tesla SM so a tap there lights
     something next to the finger (the full floorplan sits far below on a narrow screen). */
  function hopperMini(parent) {
    const wrap = el('div', { class: 'hwb-mini' });
    parent.append(wrap);
    const svg = svgRoot(wrap, 300, 130, 'A small schematic of the Hopper SM: an L1 instruction cache on top, four sub-partitions, then the TMA and the L1 data cache.');
    const RC = { memory: 'var(--memory)', control: 'var(--control)', core: 'var(--core)', special: 'var(--special)' };
    const parts = [];
    const box = (key, role, x, y, w, h) => { const r = S('rect', { x, y, width: w, height: h, rx: 2 }, svg); parts.push({ key, role, r }); };
    box('l1i', 'memory', 2, 2, 296, 10);
    for (let i = 0; i < 4; i++) {
      const x = 2 + i * 74.5, w = 71;
      S('rect', { x: x - 1, y: 15, width: w + 2, height: 83, rx: 4, style: 'fill:none;stroke:var(--line-2)' }, svg);
      box('l0i', 'memory', x + 2, 18, w - 4, 6); box('scheduler', 'control', x + 2, 26, w - 4, 6); box('dispatch', 'control', x + 2, 34, w - 4, 6);
      box('regfile', 'memory', x + 2, 42, w - 4, 13);
      const cw = (w - 4 - 2) / 4; // INT32 : FP32 : FP64 = 16 : 32 : 16 units
      box('int32', 'core', x + 2, 57, cw, 20); box('fp32', 'core', x + 3 + cw, 57, 2 * cw, 20); box('fp64', 'core', x + 4 + 3 * cw, 57, cw, 20);
      box('tensor', 'core', x + 2, 79, w - 4, 7);
      box('ldst', 'special', x + 2, 88, 42, 7); box('sfu', 'special', x + 47, 88, w - 49, 7);
    }
    box('tma', 'special', 2, 102, 296, 9); box('l1d', 'memory', 2, 114, 296, 14);
    const cap = el('div', { class: 'hwb-mini-cap' });
    wrap.append(cap);
    const NAMES = { int32: 'INT32 units', fp32: 'FP32 units', fp64: 'FP64 units' };
    const nameOf = (k) => NAMES[k] || ((GG.components.sm.byKey || {})[k] || {}).name || k;
    function light(keys, tName) {
      parts.forEach(({ key, role, r }) => { const on = keys.includes(key); r.setAttribute('style', `fill:${RC[role]};fill-opacity:${on ? 0.75 : 0.1};stroke:${RC[role]};stroke-opacity:${on ? 1 : 0.35};stroke-width:${on ? 1.4 : 0.8}`); });
      cap.innerHTML = !tName ? 'Hopper SM in miniature: tap a block of the Tesla SM above to see where it went.'
        : keys.length ? `<b>${esc(tName)}</b> became, in the Hopper SM: <b>${keys.map(nameOf).map(esc).join(', ')}</b>. Lit above; the full floorplan is below.`
          : `<b>${esc(tName)}</b>: the glossary’s Hopper figure has no counterpart.`;
    }
    light([], null);
    return { el: wrap, light };
  }
  function smaCompare(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'The original Tesla SM and the Hopper SM90', hint: 'pick a view · hover or tap a block of the Tesla SM', wide: true,
      caption: 'A streaming multiprocessor with the original “Tesla” SM architecture, redrawn from the glossary’s figure, modified from <a href="https://fabiensanglard.net/cuda">Fabien Sanglard’s blog</a>, and a streaming multiprocessor with the “Hopper” SM90 architecture, modified from NVIDIA’s <a href="https://modal-cdn.com/gpu-glossary/gtc22-whitepaper-hopper.pdf">H100 white paper</a>. The two are not drawn to the same scale.',
    });
    const grid = el('div', { class: 'hwb-cmp both' });
    f.stage.append(grid);
    const colT = el('div'), colH = el('div');
    colT.innerHTML = '<div class="hwb-cmp-h">Tesla · <span>compute capability 1.x, 2006</span></div>';
    colH.innerHTML = '<div class="hwb-cmp-h">Hopper · <span>SM90, compute capability 9.0, 2022</span></div>';
    grid.append(colT, colH);
    const tHost = el('div', { class: 'hwb-tesla' });
    colT.append(tHost);
    let mini = null;
    let mode = 'both', wide = true;
    const sm = GG.components.sm(colH, { interactive: true, maxHeight: '80vh' });
    const DEF = {
      both: 'Two SMs, about sixteen years apart. The Tesla SM is <b>eight cores</b> and two SFUs fed by one issue unit; the Hopper SM is four sub-partitions, each a small Tesla-like SM of its own with a warp scheduler, a register file and 32 FP32 units, plus a Tensor Core. Hover or tap a block of the Tesla SM to find what became of it in the Hopper SM.',
      tesla: 'The original <b>Tesla</b> SM, from NVIDIA’s first CUDA GPUs (the G80 in the GeForce 8800 GTX, 2006): one instruction cache, one multithreaded issue unit, a constants cache, a register file, <b>eight cores</b>, <b>two SFUs</b> and <b>16 KiB</b> of shared memory. Hover or tap a block.',
      hopper: 'The <b>Hopper</b> SM90, in the H100: four sub-partitions, each with an L0 instruction cache, a warp scheduler, a dispatch unit, a 64 KiB register file, 16 INT32, 32 FP32 and 16 FP64 units, a Tensor Core, eight load/store units and an SFU block; and, shared by all four, a TMA and a 256 KiB L1 data cache / shared memory. Hover or tap any block.',
    };
    const T = teslaSvg(tHost, (P) => {
      T.light(P && P.key);
      if (!P) { sm.clear(); mini.light([], null); f.setWhy(DEF[mode]); return; }
      if (P.h.length) sm.highlight(P.h); else sm.clear();
      mini.light(P.h, P.name);
      f.setWhy(`<b>${esc(P.name)}</b>. ${P.desc}${mode === 'both' && P.h.length ? ` Lit up in the Hopper SM${wide ? ', on the right' : ', in the miniature just under the Tesla SM and in full below'}.` : ''}`);
    });
    mini = hopperMini(tHost);
    sm.on('part', (key, part) => { if (part) f.setWhy(`<b>${esc(part.name)}</b> · ${esc(part.count)}. ${esc(part.desc)}`); });
    const stA = stat(f.readouts, { label: 'cores per SM', value: '', tone: 'core' });
    const stB = stat(f.readouts, { label: 'shared memory per SM', value: '', tone: 'memory' });
    const stC = stat(f.readouts, { label: '32-bit registers per SM', value: '', tone: 'memory', title: 'Tesla: 8,192 on compute capability 1.0 and 1.1 (16,384 on 1.2 and 1.3), per NVIDIA’s CUDA Programming Guide of the time' });
    const stD = stat(f.readouts, { label: 'Tensor Cores', value: '', tone: 'core' });
    function apply() {
      grid.classList.toggle('both', mode === 'both' && wide);
      colT.hidden = mode === 'hopper'; colH.hidden = mode === 'tesla';
      const v = { tesla: ['8', '16 KiB', '8,192', '0'], hopper: ['128 FP32', '≤ 228 KB (of 256 KiB L1)', '65,536', '4'], both: ['8 → 128 FP32', '16 KiB → ≤ 228 KB', '8,192 → 65,536', '0 → 4'] }[mode];
      stA.set(v[0]); stB.set(v[1]); stC.set(v[2]); stD.set(v[3]);
      T.light(null); sm.clear(); mini.light([], null);
      mini.el.classList.toggle('on', mode === 'both' && !wide);
      f.setWhy(DEF[mode]);
    }
    GG.ui.seg(f.controls, { label: 'Show', value: mode, options: [{ value: 'tesla', label: 'Tesla (1.x)' }, { value: 'hopper', label: 'Hopper (SM90)' }, { value: 'both', label: 'side by side' }], onChange: (v) => { mode = v; apply(); } });
    onWidth(grid, (w) => { const nw = w >= 700; if (nw !== wide) { wide = nw; apply(); } });
    apply();
  }

  /* ── SMA Fig 2: SM versions and architecture families ── */
  const SM_VERSIONS = [
    ['1.0', 'Tesla', 'GeForce 8800 Ultra, Tesla C870, Quadro FX 5600'], ['1.1', 'Tesla', 'GeForce 9800 GX2, GeForce GTS 250'], ['1.2', 'Tesla', 'GeForce GT 240'], ['1.3', 'Tesla', 'Tesla C1060, GeForce GTX 285'],
    ['2.0', 'Fermi', 'Tesla C2050, GeForce GTX 580'], ['2.1', 'Fermi', 'GeForce GTX 560 Ti, GeForce GTX 460'],
    ['3.0', 'Kepler', 'Tesla K10, GeForce GTX 770'], ['3.2', 'Kepler', 'Tegra K1, Jetson TK1'], ['3.5', 'Kepler', 'Tesla K40, Tesla K20, GeForce GTX 780 Ti'], ['3.7', 'Kepler', 'Tesla K80'],
    ['5.0', 'Maxwell', 'GeForce GTX 750 Ti, Quadro K2200'], ['5.2', 'Maxwell', 'Tesla M40, GeForce GTX 980'], ['5.3', 'Maxwell', 'Jetson Nano'],
    ['6.0', 'Pascal', 'Tesla P100'], ['6.1', 'Pascal', 'Tesla P40, GeForce GTX 1080 Ti'], ['6.2', 'Pascal', 'Jetson TX2'],
    ['7.0', 'Volta', 'V100, TITAN V'], ['7.2', 'Volta', 'Jetson AGX Xavier'], ['7.5', 'Turing', 'T4, GeForce RTX 2080 Ti'],
    ['8.0', 'Ampere', 'A100, A30'], ['8.6', 'Ampere', 'A10, A40, GeForce RTX 3090'], ['8.7', 'Ampere', 'Jetson AGX Orin'], ['8.9', 'Ada', 'L4, L40S, GeForce RTX 4090'],
    ['9.0', 'Hopper', 'H100, H200, GH200'],
    ['10.0', 'Blackwell', 'B200, GB200'], ['10.3', 'Blackwell', 'B300, GB300'], ['11.0', 'Blackwell', 'Jetson T5000'], ['12.0', 'Blackwell', 'GeForce RTX 5090, RTX PRO 6000 Blackwell'], ['12.1', 'Blackwell', 'GB10 (DGX Spark)'],
  ].map(([cc, fam, gpus]) => { const [mj, mn] = cc.split('.'); return { cc, fam, gpus, mj: +mj, mn: +mn, sm: 'sm_' + mj + mn }; });
  function spans(key) {
    const out = [];
    SM_VERSIONS.forEach((v, i) => { const k = v[key]; const last = out[out.length - 1]; if (last && last.k === k) last.b = i; else out.push({ k, a: i, b: i }); });
    return out;
  }
  function smaVersions(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Major versions and architecture families', hint: 'tap a version · or pick one of the glossary’s examples', wide: true,
      caption: 'The compute capabilities NVIDIA lists for its GPUs on its <a href="https://developer.nvidia.com/cuda-gpus">CUDA GPUs</a> and <a href="https://developer.nvidia.com/cuda-legacy-gpus">legacy CUDA GPUs</a> pages, with example GPUs from those pages, grouped two ways: by major version (one bracket) and by architecture family (the other), with family names as in NVIDIA’s CUDA documentation. Red brackets mark where the two groupings disagree. The selected version is copper; the other pills show how they relate to it: outlined in white, same major version and same family; red, one of the two but not both.',
    });
    const host = el('div', { class: 'hwb-ver' });
    f.stage.append(host);
    const dec = el('div', { class: 'hwb-vdec' });
    const big = el('div', { class: 'hwb-vbig' }), side = el('div', { class: 'hwb-vside' });
    dec.append(big, side);
    const chart = el('div', { class: 'hwb-w' });
    host.append(dec, chart);
    const MJ = spans('mj'), FM = spans('fam');
    const famMajors = {}; SM_VERSIONS.forEach((v) => { (famMajors[v.fam] = famMajors[v.fam] || new Set()).add(v.mj); });
    const majFams = {}; SM_VERSIONS.forEach((v) => { (majFams[v.mj] = majFams[v.mj] || new Set()).add(v.fam); });
    const badMaj = (m) => majFams[m].size > 1, badFam = (fa) => famMajors[fa].size > 1;
    let sel = SM_VERSIONS.findIndex((v) => v.cc === '8.9'), W = 0, G = null;
    function build() {
      chart.innerHTML = '';
      if (!W) return;
      const n = SM_VERSIONS.length;
      const vertical = W < 640;
      const pills = [];
      let svg;
      if (!vertical) {
        const vbW = clamp(W, 640, 1020), pw = (vbW - 20) / n, x0 = 10, py = 58, ph = 34;
        svg = svgRoot(chart, vbW, 180, 'Compute capabilities from 1.0 to 12.1 in a row, bracketed above by major version and below by architecture family.');
        Tx(svg, x0, 14, 'major version', { fill: 'var(--ink-3)', size: 10.5 });
        MJ.forEach((s) => {
          const xa = x0 + s.a * pw + 2, xb = x0 + (s.b + 1) * pw - 2, c = badMaj(s.k) ? 'var(--danger)' : 'var(--ink-3)';
          S('path', { d: `M${xa} ${py - 8}V${py - 14}H${xb}V${py - 8}`, style: `fill:none;stroke:${c};stroke-width:1.4` }, svg);
          Tx(svg, (xa + xb) / 2, py - 19, s.k + '.x', { fill: badMaj(s.k) ? 'var(--danger)' : 'var(--ink-2)', size: 12, weight: 700, 'text-anchor': 'middle' });
        });
        SM_VERSIONS.forEach((v, i) => {
          const g = S('g', { class: 'hwb-pill', tabindex: '0', role: 'button', 'aria-label': `Compute capability ${v.cc}, ${v.sm}, ${v.fam}` }, svg);
          const r = S('rect', { x: x0 + i * pw + 1.5, y: py, width: pw - 3, height: ph, rx: 6 }, g);
          const t = Tx(g, x0 + i * pw + pw / 2, py + ph / 2 + 4, v.cc, { fill: 'var(--ink)', size: pw > 34 ? 11.5 : 10, weight: 600, 'text-anchor': 'middle' });
          pills.push({ g, r, t });
        });
        const fy = py + ph + 8;
        FM.forEach((s, j) => {
          const xa = x0 + s.a * pw + 2, xb = x0 + (s.b + 1) * pw - 2, c = badFam(s.k) ? 'var(--danger)' : 'var(--ink-2)';
          S('path', { d: `M${xa} ${fy}V${fy + 6}H${xb}V${fy}`, style: `fill:none;stroke:${c};stroke-width:1.4` }, svg);
          const lab = s.k, fits = (xb - xa) > lab.length * 7.2, drop = fits ? 0 : (j % 2) * 13;
          // a label pushed down a line keeps a leader to its bracket
          if (drop) S('path', { d: `M${(xa + xb) / 2} ${fy + 7}V${fy + 22}`, style: `stroke:${c};stroke-width:1;stroke-dasharray:2 2` }, svg);
          Tx(svg, (xa + xb) / 2, fy + 21 + drop, lab, { fill: c, size: 11.5, weight: 600, 'text-anchor': 'middle' });
        });
        Tx(svg, x0, 172, 'architecture family', { fill: 'var(--ink-3)', size: 10.5 });
      } else {
        const vbW = 340, rh = 21, y0 = 26, px = 120, pw2 = 96;
        svg = svgRoot(chart, vbW, y0 + n * rh + 10, 'Compute capabilities from 1.0 to 12.1 in a column, bracketed on the left by major version and on the right by architecture family.');
        Tx(svg, px - 16, 14, 'major', { fill: 'var(--ink-3)', size: 10.5, 'text-anchor': 'end' });
        Tx(svg, px + pw2 + 16, 14, 'family', { fill: 'var(--ink-3)', size: 10.5 });
        MJ.forEach((s) => {
          const ya = y0 + s.a * rh + 2, yb = y0 + (s.b + 1) * rh - 2, c = badMaj(s.k) ? 'var(--danger)' : 'var(--ink-3)';
          S('path', { d: `M${px - 6} ${ya}H${px - 12}V${yb}H${px - 6}`, style: `fill:none;stroke:${c};stroke-width:1.4` }, svg);
          Tx(svg, px - 18, (ya + yb) / 2 + 4, s.k + '.x', { fill: badMaj(s.k) ? 'var(--danger)' : 'var(--ink-2)', size: 12, weight: 700, 'text-anchor': 'end' });
        });
        SM_VERSIONS.forEach((v, i) => {
          const g = S('g', { class: 'hwb-pill', tabindex: '0', role: 'button', 'aria-label': `Compute capability ${v.cc}, ${v.sm}, ${v.fam}` }, svg);
          const r = S('rect', { x: px, y: y0 + i * rh + 1.5, width: pw2, height: rh - 3, rx: 5 }, g);
          const t = Tx(g, px + pw2 / 2, y0 + i * rh + rh / 2 + 4, `${v.cc} · ${v.sm}`, { fill: 'var(--ink)', size: 10.5, weight: 600, 'text-anchor': 'middle' });
          pills.push({ g, r, t });
        });
        FM.forEach((s) => {
          const ya = y0 + s.a * rh + 2, yb = y0 + (s.b + 1) * rh - 2, c = badFam(s.k) ? 'var(--danger)' : 'var(--ink-2)';
          const xb = px + pw2 + 6;
          S('path', { d: `M${xb} ${ya}H${xb + 6}V${yb}H${xb}`, style: `fill:none;stroke:${c};stroke-width:1.4` }, svg);
          Tx(svg, xb + 12, (ya + yb) / 2 + 4, s.k, { fill: c, size: 11.5, weight: 600 });
        });
      }
      pills.forEach((p, i) => {
        const go = () => { sel = i; paint(); };
        p.g.addEventListener('click', go);
        p.g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      });
      G = { pills };
      paint();
    }
    const stM = stat(f.readouts, { label: 'major', value: '' });
    const stN = stat(f.readouts, { label: 'minor', value: '' });
    const stS = stat(f.readouts, { label: 'nvcc target', value: '' });
    const stF = stat(f.readouts, { label: 'family', value: '' });
    function paint() {
      const v = SM_VERSIONS[sel];
      if (G) G.pills.forEach((p, i) => {
        const w = SM_VERSIONS[i];
        const on = i === sel, sameMaj = w.mj === v.mj, sameFam = w.fam === v.fam;
        p.r.setAttribute('style', on ? 'fill:var(--accent);fill-opacity:0.9;stroke:var(--accent)' : sameMaj && sameFam ? 'fill:rgba(255,255,255,0.1);stroke:var(--ink);stroke-opacity:0.85;stroke-width:1.4' : sameMaj || sameFam ? 'fill:var(--danger);fill-opacity:0.16;stroke:var(--danger);stroke-opacity:0.55' : 'fill:rgba(255,255,255,0.05);stroke:var(--line-2)');
        p.t.style.fill = on ? 'var(--on-accent)' : 'var(--ink)';
      });
      big.innerHTML = `<span class="mj">${v.mj}</span><span class="sx">.</span><span class="mn">${v.mn}</span>`;
      side.innerHTML = `compute capability <b>${v.cc}</b> · nvcc: <b>${v.sm}</b><br>major <b style="text-decoration:underline;text-underline-offset:3px">${v.mj}</b>, minor <b style="color:var(--ink-2)">${v.mn}</b> · <b>${esc(v.fam)}</b><br>e.g. ${esc(v.gpus)}`;
      stM.set(v.mj); stN.set(v.mn); stS.set(v.sm); stF.set(v.fam);
      const sameMajOther = [...majFams[v.mj]].filter((x) => x !== v.fam);
      const famOtherMaj = [...famMajors[v.fam]].filter((x) => x !== v.mj);
      let why = `<b>${v.cc}</b> (<code>${v.sm}</code>): major version ${v.mj}, minor version ${v.mn}, the <b>${esc(v.fam)}</b> architecture. `;
      if (v.mj === 6) why += 'All SM versions 6.x are of the Pascal architecture, the glossary’s example of a major version that is synonymous with a family. NVIDIA’s PTX Writer’s Guide says so directly.';
      else if (v.cc === '8.9') why += 'The glossary’s counterexample: Ada GPUs have SM architecture version 8.9, the same major version as Ampere GPUs (8.0, 8.6, 8.7). NVIDIA calls Ada a separate architecture, yet the major version stays 8. (nvcc also accepts an Ampere target 8.8, <code>sm_88</code>, for which NVIDIA’s GPU lists name no GPU.)';
      else if (v.fam === 'Ampere') why += 'The glossary’s “Ampere GPUs”, the other half of its counterexample: the Ampere GPUs are 8.0, 8.6 and 8.7 (nvcc also accepts an Ampere target 8.8, <code>sm_88</code>, with no GPU listed), and Ada (8.9) shares the major version 8 with them.';
      else if (v.cc === '9.0') why += 'Hopper is the only family with major version 9, so here the major version does name the family. The glossary writes it SM90, as nvcc does (sm_90).';
      else if (sameMajOther.length) why += `Major version ${v.mj} is shared with ${sameMajOther.join(' and ')}, so the major version alone does not tell you the family.`;
      else if (famOtherMaj.length) why += `The ${esc(v.fam)} family spans major versions ${[...famMajors[v.fam]].join(', ')}: here the mismatch runs the other way, one family across several major versions.`;
      else why += `Every ${v.mj}.x version is ${esc(v.fam)}: for this major version, it is synonymous with the family.`;
      f.setWhy(why);
      // keep the example buttons in step with the selection
      if (seg) seg.set(EX.find((e) => e.pick(v)) ? EX.find((e) => e.pick(v)).value : null, false);
    }
    const EX = [
      { value: '6.1', label: '6.x · Pascal', title: 'all SM versions 6.x are Pascal (shows 6.1)', pick: (v) => v.mj === 6 },
      { value: '8.0', label: '8.x · Ampere', title: 'Ampere GPUs: 8.0, 8.6 and 8.7 (shows 8.0)', pick: (v) => v.fam === 'Ampere' },
      { value: '8.9', label: '8.9 · Ada', title: 'Ada: 8.9, the same major version as Ampere', pick: (v) => v.cc === '8.9' },
      { value: '9.0', label: 'SM90 · Hopper', title: 'Hopper, SM90: 9.0', pick: (v) => v.cc === '9.0' },
    ];
    let seg = null;
    seg = GG.ui.seg(f.controls, {
      label: 'The glossary’s examples', value: '8.9',
      options: EX.map((e) => ({ value: e.value, label: e.label, title: e.title })),
      onChange: (cc) => { sel = SM_VERSIONS.findIndex((v) => v.cc === cc); paint(); },
    });
    onWidth(chart, (w) => { const vert = w < 640; if (!G || vert !== G.vert || (!vert && Math.abs(w - W) > 40)) { W = w; build(); G.vert = vert; } });
  }

  /* ── SMA Fig 3: will this binary run? ── */
  // the same eleven GPUs as the Compute Capability entry's matrix (ds-a.js GPUS), so the two tables line up
  const DEVS = ['7.0', '7.5', '8.0', '8.6', '8.9', '9.0', '10.0', '10.3', '11.0', '12.0', '12.1'];
  const TARGETS = [
    { id: 'sm_80', kind: 'cubin', cc: '8.0' }, { id: 'sm_86', kind: 'cubin', cc: '8.6' }, { id: 'sm_90', kind: 'cubin', cc: '9.0' },
    { id: 'sm_90a', kind: 'arch', cc: '9.0' }, { id: 'sm_100', kind: 'cubin', cc: '10.0' }, { id: 'sm_100f', kind: 'fam', cc: '10.0' }, { id: 'sm_100a', kind: 'arch', cc: '10.0' },
    { id: 'compute_80', kind: 'ptx', cc: '8.0' }, { id: 'compute_90a', kind: 'ptxa', cc: '9.0' },
    { id: '-arch=sm_80', kind: 'fat', cc: '8.0' },
  ];
  const ccv = (s) => { const [a, b] = s.split('.').map(Number); return { a, b, n: a * 10 + b }; };
  function verdict(t, dev) {
    const T0 = ccv(t.cc), D = ccv(dev);
    const cubinOK = T0.a === D.a && D.b >= T0.b;
    if (t.kind === 'cubin') return cubinOK ? 'y' : 'n';
    if (t.kind === 'arch' || t.kind === 'ptxa') return T0.n === D.n ? (t.kind === 'arch' ? 'y' : 'j') : 'n';
    if (t.kind === 'fam') return ['10.0', '10.3'].includes(dev) && T0.a === 10 ? 'y' : 'n';
    if (t.kind === 'ptx') return D.n >= T0.n ? 'j' : 'n';
    if (t.kind === 'fat') return cubinOK ? 'y' : D.n >= T0.n ? 'j' : 'n';
    return 'n';
  }
  function cmdFor(t) {
    const x = t.cc.replace('.', '');
    if (t.kind === 'fat') return `nvcc <span class="h">-arch=sm_80</span> kernel.cu<span class="p">   # = -gencode arch=compute_80,code=[sm_80,compute_80]</span>`;
    if (t.kind === 'ptx' || t.kind === 'ptxa') return `nvcc -gencode arch=<span class="h">${t.id}</span>,code=<span class="h">${t.id}</span> kernel.cu<span class="p">   # PTX only</span>`;
    const suf = t.kind === 'arch' ? 'a' : t.kind === 'fam' ? 'f' : '';
    return `nvcc -gencode arch=compute_${x}${suf},code=<span class="h">${t.id}</span> kernel.cu<span class="p">   # SASS only</span>`;
  }
  function smaCompat(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Will it run? Compiled targets × GPUs', hint: 'tap a row or a cell', wide: true, class: 'hwb-compat',
      caption: 'Beyond the glossary: the compatibility rules from NVIDIA’s CUDA Programming Guide and nvcc documentation. Green: the SASS runs as is. Amber: no SASS fits, but the driver can just-in-time compile the PTX. Red: will not load. Rows are compile targets; columns are GPUs’ compute capabilities (7.0 V100, 7.5 T4, 8.0 A100, 8.6 A10 · RTX 3090, 8.9 L4 · L40S, 9.0 H100 · H200, 10.0 B200, 10.3 B300, 11.0 Jetson Thor, 12.0 RTX 5090, 12.1 DGX Spark), the same GPUs as the Compute Capability entry’s matrix. On phones the cells scroll sideways.',
    });
    let ti = 0, di = 3;
    const wrap = el('div', { class: 'hwb-mxwrap' });
    const cmd = el('div', { class: 'hwb-cmd' });
    f.stage.append(wrap, cmd);
    const tbl = el('table', { class: 'hwb-mx', role: 'grid', 'aria-label': 'Compatibility of compile targets with GPU compute capabilities' });
    wrap.append(tbl);
    tbl.innerHTML = '<thead><tr><th></th>' + DEVS.map((d, j) => `<th class="colh" data-j="${j}">${d}</th>`).join('') + '</tr></thead><tbody>' +
      TARGETS.map((t, i) => `<tr data-i="${i}"><th class="rowh" tabindex="0" data-i="${i}">${esc(t.id)}</th>` + DEVS.map((d, j) => { const v = verdict(t, d); return `<td class="${v}" data-i="${i}" data-j="${j}" tabindex="-1" aria-label="${esc(t.id)} on ${d}: ${{ y: 'runs', j: 'JIT from PTX', n: 'will not load' }[v]}">${{ y: '✓', j: 'JIT', n: '×' }[v]}</td>`; }).join('') + '</tr>').join('') + '</tbody>';
    tbl.addEventListener('click', (e) => {
      const c = e.target.closest('[data-i]');
      if (!c) return;
      ti = +c.getAttribute('data-i');
      if (c.hasAttribute('data-j')) di = +c.getAttribute('data-j');
      paint();
    });
    tbl.addEventListener('keydown', (e) => {
      const c = e.target.closest('th.rowh');
      if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); ti = +c.getAttribute('data-i'); paint(); }
      if (c && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { e.preventDefault(); di = clamp(di + (e.key === 'ArrowRight' ? 1 : -1), 0, DEVS.length - 1); ti = +c.getAttribute('data-i'); paint(); }
    });
    tbl.setAttribute('data-keys', '');
    const stY = stat(f.readouts, { label: 'runs as is on', value: '', tone: 'core' });
    const stJ = stat(f.readouts, { label: 'JIT from PTX on', value: '', tone: 'control' });
    const stN = stat(f.readouts, { label: 'will not load on', value: '', tone: 'danger' });
    function explain(t, d, v) {
      const T0 = ccv(t.cc), D = ccv(d);
      const dname = `${an(d)} ${d} GPU`;
      if (t.kind === 'cubin') {
        if (v === 'y') return `<b>${t.id}</b> on ${dname}: SASS for ${t.cc} runs on any GPU with the same major version (${T0.a}) and the same or a higher minor version${D.b > T0.b ? ` (${D.b} ≥ ${T0.b})` : ''}.`;
        if (T0.a === D.a) return `<b>${t.id}</b> on ${dname}: same major version, but a lower minor version (${D.b} &lt; ${T0.b}). SASS for ${t.cc} may use features ${an(d)} ${d} GPU lacks, so it will not load.`;
        return `<b>${t.id}</b> on ${dname}: different major versions (${T0.a} and ${D.a}). Compatibility across major versions is explicitly not guaranteed, and in practice SASS for one major version does not load on another: the instruction set and its encoding differ.`;
      }
      if (t.kind === 'arch') return v === 'y' ? `<b>${t.id}</b> on ${dname}: the <code>a</code> suffix unlocks architecture-specific features (such as Hopper’s <code>wgmma</code> Tensor Core instructions), and code compiled for it runs only on exactly compute capability ${t.cc}.` : `<b>${t.id}</b> on ${dname}: architecture-specific code runs only on exactly compute capability ${t.cc}, not even on later GPUs.`;
      if (t.kind === 'fam') return v === 'y' ? `<b>${t.id}</b> on ${dname}: the <code>f</code> suffix (from compute capability 10.0 on) targets features shared by a family; NVIDIA lists 10.0 and 10.3 in the <code>compute_100f</code> family, plus 10.7, a Rubin GPU not in this table.` : `<b>${t.id}</b> on ${dname}: family-specific code runs only on members of its family: of the GPUs in this table, 10.0 and 10.3.`;
      if (t.kind === 'ptx') return v === 'j' ? `<b>${t.id}</b> on ${dname}: there is no SASS, only PTX, so at load time the driver compiles it just in time for this GPU. PTX for ${t.cc} can be compiled for any compute capability equal to or higher than ${t.cc}, including future major versions.` : `<b>${t.id}</b> on ${dname}: PTX for ${t.cc} may use features ${an(d)} ${d} GPU lacks, so it cannot be compiled for it.`;
      if (t.kind === 'ptxa') return v === 'j' ? `<b>${t.id}</b> on ${dname}: architecture-specific PTX can be JIT-compiled only for exactly ${t.cc}.` : `<b>${t.id}</b> on ${dname}: architecture-specific PTX has no forward compatibility; it targets exactly ${t.cc}.`;
      if (v === 'y') return `<b>-arch=sm_80</b> on ${dname}: this shorthand puts both SASS for sm_80 and PTX for compute_80 into the binary (a fatbin). The SASS runs as is on every 8.x GPU.`;
      if (v === 'j') return `<b>-arch=sm_80</b> on ${dname}: the sm_80 SASS cannot run here (major version ${D.a}), but the compute_80 PTX that rides along is JIT-compiled by the driver. This is how binaries keep working on GPUs released after them.`;
      return `<b>-arch=sm_80</b> on ${dname}: neither the SASS nor the PTX (which needs 8.0 or higher) can be used on ${an(d)} ${d} GPU.`;
    }
    function paint() {
      const t = TARGETS[ti], d = DEVS[di];
      $$(tbl, 'tbody tr').forEach((tr, i) => tr.classList.toggle('sel', i === ti));
      $$(tbl, 'td').forEach((td) => td.classList.toggle('cur', +td.getAttribute('data-i') === ti && +td.getAttribute('data-j') === di));
      $$(tbl, 'th.colh').forEach((th, j) => th.classList.toggle('cur', j === di));
      const vs = DEVS.map((x) => verdict(t, x));
      const list = (c) => DEVS.filter((x, j) => vs[j] === c);
      stY.set(list('y').join(', ') || 'none'); stJ.set(list('j').join(', ') || 'none'); stN.set(list('n').join(', ') || 'none');
      cmd.innerHTML = cmdFor(t);
      f.setWhy(explain(t, d, verdict(t, d)));
    }
    paint();
  }

  GG.entry('streaming-multiprocessor-architecture', {
    render(body, ctx0) {
      const ctx = kcCtx(ctx0);
      body.classList.add('hwb-body');
      const s = ctx.html(body, `
<p>${T('streaming-multiprocessor', 'Streaming Multiprocessors (SMs)')} are versioned with a particular “architecture” that defines their compatibility with ${T('streaming-assembler', 'Streaming Assembler (SASS)')} code. SASS is the GPU’s machine code, and it changes from one hardware generation to the next: new instructions appear (Tensor Core instructions, for example), old ones change their encoding. So every SM carries a version number, and every piece of SASS is compiled for one. The version tells you, and the driver, which SASS a GPU can run.</p>
<div data-slot="cmp" class="wide"></div>
<p>Fig. 1 shows two SMs at either end of that history: one with the “Hopper” SM90 architecture, from the H100, and one with the original “Tesla” SM architecture, from NVIDIA’s first GPUs that could run CUDA. Between them lie Fermi, Kepler, Maxwell, Pascal, Volta, Turing, Ampere and Ada, and after Hopper comes Blackwell.</p>
${GG.noteHTML('check', '<p>The register file label in the glossary’s Tesla figure reads “RF (1,02432-bit)”, a lost separator; we read it as 1,024 × 32-bit. 1,024 registers of 32 bits are 4 KiB, matching the blog post the figure comes from: “The 4KiB Register File (RF) is where thread states are stored.” NVIDIA’s documentation of the time gives compute capability 1.0 and 1.1 GPUs 8,192 32-bit registers per multiprocessor (32 KiB), and 16,384 from compute capability 1.2: eight times the figure’s number, or more. The two sources disagree, and neither explains the difference. Fig. 1 keeps the figure’s label, and its readout uses NVIDIA’s whole-SM count: 8,192 registers then, 65,536 in an H100 SM, eight times as many.</p>')}
${GG.noteHTML('history', '<p>Tesla was NVIDIA’s first “unified” architecture, released in 2006 in the G80 chip of the GeForce 8800 GTX: one kind of SM ran vertex, geometry and pixel programs alike, which is what made general-purpose CUDA programs possible (see ' + T('cuda-device-architecture', 'CUDA Device Architecture') + '). Do not confuse the architecture with NVIDIA’s Tesla line of data center cards (Tesla C870, Tesla K80, Tesla P100 …), which kept the name through several later architectures.</p>')}
<h3>Major and minor versions</h3>
<p>Most ${T('streaming-multiprocessor', 'SM')} versions have two components: a major version and a minor version. They are written <code>major.minor</code>, as in 8.9, which NVIDIA calls the GPU’s ${T('compute-capability', 'compute capability')}, or run together after <code>sm_</code> for the compiler, as in <code>sm_89</code>. The glossary’s figure caption calls Hopper “SM90”: version 9.0. From Hopper on, some targets also carry a letter suffix, as in <code>sm_90a</code> (Fig. 3).</p>
<p>The major version is <em>almost</em> synonymous with GPU architecture family. For example, all SM versions <code>6.x</code> are of the Pascal architecture. Some NVIDIA documentation even <a href="https://docs.nvidia.com/cuda/ptx-writers-guide-to-interoperability/index.html">makes this claim directly</a>. But, as an example, Ada GPUs have ${T('streaming-multiprocessor', 'SM')} architecture version <code>8.9</code>, the same major version as Ampere GPUs. Fig. 2 lines up every compute capability NVIDIA lists for its GPUs and groups it both ways.</p>
<div data-slot="ver" class="wide"></div>
${GG.noteHTML('beyond', '<p><b>What NVIDIA’s documents say.</b> The PTX Writer’s Guide to Interoperability: “There are multiple CUDA architecture families, each with their own ISA; e.g. SM 5.x is the Maxwell family, SM 6.x is the Pascal family.” The nvcc documentation is more careful: “While GPU generations are often referred to by product names such as Hopper or Blackwell, these don’t always have a direct correspondence to major compute capability version.” Fig. 2 shows three places where they do not: Turing (7.5) shares major version 7 with Volta, Ada (8.9) shares 8 with Ampere, and Blackwell spans 10, 11 and 12. A fourth, not in Fig. 2: nvcc lists compute capability 10.7 for Rubin, the architecture after Blackwell, so major version 10 spans two families. The minor version marks “an incremental improvement to the core architecture, possibly including new features”, in the words of the CUDA Programming Guide, which calls Turing “an incremental update based on the Volta architecture”.</p>')}
<h3>Compiling for an SM version</h3>
<p>Target ${T('streaming-multiprocessor', 'SM')} versions for ${T('streaming-assembler', 'SASS')} compilation can be specified when invoking <code>nvcc</code>, the ${T('nvcc', 'NVIDIA CUDA Compiler Driver')}, for example with <code>-arch=sm_90</code>. Compatibility across major versions is explicitly not guaranteed. For more on compatibility across minor versions, see the <a href="https://docs.nvidia.com/cuda/cuda-compiler-driver-nvcc/index.html#gpu-feature-list">documentation</a> for ${T('nvcc', 'nvcc')}; Fig. 3 turns its rules into a table you can poke. The ${T('compute-capability', 'Compute Capability')} entry takes the same rules further, over the same GPUs: its Fig. 2 separates PTX from SASS, and its Fig. 3 follows one build onto one GPU.</p>
<div data-slot="compat" class="wide"></div>
${GG.noteHTML('beyond', '<p><b>The rules, from NVIDIA.</b> Within a major version, SASS (a <em>cubin</em>) runs on GPUs with the same or a higher minor version: “code compiled for the target sm_80 will run on all other CC 8.x GPUs, such as sm_86 or sm_89”, but a cubin for 8.6 “cannot, however, be loaded on GPUs with compute capability 8.0”. Across major versions, no: “a CUDA application that has been compiled for a CC 9.0 GPU will not run on a CC 10.0 GPU (and vice versa)”, because “the instruction set and instruction encodings are different”. The escape hatch is ' + T('parallel-thread-execution', 'PTX') + ': PTX stored in the binary “can be JIT compiled at application runtime for any compute capability equal or higher to the compute capability of the PTX code”. Since compute capability 9.0, targets with an <code>a</code> suffix enable architecture-specific features, and such code “can only be run on the exact compute capability it was compiled for”; since 10.0, an <code>f</code> suffix targets features shared by a family of GPUs. The SASS itself can be inspected with the ' + T('cuda-binary-utilities', 'CUDA Binary Utilities') + '.</p>')}
<div data-slot="nums"></div>
<div data-slot="read"></div>`);
      guard(s.cmp, 'Tesla and Hopper SMs', () => smaCompare(s.cmp, ctx));
      guard(s.ver, 'SM versions', () => smaVersions(s.ver, ctx));
      guard(s.compat, 'Compatibility', () => smaCompat(s.compat, ctx));
      guard(s.nums, 'Key numbers', () => ctx.numbers(s.nums, [
        { value: '6.x', label: 'every one of them Pascal: major version = family', tone: 'memory' },
        { value: '8.9', label: 'Ada, with the same major version as Ampere', tone: 'danger' },
        { value: 'SM90', label: 'Hopper, the H100’s SM: version 9.0', tone: 'core' },
        { value: 'X.y → X.z', label: 'SASS runs on the same major, same or higher minor (z ≥ y)' },
      ]));
      ctx.reading(s.read, [
        { href: 'https://docs.nvidia.com/cuda/ptx-writers-guide-to-interoperability/index.html', label: 'NVIDIA, PTX Writer’s Guide to Interoperability', note: '“SM 5.x is the Maxwell family, SM 6.x is the Pascal family”' },
        { href: 'https://docs.nvidia.com/cuda/cuda-compiler-driver-nvcc/index.html#gpu-feature-list', label: 'NVIDIA CUDA Compiler Driver (nvcc) documentation: GPU feature list', note: 'targets, and compatibility across minor versions' },
        { href: 'https://fabiensanglard.net/cuda', label: 'Fabien Sanglard, “A history of NVidia Stream Multiprocessor”', note: 'source of the Tesla SM figure, and a tour from Tesla to Turing' },
        { href: 'https://modal-cdn.com/gpu-glossary/gtc22-whitepaper-hopper.pdf', label: 'NVIDIA H100 (Hopper) architecture white paper', note: 'source of the SM90 figure' },
        { href: 'https://developer.nvidia.com/cuda-gpus', label: 'NVIDIA, CUDA GPU compute capability', note: 'every current GPU and its compute capability' },
      ]);
    },
  });
})();
