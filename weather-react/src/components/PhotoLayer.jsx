import { useEffect, useRef } from 'react';

// Two stacked images; the new photo fades in over the old one once it has loaded.
export default function PhotoLayer({ src, pos }) {
  const a = useRef(null), b = useRef(null), front = useRef('a'), key = useRef(null);
  useEffect(() => {
    if (key.current === src) return;
    key.current = src;
    const fr = front.current === 'a' ? a.current : b.current;
    const back = front.current === 'a' ? b.current : a.current;
    back.onload = () => {
      if (key.current !== src) return;
      back.classList.add('on'); fr.classList.remove('on');
      front.current = front.current === 'a' ? 'b' : 'a';
    };
    back.style.objectPosition = pos || '50% 50%';
    back.src = src;
  }, [src, pos]);
  return (
    <div className="photo" aria-hidden="true">
      <img ref={a} alt="" decoding="async" />
      <img ref={b} alt="" decoding="async" />
    </div>
  );
}
