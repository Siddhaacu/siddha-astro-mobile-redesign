(function(){
  const NAKSHATRAS=[['Ashwini','అశ్విని'],['Bharani','భరణి'],['Krittika','కృత్తిక'],['Rohini','రోహిణి'],['Mrigashira','మృగశిర'],['Ardra','ఆర్ద్ర'],['Punarvasu','పునర్వసు'],['Pushya','పుష్యమి'],['Ashlesha','ఆశ్లేష'],['Magha','మఘ'],['Purva Phalguni','పూర్వ ఫల్గుణి'],['Uttara Phalguni','ఉత్తర ఫల్గుణి'],['Hasta','హస్త'],['Chitra','చిత్త'],['Swati','స్వాతి'],['Vishakha','విశాఖ'],['Anuradha','అనూరాధ'],['Jyeshtha','జ్యేష్ఠ'],['Mula','మూల'],['Purva Ashadha','పూర్వాషాఢ'],['Uttara Ashadha','ఉత్తరాషాఢ'],['Shravana','శ్రవణం'],['Dhanishtha','ధనిష్ఠ'],['Shatabhisha','శతభిష'],['Purva Bhadrapada','పూర్వాభాద్ర'],['Uttara Bhadrapada','ఉత్తరాభాద్ర'],['Revati','రేవతి']];
  const RASHIS=[['Mesha','మేషం','Aries'],['Vrishabha','వృషభం','Taurus'],['Mithuna','మిథునం','Gemini'],['Karkataka','కర్కాటకం','Cancer'],['Simha','సింహం','Leo'],['Kanya','కన్య','Virgo'],['Tula','తుల','Libra'],['Vrishchika','వృశ్చికం','Scorpio'],['Dhanu','ధనుస్సు','Sagittarius'],['Makara','మకరం','Capricorn'],['Kumbha','కుంభం','Aquarius'],['Meena','మీనం','Pisces']];
  const TARA=[
    ['Janma','జన్మ','Mixed / Caution'],['Sampat','సంపత్','Excellent'],['Vipat','విపత్','Avoid / Caution'],['Kshema','క్షేమ','Good'],['Pratyari','ప్రత్యరి','Avoid / Caution'],['Sadhaka','సాధక','Excellent'],['Vadha / Naidhana','వధ / నైధన','Avoid'],['Maitra','మైత్ర','Good'],['Param Maitra','పరమ మైత్ర','Best']
  ];
  const CHANDRA={1:['Excellent','అత్యుత్తమం'],2:['Good','మంచిది'],3:['Good','మంచిది'],4:['Caution','జాగ్రత్త'],5:['Good','మంచిది'],6:['Avoid / Caution','జాగ్రత్త'],7:['Good','మంచిది'],8:['Avoid','అనుకూలం కాదు'],9:['Good','మంచిది'],10:['Excellent','అత్యుత్తమం'],11:['Excellent','అత్యుత్తమం'],12:['Avoid','అనుకూలం కాదు']};
  const $=id=>document.getElementById(id);
  const panch=window.SIDDHA_PANCHANG||{};
  const todayNak=panch.nakshatraNumber||panch.nakshatra?.number||null;
  const todayRashi=panch.rashiNumber||panch.rashi?.number||null;

  function fillSelect(id,items){const el=$(id);if(!el)return;items.forEach((x,i)=>{const o=document.createElement('option');o.value=i+1;o.textContent=x[0]+' — '+x[1];el.appendChild(o)});}
  fillSelect('birthNakshatra',NAKSHATRAS); fillSelect('birthRashi',RASHIS);
  const saved=JSON.parse(localStorage.getItem('siddha-bala-profile')||'null');
  if(saved){if($('birthNakshatra')&&saved.nakshatra)$('birthNakshatra').value=saved.nakshatra;if($('birthRashi')&&saved.rashi)$('birthRashi').value=saved.rashi;}

  function renderPanch(){
    const nakText=todayNak?NAKSHATRAS[todayNak-1][0]+' / '+NAKSHATRAS[todayNak-1][1]:'Awaiting Panchangam engine';
    const rashiText=todayRashi?RASHIS[todayRashi-1][2]+' / '+RASHIS[todayRashi-1][1]:'Awaiting Panchangam engine';
    if($('todayNakshatra'))$('todayNakshatra').textContent=nakText;
    if($('todayRashi'))$('todayRashi').textContent=rashiText;
  }
  function calcTara(){
    const birth=Number($('birthNakshatra')?.value); if(!birth||!todayNak){$('taraResult').innerHTML='<strong>Select your birth Nakshatra</strong><small>Today\'s Nakshatra will come directly from Panchangam.</small>';return;}
    const count=((todayNak-birth+27)%27)+1; const idx=((count-1)%9); const t=TARA[idx];
    $('taraResult').innerHTML='<span class="tara-badge">'+t[0]+'</span><strong>'+t[1]+' · '+t[2]+'</strong><small>Count from Janma Nakshatra: '+count+'</small>';
  }
  function calcChandra(){
    const birth=Number($('birthRashi')?.value); if(!birth||!todayRashi){$('chandraResult').innerHTML='<strong>Select your Janma Rashi</strong><small>Today\'s Rashi will come directly from Panchangam.</small>';return;}
    const house=((todayRashi-birth+12)%12)+1; const c=CHANDRA[house];
    $('chandraResult').innerHTML='<span class="tara-badge">'+house+'th from Janma Rashi</span><strong>'+c[1]+' · '+c[0]+'</strong><small>Today: '+RASHIS[todayRashi-1][2]+' / '+RASHIS[todayRashi-1][1]+'</small>';
  }
  function save(){localStorage.setItem('siddha-bala-profile',JSON.stringify({nakshatra:Number($('birthNakshatra')?.value)||null,rashi:Number($('birthRashi')?.value)||null}));calcTara();calcChandra();}
  $('birthNakshatra')?.addEventListener('change',save); $('birthRashi')?.addEventListener('change',save);
  renderPanch();calcTara();calcChandra();
})();
