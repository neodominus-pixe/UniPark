document.addEventListener('DOMContentLoaded', () => {
  setMinDeparture();
  loadZones();
  autofillFromStorage();

  document.getElementById('plate_number').addEventListener('input', e => {
    e.target.value = e.target.value.toUpperCase();
  });

  document.getElementById('zone').addEventListener('change', updateSpotMax);
  document.getElementById('register-form').addEventListener('submit', handleSubmit);
});

function setMinDeparture() {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 5);
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  document.getElementById('departure_time').min = local;
}

async function loadZones() {
  const zoneSelect = document.getElementById('zone');

  const { data, error } = await db.from('zones').select('*').order('zone_name');

  if (error) {
    showMessage('Failed to load zones. Please refresh the page.', 'error');
    zoneSelect.innerHTML = '<option value="">Error loading zones</option>';
    return;
  }

  zoneSelect.innerHTML = '<option value="">Select a zone...</option>';
  data.forEach(zone => {
    const opt = document.createElement('option');
    opt.value = zone.id;
    opt.textContent = `Zone ${zone.zone_name}`;
    opt.dataset.totalSpots = zone.total_spots;
    zoneSelect.appendChild(opt);
  });
}

function updateSpotMax() {
  const zoneSelect = document.getElementById('zone');
  const spotInput  = document.getElementById('spot_number');
  const selected   = zoneSelect.options[zoneSelect.selectedIndex];

  if (selected && selected.dataset.totalSpots) {
    const max = parseInt(selected.dataset.totalSpots);
    spotInput.max         = max;
    spotInput.placeholder = `1 – ${max}`;
    spotInput.value       = '';
  }
}

async function handleSubmit(e) {
  e.preventDefault();
  clearMessage();

  const btn = document.getElementById('submit-btn');
  btn.disabled    = true;
  btn.textContent = 'Registering...';

  const studentName   = document.getElementById('student_name').value.trim();
  const studentId     = document.getElementById('student_id').value.trim();
  const phoneNumber   = document.getElementById('phone_number').value.trim();
  const plateNumber   = document.getElementById('plate_number').value.trim().toUpperCase();
  const zoneSelect    = document.getElementById('zone');
  const zoneId        = parseInt(zoneSelect.value);
  const spotNumber    = parseInt(document.getElementById('spot_number').value);
  const departureTime = document.getElementById('departure_time').value;

  // ── Client-side validation ──────────────────────────────────────
  if (!studentName || !studentId || !phoneNumber || !plateNumber || !zoneId || !spotNumber || !departureTime) {
    showMessage('Please fill in all fields.', 'error');
    resetBtn(btn);
    return;
  }

  if (new Date(departureTime) <= new Date()) {
    showMessage('Estimated departure must be a future time.', 'error');
    resetBtn(btn);
    return;
  }

  const maxSpots = parseInt(zoneSelect.options[zoneSelect.selectedIndex].dataset.totalSpots);
  if (spotNumber < 1 || spotNumber > maxSpots) {
    showMessage(`Spot number must be between 1 and ${maxSpots} for this zone.`, 'error');
    resetBtn(btn);
    return;
  }

  // ── Check: plate already active ────────────────────────────────
  const { data: existingPlate, error: plateErr } = await db
    .from('parked_cars')
    .select('id')
    .eq('plate_number', plateNumber)
    .eq('status', 'active')
    .maybeSingle();

  if (plateErr) { showMessage('Connection error. Please try again.', 'error'); resetBtn(btn); return; }

  if (existingPlate) {
    showMessage(`Plate ${plateNumber} already has an active registration.`, 'error');
    resetBtn(btn);
    return;
  }

  // ── Check: spot already taken ───────────────────────────────────
  const { data: existingSpot, error: spotErr } = await db
    .from('parked_cars')
    .select('id')
    .eq('zone_id', zoneId)
    .eq('spot_number', spotNumber)
    .eq('status', 'active')
    .maybeSingle();

  if (spotErr) { showMessage('Connection error. Please try again.', 'error'); resetBtn(btn); return; }

  if (existingSpot) {
    showMessage('That spot is already taken. Please choose a different spot.', 'error');
    resetBtn(btn);
    return;
  }

  // ── Insert ──────────────────────────────────────────────────────
  const { error: insertErr } = await db.from('parked_cars').insert({
    student_name:   studentName,
    student_id:     studentId,
    phone_number:   phoneNumber,
    plate_number:   plateNumber,
    zone_id:        zoneId,
    spot_number:    spotNumber,
    departure_time: new Date(departureTime).toISOString(),
    status:         'active'
  });

  if (insertErr) {
    showMessage('Registration failed. Please try again.', 'error');
    resetBtn(btn);
    return;
  }

  localStorage.setItem('student_name', studentName);
  localStorage.setItem('student_id', studentId);
  localStorage.setItem('phone_number', phoneNumber);
  localStorage.setItem('plate_number', plateNumber);

  window.location.href = `dashboard.html?registered=${encodeURIComponent(plateNumber)}`;
}

function showMessage(text, type) {
  const el = document.getElementById('form-message');
  el.textContent = text;
  el.className   = `form-message ${type}`;
  el.style.display = 'block';
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function clearMessage() {
  const el = document.getElementById('form-message');
  el.style.display = 'none';
  el.textContent   = '';
}

function resetBtn(btn) {
  btn.disabled    = false;
  btn.textContent = 'Register My Car';
}

function autofillFromStorage() {
  const fields = ['student_name', 'student_id', 'phone_number', 'plate_number'];
  if (!fields.some(f => localStorage.getItem(f))) return;
  fields.forEach(f => {
    const val = localStorage.getItem(f);
    if (val) document.getElementById(f).value = val;
  });
}

function clearSavedInfo() {
  ['student_name', 'student_id', 'phone_number', 'plate_number'].forEach(f => {
    localStorage.removeItem(f);
    document.getElementById(f).value = '';
  });
}
