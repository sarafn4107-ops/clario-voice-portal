// src/lib/claude.ts
export async function askClaude(userText: string): Promise<string> {
  const res = await fetch("/.netlify/functions/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userText }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Claude error (${res.status}): ${txt || "Request failed"}`);
  }

  const data = await res.json();

  // Anthropic Messages API returns blocks. We extract text blocks safely.
  const blocks: Array<any> = data?.content ?? [];
  const reply =
    blocks
      .map((b) => (b?.type === "text" ? b.text : ""))
      .join("")
      .trim() || "";

  return reply || "No reply.";
}
