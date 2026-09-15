const API_BASE = 'https://telugupanchangam.app/api/panchangam';

async function fetchDay(date, lat, lng, signal) {
  const upstream = `${API_BASE}?date=${encodeURIComponent(date)}&lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`;
  const response = await fetch(upstream, { headers: { accept: 'application/json' }, signal });
  const body = await response.text();
  if (!response.ok) throw new Error(`Upstream API ${response.status}`);
  try { return JSON.parse(body); } catch { throw new Error('Upstream API returned invalid JSON'); }
}

function previousDateOf(date) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() - 1);
  return value.toISOString().slice(0, 10);
}

function minutes(value) {
  if (typeof value !== 'string') return null;
  const match = value.match(/(\d{1,2}):(\d{2})/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

function clock(total) {
  total = ((Math.round(total) % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function range(start, end) { return `${clock(start)} – ${clock(end)}`; }

function enrichTimings(payload) {
  const root = payload?.data || payload?.panchangam || payload?.result || payload || {};
  const source = root.astronomical || root;
  const sunrise = source.sunrise || source.sunRise || source.sunriseTime || '06:00';
  const sunset = source.sunset || source.sunSet || source.sunsetTime || '18:00';
  const rise = minutes(String(sunrise)) ?? 360;
  const set = minutes(String(sunset)) ?? 1080;
  const dayPart = (set - rise) / 8;
  const nightPart = (1440 - set + rise) / 8;
  const weekday = new Date(`${payload?.date || ''}T12:00:00Z`).getUTCDay();
  const existing = (name, ...aliases) => aliases.reduce((found, key) => found ?? source[key] ?? root[key], source[name] ?? root[name]);
  const timing = (value, fallback) => value || fallback;
  return {
    ...payload,
    sunrise,
    sunset,
    amruthaGhadia: timing(existing('amruthaGhadia', 'amritaGadiya', 'amritakala', 'amrita_ghadiya'), range(rise + dayPart * 4, rise + dayPart * 5)),
    abhijithLagna: timing(existing('abhijithLagna', 'abhijitMuhurta', 'abhijit_lagna'), range(rise + (set - rise) * 0.5 - 24, rise + (set - rise) * 0.5 + 24)),
    durmuhurtha: timing(existing('durmuhurtha', 'durmuhurtam', 'durmuhurtham'), range(rise + dayPart * 3, rise + dayPart * 3 + 24)),
    varjya: timing(existing('varjya', 'varjyam'), 'Not available from provider'),
    yamaganda: timing(existing('yamaganda', 'yamaGandam', 'yamagandam'), range(rise + dayPart * ([1, 4, 3, 2, 1, 0, 4][weekday]), rise + dayPart * ([1, 4, 3, 2, 1, 0, 4][weekday] + 1))),
    gulika: timing(existing('gulika', 'gulikaKalam', 'gulika_kalam'), range(rise + dayPart * ([6, 5, 4, 3, 2, 1, 0][weekday]), rise + dayPart * ([6, 5, 4, 3, 2, 1, 0][weekday] + 1))),
    hora: timing(existing('hora', 'horaMuhurta', 'hora_muhurta'), 'Calculated from sunrise/sunset divisions'),
    tarabalam: timing(existing('tarabalam', 'taraBalam', 'tara_balam'), 'Enter birth Nakshatra for personalized Tarabalam'),
    chandrabalam: timing(existing('chandrabalam', 'chandraBalam', 'chandra_balam'), 'Enter birth Rashi for personalized Chandrabalam')
  };
}

function mergeBoundaryTimes(current, prior) {
  const source = current || {};
  const previous = prior || {};
  const tithi = source.tithi || {};
  const nakshatra = source.nakshatra || {};
  const priorTithi = previous.tithi || {};
  const priorNakshatra = previous.nakshatra || {};
  return {
    ...source,
    tithi: { ...tithi, startsAt: tithi.startsAt || tithi.startAt || tithi.start || priorTithi.endsAt || priorTithi.endAt || priorTithi.end || null, endsAt: tithi.endsAt || tithi.endAt || tithi.end || null },
    nakshatra: { ...nakshatra, startsAt: nakshatra.startsAt || nakshatra.startAt || nakshatra.start || priorNakshatra.endsAt || priorNakshatra.endAt || priorNakshatra.end || null, endsAt: nakshatra.endsAt || nakshatra.endAt || nakshatra.end || null }
  };
}

export default async (request) => {
  const url = new URL(request.url);
  const date = url.searchParams.get('date');
  const lat = url.searchParams.get('lat') || '17.385';
  const lng = url.searchParams.get('lng') || '78.4867';
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return Response.json({ error: 'date must be YYYY-MM-DD' }, { status: 400 });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const [currentResult, priorResult] = await Promise.allSettled([fetchDay(date, lat, lng, controller.signal), fetchDay(previousDateOf(date), lat, lng, controller.signal)]);
    if (currentResult.status !== 'fulfilled') throw currentResult.reason || new Error('Current-day Panchangam request failed');
    const current = enrichTimings(mergeBoundaryTimes(currentResult.value, priorResult.status === 'fulfilled' ? priorResult.value : null));
    return Response.json(current, { headers: { 'cache-control': 'no-store', 'x-panchang-provider': 'telugupanchangam.app-plus-local-fallbacks' } });
  } catch (error) {
    return Response.json({ error: 'Panchangam service unavailable', detail: error?.name === 'AbortError' ? 'request timed out' : error?.message || 'request failed' }, { status: 502 });
  } finally { clearTimeout(timer); }
};

export const config = { path: '/api/panchangam' };
