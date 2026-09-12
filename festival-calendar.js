(function(){
  const festivals={
    '2026-09-04':['Sri Krishna Janmashtami / శ్రీ కృష్ణ జన్మాష్టమి'],
    '2026-09-07':['Aja Ekadashi / అజ ఏకాదశి'],
    '2026-09-09':['Pradosh Vrat / ప్రదోష వ్రతం'],
    '2026-09-10':['Masik Shivratri / మాస శివరాత్రి'],
    '2026-09-14':['Hartalika Teej / హరితాలిక తీజ్','Ganesh Chaturthi / వినాయక చవితి'],
    '2026-09-15':['Rishi Panchami / ఋషి పంచమి'],
    '2026-09-17':['Vishwakarma Puja / విశ్వకర్మ పూజ','Kanya Sankranti / కన్యా సంక్రాంతి'],
    '2026-09-19':['Radha Ashtami / రాధాష్టమి'],
    '2026-09-22':['Parsva Ekadashi / పర్ష్వ ఏకాదశి'],
    '2026-09-25':['Anant Chaturdashi / అనంత చతుర్దశి','Ganesh Visarjan / గణేష్ నిమజ్జనం'],
    '2026-09-26':['Bhadrapada Purnima / భాద్రపద పౌర్ణమి'],
    '2026-09-27':['Pitru Paksha Begins / పితృ పక్షం ప్రారంభం']
  };
  function render(){
    if(!location.pathname.endsWith('panchangam.html')||document.getElementById('festivalCalendar'))return;
    const now=new Date(),year=now.getFullYear(),month=now.getMonth();
    const section=document.createElement('section');section.id='festivalCalendar';section.className='section';
    const title=now.toLocaleDateString('en-IN',{month:'long',year:'numeric'});
    const rows=[];Object.keys(festivals).forEach(key=>{const d=new Date(key+'T12:00:00');if(d.getFullYear()===year&&d.getMonth()===month)rows.push('<div class="quick-card"><strong>'+d.toLocaleDateString('en-IN',{day:'2-digit',weekday:'short'})+'</strong><small>'+festivals[key].join('<br>')+'</small></div>')});
    section.innerHTML='<div class="section-head"><h2>Indian Festival Calendar / భారతీయ పండుగల క్యాలెండర్</h2><span class="muted">'+title+'</span></div><div class="quick-grid">'+(rows.join('')||'<p class="muted">No festival data available for this month.</p>')+'</div>';
    const target=document.querySelector('.welcome');if(target)target.insertAdjacentElement('afterend',section);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render();
})();
