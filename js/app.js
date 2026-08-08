// app.js — search UI, data fetching (Xeno-canto API with offline fallback),
// audio playback, and a simple live frequency visualization.

const statusEl = document.getElementById('status');
const panelContent = document.getElementById('panel-content');
const audioPlayer = document.getElementById('audio-player');
const canvas = document.getElementById('viz-canvas');
const canvasCtx = canvas.getContext('2d');

let audioCtx, analyser, sourceNode, rafId;

async function fetchXenoCanto(species, country) {
  const parts = [];
  if (species) parts.push(species.trim());
  if (country) parts.push(`cnt:"${country.trim()}"`);
  const query = encodeURIComponent(parts.join(' ') || 'gen:Turdus');
  const url = `https://xeno-canto.org/api/2/recordings?query=${query}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Xeno-canto API error: ${res.status}`);
  const data = await res.json();
  return (data.recordings || []).slice(0, 150);
}

async function loadFallback() {
  const res = await fetch('data/sample-recordings.json');
  const data = await res.json();
  return data.recordings || [];
}

async function search(species, country) {
  statusEl.textContent = 'Searching…';
  try {
    let recordings = await fetchXenoCanto(species, country);
    if (!recordings.length) {
      statusEl.textContent = 'No results, showing sample data.';
      recordings = await loadFallback();
    } else {
      statusEl.textContent = `${recordings.length} recordings found.`;
    }
    const count = window.renderRecordings(recordings);
    if (!count) statusEl.textContent = 'No geolocated recordings to plot.';
  } catch (err) {
    console.error(err);
    statusEl.textContent = 'API unreachable, showing sample data.';
    const recordings = await loadFallback();
    window.renderRecordings(recordings);
  }
}

function stopVisualization() {
  if (rafId) cancelAnimationFrame(rafId);
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
}

function startVisualization() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    sourceNode = audioCtx.createMediaElementSource(audioPlayer);
    sourceNode.connect(analyser);
    analyser.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    rafId = requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);
    canvasCtx.fillStyle = '#0e1322';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    const barWidth = canvas.width / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height;
      canvasCtx.fillStyle = `hsl(${140 + i}, 80%, 55%)`;
      canvasCtx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
      x += barWidth;
    }
  }
  draw();
}

function fileUrl(rec) {
  if (rec.file && rec.file.startsWith('http')) return rec.file;
  if (rec.file) return `https:${rec.file}`;
  return null;
}

window.onBirdPointClick = function (point) {
  const rec = point.raw;
  const name = rec.en || `${rec.gen || ''} ${rec.sp || ''}`.trim() || 'Unknown species';
  const url = fileUrl(rec);

  panelContent.innerHTML = `
    <div class="field"><b>Species</b>${name}</div>
    <div class="field"><b>Scientific</b><i>${rec.gen || ''} ${rec.sp || ''}</i></div>
    <div class="field"><b>Type</b>${rec.type || 'n/a'}</div>
    <div class="field"><b>Location</b>${rec.loc || ''}, ${rec.cnt || ''}</div>
    <div class="field"><b>Recordist</b>${rec.rec || 'unknown'}</div>
    <div class="field"><b>Quality</b>${rec.q || 'n/a'}</div>
    <div class="field"><b>License</b>${rec.lic ? `<a href="${rec.lic}" target="_blank" style="color:#9fb3ff">link</a>` : 'n/a'}</div>
  `;

  if (url) {
    audioPlayer.src = url;
    audioPlayer.play().then(startVisualization).catch(() => {});
  } else {
    stopVisualization();
  }
};

document.getElementById('search-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const species = document.getElementById('species-input').value;
  const country = document.getElementById('country-input').value;
  search(species, country);
});

window.renderLegend();
loadFallback().then(recordings => {
  window.renderRecordings(recordings);
  statusEl.textContent = `${recordings.length} sample recordings loaded.`;
});
