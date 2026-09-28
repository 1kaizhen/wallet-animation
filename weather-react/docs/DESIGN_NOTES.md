# Weather widget: project handoff

> **Note for the React version:** this spec was written for the original single-file `Weather.html`. The design, behaviour, numbers and "decisions not to undo" all still apply. Sections 2 and 3 describe the old file layout; see `README.md` for where each part now lives (for example `drawArc`/`placeOrb` are in `components/SunArc.jsx`, `makeData`/`snap` are in `lib/weather.js`, the particle engine is `lib/fx.js`, the picker is `components/CityPicker.jsx`). Function names were kept the same where possible.


This document describes `Weather.html`, a single-file weather page built to match a design mockup (`Weather_Widget.png`, 1600×1200). It explains what the page does, how the file is organised, how every part works, the design rules it follows, and the decisions made along the way, so you can keep working on it without breaking things that were fixed on purpose.

Read the section "Decisions you should not undo" before changing layout, the sun curve or the guide lines.

---

## 1. What it is

A dark, full-screen weather page for one city at a time. From top to bottom:

1. A sun (or moon) sitting on a wavy day/night curve, with sunrise and sunset times at the two ends.
2. The city name, a "Change City" button, and the local day and time.
3. A big temperature with the condition ("Sunny") and the day's high and low.
4. Four stats in a ruled row: Feels like, Wind, Humidity, Precipitation.
5. A "Next 10 hours" temperature line chart.
6. A 3D globe at the bottom that turns to the selected city and shows a pin on it. The globe can be dragged to pick a city.

Behind the text sits a darkened photo of the city. Weather effects (rain, snow, lightning, leaves, petals, stars, drifting clouds, dust) animate over the whole panel and blend into the photo.

The whole page fits in one screen with no scrolling on desktop and laptop sizes.

The data is **sample data built into the file**. Nothing is fetched for weather. There are nine cities, one per weather type.

---

## 2. Files and how to run it

| File | What it is |
|---|---|
| `Weather.html` | The whole app. About 2.5 MB because the world map data and nine city photos are embedded in it. |
| `Weather_Widget.png` | The design mockup it was built from (1600×1200). |

To run it, open `Weather.html` in a browser. There is no build step for the finished file.

It needs an internet connection for three things only: the Google Fonts stylesheet, D3 (from cdnjs) and topojson-client (from jsDelivr). The weather data, map data and photos are all inside the file.

### How the file was generated (useful if you rebuild it)

The file was produced from a template with three placeholders that a small Python script filled in:

- `/*__WORLD__*/` became `const WORLD = {...}`, a TopoJSON world land topology (about 55 KB).
- `/*__PHOTOS__*/` became an object of `data:image/jpeg;base64,...` strings, one per photo key.
- `/*__SCENES__*/` became the `SCENES` array (see section 6).

In the delivered file these are already filled in. If you want to edit the source comfortably, a good first task is to split it back out: move `WORLD`, `PHOTOS` and `SCENES` into separate files (for example `world.json`, `photos/`, `scenes.json`) and keep `index.html` small. See section 13.

---

## 3. How the file is laid out

In order, top to bottom:

1. `<head>`: meta viewport (with `viewport-fit=cover`), Google Fonts link, an HTML comment with photo licence notes, then one big `<style>` block.
2. `<body>`:
   - `#guides`: container for the horizontal guide lines drawn outside the frame.
   - `.frame` > `#panel.panel`: the centred column that holds everything visible.
     - `.sky`, `#flash`, `#fx`: atmosphere layers (glow, lightning flash, particle canvas).
     - `.track`: the sun curve (`svg#arc`), the sunrise/sunset labels (`.tick.left`, `.tick.right`) and the orb (`#orb`).
     - `main.stage`: the photo layer (`.photo` with `#photoA` and `#photoB`), the header (`.head`), and the data column (`.data`) with stats and the hourly chart.
     - `#globeWrap.globe`: the globe canvas, the drag hint pill, and the pin.
3. Two library scripts: D3 7.8.5 and topojson-client 3.1.0.
4. One inline `<script>` with everything else.

### Inside the main script, in order

| Section comment | What's there |
|---|---|
| `const WORLD = …` | TopoJSON land data (one huge line). |
| Sample scenes | `PHOTOS`, `SCENES`, `POOL = SCENES`, global state (`rot`, `view`). |
| weather vocabulary | `KINDS`, `KIND_LABEL`, the WMO code groups `STORM`, `SNOW`, `RAIN`, `wmo()` labels, `kindOf()` (unused, see section 12), `GLOW` colours. |
| time helpers | `parseLocal`, `instant`, `weekday`, `hhmm`, `liveLocal` (unused), `TZ_ABBR`, `tzAbbr`. |
| build a forecast-shaped dataset | `makeData()` turns each scene into a forecast-shaped object; `DATA`, `CATS`. |
| `snap()` | Returns everything needed to render one moment for one city. |
| sun / moon on its wave | `arcGeom`, `dayEdges`, `wave`, `drawArc`, `placeOrb`. |
| hourly curve | `drawHourly`. |
| guide lines | `placeGuides`. |
| globe | projection setup, `LIFT`, `subsolarAt`, `sizeGlobe`, `drawGlobe`. |
| drag to pick a city | `drag` state, `nearestCity`, `drawMarkers`, pointer handlers, `endDrag`. |
| `rotateTo` | Animated globe rotation to a city. |
| weather effects | particle canvas: `sizeFx`, `MAKERS`, `fxFor`, drawing helpers, `setFx`. |
| city photo | `setPhoto` (two-layer crossfade). |
| render | `render()`, `go()`. |
| Change City picker | list building, keyboard handling, open/close. |
| boot | `setScale`, resize handler, first render. |

---

## 4. Visual design spec

### Colour tokens (`:root`)

| Token | Value | Used for |
|---|---|---|
| `--bg` | `#181818` | Page and panel background. |
| `--ink` | `#ffffff` | Primary text. |
| `--ink-2` | `rgba(255,255,255,.72)` | Stat labels, chart temps. |
| `--ink-3` | `rgba(255,255,255,.52)` | Secondary text (date, "High", time labels). |
| `--line` | `rgba(255,255,255,.14)` | Stats top and bottom rules. |
| `--frame` | `rgba(255,255,255,.26)` | Hatch strip borders. Measured from the mockup (gray 85 on 24). |
| `--guide` | `rgba(255,255,255,.125)` | Guide lines outside the frame (gray 53 on 24). |
| `--glow` | per scene | Tints the soft glow around the sun. Animated via `@property`. |
| `--orb-x` | % | Horizontal centre of the glow, follows the orb. |

The page is dark only. The light/dark media queries just repeat the dark values.

### Type

- UI font: **Google Sans Flex** (variable, loaded with `opsz,wdth,wght`), fallback Google Sans, Helvetica Neue, Arial.
- Big temperature: **Archivo** at `font-stretch: 125%`, weight 800, `letter-spacing: -.045em`, `line-height: .82`. The degree sign is a separate span at `.74em`, weight 500.
- All numbers use `font-variant-numeric: tabular-nums`.
- Wind uses a narrow no-break space (`\u202F`) between number and unit so "12 km/h" doesn't look gappy.

Sizes at full scale (they shrink with the height scale, see section 8):

| Element | Size | Weight |
|---|---|---|
| City name | 32px | 700 |
| Change City pill text | 16px | 500 (pill is 38px tall) |
| Date/time | 18px | 400, `--ink-3` |
| Temperature | 166px | 800 (Archivo) |
| Condition | 28px | 600 |
| High/Low | 17px | values 600 white |
| Stat values | 27px | 600 |
| Stat labels | 17px | `--ink-2` |
| "Next 10 hours" and "Local time, GST" | 17px | `--ink-3` |
| Chart temps | 14px | 500 |
| Chart times | 13px | "Now" is white 14px |
| Sunrise/sunset time | 16px | 600 white |
| "Sunrise"/"Sunset" | 15px | `--ink-3` |

### Layout

- **Panel width:** `--panel: min(100vw, clamp(720px, 60vw, 1040px))`. At 1600px wide that's 960px, as in the mockup.
- **Two column widths inside the panel:**
  - `--pad-in: clamp(20px, 7vw, 67px)`: header and sun curve. 67px at full size.
  - `--pad-out: clamp(12px, 3.2vw, 30px)`: stats row and hourly chart, deliberately wider than the header. 30px at full size.
- **Blueprint frame:** hatched strips 37px wide on both sides of the panel (`.frame::before/::after`). The hatch is an inline SVG pattern (12×12 tile, one diagonal line, stroke opacity .075), with 1px `--frame` borders on both edges of each strip.
- **Guide lines:** 1px horizontals in the grey margins outside the hatch strips. Each one continues a real line in the design:
  - Left and right: the sun's horizon line.
  - Left and right: the stats top rule and the stats bottom rule.
  - Left only: the height of the chart's first point. Right only: the height of the chart's last point.

  `placeGuides()` positions them by measuring elements, so they follow the layout.
- Hatch and guides hide below 860px width.

### Photo treatment

The city photo sits behind the header, stats and chart (`.photo`, `top: -30px`, `bottom: -40px`). It is:

- darkened and desaturated: `filter: brightness(.38) saturate(.3) contrast(1.08)`
- tinted cool by a gradient overlay (`.photo::after`)
- faded out at top and bottom with a mask: transparent 0%, solid 26–56%, transparent 94%.

Each scene has an `object-position` (`pos`) to frame the landmark.

---

## 5. Components in detail

### 5.1 Sun curve (`.track`, `svg#arc`, `#orb`)

The curve is one smooth wave covering a full 24-hour day, left to right. The part above the horizon is the daytime arc; the part below is night.

**Geometry** (`arcGeom()`):

- Track height: `min(19vw, 230px × s)`, top margin `16px × s`.
- `x0` and `x1`: the ends of the curve. They are `--pad-in + width of the time label + 5px` from each edge, so the curve ends just past "06:12" and "18:08".
- `yh = 0.757 × height`: the horizon line.
- `up = 0.27 × height`: how far the arc rises above the horizon at solar noon.
- `down = 0.2 × height`: how far the curve dips below the horizon at midnight.

**The wave function** (`wave(g, e)`), where `e` has `rise` and `set` in local hours:

- `noon = (rise + set) / 2`.
- `c0 = cos(2π (rise − noon) / 24)`, clamped to ±0.98. This is the curve value at sunrise and sunset.
- For hour `h`: `c = cos(2π (h − noon) / 24)`, `u = (c − c0) / (1 − c0)`. So `u` is 1 at noon, 0 at sunrise and sunset, and negative at night.
- Above the horizon: `y = yh − up × u`.
- Below the horizon: `x = −u / m` where `m = (1 + c0) / (1 − c0)`, `a = min(2, up × m / down)`, and `y = yh + down × (a x + (1 − a) x²)`.

  This quadratic makes the slope at the horizon match the day side exactly, so the line does not kink. It still slopes gently all the way to the edges.
- `x = x0 + (h / 24) × (x1 − x0)`.

**Drawing** (`drawArc(state)`): samples the wave every 0.1 hours and draws it with `d3.curveCatmullRom`. The same path is drawn twice:

- `#dayPath`: bright stroke, clipped to above the horizon.
- `#nightPath`: dim stroke, clipped to below.

`#dayFill` fills between the arc and the horizon with a white gradient (opacity .16 to 0). The horizon line extends 13px past both curve ends.

**The orb** is a 102px disc (`--orb: clamp(44px, min(7vw, 102px × s), 102px)`). It is placed on the curve at the scene's local hour. The hour is clamped so the disc never runs off the ends; the x position is never nudged off the line. Its look is set by data attributes:

- `data-kind`: `sun` or `moon`. The moon is a masked crescent.
- `data-phase`: `day`, `golden` (within 1.1h of sunrise or sunset) or `night`.
- `data-tone`: `cold` for snow and winter scenes (paler sun).
- `data-cloud`: shows the SVG cloud in front of the orb when the weather code is 2 or higher.
- `data-dim`: dims the orb at code 3 or higher.
- `data-storm`: shows the lightning bolt on the cloud.

The cloud's colour changes with the weather.

**Animation along the curve** (`placeOrb`): when you change city, a D3 transition (1600ms, cubic in-out) tweens three numbers together: the hour, sunrise and sunset. Every frame it redraws the whole curve and puts the orb on it, so the orb rides the line while the line reshapes. If the change goes from day to night or back, the sun/moon swap happens halfway through. The orb's CSS has no transform transition on purpose, because the motion is driven frame by frame.

**Sunrise and sunset labels** (`.tick.left`, `.tick.right`): the time in bold with "Sunrise"/"Sunset" underneath. Each label block is vertically centred on the end of its curve, so the curve end sits between the time and the word. Polar day and polar night have text for "All day / Sun up" and "No sun / Polar night", although no current scene uses them.

### 5.2 Header (`.head`)

- `h1`: a location-arrow SVG plus the city name.
- `#changeBtn`: the pill that opens the city picker.
- `.when`: day and time (`Sunday, 12:05`). There is also a "Forecast" chip (`#fcChip`), unused now because sample data is always "now".
- `.lockup`: the temperature and the condition/high/low block, aligned to the bottom.

### 5.3 Stats (`dl#stats`)

A 4-column grid with rules top and bottom, spanning the wider `--pad-out` column. Each cell uses `flex-direction: column-reverse`, so the `<dt>` label shows under the `<dd>` value while the markup stays semantic. It becomes 2 columns under 600px.

### 5.4 Hourly chart (`svg#hourly`)

Six points: now, +2, +4, +6, +8 and +10 hours, drawn with D3.

- The chart width is the container width. Height is `124 × k`, where `k = max(.72, s)`.
- The temperature range maps to y between 77k (lowest) and 38k (highest). If the spread is under 2°, the scale is widened so the line isn't exaggerated.
- `d3.curveMonotoneX` for the line and the area.
- The area uses a dark fade (`#0c0c0c`, opacity .38 to 0), not white, so it darkens the photo under the line like the mockup.
- The first point is a bigger filled white dot with a dashed line down to "Now". The first temp label is left-aligned and the last point's labels are right-aligned.
- Right-hand header text: `Local time, <abbr>`.
- `hourlyEnds` stores the first and last point heights so the guides can line up with them.

### 5.5 Globe (`canvas#globe`)

The globe is drawn live on a canvas with D3's orthographic projection. It is not an image.

- **Size** (`sizeGlobe`): radius `R = 0.517 × panel width` (0.62 under 640px). The visible cap is `0.54 R`. On screens 600px and wider, the globe takes exactly the height left under the chart; if that is too small, `R` shrinks so the whole cap and the pin stay visible. The canvas is 110px taller than the visible area (`HEAD`) so the halo can fade out instead of being cut. It supports device pixel ratio up to 3.
- **Layers, drawn every frame:**
  1. blue halo (shadow blur 50)
  2. ocean radial gradient, lit from the upper left
  3. graticule at 6% white
  4. land gradient greens
  5. rim shading
  6. night side: 13 stacked translucent circles centred on the anti-solar point, which gives a soft terminator. The sun position comes from `subsolarAt(date)` for the scene's date and time.
  7. rim stroke
  8. city markers
- **Rotation:** `target(city) = [−lon, −(lat − LIFT), 0]` with `LIFT = 33°`, which puts the city a third of the way down the visible cap, where the mockup has the pin. `rotateTo()` animates to it (1500ms, cubic in-out) along the shortest longitude direction, then re-triggers the pin drop and ripple CSS animation.
- **Pin:** an HTML element positioned from `projection([lon, lat])` each frame. It is hidden when the city is on the far side or while dragging.

### 5.6 Drag to pick a city

- The canvas takes pointer events (`touch-action: none`), but only on the sphere: `onSphere()` checks the distance from the centre is at most R.
- Dragging maps pixels to degrees at the surface (`180 / (π R)`). Horizontal drag changes longitude; vertical drag changes latitude, clamped to ±85°.
- While dragging, `drawMarkers()` draws every visible city as a dot and highlights the one closest to the "focus point" (`[−rot[0], −rot[1] + LIFT]`, the spot a selected city sits on). The highlight is a bigger dot plus a label pill with the name and temperature.
- **On release:**
  - If you dragged, the page goes to the highlighted city.
  - If you tapped without dragging, it picks the dot within 16px, or turns back to the current city if you tapped empty ocean.
  - If you dragged back to the same city, it just settles.
- A hint pill ("Drag the globe to pick a city") shows on hover over the sphere until the first drag.

### 5.7 Change City picker (Spotlight style)

Clicking the "Change City" pill (or pressing Ctrl+K / Cmd+K) turns the pill into a macOS Spotlight-style search panel.

- **Markup:** `#scrim` and `#picker` live at the end of `<body>`, outside the panel, so they are `position: fixed` over everything and not clipped by the panel's `overflow: hidden`.
- **Backdrop:** `#scrim` covers the page with `backdrop-filter: blur(18px)` and a dark tint, fading in over 380ms. Clicking it closes the picker.
- **Morph:** `openPicker()` measures the pill (`pillBox()`) and the panel's final box, then runs a Web Animations API animation on `left`, `top`, `width`, `height`, `border-radius` and background from the pill to the panel (460ms, `cubic-bezier(.2,.9,.25,1)`). The real pill is hidden (`.hidden-for-morph`) while open, so it looks like the pill itself grew. The panel's content is hidden instantly and fades in after 200ms. `closePicker()` runs the same animation in reverse (360ms) back to the pill's current position, then shows the pill again.
- **Panel:** 680px wide (full width minus 32px on phones), 18vh from the top (12px on phones), frosted glass (`rgba(40,40,42,.72)`, `blur(40px) saturate(1.6)`), 22px radius, big shadow. The search row is 64px tall with a 22px icon, a 24px input and an "esc" key hint.
- **Results:** under a "Popular cities" heading, each city row has a 36px photo thumbnail, the name, the country underneath and the temperature on the right. The highlighted row is macOS blue (`#0a84ff`). It opens with the current city highlighted. There is no footer.
- **Keyboard:** typing filters by city or country name, Up/Down move the highlight (wrapping around), Enter picks, Escape closes and returns focus to the pill, Tab is held inside the search field. Hovering a row highlights it. The input is a `role="combobox"` with `aria-activedescendant` pointing at the highlighted `role="option"` row.
- **Picking a city** closes the panel first, then calls `go()`.
- **Reduced motion:** no morph; the panel and blur appear and disappear instantly.
- Global keyboard shortcut: Left and Right arrows step through weather kinds when the picker is closed and no input has focus.

### 5.8 Weather effects (`canvas#fx`)

One particle canvas covering the panel. It sits **above** the content at `z-index: 4` with `mix-blend-mode: screen`. Screen blending means particles lighten what's under them, so they merge into the photo like real light, and they disappear over white text instead of covering it. The canvas fades out towards the bottom with a mask.

`fxFor(snapshot, kind)` picks the mode and particle count. Precipitation codes win over seasons:

| Condition | Mode | Count |
|---|---|---|
| Codes 95, 96, 99 | `storm` | 180, plus lightning bolts every 3.5–8s and a screen flash |
| Snow codes | `snow` | 71:45, 73:90, 75:160, 77:40, 85:70, 86:140 |
| Rain and drizzle codes | `rain` | from 45 (light drizzle) to 240 (heavy showers) |
| Kind `winter` | `winter` | 55 twinkling ice glints |
| Kind `autumn` | `autumn` | 26 falling leaves |
| Kind `spring` | `spring` | 40 falling petals |
| Code 2 or 3 | `cloudy` | 5 or 9 soft drifting cloud puffs |
| Clear by day | `sunny` | 16 floating dust motes |
| Clear at night | `clear` | 90 twinkling stars in the top half |

Depth: rain, storm, snow, leaves and petals give each particle a `z` between about 0.35 and 1, which scales size, speed and opacity. Rain draws in three depth bands with different opacity and line width.

`setFx` does nothing if the mode and count haven't changed. It is skipped entirely under `prefers-reduced-motion`.

### 5.9 Atmosphere

- `.sky`: a soft radial glow at the top, centred on the orb (`--orb-x`) and tinted with `--glow` at 18%. It transitions with the orb.
- `#flash`: the lightning flash, animated with the Web Animations API from `strike()`.

---

## 6. Data model

### 6.1 A scene (entry in `SCENES`)

```js
{
  kind: 'sunny',            // one of: sunny, clear, cloudy, rain, storm, snow, winter, autumn, spring
  name: 'Dubai',
  country: 'United Arab Emirates',   // shown under the name in Change City
  lat: 25.20, lon: 55.27,
  tz: 'Asia/Dubai',         // IANA zone (informational)
  off: 14400,               // UTC offset in seconds
  abbr: 'GST',              // shown as "Local time, GST"
  time: '12:05',            // the frozen local time of this scene
  temp: 38, feels: 41, hi: 40, lo: 30,   // °C
  wind: 12,                 // km/h
  hum: 38,                  // %
  pop: 0,                   // precipitation probability %
  code: 0,                  // WMO weather code, drives label and effects
  rise: '06:12', set: '18:08',
  trend: [38, 39, 39, 38, 36, 33],       // optional: exact chart values at now, +2 … +10h
  label: 'Crisp and breezy',             // optional: overrides the WMO label
  photoKey: 'dubai',        // key into PHOTOS
  pos: '100% 60%',          // object-position for the photo
  photo: { who: 'Phil6007', lic: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:…' }
}
```

All scenes are dated Sunday 27 September 2026 (`DAY0`). The date matters for the globe's night side.

### 6.2 The nine scenes

| Kind | City | Local time | Temp | Code | Notes |
|---|---|---|---|---|---|
| sunny | Dubai | 12:05 | 38° | 0 | Matches the mockup exactly, including the chart trend. |
| clear | Miami | 23:40 | 26° | 0 | Night, moon, stars. |
| cloudy | Bangkok | 15:20 | 31° | 3 | |
| rain | London | 09:30 | 14° | 63 | |
| storm | Singapore | 16:10 | 27° | 95 | |
| snow | Ushuaia | 13:15 | 1° | 73 | |
| winter | McMurdo Station | 11:30 | −26° | 1 | Label "Bitter cold, clear sky". |
| autumn | Montréal | 16:45 | 12° | 2 | Label "Crisp and breezy". |
| spring | Melbourne | 10:20 | 18° | 1 | Label "Mild and bright". |

### 6.3 `makeData(scene)`: forecast-shaped data

Each scene is expanded into the same shape as an Open-Meteo forecast response. This is why the rest of the code reads like it handles live data, and why switching back to a live API is not much work (section 13).

```js
{
  tz, off, abbr,
  cur: { time: '2026-09-27T12:05', temperature_2m, apparent_temperature, relative_humidity_2m,
         weather_code, wind_speed_10m, is_day, cloud_cover },
  h:   { time: [...72 hourly strings], temperature_2m: [...], apparent_temperature: [...],
         relative_humidity_2m, weather_code, wind_speed_10m, precipitation_probability, is_day, cloud_cover },
  d:   { time: [3 dates], temperature_2m_max, temperature_2m_min, sunrise, sunset, daylight_duration },
  i0:  12   // hourly index of "now"
}
```

- Hourly temperature is a daily cosine between `lo` and `hi`, peaking at 15:00. Near "now" it is shifted so it matches `temp`, fading back to the plain curve over about 18 hours. If `trend` is given, its values override the chart points exactly.
- `is_day` per hour comes from `rise` and `set`.
- Feels like follows temperature with a fixed offset.

### 6.4 `snap(ci, idx)`: one renderable moment

`idx === null` means "now". It returns:

```js
{ ci, idx, forecast, L /* parsed local time */, at /* real Date instant */, base /* hourly index */,
  temp, feels, hum, wind, code, isDay, cloud, pop, hi, lo, rise, set, daylight }
```

Everything that renders reads from a snapshot, never from `DATA` directly.

### 6.5 Weather codes

WMO codes, as used by Open-Meteo. `wmo(code, isDay)` gives the label: 0 is "Sunny" by day and "Clear night" at night, 1 "Mostly sunny"/"Mostly clear", 2 "Partly cloudy", 3 "Overcast", 45/48 fog, 51–57 drizzle, 61–67 rain, 71–77 snow, 80–82 showers, 85/86 snow showers, 95–99 thunderstorms.

Code groups:

- `STORM = [95, 96, 99]`
- `SNOW = [71, 73, 75, 77, 85, 86]`
- `RAIN = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82]`

### 6.6 `GLOW`

For each kind, three colours for `day`, `golden` and `night` phases. They tint the top glow.

---

## 7. State and render flow

Global state:

- `view = { ci, idx }`: which city, and "now" (`idx: null`).
- Units are Celsius and km/h only. `deg()` rounds; `windText()` formats km/h. The °F option was removed on request.
- `rot`: the globe rotation `[λ, φ, γ]`.
- `orbState = { h, rise, set }`: where the orb currently is, so the next animation starts from there.
- `S`: the vertical scale.

`go({ ci, idx })` is the only way to change city. Everything uses it: the picker, globe drag, globe tap and the arrow keys. It:

1. sets `view`
2. adds `body.swapping`, which fades `.swap` elements to 30%
3. after 180ms, calls `render(true)` and removes `swapping`
4. starts `rotateTo(city, 1500)` if the city changed.

`render(animate)`:

1. Sets the city name and document title, and calls `setPhoto()` (crossfades to the new photo once it has loaded).
2. Fills in the day/time, condition, high/low, stats and unit buttons.
3. Counts the temperature up or down over 900ms with a D3 tween.
4. Calls `placeOrb()` (the orb rides the curve if `animate` is true), then `drawHourly()`, `setFx()` and `drawGlobe()`.
5. Calls `placeGuides()` on the next frame.

Resize runs `setScale`, `render(false)`, `sizeFx`, `sizeGlobe` and `placeGuides`, debounced by 80ms.

---

## 8. One-screen scaling

Requirement: no scrolling on desktop and laptop.

- `.frame` is `height: 100dvh` with `min-height: 540px`. The panel is a flex column.
- `setScale()` sets `S = clamp(innerHeight / 1200, 0.56, 1)` on screens 600px and wider (1 on phones). It writes two CSS variables:
  - `--s = S`: used for spacing, the track, the orb and the temperature.
  - `--sf = max(S, .8)`: used for text, so small text never shrinks below 80%.
- Many sizes are `calc(Npx * var(--s))`, often inside `min()` with a vw value and a `clamp()` floor.
- The globe takes whatever height is left (section 5.5).
- Under 600px the frame height is `auto`, so the page scrolls slightly (about one swipe on a 390×844 phone). The stats go 2 columns and the lockup stacks.

Tested with no scroll at 1600×1200, 1440×900, 1366×768, 1280×720 and 1024×768.

---

## 9. Motion summary

| What | How | Duration |
|---|---|---|
| Orb and curve change | D3 tween of hour, sunrise and sunset; redraws every frame | 1600ms cubic in-out |
| Globe turn | D3 tween of rotation | 1500ms, or 700ms to settle |
| Pin drop and ripple | CSS keyframes, re-triggered after the turn | 0.7s, ripple 1.6s ×2 |
| Temperature number | D3 tween of text | 900ms cubic out |
| Content fade on switch | `.swap` opacity | 250ms |
| Photo crossfade | two `<img>` layers, opacity | 700ms |
| Glow colour and position | `@property` transitions | 1.2s |
| Particles | `requestAnimationFrame` loop | continuous |

`prefers-reduced-motion: reduce` disables CSS animations and transitions, skips the tweens (jumps straight to the end state) and turns off particles.

---

## 10. Accessibility

- `main.stage` has `aria-live="polite"`, so city changes are announced.
- Decorative layers (sky, fx, arc, orb, photo, globe) are `aria-hidden`.
- The Change City button has `aria-haspopup="dialog"`, `aria-expanded` and `aria-controls`. The picker is `role="dialog"`. The current city has `aria-current`.
- A visible focus ring (2px white outline) on buttons, inputs and links.
- The globe drag is pointer-only. Keyboard users switch cities with the picker or the arrow keys.

---

## 11. Dependencies and hosting notes

- D3 7.8.5 UMD from `cdnjs.cloudflare.com`, and topojson-client 3.1.0 from `cdn.jsdelivr.net`.
- Google Fonts: Archivo and Google Sans Flex.
- No framework, no bundler.
- Canvas `roundRect` is used for the drag label, with a `rect` fallback.
- If you host it somewhere with a strict Content-Security-Policy, allow those two script hosts and `fonts.googleapis.com` / `fonts.gstatic.com`. Images are `data:` URIs.

### Photo credits (all from Wikimedia Commons)

| City | Photographer | Licence |
|---|---|---|
| Dubai | Phil6007 | CC BY-SA 4.0 |
| Miami | Wilfredor | CC0 |
| Bangkok | Diliff | CC BY-SA 3.0 |
| London | Dietmar Rabich | CC BY-SA 4.0 |
| Singapore | Benh LIEU SONG | CC BY-SA 4.0 |
| Ushuaia | benito roveran | CC BY 2.0 |
| McMurdo Station | owamux | CC BY 2.0 |
| Montréal | Jiaqian AirplaneFan | CC BY 3.0 |
| Melbourne | Donaldytong | CC BY-SA 3.0 |

The credits were removed from the UI on request and are kept in an HTML comment at the top of the file. CC BY and CC BY-SA licences require visible credit when the page is shared publicly, so if it goes public, add the credits back somewhere visible (for example a small info page or a tooltip), or swap in photos you own or CC0 photos.

---

## 12. Decisions you should not undo

These came from specific feedback. Changing them brings back problems that were already fixed.

1. **Guide lines are measured, not calculated from `100vw`.** `placeGuides()` uses the panel's `getBoundingClientRect()`. An earlier version used `calc((100vw − panel) / 2 − hatch)`, and the lines ran into the hatch strip by half the scrollbar width.
2. **The hatch is an SVG pattern, not a CSS gradient.** The gradient version looked jagged and uneven.
3. **Both sides get a horizon guide line.** It was missing on the right once, and that was reported.
4. **No kink where the curve crosses the horizon.** The night half uses the quadratic in section 5.1. Don't go back to separate linear scaling for above and below, which made a visible corner.
5. **The orb must stay on the line.** Clamp the hour, never clamp the x position. Animate by tweening the hour, not by a CSS transform transition, which makes the orb cut straight across instead of following the curve.
6. **The top section matches a reference screenshot the user supplied.** That means a gentle wave (`up .27h`, `down .2h`), a visible day fill (opacity .16), the horizon running 13px past the curve ends, and the labels centred on the curve ends. The user rejected a taller wave.
7. **No weather tab bar.** It was removed on request; cities come from Change City and the globe. Units are Celsius only.
8. **Sample data, not live data.** Live data (Open-Meteo) was built once and then removed on request. Don't add network fetches without being asked.
9. **Everything fits in one screen on desktop.** Keep new vertical elements inside the `--s` scaling, or they will bring back scrolling.
10. **Effects sit above the content with `mix-blend-mode: screen`.** Below the photo they were hidden. Normal blending on top would cover the text.
11. **Spacing the user asked for:** a 64×s gap between the sunrise/sunset labels and the city row, and a small 16×s top margin above the sun. Both were explicit requests.
12. **Change City is a Spotlight-style panel that grows out of the pill, with the page blurred behind it.** Keep the picker outside the panel in the DOM, or the fixed positioning and blur break.
13. **Celsius only, no footer in Change City.** The °F toggle, photo credits and "Sample weather data" line were removed from the picker on request.

---

## 13. Known leftovers and suggested cleanup

These are safe to fix:

- **Dead code from the live-data version:** `kindOf()`, `liveLocal()`, the `CATS[k].next` field, the `.fcChip` "Forecast" chip, `.loading` and `.status` CSS, and comments that still mention Open-Meteo. `CATS` is still used by the arrow-key handler.
- **Unused CSS** for the removed tab bar: `.bar`, `.scenes` and `.soon`. `.unit` styles are still used, but they are written together with `.scenes`, so split them before deleting.
- **The file is 2.5 MB** because of the base64 photos. Moving the photos to separate files (for example `photos/dubai.jpg`) and `WORLD` to `world.json` would make the HTML easier to edit. It would also mean serving from a local server instead of opening the file directly.
- **`TZ_ABBR` and `tzAbbr()`** are more than sample data needs, since each scene has `abbr`. Keep them if you add live data again.
- **Mobile** scrolls slightly. Fitting it would need a denser phone layout, for example stats in one row of four with smaller text.

---

## 14. How to do common tasks

### Add or change a city

1. Add an object to `SCENES` with every field in section 6.1. Pick a WMO `code` that matches `kind`, or the effect and label won't agree.
2. Add its photo as a new key in `PHOTOS` (a base64 JPEG, about 1500–1600px wide, quality around 70–75), or point `c.photo.src` at a URL after you split photos out.
3. Set `pos` so the landmark is framed well behind the text.
4. Put the photographer and licence in `photo`.

The picker, globe markers and drag pick it up automatically.

### Change what an effect looks like

Edit `MAKERS[mode]` to change the particle properties, and the matching branch inside `setFx`'s `tick()` to change the drawing. Counts per weather code are in `fxFor()`.

### Change the curve shape

`arcGeom()` has `yh`, `up` and `down` as fractions of the track height. The track size is in the `.track` CSS. Keep the quadratic below-horizon formula.

### Switch back to live data

The code is already shaped for Open-Meteo:

1. Replace `DATA = SCENES.map(makeData)` with a fetch of `https://api.open-meteo.com/v1/forecast` with multiple comma-separated latitudes and longitudes. Use `current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day,cloud_cover`, `hourly=` the same fields plus `precipitation_probability`, `daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,daylight_duration`, `timezone=auto` and `forecast_days=3`.
2. Normalise each response to `{ tz, off, abbr, cur, h, d, i0 }`. `i0` is the index of `current.time` rounded down to the hour.
3. In `snap()`, use `liveLocal(D)` for "now" instead of `parseLocal(D.cur.time)`.
4. Give each city a `kind` from `kindOf()`, and add a loading state and an error state with a retry button.

Note the user chose sample data because live data didn't load in their environment. Check where it will run before switching.

### Put the tabs back

Don't, unless asked. If asked: the old version had a pill row of `KINDS` at the top of the panel. It needs space above the sun, so add it inside the `--s` scaling.

---

## 15. Test checklist

Run through this after any change:

- [ ] At 1600×1200 with Dubai, the page matches `Weather_Widget.png`: sun at the curve peak, 38°, stats, chart values 38/39/39/38/36/33, "Local time, GST".
- [ ] There is a guide line on **both** sides at the horizon height. Every guide line stops exactly at the hatch border, including when a scrollbar is showing.
- [ ] The curve has no corner at the horizon, and the orb sits on the line in every scene, including Miami at 23:40 near the right end.
- [ ] Switching city: the orb travels along the curve, the curve reshapes, and sun/moon swap halfway through when day changes to night.
- [ ] Sunrise and sunset times update per city and sit centred on the curve ends.
- [ ] All nine scenes show the right effect, and the particles blend over the photo without hiding the text.
- [ ] No vertical scroll at 1600×1200, 1440×900, 1366×768, 1280×720 and 1024×768, and the pin is visible in each.
- [ ] Globe: drag spins it, the nearest city is labelled, release selects it, tapping a dot selects it, tapping ocean settles back. Works with touch.
- [ ] Change City: the pill grows into the Spotlight panel and shrinks back into the pill on close, the background blurs, search filters, arrow keys and Enter work, Escape and clicking the blurred background close it, Ctrl/Cmd+K toggles it, each row shows the country under the city, and there is no footer.
- [ ] With reduced motion on, nothing animates and every state is still correct.
- [ ] No console errors.
