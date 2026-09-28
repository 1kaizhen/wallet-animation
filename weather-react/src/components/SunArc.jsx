import { useLayoutEffect, useRef } from 'react';
import { select, interpolateNumber, easeCubicInOut, range, line, curveCatmullRom } from 'd3';
import { dayEdges, wave } from '../lib/arc.js';
import { GLOW, STORM, RAIN, SNOW, parseLocal, hhmm } from '../lib/weather.js';
import { prefersReducedMotion } from '../lib/hooks.js';

// The sun or moon rides a 24-hour wave. Changing city tweens the hour, sunrise and sunset together,
// redrawing the line every frame, so the orb follows the curve instead of cutting across.
export default function SunArc({ s, kind, ci, refs, layoutKey }) {
  const track = useRef(null), svg = useRef(null), orb = useRef(null);
  const dayPath = useRef(null), nightPath = useRef(null), dayFill = useRef(null), horizon = useRef(null);
  const clipDay = useRef(null), clipNight = useRef(null), tickL = useRef(null), tickR = useRef(null), cloud = useRef(null);
  const state = useRef(null), lastCi = useRef(null);

  const e = dayEdges(s);
  const ticks = e.polar === 'day' ? [['All day', 'Sun up'], ['', '']]
    : e.polar === 'night' ? [['No sun', 'Polar night'], ['', '']]
    : [[hhmm(parseLocal(s.rise)), 'Sunrise'], [hhmm(parseLocal(s.set)), 'Sunset']];

  const geom = () => {
    const tr = track.current;
    const padIn = parseFloat(getComputedStyle(document.querySelector('.head')).paddingLeft) || 24;
    const tw = Math.max(tickL.current.querySelector('b').offsetWidth, tickR.current.querySelector('b').offsetWidth) || 42;
    const w = tr.clientWidth, h = tr.clientHeight, pad = padIn + tw + 5;           // curve ends just past the time
    return { w, h, x0: pad, x1: w - pad, yh: h * 0.757, up: h * 0.27, down: h * 0.2 };
  };
  refs.arcGeom = () => ({ ...geom(), top: svg.current.getBoundingClientRect().top });

  const draw = st => {
    const g = geom(), f = wave(g, st);
    const d = line().curve(curveCatmullRom)(range(0, 24.0001, 0.1).map(h => { const p = f(h); return [p.x, p.y]; }));
    svg.current.setAttribute('viewBox', `0 0 ${g.w} ${g.h}`);
    dayPath.current.setAttribute('d', d); nightPath.current.setAttribute('d', d);
    dayFill.current.setAttribute('d', `${d} L ${g.x1} ${g.yh} L ${g.x0} ${g.yh} Z`);
    const set = (el, a) => Object.entries(a).forEach(([k, v]) => el.setAttribute(k, v));
    set(clipDay.current, { x: 0, y: -80, width: g.w, height: g.yh + 80 });
    set(clipNight.current, { x: 0, y: g.yh, width: g.w, height: g.h - g.yh + 40 });
    const yH = Math.round(g.yh) + 0.5;
    set(horizon.current, { x1: g.x0 - 13, x2: g.x1 + 13, y1: yH, y2: yH });
    // keep the orb on the curve: limit the hour, never nudge x off the line
    const r = orb.current.offsetWidth / 2 || 50, hMin = (24 * r) / (g.x1 - g.x0);
    const p = f(Math.min(24 - hMin, Math.max(hMin, st.h)));
    orb.current.style.transform = `translate(${p.x.toFixed(2)}px, ${p.y.toFixed(2)}px)`;
    document.documentElement.style.setProperty('--orb-x', `${(p.x / g.w) * 100}%`);
    for (const [el, y] of [[tickL.current, f(0).y], [tickR.current, f(24).y]]) el.style.top = `${y - (el.offsetHeight || 36) / 2}px`;
  };

  useLayoutEffect(() => {
    const phase = !s.isDay ? 'night' : !e.polar && (s.L.hours - e.rise < 1.1 || e.set - s.L.hours < 1.1) ? 'golden' : 'day';
    const o = orb.current;
    const apply = () => {
      o.dataset.kind = s.isDay ? 'sun' : 'moon';
      o.dataset.phase = phase;
      o.dataset.tone = kind === 'winter' || kind === 'snow' ? 'cold' : 'warm';
      o.dataset.cloud = s.code >= 2;
      o.dataset.storm = STORM.includes(s.code);
      o.dataset.dim = s.code >= 3;
      cloud.current.setAttribute('fill', STORM.includes(s.code) ? '#5e6275' : RAIN.includes(s.code) ? '#9aa6b2' : SNOW.includes(s.code) ? '#dfe5ec' : '#c9cfd6');
      document.documentElement.style.setProperty('--glow', GLOW[kind][phase]);
    };
    const to = { h: s.L.hours, rise: e.rise, set: e.set };
    const from = state.current, cityChanged = lastCi.current !== null && lastCi.current !== ci;
    lastCi.current = ci;
    select(o).interrupt();
    if (!cityChanged || !from || prefersReducedMotion()) { state.current = to; apply(); draw(to); return; }

    const iH = interpolateNumber(from.h, to.h), iR = interpolateNumber(from.rise, to.rise), iS = interpolateNumber(from.set, to.set);
    const swap = (o.dataset.kind === 'sun') !== s.isDay;
    apply(); if (swap) o.dataset.kind = s.isDay ? 'moon' : 'sun';          // sun/moon swaps halfway along
    select(o).transition().duration(1600).ease(easeCubicInOut)
      .tween('ride', () => k => {
        state.current = { h: iH(k), rise: iR(k), set: iS(k) };
        draw(state.current);
        if (swap && k >= 0.5) o.dataset.kind = s.isDay ? 'sun' : 'moon';
      })
      .on('end', () => { state.current = to; apply(); draw(to); });
    return () => select(o).interrupt();
  }, [ci, layoutKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="track" ref={track}>
      <svg className="arc" ref={svg} preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="dayfill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity=".16" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <clipPath id="clipDay"><rect ref={clipDay} /></clipPath>
          <clipPath id="clipNight"><rect ref={clipNight} /></clipPath>
        </defs>
        <line className="horizon" ref={horizon} />
        <path className="dayfill" ref={dayFill} clipPath="url(#clipDay)" />
        <path className="night" ref={nightPath} clipPath="url(#clipNight)" />
        <path className="day" ref={dayPath} clipPath="url(#clipDay)" />
      </svg>
      <span className="tick left swap" ref={tickL}><b>{ticks[0][0]}</b><span>{ticks[0][1]}</span></span>
      <span className="tick right swap" ref={tickR}><b>{ticks[1][0]}</b><span>{ticks[1][1]}</span></span>
      <div className="orb" ref={orb} data-kind="sun" aria-hidden="true">
        <div className="disc" />
        <svg className="cloud" viewBox="0 0 120 64">
          <path ref={cloud} fill="#e9edf2" d="M28 62C14 62 4 53 4 41c0-11 8-19 19-20C26 9 37 2 50 2c14 0 25 9 28 21 2-1 5-1 7-1 13 0 24 9 24 20s-10 20-23 20H28z" />
          <path className="bolt" fill="#ffd84a" d="M62 44 48 70h11l-6 22 20-30H61l7-18z" transform="translate(0,-14) scale(1 .9)" />
        </svg>
      </div>
    </div>
  );
}
