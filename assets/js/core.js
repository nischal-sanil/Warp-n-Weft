/* Warp & Weft — core runtime.
   Builds the page from window.GG_TERMS (glossary order) and the per-entry
   render functions that chapter files register with GG.entry(id, def).
   Chapter files and components only use the APIs defined here. */
(function () {
  'use strict';

  const GG = (window.GG = window.GG || {});
  GG.defs = GG.defs || {};
  GG.components = GG.components || {};
  GG.status = {};
  GG.reducedMotion = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  GG.SOURCE_BASE = 'https://modal.com/gpu-glossary/';

  const SECTIONS = {
    intro: { name: 'Start here', short: 'Start', color: 'var(--ch-intro)' },
    'device-hardware': { name: 'Device Hardware', short: 'Hardware', color: 'var(--ch-device-hardware)', part: 1 },
    'device-software': { name: 'Device Software', short: 'Device software', color: 'var(--ch-device-software)', part: 2 },
    'host-software': { name: 'Host Software', short: 'Host software', color: 'var(--ch-host-software)', part: 3 },
    perf: { name: 'Performance', short: 'Performance', color: 'var(--ch-perf)', part: 4 },
    outro: { name: 'Credits', short: 'Credits', color: 'var(--ch-intro)' },
  };
  GG.SECTIONS = SECTIONS;

  const bootHooks = [];
  GG.onBoot = (fn) => bootHooks.push(fn);
  /* Early hooks run as soon as the document is parsed (deferred libraries loaded), before entry bodies
     finish rendering: for things the reader sees first, like the hero. */
  const startHooks = [];
  GG.onStart = (fn) => startHooks.push(fn);
  GG.entry = (id, def) => { GG.defs[id] = def; };

  /* ───────────── DOM helpers ───────────── */
  const SVGNS = 'http://www.w3.org/2000/svg';

  GG.el = function (tag, attrs, ...children) {
    const el = document.createElement(tag);
    setAttrs(el, attrs);
    for (const c of children.flat()) {
      if (c == null || c === false) continue;
      el.append(c instanceof Node ? c : document.createTextNode(String(c)));
    }
    return el;
  };

  GG.svg = function (tag, attrs, parent) {
    const el = document.createElementNS(SVGNS, tag);
    setAttrs(el, attrs);
    if (parent) parent.appendChild(el);
    return el;
  };

  function setAttrs(el, attrs) {
    if (!attrs) return;
    for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.setAttribute('class', v);
      else if (k === 'text') el.textContent = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
  }

  GG.css = function (text) {
    const s = document.createElement('style');
    s.textContent = text;
    document.head.appendChild(s);
    return s;
  };

  GG.esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* Append an HTML string to parent and return a map of its [data-slot] elements. */
  GG.html = function (parent, html) {
    const tpl = document.createElement('template');
    tpl.innerHTML = html;
    const slots = {};
    tpl.content.querySelectorAll('[data-slot]').forEach((n) => { slots[n.getAttribute('data-slot')] = n; });
    parent.appendChild(tpl.content);
    return slots;
  };

  /* HTML string for a cross-link to another glossary entry. */
  GG.term = (id, text) => `<a data-term="${id}">${text == null ? GG.name(id) : text}</a>`;
  GG.name = (id) => (GG.byId[id] ? GG.byId[id].name : id);

  /* ───────────── formatting ───────────── */
  const nf = new Intl.NumberFormat('en-US');
  GG.fmt = {
    int: (n) => nf.format(Math.round(n)),
    fixed: (n, d = 1) => Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }),
    sig: (n, s = 3) => Number(Number(n).toPrecision(s)).toLocaleString('en-US', { maximumFractionDigits: 20 }),
    pct: (x, d = 0) => (x * 100).toFixed(d) + '%',
    si(n, unit = '', d = 2) {
      const units = [[1e18, 'E'], [1e15, 'P'], [1e12, 'T'], [1e9, 'G'], [1e6, 'M'], [1e3, 'k']];
      const a = Math.abs(n);
      for (const [v, p] of units) if (a >= v) return +(n / v).toFixed(d) + ' ' + p + unit;
      return +Number(n).toFixed(d) + ' ' + unit;
    },
    bytes(n, d = 1) {
      const u = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
      let i = 0;
      while (Math.abs(n) >= 1024 && i < u.length - 1) { n /= 1024; i++; }
      return +n.toFixed(d) + ' ' + u[i];
    },
  };

  /* ───────────── colours (for canvas / WebGL) ───────────── */
  let colorCache = null;
  GG.colors = function () {
    if (colorCache) return colorCache;
    const cs = getComputedStyle(document.documentElement);
    const names = ['bg', 'bg-2', 'surface', 'surface-2', 'surface-3', 'line', 'line-2', 'ink', 'ink-body', 'ink-2', 'ink-3', 'accent', 'accent-2', 'core', 'special', 'control', 'memory', 'host', 'danger'];
    colorCache = {};
    for (const n of names) colorCache[n.replace(/-(\w)/g, (_, c) => c.toUpperCase())] = cs.getPropertyValue('--' + n).trim();
    return colorCache;
  };
  GG.alpha = function (hex, a) {
    const h = hex.replace('#', '');
    const f = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    const n = parseInt(f, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  };

  /* ───────────── visibility, resize, animation ───────────── */
  const visible = new WeakMap();
  const visCallbacks = new WeakMap();
  const visObs = 'IntersectionObserver' in window
    ? new IntersectionObserver((items) => {
        for (const it of items) {
          visible.set(it.target, it.isIntersecting);
          const cbs = visCallbacks.get(it.target);
          if (cbs) cbs.slice().forEach((cb) => cb(it.isIntersecting));
        }
      }, { rootMargin: '120px 0px' })
    : null;

  function watch(el, cb) {
    if (!visObs) { cb(true); visible.set(el, true); return; }
    if (!visCallbacks.has(el)) { visCallbacks.set(el, []); visObs.observe(el); }
    if (cb) visCallbacks.get(el).push(cb);
  }
  GG.isVisible = (el) => (visObs ? !!visible.get(el) : true);

  /* Call cb(true/false) whenever el enters or leaves the viewport. once:true fires on first entry only. */
  GG.onVisible = function (el, cb, opts = {}) {
    let done = false;
    watch(el, (v) => {
      if (opts.once) { if (v && !done) { done = true; cb(true); } }
      else cb(v);
    });
  };

  GG.resize = function (el, cb) {
    if (!('ResizeObserver' in window)) { window.addEventListener('resize', () => cb(el.getBoundingClientRect())); cb(el.getBoundingClientRect()); return; }
    const ro = new ResizeObserver((items) => { for (const it of items) cb(it.contentRect); });
    ro.observe(el);
    return ro;
  };

  /* One shared rAF loop. GG.anim(el, tick) runs tick(t, dt) only while el is on
     screen and the tab is visible. With prefers-reduced-motion, animations do not
     autostart; call ctrl.start() from a user action (a Play button) instead. */
  const anims = new Set();
  let rafId = 0, lastT = 0;
  function loop(t) {
    rafId = 0;
    const dt = lastT ? Math.min(0.1, (t - lastT) / 1000) : 0.016;
    lastT = t;
    let any = false;
    for (const a of anims) {
      if (!a.running) continue;
      if (document.hidden || !GG.isVisible(a.el)) continue;
      any = true;
      a.time += dt;
      try { a.tick(a.time, dt); } catch (e) { console.error('[GG.anim]', e); a.running = false; }
    }
    // keep looping only while some running animation is on screen; watch() kicks the loop when one scrolls back in
    if (any) rafId = requestAnimationFrame(loop);
    else lastT = 0;
  }
  function kick() { if (!rafId) { lastT = 0; rafId = requestAnimationFrame(loop); } }
  document.addEventListener('visibilitychange', kick);

  GG.anim = function (el, tick, opts = {}) {
    const a = { el, tick, running: false, time: 0 };
    watch(el, (v) => { if (v) kick(); });
    anims.add(a);
    const ctrl = {
      start() { a.running = true; kick(); return ctrl; },
      stop() { a.running = false; return ctrl; },
      toggle() { a.running ? ctrl.stop() : ctrl.start(); return a.running; },
      reset() { a.time = 0; return ctrl; },
      dispose() { a.running = false; anims.delete(a); return ctrl; },
      get running() { return a.running; },
      get time() { return a.time; },
    };
    const auto = opts.autostart !== false && !GG.reducedMotion;
    if (auto) ctrl.start();
    return ctrl;
  };

  /* HiDPI canvas that tracks its container width. Returns {canvas, ctx, w, h, onResize(fn)}. */
  GG.canvas = function (parent, opts = {}) {
    const canvas = document.createElement('canvas');
    if (opts.label) { canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', opts.label); }
    canvas.style.width = '100%';
    parent.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const api = { canvas, ctx, w: 0, h: 0, dpr: 1, _cbs: [] };
    api.onResize = (fn) => { api._cbs.push(fn); if (api.w) fn(api.w, api.h); return api; };
    function fit(width) {
      const w = Math.max(10, Math.round(width));
      const h = Math.round(opts.height ? (typeof opts.height === 'function' ? opts.height(w) : opts.height) : w / (opts.aspect || 2));
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (w === api.w && h === api.h && dpr === api.dpr) return;
      api.w = w; api.h = h; api.dpr = dpr;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      api._cbs.forEach((fn) => fn(w, h));
    }
    GG.resize(parent, (r) => fit(r.width - (opts.inset || 0)));
    requestAnimationFrame(() => fit(parent.getBoundingClientRect().width - (opts.inset || 0)));
    return api;
  };

  /* ───────────── UI components ───────────── */
  const ui = (GG.ui = {});
  const TOUCH = !!(window.matchMedia && matchMedia('(hover: none)').matches);
  let uid = 0;
  GG.uid = (p = 'gg') => `${p}-${++uid}`;

  /* Figure panel. Returns {root, bar, stage, dock, controls, readouts, why, caption, setWhy(html)} */
  ui.figure = function (parent, opts = {}) {
    const root = GG.el('figure', { class: 'fig' + (opts.wide ? ' wide' : '') + (opts.class ? ' ' + opts.class : '') });
    const bar = GG.el('div', { class: 'fig-bar' });
    const num = GG.el('span', { class: 'fig-num' });
    bar.append(num);
    if (opts.titleHTML) bar.append(GG.el('span', { class: 'fig-title', html: opts.titleHTML }));
    else if (opts.title) bar.append(GG.el('span', { class: 'fig-title', text: opts.title }));
    if (opts.hint) {
      let hint = opts.hint;
      if (TOUCH && !/\btap/i.test(hint)) hint = hint.replace(/\bhover(ing)?\b/gi, (m) => (m[0] === 'H' ? 'Tap' : 'tap'));
      bar.append(GG.el('span', { class: 'fig-hint', text: hint }));
    }
    const stage = GG.el('div', { class: 'fig-stage' });
    const dock = GG.el('div', { class: 'fig-dock' });
    const controls = GG.el('div', { class: 'fig-controls' });
    const readouts = GG.el('div', { class: 'fig-readouts' });
    dock.append(controls, readouts);
    const why = GG.el('p', { class: 'fig-why', 'aria-live': 'polite' });
    const caption = GG.el('figcaption');
    if (opts.caption) caption.innerHTML = opts.caption;
    root.append(bar, stage, dock, why, caption);
    if (opts.controlsFirst) root.insertBefore(dock, stage);
    (parent || document.body).appendChild(root);
    // figures are numbered within their entry once at the end of boot; figures created later renumber their entry
    if (GG.booted) requestAnimationFrame(() => numberFigures(root.closest('.entry')));
    return { root, bar, stage, dock, controls, readouts, why, caption, setWhy: (h) => { why.innerHTML = h; } };
  };

  function numberFigures(art) {
    if (!art) return;
    art.querySelectorAll('figure.fig').forEach((f, i) => { const n = f.querySelector(':scope > .fig-bar > .fig-num'); if (n) n.textContent = 'Fig. ' + (i + 1); });
  }
  GG.numberFigures = numberFigures;

  /* Segmented control. options: [{value, label, title}] */
  ui.seg = function (parent, opts) {
    const wrap = GG.el('div', { class: 'ctl' });
    if (opts.label) wrap.append(GG.el('span', { class: 'ctl-lab', text: opts.label }));
    const seg = GG.el('div', { class: 'seg', role: 'group', 'aria-label': opts.label || 'Options', 'data-keys': '' });
    seg.addEventListener('keydown', (e) => {
      const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      if (!(e.key in keys) && e.key !== 'Home' && e.key !== 'End') return;
      const live = btns.filter(([, b]) => !b.disabled && b.getAttribute('aria-disabled') !== 'true');
      if (!live.length) return;
      let k = live.findIndex(([, b]) => b === document.activeElement);
      if (k < 0) k = live.findIndex(([v]) => v === value);
      k = e.key === 'Home' ? 0 : e.key === 'End' ? live.length - 1 : (k + keys[e.key] + live.length) % live.length;
      e.preventDefault();
      live[k][1].focus();
      api.set(live[k][0], true);
    });
    let value = opts.value !== undefined ? opts.value : opts.options[0].value;
    const btns = opts.options.map((o) => {
      const b = GG.el('button', { type: 'button', title: o.title || null, 'data-value': String(o.value) }, o.label);
      b.addEventListener('click', () => api.set(o.value, true));
      seg.append(b);
      return [o.value, b];
    });
    wrap.append(seg);
    (parent || document.body).appendChild(wrap);
    const api = {
      el: wrap,
      get: () => value,
      set(v, fire) {
        value = v;
        btns.forEach(([bv, b]) => b.setAttribute('aria-pressed', String(bv === v)));
        if (fire && opts.onChange) opts.onChange(v);
      },
    };
    api.set(value, false);
    return api;
  };

  /* Range slider with live value readout. format(v) -> string. log:true maps the track logarithmically. */
  ui.slider = function (parent, opts) {
    const id = opts.id || GG.uid('sl');
    const wrap = GG.el('div', { class: 'ctl slider' });
    const out = GG.el('output', { for: id });
    const lab = GG.el('label', { class: 'ctl-lab', for: id }, GG.el('span', { text: opts.label || '' }), out);
    const min = opts.min, max = opts.max;
    const steps = opts.log ? 1000 : null;
    const input = GG.el('input', { type: 'range', id, min: opts.log ? 0 : min, max: opts.log ? steps : max, step: opts.log ? 1 : (opts.step || 1) });
    if (opts.ariaLabel) input.setAttribute('aria-label', opts.ariaLabel);
    wrap.append(lab, input);
    (parent || document.body).appendChild(wrap);
    const fmt = opts.format || ((v) => String(v));
    const toVal = (p) => {
      if (!opts.log) return +p;
      const v = Math.exp(Math.log(min) + (p / steps) * (Math.log(max) - Math.log(min)));
      return opts.step ? Math.max(min, Math.min(max, Math.round(v / opts.step) * opts.step)) : v;
    };
    const toPos = (v) => (opts.log ? Math.round(((Math.log(v) - Math.log(min)) / (Math.log(max) - Math.log(min))) * steps) : v);
    let value = opts.value;
    function paint() {
      const lo = +input.min, hi = +input.max;
      input.style.setProperty('--p', (((+input.value - lo) / (hi - lo)) * 100).toFixed(2) + '%');
      out.textContent = fmt(value);
      input.setAttribute('aria-valuetext', fmt(value));
    }
    input.addEventListener('input', () => { value = toVal(input.value); paint(); opts.onInput && opts.onInput(value); });
    input.addEventListener('change', () => { opts.onChange && opts.onChange(value); });
    const api = {
      el: wrap, input,
      get: () => value,
      set(v, fire) { value = v; input.value = toPos(v); paint(); if (fire && opts.onInput) opts.onInput(v); },
    };
    api.set(value, false);
    return api;
  };

  ui.toggle = function (parent, opts) {
    const id = opts.id || GG.uid('tg');
    const input = GG.el('input', { type: 'checkbox', id, role: 'switch' });
    input.checked = !!opts.value;
    const lab = GG.el('label', { class: 'switch', for: id }, input, GG.el('span', { text: opts.label }));
    input.addEventListener('change', () => opts.onChange && opts.onChange(input.checked));
    (parent || document.body).appendChild(lab);
    return { el: lab, input, get: () => input.checked, set(v, fire) { input.checked = !!v; if (fire && opts.onChange) opts.onChange(input.checked); } };
  };

  const ICONS = {
    play: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z"/></svg>',
    pause: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 2.5h3v11h-3zm6 0h3v11h-3z"/></svg>',
    prev: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10.5 2.5L4 8l6.5 5.5z"/></svg>',
    next: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 2.5L12 8l-6.5 5.5z"/></svg>',
    reset: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2a6 6 0 105.7 7.9l-1.9-.6A4 4 0 118 4v2.5L11.5 3 8 0z"/></svg>',
  };
  GG.ICONS = ICONS;

  ui.button = function (parent, opts) {
    const b = GG.el('button', { type: 'button', class: 'btn' + (opts.primary ? ' primary' : ''), title: opts.title || null, 'aria-label': opts.ariaLabel || null });
    b.innerHTML = (opts.icon ? ICONS[opts.icon] || '' : '') + (opts.label ? `<span>${GG.esc(opts.label)}</span>` : '');
    b.addEventListener('click', (e) => opts.onClick && opts.onClick(e));
    (parent || document.body).appendChild(b);
    b.setLabel = (label, icon) => { b.innerHTML = (icon ? ICONS[icon] || '' : '') + (label ? `<span>${GG.esc(label)}</span>` : ''); };
    return b;
  };

  /* Play/pause button bound to a GG.anim controller. */
  ui.playButton = function (parent, ctrl, opts = {}) {
    const b = ui.button(parent, { icon: ctrl.running ? 'pause' : 'play', label: ctrl.running ? 'Pause' : 'Play', onClick: () => { ctrl.toggle(); sync(); opts.onToggle && opts.onToggle(ctrl.running); } });
    function sync() { b.setLabel(ctrl.running ? 'Pause' : 'Play', ctrl.running ? 'pause' : 'play'); }
    b.sync = sync;
    return b;
  };

  ui.stat = function (parent, opts) {
    const el = GG.el('div', { class: 'stat', 'data-tone': opts.tone || null, title: opts.title || null });
    const i = opts.labelHTML ? GG.el('i', { html: opts.labelHTML }) : GG.el('i', { text: opts.label });
    const b = GG.el('b', { text: opts.value == null ? '—' : String(opts.value) });
    el.append(i, b);
    (parent || document.body).appendChild(el);
    return { el, set(v, tone) { b.textContent = String(v); if (tone !== undefined) { if (tone) el.setAttribute('data-tone', tone); else el.removeAttribute('data-tone'); } } };
  };

  /* Step-through control. steps: array of anything (length used). onStep(i). autoplay(ms) optional. */
  ui.stepper = function (parent, opts) {
    const n = opts.steps.length;
    const wrap = GG.el('div', { class: 'ctl' });
    if (opts.label) wrap.append(GG.el('span', { class: 'ctl-lab', text: opts.label }));
    const row = GG.el('div', { class: 'stepper', 'data-keys': '' });
    const prev = ui.button(row, { icon: 'prev', ariaLabel: 'Previous step', onClick: () => { if (i > 0) api.go(i - 1); } });
    const next = ui.button(row, { icon: 'next', ariaLabel: 'Next step', onClick: () => { if (i < n - 1) api.go(i + 1); } });
    row.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' && i < n - 1) { e.preventDefault(); api.go(i + 1); }
      else if (e.key === 'ArrowLeft' && i > 0) { e.preventDefault(); api.go(i - 1); }
    });
    let playBtn = null, timer = null;
    if (opts.autoplay) playBtn = ui.button(row, { icon: 'play', label: 'Play', onClick: () => (timer ? stop() : play()) });
    const dots = GG.el('div', { class: 'dots' });
    const dotBtns = opts.steps.map((s, k) => {
      const d = GG.el('button', { type: 'button', 'aria-label': 'Step ' + (k + 1) + (s && s.label ? ': ' + s.label : '') });
      d.addEventListener('click', () => api.go(k));
      dots.append(d);
      return d;
    });
    const out = GG.el('output');
    row.append(dots, out);
    wrap.append(row);
    (parent || document.body).appendChild(wrap);
    let i = -1;
    function play() {
      if (i >= n - 1) api.go(0);
      timer = setInterval(() => { if (i >= n - 1) { stop(); return; } api.go(i + 1); }, opts.autoplay);
      playBtn.setLabel('Pause', 'pause');
    }
    function stop() { clearInterval(timer); timer = null; if (playBtn) playBtn.setLabel('Play', 'play'); }
    const api = {
      el: wrap,
      get: () => i,
      go(k, silent) {
        k = Math.max(0, Math.min(n - 1, k));
        i = k;
        dotBtns.forEach((d, j) => { d.toggleAttribute('aria-current', j === k); if (j === k) d.setAttribute('aria-current', 'step'); d.classList.toggle('done', j < k); });
        prev.setAttribute('aria-disabled', String(k === 0)); next.setAttribute('aria-disabled', String(k === n - 1));
        out.textContent = `Step ${k + 1} / ${n}`;
        if (!silent && opts.onStep) opts.onStep(k);
      },
      play, stop,
    };
    api.go(opts.start || 0);
    return api;
  };

  /* Tabs. tabs: [{id, label, render(panel)}]. Panels render lazily on first show. */
  ui.tabs = function (parent, opts) {
    const wrap = GG.el('div', { class: 'tabs' });
    const bar = GG.el('div', { class: 'tabs-bar', role: 'tablist', 'data-keys': '' });
    bar.addEventListener('keydown', (e) => {
      const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!d) return;
      e.preventDefault();
      let k = btns.findIndex((x) => x.b === document.activeElement);
      k = (k + d + btns.length) % btns.length;
      btns[k].b.focus();
      api.show(btns[k].t.id);
    });
    const panels = GG.el('div');
    const made = {};
    const btns = opts.tabs.map((t) => {
      const id = GG.uid('tab');
      const b = GG.el('button', { type: 'button', role: 'tab', id, 'aria-selected': 'false' }, t.label);
      const p = GG.el('div', { class: 'tabs-panel', role: 'tabpanel', 'aria-labelledby': id, hidden: true });
      b.addEventListener('click', () => api.show(t.id));
      bar.append(b); panels.append(p);
      return { t, b, p };
    });
    wrap.append(bar, panels);
    (parent || document.body).appendChild(wrap);
    const api = {
      el: wrap,
      show(tid) {
        btns.forEach(({ t, b, p }) => {
          const on = t.id === tid;
          b.setAttribute('aria-selected', String(on));
          b.tabIndex = on ? 0 : -1;
          p.hidden = !on;
          if (on && !made[t.id]) { made[t.id] = true; t.render && t.render(p); }
        });
        opts.onChange && opts.onChange(tid);
      },
    };
    api.show(opts.value || opts.tabs[0].id);
    return api;
  };

  const NOTE_TITLES = { beyond: 'Beyond the glossary', check: 'Checked the math', history: 'History', intuition: 'Intuition', warn: 'Watch out', quote: 'From the glossary', aside: 'Aside' };
  /* Callout. type: beyond | check | history | intuition | warn | quote | aside */
  ui.note = function (parent, opts) {
    const el = GG.el('aside', { class: 'note', 'data-type': opts.type || 'aside' });
    el.innerHTML = `<div class="note-h">${GG.esc(opts.title || NOTE_TITLES[opts.type] || 'Note')}</div><div class="note-b">${opts.html || ''}</div>`;
    (parent || document.body).appendChild(el);
    return el;
  };
  /* The same callout as an HTML string, for use inside template literals. */
  GG.noteHTML = (type, html, title) => `<aside class="note" data-type="${type}"><div class="note-h">${GG.esc(title || NOTE_TITLES[type] || 'Note')}</div><div class="note-b">${html}</div></aside>`;

  /* Key-number strip. items: [{value, label, tone}] */
  ui.numbers = function (parent, items) {
    const el = GG.el('div', { class: 'numbers' });
    el.innerHTML = items.map((it) => `<div data-tone="${it.tone || ''}"><b>${it.value}</b><span>${it.label}</span></div>`).join('');
    (parent || document.body).appendChild(el);
    return el;
  };

  /* Further reading. items: [{href, label, note}] */
  ui.reading = function (parent, items, title) {
    const el = GG.el('div', { class: 'reading' });
    el.innerHTML = `<h4>${GG.esc(title || 'Sources & further reading')}</h4><ul>` +
      items.map((it) => `<li><span><a href="${it.href}">${it.label}</a>${it.note ? ' — ' + it.note : ''}</span></li>`).join('') + '</ul>';
    (parent || document.body).appendChild(el);
    return el;
  };

  /* Wrap a <table> HTML string in a horizontally scrollable container. */
  GG.tableHTML = (inner) => `<div class="table-wrap"><table>${inner}</table></div>`;

  /* ───────────── syntax highlighting ───────────── */
  const LANGS = {};
  const kw = (words) => new RegExp('\\b(?:' + words.split(' ').join('|') + ')\\b', 'y');
  LANGS.cpp = [
    [/\/\/.*/y, 'com'], [/\/\*.*?\*\//y, 'com'],
    [/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/y, 'str'],
    [/#\s*(?:include|define|pragma|if|ifdef|ifndef|endif|else)\b.*/y, 'dir'],
    [/<<<|>>>/y, 'attr'],
    [/\b__\w+__\b|\b__syncthreads\b|\b__restrict__\b/y, 'attr'],
    [kw('blockIdx blockDim threadIdx gridDim warpSize'), 'reg'],
    [kw('void int float double char bool unsigned long short size_t auto const constexpr static struct class typename template using namespace return if else for while do break continue sizeof new delete true false nullptr'), 'kw'],
    [/\b[A-Z][a-z][A-Za-z0-9_]*\b/y, 'type'],
    [/\b[a-zA-Z_]\w*(?=\s*(?:\(|<<<))/y, 'fn'],
    [/\b(?:0x[0-9a-fA-F]+|\d+\.?\d*(?:[eE][-+]?\d+)?f?)\b/y, 'num'],
    [/[{}()[\];,.<>:=+\-*/&|!%^~?]/y, 'pun'],
  ];
  LANGS.cuda = LANGS.cpp;
  LANGS.ptx = [
    [/\/\/.*/y, 'com'],
    [/\.[a-z][\w:]*/y, 'dir'],
    [/%[a-z]+\d*(?:<\d+>)?(?:\.[xyz])?/y, 'reg'],
    [/(?<=^\s*|;\s*|\}\s*)[a-z][a-z0-9_]*(?=[.\s])/y, 'op'],
    [/\b0[fFdD][0-9A-Fa-f]{8,16}\b|\b0x[0-9a-fA-F]+\b|\b\d+\b/y, 'num'],
    [/[{}(),;]/y, 'pun'],
  ];
  LANGS.sass = [
    [/\/\/.*|#.*/y, 'com'],
    [/\/\*[0-9a-fA-Fx]+\*\//y, 'com'],
    [/\[B[-0-9]{6}:R[-0-9]:W[-0-9]:[-Y]:S\d\d\]/y, 'dir'],
    [/@!?U?P[T\d]\b/y, 'attr'],
    [/\b(?:UR\d+|URZ|R\d+|RZ|P[T\d]|UP[T\d]|SR_[A-Z_.]+|c\[0x[0-9a-fA-F]+\]\[0x[0-9a-fA-F]+\])(?:\.reuse)?/y, 'reg'],
    [/\b[A-Z][A-Z0-9_]*(?:\.[A-Z0-9_]+)*(?=\s)/y, 'op'],
    [/\b0x[0-9a-fA-F]+\b|-?\b\d+\.?\d*\b/y, 'num'],
    [/[[\](),;]/y, 'pun'],
  ];
  LANGS.nasm = LANGS.sass;
  LANGS.python = [
    [/#.*/y, 'com'],
    [/"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/y, 'str'],
    [/@[\w.]+/y, 'dec'],
    [kw('import from as def return if elif else for in while not and or is None True False class with lambda yield pass break continue raise try except finally global'), 'kw'],
    [kw('int float str list dict tuple range len print'), 'type'],
    [/\b[a-zA-Z_]\w*(?=\s*\()/y, 'fn'],
    [/\b\d+\.?\d*\b/y, 'num'],
    [/[{}()[\],.:=+\-*/|<>]/y, 'pun'],
  ];
  LANGS.basic = [
    [/^\s*\d+/y, 'lnum'],
    [/REM\b.*/y, 'com'],
    [kw('INPUT DIM TILE LET OUTPUT END PRINT GOTO FOR TO NEXT IF THEN'), 'kw'],
    [kw('BID'), 'reg'],
    [/\b\d+\b/y, 'num'],
    [/[(),=+\-*/]/y, 'pun'],
  ];
  LANGS.shell = [[/#.*/y, 'com'], [/"(?:[^"\\]|\\.)*"/y, 'str'], [/(?<=^\s*)[\w.-]+/y, 'fn'], [/\s--?[\w-]+/y, 'dir']];
  LANGS.text = [];

  GG.highlightLine = function (line, lang) {
    const rules = LANGS[lang] || [];
    let i = 0, out = '', plain = '';
    const flush = () => { if (plain) { out += GG.esc(plain); plain = ''; } };
    outer: while (i < line.length) {
      for (const [re, cls] of rules) {
        re.lastIndex = i;
        let m;
        try { m = re.exec(line); } catch (e) { m = null; }
        if (m && m.index === i && m[0].length) {
          flush();
          out += `<span class="tk-${cls}">${GG.esc(m[0])}</span>`;
          i += m[0].length;
          continue outer;
        }
      }
      plain += line[i++];
    }
    flush();
    return out;
  };

  /* Code viewer. opts: {lang, code, caption, notes: {lineNo: html}, lineNumbers (default true), wide, copy}
     Returns {el, highlight(lines, tone), dim(lines), clear(), line(n), note(html)} */
  GG.code = function (parent, opts) {
    const lang = opts.lang || 'text';
    const src = String(opts.code).replace(/\n$/, '');
    const lines = src.split('\n');
    const el = GG.el('div', { class: 'code' + (opts.lineNumbers === false ? ' no-ln' : '') + (opts.wide ? ' wide' : '') });
    const head = GG.el('div', { class: 'code-h' });
    head.append(GG.el('span', { text: opts.langLabel || lang }));
    if (opts.caption) head.append(GG.el('span', { class: 'code-cap', html: opts.caption }));
    if (opts.copy !== false) {
      const b = ui.button(head, { label: 'Copy', onClick: () => {
        const done = () => { b.setLabel('Copied'); setTimeout(() => b.setLabel('Copy'), 1400); };
        try {
          navigator.clipboard.writeText(src).then(done, () => selectPre());
        } catch (e) { selectPre(); }
      } });
    }
    const pre = GG.el('pre', { tabindex: '0' });
    function selectPre() { const r = document.createRange(); r.selectNodeContents(pre); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
    const start = opts.startLine || 1;
    const lineEls = lines.map((ln, k) => {
      const d = GG.el('span', { class: 'ln', 'data-n': String(start + k) });
      d.innerHTML = GG.highlightLine(ln, lang) || ' ';
      pre.append(d);
      return d;
    });
    el.append(head, pre);
    let noteEl = null;
    if (opts.notes) {
      noteEl = GG.el('div', { class: 'code-note', 'aria-live': 'polite' });
      el.append(noteEl);
      const def = opts.noteDefault || 'Hover or tap a marked line for an explanation.';
      noteEl.innerHTML = def;
      for (const k in opts.notes) {
        const d = lineEls[+k - start];
        if (!d) continue;
        d.setAttribute('data-note', '');
        d.tabIndex = 0;
        const show = () => { noteEl.innerHTML = opts.notes[k]; lineEls.forEach((x) => x.classList.remove('hl')); d.classList.add('hl'); };
        d.addEventListener('mouseenter', show);
        d.addEventListener('focus', show);
        d.addEventListener('click', show);
      }
    }
    (parent || document.body).appendChild(el);
    const toList = (ls) => (Array.isArray(ls) ? ls : [ls]);
    return {
      el, pre, lines: lineEls,
      highlight(ls, tone) { const cls = tone ? 'hl-' + tone : 'hl'; toList(ls).forEach((n) => lineEls[n - start] && lineEls[n - start].classList.add(cls)); },
      dim(ls) { toList(ls).forEach((n) => lineEls[n - start] && lineEls[n - start].classList.add('dim')); },
      clear() { lineEls.forEach((d) => d.classList.remove('hl', 'hl-core', 'hl-memory', 'hl-special', 'hl-control', 'dim')); },
      line: (n) => lineEls[n - start],
      note(html) { if (noteEl) noteEl.innerHTML = html; },
    };
  };

  /* ───────────── boot: build the page ───────────── */
  GG.byId = {};
  GG.order = [];

  function sectionTerms(sec) { return GG.order.filter((t) => t.section === sec && t.kind === 'term'); }

  function mdInline(s) { return GG.esc(s).replace(/`([^`]+)`/g, '<code>$1</code>'); }

  function buildTOC() {
    const toc = document.getElementById('toc');
    if (!toc) return;
    let html = '<div class="toc-h">Contents</div>';
    const groups = [];
    for (const t of GG.order) {
      if (t.kind !== 'term') groups.push({ head: t, items: [] });
      else groups[groups.length - 1].items.push(t);
    }
    for (const g of groups) {
      const sec = SECTIONS[g.head.section] || SECTIONS.intro;
      html += `<div class="toc-sec" style="--c:${sec.color}"><a href="#${g.head.id}" data-toc="${g.head.id}"><i></i>${GG.esc(g.head.name)}${g.items.length ? `<em>${g.items.length}</em>` : ''}</a>`;
      if (g.items.length) {
        html += '<ol>' + g.items.map((t) => `<li><a href="#${t.id}" data-toc="${t.id}" style="--c:${sec.color}"><span>${GG.esc(t.name)}</span>${t.abbr ? `<small>${GG.esc(t.abbr)}</small>` : ''}</a></li>`).join('') + '</ol>';
      }
      html += '</div>';
    }
    toc.innerHTML = html;
  }

  function buildEntries() {
    const main = document.getElementById('main');
    const frag = document.createDocumentFragment();
    for (const t of GG.order) {
      const sec = SECTIONS[t.section] || SECTIONS.intro;
      const def = GG.defs[t.id] || {};
      const art = GG.el('article', { class: 'entry' + (t.kind === 'section' ? ' plate' : ''), id: t.id, 'data-section': t.section, style: `--c:${sec.color}`, tabindex: '-1' });
      const lede = def.lede || t.lede;
      let head;
      if (t.kind === 'section') {
        const terms = sectionTerms(t.section);
        head = `<header class="entry-head"><div class="plate-num">Part ${sec.part} of 4 · ${terms.length} terms</div>
          <h2 class="entry-title">${GG.esc(t.name)}</h2>
          <p class="entry-lede">${mdInline(lede)}</p></header>`;
      } else {
        const inSec = sectionTerms(t.section);
        const idx = inSec.indexOf(t);
        const eyebrow = t.kind === 'term'
          ? `<span class="chip-sec">${GG.esc(sec.name)}</span><span class="tnum">${String(idx + 1).padStart(2, '0')} / ${String(inSec.length).padStart(2, '0')}</span><span class="entry-q">${GG.esc(t.title)}</span>`
          : `<span class="chip-sec">${GG.esc(sec.name)}</span>`;
        head = `<header class="entry-head"><div class="entry-eyebrow">${eyebrow}</div>
          <h2 class="entry-title">${GG.esc(t.name)}${t.abbr ? `<abbr title="${GG.esc(t.name)}">${GG.esc(t.abbr)}</abbr>` : ''}</h2>
          <p class="entry-lede">${mdInline(lede)}</p></header>`;
      }
      art.innerHTML = head + '<div class="entry-body"></div><footer class="entry-foot"></footer>';
      frag.appendChild(art);
    }
    main.appendChild(frag);
  }

  /* Render one entry's body. Bodies are rendered in time slices after the shells exist, so the page
     stays responsive while 85 entries and ~300 figures are built. */
  function renderEntry(t) {
    const art = document.getElementById(t.id);
    const body = art.querySelector('.entry-body');
    const def = GG.defs[t.id];
    if (!def || typeof def.render !== 'function') {
      GG.status[t.id] = 'missing';
      body.innerHTML = '<div class="entry-missing">This entry has not been illustrated yet.</div>';
      return;
    }
    try {
      def.render(body, makeCtx(t, body));
      GG.status[t.id] = 'ok';
    } catch (e) {
      GG.status[t.id] = 'error: ' + (e && e.message);
      console.error('[GG] render failed for', t.id, e);
      body.insertAdjacentHTML('beforeend', `<div class="entry-error">Render error in “${GG.esc(t.id)}”: ${GG.esc(e && e.stack || e)}</div>`);
    }
    decorateLinks(body);
  }

  function makeCtx(t, body) {
    return {
      entry: t,
      body,
      figure: (parent, opts) => ui.figure(parent || body, opts),
      html: (parent, html) => GG.html(parent || body, html),
      code: (parent, opts) => GG.code(parent || body, opts),
      note: (parent, opts) => ui.note(parent || body, opts),
      numbers: (parent, items) => ui.numbers(parent || body, items),
      reading: (parent, items, title) => ui.reading(parent || body, items, title),
    };
  }

  /* Decorate links: data-term → internal hash link; http(s) → new tab with ↗ */
  function decorateLinks(root) {
    root.querySelectorAll('a[data-term]').forEach((a) => {
      const id = a.getAttribute('data-term');
      const t = GG.byId[id];
      if (!t) { console.warn('[GG] unknown term link:', id); a.classList.add('term'); return; }
      a.setAttribute('href', '#' + id);
      a.classList.add('term');
      a.style.setProperty('--c', (SECTIONS[t.section] || SECTIONS.intro).color);
    });
    root.querySelectorAll('a[href^="http"]').forEach((a) => {
      if (a.closest('.hero-ext-ok')) return;
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
      if (!a.classList.contains('pill') && !a.classList.contains('no-ext')) a.classList.add('ext');
    });
  }

  /* Public: decorate data-term / external links inside nodes created after boot. */
  GG.decorate = (root) => decorateLinks(root || document.body);

  function buildFooters() {
    const out = {}, inb = {};
    for (const t of GG.order) { out[t.id] = new Set(); inb[t.id] = new Set(); }
    for (const t of GG.order) {
      const art = document.getElementById(t.id);
      art.querySelectorAll('.entry-body a[data-term]').forEach((a) => {
        const to = a.getAttribute('data-term');
        if (to !== t.id && GG.byId[to]) { out[t.id].add(to); if (t.kind === 'term') inb[to].add(t.id); }
      });
    }
    GG.links = { out, in: inb };
    const pill = (id) => { const x = GG.byId[id]; const c = (SECTIONS[x.section] || SECTIONS.intro).color; return `<a class="pill" href="#${id}" data-term-pill="${id}" style="--c:${c}">${GG.esc(x.name)}</a>`; };
    const orderIdx = (id) => GG.order.indexOf(GG.byId[id]);
    GG.order.forEach((t, k) => {
      const foot = document.getElementById(t.id).querySelector('.entry-foot');
      let html = '';
      const o = [...out[t.id]].sort((a, b) => orderIdx(a) - orderIdx(b));
      const i = [...inb[t.id]].sort((a, b) => orderIdx(a) - orderIdx(b));
      const row = (label, ids) => {
        const MAX = 10;
        if (ids.length <= MAX + 2) return `<div class="foot-row"><span>${label}</span>${ids.map(pill).join('')}</div>`;
        return `<div class="foot-row foot-more"><span>${label}</span>${ids.slice(0, MAX).map(pill).join('')}<span class="foot-rest" hidden>${ids.slice(MAX).map(pill).join('')}</span><button type="button" class="pill foot-all" aria-expanded="false">Show all ${ids.length}</button></div>`;
      };
      if (o.length) html += row('Links to', o);
      if (i.length) html += row('Linked from', i);
      const prev = GG.order[k - 1], next = GG.order[k + 1];
      if (t.path) html += `<div class="foot-row"><span>Original</span><a class="foot-src ext" href="${GG.SOURCE_BASE}${t.path}" target="_blank" rel="noopener noreferrer">modal.com/gpu-glossary/${GG.esc(t.path)}</a></div>`;
      html += `<div class="foot-nav">${prev ? `<a href="#${prev.id}" data-nav="prev">← <span>Previous</span> <b>${GG.esc(prev.name)}</b></a>` : '<span></span>'}${next ? `<a href="#${next.id}" data-nav="next"><span>Next</span> <b>${GG.esc(next.name)}</b> →</a>` : '<span></span>'}</div>`;
      foot.innerHTML = html;
    });
    document.addEventListener('click', (e) => {
      const b = e.target.closest && e.target.closest('.foot-all');
      if (!b) return;
      const rest = b.parentElement.querySelector('.foot-rest');
      rest.hidden = !rest.hidden;
      b.setAttribute('aria-expanded', String(!rest.hidden));
      b.textContent = rest.hidden ? b.textContent.replace('Show fewer', 'Show all') : 'Show fewer';
      if (rest.hidden) b.textContent = 'Show all ' + b.parentElement.querySelectorAll('a.pill').length;
    });
  }

  /* hover popovers for term links */
  function setupPopover() {
    const pop = GG.el('div', { class: 'pop', role: 'tooltip', id: 'gg-pop' });
    document.body.appendChild(pop);
    let cur = null, hideT = 0;
    const canHover = matchMedia('(hover: hover)').matches;
    if (!canHover) return;
    function show(a) {
      const id = a.getAttribute('data-term') || a.getAttribute('data-term-pill');
      const t = GG.byId[id];
      if (!t) return;
      const def = GG.defs[id] || {};
      const sec = SECTIONS[t.section] || SECTIONS.intro;
      pop.style.setProperty('--c', sec.color);
      pop.innerHTML = `<div class="pop-sec">${GG.esc(sec.name)}</div><div class="pop-t">${GG.esc(t.name)}${t.abbr ? `<small>${GG.esc(t.abbr)}</small>` : ''}</div><p>${mdInline(def.lede || t.lede)}</p><div class="pop-k">Click to jump · ← → to walk the glossary</div>`;
      const r = a.getBoundingClientRect();
      const pw = pop.offsetWidth || 340, ph = pop.offsetHeight || 140;
      let x = r.left + window.scrollX + r.width / 2 - pw / 2;
      x = Math.max(window.scrollX + 12, Math.min(x, window.scrollX + document.documentElement.clientWidth - pw - 12));
      let y = r.bottom + window.scrollY + 10;
      if (r.bottom + ph + 20 > window.innerHeight) y = r.top + window.scrollY - ph - 10;
      pop.style.left = x + 'px';
      pop.style.top = y + 'px';
      pop.classList.add('on');
      if (cur && cur !== a) cur.removeAttribute('aria-describedby');
      a.setAttribute('aria-describedby', 'gg-pop');
      cur = a;
    }
    function hide() { pop.classList.remove('on'); if (cur) cur.removeAttribute('aria-describedby'); cur = null; }
    document.addEventListener('mouseover', (e) => {
      const a = e.target.closest && e.target.closest('a[data-term], a[data-term-pill]');
      const onPop = e.target.closest && e.target.closest('#gg-pop');
      if (onPop) { clearTimeout(hideT); return; }
      if (a && a !== cur) { clearTimeout(hideT); show(a); }
      else if (!a && cur) { clearTimeout(hideT); hideT = setTimeout(hide, 220); }
    });
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && cur) hide(); });
    document.addEventListener('focusin', (e) => { const a = e.target.closest && e.target.closest('a[data-term]'); if (a) show(a); });
    document.addEventListener('focusout', hide);
    window.addEventListener('scroll', () => { if (cur) hide(); }, { passive: true });
  }

  /* scrollspy, progress, keyboard nav */
  function currentIndex() {
    const y = (document.querySelector('.topbar') || { offsetHeight: 56 }).offsetHeight + 90;
    let lo = 0, hi = GG.order.length - 1, ans = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const top = document.getElementById(GG.order[mid].id).getBoundingClientRect().top;
      if (top <= y) { ans = mid; lo = mid + 1; } else hi = mid - 1;
    }
    return ans;
  }
  GG.currentIndex = currentIndex;

  function setupScroll() {
    const bar = document.querySelector('.progress i');
    const tocLinks = {};
    document.querySelectorAll('[data-toc]').forEach((a) => { tocLinks[a.getAttribute('data-toc')] = a; });
    const chLinks = document.querySelectorAll('.topbar-ch a');
    let ticking = false, lastIdx = -2;
    const seen = new Set();
    function update() {
      ticking = false;
      const h = document.documentElement.scrollHeight - innerHeight;
      if (bar) bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0).toFixed(2) + '%';
      const k = currentIndex();
      if (k === lastIdx) return;
      lastIdx = k;
      if (k < 0 && !navigating && location.hash) history.replaceState(null, '', location.pathname + location.search);
      Object.values(tocLinks).forEach((a) => a.classList.remove('on'));
      if (k >= 0) {
        const t = GG.order[k];
        seen.add(t.id);
        if (!navigating && location.hash !== '#' + t.id) history.replaceState(null, '', '#' + t.id);
        seen.forEach((id) => tocLinks[id] && tocLinks[id].classList.add('seen'));
        const a = tocLinks[t.id];
        if (a) {
          a.classList.add('on');
          const toc = document.getElementById('toc');
          if (toc && getComputedStyle(toc).position === 'sticky') {
            const ar = a.getBoundingClientRect(), tr = toc.getBoundingClientRect();
            if (ar.top < tr.top + 40 || ar.bottom > tr.bottom - 40) toc.scrollTop += ar.top - tr.top - tr.height / 2;
          }
        }
        chLinks.forEach((c) => c.classList.toggle('on', c.getAttribute('data-sec') === t.section));
      }
    }
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener('resize', () => { lastIdx = -2; update(); });
    update();
  }

  let navigating = false, navTimer = 0, pendingIdx = -1;
  GG.goTo = function (id, opts = {}) {
    const el = document.getElementById(id);
    if (!el) return;
    if (location.hash !== '#' + id) history.pushState(null, '', '#' + id);
    navigating = true;
    const k = GG.order.findIndex((t) => t.id === id);
    pendingIdx = k;
    clearTimeout(navTimer);
    navTimer = setTimeout(() => { navigating = false; pendingIdx = -1; }, GG.reducedMotion ? 120 : 900);
    el.scrollIntoView({ behavior: GG.reducedMotion || opts.instant ? 'instant' : 'smooth', block: 'start' });
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  };

  function isTyping(e) {
    const t = e.target;
    if (!t || !t.closest) return false;
    if (t.closest('input, textarea, select, pre, button, [contenteditable], [role="slider"], [role="tab"], [data-keys], dialog[open]')) return true;
    // focus inside a figure or the 3D hero: arrow keys belong to that widget
    return !!t.closest('figure.fig, .hero');
  }

  function setupKeys() {
    addEventListener('keydown', (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Escape') { if (document.body.classList.contains('toc-open') && GG.setDrawer) GG.setDrawer(false, true); return; }
      if (isTyping(e)) return;
      if (e.key === '/' || (e.key === 'k' && !e.shiftKey)) { e.preventDefault(); openSearch(); return; }
      if (e.key === '?') { e.preventDefault(); openDialog('help-dlg'); return; }
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const k = pendingIdx >= 0 ? pendingIdx : currentIndex();
        let target;
        if (e.key === 'ArrowRight') target = Math.min(GG.order.length - 1, k + 1);
        else if (k < 0) target = -1;
        else {
          // mid-way through an entry: go back to its start; at its start: go to the previous entry
          const top = document.getElementById(GG.order[k].id).getBoundingClientRect().top;
          target = pendingIdx < 0 && top < -60 ? k : k - 1;
        }
        if (target >= 0) { e.preventDefault(); GG.goTo(GG.order[target].id); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); scrollTo({ top: 0, behavior: GG.reducedMotion ? 'auto' : 'smooth' }); }
      }
    });
  }

  function openDialog(id) {
    const d = document.getElementById(id);
    if (!d) return;
    if (typeof d.showModal === 'function') { if (!d.open) d.showModal(); } else d.setAttribute('open', '');
  }
  GG.openDialog = openDialog;

  function setupDialogs() {
    document.querySelectorAll('dialog.dlg').forEach((d) => {
      d.addEventListener('click', (e) => { if (e.target === d) d.close(); });
      d.querySelectorAll('.dlg-x').forEach((b) => b.addEventListener('click', () => d.close()));
    });
    const sb = document.getElementById('search-btn');
    if (sb) sb.addEventListener('click', openSearch);
    const hb = document.getElementById('help-btn');
    if (hb) hb.addEventListener('click', () => openDialog('help-dlg'));
    const tb = document.getElementById('toc-btn');
    const toc = document.getElementById('toc');
    const drawerMode = matchMedia('(max-width: 1024px)');
    function setDrawer(open, returnFocus) {
      document.body.classList.toggle('toc-open', open);
      if (tb) tb.setAttribute('aria-expanded', String(open));
      if (toc) toc.inert = drawerMode.matches && !open;
      if (open && toc) {
        const cur = toc.querySelector('a.on') || toc.querySelector('a');
        if (cur) { cur.scrollIntoView({ block: 'center' }); cur.focus({ preventScroll: true }); }
      } else if (returnFocus && tb) tb.focus();
    }
    GG.setDrawer = setDrawer;
    if (tb) { tb.setAttribute('aria-controls', 'toc'); tb.setAttribute('aria-expanded', 'false'); tb.addEventListener('click', () => setDrawer(!document.body.classList.contains('toc-open'))); }
    if (toc) {
      toc.inert = drawerMode.matches;
      drawerMode.addEventListener('change', () => { toc.inert = drawerMode.matches && !document.body.classList.contains('toc-open'); });
      toc.addEventListener('click', (e) => { if (e.target.closest('a') && drawerMode.matches) setDrawer(false); });
      toc.addEventListener('keydown', (e) => {
        if (!document.body.classList.contains('toc-open')) return;
        if (e.key === 'Escape') { e.preventDefault(); setDrawer(false, true); return; }
        if (e.key !== 'Tab') return;
        const links = [...toc.querySelectorAll('a')];
        const first = links[0], last = links[links.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      });
    }
    document.addEventListener('click', (e) => {
      if (document.body.classList.contains('toc-open') && !e.target.closest('#toc') && !e.target.closest('#toc-btn')) setDrawer(false);
    });
  }

  let searchSel = 0;
  let searchIndex = null;
  function buildSearchIndex() {
    searchIndex = GG.order.map((t) => {
      const art = document.getElementById(t.id);
      const body = art ? art.querySelector('.entry-body') : null;
      const heads = body ? [...body.querySelectorAll('h3, h4')].map((h) => {
        if (!h.id) h.id = t.id + '--' + h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
        return { id: h.id, text: h.textContent.trim() };
      }) : [];
      const text = body ? body.innerText.replace(/\s+/g, ' ') : '';
      return { t, heads, text, low: text.toLowerCase() };
    });
  }
  function openSearch() {
    const d = document.getElementById('search-dlg');
    const input = document.getElementById('search-in');
    if (!d || !input) return;
    openDialog('search-dlg');
    input.value = '';
    renderSearch('');
    setTimeout(() => input.focus(), 30);
  }
  GG.openSearch = openSearch;

  function renderSearch(q) {
    const list = document.getElementById('search-list');
    const input = document.getElementById('search-in');
    const count = document.getElementById('search-count');
    q = q.trim().toLowerCase();
    const reEsc = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const wordRe = q ? new RegExp('(^|[^a-z0-9])' + reEsc, 'i') : null;
    const hits = [];
    for (const t of GG.order) {
      const lede = (GG.defs[t.id] && GG.defs[t.id].lede) || t.lede;
      if (!q) { hits.push({ s: 1, t, target: t.id, snip: mdInline(lede) }); continue; }
      const n = t.name.toLowerCase(), a = (t.abbr || '').toLowerCase();
      let s = 0, target = t.id, snip = mdInline(lede);
      if (n === q || a === q) s = 100;
      else if (n.startsWith(q) || a.startsWith(q)) s = 70;
      else if (wordRe.test(n) || wordRe.test(a)) s = 55;
      else if (n.includes(q) || t.id.includes(q)) s = 35;
      else if (wordRe.test(t.title) || wordRe.test(lede)) s = 25;
      const ix = searchIndex && searchIndex.find((x) => x.t === t);
      if (ix) {
        const h = ix.heads.find((x) => wordRe.test(x.text));
        if (h && s < 30) { s = 30; target = h.id; snip = 'Section: <b>' + GG.esc(h.text) + '</b>'; }
        if (!s) {
          const m = ix.low.search(wordRe);
          if (m >= 0) {
            const hitsN = ix.low.split(q).length - 1;
            s = 6 + Math.min(10, hitsN);
            const i0 = Math.max(0, m - 50);
            snip = (i0 ? '…' : '') + GG.esc(ix.text.slice(i0, m + q.length + 80)).replace(new RegExp(reEsc, 'i'), (x) => '<mark>' + x + '</mark>') + '…';
          }
        }
      }
      if (s) hits.push({ s, t, target, snip });
    }
    hits.sort((x, y) => y.s - x.s);
    const res = hits.slice(0, 40);
    searchSel = 0;
    list.innerHTML = res.length
      ? res.map((h, k) => { const sec = SECTIONS[h.t.section] || SECTIONS.intro; return `<li role="presentation"><a href="#${h.target}" id="sr-${k}" role="option" data-sr="${h.target}" style="--c:${sec.color}" aria-selected="${k === 0}"><i></i><b>${GG.esc(h.t.name)}${h.t.abbr ? `<small>${GG.esc(h.t.abbr)}</small>` : ''}</b><span>${h.snip}</span></a></li>`; }).join('')
      : `<li role="presentation" class="c-dim" style="padding:10px">Nothing on the site matches “${GG.esc(q)}”.</li>`;
    if (input) { input.setAttribute('aria-expanded', String(!!res.length)); if (res.length) input.setAttribute('aria-activedescendant', 'sr-0'); else input.removeAttribute('aria-activedescendant'); }
    if (count) count.textContent = q ? `${res.length} result${res.length === 1 ? '' : 's'}` : '';
  }

  function setupSearch() {
    const input = document.getElementById('search-in');
    const list = document.getElementById('search-list');
    const d = document.getElementById('search-dlg');
    if (!input) return;
    input.addEventListener('input', () => renderSearch(input.value));
    input.addEventListener('keydown', (e) => {
      const items = [...list.querySelectorAll('a[data-sr]')];
      if (!items.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        searchSel = (searchSel + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        items.forEach((a, k) => a.setAttribute('aria-selected', String(k === searchSel)));
        items[searchSel].scrollIntoView({ block: 'nearest' });
        input.setAttribute('aria-activedescendant', items[searchSel].id);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        d.close();
        GG.goTo(items[searchSel].getAttribute('data-sr'));
      }
    });
    list.addEventListener('mousemove', (e) => {
      const a = e.target.closest('a[data-sr]');
      if (!a) return;
      const items = [...list.querySelectorAll('a[data-sr]')];
      const k = items.indexOf(a);
      if (k === searchSel) return;
      searchSel = k;
      items.forEach((x, j) => x.setAttribute('aria-selected', String(j === k)));
      input.setAttribute('aria-activedescendant', a.id);
    });
    list.addEventListener('click', (e) => {
      const a = e.target.closest('a[data-sr]');
      if (!a) return;
      e.preventDefault();
      d.close();
      GG.goTo(a.getAttribute('data-sr'));
    });
  }

  function setupInternalLinks() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const id = a.getAttribute('href').slice(1);
      if (!id || !document.getElementById(id)) return;
      e.preventDefault();
      GG.goTo(id);
    });
  }

  /* If a chapter's first paragraph repeats the header lede, keep one: an exact repeat is dropped; a paragraph
     that starts with the lede and continues takes over the lede's styling and the header copy is hidden. */
  function dedupeLedes() {
    const norm = (x) => x.replace(/[\s\u00a0]+/g, ' ').replace(/[“”"’']/g, '').trim().toLowerCase();
    document.querySelectorAll('article.entry').forEach((art) => {
      const lede = art.querySelector('.entry-head .entry-lede');
      const first = art.querySelector('.entry-body > p:first-child, .entry-body > div:first-child > p:first-child');
      if (!lede || !first) return;
      const a = norm(lede.textContent), b = norm(first.textContent);
      let same = !!a && b.startsWith(a.replace(/\.$/, ''));
      if (!same && a) {
        // a reordered restatement: compare the lede's words with the body's first sentence
        const words = (x) => new Set(x.replace(/[()[\],.;:]/g, ' ').split(' ').filter((w) => w.length > 2));
        const la = words(a), lb = words((b.match(/^.*?[.!?](\s|$)/) || [b])[0]);
        let common = 0; la.forEach((w) => { if (lb.has(w)) common++; });
        same = la.size >= 4 && common / Math.max(la.size, lb.size) >= 0.85;
      }
      if (!same) return;
      // keep the body paragraph (it carries the glossary links) and give it the lede's styling
      lede.hidden = true;
      first.classList.add('entry-lede', 'entry-lede-body');
    });
  }

  /* Wide tables on phones: a fading right edge and a hint while more columns are hidden. */
  function setupTableCues() {
    document.querySelectorAll('.table-wrap').forEach((w) => {
      let hint = null;
      const sync = () => {
        const more = w.scrollWidth > w.clientWidth + 2;
        w.classList.toggle('has-more', more && w.scrollLeft < w.scrollWidth - w.clientWidth - 2);
        if (more && !hint) { hint = GG.el('div', { class: 'table-hint', 'aria-hidden': 'true', text: 'Scroll sideways for more columns →' }); w.before(hint); }
        if (hint) hint.hidden = !more;
      };
      w.addEventListener('scroll', sync, { passive: true });
      GG.resize(w, sync);
    });
  }

  let readyResolve;
  /* Resolves once every entry is rendered, links and footers are built and boot hooks have run. */
  GG.ready = new Promise((r) => { readyResolve = r; });

  GG.boot = function () {
    const terms = window.GG_TERMS || [];
    GG.order = terms;
    terms.forEach((t) => { GG.byId[t.id] = t; });
    buildTOC();
    buildEntries();
    setupPopover();
    setupDialogs();
    setupSearch();
    setupKeys();
    setupInternalLinks();

    // deep link (or a reload, since the hash follows the reader): render the target first and jump to it
    const h = decodeURIComponent(location.hash.slice(1));
    const hashEntry = h && document.getElementById(h) ? (document.getElementById(h).closest('article.entry') || null) : null;
    const queue = GG.order.slice();
    if (hashEntry) {
      const k = queue.findIndex((t) => t.id === hashEntry.id);
      if (k > 0) queue.unshift(queue.splice(k, 1)[0]);
    }
    const jump = () => { const el = h && document.getElementById(h); if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' }); };
    let userScrolled = false;
    const markUser = () => { userScrolled = true; };
    if (hashEntry) ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach((ev) => addEventListener(ev, markUser, { once: true, passive: true }));

    const slice = () => {
      const t0 = performance.now();
      while (queue.length && performance.now() - t0 < 14) {
        const t = queue.shift();
        renderEntry(t);
        if (hashEntry && t.id === hashEntry.id) jump();
      }
      if (queue.length) { setTimeout(slice, 0); return; }
      const finish = () => {
        buildFooters();
        for (const fn of bootHooks) { try { fn(); } catch (e) { console.error('[GG] boot hook failed', e); } }
        decorateLinks(document.body);
        document.querySelectorAll('article.entry').forEach(numberFigures);
        dedupeLedes();
        setupTableCues();
        buildSearchIndex();
        setupScroll();
        GG.booted = true;
        if (hashEntry && !userScrolled) {
          jump();
          if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setTimeout(() => { if (!userScrolled) jump(); }, 50));
        }
        const failed = Object.entries(GG.status).filter(([, s]) => s !== 'ok');
        if (failed.length) console.info('[GG] entries not ok:', failed.map(([k, s]) => k + '=' + s).join(', '));
        readyResolve();
      };
      // deferred scripts (three.js for the hero) have run once the document is parsed
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', finish, { once: true });
      else finish();
    };
    const runStart = () => { for (const fn of startHooks) { try { fn(); } catch (e) { console.error('[GG] start hook failed', e); } } };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', runStart, { once: true });
    else setTimeout(runStart, 0);
    setTimeout(slice, 0);
  };
})();
