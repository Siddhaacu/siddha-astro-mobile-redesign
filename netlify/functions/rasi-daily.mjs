import { getStore } from "@netlify/blobs";

const FALLBACK = {
  generatedFor: new Date().toISOString().slice(0, 10),
  status: "fallback",
  message: "AI generation is not configured yet. The app is using the editorial seed content."
};

export default async (request) => {
  if (request.method !== "GET") return Response.json({ error: "Method not allowed" }, { status: 405 });

  const today = new Date().toISOString().slice(0, 10);
  try {
    const stored = await getStore("siddha-astro-content").get("rasi/latest", { type: "json" });
    if (stored?.generatedFor === today && Array.isArray(stored.rashis)) {
      return Response.json(stored, { headers: { "cache-control": "public, max-age=300" } });
    }
  } catch (error) {
    console.warn("Stored Rasi content unavailable", error);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return Response.json(FALLBACK);

  try {
    const prompt = `Create a concise daily Vedic astrology editorial for all 12 rashis for ${today}. Return ONLY valid JSON with this shape: {"generatedFor":"${today}","rashis":[{"id":"mesha","summaryTe":"","summaryEn":"","focusTe":"","focusEn":"","spiritualTe":"","spiritualEn":""}]}. Use respectful, non-deterministic language. Do not make medical, financial, legal, or guaranteed claims. This is spiritual/astrological guidance for reflection.`;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.RASI_AI_MODEL || "gpt-5-mini",
        temperature: 0.7,
        messages: [
          { role: "system", content: "You write safe, culturally respectful Vedic astrology content." },
          { role: "user", content: prompt }
        ]
      })
    });
    if (!response.ok) return Response.json({ ...FALLBACK, status: "provider_error" });
    const payload = await response.json();
    const text = payload?.choices?.[0]?.message?.content?.trim();
    if (!text) return Response.json({ ...FALLBACK, status: "empty_provider_response" });
    const generated = JSON.parse(text.replace(/^```json\s*/i, "").replace(/\s*```$/i, ""));
    return Response.json({ ...generated, status: "ai", model: process.env.RASI_AI_MODEL || "gpt-5-mini" });
  } catch (error) {
    console.error("Rasi generation failed", error);
    return Response.json({ ...FALLBACK, status: "generation_error" });
  }
};
