import { getStore } from "@netlify/blobs";

const IDS = ["mesha","vrishabha","mithuna","karkataka","simha","kanya","tula","vrischika","dhanus","makara","kumbha","meena"];

function cleanJson(text) {
  return JSON.parse(String(text).replace(/^```json\s*/i, "").replace(/\s*```$/i, ""));
}

export default async (request) => {
  const today = new Date().toISOString().slice(0, 10);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log("Rasi refresh skipped: OPENAI_API_KEY is not configured.");
    return;
  }

  const prompt = `Create the Siddha Astro daily Vedic astrology edition for ${today}. Return ONLY valid JSON: {"generatedFor":"${today}","rashis":[{"id":"mesha","summaryTe":"","summaryEn":"","focusTe":"","focusEn":"","spiritualTe":"","spiritualEn":""}]}. Include exactly these ids: ${IDS.join(", ")}. Write concise, respectful, non-deterministic guidance. Never make guaranteed predictions and never provide medical, legal or financial instructions. This is spiritual/astrological reflection content.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: process.env.RASI_AI_MODEL || "gpt-5-mini",
      temperature: 0.7,
      messages: [
        { role: "system", content: "You are the Siddha Astro daily Vedic astrology editorial engine." },
        { role: "user", content: prompt }
      ]
    })
  });

  if (!response.ok) throw new Error(`AI provider returned ${response.status}`);
  const payload = await response.json();
  const text = payload?.choices?.[0]?.message?.content;
  if (!text) throw new Error("AI provider returned no content");

  const generated = cleanJson(text);
  if (generated.generatedFor !== today || !Array.isArray(generated.rashis) || generated.rashis.length !== 12) {
    throw new Error("Generated Rasi payload failed validation");
  }
  if (!IDS.every(id => generated.rashis.some(r => r.id === id))) {
    throw new Error("Generated Rasi payload is missing one or more rashis");
  }

  generated.status = "ai";
  generated.model = process.env.RASI_AI_MODEL || "gpt-5-mini";
  generated.generatedAt = new Date().toISOString();

  const store = getStore("siddha-astro-content");
  await store.setJSON("rasi/latest", generated, { metadata: { generatedFor: today, type: "daily-rasi" } });
  await store.setJSON(`rasi/${today}`, generated, { metadata: { generatedFor: today, type: "daily-rasi" } });
  console.log(`Siddha Astro Rasi edition stored for ${today}`);
};

export const config = { schedule: "@daily" };
