const API_BASE = 'https://nityapanchangam.com/api/panchangam.php';

async function fetchDay(date, lat, lng, signal) {
  const upstream = `${API_BASE}?date=${encodeURIComponent(date)}&city=hyderabad`;
  const response = await fetch(upstream, { headers: { accept: 'application/json' }, signal });
  const body = await response.text();
  if (!response.ok) throw new Error(`Upstream API ${response.status}`);
  try { return JSON.parse(body); } catch { throw new Error('Upstream API returned invalid JSON'); }
}

function previousDateOf(date) { const d = new Date(`${date}T12:00:00Z`); d.setUTCDate(d.getUTCDate()-1); return d.toISOString().slice(0,10); }
function first(...values) { return values.find(v => v !== undefined && v !== null && v !== '') ?? null; }
function normalize(raw) {
  const root = raw?.data || raw?.panchangam || raw?.result || raw || {};
  const sun = root.sun || root.sunTimes || {};
  const muh = root.muhurta || root.muhurtham || {};
  return {
    ...raw,
    ...root,
    sunrise: first(root.sunrise, sun.sunrise, sun.rise),
    sunset: first(root.sunset, sun.sunset, sun.set),
    yamaganda: first(root.yamaganda, root.yamagandam, muh.yamaganda, muh.yamagandam),
    gulika: first(root.gulika, root.gulikaKalam, muh.gulika, muh.gulikaKalam),
    abhijithLagna: first(root.abhijithLagna, root.abhijitMuhurta, muh.abhijit_muhurtam, muh.abhijitMuhurtham),
    durmuhurtha: first(root.durmuhurtha, root.durmuhurtam, muh.durmuhurtha),
    rahuKalam: first(root.rahuKalam, root.rahukalam, muh.rahu_kalam),
    hora: first(root.hora, root.horaMuhurta),
    amruthaGhadia: first(root.amruthaGhadia, root.amritaGadiya, root.amritakala),
    varjya: first(root.varjya, root.varjyam),
    tarabalam: first(root.tarabalam, root.taraBalam),
    chandrabalam: first(root.chandrabalam, root.chandraBalam)
  };
}
function mergeBoundaryTimes(current, prior) {
  const c = normalize(current); const p = normalize(prior || {});
  const t = c.tithi || {}; const n = c.nakshatra || {};
  const pt = p.tithi || {}; const pn = p.nakshatra || {};
  return { ...c,
    tithi: { ...t, startsAt:first(t.startsAt,t.startAt,t.start,pt.endsAt,pt.endAt,pt.end), endsAt:first(t.endsAt,t.endAt,t.end) },
    nakshatra: { ...n, startsAt:first(n.startsAt,n.startAt,n.start,pn.endsAt,pn.endAt,pn.end), endsAt:first(n.endsAt,n.endAt,n.end) }
  };
}
export default async request => {
  const url = new URL(request.url); const date = url.searchParams.get('date');
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return Response.json({error:'date must be YYYY-MM-DD'},{status:400});
  const controller = new AbortController(); const timer = setTimeout(()=>controller.abort(),15000);
  try {
    const [cur,prev] = await Promise.allSettled([fetchDay(date,'','',controller.signal),fetchDay(previousDateOf(date),'','',controller.signal)]);
    if(cur.status!=='fulfilled') throw cur.reason || new Error('Panchang API failed');
    return Response.json(mergeBoundaryTimes(cur.value,prev.status==='fulfilled'?prev.value:null),{headers:{'cache-control':'no-store','x-panchang-provider':'nityapanchangam.com'}});
  } catch(error) { return Response.json({error:'Panchangam service unavailable',detail:error?.message||'request failed'},{status:502}); }
  finally { clearTimeout(timer); }
};
export const config = { path: '/api/panchangam' };
