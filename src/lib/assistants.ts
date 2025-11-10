import { fetchLatestReport, fetchHistory } from "@/lib/voiceData";

export async function askVoiceDoctor(userMessage: string) {
  const [latestReport, history] = await Promise.all([
    fetchLatestReport(),
    fetchHistory(20),
  ]);

  const res = await fetch("/.netlify/functions/voice-doctor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userMessage, latestReport, history }),
  });

  if (!res.ok) throw new Error(await res.text());

  const data = await res.json();
  const text = (data?.content || [])
    .map((b: any) => (b?.type === "text" ? b.text : ""))
    .join("")
    .trim();

  return text || "No reply.";
}
