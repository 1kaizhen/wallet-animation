# Weather (React)

A dark, one-screen weather page: a sun or moon riding a day/night curve, the city's temperature and stats over a blended city photo, a 10-hour chart, live weather effects, and a 3D globe you can drag to pick a city. Change City opens a Spotlight-style search that grows out of the pill.

This is the React version of the original single-file `Weather.html`. It looks and behaves the same; I compared screenshots of both at 1600×1200 and they match to the pixel.

## Run it

Needs Node 18 or newer.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the build at http://localhost:4173
```

The build uses relative paths (`base: './'`), so `dist/` can be uploaded to any static host. Open it through a server, not by double-clicking `dist/index.html`: browsers block module scripts from `file://`.

Internet is only needed for the Google Fonts stylesheet. D3 and topojson-client are npm packages, and the photos and map are bundled.

## Stack

- React 18 + Vite 5, plain JavaScript (JSX), no TypeScript.
- D3 7 for the projection, curves, scales and tweens. topojson-client for the map.
- One global stylesheet (`src/styles.css`) with the same class names as the original.

## Project structure

```
index.html                 fonts + #root
src/
  main.jsx                 mounts <App/> in StrictMode
  App.jsx                  state, city switching, keyboard shortcuts, page layout
  styles.css               all styles (tokens, frame, arc, stage, picker, globe)
  data/
    scenes.js              the nine sample cities (+ photo imports and credits)
    world.json             TopoJSON world land (the globe's coastlines)
  assets/photos/*.jpg      city photos (Wikimedia Commons)
  lib/
    weather.js             WMO codes and labels, GLOW colours, makeData(), snap(), fxFor(), time helpers, subsolarAt()
    arc.js                 dayEdges() and wave(): the sun curve maths
    fx.js                  createFx(): the particle engine (rain, snow, storm, leaves, petals, stars, clouds, dust)
    hooks.js               useViewport(), scaleFor(), useCountUp(), prefersReducedMotion()
  components/
    SunArc.jsx             curve, horizon, sunrise/sunset labels, sun/moon riding the curve
    Place.jsx              city name, Change City pill, day and time
    TempLockup.jsx         big temperature (counts up), condition, high/low
    Stats.jsx              Feels like / Wind / Humidity / Precipitation
    HourlyChart.jsx        the 10-hour line chart (D3 into an <svg>)
    PhotoLayer.jsx         two-layer crossfading city photo
    WeatherFx.jsx          particle canvas + lightning flash
    Globe.jsx              canvas globe: drawing, rotation, pin, drag-to-pick, city markers
    CityPicker.jsx         Spotlight-style search (portal to <body>) with morph animation and blur
    Guides.jsx             horizontal guide lines outside the hatched frame
docs/
  DESIGN_NOTES.md          full design and behaviour spec, decisions not to undo, test checklist
```

## How state flows

`App` holds three pieces of state:

- `target`: the city the globe is turning to. It changes immediately when you pick a city.
- `ci`: the city whose data is on screen. It changes 180ms later, while the content is faded (`.app.swapping` fades every `.swap` element to 30%).
- `pickerOpen`: whether Change City is open.

`go(index)` is the only way to change city. The picker, globe drag, globe tap and arrow keys all call it.

Everything shown comes from a snapshot, `snap(DATA[ci])`. `DATA` is built once from `SCENES` with `makeData()`, in the same shape as an Open-Meteo forecast response, so live data can replace it later (see `docs/DESIGN_NOTES.md`, section 14).

### Why some components draw imperatively

Several parts are animation-heavy, so they draw into their own DOM nodes from `useLayoutEffect`, the usual way to combine D3 or canvas with React:

- `SunArc`: tweens the hour and sunrise/sunset every frame so the orb rides the curve.
- `HourlyChart`: D3 renders the chart into its `<svg>`.
- `Globe`: redraws the canvas every frame while turning or dragging. Its latest props are kept in a ref (`live`), so the pointer handlers and tweens read current values without being re-attached.
- `WeatherFx`: a `requestAnimationFrame` loop created once per mount and destroyed on unmount.

Most layout effects re-run when `layoutKey` changes. That key combines the city, window size and a font-loaded counter.

### Shared DOM refs

`App` passes a plain `refs` object down. Components put nodes or functions on it (`refs.stats`, `refs.hourly`, `refs.hourlyEnds`, `refs.arcGeom`, `refs.pill`, `refs.panel`, `refs.stage`). `Guides` reads them to line up with the horizon, the stats rules and the chart points. `CityPicker` reads `refs.pill` to morph from the pill's exact position.

Parent ref callbacks run after child layout effects. So `Globe` and `WeatherFx` find the panel with `closest('.panel')`, and `Guides` is rendered after the frame.

## One-screen layout

`scaleFor(viewport)` gives `S = clamp(innerHeight / 1200, .56, 1)` on screens 600px and wider. `App` sets it on the root as `--s`, plus `--sf = max(S, .8)` for text. Spacing and sizes in CSS use `calc(Npx * var(--s))`. The globe takes whatever height is left and shrinks so the pin stays visible. Phones (under 600px) scroll slightly.

Tested with no scroll at 1600×1200, 1440×900, 1366×768, 1280×720 and 1024×768.

## Common changes

- **Add a city:** add an entry to `SCENES` in `src/data/scenes.js`, put its photo in `src/assets/photos/` and import it. Pick a WMO `code` that matches `kind`. The picker, globe markers and arrow keys pick it up automatically.
- **Change an effect:** `MAKERS` and the drawing branches in `src/lib/fx.js`; counts per weather code are in `fxFor()` in `src/lib/weather.js`.
- **Change the curve:** `yh`, `up` and `down` in `SunArc.jsx` (`geom()`), and the maths in `src/lib/arc.js`. Keep the no-kink formula.

Read `docs/DESIGN_NOTES.md` before changing layout, the curve, the guides or the picker. Its "Decisions you should not undo" section lists fixes that were made on purpose.

## Photo credits

All photos are from Wikimedia Commons. The photographers and licences are in `src/data/scenes.js` (`credit` on each scene) and in `docs/DESIGN_NOTES.md`. They are not shown in the UI. CC BY and CC BY-SA require visible credit if the site is published, so add a credits link before going public, or use your own photos.
