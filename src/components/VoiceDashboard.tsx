import { useEffect, useState } from "react";
import { fetchHistory } from "@/lib/voiceData";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from "recharts";

export default function VoiceDashboard() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => { fetchHistory(30).then(setRows); }, []);

  const latest = rows[0];

  const metricCards = [
    ["clarity", "Clarity"],
    ["pronunciation", "Pronunciation"],
    ["articulation", "Articulation"],
    ["consistency", "Consistency"],
    ["pitch_control", "Pitch Control"],
    ["breath", "Breath"],
    ["wpm", "Words / Min"],
  ] as const;

  const trendData = rows.map(r => ({
    date: new Date(r.created_at).toLocaleDateString(),
    clarity: r.clarity,
    pronunciation: r.pronunciation,
    articulation: r.articulation,
    consistency: r.consistency,
    pitch_control: r.pitch_control,
    breath: r.breath,
    wpm: r.wpm,
  })).reverse();

  return (
    <div className="space-y-6">
      {/* Score cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricCards.map(([key, label]) => (
          <div key={key} className="border rounded-lg p-4 bg-white/70">
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="text-2xl font-bold">
              {latest ? latest[key] : "—"}
            </div>
          </div>
        ))}
        <div className="border rounded-lg p-4 bg-white/70">
          <div className="text-sm text-muted-foreground">Streak</div>
          <div className="text-2xl font-bold">{latest?.day_streak_after ?? "—"}</div>
        </div>
        <div className="border rounded-lg p-4 bg-white/70">
          <div className="text-sm text-muted-foreground">Credits</div>
          <div className="text-2xl font-bold">{latest?.credit_points_after ?? "—"}</div>
        </div>
      </div>

      {/* Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {["clarity","pronunciation","articulation","consistency","pitch_control","breath","wpm"].map((k) => (
          <div key={k} className="border rounded-lg p-4 bg-white/70">
            <div className="mb-2 font-medium capitalize">{k.replace("_"," ")}</div>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" hide />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey={k} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* History list */}
      <div className="border rounded-lg p-4 bg-white/70">
        <div className="font-semibold mb-3">Recent Sessions</div>
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.id} className="flex justify-between text-sm">
              <div>
                {new Date(r.created_at).toLocaleString()}
                {r.duration_sec ? ` • ${r.duration_sec}s` : ""}
              </div>
              <div>
                C{r.clarity}/P{r.pronunciation}/A{r.articulation}/Cons{r.consistency}/
                PC{r.pitch_control}/B{r.breath}/WPM{r.wpm}
              </div>
            </div>
          ))}
          {!rows.length && <div className="text-muted-foreground">No sessions yet.</div>}
        </div>
      </div>
    </div>
  );
}
