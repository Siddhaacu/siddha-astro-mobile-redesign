/* Siddha Astro Panchang Bala UI adapter.
 * Tarabala consumes the Nakshatra produced by the Panchangam engine.
 * No proprietary Siddha Astro source is copied here.
 */
(function(){
  const NAKSHATRAS=[['Ashwini','అశ్విని'],['Bharani','భరణి'],['Krittika','కృత్తిక'],['Rohini','రోహిణి'],['Mrigashira','మృగశిర'],['Ardra','ఆర్ద్ర'],['Punarvasu','పునర్వసు'],['Pushya','పుష్యమి'],['Ashlesha','ఆశ్లేష'],['Magha','మఘ'],['Purva Phalguni','పూర్వ ఫల్గుణి'],['Uttara Phalguni','ఉత్తర ఫల్గుణి'],['Hasta','హస్త'],['Chitra','చిత్త'],['Swati','స్వాతి'],['Vishakha','విశాఖ'],['Anuradha','అనూరాధ'],['Jyeshtha','జ్యేష్ఠ'],['Mula','మూల'],['Purva Ashadha','పూర్వాషాఢ'],['Uttara Ashadha','ఉత్తరాషాఢ'],['Shravana','శ్రవణం'],['Dhanishtha','ధనిష్ఠ'],['Shatabhisha','శతభిష'],['Purva Bhadrapada','పూర్వాభాద్ర'],['Uttara Bhadrapada','ఉత్తరాభాద్ర'],['Revati','రేవతి']];
  const RASHIS=[['Mesha','మేషం','Aries'],['Vrishabha','వృషభం','Taurus'],['Mithuna','మిథునం','Gemini'],['Karkataka','కర్కాటకం','Cancer'],['Simha','సింహం','Leo'],['Kanya','కన్య','Virgo'],['Tula','తుల','Libra'],['Vrishchika','వృశ్చికం','Scorpio'],['Dhanu','ధనుస్సు','Sagittarius'],['Makara','మకరం','Capricorn'],['Kumbha','కుంభం','Aquarius'],['Meena','మీనం','Pisces']];
  const TARA=[
    ['Janma','జన్మ','Mixed / Caution','జాగ్రత్త / మిశ్రమం'],
    ['Sampat','సంపత్','Excellent','అత్యుత్తమం'],
    ['Vipat','విపత్','Avoid / Caution','జాగ్రత్త'],
    ['Kshema','క్షేమ','Good','మంచిది'],
    ['Pratyari','ప్రత్యరి','Avoid / Caution','జాగ్రత్త'],
    ['Sadhaka','సాధక','Excellent','అత్యుత్తమం'],
    ['Vadha / Naidhana','వధ / నైధన','Avoid','అనుకూలం కాదు'],
    ['Maitra','మైత్ర','Good','మంచిది'],
    ['Param Maitra','పరమ మైత్ర','Best','అత్యుత్తమం']
  ];
  const STRONG_HOUSES=new Set([1,3,6,7,10,11]);
  const $=id=>document.getElementById(id);
  function safeProfile(){try{return JSON.parse(localStorage.getItem('siddha-bala-profile')||'null')}catch(e){return null}}
  function engineResult(){
    if(window.SIDDHA_PANCHANG && typeof window.SIDDHA_PANCHANG==='object') return window.SIDDHA_PANCHANG;
    try{return JSON.parse(localStorage.getItem('siddha-panchang-result')||'null')}catch(e){return null}
  }
  function currentData(){
    const p=engineResult()||{};
    const nak=Number(p.nakshatraNumber ?? p.nakshatra?.number ?? (p.nakshatra?.index!=null?p.nakshatra.index+1:null));
    const rashi=Number(p.rashiNumber ?? p.rashi?.number ?? (p.moonRashi?.index!=null?p.moonRashi.index+1:null));
    return {date:p.date||null,nakshatraNumber:Number.isInteger(nak)&&nak>=1&&nak<=27?nak:null,rashiNumber:Number.isInteger(rashi)&&rashi>=1&&rashi<=12?rashi:null};
  }
  function fillSelect(id,items){const el=$(id);if(!el||el.options.length>1)return;items.forEach((x,i)=>{const o=document.createElement('option');o.value=i+1;o.textContent=x[0]+' — '+x[1];el.appendChild(o)});}
  function render(){
    const p=currentData();
    if($('todayNakshatra')) $('todayNakshatra').textContent=p.nakshatraNumber?NAKSHATRAS[p.nakshatraNumber-1][0]+' / '+NAKSHATRAS[p.nakshatraNumber-1][1]:'Awaiting verified Panchangam';
    if($('todayRashi')) $('todayRashi').textContent=p.rashiNumber?RASHIS[p.rashiNumber-1][2]+' / '+RASHIS[p.rashiNumber-1][1]:'Awaiting verified Panchangam';
    const profile=safeProfile();
    if(profile){if($('birthNakshatra')&&profile.nakshatra)$('birthNakshatra').value=profile.nakshatra;if($('birthRashi')&&profile.rashi)$('birthRashi').value=profile.rashi;}
    calcTara();calcChandra();
  }
  function calcTara(){
    const birth=Number($('birthNakshatra')?.value), p=currentData();
    if(!$('taraResult'))return;
    if(!birth){$('taraResult').innerHTML='<strong>Select your Janma Nakshatra</strong><small>Your birth star is used to calculate today\'s Tarabalam.</small>';return;}
    if(!p.nakshatraNumber){$('taraResult').innerHTML='<strong>Panchangam Nakshatra is not available yet</strong><small>Tarabalam will calculate automatically when today\'s verified Nakshatra is loaded.</small>';return;}
    const count=((p.nakshatraNumber-birth+27)%27)+1;
    const idx=(count-1)%9; const t=TARA[idx];
    $('taraResult').innerHTML='<span class="tara-badge">'+t[0]+'</span><strong>'+t[1]+' · '+t[2]+'</strong><small>'+t[3]+' · '+count+'th Nakshatra counted from Janma Nakshatra</small>';
  }
  function calcChandra(){
    const birth=Number($('birthRashi')?.value), p=currentData();
    if(!$('chandraResult'))return;
    if(!birth){$('chandraResult').innerHTML='<strong>Select your Janma Rashi</strong><small>Today\'s Moon Rashi will be used automatically.</small>';return;}
    if(!p.rashiNumber){$('chandraResult').innerHTML='<strong>Panchangam Moon Rashi is not available yet</strong><small>Chandrabalam will calculate automatically when the verified Moon Rashi is loaded.</small>';return;}
    const house=((p.rashiNumber-birth+12)%12)+1;
    const strong=STRONG_HOUSES.has(house);
    $('chandraResult').innerHTML='<span class="tara-badge">'+house+'th from Janma Rashi</span><strong>'+ (strong?'శుభం · Shubha':'అశుభం · Ashubha') +'</strong><small>Today: '+RASHIS[p.rashiNumber-1][2]+' / '+RASHIS[p.rashiNumber-1][1]+'</small>';
  }
  function save(){
    localStorage.setItem('siddha-bala-profile',JSON.stringify({nakshatra:Number($('birthNakshatra')?.value)||null,rashi:Number($('birthRashi')?.value)||null}));
    calcTara();calcChandra();
  }
  function init(){
    fillSelect('birthNakshatra',NAKSHATRAS);fillSelect('birthRashi',RASHIS);
    $('birthNakshatra')?.addEventListener('change',save);$('birthRashi')?.addEventListener('change',save);
    render();
    window.addEventListener('siddha:panchang-updated',render);
    window.addEventListener('storage',e=>{if(e.key==='siddha-panchang-result')render()});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
