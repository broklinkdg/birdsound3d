# BirdSound3D 🐦🌍

**BirdSound3D** is a browser-based app that plots real bird call recordings on an interactive **3D globe/map**. Each point represents a location where a bird was recorded — click a point to hear the recording and see details about the species, call type, and recording quality.

It uses live data from the [Xeno-canto](https://xeno-canto.org) API (the largest open database of wildlife sound recordings), rendered in 3D with [globe.gl](https://github.com/vasturiano/globe.gl) (built on Three.js).

## Features

- 🌐 **Interactive 3D globe** — pan, zoom, and rotate to explore recordings anywhere on Earth
- 🔊 **Click-to-play audio** — every point plays the actual field recording of that bird
- 🎨 **Color-coded by call type** — song, call, alarm, flight call, etc.
- 📏 **Altitude encodes recording quality** — higher points = higher-quality (community-rated) recordings
- 🔍 **Live search** — search by species name and/or country, powered directly by the Xeno-canto API
- 📊 **Waveform-style spectrogram preview** — quick visual of the selected clip using the Web Audio API
- 📦 **Zero build step** — plain HTML/CSS/JS, runs from any static file server

## Quick start

```bash
git clone https://github.com/broklinkdg/birdsound3d.git
cd birdsound3d
# any static server works, e.g.:
npx http-server .
# then open http://localhost:8080
```

> A static server is required (not `file://`) because the app fetches JSON/audio and uses the Web Audio API, both of which need an http(s) origin.

## How it works

1. **Search** — enter a species (e.g. `Common Blackbird`) and/or a country (e.g. `Portugal`) and hit *Search*. The app queries `https://xeno-canto.org/api/2/recordings` client-side.
2. **Plot** — each recording with valid GPS coordinates becomes a point on the 3D globe (`js/globe.js`), colored by vocalization type and sized/raised by community quality rating.
3. **Listen** — clicking a point loads the recording into an `<audio>` element, draws a live frequency visualization on a `<canvas>`, and shows metadata (species, location, recordist, license) in the side panel.
4. **Offline fallback** — if the API is unreachable, `data/sample-recordings.json` provides a small curated dataset so the globe always has something to show.

## Project structure

```
birdsound3d/
├── index.html          # App shell / layout
├── css/style.css        # Styling (dark UI, side panel, globe canvas)
├── js/
│   ├── app.js            # Search UI, data fetching, audio playback, spectrogram
│   └── globe.js          # 3D globe setup & point rendering (globe.gl / three.js)
├── data/
│   └── sample-recordings.json  # Offline fallback dataset
├── LICENSE
└── README.md
```

## Data & attribution

Recordings and metadata are provided by [Xeno-canto](https://xeno-canto.org), used under their respective per-recording licenses (mostly Creative Commons). When you click a point, the app shows the recordist's name and license — please respect those terms if you reuse a clip.

## Tech stack

- [globe.gl](https://github.com/vasturiano/globe.gl) / [three.js](https://threejs.org) for the 3D globe
- Vanilla JS + Web Audio API for playback & spectrogram
- [Xeno-canto API v2](https://xeno-canto.org/explore/api) for bird recording data

## Possible extensions

- Cluster points by region at low zoom levels
- Filter by date range or season to visualize migration patterns
- Switch between "3D globe" and "flat map" (MapLibre) views
- Add a real spectrogram (FFT heatmap) instead of the waveform preview

## License

MIT — see [LICENSE](LICENSE). Bird recording data remains under Xeno-canto's original per-recording licenses.
