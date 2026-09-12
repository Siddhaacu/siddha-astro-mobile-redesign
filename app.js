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
