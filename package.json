// ── CONFIG ──
const API = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

// ── CONSTANTS ──
const DAYS = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
const DS = ['So','Mo','Di','Mi','Do','Fr','Sa'];
const MONTHS = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
const WM = {0:['☀️','Strahlend sonnig',true,false],1:['🌤️','Leicht bewölkt',true,false],2:['⛅','Wechselnd bewölkt',true,false],3:['☁️','Bedeckt',true,false],45:['🌫️','Nebelig',false,true],51:['🌦️','Nieselregen',false,true],61:['🌧️','Regen',false,true],63:['🌧️','Regen',false,true],65:['🌧️','Starkregen',false,true],71:['🌨️','Schnee',false,true],73:['❄️','Schneefall',false,true],80:['🌦️','Schauer',false,true],81:['🌧️','Schauer',false,true],95:['⛈️','Gewitter',false,true]};
const BANDS = {natur:'bn',kultur:'bk',sport:'bs',kreativ:'br',event:'be',ausflug:'ba',camping:'bc'};

// ── STATE ──
let selDate = new Date(), radius = 50, activities = [], wdata = {}, tab = 'today';
let calM = new Date(selDate.getFullYear(), selDate.getMonth(), 1);
let ageAll = true, ageFrom = 4, ageTo = 8;
let af = { cat:'alle', kostenlos:false, bezahlt:false, outdoor:false, indoor:false };

// ── UTILS ──
const fmt = d => `${DAYS[d.getDay()]}, ${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
const fmts = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const season = m => [2,3,4].includes(m)?'Frühling':[5,6,7].includes(m)?'Sommer':[8,9,10].includes(m)?'Herbst':'Winter';

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ── INIT ──
document.getElementById('date-pill').textContent = `📅 ${fmt(selDate)}`;
setupFilters();
setupRadius();
setupAge();
setupTabs();
loadWeather();

// ── WEATHER ──
async function loadWeather() {
  try {
    const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=51.05&longitude=13.74&current=temperature_2m,weathercode&daily=weathercode,temperature_2m_max&timezone=Europe/Berlin&forecast_days=14');
    const d = await r.json();
    const [ic,dc,ou,in2] = WM[d.current.weathercode] || ['🌤️','Wechselhaft',true,false];
    wdata['cur'] = { icon:ic, desc:dc, temp:Math.round(d.current.temperature_2m), outdoor:ou, indoor:in2 };
    d.daily.time.forEach((ds,i) => {
      const [wi,wd,wo,wi2] = WM[d.daily.weathercode[i]] || ['🌤️','Wechselhaft',true,false];
      wdata[ds] = { icon:wi, desc:wd, temp:Math.round(d.daily.temperature_2m_max[i]), outdoor:wo, indoor:wi2 };
    });
    updWBar(wdata['cur']);
  } catch(e) {
    document.getElementById('w-desc').textContent = 'Wetter nicht verfügbar';
  }
  buildWeek();
}

function updWBar(w) {
  document.getElementById('w-icon').textContent = w.icon;
  document.getElementById('w-desc').textContent = `${w.desc} – ${w.temp}°C in Dresden`;
  document.getElementById('w-detail').textContent = w.outdoor && !w.indoor
    ? 'Perfekt für draußen! Raus mit euch.'
    : (!w.outdoor || w.indoor ? 'Drinnen-Tag – Museum & Kreativangebote.' : 'Wechselhaft – Indoor-Alternative bereithalten.');
  const b = document.getElementById('w-badge');
  if (w.outdoor && !w.indoor) { b.textContent='☀️ Draußen-Tag'; b.className='w-badge w-out'; }
  else if (!w.outdoor || w.indoor) { b.textContent='🏠 Drinnen-Tag'; b.className='w-badge w-in'; }
  else { b.textContent='🌤️ Gemischt'; b.className='w-badge w-mix'; }
}

// ── WEEK STRIP ──
function buildWeek() {
  const s = document.getElementById('week-strip'); s.innerHTML = '';
  const t = new Date(); t.setHours(0,0,0,0);
  for (let i = 0; i < 14; i++) {
    const d = new Date(t); d.setDate(t.getDate() + i);
    const ds = fmts(d); const wd = wdata[ds] || {};
    const c = document.createElement('div');
    c.className = 'day-chip' + (i===0 ? ' active' : '');
    c.innerHTML = `<div class="dc-name">${DS[d.getDay()]}</div><div class="dc-date">${d.getDate()}.</div><div class="dc-wi">${wd.icon||'🌤️'}</div><div class="dc-temp">${wd.temp!==undefined?wd.temp+'°':'–'}</div>`;
    c.addEventListener('click', () => {
      document.querySelectorAll('.day-chip').forEach(x => x.classList.remove('active'));
      c.classList.add('active'); selDate = d;
      document.getElementById('date-pill').textContent = `📅 ${fmt(d)}`;
      if (wdata[ds]) updWBar(wdata[ds]);
      if (tab === 'today') { activities = []; renderActs(); }
    });
    s.appendChild(c);
  }
}

// ── TABS ──
function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active'); tab = b.dataset.tab;
      document.getElementById('today-view').style.display = tab==='today' ? 'block' : 'none';
      document.getElementById('month-view').style.display = tab==='month' ? 'block' : 'none';
      document.getElementById('partner-view').style.display = tab==='partner' ? 'block' : 'none';
      document.getElementById('filter-panel').style.display = tab==='today' ? 'block' : 'none';
      document.getElementById('gen-wrap').style.display = tab==='today' ? 'block' : 'none';
      if (tab === 'month') buildCal();
    });
  });
}

// ── FILTERS ──
function setupFilters() {
  document.querySelectorAll('[data-cat]').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('[data-cat]').forEach(x => x.classList.remove('on'));
      b.classList.add('on'); af.cat = b.dataset.cat; renderActs();
    });
  });
  document.querySelectorAll('[data-x]').forEach(b => {
    b.addEventListener('click', () => {
      b.classList.toggle('on'); af[b.dataset.x] = b.classList.contains('on'); renderActs();
    });
  });
}

// ── AGE ──
function setupAge() {
  document.getElementById('age-from').addEventListener('change', () => {
    ageFrom = +document.getElementById('age-from').value;
    ageAll = false; document.getElementById('age-all-btn').classList.remove('on');
    updAgePrev(); renderActs();
  });
  document.getElementById('age-to').addEventListener('change', () => {
    ageTo = +document.getElementById('age-to').value;
    ageAll = false; document.getElementById('age-all-btn').classList.remove('on');
    updAgePrev(); renderActs();
  });
  updAgePrev();
}

function toggleAgeAll() {
  ageAll = !ageAll;
  document.getElementById('age-all-btn').classList.toggle('on', ageAll);
  updAgePrev(); renderActs();
}

function updAgePrev() {
  const t = ageAll ? 'Alle Altersgruppen' : `${ageFrom}–${ageTo} Jahre`;
  document.getElementById('age-prev').textContent = t;
  document.getElementById('age-pill').textContent = ageAll ? '👧 Alle Alter' : `👧 ${ageFrom}–${ageTo} J.`;
}

// ── RADIUS ──
function setupRadius() {
  const sl = document.getElementById('rad-slider');
  function updRad() {
    const p = (sl.value / 200) * 100;
    sl.style.setProperty('--pct', p + '%');
    radius = +sl.value;
    document.getElementById('rad-val').textContent = radius === 0 ? 'Dresden' : radius + ' km';
  }
  sl.addEventListener('input', () => {
    updRad();
    document.querySelectorAll('.rm').forEach(r => r.classList.remove('on'));
    const cl = [...document.querySelectorAll('.rm')].reduce((a,b) =>
      Math.abs(+b.dataset.km - radius) < Math.abs(+a.dataset.km - radius) ? b : a);
    cl.classList.add('on');
  });
  document.querySelectorAll('.rm').forEach(r => {
    r.addEventListener('click', () => {
      radius = +r.dataset.km; sl.value = radius; updRad();
      document.querySelectorAll('.rm').forEach(x => x.classList.remove('on'));
      r.classList.add('on');
    });
  });
  updRad();
}

function radDesc(km) {
  if (km===0) return 'ausschließlich in Dresden';
  if (km<=30) return `bis ${km} km (Radebeul, Meißen, Pirna, Moritzburg)`;
  if (km<=60) return `bis ${km} km (Sächsische Schweiz, Görlitz, Bautzen, Freiberg)`;
  if (km<=100) return `bis ${km} km (Chemnitz, Zwickau, Hoyerswerda, Erzgebirge)`;
  if (km<=130) return `bis ${km} km (Leipzig, Cottbus, Zittau, Spreewald, Lausitzer Seen)`;
  if (km<=160) return `bis ${km} km (Spreewelten Lübbenau, Belantis, Tropical Islands, Halle)`;
  return `bis ${km} km (Berlin, Magdeburg, Wroclaw, Prag)`;
}

function ageDesc() {
  return ageAll ? 'für alle Altersgruppen' : `für Kinder zwischen ${ageFrom} und ${ageTo} Jahren`;
}

// ── GENERATE ──
async function generate() {
  const btn = document.getElementById('gen-btn');
  const loading = document.getElementById('loading');
  const grid = document.getElementById('act-grid');
  btn.disabled = true; btn.textContent = '⏳ Lädt…';
  loading.style.display = 'block'; grid.innerHTML = '';

  const ds = fmts(selDate);
  const wd = wdata[ds] || wdata['cur'] || { icon:'🌤️', desc:'unbekannt', temp:18, outdoor:true, indoor:false };
  document.getElementById('ltxt').textContent = `Suche Ideen ${radius>0 ? 'im '+radius+' km Umkreis' : 'in Dresden'}…`;

  try {
    const resp = await fetch(`${API}/api/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: `${selDate.getDate()}. ${MONTHS[selDate.getMonth()]} ${selDate.getFullYear()}`,
        dayName: DAYS[selDate.getDay()],
        season: season(selDate.getMonth()),
        weather: `${wd.icon} ${wd.desc}, ${wd.temp}°C`,
        isRainy: !wd.outdoor || wd.indoor,
        radiusDesc: radDesc(radius),
        ageDesc: ageDesc()
      })
    });
    if (!resp.ok) { const e = await resp.json(); throw new Error(e.error || resp.status); }
    const data = await resp.json();
    activities = data.activities || [];

    // Inject sponsored partner listings from DB
    try {
      const pr = await fetch(`${API}/api/partners`).then(r => r.json());
      (pr.partners || []).filter(p => p.sponsored && (p.distanceKm || 0) <= radius).forEach(p => {
        activities.push({
          title: p.name, category: 'event', icon: '⭐',
          location: p.location, distanceKm: p.distanceKm || 0, isIndoor: false,
          description: p.description, cost: 'kostenpflichtig', costDetail: p.price || '',
          tip: 'Exklusives Partner-Angebot – nur über FamilienKompass!',
          ageNote: (p.ages || []).join(', ') || 'Alle Alter',
          bookingUrl: p.url, promoCode: p.promoCode, promoLabel: p.promoLabel, sponsored: true
        });
      });
    } catch(e) { /* partners API not critical */ }

    renderActs();
  } catch(e) {
    console.error(e);
    grid.innerHTML = `<div class="empty-state"><div class="eicon">😔</div><h3>Fehler beim Laden</h3><p>${e.message||'Serververbindung prüfen.'}</p></div>`;
  } finally {
    loading.style.display = 'none';
    btn.disabled = false; btn.textContent = '🔄 Neue Ideen laden';
  }
}

// ── RENDER ACTIVITIES ──
function renderActs() {
  const grid = document.getElementById('act-grid');
  if (!activities.length) {
    grid.innerHTML = `<div class="empty-state"><div class="eicon">🗺️</div><h3>Bereit fürs Abenteuer!</h3><p>Klick auf „Ideen laden".</p></div>`;
    return;
  }
  const filtered = activities.filter(a => {
    if (af.cat !== 'alle' && a.category !== af.cat) return false;
    if (af.kostenlos && !af.bezahlt && a.cost !== 'kostenlos') return false;
    if (af.bezahlt && !af.kostenlos && a.cost !== 'kostenpflichtig') return false;
    if (af.outdoor && !af.indoor && a.isIndoor) return false;
    if (af.indoor && !af.outdoor && !a.isIndoor) return false;
    if (a.distanceKm !== undefined && a.distanceKm > radius) return false;
    return true;
  });
  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-state"><div class="eicon">🔍</div><h3>Keine Treffer</h3><p>Filter oder Radius anpassen.</p></div>`;
    return;
  }
  grid.innerHTML = filtered.map(a => `
    <div class="acard ${BANDS[a.category]||'be'}">
      ${a.sponsored ? '<div class="srib">⭐ Partner</div>' : ''}
      <div class="ctop">
        <div class="cem">${a.icon}</div>
        <div>
          <div class="ctitle">${a.title}</div>
          <div class="trow">
            <span class="ctag tloc">📍 ${a.location||''}</span>
            ${(a.distanceKm||0)>0 ? `<span class="ctag tdist">🚗 ${a.distanceKm} km</span>` : ''}
            <span class="ctag ${a.isIndoor?'tin':'tout'}">${a.isIndoor?'🏠 Drinnen':'☀️ Draußen'}</span>
            ${a.ageNote ? `<span class="ctag tage">👧 ${a.ageNote}</span>` : ''}
          </div>
        </div>
      </div>
      <p class="cdesc">${a.description}</p>
      ${a.tip ? `<div class="tipb"><strong>💡</strong> ${a.tip}</div>` : ''}
      ${a.promoCode ? `
        <div class="promob">
          <div>
            <div class="plabel">${a.promoLabel||'Exklusiv-Code'}</div>
            <span class="pcode" onclick="cpCode('${a.promoCode}',this)">${a.promoCode}</span>
            <div class="phint">Klicken zum Kopieren</div>
          </div>
        </div>` : ''}
      <div class="cfoot">
        <span class="cbadge ${a.cost==='kostenlos'?'cbfree':'cbpaid'}">${a.cost==='kostenlos'?'✅':'🎟️'} ${a.costDetail||a.cost}</span>
        ${a.bookingUrl ? `<a class="bbtn" href="${a.bookingUrl}" target="_blank">🎫 Buchen</a>` : ''}
      </div>
    </div>`).join('');
}

// ── CALENDAR ──
function buildCal() {
  document.getElementById('mtitle').textContent = `${MONTHS[calM.getMonth()]} ${calM.getFullYear()}`;
  const g = document.getElementById('cgrid'); g.innerHTML = '';
  DS.forEach(d => { const h=document.createElement('div'); h.className='chead'; h.textContent=d; g.appendChild(h); });
  const today = new Date(); today.setHours(0,0,0,0);
  const first = new Date(calM.getFullYear(), calM.getMonth(), 1);
  const last = new Date(calM.getFullYear(), calM.getMonth()+1, 0);
  for (let i = 0; i < first.getDay(); i++) {
    const p = new Date(first); p.setDate(p.getDate()-(first.getDay()-i)); g.appendChild(mkCell(p,true,today));
  }
  for (let d = 1; d <= last.getDate(); d++) g.appendChild(mkCell(new Date(calM.getFullYear(),calM.getMonth(),d),false,today));
  const ed = last.getDay();
  for (let i = 1; i < 7-ed && ed!==6; i++) { const n=new Date(last); n.setDate(last.getDate()+i); g.appendChild(mkCell(n,true,today)); }
}

function mkCell(date, other, today) {
  const c = document.createElement('div');
  const ds = fmts(date); const wd = wdata[ds];
  const isT = date.toDateString() === today.toDateString();
  c.className = 'ccell' + (other?' cother':'') + (date<today&&!isT?' cpast':'') + (isT?' ctoday':'');
  const dy = document.createElement('div'); dy.className = 'cday';
  if (isT) { const s=document.createElement('span'); s.textContent=date.getDate(); dy.appendChild(s); }
  else dy.textContent = date.getDate();
  c.appendChild(dy);
  const COLS = ['#66BB6A','#7986CB','#FFA726','#F06292','#26C6DA','#AB47BC'];
  const dots = document.createElement('div'); dots.className='cdots';
  COLS.slice(0, 2+Math.floor(Math.random()*4)).forEach(col => {
    const dot=document.createElement('div'); dot.className='cdot'; dot.style.background=col; dots.appendChild(dot);
  });
  c.appendChild(dots);
  if (wd) { const wi=document.createElement('div'); wi.className='cwi'; wi.textContent=wd.icon; c.appendChild(wi); }
  c.addEventListener('click', () => {
    if (other) return;
    document.querySelectorAll('.ccell').forEach(x => x.classList.remove('csel'));
    c.classList.add('csel'); selDate = date;
    document.getElementById('date-pill').textContent = `📅 ${fmt(date)}`;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab==='today'));
    tab = 'today';
    ['today-view','filter-panel','gen-wrap'].forEach(id => document.getElementById(id).style.display='block');
    ['month-view','partner-view'].forEach(id => document.getElementById(id).style.display='none');
    activities = []; generate();
  });
  return c;
}

document.getElementById('prev-m').addEventListener('click', () => { calM=new Date(calM.getFullYear(),calM.getMonth()-1,1); buildCal(); });
document.getElementById('next-m').addEventListener('click', () => { calM=new Date(calM.getFullYear(),calM.getMonth()+1,1); buildCal(); });

// ── PARTNER FORM ──
document.querySelectorAll('.acbl').forEach(l => {
  l.querySelector('input').addEventListener('change', function() { l.classList.toggle('ck', this.checked); });
});

async function submitPartner() {
  const name = document.getElementById('f-name').value.trim();
  const email = document.getElementById('f-email').value.trim();
  const desc = document.getElementById('f-desc').value.trim();
  if (!name || !email || !desc) { alert('Bitte Name, Beschreibung und E-Mail ausfüllen.'); return; }
  const ages = [...document.querySelectorAll('#f-ages input:checked')].map(i => i.value);
  try {
    const r = await fetch(`${API}/api/partners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, email, description: desc,
        category: document.getElementById('f-cat').value,
        location: document.getElementById('f-loc').value,
        distanceKm: parseInt(document.getElementById('f-dist').value) || 0,
        price: document.getElementById('f-price').value,
        url: document.getElementById('f-url').value,
        promoCode: document.getElementById('f-promo').value,
        contact: document.getElementById('f-contact').value,
        ages
      })
    });
    if (r.ok) {
      document.getElementById('pform-fields').style.display = 'none';
      document.querySelector('.sbtn').style.display = 'none';
      document.getElementById('succbox').style.display = 'block';
      toast('✅ Eintrag erfolgreich gesendet!');
    } else {
      const e = await r.json(); alert(e.error || 'Fehler beim Senden.');
    }
  } catch { alert('Verbindungsfehler. Bitte nochmal versuchen.'); }
}

function cpCode(code, el) {
  navigator.clipboard.writeText(code).catch(() => {});
  el.textContent = '✅ Kopiert!';
  setTimeout(() => { el.textContent = code; }, 2000);
  toast(`✅ Code „${code}" kopiert!`);
}
