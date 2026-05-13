document.addEventListener('DOMContentLoaded', async () => {
  showSuccessFromURL();
  await loadDashboard();
});

function showSuccessFromURL() {
  const params = new URLSearchParams(window.location.search);
  const plate  = params.get('registered');
  if (!plate) return;

  const el = document.getElementById('page-message');
  el.textContent   = `Car registered successfully — welcome, ${decodeURIComponent(plate)}!`;
  el.className     = 'form-message success';
  el.style.display = 'block';

  window.history.replaceState({}, '', 'dashboard.html');
}

async function loadDashboard() {
  const [carsResult, zonesResult] = await Promise.all([
    db.from('parked_cars')
      .select('*, zones(zone_name)')
      .eq('status', 'active')
      .order('spot_number'),
    db.from('zones').select('*').order('zone_name')
  ]);

  const loadingEl = document.getElementById('loading');

  if (carsResult.error || zonesResult.error) {
    loadingEl.textContent = 'Failed to load parking data. Please refresh.';
    return;
  }

  const cars  = carsResult.data;
  const zones = zonesResult.data;

  const totalSpots = zones.reduce((sum, z) => sum + z.total_spots, 0);
  const activeCars = cars.length;

  document.getElementById('stat-active').textContent    = activeCars;
  document.getElementById('stat-available').textContent = totalSpots - activeCars;
  document.getElementById('stat-total').textContent     = totalSpots;

  loadingEl.style.display = 'none';

  const container = document.getElementById('zones-container');
  container.style.display = 'block';

  if (activeCars === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">🅿️</div>
        <p>No cars are currently parked. The lot is wide open.</p>
      </div>`;
    return;
  }

  // Group cars by zone name
  const grouped = {};
  zones.forEach(z => { grouped[z.zone_name] = []; });
  cars.forEach(car => {
    const name = car.zones?.zone_name;
    if (name && grouped[name] !== undefined) grouped[name].push(car);
  });

  // Render each zone that has active cars
  zones.forEach(zone => {
    const zoneCars = grouped[zone.zone_name];
    if (!zoneCars || zoneCars.length === 0) return;

    zoneCars.sort((a, b) => a.spot_number - b.spot_number);

    const section = document.createElement('div');
    section.className = 'zone-section';

    const title = document.createElement('div');
    title.className   = 'zone-title';
    title.textContent = `Zone ${zone.zone_name}`;
    section.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'cars-grid';
    zoneCars.forEach(car => grid.appendChild(buildCarCard(car)));
    section.appendChild(grid);

    container.appendChild(section);
  });
}

function buildCarCard(car) {
  const isLeavingSoon = isWithin30Min(car.departure_time);

  const card = document.createElement('div');
  card.className = 'car-card';

  const plate = document.createElement('div');
  plate.className   = 'plate';
  plate.textContent = car.plate_number;

  const name = document.createElement('div');
  name.className   = 'name';
  name.textContent = car.student_name;

  const meta = document.createElement('div');
  meta.className   = 'meta';
  meta.textContent = `Spot ${car.spot_number} · Leaves ${formatTime(car.departure_time)}`;

  const footer = document.createElement('div');
  footer.className = 'card-footer';

  const badge = document.createElement('span');
  badge.className   = isLeavingSoon ? 'badge badge-leaving' : 'badge badge-active';
  badge.textContent = isLeavingSoon ? 'Leaving Soon' : 'Active';

  footer.appendChild(badge);
  card.appendChild(plate);
  card.appendChild(name);
  card.appendChild(meta);
  card.appendChild(footer);

  return card;
}

function isWithin30Min(isoTime) {
  const diff = new Date(isoTime) - new Date();
  return diff > 0 && diff <= 30 * 60 * 1000;
}

function formatTime(isoTime) {
  const d   = new Date(isoTime);
  const now = new Date();
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (d.toDateString() === now.toDateString()) return `today at ${time}`;

  const date = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return `${date} at ${time}`;
}
