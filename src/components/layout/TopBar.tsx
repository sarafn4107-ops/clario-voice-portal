import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mic } from "lucide-react";

export function TopBar() {
  const [signingOut, setSigningOut] = useState(false);
  const navigate = useNavigate();

  const signOut = async () => {
    try {
      setSigningOut(true);
      await supabase.auth.signOut();
      navigate("/auth", { replace: true });
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <header className="h-14 border-b bg-card/70 backdrop-blur-sm flex items-center justify-between px-4">
      <div className="md:hidden flex items-center gap-2">
        <Mic className="text-primary" size={18} />
        <span className="font-semibold text-sm">Clario</span>
      </div>
      <div className="hidden md:block" />
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-gradient-primary text-primary-foreground">C</AvatarFallback>
        </Avatar>
        <Button variant="outline" size="sm" onClick={signOut} disabled={signingOut}>
          {signingOut ? "Signing out..." : "Sign out"}
        </Button>
      </div>
    </header>
  );
}
