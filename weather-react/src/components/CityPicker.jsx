import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { deg } from '../lib/weather.js';
import { prefersReducedMotion } from '../lib/hooks.js';

const EASE = 'cubic-bezier(.2,.9,.25,1)';
const OPEN_BG = 'rgba(40,40,42,.72)', PILL_BG = 'rgba(255,255,255,.1)';

// Spotlight-style city search. It grows out of the Change City pill and shrinks back into it,
// with the page blurred behind. `pillRef.pill` is the pill's DOM node.
export default function CityPicker({ open, cities, snaps, current, pillRef, onClose }) {
  const [shown, setShown] = useState(false);       // mounted in the DOM (stays true during the closing animation)
  const [scrimOn, setScrimOn] = useState(false);
  const [contentOn, setContentOn] = useState(false);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const box = useRef(null), input = useRef(null), list = useRef(null), anim = useRef(null), closing = useRef(false);

  const items = useMemo(() => {
    const term = q.trim().toLowerCase();
    return cities.map((c, ci) => ({ c, ci }))
      .filter(({ c }) => !term || c.name.toLowerCase().includes(term) || c.country.toLowerCase().includes(term))
      .sort((a, b) => a.c.name.localeCompare(b.c.name));
  }, [q, cities]);

  const pillBox = () => {
    const r = pillRef.pill.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height, radius: r.height / 2 };
  };
  const frames = (a, b, ra, rb, bgA, bgB) => [
    { left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, height: `${a.height}px`, transform: 'none', borderRadius: `${ra}px`, backgroundColor: bgA },
    { left: `${b.left}px`, top: `${b.top}px`, width: `${b.width}px`, height: `${b.height}px`, transform: 'none', borderRadius: `${rb}px`, backgroundColor: bgB },
  ];

  // opening: mount, then morph from the pill to the panel
  useEffect(() => {
    if (open && !shown) {
      setQ(''); setActive(Math.max(0, [...cities.keys()].sort((a, b) => cities[a].name.localeCompare(cities[b].name)).indexOf(current)));
      closing.current = false; setContentOn(false); setShown(true);
    }
    if (!open && shown && !closing.current) requestClose(null);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    if (!shown || closing.current) return;
    setScrimOn(true);
    input.current?.focus({ preventScroll: true });
    if (prefersReducedMotion()) { setContentOn(true); return; }
    const from = pillBox(), to = box.current.getBoundingClientRect();
    anim.current?.cancel();
    anim.current = box.current.animate(frames(from, to, from.radius, 22, PILL_BG, OPEN_BG), { duration: 460, easing: EASE });
    const t = setTimeout(() => setContentOn(true), 200);
    return () => clearTimeout(t);
  }, [shown]); // eslint-disable-line react-hooks/exhaustive-deps

  // closing: morph back into the pill, then unmount and report the pick
  function requestClose(pick) {
    if (closing.current) return;
    closing.current = true;
    setScrimOn(false); setContentOn(false);
    const finish = () => { anim.current = null; setShown(false); closing.current = false; pillRef.pill?.focus({ preventScroll: true }); onClose(pick); };
    if (prefersReducedMotion() || !box.current) return finish();
    const from = box.current.getBoundingClientRect(), to = pillBox();
    anim.current?.cancel();
    anim.current = box.current.animate(frames(from, to, 22, to.radius, OPEN_BG, PILL_BG), { duration: 360, easing: EASE, fill: 'forwards' });
    anim.current.onfinish = finish;
  }

  // keep the highlighted row in view
  useEffect(() => { list.current?.querySelector('.active')?.scrollIntoView({ block: 'nearest' }); }, [active, items]);

  const onKey = e => {
    const n = items.length;
    if (e.key === 'ArrowDown') { e.preventDefault(); if (n) setActive(a => (a + 1) % n); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (n) setActive(a => (a - 1 + n) % n); }
    else if (e.key === 'Enter' && n) { e.preventDefault(); requestClose(items[Math.min(active, n - 1)].ci); }
    else if (e.key === 'Escape') { e.preventDefault(); requestClose(null); }
    else if (e.key === 'Tab') e.preventDefault();
  };

  if (!shown) return null;
  const cls = ['picker', contentOn ? '' : 'closed-content', 'morphing'].join(' ');
  return createPortal(
    <>
      <div className={scrimOn ? 'scrim on' : 'scrim'} aria-hidden="true" onPointerDown={() => requestClose(null)} />
      <div className={cls} id="picker" role="dialog" aria-modal="true" aria-label="Change city" ref={box}>
        <label className="search">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="7" /><path d="m20 20-4.5-4.5" /></svg>
          <input
            ref={input} type="text" value={q} placeholder="Search cities" autoComplete="off" spellCheck={false}
            role="combobox" aria-expanded="true" aria-controls="cityList" aria-autocomplete="list"
            aria-activedescendant={items[active] ? `opt-${items[active].ci}` : undefined}
            onChange={e => { setQ(e.target.value); setActive(0); }} onKeyDown={onKey}
          />
          <kbd className="esc" aria-hidden="true">esc</kbd>
        </label>
        <div className="picker-body">
          <p className="group">Popular cities</p>
          <ul id="cityList" role="listbox" aria-label="Cities" ref={list}>
            {items.map(({ c, ci }, k) => (
              <li key={ci}>
                <button
                  type="button" role="option" id={`opt-${ci}`} aria-selected={k === active}
                  aria-current={ci === current ? 'true' : undefined}
                  className={k === active ? 'active' : undefined}
                  onMouseEnter={() => setActive(k)} onClick={() => requestClose(ci)}
                >
                  <span className="thumb" style={{ backgroundImage: `url('${c.photo}')` }} />
                  <span className="nm">{c.name}<small>{c.country}</small></span>
                  <span className="tp">{deg(snaps[ci].temp)}°</span>
                </button>
              </li>
            ))}
            {!items.length && <li className="empty">No city matches “{q.trim()}”</li>}
          </ul>
        </div>
      </div>
    </>,
    document.body
  );
}
