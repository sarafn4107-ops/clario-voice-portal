// src/pages/Profile.tsx
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Award, TrendingUp, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useMemo, useState } from "react";

// Preloaded avatar options (put these images in /public/avatars/*.png)
// You can replace or add more paths to match your assets
const AVATAR_OPTIONS = [
  "/avatars/robot-1.png",
  "/avatars/robot-2.png",
  "/avatars/robot-3.png",
  "/avatars/wave-1.png",
  "/avatars/wave-2.png",
  "/avatars/wave-3.png",
];

const leagueInfo = {
  bronze: { name: "Bronze", color: "hsl(30 80% 60%)", next: "Silver", pointsToNext: 500 },
  silver: { name: "Silver", color: "hsl(0 0% 75%)", next: "Gold", pointsToNext: 1000 },
  gold: { name: "Gold", color: "hsl(45 100% 60%)", next: "Platinum", pointsToNext: 2000 },
  platinum: { name: "Platinum", color: "hsl(200 80% 70%)", next: "Diamond", pointsToNext: 5000 },
  diamond: { name: "Diamond", color: "hsl(188 100% 50%)", next: "Legend", pointsToNext: null as number | null },
};

export default function Profile() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Local source of truth for what we SHOW (fixes: "username not changing")
  const [username, setUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  const { data: authUser } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      return user;
    },
  });

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data as any;
    },
  });

  // Initialize local UI state from profile once loaded
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setSelectedAvatar(profile.avatar_url || null);
    }
  }, [profile]);

  const loginEmail = authUser?.email ?? profile?.email ?? "";
  const league = useMemo(
    () => (profile ? (leagueInfo[profile.league as keyof typeof leagueInfo] || leagueInfo.bronze) : leagueInfo.bronze),
    [profile]
  );

  // Fixed UI display
  const displayPoints = 360;
  const displayStreakText = "7 day streak";
  const displayCredit = 360;
  const progressToNext = 50; // always half as requested

  const startEditing = () => setIsEditing(true);
  const cancelEditing = () => {
    // Reset edits to current profile values
    setUsername(profile?.username || "");
    setSelectedAvatar(profile?.avatar_url || null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!authUser || !profile) return;
    setSaving(true);
    try {
      const updates: Record<string, any> = {
        username: username || profile.username,
        avatar_url: selectedAvatar, // chosen from predefined list
      };

      const { error: upErr } = await supabase.from("profiles").update(updates).eq("id", authUser.id);
      if (upErr) throw upErr;

      // Optimistic UI already reflects edits; still refresh cache
      await qc.invalidateQueries({ queryKey: ["profile"] });
      toast({ title: "Profile updated", description: "Your changes have been saved." });
      setIsEditing(false);
    } catch (e: any) {
      toast({
        title: "Update failed",
        description: e?.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !profile) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-red-500">Failed to load profile</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Profile</h1>
            <p className="text-muted-foreground">Manage your account and stats</p>
          </div>
          {/* Sign Out button removed as requested */}
        </div>

        {/* Profile Header with avatar picker and username edit */}
        <Card className="card-glow">
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <div className="shrink-0">
                <Avatar className="h-24 w-24">
                  {selectedAvatar ? (
                    <AvatarImage src={selectedAvatar} alt={username || "avatar"} />
                  ) : profile.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} alt={username || "avatar"} />
                  ) : (
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground text-3xl">
                      {profile.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  )}
                </Avatar>

                {isEditing && (
                  <div className="mt-3 grid grid-cols-6 gap-2 max-w-[320px]">
                    {AVATAR_OPTIONS.map((src) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => setSelectedAvatar(src)}
                        className={`border rounded-md p-1 transition ${
                          selectedAvatar === src ? "ring-2 ring-primary" : "hover:border-primary/60"
                        }`}
                        title="Choose avatar"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="avatar option" className="h-10 w-10 object-contain" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-bold">{profile.name || "Your Name"}</h2>

                  {!isEditing ? (
                    <p className="text-muted-foreground">@{username || "user"}</p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="max-w-xs"
                      />
                      <Button size="sm" onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "Save"}
                      </Button>
                      <Button size="sm" variant="secondary" onClick={cancelEditing} disabled={saving}>
                        Cancel
                      </Button>
                    </div>
                  )}

                  {!isEditing && (
                    <Button size="sm" variant="outline" onClick={startEditing}>
                      Edit Profile
                    </Button>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-primary" />
                    <span className="text-sm">{displayPoints} points</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target size={16} className="text-accent" />
                    <span className="text-sm">{displayStreakText}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* League & Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="text-secondary" />
                League & Progress
              </CardTitle>
              <CardDescription>
                Current credit score: <span className="font-semibold">{displayCredit}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Badge className="text-sm px-3 py-1" style={{ backgroundColor: league.color }}>
                    {league.name} League
                  </Badge>
                  {league.next && <span className="text-sm text-muted-foreground">Next: {league.next}</span>}
                </div>

                <Progress value={progressToNext} className="h-2" />
                {league.pointsToNext && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {Math.max(0, league.pointsToNext - (profile.credit_score ?? 0))} points to {league.next}
                  </p>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-2">Achievements</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">🔥 7 Day Streak</Badge>
                  <Badge variant="outline">🎯 First Goal</Badge>
                  <Badge variant="outline">⭐ 100 Sessions</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Labelish label="Email" value={loginEmail} />
              <Labelish label="Country" value={profile.country || "Not set"} />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

function Labelish({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-sm text-muted-foreground">{label}</div>
      <Input value={value} disabled />
    </div>
  );
}
