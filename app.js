const pad=n=>String(n).padStart(2,'0');
const d=new Date();
const dateText=d.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
const dateEl=document.getElementById('todayDate');
if(dateEl) dateEl.textContent=dateText;
const title=document.getElementById('todayTitle');
if(title){const h=d.getHours();title.textContent=h<12?'Good morning':'Good '+(h<17?'afternoon':'evening');}
function toast(message){const el=document.getElementById('toast');if(!el)return;el.textContent=message;el.classList.add('show');clearTimeout(window._toast);window._toast=setTimeout(()=>el.classList.remove('show'),2400)}
function toggleTheme(){document.body.classList.toggle('dark');localStorage.setItem('siddha-theme',document.body.classList.contains('dark')?'dark':'light')}
if(localStorage.getItem('siddha-theme')==='dark')document.body.classList.add('dark');

/* One shared readability control. Header A−/A+ buttons are intentionally not duplicated on individual pages. */
(function(){
  const MIN=0.8,MAX=2,STEP=0.1,KEY='siddha-zoom';
  function get(){const n=Number(localStorage.getItem(KEY));return Number.isFinite(n)?Math.min(MAX,Math.max(MIN,n)):1;}
  function apply(value){value=Math.min(MAX,Math.max(MIN,Math.round(value*10)/10));document.documentElement.style.setProperty('--page-zoom',value);document.documentElement.dataset.zoom=value;localStorage.setItem(KEY,String(value));const label=document.getElementById('zoomValue');if(label)label.textContent=`${Math.round(value*100)}%`;}
  function build(){if(document.getElementById('readabilityControls'))return;const box=document.createElement('div');box.id='readabilityControls';box.className='readability-controls';box.setAttribute('aria-label','Text size controls');box.innerHTML='<button type="button" id="zoomOut" aria-label="Decrease text size" title="Decrease text size">A−</button><span id="zoomValue">100%</span><button type="button" id="zoomIn" aria-label="Increase text size" title="Increase text size">A+</button><button type="button" id="zoomReset" aria-label="Reset text size" title="Reset text size">↺</button>';document.body.appendChild(box);document.getElementById('zoomOut').onclick=()=>apply(get()-STEP);document.getElementById('zoomIn').onclick=()=>apply(get()+STEP);document.getElementById('zoomReset').onclick=()=>apply(1);apply(get());}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
})();

/* Register the service worker for PWA/offline support and Web Push. */
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));}

/* Daily Panchangam notifications are opt-in and only requested after a user tap. */
window.enableSiddhaNotifications=async function(){
  if(!('serviceWorker' in navigator)||!('PushManager' in window)||!('Notification' in window)){toast('Notifications are not supported in this browser');return false;}
  try{
    const registration=await navigator.serviceWorker.ready;
    const permission=Notification.permission==='granted'?'granted':await Notification.requestPermission();
    if(permission!=='granted'){toast('Notification permission was not granted');return false;}
    const configResponse=await fetch('/.netlify/functions/push-config');
    if(!configResponse.ok)throw new Error('Push service is not configured');
    const config=await configResponse.json();
    if(!config.publicKey)throw new Error('Push public key is missing');
    let subscription=await registration.pushManager.getSubscription();
    if(!subscription)subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:base64UrlToUint8Array(config.publicKey)});
    const save=await fetch('/.netlify/functions/push-subscribe',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(subscription)});
    if(!save.ok)throw new Error('Subscription could not be saved');
    localStorage.setItem('siddha-push-enabled','1');
    const prompt=document.getElementById('notificationPrompt');if(prompt)prompt.remove();
    toast('Daily Panchangam notifications enabled');
    return true;
  }catch(error){console.error(error);toast('Daily notifications need to be configured on the server');return false;}
};
function base64UrlToUint8Array(base64String){const padding='='.repeat((4-base64String.length%4)%4);const base64=(base64String+padding).replace(/-/g,'+').replace(/_/g,'/');const raw=atob(base64);return Uint8Array.from([...raw].map(c=>c.charCodeAt(0)));}
document.addEventListener('click',event=>{const button=event.target.closest?.('[data-enable-notifications]');if(button){event.preventDefault();window.enableSiddhaNotifications();}});

/* Add one unobtrusive notification prompt to the Home page. iPhone requires this to follow a user interaction. */
(function(){
  function buildPrompt(){
    if(!document.getElementById('todayTitle')||document.getElementById('notificationPrompt')||localStorage.getItem('siddha-push-enabled')==='1')return;
    const anchor=document.querySelector('.hero-card');if(!anchor)return;
    const card=document.createElement('section');card.id='notificationPrompt';card.className='notification-card';card.innerHTML='<div class="notification-icon">🔔</div><div><strong>Daily Panchangam</strong><small>Get a morning notification when today’s Panchangam is ready.</small></div><button type="button" data-enable-notifications>Enable</button>';
    anchor.parentNode.insertBefore(card,anchor);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',buildPrompt);else buildPrompt();
})();
