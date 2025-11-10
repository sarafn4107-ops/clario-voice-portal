import { supabase } from "@/integrations/supabase/client";

export type Metrics = {
  clarity: number;
  pronunciation: number;
  articulation: number;
  consistency: number;
  pitch_control: number;
  breath: number;
  wpm: number;
};

export type SessionRow = {
  id: string;
  created_at: string;
  audio_path: string | null;
  duration_sec: number | null;
  notes: string | null;
} & Metrics & {
  day_streak_after: number;
  credit_points_after: number;
};

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}

export async function uploadAudioAndCreateSession(file: File, notes = ""): Promise<SessionRow> {
  const user = await getUser();
  const ext = (file.name.split(".").pop() || "wav").toLowerCase();
  const path = `${user.id}/${Date.now()}.${ext}`;

  // Upload to storage
  const { error: upErr } = await supabase.storage.from("audio").upload(path, file, { upsert: false });
  if (upErr) throw upErr;

  // Fake-analyze (safe baseline). Replace with real DSP/ML later.
  const durationSec = await estimateDuration(file).catch(() => 60);
  const metrics = fakeAnalyze(durationSec);

  // Streak & credits (based on last session date)
  const { data: lastRows } = await supabase
    .from("voice_sessions").select("created_at, credit_points_after").eq("user_id", user.id)
    .order("created_at", { ascending: false }).limit(1);

  const last = lastRows?.[0];
  const streak = nextStreak(last?.created_at);
  const credits = (last?.credit_points_after || 0) + scoreToCredits(metrics);

  const insertPayload = {
    user_id: user.id,
    audio_path: path,
    duration_sec: durationSec,
    notes,
    ...metrics,
    day_streak_after: streak,
    credit_points_after: credits,
  };

  const { data, error } = await supabase.from("voice_sessions").insert(insertPayload).select().single();
  if (error) throw error;
  return data as SessionRow;
}

export async function fetchLatestReport(): Promise<SessionRow | null> {
  const user = await getUser();
  const { data } = await supabase
    .from("voice_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);
  return data?.[0] ?? null;
}

export async function fetchHistory(limit = 30): Promise<SessionRow[]> {
  const user = await getUser();
  const { data } = await supabase
    .from("voice_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data || []) as SessionRow[];
}

/* ---------- helpers ---------- */

// crude estimation using Blob duration via audio element
async function estimateDuration(file: File): Promise<number> {
  const url = URL.createObjectURL(file);
  const audio = new Audio(url);
  await new Promise<void>((res, rej) => {
    audio.onloadedmetadata = () => res();
    audio.onerror = () => rej(new Error("audio load error"));
  });
  const d = Math.max(1, Math.round(audio.duration));
  URL.revokeObjectURL(url);
  return d;
}

// safe placeholder analysis (0–100). Replace with your model later.
function fakeAnalyze(durationSec: number): Metrics {
  const base = Math.max(40, Math.min(85, 60 + (durationSec % 20) - 10));
  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
  return {
    clarity: clamp(base + 5),
    pronunciation: clamp(base + 3),
    articulation: clamp(base + 1),
    consistency: clamp(base),
    pitch_control: clamp(base - 2),
    breath: clamp(base - 1),
    wpm: Math.max(80, Math.min(180, 120 + (durationSec % 30) - 15)),
  };
}

function nextStreak(lastISO?: string): number {
  if (!lastISO) return 1;
  const last = new Date(lastISO);
  const now = new Date();
  const diffDays = Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) -
                               Date.UTC(last.getFullYear(), last.getMonth(), last.getDate())) / 86400000);
  if (diffDays === 0) return 1;       // same day: treat as continued but not +1
  if (diffDays === 1) return 2;       // simple baseline; improve by reading last row's streak if needed
  return 1;
}

function scoreToCredits(m: Metrics): number {
  const avg = (m.clarity + m.pronunciation + m.articulation + m.consistency + m.pitch_control + m.breath) / 6;
  return Math.round(avg / 5) + Math.round((m.wpm - 100) / 20);
}
