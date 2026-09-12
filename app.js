const pad=n=>String(n).padStart(2,'0');
const d=new Date();
const dateText=d.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
const dateEl=document.getElementById('todayDate');
if(dateEl)dateEl.textContent=dateText;
const title=document.getElementById('todayTitle');
if(title){const h=d.getHours();title.textContent=h<12?'Good morning':'Good '+(h<17?'afternoon':'evening');}
function toast(message){const el=document.getElementById('toast');if(!el)return;el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2400)}
function toggleTheme(){document.body.classList.toggle('dark');localStorage.setItem('siddha-theme',document.body.classList.contains('dark')?'dark':'light')}
if(localStorage.getItem('siddha-theme')==='dark')document.body.classList.add('dark');
(function(){const MIN=.8,MAX=2,STEP=.1,KEY='siddha-zoom';function get(){const n=Number(localStorage.getItem(KEY));return Number.isFinite(n)?Math.min(MAX,Math.max(MIN,n)):1}function apply(value){value=Math.min(MAX,Math.max(MIN,Math.round(value*10)/10));document.documentElement.style.setProperty('--page-zoom',value);document.documentElement.dataset.zoom=value;localStorage.setItem(KEY,String(value));const label=document.getElementById('zoomValue');if(label)label.textContent=Math.round(value*100)+'%'}function build(){if(document.getElementById('readabilityControls'))return;const box=document.createElement('div');box.id='readabilityControls';box.className='readability-controls';box.innerHTML='<button type="button" id="zoomOut">A−</button><span id="zoomValue">100%</span><button type="button" id="zoomIn">A+</button><button type="button" id="zoomReset">↺</button>';document.body.appendChild(box);document.getElementById('zoomOut').onclick=()=>apply(get()-STEP);document.getElementById('zoomIn').onclick=()=>apply(get()+STEP);document.getElementById('zoomReset').onclick=()=>apply(1);apply(get())}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build,{once:true});else build()})();
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
window.enableSiddhaNotifications=async function(){toast('Notifications are not configured yet');return false};
function base64UrlToUint8Array(value){const padding='='.repeat((4-value.length%4)%4);const raw=atob((value+padding).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from([...raw].map(c=>c.charCodeAt(0)))}

/* Display Panchangam Tithi, Nakshatra and Rashi in English + Telugu. */
(function(){
  const TELUGU={
    Pratipada:'పాడ్యమి',Dwitiya:'విదియ',Tritiya:'తదియ',Chaturthi:'చవితి',Panchami:'పంచమి',Shashthi:'షష్టి',Saptami:'సప్తమి',Ashtami:'అష్టమి',Navami:'నవమి',Dashami:'దశమి',Ekadashi:'ఏకాదశి',Dwadashi:'ద్వాదశి',Trayodashi:'త్రయోదశి',Chaturdashi:'చతుర్దశి',Purnima:'పౌర్ణమి',Amavasya:'అమావాస్య',
    Ashwini:'అశ్విని',Bharani:'భరణి',Krittika:'కృత్తిక',Rohini:'రోహిణి',Mrigashira:'మృగశిర',Ardra:'ఆర్ద్ర',Punarvasu:'పునర్వసు',Pushya:'పుష్యమి',Ashlesha:'ఆశ్లేష',Magha:'మఘ','Purva Phalguni':'పుబ్బ','Uttara Phalguni':'ఉత్తర ఫల్గుణి',Hasta:'హస్త',Chitra:'చిత్త',Swati:'స్వాతి',Vishakha:'విశాఖ',Anuradha:'అనూరాధ',Jyeshtha:'జ్యేష్ఠ',Mula:'మూల','Purva Ashadha':'పూర్వాషాఢ','Uttara Ashadha':'ఉత్తరాషాఢ',Shravana:'శ్రవణ',Dhanishta:'ధనిష్ఠ',Shatabhisha:'శతభిషం','Purva Bhadrapada':'పూర్వాభాద్ర','Uttara Bhadrapada':'ఉత్తరాభాద్ర',Revati:'రేవతి',
    Mesha:'మేషం',Vrishabha:'వృషభం',Mithuna:'మిథునం',Karkataka:'కర్కాటకం',Simha:'సింహం',Kanya:'కన్య',Tula:'తుల',Vrishchika:'వృశ్చికం',Dhanus:'ధనుస్సు',Makara:'మకరం',Kumbha:'కుంభం',Meena:'మీనం'
  };
  function bilingual(value){const raw=String(value||'—').trim();if(!raw||raw==='—'||raw.includes('/'))return raw||'—';const key=raw.replace(/\s*\/.*$/,'').trim();return TELUGU[key]?key+' / '+TELUGU[key]:raw;}
  function apply(){['todayTithi','todayNakshatra','todayRashi'].forEach(id=>{const el=document.getElementById(id);if(!el)return;const raw=el.dataset.originalValue||el.textContent.trim();if(!el.dataset.originalValue)el.dataset.originalValue=raw;el.textContent=bilingual(raw);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
  window.addEventListener('load',()=>{apply();setTimeout(apply,800);setTimeout(apply,1800);});
})();