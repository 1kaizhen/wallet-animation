import { useLayoutEffect, useRef } from 'react';
import { select, scaleLinear, extent, min, area, line, curveMonotoneX } from 'd3';
import { deg, parseLocal } from '../lib/weather.js';

// Next 10 hours: now, +2 … +10. Height follows the vertical scale, text stays the same size.
export default function HourlyChart({ data, s, S, refs, layoutKey }) {
  const wrap = useRef(null), svgRef = useRef(null);
  useLayoutEffect(() => {
    const D = data, svg = select(svgRef.current); svg.selectAll('*').remove();
    const W = Math.max(300, Math.round(wrap.current.clientWidth || 896));
    const k = Math.max(0.72, S), H = Math.round(124 * k), yHi = Math.round(38 * k), yLo = Math.round(77 * k), base = Math.round(100 * k);
    svg.attr('viewBox', `0 0 ${W} ${H}`).attr('height', H);
    const pts = [];
    for (let j = 0; j <= 5; j++) {
      const i = s.base + j * 2; if (i >= D.h.time.length) break;
      pts.push({ i: j, c: j === 0 ? s.temp : D.h.temperature_2m[i], L: parseLocal(D.h.time[i]) });
    }
    const x = scaleLinear().domain([0, 5]).range([12, W - 21]);
    const ext = extent(pts, d => d.c);
    const y = scaleLinear().domain(ext[1] - ext[0] < 2 ? [(ext[0] + ext[1]) / 2 - 1, (ext[0] + ext[1]) / 2 + 1] : ext).range([yLo, yHi]);
    const lg = svg.append('defs').append('linearGradient').attr('id', 'hfill')
      .attr('gradientUnits', 'userSpaceOnUse').attr('x1', 0).attr('x2', 0).attr('y1', min(pts, d => y(d.c))).attr('y2', base + 20);
    [[0, 0.38], [0.4, 0.22], [0.75, 0.07], [1, 0]].forEach(([o, a]) => lg.append('stop').attr('offset', o).attr('stop-color', '#0c0c0c').attr('stop-opacity', a));
    svg.append('path').attr('class', 'area').attr('d', area().x(d => x(d.i)).y0(base + 20).y1(d => y(d.c)).curve(curveMonotoneX)(pts));
    svg.append('path').attr('class', 'line').attr('d', line().x(d => x(d.i)).y(d => y(d.c)).curve(curveMonotoneX)(pts));
    svg.append('line').attr('class', 'nowline').attr('x1', x(0)).attr('x2', x(0)).attr('y1', y(pts[0].c) + 7).attr('y2', base);
    const g = svg.selectAll('g.p').data(pts).join('g')
      .attr('class', d => (d.i === 0 ? 'first' : d.i === 5 ? 'last' : null)).attr('transform', d => `translate(${x(d.i)},0)`);
    g.append('circle').attr('cy', d => y(d.c)).attr('r', d => (d.i === 0 ? 5 : 3.4)).attr('class', d => (d.i === 0 ? 'now' : null));
    g.append('text').attr('class', d => (d.i === 0 ? 't now' : 't')).attr('x', d => (d.i === 0 ? -10 : d.i === 5 ? 15 : 0))
      .attr('y', d => y(d.c) - 12).text(d => `${deg(d.c)}°`);
    g.append('text').attr('class', d => (d.i === 0 ? 'now' : null)).attr('x', d => (d.i === 5 ? 21 : 0))
      .attr('y', H - 7).text(d => (d.i === 0 ? 'Now' : `${String(d.L.h).padStart(2, '0')}:00`));
    refs.hourlyEnds = { H, y0: y(pts[0].c), y1: y(pts[pts.length - 1].c), full: pts.length === 6 };
  }, [data, s, S, layoutKey, refs]);

  return (
    <div className="hourly swap" aria-label="Next 10 hours" ref={wrap}>
      <div className="hourly-head"><span>Next 10 hours</span><span>{data.abbr ? `Local time, ${data.abbr}` : 'Local time'}</span></div>
      <svg ref={el => { svgRef.current = el; refs.hourly = el; }} viewBox="0 0 896 124" />
    </div>
  );
}
