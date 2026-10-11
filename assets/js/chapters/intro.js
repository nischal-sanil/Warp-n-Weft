/* Warp & Weft — chapters/intro.js
   Entries: readme, the four chapter plates (device-hardware, device-software,
   host-software, perf) and contributors. CSS prefix: in-

   Maps and indexes use chip() links (data-in-term). A boot hook turns them into
   ordinary data-term links (hover previews, styling, navigation) after the shell
   has counted cross-links, so that an index of 79 terms does not add a
   "Linked from" pill to every entry's footer or distort the web graph. Links in
   prose use data-term directly and are counted as real cross-links. */
(function () {
  'use strict';

  /* ───────────────────────── shared helpers ───────────────────────── */
  const esc = GG.esc;
  const SECS = ['device-hardware', 'device-software', 'host-software', 'perf'];
  const SEC_LABEL = { 'device-hardware': 'Device Hardware', 'device-software': 'Device Software', 'host-software': 'Host Software', perf: 'Performance', intro: 'Start here', outro: 'Credits' };
  const SEC_SHORT = { 'device-hardware': 'Hardware', 'device-software': 'Device SW', 'host-software': 'Host SW', perf: 'Perf', intro: 'Start', outro: 'Credits' };
  const chKey = (sec) => (SECS.includes(sec) ? sec : 'intro');
  const chVar = (sec) => `var(--ch-${chKey(sec)})`;
  let hexCache = null;
  function chHex(sec) {
    if (!hexCache) {
      hexCache = {};
      const cs = getComputedStyle(document.documentElement);
      ['intro'].concat(SECS).forEach((k) => { hexCache[k] = cs.getPropertyValue('--ch-' + k).trim() || '#eceef6'; });
    }
    return hexCache[chKey(sec)];
  }
  const termsOf = (sec) => GG.order.filter((t) => t.section === sec && t.kind === 'term');
  const mdi = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');
  const ledeOf = (id) => { const d = GG.defs[id]; return (d && d.lede) || (GG.byId[id] ? GG.byId[id].lede : ''); };
  const SHORT = {
    'streaming-multiprocessor-architecture': 'SM Architecture', 'streaming-multiprocessor-utilization': 'SM Utilization',
    'graphics-processing-cluster': 'GPC', 'texture-processing-cluster': 'TPC', 'tensor-memory-accelerator': 'Tensor Memory Accelerator',
    nvcc: 'nvcc', nvrtc: 'nvrtc', cupti: 'CUPTI', nvml: 'NVML', 'nsight-systems': 'Nsight Systems',
    'parallel-thread-execution': 'PTX', 'streaming-assembler': 'SASS', 'nvidia-gpu-drivers': 'NVIDIA GPU Drivers',
  };
  const shortName = (id) => SHORT[id] || GG.name(id);
  const pctS = (x) => (x * 100 < 10 ? (x * 100).toFixed(1) : Math.round(x * 100)) + '%';

  /* The glossary's own cross-links, entry → the entries it links to, taken from the
     source Markdown (every ](/gpu-glossary/…) link). The README figures that describe
     "the glossary as hypertext" use these, not the links this site adds. */
  const SRC_LINKS = {
    readme: 'streaming-multiprocessor-architecture warp-scheduler compute-capability thread host-software cuda-c',
    'cuda-device-architecture': 'cuda-core gpu-ram streaming-multiprocessor tensor-core cuda-programming-model cuda-software-platform',
    'streaming-multiprocessor': 'cuda-core l1-data-cache tensor-core warp-scheduler cuda-programming-model streaming-assembler thread warp cuda-software-platform arithmetic-bandwidth latency-hiding',
    core: 'cuda-core register-file streaming-multiprocessor tensor-core warp-scheduler streaming-assembler',
    'special-function-unit': 'load-store-unit streaming-multiprocessor streaming-assembler cuda-c',
    'load-store-unit': 'gpu-ram l1-data-cache special-function-unit streaming-multiprocessor cuda-programming-model memory-hierarchy cuda-software-platform',
    'warp-scheduler': 'l1-data-cache register-file streaming-multiprocessor cooperative-thread-array registers shared-memory thread warp latency-hiding warp-execution-state',
    'cuda-core': 'core cuda-device-architecture streaming-multiprocessor streaming-multiprocessor-architecture tensor-core warp-scheduler registers warp',
    'tensor-core': 'core cuda-core register-file streaming-multiprocessor streaming-multiprocessor-architecture tensor-memory warp-scheduler parallel-thread-execution streaming-assembler thread warp cublas cuda-c cute-dsl cutlass nvcc arithmetic-bandwidth',
    'tensor-memory-accelerator': 'cuda-core gpu-ram l1-data-cache register-file streaming-multiprocessor streaming-multiprocessor-architecture tensor-memory global-memory registers shared-memory thread thread-block warp arithmetic-bandwidth register-pressure',
    'streaming-multiprocessor-architecture': 'streaming-multiprocessor streaming-assembler nvcc',
    'texture-processing-cluster': 'streaming-multiprocessor streaming-multiprocessor-architecture tensor-core cuda-programming-model memory-hierarchy parallel-thread-execution streaming-assembler thread-hierarchy',
    'graphics-processing-cluster': 'streaming-multiprocessor texture-processing-cluster compute-capability cuda-programming-model memory-hierarchy thread-block thread-hierarchy',
    'register-file': 'core l1-data-cache streaming-multiprocessor parallel-thread-execution registers streaming-assembler thread thread-block latency-hiding occupancy register-pressure',
    'l1-data-cache': 'cuda-core load-store-unit streaming-multiprocessor thread-block cuda-c',
    'tensor-memory': 'cuda-device-architecture l1-data-cache streaming-multiprocessor tensor-core tensor-memory-accelerator parallel-thread-execution registers shared-memory warp warpgroup',
    'gpu-ram': 'l1-data-cache register-file streaming-multiprocessor cuda-programming-model global-memory registers memory-bandwidth',
    'cuda-programming-model': 'device-hardware cuda-device-architecture l1-data-cache streaming-multiprocessor cooperative-thread-array memory-hierarchy parallel-thread-execution shared-memory streaming-assembler thread-block thread-block-grid thread-hierarchy cuda-c cuda-software-platform',
    'streaming-assembler': 'streaming-multiprocessor streaming-multiprocessor-architecture compute-capability cooperative-thread-array parallel-thread-execution cuda-c nvcc',
    'parallel-thread-execution': 'register-file streaming-multiprocessor streaming-multiprocessor-architecture compute-capability registers shared-memory streaming-assembler thread warp cuda-binary-utilities cuda-c nvcc nvidia-gpu-drivers',
    'compute-capability': 'streaming-multiprocessor streaming-multiprocessor-architecture parallel-thread-execution streaming-assembler nvcc',
    thread: 'core cuda-core gpu-ram streaming-multiprocessor warp-scheduler cuda-programming-model kernel parallel-thread-execution registers streaming-assembler thread-hierarchy warp',
    warp: 'gpu-ram streaming-multiprocessor warp-scheduler cooperative-thread-array cuda-programming-model global-memory thread thread-block thread-hierarchy perf issue-efficiency latency-hiding occupancy warp-divergence warp-execution-state',
    warpgroup: 'streaming-multiprocessor streaming-multiprocessor-architecture tensor-core warp-scheduler kernel parallel-thread-execution registers thread warp arithmetic-bandwidth',
    'cooperative-thread-array': 'l1-data-cache register-file streaming-multiprocessor cuda-programming-model global-memory parallel-thread-execution shared-memory streaming-assembler thread thread-block warp nvcc occupancy',
    kernel: 'cuda-core gpu-ram streaming-multiprocessor tensor-core cuda-programming-model global-memory memory-hierarchy registers shared-memory thread thread-block thread-block-grid thread-hierarchy cuda-c arithmetic-bandwidth arithmetic-intensity memory-bandwidth',
    'thread-block': 'streaming-multiprocessor cooperative-thread-array cuda-programming-model kernel parallel-thread-execution streaming-assembler thread thread-block-grid thread-hierarchy warp',
    'thread-block-grid': 'streaming-multiprocessor cuda-programming-model global-memory kernel memory-hierarchy thread thread-block',
    'thread-hierarchy': 'device-hardware core cuda-core streaming-multiprocessor warp-scheduler cooperative-thread-array cuda-programming-model memory-hierarchy parallel-thread-execution shared-memory streaming-assembler thread thread-block thread-block-grid',
    'memory-hierarchy': 'gpu-ram l1-data-cache register-file streaming-multiprocessor tensor-core cuda-programming-model global-memory kernel parallel-thread-execution shared-memory streaming-assembler thread thread-block thread-block-grid thread-hierarchy perf arithmetic-intensity',
    registers: 'gpu-ram register-file streaming-multiprocessor global-memory memory-hierarchy parallel-thread-execution streaming-assembler thread thread-block cuda-c occupancy',
    'shared-memory': 'cuda-core l1-data-cache streaming-multiprocessor tensor-core cuda-programming-model global-memory kernel memory-hierarchy thread thread-block thread-hierarchy',
    'global-memory': 'gpu-ram cooperative-thread-array cuda-programming-model kernel memory-hierarchy thread thread-block-grid thread-hierarchy cuda-c cuda-driver-api cuda-runtime-api',
    'cuda-tile-programming-model': 'cuda-core cuda-device-architecture streaming-multiprocessor streaming-multiprocessor-architecture tensor-core cuda-programming-model memory-hierarchy parallel-thread-execution thread thread-hierarchy warp cuda-c cute cutile-basic arithmetic-bandwidth',
    'cuda-software-platform': 'cuda-device-architecture cuda-programming-model kernel cublas cuda-c cuda-driver-api cuda-runtime-api cudnn cute-dsl cutile-basic cutlass nvcc',
    'cuda-c': 'cuda-programming-model kernel shared-memory thread thread-block thread-block-grid nvcc',
    'nvidia-gpu-drivers': 'cuda-driver-api cuda-runtime-api nvidia-ko',
    'nvidia-ko': 'nvidia-gpu-drivers',
    'cuda-driver-api': 'global-memory cuda-c cuda-runtime-api libcuda',
    libcuda: 'cuda-driver-api',
    nvml: 'nvidia-smi',
    libnvml: 'nvml',
    'nvidia-smi': 'nvml',
    'cuda-runtime-api': 'cuda-driver-api libcudart',
    libcudart: 'cuda-runtime-api',
    'cuda-graph': 'kernel cuda-runtime-api overhead',
    nvcc: 'streaming-multiprocessor-architecture compute-capability parallel-thread-execution streaming-assembler cuda-binary-utilities cuda-c nvidia-gpu-drivers',
    nvrtc: 'parallel-thread-execution streaming-assembler cuda-c nvcc nvidia-gpu-drivers',
    cupti: 'parallel-thread-execution streaming-assembler cuda-c nsight-systems',
    'nsight-systems': 'cuda-c cupti perf',
    'cuda-binary-utilities': 'streaming-assembler nvcc',
    cublas: 'streaming-multiprocessor-architecture kernel cudnn nvcc perf',
    cudnn: 'streaming-multiprocessor-architecture kernel shared-memory cublas cuda-graph cuda-software-platform cutlass memory-bandwidth',
    cutlass: 'streaming-multiprocessor-architecture tensor-core cuda-programming-model kernel memory-hierarchy thread thread-block thread-hierarchy cublas cuda-c cute cute-dsl perf',
    cute: 'streaming-multiprocessor-architecture kernel memory-hierarchy thread-hierarchy cuda-c cute-dsl cutlass nvcc perf memory-bound',
    'cute-dsl': 'streaming-multiprocessor-architecture tensor-core tensor-memory tensor-memory-accelerator cuda-programming-model global-memory kernel parallel-thread-execution streaming-assembler thread thread-block thread-block-grid warp cublas cuda-c cudnn cute cutlass perf memory-coalescing',
    'cutile-basic': 'cuda-tile-programming-model',
    perf: 'kernel',
    'performance-bottleneck': 'cuda-core streaming-multiprocessor tensor-core kernel memory-hierarchy arithmetic-bandwidth compute-bound memory-bandwidth memory-bound overhead roofline-model',
    'roofline-model': 'cuda-core gpu-ram l1-data-cache tensor-core kernel arithmetic-bandwidth arithmetic-intensity compute-bound memory-bandwidth memory-bound overhead peak-rate performance-bottleneck',
    'compute-bound': 'cuda-core tensor-core kernel shared-memory arithmetic-bandwidth arithmetic-intensity memory-bandwidth pipe-utilization roofline-model',
    'memory-bound': 'gpu-ram l1-data-cache streaming-multiprocessor kernel memory-hierarchy arithmetic-intensity compute-bound memory-bandwidth roofline-model',
    'arithmetic-intensity': 'streaming-multiprocessor-architecture global-memory kernel arithmetic-bandwidth compute-bound memory-bandwidth performance-bottleneck roofline-model',
    overhead: 'kernel cuda-graph compute-bound memory-bound performance-bottleneck',
    'littles-law': 'warp-scheduler warp arithmetic-bandwidth latency-hiding memory-bandwidth warp-execution-state',
    'memory-bandwidth': 'gpu-ram register-file streaming-multiprocessor streaming-multiprocessor-architecture tensor-core kernel memory-hierarchy arithmetic-bandwidth arithmetic-intensity roofline-model',
    'arithmetic-bandwidth': 'cuda-core cuda-device-architecture streaming-multiprocessor-architecture tensor-core kernel memory-bandwidth peak-rate roofline-model',
    'latency-hiding': 'cuda-core load-store-unit tensor-core streaming-assembler thread warp littles-law warp-execution-state',
    'warp-execution-state': 'cuda-core streaming-multiprocessor streaming-multiprocessor-architecture tensor-core warp-scheduler compute-capability kernel thread warp active-cycle issue-efficiency latency-hiding occupancy scoreboard-stall',
    'active-cycle': 'streaming-multiprocessor warp warp-execution-state',
    occupancy: 'register-file streaming-multiprocessor streaming-multiprocessor-architecture tensor-core cuda-programming-model kernel registers shared-memory thread thread-block warp active-cycle arithmetic-intensity compute-bound issue-efficiency latency-hiding memory-bound pipe-utilization register-pressure warp-execution-state',
    'pipe-utilization': 'cuda-core load-store-unit streaming-multiprocessor tensor-core kernel warp peak-rate streaming-multiprocessor-utilization',
    'peak-rate': 'registers compute-bound memory-bandwidth performance-bottleneck pipe-utilization roofline-model',
    'issue-efficiency': 'warp-scheduler warp-execution-state',
    'streaming-multiprocessor-utilization': 'streaming-multiprocessor kernel thread-block nvidia-smi pipe-utilization',
    'warp-divergence': 'cuda-core warp-scheduler cuda-programming-model kernel parallel-thread-execution registers streaming-assembler thread warp nvcc',
    'scoreboard-stall': 'special-function-unit streaming-multiprocessor global-memory registers shared-memory streaming-assembler thread warp memory-bound warp-execution-state',
    'branch-efficiency': 'thread warp warp-divergence',
    'memory-coalescing': 'cuda-device-architecture gpu-ram cuda-programming-model global-memory kernel parallel-thread-execution shared-memory thread warp bank-conflict memory-bandwidth',
    'bank-conflict': 'streaming-multiprocessor shared-memory thread warp memory-bandwidth',
    'register-pressure': 'register-file streaming-multiprocessor streaming-multiprocessor-architecture tensor-memory tensor-memory-accelerator kernel parallel-thread-execution registers streaming-assembler thread thread-block latency-hiding occupancy performance-bottleneck',
    contributors: 'warpgroup cublas cudnn cute-dsl perf memory-coalescing scoreboard-stall',
  };
  let srcCache = null;
  function srcGraph() {
    if (srcCache) return srcCache;
    const out = {}, inb = {};
    GG.order.forEach((t) => { out[t.id] = new Set(); inb[t.id] = new Set(); });
    Object.keys(SRC_LINKS).forEach((a) => {
      if (!out[a]) return;
      SRC_LINKS[a].split(' ').forEach((b) => { if (b !== a && out[b]) { out[a].add(b); inb[b].add(a); } });
    });
    srcCache = { out, in: inb };
    return srcCache;
  }
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many || one + 's'}`;

  /* A map/index link: not counted as a cross-link (see header comment). */
  function chip(id, text, cls) {
    const t = GG.byId[id];
    if (!t) return esc(text == null ? id : text);
    const attr = GG.booted ? `data-term="${id}" href="#${id}"` : `data-in-term="${id}"`;
    return `<a ${attr} class="in-chip${cls ? ' ' + cls : ''}${GG.booted ? ' term' : ''}" style="--c:${chVar(t.section)}">${text == null ? esc(shortName(id)) : text}</a>`;
  }
  /* A counted cross-link (prose). After boot it is emitted already decorated. */
  function tl(id, text) {
    const t = GG.byId[id];
    const extra = GG.booted && t ? ` href="#${id}" class="term" style="--c:${chVar(t.section)}"` : '';
    return `<a data-term="${id}"${extra}>${text == null ? esc(t ? t.name : id) : text}</a>`;
  }
  function svgLink(parent, id, label) {
    const a = GG.svg('a', GG.booted ? { 'data-term': id, href: '#' + id, class: 'term', 'aria-label': label } : { 'data-in-term': id, 'aria-label': label }, parent);
    a.style.setProperty('--c', chVar(GG.byId[id] ? GG.byId[id].section : 'intro'));
    return a;
  }
  GG.onBoot(() => {
    document.querySelectorAll('[data-in-term]').forEach((a) => {
      a.setAttribute('data-term', a.getAttribute('data-in-term'));
      a.removeAttribute('data-in-term');
    });
  });

  function fig(ctx, slot, opts) { const f = ctx.figure(slot, opts); slot.replaceWith(f.root); return f; }
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function stext(parent, x, y, str, cls, attrs) {
    const t = GG.svg('text', Object.assign({ x, y, class: cls || null }, attrs || {}), parent);
    t.textContent = str;
    return t;
  }
  const B = (x, y, w, h) => ({ x, y, w, h });
  const inset = (b, p, top) => { const tp = top == null ? p : top; return B(b.x + p, b.y + tp, b.w - 2 * p, b.h - tp - p); };
  function cut(b, side, size, gap) {
    gap = gap || 0;
    if (side === 'top') return [B(b.x, b.y, b.w, size), B(b.x, b.y + size + gap, b.w, b.h - size - gap)];
    if (side === 'bottom') return [B(b.x, b.y + b.h - size, b.w, size), B(b.x, b.y, b.w, b.h - size - gap)];
    if (side === 'left') return [B(b.x, b.y, size, b.h), B(b.x + size + gap, b.y, b.w - size - gap, b.h)];
    return [B(b.x + b.w - size, b.y, size, b.h), B(b.x, b.y, b.w - size - gap, b.h)];
  }
  function tiles(b, n, dir, gap) {
    const out = [];
    if (dir === 'h') { const w = (b.w - gap * (n - 1)) / n; for (let i = 0; i < n; i++) out.push(B(b.x + i * (w + gap), b.y, w, b.h)); }
    else { const h = (b.h - gap * (n - 1)) / n; for (let i = 0; i < n; i++) out.push(B(b.x, b.y + i * (h + gap), b.w, h)); }
    return out;
  }
  const isTouch = () => !!(window.matchMedia && matchMedia('(hover: none)').matches);

  /* Connectors between HTML elements, drawn in an SVG laid over a container.
     box(el)            → the element's rect relative to the container {x, y (centre), t, b, l, r, w, h}
     paths(list, anim)  → draw routed connectors. Each item is {pts:[[x,y],…]} (an orthogonal polyline,
                          drawn with rounded corners, arrowhead on the last segment) or {d, end:[x,y,tx,ty]}.
     fan(el, els)       → thin spokes from one element to many (no arrowheads).
     clear()                                                                                        */
  function overlay(container) {
    const svg = GG.svg('svg', { class: 'in-ovl', 'aria-hidden': 'true' });
    container.append(svg);
    const box = (el) => {
      const c = container.getBoundingClientRect(), r = el.getBoundingClientRect();
      const l = r.left - c.left, t = r.top - c.top;
      return { l, t, r: l + r.width, b: t + r.height, w: r.width, h: r.height, x: l + r.width / 2, y: t + r.height / 2 };
    };
    const size = () => {
      const W = container.clientWidth, H = container.clientHeight;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', W); svg.setAttribute('height', H);
    };
    const f1 = (v) => v.toFixed(1);
    function rounded(pts, rad) {
      let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
      for (let i = 1; i < pts.length; i++) {
        const p = pts[i];
        if (i === pts.length - 1) { d += ` L${f1(p[0])} ${f1(p[1])}`; break; }
        const a = pts[i - 1], n = pts[i + 1];
        const l1 = Math.hypot(p[0] - a[0], p[1] - a[1]) || 1, l2 = Math.hypot(n[0] - p[0], n[1] - p[1]) || 1;
        const r = Math.min(rad, l1 / 2, l2 / 2);
        const x1 = p[0] - ((p[0] - a[0]) / l1) * r, y1 = p[1] - ((p[1] - a[1]) / l1) * r;
        const x2 = p[0] + ((n[0] - p[0]) / l2) * r, y2 = p[1] + ((n[1] - p[1]) / l2) * r;
        d += ` L${f1(x1)} ${f1(y1)} Q${f1(p[0])} ${f1(p[1])} ${f1(x2)} ${f1(y2)}`;
      }
      return d;
    }
    function head(ex, ey, tx, ty, style) {
      const px = -ty, py = tx, s = 5.5;
      GG.svg('path', { d: `M${f1(ex + tx * 3)} ${f1(ey + ty * 3)} L${f1(ex - tx * s + px * s * 0.7)} ${f1(ey - ty * s + py * s * 0.7)} L${f1(ex - tx * s - px * s * 0.7)} ${f1(ey - ty * s - py * s * 0.7)} Z`, class: 'in-ovl-h', style }, svg);
    }
    return {
      box,
      clear() { svg.innerHTML = ''; },
      paths(list, animate) {
        svg.innerHTML = '';
        size();
        list.forEach((p, i) => {
          if (!p) return;
          const dl = p.delay == null ? i * 0.16 : p.delay;
          if (p.text) {
            const t = GG.svg('text', { x: f1(p.text[0]), y: f1(p.text[1]), 'text-anchor': p.text[3] || 'start', 'dominant-baseline': 'middle', class: 'in-ovl-t', style: animate ? `animation-delay:${(dl + 0.3).toFixed(2)}s` : 'animation:none;opacity:1' }, svg);
            t.textContent = p.text[2];
            return;
          }
          const d = p.d || rounded(p.pts, p.r == null ? 6 : p.r);
          GG.svg('path', { d, class: 'in-ovl-p' + (p.cls ? ' ' + p.cls : ''), pathLength: '1', style: animate ? `animation-delay:${dl.toFixed(2)}s` : 'animation:none;stroke-dashoffset:0' }, svg);
          let end = p.end;
          if (!end && p.pts) {
            const q = p.pts[p.pts.length - 1], o = p.pts[p.pts.length - 2], L = Math.hypot(q[0] - o[0], q[1] - o[1]) || 1;
            end = [q[0], q[1], (q[0] - o[0]) / L, (q[1] - o[1]) / L];
          }
          if (end && p.arrow !== false) head(end[0], end[1], end[2], end[3], animate ? `animation-delay:${(dl + 0.3).toFixed(2)}s` : 'animation:none;opacity:1');
        });
      },
      fan(center, els) {
        svg.innerHTML = '';
        size();
        const a = box(center);
        els.forEach((el) => {
          const b = box(el);
          GG.svg('line', { x1: f1(a.x), y1: f1(a.y), x2: f1(b.x), y2: f1(b.y), class: 'in-ovl-f' }, svg);
        });
      },
    };
  }
  /* Orthogonal connector routing. Finds a polyline of horizontal and vertical segments from an
     edge of box a to an edge of box b that keeps at least `pad` px clear of every obstacle box,
     minimising length + a penalty per bend. Boxes are overlay().box() rects. Candidate lines run
     along each obstacle's edges (offset by pad) and through the middle of every gutter, so a
     segment between two neighbouring candidates is clear iff its midpoint is outside every box.
     Returns [[x, y], …] or null when no clear route exists. */
  function orthoRoute(a, b, obstacles, W, H, opts) {
    opts = opts || {};
    const pad = opts.pad == null ? 3 : opts.pad, BEND = opts.bend == null ? 36 : opts.bend, STUB = 9;
    const rects = obstacles.map((r) => ({ l: r.l - pad, r: r.r + pad, t: r.t - pad, b: r.b + pad }))
      .concat([a, b].map((r) => ({ l: r.l + 0.5, r: r.r - 0.5, t: r.t + 0.5, b: r.b - 0.5 })));
    const inside = (x, y) => rects.some((r) => x > r.l && x < r.r && y > r.t && y < r.b);
    const xs = new Set([2, W - 2]), ys = new Set([2, H - 2]);
    const raw = obstacles.concat([a, b]);
    const edgesX = [], edgesY = [];
    raw.forEach((r) => { edgesX.push(r.l, r.r); edgesY.push(r.t, r.b); });
    rects.forEach((r) => { xs.add(r.l); xs.add(r.r); ys.add(r.t); ys.add(r.b); });
    const mids = (arr, set) => { arr.sort((p, q) => p - q); for (let i = 1; i < arr.length; i++) if (arr[i] - arr[i - 1] > 1) set.add((arr[i] + arr[i - 1]) / 2); };
    mids(edgesX, xs); mids(edgesY, ys);
    // anchors on the sides of a (start, pointing out) and b (end, pointing in)
    const anchors = (q) => {
      const dx = Math.min(16, q.w / 4), out = [];
      [q.x, q.l + dx, q.r - dx].forEach((x) => { out.push([x, q.t, 0, -1]); out.push([x, q.b, 0, 1]); });
      out.push([q.l, q.y, -1, 0]); out.push([q.r, q.y, 1, 0]);
      return out;
    };
    const A = anchors(a), Bn = anchors(b);
    A.concat(Bn).forEach(([x, y, dx, dy]) => { xs.add(x); ys.add(y); if (dx) xs.add(x + dx * STUB); if (dy) ys.add(y + dy * STUB); });
    const X = [...xs].filter((v) => v >= 0 && v <= W).sort((p, q) => p - q), Y = [...ys].filter((v) => v >= 0 && v <= H).sort((p, q) => p - q);
    const xi = new Map(X.map((v, i) => [v, i])), yi = new Map(Y.map((v, i) => [v, i]));
    const NX = X.length, NY = Y.length, DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const key = (i, j, d) => (j * NX + i) * 4 + d;
    const dist = new Float64Array(NX * NY * 4).fill(Infinity), prev = new Int32Array(NX * NY * 4).fill(-1);
    const heap = [];
    const push = (c, k) => { heap.push([c, k]); let n = heap.length - 1; while (n > 0) { const p = (n - 1) >> 1; if (heap[p][0] <= heap[n][0]) break; [heap[p], heap[n]] = [heap[n], heap[p]]; n = p; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let n = 0; for (;;) { const l = 2 * n + 1, r = l + 1; let m = n; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === n) break; [heap[m], heap[n]] = [heap[n], heap[m]]; n = m; } } return top; };
    const dirOf = (dx, dy) => DIRS.findIndex((d) => d[0] === dx && d[1] === dy);
    const starts = new Set();
    A.forEach(([x, y, dx, dy]) => { const k = key(xi.get(x), yi.get(y), dirOf(dx, dy)); dist[k] = 0; starts.add(k); push(0, k); });
    const goal = new Map();
    Bn.forEach(([x, y, dx, dy]) => { goal.set(key(xi.get(x), yi.get(y), dirOf(-dx, -dy)), true); });
    let found = -1;
    while (heap.length) {
      const [c, k] = pop();
      if (c > dist[k]) continue;
      if (goal.has(k)) { found = k; break; }
      const d = k & 3, cell = k >> 2, i = cell % NX, j = (cell - i) / NX;
      for (let nd = 0; nd < 4; nd++) {
        if (starts.has(k) && nd !== d) continue;             // leave a start anchor straight outwards
        if (DIRS[nd][0] === -DIRS[d][0] && DIRS[nd][1] === -DIRS[d][1]) continue;
        const ni = i + DIRS[nd][0], nj = j + DIRS[nd][1];
        if (ni < 0 || nj < 0 || ni >= NX || nj >= NY) continue;
        const x1 = X[i], y1 = Y[j], x2 = X[ni], y2 = Y[nj];
        if (inside((x1 + x2) / 2, (y1 + y2) / 2) || inside(x2, y2)) continue;
        const nk = key(ni, nj, nd), cost = c + Math.abs(x2 - x1) + Math.abs(y2 - y1) + (nd === d ? 0 : BEND);
        if (cost < dist[nk]) { dist[nk] = cost; prev[nk] = k; push(cost, nk); }
      }
    }
    if (found < 0) return null;
    const pts = [];
    for (let k = found; k >= 0; k = prev[k]) { const cell = k >> 2, i = cell % NX; pts.push([X[i], Y[(cell - i) / NX]]); }
    pts.reverse();
    // drop collinear points
    return pts.filter((p, n) => n === 0 || n === pts.length - 1 || !((pts[n - 1][0] === p[0] && pts[n + 1][0] === p[0]) || (pts[n - 1][1] === p[1] && pts[n + 1][1] === p[1])));
  }
  /* Draw numbered-path connectors between consecutive elements. Neighbours that (nearly) touch get no
     line, since the numbered badges already give the order; `sameGroup(a, b)` can suppress more.
     `custom(k, a, b)` may return a list of overlay items to draw for step k instead of the routed line. */
  function drawPath(ov, container, els, obstacleEls, animate, sameGroup, custom) {
    const W = container.clientWidth, H = container.clientHeight;
    const obs = obstacleEls.map((el) => ov.box(el));
    const list = [];
    for (let k = 1; k < els.length; k++) {
      const e1 = els[k - 1], e2 = els[k];
      if (!e1 || !e2 || (sameGroup && sameGroup(e1, e2))) continue;
      const own = custom && custom(k, ov.box(e1), ov.box(e2));
      if (own) { own.forEach((it) => list.push(Object.assign({ delay: (k - 1) * 0.16 }, it))); continue; }
      const a = ov.box(e1), b = ov.box(e2);
      const gx = Math.max(a.l, b.l) - Math.min(a.r, b.r), gy = Math.max(a.t, b.t) - Math.min(a.b, b.b);
      if ((gx < 14 && gy < 0) || (gy < 14 && gx < 0)) continue;
      const others = obs.filter((o, n) => obstacleEls[n] !== e1 && obstacleEls[n] !== e2);
      const pts = orthoRoute(a, b, others, W, H);
      if (pts && pts.length > 1) list.push(custom ? { pts, delay: (k - 1) * 0.16 } : { pts });
    }
    ov.paths(list, animate);
  }

  /* On touch screens a tap on a chip link first previews it (onPreview) and only a second
     tap on the same chip follows the link. Mouse clicks follow the link at once. */
  function armTaps(root, selector, onPreview) {
    let armed = null;
    root.addEventListener('click', (e) => {
      const a = e.target.closest(selector);
      if (!a || !root.contains(a) || !isTouch()) return;
      const id = a.getAttribute('data-term') || a.getAttribute('data-in-term');
      if (armed === id) { armed = null; return; }
      e.preventDefault();
      armed = id;
      onPreview(a, id);
    });
    return { reset() { armed = null; } };
  }

  const ICON = {
    'host-software': '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="8" y="8" width="16" height="16" rx="2"/><rect x="12.5" y="12.5" width="7" height="7" rx="1"/><path d="M12 4v4M16 4v4M20 4v4M12 24v4M16 24v4M20 24v4M4 12h4M4 16h4M4 20h4M24 12h4M24 16h4M24 20h4"/></svg>',
    'device-software': '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M9 3c-3 4 3 5 0 9s3 5 0 9 3 5 0 8M16 3c-3 4 3 5 0 9s3 5 0 9 3 5 0 8M23 3c-3 4 3 5 0 9s3 5 0 9 3 5 0 8"/></svg>',
    'device-hardware': '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="4" y="4" width="24" height="24" rx="2"/><rect x="8" y="8" width="6.5" height="6.5"/><rect x="17.5" y="8" width="6.5" height="6.5"/><rect x="8" y="17.5" width="6.5" height="6.5"/><rect x="17.5" y="17.5" width="6.5" height="6.5"/></svg>',
    perf: '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="14" cy="14" r="9"/><path d="M20.5 20.5l7 7"/><path d="M9 17l3-3.5 2.5 2.5 4-5"/></svg>',
  };

  /* ───────────────────────── CSS ───────────────────────── */
  GG.css(`
  .in-prose { max-width: 760px; }
  .entry-body .in-prose > * + * { margin-top: 1.05em; }
  .in-lead { font-size: 15.5px; color: var(--ink-2); }
  .in-lead a { color: var(--ink); }
  a.in-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 9px 4px 8px; border-radius: 999px; border: 1px solid var(--line-2);
    background: var(--surface); color: var(--ink-2); font: 500 12.5px/1.25 var(--font-body); text-decoration: none; white-space: nowrap;
    transition: border-color .15s, color .15s, background .15s, opacity .15s; cursor: pointer; }
  a.in-chip::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: var(--c, var(--ink-3)); flex: none; }
  a.in-chip.term { text-decoration: none; color: var(--ink-2); }
  a.in-chip:hover, a.in-chip:focus-visible, a.in-chip.term:hover { color: var(--ink); border-color: var(--c, var(--ink-3)); background: var(--surface-2); text-decoration: none; }
  a.in-chip.in-plain, a.in-chip.in-plain.term { display: inline; padding: 0; border: 0; border-radius: 0; background: none; color: var(--ink); font: inherit; white-space: normal;
    text-decoration: underline dotted; text-decoration-color: var(--c); text-decoration-thickness: 1.5px; text-underline-offset: 3px; }
  a.in-chip.in-plain::before { display: none; }
  a.in-chip.in-plain:hover { background: none; text-decoration-style: solid; color: #fff; }
  .in-svg a.term, .in-svg a { text-decoration: none; cursor: pointer; }
  .in-svg a:focus { outline: none; }
  .in-svg text { font-family: var(--font-mono); fill: var(--ink-2); }
  .fig .seg button:disabled { opacity: .32; cursor: not-allowed; }
  .fig .seg button:disabled:hover { background: transparent; color: var(--ink-2); }
  .in-ovl { position: absolute; left: 0; top: 0; pointer-events: none; overflow: visible; z-index: 1; }
  .in-ovl-p { fill: none; stroke: var(--accent); stroke-width: 1.8; stroke-linecap: round; stroke-dasharray: 1; stroke-dashoffset: 1; animation: in-draw .42s ease-out forwards; }
  .in-ovl-h { fill: var(--accent); opacity: 0; animation: in-fade .2s ease-out forwards; }
  .in-ovl-p.in-thin { stroke-width: 1.4; }
  .in-ovl-t { fill: var(--ink-2); font: 500 10px var(--font-mono); opacity: 0; animation: in-fade .2s ease-out forwards; }
  @keyframes in-draw { to { stroke-dashoffset: 0; } }
  @keyframes in-fade { to { opacity: 1; } }
  .in-kbd-row kbd { margin-right: 3px; }
  .entry-body td.in-kbd-row { width: 1%; white-space: nowrap; padding-right: 24px; }

  /* terminal (README banner, source tree) */
  .in-term { border: 1px solid var(--line-2); border-radius: 14px; background: #07080d; overflow: hidden; box-shadow: var(--shadow); }
  .in-term-h { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 9px 14px; border-bottom: 1px solid var(--line); background: var(--surface);
    font: 500 11px var(--font-mono); color: var(--ink-3); }
  .in-term-h span:first-child { color: var(--ink-2); }
  .in-term-b { container-type: inline-size; padding: 16px 18px 20px; }
  .in-prompt { font: 500 12.5px var(--font-mono); color: var(--ink-2); }
  .in-prompt b { color: var(--core); font-weight: 500; }
  .in-banner { margin: 14px 0 0; padding: 0; font-family: var(--font-mono); font-size: 7px; font-size: min(15px, 2.32cqw); line-height: 1.02; white-space: pre; overflow: hidden; color: var(--ink); background: none; border: 0; }
  .in-banner .in-b { color: var(--ink); }
  .in-banner .in-s { color: #4a5070; }
  .in-banner .in-row2 .in-b { color: var(--accent-2); }

  /* Fig: four spellings */
  .in-names-top { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 12px; margin: 2px 2px 14px; font-size: 15px; color: var(--ink-2); }
  .in-names-gpu { font-family: var(--font-display); font-weight: 800; font-size: 34px; line-height: 1; color: var(--ink); letter-spacing: .01em; }
  .in-names-top b { color: var(--ink); font-weight: 600; }
  .in-names-big { font-family: var(--font-display); font-weight: 800; font-size: 34px; line-height: 1; }
  .in-ver { color: var(--accent); font-weight: 600; }
  code .in-ver, pre .in-ver { color: var(--accent); }
  .in-docs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .in-docs > .in-doc:nth-child(3) { grid-column: 1 / -1; display: grid; grid-template-columns: minmax(0, .8fr) minmax(0, 1.2fr); grid-template-areas: "src cmd" "h cmd" "note cmd"; gap: 0 16px; align-items: start; }
  .in-docs > .in-doc:nth-child(3) > .in-doc-src { grid-area: src; } .in-docs > .in-doc:nth-child(3) > h4 { grid-area: h; }
  .in-docs > .in-doc:nth-child(3) > .in-doc-cmd { grid-area: cmd; } .in-docs > .in-doc:nth-child(3) > .in-doc-note { grid-area: note; }
  .in-doc { border: 1px solid var(--line); border-radius: 12px; background: rgba(8, 9, 14, .6); padding: 11px 12px 12px; min-width: 0; }
  .in-doc-src { display: flex; align-items: center; gap: 7px; font: 500 10px/1.3 var(--font-mono); letter-spacing: .1em; text-transform: uppercase; color: var(--ink-3); }
  .in-doc-src::before { content: ""; width: 7px; height: 7px; border-radius: 2px; background: var(--c); flex: none; }
  .in-doc h4 { margin: 8px 0 8px !important; font-family: var(--font-display) !important; font-size: 21px !important; font-weight: 700 !important; letter-spacing: .01em !important; text-transform: none !important; color: var(--ink) !important; }
  .in-doc dl { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 5px 10px; margin: 0; font-size: 13px; }
  .in-doc dt { font: 500 10px/1.9 var(--font-mono); letter-spacing: .06em; text-transform: uppercase; color: var(--ink-3); white-space: nowrap; }
  .in-doc dd { margin: 0; color: var(--ink-body); min-width: 0; overflow-wrap: anywhere; }
  .in-doc dd code { white-space: nowrap; }
  .in-doc-cmd { margin: 0; padding: 9px 10px; border-radius: 8px; background: #090a10; border: 1px solid var(--line); font-size: 12px; line-height: 1.6; color: var(--ink-body); overflow-x: auto; white-space: pre; }
  .in-doc-note { margin-top: 8px; font-size: 12.5px; line-height: 1.45; color: var(--ink-3); }
  .in-names-tgt { font: 500 11px/1.3 var(--font-mono); letter-spacing: .08em; text-transform: uppercase; color: var(--ink-3); padding: 4px 8px; border: 1px dashed var(--line-2); border-radius: 7px; }
  .in-names-tgt .in-ver { font-size: 13px; letter-spacing: .02em; text-transform: none; }
  .in-runs-h { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 4px 12px; margin: 14px 2px 7px; font: 500 10px/1.3 var(--font-mono); letter-spacing: .1em; text-transform: uppercase; color: var(--ink-3); }
  .in-runs-h b { color: var(--ink-2); font-weight: 600; }
  .in-runs { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 6px; }
  .in-run { position: relative; display: grid; gap: 2px; padding: 8px 9px 9px; border-radius: 10px; border: 1px solid var(--c); background: rgba(8, 9, 14, .6); min-width: 0; }
  .in-run[data-s="sass"] { --c: var(--core); }
  .in-run[data-s="jit"] { --c: var(--host); border-style: dashed; }
  .in-run[data-s="no"] { --c: var(--line-2); }
  .in-run b { font: 700 17px/1.1 var(--font-display); color: var(--ink); letter-spacing: .01em; }
  .in-run span { font: 500 11px/1.3 var(--font-mono); color: var(--ink-2); }
  .in-run em { font: 600 10px/1.3 var(--font-mono); font-style: normal; letter-spacing: .04em; color: var(--c); }
  .in-run[data-s="no"] b, .in-run[data-s="no"] span { color: var(--ink-3); }
  .in-run[data-s="no"] em { color: var(--danger); }
  .in-run[data-me] { box-shadow: 0 0 0 1px var(--c); }
  .in-run[data-me]::after { content: "built for"; position: absolute; top: -7px; right: 7px; padding: 0 5px; border-radius: 4px; background: var(--accent); color: var(--on-accent); font: 700 8.5px/13px var(--font-mono); letter-spacing: .06em; text-transform: uppercase; }
  .in-runs-leg { display: flex; flex-wrap: wrap; gap: 4px 14px; margin: 8px 2px 0; font-size: 12px; line-height: 1.45; color: var(--ink-3); }
  .in-runs-leg i { font-style: normal; font: 600 10px/1.45 var(--font-mono); letter-spacing: .04em; }

  /* Fig: stack atlas */
  .in-atlas { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 212px); gap: 12px; }
  .in-atlas-stack { display: grid; gap: 8px; min-width: 0; align-content: start; }
  .in-frame { position: relative; border: 1px dashed var(--line-2); border-radius: 14px; padding: 26px 8px 8px; display: grid; gap: 6px; }
  .in-frame-lab { position: absolute; top: 8px; left: 12px; font: 500 10px/1 var(--font-mono); letter-spacing: .13em; text-transform: uppercase; color: var(--ink-3); }
  .in-frame-lab b { color: var(--ink-2); font-weight: 600; }
  .in-layer { border: 1px solid var(--line); background: rgba(8, 9, 14, .6); border-radius: 11px; padding: 9px 11px 11px; transition: opacity .2s, border-color .2s, box-shadow .2s; min-width: 0; }
  .in-layer > header { display: flex; align-items: center; gap: 9px; }
  .in-ico { width: 24px; height: 24px; color: var(--c); flex: none; display: inline-flex; }
  .in-ico svg { width: 100%; height: 100%; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
  .in-layer a.in-layer-name, .in-layer a.in-layer-name.term { font-family: var(--font-display); font-weight: 700; font-size: 21px; line-height: 1; letter-spacing: .01em; text-decoration: none; color: var(--ink); }
  .in-layer-n { margin-left: auto; font: 500 11px var(--font-mono); color: var(--ink-3); white-space: nowrap; }
  .in-layer > p { font-size: 13.5px; line-height: 1.5; color: var(--ink-2); margin: 6px 0 9px; }
  .in-chips { display: flex; flex-wrap: wrap; gap: 5px; }
  .in-chips a.in-chip { font-size: 12px; padding: 3px 8px 3px 7px; }
  .in-atlas-arrow { display: flex; align-items: center; justify-content: center; gap: 8px; font: 500 10.5px var(--font-mono); color: var(--ink-3); letter-spacing: .05em; }
  .in-atlas-arrow svg { width: 12px; height: 14px; stroke: var(--ink-3); fill: none; stroke-width: 1.5; }
  .in-lens { display: flex; flex-direction: column; border-color: rgba(255, 198, 92, .35); background: linear-gradient(180deg, rgba(255, 198, 92, .07), rgba(255, 198, 92, .02)); }
  .in-lens .in-chips { flex-direction: column; flex-wrap: nowrap; align-items: flex-start; }
  .in-atlas .in-layer.in-dim { opacity: .38; }
  .in-atlas .in-layer.in-hot { border-color: var(--c); box-shadow: 0 0 0 1px var(--c) inset; }
  .in-atlas.in-lensing .in-layer:not(.in-lens) { box-shadow: 0 0 0 1px rgba(255, 198, 92, .6) inset; border-color: rgba(255, 198, 92, .6); }
  .in-atlas.in-chipmode a.in-chip { color: #8a8fa8; border-color: var(--line); }
  .in-atlas.in-chipmode a.in-chip::before { opacity: .3; }
  .in-atlas.in-chipmode a.in-chip.in-nb::before, .in-atlas.in-chipmode a.in-chip.in-cur::before { opacity: 1; }
  .in-atlas.in-chipmode a.in-chip.in-nb, .in-atlas.in-chipmode a.in-chip.in-cur { opacity: 1; }
  .in-atlas a.in-chip.in-nb { border-color: var(--c); color: var(--ink); }
  .in-atlas a.in-chip.in-cur { border-color: var(--accent); color: var(--ink); background: var(--surface-3); }

  /* sources */
  .in-src { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
  a.in-src-t { display: grid; grid-template-columns: 38px 1fr; gap: 4px 12px; align-items: start; padding: 13px 14px; border: 1px solid var(--line); border-radius: 12px; background: var(--surface); text-decoration: none; color: var(--ink-2); transition: border-color .15s, background .15s; }
  a.in-src-t:hover { border-color: var(--ink-3); background: var(--surface-2); color: var(--ink-2); }
  .in-src-t svg { grid-row: span 3; width: 38px; height: 38px; fill: none; stroke: var(--ink-2); stroke-width: 1.4; stroke-linejoin: round; stroke-linecap: round; }
  .in-src-t b { color: var(--ink); font-weight: 650; font-size: 15px; }
  .in-src-t span { font-size: 13px; line-height: 1.45; }
  .in-src-t small { font: 500 10.5px var(--font-mono); color: var(--ink-3); }
  .in-src-join { display: flex; align-items: center; gap: 10px; justify-content: center; font: 500 11px var(--font-mono); letter-spacing: .08em; text-transform: uppercase; color: var(--ink-3); margin-top: 10px !important; }
  .in-src-join::before, .in-src-join::after { content: ""; flex: 1; height: 1px; background: var(--line); }

  /* Fig: trail */
  .in-trail { display: grid; grid-template-columns: minmax(0, 1fr) 34px minmax(0, 1fr) 34px minmax(0, 1fr); align-items: start; padding: 4px 0 6px; }
  .in-tcard { position: relative; border: 1px solid var(--line); border-radius: 12px; background: rgba(8, 9, 14, .65); padding: 10px 12px 12px; transition: opacity .3s, border-color .3s, transform .3s, box-shadow .3s; opacity: .42; }
  .in-tcard[data-i="1"] { margin-top: 44px; }
  .in-tcard[data-i="2"] { margin-top: 88px; }
  .in-tcard.on { opacity: 1; border-color: var(--c); box-shadow: 0 0 0 1px var(--c) inset, 0 14px 40px -24px rgba(0, 0, 0, .9); }
  .in-tcard.past { opacity: .8; }
  .in-tcard-ch { display: flex; align-items: center; gap: 7px; font: 500 10px var(--font-mono); letter-spacing: .1em; text-transform: uppercase; color: var(--c); }
  .in-tcard-ch::before { content: ""; width: 7px; height: 7px; border-radius: 2px; background: var(--c); }
  .in-tcard h4 { margin: 6px 0 6px !important; font-family: var(--font-display) !important; font-size: 20px !important; font-weight: 700 !important; letter-spacing: .01em !important; text-transform: none !important; color: var(--ink) !important; }
  .in-tcard h4 a { text-decoration: none; }
  .in-tcard p { font-size: 13.5px; line-height: 1.5; color: var(--ink-2); }
  .in-tcard mark { background: none; color: inherit; border-radius: 4px; padding: 0 2px; transition: background .3s, box-shadow .3s; }
  .in-tcard.on mark { background: var(--accent-a); box-shadow: 0 0 0 1px rgba(255, 138, 91, .55); }
  .in-tarrow { display: flex; justify-content: center; opacity: .25; transition: opacity .3s; }
  .in-tarrow[data-i="1"] { margin-top: 56px; }
  .in-tarrow[data-i="2"] { margin-top: 100px; }
  .in-tarrow.on { opacity: 1; }
  .in-tarrow svg { width: 30px; height: 22px; fill: none; stroke: var(--accent); stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  .in-tdepth { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; font: 500 10px var(--font-mono); color: var(--ink-3); }

  /* Fig: web */
  .in-web { position: relative; }
  .in-web canvas { display: block; touch-action: pan-y; cursor: default; border-radius: 10px; }
  .in-web canvas.in-hovering { cursor: pointer; }
  .in-web-card { position: absolute; z-index: 3; width: min(290px, calc(100% - 12px)); padding: 11px 13px 11px; border-radius: 12px; background: rgba(18, 19, 29, .97);
    border: 1px solid var(--line-2); box-shadow: 0 20px 50px -18px rgba(0, 0, 0, .9); pointer-events: none; }
  .in-web-card.touch { pointer-events: auto; }
  .in-web-card-sec { font: 500 10px var(--font-mono); letter-spacing: .12em; text-transform: uppercase; color: var(--c); }
  .in-web-card-t { font-family: var(--font-display); font-weight: 700; font-size: 22px; line-height: 1.05; color: var(--ink); margin: 3px 0 5px; }
  .in-web-card-t small { font: 500 11px var(--font-mono); color: var(--ink-2); margin-left: 6px; }
  .in-web-card p { font-size: 13px; line-height: 1.45; color: var(--ink-2); }
  .in-web-card-k { margin-top: 7px; font: 500 10.5px var(--font-mono); color: var(--ink-3); }
  .in-web-card .btn { margin-top: 8px; }
  .in-find { min-width: 150px; flex: 0 1 190px; }
  .in-webfig .fig-controls { flex-basis: 100%; }
  .in-find input { width: 100%; }
  .in-web-list { max-height: 460px; overflow-y: auto; border: 1px solid var(--line); border-radius: 10px; background: rgba(8, 9, 14, .5); scrollbar-width: thin; scrollbar-color: var(--line-2) transparent; }
  .in-web-ol { list-style: none; margin: 0; padding: 4px 0; counter-reset: inw; }
  .in-web-ol li { display: grid; grid-template-columns: 26px minmax(0, 1fr) minmax(60px, 34%) 88px; gap: 10px; align-items: center; padding: 5px 12px; font-size: 13.5px; counter-increment: inw; }
  .in-web-ol li + li { border-top: 1px solid rgba(38, 42, 59, .6); }
  .in-web-ol li::before { content: counter(inw); font: 500 10.5px var(--font-mono); color: var(--ink-3); text-align: right; }
  .in-web-ol li a { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .in-web-bar { height: 6px; border-radius: 6px; background: var(--line); overflow: hidden; }
  .in-web-bar i { display: block; height: 100%; background: var(--c); border-radius: 6px; }
  .in-web-deg { font: 500 11px var(--font-mono); color: var(--ink-3); text-align: right; white-space: nowrap; }

  /* Fig: reading order strip */
  .in-strip { position: relative; outline: none; border-radius: 10px; padding: 6px 0 0; }
  .in-strip:focus-visible { box-shadow: 0 0 0 2px var(--accent); }
  .in-strip-svg { display: block; width: 100%; height: 64px; cursor: pointer; touch-action: pan-y; }
  .in-strip-svg .in-sk { opacity: .5; transition: opacity .15s; }
  .in-strip-svg .in-sk.on { opacity: 1; }
  .in-strip-cur { fill: none; stroke: var(--accent); stroke-width: 2; vector-effect: non-scaling-stroke; }
  .in-strip-lab { display: flex; gap: 0; margin-top: 6px; font: 500 10px/1.2 var(--font-mono); letter-spacing: .06em; color: var(--ink-3); }
  .in-strip-lab span { border-top: 2px solid var(--c); padding-top: 5px; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: clip; }
  .in-strip-lab span + span { margin-left: 2px; }
  .in-navs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-top: 16px; }
  .in-navs > div { display: flex; flex-direction: column; gap: 7px; padding: 10px 12px; border: 1px solid var(--line); border-radius: 10px; background: rgba(8, 9, 14, .5); font-size: 12.5px; line-height: 1.4; color: var(--ink-2); }
  .in-navs-k { display: flex; align-items: center; gap: 5px; min-height: 26px; color: var(--ink); font: 500 12px var(--font-mono); }
  .in-navs-k svg { width: 18px; height: 18px; fill: none; stroke: var(--ink); stroke-width: 2; }
  .in-navs-foot { padding: 4px 8px; border-top: 1px dashed var(--line-2); color: var(--ink-2); }

  /* source tree */
  .in-tree { font: 500 12.5px/1.75 var(--font-mono); color: var(--ink-2); }
  .in-tree-l { display: flex; align-items: center; white-space: pre; min-width: 0; }
  .in-tree-g { color: #454a63; }
  .in-tree button { font: inherit; color: var(--ink); background: none; border: 0; padding: 0 4px 0 0; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; border-radius: 5px; }
  .in-tree button:hover { color: #fff; }
  .in-tree button i { font-style: normal; color: var(--ink-3); display: inline-block; width: 1em; transition: transform .15s; }
  .in-tree button[aria-expanded="true"] i { transform: rotate(90deg); }
  .in-tree small { color: var(--ink-3); margin-left: 8px; font-size: 11px; }
  .in-tree a.in-chip { padding: 0; border: 0; background: none; font: inherit; color: var(--ink-2); gap: 7px; }
  .in-tree a.in-chip:hover { background: none; color: var(--ink); }
  .in-tree a.in-chip::before { width: 5px; height: 5px; }
  .in-tree-kid[hidden] { display: none !important; }
  .in-tree-tools { display: flex; gap: 8px; margin-bottom: 8px; }
  .in-tree-scroll { overflow-x: auto; scrollbar-width: thin; }

  /* Fig: anatomy */
  .in-badge { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; flex: none; border-radius: 50%; background: var(--accent); color: var(--on-accent);
    font: 700 10.5px/1 var(--font-mono); vertical-align: 1px; margin-right: 8px; cursor: help; }
  .fig-stage > .in-badge { position: absolute; top: 8px; left: 12px; z-index: 2; }
  .in-anatfig .fig-stage { padding-top: 34px; }
  .fig-why > .in-badge, figcaption > .in-badge { margin-right: 8px; }
  .in-anat-on { outline: 2px dashed var(--accent) !important; outline-offset: -3px; border-radius: 10px; }
  .fig-controls.in-anat-on, .fig-readouts.in-anat-on { outline-offset: 5px; }
  .in-anat { list-style: none; margin: -2px 0 0 !important; padding: 0 !important; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px 14px; }
  .in-anat li { display: flex; align-items: flex-start; gap: 0; font-size: 14px; line-height: 1.5; color: var(--ink-2); padding: 7px 10px; border-radius: 10px; border: 1px solid var(--line); background: var(--surface); cursor: default; margin: 0 !important; }
  .in-anat li:hover, .in-anat li:focus-visible, .in-anat li.on { border-color: var(--accent); }
  .in-anat li b { color: var(--ink); }
  .in-wgrid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-rows: repeat(16, auto); grid-auto-flow: column; gap: 3px 22px; }
  .in-wrow { display: grid; grid-template-columns: 54px minmax(0, 1fr); gap: 8px; align-items: center; }
  .in-wrow > span { font: 500 11px/1 var(--font-mono); color: var(--ink-3); opacity: .6; text-align: right; white-space: nowrap; }
  .in-wrow.on > span { color: var(--ink-2); opacity: 1; }
  .in-wcells { display: grid; grid-template-columns: repeat(32, minmax(0, 1fr)); gap: 1.5px; }
  .in-wcells i { height: 9px; border-radius: 1.5px; background: var(--line); opacity: .55; }
  .in-wcells i.a { background: var(--core); opacity: 1; }
  .in-wcells i.x { background: var(--danger-a); box-shadow: inset 0 0 0 1.5px var(--danger); opacity: 1; }
  @media (max-width: 560px) {
    .in-wgrid { grid-template-columns: minmax(0, 1fr); grid-template-rows: none; grid-auto-flow: row; gap: 2px; }
    .in-wrow { grid-template-columns: 50px minmax(0, 1fr); }
    .in-wcells i { height: 7px; }
  }
  .in-notes { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .in-notes .note { margin: 0 !important; }
  .in-keys { width: 100%; border-collapse: collapse; font-size: 14.5px; }
  .in-keys td { padding: 8px 6px; border-bottom: 1px solid var(--line); vertical-align: top; }
  .in-keys td:first-child { white-space: nowrap; width: 1%; padding-right: 18px; }
  .in-keys tr:last-child td { border-bottom: 0; }
  .in-chapters { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  a.in-chap, a.in-chap.term { display: grid; grid-template-columns: 30px 1fr; gap: 2px 12px; padding: 12px 14px; border-radius: 12px; border: 1px solid var(--line); background: var(--surface); text-decoration: none; color: var(--ink-2); transition: border-color .15s; }
  a.in-chap:hover { border-color: var(--c); color: var(--ink-2); }
  .in-chap .in-ico { grid-row: span 3; width: 28px; height: 28px; margin-top: 2px; }
  .in-chap small { font: 500 10px var(--font-mono); letter-spacing: .12em; text-transform: uppercase; color: var(--c); }
  .in-chap b { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--ink); line-height: 1.05; letter-spacing: .01em; }
  .in-chap span { font-size: 13px; line-height: 1.45; }

  /* plates */
  .in-plate-top { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 300px); gap: 28px; align-items: start; }
  .in-loc { margin: 4px 0 0; }
  .in-loc svg { display: block; width: 100%; height: auto; }
  .in-loc figcaption { margin-top: 6px; font-size: 12.5px; line-height: 1.45; color: var(--ink-3); }
  .in-loc-f { fill: none; stroke: var(--line-2); stroke-dasharray: 4 3; }
  .in-loc-cap { font: 500 9.5px var(--font-mono); letter-spacing: .12em; text-transform: uppercase; fill: var(--ink-3); }
  .in-loc-l { fill: var(--surface-2); stroke: var(--line-2); transition: fill-opacity .15s, stroke .15s; }
  .in-loc-l.on { fill: var(--c); fill-opacity: .2; stroke: var(--c); stroke-width: 1.5; }
  .in-loc-t { font: 600 12.5px var(--font-body) !important; fill: var(--ink-3) !important; }
  .in-loc-t.on { fill: var(--ink) !important; }
  .in-loc a:hover .in-loc-l { stroke: var(--c); }
  .in-loc a:hover .in-loc-t { fill: var(--ink) !important; }
  .in-loc a:focus-visible .in-loc-l { stroke: var(--accent); stroke-width: 2; }
  .in-loc-lens { fill: var(--ch-perf); fill-opacity: .06; stroke: var(--ch-perf); stroke-opacity: .45; }
  .in-loc-lens.on { fill-opacity: .2; stroke-opacity: 1; stroke-width: 1.5; }
  .in-loc-arr { fill: none; stroke: var(--ink-3); stroke-width: 1.3; }
  .in-loc-small { font: 500 9px var(--font-mono) !important; fill: var(--ink-3) !important; }

  /* hardware map */
  .in-hw { position: relative; }
  .in-hw-svg { display: block; width: 100%; height: auto; overflow: hidden !important; }
  .in-hw-svg .in-r { transition: opacity .22s; }
  .in-hw-svg .in-r.in-out { opacity: .22; }
  .in-hw-svg .in-tiny { display: none; }
  .in-hw-svg .in-shape { fill: var(--surface-2); stroke: var(--line-2); stroke-width: 1; transition: stroke .2s, fill .2s; }
  .in-hw-svg .in-k-frame > .in-shape { fill: rgba(255, 255, 255, .018); stroke: var(--line-2); }
  .in-hw-svg .in-k-frame.in-muted > .in-shape { stroke-dasharray: 5 4; }
  .in-hw-svg .in-t-core .in-shape { fill: var(--core-a); stroke: var(--core); stroke-opacity: .65; }
  .in-hw-svg .in-t-special .in-shape { fill: var(--special-a); stroke: var(--special); stroke-opacity: .65; }
  .in-hw-svg .in-t-control .in-shape { fill: var(--control-a); stroke: var(--control); stroke-opacity: .6; }
  .in-hw-svg .in-t-memory .in-shape { fill: var(--memory-a); stroke: var(--memory); stroke-opacity: .65; }
  .in-hw-svg .in-t-control.in-muted .in-shape { fill: rgba(255, 198, 92, .06); stroke-opacity: .3; }
  .in-hw-svg .in-muted:not(.in-k-frame):not([class*="in-t-"]) .in-shape { fill: rgba(255, 255, 255, .025); stroke: var(--line); }
  .in-hw-svg .in-dash .in-shape { stroke-dasharray: 4 3; fill-opacity: .5; }
  .in-hw-svg .in-k-frame.in-t-core > .in-shape { fill: rgba(69, 212, 155, .04); }
  .in-hw-svg .in-lab { fill: var(--ink); }
  .in-hw-svg .in-t-core .in-lab { fill: var(--core); }
  .in-hw-svg .in-t-special .in-lab { fill: var(--special); }
  .in-hw-svg .in-t-control .in-lab { fill: var(--control); }
  .in-hw-svg .in-t-memory .in-lab { fill: var(--memory); }
  .in-hw-svg .in-muted .in-lab { fill: var(--ink-3); }
  .in-hw-svg .in-sub { fill: var(--ink-3); }
  .in-hw-svg .in-tag { fill: var(--ink-3); }
  .in-hw-svg .in-tk { fill: var(--core); fill-opacity: .8; }
  .in-hw-svg .in-t-special .in-tk { fill: var(--special); }
  .in-hw-svg .in-tk.off { fill: var(--danger); fill-opacity: .75; stroke: none; }
  .in-hw-svg .in-swl { pointer-events: none; }
  .in-hw-svg .in-swl[hidden] { display: none; }
  .in-sw-o { fill: none; stroke: var(--ink); stroke-opacity: .85; stroke-width: 1.6; stroke-dasharray: 6 4; }
  .in-sw-p { fill: var(--bg); stroke: var(--ink-2); stroke-width: 1; }
  .in-sw-p.m { stroke: var(--memory); }
  .in-hw-svg text.in-sw-t { fill: var(--ink); font-weight: 600; }
  .in-hw-svg text.in-sw-t.m { fill: var(--memory); }
  .in-hw-svg .in-ln { stroke: var(--memory); stroke-opacity: .55; stroke-width: 1; }
  .in-hw-svg .in-mini { fill: rgba(255, 255, 255, .06); stroke: var(--line-2); stroke-width: .8; }
  .in-hw-svg .in-r.in-on .in-shape { stroke: var(--accent); stroke-width: 2; stroke-opacity: 1; }
  .in-hw-svg .in-r.in-anc > .in-shape { stroke: var(--ink-3); stroke-opacity: 1; }
  .in-hw-svg a:hover .in-shape { stroke-opacity: 1; stroke-width: 1.6; }
  .in-hw-svg a:focus-visible .in-shape { stroke: var(--accent); stroke-width: 2.5; stroke-opacity: 1; }
  .in-hw-svg a .in-lab { text-decoration: underline dotted; text-decoration-color: rgba(236, 238, 246, .35); }
  .in-hw-svg .in-pill { fill: var(--surface-3); stroke: var(--line-2); }
  .in-hw-svg .in-t-core .in-pill { stroke: var(--core); stroke-opacity: .6; }

  /* device software map */
  .in-dsfig > .fig-dock { padding-top: 12px; }
  .in-ds { --cols: minmax(150px, 1.05fr) repeat(3, minmax(0, 1fr)) minmax(0, .95fr); position: relative; font-size: 13px; }
  .in-ds-row { display: grid; grid-template-columns: var(--cols); border-radius: 9px; transition: background .15s, box-shadow .15s, opacity .15s; }
  .in-ds-row > div { padding: 8px 9px; min-width: 0; overflow-wrap: anywhere; }
  .in-ds-row + .in-ds-row { border-top: 1px solid var(--line); }
  .in-ds-head { border-bottom: 1px solid var(--line-2) !important; }
  .in-ds-head > div { font: 600 13px var(--font-body); color: var(--ink); padding-bottom: 10px; }
  .in-ds-head small { display: block; margin-top: 3px; font: 500 10px/1.45 var(--font-mono); color: var(--ink-3); letter-spacing: .02em; }
  .in-ds-head small a.in-chip.in-plain { color: var(--ink-2); }
  .in-ds-head .in-ds-c[data-c="ptx"], .in-ds-head .in-ds-c[data-c="sass"] { position: relative; }
  .in-ds-head .in-ds-c[data-c="ptx"]::before, .in-ds-head .in-ds-c[data-c="sass"]::before { content: "→"; position: absolute; left: -7px; top: 7px; color: var(--accent); font: 600 13px var(--font-mono); }
  .in-ds-grp { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; padding: 14px 9px 6px; font: 600 11px var(--font-mono); letter-spacing: .1em; text-transform: uppercase; color: var(--ink-3); }
  .in-ds-grp small { font: 400 12px var(--font-body); letter-spacing: 0; text-transform: none; color: var(--ink-3); }
  .in-ds-grp a.in-chip.in-plain { font: 600 12.5px var(--font-mono); letter-spacing: .08em; }
  .in-ds-lv { display: flex; gap: 9px; align-items: flex-start; }
  .in-ds-lv svg { width: 38px; height: 24px; flex: none; margin-top: 1px; }
  .in-ds-lv b { display: block; font-weight: 600; color: var(--ink); font-size: 13.5px; }
  .in-ds-lv small { display: block; font: 500 10.5px/1.45 var(--font-mono); color: var(--ink-3); margin-top: 2px; }
  .in-ds-lv em { display: block; font-style: normal; font-size: 12px; color: var(--ink-2); margin-top: 2px; }
  .in-ds-c { color: var(--ink-body); line-height: 1.5; }
  .in-ds-c code { font-size: 11.5px !important; white-space: normal !important; overflow-wrap: anywhere; }
  .in-ds-row.in-dimrow { opacity: .62; }
  .in-ds-row:not(.in-ds-head):hover, .in-ds-row.on { background: rgba(255, 255, 255, .045); box-shadow: inset 0 0 0 1px var(--line-2); }
  .in-ds-row.pair { background: rgba(111, 166, 255, .07); box-shadow: inset 0 0 0 1px rgba(111, 166, 255, .35); }
  .in-ds[data-col="cpp"] .in-ds-c[data-c="cpp"], .in-ds[data-col="ptx"] .in-ds-c[data-c="ptx"], .in-ds[data-col="sass"] .in-ds-c[data-c="sass"], .in-ds[data-col="hw"] .in-ds-c[data-c="hw"] { background: rgba(255, 138, 91, .07); }
  .in-ds-alt { margin-top: 12px; padding: 11px 13px; border: 1px dashed var(--line-2); border-radius: 11px; font-size: 13.5px; line-height: 1.55; color: var(--ink-2); }
  .in-ds-alt b { color: var(--ink); }
  .in-ds-g .in-gl { stroke: var(--ink-2); fill: none; stroke-width: 1.3; stroke-linecap: round; }
  .in-ds-g .in-gf { fill: var(--ink-2); fill-opacity: .14; stroke: var(--ink-3); stroke-width: 1; }
  .in-ds-g .in-gc { fill: var(--ink-2); }
  .in-ds-map, .in-ds-nest { margin: 0; }
  .in-nest { display: block; width: 100%; max-width: 960px; height: auto; margin: 0 auto; }
  .in-nest .in-nest-lv { cursor: pointer; }
  .in-nest text { font-family: var(--font-mono); }
  .in-nest .in-nest-box { fill: rgba(255, 255, 255, .018); stroke: var(--line-2); stroke-width: 1.2; stroke-dasharray: 5 4; transition: stroke .2s, fill .2s; }
  .in-nest .in-nest-mini { fill: var(--surface-2); stroke: var(--line-2); stroke-width: 1; transition: stroke .2s, fill .2s; }
  .in-nest .in-nest-tick { fill: var(--ink-3); transition: fill .2s; }
  .in-nest .in-nest-cl { fill: none; stroke: var(--ink-3); stroke-width: 1.3; stroke-dasharray: 3 3; transition: stroke .2s; }
  .in-nest .in-nest-zoom { fill: rgba(255, 255, 255, .025); stroke: var(--line); stroke-width: 1; }
  .in-nest .in-nest-wg { fill: rgba(255, 255, 255, .02); stroke: var(--line-2); stroke-width: 1.1; transition: stroke .2s, fill .2s; }
  .in-nest .in-nest-warp { fill: var(--surface-2); stroke: var(--line-2); stroke-width: 1; transition: stroke .2s, fill .2s; }
  .in-nest .in-nest-str { fill: none; stroke: var(--ink-3); stroke-width: 1; transition: stroke .2s; }
  .in-nest .in-nest-one { fill: none; stroke: var(--ink-2); stroke-width: 1.6; stroke-linecap: round; transition: stroke .2s, stroke-width .2s; }
  .in-nest .in-nest-t { fill: var(--ink-2); font-size: 12px; font-weight: 600; }
  .in-nest .in-nest-ts { font-size: 11px; }
  .in-nest .in-nest-wl { fill: var(--ink-3); font-size: 10.5px; }
  .in-nest .in-nest-hw { fill: var(--ink-3); font-size: 10.5px; transition: fill .2s; }
  .in-nest .on .in-nest-t, .in-nest .on .in-nest-wl { fill: var(--ink); }
  .in-nest .on .in-nest-hw { fill: var(--control); }
  .in-nest .on .in-nest-box, .in-nest .on .in-nest-wg { fill: rgba(236, 238, 246, .05); stroke: var(--ink-2); stroke-dasharray: none; stroke-width: 1.5; }
  .in-nest .on .in-nest-mini, .in-nest .on .in-nest-warp { fill: var(--surface-3); stroke: var(--ink-2); }
  .in-nest .on .in-nest-tick { fill: var(--ink-2); }
  .in-nest .on .in-nest-cl { stroke: var(--ink); stroke-width: 1.8; }
  .in-nest .on .in-nest-str { stroke: var(--ink-2); }
  .in-nest .on .in-nest-one { stroke: #ffffff; stroke-width: 2.6; }
  .in-nest .pair .in-nest-box, .in-nest .pair .in-nest-mini, .in-nest .pair .in-nest-warp { stroke: var(--memory); stroke-dasharray: none; }
  .in-nest .pair .in-nest-one { stroke: var(--memory); stroke-width: 2.6; }
  .in-nest .pair .in-nest-t { fill: var(--memory); }
  .in-ds-g .in-gm { fill: var(--memory); fill-opacity: .2; stroke: var(--memory); stroke-width: 1.1; }
  @media (max-width: 760px) {
    .in-ds:not([data-col="all"]) { --cols: minmax(118px, .85fr) minmax(0, 1fr); }
    .in-ds:not([data-col="all"]) .in-ds-c { display: none; }
    .in-ds[data-col="cpp"] .in-ds-c[data-c="cpp"], .in-ds[data-col="ptx"] .in-ds-c[data-c="ptx"], .in-ds[data-col="sass"] .in-ds-c[data-c="sass"], .in-ds[data-col="hw"] .in-ds-c[data-c="hw"] { display: block; background: none; }
    .in-ds:not([data-col="all"]) .in-ds-head .in-ds-c::before { display: none; }
    .in-ds[data-col="all"] { min-width: 820px; }
    .in-ds-lv svg { display: none; }
  }

  /* host software map: the CPU side in lavender (--host), the GPU in green (--core), the traced call path in
     amber (--control: the host issuing work), copper only on the box in focus */
  .in-hs { position: relative; }
  .in-hs-host { border: 1px dashed rgba(184, 164, 255, .45); border-radius: 14px; padding: 12px 10px 10px; background: rgba(184, 164, 255, .03); }
  .in-hs-cap { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; margin: 0 4px 10px; font: 500 10px var(--font-mono); letter-spacing: .13em; text-transform: uppercase; color: var(--host); }
  .in-hs-cap a.in-chip { text-transform: none; letter-spacing: 0; }
  .in-hs-cols { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.08fr) minmax(0, .82fr); gap: 10px; }
  .in-hs-col { border: 1px solid rgba(184, 164, 255, .16); border-radius: 11px; background: rgba(8, 9, 14, .5); padding: 9px; display: flex; flex-direction: column; gap: 7px; min-width: 0; }
  .in-hs-col > .in-hs-h { margin: 0 2px 2px; font: 600 10px var(--font-mono); letter-spacing: .12em; text-transform: uppercase; color: #a99bd9; }
  .in-hs-pair { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 7px; }
  .in-hs-rt { grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); column-gap: 22px; margin-bottom: 15px; }
  .in-hs-n { position: relative; z-index: 2; border: 1px solid rgba(184, 164, 255, .3); border-radius: 9px; background: #1d1d2e; padding: 7px 9px 8px; min-width: 0; transition: border-color .2s, background .2s, box-shadow .2s; }
  .in-hs-n a.in-chip { padding: 0; border: 0; background: none; font: 650 13.5px/1.25 var(--font-body); color: var(--ink); white-space: normal; }
  .in-hs-n a.in-chip::before { width: 6px; height: 6px; }
  .in-hs-n a.in-chip:hover { background: none; text-decoration: underline; text-decoration-color: var(--c); }
  .in-hs-n > b { display: block; font: 650 13.5px/1.25 var(--font-body); color: var(--ink-2); }
  .in-hs-n small { display: block; margin-top: 3px; font-size: 11.5px; line-height: 1.35; color: #8e93ab; }
  .in-hs-n.in-muted { background: #12121c; border-style: dashed; }
  .in-file { display: inline-flex; margin-top: 6px; }
  .in-file a.in-chip { font: 500 11px var(--font-mono) !important; color: var(--ink-2) !important; padding: 2px 7px 2px 6px !important; border: 1px solid var(--line-2) !important; border-radius: 4px 9px 4px 4px !important; background: #0d0e16 !important; }
  .in-file a.in-chip::before { border-radius: 1px; }
  .in-hs-grp { border: 1px solid rgba(184, 164, 255, .2); border-radius: 10px; padding: 7px; display: grid; gap: 6px; }
  .in-hs-grp > a.in-chip, .in-hs-gl { padding: 0 2px; border: 0; background: none; font: 600 11.5px var(--font-mono); color: var(--ink-2); }
  .in-hs-grp > small { font-size: 11px; color: #8e93ab; margin-top: -4px; padding: 0 2px; }
  .in-hs-space { display: flex; justify-content: space-between; gap: 8px; padding: 2px 4px; border-top: 1px dashed rgba(184, 164, 255, .35); font: 500 9.5px var(--font-mono); letter-spacing: .08em; text-transform: uppercase; color: #8e93ab; }
  .in-hs-gpu { margin-top: 10px; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 11px 14px; border-radius: 12px; border: 1px solid rgba(69, 212, 155, .55);
    background: #0f1d19; font: 500 10px var(--font-mono); letter-spacing: .13em; text-transform: uppercase; color: var(--core); position: relative; z-index: 2; transition: border-color .2s, box-shadow .2s; }
  .in-hs-gpu a.in-chip { text-transform: none; letter-spacing: 0; }
  /* off-path cards keep an opaque background (so connectors pass behind them); their text steps down a
     shade but stays above 4.5:1, since every name is still a link */
  .in-hs.in-pathing .in-hs-n:not(.in-lit):not(.in-watch) a.in-chip, .in-hs.in-pathing .in-hs-n:not(.in-lit):not(.in-watch) > b { color: var(--ink-2); }
  .in-hs.in-pathing .in-hs-n:not(.in-lit):not(.in-watch) a.in-chip::before { opacity: .45; }
  .in-hs.in-pathing .in-hs-n:not(.in-lit):not(.in-watch) { border-color: rgba(184, 164, 255, .16); }
  .in-hs .in-hs-n.in-lit { border-color: var(--control); background: #24233a; box-shadow: 0 0 0 1px rgba(255, 198, 92, .45) inset; }
  .in-hs .in-hs-n.in-lit small { color: var(--ink-2); }
  .in-hs .in-hs-gpu.in-lit { border-color: var(--core); box-shadow: 0 0 0 1px rgba(69, 212, 155, .5) inset; }
  .in-hs .in-watch { border-style: dashed; border-color: var(--ink-2); }
  .in-hs .in-hs-n:hover, .in-hs .in-hs-n:focus-within { border-color: var(--accent); }
  .in-hs .in-ovl-p { stroke: var(--control); }
  .in-hs .in-ovl-h { fill: var(--control); }
  .in-stat-wrap b { white-space: normal !important; line-height: 1.3 !important; }
  .in-step { position: absolute; top: -8px; right: -6px; z-index: 2; width: 19px; height: 19px; border-radius: 50%; background: var(--ink); color: var(--bg); box-shadow: 0 0 0 2px var(--bg); font: 700 10.5px/19px var(--font-mono); text-align: center; font-style: normal; }
  @media (max-width: 860px) {
    .in-hs-cols { grid-template-columns: minmax(0, 1fr); }
    .in-hs-cols > .in-hs-col:nth-child(2) { order: -1; }
  }

  /* perf: bits */
  .in-bits { display: grid; gap: 6px; }
  .in-bits-head { display: flex; flex-wrap: wrap; gap: 4px 18px; font-size: 14px; color: var(--ink-2); margin-bottom: 4px; }
  .in-bits-head b { font: 600 15px var(--font-mono); color: var(--ink); }
  .in-bits-row { display: grid; grid-template-columns: 78px minmax(88px, 120px) minmax(0, 1fr) 84px 54px; gap: 10px; align-items: center; padding: 8px 10px; border: 1px solid var(--line); border-radius: 10px; background: rgba(8, 9, 14, .55); }
  .in-bits-name { font: 600 12px var(--font-mono); color: var(--ink); }
  .in-bits-val { font: 500 13px var(--font-mono); color: var(--ink); font-variant-numeric: tabular-nums; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .in-bits-bar { position: relative; display: grid; grid-template-columns: repeat(24, minmax(0, 1fr)); gap: 2px; min-width: 0; }
  .in-bits-bar i, .in-bk { height: 14px; border-radius: 2px; background: var(--line); opacity: .45; }
  .in-bits-bar i.a, .in-bk.a { background: var(--core); opacity: 1; }
  .in-bits-bar i.bad, .in-bk.bad { background: var(--danger); opacity: .8; }
  .in-bits-bar i.luck, .in-bk.luck { background: repeating-linear-gradient(135deg, var(--core) 0 2px, transparent 2px 4px); box-shadow: inset 0 0 0 1px rgba(69, 212, 155, .5); opacity: .9; }
  .in-bits-tol { position: absolute; top: -5px; bottom: -5px; width: 2px; border-radius: 1px; background: var(--accent); left: calc((100% + 2px) * var(--t, 8) / 24 - 2px); pointer-events: none; }
  .in-bits-dem b { color: var(--accent) !important; }
  .in-bits-leg { margin-top: 6px; }
  .in-bits-leg .in-bk { display: inline-block; width: 12px; height: 10px; border-radius: 2px; }
  .in-bits-n { font: 500 12px/1.25 var(--font-mono); color: var(--ink-2); text-align: right; white-space: nowrap; }
  .in-bits-n small { display: block; font-size: 10px; color: var(--ink-3); }
  .in-bits-v { font: 700 10.5px var(--font-mono); letter-spacing: .08em; text-transform: uppercase; text-align: center; padding: 3px 0; border-radius: 6px; }
  .in-bits-v.ok { color: var(--core); background: var(--core-a); }
  .in-bits-v.no { color: var(--danger); background: var(--danger-a); }
  .in-vs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .in-vs > div { border: 1px solid var(--line); border-radius: 12px; padding: 13px 15px 14px; background: var(--surface); }
  /* the two sides are the entry's first subsections (h3), styled as the small labels they were */
  .entry-body .in-vs h3 { margin: 0 0 8px; font: 600 12.5px var(--font-mono); letter-spacing: .1em; text-transform: uppercase; color: var(--ink-2); }
  .in-vs p { font-size: 14.5px; line-height: 1.6; }
  .in-vs p + p { margin-top: .6em; }
  .in-vs .in-gpu-side { border-color: rgba(255, 198, 92, .4); }
  .in-per { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
  .in-per span { font: 600 11px var(--font-mono); letter-spacing: .06em; padding: 5px 9px; border-radius: 999px; border: 1px solid rgba(255, 198, 92, .45); color: var(--control); }
  .in-slogan { margin: 1.4em 0 !important; padding: 18px 0 16px; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); text-align: center; }
  .in-slogan q { display: block; font-family: var(--font-display); font-weight: 800; font-size: clamp(34px, 6.2vw, 64px); line-height: .98; color: var(--ink); letter-spacing: .005em; quotes: "“" "”"; }
  .in-slogan span { display: block; margin-top: 10px; font: 500 11px var(--font-mono); letter-spacing: .12em; text-transform: uppercase; color: var(--ink-3); }

  /* README: the site guide's detail, folded away */
  .in-more { margin-top: 1.6em; border: 1px solid var(--line); border-radius: 12px; background: var(--surface); padding: 0 16px; }
  .in-more > summary { display: grid; grid-template-columns: 14px minmax(0, 1fr); align-items: baseline; gap: 4px 8px; padding: 13px 0; cursor: pointer; list-style: none;
    font: 600 12.5px var(--font-mono); letter-spacing: .1em; text-transform: uppercase; color: var(--ink-2); }
  .in-more > summary::-webkit-details-marker { display: none; }
  .in-more > summary::before { content: "+"; width: 12px; color: var(--ink); font-weight: 700; }
  .in-more[open] > summary::before { content: "−"; }
  .in-more > summary:hover { color: var(--ink); }
  .in-more > summary small { grid-column: 2; font: 400 12px var(--font-body); letter-spacing: 0; text-transform: none; color: var(--ink-2); }
  .in-more > summary small kbd { font-size: 10.5px; }
  .in-more[open] { padding-bottom: 16px; }
  .in-more > h4:first-of-type { margin-top: .4em; }

  /* perf ladder */
  .in-ladder { position: relative; display: grid; gap: 8px; }
  .in-rung { display: grid; grid-template-columns: minmax(0, 250px) minmax(0, 1fr); gap: 14px; align-items: center; padding: 10px 12px; border: 1px solid var(--line); border-radius: 12px; background: rgba(8, 9, 14, .55); position: relative; }
  .in-rung-q { display: grid; grid-template-columns: 26px 1fr; gap: 2px 10px; align-items: start; }
  .in-rung-q > b { grid-row: span 2; width: 26px; height: 26px; border-radius: 7px; background: var(--surface-3); border: 1px solid var(--line-2); color: var(--control); font: 700 13px/24px var(--font-mono); text-align: center; }
  .in-rung-q > span { font-size: 14px; line-height: 1.35; color: var(--ink); font-weight: 600; }
  .in-rung-q > small { font: 500 10px/1.45 var(--font-mono); color: var(--ink-3); letter-spacing: .02em; }
  .in-rung-chips { display: flex; flex-wrap: wrap; gap: 14px 12px; }
  .in-rung-chips a.in-chip { position: relative; z-index: 2; font-size: 13px; padding: 5px 11px 5px 9px; }
  .in-rung-chips a.in-chip[data-tone="core"]::before { background: var(--core); }
  .in-rung-chips a.in-chip[data-tone="memory"]::before { background: var(--memory); }
  .in-rung-chips a.in-chip[data-tone="control"]::before { background: var(--control); }
  .in-rung-chips a.in-chip[data-tone="danger"]::before { background: var(--danger); }
  .in-rung-chips a.in-chip[data-tone="host"]::before { background: var(--host); }
  .in-rung-chips a.in-chip[data-tone=""]::before { background: var(--ink-2); }
  /* off-path chips are still links: dim the border and dot, keep the text at 5.8:1 on the chip */
  .in-ladder.in-pathing a.in-chip:not(.in-lit) { color: #8a8fa8; border-color: var(--line); }
  .in-ladder.in-pathing a.in-chip:not(.in-lit)::before { opacity: .3; }
  .in-ladder.in-pathing a.in-chip.in-lit { opacity: 1; border-color: var(--accent); color: var(--ink); background: var(--surface-3); }
  .in-ladder a.in-chip[data-step]::after { content: attr(data-step); position: absolute; top: -9px; right: -7px; width: 17px; height: 17px; border-radius: 50%; background: var(--accent); color: var(--on-accent); font: 700 10px/17px var(--font-mono); text-align: center; }
  .in-legend { display: flex; flex-wrap: wrap; gap: 6px 14px; font: 500 11px var(--font-mono); color: var(--ink-3); }
  .in-legend span { display: inline-flex; align-items: center; gap: 6px; }
  .in-legend i { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }

  /* credits */
  .in-credits { display: grid; gap: 6px; }
  .in-cr-h { display: flex; align-items: baseline; gap: 14px; margin-top: 1.4em !important; padding-bottom: 8px; border-bottom: 1px solid var(--line-2); font-size: 34px !important; text-transform: uppercase; letter-spacing: .02em !important; }
  .in-cr-h small { font: 500 11px var(--font-mono); letter-spacing: .12em; color: var(--ink-3); text-transform: uppercase; margin-left: auto; }
  .in-cr-row { display: grid; grid-template-columns: minmax(0, 250px) minmax(0, 1fr); gap: 18px; padding: 12px 2px; border-bottom: 1px solid var(--line); align-items: start; }
  .in-cr-names { display: grid; gap: 4px; }
  .in-cr-names > span { display: flex; flex-wrap: wrap; align-items: baseline; gap: 2px 8px; }
  a.in-person { font-family: var(--font-display); font-weight: 700; font-size: 23px; line-height: 1.1; letter-spacing: .01em; color: var(--ink); text-decoration: none; }
  a.in-person:hover { color: #fff; text-decoration: underline; text-decoration-color: var(--accent); }
  .in-noln { font-family: var(--font-display); font-weight: 700; font-size: 23px; line-height: 1.1; letter-spacing: .01em; color: var(--ink); }
  .in-host { font: 500 10.5px var(--font-mono); color: var(--ink-3); }
  .in-cr-role { font-size: 15.5px; line-height: 1.6; color: var(--ink-body); padding-top: 2px; }
  .in-cr-role code { font-size: .86em; }
  .in-errata { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 8px; margin-top: 10px !important; }
  .in-errata > span { display: flex; flex-direction: column; gap: 2px; padding: 10px 12px; border: 1px solid var(--line); border-radius: 10px; background: var(--surface); }
  .in-errata a.in-person, .in-errata .in-noln { font-size: 20px; }
  .in-cr-strip { display: flex; gap: 2px; height: 46px; align-items: flex-end; }
  .in-cr-strip i { flex: 1 1 0; min-width: 0; height: 60%; border-radius: 2px; background: var(--c); opacity: .18; transition: opacity .2s, height .2s; }
  .in-cr-strip i.p { height: 80%; }
  .in-cr-strip i.on { opacity: 1; height: 100%; }
  .in-cr-tags { position: relative; margin-top: 6px; transition: height .2s; }
  .in-cr-tags span { position: absolute; font: 500 10.5px/1.3 var(--font-mono); color: var(--ink); white-space: nowrap; padding-top: 2px; border-top: 2px solid var(--c); }
  .in-cr-picked { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; min-height: 28px; }
  .in-cr-picked a.in-chip { white-space: normal; }
  .in-companion { border-color: var(--line-2) !important; }

  @media (max-width: 900px) {
    .in-plate-top { grid-template-columns: minmax(0, 1fr); gap: 16px; }
    .in-loc { max-width: 320px; }
  }
  @media (max-width: 720px) {
    .in-docs, .in-src, .in-navs, .in-notes, .in-chapters, .in-vs { grid-template-columns: minmax(0, 1fr); }
    .in-docs > .in-doc:nth-child(3) { display: block; }
    .in-doc-cmd { font-size: 11.5px; }
    .in-runs { grid-template-columns: repeat(3, minmax(0, 1fr)); row-gap: 10px; }
    .in-tree-sec { display: none; }
    .in-atlas { grid-template-columns: minmax(0, 1fr); }
    .in-lens .in-chips { flex-direction: row; flex-wrap: wrap; }
    .in-trail { grid-template-columns: minmax(0, 1fr); gap: 0; }
    .in-tcard[data-i="1"] { margin: 0 0 0 14px; }
    .in-tcard[data-i="2"] { margin: 0 0 0 28px; }
    .in-tarrow, .in-tarrow[data-i="1"], .in-tarrow[data-i="2"] { margin: 0; height: 30px; align-items: center; }
    .in-tarrow[data-i="1"] { padding-left: 14px; } .in-tarrow[data-i="2"] { padding-left: 28px; }
    .in-tarrow svg { transform: rotate(90deg); width: 22px; }
    .in-web-ol li { grid-template-columns: 22px minmax(0, 1fr) 64px; }
    .in-web-ol li .in-web-deg { display: none; }
    .in-anat { grid-template-columns: minmax(0, 1fr); }
    .in-rung { grid-template-columns: minmax(0, 1fr); gap: 10px; }
    .in-cr-row { grid-template-columns: minmax(0, 1fr); gap: 6px; }
    .in-cr-h { font-size: 28px !important; }
    .in-bits-row { grid-template-columns: 70px minmax(0, 1fr) 76px; grid-template-areas: "n v x" "b b b" "k k k"; gap: 8px 10px; }
    .in-bits-n { text-align: left; } .in-bits-n small { display: inline; margin-left: 8px; }
    .in-bits-name { grid-area: n; } .in-bits-val { grid-area: v; } .in-bits-v { grid-area: x; } .in-bits-bar { grid-area: b; } .in-bits-n { grid-area: k; }
  }
  `);

  /* ═════════════════════════ README ═════════════════════════ */
  const BANNER = [
    ' ██████╗ ██████╗ ██╗   ██╗',
    '██╔════╝ ██╔══██╗██║   ██║',
    '██║  ███╗██████╔╝██║   ██║',
    '██║   ██║██╔═══╝ ██║   ██║',
    '╚██████╔╝██║     ╚██████╔╝',
    ' ╚═════╝ ╚═╝      ╚═════╝',
    ' ██████╗ ██╗      ██████╗ ███████╗███████╗ █████╗ ██████╗ ██╗   ██╗',
    '██╔════╝ ██║     ██╔═══██╗██╔════╝██╔════╝██╔══██╗██╔══██╗╚██╗ ██╔╝',
    '██║  ███╗██║     ██║   ██║███████╗███████╗███████║██████╔╝ ╚████╔╝',
    '██║   ██║██║     ██║   ██║╚════██║╚════██║██╔══██║██╔══██╗  ╚██╔╝',
    '╚██████╔╝███████╗╚██████╔╝███████║███████║██║  ██║██║  ██║   ██║',
    ' ╚═════╝ ╚══════╝ ╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝',
  ];
  function bannerHTML() {
    const lines = BANNER.map((ln, i) => {
      const h = ln.replace(/█+|[╔╗╚╝═║]+/g, (m) => `<span class="${m[0] === '█' ? 'in-b' : 'in-s'}">${m}</span>`);
      return i >= 6 ? `<span class="in-row2">${h}</span>` : h;
    });
    return `<div class="in-term" role="img" aria-label="The README's banner: the words GPU GLOSSARY drawn in block characters">
      <div class="in-term-h"><span>readme.md</span><span>github.com/modal-labs/gpu-glossary</span></div>
      <div class="in-term-b"><div class="in-prompt"><b>~/gpu-glossary</b> $ cat readme.md</div><pre class="in-banner" aria-hidden="true">${lines.join('\n')}</pre></div>
    </div>`;
  }

  /* Fig: one version number, three spellings. art / famArt: the article before the GPU's
     name and before its family, as read aloud ("an H100", "an Ampere GPU"). suf: the target
     suffixes nvcc offers for that compute capability. fam: for an f target, the minor versions
     NVIDIA's Family-Specific Compatibility table lists for compute_100f. */
  const GPUS = [
    { id: 't4', name: 'T4', art: 'A', fam: 'Turing', famArt: 'a', maj: 7, min: 5, suf: [] },
    { id: 'a100', name: 'A100', art: 'An', fam: 'Ampere', famArt: 'an', maj: 8, min: 0, suf: [] },
    { id: 'a10g', name: 'A10G', art: 'An', fam: 'Ampere', famArt: 'an', maj: 8, min: 6, suf: [] },
    { id: 'l4', name: 'L4', art: 'An', fam: 'Ada Lovelace', famArt: 'an', maj: 8, min: 9, suf: [] },
    { id: 'h100', name: 'H100', art: 'An', fam: 'Hopper', famArt: 'a', maj: 9, min: 0, suf: ['a'] },
    { id: 'b200', name: 'B200', art: 'A', fam: 'Blackwell', famArt: 'a', maj: 10, min: 0, suf: ['a', 'f'], family: [0, 3, 7] },
  ];
  const RUN_LABEL = { sass: 'SASS as is', jit: 'PTX, JIT', no: 'won\'t run' };
  /* How a binary built by the figure's nvcc flags for GPU g with target suffix suf runs on GPU d. */
  function runsOn(g, suf, d) {
    if (suf === 'a') return d.maj === g.maj && d.min === g.min ? 'sass' : 'no';
    if (suf === 'f') return d.maj === g.maj && (g.family || [g.min]).includes(d.min) ? 'sass' : 'no';
    if (d.maj === g.maj && d.min >= g.min) return 'sass';
    return d.maj > g.maj ? 'jit' : 'no';
  }
  const listAnd = (xs) => (xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1]);
  function buildNames(ctx, slot) {
    const f = fig(ctx, slot, {
      title: 'One version number, three spellings', hint: 'pick a GPU and a target suffix',
      caption: 'The same number spelled three ways, <code>9.0</code>, <code>sm_90</code> and <code>compute_90</code>, across three sets of documentation. The SM architecture versions the physical hardware and the SASS it runs; compute capability versions PTX, the virtual instruction set, and promises that old PTX runs on newer GPUs; nvcc\'s flags choose both. Inside a PTX file the virtual target borrows the <code>sm_</code> spelling. A suffix (<code>a</code>, <code>f</code>) changes what nvcc builds, never the GPU\'s own version, and the bottom row shows which of the six GPUs can run the result.',
    });
    let gi = GPUS.findIndex((g) => g.id === 'h100'), suf = '';
    f.stage.innerHTML = `<div class="in-names">
      <div class="in-names-top"><span class="in-names-gpu" data-k="gpu"></span><span>is <span data-k="famArt"></span> <b data-k="fam"></b> GPU. Its version number:</span><span class="in-ver in-names-big" data-k="ver"></span><span class="in-names-tgt" data-k="tgtwrap" hidden>build target <span class="in-ver" data-k="tgt"></span></span></div>
      <div class="in-docs">
        <article class="in-doc" style="--c:var(--ch-device-hardware)">
          <div class="in-doc-src">hardware docs</div>
          <h4>${tl('streaming-multiprocessor-architecture', 'SM Architecture')}</h4>
          <dl><dt>SM version</dt><dd><span class="in-ver" data-k="ver"></span></dd>
            <dt>family</dt><dd data-k="fam"></dd>
            <dt>physical target</dt><dd><code>sm_<span class="in-ver" data-k="num"></span></code></dd>
            <dt>versions</dt><dd>${tl('streaming-assembler', 'SASS')} machine code</dd></dl>
        </article>
        <article class="in-doc" style="--c:var(--ch-device-software)">
          <div class="in-doc-src">programming guide, PTX ISA</div>
          <h4>${tl('compute-capability', 'Compute Capability')}</h4>
          <dl><dt>version</dt><dd><span class="in-ver" data-k="ver"></span></dd>
            <dt>feature set</dt><dd data-k="fset"></dd>
            <dt>virtual target</dt><dd><code>compute_<span class="in-ver" data-k="num"></span></code></dd>
            <dt>inside PTX</dt><dd><code>.target sm_<span class="in-ver" data-k="num"></span></code></dd>
            <dt>versions</dt><dd>${tl('parallel-thread-execution', 'PTX')} instructions</dd></dl>
        </article>
        <article class="in-doc" style="--c:var(--ch-host-software)">
          <div class="in-doc-src">nvcc documentation</div>
          <h4>${tl('nvcc', 'nvcc compiler flags')}</h4>
          <pre class="in-doc-cmd"><span class="c-dim">$</span> nvcc \\\n  --gpu-architecture=compute_<span class="in-ver" data-k="num"></span> \\\n  --gpu-code=sm_<span class="in-ver" data-k="num"></span>,compute_<span class="in-ver" data-k="num"></span> \\\n  kernel.cu</pre>
          <p class="in-doc-note" data-k="cmdnote"></p>
        </article>
      </div>
      <div class="in-runs-h"><span>Where this binary runs</span><b data-k="runsum"></b></div>
      <div class="in-runs" role="list" aria-label="Which of the six GPUs can run the binary these flags build">${GPUS.map((d) => `<div class="in-run" role="listitem" data-g="${d.id}"><b>${d.name}</b><span>${d.maj}.${d.min}</span><em></em></div>`).join('')}</div>
      <div class="in-runs-leg"><span><i class="c-core">SASS as is</i>: the GPU runs the embedded machine code</span><span><i style="color:var(--host)">PTX, JIT</i>: the driver compiles the embedded PTX to SASS when the program loads</span><span><i class="c-danger">won't run</i>: neither fits this GPU</span></div>
    </div>`;
    const gpuSeg = GG.ui.seg(f.controls, { label: 'GPU', options: GPUS.map((g, i) => ({ value: i, label: g.name, title: g.fam })), value: gi, onChange: (v) => { gi = v; update(); } });
    const sufSeg = GG.ui.seg(f.controls, {
      label: 'Target suffix', value: '',
      options: [{ value: '', label: 'none' }, { value: 'a', label: 'a', title: 'architecture-specific features (Hopper and later)' }, { value: 'f', label: 'f', title: 'family-specific features (Blackwell and later)' }],
      onChange: (v) => { suf = v; update(); },
    });
    const sMaj = GG.ui.stat(f.readouts, { label: 'major', value: '' });
    const sMin = GG.ui.stat(f.readouts, { label: 'minor', value: '' });
    const sSuf = GG.ui.stat(f.readouts, { label: 'target suffix', value: '' });
    const sRun = GG.ui.stat(f.readouts, { label: 'runs on', value: '' });
    const setK = (k, v) => f.stage.querySelectorAll(`[data-k="${k}"]`).forEach((el) => { el.textContent = v; });
    const cells = [...f.stage.querySelectorAll('.in-run')];
    function update() {
      const g = GPUS[gi];
      if (suf && !g.suf.includes(suf)) suf = '';
      // the GPU's own version never carries a suffix; only the compilation targets do
      const ver = `${g.maj}.${g.min}`, tgt = ver + suf, num = `${g.maj}${g.min}${suf}`, base = `${g.maj}${g.min}`;
      setK('gpu', g.name); setK('fam', g.fam); setK('famArt', g.famArt); setK('ver', ver); setK('num', num); setK('tgt', tgt);
      f.stage.querySelector('[data-k="tgtwrap"]').hidden = !suf;
      setK('fset', suf === 'a' ? `${tgt}, architecture-specific` : suf === 'f' ? `${tgt}, family-specific` : `${ver}, baseline`);
      const later = GPUS.filter((d) => d.maj === g.maj && d.min > g.min).map((d) => `the ${d.name} (${d.maj}.${d.min})`);
      const older = GPUS.filter((d) => d.maj === g.maj && d.min < g.min).map((d) => `the ${d.name} (${d.maj}.${d.min})`);
      const cmd = f.stage.querySelector('[data-k="cmdnote"]');
      let note = 'Compiles to PTX for the virtual architecture, then to SASS for the physical one, and embeds both in the binary. ';
      if (!suf) {
        note += `The SASS runs as is on ${ver} GPUs and on any later ${g.maj}.x GPU${later.length ? `, such as ${listAnd(later)}` : ''}, because SASS is compatible upward across minor versions of the same major version. On a GPU with a newer major version the driver JIT-compiles the PTX instead.`;
        if (older.length) note += ` Neither the SASS nor the PTX runs on ${listAnd(older)}: ${older.length > 1 ? 'their minor versions are' : 'its minor version is'} lower.`;
        note += ` (<code>-arch=sm_${num}</code> is shorthand for exactly these flags.)`;
      } else if (suf === 'a') {
        note += `Both the <code>sm_${num}</code> SASS and the <code>compute_${num}</code> PTX use architecture-specific features, so they run only on compute capability ${ver} GPUs: not on later ${g.maj}.x GPUs, and the driver cannot JIT them for newer ones. (<code>-arch=sm_${num}</code> is shorthand for these flags plus plain <code>compute_${base}</code> PTX, which newer GPUs can JIT-compile.)`;
      } else {
        note += `Both the <code>sm_${num}</code> SASS and the <code>compute_${num}</code> PTX run only on the GPUs of the <code>compute_${num}</code> family, which NVIDIA lists as compute capability ${listAnd((g.family || [g.min]).map((m) => `${g.maj}.${m}`))}; not on GPUs of an earlier or later major version.`;
      }
      cmd.innerHTML = note;
      let nRun = 0;
      cells.forEach((el, i) => {
        const d = GPUS[i], st = runsOn(g, suf, d);
        if (st !== 'no') nRun++;
        el.setAttribute('data-s', st);
        el.toggleAttribute('data-me', i === gi);
        el.querySelector('em').textContent = RUN_LABEL[st];
        el.setAttribute('aria-label', `${d.name}, compute capability ${d.maj}.${d.min}: ${RUN_LABEL[st]}${i === gi ? ', the GPU these flags are built for' : ''}`);
      });
      setK('runsum', `${nRun} of ${GPUS.length} GPUs`);
      sufSeg.el.querySelectorAll('button').forEach((b) => { const v = b.getAttribute('data-value'); b.disabled = !(v === '' || g.suf.includes(v)); });
      sufSeg.set(suf, false);
      gpuSeg.set(gi, false);
      sMaj.set(g.maj); sMin.set(g.min); sSuf.set(suf || 'none', suf ? 'accent' : null); sRun.set(`${nRun} of ${GPUS.length}`);
      let why;
      if (!suf) {
        why = `${g.art} <b>${g.name}</b> is ${g.famArt} ${g.fam} GPU, and its version number is <b>${ver}</b>: that is its SM architecture in the hardware docs and its compute capability in the programming guide. nvcc spells it <code>sm_${num}</code> for the physical target and <code>compute_${num}</code> for the virtual one, and PTX files, confusingly, name the virtual target <code>.target sm_${num}</code>.`;
        if (g.maj === 8) why += ' Major version 8 covers both Ampere (8.0, 8.6) and Ada Lovelace (8.9) GPUs: the major version is almost, but not quite, the architecture family.';
        if (g.suf.length) why += ` Try the ${g.suf.map((s) => '<code>' + s + '</code>').join(' and ')} target suffix${g.suf.length > 1 ? 'es' : ''}.`;
      } else {
        why = `${g.art} <b>${g.name}</b> is still compute capability <b>${ver}</b>: a suffix changes what nvcc builds, not the GPU. The <code>${suf}</code> suffix asks for the <b>${tgt}</b> target, spelled <code>sm_${num}</code>, <code>compute_${num}</code> and <code>.target sm_${num}</code>.`;
        if (suf === 'a') why += ` It unlocks architecture-specific features, like ${g.maj === 9 ? 'Hopper\'s <code>wgmma</code>' : 'Blackwell\'s <code>tcgen05</code>'} instructions. Their compatibility with future GPUs is not guaranteed, even within the same major version, so the binary runs only on ${ver} GPUs.`;
        else why += ' This suffix is new with Blackwell and closer to SemVer: compatibility is guaranteed across minor versions (10.x) but not across major versions.';
      }
      f.setWhy(why);
    }
    update();
  }

  /* Fig: the stack atlas */
  const LAYER_DESC = {
    'host-software': 'Used on the CPU when running GPU programs: the CUDA software platform\'s languages, compilers, APIs and drivers, the tools that monitor and profile, and libraries of ready-made kernels.',
    'device-software': 'Software that runs on the GPU: the CUDA programming model\'s hierarchies of threads and memories, and the PTX and SASS it is written down in.',
    'device-hardware': 'The physical GPU: Streaming Multiprocessors with their cores, schedulers, register files and caches, grouped into clusters, above a pool of GPU RAM.',
    perf: 'The terms you meet when a GPU program is too slow, roughly what NSight Compute reports: bottlenecks, bandwidths and rooflines, latency hiding, occupancy, and the patterns that waste cycles.',
  };
  function buildAtlas(ctx, slot) {
    const f = fig(ctx, slot, {
      title: 'The whole stack, in four parts', hint: isTouch() ? 'tap a term' : 'hover a layer or a term',
      caption: 'The four chapters as layers of one system. Host Software runs on the CPU and drives the GPU; Device Software runs on the GPU and executes on its Device Hardware; Performance cuts across all three. Every chip is a term. Link counts are the glossary\'s own cross-links, read from its source files, counting only links between two terms: pick a term to see the terms it links with, in every chapter.',
    });
    const layer = (sec, cls) => {
      const ts = termsOf(sec);
      return `<section class="in-layer${cls ? ' ' + cls : ''}" data-sec="${sec}" style="--c:${chVar(sec)}">
        <header><span class="in-ico">${ICON[sec]}</span>${tl(sec, SEC_LABEL[sec]).replace('<a ', '<a class="in-layer-name" ')}<span class="in-layer-n">${ts.length} terms</span></header>
        <p>${LAYER_DESC[sec]}</p>
        <div class="in-chips">${ts.map((t) => chip(t.id)).join('')}</div></section>`;
    };
    const arrow = (txt) => `<div class="in-atlas-arrow"><svg viewBox="0 0 12 14" aria-hidden="true"><path d="M6 1v11M2 8l4 4 4-4"/></svg>${txt}</div>`;
    f.stage.innerHTML = `<div class="in-atlas">
      <div class="in-atlas-stack">
        <div class="in-frame"><div class="in-frame-lab"><b>CPU</b> · the “host”</div>${layer('host-software')}</div>
        ${arrow('compiles, launches and manages work on')}
        <div class="in-frame"><div class="in-frame-lab"><b>GPU</b> · the “device”</div>${layer('device-software')}${arrow('executes on')}${layer('device-hardware')}</div>
      </div>
      ${layer('perf', 'in-lens')}
    </div>`;
    const root = f.stage.querySelector('.in-atlas');
    const ov = overlay(root);
    const layers = [...root.querySelectorAll('.in-layer')];
    const total = SECS.reduce((n, s) => n + termsOf(s).length, 0);
    const sT = GG.ui.stat(f.readouts, { label: 'terms', value: total });
    const sS = GG.ui.stat(f.readouts, { label: 'share', value: '100%' });
    const sX = GG.ui.stat(f.readouts, { label: 'cross-chapter, term↔term', value: '' });
    const lab = (st, t) => { st.el.querySelector('i').textContent = t; };
    const labels = (a, b, c) => { lab(sT, a); lab(sS, b); lab(sX, c); };
    const idOf = (a) => a.getAttribute('data-term') || a.getAttribute('data-in-term');
    // link statistics from the glossary's own cross-links, term ↔ term, each pair counted once
    const SG = srcGraph();
    const per = {};
    SECS.forEach((s) => { per[s] = { tot: 0, cross: 0 }; });
    let all = 0, crossAll = 0;
    const seen = new Set();
    GG.order.forEach((t) => {
      if (t.kind !== 'term') return;
      SG.out[t.id].forEach((to) => {
        const u = GG.byId[to];
        if (!u || u.kind !== 'term') return;
        const key = t.id < to ? t.id + '|' + to : to + '|' + t.id;
        if (seen.has(key)) return;
        seen.add(key);
        all++;
        const cross = u.section !== t.section;
        if (cross) crossAll++;
        per[t.section].tot++;
        if (cross) { per[t.section].cross++; per[u.section].tot++; per[u.section].cross++; }
      });
    });
    let curLayer = null, curChip = null, fanNow = null;
    const tapHint = isTouch() ? 'Tap a term to see the terms it links with; tap it again to open it.' : 'Hover a layer, or a term to see the terms it links with.';
    const baseWhy = `Four parts, ${total} terms. Host Software runs on the CPU (the “host”); Device Software runs on the GPU (the “device”) and executes on its Device Hardware; Performance looks across all three. Of the glossary's ${all} links between two of its ${total} terms (leaving out the README, the chapter introductions and the credits), ${crossAll} (${pctS(crossAll / all)}) join different chapters. ${tapHint}`;
    function clearMarks() {
      root.classList.remove('in-lensing', 'in-chipmode');
      layers.forEach((L) => L.classList.remove('in-dim', 'in-hot'));
      root.querySelectorAll('.in-nb, .in-cur').forEach((a) => a.classList.remove('in-nb', 'in-cur'));
      ov.clear(); fanNow = null;
    }
    function reset() {
      curLayer = null; curChip = null;
      clearMarks();
      labels('terms', 'share', 'cross-chapter, term↔term');
      sT.set(total); sS.set('100%'); sX.set(pctS(crossAll / Math.max(1, all)));
      f.setWhy(baseWhy);
    }
    function setLayer(sec) {
      if (curLayer === sec && !curChip) return;
      curLayer = sec; curChip = null;
      clearMarks();
      root.classList.toggle('in-lensing', sec === 'perf');
      layers.forEach((L) => { const on = L.dataset.sec === sec; L.classList.toggle('in-hot', on); L.classList.toggle('in-dim', !on && sec !== 'perf'); });
      const n = termsOf(sec).length, p = per[sec];
      labels('terms', 'share', 'cross-chapter, term↔term');
      sT.set(n); sS.set(pctS(n / total));
      sX.set(p.tot ? pctS(p.cross / p.tot) : '0%');
      const extra = p.tot ? ` Of the ${p.tot} glossary links between its terms and other terms, ${p.cross} connect to other chapters.` : '';
      f.setWhy(`<b>${SEC_LABEL[sec]}</b>: ${n} terms, ${pctS(n / total)} of the glossary. ${LAYER_DESC[sec]}${extra}${sec === 'perf' ? ' It is drawn beside the stack because its terms describe all three layers at once.' : ''}`);
    }
    function chipOn(a, fromTap) {
      const id = idOf(a), t = GG.byId[id];
      if (!t || (curChip === id && !fromTap)) return;
      curLayer = null; curChip = id;
      clearMarks();
      a.classList.add('in-cur');
      const o = SG.out[id], i = SG.in[id];
      const nb = new Set([...o, ...i].filter((x) => GG.byId[x] && GG.byId[x].kind === 'term'));
      root.classList.add('in-chipmode');
      const nbEls = [];
      root.querySelectorAll('a.in-chip').forEach((c) => { if (nb.has(idOf(c))) { c.classList.add('in-nb'); nbEls.push(c); } });
      ov.fan(a, nbEls); fanNow = [a, nbEls];
      const by = {};
      nb.forEach((x) => { const s = GG.byId[x].section; by[s] = (by[s] || 0) + 1; });
      const parts = SECS.filter((s) => by[s]).map((s) => `${by[s]} in ${SEC_LABEL[s]}`);
      const other = [...nb].filter((x) => GG.byId[x].section !== t.section).length;
      labels('linked terms', 'in other chapters', 'share elsewhere');
      sT.set(nb.size); sS.set(other); sX.set(nb.size ? pctS(other / nb.size) : '—');
      const open = fromTap ? ` ${tl(id, 'Open ' + esc(shortName(id)) + ' →')}` : ' Click to read it.';
      f.setWhy(nb.size
        ? `<b>${esc(t.name)}</b> (${SEC_LABEL[t.section]}) links to ${plural(o.size, 'entry', 'entries')} in the glossary and is linked from ${i.size}. Its ${plural(nb.size, 'linked term')}: ${parts.join(', ')}.${open}`
        : `<b>${esc(t.name)}</b> (${SEC_LABEL[t.section]}) has no glossary links to or from other terms.${open}`);
    }
    layers.forEach((L) => {
      L.addEventListener('mouseenter', () => { if (!isTouch()) setLayer(L.dataset.sec); });
      L.addEventListener('mousemove', (e) => { if (!isTouch() && !e.target.closest('a.in-chip') && curChip) setLayer(L.dataset.sec); });
    });
    root.addEventListener('mouseover', (e) => { if (isTouch()) return; const a = e.target.closest('a.in-chip'); if (a) chipOn(a); });
    root.addEventListener('focusin', (e) => { const a = e.target.closest('a.in-chip'); if (a) chipOn(a); else { const L = e.target.closest('.in-layer'); if (L) setLayer(L.dataset.sec); } });
    root.addEventListener('mouseleave', () => { if (!isTouch()) reset(); });
    root.addEventListener('focusout', (e) => { if (!root.contains(e.relatedTarget) && !isTouch()) reset(); });
    armTaps(root, 'a.in-chip', (a) => chipOn(a, true));
    // on touch, tapping a layer's background explains the layer
    root.addEventListener('click', (e) => { if (!isTouch() || e.target.closest('a')) return; const L = e.target.closest('.in-layer'); if (L) setLayer(L.dataset.sec); });
    GG.resize(root, () => { if (fanNow) ov.fan(fanNow[0], fanNow[1]); });
    reset();
  }

  /* Sources */
  function sourcesHTML() {
    const pdf = '<svg viewBox="0 0 38 38" aria-hidden="true"><path d="M9 3h14l7 7v25H9z"/><path d="M23 3v7h7"/><path d="M13 19h12M13 24h12M13 29h8"/></svg>';
    const chat = '<svg viewBox="0 0 38 38" aria-hidden="true"><path d="M4 7h22v14H13l-6 5v-5H4z"/><path d="M26 13h8v14h-3v5l-6-5h-9v-6"/></svg>';
    const book = '<svg viewBox="0 0 38 38" aria-hidden="true"><path d="M5 7c5-2 10-2 14 1v24c-4-3-9-3-14-1z"/><path d="M33 7c-5-2-10-2-14 1v24c4-3 9-3 14-1z"/></svg>';
    return `<div class="in-src">
      <a class="in-src-t no-ext" href="https://docs.nvidia.com/cuda/pdf/PTX_Writers_Guide_To_Interoperability.pdf">${pdf}<b>PDFs from NVIDIA</b><span>The README links NVIDIA's <em>PTX Writers Guide to Interoperability</em>.</span><small>docs.nvidia.com ↗</small></a>
      <a class="in-src-t no-ext" href="https://discord.gg/gpumode">${chat}<b>The good Discords</b><span>The GPU MODE community, where GPU programmers compare notes.</span><small>discord.gg/gpumode ↗</small></a>
      <a class="in-src-t no-ext" href="https://www.amazon.com/Professional-CUDA-Programming-John-Cheng/dp/1118739329">${book}<b>Dead-tree textbooks</b><span><em>Professional CUDA C Programming</em>, by John Cheng and co-authors.</span><small>amazon.com ↗</small></a>
    </div>
    <div class="in-src-join">one glossary that spans the whole stack</div>`;
  }

  /* Fig: following a thread */
  function buildTrail(ctx, slot) {
    const f = fig(ctx, slot, {
      title: 'Following a thread', hint: 'step through the jumps',
      caption: 'The README\'s example of reading the glossary as hypertext, with the glossary\'s real passages. Every underlined word is a link in the glossary itself; the highlighted one is the link the README follows. Two jumps take you from Host Software, through Device Software, down to the hardware that runs the threads.',
    });
    const arr = '<svg viewBox="0 0 30 22" aria-hidden="true"><path d="M2 11h24M18 4l8 7-8 7"/></svg>';
    f.stage.innerHTML = `<div class="in-trail">
      <article class="in-tcard" data-i="0" style="--c:var(--ch-host-software)"><span class="in-tcard-ch">Host Software</span>
        <h4>${tl('cuda-c', 'CUDA C++')}</h4>
        <p>“…<b>barrier synchronization</b> with the <code>__syncthreads()</code> intrinsic function, and <b>${tl('thread-block', 'thread block')}</b> and <b><mark>${tl('thread', 'thread')}</mark> indexing</b> with the <code>blockDim</code> and <code>threadIdx</code> built-in variables.”</p></article>
      <div class="in-tarrow" data-i="1">${arr}</div>
      <article class="in-tcard" data-i="1" style="--c:var(--ch-device-software)"><span class="in-tcard-ch">Device Software</span>
        <h4>${tl('thread', 'Thread')}</h4>
        <p>“…GPU programs are generally written so that all the threads in a ${tl('warp', 'warp')} share the same instruction pointer, executing instructions in lock-step (see also <mark>${tl('warp-scheduler', 'Warp Scheduler')}</mark>).”</p></article>
      <div class="in-tarrow" data-i="2">${arr}</div>
      <article class="in-tcard" data-i="2" style="--c:var(--ch-device-hardware)"><span class="in-tcard-ch">Device Hardware</span>
        <h4>${tl('warp-scheduler', 'Warp Scheduler')}</h4>
        <p>“The Warp Scheduler of the ${tl('streaming-multiprocessor', 'Streaming Multiprocessor (SM)')} decides which group of ${tl('thread', 'threads')} to execute on each clock cycle.”</p></article>
    </div>`;
    const cards = [...f.stage.querySelectorAll('.in-tcard')], arrows = [...f.stage.querySelectorAll('.in-tarrow')];
    const sV = GG.ui.stat(f.readouts, { label: 'entries read', value: 1 });
    const sL = GG.ui.stat(f.readouts, { label: 'now in', value: '' });
    const WHY = [
      'The README\'s link for “the article on the CUDA programming model” opens <b>CUDA C++</b>, the programming model\'s implementation as an extension of C++. In its list of features, the word <b>thread</b> (in “thread indexing”) is a link.',
      'One click takes you to <b>Thread</b>, in Device Software. It explains that the threads of a warp share an instruction pointer, and points you onward: “see also Warp Scheduler”.',
      'A second click takes you down the stack to <b>Device Hardware</b>: the Warp Scheduler is the part of each SM that picks which group of threads runs on every clock cycle. The threads make more sense now.',
    ];
    const LV = [['Host Software', 'host'], ['Device Software', 'memory'], ['Device Hardware', 'core']];
    GG.ui.stepper(f.controls, {
      label: 'Reading path', autoplay: 2600,
      steps: [{ label: 'Start at CUDA C++' }, { label: 'Jump to Thread' }, { label: 'Jump to Warp Scheduler' }],
      onStep(i) {
        cards.forEach((c, k) => { c.classList.toggle('on', k === i); c.classList.toggle('past', k < i); });
        arrows.forEach((a, k) => a.classList.toggle('on', k + 1 <= i));
        sV.set(i + 1); sL.set(LV[i][0], LV[i][1]);
        f.setWhy(WHY[i]);
      },
    });
  }

  /* Fig: the glossary as a web */
  function buildWeb(ctx, slot) {
    const f = fig(ctx, slot, {
      title: 'The glossary as a web', hint: isTouch() ? 'tap a dot' : 'hover a dot · click to open · drag to rearrange', class: 'in-webfig',
      caption: 'Every entry of the glossary is a dot, coloured by chapter; rings are the chapter introductions and diamonds the README and the credits, and a white double ring marks the term the line below the figure names. A line joins two entries when either links to the other in the glossary\'s own text, read from its source files. Switch <em>Links</em> to “This site\'s” to see the links this companion has, which adds some when it retells an entry. Entries that link a lot pull together; the layout is computed the same way every time.',
    });
    const wrap = GG.el('div', { class: 'in-web' });
    f.stage.append(wrap);
    const heightFor = (w) => Math.round(w < 560 ? Math.max(320, Math.min(480, w * 0.98)) : Math.min(600, Math.max(420, w * 0.7)));
    const cv = GG.canvas(wrap, { height: heightFor, label: 'A force-directed graph of every entry and the links between them. A List view with the same data is available from the View control.' });
    const card = GG.el('div', { class: 'in-web-card', hidden: true });
    wrap.append(card);
    const listBox = GG.el('div', { class: 'in-web-list', hidden: true });
    f.stage.append(listBox);

    const findLab = GG.el('label', { class: 'ctl in-find' }, GG.el('span', { class: 'ctl-lab', text: 'Find' }));
    const find = GG.el('input', { type: 'search', class: 'num-in', placeholder: 'warp, SASS, occupancy…', 'aria-label': 'Find an entry in the web' });
    findLab.append(find);
    f.controls.append(findLab);
    const state = { focus: 'all', q: '', match: null, hover: null, sel: null, view: 'web', src: 'src' };
    GG.ui.seg(f.controls, { label: 'Links', value: 'src', options: [{ value: 'src', label: 'Glossary\'s', title: 'the links in the glossary\'s own text' }, { value: 'site', label: 'This site\'s', title: 'the links on the pages of this companion' }], onChange: (v) => { state.src = v; rebuild(); } });
    GG.ui.seg(f.controls, { label: 'Chapter', value: 'all', options: [{ value: 'all', label: 'All' }].concat(SECS.map((s) => ({ value: s, label: SEC_SHORT[s], title: SEC_LABEL[s] }))), onChange: (v) => { state.focus = v; refresh(); } });
    GG.ui.seg(f.controls, { label: 'View', value: 'web', options: [{ value: 'web', label: 'Web' }, { value: 'list', label: 'List' }], onChange: (v) => { state.view = v; wrap.hidden = v !== 'web'; listBox.hidden = v !== 'list'; refresh(); if (v === 'web') requestDraw(); } });
    const sN = GG.ui.stat(f.readouts, { label: 'entries', value: GG.order.length });
    const sE = GG.ui.stat(f.readouts, { label: 'links', value: '…' });
    const sX = GG.ui.stat(f.readouts, { label: 'cross-chapter', value: '…' });

    let G = null, sim = null, W = 1000, H = 700, anim = null, drawQueued = false, drag = null, lastType = isTouch() ? 'touch' : 'mouse';
    let view = null, edgeCount = { src: 0, site: 0 };
    const ANCH = { 'device-hardware': [0.27, 0.72], 'device-software': [0.32, 0.3], 'host-software': [0.73, 0.28], perf: [0.71, 0.72], intro: [0.5, 0.5], outro: [0.5, 0.5] };
    const FONT = (getComputedStyle(document.documentElement).getPropertyValue('--font-mono') || 'monospace').trim();

    function linkSet(src) { return src === 'src' ? srcGraph() : GG.links || { out: {}, in: {} }; }
    function buildGraph(src) {
      const nodes = GG.order.map((t, i) => ({ id: t.id, t, i, sec: t.section, kind: t.kind, x: 0, y: 0, vx: 0, vy: 0, fx: null, fy: null, nb: new Set(), out: 0, inn: 0, deg: 0, r: 4 }));
      const byId = {};
      nodes.forEach((n) => { byId[n.id] = n; });
      const L = linkSet(src);
      const pairs = new Map();
      nodes.forEach((n) => {
        const o = L.out[n.id];
        if (!o) return;
        o.forEach((to) => {
          const m = byId[to];
          if (!m || m === n) return;
          n.out++; m.inn++;
          const a = Math.min(n.i, m.i), b = Math.max(n.i, m.i), key = a * 1000 + b;
          if (!pairs.has(key)) pairs.set(key, { s: nodes[a], t: nodes[b] });
          n.nb.add(m); m.nb.add(n);
        });
      });
      const edges = [...pairs.values()];
      nodes.forEach((n) => { n.deg = n.nb.size; });
      edges.forEach((e) => {
        const struct = e.s.kind !== 'term' || e.t.kind !== 'term';
        e.L = struct ? 95 : 62;
        e.k = (struct ? 0.35 : 1) / Math.max(1, Math.min(e.s.deg, e.t.deg));
        e.b = e.s.deg / Math.max(1, e.s.deg + e.t.deg);
      });
      const terms = nodes.filter((n) => n.kind === 'term');
      const top = terms.slice().sort((a, b) => b.deg - a.deg || a.i - b.i)[0] || null;
      return { nodes, edges, byId, top, src };
    }
    function nodeR(n, narrow) {
      if (n.kind === 'section') return narrow ? 7 : 8.5;
      if (n.kind !== 'term') return narrow ? 5.5 : 6.5;
      return (narrow ? 2.6 : 3.2) + (narrow ? 0.85 : 1.05) * Math.sqrt(n.deg);
    }
    function initSim() {
      if (!G || !cv.w) return;
      const narrow = cv.w < 560;
      H = Math.round(W * cv.h / cv.w);
      const scale = cv.w / W;
      const rnd = mulberry32(0x6a2c85);
      G.nodes.forEach((n) => {
        const a = ANCH[n.sec] || [0.5, 0.5];
        const ang = rnd() * Math.PI * 2, rr = 30 + rnd() * 110;
        n.x = a[0] * W + Math.cos(ang) * rr;
        n.y = a[1] * H + Math.sin(ang) * rr * 0.8;
        n.vx = 0; n.vy = 0; n.fx = null; n.fy = null;
        n.r = nodeR(n, narrow);
        n.rv = (n.r + (narrow ? 2.5 : 4)) / scale;
      });
      sim = { alpha: 1, aspect: cv.h / cv.w, charge: narrow ? 260 : 190, margin: 30 / scale };
      view = null;
    }
    function step() {
      const N = G.nodes, a = sim.alpha, ch = sim.charge;
      for (let i = 0; i < N.length; i++) {
        const p = N[i];
        for (let j = i + 1; j < N.length; j++) {
          const q = N[j];
          let dx = p.x - q.x, dy = p.y - q.y, l = dx * dx + dy * dy;
          if (l < 1e-6) { dx = (i - j) * 0.013 + 0.01; dy = 0.011; l = dx * dx + dy * dy; }
          if (l > 360000) continue;
          const k = (ch * a) / l;
          p.vx += dx * k; p.vy += dy * k; q.vx -= dx * k; q.vy -= dy * k;
        }
      }
      for (const e of G.edges) {
        const s = e.s, t = e.t;
        let x = t.x + t.vx - s.x - s.vx, y = t.y + t.vy - s.y - s.vy;
        let l = Math.sqrt(x * x + y * y) || 1e-6;
        l = ((l - e.L) / l) * a * e.k;
        x *= l; y *= l;
        t.vx -= x * e.b; t.vy -= y * e.b;
        s.vx += x * (1 - e.b); s.vy += y * (1 - e.b);
      }
      for (const n of N) {
        const an = ANCH[n.sec] || [0.5, 0.5], k = n.kind === 'term' ? 0.045 : 0.02;
        n.vx += (an[0] * W - n.x) * k * a;
        n.vy += (an[1] * H - n.y) * k * a;
      }
      for (const n of N) {
        if (n.fx != null) { n.x = n.fx; n.y = n.fy; n.vx = 0; n.vy = 0; continue; }
        n.vx *= 0.6; n.vy *= 0.6;
        n.x += n.vx; n.y += n.vy;
      }
      for (let i = 0; i < N.length; i++) {
        const p = N[i];
        for (let j = i + 1; j < N.length; j++) {
          const q = N[j], dx = q.x - p.x, dy = q.y - p.y, rr = p.rv + q.rv, d2 = dx * dx + dy * dy;
          if (d2 < rr * rr) {
            const d = Math.sqrt(d2) || 0.01, push = (rr - d) / d * 0.5;
            if (p.fx == null) { p.x -= dx * push; p.y -= dy * push; }
            if (q.fx == null) { q.x += dx * push; q.y += dy * push; }
          }
        }
      }
      // each chapter's ring sits at the centre of its own terms, so it labels its cluster rather than a corner
      for (const n of N) {
        if (n.kind !== 'section' || n.fx != null) continue;
        let cx = 0, cy = 0, k = 0;
        for (const q of N) if (q.kind === 'term' && q.sec === n.id) { cx += q.x; cy += q.y; k++; }
        if (k) { n.x += (cx / k - n.x) * 0.5; n.y += (cy / k - n.y) * 0.5; n.vx = 0; n.vy = 0; }
      }
      // a soft boundary: nodes beyond the margin are eased back, never pinned to the edge
      const m = sim.margin;
      for (const n of N) {
        if (n.fx != null) continue;
        n.x += (Math.max(m, Math.min(W - m, n.x)) - n.x) * 0.25;
        n.y += (Math.max(m, Math.min(H - m, n.y)) - n.y) * 0.25;
      }
      sim.alpha += (0 - sim.alpha) * 0.0228;
    }
    function settle() { let guard = 0; while (sim.alpha > 0.004 && guard++ < 600) step(); }
    function run() {
      if (!sim) return;
      if (GG.reducedMotion) { settle(); requestDraw(); return; }
      if (!anim) anim = GG.anim(cv.canvas, () => {
        if (!sim || sim.alpha <= 0.004) { anim.stop(); draw(); return; }
        for (let k = 0; k < 6 && sim.alpha > 0.004; k++) step();
        draw();
      }, { autostart: false });
      anim.start();
    }
    /* The view: fit the laid-out graph to the canvas, leaving room for labels. Frozen while a node is dragged. */
    function targetView() {
      const w = cv.w, h = cv.h, narrow = w < 560, s = w / W;
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      G.nodes.forEach((n) => { x0 = Math.min(x0, n.x); x1 = Math.max(x1, n.x); y0 = Math.min(y0, n.y); y1 = Math.max(y1, n.y); });
      const padX = narrow ? 30 : 56, padY = narrow ? 20 : 24;
      const K = Math.max(s * 0.5, Math.min(s * 1.6, (w - 2 * padX) / Math.max(1, x1 - x0), (h - 2 * padY) / Math.max(1, y1 - y0)));
      return { K, ox: (w - (x1 - x0) * K) / 2 - x0 * K, oy: (h - (y1 - y0) * K) / 2 - y0 * K };
    }
    function updateView() {
      if (drag && drag.moved && view) return;
      const t = targetView();
      if (view && anim && anim.running) { view = { K: view.K + (t.K - view.K) * 0.25, ox: view.ox + (t.ox - view.ox) * 0.25, oy: view.oy + (t.oy - view.oy) * 0.25 }; }
      else view = t;
    }
    const SXf = (n) => view.ox + n.x * view.K, SYf = (n) => view.oy + n.y * view.K;
    function requestDraw() { if (drawQueued) return; drawQueued = true; requestAnimationFrame(() => { drawQueued = false; draw(); }); }
    const labelOf = (n) => (n.t.abbr && n.t.name.length > 16 ? n.t.abbr : shortName(n.id));
    function focusNode() { return state.hover || state.sel; }
    // the most connected term, overall or within one chapter
    function topIn(sec) { return G.nodes.filter((n) => n.kind === 'term' && n.sec === sec).sort((a, b) => b.deg - a.deg || a.i - b.i)[0] || null; }
    // the term the why line names right now: it is ringed and always labelled, so the reader can find it
    function namedNode() {
      if (!G || focusNode() || state.match) return null;
      const n = state.focus !== 'all' ? topIn(state.focus) : G.top;
      return n && n.deg ? n : null;
    }
    function draw() {
      const c = cv.ctx, w = cv.w, h = cv.h;
      if (!w || !G || !sim || state.view !== 'web') return;
      updateView();
      const C = GG.colors();
      c.clearRect(0, 0, w, h);
      const hi = focusNode(), M = state.match, F = state.focus !== 'all' ? state.focus : null, nm = namedNode();
      const nodeA = (n) => {
        if (hi) return n === hi || hi.nb.has(n) ? 1 : 0.13;
        if (M) return M.has(n) ? 1 : 0.13;
        if (F) return n.sec === F ? 1 : 0.18;
        return 1;
      };
      for (const e of G.edges) {
        let col = C.ink3, al, lw = 1;
        if (hi) { if (e.s === hi || e.t === hi) { col = chHex(hi.sec); al = 0.8; lw = 1.4; } else al = 0.03; }
        else if (M) { const a1 = M.has(e.s), a2 = M.has(e.t); al = a1 && a2 ? 0.55 : a1 || a2 ? 0.14 : 0.025; if (a1 && a2) col = C.ink2; }
        else if (F) { const a1 = e.s.sec === F, a2 = e.t.sec === F; if (a1 || a2) { col = chHex(F); al = a1 && a2 ? 0.5 : 0.17; } else al = 0.025; }
        else if (e.s.sec === e.t.sec) { col = chHex(e.s.sec); al = 0.2; }
        else al = 0.12;
        if (e.s.kind !== 'term' || e.t.kind !== 'term') al *= 0.55;
        c.strokeStyle = GG.alpha(col, al);
        c.lineWidth = lw;
        c.beginPath();
        c.moveTo(SXf(e.s), SYf(e.s));
        c.lineTo(SXf(e.t), SYf(e.t));
        c.stroke();
      }
      for (const n of G.nodes) {
        const x = SXf(n), y = SYf(n), col = chHex(n.sec);
        c.globalAlpha = nodeA(n);
        if (n.kind === 'section') {
          c.beginPath(); c.arc(x, y, n.r, 0, 6.2832); c.fillStyle = C.bg; c.fill();
          c.lineWidth = 2; c.strokeStyle = col; c.stroke();
          c.beginPath(); c.arc(x, y, n.r * 0.4, 0, 6.2832); c.fillStyle = col; c.fill();
        } else if (n.kind !== 'term') {
          c.save(); c.translate(x, y); c.rotate(Math.PI / 4);
          c.fillStyle = col; c.fillRect(-n.r * 0.72, -n.r * 0.72, n.r * 1.44, n.r * 1.44);
          c.restore();
        } else {
          c.beginPath(); c.arc(x, y, n.r, 0, 6.2832); c.fillStyle = col; c.fill();
        }
        // a white double ring: copper would sit too close to the Performance chapter's terracotta
        if (n === hi || n === nm) {
          c.strokeStyle = '#ffffff';
          c.beginPath(); c.arc(x, y, n.r + 3, 0, 6.2832); c.lineWidth = 1.6; c.stroke();
          c.beginPath(); c.arc(x, y, n.r + 6.5, 0, 6.2832); c.lineWidth = 1.2; c.stroke();
        }
      }
      c.globalAlpha = 1;
      drawLabels(hi, M, F, C, nodeA, nm);
    }
    /* Labels never cover a dot or another label. A label pushed away from its dot gets a short leader line. */
    function drawLabels(hi, M, F, C, nodeA, nm) {
      const c = cv.ctx, w = cv.w, h = cv.h, narrow = w < 560;
      const byDeg = (a, b) => b.deg - a.deg || a.i - b.i;
      // on a phone the chapter rings take the short names the Chapter buttons use, leaving room for terms
      const labelFor = (n) => (narrow && n.kind === 'section' && SEC_SHORT[n.id] ? SEC_SHORT[n.id] : labelOf(n));
      let cand;
      if (hi) cand = [hi].concat([...hi.nb].sort(byDeg));
      else if (M) cand = [...M].sort(byDeg);
      else {
        const pool = G.nodes.filter((n) => !F || n.sec === F);
        // the chapter rings, the two diamonds and the term the why line names are placed first, so they
        // always get a spot
        cand = pool.filter((n) => n.kind === 'section').concat(pool.filter((n) => n.kind !== 'term' && n.kind !== 'section'), nm ? [nm] : [], pool.filter((n) => n.kind === 'term' && n !== nm).sort(byDeg).slice(0, narrow ? 7 : 16));
      }
      const always = (n) => n.kind !== 'term' || n === nm;
      // a ringed dot (hovered, or named by the why line) is as wide as its ring
      const dots = G.nodes.map((n) => { const x = SXf(n), y = SYf(n), r = n.r + (n === hi || n === nm ? 8 : 1.5); return { n, bright: nodeA(n) > 0.5, x: x - r, y: y - r, w: 2 * r, h: 2 * r }; });
      const placed = [], leads = [];
      const hits = (r, list) => list.some((p) => r.x < p.x + p.w && r.x + r.w > p.x && r.y < p.y + p.h && r.y + r.h > p.y);
      // does the segment [x0,y0]-[x1,y1] pass through the box (slab test)?
      const segBox = (s, b) => {
        let t0 = 0, t1 = 1;
        const dx = s[2] - s[0], dy = s[3] - s[1];
        for (const [p, q] of [[-dx, s[0] - b.x], [dx, b.x + b.w - s[0]], [-dy, s[1] - b.y], [dy, b.y + b.h - s[1]]]) {
          if (Math.abs(p) < 1e-9) { if (q < 0) return false; continue; }
          const t = q / p;
          if (p < 0) t0 = Math.max(t0, t); else t1 = Math.min(t1, t);
          if (t0 > t1) return false;
        }
        return true;
      };
      // do two segments cross?
      const segSeg = (a, b) => {
        const side = (p, q, x, y) => Math.sign((q[0] - p[0]) * (y - p[1]) - (q[1] - p[1]) * (x - p[0]));
        const [a0, a1, b0, b1] = [[a[0], a[1]], [a[2], a[3]], [b[0], b[1]], [b[2], b[3]]];
        return side(a0, a1, b0[0], b0[1]) * side(a0, a1, b1[0], b1[1]) < 0 && side(b0, b1, a0[0], a0[1]) * side(b0, b1, a1[0], a1[1]) < 0;
      };
      c.textBaseline = 'middle';
      // the spot just right of each term candidate's dot, which ring and diamond labels try to leave free
      const reserved = cand.filter((n) => n.kind === 'term').map((n) => {
        c.font = `${n === nm ? 600 : 500} ${narrow ? 10.5 : 11.5}px ${FONT}`;
        const lh = narrow ? 13 : 14;
        return { x: SXf(n) + n.r + 2, y: SYf(n) - lh / 2, w: c.measureText(labelFor(n)).width + 6, h: lh, wt: n === nm ? 12 : 3 };
      });
      // lay the labels out in the given order; returns what to draw and how many dots the
      // always-labelled ones had to cover
      const layout = (order) => {
        placed.length = 0; leads.length = 0;
        const out = [];
        let covers = 0, late = null;
        order.forEach((n) => {
          const lab = labelFor(n), strong = n === hi || n === nm;
          const font = `${strong || n.kind === 'section' ? 600 : 500} ${narrow ? 10.5 : 11.5}px ${FONT}`;
          c.font = font;
          // a ringed term keeps its label and leader clear of the ring as well as the dot
          const tw = c.measureText(lab).width, x = SXf(n), y = SYf(n), lh = narrow ? 13 : 14, r = strong ? n.r + 7 : n.r;
          const opts = [
            [x + r + 5, y, 0], [x - r - 5 - tw, y, 0], [x - tw / 2, y - r - 9, 0], [x - tw / 2, y + r + 9, 0],
            [x + r + 3, y - r - 8, 0], [x + r + 3, y + r + 8, 0], [x - r - 3 - tw, y - r - 8, 0], [x - r - 3 - tw, y + r + 8, 0],
            [x - r, y - r - 9, 0], [x - r, y + r + 9, 0], [x + r - tw, y - r - 9, 0], [x + r - tw, y + r + 9, 0],
            [x + r + 20, y, 1], [x - r - 20 - tw, y, 1], [x - tw / 2, y - r - 24, 1], [x - tw / 2, y + r + 24, 1], [x - r, y - r - 24, 1], [x - r, y + r + 24, 1], [x + r - tw, y - r - 24, 1], [x + r - tw, y + r + 24, 1],
          ];
          const far = [[x + r + 34, y, 1], [x - r - 34 - tw, y, 1], [x - tw / 2, y - r - 36, 1], [x - tw / 2, y + r + 36, 1], [x + r + 10, y - r - 30, 1], [x + r + 10, y + r + 30, 1], [x - r - 10 - tw, y - r - 30, 1], [x - r - 10 - tw, y + r + 30, 1]];
          // in the resting view, a term label may also sit further out on a longer leader, so the
          // dense middle of the web still gets a few names
          const tries = !hi && !M ? opts.concat(far.map((o) => [o[0], o[1], 2])) : opts;
          const others = dots.filter((d) => d.n !== n), self = dots.filter((d) => d.n === n);
          const bright = others.filter((d) => d.bright);
          const inBox = (rr) => rr.x >= 2 && rr.y >= 2 && rr.x + rr.w <= w - 2 && rr.y + rr.h <= h - 2;
          const rectOf = (o) => ({ x: o[0] - 3, y: o[1] - lh / 2, w: tw + 6, h: lh });
          // the leader runs from the edge of the dot to the nearest point of its label
          const leadOf = (rr) => {
            const tx = Math.max(rr.x, Math.min(x, rr.x + rr.w)), ty = Math.max(rr.y, Math.min(y, rr.y + rr.h));
            const d = Math.hypot(tx - x, ty - y) || 1;
            return [x + (tx - x) / d * (r + 2), y + (ty - y) / d * (r + 2), tx, ty];
          };
          // a leader that crosses a placed label or leader would seem to join this dot to that label, and a
          // label drawn over a placed leader would cut it: none of these spots is usable
          const blocked = (o, rr) => {
            if (leads.some((s) => segBox(s, rr))) return true;
            if (!o[2]) return false;
            const s = leadOf(rr);
            return placed.some((p) => segBox(s, p)) || leads.some((q) => segSeg(s, q));
          };
          // the dots a leader runs through; a leader through a dot reads as that dot's name
          const crossedBy = (o, rr, list) => {
            if (!o[2]) return [];
            const s = leadOf(rr), vx = s[2] - s[0], vy = s[3] - s[1], L2 = vx * vx + vy * vy || 1;
            return list.filter((d) => {
              const cx = d.x + d.w / 2, cy = d.y + d.h / 2, t = Math.max(0, Math.min(1, ((cx - s[0]) * vx + (cy - s[1]) * vy) / L2));
              return Math.hypot(s[0] + vx * t - cx, s[1] + vy * t - cy) < d.w / 2;
            });
          };
          // Among the spots that cover no dot, take the cheapest: a spot with another dot within a
          // label-height of it could read as that dot's name, a leader line is a detour, and a ring or
          // diamond label that faces into the cluster takes room the term labels need.
          const g = lh;
          const crowd = (rr) => others.filter((d) => d.x + d.w > rr.x - g && d.x < rr.x + rr.w + g && d.y + d.h > rr.y - g && d.y < rr.y + rr.h + g).length;
          const toMid = n.kind !== 'term' ? [w / 2 - x, h / 2 - y] : null, toMidL = toMid ? Math.hypot(toMid[0], toMid[1]) || 1 : 1;
          const cost = (o, rr, k) => {
            // chapter labels are drawn in their chapter's colour, so a dot beside them confuses less
            let v = crowd(rr) * (n.kind === 'section' ? 2 : 4) + o[2] * 3 + k * 0.1;
            if (toMid) {
              v += reserved.filter((q) => hits(rr, [q])).reduce((s, q) => s + q.wt, 0);
              const dx = rr.x + rr.w / 2 - x, dy = rr.y + rr.h / 2 - y, dl = Math.hypot(dx, dy) || 1;
              v += Math.max(0, (dx * toMid[0] + dy * toMid[1]) / (dl * toMidL)) * 3;
            }
            return v;
          };
          let pick = null;
          for (const pass of [others, bright]) {
            let best = Infinity;
            tries.forEach((o, k) => {
              const rr = rectOf(o);
              if (!inBox(rr) || hits(rr, placed) || hits(rr, pass) || blocked(o, rr) || crossedBy(o, rr, pass).length) return;
              const cc = cost(o, rr, k);
              if (cc < best) { best = cc; pick = [o, rr]; }
            });
            if (pick) break;
          }
          // rings, diamonds and the named term are always labelled. Failing a clear spot, try spots further
          // out on longer leaders; a spot that covers a dot is taken only when every free spot fails, and a
          // spot that covers another ring or diamond never is.
          if (!pick && always(n)) {
            let best = Infinity;
            const farther = [];
            [44, 52, 62, 72, 84, 96, 112, 130].forEach((dd) => {
              for (let a = 0; a < 24; a++) {
                const ux = Math.cos(a * Math.PI / 12), uy = Math.sin(a * Math.PI / 12);
                // the label aligned away from the dot first, then slid along its leader's end
                const px = x + ux * (r + dd), py = y + uy * (r + dd), al = ux < -0.3 ? tw : ux > 0.3 ? 0 : tw / 2;
                [al, 0, tw / 2, tw].forEach((sh, j) => { if (!j || sh !== al) farther.push([px - sh, py, 1 + dd / 40 + (j ? 0.5 : 0)]); });
              }
            });
            opts.concat(far, farther).forEach((o) => {
              const rr = rectOf(o);
              if (!inBox(rr) || hits(rr, placed) || hits(rr, self) || blocked(o, rr)) return;
              const covered = others.filter((d) => hits(rr, [d])), crossed = crossedBy(o, rr, others);
              if (covered.concat(crossed).some((d) => d.n.kind !== 'term')) return;
              // a leader that runs through another dot, or a label that ends up beside one, reads ambiguously
              const cost = covered.length * 1000 + o[2] + crossed.length * 20 + crowd(rr) * 1.5;
              if (cost < best) { best = cost; pick = [o, rr, covered.length]; }
            });
          }
          if (!pick) { if (always(n)) { covers += 100; late = late || n; } return; }
          const [[lx, ly, lead], rr, cov] = pick;
          if (cov) { covers += cov; late = late || n; }
          placed.push(rr);
          const s = lead ? leadOf(rr) : null;
          if (s) leads.push(s);
          out.push({ n, lab, strong, font, lx, ly, s });
        });
        return { out, covers, late };
      };
      // a ring or diamond placed late can find every free spot taken: lay out once more with it first,
      // and keep whichever layout covers fewer dots
      let L = layout(cand);
      if (L.late && L.late !== cand[0]) {
        const alt = layout([L.late].concat(cand.filter((m) => m !== L.late)));
        if (alt.covers < L.covers) L = alt;
      }
      L.out.forEach(({ n, lab, strong, font, lx, ly, s }) => {
        if (s) {
          c.strokeStyle = GG.alpha(C.ink2, 0.75); c.lineWidth = 1.2;
          c.beginPath(); c.moveTo(s[0], s[1]); c.lineTo(s[2], s[3]); c.stroke();
        }
        c.font = font;
        c.lineWidth = 3.5; c.strokeStyle = GG.alpha(C.bg, 0.9); c.lineJoin = 'round';
        c.strokeText(lab, lx, ly);
        c.fillStyle = strong ? '#ffffff' : hi ? C.ink : n.kind === 'section' ? chHex(n.sec) : C.ink2;
        c.fillText(lab, lx, ly);
      });
    }
    function hit(px, py) {
      if (!G || !sim || !view) return null;
      let best = null, bd = Infinity;
      for (const n of G.nodes) {
        const dx = SXf(n) - px, dy = SYf(n) - py, d = dx * dx + dy * dy, rr = (n.r + (lastType === 'touch' ? 12 : 7)) ** 2;
        if (d < rr && d < bd) { bd = d; best = n; }
      }
      return best;
    }
    /* The card docks in the corner of the canvas that covers the fewest of the lit dots. */
    function showCard(n) {
      if (!n) { card.hidden = true; card.classList.remove('touch'); return; }
      const t = n.t, touch = lastType !== 'mouse';
      card.style.setProperty('--c', chVar(t.section));
      card.classList.toggle('touch', touch);
      card.innerHTML = `<div class="in-web-card-sec">${esc(SEC_LABEL[t.section] || '')}</div><div class="in-web-card-t">${esc(t.name)}${t.abbr ? `<small>${esc(t.abbr)}</small>` : ''}</div><p>${mdi(ledeOf(t.id))}</p><div class="in-web-card-k">links to ${n.out} · linked from ${n.inn}${touch ? '' : ' · click to open'}</div>${touch ? `<button type="button" class="btn primary">Open ${esc(shortName(t.id))} →</button>` : ''}`;
      if (touch) card.querySelector('button').addEventListener('click', () => GG.goTo(t.id));
      card.hidden = false;
      const cw = card.offsetWidth, chh = card.offsetHeight, ww = wrap.clientWidth, wh = cv.h;
      const lit = [n].concat([...n.nb]).map((m) => [SXf(m), SYf(m)]);
      const spots = ww < 560
        ? [[6, 6], [6, wh - chh - 6]]
        : [[6, 6], [ww - cw - 6, 6], [6, wh - chh - 6], [ww - cw - 6, wh - chh - 6]];
      let best = null;
      spots.forEach(([l, tp]) => {
        const covered = lit.filter(([x, y]) => x > l - 8 && x < l + cw + 8 && y > tp - 8 && y < tp + chh + 8).length;
        const cx = Math.max(l, Math.min(SXf(n), l + cw)), cy = Math.max(tp, Math.min(SYf(n), tp + chh));
        const score = covered * 1e4 - Math.hypot(cx - SXf(n), cy - SYf(n));
        if (!best || score < best.score) best = { score, l, tp };
      });
      card.style.left = best.l + 'px';
      card.style.top = Math.max(4, best.tp) + 'px';
    }
    function stats(nodes, edges) {
      const cross = edges.filter((x) => x.s.sec !== x.t.sec).length;
      return { n: nodes.length, e: edges.length, cross };
    }
    // the name as the why line gives it, with the label the web shows and where to look
    const namedHTML = (n) => `<b>${esc(n.t.name)}</b>${labelOf(n) !== n.t.name ? ` (<b>${esc(labelOf(n))}</b>)` : ''}${state.view === 'list' ? ', first in the list' : ', ringed in white'}`;
    function whyFor() {
      if (!G) return 'Counting links…';
      const hi = focusNode(), src = G.src === 'src';
      if (hi) {
        const secs = new Set([...hi.nb].map((m) => m.sec));
        return `<b>${esc(hi.t.name)}</b> · ${SEC_LABEL[hi.sec]}: links to ${hi.out}, linked from ${hi.inn}${src ? ' in the glossary' : ' on this site'}. Its ${plural(hi.deg, 'neighbour')} span ${plural(secs.size, 'chapter')}.${lastType === 'mouse' ? ' Click to open it.' : ''}`;
      }
      if (state.q) {
        const m = state.match ? [...state.match].sort((a, b) => b.deg - a.deg || a.i - b.i) : [];
        return m.length ? `${m.length} ${m.length === 1 ? 'entry matches' : 'entries match'} “${esc(state.q)}”. Press Enter to open <b>${esc(m[0].t.name)}</b>.` : `No entry matches “${esc(state.q)}”.`;
      }
      if (state.focus !== 'all') {
        const s = state.focus, own = G.nodes.filter((n) => n.sec === s);
        let inside = 0, across = 0;
        G.edges.forEach((e) => { const a = e.s.sec === s, b = e.t.sec === s; if (a && b) inside++; else if (a || b) across++; });
        const top = topIn(s);
        return `<b>${SEC_LABEL[s]}</b>: ${own.length} entries with ${plural(inside, 'link')} among themselves and ${across} to the rest of the ${src ? 'glossary' : 'site'}.${top && top.deg ? ` Its most connected term is ${namedHTML(top)}, with ${plural(top.deg, 'neighbour')}.` : ''}`;
      }
      const tp = G.top, st = stats(G.nodes, G.edges);
      const whose = src ? 'in the glossary\'s own text' : 'on this site';
      const diff = !src && edgeCount.src ? ` The glossary's own text has ${edgeCount.src}; the rest were added here.` : '';
      const tt = G.edges.filter((e) => e.s.kind === 'term' && e.t.kind === 'term').length;
      const scope = tt < st.e ? ` Of these, ${tt} join two terms${src ? ', the count Fig. 2 uses' : ''}; the other ${st.e - tt} touch the README, a chapter introduction or the credits.` : '';
      return `Each dot is one of the ${st.n} entries; each line is one of the ${st.e} links between them ${whose}, ${st.cross} (${pctS(st.cross / Math.max(1, st.e))}) of them between different chapters.${scope}${diff}${tp && tp.deg ? ` The most connected term is ${namedHTML(tp)}, with ${plural(tp.deg, 'neighbour')}.` : ''} ${isTouch() ? 'Tap a dot to see its neighbours, or switch to the List view.' : 'Hover a dot to light up its neighbours; click to open it.'}`;
    }
    function refresh() {
      if (!G) { f.setWhy(whyFor()); return; }
      let nodes = G.nodes, edges = G.edges;
      if (state.focus !== 'all') { const s = state.focus; nodes = nodes.filter((x) => x.sec === s); edges = edges.filter((x) => x.s.sec === s || x.t.sec === s); }
      if (state.match) { nodes = nodes.filter((x) => state.match.has(x)); edges = edges.filter((x) => state.match.has(x.s) || state.match.has(x.t)); }
      const st = stats(nodes, edges);
      sN.set(st.n); sE.set(st.e); sX.set(st.e ? pctS(st.cross / st.e) : '—');
      f.setWhy(whyFor());
      if (state.view === 'list') renderList(); else requestDraw();
    }
    function renderList() {
      if (!G) return;
      let rows = G.nodes.slice().sort((a, b) => b.deg - a.deg || a.i - b.i);
      if (state.focus !== 'all') rows = rows.filter((n) => n.sec === state.focus);
      if (state.match) rows = rows.filter((n) => state.match.has(n));
      const maxDeg = Math.max(1, ...G.nodes.map((n) => n.deg));
      listBox.innerHTML = rows.length
        ? `<ol class="in-web-ol">${rows.map((n) => `<li style="--c:${chVar(n.sec)}"><a data-term="${n.id}" href="#${n.id}" class="term" style="--c:${chVar(n.sec)}">${esc(n.t.name)}</a><span class="in-web-bar" title="${n.deg} linked entries"><i style="width:${(n.deg / maxDeg * 100).toFixed(1)}%"></i></span><span class="in-web-deg">${n.out} out · ${n.inn} in</span></li>`).join('')}</ol>`
        : '<p class="c-dim" style="padding:12px 14px">No entry matches.</p>';
    }
    function setQuery(q) {
      state.q = q.trim();
      const ql = state.q.toLowerCase();
      state.match = ql && G ? new Set(G.nodes.filter((n) => (n.t.name + ' ' + (n.t.abbr || '') + ' ' + n.id).toLowerCase().includes(ql))) : null;
      state.sel = null; state.hover = null; showCard(null);
      refresh();
    }
    function rebuild() {
      if (!GG.booted && state.src === 'site') return;
      G = buildGraph(state.src);
      state.hover = null; state.sel = null; showCard(null);
      if (state.q) setQuery(state.q);
      if (cv.w) { initSim(); run(); }
      refresh();
    }
    find.addEventListener('input', () => setQuery(find.value));
    find.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && state.match && state.match.size) {
        e.preventDefault();
        const m = [...state.match].sort((a, b) => b.deg - a.deg || a.i - b.i)[0];
        GG.goTo(m.id);
      }
    });
    const pos = (e) => { const r = cv.canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    cv.canvas.addEventListener('pointerdown', (e) => {
      lastType = e.pointerType || 'mouse';
      if (lastType !== 'mouse') return;
      const [x, y] = pos(e), n = hit(x, y);
      if (n) { drag = { n, x0: x, y0: y, moved: false }; cv.canvas.setPointerCapture(e.pointerId); }
    });
    cv.canvas.addEventListener('pointermove', (e) => {
      if ((e.pointerType || 'mouse') !== 'mouse') return;
      lastType = 'mouse';
      const [x, y] = pos(e);
      if (drag) {
        if (!drag.moved && Math.hypot(x - drag.x0, y - drag.y0) > 4) drag.moved = true;
        if (drag.moved && sim && view) {
          drag.n.fx = (Math.max(4, Math.min(cv.w - 4, x)) - view.ox) / view.K;
          drag.n.fy = (Math.max(4, Math.min(cv.h - 4, y)) - view.oy) / view.K;
          sim.alpha = Math.max(sim.alpha, 0.22);
          run();
        }
        return;
      }
      const n = hit(x, y);
      if (n !== state.hover) {
        state.hover = n;
        cv.canvas.classList.toggle('in-hovering', !!n);
        showCard(n);
        f.setWhy(whyFor());
        requestDraw();
      }
    });
    cv.canvas.addEventListener('pointerup', (e) => {
      const type = e.pointerType || 'mouse';
      lastType = type;
      const [x, y] = pos(e);
      if (type === 'mouse') {
        if (drag) {
          const d = drag; drag = null;
          if (d.moved) { d.n.fx = null; d.n.fy = null; sim.alpha = Math.max(sim.alpha, 0.12); run(); return; }
          GG.goTo(d.n.id);
        }
        return;
      }
      const n = hit(x, y);
      state.sel = n || null;
      state.hover = null;
      showCard(state.sel);
      f.setWhy(whyFor());
      requestDraw();
    });
    cv.canvas.addEventListener('pointerleave', () => {
      if (drag || lastType !== 'mouse') return;
      if (state.hover) { state.hover = null; cv.canvas.classList.remove('in-hovering'); showCard(null); f.setWhy(whyFor()); requestDraw(); }
    });
    cv.onResize((w, h) => {
      if (!G || w < 80 || state.view !== 'web') return;
      if (!sim) { initSim(); run(); return; }
      if (Math.abs(h / w - sim.aspect) > 0.2) { initSim(); run(); return; }
      requestDraw();
    });
    GG.onBoot(() => {
      const count = (L) => { let n = 0; GG.order.forEach((t) => (L.out[t.id] || []).forEach((to) => { if (to !== t.id && !(L.out[to] && L.out[to].has(t.id) && to < t.id)) n++; })); return n; };
      edgeCount = { src: count(srcGraph()), site: GG.links ? count(GG.links) : 0 };
      rebuild();
    });
    f.setWhy(whyFor());
  }

  /* Fig: reading order */
  function buildStrip(ctx, slot) {
    const f = fig(ctx, slot, {
      title: 'Every entry, in reading order', hint: 'hover, or focus it and use ← →',
      caption: 'The glossary read front to back: the README, then each chapter\'s introduction (tall marks) followed by its terms, then the credits. On the page, → and ← walk this same line.',
    });
    const T = GG.order, N = T.length;
    const box = GG.el('div', { class: 'in-strip', tabindex: '0', 'data-keys': '', role: 'slider', 'aria-label': 'Entry in reading order', 'aria-valuemin': '1', 'aria-valuemax': String(N) });
    f.stage.append(box);
    const svg = GG.svg('svg', { viewBox: `0 0 ${N * 10} 60`, preserveAspectRatio: 'none', class: 'in-strip-svg', 'aria-hidden': 'true' }, box);
    const ticks = T.map((t, i) => {
      const tall = t.kind !== 'term';
      return GG.svg('rect', { x: i * 10 + 1.2, y: tall ? 4 : 17, width: 7.6, height: tall ? 52 : 39, rx: 1.2, class: 'in-sk', style: `fill:${chVar(t.section)}` }, svg);
    });
    const cur = GG.svg('rect', { x: 0.2, y: 1, width: 9.6, height: 58, rx: 1.5, class: 'in-strip-cur' }, svg);
    const segs = [];
    T.forEach((t) => { if (!segs.length || segs[segs.length - 1].s !== t.section) segs.push({ s: t.section, n: 0 }); segs[segs.length - 1].n++; });
    box.insertAdjacentHTML('beforeend', `<div class="in-strip-lab">${segs.map((g) => `<span style="flex:${g.n} 1 0;--c:${chVar(g.s)}">${g.n > 3 ? esc(SEC_SHORT[g.s]) : ''}</span>`).join('')}</div>`);
    f.stage.insertAdjacentHTML('beforeend', `<div class="in-navs">
      <div><span class="in-navs-k"><kbd>←</kbd><kbd>→</kbd></span><span>The arrow keys, anywhere on the page outside a text box or a figure you are using.</span></div>
      <div><span class="in-navs-k in-navs-foot">← Previous · Next →</span><span>The links at the bottom of every entry.</span></div>
      <div><span class="in-navs-k"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h10"/></svg>Contents</span><span>The sidebar on desktop; the Contents button in the top bar on a phone.</span></div>
    </div>`);
    let i = 0;
    const prev = GG.ui.button(f.controls, { icon: 'prev', ariaLabel: 'Previous entry', onClick: () => setI(i - 1) });
    const next = GG.ui.button(f.controls, { icon: 'next', ariaLabel: 'Next entry', onClick: () => setI(i + 1) });
    const open = GG.ui.button(f.controls, { label: 'Open', primary: true, onClick: () => GG.goTo(T[i].id) });
    const sP = GG.ui.stat(f.readouts, { label: 'entry', value: '' });
    const sC = GG.ui.stat(f.readouts, { label: 'chapter', value: '' });
    function setI(k) {
      i = Math.max(0, Math.min(N - 1, k));
      const t = T[i];
      ticks.forEach((r, j) => r.classList.toggle('on', j === i));
      cur.setAttribute('x', i * 10 + 0.2);
      box.setAttribute('aria-valuenow', String(i + 1));
      box.setAttribute('aria-valuetext', `${i + 1} of ${N}: ${t.name}`);
      prev.disabled = i === 0; next.disabled = i === N - 1;
      open.setLabel('Open ' + shortName(t.id));
      sP.set(`${i + 1} / ${N}`);
      sC.set(SEC_SHORT[t.section] || '', null);
      let where = '';
      if (t.kind === 'term') { const inSec = termsOf(t.section); where = `, term ${inSec.indexOf(t) + 1} of ${inSec.length} in ${SEC_LABEL[t.section]}`; }
      else if (t.kind === 'section') where = `, the introduction to Part ${GG.SECTIONS[t.section].part}, ${SEC_LABEL[t.section]}`;
      const nx = T[i + 1];
      f.setWhy(`Entry ${i + 1} of ${N}: <b>${esc(t.name)}</b>${where}. ${nx ? `Pressing → on the page from here goes to ${esc(nx.name)}.` : 'This is the last entry.'}`);
    }
    const idxAt = (e) => { const r = svg.getBoundingClientRect(); return Math.floor(((e.clientX - r.left) / Math.max(1, r.width)) * N); };
    let pType = 'mouse';
    svg.addEventListener('pointerdown', (e) => { pType = e.pointerType || 'mouse'; setI(idxAt(e)); });
    svg.addEventListener('pointermove', (e) => { if ((e.pointerType || 'mouse') === 'mouse' || e.buttons) setI(idxAt(e)); });
    svg.addEventListener('click', () => { if (pType === 'mouse') GG.goTo(T[i].id); });
    box.addEventListener('keydown', (e) => {
      const map = { ArrowLeft: i - 1, ArrowRight: i + 1, ArrowUp: i + 1, ArrowDown: i - 1, Home: 0, End: N - 1, PageUp: i + 10, PageDown: i - 10 };
      if (e.key in map) { e.preventDefault(); setI(map[e.key]); }
      else if (e.key === 'Enter') { e.preventDefault(); GG.goTo(T[i].id); }
    });
    setI(0);
  }

  /* Source tree */
  function treeHTML() {
    const dirs = {}, files = [{ name: 'LICENSE', id: null }];
    GG.order.forEach((t) => {
      const p = t.path.split('/');
      if (p.length === 1) files.push({ name: p[0] + '.md', id: t.id });
      else (dirs[p[0]] = dirs[p[0]] || []).push({ name: p[1] + '.md', id: t.id });
    });
    const items = files.map((x) => ({ type: 'f', name: x.name, id: x.id })).concat(Object.keys(dirs).map((d) => ({ type: 'd', name: d, kids: dirs[d].sort((a, b) => a.name.localeCompare(b.name)) })));
    items.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()) || (a.type === 'd' ? -1 : 1));
    const fileLine = (x, pre) => `<div class="in-tree-l"><span class="in-tree-g">${pre}</span>${x.id ? chip(x.id, esc(x.name)) : `<span>${esc(x.name)}</span><small>the CC BY 4.0 license</small>`}</div>`;
    let html = '<div class="in-tree-l"><b style="color:var(--ink)">gpu-glossary/</b></div>';
    items.forEach((x, k) => {
      const last = k === items.length - 1, g = last ? '└── ' : '├── ', cont = last ? '    ' : '│   ';
      if (x.type === 'f') { html += fileLine(x, g); return; }
      html += `<div class="in-tree-l"><span class="in-tree-g">${g}</span><button type="button" aria-expanded="false" data-dir="${x.name}"><i>▸</i>${esc(x.name)}/</button><small>${x.kids.length} files<span class="in-tree-sec"> · ${esc(SEC_LABEL[x.name] || '')}</span></small></div>`;
      x.kids.forEach((kid, j) => { html += `<div class="in-tree-kid" data-of="${x.name}" hidden>${fileLine(kid, cont + (j === x.kids.length - 1 ? '└── ' : '├── '))}</div>`; });
    });
    return `<div class="in-term"><div class="in-term-h"><span>source</span><span>github.com/modal-labs/gpu-glossary</span></div>
      <div class="in-term-b"><div class="in-tree-tools"><button type="button" class="btn" data-all="1">Expand all</button><button type="button" class="btn" data-all="0">Collapse all</button></div><div class="in-tree-scroll"><div class="in-tree">${html}</div></div></div></div>`;
  }
  function wireTree(root) {
    const setDir = (btn, open) => {
      btn.setAttribute('aria-expanded', String(open));
      root.querySelectorAll(`.in-tree-kid[data-of="${btn.getAttribute('data-dir')}"]`).forEach((k) => { k.hidden = !open; });
    };
    root.querySelectorAll('button[data-dir]').forEach((b) => b.addEventListener('click', () => setDir(b, b.getAttribute('aria-expanded') !== 'true')));
    root.querySelectorAll('button[data-all]').forEach((b) => b.addEventListener('click', () => root.querySelectorAll('button[data-dir]').forEach((d) => setDir(d, b.getAttribute('data-all') === '1'))));
  }

  /* Fig: anatomy of a figure (threads fill warps) */
  function buildAnatomy(ctx, slot, legendSlot) {
    const f = fig(ctx, slot, {
      title: 'Threads fill warps', hint: 'drag the slider', class: 'in-anatfig',
      caption: 'A thread block is split into warps of 32 threads. A block can hold any number of threads up to 1,024, but a partly filled last warp still takes up a whole warp, which is one reason block sizes are usually multiples of 32.',
    });
    const ROWS = 32, COLS = 32;
    const gridEl = GG.el('div', { class: 'in-wgrid', role: 'img' });
    f.stage.append(gridEl);
    const lanes = [], rowsEl = [];
    for (let r = 0; r < ROWS; r++) {
      const row = GG.el('div', { class: 'in-wrow' }, GG.el('span', { text: 'warp ' + r }));
      const cells = GG.el('div', { class: 'in-wcells' });
      for (let c = 0; c < COLS; c++) { const i = GG.el('i'); cells.append(i); lanes.push(i); }
      row.append(cells); gridEl.append(row); rowsEl.push(row);
    }
    const sW = GG.ui.stat(f.readouts, { label: 'warps', value: '' });
    const sL = GG.ui.stat(f.readouts, { label: 'last warp', value: '' });
    const sI = GG.ui.stat(f.readouts, { label: 'idle lanes', value: '' });
    function set(n) {
      n = Math.max(1, Math.min(ROWS * COLS, Math.round(n)));
      const warps = Math.ceil(n / 32), lastN = n - 32 * (warps - 1), idle = 32 * warps - n;
      lanes.forEach((el, k) => { el.className = k < n ? 'a' : Math.floor(k / COLS) < warps ? 'x' : ''; });
      rowsEl.forEach((el, r) => el.classList.toggle('on', r < warps));
      gridEl.setAttribute('aria-label', `A block of ${n} threads laid out in warps of 32: ${warps} of the 32 warp rows a block can have are used, ${idle} lanes idle.`);
      sW.set(warps); sL.set(`${lastN} / 32`); sI.set(idle, idle ? 'danger' : 'core');
      const max = n === ROWS * COLS ? ' That is the largest block allowed: all 32 rows, 1,024 threads.' : '';
      whyWithBadge(idle
        ? `A block of <b>${GG.fmt.int(n)}</b> ${n === 1 ? 'thread' : 'threads'} needs <b>${warps}</b> ${warps === 1 ? 'warp' : 'warps'}: ${warps > 1 ? `${warps - 1} full and ` : ''}one with only ${lastN} active ${lastN === 1 ? 'thread' : 'threads'}, so ${idle} of its 32 lanes (red) ${idle === 1 ? 'does' : 'do'} nothing. The grey rows are warps a bigger block could use, up to 32 warps of 32.`
        : `A block of <b>${GG.fmt.int(n)}</b> threads fills exactly <b>${warps}</b> ${warps === 1 ? 'warp' : 'warps'}. No lane is idle, which is why block sizes are usually multiples of 32.${max}`);
    }
    const badge = (k) => `<span class="in-badge" data-part="${k}" aria-hidden="true">${k}</span>`;
    function whyWithBadge(html) { f.setWhy(badge(5) + html); }
    GG.ui.slider(f.controls, { label: 'threads per block', min: 1, max: 1024, step: 1, value: 100, format: (v) => GG.fmt.int(v), onInput: set });
    set(100);
    // numbered badges on the parts of the panel
    const parts = [f.bar, f.stage, f.controls, f.readouts, f.why, f.caption];
    f.bar.insertAdjacentHTML('afterbegin', badge(1));
    f.stage.insertAdjacentHTML('afterbegin', badge(2));
    f.controls.insertAdjacentHTML('afterbegin', badge(3));
    f.readouts.insertAdjacentHTML('afterbegin', badge(4));
    f.caption.insertAdjacentHTML('afterbegin', badge(6));
    const LEG = [
      '<b>Title bar</b>: the figure number (prose refers to it as “Fig. 6”), what it shows, and a hint for how to use it.',
      '<b>Stage</b>: the picture itself. Most respond to hovering, clicking or dragging.',
      '<b>Controls</b>: sliders, buttons and switches. All of them work from the keyboard too.',
      '<b>Readouts</b>: numbers computed from the controls, never typed in by hand.',
      '<b>Why line</b>: one plain sentence about what you are looking at right now. It changes as you do.',
      '<b>Caption</b>: what the figure shows in general, and where it comes from.',
    ];
    legendSlot.outerHTML = `<ol class="in-anat" data-anat>${LEG.map((t, k) => `<li tabindex="0" data-part="${k + 1}">${badge(k + 1)}<span>${t}</span></li>`).join('')}</ol>`;
    const legend = f.root.parentNode.querySelector('ol[data-anat]');
    const hl = (k) => {
      parts.forEach((p, j) => p.classList.toggle('in-anat-on', j + 1 === k));
      if (legend) legend.querySelectorAll('li').forEach((li) => li.classList.toggle('on', +li.getAttribute('data-part') === k));
    };
    const on = (e) => { const el = e.target.closest('[data-part]'); hl(el ? +el.getAttribute('data-part') : 0); };
    [legend, f.root].forEach((r) => {
      if (!r) return;
      r.addEventListener('mouseover', on);
      r.addEventListener('focusin', on);
      r.addEventListener('mouseleave', () => hl(0));
      r.addEventListener('focusout', () => hl(0));
    });
  }

  GG.entry('readme', {
    render(body, ctx) {
      const s = ctx.html(body, `
        <p class="in-lead">The GPU Glossary opens with a short README: why it exists, how it was made, and how to read it. Here it is again, drawn out. The last section, <a href="#in-howto">How to read Warp &amp; Weft</a>, is a short guide to this companion site.</p>
        ${bannerHTML()}
        <h3>One stack, scattered documentation</h3>
        <p>The headline above is the README's first sentence, in the voice of the glossary's authors at <a href="https://modal.com/">Modal</a>. Their complaint is that <strong>the documentation is fragmented</strong>: each level of the stack, from the silicon up to the compiler you run on your laptop, is documented separately, in its own vocabulary and with its own spelling of the same version numbers. That makes it hard to connect a concept at one level to the concepts it depends on at the others.</p>
        <p>The README names three examples. A chip's ${tl('streaming-multiprocessor-architecture', 'Streaming Multiprocessor Architecture')} is a fact about the hardware. ${tl('compute-capability', 'Compute Capability')} versions the instruction set that software is written against. The ${tl('host-software', 'nvcc compiler flags')} are what you actually type to build a program. All three are spelled with the same version number, and each is explained in a different manual. Fig. 1 follows one number through all of them. (The compiler has an entry of its own: ${tl('nvcc', 'nvcc')}, the NVIDIA CUDA Compiler Driver.)</p>
        <div data-slot="names"></div>
        ${GG.noteHTML('beyond', '<p>The GPUs and their compute capabilities in Fig. 1 come from NVIDIA\'s published tables, not from the glossary. So do the rules in its bottom row, from the <a href="https://docs.nvidia.com/cuda/cuda-compiler-driver-nvcc/index.html">nvcc documentation</a> and the <a href="https://docs.nvidia.com/cuda/cuda-programming-guide/05-appendices/compute-capabilities.html">CUDA Programming Guide</a>: SASS built for compute capability X.y runs on any X.z GPU with z at least y, never across major versions; PTX can be JIT-compiled for any newer GPU; code built for an <code>a</code> target runs only on that exact compute capability, and code built for an <code>f</code> target only on the members of its family. The suffix never changes what the GPU itself reports: an H100 is compute capability 9.0 whichever target you build for. One more quirk worth knowing: the <code>.target</code> directive at the top of every PTX file names its virtual architecture with an <code>sm_</code> prefix, as in <code>.target sm_90</code>, while nvcc\'s flags call the same thing <code>compute_90</code>.</p>')}
        <p>The glossary's answer is to cover the whole stack in one place, in four parts. Two describe the GPU, which NVIDIA calls the <em>device</em>: its ${tl('device-hardware', 'hardware')} and the ${tl('device-software', 'software that runs on it')}. One describes the ${tl('host-software', 'software on the CPU')}, the <em>host</em>, that builds GPU programs and drives them. The fourth, ${tl('perf', 'performance')}, is less a layer than a lens: its terms describe how well the other three work together.</p>
        <div data-slot="atlas"></div>
        <h3>How it was made</h3>
        <p>To put it together, in the README's words, the authors “read the PDFs from NVIDIA, lurked in the good Discords, and even bought dead-tree textbooks”. Each of the three links stands for a different kind of knowledge: the vendor's reference documents, the working lore of practitioners, and the patient explanations of a textbook.</p>
        ${sourcesHTML()}
        ${GG.noteHTML('beyond', `<p>The <strong>PTX Writers Guide to Interoperability</strong> is a short NVIDIA document on the conventions, such as how functions pass their parameters, that let PTX produced by different compilers work together. The glossary cites the same guide in its ${tl('streaming-multiprocessor-architecture', 'SM Architecture')} entry, for the claim that an SM's major version identifies its architecture family, a claim the glossary then qualifies: Ada GPUs are version 8.9, the same major version as Ampere (try the A10G and the L4 in Fig. 1).</p><p><strong>GPU MODE</strong> (formerly CUDA MODE) is a community of GPU programmers built around a Discord server and a lecture series; the glossary's credits thank Mark Saroufim and Andreas Kopf for bringing it together. <strong>Professional CUDA C Programming</strong> (Wrox, 2014) is by John Cheng, Max Grossman and Ty McKercher; the glossary's diagram of the CUDA Toolkit, redrawn in the ${tl('host-software', 'Host Software')} chapter, is adapted from it.</p>`)}
        <h3>A hypertext document</h3>
        <p>Unlike a PDF, a Discord or a book, the glossary is a <em>hypertext document</em>: all of its pages link to one another, so you can follow a term wherever it leads. The README's example is a detour most readers take early. Reading about the ${tl('cuda-programming-model', 'CUDA programming model')}, you meet ${tl('thread', 'threads')}; to understand them better, you jump down the stack to the ${tl('warp-scheduler', 'Warp Scheduler')}, the hardware that decides which threads run on each clock cycle.</p>
        <div data-slot="trail"></div>
        ${GG.noteHTML('check', `<p>Two of the README's links point somewhere slightly different from their text. “The article on the CUDA programming model” links to ${tl('cuda-c', 'CUDA C++')}, the entry on the programming model's implementation as an extension of C++, rather than to ${tl('cuda-programming-model', 'CUDA (Programming Model)')}. And “nvcc compiler flags” links to the ${tl('host-software', 'Host Software')} chapter page, not to the ${tl('nvcc', 'nvcc')} entry. Both targets are linked here.</p>`, 'Checked the links')}
        <p>Follow enough detours and the glossary turns into a web. Fig. 4 draws it: every entry as a dot, and every link in the glossary's own text as a line between two dots. A switch shows the links on this site instead, which adds some of its own when it retells an entry.</p>
        <div data-slot="web"></div>
        <h3>Or read it front to back</h3>
        <p>You can also read it linearly. In the original you move between pages with the arrow keys, the arrows at the bottom of each page, or the table of contents, which sits in the sidebar on desktop and behind the hamburger menu on mobile. Warp &amp; Weft keeps all three: <kbd>→</kbd> and <kbd>←</kbd> step through the entries, every entry ends with <em>Previous</em> and <em>Next</em> links, and the Contents panel lists everything.</p>
        <div data-slot="strip"></div>
        <h3>The source</h3>
        <p>The source for the glossary is available <a href="https://github.com/modal-labs/gpu-glossary">on GitHub</a>: one Markdown file per entry, in folders that mirror the four parts. Open a folder below to see its files; each one links to its entry here.</p>
        <div data-slot="tree"></div>
        ${GG.noteHTML('beyond', '<p>According to the repository\'s own README, the files in its <code>gpu-glossary</code> folder, the text of the glossary, are licensed under <a href="https://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0</a>, which is what allows companions like this one to adapt them; the rest of the repository is MIT-licensed. The same README describes the glossary as focused on NVIDIA GPUs, the ones that run on Modal, and lists a community translation into <a href="https://github.com/miter6/gpu-glossary-zh">Simplified Chinese</a>.</p>')}
        <h3 id="in-howto">How to read Warp &amp; Weft</h3>
        <p>Every entry on this site has the same shape: the glossary's one-sentence definition as the headline, then a fuller explanation with figures you can operate. The figures are small instrument panels, and they all share the parts labelled in Fig. 6. Hover a label under it to see which part is which.</p>
        <div data-slot="anat"></div>
        <div data-slot="legend"></div>
        <details class="in-more">
        <summary><span>Margin notes, link previews and keys</span><small>the keys are also listed under <kbd>?</kbd></small></summary>
        <h4>Four kinds of margin note</h4>
        <div class="in-notes">
          ${GG.noteHTML('beyond', '<p>Context that is not in the original glossary: background, history or numbers from other well-established sources, kept apart so you always know what the glossary itself says.</p>')}
          ${GG.noteHTML('check', '<p>Places where we redid the arithmetic. If the glossary has a slip, the entry shows the corrected value and explains the difference: the SM entry\'s “about 1.25 W” per CPU thread, for instance, works out to 500 W ÷ 384 = 1.30 W.</p>')}
          ${GG.noteHTML('history', '<p>Where a term or a design came from. Warps, for example, are named after weaving, “the first parallel thread technology” according to Lindholm et al. (2008), which is also where this site gets its name.</p>')}
          ${GG.noteHTML('intuition', '<p>An analogy or a mental picture to hold on to before the precise version arrives. Treat it as a handrail, not a definition.</p>')}
        </div>
        <p>Three more appear now and then: “From the glossary” marks a memorable line quoted word for word, “Watch out” flags a common mistake, and “Aside” holds a small digression.</p>
        <h4>Previews and keys</h4>
        <p>Dotted links are cross-references to other entries, coloured by chapter. With a mouse, hover one, like this link to ${tl('warp', 'Warp')}, to preview the entry without losing your place; click to go there. On a phone, tap to jump. Every entry ends with the entries it links to, the entries that link to it, and a link to the original page on modal.com. The keys work anywhere outside a text box:</p>
        ${GG.tableHTML(`<tbody>
          <tr><td class="in-kbd-row"><kbd>→</kbd></td><td>Next entry</td></tr>
          <tr><td class="in-kbd-row"><kbd>←</kbd></td><td>Back to the top of this entry, or, if you are already there, the previous entry</td></tr>
          <tr><td class="in-kbd-row"><kbd>/</kbd> <kbd>K</kbd></td><td>Search terms by name or abbreviation</td></tr>
          <tr><td class="in-kbd-row"><kbd>?</kbd></td><td>Show these keys</td></tr>
          <tr><td class="in-kbd-row"><kbd>Esc</kbd></td><td>Close a panel or the contents drawer</td></tr>
        </tbody>`)}
        </details>
        <h4>The four parts</h4>
        <div class="in-chapters">${SECS.map((sec, k) => tl(sec, `<span class="in-ico">${ICON[sec]}</span><small>Part ${k + 1} · ${termsOf(sec).length} terms</small><b>${SEC_LABEL[sec]}</b><span>${{ 'device-hardware': 'The physical GPU, from whole chip to single register.', 'device-software': 'What runs on the GPU and how it is written down.', 'host-software': 'The CPU-side tools that build, launch and watch GPU programs.', perf: 'Why GPU programs are fast or slow, and how to tell.' }[sec]}</span>`).replace('<a ', `<a class="in-chap" style="--c:${chVar(sec)}" `)).join('')}</div>
      `);
      try { buildNames(ctx, s.names); } catch (e) { console.error('[intro] names', e); }
      try { buildAtlas(ctx, s.atlas); } catch (e) { console.error('[intro] atlas', e); }
      try { buildTrail(ctx, s.trail); } catch (e) { console.error('[intro] trail', e); }
      try { buildWeb(ctx, s.web); } catch (e) { console.error('[intro] web', e); }
      try { buildStrip(ctx, s.strip); } catch (e) { console.error('[intro] strip', e); }
      try { s.tree.outerHTML = treeHTML(); wireTree(body); } catch (e) { console.error('[intro] tree', e); }
      try { buildAnatomy(ctx, s.anat, s.legend); } catch (e) { console.error('[intro] anatomy', e); }
    },
  });

  /* ═════════════════════════ plates: shared ═════════════════════════ */
  function locatorHTML(active) {
    const L = (sec, x, y, w, h, label) => {
      const on = sec === active ? ' on' : '';
      return `<a data-in-term="${sec}" aria-label="${label}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" class="in-loc-l${on}" style="--c:${chVar(sec)}"/><text x="${x + 12}" y="${y + h / 2 + 4.5}" class="in-loc-t${on}">${label}</text></a>`;
    };
    const lensOn = active === 'perf' ? ' on' : '';
    return `<figure class="in-loc"><svg viewBox="0 0 300 218" class="in-svg" role="group" aria-label="Where this part sits: Host Software on the CPU; Device Software and Device Hardware on the GPU; Performance across all three">
      <text x="10" y="11" class="in-loc-cap">CPU · the host</text>
      <rect x="2" y="17" width="244" height="58" rx="11" class="in-loc-f"/>
      ${L('host-software', 14, 29, 220, 34, 'Host Software')}
      <path d="M124 78v24" class="in-loc-arr"/><path d="M119 97l5 6 5-6" class="in-loc-arr"/>
      <text x="134" y="94" class="in-loc-small">launches work</text>
      <text x="10" y="117" class="in-loc-cap">GPU · the device</text>
      <rect x="2" y="123" width="244" height="92" rx="11" class="in-loc-f"/>
      ${L('device-software', 14, 133, 220, 34, 'Device Software')}
      ${L('device-hardware', 14, 173, 220, 34, 'Device Hardware')}
      <a data-in-term="perf" aria-label="Performance"><rect x="256" y="17" width="40" height="198" rx="20" class="in-loc-lens${lensOn}"/><text transform="translate(281 116) rotate(-90)" text-anchor="middle" class="in-loc-t${lensOn}">Performance</text></a>
    </svg><figcaption>Where this part sits. Click a layer to jump to its chapter.</figcaption></figure>`;
  }
  function plateTop(sec, html) { return `<div class="in-plate-top"><div class="in-prose">${html}</div>${locatorHTML(sec)}</div>`; }

  /* ═════════════════════════ Device Hardware ═════════════════════════ */
  const H = { SM_ON: 132, GPCS: 8, TPC_PER_GPC: 9, SM_PER_TPC: 2, SUB: 4, FP32: 32, INT32: 16, FP64: 16, LDST: 8, RF_REGS: 16384, L1_KIB: 256 };
  H.TPCS = H.GPCS * H.TPC_PER_GPC; H.SMS = H.TPCS * H.SM_PER_TPC; H.TPC_ON = H.SM_ON / H.SM_PER_TPC;
  const fi = (n) => GG.fmt.int(n);
  const HW = {
    pkg: { name: 'Package', why: `Nested from the outside in: GPU RAM stacks beside one GPU die; the die holds ${H.GPCS} GPCs, each GPC ${H.TPC_PER_GPC} TPCs, each TPC ${H.SM_PER_TPC} SMs, each SM ${H.SUB} sub-partitions. ${isTouch() ? 'Step inwards, or tap any part to explain it; tap it again to open its entry.' : 'Step inwards, or hover any part.'}`, gpu: '1 package' },
    ram: { name: 'GPU RAM', parent: 'pkg', why: '<b>GPU RAM</b>: 80 GiB of HBM3, read at up to 3.35 TB/s. It sits beside the die on a shared interposer rather than on the die itself, and every SM can address all of it. It holds global memory and catches registers that spill. (H100 SXM5 uses five 16 GiB HBM3 stacks, 80 GiB in all, which NVIDIA\'s spec sheet lists as “80GB”; the package has room for six, drawn dashed.)', gpu: '80 GiB · 3.35 TB/s' },
    die: { name: 'Die', parent: 'pkg', why: `<b>The GPU die</b>. In a compute unified device architecture nearly all computing happens in identical SMs: ${H.SMS} on the full GH100 die (${H.GPCS} × ${H.TPC_PER_GPC} × ${H.SM_PER_TPC}), of which H100 SXM5 enables ${H.SM_ON}.`, gpu: `${H.SM_ON} of ${H.SMS} SMs on` },
    cda: { name: 'CUDA arch.', parent: 'die', why: '<b>CUDA (Device Architecture)</b>: the design behind this layout. GPUs before the GeForce 8800 mapped shader stages onto specialized units; since then, the hardware is a grid of uniform Streaming Multiprocessors that can each run any kind of work.', gpu: `${H.SMS} identical SMs` },
    l2: { name: 'L2', parent: 'die', why: 'The <b>L2 cache</b> sits between the SMs and GPU RAM and is shared by all of them. It has no glossary entry of its own.', gpu: 'shared by all SMs' },
    gpcT: { name: 'GPC', parent: 'die', why: `Seven more GPCs, drawn small. Red SMs are disabled: H100 SXM5 enables ${H.SM_ON} of the die's ${H.SMS} SMs, that is ${H.TPC_ON} of its ${H.TPCS} TPCs. The drawing disables six TPCs in arbitrary places; which ones are off varies from chip to chip.`, gpu: `${H.GPCS} GPCs` },
    gpc: { name: 'GPC', parent: 'die', why: `<b>GPC</b> (Graphics/GPU Processing Cluster): ${H.TPC_PER_GPC} TPCs plus a raster engine. Since compute capability 9.0, the thread blocks of a <em>cluster</em> are scheduled together onto one GPC.`, per: `${H.TPC_PER_GPC * H.SM_PER_TPC} SMs per GPC`, gpu: `${H.GPCS} GPCs` },
    raster: { name: 'Raster', parent: 'gpc', why: 'The <b>raster engine</b> turns triangles into pixels for graphics. As the glossary puts it, “apparently, some people use NVIDIA GPUs for graphics”.', gpu: `1 per GPC` },
    tpcT: { name: 'TPC', parent: 'gpc', why: `Eight more TPCs in this GPC, each a pair of SMs.`, gpu: `${H.TPC_ON} of ${H.TPCS} TPCs on` },
    tpc: { name: 'TPC', parent: 'gpc', why: '<b>TPC</b> (Texture Processing Cluster): a pair of adjacent SMs. Before Blackwell it mapped onto nothing in the programming model; Blackwell\'s “CTA pair” maps onto it (<code>.cta_group::2</code>).', per: `${H.SM_PER_TPC} SMs per TPC`, gpu: `${H.TPC_ON} of ${H.TPCS} TPCs on` },
    smT: { name: 'SM', parent: 'tpc', why: 'The TPC\'s other SM, identical to the one drawn in detail.', gpu: `${H.SM_ON} SMs on` },
    sm: { name: 'SM', parent: 'tpc', why: '<b>Streaming Multiprocessor</b>: roughly the GPU\'s version of a CPU core, with registers, caches, cores and schedulers. Its four sub-partitions share one L1 data cache and one TMA.', per: '1', gpu: `${H.SM_ON} of ${H.SMS} on` },
    arch: { name: 'SM arch.', parent: 'sm', why: '<b>SM architecture</b> 9.0, “Hopper”: the version number that decides which SASS this SM can run. Its Tensor Cores are the 4th generation.', per: 'SM 9.0', gpu: 'Hopper' },
    l1i: { name: 'L1i', parent: 'sm', why: 'The <b>L1 instruction cache</b> feeds the sub-partitions\' L0 instruction caches. Not a glossary entry.', per: '1', gpu: fi(H.SM_ON) },
    subT: { name: 'Sub-part.', parent: 'sm', why: 'Three more sub-partitions, identical to the one drawn in detail.', per: `${H.SUB}`, gpu: fi(H.SUB * H.SM_ON) },
    sub: { name: 'Sub-partition', parent: 'sm', why: '<b>SM sub-partition</b>, one of four. Each has its own warp scheduler and dispatch unit, register file, CUDA Cores, Tensor Core, load/store units and SFU. The glossary suspects these four sub-partitions explain why a warpgroup must start at a warp rank that is a multiple of 4.', per: `${H.SUB}`, gpu: fi(H.SUB * H.SM_ON) },
    l0: { name: 'L0i', parent: 'sub', why: 'The <b>L0 instruction cache</b> of one sub-partition. Not a glossary entry.', per: `${H.SUB}`, gpu: fi(H.SUB * H.SM_ON) },
    ws: { name: 'Warp Scheduler', parent: 'sub', why: '<b>Warp Scheduler</b>: on each clock cycle it picks a warp whose next instruction is ready and issues it, 32 threads at a time. Switching to another warp is nearly free, because every warp\'s registers stay put in the register file; that is how GPUs hide latency.', per: `${H.SUB}`, gpu: fi(H.SUB * H.SM_ON) },
    disp: { name: 'Dispatch', parent: 'sub', why: 'The <b>dispatch unit</b> sends the chosen warp\'s instruction to the execution units, 32 threads per clock. The glossary colours it with the warp scheduler.', per: `${H.SUB}`, gpu: fi(H.SUB * H.SM_ON) },
    rf: { name: 'Register File', parent: 'sub', why: `<b>Register file</b>: ${fi(H.RF_REGS)} 32-bit registers per sub-partition, ${fi(H.RF_REGS * H.SUB)} (256 KiB) per SM. It is the fastest storage on the chip, about an order of magnitude faster than the L1 data cache.`, per: `${fi(H.RF_REGS * H.SUB)} regs`, gpu: GG.fmt.bytes(H.RF_REGS * H.SUB * 4 * H.SM_ON, 0) },
    cores: { name: 'Cores', parent: 'sub', why: '<b>Cores</b>: the “pipes” that do the arithmetic. CUDA Cores handle scalar instructions; the Tensor Core multiplies whole matrices.', per: `${H.FP32 * H.SUB} FP32 + ${H.SUB} TC`, gpu: `${fi(H.FP32 * H.SUB * H.SM_ON)} + ${fi(H.SUB * H.SM_ON)}` },
    cuda: { name: 'CUDA Cores', parent: 'cores', why: `<b>CUDA Cores</b>: here ${H.INT32} INT32, ${H.FP32} FP32 and ${H.FP64} FP64 units per sub-partition. NVIDIA counts ${H.FP32 * H.SUB} “FP32 CUDA Cores” per SM, which is twice the number of INT32 or FP64 units.`, per: `${H.FP32 * H.SUB} FP32`, gpu: `${fi(H.FP32 * H.SUB * H.SM_ON)} FP32` },
    tc: { name: 'Tensor Core', parent: 'cores', why: '<b>Tensor Core</b>: one per sub-partition, four per SM, far larger than a CUDA Core. Each instruction multiplies whole matrices, which is where nearly all of an H100\'s arithmetic throughput lives.', per: `${H.SUB}`, gpu: fi(H.SUB * H.SM_ON) },
    lsu: { name: 'LD/ST', parent: 'sub', why: `<b>Load/Store Units</b>: ${H.LDST} per sub-partition. They send loads and stores to the L1 data cache and, through it, to GPU RAM.`, per: `${H.LDST * H.SUB}`, gpu: fi(H.LDST * H.SUB * H.SM_ON) },
    sfu: { name: 'SFU', parent: 'sub', why: '<b>Special Function Unit</b>: fast transcendental maths like <code>exp</code>, <code>sin</code> and <code>cos</code>, issued as SASS <code>MUFU</code> instructions.', per: `${H.SUB} blocks`, gpu: fi(H.SUB * H.SM_ON) + ' blocks' },
    l1: { name: 'L1 data cache', parent: 'sm', why: `<b>L1 data cache</b>: ${H.L1_KIB} KiB of SRAM per SM, shared by the four sub-partitions and mostly managed by the programmer. Up to 228 KB of it can be used as shared memory.`, per: `${H.L1_KIB} KiB`, gpu: GG.fmt.bytes(H.L1_KIB * 1024 * H.SM_ON, 0) },
    tma: { name: 'TMA', parent: 'sm', why: '<b>Tensor Memory Accelerator</b>, new in Hopper: it computes the addresses for bulk copies of multi-dimensional arrays from GPU RAM into shared memory, skipping the registers, while the threads get on with other work.', per: '1', gpu: fi(H.SM_ON) },
    tmem: { name: 'Tensor Memory', parent: 'sm', why: '<b>Tensor Memory</b> is not on H100: Blackwell SMs, as in the B200, add it to hold Tensor Core operands, above all the accumulators. Despite the name, the TMA does not load into it.', per: 'none on H100', gpu: 'B200 and later' },
    tex: { name: 'Tex', parent: 'sm', why: 'Four <b>texture units</b>, used mostly for graphics. Not a glossary entry.', per: '4', gpu: fi(4 * H.SM_ON) },
  };
  const hwDesc = (a, b) => { let p = HW[a] && HW[a].parent; while (p) { if (p === b) return true; p = HW[p].parent; } return false; };
  const OFF_TPC = { 0: 4, 1: 7, 3: 1, 4: 5, 5: 8, 6: 2 };

  function hwLayout(mode) {
    const R = [], wide = mode === 'wide';
    const add = (o) => { R.push(o); return o; };
    const frame = (id, hid, b, label, term, extra) => add(Object.assign({ id, hid: hid || id, kind: 'frame', b, label, term }, extra || {}));
    const box = (id, b, label, extra) => add(Object.assign({ id, hid: id, kind: 'box', b, label }, extra || {}));
    let VW, VH;
    function ram(b, horizontal, key) {
      add({ id: key, hid: 'ram', kind: 'group', b, label: 'GPU RAM', term: 'gpu-ram', horizontal });
      const n = 3;
      const area = horizontal ? B(b.x + 78, b.y + 4, b.w - 82, b.h - 8) : B(b.x, b.y + 22, b.w, b.h - 22);
      const st = horizontal ? tiles(area, 6, 'h', 8) : tiles(B(area.x + 2, area.y + area.h * 0.06, area.w - 4, area.h * 0.88), n, 'v', 22);
      st.forEach((s, k) => {
        const sb = horizontal ? s : B(s.x, s.y + s.h * 0.1, s.w, s.h * 0.8);
        const spare = key === 'ramR' ? k === 2 : key === 'ramH' ? k === 5 : false;
        add({ id: key + k, hid: 'ram', kind: 'stack', b: sb, tone: 'memory', term: 'gpu-ram', label: spare ? 'unused' : 'HBM3', dash: spare });
      });
    }
    function gpcTile(b, k) {
      add({ id: 'gpcT' + k, hid: 'gpcT', kind: 'tile', b, label: 'GPC', mini: 'gpc', off: OFF_TPC[k] });
    }
    function sharedUnits(b, twoRows) {
      if (!twoRows) {
        const w = b.w - 18;
        let x = b.x;
        const seg = (frac) => { const r = B(x, b.y, w * frac, b.h); x += w * frac + 6; return r; };
        box('l1', seg(0.47), 'L1 data cache / shared memory', { tone: 'memory', sub: `${H.L1_KIB} KiB`, term: 'l1-data-cache' });
        box('tma', seg(0.14), 'TMA', { tone: 'special', sub: 'bulk copies', term: 'tensor-memory-accelerator' });
        box('tmem', seg(0.26), 'Tensor Memory', { tone: 'memory', sub: 'not on H100: B200+', term: 'tensor-memory', dash: true });
        box('tex', seg(0.13), 'Tex ×4', { muted: true });
      } else {
        const [r1, r2] = cut(b, 'top', (b.h - 6) / 2, 6);
        box('l1', r1, 'L1 data cache / shared memory', { tone: 'memory', sub: `${H.L1_KIB} KiB`, term: 'l1-data-cache' });
        const w = r2.w - 12;
        box('tma', B(r2.x, r2.y, w * 0.27, r2.h), 'TMA', { tone: 'special', term: 'tensor-memory-accelerator' });
        box('tmem', B(r2.x + w * 0.27 + 6, r2.y, w * 0.5, r2.h), 'Tensor Memory', { tone: 'memory', sub: 'not on H100', term: 'tensor-memory', dash: true });
        box('tex', B(r2.x + w * 0.77 + 12, r2.y, w * 0.23, r2.h), 'Tex ×4', { muted: true });
      }
    }
    function subContents(b) {
      let y = b.y;
      const G = 5, row = (h) => { const r = B(b.x, y, b.w, h); y += h + G; return r; };
      const [l0, ws] = cut(row(24), 'left', wide ? 86 : 70, 5);
      box('l0', l0, 'L0 i-cache', { muted: true, fs: 9.5 });
      box('ws', ws, 'Warp Scheduler', { tone: 'control', sub: '32 threads/clk', term: 'warp-scheduler', inline: true });
      box('disp', row(19), 'Dispatch Unit · 32 threads/clk', { tone: 'control', muted: true, fs: 9.5 });
      box('rf', row(wide ? 34 : 32), 'Register File', { tone: 'memory', sub: `${fi(H.RF_REGS)} × 32-bit`, term: 'register-file' });
      const cr = row(wide ? 104 : 96);
      add({ id: 'cores', hid: 'cores', kind: 'frame', b: cr, label: 'Cores', term: 'core', tone: 'core', small: true });
      const cin = inset(cr, 6, 22);
      const [tcB, ccB] = cut(cin, 'right', Math.round(cin.w * (wide ? 0.3 : 0.34)), 6);
      add({ id: 'cuda', hid: 'cuda', kind: 'units', b: ccB, tone: 'core', label: 'CUDA Cores', term: 'cuda-core', rows: [['INT32', H.INT32], ['FP32', H.FP32], ['FP64', H.FP64]] });
      box('tc', tcB, 'Tensor Core', { tone: 'core', sub: '4th gen', term: 'tensor-core' });
      const lr = row(28);
      const [sfuB, lsuB] = cut(lr, 'right', Math.round(lr.w * 0.3), 6);
      add({ id: 'lsu', hid: 'lsu', kind: 'units', b: lsuB, tone: 'special', label: 'LD/ST', term: 'load-store-unit', rows: [['', H.LDST]], inline: true });
      box('sfu', sfuB, 'SFU', { tone: 'special', term: 'special-function-unit' });
      return y - G;
    }

    if (wide) {
      VW = 1000; VH = 668;
      const pkg = B(1, 1, 998, 666);
      frame('pkg', 'pkg', pkg, 'H100 SXM5 package', null, { muted: true, tags: ['die and GPU RAM share one interposer'] });
      const pin = inset(pkg, 12, 32);
      const [hl, r1] = cut(pin, 'left', 56, 12);
      const [hr, dieB] = cut(r1, 'right', 56, 12);
      ram(hl, false, 'ramL'); ram(hr, false, 'ramR');
      frame('die', 'die', dieB, 'GPU die', null, { muted: true });
      add({ id: 'cda', hid: 'cda', kind: 'pill', b: B(dieB.x + dieB.w - 222, dieB.y + 7, 212, 20), label: 'CUDA (Device Architecture)', term: 'cuda-device-architecture' });
      const din = inset(dieB, 12, 34);
      const [gcol, r2] = cut(din, 'left', 100, 10);
      tiles(gcol, 7, 'v', 7).forEach(gpcTile);
      const [l2, gpcB] = cut(r2, 'left', 24, 10);
      add({ id: 'l2', hid: 'l2', kind: 'vtext', b: l2, label: 'L2 cache', muted: true });
      frame('gpc', 'gpc', gpcB, 'GPC · Graphics/GPU Processing Cluster', 'graphics-processing-cluster', { tags: [`×${H.GPCS} per die`] });
      const gin = inset(gpcB, 12, 32);
      const [ras, r3] = cut(gin, 'top', 22, 8);
      box('raster', ras, 'Raster engine', { muted: true });
      const [trow, tpcB] = cut(r3, 'top', 46, 10);
      tiles(trow, 8, 'h', 6).forEach((b, k) => add({ id: 'tpcT' + k, hid: 'tpcT', kind: 'tile', b, label: 'TPC', mini: 'tpc' }));
      frame('tpc', 'tpc', tpcB, 'TPC · Texture Processing Cluster', 'texture-processing-cluster', { tags: [`×${H.TPC_PER_GPC} per GPC`] });
      const tin = inset(tpcB, 12, 32);
      const [scol, smB] = cut(tin, 'left', 82, 10);
      add({ id: 'smT', hid: 'smT', kind: 'tile', b: scol, label: 'SM', mini: 'sm' });
      frame('sm', 'sm', smB, 'SM · Streaming Multiprocessor', 'streaming-multiprocessor', { tags: [`×${H.SM_PER_TPC} per TPC`], tagOffset: 150 });
      add({ id: 'arch', hid: 'arch', kind: 'pill', b: B(smB.x + smB.w - 136, smB.y + 7, 126, 20), label: 'SM 9.0 · Hopper', term: 'streaming-multiprocessor-architecture', tone: 'core' });
      const smin = inset(smB, 10, 34);
      const [l1i, r4] = cut(smin, 'top', 18, 6);
      box('l1i', l1i, 'L1 instruction cache', { muted: true, fs: 9.5 });
      const [shB, r5] = cut(r4, 'bottom', 40, 8);
      sharedUnits(shB, false);
      const [subc, subB] = cut(r5, 'left', 56, 8);
      tiles(subc, 3, 'v', 6).forEach((b, k) => add({ id: 'subT' + k, hid: 'subT', kind: 'tile', b, label: 'sub', mini: 'sub' }));
      frame('sub', 'sub', subB, 'SM sub-partition', null, { muted: true, tags: [`×${H.SUB} per SM`] });
      subContents(inset(subB, 10, 28));
    } else {
      VW = 400;
      const X0 = 1, W0 = 398;
      const pkg = { x: X0, y: 1, w: W0 };
      let y = pkg.y + 32;
      const pin = { x: pkg.x + 10, w: pkg.w - 20 };
      const hbm = B(pin.x, y, pin.w, 42); y += 42 + 10;
      const die = { x: pin.x, y, w: pin.w };
      y += 34;
      const din = { x: die.x + 10, w: die.w - 20 };
      const grow = B(din.x, y, din.w, 48); y += 48 + 8;
      const l2 = B(din.x, y, din.w, 18); y += 18 + 8;
      const gpc = { x: din.x, y, w: din.w }; y += 30;
      const gin = { x: gpc.x + 10, w: gpc.w - 20 };
      const ras = B(gin.x, y, gin.w, 20); y += 20 + 6;
      const trow = B(gin.x, y, gin.w, 40); y += 40 + 8;
      const tpc = { x: gin.x, y, w: gin.w }; y += 30;
      const tin = { x: tpc.x + 10, w: tpc.w - 20 };
      const srow = B(tin.x, y, tin.w, 32); y += 32 + 8;
      const sm = { x: tin.x, y, w: tin.w }; y += 50;
      const smin = { x: sm.x + 8, w: sm.w - 16 };
      const l1i = B(smin.x, y, smin.w, 16); y += 16 + 6;
      const subrow = B(smin.x, y, smin.w, 28); y += 28 + 8;
      const sub = { x: smin.x, y, w: smin.w }; y += 28;
      const subEnd = subContents(B(sub.x + 8, y, sub.w - 16, 0));
      sub.h = subEnd + 8 - sub.y; y = sub.y + sub.h + 8;
      const shared = B(smin.x, y, smin.w, 64); y += 64 + 8;
      sm.h = y - sm.y; y += 10;
      tpc.h = y - tpc.y; y += 10;
      gpc.h = y - gpc.y; y += 10;
      die.h = y - die.y; y += 10;
      pkg.h = y - pkg.y;
      VH = Math.ceil(pkg.y + pkg.h + 1);
      // frames first (painter's order)
      const inner = R.splice(0);
      frame('pkg', 'pkg', B(pkg.x, pkg.y, pkg.w, pkg.h), 'H100 SXM5 package', null, { muted: true });
      ram(hbm, true, 'ramH');
      frame('die', 'die', B(die.x, die.y, die.w, die.h), 'GPU die', null, { muted: true });
      add({ id: 'cda', hid: 'cda', kind: 'pill', b: B(die.x + die.w - 216, die.y + 6, 208, 21), label: 'CUDA (Device Architecture)', term: 'cuda-device-architecture' });
      tiles(grow, 7, 'h', 5).forEach(gpcTile);
      add({ id: 'l2', hid: 'l2', kind: 'box', b: l2, label: 'L2 cache', muted: true, fs: 12 });
      frame('gpc', 'gpc', B(gpc.x, gpc.y, gpc.w, gpc.h), 'GPC · Graphics/GPU Processing Cluster', 'graphics-processing-cluster', { tags: [`×${H.GPCS}`] });
      box('raster', ras, 'Raster engine', { muted: true, fs: 11.5 });
      tiles(trow, 8, 'h', 4).forEach((b, k) => add({ id: 'tpcT' + k, hid: 'tpcT', kind: 'tile', b, label: 'TPC', mini: 'tpc' }));
      frame('tpc', 'tpc', B(tpc.x, tpc.y, tpc.w, tpc.h), 'TPC · Texture Processing Cluster', 'texture-processing-cluster', { tags: [`×${H.TPC_PER_GPC}`] });
      add({ id: 'smT', hid: 'smT', kind: 'tile', b: srow, label: 'SM', mini: 'smh' });
      frame('sm', 'sm', B(sm.x, sm.y, sm.w, sm.h), 'SM · Streaming Multiprocessor', 'streaming-multiprocessor', { tags: [`×${H.SM_PER_TPC}`] });
      add({ id: 'arch', hid: 'arch', kind: 'pill', b: B(sm.x + 10, sm.y + 25, 136, 20), label: 'SM 9.0 · Hopper', term: 'streaming-multiprocessor-architecture', tone: 'core' });
      box('l1i', l1i, 'L1 instruction cache', { muted: true, fs: 9 });
      tiles(subrow, 3, 'h', 6).forEach((b, k) => add({ id: 'subT' + k, hid: 'subT', kind: 'tile', b, label: 'sub', mini: 'subh' }));
      frame('sub', 'sub', B(sub.x, sub.y, sub.w, sub.h), 'SM sub-partition', null, { muted: true, tags: [`×${H.SUB} per SM`] });
      R.push(...inner);
      sharedUnits(shared, true);
    }
    return { R, VW, VH };
  }

  function drawHW(svg, L, narrow) {
    // narrow sizes are set so that each level's own labels reach 10 px once the stepper zooms to it
    const fsF = narrow ? 12.5 : 12, fsB = 11, fsS = narrow ? 10.5 : 9.5;
    for (const r of L.R) {
      const b = r.b;
      const g = GG.svg('g', { class: `in-r in-k-${r.kind}${r.tone ? ' in-t-' + r.tone : ''}${r.muted ? ' in-muted' : ''}${r.dash ? ' in-dash' : ''}`, 'data-hid': r.hid }, svg);
      const rect = (p, bb, rx, cls) => GG.svg('rect', { x: bb.x.toFixed(1), y: bb.y.toFixed(1), width: Math.max(0, bb.w).toFixed(1), height: Math.max(0, bb.h).toFixed(1), rx, class: cls || 'in-shape' }, p);
      if (r.kind === 'frame') {
        rect(g, b, r.small ? 6 : narrow ? 9 : 11);
        const lp = r.term ? svgLink(g, r.term, r.label) : g;
        stext(lp, b.x + (r.small ? 7 : 10), b.y + (r.small ? 14 : narrow ? 17 : 19), r.label, 'in-lab', { 'font-size': r.small ? fsS + 0.5 : fsF, 'font-weight': 600 });
        if (r.tags) stext(g, b.x + b.w - 10 - (r.tagOffset || 0), b.y + (narrow ? 17 : 19), r.tags.join(' · '), 'in-tag', { 'font-size': narrow ? 11.5 : fsS, 'text-anchor': 'end' });
        continue;
      }
      const host = r.term ? svgLink(g, r.term, r.label) : g;
      if (r.kind === 'group') {
        stext(host, r.horizontal ? b.x + 2 : b.x + b.w / 2, r.horizontal ? b.y + b.h / 2 + (narrow ? 0 : 4) : b.y + 12, r.label, 'in-lab', { 'font-size': narrow ? 12.5 : 10.5, 'font-weight': 600, 'text-anchor': r.horizontal ? 'start' : 'middle', style: 'fill:var(--memory)' });
      } else if (r.kind === 'stack') {
        rect(host, b, 4);
        const n = 4;
        if (!r.dash) for (let k = 1; k <= n; k++) { const yy = b.y + (b.h * k) / (n + 1); GG.svg('line', { x1: b.x + 4, x2: b.x + b.w - 4, y1: yy, y2: yy, class: 'in-ln' }, host); }
        if (b.h > 44) stext(host, b.x + b.w / 2, b.y + b.h - 5, r.label, 'in-sub', { 'font-size': 8.5, 'text-anchor': 'middle' });
      } else if (r.kind === 'pill') {
        rect(host, b, b.h / 2, 'in-shape in-pill');
        stext(host, b.x + b.w / 2, b.y + b.h / 2 + (narrow ? 4.4 : 3.6), r.label, 'in-lab', { 'font-size': narrow ? 12.5 : fsS + 0.5, 'text-anchor': 'middle', 'font-weight': 600 });
      } else if (r.kind === 'vtext') {
        rect(host, b, 5);
        stext(host, 0, 0, r.label, 'in-lab', { 'font-size': 10, 'text-anchor': 'middle', transform: `translate(${(b.x + b.w / 2 + 3.5).toFixed(1)} ${(b.y + b.h / 2).toFixed(1)}) rotate(-90)` });
      } else if (r.kind === 'tile') {
        rect(host, b, 5);
        const small = b.w < 60 || b.h < 36;
        // on a phone each kind of tile is sized to read at 10 px when its parent level fills the view
        stext(host, b.x + 5, b.y + (small ? (narrow && r.mini === 'gpc' ? 11.5 : 10) : 12), r.label, 'in-lab', { 'font-size': narrow ? { gpc: 12, tpc: 11.5, smh: 11 }[r.mini] || 10.5 : small ? 9 : 9.5, 'font-weight': 600 });
        drawMini(host, r, b);
      } else if (r.kind === 'units') {
        rect(host, b, 5);
        if (r.inline) {
          stext(host, b.x + 7, b.y + b.h / 2 + 3.8, `${r.label} ×${r.rows[0][1]}`, 'in-lab', { 'font-size': fsB, 'font-weight': 600 });
          const lw = (r.label.length + 4) * fsB * 0.62 + 12, n = r.rows[0][1], area = b.w - lw - 8, tw = Math.min(14, (area - (n - 1) * 3) / n);
          for (let k = 0; k < n; k++) GG.svg('rect', { x: (b.x + lw + k * (tw + 3)).toFixed(1), y: (b.y + 6).toFixed(1), width: Math.max(1, tw).toFixed(1), height: (b.h - 12).toFixed(1), rx: 1.5, class: 'in-tk' }, host);
        } else {
          stext(host, b.x + 7, b.y + 13, r.label, 'in-lab', { 'font-size': fsB, 'font-weight': 600 });
          const rh = (b.h - 20) / r.rows.length, lw = narrow ? 64 : 62;
          r.rows.forEach(([name, n], k) => {
            const yy = b.y + 18 + k * rh;
            stext(host, b.x + 7, yy + rh / 2 + 3, `${name} ×${n}`, 'in-sub', { 'font-size': fsS - 0.5 });
            const area = b.w - lw - 10, gap = n > 20 ? (narrow ? 0.8 : 1.4) : narrow ? 1.5 : 2.5, tw = (area - (32 - 1) * gap) / 32;
            for (let q = 0; q < n; q++) GG.svg('rect', { x: (b.x + lw + q * (tw + gap)).toFixed(2), y: (yy + 2).toFixed(1), width: Math.max(0.6, tw).toFixed(2), height: Math.max(2, rh - 5).toFixed(1), rx: 0.8, class: 'in-tk' }, host);
          });
        }
      } else {
        rect(host, b, 5);
        const fs = narrow && r.fs ? Math.max(r.fs, 10.5) : r.fs || fsB, cx = b.x + b.w / 2;
        if (r.sub && !r.inline && b.h >= 28) {
          stext(host, cx, b.y + b.h / 2 - 1.5, r.label, 'in-lab', { 'font-size': fs, 'text-anchor': 'middle', 'font-weight': 600 });
          stext(host, cx, b.y + b.h / 2 + 10.5, r.sub, 'in-sub', { 'font-size': fsS, 'text-anchor': 'middle' });
        } else {
          const t = stext(host, cx, b.y + b.h / 2 + fs * 0.36, r.label, 'in-lab', { 'font-size': fs, 'text-anchor': 'middle', 'font-weight': r.muted ? 500 : 600 });
          if (r.sub) { const s = GG.svg('tspan', { class: 'in-sub', 'font-weight': 400, dx: 6 }, t); s.textContent = r.sub; }
        }
      }
    }
  }
  function drawMini(p, r, b) {
    const R = (x, y, w, h, off) => GG.svg('rect', { x: x.toFixed(1), y: y.toFixed(1), width: Math.max(0.5, w).toFixed(1), height: Math.max(0.5, h).toFixed(1), rx: 1, class: off ? 'in-tk off' : 'in-tk' }, p);
    if (r.mini === 'gpc') {
      const small = b.w < 60;
      const top = b.y + (small ? 14 : 17), ah = b.h - (small ? 18 : 22), aw = b.w - 10, rows = 3, cols = 3;
      const cw = aw / cols, rh = ah / rows;
      for (let q = 0; q < 9; q++) {
        const cx = b.x + 5 + (q % cols) * cw, cy = top + Math.floor(q / cols) * rh, off = r.off === q;
        R(cx + 1, cy + 1, cw / 2 - 1.8, rh - 2.5, off); R(cx + cw / 2 + 0.3, cy + 1, cw / 2 - 1.8, rh - 2.5, off);
      }
    } else if (r.mini === 'tpc') {
      const small = b.h < 44, top = b.y + (small ? 13 : 17), h = b.h - (small ? 17 : 22), w = (b.w - 14) / 2;
      R(b.x + 5, top, w, h); R(b.x + 9 + w, top, w, h);
    } else if (r.mini === 'sm' || r.mini === 'smh') {
      const hz = r.mini === 'smh';
      const a = hz ? B(b.x + 34, b.y + 5, b.w - 40, b.h - 10) : B(b.x + 6, b.y + 20, b.w - 12, b.h - 26);
      if (hz) { tiles(a, 4, 'h', 4).forEach((t) => GG.svg('rect', { x: t.x, y: t.y, width: t.w, height: t.h, rx: 2, class: 'in-mini' }, p)); }
      else {
        const [top, rest] = cut(a, 'bottom', 22, 6);
        const g4 = tiles(rest, 2, 'v', 5);
        g4.forEach((row) => tiles(row, 2, 'h', 5).forEach((t) => GG.svg('rect', { x: t.x, y: t.y, width: t.w, height: t.h, rx: 2, class: 'in-mini' }, p)));
        GG.svg('rect', { x: top.x, y: top.y, width: top.w, height: top.h, rx: 2, class: 'in-mini', style: 'stroke:var(--memory);stroke-opacity:.5' }, p);
      }
    } else if (r.mini === 'sub' || r.mini === 'subh') {
      const hz = r.mini === 'subh';
      const a = hz ? B(b.x + b.w * 0.62, b.y + 6, b.w * 0.36 - 4, b.h - 12) : B(b.x + 6, b.y + 17, b.w - 12, b.h - 23);
      tiles(a, hz ? 4 : 5, hz ? 'h' : 'v', 3).forEach((t, k) => GG.svg('rect', { x: t.x.toFixed(1), y: t.y.toFixed(1), width: t.w.toFixed(1), height: t.h.toFixed(1), rx: 1.5, class: 'in-mini', style: k === 2 ? 'stroke:var(--core);stroke-opacity:.6' : k === 1 ? 'stroke:var(--memory);stroke-opacity:.5' : '' }, p));
    }
  }

  /* The programming model laid over the hardware map: where threads run and memories live. */
  function drawSW(svg, L, narrow) {
    const g = GG.svg('g', { class: 'in-swl', hidden: true, 'aria-hidden': 'true' }, svg);
    const by = (id) => L.R.find((r) => r.id === id);
    const fs = narrow ? 12.5 : 9.5, ph = fs + 4.5, cw = fs * 0.6;
    const pill = (x, yc, text, mem, alignRight) => {
      const w = text.length * cw + 12, x0 = alignRight ? x - w : x, pg = GG.svg('g', { class: 'in-sw-pill' }, g);
      GG.svg('rect', { x: x0.toFixed(1), y: (yc - ph / 2).toFixed(1), width: w.toFixed(1), height: ph.toFixed(1), rx: ph / 2, class: 'in-sw-p' + (mem ? ' m' : '') }, pg);
      stext(pg, x0 + 6, yc + fs * 0.36, text, 'in-sw-t' + (mem ? ' m' : ''), { 'font-size': fs });
    };
    const outline = (b) => GG.svg('rect', { x: (b.x + 2).toFixed(1), y: (b.y + 2).toFixed(1), width: (b.w - 4).toFixed(1), height: (b.h - 4).toFixed(1), rx: 9, class: 'in-sw-o' }, g);
    const die = by('die'), sm = by('sm'), cores = by('cores'), rf = by('rf'), l1 = by('l1');
    if (die) { outline(die.b); pill(die.b.x + 14, die.b.y + die.b.h, 'a grid runs across all the SMs', false); }
    if (sm) { outline(sm.b); pill(sm.b.x + 14, sm.b.y + sm.b.h, 'a thread block runs on one SM', false); }
    if (cores) pill(cores.b.x + cores.b.w - 6, cores.b.y + 11, 'a thread runs on a core', false, true);
    if (rf) pill(rf.b.x + rf.b.w - 6, rf.b.y + rf.b.h / 2, 'registers', true, true);
    if (l1) { if (narrow) pill(l1.b.x + 6, l1.b.y, 'shared', true); else pill(l1.b.x + l1.b.w - 6, l1.b.y, 'shared memory', true, true); }
    const ram = by(narrow ? 'ramH' : 'ramL');
    if (ram) {
      if (narrow) pill(ram.b.x + 2, ram.b.y + ram.b.h / 2 + 12, 'global', true);
      else pill(ram.b.x + ram.b.w / 2 - (6 * cw + 12) / 2, ram.b.y + ram.b.h - 14, 'global', true);
    }
    return g;
  }
  const SW_WHY = 'With the programming model of Part 2 laid over the hardware: a <b>thread</b> runs on a core, a <b>thread block</b> on one SM, and a <b>grid</b> across all the SMs of the die. <b>Registers</b> live in the register file, <b>shared memory</b> in the L1 data cache, and <b>global memory</b> in GPU RAM.';

  function hwMap(ctx, slot) {
    const f = fig(ctx, slot, {
      title: 'An H100, nested', hint: 'step inwards, or hover any part', wide: true, controlsFirst: window.innerWidth < 600,
      caption: 'The Device Hardware chapter as one picture, redrawn in the glossary\'s colours: compute cores green, other compute units pink, scheduling amber, memory blue. At each level one member is drawn in detail and its siblings are drawn small; the stepper zooms in one level at a time. Every part that has a glossary entry is a link to it. The SM is Hopper\'s (the H100\'s); the dashed Tensor Memory box marks where Blackwell SMs add one, and other SM architectures differ in other details. Switch on <em>Software</em> to see where the threads and memories of the programming model live.',
    });
    const host = GG.el('div', { class: 'in-hw' });
    f.stage.append(host);
    // on phones, keep the explanation between the controls and the picture
    if (window.innerWidth < 600) f.root.insertBefore(f.why, f.stage);
    const TOUR = [['pkg', 'Package'], ['die', 'Die'], ['gpc', 'GPC'], ['tpc', 'TPC'], ['sm', 'SM'], ['sub', 'Sub-partition']];
    let mode = null, svg = null, tourId = 'pkg', hoverId = null, pType = 'mouse', layout = null, swLayer = null, swOn = false, vb = null, tween = 0;
    const sW = GG.ui.stat(f.readouts, { label: 'where', value: '' });
    const sP = GG.ui.stat(f.readouts, { label: 'per SM', value: '' });
    const sG = GG.ui.stat(f.readouts, { label: 'whole H100', value: '', tone: 'accent' });
    function focus(hid) {
      if (!svg || !HW[hid]) return;
      const anc = new Set();
      for (let p = HW[hid].parent; p; p = HW[p].parent) anc.add(p);
      svg.querySelectorAll('.in-r').forEach((g) => {
        const h = g.getAttribute('data-hid'), on = h === hid, inside = on || hwDesc(h, hid), a = anc.has(h);
        g.classList.toggle('in-on', on); g.classList.toggle('in-anc', a); g.classList.toggle('in-out', !inside && !a);
      });
      const chain = [];
      for (let p = hid; p; p = HW[p].parent) chain.unshift(HW[p].name);
      const info = HW[hid];
      sW.set(chain.slice(-3).join(' › '));
      sP.set(info.per || '—');
      sG.set(info.gpu || '—', 'accent');
      f.setWhy(swOn && hid === tourId && !hoverId ? SW_WHY : info.why);
    }
    /* Zoom: the view box of the stepper's current level. Wide keeps the picture's aspect ratio (no layout
       jump); narrow crops to the level, so the picture gets shorter and its labels larger. */
    function viewFor(hid) {
      const VW = layout.VW, VH = layout.VH, fr = layout.R.find((r) => r.hid === hid && r.kind === 'frame');
      if (hid === 'pkg' || !fr) return [0, 0, VW, VH];
      const p = 6, b = { x: fr.b.x - p, y: fr.b.y - p, w: fr.b.w + 2 * p, h: fr.b.h + 2 * p };
      if (mode === 'narrow') {
        const x = Math.max(0, b.x), y = Math.max(0, b.y);
        return [x, y, Math.min(VW, b.x + b.w) - x, Math.min(VH, b.y + b.h) - y];
      }
      const A = VW / VH;
      let w = Math.max(b.w, b.h * A, VW * 0.5), h = w / A;
      const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
      return [Math.max(0, Math.min(VW - w, cx - w / 2)), Math.max(0, Math.min(VH - h, cy - h / 2)), w, h];
    }
    /* On a phone the whole package is drawn about 0.83× size, so labels of the inner levels would be 7 to 9 px.
       Hide every label that would render below 10 px in the view being zoomed to: the parts stay drawn (and
       tappable), and their labels appear as the stepper zooms in to their level. */
    function legible(v) {
      if (!svg || !v) return;
      const k = mode === 'narrow' ? (svg.getBoundingClientRect().width || host.clientWidth) / v[2] : Infinity;
      svg.querySelectorAll('text').forEach((t) => {
        const tiny = (parseFloat(t.getAttribute('font-size')) || 12) * k < 9.95;
        (t.closest('.in-sw-pill') || t).classList.toggle('in-tiny', tiny);
      });
    }
    function zoomTo(hid, instant) {
      if (!svg || !layout) return;
      const to = viewFor(hid), from = vb || to;
      legible(to);
      cancelAnimationFrame(tween);
      const setVB = (v) => { vb = v; svg.setAttribute('viewBox', v.map((n) => n.toFixed(1)).join(' ')); };
      if (instant || GG.reducedMotion) { setVB(to); return; }
      const t0 = performance.now(), D = 420;
      const stepF = (t) => {
        const k = Math.min(1, (t - t0) / D), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        setVB(from.map((a, i) => a + (to[i] - a) * e));
        if (k < 1) tween = requestAnimationFrame(stepF);
      };
      tween = requestAnimationFrame(stepF);
    }
    const tour = GG.ui.stepper(f.controls, { label: 'Zoom in', autoplay: 2600, steps: TOUR.map(([, l]) => ({ label: l })), onStep: (i) => { tourId = TOUR[i][0]; hoverId = null; zoomTo(tourId); focus(tourId); } });
    GG.ui.toggle(f.controls, { label: 'Software', value: false, onChange: (v) => { swOn = v; if (swLayer) swLayer.toggleAttribute('hidden', !v); hoverId = null; focus(tourId); if (v) f.setWhy(SW_WHY); } });
    function build() {
      const w = host.clientWidth || (f.stage.clientWidth - 24) || 700;
      const m = w < 600 ? 'narrow' : 'wide';
      if (m === mode && svg) return;
      mode = m;
      const L = hwLayout(m);
      layout = L; vb = null;
      host.innerHTML = '';
      svg = GG.svg('svg', { viewBox: `0 0 ${L.VW} ${L.VH}`, class: 'in-svg in-hw-svg', role: 'group', 'aria-label': 'Nested map of an H100 GPU: GPU RAM beside the die; the die holds 8 GPCs; a GPC holds 9 TPCs; a TPC holds 2 SMs; an SM holds 4 sub-partitions with warp schedulers, register files, CUDA Cores, Tensor Cores, load/store units and SFUs, plus a shared L1 data cache and TMA.' }, host);
      drawHW(svg, L, m === 'narrow');
      swLayer = drawSW(svg, L, m === 'narrow');
      swLayer.toggleAttribute('hidden', !swOn);
      zoomTo(tourId, true);
      svg.addEventListener('pointerover', (e) => { const g = e.target.closest('[data-hid]'); if (g) { hoverId = g.getAttribute('data-hid'); focus(hoverId); } });
      svg.addEventListener('pointerleave', () => { if (pType === 'mouse') { hoverId = null; focus(tourId); } });
      svg.addEventListener('pointerdown', (e) => { pType = e.pointerType || 'mouse'; });
      svg.addEventListener('focusin', (e) => { const g = e.target.closest('[data-hid]'); if (g) { hoverId = g.getAttribute('data-hid'); focus(hoverId); } });
      svg.addEventListener('focusout', () => { hoverId = null; focus(tourId); });
      svg.addEventListener('click', (e) => {
        const g = e.target.closest('[data-hid]');
        if (!g) return;
        const hid = g.getAttribute('data-hid');
        // on touch, the first tap on a part explains it; a second tap follows the link
        if (pType !== 'mouse' && e.target.closest('a') && svg.getAttribute('data-armed') !== hid) { e.preventDefault(); svg.setAttribute('data-armed', hid); hoverId = hid; focus(hid); }
      });
      focus(hoverId || tourId);
    }
    build();
    GG.resize(host, () => { build(); legible(vb); });
    void tour;
  }

  GG.entry('device-hardware', {
    render(body, ctx) {
      const s = ctx.html(body, `
        ${plateTop('device-hardware', `<p>That one sentence is the whole introduction to this part in the original: these entries are the <strong>physical components of the GPU</strong>, which NVIDIA calls the “device”.</p><p>In NVIDIA's lingo a GPU program runs on two processors at once. The <strong>host</strong> is the CPU, with its own memory, which prepares data and launches work. The <strong>device</strong> is the GPU, with its own RAM, which does the heavy lifting. The documentation, the APIs and even the keywords of CUDA C++ keep the two apart: host code and device code, host memory and device memory.</p><p>This part is about the device itself: the silicon, and the memory beside it.</p>`)}
        <div data-slot="nums"></div>
        <div class="in-prose">
          <p>The workhorse of the chip is the ${tl('streaming-multiprocessor', 'Streaming Multiprocessor')} (SM): a GPU is mostly many identical SMs, which is the “unified” in ${tl('cuda-device-architecture', 'Compute Unified Device Architecture')}. Pairs of SMs form a ${tl('texture-processing-cluster', 'Texture Processing Cluster')} (TPC), and TPCs group into a ${tl('graphics-processing-cluster', 'Graphics/GPU Processing Cluster')} (GPC).</p>
          <p>Inside each SM, ${tl('warp-scheduler', 'warp schedulers')} choose which group of 32 threads runs on each cycle and hand its instruction to the ${tl('core', 'cores')}: ${tl('cuda-core', 'CUDA Cores')} for scalar arithmetic and ${tl('tensor-core', 'Tensor Cores')} for whole matrices, helped by ${tl('special-function-unit', 'Special Function Units')} for operations like <code>exp</code> and ${tl('load-store-unit', 'Load/Store Units')} for memory traffic. Bits wait between operations in the ${tl('register-file', 'register file')} and the ${tl('l1-data-cache', 'L1 data cache')}. Recent SMs add a ${tl('tensor-memory-accelerator', 'Tensor Memory Accelerator')} (Hopper) and ${tl('tensor-memory', 'Tensor Memory')} (Blackwell). Beneath all of them sits ${tl('gpu-ram', 'GPU RAM')}, and the whole design is versioned by its ${tl('streaming-multiprocessor-architecture', 'SM architecture')}.</p>
          <p>The software of ${tl('device-software', 'Part 2')} maps onto these parts: a thread runs on a core, a thread block on one SM, and a grid across all of them; registers live in the register file, shared memory in the L1 data cache, and global memory in GPU RAM. Fig. 1 shows every entry of this part in place.</p>
        </div>
        <div data-slot="map"></div>
        ${GG.noteHTML('beyond', `<p>Why are ${H.SMS - H.SM_ON} SMs switched off? Large chips are made with spare units, so that a die with a few defects can still be sold with the damaged units disabled. The disabled units differ from chip to chip, so the red, disabled SMs in Fig. 1 are placed arbitrarily. The glossary's own figures, redrawn throughout this part, show a single H100 SM in the same colours.</p>`)}
      `);
      const nums = ctx.numbers(s.nums, [
        { value: String(H.SM_ON), label: `SMs enabled on an H100 SXM5, of ${H.SMS} on the full die` },
        { value: String(H.SUB), label: 'warp schedulers per SM, one per sub-partition', tone: 'control' },
        { value: String(H.FP32 * H.SUB), label: 'FP32 CUDA Cores per SM, plus 4 Tensor Cores', tone: 'core' },
        { value: fi(H.RF_REGS * H.SUB), label: '32-bit registers per SM (256 KiB)', tone: 'memory' },
        { value: `${H.L1_KIB} KiB`, label: 'L1 data cache per SM', tone: 'memory' },
        { value: '80 GiB', label: 'GPU RAM, read at 3.35 TB/s', tone: 'memory' },
      ]);
      s.nums.replaceWith(nums);
      try { hwMap(ctx, s.map); } catch (e) { console.error('[intro] hw map', e); }
    },
  });

  /* ═════════════════════════ Device Software ═════════════════════════ */
  function glyph(kind) {
    const g = (inner) => `<svg viewBox="0 0 38 24" class="in-ds-g" aria-hidden="true">${inner}</svg>`;
    const sq = (x, y, w, h, cls) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5" class="${cls || 'in-gf'}"/>`;
    const wave = (x) => `<path d="M${x} 3c-2 3 2 4 0 7s2 4 0 7 2 3 0 5" class="in-gl"/>`;
    switch (kind) {
      case 'grid': return g([0, 1, 2].map((c) => [0, 1].map((r) => sq(2 + c * 12, 2 + r * 11, 10, 9)).join('')).join(''));
      case 'cluster': return g(`<rect x="1" y="3" width="36" height="18" rx="3" fill="none" stroke="var(--ink-3)" stroke-dasharray="3 2"/>${sq(5, 6, 13, 12)}${sq(21, 6, 13, 12)}`);
      case 'block': return g(`${sq(6, 1, 26, 22)}${[0, 1, 2].map((k) => `<line x1="10" x2="28" y1="${7 + k * 5}" y2="${7 + k * 5}" class="in-gl"/>`).join('')}`);
      case 'wg': return g([0, 1, 2, 3].map((k) => `<line x1="5" x2="33" y1="${4 + k * 5.3}" y2="${4 + k * 5.3}" class="in-gl" stroke-width="2"/>`).join(''));
      case 'warp': return g(Array.from({ length: 8 }, (_, k) => `<circle cx="${4 + k * 4.3}" cy="12" r="1.7" class="in-gc"/>`).join(''));
      case 'thread': return g(wave(19));
      case 'gmem': return g(`<ellipse cx="19" cy="5" rx="15" ry="3.5" class="in-gm"/><path d="M4 5v14c0 2 7 3.5 15 3.5s15-1.5 15-3.5V5" class="in-gm"/>`);
      case 'smem': return g(`<ellipse cx="19" cy="8" rx="9" ry="2.6" class="in-gm"/><path d="M10 8v9c0 1.6 4 2.6 9 2.6s9-1 9-2.6V8" class="in-gm"/>`);
      case 'reg': return g(`${sq(13, 7, 5, 10, 'in-gm')}${sq(20, 7, 5, 10, 'in-gm')}`);
      default: return '';
    }
  }
  const DS_ROWS = () => [
    { id: 'grid', glyph: 'grid', term: 'thread-block-grid', name: 'Thread block grid', alias: `<em>one per ${chip('kernel', 'kernel', 'in-plain')} launch</em>`, size: '1, 2 or 3-D grid of blocks', pair: 'gmem',
      cpp: '<code>kernel&lt;&lt;&lt;grid, block&gt;&gt;&gt;(…)</code>, <code>gridDim</code>', ptx: '<code>.entry</code> (a kernel), <code>%nctaid</code>', sass: 'one kernel function in the binary', hw: `every ${chip('streaming-multiprocessor', 'SM', 'in-plain')}: the whole GPU`,
      why: 'Launching a <b>kernel</b> creates one <b>thread block grid</b>, the top of the thread hierarchy. Its blocks run in any order across all the SMs of the GPU, and its matching memory is global memory.', stat: ['many blocks', 'global memory', 'whole GPU'] },
    { id: 'cluster', dim: true, glyph: 'cluster', name: 'Thread block cluster', alias: '<em>compute capability 9.0 and later</em>', size: 'not a glossary entry',
      cpp: '<code>__cluster_dims__</code>', ptx: '<code>%clusterid</code>', sass: '—', hw: `one ${chip('graphics-processing-cluster', 'GPC', 'in-plain')}`,
      why: 'Since compute capability 9.0 (H100), blocks can be grouped into <b>clusters</b> that are scheduled onto one GPC and share distributed shared memory. The glossary mentions this level only in its GPC entry.', stat: ['a few blocks', 'distributed shared memory', 'one GPC'] },
    { id: 'block', glyph: 'block', term: 'thread-block', name: 'Thread block', alias: `<em>a ${chip('cooperative-thread-array', 'cooperative thread array', 'in-plain')} (CTA) in PTX and SASS</em>`, size: 'up to 1,024 threads', pair: 'smem',
      cpp: '<code>blockIdx</code>, <code>blockDim</code>, <code>__syncthreads()</code>', ptx: '<code>%ctaid</code>, <code>%ntid</code>, <code>bar.sync</code>', sass: '<code>S2UR UR4, SR_CTAID.X</code>, <code>BAR.SYNC</code>', hw: `one ${chip('streaming-multiprocessor', 'SM', 'in-plain')}`,
      why: 'A <b>thread block</b>, called a cooperative thread array (CTA) in PTX and SASS, runs on a single SM. Its threads can wait for each other at barriers and share the block\'s shared memory. Blocks must execute independently, in any order; outside a thread block cluster (compute capability 9.0 and later), threads in different blocks cannot wait for one another at a barrier.', stat: ['≤ 1,024 threads', 'shared memory', 'one SM'] },
    { id: 'wg', glyph: 'wg', term: 'warpgroup', name: 'Warpgroup', alias: '<em>Hopper and later</em>', size: '4 warps = 128 threads',
      cpp: 'no built-in; reached through PTX, e.g. via CUTLASS', ptx: '<code>wgmma.mma_async</code>', sass: '<code>HGMMA</code>', hw: `the SM's four sub-partitions, each with a ${chip('warp-scheduler', 'warp scheduler', 'in-plain')} and ${chip('tensor-core', 'Tensor Core', 'in-plain')}`,
      why: 'A <b>warpgroup</b> is four contiguous warps whose first warp-rank is a multiple of 4: 128 threads that issue Hopper\'s warpgroup-level matrix multiplies together.', stat: ['128 threads', '—', '4 sub-partitions'] },
    { id: 'warp', glyph: 'warp', term: 'warp', name: 'Warp', alias: '<em>an implementation detail, not part of the model</em>', size: '32 threads',
      cpp: '<code>warpSize</code> (32)', ptx: '<code>%warpid</code>, <code>%laneid</code>', sass: 'every instruction is issued to a whole warp', hw: `a ${chip('warp-scheduler', 'warp scheduler', 'in-plain')} issues it`,
      why: 'A <b>warp</b> is 32 threads that are issued the same instruction together. Warps are not part of the programming model\'s hierarchy; they are how NVIDIA GPUs implement it, and they matter enormously for performance.', stat: ['32 threads', '—', 'warp scheduler'] },
    { id: 'thread', glyph: 'thread', term: 'thread', name: 'Thread', alias: '<em>the atom of the hierarchy</em>', size: '1 thread', pair: 'reg',
      cpp: '<code>threadIdx</code>', ptx: '<code>%tid</code>', sass: '<code>S2R R0, SR_TID.X</code>', hw: `a ${chip('core', 'core', 'in-plain')}, e.g. a ${chip('cuda-core', 'CUDA Core', 'in-plain')}`,
      why: 'A <b>thread</b> has its own registers and not much else. Each one runs the kernel\'s instructions for its own index, and a single core executes one thread\'s instruction.', stat: ['1 thread', 'registers', 'a core'] },
  ];
  const MEM_ROWS = () => [
    { id: 'gmem', glyph: 'gmem', term: 'global-memory', name: 'Global memory', alias: '<em>seen by every thread of the grid</em>', size: 'gigabytes', pair: 'grid',
      cpp: 'pointer arguments, e.g. <code>float* A</code>', ptx: '<code>.global</code>, <code>ld.global</code>', sass: '<code>LDG</code> / <code>STG</code>', hw: chip('gpu-ram', 'GPU RAM', 'in-plain'),
      why: '<b>Global memory</b> is visible to every thread of the grid and lasts as long as the program. It lives in GPU RAM; kernels receive pointers to it from the host. (The <code>__global__</code> keyword means something else, a choice made, as early CUDA architect Nicholas Wilt put it in his <em>CUDA Handbook</em>, “for maximum developer confusion”.)', stat: ['80 GiB on H100', 'grid', 'GPU RAM'] },
    { id: 'smem', glyph: 'smem', term: 'shared-memory', name: 'Shared memory', alias: '<em>one per thread block</em>', size: 'kilobytes', pair: 'block',
      cpp: '<code>__shared__</code>', ptx: '<code>.shared</code>, <code>ld.shared</code>', sass: '<code>LDS</code> / <code>STS</code>', hw: chip('l1-data-cache', 'L1 data cache', 'in-plain'),
      why: '<b>Shared memory</b> belongs to one thread block and is stored in its SM\'s L1 data cache: much smaller than global memory, and much faster.', stat: ['≤ 228 KB per SM', 'thread block', 'L1 data cache'] },
    { id: 'reg', glyph: 'reg', term: 'registers', name: 'Registers', alias: '<em>private to one thread</em>', size: '32-bit words', pair: 'thread',
      cpp: 'local variables; the compiler assigns them', ptx: '<code>.reg</code>: virtual and unlimited', sass: '<code>R0</code>, <code>R1</code>, … : physical', hw: chip('register-file', 'register file', 'in-plain'),
      why: '<b>Registers</b> are private to a thread. PTX has as many virtual registers as it likes; <code>ptxas</code> maps them onto the SM\'s physical register file, and any that do not fit spill to global memory, at a price.', stat: ['65,536 per SM', 'thread', 'register file'] },
  ];
  /* The thread hierarchy as nested groups, for the levels the model map does not draw:
     grid ⊃ cluster ⊃ block ⊃ warpgroup ⊃ warp ⊃ thread. One example block of 8 warps
     (the glossary's own 8-warp warpgroup example), zoomed out of the grid. */
  const NEST_PAIR = { gmem: 'grid', smem: 'block', reg: 'thread' };
  function dsNest(box, hooks) {
    let lit = null, pairLit = null, svg = null, kind = '';
    const els = {};
    function build() {
      // a hidden tab panel measures 0 wide: keep the drawing until the panel is shown again
      if (!box.clientWidth && svg) return;
      const k = (box.clientWidth || 960) < 600 ? 'n' : 'w';
      if (k === kind && svg) return;
      kind = k;
      if (svg) svg.remove();
      Object.keys(els).forEach((id) => delete els[id]);
      const N = k === 'n';
      const VW = N ? 380 : 960, VH = N ? 414 : 330;
      svg = GG.svg('svg', { viewBox: `0 0 ${VW} ${VH}`, class: 'in-nest', role: 'img',
        'aria-label': 'The thread hierarchy as nested groups: a thread block grid of blocks, two of them grouped into a thread block cluster that runs on one GPC; one block zoomed in, holding 8 warps of 32 threads in two warpgroups of four warps; one strand is one thread.' }, box);
      const g = (id) => { const e = GG.svg('g', { 'data-lv': id, class: 'in-nest-lv' }, svg); (els[id] = els[id] || []).push(e); return e; };
      const rect = (p, x, y, w, h, cls, rx) => GG.svg('rect', { x, y, width: w, height: h, rx: rx == null ? 7 : rx, class: cls }, p);
      const T = (p, x, y, s, cls, end) => stext(p, x, y, s, cls, end ? { 'text-anchor': end === 'm' ? 'middle' : 'end' } : null);
      const nB = N ? 4 : 8, zoomed = nB - 1;
      // grid
      const G = N ? B(6, 6, 368, 400) : B(8, 8, 944, 314);
      const gg = g('grid');
      rect(gg, G.x, G.y, G.w, G.h, 'in-nest-box', 12);
      T(gg, G.x + 12, G.y + 18, 'Thread block grid', 'in-nest-t');
      T(gg, G.x + G.w - 12, G.y + 18, N ? '→ whole GPU' : '→ every SM: the whole GPU', 'in-nest-hw', 'e');
      // the grid's blocks, each with 8 warp ticks
      const mb = N ? { x: 18, y: 36, w: 74, h: 36, gap: 14 } : { x: 24, y: 44, w: 100, h: 40, gap: 14 };
      const minis = [];
      for (let i = 0; i < nB; i++) {
        const x = mb.x + i * (mb.w + mb.gap);
        const m = g(i < 2 ? 'cluster-b' : (i === zoomed ? 'block-mini' : 'grid-b'));
        rect(m, x, mb.y, mb.w, mb.h, 'in-nest-mini', 5);
        const tw = (mb.w - 16) / 8;
        for (let j = 0; j < 8; j++) rect(m, x + 8 + j * tw + tw * 0.25, mb.y + 8, tw * 0.5, mb.h - 16, 'in-nest-tick', 1);
        minis.push(B(x, mb.y, mb.w, mb.h));
      }
      // cluster: blocks 0 and 1, scheduled together onto one GPC
      const cg = g('cluster');
      rect(cg, mb.x - 6, mb.y - 6, 2 * mb.w + mb.gap + 12, mb.h + 12, 'in-nest-cl', 8);
      T(cg, mb.x - 6, mb.y + mb.h + 22, N ? 'cluster' : 'Thread block cluster', 'in-nest-t in-nest-ts');
      T(cg, mb.x - 6 + (N ? 50 : 140), mb.y + mb.h + 22, N ? '→ one GPC' : '→ one GPC · CC 9.0+', 'in-nest-hw');
      // the zoomed block
      const E = N ? B(12, 118, 356, 280) : B(24, 128, 912, 184);
      const zm = minis[zoomed];
      GG.svg('path', { d: `M${zm.x} ${zm.y + zm.h} L${E.x} ${E.y} L${E.x + E.w} ${E.y} L${zm.x + zm.w} ${zm.y + zm.h} Z`, class: 'in-nest-zoom' }, svg);
      const bg = g('block');
      rect(bg, E.x, E.y, E.w, E.h, 'in-nest-box', 10);
      T(bg, E.x + 12, E.y + 19, N ? 'Thread block · 8 warps = 256 threads' : 'Thread block (CTA), zoomed in · 8 warps = 256 threads', 'in-nest-t');
      T(bg, E.x + E.w - 12, E.y + 19, '→ one SM', 'in-nest-hw', 'e');
      // two warpgroups of four warps
      const W = N ? [B(22, 146, 336, 100), B(22, 254, 336, 100)] : [B(38, 158, 434, 118), B(488, 158, 434, 118)];
      const wgg = g('wg'), wpg = g('warp'), thg = g('thread');
      W.forEach((wb, gi) => {
        rect(wgg, wb.x, wb.y, wb.w, wb.h, 'in-nest-wg', 8);
        T(wgg, wb.x + 10, wb.y + 16, `warpgroup ${gi} · warps ${gi * 4}–${gi * 4 + 3}`, 'in-nest-t in-nest-ts');
        T(wgg, wb.x + wb.w - 10, wb.y + 16, '→ 4 sub-partitions', 'in-nest-hw', 'e');
        const gap = N ? 8 : 10, bw = (wb.w - 20 - 3 * gap) / 4, by = wb.y + 26, bh = N ? 48 : 62;
        for (let w = 0; w < 4; w++) {
          const bx = wb.x + 10 + w * (bw + gap), wi = gi * 4 + w;
          rect(wpg, bx, by, bw, bh, 'in-nest-warp', 5);
          T(wpg, bx + bw / 2, by + bh + 15, `warp ${wi}`, 'in-nest-wl', 'm');
          const pitch = (bw - 10) / 31;
          let d = '';
          for (let l = 0; l < 32; l++) { if (wi === 0 && l === 0) continue; const x = (bx + 5 + l * pitch).toFixed(1); d += `M${x} ${by + 6}v${bh - 12}`; }
          GG.svg('path', { d, class: 'in-nest-str' }, wpg);
          if (wi === 0) GG.svg('path', { d: `M${(bx + 5).toFixed(1)} ${by + 4}v${bh - 8}`, class: 'in-nest-one' }, thg);
        }
      });
      // what the two smallest levels run on
      const fy = N ? 372 : 300;
      const fw = g('warp-hw'), ft = g('thread-hw');
      T(fw, E.x + 12, fy, 'a bundle = a warp → a warp scheduler issues it', 'in-nest-hw in-nest-foot');
      T(ft, N ? E.x + 12 : E.x + 470, N ? fy + 17 : fy, 'a strand = a thread → runs on a core', 'in-nest-hw in-nest-foot');
      paint();
    }
    const GROUP = { grid: ['grid', 'grid-b', 'cluster-b', 'block-mini'], cluster: ['cluster', 'cluster-b'], block: ['block', 'block-mini'], wg: ['wg'], warp: ['warp', 'warp-hw'], thread: ['thread', 'thread-hw'] };
    function paint() {
      if (!svg) return;
      svg.querySelectorAll('.in-nest-lv').forEach((e) => e.classList.remove('on', 'pair'));
      (GROUP[lit] || []).forEach((k) => (els[k] || []).forEach((e) => e.classList.add('on')));
      (GROUP[pairLit] || []).forEach((k) => (els[k] || []).forEach((e) => e.classList.add('pair')));
      svg.classList.toggle('in-nest-has', !!(lit || pairLit));
    }
    const LV_ROW = { grid: 'grid', 'grid-b': 'grid', cluster: 'cluster', 'cluster-b': 'cluster', block: 'block', 'block-mini': 'block', wg: 'wg', warp: 'warp', 'warp-hw': 'warp', thread: 'thread', 'thread-hw': 'thread' };
    const rowAt = (e) => { const t = e.target.closest && e.target.closest('[data-lv]'); return t ? LV_ROW[t.getAttribute('data-lv')] : null; };
    box.addEventListener('pointerover', (e) => { const r = rowAt(e); if (r && hooks.hover) hooks.hover(r); });
    box.addEventListener('pointerleave', () => hooks.hover && hooks.hover(null));
    box.addEventListener('click', (e) => { const r = rowAt(e); if (r && hooks.pick) hooks.pick(r); });
    build();
    GG.resize(box, build);
    return {
      light(id) {
        if (NEST_PAIR[id]) { lit = null; pairLit = NEST_PAIR[id]; } else { lit = GROUP[id] ? id : null; pairLit = null; }
        paint();
      },
    };
  }
  /* One figure, three views of the same model in tabs (the drawing on the hardware, the nesting, and the
     table of representations). A level picked in any view stays picked in the others. */
  function dsMap(ctx, slot) {
    const f = fig(ctx, slot, {
      title: 'Threads, memories, and three ways to write them', hint: 'pick a view · hover a row', wide: true, class: 'in-dsfig',
      caption: 'Three views of the CUDA programming model, chosen with the tabs; a level picked in one view stays picked in the others. <em>Hardware</em> redraws the glossary\'s figure of the CUDA programming model on the hardware: threads, blocks and grids, their memories, and the parts they run on and live in. <em>Nesting</em> fills in the levels between: a grid of blocks, two of them grouped into a thread block cluster (compute capability 9.0 and later), and one example block zoomed in, holding 8 warps of 32 threads in two warpgroups of four. In the <em>Table</em>, rows are the levels of the model\'s two hierarchies, threads above and memories below; each thread level is paired with the memory its threads share. Columns show how each level appears in CUDA C++ source, in PTX, in SASS, and on the hardware. nvcc compiles CUDA C++ to PTX; ptxas, or the driver just in time, compiles PTX to SASS.',
    });
    const narrow = window.innerWidth < 760, touch = isTouch();
    const dsRows = DS_ROWS(), memRows = MEM_ROWS();
    const COLS = ['cpp', 'ptx', 'sass', 'hw'];
    const row = (r) => `<div class="in-ds-row${r.dim ? ' in-dimrow' : ''}" data-row="${r.id}" tabindex="0">
      <div class="in-ds-lv">${glyph(r.glyph)}<div><b>${r.term ? chip(r.term, esc(r.name), 'in-plain') : esc(r.name)}</b>${r.alias}<small>${r.size}</small></div></div>
      ${COLS.map((c) => `<div class="in-ds-c" data-c="${c}">${r[c]}</div>`).join('')}</div>`;
    const head = `<div class="in-ds-row in-ds-head">
      <div class="in-ds-lv"><div><b>${chip('cuda-programming-model', 'CUDA programming model', 'in-plain')}</b><small>the abstraction</small></div></div>
      <div class="in-ds-c" data-c="cpp">${chip('cuda-c', 'CUDA C++', 'in-plain')}<small>what you write · ${chip('nvcc', 'nvcc', 'in-plain')} compiles it</small></div>
      <div class="in-ds-c" data-c="ptx">${chip('parallel-thread-execution', 'PTX', 'in-plain')}<small>virtual ISA · versioned by ${chip('compute-capability', 'compute capability', 'in-plain')}</small></div>
      <div class="in-ds-c" data-c="sass">${chip('streaming-assembler', 'SASS', 'in-plain')}<small>assembly · versioned by ${chip('streaming-multiprocessor-architecture', 'SM architecture', 'in-plain')}</small></div>
      <div class="in-ds-c" data-c="hw">Hardware<small>where it runs or lives</small></div></div>`;
    // the table is built (and wired) up front, so hovering it can drive the drawings whichever tab is open
    const tableBox = GG.el('div');
    tableBox.innerHTML = `<div class="${narrow ? 'scroll-x' : ''}" data-ds-wrap><div class="in-ds" data-col="${narrow ? 'cpp' : 'all'}">
      ${head}
      <div class="in-ds-grp">${chip('thread-hierarchy', 'Thread hierarchy', 'in-plain')}<small>groups of threads, from the whole grid down to one</small></div>
      ${dsRows.map(row).join('')}
      <div class="in-ds-grp">${chip('memory-hierarchy', 'Memory hierarchy', 'in-plain')}<small>the memory each level of threads shares</small></div>
      ${memRows.map(row).join('')}
    </div></div>
    <div class="in-ds-alt"><b>A second model.</b> The ${chip('cuda-tile-programming-model', 'CUDA Tile programming model', 'in-plain')} replaces this grid of SIMT threads with <em>tile-kernels</em> running over a grid of <em>tile blocks</em>, each a single thread of execution that works on whole arrays through structured pointers. Its intermediate representation is Tile IR rather than PTX.</div>`;
    const grid = tableBox.querySelector('.in-ds'), wrap = tableBox.querySelector('[data-ds-wrap]');
    const rows = {};
    [...dsRows, ...memRows].forEach((r) => { rows[r.id] = r; });
    const sA = GG.ui.stat(f.readouts, { label: 'size', value: '—' });
    const sB = GG.ui.stat(f.readouts, { label: 'pairs with', value: '—', tone: 'memory' });
    const sC = GG.ui.stat(f.readouts, { label: 'on hardware', value: '—', tone: 'core' });
    const HINT = {
      map: touch ? 'Tap a part of the drawing to pick its level of the model.' : 'Hover a part of the drawing, or click it to pick its level of the model.',
      nest: touch ? 'Tap a level of the nesting to pick it.' : 'Hover a level of the nesting, or click it to pick it.',
      table: touch || narrow
        ? 'Pick a column to read one representation; tap a row to see its level of the model, the memory it pairs with, and where both live on the hardware.'
        : 'Read across a row to see one level of the model written three ways and placed on the hardware; read down a column to see a whole representation. Hover a row: its paired level of the other hierarchy lights up. Click a row to keep it lit in the other two views.',
    };
    const MAPKEYS = { grid: ['grid', 'global'], block: ['block', 'shared'], thread: ['thread', 'registers'], gmem: ['global', 'grid'], smem: ['shared', 'block'], reg: ['registers', 'thread'] };
    const NEST_WHY = {
      cluster: ' The <em>Hardware</em> view has no level for it; in <em>Nesting</em>, the dashed outline groups two neighbouring blocks into a cluster, scheduled onto one GPC.',
      wg: ' The <em>Hardware</em> view has no level for it; in <em>Nesting</em>, each bracket of four warps is a warpgroup: warps 0–3 and 4–7 of this 8-warp block, the glossary\'s own example.',
      warp: ' The <em>Hardware</em> view has no level for it; in <em>Nesting</em>, each bundle of 32 strands is a warp, and this block holds 8 of them, 256 threads.',
      thread: ' In <em>Nesting</em>, the one bright strand is a single thread: lane 0 of warp 0.',
    };
    const ROW_OF = { thread: 'thread', core: 'thread', registers: 'reg', regfile: 'reg', block: 'block', sm: 'block', shared: 'smem', l1: 'smem', grid: 'grid', gpu: 'grid', global: 'gmem', ram: 'gmem' };
    let map = null, nest = null, sel = 'block', tab = 'map', colSeg = null;
    function setCol(c) {
      grid.setAttribute('data-col', c);
      const small = window.innerWidth < 760;
      wrap.classList.toggle('scroll-x', small && c === 'all');
    }
    function on(id) {
      grid.querySelectorAll('.in-ds-row[data-row]').forEach((el) => { const rid = el.getAttribute('data-row'); el.classList.toggle('on', rid === id); el.classList.toggle('pair', !!(id && rows[id].pair === rid)); });
      if (!id) { sA.set('—'); sB.set('—'); sC.set('—'); f.setWhy(HINT[tab]); return; }
      const r = rows[id];
      sA.set(r.stat[0]); sB.set(r.stat[1]); sC.set(r.stat[2]);
      if (map) map.highlight(MAPKEYS[id] || null);
      if (nest) nest.light(id);
      f.setWhy(r.why + (NEST_WHY[id] || ''));
    }
    const showSel = () => { on(sel); f.setWhy(rows[sel].why + (tab === 'map' ? '' : NEST_WHY[sel] || '') + ' ' + HINT[tab]); };
    const tabs = GG.ui.tabs(f.stage, {
      value: 'table',
      tabs: [
        { id: 'map', label: 'Hardware', render: (p) => {
          try {
            const mapBox = GG.el('div', { class: 'in-ds-map' });
            p.append(mapBox);
            if (GG.components.modelMap) {
              map = GG.components.modelMap(mapBox, { caption: false, compact: true });
              map.on('hover', (e) => on(e && ROW_OF[e.key] ? ROW_OF[e.key] : sel));
              map.on('select', (e) => { sel = e && e.key && ROW_OF[e.key] ? ROW_OF[e.key] : 'block'; on(sel); });
            } else mapBox.remove();
          } catch (e) { console.error('[intro] ds model map', e); map = null; }
        } },
        { id: 'nest', label: 'Nesting', render: (p) => {
          try {
            const nestBox = GG.el('div', { class: 'in-ds-nest' });
            p.append(nestBox);
            nest = dsNest(nestBox, { hover: (r) => on(r || sel), pick: (r) => { sel = r; on(sel); } });
          } catch (e) { console.error('[intro] ds nest', e); nest = null; }
        } },
        { id: 'table', label: 'Table', render: (p) => p.append(tableBox) },
      ],
      onChange: (id) => { tab = id; if (colSeg) colSeg.el.hidden = id !== 'table'; showSel(); },
    });
    // the table is put in the page at once (its rows and links are content, found by search); the drawings
    // render when their tab is first shown, at the width they will be drawn at
    tabs.show('map');
    colSeg = GG.ui.seg(f.controls, { label: 'Column', value: narrow ? 'cpp' : 'all', onChange: setCol, options: [{ value: 'all', label: 'All' }, { value: 'cpp', label: 'CUDA C++' }, { value: 'ptx', label: 'PTX' }, { value: 'sass', label: 'SASS' }, { value: 'hw', label: 'Hardware' }] });
    colSeg.el.hidden = tab !== 'table';
    grid.addEventListener('mouseover', (e) => { const el = e.target.closest('.in-ds-row[data-row]'); if (el) on(el.getAttribute('data-row')); });
    grid.addEventListener('focusin', (e) => { const el = e.target.closest('.in-ds-row[data-row]'); if (el) on(el.getAttribute('data-row')); });
    grid.addEventListener('click', (e) => { const el = e.target.closest('.in-ds-row[data-row]'); if (el && !e.target.closest('a')) { sel = el.getAttribute('data-row'); on(sel); } });
    grid.addEventListener('mouseleave', () => on(sel));
    showSel();
  }

  GG.entry('device-software', {
    render(body, ctx) {
      const s = ctx.html(body, `
        ${plateTop('device-software', `<p>That sentence is the original introduction to this part in full: these terms and technologies are used for <strong>software that runs on the GPU</strong>.</p><p>“Device”, once more, is NVIDIA's word for the GPU, as “host” is for the CPU. A CUDA program is split between them: host code runs on the CPU and launches kernels, and the kernels, the device code, run on the GPU in thousands of threads at once.</p><p>This part is about the device side: what a GPU program is made of, how its threads are organized, and the forms it is written down in.</p>`)}
        <div data-slot="nums"></div>
        <div class="in-prose">
          <p>At its heart is the ${tl('cuda-programming-model', 'CUDA programming model')}, which gives programmers three abstractions: a ${tl('thread-hierarchy', 'hierarchy of thread groups')}, a ${tl('memory-hierarchy', 'hierarchy of memories')}, and barrier synchronization. A ${tl('kernel', 'kernel')} launch creates a ${tl('thread-block-grid', 'thread block grid')} of ${tl('thread-block', 'thread blocks')}, which PTX and SASS call ${tl('cooperative-thread-array', 'cooperative thread arrays')}. Blocks are made of ${tl('warp', 'warps')} of 32 ${tl('thread', 'threads')}, and Hopper groups warps by four into ${tl('warpgroup', 'warpgroups')}. Each level of threads has matching memory: ${tl('registers', 'registers')} for a thread, ${tl('shared-memory', 'shared memory')} for a block, ${tl('global-memory', 'global memory')} for the whole grid.</p>
          <p>Programs in this model are written down at two lower levels. ${tl('parallel-thread-execution', 'Parallel Thread eXecution')} (PTX) is a virtual instruction set, versioned by ${tl('compute-capability', 'compute capability')}, that newer GPUs can still run by compiling it just in time. ${tl('streaming-assembler', 'Streaming ASSembler')} (SASS) is the real assembly of one SM architecture. The part closes with a newer alternative, the ${tl('cuda-tile-programming-model', 'CUDA Tile programming model')}, which programs whole tiles instead of individual threads. Fig. 1 lays all of it out on one grid.</p>
        </div>
        <div data-slot="map"></div>
        ${GG.noteHTML('beyond', '<p>The host/device split reaches right into the source code. In CUDA C++, functions are marked <code>__host__</code> (runs on the CPU), <code>__device__</code> (runs on the GPU, called from GPU code) or <code>__global__</code> (a kernel: launched from the host, run on the device). The thread block cluster row and outline in Fig. 1 are also extra context: the glossary mentions clusters only in its GPC entry and otherwise leaves them out.</p>')}
      `);
      s.nums.replaceWith(ctx.numbers(s.nums, [
        { value: '32', label: 'threads in a warp' },
        { value: '128', label: 'threads in a warpgroup (4 warps)' },
        { value: '1,024', label: 'threads at most in a thread block' },
        { value: '64', label: 'warps (2,048 threads) resident at once on an H100 SM' },
        { value: '32', label: 'thread blocks resident at once on an H100 SM' },
      ]));
      try { dsMap(ctx, s.map); } catch (e) { console.error('[intro] ds map', e); }
    },
  });

  /* ═════════════════════════ Host Software ═════════════════════════ */
  const HS_NODES = {
    cudac: { term: 'cuda-c', label: 'CUDA C++', sub: 'C++ with kernels, launches and shared memory' },
    basic: { term: 'cutile-basic', label: 'cuTile BASIC', sub: 'the CUDA Tile model in BASIC; an April Fools\' release' },
    cute: { term: 'cute', label: 'CuTe', sub: 'Layout and Tensor types for C++' },
    cutedsl: { term: 'cute-dsl', label: 'CuTe DSL', sub: 'the same ideas in Python, JIT-compiled' },
    nvcc: { term: 'nvcc', label: 'nvcc', sub: 'compiler driver: C++ to a fat binary' },
    nvrtc: { term: 'nvrtc', label: 'nvrtc', sub: 'C++ to PTX inside a running program' },
    fatbin: { label: 'fat binary', sub: 'host code plus PTX and/or SASS', muted: true },
    binutils: { term: 'cuda-binary-utilities', label: 'CUDA Binary Utilities', sub: 'cuobjdump and nvdisasm look inside binaries' },
    apps: { label: 'Your application', sub: 'e.g. PyTorch, or your own program', muted: true },
    cublas: { term: 'cublas', label: 'cuBLAS', sub: 'linear algebra' },
    cudnn: { term: 'cudnn', label: 'cuDNN', sub: 'neural-net primitives' },
    rt: { term: 'cuda-runtime-api', label: 'CUDA Runtime API', sub: 'the usual entry point', file: ['libcudart', 'libcudart.so'] },
    graph: { term: 'cuda-graph', label: 'CUDA Graphs', sub: 'capture launches, replay at once' },
    drv: { term: 'cuda-driver-api', label: 'CUDA Driver API', sub: 'userspace part of the driver', file: ['libcuda', 'libcuda.so'] },
    kmd: { term: 'nvidia-gpu-drivers', label: 'NVIDIA GPU Drivers', sub: 'the only part that talks to the GPU', file: ['nvidia-ko', 'nvidia.ko'] },
    nsys: { term: 'nsight-systems', label: 'Nsight Systems', sub: 'timeline profiler with a GUI' },
    cupti: { term: 'cupti', label: 'CUPTI', sub: 'profiling APIs; lines up CPU and GPU timestamps' },
    smi: { term: 'nvidia-smi', label: 'nvidia-smi', sub: 'the familiar status table' },
    nvml: { term: 'nvml', label: 'NVML', sub: 'monitoring and management library', file: ['libnvml', 'libnvml.so'] },
  };
  const HS_PATHS = [
    { v: 'lib', label: 'Library call', nodes: ['apps', 'cublas', 'rt', 'drv', 'kmd', 'gpu'], why: 'A framework like PyTorch calls <b>cuBLAS</b> for a matrix multiplication. cuBLAS picks one of its kernels and launches it through the <b>Runtime API</b>, which wraps the <b>Driver API</b>, which hands the work to the <b>GPU drivers</b>, the only component that talks to the GPU directly.' },
    { v: 'launch', label: 'Kernel launch', nodes: ['apps', 'rt', 'drv', 'kmd', 'gpu'], why: 'A kernel you wrote yourself, launched from CUDA C++ with <code>&lt;&lt;&lt;…&gt;&gt;&gt;</code>, takes the same road down: Runtime API, Driver API, drivers, GPU. Each launch costs the host on the order of microseconds.' },
    { v: 'direct', label: 'Driver API direct', nodes: ['apps', 'drv', 'kmd', 'gpu'], why: 'A program can skip the Runtime API and call the <b>Driver API</b> in <code>libcuda.so</code> itself (<code>cuInit</code>, <code>cuModuleLoad</code>, <code>cuLaunchKernel</code>). It is more work, since the program then manages contexts and modules that the Runtime API would handle for it, in exchange for finer control. As the glossary notes, very few CUDA programs are written this way. The work still ends at the <b>GPU drivers</b>.' },
    { v: 'graph', label: 'CUDA Graph', nodes: ['apps', 'rt', 'graph', 'drv', 'kmd', 'gpu'], why: 'Stream capture in the <b>Runtime API</b> (<code>cudaStreamBeginCapture</code> … <code>cudaStreamEndCapture</code>) records a sequence of kernel launches as a <b>CUDA Graph</b> instead of running them. After <code>cudaGraphInstantiate</code>, a single <code>cudaGraphLaunch</code> submits the whole graph to the device at once, which cuts the per-launch overhead that dominates low-latency work like LLM inference.' },
    { v: 'aot', label: 'nvcc build', nodes: ['cudac', 'nvcc', 'fatbin', 'binutils'], why: '<b>nvcc</b> compiles CUDA C++, handing CPU code to the host compiler (like <code>gcc</code>), into a fat binary that carries PTX and/or SASS for the GPU. The <b>CUDA Binary Utilities</b> look inside it. The binary is then your application.' },
    { v: 'jit', label: 'nvrtc JIT', nodes: ['cudac', 'nvrtc', 'drv', 'kmd', 'gpu'], why: '<b>nvrtc</b> compiles CUDA C++ source to PTX inside a running program, with no separate nvcc process. The program loads that PTX through the <b>Driver API</b> (<code>cuModuleLoadDataEx</code> in <code>libcuda.so</code>), and this user-space part of the drivers JIT-compiles it into SASS for the GPU at hand: the same step that keeps PTX forward-compatible. The kernel module, <code>nvidia.ko</code>, then only has to submit the work.' },
    { v: 'smi', label: 'nvidia-smi', nodes: ['smi', 'nvml', 'kmd', 'gpu'], why: '<b>nvidia-smi</b> is a command-line front end to <b>NVML</b>, which reports state like power draw, temperature and memory use by way of the drivers. Programs can call NVML directly, e.g. through pynvml in Python.' },
    { v: 'prof', label: 'Profiler', nodes: ['nsys', 'cupti'], watch: ['rt', 'drv', 'gpu'], why: '<b>Nsight Systems</b> builds its timelines on <b>CUPTI</b>, whose APIs record CUDA calls and GPU activity (dashed) and line up the CPU\'s and GPU\'s timestamps.' },
  ];
  function hsMap(ctx, slot) {
    const f = fig(ctx, slot, {
      title: 'The CUDA software platform', hint: 'pick a path', wide: true, controlsFirst: window.innerWidth < 860,
      caption: 'The Host Software chapter as one map. The “Run” column is the CUDA Toolkit stack from the glossary\'s diagram (adapted from Professional CUDA C Programming): each layer usually calls the one below it, though an application can call any layer directly, and only the drivers talk to the GPU. CUDA Graphs and the line between user space and kernel space are added here. Beside the stack are the tools that build programs and the tools that watch them. File-shaped tags are the shared libraries and kernel module you will find on a Linux system. On the Kernel launch and CUDA Graph traces, three thin arrows stand for many kernel launches and a single arrow for one submission.',
    });
    // on phones the map is long: keep the explanation next to the Trace buttons
    if (window.innerWidth < 860) f.root.insertBefore(f.why, f.stage);
    const node = (id) => {
      const n = HS_NODES[id];
      return `<div class="in-hs-n${n.muted ? ' in-muted' : ''}" data-n="${id}">${n.term ? chip(n.term, esc(n.label)) : `<b>${esc(n.label)}</b>`}<small>${n.sub}</small>${n.file ? `<span class="in-file">${chip(n.file[0], esc(n.file[1]))}</span>` : ''}</div>`;
    };
    f.stage.innerHTML = `<div class="in-hs">
      <div class="in-hs-host">
        <div class="in-hs-cap"><span>CPU · the host</span>${chip('cuda-software-platform', 'The CUDA software platform')}</div>
        <div class="in-hs-cols">
          <section class="in-hs-col"><div class="in-hs-h">Build: write and compile</div>
            <div class="in-hs-pair">${node('cudac')}${node('basic')}</div>
            <div class="in-hs-grp">${chip('cutlass', 'CUTLASS')}<small>templates and DSLs for fast matrix multiplies</small><div class="in-hs-pair">${node('cute')}${node('cutedsl')}</div></div>
            <div class="in-hs-pair">${node('nvcc')}${node('nvrtc')}</div>
            ${node('fatbin')}${node('binutils')}
          </section>
          <section class="in-hs-col"><div class="in-hs-h">Run: the CUDA Toolkit stack</div>
            ${node('apps')}
            <div class="in-hs-grp"><span class="in-hs-gl">CUDA libraries</span><div class="in-hs-pair">${node('cublas')}${node('cudnn')}</div></div>
            <div class="in-hs-pair in-hs-rt">${node('rt')}${node('graph')}</div>
            ${node('drv')}
            <div class="in-hs-space"><span>user space ↑</span><span>↓ kernel space</span></div>
            ${node('kmd')}
          </section>
          <section class="in-hs-col"><div class="in-hs-h">Observe: profile and monitor</div>
            ${node('nsys')}${node('cupti')}${node('smi')}${node('nvml')}
          </section>
        </div>
      </div>
      <div class="in-hs-gpu" data-n="gpu"><span>GPU · the device</span>${chip('device-hardware', 'Device Hardware')}</div>
    </div>`;
    const root = f.stage.querySelector('.in-hs');
    const ov = overlay(root);
    const els = {};
    root.querySelectorAll('[data-n]').forEach((el) => { els[el.getAttribute('data-n')] = el; });
    // everything a connector must not cross: the cards, and the labels of groups and columns
    const obstacles = [...root.querySelectorAll('[data-n], .in-hs-grp > a.in-chip, .in-hs-grp > small, .in-hs-gl, .in-hs-col > .in-hs-h, .in-hs-cap > *, .in-hs-space > span')];
    /* What a graph saves, drawn on the links themselves: on the Kernel launch trace every kernel is its own
       launch down the stack (three arrows); on the CUDA Graph trace the Runtime API's launches are captured
       into the graph (three arrows in) and the whole graph goes down as one cudaGraphLaunch (one arrow out). */
    const down = (a, b, xs) => (b.t - a.b >= 10 && xs.every((x) => x > Math.max(a.l, b.l) + 4 && x < Math.min(a.r, b.r) - 4)
      ? xs.map((x) => ({ pts: [[x, a.b + 1], [x, b.t - 3]], r: 0, cls: xs.length > 1 ? 'in-thin' : '' })) : null);
    const across = (a, b, n) => {
      const t = Math.max(a.t, b.t), bt = Math.min(a.b, b.b), yc = (t + bt) / 2;
      if (b.l - a.r < 10 || bt - t < 30) return null;
      return [-1, 0, 1].slice(0, n).map((d) => ({ pts: [[a.r + 1, yc + d * 8], [b.l - 3, yc + d * 8]], r: 0, cls: 'in-thin' }));
    };
    const midGap = (a, b) => (a.b + b.t) / 2;
    const custom = (k, a, b) => {
      if (!cur) return null;
      const pair = cur.nodes[k - 1] + '>' + cur.nodes[k];
      if (cur.v === 'launch' && pair === 'rt>drv') {
        const own = down(a, b, [a.x - 12, a.x, a.x + 12]);
        return own && own.concat([{ text: [a.x + 24, midGap(a, b), 'one launch per kernel'] }]);
      }
      if (cur.v === 'graph' && pair === 'rt>graph') return across(a, b, 3);
      if (cur.v === 'graph' && pair === 'graph>drv') {
        const own = down(a, b, [a.x]);
        return own && own.concat([{ text: [a.x - 9, midGap(a, b), 'one cudaGraphLaunch', 'end'] }]);
      }
      return null;
    };
    const drawCur = (animate) => { if (cur) drawPath(ov, root, cur.nodes.map((id) => els[id]), obstacles, animate, null, custom); };
    const sH = GG.ui.stat(f.readouts, { label: 'steps', value: '' });
    const sF = GG.ui.stat(f.readouts, { label: 'files on the way', value: '' });
    sF.el.classList.add('in-stat-wrap');
    let cur = null, timers = [];
    function show(v, animate) {
      const p = HS_PATHS.find((x) => x.v === v);
      cur = p;
      timers.forEach(clearTimeout); timers = [];
      root.querySelectorAll('.in-lit, .in-watch').forEach((el) => el.classList.remove('in-lit', 'in-watch'));
      root.querySelectorAll('.in-step').forEach((el) => el.remove());
      root.classList.add('in-pathing');
      const anim = animate && !GG.reducedMotion;
      p.nodes.forEach((id, k) => {
        const el = els[id];
        if (!el) return;
        const lit = () => { el.classList.add('in-lit'); el.insertAdjacentHTML('beforeend', `<i class="in-step">${k + 1}</i>`); };
        if (anim) timers.push(setTimeout(lit, k * 160)); else lit();
      });
      (p.watch || []).forEach((id) => els[id] && els[id].classList.add('in-watch'));
      drawCur(anim);
      const files = p.nodes.map((id) => HS_NODES[id] && HS_NODES[id].file && HS_NODES[id].file[1]).filter(Boolean);
      // one step per numbered box, so the readout matches the badges
      sH.set(p.nodes.length);
      sF.set(files.length ? files.join(' · ') : 'none');
      f.setWhy(p.why);
      // on a phone, bring the start of the path on screen if it is out of sight
      if (animate && window.innerWidth < 860 && els[p.nodes[0]]) {
        const r = els[p.nodes[0]].getBoundingClientRect(), top = 70;
        if (r.top > innerHeight - 80 || r.bottom < top) scrollBy({ top: r.top - Math.max(top, innerHeight * 0.3), behavior: GG.reducedMotion ? 'auto' : 'smooth' });
      }
    }
    GG.ui.seg(f.controls, { label: 'Trace', value: 'lib', options: HS_PATHS.map((p) => ({ value: p.v, label: p.label })), onChange: (v) => show(v, true) });
    requestAnimationFrame(() => show('lib', false));
    GG.resize(root, () => drawCur(false));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => drawCur(false));
  }

  GG.entry('host-software', {
    render(body, ctx) {
      const s = ctx.html(body, `
        ${plateTop('host-software', `<p>That sentence is the original introduction to this part in full: these terms and technologies are used <strong>on the CPU when running GPU programs</strong>.</p><p>“Host” is NVIDIA's word for the CPU and its memory, as “device” is for the GPU and its RAM. The device does the heavy lifting, but the host sets it up: host software compiles the kernels, allocates and copies memory, launches the work and watches it run.</p><p>This part is about that software, from compilers and drivers to profilers and libraries.</p>`)}
        <div class="in-prose">
          <p>The ${tl('cuda-software-platform', 'CUDA software platform')} divides roughly in two. Some of it helps you <em>build</em> programs: the ${tl('cuda-c', 'CUDA C++')} language; ${tl('nvcc', 'nvcc')}, the compiler driver that turns it into a fat binary; ${tl('nvrtc', 'nvrtc')}, for compiling while a program runs; and the ${tl('cuda-binary-utilities', 'CUDA Binary Utilities')}, for looking inside the result. The rest is used <em>within</em> or <em>from</em> running programs: the ${tl('cuda-runtime-api', 'CUDA Runtime API')} (${tl('libcudart', 'libcudart.so')}), which wraps the ${tl('cuda-driver-api', 'CUDA Driver API')} (${tl('libcuda', 'libcuda.so')}), which talks to the ${tl('nvidia-gpu-drivers', 'NVIDIA GPU drivers')} and their kernel module, ${tl('nvidia-ko', 'nvidia.ko')}; ${tl('cuda-graph', 'CUDA Graphs')}, for launching many kernels at once; ${tl('nvml', 'NVML')} (${tl('libnvml', 'libnvml.so')}) and ${tl('nvidia-smi', 'nvidia-smi')}, for monitoring; and ${tl('cupti', 'CUPTI')} and ${tl('nsight-systems', 'Nsight Systems')}, for profiling.</p>
          <p>On top sit libraries of ready-made kernels, ${tl('cublas', 'cuBLAS')} and ${tl('cudnn', 'cuDNN')}, and toolkits for writing your own: ${tl('cutlass', 'CUTLASS')}, its core library ${tl('cute', 'CuTe')}, the Python ${tl('cute-dsl', 'CuTe DSL')}, and ${tl('cutile-basic', 'cuTile BASIC')}, a real if tongue-in-cheek implementation of the tile model. Fig. 1 puts every one of them on a single map and traces a few common journeys through it.</p>
        </div>
        <div data-slot="map"></div>
        ${GG.noteHTML('intuition', '<p>Read the middle column like a chain of translators. Your code asks for an operation (“multiply these matrices”); a library turns it into kernel launches; the Runtime API turns those into calls on the lower-level Driver API; and the driver turns them into work the GPU executes. You can skip a layer by calling the one below it directly, as the rare programs written against the Driver API do, trading convenience for control.</p>')}
      `);
      try { hsMap(ctx, s.map); } catch (e) { console.error('[intro] hs map', e); }
    },
  });

  /* ═════════════════════════ Performance ═════════════════════════ */
  const FMTS = [
    { id: 'fp32', name: 'FP32', p: 24, emin: -126, max: 3.4028234663852886e38, inf: true },
    { id: 'bf16', name: 'BF16', p: 8, emin: -126, max: 3.3895313892515355e38, inf: true },
    { id: 'fp16', name: 'FP16', p: 11, emin: -14, max: 65504, inf: true },
    { id: 'e4m3', name: 'FP8 E4M3', p: 4, emin: -6, max: 448, inf: false },
  ];
  function roundTo(x, F) {
    if (F.id === 'fp32') return Math.fround(x);
    if (x === 0 || !isFinite(x)) return x;
    const s = Math.sign(x), a = Math.abs(x);
    let e = Math.floor(Math.log2(a));
    if (Math.pow(2, e) > a) e--; else if (Math.pow(2, e + 1) <= a) e++;
    if (e < F.emin) e = F.emin;
    const q = Math.pow(2, e - (F.p - 1)), m = a / q, fl = Math.floor(m), d = m - fl;
    const r = d > 0.5 || (d === 0.5 && fl % 2 === 1) ? fl + 1 : fl;
    const v = r * q;
    if (v > F.max) return F.inf ? s * Infinity : NaN;
    return s * v;
  }
  function numS(v) {
    if (Number.isNaN(v)) return 'out of range';
    if (!isFinite(v)) return '∞';
    if (v === 0) return '0';
    const a = Math.abs(v);
    if (a >= 1e6 || a < 1e-3) return v.toExponential(4).replace('e+', 'e');
    return String(+v.toPrecision(8));
  }
  function bitsFig(ctx, slot) {
    const SLOTS = 24;
    const f = fig(ctx, slot, {
      title: 'Correct, to how many bits?', hint: 'drag x and the demand',
      caption: 'Each row squares x in a different number format, as if every value were stored in that format: x is rounded to the format, multiplied, and the product rounded again. Each bar has one square per significant bit, on a common scale of 24 for every format; the copper line marks how many bits you demand. Whether a result counts as “correct” depends on that demand, and on staying inside the format\'s range.',
    });
    const bitsW = (n) => `${n} ${n === 1 ? 'bit' : 'bits'}`;
    f.stage.innerHTML = `<div class="in-bits"><div class="in-bits-head"><span>x = <b data-k="x"></b></span><span>exact x² = <b data-k="ex"></b></span><span class="in-bits-dem">demand: <b data-k="tol"></b></span></div>${FMTS.map((F) => `<div class="in-bits-row" data-f="${F.id}"><span class="in-bits-name">${F.name}</span><span class="in-bits-val"></span><span class="in-bits-bar">${'<i></i>'.repeat(SLOTS)}<b class="in-bits-tol" aria-hidden="true"></b></span><span class="in-bits-n"></span><span class="in-bits-v"></span></div>`).join('')}
      <div class="in-legend in-bits-leg"><span><i class="in-bk a"></i>stored bit that agrees</span><span><i class="in-bk bad"></i>stored bit that is off</span><span><i class="in-bk luck"></i>agrees by luck, beyond what the format stores</span><span><i class="in-bk void"></i>not stored</span></div></div>`;
    const wrapEl = f.stage.querySelector('.in-bits');
    let x = Math.PI, tol = 8;
    const sPass = GG.ui.stat(f.readouts, { label: 'formats passing', value: '' });
    const sTol = GG.ui.stat(f.readouts, { label: 'required', value: '' });
    const set = (k, v) => { f.stage.querySelector(`[data-k="${k}"]`).textContent = v; };
    function update() {
      const ex = x * x;
      set('x', numS(x)); set('ex', numS(ex)); set('tol', bitsW(tol));
      wrapEl.style.setProperty('--t', String(tol));
      const res = FMTS.map((F) => {
        const xf = roundTo(x, F), y = roundTo(xf * xf, F);
        let bits, status = 'ok';
        if (Number.isNaN(y) || !isFinite(y)) { bits = 0; status = 'over'; }
        else if (y === 0) { bits = 0; status = 'under'; }
        else { const rel = Math.abs(y - ex) / ex; bits = rel === 0 ? Infinity : Math.max(0, Math.floor(-Math.log2(rel))); }
        const sub = status === 'ok' && Math.abs(y) < Math.pow(2, F.emin);
        return { F, y, bits, status, sub, pass: status === 'ok' && bits >= tol };
      });
      res.forEach((r) => {
        const row = f.stage.querySelector(`[data-f="${r.F.id}"]`);
        row.querySelector('.in-bits-val').textContent = numS(r.y);
        row.querySelectorAll('.in-bits-bar i').forEach((el, k) => {
          el.className = k >= r.F.p ? (r.status === 'ok' && k < r.bits ? 'luck' : 'void') : r.status !== 'ok' ? 'bad' : k < r.bits ? 'a' : 'bad';
        });
        const n = row.querySelector('.in-bits-n');
        if (r.status === 'over') n.textContent = 'overflow';
        else if (r.status === 'under') n.textContent = 'underflow';
        else if (r.bits === Infinity) n.innerHTML = 'exact';
        else n.innerHTML = `≈ ${bitsW(r.bits)}${r.bits > r.F.p ? `<small>stores ${r.F.p}</small>` : r.sub ? '<small>subnormal</small>' : ''}`;
        const v = row.querySelector('.in-bits-v');
        v.textContent = r.pass ? 'pass' : 'fail';
        v.className = 'in-bits-v ' + (r.pass ? 'ok' : 'no');
      });
      const passing = res.filter((r) => r.pass).length;
      sPass.set(`${passing} / ${FMTS.length}`, passing === FMTS.length ? 'core' : passing ? 'control' : 'danger');
      sTol.set(bitsW(tol));
      const over = res.filter((r) => r.status === 'over'), under = res.filter((r) => r.status === 'under'), ok = res.filter((r) => r.status === 'ok');
      const subs = res.filter((r) => r.sub);
      const subNote = subs.length ? ` x² is below the smallest normal number of ${subs.map((r) => `${r.F.name} (${numS(Math.pow(2, r.F.emin))})`).join(' and ')}, so ${subs.length > 1 ? 'those formats store' : 'that format stores'} it as a subnormal, with fewer significant bits left.` : '';
      const verdict = ` With ${[8, 11, 18].includes(tol) ? 'an' : 'a'} ${tol}-bit demand, ${passing} of ${FMTS.length} formats ${passing === 1 ? 'counts' : 'count'} as correct.`;
      let why;
      if (over.length) why = `At x = ${numS(x)}, x² = ${numS(ex)} is too large for ${over.map((r) => `${r.F.name} (largest value ${GG.fmt.int(r.F.max)})`).join(' and ')}. ${over.map((r) => r.F.inf ? `${r.F.name} overflows to infinity` : `${r.F.name} has no infinity, so the result is out of range`).join('; ')}. For ${over.length > 1 ? 'those formats' : 'that format'}, this input is not “well-behaved”.${verdict}`;
      else if (under.length) why = `At x = ${numS(x)}, x² = ${numS(ex)} is too small for ${under.map((r) => r.F.name).join(' and ')}, which ${under.length > 1 ? 'round' : 'rounds'} it to zero. Tiny inputs are outside the well-behaved range too.${subNote}${verdict}`;
      else if (ok.every((r) => r.bits === Infinity)) why = `Squaring ${numS(x)} is exact in all four formats: both x and x² fit in even FP8's 4 significant bits. Every format passes any demand.`;
      else {
        const worst = ok.slice().sort((a, b) => a.bits - b.bits)[0];
        const luck = ok.filter((r) => r.pass && r.bits !== Infinity && tol > r.F.p);
        why = `Squaring ${numS(x)} agrees with the exact answer ${ok.map((r) => `${r.bits === Infinity ? 'exactly' : 'to ' + bitsW(r.bits)} in ${r.F.name}`).join(', ')}.${subNote}${verdict}${worst && !worst.pass ? ` ${worst.F.name} gives ${numS(worst.y)}.` : ''}${luck.map((r) => ` ${r.F.name} stores only ${r.F.p} significant bits, so it cannot promise ${tol}; this result happens to agree to ${r.bits}.`).join('')}`;
      }
      f.setWhy(why);
    }
    GG.ui.slider(f.controls, { label: 'x', min: 0.001, max: 1000, log: true, value: Math.PI, format: numS, onInput: (v) => { x = v; update(); } });
    GG.ui.slider(f.controls, { label: 'demand this many bits', min: 1, max: SLOTS, step: 1, value: tol, format: bitsW, onInput: (v) => { tol = v; update(); } });
    update();
  }

  const RUNGS = [
    { q: 'What limits the work: compute, memory, or overhead?', ncu: 'GPU Speed Of Light Throughput', ids: ['performance-bottleneck', 'compute-bound', 'memory-bound', 'overhead'] },
    { q: 'Where does the kernel sit under the roofs?', ncu: 'GPU Speed Of Light Roofline Chart', ids: ['roofline-model', 'arithmetic-intensity', 'arithmetic-bandwidth', 'memory-bandwidth', 'peak-rate'] },
    { q: 'Are the SMs, and their pipes, busy?', ncu: 'Launch Statistics · Compute Workload Analysis', ids: ['streaming-multiprocessor-utilization', 'pipe-utilization'] },
    { q: 'Can each SM hide its latency?', ncu: 'Occupancy · Scheduler Statistics', ids: ['active-cycle', 'warp-execution-state', 'issue-efficiency', 'latency-hiding', 'littles-law', 'occupancy'] },
    { q: 'What wastes cycles or bandwidth?', ncu: 'Warp State Statistics · Memory Workload Analysis · Source Counters', ids: ['register-pressure', 'scoreboard-stall', 'warp-divergence', 'branch-efficiency', 'memory-coalescing', 'bank-conflict'] },
  ];
  const TONE = {
    'compute-bound': 'core', 'memory-bound': 'memory', overhead: 'host', 'arithmetic-bandwidth': 'core', 'memory-bandwidth': 'memory', 'peak-rate': 'core',
    'streaming-multiprocessor-utilization': 'core', 'pipe-utilization': 'core', 'latency-hiding': 'control', 'littles-law': 'control', occupancy: 'control', 'active-cycle': 'control',
    'warp-execution-state': 'control', 'issue-efficiency': 'control', 'scoreboard-stall': 'danger', 'warp-divergence': 'danger', 'branch-efficiency': 'control', 'memory-coalescing': 'memory',
    'bank-conflict': 'danger', 'register-pressure': 'danger',
  };
  const SYMPTOMS = [
    { v: 'overview', label: 'Overview' },
    { v: 'idle', label: 'GPU waits for work', path: ['performance-bottleneck', 'overhead'],
      why: () => `If the GPU sits idle between kernels, it is waiting on the host: the bottleneck is <b>overhead</b>. CUDA API calls add on the order of 10 μs per kernel launch, and frameworks spend more time deciding what to launch. The usual fix is to batch launches into a ${tl('cuda-graph', 'CUDA Graph')}.` },
    { v: 'mem', label: 'Memory-bound', path: ['performance-bottleneck', 'memory-bound', 'roofline-model', 'arithmetic-intensity', 'memory-bandwidth', 'memory-coalescing', 'bank-conflict'],
      why: () => 'A <b>memory-bound</b> kernel sits left of the ridge point on the roofline: its arithmetic intensity is too low to keep the cores busy, so memory bandwidth sets its speed. Check how close it gets to that roof. Uncoalesced loads from global memory and bank conflicts in shared memory are the usual ways to waste it; raising arithmetic intensity moves the kernel to the right.' },
    { v: 'comp', label: 'Compute-bound', path: ['performance-bottleneck', 'compute-bound', 'roofline-model', 'arithmetic-bandwidth', 'peak-rate', 'streaming-multiprocessor-utilization', 'pipe-utilization', 'warp-divergence', 'branch-efficiency'],
      why: () => 'A <b>compute-bound</b> kernel sits right of the ridge point, capped by arithmetic bandwidth: the peak rate of its CUDA Cores or Tensor Cores. If it still falls short, ask in turn: are all the SMs busy (SM utilization)? Are their pipes busy (pipe utilization)? Are warps wasting lanes on divergent branches (branch efficiency)?' },
    { v: 'stall', label: 'Warps keep stalling', path: ['active-cycle', 'warp-execution-state', 'issue-efficiency', 'latency-hiding', 'littles-law', 'occupancy', 'register-pressure', 'scoreboard-stall'],
      why: () => 'On each active cycle a warp scheduler can issue only if some warp is eligible; issue efficiency counts how often that happens. Stalled warps are fine when enough others can cover the wait (Little\'s Law: concurrency = latency × throughput), occupancy caps how many warps there are, and register pressure caps occupancy. Scoreboard stalls say what the warps are waiting on: long ones for global memory, short ones for shared memory or SFUs.' },
  ];
  function ladderFig(ctx, slot) {
    const f = fig(ctx, slot, {
      title: 'A diagnostic ladder', hint: 'pick a symptom', wide: true,
      caption: 'Every term in the Performance chapter, arranged as five questions asked from the top down, from the whole program to a single instruction. Dot colours follow the glossary\'s coding: green for compute, blue for memory, amber for scheduling, red for wasted work, lavender for the host, grey for general concepts. The grey labels name NSight Compute report sections where each question is usually answered. The paths are a rough guide, not a recipe.',
    });
    f.stage.innerHTML = `<div class="in-ladder">${RUNGS.map((r, k) => `<div class="in-rung" data-r="${k + 1}"><div class="in-rung-q"><b>${k + 1}</b><span>${r.q}</span><small>NSight Compute: ${r.ncu}</small></div><div class="in-rung-chips">${r.ids.map((id) => chip(id).replace('<a ', `<a data-tone="${TONE[id] || ''}" `)).join('')}</div></div>`).join('')}</div>
      <div class="in-legend" style="margin-top:12px"><span><i style="background:var(--core)"></i>compute</span><span><i style="background:var(--memory)"></i>memory</span><span><i style="background:var(--control)"></i>scheduling</span><span><i style="background:var(--danger)"></i>wasted work</span><span><i style="background:var(--host)"></i>host</span><span><i style="background:var(--ink-2)"></i>general concept</span></div>`;
    const root = f.stage.querySelector('.in-ladder');
    const ov = overlay(root);
    const chipEl = (id) => root.querySelector(`a[data-in-term="${id}"], a[data-term="${id}"]`);
    const obstacles = [...root.querySelectorAll('a.in-chip, .in-rung-q')];
    /* A connector between every consecutive pair of numbered chips: neighbours in one row get a short arrow
       across the gap between them; any other pair gets an elbow routed around the chips, the questions and
       the number badges, so that no arrowhead lands on a badge. */
    function connect(els, animate) {
      const W = root.clientWidth, H = root.clientHeight;
      const boxes = obstacles.map((el) => ov.box(el));
      const badges = els.filter(Boolean).map((el) => { const b = ov.box(el); return { l: b.r - 13, r: b.r + 9, t: b.t - 11, b: b.t + 10 }; });
      const list = [];
      for (let k = 1; k < els.length; k++) {
        const e1 = els[k - 1], e2 = els[k];
        if (!e1 || !e2) continue;
        const a = ov.box(e1), b = ov.box(e2);
        if (Math.abs(a.y - b.y) < 4 && b.l - a.r > 0 && b.l - a.r < 40) { list.push({ pts: [[a.r + 1, a.y], [b.l - 2, b.y]], r: 0, cls: 'in-thin', delay: (k - 1) * 0.16 }); continue; }
        const others = boxes.filter((o, n) => obstacles[n] !== e1 && obstacles[n] !== e2).concat(badges);
        // 6 px of clearance, so a line never reads as an underline or outline of a chip it passes
        const pts = orthoRoute(a, b, others, W, H, { pad: 6 }) || orthoRoute(a, b, others, W, H);
        if (pts && pts.length > 1) list.push({ pts, delay: (k - 1) * 0.16 });
      }
      ov.paths(list, animate);
    }
    const sS = GG.ui.stat(f.readouts, { label: 'terms on path', value: '—' });
    const sR = GG.ui.stat(f.readouts, { label: 'rungs', value: '—' });
    let cur = 'mem';
    const touch = isTouch();
    const baseWhy = `Five questions, asked from the top down. The chips on each rung are the terms that help answer it; pick a symptom to see a path down the ladder, or ${touch ? 'tap' : 'hover'} a term for its place.`;
    function show(v, animate) {
      cur = v;
      root.querySelectorAll('a.in-chip').forEach((a) => { a.classList.remove('in-lit'); a.removeAttribute('data-step'); });
      const sym = SYMPTOMS.find((s) => s.v === v);
      const labS = sS.el.querySelector('i');
      if (!sym || !sym.path) { root.classList.remove('in-pathing'); ov.clear(); labS.textContent = 'terms'; sS.set(RUNGS.reduce((n, r) => n + r.ids.length, 0)); sR.set(RUNGS.length); f.setWhy(baseWhy); return; }
      labS.textContent = 'terms on path';
      root.classList.add('in-pathing');
      const els = sym.path.map(chipEl);
      els.forEach((a, k) => { if (a) { a.classList.add('in-lit'); a.setAttribute('data-step', String(k + 1)); } });
      connect(els, animate && !GG.reducedMotion);
      const rungs = new Set(sym.path.map((id) => RUNGS.findIndex((r) => r.ids.includes(id)) + 1));
      sS.set(sym.path.length); sR.set([...rungs].sort((a, b) => a - b).join(', '));
      f.setWhy(sym.why());
    }
    const seg = GG.ui.seg(f.controls, { label: 'Symptom', value: cur, options: SYMPTOMS.map((s) => ({ value: s.v, label: s.label })), onChange: (v) => show(v, true) });
    function place(a, fromTap) {
      const id = a.getAttribute('data-term') || a.getAttribute('data-in-term');
      const k = RUNGS.findIndex((r) => r.ids.includes(id));
      if (k < 0) return;
      const on = SYMPTOMS.filter((s) => s.path && s.path.includes(id)).map((s) => `“${s.label}”`);
      f.setWhy(`<b>${esc(GG.name(id))}</b> sits on rung ${k + 1}: ${RUNGS[k].q.charAt(0).toLowerCase() + RUNGS[k].q.slice(1)}${on.length ? ` It appears on the path for ${on.join(' and ')}.` : ' It is on none of the symptom paths here.'}${fromTap ? ` ${tl(id, 'Open ' + esc(shortName(id)) + ' →')}` : ''}`);
    }
    root.addEventListener('mouseover', (e) => { if (touch) return; const a = e.target.closest('a.in-chip'); if (a) place(a); });
    root.addEventListener('focusin', (e) => { const a = e.target.closest('a.in-chip'); if (a) place(a); });
    root.addEventListener('mouseleave', () => { if (!touch) show(cur, false); });
    armTaps(root, 'a.in-chip', (a) => place(a, true));
    GG.resize(root, () => { if (cur !== 'overview') show(cur, false); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (cur !== 'overview') show(cur, false); });
    show(cur, false);
    void seg;
  }

  GG.entry('perf', {
    render(body, ctx) {
      const s = ctx.html(body, `
        ${plateTop('perf', `<p>That sentence opens the longest of the glossary's four chapter introductions. GPUs are used when an application's performance on general-purpose hardware is inadequate, and that single fact makes programming them quite different from most other forms of programming.</p><p>The rest of the introduction explains why, by comparing two kinds of failure.</p>`)}
        <div class="in-vs">
          <div><h3>A traditional application</h3><p>Think of a database management system or a web server. <strong>Correctness is the primary concern.</strong> If the application loses data or returns incorrect results, it has failed.</p><p>Performance is often ignored.</p></div>
          <div class="in-gpu-side"><h3>A GPU program</h3><p><strong>Correctness is typically poorly defined.</strong> “Correct” outputs are defined only up to some number of significant bits, or only for some underdetermined subset of “well-behaved” inputs. And correctness is at best necessary, not sufficient.</p><p>If its programmers cannot achieve superior performance, the application has failed, whether that performance is measured</p><div class="in-per"><span>per second</span><span>per dollar</span><span>per Watt</span></div></div>
        </div>
        ${GG.noteHTML('quote', '<p>Programming GPUs is too hard and too limited, and running them too expensive, for anything else to be the case.</p>')}
        <p class="in-prose">At NVIDIA, this fact (a GPU program that is not fast enough has failed) is captured in a pithy slogan:</p>
        <div class="in-slogan"><q>Performance is the product.</q><span>how NVIDIA sums it up</span></div>
        <p class="in-prose">Fig. 1 makes “correct up to some number of significant bits” concrete. It squares a number in four formats that GPUs use. At x = π the FP32 result is right to 23 significant bits and the FP8 result to only 3, and some inputs fall outside a format's range altogether.</p>
        <div data-slot="bits"></div>
        ${GG.noteHTML('beyond', '<p>The formats in Fig. 1: <strong>FP32</strong> keeps 24 significant bits. <strong>BF16</strong> keeps FP32\'s exponent range but only 8 bits. <strong>FP16</strong> keeps 11 bits but tops out at 65,504. <strong>FP8 E4M3</strong> keeps 4 bits and tops out at 448. Tensor Cores run fastest on the narrow formats (an H100 does about twice as many FP8 as BF16 operations per second), which is why “correct to how many bits?” comes up so often. FP8 is used mainly as a Tensor Core input format: the Tensor Cores multiply FP8 inputs and accumulate the products in FP16 or FP32, so a square rounded back to FP8, as in Fig. 1, is the worst case.</p>')}
        <div class="in-prose">
          <p>This section of the glossary collects and defines the key terms you need to understand to optimize the performance of programs running on GPUs. Roughly speaking, it should cover every term you run across when using <a href="https://developer.nvidia.com/nsight-compute">NSight Compute</a>, NVIDIA's kernel profiler, to debug GPU ${tl('kernel', 'kernel')} performance issues.</p>
          <p>The terms fit together from the top down. A ${tl('performance-bottleneck', 'performance bottleneck')} limits how fast work gets done, and for GPU kernels it is usually one of three things: the kernel is ${tl('compute-bound', 'compute-bound')}, ${tl('memory-bound', 'memory-bound')}, or held back by ${tl('overhead', 'overhead')}. The ${tl('roofline-model', 'roofline model')} tells the first two apart by a kernel's ${tl('arithmetic-intensity', 'arithmetic intensity')}, under two roofs: ${tl('arithmetic-bandwidth', 'arithmetic bandwidth')}, set by the hardware's ${tl('peak-rate', 'peak rate')}, and ${tl('memory-bandwidth', 'memory bandwidth')}. ${tl('streaming-multiprocessor-utilization', 'SM utilization')} and ${tl('pipe-utilization', 'pipe utilization')} say how busy the chip really is.</p>
          <p>Below that sits the machinery GPUs use to keep busy: ${tl('latency-hiding', 'latency hiding')}, sized by ${tl('littles-law', 'Little\'s Law')}; the ${tl('warp-execution-state', 'states of warps')} (active, stalled, eligible, selected) on each ${tl('active-cycle', 'active cycle')}; ${tl('occupancy', 'occupancy')}; and ${tl('issue-efficiency', 'issue efficiency')}. At the bottom are the specific ways cycles and bandwidth get wasted: ${tl('warp-divergence', 'warp divergence')}, measured by ${tl('branch-efficiency', 'branch efficiency')}; ${tl('scoreboard-stall', 'scoreboard stalls')}; uncoalesced accesses, the problem ${tl('memory-coalescing', 'memory coalescing')} solves; ${tl('bank-conflict', 'bank conflicts')}; and ${tl('register-pressure', 'register pressure')}. Fig. 2 arranges all 23 as a ladder.</p>
        </div>
        <div data-slot="ladder"></div>
        ${GG.noteHTML('beyond', '<p>The NSight Compute section names in Fig. 2 are from NVIDIA\'s profiler, not the glossary. NSight Compute profiles one kernel at a time in depth; its sibling, the <a data-term="nsight-systems">Nsight Systems</a> profiler from the Host Software chapter, shows the whole program\'s timeline, which is where overhead between kernels becomes visible.</p>')}
      `);
      try { bitsFig(ctx, s.bits); } catch (e) { console.error('[intro] bits', e); }
      try { ladderFig(ctx, s.ladder); } catch (e) { console.error('[intro] ladder', e); }
    },
  });

  /* ═════════════════════════ Contributors ═════════════════════════ */
  const hostOf = (u) => {
    try {
      const h = new URL(u).hostname.replace(/^www\./, '');
      if (h === 'twitter.com') return 'twitter.com';
      if (h === 'linkedin.com') return 'linkedin';
      if (h === 'github.com') return 'github';
      return h;
    } catch (e) { return ''; }
  };
  const P = (name, href) => (href ? `<span><a class="in-person no-ext" href="${href}">${esc(name)}</a><span class="in-host">${esc(hostOf(href))}</span></span>` : `<span><span class="in-noln">${esc(name)}</span></span>`);
  const L = (text, href) => `<a href="${href}">${text}</a>`;
  function crRow(names, role) { return `<div class="in-cr-row"><div class="in-cr-names">${names.join('')}</div><div class="in-cr-role">${role}</div></div>`; }
  function workFig(ctx, slot) {
    const perfIds = ['perf'].concat(termsOf('perf').map((t) => t.id));
    const WORK = [
      { v: 'hb', who: 'Harmya Bhatt', what: 'co-authored the material on performance', ids: perfIds },
      { v: 'pf', who: 'Philip Fabianek', what: 'contributed the articles on cuBLAS and cuDNN', ids: ['cublas', 'cudnn'] },
      { v: 'dc', who: 'Debashish Chakraborty', what: 'co-authored the article on CuTe DSL', ids: ['cute-dsl'] },
      { v: 'rr', who: 'Md Rashad Al Hasan Rony', what: 'co-authored the article on memory coalescing', ids: ['memory-coalescing'] },
      { v: 'cf', who: 'Christopher Fleetwood', what: 'contributed the articles on warpgroups and scoreboard stalls', ids: ['warpgroup', 'scoreboard-stall'] },
      { v: 'rv', who: 'Alex Zhang, David Wang, Mark Saroufim and Mit Kotak', short: 'Performance reviewers', what: 'reviewed the material on performance', ids: perfIds },
    ];
    const f = fig(ctx, slot, {
      title: 'Where their work lives', hint: 'pick a contributor',
      caption: 'The glossary in reading order, one mark per entry, with the entries the credits attribute to each contributor lit up. Charles Frye wrote the majority of the material, so his work is nearly everywhere; only contributions the credits name entry by entry are shown.',
    });
    const T = GG.order;
    const segs = [];
    T.forEach((t) => { if (!segs.length || segs[segs.length - 1].s !== t.section) segs.push({ s: t.section, n: 0 }); segs[segs.length - 1].n++; });
    f.stage.innerHTML = `<div class="in-cr-strip" aria-hidden="true">${T.map((t) => `<i class="${t.kind !== 'term' ? 'p' : ''}" data-id="${t.id}" style="--c:${chVar(t.section)}"></i>`).join('')}</div>
      <div class="in-strip-lab" aria-hidden="true">${segs.map((g) => `<span style="flex:${g.n} 1 0;--c:${chVar(g.s)}">${g.n > 3 ? esc(SEC_SHORT[g.s]) : ''}</span>`).join('')}</div>
      <div class="in-cr-tags" aria-hidden="true"></div><div class="in-cr-picked"></div>`;
    const marks = [...f.stage.querySelectorAll('.in-cr-strip i')], picked = f.stage.querySelector('.in-cr-picked'), tags = f.stage.querySelector('.in-cr-tags');
    const sN = GG.ui.stat(f.readouts, { label: 'entries', value: '' });
    const sS = GG.ui.stat(f.readouts, { label: 'of the glossary', value: '' });
    function set(v) {
      const w = WORK.find((x) => x.v === v), ids = new Set(w.ids);
      marks.forEach((m) => m.classList.toggle('on', ids.has(m.getAttribute('data-id'))));
      const secs = [...new Set(w.ids.map((id) => GG.byId[id].section))];
      picked.innerHTML = w.ids.length > 4 ? chip('perf', 'The Performance chapter: its introduction and all ' + (w.ids.length - 1) + ' terms') : w.ids.map((id) => chip(id)).join('');
      // name the lit marks right under the strip when there are only a few
      tags.innerHTML = '';
      if (w.ids.length <= 4) {
        let lastPos = -1, row = 0;
        w.ids.map((id) => T.findIndex((t) => t.id === id)).sort((a, b) => a - b).forEach((k) => {
          const pos = (k + 0.5) / T.length;
          row = lastPos >= 0 && pos - lastPos < 0.2 ? 1 - row : 0;
          lastPos = pos;
          const tf = pos < 0.12 ? '0' : pos > 0.88 ? '-100%' : '-50%';
          tags.insertAdjacentHTML('beforeend', `<span style="left:${(pos * 100).toFixed(2)}%;top:${row * 17}px;transform:translateX(${tf});--c:${chVar(T[k].section)}">${esc(shortName(T[k].id))}</span>`);
        });
      }
      tags.style.height = w.ids.length <= 4 ? '36px' : '0';
      sN.set(w.ids.length); sS.set(pctS(w.ids.length / T.length));
      f.setWhy(`<b>${esc(w.who)}</b> ${w.what}: ${w.ids.length} ${w.ids.length === 1 ? 'entry' : 'entries'}, in ${secs.map((s) => SEC_LABEL[s]).join(' and ')}.`);
    }
    GG.ui.seg(f.controls, { label: 'Contributor', value: 'hb', options: WORK.map((w) => ({ value: w.v, label: w.short || w.who })), onChange: set });
    set('hb');
  }
  GG.entry('contributors', {
    render(body, ctx) {
      const s = ctx.html(body, `
        <p class="in-lead">The glossary's credits open with that line, and its last words link to ${L('the repository on GitHub', 'https://github.com/modal-labs/gpu-glossary')}, where anyone can do exactly that. Below is everyone the credits name, with each role as the glossary gives it.</p>
        <div class="in-credits">
          <h3 class="in-cr-h">Authors</h3>
          ${crRow([P('Charles Frye', 'https://twitter.com/charles_irl')], 'wrote the majority of the material and takes full responsibility for any errors.')}
          ${crRow([P('Matthew Nappo', 'https://www.linkedin.com/in/mattnappo/')], 'wrote the initial internal “GPU Glossary” document from which this sprung.')}
          ${crRow([P('Harmya Bhatt', 'https://twitter.com/racerfunction')], `of ${L('Tensara', 'https://tensara.org/')} co-authored the material on ${tl('perf', 'performance')}.`)}
          ${crRow([P('Philip Fabianek', 'https://www.linkedin.com/in/philip-fabianek/')], `contributed the articles on ${tl('cublas', 'cuBLAS')} and ${tl('cudnn', 'cuDNN')}.`)}
          ${crRow([P('Debashish Chakraborty', 'https://github.com/debashishc')], `co-authored the article on ${tl('cute-dsl', 'CuTe DSL')}`)}
          ${crRow([P('Md Rashad Al Hasan Rony', 'https://www.rashad.ai/#about-me')], `co-authored the article on ${tl('memory-coalescing', 'memory coalescing')}.`)}
          ${crRow([P('Christopher Fleetwood', 'https://fleetwood.dev/')], `contributed the articles on ${tl('warpgroup', 'warpgroups')} and ${tl('scoreboard-stall', 'scoreboard stalls')}.`)}
          ${crRow([P('You', 'https://github.com/modal-labs/gpu-glossary')], 'can contribute to keep the glossary up-to-date and erratum-free!')}
        </div>
        <div data-slot="work"></div>
        <div class="in-credits">
          <h3 class="in-cr-h">Design</h3>
          ${crRow([P('Sona Dolasia', 'https://twitter.com/teenychairs')], 'designed the glossary.')}
          ${crRow([P('Anna Carey', 'https://twitter.com/anna_carey')], 'implemented the design and UX.')}
          <h3 class="in-cr-h">Review</h3>
          ${crRow([P('Abhinav Upadhyay', 'https://twitter.com/abhi9u'), `<span><a class="in-person no-ext" href="https://github.com/pauleonix"><code>@Pauleonix</code></a><span class="in-host">github</span></span>`], `${L('Abhinav Upadhyay', 'https://twitter.com/abhi9u')} of ${L('Coding Confessions', 'https://blog.codingconfessions.com/')} and ${L('<code>@Pauleonix</code>', 'https://github.com/pauleonix')} of the ${L('GPU MODE Discord', 'https://discord.gg/gpumode')}, from outside Modal, provided valuable external technical review of the first version of the glossary. We particularly thank Abhinav for his perspective on comparisons with CPUs and Pauleonix for his detailed insights on GPU hardware internals.`)}
          ${crRow([P('Alex Zhang', 'https://alexzhang13.github.io/'), P('David Wang', 'https://www.linkedin.com/in/dcw02/'), P('Mark Saroufim', 'https://twitter.com/marksaroufim'), P('Mit Kotak', 'https://mitkotak.github.io/')], `reviewed the material on ${tl('perf', 'performance')}.`)}
          ${crRow([P('Akshat Bubna', 'https://twitter.com/akshat_b'), P('Nathan Wang', 'https://www.linkedin.com/in/nathan-r-wang/'), P('Colin Weld', 'https://www.linkedin.com/in/colin-weld/')], 'gave technical feedback on early drafts of the glossary.')}
          ${crRow([P('Eric Zhang', 'https://twitter.com/ekzhang1'), P('Ro Arepally', 'https://twitter.com/rarepally')], 'reviewed the design and implementation.')}
          <h3 class="in-cr-h">Acknowledgements</h3>
          ${crRow([P('Mark Saroufim', 'https://twitter.com/marksaroufim'), P('Andreas Kopf')], `for bringing together the ${L('GPU MODE Discord community', 'https://discord.gg/gpumode')}`)}
          ${crRow([P('Fabien Sanglard', 'https://twitter.com/fabynou')], `for authoring an ${L('excellent history of CUDA GPUs', 'https://fabiensanglard.net/cuda')}`)}
          ${crRow([P('Jen-Hsun Huang')], 'for leading an organization that makes some pretty decent chips')}
          <h3 class="in-cr-h">Error Correction <small>alphabetical</small></h3>
          <p class="in-cr-role" style="padding-top:10px">We thank the following GPU enthusiasts who came in through the world wide web to correct errors:</p>
          <div class="in-errata">${[['Alex Zhang', 'https://alexzhang13.github.io/'], ['Ayoub Ghriss', 'https://github.com/ayghri'], ['Erik Schultheis', 'https://www.linkedin.com/in/erik-schultheis-606a52119/'], ['Ismail Zaidi', null], ['Michal Nawrot', 'https://github.com/michalnawrot'], ['Nicolas Blin', 'https://www.nicolas-blin.fr/'], ['Tony Wang', 'https://github.com/tonywangs']].map(([n, h]) => P(n, h)).join('')}</div>
        </div>
        ${GG.noteHTML('aside', `<p>Warp &amp; Weft is an independent, unofficial companion to <a href="https://modal.com/gpu-glossary">Modal's GPU Glossary</a>, not affiliated with or endorsed by Modal or NVIDIA. It adapts the glossary's text, which is licensed under <a href="https://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0</a>: the entries are rewritten and expanded, the code samples reproduced, and every figure redrawn as an interactive illustration. The people above wrote the glossary; mistakes in the additions here, the notes, figures and extra explanations, are this site's own. The glossary's source is <a href="https://github.com/modal-labs/gpu-glossary">on GitHub</a>.</p>`, 'About Warp & Weft')}
      `);
      try { workFig(ctx, s.work); } catch (e) { console.error('[intro] work', e); }
    },
  });
})();
