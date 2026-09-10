import { getStore } from '@netlify/blobs';

const RASHIS = [
  ['mesha','Mesha','Aries','మేషం','♈'], ['vrishabha','Vrishabha','Taurus','వృషభం','♉'],
  ['mithuna','Mithuna','Gemini','మిథునం','♊'], ['karkataka','Karkataka','Cancer','కర్కాటకం','♋'],
  ['simha','Simha','Leo','సింహం','♌'], ['kanya','Kanya','Virgo','కన్య','♍'],
  ['tula','Tula','Libra','తుల','♎'], ['vrishchika','Vrishchika','Scorpio','వృశ్చికం','♏'],
  ['dhanus','Dhanus','Sagittarius','ధనుస్సు','♐'], ['makara','Makara','Capricorn','మకరం','♑'],
  ['kumbha','Kumbha','Aquarius','కుంభం','♒'], ['meena','Meena','Pisces','మీనం','♓']
];

const fallback = (date) => ({
  status: 'editorial-fallback', generatedFor: date,
  rashis: RASHIS.map(([id,sanskrit,english,telugu,symbol]) => ({
    id, sanskrit, english, telugu, symbol,
    summaryEn: `Today invites ${english} natives to move steadily, communicate clearly and keep practical priorities ahead of distractions.`,
    summaryTe: `ఈ రోజు ${telugu} వారికి స్థిరమైన ఆలోచన, స్పష్టమైన సంభాషణ మరియు అవసరమైన పనులపై దృష్టి మంచిని ఇస్తాయి.`,
    focusEn: 'Work with patience and avoid rushed decisions.',
    focusTe: 'ఓర్పుతో వ్యవహరించి తొందరపాటు నిర్ణయాలను నివారించండి.',
    spiritualEn: 'A short prayer, mantra or quiet breath practice can help you stay centred.',
    spiritualTe: 'చిన్న ప్రార్థన, మంత్రజపం లేదా నిశ్శబ్ద ధ్యానం మనస్సును స్థిరంగా ఉంచుతుంది.'
  }))
});

const textFromResponse = (data) => data.output_text || data.output?.flatMap(x => x.content || []).find(x => x.type === 'output_text')?.text || '';

export default async (req) => {
  const date = new Date().toISOString().slice(0, 10);
  const store = getStore('siddha-rasi-daily');

  try {
    let payload;
    if (!process.env.OPENAI_API_KEY) {
      payload = fallback(date);
    } else {
      const prompt = `Create concise daily Vedic-style Rasi Phalalu for all 12 signs for Siddha Astro for ${date}. This is spiritual/astrological guidance, not medical, financial, legal or guaranteed prediction. Do not invent astronomical facts and do not make health diagnoses or guaranteed financial claims. Return ONLY valid JSON: {"rashis":[12 objects]}. Each object must contain id,summaryEn,summaryTe,focusEn,focusTe,spiritualEn,spiritualTe. Keep every field to 1-2 short sentences. IDs in order: ${RASHIS.map(r => r[0]).join(', ')}.`;
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-5.6-luna', input: prompt, store: false })
      });
      if (!response.ok) throw new Error(`OpenAI ${response.status}`);
      const data = await response.json();
      const parsed = JSON.parse(textFromResponse(data));
      const generated = Array.isArray(parsed.rashis) ? parsed.rashis : [];
      payload = {
        status: 'ai', generatedFor: date,
        rashis: RASHIS.map((r, i) => ({ id:r[0], sanskrit:r[1], english:r[2], telugu:r[3], symbol:r[4], ...(generated.find(x => x.id === r[0]) || generated[i] || {}) }))
      };
    }
    await store.setJSON(date, payload, { metadata: { generatedFor: date, generatedAt: new Date().toISOString(), source: payload.status } });
    await store.setJSON('latest', payload, { metadata: { generatedFor: date, generatedAt: new Date().toISOString(), source: payload.status } });
    return new Response(JSON.stringify({ ok: true, generatedFor: date, status: payload.status }), { headers: { 'content-type': 'application/json' } });
  } catch (error) {
    const payload = fallback(date);
    payload.error = 'AI generation failed; fallback content was cached.';
    await store.setJSON(date, payload);
    await store.setJSON('latest', payload);
    return new Response(JSON.stringify({ ok: false, generatedFor: date, status: payload.status, error: 'fallback-cached' }), { status: 200, headers: { 'content-type': 'application/json' } });
  }
};
