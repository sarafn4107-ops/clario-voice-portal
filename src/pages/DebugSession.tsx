import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function DebugSession() {
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log("hasSession:", !!session);
      console.log("userId:", session?.user?.id);
      console.log("access_token:", session?.access_token?.slice(0, 20) + "...");
    })();
  }, []);

  return (
    <div style={{ padding: "2rem", color: "white" }}>
      <h2>Check browser console ↩️</h2>
      <p>Open DevTools → Console to see if a session exists.</p>
    </div>
  );
}
