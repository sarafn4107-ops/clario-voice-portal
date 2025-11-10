export async function askClaude(userText) {
  const res = await fetch("/.netlify/functions/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userText }),
  });

  if (!res.ok) throw new Error("Claude API error");
  const data = await res.json();

  // Extract the reply text from Claude’s response
  const reply = data.content?.map(c => c.text || "").join("") || "";
  return reply;
}
