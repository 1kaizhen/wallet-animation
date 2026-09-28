// The day/night wave the sun and moon ride on.
import { parseLocal } from './weather.js';

// sunrise/sunset as local hours, with polar day and night handled
export function dayEdges(s) {
  if (s.daylight >= 86000) return { rise: 0, set: 24, polar: 'day' };
  if (!s.daylight || s.daylight < 60 || !s.rise) return { rise: 12, set: 12, polar: 'night' };
  const r = parseLocal(s.rise), t = parseLocal(s.set);
  return { rise: r.hours, set: t.date > r.date ? t.hours + 24 : t.hours, polar: null };
}

// g: { x0, x1, yh, up, down }  e: { rise, set } in hours. Returns h -> {x, y}.
// Above the horizon: cosine arc. Below: a quadratic with the same slope at the horizon (no kink)
// that still slopes gently to the edges.
export function wave(g, e) {
  const noon = (e.rise + e.set) / 2;
  const c0 = Math.max(-0.98, Math.min(0.98, Math.cos((2 * Math.PI * (e.rise - noon)) / 24)));
  return h => {
    const c = Math.cos((2 * Math.PI * (h - noon)) / 24), u = (c - c0) / (1 - c0);
    let y;
    if (u >= 0) y = g.yh - g.up * u;
    else {
      const m = (1 + c0) / (1 - c0), x = -u / m, a = Math.min(2, (g.up * m) / g.down);
      y = g.yh + g.down * (a * x + (1 - a) * x * x);
    }
    return { x: g.x0 + (h / 24) * (g.x1 - g.x0), y };
  };
}
