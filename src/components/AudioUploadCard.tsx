import { useState } from "react";
import { uploadAudioAndCreateSession } from "@/lib/voiceData";

export default function AudioUploadCard() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const onSubmit = async () => {
    if (!file) return;
    setBusy(true);
    setMsg("Uploading & analyzing…");
    try {
      const row = await uploadAudioAndCreateSession(file);
      setMsg(`Saved! New credits: ${row.credit_points_after}, streak: ${row.day_streak_after}`);
    } catch (e: any) {
      setMsg("Error: " + e?.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-white/70">
      <h3 className="text-lg font-semibold">Upload Session Audio</h3>
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button className="border rounded px-4 py-2" disabled={!file || busy} onClick={onSubmit}>
        {busy ? "Processing…" : "Process → Report"}
      </button>
      {msg && <div className="text-sm text-muted-foreground">{msg}</div>}
    </div>
  );
}
