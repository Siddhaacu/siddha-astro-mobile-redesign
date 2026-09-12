const API_BASE = 'https://telugupanchangam.app/api/panchangam';

async function fetchDay(date, lat, lng, signal) {
  const upstream = `${API_BASE}?date=${encodeURIComponent(date)}&lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&tz=Asia%2FKolkata`;
  const response = await fetch(upstream, { headers: { accept: 'application/json' }, signal });
  const text = await response.text();
  if (!response.ok) throw new Error(`Upstream API ${response.status}`);
  return JSON.parse(text);
}

export default async (request) => {
  const url = new URL(request.url);
  const date = url.searchParams.get('date');
  const lat = url.searchParams.get('lat') || '17.385';
  const lng = url.searchParams.get('lng') || '78.4867';
  if (!date) return Response.json({ error: 'date is required' }, { status: 400 });

  const previous = new Date(`${date}T12:00:00Z`);
  previous.setUTCDate(previous.getUTCDate() - 1);
  const previousDate = previous.toISOString().slice(0, 10);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const [current, prior] = await Promise.all([
      fetchDay(date, lat, lng, controller.signal),
      fetchDay(previousDate, lat, lng, controller.signal)
    ]);
    const tithi = current.tithi || {};
    const nakshatra = current.nakshatra || {};
    const priorTithi = prior.tithi || {};
    const priorNakshatra = prior.nakshatra || {};
    const merged = {
      ...current,
      tithi: {
        ...tithi,
        startsAt: tithi.startsAt || tithi.startAt || priorTithi.endsAt || priorTithi.endAt || null,
        endsAt: tithi.endsAt || tithi.endAt || null
      },
      nakshatra: {
        ...nakshatra,
        startsAt: nakshatra.startsAt || nakshatra.startAt || priorNakshatra.endsAt || priorNakshatra.endAt || null,
        endsAt: nakshatra.endsAt || nakshatra.endAt || null
      }
    };
    return Response.json(merged, {
      headers: {
        'cache-control': 'public, max-age=300',
        'x-panchang-provider': 'telugupanchangam.app'
      }
    });
  } catch (error) {
    return Response.json({ error: 'Panchangam service unavailable', detail: error?.message || 'request failed' }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
};

export const config = { path: '/api/panchangam' };
