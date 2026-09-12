const API_BASE = 'https://telugupanchangam.app/api/panchangam';

async function fetchDay(date, lat, lng, signal) {
  const upstream = `${API_BASE}?date=${encodeURIComponent(date)}&lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&tz=Asia%2FKolkata`;
  const response = await fetch(upstream, {
    headers: { accept: 'application/json' },
    signal
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`Upstream API ${response.status}`);
  try {
    return JSON.parse(body);
  } catch {
    throw new Error('Upstream API returned invalid JSON');
  }
}

function previousDateOf(date) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() - 1);
  return value.toISOString().slice(0, 10);
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
    tithi: {
      ...tithi,
      startsAt: tithi.startsAt || tithi.startAt || tithi.start ||
        priorTithi.endsAt || priorTithi.endAt || priorTithi.end || null,
      endsAt: tithi.endsAt || tithi.endAt || tithi.end || null
    },
    nakshatra: {
      ...nakshatra,
      startsAt: nakshatra.startsAt || nakshatra.startAt || nakshatra.start ||
        priorNakshatra.endsAt || priorNakshatra.endAt || priorNakshatra.end || null,
      endsAt: nakshatra.endsAt || nakshatra.endAt || nakshatra.end || null
    }
  };
}

export default async (request) => {
  const url = new URL(request.url);
  const date = url.searchParams.get('date');
  const lat = url.searchParams.get('lat') || '17.385';
  const lng = url.searchParams.get('lng') || '78.4867';

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: 'date must be YYYY-MM-DD' }, { status: 400 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const [currentResult, priorResult] = await Promise.allSettled([
      fetchDay(date, lat, lng, controller.signal),
      fetchDay(previousDateOf(date), lat, lng, controller.signal)
    ]);

    if (currentResult.status !== 'fulfilled') {
      throw currentResult.reason || new Error('Current-day Panchangam request failed');
    }

    const current = currentResult.value;
    const prior = priorResult.status === 'fulfilled' ? priorResult.value : null;
    const merged = mergeBoundaryTimes(current, prior);

    return Response.json(merged, {
      headers: {
        'cache-control': 'public, max-age=300',
        'x-panchang-provider': 'telugupanchangam.app'
      }
    });
  } catch (error) {
    return Response.json({
      error: 'Panchangam service unavailable',
      detail: error?.name === 'AbortError' ? 'request timed out' : error?.message || 'request failed'
    }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
};

export const config = { path: '/api/panchangam' };
