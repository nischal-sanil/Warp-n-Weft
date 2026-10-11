/* chapters/pf-b — Performance, part B.
   Entries: littles-law, memory-bandwidth, arithmetic-bandwidth, latency-hiding,
            warp-execution-state, active-cycle, occupancy.
   CSS prefix: pfb-. SVG figures are pixel-true (viewBox width = stage width) and rebuild when the
   stage width changes; anything with hundreds of moving marks is drawn on a canvas. */
(function () {
  'use strict';
  if (!window.GG) return;

  GG.css(`
  .pfb-svg { display: block; width: 100%; height: auto; touch-action: manipulation; -webkit-user-select: none; user-select: none; }
  .pfb-legend { display: flex; flex-wrap: wrap; gap: 4px 16px; margin: 0 0 12px; font: 500 11.5px/1.5 var(--font-mono); color: var(--ink-2); }
  .pfb-legend span { display: inline-flex; align-items: center; gap: 7px; }
  .pfb-legend i { flex: none; display: inline-block; width: 11px; height: 11px; border-radius: 3px; background: var(--sw); }
  .pfb-legend i.pfb-lg-outline { background: transparent; border: 1.5px solid var(--sw); }
  .pfb-legend i.pfb-lg-dash { background: transparent; border: 1.5px dashed var(--sw); }
  .pfb-legend i.pfb-lg-line { height: 0; border-radius: 0; background: none; border-top: 2px solid var(--sw); width: 16px; }
  .pfb-legend i.pfb-lg-dline { height: 0; border-radius: 0; background: none; border-top: 2px dashed var(--sw); width: 16px; }
  .pfb-legend i.pfb-lg-dot { width: 8px; height: 8px; border-radius: 50%; }
  .pfb-legend i.pfb-lg-tick { width: 3px; height: 12px; border-radius: 1px; }
  .pfb-legend i.pfb-lg-dia { width: 8px; height: 8px; border-radius: 1px; transform: rotate(45deg); }
  .pfb-legend i.pfb-lg-tri { width: 10px; height: 9px; border-radius: 0; clip-path: polygon(50% 0, 100% 100%, 0 100%); }
  .pfb-legend i.pfb-lg-hatch { background: repeating-linear-gradient(45deg, var(--sw) 0 2px, transparent 2px 5px); border: 1px solid var(--sw); }
  .pfb-eq { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 8px 14px; padding: 18px 16px 16px;
    border: 1px solid var(--line); border-radius: 12px; background: var(--surface); font-family: var(--font-mono); font-size: 15px; color: var(--ink); text-align: center; }
  .pfb-eq .pfb-t { display: inline-flex; flex-direction: column; align-items: center; gap: 3px; }
  .pfb-eq .pfb-t b { font-weight: 600; font-size: 16px; }
  .pfb-eq .pfb-t small { font: 500 11px/1.2 var(--font-mono); color: var(--ink-3); letter-spacing: 0.02em; }
  .pfb-eq .pfb-op { color: var(--ink-3); font-size: 19px; }
  .pfb-eq .pfb-ex { width: 100%; font: 500 12.5px/1.5 var(--font-mono); color: var(--ink-2); margin-top: 4px; }
  .pfb-presets { display: flex; flex-wrap: wrap; gap: 6px; }
  .pfb-presets .btn { height: 28px; font-size: 11.5px; padding: 0 10px; }
  .pfb-presets .btn[aria-pressed="true"] { border-color: var(--accent); color: #fff; background: var(--accent-a); }
  .pfb-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .pfb-cv { position: relative; }
  .pfb-cv canvas { display: block; touch-action: pan-y; }
  .pfb-codeline { margin: 0; padding: 9px 12px; border-radius: 10px; background: #090a10; border: 1px solid var(--line);
    font: 500 12.5px/1.6 var(--font-mono); color: var(--ink); white-space: pre; overflow-x: auto; scrollbar-width: thin; }
  .pfb-codeline .d { color: var(--ink-3); }
  .pfb-codeline .v { color: var(--accent-2); }
  .pfb-codeline .k { color: var(--core); font-weight: 600; }
  .pfb-codeline .x { color: var(--danger); font-weight: 600; }
  .pfb-codeline .m { color: var(--memory); }
  .pfb-codeline .c { color: var(--control); }
  .pfb-kv { display: inline-block; font: 500 12.5px var(--font-mono); padding: 2px 8px; border-radius: 6px; background: var(--surface-3); border: 1px solid var(--line); color: var(--ink); }
  .pfb-split { display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; }
  @media (min-width: 900px) { .pfb-split.two { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); } }
  .pfb-inputs { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 12px 18px; width: 100%; }
  .pfb-inputs .slider { min-width: 0; }
  .pfb-group { border: 1px solid var(--line); border-radius: 12px; padding: 10px 12px 12px; background: rgba(8, 9, 14, 0.45); min-width: 0; }
  .pfb-group > .pfb-gh { font: 600 10.5px/1.2 var(--font-mono); letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-2); margin-bottom: 10px; display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
  .pfb-group > .pfb-gh span { color: var(--ink-3); letter-spacing: 0.04em; text-transform: none; font-weight: 500; }
  .pfb-group .pfb-inputs { grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); }
  .pfb-tbl td.pfb-hit, .pfb-tbl th.pfb-hit { color: var(--control); }
  .pfb-tbl tr.pfb-on td { background: rgba(255, 138, 91, 0.08) !important; }
  .pfb-tbl tbody tr { cursor: pointer; }
  .pfb-tbl td .pfb-bar { display: inline-block; height: 8px; border-radius: 3px; vertical-align: 1px; margin-right: 8px; background: var(--memory); }
  .pfb-chk { display: grid; gap: 6px; }
  .pfb-chk label { display: flex; }
  .pfb-verdict { font: 600 13px/1.4 var(--font-mono); }
  .pfb-note-inline { font-size: 13px; color: var(--ink-3); }
  .pfb-pool { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
  .pfb-wc { border: 1.5px solid var(--line-2); border-radius: 12px; padding: 10px 11px 11px; background: rgba(8, 9, 14, 0.5); min-width: 0; transition: border-color .2s, background .2s; }
  .pfb-wc[data-st="stalled"] { border-color: rgba(251, 191, 36, 0.75); background: rgba(251, 191, 36, 0.07); }
  .pfb-wc[data-st="eligible"] { border-color: var(--memory); background: rgba(111, 166, 255, 0.08); }
  .pfb-wc[data-st="selected"] { border-color: var(--special); background: rgba(244, 114, 182, 0.1); box-shadow: inset 0 0 0 2px rgba(111, 166, 255, 0.55); }
  .pfb-wc[data-st="unused"] { border-style: dashed; opacity: 0.75; }
  .pfb-wc-h { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; margin-bottom: 8px; font: 600 12px/1.3 var(--font-mono); color: var(--ink); }
  .pfb-wc-h code { font-size: 12px; }
  .pfb-wc-h span { font-weight: 500; color: var(--ink-3); font-size: 11px; }
  .pfb-conds { display: grid; gap: 4px; }
  .pfb-cond { display: flex; align-items: center; gap: 8px; width: 100%; text-align: left; padding: 5px 8px; border-radius: 7px; border: 1px solid var(--line); background: var(--surface); color: var(--ink-2); font: 500 11.5px/1.3 var(--font-mono); cursor: pointer; }
  .pfb-cond:hover { border-color: var(--line-2); color: var(--ink); }
  .pfb-cond:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
  .pfb-cond i { flex: none; width: 14px; height: 14px; border-radius: 4px; display: inline-grid; place-items: center; font-style: normal; font-size: 10px; font-weight: 700; }
  .pfb-cond[aria-pressed="true"] i { background: var(--core); color: var(--bg); }
  .pfb-cond[aria-pressed="false"] { color: var(--ink); border-color: rgba(251, 191, 36, 0.6); }
  .pfb-cond[aria-pressed="false"] i { background: transparent; border: 1.5px solid var(--control); color: var(--control); }
  .pfb-cond.pfb-exit { margin-top: 4px; border-style: dashed; }
  .pfb-adj { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 9px; }
  .pfb-adj b { font: 600 10.5px/1 var(--font-mono); padding: 4px 6px; border-radius: 5px; border: 1px solid var(--line); color: var(--ink-3); opacity: .55; }
  .pfb-adj b.on { opacity: 1; color: var(--bg); border-color: transparent; }
  .pfb-adj b.on[data-a="active"] { background: var(--core); }
  .pfb-adj b.on[data-a="stalled"] { background: var(--control); }
  .pfb-adj b.on[data-a="eligible"] { background: var(--memory); }
  .pfb-adj b.on[data-a="selected"] { background: var(--special); }
  .pfb-why-s { margin-top: 7px; font: 500 11px/1.4 var(--font-mono); color: var(--control); min-height: 1.4em; }
  .pfb-issue { margin-top: 12px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; font: 500 12px/1.4 var(--font-mono); color: var(--ink-2); }
  .pfb-issue .pfb-tray { min-width: 92px; height: 34px; border: 1.5px solid var(--core); border-top: none; border-radius: 0 0 8px 8px; display: inline-grid; place-items: center; font-weight: 700; color: var(--special); }
  .pfb-issue .pfb-tray.idle { border-color: var(--danger); color: var(--danger); }
  @media (max-width: 720px) {
    .pfb-legend { font-size: 10.5px; gap: 3px 12px; }
    .pfb-eq { font-size: 13px; padding: 14px 10px; gap: 6px 10px; }
    .pfb-eq .pfb-t b { font-size: 14px; }
    .pfb-codeline { font-size: 11px; }
  }
  `);

  /* ───────────────────────── helpers ───────────────────────── */
  const r2 = (v) => Math.round(v * 100) / 100;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const fI = (n) => GG.fmt.int(n);
  const fx = (n, d) => GG.fmt.fixed(n, d == null ? 1 : d);
  const sig = (n, s) => GG.fmt.sig(n, s == null ? 3 : s);
  const pct = (x, d) => (x * 100).toFixed(d == null ? 1 : d).replace(/\.0+$/, '') + '%';
  const plural = (n, one, many) => (n === 1 ? one : many || one + 's');
  const tw = (s, fs) => String(s).length * fs * 0.6; // JetBrains Mono advance ≈ 0.6 em
  const guard = (fn) => { try { fn(); } catch (e) { console.error('[pf-b] ' + ((e && e.stack) || e)); } };
  const MOB = (w) => w < 600;

  function rng(seed) {
    let a = seed >>> 0 || 1;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }
  function G(p, a) { return GG.svg('g', a || null, p); }
  function R(p, x, y, w, h, st, a) {
    const o = { x: r2(x), y: r2(y), width: r2(Math.max(0, w)), height: r2(Math.max(0, h)) };
    if (a) Object.assign(o, a);
    const el = GG.svg('rect', o, p);
    if (st) el.setAttribute('style', st);
    return el;
  }
  function C(p, cx, cy, r, st, a) { const el = GG.svg('circle', Object.assign({ cx: r2(cx), cy: r2(cy), r: r2(r) }, a || {}), p); el.setAttribute('style', st); return el; }
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
    const el = GG.svg('text', a, p);
    el.textContent = s;
    let st = 'fill:' + (o.fill || 'var(--ink-2)') + ';';
    if (o.weight) st += 'font-weight:' + o.weight + ';';
    if (o.font) st += 'font-family:' + o.font + ';';
    if (o.ls) st += 'letter-spacing:' + o.ls + ';';
    if (o.pe === false) st += 'pointer-events:none;';
    el.setAttribute('style', st);
    return el;
  }
  function head(p, x, y, ang, size, fill) {
    const s = size || 6;
    const bx = x - Math.cos(ang) * s, by = y - Math.sin(ang) * s;
    const px = Math.cos(ang + Math.PI / 2) * s * 0.55, py = Math.sin(ang + Math.PI / 2) * s * 0.55;
    return Pa(p, `M${r2(x)},${r2(y)}L${r2(bx + px)},${r2(by + py)}L${r2(bx - px)},${r2(by - py)}Z`, 'fill:' + fill + ';stroke:none');
  }
  /* horizontal dimension line with end ticks and a centred label */
  function dimH(p, x1, x2, y, label, col, fs) {
    const c = col || 'var(--ink-2)';
    Ln(p, x1, y, x2, y, `stroke:${c};stroke-width:1.2`);
    Ln(p, x1, y - 4, x1, y + 4, `stroke:${c};stroke-width:1.2`);
    Ln(p, x2, y - 4, x2, y + 4, `stroke:${c};stroke-width:1.2`);
    if (label) {
      const f = fs || 10.5, lw = tw(label, f) + 8, cx = (x1 + x2) / 2;
      R(p, cx - lw / 2, y - f / 2 - 3, lw, f + 6, 'fill:var(--bg-2)', { rx: 3 });
      Tx(p, cx, y + f * 0.36, label, { fs: f, anchor: 'middle', fill: c, weight: 600 });
    }
  }

  /* An SVG that rebuilds itself at the stage's content width. build(svg, w) returns the height. */
  function rsvg(stage, label, build) {
    const svg = GG.svg('svg', { class: 'pfb-svg', role: 'img', 'aria-label': label }, stage);
    let w0 = 0;
    function draw(w) {
      w0 = w;
      clear(svg);
      let h = 40;
      try { h = build(svg, w) || 40; } catch (e) { console.error('[pf-b] figure build failed: ' + ((e && e.stack) || e)); }
      h = Math.ceil(h);
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.setAttribute('width', String(w));
      svg.setAttribute('height', String(h));
    }
    GG.resize(stage, (r) => { const w = Math.floor(r.width); if (w >= 60 && w !== w0) draw(w); });
    return { svg, redraw() { if (w0) draw(w0); }, get w() { return w0; } };
  }
  /* content width of a stage (inside its padding) */
  function innerW(el) {
    const cs = getComputedStyle(el);
    return el.clientWidth - parseFloat(cs.paddingLeft || 0) - parseFloat(cs.paddingRight || 0);
  }
  function mkFig(ctx, slot, opts) { const f = ctx.figure(slot, opts); if (slot.parentNode) slot.replaceWith(f.root); return f; }
  function mkCode(ctx, slot, opts) { const c = ctx.code(slot, opts); if (slot.parentNode) slot.replaceWith(c.el); return c; }
  function legend(parent, items) {
    const d = GG.el('div', { class: 'pfb-legend' });
    d.innerHTML = items.map((it) => `<span><i class="${it[2] ? 'pfb-lg-' + it[2] : ''}" style="--sw:${it[0]}"></i>${it[1]}</span>`).join('');
    parent.appendChild(d);
    return d;
  }
  const stat = (f, label, tone) => GG.ui.stat(f.readouts, { label, value: '—', tone });
  function presetRow(parent, label, items, onPick) {
    const wrap = GG.el('div', { class: 'ctl' });
    wrap.append(GG.el('span', { class: 'ctl-lab', text: label }));
    const row = GG.el('div', { class: 'pfb-presets' });
    const btns = items.map((it, k) => {
      const b = GG.ui.button(row, { label: it.label, title: it.title || null, onClick: () => { onPick(it, k); } });
      b.setAttribute('aria-pressed', 'false');
      return b;
    });
    wrap.append(row);
    parent.append(wrap);
    return { el: wrap, mark(k) { btns.forEach((b, j) => b.setAttribute('aria-pressed', String(j === k))); } };
  }
  const code = (s) => `<code>${GG.esc(s)}</code>`;

  /* H100 SXM and table data used across entries (glossary figures unless noted) */
  const H100 = { sms: 132, clockGHz: 1.98, fp32Lanes: 128, int32Lanes: 64, fp64Lanes: 64, tc: 4, regs: 65536, smemKB: 228, l1KiB: 256, maxWarps: 64, maxBlocks: 32 };
  const A100_DS = 'https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a100/pdf/nvidia-a100-datasheet-us-nvidia-1758950-r4-web.pdf';
  const H100_DS = 'https://resources.nvidia.com/en-us-gpu-resources/h100-datasheet-24306';
  const B200_DS = 'https://resources.nvidia.com/en-us-dgx-systems/dgx-b200-datasheet';
  const HGX_PAGE = 'https://www.nvidia.com/en-us/data-center/hgx/';
  const TABLE = [
    { id: 'a100-bf16', name: 'A100 80GB SXM BF16 TC / HBM2e', short: 'A100 BF16', tf: 312, tb: 2, printed: '156', href: A100_DS, gpu: 'A100', fmt: 'BF16' },
    { id: 'h100-bf16', name: 'H100 SXM BF16 TC / HBM3', short: 'H100 BF16', tf: 989, tb: 3.35, printed: '295', href: H100_DS, gpu: 'H100', fmt: 'BF16' },
    { id: 'b200-bf16', name: 'B200 BF16 TC / HBM3e', short: 'B200 BF16', tf: 2250, tb: 8, printed: '281', href: B200_DS, gpu: 'B200', fmt: 'BF16' },
    { id: 'h100-fp8', name: 'H100 SXM FP8 TC / HBM3', short: 'H100 FP8', tf: 1979, tb: 3.35, printed: '592', href: H100_DS, gpu: 'H100', fmt: 'FP8' },
    { id: 'b200-fp8', name: 'B200 FP8 TC / HBM3e', short: 'B200 FP8', tf: 4500, tb: 8, printed: '562', href: B200_DS, gpu: 'B200', fmt: 'FP8' },
    { id: 'b200-fp4', name: 'B200 FP4 TC / HBM3e', short: 'B200 FP4', tf: 9000, tb: 8, printed: '1125', href: B200_DS, gpu: 'B200', fmt: 'FP4' },
  ];
  const ridgeStr = (r) => {
    // exact decimals where they terminate quickly, else one decimal
    if (Math.abs(r - Math.round(r)) < 1e-9) return fI(r);
    if (Math.abs(r * 100 - Math.round(r * 100)) < 1e-6) return GG.fmt.fixed(r, (Math.abs(r * 10 - Math.round(r * 10)) < 1e-6) ? 1 : 2);
    return GG.fmt.fixed(r, 1);
  };

  /* The glossary's table as HTML, with a recomputed ridge-point column. emph: 'memory' | 'arith'. */
  function tableHTML(emph) {
    const maxTB = 8, maxTF = 9000;
    const rows = TABLE.map((t, k) => {
      const ridge = t.tf / t.tb;
      const ok = String(Math.round(ridge)) === t.printed || String(Math.floor(ridge)) === t.printed;
      const barTB = `<span class="pfb-bar" style="width:${r2((t.tb / maxTB) * 64)}px;background:var(--memory)"></span>`;
      const barTF = `<span class="pfb-bar" style="width:${r2((Math.log10(t.tf) - 1.5) / (Math.log10(maxTF) - 1.5) * 64)}px;background:var(--core)"></span>`;
      return `<tr data-k="${k}" tabindex="0"><td><a href="${t.href}">${GG.esc(t.name)}</a></td>` +
        `<td class="num">${emph === 'arith' ? barTF : ''}${fI(t.tf)}</td>` +
        `<td class="num">${emph === 'memory' ? barTB : ''}${t.tb}</td>` +
        `<td class="num">${t.printed}</td>` +
        `<td class="num${ok ? '' : ' pfb-hit'}">${ridgeStr(ridge)}${ok ? '' : ' ≠'}</td></tr>`;
    }).join('');
    const aHead = emph === 'arith' ? 'Arithmetic Bandwidth (TFLOPs/s)' : `${GG.term('arithmetic-bandwidth', 'Arithmetic Bandwidth')} (TFLOPs/s)`;
    const mHead = emph === 'memory' ? 'Memory Bandwidth (TB/s)' : `${GG.term('memory-bandwidth', 'Memory Bandwidth')} (TB/s)`;
    return GG.tableHTML(`<thead><tr><th>System (Compute / Memory)</th><th class="num">${aHead}</th><th class="num">${mHead}</th><th class="num">${GG.term('roofline-model', 'Ridge Point')} (FLOPs/byte)</th><th class="num">Recomputed: TFLOPs/s ÷ TB/s</th></tr></thead><tbody>${rows}</tbody>`).replace('<table>', '<table class="pfb-tbl">');
  }
  const FP8_CHECK = `<p>The last column divides the two bandwidth columns ourselves. Five rows match the printed ridge points once rounded down to whole FLOPs per byte (312 ÷ 2 = 156, 989 ÷ 3.35 = 295.2, 2,250 ÷ 8 = 281.25, 4,500 ÷ 8 = 562.5, 9,000 ÷ 8 = 1,125). The H100 FP8 row does not: 1,979 ÷ 3.35 = <b>590.7</b> FLOPs/byte, where the table prints 592. The difference is small and changes no conclusion, but 590.7 is the value the table's own inputs give.</p>`;
  const FP8_POINTER = `<p>The last column divides the two bandwidth columns. The H100 FP8 row gives 1,979 ÷ 3.35 = <b>590.7</b> FLOPs/byte, where the table prints 592; the other five match. The full check, and how the table's dense, per-GPU figures relate to the datasheets' headline numbers, are in the <a data-term="arithmetic-bandwidth">Arithmetic Bandwidth</a> entry.</p>`;
  const DS_NOTE = `<p><b>Reading the datasheets.</b> The table uses per-GPU figures for <em>dense</em> matrix math. The linked H100 and A100 datasheets headline the Tensor Core rates "with sparsity" (marked with an asterisk), which are twice as large: 1,979 BF16 and 3,958 FP8 TFLOPS on the H100 SXM, 624 BF16 on the A100. The DGX B200 datasheet describes a whole eight-GPU system and, like the others, quotes sparse rates: its "72 PFLOPS" of FP8 is with sparsity (dense is half), and its FP4 is given as "144 PFLOPS | 72 PFLOPS", sparse | dense. Per GPU that is 72 ÷ 8 ÷ 2 = 4.5 PFLOPS of dense FP8 and 72 ÷ 8 = 9 PFLOPS of dense FP4, the table's 4,500 and 9,000; its 64 TB/s of HBM3e bandwidth is 8 TB/s per GPU. The DGX sheet lists no BF16 rate. The table's 2,250 TFLOPS of dense BF16 per GPU matches NVIDIA's <a href="${HGX_PAGE}">HGX B200 specification</a>, which gives 36 PFLOPS for eight GPUs with sparsity: 36 ÷ 8 ÷ 2 = 2.25 PFLOPS. The A100 80GB SXM's memory bandwidth is listed as 2,039 GB/s, which the table rounds to 2 TB/s (with 2.039 the ridge point would be 153).</p>`;

  /* ═════════════════════════ LITTLE'S LAW ═════════════════════════ */

  GG.entry('littles-law', {
    render(body, ctx) {
      const s = ctx.html(body, `
<p>Little's Law answers one question that sits under all of GPU performance: <em>how much work has to be in progress at once</em> to keep a machine busy while each piece of work takes a long time to finish? It establishes the amount of concurrency required to fully <a data-term="latency-hiding">hide latency</a> with throughput. In the glossary's notation:</p>
<div data-slot="law"></div>
<div class="pfb-eq" role="math" aria-label="concurrency equals latency times throughput">
  <span class="pfb-t"><b class="c-memory">concurrency</b><small>ops in flight at once</small></span><span class="pfb-op">=</span>
  <span class="pfb-t"><b class="c-control">latency</b><small>time each op takes</small></span><span class="pfb-op">×</span>
  <span class="pfb-t"><b class="c-core">throughput</b><small>ops finished per unit time</small></span>
  <span class="pfb-ex">400 memory operations = 400 cycles × 1 operation per cycle</span>
</div>
<p>Three words need pinning down. <b>Latency</b> is how long one operation takes from the moment it starts until its result is ready: a load from memory might take hundreds of clock cycles. <b>Throughput</b> is how many operations complete per unit of time, for example one per cycle. <b>Concurrency</b> is how many operations are "in flight" at the same moment: started, not yet finished. The units check out: seconds × operations per second = operations.</p>
${GG.noteHTML('intuition', '<p>Think of a sushi conveyor belt. If each plate takes 40 seconds to ride from the kitchen to the far end, and the chef puts down one plate every 2 seconds, there are always 40 ÷ 2 = 20 plates on the belt. Want the far end to receive plates twice as fast? The chef must keep 40 plates on the belt: a faster belt of the same length would change the latency, but at a fixed latency the only way to more throughput is more plates in flight.</p>')}
<p>Fig.&nbsp;1 is that belt, with the glossary's numbers. New operations enter on the left and ride for exactly <i>latency</i> cycles. The band they form is <i>throughput</i> operations tall and <i>latency</i> cycles long, so its area, the number in flight, is the product of the two. The chart underneath is the classic proof picture: the cumulative count of operations started and of operations finished. The vertical gap between the two curves is the concurrency, the horizontal gap is the latency, and the slope is the throughput.</p>
<div data-slot="f1"></div>
<h3>Why a GPU cares: warps in flight</h3>
<p>Little's Law determines how many instructions must be in flight for GPUs to <a data-term="latency-hiding">hide latency</a>. A GPU does not wait out a slow instruction. Its <a data-term="warp-scheduler">warp schedulers</a> switch, on every clock cycle if need be, to another <a data-term="warp">warp</a> whose next instruction is ready. That trick is fine-grained <em>thread-level parallelism</em>: concurrency comes from many independent threads rather than from one fast one. CPUs have a small version of it, <a href="https://en.wikipedia.org/wiki/Simultaneous_multithreading">simultaneous multithreading</a> (SMT), in which one core interleaves instructions from a few hardware threads so their stalls overlap.</p>
<p>The glossary's worked numbers: if a GPU has a peak throughput of <b>1 instruction per cycle</b> and a memory access latency of <b>400 cycles</b>, then <b>400</b> concurrent memory operations are needed across all <a data-term="warp-execution-state">active warps</a> in a program. If the throughput goes up to <b>10 instructions per cycle</b>, the program needs <b>4,000</b> concurrent memory operations to properly take advantage of the increase. Load both presets in Fig.&nbsp;1, then try the third: hardware capable of 10 per cycle, fed by a program that only ever has 400 operations in flight. Little's Law then works backwards, throughput = concurrency ÷ latency = 400 ÷ 400 = 1 per cycle, and nine tenths of the new hardware sits idle. The <a data-term="latency-hiding">latency hiding</a> entry works the same arithmetic through a real instruction sequence.</p>
${GG.noteHTML('beyond', `<p><b>How much thread-level parallelism.</b> SMT on mainstream CPUs usually means two hardware threads per core (Intel calls it Hyper-Threading). An H100 SM keeps up to 64 warps resident, 16 for each of its four warp schedulers, and a scheduler can pick a different one of its warps on every cycle at no cost, because every resident warp keeps its own registers in the SM's <a data-term="register-file">register file</a>.</p>`)}
<h3>"The most important of the fundamental laws"</h3>
<p>The law is named for John D. C. Little, and the classic quantitative systems textbook by Lazowska and others, <a href="https://homes.cs.washington.edu/~lazowska/qsp/Images/Chap_03.pdf"><i>Quantitative System Performance</i></a>, calls it "the most important of the fundamental laws" of analysis. The book writes it as <span class="pfb-kv">N = X R</span>: the average number of requests in a system (<i>N</i>) equals the throughput of the system (<i>X</i>) times the average time a request spends in it (<i>R</i>). Its derivation is exactly the chart in Fig.&nbsp;1: count arrivals and completions over time, and the area between the two step curves is the total time requests spent in the system.</p>
${GG.noteHTML('beyond', `<p><b>Why it is so widely useful.</b> Little's Law needs almost no assumptions. It holds for averages over any long observation window whatever the arrival pattern, the order of service or the spread of latencies, which is why it is equally at home in queueing theory, factory planning and GPU kernels. Lazowska and colleagues stress how weak its assumptions are, which is why it can be applied to a single resource, a subsystem or a whole system, and used to sanity-check measurements. John Little published the first general proof in 1961.</p>`)}
<h3>A non-trivial application: Volkov's balance</h3>
<p>For a less obvious use, consider an observation from Section 4.3 of <a href="https://www2.eecs.berkeley.edu/Pubs/TechRpts/2016/EECS-2016-143.pdf">Vasily Volkov's PhD thesis</a> on <a data-term="latency-hiding">latency hiding</a>. The number of warps required to hide pure memory access latency is not much higher than the number required to hide pure arithmetic latency: <b>30 vs 24</b> in his experiment. Intuitively, the far longer latency of memory accesses should demand far more concurrency. But concurrency is set by latency <em>and</em> throughput. Because <a data-term="memory-bandwidth">memory bandwidth</a> is so much lower than <a data-term="arithmetic-bandwidth">arithmetic bandwidth</a>, the two products come out roughly the same. That is a useful form of balance for a latency-hiding-oriented system that mixes arithmetic and memory operations: one pool of warps covers both.</p>
<div data-slot="f2"></div>
${GG.noteHTML('aside', `<p>Volkov's numbers are per SM, from a model of back-to-back dependent instructions fed with latencies and peak throughputs he measured (Table 4.1 of the thesis). He also notes where the model is optimistic: memory throughput approaches its peak gradually, and only about 80% of the peak is typically reached at the occupancy the model suggests. On the Maxwell GPU, sustaining 90% and 95% of peak memory throughput took about 40 and 46 warps per SM in practice, the latter about 1.5 times the estimate. Select Maxwell in Fig.&nbsp;2 to see those three numbers side by side.</p>`)}
<div data-slot="reading"></div>`);

      guard(() => mkCode(ctx, s.law, { lang: 'text', code: 'concurrency (ops) = latency (s) * throughput (ops/s)', caption: 'Little\'s Law, as the glossary writes it', lineNumbers: false }));
      guard(() => llBelt(ctx, s.f1));
      guard(() => llVolkov(ctx, s.f2));
      ctx.reading(s.reading, [
        { href: 'https://homes.cs.washington.edu/~lazowska/qsp/Images/Chap_03.pdf', label: 'Lazowska, Zahorjan, Graham and Sevcik, Quantitative System Performance, Chapter 3: Fundamental Laws', note: 'the derivation of N = XR' },
        { href: 'https://www2.eecs.berkeley.edu/Pubs/TechRpts/2016/EECS-2016-143.pdf', label: 'Vasily Volkov, Understanding Latency Hiding on GPUs (PhD thesis, UC Berkeley, 2016)', note: 'Section 4.3, "Does hiding memory latency require more warps?"' },
        { href: 'https://en.wikipedia.org/wiki/Simultaneous_multithreading', label: 'Simultaneous multithreading (Wikipedia)', note: 'the CPU analogue of warp switching' },
      ]);
    },
  });

  /* Fig: the conveyor belt + cumulative arrivals/completions */
  function llBelt(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Operations in flight', hint: 'set latency, throughput and the cap', wide: true,
      caption: 'Top: each small block is one operation, entering on the left when it starts and leaving on the right when its result is ready, exactly <i>latency</i> cycles later. Operations started on the same cycle stack up, so the band is <i>throughput</i> blocks tall. Bottom: the running totals of operations started (white) and finished (green) over the last two and a half latencies. The animation always takes about four seconds to cross the belt, whatever the latency, so longer latencies scroll by faster.',
    });
    const XS = [0.25, 0.5, 1, 2, 5, 10];
    const CAPS = [10, 20, 50, 100, 200, 400, 800, 1000, 2000, 4000, 8000, Infinity];
    const st = { L: 400, X: 1, capI: CAPS.length - 1 };
    const cap = () => CAPS[st.capI];
    legend(f.stage, [['var(--memory)', 'an operation in flight'], ['var(--ink)', 'operations started (total)', 'line'], ['var(--core)', 'operations finished (total)', 'line']]);
    const host = GG.el('div', { class: 'pfb-cv' });
    f.stage.append(host);
    const cv = GG.canvas(host, { height: (w) => (w < 600 ? 330 : 360), label: 'Animated conveyor belt of operations in flight above a chart of cumulative operations started and finished.' });

    // simulation: iss[i] = ops started on cycle base+i; A[i] = total started up to that cycle
    let sim = null;
    function resetSim(t0) {
      sim = { base: 0, iss: [], A: [], t: 0, q: 0 };
      advanceTo(t0 || 0);
    }
    const Aat = (c) => { // total started on cycles <= c
      if (c < 0) return 0;
      const i = Math.floor(c) - sim.base;
      if (i < 0) return sim.A.length ? sim.A[0] - sim.iss[0] : 0;
      if (i >= sim.A.length) return sim.A.length ? sim.A[sim.A.length - 1] : 0;
      return sim.A[i];
    };
    function stepCycle(c) {
      // d new operations become ready to start this cycle; any the cap holds back wait in a queue (sim.q)
      const d = Math.floor((c + 1) * st.X + 1e-9) - Math.floor(c * st.X + 1e-9);
      sim.q += d;
      const inflight = Aat(c - 1) - Aat(c - st.L);
      const room = cap() === Infinity ? sim.q : Math.max(0, cap() - inflight);
      const k = Math.min(sim.q, room);
      sim.q -= k;
      const prev = Aat(c - 1);
      sim.iss.push(k); sim.A.push(prev + k);
    }
    function advanceTo(t) {
      const target = Math.floor(t);
      while (sim.base + sim.iss.length - 1 < target) stepCycle(sim.base + sim.iss.length);
      sim.t = t;
      // keep ~4 latencies of history
      const keep = Math.ceil(st.L * 4.5) + 16;
      if (sim.iss.length > keep * 2) {
        const drop = sim.iss.length - keep;
        sim.iss = sim.iss.slice(drop); sim.A = sim.A.slice(drop); sim.base += drop;
      }
    }

    function draw() {
      const g = cv.ctx, w = cv.w, h = cv.h;
      if (!w || !sim) return;
      const col = GG.colors();
      g.clearRect(0, 0, w, h);
      const mob = MOB(w);
      const L = st.L, t = sim.t;
      const padL = mob ? 8 : 64, padR = mob ? 8 : 16;
      const x0 = padL, x1 = w - padR, bw = x1 - x0;
      // ── belt ──
      const beltTop = 24, beltH = mob ? 88 : 104;
      g.font = `500 ${mob ? 10 : 11}px "JetBrains Mono", monospace`;
      g.textBaseline = 'alphabetic';
      // belt body
      g.fillStyle = 'rgba(255,255,255,0.025)';
      g.fillRect(x0, beltTop, bw, beltH);
      g.strokeStyle = col.line2; g.lineWidth = 1;
      g.strokeRect(x0 + 0.5, beltTop + 0.5, bw - 1, beltH - 1);
      // rollers
      g.fillStyle = col.line;
      for (let x = x0 + 12; x < x1 - 4; x += 24) g.fillRect(x, beltTop + beltH - 3, 10, 2);
      const rows = Math.max(1, Math.ceil(st.X));
      // fixed row height: 10 ops per cycle fill 80% of the belt, so 1, 2, 5 and 10 rows read as proportional heights
      const rh = ((beltH - 10) * 0.8) / 10;
      g.strokeStyle = 'rgba(255,255,255,0.05)'; g.lineWidth = 1;
      g.beginPath();
      for (let k = 1; k <= 10; k++) { const yy = Math.round(beltTop + beltH - 5 - k * rh) + 0.5; g.moveTo(x0 + 1, yy); g.lineTo(x1 - 1, yy); }
      g.stroke();
      const ppc = bw / L;
      const cw = Math.max(1, ppc > 3 ? ppc - 1 : ppc);
      let inflight = 0;
      g.fillStyle = col.memory;
      const cNow = Math.floor(t);
      // runs of consecutive cycles with the same count are drawn as one rectangle (no aliasing stripes)
      const flush = (xa, xb, k) => {
        const a = Math.max(x0, xa), b = Math.min(x1, xb);
        if (b <= a || !k) return;
        g.fillRect(a, beltTop + beltH - 5 - k * rh, b - a, k * rh - (rh > 3 ? 1 : 0));
      };
      let runK = -1, runA = 0, runB = 0;
      for (let c = cNow; c > t - L && c >= 0; c--) {
        const i = c - sim.base;
        const k = i < 0 || i >= sim.iss.length ? 0 : sim.iss[i];
        inflight += k;
        const age = t - c;
        const xb = x0 + age * ppc, xa = xb - (ppc > 3 ? ppc - 1 : ppc);
        if (k === runK && ppc <= 3) { runB = xb; continue; }
        if (runK > 0) flush(runA, runB, runK);
        runK = k; runA = xa; runB = xb;
        if (ppc > 3) { flush(xa, xb, k); runK = -1; }
      }
      if (runK > 0) flush(runA, runB, runK);
      // labels above the belt, so the band never covers them
      g.fillStyle = col.ink3;
      g.font = `500 ${mob ? 10 : 11}px "JetBrains Mono", monospace`;
      g.textAlign = 'left';
      g.fillText(mob ? 'start →' : 'op starts →', x0, beltTop - 7);
      g.textAlign = 'right';
      g.fillText(mob ? '→ done' : '→ result ready', x1, beltTop - 7);
      g.fillStyle = col.memory;
      g.font = `600 ${mob ? 11 : 12}px "JetBrains Mono", monospace`;
      g.textAlign = 'center';
      g.fillText(`in flight: ${fI(inflight)}`, (x0 + x1) / 2, beltTop - 7);
      // latency dimension
      const dy = beltTop + beltH + 14;
      g.strokeStyle = col.control; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(x0, dy); g.lineTo(x1, dy); g.moveTo(x0, dy - 4); g.lineTo(x0, dy + 4); g.moveTo(x1, dy - 4); g.lineTo(x1, dy + 4); g.stroke();
      const lab = `latency = ${fI(L)} cycles`;
      g.font = `600 ${mob ? 10.5 : 11}px "JetBrains Mono", monospace`;
      const lw = g.measureText(lab).width + 10;
      g.fillStyle = col.bg2; g.fillRect((x0 + x1) / 2 - lw / 2, dy - 8, lw, 16);
      g.fillStyle = col.control; g.textAlign = 'center'; g.fillText(lab, (x0 + x1) / 2, dy + 4);
      if (mob) {
        // throughput label inside the belt's top-left corner (the band never reaches it)
        g.fillStyle = col.core; g.font = '600 10px "JetBrains Mono", monospace'; g.textAlign = 'left';
        g.fillText(`↕ ${st.X} / cycle`, x0 + 5, beltTop + 13);
      } else {
        // throughput dimension (height of the band)
        const bx = x0 - 22, yb = beltTop + beltH - 5, ytop = yb - rows * rh;
        g.strokeStyle = col.core; g.beginPath(); g.moveTo(bx, yb); g.lineTo(bx, ytop); g.moveTo(bx - 4, yb); g.lineTo(bx + 4, yb); g.moveTo(bx - 4, ytop); g.lineTo(bx + 4, ytop); g.stroke();
        g.save(); g.translate(bx - 8, (yb + ytop) / 2); g.rotate(-Math.PI / 2); g.fillStyle = col.core; g.font = '600 10px "JetBrains Mono", monospace'; g.textAlign = 'center';
        g.fillText(`${st.X}/cycle`, 0, 0); g.restore();
      }
      // ── cumulative chart ──
      const cTop = dy + 26, cBot = h - 26, cH = cBot - cTop;
      const Wn = L * 2.5;
      const tA = t - Wn;
      const yLo = Math.max(0, Aat(Math.floor(tA - L))), yHi = Math.max(yLo + 1, Aat(cNow));
      const X = (tt) => x0 + ((tt - tA) / Wn) * bw;
      const Y = (v) => cBot - ((v - yLo) / (yHi - yLo)) * cH;
      g.strokeStyle = col.line; g.lineWidth = 1;
      g.beginPath(); g.moveTo(x0, cBot + 0.5); g.lineTo(x1, cBot + 0.5); g.stroke();
      g.fillStyle = col.ink3; g.font = `500 ${mob ? 9.5 : 10.5}px "JetBrains Mono", monospace`;
      g.textAlign = 'left'; g.fillText(`${fI(Math.round(Wn))} cycles ago`, x0, cBot + 16);
      g.textAlign = 'right'; g.fillText('now', x1, cBot + 16);
      if (!mob) { g.save(); g.translate(x0 - 52, (cTop + cBot) / 2); g.rotate(-Math.PI / 2); g.textAlign = 'center'; g.fillText('total ops', 0, 0); g.restore(); }
      else { g.textAlign = 'left'; g.fillText('total ops', x0 + 3, cTop + 9); }
      {
        // y ticks: a few round values of the running totals
        const span = yHi - yLo, raw = span / 3, mag = Math.pow(10, Math.floor(Math.log10(Math.max(1, raw))));
        const stp = [1, 2, 5, 10].map((m) => m * mag).find((v) => v >= raw) || mag * 10;
        g.font = `500 ${mob ? 9 : 10}px "JetBrains Mono", monospace`;
        for (let v = Math.ceil(yLo / stp) * stp; v <= yHi; v += stp) {
          const yy = Y(v);
          if (yy < cTop + (mob ? 16 : 4) || yy > cBot - 2) continue;
          g.strokeStyle = col.line; g.lineWidth = 1;
          g.beginPath(); g.moveTo(x0, Math.round(yy) + 0.5); g.lineTo(x0 + (mob ? 4 : -4), Math.round(yy) + 0.5); g.stroke();
          g.fillStyle = col.ink3;
          if (mob) { g.textAlign = 'left'; g.fillText(fI(v), x0 + 6, yy + 3.5); } else { g.textAlign = 'right'; g.fillText(fI(v), x0 - 7, yy + 3.5); }
        }
        g.font = `500 ${mob ? 9.5 : 10.5}px "JetBrains Mono", monospace`;
      }
      // curves: sample per pixel
      const curve = (shift, color, lwid) => {
        g.strokeStyle = color; g.lineWidth = lwid; g.beginPath();
        let first = true;
        for (let px = 0; px <= bw; px += 1) {
          const tt = tA + (px / bw) * Wn;
          const v = Aat(Math.floor(Math.min(tt, t) - shift));
          const y = Y(v);
          if (first) { g.moveTo(x0 + px, y); first = false; } else g.lineTo(x0 + px, y);
        }
        g.stroke();
      };
      // shade the in-flight region between the curves
      g.fillStyle = GG.alpha(col.memory, 0.12);
      g.beginPath();
      for (let px = 0; px <= bw; px++) { const tt = tA + (px / bw) * Wn; const y = Y(Aat(Math.floor(tt))); if (px === 0) g.moveTo(x0 + px, y); else g.lineTo(x0 + px, y); }
      for (let px = bw; px >= 0; px--) { const tt = tA + (px / bw) * Wn; g.lineTo(x0 + px, Y(Aat(Math.floor(tt - L)))); }
      g.closePath(); g.fill();
      curve(0, col.ink, 1.6);
      curve(L, col.core, 1.8);
      // vertical gap at "now"
      const aN = Aat(cNow), cN = Aat(cNow - L);
      const vx = x1 - 3;
      g.strokeStyle = col.memory; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(vx, Y(aN)); g.lineTo(vx, Y(cN)); g.moveTo(vx - 4, Y(aN)); g.lineTo(vx + 3, Y(aN)); g.moveTo(vx - 4, Y(cN)); g.lineTo(vx + 3, Y(cN)); g.stroke();
      const vl = `${fI(aN - cN)} in flight`;
      g.font = `600 ${mob ? 10.5 : 11}px "JetBrains Mono", monospace`;
      const vw = g.measureText(vl).width + 10;
      const vyM = clamp((Y(aN) + Y(cN)) / 2, cTop + 8, cBot - 8);
      g.fillStyle = col.bg2; g.fillRect(vx - 8 - vw, vyM - 8, vw, 16);
      g.fillStyle = col.memory; g.textAlign = 'right'; g.fillText(vl, vx - 12, vyM + 4);
      // horizontal gap: latency
      const ta = t - 1.8 * L;
      if (ta > tA && Aat(Math.floor(ta)) > 0) {
        const yv = Y(Aat(Math.floor(ta)));
        const xa = X(ta), xb = X(ta + L);
        g.strokeStyle = col.control; g.lineWidth = 1.2; g.setLineDash([3, 3]);
        g.beginPath(); g.moveTo(xa, yv); g.lineTo(xb, yv); g.stroke(); g.setLineDash([]);
        g.beginPath(); g.moveTo(xa, yv - 4); g.lineTo(xa, yv + 4); g.moveTo(xb, yv - 4); g.lineTo(xb, yv + 4); g.stroke();
        const hl = `${fI(L)} cycles`;
        g.font = `600 ${mob ? 10 : 10.5}px "JetBrains Mono", monospace`;
        const hw = g.measureText(hl).width + 8;
        g.fillStyle = col.bg2; g.fillRect((xa + xb) / 2 - hw / 2, yv + 5, hw, 15);
        g.fillStyle = col.control; g.textAlign = 'center'; g.fillText(hl, (xa + xb) / 2, yv + 16);
      }
      paintStats(inflight);
    }

    const sNeed = stat(f, 'latency × throughput', 'memory');
    const sNow = stat(f, 'in flight now', 'memory');
    const sThr = stat(f, 'finishing / cycle', 'core');
    const sUse = stat(f, 'of peak throughput');
    let lastWhy = '';
    // measuring window: a whole number of latencies that also holds a whole number of issue periods
    const winLen = () => { for (let m = 1; m <= 4; m++) if (Math.abs(m * st.L * st.X - Math.round(m * st.L * st.X)) < 1e-9) return m * st.L; return 4 * st.L; };
    const fN = (v) => (Math.abs(v - Math.round(v)) < 1e-9 ? fI(v) : sig(v, 4));
    const pctS = (x) => pct(x, x < 0.01 ? 2 : x < 0.1 ? 1 : 0);
    function paintStats(inflight) {
      const L = st.L, need = L * st.X;
      const cNow = Math.floor(sim.t);
      const win = winLen();
      // operations that finished during the last `win` cycles = those that started `win` cycles before that
      const done = cNow >= L + win ? (Aat(cNow - L) - Aat(cNow - L - win)) / win : null;
      const expect = Math.min(st.X, cap() / L);
      sNeed.set(fN(need));
      sNow.set(fI(inflight));
      sThr.set(done == null ? '…' : sig(done, 3));
      const use = done == null ? null : done / st.X;
      sUse.set(use == null ? '…' : pctS(use), use == null ? '' : use > 0.97 ? 'core' : use > 0.5 ? 'control' : 'danger');
      const capTxt = cap() === Infinity ? null : cap();
      let why;
      if (capTxt == null || capTxt >= need) {
        why = `Every operation spends <b>${fI(L)} cycles</b> in flight and <b>${st.X}</b> new ${st.X === 1 ? 'one starts' : 'ones start'} per cycle, so <b>${fI(L)} × ${st.X} = ${fN(need)}</b> are in flight on average once the belt is full${Number.isInteger(need) ? '' : ` (it holds ${Math.floor(need)} or ${Math.ceil(need)} at any one moment)`}. That is the concurrency needed to finish ${st.X} per cycle with this latency${capTxt != null ? `, and the cap of ${fI(capTxt)} leaves room for it` : ''}.`;
      } else {
        why = `The program can keep only <b>${fI(capTxt)}</b> operations in flight, fewer than the ${fI(L)} × ${st.X} = ${fN(need)} this throughput needs. Little's Law run backwards: throughput = ${fI(capTxt)} ÷ ${fI(L)} = <b>${sig(expect, 3)} per cycle</b>, ${pctS(expect / st.X)} of the ${st.X} per cycle the hardware could sustain. Operations start in bursts whenever a slot frees up, and the belt runs mostly empty.`;
      }
      if (why !== lastWhy) { f.setWhy(why); lastWhy = why; }
    }

    // controls
    const slL = GG.ui.slider(f.controls, { label: 'latency', min: 10, max: 800, step: 10, value: st.L, format: (v) => fI(v) + ' cycles', onInput: (v) => { st.L = v; restart(); } });
    const segX = GG.ui.seg(f.controls, { label: 'throughput (ops / cycle)', options: XS.map((v) => ({ value: v, label: String(v) })), value: st.X, onChange: (v) => { st.X = v; restart(); } });
    const slC = GG.ui.slider(f.controls, { label: 'ops allowed in flight', min: 0, max: CAPS.length - 1, step: 1, value: st.capI, format: (i) => (CAPS[i] === Infinity ? 'no cap' : fI(CAPS[i])), onInput: (i) => { st.capI = i; restart(); } });
    const pr = presetRow(f.controls, 'glossary examples', [
      { label: '1/cycle × 400 cycles', L: 400, X: 1, capI: CAPS.length - 1 },
      { label: '10/cycle × 400 cycles', L: 400, X: 10, capI: CAPS.length - 1 },
      { label: '10/cycle, only 400 in flight', L: 400, X: 10, capI: CAPS.indexOf(400) },
    ], (it, k) => { st.L = it.L; st.X = it.X; st.capI = it.capI; slL.set(st.L); segX.set(st.X); slC.set(st.capI); restart(); pr.mark(k); });
    pr.mark(0);
    const row = GG.el('div', { class: 'pfb-row' });
    f.controls.append(row);
    const anim = GG.anim(host, (tt, dt) => {
      advanceTo(sim.t + dt * (st.L / 4));
      draw();
    }, { autostart: false });
    const play = GG.ui.playButton(row, anim);
    GG.ui.button(row, { icon: 'reset', label: 'Refill', onClick: () => { resetSim(0); draw(); } });

    function restart() {
      pr.mark(-1);
      resetSim(st.L * 3.1);
      draw();
    }
    resetSim(st.L * 3.1);
    if (GG.reducedMotion) advanceTo(st.L * 3.6);
    cv.onResize(() => draw());
    if (!GG.reducedMotion) { anim.start(); play.sync(); }
    draw();
  }

  /* Fig: Volkov's balance — two belts and a latency × throughput map */
  const VOLKOV = [
    { id: 'G80', gpu: 'G80 (8800 GTX)', year: 2006, memLat: 444, memThru: 0.0268, aluLat: 20, aluThru: 0.25 },
    { id: 'GT200', gpu: 'GT200 (GTX 280)', year: 2008, memLat: 434, memThru: 0.0277, aluLat: 24, aluThru: 0.25 },
    { id: 'Fermi', gpu: 'Fermi (GTX 480)', year: 2010, memLat: 513, memThru: 0.0599, aluLat: 18, aluThru: 1 },
    { id: 'Kepler', gpu: 'Kepler (GTX 680)', year: 2012, memLat: 301, memThru: 0.1338, aluLat: 9, aluThru: 4 },
    { id: 'Maxwell', gpu: 'Maxwell (GTX 980)', year: 2014, memLat: 368, memThru: 0.0814, aluLat: 6, aluThru: 4 },
  ];
  function llVolkov(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Two kinds of latency, one pool of warps', hint: 'pick a GPU generation · put both belts on one time scale', wide: true,
      caption: 'Parameters from Table 4.1 of Volkov\'s thesis: latencies in cycles, throughputs in warp instructions per cycle per SM (for memory, each instruction is a fully coalesced 128-byte warp access that misses the cache; the arithmetic instruction is a floating-point add). Top: the two belts; every dot is one warp waiting for its instruction to finish. By default each belt is drawn to its own time scale so its dots can be counted; "same time scale" draws both at the memory belt\'s scale, where the arithmetic belt shrinks to a short, dense stub. For Maxwell, the strip under the belts adds Volkov\'s measured occupancies (Section 4.3). Bottom: the same numbers on log-log axes, where every diagonal line is a constant product (1, 3, 10, 30 and 100 warps, from the bottom left), so points on the same diagonal need the same number of warps.',
    });
    const st = { g: 4, same: false, s: 0 };
    legend(f.stage, [['var(--core)', 'arithmetic (FADD)', 'dot'], ['var(--memory)', 'memory (LD, 128 B)', 'dot'], ['var(--ink-3)', 'constant warps in flight', 'dline']]);
    let dots = { a: [], m: [] };
    let lastT = 5.6;
    const label = (p, x, y, s, o) => { // text on a background chip
      const fs = o.fs || 11, wd = tw(s, fs) + 8;
      const x0 = o.anchor === 'end' ? x - wd + 4 : o.anchor === 'middle' ? x - wd / 2 : x - 4;
      R(p, x0, y - fs + 1, wd, fs + 5, 'fill:var(--bg-2)', { rx: 3 });
      return Tx(p, x, y, s, o);
    };
    const view = rsvg(f.stage, 'Two belts of warps in flight, for arithmetic and for memory instructions, and a log-log chart of latency against throughput with lines of constant concurrency.', (svg, w) => {
      const p = VOLKOV[st.g];
      const narrow = w < 600;
      const beltsW = w;
      const chartX = 0, chartW = w;
      const maxLat = Math.max(p.memLat, p.aluLat);
      // belts
      const belt = (y, kind) => {
        const lat = kind === 'a' ? p.aluLat : p.memLat, thru = kind === 'a' ? p.aluThru : p.memThru;
        const colv = kind === 'a' ? 'var(--core)' : 'var(--memory)';
        const need = lat * thru;
        const bw = beltsW * (1 - st.s + st.s * (lat / maxLat));
        Tx(svg, 0, y, kind === 'a' ? 'Arithmetic latency' : 'Memory latency', { fs: 11.5, fill: 'var(--ink)', weight: 600 });
        Tx(svg, 0, y + 16, `${lat} cycles × ${thru} warp-instr/cycle = ${sig(need, 4)} warps`, { fs: 10, fill: colv });
        const lanes = Math.max(1, Math.ceil(thru - 1e-9));
        const bh = Math.max(26, lanes * 13 + 10);
        const by = y + 26;
        R(svg, 0, by, Math.max(3, bw), bh, 'fill:rgba(255,255,255,.025);stroke:var(--line-2)', { rx: Math.min(4, bw / 3) });
        const gD = G(svg);
        const list = [];
        const maxDots = Math.ceil(need) + lanes + 2;
        const rad = clamp(bw / 7, 1.6, 4.2);
        for (let k = 0; k < maxDots; k++) list.push(C(gD, -20, by + bh / 2, rad, `fill:${colv}`));
        const dl = `${lat} cycles`;
        if (bw > tw(dl, 10) + 30) dimH(svg, 0, bw, by + bh + 12, dl, 'var(--control)', 10);
        else {
          dimH(svg, 0, Math.max(3, bw), by + bh + 12, null, 'var(--control)');
          Tx(svg, Math.max(3, bw) + 6, by + bh + 15.5, dl + ' (to scale)', { fs: 10, fill: 'var(--control)', weight: 600 });
        }
        return { list, by, bh, bw, lanes, lat, thru };
      };
      const yA = 14, bA = belt(yA, 'a');
      const yM = yA + 26 + bA.bh + 40, bM = belt(yM, 'm');
      dots = { a: bA, m: bM };
      let beltsH = yM + 26 + bM.bh + 24;
      if (p.id === 'Maxwell') {
        // Volkov's measured occupancies for the memory peak on Maxwell (thesis, Section 4.3)
        const yG = beltsH + 18, sw = Math.min(beltsW - 4, 460), WX = (n) => 2 + (n / 50) * (sw - 4);
        Tx(svg, 0, yG - 4, narrow ? 'Maxwell, warps per SM for the memory peak:' : 'Maxwell, warps per SM to sustain the memory peak: model vs measured', { fs: 10.5, fill: 'var(--ink-2)', weight: 600 });
        const ay = yG + 24;
        Ln(svg, WX(0), ay, WX(50), ay, 'stroke:var(--line-2);stroke-width:1');
        [0, 10, 20, 30, 40, 50].forEach((n) => { Ln(svg, WX(n), ay, WX(n), ay + 3, 'stroke:var(--line-2)'); Tx(svg, WX(n), ay + 26, String(n), { fs: 9, anchor: n === 0 ? 'start' : n === 50 ? 'end' : 'middle', fill: 'var(--ink-3)' }); });
        const mk = (n, txt, above, solid) => {
          C(svg, WX(n), ay, 4.5, solid ? 'fill:var(--memory);stroke:var(--bg);stroke-width:1.5' : 'fill:var(--bg);stroke:var(--memory);stroke-width:1.5');
          // the model's label sits to the left of its marker, the measured ones centred on theirs
          Tx(svg, solid ? WX(n) + 5 : WX(n), above ? ay - 8 : ay + 15, txt, { fs: 9.5, anchor: solid ? 'end' : 'middle', fill: solid ? 'var(--memory)' : 'var(--ink-2)', weight: 600 });
        };
        mk(p.memLat * p.memThru, `${sig(p.memLat * p.memThru, 3)} model (~80%)`, true, true);
        mk(40, '40 · 90%', true, false);
        mk(46, '46 · 95%', false, false);
        beltsH = ay + 34;
      }
      // chart
      const cy0 = beltsH + 22;
      const cH = Math.min(320, Math.max(250, w * 0.46));
      const padL = 46, padB = 34, padT = 10, padR = 8;
      const px0 = chartX + padL, px1 = chartX + chartW - padR, py0 = cy0 + padT, py1 = cy0 + cH - padB;
      const lx = (v) => px0 + ((Math.log10(v) - 0) / 3) * (px1 - px0); // 1 .. 1000 cycles
      const ly = (v) => py1 - ((Math.log10(v) + 2) / 3) * (py1 - py0); // 0.01 .. 10 per cycle
      R(svg, px0, py0, px1 - px0, py1 - py0, 'fill:rgba(255,255,255,.015);stroke:var(--line)');
      [1, 10, 100, 1000].forEach((v) => { const x = lx(v); Ln(svg, x, py0, x, py1, 'stroke:var(--line);stroke-width:1'); Tx(svg, x, py1 + 14, fI(v), { fs: 10, anchor: 'middle', fill: 'var(--ink-3)' }); });
      [0.01, 0.1, 1, 10].forEach((v) => { const y = ly(v); Ln(svg, px0, y, px1, y, 'stroke:var(--line);stroke-width:1'); Tx(svg, px0 - 6, y + 3.5, String(v), { fs: 10, anchor: 'end', fill: 'var(--ink-3)' }); });
      Tx(svg, (px0 + px1) / 2, py1 + 29, 'latency (cycles, log)', { fs: 10.5, anchor: 'middle', fill: 'var(--ink-2)' });
      const yl = Tx(svg, chartX + 11, (py0 + py1) / 2, 'throughput (warp-instr / cycle / SM, log)', { fs: 10, anchor: 'middle', fill: 'var(--ink-2)' });
      yl.setAttribute('transform', `rotate(-90 ${r2(chartX + 11)} ${r2((py0 + py1) / 2)})`);
      // iso-concurrency diagonals
      const clip = GG.svg('clipPath', { id: GG.uid('pfbclip') }, svg);
      R(clip, px0, py0, px1 - px0, py1 - py0);
      const gI = G(svg, { 'clip-path': `url(#${clip.id})` });
      [1, 3, 10, 30, 100].forEach((n) => {
        // throughput = n / latency
        const xa = 1, xb = 1000;
        Ln(gI, lx(xa), ly(n / xa), lx(xb), ly(n / xb), 'stroke:var(--ink-3);stroke-width:1;stroke-dasharray:4 4;opacity:.7');
        const lab = `${n} warp${n === 1 ? '' : 's'}`;
        if (narrow) {
          // on narrow charts, label each line where it enters: the left edge (1, 3) or the top edge (10, 30, 100), away from the data
          // (30 and 100 stay unlabelled here: the selected points' own labels give the scale)
          if (n < 10) Tx(gI, lx(1.12) + 2, ly(n / 1.12) + 12, lab, { fs: 9.5, fill: 'var(--ink-3)' });
          else if (n === 10) Tx(gI, lx(1.12) + 3, py0 + 11, lab, { fs: 9.5, fill: 'var(--ink-3)' });
        } else if (n < 10) Tx(gI, lx(100 * n) - 5, py1 - 5, lab, { fs: 9.5, fill: 'var(--ink-3)', anchor: 'end' });
        else if (n === 10) Tx(gI, lx(560) - 3, ly(10 / 560) - 5, lab, { fs: 9.5, fill: 'var(--ink-3)', anchor: 'end' });
        else Tx(gI, px1 - 4, ly(n / 1000) - 5, lab, { fs: 9.5, fill: 'var(--ink-3)', anchor: 'end' });
      });
      // other generations, faint
      VOLKOV.forEach((q, k) => {
        if (k === st.g) return;
        C(svg, lx(q.aluLat), ly(q.aluThru), 3, 'fill:none;stroke:var(--core);stroke-width:1;opacity:.45');
        C(svg, lx(q.memLat), ly(q.memThru), 3, 'fill:none;stroke:var(--memory);stroke-width:1;opacity:.45');
      });
      // selected pair
      const ax = lx(p.aluLat), ay = ly(p.aluThru), mx = lx(p.memLat), my = ly(p.memThru);
      Ln(svg, ax, ay, mx, my, 'stroke:var(--ink-2);stroke-width:1;stroke-dasharray:2 3');
      C(svg, ax, ay, 6, 'fill:var(--core);stroke:var(--bg);stroke-width:2');
      C(svg, mx, my, 6, 'fill:var(--memory);stroke:var(--bg);stroke-width:2');
      const la = `${sig(p.aluLat * p.aluThru, 3)} warps`, lm = `${sig(p.memLat * p.memThru, 3)} warps`;
      label(svg, ax + 10, ay - 9, la, { fs: 11, fill: 'var(--core)', weight: 600 });
      label(svg, Math.min(mx - 10, px1 - 4), my + 19, lm, { fs: 11, fill: 'var(--memory)', weight: 600, anchor: 'end' });
      place(lastT);
      return cy0 + cH;
    });
    function place(tt) {
      lastT = tt;
      if (!dots.a.list) return;
      const p = VOLKOV[st.g], maxLat = Math.max(p.memLat, p.aluLat);
      [dots.a, dots.m].forEach((b) => {
        const T = 5 * (1 - st.s + st.s * (b.lat / maxLat)); // seconds to cross this belt (one shared scale when s = 1)
        const cyc = (tt / T) * b.lat; // current time in this belt's cycles
        // warps issued at cycle j / thru, for integer j
        // thru >= 1: `thru` warps issue together on every whole cycle; thru < 1: one warp every 1/thru cycles
        const whole = b.thru >= 1;
        const jNow = whole ? (Math.floor(cyc) + 1) * b.thru - 1 : Math.floor(cyc * b.thru + 1e-9);
        const m = Math.min(8, b.bw / 4);
        let k = 0;
        for (let j = jNow; j >= 0 && k < b.list.length; j--) {
          const c0 = whole ? Math.floor(j / b.thru) : j / b.thru;
          const age = cyc - c0;
          if (age >= b.lat) break;
          const x = m + (age / b.lat) * Math.max(0, b.bw - 2 * m);
          const lane = b.lanes > 1 ? j % b.lanes : 0;
          const y = b.by + 5 + 13 * lane + 6.5 + (b.lanes === 1 ? (b.bh - 23) / 2 : 0);
          b.list[k].setAttribute('cx', r2(x)); b.list[k].setAttribute('cy', r2(y));
          b.list[k].style.display = '';
          k++;
        }
        for (; k < b.list.length; k++) b.list[k].style.display = 'none';
      });
    }
    // start mid-stream so both belts look full
    const t0 = 5.6;
    const anim = GG.anim(f.stage, (tt) => place(t0 + tt));
    const row = GG.el('div', { class: 'pfb-row' });
    GG.ui.seg(f.controls, { label: 'GPU (Volkov, Table 4.1)', options: VOLKOV.map((q, k) => ({ value: k, label: q.id, title: q.gpu + ', ' + q.year })), value: st.g, onChange: (v) => { st.g = v; view.redraw(); update(); } });
    let tween = 0;
    GG.ui.toggle(f.controls, {
      label: 'same time scale', value: st.same,
      onChange: (v) => {
        st.same = v;
        const from = st.s, to = v ? 1 : 0;
        cancelAnimationFrame(tween);
        if (GG.reducedMotion) { st.s = to; view.redraw(); update(); return; }
        const t1 = performance.now();
        const stepT = (now) => {
          const u = clamp((now - t1) / 650, 0, 1), e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
          st.s = from + (to - from) * e; view.redraw();
          if (u < 1) tween = requestAnimationFrame(stepT); else update();
        };
        tween = requestAnimationFrame(stepT);
      },
    });
    f.controls.append(row);
    GG.ui.playButton(row, anim);
    const sA = stat(f, 'arithmetic: warps', 'core'), sM = stat(f, 'memory: warps', 'memory'), sR = stat(f, 'memory ÷ arithmetic');
    function update() {
      const p = VOLKOV[st.g];
      const a = p.aluLat * p.aluThru, m = p.memLat * p.memThru;
      sA.set(sig(a, 3)); sM.set(sig(m, 3)); sR.set(sig(m / a, 2) + '×');
      const bytes = p.memThru * 128;
      const scaleTxt = st.same
        ? ` On one time scale the arithmetic belt is ${sig(p.memLat / p.aluLat, 2)} times shorter and densely packed, the memory belt long and sparse, ${m / a < 1.5 ? 'yet they carry about the same number of warps.' : `with ${sig(p.memLat / p.aluLat, 2)} times the latency but only ${sig(m / a, 2)} times the warps.`}`
        : '';
      const mw = p.id === 'Maxwell' ? ' In practice memory throughput saturates gradually: typically only about 80% of the peak is reached at the model\'s occupancy, and Volkov measured 40 warps for 90% and 46 for 95%.' : '';
      f.setWhy(`On the <b>${p.gpu}</b> an add takes <b>${p.aluLat} cycles</b> and an SM can issue <b>${p.aluThru}</b> per cycle: ${p.aluLat} × ${p.aluThru} = <b>${sig(a, 3)} warps</b> must be waiting on adds at once. A memory access takes <b>${p.memLat} cycles</b>, ${sig(p.memLat / p.aluLat, 2)} times longer, but the memory system accepts only <b>${p.memThru}</b> warp accesses per cycle per SM (about ${sig(bytes, 3)} bytes per cycle): ${p.memLat} × ${p.memThru} = <b>${sig(m, 3)} warps</b>. ${m / a < 1.5 ? 'Nearly the same pool of warps hides both.' : `The memory side still needs ${sig(m / a, 2)} times as many; newer generations brought the two closer.`}${scaleTxt}${mw}`);
    }
    update();
    place(t0);
  }

  /* ═════════════════════════ MEMORY BANDWIDTH ═════════════════════════ */

  GG.entry('memory-bandwidth', {
    render(body, ctx) {
      const s = ctx.html(body, `
<p><b>Memory bandwidth</b> is the maximum rate at which data can be transferred between different levels of the <a data-term="memory-hierarchy">memory hierarchy</a>. It is measured in bytes per second and represents the theoretical maximum achievable throughput for moving data: a speed limit, not a typical speed. In a <a data-term="roofline-model">roofline model</a> of the hardware it sets the slope of the "memory roof", the slanted line on the left of the chart.</p>
${GG.noteHTML('intuition', '<p>Picture a factory whose raw material arrives by conveyor from a warehouse. However fast the machines are, they cannot turn out more than the conveyor brings in. Memory bandwidth is the conveyor\'s capacity: bytes per second from storage to the machines that compute on them.</p>')}
<h3>One bandwidth per level</h3>
<p>There are many memory bandwidths in a complete system: one between each level of the memory hierarchy. Fig.&nbsp;1 stacks the levels of an H100 SXM, from the <a data-term="register-file">register files</a> inside every <a data-term="streaming-multiprocessor">Streaming Multiprocessor (SM)</a> down to the host's memory, with a pipe for each link between neighbouring levels. The faster the level, the smaller it is.</p>
<div data-slot="f1"></div>
<p>The most important bandwidth is the one between the <a data-term="gpu-ram">GPU RAM</a> and the register files of the SMs, because the <a href="https://en.wikipedia.org/wiki/Working_set_size">working sets</a> of most <a data-term="kernel">kernels</a> only fit in <a data-term="memory-hierarchy">GPU RAM</a>, not anywhere higher up in the <a data-term="memory-hierarchy">memory hierarchy</a>. A working set is the data a program touches while it runs. When it is too big for the caches, every byte of it has to travel up from GPU RAM, through the narrowest pipe on that route, before any core can compute on it. For this reason that bandwidth is the primary one used in <a data-term="roofline-model">roofline modeling</a> of GPU <a data-term="kernel">kernel</a> performance. Try the presets in Fig.&nbsp;1: only the smallest fits on-chip; the matrix and the 8B model need GPU RAM, and the 70B model does not fit on one GPU at all.</p>
<h3>The slope of the memory roof</h3>
<p>A roofline plots attainable performance (FLOP/s) against <a data-term="arithmetic-intensity">arithmetic intensity</a> (FLOPs per byte moved). A kernel that does <i>I</i> FLOPs for every byte it loads can compute no faster than bandwidth × <i>I</i>: bytes per second times FLOPs per byte gives FLOPs per second. On linear axes that bound is a straight line through the origin whose slope is the memory bandwidth, which is what Fig.&nbsp;2 shows. Switch GPUs and watch the slope change.</p>
<div data-slot="f2"></div>
<h3>Terabytes per second, and still the bottleneck</h3>
<p>Contemporary GPUs have memory bandwidths measured in terabytes per second. For example, <a href="https://modal.com/blog/introducing-b200-h200">B200 GPUs</a> have a (bidirectional) memory bandwidth of 8 TB/s to their HBM3e memory. That is much lower than the <a data-term="arithmetic-bandwidth">arithmetic bandwidth</a> of the <a data-term="tensor-core">Tensor Cores</a> in these GPUs, which pushes up the <a data-term="roofline-model">ridge point</a>: the <a data-term="arithmetic-intensity">arithmetic intensity</a> a kernel needs before the Tensor Cores, and not memory, become its limit. The ridge point is simply arithmetic bandwidth ÷ memory bandwidth.</p>
${GG.noteHTML('beyond', '<p><b>"Bidirectional".</b> The wires between a GPU and its HBM stacks carry data one way at a time, switching between reads and writes. The headline figure is the total for both directions together: a kernel that only reads can in principle use all 8 TB/s for reads, and one that reads and writes equal amounts shares it between the two.</p>')}
<p>Representative bandwidth numbers for NVIDIA data center GPUs between the Ampere and Blackwell <a data-term="streaming-multiprocessor-architecture">Streaming Multiprocessor architectures</a> are listed in the glossary's table, reproduced below Fig.&nbsp;3. Fig.&nbsp;3 draws the same rows as a map: memory bandwidth across, arithmetic bandwidth up, both on log scales, so each diagonal is a line of constant ridge point.</p>
<div data-slot="f3"></div>
<div data-slot="tbl"></div>
${GG.noteHTML('check', FP8_POINTER)}
${GG.noteHTML('aside', '<p>Ridge points do not only go up. From A100 to H100, BF16 Tensor Core math grew 3.2× (312 → 989 TFLOPS) while memory bandwidth grew 1.7× (2 → 3.35 TB/s), so the ridge nearly doubled, 156 → 295 FLOPs/byte. From H100 to B200, BF16 math grew 2.3× (989 → 2,250) and memory bandwidth 2.4× (3.35 → 8), so the BF16 ridge dipped slightly to 281. What drives the highest ridge points is lower-precision math: the same B200 memory feeding FP8 or FP4 Tensor Cores gives 562.5 and 1,125 FLOPs/byte.</p>')}
<div data-slot="reading"></div>`);

      guard(() => mbHier(ctx, s.f1));
      guard(() => mbRoof(ctx, s.f2));
      guard(() => mbMap(ctx, s.f3, s.tbl, 'memory'));
      ctx.reading(s.reading, [
        { href: 'https://en.wikipedia.org/wiki/Working_set_size', label: 'Working set size (Wikipedia)', note: 'the data a program needs while it runs' },
        { href: 'https://modal.com/blog/introducing-b200-h200', label: 'Modal: introducing B200 and H200 GPUs', note: '8 TB/s of HBM3e bandwidth on the B200' },
        { href: A100_DS, label: 'NVIDIA A100 datasheet', note: 'the A100 80GB SXM row' },
        { href: H100_DS, label: 'NVIDIA H100 datasheet', note: 'the H100 SXM rows (and 128 GB/s PCIe Gen5; it writes the glossary\'s 80 GiB of HBM3 as "80GB")' },
        { href: B200_DS, label: 'NVIDIA DGX B200 datasheet', note: 'the B200 rows (eight-GPU totals, with sparsity)' },
        { href: HGX_PAGE, label: 'NVIDIA HGX platform specifications', note: 'HGX B200 per-system rates, including BF16 and FP32 (beyond the glossary)' },
        { href: 'https://resources.nvidia.com/en-us-hopper-architecture/nvidia-h100-tensor-c', label: 'NVIDIA H100 Tensor Core GPU Architecture whitepaper', note: 'the L2 cache of the H100 SXM5, 50 MiB (NVIDIA: "50 MB") (beyond the glossary)' },
      ]);
    },
  });

  /* Fig: the hierarchy, one bandwidth per link, and where a working set fits */
  function mbHier(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'H100 SXM memory hierarchy: one bandwidth per link', hint: 'size a working set', wide: true,
      caption: 'Levels of the memory hierarchy of an H100 SXM, fastest and smallest at the top. Pipe widths grow with the logarithm of each link\'s bandwidth, so the gaps look smaller than they are; the bars underneath show them to scale, as the time one pass over the working set would take on each link (press Play to stream it). GPU RAM capacity (80 GiB; NVIDIA\'s datasheet writes "80GB") and bandwidth and the register-file and L1 sizes are the glossary\'s; the L2 size (NVIDIA writes "50 MB"; the device reports 52,428,800 bytes, 50 MiB), the shared-memory bandwidth (32 banks × 4 bytes per clock per SM, at the 1,980 MHz clock the Peak Rate entry uses) and the PCIe figure come from NVIDIA\'s documentation and datasheet (marked †, beyond the glossary). The datasheet\'s 128 GB/s for PCIe counts both directions together; a pass from host to GPU uses one direction, about 64 GB/s, so its bar uses that. The bracket marks the route from GPU RAM to the register files that rooflines use.',
    });
    const MiB = 1048576;
    const LV = [
      { k: 'rf', name: 'Register files', sub: '65,536 × 32-bit per SM', capTxt: '256 KiB per SM · 33 MiB total', cap: 132 * 256 * 1024, col: 'var(--memory)', term: 'register-file' },
      { k: 'l1', name: 'L1 data cache / shared memory', sub: 'inside each SM', capTxt: '256 KiB per SM · 33 MiB total', cap: 132 * 256 * 1024, col: 'var(--memory)', term: 'l1-data-cache' },
      { k: 'l2', name: 'L2 cache', sub: 'shared by all SMs', capTxt: '50 MiB (52.4 MB)', cap: 50 * MiB, col: 'var(--memory)' },
      { k: 'ram', name: 'GPU RAM (HBM3)', sub: 'global memory lives here', capTxt: '80 GiB (85.9 GB)', cap: 80 * 1024 * MiB, col: 'var(--memory)', term: 'gpu-ram' },
      { k: 'host', name: 'Host RAM (CPU side)', sub: 'across the PCIe bus', capTxt: 'the server\'s DRAM', cap: Infinity, col: 'var(--host)' },
    ];
    const PIPES = [
      { bw: 128 * 132 * 1.98e9, lab: '≈ 33.5 TB/s', det: '128 B per clock per SM × 132 SMs', short: '128 B/clock/SM × 132 SMs', link: 'L1 / shared → registers', beyond: true },
      { bw: null, lab: 'not on the datasheet', det: 'faster than the HBM it caches', short: 'faster than HBM', link: 'L2 → L1', beyond: true },
      { bw: 3.35e12, lab: '3.35 TB/s', det: 'HBM3: the roofline bandwidth', short: 'HBM3: the roofline bandwidth', link: 'GPU RAM → L2', key: true },
      { bw: 128e9, pass: 64e9, lab: '128 GB/s', det: 'PCIe Gen5, both directions together', short: 'PCIe Gen5, both directions', link: 'host → GPU (PCIe, one way: 64 GB/s)', beyond: true },
    ];
    const PRE = [
      { label: '1,024 floats', bytes: 4096, why: 'A thousand FP32 values, 4 KiB, fits comfortably in one SM\'s L1 data cache or shared memory.' },
      { label: '4,096² FP32 matrix', bytes: 4096 * 4096 * 4, why: 'A 4,096 × 4,096 matrix of FP32 values is 64 MiB (67.1 MB): too big for the 50 MiB (52.4 MB) L2, so every pass over it streams from GPU RAM.' },
      { label: '8B params in BF16', bytes: 16e9, why: 'An 8-billion-parameter model stored in BF16 (2 bytes per parameter) is 16 GB. Only GPU RAM can hold it.' },
      { label: '70B params in BF16', bytes: 140e9, why: 'A 70-billion-parameter model in BF16 (2 bytes per parameter) is 140 GB.' },
    ];
    const st = { ws: 16e9, pre: 2 };
    const fmtB = (b) => {
      if (b >= 1e12) return sig(b / 1e12, 3) + ' TB';
      if (b >= 1e9) return sig(b / 1e9, 3) + ' GB';
      if (b >= 1e6) return sig(b / 1e6, 3) + ' MB';
      if (b >= 1e3) return sig(b / 1e3, 3) + ' kB';
      return fI(b) + ' B';
    };
    const fitIndex = (b) => { for (let i = 0; i < LV.length; i++) if (b <= LV[i].cap) return i; return LV.length - 1; };
    function fmtT(sec) {
      if (sec >= 1) return sig(sec, 3) + ' s';
      if (sec >= 1e-3) return sig(sec * 1e3, 3) + ' ms';
      if (sec >= 1e-6) return sig(sec * 1e6, 3) + ' µs';
      return sig(sec * 1e9, 3) + ' ns';
    }
    let flow = 1; // 0 … 1: how far the "stream one pass" sweep has got, as a fraction of the slowest link's time
    let fills = [];
    const view = rsvg(f.stage, 'Stack of memory levels of an H100 SXM with the bandwidth of each link between them, a marker showing the smallest level that can hold the chosen working set, and bars showing to scale how long one pass over the working set takes on each link.', (svg, w) => {
      const mob = w < 560;
      const boxH = mob ? 46 : 44, gap = mob ? 50 : 46;
      const brW = mob ? 26 : 150; // space for the roofline bracket on the right
      const bx = 0, bw = w - brW - (mob ? 4 : 12);
      const pipeX = mob ? 34 : 70;
      const fitI = fitIndex(st.ws);
      const yOf = (i) => 6 + i * (boxH + gap);
      LV.forEach((L, i) => {
        const y = yOf(i);
        const on = i === fitI;
        const tooBig = on && L.k === 'host';
        R(svg, bx + 0.5, y + 0.5, bw - 1, boxH - 1, `fill:${on ? (tooBig ? 'rgba(184,164,255,.12)' : 'rgba(111,166,255,.16)') : 'rgba(255,255,255,.03)'};stroke:${on ? 'var(--ink)' : (L.k === 'host' ? 'rgba(184,164,255,.5)' : 'rgba(111,166,255,.45)')};stroke-width:${on ? 1.6 : 1}`, { rx: 8 });
        Tx(svg, bx + 12, y + 19, L.name, { fs: mob ? 11.5 : 12.5, fill: L.k === 'host' ? 'var(--host)' : 'var(--ink)', weight: 600 });
        Tx(svg, bx + 12, y + (mob ? 36 : 35), mob ? L.capTxt : `${L.sub}`, { fs: mob ? 10 : 10.5, fill: 'var(--ink-3)' });
        if (!mob) Tx(svg, bx + bw - 12, y + 27, L.capTxt, { fs: 11, fill: 'var(--ink-2)', anchor: 'end' });
        if (on) {
          // a working set over 80 GiB has no home on the GPU: it can only live in host RAM (or be split across GPUs)
          const tag = tooBig ? 'too big for GPU RAM' : 'your working set fits here';
          const tws = tw(tag, 10) + 12;
          const tx0 = mob ? bx + bw - tws - 6 : bx + bw - 12 - tw(L.capTxt, 11) - tws - 12;
          if (!mob || tw(L.name, 11.5) + 24 < tx0) {
            R(svg, tx0, y + (mob ? 6 : 13), tws, 18, `fill:${tooBig ? 'var(--danger)' : 'var(--ink)'}`, { rx: 9 });
            Tx(svg, tx0 + tws / 2, y + (mob ? 18.5 : 25.5), tag, { fs: 10, anchor: 'middle', fill: 'var(--bg)', weight: 600 });
          }
        }
      });
      PIPES.forEach((P, i) => {
        const y0 = yOf(i) + boxH, y1 = yOf(i + 1);
        const wd = P.bw ? 6 + 10 * Math.log10(P.bw / 1e11) : 20;
        const cx = pipeX;
        if (P.bw) {
          R(svg, cx - wd / 2, y0, wd, y1 - y0, `fill:${P.key ? 'var(--memory)' : 'rgba(111,166,255,.55)'}`);
          // flow chevrons
          for (let yy = y1 - 10; yy > y0 + 6; yy -= 12) Pa(svg, `M${r2(cx - wd / 2 + 3)},${r2(yy)}L${r2(cx)},${r2(yy - 5)}L${r2(cx + wd / 2 - 3)},${r2(yy)}`, 'fill:none;stroke:rgba(11,12,18,.55);stroke-width:1.5');
        } else {
          R(svg, cx - wd / 2 + 0.5, y0, wd - 1, y1 - y0, 'fill:none;stroke:rgba(111,166,255,.6);stroke-dasharray:3 3');
          Tx(svg, cx, (y0 + y1) / 2 + 4, '?', { fs: 12, anchor: 'middle', fill: 'var(--memory)', weight: 700 });
        }
        const tx = cx + 26;
        Tx(svg, tx, (y0 + y1) / 2 - 2, P.lab, { fs: mob ? 11.5 : 12.5, fill: P.key ? 'var(--memory)' : 'var(--ink)', weight: 700 });
        Tx(svg, tx, (y0 + y1) / 2 + 13, mob ? P.short + (P.beyond ? ' †' : '') : P.det + (P.beyond ? ' (beyond the glossary)' : ''), { fs: mob ? 9.5 : 10.5, fill: 'var(--ink-3)' });
      });
      // roofline bracket: GPU RAM -> register files
      const xb = w - brW + (mob ? 10 : 14);
      const yTop = yOf(0) + boxH / 2, yBot = yOf(3) + boxH / 2;
      Pa(svg, `M${r2(xb - 8)},${r2(yTop)}H${r2(xb)}V${r2(yBot)}H${r2(xb - 8)}`, 'fill:none;stroke:var(--memory);stroke-width:1.6');
      let y = yOf(LV.length - 1) + boxH + 4;
      if (mob) {
        Tx(svg, 0, y + 13, 'bracket: the roofline route, 3.35 TB/s', { fs: 9.5, fill: 'var(--memory)', weight: 600 });
        y += 18;
      } else {
        const ym = (yTop + yBot) / 2;
        ['the route rooflines', 'use: GPU RAM up to', 'the register files,', 'limited by its', 'narrowest pipe,'].forEach((ln, k) => Tx(svg, xb + 10, ym - 40 + k * 15, ln, { fs: 10.5, fill: 'var(--ink-2)' }));
        Tx(svg, xb + 10, ym - 40 + 5 * 15 + 2, '3.35 TB/s', { fs: 12, fill: 'var(--memory)', weight: 700 });
      }
      // one pass of the working set over each link, to scale (linear time)
      y += 20;
      Tx(svg, 0, y, mob ? `One pass over ${fmtB(st.ws)}, to scale:` : `One pass over ${fmtB(st.ws)} at each link's peak bandwidth, to scale`, { fs: mob ? 10.5 : 11.5, fill: 'var(--ink)', weight: 600 });
      y += 10;
      const known = PIPES.filter((P) => P.bw);
      const bwOf = (P) => P.pass || P.bw; // a pass from host to GPU uses one direction of the link
      const tMax = Math.max(...known.map((P) => st.ws / bwOf(P)));
      const barW = w - 2;
      fills = [];
      PIPES.forEach((P) => {
        const rowY = y + 6;
        Tx(svg, 0, rowY + 10, P.link + (P.beyond ? ' †' : ''), { fs: mob ? 10 : 10.5, fill: P.key ? 'var(--memory)' : 'var(--ink-2)', weight: P.key ? 700 : 500 });
        const by = rowY + 16;
        R(svg, 0.5, by, barW - 1, 9, 'fill:rgba(255,255,255,.025);stroke:var(--line)', { rx: 2 });
        if (P.bw) {
          const t = st.ws / bwOf(P), full = Math.max(1.5, (t / tMax) * (barW - 2));
          const fr = R(svg, 1, by + 1, full, 7, `fill:${P.key ? 'var(--memory)' : 'rgba(111,166,255,.6)'}`, { rx: 1.5 });
          fills.push({ el: fr, frac: t / tMax, full });
          Tx(svg, w, rowY + 10, fmtT(t) + (P === known[known.length - 1] ? '' : ` · ${sig(tMax / t, 3)}× ${mob ? 'PCIe speed' : 'faster than PCIe'}`), { fs: mob ? 10 : 10.5, anchor: 'end', fill: P.key ? 'var(--memory)' : 'var(--ink-2)', weight: 600 });
        } else {
          Tx(svg, w, rowY + 10, 'bandwidth not published', { fs: mob ? 10 : 10.5, anchor: 'end', fill: 'var(--ink-3)' });
        }
        y = by + 12;
      });
      paintFlow();
      return y + 4;
    });
    function paintFlow() {
      // during the sweep each bar grows at its own link's rate; the fastest finish first
      fills.forEach((F) => F.el.setAttribute('width', r2(Math.max(1.5, F.full * Math.min(1, flow / F.frac)))));
    }
    const sl = GG.ui.slider(f.controls, {
      label: 'working set', min: 1e3, max: 1e12, log: true, value: st.ws,
      format: fmtB, onInput: (v) => { st.ws = v; st.pre = -1; pr.mark(-1); update(); },
    });
    const pr = presetRow(f.controls, 'examples', PRE, (it, k) => { st.ws = it.bytes; st.pre = k; sl.set(it.bytes); pr.mark(k); update(); });
    pr.mark(st.pre);
    const row = GG.el('div', { class: 'pfb-row' });
    f.controls.append(row);
    const anim = GG.anim(f.stage, (t, dt) => {
      flow = Math.min(1, flow + dt / 5); // the slowest link takes 5 s on screen
      paintFlow();
      if (flow >= 1) { anim.stop(); }
    }, { autostart: false });
    GG.ui.button(row, { icon: 'play', label: 'Stream one pass', onClick: () => { flow = 0; paintFlow(); anim.start(); } });
    const sFit = stat(f, 'smallest level that holds it', 'memory');
    const sT = stat(f, 'one pass at 3.35 TB/s', 'memory');
    function update() {
      view.redraw();
      const i = fitIndex(st.ws);
      const names = ['on-chip, in the SMs', 'on-chip, in the SMs', 'L2 cache', 'GPU RAM', 'host RAM: too big for the GPU'];
      sFit.set(names[i], i === 4 ? 'danger' : 'memory');
      sT.set(i === 4 ? 'does not fit' : fmtT(st.ws / 3.35e12), i === 4 ? 'danger' : 'memory');
      const base = st.pre >= 0 ? PRE[st.pre].why + ' ' : '';
      let t;
      if (i <= 1) t = `${fmtB(st.ws)} is at most the 33 MiB (34.6 MB) that all 132 SMs' register files, or their L1 caches, hold between them, so it could be kept on-chip, split across the SMs. It still has to come up from GPU RAM once.`;
      else if (i === 2) t = `${fmtB(st.ws)} fits in the 50 MiB L2 cache, so repeated passes can be served from there. The first pass still reads GPU RAM.`;
      else if (i === 3) t = `${fmtB(st.ws)} is bigger than every cache on the chip, so every pass streams it from GPU RAM: at 3.35 TB/s one pass takes at least <b>${fmtT(st.ws / 3.35e12)}</b>, however fast the cores are. This is the common case the roofline is built on.`;
      else t = `${fmtB(st.ws)} is more than the H100's 80 GiB (85.9 GB) of GPU RAM, so on one GPU it can only live in host RAM and stream over PCIe at about 64 GB/s (one direction; the datasheet's 128 GB/s counts both directions together), ${fI(3.35e12 / 64e9)} times slower than HBM (<b>${fmtT(st.ws / 64e9)}</b> per pass), or be split across several GPUs.`;
      f.setWhy(base + t);
    }
    update();
  }

  /* Fig: roofline on linear axes — the memory roof's slope is the bandwidth */
  function mbRoof(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'The memory roof is a line of slope "bandwidth"', hint: 'drag the kernel · switch GPUs', wide: true,
      caption: 'The roofline component on linear axes. The blue line through the origin is the memory roof, attainable FLOP/s = memory bandwidth × arithmetic intensity; the triangle spells out its rise over run. The green line is the compute roof. Switch to log axes to see all six systems of the table at once; there the memory roof keeps its bandwidth as a vertical offset instead of a slope.',
    });
    const rf = GG.components.roofline(f, {
      system: 'h100-bf16', systems: ['a100-bf16', 'h100-bf16', 'b200-bf16', 'h100-fp8', 'b200-fp8', 'b200-fp4'],
      scale: 'linear', showScale: true, showControls: true, shade: 'memory',
      kernels: [{ label: 'Kernel', ai: 100 }],
      why: (S) => {
        if (!S || !S.system) return null;
        const bw = S.system.bw / 1e12, tf = S.system.flops / 1e12;
        const R0 = GG.components.roofline;
        const ai = S.ai;
        let t = `For ${S.system.phrase || S.system.label}, the memory roof rises by <b>${sig(bw, 3)} TFLOPS</b> for every extra FLOP per byte: its slope is the memory bandwidth, ${sig(bw, 3)} TB/s. It meets the ${fI(tf)} TFLOPS compute roof at the ridge point, ${fI(tf)} ÷ ${sig(bw, 3)} = <b>${R0.fmt.ridge(S.ridge)} FLOPs/byte</b>.`;
        if (ai != null) t += S.bound === 'memory'
          ? ` The kernel, at ${R0.fmt.ai(ai)} FLOPs/byte, sits on the slope: ${sig(bw, 3)} TB/s × ${R0.fmt.ai(ai)} = ${R0.fmt.perf(S.attainable)} at most, so it is memory-bound.`
          : ` The kernel, at ${R0.fmt.ai(ai)} FLOPs/byte, is past the ridge: memory could deliver enough bytes for ${sig(bw, 3)} TB/s × ${R0.fmt.ai(ai)} = ${R0.fmt.perf(bw * 1e12 * ai)}, more than the compute roof allows, so the compute roof caps it at ${R0.fmt.perf(S.attainable)}.`;
        return t;
      },
    });
    return rf;
  }

  /* Fig: the table as a map (log memory bandwidth × log arithmetic bandwidth), linked to the HTML table */
  function mbMap(ctx, slot, tblSlot, emph) {
    const f = mkFig(ctx, slot, {
      title: 'The table as a map: ridge point = arithmetic ÷ memory', hint: 'hover or tap a point or a table row',
      caption: 'Each mark is one row of the glossary\'s table, all of them Tensor Core rates (green); the shape gives the number format. Memory bandwidth runs across, arithmetic bandwidth up, both on log scales, so dividing one by the other is a constant distance: every dashed diagonal is a line of constant ridge point. Rows further up and to the left need more FLOPs per byte before their Tensor Cores, rather than their memory, set the limit. The table\'s rows also select a mark: tap one, or move through them with Tab.',
    });
    const st = { hi: 1 };
    const view = rsvg(f.stage, 'Log-log chart of the six table rows: memory bandwidth on the x axis, arithmetic bandwidth on the y axis, with diagonal lines of constant ridge point.', (svg, w) => {
      const mob = w < 560;
      const padL = mob ? 44 : 56, padR = mob ? 10 : 18, padT = mob ? 26 : 12, padB = 38;
      const H = mob ? 316 : 330;
      const x0 = padL, x1 = w - padR, y0 = padT, y1 = H - padB;
      const xr = [Math.log10(1.2), Math.log10(12)], yr = [Math.log10(150), Math.log10(15000)];
      const X = (v) => x0 + ((Math.log10(v) - xr[0]) / (xr[1] - xr[0])) * (x1 - x0);
      const Y = (v) => y1 - ((Math.log10(v) - yr[0]) / (yr[1] - yr[0])) * (y1 - y0);
      R(svg, x0, y0, x1 - x0, y1 - y0, 'fill:rgba(255,255,255,.015);stroke:var(--line)');
      [2, 3, 5, 8, 10].forEach((v) => { Ln(svg, X(v), y0, X(v), y1, 'stroke:var(--line)'); Tx(svg, X(v), y1 + 14, String(v), { fs: 10, anchor: 'middle', fill: 'var(--ink-3)' }); });
      [200, 500, 1000, 2000, 5000, 10000].forEach((v) => { Ln(svg, x0, Y(v), x1, Y(v), 'stroke:var(--line)'); Tx(svg, x0 - 6, Y(v) + 3.5, fI(v), { fs: 10, anchor: 'end', fill: 'var(--ink-3)' }); });
      Tx(svg, (x0 + x1) / 2, H - 6, 'memory bandwidth (TB/s, log)', { fs: 10.5, anchor: 'middle', fill: 'var(--ink-2)' });
      if (mob) Tx(svg, 0, 11, '↑ arithmetic bandwidth (TFLOPS, log)', { fs: 10, fill: 'var(--ink-2)' });
      else {
        const yl = Tx(svg, 11, (y0 + y1) / 2, 'arithmetic bandwidth (TFLOPS, log)', { fs: 10, anchor: 'middle', fill: 'var(--ink-2)' });
        yl.setAttribute('transform', `rotate(-90 11 ${r2((y0 + y1) / 2)})`);
      }
      const clip = GG.svg('clipPath', { id: GG.uid('pfbclip') }, svg);
      R(clip, x0, y0, x1 - x0, y1 - y0);
      const gI = G(svg, { 'clip-path': `url(#${clip.id})` });
      [100, 150, 300, 600, 1200].forEach((rp) => {
        Ln(gI, X(1.2), Y(rp * 1.2), X(12), Y(rp * 12), 'stroke:var(--ink-3);stroke-width:1;stroke-dasharray:4 4;opacity:.65');
        if (mob) {
          // on phones, label each diagonal where it leaves the right edge, away from the points
          // (150 and 300 are left unlabelled: their labels would collide with the B200 BF16 point, whose own label gives its ridge)
          if (12 * rp <= 15000 && rp !== 150 && rp !== 300) Tx(gI, x1 - 4, Y(12 * rp) + 12, `ridge ${fI(rp)}`, { fs: 9.5, fill: 'var(--ink-3)', anchor: 'end' });
        } else {
          // label near the top edge
          const xTop = 15000 / rp; // TB/s where the line exits the top
          const xe = Math.min(12, xTop);
          const lx = X(xe / 1.35), ly = Y((xe / 1.35) * rp);
          if (lx > x0 + 20) Tx(gI, lx - 4, ly - 5, `ridge ${fI(rp)}`, { fs: 9.5, fill: 'var(--ink-3)', anchor: 'end' });
        }
      });
      TABLE.forEach((t, k) => {
        const on = k === st.hi;
        const cx = X(t.tb), cy = Y(t.tf);
        // every row is a Tensor Core rate, so every mark is core green; the number format is the shape
        const rr = on ? 7 : 5.5, mst = `fill:var(--core);stroke:${on ? 'var(--ink)' : 'var(--bg)'};stroke-width:${on ? 2 : 1.5};cursor:pointer`;
        if (t.fmt === 'BF16') C(svg, cx, cy, rr, mst, { 'data-k': k });
        else if (t.fmt === 'FP8') Pa(svg, `M${r2(cx)},${r2(cy - rr * 1.25)}L${r2(cx + rr * 1.25)},${r2(cy)}L${r2(cx)},${r2(cy + rr * 1.25)}L${r2(cx - rr * 1.25)},${r2(cy)}Z`, mst, { 'data-k': k });
        else Pa(svg, `M${r2(cx)},${r2(cy - rr * 1.3)}L${r2(cx + rr * 1.2)},${r2(cy + rr * 0.9)}L${r2(cx - rr * 1.2)},${r2(cy + rr * 0.9)}Z`, mst, { 'data-k': k });
        const right = t.tb < 5 && t.id !== 'h100-fp8' && !(mob && t.gpu === 'H100');
        const lab = mob ? `${t.short} · ${fI(Math.round(t.tf / t.tb))}` : `${t.short} · ${ridgeStr(t.tf / t.tb)}`;
        const tx = right ? cx + 11 : cx - 11;
        // on phones the B200 BF16 label would run into the H100 FP8 mark to its left, so it sits just above its dot
        const lift = mob && t.id === 'b200-bf16';
        Tx(svg, lift ? cx - 6 : tx, lift ? cy - 10 : cy + 4, lab, { fs: mob ? 10 : 10.5, fill: on ? 'var(--ink)' : 'var(--ink-2)', anchor: right ? 'start' : 'end', weight: on ? 600 : 500, pe: false });
        C(svg, cx, cy, 16, 'fill:transparent;cursor:pointer', { 'data-k': k });
      });
      return H;
    });
    legend(f.stage, [['var(--core)', 'BF16 Tensor Cores', 'dot'], ['var(--core)', 'FP8', 'dia'], ['var(--core)', 'FP4', 'tri'], ['var(--ink-3)', 'constant ridge point', 'dline']]);
    const rows = linkTable(f, tblSlot, emph, (j) => pick(j));
    const sS = stat(f, 'system'), sA = stat(f, 'arithmetic', 'core'), sM = stat(f, 'memory', 'memory'), sR = stat(f, 'ridge point');
    function pick(k) {
      st.hi = k;
      view.redraw();
      rows.forEach((r, j) => r.classList.toggle('pfb-on', j === k));
      const t = TABLE[k], rp = t.tf / t.tb;
      sS.set(t.short); sA.set(fI(t.tf) + ' TFLOPS'); sM.set(t.tb + ' TB/s'); sR.set(ridgeStr(rp) + ' FLOPs/B');
      f.setWhy(`<b>${t.name}</b>: ${fI(t.tf)} TFLOP/s ÷ ${t.tb} TB/s = <b>${ridgeStr(rp)} FLOPs per byte</b>. A kernel must do at least that many floating point operations for every byte it moves between GPU RAM and the SMs before this GPU's Tensor Cores, rather than its memory, become the limit.${t.printed !== String(Math.round(rp)) && t.printed !== String(Math.floor(rp)) ? ` (The table prints ${t.printed}; see the check note below.)` : ''}`);
    }
    view.svg.addEventListener('pointerover', (e) => { const a = e.target.getAttribute && e.target.getAttribute('data-k'); if (a != null) pick(+a); });
    view.svg.addEventListener('pointerdown', (e) => { const a = e.target.getAttribute && e.target.getAttribute('data-k'); if (a != null) pick(+a); });
    pick(st.hi);
  }

  /* the glossary's table, inserted in place of tblSlot; each row (focusable) selects its system via pick(k) */
  function linkTable(f, tblSlot, emph, pick) {
    tblSlot.outerHTML = `<div class="pfb-tblhost">${tableHTML(emph)}</div>`;
    const host = f.root.parentNode.querySelector('.pfb-tblhost');
    const rows = host ? [...host.querySelectorAll('tbody tr')] : [];
    rows.forEach((r, j) => {
      r.setAttribute('aria-label', `Select ${TABLE[j].name} in the figure`);
      r.addEventListener('mouseenter', () => pick(j));
      r.addEventListener('focus', () => pick(j));
      r.addEventListener('click', (e) => { if (!e.target.closest('a')) pick(j); });
      r.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { if (e.target === r) e.preventDefault(); pick(j); } });
    });
    return rows;
  }

  /* Fig: the table's rows ranked twice, by arithmetic bandwidth and by ridge point */
  function abRank(ctx, slot, tblSlot) {
    const f = mkFig(ctx, slot, {
      title: 'Ranked by arithmetic bandwidth, then by ridge point', hint: 'hover or tap a line or a table row',
      caption: 'The six rows of the glossary\'s table twice: on the left in order of arithmetic bandwidth, on the right in order of ridge point (arithmetic bandwidth ÷ memory bandwidth). A line joins the two places of each row; amber lines are rows that change places, because the memory bandwidth feeding them differs. Within one GPU every format shares the same memory, so its rows keep their order. The table\'s rows also select a line: tap one, or move through them with Tab. The <a data-term="memory-bandwidth">Memory Bandwidth</a> entry draws the same rows as a map; the check of the table\'s ridge points is in the note below the table.',
    });
    const ridge = (t) => t.tf / t.tb;
    const byA = TABLE.map((t, k) => k).sort((a, b) => TABLE[b].tf - TABLE[a].tf);
    const byR = TABLE.map((t, k) => k).sort((a, b) => ridge(TABLE[b]) - ridge(TABLE[a]));
    const rankA = [], rankR = [];
    byA.forEach((k, i) => { rankA[k] = i; });
    byR.forEach((k, i) => { rankR[k] = i; });
    const moves = (k) => rankA[k] !== rankR[k];
    const st = { hi: 2 };
    const view = rsvg(f.stage, 'Slope chart: the six table rows ranked by arithmetic bandwidth on the left and by ridge point on the right, joined by lines; two pairs of lines cross.', (svg, w) => {
      const mob = w < 560;
      const fs = mob ? 9.5 : 11, side = mob ? 116 : Math.min(210, w * 0.3);
      const xL = side, xR = w - side;
      const top = mob ? 30 : 32, rowH = mob ? 30 : 36;
      const Y = (i) => top + i * rowH;
      Tx(svg, xL, 12, mob ? 'TFLOPS' : 'arithmetic bandwidth (TFLOPS)', { fs: mob ? 10 : 10.5, anchor: 'end', fill: 'var(--ink-2)', weight: 600 });
      Tx(svg, xR, 12, mob ? 'ridge (FLOPs/B)' : 'ridge point (FLOPs/byte)', { fs: mob ? 10 : 10.5, fill: 'var(--ink-2)', weight: 600 });
      const order = TABLE.map((t, k) => k).sort((a, b) => (a === st.hi) - (b === st.hi) || moves(a) - moves(b));
      order.forEach((k) => {
        const t = TABLE[k], on = k === st.hi, mv = moves(k);
        const ya = Y(rankA[k]), yb = Y(rankR[k]);
        const col = mv ? 'var(--control)' : 'var(--core)';
        Ln(svg, xL, ya, xR, yb, `stroke:${on ? 'var(--ink)' : col};stroke-width:${on ? 2.6 : 1.6};opacity:${on ? 1 : 0.7}`);
        C(svg, xL, ya, on ? 5 : 4, `fill:${col};stroke:var(--bg);stroke-width:1.5`);
        C(svg, xR, yb, on ? 5 : 4, `fill:${col};stroke:var(--bg);stroke-width:1.5`);
        const wt = on ? 700 : 500, fill = on ? 'var(--ink)' : 'var(--ink-2)';
        Tx(svg, xL - 10, ya + 4, `${t.short} · ${fI(t.tf)}`, { fs, anchor: 'end', fill, weight: wt });
        Tx(svg, xR + 10, yb + 4, `${ridgeStr(ridge(t))} · ${t.short}`, { fs, fill, weight: wt });
        // generous invisible hit targets: the line and both labels
        Ln(svg, xL, ya, xR, yb, 'stroke:transparent;stroke-width:14;cursor:pointer').setAttribute('data-k', k);
        R(svg, 0, ya - rowH / 2, xL, rowH, 'fill:transparent;cursor:pointer', { 'data-k': k });
        R(svg, xR, yb - rowH / 2, w - xR, rowH, 'fill:transparent;cursor:pointer', { 'data-k': k });
      });
      return Y(TABLE.length - 1) + 16;
    });
    legend(f.stage, [['var(--core)', 'keeps its place'], ['var(--control)', 'changes place']]);
    const sR = stat(f, 'ridge point'), sP = stat(f, 'rank: arithmetic → ridge', 'control');
    function pick(k) {
      st.hi = k;
      view.redraw();
      rows.forEach((r, j) => r.classList.toggle('pfb-on', j === k));
      const t = TABLE[k];
      sR.set(ridgeStr(ridge(t)) + ' FLOPs/B'); sP.set(`#${rankA[k] + 1} → #${rankR[k] + 1}`, moves(k) ? 'control' : 'core');
      let why = `<b>${t.name}</b>: ${fI(t.tf)} TFLOP/s ÷ ${t.tb} TB/s = <b>${ridgeStr(ridge(t))} FLOPs per byte</b>. It ranks #${rankA[k] + 1} of 6 by arithmetic bandwidth and #${rankR[k] + 1} by ridge point.`;
      const swaps = TABLE.map((u, j) => j).filter((j) => j !== k && (TABLE[j].tf - t.tf) * (ridge(TABLE[j]) - ridge(t)) < 0);
      swaps.forEach((j) => {
        const u = TABLE[j];
        why += t.tf > u.tf
          ? ` It has ${sig(t.tf / u.tf, 2)}× the arithmetic bandwidth of the ${u.short} row (${fI(t.tf)} vs ${fI(u.tf)} TFLOPS), but its memory is ${sig(t.tb / u.tb, 2)}× faster too (${t.tb} vs ${u.tb} TB/s), so its ridge point is lower: ${ridgeStr(ridge(t))} vs ${ridgeStr(ridge(u))}.`
          : ` It has less arithmetic bandwidth than the ${u.short} row (${fI(t.tf)} vs ${fI(u.tf)} TFLOPS) but a higher ridge point (${ridgeStr(ridge(t))} vs ${ridgeStr(ridge(u))}), because its memory is ${sig(u.tb / t.tb, 2)}× slower (${t.tb} vs ${u.tb} TB/s).`;
      });
      if (!swaps.length) why += ' Its place is the same in both orders.';
      f.setWhy(why);
    }
    const hit = (e) => { const a = e.target.getAttribute && e.target.getAttribute('data-k'); if (a != null && +a !== st.hi) pick(+a); };
    view.svg.addEventListener('pointerover', hit);
    view.svg.addEventListener('pointerdown', hit);
    const rows = linkTable(f, tblSlot, 'arith', (j) => pick(j));
    pick(st.hi);
  }

  /* ═════════════════════════ ARITHMETIC BANDWIDTH ═════════════════════════ */

  const FP32_CC = (132 * 128 * 2 * 1.98e9) / 1e12; // 66.908 TFLOPS, the Peak Rate entry's derivation
  const H100_UNITS = [
    { k: 'fp64', name: 'FP64', grp: 'CUDA Cores', v: (132 * 64 * 2 * 1.98e9) / 1e12, det: '132 SMs × 64 FP64 lanes × 2 FLOPs per FMA × 1.98 GHz; the datasheet rounds it to 34', beyond: true },
    { k: 'fp32', name: 'FP32', grp: 'CUDA Cores', v: FP32_CC, det: '132 SMs × 128 FP32 lanes × 2 FLOPs per FMA × 1.98 GHz, as the Peak Rate entry computes it' },
    { k: 'fp64tc', name: 'FP64', grp: 'Tensor Cores', v: 67, det: 'from the H100 SXM datasheet', beyond: true },
    { k: 'tf32', name: 'TF32', grp: 'Tensor Cores', v: 494.5, det: 'the datasheet lists 989 "with sparsity", which is 494.5 dense', beyond: true },
    { k: 'bf16', name: 'BF16', grp: 'Tensor Cores', v: 989, det: 'from the glossary\'s table, dense' },
    { k: 'fp8', name: 'FP8', grp: 'Tensor Cores', v: 1979, det: 'from the glossary\'s table, dense' },
  ];

  GG.entry('arithmetic-bandwidth', {
    render(body, ctx) {
      const s = ctx.html(body, `
<p><b>Arithmetic bandwidth</b> is the <a data-term="peak-rate">peak rate</a> at which arithmetic work can be performed by a system. It represents the theoretical maximum of the achievable throughput for arithmetic operations per second, usually counted in floating point operations per second (FLOP/s, or FLOPS). In a <a data-term="roofline-model">roofline model</a> of the hardware it sets the height of the "compute roof", the flat line on the right of the chart: however much work a <a data-term="kernel">kernel</a> does per byte, it cannot compute faster than this.</p>
${GG.noteHTML('intuition', '<p>Back in the factory of the <a data-term="memory-bandwidth">memory bandwidth</a> entry: memory bandwidth is the conveyor that brings raw material in, arithmetic bandwidth is how fast the machines on the floor can work it. A factory has several kinds of machines, each with its own top speed, and a job can only run as fast as the machines it is able to use.</p>')}
<h3>One arithmetic bandwidth per group of units</h3>
<p>There are many arithmetic bandwidths in a complete system: one for each grouping of hardware units that provide bandwidth for executing arithmetic operations. On a roofline, each is a compute roof of its own. Fig.&nbsp;1 draws three of an H100's roofs over the same 3.35&nbsp;TB/s memory roof: the FP32 <a data-term="cuda-core">CUDA Cores</a>, and the <a data-term="tensor-core">Tensor Cores</a> running BF16 and FP8 matrix math. Which roof applies depends on which units a kernel's instructions run on.</p>
<div data-slot="f1"></div>
<p>Fig.&nbsp;2 lists more of the groups on one H100 SXM. The spread is wide: from 33.5 TFLOPS for 64-bit floating point on the CUDA Cores to 1,979 TFLOPS for 8-bit floating point on the Tensor Cores, a factor of 59.</p>
<div data-slot="f2"></div>
<h3>CUDA Cores: one interface for everything</h3>
<p>On many GPUs, the most important arithmetic bandwidth is the bandwidth of the <a data-term="cuda-core">CUDA Cores</a> for floating point arithmetic. GPUs generally provide more bandwidth for floating point operations than for integer operations. On an H100, for example, each <a data-term="streaming-multiprocessor">SM</a> has 128 FP32 lanes but only 64 INT32 lanes (32 and 16 in each of its four sub-partitions, drawn under Fig.&nbsp;2), so per clock it can start twice as many floating point operations as integer ones.</p>
<p>The key to the <a data-term="cuda-device-architecture">Compute Unified Device Architecture (CUDA)</a> is that the CUDA Cores and supporting systems provide a unified computing interface for GPU applications, unlike prior GPU architectures. Before CUDA, a GPU had separate kinds of processors for separate stages of the graphics pipeline (vertex shading and pixel shading, for instance), and the hardware designers had to guess how much work each stage would get. In a unified design every core can run any work, so none of them sits idle because the work came in the "wrong" mix. Fig.&nbsp;3 makes that concrete with a toy chip.</p>
<div data-slot="f3"></div>
<h3>Tensor Cores: a hundred to one?</h3>
<p>In recent GPUs, the unity of the architecture has been lessened by the introduction of <a data-term="tensor-core">Tensor Cores</a>. They perform only matrix multiplication operations, but do so at a much higher arithmetic bandwidth than the <a data-term="cuda-core">CUDA Cores</a>. The glossary's rule of thumb is a ratio of <b>100:1</b> between Tensor Core and CUDA Core bandwidth. That makes the Tensor Core arithmetic bandwidth the most important one for <a data-term="kernel">kernels</a> that wish to maximize performance: work that can be phrased as matrix multiplication runs on the fast units, and everything else (in Fig.&nbsp;3's third mode) runs on the slow ones.</p>
<p>How close do the glossary's own figures come to that ratio? Fig.&nbsp;4 counts it out in squares, each one the FP32 CUDA Core bandwidth of the same GPU: 66.9 TFLOPS for the H100 formats, 75 TFLOPS for the B200's FP4.</p>
<div data-slot="f4"></div>
${GG.noteHTML('check', `<p><b>The rule of thumb vs these particular figures.</b> The ratio depends on the number format and on the GPU generation. With the numbers this glossary uses for an H100 SXM, 989 TFLOPS of dense BF16 Tensor Core math ÷ 66.9 TFLOPS of FP32 CUDA Core math = <b>14.8</b>, about 15:1. At FP8, 1,979 ÷ 66.9 = <b>29.6</b>, about 30:1, and the datasheet's "with sparsity" FP8 figure, 3,958 TFLOPS, gives 59:1. On a B200 the lowest-precision format reaches the rule of thumb. NVIDIA's <a href="${HGX_PAGE}">HGX B200 specification</a> gives 600 TFLOPS of FP32 for eight GPUs, 75 TFLOPS per GPU (beyond the glossary), so the table's 9,000 TFLOPS of dense FP4 Tensor Core math, the "nine PFLOPS" below, ÷ 75 = <b>120:1</b>. Dense FP8 gives 4,500 ÷ 75 = 60:1 and dense BF16 2,250 ÷ 75 = 30:1. So 100:1 is a fair order of magnitude for FP4 on Blackwell, while BF16 and FP8 on an H100 sit nearer 15 to 30:1. The ratio also grows if you compare against CUDA Core instructions that are not fused multiply-adds, which count one FLOP per lane per clock instead of two, so the H100's FP32 CUDA Core rate halves to 33.45 TFLOPS. Against that non-FMA rate, BF16 gives 989 ÷ 33.45 = 29.6 (a different comparison from FP8 against the FMA rate above; it lands on the same 29.6 because FP8 is twice BF16 and the FMA rate twice the non-FMA one) and FP8 gives 1,979 ÷ 33.45 = 59.2.</p>`)}
<h3>PetaFLOPS</h3>
<p>Contemporary GPUs have Tensor Core arithmetic bandwidths measured in petaFLOPS: quadrillions (10<sup>15</sup>) of floating point operations per second. For example, <a href="https://modal.com/blog/introducing-b200-h200">B200 GPUs</a> have a bandwidth of nine PFLOPS when running 4-bit floating point matrix multiplications. For scale: a person doing one multiply or add per second, without sleep, would need about 285 million years to do what a B200 does in one second (9 × 10<sup>15</sup> seconds ÷ 3.16 × 10<sup>7</sup> seconds per year).</p>
<p>Representative bandwidth numbers for NVIDIA data center GPUs between the Ampere and Blackwell <a data-term="streaming-multiprocessor-architecture">Streaming Multiprocessor architectures</a> are listed in the glossary's table, below Fig.&nbsp;5. Each row pairs one arithmetic bandwidth with the <a data-term="memory-bandwidth">memory bandwidth</a> that feeds it; their quotient is the <a data-term="roofline-model">ridge point</a>, the <a data-term="arithmetic-intensity">arithmetic intensity</a> at which a kernel stops being <a data-term="memory-bound">memory-bound</a> and becomes <a data-term="compute-bound">compute-bound</a>. Fig.&nbsp;5 ranks the rows both ways: more arithmetic bandwidth does not always mean a higher ridge point.</p>
<div data-slot="f5"></div>
<div data-slot="tbl"></div>
${GG.noteHTML('check', FP8_CHECK)}
${GG.noteHTML('beyond', DS_NOTE)}
<div data-slot="reading"></div>`);

      guard(() => abRoof(ctx, s.f1));
      guard(() => abBars(ctx, s.f2));
      guard(() => abUnity(ctx, s.f3));
      guard(() => abSquares(ctx, s.f4));
      guard(() => abRank(ctx, s.f5, s.tbl));
      ctx.reading(s.reading, [
        { href: 'https://modal.com/blog/introducing-b200-h200', label: 'Modal: introducing B200 and H200 GPUs', note: 'nine PFLOPS of FP4 matrix math on the B200' },
        { href: A100_DS, label: 'NVIDIA A100 datasheet', note: 'the A100 80GB SXM row' },
        { href: H100_DS, label: 'NVIDIA H100 datasheet', note: 'the H100 SXM rows, plus the FP64 and TF32 figures in Fig. 2' },
        { href: B200_DS, label: 'NVIDIA DGX B200 datasheet', note: 'the B200 rows (eight-GPU totals, with sparsity)' },
        { href: HGX_PAGE, label: 'NVIDIA HGX platform specifications', note: 'HGX B200 per-system rates, including BF16 and FP32 (beyond the glossary)' },
        { href: 'https://resources.nvidia.com/en-us-hopper-architecture/nvidia-h100-tensor-c', label: 'NVIDIA H100 Tensor Core GPU Architecture whitepaper', note: 'per-SM unit counts and the 66.9 TFLOPS FP32 figure' },
      ]);
    },
  });

  /* Fig: several compute roofs over one memory roof */
  function abRoof(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'FP32, BF16, FP8: which roof does a kernel hit?', hint: 'pick the units · drag the kernel', wide: true,
      caption: 'The roofline component on log axes, for an H100 SXM. The selected group of units draws the bright green compute roof; the other two stay as faint roofs for comparison. All three share the same memory roof (3.35 TB/s), so a faster roof also moves the ridge point to the right. FP32 CUDA Cores: 66.9 TFLOPS (ridge 19.97 FLOPs/byte); BF16 Tensor Cores: 989 (ridge 295.2); FP8 Tensor Cores: 1,979 (ridge 590.7).',
    });
    const IDS = ['h100-fp32', 'h100-bf16', 'h100-fp8'];
    const R0 = GG.components.roofline;
    const rf = R0(f, {
      system: 'h100-bf16', systems: IDS, compare: ['h100-fp32', 'h100-fp8'],
      showControls: true, shade: 'compute', kernels: [{ label: 'Kernel', ai: 400 }],
      why: (S) => {
        if (!S || !S.system) return null;
        const tf = S.system.flops / 1e12;
        let t = `The compute roof of ${S.system.phrase || S.system.label} sits at <b>${R0.fmt.perf(S.system.flops)}</b>: that is this group's arithmetic bandwidth, the most it can do whatever the kernel's intensity.`;
        if (S.ai != null) {
          t += S.bound === 'compute'
            ? ` At ${R0.fmt.ai(S.ai)} FLOPs/byte the kernel is past the ridge (${R0.fmt.ridge(S.ridge)}), so this roof is its limit: ${R0.fmt.perf(S.attainable)}.`
            : ` At ${R0.fmt.ai(S.ai)} FLOPs/byte the kernel is left of the ridge (${R0.fmt.ridge(S.ridge)}): memory caps it at ${R0.fmt.perf(S.attainable)}, and a higher compute roof would not help it.`;
        }
        if (tf < 100) t += ' Switch to the Tensor Cores to see the roof jump by more than an order of magnitude.';
        return t;
      },
    });
    rf.on('change', (S) => {
      if (!S || !S.system) return;
      const others = IDS.filter((id) => id !== S.system.id);
      if (others.length === 2 && (rf._cmp || '') !== others.join()) { rf._cmp = others.join(); rf.setCompare(others); }
    });
    return rf;
  }

  /* Fig: the arithmetic bandwidths of one H100: linear bars (default) or dots on a log strip */
  function abBars(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Arithmetic bandwidths of one H100 SXM', hint: 'tap a row · switch the axis', wide: true,
      caption: 'Peak dense rates. On the linear axis bar length is proportional to the rate, so ratios read as lengths; the log axis (each gridline ten times the one before) spreads out the small rates, and draws dots because a log axis has no zero for a bar to start from. Fused multiply-adds count as two FLOPs everywhere. FP32 on the CUDA Cores and BF16 and FP8 on the Tensor Cores are the glossary\'s figures; the FP64 and TF32 rows are from NVIDIA\'s H100 datasheet and whitepaper (†, beyond the glossary). The dashed line marks one hundred times the FP32 CUDA Core rate, where the 100:1 rule of thumb would put the Tensor Cores. Underneath: the lanes of one SM sub-partition, which is why integer math has half the CUDA Cores\' floating point bandwidth.',
    });
    const st = { k: 4, scale: 'linear' };
    legend(f.stage, [['rgba(52,211,153,.45)', 'CUDA Cores'], ['var(--core)', 'Tensor Cores'], ['var(--ink-3)', '100 × FP32 CUDA Cores', 'dline']]);
    const view = rsvg(f.stage, 'Chart of the arithmetic bandwidth of six groups of units on an H100: FP64 and FP32 CUDA Cores, and FP64, TF32, BF16 and FP8 Tensor Cores, plus a diagram of the 32 FP32 and 16 INT32 lanes in one SM sub-partition.', (svg, w) => {
      const mob = MOB(w);
      const lin = st.scale === 'linear';
      const labW = mob ? 104 : 190, padR = mob ? 8 : 16;
      const x0 = labW, x1 = w - padR;
      const rowH = mob ? 34 : 36, top = 8;
      const lo = 10, hi = 10000, linHi = 7000;
      const X = lin ? (v) => x0 + (v / linHi) * (x1 - x0) : (v) => x0 + ((Math.log10(v) - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo))) * (x1 - x0);
      const yEnd = top + H100_UNITS.length * rowH;
      const ticks = lin ? (mob ? [0, 2000, 4000, 6000] : [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000]) : [10, 100, 1000, 10000];
      ticks.forEach((v) => {
        const x = lin && v === 0 ? x0 : X(v);
        Ln(svg, x, top - 4, x, yEnd, 'stroke:var(--line);stroke-width:1');
        Tx(svg, x, yEnd + 15, fI(v), { fs: 10, anchor: v === ticks[ticks.length - 1] && !lin ? 'end' : v === ticks[0] ? 'start' : 'middle', fill: 'var(--ink-3)' });
      });
      Tx(svg, (x0 + x1) / 2, yEnd + 31, lin ? 'TFLOPS (linear)' : 'TFLOPS (log scale)', { fs: 10.5, anchor: 'middle', fill: 'var(--ink-2)' });
      H100_UNITS.forEach((u, i) => {
        const y = top + i * rowH, on = i === st.k;
        const tc = u.grp === 'Tensor Cores';
        const g = G(svg, { 'data-k': i, style: 'cursor:pointer' });
        R(g, 0, y, w, rowH, `fill:${on ? 'rgba(255,255,255,.045)' : 'transparent'}`, { 'data-k': i });
        Tx(g, 4, y + rowH / 2 - (mob ? 2 : 1), `${u.name} ${mob ? (tc ? 'TC' : 'CUDA') : u.grp}${u.beyond ? ' †' : ''}`, { fs: mob ? 11 : 12, fill: on ? 'var(--ink)' : 'var(--ink-2)', weight: on ? 600 : 500, pe: false });
        Tx(g, 4, y + rowH / 2 + 12, `${sig(u.v / FP32_CC, 2)}× FP32 CUDA`, { fs: 9.5, fill: 'var(--ink-3)', pe: false });
        const bh = 14, by = y + (rowH - bh) / 2;
        const fillC = tc ? 'var(--core)' : 'rgba(52,211,153,.45)';
        const lab = sig(u.v, u.v >= 1000 ? 4 : 3);
        if (lin) {
          R(g, x0, by, Math.max(1.5, X(u.v) - x0), bh, `fill:${fillC};stroke:${on ? 'var(--ink)' : 'none'};stroke-width:1.4;pointer-events:none`, { rx: 2 });
          const inside = X(u.v) - x0 > tw(lab, 11) + 14;
          Tx(g, inside ? X(u.v) - 6 : X(u.v) + 6, by + bh / 2 + 4, lab, { fs: 11, anchor: inside ? 'end' : 'start', fill: inside ? 'var(--bg)' : 'var(--ink)', weight: 700, pe: false });
        } else {
          Ln(g, x0, by + bh / 2, x1, by + bh / 2, 'stroke:var(--line);stroke-width:1;stroke-dasharray:1 3;pointer-events:none');
          C(g, X(u.v), by + bh / 2, on ? 7 : 6, `fill:${fillC};stroke:${on ? 'var(--ink)' : 'var(--bg)'};stroke-width:1.5;pointer-events:none`);
          const leftLab = X(u.v) + 10 + tw(lab, 11) > x1;
          Tx(g, leftLab ? X(u.v) - 10 : X(u.v) + 10, by + bh / 2 + 4, lab, { fs: 11, anchor: leftLab ? 'end' : 'start', fill: 'var(--ink)', weight: 700, pe: false });
        }
      });
      // 100x rule of thumb
      const xr = X(FP32_CC * 100);
      Ln(svg, xr, top - 4, xr, yEnd, 'stroke:var(--ink-3);stroke-width:1.2;stroke-dasharray:4 3');
      Tx(svg, xr - 4, top + 8, mob ? '100×' : '100 × FP32', { fs: 10, anchor: 'end', fill: 'var(--ink-3)' });
      // lanes of one sub-partition: 32 FP32, 16 INT32 (16 FP64 too)
      let y = yEnd + 54;
      Tx(svg, 0, y, mob ? 'One sub-partition, per clock:' : 'One SM sub-partition (a quarter of an SM), lanes that start an operation each clock:', { fs: mob ? 10.5 : 11.5, fill: 'var(--ink)', weight: 600 });
      const lanesRow = (yy, n, name, sub, fill) => {
        const lw = mob ? 76 : 110, cell = Math.min(14, (w - lw - 4) / 32 - 2);
        Tx(svg, 0, yy + cell - 2, name, { fs: mob ? 10.5 : 11, fill: 'var(--ink-2)', weight: 600 });
        for (let i = 0; i < n; i++) R(svg, lw + i * (cell + 2), yy, cell, cell, `fill:${fill}`, { rx: 2 });
        Tx(svg, lw + n * (cell + 2) + 6, yy + cell - 2, sub, { fs: 10, fill: 'var(--ink-3)' });
        return cell;
      };
      y += 10;
      const c1 = lanesRow(y, 32, 'FP32', '', 'var(--core)');
      y += c1 + 8;
      lanesRow(y, 16, 'INT32', mob ? 'half' : 'half as many: 64 vs 128 per SM', 'rgba(52,211,153,.55)');
      y += c1 + 6;
      return y;
    });
    const sB = stat(f, 'arithmetic bandwidth', 'core'), sX = stat(f, '× FP32 CUDA Cores'), sR = stat(f, 'ridge at 3.35 TB/s', 'memory');
    function pick(k) {
      st.k = clamp(k, 0, H100_UNITS.length - 1);
      view.redraw();
      const u = H100_UNITS[st.k];
      sB.set(sig(u.v, u.v >= 1000 ? 4 : 3) + ' TFLOPS'); sX.set(sig(u.v / FP32_CC, 3) + '×'); sR.set(sig(u.v / 3.35, 4) + ' FLOPs/B');
      f.setWhy(`<b>${u.name} on the ${u.grp}</b>: ${sig(u.v, u.v >= 1000 ? 4 : 3)} TFLOPS: ${u.det}. That is ${sig(u.v / FP32_CC, 3)} times the FP32 CUDA Core rate, and with the H100's 3.35 TB/s of memory bandwidth it puts the ridge point at ${sig(u.v, 4)} ÷ 3.35 = <b>${sig(u.v / 3.35, 4)} FLOPs per byte</b>.${u.beyond ? ' († beyond the glossary)' : ''}`);
    }
    view.svg.addEventListener('click', (e) => { const g = e.target.closest && e.target.closest('[data-k]'); if (g) pick(+g.getAttribute('data-k')); });
    view.svg.setAttribute('tabindex', '0');
    view.svg.setAttribute('data-keys', '');
    view.svg.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); pick(st.k + 1); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); pick(st.k - 1); }
    });
    GG.ui.seg(f.controls, { label: 'units', options: H100_UNITS.map((u, i) => ({ value: i, label: u.name + (u.grp === 'Tensor Cores' ? ' TC' : ' CUDA') })), value: st.k, onChange: (v) => pick(v) });
    GG.ui.seg(f.controls, { label: 'axis', options: [{ value: 'linear', label: 'linear' }, { value: 'log', label: 'log' }], value: st.scale, onChange: (v) => { st.scale = v; view.redraw(); } });
    pick(st.k);
  }

  /* Fig: why unified cores matter, and how Tensor Cores lessen the unity (a toy chip) */
  function abUnity(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Split, unified, unified + Tensor Cores', hint: 'pick a design · change the work mix', wide: true,
      caption: 'A toy chip with 32 equal cores, not a real GPU. Split: 8 cores can only do vertex work and 24 only pixel work (the 1 : 3 split of a GeForce 7900-class GPU). Unified: any core does any work. Unified + Tensor Cores: the 32 CUDA Cores do everything that is not a matrix multiplication, and a Tensor Core block does matrix multiplications at R times their combined rate, both running at the same time. Each core shows how busy it is while the job runs; the job takes as long as its slowest part. In the Tensor Core design, the two bars underneath compare the job\'s duration with and without the Tensor Cores, to scale.',
    });
    const st = { mode: 'split', mix: 0.5, R: 15 };
    legend(f.stage, [['var(--core)', 'busy'], ['var(--line-2)', 'idle', 'outline'], ['var(--ink-2)', 'vertex core (split design)', 'outline'], ['var(--ink-2)', 'pixel core (split design)', 'dash']]);
    let M = null;
    function model() {
      const m = st.mix;
      if (st.mode === 'split') {
        const T = Math.max(m / 8, (1 - m) / 24); // work units per core-time
        return { T, rate: 1 / (32 * T), uA: (m / 8) / T, uB: ((1 - m) / 24) / T };
      }
      if (st.mode === 'unified') return { T: 1 / 32, rate: 1, uA: 1, uB: 1 };
      // CUDA Cores rate 1 (all 32 together), Tensor Cores rate R; work 1 = (1-m) non-matmul + m matmul
      const tC = 1 - m, tT = m / st.R, T = Math.max(tC, tT);
      return { T, rate: 1 / T, uA: tC / T, uB: tT / T };
    }
    const view = rsvg(f.stage, 'A toy chip drawn as a grid of cores, coloured by how busy each core is under the chosen design and work mix.', (svg, w) => {
      M = model();
      const mob = MOB(w);
      const tc = st.mode === 'tc';
      const cols = mob ? 8 : 16, gap = mob ? 5 : 6;
      const tcW = tc ? (mob ? w : Math.min(300, w * 0.32)) : 0;
      const gridW = tc && !mob ? w - tcW - 24 : w;
      const cs = Math.min(mob ? 36 : 40, (gridW - gap * (cols - 1)) / cols);
      const rows = 32 / cols;
      const gx = 0, gy = 22;
      Tx(svg, gx, 12, tc ? (mob ? '32 CUDA Cores: all non-matrix work' : '32 CUDA Cores: everything except matrix multiplication') : st.mode === 'split' ? '8 vertex cores + 24 pixel cores' : '32 unified cores: any work', { fs: 11, fill: 'var(--ink-2)', weight: 600 });
      for (let i = 0; i < 32; i++) {
        const cx = gx + (i % cols) * (cs + gap), cy = gy + Math.floor(i / cols) * (cs + gap);
        let u, kind;
        if (st.mode === 'split') { kind = i < 8 ? 'v' : 'p'; u = kind === 'v' ? M.uA : M.uB; } else { kind = 'u'; u = M.uA; }
        const edge = kind === 'u' ? 'var(--line-2)' : 'var(--ink-2)';
        R(svg, cx, cy, cs, cs, `fill:rgba(255,255,255,.02);stroke:${edge};stroke-width:1.2${kind === 'p' ? ';stroke-dasharray:3 2' : ''}`, { rx: 4 });
        R(svg, cx + 3, cy + 3 + (cs - 6) * (1 - u), cs - 6, (cs - 6) * u, 'fill:var(--core);opacity:.85', { rx: 2 });
      }
      let yEnd = gy + rows * (cs + gap);
      if (tc) {
        const tx = mob ? 0 : w - tcW, ty = mob ? yEnd + 22 : gy;
        const th = mob ? 70 : rows * (cs + gap) - gap;
        Tx(svg, tx, ty - 10, `Tensor Cores: matrix multiplication at ${st.R}×`, { fs: 11, fill: 'var(--ink-2)', weight: 600 });
        R(svg, tx, ty, tcW, th, 'fill:rgba(255,255,255,.02);stroke:var(--core);stroke-width:1.4', { rx: 6 });
        R(svg, tx + 4, ty + 4 + (th - 8) * (1 - M.uB), tcW - 8, (th - 8) * M.uB, 'fill:var(--core);opacity:.85', { rx: 3 });
        Tx(svg, tx + tcW / 2, ty + th / 2 + 5, `${pct(M.uB, 0)} busy`, { fs: 13, anchor: 'middle', fill: M.uB > 0.55 ? 'var(--bg)' : 'var(--ink)', weight: 700 });
        if (mob) yEnd = ty + th + 4;
        // the job's duration, to scale: CUDA Cores alone (1) vs with the Tensor Cores (M.T)
        let yy = yEnd + 22;
        const lw = mob ? 118 : 170, bw0 = w - lw - (mob ? 92 : 130);
        [['CUDA Cores only', 1], ['with Tensor Cores', M.T]].forEach(([nm, T], j) => {
          Tx(svg, 0, yy + 10, nm, { fs: mob ? 10.5 : 11, fill: 'var(--ink-2)', weight: 600 });
          R(svg, lw, yy, Math.max(2, bw0 * T), 13, `fill:${j ? 'var(--core)' : 'rgba(52,211,153,.45)'}`, { rx: 2 });
          Tx(svg, lw + Math.max(2, bw0 * T) + 6, yy + 10.5, j ? `${sig(T, 2)} · ${sig(1 / T, 3)}× faster` : (mob ? '1' : '1 (the whole job)'), { fs: 10, fill: 'var(--ink-3)' });
          yy += 22;
        });
        Tx(svg, 0, yy + 6, 'job duration, to scale', { fs: 9.5, fill: 'var(--ink-3)' });
        yEnd = yy + 6;
      }
      return yEnd + 4;
    });
    const sMode = GG.ui.seg(f.controls, {
      label: 'design', value: st.mode,
      options: [{ value: 'split', label: 'split (pre-CUDA)' }, { value: 'unified', label: 'unified (CUDA)' }, { value: 'tc', label: 'unified + Tensor Cores' }],
      onChange: (v) => { st.mode = v; syncMix(); update(); },
    });
    const slMix = GG.ui.slider(f.controls, { label: 'vertex share', min: 0, max: 100, step: 1, value: 50, format: (v) => v + '%', onInput: (v) => { st.mix = v / 100; update(); } });
    const segR = GG.ui.seg(f.controls, { label: 'Tensor Core : CUDA Core ratio', value: st.R, options: [{ value: 15, label: '15 (H100 BF16)' }, { value: 30, label: '30 (H100 FP8)' }, { value: 100, label: '100 (rule of thumb)' }], onChange: (v) => { st.R = v; update(); } });
    function syncMix() {
      const lab = slMix.el.querySelector('.ctl-lab span');
      if (lab) lab.textContent = st.mode === 'tc' ? 'matmul share' : 'vertex share';
      segR.el.style.display = st.mode === 'tc' ? '' : 'none';
      if (st.mode === 'tc') { st.mix = 0.9; slMix.set(90); } else { st.mix = 0.5; slMix.set(50); }
      // in the unified design the mix makes no difference, so the slider is switched off
      slMix.input.disabled = st.mode === 'unified';
      slMix.el.style.opacity = st.mode === 'unified' ? '0.55' : '';
    }
    const sRate = stat(f, 'job speed', 'core'), sUse = stat(f, 'cores busy');
    function update() {
      M = model();
      view.redraw();
      const m = st.mix;
      if (st.mode === 'split') {
        sRate.set(pct(M.rate, 0) + ' of peak'); sUse.set(pct(M.rate, 0));
        const lim = m / 8 > (1 - m) / 24 ? 'vertex' : 'pixel';
        f.setWhy(Math.abs(m - 0.25) < 0.005
          ? `With exactly <b>25%</b> vertex work, the 1 : 3 split matches the work and every core is busy. Any other mix leaves one kind of core waiting.`
          : `With ${pct(m, 0)} vertex work, the <b>${lim} cores</b> are the bottleneck and the others finish early and wait: the chip runs at <b>${pct(M.rate, 0)}</b> of its peak. Hardware designers had to guess this ratio years before the games that would use it existed.`);
      } else if (st.mode === 'unified') {
        sRate.set('100% of peak'); sUse.set('100%');
        f.setWhy('Every core can do vertex work, pixel work or general computation, so whatever the mix, all <b>32 cores stay busy</b> and the chip runs at its peak (the mix slider is off: any mix gives 100%). This uniformity is what "compute unified" means.');
      } else {
        sRate.set(sig(M.rate, 3) + '× CUDA-only'); sUse.set(`CUDA ${pct(M.uA, 0)} · TC ${pct(M.uB, 0)}`);
        const tcB = M.uB > M.uA - 1e-9;
        f.setWhy(`${pct(m, 0)} of the FLOPs are matrix multiplications. The Tensor Cores finish them in ${sig(m / st.R, 2)} of the time the CUDA Cores alone would need for the whole job; the CUDA Cores need ${m >= 1 ? '0 (there is no non-matrix work)' : sig(1 - m, 2)} for the rest. The job is <b>${sig(M.rate, 3)}× faster</b> than on CUDA Cores alone, ${tcB ? 'and the Tensor Cores set the pace' : `far below ${st.R}×: the ${pct(1 - m, 0)} that is not matrix math keeps the CUDA Cores busy while the Tensor Cores wait`}. Only kernels that are nearly all matrix multiplication get the full Tensor Core bandwidth.`);
      }
    }
    syncMix();
    update();
  }

  /* Fig: the 100:1 rule of thumb in squares */
  const B200_FP32 = 75; // TFLOPS per GPU: 600 TFLOPS for an eight-GPU HGX B200 (NVIDIA's HGX specification)
  function abSquares(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Counting the ratio in squares', hint: 'pick a Tensor Core format',
      caption: 'One square is the same GPU\'s FP32 CUDA Core bandwidth: 66.9 TFLOPS on the H100 SXM, 75 TFLOPS on the B200 (600 TFLOPS for eight GPUs in NVIDIA\'s HGX B200 specification, beyond the glossary). The green squares are the Tensor Core bandwidth for the chosen format, in the same unit; the hundred squares in the outlined block are what a 100:1 ratio would be, and a ratio above 100 carries on in further rows of ten below the block (the squares shrink to fit). Dense figures are the glossary\'s (BF16, FP8, FP4) or the datasheet\'s (TF32); "with sparsity" uses the datasheets\' doubled figures for 2:4 structured sparsity.',
    });
    const FM = [
      { k: 'H100 TF32', v: 494.5, base: FP32_CC, baseTxt: '66.9', gpu: 'H100' },
      { k: 'H100 BF16', v: 989, base: FP32_CC, baseTxt: '66.9', gpu: 'H100' },
      { k: 'H100 FP8', v: 1979, base: FP32_CC, baseTxt: '66.9', gpu: 'H100' },
      { k: 'B200 FP4', v: 9000, base: B200_FP32, baseTxt: '75', gpu: 'B200' },
    ];
    const st = { f: 1, sparse: false };
    const view = rsvg(f.stage, 'A grid of squares in rows of ten; the filled ones show the Tensor Core to CUDA Core bandwidth ratio for the chosen format, the outlined ten by ten block shows the 100 to 1 rule of thumb, and ratios above 100 continue in rows below it.', (svg, w) => {
      const m = FM[st.f];
      const v = m.v * (st.sparse ? 2 : 1);
      const ratio = v / m.base;
      const rows = Math.max(10, Math.ceil(ratio / 10 - 1e-9));
      // past 100 the grid grows downward in rows of ten; squares shrink so the whole grid stays within about 420 px
      const gap = rows > 10 ? 3 : 4, cs = Math.min(30, (w - 60 - gap * 9) / 10, (420 - gap * (rows - 1)) / rows);
      const gridW = cs * 10 + gap * 9, gridH = cs * rows + gap * (rows - 1), blockH = cs * 10 + gap * 9;
      const x0 = Math.max(56, (w - gridW) / 2 + 20), y0 = 10;
      // the single CUDA Core square
      R(svg, 0, y0, cs, cs, 'fill:rgba(52,211,153,.45);stroke:none', { rx: 3 });
      Tx(svg, cs / 2, y0 + cs + 13, '= 1', { fs: 10, anchor: 'middle', fill: 'var(--ink-3)' });
      Tx(svg, cs / 2, y0 + cs + 26, m.gpu, { fs: 9.5, anchor: 'middle', fill: 'var(--ink-3)' });
      Tx(svg, cs / 2, y0 + cs + 38, 'FP32', { fs: 9.5, anchor: 'middle', fill: 'var(--ink-3)' });
      const n = Math.max(100, Math.ceil(ratio - 1e-9));
      for (let i = 0; i < n; i++) {
        const cx = x0 + (i % 10) * (cs + gap), cy = y0 + Math.floor(i / 10) * (cs + gap);
        R(svg, cx + 0.5, cy + 0.5, cs - 1, cs - 1, 'fill:none;stroke:var(--line-2);stroke-width:1;stroke-dasharray:3 2', { rx: cs > 20 ? 3 : 2 });
        const fill = clamp(ratio - i, 0, 1);
        if (fill > 0) R(svg, cx, cy, cs * fill, cs, 'fill:var(--core)', { rx: fill < 1 ? 1 : (cs > 20 ? 3 : 2) });
      }
      // the 100:1 rule of thumb: the first ten rows, outlined
      R(svg, x0 - 3.5, y0 - 3.5, gridW + 7, blockH + 7, 'fill:none;stroke:var(--ink-2);stroke-width:1.4', { rx: 5 });
      Tx(svg, x0 - 9, y0 + blockH + 3, '100:1', { fs: 10, anchor: 'end', fill: 'var(--ink-2)', weight: 600 });
      const over = ratio > 100;
      if (over) Tx(svg, x0 + gridW, y0 + gridH + 18, `+ ${sig(ratio - 100, 3)} squares beyond the hundred`, { fs: 11, anchor: 'end', fill: 'var(--core)', weight: 600 });
      return y0 + gridH + (over ? 26 : 8);
    });
    const sR = stat(f, 'Tensor : CUDA', 'core'), sT = stat(f, 'Tensor Core TFLOPS', 'core'), sG = stat(f, 'versus 100:1');
    GG.ui.seg(f.controls, { label: 'Tensor Core format', value: st.f, options: FM.map((m, i) => ({ value: i, label: m.k })), onChange: (v) => { st.f = v; update(); } });
    GG.ui.toggle(f.controls, { label: 'with sparsity (datasheet ×2)', value: false, onChange: (v) => { st.sparse = v; update(); } });
    function update() {
      view.redraw();
      const m = FM[st.f], v = m.v * (st.sparse ? 2 : 1), ratio = v / m.base;
      sR.set(sig(ratio, 3) + ' : 1'); sT.set(fI(v)); sG.set(ratio >= 100 ? `${sig(ratio / 100, 2)}× over` : `${sig(100 / ratio, 2)}× short`, ratio >= 100 ? 'core' : '');
      const tail = ratio >= 100
        ? `That meets the rule of thumb: on a B200, ${st.sparse ? 'sparse ' : ''}FP4 matrix math is more than a hundred times the CUDA Cores' FP32 rate.`
        : `The rule of thumb's hundred squares would need ${sig(100 / ratio, 2)} times more. ${ratio >= 10 ? 'Even so, matrix math on the Tensor Cores is more than an order of magnitude faster than general arithmetic on the CUDA Cores.' : 'TF32 trades speed for range and precision: it is the slowest Tensor Core format here, yet still several times the CUDA Core rate.'}`;
      f.setWhy(`${m.k} Tensor Cores${st.sparse ? ' with sparsity' : ''}: ${fI(v)} ÷ ${m.baseTxt} = <b>${sig(ratio, 3)} squares</b>, a ratio of about ${Math.round(ratio)}:1. ${tail}`);
    }
    update();
  }

  /* ═════════════════════════ LATENCY HIDING ═════════════════════════ */

  const LH_SASS = `LDG.E.SYS R1, [R0]        // memory load, 400 cycles
IMUL R2, R1, 0xBEEF       // integer multiply, 6 cycles
IADD R4, R2, 0xAFFE       // integer add, 4 cycles
IMUL R6, R4, 0x1337       // integer multiply, 6 cycles`;
  const LH_OPS = [
    { op: 'LDG', lat: 400, dst: 'R1', src: 'R0', what: 'memory load' },
    { op: 'IMUL', lat: 6, dst: 'R2', src: 'R1', what: 'integer multiply' },
    { op: 'IADD', lat: 4, dst: 'R4', src: 'R2', what: 'integer add' },
    { op: 'IMUL', lat: 6, dst: 'R6', src: 'R4', what: 'integer multiply' },
  ];

  GG.entry('latency-hiding', {
    render(body, ctx) {
      const s = ctx.html(body, `
<p><b>Latency hiding</b> is a strategy to mask long-latency operations by <a data-term="littles-law">running many of them concurrently</a>. A single operation still takes just as long. What changes is that the machine always has other useful work to do while it waits, so from the outside the wait is invisible.</p>
${GG.noteHTML('intuition', '<p>A cook with one pot waits for the water to boil. A cook with a dozen pots puts the next one on while the first heats up, and once the kitchen is in rhythm a dish comes out every minute, even though each one still takes twenty minutes to cook. The cooking time (latency) is hidden behind the other pots (concurrency).</p>')}
<p>Performant GPU programs hide latency by interleaving the execution of many <a data-term="thread">threads</a>. This allows programs to maintain high throughput despite long instruction latencies. When one <a data-term="warp-execution-state">warp stalls</a> on a slow memory operation, the GPU immediately switches to execute instructions from another <a data-term="warp-execution-state">eligible warp</a>. The switch costs nothing: every resident <a data-term="warp">warp</a> keeps its own <a data-term="registers">registers</a> in the SM's <a data-term="register-file">register file</a>, so the <a data-term="warp-scheduler">warp scheduler</a> just picks a different warp to issue from on the next cycle. Nothing has to be saved or restored, as it would be in a CPU's context switch.</p>
<h3>Every unit busy at once</h3>
<p>Interleaving keeps all the execution units busy concurrently. While one <a data-term="warp">warp</a> uses the <a data-term="tensor-core">Tensor Cores</a> for matrix multiplication, another might execute arithmetic on the <a data-term="cuda-core">CUDA Cores</a> (say, <a href="https://arxiv.org/abs/2408.11743">quantizing or dequantizing matrix multiplicands</a>, as the MARLIN inference kernels of Frantar and colleagues do), and a third could be fetching data through the <a data-term="load-store-unit">load/store units</a>. Fig.&nbsp;1 runs that three-warp kitchen on a stream of matrix tiles, first with one warp doing everything in turn, then with three warps overlapping.</p>
<div data-slot="f1"></div>
<h3>A concrete sequence</h3>
<p>Concretely, consider the following simple instruction sequence in <a data-term="streaming-assembler">Streaming Assembler</a> (SASS), the GPU's native machine code. Each instruction reads the register the one before it wrote, so none can start until its predecessor is done. Hover or tap a line for what it does.</p>
<div data-slot="code"></div>
<p>Executed sequentially, this would take 400 + 6 + 4 + 6 = <b>416 cycles</b> to complete, and the memory load is 96% of that time. Step through it in Fig.&nbsp;2.</p>
<div data-slot="f2"></div>
<h3>Little's Law: how many threads to hide it</h3>
<p>We can hide this latency by operating concurrently. If we assume we can issue one instruction every cycle, then, by <a data-term="littles-law">Little's Law</a>, if we run <b>416 concurrent threads</b>, we can still finish the sequence once per cycle (on average), hiding the latency of memory from consumers of the data in <code>R6</code>. In Little's terms: concurrency = latency × throughput = 416 cycles × 1 sequence per cycle = 416 sequences in flight, one per thread.</p>
<p>Note that <a data-term="thread">threads</a> are not the unit of instruction issuance, <a data-term="warp">warps</a> are. Each warp contains 32 threads, and so our fragment requires 416 ÷ 32 = <b>13 warps</b>. Fig.&nbsp;3 groups the threads into warps and lets you change the latency and the target rate.</p>
<div data-slot="f3"></div>
<p>When successfully hiding latency, the GPU's scheduling system maintains this many warps in flight, switching between them whenever one stalls, ensuring the execution units never idle while waiting for slow operations to complete. Fig.&nbsp;4 is a small simulator of exactly that: one issue slot, the four-instruction fragment running in a loop in every warp, and a scheduler that issues from whichever warp is ready. It opens zoomed in on 40 cycles where the loads come back and the warps take turns at the slot. Load the glossary's 13 warps and the measured rate comes out at one sequence per cycle.</p>
<div data-slot="f4"></div>
${GG.noteHTML('aside', `<p><b>Two different targets.</b> The glossary's target is one <em>thread's</em> sequence finished per cycle, and 13 warps meet it exactly. But a warp instruction does the work of 32 threads at once, so the same issue slot could do more. With 13 warps it is busy only 52 cycles in every 416 (each warp issues 4 instructions per loop), 12.5% of the time. To fill every issue slot, a new instruction would have to issue every cycle: 416 cycles per loop ÷ 4 instructions per loop = <b>104 warps</b>, far more than the 16 warps one H100 warp scheduler can hold. That 104 is a lower bound from Little's Law, which assumes no warp ever waits for the slot. In Fig.&nbsp;4, once the warps have spread out, 104 of them keep the slot 99% busy: now and then two want it on the same cycle, one waits, and the average loop stretches from 416 to about 420 cycles. From 106 warps on the slot is busy every cycle, and each extra warp only lengthens the loop (to 512 cycles with 128). Real kernels close the gap with <em>instruction-level parallelism</em> (ILP): each thread keeps several independent loads and calculations in flight at once (for example by unrolling a loop), so fewer warps carry the same concurrency. Set "independent sequences per warp" in Fig.&nbsp;4 to 2 and 13 warps do the work of 26; set it to 4 and they do the work of 52, finishing 4 sequences per cycle with the slot half busy. Volkov's thesis, linked below, studies this trade-off in depth.</p>`)}
<p>For a deep dive into latency hiding on pre-<a data-term="tensor-core">Tensor Core</a> GPUs, see <a href="https://www2.eecs.berkeley.edu/Pubs/TechRpts/2016/EECS-2016-143.pdf">Vasily Volkov's PhD thesis</a>. The <a data-term="littles-law">Little's Law</a> entry shows one of its results: memory latency needs barely more warps than arithmetic latency, because memory throughput is so much lower.</p>
<div data-slot="reading"></div>`);

      let codeApi = null;
      guard(() => lhUnits(ctx, s.f1));
      guard(() => {
        codeApi = mkCode(ctx, s.code, {
          lang: 'sass', code: LH_SASS, caption: 'the glossary\'s fragment, verbatim',
          notes: {
            1: '<b>LDG</b> (LoaD Global) reads 32 bits from <a data-term="global-memory">global memory</a> and writes them into register <code>R1</code>. NVIDIA does not document SASS modifiers in detail; <code>.E</code> is generally read as marking a 64-bit ("extended") address, held in the register pair that starts at <code>R0</code>, and <code>.SYS</code> as giving the access system-wide memory scope. The glossary assumes the data misses the caches and comes from <a data-term="gpu-ram">GPU RAM</a>, so the result arrives about <b>400 cycles</b> later; a cache hit would be faster.',
            2: '<b>IMUL</b>: <code>R2 = R1 × 0xBEEF</code> (48,879 in decimal). It needs <code>R1</code>, so it cannot issue until the load has delivered. Result after <b>6 cycles</b>.',
            3: '<b>IADD</b>: <code>R4 = R2 + 0xAFFE</code> (45,054). Waits for <code>R2</code>. Result after <b>4 cycles</b>. (The constants are hex words: BEEF, AFFE, German for "ape", and 1337, "leet".)',
            4: '<b>IMUL</b>: <code>R6 = R4 × 0x1337</code> (4,919). Waits for <code>R4</code>; <code>R6</code> is ready <b>6 cycles</b> later, 416 cycles after the load was issued.',
          },
        });
      });
      guard(() => lhTimeline(ctx, s.f2, codeApi));
      guard(() => lhLittle(ctx, s.f3));
      guard(() => lhSim(ctx, s.f4));
      ctx.reading(s.reading, [
        { href: 'https://www2.eecs.berkeley.edu/Pubs/TechRpts/2016/EECS-2016-143.pdf', label: 'Vasily Volkov, Understanding Latency Hiding on GPUs (PhD thesis, UC Berkeley, 2016)', note: 'latency hiding on pre-Tensor Core GPUs, in depth' },
        { href: 'https://arxiv.org/abs/2408.11743', label: 'Frantar, Castro, Chen, Hoefler and Alistarh, MARLIN: Mixed-Precision Auto-Regressive Parallel Inference on Large Language Models (arXiv:2408.11743)', note: 'the glossary\'s example of CUDA Cores dequantizing matrix multiplicands while Tensor Cores multiply' },
      ]);
    },
  });

  /* Fig: three units, three warps — serial vs overlapped */
  function lhUnits(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Load, dequantize, multiply: three units at once', hint: 'switch between one warp and three', wide: true,
      caption: 'An illustration with made-up durations, in arbitrary time steps: loading a tile through the load/store units takes 4, dequantizing it on the CUDA Cores 2, multiplying it on the Tensor Cores 3. A tile can only be dequantized after it is loaded and multiplied after it is dequantized. With one warp, each instruction waits for the one before, so only one unit works at a time. With three warps, each owns one stage and works on a different tile, so all three units run together and the slowest stage (the load) sets the pace.',
    });
    const D = [{ k: 'LSU', name: 'Load/store units', sub: 'fetch tile', d: 4, col: 'var(--special)', fill: 'rgba(244,114,182,.75)' },
      { k: 'CUDA', name: 'CUDA Cores', sub: 'dequantize', d: 2, col: 'var(--core)', fill: 'rgba(52,211,153,.5)' },
      { k: 'TC', name: 'Tensor Cores', sub: 'multiply', d: 3, col: 'var(--core)', fill: 'var(--core)' }];
    const st = { mode: 'overlap', n: 6 };
    function schedule() {
      const blocks = [];
      if (st.mode === 'serial') {
        let t = 0;
        for (let k = 0; k < st.n; k++) for (let u = 0; u < 3; u++) { blocks.push({ u, k, a: t, b: t + D[u].d }); t += D[u].d; }
        return { blocks, T: t };
      }
      const free = [0, 0, 0], done = [];
      for (let k = 0; k < st.n; k++) {
        let prev = 0;
        for (let u = 0; u < 3; u++) { const a = Math.max(free[u], prev); const b = a + D[u].d; blocks.push({ u, k, a, b }); free[u] = b; prev = b; }
        done.push(prev);
      }
      return { blocks, T: Math.max(...free) };
    }
    let S = schedule();
    const view = rsvg(f.stage, 'Gantt chart of three hardware units processing a stream of tiles, either one after another or overlapped across three warps.', (svg, w) => {
      S = schedule();
      const mob = MOB(w);
      const labW = mob ? 86 : 170, x0 = labW, x1 = w - 6;
      const Tmax = 8 * 9; // serial worst case, fixed scale so the two modes compare
      const X = (t) => x0 + (t / Tmax) * (x1 - x0);
      const laneH = mob ? 34 : 38, top = 8;
      D.forEach((u, i) => {
        const y = top + i * (laneH + 8);
        Tx(svg, 0, y + laneH / 2 - 2, mob ? u.k === 'LSU' ? 'LSUs' : u.name : u.name, { fs: mob ? 11 : 12, fill: 'var(--ink)', weight: 600 });
        Tx(svg, 0, y + laneH / 2 + 12, st.mode === 'overlap' ? (mob ? `w${i} · ${['load', 'dequant', 'multiply'][i]}` : `warp ${i} · ${u.sub}`) : (mob ? ['load', 'dequant', 'multiply'][i] : u.sub), { fs: mob ? 9.5 : 10.5, fill: 'var(--ink-3)' });
        R(svg, x0, y, x1 - x0, laneH, 'fill:rgba(255,255,255,.02);stroke:var(--line)', { rx: 4 });
      });
      S.blocks.forEach((b) => {
        const y = top + b.u * (laneH + 8);
        const xa = X(b.a), xb = X(b.b);
        R(svg, xa + 1, y + 4, xb - xa - 2, laneH - 8, `fill:${D[b.u].fill};stroke:${D[b.u].col};stroke-width:1`, { rx: 3 });
        if (xb - xa > 16) Tx(svg, (xa + xb) / 2, y + laneH / 2 + 4, `T${b.k + 1}`, { fs: mob ? 9.5 : 10.5, anchor: 'middle', fill: 'var(--bg)', weight: 700 });
        else if (xb - xa >= 9.5) Tx(svg, (xa + xb) / 2, y + laneH / 2 + 3.5, String(b.k + 1), { fs: 9, anchor: 'middle', fill: 'var(--bg)', weight: 700 });
      });
      const yA = top + 3 * (laneH + 8) + 4;
      Ln(svg, x0, yA, x1, yA, 'stroke:var(--line-2)');
      for (let t = 0; t <= Tmax; t += 8) { Ln(svg, X(t), yA, X(t), yA + 4, 'stroke:var(--line-2)'); Tx(svg, X(t), yA + 16, String(t), { fs: 9.5, anchor: t === 0 ? 'start' : t === Tmax ? 'end' : 'middle', fill: 'var(--ink-3)' }); }
      const xe = X(S.T);
      Ln(svg, xe, top - 4, xe, yA, 'stroke:var(--ink);stroke-width:1.4;stroke-dasharray:3 3');
      Tx(svg, Math.min(xe + 5, x1 - 4), top + 3, `done at ${S.T}`, { fs: 10.5, fill: 'var(--ink)', weight: 600, anchor: xe + 80 > x1 ? 'end' : 'start' });
      Tx(svg, x1, yA + 30, 'time steps', { fs: 10, anchor: 'end', fill: 'var(--ink-3)' });
      return yA + 34;
    });
    GG.ui.seg(f.controls, { label: 'who does the work', value: st.mode, options: [{ value: 'serial', label: 'one warp, in turn' }, { value: 'overlap', label: 'three warps, overlapped' }], onChange: (v) => { st.mode = v; update(); } });
    GG.ui.slider(f.controls, { label: 'tiles', min: 1, max: 8, step: 1, value: st.n, format: (v) => String(v), onInput: (v) => { st.n = v; update(); } });
    const sT = stat(f, 'total time'), sU = stat(f, 'busy: LSU · CUDA · TC');
    function update() {
      S = schedule();
      view.redraw();
      const busy = D.map((u) => (st.n * u.d) / S.T);
      sT.set(S.T + ' steps'); sU.set(busy.map((b) => pct(b, 0)).join(' · '));
      const serialT = st.n * 9, ovT = 4 * st.n + 2 + 3;
      const tiles = `${st.n} ${plural(st.n, 'tile')} ${st.n === 1 ? 'takes' : 'take'}`;
      f.setWhy(st.mode === 'serial'
        ? `One warp does everything in order: load, then dequantize, then multiply, tile after tile. Each unit waits for the others, so ${tiles} <b>${S.T} steps</b> and the Tensor Cores are busy only ${pct(busy[2], 0)} of the time.`
        : st.n === 1
          ? 'With a single tile there is nothing to overlap: it still takes 4 + 2 + 3 = <b>9 steps</b>, one stage after another. Add tiles to see the three stages run together.'
          : `Three warps each own one stage. While the Tensor Cores multiply tile k, the CUDA Cores dequantize tile k + 1 and the load/store units fetch tile k + 2. ${tiles} <b>${S.T} steps</b> instead of ${serialT}, ${sig(serialT / ovT, 2)}× faster; the load stage is busy ${pct(busy[0], 0)} of the time and sets the pace.`);
    }
    update();
  }

  /* Fig: one thread's 416 cycles, step by step */
  function lhTimeline(ctx, slot, codeApi) {
    const f = mkFig(ctx, slot, {
      title: 'One thread runs the fragment alone', hint: 'step through the instructions', wide: true,
      caption: 'The top bar is the whole sequence to scale: 416 cycles, of which the load takes 400. The lower strip magnifies the last 20 cycles so the three arithmetic instructions are visible. Arrows show which register each instruction waits for. Blue: waiting on memory; green: an arithmetic result being computed. The step buttons also highlight the matching line in the code above.',
    });
    const st = { i: 4 };
    const view = rsvg(f.stage, 'Timeline of one thread executing a load followed by three dependent integer instructions, 416 cycles in total, with a magnified view of the last 20 cycles.', (svg, w) => {
      const mob = MOB(w);
      const x0 = 0, x1 = w - 2;
      const X = (c) => x0 + (c / 416) * (x1 - x0);
      let t = 0;
      const segs = LH_OPS.map((o, k) => { const a = t; t += o.lat; return { o, k, a, b: t }; });
      const y = 30, bh = 30;
      Tx(svg, 0, 14, 'cycle 0', { fs: 10, fill: 'var(--ink-3)' });
      Tx(svg, x1, 14, 'cycle 416', { fs: 10, fill: 'var(--ink-3)', anchor: 'end' });
      const on = (k) => st.i === 4 || st.i === k;
      segs.forEach((g) => {
        const mem = g.k === 0;
        const op = on(g.k) ? 1 : 0.25;
        R(svg, X(g.a), y, Math.max(2, X(g.b) - X(g.a) - (mem ? 1 : 0.5)), bh, `fill:${mem ? 'var(--memory)' : 'var(--core)'};opacity:${op}`, { rx: 2 });
      });
      Tx(svg, X(200), y + bh / 2 + 4, mob ? 'LDG · 400 cycles' : 'LDG R1, [R0] · waiting 400 cycles for memory', { fs: mob ? 10.5 : 11.5, anchor: 'middle', fill: 'var(--bg)', weight: 700 });
      // bracket for the magnified part
      const zA = 396, zB = 416;
      Pa(svg, `M${r2(X(zA))},${r2(y + bh + 3)}V${r2(y + bh + 10)}H${r2(X(zB))}V${r2(y + bh + 3)}`, 'fill:none;stroke:var(--ink-3);stroke-width:1');
      const zy = y + bh + 46, zh = 34;
      const ZX = (c) => x0 + ((c - zA) / (zB - zA)) * (x1 - x0);
      Pa(svg, `M${r2(X(zA))},${r2(y + bh + 10)}L${r2(x0)},${r2(zy - 6)}M${r2(X(zB))},${r2(y + bh + 10)}L${r2(x1)},${r2(zy - 6)}`, 'fill:none;stroke:var(--line-2);stroke-width:1;stroke-dasharray:2 3');
      R(svg, x0, zy, x1 - x0, zh, 'fill:rgba(255,255,255,.02);stroke:var(--line)', { rx: 3 });
      for (let c = zA; c <= zB; c++) {
        Ln(svg, ZX(c), zy + zh, ZX(c), zy + zh + (c % 2 === 0 ? 5 : 3), 'stroke:var(--line-2)');
        if (c % (mob ? 4 : 2) === 0) Tx(svg, ZX(c), zy + zh + 16, String(c), { fs: 9.5, anchor: c === zA ? 'start' : c === zB ? 'end' : 'middle', fill: 'var(--ink-3)' });
      }
      segs.forEach((g) => {
        const a = Math.max(zA, g.a), b = g.b;
        if (b <= zA) return;
        const mem = g.k === 0;
        R(svg, ZX(a) + 1, zy + 4, ZX(b) - ZX(a) - 2, zh - 8, `fill:${mem ? 'var(--memory)' : 'var(--core)'};opacity:${on(g.k) ? 1 : 0.25}`, { rx: 3 });
        const lab = mem ? '… LDG' : `${g.o.op} ${g.o.dst} · ${g.o.lat}`;
        if (ZX(b) - ZX(a) > tw(lab, 10.5) + 6) Tx(svg, (ZX(a) + ZX(b)) / 2, zy + zh / 2 + 4, lab, { fs: mob ? 9.5 : 10.5, anchor: 'middle', fill: 'var(--bg)', weight: 700 });
        else Tx(svg, (ZX(a) + ZX(b)) / 2, zy + zh / 2 + 4, g.o.op, { fs: 9.5, anchor: 'middle', fill: 'var(--bg)', weight: 700 });
      });
      // dependency arrows above the strip: dst of k feeds k+1
      segs.forEach((g) => {
        if (g.k === 3) return;
        const xa = ZX(g.b) - 6, xb = ZX(g.b) + 6, ya = zy - 2;
        Pa(svg, `M${r2(xa)},${r2(ya)}Q${r2(ZX(g.b))},${r2(ya - 14)} ${r2(xb)},${r2(ya)}`, `fill:none;stroke:var(--ink-2);stroke-width:1.2;opacity:${on(g.k) || on(g.k + 1) ? 1 : 0.3}`);
        head(svg, xb, ya, Math.PI * 0.32, 5, 'var(--ink-2)');
        Tx(svg, ZX(g.b), ya - 15, g.o.dst, { fs: 9.5, anchor: 'middle', fill: 'var(--ink-2)', weight: 600 });
      });
      const yE = zy + zh + 28;
      Tx(svg, x1, yE, 'R6 ready → consumers can use it', { fs: 10.5, anchor: 'end', fill: 'var(--core)', weight: 600 });
      return yE + 6;
    });
    const sC = stat(f, 'issued at cycle'), sD = stat(f, 'result at cycle'), sF = stat(f, 'memory share of the time', 'memory');
    sF.set('400 ÷ 416 = 96%');
    const STEPS = [
      'The load is issued at cycle 0. Its data must come from GPU RAM, so <code>R1</code> is not filled until <b>cycle 400</b>. The thread can do nothing else in the meantime, because its next instruction needs <code>R1</code>.',
      'At cycle 400 <code>R1</code> arrives and <code>IMUL R2, R1, 0xBEEF</code> issues. Its result is ready 6 cycles later, at <b>cycle 406</b>.',
      '<code>IADD R4, R2, 0xAFFE</code> waits for <code>R2</code>, issues at 406, and <code>R4</code> is ready at <b>cycle 410</b>.',
      '<code>IMUL R6, R4, 0x1337</code> issues at 410 and <code>R6</code> is ready at <b>cycle 416</b>.',
      'The whole sequence: 400 + 6 + 4 + 6 = <b>416 cycles</b>, for four instructions. A machine that can issue an instruction every cycle has issued only four in 416 cycles: on its own, this thread leaves the issue slot idle 99% of the time.',
    ];
    GG.ui.stepper(f.controls, {
      label: 'instruction', steps: ['LDG', 'IMUL', 'IADD', 'IMUL', 'all'].map((l) => ({ label: l })), start: 4,
      onStep: (i) => {
        st.i = i; view.redraw();
        if (codeApi) { codeApi.clear(); if (i < 4) codeApi.highlight(i + 1, i === 0 ? 'memory' : 'core'); }
        let a = 0; for (let k = 0; k < Math.min(i, 4); k++) a += LH_OPS[k].lat;
        sC.set(i < 4 ? String(a) : '0, 400, 406, 410'); sD.set(i < 4 ? String(a + LH_OPS[i].lat) : '416');
        f.setWhy(STEPS[i]);
      },
    });
    sC.set('0, 400, 406, 410'); sD.set('416'); f.setWhy(STEPS[4]);
  }

  /* Fig: Little's law, threads grouped into warps */
  function lhLittle(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'From 416 cycles to 13 warps', hint: 'change the latency or the target', wide: true,
      caption: 'Each dot is one thread with the fragment in flight; each block of 32 dots is one warp, the unit the scheduler issues to. The arithmetic latencies stay at 6 + 4 + 6 cycles. Warps beyond the 64 an H100 SM can hold are drawn in red: that target cannot be met on one SM with this fragment alone.',
    });
    const st = { L: 400, X: 1 };
    const host = GG.el('div', { class: 'pfb-cv' });
    f.stage.append(host);
    const eq = GG.el('p', { class: 'pfb-codeline', style: 'margin-bottom:14px' });
    f.stage.insertBefore(eq, host);
    const cv = GG.canvas(host, { height: (w) => lhLittleH(w), label: 'Dots representing threads, grouped in blocks of 32 for warps.' });
    function dims(w) {
      const need = (st.L + 16) * st.X, warps = Math.ceil(need / 32 - 1e-9);
      const p = w < 600 ? 4.2 : 6, bw = 8 * p, bh = 4 * p, gx = w < 600 ? 7 : 10, gy = w < 600 ? 7 : 10;
      const per = Math.max(1, Math.floor((w + gx) / (bw + gx)));
      const lines = Math.ceil(warps / per);
      return { need, warps, p, bw, bh, gx, gy, per, lines, h: 8 + lines * (bh + gy) + 4 };
    }
    function lhLittleH(w) { return Math.max(60, dims(w).h); }
    function draw() {
      const g = cv.ctx, w = cv.w; if (!w) return;
      const d = dims(w);
      if (Math.abs(cv.h - d.h) > 1 && d.h > 60) { cv.canvas.style.height = d.h + 'px'; cv.canvas.height = Math.round(d.h * cv.dpr); cv.h = d.h; g.setTransform(cv.dpr, 0, 0, cv.dpr, 0, 0); }
      const col = GG.colors();
      g.clearRect(0, 0, w, cv.h);
      let left = d.need;
      for (let k = 0; k < d.warps; k++) {
        const bx = (k % d.per) * (d.bw + d.gx), by = 4 + Math.floor(k / d.per) * (d.bh + d.gy);
        const over = k >= 64;
        g.strokeStyle = over ? GG.alpha(col.danger, 0.6) : col.line2; g.lineWidth = 1;
        g.strokeRect(bx - 1.5, by - 1.5, d.bw + 2, d.bh + 2);
        for (let j = 0; j < 32; j++) {
          const on = j < left;
          g.fillStyle = on ? (over ? col.danger : col.core) : GG.alpha(col.ink3, 0.35);
          const cx = bx + (j % 8) * d.p + d.p / 2 - 0.5, cy = by + Math.floor(j / 8) * d.p + d.p / 2 - 0.5;
          g.beginPath(); g.arc(cx, cy, d.p * 0.34, 0, 6.2832); g.fill();
        }
        left -= 32;
      }
    }
    GG.ui.slider(f.controls, { label: 'memory latency (LDG)', min: 100, max: 800, step: 4, value: st.L, format: (v) => v + ' cycles', onInput: (v) => { st.L = v; update(); } });
    GG.ui.seg(f.controls, { label: 'target: sequences finished per cycle', value: st.X, options: [0.5, 1, 2, 4].map((v) => ({ value: v, label: String(v) })), onChange: (v) => { st.X = v; update(); } });
    const sL = stat(f, 'sequence latency', 'control'), sT = stat(f, 'threads in flight', 'core'), sW = stat(f, 'warps');
    function update() {
      const tot = st.L + 16, need = tot * st.X, warps = Math.ceil(need / 32 - 1e-9);
      sL.set(tot + ' cycles'); sT.set(sig(need, 6)); sW.set(Number.isInteger(need / 32) ? String(warps) : `${sig(need / 32, 3)} → ${warps}`, warps > 64 ? 'danger' : '');
      eq.innerHTML = `<span class="d">concurrency = latency × throughput = </span><span class="c">${tot} cycles</span><span class="d"> × </span><span class="k">${st.X}/cycle</span><span class="d"> = </span><span class="k">${sig(need, 6)} threads</span><span class="d"> ÷ 32 = </span><span class="v">${sig(need / 32, 4)} warps</span>`;
      const glos = st.L === 400 && st.X === 1;
      f.setWhy(glos
        ? 'The glossary\'s case: the fragment takes <b>416 cycles</b>, and to finish one sequence every cycle 416 of them must be in flight, one per thread. Threads are issued in warps of 32, so that is exactly <b>13 warps</b>.'
        : `${tot} cycles × ${st.X} per cycle = <b>${sig(need, 6)} threads</b> in flight, ${Number.isInteger(need / 32) ? `exactly ${warps} warps` : `${sig(need / 32, 3)} warps, so ${warps} once rounded up to whole warps`}. ${warps > 64 ? 'That is more than the 64 warps an H100 SM can keep resident, so this target is out of reach with this fragment alone.' : `An H100 SM holds up to 64, so this fits on one SM (${pct(warps / 64, 0)} occupancy).`}`);
      draw();
    }
    cv.onResize(() => draw());
    update();
  }

  /* Fig: the scheduler simulator */
  function lhSim(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'One issue slot, many warps', hint: 'choose the resident warps · scrub or play', wide: true,
      caption: 'Simplifying assumptions: one warp scheduler that issues at most one instruction per cycle (the glossary\'s assumption); fixed latencies of 400, 6, 4 and 6 cycles; every warp runs the fragment in a loop, issues in program order, and starts its next load as soon as <code>R6</code> is ready; all warps are ready at cycle 0; when several are eligible the one that has been ready longest is selected. With more than one independent sequence per warp (instruction-level parallelism), the warp issues all its loads, then all its multiplies, and so on, each waiting only for its own sequence. Memory has no bandwidth limit and there are no caches. The model allows any number of warps, though one H100 scheduler holds at most 16. Started together at cycle 0, the warps keep colliding at the slot for the first few thousand cycles before they spread out, so rates are measured over cycles 12,480 to 20,800 (20 loops of 416), counting each issued instruction as a quarter of a 32-thread sequence so that bursts of completions do not skew the rate; both views show part of that window. Top strip: the register file, one band per resident warp; the scheduler only changes which band it reads. Bottom: sequences finished so far against the steady rate Little\'s Law predicts.',
    });
    const C = 20800, MA = 12480, MB = 20800;
    const st = { W: 13, L: 400, k: 1, view: 'zoom', cur: 0 };
    let sim = null;
    function run() {
      const W = st.W, k = st.k, lat = [st.L, 6, 4, 6], n = 4 * k;
      // per warp: next instruction index i (stage = i / k, sequence = i % k), last issue cycle, issue cycles this loop and last loop
      const wq = Array.from({ length: W }, () => ({ i: 0, last: -1, iss: new Int32Array(n).fill(-1e9), prev: new Int32Array(n).fill(-1e9) }));
      const readyOf = (q) => {
        const sg = Math.floor(q.i / k), j = q.i % k;
        const dep = sg > 0 ? q.iss[(sg - 1) * k + j] + lat[sg - 1] : q.prev[3 * k + j] + 6; // the load waits for R6 of its own sequence
        return Math.max(q.last + 1, dep, 0);
      };
      const S = new Uint8Array(W * C); // 0 stalled-mem, 1 stalled-exec, 2 eligible, 3 selected
      const issW = new Int16Array(C).fill(-1), issPc = new Int8Array(C).fill(-1);
      const comp = new Uint16Array(C + 8); // sequences (of 32 threads) completing on each cycle
      let issN = 0;
      const ready = new Int32Array(W);
      for (let t = 0; t < C; t++) {
        let pick = -1;
        for (let w = 0; w < W; w++) { ready[w] = readyOf(wq[w]); if (ready[w] <= t && (pick < 0 || ready[w] < ready[pick])) pick = w; }
        for (let w = 0; w < W; w++) S[w * C + t] = w === pick ? 3 : ready[w] <= t ? 2 : (Math.floor(wq[w].i / k) === 1 ? 0 : 1);
        if (pick >= 0) {
          const q = wq[pick], sg = Math.floor(q.i / k);
          issW[t] = pick; issPc[t] = sg;
          if (t >= MA && t < MB) issN++;
          if (sg === 3) comp[t + 6]++;
          q.iss[q.i] = t; q.last = t; q.i++;
          if (q.i === n) { q.i = 0; const tmp = q.prev; q.prev = q.iss; q.iss = tmp.fill(-1e9); }
        }
      }
      const seqLat = st.L + 16;
      // first steady-state cycle at which arithmetic starts issuing: the zoom window opens just before it
      let z = MA; for (let t = MA; t < MB - 40; t++) if (issPc[t] === 1) { z = Math.max(MA, t - 4); break; }
      sim = { S, issW, issPc, comp, W, thr: (issN * 8) / (MB - MA), util: issN / (MB - MA), pred: Math.min((32 * W * k) / seqLat, 8), seqLat, z };
    }
    legend(f.stage, [['var(--control)', 'stalled on the load'], ['rgba(251,191,36,.45)', 'stalled on arithmetic'], ['var(--memory)', 'eligible, waiting for the slot'], ['var(--special)', 'selected: issues this cycle'], ['rgba(248,113,113,.35)', 'issue slot idle']]);
    const host = GG.el('div', { class: 'pfb-cv' });
    f.stage.append(host);
    const cvH = (w) => (w < 600 ? 392 : 432);
    const cv = GG.canvas(host, { height: cvH, label: 'Gantt chart: one row per warp over time, coloured by warp state, with the register file above, the issue slot along the bottom and a running count of finished sequences.' });
    const off = document.createElement('canvas');
    let geo = null;
    function win() { return st.view === 'all' ? [MA, MA + 1248] : [sim.z, sim.z + 40]; }
    function paintGantt() {
      const w = cv.w, h = cv.h; if (!w || !sim) return;
      const dpr = cv.dpr;
      off.width = Math.round(w * dpr); off.height = Math.round(h * dpr);
      const g = off.getContext('2d');
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      const col = GG.colors();
      const mob = MOB(w);
      const [a, b] = win();
      const labW = mob ? 30 : 40, x0 = labW, x1 = w - 4;
      const rfY = 18, rfH = 12;
      const top = rfY + rfH + 32, issH = 16, axisH = 22, cumH = mob ? 64 : 70;
      const areaH = h - top - issH - axisH - cumH - 22;
      const W = sim.W, rh = Math.min(18, areaH / W);
      const X = (c) => x0 + ((c - a) / (b - a)) * (x1 - x0);
      const ppc = (x1 - x0) / (b - a);
      const colOf = [col.control, GG.alpha(col.control, 0.42), col.memory, col.special];
      g.font = `500 ${mob ? 9 : 10}px "JetBrains Mono", monospace`;
      g.fillStyle = col.ink2; g.textAlign = 'right'; g.fillText(mob ? 'RF' : 'regs', x0 - 5, rfY + 9.5);
      g.textAlign = 'left'; g.fillStyle = col.ink3;
      g.fillText(mob ? 'one band per warp; no save/restore' : 'register file: one band per resident warp; switching warps saves and restores nothing', x0, rfY + rfH + 13);
      for (let i = 0; i < W; i++) {
        const y = top + i * rh, hh = Math.max(1, rh - (rh > 5 ? 1.5 : rh > 3 ? 0.6 : 0));
        let c = a; const base = i * C;
        while (c < b) {
          const s0 = sim.S[base + c];
          let e = c + 1;
          while (e < b && sim.S[base + e] === s0 && s0 !== 3) e++;
          g.fillStyle = colOf[s0];
          const xa = X(c), xb = X(e);
          g.fillRect(xa, y, Math.max(s0 === 3 ? Math.max(1, ppc - (ppc > 4 ? 1 : 0)) : 0, xb - xa - (ppc > 4 ? 1 : 0)), hh);
          if (s0 === 0 && rh >= 12 && xb - xa > 130) { g.fillStyle = col.bg; g.font = `600 ${mob ? 9.5 : 10}px "JetBrains Mono", monospace`; g.textAlign = 'left'; g.fillText('LDG · stalled', xa + 6, y + hh / 2 + 3.5); }
          if (s0 === 3 && ppc >= 18 && rh >= 11) { g.fillStyle = col.bg; g.font = `700 ${Math.min(9, rh - 3)}px "JetBrains Mono", monospace`; g.textAlign = 'center'; const op = ['LD', 'MUL', 'ADD', 'MUL'][sim.issPc[c]]; g.fillText(op, xa + ppc / 2, y + hh / 2 + 3.5); }
          c = e;
        }
      }
      // row labels
      g.fillStyle = col.ink3; g.font = `500 ${mob ? 9 : 10}px "JetBrains Mono", monospace`; g.textAlign = 'right';
      const every = rh >= 11 ? 1 : Math.ceil(11 / rh) <= 2 ? 2 : Math.ceil(12 / rh / 4) * 4;
      for (let i = 0; i < W; i += every) g.fillText((rh >= 11 && !mob ? 'w' : '') + i, x0 - 5, top + i * rh + Math.min(rh, 12) / 2 + 3.5);
      g.textAlign = 'left'; g.fillStyle = col.ink2; g.fillText('warps', 0, top - 5);
      // issue slot row
      const iy = top + W * rh + 8;
      for (let c = a; c < b; c++) {
        const wi = sim.issW[c];
        g.fillStyle = wi >= 0 ? col.special : GG.alpha(col.danger, 0.35);
        g.fillRect(X(c), iy, Math.max(ppc - (ppc > 4 ? 1 : 0), 0.6), issH);
        if (wi >= 0 && ppc >= 22) { g.fillStyle = col.bg; g.font = '700 9px "JetBrains Mono", monospace'; g.textAlign = 'center'; g.fillText('w' + wi, X(c) + ppc / 2, iy + 11); }
      }
      g.fillStyle = col.ink2; g.font = `500 ${mob ? 9 : 10}px "JetBrains Mono", monospace`; g.textAlign = 'right';
      g.fillText(mob ? 'slot' : 'issue', x0 - 5, iy + 11);
      // axis
      const ay = iy + issH + 14;
      g.fillStyle = col.ink3;
      const step = st.view === 'all' ? (mob ? 416 : 208) : (mob ? 10 : 5);
      for (let c = Math.ceil(a / step) * step; c <= b; c += step) { g.fillRect(X(c), iy + issH + 2, 1, 4); g.textAlign = c === a ? 'left' : c === b ? 'right' : 'center'; g.fillText(fI(c), X(c), ay); }
      // cumulative sequences finished vs Little's steady rate
      const cy0 = ay + 14, cy1 = cy0 + cumH - 14;
      let tot = 0; const cum = new Float64Array(b - a + 1);
      for (let c = a; c < b; c++) { tot += sim.comp[c] * 32; cum[c - a + 1] = tot; }
      const ideal = sim.pred * (b - a);
      const vMax = Math.max(1, tot, ideal);
      const Yc = (v) => cy1 - (v / vMax) * (cy1 - cy0);
      g.strokeStyle = col.line; g.lineWidth = 1; g.strokeRect(x0 + 0.5, cy0 + 0.5, x1 - x0 - 1, cy1 - cy0);
      g.setLineDash([4, 3]); g.strokeStyle = col.ink3; g.beginPath(); g.moveTo(x0, Yc(0)); g.lineTo(x1, Yc(ideal)); g.stroke(); g.setLineDash([]);
      g.strokeStyle = col.core; g.lineWidth = 1.8; g.beginPath(); g.moveTo(x0, Yc(0));
      for (let c = a; c < b; c++) { g.lineTo(X(c + 1), Yc(cum[c - a])); g.lineTo(X(c + 1), Yc(cum[c - a + 1])); }
      g.stroke();
      g.font = `500 ${mob ? 9 : 10}px "JetBrains Mono", monospace`;
      g.fillStyle = col.core; g.textAlign = 'left';
      g.fillText(st.view === 'zoom' ? (mob ? `finished here: ${fI(tot)} (a burst)` : `finished in these 40 cycles: ${fI(tot)}, a burst; Little's rate is an average over the whole loop`) : `finished: ${fI(tot)}`, x0 + 5, cy0 + 11);
      g.fillStyle = col.ink3; g.textAlign = 'right'; g.fillText(`Little: ${sig(sim.pred, 3)} per cycle`, x1 - 5, cy1 - 5);
      g.save(); g.translate(x0 - 8, (cy0 + cy1) / 2); g.rotate(-Math.PI / 2); g.textAlign = 'center'; g.fillStyle = col.ink2; g.fillText('seqs', 0, 0); g.restore();
      geo = { x0, x1, a, b, X, top, iy, issH, rh, rfY, rfH, W };
    }
    function draw() {
      const g = cv.ctx, w = cv.w, h = cv.h; if (!w || !geo) return;
      g.clearRect(0, 0, w, h);
      g.drawImage(off, 0, 0, w, h);
      const col = GG.colors();
      const c = clamp(Math.round(st.cur), geo.a, geo.b - 1);
      // register file bands: the selected warp's band lights up in place
      const sel = sim.issW[c], bw = (geo.x1 - geo.x0) / geo.W;
      for (let i = 0; i < geo.W; i++) {
        g.fillStyle = i === sel ? col.special : GG.alpha(col.memory, i % 2 ? 0.28 : 0.42);
        g.fillRect(geo.x0 + i * bw, geo.rfY, Math.max(0.6, bw - (bw > 4 ? 1 : 0)), geo.rfH);
      }
      const x = geo.X(c + 0.5);
      g.strokeStyle = col.accent; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(x, geo.top - 4); g.lineTo(x, geo.iy + geo.issH + 3); g.stroke();
      g.fillStyle = col.accent; g.font = '600 10px "JetBrains Mono", monospace';
      g.textAlign = x > w - 90 ? 'right' : 'left';
      g.fillText('cycle ' + fI(c), x + (x > w - 90 ? -5 : 5), 11);
    }
    function cursorInfo() {
      const c = clamp(Math.round(st.cur), 0, C - 1);
      let sm = 0, se = 0, el = 0, sel = -1;
      for (let i = 0; i < sim.W; i++) { const v = sim.S[i * C + c]; if (v === 0) sm++; else if (v === 1) se++; else if (v === 2) el++; else sel = i; }
      return { c, sm, se, el, sel, op: sel >= 0 ? LH_OPS[sim.issPc[c]].op : null };
    }
    const slW = GG.ui.slider(f.controls, { label: 'resident warps', min: 1, max: 128, step: 1, value: st.W, format: (v) => `${v} (${fI(v * 32)} threads)`, onInput: (v) => { st.W = v; pr.mark(-1); rebuild(); } });
    const segK = GG.ui.seg(f.controls, { label: 'independent sequences per warp (ILP)', value: st.k, options: [1, 2, 4].map((v) => ({ value: v, label: String(v) })), onChange: (v) => { st.k = v; pr.mark(-1); rebuild(); } });
    const pr = presetRow(f.controls, 'try', [
      { label: '1 warp', W: 1 }, { label: '13 warps (glossary)', W: 13 }, { label: '16 (one H100 scheduler\'s max)', W: 16 },
      { label: '104 (Little\'s bound for a full slot)', W: 104 }, { label: '128', W: 128 },
    ], (it, k) => { st.W = it.W; st.k = 1; slW.set(it.W); segK.set(1); pr.mark(k); rebuild(); });
    pr.mark(1);
    function setWin() {
      const [a, b] = win();
      st.cur = clamp(st.cur, a, b - 1);
      slCur.input.min = a; slCur.input.max = b - 1; slCur.set(Math.floor(st.cur));
    }
    GG.ui.seg(f.controls, { label: 'view', value: st.view, options: [{ value: 'zoom', label: 'zoom: 40 cycles' }, { value: 'all', label: 'cycles 12,480–13,728' }], onChange: (v) => { st.view = v; st.cur = win()[0] + (v === 'zoom' ? 6 : 200); setWin(); paintGantt(); draw(); info(); } });
    const slCur = GG.ui.slider(f.controls, { label: 'cursor', min: 0, max: C - 1, step: 1, value: 0, format: (v) => 'cycle ' + fI(v), onInput: (v) => { st.cur = v; anim.stop(); play.sync(); draw(); info(); } });
    const row = GG.el('div', { class: 'pfb-row' });
    f.controls.append(row);
    const anim = GG.anim(host, (t, dt) => {
      const [a, b] = win();
      st.cur += dt * (st.view === 'all' ? 160 : 4);
      if (st.cur >= b) st.cur = a;
      slCur.set(Math.floor(st.cur)); draw(); info();
    }, { autostart: false });
    const play = GG.ui.playButton(row, anim);
    const sThr = stat(f, 'sequences / cycle', 'core'), sPred = stat(f, 'Little: 32·W·ILP ÷ 416'), sUtil = stat(f, 'issue slot busy', 'special'), sCur = stat(f, 'at the cursor');
    function info() {
      const q = cursorInfo();
      sCur.set(q.sel >= 0 ? `w${q.sel} issues ${q.op}` : 'slot idle', q.sel >= 0 ? 'special' : 'danger');
      const W = st.W, k = st.k, conc = 32 * W * k, raw = conc / sim.seqLat;
      const wNeed = Math.ceil(sim.seqLat / (32 * k)), wFull = (sim.seqLat * 8) / (32 * k);
      const ilp = k > 1 ? ` Each warp keeps <b>${k} independent sequences</b> in flight, so ${W} ${plural(W, 'warp')} carry the concurrency of ${W * k}.` : '';
      const base = `<b>${W} ${plural(W, 'warp')}</b> (${fI(W * 32)} threads) finish <b>${fx(sim.thr, 2)} sequences per cycle</b>.${ilp} Little's Law predicts ${fI(conc)} ÷ ${sim.seqLat} = ${sig(raw, 3)}${raw > 8 ? ', capped at 8 because the slot can issue only one warp instruction (a quarter of a 32-thread sequence) per cycle' : ''}. `;
      let tail;
      const loopT = sim.thr > 0 ? (conc / sim.thr) : 0; // Little's Law with the measured rate: average time per loop
      const slip = sim.thr < 0.97 * sim.pred ? ` The measured rate falls short of Little's: here a loop takes <b>${fI(loopT)} cycles</b> on average (${fI(conc)} ÷ ${fx(sim.thr, 2)}) instead of ${sim.seqLat}, because ${k > 1 ? `each warp issues its ${4 * k} instructions in order, and ` : ''}whenever a warp loses the slot to another, all its later instructions slip.` : '';
      if (conc < sim.seqLat) tail = `Too few: the latency is not hidden, and every warp spends most of its time stalled on its load. ${k === 1 ? `The glossary's ${wNeed} warps` : `${wNeed} warps at this ILP`} would reach one per cycle.${slip}`;
      else if (W === 13 && k === 1) tail = 'This is the glossary\'s case: <b>13 warps</b> keep 416 threads in flight, so one sequence completes per cycle on average, even though each one still takes 416 cycles. The green staircase below climbs in bursts but follows the dashed line.';
      else if (sim.util >= 0.97) tail = 'The issue slot is now busy almost every cycle: more warps would only queue up as eligible-but-waiting (blue).';
      else if (W * k * 4 < sim.seqLat) tail = `More than enough to finish one per cycle. The issue slot is still idle ${pct(1 - sim.util, 0)} of the time: ${W} ${plural(W, 'warp')} × ${4 * k} instructions per loop is only ${fI(W * 4 * k)} instructions per ${sim.seqLat} cycles. Filling it would take at least ${sig(wFull, 3)} warps${k > 1 ? ' at this ILP' : ''}.${slip}`;
      else tail = `Little's Law says ${sig(wFull, 3)} warps${k > 1 ? ' at this ILP' : ''} would just fill the slot if no warp ever had to wait. But whenever two warps want the slot on the same cycle one of them waits, its loop takes longer than ${sim.seqLat} cycles, and throughput falls short: here a loop takes <b>${fI(loopT)} cycles</b> on average (Little's Law with the measured rate, ${fI(conc)} ÷ ${fx(sim.thr, 2)}), and the slot is busy ${pct(sim.util, 0)} of the time. More warps absorb the queueing.`;
      f.setWhy(base + tail + ` At cycle ${fI(q.c)}: ${q.sm} stalled on the load, ${q.se} on arithmetic, ${q.el} eligible and waiting${q.sel >= 0 ? `, and warp ${q.sel} is selected (${q.op}): the scheduler reads its operands from warp ${q.sel}'s band of the register file` : ', and nothing to issue'}.`);
    }
    function rebuild() {
      run();
      sThr.set(fx(sim.thr, 2)); sPred.set(fx(sim.pred, 2)); sUtil.set(pct(sim.util, 1));
      if (st.view === 'zoom') st.cur = sim.z + 6;
      setWin();
      paintGantt(); draw(); info();
    }
    cv.onResize(() => { paintGantt(); draw(); });
    rebuild();
  }

  /* ═════════════════════════ WARP EXECUTION STATE ═════════════════════════ */

  const GTC25 = 'https://www.nvidia.com/en-us/on-demand/session/gtc25-s72685/';
  const CC_DOCS = 'https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html?highlight=compute%2520capability#compute-capabilities';

  GG.entry('warp-execution-state', {
    render(body, ctx) {
      const s = ctx.html(body, `
<p>The state of the <a data-term="warp">warps</a> running a <a data-term="kernel">kernel</a> is described with a number of <em>non-exclusive</em> adjectives: <b class="c-core">active</b>, <b class="c-control">stalled</b>, <b class="c-memory">eligible</b> and <b class="c-special">selected</b>. Non-exclusive means one warp can be several at once: every eligible warp is also active, and every selected warp is also eligible and active. Stalled and eligible are the two ways of being active, and on any cycle an active warp is exactly one of them.</p>
<p>Fig.&nbsp;1 is the glossary's diagram, with warp execution states indicated by colour. It is inspired by the <a href="${GTC25}"><i>CUDA Techniques to Maximize Compute and Instruction Throughput</i></a> talk at GTC 2025. Each row is a <em>warp slot</em>, a place where one resident warp can sit; each column is one clock cycle of one <a data-term="warp-scheduler">warp scheduler</a>; the open trays along the bottom are its <em>issue slots</em>, one per cycle, each receiving at most one instruction. The text in a box is the warp's next instruction (<code>MMA</code> matrix multiply-accumulate, <code>LDS</code> load shared, <code>EX2</code> exponential base 2, <code>ADD</code>, <code>RET</code> return, <code>LDG</code> load global). Hover, tap or arrow-key a box to see which adjectives apply to it and why, or press Play to sweep through the cycles.</p>
<div data-slot="f1"></div>
<h3>Active</h3>
<p>A warp is considered <b>active</b> from the time its <a data-term="thread">threads</a> begin executing to the time when all threads in the warp have exited from the kernel. Active warps form the pool from which <a data-term="warp-scheduler">warp schedulers</a> select candidates for instruction issue each cycle (that is, to be put in one of the issue slots).</p>
<p>The maximum number of active warps per <a data-term="streaming-multiprocessor">Streaming Multiprocessor (SM)</a> varies by <a data-term="streaming-multiprocessor-architecture">architecture</a> and is listed in <a href="${CC_DOCS}">NVIDIA's documentation</a> for each <a data-term="compute-capability">Compute Capability</a>. For instance, on an H100 SXM GPU with Compute Capability 9.0, there can be up to 64 active warps per SM, which is 64 × 32 = 2,048 threads.</p>
<div data-slot="nums"></div>
<p>Note that active warps are not necessarily executing instructions. There are active warps in all but one slot+cycle in the diagram above (slot 4 on cycle n + 2, where one warp has exited and the next has not yet arrived): 15 of 16, a high <a data-term="occupancy">occupancy</a>.</p>
<h3>Eligible</h3>
<p>An <b>eligible</b> warp is an active warp that is ready to issue its next instruction. For a warp to be eligible, the following must be true:</p>
<ul>
<li>the next instruction has been fetched,</li>
<li>the required execution unit is available,</li>
<li>all instruction dependencies have been resolved, and</li>
<li>no synchronization barriers block execution.</li>
</ul>
<p>Fig.&nbsp;2 puts four warps in front of one scheduler with exactly these four conditions as switches. It opens on cycle n of Fig.&nbsp;1; flip any condition and watch the warp's adjectives, and the scheduler's choice, change. The glossary's diagram does not say why its warps are stalled; the causes given here (a busy Tensor Core for slot 1, a barrier for slot 2) are illustrative.</p>
<div data-slot="f2"></div>
<p>Eligible warps represent the immediate candidates for instruction issue by the <a data-term="warp-scheduler">warp scheduler</a>. Eligible warps appear on all cycles but cycle n + 2 in the diagram above. Having no eligible warps on many cycles can be bad for performance, especially if you are primarily using lower latency arithmetic units like <a data-term="cuda-core">CUDA Cores</a>: their instructions finish in a few cycles, so a cycle with nothing to issue is a large fraction of the work lost, and there are no long-running instructions in flight to make up for it.</p>
<h3>Stalled</h3>
<p>A <b>stalled</b> warp is an active warp that cannot issue its next instruction due to unresolved dependencies or resource conflicts. Warps become stalled for various reasons, including:</p>
<ul>
<li><b>execution dependencies</b>, that is, they must wait for results from previous arithmetic instructions,</li>
<li><b>memory dependencies</b>, that is, they must wait for results from previous memory operations,</li>
<li><b>pipeline conflicts</b>, that is, the execution resources are currently occupied.</li>
</ul>
<p>When warps are stalled on variable-latency instructions that don't leave the <a data-term="streaming-multiprocessor">SM</a>, they are said to be stalled on the "short scoreboard". When warps are stalled on variable-latency instructions which do, they are said to be stalled on the "long scoreboard". Both types of stalls are known as <a data-term="scoreboard-stall">scoreboard stalls</a>; a scoreboard is the hardware that tracks which registers are still waiting for an in-flight instruction to write them. Fig.&nbsp;3 sorts common causes by where the warp's missing input is coming from.</p>
<div data-slot="f3"></div>
<p>Stalled warps appear in multiple slots in each cycle in the diagram above. Stalled warps are not inherently bad: a large collection of concurrently stalled warps might be necessary to <a data-term="latency-hiding">hide latency</a> from long-running instructions, like memory loads or <a data-term="tensor-core">Tensor Core</a> instructions like <code>HMMA</code>, which <a href="https://arxiv.org/abs/2206.02874">can run for dozens of cycles</a>. What matters is that some warp is eligible on every cycle. Fig.&nbsp;4 simulates warps whose every fourth instruction takes 24 cycles: once the warps get going, several are stalled on every cycle, and yet the scheduler issues on every one. (All warps start out ready, which is why the left of the grid is blue.)</p>
<div data-slot="f4"></div>
<h3>Selected</h3>
<p>A <b>selected</b> warp is an eligible warp chosen by the <a data-term="warp-scheduler">warp scheduler</a> to receive an instruction during the current cycle. Each cycle, warp schedulers look at their pool of eligible warps, select one if there are any, and issue it an instruction. There is a selected warp on each cycle with an eligible warp. The fraction of <a data-term="active-cycle">active cycles</a> on which a warp is selected and an instruction is issued is the <a data-term="issue-efficiency">issue efficiency</a>: in Fig.&nbsp;1, instructions issue on 3 of the 4 cycles, so 75%.</p>
${GG.noteHTML('beyond', `<p><b>The same words in a profiler.</b> NVIDIA's Nsight Compute reports, for each warp scheduler, the average number of active, eligible and issued warps per cycle, and breaks stalled time into named reasons that refine the glossary's three: for example <i>Long Scoreboard</i> (a dependency on a memory operation that may leave the SM, such as a global load) and <i>Short Scoreboard</i> (a dependency on an operation through the SM's memory input/output path: shared memory, and also certain special-function instructions such as <code>MUFU</code>), both as in Fig.&nbsp;3, <i>Wait</i> (a fixed-latency execution dependency), <i>Math Pipe Throttle</i> (a pipeline conflict), <i>Barrier</i>, and <i>No Instruction</i> (the next instruction was not fetched). It also counts <i>Selected</i> and <i>Not Selected</i>: eligible warps that did or did not get the issue slot. See the <a href="https://docs.nvidia.com/nsight-compute/ProfilingGuide/index.html">Nsight Compute Profiling Guide</a>.</p>`)}
<div data-slot="reading"></div>`);

      guard(() => {
        const f = mkFig(ctx, s.f1, {
          title: 'Warp slots × cycles: the four adjectives', hint: 'hover a box · play the cycles', wide: true,
          caption: 'The glossary\'s diagram, redrawn. Amber: stalled. Blue: eligible. Pink inside blue: selected (eligible and chosen this cycle). The thin green ring marks every box that holds an active warp; the dashed box is a slot with no active warp. Diagram inspired by the <a href="' + GTC25 + '"><i>CUDA Techniques to Maximize Compute and Instruction Throughput</i></a> talk at GTC 2025.',
        });
        GG.components.cycles(f, { mode: 'states', animate: true });
      });
      ctx.numbers(s.nums, [
        { value: '64', label: 'active warps per SM, max (H100, CC 9.0)', tone: 'core' },
        { value: '2,048', label: 'threads (64 × 32)', tone: 'core' },
        { value: '4 × 16', label: 'warp schedulers × warps each', tone: 'control' },
        { value: '1', label: 'instruction per scheduler per cycle', tone: 'special' },
      ]);
      guard(() => wesPool(ctx, s.f2));
      guard(() => wesStalls(ctx, s.f3));
      guard(() => {
        const f = mkFig(ctx, s.f4, {
          title: 'Many stalled warps, few wasted cycles', hint: 'drag the sliders · hover a box', wide: true,
          caption: 'A simulated warp scheduler (the cycles component\'s model) with 16 warp slots, as many as one H100 warp scheduler holds. Every fourth instruction of each warp is a long one, an <code>HMMA</code>, whose result takes the set latency; the others (<code>FFMA</code>) let the warp issue again on the next cycle. Pink marks the selected warp and its issue slot each cycle; an outlined pink box is an <code>HMMA</code> issuing, and where the boxes are big enough they carry the instruction\'s first letter (F or H). Hover or tap a box to see its instruction and, for a stalled warp, which <code>HMMA</code> it is waiting on. The scheduler keeps issuing from the warp it chose last while it stays eligible, otherwise picks the warp that has been ready longest. Latencies are illustrative.',
        });
        GG.components.cycles(f, {
          simulate: { warps: 8, slots: 16, latency: 24, issueEvery: 4, cycles: 32, ops: { long: 'HMMA', short: 'FFMA' } }, simControls: true,
          why: (info) => {
            if (!info || info.cell || info.step != null) return null;
            const m = info.metrics; if (!m || !m.activeCells) return null;
            const head = `<b>${m.stalledCells}</b> of the ${m.activeCells} active warp-cycles (${pct(m.stalledCells / m.activeCells, 0)}) are stalled, and an instruction issues on <b>${m.issuedCycles} of ${m.activeCycles}</b> active cycles: an issue efficiency of <b>${pct(m.issueEfficiency, 0)}</b>.`;
            if (m.issueEfficiency >= 0.9) return head + ' The stalled warps are the ones whose long instructions are in flight; while they wait, the others keep the issue slot busy.';
            const idle = m.activeCycles - m.issuedCycles;
            const meta = info.scenario && info.scenario.meta;
            const need = meta && meta.warpsNeeded ? ` In this model about ${meta.warpsNeeded} warps keep the slot busy.` : '';
            return head + ` Too few warps: on <b>${idle}</b> ${plural(idle, 'cycle')} every active warp is stalled and nothing issues (the red issue slots). Add warps or shorten the latency.${need}`;
          },
        });
      });
      ctx.reading(s.reading, [
        { href: GTC25, label: 'NVIDIA GTC 2025: CUDA Techniques to Maximize Compute and Instruction Throughput', note: 'the inspiration for the diagram' },
        { href: CC_DOCS, label: 'CUDA C++ Programming Guide: Compute Capabilities', note: 'maximum resident warps per SM, per architecture' },
        { href: 'https://arxiv.org/abs/2206.02874', label: 'Sun, Li, Geng, Stuijk and Corporaal, Dissecting Tensor Cores via Microbenchmarks: Latency, Throughput and Numeric Behaviors (arXiv:2206.02874)', note: 'measured Tensor Core instruction latencies: HMMA runs for dozens of cycles' },
        { href: 'https://docs.nvidia.com/nsight-compute/ProfilingGuide/index.html', label: 'Nsight Compute Profiling Guide', note: 'warp states and stall reasons as the profiler reports them (beyond the glossary)' },
      ]);
    },
  });

  /* Fig: the eligibility checklist, four warps in front of one scheduler */
  function wesPool(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Four conditions for eligibility', hint: 'flip a condition', wide: true,
      caption: 'One warp scheduler and the four warps in its slots. A warp is eligible only when all four conditions hold; if any fails it is stalled, and the first failing condition names the reason. Among the eligible warps the scheduler selects one (here the lowest-numbered; real schedulers use their own policy) and puts its instruction in the issue slot. "Exited" removes the warp: its slot is then unused and the warp is no longer active.',
    });
    const CONDS = [
      { k: 'fetch', label: 'next instruction fetched', why: 'its next instruction has not been fetched yet' },
      { k: 'unit', label: 'execution unit available', why: 'pipeline conflict: the unit it needs is busy' },
      { k: 'deps', label: 'dependencies resolved', why: null },
      { k: 'bar', label: 'no barrier blocking', why: 'a synchronization barrier: it waits for the rest of its block' },
    ];
    const INIT = [
      { op: 'MMA', dep: 'execution', fetch: 1, unit: 0, deps: 1, bar: 1, exit: 0 },
      { op: 'LDS', dep: 'memory', fetch: 1, unit: 1, deps: 1, bar: 0, exit: 0 },
      { op: 'EX2', dep: 'execution', fetch: 1, unit: 1, deps: 1, bar: 1, exit: 0 },
      { op: 'RET', dep: 'execution', fetch: 1, unit: 1, deps: 1, bar: 1, exit: 0 },
    ];
    const N2 = [
      { op: 'MMA', dep: 'execution', fetch: 1, unit: 0, deps: 1, bar: 1, exit: 0 },
      { op: 'LDS', dep: 'memory', fetch: 1, unit: 1, deps: 1, bar: 0, exit: 0 },
      { op: 'ADD', dep: 'execution', fetch: 1, unit: 1, deps: 0, bar: 1, exit: 0 },
      { op: 'RET', dep: 'execution', fetch: 1, unit: 1, deps: 1, bar: 1, exit: 1 },
    ];
    const WS = INIT.map((o) => Object.assign({}, o));
    const pool = GG.el('div', { class: 'pfb-pool' });
    f.stage.append(pool);
    const issue = GG.el('div', { class: 'pfb-issue' });
    const tray = GG.el('span', { class: 'pfb-tray' });
    issue.append(GG.el('span', { text: 'issue slot this cycle:' }), tray);
    f.stage.append(issue);
    const cards = WS.map((w, i) => {
      const c = GG.el('div', { class: 'pfb-wc' });
      const h = GG.el('div', { class: 'pfb-wc-h' });
      const name = GG.el('span');
      h.append(GG.el('b', { text: 'Slot ' + (i + 1) }), name);
      const conds = GG.el('div', { class: 'pfb-conds' });
      const btns = CONDS.map((cd) => {
        const b = GG.el('button', { type: 'button', class: 'pfb-cond' }, GG.el('i'), cd.label);
        b.addEventListener('click', () => { w[cd.k] = w[cd.k] ? 0 : 1; pr.mark(-1); update(); });
        conds.append(b);
        return b;
      });
      const ex = GG.el('button', { type: 'button', class: 'pfb-cond pfb-exit' }, GG.el('i'), 'warp has exited');
      ex.addEventListener('click', () => { w.exit = w.exit ? 0 : 1; pr.mark(-1); update(); });
      conds.append(ex);
      const adj = GG.el('div', { class: 'pfb-adj' });
      adj.innerHTML = ['active', 'stalled', 'eligible', 'selected'].map((a) => `<b data-a="${a}">${a}</b>`).join('');
      const why = GG.el('div', { class: 'pfb-why-s' });
      c.append(h, conds, adj, why);
      pool.append(c);
      return { c, name, btns, ex, adj, why };
    });
    const pr = presetRow(f.controls, 'start from', [
      { label: 'cycle n of Fig. 1', set: INIT }, { label: 'cycle n + 2 (nothing eligible)', set: N2 },
      { label: 'every condition true', set: INIT.map((o) => Object.assign({}, o, { fetch: 1, unit: 1, deps: 1, bar: 1, exit: 0 })) },
    ], (it, k) => { it.set.forEach((o, i) => Object.assign(WS[i], o)); pr.mark(k); update(); });
    pr.mark(0);
    const sA = stat(f, 'active', 'core'), sE = stat(f, 'eligible', 'memory'), sS = stat(f, 'selected', 'special'), sI = stat(f, 'issued');
    function reason(w) {
      for (const cd of CONDS) if (!w[cd.k]) return cd.k === 'deps' ? (w.dep === 'memory' ? 'memory dependency: it waits for a previous memory operation' : 'execution dependency: it waits for a previous arithmetic result') : cd.why;
      return '';
    }
    function update() {
      const st = WS.map((w) => (w.exit ? 'unused' : CONDS.every((cd) => w[cd.k]) ? 'eligible' : 'stalled'));
      const sel = st.indexOf('eligible');
      if (sel >= 0) st[sel] = 'selected';
      cards.forEach((cd, i) => {
        const w = WS[i], s0 = st[i];
        cd.c.setAttribute('data-st', s0);
        cd.name.innerHTML = w.exit ? 'no warp' : `next: <code>${w.op}</code>`;
        cd.btns.forEach((b, j) => { b.setAttribute('aria-pressed', String(!!w[CONDS[j].k])); b.disabled = !!w.exit; b.querySelector('i').textContent = w[CONDS[j].k] ? '✓' : '×'; });
        cd.ex.setAttribute('aria-pressed', String(!w.exit)); cd.ex.querySelector('i').textContent = w.exit ? '×' : '✓';
        cd.ex.lastChild.textContent = w.exit ? 'warp has exited (slot unused)' : 'warp still running';
        const on = { active: s0 !== 'unused', stalled: s0 === 'stalled', eligible: s0 === 'eligible' || s0 === 'selected', selected: s0 === 'selected' };
        cd.adj.querySelectorAll('b').forEach((b) => b.classList.toggle('on', !!on[b.getAttribute('data-a')]));
        cd.why.textContent = s0 === 'stalled' ? 'stalled: ' + reason(w) : s0 === 'selected' ? '' : s0 === 'eligible' ? '' : '';
        cd.why.style.color = s0 === 'selected' ? 'var(--special)' : s0 === 'eligible' ? 'var(--memory)' : '';
        if (s0 === 'selected') cd.why.textContent = 'selected: its instruction issues now';
        if (s0 === 'eligible') cd.why.textContent = 'eligible, but another warp was chosen';
        if (s0 === 'unused') cd.why.textContent = '';
      });
      const nA = st.filter((x) => x !== 'unused').length, nE = st.filter((x) => x === 'eligible' || x === 'selected').length;
      sA.set(`${nA} of 4`); sE.set(String(nE)); sS.set(sel >= 0 ? 'slot ' + (sel + 1) : 'none');
      sI.set(sel >= 0 ? WS[sel].op : 'nothing', sel >= 0 ? 'special' : 'danger');
      tray.textContent = sel >= 0 ? WS[sel].op : 'empty';
      tray.classList.toggle('idle', sel < 0);
      const stalled = st.filter((x) => x === 'stalled').length;
      f.setWhy(sel >= 0
        ? `${nA} active ${plural(nA, 'warp')}: ${stalled} stalled and ${nE} eligible. The scheduler selects the warp in <b>slot ${sel + 1}</b> and issues its <code>${WS[sel].op}</code>${nE > 1 ? `; the other ${nE - 1} eligible ${plural(nE - 1, 'warp waits', 'warps wait')} for a later cycle` : ''}. Every selected warp is also eligible and active: the adjectives stack.`
        : nA === 0 ? 'No active warps at all: this would not even be an active cycle.'
          : `${nA} active ${plural(nA, 'warp')}, all stalled: <b>no warp is eligible</b>, so nothing is selected and the issue slot stays empty, like cycle n + 2 in Fig. 1. That cycle still counts as active, and it lowers the issue efficiency.`);
    }
    update();
  }

  /* Fig: where is the missing input coming from? stall reasons by source */
  function wesStalls(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Why is this warp stalled?', hint: 'pick what the warp is waiting for', wide: true,
      caption: 'A sketch of one SM and the memory outside it, not to scale. The dot runs from the warp to the unit that will deliver what it needs and back. Fixed-latency arithmetic is tracked by the compiler, which knows exactly how many cycles to wait; variable-latency instructions are tracked by scoreboards, short for those that stay inside the SM, long for those that may leave it. The classification of SFU instructions as short-scoreboard follows the glossary\'s Scoreboard Stall entry.',
    });
    const SRC = [
      { k: 'imul', label: 'IMUL result', cls: 'execution dependency', sub: 'fixed latency, inside the SM', unit: 'cuda', kind: 'exec', ex: '<code>IADD R4, R2, …</code> needs <code>R2</code> from an <code>IMUL</code> issued a few cycles ago. The latency is fixed (6 cycles in the Latency Hiding entry), so the compiler encodes the wait in the instruction stream; no scoreboard is needed.' },
      { k: 'ex2', label: 'MUFU.EX2 result', cls: 'short scoreboard', sub: 'variable latency, inside the SM', unit: 'sfu', kind: 'short', ex: 'The warp needs the result of an <code>EX2</code> on the <a data-term="special-function-unit">Special Function Unit</a>. Its latency varies, and these instructions go through the same memory input/output path as shared memory, so the wait is tracked on the <b>short scoreboard</b>.' },
      { k: 'lds', label: 'LDS result', cls: 'short scoreboard', sub: 'variable latency, inside the SM', unit: 'smem', kind: 'short', ex: 'The warp needs data loaded from <a data-term="shared-memory">shared memory</a> with <code>LDS</code>. The data is in the SM\'s own L1 data cache / shared memory, but the latency varies (bank conflicts, for one), so this memory dependency is a <b>short scoreboard</b> stall.' },
      { k: 'ldg', label: 'LDG result', cls: 'long scoreboard', sub: 'variable latency, may leave the SM', unit: 'ram', kind: 'long', ex: 'The warp needs data loaded from <a data-term="global-memory">global memory</a> with <code>LDG</code>. On a cache miss the request leaves the SM for the L2 cache and <a data-term="gpu-ram">GPU RAM</a>, hundreds of cycles away: a <b>long scoreboard</b> stall, the kind that dominates memory-bound code.' },
      { k: 'pipe', label: 'a busy Tensor Core', cls: 'pipeline conflict', sub: 'the unit is occupied', unit: 'tc', kind: 'pipe', ex: 'The warp\'s next instruction is an <code>HMMA</code>, but the Tensor Core is still busy with earlier matrix instructions. Nothing is missing from the warp\'s registers; the execution resource is occupied. That is a <b>pipeline conflict</b>.' },
      { k: 'bar', label: 'the rest of its block', cls: 'barrier', sub: 'synchronization', unit: 'warps', kind: 'bar', ex: 'The warp has reached <code>__syncthreads()</code> (<code>BAR.SYNC</code> in SASS) and must wait until every warp of its <a data-term="thread-block">thread block</a> arrives. No unit is busy and no data is missing: a synchronization barrier blocks it.' },
    ];
    const st = { k: 3 };
    let dotEl = null, pathEl = null, pathLen = 0;
    const view = rsvg(f.stage, 'Sketch of an SM with its warp, CUDA Cores, SFU, shared memory, Tensor Core and other warps, plus L2 and GPU RAM outside, with the path to the unit the warp waits on highlighted.', (svg, w) => {
      const mob = MOB(w);
      const sel = SRC[st.k];
      const U = {};
      const box = (k, x, y, bw, bh, label, col, fillA) => {
        const on = sel.unit === k;
        R(svg, x, y, bw, bh, `fill:${on ? fillA : 'rgba(255,255,255,.03)'};stroke:${col};stroke-width:${on ? 2 : 1};opacity:${on ? 1 : 0.7}`, { rx: 7 });
        Tx(svg, x + bw / 2, y + bh / 2 + 4, label, { fs: mob ? 10.5 : 11.5, anchor: 'middle', fill: on ? 'var(--ink)' : 'var(--ink-2)', weight: on ? 700 : 500 });
        U[k] = { x: x + bw / 2, y: y + bh / 2, l: x, r: x + bw, t: y, b: y + bh };
      };
      const warpBox = (wx, wy, ww, wh) => {
        R(svg, wx, wy, ww, wh, 'fill:rgba(251,191,36,.14);stroke:var(--control);stroke-width:1.6', { rx: 7 });
        Tx(svg, wx + ww / 2, wy + 19, 'stalled warp', { fs: mob ? 10.5 : 11.5, anchor: 'middle', fill: 'var(--control)', weight: 700 });
        Tx(svg, wx + ww / 2, wy + 34, 'waiting…', { fs: 10, anchor: 'middle', fill: 'var(--ink-3)' });
      };
      let d, H, by, bx, smH, subBelow = false;
      if (mob) {
        const rx = 128, rw = w - rx - 10, uh = 32, ug = 8;
        smH = 30 + 5 * (uh + ug) + 2;
        R(svg, 0.5, 0.5, w - 1, smH, 'fill:rgba(255,255,255,.02);stroke:var(--line-2);stroke-width:1.2', { rx: 10 });
        Tx(svg, 10, 18, 'Streaming Multiprocessor', { fs: 10.5, fill: 'var(--ink-3)', weight: 600 });
        box('cuda', rx, 30, rw, uh, 'CUDA Cores', 'var(--core)', 'rgba(52,211,153,.18)');
        box('sfu', rx, 30 + (uh + ug), rw, uh, 'SFU', 'var(--special)', 'rgba(244,114,182,.18)');
        box('tc', rx, 30 + 2 * (uh + ug), rw, uh, 'Tensor Core', 'var(--core)', 'rgba(52,211,153,.18)');
        box('smem', rx, 30 + 3 * (uh + ug), rw, uh, 'L1 / shared memory', 'var(--memory)', 'rgba(111,166,255,.18)');
        box('warps', rx, 30 + 4 * (uh + ug), rw, uh, 'other warps', 'var(--control)', 'rgba(251,191,36,.14)');
        const wy = U.tc.y - 22;
        warpBox(10, wy, 100, 44);
        const oy = smH + 12;
        Tx(svg, 4, oy + 12, 'outside the SM', { fs: 10.5, fill: 'var(--ink-3)', weight: 600 });
        box('l2', 0, oy + 20, w - 16, 34, 'L2 cache', 'var(--memory)', 'rgba(111,166,255,.18)');
        box('ram', 0, oy + 66, w - 16, 40, 'GPU RAM', 'var(--memory)', 'rgba(111,166,255,.18)');
        const t = U[sel.unit === 'ram' ? 'smem' : sel.unit];
        d = `M110,${r2(wy + 22)}H119V${r2(t.y)}H${r2(t.l)}`;
        if (sel.unit === 'ram') d += `M${r2(U.smem.r)},${r2(U.smem.y)}H${r2(w - 5)}V${r2(U.l2.y)}H${r2(U.l2.r)}M${r2(U.l2.x)},${r2(U.l2.b)}V${r2(U.ram.t)}`;
        by = oy + 122; bx = 0; subBelow = true;
        H = by + 52;
      } else {
        H = 250;
        const smW = w * 0.66;
        smH = H - 10;
        R(svg, 0.5, 0.5, smW - 1, smH, 'fill:rgba(255,255,255,.02);stroke:var(--line-2);stroke-width:1.2', { rx: 10 });
        Tx(svg, 12, 18, 'Streaming Multiprocessor', { fs: 11, fill: 'var(--ink-3)', weight: 600 });
        const wx = 14, wy = 34, ww = 120, wh = 44;
        warpBox(wx, wy, ww, wh);
        const ux = wx + ww + 30, uw = (smW - ux - 14 - 20) / 3, g = 10;
        box('cuda', ux, 30, uw, 40, 'CUDA Cores', 'var(--core)', 'rgba(52,211,153,.18)');
        box('sfu', ux + uw + g, 30, uw, 40, 'SFU', 'var(--special)', 'rgba(244,114,182,.18)');
        box('tc', ux + 2 * (uw + g), 30, uw, 40, 'Tensor Core', 'var(--core)', 'rgba(52,211,153,.18)');
        box('smem', ux, 100, uw * 2 + g, 40, 'L1 data cache / shared memory', 'var(--memory)', 'rgba(111,166,255,.18)');
        box('warps', wx, 100, ww, 40, 'other warps', 'var(--control)', 'rgba(251,191,36,.14)');
        const ox = smW + 22, oy = 10, ow = w - ox;
        Tx(svg, ox + 4, oy + 12, 'outside the SM', { fs: 11, fill: 'var(--ink-3)', weight: 600 });
        box('l2', ox, oy + 24, ow, 44, 'L2 cache', 'var(--memory)', 'rgba(111,166,255,.18)');
        box('ram', ox, oy + 100, ow, 60, 'GPU RAM', 'var(--memory)', 'rgba(111,166,255,.18)');
        const ws = { x: wx + ww, y: wy + wh / 2 };
        const t = U[sel.unit];
        if (sel.unit === 'ram') {
          const l1 = U.smem;
          d = `M${r2(ws.x)},${r2(ws.y)}H${r2(ux - 8)}V${r2(l1.y)}H${r2(l1.l)}M${r2(l1.r)},${r2(l1.y)}H${r2(smW + 8)}V${r2(U.l2.y)}H${r2(U.l2.l)}M${r2(U.l2.x)},${r2(U.l2.b)}V${r2(U.ram.t)}`;
        } else if (sel.unit === 'warps') d = `M${r2(wx + ww / 2)},${r2(wy + wh)}V${r2(U.warps.t)}`;
        else if (sel.unit === 'smem') d = `M${r2(ws.x)},${r2(ws.y)}H${r2(ux - 8)}V${r2(U.smem.y)}H${r2(U.smem.l)}`;
        else d = `M${r2(ws.x)},${r2(ws.y)}H${r2(ux - 8)}V24H${r2(t.x)}V${r2(t.t)}`;
        by = smH - 52; bx = 14;
      }
      const col = sel.kind === 'long' ? 'var(--memory)' : sel.kind === 'short' ? 'var(--special)' : sel.kind === 'exec' ? 'var(--core)' : 'var(--control)';
      pathEl = Pa(svg, d, `fill:none;stroke:${col};stroke-width:2;stroke-dasharray:5 4`);
      try { pathLen = pathEl.getTotalLength(); } catch (e) { pathLen = 0; }
      const p0 = d.match(/^M([\d.]+),([\d.]+)/);
      dotEl = C(svg, p0 ? +p0[1] : 0, p0 ? +p0[2] : 0, 5, `fill:${col};stroke:var(--bg);stroke-width:2`);
      // classification badge
      const lab = sel.cls;
      const bw2 = tw(lab, 12.5) + 24;
      R(svg, bx, by, bw2, 26, `fill:${col}`, { rx: 13 });
      Tx(svg, bx + bw2 / 2, by + 17.5, lab, { fs: 12.5, anchor: 'middle', fill: 'var(--bg)', weight: 700 });
      if (subBelow) Tx(svg, bx + 2, by + 44, sel.sub, { fs: 10.5, fill: 'var(--ink-2)' });
      else Tx(svg, bx + bw2 + 10, by + 17.5, sel.sub, { fs: 11, fill: 'var(--ink-2)' });
      return H;
    });
    const anim = GG.anim(f.stage, (t) => {
      if (!dotEl || !pathEl || !pathLen) return;
      const per = SRC[st.k].kind === 'long' ? 3.2 : 1.6;
      const ph = (t % per) / per, u = ph < 0.5 ? ph * 2 : 2 - ph * 2;
      try { const p = pathEl.getPointAtLength(u * pathLen); dotEl.setAttribute('cx', r2(p.x)); dotEl.setAttribute('cy', r2(p.y)); } catch (e) { /* ignore */ }
    });
    GG.ui.seg(f.controls, { label: 'the warp is waiting for', value: st.k, options: SRC.map((x, i) => ({ value: i, label: x.label })), onChange: (v) => { st.k = v; update(); } });
    const row = GG.el('div', { class: 'pfb-row' }); f.controls.append(row);
    GG.ui.playButton(row, anim);
    const sC = stat(f, 'stall reason', 'control'), sG = stat(f, 'glossary category');
    function update() {
      view.redraw();
      const x = SRC[st.k];
      const cat = x.kind === 'exec' || x.k === 'ex2' ? 'execution dependency' : x.kind === 'pipe' ? 'pipeline conflict' : x.kind === 'bar' ? 'synchronization barrier' : 'memory dependency';
      sC.set(x.cls); sG.set(cat);
      f.setWhy(x.ex);
      GG.decorate(f.why);
    }
    update();
  }

  /* ═════════════════════════ ACTIVE CYCLE ═════════════════════════ */

  const AC_SCEN = {
    // the text in a box is the warp's NEXT instruction: after a warp issues its LDG, it waits on the FFMA that needs the data
    launch: {
      label: 'kernel start-up',
      cells: [
        [null, null, 'LDG:selected', 'FFMA:stalled', 'FFMA:stalled', 'FFMA:stalled', 'FFMA:stalled', 'FFMA:selected'],
        [null, null, null, 'LDG:selected', 'FFMA:stalled', 'FFMA:stalled', 'FFMA:stalled', 'FFMA:stalled'],
        [null, null, null, null, 'LDG:selected', 'FFMA:stalled', 'FFMA:stalled', 'FFMA:stalled'],
        [null, null, null, null, null, 'LDG:selected', 'FFMA:stalled', 'FFMA:stalled'],
      ],
      why: 'The kernel has just been launched. On cycles 0 and 1 no thread block has reached this SM yet, so no warp is resident: those are <b>not active cycles</b>. From cycle 2 thread blocks (here one warp each) start landing on the SM, one per cycle (staggered for illustration). Each warp issues its load, then stalls on the <code>FFMA</code> that needs the loaded data. Cycle 6 is active even though nothing issues, because stalled warps count.',
    },
    tail: {
      label: 'end of the work',
      cells: [
        ['RET:selected', null, null, null, null, null, null, null],
        ['ADD:eligible', 'ADD:eligible', 'ADD:selected', 'RET:eligible', 'RET:selected', null, null, null],
        ['FFMA:stalled', 'FFMA:stalled', 'FFMA:stalled', 'FFMA:selected', 'RET:eligible', 'RET:selected', null, null],
        ['RET:eligible', 'RET:selected', null, null, null, null, null, null],
      ],
      why: 'The SM\'s last warps execute <code>RET</code> and exit one by one (slot 3 first waits for an earlier load before its last <code>FFMA</code>). After cycle 5 nothing is resident: cycles 6 and 7 are <b>not active</b>. This happens at the end of a kernel while other SMs are still finishing their blocks.',
    },
    gap: {
      label: 'between two kernels',
      cells: [
        ['FFMA:selected', 'RET:selected', null, null, null, 'LDG:selected', 'FFMA:stalled', 'FFMA:stalled'],
        ['RET:eligible', 'RET:eligible', 'RET:selected', null, null, null, 'LDG:selected', 'FFMA:stalled'],
        [null, null, null, null, null, null, null, 'LDG:selected'],
        [null, null, null, null, null, null, null, null],
      ],
      why: 'One kernel\'s last warps exit by cycle 2 and the next kernel\'s first warp arrives on cycle 5. In between, on cycles 3 and 4, the SM holds no warp at all: <b>not active cycles</b>. Launch gaps like this are one source of <a data-term="overhead">overhead</a>.',
    },
  };

  GG.entry('active-cycle', {
    render(body, ctx) {
      const s = ctx.html(body, `
<p>An <b>active cycle</b> is a clock cycle in which a <a data-term="streaming-multiprocessor">Streaming Multiprocessor</a> has at least one <a data-term="warp-execution-state">active warp</a> resident. The <a data-term="warp">warp</a> may be <a data-term="warp-execution-state">eligible</a> or <a data-term="warp-execution-state">stalled</a>: the definition asks only that some warp is there, not that anything issues.</p>
<p>All cycles depicted in the glossary's diagram are active cycles. Fig.&nbsp;1 tints them: every one of the four columns has at least one warp in it, even cycle n + 2, on which every warp is stalled and the issue slot stays empty. The diagram is inspired by the <a href="${GTC25}"><i>CUDA Techniques to Maximize Compute and Instruction Throughput</i></a> talk at GTC 2025.</p>
<div data-slot="f1"></div>
<h3>What a non-active cycle looks like</h3>
<p>A cycle is not active when the SM holds no warps at all: before the first <a data-term="thread-block">thread block</a> of a <a data-term="kernel">kernel</a> reaches it, after its last block has finished, or in the gap between two kernels. Fig.&nbsp;2 shows all three. Hover a column to see why it does or does not count.</p>
<div data-slot="f2"></div>
<p>Why define the word at all? Several per-SM metrics are averaged over active cycles only. <a data-term="issue-efficiency">Issue efficiency</a> is the fraction of cycles with work on which an instruction issues (counted per warp scheduler, over the cycles on which that scheduler has a warp: the same idea applied to one sub-partition), and achieved <a data-term="occupancy">occupancy</a> is measured on active cycles. That separates two questions: <em>how well does the SM use its time while it has work</em> (those ratios) and <em>how much of the time does it have work at all</em> (active cycles ÷ elapsed cycles). In Fig.&nbsp;2, compare the occupancy averaged over active cycles with the one averaged over all eight.</p>
<h3>Active cycles across a whole GPU</h3>
<p>Every SM counts its own active cycles. On a GPU with 132 SMs, an SM that runs out of blocks before the others sits idle while they finish, so its active cycles are fewer than the kernel's elapsed cycles. The fraction of time the SMs spend active is what <a data-term="streaming-multiprocessor-utilization">SM utilization</a> measures; that entry's Fig.&nbsp;1 shows the case where the blocks do not divide evenly over the SMs. Fig.&nbsp;3 shows the other common cause: even when they do divide evenly, blocks that take different times leave some SMs idle at the end.</p>
<div data-slot="f3"></div>
<div data-slot="reading"></div>`);

      guard(() => {
        const f = mkFig(ctx, s.f1, {
          title: 'All four cycles are active', hint: 'hover a cycle',
          caption: 'The glossary\'s diagram in "active" mode. Each tinted column is an active cycle: at least one warp slot holds an active warp. All four qualify, including cycle n + 2, where every warp is stalled. Diagram inspired by the <a href="' + GTC25 + '"><i>CUDA Techniques to Maximize Compute and Instruction Throughput</i></a> talk at GTC 2025.',
        });
        GG.components.cycles(f, { mode: 'active' });
      });
      guard(() => acScenarios(ctx, s.f2));
      guard(() => acWaves(ctx, s.f3));
      ctx.reading(s.reading, [
        { href: GTC25, label: 'NVIDIA GTC 2025: CUDA Techniques to Maximize Compute and Instruction Throughput', note: 'the inspiration for the diagram' },
      ]);
    },
  });

  function acScenarios(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Cycles with no resident warp', hint: 'pick a moment · hover a column', wide: true,
      caption: 'Hand-made scenarios for a small, illustrative SM with only four warp slots in total, using the same visual code as Fig. 1, over eight cycles. As in Fig. 1, the text in a box is the warp\'s next instruction. A column is an active cycle when a warp is resident in any of the SM\'s slots; columns with no warp at all (only dashed boxes) are not active cycles. The readouts are computed from the grid: achieved occupancy divides the occupied boxes by the boxes on active cycles only; the last chip divides by all the boxes.',
    });
    const st = { k: 'launch' };
    const mk = (k) => ({ slots: 4, cycles: 8, cells: AC_SCEN[k].cells, cycleLabels: ['0', '1', '2', '3', '4', '5', '6', '7'] });
    let cy = null;
    const extra = stat(f, 'occupancy over all 8 cycles');
    const segBox = GG.el('div');
    f.controls.append(segBox);
    cy = GG.components.cycles(f, {
      scenario: mk(st.k), mode: 'active',
      why: (info) => {
        if (!info) return null;
        if (info.cell || info.cycle != null || info.slot != null) return null;
        const m = info.metrics;
        return AC_SCEN[st.k].why + ` <b>${m.activeCycles} of ${m.cycles}</b> cycles are active.`;
      },
    });
    GG.ui.seg(segBox, { label: 'moment', value: st.k, options: Object.keys(AC_SCEN).map((k) => ({ value: k, label: AC_SCEN[k].label })), onChange: (v) => { st.k = v; cy.setScenario(mk(v)); paint(); } });
    function paint() {
      const m = cy.metrics();
      extra.set(`${m.activeCells}/${m.slots * m.cycles} · ${GG.components.cycles.fmtPct(m.occupancyAll)}`);
      GG.decorate(f.why);
    }
    paint();
  }

  function acWaves(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: '132 SMs, uneven blocks: active vs elapsed', hint: 'change the blocks and their spread', wide: true,
      caption: 'A simple model of an H100 SXM: each of the 132 rows is one SM; time runs left to right, in average block durations. Assumptions: an SM runs one block at a time, and each block starts on whichever SM frees up first. Block durations vary randomly around 1 by the chosen spread (seeded, so the picture is repeatable). Green spans are the SM\'s active cycles; the hatched remainder is elapsed time with no warp resident on that SM. With no spread this is the equal-block wave model of the <a data-term="streaming-multiprocessor-utilization">SM Utilization</a> entry\'s Fig.&nbsp;1. Real kernels usually fit several blocks per SM, which changes the shape but not the idea.',
    });
    const NSM = 132;
    const st = { n: 264, spread: 0.4 };
    let M = null;
    function run() {
      // greedy list scheduling: the next block goes to the SM that frees up first (lowest index on a tie)
      const rnd = rng(11), n = st.n;
      const end = new Array(NSM).fill(0), cnt = new Array(NSM).fill(0);
      let work = 0;
      for (let b = 0; b < n; b++) {
        const d = Math.max(0.15, 1 + st.spread * (rnd() * 2 - 1));
        let j = 0;
        for (let i = 1; i < NSM; i++) if (end[i] < end[j] - 1e-12) j = i;
        end[j] += d; cnt[j] += 1; work += d;
      }
      const T = Math.max(...end);
      M = { end, cnt, work, T, frac: T > 0 ? work / (NSM * T) : 0, equal: st.spread === 0 };
    }
    const view = rsvg(f.stage, 'One thin bar per SM showing how much of the kernel\'s elapsed time it was active.', (svg, w) => {
      const mob = MOB(w);
      const T = M.T || 1;
      const labW = mob ? 30 : 46, x0 = labW, x1 = w - 4;
      const rh = mob ? 2.2 : 2.6, top = 18;
      const X = (u) => x0 + (u / T) * (x1 - x0);
      const pat = GG.svg('pattern', { id: GG.uid('pfbh'), width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, svg);
      R(pat, 0, 0, 2, 6, 'fill:rgba(248,113,113,.4)');
      for (let i = 0; i < NSM; i++) {
        const e = M.end[i], y = top + i * rh;
        if (e < T - 1e-9) R(svg, X(e), y, X(T) - X(e), rh - 0.4, `fill:url(#${pat.id})`);
        if (e > 0) R(svg, x0, y, X(e) - x0, rh - 0.4, 'fill:var(--core)');
      }
      const ticks = Math.floor(T + 1e-9);
      const every = Math.max(1, Math.ceil(ticks / 8));
      for (let k = 0; k <= ticks; k++) {
        const x = X(k);
        Ln(svg, x, top - 4, x, top + NSM * rh + 4, 'stroke:var(--ink-3);stroke-width:1;stroke-dasharray:2 3');
        if (k % every === 0 && (k === 0 || X(T) - x > 14 || Math.abs(T - k) < 1e-9)) Tx(svg, x, top + NSM * rh + 17, k === 0 ? 'launch' : `${k}`, { fs: 10, anchor: k === 0 ? 'start' : Math.abs(T - k) < 1e-9 ? 'end' : 'middle', fill: 'var(--ink-3)' });
      }
      if (Math.abs(T - ticks) > 1e-9) {
        // the kernel ends between two ticks: mark the end
        Ln(svg, X(T), top - 4, X(T), top + NSM * rh + 4, 'stroke:var(--ink-2);stroke-width:1');
        Tx(svg, X(T), top + NSM * rh + 17, sig(T, 3), { fs: 10, anchor: 'end', fill: 'var(--ink-2)' });
      }
      if (M.equal) {
        const waves = Math.ceil(st.n / NSM), last = st.n - NSM * (waves - 1);
        if (last < NSM && waves > 1) {
          // the few SMs still running in the last wave: outline them and say so
          const xa = X(waves - 1), xb = X(waves);
          R(svg, xa - 1, top - 1.5, xb - xa + 2, last * rh + 2.5, 'fill:none;stroke:var(--ink);stroke-width:1.2', { rx: 1 });
          const lab = last === 1 ? `SM 0: the only active SM in wave ${waves}` : `SMs 0–${last - 1}: the only active SMs in wave ${waves}`;
          const fs = mob ? 9.5 : 10.5, lw = tw(lab, fs) + 10;
          const ly = top + Math.max(last * rh + 18, 30);
          if (ly + 6 < top + NSM * rh) {
            const lx = clamp((xa + xb) / 2 - lw / 2, x0 + 2, x1 - lw);
            Ln(svg, (xa + xb) / 2, top + last * rh + 1, (xa + xb) / 2, ly - fs, 'stroke:var(--ink);stroke-width:1');
            R(svg, lx, ly - fs - 2, lw, fs + 7, 'fill:var(--bg-2);stroke:var(--line-2)', { rx: 4 });
            Tx(svg, lx + 5, ly + 1, lab, { fs, fill: 'var(--ink)', weight: 600 });
          }
        }
      }
      Tx(svg, x1, 11, `elapsed: ${sig(T, 3)} block ${plural(T, 'time')}`, { fs: 10.5, anchor: 'end', fill: 'var(--ink-2)' });
      Tx(svg, 0, 11, 'SMs', { fs: 10.5, fill: 'var(--ink-2)' });
      [0, 32, 64, 96, 131].forEach((i) => Tx(svg, x0 - 5, top + i * rh + 3, String(i), { fs: 9, anchor: 'end', fill: 'var(--ink-3)' }));
      return top + NSM * rh + 24;
    });
    legend(f.stage, [['var(--core)', 'active cycles'], ['rgba(248,113,113,.7)', 'elapsed but not active', 'hatch']]);
    const slN = GG.ui.slider(f.controls, { label: 'thread blocks in the grid', min: 1, max: 528, step: 1, value: st.n, format: (v) => fI(v), onInput: (v) => { st.n = v; pr.mark(-1); update(); } });
    const slS = GG.ui.slider(f.controls, { label: 'spread of block durations', min: 0, max: 0.8, step: 0.05, value: st.spread, format: (v) => '±' + Math.round(v * 100) + '%', onInput: (v) => { st.spread = v; pr.mark(-1); update(); } });
    const PRE = [{ label: '264 equal blocks', n: 264, sp: 0 }, { label: '264, ±40%', n: 264, sp: 0.4 }, { label: '528, ±40%', n: 528, sp: 0.4 }, { label: '528, ±80%', n: 528, sp: 0.8 }];
    const pr = presetRow(f.controls, 'try', PRE, (it, k) => { st.n = it.n; st.spread = it.sp; slN.set(it.n); slS.set(it.sp); pr.mark(k); update(); });
    pr.mark(1);
    const sT = stat(f, 'elapsed (block times)'), sA = stat(f, 'active ÷ elapsed, all SMs', 'core');
    function update() {
      run(); view.redraw();
      const n = st.n, T = M.T;
      sT.set(sig(T, 3)); sA.set(pct(M.frac, 1));
      const avg = pct(M.frac, 1);
      let why;
      if (M.equal) {
        const waves = Math.ceil(n / NSM), last = n - NSM * (waves - 1);
        why = n < NSM
          ? `${fI(n)} equal ${plural(n, 'block')}: ${fI(n)} ${plural(n, 'SM')} ${n === 1 ? 'is' : 'are'} active for the whole kernel and the other ${NSM - n} never are, so <b>${avg}</b> of the elapsed SM-cycles are active cycles.`
          : `${fI(n)} equal blocks on 132 SMs take <b>${waves} ${plural(waves, 'wave')}</b>. ${last === NSM ? 'They divide evenly, so every SM is active for the whole kernel: <b>100%</b>. Now add some spread to the block durations.' : `The last wave has only ${last} ${plural(last, 'block')}, so ${NSM - last} SMs sit with no resident warp while it runs (the case the SM Utilization entry works through). Averaged over all SMs, ${fI(n)} ÷ (132 × ${waves}) = <b>${avg}</b> of the elapsed SM-cycles are active.`}`;
      } else {
        const lo = Math.min(...M.end), early = M.end.filter((e) => e < T - 0.25).length;
        why = `${fI(n)} blocks whose durations vary by ±${Math.round(st.spread * 100)}%. Each SM is active until its last block ends, and those ends differ: the first SM runs out of work at ${sig(lo, 3)} block times, the last at <b>${sig(T, 3)}</b>, which is the kernel's elapsed time. ${early} of the 132 SMs finish more than a quarter of a block early and spend the rest of the kernel with no resident warp. Averaged over all SMs, ${sig(M.work, 4)} block times of work ÷ (132 × ${sig(T, 3)}) = <b>${avg}</b> of the elapsed SM-cycles are active${n % NSM === 0 ? `, although ${fI(n)} blocks divide evenly over the SMs` : ''}.`;
      }
      f.setWhy(why);
    }
    update();
  }

  /* ═════════════════════════ OCCUPANCY ═════════════════════════ */

  const OC_SPEC = `Maximum warps/SM: 64
Maximum blocks/SM: 32
(32 bit) Registers: 65536
Shared memory (smem): 228 KB`;
  const OC_CALC = `64 > 1   = warps/block = 32 threads/block ÷ 32 threads/warp
32 < 256 = blocks/register-file = 65,536 registers/register-file ÷ (32 threads/block × 8 registers/thread)
32       = blocks/SM
19       = blocks/smem = 228 KB/smem ÷ 12 KB/block`;

  /* the occupancy arithmetic; returns limits in blocks per SM.
     k.rules = false: the glossary's plain division (threads × registers per block, shared memory as given).
     k.rules = true: NVIDIA's allocation rules for compute capability 9.0, as in its occupancy calculator and the
     Register Pressure entry: registers go to each warp in units of 256, every warp draws them from one of the four
     sub-partitions' quarters of the register file, and the driver reserves 1 KB of shared memory per block. */
  function occCalc(d, k) {
    const wpb = Math.ceil(k.threads / 32);
    const rpw = k.rules ? Math.ceil((k.regs * 32) / 256) * 256 : null;
    const slice = d.regs / 4, perSlice = k.rules && rpw > 0 ? Math.floor(slice / rpw) : null;
    const regsPerBlock = k.rules ? rpw * wpb : k.threads * k.regs;
    const smemPerBlock = k.smem + (k.rules || k.reserve ? 1 : 0);
    const L = {
      warps: Math.floor(d.warps / wpb),
      regs: regsPerBlock > 0 ? (k.rules ? Math.floor((4 * perSlice) / wpb) : Math.floor(d.regs / regsPerBlock)) : Infinity,
      blocks: d.blocks,
      smem: smemPerBlock > 0 ? Math.floor(d.smem / smemPerBlock + 1e-9) : Infinity,
    };
    const blocks = Math.max(0, Math.min(L.warps, L.regs, L.blocks, L.smem));
    const warps = blocks * wpb;
    const order = ['warps', 'regs', 'blocks', 'smem'];
    const bind = order.filter((x) => L[x] === blocks);
    return { wpb, rpw, slice, perSlice, regsPerBlock, smemPerBlock, L, blocks, warps, occ: d.warps > 0 ? warps / d.warps : 0, bind };
  }

  GG.entry('occupancy', {
    render(body, ctx) {
      const s = ctx.html(body, `
<p><b>Occupancy</b> is the ratio of the <a data-term="warp-execution-state">active warps</a> to the maximum number of active warps on a device. An H100 SM can keep 64 warps resident; if 32 warps are resident (active) on it, stalled or not, its occupancy is 32 ÷ 64 = 50%.</p>
${GG.noteHTML('intuition', '<p>Think of a restaurant with 64 tables. Occupancy is the share of tables with guests seated, whether or not they are eating right now. A full room gives the waiters (the <a data-term="warp-scheduler">warp schedulers</a>) plenty of choice of whom to serve next, so they rarely stand idle. But a full room is not the goal in itself: what matters is how many meals the kitchen turns out, and sometimes fewer, bigger tables do better.</p>')}
<p>In the glossary's diagram there are four warp slots per cycle on each of four clock cycles, so 16 = 4 × 4 total warp slots, and there are active warps in 15 of them, for an occupancy of about 94% (15 ÷ 16 = 93.75%). Fig.&nbsp;1 counts them; the diagram is inspired by the <a href="${GTC25}"><i>CUDA Techniques to Maximize Compute and Instruction Throughput</i></a> talk at GTC 2025.</p>
<div data-slot="f1"></div>
<h3>Theoretical and achieved</h3>
<p>There are two types of occupancy measurements:</p>
<ul>
<li><b>Theoretical occupancy</b> represents the upper limit for occupancy due to the kernel launch configuration and device capabilities. It is computed before the kernel runs, from how many thread blocks fit on an SM at once.</li>
<li><b>Achieved occupancy</b> measures the actual occupancy during <a data-term="kernel">kernel</a> execution, that is, on <a data-term="active-cycle">active cycles</a>. It is measured by a profiler, and is usually lower: blocks finish at different times, and near the end of a kernel there are not enough blocks left to fill every SM.</li>
</ul>
<div data-slot="f2"></div>
<h3>What limits occupancy</h3>
<p>As part of the <a data-term="cuda-programming-model">CUDA programming model</a>, all the <a data-term="thread">threads</a> in a <a data-term="thread-block">thread block</a> are scheduled onto the same <a data-term="streaming-multiprocessor">Streaming Multiprocessor (SM)</a>. Each SM has resources (like space in <a data-term="shared-memory">shared memory</a>) that must be partitioned across thread blocks, and so limit the number of thread blocks that can be scheduled on the SM. A block only starts once it can get all of its resources at once.</p>
<p>Let's work through an example. Consider an NVIDIA H100 GPU, which has these specifications:</p>
<div data-slot="spec"></div>
<p>For a kernel using 32 threads per thread block, 8 <a data-term="registers">registers</a> per thread, and 12 KB of shared memory per thread block, we end up limited by shared memory. The glossary computes one limit per line; hover a line for what it says.</p>
<div data-slot="calc"></div>
<p>Even though our <a data-term="register-file">register file</a> is big enough to support 256 thread blocks concurrently, our shared memory is not, and so we can only run 19 thread blocks per SM, corresponding to 19 <a data-term="warp">warps</a>. This is the common case where the size of program intermediates stored in registers is much smaller than elements of the program's <a href="https://en.wikipedia.org/wiki/Working_set">working set</a> that need to stay in shared memory.</p>
${GG.noteHTML('check', '<p>The glossary stops at 19 warps. As an occupancy: 19 blocks × 1 warp per block = 19 active warps out of a maximum of 64, so the theoretical occupancy is 19 ÷ 64 = <b>29.7%</b> (29.6875% exactly).</p>')}
<p>Fig.&nbsp;3 is the same calculation as a calculator. It opens on the glossary's example; every input, for the kernel and for the device, can be changed. Each bar is one SM resource with the resident blocks drawn into it, so you can see which one fills up first. By default it applies the allocation rules real hardware uses (the note below it explains them), under which the glossary's kernel fits 17 blocks rather than 19; switch it to the glossary's arithmetic to reproduce the 19.</p>
<div data-slot="f3"></div>
${GG.noteHTML('beyond', `<p><b>What real hardware adds.</b> The glossary's calculation is the clean version; NVIDIA's occupancy calculator (in Nsight Compute) applies a few more rules. Registers are allocated per warp in chunks (256 registers per warp), and each warp draws them from its own sub-partition's quarter of the register file; the <a data-term="register-pressure">Register Pressure</a> entry has a calculator with those rules. On compute capability 8.0 and later the CUDA driver reserves 1 KB of shared memory for every block (<code>cudaDeviceProp::reservedSharedMemPerBlock</code>), so the glossary's kernel really needs 13 KB per block: 228 ÷ 13 = 17 blocks, 17 ÷ 64 = 26.6%. Fig.&nbsp;3 applies these rules unless you switch it to the glossary's arithmetic. And the "228 KB" (KiB, 1,024 bytes each) is the most of the SM's L1 data cache that can be configured as shared memory; one block can use at most 227 KB of it (228 minus the 1 KB reservation), and a kernel whose blocks use more than 48 KB has to opt in with <code>cudaFuncSetAttribute</code>.</p>`)}
<h3>More is not always better</h3>
<p>Low occupancy can hurt performance when there aren't enough <a data-term="warp-execution-state">eligible warps</a> to <a data-term="latency-hiding">hide the latency</a> of instructions, which shows up as low instruction <a data-term="issue-efficiency">issue efficiency</a> and <a data-term="pipe-utilization">under-utilized pipes</a>. However, once occupancy is sufficient for latency hiding, increasing it further may actually degrade performance. Higher occupancy reduces resources per thread, potentially <a data-term="register-pressure">bottlenecking the kernel on registers</a> or reducing the <a data-term="arithmetic-intensity">arithmetic intensity</a> that modern GPU architectures are designed to exploit. (Fewer registers per thread means smaller tiles of data held close to the cores, so each byte loaded from memory is reused less.)</p>
<p>Fig.&nbsp;4 is a toy model of that trade-off with two knobs: how many warps the kernel needs to hide its latency, and how many registers each thread would like.</p>
<div data-slot="f4"></div>
<p>More generally, occupancy measures what fraction of its maximum parallel tasks the GPU is handling simultaneously, which is not inherently a target of optimization in most kernels. Instead, we want to maximize the <a data-term="pipe-utilization">utilization</a> of compute resources if we are <a data-term="compute-bound">compute-bound</a> or memory resources if we are <a data-term="memory-bound">memory-bound</a>.</p>
<p>In particular, high-performance GEMM (general matrix multiplication) kernels on Hopper and Blackwell <a data-term="streaming-multiprocessor-architecture">architecture</a> GPUs often run at single-digit occupancy percentages, because they don't need many warps to fully saturate the <a data-term="tensor-core">Tensor Cores</a>. Each Tensor Core instruction does a large amount of work, so a few warps can keep the Tensor Cores busy; each of their threads can use up to the 255-register maximum, and large tiles of the operands are staged in shared memory. Four warps out of 64 is 6.25%.</p>
<div data-slot="reading"></div>`);

      guard(() => {
        const f = mkFig(ctx, s.f1, {
          title: '15 of 16 warp slots hold an active warp', hint: 'watch the count · hover a box',
          caption: 'The glossary\'s diagram in "occupancy" mode: every box holding an active warp turns green and is counted. Four slots × four cycles = 16 warp slots; 15 hold active warps; 15 ÷ 16 = 93.75%, about 94%. The one empty box is slot 4 on cycle n + 2, after its warp has exited. Diagram inspired by the <a href="' + GTC25 + '"><i>CUDA Techniques to Maximize Compute and Instruction Throughput</i></a> talk at GTC 2025.',
        });
        GG.components.cycles(f, { mode: 'occupancy' });
      });
      guard(() => ocAchieved(ctx, s.f2));
      guard(() => mkCode(ctx, s.spec, { lang: 'text', code: OC_SPEC, caption: 'H100 per-SM limits, as the glossary lists them', lineNumbers: false }));
      guard(() => mkCode(ctx, s.calc, {
        lang: 'text', code: OC_CALC, wide: true, caption: 'the glossary\'s calculation, verbatim',
        notes: {
          1: '<b>Warps.</b> A 32-thread block is 32 ÷ 32 = 1 warp. The SM holds 64 warps and 64 &gt; 1, so warp slots would allow 64 ÷ 1 = 64 blocks: not the constraint.',
          2: '<b>Registers.</b> One block needs 32 threads × 8 registers = 256 registers, and the register file has 65,536, so it could hold 65,536 ÷ 256 = 256 blocks. The block limit (32) is smaller than that (32 &lt; 256), so registers do not bind either.',
          3: '<b>Blocks.</b> The SM can track at most 32 resident thread blocks, whatever their size.',
          4: '<b>Shared memory.</b> Each block reserves 12 KB and the SM has 228 KB: 228 ÷ 12 = 19 blocks. This is the smallest of the four limits (64, 256, 32, 19), so 19 blocks run per SM.',
        },
      }));
      guard(() => ocCalc(ctx, s.f3));
      guard(() => ocToy(ctx, s.f4));
      ctx.reading(s.reading, [
        { href: GTC25, label: 'NVIDIA GTC 2025: CUDA Techniques to Maximize Compute and Instruction Throughput', note: 'the inspiration for the diagram' },
        { href: 'https://en.wikipedia.org/wiki/Working_set', label: 'Working set (Wikipedia)', note: 'the data a program needs to keep close while it runs' },
        { href: CC_DOCS, label: 'CUDA C++ Programming Guide: Compute Capabilities', note: 'per-SM limits for each architecture (beyond the glossary)' },
      ]);
    },
  });

  /* Fig: theoretical vs achieved occupancy over a kernel's run on one SM */
  function ocAchieved(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Theoretical vs achieved, on one SM', hint: 'change the blocks and their spread', wide: true,
      caption: 'A simple model of one SM running the glossary\'s kernel: 19 one-warp blocks fit at a time (the glossary\'s theoretical limit, worked out below). Block durations vary randomly around 1 time unit by the chosen spread (seeded, so the picture is repeatable); when a block finishes, the next waiting block starts at once. The green area is the number of resident warps over time. Achieved occupancy is that area averaged over the SM\'s active time, divided by 64.',
    });
    const st = { n: 76, spread: 0.4 };
    let R0 = null;
    function run() {
      const B = 19, rnd = rng(7);
      const dur = Array.from({ length: st.n }, () => Math.max(0.15, 1 + st.spread * (rnd() * 2 - 1)));
      const ends = [];
      const ev = [];
      let next = 0;
      for (; next < Math.min(B, st.n); next++) { ends.push(dur[next]); ev.push([0, 1]); ev.push([dur[next], -1]); }
      while (next < st.n) {
        ends.sort((a, b) => a - b);
        const t = ends.shift();
        ends.push(t + dur[next]); ev.push([t, 1]); ev.push([t + dur[next], -1]);
        next++;
      }
      ev.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      // events at the same instant (a block ends and the next starts at once) are merged: no zero-width dips
      const steps = []; let cur = 0, area = 0, lastT = 0;
      ev.forEach(([t, d]) => {
        area += cur * (t - lastT); lastT = t; cur += d;
        if (steps.length && Math.abs(steps[steps.length - 1][0] - t) < 1e-9) steps[steps.length - 1][1] = cur; else steps.push([t, cur]);
      });
      const T = lastT;
      R0 = { steps, T, area, achieved: T > 0 ? area / T / 64 : 0, avgWarps: T > 0 ? area / T : 0 };
    }
    const view = rsvg(f.stage, 'Step chart of resident warps over time on one SM, with lines for the theoretical occupancy and the maximum of 64 warps.', (svg, w) => {
      const mob = MOB(w);
      const padL = mob ? 30 : 40, x0 = padL, x1 = w - 8, y0 = 10, H = mob ? 222 : 246, y1 = H - 36;
      const T = R0.T || 1;
      const X = (t) => x0 + (t / T) * (x1 - x0);
      const Y = (v) => y1 - (v / 64) * (y1 - y0);
      R(svg, x0, y0, x1 - x0, y1 - y0, 'fill:rgba(255,255,255,.015);stroke:var(--line)');
      [0, 19, 32, 48, 64].forEach((v) => { Ln(svg, x0, Y(v), x1, Y(v), v === 19 ? 'stroke:none' : 'stroke:var(--line)'); Tx(svg, x0 - 6, Y(v) + 3.5, String(v), { fs: 9.5, anchor: 'end', fill: v === 19 ? 'var(--ink)' : 'var(--ink-3)' }); });
      let d = `M${r2(x0)},${r2(Y(0))}`, prev = 0;
      R0.steps.forEach(([t, v]) => { d += `L${r2(X(t))},${r2(Y(prev))}L${r2(X(t))},${r2(Y(v))}`; prev = v; });
      d += `L${r2(X(T))},${r2(Y(0))}Z`;
      Pa(svg, d, 'fill:rgba(52,211,153,.35);stroke:var(--core);stroke-width:1.2');
      Ln(svg, x0, Y(19), x1, Y(19), 'stroke:var(--ink);stroke-width:1.3;stroke-dasharray:5 4');
      Tx(svg, x1 - 4, Y(19) - 6, 'theoretical: 19 warps = 29.7%', { fs: 10.5, anchor: 'end', fill: 'var(--ink)', weight: 600 });
      const ya = Y(R0.avgWarps);
      Ln(svg, x0, ya, x1, ya, 'stroke:var(--core);stroke-width:1.6');
      {
        const al = `achieved: ${sig(R0.avgWarps, 3)} warps on average = ${pct(R0.achieved, 1)}`, afs = mob ? 10 : 10.5;
        const ay = R0.avgWarps > 15 && R0.avgWarps < 23 ? ya + 15 : ya - 6; // keep clear of the theoretical line
        R(svg, x0 + 3, ay - afs, tw(al, afs) + 8, afs + 5, 'fill:var(--bg-2)', { rx: 3 });
        Tx(svg, x0 + 7, ay, al, { fs: afs, fill: 'var(--core)', weight: 600 });
      }
      Ln(svg, x0, Y(64), x1, Y(64), 'stroke:var(--ink-3);stroke-width:1');
      Tx(svg, x0 + 6, Y(64) + 13, 'maximum: 64 warps', { fs: 10, fill: 'var(--ink-3)' });
      Tx(svg, (x0 + x1) / 2, H - 6, mob ? 'time (active cycles), in block durations' : 'time on this SM (active cycles only), in block durations', { fs: 10, anchor: 'middle', fill: 'var(--ink-3)' });
      const yl = Tx(svg, 9, (y0 + y1) / 2, 'resident warps', { fs: 10, anchor: 'middle', fill: 'var(--ink-3)' });
      yl.setAttribute('transform', `rotate(-90 9 ${r2((y0 + y1) / 2)})`);
      for (let t = 0; t <= Math.floor(T); t++) Tx(svg, X(t), y1 + 13, String(t), { fs: 9.5, anchor: t === 0 ? 'start' : 'middle', fill: 'var(--ink-3)' });
      return H;
    });
    const slN = GG.ui.slider(f.controls, { label: 'blocks this SM runs', min: 1, max: 190, step: 1, value: st.n, format: (v) => fI(v), onInput: (v) => { st.n = v; pr.mark(-1); update(); } });
    const slS = GG.ui.slider(f.controls, { label: 'spread of block durations', min: 0, max: 0.8, step: 0.05, value: st.spread, format: (v) => '±' + Math.round(v * 100) + '%', onInput: (v) => { st.spread = v; pr.mark(-1); update(); } });
    const pr = presetRow(f.controls, 'try', [{ label: '19 equal blocks', n: 19, sp: 0 }, { label: '20 equal blocks', n: 20, sp: 0 }, { label: '76 blocks, ±40%', n: 76, sp: 0.4 }, { label: '190 blocks, ±40%', n: 190, sp: 0.4 }], (it, k) => { st.n = it.n; st.spread = it.sp; slN.set(it.n); slS.set(it.sp); pr.mark(k); update(); });
    pr.mark(2);
    const sT = stat(f, 'theoretical'), sA = stat(f, 'achieved', 'core');
    function update() {
      run(); view.redraw();
      sT.set('19/64 · 29.7%'); sA.set(pct(R0.achieved, 1));
      const lossTxt = R0.achieved < 0.2969 - 0.0005 ? `Achieved occupancy is <b>${pct(R0.achieved, 1)}</b>, below the theoretical 29.7%: ` : `Achieved occupancy equals the theoretical <b>29.7%</b>: `;
      let why;
      if (st.n < 19) why = `Only ${st.n} ${plural(st.n, 'block')} for this SM, fewer than the 19 that fit, so the SM is never full. ${lossTxt}the launch configuration allows 19, but there is not enough work.`;
      else if (st.spread === 0 && st.n % 19 === 0) why = `${st.n} equal blocks run in exactly ${st.n / 19} full ${plural(st.n / 19, 'wave')} of 19. ${lossTxt}the SM is always full while it is active.`;
      else why = `${lossTxt}${st.spread > 0 ? 'blocks finish at different times, and ' : ''}at the end there are not enough blocks left to fill all 19 places, so the SM runs part-empty for a while. Achieved occupancy only counts active cycles, so the idle time after the last block does not count, but the part-empty tail does.`;
      f.setWhy(why);
    }
    update();
  }

  /* Fig: the occupancy calculator */
  function ocCalc(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Occupancy calculator: which resource runs out first?', hint: 'change any input', wide: true, controlsFirst: false,
      caption: 'Each bar is one per-SM resource of the device, at full length. Every coloured segment is one resident thread block\'s share of it (with the blocks that actually fit); the number on the right is how many blocks that resource alone would allow. The smallest of the four numbers is the number of resident blocks, and the resource that sets it is outlined. Partial warps round up: a 48-thread block takes 2 warp slots. Two arithmetics: NVIDIA\'s allocation rules for compute capability 9.0, as its occupancy calculator applies them (the default: registers are handed out per warp in units of 256, each warp takes all of its registers from one sub-partition\'s quarter of the register file, and the driver reserves 1 KB of shared memory per block), or the glossary\'s plain division. The live lines below spell out the chosen one; the last readout gives the other\'s result.',
    });
    const D = { warps: 64, blocks: 32, regs: 65536, smem: 228 };
    const K = { threads: 32, regs: 8, smem: 12, rules: true };
    const lines = GG.el('div', { class: 'pfb-codeline', style: 'margin-top:14px;white-space:pre-wrap' });
    let RS = occCalc(D, K);
    const view = rsvg(f.stage, 'Four horizontal bars, one per SM resource (warp slots, registers, block slots, shared memory), filled with one segment per resident thread block.', (svg, w) => {
      const mob = MOB(w);
      const r = RS;
      const labW = mob ? 0 : 196, x0 = labW, rightW = mob ? 0 : 176, x1 = w - rightW;
      const rowH = mob ? 62 : 46, bh = 18;
      const rows = [
        { k: 'warps', name: 'Warp slots', cap: D.warps, per: r.wpb, unit: 'warps', capTxt: `${fI(D.warps)} warps`, col: 'var(--core)', perTxt: `${r.wpb} ${plural(r.wpb, 'warp')} per block` },
        { k: 'regs', name: 'Register file', cap: D.regs, per: r.regsPerBlock, capTxt: `${fI(D.regs)} registers`, col: 'var(--memory)', perTxt: K.rules ? `${fI(r.rpw)} per warp × ${r.wpb}` : `${fI(r.regsPerBlock)} regs per block` },
        { k: 'blocks', name: 'Block slots', cap: D.blocks, per: 1, capTxt: `${D.blocks} blocks`, col: 'var(--control)', perTxt: '1 slot per block' },
        { k: 'smem', name: 'Shared memory', cap: D.smem, per: r.smemPerBlock, capTxt: `${D.smem} KB`, col: 'var(--memory)', perTxt: K.rules ? `${sig(r.smemPerBlock, 4)} KB/block (1 reserved)` : `${sig(r.smemPerBlock, 4)} KB per block` },
      ];
      rows.forEach((row, i) => {
        const y = 6 + i * rowH;
        const bind = r.bind.indexOf(row.k) >= 0 && r.blocks > 0;
        const lim = r.L[row.k];
        const by = mob ? y + 18 : y + 6;
        if (mob) {
          Tx(svg, 0, y + 11, row.name, { fs: 11.5, fill: 'var(--ink)', weight: 600 });
          Tx(svg, w, y + 11, lim === Infinity ? 'no limit' : `allows ${fI(lim)}`, { fs: 11, anchor: 'end', fill: bind ? 'var(--ink)' : 'var(--ink-2)', weight: bind ? 700 : 500 });
        } else {
          Tx(svg, 0, y + 15, row.name, { fs: 12, fill: 'var(--ink)', weight: 600 });
          Tx(svg, 0, y + 30, `${row.capTxt} · ${pct(Math.min(1, (r.blocks * row.per) / (row.cap || 1)), (r.blocks * row.per) / (row.cap || 1) < 0.1 ? 1 : 0)} used`, { fs: 10.5, fill: 'var(--ink-3)' });
          Tx(svg, x1 + 12, y + 15, lim === Infinity ? 'no limit' : `allows ${fI(lim)} ${plural(lim, 'block')}`, { fs: 11.5, fill: bind ? 'var(--ink)' : 'var(--ink-2)', weight: bind ? 700 : 500 });
          Tx(svg, x1 + 12, y + 30, row.perTxt, { fs: 10, fill: 'var(--ink-3)' });
        }
        R(svg, x0 + 0.5, by + 0.5, x1 - x0 - 1, bh, `fill:rgba(255,255,255,.03);stroke:${bind ? 'var(--ink)' : 'var(--line-2)'};stroke-width:${bind ? 1.8 : 1}`, { rx: 3 });
        const segW = row.cap > 0 ? ((x1 - x0) * row.per) / row.cap : 0;
        for (let b = 0; b < r.blocks; b++) {
          const xa = x0 + b * segW;
          if (xa >= x1) break;
          R(svg, xa + 1, by + 2.5, Math.max(0.6, Math.min(segW, x1 - xa) - (segW > 4 ? 1.5 : 0.2)), bh - 4, `fill:${row.col};opacity:${b % 2 ? 0.62 : 0.9}`, { rx: segW > 6 ? 2 : 0 });
        }
        const used = Math.min(1, (r.blocks * row.per) / (row.cap || 1));
        const ut = `${pct(used, used < 0.1 ? 1 : 0)} used`;
        if (mob) Tx(svg, 0, by + bh + 14, `${row.capTxt} · ${row.perTxt} · ${ut}`, { fs: 9.5, fill: 'var(--ink-3)' });
        if (bind) {
          const tag = 'the limit';
          const tx = mob ? w - tw(`allows ${fI(lim)}`, 11) - tw(tag, 10) - 24 : x0 + 6;
          if (!mob) { /* tag drawn beside the name instead */ Tx(svg, tw(row.name, 12) + 10, y + 15, '← the limit', { fs: 10.5, fill: 'var(--control)', weight: 700 }); }
          else Tx(svg, tx, y + 11, tag, { fs: 10, fill: 'var(--control)', weight: 700 });
        }
      });
      return 6 + 4 * rowH + 2;
    });
    f.stage.append(lines);
    // controls
    const gK = GG.el('div', { class: 'pfb-group' });
    gK.innerHTML = '<div class="pfb-gh">Kernel <span>launch configuration</span></div>';
    const iK = GG.el('div', { class: 'pfb-inputs' }); gK.append(iK);
    const gD = GG.el('div', { class: 'pfb-group' });
    gD.innerHTML = '<div class="pfb-gh">Device <span>per-SM limits (H100 defaults)</span></div>';
    const iD = GG.el('div', { class: 'pfb-inputs' }); gD.append(iD);
    const wrap = GG.el('div', { class: 'pfb-split two', style: 'width:100%' });
    wrap.append(gK, gD);
    f.controls.append(wrap);
    f.controls.style.flexBasis = '100%';
    const ctl = {};
    ctl.threads = GG.ui.slider(iK, { label: 'threads per block', min: 32, max: 1024, step: 16, value: K.threads, format: (v) => fI(v), onInput: (v) => { K.threads = v; changed(); } });
    ctl.regs = GG.ui.slider(iK, { label: 'registers per thread', min: 1, max: 255, step: 1, value: K.regs, format: (v) => String(v), onInput: (v) => { K.regs = v; changed(); } });
    ctl.smem = GG.ui.slider(iK, { label: 'shared memory per block', min: 0, max: 227, step: 1, value: K.smem, format: (v) => v + ' KB', onInput: (v) => { K.smem = v; changed(); } });
    ctl.dw = GG.ui.slider(iD, { label: 'max warps / SM', min: 16, max: 64, step: 16, value: D.warps, format: (v) => String(v), onInput: (v) => { D.warps = v; changed(); } });
    ctl.db = GG.ui.slider(iD, { label: 'max blocks / SM', min: 8, max: 32, step: 8, value: D.blocks, format: (v) => String(v), onInput: (v) => { D.blocks = v; changed(); } });
    ctl.dr = GG.ui.slider(iD, { label: '32-bit registers / SM', min: 16384, max: 65536, step: 16384, value: D.regs, format: (v) => fI(v), onInput: (v) => { D.regs = v; changed(); } });
    ctl.ds = GG.ui.slider(iD, { label: 'shared memory / SM', min: 16, max: 228, step: 4, value: D.smem, format: (v) => v + ' KB', onInput: (v) => { D.smem = v; changed(); } });
    GG.ui.seg(f.controls, {
      label: 'arithmetic', value: 'rules',
      options: [{ value: 'rules', label: 'hardware rules (CC 9.0)', title: 'NVIDIA\'s allocation rules, as in its occupancy calculator (beyond the glossary)' }, { value: 'glossary', label: 'glossary arithmetic', title: 'the glossary\'s plain division' }],
      onChange: (v) => { K.rules = v === 'rules'; changed(pr.cur); },
    });
    const PRE = [
      { label: 'glossary example', k: { threads: 32, regs: 8, smem: 12 } },
      { label: '256 threads, 32 regs, no smem', k: { threads: 256, regs: 32, smem: 0 } },
      { label: '256 threads, 128 regs', k: { threads: 256, regs: 128, smem: 0 } },
      { label: 'big-tile kernel: 128 threads, 200 KB', k: { threads: 128, regs: 168, smem: 200 } },
    ];
    const pr = presetRow(f.controls, 'examples', PRE, (it, k) => {
      pr.cur = k;
      Object.assign(K, it.k); Object.assign(D, { warps: 64, blocks: 32, regs: 65536, smem: 228 });
      ctl.threads.set(K.threads); ctl.regs.set(K.regs); ctl.smem.set(K.smem);
      ctl.dw.set(64); ctl.db.set(32); ctl.dr.set(65536); ctl.ds.set(228);
      changed(k);
    });
    const sB = stat(f, 'blocks / SM'), sW = stat(f, 'active warps / SM', 'core'), sO = stat(f, 'theoretical occupancy', 'core'), sL = stat(f, 'limited by', 'control');
    const sX = stat(f, 'other arithmetic');
    const NM = { warps: 'warp slots', regs: 'registers', blocks: 'block limit', smem: 'shared memory' };
    function changed(k) {
      pr.cur = k == null ? -1 : k;
      pr.mark(pr.cur);
      RS = occCalc(D, K);
      const RX = occCalc(D, Object.assign({}, K, { rules: !K.rules }));
      view.redraw();
      const r = RS;
      const lim = (v) => (v === Infinity ? '∞' : fI(v));
      const blk = (v) => `${lim(v)} ${v === 1 ? 'block' : 'blocks'}`;
      const cmp = (a, b) => (a > b ? '>' : a < b ? '<' : '=');
      lines.innerHTML =
        `<span class="d">warps:  </span>${fI(D.warps)} ÷ ${r.wpb} warp${r.wpb === 1 ? '' : 's'}/block <span class="d">(${fI(K.threads)} threads ÷ 32${K.threads % 32 ? ', rounded up' : ''})</span> = <span class="${r.bind.includes('warps') ? 'c' : 'v'}">${blk(r.L.warps)}</span>\n` +
        (K.rules
          ? `<span class="d">regs:   </span>${K.regs} regs × 32 threads = ${fI(K.regs * 32)} per warp${r.rpw !== K.regs * 32 ? `, rounded up to ${fI(r.rpw)}` : ''}; ${fI(r.slice)} per sub-partition ÷ ${fI(r.rpw)} = ${fI(r.perSlice)} warps × 4 = ${fI(4 * r.perSlice)} warps ÷ ${r.wpb} warp${r.wpb === 1 ? '' : 's'}/block = <span class="${r.bind.includes('regs') ? 'c' : 'v'}">${blk(r.L.regs)}</span>\n`
          : `<span class="d">regs:   </span>${fI(D.regs)} ÷ (${fI(K.threads)} threads × ${K.regs} regs) = ${fI(D.regs)} ÷ ${fI(r.regsPerBlock)} = <span class="${r.bind.includes('regs') ? 'c' : 'v'}">${blk(r.L.regs)}</span>\n`) +
        `<span class="d">blocks: </span>limit = <span class="${r.bind.includes('blocks') ? 'c' : 'v'}">${D.blocks} blocks</span>\n` +
        `<span class="d">smem:   </span>${r.smemPerBlock ? `${D.smem} KB ÷ ${K.rules ? `(${sig(K.smem, 4)} + 1 reserved) = ${D.smem} ÷ ` : ''}${sig(r.smemPerBlock, 4)} KB = <span class="${r.bind.includes('smem') ? 'c' : 'v'}">${blk(r.L.smem)}</span>` : '<span class="v">no shared memory used: no limit</span>'}\n` +
        `<span class="d">→       </span>min = <span class="k">${fI(r.blocks)} ${plural(r.blocks, 'block')}</span> × ${r.wpb} warp${r.wpb === 1 ? '' : 's'} = <span class="k">${fI(r.warps)} warps</span> ÷ ${D.warps} = <span class="k">${pct(r.occ, 1)}</span>`;
      sB.set(fI(r.blocks), r.blocks ? '' : 'danger'); sW.set(`${fI(r.warps)} / ${D.warps}`); sO.set(pct(r.occ, 1), r.blocks ? 'core' : 'danger');
      sL.set(r.blocks ? r.bind.map((x) => NM[x]).join(' + ') : 'cannot launch', r.blocks ? 'control' : 'danger');
      sX.set(`${K.rules ? 'glossary' : 'rules'}: ${RX.blocks ? `${fI(RX.blocks)} ${plural(RX.blocks, 'block')} · ${pct(RX.occ, 1)}` : 'cannot launch'}`);
      let why;
      if (!r.blocks) {
        if (r.L.warps < 1) why = `Not even one block fits: a block needs ${r.wpb} warps but this device's SM holds only ${D.warps}. That launch configuration is invalid for this device, and the launch is rejected.`;
        else if (r.L.regs < 1) why = K.rules
          ? `Not even one block fits: each warp needs ${fI(r.rpw)} registers, so the four ${fI(r.slice)}-register sub-partition slices hold ${fI(4 * r.perSlice)} warps between them, fewer than the block's ${r.wpb}. A launch like this fails ("too many resources requested for launch").`
          : `Not even one block fits: one block needs ${fI(r.regsPerBlock)} registers, more than the ${fI(D.regs)} in the register file. A launch like this fails ("too many resources requested for launch").`;
        else why = `Not even one block fits: one block needs ${sig(r.smemPerBlock, 4)} KB of shared memory, more than the ${D.smem} KB available. The launch is rejected (for dynamically allocated shared memory the runtime reports an invalid argument; statically declared shared memory that is too large fails at compile time).`;
      } else {
        const glos = K.threads === 32 && K.regs === 8 && K.smem === 12 && D.warps === 64 && D.blocks === 32 && D.regs === 65536 && D.smem === 228;
        const diff = RX.blocks !== r.blocks ? ` With the ${K.rules ? 'glossary\'s plain arithmetic' : 'hardware rules'} it would be ${fI(RX.blocks)} ${plural(RX.blocks, 'block')}, ${pct(RX.occ, 1)}.` : '';
        why = glos && !K.rules
          ? 'The glossary\'s example. Warp slots would allow 64 blocks, registers 256, the block limit 32, but shared memory only <b>19</b>: 228 KB ÷ 12 KB. So 19 one-warp blocks run, 19 of 64 warp slots are used, and the theoretical occupancy is <b>29.7%</b>. The register file is 93% empty.'
          : glos
          ? 'The glossary\'s example, with the rules the hardware applies. The driver reserves 1 KB of shared memory for every block, so each block takes 13 KB and 228 ÷ 13 = <b>17</b> blocks fit: 17 of 64 warp slots, a theoretical occupancy of <b>26.6%</b>. The registers come out as in the glossary, because 8 registers × 32 threads = 256 per warp is exactly one allocation unit. Switch to the glossary\'s arithmetic for its 19 blocks (29.7%).'
          : `${(() => { const t = r.bind.map((x) => NM[x]).join(' and '); return t.charAt(0).toUpperCase() + t.slice(1); })()} ${r.bind.length > 1 ? 'tie as the limit' : 'is the limit'}: <b>${fI(r.blocks)} ${plural(r.blocks, 'block')}</b> of ${r.wpb} ${plural(r.wpb, 'warp')} each fit, ${fI(r.warps)} of ${D.warps} warp slots, so theoretical occupancy is <b>${pct(r.occ, 1)}</b>.${r.occ < 0.1 ? ' Single-digit occupancy, like the Hopper and Blackwell GEMM kernels described below.' : ''}${K.threads % 32 ? ` ${fI(K.threads)} is not a multiple of 32, so the last warp of each block is partly empty but still takes a whole warp slot.` : ''}${diff}`;
      }
      f.setWhy(why);
    }
    changed(0);
  }

  /* Fig: toy model — performance vs occupancy */
  function ocToy(ctx, slot) {
    const f = mkFig(ctx, slot, {
      title: 'Enough warps, then too many: a toy model', hint: 'shape the kernel', wide: true,
      caption: 'A deliberately simple model, not a measurement. Latency hiding: by Little\'s Law, throughput grows in proportion to resident warps until there are enough to hide the latency, then stays flat (green, dashed). Resources per thread: with W warps resident, each thread can get at most 65,536 ÷ (32 × W) registers (and never more than 255); if that is less than the kernel wants, it must shrink its tiles or spill, and we assume throughput falls in proportion (blue, dashed). The product is the wide grey curve, drawn underneath so it stays visible where it runs along one of its two factors. Real kernels have more limits and smoother curves.',
    });
    const st = { need: 8, want: 168, W: 8 };
    const perf = (W) => {
      const hide = Math.min(1, W / st.need);
      const avail = Math.min(255, 65536 / (32 * W));
      const res = Math.min(1, avail / st.want);
      return { hide, res, p: hide * res, avail };
    };
    const view = rsvg(f.stage, 'Line chart of relative throughput against resident warps per SM, with a latency-hiding curve, a resources-per-thread curve, and their product.', (svg, w) => {
      const mob = MOB(w);
      const padL = mob ? 34 : 44, x0 = padL, x1 = w - 10, y0 = 24, H = mob ? 230 : 260, y1 = H - 32;
      const X = (W) => x0 + ((W - 1) / 63) * (x1 - x0);
      const Y = (v) => y1 - v * (y1 - y0);
      R(svg, x0, y0, x1 - x0, y1 - y0, 'fill:rgba(255,255,255,.015);stroke:var(--line)');
      [8, 16, 32, 48, 64].forEach((W) => { Ln(svg, X(W), y0, X(W), y1, 'stroke:var(--line)'); Tx(svg, X(W), y1 + 13, String(W), { fs: 9.5, anchor: W === 64 ? 'end' : 'middle', fill: 'var(--ink-3)' }); Tx(svg, X(W), y0 - 6, pct(W / 64, W === 8 ? 1 : 0), { fs: 9, anchor: W === 64 ? 'end' : 'middle', fill: 'var(--ink-3)' }); });
      if (!mob) Tx(svg, x0, y0 - 6, 'occupancy:', { fs: 9, fill: 'var(--ink-3)' });
      [0, 0.5, 1].forEach((v) => Tx(svg, x0 - 6, Y(v) + 3.5, String(v), { fs: 9.5, anchor: 'end', fill: 'var(--ink-3)' }));
      Tx(svg, (x0 + x1) / 2, H - 6, 'resident warps per SM', { fs: 10, anchor: 'middle', fill: 'var(--ink-3)' });
      const curve = (fn, style) => { let d = ''; for (let W = 1; W <= 64; W += 0.25) d += (d ? 'L' : 'M') + r2(X(W)) + ',' + r2(Y(fn(W))); Pa(svg, d, style); };
      // the product is drawn wide and underneath, so where it coincides with a factor both stay visible
      curve((W) => perf(W).p, 'fill:none;stroke:var(--ink);stroke-width:5;stroke-opacity:.5;stroke-linejoin:round');
      curve((W) => perf(W).hide, 'fill:none;stroke:var(--core);stroke-width:1.6;stroke-dasharray:5 5');
      curve((W) => perf(W).res, 'fill:none;stroke:var(--memory);stroke-width:1.6;stroke-dasharray:5 5;stroke-dashoffset:5');
      // best range
      let best = 0; for (let W = 1; W <= 64; W++) best = Math.max(best, perf(W).p);
      const good = []; for (let W = 1; W <= 64; W++) if (perf(W).p >= best - 1e-9) good.push(W);
      if (good.length) R(svg, X(good[0]) - 2, y0, Math.max(4, X(good[good.length - 1]) - X(good[0]) + 4), y1 - y0, 'fill:rgba(52,211,153,.07);stroke:none');
      // selected W
      const P = perf(st.W);
      Ln(svg, X(st.W), y0, X(st.W), y1, 'stroke:var(--accent);stroke-width:1.2');
      C(svg, X(st.W), Y(P.p), 5, 'fill:var(--accent);stroke:var(--bg);stroke-width:2');
      return H;
    });
    legend(f.stage, [['rgba(236,238,245,.6)', 'relative throughput (product, wide line)', 'line'], ['var(--core)', 'latency hidden', 'dline'], ['var(--memory)', 'registers per thread vs wanted', 'dline'], ['rgba(52,211,153,.5)', 'best range']]);
    const slN = GG.ui.slider(f.controls, { label: 'warps needed to hide latency', min: 1, max: 64, step: 1, value: st.need, format: (v) => String(v), onInput: (v) => { st.need = v; pr.mark(-1); update(); } });
    const slR = GG.ui.slider(f.controls, { label: 'registers each thread wants', min: 16, max: 255, step: 1, value: st.want, format: (v) => String(v), onInput: (v) => { st.want = v; pr.mark(-1); update(); } });
    const slW = GG.ui.slider(f.controls, { label: 'resident warps', min: 1, max: 64, step: 1, value: st.W, format: (v) => `${v} (${pct(v / 64, 1)})`, onInput: (v) => { st.W = v; update(); } });
    const pr = presetRow(f.controls, 'kernels', [
      { label: 'Tensor Core GEMM-like', need: 4, want: 255, W: 4 },
      { label: 'memory-streaming, few registers', need: 40, want: 32, W: 40 },
      { label: 'in between', need: 16, want: 96, W: 16 },
    ], (it, k) => { st.need = it.need; st.want = it.want; st.W = it.W; slN.set(it.need); slR.set(it.want); slW.set(it.W); pr.mark(k); update(); });
    const sP = stat(f, 'relative throughput'), sR = stat(f, 'registers / thread available', 'memory'), sB = stat(f, 'best occupancy', 'core');
    function update() {
      view.redraw();
      const P = perf(st.W);
      let best = 0; for (let W = 1; W <= 64; W++) best = Math.max(best, perf(W).p);
      const good = []; for (let W = 1; W <= 64; W++) if (perf(W).p >= best - 1e-9) good.push(W);
      const rng0 = good.length ? (good[0] === good[good.length - 1] ? pct(good[0] / 64, 1) : `${pct(good[0] / 64, 1)}–${pct(good[good.length - 1] / 64, 1)}`) : '—';
      sP.set(fx(P.p, 2)); sR.set(String(Math.floor(P.avail))); sB.set(rng0);
      let why = `With <b>${st.W} warps</b> resident (${pct(st.W / 64, 1)} occupancy), each thread can have up to ${Math.floor(P.avail)} registers. `;
      if (P.hide < 1) why += `That is too few warps to hide the latency (the kernel needs ${st.need}): eligible warps run out, issue efficiency drops, and throughput is ${fx(P.p, 2)} of its best. `;
      else if (P.res < 1) why += `Latency is already hidden, but the kernel wanted ${st.want} registers per thread and gets ${Math.floor(P.avail)}: more occupancy has cost it resources per thread, and throughput falls to ${fx(P.p, 2)}. `;
      else why += 'Enough warps to hide latency, and enough registers per thread: this is in the best range. ';
      why += `Best range for this kernel: <b>${rng0}</b> occupancy${good.length && good[good.length - 1] < 64 ? ', not 100%' : ''}.`;
      f.setWhy(why);
    }
    pr.mark(0);
    st.need = 4; st.want = 255; st.W = 4; slN.set(4); slR.set(255); slW.set(4);
    update();
  }

})();
