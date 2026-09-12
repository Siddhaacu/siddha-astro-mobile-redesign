const API_BASE = 'https://nityapanchangam.com/api/panchangam.php';

export default async (request) => {
  const url = new URL(request.url);
  const date = url.searchParams.get('date');
  const lat = url.searchParams.get('lat') || '17.385';
  const lng = url.searchParams.get('lng') || '78.4867';
  if (!date) return Response.json({ error: 'date is required' }, { status: 400 });

  const upstream = `${API_BASE}?date=${encodeURIComponent(date)}&lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(upstream, { headers: { accept: 'application/json' }, signal: controller.signal });
    const text = await response.text();
    if (!response.ok) return Response.json({ error: `Upstream API ${response.status}` }, { status: 502 });
    try {
      return Response.json(JSON.parse(text), { headers: { 'cache-control': 'public, max-age=300' } });
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
