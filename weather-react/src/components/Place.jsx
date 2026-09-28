import { weekday, hhmm } from '../lib/weather.js';

export default function Place({ name, s, refs, pickerOpen, onOpenPicker }) {
  return (
    <header className="place">
      <div className="place-row">
        <h1 className="swap">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.7 2.3a1 1 0 0 0-1.1-.2L3 9.6a1 1 0 0 0 .1 1.9l7.3 2.1 2.1 7.3a1 1 0 0 0 1.9.1l7.5-17.6a1 1 0 0 0-.2-1.1z" /></svg>
          <span>{name}</span>
        </h1>
        <button
          type="button"
          ref={el => (refs.pill = el)}
          className={pickerOpen ? 'change hidden-for-morph' : 'change'}
          aria-haspopup="dialog"
          aria-expanded={pickerOpen}
          aria-controls="picker"
          onClick={onOpenPicker}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="7" /><path d="m20 20-4.5-4.5" /></svg>
          <span className="change-label">Change City</span>
        </button>
      </div>
      <p className="when swap">{weekday(s.L)}, {hhmm(s.L)}</p>
    </header>
  );
}
