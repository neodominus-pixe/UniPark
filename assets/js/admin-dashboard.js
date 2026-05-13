let allCars = [];

document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
  await loadDashboard();

  document.getElementById('search-input').addEventListener('input', filterRows);
  document.getElementById('zone-filter').addEventListener('change', filterRows);
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
});

async function checkAuth() {
  const { data: { session } } = await db.auth.getSession();
  if (!session) window.location.href = 'login.html';
}

async function loadDashboard() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [carsResult, exitedResult, zonesResult] = await Promise.all([
    db.from('parked_cars')
      .select('*, zones(zone_name)')
      .eq('status', 'active')
      .order('zone_id')
      .order('spot_number'),
    db.from('parked_cars')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'exited')
      .gte('arrival_time', todayStart.toISOString()),
    db.from('zones')
      .select('*')
  ]);

  const loadingEl   = document.getElementById('loading');
  const tableWrapEl = document.getElementById('table-wrap');

  if (carsResult.error || zonesResult.error) {
    loadingEl.textContent = 'Failed to load data. Please refresh.';
    return;
  }

  allCars = carsResult.data;

  const totalSpots = zonesResult.data.reduce((sum, z) => sum + z.total_spots, 0);

  document.getElementById('stat-active').textContent = allCars.length;
  document.getElementById('stat-exited').textContent = exitedResult.count ?? 0;
  document.getElementById('stat-total').textContent  = totalSpots;

  // Populate zone filter from the actual data
  const zoneFilter  = document.getElementById('zone-filter');
  const uniqueZones = [...new Set(allCars.map(c => c.zones?.zone_name).filter(Boolean))].sort();
  uniqueZones.forEach(zone => {
    const opt = document.createElement('option');
    opt.value       = zone;
    opt.textContent = `Zone ${zone}`;
    zoneFilter.appendChild(opt);
  });

  loadingEl.style.display    = 'none';
  tableWrapEl.style.display  = 'block';

  renderTable(allCars);
}

function filterRows() {
  const query = document.getElementById('search-input').value.trim().toLowerCase();
  const zone  = document.getElementById('zone-filter').value;

  let filtered = allCars;

  if (query) {
    filtered = filtered.filter(c =>
      c.plate_number.toLowerCase().includes(query)  ||
      c.student_id.toLowerCase().includes(query)    ||
      c.student_name.toLowerCase().includes(query)
    );
  }

  if (zone) {
    filtered = filtered.filter(c => c.zones?.zone_name === zone);
  }

  renderTable(filtered);
}

function renderTable(cars) {
  const tbody = document.getElementById('cars-tbody');
  tbody.innerHTML = '';

  if (cars.length === 0) {
    const tr = document.createElement('tr');
    tr.className = 'empty-row';
    const td = document.createElement('td');
    td.colSpan   = 9;
    td.textContent = allCars.length === 0
      ? 'No cars are currently parked.'
      : 'No cars match your search.';
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  cars.forEach(car => tbody.appendChild(buildRow(car)));
}

function buildRow(car) {
  const tr = document.createElement('tr');
  tr.dataset.id = car.id;

  // Student Name
  appendTd(tr, car.student_name);

  // Student ID
  appendTd(tr, car.student_id);

  // Phone — clickable tel: link
  const phoneTd = document.createElement('td');
  const phoneLink = document.createElement('a');
  phoneLink.className = 'phone-link';
  phoneLink.href      = `tel:${car.phone_number}`;
  phoneLink.textContent = car.phone_number;
  phoneTd.appendChild(phoneLink);
  tr.appendChild(phoneTd);

  // Plate
  const plateTd = document.createElement('td');
  plateTd.className   = 'plate-cell';
  plateTd.textContent = car.plate_number;
  tr.appendChild(plateTd);

  // Zone
  appendTd(tr, `Zone ${car.zones?.zone_name ?? '—'}`);

  // Spot
  appendTd(tr, `Spot ${car.spot_number}`);

  // Arrived
  const arrivedTd = document.createElement('td');
  arrivedTd.className   = 'time-cell';
  arrivedTd.textContent = formatDateTime(car.arrival_time);
  tr.appendChild(arrivedTd);

  // Est. Departure
  const depTd = document.createElement('td');
  depTd.className   = 'time-cell';
  depTd.textContent = formatDateTime(car.departure_time);
  tr.appendChild(depTd);

  // Action
  const actionTd = document.createElement('td');
  const btn = document.createElement('button');
  btn.className   = 'btn btn-sm btn-danger';
  btn.textContent = 'Mark Exited';
  btn.addEventListener('click', () => markExited(car.id, tr, btn));
  actionTd.appendChild(btn);
  tr.appendChild(actionTd);

  return tr;
}

function appendTd(tr, text) {
  const td = document.createElement('td');
  td.textContent = text;
  tr.appendChild(td);
}

async function markExited(id, rowEl, btn) {
  btn.disabled    = true;
  btn.textContent = 'Updating…';

  const { error } = await db
    .from('parked_cars')
    .update({ status: 'exited' })
    .eq('id', id);

  if (error) {
    btn.disabled    = false;
    btn.textContent = 'Mark Exited';
    alert('Failed to update. Please try again.');
    return;
  }

  // Remove from local data and DOM
  allCars = allCars.filter(c => c.id !== id);
  rowEl.remove();

  // Update stats live
  const activeEl = document.getElementById('stat-active');
  const exitedEl = document.getElementById('stat-exited');
  activeEl.textContent = parseInt(activeEl.textContent) - 1;
  exitedEl.textContent = parseInt(exitedEl.textContent) + 1;

  // If table is now empty, show the empty state
  if (document.getElementById('cars-tbody').children.length === 0) {
    renderTable([]);
  }
}

async function handleLogout() {
  const btn = document.getElementById('logout-btn');
  btn.disabled    = true;
  btn.textContent = 'Signing out…';
  await db.auth.signOut();
  window.location.href = 'login.html';
}

function formatDateTime(isoTime) {
  if (!isoTime) return '—';
  const d = new Date(isoTime);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
    + ' '
    + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
