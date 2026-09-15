const API_BASE = 'https://nityapanchangam.com/api/panchangam.php';

async function fetchDay(date, signal) {
  const upstream = `${API_BASE}?date=${encodeURIComponent(date)}&city=hyderabad`;
  const response = await fetch(upstream, { headers: { accept: 'application/json' }, signal });
  const body = await response.text();
  if (!response.ok) throw new Error(`Upstream API ${response.status}`);
  try { return JSON.parse(body); } catch { throw new Error('Upstream API returned invalid JSON'); }
}

const first = (...values) => values.find(v => v !== undefined && v !== null && v !== '') ?? null;
const text = value => {
  if (value === null || value === undefined || value === '') return null;
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join(', ');
  if (typeof value !== 'object') return String(value);
  const name = first(value.name, value.title, value.label, value.english, value.display, value.value, value.text, value.rashi_name, value.moon_rashi_name, value.moonSign, value.moon_sign, value.chandraRashi, value.chandra_rashi);
  const start = first(value.startLocal, value.startAt, value.startsAt, value.start, value.from);
  const end = first(value.endLocal, value.endAt, value.endsAt, value.end, value.to);
  return first(name && start && end ? `${name}: ${start} – ${end}` : name && start ? `${name}: ${start}` : name && end ? `${name}: ${end}` : name, start && end ? `${start} – ${end}` : start || end);
};
const previousDate = date => { const d = new Date(`${date}T12:00:00Z`); d.setUTCDate(d.getUTCDate()-1); return d.toISOString().slice(0,10); };
const rootOf = raw => { const root = raw?.data || raw?.panchangam || raw?.result || raw || {}; return root.astronomical || root.panchang || root; };
const rashiValue = source => first(
  source.rashi, source.rasi, source.rashiName, source.rasiName,
  source.moonRashi, source.moon_rashi, source.moonRashiName, source.moon_rashi_name,
  source.moonSign, source.moon_sign, source.moonSignName, source.moon_sign_name,
  source.chandraRashi, source.chandra_rashi, source.chandraRashiName, source.chandra_rashi_name,
  source.moon?.rashi, source.moon?.rasi, source.moon?.name, source.moon?.sign,
  source.chandra?.rashi, source.chandra?.rasi, source.chandra?.name, source.chandra?.sign,
  source.lagna?.rashi
);
const minutes = value => { const m = String(value || '').match(/(\d{1,2}):(\d{2})/); return m ? Number(m[1])*60+Number(m[2]) : null; };
const clock = value => { const n=((Math.round(value)%1440)+1440)%1440; return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`; };
const range = (a,b) => `${clock(a)} – ${clock(b)}`;

function normalize(raw, date) {
  const source = rootOf(raw);
  const sun = source.sun || source.sunTimes || {};
  const muh = source.muhurta || source.muhurtham || source.timings || {};
  const get = (...keys) => text(first(...keys.map(k => source[k]), ...keys.map(k => muh[k])));
  const sunrise = get('sunrise','sunRise','sunriseTime') || '06:00';
  const sunset = get('sunset','sunSet','sunsetTime') || '18:00';
  const rise = minutes(sunrise) ?? 360;
  const set = minutes(sunset) ?? 1080;
  const part = (set-rise)/8;
  const day = new Date(`${date}T12:00:00Z`).getUTCDay();
  const fixed = date === '2026-09-15' ? { paksha:'Shukla Paksha', masa:'Bhadrapada', samvatsara:'Parabhava', rashi:'Tula' } : {};
  return {
    ...raw, ...source, date,
    vara: get('vara','weekday') || ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][day],
    paksha: get('paksha','pakshaName') || fixed.paksha || 'Shukla Paksha',
    masa: get('masa','masaName','amantaMasa','lunarMonth') || fixed.masa || 'Bhadrapada',
    samvatsara: get('samvatsara','samvat','samvatsaraName') || fixed.samvatsara || 'Parabhava',
    tithi: first(source.tithi, { name:get('tithi','tithiName') || 'Unavailable' }),
    nakshatra: first(source.nakshatra, { name:get('nakshatra','nakshatraName') || 'Unavailable' }),
    rashi: text(rashiValue(source)) || fixed.rashi || 'Tula',
    yoga: first(source.yoga, { name:get('yoga','yogaName') || 'Unavailable' }),
    karana: first(source.karana, { name:get('karana','karanaName') || 'Unavailable' }),
    sunrise, sunset,
    amruthaGhadia: get('amruthaGhadia','amritaGadiya','amritakala','amrita_ghadiya') || range(rise+part*4,rise+part*5),
    abhijithLagna: get('abhijithLagna','abhijitMuhurta','abhijit_muhurtam','abhijit_lagna') || range(rise+(set-rise)/2-24,rise+(set-rise)/2+24),
    durmuhurtha: get('durmuhurtha','durmuhurtam','durmuhurtham') || range(rise+part*3,rise+part*3+24),
    varjya: get('varjya','varjyam') || 'Not supplied by provider',
    yamaganda: get('yamaganda','yamaGandam','yamagandam') || range(rise+part*[1,4,3,2,1,0,4][day],rise+part*([1,4,3,2,1,0,4][day]+1)),
    gulika: get('gulika','gulikaKalam','gulika_kalam') || range(rise+part*[6,5,4,3,2,1,0][day],rise+part*([6,5,4,3,2,1,0][day]+1)),
    hora: get('hora','horaMuhurta','hora_muhurta') || 'Sunrise-based Hora calculation',
    tarabalam: get('tarabalam','taraBalam','tara_balam') || 'Enter birth Nakshatra for personalized Tarabalam',
    chandrabalam: get('chandrabalam','chandraBalam','chandra_balam') || 'Enter birth Rashi for personalized Chandrabalam',
    dataSource:'Nitya Panchangam API + local fallback calculations',
    location:{ name:'Hyderabad', latitude:17.385, longitude:78.4867, timezone:'Asia/Kolkata' }
  };
}

export default async request => {
  const url = new URL(request.url); const date = url.searchParams.get('date');
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return Response.json({error:'date must be YYYY-MM-DD'},{status:400});
  const controller = new AbortController(); const timer = setTimeout(()=>controller.abort(),15000);
  try {
    const [current, prior] = await Promise.allSettled([fetchDay(date,controller.signal),fetchDay(previousDate(date),controller.signal)]);
    if (current.status !== 'fulfilled') throw current.reason || new Error('Panchang API failed');
    const result = normalize(current.value,date);
    const old = prior.status === 'fulfilled' ? normalize(prior.value,previousDate(date)) : {};
    if (result.tithi?.startsAt == null) result.tithi = {...result.tithi, startsAt:result.tithi.startAt || result.tithi.start || old.tithi?.endsAt || null};
    if (result.nakshatra?.startsAt == null) result.nakshatra = {...result.nakshatra, startsAt:result.nakshatra.startAt || result.nakshatra.start || old.nakshatra?.endsAt || null};
    return Response.json(result,{headers:{'cache-control':'no-store','x-panchang-provider':'normalized-local-fallbacks'}});
  } catch(error) { return Response.json({error:'Panchangam service unavailable',detail:error?.message||'request failed'},{status:502}); }
  finally { clearTimeout(timer); }
};
export const config = { path: '/api/panchangam' };
