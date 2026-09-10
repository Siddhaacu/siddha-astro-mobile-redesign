import { getDailyPanchang } from 'panchang-ts';

const NAKSHATRAS = [
  ['Ashwini','అశ్విని'],['Bharani','భరణి'],['Krittika','కృత్తిక'],['Rohini','రోహిణి'],['Mrigashira','మృగశిర'],['Ardra','ఆర్ద్ర'],['Punarvasu','పునర్వసు'],['Pushya','పుష్యమి'],['Ashlesha','ఆశ్లేష'],['Magha','మఖ'],['Purva Phalguni','పూర్వ ఫల్గుణి'],['Uttara Phalguni','ఉత్తర ఫల్గుణి'],['Hasta','హస్త'],['Chitra','చిత్త'],['Swati','స్వాతి'],['Vishakha','విశాఖ'],['Anuradha','అనూరాధ'],['Jyeshtha','జ్యేష్ఠ'],['Mula','మూల'],['Purva Ashadha','పూర్వాషాఢ'],['Uttara Ashadha','ఉత్తరాషాఢ'],['Shravana','శ్రవణం'],['Dhanishtha','ధనిష్ఠ'],['Shatabhisha','శతభిషం'],['Purva Bhadrapada','పూర్వాభాద్ర'],['Uttara Bhadrapada','ఉత్తరాభాద్ర'],['Revati','రేవతి']
];
const RASHIS = [
  ['Mesha','మేష'],['Vrishabha','వృషభ'],['Mithuna','మిథున'],['Karka','కర్కాటక'],['Simha','సింహ'],['Kanya','కన్య'],['Tula','తుల'],['Vrishchika','వృశ్చిక'],['Dhanu','ధనుస్సు'],['Makara','మకర'],['Kumbha','కుంభ'],['Meena','మీనం']
];
const DEFAULT_LOCATION = {lat:17.3850,lon:78.4867,timezoneMinutes:330,name:'Hyderabad',timezone:'Asia/Kolkata'};
function textOf(v){if(v==null)return '';if(typeof v==='string'||typeof v==='number')return String(v);if(Array.isArray(v))return v.length?textOf(v[0]):'';if(typeof v==='object'){for(const k of ['name','displayName','label','title','value','text','english','sanscript','rashi','nakshatra','tithi'])if(v[k]!=null&&(typeof v[k]==='string'||typeof v[k]==='number'))return String(v[k]);}return '';}
function numberOf(v){if(typeof v==='number')return v;if(!v||typeof v!=='object')return null;for(const k of ['number','index','id','value'])if(typeof v[k]==='number')return v[k];return null;}
function firstArray(o,names){if(!o||typeof o!=='object')return null;for(const n of names)if(Array.isArray(o[n])&&o[n].length)return o[n];return null;}
function firstValue(o,names){if(!o||typeof o!=='object')return null;for(const n of names)if(o[n]!=null)return o[n];return null;}
function formatTime(v,timezoneMinutes){if(v==null)return '';if(typeof v==='object'){const nested=firstValue(v,['time','date','datetime','start','value']);if(nested!=null)return formatTime(nested,timezoneMinutes);const h=numberOf(firstValue(v,['hour','hours']));const m=numberOf(firstValue(v,['minute','minutes']));if(h!=null)return `${String(h).padStart(2,'0')}:${String(m||0).padStart(2,'0')}`;return '';}const d=v instanceof Date?v:typeof v==='number'?new Date(v>1e12?v:v*1000):new Date(v);if(Number.isNaN(d.getTime()))return textOf(v);const offset=timezoneMinutes*60000;const shifted=new Date(d.getTime()+offset);return shifted.toISOString().slice(11,16);}
function pickAnga(d,names){const a=d?.angas||d?.anga||{};const arr=firstArray(a,names);return arr?arr[0]:firstValue(a,names);}
function findNakshatra(d){const raw=pickAnga(d,['nakshatras','nakshatra','stars']);let index=numberOf(raw);const name=textOf(raw);if(index==null&&name)index=NAKSHATRAS.findIndex(x=>x[0].toLowerCase()===name.toLowerCase())+1;if(index!=null&&index>=0&&index<=26)index+=1;if(index>27)index=null;const item=index?NAKSHATRAS[index-1]:null;return {number:index||1,english:item?.[0]||name||'—',telugu:item?.[1]||'',pada:numberOf(raw?.pada)||numberOf(raw?.paada)||null,raw};}
function findRashi(d){const raw=d?.moon?.rashi??d?.rashi??d?.moonRashi;let index=numberOf(raw);const name=textOf(raw);if(index==null&&name)index=RASHIS.findIndex(x=>x[0].toLowerCase()===name.toLowerCase())+1;if(index!=null&&index>=0&&index<=11)index+=1;if(index>12)index=null;const item=index?RASHIS[index-1]:null;return {number:index||1,english:item?.[0]||name||'—',telugu:item?.[1]||'',raw};}
function displayAnga(raw){if(!raw)return '—';const name=textOf(raw);const end=firstValue(raw,['end','endTime','endAt','until']);const time=formatTime(end,DEFAULT_LOCATION.timezoneMinutes);return time?`${name} • ${time}`:(name||'—');}
function fieldText(d,names){return textOf(firstValue(d,names));}
function normalize(dateString,location,daily){
  const nak=findNakshatra(daily),rashi=findRashi(daily);
  const tithi=pickAnga(daily,['tithis','tithi']),yoga=pickAnga(daily,['yogas','yoga']),karana=pickAnga(daily,['karanas','karana']);
  const sun=daily?.sun||daily?.solar||{};
  const sunrise=firstValue(sun,['rise','sunrise','sunRise']),sunset=firstValue(sun,['set','sunset','sunSet']);
  const rahu=firstValue(daily,['rahuKalam','rahu','rahuKala']),yama=firstValue(daily,['yamagandam','yamaGandam','yamaganda']);
  const muhurta=firstValue(daily,['muhurtas','muhurta','auspiciousTimes'])||{};
  const abhijit=firstValue(muhurta,['abhijit','abhijitMuhurta']),dur=firstValue(muhurta,['durmuhurtham','durmuhurta','durMuhurtam']);
  const masa=firstValue(daily,['masa','month','lunarMonth','amantaMonth','purnimantaMonth']);
  const samvatsara=firstValue(daily,['samvatsara','year','vedicYear']);
  const paksha=firstValue(daily,['paksha','lunarFortnight']);
  const vara=firstValue(daily,['vara','weekday','day']);
  return {date:dateString,location,nakshatraNumber:nak.number,nakshatra:nak,rashiNumber:rashi.number,rashi,moonRashi:rashi,
    vara:{display:fieldText(daily,['vara','weekday','day']),raw:vara},paksha:{display:fieldText(daily,['paksha','lunarFortnight']),raw:paksha},masa:{display:fieldText(daily,['masa','month','lunarMonth','amantaMonth','purnimantaMonth']),raw:masa},samvatsara:{display:fieldText(daily,['samvatsara','year','vedicYear']),raw:samvatsara},
    tithi:{display:displayAnga(tithi),raw:tithi},yoga:{display:displayAnga(yoga),raw:yoga},karana:{display:displayAnga(karana),raw:karana},
    sunrise:formatTime(sunrise,location.timezoneMinutes),sunset:formatTime(sunset,location.timezoneMinutes),rahuKalam:formatTime(rahu,location.timezoneMinutes),yamagandam:formatTime(yama,location.timezoneMinutes),abhijit:formatTime(abhijit,location.timezoneMinutes),durmuhurtham:formatTime(dur,location.timezoneMinutes),source:'panchang-ts',engineVersion:'5.2.1',raw:daily};
}
function getLocation(){try{const saved=JSON.parse(localStorage.getItem('siddha-location')||'null');if(saved?.lat!=null&&saved?.lon!=null)return {...DEFAULT_LOCATION,lat:Number(saved.lat),lon:Number(saved.lon),name:'Current location'};}catch(_){}return {...DEFAULT_LOCATION};}
function dateInputToUTC(s){const[y,m,d]=s.split('-').map(Number);return new Date(Date.UTC(y,m-1,d,12,0,0));}
async function calculate(dateString,location=getLocation()){
  const daily=getDailyPanchang(dateInputToUTC(dateString),{latitude:location.lat,longitude:location.lon},{timezone:location.timezoneMinutes});
  const result=normalize(dateString,location,daily);localStorage.setItem('siddha-panchang-result',JSON.stringify(result));window.SIDDHA_PANCHANG=result;window.dispatchEvent(new CustomEvent('siddha:panchang-updated',{detail:result}));return result;
}
window.SiddhaPanchangEngine={nakshatras:NAKSHATRAS.map(x=>x[0]),rashis:RASHIS.map(x=>x[0]),getStored(){try{return JSON.parse(localStorage.getItem('siddha-panchang-result')||'null')}catch(_){return null}},calculate,setResult(result){localStorage.setItem('siddha-panchang-result',JSON.stringify(result));window.SIDDHA_PANCHANG=result;window.dispatchEvent(new CustomEvent('siddha:panchang-updated',{detail:result}));return result;}};
