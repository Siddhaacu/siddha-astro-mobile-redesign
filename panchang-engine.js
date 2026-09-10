/* Siddha Astro Panchang engine adapter
 * Uses a pluggable astronomy provider. The UI consumes one stable result shape.
 * We intentionally do not bundle a proprietary app's source code.
 */
(function(){
  const NAKSHATRAS = ['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
  const RASHIS = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena'];
  function fromStored(){
    try{
      const v=JSON.parse(localStorage.getItem('siddha-panchang-result')||'null');
      if(v && v.date===new Date().toISOString().slice(0,10)) return v;
    }catch(e){}
    return null;
  }
  window.SiddhaPanchangEngine={
    nakshatras:NAKSHATRAS,
    rashis:RASHIS,
    getStored:fromStored,
    setResult:function(result){
      localStorage.setItem('siddha-panchang-result',JSON.stringify(result));
      window.SIDDHA_PANCHANG=result;
      return result;
    }
  };
})();
