import { useState } from "react";
import { askVoiceDoctor } from "@/lib/assistants";

export default function VoiceDoctorChat() {
  const [input, setInput] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!input.trim()) return;
    const q = input.trim();
    setInput("");
    setLog((l) => [...l, `You: ${q}`]);
    setBusy(true);
    try {
      const a = await askVoiceDoctor(q);
      setLog((l) => [...l, `Clario Voice Doctor: ${a}`]);
    } catch (e: any) {
      setLog((l) => [...l, `Error: ${e?.message || "failed"}`]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-white/70">
      <h3 className="text-lg font-semibold">Voice Doctor (safe coach)</h3>

      <div className="h-56 overflow-auto whitespace-pre-wrap bg-white border rounded p-3 text-sm">
        {log.length ? (
          log.map((l, i) => <div key={i}>{l}</div>)
        ) : (
          <div className="text-muted-foreground">
            Ask about warmups, cooldowns, breathwork, posture, hydration, and practice plans. No medical advice.
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Ask a coaching question…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          disabled={busy}
        />
        <button className="border rounded px-4 py-2" onClick={send} disabled={busy}>
          {busy ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}
