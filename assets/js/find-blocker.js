let selectedPlateFile = null;

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('plate_input').addEventListener('input', e => {
    e.target.value = e.target.value.toUpperCase();
  });

  document.getElementById('lookup-form').addEventListener('submit', handleLookup);

  document.getElementById('btn-type').addEventListener('click', () => setMode('type'));
  document.getElementById('btn-scan').addEventListener('click', () => setMode('scan'));
  document.getElementById('scan-btn').addEventListener('click', handleScan);

  // Upload area opens the picker sheet
  document.getElementById('upload-area').addEventListener('click', openPicker);

  // Picker buttons
  document.getElementById('picker-camera').addEventListener('click', () => {
    closePicker();
    document.getElementById('plate-image-camera').click();
  });
  document.getElementById('picker-gallery').addEventListener('click', () => {
    closePicker();
    document.getElementById('plate-image-gallery').click();
  });
  document.getElementById('picker-cancel').addEventListener('click', closePicker);
  document.getElementById('img-picker-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closePicker();
  });

  // Both inputs feed the same handler
  document.getElementById('plate-image-camera').addEventListener('change', handleImageSelect);
  document.getElementById('plate-image-gallery').addEventListener('change', handleImageSelect);
});

function openPicker()  { document.getElementById('img-picker-overlay').classList.add('is-open'); }
function closePicker() { document.getElementById('img-picker-overlay').classList.remove('is-open'); }

function setMode(mode) {
  const isType = mode === 'type';
  document.getElementById('lookup-form').style.display    = isType ? '' : 'none';
  document.getElementById('scan-section').style.display   = isType ? 'none' : '';
  document.getElementById('btn-type').classList.toggle('active', isType);
  document.getElementById('btn-scan').classList.toggle('active', !isType);
  clearAll();
}

function handleImageSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  selectedPlateFile = file;
  const preview = document.getElementById('upload-preview');
  const prompt  = document.getElementById('upload-prompt');
  preview.src           = URL.createObjectURL(file);
  preview.style.display = 'block';
  prompt.style.display  = 'none';
}

async function handleScan() {
  clearAll();
  const file = selectedPlateFile;
  if (!file) {
    showMessage('Please select or photograph a plate image first.', 'error');
    return;
  }

  const btn = document.getElementById('scan-btn');
  btn.disabled    = true;
  btn.textContent = 'Scanning…';

  let imageBase64;
  try {
    imageBase64 = await resizeImage(file);
  } catch {
    showMessage('Could not read the image. Please try again.', 'error');
    resetScanBtn(btn);
    return;
  }

  const aiPrompt = 'You are a vehicle license plate reader. Look at this image and extract the license plate number. Return ONLY the plate number text in uppercase, preserving any spaces between letters and digits as they appear on the plate. If you cannot read a license plate, respond with exactly: UNREADABLE';

  let plateText;
  try {
    const res = await fetch('/api/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: aiPrompt, imageBase64 })
    });
    if (!res.ok) throw new Error('API error');
    const json = await res.json();
    plateText = (json.result || '').trim().toUpperCase();
  } catch {
    showMessage('AI scan failed. Please try again or type the plate manually.', 'error');
    resetScanBtn(btn);
    return;
  }

  if (!plateText || plateText === 'UNREADABLE') {
    showMessage('Could not read a plate from this image. Try a clearer photo or type the plate manually.', 'error');
    resetScanBtn(btn);
    return;
  }

  showMessage(`Plate detected: ${plateText} — searching…`, 'info');
  await runLookup(plateText);
  resetScanBtn(btn);
}

async function handleLookup(e) {
  e.preventDefault();
  clearAll();

  const plate = document.getElementById('plate_input').value.trim().toUpperCase();
  if (!plate) {
    showMessage('Please enter your plate number.', 'error');
    return;
  }

  const btn = document.getElementById('lookup-btn');
  btn.disabled    = true;
  btn.textContent = 'Searching…';

  await runLookup(plate);

  btn.disabled    = false;
  btn.textContent = 'Check Now';
}

async function runLookup(plate) {
  // ── Step 1: find the student's own active record ────────────────
  const { data: myCar, error: myErr } = await db
    .from('parked_cars')
    .select('*, zones(zone_name)')
    .eq('plate_number', plate)
    .eq('status', 'active')
    .maybeSingle();

  if (myErr) {
    showMessage('Connection error. Please try again.', 'error');
    return;
  }

  if (!myCar) {
    showMessage(`No active registration found for plate "${plate}". Make sure you registered your car first.`, 'error');
    return;
  }

  // ── Step 2: spot 1 is never blocked ────────────────────────────
  if (myCar.spot_number === 1) {
    showResult('free', {
      plate: myCar.plate_number,
      zone:  myCar.zones.zone_name,
      spot:  myCar.spot_number
    });
    return;
  }

  // ── Step 3: look for car at spot N-1 in the same zone ──────────
  const { data: blocker, error: blockerErr } = await db
    .from('parked_cars')
    .select('*')
    .eq('zone_id', myCar.zone_id)
    .eq('spot_number', myCar.spot_number - 1)
    .eq('status', 'active')
    .maybeSingle();

  if (blockerErr) {
    showMessage('Connection error. Please try again.', 'error');
    return;
  }

  if (!blocker) {
    showResult('clear', {
      plate: myCar.plate_number,
      zone:  myCar.zones.zone_name,
      spot:  myCar.spot_number
    });
    return;
  }

  // ── Step 4: blocker found ───────────────────────────────────────
  showResult('blocked', { myCar, blocker });
}

function showResult(state, data) {
  const area = document.getElementById('result-area');
  area.innerHTML = '';

  if (state === 'free') {
    const card = document.createElement('div');
    card.className = 'blocker-card';
    card.style.borderLeft = '4px solid #22c55e';

    const label = document.createElement('div');
    label.className   = 'blocker-label';
    label.style.color = '#22c55e';
    label.textContent = 'You are not blocked';

    const msg = document.createElement('p');
    msg.style.color     = '#374151';
    msg.style.marginTop = '0.5rem';
    msg.style.fontSize  = '0.95rem';
    msg.appendChild(document.createTextNode(`You are in Zone ${data.zone}, Spot 1 — the first spot. You can exit freely.`));

    card.appendChild(label);
    card.appendChild(msg);
    area.appendChild(card);
    return;
  }

  if (state === 'clear') {
    const card = document.createElement('div');
    card.className = 'blocker-card';
    card.style.borderLeft = '4px solid #22c55e';

    const label = document.createElement('div');
    label.className   = 'blocker-label';
    label.style.color = '#22c55e';
    label.textContent = 'Your path is clear';

    const msg = document.createElement('p');
    msg.style.color     = '#374151';
    msg.style.marginTop = '0.5rem';
    msg.style.fontSize  = '0.95rem';
    msg.textContent = `No car is blocking Spot ${data.spot} in Zone ${data.zone}. You are free to exit.`;

    card.appendChild(label);
    card.appendChild(msg);
    area.appendChild(card);
    return;
  }

  if (state === 'blocked') {
    const { blocker } = data;
    const card = document.createElement('div');
    card.className = 'blocker-card';
    card.style.borderLeft = '4px solid #f97316';

    const label = document.createElement('div');
    label.className   = 'blocker-label';
    label.textContent = 'You are blocked by';

    const blockerPlate = document.createElement('div');
    blockerPlate.className   = 'blocker-plate';
    blockerPlate.textContent = blocker.plate_number;

    const blockerName = document.createElement('div');
    blockerName.className   = 'blocker-name';
    blockerName.textContent = blocker.student_name;

    const divider = document.createElement('hr');
    divider.style.cssText = 'border:none;border-top:1px solid #e2e8f0;margin:1rem 0;';

    const metaWrap = document.createElement('div');
    metaWrap.style.cssText = 'display:flex;flex-direction:column;gap:0.4rem;';

    const metaSpot = document.createElement('div');
    metaSpot.style.cssText = 'font-size:0.875rem;color:#64748b;';
    metaSpot.textContent   = `Parked at Spot ${blocker.spot_number} in the same zone`;

    const metaDep = document.createElement('div');
    metaDep.style.cssText = 'font-size:0.875rem;color:#64748b;';
    metaDep.textContent   = `Estimated departure: ${formatTime(blocker.departure_time)}`;

    metaWrap.appendChild(metaSpot);
    metaWrap.appendChild(metaDep);

    const callBtn = document.createElement('a');
    callBtn.className = 'call-btn';
    callBtn.href      = `tel:${blocker.phone_number.replace(/\s+/g, '')}`;
    callBtn.appendChild(document.createTextNode('📞 '));
    callBtn.appendChild(document.createTextNode('Call '));
    callBtn.appendChild(document.createTextNode(blocker.phone_number));

    card.appendChild(label);
    card.appendChild(blockerPlate);
    card.appendChild(blockerName);
    card.appendChild(divider);
    card.appendChild(metaWrap);
    card.appendChild(callBtn);
    area.appendChild(card);
  }
}

function resizeImage(file, maxDim = 1024) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale  = Math.min(1, maxDim / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = reject;
    img.src = url;
  });
}

function showMessage(text, type) {
  const el = document.getElementById('form-message');
  el.textContent   = text;
  el.className     = `form-message ${type}`;
  el.style.display = 'block';
}

function clearAll() {
  const msg = document.getElementById('form-message');
  msg.style.display = 'none';
  msg.textContent   = '';
  document.getElementById('result-area').innerHTML = '';
  selectedPlateFile = null;
}

function resetScanBtn(btn) {
  btn.disabled    = false;
  btn.textContent = 'Scan & Search';
}

function formatTime(isoTime) {
  const d    = new Date(isoTime);
  const now  = new Date();
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (d.toDateString() === now.toDateString()) return `today at ${time}`;

  const date = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return `${date} at ${time}`;
}
