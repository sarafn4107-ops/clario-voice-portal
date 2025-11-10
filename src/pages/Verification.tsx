import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function Verification() {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(true);     // page-level loading while we fetch user/profile
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  // 1) Ensure session exists, then ensure a profiles row exists
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!mounted) return;

        if (!user) {
          // No session → go to /auth
          navigate("/auth", { replace: true });
          return;
        }

        setUserId(user.id);

        // Try to read profile; create if missing so RLS doesn't block the page
        const { data: profile, error: selErr } = await supabase
          .from("profiles")
          .select("product_verified, onboarding_completed")
          .eq("id", user.id)
          .maybeSingle();

        if (selErr) {
          // RLS or table error — show a helpful message instead of blank page
          console.error("profiles SELECT error:", selErr);
          toast({
            title: "Can’t load your profile",
            description: selErr.message,
            variant: "destructive",
          });
          // You can choose to navigate("/auth") here, but keeping the page visible helps debugging.
          setBusy(false);
          return;
        }

        // If the profile row is missing, create a minimal one for this user id
        if (!profile) {
          const { error: insErr } = await supabase.from("profiles").insert({
            id: user.id,
            email: user.email,               // requires column "email"; remove if not present
            product_verified: false,
            onboarding_completed: false,
            credit_score: 0,
            streak: 0,
            league: "bronze",
          });
          if (insErr) {
            console.error("profiles INSERT error:", insErr);
            toast({
              title: "Can’t prepare your account",
              description: insErr.message,
              variant: "destructive",
            });
            setBusy(false);
            return;
          }
          setOnboardingCompleted(false);
          setBusy(false);
          return;
        }

        setOnboardingCompleted(!!profile.onboarding_completed);

        // If already verified, route them onward
        if (profile.product_verified) {
          if (profile.onboarding_completed) {
            navigate("/profile", { replace: true });
          } else {
            navigate("/profile-setup", { replace: true });
          }
          return;
        }

        // Not verified → stay on this page
        setBusy(false);
      } catch (err: any) {
        console.error(err);
        toast({
          title: "Unexpected error",
          description: err?.message ?? String(err),
          variant: "destructive",
        });
        setBusy(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [navigate, toast]);

  // 2) Handle submit: redeem code via RPC; then route by onboarding flag
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      if (!userId) {
        toast({
          title: "Not signed in",
          description: "Please sign in again.",
          variant: "destructive",
        });
        setSubmitting(false);
        navigate("/auth", { replace: true });
        return;
      }

      const normalized = code.trim().toLowerCase();
      const re = /^clario-\d{3}$/;
      if (!re.test(normalized)) {
        toast({ title: "Invalid code", description: "Please check your code.", variant: "destructive" });
        setSubmitting(false);
        return;
      }

      // Call your secure RPC. Two common variants:
      //  A) rpc('redeem_code', { p_code: normalized })   // uses auth.uid() inside the function
      //  B) rpc('redeem_code', { p_code: normalized, p_user_id: userId }) // if your SQL expects explicit user id
      const { data, error } = await supabase.rpc("redeem_code", { p_code: normalized });

      if (error || !data?.success) {
        toast({
          title: "Verification failed",
          description: data?.reason ?? error?.message ?? "The code is invalid or already used.",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      toast({ title: "Success", description: "Product verified successfully!" });

      // Where to go next:
      if (onboardingCompleted) {
        navigate("/profile", { replace: true });
      } else {
        navigate("/profile-setup", { replace: true });
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Unexpected error",
        description: err?.message ?? String(err),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // 3) Render (never blank)
  if (busy) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Preparing verification…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">Product Verification</CardTitle>
          <CardDescription>Enter your verification code</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                pattern="^clario-\d{3}$"
                autoComplete="one-time-code"
                inputMode="text"
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Verify Product
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
