import { useEffect, useRef, useState } from 'react';
import { interpolateNumber, easeCubicOut } from 'd3';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Window size (debounced) plus a bump when web fonts finish loading, since fonts change layout.
export function useViewport() {
  const [vp, setVp] = useState(() => ({ w: window.innerWidth, h: window.innerHeight, fonts: 0 }));
  useEffect(() => {
    let t;
    const on = () => { clearTimeout(t); t = setTimeout(() => setVp(v => ({ ...v, w: window.innerWidth, h: window.innerHeight })), 80); };
    window.addEventListener('resize', on);
    document.fonts?.ready.then(() => setVp(v => ({ ...v, fonts: v.fonts + 1 })));
    return () => { window.removeEventListener('resize', on); clearTimeout(t); };
  }, []);
  return vp;
}

// Vertical scale so everything fits one screen: 1 at 1200px tall, never below .56. Phones scroll instead.
export const scaleFor = vp => (vp.w < 600 ? 1 : Math.min(1, Math.max(0.56, vp.h / 1200)));

// Counts a number from its previous value to the new one.
export function useCountUp(value, duration = 900) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    if (prefersReducedMotion() || from.current === value) { from.current = value; setShown(value); return; }
    const i = interpolateNumber(from.current, value), t0 = performance.now();
    let raf;
    const tick = now => {
      const k = Math.min(1, (now - t0) / duration);
      setShown(Math.round(i(easeCubicOut(k))));
      if (k < 1) raf = requestAnimationFrame(tick); else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); from.current = value; };
  }, [value, duration]);
  return shown;
}
