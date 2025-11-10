// src/components/ClaudeBox.tsx
import { useState } from "react";
import { askClaude } from "@/lib/claude";

export default function ClaudeBox() {
  const [input, setInput] = useState("");
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    if (!input.trim()) return;
    setBusy(true);
    setError(null);
    setReply("Thinking…");
    try {
      const out = await askClaude(input.trim());
      setReply(out);
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
      setReply("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3 border rounded-lg p-4">
      <h3 className="text-lg font-semibold">Assistant</h3>

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Ask something…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          disabled={busy}
        />
        <button
          className="border rounded px-4 py-2"
          onClick={send}
          disabled={busy}
        >
          {busy ? "Sending…" : "Send"}
        </button>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}
      {reply && (
        <div className="bg-muted/50 border rounded p-3 whitespace-pre-wrap">
          {reply}
        </div>
      )}
    </div>
  );
}
