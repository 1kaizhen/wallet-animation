// Weather particle effects on one canvas. The canvas sits above the content with mix-blend-mode: screen.
// createFx(canvas, flashEl, reduced) -> { resize(w, h), set(mode, n), destroy() }
import { range } from 'd3';

export function createFx(canvas, flash, reduced) {
  const fctx = canvas.getContext('2d');
  let particles = [], fxKey = null, fxRaf = 0, boltTimer = 0, bolt = null, FW = 0, FH = 0;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  const MAKERS = {
    sunny:  () => ({ x: rnd(0, FW), y: rnd(0, FH), v: rnd(.1, .3), r: rnd(1, 2.2), p: rnd(0, 6.3) }),
    clear:  () => ({ x: rnd(0, FW), y: rnd(0, FH * .45), r: rnd(.4, 1.4), p: rnd(0, 6.3), s: rnd(.01, .04) }),
    cloudy: () => ({ x: rnd(-300, FW), y: rnd(-40, FH * .38), v: rnd(.08, .25), r: rnd(90, 190), a: rnd(.035, .075) }),
    rain:   () => { const z = rnd(.35, 1); return { x: rnd(0, FW), y: rnd(0, FH), v: rnd(9, 16) * z, r: rnd(10, 22) * z, z }; },
    storm:  () => { const z = rnd(.35, 1); return { x: rnd(0, FW), y: rnd(0, FH), v: rnd(15, 24) * z, r: rnd(16, 30) * z, z }; },
    snow:   () => { const z = rnd(.3, 1); return { x: rnd(0, FW), y: rnd(0, FH), v: rnd(.5, 1.6) * z, r: rnd(1, 3.4) * z, p: rnd(0, 6.3), z }; },
    winter: () => ({ x: rnd(0, FW), y: rnd(0, FH), v: rnd(.15, .45), r: rnd(.6, 1.7), p: rnd(0, 6.3) }),
    autumn: () => ({ z: rnd(.45, 1), x: rnd(0, FW), y: rnd(-FH, FH), v: rnd(.8, 1.7), r: rnd(10, 18), p: rnd(0, 6.3), a: rnd(0, 6.3), s: rnd(-.03, .03), c: pick(['#d9622b', '#e8a13a', '#b8411f', '#c9852c', '#a8501e']) }),
    spring: () => ({ z: rnd(.45, 1), x: rnd(0, FW), y: rnd(-FH, FH), v: rnd(.7, 1.4), r: rnd(6, 10), p: rnd(0, 6.3), a: rnd(0, 6.3), s: rnd(-.04, .04), c: pick(['#f5b8c8', '#f9d3dc', '#fbe7ec', '#f09ab2']) }),
  };
  function drawLeaf(d) {
    fctx.save(); fctx.translate(d.x, d.y); fctx.rotate(d.a); fctx.scale(1, Math.cos(d.p * 1.6) * .9 + .1);
    const s = d.r * d.z; fctx.beginPath(); fctx.moveTo(-s, 0);
    fctx.quadraticCurveTo(0, -s * .62, s, 0); fctx.quadraticCurveTo(0, s * .62, -s, 0);
    fctx.fillStyle = d.c; fctx.globalAlpha = .45 + .5 * d.z; fctx.fill();
    fctx.beginPath(); fctx.moveTo(-s * 1.25, 0); fctx.lineTo(s * .8, 0); fctx.strokeStyle = 'rgba(60,20,5,.45)'; fctx.lineWidth = .8; fctx.stroke();
    fctx.restore();
  }
  function drawPetal(d) {
    fctx.save(); fctx.translate(d.x, d.y); fctx.rotate(d.a); fctx.scale(1, Math.cos(d.p * 1.4) * .8 + .2);
    fctx.beginPath(); fctx.ellipse(0, 0, d.r * d.z, d.r * d.z * .6, 0, 0, Math.PI * 2); fctx.fillStyle = d.c; fctx.globalAlpha = .4 + .5 * d.z; fctx.fill(); fctx.restore();
  }
  function drawCloud(d) {
    const puff = (ox, oy, r) => {
      const g = fctx.createRadialGradient(d.x + ox, d.y + oy, 0, d.x + ox, d.y + oy, r);
      g.addColorStop(0, `rgba(215,222,232,${d.a})`); g.addColorStop(1, 'rgba(215,222,232,0)');
      fctx.fillStyle = g; fctx.beginPath(); fctx.arc(d.x + ox, d.y + oy, r, 0, Math.PI * 2); fctx.fill();
    };
    puff(0, 0, d.r); puff(d.r * .7, d.r * .15, d.r * .8); puff(-d.r * .7, d.r * .2, d.r * .7); puff(d.r * .2, -d.r * .25, d.r * .6);
  }
  function makeBolt() {
    let x = rnd(FW * .15, FW * .85), y = 0; const pts = [[x, y]], end = FH * rnd(.3, .5);
    while (y < end) { y += rnd(14, 30); x += rnd(-22, 22); pts.push([x, y]); }
    return { pts, t: performance.now() };
  }
  function strike() {
    if (!fxKey || fxKey.mode !== 'storm') return;
    bolt = makeBolt();
    flash.animate([{ opacity: 0 }, { opacity: 1, offset: .08 }, { opacity: .15, offset: .25 }, { opacity: .7, offset: .35 }, { opacity: 0 }], { duration: 700, easing: 'ease-out' });
    boltTimer = setTimeout(strike, rnd(3500, 8000));
  }

  function setFx(mode, n) {
    if (fxKey && fxKey.mode === mode && fxKey.n === n) return;
    fxKey = { mode, n }; cancelAnimationFrame(fxRaf); clearTimeout(boltTimer); bolt = null;
    fctx.clearRect(0, 0, FW, FH);
    if (reduced) return;
    particles = range(n).map(MAKERS[mode]);
    if (mode === 'storm') boltTimer = setTimeout(strike, 1400);
    const tick = now => {
      fctx.clearRect(0, 0, FW, FH); fctx.globalAlpha = 1;
      if (mode === 'rain' || mode === 'storm') {
        const slant = mode === 'storm' ? .32 : .18;
        // three depth bands: far drops are fainter, thinner and slower
        for (const [lo, hi, a, w] of [[0, .55, .16, .8], [.55, .8, .26, 1], [.8, 1.01, .38, 1.2]]) {
          fctx.strokeStyle = mode === 'storm' ? `rgba(215,220,245,${a})` : `rgba(205,228,242,${a})`; fctx.lineWidth = w; fctx.beginPath();
          for (const d of particles) { if (d.z < lo || d.z >= hi) continue; fctx.moveTo(d.x, d.y); fctx.lineTo(d.x - d.r * slant, d.y + d.r); }
          fctx.stroke();
        }
        for (const d of particles) { d.y += d.v; d.x -= d.v * slant; if (d.y > FH) { d.y = -30; d.x = rnd(0, FW + 200); } }
        if (bolt && now - bolt.t < 220) {
          fctx.save(); fctx.globalAlpha = 1 - (now - bolt.t) / 220; fctx.shadowColor = '#c9c2ff'; fctx.shadowBlur = 18;
          fctx.strokeStyle = '#f4f1ff'; fctx.lineWidth = 2.2; fctx.lineJoin = 'round';
          fctx.beginPath(); bolt.pts.forEach(([x, y], i) => i ? fctx.lineTo(x, y) : fctx.moveTo(x, y)); fctx.stroke(); fctx.restore();
        }
      } else if (mode === 'snow') {
        for (const d of particles) { d.p += .01; d.y += d.v; d.x += Math.sin(d.p) * .4 * d.z; if (d.y > FH) { d.y = -5; d.x = rnd(0, FW); }
          fctx.fillStyle = `rgba(255,255,255,${.3 + .55 * d.z})`; fctx.beginPath(); fctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); fctx.fill(); }
      } else if (mode === 'winter') {
        for (const d of particles) {
          d.p += .03; d.y += d.v; d.x += Math.sin(d.p * .3) * .25; if (d.y > FH) { d.y = -5; d.x = rnd(0, FW); }
          const a = .35 + .45 * Math.abs(Math.sin(d.p));
          fctx.fillStyle = `rgba(215,235,255,${a})`; fctx.beginPath(); fctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); fctx.fill();
          if (d.r > 1.3 && a > .7) { fctx.strokeStyle = `rgba(230,245,255,${a * .6})`; fctx.lineWidth = .6; fctx.beginPath(); fctx.moveTo(d.x - 4, d.y); fctx.lineTo(d.x + 4, d.y); fctx.moveTo(d.x, d.y - 4); fctx.lineTo(d.x, d.y + 4); fctx.stroke(); }
        }
      } else if (mode === 'autumn') {
        for (const d of particles) { d.p += .02; d.a += d.s; d.y += d.v; d.x += Math.sin(d.p) * 1.1 + .3; if (d.y > FH + 20) { d.y = -20; d.x = rnd(-50, FW); } drawLeaf(d); }
      } else if (mode === 'spring') {
        for (const d of particles) { d.p += .025; d.a += d.s; d.y += d.v; d.x += Math.sin(d.p) * .8 + .25; if (d.y > FH + 20) { d.y = -20; d.x = rnd(-20, FW); } if (d.x > FW + 20) d.x = -20; drawPetal(d); }
      } else if (mode === 'cloudy') {
        for (const d of particles) { d.x += d.v; if (d.x - d.r * 2 > FW) { d.x = -d.r * 2; d.y = rnd(-40, FH * .38); } drawCloud(d); }
      } else if (mode === 'clear') {
        for (const d of particles) { d.p += d.s; fctx.fillStyle = `rgba(235,240,255,${.25 + .55 * Math.abs(Math.sin(d.p))})`; fctx.beginPath(); fctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); fctx.fill(); }
      } else if (mode === 'sunny') {
        for (const d of particles) { d.p += .01; d.y -= d.v; d.x += Math.sin(d.p) * .2; if (d.y < -5) { d.y = FH; d.x = rnd(0, FW); }
          fctx.fillStyle = `rgba(255,220,150,${.1 + .1 * Math.sin(d.p * 2) ** 2})`; fctx.beginPath(); fctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); fctx.fill(); }
      }
      fxRaf = requestAnimationFrame(tick);
    };
    fxRaf = requestAnimationFrame(tick);
  }


  function resize(w, h) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    FW = w; FH = h;
    canvas.style.height = h + 'px'; canvas.width = w * dpr; canvas.height = h * dpr;
    fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (fxKey) { const k = fxKey; fxKey = null; setFx(k.mode, k.n); }
  }
  function destroy() { cancelAnimationFrame(fxRaf); clearTimeout(boltTimer); }
  return { resize, set: setFx, destroy };
}
