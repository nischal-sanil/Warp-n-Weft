/* chapters/hw-c.js: Device Hardware, part C.
   Entries: texture-processing-cluster, graphics-processing-cluster, register-file, l1-data-cache,
   tensor-memory, gpu-ram. Every CSS class here is prefixed "hwc-". */
(function () {
  'use strict';

  GG.css(`
/* ── shared ── */
.hwc-w { position: relative; min-width: 0; }
.hwc-svg { display: block; width: 100%; height: auto; overflow: visible; touch-action: manipulation; }
.hwc-svg .hwc-hit { cursor: pointer; }
.hwc-svg .hwc-hit:focus { outline: none; }
.hwc-svg .hwc-hit:focus-visible .hwc-ring { stroke: var(--accent) !important; stroke-width: 2 !important; }
.hwc-svg .hwc-fring { display: none; fill: none; stroke: var(--accent); stroke-width: 2; pointer-events: none; }
.hwc-svg .hwc-hit:focus-visible > .hwc-fring { display: inline; }
.hwc-svg .hwc-fade { transition: opacity 0.3s ease; }
.hwc-legend { display: flex; flex-wrap: wrap; gap: 6px 16px; margin-top: 10px; font: 500 11px/1.4 var(--font-mono); color: var(--ink-2); }
.hwc-legend span { display: inline-flex; align-items: center; gap: 7px; }
.hwc-legend i { width: 11px; height: 11px; border-radius: 3px; flex: none; display: inline-block; }
.hwc-ptx { margin-top: 12px; font: 500 12.5px/1.6 var(--font-mono); color: var(--ink); background: #090a10; border: 1px solid var(--line); border-radius: 10px; padding: 8px 12px; white-space: pre-wrap; overflow-wrap: anywhere; }
.hwc-ptx .k { color: #52dba4; } .hwc-ptx .d { color: #ffc65c; } .hwc-ptx .c { color: #6c7290; font-style: italic; } .hwc-ptx .r { color: #7fb0ff; }
.hwc-tag { display: inline-block; font: 600 9.5px/1 var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 5px 2px; border-radius: 4px; border: 1px solid var(--line-2); color: var(--ink-3); vertical-align: 0.15em; white-space: nowrap; }
.hwc-tag.beyond { color: var(--host); border-color: rgba(184, 164, 255, 0.45); }
.entry-body .hwc-wrapcode :not(pre) > code, .entry-body code.hwc-wc { white-space: normal; overflow-wrap: anywhere; }
.hwc-ok { color: var(--core); } .hwc-bad { color: var(--danger); } .hwc-warn { color: var(--control); }
.btn.hwc-preset[aria-pressed="true"] { background: var(--ink); color: var(--bg); border-color: var(--ink); }
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
  const plural = (n, w, p) => (n === 1 ? w : (p || w + 's'));

  /* cb(width) whenever node's content width changes. */
  function onWidth(node, cb) {
    let last = -1;
    const run = (w) => { w = Math.floor(w); if (w > 0 && Math.abs(w - last) >= 1) { last = w; cb(w); } };
    GG.resize(node, (r) => run(r.width));
    requestAnimationFrame(() => run(node.getBoundingClientRect().width));
  }

  /* Run a figure builder; if it throws, keep the prose and show an error box. */
  function guard(parent, label, fn) {
    try { return fn(); } catch (e) {
      console.error('[hw-c] ' + label + ' failed', e);
      if (parent) parent.insertAdjacentHTML('beforeend', `<div class="entry-error">${esc(label)} could not be drawn: ${esc(e && e.message)}</div>`);
      return null;
    }
  }

  const S = (tag, attrs, parent) => GG.svg(tag, attrs, parent);
  /* Shapes: colours go in style so CSS variables always resolve. */
  function R(p, x, y, w, h, st, a) {
    return S('rect', Object.assign({ x: +x.toFixed(2), y: +y.toFixed(2), width: Math.max(0, +w.toFixed(2)), height: Math.max(0, +h.toFixed(2)), style: st || 'fill:none;stroke:var(--line-2)' }, a || {}), p);
  }
  function L(p, x1, y1, x2, y2, st, a) { return S('line', Object.assign({ x1, y1, x2, y2, style: st || 'stroke:var(--line-2)' }, a || {}), p); }
  function P(p, d, st, a) { return S('path', Object.assign({ d, style: st || 'fill:none;stroke:var(--line-2)' }, a || {}), p); }
  function C(p, cx, cy, r, st, a) { return S('circle', Object.assign({ cx, cy, r, style: st || 'fill:var(--ink-3)' }, a || {}), p); }
  function G(p, a) { return S('g', a || {}, p); }
  /* SVG text. o: {fs, fill, anchor, fw, ff:'body'|'mono'|'display', ls, base, op} */
  function Tx(p, x, y, str, o) {
    o = o || {};
    let st = `fill:${o.fill || 'var(--ink-2)'};font-size:${o.fs || 11}px;`;
    if (o.fw) st += `font-weight:${o.fw};`;
    st += 'font-family:' + (o.ff === 'body' ? 'var(--font-body)' : o.ff === 'display' ? 'var(--font-display)' : 'var(--font-mono)') + ';';
    if (o.ls) st += `letter-spacing:${o.ls};`;
    const t = S('text', { x: +(+x).toFixed(2), y: +(+y).toFixed(2), style: st, 'text-anchor': o.anchor || null, 'dominant-baseline': o.base || null, opacity: o.op == null ? null : o.op }, p);
    t.textContent = str;
    return t;
  }
  function svgRoot(parent, w, h, label) {
    return S('svg', { viewBox: `0 0 ${w} ${h}`, width: w, height: h, role: 'img', 'aria-label': label, class: 'hwc-svg' }, parent);
  }
  /* Greedy word wrap by an approximate character width. */
  function wrap(str, maxPx, charPx) {
    const max = Math.max(4, Math.floor(maxPx / charPx));
    const words = String(str).split(' ');
    const lines = [];
    let cur = '';
    for (const w of words) {
      if (!cur) cur = w;
      else if ((cur + ' ' + w).length <= max) cur += ' ' + w;
      else { lines.push(cur); cur = w; }
    }
    if (cur) lines.push(cur);
    return lines;
  }
  function arrowHead(p, x, y, dir, size, color) {
    const s = size || 6;
    const pts = {
      r: `${x},${y} ${x - s},${y - s * 0.6} ${x - s},${y + s * 0.6}`,
      l: `${x},${y} ${x + s},${y - s * 0.6} ${x + s},${y + s * 0.6}`,
      d: `${x},${y} ${x - s * 0.6},${y - s} ${x + s * 0.6},${y - s}`,
      u: `${x},${y} ${x - s * 0.6},${y + s} ${x + s * 0.6},${y + s}`,
    }[dir];
    return S('polygon', { points: pts, style: `fill:${color}` }, p);
  }
  /* Make an SVG group behave like a button (hover, focus, click, Enter/Space).
     Many figures redraw their whole SVG from enter/leave/click. When that replaces the focused group,
     focus moves to the new group with the same label, so keyboard users keep their place. */
  let hitBusy = false; // true while a target's enter/click runs: focus moved by its redraw must not re-run enter
  function hit(g, label, on) {
    g.setAttribute('class', ((g.getAttribute('class') || '') + ' hwc-hit').trim());
    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'button');
    g.setAttribute('aria-label', label);
    const scope = () => g.closest('figure') || (g.ownerSVGElement && g.ownerSVGElement.parentNode);
    // after a redraw, focus the group that replaced this one (without re-running its enter)
    const keepFocus = (root) => {
      if (g.isConnected || !root) return;
      const rep = $$(root, '.hwc-hit').find((n) => n.getAttribute('aria-label') === label);
      if (rep) rep.focus({ preventScroll: true });
    };
    if (on.enter) g.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') on.enter(); });
    if (on.leave) g.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') on.leave(); });
    g.addEventListener('focus', () => {
      if (on.enter && !hitBusy) {
        const root = scope();
        hitBusy = true;
        try { on.enter(); keepFocus(root); } finally { hitBusy = false; }
      }
      if (!g.isConnected) return;
      // groups without a .hwc-ring of their own get a focus outline over their bounding box, fitted to what is drawn now
      const old = g.querySelector(':scope > .hwc-fring');
      if (old) old.remove();
      if (g.querySelector('.hwc-ring')) return;
      let b;
      try { b = g.getBBox(); } catch (err) { return; }
      if (!b.width && !b.height) return;
      R(g, b.x - 2, b.y - 2, b.width + 4, b.height + 4, null, { rx: 3, class: 'hwc-fring' }).removeAttribute('style');
    });
    if (on.leave) g.addEventListener('blur', (e) => {
      // skip when focus is only moving to another target of the same figure (its enter takes over), or when a redraw removed this group
      const to = e.relatedTarget, root = scope();
      if (hitBusy || !g.isConnected || (to && to.classList && to.classList.contains('hwc-hit') && root && root.contains(to))) return;
      on.leave();
    });
    if (on.click) {
      g.addEventListener('click', on.click);
      g.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        const root = scope();
        hitBusy = true;
        try { on.click(e); keepFocus(root); } finally { hitBusy = false; }
      });
    }
  }
  const ROLE = { core: 'var(--core)', special: 'var(--special)', control: 'var(--control)', memory: 'var(--memory)', host: 'var(--host)', danger: 'var(--danger)', accent: 'var(--accent)' };
  const ROLE_A = { core: 'var(--core-a)', special: 'var(--special-a)', control: 'var(--control-a)', memory: 'var(--memory-a)', host: 'var(--host-a)', danger: 'var(--danger-a)' };

  /* ═════════════════════════════ Texture Processing Cluster ═════════════════════════════ */

  GG.css(`
.hwc-map-ctl { display: flex; flex-wrap: wrap; gap: 12px 18px; }
`);

  /* Fig: which level of the programming model maps onto which level of hardware, by era. */
  function tpcMapFigure(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Programming model ↔ hardware, level by level',
      hint: 'switch the era · hover or tap a row',
      caption: `Each row is one level of hardware, from a single ${T('core')} up to the whole GPU, with the level of the ${T('cuda-programming-model', 'CUDA programming model')} that maps onto it. Amber links mean “runs on / is scheduled onto” (${T('thread-hierarchy', 'thread hierarchy')}); blue links mean “lives in” (${T('memory-hierarchy', 'memory hierarchy')}). The GPC row has nothing pointing at it until thread block clusters and distributed shared memory arrive with compute capability 9.0 (Hopper; see ${T('graphics-processing-cluster', 'GPC')}). The TPC row has nothing pointing at it until Blackwell's CTA pair.`,
    });
    const st = { era: 'hopper', view: 'thread', hot: null, pin: null };
    const ERA_LAB = { ampere: 'Ampere · SM80 and earlier', hopper: 'Hopper · SM90', blackwell: 'Blackwell · SM100' };
    const box = el('div', { class: 'hwc-w' });
    f.stage.append(box);

    const HW = [
      { k: 'core', name: 'Core', short: 'Core', sub: 'CUDA Core, Tensor Core …', icon: 'core' },
      { k: 'sm', name: 'Streaming Multiprocessor', short: 'SM', sub: 'SM', icon: 'sm' },
      { k: 'tpc', name: 'Texture Processing Cluster', short: 'TPC', sub: 'TPC · a pair of SMs', icon: 'tpc' },
      { k: 'gpc', name: 'GPU Processing Cluster', short: 'GPC', sub: 'GPC · a group of TPCs', icon: 'gpc' },
      { k: 'gpu', name: 'GPU', short: 'GPU', sub: 'every GPC, plus GPU RAM', icon: 'gpu' },
    ];
    function sw() {
      const bw = st.era === 'blackwell', cl = st.era !== 'ampere';
      if (st.view === 'thread') {
        return {
          core: [{ name: 'Thread', sub: 'runs on a core', nsub: 'on a core' }],
          sm: [{ name: 'Thread block (CTA)', sub: 'scheduled onto one SM', nsub: 'onto one SM' }],
          tpc: bw ? [{ name: 'CTA pair', sub: '.cta_group::2', nsub: '.cta_group::2', fresh: true }] : [],
          gpc: cl ? [{ name: 'Thread block cluster', sub: 'scheduled onto one GPC', nsub: 'onto one GPC' }] : [],
          gpu: [{ name: 'Grid', sub: 'spread across every SM', nsub: 'across all SMs' }],
        };
      }
      return {
        core: [],
        sm: [{ name: 'Registers', sub: 'in the register file' }, { name: 'Shared memory', sub: 'in the L1 data cache' }].concat(bw ? [{ name: 'Tensor Memory', sub: 'tcgen05 instructions only' }] : []),
        tpc: [],
        gpc: cl ? [{ name: 'Distributed shared memory', sub: 'the shared memory of a cluster', nsub: 'of a cluster' }] : [],
        gpu: [{ name: 'Global memory', sub: 'in GPU RAM', nsub: 'in GPU RAM' }],
      };
    }
    const WHY = {
      thread: {
        core: `A ${T('thread')} executes on a ${T('core')}: each of its arithmetic instructions runs on a ${T('cuda-core', 'CUDA Core')}, and its share of a warp's matrix instruction runs on the sub-partition's ${T('tensor-core', 'Tensor Core')}.`,
        sm: `All threads of a ${T('thread-block', 'thread block')} (PTX: ${T('cooperative-thread-array', 'cooperative thread array, CTA')}) are scheduled onto the same ${T('streaming-multiprocessor', 'SM')}, which is why they can share memory and barriers.`,
        tpc: {
          hopper: `<b>Nothing maps here.</b> Before Blackwell, a TPC was a purely physical grouping of two neighbouring SMs: no level of the CUDA or PTX programming model referred to it, so code could not request or target one.`,
          blackwell: `<b>The CTA pair.</b> Blackwell's fifth-generation ${T('tensor-core', 'Tensor Cores')} added a PTX level of two CTAs that run on the two SMs of one TPC. <code>tcgen05</code> instructions with <code>.cta_group::2</code> treat the pair as one unit (Fig. 3).`,
        },
        gpc: {
          ampere: `<b>Nothing maps here before compute capability 9.0.</b> Ampere (A100) and earlier GPUs have no thread block clusters: the blocks of a grid are placed on SMs one by one, with no guarantee that any two of them share a ${T('graphics-processing-cluster', 'GPC')} or run at the same time.`,
          hopper: `A thread block cluster (compute capability 9.0 and up) is a group of blocks that is guaranteed to be scheduled onto SMs of the same ${T('graphics-processing-cluster', 'GPC')}, at the same time.`,
        },
        gpu: `A ${T('thread-block-grid', 'grid')} is every block of one kernel launch, spread across all the SMs of the GPU in no guaranteed order.`,
      },
      memory: {
        core: 'No memory level maps onto a single core. A thread\'s registers live in the register file of its SM, shared by every thread there.',
        sm: {
          hopper: `${T('registers', 'Registers')} live in the SM's ${T('register-file', 'register file')}, and ${T('shared-memory', 'shared memory')} lives in its ${T('l1-data-cache', 'L1 data cache')}. Both belong to that one SM. Ordinarily only the threads of the owning block touch its shared memory; since compute capability 9.0, blocks of the same cluster can also reach it from other SMs (distributed shared memory, the GPC row).`,
          blackwell: `${T('registers', 'Registers')} live in the SM's ${T('register-file', 'register file')} and ${T('shared-memory', 'shared memory')} in its ${T('l1-data-cache', 'L1 data cache')}, as on Hopper. Blackwell adds a third store to each SM, ${T('tensor-memory', 'Tensor Memory')}: 256 KiB that only the ${T('tensor-core', 'Tensor Cores')} and a few <code>tcgen05</code> instructions can use. It too belongs to one SM, not to the TPC.`,
        },
        tpc: {
          hopper: '<b>Nothing maps here.</b> No level of the memory hierarchy belongs to a TPC: the two SMs of a pair keep separate register files and L1 data caches.',
          blackwell: '<b>Still nothing in the memory hierarchy.</b> The glossary describes the CTA pair as a level of the thread hierarchy only. The two SMs keep their own register files, L1 data caches and Tensor Memory.',
        },
        gpc: {
          ampere: '<b>Nothing maps here before compute capability 9.0.</b> Without clusters there is no distributed shared memory: a block can reach only its own shared memory, and data passed between blocks goes through global memory.',
          hopper: 'Distributed shared memory: the blocks of one cluster can read and write each other\'s shared memory, which works because they all sit on SMs of one GPC.',
        },
        gpu: `${T('global-memory', 'Global memory')} lives in ${T('gpu-ram', 'GPU RAM')}, addressable by every SM on the device.`,
      },
    };
    const whyFor = (view, k) => { const w = WHY[view][k]; return typeof w === 'string' ? w : (w[st.era] || w.hopper); };

    function iconAt(p, kind, x, y, w, h, col) {
      const stl = `fill:none;stroke:${col};stroke-width:1`;
      if (kind === 'core') { R(p, x + w / 2 - 5, y + h / 2 - 5, 10, 10, `fill:${col};opacity:.85`, { rx: 2 }); return; }
      const smI = (sx, sy, sw2, sh) => {
        R(p, sx, sy, sw2, sh, stl, { rx: 1.5 });
        R(p, sx + 2, sy + 2, sw2 / 2 - 3, sh / 2 - 3, `fill:${col};opacity:.35`);
        R(p, sx + sw2 / 2 + 1, sy + 2, sw2 / 2 - 3, sh / 2 - 3, `fill:${col};opacity:.35`);
        R(p, sx + 2, sy + sh / 2 + 1, sw2 / 2 - 3, sh / 2 - 3, `fill:${col};opacity:.35`);
        R(p, sx + sw2 / 2 + 1, sy + sh / 2 + 1, sw2 / 2 - 3, sh / 2 - 3, `fill:${col};opacity:.35`);
      };
      if (kind === 'sm') { smI(x + w / 2 - 11, y + h / 2 - 8, 22, 16); return; }
      if (kind === 'tpc') { smI(x + w / 2 - 22, y + h / 2 - 8, 20, 16); smI(x + w / 2 + 2, y + h / 2 - 8, 20, 16); R(p, x + w / 2 - 25, y + h / 2 - 11, 50, 22, `fill:none;stroke:${col};stroke-dasharray:2 2`, { rx: 3 }); return; }
      if (kind === 'gpc') {
        for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
          const cx = x + w / 2 - 21 + c * 14, cy = y + h / 2 - 13 + r * 9;
          R(p, cx, cy, 5.5, 7, `fill:${col};opacity:.4`); R(p, cx + 6.5, cy, 5.5, 7, `fill:${col};opacity:.4`);
        }
        return;
      }
      if (kind === 'gpu') {
        for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) R(p, x + w / 2 - 25 + c * 13, y + h / 2 - 12 + r * 13, 11, 11, `fill:${col};opacity:.4`, { rx: 1 });
      }
    }

    let svg = null;
    function draw(w) {
      box.innerHTML = '';
      const narrow = w < 560;
      const pad = 2;
      const gap = clamp(w * 0.12, 34, 120);
      const colW = (w - pad * 2 - gap) / 2;
      const lx = pad, rx = pad + colW + gap;
      const rowH = narrow ? 74 : 70;
      const top = 30;
      const SW = sw();
      // a row holding several items grows so its items never reach into the next row
      const ihMulti = 38, iGap = 6;
      const rowHs = HW.map((hw) => { const n = SW[hw.k].length; return n > 1 ? Math.max(rowH, n * ihMulti + (n - 1) * iGap + 18) : rowH; });
      const rowY = []; rowHs.reduce((acc, h, i) => { rowY[i] = acc; return acc + h; }, top);
      const H = top + rowHs.reduce((a, b) => a + b, 0) + 4;
      svg = svgRoot(box, w, H, 'Levels of hardware (core, SM, TPC, GPC, GPU) and the level of the CUDA programming model that maps onto each, for the selected era.');
      const isThread = st.view === 'thread';
      const linkCol = isThread ? 'var(--control)' : 'var(--memory)';
      Tx(svg, lx, 14, isThread ? 'THREAD HIERARCHY' : 'MEMORY HIERARCHY', { fs: 10, fill: 'var(--ink-3)', ls: '0.12em' });
      Tx(svg, rx, 14, 'HARDWARE', { fs: 10, fill: 'var(--ink-3)', ls: '0.12em' });
      if (!narrow) Tx(svg, w - pad, 14, ERA_LAB[st.era], { fs: 10, fill: 'var(--ink-3)', anchor: 'end' });
      const active = st.pin || st.hot;
      HW.forEach((hw, i) => {
        const y0 = rowY[i], rH = rowHs[i];
        const g = G(svg, { class: 'hwc-fade' });
        const isOn = !active || active === hw.k;
        g.setAttribute('opacity', isOn ? '1' : '0.28');
        const items = SW[hw.k];
        const bh = 50;
        const by = y0 + (rH - bh) / 2 - 2;
        // hardware box
        const unmapped = items.length === 0;
        const hcol = hw.k === 'tpc' ? (unmapped ? 'var(--ink-3)' : 'var(--core)') : 'var(--core)';
        R(g, rx, by, colW, bh, `fill:${active === hw.k ? 'var(--surface-3)' : 'var(--surface-2)'};stroke:${active === hw.k ? 'var(--ink-2)' : 'var(--line-2)'}`, { rx: 8, class: 'hwc-ring' });
        const iconW = narrow ? 0 : 64;
        if (iconW) iconAt(g, hw.icon, rx + colW - iconW - 4, by, iconW, bh, hw.k === 'tpc' && unmapped ? 'var(--ink-3)' : 'var(--ink-2)');
        Tx(g, rx + 12, by + 21, narrow ? hw.short : hw.name, { fs: narrow ? 13 : 13.5, fill: 'var(--ink)', ff: 'body', fw: 600 });
        const subLines = wrap(narrow ? (hw.k === 'sm' ? 'multiprocessor' : hw.k === 'tpc' ? 'pair of SMs' : hw.k === 'gpc' ? 'group of TPCs' : hw.k === 'core' ? 'CUDA / Tensor' : 'all GPCs + RAM') : hw.sub, colW - 20 - iconW, 6.1);
        subLines.slice(0, 1).forEach((ln) => Tx(g, rx + 12, by + 38, ln, { fs: 10, fill: 'var(--ink-3)' }));
        // software side
        if (unmapped) {
          const gy = by;
          R(g, lx, gy, colW, bh, 'fill:none;stroke:var(--ink-3);stroke-dasharray:4 4', { rx: 8 });
          const loud = hw.k === 'tpc' || hw.k === 'gpc';
          const msg = loud ? 'nothing maps here' : '(no level)';
          // an unmapped level is not an error, so it stays neutral grey (red is kept for illegal states)
          Tx(g, lx + colW / 2, gy + bh / 2 + 4, msg, { fs: narrow ? 10.5 : 11, fill: loud ? 'var(--ink-2)' : 'var(--ink-3)', anchor: 'middle', fw: loud ? 600 : null });
          if (loud) {
            L(g, lx + colW + 6, by + bh / 2, rx - 6, by + bh / 2, 'stroke:var(--ink-3);stroke-width:1.2;stroke-dasharray:3 4;opacity:.7');
            Tx(g, lx + colW + gap / 2, by + bh / 2 - 6, '×', { fs: 14, fill: 'var(--ink-3)', anchor: 'middle', fw: 700 });
          }
        } else {
          const n = items.length;
          const ih = n === 1 ? bh : ihMulti;
          const startY = n === 1 ? by : y0 + (rH - (n * ihMulti + (n - 1) * iGap)) / 2 - 2;
          items.forEach((it, j) => {
            const iy = startY + j * (ih + iGap);
            const fresh = it.fresh;
            // the CTA pair is a thread-hierarchy level like the others (amber), ringed in the accent as the new arrival
            if (fresh) R(g, lx - 3, iy - 3, colW + 6, ih + 6, 'fill:none;stroke:var(--accent);stroke-width:1.2;stroke-dasharray:3 3', { rx: 10 });
            R(g, lx, iy, colW, ih, `fill:${fresh ? 'var(--control-a)' : 'var(--surface-2)'};stroke:${fresh ? 'var(--control)' : (isThread ? 'rgba(255,198,92,.55)' : 'rgba(111,166,255,.55)')}`, { rx: 8 });
            const nameLines = wrap(it.name, colW - 16, narrow ? 6.6 : 7);
            if (n === 1) {
              Tx(g, lx + 12, iy + (nameLines.length > 1 ? 18 : 21), nameLines[0], { fs: 13, fill: 'var(--ink)', ff: 'body', fw: 600 });
              if (nameLines[1]) Tx(g, lx + 12, iy + 33, nameLines.slice(1).join(' '), { fs: 13, fill: 'var(--ink)', ff: 'body', fw: 600 });
              else Tx(g, lx + 12, iy + 38, narrow ? it.nsub : it.sub, { fs: 10, fill: fresh ? 'var(--control)' : 'var(--ink-3)' });
              if (fresh && !narrow) Tx(g, lx + colW - 10, iy + 21, 'NEW', { fs: 9.5, fill: 'var(--accent)', anchor: 'end', ls: '0.12em', fw: 600 });
            } else {
              Tx(g, lx + 10, iy + ih / 2 + 4, it.name, { fs: narrow ? 11.5 : 12.5, fill: 'var(--ink)', ff: 'body', fw: 600 });
            }
            // connector
            const y1 = iy + ih / 2, y2 = by + bh / 2;
            const x1 = lx + colW, x2 = rx;
            const mx = (x1 + x2) / 2;
            P(g, `M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2 - 7} ${y2}`, `fill:none;stroke:${linkCol};stroke-width:${fresh ? 2.2 : 1.6}`);
            arrowHead(g, x2 - 1, y2, 'r', 6, linkCol);
          });
        }
        hit(g, hw.name, {
          enter: () => { st.hot = hw.k; refresh(); },
          leave: () => { st.hot = null; refresh(); },
          click: () => { st.pin = st.pin === hw.k ? null : hw.k; refresh(); },
        });
      });
    }
    let lastW = 0;
    function refresh() {
      const focusK = document.activeElement && svg && svg.contains(document.activeElement) ? document.activeElement.getAttribute('aria-label') : null;
      draw(lastW);
      if (focusK) { const g = $$(svg, '.hwc-hit').find((n) => n.getAttribute('aria-label') === focusK); if (g) g.focus({ preventScroll: true }); }
      const k = st.pin || st.hot;
      const DEF = {
        thread: {
          ampere: '<b>Ampere (SM80) and earlier:</b> a thread maps onto a core, a block onto an SM, the grid onto the whole GPU. Neither the TPC nor the GPC has a level of its own. Switch to Hopper to see clusters arrive at the GPC.',
          hopper: '<b>Hopper (SM90):</b> thread block clusters now map onto the GPC, so every hardware level has a matching level of the thread hierarchy except the TPC. Switch to Blackwell to see the CTA pair arrive.',
          blackwell: '<b>Blackwell (SM100):</b> the CTA pair now maps onto the TPC, so a program can ask the two SMs of one TPC to cooperate on a single Tensor Core operation.',
        },
        memory: {
          ampere: '<b>Ampere (SM80) and earlier, memory view:</b> registers and shared memory belong to the SM, global memory to the whole GPU. A single core, the TPC and the GPC have no memory level of their own.',
          hopper: '<b>Hopper (SM90), memory view:</b> registers and shared memory belong to the SM, distributed shared memory to the GPC, global memory to the whole GPU. Neither a single core nor the TPC has a memory level of its own.',
          blackwell: '<b>Blackwell (SM100), memory view:</b> the same as Hopper, plus Tensor Memory in each SM, which only <code>tcgen05</code> instructions can reach. The CTA pair is a level of the thread hierarchy only, so no memory level is tied to the TPC, and a single core still has none. Switch to the thread hierarchy to see the pair.',
        },
      };
      f.setWhy(k ? whyFor(st.view, k) : DEF[st.view][st.era]);
      // keep focus stable: the redraw replaced nodes, so don't loop on blur/focus
    }
    GG.ui.seg(f.controls, { label: 'Era', options: [{ value: 'ampere', label: 'Ampere and earlier' }, { value: 'hopper', label: 'Hopper' }, { value: 'blackwell', label: 'Blackwell' }], value: st.era, onChange: (v) => { st.era = v; refresh(); } });
    GG.ui.seg(f.controls, { label: 'Show', options: [{ value: 'thread', label: 'Thread hierarchy' }, { value: 'memory', label: 'Memory hierarchy' }], value: st.view, onChange: (v) => { st.view = v; st.pin = null; refresh(); } });
    onWidth(box, (w) => { lastW = w; refresh(); });
    return f;
  }

  /* Fig: where a TPC sits: one GH100 GPC, or the G80 that named it. */
  function tpcDieFigure(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'A TPC on the chip: two neighbouring SMs',
      hint: 'hover or tap a TPC · switch the chip',
      wide: true,
      caption: `Schematic floorplans, not to scale. <b>H100</b>: one GPU Processing Cluster of the GH100 die (8 such GPCs, 9 TPCs each, two SMs per TPC, from NVIDIA's H100 whitepaper); each SM holds its own texture units (four, pink), so the pair shares nothing visible to the programmer. <b>G80</b>: the 2006 chip drawn in ${T('cuda-device-architecture', 'CUDA Device Architecture')}, redrawn after the glossary's figure: eight clusters, each two groups of eight processors (green) that share one block of texture units (pink) and an L1 cache. That shared texture block gave the cluster its name.`,
    });
    const st = { chip: 'h100', sel: 0, hot: null };
    const box = el('div', { class: 'hwc-w' });
    f.stage.append(box);
    const sSM = GG.ui.stat(f.readouts, { label: 'SMs per TPC', value: '2', tone: 'core' });
    const sTex = GG.ui.stat(f.readouts, { label: 'Texture units', value: '—', tone: 'special' });
    const sN = GG.ui.stat(f.readouts, { label: 'TPCs', value: '—', tone: 'core' });
    void sSM;
    let lastW = 0;
    function draw(w) {
      box.innerHTML = '';
      const narrow = w < 600;
      const cur = st.hot != null ? st.hot : st.sel;
      if (st.chip === 'h100') {
        const thumbW = narrow ? 0 : Math.min(190, w * 0.18), tg = narrow ? 0 : 28;
        const gx = thumbW + tg, gw = w - gx - 2;
        const cols = 3, tgap = narrow ? 8 : 14, head = 30;
        const tw = (gw - 16 - tgap * (cols - 1)) / cols;
        const smGap = narrow ? 4 : 6, smW = (tw - 8 - smGap) / 2, smH = narrow ? 50 : 62;
        const th = smH + 30;
        const gh = head + 3 * th + 2 * tgap + 10;
        const H = gh + 4;
        const svg = svgRoot(box, w, H, 'One GPC of a GH100: nine TPCs, each a pair of neighbouring SMs, with the texture units inside each SM.');
        if (thumbW) {
          // locator: the whole die, GPC 0 picked out
          const dw = thumbW, dh = dw * 0.72, dy = 18;
          Tx(svg, 0, 10, 'GH100 DIE', { fs: 10, fill: 'var(--ink-3)', ls: '0.1em' });
          R(svg, 0, dy, dw, dh, 'fill:rgba(18,19,28,.9);stroke:var(--line-2)', { rx: 6 });
          const cw = (dw - 10 - 9) / 4, ch = (dh - 10 - 12) / 2;
          for (let g = 0; g < 8; g++) {
            const x = 5 + (g % 4) * (cw + 3), y = dy + 5 + Math.floor(g / 4) * (ch + 12);
            R(svg, x, y, cw, ch, g === 0 ? 'fill:var(--accent-a);stroke:var(--accent)' : 'fill:rgba(69,212,155,.10);stroke:rgba(69,212,155,.4)', { rx: 2 });
          }
          R(svg, 5, dy + 5 + ch + 3, dw - 10, 6, 'fill:var(--memory-a)', { rx: 1 });
          Tx(svg, 0, dy + dh + 16, 'GPC 0 of 8, enlarged →', { fs: 10, fill: 'var(--accent)' });
          Tx(svg, 0, dy + dh + 30, 'blue band: L2 cache', { fs: 10, fill: 'var(--ink-3)' });
        }
        R(svg, gx, 2, gw, gh, 'fill:rgba(18,19,28,.9);stroke:var(--line-2)', { rx: 8 });
        Tx(svg, gx + 10, 21, narrow ? 'GPC 0 · 9 TPCs · 18 SMs' : 'GPC 0 of a GH100 · 9 TPCs · 18 SMs', { fs: 11.5, fill: 'var(--ink)', fw: 600 });
        for (let t = 0; t < 9; t++) {
          const x = gx + 8 + (t % 3) * (tw + tgap), y = 2 + head + Math.floor(t / 3) * (th + tgap);
          const on = t === cur;
          const g = G(svg, { class: 'hwc-fade' });
          R(g, x, y, tw, th, `fill:${on ? 'rgba(255,138,91,.07)' : 'rgba(255,255,255,.02)'};stroke:${on ? 'var(--accent)' : 'var(--line-2)'};stroke-width:${on ? 1.6 : 1}`, { rx: 6, class: 'hwc-ring' });
          Tx(g, x + 6, y + 14, `TPC ${t}`, { fs: 10.5, fill: on ? 'var(--accent)' : 'var(--ink-2)', fw: 600 });
          for (let k = 0; k < 2; k++) {
            const sx = x + 4 + k * (smW + smGap), sy = y + 22;
            R(g, sx, sy, smW, smH, 'fill:rgba(69,212,155,.12);stroke:rgba(69,212,155,.55)', { rx: 3 });
            Tx(g, sx + smW / 2, sy + 16, `SM ${2 * t + k}`, { fs: 10, fill: 'var(--ink)', anchor: 'middle', fw: 600 });
            // four texture units along the bottom of each SM
            const tu = (smW - 10 - 3 * 2) / 4;
            for (let u = 0; u < 4; u++) R(g, sx + 5 + u * (tu + 2), sy + smH - 12, tu, 7, 'fill:var(--special-a);stroke:rgba(238,116,207,.7)', { rx: 1 });
          }
          if (on && !narrow) {
            const mx = x + 4 + smW + smGap / 2;
            Tx(g, mx, y + 22 + smH * 0.62, '↔', { fs: 12, fill: 'var(--accent)', anchor: 'middle', fw: 700 });
          }
          hit(g, `TPC ${t}: SM ${2 * t} and SM ${2 * t + 1}`, { enter: () => { st.hot = t; refresh(); }, leave: () => { st.hot = null; refresh(); }, click: () => { st.sel = t; st.hot = null; refresh(); } });
        }
      } else {
        const cols = narrow ? 4 : 8, rows = 8 / cols, gap = narrow ? 6 : 10;
        const cw = (w - 4 - gap * (cols - 1)) / cols;
        const sp = (cw - 12 - 4) / 4; // two SMs side by side, each 2 columns of SP squares
        const spH = Math.min(sp, narrow ? 14 : 22);
        const smH = 4 * spH + 3 * 2 + 18;
        const ch = 18 + smH + 6 + 24 + 6 + 14 + 8;
        const H = rows * ch + (rows - 1) * gap + 22;
        const svg = svgRoot(box, w, H, 'The eight texture processing clusters of the G80: each two SMs of eight processors sharing one block of texture units and an L1 cache.');
        Tx(svg, 2, 11, narrow ? 'G80 (2006) · 8 TPCs · 16 SMs' : 'G80 (2006) · 8 TEXTURE PROCESSING CLUSTERS · 16 SMs · 128 PROCESSORS', { fs: 10, fill: 'var(--ink-3)', ls: '0.06em' });
        for (let t = 0; t < 8; t++) {
          const x = 2 + (t % cols) * (cw + gap), y = 20 + Math.floor(t / cols) * (ch + gap);
          const on = t === cur;
          const g = G(svg, { class: 'hwc-fade' });
          R(g, x, y, cw, ch, `fill:${on ? 'rgba(255,138,91,.07)' : 'rgba(255,255,255,.02)'};stroke:${on ? 'var(--accent)' : 'var(--line-2)'};stroke-width:${on ? 1.6 : 1}`, { rx: 6, class: 'hwc-ring' });
          Tx(g, x + 5, y + 13, `TPC ${t}`, { fs: 10, fill: on ? 'var(--accent)' : 'var(--ink-2)', fw: 600 });
          for (let k = 0; k < 2; k++) {
            const sx = x + 4 + k * (2 * sp + 4 + 4), sy = y + 18;
            R(g, sx, sy, 2 * sp + 4, smH, 'fill:rgba(255,255,255,.03);stroke:var(--line-2)', { rx: 3 });
            Tx(g, sx + sp + 2, sy + 12, 'SM', { fs: 10, fill: 'var(--ink-2)', anchor: 'middle' });
            for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) R(g, sx + 2 + c * (sp + 0), sy + 16 + r * (spH + 2), sp - 2, spH, 'fill:rgba(69,212,155,.35);stroke:rgba(69,212,155,.7)', { rx: 1.5 });
          }
          const ty = y + 18 + smH + 6;
          R(g, x + 4, ty, cw - 8, 24, 'fill:var(--special-a);stroke:var(--special)', { rx: 3 });
          Tx(g, x + cw / 2, ty + 16, narrow ? 'tex' : 'texture units', { fs: 10, fill: 'var(--special)', anchor: 'middle' });
          R(g, x + 4, ty + 30, cw - 8, 14, 'fill:var(--memory-a);stroke:rgba(111,166,255,.6)', { rx: 2 });
          Tx(g, x + cw / 2, ty + 41, 'L1', { fs: 10, fill: 'var(--memory)', anchor: 'middle' });
          hit(g, `TPC ${t} of the G80`, { enter: () => { st.hot = t; refresh(); }, leave: () => { st.hot = null; refresh(); }, click: () => { st.sel = t; st.hot = null; refresh(); } });
        }
      }
    }
    function refresh() {
      const keep = document.activeElement && box.contains(document.activeElement) ? document.activeElement.getAttribute('aria-label') : null;
      draw(lastW);
      if (keep) { const g = $$(box, '.hwc-hit').find((n) => n.getAttribute('aria-label') === keep); if (g) g.focus({ preventScroll: true }); }
      const t = st.hot != null ? st.hot : st.sel;
      if (st.chip === 'h100') {
        sTex.set('4 inside each SM');
        sN.set('9 per GPC · 72 per die');
        f.setWhy(`<b>TPC ${t} of GPC 0:</b> SM ${2 * t} and SM ${2 * t + 1}, side by side on the die. That adjacency is all a TPC is: each SM has its own cores, register file, L1 data cache and four texture units. The full GH100 has 8 × 9 = 72 TPCs; an H100 SXM enables 66 of them (132 SMs).`);
      } else {
        sTex.set('shared by the pair');
        sN.set('8 · 16 SMs');
        f.setWhy(`<b>TPC ${t} of the G80:</b> two SMs of eight processors each, 16 in all, and below them one block of texture units (fetch and filter hardware for images) that both SMs share, plus an L1 cache. Eight such clusters give the G80's 128 processors. The shared texture block is why it was called a <i>texture</i> processing cluster.`);
      }
      GG.decorate(f.why);
    }
    GG.ui.seg(f.controls, { label: 'Chip', options: [{ value: 'h100', label: 'H100 (GH100, 2022)' }, { value: 'g80', label: 'G80 (2006)' }], value: st.chip, onChange: (v) => { st.chip = v; st.sel = 0; st.hot = null; refresh(); } });
    onWidth(box, (w) => { lastW = w; refresh(); });
    return f;
  }

  /* Fig: .cta_group::1 vs ::2 for one tcgen05.mma in one TPC. */
  GG.css(`
@keyframes hwc-tcpulse { 0%, 100% { fill: var(--core-a); } 35% { fill: rgba(69, 212, 155, 0.62); } }
.hwc-cta .hwc-tcbar.pulse { animation: hwc-tcpulse 0.9s ease 2; }
.hwc-cta .hwc-bud { transform-box: fill-box; transform-origin: left center; transition: transform 0.55s ease; }
@media (prefers-reduced-motion: reduce) { .hwc-cta .hwc-tcbar.pulse { animation: none; } .hwc-cta .hwc-bud { transition: none; } }
`);
  function ctaGroupFigure(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'One TPC, two ways to run a tcgen05 MMA',
      hint: 'toggle .cta_group',
      wide: true,
      class: 'hwc-cta',
      caption: `A sketch of one Texture Processing Cluster (two SMs) running a single <code>tcgen05.mma</code> instruction. Blue tiles are matrix operands in each SM's ${T('shared-memory', 'shared memory')}; the D tiles live in each SM's ${T('tensor-memory', 'Tensor Memory')}; green bars are the ${T('tensor-core', 'Tensor Cores')}. With <code>::2</code>, the dashed blue routes are each Tensor Core reading the half of B that sits in the partner SM's shared memory; the bar under each SM is how much of B that SM has to hold. The shapes are legal <code>.kind::f16</code> shapes from NVIDIA's PTX ISA: M = 128 rows per SM (256 for the pair), N = 256, and K = 16, which is what one MMA instruction covers for 16-bit inputs; a real kernel issues a run of them along K for each tile it has staged in shared memory. The split of B between the two SMs is how CUTLASS's 2SM kernels use the pair. All of this is context beyond the glossary.`,
    });
    const st = { g: 2, prevG: 2 };
    const box = el('div', { class: 'hwc-w' });
    f.stage.append(box);
    const leg = el('div', { class: 'hwc-legend' });
    f.stage.append(leg);
    const ptx = el('div', { class: 'hwc-ptx', 'aria-label': 'PTX instruction' });
    f.stage.append(ptx);
    const sInstr = GG.ui.stat(f.readouts, { label: 'MMA instructions', value: '—', tone: 'control' });
    const sTile = GG.ui.stat(f.readouts, { label: 'Output tile per MMA', value: '—', tone: 'memory' });
    const sB = GG.ui.stat(f.readouts, { label: 'B bytes per SM, one MMA', value: '—', tone: 'memory' });
    const sSass = GG.ui.stat(f.readouts, { label: 'SASS variant', value: '—', tone: 'core' });
    const M1 = 128, N = 256, K = 16, BYTES = 2; // one .kind::f16 MMA: K = 16 (PTX ISA, tcgen05.mma shapes)
    const B_FULL = N * K * BYTES;

    function draw(w, animate) {
      box.innerHTML = '';
      const narrow = w < 600;
      const two = st.g === 2;
      const pad = 2;
      const gap = narrow ? 22 : 48;
      const tpcPad = narrow ? 8 : 16;
      const smW = (w - pad * 2 - tpcPad * 2 - gap) / 2;
      // a 10 px floor for every label on phones
      const fs = narrow ? 10 : 11, fsS = narrow ? 10 : 10;
      const innerPad = narrow ? 7 : 14;
      const aW = Math.max(18, smW * 0.13);
      const dW = smW - innerPad * 2 - aW - (narrow ? 7 : 14);
      const dH = Math.min(dW * 0.5, narrow ? 84 : 120);
      const bH = Math.max(20, dH * 0.26);
      const top = 26;
      const smTop = top + tpcPad + 4;
      // room above the B row for the two remote-read routes, clear of the SM titles
      const yB = smTop + (narrow ? 74 : 68);
      const yTC = yB + bH + (narrow ? 22 : 26);
      const yD = yTC + (narrow ? 26 : 30);
      const yBud = yD + dH + 30;
      const smH = yBud + 30 - smTop;
      const H = smTop + smH + tpcPad + 10;
      const svg = svgRoot(box, w, H, two
        ? 'Two SMs of one TPC cooperating on a single tcgen05.mma with .cta_group::2: each SM holds half of A, half of B and half of D, and each Tensor Core reads the other half of B from the partner SM.'
        : 'Two SMs of one TPC each running their own tcgen05.mma with .cta_group::1: each SM holds its own A, a full copy of B, and its own D.');
      R(svg, pad, top, w - pad * 2, H - top - 4, `fill:none;stroke:${two ? 'var(--core)' : 'var(--line-2)'};stroke-dasharray:${two ? 'none' : '5 4'}`, { rx: 12 });
      Tx(svg, pad + 12, top - 8, two ? 'TPC · one CTA pair, one MMA' : 'TPC · two independent CTAs', { fs: 10.5, fill: two ? 'var(--core)' : 'var(--ink-3)', ls: '0.08em' });
      const smX = [pad + tpcPad, pad + tpcPad + smW + gap];
      const geo = [];
      for (let s = 0; s < 2; s++) {
        const x0 = smX[s];
        R(svg, x0, smTop, smW, smH, 'fill:rgba(8,9,14,.55);stroke:var(--line-2)', { rx: 10 });
        Tx(svg, x0 + 10, smTop + 17, `SM ${s}` + (narrow ? '' : two ? ` · CTA ${s} of the pair` : ` · CTA ${s}`), { fs: fs + 0.5, fill: 'var(--ink)', fw: 600 });
        if (narrow) Tx(svg, x0 + 10, smTop + 31, two ? `CTA ${s} of the pair` : `CTA ${s}`, { fs: fsS, fill: 'var(--ink-3)' });
        const ax = x0 + innerPad, dx = ax + aW + (narrow ? 7 : 14);
        geo.push({ x0, ax, dx });
        // shared memory region (B; A sits below it, beside D)
        R(svg, x0 + 4, yB - 12, smW - 8, bH + 16, 'fill:none;stroke:rgba(111,166,255,.35);stroke-dasharray:3 3', { rx: 6 });
        // label on the side away from this SM's outgoing remote-read route
        const lblLeft = two && s === 1;
        Tx(svg, lblLeft ? x0 + 8 : x0 + smW - 8, yB - 2, narrow ? 'smem' : 'shared memory', { fs: fsS, fill: 'var(--memory)', anchor: lblLeft ? 'start' : 'end', op: 0.85 });
        if (two) {
          const half = dW / 2;
          for (let hlf = 0; hlf < 2; hlf++) {
            const bx = dx + hlf * half;
            const own = hlf === s;
            if (own) R(svg, bx, yB + 4, half, bH - 4, 'fill:var(--memory-a);stroke:var(--memory)', { rx: 3 });
            else R(svg, bx + 1, yB + 5, half - 2, bH - 6, 'fill:none;stroke:var(--ink-3);stroke-dasharray:3 3', { rx: 3 });
            const lab = own ? (narrow ? `B${s}` : `B${s} ${K}×${N / 2}`) : (narrow ? `in SM ${hlf}` : `B${hlf} is in SM ${hlf}`);
            Tx(svg, bx + half / 2, yB + 4 + bH / 2 + 1, lab, { fs: fsS, fill: own ? 'var(--ink)' : 'var(--ink-3)', anchor: 'middle' });
          }
        } else {
          R(svg, dx, yB + 4, dW, bH - 4, 'fill:var(--memory-a);stroke:var(--memory)', { rx: 3 });
          Tx(svg, dx + dW / 2, yB + 4 + bH / 2 + 1, `B ${K}×${N}` + (narrow ? '' : ' · a full copy'), { fs: fsS, fill: 'var(--ink)', anchor: 'middle' });
        }
        // A tile: M × K, left of D
        R(svg, ax, yD, aW, dH, 'fill:var(--memory-a);stroke:var(--memory)', { rx: 3 });
        const aLab = S('text', { x: ax + aW / 2, y: yD + dH / 2, style: `fill:var(--ink);font-size:${fsS}px;font-family:var(--font-mono)`, 'text-anchor': 'middle', transform: `rotate(-90 ${ax + aW / 2} ${yD + dH / 2})`, 'dominant-baseline': 'middle' }, svg);
        aLab.textContent = narrow ? (two ? `A${s}` : 'A') : two ? `A${s} ${M1}×${K}` : `A ${M1}×${K}`;
        Tx(svg, ax + aW / 2, yD + dH + 14, 'smem', { fs: fsS, fill: 'var(--memory)', anchor: 'middle', op: 0.85 });
        // Tensor Core bar
        const tcb = R(svg, dx, yTC, dW, 15, 'fill:var(--core-a);stroke:var(--core)', { rx: 4, class: 'hwc-tcbar' + (animate && two ? ' pulse' : '') });
        void tcb;
        Tx(svg, dx + dW / 2, yTC + 11, 'Tensor Core', { fs: fsS, fill: 'var(--core)', anchor: 'middle' });
        // D tile in Tensor Memory
        R(svg, dx, yD, dW, dH, 'fill:rgba(111,166,255,.10);stroke:var(--memory);stroke-width:1.4', { rx: 3 });
        for (let r = 1; r < 4; r++) L(svg, dx, yD + (dH * r) / 4, dx + dW, yD + (dH * r) / 4, 'stroke:rgba(111,166,255,.18)');
        Tx(svg, dx + dW / 2, yD + dH / 2 - 2, two ? (narrow ? `D${s} rows ${s * M1}–${s * M1 + M1 - 1}` : `D${s}  rows ${s * M1}–${s * M1 + M1 - 1}`) : `D  ${M1}×${N}`, { fs, fill: 'var(--ink)', anchor: 'middle' });
        Tx(svg, dx + dW / 2, yD + dH / 2 + 14, two ? (narrow ? `of ${2 * M1}×${N}` : `of a ${2 * M1}×${N} tile`) : 'its own tile', { fs: fsS, fill: 'var(--ink-3)', anchor: 'middle' });
        Tx(svg, dx + dW, yD + dH + 14, narrow ? 'TMEM' : 'Tensor Memory', { fs: fsS, fill: 'var(--memory)', anchor: 'end', op: 0.85 });
        // local arrows: own B → TC (both halves' columns are needed), A → TC, TC → D
        const bxs = two ? [dx + dW * (s === 0 ? 0.25 : 0.75)] : [dx + dW * 0.5];
        bxs.forEach((bx) => { L(svg, bx, yB + bH + 2, bx, yTC - 5, 'stroke:var(--memory);stroke-width:1.3'); arrowHead(svg, bx, yTC - 1, 'd', 5, 'var(--memory)'); });
        P(svg, `M${ax + aW / 2} ${yD - 3} L${ax + aW / 2} ${yTC + 7} L${dx - 5} ${yTC + 7}`, 'fill:none;stroke:var(--memory);stroke-width:1.3');
        arrowHead(svg, dx - 1, yTC + 7, 'r', 5, 'var(--memory)');
        L(svg, dx + dW * 0.5, yTC + 16, dx + dW * 0.5, yD - 5, 'stroke:var(--core);stroke-width:1.3');
        arrowHead(svg, dx + dW * 0.5, yD - 1, 'd', 5, 'var(--core)');
        // shared-memory budget for B in this SM: a bar scaled to a full copy (8 KiB)
        const budW = smW - 20, frac = two ? 0.5 : 1, prev = st.prevG === 2 ? 0.5 : 1;
        Tx(svg, x0 + 10, yBud - 6, narrow ? `B held: ${fmt.bytes(B_FULL * frac, 0)}` : `B held in this SM's shared memory: ${fmt.bytes(B_FULL * frac, 0)} of a full ${fmt.bytes(B_FULL, 0)}`, { fs: fsS, fill: 'var(--ink-2)' });
        R(svg, x0 + 10, yBud, budW, 9, 'fill:rgba(255,255,255,.03);stroke:var(--line-2)', { rx: 3 });
        const bar = R(svg, x0 + 10, yBud, budW, 9, 'fill:var(--memory);opacity:.7', { rx: 3, class: 'hwc-bud' });
        bar.style.transform = `scaleX(${animate ? prev : frac})`;
        if (animate) requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.transform = `scaleX(${frac})`; }));
      }
      if (two) {
        // remote reads, each on its own route through the gap between the SMs:
        // B0 (in SM 0) → SM 1's Tensor Core, entering from the left; B1 (in SM 1) → SM 0's Tensor Core, entering from the right
        const g0 = geo[0], g1 = geo[1];
        const gapL = smX[0] + smW, gx1 = gapL + gap * 0.33, gx2 = gapL + gap * 0.67;
        const yA = yB - 17, yBr = yB - 29;
        const a1 = g0.dx + dW * 0.25, a2 = g1.dx + dW * 0.75;
        const remote = 'fill:none;stroke:var(--memory);stroke-width:1.6;stroke-dasharray:5 3';
        const under = 'fill:none;stroke:#0b0c12;stroke-width:5';
        const rr = 7; // corner radius
        const pA = `M${a1} ${yB + 3} L${a1} ${yA + rr} Q${a1} ${yA} ${a1 + rr} ${yA} L${gx1 - rr} ${yA} Q${gx1} ${yA} ${gx1} ${yA + rr} L${gx1} ${yTC + 4 - rr} Q${gx1} ${yTC + 4} ${gx1 + rr} ${yTC + 4} L${g1.dx - 6} ${yTC + 4}`;
        const pB = `M${a2} ${yB + 3} L${a2} ${yBr + rr} Q${a2} ${yBr} ${a2 - rr} ${yBr} L${gx2 + rr} ${yBr} Q${gx2} ${yBr} ${gx2} ${yBr + rr} L${gx2} ${yTC + 11 - rr} Q${gx2} ${yTC + 11} ${gx2 - rr} ${yTC + 11} L${g0.dx + dW + 6} ${yTC + 11}`;
        // B's route is drawn first; A's route passes over it with a dark under-stroke, so the one crossing reads as an overpass
        P(svg, pB, remote);
        arrowHead(svg, g0.dx + dW + 1, yTC + 11, 'l', 6, 'var(--memory)');
        P(svg, pA, under);
        P(svg, pA, remote);
        arrowHead(svg, g1.dx + 1, yTC + 4, 'r', 6, 'var(--memory)');
        if (!narrow) {
          Tx(svg, (a1 + gx1) / 2, yA - 5, 'B0 → SM 1', { fs: 10, fill: 'var(--memory)', anchor: 'middle' });
          Tx(svg, (a2 + gx2) / 2, yBr - 5, 'B1 → SM 0', { fs: 10, fill: 'var(--memory)', anchor: 'middle' });
        }
      }
    }
    function update() {
      const two = st.g === 2;
      leg.innerHTML = '<span><i style="background:var(--memory-a);box-shadow:inset 0 0 0 1px var(--memory)"></i>operand tile</span><span><i style="background:var(--core-a);box-shadow:inset 0 0 0 1px var(--core)"></i>Tensor Core</span>'
        + (two ? '<span><i style="background:none;border-top:2px dashed var(--memory);height:0;width:16px;border-radius:0"></i>a Tensor Core reading the partner SM\'s half of B</span><span><i style="background:none;box-shadow:inset 0 0 0 1px var(--ink-3)"></i>dashed slot: that half lives in the other SM</span>' : '');
      ptx.innerHTML = `<span class="k">tcgen05.mma</span><span class="d">.cta_group::${st.g}</span><span class="d">.kind::f16</span> [<span class="r">d_tmem</span>], <span class="r">a_desc</span>, <span class="r">b_desc</span>, <span class="r">idesc</span>, <span class="r">enable_input_d</span>;  <span class="c">// abridged</span>`;
      sInstr.set(two ? '1 for the pair' : '2 · one per SM');
      sTile.set(two ? `${2 * M1} × ${N}` : `${M1} × ${N}`);
      sB.set(fmt.bytes((two ? N / 2 : N) * K * BYTES, 0));
      sSass.set(two ? 'MMA · 2SM' : 'MMA · 1SM');
      f.setWhy(two
        ? `<b><code>.cta_group::2</code>:</b> the two CTAs of a CTA pair, one on each SM of the TPC, run <b>one</b> MMA that computes a ${2 * M1}×${N} tile; both Tensor Cores work on the same instruction. Each SM keeps its own half of A in its shared memory and its half of the accumulator D in its own Tensor Memory, and holds only half of B (${fmt.bytes(N / 2 * K * BYTES, 0)}), reading the other half from its partner (dashed routes). This compiles to the <b>2SM</b> variant of the SASS <code>MMA</code>.`
        : `<b><code>.cta_group::1</code>:</b> each SM runs its own MMA on its own ${M1}×${N} tile. If the two tiles share the same B, as neighbouring output tiles often do, each SM needs a full copy of it (${fmt.bytes(N * K * BYTES, 0)} each, the full bars). This compiles to the <b>1SM</b> variant of the SASS <code>MMA</code>.`);
    }
    GG.ui.seg(f.controls, { label: '.cta_group', options: [{ value: 1, label: '::1 · one SM' }, { value: 2, label: '::2 · the SM pair' }], value: st.g, onChange: (v) => { st.prevG = st.g; st.g = v; draw(lastW, !GG.reducedMotion); st.prevG = v; update(); } });
    let lastW = 0;
    onWidth(box, (w) => { lastW = w; draw(w, false); });
    update();
    return f;
  }

  GG.entry('texture-processing-cluster', {
    render(body, ctx) {
      const s = ctx.html(body, `
<p>A <strong>Texture Processing Cluster (TPC)</strong> is a pair of adjacent ${T('streaming-multiprocessor', 'Streaming Multiprocessors (SMs)')}. It is one rung in the physical ladder that NVIDIA uses to build a GPU: ${T('core', 'cores')} make up an SM, two SMs make a TPC, several TPCs make a ${T('graphics-processing-cluster', 'GPU Processing Cluster (GPC)')}, and the GPCs make the chip.</p>
<div data-slot="nums"></div>
<p>“Adjacent” is meant literally: the two SMs of a TPC sit next to each other on the die. Fig.&nbsp;1 picks one out, on an H100 and on the G80, the first CUDA GPU, which gave the TPC its name.</p>
<div data-slot="die"></div>
<h3>A rung that the programming model skipped</h3>
<p>The ${T('cuda-programming-model', 'CUDA programming model')} names levels of work and levels of memory, and each one is tied to a piece of hardware. In the ${T('thread-hierarchy', 'thread hierarchy')}, a ${T('thread')} runs on a core and a ${T('thread-block', 'thread block')} is scheduled onto one SM. In the ${T('memory-hierarchy', 'memory hierarchy')}, ${T('registers', 'registers')} live in the SM's ${T('register-file', 'register file')} and ${T('shared-memory', 'shared memory')} in its ${T('l1-data-cache', 'L1 data cache')}.</p>
<p>Before the Blackwell ${T('streaming-multiprocessor-architecture', 'SM architecture')}, TPCs were not mapped onto any level of either hierarchy. A TPC was a fact about the floorplan: no level of the programming model referred to it, so code could not request or target one. Fig.&nbsp;2 shows the gap, and how Blackwell fills it. (Its “Ampere and earlier” setting also shows the GPC unmapped, as it was before thread block clusters.)</p>
<div data-slot="map"></div>
<h3>Blackwell: the CTA pair</h3>
<p>The fifth-generation ${T('tensor-core', 'Tensor Cores')} of the Blackwell SM architecture added the <b>“CTA pair”</b> level to the thread hierarchy of ${T('parallel-thread-execution', 'Parallel Thread eXecution (PTX)')}, and it maps onto TPCs. (CTA, cooperative thread array, is the PTX name for a ${T('thread-block', 'thread block')}; see ${T('cooperative-thread-array', 'Cooperative Thread Array')}.) A CTA pair is two CTAs placed on the two SMs of one TPC, so that they can work as one.</p>
<p>The instructions that drive these Tensor Cores make up PTX's <code>tcgen05</code> family (“tensor core, generation 05”). Many <code>tcgen05</code> ${T('parallel-thread-execution', 'PTX')} instructions include a <code>.cta_group</code> field that says how many SMs take part: a single ${T('streaming-multiprocessor', 'SM')} (<code>.cta_group::1</code>) or the pair of ${T('streaming-multiprocessor', 'SMs')} in a TPC (<code>::2</code>). These are mapped to <code>1SM</code> and <code>2SM</code> variants of ${T('streaming-assembler', 'Streaming Assembler (SASS)')} instructions like <code>MMA</code>, the matrix multiply-accumulate. Flip the toggle in Fig.&nbsp;3 to compare the two.</p>
<div data-slot="cta"></div>
${GG.noteHTML('beyond', `<p><b>Why pair SMs at all?</b> A large matrix multiplication is cut into output tiles, and neighbouring tiles reuse the same input tiles. When two SMs compute two tiles that share a B tile on their own (<code>::1</code>), each SM has to load and store its own copy of B. In a 2SM MMA (<code>::2</code>) the pair computes one tile twice as tall; each SM holds its own half of A and of the accumulator, and only half of B, reading the other half from its partner. That halves the shared memory each SM spends on B and the traffic to fill it. CUTLASS and other Blackwell kernels use this routinely. Typical shapes: an MMA on one SM covers up to 128 rows of the output, and a pair covers up to 256.</p><p>The <code>.cta_group</code> qualifier appears on more than the MMA: Tensor Memory allocation (<code>tcgen05.alloc</code>, <code>tcgen05.dealloc</code>), copies into Tensor Memory (<code>tcgen05.cp</code>) and the completion signal <code>tcgen05.commit</code> take it too, because the pair has to agree on where its operands live. The two CTAs of a pair come from one ${T('graphics-processing-cluster', 'thread block cluster')}.</p>`)}
${GG.noteHTML('history', `<p><b>Why “texture”?</b> The name dates from the first CUDA GPUs. The G80 (2006), the GPU drawn in ${T('cuda-device-architecture', 'CUDA Device Architecture')}, grouped its 128 processors into eight clusters. Each held two SMs of eight processors, plus the texture units (fetch and filter units for image data in graphics) that the two SMs shared: the eight large boxes in that diagram, and the G80 setting of Fig.&nbsp;1. The cluster's make-up then changed. In the GT200 (2008) a TPC held three SMs. With Fermi (2010) the texture units moved inside each SM, and NVIDIA's descriptions of Fermi, Kepler and Maxwell group SMs straight into GPCs, with no TPC level. Pascal's GP100 (2016) brought the name back for a pair of SMs, and so it has stayed: an H100 SM has four texture units of its own (see ${T('streaming-multiprocessor', 'Streaming Multiprocessor')}), and the pair keeps the old name although it no longer shares them.</p>`)}
<div data-slot="read"></div>`);
      guard(s.nums, 'numbers', () => ctx.numbers(s.nums, [
        { value: '2', label: 'SMs per TPC', tone: 'core' },
        { value: '9', label: 'TPCs per GPC on a full GH100 die (H100)', tone: 'core' },
        { value: '72', label: 'TPCs on a full GH100: 8 GPCs × 9', tone: 'core' },
        { value: '66', label: 'TPCs enabled in an H100 SXM: 132 SMs ÷ 2', tone: 'core' },
      ]));
      guard(s.die, 'Fig. 1', () => tpcDieFigure(s.die, ctx));
      guard(s.map, 'Fig. 2', () => tpcMapFigure(s.map, ctx));
      guard(s.cta, 'Fig. 3', () => ctaGroupFigure(s.cta, ctx));
      ctx.reading(s.read, [
        { href: 'https://docs.nvidia.com/cuda/parallel-thread-execution/index.html', label: 'NVIDIA PTX ISA', note: 'the <code>tcgen05</code> instructions and <code>.cta_group</code> (Beyond the glossary)' },
        { href: 'https://modal-cdn.com/gpu-glossary/gtc22-whitepaper-hopper.pdf', label: 'NVIDIA H100 Tensor Core GPU Architecture whitepaper', note: 'GPC, TPC and SM counts for GH100 and H100 SXM5' },
      ]);
    },
  });

  /* ═════════════════════════════ Graphics/GPU Processing Cluster ═════════════════════════════ */

  GG.css(`
.hwc-zoom .hwc-lod { transition: opacity 0.35s ease; }
.hwc-zoom svg { cursor: zoom-in; }
.hwc-zoom .hwc-navrow { display: flex; gap: 6px; align-items: flex-end; }
.hwc-cl .hwc-blk { transition: opacity 0.28s ease, fill 0.2s; }
.hwc-cl .hwc-blk.off { opacity: 0; transition-delay: 0s !important; }
.hwc-queue { display: flex; flex-wrap: wrap; gap: 3px; align-items: center; margin-top: 10px; min-height: 16px; font: 500 11px/1.3 var(--font-mono); color: var(--ink-3); }
.hwc-queue b { color: var(--control); font-weight: 600; margin-right: 6px; }
.hwc-queue i { display: inline-block; height: 10px; border-radius: 2px; background: var(--control-a); box-shadow: inset 0 0 0 1px var(--control); }
`);

  /* GH100 floorplan data: 8 GPCs × 9 TPCs × 2 SMs. Disabled TPCs for the H100 SXM5 view are illustrative. */
  const GH = { gpcs: 8, tpcs: 9, sms: 2 };
  const OFF_TPC = { 2: 8, 3: 8, 4: 8, 5: 8, 6: 8, 7: 8 }; // gpc → fused-off tpc index (illustrative)
  const tpcOn = (g, t, sxm) => !sxm || OFF_TPC[g] !== t;

  function gpcZoomFigure(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'GPU ⊃ GPC ⊃ TPC ⊃ SM',
      hint: 'click to zoom in · or use the controls',
      wide: true,
      class: 'hwc-zoom',
      caption: `The containment hierarchy of a GH100, the chip in the H100: 8 GPCs of 9 TPCs each, each TPC two SMs. The full die has 144 SMs; an H100 SXM enables 132 of them. On graphics GPUs each GPC also has a raster engine; NVIDIA's H100 whitepaper does not mention one, and says only two TPCs of an H100 can run graphics shaders, so the dashed pink strip only marks where a graphics GPU's GPC keeps it. Which 6 TPCs are disabled differs from chip to chip, so the pattern drawn is only an illustration, as are the die's proportions, the L2 cache band and the positions of the six HBM stack sites (GH100 has six; an H100 SXM uses five, which one is unused is not documented). The L2 and HBM are context beyond this entry. The SM interior is simplified: see ${T('streaming-multiprocessor', 'Streaming Multiprocessor')} for the full floorplan.`,
    });
    const st = { level: 0, g: 0, t: 0, s: 0, sxm: true };
    const LEVELS = ['GPU', 'GPC', 'TPC', 'SM'];
    const box = el('div', { class: 'hwc-w' });
    f.stage.append(box);
    const legend = el('div', { class: 'hwc-legend' });
    legend.innerHTML = '<span><i style="background:rgba(255,255,255,.05);box-shadow:inset 0 0 0 1px rgba(220,225,240,.42)"></i>one frame = one TPC (2 SMs)</span><span><i style="background:rgba(69,212,155,.13);box-shadow:inset 0 0 0 1px rgba(69,212,155,.55)"></i>SM</span><span><i style="background:none;box-shadow:inset 0 0 0 1px rgba(238,116,207,.6)"></i>dashed pink: a graphics GPU\'s raster engine</span><span><i style="background:rgba(111,166,255,.16);box-shadow:inset 0 0 0 1px rgba(111,166,255,.55)"></i>L2 cache, HBM stacks (GPU RAM)</span><span><i style="background:repeating-linear-gradient(45deg,rgba(255,255,255,.2) 0 1.4px,transparent 1.4px 4px)"></i>disabled</span>';
    f.stage.append(legend);
    let hoverT = null;
    let geo = null, svg = null, world = null, cur = { k: 1, x: 0, y: 0 }, tween = 0;
    const sLevel = GG.ui.stat(f.readouts, { label: 'Zoom', value: '—' });
    const sIn = GG.ui.stat(f.readouts, { label: 'Inside', value: '—', tone: 'core' });
    const sTot = GG.ui.stat(f.readouts, { label: 'Whole GPU', value: '—', tone: 'core' });

    function layout(w) {
      const narrow = w < 600;
      const cols = narrow ? 2 : 4, rows = narrow ? 4 : 2;
      const pad = 2, gGap = narrow ? 6 : 8, l2H = narrow ? 20 : 24;
      // HBM stack sites down both sides of the die
      const hbmW = narrow ? 14 : 26, hbmGap = narrow ? 4 : 8, ox = pad + hbmW + hbmGap, innerW = w - ox * 2;
      const gpcW = (innerW - gGap * (cols - 1)) / cols;
      // TPCs separated by a clear gap; the two SMs of a TPC almost touch
      const ip = narrow ? 4 : 6, tg = narrow ? 5 : 9, sg = narrow ? 1.2 : 2;
      const tW = (gpcW - ip * 2 - tg * 2) / 3;
      const smW = (tW - sg) / 2, smH = smW * 1.06;
      const headH = narrow ? 13 : 16, rH = narrow ? 7 : 9;
      const gpcH = ip + headH + rH + tg + 3 * smH + 2 * tg + ip;
      const mid = rows / 2;
      const H = pad * 2 + rows * gpcH + (rows - 2) * gGap + 2 * gGap + l2H;
      const gpcs = [];
      for (let g = 0; g < GH.gpcs; g++) {
        const r = Math.floor(g / cols), c = g % cols;
        const x = ox + c * (gpcW + gGap);
        const y = pad + r * (gpcH + gGap) + (r >= mid ? l2H + gGap : 0);
        const tpcs = [];
        for (let t = 0; t < GH.tpcs; t++) {
          const tr = Math.floor(t / 3), tc = t % 3;
          const tx = x + ip + tc * (tW + tg), ty = y + ip + headH + rH + tg + tr * (smH + tg);
          tpcs.push({ x: tx, y: ty, w: tW, h: smH, sms: [{ x: tx, y: ty, w: smW, h: smH }, { x: tx + smW + sg, y: ty, w: smW, h: smH }] });
        }
        gpcs.push({ x, y, w: gpcW, h: gpcH, head: { x: x + ip, y: y + ip, w: gpcW - ip * 2, h: headH }, raster: { x: x + ip, y: y + ip + headH, w: gpcW - ip * 2, h: rH }, tpcs });
      }
      const l2 = { x: ox, y: pad + mid * (gpcH + gGap) - gGap + gGap, w: innerW, h: l2H };
      const hbm = [];
      const sH = (H - pad * 2 - 2 * 6) / 3;
      for (let side = 0; side < 2; side++) for (let k = 0; k < 3; k++) hbm.push({ x: side ? w - pad - hbmW : pad, y: pad + k * (sH + 6), w: hbmW, h: sH, unused: side === 1 && k === 2 });
      // each zoom level gets its own stage height, fitted to the target, so the target fills the stage
      const Hmax = Math.max(H, Math.min(w * 0.6, 560));
      const fit = (rect, m) => Math.min((w * m) / rect.w, (Hmax * m) / rect.h);
      const rects = [null, gpcs[0], gpcs[0].tpcs[0], gpcs[0].tpcs[0].sms[0]];
      const k = [1, fit(rects[1], 0.94), fit(rects[2], 0.9), fit(rects[3], 0.9)];
      const Hv = [H, ...[1, 2, 3].map((i) => Math.min(Hmax, rects[i].h * k[i] + 28))];
      return { w, H, Hv, narrow, gpcs, l2, hbm, k, smW, smH };
    }

    function targetRect() {
      const g = geo.gpcs[st.g];
      if (st.level === 0) return { x: 0, y: 0, w: geo.w, h: geo.H };
      if (st.level === 1) return g;
      if (st.level === 2) return g.tpcs[st.t];
      return g.tpcs[st.t].sms[st.s];
    }
    function targetView() {
      if (st.level === 0) return { k: 1, x: 0, y: 0, h: geo.H };
      const r = targetRect();
      const k = geo.k[st.level], h = geo.Hv[st.level];
      return { k, x: geo.w / 2 - (r.x + r.w / 2) * k, y: h / 2 - (r.y + r.h / 2) * k, h };
    }
    let viewEls = [];
    const setT = (v) => {
      world.setAttribute('transform', `translate(${v.x.toFixed(2)} ${v.y.toFixed(2)}) scale(${v.k.toFixed(4)})`);
      const h = v.h.toFixed(1);
      svg.setAttribute('viewBox', `0 0 ${geo.w} ${h}`); svg.setAttribute('height', h);
      viewEls.forEach((n) => n.setAttribute('height', h));
    };

    function build(w) {
      hoverT = null;
      geo = layout(w);
      box.innerHTML = '';
      svg = svgRoot(box, w, geo.H, 'Zoomable floorplan of a GH100 GPU: 8 GPU Processing Clusters of 9 Texture Processing Clusters (2 Streaming Multiprocessors each), with the L2 cache between them and HBM stacks beside the die; a dashed strip marks where a graphics GPU’s GPC keeps its raster engine.');
      svg.setAttribute('style', 'overflow:hidden');
      const clipId = GG.uid('hwc-clip');
      const defs = S('defs', null, svg);
      const cp = S('clipPath', { id: clipId }, defs);
      R(cp, 0, 0, w, geo.H, 'fill:#fff');
      const patId = GG.uid('hwc-hatch');
      const pat = S('pattern', { id: patId, width: 4, height: 4, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
      L(pat, 0, 0, 0, 4, 'stroke:rgba(255,255,255,.16);stroke-width:1.4');
      const clip = G(svg, { 'clip-path': `url(#${clipId})` });
      viewEls = [cp.firstChild, R(clip, 0, 0, w, geo.H, 'fill:rgba(8,9,14,.35)')];
      world = G(clip);
      const k = geo.k;
      const ns = 'vector-effect:non-scaling-stroke;';
      // L2 band
      R(world, geo.l2.x, geo.l2.y, geo.l2.w, geo.l2.h, `fill:var(--memory-a);stroke:rgba(111,166,255,.45);${ns}`, { rx: 3, class: 'hwc-ctx' });
      Tx(world, geo.l2.x + geo.l2.w / 2, geo.l2.y + geo.l2.h / 2 + 4, 'L2 cache · shared by every GPC', { fs: geo.narrow ? 10 : 11, fill: 'var(--memory)', anchor: 'middle', cls: 'hwc-lod' }).setAttribute('class', 'hwc-lod hwc-l0');
      // HBM stacks (GPU RAM) beside the die
      geo.hbm.forEach((hb) => {
        const unused = hb.unused && st.sxm;
        R(world, hb.x, hb.y, hb.w, hb.h, unused ? `fill:none;stroke:rgba(111,166,255,.35);stroke-dasharray:3 3;${ns}` : `fill:rgba(111,166,255,.16);stroke:rgba(111,166,255,.55);${ns}`, { rx: 3, class: 'hwc-ctx' });
        const cx = hb.x + hb.w / 2, cy = hb.y + hb.h / 2;
        const t = S('text', { x: cx, y: cy, style: `fill:${unused ? 'var(--ink-3)' : 'var(--memory)'};font-size:10px;font-family:var(--font-mono)`, 'text-anchor': 'middle', 'dominant-baseline': 'middle', transform: `rotate(-90 ${cx} ${cy})`, class: 'hwc-lod hwc-l0' }, world);
        t.textContent = unused ? (geo.narrow ? 'unused' : 'HBM · unused') : (geo.narrow ? 'HBM3' : 'HBM3 · GPU RAM');
      });
      geo.gpcs.forEach((g, gi) => {
        const gg = G(world, { 'data-g': gi });
        R(gg, g.x, g.y, g.w, g.h, `fill:rgba(18,19,28,.92);stroke:var(--line-2);${ns}`, { rx: 6 / 1, 'data-g': gi, class: 'hwc-gpcbox hwc-ctx' });
        // header + raster engine
        const lab0 = Tx(gg, g.head.x + 2, g.head.y + g.head.h * 0.72, `GPC ${gi}`, { fs: geo.narrow ? 10.5 : 11.5, fill: 'var(--ink)', fw: 600 });
        lab0.setAttribute('class', 'hwc-lod hwc-l0');
        const nOn = Array.from({ length: GH.tpcs }, (_, t) => tpcOn(gi, t, st.sxm)).filter(Boolean).length;
        const lab0b = Tx(gg, g.head.x + g.head.w - 2, g.head.y + g.head.h * 0.72, `${nOn * 2} SMs`, { fs: geo.narrow ? 10 : 10.5, fill: 'var(--ink-3)', anchor: 'end' });
        lab0b.setAttribute('class', 'hwc-lod hwc-l0');
        const f1 = 11 / k[1];
        const lab1 = Tx(gg, g.head.x + 2, g.head.y + g.head.h * 0.75, `GPC ${gi} · ${nOn} TPCs · ${nOn * 2} SMs`, { fs: f1, fill: 'var(--ink)', fw: 600 });
        lab1.setAttribute('class', 'hwc-lod hwc-l1');
        // where a graphics GPU's GPC has its raster engine: dashed, because the H100 whitepaper documents none
        R(gg, g.raster.x, g.raster.y, g.raster.w, g.raster.h, `fill:rgba(238,116,207,.05);stroke:rgba(238,116,207,.5);stroke-dasharray:3 2;${ns}`, { rx: 1.5, 'data-g': gi, class: 'hwc-ctx' });
        const lr = Tx(gg, g.raster.x + g.raster.w / 2, g.raster.y + g.raster.h * 0.78, 'raster engine (graphics GPUs)', { fs: g.raster.h * 0.72, fill: 'var(--special)', anchor: 'middle', op: 0.85 });
        lr.setAttribute('class', 'hwc-lod hwc-l1 hwc-l2');
        g.tpcs.forEach((tp, ti) => {
          const on = tpcOn(gi, ti, st.sxm);
          const tg = G(gg, { 'data-g': gi, 'data-t': ti });
          R(tg, tp.x - 1.6, tp.y - 1.6, tp.w + 3.2, tp.h + 3.2, `fill:${on ? 'rgba(255,255,255,.05)' : 'none'};stroke:${on ? 'rgba(220,225,240,.42)' : 'rgba(255,255,255,.14)'};stroke-width:1;${ns}`, { rx: 2.5, class: 'hwc-tpcframe', 'data-frame': gi + ':' + ti });
          tp.sms.forEach((sm, si) => {
            const sgp = G(tg, { 'data-g': gi, 'data-t': ti, 'data-s': si });
            R(sgp, sm.x, sm.y, sm.w, sm.h, on ? `fill:rgba(69,212,155,.13);stroke:rgba(69,212,155,.55);${ns}` : `fill:url(#${patId});stroke:rgba(255,255,255,.14);${ns}`, { rx: 1.2, 'data-g': gi, 'data-t': ti, 'data-s': si });
            if (on) {
              // simplified SM interior: L1I strip, 2×2 sub-partitions (regfile + cores + tensor core), TMA, L1D strip
              const ix = sm.x + sm.w * 0.08, iw = sm.w * 0.84;
              const y1 = sm.y + sm.h * 0.07;
              R(sgp, ix, y1, iw, sm.h * 0.06, 'fill:rgba(111,166,255,.45)', { 'pointer-events': 'none' });
              const qy = y1 + sm.h * 0.09, qh = sm.h * 0.27, qw = iw / 2 - sm.w * 0.02;
              for (let q = 0; q < 4; q++) {
                const qx = ix + (q % 2) * (qw + sm.w * 0.04), qyy = qy + Math.floor(q / 2) * (qh + sm.h * 0.03);
                R(sgp, qx, qyy, qw, qh, 'fill:rgba(8,9,14,.55)', { 'pointer-events': 'none' });
                R(sgp, qx + qw * 0.06, qyy + qh * 0.06, qw * 0.88, qh * 0.12, 'fill:rgba(255,198,92,.55)', { 'pointer-events': 'none' });
                R(sgp, qx + qw * 0.06, qyy + qh * 0.22, qw * 0.88, qh * 0.14, 'fill:rgba(111,166,255,.55)', { 'pointer-events': 'none' });
                R(sgp, qx + qw * 0.06, qyy + qh * 0.42, qw * 0.6, qh * 0.5, 'fill:rgba(69,212,155,.35)', { 'pointer-events': 'none' });
                R(sgp, qx + qw * 0.7, qyy + qh * 0.42, qw * 0.24, qh * 0.5, 'fill:rgba(69,212,155,.7)', { 'pointer-events': 'none' });
              }
              const ty = qy + 2 * qh + sm.h * 0.06;
              R(sgp, ix, ty, iw, sm.h * 0.06, 'fill:rgba(238,116,207,.45)', { 'pointer-events': 'none' });
              R(sgp, ix, ty + sm.h * 0.09, iw, sm.h * 0.12, 'fill:rgba(111,166,255,.5)', { 'pointer-events': 'none' });
            }
          });
          const lt = Tx(tg, tp.x + tp.w / 2, tp.y + tp.h / 2 + (10.5 / k[1]) * 0.35, on ? `TPC ${ti}` : `TPC ${ti} · off`, { fs: 10.5 / k[1], fill: on ? 'var(--ink)' : 'var(--ink-3)', anchor: 'middle', fw: 600 });
          lt.setAttribute('class', 'hwc-lod hwc-l1');
          lt.setAttribute('pointer-events', 'none');
          if (on) {
            const halo = R(tg, tp.x + tp.w / 2 - (10.5 / k[1]) * 2.6, tp.y + tp.h / 2 - (10.5 / k[1]) * 0.75, (10.5 / k[1]) * 5.2, (10.5 / k[1]) * 1.4, 'fill:rgba(11,12,18,.78)', { rx: 2 / k[1], class: 'hwc-lod hwc-l1', 'pointer-events': 'none' });
            tg.insertBefore(halo, lt);
          }
        });
      });
      // SM-level labels (for the target SM only): drawn into an overlay group on demand
      world.append(G(null, {}));
      const overlay = G(world, { class: 'hwc-lod hwc-l2 hwc-l3' });
      overlay.setAttribute('pointer-events', 'none');
      world._overlay = overlay;
      svg.addEventListener('click', onClick);
      // at the whole-GPU level, pointing at a TPC outlines it and names it
      svg.addEventListener('pointerover', (e) => {
        if (st.level !== 0) return;
        const n = e.target.closest && e.target.closest('[data-t]');
        const key = n ? n.getAttribute('data-g') + ':' + n.getAttribute('data-t') : null;
        if (key === hoverT) return;
        setHover(key);
      });
      svg.addEventListener('pointerleave', () => { if (hoverT) setHover(null); });
      setT(targetView());
      cur = targetView();
      paint(true);
    }

    function setHover(key) {
      if (hoverT) { const o = svg.querySelector(`[data-frame="${hoverT}"]`); if (o && o._st) o.setAttribute('style', o._st); }
      hoverT = key;
      if (!key) { paint(true, true); return; }
      const fr = svg.querySelector(`[data-frame="${key}"]`);
      if (fr) { fr._st = fr.getAttribute('style'); fr.setAttribute('style', fr._st + 'stroke:var(--accent);stroke-width:2;'); }
      const [g, t] = key.split(':').map(Number);
      const on = tpcOn(g, t, st.sxm);
      f.setWhy(on
        ? `<b>GPC ${g}, TPC ${t}:</b> one Texture Processing Cluster, the pair of neighbouring SMs inside the outlined frame (SMs ${2 * t} and ${2 * t + 1} of this GPC). Click to zoom into GPC ${g}.`
        : `<b>GPC ${g}, TPC ${t}</b> is disabled in this H100 SXM illustration: both of its SMs are fused off. Click to zoom into GPC ${g}.`);
    }

    const iwq = (sm) => sm.w * 0.84 / 2 - sm.w * 0.02;
    function drawOverlay() {
      const ov = world._overlay;
      ov.innerHTML = '';
      if (st.level < 2) return;
      const tp = geo.gpcs[st.g].tpcs[st.t];
      const k = geo.k[st.level];
      const fs = 10 / k;
      if (!tpcOn(st.g, st.t, st.sxm)) {
        // an empty state that says what it is: the fused-off TPC, labelled on the stage itself
        const r = st.level === 2 ? tp : tp.sms[st.s];
        const lab = (x, y, str, f2, col) => { const t = Tx(ov, x, y, str, { fs: f2, fill: col, anchor: 'middle', fw: 600 }); t.setAttribute('style', t.getAttribute('style') + `paint-order:stroke;stroke:rgba(8,9,14,.9);stroke-width:${4 / k}px;`); };
        lab(r.x + r.w / 2, r.y + r.h / 2 - fs * 0.4, st.level === 2 ? `TPC ${st.t} · fused off` : `SM ${st.s} · fused off`, fs * 1.25, 'var(--ink)');
        lab(r.x + r.w / 2, r.y + r.h / 2 + fs * 1.1, 'disabled in this H100 SXM (illustrative)', fs, 'var(--ink-2)');
        lab(r.x + r.w / 2, r.y + r.h / 2 + fs * 2.4, 'the Move buttons step to a working one', fs, 'var(--ink-3)');
        return;
      }
      const list = st.level === 2 ? tp.sms : [tp.sms[st.s]];
      list.forEach((sm) => {
        const long = sm.w * k > 290;
        const qw = iwq(sm);
        const si = tp.sms.indexOf(sm);
        const nm = Tx(ov, sm.x + sm.w * 0.08, sm.y + sm.h * 0.052, `SM ${si}` + (long ? ` · TPC ${st.t} · GPC ${st.g}` : ''), { fs, fill: 'var(--ink)', fw: 700 });
        void nm;
        const ix = sm.x + sm.w * 0.08, iw = sm.w * 0.84, y1 = sm.y + sm.h * 0.07;
        const qy = y1 + sm.h * 0.09, qh = sm.h * 0.27;
        const halo = (x, y, str, col) => {
          const t = Tx(ov, x, y, str, { fs, fill: col || 'var(--ink)', anchor: 'middle', fw: 600 });
          t.setAttribute('style', t.getAttribute('style') + `paint-order:stroke;stroke:rgba(8,9,14,.85);stroke-width:${3 / k}px;`);
        };
        halo(sm.x + sm.w / 2, y1 + sm.h * 0.03 + fs * 0.35, long ? 'L1 instruction cache' : 'L1 I-cache', 'var(--memory)');
        halo(sm.x + sm.w / 2, qy + qh + sm.h * 0.025, '4 sub-partitions', 'var(--ink)');
        if (long) { halo(ix + qw * 0.36, qy + qh * 0.7, 'cores', 'var(--core)'); halo(ix + qw * 0.82, qy + qh * 0.7, 'TC', 'var(--core)'); halo(ix + qw * 0.5, qy + qh * 0.17, 'scheduler', 'var(--control)'); halo(ix + qw * 0.5, qy + qh * 0.33, 'registers', 'var(--memory)'); }
        const ty = qy + 2 * qh + sm.h * 0.06;
        halo(sm.x + sm.w / 2, ty + sm.h * 0.03 + fs * 0.35, long ? 'Tensor Memory Accelerator' : 'TMA', 'var(--special)');
        halo(sm.x + sm.w / 2, ty + sm.h * 0.15 + fs * 0.35, long ? 'L1 data cache / shared memory' : 'L1 data cache', 'var(--memory)');
      });
    }

    function paint(instant, whyOnly) {
      if (whyOnly) { writeWhy(); return; }
      // LOD: show labels of the current level
      $$(svg, '.hwc-lod').forEach((n) => {
        const c = n.getAttribute('class');
        const show = c.includes('hwc-l' + st.level);
        n.setAttribute('opacity', show ? '1' : '0');
      });
      // dim non-target GPCs/TPCs/SMs
      $$(svg, '[data-g]').forEach((n) => {
        if (n.tagName !== 'g') return;
        const g = +n.getAttribute('data-g');
        const hasT = n.hasAttribute('data-t'), hasS = n.hasAttribute('data-s');
        let op = 1;
        // past the GPC level, siblings fade out entirely so no clipped fragments of them show at the edges
        if (!hasT && st.level >= 1 && g !== st.g) op = st.level === 1 ? 0.35 : 0;
        if (hasT && !hasS && st.level >= 2 && g === st.g && +n.getAttribute('data-t') !== st.t) op = st.level === 2 ? 0.12 : 0;
        if (hasS && st.level >= 3 && g === st.g && +n.getAttribute('data-t') === st.t && +n.getAttribute('data-s') !== st.s) op = 0.12;
        n.setAttribute('opacity', op);
        n.style.pointerEvents = op === 0 ? 'none' : '';
      });
      $$(svg, '.hwc-ctx').forEach((n) => n.setAttribute('opacity', st.level >= 2 ? 0 : 1));
      drawOverlay();
      const to = targetView();
      cancelAnimationFrame(tween);
      if (instant || GG.reducedMotion) { cur = to; setT(cur); }
      else {
        const from = Object.assign({}, cur);
        const t0 = performance.now(), D = 650;
        const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
        // interpolate in log-scale for k so zooms feel even
        const step = (now) => {
          const p = Math.min(1, (now - t0) / D), e = ease(p);
          const kk = Math.exp(Math.log(from.k) + (Math.log(to.k) - Math.log(from.k)) * e);
          // keep the target centre moving smoothly: interpolate the world point at the viewport centre
          const cx0 = (geo.w / 2 - from.x) / from.k, cy0 = (from.h / 2 - from.y) / from.k;
          const cx1 = (geo.w / 2 - to.x) / to.k, cy1 = (to.h / 2 - to.y) / to.k;
          const cx = cx0 + (cx1 - cx0) * e, cy = cy0 + (cy1 - cy0) * e;
          const hh = from.h + (to.h - from.h) * e;
          cur = { k: kk, x: geo.w / 2 - cx * kk, y: hh / 2 - cy * kk, h: hh };
          setT(cur);
          if (p < 1) tween = requestAnimationFrame(step);
        };
        tween = requestAnimationFrame(step);
      }
      writeWhy();
    }
    function writeWhy() {
      // readouts and why
      const nOnG = (g) => Array.from({ length: GH.tpcs }, (_, t) => tpcOn(g, t, st.sxm)).filter(Boolean).length;
      const totT = Array.from({ length: GH.gpcs }, (_, g) => nOnG(g)).reduce((a, b) => a + b, 0);
      sLevel.set(st.level === 0 ? 'whole GPU' : st.level === 1 ? `GPC ${st.g}` : st.level === 2 ? `TPC ${st.t} · GPC ${st.g}` : `SM ${st.s} · TPC ${st.t}`);
      sTot.set(`${GH.gpcs} GPCs · ${totT} TPCs · ${totT * 2} SMs`);
      const on = tpcOn(st.g, st.t, st.sxm);
      if (st.level === 0) {
        sIn.set(`${GH.gpcs} × ${GH.tpcs} × ${GH.sms}`);
        f.setWhy(st.sxm
          ? `<b>The whole chip.</b> A GH100 is built from 8 GPCs × 9 TPCs × 2 SMs = 144 SMs; each framed pair of SMs is one TPC. In an <b>H100 SXM</b>, 6 TPCs (12 SMs) are disabled, leaving <b>132</b>. All of the GPCs share the L2 cache in the middle and the ${T('gpu-ram', 'GPU RAM')} in the HBM stacks at the sides. Point at a TPC, or click a GPC to zoom in.`
          : `<b>The full GH100 die:</b> 8 GPCs × 9 TPCs × 2 SMs = <b>144</b> SMs, every one enabled, and six HBM stack sites. No shipping H100 enables all of them. Point at a TPC, or click a GPC to zoom in.`);
      } else if (st.level === 1) {
        const n = nOnG(st.g);
        sIn.set(`${n} TPCs · ${n * 2} SMs`);
        f.setWhy(`<b>GPC ${st.g}:</b> ${n} working TPCs, ${n * 2} SMs${n < 9 ? ' (one TPC is disabled here)' : ''}. On a graphics GPU a GPC also has a raster engine (the dashed pink strip marks its place); on an H100 only two TPCs of the whole chip can run graphics at all. The blocks of a thread block cluster are all scheduled onto SMs of one GPC like this one. Click a TPC.`);
      } else if (st.level === 2) {
        sIn.set(on ? '2 SMs' : 'disabled');
        f.setWhy(on
          ? `<b>TPC ${st.t} of GPC ${st.g}:</b> two adjacent SMs. Before Blackwell no level of the programming model maps onto this pair; on Blackwell the CTA pair does (see ${T('texture-processing-cluster', 'Texture Processing Cluster')}). Click an SM.`
          : `<b>TPC ${st.t} of GPC ${st.g} is disabled</b> in this H100 SXM illustration: both of its SMs are fused off. Pick another TPC, or switch to the full die.`);
      } else {
        sIn.set(on ? '4 sub-partitions' : 'disabled');
        f.setWhy(on
          ? `<b>One SM</b>, the unit a ${T('thread-block', 'thread block')} is scheduled onto: L1 instruction cache, four sub-partitions (each with its own warp scheduler, register file, CUDA Cores and Tensor Core), the TMA, and the 256 KiB ${T('l1-data-cache', 'L1 data cache')}.`
          : `<b>This SM is disabled</b> in the H100 SXM illustration.`);
      }
      GG.decorate(f.why);
      prevB.disabled = st.level === 0;
      nextB.disabled = st.level === 0;
      outB.disabled = st.level === 0;
      seg.set(st.level, false);
    }

    function onClick(e) {
      if (hoverT) setHover(null);
      const n = e.target.closest && e.target.closest('[data-g]');
      if (!n) { if (st.level > 0) { st.level--; paint(); } return; }
      const g = +n.getAttribute('data-g');
      const t = n.hasAttribute('data-t') ? +n.getAttribute('data-t') : null;
      const s = n.hasAttribute('data-s') ? +n.getAttribute('data-s') : null;
      if (st.level === 0 || g !== st.g) { st.level = 1; st.g = g; st.t = t == null ? 0 : t; st.s = 0; }
      else if (st.level === 1) { if (t != null) { st.level = 2; st.t = t; st.s = s == null ? 0 : s; } }
      else if (st.level === 2) { if (t != null && t !== st.t) { st.t = t; } else if (s != null) { st.level = 3; st.s = s; } }
      else { if (t != null) st.t = t; if (s != null) st.s = s; }
      paint();
    }
    function stepTarget(d) {
      if (st.level === 1) st.g = (st.g + d + GH.gpcs) % GH.gpcs;
      else if (st.level === 2) st.t = (st.t + d + GH.tpcs) % GH.tpcs;
      else if (st.level === 3) { let i = st.t * 2 + st.s + d; i = (i + GH.tpcs * 2) % (GH.tpcs * 2); st.t = Math.floor(i / 2); st.s = i % 2; }
      paint();
    }
    const seg = GG.ui.seg(f.controls, { label: 'Zoom level', options: LEVELS.map((n, i) => ({ value: i, label: n })), value: 0, onChange: (v) => { st.level = v; paint(); } });
    const nav = el('div', { class: 'ctl' }, el('span', { class: 'ctl-lab', text: 'Move' }));
    const navRow = el('div', { class: 'hwc-navrow' });
    nav.append(navRow);
    f.controls.append(nav);
    const prevB = GG.ui.button(navRow, { icon: 'prev', ariaLabel: 'Previous', onClick: () => stepTarget(-1) });
    const nextB = GG.ui.button(navRow, { icon: 'next', ariaLabel: 'Next', onClick: () => stepTarget(1) });
    const outB = GG.ui.button(navRow, { label: 'Zoom out', onClick: () => { if (st.level > 0) { st.level--; paint(); } } });
    GG.ui.seg(f.controls, { label: 'Chip', options: [{ value: true, label: 'H100 SXM · 132 SMs' }, { value: false, label: 'Full GH100 · 144' }], value: st.sxm, onChange: (v) => { st.sxm = v; build(geo.w); } });
    onWidth(box, (w) => build(w));
    return f;
  }

  /* Fig: what a raster engine does: which pixel centres a triangle covers. */
  function rasterFigure(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'What a raster engine does',
      hint: 'drag a corner · or focus it and use the arrow keys',
      wide: true,
      caption: `A screen of 16 × 10 pixels and one triangle. Rasterization marks every pixel whose centre (the dots) lies inside the triangle, by testing the centre against the triangle's three edges; each marked pixel then gets a run of the pixel shader. A raster engine does this in fixed-function hardware, for millions of pixels per frame. This is a simplified, illustrative version (real hardware works on tiles of pixels and has exact rules for pixels on an edge), beyond the glossary. A CUDA ${T('kernel')} never passes through this unit.`,
    });
    const COLS = 16, ROWS = 10;
    const st = { v: [[2.2, 8.6], [13.6, 6.6], [6.4, 1.1]], drag: -1 };
    const box = el('div', { class: 'hwc-w' });
    f.stage.append(box);
    const sN = GG.ui.stat(f.readouts, { label: 'Pixels covered', value: '—', tone: 'special' });
    const sT = GG.ui.stat(f.readouts, { label: 'Edge tests', value: '—', tone: 'special' });
    const sA = GG.ui.stat(f.readouts, { label: 'Triangle area', value: '—' });
    let svg = null, cell = 20, pix = [], tri = null, dots = [], lastW = 0;
    const edge = (a, b, p) => (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
    function covered(px, py) {
      const [A, B, C2] = st.v, P2 = [px, py];
      const e0 = edge(A, B, P2), e1 = edge(B, C2, P2), e2 = edge(C2, A, P2);
      return (e0 >= 0 && e1 >= 0 && e2 >= 0) || (e0 <= 0 && e1 <= 0 && e2 <= 0);
    }
    function build(w) {
      box.innerHTML = '';
      cell = Math.min(40, (w - 4) / COLS);
      const W = cell * COLS, H = cell * ROWS;
      const ox = (w - W) / 2;
      svg = svgRoot(box, w, H + 4, 'A grid of pixels with a triangle; the pixels whose centres the triangle covers are lit.');
      const g = G(svg, { transform: `translate(${ox.toFixed(1)} 2)` });
      pix = [];
      for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) {
        const r = R(g, i * cell + 0.5, j * cell + 0.5, cell - 1, cell - 1, 'fill:rgba(255,255,255,.025);stroke:rgba(255,255,255,.06)', { rx: 2 });
        const c = C(g, (i + 0.5) * cell, (j + 0.5) * cell, 1.6, 'fill:var(--ink-3)');
        pix.push({ i, j, r, c });
      }
      tri = S('polygon', { style: 'fill:rgba(238,116,207,.06);stroke:var(--ink);stroke-width:1.6;stroke-linejoin:round' }, g);
      dots = st.v.map((_, k) => {
        const hg = G(g, { class: 'hwc-hit', tabindex: '0', role: 'slider', 'aria-label': `Triangle corner ${k + 1}`, 'data-keys': '' });
        C(hg, 0, 0, 16, 'fill:transparent');
        C(hg, 0, 0, 11, 'fill:none;stroke:none', { class: 'hwc-ring' });
        C(hg, 0, 0, 7, 'fill:var(--accent);stroke:var(--bg);stroke-width:2');
        hg.style.touchAction = 'none';
        hg.addEventListener('pointerdown', (e) => { st.drag = k; try { hg.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } e.preventDefault(); });
        hg.addEventListener('pointermove', (e) => {
          if (st.drag !== k) return;
          const m = g.getScreenCTM();
          if (!m) return;
          const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
          const q = pt.matrixTransform(m.inverse());
          st.v[k] = [clamp(q.x / cell, 0, COLS), clamp(q.y / cell, 0, ROWS)];
          update();
        });
        const end = () => { st.drag = -1; };
        hg.addEventListener('pointerup', end); hg.addEventListener('pointercancel', end);
        hg.addEventListener('keydown', (e) => {
          const d = { ArrowLeft: [-0.25, 0], ArrowRight: [0.25, 0], ArrowUp: [0, -0.25], ArrowDown: [0, 0.25] }[e.key];
          if (!d) return;
          e.preventDefault();
          st.v[k] = [clamp(st.v[k][0] + d[0], 0, COLS), clamp(st.v[k][1] + d[1], 0, ROWS)];
          update();
        });
        return hg;
      });
      update();
    }
    function update() {
      if (!svg) return;
      let n = 0;
      pix.forEach((p) => {
        const on = covered(p.i + 0.5, p.j + 0.5);
        if (on) n++;
        p.r.setAttribute('style', on ? 'fill:rgba(238,116,207,.45);stroke:var(--special)' : 'fill:rgba(255,255,255,.025);stroke:rgba(255,255,255,.06)');
        p.c.setAttribute('style', on ? 'fill:#fff' : 'fill:var(--ink-3)');
      });
      tri.setAttribute('points', st.v.map((q) => `${(q[0] * cell).toFixed(1)},${(q[1] * cell).toFixed(1)}`).join(' '));
      dots.forEach((d, k) => { d.setAttribute('transform', `translate(${(st.v[k][0] * cell).toFixed(1)} ${(st.v[k][1] * cell).toFixed(1)})`); d.setAttribute('aria-valuetext', `x ${fmt.fixed(st.v[k][0], 2)}, y ${fmt.fixed(st.v[k][1], 2)} pixels`); });
      const [A, B, C2] = st.v;
      const area = Math.abs(edge(A, B, C2)) / 2;
      sN.set(`${n} of ${COLS * ROWS}`);
      sT.set(`${3 * COLS * ROWS} (3 per pixel)`);
      sA.set(`${fmt.fixed(area, 1)} pixels`);
      f.setWhy(n
        ? `<b>${n} pixels</b> have their centre inside the triangle, so ${n} copies of the pixel shader will run to colour them. The triangle covers ${fmt.fixed(area, 1)} pixels' worth of area; a pixel counts only if its centre is inside. Finding those pixels is the raster engine's job, done in fixed-function hardware before any shader runs.`
        : '<b>No pixel centre is inside the triangle</b>, so nothing is drawn: it is too thin or too small to cover a single centre. Drag a corner to open it up.');
    }
    GG.ui.button(f.controls, { label: 'Reset triangle', icon: 'reset', onClick: () => { st.v = [[2.2, 8.6], [13.6, 6.6], [6.4, 1.1]]; update(); } });
    GG.ui.button(f.controls, { label: 'A thin sliver', onClick: () => { st.v = [[1.2, 8.8], [14.6, 1.4], [14.9, 1.9]]; update(); } });
    onWidth(box, (w) => { if (Math.abs(w - lastW) >= 1) { lastW = w; build(w); } });
    return f;
  }

  /* Fig: launching thread block clusters onto the GPCs. */
  function clusterFigure(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Launch a grid of thread block clusters',
      hint: 'pick a cluster size · tap a cluster',
      wide: true,
      class: 'hwc-cl',
      caption: `Top: each square is one SM of an H100 SXM, grouped by GPC (same illustrative layout as Fig. 1: two GPCs with 18 SMs, six with 16; crossed-out squares are disabled SMs). Green squares are SMs running a block; each cluster is one amber outline (amber for scheduling: the cluster is the unit that is placed and launched), its blocks separated by thin dividers and labelled with the cluster's number on its first block; red-hatched squares are working SMs with nothing to run. The simulation assumes each thread block needs a whole SM to itself, as large Tensor Core kernels often do, and places each cluster into the GPC with the most free SMs. The hardware's real placement policy is not documented, so treat the exact layout as an illustration; the constraint (one cluster, one GPC, all at once) is the real thing. Bottom: the selected cluster's blocks and the SM-to-SM network their distributed shared memory travels over, against the long way through global memory. Clusters of 16 need an opt-in on H100 (“non-portable” cluster sizes); 8 is the portable maximum. The grid must be a multiple of the cluster size (CUDA C++ Programming Guide), so the slider moves in whole clusters.`,
    });
    const st = { c: 8, blocks: 264, sel: null };
    const box = el('div', { class: 'hwc-w' });
    f.stage.append(box);
    const queue = el('div', { class: 'hwc-queue', 'aria-live': 'polite' });
    f.stage.append(queue);
    const panel = el('div', { class: 'hwc-w', style: 'margin-top:12px' });
    f.stage.append(panel);
    const sRes = GG.ui.stat(f.readouts, { label: 'Clusters running', value: '—', tone: 'control' });
    const sBl = GG.ui.stat(f.readouts, { label: 'Blocks running', value: '—', tone: 'core' });
    const sIdle = GG.ui.stat(f.readouts, { label: 'Idle SMs', value: '—', tone: 'danger' });
    const sWait = GG.ui.stat(f.readouts, { label: 'Clusters waiting', value: '—', tone: 'control' });
    const NSM = 132, MAXB = 528;
    let placed = [], cells = [], lastW = 0, replay = false;
    const stepFor = (c) => Math.max(8, c);

    function gpcSMs(g) { const out = []; for (let t = 0; t < GH.tpcs; t++) if (tpcOn(g, t, true)) out.push(t * 2, t * 2 + 1); return out; }
    function place() {
      const nCl = Math.floor(st.blocks / st.c);
      const free = Array.from({ length: GH.gpcs }, (_, g) => gpcSMs(g).slice());
      placed = [];
      for (let k = 0; k < nCl; k++) {
        // the GPC with the most free SMs that can still take a whole cluster (an illustrative policy)
        let g = -1;
        free.forEach((arr, i) => { if (arr.length >= st.c && (g < 0 || arr.length > free[g].length)) g = i; });
        if (g < 0) break;
        placed.push({ id: k, g, sms: free[g].splice(0, st.c) });
      }
      const perG = Array.from({ length: GH.gpcs }, (_, g) => Math.floor(gpcSMs(g).length / st.c));
      return { nCl, running: placed.length, waiting: nCl - placed.length, perG, fit: perG.reduce((a, b) => a + b, 0) };
    }
    function draw(w) {
      box.innerHTML = '';
      const narrow = w < 600;
      const cols = narrow ? 2 : 4;
      const gap = narrow ? 8 : 12;
      const gW = (w - gap * (cols - 1)) / cols;
      const per = 6; // SM cells per row inside a GPC (3 TPC pairs)
      const cg = narrow ? 3 : 4, tg = narrow ? 2 : 4;
      const cell = Math.min((gW - 16 - cg * (per - 1) - tg * 2) / per, 30);
      const head = 20;
      const gH = head + 3 * cell + 2 * cg + 12;
      const rows = Math.ceil(GH.gpcs / cols);
      const H = rows * gH + (rows - 1) * gap + 2;
      const svg = svgRoot(box, w, H, `The 132 SMs of an H100 SXM in 8 GPCs, with thread block clusters of ${st.c} placed onto them.`);
      const defs = S('defs', null, svg);
      const hatchId = GG.uid('hwc-idle');
      const pat = S('pattern', { id: hatchId, width: 5, height: 5, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
      L(pat, 0, 0, 0, 5, 'stroke:var(--danger);stroke-width:1.6;opacity:.55');
      cells = [];
      const owner = {};
      placed.forEach((p) => p.sms.forEach((sIdx) => { owner[p.g + ':' + sIdx] = p; }));
      const idxOf = (col, row) => (row * 3 + Math.floor(col / 2)) * 2 + (col % 2);
      for (let g = 0; g < GH.gpcs; g++) {
        const x0 = (g % cols) * (gW + gap), y0 = Math.floor(g / cols) * (gH + gap) + 1;
        R(svg, x0, y0, gW, gH, 'fill:rgba(18,19,28,.9);stroke:var(--line-2)', { rx: 8 });
        const nSM = gpcSMs(g).length;
        const used = placed.filter((p) => p.g === g).length * st.c;
        Tx(svg, x0 + 8, y0 + 14, `GPC ${g}`, { fs: 10.5, fill: 'var(--ink)', fw: 600 });
        Tx(svg, x0 + gW - 8, y0 + 14, `${used}/${nSM} SMs busy`, { fs: 10, fill: used === nSM ? 'var(--core)' : 'var(--ink-3)', anchor: 'end' });
        const innerW = per * cell + (per - 1) * cg + tg * 2;
        const ox = x0 + (gW - innerW) / 2;
        const cx = (col) => ox + col * (cell + cg) + Math.floor(col / 2) * tg;
        const cy = (row) => y0 + head + row * (cell + cg);
        const gapR = (col) => cg + (col % 2 === 1 ? tg : 0); // gap to the right of a column
        const groups = {};
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < per; col++) {
            const idx = idxOf(col, row), t = Math.floor(idx / 2);
            const x = cx(col), y = cy(row);
            if (!tpcOn(g, t, true)) {
              R(svg, x, y, cell, cell, 'fill:none;stroke:rgba(255,255,255,.12);stroke-dasharray:2 2', { rx: 2 });
              L(svg, x + cell * 0.28, y + cell * 0.28, x + cell * 0.72, y + cell * 0.72, 'stroke:var(--ink-3);opacity:.6');
              L(svg, x + cell * 0.72, y + cell * 0.28, x + cell * 0.28, y + cell * 0.72, 'stroke:var(--ink-3);opacity:.6');
              continue;
            }
            const p = owner[g + ':' + idx];
            if (!p) { R(svg, x, y, cell, cell, `fill:url(#${hatchId});stroke:rgba(255,91,110,.45)`, { rx: 2 }); continue; }
            const isSel = st.sel === p.id;
            const dim = st.sel != null && !isSel;
            if (!groups[p.id]) {
              const hg = G(svg, { class: 'hwc-blk' + (replay ? ' off' : '') });
              hg.style.transitionDelay = replay ? '0s' : (p.id * 0.03).toFixed(2) + 's';
              cells.push({ el: hg, p });
              hit(hg, `Cluster ${p.id}: ${st.c} ${plural(st.c, 'block')} on GPC ${p.g}`, { click: () => { st.sel = st.sel === p.id ? null : p.id; refresh(false); } });
              groups[p.id] = hg;
            }
            const hg = groups[p.id];
            // one shape per cluster: each cell reaches halfway into the gap towards a neighbour of the same cluster
            const same = (c2, r2) => c2 >= 0 && c2 < per && r2 >= 0 && r2 < 3 && owner[g + ':' + idxOf(c2, r2)] === p;
            const eL = same(col - 1, row) ? gapR(col - 1) / 2 : 0, eR = same(col + 1, row) ? gapR(col) / 2 : 0;
            const eT = same(col, row - 1) ? cg / 2 : 0, eB = same(col, row + 1) ? cg / 2 : 0;
            const bx0 = x - eL, by0 = y - eT, bx1 = x + cell + eR, by1 = y + cell + eB;
            R(hg, bx0, by0, bx1 - bx0, by1 - by0, `fill:rgba(69,212,155,${dim ? 0.08 : isSel ? 0.62 : p.id % 2 ? 0.2 : 0.34});stroke:none`);
            // thin dividers between the blocks of one cluster, so its blocks (one per SM) can be counted
            const dv = `stroke:rgba(11,12,18,${dim ? 0.35 : 0.8});stroke-width:1.2`;
            if (eR) L(hg, bx1, y + 1, bx1, y + cell - 1, dv);
            if (eB) L(hg, x + 1, by1, x + cell - 1, by1, dv);
            const ln = `stroke:var(--control);stroke-width:${isSel ? 2 : 1.2};opacity:${dim ? 0.3 : 1}`;
            if (!eL) L(hg, bx0, by0, bx0, by1, ln);
            if (!eR) L(hg, bx1, by0, bx1, by1, ln);
            if (!eT) L(hg, bx0, by0, bx1, by0, ln);
            if (!eB) L(hg, bx0, by1, bx1, by1, ln);
            if (idx === p.sms[0]) {
              const lab = 'C' + p.id, fsz = 10;
              if (lab.length * fsz * 0.62 <= cell - 2) Tx(hg, x + cell / 2, y + cell / 2 + fsz * 0.36, lab, { fs: fsz, fill: 'var(--ink)', anchor: 'middle', fw: 700, op: dim ? 0.35 : 1 }).setAttribute('pointer-events', 'none');
            }
          }
        }
      }
      if (replay) requestAnimationFrame(() => requestAnimationFrame(() => { cells.forEach((c) => { c.el.style.transitionDelay = (c.p.id * 0.035).toFixed(3) + 's'; c.el.classList.remove('off'); }); }));
      replay = false;
    }

    /* The distributed shared memory panel: the blocks of one cluster, the SM-to-SM network, and the long way round. */
    const pk = { route: [], len: 0, pair: 0, dot: null, path: null, lab: null, n: 0, nm: [] };
    function drawPanel(w) {
      panel.innerHTML = '';
      const p = placed.find((q) => q.id === st.sel) || placed[0];
      pk.route = []; pk.dot = null;
      if (!p) return;
      const narrow = w < 600;
      const n = st.c;
      const perRow = Math.min(n, narrow ? 8 : 16), rows = Math.ceil(n / perRow);
      const gap = narrow ? 5 : 8;
      const bw = Math.min(narrow ? 40 : 66, (w - 24 - (perRow - 1) * gap) / perRow), bh = narrow ? 44 : 50;
      const rowW = perRow * bw + (perRow - 1) * gap;
      const x0 = Math.max(12, (w - rowW) / 2);
      const top = 22, busGap = 18;
      const rowY = (r) => top + busGap + r * (bh + busGap + 6);
      const busY = (r) => rowY(r) - busGap / 2 - 2;
      const ramY = rowY(rows - 1) + bh + 30;
      const H = ramY + 28;
      const svg = svgRoot(panel, w, H, `Cluster ${p.id}: its ${n} ${plural(n, 'block')} on SMs of GPC ${p.g}, sharing their shared memory over the SM-to-SM network.`);
      R(svg, 0.5, 0.5, w - 1, H - 1, 'fill:rgba(8,9,14,.45);stroke:var(--line-2)', { rx: 10 });
      Tx(svg, 12, 15, `Cluster ${p.id} · ${n} ${plural(n, 'block')} on GPC ${p.g}${st.sel == null && !narrow ? ' (tap a cluster above to pick another)' : ''}`, { fs: 10.5, fill: 'var(--control)', fw: 600 });
      const boxes = [];
      for (let i = 0; i < n; i++) {
        const r = Math.floor(i / perRow), c = i % perRow;
        const x = x0 + c * (bw + gap), y = rowY(r);
        boxes.push({ x, y, r });
        R(svg, x, y, bw, bh, 'fill:var(--core-a);stroke:var(--control)', { rx: 4 });
        Tx(svg, x + bw / 2, y + 13, narrow ? `b${i}` : `block ${i}`, { fs: 10, fill: 'var(--ink)', anchor: 'middle', fw: 600 });
        R(svg, x + 3, y + bh - 19, bw - 6, 15, 'fill:var(--memory-a);stroke:var(--memory)', { rx: 2 });
        Tx(svg, x + bw / 2, y + bh - 8, 'smem', { fs: 10, fill: 'var(--memory)', anchor: 'middle' });
      }
      pk.n = n;
      if (n < 2) {
        Tx(svg, w / 2, rowY(0) + bh + 22, 'A cluster of 1 has no partner: distributed shared memory needs 2 or more blocks.', { fs: 10.5, fill: 'var(--ink-2)', anchor: 'middle' });
        return;
      }
      // the SM-to-SM network: a bus over each row, joined at the left
      const left = x0 - 8;
      for (let r = 0; r < rows; r++) {
        const inRow = boxes.filter((b) => b.r === r);
        const right = inRow[inRow.length - 1].x + bw / 2;
        L(svg, left, busY(r), right, busY(r), 'stroke:var(--ink-3);stroke-width:1.4');
        inRow.forEach((b) => L(svg, b.x + bw / 2, busY(r), b.x + bw / 2, b.y, 'stroke:var(--ink-3);stroke-width:1'));
      }
      if (rows > 1) L(svg, left, busY(0), left, busY(rows - 1), 'stroke:var(--ink-3);stroke-width:1.4');
      Tx(svg, w - 12, 15, narrow ? 'SM-to-SM network' : `SM-to-SM network inside GPC ${p.g}`, { fs: 10, fill: 'var(--ink-2)', anchor: 'end' });
      // the long way: through the L2 and global memory in GPU RAM
      R(svg, 12, ramY, w - 24, 16, 'fill:rgba(111,166,255,.08);stroke:rgba(111,166,255,.45);stroke-dasharray:4 3', { rx: 3 });
      Tx(svg, w / 2, ramY + 12, narrow ? 'L2 · global memory: the long way' : 'without a cluster: through the L2 cache and global memory in GPU RAM, the long way', { fs: 10, fill: 'var(--ink-3)', anchor: 'middle' });
      const lr = (rows - 1) * perRow, b0 = boxes[lr], b1 = boxes[lr + 1] || boxes[lr - 1];
      P(svg, `M${b0.x + bw * 0.3} ${b0.y + bh} L${b0.x + bw * 0.3} ${ramY} M${b1.x + bw * 0.7} ${ramY} L${b1.x + bw * 0.7} ${b1.y + bh}`, 'fill:none;stroke:var(--ink-3);stroke-dasharray:2 3;opacity:.7');
      // the live route and its packet
      pk.path = P(svg, '', 'fill:none;stroke:var(--memory);stroke-width:2.4;opacity:.9');
      pk.dot = C(svg, 0, 0, 4.5, 'fill:#fff');
      pk.boxes = boxes; pk.bw = bw; pk.bh = bh; pk.busY = busY; pk.left = left;
      setPair(pk.pair % n);
    }
    function setPair(i) {
      const n = pk.n;
      pk.pair = i;
      const a = pk.boxes[i], b = pk.boxes[(i + 1) % n];
      const ax = a.x + pk.bw / 2, bx = b.x + pk.bw / 2;
      const pts = [[ax, a.y], [ax, pk.busY(a.r)]];
      if (a.r !== b.r) { pts.push([pk.left, pk.busY(a.r)], [pk.left, pk.busY(b.r)]); }
      pts.push([bx, pk.busY(b.r)], [bx, b.y]);
      pk.route = pts;
      pk.len = 0;
      for (let k = 1; k < pts.length; k++) pk.len += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
      pk.path.setAttribute('d', 'M' + pts.map((q) => q.map((v) => v.toFixed(1)).join(' ')).join(' L'));
      putDot(0.5);
    }
    function putDot(u) {
      if (!pk.dot || !pk.route.length) return;
      let d = u * pk.len;
      for (let k = 1; k < pk.route.length; k++) {
        const [x1, y1] = pk.route[k - 1], [x2, y2] = pk.route[k];
        const sl = Math.hypot(x2 - x1, y2 - y1);
        if (d <= sl || k === pk.route.length - 1) { const t = sl ? Math.min(1, d / sl) : 0; pk.dot.setAttribute('cx', (x1 + (x2 - x1) * t).toFixed(1)); pk.dot.setAttribute('cy', (y1 + (y2 - y1) * t).toFixed(1)); return; }
        d -= sl;
      }
    }
    let lastPair = -1;
    const anim = GG.anim(panel, (t) => {
      if (!pk.dot || pk.n < 2) return;
      const per = 1.1, k = Math.floor(t / per), u = (t % per) / per;
      const i = k % pk.n;
      if (i !== lastPair) { lastPair = i; setPair(i); }
      putDot(u);
    });
    function refresh(re) {
      const r = place();
      if (st.sel != null && !placed.some((p) => p.id === st.sel)) st.sel = null;
      replay = !!re && !GG.reducedMotion;
      draw(lastW);
      lastPair = -1;
      drawPanel(lastW);
      const busy = r.running * st.c;
      const idle = NSM - busy;
      sRes.set(`${r.running} of ${r.nCl}`);
      sBl.set(`${busy}`);
      sIdle.set(`${idle}`, idle ? 'danger' : 'core');
      sWait.set(`${r.waiting}`, r.waiting ? 'control' : null);
      const nq = Math.min(r.waiting, 60);
      queue.innerHTML = r.waiting
        ? `<b>queue</b>${Array.from({ length: nq }, () => `<i style="width:${Math.min(4 + st.c * 1.2, 24)}px"></i>`).join('')}${r.waiting > nq ? ` +${r.waiting - nq}` : ''}<span style="margin-left:8px">${r.waiting} ${plural(r.waiting, 'cluster')} of ${st.c} wait for a GPC with ${st.c} free SMs</span>`
        : '<span>No clusters waiting: the whole grid is running.</span>';
      const sel = st.sel != null ? placed.find((p) => p.id === st.sel) : null;
      const tapHint = st.c > 1 ? ' Tap a cluster to see its distributed shared memory below.' : '';
      const f18 = Math.floor(18 / st.c), f16 = Math.floor(16 / st.c);
      const fitPhrase = f18 === f16 ? `every GPC holds ${f16} ${plural(f16, 'cluster')} of ${st.c}` : `GPCs with 18 SMs hold ${f18} clusters of ${st.c} and GPCs with 16 hold ${f16}`;
      const packIdle = NSM - r.fit * st.c;
      let msg;
      if (sel) {
        msg = `<b>Cluster ${sel.id}</b>: ${st.c} ${plural(st.c, 'block')} running together on SMs of <b>GPC ${sel.g}</b>. They can synchronize with a cluster-wide barrier and read and write each other's ${T('shared-memory', 'shared memory')} directly, over the SM-to-SM network inside the GPC (the panel below: the white packet is one block reading its neighbour's shared memory). That pooled shared memory is <b>distributed shared memory</b>, up to ${st.c} × 227 KiB here (227 KiB is the most one block may use). Blocks in other clusters cannot reach it; they would have to go through ${T('global-memory', 'global memory')}.`;
      } else if (r.waiting > 0) {
        msg = st.c === 1
          ? `With clusters of 1, every block is on its own, as before compute capability 9.0: all <b>${NSM}</b> SMs are busy and the other ${r.waiting} blocks wait for the next free SM.`
          : `Each cluster of <b>${st.c}</b> must fit entirely inside one GPC, all at once. ${fitPhrase[0].toUpperCase() + fitPhrase.slice(1)}, so at most ${r.fit} run together. ${packIdle ? `<b>${packIdle} SMs sit idle</b> while ${r.waiting} ${plural(r.waiting, 'cluster')} ${r.waiting === 1 ? 'waits' : 'wait'}: no GPC has ${st.c} free SMs left.` : `Every SM is busy; the other ${r.waiting} ${plural(r.waiting, 'cluster')} ${r.waiting === 1 ? 'waits' : 'wait'} for a GPC to free up.`}`;
      } else if (idle > 0) {
        msg = st.c === 1
          ? `With clusters of 1, every block is on its own, as before compute capability 9.0. All ${r.nCl} blocks run at once, and <b>${idle} SMs have nothing to do</b>: the grid is smaller than the GPU.`
          : `The whole grid fits: all ${r.running} ${plural(r.running, 'cluster')} of ${st.c} run at once. <b>${idle} SMs have nothing to do</b> because the grid has only ${r.nCl * st.c} blocks, not because of packing.${packIdle ? ` (With a bigger grid, packing would still leave ${packIdle} idle: ${fitPhrase}.)` : ''}`;
      } else {
        msg = 'Every SM is busy and the whole grid is running.';
      }
      f.setWhy(msg + (sel ? '' : tapHint));
      GG.decorate(f.why);
    }
    GG.ui.seg(f.controls, { label: 'Blocks per cluster', options: [1, 2, 4, 8, 16].map((v) => ({ value: v, label: v === 16 ? '16*' : String(v), title: v === 16 ? 'non-portable size: needs an opt-in attribute on H100' : null })), value: st.c, onChange: (v) => {
      st.c = v; st.sel = null;
      // the grid must be a whole number of clusters: the slider moves in whole clusters (and in 8s, to keep its range manageable)
      const step = stepFor(v);
      sl.input.min = String(step); sl.input.step = String(step);
      st.blocks = clamp(Math.round(st.blocks / step) * step, step, MAXB);
      sl.set(st.blocks);
      refresh(true);
    } });
    const sl = GG.ui.slider(f.controls, { label: 'Blocks in the grid', min: 8, max: MAXB, step: 8, value: st.blocks, format: (v) => `${v} blocks`, onInput: (v) => { st.blocks = clamp(Math.round(v / stepFor(st.c)) * stepFor(st.c), stepFor(st.c), MAXB); refresh(false); } });
    GG.ui.button(f.controls, { label: 'Replay launch', icon: 'play', onClick: () => { st.sel = null; refresh(true); } });
    GG.ui.playButton(f.controls, anim);
    onWidth(box, (w) => { lastW = w; refresh(false); });
    return f;
  }

  const CLUSTER_CODE = `#include <cooperative_groups.h>
namespace cg = cooperative_groups;

// every cluster of this kernel holds 2 thread blocks
__global__ void __cluster_dims__(2, 1, 1) swap_halves(int *out) {
    __shared__ int smem[256];                     // launched with 256 threads per block
    cg::cluster_group cluster = cg::this_cluster();
    unsigned int rank = cluster.block_rank();     // 0 or 1 within the cluster

    smem[threadIdx.x] = rank;                     // write my own shared memory
    cluster.sync();                               // both blocks have written

    int *peer = cluster.map_shared_rank(smem, rank ^ 1);   // the other block's smem
    out[blockIdx.x * blockDim.x + threadIdx.x] = peer[threadIdx.x];
    cluster.sync();                               // keep smem alive until the peer is done
}`;

  GG.entry('graphics-processing-cluster', {
    render(body, ctx) {
      const s = ctx.html(body, `
<p>A <strong>GPC</strong> is a collection of ${T('texture-processing-cluster', 'Texture Processing Clusters (TPCs)')}, themselves groups of ${T('streaming-multiprocessor', 'Streaming Multiprocessors')} or SMs, plus a <b>raster engine</b>. It is the largest building block inside the chip: an H100's GH100 die is eight GPCs side by side, sharing an L2 cache and the ${T('gpu-ram', 'GPU RAM')}. Zoom through the levels in Fig.&nbsp;1.</p>
<div data-slot="zoom"></div>
<h3>Graphics, or GPU?</h3>
${GG.noteHTML('quote', '<p>“Apparently, some people use NVIDIA GPUs for graphics, for which the raster engine is important.”</p>')}
<p>The glossary, written for people who run neural networks on data center GPUs, is joking: graphics is what GPUs were invented for. A <b>raster engine</b> is fixed-function hardware for drawing. It takes the triangles a 3D scene is made of and works out which pixels of the screen each one covers (rasterization), so that shader programs can colour those pixels. Compute work, like a ${T('kernel')} launched through CUDA, does not use it. Drag the triangle in Fig.&nbsp;2 to see the job it does.</p>
<div data-slot="raster"></div>
${GG.noteHTML('beyond', `<p><b>The joke has a basis.</b> NVIDIA's H100 whitepaper describes the GH100's GPCs, TPCs and SMs without ever mentioning a raster engine, and says: “Note that the H100 GPUs are primarily built for executing datacenter and edge compute workloads for AI, HPC, and data analytics, but not graphics processing. Only two TPCs in both the SXM5 and PCIe H100 GPUs are graphics-capable (that is, they can run vertex, geometry, and pixel shaders).” So the raster engine is part of what a GPC is on NVIDIA's graphics GPUs, and Fig.&nbsp;1 marks only where it would sit on an H100.</p>`)}
<p>Relatedly, the name used to stand for <b>Graphics</b> Processing Cluster, but is now, e.g. in the <a href="https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html">NVIDIA CUDA C++ Programming Guide</a>, expanded as <b>“GPU Processing Cluster”</b>. Same hardware, same abbreviation, less graphics.</p>
${GG.noteHTML('beyond', `<p><b>NVIDIA is not consistent.</b> That link now redirects to the restructured CUDA Programming Guide. Its section on thread block clusters (2.1.10) says “GPU Processing Cluster (GPC)”, as the glossary says, but its introduction to the programming model says the SMs “are organized into groups called Graphics Processing Clusters (GPCs)”. The H100 whitepaper writes “GPU Processing Clusters (GPCs)”. Both expansions name the same hardware.</p>`, 'Two expansions, one GPC')}
<h3>Clusters: a new level of the thread hierarchy</h3>
<p>Since the introduction of ${T('compute-capability', 'compute capability')} 9.0 GPUs like H100s, there is an additional layer of the ${T('cuda-programming-model', 'CUDA programming model')}'s ${T('thread-hierarchy', 'thread hierarchy')}: a <b>“cluster”</b> of ${T('thread-block', 'thread blocks')} that are scheduled onto the same GPC, just as the threads of a ${T('thread-block', 'thread block')} are scheduled onto the same ${T('streaming-multiprocessor', 'SM')}.</p>
<p>The guarantee is the point. Ordinary blocks of a grid run in any order and cannot count on each other being alive. The blocks of one cluster are launched together, onto SMs that sit close together on the die, so they can wait for each other and share data. Clusters also have their own level of the ${T('memory-hierarchy', 'memory hierarchy')}, <b>distributed shared memory</b>: each block can read and write the ${T('shared-memory', 'shared memory')} of the other blocks in its cluster, across SMs. Fig.&nbsp;3 lets you launch clusters and watch where they land.</p>
<div data-slot="cl"></div>
<div data-slot="nums"></div>
${GG.noteHTML('aside', `<p>The glossary notes that elsewhere it elides discussion of this feature: most of its entries describe the three classic levels (thread, block, grid) and, in the memory hierarchy, registers, shared memory and global memory. In the glossary itself, this is the only entry that discusses thread block clusters and distributed shared memory. (On this site they also come up in the ${T('texture-processing-cluster', 'TPC')} entry, which explains the CTA pairs built from them, and in a few notes elsewhere.)</p>`)}
<h3>What a cluster looks like in code</h3>
<p>A short CUDA C++ example, added here as context beyond the glossary. Two blocks form a cluster; each writes its own shared memory, waits at a cluster-wide barrier, then reads its partner's shared memory directly. Hover the marked lines.</p>
<div data-slot="code"></div>
${GG.noteHTML('beyond', `<p><b>The rules, briefly</b> (from the CUDA C++ Programming Guide). A cluster's size is set at compile time with <code>__cluster_dims__</code> or at launch time with <code>cudaLaunchKernelEx</code>. Up to 8 blocks per cluster is the portable maximum; H100 allows 16 if the kernel opts in with the <code class="hwc-wc">cudaFuncAttributeNonPortableClusterSizeAllowed</code> attribute. Blocks of a cluster are guaranteed to be co-scheduled, so a cluster-wide barrier (<code>cluster.sync()</code>) cannot deadlock. Access to another block's shared memory goes over an SM-to-SM network inside the GPC, slower than a block's own shared memory but much faster than a round trip through ${T('global-memory', 'global memory')}.</p>`)}
<div data-slot="read"></div>`);
      guard(s.zoom, 'Fig. 1', () => gpcZoomFigure(s.zoom, ctx));
      guard(s.raster, 'Fig. 2', () => rasterFigure(s.raster, ctx));
      guard(s.cl, 'Fig. 3', () => clusterFigure(s.cl, ctx));
      guard(s.nums, 'numbers', () => ctx.numbers(s.nums, [
        { value: '8', label: 'GPCs on a GH100 die', tone: 'core' },
        { value: '9 × 2', label: 'TPCs per GPC × SMs per TPC: 18 SMs per full GPC', tone: 'core' },
        { value: '132', label: 'SMs enabled in an H100 SXM, of 144 on the die', tone: 'core' },
        { value: '9.0', label: 'compute capability that introduced thread block clusters', tone: 'control' },
      ]));
      guard(s.code, 'code', () => ctx.code(s.code, {
        lang: 'cuda', code: CLUSTER_CODE, caption: 'two-block cluster with distributed shared memory (beyond the glossary)',
        notes: {
          5: '<code>__cluster_dims__(2, 1, 1)</code> fixes the cluster shape at compile time: every 2 consecutive blocks along x form one cluster, and the hardware places both on SMs of the same GPC at the same time.',
          6: 'An ordinary <code>__shared__</code> array: it lives in this block\'s SM, in that SM\'s L1 data cache.',
          7: '<code>cg::this_cluster()</code> returns a handle for the cluster this block belongs to (cooperative groups API).',
          8: '<code>block_rank()</code> is this block\'s index within its cluster, here 0 or 1.',
          11: '<code>cluster.sync()</code> is a barrier across every thread of every block in the cluster. It is safe only because the blocks are guaranteed to be running at the same time.',
          13: '<code>map_shared_rank</code> turns the address of a shared memory variable into the address of the same variable in another block of the cluster. Reading through <code>peer</code> is a distributed shared memory access: it crosses to the other SM.',
          15: 'A second barrier, so that neither block exits (and frees its shared memory) while its partner may still be reading it.',
        },
      }));
      ctx.reading(s.read, [
        { href: 'https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html', label: 'NVIDIA CUDA C++ Programming Guide', note: 'now the restructured CUDA Programming Guide; section 2.1.10, Thread Block Clusters, expands GPC as “GPU Processing Cluster” (its introduction says “Graphics Processing Clusters”); also distributed shared memory' },
        { href: 'https://modal-cdn.com/gpu-glossary/gtc22-whitepaper-hopper.pdf', label: 'NVIDIA H100 Tensor Core GPU Architecture whitepaper', note: '“GPU Processing Clusters (GPCs)”; GH100 GPC, TPC and SM counts; only two graphics-capable TPCs; thread block clusters and distributed shared memory' },
      ]);
    },
  });

  /* ═════════════════════════════ Register File ═════════════════════════════ */

  GG.css(`
.hwc-ra .hwc-cellg { transition: opacity 0.25s; }
.hwc-pr-lab { font: 500 11px/1.4 var(--font-mono); color: var(--ink-3); }
`);

  /* Fig: the SM floorplan with the register file lit. */
  function smHighlightFigure(slot, ctx, o) {
    const f = ctx.figure(slot, { title: o.title, hint: 'hover or tap any block', wide: true, caption: o.caption });
    let sm = null, view = 'sm', ext = null;
    const build = (focus) => {
      if (sm) sm.destroy();
      sm = GG.components.sm(f.stage, { highlight: o.keys, focus, showCounts: true, legend: focus === 'sm', onPart: (k, part) => { f.setWhy(`<b>${esc(part.name)}</b> · ${esc(part.count)}. ${esc(part.desc)}`); } });
      f.stage.prepend(sm.el);
    };
    const baseWhy = () => (view === 'sm' ? o.whySM : o.whySub);
    build('sm');
    GG.ui.seg(f.controls, { label: 'View', options: [{ value: 'sm', label: 'Whole SM' }, { value: 'sub', label: 'One sub-partition' }], value: 'sm', onChange: (v) => {
      view = v;
      build(v);
      // an extra control (the traffic toggle) re-applies itself to the new drawing, so the switch and the picture agree
      if (!(ext && ext.rebuilt && ext.rebuilt(sm))) f.setWhy(baseWhy());
      GG.decorate(f.why);
    } });
    if (o.extra) ext = o.extra(f, () => sm, baseWhy) || null;
    f.setWhy(o.whySM);
    return f;
  }

  /* Fig: virtual registers → physical 32-bit registers, over time. */
  const RA_VALUES = [
    { id: '%rd1', type: 'u64', w: 2, s: 0, e: 9, what: 'a 64-bit pointer' },
    { id: '%r1', type: 'u32', w: 1, s: 1, e: 4, what: 'a 32-bit integer index' },
    { id: '%fd1', type: 'f64', w: 2, s: 2, e: 6, what: 'a 64-bit double' },
    { id: '%f1', type: 'f32', w: 1, s: 3, e: 5, what: 'a 32-bit float' },
    { id: '%r2', type: 'f16×2', w: 1, s: 5, e: 9, what: 'two 16-bit halves, packed' },
    { id: '%fd2', type: 'f64', w: 2, s: 7, e: 8, what: 'another double' },
    { id: '%r3', type: 's32', w: 1, s: 7, e: 9, what: 'a signed 32-bit counter' },
    { id: '%f2', type: 'f32', w: 1, s: 8, e: 9, what: 'a float result' },
  ];
  /* Every value is stored data, so all are drawn in memory-blue shades: one shade per register footprint. */
  const RA_C32 = '#6fa6ff', RA_C64 = '#a9c8ff', RA_CPK = '#4f86e0';
  const RA_COL = { u64: RA_C64, u32: RA_C32, s32: RA_C32, f64: RA_C64, f32: RA_C32, 'f16×2': RA_CPK };
  const RA_STEPS = 10;
  function raAllocate(cap) {
    const out = RA_VALUES.map((v) => Object.assign({}, v, { reg: null, spill: false }));
    for (const v of out) {
      const busy = new Array(cap).fill(false);
      // u (already placed) is busy if its live range overlaps v's birth, including values born in the same step
      out.forEach((u) => { if (u !== v && u.reg != null && u.s <= v.s && u.e >= v.s) for (let i = 0; i < u.w; i++) busy[u.reg + i] = true; });
      let r = null;
      for (let i = 0; i + v.w <= cap; i += v.w === 2 ? 2 : 1) {
        if (!busy[i] && (v.w === 1 || !busy[i + 1])) { r = i; break; }
      }
      if (r == null) v.spill = true; else v.reg = r;
    }
    return out;
  }
  const regName = (v) => (v.spill ? 'spilled' : v.w === 2 ? `R${v.reg}:R${v.reg + 1}` : `R${v.reg}`);

  /* The program's demand: the most 32-bit words live at any one step, whatever the budget. */
  function raDemand() {
    let peak = 0;
    for (let t = 0; t < RA_STEPS; t++) peak = Math.max(peak, RA_VALUES.filter((v) => v.s <= t && v.e >= t).reduce((a, v) => a + v.w, 0));
    return peak;
  }
  function regAllocFigure(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Virtual registers in, physical 32-bit registers out',
      hint: 'step through time · shrink the register file',
      wide: true,
      class: 'hwc-ra',
      caption: `Top: eight ${T('registers', 'PTX virtual registers')} of one ${T('thread')}, each a bar from the step that creates the value to its last use, coloured by type. Bottom: the physical 32-bit registers of the ${T('register-file', 'register file')} that this thread owns at the selected step, and beside them (below, on a phone) the thread's “local memory”, private memory stored in ${T('gpu-ram', 'GPU RAM')}, where values that get no register are kept and reached with <code>ld.local</code> and <code>st.local</code>. A simplified allocator, in the spirit of ${T('streaming-assembler', 'SASS')} register allocation by <code>ptxas</code>: values are placed in order, 64-bit values take an aligned even/odd pair, and a register is reused as soon as its old value is dead. Real compilers are smarter about what to spill. The register names follow PTX conventions (<code>%r</code> 32-bit, <code>%rd</code> 64-bit integer, <code>%f</code>/<code>%fd</code> 32/64-bit float); the program itself is made up.`,
    });
    const st = { t: 5, cap: 8 };
    const DEMAND = raDemand();
    const box = el('div', { class: 'hwc-w' });
    f.stage.append(box);
    const leg = el('div', { class: 'hwc-legend' });
    leg.innerHTML = Object.entries({ '32-bit value: u32, s32, f32 (1 register)': RA_C32, '64-bit value: u64, f64 (2 registers)': RA_C64, 'f16×2: two halves packed in 1 register': RA_CPK }).map(([k, c]) => `<span><i style="background:${c}"></i>${k}</span>`).join('') + '<span><i style="background:var(--danger-a);box-shadow:inset 0 0 0 1px var(--danger)"></i>spilled to local memory (GPU RAM)</span>';
    f.stage.append(leg);
    const sD = GG.ui.stat(f.readouts, { label: 'Peak demand', value: `${DEMAND} registers`, tone: 'memory' });
    const sP = GG.ui.stat(f.readouts, { label: 'Registers used', value: '—', tone: 'memory' });
    const sLive = GG.ui.stat(f.readouts, { label: 'Live now (32-bit words)', value: '—', tone: 'core' });
    const sS = GG.ui.stat(f.readouts, { label: 'Spilled values', value: '—', tone: 'danger' });
    void sD;
    let alloc = raAllocate(st.cap), lastW = 0;

    function draw(w) {
      box.innerHTML = '';
      const narrow = w < 600;
      const labW = narrow ? 64 : 150;
      const colW = (w - labW - 4) / RA_STEPS;
      const rowH = narrow ? 21 : 23;
      const top = 22;
      const gH = top + RA_VALUES.length * rowH;
      const physTop = gH + (narrow ? 34 : 38);
      const stripW = narrow ? w - 4 : Math.min((w - 4) * 0.64, 8 * 110);
      const cellW = stripW / 8;
      const physH = narrow ? 50 : 54;
      const locX = narrow ? 2 : 2 + stripW + 46, locW = narrow ? w - 4 : w - locX - 2;
      const locY = narrow ? physTop + physH + 34 : physTop, locH = narrow ? 52 : physH;
      const H = (narrow ? locY + locH : physTop + physH) + 22;
      const svg = svgRoot(box, w, H, `Live ranges of eight virtual registers, the physical registers holding them at step ${st.t}, and the values spilled to local memory.`);
      // time axis
      for (let t = 0; t < RA_STEPS; t++) {
        const x = labW + t * colW;
        if (t === st.t) R(svg, x, top - 16, colW, gH - top + 22, 'fill:rgba(255,138,91,.10);stroke:rgba(255,138,91,.5)', { rx: 3 });
        Tx(svg, x + colW / 2, top - 5, narrow ? String(t) : `step ${t}`, { fs: 10, fill: t === st.t ? 'var(--accent)' : 'var(--ink-3)', anchor: 'middle' });
        const hg = G(svg);
        R(hg, x, top - 16, colW, gH - top + 22, 'fill:transparent');
        hit(hg, `Go to step ${t}`, { click: () => { st.t = t; slider.set(t); update(); } });
      }
      alloc.forEach((v, i) => {
        const y = top + i * rowH;
        const live = v.s <= st.t && v.e >= st.t;
        Tx(svg, 2, y + rowH / 2 + 4, v.id, { fs: narrow ? 10.5 : 11.5, fill: live ? 'var(--ink)' : 'var(--ink-3)', fw: 600 });
        if (!narrow) Tx(svg, 52, y + rowH / 2 + 4, v.type, { fs: 10, fill: 'var(--ink-3)' });
        const x0 = labW + v.s * colW + 2, x1 = labW + (v.e + 1) * colW - 2;
        const col = v.spill ? 'var(--danger)' : RA_COL[v.type];
        R(svg, x0, y + 3, x1 - x0, rowH - 6, v.spill ? 'fill:var(--danger-a);stroke:var(--danger);stroke-dasharray:3 2' : `fill:${col};opacity:${live ? 0.9 : 0.42}`, { rx: 4 });
        Tx(svg, x0 + 6, y + rowH / 2 + 3.5, regName(v) + (narrow ? '' : v.spill ? ' → local memory' : ''), { fs: 10, fill: v.spill ? 'var(--danger)' : '#0b0c12', fw: 700 });
      });
      // physical strip
      Tx(svg, 2, physTop - 10, `REGISTERS AT STEP ${st.t}` + (narrow ? '' : `  ·  this thread may use ${st.cap}`), { fs: 10, fill: 'var(--ink-3)', ls: '0.1em' });
      const occ = new Array(st.cap).fill(null);
      alloc.forEach((v) => { if (!v.spill && v.s <= st.t && v.e >= st.t) for (let i = 0; i < v.w; i++) occ[v.reg + i] = { v, part: i }; });
      for (let i = 0; i < 8; i++) {
        const x = 2 + i * cellW;
        const inCap = i < st.cap;
        if (!inCap) { R(svg, x + 2, physTop, cellW - 4, physH, 'fill:none;stroke:rgba(255,255,255,.08);stroke-dasharray:3 3', { rx: 5 }); Tx(svg, x + cellW / 2, physTop + physH / 2 + 4, 'n/a', { fs: 10, fill: 'var(--ink-3)', anchor: 'middle', op: 0.6 }); }
        else {
          const o = occ[i];
          R(svg, x + 2, physTop, cellW - 4, physH, o ? `fill:${RA_COL[o.v.type]};opacity:.22;stroke:none` : 'fill:rgba(255,255,255,.03)', { rx: 5 });
          R(svg, x + 2, physTop, cellW - 4, physH, `fill:none;stroke:${o ? RA_COL[o.v.type] : 'var(--line-2)'}`, { rx: 5 });
          if (o) {
            const lab = o.v.w === 2 ? (o.part === 0 ? (narrow ? 'lo' : 'low 32') : (narrow ? 'hi' : 'high 32')) : o.v.type === 'f16×2' ? (narrow ? 'h|h' : 'half | half') : o.v.type;
            Tx(svg, x + cellW / 2, physTop + 31, o.v.id, { fs: 10, fill: 'var(--ink)', anchor: 'middle', fw: 600 });
            Tx(svg, x + cellW / 2, physTop + 45, lab, { fs: 10, fill: 'var(--ink-2)', anchor: 'middle' });
          } else Tx(svg, x + cellW / 2, physTop + 37, 'free', { fs: 10, fill: 'var(--ink-3)', anchor: 'middle' });
        }
        Tx(svg, x + 8, physTop + 13, `R${i}`, { fs: 10, fill: inCap ? 'var(--memory)' : 'var(--ink-3)', fw: 600 });
      }
      // pair brackets for 64-bit occupants
      for (let i = 0; i < st.cap; i++) {
        const o = occ[i];
        if (o && o.v.w === 2 && o.part === 0) {
          const x = 2 + i * cellW + 4, x2 = 2 + (i + 2) * cellW - 4;
          P(svg, `M${x} ${physTop + physH + 5} L${x} ${physTop + physH + 9} L${x2} ${physTop + physH + 9} L${x2} ${physTop + physH + 5}`, `fill:none;stroke:${RA_COL[o.v.type]}`);
          Tx(svg, (x + x2) / 2, physTop + physH + 20, narrow ? 'a pair' : `one ${o.v.type} in a pair`, { fs: 10, fill: RA_COL[o.v.type], anchor: 'middle' });
        }
      }
      // local memory: where the values that got no register live, in GPU RAM
      const spilledLive = alloc.filter((v) => v.spill && v.s <= st.t && v.e >= st.t);
      const anySpill = alloc.some((v) => v.spill);
      R(svg, locX, locY, locW, locH, `fill:${spilledLive.length ? 'rgba(255,91,110,.06)' : 'rgba(255,255,255,.02)'};stroke:${anySpill ? 'var(--danger)' : 'var(--line-2)'};stroke-dasharray:4 3`, { rx: 6 });
      Tx(svg, locX + 8, locY + 14, narrow ? 'LOCAL MEMORY · in GPU RAM · ld/st.local' : 'LOCAL MEMORY · in GPU RAM · ld.local / st.local', { fs: 10, fill: anySpill ? 'var(--danger)' : 'var(--ink-3)', ls: '0.06em' });
      if (spilledLive.length) {
        let cx = locX + 8;
        const ch = locH - 24, cw = Math.max(54, Math.min(110, (locW - 16) / 3 - 6));
        spilledLive.forEach((v) => {
          R(svg, cx, locY + 19, cw, ch, 'fill:var(--danger-a);stroke:var(--danger);stroke-dasharray:3 2', { rx: 4 });
          Tx(svg, cx + 6, locY + 19 + ch / 2 + 4, `${v.id} · ${v.w * 32} bit`, { fs: 10, fill: 'var(--danger)', fw: 600 });
          cx += cw + 6;
        });
      } else Tx(svg, locX + 8, locY + locH - 12, anySpill ? 'no spilled value is live at this step' : 'empty: every value got a register', { fs: 10, fill: 'var(--ink-3)' });
      if (!narrow) {
        // the slow round trip between the register file and local memory
        const ay = physTop + physH / 2, xa = 2 + stripW + 4, xb = locX - 4;
        L(svg, xa + 6, ay, xb - 6, ay, `stroke:${anySpill ? 'var(--danger)' : 'var(--line-2)'};stroke-width:1.6;stroke-dasharray:4 3`);
        arrowHead(svg, xb, ay, 'r', 6, anySpill ? 'var(--danger)' : 'var(--line-2)');
        arrowHead(svg, xa, ay, 'l', 6, anySpill ? 'var(--danger)' : 'var(--line-2)');
      }
    }
    function update() {
      draw(lastW);
      const maxReg = Math.max(0, ...alloc.filter((v) => !v.spill).map((v) => v.reg + v.w));
      const spills = alloc.filter((v) => v.spill);
      const liveV = alloc.filter((v) => v.s <= st.t && v.e >= st.t);
      const liveWords = liveV.reduce((a, v) => a + v.w, 0);
      const spillWords = liveV.filter((v) => v.spill).reduce((a, v) => a + v.w, 0);
      sP.set(`${maxReg} of ${st.cap}`);
      sLive.set(spillWords ? `${liveWords - spillWords} in registers · ${spillWords} spilled` : `${liveWords}, all in registers`, spillWords ? 'danger' : 'core');
      sS.set(String(spills.length), spills.length ? 'danger' : 'core');
      // narrate this step
      const born = alloc.filter((v) => v.s === st.t);
      const parts = born.map((v) => {
        if (v.spill) return `<b>${v.id}</b> (${v.what}) finds no free ${v.w === 2 ? 'even/odd pair' : 'register'}, so it is <b class="hwc-bad">spilled</b> to local memory, which lives in ${T('gpu-ram', 'GPU RAM')}`;
        const prev = alloc.filter((u) => !u.spill && u !== v && u.e < v.s && u.reg != null && u.reg < v.reg + v.w && v.reg < u.reg + u.w).sort((a, b) => b.e - a.e)[0];
        return `<b>${v.id}</b> (${v.what}) goes into <b>${regName(v)}</b>` + (prev ? `, reusing the register${prev.w + v.w > 2 ? 's' : ''} of ${prev.id} (${prev.type}), which died at step ${prev.e}` : '');
      });
      let msg = `<b>Step ${st.t}.</b> `;
      msg += parts.length ? parts.join('; ') + '. ' : 'No new values. ';
      msg += `${liveWords} 32-bit words are live${spillWords ? `, ${spillWords} of them out in local memory` : ''}.`;
      if (spills.length) msg += ` At its busiest step the program needs <b>${DEMAND}</b> registers but this thread may use only ${st.cap}, so ${spills.length} ${plural(spills.length, 'value')} ${spills.length === 1 ? 'spills' : 'spill'}: every use of ${spills.length === 1 ? 'it' : 'them'} becomes a load or store to slow memory.`;
      else msg += ` At its busiest step the program needs <b>${DEMAND}</b> registers, and it may use ${st.cap}, so nothing spills.`;
      f.setWhy(msg);
      GG.decorate(f.why);
    }
    const slider = GG.ui.slider(f.controls, { label: 'Step', min: 0, max: RA_STEPS - 1, step: 1, value: st.t, format: (v) => `step ${v}`, onInput: (v) => { st.t = v; update(); } });
    GG.ui.seg(f.controls, { label: 'Registers this thread may use', options: [{ value: 8, label: '8' }, { value: 6, label: '6' }, { value: 4, label: '4' }], value: st.cap, onChange: (v) => { st.cap = v; alloc = raAllocate(v); update(); } });
    onWidth(box, (w) => { lastW = w; update(); });
    return f;
  }

  /* Fig: registers per thread → warps resident → occupancy (compact). */
  function pressureFigure(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Register pressure → occupancy, in one SM',
      hint: 'drag registers per thread',
      caption: `The four 16,384-register slices of an H100 SM's register file, one per sub-partition, and the 16 warp slots beside each. Registers are handed out per ${T('warp')}, rounded up to 8 per thread (256 per warp), and a warp takes all of its registers from one slice. Block size, shared memory and the other limits are ignored here; ${T('register-pressure', 'Register Pressure')} and ${T('occupancy', 'Occupancy')} have the full calculators.`,
    });
    const st = { r: 64 };
    const box = el('div', { class: 'hwc-w' });
    f.stage.append(box);
    const sPer = GG.ui.stat(f.readouts, { label: 'Registers per warp', value: '—', tone: 'memory' });
    const sW = GG.ui.stat(f.readouts, { label: 'Warps per SM', value: '—', tone: 'core' });
    const sO = GG.ui.stat(f.readouts, { label: 'Occupancy', value: '—', tone: 'core' });
    let lastW = 0, syncPresets = () => {};
    function calc() {
      const rr = Math.min(256, Math.ceil(st.r / 8) * 8);
      const perWarp = rr * 32;
      const perSlice = Math.min(16, Math.floor(16384 / perWarp));
      return { rr, perWarp, perSlice, warps: perSlice * 4, occ: (perSlice * 4) / 64 };
    }
    function draw(w) {
      box.innerHTML = '';
      const c = calc();
      const gap = w < 500 ? 8 : 14;
      const colW = (w - gap * 3) / 4;
      const barH = 150, top = 18;
      const slotsTop = top + barH + 16;
      const slotH = 12, slotGap = 3;
      const slotsPerRow = 8;
      const H = slotsTop + 2 * (slotH + slotGap) + 18;
      const svg = svgRoot(box, w, H, `Register file slices filled by warps using ${c.rr} registers per thread: ${c.warps} warps fit.`);
      for (let q = 0; q < 4; q++) {
        const x = q * (colW + gap);
        Tx(svg, x, 11, colW < 100 ? `SP ${q}` : `sub-partition ${q}`, { fs: 10, fill: 'var(--ink-3)' });
        R(svg, x, top, colW, barH, 'fill:rgba(255,255,255,.03);stroke:var(--line-2)', { rx: 4 });
        const segH = barH * (c.perWarp / 16384);
        for (let k = 0; k < c.perSlice; k++) {
          R(svg, x + 2, top + 2 + k * segH, colW - 4, Math.max(1, segH - (segH > 6 ? 2 : 0.6)), 'fill:var(--memory-a);stroke:var(--memory);stroke-width:.8', { rx: 2 });
          if (segH >= 16) Tx(svg, x + colW / 2, top + 2 + k * segH + segH / 2 + 3.5, `warp ${q + 4 * k}`, { fs: 10, fill: 'var(--ink-2)', anchor: 'middle' });
        }
        const used = c.perSlice * c.perWarp;
        if (used < 16384) {
          const y = top + 2 + c.perSlice * segH;
          R(svg, x + 2, y, colW - 4, Math.max(0, barH - 4 - c.perSlice * segH), 'fill:none;stroke:var(--danger);stroke-dasharray:3 3;opacity:.55', { rx: 2 });
          if (barH - c.perSlice * segH > 18) Tx(svg, x + colW / 2, y + 13, colW < 100 ? fmt.int(16384 - used) : `${fmt.int(16384 - used)} unused`, { fs: 10, fill: 'var(--danger)', anchor: 'middle' });
        }
        // warp slots
        const sw = (colW - (slotsPerRow - 1) * slotGap) / slotsPerRow;
        for (let k = 0; k < 16; k++) {
          const sx = x + (k % slotsPerRow) * (sw + slotGap), sy = slotsTop + Math.floor(k / slotsPerRow) * (slotH + slotGap);
          R(svg, sx, sy, sw, slotH, k < c.perSlice ? 'fill:var(--core);opacity:.85' : 'fill:none;stroke:var(--line-2)', { rx: 2 });
        }
      }
      Tx(svg, 0, H - 3, w < 500 ? 'warp slots: 16 per SP, 64 per SM' : 'warp slots: 16 per sub-partition, 64 per SM', { fs: 10, fill: 'var(--ink-3)' });
    }
    function update() {
      draw(lastW);
      const c = calc();
      sPer.set(fmt.int(c.perWarp));
      sW.set(`${c.warps} of 64`);
      sO.set(fmt.pct(c.occ, c.occ * 100 % 1 ? 1 : 0), c.occ >= 0.5 ? 'core' : c.occ >= 0.25 ? 'control' : 'danger');
      syncPresets();
      const pre = c.rr !== st.r ? `${st.r} registers per thread round up to ${c.rr}, so ` : '';
      f.setWhy(`${pre || 'A '}${pre ? 'a ' : ''}warp needs ${c.rr} × 32 = <b>${fmt.int(c.perWarp)}</b> registers. A 16,384-register slice holds ${c.perSlice === 16 ? 'all 16 warp slots\' worth' : `<b>${c.perSlice}</b>`}, so <b>${c.warps}</b> of 64 warps can be resident (${fmt.pct(c.occ, c.occ * 100 % 1 ? 1 : 0)} ${T('occupancy', 'occupancy')}). ${c.perSlice >= 8 ? 'Each warp scheduler still has plenty of warps to switch to while others wait on memory.' : c.perSlice >= 4 ? `Each warp scheduler has only ${c.perSlice} warps to choose from: fewer chances for ${T('latency-hiding', 'latency hiding')}.` : `Each warp scheduler has just ${c.perSlice} ${plural(c.perSlice, 'warp')}: when ${c.perSlice === 1 ? 'it stalls' : 'they stall'}, the cores sit idle. Little room for ${T('latency-hiding', 'latency hiding')}.`}`);
      GG.decorate(f.why);
    }
    const sl = GG.ui.slider(f.controls, { label: 'Registers per thread', min: 16, max: 255, step: 1, value: st.r, format: (v) => `${v}`, onInput: (v) => { st.r = v; update(); } });
    const pres = el('div', { class: 'ctl' }, el('span', { class: 'ctl-lab', text: 'Try' }));
    const row = el('div', { class: 'hwc-navrow', style: 'display:flex;gap:6px;flex-wrap:wrap' });
    pres.append(row);
    f.controls.append(pres);
    const presets = [32, 64, 128, 255].map((v) => { const b = GG.ui.button(row, { label: String(v), onClick: () => { st.r = v; sl.set(v); update(); } }); b.classList.add('hwc-preset'); b._v = v; return b; });
    syncPresets = () => presets.forEach((b) => b.setAttribute('aria-pressed', String(b._v === st.r)));
    onWidth(box, (w) => { lastW = w; update(); });
    return f;
  }

  GG.entry('register-file', {
    render(body, ctx) {
      const s = ctx.html(body, `
<p>The <strong>register file</strong> of the ${T('streaming-multiprocessor', 'Streaming Multiprocessor')} is the primary store of bits in between their manipulation by the ${T('core', 'cores')}. When a core adds two numbers, both inputs come out of the register file and the sum goes back into it. Most data on its way to a core passes through here. (${T('tensor-core', 'Tensor Cores')} are the exception: on Hopper and Blackwell they can read operands straight from ${T('shared-memory', 'shared memory')} and, on Blackwell, from ${T('tensor-memory', 'Tensor Memory')}.)</p>
<div data-slot="sm"></div>
<div data-slot="nums"></div>
<h3>Fast enough to keep up with the cores</h3>
<p>Like registers in CPUs, these registers are made from very fast memory technology (static RAM cells wired right next to the execution units) that can keep pace with the compute ${T('core', 'cores')}, handing them fresh operands on every clock cycle. They are about an order of magnitude faster than the ${T('l1-data-cache', 'L1 data cache')}, the next level out. Fig.&nbsp;2 draws that gap to scale, with the slower levels beyond it; ${T('gpu-ram', 'GPU RAM')}'s Fig.&nbsp;5 races them.</p>
<div data-slot="race"></div>
${GG.noteHTML('intuition', `<p>Think of a workshop. The register file is the workbench: small, but everything on it is within arm's reach, and the work happens there. The L1 data cache is the shelf across the room, about ten times slower to reach. ${T('gpu-ram', 'GPU RAM')} is the warehouse down the street.</p>`)}
<h3>32-bit registers, reused for any type</h3>
<p>The register file is split into <b>32-bit registers</b> that can be dynamically reallocated between different data types: a 32-bit integer fills one register, a 64-bit floating point number takes two, and a 16-bit or smaller floating point number either takes a register on its own or shares one with others of its kind, packed as a group (two 16-bit halves in one register, for example). The same physical register may hold an integer at one moment and half of a double a few instructions later.</p>
<p>These physical registers back the ${T('registers', 'virtual registers')} in the ${T('parallel-thread-execution', 'Parallel Thread eXecution (PTX)')} intermediate representation. PTX lets a program name as many registers as it likes; the hardware has a fixed number. Turning one into the other is the job of the compiler. Step through Fig.&nbsp;3 to watch it happen, then shrink the register budget to see values spill out.</p>
<div data-slot="ra"></div>
<h3>Who gets how many: ptxas, pressure and occupancy</h3>
<p>Allocation of physical registers to ${T('thread', 'threads')} in ${T('streaming-assembler', 'Streaming Assembler (SASS)')} is managed by a compiler like <code>ptxas</code>, the assembler that turns PTX into SASS, which optimizes register file usage by ${T('thread-block', 'thread blocks')}. Every thread of a kernel gets the same number of registers, fixed at compile time, and a block needs that number times its thread count.</p>
<p>That creates a trade-off. If each ${T('thread-block', 'thread block')} consumes too much of the register file (colloquially, high “${T('register-pressure', 'register pressure')}”), then the number of concurrently schedulable ${T('thread', 'threads')} will be reduced, leading to a low ${T('occupancy', 'occupancy')} and possibly impacting performance by reducing opportunities for ${T('latency-hiding', 'latency hiding')}: with fewer warps resident, a warp scheduler has fewer others to switch to while one waits on memory. Drag the slider in Fig.&nbsp;4.</p>
<div data-slot="pr"></div>
${GG.noteHTML('beyond', `<p><b>Knobs and limits.</b> On an H100 a thread can use at most 255 registers. Programmers can cap the count with the <code>nvcc</code> flag <code>-maxrregcount</code> or with <code>__launch_bounds__</code> on a kernel, trading spills for occupancy. Values that do not fit are spilled to “local memory”, which despite its name is private memory stored in ${T('gpu-ram', 'GPU RAM')} (cached on the way in L1 and L2). In the SASS that <code>ptxas</code> emits, a 64-bit value always sits in an aligned register pair such as <code>R4</code>/<code>R5</code>, which is why Fig.&nbsp;3 places doubles on even registers.</p>`)}
<div data-slot="read"></div>`);
      guard(s.sm, 'Fig. 1', () => smHighlightFigure(s.sm, ctx, {
        title: 'The register file in an H100 SM',
        keys: ['regfile'],
        caption: `The internal architecture of an H100 SM, redrawn from NVIDIA's <a href="https://modal-cdn.com/gpu-glossary/gtc22-whitepaper-hopper.pdf">H100 white paper</a> as modified by the glossary. The register file is depicted in blue: one 16,384 × 32-bit slice in each of the four sub-partitions, sitting directly above the cores it feeds.`,
        whySM: `The <b>register file</b> is four slices of 16,384 32-bit registers, one per sub-partition, right next to the warp scheduler, dispatch unit and cores of that quarter of the SM: 4 × 16,384 = <b>65,536 registers</b>, 256 KiB per SM.`,
        whySub: `One sub-partition: its <b>16,384 × 32-bit</b> (64 KiB) slice of the register file feeds its 16 INT32, 32 FP32 and 16 FP64 units, its Tensor Core and its 8 load/store units.`,
      }));
      guard(s.nums, 'numbers', () => ctx.numbers(s.nums, [
        { value: '16,384', label: '32-bit registers per sub-partition (64 KiB)', tone: 'memory' },
        { value: '65,536', label: 'registers per SM: 4 × 16,384 = 256 KiB', tone: 'memory' },
        { value: '33 MiB', label: 'of registers across the 132 SMs of an H100 SXM (8,650,752 registers)', tone: 'memory' },
        { value: '~10×', label: 'faster than the L1 data cache', tone: 'core' },
      ]));
      guard(s.race, 'Fig. 2', () => ladderFigure(s.race, ctx, {
        title: 'The register file on the latency ladder',
        focus: 'rf',
        caption: LADDER_CAPTION,
        why: {
          rf: `<b>Register file: 1 unit.</b> This is the yardstick. Registers keep pace with the cores, handing them fresh operands on every clock cycle.`,
          l1: `<b>L1 data cache: about 10 units</b>, about an order of magnitude slower than the register file. In the time one L1 load takes, a core could be fed register operands about ten times over. That is why values in active use live in the register file, right beside the cores.`,
          l2: `<b>L2 cache: about 65 units</b>, for a load that misses in the L1 and finds its data in the L2, which all SMs share (measured on a Hopper GPU; beyond the glossary).`,
          ram: `<b>GPU RAM: about 120 units</b>, for a load that goes all the way off the chip (measured on a Hopper GPU; beyond the glossary). Register values that spill go to local memory, which is stored here and cached on the way in the L1 and L2 (Fig.&nbsp;3).`,
        },
      }));
      guard(s.ra, 'Fig. 3', () => regAllocFigure(s.ra, ctx));
      guard(s.pr, 'Fig. 4', () => pressureFigure(s.pr, ctx));
      ctx.reading(s.read, [
        { href: 'https://modal-cdn.com/gpu-glossary/gtc22-whitepaper-hopper.pdf', label: 'NVIDIA H100 Tensor Core GPU Architecture whitepaper', note: 'the SM diagram (Fig. 1) and the register file size' },
        { href: 'https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/index.html', label: 'CUDA C++ Best Practices Guide', note: 'register allocation granularity, -maxrregcount and local memory (Beyond the glossary)' },
      ]);
    },
  });

  /* ═════════════════════════════ L1 Data Cache ═════════════════════════════ */

  GG.css(`
.hwc-mg { display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; align-items: start; }
.hwc-mg.two { grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); }
.hwc-mg .code pre { font-size: 12.3px; }
`);

  /* Fig: partitioning the L1 among thread blocks. */
  const CARVES_90 = [0, 8, 16, 32, 64, 100, 132, 164, 196, 228]; // KB of shared memory per SM, compute capability 9.0
  function smemPartitionFigure(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'One SM’s 256 KiB, partitioned among thread blocks',
      hint: 'drag shared memory per block · pick the carve-out',
      wide: true,
      caption: `The L1 data cache of one H100 SM drawn to scale. Part of it is set aside as ${T('shared-memory', 'shared memory')} (the carve-out); the rest stays an ordinary hardware cache. On compute capability 9.0 the carve-out is one of 0, 8, 16, 32, 64, 100, 132, 164, 196 or 228 KiB (NVIDIA's documents write “KB” for these 1,024-byte units), chosen per kernel: the program states a preference with <code class="hwc-wc">cudaFuncAttributePreferredSharedMemoryCarveout</code>, which the driver treats as a hint and may change if the kernel needs more. Each resident ${T('thread-block', 'thread block')} gets its own slice of the shared part, plus 1 KiB that CUDA reserves for each block. Above 48 KiB per block, a kernel must use dynamic shared memory and opt in with <code class="hwc-wc">cudaFuncSetAttribute(…, cudaFuncAttributeMaxDynamicSharedMemorySize, …)</code>; static <code>__shared__</code> arrays stop at 48 KiB. The carve-out sizes, the 1 KiB reservation, the 227 KiB per-block maximum, the 48 KiB rule and the 32-blocks-per-SM limit are from NVIDIA's CUDA Programming Guide, beyond the glossary.`,
    });
    const st = { s: 48, mode: 'fit' };
    const box = el('div', { class: 'hwc-w' });
    f.stage.append(box);
    const sB = GG.ui.stat(f.readouts, { label: 'Blocks that fit', value: '—', tone: 'core' });
    const sU = GG.ui.stat(f.readouts, { label: 'Shared memory used', value: '—', tone: 'memory' });
    const sC = GG.ui.stat(f.readouts, { label: 'Carve-out · L1 cache', value: '—', tone: 'memory' });
    const sL = GG.ui.stat(f.readouts, { label: 'Unused in the carve-out', value: '—' });
    const MAXC = 228, TOTAL = 256;
    let lastW = 0;
    const calc = () => {
      const per = st.s + 1;
      const byMem = Math.floor(MAXC / per);
      const n = Math.min(32, byMem);
      const used = n * per;
      const carve = st.mode === 'max' ? MAXC : CARVES_90.find((c) => c >= used);
      return { per, n, byMem, used, carve, l1: TOTAL - carve, unused: carve - used };
    };
    function draw(w) {
      box.innerHTML = '';
      const c = calc();
      const narrow = w < 600;
      const barY = 46, barH = narrow ? 58 : 66;
      const H = barY + barH + 52;
      const svg = svgRoot(box, w, H, `256 KiB of L1 data cache: ${c.n} blocks of ${st.s} KiB shared memory each, in a ${c.carve} KiB shared memory carve-out, leaving ${c.l1} KiB of L1 cache.`);
      const kx = (w - 4) / TOTAL;
      const x0 = 2;
      // ruler
      [0, 64, 128, 192, 256].forEach((v) => {
        const x = x0 + v * kx;
        L(svg, x, barY - 6, x, barY - 1, 'stroke:var(--ink-3)');
        Tx(svg, x, barY - 10, v + (v === 256 ? ' KiB' : ''), { fs: 10, fill: 'var(--ink-3)', anchor: v === 0 ? 'start' : v === 256 ? 'end' : 'middle' });
      });
      R(svg, x0, barY, TOTAL * kx, barH, 'fill:rgba(255,255,255,.03);stroke:var(--line-2)', { rx: 5 });
      // the hardware-managed L1 cache: everything outside the carve-out
      if (c.l1 > 0) {
        R(svg, x0 + c.carve * kx, barY, c.l1 * kx, barH, 'fill:var(--memory-a);stroke:var(--memory)', { rx: 3 });
        const lw = c.l1 * kx;
        const lab = lw > 120 ? `L1 cache · ${c.l1} KiB` : lw > 52 ? `L1 · ${c.l1}` : lw > 18 ? 'L1' : '';
        if (lab) Tx(svg, x0 + (c.carve + c.l1 / 2) * kx, barY + barH / 2 + 4, lab, { fs: 10, fill: 'var(--memory)', anchor: 'middle', fw: 600 });
      }
      // block slices
      const hatchId = GG.uid('hwc-h');
      const pat = S('pattern', { id: hatchId, width: 4, height: 4, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, S('defs', null, svg));
      L(pat, 0, 0, 0, 4, 'stroke:rgba(255,255,255,.35);stroke-width:1.2');
      // every slice is shared memory, so all are memory blue; alternating shades tell neighbouring blocks apart
      const PAL = ['#6fa6ff', '#a9c8ff'];
      for (let b = 0; b < c.n; b++) {
        const bx = x0 + b * c.per * kx;
        const col = PAL[b % PAL.length];
        R(svg, bx + 0.5, barY + 3, st.s * kx - 0.5, barH - 6, `fill:${col};opacity:.7`, { rx: 2 });
        R(svg, bx + st.s * kx, barY + 3, Math.max(0.6, kx - 0.3), barH - 6, `fill:url(#${hatchId})`);
        if (st.s * kx > 40) Tx(svg, bx + (st.s * kx) / 2, barY + barH / 2 + 4, `block ${b}`, { fs: 10, fill: '#0b0c12', anchor: 'middle', fw: 700 });
      }
      if (c.unused > 0) {
        R(svg, x0 + c.used * kx, barY + 3, c.unused * kx, barH - 6, 'fill:none;stroke:var(--ink-3);stroke-dasharray:3 3', { rx: 2 });
        if (c.unused * kx > 64) Tx(svg, x0 + (c.used + c.unused / 2) * kx, barY + barH / 2 + 4, `${c.unused} KiB unused`, { fs: 10, fill: 'var(--ink-3)', anchor: 'middle' });
      }
      // the carve-out boundary
      const cx = x0 + c.carve * kx;
      L(svg, cx, barY - 4, cx, barY + barH + 4, 'stroke:var(--accent);stroke-width:2');
      Tx(svg, clamp(cx, 60, w - 60), barY - 26, `carve-out: ${c.carve} KiB`, { fs: 10.5, fill: 'var(--accent)', anchor: 'middle', fw: 600 });
      // brace for the shared carve-out
      const by = barY + barH + 8;
      if (c.carve > 0) P(svg, `M${x0} ${by} L${x0} ${by + 5} L${cx} ${by + 5} L${cx} ${by}`, 'fill:none;stroke:var(--ink-3)');
      Tx(svg, x0 + 1, by + 19, narrow ? `shared memory: ${c.carve} KiB` : `shared memory carve-out: ${c.carve} KiB · the rest, ${c.l1} KiB, caches ordinary loads`, { fs: 10, fill: 'var(--ink-2)' });
      Tx(svg, x0 + 1, by + 34, narrow ? 'hatched: 1 KiB per block for CUDA' : 'hatched: 1 KiB reserved per block for CUDA · dashed: carve-out no block uses', { fs: 10, fill: 'var(--ink-3)' });
    }
    function update() {
      draw(lastW);
      const c = calc();
      presets.forEach((b) => b.setAttribute('aria-pressed', String(b._v === st.s)));
      sB.set(String(c.n), c.n >= 2 ? 'core' : 'control');
      sU.set(`${c.n * st.s} + ${c.n} reserved = ${c.used} KiB`);
      sC.set(`${c.carve} KiB · ${c.l1} KiB`);
      sL.set(`${c.unused} KiB`, c.unused ? null : 'core');
      const capBy = c.byMem > 32 ? ` Shared memory alone would allow ${c.byMem}, but an SM holds at most 32 blocks.` : '';
      const carve = st.mode === 'fit'
        ? ` The smallest supported carve-out that holds them is <b>${c.carve} KiB</b>, so <b>${c.l1} KiB</b> stays ordinary L1 cache for loads that do not use shared memory.${c.unused ? ` The last ${c.unused} KiB of the carve-out goes unused, because the sizes come in steps.` : ' Nothing is left over.'}`
        : ` With the carve-out at its 228 KiB maximum, only ${c.l1} KiB stays L1 cache${c.unused ? `, and ${c.unused} KiB of shared memory sits unused: no block can take it, and the cache cannot use it either` : ''}.`;
      const iso = c.n > 1 ? ' Each block gets its own slice: block 0\'s threads cannot touch block 1\'s shared memory, even though both live in the same SRAM, unless the two blocks belong to one thread block cluster (distributed shared memory).' : ' The block gets its own slice, which only its threads (and, since compute capability 9.0, blocks of its cluster) can reach. One block per SM leaves the SM nothing to switch to when that block waits.';
      const big = st.s > 48 ? ` More than 48 KiB per block also needs dynamic shared memory and an explicit opt-in (<code class="hwc-wc">cudaFuncSetAttribute</code>); a static <code>__shared__</code> array stops at 48 KiB.` : '';
      f.setWhy(`Each block asks for <b>${st.s} KiB</b> of shared memory, plus the 1 KiB CUDA reserves per block, so <b>${c.n}</b> ${plural(c.n, 'block')} ${c.n === 1 ? 'fits' : 'fit'}: ${c.n} × ${c.per} = ${c.used} KiB.${capBy}${carve}${iso}${big}`);
    }
    const sl = GG.ui.slider(f.controls, { label: 'Shared memory per block', min: 1, max: 227, step: 1, value: st.s, format: (v) => `${v} KiB`, onInput: (v) => { st.s = v; update(); } });
    const pres = el('div', { class: 'ctl' }, el('span', { class: 'ctl-lab', text: 'Try' }));
    const row = el('div', { style: 'display:flex;gap:6px;flex-wrap:wrap' });
    pres.append(row);
    f.controls.append(pres);
    const presets = [[6, '6'], [48, '48'], [100, '100'], [227, '227']].map(([v, l]) => { const b = GG.ui.button(row, { label: l + ' KiB', onClick: () => { st.s = v; sl.set(v); update(); } }); b.classList.add('hwc-preset'); b._v = v; return b; });
    GG.ui.seg(f.controls, { label: 'Carve-out', options: [{ value: 'fit', label: 'smallest that fits' }, { value: 'max', label: '228 KiB (maximum)' }], value: st.mode, onChange: (v) => { st.mode = v; update(); } });
    onWidth(box, (w) => { lastW = w; update(); });
    return f;
  }

  /* Fig: CPU L1 (hardware-managed) vs GPU L1 (mostly programmer-managed). */
  const CPU_CODE = `// CPU: cache never mentioned
for (int i = 0; i < n; i++)
    y[i] = x[i] * 2.0f;`;
  const GPU_CODE = `// CUDA C: the program stages data
// reserve 1 KiB of this SM's L1
__shared__ float tile[256];
int i = blockIdx.x * 256 + threadIdx.x;
// global -> register -> shared
tile[threadIdx.x] = x[i];
// the whole block waits here
__syncthreads();
// ordinary load: hardware caches it
float s = scale[0];
// reuse another thread's element
y[i] = tile[255 - threadIdx.x] * s;`;
  function managedFigure(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Who decides what is in L1?',
      hint: 'pick CPU or GPU · step through',
      wide: true,
      caption: `A few lines of code, and where the data moves at each step. On a CPU the hardware fills and evicts L1 cache lines on its own. On a GPU a kernel can set aside up to 228 KiB of the L1 as ${T('shared-memory', 'shared memory')}, which its ${T('cuda-c', 'CUDA C')} code fills and reads explicitly, in two hops through registers; the rest (“hw cache”) caches ordinary loads automatically. The kernel assumes 256 threads per block; 16 squares stand for its 256 threads. Both snippets are illustrations beyond the glossary.`,
    });
    const st = { mode: 'gpu', step: 0 };
    const grid = el('div', { class: 'hwc-mg' });
    f.stage.append(grid);
    const codeBox = el('div');
    const pic = el('div', { class: 'hwc-w' });
    grid.append(codeBox, pic);
    let code = null, lastW = 0, stepper = null;
    const STEPS = {
      cpu: [
        { lines: [3], label: 'load x[0]', why: '<b>Load <code>x[0]</code>.</b> It is not in L1 (a miss), so the cache hardware fetches the whole cache line around it from RAM, without being asked.', path: 'ram-l1' },
        { lines: [3], label: 'load x[1]', why: '<b>Load <code>x[1]</code>.</b> It arrived with the line fetched for <code>x[0]</code>: a hit, served from L1. The program never knew.', path: 'l1-core' },
        { lines: [2, 3], label: 'keep going', why: '<b>Keep looping.</b> When L1 fills up, the hardware picks old lines to evict. Placement, replacement and write-back are all decided by the CPU: the cache is <b>fully hardware-managed</b>.', path: 'evict' },
      ],
      gpu: [
        { lines: [2, 3], label: 'declare', why: '<b><code>__shared__</code></b> asks for 1 KiB (256 floats) of the SM’s L1 to be set aside as shared memory for this block. The programmer, not the hardware, decides it exists and how big it is.', path: 'none' },
        { lines: [5, 6], label: 'copy in', why: '<b>Copy in, in two hops.</b> ① Each thread loads one element of <code>x</code> from global memory (GPU RAM) into one of its registers, through the SM’s load/store units. This is an ordinary global load, so it passes through the hardware-managed part of the L1, which can keep a copy of the line, as for any other load (the default PTX load, <code>ld.ca</code>, caches at all levels, L1 and L2). ② It then stores that register into its slot of the block’s tile in shared memory. Both hops are instructions in the program: explicit code moves the data.', path: 'copy' },
        { lines: [7, 8], label: 'barrier', why: '<b><code>__syncthreads()</code>.</b> Every thread of the block waits until all 256 copies are done, so the tile is complete before anyone reads it.', path: 'none' },
        { lines: [9, 10], label: 'ordinary load', why: '<b>An ordinary load.</b> <code>scale[0]</code> is loaded the same way as <code>x[i]</code> was, but this time no store copies it into shared memory: the program just uses the register. The part of the L1 outside the carve-out caches it automatically, as a CPU cache would: the first load fetches it from GPU RAM, and later loads of it hit in L1. That is why the GPU L1 is only <b>mostly</b> programmer-managed.', path: 'cached' },
        { lines: [11, 12], label: 'reuse', why: '<b>Reuse.</b> Thread <i>i</i> reads the element that thread 255 − <i>i</i> loaded (the crossing lines), straight from shared memory: about an order of magnitude slower than a register, but far faster than going back to GPU RAM. Without the tile, each thread would have to load that element from global memory itself.', path: 'reuse' },
      ],
    };
    function draw(w) {
      pic.innerHTML = '';
      const s = STEPS[st.mode][st.step];
      const H = 262;
      const svg = svgRoot(pic, w, H, 'Data movement between cores, L1 and RAM for the selected step.');
      const cpu = st.mode === 'cpu';
      const bx = 8, bw = w - 16;
      const coreY = 10, l1Y = 92, ramY = 204;
      const thW = (bw - 20) / 16;
      const thX = (k) => bx + 10 + k * thW;
      R(svg, bx, coreY, bw, 46, `fill:${cpu ? 'var(--host-a)' : 'var(--core-a)'};stroke:${cpu ? 'var(--host)' : 'var(--core)'}`, { rx: 8 });
      Tx(svg, bx + 10, coreY + 18, cpu ? 'CPU core' : (w < 420 ? 'SM · threads, registers' : 'SM · threads of one block, with their registers'), { fs: 11, fill: 'var(--ink)', fw: 600 });
      const busy = ['copy', 'cached', 'reuse'].includes(s.path);
      if (!cpu) for (let k = 0; k < 16; k++) R(svg, thX(k), coreY + 26, thW - 3, 12, `fill:var(--core);opacity:${busy ? 0.85 : 0.4}`, { rx: 2 });
      else Tx(svg, bx + 10, coreY + 36, 'registers', { fs: 10, fill: 'var(--ink-3)' });
      // L1
      R(svg, bx, l1Y, bw, 70, 'fill:rgba(111,166,255,.07);stroke:var(--memory)', { rx: 8 });
      const l1t = Tx(svg, bx + 10, l1Y + 16, cpu ? 'L1 cache · hardware-managed' : 'L1 data cache', { fs: 10.5, fill: 'var(--memory)', fw: 600 });
      const tx0 = bx + 34, tw = bw * 0.6, tY = l1Y + 26, tH = 34;
      const hcX = tx0 + tw + 8, hcW = bx + bw - 10 - hcX;
      if (cpu) {
        for (let k = 0; k < 8; k++) {
          const lx = bx + 10 + k * ((bw - 20) / 8);
          const filled = k === 0 || (st.step === 2 && k < 7);
          const evicting = st.step === 2 && k === 7;
          R(svg, lx, l1Y + 26, (bw - 20) / 8 - 4, 34, evicting ? 'fill:var(--danger-a);stroke:var(--danger);stroke-dasharray:3 2' : filled ? 'fill:var(--memory-a);stroke:var(--memory)' : 'fill:none;stroke:var(--line-2)', { rx: 3 });
          if (k === 0 && st.step < 2 && (bw - 20) / 8 > 46) Tx(svg, lx + ((bw - 20) / 8 - 4) / 2, l1Y + 47, 'x[0..15]', { fs: 10, fill: 'var(--ink)', anchor: 'middle' });
          if (evicting) Tx(svg, lx + ((bw - 20) / 8 - 4) / 2, l1Y + 47, 'out', { fs: 10, fill: 'var(--danger)', anchor: 'middle' });
        }
      } else {
        const full = st.step >= 2 || s.path === 'copy';
        R(svg, tx0, tY, tw, tH, `fill:${full ? 'var(--memory-a)' : 'none'};stroke:var(--memory);stroke-dasharray:${st.step === 0 ? '4 3' : 'none'}`, { rx: 3 });
        if (full) for (let k = 1; k < 16; k++) L(svg, tx0 + (k * tw) / 16, tY + 2, tx0 + (k * tw) / 16, tY + tH - 2, 'stroke:rgba(111,166,255,.35)');
        const tLab = st.step === 0 ? 'tile[256] · reserved, empty' : 'tile[256] · shared memory';
        const lt = Tx(svg, tx0 + tw / 2, tY + tH / 2 + 4, w < 420 ? 'tile[256]' : tLab, { fs: 10, fill: 'var(--ink)', anchor: 'middle' });
        lt.setAttribute('style', lt.getAttribute('style') + 'paint-order:stroke;stroke:rgba(11,12,18,.85);stroke-width:3px;');
        const hcOn = s.path === 'cached' || s.path === 'copy' || st.step > 3;
        R(svg, hcX, tY, hcW, tH, hcOn ? 'fill:var(--memory-a);stroke:var(--memory)' : 'fill:none;stroke:var(--line-2)', { rx: 3 });
        Tx(svg, hcX + hcW / 2, tY + tH / 2 + 4, st.step >= 3 ? (hcW > 80 ? 'scale[0] cached' : 'cached') : (hcW > 60 ? 'hw cache' : 'cache'), { fs: 10, fill: hcOn ? 'var(--memory)' : 'var(--ink-3)', anchor: 'middle' });
        if (hcW > 60 && st.step < 3 && s.path !== 'copy') Tx(svg, hcX + hcW / 2, tY - 4, 'rest of L1', { fs: 10, fill: 'var(--ink-3)', anchor: 'middle' });
      }
      // RAM: memory, so memory blue
      R(svg, bx, ramY, bw, 40, 'fill:rgba(111,166,255,.05);stroke:var(--memory)', { rx: 8 });
      Tx(svg, bx + 10, ramY + 24, cpu ? 'RAM (DDR)' : 'GPU RAM · global memory', { fs: 10.5, fill: 'var(--memory)', fw: 600 });
      const arrow = (x, y1, y2, col, lab, labLeft) => {
        L(svg, x, y1, x, y2 + (y2 > y1 ? -6 : 6), `stroke:${col};stroke-width:2`);
        arrowHead(svg, x, y2, y2 > y1 ? 'd' : 'u', 7, col);
        if (lab) Tx(svg, labLeft ? x - 8 : x + 8, (y1 + y2) / 2 + 4, lab, { fs: 10, fill: col, anchor: labLeft ? 'end' : 'start' });
      };
      const gpuLoad = 'var(--special)';
      if (cpu) {
        if (s.path === 'ram-l1') arrow(bx + bw * 0.3, ramY - 2, l1Y + 72, 'var(--host)', 'line fill (automatic)');
        if (s.path === 'l1-core') arrow(bx + bw * 0.3, l1Y - 2, coreY + 48, 'var(--host)', 'hit');
        if (s.path === 'evict') { const ex = bx + bw * 0.8; arrow(ex, l1Y + 72, ramY - 2, 'var(--danger)', w < 420 ? 'evict (hw picks)' : 'evict (hardware picks)', true); }
      } else if (s.path === 'copy') {
        // hop 1: GPU RAM → registers, an ordinary global load, so it goes through the hardware-managed part of the L1; hop 2: registers → the tile
        const cx = hcX + hcW / 2;
        arrow(cx, ramY - 2, tY + tH + 2, gpuLoad, '');
        arrow(cx, tY - 2, coreY + 48, gpuLoad, '');
        Tx(svg, cx - 8, ramY - 14, w < 420 ? '① load, via L1 → registers' : '① ld.global: GPU RAM → L1 → registers', { fs: 10, fill: gpuLoad, anchor: 'end' });
        arrow(tx0 + tw * 0.5, coreY + 48, tY - 2, gpuLoad, '');
        Tx(svg, tx0 + tw * 0.5 + 8, coreY + 64, w < 420 ? '② store → tile' : '② st.shared: registers → tile', { fs: 10, fill: gpuLoad });
      } else if (s.path === 'cached') {
        const cx = hcX + hcW / 2;
        arrow(cx, ramY - 2, tY + tH + 2, 'var(--memory)', '');
        arrow(cx, tY - 2, coreY + 48, 'var(--memory)', '');
        Tx(svg, cx - 8, ramY - 14, w < 420 ? 'fill (automatic)' : 'first load fills the line (automatic)', { fs: 10, fill: 'var(--memory)', anchor: 'end' });
      } else if (s.path === 'reuse') {
        // thread i reads the element thread 255 - i stored: the lines cross
        for (let k = 0; k < 16; k++) {
          const xa = tx0 + ((k + 0.5) * tw) / 16, xb = thX(15 - k) + (thW - 3) / 2;
          L(svg, xa, tY, xb, coreY + 38, 'stroke:var(--memory);stroke-width:1.2;opacity:.75');
        }
        // keep the L1 label readable above the lines
        svg.appendChild(l1t);
        l1t.setAttribute('style', l1t.getAttribute('style') + 'paint-order:stroke;stroke:#0b0c12;stroke-width:4px;');
        Tx(svg, bx + bw - 10, ramY - 14, w < 420 ? 'thread i ← element of 255 − i' : 'the lines cross: thread i reads the element of thread 255 − i', { fs: 10, fill: 'var(--memory)', anchor: 'end' });
      }
      if (!cpu && st.step === 2) { L(svg, bx + 6, coreY + 52, bx + bw - 6, coreY + 52, 'stroke:var(--control);stroke-width:2;stroke-dasharray:5 3'); Tx(svg, bx + bw - 8, coreY + 68, 'barrier: all 256 threads wait', { fs: 10, fill: 'var(--control)', anchor: 'end' }); }
    }
    function build() {
      codeBox.innerHTML = '';
      code = GG.code(codeBox, { lang: st.mode === 'cpu' ? 'cpp' : 'cuda', code: st.mode === 'cpu' ? CPU_CODE : GPU_CODE, caption: st.mode === 'cpu' ? 'C, on a CPU' : 'CUDA C, on a GPU' });
      if (stepper) stepper.el.remove();
      stepper = GG.ui.stepper(f.controls, { label: 'Step', steps: STEPS[st.mode], onStep: (i) => { st.step = i; update(); } });
    }
    function update() {
      const s = STEPS[st.mode][st.step];
      code.clear();
      code.highlight(s.lines, st.mode === 'cpu' ? null : 'memory');
      draw(lastW);
      f.setWhy(s.why);
    }
    GG.ui.seg(f.controls, { label: 'Machine', options: [{ value: 'cpu', label: 'CPU L1' }, { value: 'gpu', label: 'GPU L1' }], value: st.mode, onChange: (v) => { st.mode = v; st.step = 0; build(); update(); } });
    build();
    onWidth(grid, (w) => { grid.classList.toggle('two', w >= 720); requestAnimationFrame(() => { lastW = Math.floor(pic.getBoundingClientRect().width) || w; update(); }); });
    return f;
  }

  GG.entry('l1-data-cache', {
    render(body, ctx) {
      const s = ctx.html(body, `
<p>The <strong>L1 data cache</strong> is the private memory of the ${T('streaming-multiprocessor', 'Streaming Multiprocessor')} (SM). Each SM has its own, and ordinarily only the threads running on that SM use it. (Since compute capability 9.0 there is one exception: blocks of a thread block cluster can reach the shared memory of other blocks in the cluster, on other SMs; see ${T('graphics-processing-cluster', 'GPC')}.) “L1” means level 1: the first stop on the way out from the ${T('register-file', 'registers')} toward ${T('gpu-ram', 'GPU RAM')}.</p>
<div data-slot="sm"></div>
<h3>Partitioned among thread blocks</h3>
<p>Each SM partitions that memory among the ${T('thread-block', 'groups of threads')} scheduled onto it. The part a block gets is what CUDA calls its ${T('shared-memory', 'shared memory')}: every thread of that block can read and write it. Ordinarily nobody else can; since compute capability 9.0, blocks of the same thread block cluster can also reach it over the SM-to-SM network (distributed shared memory, see ${T('graphics-processing-cluster', 'GPC')}). Because blocks are placed on SMs whole, a block's shared memory is always in the L1 of the SM its threads are running on. Fig.&nbsp;2 shows the trade-off: the more shared memory each block asks for, the fewer blocks fit on the SM at once.</p>
<div data-slot="part"></div>
<h3>Close to the cores, built from SRAM</h3>
<p>The L1 data cache is co-located with, and only about an order of magnitude slower than, the components that effect computations, e.g. the ${T('cuda-core', 'CUDA Cores')}. It sits on the same piece of silicon, inside the SM, a short wire away from the cores; ${T('gpu-ram', 'GPU RAM')} is on separate chips. Fig.&nbsp;3 puts an L1 hit on that scale, next to a register read and to what a miss costs.</p>
<div data-slot="race"></div>
<p>It is implemented with <b>SRAM</b> (static random access memory), the same basic semiconductor cell used in CPU caches and registers and in the <a href="https://groq.com/wp-content/uploads/2023/05/GroqISCAPaper2022_ASoftwareDefinedTensorStreamingMultiprocessorForLargeScaleMachineLearning-1.pdf">memory subsystem of Groq LPUs</a>. An SRAM cell holds its bit in a small loop of transistors that keeps it stable for as long as power is on, so it can be read quickly and never needs refreshing. That speed costs area: an SRAM bit is much bigger than a DRAM bit, which is why per-SM memories are measured in kibibytes (and the whole chip's L2 cache in megabytes) while ${T('gpu-ram', 'GPU RAM')} is measured in gibibytes (see the cell comparison there).</p>
${GG.noteHTML('aside', '<p>Groq’s LPU (language processing unit) is the extreme case: the linked ISCA 2022 paper describes a chip whose working memory is a large on-chip SRAM rather than attached DRAM. It trades capacity for speed, the same trade-off that sets the size of an SM’s L1.</p>')}
<p>The L1 data cache is accessed by the ${T('load-store-unit', 'Load/Store Units')} of the ${T('streaming-multiprocessor', 'SM')}: when a warp executes a load or store, the LSUs carry the request to the L1. Turn on “Show the traffic” in Fig.&nbsp;1 to see that leg. Data the L1 does not hold comes from further out, ultimately ${T('gpu-ram', 'GPU RAM')}; Fig.&nbsp;4 draws that trip, Fig.&nbsp;3 shows how much longer it takes, and ${T('gpu-ram', 'GPU RAM')}'s Fig.&nbsp;5 races the loads.</p>
<h3>Mostly programmer-managed</h3>
<p>CPUs also maintain an L1 cache. In CPUs, that cache is fully hardware-managed: the program reads and writes memory addresses, and the hardware silently decides what to keep close. In GPUs that cache is mostly programmer-managed, even in high-level languages like ${T('cuda-c', 'CUDA C')}: the programmer declares shared memory, copies data into it, synchronizes, and reuses it. Compare the two in Fig.&nbsp;4.</p>
<div data-slot="mg"></div>
<h3>How much</h3>
<p>Each L1 data cache in each of an H100's SMs can store 256 KiB (2,097,152 bits). Across the 132 SMs in an H100 SXM 5, that's 33 MiB of cache space.</p>
<div data-slot="nums"></div>
${GG.noteHTML('check', `<p><b>The bit count for the whole GPU.</b> 256 KiB = 256 × 1,024 bytes × 8 bits = <b>2,097,152 bits</b> per SM, as the glossary says. Across 132 SMs: 132 × 256 KiB = 33,792 KiB = <b>33 MiB</b>, also as the glossary says. But 33 MiB is 33 × 1,048,576 × 8 = <b>276,824,064 bits</b>; the glossary gives 242,221,056 bits, which is 132 × 224 KiB. The 33 MiB figure is the right one.</p>`)}
<div data-slot="read"></div>`);
      guard(s.sm, 'Fig. 1', () => smHighlightFigure(s.sm, ctx, {
        title: 'The L1 data cache in an H100 SM',
        keys: ['l1d'],
        caption: `The internal architecture of an H100 SM, redrawn from NVIDIA's <a href="https://modal-cdn.com/gpu-glossary/gtc22-whitepaper-hopper.pdf">H100 white paper</a> as modified by the glossary. The L1 data cache is depicted in light blue: one 256 KiB block shared by all four sub-partitions. Its accesses come from the load/store units (pink) of each sub-partition.`,
        whySM: `The <b>L1 data cache / shared memory</b> is one 256 KiB block of SRAM per SM, below the four sub-partitions. Every warp on the SM reaches it through its sub-partition's load/store units.`,
        whySub: 'One sub-partition, with the SM-wide blocks as strips: its 8 load/store units carry its warps’ loads and stores to the shared L1 data cache below.',
        extra: (f, getSm, baseWhy) => {
          let stop = null, playB = null;
          const TRAFFIC = '<b>Loads and stores</b> leave each sub-partition through its <b>load/store units</b> and arrive at the shared L1 data cache. Data comes back the same way, into the registers of the warp that asked.';
          const apply = (on) => {
            const sm = getSm();
            if (stop) { try { stop(); } catch (e) { /* the old drawing is gone */ } stop = null; }
            if (on) {
              sm.highlight(['l1d', 'ldst']);
              // under reduced motion the component draws the route statically; the Play button sets it moving
              stop = sm.flow('ldst', 'l1d', { color: 'memory' });
              f.setWhy(TRAFFIC);
            } else { sm.highlight(['l1d']); f.setWhy(baseWhy()); }
            if (playB) { playB.hidden = !on; playB.setLabel('Play the traffic', 'play'); }
          };
          const tg = GG.ui.toggle(f.controls, { label: 'Show the traffic', value: false, onChange: apply });
          if (GG.reducedMotion) {
            playB = GG.ui.button(f.controls, { label: 'Play the traffic', icon: 'play', onClick: () => {
              if (!stop) return;
              if (stop.running) { stop.pause(); playB.setLabel('Play the traffic', 'play'); } else { stop.play(); playB.setLabel('Pause', 'pause'); }
            } });
            playB.hidden = true;
          }
          return { rebuilt: () => { if (!tg.get()) return false; stop = null; apply(true); return true; } };
        },
      }));
      guard(s.part, 'Fig. 2', () => smemPartitionFigure(s.part, ctx));
      guard(s.race, 'Fig. 3', () => ladderFigure(s.race, ctx, {
        title: 'An L1 hit, and what a miss costs',
        focus: 'l1',
        caption: LADDER_CAPTION,
        why: {
          rf: `<b>Register file: 1 unit</b>, a tenth of an L1 hit. A value already in a register is one a core can use right away.`,
          l1: `<b>An L1 hit: about 10 units.</b> When the data is already in the L1, the load comes back in about ten register-access times: an order of magnitude slower than the cores, but on the same piece of silicon, inside the SM. Pick the L2 or GPU RAM to see what a miss costs.`,
          l2: `<b>An L1 miss that hits in the L2: about 65 units</b>, about 6.5 times an L1 hit (measured on a Hopper GPU; beyond the glossary). The L2 is outside the SM and shared by all of them.`,
          ram: `<b>A miss in both caches: about 120 units</b>, about 12 times an L1 hit (measured on a Hopper GPU; beyond the glossary): the load leaves the chip for GPU RAM. Keeping reused data in the L1, whether the programmer stages it in shared memory or the cache keeps it, saves that trip (Fig.&nbsp;4).`,
        },
      }));
      guard(s.mg, 'Fig. 4', () => managedFigure(s.mg, ctx));
      guard(s.nums, 'numbers', () => ctx.numbers(s.nums, [
        { value: '256 KiB', label: 'L1 data cache per H100 SM', tone: 'memory' },
        { value: '2,097,152', label: 'bits per SM: 256 × 1,024 × 8', tone: 'memory' },
        { value: '33 MiB', label: 'across 132 SMs of an H100 SXM', tone: 'memory' },
        { value: '276,824,064', label: 'bits across 132 SMs (see the check below)', tone: 'control' },
      ]));
      ctx.reading(s.read, [
        { href: 'https://modal-cdn.com/gpu-glossary/gtc22-whitepaper-hopper.pdf', label: 'NVIDIA H100 Tensor Core GPU Architecture whitepaper', note: 'the SM diagram (Fig. 1) and the combined L1 / shared memory' },
        { href: 'https://groq.com/wp-content/uploads/2023/05/GroqISCAPaper2022_ASoftwareDefinedTensorStreamingMultiprocessorForLargeScaleMachineLearning-1.pdf', label: 'Groq, “A Software-defined Tensor Streaming Multiprocessor for Large-scale Machine Learning” (ISCA 2022)', note: 'an SRAM-based memory subsystem' },
        { href: 'https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html', label: 'NVIDIA CUDA C++ Programming Guide', note: 'shared memory carve-out sizes for compute capability 9.0 (Beyond the glossary)' },
      ]);
    },
  });

  /* ═════════════════════════════ Tensor Memory ═════════════════════════════ */

  GG.css(`
.hwc-op { display: grid; gap: 12px; }
.hwc-op-eq { display: flex; align-items: baseline; justify-content: center; gap: 10px; font: 600 26px/1 var(--font-mono); color: var(--ink); padding: 4px 0 2px; }
.hwc-op-eq span { padding: 2px 8px 4px; border-radius: 8px; transition: background 0.2s, color 0.2s; }
.hwc-op-eq span.ok { background: var(--core-a); box-shadow: inset 0 0 0 1px rgba(69, 212, 155, 0.5); }
.hwc-op-eq span.bad { background: var(--danger-a); box-shadow: inset 0 0 0 1px rgba(255, 91, 110, 0.5); }
/* operand identity, the key used by the Tensor Core and warpgroup figures: A pink, B blue, D amber */
.hwc-op-eq span[data-op="A"], .hwc-chip[data-op="A"] { color: var(--special); }
.hwc-op-eq span[data-op="B"], .hwc-chip[data-op="B"] { color: var(--memory); }
.hwc-op-eq span[data-op="D"], .hwc-chip[data-op="D"] { color: var(--control); }
.hwc-op-eq em { font-style: normal; color: var(--ink-3); font-weight: 500; }
.hwc-op-tc { margin: 0 auto; width: min(100%, 520px); text-align: center; padding: 8px 10px; border-radius: 10px; border: 1px solid var(--core); background: var(--core-a); color: var(--core); font: 600 12px/1.3 var(--font-mono); letter-spacing: 0.06em; }
.hwc-op-wires { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; height: 34px; }
.hwc-op-wires div { position: relative; }
.hwc-op-wires div::before { content: ""; position: absolute; left: 50%; top: 0; bottom: 0; transform: translateX(-50%); }
.hwc-op-wires .w-tm::before { width: 8px; background: var(--memory); border-radius: 3px; opacity: 0.85; }
.hwc-op-wires .w-sm::before { width: 3px; background: repeating-linear-gradient(var(--memory) 0 6px, transparent 6px 9px); opacity: 0.85; }
/* no wire to the registers: a short stub that stops at a cross */
.hwc-op-wires .w-rf::before { width: 2px; bottom: auto; height: 9px; background: var(--danger); opacity: 0.6; }
.hwc-op-wires .w-rf::after { content: "×"; position: absolute; left: 50%; top: 8px; transform: translateX(-50%); color: var(--danger); font: 700 15px/1 var(--font-mono); }
.hwc-op-wires span { position: absolute; left: calc(50% + 10px); top: 8px; font: 500 10px/1.2 var(--font-mono); color: var(--ink-3); white-space: nowrap; }
.hwc-op-zones { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.hwc-zone { position: relative; min-height: 148px; border-radius: 12px; border: 1.5px dashed var(--line-2); background: rgba(8, 9, 14, 0.5); padding: 10px 10px 12px; display: flex; flex-direction: column; gap: 8px; cursor: pointer; text-align: left; color: inherit; font: inherit; transition: border-color 0.2s, background 0.2s; }
.hwc-zone:hover { border-color: var(--ink-3); }
.hwc-zone.target { border-color: var(--accent); background: var(--accent-a); }
.hwc-zone.armed { border-style: solid; border-color: var(--ink-3); }
.hwc-zone-h { font: 600 12px/1.25 var(--font-mono); color: var(--memory); }
.hwc-zone-h small { display: block; font: 500 10px/1.35 var(--font-mono); color: var(--ink-3); margin-top: 3px; }
.hwc-zone-b { display: flex; flex-wrap: wrap; gap: 8px; align-items: flex-start; }
.hwc-chip { touch-action: none; user-select: none; -webkit-user-select: none; display: inline-flex; flex-direction: column; align-items: flex-start; gap: 2px; min-width: 64px; padding: 7px 10px 6px; border-radius: 9px; border: 1.5px solid var(--line-2); background: var(--surface-2); color: var(--ink); cursor: grab; font: 600 17px/1 var(--font-mono); position: relative; z-index: 1; transition: border-color 0.15s, box-shadow 0.15s; }
.hwc-chip small { font: 500 10px/1.2 var(--font-mono); color: var(--ink-3); letter-spacing: 0.02em; }
.hwc-chip[data-op="A"] { border-color: var(--special); background: var(--special-a); }
.hwc-chip[data-op="B"] { border-color: var(--memory); background: var(--memory-a); }
.hwc-chip[data-op="D"] { border-color: var(--control); background: var(--control-a); }
.hwc-chip[aria-pressed="true"] { box-shadow: 0 0 0 3px var(--accent); }
.hwc-chip.drag { cursor: grabbing; z-index: 5; box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6); transition: none; }
.hwc-chip .st { position: absolute; top: -7px; right: -7px; width: 17px; height: 17px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font: 700 10px/1 var(--font-mono); }
.hwc-chip.ok .st { background: var(--core); color: #06140d; }
.hwc-chip.bad .st { background: var(--danger); color: #1a0508; }
.hwc-op-res { display: grid; gap: 6px; }
.hwc-op-res div { display: grid; grid-template-columns: 22px minmax(0, 1fr); gap: 8px; align-items: start; font-size: 14px; line-height: 1.5; color: var(--ink-2); }
.hwc-op-res div b { color: var(--ink); }
.hwc-op-res i.ic { font-style: normal; width: 18px; height: 18px; margin-top: 2px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font: 700 11px/1 var(--font-mono); }
.hwc-op-res i.ic.ok { background: var(--core-a); color: var(--core); box-shadow: inset 0 0 0 1px rgba(69, 212, 155, 0.5); }
.hwc-op-res i.ic.bad { background: var(--danger-a); color: var(--danger); box-shadow: inset 0 0 0 1px rgba(255, 91, 110, 0.5); }
@media (max-width: 560px) {
  .hwc-op-zones, .hwc-op-wires { gap: 6px; }
  .hwc-zone { padding: 8px 6px 10px; min-height: 160px; }
  .hwc-chip { min-width: 0; padding: 6px 7px 5px; font-size: 15px; }
  .hwc-chip small { font-size: 10px; }
  .hwc-op-wires span { display: none; }
  .hwc-op-eq { font-size: 22px; }
}
`);

  const TM_ZONES = [
    { k: 'tmem', name: 'Tensor Memory', sub: 'next to the Tensor Cores', wire: 'w-tm', wireLab: 'short, wide' },
    { k: 'smem', name: 'Shared memory', sub: 'in the L1 data cache', wire: 'w-sm', wireLab: 'via descriptors' },
    { k: 'regs', name: 'Registers', sub: 'in the register file', wire: 'w-rf', wireLab: 'no path' },
  ];
  const TM_OPS = { D: 'accumulator', A: 'left-hand tile', B: 'right-hand tile' };
  function tmVerdict(op, z) {
    if (op === 'D') {
      if (z === 'tmem') return [true, '<b>D in Tensor Memory: required.</b> The accumulator is read and written on every step of a matmul, far more often than any input tile, so it gets the specialized memory with the shortest, simplest wiring to the Tensor Cores.'];
      if (z === 'smem') return [false, '<b>D cannot be in shared memory.</b> For <code>tcgen05.mma</code> the accumulator <i>must</i> be in Tensor Memory.'];
      return [false, '<b>D cannot be in registers.</b> <code>tcgen05.mma</code> never reads or writes registers; none of its matrices live there. (Hopper’s <code>wgmma</code> did keep D in registers.)'];
    }
    if (op === 'A') {
      if (z === 'tmem') return [true, '<b>A in Tensor Memory: allowed.</b> The left-hand matrix <i>may</i> be in Tensor Memory, for example a tile that an earlier step left there.'];
      if (z === 'smem') return [true, '<b>A in shared memory: allowed.</b> The usual case: a tile the TMA just loaded, described to the Tensor Core by a shared memory descriptor.'];
      return [false, '<b>A cannot be in registers.</b> Neither input of a <code>tcgen05.mma</code> comes from registers.'];
    }
    if (z === 'smem') return [true, '<b>B in shared memory: required.</b> The right-hand matrix <i>must</i> be in shared memory.'];
    if (z === 'tmem') return [false, '<b>B cannot be in Tensor Memory.</b> Only A has that option; B must be in shared memory, not Tensor Memory.'];
    return [false, '<b>B cannot be in registers.</b> Neither input of a <code>tcgen05.mma</code> comes from registers.'];
  }

  function operandFigure(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Place the operands of tcgen05.mma: D += A @ B',
      hint: 'drag, or tap a chip then a zone',
      wide: true,
      caption: `Each chip is one operand of a single ${T('tensor-core', 'Tensor Core')} matrix multiply-accumulate. Drag it to a memory (or tap it, then tap a memory; with a keyboard, focus a chip and press ← →). The wires drawn above the zones are schematic: Tensor Memory sits on a short, wide path to the Tensor Cores; shared memory operands are named by descriptors; registers have no path at all for <code>tcgen05.mma</code>. The <code>wgmma</code> comparison is Hopper context beyond the glossary.`,
    });
    const st = { D: 'tmem', A: 'smem', B: 'smem', sel: null };
    const root = el('div', { class: 'hwc-op' });
    f.stage.append(root);
    const eq = el('div', { class: 'hwc-op-eq', 'aria-live': 'polite' });
    const tc = el('div', { class: 'hwc-op-tc', text: 'Tensor Core · 5th generation (Blackwell)' });
    const wires = el('div', { class: 'hwc-op-wires', 'aria-hidden': 'true' });
    const zonesEl = el('div', { class: 'hwc-op-zones' });
    const res = el('div', { class: 'hwc-op-res' });
    const ptx = el('div', { class: 'hwc-ptx' });
    root.append(eq, tc, wires, zonesEl, res, ptx);
    const zones = {};
    TM_ZONES.forEach((z) => {
      const w = el('div', { class: z.wire }); w.append(el('span', { text: z.wireLab })); wires.append(w);
      const zb = el('div', { class: 'hwc-zone', role: 'button', tabindex: '0', 'aria-label': `Place the selected operand in ${z.name}`, 'data-zone': z.k });
      zb.innerHTML = `<div class="hwc-zone-h">${z.name}<small>${z.sub}</small></div>`;
      const b = el('div', { class: 'hwc-zone-b' });
      zb.append(b);
      zb.addEventListener('click', (e) => { if (e.target.closest('.hwc-chip')) return; if (st.sel) { st[st.sel] = z.k; st.sel = null; render(); } });
      zb.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && st.sel) { e.preventDefault(); st[st.sel] = z.k; st.sel = null; render(); } });
      zonesEl.append(zb);
      zones[z.k] = { zb, b };
    });
    const chips = {};
    ['D', 'A', 'B'].forEach((op) => {
      const c = el('button', { type: 'button', class: 'hwc-chip', 'data-op': op, 'data-keys': '', 'aria-pressed': 'false' });
      c.innerHTML = `${op}<small>${TM_OPS[op]}</small><span class="st"></span>`;
      chips[op] = c;
      let drag = null, moved = false;
      c.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        drag = { x: e.clientX, y: e.clientY, id: e.pointerId };
        moved = false;
        try { c.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      });
      c.addEventListener('pointermove', (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (!moved && Math.hypot(dx, dy) < 5) return;
        moved = true;
        c.classList.add('drag');
        c.style.transform = `translate(${dx}px, ${dy}px)`;
        const z = zoneAt(e.clientX, e.clientY);
        Object.values(zones).forEach((zz) => zz.zb.classList.toggle('target', zz.zb === (z && zones[z].zb)));
      });
      const end = (e) => {
        if (!drag) return;
        const wasMoved = moved;
        drag = null;
        c.classList.remove('drag');
        c.style.transform = '';
        Object.values(zones).forEach((zz) => zz.zb.classList.remove('target'));
        if (wasMoved && e.type === 'pointerup') {
          const z = zoneAt(e.clientX, e.clientY);
          if (z) { st[op] = z; st.sel = null; render(); setTimeout(() => chips[op].focus({ preventScroll: true }), 0); }
          c._suppress = true;
        }
      };
      c.addEventListener('pointerup', end);
      c.addEventListener('pointercancel', end);
      c.addEventListener('click', (e) => {
        e.stopPropagation();
        if (c._suppress) { c._suppress = false; return; }
        st.sel = st.sel === op ? null : op;
        render();
      });
      c.addEventListener('keydown', (e) => {
        const order = TM_ZONES.map((z) => z.k);
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const i = order.indexOf(st[op]);
          st[op] = order[(i + (e.key === 'ArrowRight' ? 1 : -1) + 3) % 3];
          render();
          chips[op].focus({ preventScroll: true });
        }
      });
    });
    function zoneAt(x, y) {
      for (const k in zones) { const r = zones[k].zb.getBoundingClientRect(); if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return k; }
      return null;
    }
    function render() {
      const v = {};
      ['D', 'A', 'B'].forEach((op) => { v[op] = tmVerdict(op, st[op]); });
      // moving a chip to another zone detaches it, which drops keyboard focus: put focus back afterwards
      const had = Object.keys(chips).find((op) => chips[op] === document.activeElement);
      ['D', 'A', 'B'].forEach((op) => {
        const c = chips[op];
        if (c.parentNode !== zones[st[op]].b) zones[st[op]].b.append(c);
        c.classList.toggle('ok', v[op][0]);
        c.classList.toggle('bad', !v[op][0]);
        c.querySelector('.st').textContent = v[op][0] ? '✓' : '✗';
        c.setAttribute('aria-pressed', String(st.sel === op));
        c.setAttribute('aria-label', `${op}, the ${TM_OPS[op]}, in ${TM_ZONES.find((z) => z.k === st[op]).name}: ${v[op][0] ? 'allowed' : 'not allowed'}. Arrow keys move it.`);
      });
      if (had && document.activeElement !== chips[had]) chips[had].focus({ preventScroll: true });
      Object.values(zones).forEach((zz) => zz.zb.classList.toggle('armed', !!st.sel));
      const cls = (op) => (v[op][0] ? 'ok' : 'bad');
      eq.innerHTML = `<span class="${cls('D')}" data-op="D">D</span><em>+=</em><span class="${cls('A')}" data-op="A">A</span><em>@</em><span class="${cls('B')}" data-op="B">B</span>`;
      res.innerHTML = ['D', 'A', 'B'].map((op) => `<div><i class="ic ${cls(op)}">${v[op][0] ? '✓' : '✗'}</i><span>${v[op][1]}</span></div>`).join('');
      const legal = v.D[0] && v.A[0] && v.B[0];
      if (legal) {
        ptx.innerHTML = `<span class="k">tcgen05.mma</span><span class="d">.cta_group::1.kind::f16</span> [<span class="r">d_tmem</span>], ${st.A === 'tmem' ? '[<span class="r">a_tmem</span>]' : '<span class="r">a_desc</span>'}, <span class="r">b_desc</span>, <span class="r">idesc</span>, <span class="r">enable_input_d</span>;  <span class="c">// [x] = a Tensor Memory address, *_desc = a shared memory descriptor</span>`;
        f.setWhy(`<b class="hwc-ok">Legal.</b> D is in Tensor Memory, A in ${st.A === 'tmem' ? 'Tensor Memory' : 'shared memory'}, B in shared memory, and nothing in registers: exactly the placements <code>tcgen05.mma</code> accepts (the rule for <code>.kind::f16</code> and the other kinds without block scaling; block-scaled kinds also need their scale factors in Tensor Memory). Complex, but not arbitrary: the most frequently touched matrix, the accumulator, is the one with the specialized home.`);
      } else {
        const bad = ['D', 'A', 'B'].filter((op) => !v[op][0]);
        ptx.innerHTML = `<span class="c">// no tcgen05.mma can be written for this placement (${bad.join(', ')} misplaced)</span>`;
        f.setWhy(`<b class="hwc-bad">Not a legal tcgen05.mma.</b> ${bad.length === 1 ? 'One operand is' : bad.length + ' operands are'} in the wrong place: ${bad.map((op) => `<b>${op}</b>`).join(', ')}. The rules: D <i>must</i> be in Tensor Memory, A <i>may</i> be in Tensor Memory or shared memory, B <i>must</i> be in shared memory, and none of them in registers.`);
      }
    }
    const pres = el('div', { class: 'ctl' }, el('span', { class: 'ctl-lab', text: 'Presets' }));
    const row = el('div', { style: 'display:flex;gap:6px;flex-wrap:wrap' });
    pres.append(row);
    f.controls.append(pres);
    const preset = (D, A, B) => { st.D = D; st.A = A; st.B = B; st.sel = null; render(); };
    GG.ui.button(row, { label: 'A in shared memory', onClick: () => preset('tmem', 'smem', 'smem') });
    GG.ui.button(row, { label: 'A in Tensor Memory', onClick: () => preset('tmem', 'tmem', 'smem') });
    GG.ui.button(row, { label: 'Everything in registers', onClick: () => preset('regs', 'regs', 'regs') });
    GG.ui.button(row, { label: 'Hopper wgmma habit', title: 'D in registers, A and B in shared memory', onClick: () => { preset('regs', 'smem', 'smem'); f.setWhy(f.why.innerHTML + ' <span class="c-dim">This is how Hopper’s <code>wgmma</code> worked: its accumulator lived in registers. Blackwell moved it to Tensor Memory.</span>'); } });
    render();
    return f;
  }

  /* Fig: a warpgroup and the 128 lanes of Tensor Memory. */
  function lanesFigure(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Four warps, 128 lanes: the allowed moves',
      hint: 'pick an operation · pick a warp or a column count',
      wide: true,
      caption: `Tensor Memory drawn as its 128 lanes (rows) by 512 columns of 32-bit cells, 256 KiB per SM; the four ${T('warp', 'warps')} of a ${T('warpgroup')} at the left, the SM's ${T('shared-memory', 'shared memory')} and ${T('tensor-core', 'Tensor Core')} at the right. The lane-and-column geometry, the rule that each warp reaches only its own 32 lanes, column allocation (a power of two from 32 to 512 columns, all 128 lanes of each), who issues each instruction, and the instruction names (<code>tcgen05.alloc</code>, <code>.ld</code>, <code>.st</code>, <code>.cp</code>, <code>.mma</code>) come from NVIDIA's PTX documentation, beyond the glossary. The <code>.mma</code> view assumes a 128 × 256 FP32 accumulator, which needs 256 columns.`,
    });
    const OPS = {
      alloc: { name: 'tcgen05.alloc', what: 'claim columns of Tensor Memory', why: 'Before any of the other moves, the kernel must claim Tensor Memory: <b>one warp</b> of the CTA executes <code>tcgen05.alloc</code> for a number of columns, a power of two from 32 to 512, and gets back the address of the first one. Each column comes with all 128 lanes. The same kernel must free them with <code>tcgen05.dealloc</code> before it exits.' },
      ld: { name: 'tcgen05.ld', what: 'Tensor Memory → registers', why: 'Each warp copies cells from <b>its own 32 lanes</b> of Tensor Memory into its threads’ registers. In the simplest shape, <code>.32x32b</code>, lane <i>i</i> of the quarter goes to thread <i>i</i> of the warp; the other shapes (<code>.16x64b</code>, <code>.16x128b</code>, <code>.16x256b</code>, <code>.16x32bx2</code>) spread 16 lanes across the warp’s threads differently. All four warps together move a full 128-row tile, for example the finished accumulator on its way to post-processing.' },
      st: { name: 'tcgen05.st', what: 'registers → Tensor Memory', why: 'The reverse move: each warp writes values from its registers into its own 32 lanes. The four warps of the warpgroup together cover all 128 lanes.' },
      cp: { name: 'tcgen05.cp', what: 'shared memory → Tensor Memory', why: 'A copy from shared memory into Tensor Memory, for example the scale factors of a block-scaled MMA, or an A tile, put where the next MMA can read them. A <b>single thread</b> issues it, for the whole CTA, and the copy runs asynchronously. Data never goes the other way through this path: there is no Tensor Memory → shared memory copy.' },
      mma: { name: 'tcgen05.mma', what: 'Tensor Core accumulates into Tensor Memory', why: 'A <b>single thread</b> issues the MMA for the whole CTA (unlike Hopper’s <code>wgmma</code>, which a whole warpgroup issues). The Tensor Core reads A (shared or Tensor Memory) and B (shared memory) and adds the product into the accumulator D, which spans all 128 lanes. No registers are involved.' },
    };
    const st = { op: 'ld', warp: 'all', cols: 256 };
    const box = el('div', { class: 'hwc-w' });
    f.stage.append(box);
    const sCap = GG.ui.stat(f.readouts, { label: 'Tensor Memory per SM', value: '256 KiB', tone: 'memory' });
    const sAl = GG.ui.stat(f.readouts, { label: 'Allocated', value: '—', tone: 'memory' });
    const sLanes = GG.ui.stat(f.readouts, { label: 'Lanes touched', value: '—', tone: 'memory' });
    const sWho = GG.ui.stat(f.readouts, { label: 'Who moves the data', value: '—', tone: 'control' });
    void sCap;
    let lastW = 0;
    function draw(w) {
      box.innerHTML = '';
      const narrow = w < 600;
      const op = OPS[st.op];
      const warpsW = narrow ? 64 : 120, rightW = narrow ? 70 : 150, gap = narrow ? 16 : 40;
      const tmX = warpsW + gap, tmW = w - warpsW - rightW - gap * 2;
      const top = 22, laneH = narrow ? 1.6 : 2;
      const tmH = 128 * laneH;
      const H = top + tmH + (narrow ? 58 : 34);
      const svg = svgRoot(box, w, H, `Tensor Memory, 128 lanes by 512 columns, with ${op.name}: ${op.what}.`);
      Tx(svg, tmX, top - 8, narrow ? 'TMEM · 128 lanes × 512 cols' : 'TENSOR MEMORY · 128 lanes × 512 columns × 32 bit', { fs: 10, fill: 'var(--memory)', ls: narrow ? null : '0.06em' });
      R(svg, tmX, top, tmW, tmH, 'fill:rgba(111,166,255,.05);stroke:var(--memory)', { rx: 3 });
      const colX = (c) => tmX + (tmW * c) / 512;
      for (let c = 64; c < 512; c += 64) L(svg, colX(c), top, colX(c), top + tmH, 'stroke:rgba(111,166,255,.12)');
      // the allocation: shown for .alloc and, around D, for .mma
      const showAlloc = st.op === 'alloc' || st.op === 'mma';
      if (showAlloc) {
        R(svg, tmX + 1, top + 1, colX(st.cols) - tmX - 2, tmH - 2, `fill:${st.op === 'alloc' ? 'rgba(111,166,255,.32)' : 'none'};stroke:var(--memory);stroke-width:1.6;stroke-dasharray:5 3`, { rx: 2 });
        const lab = `${st.cols} columns · ${fmt.bytes(st.cols * 128 * 4, 0)}`;
        if (colX(st.cols) - tmX > lab.length * 6.2 + 8) Tx(svg, tmX + 6, top + tmH - 6, lab, { fs: 10, fill: 'var(--ink)', fw: 600 });
      }
      const colsUsed = st.op === 'mma' ? 256 : st.op === 'cp' ? 128 : 64;
      for (let q = 0; q < 4; q++) {
        const y = top + q * 32 * laneH;
        const on = st.warp === 'all' || +st.warp === q;
        const warpOp = st.op === 'ld' || st.op === 'st';
        L(svg, tmX, y, tmX + tmW, y, q ? 'stroke:rgba(111,166,255,.45)' : 'stroke:none');
        if (st.op !== 'alloc' && (!warpOp || on)) {
          const fits = st.op !== 'mma' || st.cols >= 256;
          R(svg, tmX + 1, y + 1, colX(colsUsed) - tmX - 1, 32 * laneH - 2, `fill:${st.op === 'mma' ? (fits ? 'var(--core)' : 'var(--danger)') : 'var(--memory)'};opacity:0.5`, { rx: 2 });
        }
        Tx(svg, tmX + tmW - 4, y + 32 * laneH / 2 + 4, `lanes ${q * 32}–${q * 32 + 31}`, { fs: 10, fill: 'var(--ink-2)', anchor: 'end' });
        const lit = on && warpOp || (st.op === 'alloc' && q === 0);
        R(svg, 2, y + 3, warpsW - 4, 32 * laneH - 6, `fill:${lit ? 'var(--core-a)' : 'var(--surface-2)'};stroke:${lit ? 'var(--core)' : 'var(--line-2)'}`, { rx: 6 });
        Tx(svg, 10, y + 32 * laneH / 2 - 1, `warp ${q}`, { fs: narrow ? 10.5 : 11.5, fill: 'var(--ink)', fw: 600 });
        Tx(svg, 10, y + 32 * laneH / 2 + 13, st.op === 'alloc' && q === 0 ? (narrow ? 'allocs' : 'allocates · frees') : narrow ? '32 thr' : '32 threads · regs', { fs: 10, fill: st.op === 'alloc' && q === 0 ? 'var(--core)' : 'var(--ink-3)' });
        if (warpOp && on) {
          const ay = y + 32 * laneH / 2;
          const x1 = warpsW + 2, x2 = tmX - 2;
          L(svg, x1 + (st.op === 'ld' ? 6 : 0), ay, x2 - (st.op === 'st' ? 6 : 0), ay, 'stroke:var(--memory);stroke-width:2');
          arrowHead(svg, st.op === 'ld' ? x1 : x2, ay, st.op === 'ld' ? 'l' : 'r', 7, 'var(--memory)');
        }
      }
      if (st.op === 'alloc') {
        const ay = top + 16 * laneH;
        L(svg, warpsW + 2, ay, tmX - 8, ay, 'stroke:var(--core);stroke-width:1.6;stroke-dasharray:4 3');
        arrowHead(svg, tmX - 2, ay, 'r', 6, 'var(--core)');
      }
      // right side: shared memory + tensor core
      const rx = tmX + tmW + gap;
      const smY = top, smH = tmH * 0.42, tcY = top + tmH * 0.58, tcH = tmH * 0.42;
      R(svg, rx, smY, rightW - 2, smH, `fill:${st.op === 'cp' ? 'var(--memory-a)' : 'rgba(255,255,255,.03)'};stroke:${st.op === 'cp' || st.op === 'mma' ? 'var(--memory)' : 'var(--line-2)'}`, { rx: 6 });
      wrap('shared memory', rightW - 14, narrow ? 6.2 : 6.6).forEach((ln, i) => Tx(svg, rx + 7, smY + 18 + i * 13, ln, { fs: narrow ? 10 : 11, fill: 'var(--memory)', fw: 600 }));
      R(svg, rx, tcY, rightW - 2, tcH, `fill:${st.op === 'mma' ? 'var(--core-a)' : 'rgba(255,255,255,.03)'};stroke:${st.op === 'mma' ? 'var(--core)' : 'var(--line-2)'}`, { rx: 6 });
      wrap('Tensor Core', rightW - 14, narrow ? 6.2 : 6.6).forEach((ln, i) => Tx(svg, rx + 7, tcY + 18 + i * 13, ln, { fs: narrow ? 10 : 11, fill: 'var(--core)', fw: 600 }));
      if (st.op === 'cp') {
        const ay = smY + smH / 2;
        L(svg, rx - 2, ay, tmX + tmW + 8, ay, 'stroke:var(--memory);stroke-width:2');
        arrowHead(svg, tmX + tmW + 2, ay, 'l', 7, 'var(--memory)');
      }
      if (st.op === 'mma') {
        const ay = tcY + tcH / 2;
        L(svg, rx - 2, ay, tmX + tmW + 8, ay, 'stroke:var(--core);stroke-width:2');
        arrowHead(svg, tmX + tmW + 2, ay, 'l', 7, 'var(--core)');
        L(svg, rx + rightW / 2, smY + smH + 2, rx + rightW / 2, tcY - 6, 'stroke:var(--memory);stroke-width:1.5');
        arrowHead(svg, rx + rightW / 2, tcY - 1, 'd', 6, 'var(--memory)');
        if (!narrow) Tx(svg, rx + rightW / 2 + 6, (smY + smH + tcY) / 2 + 4, 'A, B', { fs: 10, fill: 'var(--memory)' });
      }
      const legend = st.op === 'mma' ? (st.cols >= 256 ? (narrow ? ['green: accumulator D,', 'inside the allocation'] : ['green: the accumulator D, all 128 lanes × 256 columns, inside the dashed allocation']) : (narrow ? ['red: D needs 256 columns,', `only ${st.cols} allocated`] : [`red: D needs 256 columns, but only ${st.cols} are allocated`]))
        : st.op === 'alloc' ? (narrow ? ['blue: the columns', 'this CTA now owns'] : ['blue: the columns this CTA now owns, every lane of each'])
          : st.op === 'cp' ? (narrow ? ['blue: cells written', 'by the copy'] : ['blue: cells written by the copy'])
            : (narrow ? ['blue: each warp’s cells;', 'a warp reaches only', 'its own 32 lanes'] : ['blue: each warp’s cells; a warp reaches only its own 32 lanes']);
      legend.forEach((ln, i) => Tx(svg, tmX, top + tmH + 18 + i * 13, ln, { fs: 10, fill: st.op === 'mma' && st.cols < 256 ? 'var(--danger)' : 'var(--ink-3)' }));
    }
    function update() {
      draw(lastW);
      const op = OPS[st.op];
      const warpOp = st.op === 'ld' || st.op === 'st';
      const one = st.warp !== 'all' && warpOp;
      sAl.set(`${st.cols} cols · ${fmt.bytes(st.cols * 128 * 4, 0)}`);
      sLanes.set(st.op === 'alloc' ? 'all 128' : one ? `${+st.warp * 32}–${+st.warp * 32 + 31}` : '0–127');
      sWho.set(warpOp ? (one ? `warp ${st.warp}` : '4 warps') : st.op === 'alloc' ? '1 warp (2 with ::2)' : st.op === 'cp' ? '1 thread issues (async)' : '1 thread → Tensor Core', st.op === 'mma' ? 'core' : 'control');
      let why = `<b><code>${op.name}</code></b>: ${op.what}. ${op.why}`;
      if (st.op === 'alloc') why += ` Here: ${st.cols} columns × 128 lanes × 4 bytes = <b>${fmt.bytes(st.cols * 512, 0)}</b> of the SM's 256 KiB.`;
      if (st.op === 'mma' && st.cols < 256) why += ` <b class="hwc-bad">Not enough columns:</b> a 128 × 256 FP32 accumulator needs 256 columns, and only ${st.cols} are allocated. Allocate 256 or 512.`;
      if (one) why += ` With only warp ${st.warp} selected, it can reach lanes ${+st.warp * 32}–${+st.warp * 32 + 31} and no others; the other three quarters need the other three warps of the warpgroup.`;
      f.setWhy(why);
      // each picker means something only for some operations
      const setOn = (seg, on) => { seg.el.style.opacity = on ? '' : '0.4'; $$(seg.el, 'button').forEach((b) => { b.disabled = !on; b.setAttribute('aria-disabled', String(!on)); }); };
      setOn(warpSeg, warpOp);
      setOn(colSeg, st.op === 'alloc' || st.op === 'mma');
    }
    GG.ui.seg(f.controls, { label: 'Operation', options: ['alloc', 'ld', 'st', 'cp', 'mma'].map((k) => ({ value: k, label: OPS[k].name.replace('tcgen05', '') })), value: st.op, onChange: (v) => { st.op = v; update(); } });
    const warpSeg = GG.ui.seg(f.controls, { label: 'Warps (.ld / .st)', options: [{ value: 'all', label: 'all 4' }, { value: '0', label: '0' }, { value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' }], value: st.warp, onChange: (v) => { st.warp = v; update(); } });
    const colSeg = GG.ui.seg(f.controls, { label: 'Columns allocated', options: [32, 64, 128, 256, 512].map((v) => ({ value: v, label: String(v) })), value: st.cols, onChange: (v) => { st.cols = v; update(); } });
    onWidth(box, (w) => { lastW = w; update(); });
    return f;
  }

  /* Fig: end-to-end: TMA → shared memory → MMA into Tensor Memory → registers → epilogue → out. */
  function tmPipelineFigure(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'A Blackwell matmul tile, end to end',
      hint: 'step through · change the number of K steps',
      wide: true,
      caption: `A simplified life of one output tile in a Blackwell matrix multiplication with a neural-network epilogue. Pink: the ${T('tensor-memory-accelerator', 'TMA')}, which loads into the ${T('l1-data-cache', 'L1 data cache')} (shared memory), a different unit from Tensor Memory despite the name. Green: compute. Blue: memories. In step 3 each K step sends a fresh pair of A and B tiles through the Tensor Core while the same D is hit again. The access counts are illustrative arithmetic: one MMA per K step, each reading one A tile and one B tile and accumulating into the same D, then one <code>tcgen05.ld</code> to read D out.`,
    });
    const NODES = [
      { k: 'ram', name: 'GPU RAM', sub: 'global memory', role: 'memory' },
      { k: 'tma', name: 'TMA', sub: 'Tensor Memory Accelerator', role: 'special' },
      { k: 'smem', name: 'Shared memory', sub: 'tiles of A and B', role: 'memory' },
      { k: 'tc', name: 'Tensor Core', sub: 'tcgen05.mma', role: 'core' },
      { k: 'tmem', name: 'Tensor Memory', sub: 'accumulator D', role: 'memory' },
      { k: 'regs', name: 'Registers', sub: 'in the register file', role: 'memory', badge: 'CUDA Cores' },
    ];
    const STEPS = [
      { label: 'TMA load', on: ['ram', 'tma', 'smem'], edges: [[0, 1], [1, 2]], why: '<b>1 · Load tiles.</b> The TMA copies a tile of A and a tile of B from global memory in GPU RAM into shared memory, in the L1 data cache. Note where it writes: the L1, not Tensor Memory.' },
      { label: 'MMA', on: ['smem', 'tc', 'tmem'], edges: [[2, 3], [3, 4]], why: '<b>2 · Multiply-accumulate.</b> One thread issues <code>tcgen05.mma</code> (unlike Hopper’s <code>wgmma</code>, which a whole warpgroup issues). The Tensor Core reads A and B from shared memory and adds A @ B into D in Tensor Memory. This is the only way data gets from that cache into Tensor Memory in this pipeline: as the result of a Tensor Core operation.' },
      { label: 'loop over K', on: ['ram', 'tma', 'smem', 'tc', 'tmem'], edges: [[0, 1], [1, 2], [2, 3], [3, 4]], why: '<b>3 · Repeat along K.</b> Steps 1 and 2 repeat for every slice of the shared dimension K. Each new pair of tiles is read once and replaced; the same D is read and written every time. That imbalance is why the accumulator, not the tiles, gets the specialized memory.' },
      { label: 'move out', on: ['tmem', 'regs'], edges: [[4, 5]], why: '<b>4 · Move D out.</b> The finished accumulator is explicitly moved from Tensor Memory into registers with <code>tcgen05.ld</code>, each of the four warps of the warpgroup taking its 32 lanes.' },
      { label: 'epilogue', on: ['regs'], edges: [], why: '<b>5 · Post-process.</b> In registers, ordinary instructions on the CUDA Cores apply the non-linearity that follows a matrix multiplication in a neural network (ReLU, GELU, a bias add, a conversion to a smaller type).' },
      { label: 'store', on: ['regs', 'ram'], edges: [[5, 0]], why: '<b>6 · Write out.</b> The result goes back to global memory in GPU RAM (often staged through shared memory and stored by the TMA). The next tile can begin.' },
    ];
    const st = { step: 0, k: 8, kDone: 8 };
    const box = el('div', { class: 'hwc-w' });
    f.stage.append(box);
    const sD = GG.ui.stat(f.readouts, { label: 'Accesses to D', value: '—', tone: 'memory' });
    const sT = GG.ui.stat(f.readouts, { label: 'Accesses per A or B tile', value: '1', tone: 'memory' });
    const sR = GG.ui.stat(f.readouts, { label: 'D vs one tile', value: '—', tone: 'memory' });
    void sT;
    let lastW = 0, pos = [], nw = 0, nh = 0, tileG = null, flash = null, kLab = null, dLab = null;
    /* D's tally after the step shown: MMAs done so far write D and (after the first) read it; tcgen05.ld reads it once more. */
    function tally() {
      if (st.step === 0) return null;
      if (st.step === 1) return { w: 1, r: 0, ld: 0 };
      if (st.step === 2) return { w: st.kDone, r: Math.max(0, st.kDone - 1), ld: 0 };
      return { w: st.k, r: st.k - 1, ld: 1 };
    }
    const accText = (t) => `${t.w + t.r + t.ld}`;
    function draw(w) {
      box.innerHTML = '';
      kLab = null; dLab = null; flash = null;
      const narrow = w < 640;
      const s = STEPS[st.step];
      nw = narrow ? (w - 30) / 2 : (w - 5 * 26 - 4) / 6;
      nh = narrow ? 64 : 76;
      const gapX = 26, gapY = 30;
      pos = NODES.map((n, i) => {
        if (!narrow) return { x: 2 + i * (nw + gapX), y: 22 };
        const row = Math.floor(i / 2), c = row % 2 === 0 ? i % 2 : 1 - (i % 2);
        return { x: 2 + c * (nw + gapX), y: 22 + row * (nh + gapY) };
      });
      const rows = narrow ? 3 : 1;
      const H = 22 + rows * nh + (rows - 1) * gapY + (narrow ? 30 : 60);
      const svg = svgRoot(box, w, H, `Data path of a Blackwell matmul tile, step ${st.step + 1}: ${s.label}.`);
      const isOn = (k) => s.on.includes(k);
      const edgeOn = (a2, b2) => s.edges.some(([x, y]) => x === a2 && y === b2);
      for (let i = 0; i < NODES.length - 1; i++) {
        const a2 = pos[i], b2 = pos[i + 1];
        const on = edgeOn(i, i + 1);
        const col = on ? (i === 2 || i === 3 ? 'var(--core)' : i === 0 || i === 1 ? 'var(--special)' : 'var(--memory)') : 'var(--line-2)';
        let x1, y1, x2, y2, dir;
        if (Math.abs(a2.y - b2.y) < 1) { y1 = y2 = a2.y + nh / 2; if (b2.x > a2.x) { x1 = a2.x + nw; x2 = b2.x; dir = 'r'; } else { x1 = a2.x; x2 = b2.x + nw; dir = 'l'; } }
        else { x1 = x2 = a2.x + nw / 2; y1 = a2.y + nh; y2 = b2.y; dir = 'd'; }
        L(svg, x1, y1, x2 + (dir === 'r' ? -6 : dir === 'l' ? 6 : 0), y2 + (dir === 'd' ? -6 : 0), `stroke:${col};stroke-width:${on ? 2.2 : 1.2}`);
        arrowHead(svg, x2, y2, dir, 7, col);
      }
      {
        const a2 = pos[5], b2 = pos[0];
        const on = edgeOn(5, 0);
        const col = on ? 'var(--memory)' : 'var(--line-2)';
        const yb = H - 22;
        if (!narrow) {
          P(svg, `M${a2.x + nw / 2} ${a2.y + nh} L${a2.x + nw / 2} ${yb} L${b2.x + nw / 2} ${yb} L${b2.x + nw / 2} ${b2.y + nh + 6}`, `fill:none;stroke:${col};stroke-width:${on ? 2.2 : 1.2};stroke-dasharray:5 4`);
          arrowHead(svg, b2.x + nw / 2, b2.y + nh, 'u', 7, col);
          Tx(svg, (a2.x + b2.x + nw) / 2, yb - 6, 'store the finished tile', { fs: 10, fill: on ? 'var(--memory)' : 'var(--ink-3)', anchor: 'middle' });
        } else Tx(svg, w / 2, H - 8, on ? '↺ store back to GPU RAM (top left)' : 'then: store back to GPU RAM', { fs: 10, fill: on ? 'var(--memory)' : 'var(--ink-3)', anchor: 'middle' });
      }
      const t = tally();
      NODES.forEach((n, i) => {
        const p = pos[i];
        const on = isOn(n.k);
        R(svg, p.x, p.y, nw, nh, `fill:${on ? ROLE_A[n.role] : 'rgba(255,255,255,.025)'};stroke:${on ? ROLE[n.role] : 'var(--line-2)'};stroke-width:${on ? 1.5 : 1}`, { rx: 9 });
        if (n.k === 'tmem') flash = R(svg, p.x + 1, p.y + 1, nw - 2, nh - 2, 'fill:var(--memory)', { rx: 8, opacity: 0, 'pointer-events': 'none' });
        Tx(svg, p.x + 10, p.y + 20, n.name, { fs: narrow ? 11 : 12, fill: on ? 'var(--ink)' : 'var(--ink-3)', fw: 600, ff: 'body' });
        wrap(n.sub, nw - 18, 6.2).slice(0, 2).forEach((ln, j) => Tx(svg, p.x + 10, p.y + 37 + j * 12, ln, { fs: 10, fill: on ? ROLE[n.role] : 'var(--ink-3)' }));
        if (n.badge) {
          // the registers are memory; the CUDA Cores that work on them in the epilogue are compute
          const bw2 = n.badge.length * 6.2 + 10, lit = st.step === 4;
          R(svg, p.x + nw - bw2 - 6, p.y + 7, bw2, 17, `fill:${lit ? 'var(--core-a)' : 'none'};stroke:${lit ? 'var(--core)' : 'var(--line-2)'}`, { rx: 4 });
          Tx(svg, p.x + nw - 6 - bw2 / 2, p.y + 19, n.badge, { fs: 10, fill: lit ? 'var(--core)' : 'var(--ink-3)', anchor: 'middle' });
        }
        if (n.k === 'tmem' && t) dLab = Tx(svg, p.x + nw - 8, p.y + nh - 9, `D touched ${accText(t)}×`, { fs: 10, fill: 'var(--memory)', anchor: 'end', fw: 600 });
        if (n.k === 'smem' && st.step >= 1) Tx(svg, p.x + nw - 8, p.y + nh - 9, 'each tile 1×', { fs: 10, fill: 'var(--ink-2)', anchor: 'end' });
        if (n.k === 'regs' && st.step >= 4) Tx(svg, p.x + nw - 8, p.y + nh - 9, 'ReLU(D)', { fs: 10, fill: 'var(--core)', anchor: 'end', fw: 600 });
        if (n.k === 'tc' && st.step === 2) kLab = Tx(svg, p.x + nw - 8, p.y + nh - 9, `k = ${st.kDone} / ${st.k}`, { fs: 10, fill: 'var(--core)', anchor: 'end', fw: 600 });
      });
      if (!narrow) Tx(svg, pos[1].x + nw / 2, 12, 'loads shared memory, not Tensor Memory', { fs: 10, fill: 'var(--special)', anchor: 'middle' });
      // the travelling pair of tiles for the K loop
      tileG = null;
      if (st.step === 2) {
        tileG = G(svg, { 'pointer-events': 'none' });
        ['A', 'B'].forEach((l, j) => { R(tileG, j * 17 - 16, -8, 15, 15, 'fill:var(--memory);stroke:var(--bg);stroke-width:1', { rx: 2 }); Tx(tileG, j * 17 - 8.5, 3.5, l, { fs: 10, fill: '#0b0c12', anchor: 'middle', fw: 700 }); });
        placeTile(st.kDone >= st.k ? 1 : 0, st.kDone >= st.k ? 0 : 1);
      }
    }
    const ctr = (i) => [pos[i].x + nw / 2, pos[i].y + nh / 2];
    /* u in 0..1 along TMA → shared memory → Tensor Core; op = opacity */
    function placeTile(u, op) {
      if (!tileG) return;
      const pts = [ctr(1), ctr(2), ctr(3)];
      const seg = u < 0.5 ? 0 : 1, v = seg === 0 ? u / 0.5 : (u - 0.5) / 0.5;
      const [x1, y1] = pts[seg], [x2, y2] = pts[seg + 1];
      // travel below the node labels and left of the counters in each node's corner
      tileG.setAttribute('transform', `translate(${(x1 + (x2 - x1) * v - nw * 0.18).toFixed(1)} ${(y1 + (y2 - y1) * v + nh * 0.15).toFixed(1)})`);
      tileG.setAttribute('opacity', op.toFixed(2));
    }
    function readouts() {
      const t = tally();
      sD.set(t ? `${accText(t)} (${t.w} ${plural(t.w, 'write')}, ${t.r + t.ld} ${plural(t.r + t.ld, 'read')})` : '—');
      sR.set(t ? `${accText(t)}×` : '—');
      if (dLab && t) dLab.textContent = `D touched ${accText(t)}×`;
      if (kLab) kLab.textContent = `k = ${st.kDone} / ${st.k}`;
      let extra = '';
      if (st.step === 2) {
        const kd = st.kDone, a2 = 2 * kd - 1;
        if (kd === 0) extra = ` The loop is about to start: ${st.k} K ${plural(st.k, 'step')}, one MMA each.`;
        else extra = ` After <b>${kd}</b> of ${st.k} K ${plural(st.k, 'step')}: ${kd} ${plural(kd, 'write')} and ${kd - 1} ${plural(kd - 1, 'read')} of D (the first MMA starts from zero), <b>${a2}</b> ${plural(a2, 'access', 'accesses')}, against one read for each A and B tile.`;
      } else if (st.step >= 3) extra = ` In all, D is accessed <b>${2 * st.k}</b> ${plural(2 * st.k, 'time')}: ${st.k} ${plural(st.k, 'write')} by the MMAs, ${st.k - 1} ${plural(st.k - 1, 'read')} by later MMAs and one read by <code>tcgen05.ld</code>; each A and B tile is read once.`;
      f.setWhy(STEPS[st.step].why + extra);
    }
    // the K loop: one MMA per iteration; a fresh pair of tiles travels in, D flashes as it is read and written
    let lastK = -1;
    const loop = GG.anim(box, (t) => {
      const per = clamp(4.8 / st.k, 0.32, 0.9);
      const it = Math.floor(t / per), u = (t % per) / per;
      if (it >= st.k) { loop.stop(); st.kDone = st.k; placeTile(1, 0); if (flash) flash.setAttribute('opacity', 0); readouts(); playIdle(); autoArm(); return; }
      if (it + 1 !== lastK) { lastK = it + 1; st.kDone = it + 1; readouts(); }
      placeTile(Math.min(1, u / 0.7), u < 0.75 ? 1 : Math.max(0, 1 - (u - 0.75) / 0.2));
      if (flash) flash.setAttribute('opacity', (u > 0.62 && u < 0.92 ? 0.45 * Math.sin(((u - 0.62) / 0.3) * Math.PI) : 0).toFixed(2));
    }, { autostart: false });
    function playLoop() { loop.stop(); loop.reset(); lastK = -1; st.kDone = 0; draw(lastW); readouts(); loop.start(); if (playB) playB.setLabel('Pause', 'pause'); }
    let playB = null;
    const playIdle = () => { if (playB) playB.setLabel('Play the K loop', 'play'); };
    function go(i) {
      loop.stop(); playIdle();
      st.step = i;
      if (i === 2 && !GG.reducedMotion) playLoop();
      else { st.kDone = st.k; draw(lastW); readouts(); }
    }
    /* The figure's own autoplay (not the stepper's fixed interval): each step dwells AUTO_MS,
       but step 3 holds until its K loop has finished, then dwells on the final tally. */
    const AUTO_MS = 2200;
    let autoOn = false, autoT = null, autoB = null;
    const autoSync = () => { if (autoB) autoB.setLabel(autoOn ? 'Pause' : 'Play', autoOn ? 'pause' : 'play'); };
    function autoStop() { autoOn = false; clearTimeout(autoT); autoT = null; autoSync(); }
    function autoArm() {
      clearTimeout(autoT); autoT = null;
      if (!autoOn || loop.running) return; // a running K loop re-arms from its completion
      if (stepper.get() >= STEPS.length - 1) { autoStop(); return; }
      autoT = setTimeout(() => { autoT = null; if (autoOn) stepper.go(stepper.get() + 1); }, AUTO_MS);
    }
    const stepper = GG.ui.stepper(f.controls, { label: 'Step', steps: STEPS, onStep: (i) => { go(i); autoArm(); } });
    {
      const row = stepper.el.querySelector('.stepper');
      autoB = GG.ui.button(row, { label: 'Play', icon: 'play', onClick: () => {
        if (autoOn) { autoStop(); return; }
        autoOn = true; autoSync();
        if (stepper.get() >= STEPS.length - 1) stepper.go(0); else autoArm();
      } });
      row.insertBefore(autoB, row.querySelector('.dots'));
    }
    GG.ui.slider(f.controls, { label: 'K steps per tile', min: 1, max: 32, step: 1, value: st.k, format: (v) => `${v}`, onInput: (v) => { st.k = v; loop.stop(); playIdle(); st.kDone = v; draw(lastW); readouts(); autoArm(); } });
    playB = GG.ui.button(f.controls, { label: 'Play the K loop', icon: 'play', onClick: () => {
      if (loop.running) { loop.stop(); playIdle(); autoStop(); return; }
      clearTimeout(autoT); autoT = null; // a pending autoplay step must not cut this loop short
      if (st.step !== 2) { stepper.go(2, true); st.step = 2; }
      playLoop();
    } });
    onWidth(box, (w) => { lastW = w; draw(w); readouts(); });
    return f;
  }

  GG.entry('tensor-memory', {
    render(body, ctx) {
      const s = ctx.html(body, `
<p><strong>Tensor Memory</strong> is a specialized memory in the ${T('streaming-multiprocessor', 'Streaming Multiprocessor (SM)')} of certain GPUs, like the <a href="https://modal.com/blog/introducing-b200-h200">B200</a>, for storing the inputs and outputs of ${T('tensor-core', 'Tensor Cores')}. It arrived with NVIDIA's Blackwell data center GPUs and their fifth-generation Tensor Cores, which are programmed with PTX's <code>tcgen05</code> instructions. An H100 has none.</p>
<div data-slot="nums"></div>
<h3>Highly restricted access</h3>
<p>Tensor Memory access is highly restricted. Data must be moved collectively by four ${T('warp', 'warps')} in a ${T('warpgroup')}, and they can move memory only in specific patterns:</p>
<ul>
<li>between Tensor Memory and ${T('registers', 'registers')}, in either direction;</li>
<li>from ${T('shared-memory', 'shared memory')} into Tensor Memory (writes only);</li>
<li>by issuing matrix-multiply-accumulate (MMA) instructions to ${T('tensor-core', 'Tensor Cores')} that use Tensor Memory for specific operands.</li>
</ul>
<p>Ordinary loads and stores cannot touch it. No thread can access it on its own: <code>tcgen05.ld</code> and <code>tcgen05.st</code> are executed by a whole warp together, each thread getting its own lane's cells, and each warp reaches only its 32 lanes; the MMA and copy instructions (each issued by a single thread) hand the work to the Tensor Core. So much for a <a data-term="cuda-device-architecture">“compute-unified” device architecture</a>! (CUDA's “unified” architecture replaced the specialized units of the old graphics pipeline with uniform, general-purpose SMs; Tensor Memory is a specialized store that only the Tensor Cores and a few <code>tcgen05</code> instructions can use.) Fig.&nbsp;2 shows the allowed moves.</p>
${GG.noteHTML('beyond', `<p><b>“Moved collectively by four warps”, made precise.</b> In NVIDIA's PTX ISA, the warpgroup rule belongs to <code>tcgen05.ld</code> and <code>tcgen05.st</code>: a warp can reach only its own quarter of the lanes (32 of 128), so all four warps of a warpgroup are needed to move a full 128-lane tile between Tensor Memory and registers. The MMA and the shared-memory-to-Tensor-Memory copy (<code>tcgen05.mma</code>, <code>tcgen05.cp</code>, and the completion signal <code>tcgen05.commit</code>) are issued by a <b>single thread</b>; allocating and freeing Tensor Memory (<code>tcgen05.alloc</code>, <code>.dealloc</code>) takes one warp, or one warp in each CTA of a CTA pair with <code>.cta_group::2</code>.</p>`, 'Who moves Tensor Memory data, precisely')}
<h3>Where each operand may live</h3>
<p>Specifically, for a <code>tcgen05.mma</code> ${T('parallel-thread-execution', 'Parallel Thread eXecution')} instruction computing <code>D += A @ B</code> to use Tensor Memory, the “accumulator” matrix <code>D</code> <em>must</em> be in Tensor Memory, the left-hand matrix <code>A</code> <em>may</em> be in Tensor Memory or ${T('shared-memory', 'shared memory')}, and the right-hand matrix <code>B</code> <em>must</em> be in ${T('shared-memory', 'shared memory')}, not Tensor Memory. Note that none of the matrices are in the ${T('registers', 'registers')}. Try every placement in Fig.&nbsp;1.</p>
<div data-slot="op"></div>
<p>This is complex, but not arbitrary: accumulators are accessed more frequently during matmuls than are the tiles, so they benefit more from specialized hardware, e.g. from shorter, simpler wiring between the ${T('tensor-core', 'Tensor Cores')} and the Tensor Memory. Each tile of A and B is used for one step of the multiplication and then replaced; the same accumulator is updated on every step (count them in Fig.&nbsp;3).</p>
<div data-slot="lanes"></div>
<h3>Not the Tensor Memory Accelerator</h3>
${GG.noteHTML('warn', `<p>Beware: Tensor Memory is not directly related to the ${T('tensor-memory-accelerator', 'Tensor Memory Accelerator')} (TMA), which instead loads into the ${T('l1-data-cache', 'L1 data cache')}. They are separate pieces of hardware that share a name: the TMA fills shared memory, and the Tensor Core reads from there and writes its results into Tensor Memory (Fig.&nbsp;3).</p>`)}
<p>Roughly speaking, data is moved from that cache into Tensor Memory only as a result of a ${T('tensor-core', 'Tensor Core')} operation and then is explicitly moved out for post-processing, e.g. the non-linearity after a matrix multiplication in a neural network. The exception is <code>tcgen05.cp</code> (Fig.&nbsp;2), an asynchronous copy from shared memory that runs in the same Tensor Core pipeline as the MMA without being one, so the rule holds only roughly. Fig.&nbsp;3 walks one tile through that whole path.</p>
<div data-slot="pipe"></div>
${GG.noteHTML('beyond', `<p><b>The shape of Tensor Memory.</b> On a B200, each SM's Tensor Memory is 256 KiB, organized as 128 lanes (rows) by 512 columns of 32-bit cells. A kernel claims columns with <code>tcgen05.alloc</code>, a power of two from 32 to 512 columns, every one spanning all 128 lanes, and must release them with <code>tcgen05.dealloc</code> before it exits (the <code>.alloc</code> setting of Fig.&nbsp;2). The operand rules above are those of the ordinary MMA kinds such as <code>.kind::f16</code>: the block-scaled MMAs (<code>.kind::mxf8f6f4</code>, <code>.kind::mxf4</code>, <code>.kind::mxf4nvf4</code>, used for MXFP8, MXFP4 and NVFP4) also read two matrices of scale factors, and both must be in Tensor Memory, typically copied there from shared memory with <code>tcgen05.cp</code>. Each warp of a warpgroup can reach only one quarter of the lanes, 32 apiece, which is why moving a full tile takes all four. On Hopper, the previous generation, the warpgroup-level <code>wgmma</code> instruction kept its accumulator in registers, a big share of the register file in large kernels; moving it into Tensor Memory frees those registers for other work.</p>`)}
<p>For details on tensor memory and patterns for its use in matrix multiplications, see the <a href="https://www.nvidia.com/en-us/on-demand/session/gtc25-s72720/"><em>Programming Blackwell Tensor Cores with CUTLASS</em> talk from GTC 2025</a>.</p>
<div data-slot="read"></div>`);
      guard(s.nums, 'numbers', () => ctx.numbers(s.nums, [
        { value: 'D', label: 'must be in Tensor Memory (the accumulator)', tone: 'control' },
        { value: 'A', label: 'may be in Tensor Memory or shared memory', tone: 'special' },
        { value: 'B', label: 'must be in shared memory', tone: 'memory' },
        { value: '4 warps', label: 'a warpgroup moves Tensor Memory data to and from registers together', tone: 'control' },
      ]));
      guard(s.op, 'Fig. 1', () => operandFigure(s.op, ctx));
      guard(s.lanes, 'Fig. 2', () => lanesFigure(s.lanes, ctx));
      guard(s.pipe, 'Fig. 3', () => tmPipelineFigure(s.pipe, ctx));
      ctx.reading(s.read, [
        { href: 'https://www.nvidia.com/en-us/on-demand/session/gtc25-s72720/', label: 'Programming Blackwell Tensor Cores with CUTLASS (GTC 2025)', note: 'Tensor Memory and its use in matrix multiplications' },
        { href: 'https://modal.com/blog/introducing-b200-h200', label: 'Modal: introducing B200 and H200', note: 'a GPU with Tensor Memory' },
        { href: 'https://docs.nvidia.com/cuda/parallel-thread-execution/index.html', label: 'NVIDIA PTX ISA', note: 'the <code>tcgen05</code> family: <code>alloc</code>, <code>ld</code>, <code>st</code>, <code>cp</code>, <code>mma</code> (Beyond the glossary)' },
      ]);
    },
  });

  /* ═════════════════════════════ GPU RAM ═════════════════════════════ */

  /* Fig: cross-section of a GPU package (after the glossary's HBM schematic). */
  function packageFigure(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'Cross-section: where the RAM sits',
      hint: 'hover or tap a layer · switch the package',
      wide: true,
      caption: `In high-performance data center GPUs like the H100, RAM is located on a die directly next to the processor's. Redrawn and adapted from the glossary's figure, itself adapted from the Wikipedia page for <a href="https://en.wikipedia.org/wiki/High_Bandwidth_Memory">high-bandwidth memory</a>; not to scale (the original's labels include a “Streaming Multiprcessors” typo, corrected here). The consumer-card view, the bandwidth numbers and the stack counts are context beyond the glossary.`,
    });
    const st = { mode: 'hbm', hot: null };
    const box = el('div', { class: 'hwc-w' });
    f.stage.append(box);
    const sA = GG.ui.stat(f.readouts, { label: '—', value: '—', tone: 'memory' });
    const sB = GG.ui.stat(f.readouts, { label: '—', value: '—', tone: 'memory' });
    const sC = GG.ui.stat(f.readouts, { label: '—', value: '—', tone: 'memory' });
    const PARTS = {
      gpu: 'The <b>GPU die</b>: one piece of silicon holding the Streaming Multiprocessors, the L2 cache and the HBM controllers that talk to the memory. Its bottom is a metalization layer, the stack of copper wiring that connects its transistors to the outside.',
      sms: `The <b>Streaming Multiprocessors</b>. Every one of them can address all of GPU RAM: this is the bottom of the memory hierarchy, “addressable by all of the GPU's SMs”.`,
      ctrl: 'The <b>HBM controller</b> on the GPU die: it turns memory requests from the SMs into commands for the DRAM, over the wide interface through the interposer.',
      metal: 'The <b>metalization layer</b>: many thin layers of copper wiring on the die’s face, routing signals and power between its transistors and the bumps below.',
      dram: 'The <b>DRAM dice</b>: several thin memory chips stacked on top of each other, each full of DRAM cells. Stacking puts many gigabytes in a small footprint right beside the GPU.',
      tsv: '<b>Through-silicon vias (TSVs)</b>: vertical copper connections drilled straight through each DRAM die, so signals pass up and down the stack without wires around the edge.',
      base: 'The <b>HBM controller die</b> (base or logic die) at the bottom of each stack: it connects the DRAM dice above it to the interposer below.',
      ubump: '<b>Microbumps</b> (µbumps): tiny solder connections, tens of micrometres apart, that join the GPU die and the memory stacks to the interposer. Their density is what makes a 1,024-wire interface possible.',
      inter: `The <b>silicon <a href="https://en.wikipedia.org/wiki/Interposer">interposer</a></b>: a slab of silicon with fine wiring that sits under both the GPU and the memory. Because it is silicon, its wires can be packed far more densely than on a circuit board: 1,024 data links per HBM stack, each only millimetres long. Short, many wires mean lower latency and more ${T('memory-bandwidth', 'bandwidth')}.`,
      bump: 'Larger solder bumps connect the interposer to the package substrate.',
      sub: 'The <b>package substrate</b>: a small circuit board that spreads the interposer’s connections out to a pitch that a normal circuit board can handle.',
      ball: '<b>Solder balls</b>: the big connections between the package and the graphics card.',
      pcb: 'The <b>graphics card</b>: a multi-layer printed circuit board (PCB) that carries PCI Express to the host, electrical current to power the chip, and (on cards that drive screens) display connectors.',
      gddr: 'A <b>GDDR memory chip</b>, soldered to the card next to the GPU package. Each chip talks to the GPU over a 32-bit interface through the circuit board’s traces, centimetres long: far fewer, longer wires than HBM’s 1,024 per stack.',
      trace: '<b>Board traces</b>: copper lines in the PCB between the GPU package and its memory chips. Running fast signals over them limits how many wires there can be.',
    };
    let lastW = 0, anim = null, dots = [];
    function draw(w) {
      box.innerHTML = '';
      dots = [];
      const narrow = w < 640;
      const hbm = st.mode === 'hbm';
      const fs = narrow ? 10 : 11, fsS = narrow ? 10 : 10.5;
      const W = w - 4, X = 2;
      const pcbH = narrow ? 46 : 60, ballR = narrow ? 8 : 12, subH = narrow ? 34 : 44, bumpR = narrow ? 5 : 7, intH = narrow ? 36 : 48, ub = narrow ? 3 : 4.5;
      const dieH = narrow ? 64 : 84;
      const top = narrow ? 30 : 34;
      const yDie = top, yUb = yDie + dieH + ub + 1;
      const yInt = yUb + ub + 1, ySub0 = hbm ? yInt + intH + bumpR * 2 + 2 : yDie + dieH + bumpR * 2 + 2;
      const yBall = ySub0 + subH + ballR + 1, yPcb = yBall + ballR + 1;
      const H = yPcb + pcbH + (narrow ? 66 : 60);
      const svg = svgRoot(box, w, H, hbm ? 'Cross-section of an HBM GPU package: GPU die and HBM stacks side by side on a silicon interposer, on a package substrate, on the graphics card.' : 'Cross-section of a consumer graphics card: the GPU package on the circuit board with GDDR memory chips beside it.');
      const part = (key, label, fn) => {
        const g = G(svg, { class: 'hwc-fade' });
        fn(g);
        g.setAttribute('opacity', st.hot && st.hot !== key && !(st.hot === 'gpu' && ['sms', 'ctrl', 'metal'].includes(key)) ? '0.35' : '1');
        hit(g, label, { enter: () => { st.hot = key; refresh(); }, leave: () => { st.hot = null; refresh(); }, click: () => { st.hot = st.hot === key ? null : key; refresh(); } });
        return g;
      };
      const sx = hbm ? X + W * 0.06 : X + W * 0.28;
      const gpuW = hbm ? W * 0.44 : W * 0.44;
      const stackX = sx + gpuW + W * 0.05, stackW = W * 0.36;
      const intX = X + W * 0.03, intW = W * 0.86;
      // PCB
      part('pcb', 'Graphics card PCB', (g) => {
        R(g, X, yPcb, W, pcbH, 'fill:#1b1d2a;stroke:var(--line-2)', { rx: 4 });
        Tx(g, X + 10, yPcb + (narrow ? 20 : 26), 'Graphics card', { fs: fs + 2, fill: 'var(--ink)', ff: 'body', fw: 600 });
        Tx(g, X + 10, yPcb + (narrow ? 35 : 45), narrow ? 'multi-layer PCB' : 'multi-layer printed circuit board (PCB)', { fs, fill: 'var(--ink-3)' });
        const labs = ['display connectors', 'electrical current', 'PCI Express'];
        const lx = X + W * (narrow ? 0.7 : 0.72);
        labs.forEach((t, i) => {
          const ly = yPcb + pcbH + 16 + (2 - i) * (narrow ? 15 : 14);
          const bx = X + W * ((narrow ? 0.44 : 0.5) + i * 0.07);
          P(g, `M${bx} ${yBall + ballR} L${bx} ${ly - 4} L${lx - 6} ${ly - 4}`, 'fill:none;stroke:var(--ink-3)');
          Tx(g, lx, ly, t, { fs, fill: 'var(--ink-2)' });
        });
      });
      // substrate
      const subX = hbm ? X + W * 0.02 : X + W * 0.24, subW = hbm ? W * 0.9 : W * 0.52;
      // solder balls: only under the package substrate, so the GDDR chips have the board to themselves
      part('ball', 'Solder balls', (g) => {
        const bx0 = subX + 2, bx1 = hbm ? subX + subW * 0.78 : subX + subW - 2;
        const n = Math.max(1, Math.floor((bx1 - bx0) / (ballR * 2.8)));
        for (let i = 0; i < n; i++) C(g, bx0 + ballR + i * ballR * 2.8, yBall, ballR, 'fill:rgba(184,164,255,.35);stroke:rgba(184,164,255,.6)');
        if (hbm) Tx(g, bx0 + n * ballR * 2.8 + 4, yBall + 4, 'Solder balls', { fs: fs + 1, fill: 'var(--ink-2)' });
      });
      part('sub', 'Package substrate', (g) => {
        R(g, subX, ySub0, subW, subH, 'fill:#202334;stroke:var(--line-2)', { rx: 3 });
        Tx(g, subX + 10, ySub0 + subH / 2 + 4, 'Package substrate', { fs: fs + 1, fill: 'var(--ink-2)' });
      });
      if (hbm) {
        part('bump', 'Bumps between interposer and substrate', (g) => {
          const n = Math.floor(intW / (bumpR * 3));
          for (let i = 0; i < n; i++) C(g, intX + bumpR + i * bumpR * 3, yInt + intH + bumpR + 1, bumpR, 'fill:rgba(184,164,255,.3);stroke:rgba(184,164,255,.55)');
        });
        part('inter', 'Silicon interposer', (g) => {
          R(g, intX, yInt, intW, intH, 'fill:#262a3e;stroke:var(--ink-3)', { rx: 3 });
          Tx(g, intX + 10, yInt + intH - (narrow ? 10 : 14), 'Silicon interposer', { fs: fs + 2, fill: 'var(--ink)', ff: 'body', fw: 600 });
          Tx(g, intX + intW - 8, yInt + intH - (narrow ? 10 : 14), narrow ? '1,024 links / stack' : '1,024 data links / HBM stack', { fs, fill: 'var(--memory)', anchor: 'end' });
          // wires from GPU controller to stack base
          const cx0 = sx + gpuW * 0.74, cx1 = stackX + stackW * 0.08;
          for (let i = 0; i < 4; i++) {
            const a = cx0 + i * (gpuW * 0.06), b = cx1 + i * (stackW * 0.07);
            const yy = yInt + 6 + (3 - i) * (narrow ? 3.4 : 5);
            const d = `M${a} ${yInt} L${a} ${yy} L${b} ${yy} L${b} ${yInt}`;
            P(g, d, 'fill:none;stroke:var(--memory);stroke-width:1.3;opacity:.85');
            dots.push({ a, b, yy, y0: yInt, phase: i / 4 });
          }
        });
        part('ubump', 'Microbumps', (g) => {
          const row = (x0, x1) => { const n = Math.floor((x1 - x0) / (ub * 2.6)); for (let i = 0; i < n; i++) C(g, x0 + ub + i * ub * 2.6, yUb, ub, 'fill:rgba(184,164,255,.4);stroke:none'); };
          row(sx, sx + gpuW); row(stackX, stackX + stackW);
          if (!narrow) Tx(g, stackX + stackW + 6, yUb + 4, 'µbumps', { fs: fs - 1, fill: 'var(--ink-3)' });
        });
      }
      // GPU die
      const yG = hbm ? yDie : yDie;
      part('gpu', 'GPU die', (g) => {
        R(g, sx, yG, gpuW, dieH, 'fill:#1d2030;stroke:var(--ink-3)', { rx: 3 });
        Tx(g, sx + 10, yG + dieH - (narrow ? 22 : 28), 'GPU', { fs: narrow ? 20 : 28, fill: 'var(--ink)', ff: 'display', fw: 800 });
      });
      part('sms', 'Streaming Multiprocessors', (g) => {
        R(g, sx + 6, yG + 6, gpuW * (hbm ? 0.62 : 0.9) - 6, dieH * 0.28, 'fill:var(--core-a);stroke:var(--core)', { rx: 2 });
        Tx(g, sx + 6 + (gpuW * (hbm ? 0.62 : 0.9) - 6) / 2, yG + 6 + dieH * 0.14 + 3.5, narrow ? 'SMs' : 'Streaming Multiprocessors', { fs, fill: 'var(--core)', anchor: 'middle' });
      });
      part('ctrl', 'HBM controller on the GPU', (g) => {
        if (!hbm) return;
        R(g, sx + gpuW * 0.64 + 2, yG + 6, gpuW * 0.36 - 8, dieH * 0.28, 'fill:var(--memory-a);stroke:var(--memory)', { rx: 2 });
        Tx(g, sx + gpuW * 0.82, yG + 6 + dieH * 0.14 + 3.5, narrow ? 'HBM' : 'HBM Controller', { fs, fill: 'var(--memory)', anchor: 'middle' });
      });
      part('metal', 'Metalization layer', (g) => {
        R(g, sx + 1, yG + dieH - (narrow ? 10 : 13), gpuW - 2, narrow ? 9 : 12, 'fill:rgba(255,138,91,.14);stroke:none');
        Tx(g, sx + gpuW - 8, yG + dieH * 0.68, narrow ? 'metal layer' : 'Metalization Layer', { fs, fill: 'var(--ink-2)', anchor: 'end' });
      });
      if (hbm) {
        // HBM stack
        const nD = 4, baseH = dieH * 0.28, dH = (dieH - baseH - 4) / nD;
        part('dram', 'DRAM dice', (g) => {
          for (let i = 0; i < nD; i++) R(g, stackX, yDie + i * dH, stackW, dH - 2, 'fill:rgba(111,166,255,.16);stroke:rgba(111,166,255,.55)', { rx: 2 });
          Tx(g, stackX + 8, yDie + dH * 1.0 + 4, 'DRAM', { fs: fs + 3, fill: 'var(--ink)', fw: 600 });
          Tx(g, stackX + 8, yDie + dH * 3.0 + 4, 'dice', { fs: fs + 3, fill: 'var(--ink)', fw: 600 });
        });
        part('tsv', 'Through-silicon vias', (g) => {
          for (let i = 0; i < 6; i++) R(g, stackX + stackW * (0.45 + i * 0.075), yDie, narrow ? 2.5 : 4, dieH - 2, 'fill:rgba(255,198,92,.55)');
          Tx(g, stackX, yDie - 8, narrow ? 'TSVs' : 'Through-Silicon Vias (TSVs)', { fs: fsS, fill: 'var(--control)' });
        });
        part('base', 'HBM controller die', (g) => {
          R(g, stackX, yDie + dieH - baseH, stackW, baseH, 'fill:#262a3e;stroke:var(--ink-3)', { rx: 2 });
          Tx(g, stackX + stackW / 2, yDie + dieH - baseH / 2 + 4, narrow ? 'HBM ctrl die' : 'HBM controller die', { fs, fill: 'var(--ink-2)', anchor: 'middle' });
        });
        // height marker
        const mx = stackX + stackW + (narrow ? 8 : 14);
        if (!narrow) {
          L(svg, mx, yDie, mx, yDie + dieH, 'stroke:var(--ink-3)');
          arrowHead(svg, mx, yDie, 'u', 4, 'var(--ink-3)'); arrowHead(svg, mx, yDie + dieH, 'd', 4, 'var(--ink-3)');
          Tx(svg, mx + 6, yDie + dieH / 2 + 4, '~500 µm', { fs: fs - 1, fill: 'var(--ink-3)' });
        }
        Tx(svg, stackX + stackW / 2, yDie - (narrow ? 20 : 22), narrow ? 'HBM stack' : 'HBM stack', { fs, fill: 'var(--memory)', anchor: 'middle' });
      } else {
        // GPU package bumps
        part('ubump', 'Bumps under the GPU die', (g) => { const n = Math.floor(gpuW / (bumpR * 2.6)); for (let i = 0; i < n; i++) C(g, sx + bumpR + i * bumpR * 2.6, yDie + dieH + bumpR + 1, bumpR, 'fill:rgba(184,164,255,.3);stroke:rgba(184,164,255,.55)'); });
        // GDDR chips on the PCB, either side
        const chipW = W * 0.15, chipH = narrow ? 18 : 24;
        [X + W * 0.03, X + W * 0.82].forEach((cx, i) => {
          part('gddr', 'GDDR memory chip', (g) => {
            R(g, cx, yPcb - chipH - ballR * 0.8, chipW, chipH, 'fill:rgba(111,166,255,.18);stroke:var(--memory)', { rx: 2 });
            Tx(g, cx + chipW / 2, yPcb - chipH / 2 - ballR * 0.8 + 3.5, 'GDDR', { fs, fill: 'var(--memory)', anchor: 'middle', fw: 600 });
            for (let k = 0; k < 4; k++) C(g, cx + chipW * (0.15 + k * 0.23), yPcb - ballR * 0.4, ballR * 0.35, 'fill:rgba(184,164,255,.45)');
          });
          part('trace', 'Board traces', (g) => {
            const x1 = i === 0 ? cx + chipW * 0.8 : cx + chipW * 0.2, x2 = i === 0 ? subX + subW * 0.15 : subX + subW * 0.85;
            const yy = yPcb + (narrow ? 8 : 10) + 0;
            P(g, `M${x1} ${yPcb} L${x1} ${yy} L${x2} ${yy} L${x2} ${yPcb}`, 'fill:none;stroke:var(--memory);stroke-width:1.3');
            dots.push({ a: x1, b: x2, yy, y0: yPcb, phase: i / 2 });
          });
        });
        // label centred above the left chip, clear of the package substrate
        const lcx = X + W * 0.03 + chipW / 2, ly0 = yPcb - chipH - ballR * 0.8 - 6;
        if (narrow) { Tx(svg, lcx, ly0 - 12, '32 bits', { fs: fsS, fill: 'var(--memory)', anchor: 'middle' }); Tx(svg, lcx, ly0, 'per chip', { fs: fsS, fill: 'var(--memory)', anchor: 'middle' }); }
        else Tx(svg, X + W * 0.03, ly0, '32-bit interface per chip', { fs: fsS, fill: 'var(--memory)' });
      }
      // data packets
      const dg = G(svg, { 'pointer-events': 'none' });
      dots.forEach((d) => { d.el = C(dg, d.a, d.y0, narrow ? 2.2 : 3, 'fill:#fff;opacity:.9'); });
      tick(anim ? anim.time : 0);
    }
    function tick(t) {
      dots.forEach((d) => {
        if (!d.el) return;
        const L1 = d.yy - d.y0, L2 = Math.abs(d.b - d.a), tot = 2 * L1 + L2;
        let p = ((t * 0.55 + d.phase) % 1) * tot;
        let x, y;
        if (p < L1) { x = d.b; y = d.y0 + p; }
        else if (p < L1 + L2) { x = d.b + (d.a - d.b) * ((p - L1) / L2); y = d.yy; }
        else { x = d.a; y = d.yy - (p - L1 - L2); }
        d.el.setAttribute('cx', x.toFixed(1)); d.el.setAttribute('cy', y.toFixed(1));
      });
    }
    function refresh() {
      const keepFocus = document.activeElement && box.contains(document.activeElement) ? document.activeElement.getAttribute('aria-label') : null;
      draw(lastW);
      if (keepFocus) { const g = $$(box, '.hwc-hit').find((n) => n.getAttribute('aria-label') === keepFocus); if (g) g.focus({ preventScroll: true }); }
      const hbm = st.mode === 'hbm';
      if (hbm) {
        sA.el.querySelector('i').textContent = 'Data links per stack'; sA.set('1,024');
        sB.el.querySelector('i').textContent = 'H100 SXM bus'; sB.set('5 × 1,024 = 5,120 bits');
        sC.el.querySelector('i').textContent = 'H100 SXM bandwidth'; sC.set('3.35 TB/s');
      } else {
        sA.el.querySelector('i').textContent = 'Data links per chip'; sA.set('32');
        sB.el.querySelector('i').textContent = 'RTX 4090 bus'; sB.set('12 × 32 = 384 bits');
        sC.el.querySelector('i').textContent = 'RTX 4090 bandwidth'; sC.set('≈1.0 TB/s');
      }
      if (st.hot) f.setWhy(PARTS[st.hot]);
      else f.setWhy(hbm
        ? '<b>HBM on an interposer.</b> The GPU die and stacks of DRAM dice sit side by side on one silicon interposer, joined by 1,024 short data links per stack. The white dots are data in flight between the stack and the GPU’s HBM controller. Hover any layer.'
        : '<b>A consumer card with GDDR.</b> The memory chips are separate packages on the circuit board, wired to the GPU through board traces, 32 data links per chip. Fewer, longer wires: less bandwidth and more latency. Hover any layer.');
      GG.decorate(f.why);
    }
    GG.ui.seg(f.controls, { label: 'Package', options: [{ value: 'hbm', label: 'H100: HBM on an interposer' }, { value: 'gddr', label: 'Consumer card: GDDR' }], value: st.mode, onChange: (v) => { st.mode = v; st.hot = null; refresh(); } });
    anim = GG.anim(box, (t) => tick(t));
    GG.ui.playButton(f.controls, anim);
    onWidth(box, (w) => { lastW = w; refresh(); });
    return f;
  }

  /* Fig: an SRAM cell vs a DRAM cell. */
  function cellFigure(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'SRAM vs DRAM: one bit each',
      hint: 'read the bits · let time pass',
      wide: true,
      caption: `Simplified schematics of one memory cell of each kind. The SRAM cell, used in the ${T('register-file', 'register file')} and ${T('l1-data-cache', 'L1 data cache')}: two cross-coupled inverters (four transistors) hold the bit in a loop, and two access transistors connect it to the bit lines. The DRAM cell, used in GPU RAM: one access transistor and one tiny capacitor whose charge is the bit. Both are memories, so both are drawn in blue; the shapes tell them apart (a loop vs a capacitor). Refresh timing is schematic. The strip at the bottom packs the same width of chip with cells, either counting parts only or (the <b>silicon area</b> setting) using typical textbook cell sizes: about 6 to 8 F² for a DRAM cell and 120 to 150 F² for a six-transistor SRAM cell, where F is the smallest feature the manufacturing process can draw; the strip uses the middles, 7 and 135. The cell details are standard textbook material, beyond the glossary.`,
    });
    const st = { charge: 1, bit: 1, reading: 0, refresh: true, readS: 0, strip: 'parts' };
    const box = el('div', { class: 'hwc-w' });
    f.stage.append(box);
    const sT = GG.ui.stat(f.readouts, { label: 'SRAM cell', value: '6 transistors', tone: 'memory' });
    GG.ui.stat(f.readouts, { label: 'DRAM cell', value: '1 transistor + 1 capacitor', tone: 'memory' });
    const sQ = GG.ui.stat(f.readouts, { label: 'DRAM charge', value: '—', tone: 'memory' });
    const sR = GG.ui.stat(f.readouts, { label: 'DRAM refreshes', value: '0', tone: 'control' });
    void sT;
    let lastW = 0, capRect = null, capLab = null, capMax = 0, capY = 0, refreshes = 0, readFlash = null, sramFlash = null, dramBit = null;
    function draw(w) {
      box.innerHTML = '';
      const narrow = w < 640;
      const pw = narrow ? w : (w - 20) / 2;
      const ph = 210;
      const stripTop = (narrow ? ph * 2 + 16 : ph) + 18;
      const H = stripTop + 74;
      const svg = svgRoot(box, w, H, 'Schematic of a six-transistor SRAM cell and a one-transistor, one-capacitor DRAM cell.');
      const panel = (x0, y0, title, sub, col) => {
        R(svg, x0 + 1, y0 + 1, pw - 2, ph - 2, 'fill:rgba(8,9,14,.45);stroke:var(--line-2)', { rx: 10 });
        Tx(svg, x0 + 12, y0 + 20, title, { fs: 12, fill: col, fw: 700 });
        Tx(svg, x0 + 12, y0 + 35, sub, { fs: 10, fill: 'var(--ink-3)' });
      };
      const tr = (g, x, y, lab) => { // a transistor symbol: gate bar + channel
        R(g, x - 10, y - 8, 20, 16, 'fill:var(--surface-3);stroke:var(--ink-2)', { rx: 2 });
        if (lab) Tx(g, x, y + 3.5, lab, { fs: 10, fill: 'var(--ink-2)', anchor: 'middle' });
      };
      // SRAM
      const sx = 0, sy = 0;
      panel(sx, sy, 'SRAM · static', 'registers, L1, CPU caches', 'var(--memory)');
      const cx = sx + pw / 2, cy = sy + 118;
      const blx = sx + pw * 0.14, blbx = sx + pw * 0.86;
      L(svg, blx, sy + 48, blx, sy + ph - 40, 'stroke:var(--ink-3);stroke-width:1.5');
      L(svg, blbx, sy + 48, blbx, sy + ph - 40, 'stroke:var(--ink-3);stroke-width:1.5');
      Tx(svg, blx, sy + ph - 28, 'BL', { fs: 10, fill: 'var(--ink-3)', anchor: 'middle' });
      Tx(svg, blbx, sy + ph - 28, 'BL̄', { fs: 10, fill: 'var(--ink-3)', anchor: 'middle' });
      L(svg, sx + pw * 0.08, sy + 62, sx + pw * 0.92, sy + 62, 'stroke:var(--control);stroke-width:1.5');
      Tx(svg, sx + pw * 0.92, sy + 56, 'word line', { fs: 10, fill: 'var(--control)', anchor: 'end' });
      // inverter loop
      const iw = Math.min(70, pw * 0.2);
      const inv = (x, y, flip) => {
        const d = flip ? `M${x + iw / 2} ${y - 12} L${x - iw / 2 + 8} ${y} L${x + iw / 2} ${y + 12} Z` : `M${x - iw / 2} ${y - 12} L${x + iw / 2 - 8} ${y} L${x - iw / 2} ${y + 12} Z`;
        P(svg, d, 'fill:var(--memory-a);stroke:var(--memory)');
        C(svg, flip ? x - iw / 2 + 4 : x + iw / 2 - 4, y, 3.5, 'fill:var(--bg);stroke:var(--memory)');
      };
      inv(cx, cy - 22, false); inv(cx, cy + 22, true);
      P(svg, `M${cx + iw / 2} ${cy - 22} L${cx + iw / 2 + 14} ${cy - 22} L${cx + iw / 2 + 14} ${cy + 22} L${cx + iw / 2} ${cy + 22}`, 'fill:none;stroke:var(--memory)');
      P(svg, `M${cx - iw / 2} ${cy + 22} L${cx - iw / 2 - 14} ${cy + 22} L${cx - iw / 2 - 14} ${cy - 22} L${cx - iw / 2} ${cy - 22}`, 'fill:none;stroke:var(--memory)');
      Tx(svg, cx, cy + 4, '4 T', { fs: 10, fill: 'var(--memory)', anchor: 'middle' });
      // access transistors
      const ax1 = (blx + cx - iw / 2 - 14) / 2, ax2 = (blbx + cx + iw / 2 + 14) / 2;
      L(svg, blx, cy - 22, ax1 - 10, cy - 22, 'stroke:var(--ink-3)'); L(svg, ax1 + 10, cy - 22, cx - iw / 2 - 14, cy - 22, 'stroke:var(--ink-3)');
      L(svg, blbx, cy + 22, ax2 + 10, cy + 22, 'stroke:var(--ink-3)'); L(svg, ax2 - 10, cy + 22, cx + iw / 2 + 14, cy + 22, 'stroke:var(--ink-3)');
      tr(svg, ax1, cy - 22, 'T'); tr(svg, ax2, cy + 22, 'T');
      L(svg, ax1, sy + 62, ax1, cy - 30, 'stroke:var(--control)'); L(svg, ax2, sy + 62, ax2, cy + 14, 'stroke:var(--control)');
      Tx(svg, sx + 12, sy + ph - 10, narrow ? 'holds its bit while powered' : 'holds the bit as long as power is on', { fs: 10, fill: 'var(--ink-2)' });
      sramFlash = Tx(svg, cx, cy - 44, 'bit = 1', { fs: 11, fill: 'var(--memory)', anchor: 'middle', fw: 700 });
      // DRAM
      const dx = narrow ? 0 : pw + 20, dy = narrow ? ph + 16 : 0;
      panel(dx, dy, 'DRAM · dynamic', 'GPU RAM, CPU main memory', 'var(--memory)');
      const bl = dx + pw * 0.2;
      L(svg, bl, dy + 48, bl, dy + ph - 40, 'stroke:var(--ink-3);stroke-width:1.5');
      Tx(svg, bl, dy + ph - 28, 'BL', { fs: 10, fill: 'var(--ink-3)', anchor: 'middle' });
      L(svg, dx + pw * 0.08, dy + 62, dx + pw * 0.92, dy + 62, 'stroke:var(--control);stroke-width:1.5');
      Tx(svg, dx + pw * 0.92, dy + 56, 'word line', { fs: 10, fill: 'var(--control)', anchor: 'end' });
      const tx = dx + pw * 0.42, ty = dy + 112;
      L(svg, bl, ty, tx - 10, ty, 'stroke:var(--ink-3)');
      tr(svg, tx, ty, 'T');
      L(svg, tx, dy + 62, tx, ty - 8, 'stroke:var(--control)');
      const capX = dx + pw * 0.62;
      L(svg, tx + 10, ty, capX, ty, 'stroke:var(--ink-3)');
      // capacitor: a well drawn as a tank whose fill is the charge
      const tankW = Math.min(64, pw * 0.2), tankH = 64;
      capMax = tankH - 4; capY = ty - tankH / 2 + 2;
      R(svg, capX, ty - tankH / 2, tankW, tankH, 'fill:rgba(255,255,255,.03);stroke:var(--memory)', { rx: 4 });
      capRect = R(svg, capX + 2, capY, tankW - 4, capMax, 'fill:var(--memory);opacity:.75', { rx: 2 });
      L(svg, capX, ty - tankH / 2 + capMax * 0.5 + 2, capX + tankW, ty - tankH / 2 + capMax * 0.5 + 2, 'stroke:var(--danger);stroke-dasharray:3 2');
      capLab = Tx(svg, capX + tankW / 2, ty + tankH / 2 + 14, 'capacitor', { fs: 10, fill: 'var(--memory)', anchor: 'middle' });
      Tx(svg, Math.min(capX + tankW / 2, dx + pw - 66), ty + tankH / 2 + 27, 'red line: sense limit', { fs: 10, fill: 'var(--danger)', anchor: 'middle' });
      dramBit = Tx(svg, capX + tankW / 2, ty - tankH / 2 - 8, 'bit = 1', { fs: 11, fill: 'var(--memory)', anchor: 'middle', fw: 700 });
      Tx(svg, dx + 12, dy + ph - 10, narrow ? 'leaks: must be refreshed' : 'charge leaks away: must be refreshed', { fs: 10, fill: 'var(--ink-2)' });
      readFlash = Tx(svg, bl + 6, dy + 90, '', { fs: 10, fill: 'var(--accent)' });
      // density strip: the same width of chip packed with cells, by parts count or by typical silicon area
      const sw0 = w - 110;
      const area = st.strip === 'area';
      Tx(svg, 0, stripTop - 4, area ? (narrow ? 'SAME WIDTH, BY SILICON AREA' : 'THE SAME WIDTH OF CHIP, PACKED WITH CELLS (TYPICAL SILICON AREA)') : (narrow ? 'SAME WIDTH, BY PARTS COUNT' : 'THE SAME WIDTH OF CHIP, PACKED WITH CELLS (COUNTING PARTS ONLY)'), { fs: 10, fill: 'var(--ink-3)', ls: '0.08em' });
      let nS, nD, sp = '', dp = '', caps = '';
      if (!area) {
        const g0 = 7, gp = 1.5, cgap = 7;
        const sramW = 6 * g0 + 5 * gp + cgap, dramW = g0 + gp + 4 + cgap;
        nS = Math.max(1, Math.floor((sw0 + cgap) / sramW)); nD = Math.max(1, Math.floor((sw0 + cgap) / dramW));
        for (let i = 0; i < nS; i++) for (let k = 0; k < 6; k++) { const x = i * sramW + k * (g0 + gp); sp += `M${x.toFixed(1)} ${stripTop + 8}h${g0}v${g0}h${-g0}z`; }
        for (let i = 0; i < nD; i++) { const x = i * dramW; dp += `M${x.toFixed(1)} ${stripTop + 40}h${g0}v${g0}h${-g0}z`; caps += `M${(x + g0 + gp).toFixed(1)} ${stripTop + 39}h4v${g0 + 2}h-4z`; }
      } else {
        // width proportional to area: a DRAM cell of ~7 F² is dW px wide (gap included), so a ~135 F² SRAM cell is dW × 135 / 7 px.
        // dW is 4 px, shrunk (to no less than 2) when needed so at least 4 SRAM cells fit; the strip then spans a whole number
        // of SRAM cells and the DRAM count is derived from that span, so the two counts keep the 135 : 7 ratio printed below.
        const AR = 135 / 7, dW = Math.min(4, Math.max(2, sw0 / (4 * AR))), sW = dW * AR;
        nS = Math.max(1, Math.floor(sw0 / sW + 1e-9)); nD = Math.round(nS * AR);
        for (let i = 0; i < nS; i++) sp += `M${(i * sW).toFixed(1)} ${stripTop + 8}h${(sW - 2).toFixed(1)}v8h${(-(sW - 2)).toFixed(1)}z`;
        for (let i = 0; i < nD; i++) dp += `M${(i * dW).toFixed(2)} ${stripTop + 40}h${(dW - 1).toFixed(2)}v8h${(-(dW - 1)).toFixed(2)}z`;
      }
      P(svg, sp, 'fill:var(--memory-a);stroke:var(--memory);stroke-width:.8');
      P(svg, dp, `fill:var(--memory-a);stroke:var(--memory);stroke-width:${area ? 0.4 : 0.8}`);
      if (caps) P(svg, caps, 'fill:var(--memory);stroke:none;opacity:.8');
      Tx(svg, w, stripTop + 16, `SRAM: ${nS} bits`, { fs: 10, fill: 'var(--ink-2)', anchor: 'end', fw: 600 });
      Tx(svg, w, stripTop + 48, `DRAM: ${nD} bits`, { fs: 10, fill: 'var(--ink-2)', anchor: 'end', fw: 600 });
      Tx(svg, 0, stripTop + 68, area
        ? (narrow ? 'by area: 135 ÷ 7 ≈ 19× the bits (real: 15–25×)' : 'by silicon area: 135 F² ÷ 7 F² ≈ 19× as many DRAM bits in the same space (typical cells: 15 to 25×)')
        : (narrow ? `${fmt.fixed(nD / nS, 1)}× the bits, by parts count` : `${fmt.fixed(nD / nS, 1)}× as many DRAM bits by parts count alone; by silicon area the gap is about 15 to 25×`), { fs: 10, fill: 'var(--ink-3)' });
      paint();
    }
    function paint() {
      if (!capRect) return;
      const q = clamp(st.charge, 0, 1);
      const h = capMax * q;
      capRect.setAttribute('y', (capY + capMax - h).toFixed(1));
      capRect.setAttribute('height', h.toFixed(1));
      const readable = q >= 0.5;
      capRect.setAttribute('style', `fill:${readable ? 'var(--memory)' : 'var(--danger)'};opacity:.75`);
      dramBit.textContent = readable ? 'bit = 1' : 'bit lost?';
      dramBit.setAttribute('style', dramBit.getAttribute('style').replace(/fill:[^;]+/, `fill:${readable ? 'var(--memory)' : 'var(--danger)'}`));
      sQ.set(`${Math.round(q * 100)}%`, readable ? 'memory' : 'danger');
      sR.set(String(refreshes));
    }
    const anim = GG.anim(box, (t, dt) => {
      st.charge -= dt * 0.16;
      if (st.refresh && st.charge < 0.62) { st.charge = 1; refreshes++; }
      if (st.reading > 0) { st.reading -= dt; if (st.reading <= 0 && readFlash) readFlash.textContent = ''; }
      if (st.charge < 0) st.charge = 0;
      paint();
    });
    GG.ui.playButton(f.controls, anim, { onToggle: () => update() });
    GG.ui.button(f.controls, { label: 'Read both bits', onClick: () => {
      if (sramFlash) { sramFlash.textContent = 'read: 1 (bit unchanged)'; setTimeout(() => { if (sramFlash) sramFlash.textContent = 'bit = 1'; }, 1600); }
      const ok = st.charge >= 0.5;
      // a DRAM read drains the capacitor onto the bit line; the sense amplifier then writes the value back
      st.charge = ok ? 1 : 0;
      if (readFlash) readFlash.textContent = ok ? 'read: drained, sensed, rewritten' : 'read failed: charge too low';
      st.reading = 1.6;
      paint();
      f.setWhy(ok
        ? '<b>Reading.</b> SRAM: the inverter loop drives the bit lines directly, a quick read that leaves the bit as it was. DRAM: opening the transistor dumps the capacitor’s tiny charge onto the bit line, a sense amplifier detects the small change, and the value must be written back, because the read destroyed it. More steps, so more time.'
        : '<b>Too late.</b> The DRAM capacitor leaked below what the sense amplifier can tell apart from 0, so the bit is gone. Real DRAM never lets this happen: its controller refreshes every row on a fixed schedule. Turn refresh back on.');
    } });
    GG.ui.button(f.controls, { label: 'Let time pass', onClick: () => {
      // one step of leakage, with a refresh if the controller is allowed to do one
      st.charge = Math.max(0, st.charge - 0.15);
      let did = false;
      if (st.refresh && st.charge < 0.62) { st.charge = 1; refreshes++; did = true; }
      paint();
      const q = Math.round(st.charge * 100);
      f.setWhy(did
        ? `<b>Refresh.</b> The charge leaked toward the sense limit, so the controller read the bit and wrote it back at full strength: refresh number ${refreshes}. The SRAM bit needed nothing.`
        : st.charge >= 0.5
          ? `<b>Time passes.</b> The DRAM capacitor has leaked to ${q}% of its charge. ${st.refresh ? 'Press again: before it gets too low, the controller will refresh it.' : 'Refresh is off, so nothing will top it up.'} The SRAM bit is unchanged.`
          : `<b>Too late.</b> The DRAM charge is down to ${q}%, below what the sense amplifier can tell apart from 0: the bit is lost. Real DRAM never lets this happen. The SRAM bit is unchanged.`);
    } });
    GG.ui.seg(f.controls, { label: 'Strip counts', options: [{ value: 'parts', label: 'parts' }, { value: 'area', label: 'silicon area' }], value: st.strip, onChange: (v) => { st.strip = v; draw(lastW); } });
    GG.ui.toggle(f.controls, { label: 'Refresh DRAM', value: st.refresh, onChange: (v) => { st.refresh = v; if (v && st.charge < 0.5) { st.charge = 1; refreshes++; } update(); } });
    function update() {
      f.setWhy(st.refresh
        ? `<b>Static vs dynamic.</b> The SRAM bit is held by a loop of transistors that keeps re-driving itself, so it stays put with no help. The DRAM bit is charge on a capacitor that slowly leaks${anim.running ? ' (watch the level drop)' : ' (press <b>Let time pass</b> or <b>Play</b> to watch it leak)'}, so the memory controller must read and rewrite it periodically: a <b>refresh</b>. One transistor and one capacitor per bit makes DRAM far denser (the strip below); the extra steps make it slower.`
        : `<b>Refresh is off.</b> Without periodic refresh, the DRAM capacitor’s charge leaks below the sense limit and the bit is lost${anim.running ? '' : ' (press <b>Let time pass</b> a few times)'}. The SRAM bit is unaffected.`);
    }
    onWidth(box, (w) => { lastW = w; draw(w); });
    update();
    return f;
  }

  /* Fig: capacity of each level: log-scale dots, or to scale as squares of 33 MiB. */
  function capacityFigure(slot, ctx) {
    const f = ctx.figure(slot, {
      title: 'How much each level holds on an H100 SXM',
      hint: 'to scale or log scale · switch units · hover a level',
      caption: `Total capacity of each level across the whole GPU. <b>To scale</b>: every square is the same size, 33 MiB, the L1 data caches of all 132 SMs together; the on-chip memories are the small group at the top, GPU RAM the large grid below it. <b>Log scale</b>: each grid line is 10× the last and every bar starts at the left end of the axis, so a bar's length counts powers of ten, not bytes. The register file and L1 data cache totals are 132 SMs × 256 KiB each. The L2 cache (50 MiB on an H100 SXM, which NVIDIA writes as “50 MB”) is context beyond this entry.`,
    });
    const MiB = 1024 ** 2, UNIT = 132 * 256 * 1024;
    const LEVELS = [
      { k: 'rf', name: 'Register files', bytes: UNIT, note: '132 × 256 KiB = 33 MiB', cell: 'SRAM' },
      { k: 'l1', name: 'L1 data caches', bytes: UNIT, note: '132 × 256 KiB = 33 MiB', cell: 'SRAM' },
      { k: 'l2', name: 'L2 cache', bytes: 50 * MiB, note: '50 MiB, written “50 MB” by NVIDIA (beyond the glossary)', cell: 'SRAM' },
      { k: 'ram', name: 'GPU RAM', bytes: 80 * 1024 ** 3, note: '80 GiB of HBM3', cell: 'DRAM' },
    ];
    const RATIO = LEVELS[3].bytes / UNIT; // 2,482.4
    const st = { unit: 'bytes', hot: 'ram', view: 'scale' };
    const box = el('div', { class: 'hwc-w' });
    f.stage.append(box);
    const sV = GG.ui.stat(f.readouts, { label: 'GPU RAM', value: '—', tone: 'memory' });
    const sX = GG.ui.stat(f.readouts, { label: 'RAM ÷ all L1 caches', value: '—', tone: 'memory' });
    let lastW = 0;
    const fmtBits = (b) => fmt.int(b * 8) + ' bits';
    const valText = (lv) => (st.unit === 'bits' ? fmtBits(lv.bytes) : fmt.bytes(lv.bytes, 0));
    const SQ_FILL = { rf: 'var(--memory)', l1: 'var(--memory)', l2: '#a9c8ff', ram: 'rgba(111,166,255,.28)' };

    function drawLog(w) {
      const narrow = w < 520;
      const labW = narrow ? 104 : 130;
      const rowH = 40, top = 10;
      const plotR = w - 16; // room for the last tick label, centred on the axis end
      const bracketY = top + LEVELS.length * rowH + 10;
      const H = bracketY + 52;
      const svg = svgRoot(box, w, H, 'Capacity of registers, L1, L2 and GPU RAM on an H100 SXM, as bars on a logarithmic axis.');
      const scale = st.unit === 'bits' ? 8 : 1;
      const lo2 = st.unit === 'bits' ? 7 : 6, hi2 = st.unit === 'bits' ? 13 : 12;
      const x = (v) => labW + ((Math.log10(v) - lo2) / (hi2 - lo2)) * (plotR - labW);
      for (let e = lo2; e <= hi2; e++) {
        const gx = x(10 ** e);
        L(svg, gx, top - 2, gx, top + LEVELS.length * rowH, 'stroke:rgba(255,255,255,.07)');
        Tx(svg, gx, H - 6, '10' + String(e).split('').map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]).join(''), { fs: 10, fill: 'var(--ink-3)', anchor: 'middle' });
      }
      Tx(svg, labW, H - 18, st.unit === 'bits' ? 'bits (log scale)' : 'bytes (log scale)', { fs: 10, fill: 'var(--ink-3)' });
      const dotX = {};
      LEVELS.forEach((lv, i) => {
        const y = top + i * rowH, cy = y + rowH / 2 - 2;
        const v = lv.bytes * scale;
        const on = st.hot === lv.k;
        const g = G(svg, { class: 'hwc-fade' });
        R(g, 0, y, w, rowH - 4, `fill:${on ? 'rgba(255,255,255,.035)' : 'transparent'}`, { rx: 6 });
        Tx(g, 4, y + 15, lv.name, { fs: narrow ? 10.5 : 12, fill: on ? 'var(--ink)' : 'var(--ink-2)', ff: 'body', fw: 600 });
        Tx(g, 4, y + 29, lv.cell + (lv.cell === 'DRAM' ? ' · off-chip' : ' · on-chip'), { fs: 10, fill: 'var(--memory)' });
        L(g, labW, cy, plotR, cy, 'stroke:var(--line-2);stroke-dasharray:1 4');
        const dx = x(v);
        dotX[lv.k] = dx;
        // a bar from the axis origin: its length is the number of powers of ten
        R(g, labW, cy - 7, dx - labW, 14, `fill:${lv.cell === 'DRAM' ? 'rgba(111,166,255,.32)' : 'var(--memory)'};stroke:var(--memory);opacity:${on ? 1 : 0.7}`, { rx: 2 });
        const val = valText(lv);
        const right = dx + 8 + val.length * 6.4 < plotR;
        Tx(g, right ? dx + 8 : dx - 8, cy + 4, val, { fs: narrow ? 10 : 10.5, fill: right || lv.cell === 'DRAM' ? 'var(--ink)' : 'var(--bg)', anchor: right ? 'start' : 'end', fw: 600 });
        hit(g, lv.name, { enter: () => { st.hot = lv.k; update(); }, click: () => { st.hot = lv.k; update(); } });
      });
      // bracket from all L1 caches to GPU RAM: the factor, in decades
      const a = dotX.l1, b = dotX.ram;
      P(svg, `M${a} ${bracketY - 6} L${a} ${bracketY} L${b} ${bracketY} L${b} ${bracketY - 6}`, 'fill:none;stroke:var(--memory)');
      Tx(svg, (a + b) / 2, bracketY + 14, `×${fmt.int(RATIO)} · about ${fmt.fixed(Math.log10(RATIO), 1)} powers of ten`, { fs: narrow ? 10 : 10.5, fill: 'var(--memory)', anchor: 'middle', fw: 600 });
    }

    function drawScale(w) {
      const narrow = w < 520;
      const cols = narrow ? 48 : 72;
      const s = (w - 2) / cols, sq = s - (s > 7 ? 1.4 : 0.9);
      const full = Math.floor(RATIO), part = RATIO - full;
      const rows = Math.ceil((full + 1) / cols);
      const l2sq = LEVELS[2].bytes / UNIT;
      // on-chip SRAM as its own small group, then the off-chip DRAM grid, every square the same size
      const big = sq, bg = Math.max(3, s - sq + 2);
      const onTop = 30, onH = Math.max(big, 12);
      const gridLab = onTop + onH + 30, top = gridLab + 10;
      const legY = top + rows * s + 18;
      const H = legY + (narrow ? 56 : 30);
      const svg = svgRoot(box, w, H, `To scale: the on-chip SRAM (register files, L1 caches and L2, 3.5 squares) and, separately, GPU RAM as ${fmt.int(RATIO)} squares, each square 33 MiB, the size of all 132 L1 data caches together.`);
      Tx(svg, 1, 12, narrow ? '1 square = 33 MiB = all 132 L1 caches' : 'ONE SQUARE = 33 MiB = THE L1 DATA CACHES OF ALL 132 SMs TOGETHER', { fs: 10, fill: 'var(--ink-3)', ls: narrow ? null : '0.08em' });
      // on chip
      const onX = [1, 1 + big + bg, 1 + 2 * (big + bg)];
      const hot = (k) => st.hot === k;
      R(svg, onX[0], onTop, big, big, `fill:${SQ_FILL.rf};stroke:${hot('rf') ? 'var(--ink)' : 'none'};stroke-width:1.5`);
      R(svg, onX[1], onTop, big, big, `fill:${SQ_FILL.l1};opacity:.75;stroke:${hot('l1') ? 'var(--ink)' : 'none'};stroke-width:1.5`);
      R(svg, onX[2], onTop, big * l2sq, big, `fill:${SQ_FILL.l2};stroke:${hot('l2') ? 'var(--ink)' : 'none'};stroke-width:1.5`);
      L(svg, onX[2] + big, onTop + 2, onX[2] + big, onTop + big - 2, 'stroke:rgba(11,12,18,.6)');
      const onEnd = onX[2] + big * l2sq;
      P(svg, `M1 ${onTop - 5} L1 ${onTop - 9} L${onEnd} ${onTop - 9} L${onEnd} ${onTop - 5}`, 'fill:none;stroke:var(--memory)');
      Tx(svg, onEnd + 10, onTop + Math.max(big, 8) / 2 + 4, narrow ? 'on chip: SRAM, 3.5 squares' : 'on chip, SRAM: register files 1 + L1 caches 1 + L2 1.5 = 3.5 squares', { fs: 10, fill: 'var(--memory)', fw: 600 });
      // off chip
      Tx(svg, 1, gridLab, narrow ? `off chip: GPU RAM, ${fmt.int(RATIO)} squares` : `OFF CHIP, DRAM: GPU RAM, ${fmt.int(RATIO)} SQUARES AT THE SAME 33 MiB EACH`, { fs: 10, fill: 'var(--memory)', ls: narrow ? null : '0.06em', fw: 600 });
      const pos = (i) => [1 + (i % cols) * s, top + Math.floor(i / cols) * s];
      let d = '';
      for (let i = 0; i < full; i++) { const [x, y] = pos(i); d += `M${x.toFixed(2)} ${y.toFixed(2)}h${sq.toFixed(2)}v${sq.toFixed(2)}h${(-sq).toFixed(2)}z`; }
      const [px, py] = pos(full);
      d += `M${px.toFixed(2)} ${py.toFixed(2)}h${(sq * part).toFixed(2)}v${sq.toFixed(2)}h${(-sq * part).toFixed(2)}z`;
      P(svg, d, `fill:${hot('ram') ? 'rgba(111,166,255,.45)' : SQ_FILL.ram};stroke:none`);
      const leg = [
        ['rf', 'Register files: 1 square', SQ_FILL.rf],
        ['l1', 'L1 data caches: 1 square', SQ_FILL.l1],
        ['l2', `L2: ${fmt.fixed(l2sq, 1)} squares`, SQ_FILL.l2],
        ['ram', `GPU RAM: all ${fmt.int(RATIO)}`, 'rgba(111,166,255,.45)'],
      ];
      leg.forEach(([k, t, c], i) => {
        const g = G(svg, { class: 'hwc-fade' });
        const lx = narrow ? (i % 2) * (w / 2) : i * (w / 4), ly = legY + (narrow ? Math.floor(i / 2) * 20 : 0);
        R(g, lx, ly - 9, 11, 11, `fill:${c};opacity:${k === 'l1' ? 0.75 : 1}`, { rx: 2 });
        Tx(g, lx + 16, ly, t, { fs: 10, fill: hot(k) ? 'var(--ink)' : 'var(--ink-2)', fw: hot(k) ? 600 : 400 });
        hit(g, t, { enter: () => { st.hot = k; update(); }, click: () => { st.hot = k; update(); } });
      });
    }

    function update() {
      box.innerHTML = '';
      if (st.view === 'log') drawLog(lastW); else drawScale(lastW);
      const lv = LEVELS.find((l) => l.k === st.hot);
      sV.set(st.unit === 'bits' ? fmtBits(LEVELS[3].bytes) : '80 GiB');
      sX.set(`${fmt.int(RATIO)}×`);
      const extra = lv.k === 'ram'
        ? ` 80 GiB = 80 × 1,073,741,824 bytes = 85,899,345,920 bytes = <b>687,194,767,360 bits</b>, about ${fmt.int(RATIO)} times the 33 MiB of all 132 L1 data caches together.`
        : lv.k === 'l2' ? ` That is ${fmt.int(lv.bytes)} bytes = ${fmtBits(lv.bytes)}. The L2 is shared by all SMs and sits between the L1s and GPU RAM.` : ` That is ${fmt.int(lv.bytes)} bytes = ${fmtBits(lv.bytes)}.`;
      const viewNote = st.view === 'scale'
        ? ` Drawn to scale, ${lv.k === 'ram' ? `GPU RAM is the whole grid of ${fmt.int(RATIO)} squares, against 3.5 squares for everything on the chip` : lv.k === 'l2' ? `the L2 is ${fmt.fixed(LEVELS[2].bytes / UNIT, 1)} squares, in the on-chip group` : 'this is a single square, in the on-chip group'}.`
        : '';
      f.setWhy(`<b>${lv.name}:</b> ${lv.note}, built from ${lv.cell} cells.${extra}${viewNote}`);
    }
    GG.ui.seg(f.controls, { label: 'View', options: [{ value: 'scale', label: 'to scale' }, { value: 'log', label: 'log scale' }], value: st.view, onChange: (v) => { st.view = v; update(); } });
    GG.ui.seg(f.controls, { label: 'Units', options: [{ value: 'bytes', label: 'bytes' }, { value: 'bits', label: 'bits' }], value: st.unit, onChange: (v) => { st.unit = v; update(); } });
    onWidth(box, (w) => { lastW = w; update(); });
    return f;
  }

  /* Fig: the speed side of the trade-off: one load from each level, raced to the cores.
     A "unit" is a tenth of an L1 hit, so registers are 1 and the L1 is 10 (the glossary's order of magnitude).
     L2 and GPU RAM are scaled by measured Hopper latencies (Luo et al. 2024, H800: L1 hit 40.7 cycles,
     L2 263.0, global memory 478.8): 263.0 / 4.07 ≈ 65, 478.8 / 4.07 ≈ 118 → about 120. */
  const RACE = {
    rf: { name: 'Register file', short: 'regs', lat: 1, lab: '1×' },
    l1: { name: 'L1 data cache / shared memory', short: 'L1', lat: 10, lab: '~10×' },
    l2: { name: 'L2 cache', short: 'L2', lat: 65, lab: '~65×' },
    ram: { name: 'GPU RAM / global memory', short: 'RAM', lat: 120, lab: '~120×' },
  };
  /* Fig (register file, L1 data cache): the same four loads as GPU RAM's race, drawn as a static ladder to scale,
     with the entry's own level picked out. o: { title, focus: 'rf' | 'l1', caption, why: { rf, l1, l2, ram } } */
  const LADDER_CAPTION = `Time for one load that finds its data at each level, with nothing else in the way, in units of one register access, drawn to scale. Registers keep pace with the cores and the L1 data cache is about an order of magnitude slower (both from the glossary), so the L1 bar is 10 units. The dashed L2 and GPU RAM bars are scaled by microbenchmarks of a Hopper GPU (<a href="https://arxiv.org/abs/2402.13499">Luo et al. 2024</a>, on an H800: an L1 hit takes about 41 clock cycles, an L2 hit about 263 and a load from global memory about 479), so about 65 and 120 units (beyond the glossary). ${T('gpu-ram', 'GPU RAM')}'s Fig.&nbsp;5 races the four loads against each other.`;
  function ladderFigure(slot, ctx, o) {
    const f = ctx.figure(slot, { title: o.title, hint: 'hover or tap a level', caption: o.caption });
    const KEYS = ['rf', 'l1', 'l2', 'ram'];
    const MEASURED = { l2: true, ram: true };
    const MAX = RACE.ram.lat;
    const st = { sel: o.focus };
    const box = el('div', { class: 'hwc-w' });
    f.stage.append(box);
    const base = RACE[o.focus];
    const sT = GG.ui.stat(f.readouts, { label: 'Access time', value: '—', tone: 'memory' });
    const sR = GG.ui.stat(f.readouts, { label: o.focus === 'rf' ? 'vs a register access' : 'vs an L1 hit', value: '—', tone: 'memory' });
    let lastW = 0;
    const units = (k) => `${k === 'rf' ? '' : '~'}${RACE[k].lat} ${plural(RACE[k].lat, 'unit')}`;
    const ratio = (k) => { const r = RACE[k].lat / base.lat; return `${r < 1 ? fmt.fixed(r, 1) : r % 1 ? fmt.fixed(r, 1) : fmt.int(r)}×`; };
    function draw(w) {
      box.innerHTML = '';
      const narrow = w < 520;
      const labW = narrow ? 0 : 196, rowH = narrow ? 46 : 36, top = 4;
      const bx0 = labW + 2, bx1 = w - (narrow ? 64 : 78);
      const x = (u) => bx0 + (u / MAX) * (bx1 - bx0);
      const axisY = top + KEYS.length * rowH + 4;
      const H = axisY + 40;
      const svg = svgRoot(box, w, H, `Access time of registers, L1, L2 and GPU RAM, to scale in units of one register access: 1, about 10, about 65 and about 120.`);
      for (let u = 0; u <= MAX; u += 10) {
        L(svg, x(u), top, x(u), axisY, `stroke:rgba(255,255,255,${u % 20 ? 0.035 : 0.07})`);
        if (u % (narrow ? 40 : 20) === 0) Tx(svg, x(u), axisY + 14, String(u), { fs: 10, fill: 'var(--ink-3)', anchor: 'middle' });
      }
      L(svg, bx0, axisY, x(MAX), axisY, 'stroke:var(--ink-3)');
      Tx(svg, bx0, axisY + 30, narrow ? 'register accesses (to scale)' : 'TIME, IN REGISTER ACCESSES, TO SCALE', { fs: 10, fill: 'var(--ink-3)', ls: narrow ? null : '0.08em' });
      KEYS.forEach((k, i) => {
        const lv = RACE[k], y = top + i * rowH;
        const on = st.sel === k, mine = k === o.focus;
        const g = G(svg, { class: 'hwc-fade' });
        R(g, 0, y, w, rowH - 4, `fill:${on ? 'rgba(255,255,255,.045)' : 'transparent'};stroke:none`, { rx: 6 });
        const by = narrow ? y + 20 : y + 8, bh = narrow ? 16 : rowH - 20;
        const name = narrow && k === 'l1' ? 'L1 data cache / shared memory' : lv.name;
        Tx(g, narrow ? 4 : 6, narrow ? y + 13 : y + rowH / 2 + 2, name + (mine ? '  ◂ this entry' : ''), { fs: narrow ? 10.5 : 11.5, fill: on || mine ? 'var(--ink)' : 'var(--ink-2)', ff: 'body', fw: mine ? 700 : 600 });
        const bw = Math.max(2, x(lv.lat) - bx0);
        R(g, bx0, by, bw, bh, MEASURED[k]
          ? `fill:rgba(111,166,255,${on ? 0.3 : 0.16});stroke:var(--memory);stroke-dasharray:4 3`
          : `fill:var(--memory);stroke:var(--memory);opacity:${on ? 1 : 0.7}`, { rx: 2 });
        Tx(g, bx0 + bw + 7, by + bh / 2 + 4, units(k), { fs: narrow ? 10 : 10.5, fill: on ? 'var(--ink)' : 'var(--ink-2)', fw: 600 });
        hit(g, `${lv.name}: ${units(k)}`, { enter: () => { st.sel = k; update(); }, click: () => { st.sel = k; update(); } });
      });
    }
    function update() {
      draw(lastW);
      sT.set(units(st.sel));
      sR.set(ratio(st.sel));
      f.setWhy(o.why[st.sel]);
      GG.decorate(f.why);
    }
    onWidth(box, (w) => { lastW = w; update(); });
    return f;
  }
  function speedFigure(slot, ctx, o) {
    const f = ctx.figure(slot, { title: o.title, hint: 'press Race to replay', caption: o.caption });
    const LANES = o.keys.map((k) => Object.assign({ k }, RACE[k]));
    const END = LANES[LANES.length - 1].lat;
    const decades = Math.max(2, Math.ceil(Math.log10(END) + 0.01));
    const box = el('div', { class: 'hwc-w' });
    f.stage.append(box);
    const sE = GG.ui.stat(f.readouts, { label: 'Time elapsed', value: '0 units', tone: 'control' });
    GG.ui.stat(f.readouts, { label: o.ratioLabel, value: o.ratioValue, tone: 'memory' });
    // opens on the finished frame, so the result shows before anyone presses Race
    let dots = [], arrived = [], units = END, geo = null, arrivedN = -1;
    function draw(w) {
      box.innerHTML = '';
      const narrow = w < 520;
      const laneH = 54, top = 4, coreW = narrow ? 44 : 56;
      const x0 = 4, x1 = w - coreW - 10;
      const axisY = top + LANES.length * laneH + 40;
      const H = axisY + 34;
      const svg = svgRoot(box, w, H, `${LANES.length} loads, from ${LANES.map((l) => l.short).join(', ')}, travelling to the cores; the further the memory, the longer the trip.`);
      R(svg, w - coreW - 2, top + 2, coreW, LANES.length * laneH - 8, 'fill:var(--core-a);stroke:var(--core)', { rx: 8 });
      Tx(svg, w - coreW / 2 - 2, top + (LANES.length * laneH) / 2 + 2, 'cores', { fs: narrow ? 10 : 11, fill: 'var(--core)', anchor: 'middle', fw: 600 });
      dots = []; arrived = [];
      LANES.forEach((ln, i) => {
        const y = top + i * laneH, ty = y + 30;
        Tx(svg, x0, y + 13, narrow && ln.k === 'l1' ? 'L1 / shared memory' : ln.name, { fs: narrow ? 10.5 : 11, fill: 'var(--ink)', ff: 'body', fw: 600 });
        Tx(svg, x1, y + 13, ln.lab, { fs: narrow ? 10 : 10.5, fill: 'var(--memory)', anchor: 'end', fw: 600 });
        R(svg, x0, ty - 6, 12, 12, 'fill:var(--memory-a);stroke:var(--memory)', { rx: 2 });
        L(svg, x0 + 14, ty, x1, ty, 'stroke:var(--line-2);stroke-dasharray:2 4');
        arrowHead(svg, x1 + 6, ty, 'r', 5, 'var(--line-2)');
        dots.push(C(svg, x0 + 20, ty, 5, 'fill:var(--memory)'));
        arrived.push(Tx(svg, x0 + 14, ty + 16, '', { fs: 10, fill: 'var(--ink-3)' }));
      });
      // static companion: the same levels on a log axis of relative access time
      const ax0 = x0 + 8, ax1 = w - 14;
      const ax = (v) => ax0 + (Math.log10(v) / decades) * (ax1 - ax0);
      L(svg, ax0, axisY, ax1, axisY, 'stroke:var(--ink-3)');
      for (let e = 0; e <= decades; e++) { L(svg, ax(10 ** e), axisY - 3, ax(10 ** e), axisY + 3, 'stroke:var(--ink-3)'); Tx(svg, ax(10 ** e), axisY + 16, fmt.int(10 ** e) + '×', { fs: 10, fill: 'var(--ink-3)', anchor: e === decades ? 'end' : 'middle' }); }
      Tx(svg, ax0, axisY - 26, narrow ? 'relative access time (log)' : 'RELATIVE ACCESS TIME, LOG SCALE', { fs: 10, fill: 'var(--ink-3)', ls: narrow ? null : '0.08em' });
      LANES.forEach((ln) => { C(svg, ax(ln.lat), axisY, 5, 'fill:var(--memory)'); Tx(svg, ax(ln.lat), axisY - 8, ln.short, { fs: 10, fill: 'var(--memory)', anchor: 'middle', fw: 600 }); });
      geo = { x0: x0 + 20, x1: x1 - 4 };
      paint();
    }
    function paint() {
      if (!geo) return;
      let n = 0;
      LANES.forEach((ln, i) => {
        const p = clamp(units / ln.lat, 0, 1);
        dots[i].setAttribute('cx', (geo.x0 + (geo.x1 - geo.x0) * p).toFixed(1));
        arrived[i].textContent = p >= 1 ? `arrived after ${fmt.int(ln.lat)} ${plural(ln.lat, 'unit')}` : '';
        if (p >= 1) n++;
      });
      const u = Math.min(units, END);
      sE.set(`${u < 10 ? fmt.fixed(u, 1) : fmt.int(u)} ${u === 1 ? 'unit' : 'units'}`);
      if (n !== arrivedN) { arrivedN = n; why(); }
    }
    function why() {
      if (units <= 0) f.setWhy(`${LANES.length === 2 ? 'Two' : LANES.length === 3 ? 'Three' : 'Four'} loads leave at the same moment: one from each of ${LANES.map((l) => l.name.split(' /')[0].replace(/^GPU RAM$/, 'GPU RAM')).join(', ')}. A “unit” is the time a register access takes, about a tenth of an L1 hit. Press <b>Race</b>.`);
      else if (units < END) {
        const done = LANES.filter((l) => units >= l.lat).map((l) => l.short), wait = LANES.filter((l) => units < l.lat).map((l) => l.short);
        f.setWhy(`<b>In flight.</b> ${done.length ? `Arrived: ${done.join(', ')}.` : 'Nothing has arrived yet.'} Still on the way: ${wait.join(', ')}.`);
      } else f.setWhy(o.finish);
      GG.decorate(f.why);
    }
    const anim = GG.anim(box, (t) => {
      units = (t * 1000) / o.msPerUnit;
      if (units >= END) { units = END; anim.stop(); }
      paint();
    }, { autostart: false });
    const restart = () => { anim.stop(); anim.reset(); units = 0; arrivedN = -1; paint(); };
    GG.ui.button(f.controls, { label: 'Race', icon: 'play', onClick: () => { restart(); anim.start(); } });
    GG.ui.button(f.controls, { label: 'Jump to the finish', onClick: () => { anim.stop(); units = END; paint(); } });
    GG.ui.button(f.controls, { label: 'Reset', icon: 'reset', onClick: restart });
    onWidth(box, (w) => draw(w));
    why();
    return f;
  }

  GG.entry('gpu-ram', {
    render(body, ctx) {
      const s = ctx.html(body, `
<p>The bottom-level memory of the GPU is a large (many megabytes to gigabytes) memory store that is addressable by all of the GPU's ${T('streaming-multiprocessor', 'Streaming Multiprocessors (SMs)')}. Whatever the SMs need that is not already on chip, in their ${T('register-file', 'register files')}, their ${T('l1-data-cache', 'L1 data caches')} or the L2 cache they all share, ultimately comes from here.</p>
<div data-slot="pkg"></div>
<h3>RAM, VRAM, DRAM</h3>
<p>It is also known as <b>GPU RAM</b> (random access memory: any address can be read in about the same time) or <b>video RAM (VRAM)</b>, a name from the days when a graphics card's memory mostly held the image being sent to the screen. It is built from <b>Dynamic RAM (DRAM)</b> cells, which are slower but smaller than the <b>Static RAM (SRAM)</b> used in ${T('register-file', 'registers')} and ${T('l1-data-cache', 'cache memory')}. Fig.&nbsp;2 puts one cell of each side by side.</p>
<div data-slot="cell"></div>
<p>For details on DRAM and SRAM, we recommend Ulrich Drepper's 2007 article <a href="https://people.freebsd.org/~lstewart/articles/cpumemory.pdf">“What Every Programmer Should Know About Memory”</a>. Its first chapters build both cells up from transistors and explain why DRAM needs refresh and sense amplifiers.</p>
<h3>Off the die, but close</h3>
<p>GPU RAM is generally not on the same die as the ${T('streaming-multiprocessor', 'SMs')}, though in the latest data center-grade GPUs like the H100, it is located on a shared <a href="https://en.wikipedia.org/wiki/Interposer">interposer</a> for decreased latency and increased ${T('memory-bandwidth', 'bandwidth')}. The interposer is a slab of silicon wired like a tiny, extremely dense circuit board; the GPU die and the memory both sit on it, millimetres apart (Fig.&nbsp;1).</p>
<p>These GPUs use <a href="https://en.wikipedia.org/wiki/High_Bandwidth_Memory">High-Bandwidth Memory (HBM)</a> technology, rather than the more familiar <b>Double Data Rate (DDR)</b> memory in consumer GPUs and CPUs. HBM stacks several DRAM dice on top of each other, connects them with vertical through-silicon vias, and talks to the GPU over a very wide, relatively slow interface: 1,024 data links per stack. DDR-style memory uses separate chips with narrow, very fast interfaces. Switch Fig.&nbsp;1 to the consumer card to compare.</p>
${GG.noteHTML('beyond', `<p><b>DDR, GDDR and HBM.</b> “Double data rate” means data moves on both the rising and the falling edge of the clock. CPUs use DDR memory modules; consumer graphics cards use GDDR (“graphics DDR”), a variant tuned for bandwidth, with 32 data lines per chip. An RTX 4090, for example, has 12 GDDR6X chips on a 384-bit bus for about 1.0 TB/s. An H100 SXM has five active HBM3 stacks, 5 × 1,024 = 5,120 data links, for 3.35 TB/s.</p>`)}
${GG.noteHTML('check', `<p><b>The “500 MHz” in the original figure.</b> The schematic's label, “1024 data links / HBM stack @ 500MHz”, comes from Wikipedia's drawing of first-generation HBM: 500 MHz with double data rate is 1 Gbit/s per link, so 1,024 links give 128 GB/s per stack. An H100 SXM's 3.35 TB/s over 5,120 links works out to 3.35 × 10<sup>12</sup> × 8 ÷ 5,120 ≈ <b>5.2 Gbit/s per link</b>, about five times faster per wire. The 1,024-link width per stack stayed the same from HBM1 through HBM3 (the H100's generation) and HBM3E (H200, B200); HBM4 (JEDEC, 2025) doubles it to 2,048.</p>`)}
<h3>What lives there</h3>
<p>RAM is used to implement the ${T('global-memory', 'global memory')} of the ${T('cuda-programming-model', 'CUDA programming model')} and to store ${T('registers', 'register')} data that spills from the ${T('register-file', 'register file')}: when a kernel needs more registers than it is allowed, the compiler parks some values in GPU RAM and loads them back when needed (see the spill in the ${T('register-file', 'Register File')} entry's Fig.&nbsp;3).</p>
<div data-slot="map"></div>
<h3>How much</h3>
<p>An H100 can store 80 GiB (687,194,767,360 bits) in its RAM. That is 80 × 2<sup>30</sup> bytes × 8 bits per byte, and it checks out.</p>
<div data-slot="cap"></div>
<h3>Small and fast, big and slow</h3>
<p>Capacity is half of the trade-off; speed is the other half. The ${T('register-file', 'register file')} keeps pace with the cores, the ${T('l1-data-cache', 'L1 data cache')} is about an order of magnitude slower, and GPU RAM, built from slower DRAM and sitting off the die, is slower still. Fig.&nbsp;5 sends one load from each level at the same moment.</p>
<div data-slot="speed"></div>
${GG.noteHTML('check', `<p><b>How much slower is GPU RAM?</b> The glossary gives two factors, registers about ten times faster than the L1 and the L1 about ten times slower than the cores, and none for GPU RAM. An often-quoted rule of thumb from NVIDIA's 2013 blog post <a href="https://developer.nvidia.com/blog/using-shared-memory-cuda-cc/">“Using Shared Memory in CUDA C/C++”</a>, written in the Kepler era, says “shared memory latency is roughly 100x lower than uncached global memory latency”. On Hopper the measured gap is much smaller: <a href="https://arxiv.org/abs/2402.13499">Luo et al. (2024)</a> time a shared memory load at 29.0 cycles, an L1 hit at 40.7, an L2 hit at 263.0 and a global memory load at 478.8 on an H800 (a PCIe card with HBM2e memory, an older generation than the H100 SXM’s HBM3), so GPU RAM is about 478.8 ÷ 40.7 ≈ <b>12</b> to 478.8 ÷ 29.0 ≈ <b>17</b> times slower than the L1, not 100. The same authors’ expanded study (<a href="https://arxiv.org/abs/2501.12084">Luo et al., 2025</a>), with a different setup, measures 656 cycles for global memory, which puts the gap to shared memory at about 23×; the ${T('shared-memory', 'Shared Memory')} entry's note compares the two, 17 to 23×. With registers at a tenth of an L1 hit, that is about 120 register accesses, which is what Fig.&nbsp;5 draws. Latency is only part of the cost: ${T('memory-bandwidth', 'bandwidth')}, and how many loads are in flight, matter as much.</p>`)}
<div data-slot="read"></div>`);
      guard(s.pkg, 'Fig. 1', () => packageFigure(s.pkg, ctx));
      guard(s.cell, 'Fig. 2', () => cellFigure(s.cell, ctx));
      guard(s.map, 'Fig. 3', () => {
        const f = ctx.figure(s.map, {
          title: 'Global memory lives in GPU RAM',
          hint: 'hover or tap a level',
          wide: true,
          caption: `The ${T('cuda-programming-model', 'CUDA programming model')} mapped onto the hardware. GPU RAM is the hardware side of global memory, and also where values that spill from the register file go.`,
        });
        const map = GG.components.modelMap(f.stage, { highlight: 'ram', caption: false });
        GG.ui.seg(f.controls, { label: 'Show', options: [{ value: 'ram', label: 'Global memory → GPU RAM' }, { value: 'registers', label: 'Registers (and spills)' }], value: 'ram', onChange: (v) => {
          // 'spill' lights registers, the register file and GPU RAM and draws the spill path between them; 'global' keeps the global memory GPU RAM also holds lit
          map.highlight(v === 'ram' ? 'ram' : ['spill', 'global']);
          f.setWhy(v === 'ram'
            ? `Every thread of every block can read and write ${T('global-memory', 'global memory')}, for as long as the program runs. Physically, it is GPU RAM.`
            : `${T('registers', 'Registers')} live in the ${T('register-file', 'register file')}, at the top. A value that does not fit spills out to “local memory”, which is stored in GPU RAM, at the bottom (lit together with the global memory it also holds). The dashed path down the right-hand side is that spill: a long trip for data that was supposed to be closest to the cores. The ${T('register-file', 'Register File')} entry's Fig.&nbsp;3 shows which values spill and why.`);
          GG.decorate(f.why);
        } });
        f.setWhy(`Every thread of every block can read and write ${T('global-memory', 'global memory')}, for as long as the program runs. Physically, it is GPU RAM.`);
        GG.decorate(f.why);
        return f;
      });
      guard(s.cap, 'Fig. 4', () => capacityFigure(s.cap, ctx));
      guard(s.speed, 'Fig. 5', () => speedFigure(s.speed, ctx, {
        title: 'Small and fast, big and slow: a race to the cores',
        keys: ['rf', 'l1', 'l2', 'ram'],
        msPerUnit: 50,
        ratioLabel: 'GPU RAM ÷ registers',
        ratioValue: '~120×',
        caption: `Relative access time for one load that finds its data at each level, with nothing else in the way. A unit is a register access. Registers keep pace with the cores and are about an order of magnitude faster than the ${T('l1-data-cache', 'L1 data cache')} (both from the glossary), so the L1 is 10 units. The L2 and GPU RAM lanes are scaled by microbenchmarks of a Hopper GPU (Luo et al. 2024, on an H800, an export variant of the H100; the H800 they measured is a PCIe card with HBM2e memory, not the H100 SXM’s HBM3, and the ratios are what matter here): an L1 hit takes about 41 clock cycles, a shared memory load about 29, an L2 hit about 263 and a load from global memory about 479, so the L2 is about 65 units and GPU RAM about 120 (beyond the glossary). Under heavy traffic, queueing makes GPU RAM loads slower still. Slowed down: one unit here is 50 ms.`,
        finish: `<b>Finished.</b> The register value arrived after 1 unit, the L1 value after about 10, the L2 value after about 65 and the GPU RAM value after about 120. In the time one load from GPU RAM takes, a core could be fed register operands more than a hundred times. That is why kernels stage reused data in shared memory, and why GPUs keep many warps resident: while one waits on RAM, others run (${T('latency-hiding', 'latency hiding')}).`,
      }));
      ctx.reading(s.read, [
        { href: 'https://people.freebsd.org/~lstewart/articles/cpumemory.pdf', label: 'Ulrich Drepper, “What Every Programmer Should Know About Memory” (2007)', note: 'DRAM and SRAM in depth' },
        { href: 'https://en.wikipedia.org/wiki/High_Bandwidth_Memory', label: 'Wikipedia: High Bandwidth Memory', note: 'source of the original cross-section' },
        { href: 'https://en.wikipedia.org/wiki/Interposer', label: 'Wikipedia: Interposer', note: '' },
        { href: 'https://arxiv.org/abs/2402.13499', label: 'Luo, Fan, Li, Du, Wang and Chu, “Benchmarking and Dissecting the Nvidia Hopper GPU Architecture” (2024)', note: 'measured latencies of shared memory, L1, L2 and global memory (Table IV), used to scale Fig. 5 (Beyond the glossary)' },
        { href: 'https://developer.nvidia.com/blog/using-shared-memory-cuda-cc/', label: 'NVIDIA Technical Blog: Using Shared Memory in CUDA C/C++ (2013)', note: 'the Kepler-era “roughly 100x” rule of thumb discussed in the check note (Beyond the glossary)' },
      ]);
    },
  });
})();
