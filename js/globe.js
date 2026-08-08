// globe.js — sets up the 3D globe and renders bird recording points.

const TYPE_COLORS = {
  song: '#3ddc84',
  call: '#3a9bfd',
  alarm: '#ff5c5c',
  'flight call': '#ffd23d',
  duet: '#c77dff',
  subsong: '#5ee7c8',
  other: '#9aa4bd'
};

function colorForType(rawType) {
  if (!rawType) return TYPE_COLORS.other;
  const t = rawType.toLowerCase();
  for (const key of Object.keys(TYPE_COLORS)) {
    if (t.includes(key)) return TYPE_COLORS[key];
  }
  return TYPE_COLORS.other;
}

function qualityToAltitude(q) {
  const map = { A: 0.32, B: 0.24, C: 0.17, D: 0.1, E: 0.05 };
  return map[q] || 0.08;
}

function qualityToRadius(q) {
  const map = { A: 0.55, B: 0.45, C: 0.38, D: 0.3, E: 0.25 };
  return map[q] || 0.28;
}

const world = Globe()(document.getElementById('globeViz'))
  .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-night.jpg')
  .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
  .backgroundColor('#05070d')
  .pointAltitude(d => d.altitude)
  .pointRadius(d => d.radius)
  .pointColor(d => d.color)
  .pointLabel(d => d.label)
  .pointsMerge(false)
  .onPointClick(d => window.onBirdPointClick && window.onBirdPointClick(d));

world.controls().autoRotate = true;
world.controls().autoRotateSpeed = 0.35;

function recordingToPoint(rec) {
  const lat = parseFloat(rec.lat);
  const lng = parseFloat(rec.lng);
  const type = rec.type || 'other';
  const name = rec.en || `${rec.gen || ''} ${rec.sp || ''}`.trim() || 'Unknown species';
  return {
    lat, lng,
    altitude: qualityToAltitude(rec.q),
    radius: qualityToRadius(rec.q),
    color: colorForType(type),
    label: `<b>${name}</b><br/>${type} · ${rec.loc || rec.cnt || ''}`,
    raw: rec
  };
}

function renderRecordings(recordings) {
  const points = recordings
    .filter(r => r.lat && r.lng && !isNaN(parseFloat(r.lat)) && !isNaN(parseFloat(r.lng)))
    .map(recordingToPoint);

  world.pointsData(points);

  if (points.length) {
    world.pointOfView({ lat: points[0].lat, lng: points[0].lng, altitude: 1.8 }, 1500);
  }
  return points.length;
}

function renderLegend() {
  const list = document.getElementById('legend-list');
  list.innerHTML = '';
  Object.entries(TYPE_COLORS).forEach(([type, color]) => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="dot" style="background:${color}"></span>${type}`;
    list.appendChild(li);
  });
}

window.renderRecordings = renderRecordings;
window.renderLegend = renderLegend;
