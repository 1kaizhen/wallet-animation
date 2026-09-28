// Weather vocabulary, sample-data expansion and snapshots.
// DATA has the same shape as an Open-Meteo forecast response, so switching to live data later is small.

export const STORM = [95, 96, 99];
export const SNOW = [71, 73, 75, 77, 85, 86];
export const RAIN = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82];

export function wmo(code, isDay) {
  const t = {
    0: isDay ? 'Sunny' : 'Clear night', 1: isDay ? 'Mostly sunny' : 'Mostly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Freezing fog', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle', 56: 'Freezing drizzle', 57: 'Freezing drizzle',
    61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 66: 'Freezing rain', 67: 'Freezing rain',
    71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains', 80: 'Light showers', 81: 'Showers', 82: 'Heavy showers',
    85: 'Snow showers', 86: 'Heavy snow showers', 95: 'Thunderstorms', 96: 'Thunderstorms with hail', 99: 'Thunderstorms with hail',
  };
  return t[code] || 'Unsettled';
}

// glow tint at the top of the page, per kind and sun phase
export const GLOW = {
  sunny:  { day: '#7a5f22', golden: '#9a3d1a', night: '#22356a' },
  clear:  { day: '#3a4f7a', golden: '#6b3f4a', night: '#1f3266' },
  cloudy: { day: '#46505c', golden: '#4d4046', night: '#1c2330' },
  rain:   { day: '#244d58', golden: '#3a3a48', night: '#172633' },
  storm:  { day: '#3a2f5c', golden: '#3e2c48', night: '#1f1a36' },
  snow:   { day: '#667687', golden: '#6b5f6e', night: '#28324a' },
  winter: { day: '#3a6e92', golden: '#4b5b8c', night: '#1b2d58' },
  autumn: { day: '#8a461a', golden: '#963319', night: '#3a2216' },
  spring: { day: '#7c5670', golden: '#8c4c5a', night: '#2e2a4a' },
};

export const deg = c => Math.round(c);
export const windText = k => `${Math.round(k)}\u202Fkm/h`;

/* ---------- time helpers: local wall-clock strings like 2026-09-27T12:05 ---------- */
export function parseLocal(str) {
  const [d, t = '00:00'] = str.split('T');
  const [Y, M, D] = d.split('-').map(Number), [h, m] = t.split(':').map(Number);
  return { Y, M, D, h, m, hours: h + m / 60, date: d };
}
export const instant = (L, off) => new Date(Date.UTC(L.Y, L.M - 1, L.D, L.h, L.m) - off * 1000);
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const weekday = L => WEEKDAYS[new Date(Date.UTC(L.Y, L.M - 1, L.D)).getUTCDay()];
export const hhmm = L => `${String(L.h).padStart(2, '0')}:${String(L.m).padStart(2, '0')}`;

/* ---------- expand a scene into forecast-shaped data ---------- */
const DAY0 = '2026-09-27';
const pad2 = n => String(n).padStart(2, '0');
function dateAdd(d, k) { const x = new Date(d + 'T00:00:00Z'); x.setUTCDate(x.getUTCDate() + k); return x.toISOString().slice(0, 10); }

export function makeData(c) {
  const [nh, nm] = c.time.split(':').map(Number);
  const now = nh + nm / 60;
  const hm = s => { const [a, b] = s.split(':').map(Number); return a + b / 60; };
  const rise = hm(c.rise), set = hm(c.set);
  const mid = (c.hi + c.lo) / 2, amp = (c.hi - c.lo) / 2;
  const diurnal = h => mid + amp * Math.cos(2 * Math.PI * ((((h % 24) + 24) % 24) - 15) / 24);
  const shift = c.temp - diurnal(now);
  const h = { time: [], temperature_2m: [], apparent_temperature: [], relative_humidity_2m: [], weather_code: [], wind_speed_10m: [], precipitation_probability: [], is_day: [], cloud_cover: [] };
  for (let i = 0; i < 72; i++) {
    const day = Math.floor(i / 24), hr = i % 24;
    h.time.push(`${dateAdd(DAY0, day)}T${pad2(hr)}:00`);
    const fade = Math.max(0, 1 - Math.abs(i - now) / 18);        // drift back to the plain daily curve away from "now"
    let T = diurnal(i) + shift * fade;
    if (c.trend) { const k = (i - Math.floor(now)) / 2; if (k >= 0 && k <= c.trend.length - 1 && Number.isInteger(k)) T = c.trend[k]; }
    h.temperature_2m.push(T);
    h.apparent_temperature.push(T + (c.feels - c.temp));
    h.relative_humidity_2m.push(c.hum);
    h.weather_code.push(c.code);
    h.wind_speed_10m.push(c.wind);
    h.precipitation_probability.push(c.pop);
    h.is_day.push(hr + 0.5 > rise && hr + 0.5 < set ? 1 : 0);
    h.cloud_cover.push(c.code >= 3 ? 95 : c.code === 2 ? 55 : 5);
  }
  const d = { time: [], temperature_2m_max: [], temperature_2m_min: [], sunrise: [], sunset: [], daylight_duration: [] };
  for (let k = 0; k < 3; k++) {
    const dt = dateAdd(DAY0, k);
    d.time.push(dt); d.temperature_2m_max.push(c.hi); d.temperature_2m_min.push(c.lo);
    d.sunrise.push(`${dt}T${c.rise}`); d.sunset.push(`${dt}T${c.set}`); d.daylight_duration.push((set - rise) * 3600);
  }
  const cur = { time: `${DAY0}T${c.time}`, temperature_2m: c.temp, apparent_temperature: c.feels, relative_humidity_2m: c.hum,
    weather_code: c.code, wind_speed_10m: c.wind, is_day: now > rise && now < set ? 1 : 0, cloud_cover: h.cloud_cover[0] };
  return { tz: c.tz, off: c.off, abbr: c.abbr, cur, h, d, i0: Math.floor(now) };
}

/* ---------- one renderable moment (idx null = now) ---------- */
export function snap(D, idx = null) {
  const h = D.h, now = idx == null, i = now ? D.i0 : idx;
  const L = parseLocal(now ? D.cur.time : h.time[i]);
  const di = Math.max(0, D.d.time.indexOf(L.date));
  const pick = k => (now ? D.cur[k] : h[k][i]);
  return {
    idx, L, at: instant(L, D.off), base: i,
    temp: pick('temperature_2m'), feels: pick('apparent_temperature'), hum: pick('relative_humidity_2m'),
    wind: pick('wind_speed_10m'), code: pick('weather_code'), isDay: !!pick('is_day'), cloud: pick('cloud_cover'),
    pop: h.precipitation_probability[i] ?? 0,
    hi: D.d.temperature_2m_max[di], lo: D.d.temperature_2m_min[di],
    rise: D.d.sunrise[di], set: D.d.sunset[di], daylight: D.d.daylight_duration[di],
  };
}

/* ---------- which particle effect and how many ---------- */
export function fxFor(s, kind) {
  const c = s.code;
  if (STORM.includes(c)) return { mode: 'storm', n: 180 };
  if (SNOW.includes(c)) return { mode: 'snow', n: { 71: 45, 73: 90, 75: 160, 77: 40, 85: 70, 86: 140 }[c] };
  if (RAIN.includes(c)) return { mode: 'rain', n: { 51: 45, 53: 70, 55: 100, 56: 60, 57: 90, 61: 80, 63: 130, 65: 220, 66: 90, 67: 160, 80: 90, 81: 150, 82: 240 }[c] };
  if (kind === 'winter') return { mode: 'winter', n: 55 };
  if (kind === 'autumn') return { mode: 'autumn', n: 26 };
  if (kind === 'spring') return { mode: 'spring', n: 40 };
  if (c >= 2) return { mode: 'cloudy', n: c === 2 ? 5 : 9 };
  return s.isDay ? { mode: 'sunny', n: 16 } : { mode: 'clear', n: 90 };
}

/* ---------- sun position for the globe's night side ---------- */
export function subsolarAt(date) {
  const N = (date - Date.UTC(date.getUTCFullYear(), 0, 0)) / 864e5;
  const decl = -23.44 * Math.cos((2 * Math.PI) / 365 * (N + 10));
  const utcH = date.getUTCHours() + date.getUTCMinutes() / 60;
  return [-15 * (utcH - 12), decl];
}
