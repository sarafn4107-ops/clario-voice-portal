import { useState } from "react";
import { askClaude } from "@/lib/claude";

export default function ClaudeDock() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!input.trim()) return;
    const q = input.trim();
    setInput("");
    setBusy(true);
    setLog((l) => [...l, `You: ${q}`]);
    try {
      const a = await askClaude(q);
      setLog((l) => [...l, `Claude: ${a}`]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* FAB button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 rounded-full shadow-lg px-4 py-3 bg-black text-white"
        aria-label="Open assistant"
      >
        {open ? "Close" : "Ask Claude"}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-20 right-5 z-50 w-96 max-w-[95vw] rounded-xl border bg-white shadow-xl">
          <div className="p-3 border-b font-semibold">Assistant</div>
          <div className="p-3 h-64 overflow-auto whitespace-pre-wrap text-sm space-y-1">
            {log.length === 0 ? (
              <div className="text-gray-500">Ask me anything…</div>
            ) : (
              log.map((line, i) => <div key={i}>{line}</div>)
            )}
          </div>
          <div className="p-3 flex gap-2 border-t">
            <input
              className="flex-1 border rounded px-3 py-2"
              placeholder="Type your question…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              disabled={busy}
            />
            <button
              onClick={send}
              className="border rounded px-4 py-2"
              disabled={busy}
            >
              {busy ? "…" : "Send"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
