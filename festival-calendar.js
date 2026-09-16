(function(){
  const festivals = [
    ['2026-01-01','New Year / నూతన సంవత్సరం','A new beginning and a time for prayer, gratitude and sankalpa.'],
    ['2026-01-14','Bhogi / భోగి','A traditional harvest festival marking the beginning of the Sankranti celebrations.'],
    ['2026-01-15','Makara Sankranti / మకర సంక్రాంతి','The Sun enters Makara Rashi; a major harvest and spiritual observance.'],
    ['2026-01-16','Kanuma / కనుమ','A day traditionally dedicated to cattle, agriculture and family celebrations.'],
    ['2026-01-26','Republic Day / గణతంత్ర దినోత్సవం','India celebrates the adoption of its Constitution.'],
    ['2026-02-15','Maha Shivaratri / మహా శివరాత్రి','A major Shaiva observance dedicated to Lord Shiva, fasting and night worship.'],
    ['2026-02-19','Ugadi / ఉగాది','Telugu New Year; a day for Panchanga Sravanam and new beginnings.'],
    ['2026-03-04','Holi / హోళీ','Festival of colours symbolising renewal and the victory of good over evil.'],
    ['2026-03-19','Sri Rama Navami / శ్రీ రామ నవమి','Celebration of the birth of Lord Rama.'],
    ['2026-04-02','Hanuman Jayanti / హనుమాన్ జయంతి','Observance dedicated to Lord Hanuman.'],
    ['2026-04-14','Tamil New Year / తమిళ నూతన సంవత్సరం','Traditional solar new year observance.'],
    ['2026-05-01','May Day / మే డే','International workers’ observance.'],
    ['2026-08-15','Independence Day / స్వాతంత్ర్య దినోత్సవం','India celebrates independence.'],
    ['2026-08-28','Sri Krishna Janmashtami / శ్రీ కృష్ణ జన్మాష్టమి','Celebration of the birth of Lord Krishna.'],
    ['2026-09-04','Sri Krishna Janmashtami / శ్రీ కృష్ణ జన్మాష్టమి','Celebration of the birth of Lord Krishna.'],
    ['2026-09-07','Aja Ekadashi / అజ ఏకాదశి','Ekadashi vrata dedicated to Lord Vishnu.'],
    ['2026-09-09','Pradosh Vrat / ప్రదోష వ్రతం','Twilight worship and fasting associated with Lord Shiva.'],
    ['2026-09-10','Masik Shivratri / మాస శివరాత్రి','Monthly Shiva worship.'],
    ['2026-09-14','Hartalika Teej / హరితాలిక తీజ్','Traditional vrata dedicated to Goddess Parvati.'],
    ['2026-09-14','Ganesh Chaturthi / వినాయక చవితి','Celebration of Lord Ganesha.'],
    ['2026-09-15','Rishi Panchami / ఋషి పంచమి','Traditional observance honouring the sages.'],
    ['2026-09-17','Vishwakarma Puja / విశ్వకర్మ పూజ','Worship of Lord Vishwakarma, associated with craftsmanship and engineering.'],
    ['2026-09-17','Kanya Sankranti / కన్యా సంక్రాంతి','The Sun enters Kanya Rashi.'],
    ['2026-09-19','Radha Ashtami / రాధాష్టమి','Celebration associated with Sri Radha.'],
    ['2026-09-22','Parsva Ekadashi / పర్ష్వ ఏకాదశి','Ekadashi vrata dedicated to Lord Vishnu.'],
    ['2026-09-25','Anant Chaturdashi / అనంత చతుర్దశి','Observance dedicated to Ananta and the conclusion of Ganesh celebrations.'],
    ['2026-09-25','Ganesh Visarjan / గణేష్ నిమజ్జనం','Traditional immersion ceremony for Ganesha idols.'],
    ['2026-09-26','Bhadrapada Purnima / భాద్రపద పౌర్ణమి','Full-moon observance in Bhadrapada month.'],
    ['2026-09-27','Pitru Paksha Begins / పితృ పక్షం ప్రారంభం','Period traditionally dedicated to remembrance of ancestors.'],
    ['2026-10-02','Gandhi Jayanti / గాంధీ జయంతి','Birth anniversary of Mahatma Gandhi.'],
    ['2026-10-20','Dussehra / విజయదశమి','Celebration of dharma and the victory of good over evil.'],
    ['2026-11-08','Diwali / దీపావళి','Festival of lights, prayer and renewal.'],
    ['2026-11-09','Bali Padyami / బలి పాడ్యమి','Traditional observance following Diwali.'],
    ['2026-12-25','Christmas / క్రిస్మస్','Christian celebration of the birth of Jesus Christ.']
  ];
  const byDate = date => festivals.filter(x => x[0] === date);
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function render(){
    const path = location.pathname;
    const isHome = path.endsWith('/') || path.endsWith('index.html');
    const isPanchang = path.endsWith('panchangam.html');
    if(!isHome && !isPanchang) return;
    if(document.getElementById('yearlyFestivalList')) return;
    const section=document.createElement('section');
    section.id='yearlyFestivalList'; section.className='section';
    const year=new Date().getFullYear();
    const current=festivals.filter(x=>x[0].startsWith(String(year)+'-'));
    section.innerHTML='<div class="section-head"><h2>Yearly Festival List / వార్షిక పండుగల జాబితా</h2><span class="muted">'+year+'</span></div><p class="muted">Select a festival to view its details. Documents and voice records can be added later.</p><div class="quick-grid">'+current.map((f,i)=>'<button type="button" class="quick-card festival-open" data-festival="'+i+'" style="text-align:left"><strong>'+new Date(f[0]+'T12:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short'})+'</strong><small>'+esc(f[1])+'</small></button>').join('')+'</div>';
    const target=isHome?document.querySelector('.welcome'):document.querySelector('.detail-card');
    if(target) target.insertAdjacentElement(isHome?'afterend':'afterend',section);
    section.querySelectorAll('.festival-open').forEach(btn=>btn.addEventListener('click',()=>openDetails(current[Number(btn.dataset.festival)])));
    if(isPanchang){
      const selected=document.querySelector('#panchDate');
      const addDaily=()=>{
        const date=(document.querySelector('#datePicker')||{}).value;
        if(!date)return;
        const matches=byDate(date);
        let box=document.getElementById('dailyFestivalDetails');
        if(!box){box=document.createElement('section');box.id='dailyFestivalDetails';box.className='section';section.insertAdjacentElement('beforebegin',box)}
        box.innerHTML=matches.length?'<div class="section-head"><h2>Today\'s Festival / ఈ రోజు పండుగ</h2></div>'+matches.map(f=>'<button type="button" class="quick-card festival-open" style="text-align:left;width:100%"><strong>'+esc(f[1])+'</strong><small>'+esc(f[2])+'</small></button>').join(''):'<div class="section-head"><h2>Today\'s Festival / ఈ రోజు పండుగ</h2></div><p class="muted">No festival recorded for this date.</p>';
        box.querySelectorAll('.festival-open').forEach((b,i)=>b.addEventListener('click',()=>openDetails(matches[i])));
      };
      document.querySelector('#datePicker')?.addEventListener('change',addDaily); addDaily();
    }
  }
  function openDetails(f){
    if(!f)return;
    let modal=document.getElementById('festivalDetailTab');
    if(!modal){modal=document.createElement('div');modal.id='festivalDetailTab';modal.style='position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:18px';document.body.appendChild(modal)}
    modal.innerHTML='<div style="max-width:560px;width:100%;max-height:90vh;overflow:auto;background:var(--paper,#fff);color:var(--ink,#222);border-radius:18px;padding:20px"><div style="display:flex;justify-content:space-between;gap:12px"><h2 style="margin:0">'+esc(f[1])+'</h2><button type="button" id="closeFestival">✕</button></div><p class="muted">'+new Date(f[0]+'T12:00:00').toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})+'</p><p>'+esc(f[2])+'</p><hr><p class="muted">Documents: coming soon</p><p class="muted">Voice record: coming soon</p></div>';
    modal.style.display='flex'; modal.querySelector('#closeFestival').onclick=()=>modal.remove(); modal.onclick=e=>{if(e.target===modal)modal.remove()};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render();
})();