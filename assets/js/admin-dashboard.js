let allCars = [];

document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
  await loadDashboard();

  document.getElementById('search-input').addEventListener('input', filterRows);
  document.getElementById('zone-filter').addEventListener('change', filterRows);
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
  document.getElementById('insights-btn').addEventListener('click', generateInsights);
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

async function generateInsights() {
  const btn  = document.getElementById('insights-btn');
  const body = document.getElementById('insights-body');

  btn.disabled    = true;
  btn.textContent = 'Analysing…';
  body.className  = 'insights-body is-loading';
  body.style.display = 'block';
  body.textContent   = 'Reading parking data…';

  const { data, error } = await db
    .from('parked_cars')
    .select('zone_id, arrival_time, departure_time, status, zones(zone_name)');

  if (error || !data?.length) {
    body.className  = 'insights-body is-error';
    body.textContent = 'Could not load parking data. Please try again.';
    btn.disabled    = false;
    btn.textContent = 'Generate Insights';
    return;
  }

  const summary = buildDataSummary(data);

  try {
    const res = await fetch('/api/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `You are a parking coordinator analysing usage patterns for a university campus parking system (AUST). Based on the data below, write 3-4 brief, practical insights in plain English. Be specific with the numbers. Keep each insight to 1-2 sentences. Format as a plain list using "•" bullets, one per line.\n\n${summary}`
      })
    });

    if (!res.ok) throw new Error();
    const json = await res.json();

    body.className   = 'insights-body';
    body.textContent = '';
    renderInsights(body, json.result || '');
  } catch {
    body.className  = 'insights-body is-error';
    body.textContent = 'AI analysis failed. Please try again.';
    btn.disabled    = false;
    btn.textContent = 'Generate Insights';
    return;
  }

  btn.disabled    = false;
  btn.textContent = 'Regenerate';
}

function buildDataSummary(data) {
  const active = data.filter(r => r.status === 'active').length;
  const exited = data.filter(r => r.status === 'exited').length;

  // Per-zone counts
  const zoneCounts = {};
  data.forEach(r => {
    const z = r.zones?.zone_name || '?';
    zoneCounts[z] = (zoneCounts[z] || 0) + 1;
  });
  const zoneStr = Object.entries(zoneCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([z, c]) => `Zone ${z}: ${c} cars`)
    .join(', ');

  // Average parking duration for exited records
  const durations = data
    .filter(r => r.status === 'exited' && r.arrival_time && r.departure_time)
    .map(r => (new Date(r.departure_time) - new Date(r.arrival_time)) / 60000);

  let avgDurStr = 'insufficient data';
  if (durations.length > 0) {
    const avgMin = durations.reduce((s, d) => s + d, 0) / durations.length;
    const h = Math.floor(avgMin / 60);
    const m = Math.round(avgMin % 60);
    avgDurStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  // Peak arrival hour
  const hourCounts = {};
  data.forEach(r => {
    if (!r.arrival_time) return;
    const h = new Date(r.arrival_time).getHours();
    hourCounts[h] = (hourCounts[h] || 0) + 1;
  });

  let peakStr = 'insufficient data';
  const hourEntries = Object.entries(hourCounts);
  if (hourEntries.length > 0) {
    const [peakHour, peakCount] = hourEntries.sort((a, b) => b[1] - a[1])[0];
    const h = parseInt(peakHour);
    const label = h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`;
    peakStr = `${label} (${peakCount} arrivals)`;
  }

  return [
    `Total records: ${data.length} (${active} currently active, ${exited} exited)`,
    `Zone breakdown: ${zoneStr}`,
    `Average parking duration: ${avgDurStr}`,
    `Peak arrival hour: ${peakStr}`
  ].join('\n');
}

function renderInsights(container, text) {
  const lines = text
    .split('\n')
    .map(l => l.replace(/^[•\-\*]\s*/, '').trim())
    .filter(Boolean);

  lines.forEach(line => {
    const item = document.createElement('div');
    item.className = 'insight-item';

    const dot = document.createElement('div');
    dot.className = 'insight-dot';

    const span = document.createElement('span');
    span.textContent = line;

    item.appendChild(dot);
    item.appendChild(span);
    container.appendChild(item);
  });
}

function formatDateTime(isoTime) {
  if (!isoTime) return '—';
  const d = new Date(isoTime);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
    + ' '
    + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
