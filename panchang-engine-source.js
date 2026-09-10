import { getDailyPanchang } from 'panchang-ts';

const NAKSHATRAS = [
  ['Ashwini','అశ్విని'],['Bharani','భరణి'],['Krittika','కృత్తిక'],['Rohini','రోహిణి'],['Mrigashira','మృగశిర'],['Ardra','ఆర్ద్ర'],['Punarvasu','పునర్వసు'],['Pushya','పుష్యమి'],['Ashlesha','ఆశ్లేష'],['Magha','మఖ'],['Purva Phalguni','పూర్వ ఫల్గుణి'],['Uttara Phalguni','ఉత్తర ఫల్గుణి'],['Hasta','హస్త'],['Chitra','చిత్త'],['Swati','స్వాతి'],['Vishakha','విశాఖ'],['Anuradha','అనూరాధ'],['Jyeshtha','జ్యేష్ఠ'],['Mula','మూల'],['Purva Ashadha','పూర్వాషాఢ'],['Uttara Ashadha','ఉత్తరాషాఢ'],['Shravana','శ్రవణం'],['Dhanishtha','ధనిష్ఠ'],['Shatabhisha','శతభిషం'],['Purva Bhadrapada','పూర్వాభాద్ర'],['Uttara Bhadrapada','ఉత్తరాభాద్ర'],['Revati','రేవతి']
];
const RASHIS = [
  ['Mesha','మేష'],['Vrishabha','వృషభ'],['Mithuna','మిథున'],['Karka','కర్కాటక'],['Simha','సింహ'],['Kanya','కన్య'],['Tula','తుల'],['Vrishchika','వృశ్చిక'],['Dhanu','ధనుస్సు'],['Makara','మకర'],['Kumbha','కుంభ'],['Meena','మీనం']
];
const DEFAULT_LOCATION = { lat: 17.3850, lon: 78.4867, timezoneMinutes: 330, name: 'Hyderabad', timezone: 'Asia/Kolkata' };

function textOf(value) {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.length ? textOf(value[0]) : '';
  if (typeof value === 'object') {
    for (const k of ['name','displayName','label','title','value','text','english','sanscript','rashi','nakshatra','tithi']) {
      if (value[k] != null && (typeof value[k] === 'string' || typeof value[k] === 'number')) return String(value[k]);
    }
  }
  return '';
}
function numberOf(value) {
  if (typeof value === 'number') return value;
  if (!value || typeof value !== 'object') return null;
  for (const k of ['number','index','id','value']) if (typeof value[k] === 'number') return value[k];
  return null;
}
function firstArray(obj, names) {
  if (!obj || typeof obj !== 'object') return null;
  for (const name of names) if (Array.isArray(obj[name]) && obj[name].length) return obj[name];
  return null;
}
function firstValue(obj, names) {
  if (!obj || typeof obj !== 'object') return null;
  for (const name of names) if (obj[name] != null) return obj[name];
  return null;
}
function pickAnga(daily, names) {
  const angas = daily?.angas || daily?.anga || {};
  const arr = firstArray(angas, names);
  return arr ? arr[0] : firstValue(angas, names);
}
function extractIndex(raw, max) {
  if (!raw || typeof raw !== 'object') return null;
  if (typeof raw.index === 'number') return raw.index + 1;
  if (typeof raw.number === 'number') return raw.number;
  if (typeof raw.id === 'number') return raw.id;
  if (typeof raw.value === 'number') return raw.value;
  return null;
}
function findNakshatra(daily) {
  const raw = pickAnga(daily, ['nakshatras','nakshatra','stars']);
  let index = extractIndex(raw, 27);
  const name = textOf(raw);
  if (index == null && name) {
    const found = NAKSHATRAS.findIndex(x => x[0].toLowerCase() === name.toLowerCase());
    if (found >= 0) index = found + 1;
  }
  if (!index || index < 1 || index > 27) index = 1;
  const item = NAKSHATRAS[index - 1];
  return { number:index, english:item[0], telugu:item[1], pada:numberOf(raw?.pada) || numberOf(raw?.paada) || null, raw };
}
function findRashi(daily) {
  const raw = daily?.moon?.rashi ?? daily?.rashi ?? daily?.moonRashi;
  let index = extractIndex(raw, 12);
  const name = textOf(raw);
  if (index == null && name) {
    const found = RASHIS.findIndex(x => x[0].toLowerCase() === name.toLowerCase());
    if (found >= 0) index = found + 1;
  }
  if (!index || index < 1 || index > 12) index = 1;
  const item = RASHIS[index - 1];
  return { number:index, english:item[0], telugu:item[1], raw };
}
function asDate(value) {
  if (value == null) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'number') return new Date(value > 1e12 ? value : value * 1000);
  if (typeof value === 'string') { const d = new Date(value); return Number.isNaN(d.getTime()) ? null : d; }
  if (typeof value === 'object') return asDate(firstValue(value,['time','date','datetime','start','value']));
  return null;
}
function formatTime(value, timezoneMinutes = 330) {
  const d = asDate(value);
  if (!d) {
    if (value && typeof value === 'object') {
      const h = numberOf(firstValue(value,['hour','hours']));
      const m = numberOf(firstValue(value,['minute','minutes'])) || 0;
      if (h != null) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
    }
    return textOf(value) || '—';
  }
  const shifted = new Date(d.getTime() + timezoneMinutes * 60000);
  let h = shifted.getUTCHours(); const m = shifted.getUTCMinutes();
  const suffix = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')} ${suffix}`;
}
function displayAnga(raw) {
  if (!raw) return '—';
  const name = textOf(raw) || '—';
  const end = firstValue(raw,['end','endTime','endAt','until']);
  return end != null ? `${name} • ${formatTime(end)}` : name;
}
function dateInputToUTC(dateString) {
  const [y,m,d] = dateString.split('-').map(Number);
  return new Date(Date.UTC(y,m-1,d,12,0,0));
}
function getLocation() {
  try {
    const saved = JSON.parse(localStorage.getItem('siddha-location') || 'null');
    if (saved?.lat != null && saved?.lon != null) return { ...DEFAULT_LOCATION, lat:Number(saved.lat), lon:Number(saved.lon), name:'Current location' };
  } catch (_) {}
  return { ...DEFAULT_LOCATION };
}
function normalize(dateString, location, daily) {
  const nak = findNakshatra(daily), rashi = findRashi(daily);
  const tithi = pickAnga(daily,['tithis','tithi']);
  const yoga = pickAnga(daily,['yogas','yoga']);
  const karana = pickAnga(daily,['karanas','karana']);
  const sun = daily?.sun || daily?.solar || {};
  const sunrise = firstValue(sun,['rise','sunrise','sunRise']) ?? firstValue(daily,['sunrise','sunRise']);
  const sunset = firstValue(sun,['set','sunset','sunSet']) ?? firstValue(daily,['sunset','sunSet']);
  const rahu = firstValue(daily,['rahuKalam','rahu','rahuKala']);
  const yama = firstValue(daily,['yamagandam','yamaGandam','yamaganda']);
  const muhurta = firstValue(daily,['muhurtas','muhurta','auspiciousTimes']) || {};
  const abhijit = firstValue(muhurta,['abhijit','abhijitMuhurta']);
  const dur = firstValue(muhurta,['durmuhurtham','durmuhurta','durMuhurtam']);
  return {
    date:dateString, location, nakshatraNumber:nak.number, nakshatra:nak,
    rashiNumber:rashi.number, rashi, moonRashi:rashi,
    tithi:{display:displayAnga(tithi),raw:tithi}, yoga:{display:displayAnga(yoga),raw:yoga}, karana:{display:displayAnga(karana),raw:karana},
    sunrise:formatTime(sunrise,location.timezoneMinutes), sunset:formatTime(sunset,location.timezoneMinutes),
    rahuKalam:formatTime(rahu,location.timezoneMinutes), yamagandam:formatTime(yama,location.timezoneMinutes),
    abhijit:formatTime(abhijit,location.timezoneMinutes), durmuhurtham:formatTime(dur,location.timezoneMinutes),
    source:'panchang-ts', engineVersion:'5.2.1', raw:daily
  };
}
async function calculate(dateString, location=getLocation()) {
  const daily = getDailyPanchang(dateInputToUTC(dateString), { latitude:location.lat, longitude:location.lon }, { timezone:location.timezoneMinutes });
  const result = normalize(dateString,location,daily);
  localStorage.setItem('siddha-panchang-result',JSON.stringify(result));
  window.SIDDHA_PANCHANG=result;
  window.dispatchEvent(new CustomEvent('siddha:panchang-updated',{detail:result}));
  return result;
}
window.SiddhaPanchangEngine = {
  nakshatras:NAKSHATRAS.map(x=>x[0]), rashis:RASHIS.map(x=>x[0]),
  getStored(){try{return JSON.parse(localStorage.getItem('siddha-panchang-result')||'null')}catch(_){return null}},
  calculate,
  setResult(result){localStorage.setItem('siddha-panchang-result',JSON.stringify(result));window.SIDDHA_PANCHANG=result;window.dispatchEvent(new CustomEvent('siddha:panchang-updated',{detail:result}));return result;}
};
