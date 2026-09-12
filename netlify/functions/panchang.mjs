const API_BASE = 'https://telugupanchangam.app/api/panchangam';

export default async (request) => {
  const url = new URL(request.url);
  const date = url.searchParams.get('date');
  const lat = url.searchParams.get('lat') || '17.385';
  const lng = url.searchParams.get('lng') || '78.4867';
  if (!date) return Response.json({ error: 'date is required' }, { status: 400 });

  const upstream = `${API_BASE}?date=${encodeURIComponent(date)}&lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&tz=Asia%2FKolkata`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(upstream, {
      headers: { accept: 'application/json' },
      signal: controller.signal
    });
    const text = await response.text();
    if (!response.ok) return Response.json({ error: `Upstream API ${response.status}` }, { status: 502 });
    try {
      const data = JSON.parse(text);
      return Response.json(data, {
        headers: {
          'cache-control': 'public, max-age=300',
          'x-panchang-provider': 'telugupanchangam.app'
        }
      });
    } catch {
      return Response.json({ error: 'Upstream returned invalid JSON' }, { status: 502 });
    }
  } catch (error) {
    return Response.json({ error: 'Panchangam service unavailable', detail: error?.message || 'request failed' }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
};

export const config = { path: '/api/panchangam' };
