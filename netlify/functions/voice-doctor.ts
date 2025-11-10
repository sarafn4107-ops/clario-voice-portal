import Anthropic from "anthropic";

export const handler = async (event: any) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { userMessage, latestReport, history, model = "claude-3-5-sonnet-20241022" } = body;

    if (!userMessage) {
      return { statusCode: 400, body: "Missing userMessage" };
    }

    // Guardrail: refuse medical advice
    const system = `
You are "Clario Voice Doctor" acting strictly as a non-medical voice coach.
- Provide only safe, general guidance: warmups, cooldowns, breathwork, posture, hydration, practice plans.
- Do NOT give medical advice, diagnoses, or treatment. If asked, politely refuse and suggest consulting a medical professional.
- Use the user's latest report and history to personalize coaching, celebrate progress, and suggest next steps.
- Keep tone encouraging, specific, and actionable.
    `.trim();

    const context = `
LATEST REPORT (0–100 unless noted):
${JSON.stringify(latestReport ?? {}, null, 2)}

HISTORY (most recent first, truncated):
${JSON.stringify((history ?? []).slice(0, 8), null, 2)}
    `.trim();

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

    const resp = await anthropic.messages.create({
      model,
      max_tokens: 800,
      system,
      messages: [
        { role: "user", content: `Context:\n${context}\n\nUser says: ${userMessage}` }
      ],
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resp),
    };
  } catch (e: any) {
    console.error(e);
    return { statusCode: 500, body: e?.message || "Server error" };
  }
};
