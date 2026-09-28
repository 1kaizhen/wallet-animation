import { deg, wmo } from '../lib/weather.js';
import { useCountUp } from '../lib/hooks.js';

export default function TempLockup({ s, label }) {
  const t = useCountUp(deg(s.temp));
  return (
    <div className="lockup swap">
      <div className="temp"><span className="num">{t}</span><span className="deg" aria-hidden="true">°</span></div>
      <div className="cond-wrap">
        <p className="cond">{label || wmo(s.code, s.isDay)}</p>
        <p className="range"><span>High <b>{deg(s.hi)}°</b></span><span>Low <b>{deg(s.lo)}°</b></span></p>
      </div>
    </div>
  );
}
