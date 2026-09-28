import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SCENES, KIND_ORDER } from './data/scenes.js';
import { makeData, snap, fxFor } from './lib/weather.js';
import { useViewport, scaleFor, prefersReducedMotion } from './lib/hooks.js';
import SunArc from './components/SunArc.jsx';
import Place from './components/Place.jsx';
import TempLockup from './components/TempLockup.jsx';
import Stats from './components/Stats.jsx';
import HourlyChart from './components/HourlyChart.jsx';
import PhotoLayer from './components/PhotoLayer.jsx';
import WeatherFx from './components/WeatherFx.jsx';
import Globe from './components/Globe.jsx';
import CityPicker from './components/CityPicker.jsx';
import Guides from './components/Guides.jsx';

const DATA = SCENES.map(makeData);
const SNAPS = DATA.map(d => snap(d));

export default function App() {
  const vp = useViewport();
  const S = scaleFor(vp);
  const [target, setTarget] = useState(0);        // city the globe is turning to
  const [ci, setCi] = useState(0);                // city whose data is on screen
  const [swapping, setSwapping] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const swapTimer = useRef(0);
  const refs = useRef({}).current;               // shared DOM refs: panel, stage, arc, stats, hourly, hourlyEnds, pill

  const scene = SCENES[ci], s = SNAPS[ci];
  const fx = useMemo(() => fxFor(s, scene.kind), [s, scene.kind]);
  const layoutKey = `${ci}|${vp.w}|${vp.h}|${vp.fonts}`;

  // The one way to change city: content fades, the globe turns now, data swaps after 180ms.
  const go = useCallback(next => {
    setTarget(next);
    clearTimeout(swapTimer.current);
    setSwapping(true);
    swapTimer.current = setTimeout(() => { setCi(next); setSwapping(false); }, prefersReducedMotion() ? 0 : 180);
  }, []);

  useEffect(() => { document.title = `${scene.name} ${Math.round(s.temp)}° · Weather`; }, [scene, s]);

  // keyboard: Cmd/Ctrl+K toggles the picker, arrows step through weather kinds
  useEffect(() => {
    const on = e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPickerOpen(o => !o); return; }
      if (pickerOpen || e.target.matches?.('input')) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const k = KIND_ORDER.indexOf(SCENES[target].kind);
        const next = KIND_ORDER[(k + (e.key === 'ArrowRight' ? 1 : -1) + KIND_ORDER.length) % KIND_ORDER.length];
        go(SCENES.findIndex(c => c.kind === next));
      }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [pickerOpen, target, go]);

  return (
    <div className={swapping ? 'app swapping' : 'app'} style={{ '--s': S.toFixed(3), '--sf': Math.max(S, 0.8).toFixed(3) }}>
      <div className="frame">
        <div className="panel" ref={el => (refs.panel = el)}>
          <div className="sky" aria-hidden="true" />
          <WeatherFx mode={fx.mode} n={fx.n} refs={refs} layoutKey={layoutKey} />

          <SunArc s={s} kind={scene.kind} ci={ci} refs={refs} layoutKey={layoutKey} />

          <main className="stage" aria-live="polite" ref={el => (refs.stage = el)}>
            <PhotoLayer src={scene.photo} pos={scene.pos} />
            <div className="head">
              <Place name={scene.name} s={s} refs={refs} pickerOpen={pickerOpen} onOpenPicker={() => setPickerOpen(true)} />
              <TempLockup s={s} label={scene.label} />
            </div>
            <div className="data">
              <Stats s={s} refs={refs} />
              <HourlyChart data={DATA[ci]} s={s} S={S} refs={refs} layoutKey={layoutKey} />
            </div>
          </main>

          <Globe cities={SCENES} snaps={SNAPS} target={target} refs={refs} layoutKey={layoutKey} onPick={go} />
        </div>
      </div>

      <Guides refs={refs} layoutKey={layoutKey} />

      <CityPicker
        open={pickerOpen}
        cities={SCENES}
        snaps={SNAPS}
        current={target}
        pillRef={refs}
        onClose={pick => { setPickerOpen(false); if (pick != null && pick !== target) go(pick); }}
      />
    </div>
  );
}
