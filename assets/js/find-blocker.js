document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('plate_input').addEventListener('input', e => {
    e.target.value = e.target.value.toUpperCase();
  });

  document.getElementById('lookup-form').addEventListener('submit', handleLookup);
});

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

  // ── Step 1: find the student's own active record ────────────────
  const { data: myCar, error: myErr } = await db
    .from('parked_cars')
    .select('*, zones(zone_name)')
    .eq('plate_number', plate)
    .eq('status', 'active')
    .maybeSingle();

  if (myErr) {
    showMessage('Connection error. Please try again.', 'error');
    resetBtn(btn);
    return;
  }

  if (!myCar) {
    showMessage(`No active registration found for plate "${plate}". Make sure you registered your car first.`, 'error');
    resetBtn(btn);
    return;
  }

  // ── Step 2: spot 1 is never blocked ────────────────────────────
  if (myCar.spot_number === 1) {
    showResult('free', {
      plate: myCar.plate_number,
      zone:  myCar.zones.zone_name,
      spot:  myCar.spot_number
    });
    resetBtn(btn);
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
    resetBtn(btn);
    return;
  }

  if (!blocker) {
    showResult('clear', {
      plate: myCar.plate_number,
      zone:  myCar.zones.zone_name,
      spot:  myCar.spot_number
    });
    resetBtn(btn);
    return;
  }

  // ── Step 4: blocker found ───────────────────────────────────────
  showResult('blocked', {
    myCar,
    blocker
  });
  resetBtn(btn);
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

    const zonePart  = document.createTextNode(`You are in Zone ${data.zone}, Spot 1 — the first spot. You can exit freely.`);
    msg.appendChild(zonePart);

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

    // tel: link — safe to use href here (not user-generated HTML)
    const callBtn = document.createElement('a');
    callBtn.className = 'call-btn';
    callBtn.href      = `tel:${blocker.phone_number}`;

    const callIcon = document.createTextNode('📞 ');
    const callText = document.createTextNode('Call ');
    const callNum  = document.createTextNode(blocker.phone_number);

    callBtn.appendChild(callIcon);
    callBtn.appendChild(callText);
    callBtn.appendChild(callNum);

    card.appendChild(label);
    card.appendChild(blockerPlate);
    card.appendChild(blockerName);
    card.appendChild(divider);
    card.appendChild(metaWrap);
    card.appendChild(callBtn);
    area.appendChild(card);
  }
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
}

function resetBtn(btn) {
  btn.disabled    = false;
  btn.textContent = 'Check Now';
}

function formatTime(isoTime) {
  const d    = new Date(isoTime);
  const now  = new Date();
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (d.toDateString() === now.toDateString()) return `today at ${time}`;

  const date = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return `${date} at ${time}`;
}
