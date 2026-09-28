import { useLayoutEffect, useState } from 'react';

// Horizontal guide lines in the grey margins. Each continues a real line of the design:
// the horizon (both sides), the stats rules (both sides), the chart's first point (left) and last point (right).
// Measured from the real panel, so they stop exactly at the hatch even with a scrollbar.
export default function Guides({ refs, layoutKey }) {
  const [lines, setLines] = useState([]);
  useLayoutEffect(() => {
    const docW = document.documentElement.clientWidth;
    if (docW < 860 || !refs.panel || !refs.stats || !refs.arcGeom) { setLines(prev => (prev.length ? [] : prev)); return; }
    const pr = refs.panel.getBoundingClientRect();
    const hatch = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hatch')) || 37;
    const leftW = Math.max(0, Math.round(pr.left + scrollX - hatch));
    const rightX = Math.round(pr.right + scrollX + hatch);
    const stats = refs.stats.getBoundingClientRect(), g = refs.arcGeom();
    const ys = [['l', g.top + g.yh], ['r', g.top + g.yh], ['l', stats.top], ['r', stats.top], ['l', stats.bottom - 1], ['r', stats.bottom - 1]];
    const he = refs.hourlyEnds;
    if (he && refs.hourly) {
      const hs = refs.hourly.getBoundingClientRect(), k = hs.height / he.H;
      ys.push(['l', hs.top + he.y0 * k]);
      if (he.full) ys.push(['r', hs.top + he.y1 * k]);
    }
    const next = ys.map(([side, y]) => ({
      top: Math.round(y + scrollY),
      left: side === 'l' ? 0 : rightX,
      width: side === 'l' ? leftW : Math.max(0, docW - rightX),
    }));
    setLines(prev => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  });
  return (
    <div className="guides" aria-hidden="true">
      {lines.map((l, i) => <i key={i} style={{ top: l.top, left: l.left, width: l.width }} />)}
    </div>
  );
}
