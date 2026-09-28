import { deg, windText } from '../lib/weather.js';

export default function Stats({ s, refs }) {
  const items = [
    ['Feels like', `${deg(s.feels)}°`],
    ['Wind', windText(s.wind)],
    ['Humidity', `${Math.round(s.hum)}%`],
    ['Precipitation', `${Math.round(s.pop)}%`],
  ];
  return (
    <dl className="stats swap" ref={el => (refs.stats = el)}>
      {items.map(([k, v]) => (
        <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
      ))}
    </dl>
  );
}
