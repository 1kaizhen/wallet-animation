import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { geoOrthographic, geoPath, geoGraticule10, geoDistance, geoCircle, select, interpolate, easeCubicInOut } from 'd3';
import { feature } from 'topojson-client';
import WORLD from '../data/world.json';
import { subsolarAt, deg } from '../lib/weather.js';
import { prefersReducedMotion } from '../lib/hooks.js';

const land = feature(WORLD, WORLD.objects.land);
const graticule = geoGraticule10();
const LIFT = 33;                       // degrees: the selected city sits this far above the view centre
const HEAD = 110;                      // extra canvas above the visible cap so the halo can fade out
const target = c => [-c.lon, -(c.lat - LIFT), 0];

// The globe is drawn live on a canvas with an orthographic projection.
// It turns to the selected city, and can be dragged: release over a city to pick it.
export default function Globe({ cities, snaps, target: ci, refs, layoutKey, onPick }) {
  const wrap = useRef(null), canvas = useRef(null), pin = useRef(null);
  const [hint, setHint] = useState(false);
  const live = useRef({});
  live.current = { cities, snaps, ci, onPick };
  const G = useRef({ W: 0, H: 0, R: 0, cx: 0, cy: 0 });
  const rot = useRef(null);
  const drag = useRef({ active: false, used: false, near: -1 });
  const proj = useRef(geoOrthographic().clipAngle(90).precision(0.3));

  const draw = () => {
    const cv = canvas.current; if (!cv || !pin.current) return;
    const ctx = cv.getContext('2d'), { W, H, R, cx, cy } = G.current; if (!W) return;
    const { cities: C, snaps: SN, ci: sel } = live.current;
    const projection = proj.current.rotate(rot.current), path = geoPath(projection, ctx), r0 = rot.current;
    ctx.clearRect(0, 0, W, H);
    ctx.save(); ctx.beginPath(); path({ type: 'Sphere' });
    ctx.shadowColor = 'rgba(70,140,255,.34)'; ctx.shadowBlur = 50; ctx.fillStyle = '#123f8f'; ctx.fill(); ctx.restore();
    const hx = cx - R * 0.3, hy = cy - R * 0.55;
    const og = ctx.createRadialGradient(hx, hy, R * 0.05, cx, cy, R);
    og.addColorStop(0, '#3a8ae6'); og.addColorStop(0.5, '#1f63c4'); og.addColorStop(1, '#0d3a80');
    ctx.beginPath(); path({ type: 'Sphere' }); ctx.fillStyle = og; ctx.fill();
    ctx.beginPath(); path(graticule); ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.lineWidth = 0.8; ctx.stroke();
    const lg = ctx.createRadialGradient(hx, hy, R * 0.05, cx, cy, R);
    lg.addColorStop(0, '#8ccf76'); lg.addColorStop(0.55, '#63ad52'); lg.addColorStop(1, '#3f7f3a');
    ctx.beginPath(); path(land); ctx.fillStyle = lg; ctx.fill();
    ctx.strokeStyle = 'rgba(200,240,190,.35)'; ctx.lineWidth = 0.5; ctx.stroke();
    const sg = ctx.createRadialGradient(hx, hy, R * 0.1, cx, cy, R * 1.02);
    sg.addColorStop(0, 'rgba(255,255,255,.08)'); sg.addColorStop(0.6, 'rgba(0,10,40,0)'); sg.addColorStop(1, 'rgba(0,8,30,.55)');
    ctx.beginPath(); path({ type: 'Sphere' }); ctx.fillStyle = sg; ctx.fill();
    // night side: soft terminator from the sun's real position at the scene's moment
    const ss = subsolarAt(SN[sel].at), anti = [ss[0] + 180, -ss[1]];
    for (let r = 97; r >= 79; r -= 1.5) { ctx.beginPath(); path(geoCircle().center(anti).radius(r).precision(2)()); ctx.fillStyle = 'rgba(4,8,28,.045)'; ctx.fill(); }
    ctx.beginPath(); path({ type: 'Sphere' }); ctx.strokeStyle = 'rgba(180,210,255,.22)'; ctx.lineWidth = 1; ctx.stroke();

    // city markers; while dragging, the one nearest the focus point is labelled
    const seen = ll => geoDistance(ll, [-r0[0], -r0[1]]) < Math.PI / 2 - 0.08;
    const near = drag.current.active ? nearest() : -1;
    drag.current.near = near;
    C.forEach((c, i) => {
      if (!seen([c.lon, c.lat]) || (i === sel && !drag.current.active)) return;
      const p = projection([c.lon, c.lat]); if (!p) return;
      const hot = i === near;
      ctx.beginPath(); ctx.arc(p[0], p[1], hot ? 6 : 3.2, 0, Math.PI * 2);
      ctx.fillStyle = hot ? '#fff' : 'rgba(255,255,255,.75)'; ctx.fill();
      ctx.lineWidth = hot ? 3 : 1.5; ctx.strokeStyle = 'rgba(10,20,40,.55)'; ctx.stroke();
      if (hot) {
        const label = `${c.name}  ${deg(SN[i].temp)}°`;
        ctx.font = '600 14px "Google Sans Flex", "Google Sans", Arial, sans-serif';
        const tw = ctx.measureText(label).width, bx = p[0] - tw / 2 - 11, by = p[1] - 42;
        ctx.fillStyle = 'rgba(20,20,20,.78)'; ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(bx, by, tw + 22, 28, 14); else ctx.rect(bx, by, tw + 22, 28);
        ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, p[0], by + 14.5);
      }
    });

    const c = C[sel], vis = !drag.current.active && geoDistance([c.lon, c.lat], [-r0[0], -r0[1]]) < Math.PI / 2 - 0.05;
    const p = projection([c.lon, c.lat]);
    pin.current.style.opacity = vis ? 1 : 0;
    if (p) pin.current.style.transform = `translate(${p[0]}px, ${p[1] - HEAD}px)`;
  };
  const nearest = () => {
    const f = [-rot.current[0], -rot.current[1] + LIFT]; let best = -1, bd = Infinity;
    live.current.cities.forEach((c, i) => { const d = geoDistance([c.lon, c.lat], f); if (d < bd) { bd = d; best = i; } });
    return best;
  };
  const rotateTo = (c, dur) => {
    const t = target(c), start = rot.current.slice();
    t[0] = start[0] + (((((t[0] - start[0]) % 360) + 540) % 360) - 180);     // shortest way round
    pin.current.classList.remove('drop');
    select(canvas.current).interrupt();
    if (prefersReducedMotion() || !dur) { rot.current = t; draw(); pin.current.classList.add('drop'); return; }
    const i = interpolate(start, t);
    select(canvas.current).transition().duration(dur).ease(easeCubicInOut)
      .tween('rotate', () => k => { rot.current = i(k); draw(); })
      .on('end', () => { void pin.current.offsetWidth; pin.current.classList.add('drop'); });
  };

  // size: fill the height left under the chart; shrink so the pin always stays visible
  useLayoutEffect(() => {
    // parent refs attach after child layout effects, so find the panel through the DOM
    const panel = wrap.current.closest('.panel'), stage = panel && panel.querySelector('.stage'); if (!panel || !stage) return;
    const W = panel.clientWidth;
    let R = Math.round(W * (W < 640 ? 0.62 : 0.517)), body = Math.round(R * 0.54);
    if (W >= 600) {
      const room = Math.floor(panel.clientHeight - (stage.offsetTop + stage.offsetHeight));
      body = Math.max(70, room); R = Math.round(Math.min(R, body / 0.54));
    }
    const H = body + HEAD, dpr = Math.min(window.devicePixelRatio || 1, 3), cv = canvas.current;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.height = `${H}px`;
    wrap.current.style.height = `${body}px`;
    cv.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    G.current = { W, H, R, cx: W / 2, cy: HEAD + R };
    proj.current.scale(R).translate([W / 2, HEAD + R]);
    if (!rot.current) { const t0 = target(live.current.cities[ci]); rot.current = [t0[0] - 70, t0[1] + 15, 0]; rotateTo(live.current.cities[ci], 2000); }
    else draw();
  }, [layoutKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (!drag.current.active) rotateTo(cities[ci], 1500);
  }, [ci]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => { select(canvas.current).interrupt(); }, []);

  // pointer: drag to spin, release to pick; tap a dot to pick it
  useEffect(() => {
    const cv = canvas.current;
    const local = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * (G.current.W / r.width), (e.clientY - r.top) * (G.current.H / r.height)]; };
    const onSphere = pt => Math.hypot(pt[0] - G.current.cx, pt[1] - G.current.cy) <= G.current.R;
    const cityAt = pt => {
      let hit = -1, bd = 16; const r0 = rot.current;
      live.current.cities.forEach((c, i) => {
        if (geoDistance([c.lon, c.lat], [-r0[0], -r0[1]]) >= Math.PI / 2 - 0.08) return;
        const p = proj.current([c.lon, c.lat]), d = p && Math.hypot(p[0] - pt[0], p[1] - pt[1]);
        if (d < bd) { bd = d; hit = i; }
      });
      return hit;
    };
    const d = drag.current;
    const move = e => {
      const pt = local(e);
      if (!d.active) { const over = onSphere(pt); cv.classList.toggle('over', over); setHint(over && !d.used); return; }
      const dx = e.clientX - d.x, dy = e.clientY - d.y;
      if (Math.hypot(dx, dy) > 4) d.moved = true;
      const k = 180 / (Math.PI * G.current.R);
      rot.current = [d.rot[0] + dx * k, Math.max(-85, Math.min(85, d.rot[1] - dy * k)), 0];
      draw();
    };
    const down = e => {
      const pt = local(e); if (!onSphere(pt)) return;
      e.preventDefault(); cv.setPointerCapture(e.pointerId); select(cv).interrupt();
      Object.assign(d, { active: true, moved: false, x: e.clientX, y: e.clientY, rot: rot.current.slice(), start: pt });
      cv.classList.add('dragging'); setHint(false); pin.current.classList.remove('drop');
    };
    const up = () => {
      if (!d.active) return;
      d.active = false; d.used = true; cv.classList.remove('dragging');
      const { ci: sel, cities: C, onPick: pick } = live.current;
      const choice = d.moved ? d.near : cityAt(d.start);
      if (choice < 0 || choice === sel) { draw(); rotateTo(C[sel], 700); return; }
      pick(choice);
    };
    const leave = () => { if (!d.active) { cv.classList.remove('over'); setHint(false); } };
    cv.addEventListener('pointermove', move); cv.addEventListener('pointerdown', down);
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up); cv.addEventListener('pointerleave', leave);
    return () => {
      cv.removeEventListener('pointermove', move); cv.removeEventListener('pointerdown', down);
      cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', up); cv.removeEventListener('pointerleave', leave);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="globe" ref={wrap} aria-hidden="true">
      <canvas ref={canvas} />
      <div className={hint ? 'globe-hint show' : 'globe-hint'}>Drag the globe to pick a city</div>
      <div className="pin" ref={pin}>
        <span className="ripple" />
        <svg viewBox="0 0 28 38"><g className="pin-body"><path fill="#ffffff" d="M14 0C6.3 0 0 6.1 0 13.8 0 23 14 38 14 38s14-15 14-24.2C28 6.1 21.7 0 14 0z" /><circle cx="14" cy="13.5" r="4.6" fill="#181818" /></g></svg>
      </div>
    </div>
  );
}
