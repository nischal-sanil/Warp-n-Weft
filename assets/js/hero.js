/* Warp & Weft — hero.
   The site's opening thesis: an explorable, exploded 3D model of an H100-class GPU that the reader can
   take apart, from the package down to one SM sub-partition, with live labels, stat chips and a
   "what you're looking at" sentence. Three.js r128 (window.THREE) only; no other libraries.

   Structure is accurate, geometry is illustrative:
   - package substrate → silicon interposer → GH100-class die + 6 HBM3 sites (5 enabled, 80 GiB, 3.35 TB/s)
   - die floorplan: 8 GPCs × 9 TPCs × 2 SMs = 144 SM tiles (132 enabled, as on H100 SXM5), a central L2
     (50 MB on H100 SXM5), memory controllers along the edges that face the HBM stacks
   - SM floorplan (from the H100 whitepaper figure the glossary uses): L1 instruction cache, 4 sub-partitions
     (L0 i-cache, warp scheduler, dispatch, 16,384 × 32-bit register file, 16 INT32 / 32 FP32 / 16 FP64,
     a Tensor Core, 8 LD/ST, SFU), TMA, 256 KiB L1 data cache / shared memory, 4 texture units.
   Owns <section id="top" class="hero">. #hero-fallback stays as the no-WebGL view.
   Test hooks: GG.hero.setLevel(i) · setExploded(bool) · select({gpc,tpc,sm,smsp}) · state.
   A ?hero=fallback query forces the fallback view. */
(function () {
  'use strict';
  const GG = window.GG;
  if (!GG || !GG.onBoot) return;

  /* ═════════════════════════════ styles ═════════════════════════════ */
  GG.css(`
.hero.hero-on{height:max(600px,min(860px,calc(100vh - var(--topbar-h) - env(safe-area-inset-top,0px))));min-height:0;
  background:radial-gradient(60% 70% at 66% 56%,rgba(111,166,255,.09),transparent 70%),radial-gradient(34% 40% at 74% 80%,rgba(255,138,91,.05),transparent 70%)}
.hero-on>.hero-fallback{display:none}
.hero.hero-on::after{content:"";position:absolute;inset:0;z-index:2;pointer-events:none;background:linear-gradient(90deg,rgba(11,12,18,.82) 0%,rgba(11,12,18,.55) 24%,rgba(11,12,18,0) 44%)}
@media (max-width:900px){.hero.hero-on::after{display:none}}
.hero-shade{position:absolute;inset:0;z-index:2;pointer-events:none;opacity:0;transition:opacity .6s;background:linear-gradient(90deg,rgba(11,12,18,.9) 0%,rgba(11,12,18,.78) 30%,rgba(11,12,18,0) 50%)}
.hero-deep .hero-shade{opacity:1}
@media (max-width:900px){.hero-shade{display:none}}
.hero-stage{position:absolute;inset:0;z-index:1}
.hero-stage.is-engaged::before{content:"Wheel zooms the model · Esc or move away to release";position:absolute;z-index:3;left:50%;top:12px;transform:translateX(-50%);padding:3px 10px;border-radius:999px;
  background:rgba(12,13,20,.9);border:1px dashed rgba(255,138,91,.45);font:500 10.5px var(--font-mono);color:var(--ink-2);white-space:nowrap;pointer-events:none}
.hero-parts{display:none}
.hero-slots{display:flex;flex-wrap:wrap;align-items:center;gap:4px 3px;margin-top:8px;font:500 10.5px var(--font-mono);color:var(--ink-3)}
.hero-slots[hidden]{display:none}
.hero-rmstep{display:flex;align-items:center;gap:10px;margin-top:8px;font:500 10.5px var(--font-mono);color:var(--ink-3)}
.hero-rmstep[hidden]{display:none}
.hero-rmstep .btn{height:28px;padding:0 10px;font-size:12px}
.hero-slots>span{margin-right:6px;white-space:nowrap}
.hero-slots i{width:9px;height:12px;border-radius:2px;background:var(--memory);opacity:.85;transition:background .12s,transform .12s;flex:none}
.hero-slots i.st{background:var(--control);opacity:.7}
.hero-slots i.sel{background:var(--special);opacity:1;transform:scaleY(1.25)}
.hero-slots em{font-style:normal;margin-left:8px;white-space:nowrap}
.hero-slots em b{display:inline-block;width:8px;height:8px;border-radius:2px;margin:0 4px 0 6px;vertical-align:-1px}
.hero-card dd small{margin-left:6px;font-size:9.5px;color:var(--ink-3);letter-spacing:.02em}
.hero-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:pan-y;cursor:grab;-webkit-tap-highlight-color:transparent;outline:none}
.hero-canvas.is-drag{cursor:grabbing}
.hero-canvas.is-point{cursor:pointer}
.hero-canvas:focus-visible{outline:2px solid var(--accent);outline-offset:-6px}
.hero-stage.is-engaged::after{content:"";position:absolute;inset:6px;border:1px dashed rgba(255,138,91,.38);border-radius:14px;pointer-events:none}
.hero-labels{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.hero-lab{position:absolute;left:0;top:0;width:0;height:0;padding:0;margin:0;border:0;background:none;pointer-events:none;color:var(--ink);will-change:transform;transition:opacity .22s,visibility 0s}
.hero-lab.is-off{opacity:0;visibility:hidden;transition:opacity .18s,visibility 0s .18s}
.hero-lab-dot{position:absolute;left:-4px;top:-4px;width:8px;height:8px;border-radius:50%;background:var(--c);box-shadow:0 0 0 3px rgba(11,12,18,.75),0 0 14px var(--c)}
.hero-lab-stem{position:absolute;left:-.5px;bottom:0;width:1px;height:var(--stem,24px);background:linear-gradient(to top,var(--c),rgba(236,238,246,.18))}
.hero-lab-pill{position:absolute;left:0;bottom:var(--stem,24px);transform:translateX(-50%);display:inline-flex;align-items:center;gap:7px;white-space:nowrap;
  padding:5px 10px 5px 8px;border-radius:999px;background:rgba(12,13,20,.84);border:1px solid rgba(236,238,246,.16);
  font:500 11.5px/1.2 var(--font-mono);letter-spacing:.02em;color:var(--ink);pointer-events:auto;cursor:pointer;
  -webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);transition:border-color .15s,background .15s}
.hero-lab.is-down .hero-lab-stem{bottom:auto;top:0;background:linear-gradient(to bottom,var(--c),rgba(236,238,246,.18))}
.hero-lab.is-down .hero-lab-pill{bottom:auto;top:var(--stem,24px)}
.hero-lab-pill i{width:7px;height:7px;border-radius:2px;background:var(--c);flex:none}
.hero-lab-pill small{font-size:10.5px;color:var(--ink-3)}
.hero-lab:hover .hero-lab-pill,.hero-lab.is-on .hero-lab-pill{border-color:var(--c);background:rgba(22,23,34,.96)}
.hero-lab:focus-visible{outline:none}
.hero-lab:focus-visible .hero-lab-pill{outline:2px solid var(--accent);outline-offset:2px}
[data-tone=core]{--c:var(--core)}[data-tone=special]{--c:var(--special)}[data-tone=control]{--c:var(--control)}
[data-tone=memory]{--c:var(--memory)}[data-tone=ink]{--c:var(--ink-2)}[data-tone=dim]{--c:var(--ink-3)}
.hero-glass{background:rgba(13,14,22,.68);border:1px solid rgba(236,238,246,.085);border-radius:16px;
  box-shadow:0 26px 60px -26px rgba(0,0,0,.9),inset 0 1px 0 rgba(255,255,255,.045);-webkit-backdrop-filter:blur(14px) saturate(1.25);backdrop-filter:blur(14px) saturate(1.25)}
.hero-ph{display:flex;align-items:baseline;gap:10px;font:500 10.5px var(--font-mono);letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3)}
.hero-ph b{color:var(--accent);font-weight:600}
.hero-ph span:last-child{margin-left:auto;letter-spacing:.04em;text-transform:none}
.hero-intro{position:absolute;z-index:3;left:0;top:0;padding:clamp(22px,2.8vw,40px) 0 0 clamp(20px,2.8vw,40px);max-width:min(560px,44vw);pointer-events:none}
.hero-on .hero-title{font-size:clamp(60px,min(8.4vw,13.6vh),138px);margin:12px 0 16px;text-shadow:0 4px 40px rgba(11,12,18,.9)}
.hero-on .hero-sub{font-size:clamp(16px,1.25vw,18.5px);max-width:35ch;text-shadow:0 2px 18px rgba(11,12,18,.95)}
.hero-on .hero-kicker{text-shadow:0 1px 10px rgba(11,12,18,.9)}
.hero-ctas{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px;pointer-events:auto}
.hero-cta{display:inline-flex;align-items:center;gap:8px;height:42px;padding:0 18px;border-radius:999px;border:1px solid var(--line-2);background:rgba(18,19,28,.72);
  color:var(--ink);font:600 14px var(--font-body);text-decoration:none;white-space:nowrap;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);transition:background .15s,border-color .15s}
.hero-cta:hover{color:var(--ink);border-color:var(--ink-3);background:rgba(30,32,46,.9)}
.hero-cta.primary{background:var(--accent);border-color:var(--accent);color:var(--on-accent)}
.hero-cta.primary:hover{background:var(--accent-2);border-color:var(--accent-2);color:var(--on-accent)}
.hero-cta svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.hero-ctl{position:absolute;z-index:4;top:clamp(16px,2.2vw,28px);right:clamp(16px,2.2vw,28px);width:min(430px,40vw);padding:10px 12px 12px;display:grid;gap:9px}
.hero-ctl-h{display:flex;align-items:center;gap:6px}
.hero-ctl-h .btn{height:28px;padding:0 10px;font-size:12px}
.hero-ctl-h .hero-reset{width:28px;padding:0}.hero-reset span{display:none}
.hero-levels{display:flex;flex-wrap:nowrap;width:100%}
.hero-levels button{flex:1 1 auto;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:0 8px}
.hero-levels button i{font-style:normal;font-size:10px;line-height:1;padding:2px 4px;border-radius:4px;border:1px solid var(--line-2);color:var(--ink-3)}
.hero-levels button[aria-pressed=true] i{border-color:rgba(11,12,18,.25);color:rgba(11,12,18,.6)}
.hero-row{display:flex;flex-wrap:wrap;align-items:center;gap:10px 12px}
.hero-row .hero-sp{flex:1 1 0}
.hero-row .ctl{flex-direction:row;align-items:center;gap:10px}
.hero-read{position:absolute;z-index:4;left:clamp(16px,2.2vw,28px);bottom:clamp(16px,2.2vw,26px);width:min(560px,45vw);padding:11px 14px 13px}
.hero-read-h{display:flex;align-items:baseline;gap:6px 12px;flex-wrap:wrap}
.hero-vnum{font:500 10.5px var(--font-mono);letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3);white-space:nowrap}
.hero-vnum b{color:var(--accent);font-weight:600}
.hero-crumbs{display:flex;flex-wrap:wrap;align-items:baseline;gap:0 2px;margin-left:auto;font:500 11px var(--font-mono)}
.hero-crumbs button{border:0;background:none;color:var(--ink-3);padding:2px 4px;border-radius:5px;cursor:pointer;font:inherit;white-space:nowrap}
.hero-crumbs button:hover{color:var(--ink);background:rgba(255,255,255,.06)}
.hero-crumbs button[aria-current]{color:var(--ink)}
.hero-crumbs button.is-deep{opacity:.55}
.hero-crumbs span{color:var(--ink-3);opacity:.6}
.hero-lvl{display:flex;align-items:baseline;flex-wrap:wrap;gap:2px 12px;margin:5px 0 10px}
.hero-lvl strong{font:800 34px/1 var(--font-display);letter-spacing:.012em;color:var(--ink)}
.hero-lvl span{font-size:13.5px;color:var(--ink-2)}
.hero-chips{display:flex;flex-wrap:wrap;gap:6px}
.hero-chip{min-width:78px;padding:6px 9px 5px;transition:opacity .3s}
.hero-chip.is-new{opacity:0}
.hero-chip[data-tone=dim] b{color:var(--ink-3)}
.hero-chip em{display:block;margin-top:3px;font:500 9.5px/1.1 var(--font-mono);color:var(--ink-3);font-style:normal;white-space:nowrap}
.hero-why{margin-top:10px;font-size:14.5px;line-height:1.55;color:var(--ink-2);min-height:3.1em}
.hero-why b{color:var(--ink);font-weight:600}
.hero-why code{font-size:.86em;padding:.08em .35em;border-radius:5px;background:var(--surface-3);border:1px solid var(--line);color:var(--ink)}
.hero-tick{display:grid;grid-template-columns:7px minmax(0,1fr);align-items:center;gap:1px 9px;margin-top:8px;font:500 11.5px/1.45 var(--font-mono);color:var(--ink-3)}
.hero-tick:empty{display:none}
.hero-tick i{width:7px;height:7px;border-radius:50%;background:var(--c,var(--ink-3));box-shadow:0 0 10px var(--c,transparent)}
.hero-tick span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hero-tick span+span{grid-column:2;font-size:10.5px;opacity:.85}
.hero-tick b{color:var(--ink);font-weight:600}
.hero.is-c1 .hero-chip{padding:5px 8px 4px}
.hero.is-c1 .hero-lvl{margin:3px 0 7px}.hero.is-c1 .hero-lvl strong{font-size:27px}
.hero.is-c1 .hero-why{margin-top:8px;font-size:13.5px;line-height:1.5}
.hero.is-c2 .hero-sub{display:none}
.hero.is-c3 .hero-title{font-size:clamp(46px,min(5.8vw,9.5vh),96px);margin:8px 0 12px}.hero.is-c3 .hero-title br{display:none}
.hero.is-c4 .hero-kicker{display:none}.hero.is-c4 .hero-title{margin-top:0}
.hero.is-c4 .hero-why{margin-top:6px;font-size:13px;line-height:1.45}.hero.is-c4 .hero-tick{margin-top:5px}.hero.is-c4 .hero-slots{margin-top:5px}
.hero.is-fitting .hero-intro,.hero.is-fitting .hero-intro *,.hero.is-fitting .hero-read,.hero.is-fitting .hero-read *{transition:none!important}
.hero-card-zoom{display:inline-flex;align-items:center;gap:6px;margin-top:10px;height:30px;padding:0 12px;border-radius:999px;border:1px solid var(--accent);background:rgba(255,138,91,.1);
  color:var(--ink);font:600 12px var(--font-mono);cursor:pointer}
.hero-card-zoom:hover{background:rgba(255,138,91,.2)}
.hero-tour{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-top:10px}
.hero-tour output{font:500 11px var(--font-mono);letter-spacing:.1em;text-transform:uppercase;color:var(--accent);margin-right:auto}
.hero-foot{position:absolute;z-index:4;right:clamp(16px,2.2vw,28px);bottom:clamp(16px,2.2vw,26px);display:grid;justify-items:end;gap:6px;max-width:min(600px,48vw);pointer-events:none;
  padding:8px 12px;border-radius:12px;background:rgba(11,12,18,.62);border:1px solid rgba(236,238,246,.06);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
.hero-legend{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:5px 14px;list-style:none;margin:0;padding:0;font:500 11px var(--font-mono);color:var(--ink-2)}
.hero-legend li{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.hero-legend li::before{content:"";width:8px;height:8px;border-radius:2px;background:var(--c)}
.hero-hint{margin:0;font:500 10.5px/1.5 var(--font-mono);color:var(--ink-3);text-align:right}
/* desktop: every part of this view, as a list that opens from the foot, so parts whose label was culled stay reachable */
.hero-foot-row{display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:4px 10px}
.hero-partsbtn{pointer-events:auto;display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 10px;border-radius:999px;border:1px solid var(--line-2);background:rgba(12,13,20,.84);
  color:var(--ink-2);font:500 10.5px var(--font-mono);cursor:pointer;white-space:nowrap}
.hero-partsbtn:hover{color:var(--ink);border-color:var(--ink-3)}
.hero-partsbtn[aria-expanded=true]{color:var(--ink);border-color:var(--accent)}
.hero-partsbtn b{font-weight:600;color:var(--ink)}
.hero-partspop{order:-1;display:flex;flex-wrap:wrap;justify-content:flex-end;gap:6px;pointer-events:auto;padding-bottom:4px} /* after its button in tab order, drawn above it */
.hero-partspop[hidden]{display:none}
.hero-partspop button{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border-radius:999px;border:1px solid var(--line-2);background:rgba(12,13,20,.9);color:var(--ink);font:500 11px var(--font-mono);cursor:pointer;white-space:nowrap}
.hero-partspop button i{width:7px;height:7px;border-radius:2px;background:var(--c)}
.hero-partspop button:hover,.hero-partspop button.is-on{border-color:var(--c)}
.hero-hint kbd{font-size:10px;padding:2px 5px 1px}
.hero-tip{position:absolute;z-index:7;left:0;top:0;max-width:270px;padding:7px 10px 8px;border-radius:10px;background:rgba(12,13,20,.93);border:1px solid var(--line-2);
  font:500 11.5px/1.4 var(--font-mono);color:var(--ink);pointer-events:none;opacity:0;transition:opacity .12s;box-shadow:0 14px 34px -14px rgba(0,0,0,.9)}
.hero-tip.on{opacity:1}
.hero-tip i{display:inline-block;width:7px;height:7px;border-radius:2px;background:var(--c);margin-right:7px}
.hero-tip span{display:block;margin-top:3px;color:var(--ink-3);font-size:10.5px}
.hero-card{position:absolute;z-index:8;left:0;top:0;width:min(310px,calc(100% - 24px));padding:12px 14px 12px;font-size:13.5px;line-height:1.5;color:var(--ink-2)}
.hero-card-h{display:flex;align-items:center;gap:9px}
.hero-card-h i{width:9px;height:9px;border-radius:2px;background:var(--c);flex:none}
.hero-card-h strong{font:700 22px/1.05 var(--font-display);letter-spacing:.01em;color:var(--ink)}
.hero-card-x{margin-left:auto;border:0;background:none;color:var(--ink-3);font-size:19px;line-height:1;padding:2px 6px;border-radius:6px;cursor:pointer}
.hero-card-x:hover{color:var(--ink);background:var(--surface-2)}
.hero-card-tag{margin:3px 0 7px;font:500 10px var(--font-mono);letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3)}
.hero-card p code{font-size:.86em;padding:.05em .3em;border-radius:4px;background:var(--surface-3);color:var(--ink)}
.hero-card dl{display:grid;grid-template-columns:auto 1fr;gap:3px 12px;margin:9px 0 0;font:500 11.5px/1.35 var(--font-mono)}
.hero-card dt{color:var(--ink-3)}.hero-card dd{margin:0;color:var(--ink)}
.hero-card-go{margin-top:10px;padding-top:9px;border-top:1px solid var(--line);font-size:13px}
.hero-card-go span{color:var(--ink-3)}
.hero-toast{position:absolute;z-index:7;left:50%;top:0;transform:translate(-50%,8px);padding:8px 14px;border-radius:999px;background:rgba(12,13,20,.94);border:1px solid var(--line-2);
  font:500 12px var(--font-mono);color:var(--ink-2);pointer-events:none;opacity:0;transition:opacity .2s,transform .2s;white-space:nowrap}
.hero-toast.on{opacity:1;transform:translate(-50%,0)}
.hero-toast kbd{font-size:10.5px}
@media (max-width:1100px) and (min-width:901px){.hero-levels button i{display:none}}
@media (max-height:760px) and (min-width:901px){.hero-on .hero-sub{max-width:32ch}.hero-why{font-size:13.5px}.hero-lvl strong{font-size:28px}}
@media (max-width:900px){
  .hero.hero-on{height:auto;display:flex;flex-direction:column}
  .hero-intro{position:relative;padding:22px 16px 0;max-width:none;pointer-events:auto}
  .hero-on .hero-title{font-size:clamp(56px,17vw,100px);margin:10px 0 12px}
  .hero-on .hero-sub{font-size:16px;max-width:40ch}
  .hero-ctas{margin-top:16px}.hero-cta{height:40px;padding:0 15px;font-size:13.5px}
  .hero-on .hero-kicker{font-size:10.5px;letter-spacing:.08em}
  .hero-ctl{position:relative;inset:auto;width:auto;margin:10px 16px 0;padding:10px 10px 10px;gap:8px}
  .hero-ctl,.hero-read,.hero-foot{order:1} /* the model comes right after the intro, its controls under it */
  .hero-layers>.ctl-lab{display:none}
  .hero-levels button{padding:0 6px}.hero-levels button i{display:none}
  .hero-stage{position:relative;inset:auto;height:clamp(300px,94vw,470px);margin-top:12px}
  .hero-stage.is-engaged::before{content:none}
  .hero-parts{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin:8px 16px 0;padding-bottom:2px}
  .hero-parts::-webkit-scrollbar{display:none}
  .hero-parts>span{flex:none;align-self:center;font:500 10px var(--font-mono);letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3)}
  .hero-parts button{flex:none;display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 10px;border-radius:999px;border:1px solid var(--line-2);background:rgba(12,13,20,.84);color:var(--ink);font:500 11px var(--font-mono);cursor:pointer}
  .hero-parts button i{width:7px;height:7px;border-radius:2px;background:var(--c)}
  .hero-parts button.is-on{border-color:var(--c)}
  .hero-read{position:relative;inset:auto;width:auto;margin:10px 16px 0;display:flex;flex-direction:column}
  /* the live issue line and warp strip (SM levels only; empty and hidden above them) come first, right under the
     model they narrate, so the strip and the lit-up parts are on screen together */
  .hero-tick{order:1;margin:0}.hero-slots{order:2;margin:6px 0 12px}.hero-rmstep{order:2;margin:-4px 0 12px}.hero-read-h{order:3}.hero-lvl{order:4}.hero-why{order:5;margin-top:0}.hero-tour{order:6}.hero-chips{order:7;margin-top:12px}
  .hero-foot{position:relative;inset:auto;max-width:none;margin:12px 16px 22px;justify-items:start;padding:0;background:none;border:0;-webkit-backdrop-filter:none;backdrop-filter:none}
  .hero-legend{justify-content:flex-start}.hero-hint{text-align:left}
  .hero-foot-row{justify-content:flex-start}.hero-partsbtn,.hero-partspop{display:none!important} /* the Parts row under the model does this job */
  .hero-crumbs{margin-left:0;width:100%}
  .hero-chip{flex:0 0 calc(50% - 3px);min-width:0} /* two even columns; every chip and its sub-line in view, no hidden scroller */
  .hero-lab-pill{font-size:11px;padding:4px 8px 4px 7px;gap:6px}
  .hero-card{width:calc(100% - 24px);overflow-y:auto;overscroll-behavior:contain}
  .hero-tick span{white-space:normal}
  .hero-tick:not(:empty){min-height:64px;align-content:start} /* up to four wrapped lines: the strip under it stays put as the text changes */
  .hero-slots{flex-wrap:wrap;row-gap:5px}
  .hero-slots em{flex-basis:100%;margin-left:0}.hero-slots>span{flex-basis:100%}
}
/* no-WebGL fallback */
.hero-fb-grid{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:28px;align-items:center}
.hero-fb-art svg{display:block;width:100%;height:auto}
.hero-fb-art p{margin-top:6px;font:500 11px var(--font-mono);color:var(--ink-3)}
.hero-fb-legend{display:flex;flex-wrap:wrap;gap:5px 14px;list-style:none;margin:18px 0 0;padding:0;font:500 11px var(--font-mono);color:var(--ink-2)}
.hero-fb-legend li{display:inline-flex;align-items:center;gap:6px}
.hero-fb-legend li::before{content:"";width:8px;height:8px;border-radius:2px;background:var(--c)}
@media (max-width:900px){.hero-fb-grid{grid-template-columns:minmax(0,1fr)}}
`);

  /* ═════════════════════════════ facts & layout ═════════════════════════════ */
  // H100 SXM5 / GH100 facts (the glossary + NVIDIA's H100 whitepaper).
  const F = { tcPerSm: 4, fp32PerSm: 128, threadsPerSm: 2048, smsp: 4 };
  // H100 SXM5 disables 6 TPCs (12 SMs) of the full die. Which ones varies from chip to chip; these are illustrative.
  const FUSED = new Set(['0:8', '2:1', '3:6', '4:4', '6:0', '7:7']);
  const OFF_STACK = 3; // the one of six HBM sites H100 SXM5 leaves unused (position illustrative)

  // world units (roughly millimetres, stylised)
  const SUB = { w: 46, d: 32, t: 1.0 };
  const INT = { w: 36.4, d: 22.4, t: 0.4 };
  const DIE = { w: 22, d: 20, t: 0.7 };
  const HBM = { w: 5.2, d: 5.6, base: 0.34, dram: 0.2, n: 8, x: 14.6, z: [-6.5, 0, 6.5] };
  const GPCG = { w: 4.225, d: 7.55, x0: -9.2, gap: 0.5 }; // GPC gap 2.5× the SM gap, so the 8 clusters read as groups
  const SM_W = 1.175, TPC_D = 6.2 / 3, SM_D = (6.2 / 3 - 0.07) / 2, TILE_H = 0.1, PLATE_H = 0.03;
  const FP = { cx: 700, cy: 954, S: 0.008 };
  FP.W = 1376 * FP.S; FP.D = 1884 * FP.S;
  const LIFT_H = 7.8;
  const NARROW = 900; // at or below this width the hero stacks: intro, model, controls, readout
  const stackX = (s) => (s < 3 ? -HBM.x : HBM.x);
  const stackZ = (s) => HBM.z[s % 3];

  function gpcRect(g) {
    const row = g < 4 ? 0 : 1, col = g % 4;
    const x0 = GPCG.x0 + col * (GPCG.w + GPCG.gap);
    const z0 = row === 0 ? -8.85 : 1.3;
    return { x0, z0, x1: x0 + GPCG.w, z1: z0 + GPCG.d, row, col };
  }
  const smIndex = (g, t, k) => g * 18 + t * 2 + k;
  function smRect(i) {
    const g = Math.floor(i / 18), t = Math.floor((i % 18) / 2), k = i % 2;
    const r = gpcRect(g), c = t % 3, row = Math.floor(t / 3);
    const ax = r.x0 + 0.15, az = r.row === 0 ? r.z0 + 0.8 : r.z0 + 0.15;
    const x0 = ax + c * (SM_W + 0.2), z0 = az + row * (TPC_D + 0.2) + k * (SM_D + 0.07);
    return { x0, z0, x1: x0 + SM_W, z1: z0 + SM_D, g, t, k, on: !FUSED.has(g + ':' + t) };
  }
  const SMR = Array.from({ length: 144 }, (_, i) => smRect(i));
  const ENABLED_SMS = SMR.filter((r) => r.on).length; // 132
  const tpcOn = (g, t) => !FUSED.has(g + ':' + t);
  const tpcsOnIn = (g) => { let n = 0; for (let t = 0; t < 9; t++) if (tpcOn(g, t)) n++; return n; };

  // SM floorplan, in pixel coordinates of the H100 SM figure the glossary uses (1400 × 1840).
  const QUADS = [[30, 162], [711, 162], [30, 896], [711, 896]];
  function fpBlockList() {
    const B = [];
    const add = (part, q, x0, y0, x1, y1, h, tone, text) => B.push({ part, q, x0, y0, x1, y1, h, tone, text });
    add('smplate', -1, 12, 12, 1388, 1896, 0.12, 'plate0', null);
    add('l1i', -1, 30, 82, 1370, 140, 0.2, 'mem2', 'L1 Instruction Cache');
    add('tma', -1, 29, 1620, 1371, 1677, 0.26, 'special', 'Tensor Memory Accelerator');
    add('l1d', -1, 29, 1700, 1371, 1757, 0.36, 'mem3', '256 KiB L1 Data Cache / Shared Memory');
    [[29, 343], [371, 685], [714, 1028], [1056, 1370]].forEach(([a, b]) => add('tex', -1, a, 1779, b, 1819, 0.2, 'neutral', 'Tex'));
    QUADS.forEach(([qx, qy], q) => {
      const r = (x0, y0, x1, y1) => [qx + x0, qy + y0, qx + x1, qy + y1];
      add('smsp', q, ...r(0, 0, 660, 711), 0.06, 'plate1', null);
      add('l0', q, ...r(12, 12, 647, 52), 0.16, 'mem2', 'L0 Instruction Cache');
      add('ws', q, ...r(12, 64, 647, 93), 0.2, 'ctl2', 'Warp Scheduler (32 thread/clk)');
      add('du', q, ...r(12, 105, 647, 135), 0.2, 'ctl2', 'Dispatch Unit (32 thread/clk)');
      add('rf', q, ...r(12, 147, 647, 207), 0.3, 'memory', 'Register File (16,384 × 32-bit)');
      const rowH = 418 / 16;
      for (let i = 0; i < 16; i++) {
        const y0 = 224 + i * rowH + 1.6, y1 = 224 + (i + 1) * rowH - 1.6;
        add('int32', q, ...r(13, y0, 82, y1), 0.14, 'int', 'INT32');
        add('fp32', q, ...r(102, y0, 169.5, y1), 0.14, 'core', 'FP32');
        add('fp32', q, ...r(172.5, y0, 240, y1), 0.14, 'core', 'FP32');
        add('fp64', q, ...r(260, y0, 453, y1), 0.14, 'fp64', 'FP64');
      }
      add('tc', q, ...r(473, 224, 647, 642), 0.52, 'tc', 'TENSOR CORE\n4TH GENERATION');
      for (let i = 0; i < 8; i++) add('ldst', q, ...r(13 + i * 59.2, 659, 64 + i * 59.2, 699), 0.2, 'special', 'LD/ST');
      add('sfu', q, ...r(487, 659, 647, 699), 0.22, 'special', 'SFU');
    });
    return B;
  }

  function dieBlockList() {
    const B = [];
    for (let g = 0; g < 8; g++) {
      const r = gpcRect(g);
      B.push({ part: 'gpc', g, x0: r.x0, z0: r.z0, x1: r.x1, z1: r.z1, h: PLATE_H, tone: 'plate2' });
      // a header strip naming the GPC, and the raster engine of the glossary's (generic) GPC definition
      const rz0 = r.row === 0 ? r.z0 + 0.15 : r.z1 - 0.65;
      B.push({ part: 'gpc', g, head: true, x0: r.x0 + 0.15, z0: rz0, x1: r.x1 - 1.45, z1: rz0 + 0.5, h: 0.09, tone: 'neutral', text: `GPC ${g + 1}` });
      B.push({ part: 'raster', g, x0: r.x1 - 1.35, z0: rz0, x1: r.x1 - 0.15, z1: rz0 + 0.5, h: 0.07, tone: 'plate1', text: 'Raster' });
    }
    B.push({ part: 'l2', x0: -9.2, z0: -1.05, x1: -0.35, z1: 1.05, h: 0.12, tone: 'memory', text: 'L2 Cache' });
    B.push({ part: 'l2', x0: 0.35, z0: -1.05, x1: 9.2, z1: 1.05, h: 0.12, tone: 'memory', text: 'L2 Cache' });
    B.push({ part: 'l2', x0: -0.28, z0: -1.05, x1: 0.28, z1: 1.05, h: 0.08, tone: 'neutral' });
    for (const side of [-1, 1]) {
      for (let k = 0; k < 3; k++) {
        const s = side < 0 ? k : 3 + k;
        for (const j of [-1, 1]) {
          const zc = HBM.z[k] + j * 1.45;
          B.push({ part: 'mc', stack: s, x0: side < 0 ? -10.75 : 9.45, x1: side < 0 ? -9.45 : 10.75, z0: zc - 1.33, z1: zc + 1.33, h: 0.1, tone: 'mc', text: '512-bit MC', rot: side });
        }
      }
    }
    // top and bottom edges, in the order of NVIDIA's GH100 block diagram (whitepaper Figure 6)
    B.push({ part: 'io', x0: -9.2, z0: -9.9, x1: 9.2, z1: -9.48, h: 0.07, tone: 'neutral', text: 'PCIe 5.0 Host Interface' });
    B.push({ part: 'giga', x0: -9.2, z0: -9.4, x1: 9.2, z1: -8.98, h: 0.09, tone: 'control', text: 'GigaThread Engine with MIG Control' });
    B.push({ part: 'hub', x0: -9.2, z0: 8.98, x1: 9.2, z1: 9.4, h: 0.07, tone: 'neutral', text: 'High-Speed Hub' });
    for (let k = 0; k < 18; k++) {
      const w = 18.4 / 18;
      B.push({ part: 'nvlink', x0: -9.2 + k * w + 0.04, z0: 9.48, x1: -9.2 + (k + 1) * w - 0.04, z1: 9.9, h: 0.07, tone: 'nvl', text: k === 8 ? 'NVLink' : null });
    }
    return B;
  }

  // vertical placement of every package layer for an explode amount E ∈ [0, 1]
  function pkgLayout(E) {
    const L = { E };
    L.subTop = SUB.t;
    L.intBot = L.subTop + E * 4.8; L.intTop = L.intBot + INT.t;
    L.dieBot = L.intTop + E * 5.2; L.dieTop = L.dieBot + DIE.t;
    L.tileBot = L.dieTop + PLATE_H;
    L.hbmBot = L.intTop + E * 2.2;
    L.dramGap = E * 0.5;
    return L;
  }
  const dramBot = (L, k) => L.hbmBot + HBM.base + L.dramGap * (k + 1) + k * HBM.dram;
  const stackTop = (L) => dramBot(L, HBM.n - 1) + HBM.dram;

  /* ═════════════════════════════ words ═════════════════════════════ */
  const T = (id, text) => `<a data-term="${id}">${text}</a>`;
  const LEVELS = [
    { id: 'gpu', label: 'GPU', title: 'GPU', sub: 'an H100 SXM5-class package' },
    { id: 'gpc', label: 'GPC', title: 'GPC', sub: 'Graphics/GPU Processing Cluster' },
    { id: 'tpc', label: 'TPC', title: 'TPC', sub: 'Texture Processing Cluster' },
    { id: 'sm', label: 'SM', title: 'SM', sub: 'Streaming Multiprocessor' },
    { id: 'smsp', label: 'Sub-partition', title: 'Sub-partition', sub: 'one quarter of an SM' },
  ];

  // facts: [label, value, source?]. source marks what does not come from the glossary itself:
  // 'wp' = NVIDIA's H100 whitepaper, 'cuda' = NVIDIA's CUDA C++ Programming Guide, 'beyond' = general knowledge.
  const SRC = { wp: 'whitepaper', cuda: 'CUDA guide', beyond: 'beyond the glossary' };
  const PARTS = {
    hbm: { name: 'GPU RAM', tag: 'HBM3 DRAM stack', term: 'gpu-ram', tone: 'memory',
      html: `Stacks of DRAM dies next to the GPU die, on the same silicon interposer. DRAM is denser but slower than the SRAM of ${T('register-file', 'registers')} and ${T('l1-data-cache', 'caches')}. It holds ${T('global-memory', 'global memory')} and any ${T('registers', 'registers')} that spill out of the register file.`,
      facts: [['Capacity', '80 GiB'], ['Stacks', '5 enabled × 16 GiB', 'wp'], ['Each stack', 'a base die under stacked DRAM dies (8 drawn here)', 'beyond'], ['Bandwidth', '3.35 TB/s to the die'], ['Per stack', '1,024 data links', 'beyond']] },
    hbmOff: { name: 'Unused HBM site', tag: 'not enabled on H100 SXM5', term: 'gpu-ram', tone: 'dim',
      html: 'The full GH100 design has six HBM sites; H100 SXM5 uses five of them for its 80 GiB. Which site is left out here is illustrative.',
      facts: [['Full GH100', '6 stacks, 12 memory controllers', 'wp'], ['H100 SXM5', '5 stacks, 10 memory controllers', 'wp']] },
    dram: { name: 'DRAM die', tag: 'one layer of an HBM3 stack', term: 'gpu-ram', tone: 'memory',
      html: 'DRAM dies stack on a base die to make one 16 GiB HBM3 stack (drawn here as eight layers). Through-silicon vias carry data straight down through them.',
      facts: [['Stack', '16 GiB of the 80 GiB', 'wp']] },
    tsv: { name: 'Through-silicon vias', tag: 'TSVs · beyond the glossary', term: 'gpu-ram', tone: 'ink',
      html: 'Vertical wires that pass through the stacked DRAM dies, so every layer reaches the base die directly.' },
    l2: { name: 'L2 cache', tag: 'no glossary entry of its own', tone: 'memory', rel: ['performance-bottleneck', 'Performance Bottleneck'],
      html: 'On-die SRAM shared by every SM. Traffic between the SMs and GPU RAM passes through it. It is partitioned: NVIDIA’s diagram draws it as two halves, as here, and through a partitioned crossbar each partition caches data for the SMs in the GPCs directly connected to it. The glossary mentions it once, in a bottleneck story: NVIDIA once gained 4% end to end by moving power from the L2 cache to the SMs.',
      facts: [['H100 SXM5', '50 MiB (NVIDIA: “50 MB”)', 'wp'], ['Full GH100', '60 MiB (NVIDIA: “60 MB”)', 'wp'], ['Structure', 'partitioned crossbar; 2 halves in NVIDIA’s diagram', 'wp']] },
    mc: { name: 'Memory controllers', tag: 'no glossary entry', tone: 'memory', rel: ['gpu-ram', 'GPU RAM'],
      html: 'Along the die edges that face the HBM stacks, they turn memory requests from the L2 cache into DRAM commands. Two 512-bit controllers drive each stack’s 1,024 data links.',
      facts: [['Enabled', '10 of 12 on H100 SXM5', 'wp'], ['Width', '512 bits each', 'wp']] },
    die: { name: 'GH100-class die', tag: 'floorplan illustrative', tone: 'core', rel: ['streaming-multiprocessor', 'Streaming Multiprocessor'],
      html: '8 GPCs × 9 TPCs × 2 SMs = 144 SMs around a central L2 cache, with memory controllers on the edges that face the HBM stacks, the PCIe host interface and GigaThread Engine on top and NVLink at the bottom, as in NVIDIA’s block diagram.',
      facts: [['Enabled SMs', '132 of 144 (H100 SXM5)'], ['Real GH100', '814 mm², 80 billion transistors', 'wp']] },
    gpc: { name: 'GPC', tag: 'Graphics/GPU Processing Cluster', term: 'graphics-processing-cluster', tone: 'ink',
      html: `A group of ${T('texture-processing-cluster', 'TPCs')} plus, in the glossary’s general definition, a raster engine for graphics. Since ${T('compute-capability', 'compute capability')} 9.0, the ${T('thread-block', 'thread blocks')} of a cluster are scheduled onto one GPC and share distributed shared memory. The 3 × 3 arrangement of TPCs here is illustrative: NVIDIA draws each GPC as one row of nine.`,
      facts: [['Full GPC', '9 TPCs = 18 SMs', 'wp'], ['Per die', '8', 'wp']] },
    tpc: { name: 'TPC', tag: 'Texture Processing Cluster', term: 'texture-processing-cluster', tone: 'ink',
      html: `A pair of adjacent ${T('streaming-multiprocessor', 'SMs')}. Blackwell’s <code>tcgen05</code> instructions can run one operation across both SMs of a TPC (<code>.cta_group::2</code>).`,
      facts: [['SMs', '2'], ['Per die', '72 (66 enabled on H100 SXM5)', 'wp']] },
    sm: { name: 'SM', tag: 'Streaming Multiprocessor', term: 'streaming-multiprocessor', tone: 'core', also: [['streaming-multiprocessor-architecture', 'SM Architecture (Hopper, SM90)']],
      html: `Roughly the GPU’s version of a CPU core: it has registers and caches, keeps up to 64 ${T('warp', 'warps')} resident and interleaves their ${T('streaming-assembler', 'instructions')}, and can switch warps every clock.`,
      facts: [['Per H100 SXM5', '132'], ['Resident threads', '2,048 per SM']] },
    fused: { name: 'Fused-off TPC', tag: 'disabled on H100 SXM5', term: 'texture-processing-cluster', tone: 'dim',
      html: 'The die has 144 SMs, but H100 SXM5 ships with 132 enabled: 6 TPCs are switched off. Shipping chips with some units disabled is common practice; it lets dies with a few manufacturing defects still be used. Which TPCs are off varies from chip to chip and NVIDIA does not publish it, so the dim tiles here are illustrative.',
      facts: [['H100 SXM5', '66 of 72 TPCs enabled', 'wp']] },
    raster: { name: 'Raster engine', tag: 'generic GPC part · not in NVIDIA’s GH100 diagram', tone: 'ink', rel: ['graphics-processing-cluster', 'GPC'],
      html: 'Fixed-function graphics hardware, part of the glossary’s general definition of a GPC: “Apparently, some people use NVIDIA GPUs for graphics, for which the raster engine is important.” H100 itself is built for compute: NVIDIA’s whitepaper says only two of its TPCs are graphics-capable, and its GH100 diagram draws no raster engines. The GPC structure is inherited from graphics GPUs; this small block stands for the generic definition.',
      facts: [['Graphics-capable TPCs', '2 per H100 GPU', 'wp']] },
    giga: { name: 'GigaThread Engine', tag: 'with MIG control · no glossary entry', tone: 'control', rel: ['thread-block', 'Thread Block'],
      html: `NVIDIA’s global work distributor: it hands the ${T('thread-block', 'thread blocks')} of a ${T('kernel', 'kernel')} out to the GPCs and SMs. On H100 the same block, as NVIDIA labels it, also carries the controls for Multi-Instance GPU (MIG), which splits one GPU into isolated smaller ones.`,
      facts: [['Placement', 'under the PCIe interface', 'wp']] },
    hub: { name: 'High-Speed Hub', tag: 'no glossary entry', tone: 'ink',
      html: 'The block NVIDIA’s GH100 diagram draws just above the 18 NVLink ports. The diagram names it without describing it further.' },
    interposer: { name: 'Silicon interposer', tag: 'no glossary entry', tone: 'ink', rel: ['gpu-ram', 'GPU RAM'],
      html: `A slab of silicon wiring under the die and the HBM stacks. Sharing it puts ${T('gpu-ram', 'GPU RAM')} millimetres from the SMs, for lower latency and higher ${T('memory-bandwidth', 'bandwidth')} than memory on the board.`,
      facts: [['Links', '1,024 per HBM stack', 'beyond']] },
    substrate: { name: 'Package substrate', tag: 'no glossary entry', tone: 'ink', rel: ['gpu-ram', 'GPU RAM'],
      html: 'Carries power and signals such as PCI Express between the board and the interposer, through bumps above it and solder balls below it.' },
    cap: { name: 'Capacitors', tag: 'no glossary entry', tone: 'ink',
      html: 'Small decoupling capacitors that steady the supply voltage when thousands of units switch at once.' },
    io: { name: 'Host interface', tag: 'PCI Express 5.0', tone: 'ink', rel: ['cuda-software-platform', 'CUDA Software Platform'],
      html: 'Where work and data arrive from the host CPU, over PCI Express 5.0.' },
    nvlink: { name: 'NVLink', tag: 'fourth generation · no glossary entry', tone: 'ink',
      html: 'NVIDIA’s links to other GPUs, for multi-GPU systems. H100 has 18 of them, drawn here as 18 ports along the bottom edge.',
      facts: [['Links', '18 (fourth generation)', 'wp'], ['Total', '900 GB/s', 'wp']] },
    l1i: { name: 'L1 instruction cache', tag: 'no glossary entry', tone: 'memory', rel: ['streaming-assembler', 'SASS'],
      html: `Holds the ${T('streaming-assembler', 'SASS')} instructions of the ${T('kernel', 'kernels')} running on this SM, for all four sub-partitions.` },
    smsp: { name: 'Sub-partition', tag: 'SMSP · one of four per SM', tone: 'ink', rel: ['warpgroup', 'Warpgroup'],
      html: `One of four identical quarters of the SM, each with its own warp scheduler, register file, cores and Tensor Core. NVIDIA’s profilers call it an SM sub-partition (SMSP). The glossary’s ${T('warpgroup', 'warpgroup')} entry calls them the SM’s four “(unnamed) subunits”, and points to them when it discusses why a warpgroup’s four ${T('warp', 'warps')} must start at a warp-rank that is a multiple of 4.`,
      facts: [['Issue', '1 warp instruction / clock'], ['Warp slots', '16 (64 per SM ÷ 4)'], ['Per SM', '4']] },
    l0: { name: 'L0 instruction cache', tag: 'no glossary entry', tone: 'memory', rel: ['streaming-assembler', 'SASS'],
      html: 'A small instruction cache private to this sub-partition, fed from the SM’s L1 instruction cache.' },
    ws: { name: 'Warp Scheduler', tag: 'control', term: 'warp-scheduler', tone: 'control',
      html: `Every clock it picks a ${T('warp', 'warp')} whose operands are ready and issues its next instruction. Switching needs no saving or restoring, because each ${T('thread', 'thread')} keeps its own registers.`,
      facts: [['Throughput', '32 threads / clock'], ['Per SM', '4']] },
    du: { name: 'Dispatch Unit', tag: 'control', term: 'warp-scheduler', tone: 'control',
      html: 'Sends the instruction the warp scheduler picked to the right pipe: CUDA Cores, Tensor Core, LD/ST or SFU.',
      facts: [['Throughput', '32 threads / clock']] },
    rf: { name: 'Register File', tag: 'memory · SRAM', term: 'register-file', tone: 'memory',
      html: `The fastest storage on the chip, about an order of magnitude faster than L1. Its 32-bit registers are split among the resident ${T('thread', 'threads')}; using too many per thread lowers ${T('occupancy', 'occupancy')}.`,
      facts: [['Here', '16,384 × 32-bit = 64 KiB'], ['Per SM', '65,536 = 256 KiB']] },
    int32: { name: 'INT32 units', tag: 'CUDA Cores', term: 'cuda-core', tone: 'core', also: [['core', 'GPU Core']],
      html: '32-bit integer lanes: address arithmetic, loop counters, bit manipulation. A warp’s 32 threads all get the same instruction, so on these 16 lanes one warp instruction takes 2 clocks.',
      facts: [['Here', '16'], ['Per SM', '64'], ['Integer add', '64 results / clock per SM', 'cuda']] },
    fp32: { name: 'FP32 units', tag: 'CUDA Cores', term: 'cuda-core', tone: 'core', also: [['core', 'GPU Core']],
      html: 'The “FP32 CUDA Cores” that NVIDIA counts: 128 per SM, twice the number of INT32 or FP64 units. They run single-precision math like fused multiply-add, a whole warp per clock. NVIDIA’s CUDA Core count covers only these; the glossary’s CUDA Cores also include the INT32 and FP64 units.',
      facts: [['Here', '32'], ['Per H100 SXM5', '16,896'], ['FP32 FMA', '128 results / clock per SM', 'cuda']] },
    fp64: { name: 'FP64 units', tag: 'CUDA Cores', term: 'cuda-core', tone: 'core', also: [['core', 'GPU Core']],
      html: 'Double-precision lanes, used more by scientific computing than by neural networks. With 16 lanes, one warp instruction takes 2 clocks.',
      facts: [['Here', '16'], ['Per SM', '64'], ['FP64 FMA', '64 results / clock per SM', 'cuda']] },
    tc: { name: 'Tensor Core', tag: '4th generation', term: 'tensor-core', tone: 'core', also: [['warpgroup', 'Warpgroup'], ['core', 'GPU Core']],
      html: `One instruction computes D = AB + C on small matrices: <code>HMMA16.16816.F32</code> does 16 × 8 × 16 = 2,048 multiply-accumulates for one warp. Tensor Cores are the only route to the GPU’s peak arithmetic throughput. On H100, reaching that peak takes ${T('parallel-thread-execution', 'PTX')} intrinsics such as the warpgroup-level <code>wgmma.mma_async</code>, issued by four warps together, rather than the per-warp HMMA shown here.`,
      facts: [['Here', '1'], ['Per H100 SXM5', '528', 'wp'], ['One HMMA.16816', '4,096 FLOPs ≈ 4 clocks, even at peak (989 TFLOPS ÷ 528 ÷ 1.98 GHz ≈ 950 per clock)', 'beyond']] },
    ldst: { name: 'Load/Store Units', tag: 'LSU', term: 'load-store-unit', tone: 'special',
      html: `Dispatch loads and stores to the SM’s ${T('l1-data-cache', 'L1 data cache')} and, through it, to ${T('gpu-ram', 'GPU RAM')}.`,
      facts: [['Here', '8'], ['Per SM', '32']] },
    sfu: { name: 'Special Function Unit', tag: 'SFU', term: 'special-function-unit', tone: 'special',
      html: 'Transcendental math like <code>exp</code>, <code>sin</code> and <code>cos</code>. Its SASS instructions start with <code>MUFU</code>, as in <code>MUFU.EX2</code>. NVIDIA’s diagram draws one SFU block per sub-partition, but it delivers only a few results per clock, so one warp instruction takes several clocks.',
      facts: [['Throughput', '16 results / clock per SM', 'cuda'], ['Per sub-partition', '4 / clock: a warp takes 8 clocks', 'cuda']] },
    tma: { name: 'Tensor Memory Accelerator', tag: 'TMA', term: 'tensor-memory-accelerator', tone: 'special',
      html: `Copies multi-dimensional tiles from ${T('global-memory', 'global memory')} into ${T('shared-memory', 'shared memory')} asynchronously, bypassing the registers, so one thread can start a big copy and get back to work.`,
      facts: [['Per SM', '1, shared by the four sub-partitions']] },
    l1d: { name: 'L1 Data Cache', tag: 'and shared memory', term: 'l1-data-cache', tone: 'memory',
      html: `The SM’s private SRAM, mostly programmer-managed as ${T('shared-memory', 'shared memory')} and split among the ${T('thread-block', 'thread blocks')} on this SM. The LD/ST units and the TMA read and write it.`,
      facts: [['Per SM', '256 KiB'], ['As shared memory', 'up to 228 KiB (NVIDIA: “228 KB”)', 'wp'], ['Across 132 SMs', '33 MiB']] },
    tex: { name: 'Texture units', tag: 'no glossary entry', tone: 'ink',
      html: 'Hardware for sampling textures, used mostly for graphics.' },
  };

  // lanes: units per sub-partition = results per clock per SM (CUDA guide, compute capability 9.0) ÷ 4.
  // clk: clocks one warp instruction keeps its pipe busy (32 threads ÷ lanes). The Tensor Core's HMMA.16816 is
  // 16 × 8 × 16 × 2 = 4,096 FLOPs, and at the 989 TFLOPS peak one of the 528 Tensor Cores does
  // 989e12 ÷ 528 ÷ 1.98e9 ≈ 950 FLOPs per clock, so about 4 clocks. LD/ST occupancy is not modelled (clk 1, and
  // the issue line states no duration for it).
  const PIPES = [
    { part: 'fp32', w: 0.32, op: 'FFMA', to: 'the 32 FP32 units', nm: 'FP32 units', what: 'fused multiply-add, single precision', short: 'single-precision FMA', tone: 'core', lanes: 32, clk: 1 },
    { part: 'int32', w: 0.14, op: 'IADD3', to: 'the 16 INT32 units', nm: 'INT32 units', what: 'integer add', tone: 'core', lanes: 16, clk: 2 },
    { part: 'tc', w: 0.2, op: 'HMMA', to: 'the Tensor Core', nm: 'Tensor Core', what: 'a 16 × 8 × 16 matrix multiply-accumulate for the warp', short: '16 × 8 × 16 matrix multiply-accumulate', tone: 'core', clk: 4,
      dur: '4,096 FLOPs ÷ ≈ 950 per clock at peak ≈ 4 clocks' },
    { part: 'ldst', w: 0.2, op: 'LDS', to: 'the 8 LD/ST units', nm: 'LD/ST units', what: 'load from shared memory', tone: 'special', clk: 1 },
    { part: 'sfu', w: 0.08, op: 'MUFU.EX2', to: 'the SFU', nm: 'SFU', what: '2 to the power x', tone: 'special', lanes: 4, clk: 8 },
    { part: 'fp64', w: 0.06, op: 'DFMA', to: 'the 16 FP64 units', nm: 'FP64 units', what: 'fused multiply-add, double precision', short: 'double-precision FMA', tone: 'core', lanes: 16, clk: 2 },
  ];
  PIPES.forEach((p) => { if (p.lanes) p.dur = `32 threads ÷ ${p.lanes} lanes = ${32 / p.lanes} clock${p.lanes === 32 ? '' : 's'}`; });

  const TOUR = [
    { level: 0, ex: true, html: `<b>The package, exploded.</b> At the bottom, the package substrate; above it, a silicon interposer carrying the GH100-class die and six HBM3 sites. Five are enabled: 80 GiB of ${T('gpu-ram', 'GPU RAM')}.` },
    { level: 0, ex: false, html: `<b>Assembled, it is only millimetres tall.</b> The blue packets are data: out of the HBM stacks, across the interposer, through the L2 cache and into the ${T('streaming-multiprocessor', 'SMs')}, at up to 3.35 TB/s.` },
    { level: 1, ex: true, html: `<b>The die is eight GPCs.</b> Each ${T('graphics-processing-cluster', 'GPC')} on the full die holds nine ${T('texture-processing-cluster', 'TPCs')}. A cluster of ${T('thread-block', 'thread blocks')} is scheduled onto one GPC.` },
    { level: 2, html: `<b>A TPC is two adjacent SMs.</b> Before Blackwell it maps onto nothing in the ${T('cuda-programming-model', 'programming model')}; Blackwell’s Tensor Cores can run one instruction across both SMs of a TPC.` },
    { level: 3, ex: true, html: `<b>The SM does the work.</b> Four sub-partitions share a 256 KiB ${T('l1-data-cache', 'L1 data cache / shared memory')} and a ${T('tensor-memory-accelerator', 'TMA')}, and keep up to 64 ${T('warp', 'warps')} resident.` },
    { level: 4, html: `<b>One warp instruction per clock.</b> In the warp strip, the ${T('warp-scheduler', 'warp scheduler')} picks one eligible warp (pink); then the dispatch unit, the register file and the pipe it feeds light up in turn: ${T('cuda-core', 'CUDA Cores')}, the ${T('tensor-core', 'Tensor Core')}, ${T('load-store-unit', 'LD/ST')} or the ${T('special-function-unit', 'SFU')}.` },
    { level: 0, ex: true, html: `<b>From package to pipe.</b> Every labelled part opens a card, linked to its glossary entry where there is one, and a label marked › zooms one level deeper. The glossary itself starts just below, with the ${T('readme', 'README')}.` },
  ];

  /* ═════════════════════════════ small helpers ═════════════════════════════ */
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  function rng(seed) { let s = seed >>> 0; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
  const fmtInt = (n) => GG.fmt.int(n);

  function decorate(root) {
    root.querySelectorAll('a[data-term]').forEach((a) => {
      const id = a.getAttribute('data-term');
      const t = GG.byId && GG.byId[id];
      if (!t) return;
      a.setAttribute('href', '#' + id);
      a.classList.add('term');
      a.style.setProperty('--c', (GG.SECTIONS[t.section] || GG.SECTIONS.intro).color);
    });
  }

  function webglOK() {
    try {
      const c = document.createElement('canvas');
      return !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch (e) { return false; }
  }

  /* ═════════════════════════════ boot ═════════════════════════════ */
  (GG.onStart || GG.onBoot)(function () {
    const hero = document.getElementById('top');
    if (!hero) return;
    const fb = document.getElementById('hero-fallback');
    const forced = /[?&]hero=fallback\b/.test(location.search);
    let ok = false;
    if (!forced && window.THREE && THREE.WebGLRenderer && webglOK()) {
      try { createApp(hero, fb); ok = true; holdFallbackTitle(fb); } catch (e) {
        console.error('[hero] 3D view failed, showing the static fallback', e);
        hero.classList.remove('hero-on');
        hero.querySelectorAll(':scope > :not(#hero-fallback)').forEach((n) => n.remove());
      }
    }
    if (!ok) buildFallback(hero, fb);
    // "Browse the chapters": open the contents drawer where there is one; on wide screens the link scrolls to
    // the first chapter, next to the always-visible contents sidebar
    hero.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('[data-toc]');
      const tb = document.getElementById('toc-btn');
      if (!a || !tb || !tb.offsetParent) return;
      e.preventDefault(); e.stopPropagation();
      document.body.classList.add('toc-open');
      const first = document.querySelector('.toc a');
      if (first) first.focus({ preventScroll: true });
    });
  });

  /* ═════════════════════════════ DOM ═════════════════════════════ */
  function buildDOM(hero) {
    const intro = GG.el('header', { class: 'hero-intro' });
    intro.innerHTML = `<div class="hero-kicker">An illustrated companion to Modal’s GPU Glossary</div>
      <h1 class="hero-title">Warp <span>&amp;</span> <br>Weft</h1>
      <p class="hero-sub">Take an H100-class GPU apart, down to a single warp scheduler, then read the whole glossary drawn out and made to move.</p>
      <div class="hero-ctas"><a class="hero-cta primary" href="#readme">Start reading<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M3.5 8.5L8 13l4.5-4.5"/></svg></a><a class="hero-cta" href="#device-hardware" data-toc>Browse the chapters</a></div>`;

    const ctl = GG.el('div', { class: 'hero-ctl hero-glass', role: 'group', 'aria-label': 'Model controls' });
    ctl.innerHTML = `<div class="hero-ctl-h"><span class="ctl-lab">Zoom level</span><span class="hero-sp"></span></div>`;

    const stage = GG.el('div', { class: 'hero-stage' });
    const canvas = GG.el('canvas', { class: 'hero-canvas', tabindex: '0', role: 'application', 'aria-roledescription': '3D model', 'data-keys': '' });
    const labels = GG.el('div', { class: 'hero-labels', role: 'group', 'aria-label': 'Labelled parts' });
    stage.append(canvas, labels);

    const read = GG.el('div', { class: 'hero-read hero-glass' });
    read.innerHTML = `<div class="hero-read-h"><span class="hero-vnum">View <b>01</b> / 05</span><nav class="hero-crumbs" aria-label="Where you are in the chip"></nav></div>
      <div class="hero-lvl"><strong></strong><span></span></div>
      <div class="hero-chips" aria-label="Key numbers for this view"></div>
      <p class="hero-why" aria-live="polite"></p>
      <div class="hero-tick" aria-hidden="true"></div>
      <div class="hero-slots" hidden aria-hidden="true"></div>
      <div class="hero-rmstep" hidden></div>
      <div class="hero-tour" hidden><output>Tour 1 / 7</output></div>`;

    const foot = GG.el('div', { class: 'hero-foot' });
    foot.innerHTML = `<ul class="hero-legend" aria-label="Colour key">
        <li style="--c:var(--core)">Cores</li><li style="--c:var(--special)">Other units: LSU, SFU, TMA</li><li style="--c:var(--control)">Scheduling</li><li style="--c:var(--memory)">Memory</li></ul>
      <div class="hero-foot-row"><button type="button" class="hero-partsbtn" aria-expanded="false" aria-controls="hero-partspop">Parts in this view <b>0</b></button><p class="hero-hint"></p></div>`;
    foot.insertAdjacentHTML('beforeend', '<div class="hero-partspop" id="hero-partspop" role="group" aria-label="Parts in this view" hidden></div>');

    const tip = GG.el('div', { class: 'hero-tip', 'aria-hidden': 'true' });
    const card = GG.el('div', { class: 'hero-card hero-glass', role: 'dialog', 'aria-label': 'Part details', hidden: true });
    const toast = GG.el('div', { class: 'hero-toast', role: 'status' });
    const shade = GG.el('div', { class: 'hero-shade', 'aria-hidden': 'true' });
    const parts = GG.el('div', { class: 'hero-parts', role: 'group', 'aria-label': 'Parts in this view' });

    const fb = hero.querySelector('#hero-fallback');
    hero.insertBefore(intro, fb);
    hero.insertBefore(ctl, fb);
    hero.insertBefore(shade, fb);
    hero.insertBefore(stage, fb);
    hero.insertBefore(parts, fb);
    hero.insertBefore(read, fb);
    hero.insertBefore(foot, fb);
    hero.insertBefore(tip, fb);
    hero.insertBefore(card, fb);
    hero.insertBefore(toast, fb);
    const q = (el, s) => el.querySelector(s);
    return {
      intro, ctl, stage, canvas, labels, read, foot, tip, card, toast, shade, parts, slots: q(read, '.hero-slots'),
      vnum: q(read, '.hero-vnum b'), crumbs: q(read, '.hero-crumbs'), lvlName: q(read, '.hero-lvl strong'), lvlSub: q(read, '.hero-lvl span'),
      chips: q(read, '.hero-chips'), why: q(read, '.hero-why'), tick: q(read, '.hero-tick'), tour: q(read, '.hero-tour'), rmstep: q(read, '.hero-rmstep'), tourOut: q(read, '.hero-tour output'),
      hint: q(foot, '.hero-hint'), partsBtn: q(foot, '.hero-partsbtn'), partsPop: q(foot, '.hero-partspop'), legend: q(foot, '.hero-legend'),
    };
  }

  /* ═════════════════════════════ the 3D app ═════════════════════════════ */
  function createApp(hero, fb) {
    const THREE = window.THREE;
    const C = GG.colors();
    const RM = GG.reducedMotion;
    const coarse = !!(window.matchMedia && matchMedia('(hover: none), (pointer: coarse)').matches);
    const lin = (hex) => new THREE.Color(hex).convertSRGBToLinear();
    const V = (x, y, z) => new THREE.Vector3(x, y, z);

    hero.classList.add('hero-on');
    const ui = buildDOM(hero);

    /* ---------- renderer, scene, camera ---------- */
    const renderer = new THREE.WebGLRenderer({ canvas: ui.canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const FOV = 28;
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.5, 900);
    const disposables = [];
    const keep = (x) => { disposables.push(x); return x; };

    // lights + a procedural environment for reflections on metal and silicon
    scene.add(new THREE.HemisphereLight(0xb8c6ff, 0x0b0c12, 0.55));
    const key = new THREE.DirectionalLight(0xfff0e0, 1.25); key.position.set(-24, 40, 26); scene.add(key);
    const rim = new THREE.DirectionalLight(0x86a8ff, 0.65); rim.position.set(30, 16, -34); scene.add(rim);
    (function env() {
      const pm = new THREE.PMREMGenerator(renderer);
      const es = new THREE.Scene();
      const box = new THREE.Mesh(new THREE.BoxGeometry(60, 60, 60), new THREE.MeshBasicMaterial({ color: 0x07080d, side: THREE.BackSide }));
      es.add(box);
      const panel = (w, h, color, x, y, z, rx, ry) => {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
        m.position.set(x, y, z); m.rotation.set(rx, ry, 0); es.add(m); return m;
      };
      const p1 = panel(30, 14, new THREE.Color(2.2, 2.1, 2.0), 0, 26, 0, Math.PI / 2, 0);
      const p2 = panel(10, 30, new THREE.Color(1.3, 0.75, 0.5), -28, 6, 4, 0, Math.PI / 2);
      const p3 = panel(10, 26, new THREE.Color(0.45, 0.65, 1.3), 28, 4, -6, 0, -Math.PI / 2);
      const rt = pm.fromScene(es, 0.035);
      scene.environment = keep(rt.texture);
      [box, p1, p2, p3].forEach((m) => { m.geometry.dispose(); m.material.dispose(); });
      pm.dispose();
    })();

    /* ---------- canvas textures ---------- */
    function canvasTex(w, h, draw, srgb) {
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      draw(c.getContext('2d'), w, h);
      const t = new THREE.CanvasTexture(c);
      if (srgb !== false) t.encoding = THREE.sRGBEncoding;
      t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      return keep(t);
    }

    const texSub = canvasTex(2048, 1424, (g, W, H) => {
      const k = W / SUB.w, X = (x) => (x + SUB.w / 2) * k, Z = (z) => (z + SUB.d / 2) * k;
      g.fillStyle = '#0d0f18'; g.fillRect(0, 0, W, H);
      g.strokeStyle = 'rgba(255,255,255,0.025)'; g.lineWidth = 1;
      for (let x = 0; x < W; x += 22) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
      for (let y = 0; y < H; y += 22) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
      const R = rng(7);
      g.lineCap = 'round'; g.lineJoin = 'round';
      for (let i = 0; i < 230; i++) {
        const side = Math.floor(R() * 4);
        let x, z, dx, dz;
        if (side === 0) { x = -INT.w / 2 + R() * INT.w; z = -INT.d / 2 - 0.3; dx = 0; dz = -1; }
        else if (side === 1) { x = -INT.w / 2 + R() * INT.w; z = INT.d / 2 + 0.3; dx = 0; dz = 1; }
        else if (side === 2) { x = -INT.w / 2 - 0.3; z = -INT.d / 2 + R() * INT.d; dx = -1; dz = 0; }
        else { x = INT.w / 2 + 0.3; z = -INT.d / 2 + R() * INT.d; dx = 1; dz = 0; }
        const a = 0.18 + R() * 0.3;
        g.strokeStyle = `rgba(214,128,86,${a.toFixed(3)})`;
        g.lineWidth = R() < 0.15 ? 3 : 1.4;
        g.beginPath(); g.moveTo(X(x), Z(z));
        const l1 = 0.6 + R() * 1.6; x += dx * l1; z += dz * l1; g.lineTo(X(x), Z(z));
        const turn = R() < 0.5 ? -1 : 1, l2 = 0.4 + R() * 1.4;
        x += (dx + (dz ? turn : 0)) * l2 * 0.7; z += (dz + (dx ? turn : 0)) * l2 * 0.7; g.lineTo(X(x), Z(z));
        const l3 = 0.4 + R() * 2.2; x += dx * l3; z += dz * l3; g.lineTo(X(x), Z(z));
        g.stroke();
        g.fillStyle = `rgba(230,150,105,${(a + 0.15).toFixed(3)})`;
        g.beginPath(); g.arc(X(x), Z(z), 3.2, 0, Math.PI * 2); g.fill();
      }
      g.strokeStyle = 'rgba(214,128,86,0.35)'; g.lineWidth = 2; g.setLineDash([10, 8]);
      g.strokeRect(X(-INT.w / 2 - 0.35), Z(-INT.d / 2 - 0.35), (INT.w + 0.7) * k, (INT.d + 0.7) * k);
      g.setLineDash([]);
      g.strokeStyle = 'rgba(255,255,255,0.08)'; g.lineWidth = 3; g.strokeRect(10, 10, W - 20, H - 20);
    });

    const texInt = canvasTex(2048, 1260, (g, W, H) => {
      const k = W / INT.w, X = (x) => (x + INT.w / 2) * k, Z = (z) => (z + INT.d / 2) * k;
      const grd = g.createLinearGradient(0, 0, W, H); grd.addColorStop(0, '#1b2032'); grd.addColorStop(1, '#141828');
      g.fillStyle = grd; g.fillRect(0, 0, W, H);
      g.strokeStyle = 'rgba(160,180,255,0.05)'; g.lineWidth = 1;
      for (let x = 0; x < W; x += 28) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
      for (let y = 0; y < H; y += 28) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
      const pads = (x0, z0, x1, z1, step) => {
        g.fillStyle = 'rgba(190,200,230,0.18)';
        for (let x = x0 + step / 2; x < x1; x += step) for (let z = z0 + step / 2; z < z1; z += step) { g.beginPath(); g.arc(X(x), Z(z), 2.2, 0, Math.PI * 2); g.fill(); }
      };
      pads(-DIE.w / 2, -DIE.d / 2, DIE.w / 2, DIE.d / 2, 0.55);
      g.strokeStyle = 'rgba(190,200,230,0.22)'; g.lineWidth = 2; g.setLineDash([12, 9]);
      g.strokeRect(X(-DIE.w / 2), Z(-DIE.d / 2), DIE.w * k, DIE.d * k);
      for (let s = 0; s < 6; s++) {
        const x0 = stackX(s) - HBM.w / 2, z0 = stackZ(s) - HBM.d / 2;
        g.strokeRect(X(x0), Z(z0), HBM.w * k, HBM.d * k);
        pads(x0, z0, x0 + HBM.w, z0 + HBM.d, 0.5);
      }
      g.setLineDash([]);
      // the 1,024 data links of each stack, drawn as a bundle across the gap into the die edge
      for (let s = 0; s < 6; s++) {
        const side = s < 3 ? -1 : 1, on = s !== OFF_STACK;
        const xa = side * (HBM.x - HBM.w / 2 + 0.2), xb = side * (DIE.w / 2 - 1.6);
        for (let i = 0; i < 44; i++) {
          const z = stackZ(s) - 2.5 + (i / 43) * 5.0;
          g.strokeStyle = on ? `rgba(111,166,255,${i % 4 === 0 ? 0.55 : 0.3})` : 'rgba(150,155,180,0.12)';
          g.lineWidth = i % 4 === 0 ? 1.6 : 1.1;
          g.beginPath(); g.moveTo(X(xa), Z(z)); g.lineTo(X(xb), Z(z)); g.stroke();
        }
      }
      g.strokeStyle = 'rgba(255,255,255,0.1)'; g.lineWidth = 2; g.strokeRect(6, 6, W - 12, H - 12);
    });

    const texDie = canvasTex(1024, 931, (g, W, H) => {
      const k = W / DIE.w;
      g.fillStyle = '#10131f'; g.fillRect(0, 0, W, H);
      g.strokeStyle = 'rgba(170,185,255,0.045)'; g.lineWidth = 1;
      for (let x = 0; x < W; x += k * 0.5) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
      for (let y = 0; y < H; y += k * 0.5) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
      g.strokeStyle = 'rgba(190,200,240,0.32)'; g.lineWidth = 3; g.strokeRect(4, 4, W - 8, H - 8);
      g.strokeStyle = 'rgba(190,200,240,0.14)'; g.lineWidth = 1.5; g.strokeRect(10, 10, W - 20, H - 20);
      g.fillStyle = 'rgba(190,200,240,0.3)';
      [[16, 16], [W - 28, 16], [16, H - 28], [W - 28, H - 28]].forEach(([x, y]) => g.fillRect(x, y, 12, 12));
    });

    // one SM tile: a squeezed miniature of the SM floorplan, so the die reads as 144 repeated SMs
    const FPB = fpBlockList();
    const TONE = {
      core: C.core, int: '#38b889', fp64: '#86e6be', tc: '#63f1b6', memory: C.memory, mem2: '#5d8fe8', mem3: '#86b4ff',
      control: C.control, ctl2: '#c28e2c', special: C.special, neutral: '#8a90ab', mc: '#4c6fb8', nvl: '#6f7590', plate0: '#1a1d2c', plate1: '#262a3f', plate2: '#353c5c',
    };
    const texTile = canvasTex(512, 419, (g, W, H) => {
      g.fillStyle = '#090a10'; g.fillRect(0, 0, W, H);
      const sx = (W - 8) / 1376, sy = (H - 8) / 1824, X = (x) => 4 + (x - 12) * sx, Y = (y) => 4 + (y - 12) * sy;
      g.fillStyle = '#11131e'; g.fillRect(4, 4, W - 8, H - 8);
      for (const b of FPB) {
        if (b.part === 'smplate') continue;
        const col = TONE[b.tone];
        const x = X(b.x0), y = Y(b.y0), w = (b.x1 - b.x0) * sx, h = (b.y1 - b.y0) * sy;
        if (b.part === 'smsp') { g.fillStyle = '#1a1d2e'; g.fillRect(x, y, w, h); g.strokeStyle = 'rgba(160,170,210,0.35)'; g.lineWidth = 1; g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1); continue; }
        g.globalAlpha = 0.55; g.fillStyle = col; g.fillRect(x, y, w, h);
        g.globalAlpha = 0.95; g.strokeStyle = col; g.lineWidth = 1; g.strokeRect(x + 0.5, y + 0.5, Math.max(1, w - 1), Math.max(1, h - 1));
        g.globalAlpha = 1;
      }
      g.strokeStyle = 'rgba(69,212,155,0.8)'; g.lineWidth = 2; g.strokeRect(5, 5, W - 10, H - 10);
    });

    const texGround = canvasTex(1024, 1024, (g, W, H) => {
      g.clearRect(0, 0, W, H);
      for (let i = 0; i <= 64; i++) {
        const p = (i / 64) * W;
        g.strokeStyle = i % 8 === 0 ? 'rgba(180,195,255,0.16)' : 'rgba(180,195,255,0.07)';
        g.lineWidth = i % 8 === 0 ? 1.6 : 1;
        g.beginPath(); g.moveTo(p, 0); g.lineTo(p, H); g.stroke();
        g.beginPath(); g.moveTo(0, p); g.lineTo(W, p); g.stroke();
      }
      g.globalCompositeOperation = 'destination-in';
      const rg = g.createRadialGradient(W / 2, H / 2, W * 0.08, W / 2, H / 2, W * 0.5);
      rg.addColorStop(0, 'rgba(0,0,0,1)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = rg; g.fillRect(0, 0, W, H);
    });
    const texShadow = canvasTex(256, 256, (g, W, H) => {
      const rg = g.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 2);
      rg.addColorStop(0, 'rgba(0,0,0,0.75)'); rg.addColorStop(0.55, 'rgba(0,0,0,0.4)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = rg; g.fillRect(0, 0, W, H);
    });

    /* ---------- text atlas for decals printed on the parts ---------- */
    const atlas = (function () {
      const W = 2048, H = 2048, PAD = 6;
      const cvs = document.createElement('canvas'); cvs.width = W; cvs.height = H;
      const g = cvs.getContext('2d');
      const slots = new Map();
      let x = 0, y = 0, rowH = 0;
      const font = (s, px) => (s === 'disp' ? `800 ${px}px "Big Shoulders Display", "Arial Narrow", sans-serif` : `600 ${px}px "JetBrains Mono", ui-monospace, Menlo, monospace`);
      const tex = keep(new THREE.CanvasTexture(cvs));
      tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      function slot(text, style) {
        style = style || 'mono';
        const k = style + '|' + text;
        if (slots.has(k)) return slots.get(k);
        const px = style === 'disp' ? 96 : 44;
        const lines = text.split('\n');
        const longest = Math.max(...lines.map((l) => l.length));
        const w = Math.ceil(longest * px * (style === 'disp' ? 0.47 : 0.62) + px * 0.5);
        const h = Math.ceil(lines.length * px * 1.2 + px * 0.25);
        if (x + w > W) { x = 0; y += rowH + PAD; rowH = 0; }
        const s = { px, lines, style, x, y, w, h, aspect: w / h, rect: [x / W, 1 - (y + h) / H, (x + w) / W, 1 - y / H] };
        x += w + PAD; rowH = Math.max(rowH, h);
        slots.set(k, s);
        return s;
      }
      function draw() {
        g.clearRect(0, 0, W, H);
        g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
        for (const s of slots.values()) {
          g.font = font(s.style, s.px);
          const lh = s.px * 1.2, maxW = s.w - s.px * 0.35;
          s.lines.forEach((ln, i) => {
            const cy = s.y + s.h / 2 + (i - (s.lines.length - 1) / 2) * lh;
            const mw = g.measureText(ln).width;
            g.save(); g.translate(s.x + s.w / 2, cy);
            if (mw > maxW) g.scale(maxW / mw, 1);
            g.fillText(ln, 0, 0);
            g.restore();
          });
        }
        tex.needsUpdate = true;
      }
      return { slot, draw, tex };
    })();

    /* ---------- materials ---------- */
    // Blocks: lit boxes with crisp screen-space edge lines and a soft glow on top faces, tinted per instance.
    function blockMat(o) {
      const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: o.rough != null ? o.rough : 0.5, metalness: o.metal != null ? o.metal : 0.18, map: o.map || null, envMapIntensity: o.env != null ? o.env : 0.7 });
      const U = { uEdge: { value: o.edge != null ? o.edge : 1.0 }, uFill: { value: o.fill != null ? o.fill : 0.22 }, uBody: { value: o.body != null ? o.body : 0.55 },
        uGlowCol: { value: o.glow ? lin(o.glow) : new THREE.Color(1, 1, 1) }, uGlowMix: { value: o.glow ? 1 : 0 }, uEdgeCol: { value: o.edgeCol ? lin(o.edgeCol) : new THREE.Color(0, 0, 0) }, uEdgeMix: { value: o.edgeCol ? 1 : 0 } };
      m.userData.u = U;
      m.onBeforeCompile = (sh) => {
        Object.assign(sh.uniforms, U);
        sh.vertexShader = sh.vertexShader
          .replace('#include <common>', `#include <common>
varying vec3 vBoxP; varying vec3 vBoxS; varying vec3 vObjN; varying float vGlow; varying float vFocus;
#ifdef USE_INSTANCING
attribute float aGlow; attribute float aFocus;
#endif`)
          .replace('#include <begin_vertex>', `#include <begin_vertex>
mat4 bxm = modelMatrix;
#ifdef USE_INSTANCING
bxm = modelMatrix * instanceMatrix;
vGlow = aGlow; vFocus = aFocus;
#else
vGlow = 0.0; vFocus = 1.0;
#endif
vBoxS = vec3(length(bxm[0].xyz), length(bxm[1].xyz), length(bxm[2].xyz));
vBoxP = position * vBoxS;
vObjN = normal;`);
        sh.fragmentShader = sh.fragmentShader
          .replace('#include <common>', `#include <common>
uniform float uEdge; uniform float uFill; uniform float uBody; uniform vec3 uGlowCol; uniform float uGlowMix; uniform vec3 uEdgeCol; uniform float uEdgeMix;
varying vec3 vBoxP; varying vec3 vBoxS; varying vec3 vObjN; varying float vGlow; varying float vFocus;`)
          .replace('gl_FragColor = vec4( outgoingLight, diffuseColor.a );', 'gl_FragColor = vec4( outgoingLight * vFocus, diffuseColor.a );')
          .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
vec3 bxd = 0.5 * vBoxS - abs(vBoxP);
float bxMin = min(bxd.x, min(bxd.y, bxd.z));
float bxMax = max(bxd.x, max(bxd.y, bxd.z));
float bxMid = bxd.x + bxd.y + bxd.z - bxMin - bxMax;
float bxW = max(fwidth(bxMid), 1e-5);
float bxEdge = 1.0 - smoothstep(bxW * 0.55, bxW * 1.7, bxMid);
float bxTop = smoothstep(0.5, 0.95, vObjN.y);
vec3 bxTint = diffuseColor.rgb;
vec3 bxEdgeTint = mix(bxTint, uEdgeCol * max(max(bxTint.r, bxTint.g), bxTint.b), uEdgeMix);
totalEmissiveRadiance += bxEdgeTint * bxEdge * uEdge + bxTint * bxTop * uFill + mix(bxTint * 1.6, uGlowCol, uGlowMix) * vGlow;
diffuseColor.rgb *= uBody;`);
      };
      m.customProgramCacheKey = () => 'ww-block-' + (o.key || '');
      return keep(m);
    }
    const matBlock = blockMat({ key: 'b', edge: 1.05, fill: 0.2, body: 0.55 });
    const matTile = blockMat({ key: 't', map: texTile, edge: 0.55, fill: 0.55, body: 0.85, glow: C.core, rough: 0.42, metal: 0.25, edgeCol: C.core });
    const matPlain = (hex, rough, metal, map, env) => keep(new THREE.MeshStandardMaterial({ color: lin(hex), roughness: rough, metalness: metal, map: map || null, envMapIntensity: env != null ? env : 0.8 }));
    const PKG_MATS = [];
    const pkgMat = (hex, rough, metal, map, env) => { const m = matPlain(hex, rough, metal, map, env); m.userData.base = m.color.clone(); m.userData.env = m.envMapIntensity; PKG_MATS.push(m); return m; };

    const decalMat = () => keep(new THREE.ShaderMaterial({
      uniforms: { map: { value: atlas.tex }, uOpacity: { value: 1 } },
      vertexShader: `attribute vec4 aRect; attribute vec4 aColor; varying vec2 vUv; varying vec4 vCol;
void main() { vUv = mix(aRect.xy, aRect.zw, uv); vCol = aColor; gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0); }`,
      fragmentShader: `uniform sampler2D map; uniform float uOpacity; varying vec2 vUv; varying vec4 vCol;
void main() { float a = texture2D(map, vUv).a * vCol.a * uOpacity; if (a < 0.02) discard; gl_FragColor = vec4(vCol.rgb, a);
#include <encodings_fragment>
}`,
      transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4,
    }));

    /* ---------- instanced collections ---------- */
    const _m4 = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _c = new THREE.Color();
    const QI = new THREE.Quaternion();
    const UP = new THREE.Vector3(0, 1, 0), XA = new THREE.Vector3(1, 0, 0);
    function Coll(count, mat, opts) {
      const geo = keep(opts && opts.geo ? opts.geo : new THREE.BoxGeometry(1, 1, 1));
      const glow = new THREE.InstancedBufferAttribute(new Float32Array(count), 1);
      glow.setUsage(THREE.DynamicDrawUsage);
      geo.setAttribute('aGlow', glow);
      const foc = new THREE.InstancedBufferAttribute(new Float32Array(count).fill(1), 1);
      foc.setUsage(THREE.DynamicDrawUsage);
      geo.setAttribute('aFocus', foc);
      const mesh = new THREE.InstancedMesh(geo, mat, count);
      mesh.frustumCulled = false;
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3);
      mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
      const c = { mesh, geo, glow, foc, n: count, base: [], focus: new Float32Array(count).fill(1), focusT: new Float32Array(count).fill(1), hot: new Float32Array(count), hotT: new Float32Array(count), items: [] };
      return c;
    }
    function setBox(coll, i, x, y0, z, w, h, d, rotY) {
      _p.set(x, y0 + h / 2, z);
      if (rotY) _q.setFromAxisAngle(UP, rotY); else _q.copy(QI);
      _s.set(Math.max(1e-4, w), Math.max(1e-4, h), Math.max(1e-4, d));
      _m4.compose(_p, _q, _s);
      coll.mesh.setMatrixAt(i, _m4);
    }
    // ease focus/hover values; write colours. Returns true while still moving.
    function paintColl(coll, dt, instant) {
      let moving = false;
      const arr = coll.mesh.instanceColor.array, fa = coll.foc.array;
      for (let i = 0; i < coll.n; i++) {
        let f = coll.focus[i], h = coll.hot[i];
        const ft = coll.focusT[i], ht = coll.hotT[i];
        if (instant) { f = ft; h = ht; }
        else {
          if (Math.abs(f - ft) > 0.002) { f = damp(f, ft, 7, dt); moving = true; } else f = ft;
          if (Math.abs(h - ht) > 0.002) { h = damp(h, ht, 12, dt); moving = true; } else h = ht;
        }
        coll.focus[i] = f; coll.hot[i] = h;
        const b = coll.base[i], k = 1 + h * 0.65;
        arr[i * 3] = b.r * k; arr[i * 3 + 1] = b.g * k; arr[i * 3 + 2] = b.b * k;
        fa[i] = f;
      }
      coll.mesh.instanceColor.needsUpdate = true; coll.foc.needsUpdate = true;
      return moving;
    }

    function Decals(count) {
      const geo = keep(new THREE.PlaneGeometry(1, 1)); geo.rotateX(-Math.PI / 2);
      const aRect = new THREE.InstancedBufferAttribute(new Float32Array(count * 4), 4);
      const aColor = new THREE.InstancedBufferAttribute(new Float32Array(count * 4), 4);
      aColor.setUsage(THREE.DynamicDrawUsage);
      geo.setAttribute('aRect', aRect); geo.setAttribute('aColor', aColor);
      const mat = decalMat();
      const mesh = new THREE.InstancedMesh(geo, mat, count);
      mesh.frustumCulled = false; mesh.renderOrder = 3;
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      return { mesh, geo, mat, aRect, aColor, items: [], n: count, baseA: new Float32Array(count) };
    }
    // fit text of slot s into a w × d area (text runs along x unless rot), return world size
    function fitText(s, w, d, maxH, rot) {
      const along = rot ? d : w, across = rot ? w : d;
      const hgt = Math.min(maxH, across * (s.lines.length > 1 ? 0.8 : 0.62), (along * 0.9) / s.aspect);
      return [hgt * s.aspect, hgt];
    }
    function setDecal(D, i, x, y, z, tw, th, rot) {
      _p.set(x, y, z);
      if (rot) _q.setFromAxisAngle(UP, rot * Math.PI / 2); else _q.copy(QI);
      _s.set(tw, 1, th);
      _m4.compose(_p, _q, _s);
      D.mesh.setMatrixAt(i, _m4);
    }
    function initDecal(D, i, s, col, a) {
      D.aRect.setXYZW(i, s.rect[0], s.rect[1], s.rect[2], s.rect[3]);
      const c = lin(col);
      D.aColor.setXYZW(i, c.r, c.g, c.b, a);
      D.baseA[i] = a;
    }

    /* ---------- package: substrate, interposer, die slab ---------- */
    const pkg = new THREE.Group(); scene.add(pkg);
    const boxGeo = keep(new THREE.BoxGeometry(1, 1, 1));
    const mSubTop = pkgMat('#ffffff', 0.62, 0.3, texSub, 0.6), mSubSide = pkgMat('#151826', 0.7, 0.2, null, 0.5), mSubBot = pkgMat('#0b0c12', 0.9, 0.1, null, 0.3);
    const substrate = new THREE.Mesh(boxGeo, [mSubSide, mSubSide, mSubTop, mSubBot, mSubSide, mSubSide]);
    substrate.scale.set(SUB.w, SUB.t, SUB.d); substrate.position.y = SUB.t / 2; substrate.userData.part = 'substrate';
    pkg.add(substrate);
    const mIntTop = pkgMat('#ffffff', 0.3, 0.55, texInt, 1.0), mIntSide = pkgMat('#2a3048', 0.28, 0.65, null, 1.0);
    const interposer = new THREE.Mesh(boxGeo, [mIntSide, mIntSide, mIntTop, mIntSide, mIntSide, mIntSide]);
    interposer.scale.set(INT.w, INT.t, INT.d); interposer.userData.part = 'interposer';
    pkg.add(interposer);
    const mDieTop = pkgMat('#ffffff', 0.32, 0.5, texDie, 0.9), mDieSide = pkgMat('#262b40', 0.25, 0.7, null, 1.0);
    const dieSlab = new THREE.Mesh(boxGeo, [mDieSide, mDieSide, mDieTop, mDieSide, mDieSide, mDieSide]);
    dieSlab.scale.set(DIE.w, DIE.t, DIE.d); dieSlab.userData.part = 'die';
    pkg.add(dieSlab);

    const ground = new THREE.Mesh(keep(new THREE.PlaneGeometry(170, 170)), keep(new THREE.MeshBasicMaterial({ map: texGround, transparent: true, depthWrite: false, opacity: 0.9 })));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -2.45; ground.renderOrder = -2; scene.add(ground);
    const shadow = new THREE.Mesh(keep(new THREE.PlaneGeometry(66, 48)), keep(new THREE.MeshBasicMaterial({ map: texShadow, transparent: true, depthWrite: false })));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = -2.4; shadow.renderOrder = -1; scene.add(shadow);

    /* ---------- die floorplan blocks + SM tiles ---------- */
    const DB = dieBlockList();
    const dieColl = Coll(DB.length, matBlock);
    DB.forEach((b, i) => {
      let col = lin(TONE[b.tone]);
      if (b.part === 'mc' && b.stack === OFF_STACK) col.multiplyScalar(0.3);
      dieColl.base[i] = col;
      dieColl.items[i] = b;
    });
    pkg.add(dieColl.mesh);

    const tiles = Coll(144, matTile, { geo: (function () {
      const g = new THREE.BoxGeometry(1, 1, 1);
      const uv = g.attributes.uv;
      for (let v = 0; v < uv.count; v++) if (v < 8 || v > 11) uv.setXY(v, 0.003, 0.003);
      return g;
    })() });
    SMR.forEach((r, i) => { tiles.base[i] = r.on ? new THREE.Color(1, 1, 1) : new THREE.Color(0.2, 0.21, 0.26); tiles.items[i] = r; });
    pkg.add(tiles.mesh);

    const dieDecals = Decals(DB.filter((b) => b.text).length);
    DB.forEach((b, i) => {
      if (!b.text) return;
      const s = atlas.slot(b.text);
      const j = dieDecals.items.length;
      dieDecals.items.push({ b, s, i });
      initDecal(dieDecals, j, s, b.part === 'l2' ? '#d4e3ff' : b.part === 'giga' ? '#1a1405' : '#c9cde0', b.part === 'mc' && b.stack === OFF_STACK ? 0.3 : b.part === 'giga' ? 0.9 : 0.82);
    });
    pkg.add(dieDecals.mesh);

    /* ---------- HBM stacks, TSVs, capacitors ---------- */
    const CAPS = [];
    for (const sx of [-1, 1]) for (const col of [19.6, 21.2]) for (let z = -10.2; z <= 10.3; z += 1.46) CAPS.push({ x: sx * col, z, rot: 1 });
    for (const row of [-12.9, -14.5]) for (let x = -16.9; x <= 17; x += 1.3) CAPS.push({ x, z: row, rot: 0 });
    const PK = [];
    for (let s = 0; s < 6; s++) {
      PK.push({ part: s === OFF_STACK ? 'hbmOff' : 'hbm', s, k: -1 });
      for (let k = 0; k < HBM.n; k++) PK.push({ part: s === OFF_STACK ? 'hbmOff' : 'dram', s, k });
    }
    for (let s = 0; s < 6; s++) for (let j = 0; j < 8; j++) PK.push({ part: 'tsv', s, j });
    CAPS.forEach((c) => PK.push({ part: 'cap', cap: c }));
    const pkgColl = Coll(PK.length, matBlock);
    PK.forEach((b, i) => {
      let col;
      if (b.part === 'hbm') col = lin('#39507e');
      else if (b.part === 'dram') col = lin(b.k % 2 ? '#6c9ff8' : '#5e92ee');
      else if (b.part === 'hbmOff') col = lin('#30344a');
      else if (b.part === 'tsv') col = lin(b.s === OFF_STACK ? '#4a4e63' : '#c3c9e6');
      else col = lin('#6d7390');
      pkgColl.base[i] = col; pkgColl.items[i] = b;
    });
    pkg.add(pkgColl.mesh);

    const pkgDecals = Decals(8);
    const markA = atlas.slot('WARP & WEFT', 'disp'), markB = atlas.slot('GH100-CLASS · ILLUSTRATIVE');
    for (let s = 0; s < 6; s++) {
      const sl = atlas.slot(s === OFF_STACK ? 'HBM site\nnot enabled' : 'HBM3\n16 GiB');
      pkgDecals.items.push({ s, sl });
      initDecal(pkgDecals, s, sl, s === OFF_STACK ? '#8a8fa6' : '#dfe8ff', s === OFF_STACK ? 0.55 : 0.88);
    }
    initDecal(pkgDecals, 6, markA, '#b9bdd0', 0.62);
    initDecal(pkgDecals, 7, markB, '#b9bdd0', 0.62);
    pkg.add(pkgDecals.mesh);

    /* ---------- bumps and solder balls ---------- */
    const BUMPS = [];
    for (let i = 0; i < 18; i++) for (let j = 0; j < 16; j++) BUMPS.push({ t: 'ud', x: -10.2 + i * 1.2, z: -9.35 + j * 1.247, r: 0.14 });
    for (let s = 0; s < 6; s++) for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) BUMPS.push({ t: 'uh', x: stackX(s) - 2.1 + i * 1.05, z: stackZ(s) - 2.3 + j * 1.15, r: 0.13 });
    for (let i = 0; i < 20; i++) for (let j = 0; j < 12; j++) BUMPS.push({ t: 'c4', x: -17.2 + i * 1.81, z: -10.4 + j * 1.89, r: 0.27 });
    for (let i = 0; i < 20; i++) for (let j = 0; j < 14; j++) BUMPS.push({ t: 'sb', x: -21.6 + i * 2.274, z: -14.8 + j * 2.277, r: 0.42 });
    const mBump = pkgMat('#b7bdd6', 0.26, 0.92, null, 1.2);
    const bumps = new THREE.InstancedMesh(keep(new THREE.SphereGeometry(1, 10, 7)), mBump, BUMPS.length);
    bumps.frustumCulled = false; bumps.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    pkg.add(bumps);

    /* ---------- the SM floorplan that lifts out of the die ---------- */
    const fpGroup = new THREE.Group(); scene.add(fpGroup);
    const fpColl = Coll(FPB.length, matBlock);
    FPB.forEach((b, i) => { fpColl.base[i] = lin(TONE[b.tone]); fpColl.items[i] = b; });
    fpGroup.add(fpColl.mesh);
    const fpDecalList = [];
    FPB.forEach((b, i) => { if (b.text) fpDecalList.push(i); });
    const smTitle = atlas.slot('SM · Hopper (SM90) · layout after the H100 whitepaper');
    const fpDecals = Decals(fpDecalList.length + 1);
    fpDecalList.forEach((bi, j) => {
      const b = FPB[bi], s = atlas.slot(b.text);
      fpDecals.items.push({ bi, s });
      const onCell = /int32|fp32|fp64|ldst/.test(b.part), dark = b.part === 'ws' || b.part === 'du' ? '#1a1405' : b.part === 'tc' ? '#0b0c12' : null;
      initDecal(fpDecals, j, s, dark || (onCell ? '#e9fff5' : '#eef1fb'), dark ? 0.92 : onCell ? 0.7 : 0.9);
    });
    initDecal(fpDecals, fpDecalList.length, smTitle, '#aeb2c7', 0.85);
    fpGroup.add(fpDecals.mesh);
    fpGroup.visible = false;

    /* ---------- selection outlines (thin additive bars) ---------- */
    const NBAR = 52; // 5 selection outlines + the 8 GPC group outlines of the GPU view
    const barMat = keep(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    const bars = new THREE.InstancedMesh(keep(new THREE.BoxGeometry(1, 1, 1)), barMat, NBAR);
    bars.frustumCulled = false; bars.renderOrder = 4;
    bars.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    bars.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(NBAR * 3), 3);
    bars.instanceColor.setUsage(THREE.DynamicDrawUsage);
    scene.add(bars);
    const barI = new Float32Array(6), barT = new Float32Array(6); // gpc, tpc, sm, frustum, smsp, all-GPC grouping
    const accentLin = lin(C.accent), groupLin = lin('#c9cde0');
    let barCol = accentLin;

    /* ---------- data packets ---------- */
    const NPK = coarse ? 120 : 220;
    const pktGeo = keep(new THREE.BufferGeometry());
    const TAIL = 3; // head + two fading tail points per packet, so streams read as moving dashes
    const pktPos = new Float32Array(NPK * TAIL * 3), pktA = new Float32Array(NPK * TAIL);
    pktGeo.setAttribute('position', new THREE.BufferAttribute(pktPos, 3).setUsage(THREE.DynamicDrawUsage));
    pktGeo.setAttribute('aAlpha', new THREE.BufferAttribute(pktA, 1).setUsage(THREE.DynamicDrawUsage));
    const pktMat = keep(new THREE.ShaderMaterial({
      uniforms: { uSize: { value: 0.34 }, uScale: { value: 800 }, uMax: { value: 12 }, uColor: { value: lin(C.memory) }, uOpacity: { value: 1 } },
      vertexShader: `attribute float aAlpha; varying float vA; uniform float uSize; uniform float uScale;
uniform float uMax;
void main() { vA = aAlpha; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = clamp(uSize * uScale / -mv.z, 1.5, uMax); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform vec3 uColor; uniform float uOpacity; varying float vA;
void main() { vec2 c = gl_PointCoord - 0.5; float d = length(c); float a = smoothstep(0.5, 0.12, d); a = a * (0.55 + 0.45 * a) * vA * uOpacity; if (a < 0.01) discard;
vec3 col = mix(uColor, vec3(1.0), smoothstep(0.24, 0.0, d) * 0.7); gl_FragColor = vec4(col, a);
#include <encodings_fragment>
}`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    const packets = new THREE.Points(pktGeo, pktMat);
    packets.frustumCulled = false; packets.renderOrder = 5;
    scene.add(packets);
    const R = rng(1234);
    const ACTIVE_STACKS = [0, 1, 2, 3, 4, 5].filter((s) => s !== OFF_STACK);
    const ENABLED_IDX = SMR.map((r, i) => (r.on ? i : -1)).filter((i) => i >= 0);
    const PKT = [];
    function respawn(p, t0) {
      p.s = ACTIVE_STACKS[Math.floor(R() * ACTIVE_STACKS.length)];
      p.k = Math.floor(R() * HBM.n);
      p.jx = (R() - 0.5) * 3.6; p.jz = (R() - 0.5) * 4.2;
      p.l2x = (R() - 0.5) * 17; p.l2z = (R() - 0.5) * 1.6;
      p.sm = ENABLED_IDX[Math.floor(R() * ENABLED_IDX.length)];
      p.t = t0 != null ? t0 : 0;
      p.v = 9 + R() * 5;
    }
    for (let i = 0; i < NPK; i++) { const p = {}; respawn(p, R()); PKT.push(p); }
    packets.visible = !RM;
    const NWP = 7;
    const WP = Array.from({ length: NWP }, () => V(0, 0, 0));
    const SEG = new Float32Array(NWP - 1);

    /* ═══════════ state ═══════════ */
    const st = {
      level: 0, ex: true, E: RM ? 1 : 0, Et: 1, lift: 0, liftT: 0, liftSM: -1,
      sel: { gpc: 5, tpc: 4, sm: 0, smsp: 0 },
      auto: !RM, tour: -1, tourTimer: 0, tourPaused: false, tourHold: false, pkgDim: 1, pkgDimT: 1, liftHold: 0,
      W: 1, H: 1, focus: { x0: 0, x1: 1, y0: 0, y1: 1 },
    };
    let L = pkgLayout(st.E);
    let groupPeek = false; // hovering the GPC level button at the GPU view brightens the GPC outlines
    const selSM = () => smIndex(st.sel.gpc, st.sel.tpc, st.sel.sm);

    /* ═══════════ layout: write every instance transform for the current E / lift ═══════════ */
    let layoutDirty = true;
    function layoutPackage() {
      L = pkgLayout(st.E);
      substrate.position.y = SUB.t / 2;
      interposer.position.y = L.intBot + INT.t / 2;
      dieSlab.position.y = L.dieBot + DIE.t / 2;
      DB.forEach((b, i) => {
        setBox(dieColl, i, (b.x0 + b.x1) / 2, L.dieTop, (b.z0 + b.z1) / 2, b.x1 - b.x0, b.h, b.z1 - b.z0);
      });
      dieColl.mesh.instanceMatrix.needsUpdate = true;
      dieDecals.items.forEach((it, j) => {
        const b = it.b, w = b.x1 - b.x0, d = b.z1 - b.z0;
        const [tw, th] = fitText(it.s, w, d, b.part === 'l2' ? 0.62 : b.part === 'raster' || b.part === 'gpc' ? 0.26 : 0.3, b.rot);
        setDecal(dieDecals, j, (b.x0 + b.x1) / 2, L.dieTop + b.h + 0.004, (b.z0 + b.z1) / 2, tw, th, b.rot);
      });
      dieDecals.mesh.instanceMatrix.needsUpdate = true;
      SMR.forEach((r, i) => setBox(tiles, i, (r.x0 + r.x1) / 2, L.tileBot, (r.z0 + r.z1) / 2, SM_W, TILE_H, SM_D));
      tiles.mesh.instanceMatrix.needsUpdate = true;
      PK.forEach((b, i) => {
        if (b.part === 'cap') { const c = b.cap; setBox(pkgColl, i, c.x, L.subTop, c.z, c.rot ? 0.3 : 0.62, 0.28, c.rot ? 0.62 : 0.3); return; }
        const x = stackX(b.s), z = stackZ(b.s);
        if (b.part === 'tsv') {
          const y0 = L.hbmBot + HBM.base, y1 = stackTop(L) - HBM.dram;
          const jx = (b.j % 4) * 0.5 - 0.75, jz = b.j < 4 ? -0.9 : 0.9;
          setBox(pkgColl, i, x + jx, y0, z + jz, 0.08, Math.max(0.001, y1 - y0), 0.08);
          return;
        }
        if (b.k < 0) setBox(pkgColl, i, x, L.hbmBot, z, HBM.w, HBM.base, HBM.d);
        else setBox(pkgColl, i, x, dramBot(L, b.k), z, HBM.w - 0.12, HBM.dram, HBM.d - 0.12);
      });
      pkgColl.mesh.instanceMatrix.needsUpdate = true;
      const top = stackTop(L);
      pkgDecals.items.forEach((it, s) => {
        const [tw, th] = fitText(it.sl, HBM.w, HBM.d, 2.3, 0);
        setDecal(pkgDecals, s, stackX(s), top + 0.004, stackZ(s), tw, th, 0);
      });
      setDecal(pkgDecals, 6, -SUB.w / 2 + 1.4 + (2.0 * markA.aspect) / 2, L.subTop + 0.004, SUB.d / 2 - 2.35, 2.0 * markA.aspect, 2.0, 0);
      setDecal(pkgDecals, 7, SUB.w / 2 - 1.4 - (0.62 * markB.aspect) / 2, L.subTop + 0.004, SUB.d / 2 - 2.35, 0.62 * markB.aspect, 0.62, 0);
      pkgDecals.mesh.instanceMatrix.needsUpdate = true;
      const E = st.E, show = E > 0.01;
      BUMPS.forEach((b, i) => {
        let y, r = b.r;
        if (b.t === 'sb') y = -E * 1.2 - b.r * 0.8;
        else if (b.t === 'c4') { y = (L.subTop + L.intBot) / 2; r = show ? b.r * E : 1e-4; }
        else if (b.t === 'ud') { y = (L.intTop + L.dieBot) / 2; r = show ? b.r * E : 1e-4; }
        else { y = (L.intTop + L.hbmBot) / 2; r = show ? b.r * E : 1e-4; }
        _p.set(b.x, y, b.z); _s.set(r, r * (b.t === 'sb' ? 0.8 : 1), r); _m4.compose(_p, QI, _s);
        bumps.setMatrixAt(i, _m4);
      });
      bumps.instanceMatrix.needsUpdate = true;
    }

    const fpSpread = (q) => (q < 0 ? [0, 0] : [q % 2 ? 1 : -1, q < 2 ? -1 : 1]);
    function fpY0(b, E) {
      switch (b.part) {
        case 'smplate': return -0.12;
        case 'l1i': return E * 3.7;
        case 'tma': case 'l1d': case 'tex': return E * 0.22;
        case 'smsp': return E * 1.8;
        default: return 0.06 + E * 2.3;
      }
    }
    function fpLocal(b, E, out) {
      const [sx, sz] = fpSpread(b.q);
      out.x = ((b.x0 + b.x1) / 2 - FP.cx) * FP.S + sx * E * 0.62;
      out.z = ((b.y0 + b.y1) / 2 - FP.cy) * FP.S + sz * E * 0.62;
      out.w = (b.x1 - b.x0) * FP.S; out.d = (b.y1 - b.y0) * FP.S;
      out.y0 = fpY0(b, E);
      return out;
    }
    const _fb = { x: 0, z: 0, w: 0, d: 0, y0: 0 };
    function layoutFloorplan() {
      const E = st.E;
      FPB.forEach((b, i) => { fpLocal(b, E, _fb); setBox(fpColl, i, _fb.x, _fb.y0, _fb.z, _fb.w, b.h, _fb.d); });
      fpColl.mesh.instanceMatrix.needsUpdate = true;
      fpDecals.items.forEach((it, j) => {
        const b = FPB[it.bi]; fpLocal(b, E, _fb);
        const cell = /int32|fp32|fp64/.test(b.part);
        const [tw, th] = fitText(it.s, _fb.w, _fb.d, cell ? 0.11 : b.part === 'tc' ? 0.3 : b.part === 'ldst' ? 0.1 : 0.2, 0);
        it.th = th;
        setDecal(fpDecals, j, _fb.x, _fb.y0 + b.h + 0.004, _fb.z, tw, th, 0);
      });
      const tH = 0.3;
      setDecal(fpDecals, fpDecalList.length, (36 - FP.cx) * FP.S + (tH * smTitle.aspect) / 2, 0.004, (1862 - FP.cy) * FP.S, tH * smTitle.aspect, tH, 0);
      fpDecals.mesh.instanceMatrix.needsUpdate = true;
    }
    // where the floating SM floorplan sits (lift = 1) and its transform for the current lift
    function tileTop(i, out) { const r = SMR[i]; return (out || V(0, 0, 0)).set((r.x0 + r.x1) / 2, L.tileBot + TILE_H, (r.z0 + r.z1) / 2); }
    function hoverPos(i, Lx, out) { const r = SMR[i]; return (out || V(0, 0, 0)).set(((r.x0 + r.x1) / 2) * 0.35, Lx.dieTop + LIFT_H, ((r.z0 + r.z1) / 2) * 0.35); }
    const _tA = V(0, 0, 0), _tB = V(0, 0, 0);
    function placeFloorplan() {
      const i = st.liftSM < 0 ? selSM() : st.liftSM;
      const k = ease(clamp(st.lift, 0, 1));
      tileTop(i, _tA); hoverPos(i, L, _tB);
      fpGroup.position.lerpVectors(_tA, _tB, k);
      fpGroup.scale.set(lerp(SM_W / FP.W, 1, k), lerp(0.04, 1, k), lerp(SM_D / FP.D, 1, k));
      fpGroup.visible = st.lift > 0.003;
      fpGroup.updateMatrixWorld(true);
    }

    /* ═══════════ selection outline bars ═══════════ */
    const _a = V(0, 0, 0), _b = V(0, 0, 0), _d = V(0, 0, 0);
    let barN = 0;
    function bar(a, b, th, inten) {
      if (barN >= NBAR) return;
      _d.subVectors(b, a); const len = _d.length();
      if (len < 1e-5 || inten < 0.003) { _s.set(1e-4, 1e-4, 1e-4); _m4.compose(a, QI, _s); bars.setMatrixAt(barN, _m4); bars.instanceColor.setXYZ(barN, 0, 0, 0); barN++; return; }
      _q.setFromUnitVectors(XA, _d.divideScalar(len));
      _p.addVectors(a, b).multiplyScalar(0.5); _s.set(len + th, th, th);
      _m4.compose(_p, _q, _s); bars.setMatrixAt(barN, _m4);
      bars.instanceColor.setXYZ(barN, barCol.r * inten, barCol.g * inten, barCol.b * inten);
      barN++;
    }
    const _r4 = [V(0, 0, 0), V(0, 0, 0), V(0, 0, 0), V(0, 0, 0)];
    function rectBars(x0, z0, x1, z1, y, th, inten, mat) {
      _r4[0].set(x0, y, z0); _r4[1].set(x1, y, z0); _r4[2].set(x1, y, z1); _r4[3].set(x0, y, z1);
      if (mat) _r4.forEach((v) => v.applyMatrix4(mat));
      for (let k = 0; k < 4; k++) bar(_r4[k], _r4[(k + 1) % 4], th, inten);
    }
    const _fc = [V(0, 0, 0), V(0, 0, 0), V(0, 0, 0), V(0, 0, 0)];
    function updateBars() {
      barN = 0;
      const px = (2 * cam.r * Math.tan((FOV * Math.PI) / 360)) / Math.max(1, st.H); // world units per pixel at the target
      const th = px * 1.8;
      const g = gpcRect(st.sel.gpc);
      rectBars(g.x0 - 0.06, g.z0 - 0.06, g.x1 + 0.06, g.z1 + 0.06, L.dieTop + 0.12, th, barI[0]);
      const a = SMR[smIndex(st.sel.gpc, st.sel.tpc, 0)], b = SMR[smIndex(st.sel.gpc, st.sel.tpc, 1)];
      rectBars(a.x0 - 0.05, a.z0 - 0.05, b.x1 + 0.05, b.z1 + 0.05, L.tileBot + TILE_H + 0.02, th, barI[1]);
      const s = SMR[st.liftSM < 0 ? selSM() : st.liftSM];
      rectBars(s.x0 - 0.03, s.z0 - 0.03, s.x1 + 0.03, s.z1 + 0.03, L.tileBot + TILE_H + 0.03, th, barI[2]);
      // frustum from the tile to the floating floorplan
      const y = L.tileBot + TILE_H + 0.03;
      _fc[0].set(-FP.W / 2, -0.12, -FP.D / 2); _fc[1].set(FP.W / 2, -0.12, -FP.D / 2); _fc[2].set(FP.W / 2, -0.12, FP.D / 2); _fc[3].set(-FP.W / 2, -0.12, FP.D / 2);
      const corners = [[s.x0, s.z0], [s.x1, s.z0], [s.x1, s.z1], [s.x0, s.z1]];
      for (let k = 0; k < 4; k++) { _a.set(corners[k][0], y, corners[k][1]); _b.copy(_fc[k]).applyMatrix4(fpGroup.matrixWorld); bar(_a, _b, th * 0.8, barI[3] * clamp(st.lift, 0, 1)); }
      // sub-partition outline inside the floorplan
      const qx = QUADS[st.sel.smsp][0], qy = QUADS[st.sel.smsp][1];
      const [sx, sz] = fpSpread(st.sel.smsp);
      const ox = sx * st.E * 0.62, oz = sz * st.E * 0.62, yy = fpY0({ part: 'smsp' }, st.E) + 0.07;
      const pad = 0.05;
      rectBars((qx - FP.cx) * FP.S + ox - pad, (qy - FP.cy) * FP.S + oz - pad, (qx + 660 - FP.cx) * FP.S + ox + pad, (qy + 711 - FP.cy) * FP.S + oz + pad, yy, th, barI[4], fpGroup.matrixWorld);
      // faint outlines of all eight GPCs, so the GPU view shows how the 144 SMs are grouped
      barCol = groupLin;
      for (let gi = 0; gi < 8; gi++) { const r = gpcRect(gi); rectBars(r.x0 - 0.04, r.z0 - 0.04, r.x1 + 0.04, r.z1 + 0.04, L.dieTop + 0.11, th * 0.9, barI[5]); }
      barCol = accentLin;
      while (barN < NBAR) bar(_a, _a, 0, 0);
      bars.instanceMatrix.needsUpdate = true; bars.instanceColor.needsUpdate = true;
    }

    /* ═══════════ camera controller (custom: page-scroll friendly) ═══════════ */
    const cam = { target: V(0, 3, 0), r: 80, th: -0.6, ph: 0.98 };
    const goal = { target: V(0, 3, 0), r: 80, th: -0.6, ph: 0.98 };
    let glide = null, userMoved = false, idle = 99, dragging = false, lastInteract = 0;
    const sway = { on: false, c: 0, t: 0 };
    function fitR(ew, eh) {
      const fw = Math.max(80, st.focus.x1 - st.focus.x0), fh = Math.max(80, st.focus.y1 - st.focus.y0);
      const ppu = Math.min((fw * 0.9) / ew, (fh * 0.88) / eh);
      return st.H / ppu / (2 * Math.tan((FOV * Math.PI) / 360));
    }
    function preset(level) {
      const Lf = pkgLayout(st.Et);
      const p = { target: V(0, 0, 0), r: 60, th: -0.6, ph: 0.98 };
      const narrow = st.W <= NARROW;
      if (level === 0) { p.target.set(0, (Lf.dieTop + 1.2) * 0.5, 0.6); p.r = fitR(narrow ? 49 : 55, (narrow ? 34 : 37) + st.Et * 3); p.th = -0.42; p.ph = 0.95 + st.Et * 0.13; }
      else if (level === 1) { const g = gpcRect(st.sel.gpc); p.target.set((g.x0 + g.x1) / 2, Lf.tileBot, (g.z0 + g.z1) / 2 + 0.3); p.r = fitR(8.6, 8.4); p.th = -0.34; p.ph = 0.82; }
      else if (level === 2) { const a = SMR[smIndex(st.sel.gpc, st.sel.tpc, 0)]; p.target.set((a.x0 + a.x1) / 2, Lf.tileBot, a.z1 + 0.035); p.r = fitR(3.9, 3.7); p.th = -0.3; p.ph = 0.8; }
      else {
        const i = selSM();
        hoverPos(i, Lf, p.target);
        if (level === 3) { p.target.y += st.Et * 1.6 - 1.2; p.target.z += 0.4; p.r = fitR(12.6, 14.4 + st.Et * 2.4); p.th = -0.2; p.ph = 0.9; }
        else {
          const [qx, qy] = QUADS[st.sel.smsp], [sx, sz] = fpSpread(st.sel.smsp);
          p.target.x += (qx + 330 - FP.cx) * FP.S + sx * st.Et * 0.62;
          p.target.z += (qy + 355 - FP.cy) * FP.S + sz * st.Et * 0.62 + 0.25;
          p.target.y += st.Et * 2.5;
          p.r = fitR(6.3, 6.1); p.th = -0.2; p.ph = 0.62;
        }
      }
      return p;
    }
    const snap = (o) => ({ target: o.target.clone(), r: o.r, th: o.th, ph: o.ph });
    function glideTo(level, opts) {
      opts = opts || {};
      const from = snap(goal);
      const dur = RM ? 0 : opts.dur != null ? opts.dur : 1.45;
      glide = { from, level, t: 0, dur, keepView: !!opts.keepView };
      if (dur === 0) { stepGlide(1); glide = null; copyState(cam, goal); }
      userMoved = false; sway.on = false; wake();
    }
    function copyState(dst, src) { dst.target.copy(src.target); dst.r = src.r; dst.th = src.th; dst.ph = src.ph; }
    function stepGlide(dt) {
      const g = glide;
      g.t = g.dur > 0 ? Math.min(1, g.t + dt / g.dur) : 1;
      const to = preset(g.level), k = ease(g.t);
      goal.target.lerpVectors(g.from.target, to.target, k);
      if (!g.keepView) {
        let dth = to.th - g.from.th; dth = Math.atan2(Math.sin(dth), Math.cos(dth));
        goal.th = g.from.th + dth * k;
        goal.ph = lerp(g.from.ph, to.ph, k);
        goal.r = Math.exp(lerp(Math.log(g.from.r), Math.log(to.r), k));
      }
      if (g.t >= 1) glide = null;
    }
    function rLimits() { const p = preset(st.level); return [p.r * 0.38, p.r * 2.4]; }
    function userInput() { userMoved = true; idle = 0; sway.on = false; if (glide) glide = null; lastInteract = performance.now(); pauseTour(); wake(); }
    function orbit(dth, dph) { userInput(); goal.th += dth; goal.ph = clamp(goal.ph + dph, 0.1, 1.62); }
    // returns false when the zoom is already at its limit in that direction
    function dolly(f) { const [a, b] = rLimits(); if ((f > 1 && goal.r >= b - 1e-6) || (f < 1 && goal.r <= a + 1e-6)) return false; userInput(); goal.r = clamp(goal.r * f, a, b); return true; }
    function applyCamera() {
      const sp = Math.sin(cam.ph);
      camera.position.set(cam.target.x + cam.r * sp * Math.sin(cam.th), cam.target.y + cam.r * Math.cos(cam.ph), cam.target.z + cam.r * sp * Math.cos(cam.th));
      camera.lookAt(cam.target);
      camera.updateMatrixWorld();
    }

    /* ═══════════ sizing & view offset ═══════════ */
    let panelRects = [];
    const rel = (el, sr) => { const r = el.getBoundingClientRect(); return { x0: r.left - sr.left, y0: r.top - sr.top, x1: r.right - sr.left, y1: r.bottom - sr.top }; };
    function measurePanels() {
      const sr = ui.stage.getBoundingClientRect();
      panelRects = [];
      if (st.W > NARROW) {
        ['.hero-kicker', '.hero-title', '.hero-sub', '.hero-ctas'].forEach((s) => { const el = ui.intro.querySelector(s); if (el) panelRects.push(rel(el, sr)); });
        [ui.ctl, ui.read, ui.foot].forEach((el) => panelRects.push(rel(el, sr)));
        let x0 = 0;
        ['.hero-title', '.hero-sub', '.hero-ctas'].forEach((s) => { const el = ui.intro.querySelector(s); if (el) x0 = Math.max(x0, rel(el, sr).x1); });
        const rr = rel(ui.read, sr), cr = rel(ui.ctl, sr), fr = rel(ui.foot, sr);
        if (!ui.partsPop.hidden) fr.y0 = rel(ui.legend, sr).y0 - 8; // the open parts list is not part of the frame
        x0 = Math.max(x0, Math.min(rr.x1, st.W * 0.46));
        st.focus = { x0: Math.min(x0 + 12, st.W * 0.5), x1: st.W - 16, y0: Math.min(cr.y1 + 8, st.H * 0.35), y1: Math.max(st.H * 0.6, fr.y0 - 6) };
      } else st.focus = { x0: 0, x1: st.W, y0: 0, y1: st.H };
      labelsDirty = true;
    }
    function resize() {
      const w = Math.max(1, ui.stage.clientWidth), h = Math.max(1, ui.stage.clientHeight);
      const changed = w !== st.W || h !== st.H;
      st.W = w; st.H = h;
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      if (changed) tickDirty = true; // the issue line picks the variant that fits the new width
      fitReadout();
      measurePanels();
      const fx = (st.focus.x0 + st.focus.x1) / 2, fy = (st.focus.y0 + st.focus.y1) / 2;
      const dx = fx - w / 2, dy = fy - h / 2;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) camera.setViewOffset(w, h, -dx, -dy, w, h); else camera.clearViewOffset();
      camera.updateProjectionMatrix();
      pktMat.uniforms.uScale.value = (h * renderer.getPixelRatio()) / (2 * Math.tan((FOV * Math.PI) / 360));
      if (changed && !userMoved) { const p = preset(st.level); goal.r = p.r; if (!glide) cam.r = p.r; }
      viewDirty = true; wake();
    }

    /* ═══════════ focus (dimming) per level ═══════════ */
    function setFocus() {
      const lv = st.level, s = st.sel, cur = selSM();
      SMR.forEach((r, i) => {
        let f = 1;
        if (lv === 1) f = r.g === s.gpc ? 1 : 0.22;
        else if (lv === 2) f = r.g === s.gpc && r.t === s.tpc ? 1 : r.g === s.gpc ? 0.4 : 0.16;
        else if (lv >= 3) f = i === cur ? 1 : 0.13;
        tiles.focusT[i] = f;
      });
      DB.forEach((b, i) => {
        let f = 1;
        if (lv === 1 || lv === 2) f = b.g === s.gpc ? 1 : b.part === 'gpc' ? 0.7 : 0.4;
        else if (lv >= 3) f = 0.18;
        dieColl.focusT[i] = f;
      });
      PK.forEach((b, i) => { pkgColl.focusT[i] = lv === 0 ? 1 : lv < 3 ? 0.45 : 0.2; });
      FPB.forEach((b, i) => { fpColl.focusT[i] = lv < 4 ? 1 : b.q === s.smsp ? 1 : b.q < 0 ? (b.part === 'smplate' ? 1 : 0.5) : 0.3; });
      st.pkgDimT = lv === 0 ? 1 : lv < 3 ? 0.6 : 0.26;
      barT[0] = lv === 1 ? 1 : lv === 2 ? 0.45 : 0;
      // the TPC and sub-partition the next level opens are outlined faintly one level up, under their "›" labels
      barT[1] = lv === 2 ? 1 : lv === 1 ? 0.4 : 0;
      barT[2] = lv >= 3 ? 1 : 0;
      barT[3] = lv >= 3 ? 0.55 : 0;
      barT[4] = lv === 4 ? 1 : lv === 3 ? 0.4 : 0;
      barT[5] = lv === 0 ? (groupPeek ? 0.9 : 0.32) : 0;
      wake();
    }
    let hotKey = null;
    function setHot(key) {
      if (key === hotKey) return;
      hotKey = key;
      const m = key ? key.split(':') : [];
      const is = (coll, fn) => { for (let i = 0; i < coll.n; i++) coll.hotT[i] = key && fn(coll.items[i], i) ? 1 : 0; };
      is(tiles, (r, i) => m[0] === 'tile' && +m[1] === i);
      is(dieColl, (b) => m[0] === 'die' && b.part === m[1] && (m[2] == null || String(b.g) === m[2] || String(b.stack) === m[2]));
      is(pkgColl, (b) => m[0] === 'pkg' && (b.part === m[1] || (m[1] === 'hbm' && b.part === 'dram')) && (m[2] == null || String(b.s) === m[2]));
      is(fpColl, (b) => m[0] === 'fp' && b.part === m[1] && (m[2] == null || String(b.q) === m[2]));
      wake();
    }

    /* ═══════════ ambient animation: packets, warp issue ═══════════ */
    const tileGlow = tiles.glow.array, fpGlow = fpColl.glow.array;
    // busy[k]: clocks, counting the current one, that pipe PIPES[k] of that sub-partition is still occupied
    const issue = [0, 1, 2, 3].map((q) => ({ q, t: 0.1 + q * 0.13, ev: [], busy: new Int8Array(PIPES.length) }));
    let tickPipe = null;
    // The narrated sub-partition (the selected one) issues slowly enough to follow: one instruction every
    // NARR seconds, with the scheduler → dispatch → register file → pipe stages STAGE seconds apart.
    // The other three keep a quick ambient cadence.
    const NARR = 2.4, STAGE = 0.2, CLOCK_GHZ = 1.98;
    const narrQ = () => st.sel.smsp;
    // 16 warp slots per sub-partition (64 resident warps per SM ÷ 4 schedulers): eligible, stalled or selected.
    // Each warp has a next instruction (next[i], an index into PIPES). A warp is eligible when it is not waiting on
    // an earlier result (stall[i] = 0) and the pipe its next instruction needs is free this clock; one whose pipe
    // is still busy is stalled on a pipeline conflict (blk[i]). busy[] is the narrated scheduler's pipe occupancy.
    const WSL = { n: 16, stall: new Int8Array(16), next: new Int8Array(16), blk: new Uint8Array(16), busy: new Int8Array(PIPES.length),
      sel: -1, warp: 0, pipe: 0, wait: null, els: [] };
    // a pipe drawn by the PIPES weights, among those free in busy (any pipe when busy is null)
    function pickPipe(busy) {
      let tot = 0;
      for (let k = 0; k < PIPES.length; k++) if (!busy || !busy[k]) tot += PIPES[k].w;
      let x = R() * tot;
      for (let k = 0; k < PIPES.length; k++) if (!busy || !busy[k]) { x -= PIPES[k].w; if (x <= 0) return k; }
      return 0; // FP32 (1 clock) is always free again on the next clock
    }
    function buildSlots() {
      ui.slots.innerHTML = '<span></span>' + '<i></i>'.repeat(WSL.n) +
        '<em><b style="background:var(--memory)"></b>eligible<b style="background:var(--control)"></b>stalled<b style="background:var(--special)"></b>selected</em>' +
        (!st.auto ? `<em>· frozen on one clock (${RM ? 'reduced motion' : 'animation off'})</em>` // the Step button below advances it
          : `<em>· shown about ${Math.round(NARR * CLOCK_GHZ)} billion× slower than real time</em>`); // NARR s per issue vs one issue per clock at 1.98 GHz
      WSL.els = [...ui.slots.querySelectorAll('i')];
      WSL.lab = ui.slots.firstElementChild;
    }
    function paintSlots() {
      if (!WSL.els.length) return;
      WSL.lab.textContent = `Warps in sub-partition ${narrQ() + 1}`;
      WSL.els.forEach((el, i) => { el.classList.toggle('sel', i === WSL.sel); el.classList.toggle('st', i !== WSL.sel && (WSL.stall[i] > 0 || WSL.blk[i] > 0)); });
    }
    // One clock of the narrated scheduler: stalled warps count down, busy pipes count down, the warp issued last
    // clock now waits for its result for a few clocks, and one eligible warp (operands ready, pipe free) is selected.
    // Its instruction occupies its pipe for PIPES[k].clk clocks, this one included.
    function stepSlots() {
      for (let i = 0; i < WSL.n; i++) if (WSL.stall[i] > 0) WSL.stall[i]--;
      for (let k = 0; k < PIPES.length; k++) if (WSL.busy[k] > 0) WSL.busy[k]--;
      if (WSL.sel >= 0) WSL.stall[WSL.sel] = 2 + Math.floor(R() * 5);
      const ready = [];
      WSL.wait = null;
      for (let i = 0; i < WSL.n; i++) {
        WSL.blk[i] = 0;
        if (WSL.stall[i]) continue;
        const k = WSL.next[i];
        if (WSL.busy[k]) { WSL.blk[i] = 1; if (!WSL.wait) WSL.wait = { w: i, k, left: WSL.busy[k] }; } else ready.push(i);
      }
      WSL.sel = ready.length ? ready[Math.floor(R() * ready.length)] : -1;
      if (WSL.sel >= 0) {
        const k = WSL.next[WSL.sel];
        WSL.busy[k] = PIPES[k].clk;
        WSL.pipe = k;
        WSL.warp = WSL.sel;
        WSL.next[WSL.sel] = pickPipe(null);
      }
      tickPipe = WSL.sel >= 0 ? PIPES[WSL.pipe] : 'idle';
      paintSlots();
      return WSL.sel;
    }
    (function initSlots() {
      for (let i = 0; i < WSL.n; i++) { WSL.stall[i] = R() < 0.45 ? 1 + Math.floor(R() * 5) : 0; WSL.next[i] = pickPipe(null); }
      stepSlots(); // open on a real clock: one selected warp and its pipe (what reduced motion shows until Step)
    })();
    // the narrated sub-partition's busy pipes stay faintly lit for every clock they are occupied
    function glowBusy() { const q = narrQ(); for (let k = 0; k < PIPES.length; k++) if (WSL.busy[k] > 0) flash(FPI[PIPES[k].part + q], 0.45); }
    // Reduced motion, or the Animate switch off: nothing animates. The narrated scheduler stands still on one issue, with the scheduler,
    // dispatch unit, register file and pipe of that issue lit, and the Step button advances it by one clock.
    function rmGlow() {
      fpGlow.fill(0);
      if (tickPipe && tickPipe !== 'idle') { const q = narrQ(); flash(FPI['ws' + q], 1); flash(FPI['du' + q], 1); flash(FPI['rf' + q], 0.6); flash(FPI[tickPipe.part + q], 1.15); }
      glowBusy();
      fpColl.glow.needsUpdate = true;
    }
    function rmStep() { stepSlots(); tickDirty = true; wake(); }
    function fpIdx(part, q) { const out = []; FPB.forEach((b, i) => { if (b.part === part && b.q === q) out.push(i); }); return out; }
    const FPI = {};
    [0, 1, 2, 3].forEach((q) => ['ws', 'du', 'rf', 'fp32', 'int32', 'fp64', 'tc', 'ldst', 'sfu'].forEach((p) => { FPI[p + q] = fpIdx(p, q); }));
    function flash(list, v) { for (const i of list) fpGlow[i] = Math.max(fpGlow[i], v); }
    // Runs only while the Animate switch is on (off by default under reduced motion). An SM lights up only when a
    // packet of memory traffic reaches it.
    function ambient(dt) {
      if (!st.auto) return false;
      const dec = Math.exp(-dt * 5.5);
      for (let i = 0; i < 144; i++) tileGlow[i] *= dec;
      tiles.glow.needsUpdate = true;
      // packets
      const Lx = L;
      for (let n = 0; n < NPK; n++) {
        const p = PKT[n];
        const side = stackX(p.s) < 0 ? -1 : 1;
        const zs = stackZ(p.s), mcz = zs + (p.jz < 0 ? -1.45 : 1.45);
        const sm = SMR[p.sm];
        // DRAM die → down the stack → across the interposer → up the die edge → memory controller → L2 → an SM
        const ex = side * (DIE.w / 2 + 0.16), mz = mcz + p.jz * 0.12;
        WP[0].set(stackX(p.s) + p.jx * 0.6, dramBot(Lx, p.k) + HBM.dram * 0.5, zs + p.jz * 0.5);
        WP[1].set(stackX(p.s) + p.jx * 0.6, Lx.intTop + 0.04, zs + p.jz * 0.5);
        WP[2].set(ex, Lx.intTop + 0.04, mz);
        WP[3].set(ex, Lx.dieTop + 0.16, mz);
        WP[4].set(side * 10.1, Lx.dieTop + 0.16, mz);
        WP[5].set(p.l2x, Lx.dieTop + 0.2, p.l2z);
        WP[6].set((sm.x0 + sm.x1) / 2, Lx.tileBot + TILE_H + 0.05, (sm.z0 + sm.z1) / 2);
        let tot = 0;
        for (let k = 0; k < NWP - 1; k++) { SEG[k] = WP[k].distanceTo(WP[k + 1]); tot += SEG[k]; }
        p.t += (dt * p.v) / Math.max(1, tot);
        if (p.t >= 1) {
          if (R() < 0.45) tileGlow[p.sm] = Math.max(tileGlow[p.sm], 0.85);
          respawn(p, 0);
          for (let j = 0; j < TAIL; j++) { pktA[n * TAIL + j] = 0; pktPos[(n * TAIL + j) * 3 + 1] = -99; }
          continue;
        }
        const fade = clamp(p.t / 0.06, 0, 1) * clamp((1 - p.t) / 0.1, 0, 1);
        for (let j = 0; j < TAIL; j++) {
          let d = Math.max(0, p.t * tot - j * 0.32), k = 0;
          while (k < NWP - 2 && d > SEG[k]) { d -= SEG[k]; k++; }
          const f = SEG[k] > 0 ? Math.min(1, d / SEG[k]) : 0, o = (n * TAIL + j) * 3;
          pktPos[o] = lerp(WP[k].x, WP[k + 1].x, f);
          pktPos[o + 1] = lerp(WP[k].y, WP[k + 1].y, f);
          pktPos[o + 2] = lerp(WP[k].z, WP[k + 1].z, f);
          pktA[n * TAIL + j] = fade * (j === 0 ? 1 : j === 1 ? 0.5 : 0.22);
        }
      }
      pktGeo.attributes.position.needsUpdate = true; pktGeo.attributes.aAlpha.needsUpdate = true;
      // warp issue inside the SM floorplan
      if (fpGroup.visible) {
        const fd = Math.exp(-dt * 7);
        for (let i = 0; i < fpGlow.length; i++) fpGlow[i] *= fd;
        for (const s of issue) {
          s.t -= dt;
          const narr = s.q === narrQ();
          if (s.t <= 0) {
            s.t = narr ? NARR : 0.42 + R() * 0.16;
            let pipe = null;
            if (narr) { if (stepSlots() >= 0) pipe = PIPES[WSL.pipe]; tickDirty = true; } // nothing issues (no flashes) on an idle clock
            else {
              for (let k = 0; k < PIPES.length; k++) if (s.busy[k] > 0) s.busy[k]--;
              const k = pickPipe(s.busy); s.busy[k] = PIPES[k].clk; pipe = PIPES[k];
            }
            const g = narr ? STAGE : 0.07;
            s.ev = pipe ? [[0, 'ws'], [g * (narr ? 1 : 0), 'du'], [g * (narr ? 2 : 1), 'rf'], [g * (narr ? 3 : 2), pipe.part]].map(([at, part]) => ({ at, part })) : [];
            s.age = 0;
          }
          s.age = (s.age || 0) + dt;
          s.ev = s.ev.filter((e) => { if (s.age >= e.at) { flash(FPI[e.part + s.q], e.part === 'rf' ? 0.6 : narr ? 1.15 : 0.9); return false; } return true; });
        }
        glowBusy();
        fpColl.glow.needsUpdate = true;
      }
      return true;
    }

    /* ═══════════ HTML labels projected from 3D ═══════════ */
    let labels = [], labelsDirty = true, viewDirty = true, tickDirty = true;
    const _v = V(0, 0, 0);
    const fpTop = (part, q, pick, out) => fpAt(part, q, pick, 0.5, 0.5, out);
    // a point on top of a floorplan block, at fractions (fx, fz) of its width and depth, so label dots can sit
    // beside the name printed on the block instead of on top of it
    function fpAt(part, q, pick, fx, fz, out) {
      const idx = FPB.findIndex((b, i) => b.part === part && b.q === q && (pick == null || pick-- === 0));
      const b = FPB[idx];
      fpLocal(b, st.E, _fb);
      return (out || V(0, 0, 0)).set(_fb.x + (fx - 0.5) * _fb.w, _fb.y0 + b.h, _fb.z + (fz - 0.5) * _fb.d).applyMatrix4(fpGroup.matrixWorld);
    }
    // Priorities: the part you click to go one level deeper always outranks the rest. "›" marks it: it sits on the
    // item the next level opens (the same one the level buttons and crumbs open), and clicking it zooms in.
    function labelSpecs() {
      const lv = st.level, s = st.sel, out = [], ex = st.ex;
      const add = (part, key, at, prio, text, extra) => out.push(Object.assign({ part, key, at, prio, text }, extra || {}));
      const tileAt = (i) => () => tileTop(i);
      const tpcAt = (g, t) => () => { const a = SMR[smIndex(g, t, 0)], b = SMR[smIndex(g, t, 1)]; return V((a.x0 + a.x1) / 2, L.tileBot + TILE_H, (a.z0 + b.z1) / 2); };
      const headAt = (g, part) => () => { const b = DB.find((d) => d.g === g && (part === 'raster' ? d.part === 'raster' : d.head)); return V(part === 'raster' ? (b.x0 + b.x1) / 2 : b.x0 + 0.35, L.dieTop + b.h, (b.z0 + b.z1) / 2); };
      if (lv === 0) {
        add('hbm', 'pkg:hbm:2', () => V(stackX(2), stackTop(L), stackZ(2)), 10, 'GPU RAM <small>HBM3</small>');
        add('gpc', 'die:gpc:' + s.gpc, headAt(s.gpc), 10.5, `GPC ${s.gpc + 1} ›`, { dive: {} });
        add('sm', 'tile:' + smIndex(1, 1, 0), tileAt(smIndex(1, 1, 0)), 9, 'SM'); // a GPC with no fused TPC, clear of the "Fused off" spots
        add('l2', 'die:l2', () => V(7.2, L.dieTop + 0.12, 0), 8, 'L2 cache');
        // any of the six fused-off TPCs can carry this label: the higher-priority pills often cover one of them
        const alts = [...FUSED].map((k) => { const [g, t] = k.split(':').map(Number); return { key: 'tile:' + smIndex(g, t, 0), at: tpcAt(g, t) }; });
        add('fused', alts[0].key, alts[0].at, 7.5, 'Fused off', { alts, ai: 0 });
        add('interposer', null, () => V(15.6, L.intTop, 10.3), ex ? 7 : 5, 'Silicon interposer');
        add('substrate', null, () => V(-21.2, L.subTop, -3), ex ? 6.5 : 4, 'Package substrate');
        add('mc', 'die:mc', () => V(-10.1, L.dieTop + 0.1, 1.45), 6, 'Memory controllers');
        add('giga', 'die:giga', () => V(-6.5, L.dieTop + 0.09, -9.19), 3, 'GigaThread Engine');
        add('hbmOff', 'pkg:hbmOff:' + OFF_STACK, () => V(stackX(OFF_STACK), stackTop(L), stackZ(OFF_STACK)), 2, 'Unused HBM site');
        add('nvlink', 'die:nvlink', () => V(6.5, L.dieTop + 0.07, 9.69), 1, 'NVLink');
      } else if (lv === 1) {
        const g = s.gpc, gr = gpcRect(g);
        add('gpc', 'die:gpc:' + g, headAt(g), 10, 'GPC ' + (g + 1));
        add('tpc', null, tpcAt(g, s.tpc), 10.5, `TPC ${s.tpc + 1} ›`, { dive: {} });
        add('sm', 'tile:' + smIndex(g, 7, 1), tileAt(smIndex(g, 7, 1)), 8, 'SM');
        add('raster', 'die:raster:' + g, headAt(g, 'raster'), 6, 'Raster engine');
        add('l2', 'die:l2', () => V((gr.x0 + gr.x1) / 2, L.dieTop + 0.12, gr.row === 0 ? 0.5 : -0.5), 5, 'L2 cache');
        for (let t = 0; t < 9; t++) if (!tpcOn(g, t)) { add('fused', null, tpcAt(g, t), 7, 'Fused off'); break; }
      } else if (lv === 2) {
        const g = s.gpc, t = s.tpc, on = tpcOn(g, t);
        add('tpc', null, () => { const a = SMR[smIndex(g, t, 0)]; return V(a.x0 + 0.1, L.tileBot + TILE_H, a.z1 + 0.035); }, 10, 'TPC ' + (t + 1) + ' of 9');
        for (const k of [0, 1]) {
          const next = on && k === s.sm;
          add('sm', 'tile:' + smIndex(g, t, k), tileAt(smIndex(g, t, k)), next ? 10.5 : k ? 8 : 9.5, `SM ${k + 1}${next ? ' ›' : ''}`, next ? { dive: { sm: k } } : null);
        }
        if (!on) add('fused', null, tpcAt(g, t), 11, 'Fused off');
      } else if (lv === 3) {
        const q = s.smsp;
        add('smsp', 'fp:smsp:' + q, () => fpAt('smsp', q, null, 0.5, 0.97), 11, `Sub-partition ${q + 1} ›`, { dive: { smsp: q } });
        add('ws', 'fp:ws:0', () => fpAt('ws', 0, null, 0.94, 0.5), 10, 'Warp Scheduler');
        add('tc', 'fp:tc:1', () => fpAt('tc', 1, null, 0.5, 0.78), 10, 'Tensor Core');
        add('rf', 'fp:rf:1', () => fpAt('rf', 1, null, 0.94, 0.5), 9, 'Register File');
        add('fp32', 'fp:fp32:2', () => fpAt('fp32', 2, 14, 0.85, 0.5), 9, 'FP32 CUDA Cores');
        add('l1d', 'fp:l1d', () => fpAt('l1d', -1, null, 0.86, 0.5), 9, 'L1 data cache / shared memory');
        add('tma', 'fp:tma', () => fpAt('tma', -1, null, 0.14, 0.5), 8, 'TMA');
        add('ldst', 'fp:ldst:2', () => fpAt('ldst', 2, 5, 0.5, 0.5), 7, 'LD/ST');
        add('sfu', 'fp:sfu:3', () => fpAt('sfu', 3, null, 0.88, 0.5), 7, 'SFU');
        add('l1i', 'fp:l1i', () => fpAt('l1i', -1, null, 0.12, 0.5), 6, 'L1 instruction cache');
      } else {
        const q = s.smsp;
        add('ws', 'fp:ws:' + q, () => fpAt('ws', q, null, 0.95, 0.5), 10, 'Warp Scheduler');
        add('rf', 'fp:rf:' + q, () => fpAt('rf', q, null, 0.95, 0.5), 10, 'Register File');
        add('tc', 'fp:tc:' + q, () => fpAt('tc', q, null, 0.5, 0.78), 10, 'Tensor Core');
        add('fp32', 'fp:fp32:' + q, () => fpAt('fp32', q, 8, 0.85, 0.5), 9, 'FP32');
        add('ldst', 'fp:ldst:' + q, () => fpAt('ldst', q, 2, 0.5, 0.5), 9, 'LD/ST ×8');
        add('int32', 'fp:int32:' + q, () => fpAt('int32', q, 4, 0.85, 0.5), 8, 'INT32');
        add('fp64', 'fp:fp64:' + q, () => fpAt('fp64', q, 4, 0.9, 0.5), 8, 'FP64');
        add('sfu', 'fp:sfu:' + q, () => fpAt('sfu', q, null, 0.88, 0.5), 8, 'SFU');
        add('du', 'fp:du:' + q, () => fpAt('du', q, null, 0.07, 0.5), 7, 'Dispatch Unit');
        add('l0', 'fp:l0:' + q, () => fpAt('l0', q, null, 0.3, 0.5), 6, 'L0 i-cache');
      }
      return out;
    }
    function buildLabels() {
      closeCard(true);
      ui.labels.textContent = '';
      labels = labelSpecs().map((sp) => {
        const P = PARTS[sp.part];
        const plain = sp.text.replace(/<[^>]+>/g, '').replace(' ›', '');
        const el = GG.el('button', { type: 'button', class: 'hero-lab is-off', 'data-tone': P.tone, 'aria-label': sp.dive ? `${plain}: zoom in` : `${plain}: details` });
        el.innerHTML = `<span class="hero-lab-stem"></span><span class="hero-lab-dot"></span><span class="hero-lab-pill"><i></i>${sp.text}</span>`;
        const pill = el.lastElementChild;
        const lab = Object.assign({ el, pill, w: 0, h: 0, x: -1e4, y: -1e4, on: false }, sp);
        el.addEventListener('mouseenter', () => { if (!coarse) { setHot(lab.key); openCard(lab, false); } });
        el.addEventListener('mouseleave', () => { if (!coarse) { setHot(null); scheduleClose(); } });
        el.addEventListener('pointerdown', (e) => { lab.touch = e.pointerType !== 'mouse'; });
        el.addEventListener('focus', () => { if (lab.touch) return; setHot(lab.key); openCard(lab, false); });
        el.addEventListener('blur', () => { lab.touch = false; if (!card.pinned) { setHot(null); scheduleClose(); } });
        el.addEventListener('click', (e) => {
          e.stopPropagation(); lab.touch = false;
          if (lab.dive) { diveFrom(lab, e.detail === 0); return; }
          if (card.lab === lab && card.pinned) { closeCard(); return; }
          setHot(lab.key); openCard(lab, true);
          if (e.detail === 0) { card.returnTo = el; const go = ui.card.querySelector('.hero-card-go a') || ui.card.querySelector('.hero-card-x'); if (go) go.focus(); }
        });
        ui.labels.appendChild(el);
        return lab;
      });
      // every part of this view as a chip, so parts whose label was culled stay reachable: a row under the model on
      // narrow screens, a list that opens from the foot on wide ones
      ui.parts.innerHTML = '<span>Parts</span>';
      ui.partsPop.textContent = '';
      const sorted = labels.slice().sort((a, b) => b.prio - a.prio);
      for (const box of [ui.parts, ui.partsPop]) sorted.forEach((lab) => {
        const P = PARTS[lab.part];
        const b = GG.el('button', { type: 'button', 'data-tone': P.tone });
        b.innerHTML = `<i></i>${lab.text.replace(/<small>.*<\/small>/, '').replace(' ›', '').trim()}`;
        b.addEventListener('click', (e) => {
          if (card.lab === lab && card.pinned) { closeCard(); return; }
          setHot(lab.key); openCard(lab, true);
          box.querySelectorAll('button').forEach((x) => x.classList.toggle('is-on', x === b));
          if (e.detail === 0) { card.returnTo = b; const go = ui.card.querySelector('.hero-card-zoom') || ui.card.querySelector('.hero-card-go a') || ui.card.querySelector('.hero-card-x'); if (go) go.focus(); }
        });
        box.appendChild(b);
      });
      ui.partsBtn.querySelector('b').textContent = labels.length;
      labelsDirty = true; viewDirty = true;
    }
    const STEM = 24;
    const hits = (r, list) => { for (const q of list) if (r.x0 < q.x1 && r.x1 > q.x0 && r.y0 < q.y1 && r.y1 > q.y0) return true; return false; };
    // Labels are culled by priority and collision, with hysteresis so they do not flicker while the model sways:
    // a shown label wins ties against one that is hidden, a label that just hid waits HIDE_HOLD ms before it may
    // come back, and the pill of a label that is fading out still blocks its spot until the fade has finished.
    const HIDE_HOLD = 450, FADE_MS = 220;
    function placeLabels() {
      const W = st.W, H = st.H, max = W <= NARROW ? 5 : 10, placed = [];
      const pad = 4, now = performance.now();
      let pending = false;
      for (const lab of labels) if (!lab.w) { lab.w = lab.pill.offsetWidth; lab.h = lab.pill.offsetHeight; }
      // a fading pill blocks its spot only for labels that do not outrank it (otherwise two labels can take turns)
      const fading = [];
      for (const lab of labels) if (!lab.on && lab.rect && now - lab.offAt < FADE_MS) { fading.push(Object.assign({ prio: lab.prio }, lab.rect)); pending = true; }
      const order = labels.slice().sort((a, b) => (b.prio + (b.on ? 0.25 : 0)) - (a.prio + (a.on ? 0.25 : 0)));
      // project every anchor first. Higher-priority dots are already in placed, and a label shows only if its own
      // dot is clear of the pills placed before it, so no pill ever covers a dot
      const proj = (at) => {
        _v.copy(at()).project(camera);
        const sx = ((_v.x + 1) / 2) * W, sy = ((1 - _v.y) / 2) * H;
        return { sx, sy, vis: _v.z < 1 && sx > 4 && sx < W - 4 && sy > 4 && sy < H - 4 };
      };
      for (const lab of order) {
        Object.assign(lab, proj(lab.at));
        if (lab.alts) lab.cands = lab.alts.map((a, i) => (i === lab.ai ? { sx: lab.sx, sy: lab.sy, vis: lab.vis } : proj(a.at)));
      }
      // the pill for a dot at (x, y): on the side it is already on first, then the other side
      const fit = (lab, x, y, vis) => {
        if (!vis || hits({ x0: x - 5, x1: x + 5, y0: y - 5, y1: y + 5 }, placed)) return null;
        for (const dn of lab.down ? [true, false] : [false, true]) {
          const y0 = dn ? y + STEM : y - STEM - lab.h;
          const c = { x0: x - lab.w / 2 - pad, x1: x + lab.w / 2 + pad, y0: y0 - pad, y1: y0 + lab.h + pad };
          if (c.x0 < 2 || c.x1 > W - 2 || c.y0 < 2 || c.y1 > H - 2) continue;
          if (hits(c, placed) || hits(c, panelRects) || fading.some((f) => f.prio >= lab.prio && hits(c, [f]))) continue;
          return { r: c, down: dn };
        }
        return null;
      };
      let shown = 0;
      for (const lab of order) {
        let ok = shown < max;
        if (ok && !lab.on && lab.offAt && now - lab.offAt < HIDE_HOLD) { ok = false; pending = true; }
        let f = ok ? fit(lab, lab.sx, lab.sy, lab.vis) : null;
        // a label with several equivalent anchors moves to the first clear one, but only while it is hidden, so a
        // shown label never jumps
        if (ok && !f && lab.alts && !lab.on) {
          for (let i = 0; i < lab.alts.length && !f; i++) {
            const c = lab.cands[i];
            if (i === lab.ai || !(f = fit(lab, c.sx, c.sy, c.vis))) continue;
            lab.ai = i; lab.at = lab.alts[i].at; lab.key = lab.alts[i].key; lab.sx = c.sx; lab.sy = c.sy; lab.vis = c.vis;
          }
        }
        ok = !!f;
        const x = lab.sx, y = lab.sy;
        let r = f ? f.r : null;
        const down = f ? f.down : false;
        if (!ok && card.lab === lab && card.pinned) { ok = true; r = null; }
        if (ok) { if (r) { placed.push(r, { x0: x - 6, x1: x + 6, y0: y - 6, y1: y + 6 }); lab.rect = r; } shown++; }
        if (Math.abs(x - lab.x) > 0.25 || Math.abs(y - lab.y) > 0.25) { lab.el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`; lab.x = x; lab.y = y; }
        if (ok && down !== !!lab.down) { lab.el.classList.toggle('is-down', down); lab.down = down; }
        if (ok !== lab.on) { lab.el.classList.toggle('is-off', !ok); lab.on = ok; if (!ok) lab.offAt = now; }
      }
      if (pending) labelsDirty = true;
      if (card.lab && !card.hidden) positionCard();
    }

    /* ═══════════ part cards and tooltips ═══════════ */
    const card = { lab: null, pinned: false, hidden: true, closeT: 0, at: null };
    function partHTML(partKey, ctx) {
      const P = PARTS[partKey];
      let tag = P.tag || '', facts = P.facts || [];
      let name = P.name;
      if (ctx && ctx.tile != null) {
        const r = SMR[ctx.tile];
        name = r.on ? 'SM' : 'SM (fused off)';
        tag = `GPC ${r.g + 1} › TPC ${r.t + 1} › SM ${r.k + 1}`;
        facts = r.on ? PARTS.sm.facts : [['Status', 'fused off on H100 SXM5'], ['Resident threads', '0']];
      }
      const also = P.also && (!ctx || ctx.tile == null) ? `<br><span>See also:</span> ${P.also.map(([id, label]) => T(id, GG.esc(label))).join(', ')}` : '';
      const link = P.term ? `<div class="hero-card-go">${T(P.term, 'Open the glossary entry: ' + GG.esc(GG.name(P.term)) + ' →')}${also}</div>`
        : P.rel ? `<div class="hero-card-go"><span>No entry of its own. Related:</span> ${T(P.rel[0], GG.esc(P.rel[1]) + ' →')}${also}</div>`
          : `<div class="hero-card-go"><span>No glossary entry: described here only.</span></div>`;
      return `<div class="hero-card-h" data-tone="${P.tone}"><i></i><strong>${GG.esc(name)}</strong><button type="button" class="hero-card-x" aria-label="Close">×</button></div>
        ${tag ? `<div class="hero-card-tag">${GG.esc(tag)}</div>` : ''}<p>${P.html}</p>
        ${facts.length ? `<dl>${facts.map(([k, v, src]) => `<dt>${GG.esc(k)}</dt><dd>${GG.esc(v)}${src ? `<small>${SRC[src]}</small>` : ''}</dd>`).join('')}</dl>` : ''}${link}`;
    }
    function openCard(lab, pinned, point) {
      clearTimeout(card.closeT);
      const same = card.lab === lab && !card.hidden;
      card.lab = lab; card.pinned = pinned || (same && card.pinned); card.at = point || null;
      if (pinned) pauseTour();
      if (!same || point) {
        ui.card.innerHTML = partHTML(lab.part, lab.ctx);
        decorate(ui.card);
        ui.card.querySelector('.hero-card-x').addEventListener('click', () => closeCard());
        if (lab.dive) {
          // the same zoom as clicking the "›" label, for readers who reached this card from the Parts row
          const z = GG.el('button', { type: 'button', class: 'hero-card-zoom', text: `Zoom into ${lab.text.replace(/<[^>]+>/g, '').replace(' ›', '')} ›` });
          z.addEventListener('click', (e) => { e.stopPropagation(); diveFrom(lab, e.detail === 0); });
          ui.card.insertBefore(z, ui.card.querySelector('.hero-card-go'));
        }
      }
      ui.card.hidden = false; card.hidden = false;
      labels.forEach((l) => l.el.classList.toggle('is-on', l === lab));
      positionCard();
    }
    // a "›" label (or its card's Zoom button): select the labelled item and go one level deeper, like a click on it
    // in the model. A keyboard user lands on the model, whose label describes the new view.
    function diveFrom(lab, keyboard) {
      closeCard(true); setHot(null);
      select(lab.dive);
      setLevel(st.level + 1);
      pauseTour();
      if (keyboard) ui.canvas.focus({ preventScroll: true });
    }
    function scheduleClose() { if (card.pinned) return; clearTimeout(card.closeT); card.closeT = setTimeout(() => closeCard(), 260); }
    function closeCard(silent) {
      clearTimeout(card.closeT);
      const back = card.returnTo; card.returnTo = null;
      if (back && ui.card.contains(document.activeElement)) back.focus();
      card.lab = null; card.pinned = false; card.hidden = true; card.at = null;
      ui.card.hidden = true;
      labels.forEach((l) => l.el.classList.remove('is-on'));
      [ui.parts, ui.partsPop].forEach((box) => box.querySelectorAll('.is-on').forEach((x) => x.classList.remove('is-on')));
      if (!silent) setHot(null);
    }
    ui.card.addEventListener('mouseenter', () => { if (!coarse) clearTimeout(card.closeT); });
    // reading the readout holds the tour on the current step
    ui.read.addEventListener('mouseenter', () => { st.tourHold = true; });
    ui.read.addEventListener('mouseleave', () => { st.tourHold = false; });
    ui.card.addEventListener('mouseleave', () => { if (!coarse) scheduleClose(); });
    function positionCard() {
      ui.card.style.maxHeight = st.W <= NARROW ? Math.max(160, st.H - 24) + 'px' : ''; // phones: a long card scrolls inside the model
      const cw = ui.card.offsetWidth, ch = ui.card.offsetHeight, ox = ui.stage.offsetLeft, oy = ui.stage.offsetTop;
      if (st.W <= NARROW) {
        const ly = card.at ? card.at.y : card.lab.y;
        const top = ly > st.H * 0.5 ? oy + 12 : oy + st.H - ch - 12;
        ui.card.style.transform = `translate(${ox + 12}px,${Math.round(top)}px)`;
        return;
      }
      let x, y;
      if (card.at) { x = card.at.x + 16; y = card.at.y - 20; }
      else { const lab = card.lab; x = lab.x + lab.w / 2 + 12; y = lab.down ? lab.y + STEM - 8 : lab.y - STEM - lab.h - 8; }
      if (x + cw > st.W - 12) x = (card.at ? card.at.x : card.lab.x - card.lab.w / 2) - cw - 12;
      x = clamp(x, 12, st.W - cw - 12); y = clamp(y, 12, st.H - ch - 12);
      ui.card.style.transform = `translate(${Math.round(x + ox)}px,${Math.round(y + oy)}px)`;
    }

    // hover tooltip for any part under the pointer
    function tipFor(hit) {
      if (!hit) return null;
      const P = PARTS[hit.part];
      if (!P) return null;
      let t = P.name, sub = '';
      if (hit.tile != null) {
        const r = SMR[hit.tile];
        t = `SM · GPC ${r.g + 1} › TPC ${r.t + 1} › SM ${r.k + 1}`;
        sub = r.on ? (st.level < 3 ? 'click to zoom in' : 'click to lift this SM') : 'fused off on H100 SXM5';
      } else if (hit.part === 'gpc') { t = `GPC ${hit.g + 1}`; sub = st.level === 0 ? 'click to zoom in' : ''; }
      else if (hit.q != null && hit.q >= 0 && st.level === 3) sub = `sub-partition ${hit.q + 1} · click to zoom in`;
      else sub = P.tag || '';
      return { t, sub, tone: P.tone };
    }
    function showTip(hit, x, y) {
      const d = tipFor(hit);
      if (!d) { ui.tip.classList.remove('on'); return; }
      ui.tip.innerHTML = `<i style="--c:var(--${d.tone === 'ink' || d.tone === 'dim' ? 'ink-2' : d.tone})"></i>${GG.esc(d.t)}${d.sub ? `<span>${GG.esc(d.sub)}</span>` : ''}`;
      const sr = ui.stage.getBoundingClientRect(), hr = hero.getBoundingClientRect();
      const tw = ui.tip.offsetWidth, th = ui.tip.offsetHeight;
      let tx = x + 16, ty = y + 18;
      if (tx + tw > st.W - 8) tx = x - tw - 12;
      if (ty + th > st.H - 8) ty = y - th - 12;
      ui.tip.style.transform = `translate(${Math.round(tx + sr.left - hr.left)}px,${Math.round(ty + sr.top - hr.top)}px)`;
      ui.tip.classList.add('on');
    }

    /* ═══════════ picking ═══════════ */
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    function pick(x, y) {
      ndc.set((x / st.W) * 2 - 1, -(y / st.H) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const objs = [tiles.mesh, dieColl.mesh, pkgColl.mesh, interposer, substrate, dieSlab];
      if (fpGroup.visible && st.lift > 0.9) objs.unshift(fpColl.mesh);
      const hits = ray.intersectObjects(objs, false);
      for (const h of hits) {
        const o = h.object;
        if (o === fpColl.mesh) { const b = FPB[h.instanceId]; if (b.part === 'smplate') return { part: 'sm', key: null, fpSm: true }; return { part: b.part, q: b.q, key: 'fp:' + b.part + (b.q >= 0 ? ':' + b.q : '') }; }
        if (o === tiles.mesh) return { part: SMR[h.instanceId].on ? 'sm' : 'fused', tile: h.instanceId, key: 'tile:' + h.instanceId };
        if (o === dieColl.mesh) { const b = DB[h.instanceId]; return { part: b.part, g: b.g, key: 'die:' + b.part + (b.g != null ? ':' + b.g : b.part === 'mc' ? ':' + b.stack : ''), stack: b.stack }; }
        if (o === pkgColl.mesh) {
          const b = PK[h.instanceId];
          if (b.part === 'cap') return { part: 'cap', key: 'pkg:cap' };
          if (b.part === 'tsv') return { part: 'tsv', key: 'pkg:tsv:' + b.s };
          const part = b.part === 'hbmOff' ? 'hbmOff' : b.part === 'dram' && st.E > 0.5 ? 'dram' : 'hbm';
          return { part, s: b.s, key: 'pkg:' + (b.part === 'hbmOff' ? 'hbmOff' : 'hbm') + ':' + b.s };
        }
        if (o.userData.part) return { part: o.userData.part, key: null };
      }
      return null;
    }
    function dive(hit) {
      if (!hit) return false;
      const went = diveTo(hit);
      if (went) pauseTour();
      return went;
    }
    function diveTo(hit) {
      const lv = st.level, s = st.sel;
      if (hit.tile != null) {
        const r = SMR[hit.tile];
        if (lv === 0) { select({ gpc: r.g, tpc: r.t, sm: r.k }); setLevel(1); return true; }
        if (lv === 1) { if (r.g === s.gpc) { select({ tpc: r.t, sm: r.k }); setLevel(2); } else { select({ gpc: r.g, tpc: r.t, sm: r.k }); setLevel(1); } return true; }
        if (lv === 2) {
          if (r.g === s.gpc && r.t === s.tpc) { if (!r.on) { toast('This TPC is fused off on H100 SXM5: nothing to lift.'); return true; } select({ sm: r.k }); setLevel(3); }
          else { select({ gpc: r.g, tpc: r.t, sm: r.k }); setLevel(2); }
          return true;
        }
        if (!r.on) { toast('That SM is fused off on H100 SXM5.'); return true; }
        select({ gpc: r.g, tpc: r.t, sm: r.k }); setLevel(3, { relift: true }); return true;
      }
      if (hit.part === 'gpc' && hit.g != null && lv === 0) { select({ gpc: hit.g }); setLevel(1); return true; }
      if (hit.q != null && hit.q >= 0 && lv >= 3) { select({ smsp: hit.q }); setLevel(4); return true; }
      return false;
    }

    /* ═══════════ pointer, wheel, keys ═══════════ */
    const cv = ui.canvas;
    const ptrs = new Map();
    let dragMode = null, downAt = null, moved = 0, lastPinch = 0, lastMid = null, hoverXY = null, engaged = false, hoverSince = 0;
    const local = (e) => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    function setEngaged(v) { engaged = v; ui.stage.classList.toggle('is-engaged', v); }
    cv.addEventListener('pointerdown', (e) => {
      const p = local(e);
      ptrs.set(e.pointerId, p);
      if (e.pointerType === 'mouse') {
        if (e.button !== 0) return;
        cv.setPointerCapture(e.pointerId);
        dragMode = 'rotate'; dragging = true; cv.classList.add('is-drag');
        // a click on the title block (which lets clicks through to the canvas) must not capture the wheel
        lastInteract = performance.now();
        if (!hits({ x0: p.x, x1: p.x, y0: p.y, y1: p.y }, panelRects)) setEngaged(true);
      } else if (ptrs.size === 2) {
        dragMode = 'pinch'; dragging = true;
        const [a, b] = [...ptrs.values()];
        lastPinch = Math.hypot(a.x - b.x, a.y - b.y); lastMid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      } else dragMode = 'pending';
      downAt = { x: p.x, y: p.y, t: performance.now(), type: e.pointerType }; moved = 0;
      ui.tip.classList.remove('on');
    });
    cv.addEventListener('pointermove', (e) => {
      const p = local(e);
      if (!ptrs.has(e.pointerId)) {
        if (e.pointerType === 'mouse') {
          hoverXY = p; wake();
          if (!hoverSince) hoverSince = performance.now();
          // leaving the model's own area (into the title side of the hero) releases the wheel
          const f = st.focus;
          if (engaged && (p.x < f.x0 || p.x > f.x1 || p.y < f.y0 - 40 || p.y > f.y1 + 40)) setEngaged(false);
        }
        return;
      }
      if (dragMode === 'rotate') lastInteract = performance.now();
      const prev = ptrs.get(e.pointerId);
      ptrs.set(e.pointerId, p);
      const dx = p.x - prev.x, dy = p.y - prev.y;
      if (downAt) moved = Math.max(moved, Math.hypot(p.x - downAt.x, p.y - downAt.y));
      const k = (2 * Math.PI * 0.85) / (e.pointerType === 'mouse' ? Math.max(700, st.H) : 1000);
      if (dragMode === 'rotate') { if (moved > 3) orbit(-dx * k, -dy * k); }
      else if (dragMode === 'pending' && e.pointerType !== 'mouse') {
        const tx = p.x - downAt.x, ty = p.y - downAt.y;
        if (Math.abs(tx) > 8 && Math.abs(tx) > Math.abs(ty) * 1.2) { dragMode = 'spin'; dragging = true; }
      } else if (dragMode === 'spin') orbit(-dx * k, 0);
      else if (dragMode === 'pinch' && ptrs.size >= 2) {
        const [a, b] = [...ptrs.values()];
        const dist = Math.hypot(a.x - b.x, a.y - b.y), mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        if (lastPinch > 0 && dist > 0) dolly(lastPinch / dist);
        orbit(-(mid.x - lastMid.x) * k, -(mid.y - lastMid.y) * k);
        lastPinch = dist; lastMid = mid;
      }
    });
    function endPtr(e) {
      const had = ptrs.has(e.pointerId);
      ptrs.delete(e.pointerId);
      if (!had) return;
      const tap = downAt && e.type === 'pointerup' && moved < 6 && performance.now() - downAt.t < 600 && dragMode !== 'pinch';
      if (tap) {
        const p = local(e);
        const hit = pick(p.x, p.y);
        if (!dive(hit)) {
          if (hit && PARTS[hit.part]) openCard({ part: hit.part, ctx: hit.tile != null ? { tile: hit.tile } : null, key: hit.key, x: p.x, y: p.y, w: 0, h: 0 }, true, p);
          else closeCard();
        }
      }
      if (ptrs.size === 0) { dragMode = null; dragging = false; downAt = null; cv.classList.remove('is-drag'); }
      else if (ptrs.size === 1) dragMode = 'pending';
    }
    cv.addEventListener('pointerup', endPtr);
    cv.addEventListener('pointercancel', endPtr);
    cv.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { hoverXY = null; hoverSince = 0; ui.tip.classList.remove('on'); cv.classList.remove('is-point'); if (!hotLabel()) setHot(null); } });
    ui.stage.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && !dragging) setEngaged(false); });
    cv.addEventListener('contextmenu', (e) => e.preventDefault());
    const hotLabel = () => card.lab && !card.hidden;
    let toastT = 0;
    function toast(html) {
      ui.toast.innerHTML = html;
      const sr = ui.stage.getBoundingClientRect(), hr = hero.getBoundingClientRect();
      ui.toast.style.left = Math.round(sr.left - hr.left + (st.focus.x0 + st.focus.x1) / 2) + 'px';
      ui.toast.style.top = Math.round(sr.top - hr.top + st.H * (st.W <= NARROW ? 0.06 : 0.12)) + 'px';
      ui.toast.classList.add('on');
      clearTimeout(toastT); toastT = setTimeout(() => ui.toast.classList.remove('on'), 2300);
    }
    // The wheel zooms only after a click on the model (or with Ctrl/⌘). Engagement ends on Esc, when the
    // pointer leaves the model's area, after WHEEL_IDLE ms without touching the model, or when the zoom is
    // already at its limit, so the page always gets its scroll back.
    const WHEEL_IDLE = 2000;
    let toastShown = false;
    try { toastShown = sessionStorage.getItem('ww-hero-wheel-hint') === '1'; } catch (err) { /* storage blocked */ }
    cv.addEventListener('wheel', (e) => {
      const now = performance.now();
      if (engaged && !e.ctrlKey && !e.metaKey && now - lastInteract > WHEEL_IDLE) setEngaged(false);
      if (engaged || e.ctrlKey || e.metaKey) {
        const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * 400 : e.deltaY;
        if (!dy) return;
        if (dolly(Math.exp(clamp(dy, -60, 60) * (e.ctrlKey ? 0.006 : 0.0022)))) { e.preventDefault(); lastInteract = now; }
        else if (!e.ctrlKey && !e.metaKey) setEngaged(false);
        else e.preventDefault(); // keep Ctrl+wheel from zooming the page
        return;
      }
      // a one-time hint, only for someone who has been resting on the model, not for ordinary page scrolling
      if (!toastShown && hoverSince && now - hoverSince > 1000) {
        toastShown = true;
        try { sessionStorage.setItem('ww-hero-wheel-hint', '1'); } catch (err) { /* storage blocked */ }
        toast('To zoom with the wheel, click the model first or hold <kbd>Ctrl</kbd>/<kbd>⌘</kbd>');
      }
      hoverSince = 0;
    }, { passive: false });
    cv.addEventListener('keydown', (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      if (k === 'ArrowLeft') orbit(0.12, 0); else if (k === 'ArrowRight') orbit(-0.12, 0);
      else if (k === 'ArrowUp') orbit(0, -0.08); else if (k === 'ArrowDown') orbit(0, 0.08);
      else if (k === '+' || k === '=') dolly(0.87); else if (k === '-' || k === '_') dolly(1.15);
      else return;
      e.preventDefault();
    });
    cv.addEventListener('blur', () => setEngaged(false));
    window.addEventListener('keydown', (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Escape') { if (!card.hidden) closeCard(); else if (!ui.partsPop.hidden) { setPartsOpen(false); ui.partsBtn.focus(); } setEngaged(false); if (st.tour >= 0) stopTour(); return; }
      const t = e.target;
      if (t && t.closest && t.closest('input, textarea, select, [contenteditable], dialog[open]')) return;
      if (!onScreen || hero.getBoundingClientRect().bottom < innerHeight * 0.35) return;
      if (/^[1-5]$/.test(e.key)) { e.preventDefault(); stopTour(); setLevel(+e.key - 1); }
      else if (e.key === 'e' || e.key === 'E') { e.preventDefault(); stopTour(); setExploded(!st.ex); }
    });
    document.addEventListener('pointerdown', (e) => {
      if (!card.hidden && card.pinned && !ui.card.contains(e.target) && !e.target.closest('.hero-lab, .hero-parts, .hero-partspop') && e.target !== cv) closeCard();
    });

    /* ═══════════ controls ═══════════ */
    const seg = GG.el('div', { class: 'seg hero-levels', role: 'group', 'aria-label': 'Zoom level' });
    const lvlBtns = LEVELS.map((Lv, i) => {
      const b = GG.el('button', { type: 'button', title: `${Lv.sub} (key ${i + 1})`, 'aria-pressed': 'false' });
      b.innerHTML = `<i aria-hidden="true">${i + 1}</i>${Lv.label}`;
      b.addEventListener('click', () => { stopTour(); setLevel(i); });
      if (i === 1) {
        // previewing the GPC level from the GPU view lights up all eight GPC outlines
        b.addEventListener('mouseenter', () => { groupPeek = true; setFocus(); });
        b.addEventListener('mouseleave', () => { groupPeek = false; setFocus(); });
      }
      seg.append(b);
      return b;
    });
    ui.ctl.append(seg);
    const ctlHead = ui.ctl.querySelector('.hero-ctl-h');
    const row1 = GG.el('div', { class: 'hero-row' });
    ui.ctl.append(row1);
    const layers = GG.ui.seg(row1, { label: 'Layers', options: [{ value: 'x', label: 'Exploded', title: 'Pull the layers apart (key E)' }, { value: 'a', label: 'Assembled', title: 'Snap the layers together (key E)' }], value: 'x', onChange: (v) => { stopTour(); setExploded(v === 'x'); } });
    row1.append(GG.el('span', { class: 'hero-sp' }));
    // Animate: the memory traffic, the warp scheduler and the idle sway. Off stops every looping motion and the render
    // loop with it; the Step button then advances the scheduler by hand.
    const autoT = GG.ui.toggle(row1, { label: 'Animate', value: st.auto, onChange: (v) => {
      st.auto = v; idle = 99; sway.on = false; packets.visible = v;
      if (!v) { tileGlow.fill(0); tiles.glow.needsUpdate = true; }
      buildSlots(); tickDirty = true; wake();
    } });
    autoT.el.title = 'Memory traffic, the warp scheduler and a slow sway of the model';
    const tourBtn = GG.ui.button(ctlHead, { label: 'Tour', icon: 'play', primary: false, title: `A ${TOUR.length}-step guided tour, from the package down to one sub-partition`, onClick: () => (st.tour >= 0 ? stopTour() : startTour()) });
    const resetBtn = GG.ui.button(ctlHead, { label: 'Reset view', icon: 'reset', ariaLabel: 'Reset view', title: 'Back to this level’s starting view', onClick: () => { glideTo(st.level); } });
    resetBtn.classList.add('hero-reset'); tourBtn.classList.add('hero-tourbtn'); layers.el.classList.add('hero-layers'); autoT.el.classList.add('hero-auto');
    ui.hint.innerHTML = coarse
      ? 'swipe sideways to orbit · pinch to zoom · two fingers to tilt · tap a part'
      : 'drag to orbit · click, then scroll to zoom · <kbd>1</kbd>–<kbd>5</kbd> levels · <kbd>E</kbd> explode';

    function setPartsOpen(v) {
      ui.partsPop.hidden = !v;
      ui.partsBtn.setAttribute('aria-expanded', String(v));
      measurePanels(); // labels keep clear of the open list
    }
    ui.partsBtn.addEventListener('click', () => setPartsOpen(ui.partsPop.hidden));

    GG.ui.button(ui.rmstep, { icon: 'next', label: 'Step one clock', title: 'Issue the next warp instruction of this sub-partition', onClick: () => rmStep() });
    ui.rmstep.append(GG.el('span', { text: 'animation is off: step the scheduler by hand' }));

    // tour controls
    const tourPrev = GG.ui.button(ui.tour, { icon: 'prev', ariaLabel: 'Previous tour step', onClick: () => tourGo(st.tour - 1) });
    const tourNext = GG.ui.button(ui.tour, { icon: 'next', label: 'Next', onClick: () => tourGo(st.tour + 1) });
    GG.ui.button(ui.tour, { label: 'End tour', onClick: () => stopTour() });

    /* ═══════════ state changes ═══════════ */
    function select(o) {
      Object.assign(st.sel, o);
      if (o.gpc != null && o.tpc == null) {
        // keep the TPC choice on an enabled TPC in the new GPC
        if (!tpcOn(st.sel.gpc, st.sel.tpc)) for (let t = 0; t < 9; t++) if (tpcOn(st.sel.gpc, t)) { st.sel.tpc = t; break; }
      }
    }
    function setLevel(i, opts) {
      opts = opts || {};
      i = clamp(i | 0, 0, 4);
      if (i >= 3 && !tpcOn(st.sel.gpc, st.sel.tpc)) {
        // a fused-off TPC has nothing to lift: pick the nearest enabled TPC in this GPC
        let best = -1, bd = 99;
        for (let t = 0; t < 9; t++) if (tpcOn(st.sel.gpc, t)) { const d = Math.abs(t - st.sel.tpc); if (d < bd) { bd = d; best = t; } }
        st.sel.tpc = best;
      }
      const prev = st.level;
      st.level = i;
      hero.classList.toggle('hero-deep', i >= 1);
      if (i >= 3) {
        const cur = selSM();
        if (st.liftSM !== cur || opts.relift) { if (st.liftSM >= 0 && st.liftSM !== cur && st.lift > 0.01) st.lift = 0; st.liftSM = cur; }
        st.liftT = 1;
      } else st.liftT = 0;
      glideTo(i);
      setFocus();
      buildLabels();
      renderReadout(prev !== i);
    }
    function setExploded(v) {
      st.ex = !!v; st.Et = v ? 1 : 0;
      if (RM) st.E = st.Et;
      layers.set(v ? 'x' : 'a', false);
      layoutDirty = true;
      glide = { from: snap(goal), level: st.level, t: 0, dur: RM ? 0 : 1.1, keepView: userMoved };
      if (RM) { stepGlide(1); glide = null; copyState(cam, goal); }
      renderReadout(false);
      wake();
    }

    /* ═══════════ readout: level, crumbs, chips, why ═══════════ */
    let chipEls = [];
    function chipsFor(lv) {
      const s = st.sel;
      if (lv === 0) {
        const n = ENABLED_SMS;
        return [
          { k: 'SMs', v: n, sub: 'of 144 on the die' },
          { k: 'Tensor Cores', v: n * F.tcPerSm, sub: `${n} × ${F.tcPerSm}`, tone: 'core' },
          { k: 'FP32 cores', v: n * F.fp32PerSm, sub: `${n} × ${F.fp32PerSm}`, tone: 'core' },
          { k: 'Threads', v: n * F.threadsPerSm, sub: `${n} × 2,048 resident` },
          { k: 'GPU RAM', v: '80 GiB', sub: 'HBM3 · 5 × 16 GiB', tone: 'memory' },
          { k: 'Bandwidth', v: '3.35 TB/s', sub: 'HBM3 → die', tone: 'memory' },
        ];
      }
      if (lv === 1) {
        const tp = tpcsOnIn(s.gpc), sm = tp * 2;
        return [
          { k: 'TPCs', v: tp, sub: tp === 9 ? 'all 9 enabled' : `of 9 · ${9 - tp} off (illustrative)` },
          { k: 'SMs', v: sm, sub: `${tp} × 2` },
          { k: 'Warp schedulers', v: sm * F.smsp, sub: `${sm} × ${F.smsp}`, tone: 'control' },
          { k: 'Tensor Cores', v: sm * F.tcPerSm, sub: `${sm} × ${F.tcPerSm}`, tone: 'core' },
          { k: 'FP32 cores', v: sm * F.fp32PerSm, sub: `${sm} × ${F.fp32PerSm}`, tone: 'core' },
          { k: 'Threads', v: sm * F.threadsPerSm, sub: `${sm} × 2,048 resident` },
        ];
      }
      if (lv === 2) {
        // computed from the enabled state: a fused-off TPC still has its units on the die, but none can be used
        const on = tpcOn(s.gpc, s.tpc), n = on ? 2 : 0, off = on ? '' : ' on the die, disabled';
        return [
          { k: 'SMs', v: 2, sub: on ? 'a pair, both enabled' : 'a pair · 0 enabled', tone: on ? null : 'dim' },
          { k: 'Warp schedulers', v: n * F.smsp, sub: on ? `2 × ${F.smsp}` : `${2 * F.smsp}${off}`, tone: on ? 'control' : 'dim' },
          { k: 'Tensor Cores', v: n * F.tcPerSm, sub: on ? `2 × ${F.tcPerSm}` : `${2 * F.tcPerSm}${off}`, tone: on ? 'core' : 'dim' },
          { k: 'FP32 cores', v: n * F.fp32PerSm, sub: on ? `2 × ${F.fp32PerSm}` : `${2 * F.fp32PerSm}${off}`, tone: on ? 'core' : 'dim' },
          { k: 'Threads', v: n * F.threadsPerSm, sub: on ? '2 × 2,048 resident' : 'none resident', tone: on ? null : 'dim' },
          { k: 'Status', v: on ? 'enabled' : 'fused off', sub: 'on H100 SXM5', tone: on ? null : 'danger' },
        ];
      }
      if (lv === 3) {
        return [
          { k: 'Sub-partitions', v: 4, sub: 'share L1 + TMA' },
          { k: 'Warp schedulers', v: 4, sub: '1 per sub-partition', tone: 'control' },
          { k: 'FP32 units', v: 128, sub: '4 × 32', tone: 'core' },
          { k: 'Tensor Cores', v: 4, sub: '4th generation', tone: 'core' },
          { k: 'Registers', v: 65536, sub: '× 32-bit = 256 KiB', tone: 'memory' },
          { k: 'L1 / shared', v: '256 KiB', sub: 'up to 228 KiB shared', tone: 'memory' },
          { k: 'Warps', v: 64, sub: '= 2,048 threads resident' },
        ];
      }
      return [
        { k: 'Threads / clock', v: 32, sub: '1 warp instruction', tone: 'control' },
        { k: 'Warp slots', v: 16, sub: '64 per SM ÷ 4', tone: 'memory' },
        { k: 'Registers', v: 16384, sub: '× 32-bit = 64 KiB', tone: 'memory' },
        { k: 'INT32/FP32/FP64', v: '16 / 32 / 16', sub: 'lanes · 2/1/2 clk a warp', tone: 'core' },
        { k: 'Tensor Core', v: 1, sub: '4th generation', tone: 'core' },
        { k: 'LD/ST units', v: 8, sub: 'to L1 / shared', tone: 'special' },
        { k: 'SFU', v: '1 block', sub: '4/clk · 8 clk a warp', tone: 'special' },
      ];
    }
    const tweens = [];
    function renderChips() {
      const list = chipsFor(st.level);
      const prev = new Map(chipEls.map((c) => [c.k, c]));
      ui.chips.textContent = '';
      tweens.length = 0;
      chipEls = list.map((c) => {
        const el = GG.el('div', { class: 'stat hero-chip', 'data-tone': c.tone || null });
        const b = GG.el('b');
        el.append(GG.el('i', { text: c.k }), b, GG.el('em', { text: c.sub || '' }));
        ui.chips.append(el);
        const p = prev.get(c.k);
        if (typeof c.v === 'number' && p && typeof p.v === 'number' && p.v !== c.v && !RM) { tweens.push({ b, a: p.v, z: c.v, t: 0 }); b.textContent = fmtInt(p.v); }
        else b.textContent = typeof c.v === 'number' ? fmtInt(c.v) : c.v;
        if (!p && !RM) { el.classList.add('is-new'); requestAnimationFrame(() => el.classList.remove('is-new')); }
        return { k: c.k, v: c.v, el };
      });
    }
    function whyHTML() {
      const lv = st.level, s = st.sel;
      if (st.tour >= 0) return TOUR[st.tour].html;
      if (lv === 0) {
        return (st.ex ? '<b>The whole package, pulled apart.</b> ' : '<b>The whole package, as it ships.</b> ') +
          `Five HBM3 stacks of ${T('gpu-ram', 'GPU RAM')} (80 GiB) sit beside the die on a silicon interposer and feed it 3.35 TB/s. The die has 144 ${T('streaming-multiprocessor', 'SMs')} in 8 outlined ${T('graphics-processing-cluster', 'GPCs')}; H100 SXM5 enables 132, so the 12 dim tiles are fused off (which ones is illustrative).`;
      }
      if (lv === 1) {
        const off = 9 - tpcsOnIn(s.gpc);
        return `<b>GPC ${s.gpc + 1} of 8.</b> Nine ${T('texture-processing-cluster', 'TPCs')} of two ${T('streaming-multiprocessor', 'SMs')} each, arranged 3 × 3 here for illustration${off ? `; in this illustration ${off === 1 ? 'one TPC is' : off + ' TPCs are'} fused off` : ''}. Since ${T('compute-capability', 'compute capability')} 9.0, a cluster of ${T('thread-block', 'thread blocks')} is scheduled onto a single GPC. The glossary’s GPC also has a raster engine for graphics, but H100 is built for compute: only two of its TPCs can run graphics shaders.`;
      }
      if (lv === 2) {
        const on = tpcOn(s.gpc, s.tpc);
        return `<b>TPC ${s.tpc + 1} of 9${on ? '' : ', fused off'}.</b> A ${T('texture-processing-cluster', 'TPC')} is a pair of adjacent ${T('streaming-multiprocessor', 'SMs')}. Before Blackwell it maps onto no level of the ${T('cuda-programming-model', 'programming model')}; Blackwell’s <code>tcgen05</code> instructions can run a “CTA pair” across both SMs (<code>.cta_group::2</code>).`;
      }
      if (lv === 3) {
        return `<b>One SM, lifted out of the die${st.ex ? ' and pulled apart' : ''}.</b> Four sub-partitions share a 256 KiB ${T('l1-data-cache', 'L1 data cache / shared memory')} and a ${T('tensor-memory-accelerator', 'TMA')}. Together they keep up to 64 ${T('warp', 'warps')} (2,048 ${T('thread', 'threads')}) resident and switch between them every clock, which is how GPUs ${T('latency-hiding', 'hide latency')}. On Hopper, four aligned warps form a ${T('warpgroup', 'warpgroup')} that issues one matrix multiply (<code>wgmma.mma_async</code>) together; the glossary ties this to the four sub-partitions, each with its own Tensor Core.`;
      }
      return `<b>Sub-partition ${s.smsp + 1} of 4.</b> Each clock its ${T('warp-scheduler', 'warp scheduler')} picks one eligible ${T('warp', 'warp')} of up to 16 and issues one instruction for all 32 threads to one pipe: ${T('cuda-core', 'CUDA Cores')} (INT32, FP32, FP64), the ${T('tensor-core', 'Tensor Core')}, the ${T('load-store-unit', 'LD/ST units')} or the ${T('special-function-unit', 'SFU')}, with operands from the ${T('register-file', 'register file')}. The 32-lane FP32 pipe takes a whole warp in one clock; the 16-lane INT32 and FP64 pipes need two, so meanwhile the scheduler can issue to another pipe.`;
    }
    function renderCrumbs() {
      const s = st.sel;
      const items = ['GPU', `GPC ${s.gpc + 1}`, `TPC ${s.tpc + 1}`, `SM ${s.sm + 1}`, `Sub-partition ${s.smsp + 1}`];
      ui.crumbs.innerHTML = items.map((t, i) => `${i ? '<span aria-hidden="true">›</span>' : ''}<button type="button" data-lv="${i}"${i === st.level ? ' aria-current="true"' : ''}${i > st.level ? ' class="is-deep"' : ''}>${t}</button>`).join('');
    }
    ui.crumbs.addEventListener('click', (e) => { const b = e.target.closest('button[data-lv]'); if (b) { stopTour(); setLevel(+b.dataset.lv); } });
    function renderReadout() {
      const lv = st.level, Lv = LEVELS[lv];
      ui.vnum.textContent = String(lv + 1).padStart(2, '0');
      ui.lvlName.textContent = Lv.title;
      ui.lvlSub.textContent = Lv.sub;
      lvlBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(i === lv)));
      renderCrumbs();
      renderChips();
      ui.why.innerHTML = whyHTML();
      decorate(ui.why);
      tickDirty = true;
      ui.canvas.setAttribute('aria-label', `3D model of an H100-class GPU, ${Lv.title} view (${Lv.sub}). ${ui.why.textContent} Arrow keys orbit, plus and minus zoom; keys 1 to 5 change the level.`);
      renderTick();
      fitReadout();
      measurePanels();
      labelsDirty = true;
    }
    // If the readout would run into the title block (short desktop windows), make room step by step: tighter
    // readout type, then drop the intro's tagline, then a smaller title, then tighter spacing. Every chip (with its
    // sub-line), the why line, the issue line and the warp strip always stay on screen.
    // Measuring happens under .is-fitting, which turns transitions off in the intro and the readout: under reduced
    // motion the core stylesheet gives every property a 0.01 ms transition, and a measurement taken in the same task
    // as a class change would read the old layout (the title still at its previous size).
    const FIT = ['is-c1', 'is-c2', 'is-c3', 'is-c4'];
    function fitReadout() {
      hero.classList.add('is-fitting');
      hero.classList.remove(...FIT);
      if (st.W > NARROW) {
        const ctas = ui.intro.querySelector('.hero-ctas');
        for (const c of FIT) {
          if (ui.read.getBoundingClientRect().top >= ctas.getBoundingClientRect().bottom + 14) break;
          hero.classList.add(c);
        }
      }
      void hero.offsetHeight; // settle the final classes while transitions are still off
      hero.classList.remove('is-fitting');
    }
    function renderTick() {
      tickDirty = false;
      ui.slots.hidden = st.level < 3;
      ui.rmstep.hidden = st.auto || st.level < 3;
      if (st.level < 3) { if (ui.tick.textContent) ui.tick.textContent = ''; return; }
      paintSlots();
      if (!st.auto) rmGlow();
      const q = narrQ();
      // Both lines take the first of their variants that fits: on wide screens each line stays on one line
      // (no wrap), on narrow ones the wrapped text stays within the tick's reserved height, so the warp strip
      // under it does not move from clock to clock.
      const say = (tone, lines, rests) => {
        ui.tick.style.setProperty('--c', `var(--${tone})`);
        ui.tick.innerHTML = `<i></i><span>${lines[0]}</span><span>${rests[0]}</span>`;
        const s1 = ui.tick.children[1], s2 = ui.tick.children[2];
        const wraps = getComputedStyle(s1).whiteSpace !== 'nowrap', minH = parseFloat(getComputedStyle(ui.tick).minHeight) || 0;
        const fits = (el) => (wraps ? ui.tick.offsetHeight <= minH + 1 : el.scrollWidth <= el.clientWidth + 1);
        for (let k = 1; k < lines.length && !wraps && !fits(s1); k++) s1.innerHTML = lines[k];
        for (let k = 1; k < rests.length && !fits(s2); k++) s2.innerHTML = rests[k];
      };
      const clocks = (n) => `${n} clock${n === 1 ? '' : 's'}`;
      // a warp whose operands are ready but whose pipe is still busy this clock (a pipeline conflict)
      const wt = WSL.wait, wp = wt && PIPES[wt.k];
      if (tickPipe === 'idle') {
        say('control', [`Sub-partition ${q + 1}: no warp is eligible, so nothing issues this clock`, 'No warp is eligible, so nothing issues this clock', 'No eligible warp: nothing issues'],
          wt ? [`the warps with operands ready need a busy pipe: warp ${wt.w + 1}’s <b>${wp.op}</b> waits for the ${wp.nm}, free in ${clocks(wt.left)}`,
            `warp ${wt.w + 1}’s <b>${wp.op}</b> waits for the busy ${wp.nm}, free in ${clocks(wt.left)}`,
            `ready warps wait for a busy pipe: ${wp.nm}, free in ${clocks(wt.left)}`]
            : ['every resident warp is stalled, waiting on an earlier result']);
        return;
      }
      const p = tickPipe || PIPES[0], w = WSL.warp + 1, op = `<b>${p.op}</b>`;
      const what = p.dur ? `${p.what} · ${p.dur}` : p.what;
      const brief = p.dur ? [`${p.short || p.what} · ${p.dur}`, p.dur] : [];
      const rests = wt
        ? ((waitLong, waitShort) => [`${what} · ${waitLong}`, `${what} · ${waitShort}`, ...brief.map((r) => `${r} · ${waitShort}`),
          `${p.dur ? (p.lanes ? '' : '≈ ') + clocks(p.clk) : p.what} · ${waitShort}`, waitShort])(
          `warp ${wt.w + 1} waits: its <b>${wp.op}</b> needs the ${wp.nm}, free in ${clocks(wt.left)}`,
          `warp ${wt.w + 1} waits for the busy ${wp.nm}, free in ${clocks(wt.left)}`)
        : [what, ...brief];
      say(p.tone, [`Sub-partition ${q + 1} picks warp ${w} and issues ${op} to ${p.to}`, `Sub-partition ${q + 1}: warp ${w} issues ${op} to ${p.to}`, `Warp ${w} issues ${op} to ${p.to}`],
        rests);
    }

    /* ═══════════ tour ═══════════ */
    function startTour() { st.tour = 0; ui.tour.hidden = false; tourBtn.setLabel('Stop tour', 'pause'); tourGo(0); }
    // dwell per step scales with its length: 4 s plus 0.18 s per word
    const tourDwell = (i) => 4 + 0.18 * TOUR[i].html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    // orbiting, zooming or opening a part pauses the tour and keeps the reader's view; Next resumes it
    function pauseTour() {
      if (st.tour < 0 || st.tourPaused) return;
      st.tourPaused = true;
      ui.tourOut.textContent = `Tour ${st.tour + 1} / ${TOUR.length} · paused, Next to continue`;
    }
    function stopTour() {
      if (st.tour < 0) return;
      st.tour = -1; ui.tour.hidden = true; tourBtn.setLabel('Tour', 'play');
      ui.why.innerHTML = whyHTML(); decorate(ui.why);
    }
    function tourGo(i) {
      if (i >= TOUR.length) { stopTour(); return; }
      i = clamp(i, 0, TOUR.length - 1);
      st.tour = i; st.tourTimer = 0; st.tourPaused = false;
      const s = TOUR[i];
      if (s.level >= 1 && i === 2) select({ gpc: 5, tpc: 4, sm: 0 });
      if (s.ex != null && s.ex !== st.ex) { st.ex = s.ex; st.Et = s.ex ? 1 : 0; if (RM) st.E = st.Et; layers.set(s.ex ? 'x' : 'a', false); layoutDirty = true; }
      setLevel(s.level);
      ui.tourOut.textContent = `Tour ${i + 1} / ${TOUR.length}`;
      tourPrev.disabled = i === 0;
      tourNext.setLabel(i === TOUR.length - 1 ? 'Finish' : 'Next', 'next');
      ui.why.innerHTML = s.html; decorate(ui.why);
    }

    /* ═══════════ render loop ═══════════ */
    let raf = 0, lastT = 0, onScreen = true, lost = false;
    const running = () => onScreen && !document.hidden && !lost;
    function wake() { if (!raf && running()) { lastT = 0; raf = requestAnimationFrame(frame); } }
    function frame(now) {
      raf = 0;
      if (!running()) return;
      const dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 0.016;
      lastT = now;
      let busy = false;
      // explode / lift / package dimming
      if (Math.abs(st.E - st.Et) > 1e-4) { st.E = RM ? st.Et : damp(st.E, st.Et, 3.2, dt); if (Math.abs(st.E - st.Et) < 1e-4) st.E = st.Et; layoutDirty = true; busy = true; }
      if (Math.abs(st.lift - st.liftT) > 1e-4) { st.lift = RM ? st.liftT : st.liftT > st.lift ? Math.min(st.liftT, st.lift + dt / 1.25) : Math.max(st.liftT, st.lift - dt / 0.8); busy = true; viewDirty = true; if (st.liftT > 0) st.liftHold = 1.5; }
      else if (st.liftHold > 0) { st.liftHold = Math.max(0, st.liftHold - dt); busy = true; }
      // the frustum from the source tile to the floating SM is bright while it lifts and for 1.5 s after
      barT[3] = st.level >= 3 ? (st.liftHold > 0 ? 1 : 0.55) : 0;
      if (layoutDirty) { layoutPackage(); layoutFloorplan(); layoutDirty = false; viewDirty = true; }
      placeFloorplan();
      if (Math.abs(st.pkgDim - st.pkgDimT) > 0.002) {
        st.pkgDim = RM ? st.pkgDimT : damp(st.pkgDim, st.pkgDimT, 6, dt);
        PKG_MATS.forEach((m) => { m.color.copy(m.userData.base).multiplyScalar(st.pkgDim); m.envMapIntensity = m.userData.env * st.pkgDim; });
        const k = 0.35 + 0.65 * st.pkgDim;
        ground.material.opacity = 0.9 * k;
        busy = true;
      }
      pktMat.uniforms.uOpacity.value = st.level >= 3 ? 0.3 : st.level >= 1 ? 0.75 : 1;
      pktMat.uniforms.uSize.value = Math.min(0.46, cam.r * 0.0042);
      pktMat.uniforms.uMax.value = 11 * renderer.getPixelRatio();
      if (paintColl(tiles, dt, RM)) busy = true;
      if (paintColl(dieColl, dt, RM)) busy = true;
      if (paintColl(pkgColl, dt, RM)) busy = true;
      if (paintColl(fpColl, dt, RM)) busy = true;
      // printed text follows the dimming of what it is printed on
      pkgDecals.mat.uniforms.uOpacity.value = st.pkgDim * st.pkgDim;
      dieDecals.items.forEach((it, j) => { dieDecals.aColor.setW(j, dieDecals.baseA[j] * dieColl.focus[it.i]); });
      dieDecals.aColor.needsUpdate = true;
      if (fpGroup.visible) {
        // printed names fade out below ~6 px tall on screen instead of turning into illegible smudges
        const ppu = (st.H / (2 * cam.r * Math.tan((FOV * Math.PI) / 360))) * fpGroup.scale.x;
        fpDecals.items.forEach((it, j) => { fpDecals.aColor.setW(j, fpDecals.baseA[j] * fpColl.focus[it.bi] * clamp(((it.th || 0) * ppu - 5) / 3, 0, 1)); });
        fpDecals.aColor.needsUpdate = true;
      }
      for (let k = 0; k < 6; k++) { if (Math.abs(barI[k] - barT[k]) > 0.002) { barI[k] = RM ? barT[k] : damp(barI[k], barT[k], 6, dt); busy = true; } else barI[k] = barT[k]; }
      // camera
      if (glide) { stepGlide(dt); busy = true; }
      idle += dt;
      if (st.auto && !dragging && !glide && idle > 2.5) {
        if (!sway.on) { sway.on = true; sway.c = goal.th; sway.t = 0; }
        sway.t += dt;
        goal.th = sway.c + 0.5 * Math.sin((sway.t * 2 * Math.PI) / 30);
      }
      const lam = glide ? 16 : 10;
      const before = cam.r + cam.th + cam.ph + cam.target.x + cam.target.y + cam.target.z;
      cam.target.x = damp(cam.target.x, goal.target.x, lam, dt); cam.target.y = damp(cam.target.y, goal.target.y, lam, dt); cam.target.z = damp(cam.target.z, goal.target.z, lam, dt);
      cam.r = damp(cam.r, goal.r, lam, dt); cam.th = damp(cam.th, goal.th, lam, dt); cam.ph = damp(cam.ph, goal.ph, lam, dt);
      const after = cam.r + cam.th + cam.ph + cam.target.x + cam.target.y + cam.target.z;
      if (Math.abs(after - before) > 1e-5) { viewDirty = true; busy = true; }
      applyCamera();
      updateBars();
      if (ambient(dt)) busy = true;
      // hover picking (once per frame at most)
      if (hoverXY && !dragging && !coarse) {
        const hit = pick(hoverXY.x, hoverXY.y);
        showTip(hit, hoverXY.x, hoverXY.y);
        cv.classList.toggle('is-point', !!(hit && (hit.tile != null || (hit.part === 'gpc' && st.level === 0) || (hit.q != null && hit.q >= 0 && st.level === 3))));
        if (!hotLabel()) setHot(hit ? hit.key : null);
        hoverXY = null;
      }
      // number tweens
      for (let k = tweens.length - 1; k >= 0; k--) {
        const tw = tweens[k]; tw.t = Math.min(1, tw.t + dt / 0.7);
        tw.b.textContent = fmtInt(lerp(tw.a, tw.z, easeOut(tw.t)));
        if (tw.t >= 1) tweens.splice(k, 1); busy = true;
      }
      if (tickDirty) renderTick();
      // tour auto-advance
      if (st.tour >= 0 && !RM && !st.tourPaused && !st.tourHold) { st.tourTimer += dt; if (st.tourTimer > tourDwell(st.tour)) tourGo(st.tour + 1); busy = true; }
      if (viewDirty || labelsDirty) { viewDirty = false; labelsDirty = false; placeLabels(); if (labelsDirty) busy = true; }
      renderer.render(scene, camera);
      if (busy) raf = requestAnimationFrame(frame); // idle: no frames until something changes (wake())
    }

    GG.onVisible(hero, (v) => { onScreen = v; if (v) wake(); });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) wake(); });
    ui.canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault(); lost = true;
      console.info('[hero] WebGL context lost; showing the static illustration');
      hero.classList.remove('hero-on');
      [ui.intro, ui.ctl, ui.stage, ui.read, ui.foot, ui.tip, ui.card, ui.toast, ui.shade, ui.parts].forEach((n) => n.remove());
      disposables.forEach((d) => d.dispose && d.dispose());
      renderer.dispose();
      buildFallback(hero, fb);
    });

    GG.resize(ui.stage, resize);
    resize();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { atlas.draw(); renderReadout(); labels.forEach((l) => { l.w = 0; }); measurePanels(); resize(); });
    atlas.draw();

    // opening: start assembled and a little farther away, then come apart
    setFocus();
    buildLabels();
    buildSlots();
    if (RM) rmStep();
    renderReadout(true);
    layoutPackage(); layoutFloorplan(); placeFloorplan();
    const p0 = preset(0);
    copyState(goal, p0); copyState(cam, p0);
    if (!RM) { cam.r = goal.r * 1.28; cam.th = goal.th - 0.42; cam.ph = goal.ph - 0.12; goal.r = p0.r; st.E = 0; st.Et = 1; idle = -1.5; }
    applyCamera();
    wake();

    GG.hero = {
      setLevel: (i) => { stopTour(); setLevel(i); },
      setExploded: (v) => { stopTour(); setExploded(v); },
      select: (o) => { select(o || {}); setLevel(st.level); },
      startTour, stopTour,
      get state() { return { level: st.level, exploded: st.ex, E: st.E, lift: st.lift, sel: Object.assign({}, st.sel), cam: { r: cam.r, th: cam.th, ph: cam.ph, target: cam.target.toArray() }, labels: labels.filter((l) => l.on).map((l) => l.part) }; },
    };
  }

  /* ═════════════════════════════ no-WebGL fallback ═════════════════════════════ */
  // The 3D view has its own h1; the hidden fallback's h1 leaves the document while it runs, so the page has one h1,
  // and comes back if the fallback is shown (WebGL context lost).
  let heldTitle = null;
  function holdFallbackTitle(fb) {
    const h1 = fb && fb.querySelector('h1');
    if (!h1) return;
    heldTitle = { h1, mark: document.createComment('hero title') };
    h1.replaceWith(heldTitle.mark);
  }
  function buildFallback(hero, fb) {
    if (heldTitle) { heldTitle.mark.replaceWith(heldTitle.h1); heldTitle = null; }
    if (!fb || fb.dataset.built) return;
    fb.dataset.built = '1';
    const kids = [...fb.childNodes];
    const grid = GG.el('div', { class: 'hero-fb-grid' });
    const text = GG.el('div');
    kids.forEach((n) => text.appendChild(n));
    text.insertAdjacentHTML('beforeend', `<div class="hero-ctas"><a class="hero-cta primary" href="#readme">Start reading<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M3.5 8.5L8 13l4.5-4.5"/></svg></a><a class="hero-cta" href="#device-hardware" data-toc>Browse the chapters</a></div>
      <ul class="hero-fb-legend" aria-label="Colour key"><li style="--c:var(--core)">Cores: the SMs</li><li style="--c:var(--memory)">Memory: HBM3 and the L2 cache</li><li style="--c:var(--ink-3)">Grey: disabled on H100 SXM5</li></ul>`);
    const art = GG.el('div', { class: 'hero-fb-art' });
    art.innerHTML = fallbackSVG() + '<p>A static drawing of the exploded package: this browser could not start the interactive 3D view.</p>';
    grid.append(text, art);
    fb.appendChild(grid);
  }

  function fallbackSVG() {
    const k = 9.2, c30 = Math.cos(Math.PI / 6);
    const P = (x, y, z) => [(x - z) * c30 * k, ((x + z) * 0.5 - y) * k];
    const out = [];
    let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
    const pts = (a) => a.map(([x, y]) => { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); return x.toFixed(1) + ',' + y.toFixed(1); }).join(' ');
    const poly = (a, fill, stroke, sw, op) => out.push(`<polygon points="${pts(a)}" fill="${fill}" stroke="${stroke || 'none'}" stroke-width="${sw || 0.8}"${op != null ? ` opacity="${op}"` : ''}/>`);
    function box(x0, z0, x1, z1, y0, y1, top, left, right, stroke, op) {
      poly([P(x0, y1, z1), P(x1, y1, z1), P(x1, y0, z1), P(x0, y0, z1)], left, stroke, 0.6, op);
      poly([P(x1, y1, z0), P(x1, y1, z1), P(x1, y0, z1), P(x1, y0, z0)], right, stroke, 0.6, op);
      poly([P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)], top, stroke, 0.8, op);
    }
    const Lx = pkgLayout(1);
    box(-SUB.w / 2, -SUB.d / 2, SUB.w / 2, SUB.d / 2, 0, SUB.t, '#161927', '#0f111b', '#0c0e16', '#2b3046');
    box(-INT.w / 2, -INT.d / 2, INT.w / 2, INT.d / 2, Lx.intBot, Lx.intTop, '#1d2234', '#141828', '#11141f', '#3a4160');
    const stacks = [0, 1, 2, 3, 4, 5].sort((a, b) => (stackX(a) + stackZ(a)) - (stackX(b) + stackZ(b)));
    const drawStack = (s) => {
      const on = s !== OFF_STACK, x = stackX(s), z = stackZ(s);
      box(x - HBM.w / 2, z - HBM.d / 2, x + HBM.w / 2, z + HBM.d / 2, Lx.hbmBot, Lx.hbmBot + HBM.base, on ? '#2c3f66' : '#262a3b', '#1c2740', '#18203a', on ? '#4a6bb0' : '#363b55');
      for (let d = 0; d < HBM.n; d++) {
        const y0 = dramBot(Lx, d);
        box(x - HBM.w / 2 + 0.06, z - HBM.d / 2 + 0.06, x + HBM.w / 2 - 0.06, z + HBM.d / 2 - 0.06, y0, y0 + HBM.dram, on ? '#3a5f9e' : '#2a2e40', on ? '#2b4677' : '#22263a', on ? '#243c66' : '#1f2233', on ? '#6fa6ff' : '#3a3f58', on ? 0.95 : 0.7);
      }
    };
    stacks.filter((s) => stackX(s) + stackZ(s) < -2).forEach(drawStack);
    box(-DIE.w / 2, -DIE.d / 2, DIE.w / 2, DIE.d / 2, Lx.dieBot, Lx.dieTop, '#141828', '#1b2033', '#171b2c', '#4a5274');
    const y = Lx.dieTop + 0.02;
    SMR.forEach((r) => poly([P(r.x0, y, r.z0), P(r.x1, y, r.z0), P(r.x1, y, r.z1), P(r.x0, y, r.z1)], r.on ? 'rgba(69,212,155,0.55)' : 'rgba(118,123,149,0.18)', r.on ? '#45d49b' : '#3a3f58', 0.4));
    poly([P(-9.2, y, -1.05), P(9.2, y, -1.05), P(9.2, y, 1.05), P(-9.2, y, 1.05)], 'rgba(111,166,255,0.5)', '#6fa6ff', 0.6);
    stacks.filter((s) => stackX(s) + stackZ(s) >= -2).forEach(drawStack);
    const FS = 15; // label size in viewBox units; the drawing is ~1.4× wider than it renders, so this reads at ~11 px
    const lab = (x, yy, z, dx, dy, t) => {
      const [ax, ay] = P(x, yy, z), bx = ax + dx, by = ay + dy;
      const tw = t.length * FS * 0.62 + 8;
      minX = Math.min(minX, dx < 0 ? bx - tw : bx - 4); maxX = Math.max(maxX, dx < 0 ? bx + 4 : bx + tw); minY = Math.min(minY, by - FS - 4); maxY = Math.max(maxY, by + 10);
      out.push(`<path d="M${ax.toFixed(1)},${ay.toFixed(1)}L${bx.toFixed(1)},${by.toFixed(1)}" stroke="#767b95" stroke-width="0.8" fill="none"/><circle cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="2.4" fill="#ff8a5b"/>`);
      out.push(`<text x="${(bx + (dx < 0 ? -4 : 4)).toFixed(1)}" y="${(by + 4).toFixed(1)}" text-anchor="${dx < 0 ? 'end' : 'start'}" font-family="JetBrains Mono, monospace" font-size="${FS}" fill="#aeb2c7">${t}</text>`);
    };
    const fz = SMR[smIndex(0, 8, 0)];
    lab(-HBM.x, stackTop(Lx), 6.5, -30, -40, 'HBM3 · GPU RAM (5 × 16 GiB)');
    lab(stackX(OFF_STACK), stackTop(Lx), stackZ(OFF_STACK), 40, -40, 'HBM site not enabled');
    lab(4, Lx.dieTop, -6, 40, -70, 'GH100-class die · 132 of 144 SMs');
    lab((fz.x0 + fz.x1) / 2, Lx.dieTop, fz.z1, -150, -120, 'fused-off TPC (illustrative)');
    lab(-4, Lx.dieTop, 0.6, -90, 70, 'L2 cache');
    lab(INT.w / 2 - 2, Lx.intTop, INT.d / 2, 40, 30, 'Silicon interposer');
    lab(SUB.w / 2 - 4, SUB.t, SUB.d / 2, 40, 30, 'Package substrate');
    const pad = 10;
    return `<svg viewBox="${(minX - pad).toFixed(0)} ${(minY - pad).toFixed(0)} ${(maxX - minX + 2 * pad).toFixed(0)} ${(maxY - minY + 2 * pad).toFixed(0)}" role="img" aria-label="Exploded drawing of an H100-class GPU package: package substrate, silicon interposer, the GH100-class die with 144 SM tiles (132 enabled) around an L2 cache, and six HBM3 sites with eight DRAM dies each (five enabled).">${out.join('')}</svg>`;
  }
})();
