const FALLBACK = {
  generatedFor: new Date().toISOString().slice(0, 10),
  status: "fallback",
  message: "AI generation is not configured yet. The app is using the editorial seed content.",
};

export default async (request) => {
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "content-type": "application/json" },
    });
  }

  const today = new Date().toISOString().slice(0, 10);
  const apiKey = process.env.OPENAI_API_KEY;

  // The first production version deliberately fails safely until the site owner
  // adds an AI provider key in Netlify. Never expose the key to the browser.
  if (!apiKey) {
    return Response.json(FALLBACK);
  }

  try {
    const prompt = `Create a concise daily Vedic astrology editorial for all 12 rashis for ${today}. Return ONLY valid JSON with this shape: {"generatedFor":"${today}","rashis":[{"id":"mesha","summaryTe":"","summaryEn":"","focusTe":"","focusEn":"","spiritualTe":"","spiritualEn":""}]} . Use respectful, non-deterministic language. Do not make medical, financial, legal, or guaranteed claims. This is spiritual/astrological guidance for reflection.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.RASI_AI_MODEL || "gpt-5-mini",
        temperature: 0.7,
        messages: [
          { role: "system", content: "You write safe, culturally respectful Vedic astrology content." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI provider error", response.status);
      return Response.json({ ...FALLBACK, status: "provider_error" }, { status: 200 });
    }

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
