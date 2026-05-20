let selectedDialCode   = '+961';
let selectedPlatePrefix = 'B';

const PLATE_PREFIXES = ['B', 'G', 'O', 'S', 'N', 'M', 'P', 'D', 'J', 'R', 'T', 'Z'];

const COUNTRIES = [
  { name: 'Lebanon',              flag: '🇱🇧', code: '+961' },
  { name: 'Afghanistan',          flag: '🇦🇫', code: '+93'  },
  { name: 'Albania',              flag: '🇦🇱', code: '+355' },
  { name: 'Algeria',              flag: '🇩🇿', code: '+213' },
  { name: 'Andorra',              flag: '🇦🇩', code: '+376' },
  { name: 'Angola',               flag: '🇦🇴', code: '+244' },
  { name: 'Antigua & Barbuda',    flag: '🇦🇬', code: '+1268'},
  { name: 'Argentina',            flag: '🇦🇷', code: '+54'  },
  { name: 'Armenia',              flag: '🇦🇲', code: '+374' },
  { name: 'Australia',            flag: '🇦🇺', code: '+61'  },
  { name: 'Austria',              flag: '🇦🇹', code: '+43'  },
  { name: 'Azerbaijan',           flag: '🇦🇿', code: '+994' },
  { name: 'Bahamas',              flag: '🇧🇸', code: '+1242'},
  { name: 'Bahrain',              flag: '🇧🇭', code: '+973' },
  { name: 'Bangladesh',           flag: '🇧🇩', code: '+880' },
  { name: 'Barbados',             flag: '🇧🇧', code: '+1246'},
  { name: 'Belarus',              flag: '🇧🇾', code: '+375' },
  { name: 'Belgium',              flag: '🇧🇪', code: '+32'  },
  { name: 'Belize',               flag: '🇧🇿', code: '+501' },
  { name: 'Benin',                flag: '🇧🇯', code: '+229' },
  { name: 'Bhutan',               flag: '🇧🇹', code: '+975' },
  { name: 'Bolivia',              flag: '🇧🇴', code: '+591' },
  { name: 'Bosnia & Herzegovina', flag: '🇧🇦', code: '+387' },
  { name: 'Botswana',             flag: '🇧🇼', code: '+267' },
  { name: 'Brazil',               flag: '🇧🇷', code: '+55'  },
  { name: 'Brunei',               flag: '🇧🇳', code: '+673' },
  { name: 'Bulgaria',             flag: '🇧🇬', code: '+359' },
  { name: 'Burkina Faso',         flag: '🇧🇫', code: '+226' },
  { name: 'Burundi',              flag: '🇧🇮', code: '+257' },
  { name: 'Cabo Verde',           flag: '🇨🇻', code: '+238' },
  { name: 'Cambodia',             flag: '🇰🇭', code: '+855' },
  { name: 'Cameroon',             flag: '🇨🇲', code: '+237' },
  { name: 'Canada',               flag: '🇨🇦', code: '+1'   },
  { name: 'Central African Rep.', flag: '🇨🇫', code: '+236' },
  { name: 'Chad',                 flag: '🇹🇩', code: '+235' },
  { name: 'Chile',                flag: '🇨🇱', code: '+56'  },
  { name: 'China',                flag: '🇨🇳', code: '+86'  },
  { name: 'Colombia',             flag: '🇨🇴', code: '+57'  },
  { name: 'Comoros',              flag: '🇰🇲', code: '+269' },
  { name: 'Congo (DRC)',           flag: '🇨🇩', code: '+243' },
  { name: 'Congo (Republic)',      flag: '🇨🇬', code: '+242' },
  { name: 'Costa Rica',           flag: '🇨🇷', code: '+506' },
  { name: "Côte d'Ivoire",        flag: '🇨🇮', code: '+225' },
  { name: 'Croatia',              flag: '🇭🇷', code: '+385' },
  { name: 'Cuba',                 flag: '🇨🇺', code: '+53'  },
  { name: 'Cyprus',               flag: '🇨🇾', code: '+357' },
  { name: 'Czech Republic',       flag: '🇨🇿', code: '+420' },
  { name: 'Denmark',              flag: '🇩🇰', code: '+45'  },
  { name: 'Djibouti',             flag: '🇩🇯', code: '+253' },
  { name: 'Dominica',             flag: '🇩🇲', code: '+1767'},
  { name: 'Dominican Republic',   flag: '🇩🇴', code: '+1809'},
  { name: 'Ecuador',              flag: '🇪🇨', code: '+593' },
  { name: 'Egypt',                flag: '🇪🇬', code: '+20'  },
  { name: 'El Salvador',          flag: '🇸🇻', code: '+503' },
  { name: 'Equatorial Guinea',    flag: '🇬🇶', code: '+240' },
  { name: 'Eritrea',              flag: '🇪🇷', code: '+291' },
  { name: 'Estonia',              flag: '🇪🇪', code: '+372' },
  { name: 'Eswatini',             flag: '🇸🇿', code: '+268' },
  { name: 'Ethiopia',             flag: '🇪🇹', code: '+251' },
  { name: 'Fiji',                 flag: '🇫🇯', code: '+679' },
  { name: 'Finland',              flag: '🇫🇮', code: '+358' },
  { name: 'France',               flag: '🇫🇷', code: '+33'  },
  { name: 'Gabon',                flag: '🇬🇦', code: '+241' },
  { name: 'Gambia',               flag: '🇬🇲', code: '+220' },
  { name: 'Georgia',              flag: '🇬🇪', code: '+995' },
  { name: 'Germany',              flag: '🇩🇪', code: '+49'  },
  { name: 'Ghana',                flag: '🇬🇭', code: '+233' },
  { name: 'Greece',               flag: '🇬🇷', code: '+30'  },
  { name: 'Grenada',              flag: '🇬🇩', code: '+1473'},
  { name: 'Guatemala',            flag: '🇬🇹', code: '+502' },
  { name: 'Guinea',               flag: '🇬🇳', code: '+224' },
  { name: 'Guinea-Bissau',        flag: '🇬🇼', code: '+245' },
  { name: 'Guyana',               flag: '🇬🇾', code: '+592' },
  { name: 'Haiti',                flag: '🇭🇹', code: '+509' },
  { name: 'Honduras',             flag: '🇭🇳', code: '+504' },
  { name: 'Hungary',              flag: '🇭🇺', code: '+36'  },
  { name: 'Iceland',              flag: '🇮🇸', code: '+354' },
  { name: 'India',                flag: '🇮🇳', code: '+91'  },
  { name: 'Indonesia',            flag: '🇮🇩', code: '+62'  },
  { name: 'Iran',                 flag: '🇮🇷', code: '+98'  },
  { name: 'Iraq',                 flag: '🇮🇶', code: '+964' },
  { name: 'Ireland',              flag: '🇮🇪', code: '+353' },
  { name: 'Israel',               flag: '🇮🇱', code: '+972' },
  { name: 'Italy',                flag: '🇮🇹', code: '+39'  },
  { name: 'Jamaica',              flag: '🇯🇲', code: '+1876'},
  { name: 'Japan',                flag: '🇯🇵', code: '+81'  },
  { name: 'Jordan',               flag: '🇯🇴', code: '+962' },
  { name: 'Kazakhstan',           flag: '🇰🇿', code: '+7'   },
  { name: 'Kenya',                flag: '🇰🇪', code: '+254' },
  { name: 'Kiribati',             flag: '🇰🇮', code: '+686' },
  { name: 'Korea (North)',         flag: '🇰🇵', code: '+850' },
  { name: 'Korea (South)',         flag: '🇰🇷', code: '+82'  },
  { name: 'Kosovo',               flag: '🇽🇰', code: '+383' },
  { name: 'Kuwait',               flag: '🇰🇼', code: '+965' },
  { name: 'Kyrgyzstan',           flag: '🇰🇬', code: '+996' },
  { name: 'Laos',                 flag: '🇱🇦', code: '+856' },
  { name: 'Latvia',               flag: '🇱🇻', code: '+371' },
  { name: 'Libya',                flag: '🇱🇾', code: '+218' },
  { name: 'Liechtenstein',        flag: '🇱🇮', code: '+423' },
  { name: 'Lithuania',            flag: '🇱🇹', code: '+370' },
  { name: 'Luxembourg',           flag: '🇱🇺', code: '+352' },
  { name: 'Madagascar',           flag: '🇲🇬', code: '+261' },
  { name: 'Malawi',               flag: '🇲🇼', code: '+265' },
  { name: 'Malaysia',             flag: '🇲🇾', code: '+60'  },
  { name: 'Maldives',             flag: '🇲🇻', code: '+960' },
  { name: 'Mali',                 flag: '🇲🇱', code: '+223' },
  { name: 'Malta',                flag: '🇲🇹', code: '+356' },
  { name: 'Marshall Islands',     flag: '🇲🇭', code: '+692' },
  { name: 'Mauritania',           flag: '🇲🇷', code: '+222' },
  { name: 'Mauritius',            flag: '🇲🇺', code: '+230' },
  { name: 'Mexico',               flag: '🇲🇽', code: '+52'  },
  { name: 'Micronesia',           flag: '🇫🇲', code: '+691' },
  { name: 'Moldova',              flag: '🇲🇩', code: '+373' },
  { name: 'Monaco',               flag: '🇲🇨', code: '+377' },
  { name: 'Mongolia',             flag: '🇲🇳', code: '+976' },
  { name: 'Montenegro',           flag: '🇲🇪', code: '+382' },
  { name: 'Morocco',              flag: '🇲🇦', code: '+212' },
  { name: 'Mozambique',           flag: '🇲🇿', code: '+258' },
  { name: 'Myanmar',              flag: '🇲🇲', code: '+95'  },
  { name: 'Namibia',              flag: '🇳🇦', code: '+264' },
  { name: 'Nauru',                flag: '🇳🇷', code: '+674' },
  { name: 'Nepal',                flag: '🇳🇵', code: '+977' },
  { name: 'Netherlands',          flag: '🇳🇱', code: '+31'  },
  { name: 'New Zealand',          flag: '🇳🇿', code: '+64'  },
  { name: 'Nicaragua',            flag: '🇳🇮', code: '+505' },
  { name: 'Niger',                flag: '🇳🇪', code: '+227' },
  { name: 'Nigeria',              flag: '🇳🇬', code: '+234' },
  { name: 'North Macedonia',      flag: '🇲🇰', code: '+389' },
  { name: 'Norway',               flag: '🇳🇴', code: '+47'  },
  { name: 'Oman',                 flag: '🇴🇲', code: '+968' },
  { name: 'Pakistan',             flag: '🇵🇰', code: '+92'  },
  { name: 'Palau',                flag: '🇵🇼', code: '+680' },
  { name: 'Palestine',            flag: '🇵🇸', code: '+970' },
  { name: 'Panama',               flag: '🇵🇦', code: '+507' },
  { name: 'Papua New Guinea',     flag: '🇵🇬', code: '+675' },
  { name: 'Paraguay',             flag: '🇵🇾', code: '+595' },
  { name: 'Peru',                 flag: '🇵🇪', code: '+51'  },
  { name: 'Philippines',          flag: '🇵🇭', code: '+63'  },
  { name: 'Poland',               flag: '🇵🇱', code: '+48'  },
  { name: 'Portugal',             flag: '🇵🇹', code: '+351' },
  { name: 'Qatar',                flag: '🇶🇦', code: '+974' },
  { name: 'Romania',              flag: '🇷🇴', code: '+40'  },
  { name: 'Russia',               flag: '🇷🇺', code: '+7'   },
  { name: 'Rwanda',               flag: '🇷🇼', code: '+250' },
  { name: 'Saint Kitts & Nevis',  flag: '🇰🇳', code: '+1869'},
  { name: 'Saint Lucia',          flag: '🇱🇨', code: '+1758'},
  { name: 'Saint Vincent',        flag: '🇻🇨', code: '+1784'},
  { name: 'Samoa',                flag: '🇼🇸', code: '+685' },
  { name: 'San Marino',           flag: '🇸🇲', code: '+378' },
  { name: 'São Tomé & Príncipe',  flag: '🇸🇹', code: '+239' },
  { name: 'Saudi Arabia',         flag: '🇸🇦', code: '+966' },
  { name: 'Senegal',              flag: '🇸🇳', code: '+221' },
  { name: 'Serbia',               flag: '🇷🇸', code: '+381' },
  { name: 'Seychelles',           flag: '🇸🇨', code: '+248' },
  { name: 'Sierra Leone',         flag: '🇸🇱', code: '+232' },
  { name: 'Singapore',            flag: '🇸🇬', code: '+65'  },
  { name: 'Slovakia',             flag: '🇸🇰', code: '+421' },
  { name: 'Slovenia',             flag: '🇸🇮', code: '+386' },
  { name: 'Solomon Islands',      flag: '🇸🇧', code: '+677' },
  { name: 'Somalia',              flag: '🇸🇴', code: '+252' },
  { name: 'South Africa',         flag: '🇿🇦', code: '+27'  },
  { name: 'South Sudan',          flag: '🇸🇸', code: '+211' },
  { name: 'Spain',                flag: '🇪🇸', code: '+34'  },
  { name: 'Sri Lanka',            flag: '🇱🇰', code: '+94'  },
  { name: 'Sudan',                flag: '🇸🇩', code: '+249' },
  { name: 'Suriname',             flag: '🇸🇷', code: '+597' },
  { name: 'Sweden',               flag: '🇸🇪', code: '+46'  },
  { name: 'Switzerland',          flag: '🇨🇭', code: '+41'  },
  { name: 'Syria',                flag: '🇸🇾', code: '+963' },
  { name: 'Taiwan',               flag: '🇹🇼', code: '+886' },
  { name: 'Tajikistan',           flag: '🇹🇯', code: '+992' },
  { name: 'Tanzania',             flag: '🇹🇿', code: '+255' },
  { name: 'Thailand',             flag: '🇹🇭', code: '+66'  },
  { name: 'Timor-Leste',          flag: '🇹🇱', code: '+670' },
  { name: 'Togo',                 flag: '🇹🇬', code: '+228' },
  { name: 'Tonga',                flag: '🇹🇴', code: '+676' },
  { name: 'Trinidad & Tobago',    flag: '🇹🇹', code: '+1868'},
  { name: 'Tunisia',              flag: '🇹🇳', code: '+216' },
  { name: 'Turkey',               flag: '🇹🇷', code: '+90'  },
  { name: 'Turkmenistan',         flag: '🇹🇲', code: '+993' },
  { name: 'Tuvalu',               flag: '🇹🇻', code: '+688' },
  { name: 'Uganda',               flag: '🇺🇬', code: '+256' },
  { name: 'Ukraine',              flag: '🇺🇦', code: '+380' },
  { name: 'United Arab Emirates', flag: '🇦🇪', code: '+971' },
  { name: 'United Kingdom',       flag: '🇬🇧', code: '+44'  },
  { name: 'United States',        flag: '🇺🇸', code: '+1'   },
  { name: 'Uruguay',              flag: '🇺🇾', code: '+598' },
  { name: 'Uzbekistan',           flag: '🇺🇿', code: '+998' },
  { name: 'Vanuatu',              flag: '🇻🇺', code: '+678' },
  { name: 'Venezuela',            flag: '🇻🇪', code: '+58'  },
  { name: 'Vietnam',              flag: '🇻🇳', code: '+84'  },
  { name: 'Yemen',                flag: '🇾🇪', code: '+967' },
  { name: 'Zambia',               flag: '🇿🇲', code: '+260' },
  { name: 'Zimbabwe',             flag: '🇿🇼', code: '+263' },
];

document.addEventListener('DOMContentLoaded', () => {
  setMinDeparture();
  loadZones();
  initPhoneCodeSelector();
  initPlatePrefixSelector();
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

function initPhoneCodeSelector() {
  const btn      = document.getElementById('phone-code-btn');
  const dropdown = document.getElementById('phone-dropdown');
  const search   = document.getElementById('phone-search');
  const list     = document.getElementById('phone-list');

  renderList(COUNTRIES);

  btn.addEventListener('click', e => {
    e.stopPropagation();
    dropdown.classList.contains('open') ? closeDropdown() : openDropdown();
  });

  search.addEventListener('input', () => {
    const q = search.value.toLowerCase();
    renderList(COUNTRIES.filter(c =>
      c.name.toLowerCase().includes(q) || c.code.includes(q)
    ));
  });

  document.addEventListener('click', e => {
    if (!btn.closest('.phone-input-wrap').contains(e.target)) closeDropdown();
  });

  function openDropdown() {
    dropdown.classList.add('open');
    btn.classList.add('open');
    search.value = '';
    renderList(COUNTRIES);
    requestAnimationFrame(() => {
      search.focus();
      const active = list.querySelector('li.active');
      if (active) active.scrollIntoView({ block: 'nearest' });
    });
  }

  function closeDropdown() {
    dropdown.classList.remove('open');
    btn.classList.remove('open');
  }

  function renderList(countries) {
    list.innerHTML = '';
    countries.forEach(c => {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      if (c.code === selectedDialCode) li.classList.add('active');
      li.innerHTML = `<span class="pl-flag">${c.flag}</span><span class="pl-name">${c.name}</span><span class="pl-code">${c.code}</span>`;
      li.addEventListener('click', () => { selectCountry(c); closeDropdown(); });
      list.appendChild(li);
    });
  }
}

function selectCountry(country) {
  selectedDialCode = country.code;
  document.getElementById('phone-flag').textContent         = country.flag;
  document.getElementById('phone-code-display').textContent = country.code;
}

function initPlatePrefixSelector() {
  const btn      = document.getElementById('plate-prefix-btn');
  const dropdown = document.getElementById('plate-prefix-dropdown');
  const list     = document.getElementById('plate-prefix-list');

  renderPrefixList();

  btn.addEventListener('click', e => {
    e.stopPropagation();
    dropdown.classList.contains('open') ? closePrefixDropdown() : openPrefixDropdown();
  });

  document.addEventListener('click', e => {
    if (!btn.closest('.phone-input-wrap').contains(e.target)) closePrefixDropdown();
  });

  function openPrefixDropdown() {
    dropdown.classList.add('open');
    btn.classList.add('open');
  }

  function closePrefixDropdown() {
    dropdown.classList.remove('open');
    btn.classList.remove('open');
  }

  function renderPrefixList() {
    list.innerHTML = '';
    PLATE_PREFIXES.forEach(letter => {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.textContent = letter;
      if (letter === selectedPlatePrefix) li.classList.add('active');
      li.addEventListener('click', () => { selectPrefix(letter); closePrefixDropdown(); });
      list.appendChild(li);
    });
  }
}

function selectPrefix(letter) {
  selectedPlatePrefix = letter;
  document.getElementById('plate-prefix-display').textContent = letter;
  document.querySelectorAll('#plate-prefix-list li').forEach(li => {
    li.classList.toggle('active', li.textContent === letter);
  });
}

async function handleSubmit(e) {
  e.preventDefault();
  clearMessage();

  const btn = document.getElementById('submit-btn');
  btn.disabled    = true;
  btn.textContent = 'Registering...';

  const studentName   = document.getElementById('student_name').value.trim();
  const studentId     = document.getElementById('student_id').value.trim();
  const localNumber   = document.getElementById('phone_number').value.trim();
  const phoneNumber   = selectedDialCode + localNumber;
  const localPlate    = document.getElementById('plate_number').value.trim().toUpperCase();
  const plateNumber   = selectedPlatePrefix + ' ' + localPlate;
  const zoneSelect    = document.getElementById('zone');
  const zoneId        = parseInt(zoneSelect.value);
  const spotNumber    = parseInt(document.getElementById('spot_number').value);
  const departureTime = document.getElementById('departure_time').value;

  // ── Client-side validation ──────────────────────────────────────
  if (!studentName || !studentId || !localNumber || !localPlate || !zoneId || !spotNumber || !departureTime) {
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

  localStorage.setItem('student_name',   studentName);
  localStorage.setItem('student_id',     studentId);
  localStorage.setItem('phone_code',     selectedDialCode);
  localStorage.setItem('phone_number',   localNumber);
  localStorage.setItem('plate_prefix',   selectedPlatePrefix);
  localStorage.setItem('plate_number',   localPlate);

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
  if (!fields.some(f => localStorage.getItem(f)) &&
      !localStorage.getItem('phone_code') &&
      !localStorage.getItem('plate_prefix')) return;

  fields.forEach(f => {
    const val = localStorage.getItem(f);
    if (val) document.getElementById(f).value = val;
  });

  const savedCode = localStorage.getItem('phone_code');
  if (savedCode) {
    const country = COUNTRIES.find(c => c.code === savedCode);
    if (country) selectCountry(country);
  }

  const savedPrefix = localStorage.getItem('plate_prefix');
  if (savedPrefix && PLATE_PREFIXES.includes(savedPrefix)) {
    selectPrefix(savedPrefix);
  }
}

function clearSavedInfo() {
  ['student_name', 'student_id', 'phone_number', 'plate_number', 'phone_code', 'plate_prefix'].forEach(f => {
    localStorage.removeItem(f);
  });
  ['student_name', 'student_id', 'phone_number', 'plate_number'].forEach(f => {
    document.getElementById(f).value = '';
  });
  selectCountry(COUNTRIES[0]);
  selectPrefix('B');
}
