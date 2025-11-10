import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Flags = { product_verified: boolean; onboarding_completed: boolean };

export default function AppGate() {
  const navigate = useNavigate();
  const [status, setStatus] =
    useState<"checking" | "to-auth" | "to-verification" | "to-setup" | "to-profile">("checking");

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setStatus("to-auth"); return; }

        const { data: p } = await supabase
          .from("profiles")
          .select("product_verified,onboarding_completed")
          .eq("id", user.id)
          .single<Flags>();

        if (!p) { setStatus("to-verification"); return; }
        if (!p.product_verified) { setStatus("to-verification"); return; }
        if (!p.onboarding_completed) { setStatus("to-setup"); return; }
        setStatus("to-profile");
      } catch {
        setStatus("to-auth");
      }
    })();
  }, []);

  useEffect(() => {
    if (status === "checking") return;
    const dest =
      status === "to-auth" ? "/auth" :
      status === "to-verification" ? "/verification" :
      status === "to-setup" ? "/profile-setup" :
      "/profile";
    navigate(dest, { replace: true });
  }, [status, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-muted-foreground">Loading…</div>
    </div>
  );
}
