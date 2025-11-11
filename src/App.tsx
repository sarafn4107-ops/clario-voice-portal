import { useEffect, useState } from "react";
import { Routes, Route, Navigate, Outlet, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// PAGES
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import History from "@/pages/History";
import Goals from "@/pages/Goals";
import About from "@/pages/About";
import Profile from "@/pages/Profile";
import ProfileSetup from "@/pages/ProfileSetup";
import Verification from "@/pages/Verification";
import ClarioVoiceDoctor from "@/pages/ClarioVoiceDoctor";

// A simple NotFound fallback
function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold">404</h1>
        <p className="text-muted-foreground">Page not found</p>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
   RequireAuth: blocks unauthenticated users
----------------------------------------------------------------------------- */
function RequireAuth() {
  const [status, setStatus] = useState<"loading" | "authed" | "unauthed">("loading");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      setStatus(session ? "authed" : "unauthed");
    })();
    return () => { mounted = false; };
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground">
        Checking session…
      </div>
    );
  }
  if (status === "unauthed") return <Navigate to="/auth" replace />;
  return <Outlet />;
}

/* ----------------------------------------------------------------------------
   RedirectByFlags: routes verified/onboarded users
----------------------------------------------------------------------------- */
function RedirectByFlags() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { error } = await supabase
        .from("profiles")
        .select("product_verified,onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();
      if (!mounted) return;
      if (error) console.warn("Flag fetch error:", error.message);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);
  if (loading) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  return <Outlet />;
}

/* ----------------------------------------------------------------------------
   AppIndex: decides first page after login
----------------------------------------------------------------------------- */
function AppIndex() {
  const [dest, setDest] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setDest("/auth"); return; }
      const { data } = await supabase
        .from("profiles")
        .select("product_verified,onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();
      if (!mounted) return;
      const verified = !!data?.product_verified;
      const onboarded = !!data?.onboarding_completed;
      if (!verified) { setDest("/verification"); return; }
      if (!onboarded) { setDest("/profile-setup"); return; }
      setDest("/dashboard");
    })();
    return () => { mounted = false; };
  }, []);
  if (!dest) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  return <Navigate to={dest} replace />;
}

/* ----------------------------------------------------------------------------
   App Layout wrapper adds the Voice Coach button on all private pages
----------------------------------------------------------------------------- */
function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-3 border-b border-border flex justify-between items-center bg-background/50 backdrop-blur">
        <h1 className="text-lg font-semibold">Clario Voice Portal</h1>
        {/* 🎤 Voice Coach Button */}
        <a
          href="/coach.html"
          target="_blank"
          rel="noopener"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition"
        >
          🎤 Voice Coach
        </a>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

/* ----------------------------------------------------------------------------
   Router Map
----------------------------------------------------------------------------- */
export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/auth" element={<Auth />} />
      {/* Public shortcut for static page */}
      <Route path="/coach" element={<Navigate to="/coach.html" replace />} />

      {/* Private routes */}
      <Route element={<RequireAuth />}>
        <Route element={<RedirectByFlags />}>
          {/* Layout wrapper so button appears on every page */}
          <Route element={<AppLayout />}>
            {/* Landing */}
            <Route path="/" element={<AppIndex />} />

            {/* Flow pages */}
            <Route path="/verification" element={<Verification />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />

            {/* Main app pages */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/about" element={<About />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/voice-doctor" element={<ClarioVoiceDoctor />} />
          </Route>
        </Route>
      </Route>

      {/* Safety net */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
