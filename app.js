const app = document.querySelector('#app');

app.innerHTML = `
  <header class="navbar">
    <a class="brand" href="#overview">RoadSentry <span>AI</span></a>
    <nav aria-label="Primary navigation">
      <ul class="nav-links">
        <li><a class="active" href="#overview">Overview</a></li>
        <li><a href="#workflow">Workflow</a></li>
        <li><a href="#map-section">Live Map</a></li>
        <li><a href="#insights">Insights</a></li>
      </ul>
    </nav>
  </header>
  <main>
    <section class="hero" id="overview">
      <div class="hero-content">
        <p class="subtitle">AI-POWERED ROAD INTELLIGENCE</p>
        <h1>Safer roads.<br>Smarter cities.</h1>
        <p class="tagline">Detect risk before it becomes an accident.</p>
        <p>RoadSentry AI turns road imagery and live reports into actionable safety insights for communities and city teams.</p>
      </div>
      <div class="hero-stat" aria-label="Current safety status"><strong>94%</strong><span>risk detection accuracy</span></div>
    </section>
    <section class="section" id="workflow">
      <h2 class="section-title">From road data to action</h2>
      <div class="workflow">
        <button class="stage" data-stage="Capture"><strong>01</strong><h3>Capture</h3><p>Collect imagery and reports from roads across the city.</p></button>
        <button class="stage" data-stage="Analyze"><strong>02</strong><h3>Analyze</h3><p>AI identifies potholes, cracks, hazards, and changing risk patterns.</p></button>
        <button class="stage" data-stage="Prioritize"><strong>03</strong><h3>Prioritize</h3><p>Rank incidents by severity so teams can respond faster.</p></button>
        <button class="stage" data-stage="Protect"><strong>04</strong><h3>Protect</h3><p>Use clear insights to prevent accidents and improve roads.</p></button>
      </div>
      <div class="workflow-detail" id="workflow-detail" aria-live="polite">Select a workflow stage to see how RoadSentry helps.</div>
    </section>
    <section class="section" id="map-section">
      <h2 class="section-title">Live risk map</h2>
      <div id="map" aria-label="Map showing reported road hazards"></div>
    </section>
    <section class="section" id="insights">
      <h2 class="section-title">Safety at a glance</h2>
      <div class="summary">
        <button class="card insight-card" data-insight="128 hazards detected this month from camera feeds and resident reports."><h3>128</h3><p>hazards detected this month</p></button>
        <button class="card insight-card" data-insight="Response teams reach reported hazards 37 minutes faster with prioritized alerts."><h3>37 min</h3><p>average response improvement</p></button>
        <button class="card insight-card" data-insight="12 high-risk zones are currently under active monitoring."><h3>12</h3><p>high-risk zones under watch</p></button>
      </div>
      <div class="insight-detail" id="insight-detail" aria-live="polite">Select a metric to view more detail.</div>
    </section>
  </main>
  <footer class="footer">RoadSentry AI · Building safer streets with better data.</footer>
`;

const navLinks = document.querySelectorAll('.nav-links a');
navLinks.forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    document.querySelector(link.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
    navLinks.forEach(item => item.classList.toggle('active', item === link));
  });
});

function initMap() {
  const mapElement = document.querySelector('#map');
  if (!mapElement || mapElement.dataset.initialized) return;
  mapElement.dataset.initialized = 'true';

  const hazards = [
    { lat: 51.505, lng: -0.09, risk: 'high', type: 'Pothole', location: 'Westminster Road' },
    { lat: 51.51, lng: -0.1, risk: 'medium', type: 'Road crack', location: 'Victoria Street' },
    { lat: 51.52, lng: -0.08, risk: 'low', type: 'Damaged sign', location: 'Park Lane' }
  ];
  const colors = { high: '#F04452', medium: '#F5B942', low: '#36B875' };

  mapElement.innerHTML = `
    <div class="map-search"><span>⌕</span><input id="map-search-input" type="search" placeholder="Search this map" aria-label="Search this map"><button id="map-search-button" type="button">Search</button></div>
    <div class="map-toolbar"><button class="map-filter active" data-risk="all">All</button><button class="map-filter" data-risk="high">High</button><button class="map-filter" data-risk="medium">Medium</button><button class="map-filter" data-risk="low">Low</button></div>
    <div class="map-details" id="map-details" aria-live="polite">Select a hazard marker for details.</div>
    <div id="real-map" aria-label="Interactive online road risk map"></div>
  `;

  if (!window.L) {
    mapElement.querySelector('#map-details').textContent = 'The online map library could not load. Check your internet connection.';
    return;
  }
  const map = L.map('real-map').setView([51.51, -0.09], 13);
  const tiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Tiles © Esri'
  }).addTo(map);
  const markerLayer = L.layerGroup().addTo(map);
  const markers = hazards.map(hazard => {
    const marker = L.circleMarker([hazard.lat, hazard.lng], { radius: 9, color: colors[hazard.risk], fillColor: colors[hazard.risk], fillOpacity: .85, weight: 3 });
    marker.bindPopup(`<strong>${hazard.type}</strong><br>Risk: ${hazard.risk}<br>${hazard.location}`);
    marker.addTo(markerLayer);
    marker.hazard = hazard;
    return marker;
  });

  const details = mapElement.querySelector('#map-details');
  tiles.on('tileerror', () => { details.textContent = 'Map tiles are temporarily unavailable. Check your internet connection and reload.'; });
  markers.forEach(marker => marker.on('click', () => { details.textContent = `${marker.hazard.risk} risk: ${marker.hazard.type} at ${marker.hazard.location}`; }));
  mapElement.querySelector('#map-search-button').addEventListener('click', () => {
    const query = mapElement.querySelector('#map-search-input').value.trim().toLowerCase();
    const match = hazards.find(hazard => `${hazard.type} ${hazard.location}`.toLowerCase().includes(query));
    details.textContent = query && match ? `${match.risk} risk: ${match.type} at ${match.location}` : query ? 'No hazards found for that search.' : 'Enter a road or hazard to search.';
    if (match) map.setView([match.lat, match.lng], 16);
  });
  mapElement.querySelector('#map-search-input').addEventListener('keydown', event => { if (event.key === 'Enter') mapElement.querySelector('#map-search-button').click(); });
  mapElement.querySelectorAll('.map-filter').forEach(filter => filter.addEventListener('click', () => {
    mapElement.querySelectorAll('.map-filter').forEach(item => item.classList.remove('active'));
    filter.classList.add('active');
    const risk = filter.dataset.risk;
    markers.forEach(marker => { if (risk === 'all' || marker.hazard.risk === risk) markerLayer.addLayer(marker); else markerLayer.removeLayer(marker); });
  }));
}

const workflowDetails = {
  Capture: 'RoadSentry collects road imagery and community reports in one place.',
  Analyze: 'The system classifies hazards and estimates their current safety risk.',
  Prioritize: 'Teams see the most urgent incidents first, based on severity and location.',
  Protect: 'Actionable alerts help crews resolve issues before they become accidents.'
};
document.querySelectorAll('.stage').forEach(stage => {
  stage.addEventListener('click', () => {
    document.querySelector('#workflow-detail').textContent = workflowDetails[stage.dataset.stage];
  });
});
document.querySelectorAll('.insight-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelector('#insight-detail').textContent = card.dataset.insight;
  });
});

window.addEventListener('load', initMap);
