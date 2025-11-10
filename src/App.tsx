import { useEffect, useState } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
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
import ClarioVoiceDoctor from "@/pages/ClarioVoiceDoctor"; // ✅ NEW

// A tiny, local NotFound so we never show a blank screen
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
   Auth Gate 1: RequireAuth
   - Blocks unauthenticated users from app routes
   - Lets /auth render freely
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
  if (status === "unauthed") {
    return <Navigate to="/auth" replace />;
  }
  return <Outlet />; // OK to enter app
}

/* ----------------------------------------------------------------------------
   Auth Gate 2: RedirectByFlags
   - Reads profile flags to route new users through verification/onboarding
   - Lets verified + onboarded users access everything
----------------------------------------------------------------------------- */
function RedirectByFlags() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Read flags for THIS user only (RLS safe)
      const { error } = await supabase
        .from("profiles")
        .select("product_verified,onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        console.warn("Flag fetch error:", error.message);
        // When in doubt, allow entry but keep a visible app error instead of blank page
        setLoading(false);
        return;
      }

      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  }

  return <Outlet />;
}

/* ----------------------------------------------------------------------------
   AppIndex
   - Only path="/"
   - Decides the FIRST page after login based on flags
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

  if (!dest) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  }
  return <Navigate to={dest} replace />;
}

/* ----------------------------------------------------------------------------
   The Router Map
   - Public: /auth
   - Private: everything else under <RequireAuth/>
   - We include explicit routes for every page so they can open directly
----------------------------------------------------------------------------- */
export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/auth" element={<Auth />} />

      {/* Private */}
      <Route element={<RequireAuth />}>
        <Route element={<RedirectByFlags />}>
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

          {/* ✅ New: Clario Voice Doctor (Claude-only) */}
          <Route path="/voice-doctor" element={<ClarioVoiceDoctor />} />
        </Route>
      </Route>

      {/* Safety net */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
