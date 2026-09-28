import { useEffect, useLayoutEffect, useRef } from 'react';
import { createFx } from '../lib/fx.js';
import { prefersReducedMotion } from '../lib/hooks.js';

export default function WeatherFx({ mode, n, refs, layoutKey }) {
  const canvas = useRef(null), flash = useRef(null), engine = useRef(null);
  useEffect(() => {
    engine.current = createFx(canvas.current, flash.current, prefersReducedMotion());
    return () => { engine.current.destroy(); engine.current = null; };
  }, []);
  useLayoutEffect(() => {
    const p = canvas.current.closest('.panel'); if (!p || !engine.current) return;
    engine.current.resize(p.clientWidth, Math.round(Math.min(p.clientHeight, Math.max(700, window.innerHeight))));
  }, [layoutKey, refs]);
  useEffect(() => { engine.current?.set(mode, n); }, [mode, n]);
  return (
    <>
      <div className="flash" ref={flash} aria-hidden="true" />
      <canvas id="fx" ref={canvas} aria-hidden="true" />
    </>
  );
}
